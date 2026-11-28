import { describe, expect, it } from 'vitest';
import { useStore } from '../state/store';
import { enterReplay } from './enterReplay';

describe('entering the match replay', () => {
  it('starts playing when entered from the heat, and leaves a paused replay paused', () => {
    useStore.setState({ dataset: { time: new Float32Array(2) } as never, mode: 'heat-simple' });
    useStore.getState().patchTimeline({ mode: 'all', playing: false });
    enterReplay();
    let s = useStore.getState();
    expect(s.mode).toBe('team');
    expect(s.timeline).toMatchObject({ mode: 'play', playing: true });
    s.setPlaying(false);
    enterReplay();
    expect(useStore.getState().timeline.playing).toBe(false);
  });

  it('does not play data without a clock', () => {
    useStore.setState({ dataset: { time: null } as never, mode: 'heat-simple' });
    useStore.getState().patchTimeline({ mode: 'all', playing: false });
    enterReplay();
    expect(useStore.getState().timeline.playing).toBe(false);
  });
});
