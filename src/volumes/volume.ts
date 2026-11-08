/**
 * Volumes: regions of the world drawn by the user to measure, filter and export
 * the data inside them.
 *
 * Pure and framework-free, so the heat shaders, the replay, the hit analysis,
 * the statistics and the export all ask the same question the same way. Every
 * coordinate is a dataset world coordinate - `Dataset.px/py/pz`, the load's axis
 * mapping applied, y up - never a mirrored display coordinate.
 *
 * Shapes:
 *   box       a cuboid, turned by yaw (about up), pitch and roll
 *   prism     a polygon on the ground (any outline: rectangle, regular n-gon,
 *             free polygon) extruded between a floor and a ceiling height
 *   sphere    a ball
 *   cylinder  an upright cylinder between a floor and a ceiling height
 *
 * Several volumes combine by their role: a point is selected when it is in any
 * `include` volume (or there is none) and in no `exclude` volume. Hidden volumes
 * take no part.
 */

export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

export type VolumeShape =
  | { kind: 'box'; center: Vec3; size: Vec3; yaw: number; pitch: number; roll: number }
  | { kind: 'prism'; points: Vec2[]; floor: number; ceil: number; sides?: number }
  | { kind: 'sphere'; center: Vec3; radius: number }
  | { kind: 'cylinder'; x: number; z: number; radius: number; floor: number; ceil: number };

export type VolumeKind = VolumeShape['kind'];
export type VolumeOp = 'include' | 'exclude';

export interface Volume {
  id: string;
  name: string;
  /** #rrggbb */
  color: string;
  visible: boolean;
  op: VolumeOp;
  shape: VolumeShape;
}

/** How the volumes filter what is drawn: not at all, only the selection, or all but it. */
export type VolumeFilter = 'off' | 'inside' | 'outside';

/** The palette new volumes cycle through: distinct from the heat ramp and the team hues' first picks. */
export const VOLUME_COLORS = ['#38bdf8', '#f472b6', '#a3e635', '#fbbf24', '#c084fc', '#2dd4bf', '#fb7185', '#e2e8f0'];

// ---------------------------------------------------------------------------
// Compiled form: one world->unit transform per volume, for fast tests.

/**
 * A volume reduced to a test: `m` maps a world point into the shape's unit space
 * (3 rows of 4), `code` says which unit test applies, and the axis-aligned bounds
 * reject most points before any arithmetic.
 *
 * Unit tests: 1 box |u|<=1 per axis; 2 sphere |u|<=1; 3 cylinder |u.xz|<=1 and
 * |u.y|<=1; 4 prism |u.y|<=1 and (u.x, u.z) inside `poly` (world x, z).
 */
export interface CompiledVolume {
  code: 1 | 2 | 3 | 4;
  m: Float64Array;
  poly: Float64Array | null;
  min: Vec3;
  max: Vec3;
}

export const SHAPE_CODE: Record<VolumeKind, 1 | 2 | 3 | 4> = { box: 1, sphere: 2, cylinder: 3, prism: 4 };

/** Rotation matrix (column vectors as rows of the result): R = Ry(yaw) Rx(pitch) Rz(roll). */
export function boxRotation(yaw: number, pitch: number, roll: number): number[] {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  // Ry * Rx * Rz, row-major 3x3.
  return [
    cy * cr + sy * sp * sr, -cy * sr + sy * sp * cr, sy * cp,
    cp * sr, cp * cr, -sp,
    -sy * cr + cy * sp * sr, sy * sr + cy * sp * cr, cy * cp,
  ];
}

/** The box's eight corners in world space. */
export function boxCorners(s: Extract<VolumeShape, { kind: 'box' }>): Vec3[] {
  const r = boxRotation(s.yaw, s.pitch, s.roll);
  const out: Vec3[] = [];
  for (const dy of [-1, 1])
    for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const lx = (dx * s.size[0]) / 2;
      const ly = (dy * s.size[1]) / 2;
      const lz = (dz * s.size[2]) / 2;
      out.push([
        s.center[0] + r[0] * lx + r[1] * ly + r[2] * lz,
        s.center[1] + r[3] * lx + r[4] * ly + r[5] * lz,
        s.center[2] + r[6] * lx + r[7] * ly + r[8] * lz,
      ]);
    }
  return out;
}

export function compileVolume(v: Volume): CompiledVolume {
  const s = v.shape;
  const m = new Float64Array(12);
  if (s.kind === 'box') {
    const r = boxRotation(s.yaw, s.pitch, s.roll);
    const half = s.size.map((x) => Math.max(1e-9, Math.abs(x) / 2));
    // local = R^T (p - c); unit = local / half. Row i of R^T is column i of R.
    for (let i = 0; i < 3; i++) {
      const a = r[i] / half[i];
      const b = r[3 + i] / half[i];
      const c = r[6 + i] / half[i];
      m[i * 4] = a;
      m[i * 4 + 1] = b;
      m[i * 4 + 2] = c;
      m[i * 4 + 3] = -(a * s.center[0] + b * s.center[1] + c * s.center[2]);
    }
    const corners = boxCorners(s);
    const min: Vec3 = [Infinity, Infinity, Infinity];
    const max: Vec3 = [-Infinity, -Infinity, -Infinity];
    for (const p of corners)
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], p[k]);
        max[k] = Math.max(max[k], p[k]);
      }
    return { code: 1, m, poly: null, min, max };
  }
  if (s.kind === 'sphere') {
    const r = Math.max(1e-9, s.radius);
    m[0] = 1 / r;
    m[3] = -s.center[0] / r;
    m[5] = 1 / r;
    m[7] = -s.center[1] / r;
    m[10] = 1 / r;
    m[11] = -s.center[2] / r;
    return {
      code: 2,
      m,
      poly: null,
      min: [s.center[0] - r, s.center[1] - r, s.center[2] - r],
      max: [s.center[0] + r, s.center[1] + r, s.center[2] + r],
    };
  }
  const lo = Math.min(s.floor, s.ceil);
  const hi = Math.max(s.floor, s.ceil);
  const halfH = Math.max(1e-9, (hi - lo) / 2);
  m[5] = 1 / halfH;
  m[7] = -(lo + halfH) / halfH;
  if (s.kind === 'cylinder') {
    const r = Math.max(1e-9, s.radius);
    m[0] = 1 / r;
    m[3] = -s.x / r;
    m[10] = 1 / r;
    m[11] = -s.z / r;
    return { code: 3, m, poly: null, min: [s.x - r, lo, s.z - r], max: [s.x + r, hi, s.z + r] };
  }
  // Prism: x and z stay world coordinates, the outline is tested in them.
  m[0] = 1;
  m[10] = 1;
  const poly = new Float64Array(s.points.length * 2);
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  s.points.forEach(([x, z], i) => {
    poly[i * 2] = x;
    poly[i * 2 + 1] = z;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  });
  return { code: 4, m, poly, min: [minX, lo, minZ], max: [maxX, hi, maxZ] };
}

/** Even-odd test of (x, z) against a flat outline [x0, z0, x1, z1, ...]. */
export function pointInPolygon(poly: ArrayLike<number>, x: number, z: number): boolean {
  const n = poly.length >> 1;
  if (n < 3) return false;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poly[i * 2];
    const zi = poly[i * 2 + 1];
    const xj = poly[j * 2];
    const zj = poly[j * 2 + 1];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** Whether a compiled volume holds a point. */
export function compiledContains(c: CompiledVolume, x: number, y: number, z: number): boolean {
  if (x < c.min[0] || x > c.max[0] || y < c.min[1] || y > c.max[1] || z < c.min[2] || z > c.max[2]) return false;
  const m = c.m;
  const uy = m[4] * x + m[5] * y + m[6] * z + m[7];
  if (c.code === 4) return uy >= -1 && uy <= 1 && pointInPolygon(c.poly!, x, z);
  const ux = m[0] * x + m[1] * y + m[2] * z + m[3];
  const uz = m[8] * x + m[9] * y + m[10] * z + m[11];
  if (c.code === 1) return Math.abs(ux) <= 1 && Math.abs(uy) <= 1 && Math.abs(uz) <= 1;
  if (c.code === 2) return ux * ux + uy * uy + uz * uz <= 1;
  return ux * ux + uz * uz <= 1 && Math.abs(uy) <= 1;
}

const compiledCache = new WeakMap<Volume, CompiledVolume>();

/** The compiled form, built once per volume object (volumes are replaced, never mutated). */
export function compiled(v: Volume): CompiledVolume {
  let c = compiledCache.get(v);
  if (!c) {
    c = compileVolume(v);
    compiledCache.set(v, c);
  }
  return c;
}

/** Whether `v` holds the world point. Ignores visibility and role. */
export function containsPoint(v: Volume, x: number, y: number, z: number): boolean {
  return compiledContains(compiled(v), x, y, z);
}

/** Whether any visible volume holds the point, whatever its role. */
export function insideAny(volumes: readonly Volume[], x: number, y: number, z: number): boolean {
  for (const v of volumes) if (v.visible && containsPoint(v, x, y, z)) return true;
  return false;
}

/** The volumes' combination, prepared: visible includes and excludes, compiled. */
export interface Selection {
  include: CompiledVolume[];
  exclude: CompiledVolume[];
}

export function selection(volumes: readonly Volume[]): Selection {
  const include: CompiledVolume[] = [];
  const exclude: CompiledVolume[] = [];
  for (const v of volumes) {
    if (!v.visible) continue;
    (v.op === 'exclude' ? exclude : include).push(compiled(v));
  }
  return { include, exclude };
}

export function selectionHolds(sel: Selection, x: number, y: number, z: number): boolean {
  if (sel.include.length > 0) {
    let any = false;
    for (const c of sel.include)
      if (compiledContains(c, x, y, z)) {
        any = true;
        break;
      }
    if (!any) return false;
  }
  for (const c of sel.exclude) if (compiledContains(c, x, y, z)) return false;
  return true;
}

/**
 * Whether the volumes' combination selects the point: in any visible include
 * volume (or there is none) and in no visible exclude volume.
 */
export function selects(volumes: readonly Volume[], x: number, y: number, z: number): boolean {
  return selectionHolds(selection(volumes), x, y, z);
}

/**
 * The filter as a predicate over world points: true keeps the point. Null when
 * nothing is restricted - the filter is off, or no volume is visible.
 */
export function volumeFilter(
  volumes: readonly Volume[],
  filter: VolumeFilter,
): ((x: number, y: number, z: number) => boolean) | null {
  if (filter === 'off') return null;
  const sel = selection(volumes);
  if (sel.include.length === 0 && sel.exclude.length === 0) return null;
  const want = filter === 'inside';
  return (x, y, z) => selectionHolds(sel, x, y, z) === want;
}

/**
 * One byte per row of `[lo, hi)`: 1 where the row is inside. Rows with a
 * non-finite position are outside. `test` is a compiled volume or a selection.
 */
export function containsRows(
  test: CompiledVolume | Selection,
  px: ArrayLike<number>,
  py: ArrayLike<number>,
  pz: ArrayLike<number>,
  lo = 0,
  hi = px.length,
  out = new Uint8Array(Math.max(0, hi - lo)),
): Uint8Array {
  const isSel = 'include' in test;
  for (let i = lo; i < hi; i++) {
    const x = px[i];
    const y = py[i];
    const z = pz[i];
    out[i - lo] = (isSel ? selectionHolds(test, x, y, z) : compiledContains(test, x, y, z)) ? 1 : 0;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Construction.

let idCounter = 0;
export function newVolumeId(): string {
  idCounter++;
  return `v${Date.now().toString(36)}${idCounter.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

/** A regular n-gon's outline round (cx, cz), first vertex at `angle` (radians from +x). */
export function regularPolygon(cx: number, cz: number, rx: number, rz: number, sides: number, angle = 0): Vec2[] {
  const n = Math.max(3, Math.min(64, Math.round(sides)));
  const pts: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = angle + (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cz + Math.sin(a) * rz]);
  }
  return pts;
}

/** Signed area of an outline (positive counter-clockwise in x/z). */
export function polygonArea(points: readonly Vec2[]): number {
  let a = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    a += points[j][0] * points[i][1] - points[i][0] * points[j][1];
  }
  return a / 2;
}

/** Area-weighted centroid of an outline, or the mean of its points when degenerate. */
export function polygonCentroid(points: readonly Vec2[]): Vec2 {
  const a = polygonArea(points);
  if (Math.abs(a) < 1e-12) {
    let x = 0;
    let z = 0;
    for (const p of points) {
      x += p[0];
      z += p[1];
    }
    return [x / Math.max(1, points.length), z / Math.max(1, points.length)];
  }
  let cx = 0;
  let cz = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const f = points[j][0] * points[i][1] - points[i][0] * points[j][1];
    cx += (points[j][0] + points[i][0]) * f;
    cz += (points[j][1] + points[i][1]) * f;
  }
  return [cx / (6 * a), cz / (6 * a)];
}

/** Volume of the shape, in world units cubed. */
export function shapeVolume(s: VolumeShape): number {
  switch (s.kind) {
    case 'box':
      return Math.abs(s.size[0] * s.size[1] * s.size[2]);
    case 'sphere':
      return (4 / 3) * Math.PI * s.radius ** 3;
    case 'cylinder':
      return Math.PI * s.radius ** 2 * Math.abs(s.ceil - s.floor);
    case 'prism':
      return Math.abs(polygonArea(s.points)) * Math.abs(s.ceil - s.floor);
  }
}

/** Ground footprint area, in world units squared. */
export function shapeFootprint(s: VolumeShape): number {
  switch (s.kind) {
    case 'box': {
      // The footprint of a tilted box is its projection; upright it is size x by size z.
      const c = boxCorners(s).map((p) => [p[0], p[2]] as Vec2);
      return Math.abs(polygonArea(convexHull(c)));
    }
    case 'sphere':
      return Math.PI * s.radius ** 2;
    case 'cylinder':
      return Math.PI * s.radius ** 2;
    case 'prism':
      return Math.abs(polygonArea(s.points));
  }
}

function convexHull(points: Vec2[]): Vec2[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Vec2[] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Vec2[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** Axis-aligned bounds of a volume. */
export function volumeBounds(v: Volume): { min: Vec3; max: Vec3 } {
  const c = compiled(v);
  return { min: [...c.min] as Vec3, max: [...c.max] as Vec3 };
}

/** The centre of the shape's base on the ground (floor height), where it is moved from. */
export function shapeAnchor(s: VolumeShape): Vec3 {
  switch (s.kind) {
    case 'box':
      return [s.center[0], s.center[1] - Math.abs(s.size[1]) / 2, s.center[2]];
    case 'sphere':
      return [s.center[0], s.center[1] - s.radius, s.center[2]];
    case 'cylinder':
      return [s.x, Math.min(s.floor, s.ceil), s.z];
    case 'prism': {
      const c = polygonCentroid(s.points);
      return [c[0], Math.min(s.floor, s.ceil), c[1]];
    }
  }
}

/** The shape's vertical extent [floor, ceiling]. */
export function shapeHeights(s: VolumeShape): Vec2 {
  switch (s.kind) {
    case 'box': {
      const c = compileVolume({ id: '', name: '', color: '', visible: true, op: 'include', shape: s });
      return [c.min[1], c.max[1]];
    }
    case 'sphere':
      return [s.center[1] - s.radius, s.center[1] + s.radius];
    default:
      return [Math.min(s.floor, s.ceil), Math.max(s.floor, s.ceil)];
  }
}

/** The shape with its floor and ceiling set (the sphere keeps its radius and moves). */
export function withHeights(s: VolumeShape, floor: number, ceil: number): VolumeShape {
  const lo = Math.min(floor, ceil);
  const hi = Math.max(floor, ceil, lo + 1e-6);
  switch (s.kind) {
    case 'box':
      return { ...s, center: [s.center[0], (lo + hi) / 2, s.center[2]], size: [s.size[0], hi - lo, s.size[2]] };
    case 'sphere':
      return { ...s, center: [s.center[0], (lo + hi) / 2, s.center[2]], radius: Math.max(1e-6, (hi - lo) / 2) };
    default:
      return { ...s, floor: lo, ceil: hi };
  }
}

/** The shape moved by (dx, dy, dz). */
export function translateShape(s: VolumeShape, dx: number, dy: number, dz: number): VolumeShape {
  switch (s.kind) {
    case 'box':
    case 'sphere':
      return { ...s, center: [s.center[0] + dx, s.center[1] + dy, s.center[2] + dz] };
    case 'cylinder':
      return { ...s, x: s.x + dx, z: s.z + dz, floor: s.floor + dy, ceil: s.ceil + dy };
    case 'prism':
      return { ...s, points: s.points.map(([x, z]) => [x + dx, z + dz] as Vec2), floor: s.floor + dy, ceil: s.ceil + dy };
  }
}

/** The shape turned by `angle` radians about the vertical axis through (cx, cz). */
export function rotateShape(s: VolumeShape, angle: number, cx?: number, cz?: number): VolumeShape {
  const a = shapeAnchor(s);
  const ox = cx ?? a[0];
  const oz = cz ?? a[2];
  // Turning by +angle about y maps x->z the same way the box yaw does, so a box
  // turned this way and a polygon turned this way agree.
  const c = Math.cos(angle);
  const sn = Math.sin(angle);
  const turn = (x: number, z: number): Vec2 => {
    const dx = x - ox;
    const dz = z - oz;
    return [ox + c * dx + sn * dz, oz - sn * dx + c * dz];
  };
  switch (s.kind) {
    case 'box': {
      const [x, z] = turn(s.center[0], s.center[2]);
      return { ...s, center: [x, s.center[1], z], yaw: s.yaw + angle };
    }
    case 'sphere': {
      const [x, z] = turn(s.center[0], s.center[2]);
      return { ...s, center: [x, s.center[1], z] };
    }
    case 'cylinder': {
      const [x, z] = turn(s.x, s.z);
      return { ...s, x, z };
    }
    case 'prism':
      return { ...s, points: s.points.map(([x, z]) => turn(x, z)) };
  }
}

/** The shape scaled about its anchor, horizontally by `k`, and its height by `kh`. */
export function scaleShape(s: VolumeShape, k: number, kh = 1): VolumeShape {
  const a = shapeAnchor(s);
  switch (s.kind) {
    case 'box':
      return {
        ...s,
        size: [s.size[0] * k, s.size[1] * kh, s.size[2] * k],
        center: [s.center[0], a[1] + (s.center[1] - a[1]) * kh, s.center[2]],
      };
    case 'sphere':
      return { ...s, radius: s.radius * k, center: [s.center[0], a[1] + s.radius * k, s.center[2]] };
    case 'cylinder':
      return { ...s, radius: s.radius * k, ceil: s.floor + (s.ceil - s.floor) * kh };
    case 'prism':
      return {
        ...s,
        points: s.points.map(([x, z]) => [a[0] + (x - a[0]) * k, a[2] + (z - a[2]) * k] as Vec2),
        ceil: s.floor + (s.ceil - s.floor) * kh,
      };
  }
}

/**
 * The shape as an equivalent prism, where it has a flat outline: a box with no
 * pitch or roll becomes its rectangle, a cylinder a 32-gon. Spheres and tilted
 * boxes stay as they are.
 */
export function asPrism(s: VolumeShape): VolumeShape {
  if (s.kind === 'box' && Math.abs(s.pitch) < 1e-9 && Math.abs(s.roll) < 1e-9) {
    const c = boxCorners(s);
    return {
      kind: 'prism',
      points: c.slice(0, 4).map((p) => [p[0], p[2]] as Vec2),
      floor: s.center[1] - Math.abs(s.size[1]) / 2,
      ceil: s.center[1] + Math.abs(s.size[1]) / 2,
    };
  }
  if (s.kind === 'cylinder') return { kind: 'prism', points: regularPolygon(s.x, s.z, s.radius, s.radius, 32), floor: s.floor, ceil: s.ceil };
  return s;
}

// ---------------------------------------------------------------------------
// Drawing: wireframe edges and handles.

/** The shape's outline as line segments, for drawing. */
export function volumeEdges(s: VolumeShape, circleSegments = 48): [Vec3, Vec3][] {
  const out: [Vec3, Vec3][] = [];
  const ring = (pts: Vec2[], y: number) => {
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      out.push([[a[0], y, a[1]], [b[0], y, b[1]]]);
    }
  };
  switch (s.kind) {
    case 'box': {
      const c = boxCorners(s);
      for (let i = 0; i < 4; i++) {
        out.push([c[i], c[(i + 1) % 4]]);
        out.push([c[4 + i], c[4 + ((i + 1) % 4)]]);
        out.push([c[i], c[4 + i]]);
      }
      return out;
    }
    case 'prism': {
      ring(s.points, s.floor);
      ring(s.points, s.ceil);
      for (const p of s.points) out.push([[p[0], s.floor, p[1]], [p[0], s.ceil, p[1]]]);
      return out;
    }
    case 'cylinder': {
      const pts = regularPolygon(s.x, s.z, s.radius, s.radius, circleSegments);
      ring(pts, s.floor);
      ring(pts, s.ceil);
      for (let i = 0; i < pts.length; i += Math.max(1, Math.floor(pts.length / 8)))
        out.push([[pts[i][0], s.floor, pts[i][1]], [pts[i][0], s.ceil, pts[i][1]]]);
      return out;
    }
    case 'sphere': {
      const [cx, cy, cz] = s.center;
      const r = s.radius;
      for (let i = 0; i < circleSegments; i++) {
        const a0 = (i / circleSegments) * Math.PI * 2;
        const a1 = ((i + 1) / circleSegments) * Math.PI * 2;
        const c0 = Math.cos(a0) * r;
        const s0 = Math.sin(a0) * r;
        const c1 = Math.cos(a1) * r;
        const s1 = Math.sin(a1) * r;
        out.push([[cx + c0, cy, cz + s0], [cx + c1, cy, cz + s1]]);
        out.push([[cx + c0, cy + s0, cz], [cx + c1, cy + s1, cz]]);
        out.push([[cx, cy + c0, cz + s0], [cx, cy + c1, cz + s1]]);
      }
      return out;
    }
  }
}

/**
 * What a handle does when dragged:
 *   move     the whole volume, over the ground
 *   corner   a box's footprint corner; the opposite corner stays
 *   vertex   one point of a prism's outline (shift: scale the whole outline)
 *   radius   a sphere's or cylinder's radius
 *   top      the ceiling (vertical drag)
 *   bottom   the floor (vertical drag)
 *   rotate   turn about the vertical axis
 */
export type HandleKind = 'move' | 'corner' | 'vertex' | 'radius' | 'top' | 'bottom' | 'rotate';

export interface Handle {
  kind: HandleKind;
  /** Which corner or vertex. */
  index: number;
  at: Vec3;
}

/** The drag handles of a shape, in world space. */
export function volumeHandles(s: VolumeShape): Handle[] {
  const anchor = shapeAnchor(s);
  const [floor, ceil] = shapeHeights(s);
  const out: Handle[] = [{ kind: 'move', index: 0, at: anchor }];
  let reach = 0;
  switch (s.kind) {
    case 'box': {
      const c = boxCorners(s);
      for (let i = 0; i < 4; i++) out.push({ kind: 'corner', index: i, at: c[i] });
      reach = Math.max(Math.abs(s.size[0]), Math.abs(s.size[2])) / 2;
      break;
    }
    case 'prism':
      s.points.forEach((p, i) => out.push({ kind: 'vertex', index: i, at: [p[0], s.floor, p[1]] }));
      for (const p of s.points) reach = Math.max(reach, Math.hypot(p[0] - anchor[0], p[1] - anchor[2]));
      break;
    case 'cylinder':
      out.push({ kind: 'radius', index: 0, at: [s.x + s.radius, s.floor, s.z] });
      reach = s.radius;
      break;
    case 'sphere':
      out.push({ kind: 'radius', index: 0, at: [s.center[0] + s.radius, s.center[1], s.center[2]] });
      reach = s.radius;
      break;
  }
  out.push({ kind: 'top', index: 0, at: [anchor[0], ceil, anchor[2]] });
  if (s.kind !== 'sphere') out.push({ kind: 'bottom', index: 0, at: [anchor[0], floor, anchor[2]] });
  // The rotate handle sits past the shape along its own heading, so it turns with it.
  const yaw = s.kind === 'box' ? s.yaw : 0;
  if (s.kind !== 'sphere' && s.kind !== 'cylinder') {
    const d = reach * 1.25 + 1e-6;
    out.push({ kind: 'rotate', index: 0, at: [anchor[0] + Math.cos(-yaw) * d, floor, anchor[2] + Math.sin(-yaw) * d] });
  }
  return out;
}

/** Whether a ground point (x, z) is over the shape's footprint. */
export function footprintHolds(s: VolumeShape, x: number, z: number): boolean {
  switch (s.kind) {
    case 'box': {
      const c = boxCorners(s);
      return pointInPolygon(convexHull(c.map((p) => [p[0], p[2]] as Vec2)).flat(), x, z);
    }
    case 'prism':
      return pointInPolygon(s.points.flat(), x, z);
    case 'cylinder':
      return Math.hypot(x - s.x, z - s.z) <= s.radius;
    case 'sphere':
      return Math.hypot(x - s.center[0], z - s.center[2]) <= s.radius;
  }
}

// ---------------------------------------------------------------------------
// Handle edits: pure functions of the shape at drag start and the pointer.

/** A box corner dragged to (x, z): the opposite corner, in the box's own heading, stays put. */
export function dragCorner(s: Extract<VolumeShape, { kind: 'box' }>, index: number, x: number, z: number): VolumeShape {
  const c = Math.cos(s.yaw);
  const sn = Math.sin(s.yaw);
  // World -> heading frame: undo the yaw (x' = c dx - s dz, z' = s dx + c dz).
  const toLocal = (wx: number, wz: number): Vec2 => {
    const dx = wx - s.center[0];
    const dz = wz - s.center[2];
    return [c * dx - sn * dz, sn * dx + c * dz];
  };
  const signs: Vec2[] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const [sx, sz] = signs[index & 3];
  const opp: Vec2 = [(-sx * s.size[0]) / 2, (-sz * s.size[2]) / 2];
  const at = toLocal(x, z);
  const minSize = 1e-3;
  const w = Math.max(minSize, Math.abs(at[0] - opp[0]));
  const d = Math.max(minSize, Math.abs(at[1] - opp[1]));
  const mid: Vec2 = [(at[0] + opp[0]) / 2, (at[1] + opp[1]) / 2];
  // Back to the world: x = c lx + s lz, z = -s lx + c lz.
  const wx = s.center[0] + c * mid[0] + sn * mid[1];
  const wz = s.center[2] - sn * mid[0] + c * mid[1];
  return { ...s, center: [wx, s.center[1], wz], size: [w, s.size[1], d] };
}

/** A prism vertex dragged to (x, z); with `scale`, the whole outline scales about its centre instead. */
export function dragVertex(s: Extract<VolumeShape, { kind: 'prism' }>, index: number, x: number, z: number, scale = false): VolumeShape {
  if (scale) {
    const c = polygonCentroid(s.points);
    const p = s.points[index];
    const from = Math.hypot(p[0] - c[0], p[1] - c[1]);
    const to = Math.hypot(x - c[0], z - c[1]);
    if (from < 1e-9) return s;
    const k = Math.max(1e-3, to / from);
    return { ...s, points: s.points.map(([px, pz]) => [c[0] + (px - c[0]) * k, c[1] + (pz - c[1]) * k] as Vec2) };
  }
  const points = s.points.slice();
  points[index] = [x, z];
  return { ...s, points, sides: undefined };
}

/** The radius handle dragged to (x, z). */
export function dragRadius(s: VolumeShape, x: number, z: number): VolumeShape {
  if (s.kind === 'cylinder') return { ...s, radius: Math.max(1e-3, Math.hypot(x - s.x, z - s.z)) };
  if (s.kind === 'sphere') {
    const r = Math.max(1e-3, Math.hypot(x - s.center[0], z - s.center[2]));
    // Resting on the ground it stood on: the bottom stays.
    const bottom = s.center[1] - s.radius;
    return { ...s, radius: r, center: [s.center[0], bottom + r, s.center[2]] };
  }
  return s;
}

/** The ceiling (`top`) or floor (`bottom`) moved to height `y`. */
export function dragHeight(s: VolumeShape, which: 'top' | 'bottom', y: number): VolumeShape {
  const [floor, ceil] = shapeHeights(s);
  const minH = 1e-3;
  if (which === 'top') return withHeights(s, floor, Math.max(floor + minH, y));
  return withHeights(s, Math.min(ceil - minH, y), ceil);
}

// ---------------------------------------------------------------------------
// Validation, for import.

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isVec = (v: unknown, n: number): boolean => Array.isArray(v) && v.length === n && v.every(isNum);

/** A shape read from untrusted JSON, or null when it is not one. */
export function parseShape(raw: unknown): VolumeShape | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  switch (s.kind) {
    case 'box':
      if (!isVec(s.center, 3) || !isVec(s.size, 3)) return null;
      return {
        kind: 'box',
        center: s.center as Vec3,
        size: (s.size as number[]).map(Math.abs) as Vec3,
        yaw: isNum(s.yaw) ? s.yaw : 0,
        pitch: isNum(s.pitch) ? s.pitch : 0,
        roll: isNum(s.roll) ? s.roll : 0,
      };
    case 'prism': {
      if (!Array.isArray(s.points) || s.points.length < 3 || s.points.length > 1024) return null;
      if (!s.points.every((p) => isVec(p, 2)) || !isNum(s.floor) || !isNum(s.ceil)) return null;
      return {
        kind: 'prism',
        points: (s.points as Vec2[]).map((p) => [p[0], p[1]] as Vec2),
        floor: Math.min(s.floor, s.ceil),
        ceil: Math.max(s.floor, s.ceil),
        ...(isNum(s.sides) ? { sides: s.sides } : {}),
      };
    }
    case 'sphere':
      if (!isVec(s.center, 3) || !isNum(s.radius) || s.radius <= 0) return null;
      return { kind: 'sphere', center: s.center as Vec3, radius: s.radius };
    case 'cylinder':
      if (!isNum(s.x) || !isNum(s.z) || !isNum(s.radius) || s.radius <= 0 || !isNum(s.floor) || !isNum(s.ceil)) return null;
      return { kind: 'cylinder', x: s.x, z: s.z, radius: s.radius, floor: Math.min(s.floor, s.ceil), ceil: Math.max(s.floor, s.ceil) };
  }
  return null;
}

/** A volume read from untrusted JSON, or null. Missing name, colour and role get defaults. */
export function parseVolume(raw: unknown, fallbackIndex = 0): Volume | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const shape = parseShape(r.shape);
  if (!shape) return null;
  return {
    id: typeof r.id === 'string' && r.id ? r.id : newVolumeId(),
    name: typeof r.name === 'string' ? r.name.slice(0, 120) : `Volume ${fallbackIndex + 1}`,
    color: typeof r.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(r.color) ? r.color : VOLUME_COLORS[fallbackIndex % VOLUME_COLORS.length],
    visible: r.visible !== false,
    op: r.op === 'exclude' ? 'exclude' : 'include',
    shape,
  };
}

/** The file written by "Export volumes". */
export interface VolumeFile {
  format: '3dheat-volumes';
  version: 1;
  volumes: Volume[];
}

export function volumesToJson(volumes: readonly Volume[]): string {
  const file: VolumeFile = { format: '3dheat-volumes', version: 1, volumes: volumes.map((v) => ({ ...v })) };
  return JSON.stringify(file, null, 2);
}

/** Volumes from a file written by `volumesToJson`, or a bare array of volumes. Fresh ids, so an import never collides. */
export function volumesFromJson(text: string): Volume[] {
  const raw = JSON.parse(text) as unknown;
  const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? (raw as { volumes?: unknown }).volumes : null;
  if (!Array.isArray(list)) throw new Error('not a volume file');
  const out: Volume[] = [];
  list.forEach((v, i) => {
    const p = parseVolume(v, i);
    if (p) out.push({ ...p, id: newVolumeId() });
  });
  return out;
}

/** "#rrggbb" -> [r, g, b] in 0..1. */
export function hexToRgb(hex: string): Vec3 {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return [1, 1, 1];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
