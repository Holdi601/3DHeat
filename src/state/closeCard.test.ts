import { describe, expect, it } from 'vitest';
import { useReplayStore } from './replayStore';

describe("the unit card's close button", () => {
  it('stops following the unit it closes', () => {
    useReplayStore.setState({ selected: 'u1', follow: 7, followUnit: 'u1' });
    useReplayStore.getState().closeCard('u1');
    const s = useReplayStore.getState();
    expect(s.selected).toBeNull();
    expect(s.follow).toBeNull();
    expect(s.followUnit).toBeNull();
  });
  it('leaves the follow of another unit alone', () => {
    useReplayStore.setState({ selected: 'u2', follow: 7, followUnit: 'u1' });
    useReplayStore.getState().closeCard('u2');
    expect(useReplayStore.getState()).toMatchObject({ selected: null, follow: 7, followUnit: 'u1' });
  });
});
