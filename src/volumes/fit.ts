/**
 * Sensible sizes for a freshly drawn volume, from the data around it.
 *
 * A volume drawn on the ground needs a floor and a ceiling nobody wants to type:
 * the floor goes just under the lowest data over the footprint, the ceiling just
 * over its 95th percentile height, so a stray aircraft does not stretch a
 * building-sized box up to the clouds. With no data over the footprint the box
 * stands on the ground, as tall as it is wide (within reason).
 */

import type { Dataset } from '../state/types';
import { footprintHolds, shapeFootprint, withHeights, type Vec3, type VolumeShape } from './volume';

/** Most rows read to fit a volume: a stride over the data beyond this. */
const FIT_SCAN_ROWS = 2_000_000;
/** Most heights kept for the percentiles. */
const FIT_SAMPLES = 50_000;

/** The floor and ceiling the data over the footprint asks for, or null when there is none. */
export function dataHeights(
  d: Pick<Dataset, 'px' | 'py' | 'pz' | 'count' | 'entitySize'>,
  shape: VolumeShape,
  scanRows = FIT_SCAN_ROWS,
): [number, number] | null {
  const stride = Math.max(1, Math.ceil(d.count / scanRows));
  const ys: number[] = [];
  let seen = 0;
  for (let i = 0; i < d.count; i += stride) {
    const x = d.px[i];
    const z = d.pz[i];
    const y = d.py[i];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    if (!footprintHolds(shape, x, z)) continue;
    seen++;
    // Reservoir sampling keeps the percentiles honest over a long scan.
    if (ys.length < FIT_SAMPLES) ys.push(y);
    else {
      const j = Math.floor(Math.random() * seen);
      if (j < FIT_SAMPLES) ys[j] = y;
    }
  }
  if (ys.length === 0) return null;
  ys.sort((a, b) => a - b);
  const lo = ys[0];
  const p95 = ys[Math.min(ys.length - 1, Math.floor(ys.length * 0.95))];
  const span = Math.max(p95 - lo, 0);
  const margin = Math.max(d.entitySize ?? 0, span * 0.05, 0.5);
  return [lo - margin, p95 + margin];
}

/** A shape's horizontal size: the side of a square of its footprint's area. */
export function horizontalSize(shape: VolumeShape): number {
  return Math.sqrt(Math.max(0, shapeFootprint(shape)));
}

/**
 * The shape with heights fitted to the data over it, or standing on `ground`
 * when there is none: as tall as it is wide, at most `maxHeight`.
 */
export function fitHeights(
  d: Pick<Dataset, 'px' | 'py' | 'pz' | 'count' | 'entitySize'> | null,
  shape: VolumeShape,
  ground: number,
  maxHeight = Infinity,
): VolumeShape {
  if (shape.kind === 'sphere') return shape;
  const fromData = d ? dataHeights(d, shape) : null;
  if (fromData) return withHeights(shape, fromData[0], fromData[1]);
  const h = Math.max(1, Math.min(maxHeight, horizontalSize(shape)));
  return withHeights(shape, ground, ground + h);
}

/** A default horizontal size for a volume placed with a click: a twentieth of the data's extent. */
export function defaultSize(d: Pick<Dataset, 'bounds'> | null): number {
  if (!d) return 10;
  const b = d.bounds;
  const ext = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
  return Number.isFinite(ext) && ext > 0 ? ext / 20 : 10;
}

/** The data's vertical extent, for capping a volume standing on empty ground. */
export function verticalExtent(d: Pick<Dataset, 'bounds'> | null): number {
  if (!d) return Infinity;
  const h = d.bounds.maxY - d.bounds.minY;
  return Number.isFinite(h) && h > 0 ? h : Infinity;
}

export type { Vec3 };
