import { describe, expect, it } from 'vitest';
import { CANON } from '../data/canonical';
import { SOURCE_COLUMN } from '../data/builder';
import type { Dataset } from '../state/types';
import { FULL_SCOPE } from '../volumes/stats';
import type { Volume } from '../volumes/volume';
import { bindMetric, bindPredicate, ExprError, parse, simpleForm } from './expr';
import { poissonInterval, wilsonInterval } from './engine';
import { builtinMetrics, exportMetricsJson, mergeMetrics, sanitize, type MetricDef } from './metrics';
import { buildSchema, prepare, versusSync, type Setup } from './run';

/**
 * Four matches of two teams on a line. Each match: the Allies (persons 0, 1)
 * walk x 0..19 one unit a second, the Axis (2, 3) stand at x 30. Vehicles:
 * person 0 and 2 a T-34, 1 and 3 a Panther. Kills: each Ally kills once at
 * x 5 with an SMG (person 0) or a rifle (person 1); each Axis dies once.
 * The Allies win matches 0..2, the Axis match 3. Matches 0, 1 come from file
 * A, 2, 3 from file B.
 */
function synth(): Dataset {
  const rows: { x: number; t: number; p: number; s: number; e: number; w: number; won: number; earn: number; cost: number }[] = [];
  for (let s = 0; s < 4; s++) {
    for (let k = 0; k < 20; k++) {
      const t = s * 100 + k;
      for (let p = 0; p < 4; p++) {
        const ally = p < 2;
        const won = ally ? (s < 3 ? 1 : 0) : s < 3 ? 0 : 1;
        rows.push({ x: ally ? k : 30, t, p, s, e: 0, w: 0, won, earn: ally ? 10 : 5, cost: 2 });
        if (k === 5 && ally) rows.push({ x: 5, t, p, s, e: 2, w: p === 0 ? 1 : 2, won, earn: 0, cost: 0 });
        if (k === 5 && !ally) rows.push({ x: 30, t, p, s, e: 3, w: 0, won, earn: 0, cost: 0 });
      }
    }
  }
  const n = rows.length;
  const life = Float32Array.from(rows, (r) => (r.e ? 0 : r.t % 100 === 19 ? -1 : 1));
  return {
    id: 's',
    name: 'synth',
    count: n,
    px: Float32Array.from(rows, (r) => r.x),
    py: Float32Array.from(rows, (r) => (r.p === 1 ? 2000 : 0)),
    pz: new Float32Array(n),
    time: Float32Array.from(rows, (r) => r.t),
    epochMs: null,
    lifetime: life,
    maxLifetimeGap: 1,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: Uint32Array.from(rows, (r) => r.p),
    teamId: Uint16Array.from(rows, (r) => (r.p < 2 ? 0 : 1)),
    personLabels: ['ann', 'bob', 'cid', 'dan'],
    teamLabels: ['Allies', 'Axis'],
    sessionId: Uint32Array.from(rows, (r) => r.s),
    sessionLabels: ['m0', 'm1', 'm2', 'm3'],
    sessionRows: new Uint32Array([n / 4, n / 4, n / 4, n / 4]),
    sessionStart: new Float32Array([0, 100, 200, 300]),
    sessionEnd: new Float32Array([19, 119, 219, 319]),
    personTeam: new Uint16Array([0, 0, 1, 1]),
    personSlot: new Uint16Array([0, 1, 0, 1]),
    teamSizes: new Uint32Array([2, 2]),
    attrs: [
      { name: CANON.event, kind: 'category', data: Uint32Array.from(rows, (r) => r.e), min: 0, max: 3, categories: ['position', 'fire', 'kill', 'death'] },
      { name: 'vehicle', kind: 'category', data: Uint32Array.from(rows, (r) => r.p % 2), min: 0, max: 1, categories: ['T-34', 'Panther'] },
      { name: 'weapon', kind: 'category', data: Uint32Array.from(rows, (r) => r.w), min: 0, max: 2, categories: ['', 'MP40', 'AK-47'] },
      { name: 'won', kind: 'number', data: Float32Array.from(rows, (r) => r.won), min: 0, max: 1 },
      { name: 'earn_usd', kind: 'number', data: Float32Array.from(rows, (r) => r.earn), min: 0, max: 10 },
      { name: 'cost_spent_usd', kind: 'number', data: Float32Array.from(rows, (r) => r.cost), min: 0, max: 2 },
      { name: SOURCE_COLUMN, kind: 'category', data: Uint32Array.from(rows, (r) => (r.s < 2 ? 0 : 1)), min: 0, max: 1, categories: ['A.parquet', 'B.parquet'] },
    ],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 30, maxY: 2000, maxZ: 0 },
    timeRange: [0, 319],
    timeSorted: true,
  } as Dataset;
}

const m = (id: string, expr: string, unit = ''): MetricDef => ({ id, name: id, expr, unit });
const box = (id: string, cx: number, sx: number): Volume => ({
  id,
  name: id,
  color: '#3987e5',
  visible: true,
  op: 'include',
  shape: { kind: 'box', center: [cx, 0, 0], size: [sx, 1e5, 10], yaw: 0, pitch: 0, roll: 0 },
});

function run(ds: Dataset, s: Partial<Setup>) {
  const setup: Setup = { region: { mode: 'all', volumes: [] }, groups: [], split: null, dim: null, metrics: [], ref: 0, ...s };
  const p = prepare(ds, setup, FULL_SCOPE);
  return { p, r: versusSync(ds, p) };
}

/** The value of metric `mi` on the row of group `g` (region `v`, split total). */
const val = (r: ReturnType<typeof run>['r'], mi: number, g: number, v = 0, nD = r.dims?.length ?? 0) => {
  const i = r.rows.findIndex((x) => x.g === g && x.v === v && x.s === -1);
  return r.metrics[mi].values[i * (1 + nD)];
};

describe('compare expressions', () => {
  const ds = synth();
  const schema = buildSchema(ds);

  it('parse with precedence, where, lists and quoted names', () => {
    const a = parse('1 + 2 * 3 == 7 and not x in ["a", "b"]');
    expect(a.k).toBe('bin');
    expect((a as { op: string }).op).toBe('and');
    expect(parse('avg(speed) where alt > 1000').k).toBe('where');
    expect(parse('`Source file` = "A"').k).toBe('bin');
  });

  it('say what is wrong and where', () => {
    const err = (f: () => unknown) => {
      try {
        f();
      } catch (e) {
        return e as ExprError;
      }
      return null;
    };
    expect(err(() => parse('count(')!)?.key).toBe('unexpectedEnd');
    expect(err(() => parse('"open')!)?.key).toBe('unclosedString');
    expect(err(() => parse('a $ b'))?.key).toBe('badChar');
    expect(err(() => bindPredicate('tem == "Allies"', schema))?.key).toBe('unknownColumn');
    expect(err(() => bindPredicate('team == "Nobody"', schema))?.key).toBe('noSuchValue');
    expect(err(() => bindPredicate('team + 1', schema))?.key).toBe('categoryInMath');
    expect(err(() => bindMetric('speed', schema))?.key).toBe('columnOutside');
    expect(err(() => bindMetric('sum(team)', schema))?.key).toBe('categoryInMath');
    expect(err(() => bindMetric('1 + 2', schema))?.key).toBe('noAggregate');
    expect(err(() => bindPredicate('count() > 2', schema))?.key).toBe('aggInRow');
    expect(err(() => bindMetric('percentile(speed, 200)', schema))?.key).toBe('percentileP');
    expect(err(() => bindMetric('nope(1)', schema))?.key).toBe('unknownFunction');
    const e = err(() => bindPredicate('team == "Allies" and vehicel == "T-34"', schema))!;
    expect(e.pos).toBe(21);
  });

  it('read bare words, canonical kinds and weapon classes as values', () => {
    expect(simpleForm(bindPredicate('team=Allies', schema))).toEqual([{ key: '@team', values: [0] }]);
    expect(simpleForm(bindPredicate('vehicle = T-34 and team == "Axis"', schema))).toEqual([
      { key: 'a:vehicle', values: [0] },
      { key: '@team', values: [1] },
    ]);
    expect(bindPredicate('event == "KILL"', schema)).toBeTruthy();
    expect(bindMetric('countIf(event == "kill" and weaponClass(weapon) == "smg")', schema).aggs).toHaveLength(1);
    // The same aggregate twice is folded once.
    expect(bindMetric('count() / count() + kills()', schema).aggs).toHaveLength(2);
  });
});

describe('compare aggregations', () => {
  const ds = synth();

  it('count, sum, avg, distinct, percentile and money per group', () => {
    const { r } = run(ds, {
      groups: [{ label: 'Allies', filter: 'team == Allies' }, { label: 'Axis', filter: 'team == Axis' }],
      metrics: [
        m('rows', 'count()'),
        m('kills', 'kills()'),
        m('smg', 'countIf(event == "kill" and weaponClass(weapon) == "smg") / countIf(event == "kill")'),
        m('net', 'sum(earn_usd) - sum(cost_spent_usd)'),
        m('players', 'players()'),
        m('alt', 'avg(alt) where alt > 1000'),
        m('med', 'median(x)'),
        m('dist', 'sum(step)'),
        m('speed', 'avg(speed)'),
        m('pres', 'presence()'),
      ],
    });
    // Allies: 2 persons x 20 samples x 4 matches + 8 kills.
    expect(val(r, 0, 0)).toBe(168);
    expect(val(r, 0, 1)).toBe(168);
    expect(val(r, 1, 0)).toBe(8);
    expect(val(r, 1, 1)).toBe(0);
    expect(val(r, 2, 0)).toBeCloseTo(0.5);
    expect(val(r, 3, 0)).toBe(160 * 10 - 160 * 2);
    expect(val(r, 4, 0)).toBe(2);
    expect(val(r, 5, 0)).toBe(2000);
    expect(val(r, 6, 1)).toBe(30);
    // Each Ally walks 19 units a match; kill rows do not move the track.
    expect(val(r, 7, 0)).toBeCloseTo(2 * 4 * 19);
    expect(val(r, 8, 0)).toBeCloseTo(1);
    expect(val(r, 9, 0)).toBeCloseTo(2 * 4 * 19);
    // The All row of the place: both groups.
    expect(val(r, 0, 2)).toBe(336);
    expect(r.shown.rows).toBe(336);
  });

  it('win rate with the shrinkage, and a bootstrap interval paired across groups', () => {
    const { r } = run(ds, {
      groups: [{ label: 'Allies', filter: 'team == Allies' }, { label: 'Axis', filter: 'team == Axis' }],
      metrics: [m('win', 'winRate()'), m('kd', 'shrink(kills(), deaths(), 4)'), m('rows', 'count()')],
    });
    // Allies won 3 of 4 matches, each player's match counted once: 6 of 8, toward 0.5 by 4.
    expect(val(r, 0, 0)).toBeCloseTo((6 + 4 * 0.5) / (8 + 4));
    expect(r.metrics[0].method).toBe('bootstrap');
    const i = r.rows.findIndex((x) => x.g === 1 && x.s === -1);
    expect(r.ref[i]).toBe(r.rows.findIndex((x) => x.g === 0 && x.s === -1));
    // K/D pulled toward the place's 1.0: Allies (8 + 4) / (0 + 4).
    expect(val(r, 1, 0)).toBeCloseTo(3);
    // Rows are identical in every match: the difference's interval is a point at 0.
    expect(r.metrics[2].dlo[i]).toBeCloseTo(0);
    expect(r.metrics[2].dhi[i]).toBeCloseTo(0);
  });

  it('volumes combined count a row once; separately, each volume', () => {
    // Two overlapping boxes: x 0..10 and x 5..15.
    const vols = [box('a', 5, 10), box('b', 10, 10)];
    const metrics = [m('rows', 'count()')];
    const u = run(ds, { region: { mode: 'union', volumes: vols }, metrics });
    const s = run(ds, { region: { mode: 'separate', volumes: vols }, metrics });
    // Allies sample x 0..15 (16 per person a match) + kills at x 5.
    const union = 16 * 2 * 4 + 8;
    expect(val(u.r, 0, 0)).toBe(union);
    expect(val(s.r, 0, 0, 0)).toBe(11 * 2 * 4 + 8);
    expect(val(s.r, 0, 0, 1)).toBe(11 * 2 * 4 + 8);
    expect(val(s.r, 0, 0, 0) + val(s.r, 0, 0, 1)).toBeGreaterThan(union);
  });

  it('compare containers and matches as groups, split by a column, over a dimension', () => {
    const { r } = run(ds, {
      groups: [
        { label: 'A', filter: '', source: { column: SOURCE_COLUMN, values: ['A.parquet'] } },
        { label: 'B Allies', filter: 'team == Allies', source: { column: SOURCE_COLUMN, values: ['B.parquet'] } },
      ],
      split: { column: 'vehicle', top: 5 },
      dim: { kind: 'match' },
      metrics: [m('rows', 'count()')],
    });
    expect(r.dims).toEqual(['m0', 'm1', 'm2', 'm3']);
    const nD = 4;
    expect(val(r, 0, 0)).toBe(168);
    expect(val(r, 0, 1)).toBe(84);
    const t34 = r.rows.findIndex((x) => x.g === 1 && x.split === 'T-34');
    expect(r.metrics[0].values[t34 * (1 + nD)]).toBe(84 / 2);
    // B's Allies only in matches 2 and 3.
    const row = r.rows.findIndex((x) => x.g === 1 && x.s === -1);
    expect(Array.from(r.metrics[0].values.slice(row * (1 + nD) + 1, row * (1 + nD) + 5))).toEqual([NaN, NaN, 42, 42].map((v) => (Number.isNaN(v) ? 0 : v)));
  });

  it('time bins and the time window', () => {
    const p = prepare(ds, { region: { mode: 'all', volumes: [] }, groups: [], split: null, dim: { kind: 'matchTime', bins: 2 }, metrics: [m('rows', 'count()')], ref: 0 }, { ...FULL_SCOPE, timeLo: 100, timeHi: 199 });
    const r = versusSync(ds, p);
    expect(r.shownRows).toBe(84);
    expect(r.dims).toHaveLength(2);
  });

  it('intervals', () => {
    const [lo, hi] = poissonInterval(10);
    expect(lo).toBeCloseTo(4.8, 0);
    expect(hi).toBeCloseTo(18.4, 0);
    const [a, b] = wilsonInterval(5, 10);
    expect(a).toBeLessThan(0.5);
    expect(b).toBeGreaterThan(0.5);
  });

  it('built-ins bind on what the data has; user metrics round-trip as JSON', () => {
    const schema = buildSchema(ds);
    const ok = builtinMetrics(ds).filter((d) => {
      try {
        bindMetric(d.expr, schema);
        return true;
      } catch {
        return false;
      }
    });
    expect(ok.map((d) => d.id)).toEqual(expect.arrayContaining(['rows', 'kd', 'winRate', 'earn:usd', 'net:usd', 'ev:kill', 'distance']));
    const list = [m('user:a', 'kills() / matches()', 'per match')];
    const back = sanitize(JSON.parse(exportMetricsJson(list)));
    expect(back).toEqual([{ id: 'user:a', name: 'user:a', expr: 'kills() / matches()', unit: 'per match', lowerBetter: false }]);
    expect(sanitize([{ name: 'x' }, 5, null])).toEqual([]);
    expect(mergeMetrics(back, [{ ...back[0], name: 'b' }])[0].name).toBe('b');
  });
});
