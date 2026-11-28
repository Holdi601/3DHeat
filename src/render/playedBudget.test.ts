import { describe, expect, it } from 'vitest';
import { planFrame, playedBudget } from './sampling';

describe('a window played over time', () => {
  it('draws every row in it, whatever the budget', () => {
    const rows = 1_760_000;
    const budget = playedBudget(28_672, rows, true);
    const plan = planFrame({ rowLo: 3_000, rowHi: 3_000 + rows, splatsPerFrame: budget, frameIndex: 7 });
    expect(plan.exact).toBe(true);
    expect(plan.submittedSprites).toBe(rows);
  });
  it('leaves the budget of the whole data at once as it is', () => {
    expect(playedBudget(28_672, 1_760_000, false)).toBe(28_672);
  });
});
