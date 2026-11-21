/**
 * The native app's update notice, its row in Settings, and the system check
 * page. All three only in the app's window (native/crates/app-tauri:
 * update.rs, requirements.rs); in a browser they render nothing.
 *
 * The app asks before it updates: a newer release shows its version, an
 * excerpt of its notes and "Update now", "Later" and "Skip this version". Only
 * "Update automatically" (Settings) makes it update by itself, installed when
 * the app closes. Every installer is checked against the release signature by
 * the app before it runs.
 */

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { t, useLang } from '../i18n';
import {
  inApp,
  notesExcerpt,
  openFix,
  requirements,
  updateCheck,
  updateNow,
  updateSettings,
  updateStatus,
  type RequirementCheck,
  type UpdateStatus,
} from '../appHost';
import { Dialog } from './shell/kit';

const useAppUpdate = create<{ status: UpdateStatus | null; later: boolean; checkOpen: boolean }>(() => ({
  status: null,
  later: false,
  checkOpen: false,
}));

/** How often the page asks the app (the app itself asks GitHub every six hours). */
const POLL_MS = 10 * 60_000;
const FIRST_MS = 25_000;

export function openSystemCheck(): void {
  useAppUpdate.setState({ checkOpen: true });
}

/** Whether the notice should show for this status (exported for the test). */
export function offered(s: UpdateStatus | null, later: boolean): boolean {
  if (!s?.available || later || s.off) return false;
  if (s.settings.auto && s.canInstall) return false;
  return s.settings.skip !== s.available.version;
}

/** The notice, the polling, and the first-run system check. */
export function AppUpdateBanner() {
  useLang();
  const status = useAppUpdate((s) => s.status);
  const later = useAppUpdate((s) => s.later);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!inApp()) return;
    let alive = true;
    const ask = () => void updateStatus().then((s) => alive && s && useAppUpdate.setState({ status: s }));
    const first = window.setTimeout(ask, FIRST_MS);
    const again = window.setInterval(ask, POLL_MS);
    // The system check opens by itself once per app version, when something is missing.
    void updateStatus().then(async (s) => {
      if (!alive || !s || s.settings.checkedRequirements === s.current) return;
      const checks = await requirements();
      await updateSettings({ checkedRequirements: s.current });
      if (alive && (checks.some((c) => c.status !== 'ok') || !(await webgpuCheck()).ok)) openSystemCheck();
    });
    return () => {
      alive = false;
      window.clearTimeout(first);
      window.clearInterval(again);
    };
  }, []);

  if (!offered(status, later) || !status?.available) return <SystemCheckHost />;
  const a = status.available;
  const excerpt = notesExcerpt(a.notes);
  const now = async () => {
    setBusy(true);
    setError('');
    try {
      await updateNow();
      // Where the app cannot replace itself, the release page opened instead.
      useAppUpdate.setState({ status: await updateStatus() });
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="update-banner" role="status" data-testid="app-update">
        <span>
          {t('app.appUpdate.available', { version: a.version, current: status.current })}
          {excerpt && <span className="update-notes"> {excerpt}</span>}
          {error && <span> {t('app.appUpdate.failed', { reason: error })}</span>}
        </span>
        <div className="row">
          <button className="primary" disabled={busy} onClick={() => void now()}>
            {busy ? t('app.appUpdate.installing') : status.canInstall ? t('app.appUpdate.now') : t('app.appUpdate.download')}
          </button>
          <button onClick={() => useAppUpdate.setState({ later: true })}>{t('app.appUpdate.later')}</button>
          <button
            onClick={() =>
              void updateSettings({ skip: a.version }).then((s) => useAppUpdate.setState({ status: s ?? status, later: true }))
            }
          >
            {t('app.appUpdate.skip')}
          </button>
        </div>
      </div>
      <SystemCheckHost />
    </>
  );
}

/** The row in Settings: update automatically, check now, the system check. */
export function AppUpdateSettingsRow({ onOpen }: { onOpen: () => void }) {
  useLang();
  const status = useAppUpdate((s) => s.status);
  const [note, setNote] = useState('');
  useEffect(() => {
    if (inApp() && !status) void updateStatus().then((s) => s && useAppUpdate.setState({ status: s }));
  }, [status]);
  if (!inApp()) return null;
  const auto = status?.settings.auto ?? false;
  return (
    <div className="settings-row app-update-row">
      <span>{t('app.appUpdate.settings', { current: status?.current ?? '' })}</span>
      <label className="check" title={t('app.appUpdate.autoHint')}>
        <input
          type="checkbox"
          checked={auto}
          data-testid="app-update-auto"
          onChange={(e) => void updateSettings({ auto: e.target.checked }).then((s) => s && useAppUpdate.setState({ status: s }))}
        />
        {t('app.appUpdate.auto')}
      </label>
      <button
        type="button"
        onClick={() => {
          setNote(t('app.appUpdate.checking'));
          void updateCheck().then((s) => {
            if (!s) return;
            // Asked on purpose: a skipped version is offered again.
            useAppUpdate.setState({ status: s, later: false });
            if (s.available && s.settings.skip === s.available.version) void updateSettings({ skip: '' });
            setNote(
              s.phase === 'failed'
                ? t('app.appUpdate.failed', { reason: s.error })
                : s.available
                  ? t('app.appUpdate.available', { version: s.available.version, current: s.current })
                  : t('app.appUpdate.latest', { current: s.current }),
            );
          });
        }}
      >
        {t('app.appUpdate.checkNow')}
      </button>
      <button
        type="button"
        onClick={() => {
          onOpen();
          openSystemCheck();
        }}
      >
        {t('app.systemCheck.open')}
      </button>
      {note && <span className="hint">{note}</span>}
    </div>
  );
}

interface WebGpuResult {
  ok: boolean;
  detail: string;
}

/** The page's own check: whether WebGPU gives an adapter, and which. */
async function webgpuCheck(): Promise<WebGpuResult> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(o?: object): Promise<{ info?: { vendor?: string; description?: string; architecture?: string } } | null> } }).gpu;
  if (!gpu) return { ok: false, detail: t('app.systemCheck.webgpuNone') };
  try {
    const a = await gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!a) return { ok: false, detail: t('app.systemCheck.webgpuNoAdapter') };
    const name = [a.info?.vendor, a.info?.description || a.info?.architecture].filter(Boolean).join(' ');
    return { ok: true, detail: t('app.systemCheck.webgpuOk', { name: name || '?' }) };
  } catch (e) {
    return { ok: false, detail: String(e) };
  }
}

function SystemCheckHost() {
  const open = useAppUpdate((s) => s.checkOpen);
  return open ? <SystemCheck onClose={() => useAppUpdate.setState({ checkOpen: false })} /> : null;
}

/** The first-run check page: what the app needs, found or missing, with the fix. */
export function SystemCheck({ onClose }: { onClose: () => void }) {
  useLang();
  const [checks, setChecks] = useState<RequirementCheck[] | null>(null);
  const run = () => {
    setChecks(null);
    void Promise.all([requirements(), webgpuCheck()]).then(([c, w]) =>
      setChecks([...c, { id: 'webgpu', status: w.ok ? 'ok' : 'missing', detail: w.detail, fix: null }]),
    );
  };
  useEffect(run, []);
  const bad = checks?.filter((c) => c.status !== 'ok').length ?? 0;
  return (
    <Dialog title={t('app.systemCheck.title')} onClose={onClose} className="system-check">
      <p>{checks === null ? t('app.systemCheck.running') : bad ? t('app.systemCheck.someMissing', { count: bad }) : t('app.systemCheck.allOk')}</p>
      {checks && (
        <ul className="system-check-list" data-testid="system-check">
          {checks.map((c) => (
            <li key={c.id} className={`check-${c.status}`} data-status={c.status}>
              <strong>{t(`app.systemCheck.status.${c.status}`)}</strong> <span>{t(`app.systemCheck.item.${c.id}`)}</span>: {c.detail}
              {c.fix && (
                <>
                  {' '}
                  <button type="button" onClick={() => void openFix(c.fix!)}>
                    {t('app.systemCheck.fix')}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="row">
        <button type="button" onClick={run}>
          {t('app.systemCheck.again')}
        </button>
        <button type="button" className="primary" onClick={onClose}>
          {t('shell.close')}
        </button>
      </div>
    </Dialog>
  );
}
