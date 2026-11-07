import type { Dataset } from '../state/types';
import { filterColumnData } from './filterTables';
import type { ActiveFilter } from './types';
import type { Vec3 } from './pose';

/**
 * Clicking on things: which surface of the level a ray meets, and which drawn
 * data sample lies under the cursor.
 *
 * On the CPU rather than by reading the GPU's depth buffer back. WebGL2 cannot
 * read a depth attachment at all, so a readback pick would need a second,
 * position-writing pass in both backends; and depth alone says where, not
 * *what* - the part name has to come from the geometry anyway. The geometry is
 * already on this thread (the level in the store is the one the renderer
 * uploaded), so the only cost is an index over it, built in slices so it never
 * holds a frame.
 */

// ------------------------------------------------------------------- rays

export interface Ray {
  origin: Vec3;
  /** Unit length. */
  dir: Vec3;
}

/**
 * Möller-Trumbore: distance along the ray to the triangle, or -1.
 *
 * Both faces count. A level's walls are single-sided as often as not, and a
 * click on the back of one still means that wall.
 */
export function rayTriangle(
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  cx: number,
  cy: number,
  cz: number,
): number {
  const e1x = bx - ax;
  const e1y = by - ay;
  const e1z = bz - az;
  const e2x = cx - ax;
  const e2y = cy - ay;
  const e2z = cz - az;
  const px = dy * e2z - dz * e2y;
  const py = dz * e2x - dx * e2z;
  const pz = dx * e2y - dy * e2x;
  const det = e1x * px + e1y * py + e1z * pz;
  if (Math.abs(det) < 1e-12) return -1;
  const inv = 1 / det;
  const tx = ox - ax;
  const ty = oy - ay;
  const tz = oz - az;
  const u = (tx * px + ty * py + tz * pz) * inv;
  if (u < 0 || u > 1) return -1;
  const qx = ty * e1z - tz * e1y;
  const qy = tz * e1x - tx * e1z;
  const qz = tx * e1y - ty * e1x;
  const v = (dx * qx + dy * qy + dz * qz) * inv;
  if (v < 0 || u + v > 1) return -1;
  const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
  return t > 0 ? t : -1;
}

// ---------------------------------------------------------- surface index

/** One set of triangles over the shared vertex buffer: ground, structures or water. */
export interface TriangleSet {
  name: 'ground' | 'structure' | 'water' | 'nav';
  indices: Uint32Array;
}

/**
 * A grid of columns over the level's footprint, each listing the triangles
 * that cross it.
 *
 * Columns rather than cubes because a level is wide and flat: on the test level
 * the footprint is kilometres across and the height a few hundred metres, so a
 * column of a few metres holds the terrain under it and whatever stands on it,
 * which is a few dozen triangles. A ray is walked through the columns it
 * crosses, nearest first, and stops at the first column whose own hit is
 * nearer than where the ray leaves it.
 *
 * The cell size is taken from the triangles themselves (twice the median
 * footprint of a sample), so a triangle is listed in one or two columns and
 * the index costs about two references per triangle - 4 bytes each. A triangle
 * whose footprint would cover more than `BIG_CELLS` columns - a backdrop plane,
 * a sea - is kept on a short list that every ray tests instead of being copied
 * into thousands of columns.
 */
export interface SurfaceIndex {
  sets: TriangleSet[];
  /** First global triangle id of each set; a triangle's id is its set's base plus its index. */
  setBase: Uint32Array;
  minX: number;
  minZ: number;
  minY: number;
  maxY: number;
  cell: number;
  nx: number;
  nz: number;
  /** `cellStart[c]`..`cellStart[c + 1]` is column c's slice of `refs`. */
  cellStart: Uint32Array;
  refs: Uint32Array;
  /** Triangles too large to list per column; tested by every ray. */
  big: Uint32Array;
  triangles: number;
}

/** Columns past which a triangle goes on the big list rather than into each column. */
const BIG_CELLS = 256;
/** Ceiling on the column count: 4M columns is 16 MB of offsets. */
const MAX_CELLS = 1 << 22;

export interface BuildProgress {
  /** 0..1 over both passes. */
  fraction: number;
}

/**
 * Build the index in slices: a generator that yields after roughly `sliceRows`
 * triangles so its driver can hand the thread back between slices.
 *
 * Two passes - count, then fill - so the reference list is allocated once at
 * its exact size rather than grown, which at tens of millions of triangles is
 * the difference between one allocation and a series of copies.
 */
export function* buildSurfaceIndex(
  vertices: Float32Array,
  sets: TriangleSet[],
  sliceRows = 200_000,
): Generator<BuildProgress, SurfaceIndex, void> {
  const setBase = new Uint32Array(sets.length + 1);
  for (let s = 0; s < sets.length; s++) setBase[s + 1] = setBase[s] + Math.floor(sets[s].indices.length / 3);
  const triangles = setBase[sets.length];

  // Footprint of what the sets actually address, not the whole vertex buffer.
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let done = 0;
  for (const set of sets) {
    const idx = set.indices;
    for (let i = 0; i < idx.length; i++) {
      const o = idx[i] * 6;
      const x = vertices[o];
      const y = vertices[o + 1];
      const z = vertices[o + 2];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
      if (++done % (sliceRows * 3) === 0) yield { fraction: (0.15 * done) / Math.max(1, triangles * 3) };
    }
  }
  if (!Number.isFinite(minX)) {
    minX = minZ = minY = 0;
    maxX = maxZ = maxY = 1;
  }

  const cell = chooseCellSize(vertices, sets, maxX - minX, maxZ - minZ, triangles);
  const nx = Math.max(1, Math.ceil((maxX - minX) / cell) + 1);
  const nz = Math.max(1, Math.ceil((maxZ - minZ) / cell) + 1);
  const cells = nx * nz;
  const inv = 1 / cell;

  const counts = new Uint32Array(cells + 1);
  let bigCount = 0;
  // The footprint in columns of triangle t of a set, into `span`.
  const span = new Int32Array(4);
  const footprint = (idx: Uint32Array, t: number) => {
    const a = idx[t * 3] * 6;
    const b = idx[t * 3 + 1] * 6;
    const c = idx[t * 3 + 2] * 6;
    const x0 = Math.min(vertices[a], vertices[b], vertices[c]);
    const x1 = Math.max(vertices[a], vertices[b], vertices[c]);
    const z0 = Math.min(vertices[a + 2], vertices[b + 2], vertices[c + 2]);
    const z1 = Math.max(vertices[a + 2], vertices[b + 2], vertices[c + 2]);
    span[0] = clampCell(Math.floor((x0 - minX) * inv), nx);
    span[1] = clampCell(Math.floor((x1 - minX) * inv), nx);
    span[2] = clampCell(Math.floor((z0 - minZ) * inv), nz);
    span[3] = clampCell(Math.floor((z1 - minZ) * inv), nz);
  };

  let seen = 0;
  for (const set of sets) {
    const n = Math.floor(set.indices.length / 3);
    for (let t = 0; t < n; t++) {
      footprint(set.indices, t);
      const w = span[1] - span[0] + 1;
      const h = span[3] - span[2] + 1;
      if (w * h > BIG_CELLS) bigCount++;
      else {
        for (let cz = span[2]; cz <= span[3]; cz++) {
          for (let cx = span[0]; cx <= span[1]; cx++) counts[cz * nx + cx + 1]++;
        }
      }
      if (++seen % sliceRows === 0) yield { fraction: 0.15 + (0.4 * seen) / Math.max(1, triangles) };
    }
  }
  for (let c = 0; c < cells; c++) counts[c + 1] += counts[c];
  const cellStart = counts;
  const refs = new Uint32Array(cellStart[cells]);
  const cursor = cellStart.slice(0, cells);
  const big = new Uint32Array(bigCount);
  let bigAt = 0;

  seen = 0;
  for (let s = 0; s < sets.length; s++) {
    const set = sets[s];
    const n = Math.floor(set.indices.length / 3);
    const base = setBase[s];
    for (let t = 0; t < n; t++) {
      footprint(set.indices, t);
      const w = span[1] - span[0] + 1;
      const h = span[3] - span[2] + 1;
      if (w * h > BIG_CELLS) big[bigAt++] = base + t;
      else {
        for (let cz = span[2]; cz <= span[3]; cz++) {
          for (let cx = span[0]; cx <= span[1]; cx++) refs[cursor[cz * nx + cx]++] = base + t;
        }
      }
      if (++seen % sliceRows === 0) yield { fraction: 0.55 + (0.45 * seen) / Math.max(1, triangles) };
    }
  }

  return { sets, setBase, minX, minZ, minY, maxY, cell, nx, nz, cellStart, refs, big, triangles };
}

/** Run a slice generator to the end on the spot; for tests and small levels. */
export function finish<T>(gen: Generator<unknown, T, void>): T {
  for (;;) {
    const r = gen.next();
    if (r.done) return r.value;
  }
}

function clampCell(v: number, n: number): number {
  return v < 0 ? 0 : v >= n ? n - 1 : v;
}

/**
 * Column size: twice the median horizontal footprint of a sample of triangles,
 * held between the bounds that keep the column count sane.
 *
 * The median rather than the mean because a level's size distribution has a
 * long tail - a few huge backdrop triangles would drag a mean up to the point
 * where every column holds a city block.
 */
function chooseCellSize(vertices: Float32Array, sets: TriangleSet[], spanX: number, spanZ: number, triangles: number): number {
  const area = Math.max(1e-6, spanX) * Math.max(1e-6, spanZ);
  const samples: number[] = [];
  const want = Math.min(4096, triangles);
  for (const set of sets) {
    const n = Math.floor(set.indices.length / 3);
    if (n === 0) continue;
    const take = Math.max(1, Math.round((want * n) / Math.max(1, triangles)));
    const step = Math.max(1, Math.floor(n / take));
    for (let t = 0; t < n; t += step) {
      const a = set.indices[t * 3] * 6;
      const b = set.indices[t * 3 + 1] * 6;
      const c = set.indices[t * 3 + 2] * 6;
      const w = Math.max(vertices[a], vertices[b], vertices[c]) - Math.min(vertices[a], vertices[b], vertices[c]);
      const d =
        Math.max(vertices[a + 2], vertices[b + 2], vertices[c + 2]) - Math.min(vertices[a + 2], vertices[b + 2], vertices[c + 2]);
      samples.push(Math.max(w, d));
    }
  }
  samples.sort((p, q) => p - q);
  const median = samples.length ? samples[samples.length >> 1] : 1;
  // Never so small that the grid outgrows MAX_CELLS, never so large that the
  // whole level is a handful of columns.
  const floor = Math.sqrt(area / MAX_CELLS);
  const ceiling = Math.max(floor, Math.sqrt(area / 64));
  return Math.max(floor, Math.min(ceiling, Math.max(1e-3, median * 2)));
}

export interface SurfaceHit {
  t: number;
  point: Vec3;
  /** Which set the triangle is in, and its index within that set. */
  set: number;
  triangle: number;
}

/**
 * The nearest triangle the ray meets, or null.
 *
 * A 2D walk (Amanatides-Woo) through the columns under the ray. Each column's
 * triangles are tested in full; a hit only ends the walk once it is nearer
 * than the point where the ray leaves the column, since a triangle listed here
 * may be met further on, in a column not yet visited, by something nearer.
 * `accept`, when given, passes over hits on geometry the view is not drawing.
 */
export function raycastSurface(
  index: SurfaceIndex,
  vertices: Float32Array,
  ray: Ray,
  maxT = Infinity,
  accept: ((x: number, y: number, z: number) => boolean) | null = null,
): SurfaceHit | null {
  const { origin: o, dir: d } = ray;
  let best = maxT;
  let bestId = -1;

  const test = (id: number) => {
    const s = setOf(index, id);
    const tri = id - index.setBase[s];
    const idx = index.sets[s].indices;
    const a = idx[tri * 3] * 6;
    const b = idx[tri * 3 + 1] * 6;
    const c = idx[tri * 3 + 2] * 6;
    const t = rayTriangle(
      o.x, o.y, o.z, d.x, d.y, d.z,
      vertices[a], vertices[a + 1], vertices[a + 2],
      vertices[b], vertices[b + 1], vertices[b + 2],
      vertices[c], vertices[c + 1], vertices[c + 2],
    );
    if (t > 0 && t < best) {
      // Geometry the view is not drawing - sliced away, or past the distance
      // cull - is not there to click, and the ray goes on through it.
      if (accept && !accept(o.x + d.x * t, o.y + d.y * t, o.z + d.z * t)) return;
      best = t;
      bestId = id;
    }
  };

  for (let i = 0; i < index.big.length; i++) test(index.big[i]);

  // The ray's stretch over the grid's footprint and height band.
  const x0 = index.minX;
  const z0 = index.minZ;
  const x1 = x0 + index.nx * index.cell;
  const z1 = z0 + index.nz * index.cell;
  let tMin = 0;
  let tMax = best;
  const slab = (orig: number, dir: number, lo: number, hi: number) => {
    if (Math.abs(dir) < 1e-15) {
      if (orig < lo || orig > hi) tMax = -1;
      return;
    }
    let a = (lo - orig) / dir;
    let b = (hi - orig) / dir;
    if (a > b) [a, b] = [b, a];
    if (a > tMin) tMin = a;
    if (b < tMax) tMax = b;
  };
  slab(o.x, d.x, x0, x1);
  slab(o.z, d.z, z0, z1);
  // A little headroom on the height band, so a ray grazing the top of the
  // tallest thing is not clipped off it by rounding.
  const pad = (index.maxY - index.minY) * 1e-4 + 1e-3;
  slab(o.y, d.y, index.minY - pad, index.maxY + pad);

  if (tMax >= tMin && tMax > 0) {
    const inv = 1 / index.cell;
    const sx = o.x + d.x * tMin;
    const sz = o.z + d.z * tMin;
    let cx = clampCell(Math.floor((sx - x0) * inv), index.nx);
    let cz = clampCell(Math.floor((sz - z0) * inv), index.nz);
    const stepX = d.x > 0 ? 1 : d.x < 0 ? -1 : 0;
    const stepZ = d.z > 0 ? 1 : d.z < 0 ? -1 : 0;
    const nextX = stepX > 0 ? x0 + (cx + 1) * index.cell : x0 + cx * index.cell;
    const nextZ = stepZ > 0 ? z0 + (cz + 1) * index.cell : z0 + cz * index.cell;
    let tX = stepX !== 0 ? (nextX - o.x) / d.x : Infinity;
    let tZ = stepZ !== 0 ? (nextZ - o.z) / d.z : Infinity;
    const dtX = stepX !== 0 ? index.cell / Math.abs(d.x) : Infinity;
    const dtZ = stepZ !== 0 ? index.cell / Math.abs(d.z) : Infinity;
    for (;;) {
      const c = cz * index.nx + cx;
      for (let r = index.cellStart[c]; r < index.cellStart[c + 1]; r++) test(index.refs[r]);
      const exit = Math.min(tX, tZ, tMax);
      if (best <= exit + 1e-6 || exit >= tMax) break;
      if (tX < tZ) {
        cx += stepX;
        tX += dtX;
        if (cx < 0 || cx >= index.nx) break;
      } else {
        cz += stepZ;
        tZ += dtZ;
        if (cz < 0 || cz >= index.nz) break;
      }
    }
  }

  if (bestId < 0) return null;
  const set = setOf(index, bestId);
  return {
    t: best,
    point: { x: o.x + d.x * best, y: o.y + d.y * best, z: o.z + d.z * best },
    set,
    triangle: bestId - index.setBase[set],
  };
}

function setOf(index: SurfaceIndex, id: number): number {
  let s = 0;
  while (s + 1 < index.sets.length && id >= index.setBase[s + 1]) s++;
  return s;
}

/**
 * The source part a triangle came from, by its index within its set.
 *
 * `runs` is (part, end) pairs over the set's triangles in order, as the model
 * worker records them for a set it did not simplify; a binary search finds the
 * run the triangle is in.
 */
export function partOfTriangle(runs: Uint32Array | null | undefined, triangle: number): number {
  if (!runs || runs.length < 2) return -1;
  let lo = 0;
  let hi = runs.length / 2;
  while (lo < hi) {
    const m = (lo + hi) >>> 1;
    if (runs[m * 2 + 1] <= triangle) lo = m + 1;
    else hi = m;
  }
  return lo < runs.length / 2 ? runs[lo * 2] : -1;
}

/**
 * The part a point most likely belongs to, from the parts' bounding boxes.
 *
 * For a set the simplifier rebuilt, where triangles no longer say which part
 * they came from. The smallest box of the right class that holds the point
 * (grown by `slack` for the simplifier's own error) is the best guess there is,
 * and the card says it is a guess.
 */
export function partByBounds(
  bounds: Float32Array | null | undefined,
  classes: ReadonlyArray<string> | null | undefined,
  cls: string,
  p: Vec3,
  slack: number,
): number {
  if (!bounds || !classes) return -1;
  let best = -1;
  let bestVolume = Infinity;
  for (let i = 0; i < classes.length; i++) {
    if (classes[i] !== cls) continue;
    const o = i * 6;
    if (
      p.x < bounds[o] - slack || p.x > bounds[o + 3] + slack ||
      p.y < bounds[o + 1] - slack || p.y > bounds[o + 4] + slack ||
      p.z < bounds[o + 2] - slack || p.z > bounds[o + 5] + slack
    ) continue;
    const volume =
      Math.max(slack, bounds[o + 3] - bounds[o]) *
      Math.max(slack, bounds[o + 4] - bounds[o + 1]) *
      Math.max(slack, bounds[o + 5] - bounds[o + 2]);
    if (volume < bestVolume) {
      bestVolume = volume;
      best = i;
    }
  }
  return best;
}

// ------------------------------------------------------------ data samples

/**
 * What the heat pass drew last frame, as far as which rows it drew.
 *
 * The same rules the vertex shaders apply, said once on the CPU: the time
 * window's rows, the filters, the group and split tables, the lifetime, the
 * distance cull and a slice that clips. Captured per frame by the engine, so a
 * click is answered against what was on screen when it was made.
 */
export interface DrawnRows {
  rowLo: number;
  rowHi: number;
  filters: ActiveFilter[];
  /** Group table, applied when `useSign`; see `frameSignTables`. */
  teamSign: Int8Array | null;
  useSign: boolean;
  splitMode: 0 | 1 | 2;
  splitColumn: string | null;
  splitSign: Int8Array | null;
  splitPositive: [number, number];
  splitNegative: [number, number];
  lifetime: { now: number; defaultLifetime: number } | null;
  cull: { near: number; far: number; planar: boolean; eye: Vec3; forward: Vec3 } | null;
  slice: { axis: 0 | 1 | 2; min: number; max: number } | null;
  /** Ground-projected heat draws every row at this height. */
  groundY: number | null;
}

/**
 * Per-filter column values, resolved once per pick rather than per row.
 */
function resolveFilters(ds: Dataset, d: DrawnRows): Array<{ f: ActiveFilter; data: ArrayLike<number> | null }> {
  return d.filters.map((f) => ({ f, data: filterColumnData(ds, f.column) }));
}

/** Whether row `i` was drawn, by the rules the shaders apply. */
export function rowDrawn(
  ds: Dataset,
  i: number,
  d: DrawnRows,
  resolved = resolveFilters(ds, d),
  split: ArrayLike<number> | null = d.splitColumn ? filterColumnData(ds, d.splitColumn) : null,
): boolean {
  if (i < d.rowLo || i >= d.rowHi) return false;
  const x = ds.px[i];
  const y = d.groundY ?? ds.py[i];
  const z = ds.pz[i];
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return false;

  if (d.cull && (d.cull.near > 0 || d.cull.far > 0)) {
    const e = d.cull.eye;
    const dist = d.cull.planar
      ? (x - e.x) * d.cull.forward.x + (y - e.y) * d.cull.forward.y + (z - e.z) * d.cull.forward.z
      : Math.hypot(x - e.x, y - e.y, z - e.z);
    if (dist < d.cull.near) return false;
    if (d.cull.far > 0 && dist > d.cull.far) return false;
  }

  for (const { f, data } of resolved) {
    // A slot whose column is gone uploads nothing the shader could pass.
    if (!data) return false;
    const v = data[i];
    if (f.kind === 'range') {
      if (!(v >= f.min && v <= f.max)) return false;
    } else {
      const c = Math.trunc(v);
      if (!f.mask || c < 0 || c >= f.mask.length || f.mask[c] === 0) return false;
    }
  }

  if (d.useSign) {
    const g = ds.teamId ? ds.teamId[i] : 0;
    const groupSign = d.teamSign && g < d.teamSign.length ? d.teamSign[g] : 1;
    let sign = groupSign;
    if (d.splitMode !== 0) {
      if (groupSign === 0) return false;
      if (!split) return false;
      const v = split[i];
      if (d.splitMode === 1) {
        const cat = Math.round(v);
        sign = d.splitSign && cat >= 0 && cat < d.splitSign.length ? d.splitSign[cat] : 0;
      } else {
        sign =
          v >= d.splitPositive[0] && v <= d.splitPositive[1]
            ? 1
            : v >= d.splitNegative[0] && v <= d.splitNegative[1]
              ? -1
              : 0;
      }
    }
    if (sign === 0) return false;
  }

  if (d.lifetime && ds.time && ds.lifetime) {
    const raw = ds.lifetime[i];
    const life = raw < 0 ? d.lifetime.defaultLifetime : raw;
    if (Math.max(0, d.lifetime.now - ds.time[i]) > life) return false;
  }

  if (d.slice) {
    const coord = d.slice.axis === 0 ? x : d.slice.axis === 1 ? y : z;
    if (coord < d.slice.min || coord > d.slice.max) return false;
  }
  return true;
}

/** A column-major view-projection (OpenGL clip space) and the canvas it maps onto. */
export interface ScreenSpace {
  viewProj: Float32Array;
  width: number;
  height: number;
}

/** Where a world point lands, in CSS pixels, with its clip w; null when clipped. */
export function projectPoint(s: ScreenSpace, x: number, y: number, z: number): { x: number; y: number; w: number } | null {
  const e = s.viewProj;
  const cx = e[0] * x + e[4] * y + e[8] * z + e[12];
  const cy = e[1] * x + e[5] * y + e[9] * z + e[13];
  const cz = e[2] * x + e[6] * y + e[10] * z + e[14];
  const w = e[3] * x + e[7] * y + e[11] * z + e[15];
  if (w <= 1e-9) return null;
  const nz = cz / w;
  // Outside the near and far planes is not drawn, so not clickable.
  if (nz < -1 || nz > 1) return null;
  return { x: (cx / w * 0.5 + 0.5) * s.width, y: (1 - (cy / w * 0.5 + 0.5)) * s.height, w };
}

export interface RowPick {
  row: number;
  /** Screen distance to the click, CSS pixels. */
  pixels: number;
  /** The position it was drawn at, world. */
  point: Vec3;
  /** Clip w: view depth under perspective, for breaking ties nearest first. */
  depth: number;
}

/**
 * Nearest drawn row to a click, scanning `rows` in slices.
 *
 * A ray test first, because it is a handful of multiplications against the
 * projection's dozen and almost every row fails it: a row whose distance from
 * the click's ray is more than the pick radius at its depth cannot project
 * within the radius. Only the survivors are projected and checked against the
 * filters. `worldPerPixel(t)` is the size of one CSS pixel at distance t along
 * the ray - growing with t under perspective, constant under a parallel view.
 *
 * Yields every `sliceRows` rows so the caller can spread a scan of tens of
 * millions of rows over several frames.
 */
export function* nearestDrawnRow(
  ds: Dataset,
  drawn: DrawnRows,
  screen: ScreenSpace,
  click: { x: number; y: number },
  ray: Ray,
  worldPerPixel: (t: number) => number,
  radiusPx: number,
  sliceRows = 262_144,
): Generator<number, RowPick | null, void> {
  const resolved = resolveFilters(ds, drawn);
  const split = drawn.splitColumn ? filterColumnData(ds, drawn.splitColumn) : null;
  const { px, py, pz } = ds;
  const gy = drawn.groundY;
  const ox = ray.origin.x;
  const oy = ray.origin.y;
  const oz = ray.origin.z;
  const dx = ray.dir.x;
  const dy = ray.dir.y;
  const dz = ray.dir.z;
  // A pixel's world size is linear in t (or constant), so the cone's radius
  // squared is (a + b t)^2 - sampled at two distances to recover a and b.
  const a = worldPerPixel(0) * radiusPx * 1.5;
  const b = (worldPerPixel(1) * radiusPx * 1.5 - a);
  let best: RowPick | null = null;
  const r2 = radiusPx * radiusPx;
  for (let i = drawn.rowLo; i < drawn.rowHi; i++) {
    if ((i - drawn.rowLo) % sliceRows === sliceRows - 1) yield (i - drawn.rowLo) / Math.max(1, drawn.rowHi - drawn.rowLo);
    const x = px[i];
    const y = gy ?? py[i];
    const z = pz[i];
    const vx = x - ox;
    const vy = y - oy;
    const vz = z - oz;
    const t = vx * dx + vy * dy + vz * dz;
    if (!(t > 0)) continue;
    const perp2 = vx * vx + vy * vy + vz * vz - t * t;
    const rad = a + b * t;
    if (perp2 > rad * rad) continue;
    const p = projectPoint(screen, x, y, z);
    if (!p) continue;
    const ddx = p.x - click.x;
    const ddy = p.y - click.y;
    const d2 = ddx * ddx + ddy * ddy;
    if (d2 > r2) continue;
    const pixels = Math.sqrt(d2);
    // Nearest on screen; within half a pixel, nearest to the camera, which is
    // the one drawn on top.
    if (best && (pixels > best.pixels + 0.5 || (pixels > best.pixels - 0.5 && p.w >= best.depth))) continue;
    if (!rowDrawn(ds, i, drawn, resolved, split)) continue;
    best = { row: i, pixels, point: { x, y, z }, depth: p.w };
  }
  return best;
}

/**
 * Nearest of a small list of drawn things - the box replay's boxes - each with
 * its own pick radius in pixels.
 */
export function nearestPoint(
  screen: ScreenSpace,
  click: { x: number; y: number },
  points: Float32Array,
  stride: number,
  count: number,
  radiusPx: (w: number) => number,
): { index: number; pixels: number; depth: number } | null {
  let best: { index: number; pixels: number; depth: number } | null = null;
  for (let i = 0; i < count; i++) {
    const o = i * stride;
    const p = projectPoint(screen, points[o], points[o + 1], points[o + 2]);
    if (!p) continue;
    const pixels = Math.hypot(p.x - click.x, p.y - click.y);
    if (pixels > radiusPx(p.w)) continue;
    if (best && (pixels > best.pixels + 0.5 || (pixels > best.pixels - 0.5 && p.w >= best.depth))) continue;
    best = { index: i, pixels, depth: p.w };
  }
  return best;
}
