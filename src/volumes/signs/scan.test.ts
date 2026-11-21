import { describe, expect, it } from 'vitest';
import { accOf, addAcc, aggregate, ALL_SCOPE, clearAcc, createAgg, finishAgg, rowShown, settlePlayers, shownMask, tableOf, type AggMeta, type AggScope, type AggSource, type RowTable } from '../../charts/aggregate';
import { normalizeSpec, type ChartData, type ChartSpec } from '../../charts/types';
import type { ActiveFilter } from '../../render/types';
import { feedsOf, rangeOf, SignAgg, Slot, updateSigns, type KeptTable } from './scan';

const meta: AggMeta = {
  teams: ['Red', 'Blue', 'Green'],
  persons: ['a', 'b', 'c', 'd', 'e'],
  sessions: ['m1', 'm2'],
  sessionStart: [0, 500],
  timeRange: [0, 1000],
  matchSpan: 500,
  columns: [
    { name: 'Event type', kind: 'category', labels: ['position', 'kill', 'death'], min: 0, max: 2 },
    { name: 'speed', kind: 'number', min: 0, max: 40 },
    { name: 'won', kind: 'number', min: 0, max: 1 },
    { name: 'weapon', kind: 'category', labels: ['rifle', 'smg', 'pistol', 'knife'], min: 0, max: 3 },
  ],
  won: 'won',
  event: 'Event type',
  kill: [1],
  death: [2],
};

/** `n` rows over 1000 s, sorted in time, seeded; speeds in whole numbers so sums stay exact. */
function rows(n: number, seed: number): RowTable {
  let s = seed;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const time = new Float32Array(n);
  const life = new Float32Array(n);
  const team = new Uint16Array(n);
  const person = new Uint32Array(n);
  const session = new Uint32Array(n);
  const ev = new Uint32Array(n);
  const speed = new Float32Array(n);
  const won = new Float32Array(n);
  const weapon = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    time[i] = Math.floor((i * 1000) / n);
    life[i] = rnd() < 0.1 ? -1 : 1 + Math.floor(rnd() * 20);
    team[i] = Math.floor(rnd() * 3);
    person[i] = Math.floor(rnd() * 5);
    session[i] = time[i] >= 500 ? 1 : 0;
    const r = rnd();
    ev[i] = r < 0.05 ? 1 : r < 0.08 ? 2 : 0;
    speed[i] = Math.floor(rnd() * 40);
    won[i] = team[i] === 0 ? 1 : team[i] === 1 ? 0 : NaN;
    weapon[i] = Math.floor(rnd() * 4);
  }
  return tableOf({ time, life, team, person, session, cols: { 'Event type': ev, speed, won, weapon } });
}

function kept(t: RowTable, member: Uint32Array | null): KeptTable {
  let maxLife = 0;
  for (let i = 0; i < t.n; i++) if (t.life![i] > maxLife) maxLife = t.life![i];
  return { t, member, maxLife };
}

const cat = (column: string, allowed: number[], size: number): ActiveFilter => {
  const mask = new Uint8Array(size);
  for (const a of allowed) mask[a] = 1;
  return { kind: 'categories', column, min: 0, max: 0, mask, key: `${column}=${allowed.join(',')}` };
};
const range = (column: string, min: number, max: number): ActiveFilter => ({ kind: 'range', column, min, max, mask: null, key: `${column}:${min}-${max}` });

/** A scope with its key made from its rows' rules, as `aggScopes` does. */
function sc(p: Partial<AggScope>): AggScope {
  const s = { ...ALL_SCOPE, minutes: 10, ...p };
  s.key = [s.defaultLifetime, s.lifetimeNow !== null ? 'L' : 'W', s.filters.map((f) => f.key).join(';'), s.groupShown ? Array.from(s.groupShown).join('') : '', s.session].join('|');
  return s;
}

/** The same chart counted the plain way: every row of the sign's sources tested against the scope. */
function brute(spec: ChartSpec, inside: KeptTable, rest: KeptTable, bit: number, scope: AggScope): ChartData {
  const srcs: AggSource[] =
    spec.diff === 'inout'
      ? [
          { table: inside.t, side: 0, skip: null, member: inside.member, bit },
          { table: inside.t, side: 1, skip: null, member: inside.member, bit, outside: true },
          { table: rest.t, side: 1, skip: null },
        ]
      : [{ table: inside.t, side: -1, skip: null, member: inside.member, bit }];
  return aggregate(meta, spec, srcs, scope);
}

/** Equal, sums of whole numbers exactly and the rest to rounding. */
function same(a: ChartData, b: ChartData): void {
  expect(a.groups.map((g) => g.key)).toEqual(b.groups.map((g) => g.key));
  expect(a.series.map((g) => g.key)).toEqual(b.series.map((g) => g.key));
  expect(a.rows).toBe(b.rows);
  a.values.forEach((r, s) => r.forEach((v, g) => (Number.isFinite(v) ? expect(v).toBeCloseTo(b.values[s][g], 9) : expect(String(v)).toBe(String(b.values[s][g])))));
}

describe('shared scans for the chart signs', () => {
  it('the mask a column at a time is rowShown for every row', () => {
    const t = rows(3000, 3);
    const scopes = [
      sc({ timeLo: 100, timeHi: 700 }),
      sc({ lifetimeNow: 400, defaultLifetime: 5 }),
      sc({ filters: [cat('weapon', [0, 2], 4), range('speed', 5, 25)], groupShown: new Int8Array([1, 0, 1]), session: 1 }),
      sc({ filters: [range('missing', 0, 1)] }),
    ];
    for (const s of scopes) {
      const out = new Uint8Array(t.n + 10);
      shownMask(t, s, 0, t.n, out, true);
      for (let i = 0; i < t.n; i++) expect(out[i]).toBe(rowShown(t, i, s) ? 1 : 0);
      // In blocks, written at an offset.
      const blk = new Uint8Array(500);
      shownMask(t, s, 1000, 1500, blk, true, 1000);
      for (let i = 1000; i < 1500; i++) expect(blk[i - 1000]).toBe(out[i]);
    }
  });

  it('a lifetime window can only show rows from its longest lifetime back', () => {
    const k = kept(rows(2000, 5), null);
    const s = sc({ lifetimeNow: 600, defaultLifetime: 3 });
    const [lo, hi] = rangeOf(k, s);
    for (let i = 0; i < k.t.n; i++) if (i < lo || i >= hi) expect(rowShown(k.t, i, s)).toBe(false);
  });

  it('every sign agrees with a fresh count through filter changes, windows and lifetimes, mostly by folding changes', () => {
    const t = rows(6000, 11);
    const r = rows(4000, 12);
    let seed = 99;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const member = new Uint32Array(t.n);
    for (let i = 0; i < t.n; i++) member[i] = 1 + Math.floor(rnd() * 7);
    const inside = kept(t, member);
    const rest = kept(r, null);
    const slotIn = new Slot(inside);
    const slotRest = new Slot(rest);
    const specs = [
      normalizeSpec({ kind: 'bar', group: 'team' }),
      normalizeSpec({ kind: 'line', diff: 'inout', measure: { kind: 'share' } }),
      normalizeSpec({ kind: 'tiles', measure: { kind: 'count', column: 'speed' } }),
      normalizeSpec({ kind: 'histogram', x: 'speed', measure: { kind: 'count' } }),
      normalizeSpec({ kind: 'bar', group: 'col:weapon', measure: { kind: 'median', column: 'speed' } }),
      normalizeSpec({ kind: 'stacked', group: 'person', stack: 'col:weapon', diff: 'none' }),
    ];
    const signs = specs.flatMap((spec, k) => [1, 2, 4].map((bit) => ({ spec, bit, agg: new SignAgg(meta, spec), k })));
    const steps: AggScope[] = [
      sc({}),
      sc({ filters: [cat('weapon', [0, 1, 2], 4)] }),
      sc({ filters: [cat('weapon', [0, 1, 2], 4), range('speed', 6, 30)] }),
      sc({ filters: [cat('weapon', [0, 1, 2], 4), range('speed', 6, 30)], groupShown: new Int8Array([1, 1, 0]) }),
      sc({ filters: [] }),
      sc({ timeLo: 0, timeHi: 120 }),
      sc({ timeLo: 30, timeHi: 150 }),
      sc({ timeLo: 90, timeHi: 210 }),
      sc({ timeLo: 400, timeHi: 520 }),
      sc({ timeLo: 380, timeHi: 500 }),
      sc({ timeLo: 380, timeHi: 500, session: 0 }),
      sc({ lifetimeNow: 300, defaultLifetime: 4 }),
      sc({ lifetimeNow: 302.5, defaultLifetime: 4 }),
      sc({ lifetimeNow: 700, defaultLifetime: 4 }),
      sc({ timeLo: -Infinity, timeHi: 640, filters: [cat('Event type', [1, 2], 3)] }),
      sc({}),
    ];
    const how: Record<string, number> = { same: 0, delta: 0, full: 0, cached: 0 };
    for (const scope of steps) {
      slotIn.update(scope);
      slotRest.update(scope);
      // The signs of one spec on the three volumes folded together.
      for (let k = 0; k < specs.length; k++) updateSigns(signs.filter((s) => s.k === k).map((s) => ({ sign: s.agg, feeds: feedsOf(s.spec, s.bit, slotIn, slotRest) })));
      for (const s of signs) {
        how[s.agg.last.how]++;
        same(finishAgg(s.agg.agg!, scope), brute(s.spec, inside, rest, s.bit, scope));
      }
    }
    // Most of the moves were folds of what changed, not new counts; the last scope, seen before, came from the cache.
    expect(how.delta).toBeGreaterThan(how.full);
    expect(how.cached).toBeGreaterThan(0);
  });

  it('a sign one change behind folds it; further behind, it starts over', () => {
    const t = rows(5000, 21);
    const member = new Uint32Array(t.n).fill(1);
    const inside = kept(t, member);
    const slot = new Slot(inside);
    const spec = normalizeSpec({ kind: 'bar', group: 'col:weapon' });
    const a = new SignAgg(meta, spec);
    slot.update(sc({ timeLo: 0, timeHi: 100 }));
    a.update(feedsOf(spec, 1, slot, null));
    expect(a.last.how).toBe('full');
    const s1 = sc({ timeLo: 10, timeHi: 110 });
    slot.update(s1);
    a.update(feedsOf(spec, 1, slot, null));
    expect(a.last.how).toBe('delta');
    same(finishAgg(a.agg!, s1), brute(spec, inside, inside, 1, s1));
    slot.update(sc({ timeLo: 20, timeHi: 120 }));
    const s3 = sc({ timeLo: 30, timeHi: 130 });
    slot.update(s3);
    a.update(feedsOf(spec, 1, slot, null));
    expect(a.last.how).toBe('full');
    same(finishAgg(a.agg!, s3), brute(spec, inside, inside, 1, s3));
    // A jump across the data and a filter: right either way.
    const s5 = sc({ timeLo: 900, timeHi: 1000, filters: [cat('weapon', [1], 4)] });
    slot.update(s5);
    a.update(feedsOf(spec, 1, slot, null));
    same(finishAgg(a.agg!, s5), brute(spec, inside, inside, 1, s5));
    expect(a.update(feedsOf(spec, 1, slot, null))).toBe(false);
    // Read from another slot (the "up to now" one): it starts over there.
    const up = new Slot(inside);
    const s6 = sc({ timeLo: -Infinity, timeHi: 950 });
    up.update(s6);
    a.update(feedsOf(spec, 1, up, null));
    expect(a.last.how).toBe('full');
    same(finishAgg(a.agg!, s6), brute(spec, inside, inside, 1, s6));
    // A slot whose history was let go: a sign behind it starts over too.
    up.update(sc({ timeLo: -Infinity, timeHi: 960 }));
    up.changed = null;
    a.update(feedsOf(spec, 1, up, null));
    expect(a.last.how).toBe('full');
  });

  it('a window sliding over sorted rows touches only the rows it gained and lost', () => {
    const t = rows(100_000, 31);
    const slot = new Slot(kept(t, new Uint32Array(t.n).fill(1)));
    slot.update(sc({ timeLo: 100, timeHi: 220, filters: [range('speed', 0, 20)] }));
    slot.update(sc({ timeLo: 101, timeHi: 221, filters: [range('speed', 0, 20)] }));
    expect(slot.touched).toBeLessThan(500);
    // A filter change looks at the window's rows only, not every row.
    slot.update(sc({ timeLo: 101, timeHi: 221, filters: [range('speed', 0, 10)] }));
    expect(slot.touched).toBeLessThan(13_000);
  });

  it('shares of the rows counted apart add up to the whole chart', () => {
    const t = rows(5000, 41);
    // Three row workers, every third block of 500 rows each, as the page deals chunks out.
    const shard = (k: number): RowTable => {
      const pick: number[] = [];
      for (let i = 0; i < t.n; i++) if (Math.floor(i / 500) % 3 === k) pick.push(i);
      const take = <A extends Float32Array | Uint32Array | Uint16Array>(a: A) => a.constructor === Float32Array ? Float32Array.from(pick, (i) => a[i]) : a.constructor === Uint16Array ? Uint16Array.from(pick, (i) => a[i]) : Uint32Array.from(pick, (i) => a[i]);
      const cols: RowTable['cols'] = {};
      for (const [c, d] of Object.entries(t.cols)) cols[c] = take(d) as Float32Array | Uint32Array;
      return tableOf({ time: take(t.time!) as Float32Array, life: take(t.life!) as Float32Array, team: take(t.team!) as Uint16Array, person: take(t.person!) as Uint32Array, session: take(t.session!) as Uint32Array, cols });
    };
    const shards = [0, 1, 2].map(shard);
    const scope = sc({ timeLo: 50, timeHi: 900, filters: [cat('weapon', [0, 1, 3], 4)] });
    for (const spec of [normalizeSpec({ kind: 'tiles', measure: { kind: 'count', column: 'speed' } }), normalizeSpec({ kind: 'bar', group: 'col:weapon', measure: { kind: 'pct', column: 'speed', p: 75 } }), normalizeSpec({ kind: 'line', diff: 'outcome' })]) {
      const whole = aggregate(meta, spec, [{ table: t, side: -1, skip: null }], scope);
      const merged = createAgg(meta, spec);
      clearAcc(merged);
      for (const st of shards) {
        // The share folded over this worker's shown rows, its accumulators copied out and added.
        const sh = new Slot(kept(st, null));
        sh.update(scope);
        const one = new SignAgg(meta, spec);
        one.update([{ slot: sh, side: -1, bit: 0, outside: false }]);
        addAcc(merged, accOf(one.agg!));
      }
      settlePlayers(merged);
      same(finishAgg(merged, scope), whole);
    }
  });
});
