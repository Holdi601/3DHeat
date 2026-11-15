/**
 * The behaviour analysis' accumulator: fed positions and events of any
 * number of matches (by the insight worker, `feed.ts`, or by a match summary,
 * `summaryTap.ts`), it keeps each unit's track resampled to one point every
 * `BIN` seconds - the position at the end of the bin and the velocity over it
 * - and the events that matter to behaviour (kills, deaths, shots, damage
 * taken, spawns, the rounds' loadouts). `finish` turns them into per-match
 * tracks and runs the measures (`motion.ts`, `choice.ts`).
 *
 * Memory is bounded: past `maxSamples` resampled points no new match is
 * followed (the report says it was sampled).
 */

import { bhAdjust } from '../stats';
import { rng } from './bstats';
import { breaking, cohesion, crowding, herdingAndLanes, leaders, order } from './motion';
import { buys, livesOf, risk, streaks, suppression } from './choice';
import type { BehaviourMetrics, Test } from './types';

/** Seconds a resampled point spans. */
export const BIN = 2;
export const KILL = 0;
export const DEATH = 1;
export const FIRE = 2;
export const HURT = 3;
export const SPAWN = 4;

export class F32 {
  a: Float32Array;
  n = 0;
  constructor(cap = 1024) {
    this.a = new Float32Array(cap);
  }
  push(v: number) {
    if (this.n === this.a.length) {
      const b = new Float32Array(this.a.length * 2);
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = v;
  }
}

export class I32 {
  a: Int32Array;
  n = 0;
  constructor(cap = 1024) {
    this.a = new Int32Array(cap);
  }
  push(v: number) {
    if (this.n === this.a.length) {
      const b = new Int32Array(this.a.length * 2);
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = v;
  }
}

export class F64 {
  a: Float64Array;
  n = 0;
  constructor(cap = 1024) {
    this.a = new Float64Array(cap);
  }
  push(v: number) {
    if (this.n === this.a.length) {
      const b = new Float64Array(this.a.length * 2);
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = v;
  }
}

export interface BehaviourOptions {
  /** World units in a metre. */
  upm: number;
  maxSamples?: number;
  seed?: number;
}

/** One unit's track in one match, a point per bin from `b0` (NaN where it was not seen). */
export interface Track {
  k: number;
  m: number;
  team: number;
  b0: number;
  n: number;
  x: Float32Array;
  z: Float32Array;
  vx: Float32Array;
  vz: Float32Array;
  /** Distance to the nearest teammate in the same bin (NaN alone), neighbours within the crowd radius, teammates within it. */
  nn: Float32Array;
  dens: Uint8Array;
  mates: Uint8Array;
  /** Median moving speed, world units a second. */
  pace: number;
  /** Sorted event times of this track by kind. */
  kills: number[];
  deaths: number[];
  fires: number[];
  hurts: number[];
  spawns: number[];
}

export interface MatchW {
  m: number;
  tracks: number[];
  B0: number;
  B1: number;
  /** Members of bin `B0 + i`: track indices `mem[start[i] .. start[i+1])`. */
  start: Int32Array;
  mem: Int32Array;
  /** Kills by team `[team, t]`, deaths by team. */
  killT: { team: number; t: number }[];
  deathT: { team: number; t: number }[];
}

export interface RoundRec {
  ti: number;
  round: number;
  equip: number;
  live: boolean;
  /** First and last time the unit was seen in the round. */
  t0: number;
  t1: number;
}

export interface World {
  upm: number;
  tracks: Track[];
  matches: MatchW[];
  rounds: RoundRec[];
  /** Moving: faster than this, world units a second. */
  vmin: number;
  /** Typical nearest-teammate distance, world units (set by `cohesion`). */
  s0: number;
}

const NO = -1;

/** NaN and infinities as null, as JSON would have them: the report is plain JSON (a summary, a model's request). */
function jsonSafe<T>(v: T): T {
  if (typeof v === 'number') return (Number.isFinite(v) ? v : null) as T;
  if (Array.isArray(v)) return v.map(jsonSafe) as T;
  if (v && typeof v === 'object') {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) if (x !== undefined) o[k] = jsonSafe(x);
    return o as T;
  }
  return v;
}

export class BehaviourAcc {
  /** World units a metre; set before `finish` when only known at the end (a summary's). */
  upm: number;
  private readonly cap: number;
  private readonly seed: number;
  // Track state by slot.
  private tM = new I32();
  private tTeam = new I32();
  private cb = new I32();
  private pb = new I32();
  private lx = new F32();
  private lz = new F32();
  private px = new F32();
  private pz = new F32();
  // Death: when and where, until the unit lives again (a spawn, a new round, or moving off the spot).
  private dead = new F64();
  private dx = new F32();
  private dz = new F32();
  private round = new I32();
  // Resampled points.
  private eK = new I32(4096);
  private eB = new I32(4096);
  private eX = new F32(4096);
  private eZ = new F32(4096);
  private eVX = new F32(4096);
  private eVZ = new F32(4096);
  // Events.
  private vKind = new I32();
  private vK = new I32();
  private vT = new F64();
  // Rounds: first live loadout (else the largest) per unit and round.
  private rounds = new Map<number, RoundRec & { k: number }>();
  private admitted = new Set<number>();
  private sampled = false;

  constructor(opt: BehaviourOptions) {
    this.upm = opt.upm > 0 ? opt.upm : 1;
    this.cap = opt.maxSamples ?? 3_000_000;
    this.seed = opt.seed ?? 20261115;
  }

  /** A new unit track in match `m`; its index is what `pos` and `event` take. */
  track(m: number, team: number): number {
    const k = this.tM.n;
    this.tM.push(m);
    this.tTeam.push(team);
    this.cb.push(NO);
    this.pb.push(NO);
    this.lx.push(NaN);
    this.lz.push(NaN);
    this.px.push(NaN);
    this.pz.push(NaN);
    this.dead.push(NaN);
    this.dx.push(NaN);
    this.dz.push(NaN);
    this.round.push(-1);
    return k;
  }

  private open(k: number): boolean {
    const m = this.tM.a[k];
    if (this.admitted.has(m)) return this.eK.n < this.cap * 1.5;
    if (this.eK.n >= this.cap) {
      this.sampled = true;
      return false;
    }
    this.admitted.add(m);
    return true;
  }

  private emit(k: number) {
    const b = this.cb.a[k];
    const x = this.lx.a[k];
    const z = this.lz.a[k];
    const prev = this.pb.a[k] === b - 1;
    this.eK.push(k);
    this.eB.push(b);
    this.eX.push(x);
    this.eZ.push(z);
    this.eVX.push(prev ? (x - this.px.a[k]) / BIN : NaN);
    this.eVZ.push(prev ? (z - this.pz.a[k]) / BIN : NaN);
    this.pb.a[k] = b;
    this.px.a[k] = x;
    this.pz.a[k] = z;
  }

  /** A movement sample of unit `k` at `t` seconds. */
  pos(k: number, t: number, x: number, z: number): void {
    if (!(t === t && x === x && z === z) || !this.open(k)) return;
    // A dead unit's samples (a body or a camera left at the spot) are not a unit moving.
    const d = this.dead.a[k];
    if (d === d) {
      // With rounds, only the next round (or a spawn) brings a unit back: a dead player's camera moves too.
      if (t >= d && (this.round.a[k] >= 0 || Math.hypot(x - this.dx.a[k], z - this.dz.a[k]) < 2 * this.upm)) return;
      this.dead.a[k] = NaN;
    }
    const b = Math.floor(t / BIN);
    const c = this.cb.a[k];
    if (c === NO) this.cb.a[k] = b;
    else if (b > c) {
      this.emit(k);
      this.cb.a[k] = b;
    } else if (b < c) return;
    this.lx.a[k] = x;
    this.lz.a[k] = z;
  }

  /** An event (`KILL` by `k`, `DEATH` of `k`, `FIRE` by `k`, `HURT` taken by `k`, `SPAWN` of `k`). */
  event(kind: number, k: number, t: number): void {
    if (k < 0 || !(t === t) || !this.admitted.has(this.tM.a[k])) return;
    if (kind === DEATH) {
      this.dead.a[k] = t;
      this.dx.a[k] = this.lx.a[k];
      this.dz.a[k] = this.lz.a[k];
    } else if (kind === SPAWN) this.dead.a[k] = NaN;
    this.vKind.push(kind);
    this.vK.push(k);
    this.vT.push(t);
  }

  /**
   * Unit `k` seen in round `round` at `t`, with its loadout value where the
   * data has one (NaN none); `live` once the round's buying is over.
   */
  loadout(k: number, round: number, t: number, equip: number, live: boolean): void {
    if (k < 0 || !(round === round) || !(t === t)) return;
    // A new round brings the dead back.
    if (this.round.a[k] !== round) {
      this.round.a[k] = round;
      this.dead.a[k] = NaN;
    }
    const key = k * 4096 + (round & 4095);
    const r = this.rounds.get(key);
    if (!r) this.rounds.set(key, { k, ti: -1, round, equip, live: live && equip === equip, t0: t, t1: t });
    else {
      if (t < r.t0) r.t0 = t;
      if (t > r.t1) r.t1 = t;
      if (equip === equip && !r.live && (live || !(r.equip >= equip))) {
        r.equip = equip;
        r.live = live;
      }
    }
  }

  /** The world the measures read: per-match tracks with their events. */
  world(): World {
    for (let k = 0; k < this.tM.n; k++) if (this.cb.a[k] !== NO && this.admitted.has(this.tM.a[k])) this.emit(k);
    const K = this.tM.n;
    const N = this.eK.n;
    // Points by track (already in bin order within a track).
    const cnt = new Int32Array(K + 1);
    for (let i = 0; i < N; i++) cnt[this.eK.a[i] + 1]++;
    for (let k = 0; k < K; k++) cnt[k + 1] += cnt[k];
    const order = new Int32Array(N);
    const fill = cnt.slice(0, K);
    for (let i = 0; i < N; i++) order[fill[this.eK.a[i]]++] = i;
    const tracks: Track[] = [];
    const ti = new Int32Array(K).fill(-1);
    for (let k = 0; k < K; k++) {
      const a = cnt[k];
      const e = cnt[k + 1];
      if (e - a < 2) continue;
      const b0 = this.eB.a[order[a]];
      const n = this.eB.a[order[e - 1]] - b0 + 1;
      if (n > 200_000) continue;
      const t: Track = {
        k,
        m: this.tM.a[k],
        team: this.tTeam.a[k],
        b0,
        n,
        x: new Float32Array(n).fill(NaN),
        z: new Float32Array(n).fill(NaN),
        vx: new Float32Array(n).fill(NaN),
        vz: new Float32Array(n).fill(NaN),
        nn: new Float32Array(n).fill(NaN),
        dens: new Uint8Array(n),
        mates: new Uint8Array(n),
        pace: NaN,
        kills: [],
        deaths: [],
        fires: [],
        hurts: [],
        spawns: [],
      };
      for (let j = a; j < e; j++) {
        const i = order[j];
        const o = this.eB.a[i] - b0;
        t.x[o] = this.eX.a[i];
        t.z[o] = this.eZ.a[i];
        t.vx[o] = this.eVX.a[i];
        t.vz[o] = this.eVZ.a[i];
      }
      ti[k] = tracks.length;
      tracks.push(t);
    }
    for (let i = 0; i < this.vK.n; i++) {
      const j = ti[this.vK.a[i]];
      if (j < 0) continue;
      const t = tracks[j];
      const v = this.vT.a[i];
      const kind = this.vKind.a[i];
      (kind === KILL ? t.kills : kind === DEATH ? t.deaths : kind === FIRE ? t.fires : kind === HURT ? t.hurts : t.spawns).push(v);
    }
    const speeds: number[] = [];
    for (const t of tracks) {
      for (const a of [t.kills, t.deaths, t.fires, t.hurts, t.spawns]) a.sort((p, q) => p - q);
      speeds.length = 0;
      for (let i = 0; i < t.n; i++) {
        const s = Math.hypot(t.vx[i], t.vz[i]);
        if (s === s) speeds.push(s);
      }
      speeds.sort((p, q) => p - q);
      // The pace of moving: the median of the faster half (a unit that mostly waits still has a walking pace),
      // at least a metre a second, so that a unit that hardly moved does not turn every step into a sprint.
      t.pace = speeds.length ? Math.max(this.upm, speeds[Math.floor(speeds.length * 0.75)]) : NaN;
    }
    // Matches.
    const byM = new Map<number, number[]>();
    tracks.forEach((t, i) => {
      let l = byM.get(t.m);
      if (!l) byM.set(t.m, (l = []));
      l.push(i);
    });
    const matches: MatchW[] = [];
    for (const [m, list] of byM) {
      let B0 = Infinity;
      let B1 = -Infinity;
      for (const i of list) {
        B0 = Math.min(B0, tracks[i].b0);
        B1 = Math.max(B1, tracks[i].b0 + tracks[i].n - 1);
      }
      const L = B1 - B0 + 1;
      const start = new Int32Array(L + 1);
      for (const i of list) {
        const t = tracks[i];
        for (let o = 0; o < t.n; o++) if (t.x[o] === t.x[o]) start[t.b0 + o - B0 + 1]++;
      }
      for (let b = 0; b < L; b++) start[b + 1] += start[b];
      const mem = new Int32Array(start[L]);
      const f = start.slice(0, L);
      for (const i of list) {
        const t = tracks[i];
        for (let o = 0; o < t.n; o++) if (t.x[o] === t.x[o]) mem[f[t.b0 + o - B0]++] = i;
      }
      const killT: MatchW['killT'] = [];
      const deathT: MatchW['deathT'] = [];
      for (const i of list) {
        for (const v of tracks[i].kills) killT.push({ team: tracks[i].team, t: v });
        for (const v of tracks[i].deaths) deathT.push({ team: tracks[i].team, t: v });
      }
      killT.sort((a, b) => a.t - b.t);
      deathT.sort((a, b) => a.t - b.t);
      matches.push({ m, tracks: list, B0, B1, start, mem, killT, deathT });
    }
    const rounds: RoundRec[] = [];
    for (const r of this.rounds.values()) {
      const j = ti[r.k];
      if (j >= 0) rounds.push({ ti: j, round: r.round, equip: r.equip, live: r.live, t0: r.t0, t1: r.t1 });
    }
    return { upm: this.upm, tracks, matches, rounds, vmin: 0.3 * this.upm, s0: NaN };
  }

  finish(): BehaviourMetrics {
    const w = this.world();
    const r = rng(this.seed);
    const out: BehaviourMetrics = {
      schema: 'heat3d.behaviour/1',
      matches: w.matches.length,
      tracks: w.tracks.length,
      binSecs: BIN,
      spacing: null,
      sampled: this.sampled,
    };
    if (!w.tracks.length) return out;
    const safe = <T>(f: () => T | undefined): T | undefined => {
      try {
        return f();
      } catch (e) {
        console.warn('behaviour measure failed', e);
        return undefined;
      }
    };
    out.cohesion = safe(() => cohesion(w, r));
    if (w.s0 === w.s0) out.spacing = Math.round((w.s0 / w.upm) * 100) / 100;
    out.order = safe(() => order(w, r));
    const hl = safe(() => herdingAndLanes(w, r));
    out.herding = hl?.herding;
    out.lanes = hl?.lanes;
    out.crowding = safe(() => crowding(w, r, hl?.busy ?? null));
    out.leaders = safe(() => leaders(w, r));
    out.breaking = safe(() => breaking(w, r));
    const lives = safe(() => livesOf(w)) ?? [];
    out.risk = safe(() => risk(w, lives, r));
    out.streaks = safe(() => streaks(w, r));
    out.buy = safe(() => buys(w, r));
    out.suppression = safe(() => suppression(w, r));
    // False discovery rate over every test of the report.
    const tests: Test[] = [];
    for (const k of ['order', 'herding', 'lanes', 'crowding', 'leaders', 'cohesion', 'breaking', 'risk', 'streaks', 'buy', 'suppression'] as const) {
      const v = out[k];
      if (v) tests.push(v);
      else delete out[k];
    }
    const q = bhAdjust(tests.map((t) => t.p));
    tests.forEach((t, i) => (t.q = Math.round(q[i] * 1e4) / 1e4));
    return jsonSafe(out);
  }
}
