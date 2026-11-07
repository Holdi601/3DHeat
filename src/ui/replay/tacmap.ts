/**
 * The 2D tactical map's arithmetic: world to map and back, north up (world
 * -z), and how a view is framed and zoomed.
 */

export interface MapView {
  /** The world point at the map's middle (data units). */
  cx: number;
  cz: number;
  /** Data units a pixel. */
  upp: number;
}

/** A world point on the map, CSS pixels from its top left. */
export function toMap(v: MapView, w: number, h: number, x: number, z: number): [number, number] {
  return [w / 2 + (x - v.cx) / v.upp, h / 2 + (z - v.cz) / v.upp];
}

/** A map pixel in the world (x, z). */
export function fromMap(
  v: MapView,
  w: number,
  h: number,
  px: number,
  py: number,
): [number, number] {
  return [v.cx + (px - w / 2) * v.upp, v.cz + (py - h / 2) * v.upp];
}

/** The view that shows a box (world x and z) whole in w x h pixels, with a margin. */
export function frameBox(
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  w: number,
  h: number,
  margin = 0.08,
): MapView {
  const sx = Math.max(1e-6, maxX - minX);
  const sz = Math.max(1e-6, maxZ - minZ);
  const upp = Math.max(sx / Math.max(1, w), sz / Math.max(1, h)) * (1 + 2 * margin);
  return { cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2, upp };
}

/** Zoom by `f` (above 1 out) keeping the world point under pixel (px, py) where it is. */
export function zoomAt(
  v: MapView,
  w: number,
  h: number,
  px: number,
  py: number,
  f: number,
): MapView {
  const [x, z] = fromMap(v, w, h, px, py);
  const upp = v.upp * f;
  return { upp, cx: x - (px - w / 2) * upp, cz: z - (py - h / 2) * upp };
}

/** A heading (radians from north, clockwise) as a direction on the map (x right, y down). */
export function headingOnMap(yaw: number): [number, number] {
  return [Math.sin(yaw), -Math.cos(yaw)];
}
