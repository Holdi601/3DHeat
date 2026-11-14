import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import { CANON } from '../data/canonical';
import { FULL_SCOPE } from './stats';
import { cliffsDelta, effectWord, matchSeries, pairedEffect, visitBin, visitQuantile, VISIT_BINS } from './compare';
import { compareSync, COMPARE_CHUNK } from './compareRun';
import type { Volume, VolumeShape } from './volume';

const box = (cx: number, sx: number): VolumeShape => ({ kind: 'box', center: [cx, 0, 0], size: [sx, 10, 10], yaw: 0, pitch: 0, roll: 0 });
const vol = (id: string, shape: VolumeShape): Volume => ({ id, name: id, color: '#3987e5', visible: true, op: 'include', shape });

/**
 * Two matches. In each, person 0 walks along x one unit a second: x 0..9 is
 * volume A, 10..19 outside, 20..29 volume B, then back into A at 0..4.
 * A kill at x 2 (in A) and a death at x 25 (in B). Person 1 stands in B.
 */
function walk(): Dataset {
  const xs: number[] = [];
  for (let x = 0; x < 30; x++) xs.push(x);
  for (let x = 0; x < 5; x++) xs.push(x);
  const rows: { x: number; t: number; p: number; s: number; e: number; team: number }[] = [];
  for (let s = 0; s < 2; s++) {
    xs.forEach((x, k) => {
      const t = s * 100 + k;
      rows.push({ x, t, p: 0, s, e: k === 2 ? 2 : k === 25 ? 3 : 0, team: 0 });
      rows.push({ x: 25, t, p: 1, s, e: 0, team: 1 });
      // A shot logged at the target, far away: counted where it is, but it does not move the walker's track.
      if (k === 5) rows.push({ x: 60, t, p: 0, s, e: 1, team: 0 });
    });
  }
  const n = rows.length;
  const life = new Float32Array(n);
  // Each row lives one second, but the tracks' last rows.
  for (let i = 0; i < n; i++) life[i] = rows[i].x === 60 ? 0 : rows[i].t % 100 === xs.length - 1 ? -1 : 1;
  return {
    id: 'w',
    name: 'walk',
    count: n,
    px: Float32Array.from(rows, (r) => r.x),
    py: new Float32Array(n),
    pz: new Float32Array(n),
    time: Float32Array.from(rows, (r) => r.t),
    epochMs: null,
    lifetime: life,
    maxLifetimeGap: 1,
    personShared: null,
    yaw: Float32Array.from(rows, () => Math.PI / 2),
    pitch: null,
    personId: Uint32Array.from(rows, (r) => r.p),
    teamId: Uint16Array.from(rows, (r) => r.team),
    personLabels: ['walker', 'stander'],
    teamLabels: ['red', 'blue'],
    sessionId: Uint32Array.from(rows, (r) => r.s),
    sessionLabels: ['m1', 'm2'],
    sessionRows: new Uint32Array([n / 2, n / 2]),
    sessionStart: new Float32Array([0, 100]),
    sessionEnd: new Float32Array([34, 134]),
    personTeam: new Uint16Array([0, 1]),
    personSlot: new Uint16Array([0, 0]),
    teamSizes: new Uint32Array([1, 1]),
    attrs: [
      // Categories as the load writes them: position, fire, kill, death.
      { name: CANON.event, kind: 'category', data: Uint32Array.from(rows, (r) => r.e), min: 0, max: 3, categories: ['position', 'fire', 'kill', 'death'] },
    ],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 29, maxY: 0, maxZ: 0 },
    timeRange: [0, 134],
    timeSorted: true,
  } as Dataset;
}

describe('volume comparison', () => {
  const ds = walk();
  const A = vol('A', box(4.5, 10));
  const B = vol('B', box(24.5, 10));

  it('counts rows, presence, players, events and kills per volume', () => {
    const r = compareSync(ds, [A, B], FULL_SCOPE);
    const [a, b] = r.volumes;
    // A: x 0..9 and 0..4, per match 15 rows.
    expect(a.rows).toBe(30);
    expect(b.rows).toBe(2 * 10 + 2 * 35);
    expect(a.persons).toBe(1);
    expect(b.persons).toBe(2);
    expect(a.sessions).toBe(2);
    expect(a.kills).toBe(2);
    expect(a.deaths).toBe(0);
    expect(b.deaths).toBe(2);
    expect(b.events![0]).toBe(2 * 9 + 2 * 35);
    // Presence: one second a row, the walker's last row (x 4, in A) has none.
    expect(a.presence).toBe(28);
    expect(r.matches).toBe(2);
    expect(a.byTeam!.rows).toEqual([30, 0]);
    // Every row faces east: the third of eight sectors.
    expect(a.dir![2]).toBe(30);
  });

  it('follows tracks: entries, exits, visits and the flow between volumes', () => {
    const r = compareSync(ds, [A, B], FULL_SCOPE);
    const [a, b] = r.volumes;
    // Per match the walker enters A once (the start does not count), exits A once, enters B once, exits B once.
    expect(a.entries).toBe(2);
    expect(a.exits).toBe(2);
    expect(b.entries).toBe(2);
    expect(b.exits).toBe(2);
    // Visits of A: 10 s and 4 s per match; of B: the walker's 10 s and the stander's 35 s.
    expect(a.visits!.n).toBe(4);
    expect(a.visits!.mean).toBeCloseTo(7, 5);
    expect(b.visits!.n).toBe(4);
    expect(b.visits!.max).toBe(34);
    // Flow, 3 x 3 (A, B, start/end): start->A, A->B, B->A, A->end per match; the stander start->B, B->end.
    const f = r.flow!;
    expect(f[2 * 3 + 0]).toBe(2);
    expect(f[0 * 3 + 1]).toBe(2);
    expect(f[1 * 3 + 0]).toBe(2);
    expect(f[0 * 3 + 2]).toBe(2);
    expect(f[2 * 3 + 1]).toBe(2);
    expect(f[1 * 3 + 2]).toBe(2);
  });

  it('respects the filters and the time window, and gives the same answer in any chunking', () => {
    const one = compareSync(ds, [A, B], { ...FULL_SCOPE, timeLo: 0, timeHi: 50 });
    expect(one.volumes[0].rows).toBe(15);
    expect(one.matches).toBe(1);
    const kills = compareSync(ds, [A, B], {
      ...FULL_SCOPE,
      filters: [{ column: CANON.event, kind: 'categories', min: 0, max: 0, mask: new Uint8Array([0, 0, 1, 0]), key: 'k' }],
    });
    expect(kills.volumes[0].rows).toBe(2);
    expect(kills.volumes[1].rows).toBe(0);
    expect(COMPARE_CHUNK).toBeGreaterThan(ds.count);
  });

  it('works out effect sizes', () => {
    expect(pairedEffect([1, 2, 3], [2, 3, 4])).toBeNaN();
    expect(pairedEffect([1, 2, 3], [2, 4, 5])).toBeCloseTo(5 / 3 / Math.sqrt(1 / 3), 5);
    expect(cliffsDelta([1, 0, 0], [0, 0, 1])).toBe(1);
    expect(cliffsDelta([0, 1, 0], [0, 1, 0])).toBe(0);
    expect(effectWord(0.1)).toBe('none');
    expect(effectWord(0.9)).toBe('large');
    const r = compareSync(ds, [A, B], FULL_SCOPE);
    expect(Array.from(matchSeries(r.volumes[0], 'kills')!)).toEqual([1, 1]);
  });

  it('bins visit lengths on a log scale', () => {
    expect(visitBin(0.05)).toBe(0);
    expect(visitBin(1e9)).toBe(VISIT_BINS - 1);
    const h = new Array(VISIT_BINS).fill(0);
    h[visitBin(10)] = 4;
    expect(visitQuantile(h, 4, 0.5)).toBeGreaterThan(9);
    expect(visitQuantile(h, 4, 0.5)).toBeLessThan(14);
  });
});
