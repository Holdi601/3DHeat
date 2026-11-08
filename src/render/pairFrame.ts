/**
 * The two-unit views' framing: the camera on one unit, kept on a second one,
 * Tacview's target and padlock views. Pure math for the follow rig
 * (followRig.ts), kept apart so it can be tested.
 *
 * The direction the camera keeps follows the units exactly while they move
 * smoothly. Where it would jump - a second unit that passes close behind,
 * above or under the first, a newly picked one - it swings there with a time
 * constant instead, never snapped, and is exact again once it caught up. A
 * second unit that is lost (destroyed, gone from the recording) is still
 * looked at where it was last for a moment, then the view eases back to the
 * plain follow.
 *
 * In the display's frame: x east, y up, -z north.
 */

export type Vec3 = [number, number, number];

/** How long a lost second unit is still looked at where it was last, seconds. */
export const HOLD_LOST = 2.5;
/** The time constant the target view swings with, seconds. */
export const SWING_TAU = 0.35;
/** The padlock's quicker one: the head follows the target, it does not drift after it. */
export const PADLOCK_TAU = 0.12;
/** How far the eye may sit below the unit, and above it, as seen from it (radians). */
export const EYE_EL_MIN = -0.3;
export const EYE_EL_MAX = 1.15;
/** The lift of the eye above the line through both units, as a share of the distance. */
export const EYE_LIFT = 0.18;
/** A turn in one frame bigger than this (radians) is a jump, swung rather than followed. */
export const JUMP = (1.5 * Math.PI) / 180;
/** Caught up again within this (radians). */
const SETTLED = (0.1 * Math.PI) / 180;

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const add = (a: Vec3, b: Vec3, k = 1): Vec3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
function norm(a: Vec3, fallback: Vec3 = [0, 0, -1]): Vec3 {
  const l = len(a);
  return l > 1e-12 ? [a[0] / l, a[1] / l, a[2] / l] : fallback;
}

/** `v` turned by `angle` about the unit axis `axis` (Rodrigues). */
function turn(v: Vec3, axis: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const k = dot(axis, v) * (1 - c);
  const x = cross(axis, v);
  return [v[0] * c + x[0] * s + axis[0] * k, v[1] * c + x[1] * s + axis[1] * k, v[2] * c + x[2] * s + axis[2] * k];
}

/**
 * The unit vector `from` turned towards the unit vector `to` by the share `f`
 * (0 none, 1 all the way) of the angle between them. Opposite vectors turn
 * about the vertical, so a unit that passes straight behind swings the view
 * round level rather than over the top.
 */
export function turnToward(from: Vec3, to: Vec3, f: number): Vec3 {
  const k = Math.max(0, Math.min(1, f));
  const angle = Math.acos(Math.max(-1, Math.min(1, dot(from, to))));
  if (angle < 1e-6 || k >= 1) return to;
  let axis = cross(from, to);
  if (len(axis) < 1e-6) {
    // Opposite: the world's up, squared to the direction, else east.
    axis = add([0, 1, 0], from, -from[1]);
    if (len(axis) < 1e-6) axis = [1, 0, 0];
  }
  return norm(turn(from, norm(axis), angle * k));
}

/** The share of the way to go this frame for a time constant: 1 - e^(-dt/tau). */
export function easeShare(dt: number, tau: number): number {
  if (!(dt > 0)) return 0;
  return 1 - Math.exp(-dt / Math.max(1e-3, tau));
}

/** What the framing carries from frame to frame. */
export interface PairState {
  /** The direction kept: from the first unit towards the second (target), or the look (padlock). */
  dir: Vec3 | null;
  /** Still swinging after a jump. */
  swinging: boolean;
  /** How much the second unit counts, 0 to 1: eased in when picked, out when lost. */
  w: number;
  /** Where the second unit was last seen, and how long ago, seconds. */
  lastB: Vec3 | null;
  lostFor: number;
}

export function pairState(): PairState {
  return { dir: null, swinging: false, w: 0, lastB: null, lostFor: 0 };
}

const angle = (a: Vec3, b: Vec3) => Math.acos(Math.max(-1, Math.min(1, dot(a, b))));

/** The kept direction this frame: `want` outright, or swung towards it after a jump. */
function keep(s: PairState, want: Vec3, dt: number, tau: number): Vec3 {
  if (s.dir === null) return want;
  if (!s.swinging && angle(s.dir, want) > JUMP) s.swinging = true;
  if (!s.swinging) return want;
  const next = turnToward(s.dir, want, easeShare(dt, tau));
  if (angle(next, want) < SETTLED) {
    s.swinging = false;
    return want;
  }
  return next;
}

/** The second unit's weight eased towards `to`, exact once near. */
function weigh(s: PairState, to: number, dt: number, tau: number, first: boolean): number {
  if (first) return to;
  const w = s.w + (to - s.w) * easeShare(dt, tau);
  return Math.abs(to - w) < 1e-3 ? to : w;
}

/**
 * The second unit to frame this frame: where it is, else where it was last
 * seen while that is recent, else none (the view goes back to the plain
 * follow).
 */
export function heldTarget(s: PairState, b: Vec3 | null, dt: number): Vec3 | null {
  if (b) {
    s.lastB = b;
    s.lostFor = 0;
    return b;
  }
  s.lostFor += Math.max(0, dt);
  // Kept past the hold, so the look can ease off it rather than jump.
  return s.lastB && s.lostFor <= HOLD_LOST ? s.lastB : null;
}

/** `dir` with its elevation kept between `min` and `max`; a near vertical one takes `level`'s heading. */
export function clampElevation(dir: Vec3, min: number, max: number, level: Vec3): Vec3 {
  const el = Math.asin(Math.max(-1, Math.min(1, dir[1])));
  const c = Math.max(min, Math.min(max, el));
  if (c === el && Math.hypot(dir[0], dir[2]) > 1e-3) return dir;
  let h: Vec3 = [dir[0], 0, dir[2]];
  if (len(h) < 1e-3) h = [level[0], 0, level[2]];
  const hn = norm(h);
  return [hn[0] * Math.cos(c), Math.sin(c), hn[2] * Math.cos(c)];
}

/**
 * The target view: behind the first unit `a` on the line from the second `b`,
 * a little above, looking between them so both are on screen. Without a
 * second unit, behind the nose `fwd` looking at the unit. `dt` is the time
 * since the last frame (0 places it outright).
 */
export function framePair(
  s: PairState,
  a: Vec3,
  fwd: Vec3,
  b: Vec3 | null,
  distance: number,
  dt: number,
): { eye: Vec3; look: Vec3; b: Vec3 | null } {
  const held = heldTarget(s, b, dt);
  const first = s.dir === null;
  // Where the camera wants to look along: at the second unit, else along the nose.
  const want = held && len(add(held, a, -1)) > 1e-9 ? norm(add(held, a, -1)) : norm(fwd);
  s.dir = keep(s, want, dt, SWING_TAU);
  s.w = weigh(s, held ? 1 : 0, dt, SWING_TAU, first);
  // The eye behind the first unit, not far under it nor straight over it.
  const back = clampElevation([-s.dir[0], -s.dir[1], -s.dir[2]], EYE_EL_MIN, EYE_EL_MAX, [-fwd[0], -fwd[1], -fwd[2]]);
  const eye = add(add(a, back, distance), [0, 1, 0], distance * EYE_LIFT);
  const toA = norm(add(a, eye, -1));
  // Between the two, as far as the second one counts: both in the picture.
  const bAt = held ?? s.lastB;
  const toB = bAt ? norm(add(bAt, eye, -1)) : toA;
  const look = norm(add(toA, toB, s.w), toA);
  return { eye, look, b: held };
}

/**
 * The padlock: from the eye `eye`, the head kept on the second unit, eased,
 * and back along the nose `fwd` once it is lost.
 */
export function framePadlock(s: PairState, eye: Vec3, fwd: Vec3, b: Vec3 | null, dt: number): Vec3 {
  const held = heldTarget(s, b, dt);
  const want = held && len(add(held, eye, -1)) > 1e-9 ? norm(add(held, eye, -1)) : norm(fwd);
  s.w = held ? 1 : 0;
  s.dir = keep(s, want, dt, PADLOCK_TAU);
  return s.dir;
}
