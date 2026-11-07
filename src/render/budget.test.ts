import { describe, expect, it } from 'vitest';
import { checkFit, detectBudgets, estimateFootprint } from '../data/memory';
import { useStore } from '../state/store';
import { emptyColumnMapping } from '../state/types';
import { effectiveGpuBudget } from './budget';
import { BudgetController } from './sampling';

/**
 * The controller is a feedback loop, so testing it means closing the loop: give
 * it a cost model, let it settle, and check where it settles.
 *
 * The models matter more than the assertions. Two of them are the two regimes the
 * controller has to tell apart without any per-pass timing to help it — a frame
 * whose cost is the sprites, and a frame whose cost is the geometry — and getting
 * the second one wrong is what turned a moving camera into scattered dots.
 */

const MIN = 64 * 1024;
const MAX = 64 * 1024 * 1024;
const TARGET = 1000 / 60;

/** Run the loop to steady state under a cost model. */
function settle(
  cost: (budget: number, resolution: number) => number,
  opts: { initial?: number; frames?: number; target?: number } = {},
) {
  const c = new BudgetController(opts.initial ?? 4 * 1024 * 1024, MIN, MAX);
  const target = opts.target ?? TARGET;
  let ms = cost(c.value, c.resolutionScale);
  for (let i = 0; i < (opts.frames ?? 400); i++) {
    // Smoothed, as the engine feeds it: a raw per-frame number would let the
    // loop chase noise that the real one never sees.
    ms += (cost(c.value, c.resolutionScale) - ms) * 0.25;
    c.update(ms, target);
  }
  return { budget: c.value, resolution: c.resolutionScale, ms, climbing: c.climbing };
}

describe('BudgetController — a frame the sprites do not own', () => {
  /**
   * The measured case. A 1.4M-triangle level costs 180ms on its own and sprites
   * are free next to it: 64K to 16M sprites moved the frame from 191ms to 188ms.
   */
  const geometryBound = (budget: number) => 180 + budget / 1e7;

  it('does not sit at the floor when the floor buys nothing', () => {
    // The bug. Cutting to the floor gave up 214 out of every 215 rows and saved
    // three milliseconds out of a hundred and ninety.
    const out = settle(geometryBound);
    expect(out.budget).toBeGreaterThan(MIN * 50);
  });

  it('climbs far enough to draw a whole large dataset in one frame', () => {
    // What makes a moving camera look like a still one: one frame that covers
    // every candidate row, so there is nothing left to accumulate.
    const out = settle(geometryBound);
    expect(out.budget).toBeGreaterThanOrEqual(14_000_000);
  });

  it('gives the heat resolution back too', () => {
    // A quarter-resolution heat buffer was the other half of the damage, and for
    // the same reason: if sprites are free, pixels are free.
    const out = settle(geometryBound);
    expect(out.resolution).toBe(1);
  });

  it('says it is holding the budget up rather than hiding it', () => {
    expect(settle(geometryBound).climbing).toBe(true);
  });

  it('gets there from the floor, not only from a high start', () => {
    // The state a user is actually in: already starved by the old behaviour.
    const out = settle(geometryBound, { initial: MIN });
    expect(out.budget).toBeGreaterThan(MIN * 50);
  });

  it('climbs even when the heat resolution never reaches its own floor', () => {
    // The case the first version of this missed. It only allowed a climb once
    // *both* stages had bottomed out, and with a frame time that wobbles at all
    // the resolution settles a few sixteenths above its floor and stays there —
    // so the condition was unreachable in precisely the situation it was written
    // for. Measured against the real level it sat at 31% resolution, at the
    // sprite floor, showing one row in 214, indefinitely.
    let n = 0;
    const wobbling = (budget: number) => {
      // Deterministic wobble, so a failure reproduces.
      n++;
      return 180 + Math.sin(n * 0.7) * 12 + budget / 1e7;
    };
    const out = settle(wobbling, { initial: MIN, frames: 600 });
    expect(out.resolution).toBeGreaterThan(0.25);
    expect(out.budget).toBeGreaterThan(MIN * 50);
  });

  it('waits before climbing, so stage two gets its chance', () => {
    // The wait is what protects the case where the heat genuinely is the cost.
    // Climbing on the first slow frame at the floor would pre-empt the
    // resolution stage entirely.
    const c = new BudgetController(MIN, MIN, MAX);
    for (let i = 0; i < 8; i++) c.update(180, TARGET);
    expect(c.climbing).toBe(false);
  });
});

describe('BudgetController — a frame the sprites do own', () => {
  /** Overdraw: every sprite costs, so cutting them is exactly the right move. */
  const spriteBound = (budget: number, resolution: number) => 2 + (budget / 1e6) * 8 * resolution;

  it('cuts the budget to hit the target', () => {
    const out = settle(spriteBound);
    expect(out.ms).toBeLessThan(TARGET * 1.25);
    expect(out.budget).toBeLessThan(4 * 1024 * 1024);
  });

  it('keeps full resolution when the sprite count alone is enough', () => {
    // Stage two must stay out of the way of a load stage one can handle.
    expect(settle(spriteBound).resolution).toBe(1);
  });

  it('does not climb, because cutting is working', () => {
    expect(settle(spriteBound).climbing).toBe(false);
  });

  it('never overshoots the ceiling on the way up', () => {
    // What the smoke suite caught. The climb stepped every single update while
    // its evidence — an exponential average with a tenth weight on the newest
    // frame — took a dozen frames to move, so it multiplied the budget a
    // thousandfold and hit the ceiling before the first feedback arrived, in a
    // scene built to be sprite-bound. Stepping and then waiting is the fix.
    const bigRadius = (budget: number, resolution: number) =>
      12 + (budget / 1e6) * 45 * resolution;
    let seen = 0;
    const c = new BudgetController(32 * 1024 * 1024, MIN, MAX);
    let ms = bigRadius(c.value, c.resolutionScale);
    for (let i = 0; i < 1200; i++) {
      ms += (bigRadius(c.value, c.resolutionScale) - ms) * 0.1;
      c.update(ms, TARGET);
      seen = Math.max(seen, c.value);
    }
    expect(seen).toBeLessThanOrEqual(32 * 1024 * 1024);
  });

  it('abandons a climb if raising the budget does make the frame worse', () => {
    // The guard on the new behaviour. A scene that is both heavy *and*
    // sprite-bound must not be allowed to climb away — the controller has to
    // notice and go back to cutting.
    const both = (budget: number) => 40 + (budget / 1e6) * 30;
    const out = settle(both, { initial: MIN });
    expect(out.ms).toBeLessThan(40 * 3);
    expect(out.budget).toBeLessThan(4 * 1024 * 1024);
  });
});

describe('BudgetController — the resolution stage', () => {
  /**
   * A huge radius: cost is dominated by fragments, so the sprite count barely
   * matters but the buffer size matters a great deal. This is what stage two was
   * written for, and it has to keep working.
   */
  const fragmentBound = (budget: number, resolution: number) =>
    2 + resolution * resolution * 200 + budget / 1e8;

  it('drops resolution when the sprite count cannot help', () => {
    const out = settle(fragmentBound);
    expect(out.resolution).toBeLessThan(1);
  });

  it('quantises to sixteenths', () => {
    // A continuously drifting value reallocates the heat buffer every frame and
    // discards the accumulation with it, so convergence would never happen.
    const out = settle(fragmentBound);
    expect(out.resolution * 16).toBeCloseTo(Math.round(out.resolution * 16), 9);
  });

  it('restores resolution when the load lifts', () => {
    const c = new BudgetController(1024 * 1024, MIN, MAX);
    let ms = 200;
    for (let i = 0; i < 300; i++) {
      ms += (2 + c.resolutionScale ** 2 * 200 - ms) * 0.25;
      c.update(ms, TARGET);
    }
    expect(c.resolutionScale).toBeLessThan(1);
    // Now the level is hidden and everything is cheap.
    for (let i = 0; i < 400; i++) c.update(4, TARGET);
    expect(c.resolutionScale).toBe(1);
  });
});

describe('BudgetController — at the display limit', () => {
  /** With vsync a frame takes a whole number of display intervals, never less than one. */
  const vsync = (ms: number) => Math.max(1, Math.ceil(ms / TARGET - 1e-9)) * TARGET;

  it('wins back what a passing stall took, though the frame never beats the target', () => {
    // The bug: a 60fps target on a 60Hz screen. One stall cut the budget and the
    // resolution, and since a vsynced frame never comes in under the target the
    // controller never saw headroom - the heat stayed at a quarter resolution.
    const c = new BudgetController(4 * 1024 * 1024, MIN, MAX);
    let ms = TARGET;
    // The stall: a spell where every pixel of heat is expensive (a reload, tiles
    // streaming in), long enough to cut both stages.
    for (let i = 0; i < 300; i++) {
      ms += (2 + c.resolutionScale ** 2 * 200 - ms) * 0.25;
      c.update(ms, TARGET);
    }
    expect(c.resolutionScale).toBeLessThan(0.75);
    const cheap = (budget: number, resolution: number) => vsync(3 + (budget / 1e7) * resolution);
    for (let i = 0; i < 60 * 60; i++) {
      ms += (cheap(c.value, c.resolutionScale) - ms) * 0.1;
      c.update(ms, TARGET);
    }
    expect(c.resolutionScale).toBe(1);
    expect(c.value).toBeGreaterThan(4 * 1024 * 1024);
  });

  it('probes a scene at its limit only now and then', () => {
    // Every probe there drops frames, so the wait between them has to grow.
    const tight = (budget: number, resolution: number) => vsync(2 + (budget / 1e6) * 8 * resolution);
    const c = new BudgetController(1024 * 1024, MIN, MAX);
    let ms = TARGET;
    let slipped = 0;
    let prev = TARGET;
    for (let i = 0; i < 60 * 60 * 5; i++) {
      const raw = tight(c.value, c.resolutionScale);
      if (raw > TARGET * 1.5 && prev <= TARGET * 1.5) slipped++;
      prev = raw;
      ms += (raw - ms) * 0.1;
      c.update(ms, TARGET);
    }
    // Five minutes: a handful of dips, not one every second and a half.
    expect(slipped).toBeLessThanOrEqual(12);
    expect(ms).toBeLessThan(TARGET * 1.25);
  });
});

describe('BudgetController — housekeeping', () => {
  it('respects its bounds', () => {
    const c = new BudgetController(1024 * 1024, MIN, MAX);
    for (let i = 0; i < 500; i++) c.update(500, TARGET);
    expect(c.value).toBeGreaterThanOrEqual(MIN);
    for (let i = 0; i < 500; i++) c.update(1, TARGET);
    expect(c.value).toBeLessThanOrEqual(MAX);
  });

  it('ignores a nonsense frame time', () => {
    const c = new BudgetController(1024 * 1024, MIN, MAX);
    const before = c.value;
    c.update(0, TARGET);
    c.update(-5, TARGET);
    expect(c.value).toBe(before);
  });

  it('reset clears the climb, not just the number', () => {
    // Otherwise a controller that had concluded "sprites are free" would carry
    // that conclusion into a completely different scene.
    const c = new BudgetController(MIN, MIN, MAX);
    for (let i = 0; i < 200; i++) c.update(180, TARGET);
    expect(c.climbing).toBe(true);
    c.reset(1024 * 1024);
    expect(c.climbing).toBe(false);
    expect(c.resolutionScale).toBe(1);
    expect(c.value).toBe(1024 * 1024);
  });

  it('does not climb for a frame that is only just missing target', () => {
    // Ordinary jitter around a nearly-met target must not be read as proof that
    // cutting is useless, or the controller would oscillate on healthy scenes.
    const c = new BudgetController(MIN, MIN, MAX);
    for (let i = 0; i < 200; i++) c.update(TARGET * 1.15, TARGET);
    expect(c.climbing).toBe(false);
  });
});

describe('the GPU budget a load is checked against is the one it is uploaded with', () => {
  const GIB = 1024 ** 3;

  it('applies a budget above the detected figure, up to the ceiling', () => {
    expect(effectiveGpuBudget(6 * GIB, 16 * GIB)).toBe(6 * GIB);
    expect(effectiveGpuBudget(40 * GIB, 16 * GIB)).toBe(16 * GIB);
    // Below the slider's floor too: the console uses that to exercise residency.
    expect(effectiveGpuBudget(40 * 1024 * 1024, 16 * GIB)).toBe(40 * 1024 * 1024);
  });

  it('lets a raised budget reach the renderer, not only the fit check', () => {
    // The bug: the store handed the engine the detected figure as the limit, so
    // a load the check approved at 6GB was uploaded at 2GB and the rest of it sat
    // "Not resident".
    const detected = detectBudgets(null);
    expect(detected.gpuCeiling).toBeGreaterThan(6 * GIB);
    expect(detected.gpuMax).toBeLessThan(6 * GIB);
    useStore.getState().setBudgets({ ...detected, gpu: 6 * GIB });
    const { budget, budgets } = useStore.getState();
    const uploaded = effectiveGpuBudget(budget.gpuBudgetBytes, budget.gpuBudgetMax);
    expect(uploaded).toBe(6 * GIB);

    // A load needing 5GB of GPU memory: past the detected figure, inside the
    // chosen one. The check passes it, and the renderer's budget holds all of it.
    const fp = estimateFootprint({ ...emptyColumnMapping(), x: 'x', y: 'y', z: 'z' }, 1, 1);
    const rows = Math.floor((5 * GIB) / fp.gpuPerRow);
    const big = estimateFootprint({ ...emptyColumnMapping(), x: 'x', y: 'y', z: 'z' }, rows, 1);
    expect(big.gpuBytes).toBeGreaterThan(detected.gpuMax);
    const fit = checkFit(big, { ...budgets, ram: 1024 * GIB });
    expect(fit.verdict).not.toBe('too-big');
    expect(uploaded).toBeGreaterThanOrEqual(big.gpuBytes);
  });
});
