import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { drainSteps, fixedHeightsSteps, fixesOf, groundChecksSteps, groundPersons, heightAt, heightGridSteps, MAX_SPREAD, MIN_SHIFT, SNAP_OVER, SNAP_UNDER, snappedHeightsSteps, surfaceAt, surfaceGridSteps } from './groundFit';

/** A rolling ground over 0..400 m: a grid of corners 2 m apart, six floats each (position, normal), two triangles a cell. */
function level(): { vertices: Float32Array; indices: Uint32Array; ground: (x: number, z: number) => number } {
  const ground = (x: number, z: number) => 5 + 3 * Math.sin(x / 40) + 2 * Math.cos(z / 55);
  const n = 201;
  const vertices = new Float32Array(n * n * 6);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const o = (i * n + j) * 6;
      vertices[o] = j * 2;
      vertices[o + 1] = ground(j * 2, i * 2);
      vertices[o + 2] = i * 2;
      vertices[o + 4] = 1;
    }
  const idx: number[] = [];
  for (let i = 0; i + 1 < n; i++)
    for (let j = 0; j + 1 < n; j++) {
      const a = i * n + j;
      idx.push(a, a + 1, a + n, a + 1, a + n + 1, a + n);
    }
  return { vertices, indices: Uint32Array.from(idx), ground };
}

/**
 * Two matches, each with tanks driving about and an aircraft overhead; the
 * tanks of match B all sit `off` metres under the ground (a wrong height
 * offset in its conversion), with a few centimetres of jitter.
 */
function matches(ground: (x: number, z: number) => number, off: number): Dataset {
  const rows: { x: number; y: number; z: number; p: number; s: number }[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let s = 0; s < 2; s++)
    for (let p = 0; p < 4; p++)
      for (let k = 0; k < 400; k++) {
        const x = 20 + rnd() * 360;
        const z = 20 + rnd() * 360;
        const person = s * 4 + p;
        const air = p === 3;
        const y = air ? 600 + rnd() * 50 : ground(x, z) + 0.6 + (rnd() - 0.5) * 0.1 + (s === 1 ? -off : 0);
        rows.push({ x, y, z, p: person, s });
      }
  const n = rows.length;
  const kinds = ['tank', 'aircraft'];
  const kind: AttributeColumn = { name: 'kind', kind: 'category', data: Uint32Array.from(rows, (r) => (r.p % 4 === 3 ? 1 : 0)), categories: kinds } as unknown as AttributeColumn;
  return {
    count: n,
    px: Float32Array.from(rows, (r) => r.x),
    py: Float32Array.from(rows, (r) => r.y),
    pz: Float32Array.from(rows, (r) => r.z),
    time: Float32Array.from(rows, (_, i) => i),
    personId: Uint32Array.from(rows, (r) => r.p),
    personLabels: Array.from({ length: 8 }, (_, i) => `u${i}`),
    sessionId: Uint32Array.from(rows, (r) => r.s),
    sessionLabels: ['match A', 'match B'],
    attrs: [kind],
    bounds: { minX: 0, maxX: 400, minY: -20, maxY: 700, minZ: 0, maxZ: 400 },
    name: 'two matches',
  } as unknown as Dataset;
}

describe('ground units on the level', () => {
  const lv = level();
  const grid = drainSteps(heightGridSteps(lv.vertices, lv.indices, { minX: 0, maxX: 400, minZ: 0, maxZ: 400 }, 2))!;

  it('reads the level ground from its triangles', () => {
    expect(heightAt(grid, 100, 100)).toBeCloseTo(lv.ground(100, 100), 1);
    expect(Number.isNaN(heightAt(grid, -50, 10))).toBe(true);
  });

  it('tells ground units from aircraft by their kind', () => {
    const d = matches(lv.ground, 9.8);
    expect([...groundPersons(d)!]).toEqual([1, 1, 1, 0, 1, 1, 1, 0]);
  });

  it('puts the median height above the ground of a right match at 0-2 m, and finds the one off by a height', () => {
    const d = matches(lv.ground, 9.8);
    const checks = drainSteps(groundChecksSteps(d, grid, 1, groundPersons(d)!));
    expect(checks[0].median).toBeGreaterThanOrEqual(0);
    expect(checks[0].median).toBeLessThanOrEqual(2);
    expect(checks[1].median).toBeCloseTo(0.6 - 9.8, 0);
    expect(checks[1].spread).toBeLessThan(MAX_SPREAD);
    const fixes = fixesOf(checks);
    expect(fixes).toHaveLength(1);
    expect(fixes[0].label).toBe('match B');
    expect(fixes[0].metres).toBeCloseTo(9.2, 0);
  });

  it('moves only the ground units of the match off, then finds it on the ground', () => {
    const d = matches(lv.ground, 9.8);
    const ground = groundPersons(d)!;
    const fixes = fixesOf(drainSteps(groundChecksSteps(d, grid, 1, ground)));
    const py = drainSteps(fixedHeightsSteps(d, fixes, 1, ground));
    for (let r = 0; r < d.count; r++) {
      const moved = d.sessionId![r] === 1 && ground[d.personId![r]] === 1;
      expect(py[r] - d.py[r]).toBeCloseTo(moved ? fixes[0].metres : 0, 3);
    }
    const after = drainSteps(groundChecksSteps({ ...d, py }, grid, 1, ground));
    for (const c of after) {
      expect(c.median).toBeGreaterThanOrEqual(0);
      expect(c.median).toBeLessThanOrEqual(2);
    }
    expect(fixesOf(after)).toEqual([]);
  });

  it('leaves a match alone that is near the ground, or whose units do not sit off alike', () => {
    expect(fixesOf([{ session: 0, label: 'a', median: MIN_SHIFT - 0.1, spread: 0.1, samples: 5000 }])).toEqual([]);
    // Bridges, rivers, a hill the level lacks: off by different heights, not one number.
    expect(fixesOf([{ session: 0, label: 'b', median: -6, spread: MAX_SPREAD + 4, samples: 5000 }])).toEqual([]);
    expect(fixesOf([{ session: 0, label: 'c', median: -6, spread: 0.2, samples: 20 }])).toEqual([]);
  });
});

describe('ground units on the ground as drawn', () => {
  it('samples the drawn triangles themselves, not a mean of corners', () => {
    const lv = level();
    const g = drainSteps(surfaceGridSteps(lv.vertices, lv.indices, { minX: 0, maxX: 400, minZ: 0, maxZ: 400 }, 1))!;
    for (const [x, z] of [[33.3, 71.9], [250.5, 12.2], [399, 399]]) expect(Math.abs(surfaceAt(g, x, z) - lv.ground(x, z))).toBeLessThan(0.05);
  });

  it('puts a vehicle a little under or over the ground on it, and leaves bridges, tunnels and aircraft where they are', () => {
    const lv = level();
    const g = drainSteps(surfaceGridSteps(lv.vertices, lv.indices, { minX: 0, maxX: 400, minZ: 0, maxZ: 400 }, 1))!;
    const d = matches(lv.ground, 0);
    const want = [-1.5, 1.2, -SNAP_UNDER - 2, SNAP_OVER + 4];
    // Four tank rows: sunk, hovering, deep in a tunnel, up on a bridge.
    const rows = [0, 1, 2, 3];
    for (const [i, r] of rows.entries()) d.py[r] = lv.ground(d.px[r], d.pz[r]) + want[i];
    const ground = groundPersons(d)!;
    const out = drainSteps(snappedHeightsSteps(d, g, 1, ground))!;
    expect(Math.abs(out.py[0] - lv.ground(d.px[0], d.pz[0]))).toBeLessThan(0.05);
    expect(Math.abs(out.py[1] - lv.ground(d.px[1], d.pz[1]))).toBeLessThan(0.05);
    expect(out.py[2]).toBe(d.py[2]);
    expect(out.py[3]).toBe(d.py[3]);
    // The aircraft's rows are untouched.
    for (let r = 0; r < d.count; r++) if (d.personId![r] % 4 === 3) expect(out.py[r]).toBe(d.py[r]);
    expect(out.snap.most).toBeLessThanOrEqual(SNAP_UNDER);
  });

  it('takes a parachuting pilot for something in the air, not a ground unit', () => {
    const d = matches(level().ground, 0);
    const kind = d.attrs[0];
    kind.categories = ['Ground+Light+Human+Air+Parachutist', 'Air+FixedWing'];
    expect(groundPersons(d)).toBeNull();
    kind.categories = ['Ground+Heavy+Armor+Vehicle+Tank', 'Air+FixedWing'];
    expect(groundPersons(d)![0]).toBe(1);
  });
});
