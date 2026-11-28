/**
 * The session panel's parts for the internet: the host making the session
 * public (own domain through a reverse proxy, Cloudflare Tunnel, or a port
 * forward), with what becomes reachable said first and a self-test before
 * the link is shown; the host sharing catalogue items (off until switched
 * on, rights confirmed per item, confidential items blocked by the server);
 * and a member loading what the host shares, every file checked by hash.
 */

import { useEffect, useMemo, useState } from 'react';
import { t, useLang } from '../../i18n';
import { session } from '../../session/client';
import { itemBytes, loadShared, refreshShareIndex, sharedItems, unshare, useShareIndex, type CatalogEntry, type SharedItem } from '../../session/assets';
import { useLoadedRefs } from '../../session/dataRefs';
import { needSource, refreshHostRoom, useRoom } from '../../session/room';
import { shareEntries, sizeText } from './shareFlow';
import { goPublic, refreshPublic, stopPublic, usePublic, type PublicMode } from '../../session/public';
import { useSessionStore } from '../../session/store';
import { toast } from '../shell/kit';

const MODES: PublicMode[] = ['own-domain', 'cloudflare', 'port-forward'];


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
  const failed = status.phase === 'failed' && !!status.error;
  return (
    <section className="session-sec session-public">
      <h3>{t('session.public.title')}</h3>
      {!on && (
        <>
          <p className="session-hint">{t('session.public.lead')}</p>
          <div className="session-step">
            <span className="session-step-n" aria-hidden="true">1</span>
            {t('session.public.how')}
          </div>
          <div className="session-choices" role="radiogroup" aria-label={t('session.public.how')}>
            {MODES.map((m) => (
              <label key={m} className={`session-choice${pick === m ? ' on' : ''}${modes[m]?.available ? '' : ' off'}`}>
                <input type="radio" name="public-mode" checked={pick === m} disabled={!modes[m]?.available || busy} onChange={() => setMode(m)} />
                <span className="session-choice-text">
                  <span>{label(m)}</span>
                  {!modes[m]?.available && <span className="session-flag">{t(`session.public.unavailable.${m}`)}</span>}
                </span>
              </label>
            ))}
          </div>
          <div className="session-step">
            <span className="session-step-n" aria-hidden="true">2</span>
            {t('session.public.step.read')}
          </div>
          <ul className="session-note" role="note">
            <li>{t('session.public.reachable')}</li>
            <li>{modes[pick]?.showsAddress ? t('session.public.addressShown') : t('session.public.addressHidden')}</li>
            <li>{t('session.public.waitingRoom')}</li>
          </ul>
          <div className="session-step">
            <span className="session-step-n" aria-hidden="true">3</span>
            {t('session.public.step.start')}
          </div>
          {failed && (
            <div className="session-error" role="alert">
              <div>{t('session.public.error', { error: status.error ?? '' })}</div>
              <div className="session-todo">{t('session.public.failedTodo')}</div>
            </div>
          )}
          <label className="session-check">
            <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
            {t('session.public.understood')}
          </label>
          <button type="button" className="primary" disabled={!understood || busy || !modes[pick]?.available} onClick={() => void start()}>
            {busy ? t('session.public.starting') : failed ? t('session.public.retry') : t('session.public.start')}
          </button>
        </>
      )}
      {on && (
        <>
          <div className="session-live" role="status">
            <span className="dot" aria-hidden="true" />
            {t('session.public.on', { how: label(status.mode ?? pick) })}
          </div>
          <ul className="session-checks">
            {status.checks.map((c) => (
              <li key={c.what} className={c.ok ? 'ok' : 'bad'}>
                <span className="session-glyph">{c.ok ? '✓' : '✗'}</span>
                <span>
                  {t(`session.public.check.${c.what}`)}
                  {!c.ok && c.detail ? <span className="session-flag"> - {c.detail}</span> : ''}
                </span>
              </li>
            ))}
          </ul>
          {status.checks.some((c) => !c.ok) && <p className="session-hint">{t('session.public.checkHint')}</p>}
          {join ? (
            <div className="session-link">
              <input readOnly value={join} aria-label={t('session.public.link')} onFocus={(e) => e.target.select()} />
              <button type="button" className="primary small" onClick={() => void navigator.clipboard?.writeText(join).then(() => toast(t('session.public.copied'), 'good'))}>
                {t('session.invite.copy')}
              </button>
            </div>
          ) : (
            <p className="session-hint">{t('session.public.noUrl', { port: modes['port-forward']?.port ?? 7878 })}</p>
          )}
          <button type="button" className="danger" disabled={busy} onClick={() => void stopPublic().then(() => toast(t('session.public.stopped'), 'good'))}>
            {t('session.public.stop')}
          </button>
        </>
      )}
    </section>
  );
}

/** The rights tick, for this tab's session: "I may share what I pick here". */
const RIGHTS_KEY = 'heat3d.session.shareRights';
function readRights(): boolean {
  try {
    return sessionStorage.getItem(RIGHTS_KEY) === '1';
  } catch {
    return false;
  }
}
export function useShareRights(): [boolean, (v: boolean) => void] {
  const [v, set] = useState(readRights);
  return [
    v,
    (x: boolean) => {
      set(x);
      try {
        sessionStorage.setItem(RIGHTS_KEY, x ? '1' : '0');
      } catch {
        /* this time only */
      }
    },
  ];
}

/**
 * The host: share with the others. The loaded level (with its textures,
 * terrain and layouts), the data, or any items of the catalogue folder ticked
 * and shared with one press; what is shared moves to its own list.
 */
export function ShareAssets() {
  useLang();
  const role = useSessionStore((s) => s.role);
  const status = usePublic((s) => s.status);
  const index = useShareIndex((s) => s.index);
  const room = useRoom((s) => s.doc);
  const dataset = useSessionStore((s) => s.info?.dataset ?? null);
  useLoadedRefs((s) => s.version);
  const [filter, setFilter] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [rights, setRights] = useShareRights();
  useEffect(() => {
    if (role === 'host') void refreshShareIndex();
  }, [role]);
  const sharedPaths = useMemo(() => new Set((index?.shared ?? []).map((s) => s.path ?? '')), [index]);
  const open = useMemo(() => (index?.items ?? []).filter((i) => !sharedPaths.has(i.path)), [index, sharedPaths]);
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return open.filter((i) => !f || `${i.game} ${i.name} ${i.kind}`.toLowerCase().includes(f)).slice(0, 60);
  }, [open, filter]);
  if (role !== 'host') return null;
  // Members fetch shared files from this server: through the own domain or a port forward they see its address.
  const publicMode = status?.phase === 'on' ? status.mode : null;
  const showsAddress = publicMode === 'own-domain' || publicMode === 'port-forward';
  const levelNeed = room.needs.find((n) => n.id === room.level);
  const levelItem = levelNeed ? needSource(levelNeed.id) : undefined;
  const levelShared = !!levelNeed && room.offers.some((o) => o.need === levelNeed.id);
  const gameItems = levelItem
    ? room.needs.filter((n) => (n.kind === 'catalog' || n.kind === 'model-pack') && !room.offers.some((o) => o.need === n.id)).map((n) => needSource(n.id)).filter((x): x is CatalogEntry => !!x)
    : [];
  const dataNeed = room.needs.find((n) => n.kind === 'data');
  const dataShared = !!dataNeed && !!dataset?.published && dataset.name === dataNeed.name;
  const go = async (items: CatalogEntry[], data: { name: string; size: number } | null = null) => {
    if (showsAddress && !consent) {
      toast(t('session.share.needConsent'), 'bad');
      return;
    }
    setBusy(true);
    try {
      await shareEntries(items, { rightsGiven: rights, data });
      setPicked(new Set());
    } finally {
      setBusy(false);
    }
  };
  const pickedItems = open.filter((i) => picked.has(i.path));
  const pickedBytes = pickedItems.reduce((a, i) => a + itemBytes(i), 0);
  const toggle = (path: string) => {
    const next = new Set(picked);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setPicked(next);
  };
  return (
    <section className="session-sec" data-testid="share-assets">
      <h3>{t('session.share.title')}</h3>
      <p className="session-hint">{t('session.share.lead')}</p>
      <label className="session-check">
        <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} data-testid="share-rights" />
        {t('session.share.rightsTick')}
      </label>
      {showsAddress && (
        <label className="session-check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          {t('session.share.addressConsent')}
        </label>
      )}
      <div className="session-actions">
        {levelItem && !levelShared && (
          <button type="button" className="primary" disabled={busy} data-testid="share-level" onClick={() => void go([levelItem, ...gameItems])}>
            {t(gameItems.length ? 'session.share.levelWithPacks' : 'session.share.level', { name: levelItem.name, size: sizeText(itemBytes(levelItem) + gameItems.reduce((a, i) => a + itemBytes(i), 0)) })}
          </button>
        )}
        {levelNeed && !levelItem && <p className="session-hint">{t('session.share.levelNotInFolder', { name: levelNeed.name })}</p>}
        {levelShared && <p className="session-hint">{t('session.share.levelShared', { name: levelNeed!.name })}</p>}
        {dataNeed && !dataShared && (
          <button type="button" disabled={busy} data-testid="share-data" onClick={() => void go([], { name: dataNeed.name, size: dataNeed.size })}>
            {t('session.share.data', { name: dataNeed.name, size: sizeText(dataNeed.size) })}
          </button>
        )}
      </div>
      {index && !index.available && <p className="session-hint">{t('session.share.noCatalog')}</p>}
      {index?.available && (
        <details className="session-more" open={picked.size > 0 || undefined}>
          <summary>{t('session.share.pickTitle', { n: open.length })}</summary>
          {open.some((i) => i.confidential) && <p className="session-hint">{t('session.share.confidentialHint')}</p>}
          <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t('session.share.filter')} aria-label={t('session.share.filter')} />
          <ul className="session-list" data-testid="share-can">
            {shown.map((it) => (
              <li key={it.path} className="session-member-row">
                <label className="session-check session-pick">
                  <input type="checkbox" checked={picked.has(it.path)} onChange={() => toggle(it.path)} />
                  <span className="session-name" title={`${it.game} · ${t(`session.share.kind.${it.kind}`)}`}>
                    {it.name}
                  </span>
                </label>
                <span className="session-flag">
                  {it.game ? `${it.game} · ` : ''}
                  {t(`session.share.kind.${it.kind}`)} · {sizeText(itemBytes(it))}
                  {it.extracted ? ` · ${t('session.share.extracted')}` : ''}
                  {it.confidential ? ` · ${t('session.share.confidential')}` : ''}
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="primary" disabled={busy || !picked.size} data-testid="share-picked" onClick={() => void go(pickedItems)}>
            {busy ? t('session.share.sharing') : t('session.share.sharePicked', { n: picked.size, size: sizeText(pickedBytes) })}
          </button>
        </details>
      )}
      {(index?.shared.length ?? 0) > 0 && (
        <>
          <h4>{t('session.share.sharedTitle')}</h4>
          <ul className="session-list" data-testid="share-done">
            {index!.shared.map((s) => (
              <li key={s.id} className="session-member-row">
                <span className="session-name">{s.name}</span>
                <span className="session-flag">
                  {t(`session.share.kind.${s.kind}`)} · {sizeText(s.size)}
                </span>
                <button type="button" className="ghost small" onClick={() => void unshare(s.id).then(refreshHostRoom)}>
                  {t('session.share.stop')}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/** A member: what the host shares, each loaded with every file checked by hash. */
export function SharedByHost() {
  useLang();
  const role = useSessionStore((s) => s.role);
  const state = useSessionStore((s) => s.state);
  const offers = useRoom((s) => s.doc.offers);
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
  }, [role, state, offers.length]);
  if (role === 'host' || !items.length) return null;
  const load = async (it: SharedItem) => {
    setBusy({ id: it.id, done: 0, all: it.files });
    try {
      const where = await loadShared(it, (done, all) => setBusy({ id: it.id, done, all }));
      toast(t(where === 'level' ? 'session.share.loadedLevel' : where === 'pack' ? 'session.share.loadedPack' : 'session.share.kept', { name: it.name }), 'good');
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
              {t(`session.share.kind.${it.kind}`)} · {sizeText(it.size)}
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
