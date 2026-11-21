/**
 * The shell's keys (ui/shell/shortcuts.ts, scope `shell`): the command palette,
 * the key sheet, the side panel and the workspaces. Listened to in the capture
 * phase, ahead of every other key handler, so an open overlay takes `Esc` and
 * the keys under it do not also act.
 */

import { useRaceStore } from '../../state/raceStore';
import { useShell } from './shellStore';

/** The workspaces in the bar's order: Ctrl+Shift+1 to 5. */
export const WORKSPACES = ['heat', 'race', 'match', 'plan', 'vehicle'] as const;
export type Workspace = (typeof WORKSPACES)[number];

function inTextField(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA' || el.isContentEditable) return true;
  if (tag !== 'INPUT') return false;
  const type = (el as HTMLInputElement).type;
  return type !== 'checkbox' && type !== 'radio' && type !== 'range' && type !== 'button';
}

/** Handles a shell key; true when it was one (the event is then stopped). */
export function shellKeyDown(ev: KeyboardEvent): boolean {
  const shell = useShell.getState();
  const ctrl = ev.ctrlKey || ev.metaKey;
  if (ctrl && !ev.altKey && !ev.shiftKey && ev.code === 'KeyK') {
    shell.setPalette(!shell.palette);
    return true;
  }
  if (ev.key === 'Escape' && (shell.palette || shell.sheet || shell.settings)) {
    if (shell.palette) shell.setPalette(false);
    else if (shell.sheet) shell.setSheet(false);
    else shell.setSettings(false);
    return true;
  }
  if (ctrl && !ev.altKey && !ev.shiftKey && ev.code === 'KeyB') {
    shell.setSidebarHidden(!shell.sidebarHidden);
    return true;
  }
  if (ctrl && ev.shiftKey && !ev.altKey && /^(Digit|Numpad)[1-5]$/.test(ev.code)) {
    useRaceStore.getState().setTab(WORKSPACES[Number(ev.code.slice(-1)) - 1]);
    return true;
  }
  // By the character: which key makes a ? depends on the keyboard's language.
  if (ev.key === '?' && !ctrl && !ev.altKey && !inTextField(ev.target)) {
    shell.setSheet(!shell.sheet);
    return true;
  }
  return false;
}

/** Installs the shell's keys; returns their removal. */
export function installShellKeys(): () => void {
  const onKey = (ev: KeyboardEvent) => {
    if (ev.isComposing || ev.repeat) return;
    if (shellKeyDown(ev)) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  };
  window.addEventListener('keydown', onKey, true);
  return () => window.removeEventListener('keydown', onKey, true);
}
