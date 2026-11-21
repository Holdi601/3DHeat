import { describe, expect, it } from 'vitest';
import { notesExcerpt, type UpdateStatus } from '../appHost';
import { offered } from './AppUpdate';

const status = (over: Partial<UpdateStatus> = {}, settings: Partial<UpdateStatus['settings']> = {}): UpdateStatus => ({
  current: '0.1.0',
  settings: { auto: false, skip: null, checkedRequirements: null, ...settings },
  available: { version: '0.2.0', notes: '## 0.2.0\n- Faster loads\n- A fix', date: null },
  ready: false,
  canInstall: true,
  phase: 'idle',
  error: '',
  off: false,
  releases: 'https://github.com/Holdi601/3DHeat/releases/latest',
  ...over,
});

describe('the app update notice', () => {
  it('asks when a newer version is out', () => {
    expect(offered(status(), false)).toBe(true);
  });
  it('stays quiet when there is nothing, after Later, or for a skipped version', () => {
    expect(offered(status({ available: null }), false)).toBe(false);
    expect(offered(status(), true)).toBe(false);
    expect(offered(status({}, { skip: '0.2.0' }), false)).toBe(false);
    // A newer one than the skipped one is offered again.
    expect(offered(status({ available: { version: '0.3.0', notes: '', date: null } }, { skip: '0.2.0' }), false)).toBe(true);
  });
  it('does not ask when it updates by itself, unless it cannot replace this install', () => {
    expect(offered(status({}, { auto: true }), false)).toBe(false);
    expect(offered(status({ canInstall: false }, { auto: true }), false)).toBe(true);
  });
  it('is silent with HEAT3D_NO_UPDATE', () => {
    expect(offered(status({ off: true }), false)).toBe(false);
  });
  it('shows the first lines of the notes', () => {
    expect(notesExcerpt('## 0.2.0\n- Faster loads\n\n* A fix\n- More\n- And more\n- Cut')).toBe('0.2.0 · Faster loads · A fix · More');
    expect(notesExcerpt('x'.repeat(400)).length).toBe(280);
    expect(notesExcerpt('')).toBe('');
  });
});
