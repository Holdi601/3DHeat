import { describe, expect, it } from 'vitest';
import { CANON } from '../data/canonical';
import type { AttributeColumn, Dataset } from '../state/types';
import { FULL_SCOPE } from '../volumes/stats';
import { sumsAt, factorEffect, groupValue, rankFactors, rankGroups, shrink } from './metrics';
import { binEdges, breakdownSync, buildFactors, dimensionsOf, weaponClassOf, type BreakdownRequest, type Dimension } from './breakdownRun';

/**
 * Two rounds of a one-against-one match, as a shooter's converter writes it:
 * movement samples carry the gear, kill and death rows carry none (the death
 * row names the killer's weapon), `other` the other party, `won` the result.
 */
function duel(): Dataset {
  const W = ['', 'AK-47', 'USP-S', 'Glock-18', 'M4A1-S'];
  const INV = ['', 'Knife|Flashbang', 'Knife'];
  const EV = ['position', 'kill', 'death'];
  const P = ['A', 'B'];
  const O = ['', 'A', 'B'];
  // [t, person, event, weapon, other, helmet, inventory, won, round, x]
  const rows: [number, number, number, number, number, number, number, number, number, number][] = [
    [0, 0, 0, 1, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 2, 0, 0, 2, 0, 0, 1],
    [1, 0, 1, 1, 2, NaN, 0, 1, 0, 0],
    [1, 1, 2, 1, 1, NaN, 0, 0, 0, 1],
    [2, 0, 0, 3, 0, 0, 2, 0, 1, 0],
    [2, 1, 0, 4, 0, 1, 2, 1, 1, 50],
    [3, 1, 1, 4, 1, NaN, 0, 1, 1, 50],
    [3, 0, 2, 4, 2, NaN, 0, 0, 1, 0],
  ];
  const n = rows.length;
  const cat = (name: string, k: number, categories: string[]): AttributeColumn => ({
    name, kind: 'category', data: Uint32Array.from(rows, (r) => r[k]), min: 0, max: categories.length - 1, categories,
  });
  const numc = (name: string, k: number): AttributeColumn => ({ name, kind: 'number', data: Float32Array.from(rows, (r) => r[k]), min: 0, max: Math.max(1, ...rows.map((r) => r[k]).filter((v) => v === v)) });
  return {
    id: 'd', name: 'duel', count: n,
    px: Float32Array.from(rows, (r) => r[9]), py: new Float32Array(n), pz: new Float32Array(n),
    time: Float32Array.from(rows, (r) => r[0]), epochMs: null,
    // Every movement sample stands for 30 seconds.
    lifetime: Float32Array.from(rows, (r) => (r[2] === 0 ? 30 : 0)), maxLifetimeGap: 30,
    personShared: null, yaw: null, pitch: null,
    personId: Uint32Array.from(rows, (r) => r[1]), teamId: Uint16Array.from(rows, (r) => r[1]),
    personLabels: P, teamLabels: ['T', 'CT'],
    sessionId: new Uint32Array(n), sessionLabels: ['m1'], sessionRows: new Uint32Array([n]),
    sessionStart: new Float32Array([0]), sessionEnd: new Float32Array([3]),
    personTeam: new Uint16Array([0, 1]), personSlot: new Uint16Array([0, 0]), teamSizes: new Uint32Array([1, 1]),
    attrs: [
      cat(CANON.event, 2, EV), cat('weapon', 3, W), cat('other', 4, O), numc('helmet', 5), cat('inventory', 6, INV), numc('won', 7), numc('round', 8),
      { name: 'earn_usd', kind: 'number', data: Float32Array.from(rows, (r) => (r[2] === 1 ? 300 : 0)), min: 0, max: 300 },
    ],
    warnings: [], bounds: { minX: 0, minY: 0, minZ: 0, maxX: 50, maxY: 0, maxZ: 0 }, timeRange: [0, 3], timeSorted: true,
  } as unknown as Dataset;
}

const dimOf = (ds: Dataset, id: string): Dimension => dimensionsOf(ds).find((d) => d.id === id)!;
const req = (ds: Dataset, p: Partial<BreakdownRequest> = {}): BreakdownRequest => ({
  scope: FULL_SCOPE, region: { kind: 'all' }, split: null, dim: dimOf(ds, 'cat:weapon'), mode: 'own', earn: 'earn_usd', cost: null, ...p,
});
const byLabel = (labels: string[], arr: Float64Array) => Object.fromEntries(labels.map((l, i) => [l, arr[i]]));

describe('breakdown', () => {
  it('counts kills with the weapon used and deaths with the weapon carried', () => {
    const ds = duel();
    const { prep, result } = breakdownSync(ds, req(ds));
    const labels = prep.dim!.labels;
    expect(byLabel(labels, result.groups!.kills)).toEqual({ 'AK-47': 1, 'USP-S': 0, 'Glock-18': 0, 'M4A1-S': 1 });
    // The death row names the killer's weapon: the victim's own is what they carried.
    expect(byLabel(labels, result.groups!.deaths)).toEqual({ 'AK-47': 0, 'USP-S': 1, 'Glock-18': 1, 'M4A1-S': 0 });
    expect(byLabel(labels, result.groups!.earn)['AK-47']).toBe(300);
    expect(result.total.presence).toBe(120);
  });

  it('ranks by the opponent: the victim\'s weapon on a kill, the killer\'s on a death', () => {
    const ds = duel();
    const { prep, result } = breakdownSync(ds, req(ds, { mode: 'opponent' }));
    const labels = prep.dim!.labels;
    expect(byLabel(labels, result.groups!.kills)).toEqual({ 'AK-47': 0, 'USP-S': 1, 'Glock-18': 1, 'M4A1-S': 0 });
    expect(byLabel(labels, result.groups!.deaths)).toEqual({ 'AK-47': 1, 'USP-S': 0, 'Glock-18': 0, 'M4A1-S': 1 });
  });

  it('derives the weapon class and counts rounds won per group', () => {
    const ds = duel();
    const { prep, result } = breakdownSync(ds, req(ds, { dim: dimOf(ds, 'wclass:weapon') }));
    const k = byLabel(prep.dim!.labels, result.groups!.kills);
    expect(k.rifle).toBe(2);
    const team = breakdownSync(ds, req(ds, { dim: dimOf(ds, 'team') }));
    expect(Array.from(team.result.groups!.played)).toEqual([2, 2]);
    expect(Array.from(team.result.groups!.won)).toEqual([1, 1]);
  });

  it('measures each state factor with against without, carried onto event rows', () => {
    const ds = duel();
    const f = buildFactors(ds);
    expect(f.factors.map((x) => `${x.name}:${x.value}`)).toEqual(['helmet:null', 'inventory:Knife', 'inventory:Flashbang']);
    const { result } = breakdownSync(ds, req(ds));
    // The helmet was worn on both kills, on neither death.
    expect(result.factors.kills[0]).toBe(2);
    expect(result.factors.deaths[0]).toBe(0);
    const kdr = factorEffect(sumsAt(result.factors, 0), result.total, 'kdr')!;
    expect(kdr.est).toBeGreaterThan(0);
    expect(kdr.shrunk).toBeLessThan(kdr.est);
    expect(rankFactors(result, 'kdr')[0].index).toBe(0);
    // Flashbang: held in round one by A, who won it.
    expect(result.factors.played[2]).toBe(1);
    expect(result.factors.won[2]).toBe(1);
  });

  it('splits layer A and B as the difference map does, and keeps to the region', () => {
    const ds = duel();
    const split = { rule: { kind: 'categories' as const, column: CANON.event, positive: [1], negative: [2] }, positiveTeams: [], negativeTeams: [], visibility: {} };
    const { prep, result } = breakdownSync(ds, req(ds, { split }));
    expect(result.total.a).toBe(2);
    expect(result.total.b).toBe(2);
    const ranked = rankGroups(result, 'share');
    expect(ranked.length).toBeGreaterThan(0);
    const near = breakdownSync(ds, req(ds, { split, region: { kind: 'sphere', c: [50, 0, 0], r: 5 } }));
    expect(near.result.total.rows).toBe(2);
    expect(near.result.total.kills).toBe(1);
    void prep;
  });

  it('shrinks small counts toward the whole and names weapon classes', () => {
    expect(shrink(1, 0, 1, 4)).toBeCloseTo(5 / 4, 6);
    const t = { a: 0, b: 0, rows: 0, kills: 10, deaths: 10, presence: 0, earn: 0, cost: 0, played: 0, won: 0 };
    expect(groupValue({ ...t, kills: 3, deaths: 0 }, t, 'kdr')).toBeCloseTo(7 / 4, 6);
    expect(weaponClassOf('AWP')).toBe('sniper');
    expect(weaponClassOf('Five-SeveN')).toBe('pistol');
    expect(weaponClassOf('High Explosive Grenade')).toBe('utility');
    expect(weaponClassOf('MAC-10')).toBe('smg');
    expect(weaponClassOf('')).toBeNull();
    expect(Array.from(binEdges(0, 1))).toEqual([-0.5, 0.5, 1.5]);
    expect(binEdges(0, 6000).length).toBeGreaterThan(4);
  });
});
