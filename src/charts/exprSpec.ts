/**
 * A chart as data: what is counted, over which rows, grouped how - the
 * Compare panel's expressions (`versus/expr.ts`) - kept as plain JSON so an
 * analysis document, a sign on a volume or a shared session can carry it,
 * and the numbers it last showed (`ExprChartData`) beside it, so a document
 * exported or opened without its data still shows them.
 *
 *   kind      bar (one bar per group or value), line (over time), tiles (the numbers)
 *   measure   a Compare statistic: `count()`, `kills() / deaths()`, `avg(speed)`
 *   groupBy   a column's values (top N), time bins, the matches, the rounds; none for one number
 *   filter    a Compare filter on the rows counted (`team == "Allies"`); empty for all
 *   diff      two sides, each a filter: both drawn, and the difference
 *   scope     the rows the view shows (time window, filters, groups) or all the data
 *   anchor    what it is about, as a note anchors (`notes/anchors.ts`): for the jump
 *
 * Other chart kinds (stacked, histogram, matrix, scatter) take the same spec;
 * a renderer that does not know a kind draws it as bars.
 */

export type ExprChartKind = 'bar' | 'line' | 'tiles' | (string & {});

export type ExprChartGroupBy =
  | { by: 'column'; column: string; top?: number }
  | { by: 'time'; bins?: number }
  | { by: 'match' }
  | { by: 'round' }
  | null;

export interface ExprChartSide {
  label: string;
  /** A Compare filter expression; empty for every row. */
  filter: string;
}

export interface ExprChartSpec {
  v: 1;
  kind: ExprChartKind;
  title?: string;
  measure: { expr: string; name?: string; unit?: string };
  groupBy: ExprChartGroupBy;
  filter?: string;
  diff?: { a: ExprChartSide; b: ExprChartSide } | null;
  scope?: 'view' | 'all';
  /** A note anchor (`notes/anchors.ts` `Anchor`), kept as it is. */
  anchor?: unknown;
}

/** The numbers a chart showed: one series per side (one without `diff`), a value per label. */
export interface ExprChartData {
  labels: string[];
  series: { label: string; values: number[] }[];
  unit: string;
  /** Rows the pass counted. */
  rows: number;
  /** Milliseconds since 1970. */
  at: number;
  /** The data it was counted on, by name. */
  dataset: string;
}

export const DEFAULT_EXPR_CHART: ExprChartSpec = { v: 1, kind: 'bar', measure: { expr: 'count()', name: 'Rows' }, groupBy: { by: 'column', column: 'team', top: 8 }, scope: 'all' };

const str = (v: unknown, max = 2000) => (typeof v === 'string' ? v.slice(0, max) : '');

/** A spec from JSON, its parts checked; null when it is not one. */
export function readExprChartSpec(v: unknown): ExprChartSpec | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const m = o.measure as Record<string, unknown> | undefined;
  if (!m || typeof m.expr !== 'string' || !m.expr.trim()) return null;
  const g = o.groupBy as Record<string, unknown> | null | undefined;
  let groupBy: ExprChartGroupBy = null;
  if (g && typeof g === 'object') {
    if (g.by === 'column' && typeof g.column === 'string') groupBy = { by: 'column', column: g.column, top: typeof g.top === 'number' ? Math.max(1, Math.min(50, Math.round(g.top))) : 8 };
    else if (g.by === 'time') groupBy = { by: 'time', bins: typeof g.bins === 'number' ? Math.max(2, Math.min(200, Math.round(g.bins))) : 20 };
    else if (g.by === 'match' || g.by === 'round') groupBy = { by: g.by };
  }
  const d = o.diff as Record<string, Record<string, unknown>> | null | undefined;
  const side = (s: Record<string, unknown> | undefined, fallback: string): ExprChartSide => ({ label: str(s?.label, 80) || fallback, filter: str(s?.filter) });
  return {
    v: 1,
    kind: typeof o.kind === 'string' && o.kind ? (o.kind as ExprChartKind) : 'bar',
    ...(typeof o.title === 'string' && o.title ? { title: o.title.slice(0, 200) } : {}),
    measure: { expr: m.expr.slice(0, 2000), ...(typeof m.name === 'string' ? { name: m.name.slice(0, 120) } : {}), ...(typeof m.unit === 'string' ? { unit: m.unit.slice(0, 20) } : {}) },
    groupBy,
    ...(typeof o.filter === 'string' && o.filter.trim() ? { filter: o.filter.slice(0, 2000) } : {}),
    ...(d && typeof d === 'object' && d.a && d.b ? { diff: { a: side(d.a, 'A'), b: side(d.b, 'B') } } : {}),
    scope: o.scope === 'view' ? 'view' : 'all',
    ...(o.anchor !== undefined ? { anchor: o.anchor } : {}),
  };
}

/** Numbers from JSON, checked; null when they are not. */
export function readExprChartData(v: unknown): ExprChartData | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (!Array.isArray(o.labels) || !Array.isArray(o.series)) return null;
  const labels = o.labels.map((l) => String(l)).slice(0, 500);
  const series = (o.series as unknown[])
    .filter((s): s is { label: unknown; values: unknown[] } => !!s && typeof s === 'object' && Array.isArray((s as { values?: unknown }).values))
    .slice(0, 8)
    .map((s) => ({ label: String(s.label ?? ''), values: labels.map((_, i) => Number(s.values[i] ?? NaN)) }));
  return { labels, series, unit: str(o.unit, 20), rows: typeof o.rows === 'number' ? o.rows : 0, at: typeof o.at === 'number' ? o.at : 0, dataset: str(o.dataset, 300) };
}
