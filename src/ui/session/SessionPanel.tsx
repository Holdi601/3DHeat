/**
 * The session panel: joining (name, password, the server), and once in,
 * the members with their roles, the waiting room, follow, "look here",
 * marks, invites, bans, the host's settings, the host's data, and saving
 * and opening the session. Every button a role cannot use is left out; the
 * server checks again anyway.
 */

import { useEffect, useRef, useState } from 'react';
import { int, t, useLang } from '../../i18n';
import { session } from '../../session/client';
import { loadedData, handData } from '../../session/dataRefs';
import { useMarks, browserKey, type MarkTool } from '../../session/marks';
import { downloadSession, openSession, readAutosave, readSessionBlob, SESSION_EXT, type LoadReport } from '../../session/sessionFile';
import { rankOf, ROLES, useSessionStore, type SessionMember, type SessionRole } from '../../session/store';
import { useEngine } from '../EngineContext';
import { Icon } from '../shell/Icon';
import { confirmDialog, toast } from '../shell/kit';
import { serverHint, defaultServer, urlIntent } from './sessionUrl';

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
  const join = () => {
    try {
      localStorage.setItem('heat3d.session.name', name);
    } catch {
      /* not kept */
    }
    session.join({ url: server || undefined, name, password, invite });
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
        </div>
      )}
      <button type="submit" className="primary" disabled={state === 'connecting' || !name.trim()}>
        {t('session.join.button')}
      </button>
      <p className="session-hint">{serverHint()}</p>
    </form>
  );
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
          <button
            type="button"
            className={`ghost small${followPeer === m.id ? ' on' : ''}`}
            title={t('session.followThem')}
            aria-pressed={followPeer === m.id}
            onClick={() => useSessionStore.getState().patch({ followPeer: followPeer === m.id ? null : m.id })}
          >
            {followPeer === m.id ? t('session.stopFollow') : t('session.follow')}
          </button>
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

function FollowControls() {
  const follow = useSessionStore((s) => s.follow);
  const me = useSessionStore((s) => s.me);
  const role = useSessionStore((s) => s.role);
  if (rankOf(role) < rankOf('admin')) return null;
  const mine = follow.leader === me;
  return (
    <section className="session-sec">
      <h3>{t('session.followSec')}</h3>
      <div className="seg">
        <button type="button" className={follow.mode === 'off' ? 'on' : ''} aria-pressed={follow.mode === 'off'} onClick={() => session.setFollow('off')}>
          {t('session.follow.off')}
        </button>
        <button type="button" className={follow.mode === 'follow' && mine ? 'on' : ''} aria-pressed={follow.mode === 'follow' && mine} onClick={() => session.setFollow('follow', me ?? 0)}>
          {t('session.follow.follow')}
        </button>
        <button type="button" className={follow.mode === 'enforce' && mine ? 'on' : ''} aria-pressed={follow.mode === 'enforce' && mine} onClick={() => session.setFollow('enforce', me ?? 0)}>
          {t('session.follow.enforce')}
        </button>
      </div>
    </section>
  );
}

function LookHere() {
  const [note, setNote] = useState('');
  return (
    <section className="session-sec">
      <h3>{t('session.look.title')}</h3>
      <input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder={t('session.look.note')} aria-label={t('session.look.note')} />
      <div className="session-actions">
        <button type="button" className="primary" onClick={() => session.lookHere({ note })}>
          {t('session.look.send')}
        </button>
        <button type="button" onClick={() => session.lookHere({ note, follow: true })}>
          {t('session.look.followMe')}
        </button>
      </div>
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
          <button type="button" className="small" onClick={() => useMarks.getState().removeWhere((k) => k === browserKey())}>
            {t('session.marks.eraseMine')}
          </button>
        )}
        {canEraseAll && (
          <button
            type="button"
            className="small"
            onClick={async () => (await confirmDialog(t('session.marks.eraseAllConfirm'), t('session.marks.eraseAll'))) && useMarks.getState().removeWhere(() => true)}
          >
            {t('session.marks.eraseAll')}
          </button>
        )}
      </div>
      {tool !== 'off' && <p className="session-hint">{t(`session.marks.${tool}Hint`)}</p>}
    </section>
  );
}

function Invites() {
  const role = useSessionStore((s) => s.role);
  const invites = useSessionStore((s) => s.invites);
  const last = useSessionStore((s) => s.lastInvite);
  const [give, setGive] = useState<SessionRole>('draw');
  const [uses, setUses] = useState(1);
  const [hours, setHours] = useState(24);
  const [label, setLabel] = useState('');
  if (rankOf(role) < rankOf('admin')) return null;
  const grantable = ROLES.filter((r) => r !== 'host' && (role === 'host' ? true : rankOf(r) < rankOf('admin')));
  const link = last?.token ? `${location.origin}${location.pathname}#invite=${last.token}` : '';
  return (
    <section className="session-sec">
      <h3>{t('session.invite.title')}</h3>
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
          <input type="number" min={1} max={100} value={uses} onChange={(e) => setUses(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} />
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
        <div className="session-link">
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
    </section>
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
  const [pw, setPw] = useState('');
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
      const f = files[0];
      const base = session.serverUrl() ? new URL(session.serverUrl()!, location.href).origin : location.origin;
      const res = await fetch(`${base}/api/publish?name=${encodeURIComponent(f.name)}`, { method: 'POST', headers: { Authorization: `Bearer ${session.hostToken()}` }, body: f });
      if (!res.ok) throw new Error(String(res.status));
      const { hash, size } = (await res.json()) as { hash: string; size: number };
      session.dataset({ name: f.name, hash, size, published: true });
      toast(t('session.data.published'), 'good');
    } catch {
      toast(t('session.data.publishFailed'), 'bad');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="session-sec">
      <h3>{t('session.host.title')}</h3>
      <label className="session-check">
        <input type="checkbox" checked={info.waitingRoom} disabled={!info.passwordSet} onChange={(e) => session.settings({ waitingRoom: e.target.checked })} />
        {t('session.host.waitingRoom')}
      </label>
      {!info.passwordSet && <p className="session-hint">{t('session.host.noPassword')}</p>}
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
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t('session.host.password')} aria-label={t('session.host.password')} autoComplete="new-password" />
        <button type="submit" className="small">
          {t('session.host.setPassword')}
        </button>
      </form>
      <h4>{t('session.data.title')}</h4>
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

/** Saving and opening a session file: alone or as the host. */
export function SessionFiles() {
  const engine = useEngine();
  const state = useSessionStore((s) => s.state);
  const role = useSessionStore((s) => s.role);
  const [pack, setPack] = useState(false);
  const [report, setReport] = useState<LoadReport | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const mayOpen = state !== 'joined' || role === 'host';
  const auto = state !== 'joined' ? readAutosave() : null;
  const open = async (f: File) => {
    try {
      const { file, packed } = await readSessionBlob(f);
      setReport(await openSession(engine, file, packed));
      toast(t('session.file.opened'), 'good');
    } catch (e) {
      const k = e instanceof Error ? e.message : '';
      toast(t(['notSession', 'newer', 'notHost', 'loadFailed'].includes(k) ? `session.file.err.${k}` : 'session.file.err.notSession'), 'bad');
    }
  };
  useEffect(() => {
    const onOpen = () => input.current?.click();
    window.addEventListener('heat3d:open-session', onOpen);
    return () => window.removeEventListener('heat3d:open-session', onOpen);
  }, []);
  return (
    <section className="session-sec">
      <h3>{t('session.file.title')}</h3>
      <div className="session-actions">
        <button type="button" onClick={() => void downloadSession(engine, pack)}>
          {t('session.file.save')}
        </button>
        {mayOpen && (
          <button type="button" onClick={() => input.current?.click()}>
            {t('session.file.open')}
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept={`${SESSION_EXT},application/json`}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) void open(f);
          }}
        />
      </div>
      <label className="session-check">
        <input type="checkbox" checked={pack} onChange={(e) => setPack(e.target.checked)} />
        {t('session.file.pack')}
      </label>
      {auto && mayOpen && (
        <button type="button" className="small" onClick={() => void openSession(engine, auto, []).then(setReport)}>
          {t('session.file.restoreAuto', { time: new Date(auto.savedAt).toLocaleString() })}
        </button>
      )}
      {report && <LoadReportView r={report} onClose={() => setReport(null)} />}
    </section>
  );
}

function LoadReportView({ r, onClose }: { r: LoadReport; onClose: () => void }) {
  const role = useSessionStore((s) => s.role);
  const ok = !r.missing.length && !r.level && !r.viewMissing.length && !r.unknown.length;
  return (
    <div className="session-report" role="status">
      <div className="session-member-row">
        <strong>{ok ? t('session.report.ok') : t('session.report.title')}</strong>
        <button type="button" className="ghost small" onClick={onClose} aria-label={t('shell.close')}>
          <Icon name="close" size={13} />
        </button>
      </div>
      {r.views > 0 && <div>{t('session.report.views', { n: r.views })}</div>}
      {r.missing.length > 0 && (
        <div>
          {t('session.report.missing')}
          <ul>
            {r.missing.map((m) => (
              <li key={m.fingerprint}>
                {m.name} ({int(Math.round(m.size / 1024))} KiB)
              </li>
            ))}
          </ul>
          <div className="session-hint">{t('session.report.whereData')}</div>
        </div>
      )}
      {r.packed.length > 0 && (
        <button type="button" className="small" onClick={() => handData(r.packed)}>
          {t('session.report.loadPacked', { n: r.packed.length })}
        </button>
      )}
      {r.level && <div>{t('session.report.level', { name: r.level })}</div>}
      {r.viewMissing.length > 0 && <div>{t('session.report.viewMissing', { list: r.viewMissing.join(', ') })}</div>}
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
            <JoinForm />
            <MarkTools />
            <SessionFiles />
          </>
        ) : state === 'waiting' ? (
          <section className="session-sec">
            <p>{t('session.waitingForHost')}</p>
          </section>
        ) : (
          <>
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
            <FollowControls />
            <LookHere />
            <MarkTools />
            <HostData />
            <Invites />
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
