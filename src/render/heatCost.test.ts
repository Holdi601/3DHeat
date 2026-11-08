import { describe, expect, it } from 'vitest';
import { HeatLevel, nextHeatCap, planFrame } from './sampling';
import { SAMPLE_BLOCK } from './types';

describe('planFrame run partition', () => {
  it('draws every block exactly once over a run', () => {
    const rows = 1000 * SAMPLE_BLOCK + 17;
    const budget = 70 * SAMPLE_BLOCK;
    const first = planFrame({ rowLo: 0, rowHi: rows, splatsPerFrame: budget, frameIndex: 0, runFrame: 0 });
    const frames = first.frames!;
    expect(frames).toBe(16);
    const seen = new Map<number, number>();
    for (let k = 0; k < frames; k++) {
      const r = planFrame({ rowLo: 0, rowHi: rows, splatsPerFrame: budget, frameIndex: 99 + k, runFrame: k });
      for (const p of r.plan) {
        for (const s of p.blockStarts) {
          const key = p.chunk * 1e9 + s;
          seen.set(key, (seen.get(key) ?? 0) + 1);
        }
      }
    }
    expect([...seen.values()].every((n) => n === 1)).toBe(true);
    // 1001 blocks, the last a partial one; none split here, as the range is one chunk or splits at block edges.
    expect(seen.size).toBeGreaterThanOrEqual(1001);
  });

  it('leaves frames unset without a run', () => {
    const r = planFrame({ rowLo: 0, rowHi: 100 * SAMPLE_BLOCK, splatsPerFrame: 10 * SAMPLE_BLOCK, frameIndex: 3 });
    expect(r.frames).toBeUndefined();
  });
});

describe('HeatLevel', () => {
  it('holds still without a cost reading', () => {
    const l = new HeatLevel();
    for (let i = 0; i < 100; i++) l.update(10, null, 7);
    expect(l.value).toBe(1);
  });

  it('drops the resolution on the frame the sprites grow', () => {
    const l = new HeatLevel();
    expect(l.update(10, null, 7)).toBe(1);
    // Ten times the target radius: three levels down at once, not one per hold.
    expect(l.update(160, null, 7)).toBe(1 / 8);
  });

  it('does not flip on a size sitting at a boundary', () => {
    const l = new HeatLevel();
    const seen = new Set<number>();
    // Around 1.41 x the target, the geometric middle between level 1 and 1/2.
    for (let i = 0; i < 200; i++) seen.add(l.update(16 * Math.SQRT2 * (1 + 0.15 * Math.sin(i)), null, 7));
    expect(seen.size).toBe(1);
  });

  it('trims the texel target while the cost is over budget, inside a dead band', () => {
    const l = new HeatLevel();
    // Within the band nothing moves.
    for (let i = 0; i < 100; i++) l.update(20, 6, 7);
    expect(l.value).toBe(1);
    // Twice the budget, for long enough: the level comes down.
    for (let i = 0; i < 100; i++) l.update(20, 14, 7);
    expect(l.value).toBeLessThan(1);
  });
});

describe('nextHeatCap', () => {
  const o = { floor: 1000, ceiling: 1e9 };
  it('holds inside the band', () => {
    expect(nextHeatCap(1e6, 5, 7, true, true, o)).toBe(1e6);
  });
  it('cuts to nine tenths of the budget at once, to a quarter at most', () => {
    expect(nextHeatCap(1e6, 7 * 1.25, 7, true, false, o)).toBeCloseTo(1e6 * 0.72);
    expect(nextHeatCap(1e6, 7 * 3, 7, true, false, o)).toBeCloseTo(1e6 * 0.3);
    expect(nextHeatCap(1e6, 7 * 10, 7, true, false, o)).toBe(1e6 * 0.25);
  });
  it('grows only as a run starts, and only well under budget', () => {
    expect(nextHeatCap(1e6, 2, 7, true, false, o)).toBe(1e6);
    expect(nextHeatCap(1e6, 3, 7, true, true, o)).toBeCloseTo(1e6 * (7 * 0.7) / 3);
    expect(nextHeatCap(1e6, 1, 7, true, true, o)).toBe(2e6);
  });
  it('ignores frames that drew nothing', () => {
    expect(nextHeatCap(1e6, 50, 7, false, true, o)).toBe(1e6);
  });
});
