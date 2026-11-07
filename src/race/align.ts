/**
 * Every lap on one distance axis: the reference lap's driven line.
 *
 * Comparing laps by time drifts - a second behind, the two laps are at
 * different corners - so they are compared by distance. Not by each lap's own
 * odometer either, because a lap that takes a tighter line covers fewer metres
 * and its distance runs ahead. Each lap is instead projected onto the reference
 * path: a sample's `s` is how far along the reference it is, and its `d` how far
 * to the side (left positive). Then every channel is resampled onto one grid.
 */

import type { LapTrace } from './lap';
import { isStepped } from './schema';

/** Grid spacing, metres. */
export const STEP = 2;

export interface Projection {
  /** Distance along the reference, per sample. */
  s: Float32Array;
  /** Signed lateral offset from the reference, per sample (left positive). */
  d: Float32Array;
}

export interface ReferencePath {
  x: Float64Array;
  z: Float64Array;
  /** Cumulative planar arc length at each vertex. */
  s: Float64Array;
  length: number;
}

export function referencePath(lap: LapTrace): ReferencePath {
  const { x, z } = lap.channels;
  const n = x.length;
  const px = new Float64Array(n);
  const pz = new Float64Array(n);
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    px[i] = x[i];
    pz[i] = z[i];
    if (i > 0) s[i] = s[i - 1] + Math.hypot(px[i] - px[i - 1], pz[i] - pz[i - 1]);
  }
  return { x: px, z: pz, s, length: s[n - 1] };
}

/** Nearest point on segment i of the path to (x, z): [distance², t, s, d]. */
function onSegment(
  path: ReferencePath,
  i: number,
  x: number,
  z: number,
): [number, number, number, number] {
  const ax = path.x[i];
  const az = path.z[i];
  const bx = path.x[i + 1];
  const bz = path.z[i + 1];
  const vx = bx - ax;
  const vz = bz - az;
  const len2 = vx * vx + vz * vz;
  let t = len2 > 0 ? ((x - ax) * vx + (z - az) * vz) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + vx * t;
  const qz = az + vz * t;
  const dx = x - qx;
  const dz = z - qz;
  const len = Math.sqrt(len2) || 1;
  // Left of the direction of travel is positive.
  const side = (vx * dz - vz * dx) / len;
  return [dx * dx + dz * dz, t, path.s[i] + t * (path.s[i + 1] - path.s[i]), side];
}

/**
 * Where each sample of a lap lies along the reference.
 *
 * The search runs forward from the previous match, so a lap that passes over
 * or under itself - a figure-of-eight, a bridge - never snaps to the other
 * crossing. A wide search is used only when the local one finds nothing near:
 * the first sample, and after a spin or an excursion.
 */
export function project(path: ReferencePath, lap: LapTrace): Projection {
  const { x, z } = lap.channels;
  const n = x.length;
  const segments = path.x.length - 1;
  const s = new Float32Array(n);
  const d = new Float32Array(n);
  let at = -1;
  for (let k = 0; k < n; k++) {
    let best: [number, number, number, number] | null = null;
    let bestI = -1;
    if (at >= 0) {
      // Metres of reference either side of the last match to look in.
      const lo = Math.max(0, at - 8);
      const hi = Math.min(segments - 1, at + 40);
      for (let i = lo; i <= hi; i++) {
        const r = onSegment(path, i, x[k], z[k]);
        if (!best || r[0] < best[0]) {
          best = r;
          bestI = i;
        }
      }
    }
    if (at < 0) {
      // The first sample: on a circuit the start line is also the finish, and
      // a lap that starts a metre behind the reference's first sample is
      // nearest its last one. A lap starts near the start, so look there first.
      const quarter = Math.max(1, Math.floor(segments / 4));
      for (let i = 0; i < quarter; i++) {
        const r = onSegment(path, i, x[k], z[k]);
        if (!best || r[0] < best[0]) {
          best = r;
          bestI = i;
        }
      }
    }
    if (!best || best[0] > 30 * 30) {
      // Lost, or starting elsewhere: the nearest point anywhere, but no earlier
      // than where the lap already was - a lap does not drive backwards.
      const start = at >= 0 ? Math.max(0, at - 8) : 0;
      for (let i = start; i < segments; i++) {
        const r = onSegment(path, i, x[k], z[k]);
        if (!best || r[0] < best[0]) {
          best = r;
          bestI = i;
        }
      }
    }
    at = bestI;
    s[k] = best![2];
    d[k] = best![3];
  }
  // Distance along the reference never decreases: a sample that projects a
  // little behind the one before it (a wobble, a lock-up) is held where it was.
  for (let k = 1; k < n; k++) if (s[k] < s[k - 1]) s[k] = s[k - 1];
  return { s, d };
}

export interface AlignedLap {
  lap: LapTrace;
  /** Grid index range this lap covers; outside it the channels are NaN. */
  first: number;
  last: number;
  /** Resampled channels on the shared grid, plus `lateral` (d) and `delta`. */
  channels: Record<string, Float32Array>;
}

export interface Alignment {
  reference: LapTrace;
  path: ReferencePath;
  /** Grid positions, metres along the reference. */
  grid: Float32Array;
  laps: AlignedLap[];
}

/**
 * Linear interpolation of `values` sampled at non-decreasing `at`, onto `grid`.
 * Outside the sampled range the result is NaN.
 */
export function resample(at: Float32Array, values: Float32Array, grid: Float32Array): Float32Array {
  const out = new Float32Array(grid.length).fill(Number.NaN);
  let j = 0;
  const n = at.length;
  for (let g = 0; g < grid.length; g++) {
    const s = grid[g];
    if (s < at[0] || s > at[n - 1]) continue;
    while (j < n - 2 && at[j + 1] < s) j++;
    const a = at[j];
    const b = at[j + 1];
    const t = b > a ? (s - a) / (b - a) : 0;
    out[g] = values[j] + (values[j + 1] - values[j]) * Math.max(0, Math.min(1, t));
  }
  return out;
}

/** Channels that step rather than blend: resampled by nearest sample. */
// Which channels step (a gear, a flag) is the channel table's to say: `isStepped`.

function resampleStepped(at: Float32Array, values: Float32Array, grid: Float32Array): Float32Array {
  const out = new Float32Array(grid.length).fill(Number.NaN);
  let j = 0;
  const n = at.length;
  for (let g = 0; g < grid.length; g++) {
    const s = grid[g];
    if (s < at[0] || s > at[n - 1]) continue;
    while (j < n - 1 && at[j + 1] <= s) j++;
    out[g] = values[j];
  }
  return out;
}

/** How far past its own first or last sample a lap is carried on the grid, metres. */
const REACH = 15;

/**
 * A lap's line is a few metres from the reference's, so its first and last
 * samples project a little inside the reference's ends and the last grid
 * points of a full lap would be empty. Carry it the last few metres at the
 * speed it had: time grows by distance over speed, the rest holds.
 */
function extend(
  channels: Record<string, Float32Array>,
  s: Float32Array,
  lap: LapTrace,
  grid: Float32Array,
): void {
  const n = s.length;
  const speed = lap.channels.speed;
  const time = lap.channels.time;
  const ends = [
    { at: s[0], k: 0, sign: -1 },
    { at: s[n - 1], k: n - 1, sign: 1 },
  ];
  const lateral = channels.lateral;
  let firstSide = 0;
  while (firstSide < grid.length - 1 && Number.isNaN(lateral[firstSide])) firstSide++;
  let lastSide = grid.length - 1;
  while (lastSide > 0 && Number.isNaN(lateral[lastSide])) lastSide--;
  for (const { at, k, sign } of ends) {
    const v = Math.max(1, speed ? speed[k] : 1);
    const side = lateral[sign < 0 ? firstSide : lastSide];
    for (let g = 0; g < grid.length; g++) {
      const gap = (grid[g] - at) * sign;
      if (gap <= 0 || gap > REACH) continue;
      for (const [name, values] of Object.entries(channels)) {
        if (!Number.isNaN(values[g])) continue;
        if (name === 'time') values[g] = time[k] + (sign * gap) / v;
        else if (name === 'distance') values[g] = lap.channels.distance[k] + sign * gap;
        else if (name in lap.channels) values[g] = lap.channels[name][k];
        else if (name === 'lateral') values[g] = side;
      }
    }
  }
}

/**
 * Align every lap to the reference. The reference is aligned to itself, so its
 * `lateral` is zero and its `delta` too.
 */
export function align(reference: LapTrace, laps: LapTrace[], step = STEP): Alignment {
  const path = referencePath(reference);
  const count = Math.max(2, Math.floor(path.length / step) + 1);
  const grid = new Float32Array(count);
  for (let i = 0; i < count; i++) grid[i] = i * step;

  const aligned: AlignedLap[] = [];
  let refTime: Float32Array | null = null;
  const ordered = [reference, ...laps.filter((l) => l !== reference)];
  for (const lap of ordered) {
    const projection =
      lap === reference
        ? { s: new Float32Array(path.s), d: new Float32Array(lap.count) }
        : project(path, lap);
    const channels: Record<string, Float32Array> = {};
    for (const [name, values] of Object.entries(lap.channels)) {
      channels[name] = isStepped(name)
        ? resampleStepped(projection.s, values, grid)
        : resample(projection.s, values, grid);
    }
    channels.lateral = resample(projection.s, projection.d, grid);
    if (lap !== reference) extend(channels, projection.s, lap, grid);
    if (lap === reference) refTime = channels.time;
    const delta = new Float32Array(count);
    for (let i = 0; i < count; i++) delta[i] = channels.time[i] - refTime![i];
    channels.delta = delta;
    let first = 0;
    while (first < count && !Number.isFinite(channels.time[first])) first++;
    let last = count - 1;
    while (last > first && !Number.isFinite(channels.time[last])) last--;
    aligned.push({ lap, first, last, channels });
  }
  // Back in the caller's order.
  aligned.sort((a, b) => laps.indexOf(a.lap) - laps.indexOf(b.lap));
  return { reference, path, grid, laps: aligned };
}

/** A lap's elapsed time at grid distance `s`, interpolated. */
export function timeAt(lap: AlignedLap, grid: Float32Array, s: number): number {
  const step = grid.length > 1 ? grid[1] - grid[0] : 1;
  const f = Math.max(0, Math.min(grid.length - 1, s / step));
  const i = Math.floor(f);
  const j = Math.min(grid.length - 1, i + 1);
  const t = lap.channels.time;
  return t[i] + (t[j] - t[i]) * (f - i);
}
