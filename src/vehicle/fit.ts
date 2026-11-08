/**
 * Moving a vehicle's hits onto its figure.
 *
 * A game sends a hit point in its own model's frame, whose origin is where
 * the game put it - War Thunder's Me 264 has it some 5 m ahead of the
 * middle, near the wing's leading edge - while a figure is built round the
 * middle of its box. The figure's shape is near enough the real one; its
 * origin is not. So each vehicle's hits are moved, all by the same amount,
 * to where they lie best on the figure's surface: the translation that
 * brings the most of them nearest the surface (a registration, translation
 * only, over a distance field of the figure), searched over a box a third of
 * the figure each way, and only when there are enough hits to say.
 */

import type { Vec3 } from '../race/geometry';
import type { Template } from '../figures/kit';
import { heatMeshOf } from './surface';

/** Fewer hits than this say too little about where the figure is: they are not moved. */
export const FIT_MIN_HITS = 12;

/** Distances to a figure's surface on a grid of cells round it, capped. */
export interface DistanceField {
  min: Vec3;
  cell: number;
  nx: number;
  ny: number;
  nz: number;
  /** Distance from each cell's centre to the nearest surface point, at most `cap`. */
  d: Float32Array;
  cap: number;
}

/** The field round a template: cells a hundredth of its size, a margin of a third of it, distances capped at `cap` cells. */
export function distanceField(t: Template, capCells = 5): DistanceField {
  const mesh = heatMeshOf(t, 12_000, 12);
  const size = Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.1);
  const cell = size / 100;
  const pad = size / 3 + capCells * cell;
  const min: Vec3 = [t.min[0] - pad, t.min[1] - pad, t.min[2] - pad];
  const nx = Math.ceil((t.max[0] - t.min[0] + 2 * pad) / cell) + 1;
  const ny = Math.ceil((t.max[1] - t.min[1] + 2 * pad) / cell) + 1;
  const nz = Math.ceil((t.max[2] - t.min[2] + 2 * pad) / cell) + 1;
  const cap = capCells * cell;
  const d = new Float32Array(nx * ny * nz).fill(cap);
  const r = capCells;
  // One surface point a cell is enough at this resolution: the many vertices of the cut mesh in one cell add nothing.
  const seen = new Uint8Array(nx * ny * nz);
  for (let v = 0; v < mesh.count; v++) {
    const px = mesh.pos[v * 3], py = mesh.pos[v * 3 + 1], pz = mesh.pos[v * 3 + 2];
    const ci = Math.floor((px - min[0]) / cell), cj = Math.floor((py - min[1]) / cell), ck = Math.floor((pz - min[2]) / cell);
    const own = (ci * ny + cj) * nz + ck;
    if (seen[own]) continue;
    seen[own] = 1;
    for (let i = Math.max(0, ci - r); i <= Math.min(nx - 1, ci + r); i++) {
      const dx = min[0] + (i + 0.5) * cell - px;
      for (let j = Math.max(0, cj - r); j <= Math.min(ny - 1, cj + r); j++) {
        const dy = min[1] + (j + 0.5) * cell - py;
        for (let k = Math.max(0, ck - r); k <= Math.min(nz - 1, ck + r); k++) {
          const dz = min[2] + (k + 0.5) * cell - pz;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const o = (i * ny + j) * nz + k;
          if (dist < d[o]) d[o] = dist;
        }
      }
    }
  }
  return { min, cell, nx, ny, nz, d, cap };
}

/** The field's distance at a point: the nearest cell's, `cap` outside the field. */
export function distanceAt(f: DistanceField, x: number, y: number, z: number): number {
  const i = Math.floor((x - f.min[0]) / f.cell), j = Math.floor((y - f.min[1]) / f.cell), k = Math.floor((z - f.min[2]) / f.cell);
  if (i < 0 || j < 0 || k < 0 || i >= f.nx || j >= f.ny || k >= f.nz) return f.cap;
  return f.d[(i * f.ny + j) * f.nz + k];
}

/**
 * The translation that puts `points` nearest the surface: the mean capped
 * distance, least, over offsets up to a third of the figure along its length
 * and height and a tenth across (a figure is symmetric; a hit cloud seldom
 * says much side to side), first coarsely, then finely round the best. A
 * small cost on the offset's length keeps it at zero when nothing is gained.
 */
export function fitOffset(t: Template, field: DistanceField, points: Vec3[]): Vec3 {
  if (points.length < FIT_MIN_HITS) return [0, 0, 0];
  // At most a few hundred, spread over the set.
  const step = Math.max(1, Math.floor(points.length / 400));
  const pts = points.filter((_, i) => i % step === 0);
  const ext: Vec3 = [t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2]];
  const reach: Vec3 = [ext[0] / 3, ext[1] / 3, ext[2] / 10];
  const penalty = 0.02;
  const score = (ox: number, oy: number, oz: number) => {
    let s = 0;
    for (const p of pts) s += distanceAt(field, p[0] + ox, p[1] + oy, p[2] + oz);
    return s / pts.length / field.cap + penalty * Math.hypot(ox / ext[0], oy / Math.max(ext[1], 0.1), oz / Math.max(ext[2], 0.1)) * 10;
  };
  let best: Vec3 = [0, 0, 0];
  let bestScore = score(0, 0, 0);
  const search = (centre: Vec3, half: Vec3, n: number) => {
    const c0 = centre;
    for (let a = -n; a <= n; a++)
      for (let b = -n; b <= n; b++)
        for (let c = -Math.min(n, 2); c <= Math.min(n, 2); c++) {
          const o: Vec3 = [c0[0] + (half[0] * a) / n, c0[1] + (half[1] * b) / n, c0[2] + (half[2] * c) / Math.min(n, 2)];
          const sc = score(o[0], o[1], o[2]);
          if (sc < bestScore - 1e-9) {
            bestScore = sc;
            best = o;
          }
        }
  };
  search([0, 0, 0], reach, 12);
  const fine: Vec3 = [reach[0] / 12, reach[1] / 12, reach[2] / 2];
  search(best, fine, 4);
  return best.map((v) => Math.round(v * 100) / 100) as Vec3;
}

const fields = new WeakMap<Template, DistanceField>();
const offsets = new WeakMap<Template, WeakMap<object, Vec3>>();

/** `fitOffset` for a figure and a vehicle's hits (the array, as kept by the view), once. */
export function offsetFor(t: Template, hits: { local: Vec3 | null }[]): Vec3 {
  let byHits = offsets.get(t);
  if (!byHits) offsets.set(t, (byHits = new WeakMap()));
  let o = byHits.get(hits);
  if (!o) {
    const pts = hits.map((h) => h.local).filter((p): p is Vec3 => p !== null);
    if (pts.length < FIT_MIN_HITS) o = [0, 0, 0];
    else {
      let f = fields.get(t);
      if (!f) fields.set(t, (f = distanceField(t)));
      o = fitOffset(t, f, pts);
    }
    byHits.set(hits, o);
  }
  return o;
}

const shiftedCache = new WeakMap<object, { key: string; out: unknown[] }>();

/** The hits with their points moved by `o` (the same array when `o` is zero); kept per array and offset. */
export function shiftHits<H extends { local: Vec3 | null }>(hits: H[], o: Vec3): H[] {
  if (o[0] === 0 && o[1] === 0 && o[2] === 0) return hits;
  const key = o.join(',');
  const c = shiftedCache.get(hits);
  if (c && c.key === key) return c.out as H[];
  const out = hits.map((h) => (h.local ? { ...h, local: [h.local[0] + o[0], h.local[1] + o[1], h.local[2] + o[2]] as Vec3 } : h));
  shiftedCache.set(hits, { key, out });
  return out;
}
