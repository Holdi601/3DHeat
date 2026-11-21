/**
 * Ready-made dashboards per workspace (and the game the data comes from):
 * a start that already reads the loaded data's own fields - KPI cards on top,
 * slicers beside them, the charts below - which the user then edits. Built
 * from the field catalogue, so a template only puts down what the data has.
 */

import type { Catalog, FieldInfo } from './fields';
import { fieldWithRole } from './fields';
import { makeDashboard, makeTile, newId, type AggKind, type DashBundle, type FieldRef, type MeasureDef, type Tile, type TileKind, type TileOpts, type ValueRef } from './model';

export interface Template {
  id: string;
  name: string;
  /** The workspaces it is offered in first. */
  workspaces: string[];
  build: (cat: Catalog) => DashBundle;
}

/** Lays tiles out left to right, a new row when the 24 columns are full. */
class Flow {
  x = 0;
  y = 0;
  rowH = 0;
  tiles: Tile[] = [];
  constructor(private pageId: string) {}
  add(kind: TileKind, w: number, h: number, extra: Partial<Tile> = {}): Tile {
    if (this.x + w > 24) this.nl();
    const t = makeTile(this.pageId, kind, { x: this.x, y: this.y }, { w, h, ...extra });
    this.tiles.push(t);
    this.x += w;
    this.rowH = Math.max(this.rowH, h);
    return t;
  }
  nl(): void {
    if (this.x === 0) return;
    this.x = 0;
    this.y += this.rowH;
    this.rowH = 0;
  }
}

const q = (agg: AggKind, field?: FieldRef, extra: { name?: string; p?: number; where?: string } = {}): ValueRef => ({ agg, ...(field ? { field } : {}), ...extra });

function firstNum(cat: Catalog, names: RegExp): FieldInfo | null {
  return cat.fields.find((f) => f.kind === 'num' && f.group === 'columns' && names.test(f.name)) ?? null;
}

function eventMeasures(cat: Catalog): MeasureDef[] {
  if (!cat.schema.event || (!cat.kill.length && !cat.death.length)) return [];
  return [
    { id: newId('m'), name: 'Kills', agg: 'calc', expr: 'kills()', format: 'int' },
    { id: newId('m'), name: 'Deaths', agg: 'calc', expr: 'deaths()', format: 'int' },
    { id: newId('m'), name: 'K/D', agg: 'calc', expr: 'kills() / max(deaths(), 1)', format: 'ratio' },
  ];
}

function slicer(f: Flow, field: FieldInfo | null, mode: TileOpts['slicer'], w = 4, allPages = true): void {
  if (field) f.add('slicer', w, 3, { title: field.name, axis: [field.id], opts: { slicer: mode, allPages } });
}

function overview(cat: Catalog, name: string, workspace: string): DashBundle {
  const b = makeDashboard(name, { workspace });
  const p = b.pages[0];
  p.name = 'Overview';
  const f = new Flow(p.id);
  const ms = eventMeasures(cat);
  b.dashboard.measures = ms;
  const ev = fieldWithRole(cat, 'event');
  const won = fieldWithRole(cat, 'won');
  f.add('title', 24, 2, { text: name, opts: { size: 'h1' } });
  f.add('kpi', 4, 4, { title: 'Rows', values: [q('count')], opts: { compare: 'baseline' } });
  if (cat.byId.get('person')) f.add('kpi', 4, 4, { title: 'Players', values: [q('distinct', 'person')], opts: { compare: 'baseline' } });
  if (ms.length) f.add('kpi', 4, 4, { title: 'Kills', values: [{ m: ms[0].id }], opts: { compare: 'baseline' } });
  if (won) f.add('kpi', 4, 4, { title: 'Won share', values: [q('mean', won.id, { name: 'Won share' })], opts: { compare: 'baseline' } });
  else f.add('kpi', 4, 4, { title: 'Per minute', values: [q('perMin')], opts: { compare: 'baseline' } });
  slicer(f, cat.byId.get('team') ?? null, 'buttons', 8);
  f.nl();
  slicer(f, cat.byId.get('session') ?? null, 'dropdown');
  slicer(f, ev, 'dropdown');
  slicer(f, cat.byId.get('mtime') ?? null, 'range');
  slicer(f, cat.byId.get('person') ?? null, 'search');
  f.nl();
  if (cat.byId.get('team')) f.add('bar', 8, 8, { title: 'Rows by team', axis: ['team'] });
  if (cat.byId.get('time')) f.add('line', 10, 8, { title: 'Over time', legend: cat.byId.get('team') ? 'team' : undefined });
  if (cat.byId.get('x')) f.add('minimap', 6, 8, { title: 'Where (from above)' });
  f.nl();
  if (ev) f.add('pie', 6, 8, { title: 'Events', axis: [ev.id] });
  f.add('histogram', 8, 8, { title: 'Height', axis: ['y'] });
  if (cat.byId.get('person')) f.add('topn', 10, 8, { title: 'Top players', axis: ['person'], values: ms.length ? [{ m: ms[0].id }] : [q('count')] });
  f.nl();
  if (cat.byId.get('team') && ev) f.add('pivot', 12, 8, { title: 'Team by event', axis: ['team'], legend: ev.id, opts: { colorScale: true } });
  if (cat.byId.get('person')) f.add('table', 12, 8, { title: 'Players', axis: ['person'], values: [q('count'), ...(ms.length ? [{ m: ms[2].id }] : []), q('max', 'mtime', { name: 'Last seen' })], opts: { dataBars: true } });
  b.tiles = f.tiles;
  return b;
}

function match(cat: Catalog): DashBundle {
  const b = overview(cat, 'Match', 'match');
  const p2 = { id: newId('p'), dashId: b.dashboard.id, name: 'Player detail', order: 1, drillThrough: ['person'] };
  b.pages.push(p2);
  const f = new Flow(p2.id);
  const ms = b.dashboard.measures ?? [];
  f.add('title', 24, 2, { text: 'Player detail - drilled through from a player', opts: { size: 'h2' } });
  f.add('kpi', 6, 4, { title: 'Rows', values: [q('count')], opts: { compare: 'baseline' } });
  if (ms.length) f.add('kpi', 6, 4, { title: 'K/D', values: [{ m: ms[2].id }], opts: { compare: 'baseline' } });
  f.nl();
  f.add('minimap', 8, 9, { title: 'Where' });
  f.add('bands', 16, 9, { title: 'Height over the match', values: [q('median', 'y')] });
  b.tiles.push(...f.tiles);
  return b;
}

function mass(cat: Catalog): DashBundle {
  const b = makeDashboard('Mass analysis', { workspace: 'heat' });
  const p = b.pages[0];
  p.name = 'Matches';
  const f = new Flow(p.id);
  const won = fieldWithRole(cat, 'won');
  const map = fieldWithRole(cat, 'map');
  const ver = fieldWithRole(cat, 'version');
  const side = fieldWithRole(cat, 'side');
  f.add('title', 24, 2, { text: 'Mass analysis', opts: { size: 'h1' } });
  if (cat.byId.get('session')) f.add('kpi', 4, 4, { title: 'Matches', values: [q('distinct', 'session')] });
  if (cat.byId.get('person')) f.add('kpi', 4, 4, { title: 'Players', values: [q('distinct', 'person')] });
  if (won) f.add('kpi', 4, 4, { title: 'Won share', values: [q('mean', won.id, { name: 'Won share' })], opts: { compare: 'baseline' } });
  f.add('kpi', 4, 4, { title: 'Rows a minute', values: [q('perMin')] });
  slicer(f, map, 'dropdown');
  slicer(f, ver, 'dropdown');
  f.nl();
  slicer(f, side, 'buttons');
  if (won) slicer(f, won, 'range');
  f.nl();
  const by = map ?? cat.byId.get('session') ?? cat.byId.get('team');
  if (by) f.add('bar', 12, 9, { title: `By ${by.name}`, axis: [by.id], values: won ? [q('mean', won.id, { name: 'Won share' })] : [q('count')] });
  if (ver) f.add('column', 12, 9, { title: `By ${ver.name}`, axis: [ver.id] });
  f.nl();
  const num = firstNum(cat, /.*/) ?? cat.byId.get('y') ?? null;
  if (num && by) f.add('box', 12, 9, { title: `${num.name} by ${by.name}`, axis: [by.id], values: [q('median', num.id)] });
  if (by && side) f.add('matrix', 12, 9, { title: `${by.name} by ${side.name}`, axis: [by.id], legend: side.id, values: won ? [q('mean', won.id)] : [q('count')] });
  b.tiles = f.tiles;
  return b;
}

function vehicles(cat: Catalog): DashBundle {
  const b = makeDashboard('Vehicles', { workspace: 'vehicle' });
  const p = b.pages[0];
  p.name = 'Vehicles';
  const levels = (['nation', 'class', 'vehicle', 'variant'] as const).map((r) => fieldWithRole(cat, r)).filter((x): x is FieldInfo => !!x);
  const h = levels.length >= 2 ? { id: newId('h'), name: levels.map((l) => l.name).join(' › '), levels: levels.map((l) => l.id) } : null;
  if (h) b.dashboard.hierarchies = [h];
  const f = new Flow(p.id);
  f.add('title', 24, 2, { text: 'Vehicles', opts: { size: 'h1' } });
  f.add('kpi', 6, 4, { title: 'Rows', values: [q('count')], opts: { compare: 'baseline' } });
  for (const l of levels.slice(0, 3)) slicer(f, l, 'dropdown', 6);
  f.nl();
  const axis = h ? `h:${h.id}` : (levels[0]?.id ?? 'team');
  f.add('bar', 12, 10, { title: h ? `${h.name} (drill down)` : 'By vehicle', axis: [axis], opts: { top: 15 } });
  if (levels[1] ?? levels[0]) f.add('treemap', 12, 10, { title: (levels[1] ?? levels[0]).name, axis: [(levels[1] ?? levels[0]).id] });
  f.nl();
  f.add('table', 24, 9, { title: 'All', axis: [levels[levels.length - 1]?.id ?? 'team'], values: [q('count'), q('share')], opts: { dataBars: true } });
  b.tiles = f.tiles;
  return b;
}

function race(cat: Catalog): DashBundle {
  const b = makeDashboard('Race', { workspace: 'race' });
  const f = new Flow(b.pages[0].id);
  const speed = firstNum(cat, /speed|velocity|kmh|mph/i) ?? cat.byId.get('y') ?? null;
  f.add('title', 24, 2, { text: 'Race', opts: { size: 'h1' } });
  if (speed) {
    f.add('kpi', 6, 4, { title: `Top ${speed.name}`, values: [q('max', speed.id)] });
    f.add('kpi', 6, 4, { title: `Median ${speed.name}`, values: [q('median', speed.id)] });
  }
  slicer(f, cat.byId.get('person') ?? null, 'dropdown', 6);
  f.nl();
  if (speed) {
    f.add('bands', 16, 9, { title: `${speed.name} over time`, values: [q('median', speed.id)] });
    f.add('histogram', 8, 9, { title: speed.name, axis: [speed.id] });
  }
  f.nl();
  f.add('minimap', 8, 9, { title: 'Track' });
  b.tiles = f.tiles;
  return b;
}

export const TEMPLATES: Template[] = [
  { id: 'overview', name: 'Overview', workspaces: ['heat', 'plan'], build: (c) => overview(c, 'Overview', 'heat') },
  { id: 'match', name: 'Match', workspaces: ['match'], build: match },
  { id: 'mass', name: 'Mass analysis', workspaces: ['heat', 'match'], build: mass },
  { id: 'vehicles', name: 'Vehicles', workspaces: ['vehicle'], build: vehicles },
  { id: 'race', name: 'Race', workspaces: ['race'], build: race },
];

/** Adds (or replaces, by id) a template; another module's own (the Vehicles tab's hits). Returns its removal. */
export function registerTemplate(tpl: Template): () => void {
  const i = TEMPLATES.findIndex((x) => x.id === tpl.id);
  if (i >= 0) TEMPLATES.splice(i, 1, tpl);
  else TEMPLATES.push(tpl);
  return () => {
    const j = TEMPLATES.indexOf(tpl);
    if (j >= 0) TEMPLATES.splice(j, 1);
  };
}

/** The templates for a workspace, its own first. */
export function templatesFor(workspace: string): Template[] {
  return [...TEMPLATES.filter((t) => t.workspaces.includes(workspace)), ...TEMPLATES.filter((t) => !t.workspaces.includes(workspace))];
}
