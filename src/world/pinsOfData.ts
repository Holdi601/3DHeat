/**
 * A dataset's ground pins (`groundPins.ts`): worked out on the page, in
 * slices, and handed to the stream worker.
 */

import type { Dataset } from '../state/types';
import { worldToData } from '../render/pose';
import { groundPersons } from '../data/groundFit';
import type { GroundPins } from './groundPins';
import { eastNorthOf, heightOf, planeInverse } from './tiles';

/** Pins at most: points closer than `PIN_CELL` degrees are one, their heights averaged. */
const MAX_PINS = 200_000;
/** Degrees a pin stands for, about 30 m. */
const PIN_CELL = 0.0003;
/** Rows a slice of `groundPinsSteps` goes through before it yields. */
const STEP = 1 << 14;

const SEA = /(^|\+)sea(\+|$)|ship|boat|watercraft|naval|submarine/i;

/**
 * The pins of a dataset on the earth: its vehicles' rows (ships float on a
 * sea that is flat anyway), merged into cells about 30 m wide. Null when it
 * has no vehicles or no place on the earth.
 */
export function* groundPinsSteps(d: Dataset): Generator<void, GroundPins | null, void> {
  const geo = d.geo;
  const ground = groundPersons(d);
  if (!geo || !ground || !d.personId) return null;
  const type = d.attrs.find((a) => a.kind === 'category' && /^(kind|type)$/i.test(a.name.trim()));
  const sea = type?.categories ? type.categories.map((c) => SEA.test(c ?? '')) : null;
  const inverse = planeInverse(geo);
  const axes = d.axes ?? null;
  const cells = new Map<number, [number, number, number, number]>();
  for (let r = 0; r < d.count; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    if (!ground[d.personId[r]]) continue;
    if (sea && type && sea[(type.data as Uint32Array)[r]]) continue;
    const p = worldToData({ x: d.px[r], y: d.py[r], z: d.pz[r] }, axes);
    const h = heightOf(geo, p);
    const [e, n] = eastNorthOf(geo, p);
    const [lat, lon] = inverse(e, n);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(h)) continue;
    const key = Math.round(lat / PIN_CELL) * 2_000_000 + Math.round(lon / PIN_CELL);
    const c = cells.get(key);
    if (c) {
      c[0] += lat;
      c[1] += lon;
      c[2] += h;
      c[3]++;
    } else {
      if (cells.size >= MAX_PINS) continue;
      cells.set(key, [lat, lon, h, 1]);
    }
  }
  if (!cells.size) return null;
  const out = new Float64Array(cells.size * 3);
  let i = 0;
  for (const [lat, lon, h, n] of cells.values()) {
    out[i++] = lat / n;
    out[i++] = lon / n;
    out[i++] = h / n;
  }
  return out;
}
