/**
 * The caster's camera: where it should be for a moment, and how it gets
 * there without a cut. Pure camera math, driven a frame at a time by the
 * caster's overlay (ui/insights/CasterCinema.tsx).
 *
 * Each frame asks for a pose that frames the moment's subjects - the player
 * and the other party, where they are now - from a slowly orbiting angle, at a
 * distance that fits both and an elevation that looks down on them. The
 * camera never jumps to it: its position and the point it looks at each
 * follow their target through a critically damped spring, so a new moment
 * across the map is a dolly that accelerates and settles, and the orbit
 * round a fight is a smooth drift. Nothing here snaps.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Pose {
  position: Vec3;
  forward: Vec3;
}

export interface FramingOptions {
  /** Data units in a metre. */
  unitsPerMetre: number;
  /** Closest the camera frames a single subject, metres. */
  minDistance: number;
  /** Degrees above the horizon it looks down from. */
  elevation: number;
  /** How much of the subjects' spread the distance adds, a factor. */
  spreadFactor: number;
}

export const FRAMING_DEFAULTS: FramingOptions = { unitsPerMetre: 1, minDistance: 60, elevation: 24, spreadFactor: 1.7 };

/** Degrees a second the camera circles a moment's subjects. */
export const ORBIT_DEG_S = 6;

/** The middle of the subjects and how far apart they are, data units. */
export function subjectsCentre(points: Vec3[]): { centre: Vec3; spread: number } {
  if (!points.length) return { centre: { x: 0, y: 0, z: 0 }, spread: 0 };
  const c = { x: 0, y: 0, z: 0 };
  for (const p of points) {
    c.x += p.x / points.length;
    c.y += p.y / points.length;
    c.z += p.z / points.length;
  }
  let spread = 0;
  for (const p of points) spread = Math.max(spread, 2 * Math.hypot(p.x - c.x, p.y - c.y, p.z - c.z));
  return { centre: c, spread };
}

/**
 * Where the camera should stand to frame `centre` with `spread` around it,
 * looking along `azimuth` (radians, 0 looking towards -z, as the camera's yaw).
 */
export function framingPose(centre: Vec3, spread: number, azimuth: number, o: FramingOptions = FRAMING_DEFAULTS): Pose {
  const dist = Math.max(o.minDistance * o.unitsPerMetre, spread * o.spreadFactor);
  const el = (o.elevation * Math.PI) / 180;
  const f = { x: -Math.sin(azimuth) * Math.cos(el), y: -Math.sin(el), z: -Math.cos(azimuth) * Math.cos(el) };
  return { position: { x: centre.x - f.x * dist, y: centre.y - f.y * dist, z: centre.z - f.z * dist }, forward: f };
}

/** The camera's azimuth towards a point: the heading it has now, kept across a cut so a move does not swing round. */
export function azimuthTo(from: Vec3, to: Vec3, fallback: number): number {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  return Math.hypot(dx, dz) > 1e-9 ? Math.atan2(-dx, -dz) : fallback;
}

/** One axis of a critically damped spring (Game Programming Gems 4, 1.10). Returns the new value; `v[i]` is its velocity. */
function damp(cur: number, target: number, v: Float64Array, i: number, smooth: number, dt: number, maxSpeed: number): number {
  const omega = 2 / Math.max(1e-4, smooth);
  const x = omega * dt;
  const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = cur - target;
  const maxChange = maxSpeed * smooth;
  if (Math.abs(change) > maxChange) change = Math.sign(change) * maxChange;
  const to = cur - change;
  const temp = (v[i] + omega * change) * dt;
  v[i] = (v[i] - omega * temp) * e;
  let out = to + (change + temp) * e;
  // No overshoot past the target.
  if (target - cur > 0 === out > target) {
    out = target;
    v[i] = 0;
  }
  return out;
}

/**
 * The camera's position and its look-at point, each on a critically damped
 * spring: `step` moves them towards a target pose and returns the pose to set.
 */
export class CameraSpring {
  private pos: Vec3 | null = null;
  private look: Vec3 | null = null;
  private readonly vp = new Float64Array(3);
  private readonly vl = new Float64Array(3);

  /** Start from where the camera is, at rest. `lookDistance`: how far ahead its look-at point is. */
  reset(from: Pose, lookDistance: number): void {
    this.pos = { ...from.position };
    this.look = { x: from.position.x + from.forward.x * lookDistance, y: from.position.y + from.forward.y * lookDistance, z: from.position.z + from.forward.z * lookDistance };
    this.vp.fill(0);
    this.vl.fill(0);
  }

  get started(): boolean {
    return this.pos !== null;
  }

  /**
   * Towards `target` looking at `at`, `dt` seconds on. `smooth` is the spring's
   * time (about the time to cover most of the way); `maxSpeed` caps the
   * position's speed, data units a second.
   */
  step(target: Pose, at: Vec3, dt: number, smooth: number, maxSpeed = Infinity): Pose {
    if (!this.pos || !this.look) throw new Error('CameraSpring.step before reset');
    const p = this.pos;
    const l = this.look;
    p.x = damp(p.x, target.position.x, this.vp, 0, smooth, dt, maxSpeed);
    p.y = damp(p.y, target.position.y, this.vp, 1, smooth, dt, maxSpeed);
    p.z = damp(p.z, target.position.z, this.vp, 2, smooth, dt, maxSpeed);
    // The eye leads, the look follows a little quicker so the subject stays in the middle.
    l.x = damp(l.x, at.x, this.vl, 0, smooth * 0.7, dt, Infinity);
    l.y = damp(l.y, at.y, this.vl, 1, smooth * 0.7, dt, Infinity);
    l.z = damp(l.z, at.z, this.vl, 2, smooth * 0.7, dt, Infinity);
    let fx = l.x - p.x;
    let fy = l.y - p.y;
    let fz = l.z - p.z;
    const n = Math.hypot(fx, fy, fz) || 1;
    fx /= n;
    fy /= n;
    fz /= n;
    // Never straight down: a view along the vertical has no heading.
    if (fy < -0.97) {
      const h = Math.hypot(fx, fz) || 1;
      const k = Math.sqrt(1 - 0.97 * 0.97) / h;
      fx *= k;
      fz *= k;
      fy = -0.97;
    }
    return { position: { ...p }, forward: { x: fx, y: fy, z: fz } };
  }
}

/** How long the spring takes for a move of `distance` (data units) against the framing distance: longer moves glide longer. */
export function smoothFor(distance: number, framing: number): number {
  const r = distance / Math.max(1e-9, framing);
  return Math.min(1.6, 0.45 + 0.25 * Math.log2(1 + r));
}

/** Whether a pose differs from the one set, beyond rounding: someone else moved the camera. */
export function poseMoved(a: Pose, b: Pose, scale: number): boolean {
  const dp = Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y, a.position.z - b.position.z);
  const df = Math.hypot(a.forward.x - b.forward.x, a.forward.y - b.forward.y, a.forward.z - b.forward.z);
  return dp > Math.max(1e-3, scale * 1e-4) || df > 1e-3;
}
