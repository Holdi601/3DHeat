/**
 * Dashboards: what one is, as plain JSON (docs/dashboards.md).
 *
 * A dashboard is pages of tiles on a grid, the way BI dashboards are built:
 * charts, KPI cards, tables and slicers over the loaded data, with its own
 * measures, calculated columns, bins and hierarchies. It is kept as three
 * collections of entities with an id - dashboards, pages (`dashId`) and tiles
 * (`pageId`) - so the op-log sync (`state/sharedDocs.ts`) merges two people
 * editing different tiles without one overwriting the other.
 *
 * Fields are named by id (`FieldRef`): the built-in roles (`team`, `person`,
 * `session`, `time`, `mtime`, `x`, `y`, `z`), a column (`c:<name>`), a
 * calculated column (`k:<id>`), a binned field (`b:<id>`) or a hierarchy
 * (`h:<id>`). Values in filters are kept as labels, not indices, so a
 * dashboard reads the same on another dataset with the same columns.
 */

import type { ValueFormat } from '../charts/types';

export const DASH_SCHEMA = 'heat3d.dashboard/1';

export type FieldRef = string;

/** The visuals, chosen by the data's job (docs/dashboards.md, "Visuals"). */
export type TileKind =
  | 'kpi'
  | 'bar'
  | 'column'
  | 'line'
  | 'area'
  | 'pie'
  | 'treemap'
  | 'histogram'
  | 'scatter'
  | 'density'
  | 'matrix'
  | 'box'
  | 'bands'
  | 'table'
  | 'pivot'
  | 'topn'
  | 'minimap'
  | 'slicer'
  | 'title'
  | 'text'
  | 'image';

export const TILE_KINDS: readonly TileKind[] = ['kpi', 'bar', 'column', 'line', 'area', 'pie', 'treemap', 'histogram', 'scatter', 'density', 'matrix', 'box', 'bands', 'table', 'pivot', 'topn', 'minimap', 'slicer', 'title', 'text', 'image'];

/** Visuals that show data (the rest are slicers and decoration). */
export const DATA_KINDS: readonly TileKind[] = TILE_KINDS.filter((k) => k !== 'slicer' && k !== 'title' && k !== 'text' && k !== 'image');

/**
 * How a measure folds its rows: rows counted, distinct values, sum, mean,
 * median, a percentile, min, max; a share of the tile's rows, rows a minute,
 * a rate (rows where `where` holds over all rows), the ratio of two measures,
 * or a calculated measure (an expression over other measures).
 */
export type AggKind = 'count' | 'distinct' | 'sum' | 'mean' | 'median' | 'pct' | 'min' | 'max' | 'share' | 'perMin' | 'rate' | 'ratio' | 'calc';

export const AGG_KINDS: readonly AggKind[] = ['count', 'distinct', 'sum', 'mean', 'median', 'pct', 'min', 'max', 'share', 'perMin', 'rate', 'ratio', 'calc'];

/** A measure: saved on the dashboard (`Dashboard.measures`) or written inline in a tile's value slot. */
export interface MeasureDef {
  id: string;
  name: string;
  agg: AggKind;
  /** The field it folds (distinct, sum, mean, median, pct, min, max). */
  field?: FieldRef;
  /** Percentile, 1-99. */
  p?: number;
  /** Only rows where this Compare predicate holds (`event == "kill"`); for `rate`, the rows counted over all. */
  where?: string;
  /** Ratio: measure ids. */
  num?: string;
  den?: string;
  /** Calc: arithmetic over other measures by name (`` `Kills` / `Deaths` ``) and Compare aggregates (`countIf(...)`). */
  expr?: string;
  format?: ValueFormat;
}

/** A tile's value: a saved measure by id, or a quick one (a field dropped on the slot). */
export type ValueRef = { m: string } | { agg: AggKind; field?: FieldRef; p?: number; where?: string; name?: string };

export type FilterOp = 'in' | 'out' | 'range' | 'search' | 'relative' | 'expr';

/** A filter: a slicer's value, a filter pane entry, a drill path or a cross-filter. */
export interface FilterDef {
  id: string;
  field: FieldRef;
  op: FilterOp;
  /** `in` / `out`: labels. */
  values?: string[];
  /** `range`: bounds (time in data seconds, match time in seconds into the match). */
  lo?: number;
  hi?: number;
  /** `search`: text a label must contain (case ignored). */
  text?: string;
  /** `relative`: the last (or, negative, the first) `n` units. */
  n?: number;
  unit?: 'sec' | 'min' | 'matches';
  /** `expr`: a Compare predicate. */
  expr?: string;
  /** The slicer tile this is the value of. */
  slicer?: string;
}

export interface CalcColumn {
  id: string;
  name: string;
  /** A Compare row expression: `speed * 3.6`, `alt > 1000`. */
  expr: string;
}

export interface BinDef {
  id: string;
  name: string;
  field: FieldRef;
  /** Bin width in the field's units; absent: `count` equal bins over its range. */
  size?: number;
  count?: number;
}

export interface Hierarchy {
  id: string;
  name: string;
  levels: FieldRef[];
}

export type SlicerMode = 'dropdown' | 'list' | 'buttons' | 'range' | 'date' | 'search' | 'relative';

export type Interact = 'filter' | 'highlight' | 'none';

export interface TileOpts {
  /** Bars, columns, area: side by side, stacked, or stacked to 100 %. */
  stack?: 'none' | 'stacked' | 'percent';
  /** Most groups before the rest fold into "Other". */
  top?: number;
  sort?: 'value-desc' | 'value-asc' | 'label' | 'natural';
  /** Bins along a numeric or time axis. */
  bins?: number;
  /** What a selection elsewhere on the page does to this tile. */
  interact?: Interact;
  /** KPI: against the filter-off baseline, or a comparison set (`compareFilters`). */
  compare?: 'none' | 'baseline' | 'set';
  compareFilters?: FilterDef[];
  compareLabel?: string;
  /** KPI: a sparkline over time. */
  spark?: boolean;
  /** Tables: data bars in the value columns, a colour scale on the cells. */
  dataBars?: boolean;
  colorScale?: boolean;
  slicer?: SlicerMode;
  /** Slicer: acts on every page (dashboard-level) rather than its own. */
  allPages?: boolean;
  /** Line and area: the data's clock, or time into each match. */
  clock?: 'match' | 'real';
  /** Title, text: size. */
  size?: 'h1' | 'h2' | 'body';
  /** Box plot whiskers: percentiles 5 / 95 (the default) or min / max. */
  whiskers?: 'p5' | 'minmax';
}

export interface Tile {
  id: string;
  pageId: string;
  kind: TileKind;
  /** Grid cells: 24 columns, rows of `ROW_PX`. */
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  /** Text and title tiles: the words (plain text, line breaks kept); image: alt text. */
  text?: string;
  /** Image tiles: a data: URL. */
  src?: string;
  /** Category axis / table rows / histogram's numeric field / scatter's groups / slicer's field. */
  axis?: FieldRef[];
  /** Series / pivot columns. */
  legend?: FieldRef;
  values?: ValueRef[];
  /** Bubble size. */
  size?: ValueRef;
  filters?: FilterDef[];
  opts?: TileOpts;
}

export interface Page {
  id: string;
  dashId: string;
  name: string;
  order: number;
  filters?: FilterDef[];
  /** A detail page: marks with these fields can drill through to it. */
  drillThrough?: FieldRef[];
  hidden?: boolean;
}

export interface DashLink {
  /** The 3D view's time window, filters, teams and match narrow every tile. */
  followView: boolean;
  /** Selections and slicers on the dashboard become the view's filters. */
  driveView: boolean;
  /** Only the rows inside the volume selected in the view. */
  volume: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  theme: 'auto' | 'dark' | 'light';
  filters?: FilterDef[];
  measures?: MeasureDef[];
  columns?: CalcColumn[];
  bins?: BinDef[];
  hierarchies?: Hierarchy[];
  link: DashLink;
  /** The data source it reads (`registerDashboardSource`); absent: the loaded dataset. */
  source?: string;
  /** The workspace it was made in, for templates and the list. */
  workspace?: string;
  at: number;
}

/** A dashboard with its pages and tiles: the JSON file and the op-log's three collections in one. */
export interface DashBundle {
  schema: typeof DASH_SCHEMA;
  dashboard: Dashboard;
  pages: Page[];
  tiles: Tile[];
}

export const GRID_COLS = 24;
export const ROW_PX = 28;

let idSeq = 0;
export function newId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${(idSeq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const DEFAULT_LINK: DashLink = { followView: true, driveView: false, volume: false };

/** The size a new tile of a kind takes, in grid cells. */
export function defaultSize(kind: TileKind): { w: number; h: number } {
  switch (kind) {
    case 'kpi':
      return { w: 4, h: 4 };
    case 'slicer':
      return { w: 4, h: 3 };
    case 'title':
      return { w: 24, h: 2 };
    case 'text':
      return { w: 6, h: 4 };
    case 'table':
    case 'pivot':
      return { w: 10, h: 9 };
    case 'minimap':
      return { w: 6, h: 8 };
    default:
      return { w: 8, h: 8 };
  }
}

export function makeDashboard(name: string, extra: Partial<Dashboard> = {}): DashBundle {
  const dashboard: Dashboard = { id: newId('d'), name, theme: 'auto', link: { ...DEFAULT_LINK }, at: Date.now(), ...extra };
  const page: Page = { id: newId('p'), dashId: dashboard.id, name: 'Page 1', order: 0 };
  return { schema: DASH_SCHEMA, dashboard, pages: [page], tiles: [] };
}

export function makeTile(pageId: string, kind: TileKind, at: { x: number; y: number }, extra: Partial<Tile> = {}): Tile {
  const s = defaultSize(kind);
  return { id: newId('t'), pageId, kind, x: at.x, y: at.y, w: s.w, h: s.h, values: [], ...extra };
}

// ---------------------------------------------------------------------------
// Reading JSON from elsewhere (a file, a peer, storage): checked, clamped.

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, max = 200): string | undefined => (typeof v === 'string' ? v.slice(0, max) : undefined);
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const strs = (v: unknown, max = 2000): string[] | undefined => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, max).map((x) => x.slice(0, 400)) : undefined);
const clampInt = (v: unknown, lo: number, hi: number, d: number) => {
  const n = num(v);
  return n === undefined ? d : Math.max(lo, Math.min(hi, Math.round(n)));
};

function strip<T extends object>(o: T): T {
  for (const k of Object.keys(o) as (keyof T)[]) if (o[k] === undefined) delete o[k];
  return o;
}

const OPS: readonly FilterOp[] = ['in', 'out', 'range', 'search', 'relative', 'expr'];

export function parseFilter(v: unknown): FilterDef | null {
  if (!isObj(v) || typeof v.field !== 'string' || !OPS.includes(v.op as FilterOp)) return null;
  return strip({
    id: str(v.id, 64) ?? newId('f'),
    field: v.field.slice(0, 200),
    op: v.op as FilterOp,
    values: strs(v.values),
    lo: num(v.lo),
    hi: num(v.hi),
    text: str(v.text, 200),
    n: num(v.n),
    unit: v.unit === 'sec' || v.unit === 'min' || v.unit === 'matches' ? (v.unit as FilterDef['unit']) : undefined,
    expr: str(v.expr, 2000),
    slicer: str(v.slicer, 64),
  });
}

const filters = (v: unknown) => (Array.isArray(v) ? v.map(parseFilter).filter((f): f is FilterDef => !!f).slice(0, 200) : undefined);

function parseValueRef(v: unknown): ValueRef | null {
  if (!isObj(v)) return null;
  if (typeof v.m === 'string') return { m: v.m.slice(0, 64) };
  if (!AGG_KINDS.includes(v.agg as AggKind)) return null;
  return strip({ agg: v.agg as AggKind, field: str(v.field), p: num(v.p), where: str(v.where, 2000), name: str(v.name) });
}

export function parseMeasure(v: unknown): MeasureDef | null {
  if (!isObj(v) || typeof v.id !== 'string' || !AGG_KINDS.includes(v.agg as AggKind)) return null;
  return strip({
    id: v.id.slice(0, 64),
    name: str(v.name) ?? 'Measure',
    agg: v.agg as AggKind,
    field: str(v.field),
    p: num(v.p),
    where: str(v.where, 2000),
    num: str(v.num, 64),
    den: str(v.den, 64),
    expr: str(v.expr, 4000),
    format: ['int', 'pct', 'dec', 'rate', 'ratio', 'seconds'].includes(v.format as string) ? (v.format as ValueFormat) : undefined,
  });
}

export function parseDashboard(v: unknown): Dashboard | null {
  if (!isObj(v) || typeof v.id !== 'string') return null;
  const link = isObj(v.link) ? v.link : {};
  return strip({
    id: v.id.slice(0, 64),
    name: str(v.name) ?? 'Dashboard',
    theme: v.theme === 'dark' || v.theme === 'light' ? (v.theme as Dashboard['theme']) : 'auto',
    filters: filters(v.filters),
    measures: Array.isArray(v.measures) ? v.measures.map(parseMeasure).filter((m): m is MeasureDef => !!m).slice(0, 200) : undefined,
    columns: Array.isArray(v.columns)
      ? v.columns.filter(isObj).filter((c) => typeof c.id === 'string' && typeof c.expr === 'string').slice(0, 100).map((c) => ({ id: String(c.id).slice(0, 64), name: str(c.name) ?? 'Column', expr: String(c.expr).slice(0, 2000) }))
      : undefined,
    bins: Array.isArray(v.bins)
      ? v.bins.filter(isObj).filter((b) => typeof b.id === 'string' && typeof b.field === 'string').slice(0, 100).map((b) => strip({ id: String(b.id).slice(0, 64), name: str(b.name) ?? 'Bins', field: String(b.field).slice(0, 200), size: num(b.size), count: b.count === undefined ? undefined : clampInt(b.count, 2, 200, 10) }))
      : undefined,
    hierarchies: Array.isArray(v.hierarchies)
      ? v.hierarchies.filter(isObj).filter((h) => typeof h.id === 'string').slice(0, 50).map((h) => ({ id: String(h.id).slice(0, 64), name: str(h.name) ?? 'Hierarchy', levels: strs(h.levels, 8) ?? [] }))
      : undefined,
    link: { followView: link.followView !== false, driveView: link.driveView === true, volume: link.volume === true },
    source: str(v.source, 64),
    workspace: str(v.workspace, 32),
    at: num(v.at) ?? Date.now(),
  });
}

export function parsePage(v: unknown): Page | null {
  if (!isObj(v) || typeof v.id !== 'string' || typeof v.dashId !== 'string') return null;
  return strip({
    id: v.id.slice(0, 64),
    dashId: v.dashId.slice(0, 64),
    name: str(v.name, 80) ?? 'Page',
    order: num(v.order) ?? 0,
    filters: filters(v.filters),
    drillThrough: strs(v.drillThrough, 8),
    hidden: v.hidden === true ? true : undefined,
  });
}

export function parseTile(v: unknown): Tile | null {
  if (!isObj(v) || typeof v.id !== 'string' || typeof v.pageId !== 'string' || !TILE_KINDS.includes(v.kind as TileKind)) return null;
  const o = isObj(v.opts) ? v.opts : {};
  const src = typeof v.src === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v.src) && v.src.length < 4_000_000 ? v.src : undefined;
  const values = Array.isArray(v.values) ? v.values.map(parseValueRef).filter((x): x is ValueRef => !!x).slice(0, 12) : [];
  const opts: TileOpts = strip({
    stack: o.stack === 'stacked' || o.stack === 'percent' || o.stack === 'none' ? o.stack : undefined,
    top: o.top === undefined ? undefined : clampInt(o.top, 2, 500, 12),
    sort: ['value-desc', 'value-asc', 'label', 'natural'].includes(o.sort as string) ? (o.sort as TileOpts['sort']) : undefined,
    bins: o.bins === undefined ? undefined : clampInt(o.bins, 4, 200, 24),
    interact: o.interact === 'filter' || o.interact === 'highlight' || o.interact === 'none' ? o.interact : undefined,
    compare: o.compare === 'baseline' || o.compare === 'set' || o.compare === 'none' ? o.compare : undefined,
    compareFilters: filters(o.compareFilters),
    compareLabel: str(o.compareLabel, 80),
    spark: typeof o.spark === 'boolean' ? o.spark : undefined,
    dataBars: typeof o.dataBars === 'boolean' ? o.dataBars : undefined,
    colorScale: typeof o.colorScale === 'boolean' ? o.colorScale : undefined,
    slicer: ['dropdown', 'list', 'buttons', 'range', 'date', 'search', 'relative'].includes(o.slicer as string) ? (o.slicer as SlicerMode) : undefined,
    allPages: typeof o.allPages === 'boolean' ? o.allPages : undefined,
    clock: o.clock === 'match' || o.clock === 'real' ? o.clock : undefined,
    size: o.size === 'h1' || o.size === 'h2' || o.size === 'body' ? o.size : undefined,
    whiskers: o.whiskers === 'p5' || o.whiskers === 'minmax' ? o.whiskers : undefined,
  });
  return strip({
    id: v.id.slice(0, 64),
    pageId: v.pageId.slice(0, 64),
    kind: v.kind as TileKind,
    x: clampInt(v.x, 0, GRID_COLS - 1, 0),
    y: clampInt(v.y, 0, 2000, 0),
    w: clampInt(v.w, 1, GRID_COLS, 6),
    h: clampInt(v.h, 1, 200, 6),
    title: str(v.title, 200),
    text: str(v.text, 20_000),
    src,
    axis: strs(v.axis, 6),
    legend: str(v.legend),
    values,
    size: v.size ? (parseValueRef(v.size) ?? undefined) : undefined,
    filters: filters(v.filters),
    opts,
  });
}

/** A dashboard file (`heat3d.dashboard/1`): checked, every entity read again; null when it is none. */
export function parseBundle(v: unknown): DashBundle | null {
  if (!isObj(v) || v.schema !== DASH_SCHEMA) return null;
  const dashboard = parseDashboard(v.dashboard);
  if (!dashboard) return null;
  const pages = (Array.isArray(v.pages) ? v.pages : []).map(parsePage).filter((p): p is Page => !!p && p.dashId === dashboard.id).slice(0, 50);
  const ids = new Set(pages.map((p) => p.id));
  const tiles = (Array.isArray(v.tiles) ? v.tiles : []).map(parseTile).filter((x): x is Tile => !!x && ids.has(x.pageId)).slice(0, 2000);
  if (!pages.length) pages.push({ id: newId('p'), dashId: dashboard.id, name: 'Page 1', order: 0 });
  return { schema: DASH_SCHEMA, dashboard, pages, tiles };
}

/** The same dashboard under new ids (an import beside the original, a template). */
export function reid(b: DashBundle): DashBundle {
  const dash = newId('d');
  const pageIds = new Map(b.pages.map((p) => [p.id, newId('p')]));
  const tileIds = new Map(b.tiles.map((x) => [x.id, newId('t')]));
  const fixFilters = (fs: FilterDef[] | undefined) => fs?.map((f) => ({ ...f, slicer: f.slicer ? (tileIds.get(f.slicer) ?? f.slicer) : undefined }));
  return {
    schema: DASH_SCHEMA,
    dashboard: { ...structuredClone(b.dashboard), id: dash, filters: fixFilters(b.dashboard.filters), at: Date.now() },
    pages: b.pages.map((p) => ({ ...structuredClone(p), id: pageIds.get(p.id)!, dashId: dash, filters: fixFilters(p.filters) })),
    tiles: b.tiles.map((x) => ({ ...structuredClone(x), id: tileIds.get(x.id)!, pageId: pageIds.get(x.pageId) ?? x.pageId })),
  };
}
