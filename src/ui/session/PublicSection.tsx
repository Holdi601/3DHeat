/**
 * The session panel's parts for the internet: the host making the session
 * public (own domain through a reverse proxy, Cloudflare Tunnel, or a port
 * forward), with what becomes reachable said first and a self-test before
 * the link is shown; the host sharing catalogue items (off until switched
 * on, rights confirmed per item, confidential items blocked by the server);
 * and a member loading what the host shares, every file checked by hash.
 */

import { useEffect, useMemo, useState } from 'react';
import { int, t } from '../../i18n';
import { session } from '../../session/client';
import { loadShared, shareIndex, shareItem, sharedItems, unshare, type CatalogEntry, type ShareIndex, type SharedItem } from '../../session/assets';
import { goPublic, refreshPublic, stopPublic, usePublic, type PublicMode } from '../../session/public';
import { useSessionStore } from '../../session/store';
import { confirmDialog, toast } from '../shell/kit';

const MODES: PublicMode[] = ['own-domain', 'cloudflare', 'port-forward'];

const kib = (n: number) => (n >= 1 << 30 ? `${(n / (1 << 30)).toFixed(1)} GiB` : n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MiB` : `${int(Math.ceil(n / 1024))} KiB`);

function hostOf(url: string | null | undefined): string {
  try {
    return url ? new URL(url).host : '';
  } catch {
    return '';
  }
}

/** The host: make the session reachable from the internet, and stop it. */
export function GoPublic() {
  const role = useSessionStore((s) => s.role);
  const info = useSessionStore((s) => s.info);
  const { status, busy, missing } = usePublic();
  const [mode, setMode] = useState<PublicMode | null>(null);
  const [understood, setUnderstood] = useState(false);
  useEffect(() => {
    if (role === 'host') void refreshPublic();
  }, [role]);
  if (role !== 'host' || !info || missing || !status) return null;
  const modes = status.modes;
  const pick = mode ?? MODES.find((m) => modes[m]?.available) ?? 'cloudflare';
  const on = status.phase === 'on';
  const label = (m: PublicMode) => (m === 'own-domain' && hostOf(modes[m]?.url) ? t('session.public.mode.own-domain-at', { host: hostOf(modes[m]?.url) }) : t(`session.public.mode.${m}`));
  const start = async () => {
    // Public links keep the waiting room: only invite links (with their role) skip it.
    if (info.passwordSet && !info.waitingRoom) session.settings({ waitingRoom: true });
    try {
      const s = await goPublic(pick);
      if (s?.phase === 'on') toast(t('session.public.started'), 'good');
      else toast(t('session.public.failed'), 'bad');
    } catch {
      toast(t('session.public.failed'), 'bad');
    }
  };
  const join = status.url ? `${status.url.replace(/\/+$/, '')}/#join` : '';
  return (
    <section className="session-sec session-public">
      <h3>{t('session.public.title')}</h3>
      {!on && (
        <>
          <div role="radiogroup" aria-label={t('session.public.how')}>
            {MODES.map((m) => (
              <label key={m} className="session-check">
                <input type="radio" name="public-mode" checked={pick === m} disabled={!modes[m]?.available || busy} onChange={() => setMode(m)} />
                {label(m)}
                {!modes[m]?.available && <span className="session-flag"> · {t(`session.public.unavailable.${m}`)}</span>}
              </label>
            ))}
          </div>
          <div className="session-warn" role="note">
            <p>{t('session.public.reachable')}</p>
            <p>{modes[pick]?.showsAddress ? t('session.public.addressShown') : t('session.public.addressHidden')}</p>
            <p>{t('session.public.waitingRoom')}</p>
          </div>
          <label className="session-check">
            <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
            {t('session.public.understood')}
          </label>
          <button type="button" className="primary" disabled={!understood || busy || !modes[pick]?.available} onClick={() => void start()}>
            {busy ? t('session.public.starting') : t('session.public.start')}
          </button>
          {status.phase === 'failed' && status.error && <p className="session-hint">{t('session.public.error', { error: status.error })}</p>}
        </>
      )}
      {on && (
        <>
          <p className="session-hint">{t('session.public.on', { how: label(status.mode ?? pick) })}</p>
          {status.checks.map((c) => (
            <div key={c.what} className="session-hint">
              {c.ok ? '✓' : '✗'} {t(`session.public.check.${c.what}`)}
              {!c.ok && c.detail ? ` - ${c.detail}` : ''}
            </div>
          ))}
          {status.checks.some((c) => !c.ok) && <p className="session-hint">{t('session.public.checkHint')}</p>}
          {join ? (
            <div className="session-link">
              <input readOnly value={join} aria-label={t('session.public.link')} onFocus={(e) => e.target.select()} />
              <button type="button" className="small" onClick={() => void navigator.clipboard?.writeText(join).then(() => toast(t('session.public.copied'), 'good'))}>
                {t('session.invite.copy')}
              </button>
            </div>
          ) : (
            <p className="session-hint">{t('session.public.noUrl', { port: modes['port-forward']?.port ?? 7878 })}</p>
          )}
          <button type="button" disabled={busy} onClick={() => void stopPublic().then(() => toast(t('session.public.stopped'), 'good'))}>
            {t('session.public.stop')}
          </button>
        </>
      )}
    </section>
  );
}

/** The host: share items of the catalogue folder with the members. Off until switched on. */
export function ShareAssets() {
  const role = useSessionStore((s) => s.role);
  const status = usePublic((s) => s.status);
  const [on, setOn] = useState(false);
  const [index, setIndex] = useState<ShareIndex | null>(null);
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  useEffect(() => {
    if (!on || role !== 'host') return;
    shareIndex()
      .then(setIndex)
      .catch(() => setIndex({ available: false, items: [], blocked: 0, shared: [] }));
  }, [on, role]);
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return (index?.items ?? []).filter((i) => !f || `${i.game} ${i.name} ${i.kind}`.toLowerCase().includes(f)).slice(0, 40);
  }, [index, filter]);
  if (role !== 'host') return null;
  // Members fetch shared files from this server: through the own domain or a port forward they see its address.
  const publicMode = status?.phase === 'on' ? status.mode : null;
  const showsAddress = publicMode === 'own-domain' || publicMode === 'port-forward';
  const share = async (it: CatalogEntry) => {
    if (showsAddress && !consent) {
      toast(t('session.share.needConsent'), 'bad');
      return;
    }
    if (!(await confirmDialog(t('session.share.rightsConfirm', { name: it.name }), t('session.share.share')))) return;
    let allow = false;
    if (it.extracted) {
      allow = await confirmDialog(t('session.share.extractedWarn', { name: it.name }), t('session.share.shareAnyway'));
      if (!allow) return;
    }
    // Marked confidential: the host decides who is entitled to it, after a clear warning.
    let confidential = false;
    if (it.confidential) {
      confidential = await confirmDialog(t('session.share.confidentialWarn', { name: it.name }), t('session.share.shareConfidential'));
      if (!confidential) return;
    }
    setBusy(it.path);
    try {
      await shareItem(it.path, true, allow, confidential);
      setIndex(await shareIndex());
      toast(t('session.share.shared', { name: it.name }), 'good');
    } catch (e) {
      toast(t('session.share.refused', { why: e instanceof Error ? e.message : String(e) }), 'bad');
    } finally {
      setBusy(null);
    }
  };
  return (
    <section className="session-sec">
      <h3>{t('session.share.title')}</h3>
      <label className="session-check">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
        {t('session.share.enable')}
      </label>
      {on && index && !index.available && <p className="session-hint">{t('session.share.noCatalog')}</p>}
      {on && index?.available && (
        <>
          <p className="session-hint">{t('session.share.hint')}</p>
          {showsAddress && (
            <label className="session-check">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              {t('session.share.addressConsent')}
            </label>
          )}
          {index.items.some((i) => i.confidential) && <p className="session-hint">{t('session.share.confidentialHint')}</p>}
          <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t('session.share.filter')} aria-label={t('session.share.filter')} />
          <ul className="session-list">
            {shown.map((it) => (
              <li key={it.path} className="session-member-row">
                <span className="session-name" title={`${it.game} · ${t(`session.share.kind.${it.kind}`)}`}>
                  {it.name}
                </span>
                <span className="session-flag">
                  {it.game ? `${it.game} · ` : ''}
                  {t(`session.share.kind.${it.kind}`)} · {kib(it.size)}
                  {it.extracted ? ` · ${t('session.share.extracted')}` : ''}
                  {it.confidential ? ` · ${t('session.share.confidential')}` : ''}
                </span>
                <button type="button" className="ghost small" disabled={busy !== null} onClick={() => void share(it)}>
                  {busy === it.path ? t('session.share.sharing') : t('session.share.share')}
                </button>
              </li>
            ))}
          </ul>
          {index.shared.length > 0 && (
            <>
              <h4>{t('session.share.sharedTitle')}</h4>
              <ul className="session-list">
                {index.shared.map((s) => (
                  <li key={s.id} className="session-member-row">
                    <span className="session-name">{s.name}</span>
                    <span className="session-flag">
                      {t(`session.share.kind.${s.kind}`)} · {kib(s.size)}
                    </span>
                    <button
                      type="button"
                      className="ghost small"
                      onClick={() =>
                        void unshare(s.id)
                          .then(() => shareIndex())
                          .then(setIndex)
                      }
                    >
                      {t('session.share.stop')}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}

/** A member: what the host shares, each loaded with every file checked by hash. */
export function SharedByHost() {
  const role = useSessionStore((s) => s.role);
  const state = useSessionStore((s) => s.state);
  const [items, setItems] = useState<SharedItem[]>([]);
  const [busy, setBusy] = useState<{ id: string; done: number; all: number } | null>(null);
  useEffect(() => {
    if (role === 'host' || state !== 'joined') return;
    let stop = false;
    const ask = () => void sharedItems().then((l) => !stop && setItems(l));
    ask();
    const timer = setInterval(ask, 15_000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [role, state]);
  if (role === 'host' || !items.length) return null;
  const load = async (it: SharedItem) => {
    setBusy({ id: it.id, done: 0, all: it.files });
    try {
      const where = await loadShared(it, (done, all) => setBusy({ id: it.id, done, all }));
      toast(t(where === 'level' ? 'session.share.loadedLevel' : 'session.share.kept', { name: it.name }), 'good');
    } catch {
      toast(t('session.share.loadFailed', { name: it.name }), 'bad');
    } finally {
      setBusy(null);
    }
  };
  return (
    <section className="session-sec">
      <h3>{t('session.share.byHost')}</h3>
      <ul className="session-list">
        {items.map((it) => (
          <li key={it.id} className="session-member-row">
            <span className="session-name">{it.name}</span>
            <span className="session-flag">
              {t(`session.share.kind.${it.kind}`)} · {kib(it.size)}
              {it.confidential ? ` · ${t('session.share.confidential')}` : ''}
            </span>
            <button type="button" className="ghost small" disabled={busy !== null} onClick={() => void load(it)}>
              {busy?.id === it.id ? t('session.share.loading', { done: busy.done, all: busy.all }) : t('session.share.load')}
            </button>
          </li>
        ))}
      </ul>
      {items.some((i) => i.confidential) && <p className="session-warn">{t('session.share.confidentialMember')}</p>}
      <p className="session-hint">{t('session.share.memberHint')}</p>
    </section>
  );
}
