/**
 * A level asked for by name (an opened session file's), for the level panel
 * to find and load: from the levels folder first, then the level library.
 * The panel takes the request whenever it is mounted; the status says what
 * came of it.
 */

import { create } from 'zustand';

export type LevelRequestStatus = 'idle' | 'pending' | 'loading' | 'loaded' | 'notFound';

interface LevelRequest {
  name: string | null;
  status: LevelRequestStatus;
  nonce: number;
}

export const useLevelRequest = create<LevelRequest>(() => ({ name: null, status: 'idle', nonce: 0 }));

/** Asks for the level of this name (the loaded level's name: its file name for a model). */
export function requestLevel(name: string): void {
  useLevelRequest.setState((s) => ({ name, status: 'pending', nonce: s.nonce + 1 }));
}

/** Nothing asked for any more. */
export function clearLevelRequest(): void {
  useLevelRequest.setState((s) => ({ name: null, status: 'idle', nonce: s.nonce + 1 }));
}

/** The panel takes the request: true when it is this panel's to handle (no other took it). */
export function takeLevelRequest(nonce: number): boolean {
  const s = useLevelRequest.getState();
  if (s.nonce !== nonce || s.status !== 'pending') return false;
  useLevelRequest.setState({ status: 'loading' });
  return true;
}

export function settleLevelRequest(nonce: number, found: boolean): void {
  if (useLevelRequest.getState().nonce !== nonce) return;
  useLevelRequest.setState({ status: found ? 'loaded' : 'notFound' });
}

/** Whether a catalogue or library entry is the level of that name: its file name, or the name without the extension. */
export function sameLevel(want: string, entry: { name: string; path?: string }): boolean {
  const w = want.toLowerCase();
  const stem = w.replace(/\.(glb|gltf|png|jpe?g|webp)$/, '');
  const file = (entry.path ?? '').split('/').pop()?.toLowerCase() ?? '';
  const n = entry.name.toLowerCase();
  return file === w || n === w || n === stem;
}
