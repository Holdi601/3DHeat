import { describe, expect, it } from 'vitest';
import { defaultTeamSplit } from './store';

describe("the difference's default sides", () => {
  it('puts the two teams against each other, not both against the units of nobody', () => {
    expect(defaultTeamSplit(['1', '2', ''])).toEqual({ positive: [0], negative: [1] });
    expect(defaultTeamSplit(['none', 'CT', 'T'])).toEqual({ positive: [1], negative: [2] });
  });
  it('halves any number of groups as before', () => {
    expect(defaultTeamSplit(['a', 'b', 'c', 'd'])).toEqual({ positive: [0, 1], negative: [2, 3] });
    expect(defaultTeamSplit(['a', ''])).toEqual({ positive: [0], negative: [1] });
  });
});
