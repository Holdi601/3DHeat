/**
 * The load card: after a pick, in the middle of the view where the eye is,
 * what was found and the one thing to do next - Load. While the load runs it
 * shows how far it is and Cancel, so a long one is never a still screen.
 *
 * The pick itself lives in the Source panel (preview, mapping, fit check);
 * the panel publishes a summary of it (`state/pendingLoad.ts`). The column
 * mapping stays in the panel, under Advanced unless the files leave the
 * columns in doubt: then the card says so and opens it.
 */

import { loader } from '../../data/loader';
import { formatBytes, formatDuration } from '../../data/memory';
import { formatCount } from '../../data/synth';
import { int, t, useLang } from '../../i18n';
import { usePendingLoad } from '../../state/pendingLoad';
import { useStore } from '../../state/store';
import { reveal } from '../shell/commands';

/** The Source panel's column mapping, opened and in view: under Advanced when the columns were found. */
function showMapping(columns: 'ok' | 'unsure' | 'bad' | null): void {
  void reveal({ path: [columns === 'ok' ? 'heat.sourcePanel.mappingAdvanced' : 'heat.sourcePanel.mapping'] });
}

export function LoadCard() {
  useLang();
  const pending = usePendingLoad((s) => s.pending);
  const go = usePendingLoad((s) => s.go);
  const dismiss = usePendingLoad((s) => s.dismiss);
  const active = useStore((s) => s.load.active);
  const label = useStore((s) => s.load.label);
  const fraction = useStore((s) => s.load.fraction);
  const rowsSoFar = useStore((s) => s.load.rowsSoFar);
  const error = useStore((s) => s.load.error);
  if (!pending) return null;

  const what = [
    pending.game,
    pending.map,
    t('app.loadCard.matches', { count: pending.matches }),
    pending.rows !== null ? t('app.loadCard.rows', { rows: formatCount(pending.rows) }) : null,
    formatBytes(pending.bytes),
  ].filter(Boolean);

  return (
    <div className="load-card" data-testid="load-card" role="dialog" aria-label={t('app.loadCard.title')}>
      {/* Busy before Load is pressed too: the files' columns and rows are read first. */}
      <h2>{active ? (pending.rows === null ? t('app.loadCard.reading') : t('app.loadCard.loading')) : t('app.loadCard.title')}</h2>
      <div className="load-card-what" title={pending.name}>
        {what.join(' · ')}
      </div>
      {active ? (
        <>
          <div className="hint">{rowsSoFar > 0 ? t('heat.sourcePanel.progressRows', { label, rows: formatCount(rowsSoFar) }) : label}</div>
          <div className="bar">
            <div style={{ width: `${((fraction ?? 0) * 100).toFixed(1)}%` }} />
          </div>
          <div className="load-card-actions">
            <button type="button" data-testid="load-card-cancel" onClick={() => loader.dispose()}>
              {t('heat.sourcePanel.cancel')}
            </button>
          </div>
        </>
      ) : (
        <>
          <ul className="load-card-checks">
            <li className={pending.columns === 'ok' ? 'ok' : pending.columns === 'bad' ? 'bad' : 'warn'}>
              {pending.columns === null
                ? t('app.loadCard.columnsReading')
                : pending.columns === 'ok'
                  ? t('app.loadCard.columnsOk')
                  : pending.columns === 'bad'
                    ? t('app.loadCard.columnsBad')
                    : t('app.loadCard.columnsUnsure')}
            </li>
            {pending.verdict && (
              <li className={pending.verdict === 'fits' ? 'ok' : pending.verdict === 'tight' ? 'warn' : 'bad'}>
                {pending.verdict === 'fits'
                  ? t('app.loadCard.fits')
                  : pending.verdict === 'tight'
                    ? t('app.loadCard.tight')
                    : t('app.loadCard.tooBig')}
                {pending.stride > 1 ? ` ${t('app.loadCard.stride', { stride: int(pending.stride) })}` : ''}
                {pending.seconds !== null && pending.verdict !== 'too-big' ? ` · ${t('app.loadCard.about', { duration: formatDuration(pending.seconds) })}` : ''}
              </li>
            )}
          </ul>
          {error && <div className="err">{error}</div>}
          <div className="load-card-actions">
            <button type="button" className="primary" data-testid="load-card-go" disabled={!pending.canLoad} onClick={() => go?.()}>
              {t('app.loadCard.load')}
            </button>
            <button type="button" className="link" onClick={() => showMapping(pending.columns)}>
              {t('app.loadCard.advanced')}
            </button>
            <button type="button" className="link" onClick={() => dismiss?.()}>
              {t('app.loadCard.notNow')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
