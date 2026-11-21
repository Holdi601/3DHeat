/**
 * Every key the viewer answers to, in one table: the key sheet (`?`) shows it,
 * the command palette writes a command's key from it, and
 * docs/keyboard-reference.md lists the same. The handlers stay where they are
 * (App.tsx, render/camera.ts, ui/replay/ReplayExtras.tsx,
 * ui/tactics/boardKeys.ts, ui/shell/keys.ts, ui/notes/keys.ts); a test checks the shell's own
 * entries against its handler.
 *
 * A key is written as its parts: modifiers first, then the key as printed on
 * the cap. Alternatives are separate combos.
 */

export type ShortcutScope = 'shell' | 'camera' | 'view' | 'replay' | 'race' | 'tactics';

export interface Shortcut {
  /** Stable id; commands refer to it. */
  id: string;
  scope: ShortcutScope;
  /** One or more combos, each a list of key caps. */
  keys: string[][];
  /** The message saying what it does (`shell.key.<id>` unless given). */
  label: string;
}

const k = (id: string, scope: ShortcutScope, ...keys: string[][]): Shortcut => ({ id, scope, keys, label: `shell.key.${id}` });

export const SHORTCUTS: Shortcut[] = [
  // The shell: the same on every tab.
  k('palette', 'shell', ['Ctrl', 'K']),
  k('sheet', 'shell', ['?']),
  k('help', 'shell', ['F1']),
  k('sidebar', 'shell', ['Ctrl', 'B']),
  k('workspace', 'shell', ['Ctrl', 'Shift', '1…5']),
  k('close', 'shell', ['Esc']),
  // Flying.
  k('fly', 'camera', ['W'], ['A'], ['S'], ['D']),
  k('arrows', 'camera', ['↑'], ['←'], ['↓'], ['→']),
  k('up', 'camera', ['Space'], ['E']),
  k('down', 'camera', ['Q'], ['Ctrl']),
  k('boost', 'camera', ['Shift']),
  k('slow', 'camera', ['Alt']),
  k('look', 'camera', ['Drag']),
  k('wheel', 'camera', ['Wheel']),
  // The heat and match views.
  k('play', 'view', ['K']),
  k('frame', 'view', ['F']),
  k('modes', 'view', ['1'], ['2'], ['3'], ['4']),
  k('copyPose', 'view', ['C']),
  k('goTo', 'view', ['G']),
  k('tactical', 'view', ['T']),
  k('clear', 'view', ['Esc']),
  k('cullOut', 'view', [']']),
  k('cullIn', 'view', ['[']),
  k('cullToggle', 'view', ['\\']),
  k('noteHere', 'view', ['N']),
  k('notesPanel', 'view', ['Shift', 'N']),
  // The figure replay.
  k('bookmark', 'replay', ['B']),
  k('map', 'replay', ['M']),
  k('followView', 'replay', ['V'], ['Shift', 'V']),
  k('hud', 'replay', ['H']),
  k('playBack', 'replay', ['J']),
  k('playForward', 'replay', ['L']),
  k('events', 'replay', ['PgDn'], ['PgUp']),
  k('step', 'replay', ['.'], [',']),
  // Race analysis.
  k('racePlay', 'race', ['K']),
  k('raceStart', 'race', ['Home']),
  // The tactics board.
  k('tools', 'tactics', ['1…9']),
  k('toolLetters', 'tactics', ['V'], ['P'], ['L'], ['H'], ['O'], ['N'], ['B'], ['X'], ['U']),
  k('undo', 'tactics', ['Ctrl', 'Z']),
  k('redo', 'tactics', ['Ctrl', 'Y'], ['Ctrl', 'Shift', 'Z']),
  k('selectAll', 'tactics', ['Ctrl', 'A']),
  k('finish', 'tactics', ['Enter']),
  k('cancel', 'tactics', ['Esc']),
  k('undoPoint', 'tactics', ['Backspace']),
  k('remove', 'tactics', ['Delete']),
  k('gizmo', 'tactics', ['W'], ['E'], ['R']),
  k('rotate', 'tactics', ['R'], ['Shift', 'R']),
  k('move', 'tactics', ['M']),
  k('boardPlay', 'tactics', ['K']),
  k('taskPicker', 'tactics', ['I']),
  k('taskLegend', 'tactics', ['Shift', 'I']),
  k('quickTask', 'tactics', ['Shift', '1…9']),
];

export const SCOPES: ShortcutScope[] = ['shell', 'view', 'camera', 'replay', 'race', 'tactics'];

/** A shortcut by id. */
export function shortcut(id: string): Shortcut | undefined {
  return SHORTCUTS.find((s) => s.id === id);
}

/** A combo as text: "Ctrl+K". */
export function comboText(combo: string[]): string {
  return combo.join('+');
}
