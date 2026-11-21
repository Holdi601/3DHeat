/**
 * An aircraft's landing gear, down or up, at each of its keys: what a model
 * pack's retracting gear (`gear` with `retract`, `modelpack.ts`) shows. From
 * the data where it says - a gear column (Tacview's `LandingGear`, 0 up to 1
 * down) - else from the height above the ground and the speed: down on the
 * ground and when slow and low (taking off, landing), up in flight. The height
 * is an `AGL` column where there is one, else the height over the lowest the
 * unit ever was (its airfield, for most flights).
 *
 * Worked out once when the tracks are built (`store.ts`), never per frame.
 */

import type { Dataset } from '../state/types';
import { personRows } from '../data/flight';
import { sliced, type SliceJob } from '../data/slices';

/** On the ground below this height, metres. */
const GROUND = 5;
/** Slow and low: below this height (metres) and speed (metres a second) an aeroplane has its gear down. */
const LOW = 300;
const SLOW = 90;
/** A helicopter: lower and slower (it cruises low). */
const HELI_LOW = 30;
const HELI_SLOW = 25;

/** The data's gear and height columns, where it has them. */
export interface GearColumns {
  gear: Float32Array | null;
  agl: Float32Array | null;
}

const columns = new WeakMap<Dataset, GearColumns | null>();

/** A dataset's gear and AGL columns (null when it has neither and no time: no gear to tell). */
export function gearColumns(d: Dataset): GearColumns | null {
  let c = columns.get(d);
  if (c !== undefined) return c;
  const col = (re: RegExp) => d.attrs.find((a) => a.kind !== 'category' && re.test(a.name.trim()))?.data as Float32Array | undefined;
  c = d.time ? { gear: col(/^(landing.?gear|gear(.?down)?)$/i) ?? null, agl: col(/^(agl|height.?above.?ground)$/i) ?? null } : null;
  columns.set(d, c);
  return c;
}

/**
 * Whether the gear is up at each key of one track (`rows`: its keys' dataset rows, in time order), into `out` from
 * `at` (1 up, 0 down). `units`: world units a metre; `heli`: a helicopter's lower, slower limits.
 */
export function gearUpKeys(d: Dataset, c: GearColumns, rows: ArrayLike<number>, units: number, heli: boolean, out: Uint8Array, at: number): void {
  const n = rows.length;
  if (!n || !d.time) return;
  const { px, py, pz, time } = d;
  let lowest = Infinity;
  if (!c.agl) for (let k = 0; k < n; k++) if (py[rows[k]] < lowest) lowest = py[rows[k]];
  const low = heli ? HELI_LOW : LOW;
  const slow = heli ? HELI_SLOW : SLOW;
  for (let k = 0; k < n; k++) {
    const r = rows[k];
    const g = c.gear ? c.gear[r] : NaN;
    if (Number.isFinite(g)) {
      out[at + k] = (g > 1.5 ? g / 100 : g) < 0.5 ? 1 : 0;
      continue;
    }
    const a = c.agl && Number.isFinite(c.agl[r]) ? c.agl[r] : (py[r] - lowest) / units;
    if (!Number.isFinite(a) || a < GROUND) {
      out[at + k] = 0;
      continue;
    }
    // Speed over the keys either side.
    const ra = rows[Math.max(0, k - 1)];
    const rb = rows[Math.min(n - 1, k + 1)];
    const dt = time[rb] - time[ra];
    const v = dt > 0 ? Math.hypot(px[rb] - px[ra], py[rb] - py[ra], pz[rb] - pz[ra]) / units / dt : 0;
    out[at + k] = a < low && v < slow ? 0 : 1;
  }
}

/** Rows beyond which the CPU figures (small loads; larger ones are the GPU tracks') leave the gear down. */
const ROWS_ESTIMATED = 500_000;
const rowCache = new WeakMap<Dataset, Uint8Array | null>();
const rowJobs = new WeakMap<Dataset, SliceJob<Uint8Array | null>>();

/**
 * Whether the gear is up at a dataset row, for the CPU figures (`replay.ts`): the gear column where it says, else the
 * same estimate as the tracks' keys, worked out once for the whole dataset on first asking, a slice a frame
 * (`undefined` meanwhile: the gear stays down; the first model with gear to arrive while a recording played held a
 * frame for it). The CPU figures draw small loads; a larger one keeps its gear down. Null when the data can say
 * nothing. Ask once a frame: each asking works a step at least.
 */
export function gearUpRows(d: Dataset): Uint8Array | null | undefined {
  return sliced(rowCache, rowJobs, d, () => gearRowsSteps(d));
}

function* gearRowsSteps(d: Dataset): SliceJob<Uint8Array | null> {
  const c = gearColumns(d);
  if (!c || !d.personId || d.count > ROWS_ESTIMATED) return null;
  const pr = personRows(d);
  yield;
  if (!pr) return null;
  const up = new Uint8Array(d.count);
  let tmp = new Uint8Array(0);
  let since = 0;
  for (let p = 0; p + 1 < pr.start.length; p++) {
    const rows = pr.rows.subarray(pr.start[p], pr.start[p + 1]);
    if (tmp.length < rows.length) tmp = new Uint8Array(rows.length);
    gearUpKeys(d, c, rows, d.entitySize ? d.entitySize / 0.8 : 1, false, tmp, 0);
    for (let k = 0; k < rows.length; k++) up[rows[k]] = tmp[k];
    if ((since += rows.length) > 0x4000) {
      since = 0;
      yield;
    }
  }
  return up;
}
