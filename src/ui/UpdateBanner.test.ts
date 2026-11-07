import { describe, expect, it } from 'vitest';
import { setLanguage } from '../i18n';
import { doneMessage, outcome, type ApplyAnswer } from './UpdateBanner';

/** What the notice says to an answer that is not a failure. */
function said(body: ApplyAnswer): string {
  const o = outcome(body, 200);
  if (o.kind === 'failed') throw new Error(`failed: ${o.reason}`);
  return doneMessage(o);
}

describe('the update notice', () => {
  it('says why a restart is needed, and only then', async () => {
    await setLanguage('en');
    expect(outcome({ ok: true, updated: true, restart: 'dependencies' }, 200)).toEqual({ kind: 'done', restart: 'dependencies' });
    expect(said({ ok: true, updated: true, restart: 'dependencies' })).toMatch(/dependencies changed/);
    // Only vite.config changed: a restart, but not for the dependencies.
    expect(said({ ok: true, updated: true, restart: 'config' })).toMatch(/server settings changed/);
    expect(said({ ok: true, updated: true, restart: 'config' })).not.toMatch(/dependencies/);
    expect(outcome({ ok: true, updated: true, restart: false }, 200)).toEqual({ kind: 'done', restart: false });
    expect(said({ ok: true, updated: true, restart: false })).toMatch(/page reloads/);
    // An older server's yes is a reinstall.
    expect(outcome({ ok: true, updated: true, restart: true }, 200)).toEqual({ kind: 'done', restart: 'dependencies' });
  });

  it('has nothing to reload when there was nothing to update', () => {
    expect(outcome({ ok: true, updated: false }, 200)).toEqual({ kind: 'current' });
    expect(said({ ok: true, updated: false })).toMatch(/already the newest/);
    expect(said({ ok: true, updated: false })).not.toMatch(/reloads/);
    expect(outcome({ ok: false, reason: 'diverged' }, 200)).toEqual({ kind: 'failed', reason: 'diverged' });
    expect(outcome({ ok: false }, 403)).toEqual({ kind: 'failed', reason: '403' });
  });
});
