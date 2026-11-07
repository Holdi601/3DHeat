/**
 * Spatial index over a chunk's rows, so a frame can spend its sprite budget on
 * what the camera can actually see.
 *
 * The sampler this supplements is purely temporal: the time window is one
 * contiguous run of rows, and the frame's budget is spread evenly across it.
 * That is right for playback and wrong for looking at anything smaller than the
 * whole map. Measured on a uniform 8km field with the far cull set to what was
 * being looked at:
 *
 *   view across      in frustum    also within the cull
 *   whole map            100%              100%
 *   2000 m               44.9%             28.7%
 *   500 m                28.1%              1.74%
 *   120 m                24.0%              0.051%
 *   40 m                 23.1%              0.003%
 *
 * Two things in that table decided the design. The frustum alone is nearly
 * worthless — it is a cone that keeps widening to the far plane, so it still
 * holds a quarter of the map when you are looking at a doorway. The *distance*
 * bound is where all the work is. So the index is built to answer "which cells
 * are within this shell around the eye, nearest first", and the frustum is a
 * cheap extra reject on top rather than the main event.
 *
 * Row order is left exactly as it is. The dataset is time-sorted and has to stay
 * that way: `TrackCursor` advances a cursor through it and takes every row it
 * crosses as a newer sample for that person, and the time window is a pair of
 * binary searches. So this is a *permutation* — the rows in an order that groups
 * them spatially — and the time sort is still what decides which rows are
 * candidates at all. The permutation only decides which of those candidates the
 * budget is spent on.
 */

/** Cells per axis on the ground plane, and vertically. */
const GRID_XZ = 32;
const GRID_Y = 8;

export interface Bounds3 {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export interface SpatialIndex {
  /** Chunk-local row indices, grouped by cell, ascending within each cell. */
  order: Uint32Array;
  /** `cellStart[c]`..`cellStart[c+1]` is cell c's slice of `order`. */
  cellStart: Uint32Array;
  /** Cell centres and half-extents, for the distance and frustum tests. */
  cellBounds: Float32Array;
  cells: number;
  nx: number;
  ny: number;
  nz: number;
}

/**
 * Build the index for one chunk's rows.
 *
 * `rowLo` is the chunk's first row in dataset terms; the permutation is stored
 * chunk-local so it can be uploaded as-is beside the chunk's other per-row data.
 *
 * Counting sort rather than a comparison sort: one pass to count, a prefix sum,
 * one pass to place. At eight million rows a chunk that is the difference between
 * a hitch you notice on load and one you do not.
 */
export function buildSpatialIndex(
  px: Float32Array,
  py: Float32Array,
  pz: Float32Array,
  rowLo: number,
  rowHi: number,
  bounds: Bounds3,
): SpatialIndex {
  const rows = Math.max(0, rowHi - rowLo);
  const nx = GRID_XZ;
  const ny = GRID_Y;
  const nz = GRID_XZ;
  const cells = nx * ny * nz;

  const spanX = Math.max(1e-6, bounds.maxX - bounds.minX);
  const spanY = Math.max(1e-6, bounds.maxY - bounds.minY);
  const spanZ = Math.max(1e-6, bounds.maxZ - bounds.minZ);
  const sx = nx / spanX;
  const sy = ny / spanY;
  const sz = nz / spanZ;

  const cellOf = (i: number): number => {
    // Clamped rather than rejected: a row outside the bounds is a row the bounds
    // are wrong about, and dropping it from the index would drop it from the
    // picture. The edge cells absorb them.
    const cx = clampInt((px[i] - bounds.minX) * sx, nx);
    const cy = clampInt((py[i] - bounds.minY) * sy, ny);
    const cz = clampInt((pz[i] - bounds.minZ) * sz, nz);
    return (cy * nz + cz) * nx + cx;
  };

  const counts = new Uint32Array(cells + 1);
  for (let r = rowLo; r < rowHi; r++) counts[cellOf(r) + 1]++;
  for (let c = 0; c < cells; c++) counts[c + 1] += counts[c];
  const cellStart = counts.slice();

  const order = new Uint32Array(rows);
  const cursor = counts.slice(0, cells);
  for (let r = rowLo; r < rowHi; r++) {
    const c = cellOf(r);
    // Rows are visited in ascending order, so each cell's slice comes out
    // ascending too — which is what lets the time window be found inside a cell
    // with a binary search instead of a scan.
    order[cursor[c]++] = r - rowLo;
  }

  const cellBounds = new Float32Array(cells * 6);
  const wx = spanX / nx;
  const wy = spanY / ny;
  const wz = spanZ / nz;
  for (let y = 0; y < ny; y++) {
    for (let z = 0; z < nz; z++) {
      for (let x = 0; x < nx; x++) {
        const c = (y * nz + z) * nx + x;
        const o = c * 6;
        cellBounds[o] = bounds.minX + (x + 0.5) * wx;
        cellBounds[o + 1] = bounds.minY + (y + 0.5) * wy;
        cellBounds[o + 2] = bounds.minZ + (z + 0.5) * wz;
        cellBounds[o + 3] = wx * 0.5;
        cellBounds[o + 4] = wy * 0.5;
        cellBounds[o + 5] = wz * 0.5;
      }
    }
  }

  return { order, cellStart, cellBounds, cells, nx, ny, nz };
}

function clampInt(v: number, n: number): number {
  const i = Math.floor(v);
  return i < 0 ? 0 : i >= n ? n - 1 : i;
}

/** A camera's clip planes, as `ax + by + cz + d >= 0` for inside. */
export type FrustumPlanes = Float32Array;

/**
 * Six planes from a view-projection matrix, inward-facing and normalised.
 *
 * Normalised because the box test needs a distance, not just a sign: an
 * unnormalised plane still tells you which side a point is on but scales the
 * projected box radius by an unknown factor, which rejects cells that straddle
 * the plane.
 */
export function frustumFrom(m: ArrayLike<number>): FrustumPlanes {
  const p = new Float32Array(24);
  // Column-major, as three.js stores it.
  const row = (i: number) => [m[i], m[4 + i], m[8 + i], m[12 + i]] as const;
  const [x0, x1, x2, x3] = row(0);
  const [y0, y1, y2, y3] = row(1);
  const [z0, z1, z2, z3] = row(2);
  const [w0, w1, w2, w3] = row(3);
  const set = (k: number, a: number, b: number, c: number, d: number) => {
    const len = Math.hypot(a, b, c) || 1;
    p[k * 4] = a / len;
    p[k * 4 + 1] = b / len;
    p[k * 4 + 2] = c / len;
    p[k * 4 + 3] = d / len;
  };
  set(0, w0 + x0, w1 + x1, w2 + x2, w3 + x3); // left
  set(1, w0 - x0, w1 - x1, w2 - x2, w3 - x3); // right
  set(2, w0 + y0, w1 + y1, w2 + y2, w3 + y3); // bottom
  set(3, w0 - y0, w1 - y1, w2 - y2, w3 - y3); // top
  set(4, w0 + z0, w1 + z1, w2 + z2, w3 + z3); // near
  set(5, w0 - z0, w1 - z1, w2 - z2, w3 - z3); // far
  return p;
}

export interface CellQuery {
  eyeX: number;
  eyeY: number;
  eyeZ: number;
  /** Inclusive distance shell from the eye. `far <= 0` means unbounded. */
  near: number;
  far: number;
  /** Omit to skip the frustum reject. */
  planes?: FrustumPlanes;
  /**
   * How far a sprite reaches beyond its centre. Cells are grown by it before
   * testing, because a row just outside the view still paints inside it.
   */
  margin: number;
}

export interface VisibleCell {
  cell: number;
  /** Distance from the eye to the nearest point of the cell. */
  distance: number;
}

/**
 * Cells that could contribute, nearest first.
 *
 * Nearest first is what makes the budget spend itself well when there is not
 * enough of it: the rows closest to the camera are the ones whose sprites cover
 * the most pixels, so a partial frame that starts near looks finished long
 * before one that starts at an arbitrary distance.
 */
export function visibleCells(index: SpatialIndex, q: CellQuery): VisibleCell[] {
  const out: VisibleCell[] = [];
  const { cellBounds, cells } = index;
  const far = q.far > 0 ? q.far + q.margin : Infinity;
  const near = Math.max(0, q.near - q.margin);
  for (let c = 0; c < cells; c++) {
    if (index.cellStart[c + 1] === index.cellStart[c]) continue;
    const o = c * 6;
    const cx = cellBounds[o];
    const cy = cellBounds[o + 1];
    const cz = cellBounds[o + 2];
    const hx = cellBounds[o + 3] + q.margin;
    const hy = cellBounds[o + 4] + q.margin;
    const hz = cellBounds[o + 5] + q.margin;

    // Distance from the eye to the box, and to its far corner. The shell test
    // needs both: a cell is out if it is entirely nearer than `near` or entirely
    // further than `far`.
    const dx = Math.max(0, Math.abs(q.eyeX - cx) - hx);
    const dy = Math.max(0, Math.abs(q.eyeY - cy) - hy);
    const dz = Math.max(0, Math.abs(q.eyeZ - cz) - hz);
    const dNear = Math.hypot(dx, dy, dz);
    if (dNear > far) continue;
    if (near > 0) {
      const fx = Math.abs(q.eyeX - cx) + hx;
      const fy = Math.abs(q.eyeY - cy) + hy;
      const fz = Math.abs(q.eyeZ - cz) + hz;
      if (Math.hypot(fx, fy, fz) < near) continue;
    }

    if (q.planes) {
      let outside = false;
      for (let k = 0; k < 6; k++) {
        const a = q.planes[k * 4];
        const b = q.planes[k * 4 + 1];
        const cc = q.planes[k * 4 + 2];
        const d = q.planes[k * 4 + 3];
        // Signed distance of the centre, less the box's extent along the normal.
        const r = Math.abs(a) * hx + Math.abs(b) * hy + Math.abs(cc) * hz;
        if (a * cx + b * cy + cc * cz + d + r < 0) {
          outside = true;
          break;
        }
      }
      if (outside) continue;
    }

    out.push({ cell: c, distance: dNear });
  }
  out.sort((a, b) => a.distance - b.distance);
  return out;
}

/**
 * The slice of a cell's rows that falls inside a dataset row range.
 *
 * The time window arrives as a row range because the dataset is time-sorted, and
 * a cell's entry in `order` is ascending, so the intersection is two binary
 * searches. This is the join between the two orderings: time decides which rows
 * are candidates, the cell decides which of them are worth drawing.
 *
 * Returns chunk-local `order` offsets, not row numbers.
 */
export function cellRowRange(
  index: SpatialIndex,
  cell: number,
  loLocal: number,
  hiLocal: number,
): [number, number] {
  const { order, cellStart } = index;
  const a = cellStart[cell];
  const b = cellStart[cell + 1];
  return [lowerBoundU32(order, loLocal, a, b), lowerBoundU32(order, hiLocal, a, b)];
}

function lowerBoundU32(arr: Uint32Array, value: number, lo: number, hi: number): number {
  let a = lo;
  let b = hi;
  while (a < b) {
    const m = (a + b) >>> 1;
    if (arr[m] < value) a = m + 1;
    else b = m;
  }
  return a;
}
