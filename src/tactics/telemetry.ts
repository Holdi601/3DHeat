/**
 * What players really did, for checking a plan against: movement samples
 * from match data (CS2 demo tables are the main case), grouped per player per
 * round with the time since the round started, and three questions asked of
 * them - how long players took from one place (or the round's start) to
 * another, how fast they move in each movement state, and when each spot of
 * the map was first reached in a round.
 *
 * Pure: the worker (`telemetry.worker.ts`) runs these off the main thread.
 * Coordinates are world coordinates (the load's axis mapping applied), the
 * same the level and the board use.
 */

import type { Dataset } from '../state/types';

/** Movement state bits of a sample. */
export const WALKING = 1;
export const CROUCH = 2;
export const AIRBORNE = 4;
export const STATE_UNKNOWN = 255;

export interface Tracks {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  /** Seconds since the round's start (its freeze time ended). */
  t: Float32Array;
  state: Uint8Array;
  weapon: Uint16Array;
  weapons: string[];
  /** First sample of each run (one player in one round), and one past the last at the end. */
  runStart: Uint32Array;
  runRound: Uint32Array;
  /** Per run: 0 T / attack, 1 CT / defence, 2 other. */
  runSide: Uint8Array;
  runPlayer: string[];
  rounds: string[];
}

/** A disc on the map, optionally between two heights: where a route starts or ends. */
export interface Region {
  x: number;
  z: number;
  r: number;
  yMin?: number;
  yMax?: number;
}

export function inRegion(g: Region, x: number, y: number, z: number): boolean {
  const dx = x - g.x;
  const dz = z - g.z;
  if (dx * dx + dz * dz > g.r * g.r) return false;
  return (g.yMin === undefined || y >= g.yMin) && (g.yMax === undefined || y <= g.yMax);
}

export function sideCode(s: string): number {
  const v = s.trim().toLowerCase();
  if (v === 't' || v === 'terrorist' || v === 'attack' || v === 'atk' || v === 'attackers') return 0;
  if (v === 'ct' || v === 'counter-terrorist' || v === 'defense' || v === 'defence' || v === 'def' || v === 'defenders') return 1;
  return 2;
}

/** Collects samples in any order and sorts them into runs. */
export class TrackBuilder {
  private xs: number[] = [];
  private ys: number[] = [];
  private zs: number[] = [];
  private ts: number[] = [];
  private st: number[] = [];
  private wp: number[] = [];
  private run: number[] = [];
  private readonly runs = new Map<string, number>();
  private readonly runInfo: { round: number; side: number; player: string }[] = [];
  private readonly roundIds = new Map<string, number>();
  private readonly weaponIds = new Map<string, number>();

  add(round: string, player: string, side: number, t: number, x: number, y: number, z: number, state: number, weapon: string): void {
    if (!Number.isFinite(t) || !Number.isFinite(x) || !Number.isFinite(z) || t < 0) return;
    const key = `${round}\u0000${player}`;
    let r = this.runs.get(key);
    if (r === undefined) {
      let ri = this.roundIds.get(round);
      if (ri === undefined) this.roundIds.set(round, (ri = this.roundIds.size));
      r = this.runInfo.length;
      this.runs.set(key, r);
      this.runInfo.push({ round: ri, side, player });
    }
    let w = this.weaponIds.get(weapon);
    if (w === undefined) this.weaponIds.set(weapon, (w = this.weaponIds.size));
    this.xs.push(x);
    this.ys.push(Number.isFinite(y) ? y : 0);
    this.zs.push(z);
    this.ts.push(t);
    this.st.push(state);
    this.wp.push(w);
    this.run.push(r);
  }

  build(): Tracks {
    const n = this.xs.length;
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => this.run[a] - this.run[b] || this.ts[a] - this.ts[b]);
    const out: Tracks = {
      x: new Float32Array(n),
      y: new Float32Array(n),
      z: new Float32Array(n),
      t: new Float32Array(n),
      state: new Uint8Array(n),
      weapon: new Uint16Array(n),
      weapons: [...this.weaponIds.keys()],
      runStart: new Uint32Array(this.runInfo.length + 1),
      runRound: Uint32Array.from(this.runInfo.map((r) => r.round)),
      runSide: Uint8Array.from(this.runInfo.map((r) => r.side)),
      runPlayer: this.runInfo.map((r) => r.player),
      rounds: [...this.roundIds.keys()],
    };
    let prevRun = -1;
    order.forEach((src, i) => {
      out.x[i] = this.xs[src];
      out.y[i] = this.ys[src];
      out.z[i] = this.zs[src];
      out.t[i] = this.ts[src];
      out.state[i] = this.st[src];
      out.weapon[i] = this.wp[src];
      const r = this.run[src];
      while (prevRun < r) out.runStart[++prevRun] = i;
    });
    for (let r = prevRun + 1; r <= this.runInfo.length; r++) out.runStart[r] = n;
    return out;
  }
}

/** Tracks from a loaded dataset: its position rows with a round time, per session (round) and person. */
export function tracksFromDataset(d: Dataset): Tracks | null {
  const attr = (name: string) => d.attrs.find((a) => a.name.toLowerCase() === name.toLowerCase()) ?? null;
  const rt = attr('roundTime');
  if (!rt || !d.personId) return null;
  const ev = attr('event');
  const posIdx = ev?.categories ? ev.categories.indexOf('position') : -1;
  const phase = attr('phase');
  const liveIdx = phase?.categories ? phase.categories.indexOf('live') : -1;
  const walking = attr('walking');
  const duck = attr('duck') ?? attr('crouch');
  const airborne = attr('airborne');
  const weapon = attr('weapon');
  const b = new TrackBuilder();
  const val = (a: typeof rt, i: number) => (a.kind === 'category' ? Number(a.categories?.[a.data[i]] ?? NaN) : a.data[i]);
  for (let i = 0; i < d.count; i++) {
    if (ev && posIdx >= 0 && ev.data[i] !== posIdx) continue;
    if (phase && liveIdx >= 0 && phase.data[i] !== liveIdx) continue;
    const t = val(rt, i);
    const sess = d.sessionId ? d.sessionLabels[d.sessionId[i]] : '0';
    const team = d.teamId ? d.teamLabels[d.teamId[i]] : '';
    let state = walking || duck || airborne ? 0 : STATE_UNKNOWN;
    if (walking && val(walking, i) > 0.5) state |= WALKING;
    if (duck && val(duck, i) >= 0.5) state |= CROUCH;
    if (airborne && val(airborne, i) > 0.5) state |= AIRBORNE;
    const w = weapon ? (weapon.categories?.[weapon.data[i]] ?? '') : '';
    b.add(sess, d.personLabels[d.personId[i]], sideCode(team), t, d.px[i], d.py[i], d.pz[i], state, w);
  }
  return b.build();
}

// ------------------------------------------------------------------- questions

export interface TravelStats {
  n: number;
  min: number;
  p10: number;
  median: number;
  /** The fastest run: who, in which round. */
  fastest: { player: string; round: string } | null;
  times: number[];
}

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

/**
 * How long each player took to reach `to`: from the round's start, or from
 * leaving `from` (the last moment in it before first reaching `to`). Entry is
 * found between samples, an eighth of the way at a time.
 */
export function travelTimes(tr: Tracks, from: Region | 'roundStart', to: Region, side: number | null = null): TravelStats {
  const found: { t: number; run: number }[] = [];
  for (let r = 0; r + 1 < tr.runStart.length; r++) {
    if (side !== null && tr.runSide[r] !== side) continue;
    const a = tr.runStart[r];
    const b = tr.runStart[r + 1];
    let left = from === 'roundStart' ? 0 : -1;
    for (let i = a; i < b; i++) {
      if (from !== 'roundStart' && inRegion(from, tr.x[i], tr.y[i], tr.z[i])) left = tr.t[i];
      if (left < 0) continue;
      let at = -1;
      if (inRegion(to, tr.x[i], tr.y[i], tr.z[i])) {
        at = tr.t[i];
        if (i > a) {
          for (let k = 1; k <= 8; k++) {
            const u = k / 8;
            const x = tr.x[i - 1] + (tr.x[i] - tr.x[i - 1]) * u;
            const y = tr.y[i - 1] + (tr.y[i] - tr.y[i - 1]) * u;
            const z = tr.z[i - 1] + (tr.z[i] - tr.z[i - 1]) * u;
            if (inRegion(to, x, y, z)) {
              at = tr.t[i - 1] + (tr.t[i] - tr.t[i - 1]) * u;
              break;
            }
          }
        }
      }
      if (at >= 0) {
        found.push({ t: Math.max(0, at - left), run: r });
        break;
      }
    }
  }
  found.sort((p, q) => p.t - q.t);
  const times = found.map((f) => f.t);
  const f0 = found[0];
  return {
    n: times.length,
    min: times[0] ?? NaN,
    p10: quantile(times, 0.1),
    median: quantile(times, 0.5),
    fastest: f0 ? { player: tr.runPlayer[f0.run], round: tr.rounds[tr.runRound[f0.run]] } : null,
    times,
  };
}

export interface ArrivalGrid {
  x0: number;
  z0: number;
  cell: number;
  nx: number;
  nz: number;
  /** Seconds since round start the cell was first reached (NaN: never). */
  values: Float32Array;
  /** Height of the ground there, as the first arrival stood. */
  heights: Float32Array;
  tMin: number;
  tMax: number;
  rounds: number;
}

/**
 * When each spot was first reached in a round, over all rounds: the fastest
 * (`min`) or the typical (`median` of each round's first arrival). Samples
 * are joined by straight steps of half a cell so a run fills the cells it
 * crossed.
 */
export function earliestArrival(tr: Tracks, cell: number, stat: 'min' | 'median', side: number | null = null, maxCells = 512): ArrivalGrid {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < tr.x.length; i++) {
    minX = Math.min(minX, tr.x[i]);
    maxX = Math.max(maxX, tr.x[i]);
    minZ = Math.min(minZ, tr.z[i]);
    maxZ = Math.max(maxZ, tr.z[i]);
  }
  if (!Number.isFinite(minX)) return { x0: 0, z0: 0, cell, nx: 0, nz: 0, values: new Float32Array(0), heights: new Float32Array(0), tMin: 0, tMax: 0, rounds: 0 };
  const c = Math.max(cell, (maxX - minX) / maxCells, (maxZ - minZ) / maxCells);
  const nx = Math.max(1, Math.ceil((maxX - minX) / c) + 1);
  const nz = Math.max(1, Math.ceil((maxZ - minZ) / c) + 1);
  const cells = nx * nz;
  const best = new Float32Array(cells).fill(Infinity);
  const heights = new Float32Array(cells);
  const lists = stat === 'median' ? new Map<number, number[]>() : null;
  const round = new Float32Array(cells).fill(Infinity);
  const roundY = new Float32Array(cells);
  const touched: number[] = [];
  // Runs grouped by round.
  const byRound = new Map<number, number[]>();
  for (let r = 0; r + 1 < tr.runStart.length; r++) {
    if (side !== null && tr.runSide[r] !== side) continue;
    const k = tr.runRound[r];
    if (!byRound.has(k)) byRound.set(k, []);
    byRound.get(k)!.push(r);
  }
  const mark = (x: number, y: number, z: number, t: number) => {
    const i = Math.floor((x - minX) / c);
    const j = Math.floor((z - minZ) / c);
    if (i < 0 || j < 0 || i >= nx || j >= nz) return;
    const k = j * nx + i;
    if (round[k] === Infinity) touched.push(k);
    if (t < round[k]) {
      round[k] = t;
      roundY[k] = y;
    }
  };
  for (const runs of byRound.values()) {
    for (const r of runs) {
      const a = tr.runStart[r];
      const b = tr.runStart[r + 1];
      for (let i = a; i < b; i++) {
        if (i === a) {
          mark(tr.x[i], tr.y[i], tr.z[i], tr.t[i]);
          continue;
        }
        const dx = tr.x[i] - tr.x[i - 1];
        const dz = tr.z[i] - tr.z[i - 1];
        const steps = Math.min(64, Math.max(1, Math.ceil(Math.hypot(dx, dz) / (c / 2))));
        for (let s = 1; s <= steps; s++) {
          const u = s / steps;
          mark(tr.x[i - 1] + dx * u, tr.y[i - 1] + (tr.y[i] - tr.y[i - 1]) * u, tr.z[i - 1] + dz * u, tr.t[i - 1] + (tr.t[i] - tr.t[i - 1]) * u);
        }
      }
    }
    for (const k of touched) {
      if (round[k] < best[k]) {
        best[k] = round[k];
        heights[k] = roundY[k];
      }
      if (lists) {
        let l = lists.get(k);
        if (!l) lists.set(k, (l = []));
        l.push(round[k]);
      }
      round[k] = Infinity;
    }
    touched.length = 0;
  }
  const values = new Float32Array(cells).fill(NaN);
  let tMin = Infinity;
  const all: number[] = [];
  for (let k = 0; k < cells; k++) {
    if (best[k] === Infinity) continue;
    let v = best[k];
    if (lists) {
      const l = lists.get(k)!.sort((p, q) => p - q);
      v = quantile(l, 0.5);
    }
    values[k] = v;
    tMin = Math.min(tMin, v);
    all.push(v);
  }
  // The colour scale ends at the 90th percentile: a few late corners would otherwise wash the rest out.
  const tMax = all.length ? quantile(all.sort((p, q) => p - q), 0.9) : 0;
  return { x0: minX, z0: minZ, cell: c, nx, nz, values, heights, tMin: Number.isFinite(tMin) ? tMin : 0, tMax, rounds: byRound.size };
}

/** The value of the grid at a point, NaN outside or never reached. */
export function gridAt(g: ArrivalGrid, x: number, z: number): number {
  const i = Math.floor((x - g.x0) / g.cell);
  const j = Math.floor((z - g.z0) / g.cell);
  if (i < 0 || j < 0 || i >= g.nx || j >= g.nz) return NaN;
  return g.values[j * g.nx + i];
}

export interface SpeedStat {
  state: 'run' | 'walk' | 'crouch';
  n: number;
  p50: number;
  p90: number;
  p99: number;
}

/**
 * Horizontal speed between neighbouring samples of a player while moving, by
 * movement state (where the data says it: CS2's walking and duck columns),
 * world units a second. Steps longer than `maxGap` seconds and the airborne
 * are left out, as are standing still and teleports.
 */
export function speedStats(tr: Tracks, maxGap = 0.3, ceiling = 1000): { states: SpeedStat[]; weapons: { weapon: string; n: number; p95: number }[] } {
  const by: Record<SpeedStat['state'], number[]> = { run: [], walk: [], crouch: [] };
  const weapons = new Map<number, number[]>();
  for (let r = 0; r + 1 < tr.runStart.length; r++) {
    for (let i = tr.runStart[r] + 1; i < tr.runStart[r + 1]; i++) {
      const dt = tr.t[i] - tr.t[i - 1];
      if (!(dt > 0 && dt <= maxGap)) continue;
      const s0 = tr.state[i];
      const s1 = tr.state[i - 1];
      if (s0 === STATE_UNKNOWN || s0 !== s1 || s0 & AIRBORNE) continue;
      const v = Math.hypot(tr.x[i] - tr.x[i - 1], tr.z[i] - tr.z[i - 1]) / dt;
      if (v < 5 || v > ceiling) continue;
      const st = s0 & CROUCH ? 'crouch' : s0 & WALKING ? 'walk' : 'run';
      by[st].push(v);
      if (st === 'run' && tr.weapon[i] === tr.weapon[i - 1]) {
        let l = weapons.get(tr.weapon[i]);
        if (!l) weapons.set(tr.weapon[i], (l = []));
        l.push(v);
      }
    }
  }
  const states = (Object.keys(by) as SpeedStat['state'][]).map((state) => {
    const l = by[state].sort((a, b) => a - b);
    return { state, n: l.length, p50: quantile(l, 0.5), p90: quantile(l, 0.9), p99: quantile(l, 0.99) };
  });
  const ws = [...weapons.entries()]
    .filter(([, l]) => l.length >= 50)
    .map(([w, l]) => ({ weapon: tr.weapons[w], n: l.length, p95: quantile(l.sort((a, b) => a - b), 0.95) }))
    .sort((a, b) => b.n - a.n);
  return { states, weapons: ws };
}
