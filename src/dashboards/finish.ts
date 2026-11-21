/**
 * A tile's numbers in the form its visual draws: the chart module's
 * `ChartData` for the charts it already draws (bars, lines, areas, donut,
 * histogram, binned scatter, matrix), and small shapes of their own for the
 * rest (KPI cards, tables, pivots, treemaps, top-N lists, box plots,
 * percentile bands, bubbles, the mini map, slicer lists). Each keeps how its
 * marks map back to cells, so a click selects, drills or drills through.
 *
 * Groups past the tile's "most" fold into Other, summed from their
 * accumulators (an additive measure's Other is exact; a distinct count's says
 * nothing and is left out).
 */

import type { ChartData, ChartEntity, ValueFormat } from '../charts/types';
import type { CiMethod } from './ci';
import type { Catalog } from './fields';
import { dimLabel } from './fields';
import type { Tile } from './model';
import { cellParts, totalsOf, type MeasureCtx, type MeasureOut, type PlannedDim, type TilePlan } from './plan';
import { histQuantile, type AccSpec, type Merged } from './query';

/** Where a chart's marks come from: per group its axis cell (-1 Other), per series its legend index (-1 a measure). */
export interface MarkMap {
  gCell: number[];
  sLegend: number[];
}

/** How a measure's interval was made, and the rows below which its values are greyed (0: none). */
export interface CiInfo {
  method: CiMethod;
  level: number;
  minN: number;
}

/** One value's interval, the rows behind it, and whether they are fewer than the minimum. */
export interface CiValue {
  lo: number;
  hi: number;
  n: number;
  low: boolean;
}

export interface KpiData {
  kind: 'kpi';
  name: string;
  value: number;
  format: ValueFormat;
  /** The measure adds up over rows (a count, a sum): against the baseline it is a share of it. */
  additive: boolean;
  compare: { value: number; label: string } | null;
  spark: number[] | null;
  rows: number;
  /** A rate's interval. */
  ci?: (CiInfo & CiValue) | null;
}

export interface TableRow {
  /** Per axis dim, its index; the cell over the axis dims. */
  parts: number[];
  cell: number;
  labels: string[];
  values: number[];
  /** Per value column with an interval, its interval (null for the others). */
  ci?: (CiValue | null)[];
}

export interface TableData {
  kind: 'table';
  head: string[];
  axisCount: number;
  formats: ValueFormat[];
  /** Per value column, how its interval is made (null: none). */
  ci?: (CiInfo | null)[];
  rows: TableRow[];
  /** Per value column, its range over the rows (data bars, colour scales). */
  ranges: [number, number][];
  totals: number[];
  more: number;
}

export interface PivotData {
  kind: 'pivot';
  rowHead: string[];
  rows: { labels: string[]; cell: number }[];
  cols: { label: string; index: number }[];
  measures: { name: string; format: ValueFormat }[];
  /** values[measure][row][col]. */
  values: number[][][];
  rowTotals: number[][];
  colTotals: number[][];
  range: [number, number];
}

export interface ItemsData {
  kind: 'items';
  name: string;
  format: ValueFormat;
  items: { label: string; value: number; cell: number; team?: number; key: string; hl?: number }[];
  total: number;
}

export interface BoxData {
  kind: 'box';
  name: string;
  format: ValueFormat;
  groups: { label: string; cell: number; q: [number, number, number, number, number]; n: number }[];
  lo: number;
  hi: number;
}

export interface BandsData {
  kind: 'bands';
  name: string;
  format: ValueFormat;
  axis: { lo: number; hi: number; time: boolean; label: string };
  /** Per bin: p10, p25, p50, p75, p90 (NaN where empty). */
  bins: number[][];
}

export interface BubbleData {
  kind: 'bubble';
  names: [string, string, string | null];
  formats: [ValueFormat, ValueFormat];
  points: { label: string; x: number; y: number; r: number; cell: number; team?: number; key: string }[];
}

export interface MapData {
  kind: 'map';
  n: number;
  counts: Float64Array;
  hl: Float64Array | null;
  lo: [number, number];
  step: number;
  max: number;
}

export interface SlicerData {
  kind: 'slicer';
  items: { label: string; count: number; index: number }[];
}

export type TileData =
  | { kind: 'chart'; chart: ChartData; marks: MarkMap }
  | KpiData
  | TableData
  | PivotData
  | ItemsData
  | BoxData
  | BandsData
  | BubbleData
  | MapData
  | SlicerData
  | { kind: 'empty'; message: string; values?: Record<string, string> };

const sizeOf = (d: PlannedDim) => (d.dim.k === 'cat' ? d.dim.size : d.dim.count);

/** One cell's accumulators summed over several cells (Other, a group over its legend). */
export function combine(m: Merged, accs: readonly AccSpec[], cells: readonly number[]): Merged {
  const out: Merged = { id: m.id, cells: 1, rows: 0, accs: [] };
  accs.forEach((a, i) => {
    const src = m.accs[i];
    const w = a.k === 'sum' ? 2 : a.k === 'hist' ? a.bins : 1;
    const o = new Float64Array(w).fill(a.k === 'min' ? Infinity : a.k === 'max' ? -Infinity : 0);
    for (const c of cells)
      for (let j = 0; j < w; j++) {
        const v = src[c * w + j];
        if (a.k === 'min') o[j] = Math.min(o[j], v);
        else if (a.k === 'max') o[j] = Math.max(o[j], v);
        else o[j] += v;
      }
    out.accs.push(o);
  });
  return out;
}

export function ctxOf(plan: TilePlan, m: Merged, weight = 1): MeasureCtx {
  return { totals: totalsOf(m), minutes: plan.minutes, weight };
}

export function ciInfo(m: MeasureOut | undefined): CiInfo | null {
  return m?.ci ? { method: m.ci.method, level: m.ci.level, minN: m.ci.minN } : null;
}

/** A measure's interval at a cell; null without one or without rows. */
export function ciValue(m: MeasureOut | undefined, src: Merged, cell: number, ctx: MeasureCtx): CiValue | null {
  if (!m?.ci) return null;
  const n = m.ci.n(src, cell, ctx);
  const iv = m.ci.interval(src, cell, ctx);
  if (!iv) return null;
  return { lo: iv[0], hi: iv[1], n, low: m.ci.minN > 0 && n < m.ci.minN };
}

function countIdx(accs: readonly AccSpec[]): number {
  return accs.findIndex((a) => a.k === 'count' && !a.where);
}

const ordered = (d: PlannedDim) => d.dim.k === 'bin';

/** The axis cells with rows, in the tile's order, at most `top` (the rest returned to fold). */
function axisCells(plan: TilePlan, m: Merged, accs: readonly AccSpec[], tile: Tile, top: number, score: (axisCell: number) => number): { keep: number[]; rest: number[] } {
  const ax = plan.dims.slice(0, plan.axisDims);
  const A = ax.reduce((s, d) => s * sizeOf(d), 1);
  const L = plan.dims.slice(plan.axisDims).reduce((s, d) => s * sizeOf(d), 1);
  const ci = countIdx(accs);
  const cnt = m.accs[ci];
  const isOrdered = ax.length > 0 && ax.every(ordered);
  const live: number[] = [];
  for (let a = 0; a < A; a++) {
    let n = 0;
    for (let l = 0; l < L; l++) n += cnt[a + A * l];
    if (n > 0 || isOrdered) live.push(a);
  }
  const sort = tile.opts?.sort ?? (isOrdered ? 'natural' : 'value-desc');
  const sc = new Map(live.map((a) => [a, score(a)]));
  if (sort === 'value-desc') live.sort((x, y) => (sc.get(y)! || 0) - (sc.get(x)! || 0));
  else if (sort === 'value-asc') live.sort((x, y) => (sc.get(x)! || 0) - (sc.get(y)! || 0));
  else if (sort === 'label') live.sort((x, y) => labelOf(plan, x).localeCompare(labelOf(plan, y)));
  if (isOrdered || live.length <= top) return { keep: live, rest: [] };
  // Folded by size whatever the order shown: the biggest are kept.
  const bySize = [...live].sort((x, y) => (sc.get(y)! || 0) - (sc.get(x)! || 0));
  const keepSet = new Set(bySize.slice(0, top - 1));
  return { keep: live.filter((a) => keepSet.has(a)), rest: live.filter((a) => !keepSet.has(a)) };
}

let catRef: Catalog | null = null;
function labelOf(plan: TilePlan, axisCell: number): string {
  const ax = plan.dims.slice(0, plan.axisDims);
  const parts = cellParts(ax, axisCell);
  return ax.map((d, i) => dimLabel(d.field, d.dim, parts[i], catRef?.epochMs ?? null)).join(' › ');
}

function entityOf(plan: TilePlan, axisCell: number): ChartEntity {
  const ax = plan.dims.slice(0, plan.axisDims);
  const e: ChartEntity = { key: `g:${ax.map((d) => d.field.id).join('/')}:${labelOf(plan, axisCell)}`, label: labelOf(plan, axisCell) };
  if (ax.length === 1 && ax[0].field.id === 'team') e.team = cellParts(ax, axisCell)[0];
  return e;
}

const DEFAULT_TOP: Partial<Record<Tile['kind'], number>> = { bar: 12, column: 12, pie: 5, treemap: 24, topn: 10, matrix: 12, scatter: 60, box: 12, table: 500, pivot: 60 };

/** Everything a tile draws, from its plan and its queries' merged numbers. */
export function finishTile(cat: Catalog, tile: Tile, plan: TilePlan, results: Map<string, Merged>, weight = 1): TileData {
  catRef = cat;
  if (plan.error) return { kind: 'empty', message: plan.error };
  const main = results.get(`${tile.id}:main`);
  if (!main && tile.kind !== 'slicer') return { kind: 'empty', message: 'dash.empty.counting' };
  const accs = plan.queries[0]?.accs ?? [];
  const kind = tile.kind;
  if (kind === 'slicer') {
    if (!main) return { kind: 'slicer', items: [] };
    const d = plan.dims[0];
    const ci = countIdx(accs);
    const items: SlicerData['items'] = [];
    for (let i = 0; i < sizeOf(d); i++) items.push({ label: dimLabel(d.field, d.dim, i, cat.epochMs), count: main.accs[ci][i], index: i });
    return { kind: 'slicer', items };
  }
  if (main!.rows === 0 && kind !== 'kpi') return { kind: 'empty', message: 'dash.empty.noRows' };
  const m = main!;
  const ctx = ctxOf(plan, m, weight);
  const ms = plan.measures;
  if (kind === 'kpi') {
    const meas = ms[0];
    const value = meas.value(m, 0, ctx);
    const cmp = results.get(`${tile.id}:cmp`);
    const spark = results.get(`${tile.id}:spark`);
    let sparkVals: number[] | null = null;
    if (spark && plan.spark) {
      const sctx = { totals: totalsOf(spark), minutes: plan.minutes / 24 };
      sparkVals = Array.from({ length: spark.cells }, (_, c) => plan.spark!.value(spark, c, sctx));
    }
    const mode = tile.opts?.compare ?? 'baseline';
    const info = ciInfo(meas);
    const civ = info ? ciValue(meas, m, 0, ctx) : null;
    return {
      kind: 'kpi',
      name: meas.name,
      value,
      format: meas.format,
      additive: meas.additive,
      compare: cmp ? { value: meas.value(cmp, 0, ctxOf(plan, cmp, weight)), label: mode === 'set' ? (tile.opts?.compareLabel || 'dash.kpi.vsSet') : 'dash.kpi.vsBaseline' } : null,
      spark: sparkVals,
      rows: m.rows,
      ...(info ? { ci: civ ? { ...info, ...civ } : null } : {}),
    };
  }
  const hl = plan.highlight ? (results.get(`${tile.id}:hl`) ?? null) : null;
  const top = tile.opts?.top ?? DEFAULT_TOP[kind] ?? 24;
  const ax = plan.dims.slice(0, plan.axisDims);
  const lg = plan.dims.slice(plan.axisDims);
  const A = ax.reduce((s, d) => s * sizeOf(d), 1);
  const L = lg.reduce((s, d) => s * sizeOf(d), 1);
  const legendCells = (a: number) => Array.from({ length: L }, (_, l) => a + A * l);
  const groupValue = (meas: MeasureOut, src: Merged, a: number) => (L === 1 ? meas.value(src, a, ctx) : meas.value(combine(src, accs, legendCells(a)), 0, ctx));
  const restValue = (meas: MeasureOut, src: Merged, cells: number[]) => (meas.additive ? meas.value(combine(src, accs, cells.flatMap(legendCells)), 0, ctx) : NaN);

  if (kind === 'table') {
    const ci = countIdx(accs);
    const anyCi = ms.some((x) => x.ci);
    const rows: TableRow[] = [];
    for (let c = 0; c < m.cells; c++) {
      if (!(m.accs[ci][c] > 0)) continue;
      const parts = cellParts(plan.dims, c);
      const row: TableRow = { parts, cell: c, labels: plan.dims.map((d, i) => dimLabel(d.field, d.dim, parts[i], cat.epochMs)), values: ms.map((x) => x.value(m, c, ctx)) };
      if (anyCi) row.ci = ms.map((x) => ciValue(x, m, c, ctx));
      rows.push(row);
    }
    const sort = tile.opts?.sort ?? 'value-desc';
    if (sort === 'value-desc') rows.sort((a, b) => (b.values[0] || 0) - (a.values[0] || 0));
    else if (sort === 'value-asc') rows.sort((a, b) => (a.values[0] || 0) - (b.values[0] || 0));
    else if (sort === 'label') rows.sort((a, b) => a.labels.join().localeCompare(b.labels.join()));
    const limit = Math.min(top, 5000);
    const shown = rows.slice(0, limit);
    const ranges = ms.map((_x, i) => {
      let lo = Infinity;
      let hi = -Infinity;
      for (const r of shown) if (Number.isFinite(r.values[i])) (lo = Math.min(lo, r.values[i])), (hi = Math.max(hi, r.values[i]));
      return [lo, hi] as [number, number];
    });
    const all = combine(m, accs, Array.from({ length: m.cells }, (_, c) => c));
    return {
      kind: 'table',
      head: [...plan.dims.map((d) => d.field.name), ...ms.map((x) => x.name)],
      axisCount: plan.dims.length,
      formats: ms.map((x) => x.format),
      ...(anyCi ? { ci: ms.map(ciInfo) } : {}),
      rows: shown,
      ranges,
      totals: ms.map((x) => x.value(all, 0, ctx)),
      more: rows.length - shown.length,
    };
  }

  if (kind === 'pivot') {
    const ci = countIdx(accs);
    const colDim = lg[0];
    const cols = colDim ? Array.from({ length: sizeOf(colDim) }, (_, i) => ({ label: dimLabel(colDim.field, colDim.dim, i, cat.epochMs), index: i })) : [{ label: ms[0]?.name ?? '', index: 0 }];
    const liveCols = cols.filter((c) => {
      for (let a = 0; a < A; a++) if (m.accs[ci][a + A * c.index] > 0) return true;
      return false;
    });
    const { keep } = axisCells(plan, m, accs, tile, top, (a) => groupValue(ms[0], m, a));
    const rows = keep.map((a) => ({ labels: cellParts(ax, a).map((p, i) => dimLabel(ax[i].field, ax[i].dim, p, cat.epochMs)), cell: a }));
    let lo = Infinity;
    let hi = -Infinity;
    const values = ms.map((x, mi) =>
      rows.map((r) =>
        liveCols.map((c) => {
          const v = x.value(m, r.cell + A * c.index, ctx);
          if (mi === 0 && Number.isFinite(v)) (lo = Math.min(lo, v)), (hi = Math.max(hi, v));
          return v;
        }),
      ),
    );
    const rowTotals = ms.map((x) => rows.map((r) => groupValue(x, m, r.cell)));
    const colTotals = ms.map((x) => liveCols.map((c) => x.value(combine(m, accs, Array.from({ length: A }, (_, a) => a + A * c.index)), 0, ctx)));
    return { kind: 'pivot', rowHead: ax.map((d) => d.field.name), rows, cols: liveCols, measures: ms.map((x) => ({ name: x.name, format: x.format })), values, rowTotals, colTotals, range: [lo, hi] };
  }

  if (kind === 'box' || kind === 'bands') {
    const hIdx = accs.findIndex((a) => a.k === 'hist');
    const h = accs[hIdx] as Extract<AccSpec, { k: 'hist' }>;
    const mn = m.accs[accs.findIndex((a) => a.k === 'min')];
    const mx = m.accs[accs.findIndex((a) => a.k === 'max')];
    const cnt = m.accs[countIdx(accs)];
    const q = (c: number, p: number) => histQuantile(m.accs[hIdx], c * h.bins, h.bins, h.lo, h.hi, p);
    if (kind === 'bands') {
      const d = plan.dims[0];
      const bins = Array.from({ length: sizeOf(d) }, (_, c) => (cnt[c] > 0 ? [0.1, 0.25, 0.5, 0.75, 0.9].map((p) => q(c, p)) : [NaN, NaN, NaN, NaN, NaN]));
      const lo = d.dim.k === 'bin' ? d.dim.lo : 0;
      const hi = d.dim.k === 'bin' ? d.dim.lo + d.dim.step * d.dim.count : 1;
      return { kind: 'bands', name: ms[0].name, format: ms[0].format, axis: { lo, hi, time: !!d.field.time, label: d.field.name }, bins };
    }
    const minmax = tile.opts?.whiskers === 'minmax';
    const cellsList = plan.dims.length ? axisCells(plan, m, accs, tile, top, (a) => q(a, 0.5)).keep : [0];
    const groups = cellsList.map((c) => ({
      label: plan.dims.length ? labelOf(plan, c) : ms[0].name,
      cell: c,
      q: [minmax ? mn[c] : q(c, 0.05), q(c, 0.25), q(c, 0.5), q(c, 0.75), minmax ? mx[c] : q(c, 0.95)] as [number, number, number, number, number],
      n: cnt[c],
    }));
    return { kind: 'box', name: ms[0].name, format: ms[0].format, groups, lo: Math.min(...groups.map((g) => g.q[0]).filter(Number.isFinite)), hi: Math.max(...groups.map((g) => g.q[4]).filter(Number.isFinite)) };
  }

  if (kind === 'minimap') {
    const ci = countIdx(accs);
    const d = plan.dims[0].dim as Extract<PlannedDim['dim'], { k: 'bin' }>;
    const dz = plan.dims[1].dim as Extract<PlannedDim['dim'], { k: 'bin' }>;
    let max = 0;
    const counts = m.accs[ci];
    for (let i = 0; i < counts.length; i++) if (counts[i] > max) max = counts[i];
    return { kind: 'map', n: d.count, counts, hl: hl ? hl.accs[ci] : null, lo: [d.lo, dz.lo], step: d.step, max };
  }

  if (kind === 'scatter') {
    const { keep } = axisCells(plan, m, accs, tile, top, (a) => groupValue(ms[0], m, a));
    const [mx, my, msz] = ms;
    const points = keep.map((a) => {
      const e = entityOf(plan, a);
      return { label: e.label, key: e.key, team: e.team, x: groupValue(mx, m, a), y: my ? groupValue(my, m, a) : NaN, r: msz ? groupValue(msz, m, a) : 1, cell: a };
    });
    return { kind: 'bubble', names: [mx.name, my?.name ?? '', msz?.name ?? null], formats: [mx.format, my?.format ?? 'dec'], points };
  }

  if (kind === 'treemap' || kind === 'topn') {
    const meas = ms[0];
    const { keep, rest } = axisCells(plan, m, accs, tile, top, (a) => groupValue(meas, m, a));
    const items: ItemsData['items'] = keep.map((a) => {
      const e = entityOf(plan, a);
      return { label: e.label, key: e.key, team: e.team, value: groupValue(meas, m, a), cell: a, ...(hl ? { hl: groupValue(meas, hl, a) } : {}) };
    });
    if (rest.length && kind === 'treemap') {
      const v = restValue(meas, m, rest);
      if (Number.isFinite(v)) items.push({ label: '@other', key: 'other', value: v, cell: -1 });
    }
    const all = combine(m, accs, Array.from({ length: m.cells }, (_, c) => c));
    return { kind: 'items', name: meas.name, format: meas.format, items, total: meas.value(all, 0, ctx) };
  }

  // The chart module's kinds.
  const chartKind: ChartData['kind'] =
    kind === 'pie' ? 'pie' : kind === 'line' ? 'line' : kind === 'area' ? 'area' : kind === 'histogram' ? 'histogram' : kind === 'matrix' ? 'matrix' : kind === 'density' ? 'scatter' : tile.opts?.stack && tile.opts.stack !== 'none' ? 'stacked' : 'bar';
  const meas = ms[0];
  if (kind === 'density') {
    const ci = countIdx(accs);
    const dx = plan.dims[0];
    const dy = plan.dims[1];
    const nx = sizeOf(dx);
    const ny = sizeOf(dy);
    const bx = dx.dim as Extract<PlannedDim['dim'], { k: 'bin' }>;
    const by = dy.dim as Extract<PlannedDim['dim'], { k: 'bin' }>;
    const groups: ChartEntity[] = Array.from({ length: nx }, (_, i) => ({ key: `x${i}`, label: dimLabel(dx.field, dx.dim, i, cat.epochMs) }));
    const series: ChartEntity[] = Array.from({ length: ny }, (_, j) => ({ key: `y${j}`, label: dimLabel(dy.field, dy.dim, j, cat.epochMs) }));
    const values = series.map((_s, j) => groups.map((_g, i) => m.accs[ci][i + nx * j]));
    return {
      kind: 'chart',
      chart: { kind: 'scatter', groups, series, values, format: 'int', valueLabel: meas.name, axis: { lo: bx.lo, hi: bx.lo + bx.step * bx.count, label: dx.field.name, time: !!dx.field.time }, yAxis: { lo: by.lo, hi: by.lo + by.step * by.count, label: dy.field.name, time: !!dy.field.time }, rows: m.rows },
      marks: { gCell: groups.map((_g, i) => i), sLegend: series.map((_s, j) => j) },
    };
  }
  const score = (a: number) => {
    const v = groupValue(meas, m, a);
    return Number.isFinite(v) ? v : 0;
  };
  const { keep, rest } = axisCells(plan, m, accs, tile, top, score);
  const groups: ChartEntity[] = keep.map((a) => entityOf(plan, a));
  const gCell = [...keep];
  if (rest.length && (chartKind === 'bar' || chartKind === 'stacked' || chartKind === 'pie' || chartKind === 'matrix')) {
    groups.push({ key: 'other', label: '@other' });
    gCell.push(-1);
  }
  let series: ChartEntity[];
  let values: number[][];
  let sLegend: number[];
  const valueAt = (meas2: MeasureOut, src: Merged, gi: number, l: number | null) => {
    const a = gCell[gi];
    if (a < 0) return l === null ? restValue(meas2, src, rest) : meas2.additive ? meas2.value(combine(src, accs, rest.map((r) => r + A * l)), 0, ctx) : NaN;
    return l === null ? groupValue(meas2, src, a) : meas2.value(src, a + A * l, ctx);
  };
  if (lg.length) {
    // Series by the legend, the 8 biggest; the rest is "Other".
    const d = lg[0];
    const n = sizeOf(d);
    const tot = Array.from({ length: n }, (_, l) => {
      const v = meas.value(combine(m, accs, Array.from({ length: A }, (_, a) => a + A * l)), 0, ctx);
      return [l, Number.isFinite(v) ? v : 0] as const;
    }).filter((x) => x[1] !== 0 || d.dim.k === 'bin');
    const ordL = d.dim.k === 'bin' ? tot : [...tot].sort((x, y) => y[1] - x[1]);
    const keepL = ordL.slice(0, ordL.length > 8 ? 7 : 8).map((x) => x[0]);
    sLegend = keepL;
    series = keepL.map((l) => ({ key: `s:${d.field.id}:${dimLabel(d.field, d.dim, l, cat.epochMs)}`, label: dimLabel(d.field, d.dim, l, cat.epochMs), ...(d.field.id === 'team' ? { team: l } : {}) }));
    values = keepL.map((l) => groups.map((_g, gi) => valueAt(meas, m, gi, l)));
    const restL = ordL.slice(keepL.length).map((x) => x[0]);
    if (restL.length && meas.additive) {
      series.push({ key: 'other', label: '@other' });
      sLegend.push(-1);
      values.push(groups.map((_g, gi) => {
        const a = gCell[gi];
        const cells = (a < 0 ? rest : [a]).flatMap((x) => restL.map((l) => x + A * l));
        return meas.value(combine(m, accs, cells), 0, ctx);
      }));
    }
  } else {
    series = ms.map((x, i) => ({ key: `m:${i}:${x.name}`, label: x.name }));
    sLegend = ms.map(() => -1);
    values = ms.map((x) => groups.map((_g, gi) => valueAt(x, m, gi, null)));
  }
  // A rate's intervals and its rows per mark (Other has none: a rate does not add up).
  const serMeas = series.map((_s, i) => (lg.length ? (sLegend[i] >= 0 ? meas : undefined) : ms[i]));
  let ciOut: ChartData['ci'];
  let low: boolean[][] | undefined;
  let counts: number[][] | undefined;
  let minN = 0;
  const firstCi = serMeas.find((x) => x?.ci)?.ci;
  if (firstCi) {
    const lo: number[][] = [];
    const hi: number[][] = [];
    low = [];
    counts = [];
    minN = firstCi.minN;
    series.forEach((_s, si) => {
      const mm = serMeas[si];
      const l = lg.length ? sLegend[si] : null;
      const rl: number[] = [];
      const rh: number[] = [];
      const rw: boolean[] = [];
      const rn: number[] = [];
      groups.forEach((_g, gi) => {
        const a = gCell[gi];
        let v: CiValue | null = null;
        if (mm?.ci && a >= 0) v = l === null ? (L === 1 ? ciValue(mm, m, a, ctx) : ciValue(mm, combine(m, accs, legendCells(a)), 0, ctx)) : ciValue(mm, m, a + A * l, ctx);
        rl.push(v ? v.lo : NaN);
        rh.push(v ? v.hi : NaN);
        rw.push(!!v?.low);
        rn.push(v ? v.n : NaN);
      });
      lo.push(rl);
      hi.push(rh);
      low!.push(rw);
      counts!.push(rn);
    });
    ciOut = { method: firstCi.method, level: firstCi.level, lo, hi };
  }
  let outKind = chartKind;
  // 100 %: each bar's parts as shares of the bar.
  if (tile.opts?.stack === 'percent' && (chartKind === 'stacked' || kind === 'column' || kind === 'area')) {
    ciOut = undefined;
    for (let g = 0; g < groups.length; g++) {
      let s = 0;
      for (const row of values) if (Number.isFinite(row[g])) s += row[g];
      for (const row of values) row[g] = s > 0 ? row[g] / s : NaN;
    }
  }
  // A highlight: the selected part of each mark solid, the rest faint (one series only).
  if (hl && series.length === 1 && (chartKind === 'bar' || chartKind === 'stacked' || chartKind === 'histogram' || chartKind === 'line' || chartKind === 'area')) {
    const sel = groups.map((_g, gi) => valueAt(meas, hl, gi, null));
    // The marks are now the selection and the whole: their intervals are not drawn.
    ciOut = undefined;
    low = undefined;
    counts = undefined;
    if (chartKind === 'line' || chartKind === 'area') {
      series = [{ key: 'other', label: '@all' }, { ...series[0], key: 'hl', label: 'dash.hl.selected' }];
      values = [values[0], sel];
    } else if (meas.additive) {
      series = [{ ...series[0], key: 'hl', label: 'dash.hl.selected' }, { key: 'other', label: 'dash.hl.rest' }];
      values = [sel, values[0].map((v, i) => v - (Number.isFinite(sel[i]) ? sel[i] : 0))];
      if (chartKind === 'bar') outKind = 'stacked';
    } else {
      series = [{ ...series[0], key: 'hl', label: 'dash.hl.selected' }, { key: 'other', label: '@all' }];
      values = [sel, values[0]];
    }
    sLegend = [-1, -1];
  }
  const fmt: ValueFormat = tile.opts?.stack === 'percent' ? 'pct' : meas.format;
  const chart: ChartData = { kind: outKind, groups, series, values, format: fmt, valueLabel: meas.name, rows: m.rows };
  // Stacked marks have no interval of their own to draw; the tooltip still says the rows.
  if (ciOut && outKind !== 'stacked' && !(kind === 'column' && tile.opts?.stack && tile.opts.stack !== 'none')) chart.ci = ciOut;
  if (counts) chart.counts = counts;
  if (low && minN > 0) {
    chart.low = low;
    chart.minN = minN;
  }
  const d0 = ax[0];
  if ((chartKind === 'line' || chartKind === 'area' || chartKind === 'histogram') && d0 && d0.dim.k === 'bin') chart.axis = { lo: d0.dim.lo, hi: d0.dim.lo + d0.dim.step * d0.dim.count, label: d0.field.name, time: !!d0.field.time };
  return { kind: 'chart', chart, marks: { gCell, sLegend } };
}
