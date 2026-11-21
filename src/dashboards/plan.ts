/**
 * From a dashboard and what the viewer is doing with it (the page shown, a
 * cross-filter selection, drill states, a drill-through) to the queries each
 * tile needs, and back from their numbers to each measure's value. Pure: no
 * DOM, no store - the client (`client.ts`) calls it, the tests drive it.
 *
 * Filters stack the way BI dashboards stack them, each a list of clauses
 * ANDed: the dashboard's (and its all-pages slicers), the page's (and its
 * slicers), a drill-through's, the tile's own, a drill-down's path, then a
 * selection on another tile of the page (cross-filter) and the link to the 3D
 * view (its scope, the selected volume). A tile set to highlight rather than
 * filter gets a second query with the selection, drawn over the first.
 */

import type { AggScope } from '../charts/aggregate';
import type { ValueFormat } from '../charts/types';
import { ExprError, bindPredicate, findColumn, parse, type Ast, type RNode } from '../versus/expr';
import type { Volume } from '../volumes/volume';
import { dimLabel, dimOf, type Catalog, type FieldInfo } from './fields';
import type { AggKind, Dashboard, FieldRef, FilterDef, Interact, MeasureDef, Page, Tile, TileKind, ValueRef } from './model';
import { MAX_CELLS, MAX_HIST, cellsOf, histQuantile, type AccSpec, type Clause, type DimSpec, type Merged, type QuerySpec } from './query';

// ---------------------------------------------------------------------------
// What the viewer does with a dashboard (never saved with it)

/** Marks picked on one tile: cells over its dims. */
export interface Selection {
  tileId: string;
  pageId: string;
  dims: DimSpec[];
  fields: FieldRef[];
  cells: number[];
  /** Per cell, the label of each dim (for the 3D view's filters, the chips). */
  labels: string[][];
}

export interface DrillState {
  /** The hierarchy level shown (0 the top). */
  level: number;
  /** Labels of the marks drilled into, one per level above. */
  path: string[];
  /** Every level down to `level` nested (Power BI's "expand"), rather than the one level. */
  expand?: boolean;
}

export interface Interaction {
  pageId: string;
  selection: Selection | null;
  drill: Record<string, DrillState>;
  /** A drill-through: its page, the filters it carries, the page it came from. */
  through: { pageId: string; filters: FilterDef[]; from: string } | null;
}

/** What the 3D view adds to every tile. */
export interface LinkInputs {
  view: AggScope | null;
  volume: Volume | null;
  /** Minutes of data time the view shows (rates), else the data's own. */
  minutes: number;
}

export const NO_LINK: LinkInputs = { view: null, volume: null, minutes: 0 };

// ---------------------------------------------------------------------------
// Fields and filters

/** The field a tile's axis shows, a hierarchy at its drill level. */
export function axisField(cat: Catalog, ref: FieldRef | undefined, drill: DrillState | undefined): FieldInfo | null {
  if (!ref) return null;
  const f = cat.byId.get(ref);
  if (!f) return null;
  if (!f.levels) return f;
  const lvl = Math.max(0, Math.min(f.levels.length - 1, drill?.level ?? 0));
  return cat.byId.get(f.levels[lvl]) ?? null;
}

/** The fields nested on an axis: one, or with "expand" every hierarchy level down to the one shown. */
export function axisFields(cat: Catalog, ref: FieldRef | undefined, drill: DrillState | undefined): FieldInfo[] {
  const f = ref ? cat.byId.get(ref) : undefined;
  if (!f) return [];
  if (!f.levels) return [f];
  const lvl = Math.max(0, Math.min(f.levels.length - 1, drill?.level ?? 0));
  const lv = drill?.expand ? f.levels.slice(0, lvl + 1) : [f.levels[lvl]];
  return lv.map((l) => cat.byId.get(l)).filter((x): x is FieldInfo => !!x);
}

/** The drill path as filters: each level above the one shown, at the mark drilled into. */
export function drillFilters(cat: Catalog, ref: FieldRef | undefined, drill: DrillState | undefined): FilterDef[] {
  const f = ref ? cat.byId.get(ref) : undefined;
  if (!f?.levels || !drill || drill.expand) return [];
  return drill.path.slice(0, drill.level).map((label, i) => ({ id: `drill${i}`, field: f.levels![i], op: 'in' as const, values: [label] }));
}

function bindExpr(cat: Catalog, src: string): RNode | null {
  try {
    return bindPredicate(src, cat.schema);
  } catch {
    return null;
  }
}

/** A filter as a clause; null when it keeps every row (an empty slicer), `none` when it cannot be read. */
export function filterClause(cat: Catalog, f: FilterDef): Clause | null {
  if (f.op === 'expr') {
    if (!f.expr?.trim()) return null;
    const node = bindExpr(cat, f.expr);
    return node ? { k: 'expr', node } : { k: 'none' };
  }
  const fld = cat.byId.get(f.field);
  if (!fld) return { k: 'none' };
  const field = fld.levels ? cat.byId.get(fld.levels[0])! : fld;
  switch (f.op) {
    case 'in':
    case 'out': {
      if (!f.values?.length) return null;
      const labels = field.labels ?? [];
      const idx = f.values.map((v) => labels.indexOf(v)).filter((i) => i >= 0);
      if (field.bin) {
        if (!idx.length) return f.op === 'out' ? null : { k: 'none' };
        const dim = dimOf(field);
        const c: Clause = { k: 'tuples', dims: [dim], cells: idx };
        return f.op === 'out' ? { k: 'tuples', dims: [dim], cells: Array.from({ length: dim.k === 'bin' ? dim.count : 0 }, (_, i) => i).filter((i) => !idx.includes(i)) } : c;
      }
      if (field.kind !== 'cat') {
        // Numeric labels: equal values.
        const vals = f.values.map(Number).filter((v) => Number.isFinite(v));
        if (!vals.length) return { k: 'none' };
        return { k: 'expr', node: vals.slice(1).reduce<RNode>((a, v) => ({ k: 'bin', op: 'or', a, b: { k: 'bin', op: '==', a: { k: 'col', c: field.key }, b: { k: 'num', v } } }), { k: 'bin', op: '==', a: { k: 'col', c: field.key }, b: { k: 'num', v: vals[0] } }) };
      }
      return { k: 'in', key: field.key, values: idx, ...(f.op === 'out' ? { out: true } : {}) };
    }
    case 'range': {
      const lo = f.lo ?? -Infinity;
      const hi = f.hi ?? Infinity;
      if (lo === -Infinity && hi === Infinity) return null;
      return { k: 'range', key: field.key, lo, hi };
    }
    case 'search': {
      const text = f.text?.trim().toLowerCase();
      if (!text) return null;
      const labels = field.labels ?? [];
      const values: number[] = [];
      labels.forEach((l, i) => l.toLowerCase().includes(text) && values.push(i));
      return { k: 'in', key: field.key, values };
    }
    case 'relative': {
      const n = f.n ?? 0;
      if (!n) return null;
      if (f.unit === 'matches') {
        if (!cat.sessionStart) return null;
        const order = cat.sessionStart.map((s, i) => [s, i] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
        const pick = n > 0 ? order.slice(-n) : order.slice(0, -n);
        return { k: 'in', key: '@session', values: pick };
      }
      const secs = Math.abs(n) * (f.unit === 'sec' ? 1 : 60);
      const [lo, hi] = field.time === 'match' ? [0, cat.matchSpan] : [field.lo, field.hi];
      return n > 0 ? { k: 'range', key: field.key, lo: hi - secs, hi: Infinity } : { k: 'range', key: field.key, lo: -Infinity, hi: lo + secs };
    }
  }
  return null;
}

function clausesOf(cat: Catalog, fs: readonly FilterDef[] | undefined, skipSlicer?: string): Clause[] {
  const out: Clause[] = [];
  for (const f of fs ?? []) {
    if (skipSlicer && f.slicer === skipSlicer) continue;
    const c = filterClause(cat, f);
    if (c) out.push(c);
  }
  return out;
}

/** What a selection elsewhere does to a tile, where the tile does not say. */
export function defaultInteract(kind: TileKind): Interact {
  return kind === 'bar' || kind === 'column' || kind === 'line' || kind === 'area' || kind === 'histogram' ? 'highlight' : 'filter';
}

export function interactOf(t: Tile): Interact {
  return t.opts?.interact ?? defaultInteract(t.kind);
}

/** The clause a selection makes on the tiles it cross-filters. */
export function selectionClause(sel: Selection): Clause {
  return { k: 'tuples', dims: sel.dims, cells: sel.cells.slice().sort((a, b) => a - b) };
}

export interface ClauseSets {
  /** Every filter that applies to the tile. */
  main: Clause[];
  /** The same without the selection (for a highlight's whole). */
  noSelection: Clause[];
  /** Only what the user cannot switch off on the dashboard: the link to the view and the tile's own filters (a KPI's baseline). */
  baseline: Clause[];
  /** `main` without the tile's own filters (a KPI's comparison set adds its own). */
  noTile: Clause[];
  /** Whether the selection highlights rather than filters this tile. */
  highlight: Clause | null;
}

export function linkClauses(dash: Dashboard, link: LinkInputs): Clause[] {
  const out: Clause[] = [];
  if (dash.link.followView && link.view) out.push({ k: 'view', scope: link.view });
  if (dash.link.volume && link.volume) out.push({ k: 'volume', volume: link.volume });
  return out;
}

/** The clauses of a tile, layer by layer. */
export function tileClauses(cat: Catalog, dash: Dashboard, page: Page, tile: Tile, inter: Interaction, link: LinkInputs, skipSlicer?: string): ClauseSets {
  const lk = linkClauses(dash, link);
  const outer = [...clausesOf(cat, dash.filters, skipSlicer), ...clausesOf(cat, page.filters, skipSlicer)];
  if (inter.through && inter.through.pageId === page.id) outer.push(...clausesOf(cat, inter.through.filters));
  const own = clausesOf(cat, tile.filters);
  const drill = clausesOf(cat, drillFilters(cat, tile.axis?.[0], inter.drill[tile.id]));
  const base = [...lk, ...outer, ...drill];
  let selC: Clause | null = null;
  let hl: Clause | null = null;
  const sel = inter.selection;
  if (sel && sel.pageId === page.id && sel.tileId !== tile.id && sel.cells.length) {
    const mode = interactOf(tile);
    if (mode === 'filter') selC = selectionClause(sel);
    else if (mode === 'highlight') hl = selectionClause(sel);
  }
  const noSelection = [...base, ...own];
  return {
    main: selC ? [...noSelection, selC] : noSelection,
    noSelection,
    baseline: [...lk, ...own],
    noTile: selC ? [...base, selC] : base,
    highlight: hl,
  };
}

// ---------------------------------------------------------------------------
// Measures

/** What a measure's value is worked out with, beside its accumulators. */
export interface MeasureCtx {
  /** Per acc index, its sum over every cell (shares). */
  totals: number[];
  minutes: number;
}

export interface MeasureOut {
  name: string;
  format: ValueFormat;
  /** Sums over cells mean something (counts, sums): "Other" and highlights can add up. */
  additive: boolean;
  value: (m: Merged, cell: number, ctx: MeasureCtx) => number;
  error?: string;
}

/** Collects a query's accumulators, each once. */
export class AccSet {
  accs: AccSpec[] = [];
  private keys = new Map<string, number>();
  add(a: AccSpec): number {
    const k = JSON.stringify(a, (_k, v) => (ArrayBuffer.isView(v) ? Array.from(v as Uint8Array) : v));
    let i = this.keys.get(k);
    if (i === undefined) {
      i = this.accs.length;
      this.accs.push(a);
      this.keys.set(k, i);
    }
    return i;
  }
}

const and = (a: RNode | null, b: RNode | null): RNode | null => (a && b ? { k: 'bin', op: 'and', a, b } : (a ?? b));

/** The measure a value slot holds: a saved one by id, or the quick one written there. */
export function measureOf(dash: Dashboard, v: ValueRef): MeasureDef | null {
  if ('m' in v) return dash.measures?.find((m) => m.id === v.m) ?? null;
  return { id: '', name: v.name ?? '', agg: v.agg, field: v.field, p: v.p, where: v.where };
}

const AGG_WORD: Record<AggKind, string> = {
  count: 'Count',
  distinct: 'Distinct',
  sum: 'Sum of',
  mean: 'Mean of',
  median: 'Median of',
  pct: 'P',
  min: 'Min of',
  max: 'Max of',
  share: 'Share',
  perMin: 'Per minute',
  rate: 'Rate',
  ratio: 'Ratio',
  calc: 'Calculated',
};

/** A quick measure's name, Power BI's way: "Mean of speed", "Count", "P90 of alt". */
export function measureName(m: MeasureDef, cat: Catalog | null): string {
  if (m.name) return m.name;
  const f = m.field ? (cat?.byId.get(m.field)?.name ?? m.field.replace(/^[a-z]:/, '')) : '';
  if (m.agg === 'pct') return `P${m.p ?? 90}${f ? ` of ${f}` : ''}`;
  if (m.agg === 'count' || m.agg === 'share' || m.agg === 'perMin' || m.agg === 'rate') return m.where ? `${AGG_WORD[m.agg]} (${m.where})` : AGG_WORD[m.agg];
  return f ? `${AGG_WORD[m.agg]} ${f}` : AGG_WORD[m.agg];
}

/** Fine bins for a percentile accumulator, fewer the more cells share them. */
export function histBins(cells: number): number {
  return Math.max(8, Math.min(256, Math.floor(MAX_HIST / Math.max(1, cells))));
}

/** A measure as accumulators and the function of them its value is. */
export function compileMeasure(cat: Catalog, dash: Dashboard, m: MeasureDef, set: AccSet, cells: number, depth = 0): MeasureOut {
  const name = measureName(m, cat);
  const fail = (error: string): MeasureOut => ({ name, format: 'dec', additive: false, value: () => NaN, error });
  if (depth > 8) return fail('dash.err.measureLoop');
  const where = m.where?.trim() ? bindExpr(cat, m.where) : null;
  if (m.where?.trim() && !where) return fail('dash.err.where');
  const field = m.field ? cat.byId.get(m.field) : undefined;
  const key = field ? (field.levels ? cat.byId.get(field.levels[0])!.key : field.key) : undefined;
  const isTime = !!field?.time;
  const needNum = () => (field && field.kind === 'num' && !field.bin ? null : 'dash.err.numeric');
  switch (m.agg) {
    case 'count': {
      const i = set.add({ k: 'count', where });
      return { name, format: m.format ?? 'int', additive: true, value: (r, c) => r.accs[i][c] };
    }
    case 'share': {
      const i = set.add({ k: 'count', where });
      return { name, format: m.format ?? 'pct', additive: true, value: (r, c, x) => (x.totals[i] > 0 ? r.accs[i][c] / x.totals[i] : NaN) };
    }
    case 'perMin': {
      const i = set.add({ k: 'count', where });
      return { name, format: m.format ?? 'rate', additive: true, value: (r, c, x) => (x.minutes > 0 ? r.accs[i][c] / x.minutes : NaN) };
    }
    case 'rate': {
      if (!where) return fail('dash.err.rateWhere');
      const i = set.add({ k: 'count', where });
      const all = set.add({ k: 'count' });
      return { name, format: m.format ?? 'pct', additive: false, value: (r, c) => (r.accs[all][c] > 0 ? r.accs[i][c] / r.accs[all][c] : NaN) };
    }
    case 'distinct': {
      if (!key) return fail('dash.err.field');
      const i = set.add({ k: 'distinct', key, where });
      return { name, format: m.format ?? 'int', additive: false, value: (r, c) => r.accs[i][c] };
    }
    case 'sum':
    case 'mean': {
      if (!key) return fail('dash.err.field');
      const e = needNum();
      if (e) return fail(e);
      const i = set.add({ k: 'sum', key, where });
      const fmt: ValueFormat = m.format ?? (isTime ? 'seconds' : 'dec');
      return m.agg === 'sum'
        ? { name, format: fmt, additive: true, value: (r, c) => r.accs[i][2 * c] }
        : { name, format: fmt, additive: false, value: (r, c) => (r.accs[i][2 * c + 1] > 0 ? r.accs[i][2 * c] / r.accs[i][2 * c + 1] : NaN) };
    }
    case 'min':
    case 'max': {
      if (!key) return fail('dash.err.field');
      const e = needNum();
      if (e) return fail(e);
      const i = set.add({ k: m.agg, key, where });
      return { name, format: m.format ?? (isTime ? 'seconds' : 'dec'), additive: false, value: (r, c) => (Number.isFinite(r.accs[i][c]) ? r.accs[i][c] : NaN) };
    }
    case 'median':
    case 'pct': {
      if (!key || !field) return fail('dash.err.field');
      const e = needNum();
      if (e) return fail(e);
      const bins = histBins(cells);
      const lo = Number.isFinite(field.lo) ? field.lo : 0;
      const hi = Number.isFinite(field.hi) && field.hi > lo ? field.hi : lo + 1;
      const i = set.add({ k: 'hist', key, lo, hi, bins, where });
      const q = m.agg === 'median' ? 0.5 : Math.max(1, Math.min(99, m.p ?? 90)) / 100;
      return { name, format: m.format ?? (isTime ? 'seconds' : 'dec'), additive: false, value: (r, c) => histQuantile(r.accs[i], c * bins, bins, lo, hi, q) };
    }
    case 'ratio': {
      const a = dash.measures?.find((x) => x.id === m.num);
      const b = dash.measures?.find((x) => x.id === m.den);
      if (!a || !b) return fail('dash.err.ratio');
      const fa = compileMeasure(cat, dash, a, set, cells, depth + 1);
      const fb = compileMeasure(cat, dash, b, set, cells, depth + 1);
      if (fa.error || fb.error) return fail(fa.error ?? fb.error!);
      return { name, format: m.format ?? 'ratio', additive: false, value: (r, c, x) => fa.value(r, c, x) / fb.value(r, c, x) };
    }
    case 'calc': {
      try {
        const src = m.expr ?? '';
        const fn = calcNode(cat, dash, src, parse(src), set, cells, depth + 1, null);
        return { name, format: m.format ?? 'ratio', additive: false, value: fn };
      } catch (e) {
        return fail(e instanceof ExprError ? `versus.err.${e.key}` : 'dash.err.calc');
      }
    }
  }
}

type VFn = (r: Merged, c: number, x: MeasureCtx) => number;

/**
 * A calculated measure: the Compare language's arithmetic over aggregates
 * (`countIf(event == "kill") / count()`, `avg(speed) where alt > 1000`) and
 * over the dashboard's measures by name (`` `Kills` / `Deaths` ``).
 */
function calcNode(cat: Catalog, dash: Dashboard, src: string, a: Ast, set: AccSet, cells: number, depth: number, where: RNode | null): VFn {
  const rec = (x: Ast, w = where) => calcNode(cat, dash, src, x, set, cells, depth, w);
  const text = (x: Ast) => src.slice(x.s, x.e);
  const colKey = (x: Ast): string => {
    const name = x.k === 'id' ? x.name : x.k === 'str' ? x.v : text(x);
    const c = findColumn(cat.schema, name);
    if (!c) throw new ExprError('unknownColumn', { name }, x.s);
    return c.key;
  };
  const pred = (x: Ast): RNode => {
    const n = bindPredicate(text(x), cat.schema);
    if (!n) throw new ExprError('notAValue', { column: '' }, x.s);
    return n;
  };
  const agg = (spec: AccSpec): number => set.add({ ...spec, where: and(spec.where ?? null, where) } as AccSpec);
  switch (a.k) {
    case 'num': {
      const v = a.v;
      return () => v;
    }
    case 'str':
      throw new ExprError('notAValue', { column: '' }, a.s);
    case 'list':
      throw new ExprError('notAValue', { column: '' }, a.s);
    case 'id': {
      const m = dash.measures?.find((x) => x.name.toLowerCase() === a.name.toLowerCase());
      if (!m) throw new ExprError('unknownColumn', { name: a.name }, a.s);
      const out = compileMeasure(cat, dash, where ? { ...m, where: m.where ? `(${m.where})` : undefined } : m, set, cells, depth);
      if (out.error) throw new ExprError('unknownColumn', { name: a.name }, a.s);
      return out.value;
    }
    case 'where':
      return rec(a.a, and(where, pred(a.cond)));
    case 'un': {
      const f = rec(a.a);
      return a.op === '-' ? (r, c, x) => -f(r, c, x) : (r, c, x) => (f(r, c, x) ? 0 : 1);
    }
    case 'bin': {
      const f = rec(a.a);
      const g = rec(a.b);
      switch (a.op) {
        case '+': return (r, c, x) => f(r, c, x) + g(r, c, x);
        case '-': return (r, c, x) => f(r, c, x) - g(r, c, x);
        case '*': return (r, c, x) => f(r, c, x) * g(r, c, x);
        case '/': return (r, c, x) => f(r, c, x) / g(r, c, x);
        case '%': return (r, c, x) => f(r, c, x) % g(r, c, x);
        case '<': return (r, c, x) => +(f(r, c, x) < g(r, c, x));
        case '<=': return (r, c, x) => +(f(r, c, x) <= g(r, c, x));
        case '>': return (r, c, x) => +(f(r, c, x) > g(r, c, x));
        case '>=': return (r, c, x) => +(f(r, c, x) >= g(r, c, x));
        case '==': case '=': return (r, c, x) => +(f(r, c, x) === g(r, c, x));
        case '!=': case '<>': return (r, c, x) => +(f(r, c, x) !== g(r, c, x));
        case 'and': case '&&': return (r, c, x) => +(!!f(r, c, x) && !!g(r, c, x));
        case 'or': case '||': return (r, c, x) => +(!!f(r, c, x) || !!g(r, c, x));
      }
      throw new ExprError('unknownFunction', { fn: a.op }, a.s);
    }
    case 'call': {
      const fn = a.fn.toLowerCase();
      const args = a.args;
      const histOf = (x: Ast, q: number): VFn => {
        const key = colKey(x);
        const f = cat.fields.find((ff) => ff.key === key);
        const lo = f && Number.isFinite(f.lo) ? f.lo : 0;
        const hi = f && Number.isFinite(f.hi) && f.hi > lo ? f.hi : lo + 1;
        const bins = histBins(cells);
        const i = agg({ k: 'hist', key, lo, hi, bins });
        return (r, c) => histQuantile(r.accs[i], c * bins, bins, lo, hi, q);
      };
      const countWith = (w: RNode | null): VFn => {
        const i = agg({ k: 'count', where: w });
        return (r, c) => r.accs[i][c];
      };
      const evMask = (ids: number[]): RNode | null => {
        const ev = cat.schema.event;
        if (!ev) return { k: 'num', v: 0 };
        const labels = cat.schema.cols.find((c) => c.key === ev)?.labels ?? [];
        const mask = new Uint8Array(labels.length);
        for (const i of ids) mask[i] = 1;
        return { k: 'mask', a: { k: 'col', c: ev }, mask };
      };
      switch (fn) {
        case 'count':
          return countWith(args[0] ? pred(args[0]) : null);
        case 'countif':
          return countWith(pred(args[0]));
        case 'sum':
        case 'sumif': {
          const i = agg({ k: 'sum', key: colKey(args[0]), where: fn === 'sumif' ? pred(args[1]) : null });
          return (r, c) => r.accs[i][2 * c];
        }
        case 'avg':
        case 'mean':
        case 'avgif': {
          const i = agg({ k: 'sum', key: colKey(args[0]), where: fn === 'avgif' ? pred(args[1]) : null });
          return (r, c) => r.accs[i][2 * c] / r.accs[i][2 * c + 1];
        }
        case 'min':
        case 'max': {
          if (args.length >= 2) {
            const fs = args.map((x) => rec(x));
            return fn === 'min' ? (r, c, x) => Math.min(...fs.map((f) => f(r, c, x))) : (r, c, x) => Math.max(...fs.map((f) => f(r, c, x)));
          }
          const i = agg({ k: fn, key: colKey(args[0]) });
          return (r, c) => (Number.isFinite(r.accs[i][c]) ? r.accs[i][c] : NaN);
        }
        case 'median':
          return histOf(args[0], 0.5);
        case 'percentile': {
          const p = args[1]?.k === 'num' ? args[1].v : 90;
          return histOf(args[0], Math.max(0, Math.min(100, p)) / 100);
        }
        case 'distinct': {
          const i = agg({ k: 'distinct', key: colKey(args[0]) });
          return (r, c) => r.accs[i][c];
        }
        case 'players': {
          const i = agg({ k: 'distinct', key: '@person' });
          return (r, c) => r.accs[i][c];
        }
        case 'matches': {
          const i = agg({ k: 'distinct', key: '@session' });
          return (r, c) => r.accs[i][c];
        }
        case 'kills':
          return countWith(evMask(cat.kill));
        case 'deaths':
          return countWith(evMask(cat.death));
        case 'winrate': {
          if (!cat.schema.won) throw new ExprError('noOutcome', {}, a.s);
          const i = agg({ k: 'sum', key: cat.schema.won });
          return (r, c) => r.accs[i][2 * c] / r.accs[i][2 * c + 1];
        }
        case 'perminute': {
          const f = rec(args[0]);
          return (r, c, x) => f(r, c, x) / x.minutes;
        }
        case 'ofall': {
          const f = rec(args[0]);
          return (r, c, x) => {
            const all = r.cells;
            let tot = 0;
            for (let k = 0; k < all; k++) {
              const v = f(r, k, x);
              if (Number.isFinite(v)) tot += v;
            }
            return f(r, c, x) / tot;
          };
        }
        case 'abs': case 'sqrt': case 'log': case 'exp': case 'round': case 'floor': case 'ceil': {
          const f = rec(args[0]);
          const op = Math[fn as 'abs'];
          return (r, c, x) => op(f(r, c, x));
        }
        case 'if': {
          const [p, q, z] = args.map((x) => rec(x));
          return (r, c, x) => (p(r, c, x) ? q(r, c, x) : z(r, c, x));
        }
        case 'clamp': {
          const [v, lo, hi] = args.map((x) => rec(x));
          return (r, c, x) => Math.min(hi(r, c, x), Math.max(lo(r, c, x), v(r, c, x)));
        }
      }
      throw new ExprError('unknownFunction', { fn: a.fn }, a.s);
    }
  }
}

// ---------------------------------------------------------------------------
// Tiles to queries

export interface PlannedDim {
  field: FieldInfo;
  dim: DimSpec;
}

export interface TilePlan {
  tileId: string;
  kind: TileKind;
  queries: QuerySpec[];
  /** The main query's dims: the axis (fields nested), then the legend. */
  dims: PlannedDim[];
  /** How many of `dims` are the axis (the rest is the legend). */
  axisDims: number;
  measures: MeasureOut[];
  /** KPI: the sparkline's measure, over its own accumulators. */
  spark?: MeasureOut;
  error?: string;
  minutes: number;
  /** The tile's highlight query is set. */
  highlight: boolean;
}

const quick = (agg: AggKind, field?: FieldRef): ValueRef => ({ agg, field });

/** The value slots of a tile with defaults: a count where nothing was dropped. */
function valuesOf(t: Tile): ValueRef[] {
  return t.values && t.values.length ? t.values : [quick('count')];
}

function dimsFor(_cat: Catalog, fields: FieldInfo[], bins: number): PlannedDim[] {
  return fields.map((field) => ({ field, dim: dimOf(field, bins) }));
}

/** Time along x: into each match where there are matches, else the data's clock. */
function timeField(cat: Catalog, clock: 'match' | 'real' | undefined): FieldInfo | null {
  const want = clock ?? (cat.sessionStart && cat.sessionStart.length > 1 ? 'match' : 'real');
  return cat.byId.get(want === 'match' ? 'mtime' : 'time') ?? cat.byId.get('time') ?? null;
}

/** Every query one tile needs, and how its numbers are read. */
export function planTile(cat: Catalog, dash: Dashboard, page: Page, tile: Tile, inter: Interaction, link: LinkInputs): TilePlan | null {
  const kind = tile.kind;
  if (kind === 'title' || kind === 'text' || kind === 'image') return null;
  const drill = inter.drill[tile.id];
  const minutes = link.minutes > 0 ? link.minutes : dataMinutes(cat);
  const plan: TilePlan = { tileId: tile.id, kind, queries: [], dims: [], axisDims: 0, measures: [], minutes, highlight: false };
  const cs = tileClauses(cat, dash, page, tile, inter, link, kind === 'slicer' ? tile.id : undefined);
  const set = new AccSet();
  const bins = tile.opts?.bins ?? 24;
  const fail = (error: string) => ({ ...plan, error });
  let dims: PlannedDim[] = [];
  const axis = axisFields(cat, tile.axis?.[0], drill);
  const legend = axisField(cat, tile.legend, undefined);
  switch (kind) {
    case 'slicer': {
      const f = axisField(cat, tile.axis?.[0], undefined);
      if (!f) return fail('dash.err.noField');
      const mode = tile.opts?.slicer ?? (f.kind === 'cat' ? 'dropdown' : 'range');
      if (mode === 'range' || mode === 'date' || mode === 'relative' || f.kind !== 'cat') {
        plan.dims = [{ field: f, dim: dimOf(f) }];
        plan.axisDims = 1;
        return plan;
      }
      dims = dimsFor(cat, [f], bins);
      break;
    }
    case 'kpi':
      break;
    case 'histogram': {
      const f = axisField(cat, tile.axis?.[0], undefined);
      if (!f || f.kind !== 'num') return fail('dash.err.numericAxis');
      dims = [{ field: f, dim: dimOf(f, bins) }];
      if (legend) dims.push(...dimsFor(cat, [legend], bins));
      break;
    }
    case 'line':
    case 'area':
    case 'bands': {
      const f = tile.axis?.[0] ? axisField(cat, tile.axis[0], drill) : timeField(cat, tile.opts?.clock);
      if (!f) return fail('dash.err.noTime');
      dims = [{ field: f, dim: dimOf(f, f.kind === 'num' ? Math.max(8, bins) : bins) }];
      if (legend && kind !== 'bands') dims.push(...dimsFor(cat, [legend], bins));
      break;
    }
    case 'density': {
      const fx = axisField(cat, tile.axis?.[0] ?? 'x', undefined);
      const fy = axisField(cat, tile.axis?.[1] ?? 'z', undefined);
      if (!fx || !fy || fx.kind !== 'num' || fy.kind !== 'num') return fail('dash.err.numericAxis');
      dims = [{ field: fx, dim: dimOf(fx, Math.min(64, bins * 2)) }, { field: fy, dim: dimOf(fy, Math.min(64, bins * 2)) }];
      break;
    }
    case 'minimap': {
      const fx = cat.byId.get('x');
      const fz = cat.byId.get('z');
      if (!fx || !fz) return fail('dash.err.noPosition');
      const span = Math.max(fx.hi - fx.lo, fz.hi - fz.lo) || 1;
      const n = 96;
      const step = span / n;
      dims = [
        { field: fx, dim: { k: 'bin', key: fx.key, lo: (fx.lo + fx.hi) / 2 - span / 2, step, count: n } },
        { field: fz, dim: { k: 'bin', key: fz.key, lo: (fz.lo + fz.hi) / 2 - span / 2, step, count: n } },
      ];
      break;
    }
    case 'table':
    case 'pivot': {
      const rows = (tile.axis ?? []).slice(0, 3).flatMap((ref, i) => (i === 0 ? axis : [axisField(cat, ref, undefined)].filter((x): x is FieldInfo => !!x)));
      dims = dimsFor(cat, rows, bins);
      if (kind === 'pivot' && legend) dims.push(...dimsFor(cat, [legend], bins));
      if (!dims.length) return fail('dash.err.noAxis');
      break;
    }
    case 'box': {
      dims = dimsFor(cat, axis, bins);
      break;
    }
    case 'scatter': {
      if (!axis.length) return fail('dash.err.noAxis');
      dims = dimsFor(cat, axis, bins);
      break;
    }
    default: {
      // bar, column, pie, treemap, matrix, topn
      if (!axis.length) return fail('dash.err.noAxis');
      dims = dimsFor(cat, axis, bins);
      if (legend && kind !== 'pie' && kind !== 'treemap' && kind !== 'topn') dims.push(...dimsFor(cat, [legend], bins));
      if (kind === 'matrix' && !legend) return fail('dash.err.noLegend');
    }
  }
  const hasLegend = !!legend && dims.length > 0 && dims[dims.length - 1].field === legend && kind !== 'table' && kind !== 'density' && kind !== 'minimap';
  plan.axisDims = kind === 'density' || kind === 'minimap' || kind === 'table' ? dims.length : hasLegend ? dims.length - 1 : dims.length;
  plan.dims = dims;
  const dimSpecs = dims.map((d) => d.dim);
  const cells = cellsOf(dimSpecs);
  if (cells > MAX_CELLS) return fail('dash.err.tooMany');
  // Values: box and bands read one numeric field's distribution.
  if (kind === 'box' || kind === 'bands') {
    const v = valuesOf(tile)[0];
    const m = measureOf(dash, v);
    const f = m?.field ? cat.byId.get(m.field) : null;
    if (!f || f.kind !== 'num') return fail('dash.err.numericValue');
    const b = histBins(cells);
    set.add({ k: 'hist', key: f.key, lo: f.lo, hi: f.hi > f.lo ? f.hi : f.lo + 1, bins: b, where: m?.where ? bindExpr(cat, m.where) : null });
    set.add({ k: 'min', key: f.key });
    set.add({ k: 'max', key: f.key });
    set.add({ k: 'count' });
    plan.measures = [{ name: m ? measureName({ ...m, agg: 'median' }, cat).replace(/^Median of /, '') : f.name, format: f.time ? 'seconds' : 'dec', additive: false, value: () => NaN }];
  } else {
    const vals = kind === 'slicer' || kind === 'minimap' || kind === 'density' ? [quick('count')] : kind === 'scatter' ? [...valuesOf(tile).slice(0, 2), ...(tile.size ? [tile.size] : [])] : valuesOf(tile);
    for (const v of vals) {
      const m = measureOf(dash, v);
      plan.measures.push(m ? compileMeasure(cat, dash, m, set, cells) : { name: '?', format: 'dec', additive: false, value: () => NaN, error: 'dash.err.measure' });
    }
    // A count beside: which cells have rows at all (tables list those).
    set.add({ k: 'count' });
  }
  const err = plan.measures.find((m) => m.error)?.error;
  if (err) plan.error = err;
  const q = (id: string, clauses: Clause[], d = dimSpecs, accs = set.accs): QuerySpec => ({ id: `${tile.id}:${id}`, dims: d, accs, clauses });
  plan.queries.push(q('main', cs.main));
  if (cs.highlight && kind !== 'slicer') {
    plan.queries.push(q('hl', [...cs.main, cs.highlight]));
    plan.highlight = true;
  }
  if (kind === 'kpi') {
    const mode = tile.opts?.compare ?? 'baseline';
    if (mode === 'baseline') plan.queries.push(q('cmp', cs.baseline));
    else if (mode === 'set') plan.queries.push(q('cmp', [...cs.noTile, ...clausesOf(cat, tile.opts?.compareFilters)]));
    if (tile.opts?.spark !== false) {
      const tf = timeField(cat, tile.opts?.clock);
      if (tf) {
        const d = dimOf(tf, 24);
        const sparkSet = new AccSet();
        const m = measureOf(dash, valuesOf(tile)[0]);
        const out = m ? compileMeasure(cat, dash, m, sparkSet, 24) : null;
        sparkSet.add({ k: 'count' });
        if (out && !out.error) {
          plan.queries.push(q('spark', cs.main, [d], sparkSet.accs));
          plan.spark = out;
        }
      }
    }
  }
  return plan;
}

/** Minutes the whole data spans: summed over the matches, else its clock's span. */
export function dataMinutes(cat: Catalog): number {
  const [a, b] = cat.timeRange;
  if (cat.sessionStart && cat.sessionStart.length > 1) return (cat.matchSpan * cat.sessionStart.length) / 60;
  return Math.max(0, b - a) / 60;
}

/** Each acc's sum over the cells (for shares). */
export function totalsOf(m: Merged): number[] {
  return m.accs.map((a) => {
    let s = 0;
    for (let i = 0; i < m.cells && i < a.length; i++) s += a[i];
    return s;
  });
}

/** The labels of a cell over planned dims. */
export function cellLabels(cat: Catalog, dims: readonly PlannedDim[], cell: number): string[] {
  const out: string[] = [];
  let c = cell;
  for (const d of dims) {
    const size = d.dim.k === 'cat' ? d.dim.size : d.dim.count;
    out.push(dimLabel(d.field, d.dim, c % size, cat.epochMs));
    c = Math.floor(c / size);
  }
  return out;
}

/** A cell's index per dim. */
export function cellParts(dims: readonly { dim: DimSpec }[] | readonly DimSpec[], cell: number): number[] {
  const out: number[] = [];
  let c = cell;
  for (const x of dims) {
    const d = 'dim' in x ? x.dim : x;
    const size = d.k === 'cat' ? d.size : d.count;
    out.push(c % size);
    c = Math.floor(c / size);
  }
  return out;
}

/** The cell of per-dim indices. */
export function cellOfParts(dims: readonly { dim: DimSpec }[] | readonly DimSpec[], parts: readonly number[]): number {
  let c = 0;
  let mult = 1;
  dims.forEach((x, i) => {
    const d = 'dim' in x ? x.dim : x;
    const size = d.k === 'cat' ? d.size : d.count;
    c += (parts[i] ?? 0) * mult;
    mult *= size;
  });
  return c;
}

// ---------------------------------------------------------------------------
// Selections and drills: what a click does

/** A click on cells of a tile: the new selection (Ctrl adds or takes away one; a plain click on the only one clears). */
export function toggleSelection(cur: Selection | null, next: Selection, additive: boolean): Selection | null {
  if (!cur || cur.tileId !== next.tileId || JSON.stringify(cur.dims) !== JSON.stringify(next.dims)) return next;
  const has = next.cells.every((c) => cur.cells.includes(c));
  if (!additive) return has && cur.cells.length === next.cells.length ? null : next;
  if (has) {
    const cells: number[] = [];
    const labels: string[][] = [];
    cur.cells.forEach((c, i) => {
      if (!next.cells.includes(c)) {
        cells.push(c);
        labels.push(cur.labels[i]);
      }
    });
    return cells.length ? { ...cur, cells, labels } : null;
  }
  return { ...cur, cells: [...cur.cells, ...next.cells], labels: [...cur.labels, ...next.labels] };
}

/** One level down into a mark (`label` of the level shown), or every mark ("next level", no label). */
export function drillDown(cat: Catalog, ref: FieldRef | undefined, st: DrillState | undefined, label: string | null): DrillState | null {
  const f = ref ? cat.byId.get(ref) : undefined;
  if (!f?.levels) return null;
  const cur = st ?? { level: 0, path: [] };
  if (cur.level >= f.levels.length - 1) return null;
  if (label === null) return { level: cur.level + 1, path: cur.path.slice(0, cur.level), expand: cur.expand };
  const path = cur.path.slice(0, cur.level);
  path[cur.level] = label;
  return { level: cur.level + 1, path, expand: false };
}

export function drillUp(st: DrillState | undefined): DrillState | null {
  if (!st || st.level <= 0) return null;
  return { level: st.level - 1, path: st.path.slice(0, st.level - 1), expand: st.expand };
}

/** "Expand all down one level": the next level nested under the one shown. */
export function expandDown(cat: Catalog, ref: FieldRef | undefined, st: DrillState | undefined): DrillState | null {
  const f = ref ? cat.byId.get(ref) : undefined;
  if (!f?.levels) return null;
  const cur = st ?? { level: 0, path: [] };
  if (cur.level >= f.levels.length - 1) return null;
  return { level: cur.level + 1, path: [], expand: true };
}

/** The pages a selection's fields can drill through to (they list one of its fields). */
export function drillTargets(pages: readonly Page[], fields: readonly FieldRef[], from: string): Page[] {
  return pages.filter((p) => p.id !== from && p.drillThrough?.some((f) => fields.includes(f)));
}

/** The filters a drill-through carries: each picked mark's value of each field the target page takes. */
export function throughFilters(target: Page, sel: Selection, cat: Catalog): FilterDef[] {
  const out: FilterDef[] = [];
  sel.fields.forEach((ref, i) => {
    const f = cat.byId.get(ref);
    const leaf = f?.levels ? null : f;
    if (!target.drillThrough?.includes(ref) && !(leaf && target.drillThrough?.includes(leaf.id))) return;
    const values = [...new Set(sel.labels.map((l) => l[i]))];
    out.push({ id: `thr${i}`, field: ref, op: 'in', values });
  });
  return out;
}
