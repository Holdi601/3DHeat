import { describe, expect, it } from 'vitest';
import { swallows } from './browserKeys';

const key = (k: string, mods: { ctrl?: boolean; alt?: boolean; target?: { tagName: string; isContentEditable?: boolean } } = {}) =>
  ({ key: k, ctrlKey: !!mods.ctrl, metaKey: false, altKey: !!mods.alt, target: (mods.target ?? { tagName: 'CANVAS', isContentEditable: false }) as unknown as EventTarget });

describe('browser shortcuts while flying', () => {
  it('swallows save, print, reload and the like', () => {
    for (const k of ['s', 'p', 'r', 'S', 'd']) expect(swallows(key(k, { ctrl: true }))).toBe(true);
    expect(swallows(key('F5'))).toBe(true);
  });
  it('keeps plain flying keys and editing shortcuts', () => {
    expect(swallows(key('w'))).toBe(false);
    expect(swallows(key('c', { ctrl: true }))).toBe(false);
    expect(swallows(key('v', { ctrl: true }))).toBe(false);
  });
  it('leaves text fields alone', () => {
    expect(swallows(key('s', { ctrl: true, target: { tagName: 'INPUT' } }))).toBe(false);
  });
});
