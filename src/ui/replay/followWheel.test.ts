import { describe, expect, it } from 'vitest';
import { useReplayStore } from '../../state/replayStore';
import { followWheel } from './followWheel';

describe('the wheel while following a unit', () => {
  it('sizes a parallel (isometric, top) view, where the distance shows nothing', () => {
    let h = 1000;
    useReplayStore.getState().setFollowDistance(60);
    followWheel({ projection: 'orthographic', zoomOrtho: (f) => (h *= f) }, -2);
    expect(h).toBeCloseTo(1000 / 1.18 ** 2, 6);
    expect(useReplayStore.getState().followDistance).toBe(60);
  });
  it('moves the camera in and out in perspective', () => {
    useReplayStore.getState().setFollowDistance(60);
    followWheel({ projection: 'perspective', zoomOrtho: () => expect.unreachable() }, 1);
    expect(useReplayStore.getState().followDistance).toBeCloseTo(60 * 1.18, 6);
  });
});
