import { describe, expect, it } from 'vitest';
import { nextExactCap, BudgetController, planFrame } from './sampling';
import { BLOCK_TEX_WIDTH, MAX_PLAN_BLOCKS, MAX_PLAN_SPRITES, SAMPLE_BLOCK } from './types';

const blocks = (plan: ReturnType<typeof planFrame>['plan']) => plan.reduce((n, p) => n + p.blockCount, 0);

describe('the every-row cap', () => {
  const o = { floor: 8e6, ceiling: 268e6, stallMs: 400, easyMs: 150 };

  it('stays put on idle frames, however quick they are', () => {
    let cap = 16e6;
    for (let i = 0; i < 100; i++) cap = nextExactCap(cap, 16, false, false, o);
    expect(cap).toBe(16e6);
  });

  it('halves on one slow frame that drew, down to the floor', () => {
    expect(nextExactCap(64e6, 900, true, false, o)).toBe(32e6);
    expect(nextExactCap(9e6, 900, true, false, o)).toBe(8e6);
  });

  it('grows only when a run starts, up to the ceiling', () => {
    expect(nextExactCap(64e6, 30, true, false, o)).toBe(64e6);
    expect(nextExactCap(64e6, 30, true, true, o)).toBe(80e6);
    expect(nextExactCap(260e6, 30, true, true, o)).toBe(268e6);
  });

  it('uses every row in a run whose cap holds still', () => {
    const rows = 50_000_000;
    const budget = 8 * 1024 * 1024;
    const first = planFrame({ rowLo: 0, rowHi: rows, splatsPerFrame: budget, frameIndex: 0 });
    const frames = Math.ceil(first.candidateRows / first.submittedSprites);
    const seen = new Set<number>();
    for (let f = 0; f < frames * 3; f++) {
      const r = planFrame({ rowLo: 0, rowHi: rows, splatsPerFrame: budget, frameIndex: f });
      for (const p of r.plan) for (let b = 0; b < p.blockCount; b++) seen.add(p.chunk * 1e7 + p.blockStarts[b]);
    }
    expect(seen.size * SAMPLE_BLOCK).toBeGreaterThan(rows * 0.9);
  });
});

describe('the draw plan past 67M sprites', () => {
  it('carries more than the largest load a tab holds', () => {
    expect(MAX_PLAN_SPRITES).toBe(MAX_PLAN_BLOCKS * SAMPLE_BLOCK);
    expect(MAX_PLAN_SPRITES).toBeGreaterThan(264_636_970);
    expect(Number.isInteger(MAX_PLAN_BLOCKS / BLOCK_TEX_WIDTH)).toBe(true);
  });

  it('draws 100M rows in one plan, exactly, at weight one', () => {
    const r = planFrame({ rowLo: 0, rowHi: 100_000_000, splatsPerFrame: 100_000_000, frameIndex: 3 });
    expect(r.exact).toBe(true);
    expect(r.submittedSprites).toBe(100_000_000);
    expect(r.sampleWeight).toBe(1);
  });

  it('draws every row of 264.6M in one plan', () => {
    const r = planFrame({ rowLo: 0, rowHi: 264_636_970, splatsPerFrame: MAX_PLAN_SPRITES, frameIndex: 0 });
    expect(r.exact).toBe(true);
    expect(r.submittedSprites).toBe(264_636_970);
    expect(blocks(r.plan)).toBeLessThanOrEqual(MAX_PLAN_BLOCKS + r.plan.length);
  });

  it('keeps the expected heat when it samples: weight times sprites is the row count', () => {
    for (const budget of [70e6, 85e6, 100e6, 200e6]) {
      const r = planFrame({ rowLo: 5, rowHi: 264_636_970, splatsPerFrame: budget, frameIndex: 7 });
      expect(r.submittedSprites * r.sampleWeight).toBeCloseTo(r.candidateRows, 3);
    }
  });

  it('samples evenly along the rows at 100M, not the early chunks first', () => {
    const r = planFrame({ rowLo: 0, rowHi: 264_636_970, splatsPerFrame: 100e6, frameIndex: 11 });
    const perChunk = r.plan.map((p) => p.blockCount);
    const full = perChunk.slice(0, -1);
    expect(Math.max(...full) - Math.min(...full)).toBeLessThanOrEqual(2);
    expect(r.plan.length).toBeGreaterThan(30);
  });

  it('never plans past the cap, however much is asked', () => {
    const r = planFrame({ rowLo: 0, rowHi: 2_000_000_000, splatsPerFrame: 1e12, frameIndex: 0 });
    expect(r.submittedSprites).toBeLessThanOrEqual(MAX_PLAN_SPRITES);
  });

  it('lets the adaptive budget reach the new cap', () => {
    const c = new BudgetController(MAX_PLAN_SPRITES);
    c.reset(MAX_PLAN_SPRITES);
    expect(c.value).toBe(MAX_PLAN_SPRITES);
  });
});

describe('a sprite as one triangle', () => {
  it('reaches round the whole unit circle the fragment stage keeps', () => {
    const c: Array<[number, number]> = [[0, 2], [-1.7320508, -1], [1.7320508, -1]];
    for (let i = 0; i < 3; i++) {
      const [ax, ay] = c[i];
      const [bx, by] = c[(i + 1) % 3];
      // Distance from the centre to this edge: at least the sprite's radius of 1.
      const d = Math.abs(ax * by - bx * ay) / Math.hypot(bx - ax, by - ay);
      expect(d).toBeGreaterThanOrEqual(0.99999);
    }
  });
});
