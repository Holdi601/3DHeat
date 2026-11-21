import { describe, expect, it } from 'vitest';
import type { Dataset } from '../../state/types';
import { activeExchanges, exchangeSpan, findEngagements } from './engagements';

type Row = { p: number; t: number; x: number; ev?: string; other?: string; ammo?: number };

/** Two pilots on two teams: tracks 0 and 2 are A's two lives, track 1 is B. */
function dataset(rows: Row[], withAmmo = false): Dataset {
  rows.sort((a, b) => a.t - b.t);
  const cat = (name: string, values: string[]) => {
    const categories = [...new Set(values)];
    return { name, kind: 'category', data: Uint32Array.from(values.map((v) => categories.indexOf(v))), min: 0, max: categories.length - 1, categories };
  };
  const player = rows.map((r) => (r.p === 1 ? 'B' : 'A'));
  const attrs: unknown[] = [
    cat('player', player),
    cat('life', rows.map((r) => `${r.p}`)),
    cat('event', rows.map((r) => r.ev ?? 'position')),
    cat('other', rows.map((r) => r.other ?? '')),
  ];
  if (withAmmo) attrs.push({ name: 'ammo', kind: 'number', data: Float32Array.from(rows.map((r) => r.ammo ?? 100)), min: 0, max: 100 });
  return {
    count: rows.length,
    px: Float32Array.from(rows.map((r) => r.x)),
    py: new Float32Array(rows.length),
    pz: new Float32Array(rows.length),
    time: Float32Array.from(rows.map((r) => r.t)),
    personId: Uint32Array.from(rows.map((r) => r.p)),
    personLabels: ['A #1', 'B #2', 'A #3'],
    personTeam: Uint16Array.from([0, 1, 0]),
    teamId: null,
    teamLabels: ['1', '2'],
    timeSorted: true,
    sessionId: null,
    sessionLabels: [],
    timeRange: [0, 60],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 1000, maxY: 0, maxZ: 0 },
    yaw: null,
    pitch: null,
    attrs,
  } as unknown as Dataset;
}

function run<T>(g: Generator<unknown, T, void>): T {
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}

/** A at x = 0, B at x = 100 until `leaveAt`, then flying off at 20 units/s. */
function tracks(until: number, leaveAt = Infinity, aUntil = until): Row[] {
  const rows: Row[] = [];
  for (let t = 0; t <= aUntil; t++) rows.push({ p: 0, t, x: 0 });
  for (let t = 0; t <= until; t++) rows.push({ p: 1, t, x: t < leaveAt ? 100 : 100 + 20 * (t - leaveAt) });
  return rows;
}

describe('engagements', () => {
  it('ends an exchange where one side breaks off, and shows the seconds asked around it', () => {
    const rows = tracks(60, 15);
    for (const t of [10, 11, 12, 13, 14]) rows.push({ p: 0, t: t + 0.1, x: 0, ev: 'shot', other: 'B' });
    rows.push({ p: 1, t: 12.2, x: 100, ev: 'shot', other: 'A' });
    const e = run(findEngagements(dataset(rows)));
    expect(e.exchanges.length).toBe(1);
    const x = e.exchanges[0];
    expect(x.t0).toBeCloseTo(10.1);
    expect(x.t1).toBeCloseTo(14.1);
    expect(x.byA).toBe(5);
    expect(x.byB).toBe(1);
    expect(x.reason).toBe('retreat');
    expect(x.by).toBe(1);
    expect(x.hardEnd).toBeLessThan(16);
    const [from, to] = exchangeSpan(x, 5, 30);
    expect(from).toBeCloseTo(5.1);
    expect(to).toBe(x.hardEnd);
    // A short `after` ends it sooner than the retreat would.
    expect(exchangeSpan(x, 0, 0.5)[1]).toBeCloseTo(14.6);
    expect(activeExchanges(e, 8, 5, 30)[0].phase).toBe('lead');
    expect(activeExchanges(e, 12, 5, 30)[0].phase).toBe('fight');
    expect(activeExchanges(e, 14.5, 5, 30)[0]?.phase).toBe('tail');
    expect(activeExchanges(e, 4, 5, 30).length).toBe(0);
    expect(activeExchanges(e, 30, 5, 30).length).toBe(0);
  });

  it('never spans a death and a respawn', () => {
    // A's first life ends at 12 (killed by B); A comes back as track 2 at 13 and the fight goes on.
    const rows = tracks(40, Infinity, 12);
    for (let t = 13; t <= 40; t++) rows.push({ p: 2, t, x: 0 });
    rows.push({ p: 0, t: 10.1, x: 0, ev: 'shot', other: 'B' });
    rows.push({ p: 1, t: 12, x: 100, ev: 'kill', other: 'A' });
    rows.push({ p: 1, t: 14.1, x: 100, ev: 'shot', other: 'A' });
    rows.push({ p: 2, t: 15.1, x: 0, ev: 'shot', other: 'B' });
    const e = run(findEngagements(dataset(rows)));
    expect(e.exchanges.length).toBe(2);
    const [first, second] = e.exchanges;
    expect([first.a, first.b]).toEqual([0, 1]);
    expect(first.reason).toBe('death');
    expect(first.hardEnd).toBeCloseTo(12);
    expect(exchangeSpan(first, 5, 30)[1]).toBeCloseTo(12);
    expect([second.a, second.b]).toEqual([1, 2]);
    // The new life's line starts with the new life, not before it.
    expect(exchangeSpan(second, 30, 5)[0]).toBeCloseTo(13);
  });

  it('ends where one side runs out of ammunition', () => {
    const rows = tracks(60);
    for (const r of rows) if (r.p === 0) r.ammo = r.t >= 16 ? 0 : 50;
    rows.push({ p: 0, t: 10.1, x: 0, ev: 'shot', other: 'B', ammo: 50 });
    rows.push({ p: 0, t: 12.1, x: 0, ev: 'shot', other: 'B', ammo: 50 });
    const e = run(findEngagements(dataset(rows, true)));
    const x = e.exchanges[0];
    expect(x.reason).toBe('ammo');
    expect(x.by).toBe(0);
    expect(x.hardEnd).toBeGreaterThanOrEqual(15.5);
    expect(x.hardEnd).toBeLessThanOrEqual(16.5);
  });

  it('splits a pair\'s fighting by the quiet between', () => {
    const rows = tracks(80);
    for (const t of [5, 6, 40, 41]) rows.push({ p: 0, t: t + 0.1, x: 0, ev: 'shot', other: 'B' });
    const e = run(findEngagements(dataset(rows)));
    expect(e.exchanges.map((x) => Math.round(x.t0))).toEqual([5, 40]);
  });
});
