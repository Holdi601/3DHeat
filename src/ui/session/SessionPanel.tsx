/**
 * The session panel: joining (name, password, the server), and once in,
 * the members with their roles, the waiting room, view sync, follow,
 * "look here", marks, invites, bans, the host's settings, the host's data, and saving
 * and opening the session. Every button a role cannot use is left out; the
 * server checks again anyway.
 */

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { int, t, useLang } from '../../i18n';
import { httpUrl, session } from '../../session/client';
import { publishData } from '../../session/assets';
import { appInvoke } from '../../appHost';
import { loadedData, handData } from '../../session/dataRefs';
import { useLevelRequest } from '../../session/levelRequest';
import { useMarks, eraseAll, eraseMine, type MarkTool } from '../../session/marks';
import { downloadSession, readAutosave, readSessionBlob, SESSION_EXT } from '../../session/sessionFile';
import { applyPending, closeOpenReport, findMissingData, restoreSession, useSessionOpen } from '../../session/sessionOpen';
import type { Engine } from '../../render/engine';
import { useStore } from '../../state/store';
import { rankOf, ROLES, useSessionStore, type SessionMember, type SessionRole } from '../../session/store';
import { useEngine } from '../EngineContext';
import { VideoSection } from './VideoSection';
import { Icon } from '../shell/Icon';
import { confirmDialog, toast } from '../shell/kit';
import { openSection } from '../shell/sections';
import { showLoadGroup } from '../panels/OpenData';
import { serverHint, defaultServer, urlIntent } from './sessionUrl';
import { GoPublic, ShareAssets, SharedByHost } from './PublicSection';
import { usePublic } from '../../session/public';

const roleLabel = (r: SessionRole) => t(`session.role.${r}`);

function RoleBadge({ role }: { role: SessionRole }) {
  return <span className={`session-role ${role}`}>{roleLabel(role)}</span>;
}

/** The state of the connection, in a word and a colour. */
export function ConnBadge() {
  useLang();
  const state = useSessionStore((s) => s.state);
  const pending = useSessionStore((s) => s.pending);
  return (
    <span className={`session-conn ${state}`} role="status" aria-live="polite">
      <span className="dot" aria-hidden="true" />
      {t(`session.state.${state}`)}
      {state === 'joined' && pending > 0 ? ` · ${t('session.pending', { n: pending })}` : ''}
    </span>
  );
}

/** The join errors with something the user can do about them: said under the error, the Join button below does it. */
const TODO = new Set(['badPassword', 'unreachable', 'protocol', 'full', 'dropped', 'refused']);

function JoinForm() {
  const name0 = (() => {
    try {
      return localStorage.getItem('heat3d.session.name') ?? '';
    } catch {
      return '';
    }
  })();
  const [name, setName] = useState(name0);
  const [password, setPassword] = useState('');
  const [server, setServer] = useState(defaultServer());
  const invite = urlIntent().invite;
  const error = useSessionStore((s) => s.error);
  const retryMs = useSessionStore((s) => s.retryMs);
  const state = useSessionStore((s) => s.state);
  const keepName = () => {
    try {
      localStorage.setItem('heat3d.session.name', name);
    } catch {
      /* not kept */
    }
  };
  const join = () => {
    keepName();
    session.join({ url: server || undefined, name, password, invite });
  };
  const canHost = useLocalHost(server);
  const host = async () => {
    keepName();
    try {
      const res = await fetch(`${httpUrl(server || undefined)}/api/host-claim`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (!res.ok) throw new Error(String(res.status));
      const { token } = (await res.json()) as { token?: string };
      if (!token) throw new Error('token');
      session.join({ url: server || undefined, name: name.trim() || 'Host', hostToken: token });
    } catch {
      toast(t('session.host.claimFailed'), 'bad', 5000);
    }
  };
  return (
    <form
      className="session-join"
      onSubmit={(e) => {
        e.preventDefault();
        join();
      }}
    >
      <label className="session-field">
        <span>{t('session.join.server')}</span>
        <input value={server} onChange={(e) => setServer(e.target.value)} placeholder="https://192.168.1.20:7878" spellCheck={false} />
      </label>
      <label className="session-field">
        <span>{t('session.join.name')}</span>
        <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />
      </label>
      {invite ? (
        <p className="session-hint">{t('session.join.invited')}</p>
      ) : (
        <label className="session-field">
          <span>{t('session.join.password')}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
      )}
      {error && (
        <div className="session-error" role="alert">
          {t(`session.error.${error}`)}
          {retryMs > 0 && error === 'lockedOut' ? ` ${t('session.retryIn', { min: Math.ceil(retryMs / 60000) })}` : ''}
          {TODO.has(error) && <div className="session-todo">{t(`session.todo.${error}`)}</div>}
        </div>
      )}
      <button type="submit" className="primary" disabled={state === 'connecting' || !name.trim()}>
        {t('session.join.button')}
      </button>
      {canHost && !invite && (
        <div className="session-host-here">
          <p className="session-hint">{t('session.host.hereHint')}</p>
          <button type="button" disabled={state === 'connecting'} onClick={() => void host()} data-testid="session-host-here">
            {t('session.host.here')}
          </button>
        </div>
      )}
      <p className="session-hint">{serverHint()}</p>
    </form>
  );
}

/**
 * The desktop app: "Host a session" starts the session server inside the app
 * and opens the host page in the browser, where the host invites people.
 */
function HostFromApp() {
  const [busy, setBusy] = useState(false);
  const invoke = appInvoke();
  if (!invoke) return null;
  const start = async () => {
    setBusy(true);
    try {
      await invoke('host_session');
      toast(t('session.host.appStarted'), 'good', 6000);
    } catch (e) {
      toast(t('session.host.appFailed', { why: String(e) }), 'bad', 8000);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="session-host-here">
      <button type="button" className="primary" disabled={busy} onClick={() => void start()}>
        {t('session.host.app')}
      </button>
      <p className="session-hint">{t('session.host.appHint')}</p>
    </div>
  );
}

/**
 * Whether this page is on the machine the session server runs on (its page,
 * or a dev server beside it, on loopback): the host may then take the host's
 * place without the host address ("Host this session").
 */
function useLocalHost(server: string): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let stop = false;
    const loop = (h: string) => h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
    let target: URL;
    try {
      target = new URL(httpUrl(server || undefined));
    } catch {
      setOk(false);
      return;
    }
    if (!loop(location.hostname) || !loop(target.hostname)) {
      setOk(false);
      return;
    }
    fetch(`${target.origin}/session.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { app?: string } | null) => !stop && setOk(j?.app === '3dheat'))
      .catch(() => !stop && setOk(false));
    return () => {
      stop = true;
    };
  }, [server]);
  return ok;
}

const DURATIONS: { ms: number; key: string }[] = [
  { ms: 5 * 60_000, key: 'session.duration.5m' },
  { ms: 60 * 60_000, key: 'session.duration.1h' },
  { ms: 24 * 60 * 60_000, key: 'session.duration.1d' },
  { ms: 0, key: 'session.duration.forever' },
];

function MemberRow({ m }: { m: SessionMember }) {
  const me = useSessionStore((s) => s.me);
  const myRole = useSessionStore((s) => s.role);
  const followPeer = useSessionStore((s) => s.followPeer);
  const peek = useSessionStore((s) => s.peek);
  const [open, setOpen] = useState(false);
  const canModerate = rankOf(myRole) >= rankOf('admin') && rankOf(myRole) > rankOf(m.role) && m.id !== me;
  const grantable = ROLES.filter((r) => r !== 'host' && (myRole === 'host' ? true : rankOf(r) < rankOf('admin')));
  const self = m.id === me;
  return (
    <li className={`session-member${m.connected ? '' : ' away'}`}>
      <div className="session-member-row">
        <span className="session-name" title={m.name}>
          {m.name}
          {self ? ` (${t('session.you')})` : ''}
        </span>
        <RoleBadge role={m.role} />
        {m.muted && <span className="session-flag">{t('session.muted')}</span>}
        {!m.connected && <span className="session-flag">{t('session.away')}</span>}
        {!self && m.connected && (
          <>
            <button
              type="button"
              className={`ghost small icon-btn${peek === m.id ? ' on' : ''}`}
              title={peek === m.id ? t('session.peek.back') : t('session.peek.see', { name: m.name })}
              aria-label={peek === m.id ? t('session.peek.back') : t('session.peek.see', { name: m.name })}
              aria-pressed={peek === m.id}
              onClick={() => (peek === m.id ? session.endPeek() : session.peek(m.id))}
            >
              <Icon name="eye" size={14} />
            </button>
            <button type="button" className="ghost small icon-btn" title={t('session.sync.askOne', { name: m.name })} aria-label={t('session.sync.askOne', { name: m.name })} onClick={() => session.askSync([m.id])}>
              <Icon name="sync" size={14} />
            </button>
            <button
              type="button"
              className={`ghost small${followPeer === m.id && peek === null ? ' on' : ''}`}
              title={t('session.followThem')}
              aria-pressed={followPeer === m.id && peek === null}
              onClick={() => session.followMember(followPeer === m.id && peek === null ? null : m.id)}
            >
              {followPeer === m.id && peek === null ? t('session.stopFollow') : t('session.follow')}
            </button>
          </>
        )}
        {canModerate && (
          <button type="button" className="ghost small" aria-expanded={open} onClick={() => setOpen(!open)} aria-label={t('session.moderate', { name: m.name })}>
            <Icon name="more" size={14} />
          </button>
        )}
      </div>
      {open && canModerate && (
        <div className="session-mod">
          <label className="session-inline">
            <span>{t('session.roleLabel')}</span>
            <select value={m.role} onChange={(e) => session.admin('setRole', m.id, { role: e.target.value as SessionRole })}>
              {grantable.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </label>
          <div className="session-actions">
            {m.muted ? (
              <button type="button" onClick={() => session.admin('unmute', m.id)}>
                {t('session.unmute')}
              </button>
            ) : (
              <select
                aria-label={t('session.mute')}
                value=""
                onChange={(e) => e.target.value !== '' && session.admin('mute', m.id, { durationMs: Number(e.target.value) })}
              >
                <option value="">{t('session.mute')}</option>
                {DURATIONS.map((d) => (
                  <option key={d.key} value={d.ms}>
                    {t(d.key)}
                  </option>
                ))}
              </select>
            )}
            <button type="button" onClick={() => session.admin('kick', m.id)}>
              {t('session.kick')}
            </button>
            <select
              aria-label={t('session.ban')}
              value=""
              onChange={async (e) => {
                const ms = e.target.value;
                if (ms === '') return;
                if (await confirmDialog(t('session.banConfirm', { name: m.name }), t('session.ban'))) session.admin('ban', m.id, { durationMs: Number(ms) });
              }}
            >
              <option value="">{t('session.ban')}</option>
              {DURATIONS.map((d) => (
                <option key={d.key} value={d.ms}>
                  {t(d.key)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </li>
  );
}

function WaitingRoom() {
  const waiting = useSessionStore((s) => s.waiting);
  const myRole = useSessionStore((s) => s.role);
  const [role, setRole] = useState<SessionRole>('viewer');
  if (!waiting.length) return null;
  const grantable = ROLES.filter((r) => r !== 'host' && (myRole === 'host' ? true : rankOf(r) < rankOf('admin')));
  return (
    <section className="session-sec" aria-label={t('session.waiting.title')}>
      <h3>{t('session.waiting.title', { n: waiting.length })}</h3>
      <label className="session-inline">
        <span>{t('session.waiting.as')}</span>
        <select value={role} onChange={(e) => setRole(e.target.value as SessionRole)}>
          {grantable.map((r) => (
            <option key={r} value={r}>
              {roleLabel(r)}
            </option>
          ))}
        </select>
      </label>
      <ul className="session-list">
        {waiting.map((w) => (
          <li key={w.id} className="session-member-row">
            <span className="session-name">{w.name}</span>
            <button type="button" className="primary small" onClick={() => session.admin('admit', w.id, { role })}>
              {t('session.waiting.admit')}
            </button>
            <button type="button" className="small" onClick={() => session.admin('deny', w.id)}>
              {t('session.waiting.deny')}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** View sync: keep the view in sync with everyone, take the host's changes only when asked, go back, ask others. */
function SyncSection() {
  const sync = useSessionStore((s) => s.sync);
  const back = useSessionStore((s) => s.syncBack);
  const role = useSessionStore((s) => s.role);
  const members = useSessionStore((s) => s.members);
  const host = members.find((m) => m.role === 'host' && m.connected);
  return (
    <section className="session-sec session-sync-sec">
      <h3>{t('session.sync.title')}</h3>
      <label className="session-check session-sync-main">
        <input type="checkbox" checked={sync.on} onChange={(e) => session.setSync({ on: e.target.checked })} />
        {t('session.sync.keep')}
      </label>
      <p className="session-hint">{t(sync.on ? 'session.sync.onHint' : 'session.sync.offHint')}</p>
      {role !== 'host' && sync.on && (
        <>
          <label className="session-check">
            <input type="checkbox" checked={sync.camera} onChange={(e) => session.setSync({ camera: e.target.checked })} />
            {t('session.sync.camera')}
          </label>
          <label className="session-check">
            <input type="checkbox" checked={sync.askHost} onChange={(e) => session.setSync({ askHost: e.target.checked })} />
            {t('session.sync.askHost')}
          </label>
        </>
      )}
      <div className="session-actions">
        <button type="button" className="small" disabled={!back} onClick={() => session.syncBack()}>
          {t('session.sync.back')}
        </button>
        <button type="button" className="small" onClick={() => session.askSync()}>
          {t('session.sync.askAll')}
        </button>
        {host && role !== 'host' && (
          <button type="button" className="small" onClick={() => session.askSync([host.id])}>
            {t('session.sync.askHostBtn')}
          </button>
        )}
      </div>
    </section>
  );
}

/** "Look where I look" and "follow me": requests each member takes or declines; and letting everyone go again. */
function LookHere() {
  const [note, setNote] = useState('');
  const role = useSessionStore((s) => s.role);
  const follow = useSessionStore((s) => s.follow);
  const me = useSessionStore((s) => s.me);
  const admin = rankOf(role) >= rankOf('admin');
  return (
    <section className="session-sec">
      <h3>{t('session.look.title')}</h3>
      <input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder={t('session.look.note')} aria-label={t('session.look.note')} />
      <div className="session-actions">
        <button type="button" className="primary" onClick={() => session.lookHere({ note })}>
          {t('session.look.send')}
        </button>
        <button type="button" onClick={() => (admin ? session.setFollow('follow', me ?? 0) : session.lookHere({ note, follow: true }))}>
          {t('session.look.followMe')}
        </button>
        <button type="button" onClick={() => session.releaseFollowers()}>
          {t('session.look.release')}
        </button>
      </div>
      {admin && follow.mode !== 'off' && follow.leader === me && <p className="session-hint">{t('session.look.askedAll')}</p>}
      <p className="session-hint">{t('session.look.limit')}</p>
    </section>
  );
}

export function MarkTools() {
  const tool = useMarks((s) => s.tool);
  const visible = useMarks((s) => s.visible);
  const role = useSessionStore((s) => s.role);
  const state = useSessionStore((s) => s.state);
  const canDraw = state !== 'joined' || rankOf(role) >= rankOf('draw');
  const canEraseAll = state !== 'joined' || rankOf(role) >= rankOf('elevated');
  const set = (x: MarkTool) => useMarks.getState().setTool(tool === x ? 'off' : x);
  return (
    <section className="session-sec">
      <h3>{t('session.marks.title')}</h3>
      {canDraw ? (
        <div className="seg">
          {(['pin', 'draw', 'erase'] as MarkTool[]).map((x) => (
            <button key={x} type="button" className={tool === x ? 'on' : ''} aria-pressed={tool === x} onClick={() => set(x)}>
              {t(`session.marks.${x}`)}
            </button>
          ))}
        </div>
      ) : (
        <p className="session-hint">{t('session.marks.viewerOnly')}</p>
      )}
      <div className="session-actions">
        <label className="session-check">
          <input type="checkbox" checked={visible} onChange={(e) => useMarks.getState().setVisible(e.target.checked)} />
          {t('session.marks.show')}
        </label>
        {canDraw && (
          <button type="button" className="small" onClick={eraseMine}>
            {t('session.marks.eraseMine')}
          </button>
        )}
        {canEraseAll && (
          <button
            type="button"
            className="small"
            onClick={async () => (await confirmDialog(t('session.marks.eraseAllConfirm'), t('session.marks.eraseAll'))) && eraseAll()}
          >
            {t('session.marks.eraseAll')}
          </button>
        )}
      </div>
      {tool !== 'off' && <p className="session-hint">{t(`session.marks.${tool}Hint`)}</p>}
    </section>
  );
}

/** The host's password for people without a link (at least 12 characters), and the waiting room. */
function PasswordSetting() {
  const role = useSessionStore((s) => s.role);
  const info = useSessionStore((s) => s.info);
  const [pw, setPw] = useState('');
  if (role !== 'host' || !info) return null;
  return (
    <div className="session-step-block">
      <div className="session-step">
        <span className="session-step-n" aria-hidden="true">1</span>
        {t('session.invite.stepPassword')}
      </div>
      <p className="session-hint">{info.passwordSet ? t('session.invite.passwordIsSet') : t('session.host.noPassword')}</p>
      <form
        className="session-link"
        onSubmit={(e) => {
          e.preventDefault();
          if (pw.length < 12) {
            toast(t('session.host.passwordShort'), 'bad');
            return;
          }
          session.settings({ password: pw });
          setPw('');
          toast(t('session.host.passwordSet'), 'good');
        }}
      >
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t('session.host.password')} aria-label={t('session.host.password')} autoComplete="new-password" data-testid="invite-password" />
        <button type="submit" className="small">
          {t('session.host.setPassword')}
        </button>
      </form>
      <label className="session-check">
        <input type="checkbox" checked={info.waitingRoom} disabled={!info.passwordSet} onChange={(e) => session.settings({ waitingRoom: e.target.checked })} />
        {t('session.host.waitingRoom')}
      </label>
    </div>
  );
}

/** "Invite people": the password, a time-limited invite link to copy, the network's join address and going public, in one place. */
function InvitePeople() {
  const role = useSessionStore((s) => s.role);
  const [open, setOpen] = useState(true);
  if (rankOf(role) < rankOf('admin')) return null;
  return (
    <section className="session-sec session-invite-sec" data-testid="invite-people">
      <button type="button" className={`session-invite-toggle${open ? ' on' : ''}`} aria-expanded={open} onClick={() => setOpen(!open)}>
        {t('session.invite.people')}
      </button>
      {open && (
        <>
          <PasswordSetting />
          <Invites />
          <ServerCard />
          <details className="session-more">
            <summary>{t('session.invite.fromInternet')}</summary>
            <GoPublic />
          </details>
        </>
      )}
    </section>
  );
}

/** The server's card (`/__heat3d/server`, the host's token): its join addresses on this network; null before it is read or without one. */
const useServerCard = create<{ card: { joins: string[] } | null; token: string }>(() => ({ card: null, token: '' }));

function useServerCardRead(): { joins: string[] } | null {
  const role = useSessionStore((s) => s.role);
  const card = useServerCard((s) => s.card);
  useEffect(() => {
    if (role !== 'host' || useServerCard.getState().token === session.hostToken()) return;
    useServerCard.setState({ token: session.hostToken() });
    const base = session.serverUrl() ? new URL(session.serverUrl()!, location.href).origin : location.origin;
    fetch(`${base}/__heat3d/server`, { headers: { Authorization: `Bearer ${session.hostToken()}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { joins?: unknown } | null) => useServerCard.setState({ card: j && Array.isArray(j.joins) ? { joins: j.joins.filter((x): x is string => typeof x === 'string') } : null }))
      .catch(() => undefined);
  }, [role]);
  return role === 'host' ? card : null;
}

function useServerJoins(): string[] {
  return useServerCardRead()?.joins ?? [];
}

/** The server's card (the host's): the join addresses on this network to copy, and stopping the server. */
function ServerCard() {
  const role = useSessionStore((s) => s.role);
  const card = useServerCardRead();
  if (role !== 'host' || !card) return null;
  const stopServer = async () => {
    if (!(await confirmDialog(t('session.server.stopConfirm'), t('session.server.stop')))) return;
    const base = session.serverUrl() ? new URL(session.serverUrl()!, location.href).origin : location.origin;
    await fetch(`${base}/__heat3d/server/stop`, { method: 'POST', headers: { Authorization: `Bearer ${session.hostToken()}` } }).catch(() => undefined);
    session.leave();
    toast(t('session.server.stopped'), 'good');
  };
  return (
    <div className="session-step-block" data-testid="server-card">
      <div className="session-step">
        <span className="session-step-n" aria-hidden="true">3</span>
        {t('session.server.lan')}
      </div>
      {card.joins.length === 0 && <p className="session-hint">{t('session.server.noLan')}</p>}
      {card.joins.map((j) => (
        <div key={j} className="session-link">
          <input readOnly value={j} aria-label={t('session.public.link')} onFocus={(e) => e.target.select()} />
          <button type="button" className="small" onClick={() => void navigator.clipboard?.writeText(j).then(() => toast(t('session.invite.copied'), 'good'))}>
            {t('session.invite.copy')}
          </button>
        </div>
      ))}
      <button type="button" className="danger small" onClick={() => void stopServer()}>
        {t('session.server.stop')}
      </button>
    </div>
  );
}

function Invites() {
  const role = useSessionStore((s) => s.role);
  const invites = useSessionStore((s) => s.invites);
  const last = useSessionStore((s) => s.lastInvite);
  const joins = useServerJoins();
  const [give, setGive] = useState<SessionRole>('draw');
  const [uses, setUses] = useState(1);
  const [hours, setHours] = useState(24);
  const [label, setLabel] = useState('');
  // While the session is public, invite links point at its public address.
  const pub = usePublic((s) => (s.status?.phase === 'on' ? s.status.url : null));
  if (rankOf(role) < rankOf('admin')) return null;
  const grantable = ROLES.filter((r) => r !== 'host' && (role === 'host' ? true : rankOf(r) < rankOf('admin')));
  // A host page on this PC's loopback (the page the server opened) gives others the network address, which they can reach.
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const lan = local && joins[0] ? joins[0].replace(/#join$/, '') : '';
  const link = last?.token ? `${pub ? `${pub.replace(/\/+$/, '')}/` : lan || `${location.origin}${location.pathname}`}#invite=${last.token}` : '';
  return (
    <div className="session-step-block">
      <div className="session-step">
        <span className="session-step-n" aria-hidden="true">2</span>
        {t('session.invite.stepLink')}
      </div>
      <div className="session-grid">
        <label className="session-field">
          <span>{t('session.invite.for')}</span>
          <input value={label} maxLength={200} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="session-field">
          <span>{t('session.roleLabel')}</span>
          <select value={give} onChange={(e) => setGive(e.target.value as SessionRole)}>
            {grantable.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
        </label>
        <label className="session-field">
          <span>{t('session.invite.uses')}</span>
          <input type="number" min={1} max={1000} value={uses} onChange={(e) => setUses(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))} />
        </label>
        <label className="session-field">
          <span>{t('session.invite.hours')}</span>
          <input type="number" min={1} max={168} value={hours} onChange={(e) => setHours(Math.max(1, Math.min(168, Number(e.target.value) || 24)))} />
        </label>
      </div>
      <button type="button" className="primary" onClick={() => session.invite(give, uses, hours * 3600_000, label)}>
        {t('session.invite.make')}
      </button>
      {link && (
        <div className="session-link" data-testid="invite-link">
          <input readOnly value={link} aria-label={t('session.invite.link')} onFocus={(e) => e.target.select()} />
          <button
            type="button"
            className="small"
            onClick={() => {
              void navigator.clipboard?.writeText(link).then(() => toast(t('session.invite.copied'), 'good'));
            }}
          >
            {t('session.invite.copy')}
          </button>
        </div>
      )}
      {link && last && last.expires > 0 && <p className="session-hint">{t('session.invite.until', { time: new Date(last.expires).toLocaleString() })}</p>}
      {invites.length > 0 && (
        <ul className="session-list">
          {invites.map((i) => (
            <li key={i.id} className="session-member-row">
              <span className="session-name">{i.label || t('session.invite.unnamed')}</span>
              <RoleBadge role={i.role} />
              <span className="session-flag">{t('session.invite.left', { n: i.uses })}</span>
              <button type="button" className="ghost small" onClick={() => session.admin('revokeInvite', 0, { ref: i.id })}>
                {t('session.invite.revoke')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Bans() {
  const role = useSessionStore((s) => s.role);
  const bans = useSessionStore((s) => s.bans);
  if (rankOf(role) < rankOf('admin') || !bans.length) return null;
  return (
    <section className="session-sec">
      <h3>{t('session.bans.title')}</h3>
      <ul className="session-list">
        {bans.map((b) => (
          <li key={b.id} className="session-member-row">
            <span className="session-name">{b.name}</span>
            <span className="session-flag">{b.until ? t('session.bans.until', { time: new Date(b.until).toLocaleTimeString() }) : t('session.duration.forever')}</span>
            <button type="button" className="ghost small" onClick={() => session.admin('unban', 0, { ref: b.id })}>
              {t('session.bans.unban')}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HostSettings() {
  const role = useSessionStore((s) => s.role);
  const info = useSessionStore((s) => s.info);
  const [rights, setRights] = useState(false);
  const [busy, setBusy] = useState(false);
  if (role !== 'host' || !info) return null;
  const publish = async () => {
    const { files } = loadedData();
    if (!files.length) {
      toast(t('session.data.none'), 'bad');
      return;
    }
    setBusy(true);
    try {
      await publishData();
      toast(t('session.data.published'), 'good');
    } catch {
      toast(t('session.data.publishFailed'), 'bad');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="session-sec">
      <h3>{t('session.data.title')}</h3>
      <label className="session-check">
        <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} />
        {t('session.data.rights')}
      </label>
      <button type="button" disabled={!rights || busy} onClick={() => void publish()}>
        {busy ? t('session.data.publishing') : t('session.data.publish')}
      </button>
      <p className="session-hint">{t('session.data.hint')}</p>
    </section>
  );
}

/** For a member: the host's data, to fetch when it is not loaded here. */
function HostData() {
  const info = useSessionStore((s) => s.info);
  const role = useSessionStore((s) => s.role);
  const [busy, setBusy] = useState(false);
  const d = info?.dataset;
  if (!d || role === 'host') return null;
  const fetchIt = async () => {
    setBusy(true);
    try {
      const base = session.serverUrl() ? new URL(session.serverUrl()!, location.href).origin : location.origin;
      const res = await fetch(`${base}/a/${d.hash}`, { headers: { Authorization: `Bearer ${session.token()}` } });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      // Checked before it is used: a file that is not what the host named is dropped.
      const sum = new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()));
      const hex = [...sum].map((b) => b.toString(16).padStart(2, '0')).join('');
      if (hex !== d.hash) throw new Error('hash');
      handData([new File([blob], d.name)]);
      toast(t('session.data.fetched'), 'good');
    } catch {
      toast(t('session.data.fetchFailed'), 'bad');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="session-sec">
      <h3>{t('session.data.hostTitle')}</h3>
      <p className="session-hint">
        {d.name} · {int(Math.round(d.size / 1024))} KiB
      </p>
      {d.published ? (
        <button type="button" disabled={busy} onClick={() => void fetchIt()}>
          {busy ? t('session.data.fetching') : t('session.data.fetch')}
        </button>
      ) : (
        <p className="session-hint">{t('session.data.notPublished')}</p>
      )}
    </section>
  );
}

/** Picks a `.3dheat-session` and opens it (`restoreSession`), saying what went wrong. */
export function chooseSessionFile(engine: Engine | null): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = `${SESSION_EXT},application/json,.json`;
  input.style.display = 'none';
  document.body.appendChild(input);
  input.onchange = () => {
    const f = input.files?.[0];
    input.remove();
    if (f) void openChosen(engine, f);
  };
  input.oncancel = () => input.remove();
  input.click();
}

async function openChosen(engine: Engine | null, f: File): Promise<void> {
  try {
    const { file, packed } = await readSessionBlob(f);
    await restoreSession(engine, file, packed);
    toast(t('session.file.opened'), 'good');
    // The report is in the data panel too: where the missing data is loaded.
    if (!useSessionStore.getState().panel) showLoadGroup();
  } catch (e) {
    const k = e instanceof Error ? e.message : '';
    toast(t(['notSession', 'newer', 'notHost', 'loadFailed'].includes(k) ? `session.file.err.${k}` : 'session.file.err.notSession'), 'bad');
  }
}

/** Saving and opening a session file: alone or as the host. Its own thing: no server needed. */
export function SessionFiles() {
  const engine = useEngine();
  const state = useSessionStore((s) => s.state);
  const role = useSessionStore((s) => s.role);
  const [pack, setPack] = useState(false);
  const mayOpen = state !== 'joined' || role === 'host';
  const auto = state !== 'joined' ? readAutosave() : null;
  return (
    <section className="session-sec session-file-sec" aria-label={t('session.file.title')}>
      <h3>{t('session.file.title')}</h3>
      <p className="session-hint">{t('session.file.hint')}</p>
      <div className="session-actions">
        <button type="button" onClick={() => void downloadSession(engine, pack)}>
          {t('session.file.save')}
        </button>
        {mayOpen && (
          <button type="button" onClick={() => chooseSessionFile(engine)}>
            {t('session.file.open')}
          </button>
        )}
      </div>
      <label className="session-check">
        <input type="checkbox" checked={pack} onChange={(e) => setPack(e.target.checked)} />
        {t('session.file.pack')}
      </label>
      {auto && mayOpen && (
        <button type="button" className="small" onClick={() => void restoreSession(engine, auto, [])}>
          {t('session.file.restoreAuto', { time: new Date(auto.savedAt).toLocaleString() })}
        </button>
      )}
      <SessionOpenReport />
    </section>
  );
}

/** Shows the level panel, open, in the side panel. */
function toLevelPanel(): void {
  showLoadGroup();
  const id = 'heat.levelPanel.title';
  openSection(id);
  window.setTimeout(() => document.querySelector(`[data-section="${id}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 80);
}

/** What an opened session file named and is not here yet, kept up to date, with the ways to get it. */
export function SessionOpenReport() {
  useLang();
  const role = useSessionStore((s) => s.role);
  const r = useSessionOpen((s) => s.report);
  const missing = useSessionOpen((s) => s.missing);
  const pendingView = useSessionOpen((s) => s.pendingView);
  const viewMissing = useSessionOpen((s) => s.viewMissing);
  const finding = useSessionOpen((s) => s.finding);
  const kept = useSessionOpen((s) => s.keptFolder);
  const lv = useLevelRequest((s) => s.status);
  const loading = useStore((s) => s.load.active);
  if (!r) return null;
  const levelGap = !!r.level && lv !== 'loaded';
  const ok = !missing.length && !levelGap && !pendingView && !viewMissing.length && !r.unknown.length;
  const busy = finding === 'busy';
  return (
    <div className="session-report" role="status" data-testid="session-report">
      <div className="session-member-row">
        <strong>{ok ? t('session.report.ok') : t('session.report.title')}</strong>
        <button type="button" className="ghost small" onClick={closeOpenReport} aria-label={t('shell.close')}>
          <Icon name="close" size={13} />
        </button>
      </div>
      {r.views > 0 && <div>{t('session.report.views', { n: r.views })}</div>}
      {r.data.length > 0 && !missing.length && <div data-testid="session-report-data-ok">{t('session.report.dataOk', { n: r.data.length })}</div>}
      {missing.length > 0 && (
        <div data-testid="session-report-missing">
          {t('session.report.missing')}
          <ul>
            {missing.map((m) => (
              <li key={m.fingerprint}>
                {m.name} ({int(Math.round(m.size / 1024))} KiB)
              </li>
            ))}
          </ul>
          <div className="session-actions">
            <button type="button" className="primary small" disabled={busy || loading} onClick={() => void findMissingData('folder')} title={t('session.report.findFolderTitle')}>
              {t('session.report.findFolder')}
            </button>
            <button type="button" className="small" disabled={busy || loading} onClick={() => void findMissingData('files')}>
              {t('session.report.findFiles')}
            </button>
            {kept && (
              <button type="button" className="small" disabled={busy || loading} onClick={() => void findMissingData('kept')} title={t('session.report.findKeptTitle')}>
                {t('session.report.findKept', { folder: kept })}
              </button>
            )}
          </div>
          <div className="session-hint">{t('session.report.whereData')}</div>
        </div>
      )}
      {busy && <div>{t('session.report.finding')}</div>}
      {finding && finding !== 'busy' && missing.length > 0 && (
        <div data-testid="session-report-found">
          {t('session.report.found', { found: finding.found, total: finding.found + finding.still, looked: finding.looked })}
        </div>
      )}
      {missing.length > 0 && loading && <div>{t('session.report.dataLoading')}</div>}
      {r.packed.length > 0 && missing.length > 0 && (
        <button type="button" className="small" onClick={() => handData(r.packed, true)}>
          {t('session.report.loadPacked', { n: r.packed.length })}
        </button>
      )}
      {r.level && lv !== 'loaded' && (
        <div data-testid="session-report-level">
          {lv === 'pending' || lv === 'loading' ? t('session.report.levelLoading', { name: r.level }) : t('session.report.level', { name: r.level })}
          {lv !== 'pending' && lv !== 'loading' && (
            <div className="session-actions">
              <button type="button" className="small" onClick={toLevelPanel}>
                {t('session.report.toLevelPanel')}
              </button>
            </div>
          )}
        </div>
      )}
      {r.level && lv === 'loaded' && <div>{t('session.report.levelLoaded', { name: r.level })}</div>}
      {pendingView && (
        <div data-testid="session-report-view">
          {t('session.report.viewWaiting')}{' '}
          <button type="button" className="link" onClick={applyPending}>
            {t('session.report.viewNow')}
          </button>
        </div>
      )}
      {viewMissing.length > 0 && <div>{t('session.report.viewMissing', { list: viewMissing.join(', ') })}</div>}
      {r.unknown.length > 0 && <div>{t('session.report.unknown', { list: r.unknown.join(', ') })}</div>}
      {role === 'host' && r.invites.length > 0 && (
        <button
          type="button"
          className="small"
          onClick={() => {
            for (const i of r.invites) session.invite(i.role, 1, 24 * 3600_000, i.label);
          }}
        >
          {t('session.report.invites', { n: r.invites.length })}
        </button>
      )}
    </div>
  );
}

/** The panel itself: a card over the view's top right, beside the side panel. */
export function SessionPanel() {
  useLang();
  const panel = useSessionStore((s) => s.panel);
  const state = useSessionStore((s) => s.state);
  const info = useSessionStore((s) => s.info);
  const members = useSessionStore((s) => s.members);
  const role = useSessionStore((s) => s.role);
  if (!panel) return null;
  const inside = state === 'joined' || state === 'reconnecting';
  const close = () => useSessionStore.getState().setPanel(false);
  return (
    <div className="session-panel" role="dialog" aria-label={t('session.title')} onKeyDown={(e) => e.key === 'Escape' && close()}>
      <div className="session-head">
        <h2>{info && inside ? info.name : t('session.title')}</h2>
        <ConnBadge />
        <button type="button" className="ghost icon-btn" aria-label={t('shell.close')} title={t('shell.close')} onClick={close}>
          <Icon name="close" />
        </button>
      </div>
      <div className="session-body">
        {inside && info?.exposed && <div className="session-warn">{t('session.warn.exposed')}</div>}
        {inside && info && !info.tls && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1' && <div className="session-warn">{t('session.warn.noTls')}</div>}
        {state === 'off' || state === 'closed' || state === 'connecting' ? (
          <>
            {/* The file first and on its own: it needs no server. Joining one is the other half. */}
            <SessionFiles />
            <section className="session-sec session-server-sec" aria-label={t('session.server.title')}>
              <h3>{t('session.server.title')}</h3>
              <p className="session-hint">{t('session.server.hint')}</p>
              <HostFromApp />
              <JoinForm />
            </section>
            <MarkTools />
          </>
        ) : state === 'waiting' ? (
          <section className="session-sec">
            <p>{t('session.waitingForHost')}</p>
          </section>
        ) : (
          <>
            <InvitePeople />
            <ShareAssets />
            <section className="session-sec">
              <h3>
                {t('session.members', { n: members.filter((m) => m.connected).length })} {role && <RoleBadge role={role} />}
              </h3>
              <ul className="session-list">
                {members.map((m) => (
                  <MemberRow key={m.id} m={m} />
                ))}
              </ul>
            </section>
            <WaitingRoom />
            <SyncSection />
            <VideoSection />
            <LookHere />
            <MarkTools />
            <HostData />
            <SharedByHost />
            <Bans />
            <HostSettings />
            <SessionFiles />
          </>
        )}
        {state !== 'off' && (
          <button type="button" className="session-leave" onClick={() => session.leave()}>
            {t('session.leave')}
          </button>
        )}
      </div>
    </div>
  );
}
