import { describe, expect, it } from 'vitest';
import { isTextEntry, typesCharacter, typing } from './viewKeys';

/** A stand-in element: what the checks read of one. */
const el = (tagName: string, extra: Record<string, unknown> = {}) =>
  ({ tagName, isContentEditable: false, getAttribute: (k: string) => (extra.attrs as Record<string, string> | undefined)?.[k] ?? null, closest: () => null, ...extra }) as unknown as HTMLElement;

describe('who has the keys', () => {
  it('counts every box that takes text as typing, and no button or slider', () => {
    expect(isTextEntry(el('INPUT', { type: 'text' }))).toBe(true);
    expect(isTextEntry(el('INPUT', { type: 'search' }))).toBe(true);
    expect(isTextEntry(el('INPUT', { type: 'number' }))).toBe(true);
    expect(isTextEntry(el('TEXTAREA'))).toBe(true);
    expect(isTextEntry(el('SELECT'))).toBe(true);
    expect(isTextEntry(el('DIV', { isContentEditable: true }))).toBe(true);
    expect(isTextEntry(el('DIV', { attrs: { role: 'textbox' } }))).toBe(true);
    expect(isTextEntry(el('INPUT', { type: 'checkbox' }))).toBe(false);
    expect(isTextEntry(el('INPUT', { type: 'range' }))).toBe(false);
    expect(isTextEntry(el('BUTTON'))).toBe(false);
    expect(isTextEntry(el('CANVAS'))).toBe(false);
    expect(isTextEntry(null)).toBe(false);
  });

  it('is typing inside a modal dialog, and while an input method composes', () => {
    const inDialog = el('BUTTON', { closest: (sel: string) => (sel.includes('aria-modal') ? {} : null) });
    expect(typing({ target: inDialog })).toBe(true);
    expect(typing({ target: el('CANVAS'), isComposing: true })).toBe(true);
    expect(typing({ target: el('CANVAS') })).toBe(false);
  });

  it('tells a key that types a character from a named key or a Ctrl combination', () => {
    const k = (key: string, mods: Partial<{ ctrlKey: boolean; altKey: boolean; metaKey: boolean }> = {}) => ({ key, ctrlKey: false, altKey: false, metaKey: false, ...mods });
    expect(typesCharacter(k('k'))).toBe(true);
    expect(typesCharacter(k('K'))).toBe(true);
    expect(typesCharacter(k('3'))).toBe(true);
    expect(typesCharacter(k('['))).toBe(true);
    expect(typesCharacter(k(' '))).toBe(true);
    expect(typesCharacter(k('Escape'))).toBe(false);
    expect(typesCharacter(k('Enter'))).toBe(false);
    expect(typesCharacter(k('z', { ctrlKey: true }))).toBe(false);
  });
});
