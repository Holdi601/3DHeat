/**
 * Crashes and hits: where a lap struck something - a wall, a barrier, another
 * car - read from the lap's own samples, before they are resampled onto the
 * distance grid (a hit is over in a few hundredths of a second).
 *
 * Tyres cannot make the forces of a hit. A car on the road accelerates,
 * brakes and corners up to its grip; it does not lose 20 km/h in a tenth of a
 * second, nor pull three times its hardest cornering in one sample. So a hit
 * is measured against the lap's own car:
 *
 * - its grip, `G`: the 99th percentile of its horizontal acceleration over
 *   the lap - what it does at the limit, whatever the car;
 * - a sample is struck where the horizontal acceleration jumps past
 *   `max(1.8 G, G + 18, 30)` m/s², or where the speed falls by more over
 *   0.1 s than that deceleration would take away, and 1.5 m/s more;
 * - the car in the air, and settling after landing, is not judged: a landing
 *   spikes the accelerations without hitting anything;
 * - a speed that drops with no force at all is the game rewinding or
 *   resetting the car, not a hit.
 *
 * Struck samples within 0.4 s of each other are one impact. It is a
 * **crash** where it took 30 km/h or more, or half the car's speed; anything
 * less is a **hit** - a knock, a scrape along a wall. Tried on recorded laps:
 * the walls in them (spikes to 196 m/s², 188 to 69 km/h in two samples) are
 * found, and a rally stage's jumps and landings are not taken for hits.
 */

import type { LapTrace } from './lap';

/**
 * How long after a landing the car is still settling, s: the suspension
 * bottoms out and the accelerations spike, which is not grip, braking or drive.
 */
const SETTLE = 0.3;

/**
 * Samples to judge what a car can do by: 1 with the wheels on the ground and
 * settled, 0 in the air or just after landing. A rally stage's jumps would
 * otherwise read as the car braking and cornering far beyond its grip.
 */
export function grounded(channels: Record<string, Float32Array>, n: number): Uint8Array {
  const out = new Uint8Array(n).fill(1);
  const air = channels.airborne;
  const time = channels.time;
  if (!air) return out;
  let landed = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < n; i++) {
    if (air[i] > 0.5) {
      out[i] = 0;
      landed = time[i];
    } else if (time[i] - landed < SETTLE) out[i] = 0;
  }
  return out;
}

export type ImpactKind = 'hit' | 'crash';

export interface Impact {
  kind: ImpactKind;
  /** Sample indices in the lap: first and last struck. */
  from: number;
  to: number;
  /** Lap time at the first, s. */
  time: number;
  /** Where, world coordinates. */
  x: number;
  y: number;
  z: number;
  /** The hardest horizontal acceleration in it, m/s² (NaN with no acceleration channels). */
  peak: number;
  /** Which way the force came: head-on, from behind, along a side. */
  direction: 'front' | 'rear' | 'side';
  /** Speed going in and the least coming out, m/s. */
  before: number;
  after: number;
  /** The grip it was measured against, and the threshold, m/s². */
  grip: number;
  threshold: number;
}

/** Below this the car is parked or crawling: a hit at walking pace says nothing. */
const MOVING = 5;
/** The window a fall in speed is measured over, s. */
const WINDOW = 0.1;
/** Struck samples this close are one impact, s. */
const JOIN = 0.4;
/** Speed lost that makes an impact a crash, m/s (30 km/h). */
const CRASH = 30 / 3.6;

const cache = new WeakMap<LapTrace, Impact[]>();

function percentile(values: number[], p: number): number {
  if (!values.length) return Number.NaN;
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))];
}

/** Every impact of a lap, in order. Measured once per lap. */
export function impacts(lap: LapTrace): Impact[] {
  const known = cache.get(lap);
  if (known) return known;
  const out = find(lap);
  cache.set(lap, out);
  return out;
}

function find(lap: LapTrace): Impact[] {
  const c = lap.channels;
  const { time, speed } = c;
  const n = lap.count;
  if (!time || !speed || n < 3) return [];
  const lat = c.latAcc;
  const lon = c.longAcc;
  const hasAcc = !!lat && !!lon;
  const ah = new Float32Array(n);
  if (hasAcc) for (let i = 0; i < n; i++) ah[i] = Math.hypot(lat[i], lon[i]);
  const settled = grounded(c, n);

  const usable: number[] = [];
  for (let i = 0; i < n; i++) if (settled[i] && speed[i] > MOVING && Number.isFinite(ah[i])) usable.push(ah[i]);
  const measured = hasAcc ? percentile(usable, 0.99) : Number.NaN;
  // Without accelerations, a road car's grip: only the speed can tell.
  const grip = Number.isFinite(measured) && measured > 3 ? measured : 15;
  const threshold = Math.max(1.8 * grip, grip + 18, 30);

  const struck: number[] = [];
  let j = 0;
  let fastest = 0;
  for (let i = 1; i < n; i++) {
    while (time[i] - time[j] > WINDOW && j < i) j++;
    if (!settled[i] || !(speed[i - 1] > MOVING)) continue;
    fastest = speed[j];
    for (let k = j + 1; k <= i; k++) fastest = Math.max(fastest, speed[k]);
    const drop = fastest - speed[i];
    const force = hasAcc && ah[i] > threshold && ah[i] - ah[i - 1] > 0.5 * grip;
    if (force || drop > threshold * WINDOW + 1.5) struck.push(i);
  }

  const out: Impact[] = [];
  const groups: [number, number][] = [];
  for (const i of struck) {
    const last = groups[groups.length - 1];
    if (last && time[i] - time[last[1]] < JOIN) last[1] = i;
    else groups.push([i, i]);
  }
  for (const [a, b] of groups) {
    let before = speed[a];
    for (let k = a; k >= 0 && time[a] - time[k] <= 0.15; k--) before = Math.max(before, speed[k]);
    let after = speed[a];
    for (let k = a; k < n && time[k] - time[b] <= 0.3; k++) after = Math.min(after, speed[k]);
    let peak = Number.NaN;
    let at = a;
    if (hasAcc) {
      peak = 0;
      for (let k = a; k < n && time[k] - time[b] <= 0.1; k++) {
        if (ah[k] > peak) {
          peak = ah[k];
          at = k;
        }
      }
      // Speed gone with no force behind it: a rewind or a reset.
      if (peak < Math.max(grip, 25)) continue;
    }
    const lost = before - after;
    const direction: Impact['direction'] = !hasAcc
      ? 'front'
      : Math.abs(lon[at]) > Math.abs(lat[at])
        ? lon[at] < 0
          ? 'front'
          : 'rear'
        : 'side';
    out.push({
      kind: lost >= CRASH || after < 0.5 * before ? 'crash' : 'hit',
      from: a,
      to: b,
      time: time[a],
      x: c.x[a],
      y: c.y?.[a] ?? 0,
      z: c.z[a],
      peak,
      direction,
      before,
      after,
      grip,
      threshold,
    });
  }
  return out;
}

/**
 * Samples to leave out when measuring what a car can do: each impact, from a
 * little before it to a second after, while the car recovers.
 */
export function struckMask(lap: LapTrace): Uint8Array {
  const n = lap.count;
  const out = new Uint8Array(n);
  const time = lap.channels.time;
  for (const hit of impacts(lap)) {
    for (let k = hit.from; k >= 0 && time[hit.from] - time[k] <= 0.1; k--) out[k] = 1;
    for (let k = hit.from; k < n && time[k] - time[hit.to] <= 1; k++) out[k] = 1;
  }
  return out;
}
