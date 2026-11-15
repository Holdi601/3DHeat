/**
 * A match on a common timeline: every unit's place at every step (linear
 * between its samples, held over a death so a respawn does not draw a line
 * across the map), whether it is alive there, and its velocity. Everything
 * after this reads steps, not rows.
 */

import { AIR, GROUND, INF, SEA, type MatchTracks, type UnitTrack } from './types';

/** Cells (steps times units) at most: the step grows to stay under it. */
const MAX_CELLS = 3_000_000;
/** Seconds a sample still places its unit, either side. */
const HOLD = 12;

export interface Frame {
  m: MatchTracks;
  step: number;
  S: number;
  N: number;
  /** Data seconds of step 0. */
  start: number;
  units: UnitTrack[];
  team: Int16Array;
  dom: Int8Array;
  cls: Int8Array;
  /** Track id -> unit index. */
  index: Map<number, number>;
  X: Float32Array;
  Y: Float32Array;
  Z: Float32Array;
  alive: Uint8Array;
  /** Metres in world units: everything is judged in metres times this. */
  upm: number;
  duration: number;
}

export function stepFor(m: MatchTracks, span: number): number {
  let inf = 0;
  for (const u of m.units) if (u.dom === INF) inf++;
  let step = inf > m.units.length / 2 ? 1 : 2;
  while ((span / step) * m.units.length > MAX_CELLS) step *= 2;
  return step;
}

export function buildFrame(m: MatchTracks): Frame | null {
  if (!m.units.length) return null;
  let lo = Infinity;
  let hi = -Infinity;
  for (const u of m.units) {
    if (u.t[0] < lo) lo = u.t[0];
    if (u.t[u.t.length - 1] > hi) hi = u.t[u.t.length - 1];
  }
  if (!(hi > lo)) return null;
  const step = stepFor(m, hi - lo);
  const S = Math.floor((hi - lo) / step) + 1;
  const N = m.units.length;
  const X = new Float32Array(S * N);
  const Y = new Float32Array(S * N);
  const Z = new Float32Array(S * N);
  const alive = new Uint8Array(S * N);
  const index = new Map<number, number>();
  m.units.forEach((u, i) => index.set(u.id, i));
  // Deaths by unit, ascending.
  const deaths = new Map<number, number[]>();
  for (const e of m.events) {
    if (e.kind !== 'death' || e.unit < 0) continue;
    let l = deaths.get(e.unit);
    if (!l) deaths.set(e.unit, (l = []));
    l.push(e.t);
  }
  const hold = Math.max(HOLD, step * 1.5);
  for (let u = 0; u < N; u++) {
    const tr = m.units[u];
    const d = deaths.get(tr.id) ?? [];
    let i = 0;
    let di = 0;
    const n = tr.t.length;
    for (let s = 0; s < S; s++) {
      const tau = lo + s * step;
      while (i + 1 < n && tr.t[i + 1] <= tau) i++;
      if (tr.t[i] > tau) {
        // Before the first sample: placed if it is close.
        if (i === 0 && tr.t[0] - tau <= step * 0.5) set(s, 0, 0, 1);
        continue;
      }
      while (di < d.length && d[di] < tr.t[i]) di++;
      const dead = di < d.length && d[di] <= tau;
      if (dead || tau - tr.t[i] > hold) continue;
      if (i + 1 < n && !(di < d.length && d[di] < tr.t[i + 1]) && tr.t[i + 1] - tr.t[i] <= hold * 2) {
        const f = (tau - tr.t[i]) / (tr.t[i + 1] - tr.t[i]);
        set(s, i, i + 1, f);
      } else if (i + 1 < n || tau - tr.t[i] <= step) set(s, i, i, 0);
    }
    function set(s: number, a: number, b: number, f: number): void {
      const k = s * N + u;
      X[k] = tr.x[a] + (tr.x[b] - tr.x[a]) * f;
      Y[k] = tr.y[a] + (tr.y[b] - tr.y[a]) * f;
      Z[k] = tr.z[a] + (tr.z[b] - tr.z[a]) * f;
      alive[k] = 1;
    }
  }
  return {
    m,
    step,
    S,
    N,
    start: lo,
    units: m.units,
    team: Int16Array.from(m.units, (u) => u.team),
    dom: Int8Array.from(m.units, (u) => u.dom),
    cls: Int8Array.from(m.units, (u) => u.cls),
    index,
    X,
    Y,
    Z,
    alive,
    upm: m.upm > 0 ? m.upm : 1,
    duration: hi - m.t0,
  };
}

/** Velocity of unit `u` at step `s` (world units a second), central where it can; null where it is not placed. */
export function velAt(f: Frame, s: number, u: number): [number, number] | null {
  const k = s * f.N + u;
  if (!f.alive[k]) return null;
  const a = s > 0 && f.alive[k - f.N] ? s - 1 : s;
  const b = s + 1 < f.S && f.alive[k + f.N] ? s + 1 : s;
  if (a === b) return [0, 0];
  const dt = (b - a) * f.step;
  const ka = a * f.N + u;
  const kb = b * f.N + u;
  return [(f.X[kb] - f.X[ka]) / dt, (f.Z[kb] - f.Z[ka]) / dt];
}

/** Seconds into the match of step `s`. */
export const timeOf = (f: Frame, s: number): number => f.start + s * f.step - f.m.t0;
/** The step of a data time. */
export const stepOf = (f: Frame, t: number): number => Math.max(0, Math.min(f.S - 1, Math.round((t - f.start) / f.step)));

/**
 * The domains' scales in metres: units further apart than `link` do not move
 * together; slower than `move` a unit stands; `range` is the engagement
 * range used where the match's own kills cannot tell it.
 */
export const SCALE: Record<number, { link: number; move: number; range: number; minRange: number; maxRange: number }> = {
  [AIR]: { link: 5000, move: 40, range: 15000, minRange: 1500, maxRange: 60000 },
  [GROUND]: { link: 170, move: 1.5, range: 700, minRange: 150, maxRange: 2500 },
  [SEA]: { link: 3000, move: 2, range: 12000, minRange: 2000, maxRange: 40000 },
  [INF]: { link: 18, move: 1, range: 35, minRange: 10, maxRange: 300 },
};

/** Which domains face each other on the ground: infantry and vehicles fight one battle. */
export const surface = (d: number): number => (d === INF ? GROUND : d);
export { AIR, GROUND, INF, SEA };
