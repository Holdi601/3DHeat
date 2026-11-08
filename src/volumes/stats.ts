/**
 * Statistics over the rows inside volumes.
 *
 * One pass over the dataset answers every volume (and their combination) at
 * once: how many rows each holds, of all rows and of the rows currently shown
 * (the filters and the time window), how many players, teams and matches,
 * how long they spent inside and how often they went in and out, how dense
 * the data is inside (peak and mean rows per square unit, the CPU twin of the
 * heat), when it happened, and for every column the dataset kept: the top
 * values with their shares and how over-represented each is inside (lift), or
 * the range, mean, median, percentiles and histogram.
 *
 * Run in slices on the main thread rather than in a worker: the columns are
 * ordinary ArrayBuffers (the page is deliberately not cross-origin isolated, so
 * there is no SharedArrayBuffer), and handing a worker its own copy of a
 * 100M-row dataset would double the memory the load was sized to fit. Each
 * slice is a few milliseconds, between which the page paints and handles input,
 * and a newer request cancels an older one.
 */

import type { ActiveFilter } from '../render/types';
import { filterColumnData } from '../render/filterTables';
import type { Dataset } from '../state/types';
import {
  compiled,
  compiledContains,
  selection,
  selectionHolds,
  shapeFootprint,
  shapeVolume,
  type CompiledVolume,
  type Selection,
  type Volume,
} from './volume';

/** The rows the view currently shows: what "share of shown" is a share of. */
export interface Scope {
  /** Inclusive time window, dataset seconds; ±Infinity for all of it. */
  timeLo: number;
  timeHi: number;
  /** Lifetime windowing: a row shows while `time <= now < time + life`. Null otherwise. */
  lifetimeNow: number | null;
  defaultLifetime: number;
  filters: ActiveFilter[];
  /** Per group, 0 hidden; null shows every group. */
  groupShown: Int8Array | null;
  /** The session played back, or -1 for all. */
  session: number;
}

export const FULL_SCOPE: Scope = {
  timeLo: -Infinity,
  timeHi: Infinity,
  lifetimeNow: null,
  defaultLifetime: 0,
  filters: [],
  groupShown: null,
  session: -1,
};

export interface CategoryValue {
  label: string;
  count: number;
  /** Of the rows inside (and shown). */
  share: number;
  /** Of all shown rows, inside or not. */
  overall: number;
  /** share / overall: above 1, over-represented inside. */
  lift: number;
}

export type ColumnStats =
  | { name: string; kind: 'category'; distinct: number; top: CategoryValue[] }
  | {
      name: string;
      kind: 'number';
      count: number;
      min: number;
      max: number;
      mean: number;
      /** The same column's mean over every shown row, for comparison. */
      overallMean: number;
      median: number;
      p5: number;
      p95: number;
      /** Counts over `HIST_BINS` equal bins from `histMin` to `histMax`. */
      hist: number[];
      histMin: number;
      histMax: number;
    };

export interface VolumeStats {
  /** The volume's id, or `SELECTION_ID` for the combination. */
  id: string;
  name: string;
  color: string;
  /** Rows inside, ignoring the filters and the time window. */
  rowsAll: number;
  shareAll: number;
  /** Rows inside and shown. */
  rows: number;
  /** Of the shown rows. */
  shareShown: number;
  persons: number | null;
  teams: number | null;
  sessions: number | null;
  /** Seconds spent inside, summed over everyone (from each row's gap to the next sample). */
  dwell: number | null;
  entries: number | null;
  exits: number | null;
  /** Rows per square world unit in the densest cell, and over the cells with data. */
  peakDensity: number;
  meanDensity: number;
  /** Side of the density cells, world units. */
  cellSize: number;
  /** Where the densest cell is (x, z). */
  peakAt: [number, number] | null;
  /** Rows inside and shown over time, `TIME_BINS` bins over `timeRange`. */
  timeHist: number[] | null;
  timeRange: [number, number] | null;
  /** World units cubed and squared; null for the combination. */
  volume: number | null;
  footprint: number | null;
  columns: ColumnStats[];
}

export interface StatsResult {
  totalRows: number;
  shownRows: number;
  volumes: VolumeStats[];
  /** True when the pass read every row. */
  complete: boolean;
}

export const SELECTION_ID = '\u0000selection';
export const HIST_BINS = 32;
export const TIME_BINS = 48;
/** Bins the numeric percentiles are read from. */
const FINE_BINS = 1024;
/** Most density cells a side. */
const GRID_SIDE = 256;
/** Most values listed per categorical column. */
export const TOP_VALUES = 12;

interface Target {
  id: string;
  name: string;
  color: string;
  test: CompiledVolume | Selection;
  min: [number, number, number];
  max: [number, number, number];
  volume: number | null;
  footprint: number | null;
}

interface Acc {
  t: Target;
  rowsAll: number;
  rows: number;
  persons: Uint8Array | null;
  teams: Uint8Array | null;
  sessions: Uint8Array | null;
  dwell: number;
  entries: number;
  exits: number;
  /** Per person: 0 unknown, 1 last sample outside, 2 inside. Per session, reset when the person's session changes. */
  last: Uint8Array | null;
  lastSession: Int32Array | null;
  grid: Uint32Array;
  gx0: number;
  gz0: number;
  cell: number;
  gw: number;
  gh: number;
  time: Float64Array | null;
  cats: (Uint32Array | null)[];
  num: ({ sum: number; n: number; min: number; max: number; fine: Uint32Array } | null)[];
}

/** Everything a pass needs, prepared once. */
export interface StatsJob {
  ds: Dataset;
  scope: Scope;
  targets: Target[];
  accs: Acc[];
  overallCats: (Uint32Array | null)[];
  overallNum: ({ sum: number; n: number } | null)[];
  shown: number;
  filterData: { f: ActiveFilter; data: ArrayLike<number> | null }[];
  dwellCap: number;
  next: number;
}

/** The targets: each visible volume, and the combination when there is more than one. */
function targetsOf(volumes: readonly Volume[], ds: Dataset): Target[] {
  const out: Target[] = [];
  const vis = volumes.filter((v) => v.visible);
  for (const v of vis) {
    const c = compiled(v);
    out.push({
      id: v.id,
      name: v.name,
      color: v.color,
      test: c,
      min: [...c.min] as [number, number, number],
      max: [...c.max] as [number, number, number],
      volume: shapeVolume(v.shape),
      footprint: shapeFootprint(v.shape),
    });
  }
  if (vis.length > 1) {
    const sel = selection(vis);
    // The combination's bounds: its includes', or the data's when there are only excludes.
    const inc = sel.include;
    const b = ds.bounds;
    const min: [number, number, number] = inc.length
      ? [Math.min(...inc.map((c) => c.min[0])), Math.min(...inc.map((c) => c.min[1])), Math.min(...inc.map((c) => c.min[2]))]
      : [b.minX, b.minY, b.minZ];
    const max: [number, number, number] = inc.length
      ? [Math.max(...inc.map((c) => c.max[0])), Math.max(...inc.map((c) => c.max[1])), Math.max(...inc.map((c) => c.max[2]))]
      : [b.maxX, b.maxY, b.maxZ];
    out.push({ id: SELECTION_ID, name: '', color: '#ffffff', test: sel, min, max, volume: null, footprint: null });
  }
  return out;
}

/** A typical gap between one track's samples, for capping dwell across long gaps (a death, a disconnect). */
function dwellCapOf(ds: Dataset): number {
  const life = ds.lifetime;
  if (!life) return Infinity;
  const sample: number[] = [];
  const stride = Math.max(1, Math.floor(ds.count / 20_000));
  for (let i = 0; i < ds.count && sample.length < 20_000; i += stride) if (life[i] >= 0) sample.push(life[i]);
  if (sample.length === 0) return Infinity;
  sample.sort((a, b) => a - b);
  const median = sample[sample.length >> 1];
  // Ten typical gaps, at least a second: longer than any sampling hiccup, shorter than a respawn.
  return Math.max(1, median * 10);
}

export function prepareStats(ds: Dataset, volumes: readonly Volume[], scope: Scope, heatRadius: number): StatsJob {
  const targets = targetsOf(volumes, ds);
  const persons = ds.personId ? ds.personLabels.length : 0;
  const accs: Acc[] = targets.map((t) => {
    const ext = Math.max(t.max[0] - t.min[0], t.max[2] - t.min[2], 1e-6);
    const cell = Math.max(heatRadius > 0 ? heatRadius * 2 : 0, ext / GRID_SIDE);
    const gw = Math.max(1, Math.min(GRID_SIDE + 1, Math.ceil((t.max[0] - t.min[0]) / cell) + 1));
    const gh = Math.max(1, Math.min(GRID_SIDE + 1, Math.ceil((t.max[2] - t.min[2]) / cell) + 1));
    return {
      t,
      rowsAll: 0,
      rows: 0,
      persons: ds.personId ? new Uint8Array(persons) : null,
      teams: ds.teamId ? new Uint8Array(ds.teamLabels.length) : null,
      sessions: ds.sessionId ? new Uint8Array(ds.sessionLabels.length) : null,
      dwell: 0,
      entries: 0,
      exits: 0,
      last: ds.personId && ds.time ? new Uint8Array(persons) : null,
      lastSession: ds.personId && ds.time && ds.sessionId ? new Int32Array(persons).fill(-1) : null,
      grid: new Uint32Array(gw * gh),
      gx0: t.min[0],
      gz0: t.min[2],
      cell,
      gw,
      gh,
      time: ds.time ? new Float64Array(TIME_BINS) : null,
      cats: ds.attrs.map((a) => (a.kind === 'category' && a.categories ? new Uint32Array(a.categories.length) : null)),
      num: ds.attrs.map((a) => (a.kind === 'number' ? { sum: 0, n: 0, min: Infinity, max: -Infinity, fine: new Uint32Array(FINE_BINS) } : null)),
    };
  });
  return {
    ds,
    scope,
    targets,
    accs,
    overallCats: ds.attrs.map((a) => (a.kind === 'category' && a.categories ? new Uint32Array(a.categories.length) : null)),
    overallNum: ds.attrs.map((a) => (a.kind === 'number' ? { sum: 0, n: 0 } : null)),
    shown: 0,
    filterData: scope.filters.map((f) => ({ f, data: filterColumnData(ds, f.column) })),
    dwellCap: dwellCapOf(ds),
    next: 0,
  };
}

/** Whether row `i` is among the rows the view shows. */
export function shownRow(job: Pick<StatsJob, 'ds' | 'scope' | 'filterData'>, i: number): boolean {
  const { ds, scope } = job;
  if (ds.time) {
    const t = ds.time[i];
    if (scope.lifetimeNow !== null) {
      if (t > scope.lifetimeNow) return false;
      const life = ds.lifetime ? ds.lifetime[i] : -1;
      const l = life >= 0 ? life : scope.defaultLifetime;
      if (scope.lifetimeNow - t > l) return false;
    } else if (t < scope.timeLo || t > scope.timeHi) return false;
  }
  if (scope.session >= 0 && ds.sessionId && ds.sessionId[i] !== scope.session) return false;
  if (scope.groupShown && ds.teamId) {
    const g = ds.teamId[i];
    if (g < scope.groupShown.length && scope.groupShown[g] === 0) return false;
  }
  for (const { f, data } of job.filterData) {
    if (!data) return false;
    const v = data[i];
    if (f.kind === 'range') {
      if (!(v >= f.min && v <= f.max)) return false;
    } else {
      const c = Math.trunc(v);
      if (!f.mask || c < 0 || c >= f.mask.length || f.mask[c] === 0) return false;
    }
  }
  return true;
}

function holds(test: CompiledVolume | Selection, x: number, y: number, z: number): boolean {
  return 'include' in test ? selectionHolds(test, x, y, z) : compiledContains(test, x, y, z);
}

/** Process rows `[job.next, job.next + rows)`. Returns true when the dataset is done. */
export function stepStats(job: StatsJob, rows: number): boolean {
  const { ds, accs, overallCats, overallNum } = job;
  const lo = job.next;
  const hi = Math.min(ds.count, lo + rows);
  const { px, py, pz, time, personId, teamId, sessionId, lifetime } = ds;
  const attrs = ds.attrs;
  const t0 = ds.timeRange[0];
  const tSpan = Math.max(1e-9, ds.timeRange[1] - ds.timeRange[0]);
  for (let i = lo; i < hi; i++) {
    const x = px[i];
    const y = py[i];
    const z = pz[i];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    const shown = shownRow(job, i);
    if (shown) {
      job.shown++;
      for (let c = 0; c < attrs.length; c++) {
        const oc = overallCats[c];
        if (oc) {
          const k = (attrs[c].data as Uint32Array)[i];
          if (k < oc.length) oc[k]++;
          continue;
        }
        const on = overallNum[c];
        if (on) {
          const v = attrs[c].data[i];
          if (Number.isFinite(v)) {
            on.sum += v;
            on.n++;
          }
        }
      }
    }
    const person = personId ? personId[i] : -1;
    for (let a = 0; a < accs.length; a++) {
      const acc = accs[a];
      const t = acc.t;
      const inside =
        x >= t.min[0] && x <= t.max[0] && y >= t.min[1] && y <= t.max[1] && z >= t.min[2] && z <= t.max[2] && holds(t.test, x, y, z);
      // Entries and exits follow each track through the rows shown.
      if (acc.last && person >= 0 && shown) {
        const sess = sessionId ? sessionId[i] : 0;
        let prev = acc.last[person];
        if (acc.lastSession) {
          if (acc.lastSession[person] !== sess) prev = 0;
          acc.lastSession[person] = sess;
        }
        if (prev === 1 && inside) acc.entries++;
        else if (prev === 2 && !inside) acc.exits++;
        acc.last[person] = inside ? 2 : 1;
      }
      if (!inside) continue;
      acc.rowsAll++;
      if (!shown) continue;
      acc.rows++;
      if (acc.persons && person >= 0) acc.persons[person] = 1;
      if (acc.teams && teamId) acc.teams[teamId[i]] = 1;
      if (acc.sessions && sessionId) acc.sessions[sessionId[i]] = 1;
      if (lifetime) {
        const l = lifetime[i];
        if (l > 0) acc.dwell += Math.min(l, job.dwellCap);
      }
      const gx = Math.min(acc.gw - 1, Math.max(0, Math.floor((x - acc.gx0) / acc.cell)));
      const gz = Math.min(acc.gh - 1, Math.max(0, Math.floor((z - acc.gz0) / acc.cell)));
      acc.grid[gz * acc.gw + gx]++;
      if (acc.time && time) {
        const b = Math.min(TIME_BINS - 1, Math.max(0, Math.floor(((time[i] - t0) / tSpan) * TIME_BINS)));
        acc.time[b]++;
      }
      for (let c = 0; c < attrs.length; c++) {
        const cc = acc.cats[c];
        if (cc) {
          const k = (attrs[c].data as Uint32Array)[i];
          if (k < cc.length) cc[k]++;
          continue;
        }
        const nn = acc.num[c];
        if (nn) {
          const v = attrs[c].data[i];
          if (!Number.isFinite(v)) continue;
          nn.sum += v;
          nn.n++;
          if (v < nn.min) nn.min = v;
          if (v > nn.max) nn.max = v;
          const col = attrs[c];
          const span = col.max - col.min;
          const fb = span > 0 ? Math.min(FINE_BINS - 1, Math.max(0, Math.floor(((v - col.min) / span) * FINE_BINS))) : 0;
          nn.fine[fb]++;
        }
      }
    }
  }
  job.next = hi;
  return hi >= ds.count;
}

function countOnes(a: Uint8Array | null): number | null {
  if (!a) return null;
  let n = 0;
  for (let i = 0; i < a.length; i++) n += a[i];
  return n;
}

/** The value at fraction `q` of a fine histogram over [lo, hi]. */
function quantile(fine: Uint32Array, n: number, q: number, lo: number, hi: number): number {
  if (n <= 0) return NaN;
  const target = q * (n - 1);
  let seen = 0;
  for (let b = 0; b < fine.length; b++) {
    const c = fine[b];
    if (seen + c > target) {
      // Spread within the bin: linear between its edges.
      const within = c > 0 ? (target - seen + 0.5) / c : 0.5;
      return lo + ((b + Math.min(1, Math.max(0, within))) / fine.length) * (hi - lo);
    }
    seen += c;
  }
  return hi;
}

/** The pass's answer so far (complete when `stepStats` has returned true). */
export function finishStats(job: StatsJob, selectionName: string): StatsResult {
  const { ds } = job;
  const shown = job.shown;
  const out: VolumeStats[] = job.accs.map((acc) => {
    const t = acc.t;
    // Density over the cells with data: rows per square unit.
    let peak = 0;
    let peakAt: [number, number] | null = null;
    let sum = 0;
    let cells = 0;
    for (let k = 0; k < acc.grid.length; k++) {
      const c = acc.grid[k];
      if (c === 0) continue;
      sum += c;
      cells++;
      if (c > peak) {
        peak = c;
        const gx = k % acc.gw;
        const gz = Math.floor(k / acc.gw);
        peakAt = [acc.gx0 + (gx + 0.5) * acc.cell, acc.gz0 + (gz + 0.5) * acc.cell];
      }
    }
    const area = acc.cell * acc.cell;
    const columns: ColumnStats[] = ds.attrs.map((a, c) => {
      const cc = acc.cats[c];
      if (cc && a.categories) {
        const overall = job.overallCats[c]!;
        const idx: number[] = [];
        let distinct = 0;
        for (let k = 0; k < cc.length; k++)
          if (cc[k] > 0) {
            idx.push(k);
            distinct++;
          }
        idx.sort((p, q) => cc[q] - cc[p]);
        const top = idx.slice(0, TOP_VALUES).map((k) => {
          const share = acc.rows > 0 ? cc[k] / acc.rows : 0;
          const ov = shown > 0 ? overall[k] / shown : 0;
          return { label: a.categories![k] ?? String(k), count: cc[k], share, overall: ov, lift: ov > 0 ? share / ov : 0 };
        });
        return { name: a.name, kind: 'category', distinct, top };
      }
      const nn = acc.num[c]!;
      const on = job.overallNum[c]!;
      const lo = a.min;
      const hi = a.max;
      // The histogram over the range inside, folded from the fine bins.
      const hist = new Array<number>(HIST_BINS).fill(0);
      let hMin = nn.n > 0 ? nn.min : lo;
      let hMax = nn.n > 0 ? nn.max : hi;
      if (!(hMax > hMin)) {
        hMin = lo;
        hMax = hi > lo ? hi : lo + 1;
      }
      for (let b = 0; b < FINE_BINS; b++) {
        const v = nn.fine[b];
        if (!v) continue;
        const mid = lo + ((b + 0.5) / FINE_BINS) * (hi - lo);
        const k = Math.min(HIST_BINS - 1, Math.max(0, Math.floor(((mid - hMin) / (hMax - hMin)) * HIST_BINS)));
        hist[k] += v;
      }
      return {
        name: a.name,
        kind: 'number',
        count: nn.n,
        min: nn.n > 0 ? nn.min : NaN,
        max: nn.n > 0 ? nn.max : NaN,
        mean: nn.n > 0 ? nn.sum / nn.n : NaN,
        overallMean: on.n > 0 ? on.sum / on.n : NaN,
        median: quantile(nn.fine, nn.n, 0.5, lo, hi),
        p5: quantile(nn.fine, nn.n, 0.05, lo, hi),
        p95: quantile(nn.fine, nn.n, 0.95, lo, hi),
        hist,
        histMin: hMin,
        histMax: hMax,
      };
    });
    return {
      id: t.id,
      name: t.id === SELECTION_ID ? selectionName : t.name,
      color: t.color,
      rowsAll: acc.rowsAll,
      shareAll: ds.count > 0 ? acc.rowsAll / ds.count : 0,
      rows: acc.rows,
      shareShown: shown > 0 ? acc.rows / shown : 0,
      persons: countOnes(acc.persons),
      teams: countOnes(acc.teams),
      sessions: countOnes(acc.sessions),
      dwell: ds.lifetime ? acc.dwell : null,
      entries: acc.last ? acc.entries : null,
      exits: acc.last ? acc.exits : null,
      peakDensity: peak / area,
      meanDensity: cells > 0 ? sum / cells / area : 0,
      cellSize: acc.cell,
      peakAt,
      timeHist: acc.time ? Array.from(acc.time) : null,
      timeRange: ds.time ? [ds.timeRange[0], ds.timeRange[1]] : null,
      volume: t.volume,
      footprint: t.footprint,
      columns,
    };
  });
  return { totalRows: ds.count, shownRows: shown, volumes: out, complete: job.next >= ds.count };
}

/** The whole pass at once: for tests and small data. */
export function computeStats(ds: Dataset, volumes: readonly Volume[], scope: Scope = FULL_SCOPE, heatRadius = 0, selectionName = 'All volumes'): StatsResult {
  const job = prepareStats(ds, volumes, scope, heatRadius);
  stepStats(job, ds.count);
  return finishStats(job, selectionName);
}

/**
 * The pass in slices of about `sliceMs`, yielding between them, reporting
 * progress; rejects with an AbortError when `signal` is aborted.
 */
export async function computeStatsAsync(
  ds: Dataset,
  volumes: readonly Volume[],
  scope: Scope,
  heatRadius: number,
  selectionName: string,
  opts: { signal?: AbortSignal; onProgress?: (fraction: number) => void; sliceMs?: number } = {},
): Promise<StatsResult> {
  const job = prepareStats(ds, volumes, scope, heatRadius);
  const sliceMs = opts.sliceMs ?? 8;
  let rows = 50_000;
  for (;;) {
    if (opts.signal?.aborted) throw new DOMException('aborted', 'AbortError');
    const t0 = performance.now();
    const done = stepStats(job, rows);
    const dt = performance.now() - t0;
    // Steer the slice so each stays near the budget, whatever the row cost.
    if (dt > 0) rows = Math.max(5_000, Math.min(4_000_000, Math.round(rows * Math.min(2, Math.max(0.5, sliceMs / dt)))));
    opts.onProgress?.(ds.count > 0 ? job.next / ds.count : 1);
    if (done) break;
    await yieldToPage();
  }
  return finishStats(job, selectionName);
}

/** Let the page paint and handle input. A message round trip, not a 4 ms-clamped timeout. */
export function yieldToPage(): Promise<void> {
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => {
      ch.port1.close();
      resolve();
    };
    ch.port2.postMessage(null);
  });
}
