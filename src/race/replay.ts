/**
 * Where each car is at a moment of the replay.
 *
 * One clock drives every lap. How a lap's own time follows from the clock is
 * the replay mode:
 *
 * - `start`: every lap from its own start line - a race between them, the gap
 *   growing as it does on track.
 * - `anchor`: every lap put at the same point of the track at the same moment,
 *   then let go - "set the cars on top of each other at the hairpin, and see
 *   what happens from there". The clock is the reference lap's time.
 * - `locked`: every lap at the reference's distance, always - the cars side by
 *   side all lap, their speeds and inputs compared at the same metre.
 */

import { timeAt, type Alignment } from './align';
import type { LapTrace } from './lap';
import { isStepped, splitChannel, WHEELS } from './schema';

export type ReplayMode = 'start' | 'anchor' | 'locked';

/** One car at one moment. */
export interface CarState {
  x: number;
  y: number;
  z: number;
  /** Direction of the body in the ground plane, radians: atan2(dx, dz). */
  heading: number;
  /** Direction of travel, radians; differs from `heading` in a slide. */
  course: number;
  pitch: number;
  roll: number;
  speed: number;
  throttle: number;
  brake: number;
  /** The pedal, 0..1; NaN when the lap does not carry it. */
  clutch: number;
  handbrake: number;
  steer: number;
  gear: number;
  /** Seconds into the lap. */
  time: number;
  /** Metres along the reference, for the charts' cursor. */
  distance: number;
  /**
   * Every scalar channel the lap carries, at this moment - whatever the game
   * sent, so an input panel or a value table can show channels it has never
   * heard of.
   */
  values: Record<string, number>;
  /** Per-wheel channel families at this moment: family -> [FL, FR, RL, RR]. */
  wheels: Record<string, [number, number, number, number]>;
  /** Whether the lap has finished (the car parks on the line). */
  finished: boolean;
}

/** What a lap needs for replay, computed once. */
export interface LapMotion {
  lap: LapTrace;
  /** Direction of travel at each sample, radians. */
  course: Float32Array;
  /** Body heading at each sample; the yaw channel when it can be trusted. */
  heading: Float32Array;
  /** Distance along the reference at each sample. */
  s: Float32Array;
  families: string[];
  /** Its scalar channels, the frame (time, distance, position) left out. */
  scalars: string[];
  /**
   * +1 when a positive steer channel turns the car the way `course` increases,
   * -1 when the game counts the other way round. Measured, not assumed.
   */
  steerSign: number;
  /**
   * +1 when the game's right-hand wheels belong on the right of a car drawn in
   * this world, -1 when the game's axes are mirrored against ours. Measured from
   * which side's suspension compresses on the outside of a turn.
   */
  wheelSide: number;
}

function wrap(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/**
 * The direction of travel from the positions, and the body's heading.
 *
 * Positions always agree with the world the lap is drawn in; a game's yaw
 * channel has its own zero and its own sense of rotation. So the yaw is used
 * only once it has been fitted to the direction of travel - sign and offset -
 * and only if it then agrees with it at speed. That keeps a slide visible
 * (body and travel apart) without trusting a convention.
 */
export function lapMotion(lap: LapTrace, s: Float32Array): LapMotion {
  const { x, z, speed } = lap.channels;
  const n = lap.count;
  const course = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    // A few metres either side, so a sample-to-sample wobble does not turn the car.
    let a = i;
    let b = i;
    while (a > 0 && Math.hypot(x[i] - x[a], z[i] - z[a]) < 2) a--;
    while (b < n - 1 && Math.hypot(x[b] - x[i], z[b] - z[i]) < 2) b++;
    const dx = x[b] - x[a];
    const dz = z[b] - z[a];
    if (Math.hypot(dx, dz) > 0.2) last = Math.atan2(dx, dz);
    course[i] = last;
  }
  let heading = course;
  const yaw = lap.channels.yaw;
  if (yaw) {
    let best: { sign: number; offset: number; spread: number } | null = null;
    for (const sign of [1, -1]) {
      // Circular mean of the difference, and how tightly it holds.
      let cx = 0;
      let cz = 0;
      let count = 0;
      for (let i = 0; i < n; i++) {
        if (!(speed?.[i] > 10)) continue;
        const d = course[i] - sign * yaw[i];
        cx += Math.cos(d);
        cz += Math.sin(d);
        count++;
      }
      if (count < 20) continue;
      const r = Math.hypot(cx, cz) / count;
      const offset = Math.atan2(cz, cx);
      if (!best || 1 - r < best.spread) best = { sign, offset, spread: 1 - r };
    }
    // 0.05 of circular variance is about 18 degrees of scatter: body and
    // travel agree well enough that the yaw means what we think it means.
    if (best && best.spread < 0.05) {
      heading = new Float32Array(n);
      for (let i = 0; i < n; i++) heading[i] = wrap(best.sign * yaw[i] + best.offset);
    }
  }
  const families = new Set<string>();
  for (const name of Object.keys(lap.channels)) {
    const dot = name.lastIndexOf('.');
    if (dot > 0 && (WHEELS as readonly string[]).includes(name.slice(dot + 1)))
      families.add(name.slice(0, dot));
  }
  let turn = 0;
  const steer = lap.channels.steer;
  if (steer) {
    for (let i = 1; i < n; i++) turn += steer[i] * wrap(course[i] - course[i - 1]);
  }
  // Turning towards increasing `course` puts the outside of the turn on the
  // frame's right, so the right-hand suspension is the compressed one.
  let side = 0;
  const fl = lap.channels['suspension.FL'];
  const fr = lap.channels['suspension.FR'];
  if (fl && fr) {
    for (let i = 1; i < n; i++) side += (fr[i] - fl[i]) * wrap(course[i] - course[i - 1]);
  }
  const mirrored = side !== 0 ? side < 0 : lap.game.startsWith('forza');
  const scalars = Object.keys(lap.channels).filter(
    (name) =>
      !families.has(splitChannel(name)[0]) && !['time', 'distance', 'x', 'y', 'z'].includes(name),
  );
  return {
    lap,
    course,
    heading,
    s,
    families: [...families],
    scalars,
    steerSign: turn < 0 ? -1 : 1,
    wheelSide: mirrored ? -1 : 1,
  };
}

/** Index of the last sample at or before time t, and the fraction to the next. */
function locate(time: Float32Array, t: number): [number, number] {
  const n = time.length;
  if (t <= time[0]) return [0, 0];
  if (t >= time[n - 1]) return [n - 1, 0];
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (time[mid] <= t) lo = mid;
    else hi = mid;
  }
  const span = time[hi] - time[lo];
  return [lo, span > 0 ? (t - time[lo]) / span : 0];
}

function lerpAngle(a: number, b: number, f: number): number {
  return a + wrap(b - a) * f;
}

/** A lap's state at its own time `t`, interpolated. */
export function stateAt(m: LapMotion, t: number): CarState {
  const c = m.lap.channels;
  const [i, f] = locate(c.time, t);
  const j = Math.min(m.lap.count - 1, i + 1);
  const at = (v: Float32Array | undefined, fallback = 0) =>
    v ? v[i] + (v[j] - v[i]) * f : fallback;
  const values: Record<string, number> = {};
  for (const name of m.scalars) {
    const v = c[name];
    values[name] = isStepped(name) ? v[f < 0.5 ? i : j] : v[i] + (v[j] - v[i]) * f;
  }
  const wheels: CarState['wheels'] = {};
  for (const family of m.families) {
    wheels[family] = WHEELS.map((w) => at(c[`${family}.${w}`], Number.NaN)) as [
      number,
      number,
      number,
      number,
    ];
  }
  return {
    x: at(c.x),
    y: at(c.y),
    z: at(c.z),
    heading: lerpAngle(m.heading[i], m.heading[j], f),
    course: lerpAngle(m.course[i], m.course[j], f),
    pitch: at(c.pitch),
    roll: at(c.roll),
    speed: at(c.speed),
    throttle: at(c.throttle),
    brake: at(c.brake),
    clutch: at(c.clutch, Number.NaN),
    handbrake: at(c.handbrake, Number.NaN),
    steer: at(c.steer),
    // Gears step; they do not blend.
    gear: c.gear ? c.gear[f < 0.5 ? i : j] : Number.NaN,
    time: Math.max(0, Math.min(t, c.time[m.lap.count - 1])),
    distance: m.s[i] + (m.s[j] - m.s[i]) * f,
    values,
    wheels,
    finished: t >= c.time[m.lap.count - 1],
  };
}

/**
 * Seconds each lap's own clock is ahead of the replay clock.
 *
 * In `anchor` mode the replay clock is the reference's time, and each lap is
 * shifted so it reaches `anchorS` metres at the same moment the reference does.
 */
export function replayOffsets(
  alignment: Alignment,
  mode: ReplayMode,
  anchorS: number,
): Map<string, number> {
  const out = new Map<string, number>();
  const ref = alignment.laps.find((l) => l.lap === alignment.reference);
  for (const l of alignment.laps) {
    let offset = 0;
    if (mode === 'anchor' && ref) {
      const mine = timeAt(l, alignment.grid, anchorS);
      const theirs = timeAt(ref, alignment.grid, anchorS);
      if (Number.isFinite(mine) && Number.isFinite(theirs)) offset = mine - theirs;
    }
    out.set(l.lap.id, offset);
  }
  return out;
}

/**
 * Each lap's own time at replay clock `clock`.
 *
 * `locked` puts every lap at the distance the reference has reached, so it
 * needs the alignment to turn a distance back into each lap's time.
 */
export function lapTimes(
  alignment: Alignment,
  mode: ReplayMode,
  clock: number,
  offsets: Map<string, number>,
): Map<string, number> {
  const out = new Map<string, number>();
  if (mode === 'locked') {
    const ref = alignment.laps.find((l) => l.lap === alignment.reference)!;
    const s = distanceAt(ref.channels.time, alignment.grid, clock);
    for (const l of alignment.laps) {
      const t = timeAt(l, alignment.grid, s);
      out.set(l.lap.id, Number.isFinite(t) ? t : clock);
    }
    return out;
  }
  for (const l of alignment.laps) out.set(l.lap.id, clock + (offsets.get(l.lap.id) ?? 0));
  return out;
}

/**
 * Each lap's own time at `s` metres along the reference: every car put where
 * it was when it got there. Laps that never reached `s` are left out.
 */
export function lapTimesAt(alignment: Alignment, s: number): Map<string, number> {
  const out = new Map<string, number>();
  for (const l of alignment.laps) {
    const t = timeAt(l, alignment.grid, s);
    if (Number.isFinite(t)) out.set(l.lap.id, t);
  }
  return out;
}

/**
 * Each lap's own time for this frame: at the charts' cursor while there is
 * one, otherwise wherever the replay clock puts it.
 */
export function frameTimes(
  alignment: Alignment,
  mode: ReplayMode,
  clock: number,
  offsets: Map<string, number>,
  hover: number | null,
): Map<string, number> {
  const times = lapTimes(alignment, mode, clock, offsets);
  if (hover === null) return times;
  for (const [id, t] of lapTimesAt(alignment, hover)) times.set(id, t);
  return times;
}

/** Grid distance at which a lap's aligned time reaches `t`. */
export function distanceAt(time: Float32Array, grid: Float32Array, t: number): number {
  let lo = -1;
  for (let i = 0; i < time.length; i++) {
    if (!Number.isFinite(time[i])) continue;
    if (time[i] <= t) lo = i;
    else {
      if (lo < 0) return grid[i];
      const f = (t - time[lo]) / (time[i] - time[lo]);
      return grid[lo] + (grid[i] - grid[lo]) * f;
    }
  }
  return lo >= 0 ? grid[lo] : 0;
}

/** Where on the reference each sample of a lap is, from the alignment's grid. */
export function sampleDistances(lap: LapTrace, alignment: Alignment): Float32Array {
  const aligned = alignment.laps.find((l) => l.lap === lap);
  const out = new Float32Array(lap.count);
  if (!aligned) return out;
  const time = aligned.channels.time;
  // The aligned time is monotone in distance, so a lap sample's distance is
  // where the aligned time reaches the sample's time.
  let g = aligned.first;
  for (let k = 0; k < lap.count; k++) {
    const t = lap.channels.time[k];
    while (g < aligned.last && time[g + 1] <= t) g++;
    const a = time[g];
    const b = time[Math.min(aligned.last, g + 1)];
    const f = b > a ? Math.max(0, Math.min(1, (t - a) / (b - a))) : 0;
    out[k] =
      alignment.grid[g] + (alignment.grid[Math.min(aligned.last, g + 1)] - alignment.grid[g]) * f;
  }
  return out;
}

/** The last `seconds` of some of a lap's channels up to its time `t`, for an input trace. */
export interface InputWindow {
  /** Seconds before `t`, 0 at the right-hand end, negative going back. */
  at: Float32Array;
  /** Each channel asked for that the lap has, sampled at `at`. */
  values: Record<string, Float32Array>;
  count: number;
}

export function inputWindow(
  lap: LapTrace,
  t: number,
  seconds: number,
  names: string[],
  points = 160,
): InputWindow {
  const time = lap.channels.time;
  const from = Math.max(0, t - seconds);
  const [a] = locate(time, from);
  const [b] = locate(time, t);
  const span = b - a + 1;
  const stride = Math.max(1, Math.ceil(span / points));
  const n = Math.ceil(span / stride) + 1;
  const present = names.filter((name) => lap.channels[name]);
  const out: InputWindow = { at: new Float32Array(n), values: {}, count: 0 };
  for (const name of present) out.values[name] = new Float32Array(n);
  const push = (i: number) => {
    const k = out.count++;
    out.at[k] = time[i] - t;
    for (const name of present) out.values[name][k] = lap.channels[name][i];
  };
  for (let i = a; i <= b; i += stride) push(i);
  // Always end on the sample at `t`, so the trace meets the live readout.
  if (out.count === 0 || out.at[out.count - 1] < time[b] - t) push(b);
  return out;
}
