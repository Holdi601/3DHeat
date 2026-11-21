import { describe, expect, it } from 'vitest';
import { DEFAULT_SYNTH, generateSynthetic } from '../data/synth';
import type { Dataset } from '../state/types';
import { storeOf } from './columns';
import { catalogOf, type Catalog } from './fields';
import { finishTile, type TileData } from './finish';
import { makeDashboard, makeTile, parseBundle, reid, type Dashboard, type FilterDef, type Tile, type TileKind } from './model';
import { drillDown, drillFilters, drillTargets, drillUp, expandDown, planTile, throughFilters, tileClauses, toggleSelection, type Interaction, type Selection, NO_LINK } from './plan';
import { Engine, mergePartials, popcount, runAll, type Merged, type QuerySpec } from './query';
import { queryColumns } from './columns';

/** Synthetic rows: 4 teams of 3, three matches, an event, a weapon, a speed, a won flag. */
function data(rows = 24_000): Dataset {
  const ds = generateSynthetic({ ...DEFAULT_SYNTH, rows, teams: 4, playersPerTeam: 3, seed: 5 });
  const n = ds.count;
  const ev = new Uint32Array(n);
  const weapon = new Uint32Array(n);
  const speed = new Float32Array(n);
  const won = new Float32Array(n);
  const ses = new Uint32Array(n);
  const [t0, t1] = ds.timeRange;
  const third = (t1 - t0) / 3;
  for (let i = 0; i < n; i++) {
    ev[i] = i % 50 === 0 ? 1 : i % 70 === 0 ? 2 : 0;
    weapon[i] = i % 5;
    speed[i] = (i % 100) / 10;
    won[i] = ds.teamId![i] % 2 === 0 ? 1 : 0;
    ses[i] = Math.min(2, Math.floor((ds.time![i] - t0) / third));
  }
  ds.attrs.push(
    { name: 'Event type', kind: 'category', data: ev, min: 0, max: 2, categories: ['position', 'kill', 'death'] },
    { name: 'weapon', kind: 'category', data: weapon, min: 0, max: 4, categories: ['rifle', 'smg', 'shotgun', 'sniper', 'pistol'] },
    { name: 'speed', kind: 'number', data: speed, min: 0, max: 9.9 },
    { name: 'Round won', kind: 'number', data: won, min: 0, max: 1 },
  );
  ds.sessionId = ses;
  ds.sessionLabels = ['m1', 'm2', 'm3'];
  ds.sessionStart = new Float32Array([t0, t0 + third, t0 + 2 * third]);
  ds.sessionEnd = new Float32Array([t0 + third, t0 + 2 * third, t1]);
  return ds;
}

const DS = data();

interface Rig {
  ds: Dataset;
  cat: Catalog;
  dash: Dashboard;
  pageId: string;
  engines: Engine[];
}

function rig(dashPatch: Partial<Dashboard> = {}, ds = DS, shards = 1): Rig {
  const b = makeDashboard('Test');
  const dash = { ...b.dashboard, ...dashPatch, link: { followView: false, driveView: false, volume: false } };
  const cat = catalogOf(ds, dash);
  return { ds, cat, dash, pageId: b.pages[0].id, engines: Array.from({ length: shards }, () => null as unknown as Engine) };
}

const inter = (r: Rig, extra: Partial<Interaction> = {}): Interaction => ({ pageId: r.pageId, selection: null, drill: {}, through: null, ...extra });

/** Run a tile's queries over the rig's data (split across `shards` engines, as the workers split it) and finish it. */
function run(r: Rig, tile: Tile, it: Interaction = inter(r), engines?: Engine[]): { data: TileData; results: Map<string, Merged> } {
  const page = { id: r.pageId, dashId: r.dash.id, name: 'P', order: 0, filters: [] as FilterDef[] };
  const plan = planTile(r.cat, r.dash, page, tile, it, NO_LINK)!;
  const keys = queryColumns(plan.queries);
  let es = engines;
  if (!es) {
    const full = storeOf(r.ds, keys);
    // Two shards: halves of the rows, as the workers hold them.
    const half = Math.floor(full.n / 2);
    const cut = (lo: number, hi: number) => ({ ...full, n: hi - lo, cols: Object.fromEntries(Object.entries(full.cols).map(([k, v]) => [k, v.subarray(lo, hi)])) });
    es = [new Engine(cut(0, half)), new Engine(cut(half, full.n))];
  }
  const parts = es.map((e) => runAll(e.run(plan.queries)));
  const results = new Map<string, Merged>();
  plan.queries.forEach((q: QuerySpec, i) => results.set(q.id, mergePartials(q, parts.map((p) => p[i]))));
  return { data: finishTile(r.cat, tile, plan, results), results };
}

const tile = (r: Rig, kind: TileKind, extra: Partial<Tile> = {}) => makeTile(r.pageId, kind, { x: 0, y: 0 }, extra);

/** Brute force over the rows. */
function brute(ds: Dataset, keep: (i: number) => boolean) {
  const speed = ds.attrs.find((a) => a.name === 'speed')!.data as Float32Array;
  let n = 0;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  const persons = new Set<number>();
  const vals: number[] = [];
  for (let i = 0; i < ds.count; i++) {
    if (!keep(i)) continue;
    n++;
    sum += speed[i];
    min = Math.min(min, speed[i]);
    max = Math.max(max, speed[i]);
    persons.add(ds.personId![i]);
    vals.push(speed[i]);
  }
  vals.sort((a, b) => a - b);
  return { n, sum, mean: sum / n, min, max, persons: persons.size, median: vals[Math.floor(vals.length / 2)] };
}

const kpi = (d: TileData) => {
  if (d.kind !== 'kpi') throw new Error(`not a kpi: ${JSON.stringify(d).slice(0, 200)}`);
  return d;
};

describe('dashboard measures', () => {
  const r = rig();
  const all = brute(DS, () => true);
  it('count, distinct, sum, mean, min, max over every row', () => {
    const v = (values: Tile['values']) => kpi(run(r, tile(r, 'kpi', { values, opts: { compare: 'none', spark: false } })).data).value;
    expect(v([{ agg: 'count' }])).toBe(DS.count);
    expect(v([{ agg: 'distinct', field: 'person' }])).toBe(all.persons);
    expect(v([{ agg: 'sum', field: 'c:speed' }])).toBeCloseTo(all.sum, 0);
    expect(v([{ agg: 'mean', field: 'c:speed' }])).toBeCloseTo(all.mean, 4);
    expect(v([{ agg: 'min', field: 'c:speed' }])).toBeCloseTo(all.min, 5);
    expect(v([{ agg: 'max', field: 'c:speed' }])).toBeCloseTo(all.max, 5);
  });
  it('median and percentiles from fine bins, to a bin', () => {
    const med = kpi(run(r, tile(r, 'kpi', { values: [{ agg: 'median', field: 'c:speed' }], opts: { compare: 'none', spark: false } })).data).value;
    expect(Math.abs(med - all.median)).toBeLessThan(0.1);
    const p90 = kpi(run(r, tile(r, 'kpi', { values: [{ agg: 'pct', field: 'c:speed', p: 90 }], opts: { compare: 'none', spark: false } })).data).value;
    expect(p90).toBeGreaterThan(8.5);
    expect(p90).toBeLessThan(9.4);
  });
  it('share, rate, per minute, ratio and calculated measures', () => {
    const kills = brute(DS, (i) => i % 50 === 0).n;
    const deaths = brute(DS, (i) => i % 50 !== 0 && i % 70 === 0).n;
    const rd: Rig = { ...r, dash: { ...r.dash, measures: [
      { id: 'k', name: 'Kills', agg: 'count', where: 'event == "kill"' },
      { id: 'd', name: 'Deaths', agg: 'count', where: 'event == "death"' },
      { id: 'kd', name: 'KD', agg: 'ratio', num: 'k', den: 'd' },
      { id: 'c', name: 'Calc', agg: 'calc', expr: '`Kills` / `Deaths` * 100' },
      { id: 'c2', name: 'Calc2', agg: 'calc', expr: 'countIf(event == "kill") / count()' },
      { id: 'c3', name: 'Calc3', agg: 'calc', expr: 'kills() + deaths()' },
    ] } };
    const v = (values: Tile['values']) => kpi(run(rd, tile(rd, 'kpi', { values, opts: { compare: 'none', spark: false } })).data).value;
    expect(v([{ m: 'k' }])).toBe(kills);
    expect(v([{ m: 'kd' }])).toBeCloseTo(kills / deaths, 6);
    expect(v([{ m: 'c' }])).toBeCloseTo((kills / deaths) * 100, 4);
    expect(v([{ m: 'c2' }])).toBeCloseTo(kills / DS.count, 6);
    expect(v([{ m: 'c3' }])).toBe(kills + deaths);
    expect(v([{ agg: 'rate', where: 'event == "kill"' }])).toBeCloseTo(kills / DS.count, 6);
    expect(v([{ agg: 'share' }])).toBe(1);
    const pm = v([{ agg: 'perMin' }]);
    expect(pm).toBeGreaterThan(0);
  });
  it('a bar chart by team: per-team counts adding up to the rows, team colours', () => {
    const d = run(r, tile(r, 'bar', { axis: ['team'] })).data;
    if (d.kind !== 'chart') throw new Error(d.kind);
    expect(d.chart.groups.length).toBe(4);
    expect(d.chart.values[0].reduce((a, b) => a + b, 0)).toBe(DS.count);
    expect(d.chart.groups.every((g) => g.team !== undefined)).toBe(true);
  });
  it('folds past "most" into Other, exactly for counts', () => {
    const d = run(r, tile(r, 'bar', { axis: ['person'], opts: { top: 5 } })).data;
    if (d.kind !== 'chart') throw new Error(d.kind);
    expect(d.chart.groups.length).toBe(5);
    expect(d.chart.groups[4].key).toBe('other');
    expect(d.chart.values[0].reduce((a, b) => a + b, 0)).toBe(DS.count);
  });
  it('stacked to 100 %: each bar sums to one', () => {
    const d = run(r, tile(r, 'bar', { axis: ['team'], legend: 'c:weapon', opts: { stack: 'percent' } })).data;
    if (d.kind !== 'chart') throw new Error(d.kind);
    for (let g = 0; g < d.chart.groups.length; g++) expect(d.chart.values.reduce((s, row) => s + (row[g] || 0), 0)).toBeCloseTo(1, 6);
  });
  it('tables, pivots, box plots, bands, treemaps, the mini map and bubbles come out whole', () => {
    const tb = run(r, tile(r, 'table', { axis: ['team', 'c:weapon'], values: [{ agg: 'count' }, { agg: 'mean', field: 'c:speed' }] })).data;
    expect(tb.kind === 'table' && tb.rows.length === 20 && tb.rows.reduce((s, x) => s + x.values[0], 0) === DS.count).toBe(true);
    const pv = run(r, tile(r, 'pivot', { axis: ['team'], legend: 'c:weapon' })).data;
    expect(pv.kind === 'pivot' && pv.rows.length === 4 && pv.cols.length === 5).toBe(true);
    const bx = run(r, tile(r, 'box', { axis: ['team'], values: [{ agg: 'median', field: 'c:speed' }] })).data;
    expect(bx.kind === 'box' && bx.groups.length === 4 && bx.groups.every((g) => g.q[0] <= g.q[2] && g.q[2] <= g.q[4])).toBe(true);
    const bd = run(r, tile(r, 'bands', { values: [{ agg: 'median', field: 'c:speed' }] })).data;
    expect(bd.kind === 'bands' && bd.bins.length >= 8).toBe(true);
    const tm = run(r, tile(r, 'treemap', { axis: ['c:weapon'] })).data;
    expect(tm.kind === 'items' && tm.items.length === 5).toBe(true);
    const mm = run(r, tile(r, 'minimap')).data;
    expect(mm.kind === 'map' && mm.counts.reduce((a, b) => a + b, 0) === DS.count).toBe(true);
    const sc = run(r, tile(r, 'scatter', { axis: ['person'], values: [{ agg: 'mean', field: 'c:speed' }, { agg: 'count' }] })).data;
    expect(sc.kind === 'bubble' && sc.points.length === 12).toBe(true);
  });
});

describe('dashboard filters', () => {
  const r = rig();
  const count = (filters: FilterDef[]) => kpi(run(r, tile(r, 'kpi', { filters, opts: { compare: 'none', spark: false } })).data).value;
  const f = (x: Partial<FilterDef>): FilterDef => ({ id: 'f', field: 'team', op: 'in', ...x });
  it('in, out, range, search, relative and expression filters keep the rows they say', () => {
    const teamOf = DS.teamId!;
    const label0 = DS.teamLabels[0];
    expect(count([f({ values: [label0] })])).toBe(brute(DS, (i) => teamOf[i] === 0).n);
    expect(count([f({ op: 'out', values: [label0] })])).toBe(brute(DS, (i) => teamOf[i] !== 0).n);
    expect(count([f({ field: 'c:speed', op: 'range', lo: 2, hi: 4 })])).toBe(brute(DS, (i) => (i % 100) / 10 >= 2 && (i % 100) / 10 <= 4).n);
    expect(count([f({ field: 'c:weapon', op: 'search', text: 'SN' })])).toBe(brute(DS, (i) => i % 5 === 3).n);
    expect(count([f({ field: 'session', op: 'relative', n: 1, unit: 'matches' })])).toBe(brute(DS, (i) => DS.sessionId![i] === 2).n);
    expect(count([f({ op: 'expr', expr: 'weapon == "rifle" and speed > 5' })])).toBe(brute(DS, (i) => i % 5 === 0 && (i % 100) / 10 > 5).n);
    expect(count([f({ values: [] })])).toBe(DS.count);
  });
  it('stack dashboard, page and tile filters', () => {
    const rd: Rig = { ...r, dash: { ...r.dash, filters: [f({ field: 'c:weapon', values: ['rifle', 'smg'] })] } };
    const page = { id: r.pageId, dashId: rd.dash.id, name: 'P', order: 0, filters: [f({ field: 'c:speed', op: 'range', lo: 0, hi: 5 })] };
    const t = tile(rd, 'kpi', { filters: [f({ values: [DS.teamLabels[1]] })] });
    const cs = tileClauses(rd.cat, rd.dash, page, t, inter(rd), NO_LINK);
    expect(cs.main.length).toBe(3);
    expect(cs.baseline.length).toBe(1);
  });
  it('a KPI compares with the filter-off baseline', () => {
    const rd: Rig = { ...r, dash: { ...r.dash, filters: [f({ values: [DS.teamLabels[0]], slicer: 's1' })] } };
    const d = kpi(run(rd, tile(rd, 'kpi', { opts: { compare: 'baseline', spark: true } })).data);
    expect(d.value).toBe(brute(DS, (i) => DS.teamId![i] === 0).n);
    expect(d.compare?.value).toBe(DS.count);
    expect(d.spark?.length).toBe(24);
  });
});

describe('incremental folding', () => {
  it('a filter change folded as a difference gives the numbers a fresh count gives', () => {
    const r = rig();
    const t = tile(r, 'table', { axis: ['team'], values: [{ agg: 'count' }, { agg: 'mean', field: 'c:speed' }, { agg: 'distinct', field: 'person' }, { agg: 'median', field: 'c:speed' }] });
    const keys = new Set(['@team', '@person', 'a:speed', 'a:weapon', '@time']);
    const eng = new Engine(storeOf(DS, keys));
    const page = { id: r.pageId, dashId: r.dash.id, name: 'P', order: 0 };
    const step = (filters: FilterDef[]) => {
      const tt = { ...t, filters };
      const plan = planTile(r.cat, r.dash, page, tt, inter(r), NO_LINK)!;
      const parts = runAll(eng.run(plan.queries));
      const inc = finishTile(r.cat, tt, plan, new Map([[plan.queries[0].id, mergePartials(plan.queries[0], [parts[0]])]]));
      const fresh = run(r, tt).data;
      return { inc, fresh };
    };
    step([]);
    const a = step([{ id: 'w', field: 'c:weapon', op: 'out', values: ['rifle'] }]);
    expect(eng.stats.delta).toBeGreaterThan(0);
    expect(JSON.stringify(a.inc)).toBe(JSON.stringify(a.fresh));
    // Taken off again: recalled, no fold.
    const before = eng.stats.recalled;
    const b = step([]);
    expect(eng.stats.recalled).toBe(before + 1);
    expect(JSON.stringify(b.inc)).toBe(JSON.stringify(b.fresh));
  });
  it('tiles with the same filters share one mask', () => {
    const eng = new Engine(storeOf(DS, ['@team', 'a:weapon']));
    const spec = (id: string): QuerySpec => ({ id, dims: [{ k: 'cat', key: '@team', size: 4 }], accs: [{ k: 'count' }], clauses: [{ k: 'in', key: 'a:weapon', values: [1] }] });
    runAll(eng.run([spec('a'), spec('b'), spec('c')]));
    expect(eng.masks.size).toBe(1);
    expect(eng.stats.scans).toBe(1);
    expect(popcount(eng.masks.values().next().value!)).toBe(brute(DS, (i) => i % 5 === 1).n);
  });
});

describe('cross-filtering and highlighting', () => {
  const r = rig();
  const page = () => ({ id: r.pageId, dashId: r.dash.id, name: 'P', order: 0 });
  const sel = (cells: number[]): Selection => ({ tileId: 'src', pageId: r.pageId, dims: [{ k: 'cat', key: '@team', size: 4 }], fields: ['team'], cells, labels: cells.map((c) => [DS.teamLabels[c]]) });
  it('Ctrl adds and takes away marks; a plain click on the only one clears', () => {
    let s = toggleSelection(null, sel([0]), false);
    s = toggleSelection(s, sel([2]), true);
    expect(s?.cells).toEqual([0, 2]);
    s = toggleSelection(s, sel([0]), true);
    expect(s?.cells).toEqual([2]);
    expect(toggleSelection(s, sel([2]), false)).toBeNull();
  });
  it('filters the tiles set to filter, highlights the others, leaves the source alone', () => {
    const it2 = inter(r, { selection: sel([1]) });
    const k = tile(r, 'kpi', { opts: { compare: 'none', spark: false } });
    expect(kpi(run(r, k, it2).data).value).toBe(brute(DS, (i) => DS.teamId![i] === 1).n);
    const bar = tile(r, 'bar', { axis: ['c:weapon'] });
    const d = run(r, bar, it2).data;
    if (d.kind !== 'chart') throw new Error(d.kind);
    expect(d.chart.series.map((s) => s.key)).toEqual(['hl', 'other']);
    const total = d.chart.values[0].reduce((a, b) => a + b, 0) + d.chart.values[1].reduce((a, b) => a + b, 0);
    expect(total).toBe(DS.count);
    expect(d.chart.values[0].reduce((a, b) => a + b, 0)).toBe(brute(DS, (i) => DS.teamId![i] === 1).n);
    const self = { ...k, id: 'src' };
    expect(tileClauses(r.cat, r.dash, page(), self, it2, NO_LINK).main.length).toBe(0);
  });
});

describe('drilling', () => {
  const r = rig({ hierarchies: [{ id: 'h1', name: 'Team › Player', levels: ['team', 'person'] }] });
  it('drills down into a mark, up again, and expands a level', () => {
    const d1 = drillDown(r.cat, 'h:h1', undefined, DS.teamLabels[2])!;
    expect(d1).toEqual({ level: 1, path: [DS.teamLabels[2]], expand: false });
    const fs = drillFilters(r.cat, 'h:h1', d1);
    expect(fs[0].field).toBe('team');
    expect(drillDown(r.cat, 'h:h1', d1, 'x')).toBeNull();
    expect(drillUp(d1)).toEqual({ level: 0, path: [], expand: false });
    const ex = expandDown(r.cat, 'h:h1', undefined)!;
    expect(ex.expand).toBe(true);
    const t = tile(r, 'bar', { axis: ['h:h1'] });
    const d = run(r, t, inter(r, { drill: { [t.id]: d1 } })).data;
    if (d.kind !== 'chart') throw new Error(d.kind);
    expect(d.chart.groups.length).toBe(3);
    const e = run(r, t, inter(r, { drill: { [t.id]: ex } })).data;
    if (e.kind !== 'chart') throw new Error(e.kind);
    expect(e.chart.groups[0].label).toContain(' › ');
  });
  it('drills through to a detail page with the mark as its filter', () => {
    const pages = [
      { id: 'a', dashId: r.dash.id, name: 'A', order: 0 },
      { id: 'b', dashId: r.dash.id, name: 'Detail', order: 1, drillThrough: ['team'] },
    ];
    const s: Selection = { tileId: 't', pageId: 'a', dims: [{ k: 'cat', key: '@team', size: 4 }], fields: ['team'], cells: [3], labels: [[DS.teamLabels[3]]] };
    const targets = drillTargets(pages, s.fields, 'a');
    expect(targets.map((p) => p.id)).toEqual(['b']);
    expect(throughFilters(targets[0], s, r.cat)).toEqual([{ id: 'thr0', field: 'team', op: 'in', values: [DS.teamLabels[3]] }]);
  });
});

describe('dashboard files', () => {
  it('read back what they wrote, and refuse what is not one', () => {
    const b = makeDashboard('File');
    b.tiles.push(makeTile(b.pages[0].id, 'bar', { x: 2, y: 3 }, { axis: ['team'], values: [{ agg: 'count' }] }));
    const back = parseBundle(JSON.parse(JSON.stringify(b)));
    expect(back?.tiles[0].axis).toEqual(['team']);
    expect(parseBundle({ schema: 'x' })).toBeNull();
    const tampered = JSON.parse(JSON.stringify(b));
    tampered.tiles[0].src = 'javascript:alert(1)';
    tampered.tiles[0].kind = 'script';
    expect(parseBundle(tampered)?.tiles.length).toBe(0);
    const copy = reid(b);
    expect(copy.dashboard.id).not.toBe(b.dashboard.id);
    expect(copy.tiles[0].pageId).toBe(copy.pages[0].id);
  });
});
