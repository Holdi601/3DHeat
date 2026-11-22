/**
 * A ground for a recording that has no level yet: the height the ground units
 * drove at, as a surface. Their tracks only touch the ground where they went;
 * between tracks the surface is filled from the nearest heights and smoothed,
 * so it is a height-only sketch of the terrain, not the map. With too few
 * samples it is flat at their middle height.
 *
 * Used under games that have no map extractor yet (Gunner, HEAT, PC!): the
 * replay's units, tracers and hit marks then stand on something rather than in
 * front of the reference grid. A real level, once one is in the levels folder,
 * always wins (`autoLevel.tsx`).
 */

import type { Dataset } from '../state/types';
import type { LoadedModel } from './modelLoader';

/** Rows of these kinds fly: their height says nothing about the ground. */
const AIRBORNE = /heli|air|plane|jet|uav|drone|missile|shell|round|projectile/i;
/** Fewer ground samples than this: a flat ground at their middle height. */
const MIN_SAMPLES = 20;
/** Metres around the tracks the ground reaches. */
const MARGIN = 150;
/** The grid's longest side, in cells. */
const MAX_CELLS = 200;
/** The smallest cell, metres. */
const MIN_CELL = 8;

export interface TrackGroundInfo {
  model: LoadedModel;
  /** Ground samples the heights come from. */
  samples: number;
  /** Cells with a sample of their own, of all. */
  known: number;
  cells: number;
  cell: number;
  flat: boolean;
}

function kindOf(d: Dataset): ((r: number) => string) | null {
  const a = d.attrs.find((c) => /^(kind|type)$/i.test(c.name) && c.kind === 'category');
  if (!a || !a.categories) return null;
  const ids = a.data as Uint32Array;
  const cats = a.categories;
  return (r) => cats[ids[r]] ?? '';
}

/** The ground under `d`'s ground units; null when the data has no position at all. */
export function trackGround(d: Dataset): TrackGroundInfo | null {
  const kind = kindOf(d);
  const n = d.count;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  const use = new Uint8Array(n);
  let samples = 0;
  for (let r = 0; r < n; r++) {
    const x = d.px[r], y = d.py[r], z = d.pz[r];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    // A row with no place of its own is written at the origin.
    if (x === 0 && y === 0 && z === 0) continue;
    if (kind && AIRBORNE.test(kind(r))) continue;
    use[r] = 1;
    samples++;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  if (!samples) return null;
  minX -= MARGIN;
  maxX += MARGIN;
  minZ -= MARGIN;
  maxZ += MARGIN;
  const cell = Math.max(MIN_CELL, Math.max(maxX - minX, maxZ - minZ) / MAX_CELLS);
  const nx = Math.max(1, Math.ceil((maxX - minX) / cell));
  const nz = Math.max(1, Math.ceil((maxZ - minZ) / cell));
  const vx = nx + 1, vz = nz + 1;
  const count = vx * vz;
  // The lowest sample nearest each grid point: a unit's place is on or a little above the ground.
  const h = new Float32Array(count).fill(NaN);
  const ys: number[] = [];
  for (let r = 0; r < n; r++) {
    if (!use[r]) continue;
    const i = Math.round((d.px[r] - minX) / cell);
    const j = Math.round((d.pz[r] - minZ) / cell);
    const k = j * vx + i;
    const y = d.py[r];
    if (!(h[k] <= y)) h[k] = y;
    if (ys.length < 50_000) ys.push(y);
  }
  ys.sort((a, b) => a - b);
  const middle = ys[ys.length >> 1];
  const flat = samples < MIN_SAMPLES;
  let known = 0;
  if (flat) h.fill(middle);
  else {
    // Filled outwards from the known points, each new point the mean of its known neighbours.
    const queue = new Int32Array(count);
    let head = 0, tail = 0;
    for (let k = 0; k < count; k++) if (Number.isFinite(h[k])) (queue[tail++] = k), known++;
    const done = new Uint8Array(count);
    for (let k = 0; k < count; k++) if (Number.isFinite(h[k])) done[k] = 1;
    while (head < tail) {
      const k = queue[head++];
      const i = k % vx, j = (k - i) / vx;
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const a = i + di, b = j + dj;
          if ((!di && !dj) || a < 0 || b < 0 || a >= vx || b >= vz) continue;
          const q = b * vx + a;
          if (done[q]) continue;
          let sum = 0, m = 0;
          for (let ej = -1; ej <= 1; ej++) {
            for (let ei = -1; ei <= 1; ei++) {
              const c = a + ei, e = b + ej;
              if (c < 0 || e < 0 || c >= vx || e >= vz) continue;
              const w = e * vx + c;
              if (done[w]) (sum += h[w]), m++;
            }
          }
          h[q] = sum / m;
          done[q] = 1;
          queue[tail++] = q;
        }
      }
    }
    // Two passes of a 3x3 mean: the fill's terraces and single samples' spikes smoothed out.
    const tmp = new Float32Array(count);
    for (let pass = 0; pass < 2; pass++) {
      for (let j = 0; j < vz; j++) {
        for (let i = 0; i < vx; i++) {
          let sum = 0, m = 0;
          for (let dj = -1; dj <= 1; dj++) {
            for (let di = -1; di <= 1; di++) {
              const a = i + di, b = j + dj;
              if (a < 0 || b < 0 || a >= vx || b >= vz) continue;
              sum += h[b * vx + a];
              m++;
            }
          }
          tmp[j * vx + i] = sum / m;
        }
      }
      h.set(tmp);
    }
  }

  const vertices = new Float32Array(count * 6);
  let minY = Infinity, maxY = -Infinity;
  for (let j = 0; j < vz; j++) {
    for (let i = 0; i < vx; i++) {
      const k = j * vx + i;
      const y = h[k];
      const l = h[j * vx + Math.max(0, i - 1)], rr = h[j * vx + Math.min(vx - 1, i + 1)];
      const dn = h[Math.max(0, j - 1) * vx + i], up = h[Math.min(vz - 1, j + 1) * vx + i];
      const gx = (rr - l) / (2 * cell), gz = (up - dn) / (2 * cell);
      const len = Math.hypot(gx, 1, gz);
      const o = k * 6;
      vertices[o] = minX + i * cell;
      vertices[o + 1] = y;
      vertices[o + 2] = minZ + j * cell;
      vertices[o + 3] = -gx / len;
      vertices[o + 4] = 1 / len;
      vertices[o + 5] = -gz / len;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  // Two triangles a cell, wound to face up (+y).
  const indices = new Uint32Array(nx * nz * 6);
  let o = 0;
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * vx + i, b = a + vx, c = a + 1, e = b + 1;
      indices[o++] = a;
      indices[o++] = b;
      indices[o++] = c;
      indices[o++] = c;
      indices[o++] = b;
      indices[o++] = e;
    }
  }
  const triangles = nx * nz * 2;
  const model: LoadedModel = {
    vertices,
    colours: null,
    uvs: null,
    atlas: null,
    indices,
    structureIndices: new Uint32Array(0),
    structureEdges: new Uint32Array(0),
    waterIndices: new Uint32Array(0),
    triangles,
    structureTriangles: 0,
    waterTriangles: 0,
    sourceTriangles: triangles,
    sourceStructureTriangles: 0,
    error: 0,
    partNames: [],
    partClasses: [],
    partReasons: [],
    bounds: { minX, minY, minZ, maxX: minX + nx * cell, maxY, maxZ: minZ + nz * cell },
    groundBand: { minY, maxY },
  };
  return { model, samples, known, cells: count, cell, flat };
}
