/**
 * What the viewer knows of the multiplayer session it is in, for the UI:
 * the connection's state, who it is and may do, the members, the host's
 * settings, follow, "look here" requests, and for admins the waiting room,
 * bans and invites.
 *
 * Presence (everyone's camera, ten times a second) is not here: it lives in
 * `presence.ts`, a plain map the overlay reads each frame, so it never
 * re-renders React.
 */

import { create } from 'zustand';

/** Ranked as on the server (`native/proto/heat3d/session/v1/session.proto`). */
export type SessionRole = 'viewer' | 'draw' | 'elevated' | 'admin' | 'host';
export const ROLES: SessionRole[] = ['viewer', 'draw', 'elevated', 'admin', 'host'];
export const rankOf = (r: SessionRole | null | undefined): number => (r ? ROLES.indexOf(r) + 1 : 0);

export type ConnState =
  /** Not in a session. */
  | 'off'
  | 'connecting'
  /** In the waiting room: the host decides. */
  | 'waiting'
  | 'joined'
  /** Dropped: trying again, keeping its place. */
  | 'reconnecting'
  /** Refused or ended: `error` says why. */
  | 'closed';

export interface SessionMember {
  id: number;
  name: string;
  role: SessionRole;
  muted: boolean;
  /** Milliseconds since 1970; 0 for good. */
  mutedUntil: number;
  connected: boolean;
}

export type FollowModeName = 'off' | 'follow' | 'enforce';

export interface Pose {
  position: { x: number; y: number; z: number };
  forward: { x: number; y: number; z: number };
  fov: number;
  aspect: number;
  ortho: boolean;
  orthoHeight: number;
}

export interface LookRequest {
  id: number;
  from: number;
  fromName: string;
  pose: Pose;
  point: { x: number; y: number; z: number } | null;
  note: string;
  follow: boolean;
  at: number;
}

/** "Switch to my view" from someone: taken or declined. */
export interface SyncAsk {
  id: number;
  from: number;
  fromName: string;
  /** Their view as it travelled. */
  json: string;
  at: number;
}

export interface InviteInfo {
  id: number;
  token: string;
  role: SessionRole;
  expires: number;
  uses: number;
  label: string;
}

export interface SessionInfoState {
  name: string;
  waitingRoom: boolean;
  passwordSet: boolean;
  tls: boolean;
  exposed: boolean;
  maxClients: number;
  dataset: { name: string; hash: string; size: number; levelName: string; levelHash: string; published: boolean } | null;
}

export interface SessionState {
  state: ConnState;
  /** Why it is closed (a message key under `session.error.`), or null. */
  error: string | null;
  retryMs: number;
  /** The server's address (ws:// or wss://). */
  url: string | null;
  me: number | null;
  role: SessionRole | null;
  name: string;
  members: SessionMember[];
  info: SessionInfoState | null;
  follow: { mode: FollowModeName; leader: number };
  /** The member whose camera this viewer follows (it said yes to a request, chose to, or looks through their eyes); null for none. */
  followPeer: number | null;
  /** Why: the session's "follow me" taken, a member's request or choice, looking through their eyes. */
  followSource: 'session' | 'peer' | 'peek' | 'sync' | null;
  /** The session's "follow me" waiting for an answer: its leader. */
  followAsk: number | null;
  /** The leader whose session "follow me" this viewer answered (yes or no): not asked again. */
  followAnswered: number | null;
  /** View sync: on, keeps this viewer's view in sync with everyone's; ask before taking the host's changes; move the camera with the host's. */
  sync: { on: boolean; askHost: boolean; camera: boolean };
  /** The host's changes waiting for an answer: who, and what they changed (slice keys). */
  syncPending: { from: number; keys: string[] } | null;
  /** The last change from someone else that went in (for a moment, with a way back). */
  syncApplied: { from: number; keys: string[]; at: number } | null;
  /** A view to go back to. */
  syncBack: boolean;
  /** "Switch to my view" requests. */
  syncAsks: SyncAsk[];
  /** Looking through this member's eyes (their camera, view and data), or null. */
  peek: number | null;
  /** The name of the data they have loaded while looking through their eyes ('' when not known). */
  peekData: string;
  looks: LookRequest[];
  waiting: { id: number; name: string; since: number }[];
  bans: { id: number; name: string; until: number }[];
  invites: InviteInfo[];
  /** The invite just made, with its token (shown once). */
  lastInvite: InviteInfo | null;
  /** Sequence number of the last operation applied. */
  seq: number;
  /** Batches sent and not yet confirmed. */
  pending: number;
  /** The session panel open. */
  panel: boolean;
  /** A notice to show (a message key under `session.notice.`). */
  notice: string | null;
  patch: (p: Partial<SessionState>) => void;
  setPanel: (on: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  state: 'off',
  error: null,
  retryMs: 0,
  url: null,
  me: null,
  role: null,
  name: '',
  members: [],
  info: null,
  follow: { mode: 'off', leader: 0 },
  followPeer: null,
  followSource: null,
  followAsk: null,
  followAnswered: null,
  sync: { on: true, askHost: true, camera: true },
  syncPending: null,
  syncApplied: null,
  syncBack: false,
  syncAsks: [],
  peek: null,
  peekData: '',
  looks: [],
  waiting: [],
  bans: [],
  invites: [],
  lastInvite: null,
  seq: 0,
  pending: 0,
  panel: false,
  notice: null,
  patch: (p) => set(p),
  setPanel: (panel) => set({ panel }),
}));

/** Whether this viewer is in a session now. */
export function inSession(): boolean {
  return useSessionStore.getState().state === 'joined';
}

/** Whether this viewer's role allows at least `min`. */
export function mayAct(min: SessionRole): boolean {
  const s = useSessionStore.getState();
  if (s.state !== 'joined') return true;
  return rankOf(s.role) >= rankOf(min);
}

/** Whether this viewer is muted now. */
export function isMuted(): boolean {
  const s = useSessionStore.getState();
  const m = s.members.find((x) => x.id === s.me);
  return !!m?.muted && (m.mutedUntil === 0 || m.mutedUntil > Date.now());
}
