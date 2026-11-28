/**
 * Into the match replay (the figures), playing: a first look at a match is
 * the match moving, not a still frame waiting for the play button. Only when
 * the replay is entered from elsewhere and the data has a clock; a replay
 * already shown keeps its pause.
 */

import { useStore } from '../state/store';

export function enterReplay(): void {
  const s = useStore.getState();
  const entering = s.mode !== 'team';
  s.setMode('team');
  if (!entering || !s.dataset?.time) return;
  useStore.getState().patchTimeline({ mode: 'play', playing: true });
}
