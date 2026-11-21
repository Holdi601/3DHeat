/**
 * Making the session public, from the host's browser: the session server
 * starts the way out the host picked (its own domain through a reverse
 * proxy, a Cloudflare Tunnel, or a port forward), tests it from outside,
 * and says the address to send (`/__heat3d/public`, the host's token only;
 * native/crates/server/src/public.rs).
 */

import { create } from 'zustand';
import { session } from './client';

export type PublicMode = 'own-domain' | 'cloudflare' | 'port-forward';

export interface PublicCheck {
  what: 'proxy' | 'public';
  ok: boolean;
  detail: string;
}

export interface PublicStatus {
  phase: 'off' | 'starting' | 'on' | 'failed';
  mode: PublicMode | null;
  url: string | null;
  checks: PublicCheck[];
  error: string | null;
  modes: Record<PublicMode, { available: boolean; showsAddress: boolean; named?: boolean; url?: string | null; port?: number }>;
}

interface PublicState {
  status: PublicStatus | null;
  busy: boolean;
  /** No such service here (a server without it, or not the host). */
  missing: boolean;
}

export const usePublic = create<PublicState>(() => ({ status: null, busy: false, missing: false }));

const ROUTE = '/__heat3d/public';

function base(): string {
  const s = session.serverUrl();
  return s ? new URL(s, location.href).origin : location.origin;
}

async function call(path: string, body?: unknown): Promise<PublicStatus | null> {
  const res = await fetch(`${base()}${ROUTE}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${session.hostToken()}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 404 || res.status === 403) {
    usePublic.setState({ missing: true });
    return null;
  }
  if (!res.ok) throw new Error(String(res.status));
  const status = (await res.json()) as PublicStatus;
  usePublic.setState({ status, missing: false });
  return status;
}

export async function refreshPublic(): Promise<void> {
  try {
    await call('');
  } catch {
    usePublic.setState({ missing: true });
  }
}

/** Starts going public; resolves when the way out runs and its self-test is done (or it failed). */
export async function goPublic(mode: PublicMode): Promise<PublicStatus | null> {
  usePublic.setState({ busy: true });
  try {
    let s = await call('/start', { mode });
    // The server starts it in the background: asked again until it is on or failed (a first start may pull an image).
    const end = Date.now() + 240_000;
    while (s?.phase === 'starting' && Date.now() < end) {
      await new Promise((r) => setTimeout(r, 1000));
      s = await call('');
    }
    return s;
  } finally {
    usePublic.setState({ busy: false });
  }
}

export async function stopPublic(): Promise<void> {
  usePublic.setState({ busy: true });
  try {
    await call('/stop', {});
  } finally {
    usePublic.setState({ busy: false });
  }
}

/** The public address members open (the session's own address when it is not public). */
export function publicBase(): string | null {
  const s = usePublic.getState().status;
  return s?.phase === 'on' && s.url ? s.url.replace(/\/+$/, '') : null;
}
