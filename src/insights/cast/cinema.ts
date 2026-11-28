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
   * Move along with what is filmed: the eye and the look-at point shifted by
   * the subjects' own move since the last frame, so a fast unit is followed
   * without the springs' lag (and its ripple); the springs then only change
   * the framing.
   */
  carry(dx: number, dy: number, dz: number): void {
    if (!this.pos || !this.look) return;
    this.pos.x += dx;
    this.pos.y += dy;
    this.pos.z += dz;
    this.look.x += dx;
    this.look.y += dy;
    this.look.z += dz;
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
  // Most of the way in about two seconds even across the map: the replay waits while it moves.
  return Math.min(0.9, 0.35 + 0.15 * Math.log2(1 + r));
}

/** Whether a pose differs from the one set, beyond rounding: someone else moved the camera. */
export function poseMoved(a: Pose, b: Pose, scale: number): boolean {
  const dp = Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y, a.position.z - b.position.z);
  const df = Math.hypot(a.forward.x - b.forward.x, a.forward.y - b.forward.y, a.forward.z - b.forward.z);
  return dp > Math.max(1e-3, scale * 1e-4) || df > 1e-3;
}

/** A unit the camera frames: where it is and how big it is (its length, data units). */
export interface Subject extends Vec3 {
  size: number;
}

/** The view the shot is for: vertical field of view (degrees), width over height, height in pixels. */
export interface ViewSpec {
  fov: number;
  aspect: number;
  heightPx: number;
}

/**
 * A shot: where the camera stands, the point it looks at and the field of
 * view it wants. `single` circles one unit; `pair` looks at two from the side,
 * both in the picture and apart; `shoulder` stands behind the first (the
 * shooter) looking past it at the second, for two too far apart to both be
 * seen from the side.
 */
export interface Shot {
  kind: 'single' | 'pair' | 'shoulder';
  position: Vec3;
  look: Vec3;
  fov: number;
}

/** Field of view of each kind of shot, degrees: a little longer than the usual wide view, and longer still past a shooter's shoulder. */
export const SHOT_FOV = { single: 50, pair: 50, shoulder: 40 } as const;
/** Part of the picture's height a single unit fills. */
const SINGLE_FILL = 0.16;
/** Part of the picture's half-width (and half-height) two units and their size may take from the middle. */
const PAIR_FILL = 0.72;
/** Part of the field of view a shot past the shooter's shoulder is tipped down by, so the two sit above the subtitle. */
const LIFT = 0.1;
/** The widest field of view a shot takes, degrees. */
const MAX_FOV = 80;
/** Pixels a unit must at least be for a side view of two; smaller, and the camera goes behind the shooter. */
export const MIN_UNIT_PX = 14;
/** Degrees above the horizon the camera looks down from. */
/** Steep enough to see over houses and trees onto units on the ground. */
const SINGLE_ELEVATION = 34;
const PAIR_ELEVATION = 38;

const len = (x: number, y: number, z: number) => Math.hypot(x, y, z);
const tanHalf = (deg: number) => Math.tan((deg * Math.PI) / 360);

function lookFrom(look: Vec3, azimuth: number, elevationDeg: number, dist: number): Vec3 {
  const el = (elevationDeg * Math.PI) / 180;
  const f = { x: -Math.sin(azimuth) * Math.cos(el), y: -Math.sin(el), z: -Math.cos(azimuth) * Math.cos(el) };
  return { x: look.x - f.x * dist, y: look.y - f.y * dist, z: look.z - f.z * dist };
}

/** The angle between two directions from `from`, radians. */
function apart(from: Vec3, a: Vec3, b: Vec3): number {
  const ax = a.x - from.x, ay = a.y - from.y, az = a.z - from.z;
  const bx = b.x - from.x, by = b.y - from.y, bz = b.z - from.z;
  const c = (ax * bx + ay * by + az * bz) / Math.max(1e-12, len(ax, ay, az) * len(bx, by, bz));
  return Math.acos(Math.max(-1, Math.min(1, c)));
}

/**
 * The shot for the subjects now: one or two units (the first the one acting,
 * the second the one acted on). `azimuth` is where the camera is round them
 * now (radians, as `azimuthTo`): a single unit is circled from there, and a
 * pair seen from the side nearer to it, so a moving fight does not swing the
 * camera round. Distances follow from the field of view: a unit is never a
 * dot, and two are both in the picture. `was`, the kind of shot last frame:
 * a pair near the size limit keeps its kind rather than swing between the two.
 */
export function shotFor(subjects: Subject[], azimuth: number, view: ViewSpec, unitsPerMetre = 1, was: Shot['kind'] | null = null): Shot {
  const k = unitsPerMetre;
  if (!subjects.length) return { kind: 'single', position: lookFrom({ x: 0, y: 0, z: 0 }, azimuth, SINGLE_ELEVATION, 60 * k), look: { x: 0, y: 0, z: 0 }, fov: SHOT_FOV.single };
  const a = subjects[0];
  const b = subjects.length > 1 ? subjects[1] : null;
  const size = Math.max(a.size, b?.size ?? 0, 1e-6);
  const gap = b ? len(b.x - a.x, b.y - a.y, b.z - a.z) : 0;
  if (!b || gap < size) {
    const fov = SHOT_FOV.single;
    const c = b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 } : { x: a.x, y: a.y, z: a.z };
    const dist = Math.max(25 * k, size / (2 * tanHalf(fov) * SINGLE_FILL));
    return { kind: 'single', position: lookFrom(c, azimuth, SINGLE_ELEVATION, dist), look: c, fov };
  }
  // From the side: the view across the line between them, on the side the camera is on.
  const fov = SHOT_FOV.pair;
  const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
  const flat = Math.hypot(b.x - a.x, b.z - a.z);
  let side = azimuth;
  if (flat > 1e-9) {
    // Azimuth looking along the line, then a quarter turn either way: the one nearer the camera's own.
    const along = Math.atan2(-(b.x - a.x), -(b.z - a.z));
    const s1 = along + Math.PI / 2;
    const s2 = along - Math.PI / 2;
    const off = (x: number) => Math.abs(Math.atan2(Math.sin(x - azimuth), Math.cos(x - azimuth)));
    side = off(s1) <= off(s2) ? s1 : s2;
  }
  const tv = tanHalf(fov);
  const th = tv * view.aspect;
  const dist = Math.max(25 * k, (flat / 2 + size) / (PAIR_FILL * th), (Math.abs(b.y - a.y) / 2 + size) / (PAIR_FILL * tv));
  const px = (size / dist) * (view.heightPx / (2 * tv));
  const limit = MIN_UNIT_PX * (was === 'shoulder' ? 1.25 : was === 'pair' ? 0.8 : 1);
  if (px >= limit) return { kind: 'pair', position: lookFrom(c, side, PAIR_ELEVATION, dist), look: c, fov };

  // Too far apart for both to be seen from the side: behind the shooter, looking past it at the other.
  let sf: number = SHOT_FOV.shoulder;
  const ux = flat > 1e-9 ? (b.x - a.x) / flat : -Math.sin(azimuth);
  const uz = flat > 1e-9 ? (b.z - a.z) / flat : -Math.cos(azimuth);
  let back = 4 * a.size + 12 * k;
  let pos = { x: a.x, y: a.y, z: a.z };
  let fwd = { x: ux, y: 0, z: uz };
  let gapAngle = 0;
  for (let i = 0; i < 4; i++) {
    pos = { x: a.x - ux * back, y: a.y + back * 0.35, z: a.z - uz * back };
    const da = { x: a.x - pos.x, y: a.y - pos.y, z: a.z - pos.z };
    const db = { x: b.x - pos.x, y: b.y - pos.y, z: b.z - pos.z };
    const na = len(da.x, da.y, da.z);
    const nb = len(db.x, db.y, db.z);
    fwd = { x: da.x / na + db.x / nb, y: da.y / na + db.y / nb, z: da.z / na + db.z / nb };
    // Both inside the picture with a margin: the angle between them within most of the field of view.
    gapAngle = (apart(pos, a, b) * 180) / Math.PI;
    if (gapAngle <= sf * 0.7) break;
    back *= 1.5;
  }
  // Still too far apart (an aircraft high above the shooter): a wider view rather than further back.
  sf = Math.min(MAX_FOV, Math.max(sf, gapAngle / 0.7));
  // Between the two, the view tipped down a little: the pair sits higher in the picture, the shooter clear of the subtitle at the bottom.
  const n = len(fwd.x, fwd.y, fwd.z) || 1;
  const f = { x: fwd.x / n, y: fwd.y / n, z: fwd.z / n };
  const upx = -f.y * f.x;
  const upy = 1 - f.y * f.y;
  const upz = -f.y * f.z;
  const un = len(upx, upy, upz) || 1;
  const tip = Math.tan(((sf * LIFT) * Math.PI) / 180);
  const g = { x: f.x - (upx / un) * tip, y: f.y - (upy / un) * tip, z: f.z - (upz / un) * tip };
  const gn = len(g.x, g.y, g.z) || 1;
  const reach = len(a.x - pos.x, a.y - pos.y, a.z - pos.z);
  return { kind: 'shoulder', position: pos, look: { x: pos.x + (g.x / gn) * reach, y: pos.y + (g.y / gn) * reach, z: pos.z + (g.z / gn) * reach }, fov: sf };
}

/**
 * Height to add to the camera's target while it is still far from it: a long
 * move rises over the ground and comes down onto the shot, rather than
 * skimming through hills and houses. Nothing once it is near.
 */
export function craneLift(remaining: number, framing: number): number {
  const over = Math.max(0, remaining - 2 * framing);
  return Math.min(0.25 * over, 10 * framing);
}

/** Pixels across a unit of `size` at `distance`, for the vertical field of view and the view's height. */
export function pixelsAcross(size: number, distance: number, fovDeg: number, heightPx: number): number {
  return (size / Math.max(1e-9, distance)) * (heightPx / (2 * tanHalf(fovDeg)));
}

/** The field of view a step closer to `target`: eased, `smooth` seconds for most of the way. */
export function easeFov(cur: number, target: number, dt: number, smooth = 0.6): number {
  return cur + (target - cur) * (1 - Math.exp(-dt / Math.max(1e-3, smooth)));
}
