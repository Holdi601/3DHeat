import { useStore } from '../state/store';

/**
 * Browser shortcuts that only get in the way while flying the camera with the
 * keyboard: Ctrl+S opening "Save page", Ctrl+P printing, Ctrl+R reloading and
 * throwing the loaded data away. They are swallowed outside text fields, where
 * the editing shortcuts (copy, paste, undo, select all) keep working.
 *
 * Ctrl+W, Ctrl+T and Ctrl+N cannot be swallowed by a page in Chrome; for those
 * the page asks before it is closed or reloaded while data is loaded, and in
 * full screen the keyboard is locked so they reach the page instead.
 */
const SWALLOWED = new Set(['s', 'p', 'o', 'u', 'j', 'h', 'd', 'r', 'e', 'k', 'l', 'g', 'b', 'q', 'w', 'n', 't']);
const SWALLOWED_PLAIN = new Set(['F1', 'F3', 'F5', 'F6', 'F7']);
const LOCKED = ['KeyW', 'KeyT', 'KeyN', 'KeyS', 'KeyR', 'KeyP', 'KeyQ', 'Escape'];

function inTextField(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/** Whether a key press is a browser shortcut the page should keep for itself. */
export function swallows(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'target'>): boolean {
  if (SWALLOWED_PLAIN.has(e.key)) return true;
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return false;
  if (inTextField(e.target)) return false;
  return SWALLOWED.has(e.key.toLowerCase());
}

/** Installs the guards; returns their removal. */
export function guardBrowserKeys(): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (swallows(e)) e.preventDefault();
  };
  const onUnload = (e: BeforeUnloadEvent) => {
    const s = useStore.getState();
    if (!s.dataset && !s.level) return;
    e.preventDefault();
    e.returnValue = '';
  };
  const onFullscreen = () => {
    const kb = (navigator as Navigator & { keyboard?: { lock?: (keys?: string[]) => Promise<void>; unlock?: () => void } }).keyboard;
    if (document.fullscreenElement) kb?.lock?.(LOCKED).catch(() => undefined);
    else kb?.unlock?.();
  };
  window.addEventListener('keydown', onKey, { capture: true });
  window.addEventListener('beforeunload', onUnload);
  document.addEventListener('fullscreenchange', onFullscreen);
  return () => {
    window.removeEventListener('keydown', onKey, { capture: true });
    window.removeEventListener('beforeunload', onUnload);
    document.removeEventListener('fullscreenchange', onFullscreen);
  };
}
