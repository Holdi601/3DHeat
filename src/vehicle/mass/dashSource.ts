/**
 * The vehicle-hit analysis on the dashboards (docs/dashboards.md,
 * docs/vehicle-hits.md "Dashboards"): the shown vehicle's hits that pass the
 * panel's filters, as a table the dashboards read (source `vehicle-hits`),
 * the four starter dashboards built on its fields, and the link both ways
 * between a dashboard and the 3D model - a plate, a shooter's vehicle or a
 * shell picked on a dashboard filters the plates and marks; a plate picked
 * in the view filters the open dashboard.
 *
 * The table is made in the analysis worker (`hitWorker.ts`, request `rows`)
 * once a view answers, never on the frame path; its numbers carry the same
 * sources as the panel (angle derived, speed a ballistic estimate).
 */

import { makeDashboard, makeTile, newId, registerDashboardSource, registerTemplate, useDash, type DashBundle, type FilterDef, type MeasureDef, type Tile, type TileKind } from '../../dashboards';
import type { AttributeColumn, Dataset } from '../../state/types';
import { platesHere } from '../plates';
import { ask, onView, patchFilter, useHitMass } from './client';
import type { HitRows } from './hitWorker';
import type { SourceSelection } from '../../dashboards/sources';

export const VEHICLE_HITS_SOURCE = 'vehicle-hits';
/** Rows the table holds at most (an even sample of the vehicle's hits past it). */
const ROW_LIMIT = 400_000;

let current: Dataset | null = null;
const listeners = new Set<() => void>();
let gen = 0;

function datasetOf(r: HitRows, name: string): Dataset {
  const n = r.n;
  const attrs: AttributeColumn[] = [];
  for (const c of r.cats) attrs.push({ name: c.name, kind: 'category', data: c.codes, min: 0, max: Math.max(0, c.labels.length - 1), categories: c.labels });
  for (const c of r.nums) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < n; i++) {
      const v = c.data[i];
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    attrs.push({ name: c.name, kind: 'number', data: c.data, min: Number.isFinite(lo) ? lo : 0, max: Number.isFinite(hi) ? hi : 0 });
  }
  let t0 = Infinity, t1 = -Infinity;
  const b = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };
  for (let i = 0; i < n; i++) {
    t0 = Math.min(t0, r.time[i]);
    t1 = Math.max(t1, r.time[i]);
    b.minX = Math.min(b.minX, r.x[i]);
    b.maxX = Math.max(b.maxX, r.x[i]);
    b.minY = Math.min(b.minY, r.y[i]);
    b.maxY = Math.max(b.maxY, r.y[i]);
    b.minZ = Math.min(b.minZ, r.z[i]);
    b.maxZ = Math.max(b.maxZ, r.z[i]);
  }
  if (!n) Object.assign(b, { minX: 0, minY: 0, minZ: 0, maxX: 0, maxY: 0, maxZ: 0 });
  const team = new Uint16Array(n);
  for (let i = 0; i < n; i++) team[i] = r.team[i];
  return {
    id: `vehicle-hits-${gen}`,
    name,
    count: n,
    px: r.x,
    py: r.y,
    pz: r.z,
    time: r.time,
    epochMs: null,
    lifetime: null,
    maxLifetimeGap: 0,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: r.player,
    teamId: team,
    personLabels: r.playerLabels,
    teamLabels: r.teamLabels,
    sessionId: r.match,
    sessionLabels: r.matchLabels,
    sessionRows: null,
    sessionStart: null,
    sessionEnd: null,
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    attrs,
    warnings: r.total > n ? [`${n} of ${r.total} hits, an even sample`] : [],
    bounds: b,
    timeRange: [Number.isFinite(t0) ? t0 : 0, Number.isFinite(t1) ? t1 : 0],
    timeSorted: false,
  } as Dataset;
}

/** Makes the table again for the shown vehicle and filters (the plate filter left out: the dashboards split by plate themselves). */
async function refresh(): Promise<void> {
  const s = useHitMass.getState();
  if (!s.vehicle || !s.result) return;
  const my = ++gen;
  const filter = { ...s.filter, plates: null };
  const names = s.figure ? (platesHere(s.figure)?.map((p) => p.name) ?? null) : null;
  const r = await ask<HitRows>({ type: 'rows', vehicle: s.vehicle, grouping: s.grouping, filter, platesKey: s.platesKey, plateNames: names, limit: ROW_LIMIT });
  if (my !== gen) return;
  current = datasetOf(r, s.vehicle);
  for (const cb of listeners) cb();
}

/** Only while a dashboard reads the source: the table is made when someone looks. */
let wanted = false;
let stale = true;
function want(): void {
  if (!wanted) return;
  stale = false;
  void refresh();
}

// ---------------------------------------------------------------------------
// The starter dashboards.

const F = (name: string) => `c:${name}`;
/** Rates with their 95 % Wilson interval, faint below five hits. */
const CI = { method: 'wilson', level: 0.95, minN: 5 } as const;
const M = {
  hits: { id: 'vh-hits', name: 'Hits', agg: 'count' } as MeasureDef,
  pen: { id: 'vh-pen', name: 'Penetration rate', agg: 'rate', where: 'penetrated == 1', format: 'pct', ci: CI } as MeasureDef,
  kills: { id: 'vh-kills', name: 'Killing shots', agg: 'sum', field: F('killingShot') } as MeasureDef,
  lethal: { id: 'vh-lethal', name: 'Lethal per hit', agg: 'rate', where: 'lethal == 1', format: 'pct', ci: CI } as MeasureDef,
  fire: { id: 'vh-fire', name: 'Fire per hit', agg: 'rate', where: 'fire == 1', format: 'pct', ci: CI } as MeasureDef,
  crew: { id: 'vh-crew', name: 'Crew hurt per hit', agg: 'rate', where: 'crew == 1', format: 'pct', ci: CI } as MeasureDef,
  ammo: { id: 'vh-ammo', name: 'Ammunition per hit', agg: 'rate', where: 'ammo == 1', format: 'pct', ci: CI } as MeasureDef,
  angle: { id: 'vh-angle', name: 'Median impact angle', agg: 'median', field: F('angle') } as MeasureDef,
  dist: { id: 'vh-dist', name: 'Median distance', agg: 'median', field: F('distance') } as MeasureDef,
  eff: { id: 'vh-eff', name: 'Median armour along the way', agg: 'median', field: F('effMm') } as MeasureDef,
};
const MEASURES = Object.values(M);
const v = (m: MeasureDef) => ({ m: m.id });

/** Tiles left to right on the 24-column grid, a new row when one is full. */
function flow(pageId: string) {
  let x = 0, y = 0, rowH = 0;
  const tiles: Tile[] = [];
  return {
    tiles,
    add(kind: TileKind, w: number, h: number, extra: Partial<Tile> = {}) {
      if (x + w > 24) {
        x = 0;
        y += rowH;
        rowH = 0;
      }
      tiles.push(makeTile(pageId, kind, { x, y }, { w, h, ...extra }));
      x += w;
      rowH = Math.max(rowH, h);
    },
  };
}

function bundle(name: string, build: (f: ReturnType<typeof flow>) => void): DashBundle {
  // Drive the view on: a mark picked here filters the plates and marks.
  const b = makeDashboard(name, { workspace: 'vehicle', source: VEHICLE_HITS_SOURCE, measures: MEASURES, link: { followView: false, driveView: true, volume: false } });
  b.pages[0].name = name;
  const f = flow(b.pages[0].id);
  f.add('title', 24, 2, { text: name, opts: { size: 'h1' } });
  build(f);
  b.tiles = f.tiles;
  return b;
}

const range = (field: string, lo: number, hi: number): FilterDef => ({ id: newId('f'), field: F(field), op: 'range', lo, hi });

export function threats(): DashBundle {
  return bundle('Threats to this vehicle', (f) => {
    f.add('kpi', 6, 4, { title: 'Hits', values: [v(M.hits)] });
    f.add('kpi', 6, 4, { title: 'Penetration rate', values: [v(M.pen)] });
    f.add('kpi', 6, 4, { title: 'Killing shots', values: [v(M.kills)] });
    f.add('kpi', 6, 4, { title: 'Median distance (m)', values: [v(M.dist)] });
    f.add('table', 14, 10, { title: 'Shooters’ vehicles', axis: [F('attacker')], values: [v(M.hits), v(M.pen), v(M.kills), v(M.crew), v(M.fire)], opts: { top: 20, dataBars: true } });
    f.add('bar', 10, 10, { title: 'Penetration rate by shell kind', axis: [F('shell kind')], values: [v(M.pen)] });
    f.add('bar', 12, 9, { title: 'Killing shots by shell', axis: [F('shell')], values: [v(M.kills)], opts: { top: 15 } });
    f.add('histogram', 12, 9, { title: 'Distance (m)', axis: [F('distance')] });
  });
}

export function weakSpots(): DashBundle {
  return bundle('Weak spots', (f) => {
    f.add('bar', 12, 12, { title: 'Penetration rate by plate', axis: [F('plate')], values: [v(M.pen)], opts: { top: 25 } });
    f.add('table', 12, 12, { title: 'Plates', axis: [F('plate')], values: [v(M.hits), v(M.pen), v(M.lethal), v(M.fire), v(M.ammo), v(M.eff)], opts: { top: 40, dataBars: true } });
    f.add('bar', 8, 9, { title: 'Lethal per hit', axis: [F('plate')], values: [v(M.lethal)], opts: { top: 12 } });
    f.add('bar', 8, 9, { title: 'Fire per hit', axis: [F('plate')], values: [v(M.fire)], opts: { top: 12 } });
    f.add('bar', 8, 9, { title: 'Crew hurt per hit', axis: [F('plate')], values: [v(M.crew)], opts: { top: 12 } });
  });
}

export function angles(): DashBundle {
  return bundle('Angles', (f) => {
    f.add('histogram', 12, 10, { title: 'Impact angle by result', axis: [F('angle')], legend: F('result') });
    f.add('histogram', 12, 10, { title: 'Armour along the way by result (mm)', axis: [F('effMm')], legend: F('result') });
    f.add('table', 12, 10, { title: 'Shells that still go through at 60° or more', axis: [F('shell')], values: [v(M.hits), v(M.pen), v(M.eff)], filters: [range('angle', 60, 90)], opts: { top: 20, dataBars: true } });
    f.add('bar', 12, 10, { title: 'Penetration rate at 60° or more, by plate', axis: [F('plate')], values: [v(M.pen)], filters: [range('angle', 60, 90)], opts: { top: 20 } });
  });
}

export function myShots(): DashBundle {
  return bundle('My shots', (f) => {
    f.add('slicer', 8, 3, { title: 'Shooter (player)', axis: [F('shooter')], opts: { slicer: 'dropdown', allPages: true } });
    f.add('kpi', 8, 3, { title: 'Hits', values: [v(M.hits)] });
    f.add('kpi', 8, 3, { title: 'Penetration rate', values: [v(M.pen)] });
    f.add('table', 12, 10, { title: 'Enemies hit', axis: [F('vehicle')], values: [v(M.hits), v(M.pen), v(M.kills)], opts: { top: 20, dataBars: true } });
    f.add('bar', 12, 10, { title: 'Plates gone through', axis: [F('plate')], values: [v(M.pen)], opts: { top: 20 } });
  });
}

// ---------------------------------------------------------------------------
// The link with the 3D model.

/** The fields whose picked marks filter the plates and marks, and the panel filter each sets. */
const LINKED: Record<string, 'plates' | 'attackers' | 'ammoNames' | 'ammoTypes'> = { [F('plate')]: 'plates', [F('attacker')]: 'attackers', [F('shell')]: 'ammoNames', [F('shell type')]: 'ammoTypes' };
const PLATE_FILTER = 'vhits-plate';

/** The dashboard's picked marks (Drive the view) as the panel's filters; null lifts them. */
function applySelection(sel: SourceSelection | null): void {
  const patch: Record<string, unknown> = { plates: null, attackers: null, ammoNames: null, ammoTypes: null };
  for (const p of sel?.picked ?? []) {
    const to = LINKED[p.field];
    if (!to || !p.labels.length) continue;
    if (to === 'plates') {
      const fig = useHitMass.getState().figure;
      const list = fig ? platesHere(fig) : null;
      patch.plates = list ? p.labels.map((n) => list.findIndex((x) => x.name === n)).filter((i) => i >= 0) : null;
    } else patch[to] = p.labels;
  }
  const f = useHitMass.getState().filter;
  if (Object.keys(patch).every((k) => JSON.stringify(f[k as keyof typeof f] ?? null) === JSON.stringify(patch[k]))) return;
  patchFilter(patch);
}

/** A plate picked in the view filters the open vehicle-hits dashboard (and letting go of it lifts that). */
function followView(plate: number, figure: string | null): void {
  const d = useDash.getState();
  const dash = d.open ? d.dashboards.find((x) => x.id === d.open) : undefined;
  if (!dash || dash.source !== VEHICLE_HITS_SOURCE) return;
  const name = plate >= 0 && figure ? platesHere(figure)?.[plate]?.name : undefined;
  const rest = (dash.filters ?? []).filter((f) => f.id !== PLATE_FILTER);
  d.setFilters({ dashId: dash.id }, name ? [...rest, { id: PLATE_FILTER, field: F('plate'), op: 'in', values: [name] }] : rest);
}

let installed = false;
/** Registers the source, the templates and the links; once. */
export function installVehicleDashboards(): void {
  if (installed) return;
  installed = true;
  registerDashboardSource({
    id: VEHICLE_HITS_SOURCE,
    label: 'Vehicle hits (many matches)',
    dataset: () => {
      if (!wanted) {
        wanted = true;
        if (stale) want();
      }
      return current;
    },
    applySelection,
    subscribe: (cb) => {
      listeners.add(cb);
      wanted = true;
      if (stale) want();
      return () => {
        listeners.delete(cb);
        if (!listeners.size) wanted = false;
      };
    },
  });
  for (const [id, name, build] of [
    ['vehicle-threats', 'Threats to this vehicle', threats],
    ['vehicle-weak-spots', 'Weak spots', weakSpots],
    ['vehicle-angles', 'Angles', angles],
    ['vehicle-my-shots', 'My shots', myShots],
  ] as const) registerTemplate({ id, name, workspaces: ['vehicle'], build: () => build() });
  onView(() => {
    stale = true;
    want();
  });
  let was = useHitMass.getState().plate;
  useHitMass.subscribe((s) => {
    if (s.plate === was) return;
    was = s.plate;
    followView(s.plate, s.figure);
  });
}
