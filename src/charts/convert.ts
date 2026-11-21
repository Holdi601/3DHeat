/**
 * Charts made elsewhere, in this module's form: an analysis document's
 * expression chart (`exprSpec.ts`, counted by the Compare engine) as a
 * `ChartData`, and a chart block's data read back from JSON - so every chart
 * in the viewer, a sign's, a document's, an exported one, is drawn by the
 * same code (`draw.ts`) and reads as one system.
 */

import type { ExprChartData, ExprChartSpec } from './exprSpec';
import { CHART_KINDS, type ChartData, type ChartEntity, type ChartKind, type ValueFormat } from './types';

/** An expression chart's numbers as chart data: its labels the groups, its sides the series. */
export function exprToChartData(spec: ExprChartSpec, d: ExprChartData): ChartData {
  const kind: ChartKind = spec.kind === 'line' ? 'line' : spec.kind === 'tiles' ? 'tiles' : 'bar';
  const groups: ChartEntity[] = d.labels.map((l, i) => ({ key: `g${i}:${l}`, label: l }));
  const series: ChartEntity[] = d.series.map((s, i) => ({ key: `s${i}:${s.label}`, label: s.label }));
  const values = d.series.map((s) => groups.map((_, i) => (Number.isFinite(s.values[i]) ? s.values[i] : NaN)));
  const integral = values.every((r) => r.every((v) => !Number.isFinite(v) || Number.isInteger(v)));
  const format: ValueFormat = d.unit === '%' ? 'pct' : integral ? 'int' : 'dec';
  const label = spec.measure.name ?? spec.measure.expr;
  const out: ChartData = { kind, groups, series, values, format, valueLabel: d.unit && d.unit !== '%' ? `${label} (${d.unit})` : label, rows: d.rows };
  if (d.labels.length === 0) out.empty = 'charts.empty.noRows';
  return out;
}

const num = (v: unknown) => (typeof v === 'number' ? v : v === null ? NaN : Number(v));

/** Chart data from JSON (a document, a file, a peer), checked and made whole; null when it is not chart data. */
export function readChartData(v: unknown): ChartData | null {
  const o = v as Partial<ChartData> | null;
  if (!o || typeof o !== 'object' || !Array.isArray(o.groups) || !Array.isArray(o.series) || !Array.isArray(o.values)) return null;
  const ent = (e: unknown, i: number): ChartEntity => {
    const x = (e ?? {}) as Partial<ChartEntity>;
    return { key: typeof x.key === 'string' ? x.key : String(i), label: typeof x.label === 'string' ? x.label : '', ...(typeof x.team === 'number' ? { team: x.team } : {}), ...(x.filter ? { filter: x.filter } : {}) };
  };
  const groups = o.groups.slice(0, 2000).map(ent);
  const series = o.series.slice(0, 200).map(ent);
  const values = series.map((_, s) => groups.map((_, g) => num((o.values as unknown[][])[s]?.[g])));
  const kind = CHART_KINDS.includes(o.kind as ChartKind) ? (o.kind as ChartKind) : 'bar';
  const out: ChartData = { kind, groups, series, values, format: (o.format as ValueFormat) ?? 'dec', valueLabel: typeof o.valueLabel === 'string' ? o.valueLabel : '', rows: typeof o.rows === 'number' ? o.rows : 0 };
  if (Array.isArray(o.formats)) out.formats = o.formats as ValueFormat[];
  if (Array.isArray(o.counts)) out.counts = o.counts as number[][];
  if (o.axis && typeof o.axis === 'object') out.axis = o.axis;
  if (o.yAxis && typeof o.yAxis === 'object') out.yAxis = o.yAxis;
  if (o.sampled) out.sampled = true;
  if (typeof o.sampleRows === 'number') out.sampleRows = o.sampleRows;
  if (typeof o.empty === 'string') out.empty = o.empty;
  return out;
}
