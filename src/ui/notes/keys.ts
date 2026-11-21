/**
 * The notes' keys on the heat and match views: `N` a note on what is in
 * sight, `Shift+N` the notes panel (ui/shell/shortcuts.ts lists them). Not
 * while typing, not with Ctrl or Alt held (Ctrl is the camera's down key).
 *
 * The editors stop the view's keys at their edge (`stopViewKeys`): typing a
 * "k" in a note must not start the playback, a "w" not fly the camera. F1
 * still reaches the help, and the shell's keys (Ctrl+K) are heard before.
 */

import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { Engine } from '../../render/engine';
import { useRaceStore } from '../../state/raceStore';
import { noteHere, showNotesPanel } from './actions';

function typing(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
}

/** Handles a notes key; true when it was one. */
export function notesKeyDown(ev: Pick<KeyboardEvent, 'code' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey' | 'repeat' | 'target'>, engine: Engine | null): boolean {
  if (ev.code !== 'KeyN' || ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat || typing(ev.target)) return false;
  const tab = useRaceStore.getState().tab;
  if (tab !== 'heat' && tab !== 'match') return false;
  if (document.querySelector('.dialog-scrim')) return false;
  if (ev.shiftKey) showNotesPanel();
  else void noteHere(engine);
  return true;
}

export function installNotesKeys(engine: () => Engine | null): () => void {
  const onKey = (ev: KeyboardEvent) => {
    if (ev.isComposing) return;
    if (notesKeyDown(ev, engine())) ev.preventDefault();
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}

/** On an editor's container: its keys stay in it, F1 (help) excepted. */
export function stopViewKeys(e: ReactKeyboardEvent): void {
  if (e.key === 'F1') return;
  e.stopPropagation();
}
