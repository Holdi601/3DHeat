/**
 * The Extractors panel's side of the manager (docs/extractors.md): the
 * pinned index the viewer ships (extractors.json, the same file the native
 * manager builds in), version order, each extractor's status, and the route
 * of the manager (`/__heat3d/extractors`), which only the native app's own
 * server and `3dheat serve` (the host's own browser) answer. The viewer
 * holds no extractor code: the manager downloads, verifies and starts them
 * as programs of their own.
 */

import shipped from './extractors.json';
import { coreEndpoint, inNativeApp } from '../data/native/core';
import { usageAuth } from '../usage/recorder';

export interface IndexEntry {
  id: string;
  name: string;
  games: string[];
  what: string;
  repo: string;
  assets: Record<string, string>;
  exe: Record<string, string>;
  sums: string;
}

/** The extractors of the shipped index; only these repositories are ever downloaded from. */
export const INDEX: IndexEntry[] = (shipped as { extractors: IndexEntry[] }).extractors;

/** Where a release of an extractor is downloaded by hand. */
export const releasesUrl = (repo: string) => `https://github.com/${repo}/releases/latest`;

/** Compares `v1.2.3`-style versions number by number; anything after `-` or `+` is not compared. */
export function compareVersions(a: string, b: string): number {
  const nums = (v: string) =>
    v
      .replace(/^[vV]/, '')
      .split(/[-+]/)[0]
      .split('.')
      .map((p) => Number.parseInt(p, 10) || 0);
  const x = nums(a);
  const y = nums(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return Math.sign(d);
  }
  return 0;
}

export interface CheckLine {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

export interface Check {
  version: string | null;
  levels: string | null;
  checks: CheckLine[];
  error: string | null;
}

export interface Job {
  version: string;
  phase: 'lookup' | 'download' | 'verify' | 'unpack' | 'check' | 'failed';
  done: number;
  total: number;
  error: string | null;
}

/** One extractor as the manager sees it. */
export interface Item {
  id: string;
  name: string;
  games: string[];
  what: string;
  repo: string;
  supported: boolean;
  installed: string | null;
  latest: string | null;
  latestSize: number | null;
  latestError: string | null;
  running: boolean;
  job: Job | null;
  check: Check | null;
}

export interface State {
  format: '3dheat-extractors-state';
  platform: string;
  data: string;
  levels: string;
  free: number | null;
  extractors: Item[];
}

export type Status = 'unsupported' | 'missing' | 'installed' | 'update' | 'running' | 'busy' | 'error';

/** What the panel says about an extractor. */
export function statusOf(x: Item): Status {
  if (!x.supported) return 'unsupported';
  if (x.job && x.job.phase !== 'failed') return 'busy';
  if (x.job?.phase === 'failed' || (x.check?.error && x.installed)) return 'error';
  if (x.running) return 'running';
  if (!x.installed) return 'missing';
  if (x.latest && compareVersions(x.latest, x.installed) > 0) return 'update';
  return 'installed';
}

/** Where the manager answers this page, and how it knows the owner. */
export interface Route {
  base: string;
  headers: Record<string, string>;
}

/** The candidates in order: the app window's own server (by its key), then this page's server (the host's token). */
async function candidates(): Promise<Route[]> {
  const out: Route[] = [];
  if (inNativeApp()) {
    const at = await coreEndpoint();
    if (/^http:\/\/127\.0\.0\.1:\d+\/v1$/.test(at.url) && at.key) out.push({ base: at.url.replace(/\/v1$/, '/__heat3d/extractors'), headers: { 'x-heat3d-key': at.key } });
  }
  out.push({ base: '/__heat3d/extractors', headers: usageAuth() });
  return out;
}

export function isState(x: unknown): x is State {
  return !!x && typeof x === 'object' && (x as State).format === '3dheat-extractors-state' && Array.isArray((x as State).extractors);
}

/** The manager reachable from this page and its state, or null (a plain web build, a session's member). */
export async function findManager(): Promise<{ route: Route; state: State } | null> {
  for (const route of await candidates()) {
    try {
      const r = await fetch(route.base, { headers: route.headers, cache: 'no-store' });
      if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) continue;
      const state: unknown = await r.json();
      if (isState(state)) return { route, state };
    } catch {
      // Not here.
    }
  }
  return null;
}

/** One request to the manager; the state it answers with, or what it refused with. */
export async function ask(route: Route, method: 'GET' | 'POST', path: string): Promise<unknown> {
  const r = await fetch(route.base + path, { method, headers: route.headers, cache: 'no-store' });
  const body: unknown = await r.json().catch(() => null);
  if (!r.ok) throw new Error((body as { error?: string } | null)?.error ?? `${r.status}`);
  return body;
}
