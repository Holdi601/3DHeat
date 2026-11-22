/**
 * The person-hit analysis on the dashboards (docs/dashboards.md,
 * docs/person-hits.md "Dashboards"): the hits that pass the panel's filters
 * as a table the dashboards read (source `person-hits`), the four starter
 * dashboards built on its fields, and the link from a dashboard back to the
 * body view - a weapon, an armour or a region picked there filters the view.
 *
 * The table is made in the analysis worker (`worker.ts`, request `rows`) once
 * a view answers, never on the frame path.
 */

import { makeDashboard, makeTile, newId, registerDashboardSource, registerTemplate, type DashBundle, type MeasureDef, type Tile, type TileKind } from '../dashboards';
import type { AttributeColumn, Dataset } from '../state/types';
import type { SourceSelection } from '../dashboards/sources';
import { onPersonView, patchPersonFilter, personRows, usePersonHits } from './client';
import type { PersonRows } from './worker';

export const PERSON_HITS_SOURCE = 'person-hits';
const ROW_LIMIT = 400_000;

let current: Dataset | null = null;
const listeners = new Set<() => void>();
let gen = 0;

function datasetOf(r: PersonRows): Dataset {
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
    if (!Number.isFinite(r.x[i])) continue;
    b.minX = Math.min(b.minX, r.x[i]);
    b.maxX = Math.max(b.maxX, r.x[i]);
    b.minY = Math.min(b.minY, r.y[i]);
    b.maxY = Math.max(b.maxY, r.y[i]);
    b.minZ = Math.min(b.minZ, r.z[i]);
    b.maxZ = Math.max(b.maxZ, r.z[i]);
  }
  if (!Number.isFinite(b.minX)) Object.assign(b, { minX: 0, minY: 0, minZ: 0, maxX: 0, maxY: 0, maxZ: 0 });
  const team = new Uint16Array(n);
  for (let i = 0; i < n; i++) team[i] = r.team[i];
  return {
    id: `person-hits-${gen}`,
    name: 'Person hits',
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

async function refresh(): Promise<void> {
  const s = usePersonHits.getState();
  if (!s.result) return;
  const my = ++gen;
  const r = await personRows(ROW_LIMIT);
  if (my !== gen) return;
  current = datasetOf(r);
  for (const cb of listeners) cb();
}

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
const CI = { method: 'wilson', level: 0.95, minN: 5 } as const;
const M = {
  hits: { id: 'ph-hits', name: 'Hits', agg: 'count' } as MeasureDef,
  damage: { id: 'ph-damage', name: 'Damage per hit', agg: 'mean', field: F('damage'), format: 'dec' } as MeasureDef,
  whole: { id: 'ph-whole', name: 'Whole hit (health + armour)', agg: 'mean', field: F('whole'), format: 'dec' } as MeasureDef,
  absorbed: { id: 'ph-absorbed', name: 'Armour kept off per hit', agg: 'mean', field: F('absorbed'), format: 'dec' } as MeasureDef,
  kill: { id: 'ph-kill', name: 'Kill rate', agg: 'rate', where: 'kill == 1', format: 'pct', ci: CI } as MeasureDef,
  head: { id: 'ph-head', name: 'Headshot share', agg: 'rate', where: 'headshot == 1', format: 'pct', ci: CI } as MeasureDef,
  wall: { id: 'ph-wall', name: 'Through a wall', agg: 'rate', where: 'penetrated == 1', format: 'pct', ci: CI } as MeasureDef,
  wallKills: { id: 'ph-wall-kills', name: 'Wallbang kills', agg: 'sum', field: F('kill') } as MeasureDef,
  dist: { id: 'ph-dist', name: 'Median distance', agg: 'median', field: F('distance') } as MeasureDef,
};
const MEASURES = Object.values(M);
const v = (m: MeasureDef) => ({ m: m.id });

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

function bundle(name: string, build: (f: ReturnType<typeof flow>, bin: (field: string, size: number) => string) => void): DashBundle {
  const b = makeDashboard(name, { workspace: 'vehicle', source: PERSON_HITS_SOURCE, measures: MEASURES, link: { followView: false, driveView: true, volume: false } });
  b.pages[0].name = name;
  const f = flow(b.pages[0].id);
  const bins: NonNullable<typeof b.dashboard.bins> = [];
  const bin = (field: string, size: number) => {
    const id = newId('bin');
    bins.push({ id, name: `${field} (${size})`, field: F(field), size });
    return `b:${id}`;
  };
  f.add('title', 24, 2, { text: name, opts: { size: 'h1' } });
  build(f, bin);
  b.tiles = f.tiles;
  if (bins.length) b.dashboard.bins = bins;
  return b;
}

/** Damage over distance a weapon: the whole hit on the body, the headshot share, where kills happen. */
export function weaponFalloff(): DashBundle {
  return bundle('Weapon falloff', (f, bin) => {
    const d = bin('distance', 2);
    f.add('slicer', 8, 3, { title: 'Weapon', axis: [F('weapon')], opts: { slicer: 'dropdown', allPages: true } });
    f.add('slicer', 8, 3, { title: 'Region', axis: [F('zone')], opts: { slicer: 'dropdown', allPages: true } });
    f.add('kpi', 8, 3, { title: 'Hits', values: [v(M.hits)] });
    f.add('line', 24, 10, { title: 'Whole hit over distance (health + armour, m)', axis: [d], legend: F('weapon'), values: [v(M.whole)], opts: { top: 6 } });
    f.add('line', 12, 9, { title: 'Headshot share over distance', axis: [d], values: [v(M.head)] });
    f.add('table', 12, 9, { title: 'Weapons', axis: [F('weapon')], values: [v(M.hits), v(M.whole), v(M.head), v(M.kill), v(M.dist)], opts: { top: 25, dataBars: true } });
  });
}

/** What each armour kept off and let through, and how often a hit through it killed. */
export function armourEffectiveness(): DashBundle {
  return bundle('Armour effectiveness', (f) => {
    f.add('bar', 12, 10, { title: 'Armour kept off per hit', axis: [F('armour')], values: [v(M.absorbed)] });
    f.add('bar', 12, 10, { title: 'Health taken per hit', axis: [F('armour')], values: [v(M.damage)] });
    f.add('bar', 12, 9, { title: 'Kill rate by armour', axis: [F('armour')], values: [v(M.kill)] });
    f.add('table', 12, 9, { title: 'Armour by region', axis: [F('armour'), F('zone')], values: [v(M.hits), v(M.damage), v(M.absorbed), v(M.kill)], opts: { top: 40, dataBars: true } });
  });
}

/** Pick yourself as the victim: where you get hit, from where, by what. */
export function whereHit(): DashBundle {
  return bundle('Where do I get hit', (f) => {
    f.add('slicer', 8, 3, { title: 'Player hit', axis: [F('victim')], opts: { slicer: 'dropdown', allPages: true } });
    f.add('kpi', 8, 3, { title: 'Hits taken', values: [v(M.hits)] });
    f.add('kpi', 8, 3, { title: 'Headshot share', values: [v(M.head)] });
    f.add('bar', 8, 10, { title: 'Region', axis: [F('region')], values: [v(M.hits)] });
    f.add('bar', 8, 10, { title: 'From where (against your facing)', axis: [F('from')], values: [v(M.hits), v(M.kill)] });
    f.add('bar', 8, 10, { title: 'Your state when hit', axis: [F('victim state')], values: [v(M.hits), v(M.kill)] });
    f.add('table', 12, 9, { title: 'Who hit you', axis: [F('shooter')], values: [v(M.hits), v(M.damage), v(M.kill), v(M.dist)], opts: { top: 20, dataBars: true } });
    f.add('table', 12, 9, { title: 'Maps', axis: [F('map')], values: [v(M.hits), v(M.head), v(M.kill)], opts: { top: 20, dataBars: true } });
  });
}

/** Hits through walls: which weapons, how much damage got through, where. */
export function wallbangs(): DashBundle {
  return bundle('Wallbangs', (f, bin) => {
    const d = bin('distance', 2);
    f.add('kpi', 8, 3, { title: 'Through a wall', values: [v(M.wall)] });
    f.add('kpi', 8, 3, { title: 'Hits', values: [v(M.hits)] });
    f.add('kpi', 8, 3, { title: 'Median distance (m)', values: [v(M.dist)] });
    f.add('bar', 12, 10, { title: 'Through a wall by weapon', axis: [F('weapon')], values: [v(M.wall)], opts: { top: 15 } });
    f.add('table', 12, 10, { title: 'Wallbangs', axis: [F('weapon')], values: [v(M.hits), v(M.whole), v(M.kill)], filters: [{ id: newId('f'), field: F('penetrated'), op: 'range', lo: 1, hi: 1 }], opts: { top: 20, dataBars: true } });
    f.add('line', 24, 9, { title: 'Through a wall over distance', axis: [d], values: [v(M.wall)] });
  });
}

// ---------------------------------------------------------------------------
// The link with the body view.

const LINKED: Record<string, 'weapons' | 'armors' | 'regions' | 'victims' | 'shooters' | 'maps'> = {
  [F('weapon')]: 'weapons',
  [F('armour')]: 'armors',
  [F('region')]: 'regions',
  [F('zone')]: 'regions',
  [F('victim')]: 'victims',
  [F('shooter')]: 'shooters',
  [F('map')]: 'maps',
};

function applySelection(sel: SourceSelection | null): void {
  const patch: Record<string, string[] | null> = { weapons: null, armors: null, regions: null, victims: null, shooters: null, maps: null };
  for (const p of sel?.picked ?? []) {
    const to = LINKED[p.field];
    if (to && p.labels.length) patch[to] = p.labels;
  }
  const f = usePersonHits.getState().filter as Record<string, unknown>;
  if (Object.keys(patch).every((k) => JSON.stringify(f[k] ?? null) === JSON.stringify(patch[k]))) return;
  patchPersonFilter(patch);
}

let installed = false;
export function installPersonDashboards(): void {
  if (installed) return;
  installed = true;
  registerDashboardSource({
    id: PERSON_HITS_SOURCE,
    label: 'Person hits (many matches)',
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
    ['person-weapon-falloff', 'Weapon falloff', weaponFalloff],
    ['person-armour-effectiveness', 'Armour effectiveness', armourEffectiveness],
    ['person-where-hit', 'Where do I get hit', whereHit],
    ['person-wallbangs', 'Wallbangs', wallbangs],
  ] as const) registerTemplate({ id, name, workspaces: ['vehicle'], build: () => build() });
  onPersonView(() => {
    stale = true;
    want();
  });
}
