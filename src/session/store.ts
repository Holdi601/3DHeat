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
  /** Following someone this viewer chose to (accepted "follow me"), apart from the session's follow. */
  followPeer: number | null;
  /** Stopped following the session's (not enforced) follow. */
  followOptOut: boolean;
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
  followOptOut: false,
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
