/**
 * What a chart is asked for (`ChartSpec`) and what it is drawn from
 * (`ChartData`): the shared vocabulary of every chart in the viewer that is
 * built by this module - the volume signs (`ui/signs`) and the charts embedded
 * in notes and analysis documents. See `index.ts` for the module's contract.
 *
 * Everything here is plain JSON: a spec is saved in sessions, saved views and
 * documents, and a `ChartData` crosses from the aggregation worker as it is.
 */

/** The chart kinds, chosen by the data's job (docs/volume-charts.md). */
export type ChartKind = 'bar' | 'stacked' | 'line' | 'area' | 'histogram' | 'pie' | 'tiles' | 'matrix' | 'scatter';

export const CHART_KINDS: readonly ChartKind[] = ['bar', 'stacked', 'line', 'area', 'histogram', 'pie', 'tiles', 'matrix', 'scatter'];

/**
 * What a mark's value is: rows counted, a share of the series' rows, rows a
 * minute of the time shown, the mean, median or a percentile of a numeric
 * column, the share of rows whose side won, or kills per death.
 */
export type MeasureKind = 'count' | 'share' | 'perMin' | 'mean' | 'median' | 'pct' | 'winShare' | 'kd';

export const MEASURE_KINDS: readonly MeasureKind[] = ['count', 'share', 'perMin', 'mean', 'median', 'pct', 'winShare', 'kd'];

export interface Measure {
  kind: MeasureKind;
  /** The numeric column for mean, median and percentile. */
  column?: string;
  /** The percentile for `pct`, 1-99. */
  p?: number;
}

/**
 * A dimension rows are grouped by: nothing, the team, the player, the match,
 * or a category column (`col:<name>`).
 */
export type GroupKey = 'none' | 'team' | 'person' | 'session' | `col:${string}`;

/** Two sides compared: inside the volume against outside it, team A against team B, rounds won against lost. */
export type DiffMode = 'none' | 'inout' | 'teams' | 'outcome';

export const DIFF_MODES: readonly DiffMode[] = ['none', 'inout', 'teams', 'outcome'];

export type SortMode = 'value-desc' | 'value-asc' | 'label' | 'natural';

export const SORT_MODES: readonly SortMode[] = ['value-desc', 'value-asc', 'label', 'natural'];

/** Rows a chart keeps, beyond the view's own filters. */
export interface ChartFilter {
  /** Only rows whose side won (or lost) its round. */
  outcome?: 'won' | 'lost';
  /** Only rows with one of these values in a category column. */
  column?: string;
  values?: string[];
}

export interface ChartSpec {
  kind: ChartKind;
  measure: Measure;
  /** Bars, stacked bars, pie, matrix columns: what the marks are. */
  group: GroupKey;
  /** Stacked bars: what the segments are; matrix: its rows. */
  stack?: GroupKey;
  /** Histogram and scatter: the numeric column along x. */
  x?: string;
  /** Scatter: the numeric column along y. */
  y?: string;
  /** Line and area: time into each match, or the data's own clock. */
  time?: 'match' | 'real';
  diff: DiffMode;
  /** Diff by teams: the two teams, by label. */
  teams?: [string, string];
  filter?: ChartFilter;
  sort: SortMode;
  /** Bins along x (time, histogram, scatter); 8-120. */
  bins?: number;
  /** Most groups drawn before the rest fold into "Other". */
  top?: number;
}

/** What clicking a mark filters the view to. */
export type MarkFilter =
  | { kind: 'team'; index: number }
  | { kind: 'person'; index: number }
  | { kind: 'session'; index: number }
  | { kind: 'category'; column: string; index: number }
  | { kind: 'range'; column: string; lo: number; hi: number }
  | { kind: 'time'; lo: number; hi: number; match: boolean };

/**
 * A group or a series. `label` is the data's own text, or a message key
 * starting with `@` (`@other`, `@inside`, ...) that `localizeChart` says in
 * the viewer's language - the worker that builds the data has no language.
 */
export interface ChartEntity {
  key: string;
  label: string;
  /** A team's index: the entity wears the team palette's colour. */
  team?: number;
  /** Set by `colorChart`; null before. */
  color?: string;
  filter?: MarkFilter;
}

export type ValueFormat = 'int' | 'pct' | 'dec' | 'rate' | 'ratio' | 'seconds';

export interface ChartAxis {
  lo: number;
  hi: number;
  /** A column's name, or a message key. */
  label: string;
  time?: boolean;
}

export interface ChartData {
  kind: ChartKind;
  groups: ChartEntity[];
  series: ChartEntity[];
  /** values[series][group]; NaN where there is nothing to say. */
  values: number[][];
  /** Rows behind each value, for the tooltip: counts[series][group]. */
  counts?: number[][];
  format: ValueFormat;
  /** Per group, for stat tiles whose values differ in kind. */
  formats?: ValueFormat[];
  /** The value's name, a message key or a column. */
  valueLabel: string;
  /** Continuous x (line, area, histogram, scatter): groups are equal bins over it. */
  axis?: ChartAxis;
  /** Scatter: series are equal bins over this. */
  yAxis?: ChartAxis;
  /** Rows the chart was built from. */
  rows: number;
  /** Part of it estimated from a sample (outside the volume, on big data). */
  sampled?: boolean;
  /** With `sampled`: the rows actually read, of the `rows` they stand for. */
  sampleRows?: number;
  /** A message key saying why there is nothing to draw. */
  empty?: string;
  /**
   * Confidence intervals of the values: lo[series][group] and hi[series][group]
   * (NaN where there is none), drawn as whiskers on bars, columns and lines and
   * said in the tooltip and the table.
   */
  ci?: ChartCi;
  /** Values from fewer rows than the measure's minimum n: low[series][group], drawn faint. */
  low?: boolean[][];
  /** The minimum n `low` is judged by. */
  minN?: number;
}

export interface ChartCi {
  method: 'wilson' | 'bootstrap';
  /** Two-sided, 0.5-0.999. */
  level: number;
  lo: number[][];
  hi: number[][];
}

export const DEFAULT_SPEC: ChartSpec = {
  kind: 'bar',
  measure: { kind: 'count' },
  group: 'team',
  diff: 'none',
  sort: 'value-desc',
};

/** Whether a kind draws groups along a category axis (and so sorts). */
export function sortsGroups(kind: ChartKind): boolean {
  return kind === 'bar' || kind === 'stacked' || kind === 'pie' || kind === 'matrix';
}

/** A spec made whole: defaults for what is missing, nothing a kind cannot use. */
export function normalizeSpec(raw: Partial<ChartSpec> | null | undefined): ChartSpec {
  const s = { ...DEFAULT_SPEC, ...(raw ?? {}) } as ChartSpec;
  if (!CHART_KINDS.includes(s.kind)) s.kind = 'bar';
  if (!s.measure || !MEASURE_KINDS.includes(s.measure.kind)) s.measure = { kind: 'count' };
  if (!DIFF_MODES.includes(s.diff)) s.diff = 'none';
  if (!SORT_MODES.includes(s.sort)) s.sort = 'value-desc';
  if (s.bins !== undefined) s.bins = Math.max(8, Math.min(120, Math.round(s.bins)));
  if (s.top !== undefined) s.top = Math.max(2, Math.min(24, Math.round(s.top)));
  if (s.kind === 'matrix' || s.kind === 'scatter' || s.kind === 'pie') s.diff = 'none';
  if (s.measure.kind === 'pct') s.measure = { ...s.measure, p: Math.max(1, Math.min(99, Math.round(s.measure.p ?? 90))) };
  return s;
}
