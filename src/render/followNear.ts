/**
 * The near plane a followed unit needs. A streamed world's views keep the
 * near plane out at up to 10 m for depth precision over a 1,500 km reach
 * (`STREAM_NEAR_CAP`), which cuts away a 4 m missile or a 15 m jet the chase
 * camera follows from closer than that: it simply vanishes. While a unit is
 * followed the plane comes in to a tenth of the camera's distance to it, so
 * however close the camera zooms the unit stays whole, and only as far in as
 * that distance asks, so the depth far off loses no more than it must.
 */

/** Never nearer than this many metres: 24-bit depth over a theatre's reach has to stop somewhere. */
export const FOLLOW_NEAR_MIN_M = 0.05;
/** The share of the camera's distance to the followed unit the near plane may be. */
export const FOLLOW_NEAR_SHARE = 0.1;

/**
 * The near plane for a view whose own is `near`, with a unit followed at
 * `unit` (null: none) from a camera at `eye`; `units` data units a metre.
 */
export function nearForFollow(near: number, eye: ArrayLike<number>, unit: ArrayLike<number> | null, units: number): number {
  if (!unit) return near;
  const d = Math.hypot(eye[0] - unit[0], eye[1] - unit[1], eye[2] - unit[2]);
  if (!Number.isFinite(d)) return near;
  return Math.min(near, Math.max(FOLLOW_NEAR_MIN_M * units, FOLLOW_NEAR_SHARE * d));
}
