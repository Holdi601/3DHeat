/**
 * Keyframed camera paths.
 *
 * A path is a handful of poses placed along a normalised axis `u`, from 0 at the
 * start of the render to 1 at the end. Both the camera *and* the playhead are
 * driven from that one axis, so a render is one sweep: the camera moves along the
 * path while the data plays through the window, and the two cannot drift apart.
 *
 * Interpolation is cubic Hermite with finite-difference tangents rather than
 * plain Catmull-Rom, because keyframes are placed by hand and are never evenly
 * spaced. Uniform Catmull-Rom on uneven spacing produces a visible lurch at
 * every key — the curve is continuous but its speed is not — which on a camera
 * reads as the operator flinching.
 */

/** Degrees, world units. Matches what the camera reports and accepts. */
export interface Keyframe {
  /** Where along the render this pose is reached, 0..1. */
  u: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  fov: number;
}

export type Pose = Omit<Keyframe, 'u'>;

/** Straight lines between keys, or a smooth curve through them. */
export type PathEasing = 'linear' | 'smooth';

/**
 * The pose at `u`, or null if the path has no keys.
 *
 * Outside the first and last key the endpoint pose is held rather than
 * extrapolated: a cubic run off the end of its data accelerates without bound,
 * and a camera that flies to infinity for the first tenth of a render is not a
 * useful reading of "before the path starts".
 */
export function poseAt(keys: Keyframe[], u: number, easing: PathEasing = 'smooth'): Pose | null {
  const k = prepare(keys);
  if (k.length === 0) return null;
  if (k.length === 1) return strip(k[0]);

  const t = Math.min(k[k.length - 1].u, Math.max(k[0].u, u));
  let i = 0;
  while (i < k.length - 2 && k[i + 1].u <= t) i++;
  const a = k[i];
  const b = k[i + 1];
  const h = b.u - a.u;
  const s = h > 1e-9 ? (t - a.u) / h : 0;

  if (easing === 'linear') {
    return {
      x: a.x + (b.x - a.x) * s,
      y: a.y + (b.y - a.y) * s,
      z: a.z + (b.z - a.z) * s,
      yaw: a.yaw + (b.yaw - a.yaw) * s,
      pitch: a.pitch + (b.pitch - a.pitch) * s,
      fov: a.fov + (b.fov - a.fov) * s,
    };
  }

  // Hermite basis. `h` scales the tangents back into segment-local units, which
  // is what makes uneven key spacing behave.
  const s2 = s * s;
  const s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1;
  const h10 = s3 - 2 * s2 + s;
  const h01 = -2 * s3 + 3 * s2;
  const h11 = s3 - s2;
  const chan = (get: (f: Keyframe) => number) => {
    const ma = tangent(k, i, get);
    const mb = tangent(k, i + 1, get);
    return h00 * get(a) + h10 * h * ma + h01 * get(b) + h11 * h * mb;
  };
  return {
    x: chan((f) => f.x),
    y: chan((f) => f.y),
    z: chan((f) => f.z),
    yaw: chan((f) => f.yaw),
    pitch: chan((f) => f.pitch),
    // Field of view stays linear. A cubic through it overshoots, and an overshoot
    // in fov is a visible lens breath at every key even when the motion is
    // perfectly smooth.
    fov: a.fov + (b.fov - a.fov) * s,
  };
}

/**
 * Finite-difference tangent, one-sided at the ends.
 *
 * Divided by the span it covers, so a key with a long segment on one side and a
 * short one on the other does not get a tangent dominated by the long side.
 */
function tangent(k: Keyframe[], i: number, get: (f: Keyframe) => number): number {
  const prev = k[i - 1];
  const next = k[i + 1];
  const here = k[i];
  if (!prev) return next ? (get(next) - get(here)) / Math.max(1e-9, next.u - here.u) : 0;
  if (!next) return (get(here) - get(prev)) / Math.max(1e-9, here.u - prev.u);
  return (get(next) - get(prev)) / Math.max(1e-9, next.u - prev.u);
}

/**
 * Sort by `u` and unwrap the yaw sequence.
 *
 * Unwrapping is the part that matters. Yaw comes off the camera as any value at
 * all, so a path that turns right past north reads as 350° then 10° — and a
 * plain interpolation between those two spins the camera 340° the wrong way,
 * through everything the shot was avoiding. Adding whole turns until consecutive
 * keys differ by less than half a turn makes the short way the interpolated one.
 *
 * The cost is that a deliberate full spin cannot be expressed as one 720° key; it
 * needs intermediate keys. That is the right trade — an accidental reverse spin
 * is a ruined render, an extra keyframe is a keystroke.
 */
export function prepare(keys: Keyframe[]): Keyframe[] {
  const k = keys
    .filter((f) => Number.isFinite(f.u) && Number.isFinite(f.x) && Number.isFinite(f.yaw))
    .map((f) => ({ ...f }))
    .sort((a, b) => a.u - b.u);
  for (let i = 1; i < k.length; i++) {
    const d = k[i].yaw - k[i - 1].yaw;
    k[i].yaw -= Math.round(d / 360) * 360;
  }
  return k;
}

function strip(f: Keyframe): Pose {
  return { x: f.x, y: f.y, z: f.z, yaw: f.yaw, pitch: f.pitch, fov: f.fov };
}

/**
 * Total length of the path in world units, sampled.
 *
 * For the readout that says how far the camera travels and therefore how fast it
 * is moving — the one number that tells you whether a render will look like a
 * flythrough or like a teleport, before spending minutes on it.
 */
export function pathLength(keys: Keyframe[], easing: PathEasing = 'smooth', steps = 240): number {
  const k = prepare(keys);
  if (k.length < 2) return 0;
  let total = 0;
  let prev = poseAt(k, 0, easing)!;
  for (let i = 1; i <= steps; i++) {
    const p = poseAt(k, i / steps, easing)!;
    total += Math.hypot(p.x - prev.x, p.y - prev.y, p.z - prev.z);
    prev = p;
  }
  return total;
}
