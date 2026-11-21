import { describe, expect, it } from 'vitest';
import { addRows, advanceAgg, aggregate, ALL_SCOPE, canAdvance, createAgg, finishAgg, histQuantile, sortOrder, tableOf, type AggMeta, type AggScope, type AggSource } from './aggregate';
import { normalizeSpec, type ChartSpec } from './types';

const meta: AggMeta = {
  teams: ['Red', 'Blue'],
  persons: ['a', 'b', 'c'],
  sessions: ['m1', 'm2'],
  sessionStart: [0, 100],
  timeRange: [0, 200],
  matchSpan: 100,
  columns: [
    { name: 'Event type', kind: 'category', labels: ['position', 'kill', 'death'], min: 0, max: 2 },
    { name: 'speed', kind: 'number', min: 0, max: 100 },
    { name: 'won', kind: 'number', min: 0, max: 1 },
    { name: 'weapon', kind: 'category', labels: ['rifle', 'smg', 'pistol', 'knife'], min: 0, max: 3 },
  ],
  won: 'won',
  event: 'Event type',
  kill: [1],
  death: [2],
};

/** 100 rows: time 0..198 step 2, team alternating, speed = i, a kill every 5th row, a death every 10th. */
function inside() {
  const n = 100;
  const time = new Float32Array(n);
  const team = new Uint16Array(n);
  const person = new Uint32Array(n);
  const session = new Uint32Array(n);
  const ev = new Uint32Array(n);
  const speed = new Float32Array(n);
  const won = new Float32Array(n);
  const weapon = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    time[i] = i * 2;
    team[i] = i % 2;
    person[i] = i % 3;
    session[i] = time[i] >= 100 ? 1 : 0;
    ev[i] = i % 10 === 0 ? 2 : i % 5 === 0 ? 1 : 0;
    speed[i] = i;
    won[i] = team[i] === 0 ? 1 : 0;
    weapon[i] = i % 4;
  }
  return tableOf({ time, team, person, session, cols: { 'Event type': ev, speed, won, weapon } });
}

const spec = (s: Partial<ChartSpec>) => normalizeSpec(s);
const src = (table = inside(), side = -1): AggSource => ({ table, side, skip: null });

describe('chart aggregation', () => {
  it('counts rows per group, sorted by value, with shares that add up', () => {
    const d = aggregate(meta, spec({ kind: 'bar', group: 'team' }), [src()], ALL_SCOPE);
    expect(d.groups.map((g) => g.label)).toEqual(['Red', 'Blue']);
    expect(d.values[0]).toEqual([50, 50]);
    const sh = aggregate(meta, spec({ kind: 'bar', group: 'col:weapon', measure: { kind: 'share' }, sort: 'label' }), [src()], ALL_SCOPE);
    expect(sh.groups.map((g) => g.label)).toEqual(['knife', 'pistol', 'rifle', 'smg']);
    expect(sh.values[0].reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
  });

  it('compares inside with a weighted sample outside', () => {
    const outside = { ...inside(), weight: 10 };
    const d = aggregate(meta, spec({ kind: 'bar', group: 'team', diff: 'inout', measure: { kind: 'count' } }), [src(inside(), 0), src(outside, 1)], ALL_SCOPE);
    expect(d.series.map((s) => s.label)).toEqual(['@inside', '@outside']);
    expect(d.values[0]).toEqual([50, 50]);
    expect(d.values[1]).toEqual([500, 500]);
    expect(d.sampled).toBe(true);
  });

  it('splits by teams and by won and lost', () => {
    const t = aggregate(meta, spec({ kind: 'bar', group: 'col:weapon', diff: 'teams', teams: ['Blue', 'Red'], sort: 'natural' }), [src()], ALL_SCOPE);
    expect(t.series.map((s) => s.label)).toEqual(['Blue', 'Red']);
    expect(t.series[0].team).toBe(1);
    const o = aggregate(meta, spec({ kind: 'tiles', diff: 'outcome' }), [src()], ALL_SCOPE);
    expect(o.series.map((s) => s.key)).toEqual(['won', 'lost']);
    const rows = o.groups.findIndex((g) => g.key === 'rows');
    expect(o.values[0][rows] + o.values[1][rows]).toBe(100);
    const won = o.groups.findIndex((g) => g.key === 'won');
    expect(o.values[0][won]).toBe(1);
    expect(o.values[1][won]).toBe(0);
    // Filtered to rows that won: only the red side's.
    const f = aggregate(meta, spec({ kind: 'bar', group: 'team', filter: { outcome: 'won' } }), [src()], ALL_SCOPE);
    expect(f.values[0]).toEqual([50]);
  });

  it('reads medians and percentiles from fine bins', () => {
    const d = aggregate(meta, spec({ kind: 'bar', group: 'none', measure: { kind: 'median', column: 'speed' } }), [src()], ALL_SCOPE);
    expect(d.values[0][0]).toBeGreaterThan(48);
    expect(d.values[0][0]).toBeLessThan(52);
    const p = aggregate(meta, spec({ kind: 'bar', group: 'none', measure: { kind: 'pct', column: 'speed', p: 90 } }), [src()], ALL_SCOPE);
    expect(p.values[0][0]).toBeGreaterThan(88);
    expect(p.values[0][0]).toBeLessThan(92);
    const h = new Float64Array([0, 4, 0, 4]);
    expect(histQuantile(h, 0, 4, 0, 1, 0.5)).toBeCloseTo(2, 9);
  });

  it('bins time into each match, and the data clock', () => {
    const m = aggregate(meta, spec({ kind: 'line', time: 'match', bins: 10 }), [src()], ALL_SCOPE);
    expect(m.groups.length).toBe(10);
    expect(m.axis).toMatchObject({ lo: 0, hi: 100, time: true });
    // Both matches fold onto match time: 10 rows a bin.
    expect(m.values[0]).toEqual(new Array(10).fill(10));
    const r = aggregate(meta, spec({ kind: 'area', time: 'real', bins: 8 }), [src()], ALL_SCOPE);
    expect(r.values[0]).toEqual([13, 12, 13, 12, 13, 12, 13, 12]);
  });

  it('histograms a column and folds groups past the top into Other', () => {
    const h = aggregate(meta, spec({ kind: 'histogram', x: 'speed', bins: 10 }), [src()], ALL_SCOPE);
    expect(h.values[0].reduce((a, b) => a + b, 0)).toBe(100);
    const b = aggregate(meta, spec({ kind: 'bar', group: 'col:weapon', top: 3 }), [src()], ALL_SCOPE);
    expect(b.groups.length).toBe(3);
    expect(b.groups[2].label).toBe('@other');
    expect(b.values[0].reduce((a, c) => a + c, 0)).toBe(100);
  });

  it('counts kills per death and the players in a stat tile', () => {
    const d = aggregate(meta, spec({ kind: 'tiles', measure: { kind: 'count', column: 'speed' } }), [src()], ALL_SCOPE);
    const at = (k: string) => d.values[0][d.groups.findIndex((g) => g.key === k)];
    expect(at('kd')).toBe(1); // 10 kills (every 5th not 10th), 10 deaths
    expect(at('players')).toBe(3);
    expect(at('rows')).toBe(100);
  });

  it('builds a matrix and a scatter', () => {
    const m = aggregate(meta, spec({ kind: 'matrix', group: 'col:weapon', stack: 'team', measure: { kind: 'share' } }), [src()], ALL_SCOPE);
    expect(m.series.length).toBe(2);
    expect(m.values.flat().reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
    const s = aggregate({ ...meta }, spec({ kind: 'scatter', x: 'speed', y: 'speed', bins: 10 }), [src()], ALL_SCOPE);
    expect(s.values.length).toBe(10);
    expect(s.values[3][3]).toBe(10);
    expect(s.values[3][4]).toBe(0);
  });

  it('follows the window forward and agrees with a fresh pass', () => {
    const scope = (lo: number, hi: number): AggScope => ({ ...ALL_SCOPE, timeLo: lo, timeHi: hi, minutes: (hi - lo) / 60, key: 'k' });
    const sp = spec({ kind: 'bar', group: 'col:weapon', measure: { kind: 'median', column: 'speed' }, sort: 'natural' });
    const s = [src()];
    const a = createAgg(meta, sp);
    let from = scope(0, 40);
    addRows(a, s[0], 0, s[0].table.n, from, 1);
    for (const [lo, hi] of [[10, 60], [30, 61], [30, 150], [120, 199]]) {
      const to = scope(lo, hi);
      expect(canAdvance(from, to, s)).toBe(true);
      advanceAgg(a, s, from, to);
      from = to;
      expect(finishAgg(a, to)).toEqual(aggregate(meta, sp, s, to));
    }
    expect(canAdvance(from, scope(0, 10), s)).toBe(false);
    expect(canAdvance(from, { ...scope(130, 199), key: 'other' }, s)).toBe(false);
  });

  it('keeps the view filters, the group table and the match', () => {
    const team0 = { ...ALL_SCOPE, groupShown: new Int8Array([1, 0]) };
    expect(aggregate(meta, spec({ kind: 'bar', group: 'none' }), [src()], team0).values[0][0]).toBe(50);
    const m2 = { ...ALL_SCOPE, session: 1 };
    expect(aggregate(meta, spec({ kind: 'bar', group: 'none' }), [src()], m2).values[0][0]).toBe(50);
    const kills = { ...ALL_SCOPE, filters: [{ column: 'Event type', kind: 'categories' as const, min: 0, max: 0, mask: new Uint8Array([0, 1, 0]), key: 'k' }] };
    expect(aggregate(meta, spec({ kind: 'bar', group: 'none' }), [src()], kills).values[0][0]).toBe(10);
  });

  it('sorts by value either way and by label', () => {
    expect(sortOrder(['b', 'a', 'c'], [2, 3, 1], 'value-desc')).toEqual([1, 0, 2]);
    expect(sortOrder(['b', 'a', 'c'], [2, 3, 1], 'value-asc')).toEqual([2, 0, 1]);
    expect(sortOrder(['b', 'a', 'c'], [2, 3, 1], 'label')).toEqual([1, 0, 2]);
    expect(sortOrder(['x2', 'x10', 'x1'], [0, 0, 0], 'label')).toEqual([2, 0, 1]);
  });
});
