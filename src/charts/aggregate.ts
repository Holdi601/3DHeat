/**
 * Charts from rows: the aggregation behind every chart this module draws.
 *
 * Rows come as `RowTable`s - columns of typed arrays, already cut to the rows
 * a chart may see (the rows inside a volume, a sample of the rows outside it).
 * An `Agg` folds rows in, and out again, as counts, sums and fine histograms
 * per series and group - every accumulator additive, so a time window sliding
 * forward during playback adds the rows it gains and takes away those it
 * loses instead of starting over (`advanceAgg`). `finishAgg` reads the
 * accumulators into a `ChartData`: shares, rates, means, percentiles from the
 * histograms, the groups past `top` folded into "Other", sorted.
 *
 * Pure and DOM-free: it runs in the signs' worker (`volumes/signs/worker.ts`)
 * and in tests, never on the frame path.
 */

import { PERSON_FILTER_COLUMN } from '../render/filterTables';
import type { ActiveFilter } from '../render/types';
import type { ChartData, ChartEntity, ChartSpec, GroupKey, MarkFilter, ValueFormat } from './types';

export interface RowTable {
  n: number;
  /** How many rows of the data each row stands for (a sample's stride). */
  weight: number;
  time: Float32Array | null;
  life: Float32Array | null;
  team: Uint16Array | null;
  person: Uint32Array | null;
  session: Uint32Array | null;
  /** Attribute columns by name: f32 values, or u32 category indices. */
  cols: Record<string, Float32Array | Uint32Array>;
  /** Rows ascending in time: the window can be found by binary search. */
  sorted: boolean;
}

export interface ColumnMeta {
  name: string;
  kind: 'category' | 'number';
  labels?: string[];
  min: number;
  max: number;
}

/** What the aggregation knows about the data as a whole. */
export interface AggMeta {
  teams: string[];
  persons: string[];
  sessions: string[];
  /** Each match's first second; null without matches. */
  sessionStart: number[] | null;
  timeRange: [number, number];
  /** The longest match, seconds: the span of match time. */
  matchSpan: number;
  columns: ColumnMeta[];
  /** The outcome column (`data/outcome.ts`), 1 won and 0 lost; null without. */
  won: string | null;
  /** The event column, and which of its categories are kills and deaths. */
  event: string | null;
  kill: number[];
  death: number[];
}

/** The rows the view shows (`volumes/stats.ts` `Scope`), plus the minutes they span. */
export interface AggScope {
  timeLo: number;
  timeHi: number;
  lifetimeNow: number | null;
  defaultLifetime: number;
  filters: ActiveFilter[];
  groupShown: Int8Array | null;
  session: number;
  /** Minutes of time the window shows, for rates. */
  minutes: number;
  /** Equal keys: equal rows apart from the time window. */
  key: string;
}

/** A table fed to an aggregation: its rows, their side when fixed, and which rows to skip. */
export interface AggSource {
  table: RowTable;
  /** The series the rows are when the diff fixes it (inside 0, outside 1); -1 to read it per row. */
  side: number;
  /** Rows to leave out (non-zero), e.g. the sampled rows inside the volume; null for none. */
  skip: Uint8Array | null;
  /** Rows to keep, by a bit of a membership mask (one table serving several volumes); absent: every row. */
  member?: Uint32Array | null;
  bit?: number;
}

const OTHER = '@other';
const MAX_CELLS = 4_000_000;
/** Bins a numeric column is read at for percentiles, at most. */
const FINE_MAX = 256;

/** How a dimension reads a row. */
interface Dim {
  size: number;
  at: (t: RowTable, i: number) => number;
  entity: (k: number) => ChartEntity;
  /** Natural order is meaningful (bins, time): never folded or re-sorted. */
  ordered: boolean;
}

function column(meta: AggMeta, name: string | undefined): ColumnMeta | null {
  return name ? (meta.columns.find((c) => c.name === name) ?? null) : null;
}

function catDim(meta: AggMeta, key: GroupKey | undefined): Dim | null {
  if (!key || key === 'none') return { size: 1, at: () => 0, entity: () => ({ key: 'all', label: '@all' }), ordered: true };
  if (key === 'team')
    return {
      size: Math.max(1, meta.teams.length),
      at: (t, i) => (t.team ? t.team[i] : -1),
      entity: (k) => ({ key: `team:${k}`, label: meta.teams[k] ?? String(k), team: k, filter: { kind: 'team', index: k } }),
      ordered: false,
    };
  if (key === 'person')
    return {
      size: Math.max(1, meta.persons.length),
      at: (t, i) => (t.person ? t.person[i] : -1),
      entity: (k) => ({ key: `person:${k}`, label: meta.persons[k] ?? String(k), filter: { kind: 'person', index: k } }),
      ordered: false,
    };
  if (key === 'session')
    return {
      size: Math.max(1, meta.sessions.length),
      at: (t, i) => (t.session ? t.session[i] : -1),
      entity: (k) => ({ key: `session:${k}`, label: meta.sessions[k] ?? String(k), filter: { kind: 'session', index: k } }),
      ordered: false,
    };
  const name = key.slice(4);
  const c = column(meta, name);
  if (!c || c.kind !== 'category' || !c.labels) return null;
  const labels = c.labels;
  return {
    size: Math.max(1, labels.length),
    at: (t, i) => {
      const d = t.cols[name];
      return d ? d[i] : -1;
    },
    entity: (k) => ({ key: `${name}:${k}`, label: labels[k] ?? String(k), filter: { kind: 'category', column: name, index: k } }),
    ordered: false,
  };
}

/** Equal bins over a numeric column's range. */
function binDim(meta: AggMeta, name: string | undefined, bins: number): Dim | null {
  const c = column(meta, name);
  if (!c || c.kind !== 'number' || !name) return null;
  const lo = c.min;
  const hi = c.max > c.min ? c.max : c.min + 1;
  const k = bins / (hi - lo);
  return {
    size: bins,
    at: (t, i) => {
      const d = t.cols[name];
      if (!d) return -1;
      const v = d[i];
      if (!(v >= lo && v <= hi)) return -1;
      return Math.min(bins - 1, Math.floor((v - lo) * k));
    },
    entity: (b) => {
      const a = lo + b / k;
      const z = lo + (b + 1) / k;
      return { key: `bin:${b}`, label: '', filter: { kind: 'range', column: name, lo: a, hi: z } };
    },
    ordered: true,
  };
}

/** Equal bins over time: into each match, or the data's own clock. */
function timeDim(meta: AggMeta, match: boolean, bins: number): { dim: Dim; lo: number; hi: number } {
  const starts = meta.sessionStart;
  const useMatch = match && !!starts && starts.length > 0;
  const lo = useMatch ? 0 : meta.timeRange[0];
  const span = useMatch ? meta.matchSpan : meta.timeRange[1] - meta.timeRange[0];
  const hi = lo + (span > 0 ? span : 1);
  const k = bins / (hi - lo);
  return {
    lo,
    hi,
    dim: {
      size: bins,
      at: (t, i) => {
        if (!t.time) return -1;
        let v = t.time[i];
        if (useMatch) v -= t.session ? (starts![t.session[i]] ?? 0) : 0;
        if (!(v >= lo && v <= hi)) return -1;
        return Math.min(bins - 1, Math.floor((v - lo) * k));
      },
      entity: (b) => ({ key: `t:${b}`, label: '', filter: { kind: 'time', lo: lo + b / k, hi: lo + (b + 1) / k, match: useMatch } }),
      ordered: true,
    },
  };
}

/** The series a row is: the diff's two sides, or the stacked dimension. */
function seriesDim(meta: AggMeta, spec: ChartSpec): Dim | null {
  if (spec.diff === 'inout')
    return {
      size: 2,
      at: () => -1,
      entity: (k) => ({ key: k === 0 ? 'inside' : 'outside', label: k === 0 ? '@inside' : '@outside' }),
      ordered: true,
    };
  if (spec.diff === 'outcome') {
    const won = meta.won;
    return {
      size: 2,
      at: (t, i) => {
        const d = won ? t.cols[won] : null;
        if (!d) return -1;
        const v = d[i];
        return v !== v ? -1 : v >= 0.5 ? 0 : 1;
      },
      entity: (k) => ({ key: k === 0 ? 'won' : 'lost', label: k === 0 ? '@won' : '@lost' }),
      ordered: true,
    };
  }
  if (spec.diff === 'teams') {
    const pick = spec.teams ?? [meta.teams[0] ?? '', meta.teams[1] ?? ''];
    const a = meta.teams.indexOf(pick[0]);
    const b = meta.teams.indexOf(pick[1]);
    return {
      size: 2,
      at: (t, i) => {
        if (!t.team) return -1;
        const g = t.team[i];
        return g === a ? 0 : g === b ? 1 : -1;
      },
      entity: (k) => {
        const g = k === 0 ? a : b;
        return { key: `team:${g}`, label: meta.teams[g] ?? '?', team: g >= 0 ? g : undefined, filter: g >= 0 ? { kind: 'team', index: g } : undefined };
      },
      ordered: true,
    };
  }
  if (spec.kind === 'stacked') return catDim(meta, spec.stack ?? 'none');
  return { size: 1, at: () => 0, entity: () => ({ key: 'all', label: '@all' }), ordered: true };
}

export interface Agg {
  spec: ChartSpec;
  meta: AggMeta;
  g: Dim;
  s: Dim;
  /** Continuous axes, where the groups (and for a scatter the series) are bins. */
  axis: { lo: number; hi: number; label: string; time?: boolean } | null;
  yAxis: { lo: number; hi: number; label: string } | null;
  G: number;
  S: number;
  count: Float64Array;
  /** Measures over a column: its sum and count, and its fine histogram. */
  valueCol: string | null;
  vLo: number;
  vK: number;
  fine: number;
  sum: Float64Array | null;
  n: Float64Array | null;
  hist: Float64Array | null;
  /** Rows with a known outcome, and of those won. */
  played: Float64Array | null;
  won: Float64Array | null;
  kills: Float64Array | null;
  deaths: Float64Array | null;
  /** Per series, rows of each person (distinct players for tiles) and how many have any. */
  personRows: Float64Array[] | null;
  players: Float64Array | null;
  /** Per series: every row the scope shows, inside the chart's filter or not (tiles' share). */
  total: Float64Array;
  /** The chart filter's category mask, resolved. */
  fCol: string | null;
  fMask: Uint8Array | null;
  error: string | null;
  rows: number;
  sampled: boolean;
}

/** Tiles a stat tile chart shows, in order: `@tile.<name>`. */
export const TILES = ['rows', 'perMin', 'share', 'players', 'kd', 'value', 'won'] as const;

/** A new, empty aggregation for a spec. */
export function createAgg(meta: AggMeta, spec: ChartSpec): Agg {
  const bins = spec.bins ?? (spec.kind === 'scatter' ? 32 : spec.kind === 'histogram' ? 24 : 40);
  let g: Dim | null;
  let s: Dim | null = seriesDim(meta, spec);
  let axis: Agg['axis'] = null;
  let yAxis: Agg['yAxis'] = null;
  let error: string | null = null;
  if (spec.kind === 'line' || spec.kind === 'area') {
    const td = timeDim(meta, spec.time !== 'real', bins);
    g = td.dim;
    axis = { lo: td.lo, hi: td.hi, label: spec.time === 'real' ? '@axis.time' : '@axis.matchTime', time: true };
  } else if (spec.kind === 'histogram') {
    g = binDim(meta, spec.x, bins);
    const c = column(meta, spec.x);
    if (c) axis = { lo: c.min, hi: c.max > c.min ? c.max : c.min + 1, label: c.name };
  } else if (spec.kind === 'scatter') {
    g = binDim(meta, spec.x, bins);
    s = binDim(meta, spec.y, bins);
    const cx = column(meta, spec.x);
    const cy = column(meta, spec.y);
    if (cx) axis = { lo: cx.min, hi: cx.max > cx.min ? cx.max : cx.min + 1, label: cx.name };
    if (cy) yAxis = { lo: cy.min, hi: cy.max > cy.min ? cy.max : cy.min + 1, label: cy.name };
  } else if (spec.kind === 'matrix') {
    g = catDim(meta, spec.group);
    s = catDim(meta, spec.stack ?? 'team');
  } else if (spec.kind === 'tiles') {
    g = { size: 1, at: () => 0, entity: () => ({ key: 'tiles', label: '' }), ordered: true }; // one cell per series: each tile reads its own accumulator
  } else g = catDim(meta, spec.kind === 'pie' && spec.group === 'none' ? 'team' : spec.group);
  if (!g) {
    error = 'charts.empty.column';
    g = { size: 1, at: () => -1, entity: () => ({ key: 'none', label: '' }), ordered: true };
  }
  if (!s) {
    error = 'charts.empty.column';
    s = { size: 1, at: () => -1, entity: () => ({ key: 'none', label: '' }), ordered: true };
  }
  const G = g.size;
  const S = s.size;
  if (G * S > MAX_CELLS) error = 'charts.empty.tooMany';
  const cells = error === 'charts.empty.tooMany' ? 1 : G * S;
  const m = spec.measure.kind;
  // The column a measure (or a tile) reads; percentiles come from fine bins over its range.
  const vc = m === 'mean' || m === 'median' || m === 'pct' || spec.kind === 'tiles' ? column(meta, spec.measure.column) : null;
  if ((m === 'mean' || m === 'median' || m === 'pct') && spec.kind !== 'tiles' && (!vc || vc.kind !== 'number')) error = 'charts.empty.column';
  const valueCol = vc && vc.kind === 'number' ? vc.name : null;
  const fine = valueCol ? Math.max(8, Math.min(FINE_MAX, Math.floor(MAX_CELLS / Math.max(1, cells)))) : 0;
  const vLo = vc ? vc.min : 0;
  const vK = vc ? fine / Math.max(1e-12, vc.max - vc.min) : 0;
  const tiles = spec.kind === 'tiles';
  const needOutcome = m === 'winShare' || tiles;
  const needKd = m === 'kd' || tiles;
  const fCol = spec.filter?.column && spec.filter.values ? spec.filter.column : null;
  let fMask: Uint8Array | null = null;
  if (fCol) {
    const c = column(meta, fCol);
    if (c?.labels) {
      fMask = new Uint8Array(c.labels.length);
      for (const v of spec.filter!.values!) {
        const k = c.labels.indexOf(v);
        if (k >= 0) fMask[k] = 1;
      }
    }
  }
  return {
    spec,
    meta,
    g,
    s,
    axis,
    yAxis,
    G,
    S,
    count: new Float64Array(cells),
    valueCol,
    vLo,
    vK,
    fine,
    sum: valueCol ? new Float64Array(cells) : null,
    n: valueCol ? new Float64Array(cells) : null,
    hist: valueCol && (m === 'median' || m === 'pct' || tiles) ? new Float64Array(cells * fine) : null,
    played: needOutcome && meta.won ? new Float64Array(cells) : null,
    won: needOutcome && meta.won ? new Float64Array(cells) : null,
    kills: needKd && meta.event ? new Float64Array(cells) : null,
    deaths: needKd && meta.event ? new Float64Array(cells) : null,
    personRows: tiles && meta.persons.length ? Array.from({ length: S }, () => new Float64Array(meta.persons.length)) : null,
    players: tiles ? new Float64Array(S) : null,
    total: new Float64Array(S),
    fCol,
    fMask,
    error,
    rows: 0,
    sampled: false,
  };
}

/** Whether row `i` of a table is shown, the time window left out when `time` is false. */
export function rowShown(t: RowTable, i: number, sc: AggScope, time = true): boolean {
  if (time && t.time) {
    const v = t.time[i];
    if (sc.lifetimeNow !== null) {
      if (v > sc.lifetimeNow) return false;
      const life = t.life ? t.life[i] : -1;
      if (sc.lifetimeNow - v > (life >= 0 ? life : sc.defaultLifetime)) return false;
    } else if (v < sc.timeLo || v > sc.timeHi) return false;
  }
  if (sc.session >= 0 && t.session && t.session[i] !== sc.session) return false;
  if (sc.groupShown && t.team) {
    const g = t.team[i];
    if (g < sc.groupShown.length && sc.groupShown[g] === 0) return false;
  }
  for (const f of sc.filters) {
    const d = f.column === PERSON_FILTER_COLUMN ? t.person : t.cols[f.column];
    if (!d) return false;
    const v = d[i];
    if (f.kind === 'range') {
      if (!(v >= f.min && v <= f.max)) return false;
    } else {
      const c = Math.trunc(v);
      if (!f.mask || c < 0 || c >= f.mask.length || f.mask[c] === 0) return false;
    }
  }
  return true;
}

/** Fold rows [lo, hi) of a source in (`sign` 1) or out (-1); the scope's time window checked unless `time` is false. */
export function addRows(a: Agg, src: AggSource, lo: number, hi: number, sc: AggScope, sign: 1 | -1, time = true): void {
  if (a.error === 'charts.empty.tooMany') return;
  const t = src.table;
  const w = t.weight * sign;
  const { g, s, G, count, sum, n, hist, played, won, kills, deaths, personRows, players, total, fine, vLo, vK, fMask } = a;
  const val = a.valueCol ? t.cols[a.valueCol] : null;
  const wonCol = a.meta.won ? t.cols[a.meta.won] : null;
  const evCol = a.meta.event ? t.cols[a.meta.event] : null;
  const fData = a.fCol ? t.cols[a.fCol] : null;
  const outcome = a.spec.filter?.outcome;
  const kill = a.meta.kill;
  const death = a.meta.death;
  const tiles = a.spec.kind === 'tiles';
  const skip = src.skip;
  const member = src.member ?? null;
  const bit = src.bit ?? 0;
  if (t.weight > 1) a.sampled = true;
  for (let i = lo; i < hi; i++) {
    if (skip && skip[i]) continue;
    if (member && (member[i] & bit) === 0) continue;
    if (!rowShown(t, i, sc, time)) continue;
    const si = src.side >= 0 ? src.side : s.at(t, i);
    if (si < 0 || si >= a.S) continue;
    total[si] += w;
    if (fMask) {
      if (!fData) continue;
      const c = fData[i];
      if (!(c < fMask.length) || fMask[c] === 0) continue;
    }
    if (outcome) {
      if (!wonCol) continue;
      const v = wonCol[i];
      if (v !== v || (outcome === 'won') !== v >= 0.5) continue;
    }
    const gi = tiles ? 0 : g.at(t, i);
    if (gi < 0 || gi >= G) continue;
    const c = si * G + gi;
    count[c] += w;
    a.rows += sign;
    if (val && sum && n) {
      const v = val[i];
      if (Number.isFinite(v)) {
        sum[c] += v * w;
        n[c] += w;
        if (hist) {
          const b = Math.max(0, Math.min(fine - 1, Math.floor((v - vLo) * vK)));
          hist[c * fine + b] += w;
        }
      }
    }
    if (played && won && wonCol) {
      const v = wonCol[i];
      if (v === v) {
        played[c] += w;
        if (v >= 0.5) won[c] += w;
      }
    }
    if (kills && deaths && evCol) {
      const e = evCol[i];
      if (kill.includes(e)) kills[c] += w;
      else if (death.includes(e)) deaths[c] += w;
    }
    if (personRows && players && t.person) {
      const p = t.person[i];
      const pr = personRows[si];
      if (p < pr.length) {
        const before = pr[p];
        pr[p] = before + w;
        if (before <= 0 && pr[p] > 0) players[si]++;
        else if (before > 0 && pr[p] <= 0) players[si]--;
      }
    }
  }
}

/** First index of a sorted table whose time is >= v (`after`: > v). */
function bound(t: Float32Array, n: number, v: number, after: boolean): number {
  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (after ? t[m] <= v : t[m] < v) lo = m + 1;
    else hi = m;
  }
  return lo;
}

/** Whether `advanceAgg` can move from one scope to the next without starting over. */
export function canAdvance(from: AggScope, to: AggScope, sources: readonly AggSource[]): boolean {
  if (from.key !== to.key || from.lifetimeNow !== null || to.lifetimeNow !== null) return false;
  if (to.timeLo < from.timeLo || to.timeHi < from.timeHi) return false;
  return sources.every((s) => s.table.sorted && !!s.table.time);
}

/**
 * Move an aggregation from one time window to a later one: the rows the new
 * window gains folded in, those it loses folded out. Only between scopes
 * `canAdvance` allows.
 */
export function advanceAgg(a: Agg, sources: readonly AggSource[], from: AggScope, to: AggScope): number {
  let touched = 0;
  for (const src of sources) {
    const t = src.table;
    const time = t.time!;
    const loOld = from.timeLo === -Infinity ? 0 : bound(time, t.n, from.timeLo, false);
    const loNew = to.timeLo === -Infinity ? 0 : bound(time, t.n, to.timeLo, false);
    const hiOld = bound(time, t.n, from.timeHi, true);
    const hiNew = bound(time, t.n, to.timeHi, true);
    // Lost: shown before (from loOld to hiOld), before the new start.
    const outHi = Math.min(loNew, hiOld);
    if (outHi > loOld) {
      addRows(a, src, loOld, outHi, to, -1, false);
      touched += outHi - loOld;
    }
    // Gained: after the old end, from the new start.
    const inLo = Math.max(hiOld, loNew);
    if (hiNew > inLo) {
      addRows(a, src, inLo, hiNew, to, 1, false);
      touched += hiNew - inLo;
    }
  }
  return touched;
}

/** The value at fraction `q` of a fine histogram, interpolated within its bin. */
export function histQuantile(h: Float64Array, off: number, fine: number, lo: number, k: number, q: number): number {
  let total = 0;
  for (let b = 0; b < fine; b++) total += h[off + b];
  if (total <= 0) return NaN;
  const want = q * total;
  let acc = 0;
  for (let b = 0; b < fine; b++) {
    const c = h[off + b];
    if (c > 0 && acc + c >= want) return lo + (b + (want - acc) / c) / k;
    acc += c;
  }
  return lo + fine / k;
}

/** The measure of one cell, or of several merged (the "Other" group). */
function measureOf(a: Agg, cells: number[], scope: AggScope, seriesTotal: number): number {
  const m = a.spec.measure.kind;
  let c = 0;
  for (const x of cells) c += a.count[x];
  switch (m) {
    case 'count':
      return c;
    case 'share':
      return seriesTotal > 0 ? c / seriesTotal : NaN;
    case 'perMin':
      return scope.minutes > 0 ? c / scope.minutes : NaN;
    case 'mean': {
      let s = 0;
      let n = 0;
      for (const x of cells) {
        s += a.sum![x];
        n += a.n![x];
      }
      return n > 0 ? s / n : NaN;
    }
    case 'median':
    case 'pct': {
      if (!a.hist) return NaN;
      const q = m === 'median' ? 0.5 : (a.spec.measure.p ?? 90) / 100;
      if (cells.length === 1) return histQuantile(a.hist, cells[0] * a.fine, a.fine, a.vLo, a.vK, q);
      const merged = new Float64Array(a.fine);
      for (const x of cells) for (let b = 0; b < a.fine; b++) merged[b] += a.hist[x * a.fine + b];
      return histQuantile(merged, 0, a.fine, a.vLo, a.vK, q);
    }
    case 'winShare': {
      if (!a.played || !a.won) return NaN;
      let p = 0;
      let w = 0;
      for (const x of cells) {
        p += a.played[x];
        w += a.won[x];
      }
      return p > 0 ? w / p : NaN;
    }
    case 'kd': {
      if (!a.kills || !a.deaths) return NaN;
      let k = 0;
      let d = 0;
      for (const x of cells) {
        k += a.kills[x];
        d += a.deaths[x];
      }
      return d > 0 ? k / d : k > 0 ? Infinity : NaN;
    }
  }
}

export function formatOf(spec: ChartSpec): ValueFormat {
  switch (spec.measure.kind) {
    case 'count':
      return 'int';
    case 'share':
    case 'winShare':
      return 'pct';
    case 'perMin':
      return 'rate';
    case 'kd':
      return 'ratio';
    default:
      return 'dec';
  }
}

/** The measure's name, for the value axis and tooltips: a message key, with the column after a `|`. */
export function measureLabel(spec: ChartSpec): string {
  const m = spec.measure;
  return m.column && (m.kind === 'mean' || m.kind === 'median' || m.kind === 'pct') ? `@measure.${m.kind}|${m.column}|${m.p ?? ''}` : `@measure.${m.kind}`;
}

/** Order of the groups a chart draws: by value, by label, or as the data has them. */
export function sortOrder(labels: readonly string[], totals: readonly number[], mode: ChartSpec['sort']): number[] {
  const idx = labels.map((_, i) => i);
  if (mode === 'natural') return idx;
  if (mode === 'label') return idx.sort((a, b) => labels[a].localeCompare(labels[b], undefined, { numeric: true }));
  const sgn = mode === 'value-asc' ? 1 : -1;
  const v = (i: number) => (Number.isFinite(totals[i]) ? totals[i] : -Infinity * sgn);
  return idx.sort((a, b) => sgn * (v(a) - v(b)) || a - b);
}

/** The groups (or series) to draw: those with rows, the largest `top`, the rest as one "Other". */
function pick(dim: Dim, size: number, rowsOf: (k: number) => number, top: number): { keys: number[]; other: number[] } {
  const live: number[] = [];
  for (let k = 0; k < size; k++) if (rowsOf(k) !== 0) live.push(k);
  if (dim.ordered) return { keys: Array.from({ length: size }, (_, k) => k), other: [] };
  if (live.length <= top) return { keys: live, other: [] };
  live.sort((a, b) => rowsOf(b) - rowsOf(a) || a - b);
  return { keys: live.slice(0, top - 1).sort((a, b) => a - b), other: live.slice(top - 1) };
}

/** Read an aggregation into the data a chart is drawn from. */
export function finishAgg(a: Agg, scope: AggScope): ChartData {
  const spec = a.spec;
  const base = { kind: spec.kind, format: formatOf(spec), valueLabel: measureLabel(spec), rows: Math.round(a.rows), sampled: a.sampled };
  if (a.error) return { ...base, groups: [], series: [], values: [], empty: a.error };
  const G = a.G;
  if (spec.kind === 'tiles') return finishTiles(a, scope, base);
  const top = spec.top ?? (spec.kind === 'pie' ? 5 : spec.kind === 'matrix' ? 8 : spec.kind === 'stacked' ? 6 : 12);
  const rowsG = (k: number) => {
    let c = 0;
    for (let s = 0; s < a.S; s++) c += a.count[s * G + k];
    return c;
  };
  const rowsS = (k: number) => {
    let c = 0;
    for (let g = 0; g < G; g++) c += a.count[k * G + g];
    return c;
  };
  const gp = pick(a.g, G, rowsG, top);
  const sp = spec.kind === 'stacked' || spec.kind === 'matrix' ? pick(a.s, a.S, rowsS, spec.kind === 'matrix' ? top : 6) : { keys: Array.from({ length: a.S }, (_, k) => k), other: [] };
  const groupSets: number[][] = gp.keys.map((k) => [k]);
  const groups: ChartEntity[] = gp.keys.map((k) => a.g.entity(k));
  if (gp.other.length) {
    groupSets.push(gp.other);
    groups.push({ key: 'other', label: OTHER });
  }
  const seriesSets: number[][] = sp.keys.map((k) => [k]);
  const series: ChartEntity[] = sp.keys.map((k) => a.s.entity(k));
  if (sp.other.length) {
    seriesSets.push(sp.other);
    series.push({ key: 'other', label: OTHER });
  }
  const values: number[][] = [];
  const counts: number[][] = [];
  // A share is of the series' rows; in a stacked bar of the bar's, in a matrix of every cell's.
  let allRows = 0;
  for (let k = 0; k < a.S; k++) allRows += rowsS(k);
  for (const ss of seriesSets) {
    let seriesTotal = 0;
    for (const s of ss) seriesTotal += rowsS(s);
    const row: number[] = [];
    const crow: number[] = [];
    for (const gs of groupSets) {
      const cells: number[] = [];
      for (const s of ss) for (const g of gs) cells.push(s * G + g);
      let denom = seriesTotal;
      if (spec.kind === 'matrix') denom = allRows;
      else if (spec.kind === 'stacked') {
        denom = 0;
        for (const g of gs) denom += rowsG(g);
      }
      row.push(measureOf(a, cells, scope, denom));
      let c = 0;
      for (const x of cells) c += a.count[x];
      crow.push(c);
    }
    values.push(row);
    counts.push(crow);
  }
  // Sorted by the groups' totals over the series (or the first series' value for a measure that does not add).
  if (!a.g.ordered && spec.sort !== 'natural') {
    const additive = spec.measure.kind === 'count' || spec.measure.kind === 'share' || spec.measure.kind === 'perMin';
    const totals = groups.map((_, j) => (additive ? values.reduce((t, r) => t + (Number.isFinite(r[j]) ? r[j] : 0), 0) : values[0]?.[j]));
    const order = sortOrder(groups.map((x) => x.label), totals, spec.sort);
    // "Other" stays last, whatever the order.
    const oi = groups.findIndex((x) => x.key === 'other');
    const ord = oi >= 0 ? [...order.filter((i) => i !== oi), oi] : order;
    const re = <T,>(xs: T[]) => ord.map((i) => xs[i]);
    groups.splice(0, groups.length, ...re(groups));
    for (let s = 0; s < values.length; s++) {
      values[s] = re(values[s]);
      counts[s] = re(counts[s]);
    }
  }
  const out: ChartData = { ...base, groups, series, values, counts };
  if (a.axis) out.axis = a.axis;
  if (a.yAxis) out.yAxis = a.yAxis;
  if (a.rows <= 0) out.empty = 'charts.empty.noRows';
  return out;
}

function finishTiles(a: Agg, scope: AggScope, base: Pick<ChartData, 'kind' | 'format' | 'valueLabel' | 'rows' | 'sampled'>): ChartData {
  const groups: ChartEntity[] = [];
  const formats: ValueFormat[] = [];
  const values: number[][] = Array.from({ length: a.S }, () => []);
  const add = (k: (typeof TILES)[number], f: ValueFormat, v: (s: number) => number, label?: string) => {
    groups.push({ key: k, label: label ?? `@tile.${k}` });
    formats.push(f);
    for (let s = 0; s < a.S; s++) values[s].push(v(s));
  };
  add('rows', 'int', (s) => a.count[s]);
  add('perMin', 'rate', (s) => (scope.minutes > 0 ? a.count[s] / scope.minutes : NaN));
  add('share', 'pct', (s) => (a.total[s] > 0 ? a.count[s] / a.total[s] : NaN));
  if (a.players) add('players', 'int', (s) => a.players![s]);
  if (a.kills && a.deaths) add('kd', 'ratio', (s) => (a.deaths![s] > 0 ? a.kills![s] / a.deaths![s] : a.kills![s] > 0 ? Infinity : NaN));
  if (a.hist && a.valueCol) add('value', 'dec', (s) => histQuantile(a.hist!, s * a.fine, a.fine, a.vLo, a.vK, 0.5), `@tile.median|${a.valueCol}`);
  if (a.played && a.won) add('won', 'pct', (s) => (a.played![s] > 0 ? a.won![s] / a.played![s] : NaN));
  const series = Array.from({ length: a.S }, (_, k) => a.s.entity(k));
  const out: ChartData = { ...base, groups, series, values, formats };
  if (a.rows <= 0) out.empty = 'charts.empty.noRows';
  return out;
}

/** An aggregation over whole sources at once: create, fold every row in, finish. */
export function aggregate(meta: AggMeta, spec: ChartSpec, sources: readonly AggSource[], scope: AggScope): ChartData {
  const a = createAgg(meta, spec);
  for (const src of sources) addRows(a, src, 0, src.table.n, scope, 1);
  return finishAgg(a, scope);
}

/** A table built from plain arrays (tests and small data). */
export function tableOf(cols: Partial<Omit<RowTable, 'cols' | 'n' | 'weight' | 'sorted'>> & { cols?: RowTable['cols']; weight?: number; n?: number }): RowTable {
  const n = cols.n ?? cols.time?.length ?? cols.team?.length ?? cols.person?.length ?? Object.values(cols.cols ?? {})[0]?.length ?? 0;
  let sorted = !!cols.time;
  if (cols.time) for (let i = 1; i < n && sorted; i++) if (cols.time[i] < cols.time[i - 1]) sorted = false;
  return {
    n,
    weight: cols.weight ?? 1,
    time: cols.time ?? null,
    life: cols.life ?? null,
    team: cols.team ?? null,
    person: cols.person ?? null,
    session: cols.session ?? null,
    cols: cols.cols ?? {},
    sorted,
  };
}

export const ALL_SCOPE: AggScope = {
  timeLo: -Infinity,
  timeHi: Infinity,
  lifetimeNow: null,
  defaultLifetime: 0,
  filters: [],
  groupShown: null,
  session: -1,
  minutes: 0,
  key: '',
};

/** What a mark filter means, for code that applies it. */
export type { MarkFilter };
