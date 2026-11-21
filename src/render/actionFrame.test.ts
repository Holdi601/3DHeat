import { describe, expect, it } from 'vitest';
import { computeActionBounds, EVENT_COLUMN } from './actionFrame';
import { CANON } from '../data/canonical';

/** A fight of `n` rows round (cx, cz) in a square of `r`, plus `far` rows at an airfield 20 km away. */
function battle(n: number, far: number) {
  const px: number[] = [];
  const py: number[] = [];
  const pz: number[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) {
    px.push(1000 + (rnd() - 0.5) * 2000);
    py.push(rnd() * 20);
    pz.push(-500 + (rnd() - 0.5) * 2000);
  }
  for (let i = 0; i < far; i++) {
    px.push(21_000 + rnd() * 300);
    py.push(rnd() < 0.5 ? 3000 + rnd() * 2000 : 10);
    pz.push(15_000 + rnd() * 300);
  }
  const b = { minX: Math.min(...px), maxX: Math.max(...px), minY: Math.min(...py), maxY: Math.max(...py), minZ: Math.min(...pz), maxZ: Math.max(...pz) };
  return { px: Float32Array.from(px), py: Float32Array.from(py), pz: Float32Array.from(pz), b };
}

describe('the action box', () => {
  it('frames the fight, not the airfields kilometres away', () => {
    const { px, py, pz, b } = battle(20_000, 1_000);
    const box = computeActionBounds(px, py, pz, px.length, b);
    expect(box.maxX).toBeLessThan(3_000);
    expect(box.minX).toBeLessThan(100);
    expect(box.maxZ).toBeLessThan(1_000);
    // Its height is the fight's, not the aircraft's above the airfield.
    expect(box.maxY).toBeLessThan(100);
  });

  it('lets the fights decide where the data marks them', () => {
    // Most rows are positions at the airfield; the fights are on the ground far from it.
    const { px, py, pz, b } = battle(2_000, 30_000);
    const codes = new Uint32Array(px.length);
    for (let i = 0; i < 2_000; i++) codes[i] = 1;
    const positions = computeActionBounds(px, py, pz, px.length, b);
    expect(positions.minX).toBeGreaterThan(20_000);
    const fights = computeActionBounds(px, py, pz, px.length, b, { codes, fights: new Set([1]) });
    expect(fights.maxX).toBeLessThan(3_000);
  });

  it('keeps the full ground when the data is spread evenly over it', () => {
    const n = 10_000;
    const px = new Float32Array(n);
    const py = new Float32Array(n);
    const pz = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      px[i] = (i % 100) * 10;
      pz[i] = Math.floor(i / 100) * 10;
      py[i] = i === 0 ? 5000 : 1;
    }
    const b = { minX: 0, maxX: 990, minZ: 0, maxZ: 990, minY: 1, maxY: 5000 };
    const box = computeActionBounds(px, py, pz, n, b);
    expect(box.minX).toBe(0);
    expect(box.maxX).toBe(990);
    // A single row far above does not set the height.
    expect(box.maxY).toBeLessThan(20);
  });

  it('answers the bounds for nothing to go on', () => {
    const b = { minX: 0, maxX: 1, minZ: 0, maxZ: 1, minY: 0, maxY: 1 };
    expect(computeActionBounds(new Float32Array(0), new Float32Array(0), new Float32Array(0), 0, b)).toBe(b);
  });

  it('reads the canonical event column', () => {
    expect(EVENT_COLUMN).toBe(CANON.event);
  });
});
