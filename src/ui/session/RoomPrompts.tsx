/**
 * The room over the view (`session/room.ts`): the host's question when
 * members lack the map, the catalogue, a pack or the data ("share them with
 * them?"), a member's question when the host shared what is not here yet
 * ("download?"), and a member told what the host has that it lacks. The
 * driver keeps the room up to date: the host's from what is loaded and
 * shared, a member's from the host's room and what is loaded here.
 */

import { useEffect, useState } from 'react';
import { t, useLang } from '../../i18n';
import { refreshShareIndex, useShareIndex } from '../../session/assets';
import { useLoadedRefs } from '../../session/dataRefs';
import { useLacks } from '../../session/lacks';
import {
  acceptMemberAsk,
  checkMemberRoom,
  declineHostAsk,
  declineMemberAsk,
  needSource,
  publishRoom,
  registerRoomDoc,
  resetMemberRoom,
  updateHostAsk,
  useHostAsk,
  useMemberRoom,
  useRoom,
  type Need,
} from '../../session/room';
import { useSessionStore } from '../../session/store';
import { subscribeCatalogSelection } from '../../state/catalogSelection';
import { useStore } from '../../state/store';
import { useShareRights } from './PublicSection';
import { shareEntries, sizeText } from './shareFlow';

const needLabel = (n: { kind: string; name: string; game: string }) => t(`session.room.kind.${n.kind}`, { name: n.name, game: n.game });

/** Keeps the room: the host's published, a member's checked. Renders nothing. */
function RoomDriver() {
  const state = useSessionStore((s) => s.state);
  const role = useSessionStore((s) => s.role);
  const joined = state === 'joined';
  useEffect(() => {
    registerRoomDoc();
    // For the sharing smoke test (tools/smoke-session-share.mjs) and the console.
    const hook = (window as unknown as { __heat3dSession?: Record<string, unknown> }).__heat3dSession;
    if (hook) hook.room = { useRoom, useMemberRoom, useHostAsk, useShareIndex };
  }, []);
  // The host: the room follows the loaded map, the catalogue, what is shared and the data.
  useEffect(() => {
    if (!joined || role !== 'host') return;
    void refreshShareIndex().then(publishRoom);
    const subs = [
      useStore.subscribe((s, p) => s.level !== p.level && publishRoom()),
      // The levels folder's level and the unit models chosen for the data (state/catalogSelection.ts).
      subscribeCatalogSelection(() => publishRoom()),
      useShareIndex.subscribe(() => publishRoom()),
      useLoadedRefs.subscribe(() => publishRoom()),
      useSessionStore.subscribe((s, p) => s.info?.dataset !== p.info?.dataset && publishRoom()),
      // Asked again when a member joins, lacks something, or the map changes.
      useLacks.subscribe(() => updateHostAsk()),
      useRoom.subscribe(() => updateHostAsk()),
      useSessionStore.subscribe((s, p) => s.members !== p.members && updateHostAsk()),
    ];
    // The catalogue folder may change (a new extraction): read again now and then.
    const timer = window.setInterval(() => void refreshShareIndex(), 30_000);
    publishRoom();
    return () => {
      for (const u of subs) u();
      window.clearInterval(timer);
    };
  }, [joined, role]);
  // A member: the host's room against what is here.
  useEffect(() => {
    if (!joined || role === 'host' || !role) return;
    const check = () => void checkMemberRoom();
    const subs = [useRoom.subscribe(check), useStore.subscribe((s, p) => s.level !== p.level && check()), useLoadedRefs.subscribe(check)];
    check();
    return () => {
      for (const u of subs) u();
    };
  }, [joined, role]);
  useEffect(() => {
    if (state === 'off' || state === 'closed') resetMemberRoom();
  }, [state]);
  return null;
}

/**
 * The host: members lack what is on the host's screen. One press decides:
 * Allow all, Don't share, or Choose parts (a box per part, then one Share).
 */
function HostAsk() {
  const ask = useHostAsk((s) => s.ask);
  const [rights, setRights] = useShareRights();
  const [busy, setBusy] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [parts, setParts] = useState<Set<string> | null>(null);
  if (!ask) return null;
  const chosen = parts ?? new Set(ask.needs.map((n) => n.id));
  const share = async (ids: Set<string>) => {
    const needs = ask.needs.filter((n) => ids.has(n.id));
    const items = needs.map((n) => needSource(n.id)).filter((x): x is NonNullable<typeof x> => !!x);
    const data = needs.find((n) => n.kind === 'data');
    setBusy(true);
    try {
      // "Allow all" and "Share" are the host's confirmation; the panel's tick says it for later shares too.
      await shareEntries(items, { rightsGiven: true, data: data ? { name: data.name, size: data.size } : null });
      if (!rights) setRights(true);
    } finally {
      setBusy(false);
      setChoosing(false);
      setParts(null);
      // What the host left out is not asked about again until something new comes.
      const left = ask.needs.some((n) => !ids.has(n.id));
      if (left) declineHostAsk();
      else useHostAsk.setState({ ask: null });
      updateHostAsk();
    }
  };
  const toggle = (id: string) => {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setParts(next);
  };
  const total = ask.needs.filter((n) => chosen.has(n.id)).reduce((a, n) => a + n.size, 0);
  return (
    <div className="session-room-card" role="alertdialog" aria-label={t('session.room.hostTitle')} data-testid="room-host-ask">
      <strong>{t('session.room.hostTitle')}</strong>
      <p>{t('session.room.hostLacks', { who: ask.members.join(', '), n: ask.members.length })}</p>
      <ul className={`session-room-list${choosing ? ' choosing' : ''}`}>
        {ask.needs.map((n: Need) => {
          const label = (
            <>
              {needLabel(n)}
              {n.size ? ` · ${sizeText(n.size)}` : ''}
              {needSource(n.id)?.extracted ? ` · ${t('session.share.extracted')}` : ''}
              {needSource(n.id)?.confidential ? ` · ${t('session.share.confidential')}` : ''}
              {ask.members.length > 1 && ask.who[n.id] ? <span className="session-flag"> ({ask.who[n.id].join(', ')})</span> : null}
            </>
          );
          return (
            <li key={n.id}>
              {choosing ? (
                <label className="session-check">
                  <input type="checkbox" checked={chosen.has(n.id)} onChange={() => toggle(n.id)} data-testid={`room-part-${n.kind}`} />
                  <span>{label}</span>
                </label>
              ) : (
                label
              )}
            </li>
          );
        })}
      </ul>
      <p className="session-hint">{t('session.room.hostDecide')}</p>
      {choosing ? (
        <div className="session-actions">
          <button type="button" className="primary" disabled={busy || chosen.size === 0} onClick={() => void share(chosen)} data-testid="room-host-share-parts">
            {busy ? t('session.share.sharing') : t('session.room.shareParts', { n: chosen.size, size: sizeText(total) })}
          </button>
          <button type="button" disabled={busy} onClick={() => setChoosing(false)}>
            {t('shell.confirm.cancel')}
          </button>
        </div>
      ) : (
        <div className="session-actions">
          <button type="button" className="primary" disabled={busy} onClick={() => void share(new Set(ask.needs.map((n) => n.id)))} data-testid="room-host-share">
            {busy ? t('session.share.sharing') : t('session.room.allowAll', { size: sizeText(total) })}
          </button>
          <button type="button" disabled={busy} onClick={declineHostAsk} data-testid="room-host-decline">
            {t('session.room.dontShare')}
          </button>
          <button type="button" className="ghost" disabled={busy} onClick={() => setChoosing(true)} data-testid="room-host-choose">
            {t('session.room.chooseParts')}
          </button>
        </div>
      )}
    </div>
  );
}

/** A member: the host shared what is not here; download it? Then it loads by itself. */
function MemberAsk() {
  const ask = useMemberRoom((s) => s.ask);
  const progress = useMemberRoom((s) => s.progress);
  const error = useMemberRoom((s) => s.error);
  const needs = useRoom((s) => s.doc.needs);
  const status = useMemberRoom((s) => s.status);
  const missing = needs.filter((n) => status[n.id] === 'missing');
  if (progress) {
    return (
      <div className="session-room-card" role="status" data-testid="room-member-progress">
        {t('session.room.downloading', { name: progress.name, done: progress.done, all: progress.all })}
      </div>
    );
  }
  if (ask.length) {
    const total = ask.reduce((a, o) => a + o.size, 0);
    return (
      <div className="session-room-card" role="alertdialog" aria-label={t('session.room.memberTitle')} data-testid="room-member-ask">
        <strong>{t('session.room.memberTitle')}</strong>
        <ul className="session-room-list">
          {ask.map((o) => (
            <li key={o.manifest}>
              {needLabel({ kind: o.kind === 'level' || o.kind === 'course' ? 'level' : o.kind, name: o.name, game: o.game })} · {sizeText(o.size)}
              {o.confidential ? ` · ${t('session.share.confidential')}` : ''}
            </li>
          ))}
        </ul>
        <p className="session-hint">{t('session.room.memberQuestion', { size: sizeText(total) })}</p>
        <div className="session-actions">
          <button type="button" className="primary" onClick={() => void acceptMemberAsk()} data-testid="room-member-yes">
            {t('session.room.yes')}
          </button>
          <button type="button" onClick={declineMemberAsk} data-testid="room-member-no">
            {t('session.room.no')}
          </button>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="session-room-card bad" role="alert">
        {t('session.room.failed', { name: error })}
        <button type="button" className="ghost small" onClick={() => useMemberRoom.setState({ error: null })}>
          {t('shell.close')}
        </button>
      </div>
    );
  }
  if (missing.length) {
    return (
      <div className="session-room-card info" role="status" data-testid="room-member-missing">
        {t('session.room.missing', { list: missing.map(needLabel).join(', ') })}
      </div>
    );
  }
  return null;
}

export function RoomPrompts() {
  useLang();
  const role = useSessionStore((s) => s.role);
  const state = useSessionStore((s) => s.state);
  return (
    <>
      <RoomDriver />
      {state === 'joined' && <div className="session-room">{role === 'host' ? <HostAsk /> : <MemberAsk />}</div>}
    </>
  );
}
