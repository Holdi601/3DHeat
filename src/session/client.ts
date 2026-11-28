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
  ViewKind,
  type Op,
  type Pose as PoseMsg,
  type ServerMsg,
} from './proto/heat3d/session/v1/session_pb';
import { capturePose, pointerTarget, poseMoved, presence, presenceClock } from './presence';
import { browserKey } from './marks';
import { clearLacks, keepLacksOf, myLacks, noteLacks } from './lacks';
import { identity, signChallenge } from './identity';
import { readDocState, SharedSync, type DocState, type OutBatch } from './shared';
import { useSessionStore, type FollowModeName, type LookRequest, type Pose, type SessionRole, type SessionState } from './store';
import { ViewSync } from './viewSync';
import { appSlices } from './viewSlices';
import { loadedDataset } from '../ui/replay/FigureOverlay';
import { isOverlay } from '../match/overlay';

type ViewKindName = 'change' | 'state' | 'ask' | 'want' | 'clock' | 'release';
const VIEW_NUM: Record<ViewKindName, ViewKind> = {
  change: ViewKind.VIEW_CHANGE,
  state: ViewKind.VIEW_STATE,
  ask: ViewKind.VIEW_ASK,
  want: ViewKind.VIEW_WANT,
  clock: ViewKind.VIEW_CLOCK,
  release: ViewKind.VIEW_RELEASE,
};
const VIEW_NAME: Partial<Record<number, ViewKindName>> = Object.fromEntries(Object.entries(VIEW_NUM).map(([k, v]) => [v, k as ViewKindName]));

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
  /** The server's clock less this browser's, ms (from the pongs: the one with the shortest round trip). */
  private clockOffset = 0;
  private bestRtt = Infinity;
  /** Asks the host for the session's view once the roster says who the host is (joining, sync turned on, data loaded). */
  private wantState = false;
  /** Whose whole view is awaited (joining, sync turned on): taken when it comes. */
  private awaiting: number | null = null;
  /** The camera from before looking through someone's eyes. */
  private peekPose: Pose | null = null;
  private lastData: unknown = null;
  private dataAt = 0;
  private askSeq = 0;
  readonly view: ViewSync = new ViewSync({
    slices: () => this.slices(),
    me: () => useSessionStore.getState().me ?? 0,
    now: () => performance.now(),
    serverNow: () => Date.now() + this.clockOffset,
    send: (kind, json, to) => {
      this.send({ case: 'view', value: { kind: VIEW_NUM[kind], json, to: to ?? [] } });
    },
  });
  private sliceList: ReturnType<typeof appSlices> | null = null;

  private slices() {
    return (this.sliceList ??= appSlices(() => this.engine));
  }

  constructor() {
    this.view.stateExtra = () => ({ data: useStore.getState().dataset?.name ?? '' });
    this.view.hostId = () => useSessionStore.getState().members.find((m) => m.role === 'host' && m.connected)?.id ?? null;
    this.view.onChange = (w) => {
      const st = useSessionStore.getState();
      const p = this.view.pending;
      const patch: Partial<SessionState> = { syncBack: this.view.canGoBack(), syncPending: p ? { from: p.from, keys: Object.keys(p.slices) } : null };
      if (w.applied && st.peek === null) patch.syncApplied = { from: w.applied.from, keys: w.applied.keys, at: Date.now() };
      st.patch(patch);
    };
  }

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
    st.patch({
      state: 'connecting',
      error: null,
      url: wsUrl(opts.url),
      name: opts.name,
      members: [],
      waiting: [],
      bans: [],
      invites: [],
      looks: [],
      lastInvite: null,
      followPeer: null,
      followSource: null,
      followAsk: null,
      followAnswered: null,
      syncPending: null,
      syncApplied: null,
      syncAsks: [],
      peek: null,
    });
    this.view.enabled = st.sync.on;
    this.view.askHost = st.sync.askHost;
    this.view.peek = null;
    this.view.pending = null;
    this.view.watchers.clear();
    this.wantState = st.sync.on;
    this.awaiting = null;
    this.bestRtt = Infinity;
    this.sync = new SharedSync(
      (b) => this.enqueue(b),
      (n) => useSessionStore.getState().patch({ notice: n ? 'tooBig' : null }),
    );
    // The key is made (the first time) while the connection opens.
    void identity();
    this.open();
    this.timers.push(window.setInterval(() => this.tick(), 100));
    this.timers.push(window.setInterval(() => this.ping(), 15_000));
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
    clearLacks();
    this.view.pending = null;
    this.view.peek = null;
    this.view.watchers.clear();
    if (say) useSessionStore.getState().patch({ state: 'off', me: null, role: null, members: [], looks: [], pending: 0, followPeer: null, followSource: null, followAsk: null, syncPending: null, syncAsks: [], peek: null });
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

  private ping(): void {
    this.send({ case: 'ping', value: { t: performance.now() } });
  }

  /** Ten times a second: edits out, the view's changes out, presence out when the camera moved, the queue drained. */
  private tick(): void {
    const st = useSessionStore.getState();
    if (st.state !== 'joined') return;
    this.sync?.tick();
    this.drain();
    // Data loaded or swapped: what loading reset is not a change of this viewer's to send,
    // and the session's view is asked for again once the data is in (filters go by name).
    // The data loaded, not the figure overlay standing in for it (a mode, not a load).
    const shown = useStore.getState().dataset;
    const data = isOverlay(shown) ? this.lastData : loadedDataset();
    if (data !== this.lastData) {
      this.lastData = data;
      this.dataAt = performance.now();
      this.view.hold(1000);
      if (data && st.sync.on && st.role !== 'host') this.wantState = true;
    }
    if (this.wantState && performance.now() - this.dataAt > 1200) {
      const host = this.view.hostId();
      if (host !== null) {
        this.wantState = false;
        if (host !== st.me && st.sync.on && st.peek === null) {
          this.awaiting = host;
          this.view.want(host);
        }
      }
    }
    this.view.tick();
    // Full sync moves the camera with the host's too (looking around stays free), until it is turned off.
    if (st.sync.on && st.sync.camera && st.role !== 'host' && st.peek === null && st.followPeer === null) {
      const host = this.view.hostId();
      if (host !== null && host !== st.me) st.patch({ followPeer: host, followSource: 'sync', followAsk: null });
    }
    const e = this.engine;
    if (!e) return;
    const pose = capturePose(e);
    const now = performance.now();
    const cursor = this.pointer ? pointerTarget(e, this.pointer.x, this.pointer.y) : null;
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
          // What of the host's room this viewer lacks (room.ts): the host is asked to share it.
          lacks: myLacks(),
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
        this.ping();
        // The host of `3dheat serve`: its server keeps the usage statistics for the host's browser (by its token).
        if (role === 'host') void import('../usage/recorder').then((u) => u.probeLocal()).catch(() => undefined);
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
          keepLacksOf(here);
          presenceClock.v++;
          for (const id of [...this.view.watchers]) if (!here.has(id)) this.view.gone(id);
          if (this.view.pending && !here.has(this.view.pending.from)) this.view.gone(this.view.pending.from);
          const s2 = useSessionStore.getState();
          if (s2.followPeer !== null && !here.has(s2.followPeer)) {
            if (s2.peek === s2.followPeer) this.endPeek();
            else s2.patch({ followPeer: null, followSource: null });
          }
          if (s2.syncAsks.some((a) => !here.has(a.from))) s2.patch({ syncAsks: s2.syncAsks.filter((a) => here.has(a.from)) });
        }
        break;
      case 'presence': {
        const now = performance.now();
        for (const it of b.value.items) {
          if (it.member === st.me || !it.presence) continue;
          const pose = poseOf(it.presence.pose);
          if (!pose) continue;
          const cursor = it.presence.hasCursor && it.presence.cursor ? v3(it.presence.cursor) : null;
          const before = presence.get(it.member);
          const moved = !before?.cursor || !cursor || Math.hypot(cursor.x - before.cursor.x, cursor.y - before.cursor.y, cursor.z - before.cursor.z) > 1e-3;
          presence.set(it.member, {
            pose,
            cursor,
            cursorMoved: moved ? now : before.cursorMoved,
            tab: it.presence.tab,
            mode: it.presence.mode,
            at: now,
          });
          noteLacks(it.member, it.presence.lacks);
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
      case 'follow': {
        // A request, never forced: "enforce" from an older viewer is asked about as well.
        const mode = FOLLOW_NAME[b.value.mode] ?? 'off';
        const leader = b.value.leader;
        if (mode === 'off' || leader === 0) {
          st.patch({ follow: { mode: 'off', leader: 0 }, followAsk: null, followAnswered: null, ...(st.followSource === 'session' ? { followPeer: null, followSource: null } : {}) });
        } else {
          // The same request again (a reconnect) is not asked twice; a stop is never undone by it.
          const ask = leader !== st.me && st.followAnswered !== leader && st.followPeer !== leader;
          st.patch({ follow: { mode: 'follow', leader }, followAsk: ask ? leader : null });
        }
        break;
      }
      case 'view': {
        const v = b.value;
        const kind = VIEW_NAME[v.kind];
        if (!kind || v.from === st.me) break;
        const at = Number(v.at);
        if (kind === 'state') {
          if (st.peek === v.from) {
            this.view.takeState(v.from, v.json, at, false);
            try {
              const d = (JSON.parse(v.json) as { data?: unknown }).data;
              st.patch({ peekData: typeof d === 'string' ? d.slice(0, 200) : '' });
            } catch {
              /* no name */
            }
          } else if (this.awaiting === v.from && st.sync.on && st.peek === null) {
            this.awaiting = null;
            this.view.takeState(v.from, v.json, at);
          }
          break;
        }
        if (kind === 'release') {
          if (st.followPeer === v.from && st.followSource !== 'peek') {
            st.patch({ followPeer: null, followSource: null, notice: 'released' });
            if (st.follow.leader === v.from) st.patch({ followAnswered: v.from });
          }
          break;
        }
        if (kind === 'ask') {
          if (st.peek !== null) break;
          const name = st.members.find((m) => m.id === v.from)?.name ?? v.fromName;
          st.patch({ syncAsks: [...st.syncAsks.filter((a) => a.from !== v.from).slice(-3), { id: ++this.askSeq, from: v.from, fromName: name, json: v.json, at }] });
          break;
        }
        this.view.receive(v.from, kind, v.json, at);
        break;
      }
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
          } else this.sync?.acked(p.batch.id);
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
      case 'pong': {
        const rtt = performance.now() - b.value.t;
        const server = Number(b.value.serverMs);
        if (server > 0 && rtt >= 0 && rtt < 10_000 && rtt <= this.bestRtt * 1.5 + 5) {
          this.bestRtt = Math.min(this.bestRtt, rtt);
          this.clockOffset = server + rtt / 2 - Date.now();
        }
        break;
      }
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
    // Nobody is forced: what used to lock cameras is a request like the other.
    this.request({ case: 'follow', value: { mode: FOLLOW_NUM[mode === 'enforce' ? 'follow' : mode], leader } }, 'follow');
  }

  /** Follows member `id`'s camera (null stops); `source` says why. */
  followMember(id: number | null, source: 'session' | 'peer' = 'peer'): void {
    const st = useSessionStore.getState();
    if (st.peek !== null) this.endPeek();
    // Stopping the camera that full sync moves turns that part of sync off (the panel shows it).
    if (st.followSource === 'sync' && st.followPeer !== id) this.setSync({ camera: false });
    if (id === null) {
      // Stopping the session's "follow me" is an answer to it: it is not asked again.
      st.patch({ followPeer: null, followSource: null, ...(st.followSource === 'session' ? { followAnswered: st.follow.leader } : {}) });
    } else st.patch({ followPeer: id, followSource: source, followAsk: null, ...(source === 'session' ? { followAnswered: id } : {}) });
  }

  /** The session's "follow me" answered. */
  answerFollow(yes: boolean): void {
    const st = useSessionStore.getState();
    const leader = st.followAsk;
    if (leader === null) return;
    if (yes) this.followMember(leader, 'session');
    else st.patch({ followAsk: null, followAnswered: leader });
  }

  /** Everyone following this viewer stops (and the session's "follow me", if it was this viewer's). */
  releaseFollowers(): void {
    const st = useSessionStore.getState();
    if (st.follow.mode !== 'off' && st.follow.leader === st.me) this.setFollow('off');
    this.send({ case: 'view', value: { kind: ViewKind.VIEW_RELEASE, json: '{}', to: [] } });
  }

  // ------------------------------------------------------------ view sync

  /** Keeps this viewer's view in sync with everyone's, or not; turned on, it takes the session's view. */
  setSync(p: { on?: boolean; askHost?: boolean; camera?: boolean }): void {
    const st = useSessionStore.getState();
    const sync = { ...st.sync, ...p };
    st.patch({ sync });
    if ((!sync.on || !sync.camera) && st.followSource === 'sync') st.patch({ followPeer: null, followSource: null });
    this.view.enabled = sync.on;
    this.view.askHost = sync.askHost;
    if (p.on === false && this.view.pending) this.view.answer(false);
    if (p.on === true && st.state === 'joined' && st.role !== 'host') this.wantState = true;
  }

  /** The host's waiting changes: 'take', 'ignore', or 'never' (ignore, and stop keeping in sync). */
  answerSync(a: 'take' | 'ignore' | 'never'): void {
    this.view.answer(a === 'take');
    if (a === 'never') this.setSync({ on: false });
  }

  /** "Switch to my view" for the members named (everyone when none are). */
  askSync(to: number[] = []): void {
    this.view.ask(to);
  }

  /** A "switch to my view" answered. */
  answerAsk(id: number, take: boolean): void {
    const st = useSessionStore.getState();
    const a = st.syncAsks.find((x) => x.id === id);
    st.patch({ syncAsks: st.syncAsks.filter((x) => x.id !== id) });
    if (a && take) {
      if (st.peek !== null) this.endPeek();
      this.view.takeState(a.from, a.json, a.at);
    }
  }

  /** Back to the view before the last change from someone else. */
  syncBack(): void {
    if (useSessionStore.getState().peek !== null) this.endPeek();
    else this.view.back();
    useSessionStore.getState().patch({ syncApplied: null, syncBack: this.view.canGoBack() });
  }

  /** Looks through member `id`'s eyes for a while: their camera, view and data; `endPeek` comes back. */
  peek(id: number): void {
    const st = useSessionStore.getState();
    if (st.peek === id) return;
    if (st.peek !== null) this.endPeek();
    const e = this.engine;
    this.peekPose = e ? capturePose(e) : null;
    this.view.startPeek(id);
    st.patch({ peek: id, peekData: '', followPeer: id, followSource: 'peek', syncApplied: null });
  }

  endPeek(): void {
    const st = useSessionStore.getState();
    if (st.peek === null) return;
    this.view.endPeek();
    st.patch({ peek: null, peekData: '', ...(st.followSource === 'peek' ? { followPeer: null, followSource: null } : {}), syncBack: this.view.canGoBack() });
    const e = this.engine;
    const pose = this.peekPose;
    this.peekPose = null;
    if (e && pose) e.setCameraPose(pose.position, pose.forward);
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
