/**
 * A chart's numbers from the loaded data: the spec (`spec.ts`) said as a
 * Compare setup (`versus/run.ts`) - its sides as groups, its grouping as the
 * split or the dimension, its measure as the one statistic - and the pass's
 * result read back into labels and series. In the Compare worker, a chunk at
 * a time from idle callbacks, so a chart over millions of rows never holds a
 * frame; `exprChartSync` runs the same on the calling thread for the tests.
 */

import type { Dataset } from '../state/types';
import type { Scope } from '../volumes/stats';
import { FULL_SCOPE } from '../volumes/stats';
import type { Result } from '../versus/engine';
import { ExprError } from '../versus/expr';
import { buildSchema, prepare, runVersus, versusSync, type Prepared, type Setup } from '../versus/run';
import type { ExprChartData, ExprChartSpec } from './exprSpec';

/** The Compare setup a chart is counted by. */
export function exprChartSetup(spec: ExprChartSpec): Setup {
  const groups = spec.diff
    ? [
        { label: spec.diff.a.label, filter: joinFilter(spec.filter, spec.diff.a.filter) },
        { label: spec.diff.b.label, filter: joinFilter(spec.filter, spec.diff.b.filter) },
      ]
    : [{ label: spec.measure.name ?? spec.measure.expr, filter: spec.filter ?? '' }];
  const g = spec.groupBy;
  return {
    region: { mode: 'all', volumes: [] },
    groups,
    split: g?.by === 'column' ? { column: g.column, top: g.top ?? 8 } : null,
    dim: g?.by === 'time' ? { kind: 'matchTime', bins: g.bins ?? 20 } : g?.by === 'match' ? { kind: 'match' } : g?.by === 'round' ? { kind: 'round' } : null,
    metrics: [{ id: 'm', name: spec.measure.name ?? spec.measure.expr, expr: spec.measure.expr, unit: spec.measure.unit ?? '' }],
    ref: 0,
  };
}

function joinFilter(a: string | undefined, b: string): string {
  const x = (a ?? '').trim();
  const y = b.trim();
  return x && y ? `(${x}) and (${y})` : x || y;
}

/** The chart's labels and series from a Compare result of `exprChartSetup(spec)`. */
export function exprChartFromResult(spec: ExprChartSpec, res: Result, dataset: string): ExprChartData {
  const sides = spec.diff ? 2 : 1;
  const D = res.dims?.length ?? 0;
  const metric = res.metrics[0];
  const value = (i: number, k = -1) => (metric && i >= 0 ? metric.values[i * (1 + D) + (k < 0 ? 0 : 1 + k)] : NaN);
  const rowOf = (g: number, s: number) => res.rows.findIndex((r) => r.v === 0 && r.g === g && r.s === s);
  let labels: string[];
  const series: ExprChartData['series'] = [];
  const sideLabel = (g: number) => (spec.diff ? (g === 0 ? spec.diff.a.label : spec.diff.b.label) : (spec.measure.name ?? spec.measure.expr));
  if (spec.groupBy?.by === 'column') {
    // The split's values, in the pass's order (most rows first), the other bucket last when it has rows.
    const order: { s: number; label: string }[] = [];
    for (const r of res.rows) if (r.v === 0 && r.g === 0 && r.s >= 0) order.push({ s: r.s, label: r.split ?? '' });
    const other = res.rows.find((r) => r.v === 0 && r.g === 0 && r.s === -2 && r.rows > 0);
    if (other) order.push({ s: -2, label: other.split ?? 'other' });
    labels = order.map((o) => o.label);
    for (let g = 0; g < sides; g++) series.push({ label: sideLabel(g), values: order.map((o) => value(rowOf(g, o.s))) });
  } else if (D > 0) {
    labels = [...(res.dims ?? [])];
    for (let g = 0; g < sides; g++) {
      const i = rowOf(g, -1);
      series.push({ label: sideLabel(g), values: labels.map((_, k) => value(i, k)) });
    }
  } else {
    labels = [spec.measure.name ?? spec.measure.expr];
    for (let g = 0; g < sides; g++) series.push({ label: sideLabel(g), values: [value(rowOf(g, -1))] });
  }
  return { labels, series, unit: spec.measure.unit ?? '', rows: res.shownRows, at: Date.now(), dataset };
}

/** Why a chart cannot be counted on this data, as a message key and values; null when it can. */
export function exprChartProblem(ds: Dataset, spec: ExprChartSpec): { key: string; values: Record<string, string | number> } | null {
  try {
    const p = prepare(ds, exprChartSetup(spec), FULL_SCOPE, buildSchema(ds));
    const ge = p.groupErrors.find((e) => e);
    if (ge) return { key: `versus.err.${ge.key}`, values: ge.values };
    const me = p.metricErrors.get('m');
    if (me) return { key: `versus.err.${me.key}`, values: me.values };
    return null;
  } catch (e) {
    return e instanceof ExprError ? { key: `versus.err.${e.key}`, values: e.values } : { key: 'charts.failed', values: { message: String(e) } };
  }
}

function prepared(ds: Dataset, spec: ExprChartSpec, scope: Scope): Prepared {
  const p = prepare(ds, exprChartSetup(spec), spec.scope === 'view' ? scope : FULL_SCOPE, buildSchema(ds));
  const err = p.groupErrors.find((e) => e) ?? p.metricErrors.get('m');
  if (err) throw err;
  return p;
}

/** The chart's numbers, counted in the Compare worker. Rejects with the expression's `ExprError` when it does not bind. */
export async function computeExprChart(ds: Dataset, spec: ExprChartSpec, scope: Scope = FULL_SCOPE, opts: { signal?: AbortSignal; onProgress?: (f: number) => void } = {}): Promise<ExprChartData> {
  const p = prepared(ds, spec, scope);
  const res = await runVersus(ds, p, opts);
  return exprChartFromResult(spec, res, ds.name);
}

/** The same on this thread: tests, and small data. */
export function exprChartSync(ds: Dataset, spec: ExprChartSpec, scope: Scope = FULL_SCOPE): ExprChartData {
  return exprChartFromResult(spec, versusSync(ds, prepared(ds, spec, scope)), ds.name);
}
