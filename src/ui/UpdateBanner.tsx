import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { Rich } from './controls';

/** The dev server's update route; see `selfUpdate` in vite.config.ts. Absent from a static build. */
const ROUTE = '/__heat3d/update';
/** How often to ask again while the page stays open. */
const EVERY_MS = 6 * 3600_000;

interface Status {
  checkout: boolean;
  behind?: number;
  dirty?: boolean;
  latest?: string;
}

/** Why the server must be restarted after an update: see `selfUpdate`. */
type Restart = 'dependencies' | 'config' | false;

type Phase =
  | { kind: 'idle' }
  | { kind: 'applying' }
  | { kind: 'done'; restart: Restart }
  | { kind: 'current' }
  | { kind: 'failed'; reason: string };

/** The update route's answer to "update now". */
export interface ApplyAnswer {
  ok: boolean;
  updated?: boolean;
  restart?: Restart | boolean;
  reason?: string;
}

/**
 * What an answer means for the notice: updated (and whether, and why, the
 * server needs a restart), nothing to update after all - the copy was brought
 * up meanwhile, by start.bat say - or not done, and why.
 */
export function outcome(body: ApplyAnswer, status: number): Exclude<Phase, { kind: 'idle' | 'applying' }> {
  if (!body.ok) return { kind: 'failed', reason: body.reason ?? String(status) };
  if (!body.updated) return { kind: 'current' };
  // `true` is an older server's word for a reinstall.
  const restart = body.restart === true ? 'dependencies' : body.restart || false;
  return { kind: 'done', restart };
}

/** What the notice says once the update is done or not. */
export function doneMessage(phase: Exclude<Phase, { kind: 'idle' | 'applying' | 'failed' }>): string {
  if (phase.kind === 'current') return t('app.update.current');
  if (phase.restart === 'dependencies') return t('app.update.restart');
  if (phase.restart === 'config') return t('app.update.restartConfig');
  return t('app.update.done');
}

/**
 * A newer version is out: say so, and offer to bring this copy up to it.
 *
 * Asks the server the page came from, which knows whether its checkout is
 * behind. Says nothing at all when there is no such server (a static build) or
 * nothing newer - an update notice that appears on every start is one people
 * learn to ignore.
 */
export function UpdateBanner() {
  const [status, setStatus] = useState<Status | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let alive = true;
    const ask = () =>
      fetch(ROUTE, { cache: 'no-store' })
        .then((r) => (r.ok ? (r.json() as Promise<Status>) : null))
        .then((s) => alive && s && setStatus(s))
        .catch(() => undefined);
    // Not in the first seconds: the page has a dataset to load and a GPU to start.
    const first = window.setTimeout(ask, 4000);
    const again = window.setInterval(ask, EVERY_MS);
    return () => {
      alive = false;
      window.clearTimeout(first);
      window.clearInterval(again);
    };
  }, []);

  if (hidden || !status?.checkout || !status.behind) return null;

  const apply = async () => {
    setPhase({ kind: 'applying' });
    try {
      const r = await fetch(`${ROUTE}/apply`, { method: 'POST', headers: { 'X-Heat3d-Update': '1' } });
      const next = outcome((await r.json()) as ApplyAnswer, r.status);
      setPhase(next);
      // The server already serves the new files; without a restart to wait for,
      // a reload is all it takes. Nothing new, nothing to reload.
      if (next.kind === 'done' && !next.restart) window.setTimeout(() => location.reload(), 1500);
    } catch (e) {
      setPhase({ kind: 'failed', reason: (e as Error).message });
    }
  };

  return (
    <div className="update-banner" role="status">
      {phase.kind === 'done' || phase.kind === 'current' ? (
        <span>
          <Rich text={doneMessage(phase)} />
        </span>
      ) : phase.kind === 'failed' ? (
        <span>
          {phase.reason === 'dirty'
            ? t('app.update.dirty')
            : phase.reason === 'diverged'
              ? t('app.update.diverged')
              : t('app.update.failed', { reason: phase.reason })}
        </span>
      ) : status.dirty ? (
        <span>
          {t('app.update.available', { count: status.behind, latest: status.latest ?? '' })} {t('app.update.dirty')}
        </span>
      ) : (
        <>
          <span>{t('app.update.available', { count: status.behind, latest: status.latest ?? '' })}</span>
          <div className="row">
            <button className="primary" disabled={phase.kind === 'applying'} onClick={() => void apply()}>
              {phase.kind === 'applying' ? t('app.update.applying') : t('app.update.apply')}
            </button>
            <button onClick={() => setHidden(true)}>{t('app.update.later')}</button>
          </div>
        </>
      )}
    </div>
  );
}
