/**
 * Collecting the tracks the movement analysis reads, row by row in any
 * order of units (each unit's own rows in time order): a sample a unit at
 * most every `MIN_GAP` seconds - enough for a group's shape and a missile
 * defence turn, a fraction of the rows - and the events with their doer.
 */

import { AIR, CLASS_DOMAIN, GROUND, INF, type EvKind, type MatchTracks, type MEvent, type UnitTrack } from './types';

/** Seconds between two kept samples of a unit. */
export const MIN_GAP = 1;
/** Samples kept at most over everything (beyond it the gap doubles). */
const MAX_SAMPLES = 6_000_000;

class Grow {
  a: Float64Array;
  n = 0;
  constructor(n = 64) {
    this.a = new Float64Array(n);
  }
  push(v: number): void {
    if (this.n === this.a.length) {
      const b = new Float64Array(this.a.length * 2);
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = v;
  }
}

interface Acc {
  id: number;
  session: number;
  team: number;
  cls: number;
  /** Samples: t, x, y, z interleaved. */
  s: Grow;
  last: number;
}

export class ManeuverCollector {
  private acc = new Map<number, Acc>();
  private events = new Map<number, MEvent[]>();
  private t0 = new Map<number, number>();
  private samples = 0;
  private gap = MIN_GAP;

  /** Match starts given by the data (session -> data seconds), where known. */
  private given = new Map<number, number>();

  constructor(public upm: number) {}

  /** The data's own start of a match: times are reported from it. */
  setStart(session: number, t: number): void {
    if (t === t) this.given.set(session, t);
  }

  private key(id: number, session: number): number {
    return (session + 1) * 2 ** 26 + id;
  }

  private start(session: number, t: number): void {
    const s = this.t0.get(session);
    if (s === undefined || t < s) this.t0.set(session, t);
  }

  /** A movement sample of unit `id` (team slot, VEHICLE_CLASSES index or -1). */
  sample(id: number, session: number, team: number, cls: number, t: number, x: number, y: number, z: number): void {
    if (!(t === t && x === x && z === z)) return;
    this.start(session, t);
    const k = this.key(id, session);
    let a = this.acc.get(k);
    if (!a) this.acc.set(k, (a = { id, session, team, cls, s: new Grow(), last: -Infinity }));
    if (team >= 0) a.team = team;
    if (cls >= 0) a.cls = cls;
    if (t - a.last < this.gap) return;
    if (t < a.last) return;
    a.last = t;
    a.s.push(t);
    a.s.push(x);
    a.s.push(y === y ? y : 0);
    a.s.push(z);
    if (++this.samples > MAX_SAMPLES) this.thin();
  }

  /** An event: its doer (`unit`, -1 unknown) and team, the target's class (-1 unknown). */
  event(kind: EvKind, unit: number, session: number, team: number, t: number, x: number, y: number, z: number, tcls = -1): void {
    if (!(t === t)) return;
    this.start(session, t);
    let l = this.events.get(session);
    if (!l) this.events.set(session, (l = []));
    l.push({ t, kind, unit, team, x, y: y === y ? y : 0, z, tcls });
  }

  /** Too many samples: every second one of each unit goes, and the gap doubles from here on. */
  private thin(): void {
    this.gap *= 2;
    let n = 0;
    for (const a of this.acc.values()) {
      const s = a.s;
      let w = 0;
      for (let i = 0; i < s.n; i += 8) {
        for (let k = 0; k < 4; k++) s.a[w + k] = s.a[i + k];
        w += 4;
      }
      s.n = w;
      n += w / 4;
    }
    this.samples = n;
  }

  /** Every match's tracks and events. */
  finish(teams: number): MatchTracks[] {
    const by = new Map<number, UnitTrack[]>();
    for (const a of this.acc.values()) {
      const n = a.s.n / 4;
      if (n < 2) continue;
      const dom = a.cls >= 0 && a.cls < CLASS_DOMAIN.length ? CLASS_DOMAIN[a.cls] : domainBySpeed(a.s, n, this.upm);
      if (dom < 0) continue;
      const tr: UnitTrack = { id: a.id, team: a.team, dom, cls: a.cls, t: new Float64Array(n), x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n) };
      for (let i = 0; i < n; i++) {
        tr.t[i] = a.s.a[i * 4];
        tr.x[i] = a.s.a[i * 4 + 1];
        tr.y[i] = a.s.a[i * 4 + 2];
        tr.z[i] = a.s.a[i * 4 + 3];
      }
      let l = by.get(a.session);
      if (!l) by.set(a.session, (l = []));
      l.push(tr);
    }
    const out: MatchTracks[] = [];
    for (const [session, units] of by) {
      const events = (this.events.get(session) ?? []).sort((a, b) => a.t - b.t);
      out.push({ session, t0: this.given.get(session) ?? this.t0.get(session) ?? 0, upm: this.upm, teams, units: units.sort((a, b) => a.id - b.id), events });
    }
    return out.sort((a, b) => a.session - b.session);
  }
}

/**
 * A unit of no known class, by how fast it moves: on foot (95th percentile of
 * its speed 9 m/s or less), flying (60 m/s or more), else a vehicle.
 */
export function domainBySpeed(s: { a: Float64Array }, n: number, upm: number): number {
  const v: number[] = [];
  for (let i = 1; i < n; i++) {
    const dt = s.a[i * 4] - s.a[(i - 1) * 4];
    if (!(dt > 0) || dt > 10) continue;
    v.push(Math.hypot(s.a[i * 4 + 1] - s.a[(i - 1) * 4 + 1], s.a[i * 4 + 3] - s.a[(i - 1) * 4 + 3]) / dt / (upm || 1));
  }
  if (v.length < 3) return GROUND;
  v.sort((a, b) => a - b);
  const p95 = v[Math.floor(v.length * 0.95)];
  return p95 <= 9 ? INF : p95 >= 60 ? AIR : GROUND;
}
