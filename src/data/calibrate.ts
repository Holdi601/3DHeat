import type { Bounds, Dataset } from '../state/types';

export interface Calibration {
  radius: number;
  saturation: number;
  cubeSize: number;
  lookLength: number;
  flySpeed: number;
  far: number;
  near: number;
}

export function horizontalExtent(b: Bounds): number {
  const dx = b.maxX - b.minX;
  const dz = b.maxZ - b.minZ;
  const span = Math.max(dx, dz);
  return Number.isFinite(span) && span > 0 ? span : 100;
}

/**
 * Pick starting values from the dataset's own scale.
 *
 * Without this the tool looks broken on first load: a 6m sprite radius on an 8km
 * map is sub-pixel, so every sprite clamps to one pixel and the accumulated heat
 * blows straight past any fixed saturation point into flat white. The right
 * defaults are all proportional to the extent of the data.
 */
export function calibrate(dataset: Dataset): Calibration {
  const extent = horizontalExtent(dataset.bounds);
  // Large enough that adjacent samples along a path merge into a blob rather
  // than reading as a hairline — the difference between a heatmap and a plot.
  const radius = extent / 120;
  return {
    radius,
    saturation: estimateSaturation(dataset.count, radius, 1, dataset.bounds),
    // A box the size of what it stands for, where the data says how big that
    // is: a fraction of the extent is a guess that makes a player on a CS2 map
    // two pixels wide.
    cubeSize: dataset.entitySize ?? extent / 500,
    lookLength: dataset.entitySize ? dataset.entitySize * 4 : extent / 200,
    flySpeed: extent / 12,
    far: extent * 12,
    near: Math.max(0.05, extent / 20000),
  };
}

/**
 * Widen a frustum until a level of this size fits inside it.
 *
 * `calibrate` sizes the frustum from the dataset, which is the right source
 * while the dataset is the biggest thing in the scene. An imported game map is
 * not: the test level is several kilometres across, and framing that at a 65
 * degree field of view puts the camera hundreds of thousands of units back —
 * many times the 40k default far plane, so the entire map renders behind it and
 * the viewport is simply empty.
 *
 * Near moves with far rather than staying put, because it is the *ratio* that
 * sets depth precision, and the heat occlusion test compares window depths. A
 * near plane of half a unit against a far plane of a million leaves nothing
 * behind the decimal point to compare.
 *
 * Returns the same object when nothing needs to change, so this can sit in a
 * store update without causing a re-render.
 */
export function cameraForExtent<T extends { near: number; far: number; flySpeed: number }>(
  camera: T,
  bounds: Bounds,
): T {
  const extent = horizontalExtent(bounds);
  // Three times the extent: enough to hold the framing distance for any field
  // of view the UI offers, plus the depth of the level behind the focal point.
  const far = extent * 3;
  if (far <= camera.far) return camera;
  return {
    ...camera,
    far,
    near: Math.max(camera.near, far / 100_000),
    flySpeed: Math.max(camera.flySpeed, extent / 12),
  };
}

/**
 * Analytic guess at the accumulated heat that should map to the top of the ramp.
 *
 * Mean heat over the footprint is exactly `rows × (sprite area / footprint area)
 * × mean(ramp)`, and for a linear centre-to-edge ramp the disc-averaged ramp
 * value is 1/3. Real telemetry clusters hard, so the interesting peaks run well
 * above the mean — hence the multiplier. It only has to land within an order of
 * magnitude, because the slider that follows is logarithmic.
 */
export function estimateSaturation(
  rows: number,
  radius: number,
  centerIntensity: number,
  bounds: Bounds,
  peakOverMean = 25,
): number {
  const dx = Math.max(1, bounds.maxX - bounds.minX);
  const dz = Math.max(1, bounds.maxZ - bounds.minZ);
  const area = dx * dz;
  const spriteArea = Math.PI * radius * radius;
  const mean = rows * (spriteArea / area) * (1 / 3) * Math.max(1e-6, centerIntensity);
  return clamp(mean * peakOverMean, 0.1, 1e6);
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
