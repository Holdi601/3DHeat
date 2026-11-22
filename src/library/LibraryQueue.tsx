/**
 * The conversion queue: what runs, what waits, what failed and why (with what
 * to do: install the converter, point it at Oodle from your own game install,
 * set the game's folder), pause and resume, cancel, retry, and each job's log.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { t, useLang } from '../i18n';
import { toast } from '../ui/shell/kit';
import { lib, type Job } from './api';
import { date } from './games';
import { reveal } from '../ui/shell/commands';
import { refreshJobs, refreshStatus, useLibrary } from './store';

/** Queues conversions and says what was queued and what not. */
export async function convertItems(ids: number[], force = false): Promise<void> {
  if (!ids.length) return;
  try {
    const r = await lib.convert(ids, force);
    const why = new Map<string, number>();
    for (const s of r.skipped) why.set(s.reason, (why.get(s.reason) ?? 0) + 1);
    const parts = [...why].map(([reason, n]) => t('library.queue.skipped', { count: n, reason: t(`library.skip.${reasonKey(reason)}`) }));
    toast([t('library.queue.queued', { count: r.queued }), ...parts].join(' · '), r.queued ? 'good' : 'info', 4000);
    useLibrary.setState({ queueOpen: r.queued > 0 || useLibrary.getState().queueOpen });
    void refreshJobs();
    void refreshStatus();
  } catch (e) {
    toast((e as Error).message, 'bad', 4000);
  }
}

function reasonKey(r: string): string {
  if (r.startsWith('converted')) return 'converted';
  if (r.startsWith('in the queue')) return 'queued';
  if (r.startsWith('opens')) return 'viewable';
  if (r.startsWith('already')) return 'match';
  return 'noConverter';
}

/**
 * The Extractors panel (Heatmap > Load > Extractors, src/ui/panels/ExtractorsPanel.tsx), where
 * converters are installed: the Library steps aside and the panel is shown. The Library reads
 * what was installed again when it is shown next.
 */
export function openExtractors(id?: string): void {
  window.dispatchEvent(new CustomEvent('heat3d:extractors', { detail: { id } }));
  useLibrary.getState().setOpen(false);
  toast(t('library.hint.managerSoon'), 'info', 5000);
  void reveal({ tab: 'heat', path: ['extractors.title'] });
}

/** What to do about a failed job, as a button or a line. */
export function installHint(hint: string | null): ReactNode {
  if (!hint) return null;
  if (hint.startsWith('install:')) {
    const id = hint.slice(8);
    return (
      <button type="button" className="primary small" onClick={() => openExtractors(id)} data-usage="cmd:lib.installConverter">
        {t('library.hint.install', { id })}
      </button>
    );
  }
  if (hint === 'oodle') return <div className="lib-hint">{t('library.hint.oodle')}</div>;
  if (hint === 'game') return <div className="lib-hint">{t('library.hint.game')}</div>;
  return null;
}

function JobRow({ j }: { j: Job }) {
  const [log, setLog] = useState<string | null>(null);
  const pct = j.progress === null ? null : Math.round(j.progress * 100);
  return (
    <div className={`lib-job ${j.state}`}>
      <div className="lib-job-main">
        <span className={`lib-job-state ${j.state}`}>{t(`library.job.${j.state}`)}</span>
        <span className="lib-job-label" title={j.label ?? ''}>
          {j.kind === 'extract' ? t('library.job.extractLabel', { what: j.label ?? '' }) : j.label}
        </span>
        <span className="lib-job-conv">
          {j.extractor}
          {j.extractorVersion ? ` ${j.extractorVersion}` : ''}
        </span>
        <span className="lib-job-acts">
          {(j.state === 'queued' || j.state === 'running') && (
            <button type="button" className="small" onClick={() => void lib.cancelJob(j.id).then(refreshJobs)}>
              {t('library.job.cancel')}
            </button>
          )}
          {(j.state === 'failed' || j.state === 'cancelled') && (
            <button type="button" className="small" onClick={() => void lib.retryJob(j.id).then(refreshJobs)}>
              {t('library.job.retry')}
            </button>
          )}
          {j.state !== 'queued' && (
            <button type="button" className="small ghost" onClick={() => (log === null ? void lib.jobLog(j.id).then((r) => setLog(r.log ?? '')) : setLog(null))}>
              {log === null ? t('library.job.log') : t('library.job.hideLog')}
            </button>
          )}
        </span>
      </div>
      {j.state === 'running' && (
        <div className="lib-progress" role="progressbar" aria-valuenow={pct ?? undefined} aria-valuemin={0} aria-valuemax={100}>
          <div className={pct === null ? 'indeterminate' : ''} style={pct === null ? undefined : { width: `${pct}%` }} />
        </div>
      )}
      {j.message && j.state !== 'done' && <div className={`lib-job-msg ${j.state === 'failed' ? 'bad' : ''}`}>{j.message}</div>}
      {j.state === 'failed' && installHint(j.hint)}
      {j.state === 'done' && j.finished && <div className="lib-job-msg">{`${j.message ?? ''} · ${date(j.finished)}`}</div>}
      {log !== null && <pre className="lib-log">{log || t('library.job.noLog')}</pre>}
    </div>
  );
}

export function LibraryQueue() {
  useLang();
  const jobs = useLibrary((s) => s.jobs);
  const info = useLibrary((s) => s.jobInfo);
  const open = useLibrary((s) => s.queueOpen);
  const set = useLibrary((s) => s.set);
  useEffect(() => {
    if (open) void refreshJobs();
  }, [open]);
  if (!open) return null;
  const c = info?.counts ?? {};
  return (
    <section className="lib-queue" aria-label={t('library.queue.title')}>
      <header>
        <strong>{t('library.queue.title')}</strong>
        <span className="lib-hint">
          {t('library.queue.counts', { running: c.running ?? 0, queued: c.queued ?? 0, failed: c.failed ?? 0, limit: info?.limit ?? 1 })}
        </span>
        <span className="lib-spacer" />
        <button type="button" className="small" onClick={() => void lib.pause(!info?.paused).then(refreshJobs)} data-usage="cmd:lib.pauseQueue">
          {info?.paused ? t('library.queue.resume') : t('library.queue.pause')}
        </button>
        <button type="button" className="small ghost" onClick={() => void lib.clearJobs().then(refreshJobs)}>
          {t('library.queue.clear')}
        </button>
        <button type="button" className="small ghost" onClick={() => set({ queueOpen: false })} aria-label={t('library.close')}>
          ×
        </button>
      </header>
      {info?.paused && <div className="lib-hint warn">{t('library.queue.paused')}</div>}
      <div className="lib-jobs">
        {jobs.length ? jobs.map((j) => <JobRow key={j.id} j={j} />) : <div className="lib-hint">{t('library.queue.empty')}</div>}
      </div>
    </section>
  );
}
