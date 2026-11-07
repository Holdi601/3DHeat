/**
 * Corners, and the phases of each, found on the reference lap.
 *
 * A corner is a minimum of speed with enough prominence, or a stretch of
 * curvature tight enough to have a line where the speed barely dips - a
 * flat-out kink is still a corner to drive. Each is then cut into braking,
 * entry, apex and exit, and the straight that follows runs to the next braking
 * point. See docs/race-analytics.md, section 2.
 */

import type { Alignment } from './align';

export interface Corner {
  /** 1-based, in lap order: T1, T2 ... */
  number: number;
  /** Grid indices on the shared distance axis. */
  entry: number;
  apex: number;
  exit: number;
  /** Where the straight after this corner ends: the next corner's entry. */
  straightEnd: number;
  direction: 'left' | 'right';
  /** A kink taken flat out: no braking phase, no speed minimum to speak of. */
  flat: boolean;
  /** Minimum speed on the reference, m/s. */
  apexSpeed: number;
}

/** Moving average over `radius` samples either side, NaN-tolerant. */
export function smooth(values: Float32Array, radius: number): Float32Array {
  const out = new Float32Array(values.length);
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, i - radius); j <= Math.min(values.length - 1, i + radius); j++) {
      const v = values[j];
      if (Number.isFinite(v)) {
        sum += v;
        n++;
      }
    }
    out[i] = n ? sum / n : Number.NaN;
  }
  return out;
}

/**
 * Signed curvature of the reference path on the grid, 1/m: positive when it
 * bends towards positive `lateral` (left, in a left-handed world like Forza's).
 */
export function curvature(alignment: Alignment): Float32Array {
  const ref = alignment.laps.find((l) => l.lap === alignment.reference)!;
  const x = smooth(ref.channels.x, 4);
  const z = smooth(ref.channels.z, 4);
  const n = x.length;
  const out = new Float32Array(n);
  const k = 5; // samples either side for the heading difference
  for (let i = k; i < n - k; i++) {
    const h1 = Math.atan2(z[i] - z[i - k], x[i] - x[i - k]);
    const h2 = Math.atan2(z[i + k] - z[i], x[i + k] - x[i]);
    let dh = h2 - h1;
    while (dh > Math.PI) dh -= 2 * Math.PI;
    while (dh < -Math.PI) dh += 2 * Math.PI;
    const ds = alignment.grid[i + k] - alignment.grid[i - k];
    out[i] = ds > 0 ? dh / ds : 0;
  }
  return out;
}

const BRAKING = 0.1;
const FULL_THROTTLE = 0.95;

/**
 * `mirrored`: whether the laps' world is left-handed (see handedness.ts), which
 * decides whether a bend that curves towards positive `lateral` is a left- or a
 * right-hander. Unknown counts as mirrored, as Forza's is.
 */
export function findCorners(alignment: Alignment, mirrored: boolean | null = null): Corner[] {
  const ref = alignment.laps.find((l) => l.lap === alignment.reference)!;
  const step = alignment.grid[1] - alignment.grid[0];
  const speed = smooth(ref.channels.speed, Math.max(1, Math.round(6 / step)));
  const throttle = ref.channels.throttle ?? new Float32Array(speed.length).fill(1);
  const brake = ref.channels.brake ?? new Float32Array(speed.length);
  const kappa = smooth(curvature(alignment), Math.max(1, Math.round(10 / step)));
  const n = speed.length;
  const lo = ref.first;
  const hi = ref.last;

  // 1. Speed minima with prominence: the drop from the highest speed on either
  //    side before a lower minimum.
  const apexes: number[] = [];
  const window = Math.max(3, Math.round(40 / step));
  for (let i = lo + 1; i < hi; i++) {
    const v = speed[i];
    if (!Number.isFinite(v)) continue;
    let isMin = true;
    for (let j = Math.max(lo, i - window); j <= Math.min(hi, i + window); j++) {
      if (speed[j] < v || (speed[j] === v && j < i)) {
        isMin = false;
        break;
      }
    }
    if (!isMin) continue;
    let left = v;
    for (let j = i - 1; j >= lo; j--) {
      if (speed[j] < v) break;
      left = Math.max(left, speed[j]);
    }
    let right = v;
    for (let j = i + 1; j <= hi; j++) {
      if (speed[j] < v) break;
      right = Math.max(right, speed[j]);
    }
    const prominence = Math.min(left, right) - v;
    if (prominence >= Math.max(2.5, 0.06 * v)) apexes.push(i);
  }

  // 2. Kinks: tight curvature with no speed minimum nearby.
  const tight = 1 / 300;
  for (let i = lo + 1; i < hi; i++) {
    const k = Math.abs(kappa[i]);
    if (k < tight || k < Math.abs(kappa[i - 1]) || k < Math.abs(kappa[i + 1])) continue;
    const near = apexes.some((a) => Math.abs(a - i) * step < 80);
    if (!near) apexes.push(i);
  }
  apexes.sort((a, b) => a - b);

  // 3. Phases for each apex.
  const corners: Corner[] = [];
  for (const apex of apexes) {
    let entry = apex;
    // Back from the apex while the driver is braking or off full throttle.
    while (entry > lo && (brake[entry - 1] > BRAKING || throttle[entry - 1] < FULL_THROTTLE))
      entry--;
    let exit = apex;
    while (exit < hi && throttle[exit + 1] < FULL_THROTTLE) exit++;
    const flat = entry === apex && exit === apex;
    if (flat) {
      // A flat-out kink: give it a stretch either side so it has an extent.
      const pad = Math.round(30 / step);
      entry = Math.max(lo, apex - pad);
      exit = Math.min(hi, apex + pad);
    }
    corners.push({
      number: 0,
      entry,
      apex,
      exit,
      straightEnd: hi,
      direction: kappa[apex] >= 0 === (mirrored ?? true) ? 'left' : 'right',
      flat,
      apexSpeed: ref.channels.speed[apex],
    });
  }
  // Corners whose phases overlap are one complex with several apexes; keep them
  // separate, but start each entry no earlier than the apex before and end each
  // exit where the next entry begins, so the phases of the lap tile it.
  for (let i = 0; i < corners.length; i++) {
    const next = corners[i + 1];
    if (next) {
      if (next.entry < corners[i].apex) next.entry = corners[i].apex;
      if (corners[i].exit > next.entry) corners[i].exit = Math.max(corners[i].apex, next.entry);
      corners[i].straightEnd = Math.max(corners[i].exit, next.entry);
    } else {
      corners[i].straightEnd = Math.max(corners[i].exit, hi);
    }
    corners[i].number = i + 1;
  }
  return corners.filter((c) => c.exit >= c.entry && c.entry < n);
}
