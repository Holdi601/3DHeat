/**
 * An insight's place fitted to its events: the footprint and the height band
 * the rows it is about actually occupy, instead of the detector's grid cells
 * and the whole data's height - a volume that reached half the map, into the
 * sky and under the ground, says nothing about a hot spot a few metres across.
 *
 * The rows are the insight's own (its filters: event kinds, a team, a
 * player) within its place's reach. The footprint is re-centred on their
 * median and its radius is the distance that holds 85% of them; the band is
 * their 5th to 95th height percentile with a margin, never below the lowest
 * of them by more than the margin - so never under the ground they stand on.
 * Scanned a few milliseconds at a time between frames.
 */

import type { Dataset } from '../state/types';
import { runSliced } from '../render/inspector';
import { toFilterSpec } from './apply';
import type { Insight } from './types';

export interface FittedPlace {
  x: number;
  z: number;
  /** Ground radius holding most of the rows. */
  radius: number;
  floor: number;
  ceil: number;
  /** The rows inside, up to `MAX_KEPT`, for drawing what the finding is about. */
  rows: Int32Array;
  /** Rows counted (all of them, past the list's cap). */
  count: number;
  /** False when too few rows were found and the place is the detector's own. */
  fitted: boolean;
}

const MAX_KEPT = 4000;
const MIN_ROWS = 4;

function quantile(sorted: Float64Array, q: number): number {
  if (!sorted.length) return NaN;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))));
  return sorted[i];
}

/** Whether row `i` is one the insight is about: its filters, as the viewer would apply them. */
function rowTest(ds: Dataset, ins: Insight): (i: number) => boolean {
  const tests: Array<(i: number) => boolean> = [];
  for (const f of ins.filters) {
    const spec = toFilterSpec(ds, f);
    if (!spec) continue;
    if (spec.kind === 'categories') {
      const col = ds.attrs.find((a) => a.name === spec.column)?.data;
      if (!col) continue;
      const ok = new Set(spec.allowed);
      tests.push((i) => ok.has(col[i]));
    } else if (spec.kind === 'teams' && ds.teamId) {
      const ok = new Set(spec.allowed);
      const team = ds.teamId;
      tests.push((i) => ok.has(team[i]));
    } else if (spec.kind === 'persons' && ds.personId) {
      const ok = new Set(spec.allowed);
      const person = ds.personId;
      tests.push((i) => ok.has(person[i]));
    }
  }
  return (i) => tests.every((t) => t(i));
}

/** The fitting, as a generator yielding progress (0..1). */
export function* fitPlace(ds: Dataset, ins: Insight, sliceRows = 262_144): Generator<number, FittedPlace | null, void> {
  const p = ins.place;
  if (!p) return null;
  const reach = Math.max(p.radius * 1.15, p.cell);
  const r2 = reach * reach;
  const test = rowTest(ds, ins);
  const xs: number[] = [];
  const zs: number[] = [];
  const ys: number[] = [];
  const kept: number[] = [];
  let count = 0;
  const { px, py, pz } = ds;
  for (let i = 0; i < ds.count; i++) {
    if (i % sliceRows === sliceRows - 1) yield i / ds.count;
    const dx = px[i] - p.x;
    const dz = pz[i] - p.z;
    if (dx * dx + dz * dz > r2) continue;
    if (!Number.isFinite(py[i]) || !test(i)) continue;
    count++;
    // An even sample past the cap: every k-th, so the percentiles stay honest.
    if (xs.length < 200_000 || count % Math.ceil(count / 200_000) === 0) {
      xs.push(px[i]);
      zs.push(pz[i]);
      ys.push(py[i]);
    }
    if (kept.length < MAX_KEPT) kept.push(i);
  }
  const b = ds.bounds;
  if (xs.length < MIN_ROWS) {
    // Too few to fit: the detector's place, at its own height, a band of a few cells.
    const h = Math.max(p.cell, 2);
    return { x: p.x, z: p.z, radius: p.radius, floor: Math.max(b.minY, p.y - h), ceil: p.y + h, rows: Int32Array.from(kept), count, fitted: false };
  }
  const sx = Float64Array.from(xs).sort();
  const sz = Float64Array.from(zs).sort();
  const cx = quantile(sx, 0.5);
  const cz = quantile(sz, 0.5);
  const d = Float64Array.from(xs.map((x, i) => Math.hypot(x - cx, zs[i] - cz))).sort();
  const radius = Math.min(reach, Math.max(p.cell * 0.5, quantile(d, 0.85) * 1.1));
  const sy = Float64Array.from(ys).sort();
  const lo = quantile(sy, 0.05);
  const hi = quantile(sy, 0.95);
  const pad = Math.max(1, (hi - lo) * 0.15, p.cell * 0.1);
  const lowest = sy[0];
  return {
    x: cx,
    z: cz,
    radius,
    floor: Math.max(lo - pad, lowest - 0.5, b.minY - 0.5),
    ceil: Math.min(hi + pad, b.maxY + pad),
    rows: Int32Array.from(kept),
    count,
    fitted: true,
  };
}

const cache = new WeakMap<Dataset, Map<string, FittedPlace | null>>();

/** The fitted place of an insight, worked out between frames and kept per dataset. */
export async function fitInsight(ds: Dataset, ins: Insight): Promise<FittedPlace | null> {
  let per = cache.get(ds);
  if (!per) cache.set(ds, (per = new Map()));
  const key = `${ins.id}|${ins.place?.x},${ins.place?.z},${ins.place?.radius}`;
  if (per.has(key)) return per.get(key)!;
  const r = await runSliced(fitPlace(ds, ins), () => false, undefined, 6);
  per.set(key, r);
  return r;
}
