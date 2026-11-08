import { describe, expect, it } from 'vitest';
import { FOLLOW_NEAR_MIN_M, nearForFollow } from './followNear';

describe('nearForFollow', () => {
  it('keeps the view near plane when nothing is followed', () => {
    expect(nearForFollow(10, [0, 0, 0], null, 1)).toBe(10);
  });
  it('brings the near plane in for a missile followed from 6 m, under a streamed level 10 m cap', () => {
    const near = nearForFollow(10, [0, 0, 0], [6, 0, 0], 1);
    // The missile's 4 m body is 4 m and more from the camera: nothing of it is cut.
    expect(near).toBeCloseTo(0.6);
    expect(near).toBeLessThan(6 - 2);
  });
  it('never comes in further than a followed unit far off asks', () => {
    expect(nearForFollow(10, [0, 0, 0], [5000, 0, 0], 1)).toBe(10);
    expect(nearForFollow(0.1, [0, 0, 0], [50, 0, 0], 1)).toBe(0.1);
  });
  it('stops at a floor, in data units', () => {
    expect(nearForFollow(10, [0, 0, 0], [0, 0, 0.01], 1)).toBe(FOLLOW_NEAR_MIN_M);
    expect(nearForFollow(10 * 40, [0, 0, 0], [0, 0, 0], 40)).toBeCloseTo(FOLLOW_NEAR_MIN_M * 40);
  });
});
