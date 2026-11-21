/**
 * The connection to a session server (`3dheat serve`, or the one inside the
 * desktop app): one WebSocket, protobuf messages both ways
 * (`native/proto/heat3d/session/v1/session.proto`).
 *
 * What arrives goes to the session store (members, follow, requests), to
 * `presence.ts` (cameras), or to the shared layers (`shared.ts`); nothing of
 * it runs in the render loop. Presence goes out ten times a second when the
 * camera moved; edits to the shared layers go out paced, at most fifteen
 * batches a second, so a big board seeding the session never trips the
 * server's limits. A dropped connection comes back by itself with the same
 * place in the session (its resume token) and catches up on what it missed.
 */

import { create as createMsg, fromBinary, toBinary, type MessageInitShape } from '@bufbuild/protobuf';
import type { Engine } from '../render/engine';
import { useRaceStore } from '../state/raceStore';
import { useStore } from '../state/store';
import type { DocOp } from '../tactics/ops';
import {
  AdminKind,
  ClientMsgSchema,
  CloseReason,
  Err,
  FollowMode,
  NoticeKind,
  OpKind,
  OpSchema,
  Role,
  ServerMsgSchema,
  type Op,
  type Pose as PoseMsg,
  type ServerMsg,
} from './proto/heat3d/session/v1/session_pb';
import { capturePose, pointUnder, poseMoved, presence, presenceClock } from './presence';
import { browserKey } from './marks';
import { identity, signChallenge } from './identity';
import { readDocState, SharedSync, type DocState, type OutBatch } from './shared';
import { useSessionStore, type FollowModeName, type LookRequest, type Pose, type SessionRole } from './store';

export const PROTO = 1;

const ROLE_NAME: Record<number, SessionRole> = { [Role.VIEWER]: 'viewer', [Role.DRAW]: 'draw', [Role.ELEVATED]: 'elevated', [Role.ADMIN]: 'admin', [Role.HOST]: 'host' };
const ROLE_NUM: Record<SessionRole, Role> = { viewer: Role.VIEWER, draw: Role.DRAW, elevated: Role.ELEVATED, admin: Role.ADMIN, host: Role.HOST };
const FOLLOW_NAME: Record<number, FollowModeName> = { [FollowMode.FOLLOW_OFF]: 'off', [FollowMode.FOLLOW]: 'follow', [FollowMode.ENFORCE]: 'enforce' };
const FOLLOW_NUM: Record<FollowModeName, FollowMode> = { off: FollowMode.FOLLOW_OFF, follow: FollowMode.FOLLOW, enforce: FollowMode.ENFORCE };

/** Why the server refused or closed, as a message key under `session.error.`. */
function errKey(code: Err): string {
  switch (code) {
    case Err.BAD_PASSWORD:
      return 'badPassword';
    case Err.LOCKED_OUT:
      return 'lockedOut';
    case Err.BANNED:
      return 'banned';
    case Err.FULL:
      return 'full';
    case Err.DENIED:
      return 'denied';
    case Err.FORBIDDEN:
      return 'forbidden';
    case Err.RATE_LIMITED:
      return 'rateLimited';
    case Err.MUTED:
      return 'muted';
    case Err.PROTOCOL:
      return 'protocol';
    default:
      return 'refused';
  }
}

export interface JoinOptions {
  /** The server: an http(s) or ws(s) address; the page's own server when absent. */
  url?: string;
  name: string;
  password?: string;
  invite?: string;
  hostToken?: string;
}

/** The WebSocket address of a server address (or of this page's own server). */
export function wsUrl(url?: string): string {
  const base = url ? new URL(url, location.href) : new URL(location.href);
  const proto = base.protocol === 'https:' || base.protocol === 'wss:' ? 'wss:' : 'ws:';
  return `${proto}//${base.host}/ws`;
}

/** The http(s) address of the same server. */
export function httpUrl(url?: string): string {
  const base = url ? new URL(url, location.href) : new URL(location.href);
  const proto = base.protocol === 'wss:' || base.protocol === 'https:' ? 'https:' : 'http:';
  return `${proto}//${base.host}`;
}

const v3 = (v: { x: number; y: number; z: number }) => ({ x: v.x, y: v.y, z: v.z });

function poseMsg(p: Pose) {
  return { position: v3(p.position), forward: v3(p.forward), fov: p.fov, aspect: p.aspect, ortho: p.ortho, orthoHeight: p.orthoHeight };
}

function poseOf(m: PoseMsg | undefined): Pose | null {
  if (!m?.position || !m.forward) return null;
  return { position: v3(m.position), forward: v3(m.forward), fov: m.fov, aspect: m.aspect, ortho: m.ortho, orthoHeight: m.orthoHeight };
}

function opMsg(o: DocOp): MessageInitShape<typeof OpSchema> {
  switch (o.op) {
    case 'add':
      return { kind: OpKind.ADD, coll: o.coll, id: o.id, json: JSON.stringify(o.value), ...(o.index !== undefined ? { index: o.index } : {}) };
    case 'set':
      return { kind: OpKind.SET, coll: o.coll, id: o.id, json: JSON.stringify(o.fields), unset: o.unset ?? [] };
    case 'del':
      return { kind: OpKind.DEL, coll: o.coll, id: o.id };
    case 'meta':
      return { kind: OpKind.META, json: JSON.stringify(o.fields), unset: o.unset ?? [] };
  }
}

function opOf(m: Op): DocOp | null {
  try {
    const json = m.json ? (JSON.parse(m.json) as Record<string, unknown>) : {};
    if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
    switch (m.kind) {
      case OpKind.ADD:
        return { op: 'add', coll: m.coll, id: m.id, value: { ...json, id: m.id }, ...(m.index !== undefined ? { index: m.index } : {}) };
      case OpKind.SET:
        return { op: 'set', coll: m.coll, id: m.id, fields: json, ...(m.unset.length ? { unset: m.unset } : {}) };
      case OpKind.DEL:
        return { op: 'del', coll: m.coll, id: m.id };
      case OpKind.META:
        return { op: 'meta', fields: json, ...(m.unset.length ? { unset: m.unset } : {}) };
      default:
        return null;
    }
  } catch {
    return null;
  }
}

type Body = NonNullable<MessageInitShape<typeof ClientMsgSchema>['body']>;
type Pending = { kind: 'batch'; batch: OutBatch } | { kind: 'other'; what: string };

/** Batches sent a second, at most (the server allows twenty). */
const BATCHES_PER_SEC = 15;

class SessionClient {
  private ws: WebSocket | null = null;
  private opts: JoinOptions | null = null;
  private resume = '';
  private rid = 1;
  private acks = new Map<number, Pending>();
  private queue: OutBatch[] = [];
  private sentAt: number[] = [];
  private timers: number[] = [];
  private engine: Engine | null = null;
  private lastPose: Pose | null = null;
  private lastPoseSent = 0;
  private pointer: { x: number; y: number } | null = null;
  private retries = 0;
  private leaving = false;
  sync: SharedSync | null = null;

  setEngine(e: Engine | null): void {
    this.engine = e;
  }

  /** Where the pointer is over the view (CSS pixels), for the cursor others see; null when off it. */
  setPointer(p: { x: number; y: number } | null): void {
    this.pointer = p;
  }

  join(opts: JoinOptions): void {
    this.leave(false);
    this.leaving = false;
    this.opts = opts;
    this.resume = '';
    this.retries = 0;
    const st = useSessionStore.getState();
    st.patch({ state: 'connecting', error: null, url: wsUrl(opts.url), name: opts.name, members: [], waiting: [], bans: [], invites: [], looks: [], lastInvite: null, followPeer: null, followOptOut: false });
    this.sync = new SharedSync(
      (b) => this.enqueue(b),
      (n) => useSessionStore.getState().patch({ notice: n ? 'tooBig' : null }),
    );
    // The key is made (the first time) while the connection opens.
    void identity();
    this.open();
    this.timers.push(window.setInterval(() => this.tick(), 100));
    this.timers.push(window.setInterval(() => this.send({ case: 'ping', value: { t: performance.now() } }), 15_000));
  }

  /** Leaves the session; a member's own layers come back (the host's stay as the session left them). */
  leave(say = true): void {
    this.leaving = true;
    for (const t of this.timers) window.clearInterval(t);
    this.timers = [];
    const role = useSessionStore.getState().role;
    this.ws?.close(1000);
    this.ws = null;
    this.sync?.close(role !== 'host');
    this.sync = null;
    this.queue = [];
    this.acks.clear();
    presence.clear();
    if (say) useSessionStore.getState().patch({ state: 'off', me: null, role: null, members: [], looks: [], pending: 0, followPeer: null });
  }

  private open(): void {
    if (!this.opts) return;
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl(this.opts.url));
    } catch {
      useSessionStore.getState().patch({ state: 'closed', error: 'unreachable' });
      return;
    }
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    // The server speaks first: a challenge the hello signs with this browser's key.
    ws.onmessage = (e) => {
      if (!(e.data instanceof ArrayBuffer)) return;
      let m: ServerMsg;
      try {
        m = fromBinary(ServerMsgSchema, new Uint8Array(e.data));
      } catch {
        return;
      }
      this.receive(m);
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = null;
      const st = useSessionStore.getState();
      if (this.leaving || st.state === 'closed') return;
      // Dropped: back with the same place, a little later each time.
      if (st.state === 'joined' || st.state === 'reconnecting' || (st.state === 'connecting' && this.retries < 3)) {
        this.retries++;
        const ms = Math.min(10_000, 500 * 2 ** Math.min(5, this.retries - 1));
        st.patch({ state: st.state === 'connecting' ? 'connecting' : 'reconnecting', retryMs: ms });
        window.setTimeout(() => !this.leaving && this.open(), ms);
      } else if (st.state === 'waiting') {
        st.patch({ state: 'closed', error: 'dropped' });
      } else {
        st.patch({ state: 'closed', error: st.error ?? 'unreachable' });
      }
    };
  }

  /** The hello, signed for this connection's challenge with the browser's key (none where it has none). */
  private async hello(nonce: Uint8Array): Promise<void> {
    const o = this.opts;
    const ws = this.ws;
    if (!o || !ws) return;
    const { keyPub, keySig } = await signChallenge(nonce);
    if (this.ws !== ws) return;
    const seq = useSessionStore.getState().seq;
    this.send({
      case: 'hello',
      value: {
        proto: PROTO,
        name: o.name,
        password: this.resume ? '' : (o.password ?? ''),
        invite: this.resume ? '' : (o.invite ?? ''),
        resume: this.resume,
        hostToken: o.hostToken ?? '',
        clientKey: keyPub.length ? '' : browserKey(),
        keyPub,
        keySig,
        sinceSeq: BigInt(this.resume ? seq : 0),
      },
    });
  }

  private send(body: Body, pending?: Pending): number {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return 0;
    const rid = pending ? this.rid++ : 0;
    if (pending) this.acks.set(rid, pending);
    const msg = createMsg(ClientMsgSchema, { rid, body });
    ws.send(toBinary(ClientMsgSchema, msg));
    return rid;
  }

  /** Sends a request that the server answers with an ack. */
  request(body: Body, what: string): void {
    this.send(body, { kind: 'other', what });
  }

  private enqueue(b: OutBatch): void {
    this.queue.push(b);
    this.drain();
  }

  private drain(): void {
    if (useSessionStore.getState().state !== 'joined') return;
    const now = performance.now();
    this.sentAt = this.sentAt.filter((t) => now - t < 1000);
    while (this.queue.length && this.sentAt.length < BATCHES_PER_SEC) {
      const b = this.queue.shift()!;
      this.sentAt.push(now);
      this.send({ case: 'batch', value: { doc: b.doc, id: b.id, at: Date.now(), ops: b.ops.map(opMsg) } }, { kind: 'batch', batch: b });
    }
    useSessionStore.getState().patch({ pending: this.sync?.pendingCount() ?? 0 });
  }

  /** Ten times a second: edits out, presence out when the camera moved, the queue drained. */
  private tick(): void {
    const st = useSessionStore.getState();
    if (st.state !== 'joined') return;
    this.sync?.tick();
    this.drain();
    const e = this.engine;
    if (!e) return;
    const pose = capturePose(e);
    const now = performance.now();
    const cursor = this.pointer ? pointUnder(e, this.pointer.x, this.pointer.y) : null;
    // Moved, or a second of nothing (so a late joiner's view of this one settles).
    if (poseMoved(this.lastPose, pose) || cursor || now - this.lastPoseSent > 1000) {
      this.lastPose = pose;
      this.lastPoseSent = now;
      this.send({
        case: 'presence',
        value: {
          pose: poseMsg(pose),
          hasCursor: !!cursor,
          ...(cursor ? { cursor: v3(cursor) } : {}),
          tab: useRaceStore.getState().tab.slice(0, 24),
          mode: useStore.getState().mode.slice(0, 24),
        },
      });
    }
  }

  private receive(m: ServerMsg): void {
    const st = useSessionStore.getState();
    const b = m.body;
    switch (b.case) {
      case 'welcome': {
        const w = b.value;
        this.resume = w.resume;
        this.retries = 0;
        const role = ROLE_NAME[w.role] ?? 'viewer';
        st.patch({ state: 'joined', me: w.you, role, error: null, seq: Number(w.seq) });
        // The batches not yet numbered go again (the server applies each once).
        if (this.sync) for (const x of this.sync.unconfirmed()) if (!this.queue.includes(x)) this.queue.push(x);
        this.drain();
        break;
      }
      case 'waiting':
        st.patch({ state: 'waiting', me: b.value.you });
        break;
      case 'denied': {
        const code = b.value.code;
        if (code === Err.NOT_FOUND && this.resume) {
          // Away too long: a fresh hello (the waiting room again, unless an invite or the password lets in).
          this.resume = '';
          return;
        }
        this.leaving = true;
        st.patch({ state: 'closed', error: errKey(code), retryMs: b.value.retryMs });
        break;
      }
      case 'closed': {
        const r = b.value.reason;
        this.leaving = true;
        const error = r === CloseReason.KICKED ? 'kicked' : r === CloseReason.BANNED_NOW ? 'bannedNow' : r === CloseReason.REPLACED ? 'replaced' : 'ended';
        st.patch({ state: 'closed', error });
        this.sync?.close(st.role !== 'host');
        this.sync = null;
        break;
      }
      case 'roster':
        st.patch({
          members: b.value.members.map((x) => ({
            id: x.id,
            name: x.name,
            role: ROLE_NAME[x.role] ?? 'viewer',
            muted: x.muted,
            mutedUntil: Number(x.mutedUntil),
            connected: x.connected,
          })),
        });
        {
          const mine = b.value.members.find((x) => x.id === st.me);
          if (mine && ROLE_NAME[mine.role] !== st.role) st.patch({ role: ROLE_NAME[mine.role] ?? 'viewer' });
          // Presence of members no longer here.
          const here = new Set(b.value.members.filter((x) => x.connected).map((x) => x.id));
          for (const id of [...presence.keys()]) if (!here.has(id)) presence.delete(id);
          presenceClock.v++;
        }
        break;
      case 'presence': {
        const now = performance.now();
        for (const it of b.value.items) {
          if (it.member === st.me || !it.presence) continue;
          const pose = poseOf(it.presence.pose);
          if (!pose) continue;
          presence.set(it.member, {
            pose,
            cursor: it.presence.hasCursor && it.presence.cursor ? v3(it.presence.cursor) : null,
            tab: it.presence.tab,
            mode: it.presence.mode,
            at: now,
          });
        }
        for (const id of b.value.gone) presence.delete(id);
        presenceClock.v++;
        break;
      }
      case 'op': {
        const s = b.value;
        const batch = s.batch;
        if (!batch || !this.sync) break;
        const ops = batch.ops.map(opOf);
        if (ops.every((o): o is DocOp => !!o)) this.sync.remote(batch.doc, batch.id, ops);
        st.patch({ seq: Number(s.seq), pending: this.sync.pendingCount() });
        break;
      }
      case 'snapshot': {
        if (!this.sync) break;
        const states: Record<string, DocState> = {};
        for (const d of b.value.docs) {
          try {
            const ds = readDocState(JSON.parse(d.json));
            if (ds) states[d.doc] = ds;
          } catch {
            /* a document that does not parse is left out */
          }
        }
        this.sync.snapshot(states, st.role === 'host');
        st.patch({ seq: Number(b.value.seq) });
        break;
      }
      case 'look': {
        const e = b.value;
        const pose = poseOf(e.look?.pose);
        if (!pose || !e.look) break;
        const req: LookRequest = {
          id: Number(e.id),
          from: e.from,
          fromName: e.fromName,
          pose,
          point: e.look.hasPoint && e.look.point ? v3(e.look.point) : null,
          note: e.look.note,
          follow: e.look.follow,
          at: Date.now(),
        };
        st.patch({ looks: [...st.looks.slice(-4), req] });
        break;
      }
      case 'follow':
        st.patch({ follow: { mode: FOLLOW_NAME[b.value.mode] ?? 'off', leader: b.value.leader }, followOptOut: false });
        break;
      case 'ack': {
        const a = b.value;
        const p = this.acks.get(a.rid);
        this.acks.delete(a.rid);
        if (!p) {
          if (a.code !== Err.OK && a.rid === 0) st.patch({ notice: errKey(a.code) });
          break;
        }
        if (p.kind === 'batch') {
          if (a.code === Err.RATE_LIMITED) {
            // Not refused, only early: again in a moment.
            window.setTimeout(() => this.enqueue(p.batch), Math.max(100, a.retryMs));
          } else if (a.code !== Err.OK) {
            // Refused whole: it falls away. (Refused in part, the part let through has come back numbered already.)
            this.sync?.refused(p.batch.id);
            st.patch({ notice: errKey(a.code) });
          }
          st.patch({ pending: this.sync?.pendingCount() ?? 0 });
        } else if (a.code !== Err.OK) {
          st.patch({ notice: errKey(a.code), retryMs: a.retryMs });
        }
        break;
      }
      case 'info': {
        const i = b.value;
        st.patch({
          info: {
            name: i.name,
            waitingRoom: i.waitingRoom,
            passwordSet: i.passwordSet,
            tls: i.tls,
            exposed: i.exposed,
            maxClients: i.maxClients,
            dataset: i.dataset
              ? { name: i.dataset.name, hash: i.dataset.hash, size: Number(i.dataset.size), levelName: i.dataset.levelName, levelHash: i.dataset.levelHash, published: i.dataset.published }
              : null,
          },
        });
        break;
      }
      case 'waitingList':
        st.patch({ waiting: b.value.waiting.map((w) => ({ id: w.id, name: w.name, since: Number(w.since) })) });
        break;
      case 'bans':
        st.patch({ bans: b.value.bans.map((x) => ({ id: Number(x.id), name: x.name, until: Number(x.until) })) });
        break;
      case 'invites':
        st.patch({
          invites: b.value.invites.map((x) => ({ id: Number(x.id), token: '', role: ROLE_NAME[x.role] ?? 'viewer', expires: Number(x.expires), uses: x.uses, label: x.label })),
        });
        break;
      case 'invite': {
        const x = b.value;
        st.patch({ lastInvite: { id: Number(x.id), token: x.token, role: ROLE_NAME[x.role] ?? 'viewer', expires: Number(x.expires), uses: x.uses, label: x.label } });
        break;
      }
      case 'challenge':
        void this.hello(b.value.nonce);
        break;
      case 'notice':
        // TOKEN_ROTATED needs nothing here: the welcome before it carried the new token.
        if (b.value.kind === NoticeKind.TOKEN_ROTATED) break;
        st.patch({ notice: b.value.kind === NoticeKind.LOGIN_FLOOD ? 'loginFlood' : b.value.kind === NoticeKind.STATE_REPLACED ? 'stateReplaced' : b.value.kind === NoticeKind.YOU_CHANGED ? 'youChanged' : null });
        break;
      case 'pong':
        break;
    }
  }

  // ------------------------------------------------------------ actions

  lookHere(opts: { to?: number[]; note?: string; follow?: boolean; point?: { x: number; y: number; z: number } | null }): void {
    const e = this.engine;
    if (!e) return;
    const pose = capturePose(e);
    this.request(
      {
        case: 'look',
        value: { to: opts.to ?? [], pose: poseMsg(pose), hasPoint: !!opts.point, ...(opts.point ? { point: v3(opts.point) } : {}), note: opts.note ?? '', follow: !!opts.follow },
      },
      'look',
    );
  }

  setFollow(mode: FollowModeName, leader = 0): void {
    this.request({ case: 'follow', value: { mode: FOLLOW_NUM[mode], leader } }, 'follow');
  }

  admin(kind: 'mute' | 'unmute' | 'kick' | 'ban' | 'unban' | 'setRole' | 'admit' | 'deny' | 'revokeInvite', target: number, extra: { durationMs?: number; role?: SessionRole; ref?: number } = {}): void {
    const k = {
      mute: AdminKind.MUTE,
      unmute: AdminKind.UNMUTE,
      kick: AdminKind.KICK,
      ban: AdminKind.BAN,
      unban: AdminKind.UNBAN,
      setRole: AdminKind.SET_ROLE,
      admit: AdminKind.ADMIT,
      deny: AdminKind.DENY,
      revokeInvite: AdminKind.REVOKE_INVITE,
    }[kind];
    this.request(
      {
        case: 'admin',
        value: { kind: k, target, durationMs: BigInt(Math.round(extra.durationMs ?? 0)), role: extra.role ? ROLE_NUM[extra.role] : Role.ROLE_UNSPECIFIED, refId: BigInt(extra.ref ?? 0) },
      },
      kind,
    );
  }

  invite(role: SessionRole, uses: number, ttlMs: number, label: string): void {
    this.request({ case: 'invite', value: { role: ROLE_NUM[role], uses, ttlMs: BigInt(ttlMs), label } }, 'invite');
  }

  settings(p: { waitingRoom?: boolean; password?: string; clearPassword?: boolean; name?: string }): void {
    this.request(
      {
        case: 'settings',
        value: { ...(p.waitingRoom !== undefined ? { waitingRoom: p.waitingRoom } : {}), password: p.password ?? '', clearPassword: !!p.clearPassword, sessionName: p.name ?? '' },
      },
      'settings',
    );
  }

  dataset(d: { name: string; hash: string; size: number; levelName?: string; levelHash?: string; published?: boolean }): void {
    this.request(
      { case: 'dataset', value: { name: d.name, hash: d.hash, size: BigInt(d.size), levelName: d.levelName ?? '', levelHash: d.levelHash ?? '', published: !!d.published } },
      'dataset',
    );
  }

  /** The host's token, for the host's own HTTP calls (saving, opening a session file, publishing). */
  hostToken(): string {
    return this.opts?.hostToken ?? '';
  }

  /** This member's token, for fetching published files. */
  token(): string {
    return this.resume;
  }

  serverUrl(): string | undefined {
    return this.opts?.url;
  }
}

export const session = new SessionClient();

// For the multi-client smoke test and the console.
declare global {
  interface Window {
    __heat3dSession?: { client: SessionClient; store: typeof useSessionStore; presence: typeof presence };
  }
}
if (typeof window !== 'undefined') window.__heat3dSession = { client: session, store: useSessionStore, presence };
