/**
 * Where the action is: the box a first look and "Frame" (F) put in view.
 *
 * The whole extent of a recording is the wrong thing to frame. A War Thunder
 * ground battle reaches out to airfields fifteen and twenty kilometres from the
 * fight, an aircraft's climb and the odd stray row stretch it further, and
 * framed whole the battle itself is a dot in the middle of the screen. So the
 * box is the densest part of the data instead: the ground is cut into a grid,
 * the busiest cells are taken until they hold nine tenths of the rows, and the
 * box is drawn round the rows in them, its height the 2nd to 98th percentile of
 * theirs. Dense cells far from the main cluster and small beside it - the
 * airfields, where aircraft stand - are left out (`mainClusters`). Where the data says what its rows are (the canonical "Event type"
 * column, data/canonical.ts), the fights alone decide (hits, damage, kills,
 * deaths), as they are what a first look is for.
 *
 * "Frame everything" (Shift+F) still frames the full extent.
 *
 * At most `SAMPLE` rows are read, strided, so it costs a few milliseconds on
 * any dataset (about 10 ms for 250,000 sampled rows); the answer is kept per
 * dataset.
 */

import type { Bounds, Dataset } from '../state/types';

/** The share of the rows (or fights) the box holds. */
export const ACTION_SHARE = 0.9;
/** Cells along each side of the ground grid. */
const GRID = 64;
/** Rows read at most. */
const SAMPLE = 250_000;
/** The canonical event column's name (`CANON.event`, data/canonical.ts). */
export const EVENT_COLUMN = 'Event type';
/** The event kinds that are fighting. */
const FIGHT = new Set(['hit', 'damage', 'kill', 'death', 'destroyed', 'explosion']);
/** Fewer fights than this sampled and the positions decide instead. */
const MIN_FIGHTS = 40;
/** A cluster of dense cells this small beside the biggest is left out (`mainClusters`). */
const CLUSTER_SHARE = 0.25;
/** A box this close to the full extent is the full extent. */
const NO_GAIN = 0.8;

const cache = new WeakMap<Dataset, Bounds>();

/**
 * Of the dense cells, the clusters that matter: cells two apart or closer
 * join, and a cluster is kept when it holds at least `CLUSTER_SHARE` of the
 * biggest one's rows. An airfield is dense - aircraft stand and taxi there -
 * but small beside the battle, and kilometres from it; two equal fights in
 * two places are both kept.
 */
function mainClusters(dense: Uint8Array, counts: Uint32Array): Uint8Array {
  const label = new Int32Array(GRID * GRID).fill(-1);
  const mass: number[] = [];
  const stack: number[] = [];
  for (let c = 0; c < dense.length; c++) {
    if (!dense[c] || label[c] >= 0) continue;
    const id = mass.length;
    let sum = 0;
    label[c] = id;
    stack.push(c);
    while (stack.length) {
      const k = stack.pop()!;
      sum += counts[k];
      const kx = k % GRID;
      const kz = (k - kx) / GRID;
      for (let dz = -2; dz <= 2; dz++) {
        const z = kz + dz;
        if (z < 0 || z >= GRID) continue;
        for (let dx = -2; dx <= 2; dx++) {
          const x = kx + dx;
          if (x < 0 || x >= GRID) continue;
          const j = z * GRID + x;
          if (dense[j] && label[j] < 0) {
            label[j] = id;
            stack.push(j);
          }
        }
      }
    }
    mass.push(sum);
  }
  const top = Math.max(0, ...mass);
  const keep = new Uint8Array(GRID * GRID);
  for (let c = 0; c < keep.length; c++) if (label[c] >= 0 && mass[label[c]] >= top * CLUSTER_SHARE) keep[c] = 1;
  return keep;
}

/** The action box of a dataset (see the module comment); its full bounds where it cannot say. */
export function actionBounds(d: Dataset): Bounds {
  const hit = cache.get(d);
  if (hit) return hit;
  const col = d.attrs.find((a) => a.name === EVENT_COLUMN && a.kind === 'category');
  const fights = col?.categories && col.data.length >= d.count ? fightCodes(col.categories) : null;
  const box = computeActionBounds(d.px, d.py, d.pz, d.count, d.bounds, fights ? { codes: col!.data, fights } : null);
  cache.set(d, box);
  return box;
}

function fightCodes(categories: string[]): Set<number> | null {
  const out = new Set<number>();
  categories.forEach((c, i) => {
    if (FIGHT.has(c.toLowerCase())) out.add(i);
  });
  return out.size ? out : null;
}

/**
 * The action box of positions `px/py/pz` (`count` rows, `bounds` their extent).
 * `events`, when given, marks the fighting rows: their category codes and the
 * codes that are fights.
 */
export function computeActionBounds(
  px: ArrayLike<number>,
  py: ArrayLike<number>,
  pz: ArrayLike<number>,
  count: number,
  bounds: Bounds,
  events: { codes: ArrayLike<number>; fights: Set<number> } | null = null,
): Bounds {
  const n = Math.min(count, px.length, py.length, pz.length);
  const spanX = bounds.maxX - bounds.minX;
  const spanZ = bounds.maxZ - bounds.minZ;
  if (n < 2 || !(spanX > 0 || spanZ > 0) || !Number.isFinite(spanX + spanZ)) return bounds;
  const stride = Math.max(1, Math.ceil(n / SAMPLE));

  // The rows that decide: the fights where there are enough of them, else all.
  let rows: Uint32Array;
  {
    const all = new Uint32Array(Math.ceil(n / stride));
    let m = 0;
    let f = 0;
    const fights = events ? new Uint32Array(all.length) : null;
    for (let i = 0; i < n; i += stride) {
      const x = px[i];
      const z = pz[i];
      if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(py[i])) continue;
      all[m++] = i;
      if (fights && events!.fights.has(events!.codes[i])) fights[f++] = i;
    }
    rows = fights && f >= MIN_FIGHTS ? fights.subarray(0, f) : all.subarray(0, m);
  }
  if (rows.length < 2) return bounds;

  // The ground grid: rows per cell.
  const cw = Math.max(spanX, 1e-9) / GRID;
  const ch = Math.max(spanZ, 1e-9) / GRID;
  const cellOf = (i: number) => {
    const cx = Math.min(GRID - 1, Math.max(0, Math.floor((px[i] - bounds.minX) / cw)));
    const cz = Math.min(GRID - 1, Math.max(0, Math.floor((pz[i] - bounds.minZ) / ch)));
    return cz * GRID + cx;
  };
  const counts = new Uint32Array(GRID * GRID);
  for (const i of rows) counts[cellOf(i)]++;

  // The busiest cells, until they hold the share.
  const order = Array.from(counts.keys()).filter((c) => counts[c] > 0);
  order.sort((a, b) => counts[b] - counts[a]);
  const dense = new Uint8Array(GRID * GRID);
  const want = rows.length * ACTION_SHARE;
  let held = 0;
  for (const c of order) {
    dense[c] = 1;
    held += counts[c];
    if (held >= want) break;
  }
  const keep = mainClusters(dense, counts);

  // The box round the rows in them; its height their 2nd to 98th percentile.
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  // A typed array: its sort is numeric and several times quicker than an
  // array's with a comparator, which matters on the frame that frames a load.
  const all = new Float32Array(rows.length);
  let m = 0;
  for (const i of rows) {
    if (!keep[cellOf(i)]) continue;
    const x = px[i];
    const z = pz[i];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
    all[m++] = py[i];
  }
  if (!m) return bounds;
  const ys = all.subarray(0, m).sort();
  const q = (p: number) => ys[Math.min(m - 1, Math.max(0, Math.floor(p * (m - 1))))];
  let minY = q(0.02);
  let maxY = q(0.98);

  // A margin, and never thinner than a cell.
  const padX = Math.max((maxX - minX) * 0.05, cw * 0.5);
  const padZ = Math.max((maxZ - minZ) * 0.05, ch * 0.5);
  minX = Math.max(bounds.minX, minX - padX);
  maxX = Math.min(bounds.maxX, maxX + padX);
  minZ = Math.max(bounds.minZ, minZ - padZ);
  maxZ = Math.min(bounds.maxZ, maxZ + padZ);
  if (!(maxY > minY)) {
    const pad = Math.max(1e-3, Math.min(maxX - minX, maxZ - minZ) * 0.01);
    minY -= pad;
    maxY += pad;
  }

  // The ground not worth narrowing when the box is most of it anyway; the
  // height still drops the stray rows far above and below.
  const area = (maxX - minX) * (maxZ - minZ);
  const full = Math.max(spanX, 1e-9) * Math.max(spanZ, 1e-9);
  if (area >= full * NO_GAIN) return { ...bounds, minY: Math.max(bounds.minY, minY), maxY: Math.min(bounds.maxY, maxY) };
  return { minX, minY, minZ, maxX, maxY, maxZ };
}
