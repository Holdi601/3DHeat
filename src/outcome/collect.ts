/**
 * The moves of one match (`MovesSection`), fed by the summary builder
 * (`mass/summarize.ts`) row by row: every unit's position sampled every
 * `BASE_STEP` seconds, the deaths, the objectives' captures, the named
 * places. `finish` settles on a step for the match (its rounds' median length
 * over `STEPS_PER_ROUND`, a nice number), thins the samples to it and writes
 * coordinates as small integers. Memory: a point every two seconds a unit.
 */

import {
  BASE_STEP, D_STRIDE, MAX_DEATHS, MAX_LIVES, MAX_MOVE_ROUNDS, MAX_POINTS, MOVES_VERSION, NICE_STEPS, O_STRIDE, Q_PER_CELL, STEPS_PER_ROUND,
  type MovesSection,
} from './types';

/** A sample bucket a unit-round keeps at most (two hours at the base step). */
const MAX_BUCKETS = 3600;

interface Track {
  round: number;
  slot: number;
  cls: number;
  player: string;
  /** Base buckets, their x, z and place (-1). */
  k: number[];
  x: number[];
  z: number[];
  pl: number[];
}

/** An objective's event as a converter's objectives table records it. */
export interface ObjectiveEvent {
  t: number;
  zone: string;
  /** The team that took it ('' neutralised), as the table's team column names teams. */
  owner: string;
  /** Its position in the table's own axes. */
  x: number;
  y: number;
  z: number;
}

export interface MovesFinish {
  /** The summary grid's fine cell, world units (0 without a grid). */
  cell: number;
  /** Each round index's number as the data says it. */
  roundNo: number[];
  /** A side's result in a round: 1 won, 0 lost, -1 unknown. */
  result: (round: number, slot: number) => number;
  /** A slot as the summary lists teams (the named teams, then none). */
  slotOut: (slot: number) => number;
  teams: number;
}

export class MovesCollector {
  private readonly tracks = new Map<number, Track>();
  private readonly t0 = new Map<number, number>();
  private readonly t1 = new Map<number, number>();
  private readonly deaths: number[] = [];
  private readonly obj: { round: number; t: number; zone: string; slot: number; x: number; z: number }[] = [];
  private readonly placeDict = new Map<string, number>();

  private span(ri: number, t: number): void {
    const a = this.t0.get(ri);
    if (a === undefined || t < a) this.t0.set(ri, t);
    const b = this.t1.get(ri);
    if (b === undefined || t > b) this.t1.set(ri, t);
  }

  /** A position row of unit `u` (its slot, class index or -1, player key or ''), in round `ri`. */
  pos(u: number, slot: number, cls: number, player: string, ri: number, t: number, x: number, z: number, place: string): void {
    if (ri >= MAX_MOVE_ROUNDS) return;
    this.span(ri, t);
    const key = u * MAX_MOVE_ROUNDS + ri;
    let tr = this.tracks.get(key);
    if (!tr) this.tracks.set(key, (tr = { round: ri, slot, cls, player, k: [], x: [], z: [], pl: [] }));
    const k = Math.floor(t / BASE_STEP);
    const n = tr.k.length;
    if (n && tr.k[n - 1] >= k) return;
    if (n >= MAX_BUCKETS) return;
    tr.k.push(k);
    tr.x.push(x);
    tr.z.push(z);
    tr.pl.push(place ? this.placeId(place) : -1);
    if (cls >= 0 && tr.cls < 0) tr.cls = cls;
    if (player && !tr.player) tr.player = player;
  }

  private placeId(p: string): number {
    let i = this.placeDict.get(p);
    if (i === undefined) this.placeDict.set(p, (i = this.placeDict.size));
    return i;
  }

  /** Any other row: the round's span. */
  tick(ri: number, t: number): void {
    if (ri < MAX_MOVE_ROUNDS) this.span(ri, t);
  }

  /** A unit of side `slot` lost (died, destroyed) at `x, z`. */
  death(ri: number, t: number, x: number, z: number, slot: number): void {
    if (ri >= MAX_MOVE_ROUNDS || this.deaths.length >= MAX_DEATHS * D_STRIDE) return;
    this.span(ri, t);
    this.deaths.push(ri, t, x, z, slot);
  }

  /** An objective taken (or neutralised: slot -1); round -1: the round whose span holds the time. */
  objective(ri: number, t: number, zone: string, slot: number, x: number, z: number): void {
    if (ri >= MAX_MOVE_ROUNDS) return;
    this.obj.push({ round: ri, t, zone, slot, x, z });
  }

  private roundAt(t: number): number {
    let best = -1;
    for (const [ri, a] of this.t0) if (t >= a - 1 && t <= (this.t1.get(ri) ?? a) + 1 && (best < 0 || a > this.t0.get(best)!)) best = ri;
    return best;
  }

  finish(f: MovesFinish): MovesSection | null {
    if (!this.tracks.size || !(f.cell > 0)) return null;
    const rounds = [...this.t0.keys()].sort((a, b) => a - b);
    const lens = rounds.map((r) => (this.t1.get(r)! - this.t0.get(r)!)).filter((v) => v > 0).sort((a, b) => a - b);
    const median = lens.length ? lens[lens.length >> 1] : 60;
    const want = median / STEPS_PER_ROUND;
    const dt = NICE_STEPS.find((s) => s >= want) ?? NICE_STEPS[NICE_STEPS.length - 1];
    // The coordinate step: from where the lives were (2nd to 98th percentile), not the grid's extent - aircraft
    // or a stray far away would make it coarse for the ground.
    const xs: number[] = [];
    const zs: number[] = [];
    for (const tr of this.tracks.values()) for (let i = 0; i < tr.x.length; i += 4) {
      xs.push(tr.x[i]);
      zs.push(tr.z[i]);
    }
    const range = (v: number[]) => {
      v.sort((p0, p1) => p0 - p1);
      return v.length ? v[Math.floor(v.length * 0.98)] - v[Math.floor(v.length * 0.02)] : 0;
    };
    const span = Math.max(range(xs), range(zs));
    const q = Math.min(f.cell / Q_PER_CELL, span > 0 ? 2 ** Math.ceil(Math.log2(span / 2048)) : f.cell / Q_PER_CELL);
    const qi = (v: number) => Math.round(v / q);
    const idx = new Map<number, number>();
    const r: number[] = [];
    for (const ri of rounds) {
      idx.set(ri, idx.size);
      const s0 = Math.floor(this.t0.get(ri)! / dt);
      let w = -1;
      for (let s = 0; s < f.teams; s++) if (f.result(ri, s) === 1) w = w === -1 ? s : -2;
      r.push(f.roundNo[ri] ?? ri + 1, s0, Math.max(1, Math.ceil(this.t1.get(ri)! / dt) - s0), w >= 0 ? f.slotOut(w) : -1);
    }
    const players: string[] = [];
    const playerOf = new Map<string, number>();
    // The lives with most samples first, then in their order.
    const tracks = [...this.tracks.values()].filter((tr) => tr.k.length >= 2 && tr.slot < f.teams);
    if (tracks.length > MAX_LIVES) {
      tracks.sort((a, b) => b.k.length - a.k.length);
      tracks.length = MAX_LIVES;
    }
    const step = Math.max(1, Math.round(dt / BASE_STEP));
    const cellCount = new Map<number, Map<number, number>>();
    const pc = f.cell * 8;
    const l: number[] = [];
    for (const tr of tracks) {
      const ri = idx.get(tr.round)!;
      const s0 = r[ri * 4 + 1];
      let p = -1;
      if (tr.player) {
        p = playerOf.get(tr.player) ?? -1;
        if (p < 0) {
          p = players.length;
          players.push(tr.player);
          playerOf.set(tr.player, p);
        }
      }
      const pts: number[] = [];
      let first = -1;
      let last = -Infinity;
      for (let i = 0; i < tr.k.length && pts.length < MAX_POINTS * 2; i++) {
        const s = Math.floor((tr.k[i] * BASE_STEP) / dt);
        if (s <= last) continue;
        if (first < 0) first = s;
        // A short gap (the unit not seen) is kept as the same point again: the path holds still rather than jumping
        // in time. A long one ends the path: what came after is another part of its match.
        if (last >= first && s > last + 4) break;
        while (last >= first && s > last + 1 && pts.length < MAX_POINTS * 2) {
          pts.push(pts[pts.length - 2], pts[pts.length - 1]);
          last++;
        }
        pts.push(qi(tr.x[i]), qi(tr.z[i]));
        last = s;
      }
      for (let i = 0; i < tr.k.length; i += step) {
        const pl = tr.pl[i];
        if (pl < 0) continue;
        const ck = (Math.floor(tr.x[i] / pc) + 2 ** 20) * 2 ** 21 + (Math.floor(tr.z[i] / pc) + 2 ** 20);
        let m = cellCount.get(ck);
        if (!m) cellCount.set(ck, (m = new Map()));
        m.set(pl, (m.get(pl) ?? 0) + 1);
      }
      if (pts.length < 4) continue;
      l.push(ri, tr.slot, tr.cls, p, first - s0, pts.length / 2, ...pts);
    }
    if (!l.length) return null;
    const d: number[] = [];
    for (let i = 0; i + 4 < this.deaths.length && d.length < MAX_DEATHS * D_STRIDE; i += 5) {
      const ri = idx.get(this.deaths[i]);
      const slot = this.deaths[i + 4];
      if (ri === undefined || slot < 0 || slot >= f.teams) continue;
      d.push(ri, Math.max(0, Math.round((this.deaths[i + 1] - this.t0.get(this.deaths[i])!) * 10)), qi(this.deaths[i + 2]), qi(this.deaths[i + 3]), f.slotOut(slot));
    }
    const out: MovesSection = { v: MOVES_VERSION, dt, q, r, l, players, d };
    if (this.obj.length) {
      const zones = new Map<string, number>();
      out.oz = [];
      out.o = [];
      for (const e of [...this.obj].sort((a, b) => a.t - b.t)) {
        const round = e.round >= 0 ? e.round : this.roundAt(e.t);
        const ri = idx.get(round);
        if (ri === undefined) continue;
        let z = zones.get(e.zone);
        if (z === undefined) {
          zones.set(e.zone, (z = out.oz.length));
          out.oz.push({ name: e.zone, x: Math.round(e.x * 10) / 10, z: Math.round(e.z * 10) / 10 });
        }
        out.o.push(ri, Math.max(0, Math.round((e.t - this.t0.get(round)!) * 10)), z, e.slot >= 0 && e.slot < f.teams ? f.slotOut(e.slot) : -1);
      }
      if (out.o.length < O_STRIDE) {
        delete out.oz;
        delete out.o;
      }
    }
    if (cellCount.size) {
      out.pc = pc;
      out.pn = [...this.placeDict.keys()];
      out.p = [];
      for (const [ck, m] of [...cellCount].sort((a, b) => a[0] - b[0])) {
        let best = -1, bn = 0;
        for (const [pl, n] of m) if (n > bn) [best, bn] = [pl, n];
        out.p.push(Math.floor(ck / 2 ** 21) - 2 ** 20, (ck % 2 ** 21) - 2 ** 20, best, bn);
      }
    }
    return out;
  }
}
