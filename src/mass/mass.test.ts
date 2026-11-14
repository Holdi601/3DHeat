import { describe, expect, it } from 'vitest';
import type { LeanSpec } from '../overlay/lean/scan';
import { massInsights, massReportForModel } from './detect';
import { GridMerge, mergeCell } from './grids';
import { MassStore, balance, drillMatches, overview, phases, populations, sides, trends } from './store';
import { SummaryBuilder, headOf, pow2At, summaryColumns } from './summarize';
import { GRID_KINDS, type MatchSummary } from './types';

const SPEC: LeanSpec = {
  time: 'time', timeScale: 1, x: 'x', y: 'y', z: 'z',
  axes: { up: 'y', flipX: false, flipY: false, flipZ: false, scale: 1 },
  track: 'track', match: null, event: 'event', team: 'team', look: 'none',
  dirX: null, dirY: null, dirZ: null, yaw: null, pitch: null, angleScale: 1, roll: null, meta: [], units: 1,
};
const COLUMNS = ['time', 'x', 'y', 'z', 'track', 'event', 'team', 'vehicle', 'type', 'ai', 'player', 'won', 'earn_sl', 'cost_lost_sl', 'otherVehicle'];
const NUMERIC = new Set(['time', 'x', 'y', 'z', 'won', 'earn_sl', 'cost_lost_sl']);

/** A match: two tanks a side driving east for 60 s; side `a`'s strong tank kills `k` times near (100, 0). */
function match(id: string, k: number, opts: { started?: string; map?: string; winner?: 'a' | 'b'; strong?: string } = {}): MatchSummary {
  const cols = summaryColumns(COLUMNS, (c) => NUMERIC.has(c), SPEC);
  const b = new SummaryBuilder(SPEC, cols, { id, manifest: { game: 'test', map: opts.map ?? 'm1', mode: 'RB', started: opts.started ?? '2026-01-01T00:00:00Z' } });
  const rows: Record<string, unknown[]> = Object.fromEntries(COLUMNS.map((c) => [c, []]));
  const push = (r: Record<string, unknown>) => COLUMNS.forEach((c) => rows[c].push(r[c] ?? null));
  const units = [
    { track: 'p1', team: 'a', vehicle: opts.strong ?? 'strong_tank', ai: false },
    { track: 'p2', team: 'a', vehicle: 'tank_a', ai: false },
    { track: 'p3', team: 'b', vehicle: 'tank_b', ai: false },
    { track: 'p4', team: 'b', vehicle: 'tank_b', ai: true },
  ];
  for (let t = 0; t <= 60; t++)
    units.forEach((u, i) => {
      const won = opts.winner ? (u.team === opts.winner ? 1 : 0) : null;
      push({ time: t, x: t * 5, y: 1, z: i * 40, track: u.track, event: 'position', team: u.team, vehicle: u.vehicle, type: 'tank', ai: u.ai, player: u.track, won, earn_sl: t === 60 ? 100 : null });
    });
  for (let j = 0; j < k; j++) {
    push({ time: 10 + j, x: 100, y: 1, z: 0, track: 'p1', event: 'kill', team: 'a', vehicle: opts.strong ?? 'strong_tank', type: 'tank', ai: false, player: 'p1', otherVehicle: 'tank_b' });
    push({ time: 10 + j, x: 100, y: 1, z: 80, track: 'p3', event: 'death', team: 'b', vehicle: 'tank_b', type: 'tank', ai: false, player: 'p3', cost_lost_sl: 50 });
    // The same death said twice (War Thunder's `dead` and `death`): counted once.
    push({ time: 10 + j + 0.1, x: 100, y: 1, z: 80, track: 'p3', event: 'dead', team: 'b', vehicle: 'tank_b', type: 'tank', ai: false, player: 'p3' });
  }
  const n = rows.time.length;
  // In two chunks, as a row group would come.
  const half = Math.floor(n / 2);
  b.add(Object.fromEntries(COLUMNS.map((c) => [c, rows[c].slice(0, half)])), half);
  b.add(Object.fromEntries(COLUMNS.map((c) => [c, rows[c].slice(half)])), n - half);
  return b.finish();
}

describe('the match summary', () => {
  const s = match('one', 3, { winner: 'a' });

  it('counts the match, its teams, vehicles and players', () => {
    expect(s.duration).toBeCloseTo(60.1, 0);
    expect(s.teams.map((t) => t.name)).toEqual(['a', 'b']);
    expect(s.players).toBe(3);
    expect(s.ai).toBe(1);
    expect(s.winner).toBe('a');
    const strong = s.vehicles.find((v) => v.key === 'strong_tank')!;
    expect(strong.ev.kill).toBe(3);
    expect(strong.cls).toBe('tank');
    expect(Object.values(strong.vs).reduce((a, v) => a + v, 0)).toBe(3);
    expect(strong.presence).toBeCloseTo(60, 0);
    expect(strong.winSum).toBe(1);
    const b = s.vehicles.find((v) => v.key === 'tank_b' && v.team === 1)!;
    expect(b.ev.death).toBe(3);
    expect(s.economy.columns.map((c) => c.name)).toEqual(['earn_sl', 'cost_lost_sl']);
    expect(s.teams[1].val[1]).toBe(150);
  });

  it('keeps the grid: presence by team, class and band, events, time slices', () => {
    const g = s.grid!;
    expect(Number.isInteger(Math.log2(g.cell))).toBe(true);
    const total = g.p.reduce((a, v) => a + v, 0);
    expect(total).toBeCloseTo(240, 0);
    const kills = [];
    for (let q = 0; q < g.e.length; q += 6) if (GRID_KINDS[g.e[q + 1]] === 'kill') kills.push(g.e[q + 5]);
    expect(kills.reduce((a, v) => a + v, 0)).toBe(3);
    let pc = 0;
    for (let q = 2; q < g.pc.length; q += 3) pc += g.pc[q];
    expect(pc).toBeCloseTo(total, 0);
    let ph = 0;
    for (let q = 2; q < g.ph.length; q += 3) ph += g.ph[q];
    expect(ph).toBeCloseTo(total, 0);
    expect(g.ts.v.length % 5).toBe(0);
    expect(s.phases.kinds.kill.reduce((a, v) => a + v, 0)).toBe(3);
  });

  it('cell sizes are powers of two', () => {
    expect(pow2At(3)).toBe(4);
    expect(pow2At(0.3)).toBe(0.5);
    expect(mergeCell([[0, 0, 1000, 500], null])).toBe(8);
  });
});

describe('many matches', () => {
  const store = new MassStore();
  const all: MatchSummary[] = [];
  for (let i = 0; i < 40; i++) {
    const day = String(1 + (i % 20)).padStart(2, '0');
    // The strong tank kills 4 a match on m1; on m2 a fair tank kills 1.
    const m = i < 30 ? match(`a${i}`, 4, { started: `2026-01-${day}T00:00:00Z`, winner: 'a' }) : match(`b${i}`, 1, { started: `2026-01-${day}T00:00:00Z`, map: 'm2', winner: i % 2 ? 'a' : 'b', strong: 'fair_tank' });
    all.push(m);
    store.add(`f${i}.3dheat`, headOf(m));
  }
  const mask = store.matchMask({});

  it('overviews, filters and drills', () => {
    const o = overview(store, mask);
    expect(o.matches).toBe(40);
    expect(o.byMap.map((m) => m.key)).toEqual(['m1', 'm2']);
    expect(o.economy[0].currency).toBe('sl');
    expect(store.matchMask({ maps: ['m2'] }).reduce((a, v) => a + v, 0)).toBe(10);
    expect(store.matchMask({ from: Date.parse('2026-01-15') }).reduce((a, v) => a + v, 0)).toBe(12);
    expect(drillMatches(store, mask, { vehicle: 'fair_tank' })).toHaveLength(10);
    expect(drillMatches(store, mask, { team: 'b', vehicle: 'tank_b' })).toHaveLength(40);
  });

  it('ranks vehicles with intervals and a false discovery rate', () => {
    const rows = balance(store, mask, 'vehicle', 'none');
    const strong = rows.find((r) => r.key === 'strong_tank')!;
    expect(strong.kills).toBe(120);
    expect(strong.kd).toBeGreaterThan(strong.kdLo);
    expect(strong.win).toBe(1);
    expect(strong.q).toBeLessThan(0.05);
    const byMap = balance(store, mask, 'class', 'map');
    expect(new Set(byMap.map((r) => r.split))).toEqual(new Set(['m1', 'm2']));
    expect(balance(store, mask, 'weapon', 'none')).toEqual([]);
  });

  it('follows trends, players, sides and phases', () => {
    const tr = trends(store, mask, 'vehicle', 'week');
    expect(tr.buckets.length).toBeGreaterThan(1);
    expect(tr.series[0].usage.every((u) => u >= 0 && u <= 1)).toBe(true);
    const p = populations(store, mask);
    expect(p.players).toBe(3);
    const sd = sides(store, mask);
    const m1a = sd.find((r) => r.map === 'm1' && r.team === 'a')!;
    expect(m1a.win).toBe(1);
    expect(m1a.q).toBeLessThan(0.05);
    expect(phases(store, mask).kill.reduce((a, v) => a + v, 0)).toBe(130);
  });

  it('sums grids across matches and runs the detectors on them', () => {
    const merge = new GridMerge(mergeCell(all.map((s) => s.extent)));
    all.slice(0, 30).forEach((s) => merge.add(s.grid!, s.teams.map((t) => t.name), s.extent));
    expect(merge.matches).toBe(30);
    const r = merge.raster('kills');
    expect(r.v.reduce((a, v) => a + v, 0)).toBe(120);
    const st = merge.raster('stability');
    expect(st.max).toBe(1);
    const report = massInsights({ store, mask, filter: {}, grids: new Map([['m1', merge]]) });
    expect(report.schema).toBe('heat3d.mass/1');
    const kinds = new Set(report.insights.map((i) => i.kind));
    expect(kinds.has('side.win')).toBe(true);
    expect(kinds.has('hotspot.stable')).toBe(true);
    expect(report.detectors.some((d) => d.id === 'grid.power')).toBe(true);
    for (const i of report.insights) expect(i.confidence.q).toBeLessThanOrEqual(0.05);
    const model = massReportForModel(report, (k) => k);
    expect(JSON.parse(JSON.stringify(model)).insights.length).toBe(report.insights.length);
    // A team of the grid alone.
    const b = new GridMerge(merge.cell);
    all.slice(0, 30).forEach((s) => b.add(s.grid!, s.teams.map((t) => t.name), s.extent, 'b'));
    expect(b.raster('kills').max).toBe(0);
  });
});
