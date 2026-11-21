import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRaceStore } from '../../state/raceStore';
import index from 'virtual:command-index';
import { shellKeyDown } from './keys';
import { score } from './match';
import { SHORTCUTS } from './shortcuts';
import { resolvedTheme, useShell } from './shellStore';

const english: Record<string, string> = {};
const dir = join(__dirname, '../../i18n/locales/en');
for (const f of ['app.json', 'shell.json', 'heat.json', 'notes.json']) Object.assign(english, JSON.parse(readFileSync(join(dir, f), 'utf8')));

const key = (code: string, k: string, mods: { ctrl?: boolean; shift?: boolean; alt?: boolean; tag?: string; type?: string } = {}) =>
  ({
    code,
    key: k,
    ctrlKey: !!mods.ctrl,
    metaKey: false,
    shiftKey: !!mods.shift,
    altKey: !!mods.alt,
    target: { tagName: mods.tag ?? 'CANVAS', type: mods.type, isContentEditable: false },
  }) as unknown as KeyboardEvent;

describe('the shell keys', () => {
  beforeEach(() => useShell.setState({ palette: false, sheet: false, settings: false, sidebarHidden: false }));

  it('opens and closes the palette with Ctrl+K, and Esc closes it', () => {
    expect(shellKeyDown(key('KeyK', 'k', { ctrl: true }))).toBe(true);
    expect(useShell.getState().palette).toBe(true);
    expect(shellKeyDown(key('Escape', 'Escape'))).toBe(true);
    expect(useShell.getState().palette).toBe(false);
    // Esc with nothing open is left to the view (pick card, follow).
    expect(shellKeyDown(key('Escape', 'Escape'))).toBe(false);
  });

  it('opens the key sheet with ?, but not while typing', () => {
    expect(shellKeyDown(key('Slash', '?', { shift: true }))).toBe(true);
    expect(useShell.getState().sheet).toBe(true);
    useShell.setState({ sheet: false });
    expect(shellKeyDown(key('Slash', '?', { shift: true, tag: 'INPUT', type: 'text' }))).toBe(false);
    expect(useShell.getState().sheet).toBe(false);
  });

  it('hides the side panel with Ctrl+B and switches workspaces with Ctrl+Shift+digit', () => {
    expect(shellKeyDown(key('KeyB', 'b', { ctrl: true }))).toBe(true);
    expect(useShell.getState().sidebarHidden).toBe(true);
    expect(shellKeyDown(key('Digit3', '#', { ctrl: true, shift: true }))).toBe(true);
    expect(useRaceStore.getState().tab).toBe('match');
    expect(shellKeyDown(key('Digit1', '!', { ctrl: true, shift: true }))).toBe(true);
    expect(useRaceStore.getState().tab).toBe('heat');
  });

  it('leaves the other keys alone: the camera, the heat modes, the board', () => {
    for (const [code, k] of [
      ['KeyW', 'w'],
      ['Digit1', '1'],
      ['KeyK', 'k'],
      ['KeyI', 'I'],
    ])
      expect(shellKeyDown(key(code, k))).toBe(false);
    // Shift+digit is the board's quick tasks; Ctrl+Z its undo.
    expect(shellKeyDown(key('Digit2', '@', { shift: true }))).toBe(false);
    expect(shellKeyDown(key('KeyZ', 'z', { ctrl: true }))).toBe(false);
  });
});

describe('the shortcut map', () => {
  it('says what every key does, in English at least', () => {
    expect(SHORTCUTS.filter((s) => !(s.label in english)).map((s) => s.id)).toEqual([]);
  });

  it('has each id once and no browser-reserved combo', () => {
    const ids = SHORTCUTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const reserved = ['Ctrl+W', 'Ctrl+T', 'Ctrl+N', 'Ctrl+Tab', 'Ctrl+L', 'Ctrl+1…9', 'Alt+1…9', 'Alt+F4'];
    for (const s of SHORTCUTS) for (const combo of s.keys) expect(reserved).not.toContain(combo.join('+'));
  });
});

describe('the command palette', () => {
  it('ranks a word at the start of a label ahead of one inside another', () => {
    const a = { label: 'Sprite radius', group: 'setting' };
    const b = { label: 'Radius of the volume', group: 'setting' };
    expect(score(b, 'radius')).toBeGreaterThan(score(a, 'radius'));
    expect(score(a, 'radius')).toBeGreaterThan(0);
    expect(score(a, 'sprite rad')).toBeGreaterThan(0);
    expect(score(a, 'volume')).toBe(0);
    expect(score({ label: 'Saturation', hint: 'Heatmap › Heat shape', group: 'setting' }, 'shape')).toBeGreaterThan(0);
  });

  it('finds a word without its accents', () => {
    expect(score({ label: 'Échelle', group: 'setting' }, 'echelle')).toBeGreaterThan(0);
  });

  it('indexes sections and settings of every workspace', () => {
    const entries = index.entries;
    for (const tab of ['heat', 'race', 'match', 'plan', 'vehicle']) expect(entries.some((e) => e.tab === tab)).toBe(true);
    expect(entries.some((e) => e.path.includes('heat.heatPanel.shape') && e.label)).toBe(true);
    // Read from the source: the task-grouped panels of every workspace are in it.
    expect(entries.some((e) => e.tab === 'plan' && e.path[0] === 'tactics.tools' && e.label === 'tactics.topView')).toBe(true);
    expect(entries.some((e) => e.tab === 'race' && e.path[0] === 'race.ui.corners.title')).toBe(true);
    expect(entries.some((e) => e.tab === 'heat' && e.mode === 'heat-lines' && e.path[0] === 'heat.linePanel.title')).toBe(true);
  });
});

describe('the theme', () => {
  it('follows the system only when asked to', () => {
    expect(resolvedTheme('dark', false)).toBe('dark');
    expect(resolvedTheme('light', true)).toBe('light');
    expect(resolvedTheme('system', true)).toBe('dark');
    expect(resolvedTheme('system', false)).toBe('light');
  });
});
