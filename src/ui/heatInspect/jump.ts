import type { Engine } from '../../render/engine';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { goToMark } from '../replay/BookmarkPanel';

let timer = 0;

/**
 * Into the match replay at a row: the playhead a few seconds before it, the
 * camera behind whoever it is about (or flown to it), as the replay's own
 * marks do. From a heat mode the replay opens first, which settles its session
 * and playhead, and the jump follows.
 */
export function jumpToRow(engine: Engine, d: Dataset, row: number): void {
  if (!d.time) return;
  clearTimeout(timer);
  const go = () => goToMark(engine, d, { kind: 'kill', time: d.time![row], row, label: '' });
  if (useStore.getState().mode !== 'team') {
    useStore.getState().setMode('team');
    timer = window.setTimeout(go, 150);
    return;
  }
  go();
}
