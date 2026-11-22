/**
 * The Library's catalogue, as the page reaches it: `/__heat3d/library` on the
 * app window's own server (with the window's key) or, in development, on the
 * dev server, which hands it to `3dheat library serve` (vite.config.ts).
 * Everything stays on this machine (docs/library.md).
 */

import { coreEndpoint, inNativeApp } from '../data/native/core';
import { setNativeToken } from '../data/native/files';

export const LIBRARY_ROUTE = '/__heat3d/library';

export type Kind = 'replay' | 'recording' | 'match' | 'session' | 'level' | 'models';
/** A replay's conversion: none yet, current, made by an older converter, failed; `na`: nothing to convert. */
export type Conv = 'none' | 'current' | 'outdated' | 'failed' | 'na';

export interface Item {
  id: number;
  kind: Kind;
  format: string;
  name: string;
  title: string | null;
  game: string | null;
  map: string | null;
  mode: string | null;
  started: number | null;
  duration: number | null;
  players: number | null;
  outcome: string | null;
  size: number;
  thumb: boolean;
  rating: number;
  flag: number;
  label: string | null;
  missing: boolean;
  conv: Conv | null;
  converter: string | null;
  converterVersion: string | null;
}

export interface Filter {
  q?: string;
  game?: string[];
  map?: string[];
  mode?: string[];
  outcome?: string[];
  kind?: string[];
  format?: string[];
  tag?: string[];
  player?: string[];
  converter?: string[];
  year?: string[];
  conv?: string[];
  rating?: number;
  flag?: number;
  from?: number;
  to?: number;
  collection?: number;
  root?: number;
  missing?: boolean;
  dupes?: boolean;
}

export interface FacetValue {
  v: string | number;
  n: number;
}

export type Facets = Record<string, FacetValue[]> & { totals?: never };
export interface FacetAnswer {
  [dim: string]: unknown;
  totals: { items: number; bytes: number; seconds: number; from: number | null; to: number | null };
}

export interface Root {
  id: number;
  path: string;
  watch: boolean;
  lastScan: number | null;
  scanMs: number | null;
  online: boolean;
  reachable: boolean;
  files: number;
  items: number;
}

export interface Collection {
  id: number;
  name: string;
  smart: boolean;
  query: Filter | null;
  count: number;
}

export interface Job {
  id: number;
  kind: 'convert' | 'extract';
  item: number | null;
  extractor: string;
  extractorVersion: string | null;
  game: string | null;
  label: string | null;
  state: 'queued' | 'running' | 'done' | 'failed' | 'cancelled';
  progress: number | null;
  message: string | null;
  hint: string | null;
  attempts: number;
  created: number;
  started: number | null;
  finished: number | null;
}

export interface Status {
  items: number;
  missing: number;
  bytes: number;
  roots: number;
  outdated: number;
  unconverted: number;
  jobs: { queued: number; running: number; failed: number; paused: boolean };
  scan: { running: boolean; phase: string; root: string | null; found: number; changed: number; done: number; deepLeft: number; last: null | { files: number; totalMs: number; changed: number } };
  thumbToken: string;
}

export interface Extractor {
  id: string;
  name: string;
  version: string | null;
  installed: boolean;
  games: string[];
  converts: string[];
  maps: boolean;
}

let base: Promise<{ url: string; key: string }> | null = null;

/** Where the catalogue answers, and the key that lets this window in. */
function where(): Promise<{ url: string; key: string }> {
  base ??= (async () => {
    if (inNativeApp()) {
      const e = await coreEndpoint();
      // The window's server: the same origin as `/v1`.
      const origin = e.url.replace(/\/v1\/?$/, '');
      if (/^https?:/.test(origin)) return { url: `${origin}${LIBRARY_ROUTE}`, key: e.key };
    }
    return { url: LIBRARY_ROUTE, key: '' };
  })();
  return base;
}

export class LibraryError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function call<T>(method: string, path: string, body?: unknown, query?: URLSearchParams): Promise<T> {
  const w = await where();
  const headers: Record<string, string> = { 'x-heat3d-library': '1' };
  if (w.key) headers['x-heat3d-key'] = w.key;
  if (body !== undefined) headers['content-type'] = 'application/json';
  let res: Response;
  try {
    res = await fetch(`${w.url}/${path}${query && [...query.keys()].length ? `?${query}` : ''}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new LibraryError('The library is not running here.', 0);
  }
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Not JSON: a server without the library (a plain build) answers with the page.
  }
  if (!res.ok || json === null) {
    const msg = (json as { error?: string } | null)?.error;
    throw new LibraryError(msg ?? (res.status === 404 || json === null ? 'The library is not running here.' : `HTTP ${res.status}`), res.status);
  }
  return json as T;
}

/** The filter as URL parameters (lists repeat their key). */
export function filterQuery(f: Filter, extra: Record<string, string | number | boolean | undefined> = {}): URLSearchParams {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) continue;
    if (Array.isArray(v)) for (const x of v) q.append(k, String(x));
    else q.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  }
  for (const [k, v] of Object.entries(extra)) if (v !== undefined) q.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  return q;
}

export const lib = {
  status: () => call<Status>('GET', 'status'),
  roots: () => call<Root[]>('GET', 'roots'),
  addRoot: (path: string, watch = true) => call<{ id: number }>('POST', 'roots', { path, watch }),
  removeRoot: (id: number) => call<{ removed: number }>('DELETE', `roots/${id}`),
  suggest: () => call<{ folders: Array<{ path: string; what: string }> }>('GET', 'suggest'),
  rescan: (id?: number) => (id === undefined ? call('POST', 'scan') : call('POST', `roots/${id}/scan`)),
  setWatch: (id: number, watch: boolean) => call('POST', `roots/${id}/watch`, { watch }),
  items: (f: Filter, sort: string, desc: boolean, offset: number, limit: number) =>
    call<{ total: number; offset: number; items: Item[] }>('GET', 'items', undefined, filterQuery(f, { sort, desc, offset, limit })),
  ids: (f: Filter, sort: string, desc: boolean) => call<{ ids: number[] }>('GET', 'ids', undefined, filterQuery(f, { sort, desc })),
  facets: (f: Filter) => call<FacetAnswer>('GET', 'facets', undefined, filterQuery(f)),
  item: (id: number) => call<ItemDetail>('GET', `item/${id}`),
  edit: (e: { ids: number[]; rating?: number; flag?: number; label?: string | null; note?: string | null; addTags?: string[]; removeTags?: string[] }) => call('POST', 'edit', e),
  collections: () => call<Collection[]>('GET', 'collections'),
  createCollection: (name: string, ids: number[], smart?: Filter) => call<{ id: number }>('POST', 'collections', { name, ids, smart }),
  addToCollection: (id: number, ids: number[]) => call('POST', `collections/${id}/add`, { ids }),
  removeFromCollection: (id: number, ids: number[]) => call('POST', `collections/${id}/remove`, { ids }),
  renameCollection: (id: number, name: string) => call('POST', `collections/${id}/rename`, { name }),
  deleteCollection: (id: number) => call('DELETE', `collections/${id}`),
  duplicates: () => call<{ groups: Array<{ qhash: string; count: number; size: number; confirmed: boolean; items: Array<{ id: number; path: string; mtime: number }> }>; wastedBytes: number }>('GET', 'duplicates'),
  jobs: () => call<{ jobs: Job[]; counts: Record<string, number>; paused: boolean; limit: number; running: number }>('GET', 'jobs'),
  convert: (ids: number[], force = false) => call<{ queued: number; skipped: Array<{ id: number; name: string; reason: string }> }>('POST', 'convert', { ids, force }),
  cancelJob: (id: number) => call('POST', `jobs/${id}/cancel`),
  retryJob: (id: number) => call('POST', `jobs/${id}/retry`),
  jobLog: (id: number) => call<{ log: string | null }>('GET', `jobs/${id}/log`),
  clearJobs: () => call('POST', 'jobs/clear'),
  pause: (paused: boolean) => call('POST', paused ? 'queue/pause' : 'queue/resume'),
  extractors: () => call<{ extractors: Extractor[] }>('GET', 'extractors'),
  reloadExtractors: () => call('POST', 'extractors/reload'),
  levels: () => call<LevelsAnswer>('GET', 'levels'),
  mapStatus: (extractor?: string) => call<{ checked: Array<{ extractor: string; ok?: boolean; error?: string }> }>('POST', 'maps/status', { extractor }),
  extract: (extractor: string, game: string | null, maps: string[]) => call<{ job: number }>('POST', 'extract', { extractor, game, maps }),
  settings: () => call<{ settings: Settings; levels: string; dataDir: string; catalogue: string; jobLimit: number }>('GET', 'settings'),
  setSettings: (s: Settings) => call('PUT', 'settings', s),
  move: (ids: number[]) => call<{ moved: number; failed: Array<{ id: number; error: string }>; to: string }>('POST', 'move', { ids }),
  open: (ids: number[]) => call<{ files: OpenFile[]; skipped: Array<{ id: number; name: string; kind: string; conv?: Conv | null; missing?: boolean }> }>('POST', 'open', { ids }),
  link: (ids: number[], kind: 'session' | 'analysis' | 'note' | 'shared', label: string, target = '') => call('POST', 'links', { ids, kind, label, target }),
};

export interface OpenFile {
  id: number;
  name: string;
  size: number;
  kind: Kind;
  format?: string;
}

export interface Settings {
  outputDir: string;
  libraryDir: string;
  maxJobs: number;
  hashNetwork: boolean;
  rescanMinutes: number;
  levelsDir: string | null;
}

export interface ItemDetail extends Item {
  path: string;
  teams: string[] | null;
  gameVersion: string | null;
  matchId: string | null;
  extra: Record<string, unknown> | null;
  mtime: number;
  qhash: string | null;
  sha256: string | null;
  note: string | null;
  added: number;
  error: string | null;
  source: number | null;
  tags: string[];
  playerNames: string[];
  collections: Array<{ id: number; name: string }>;
  links: Array<{ id: number; kind: string; label: string | null; target: string | null; created: number }>;
  outputs: Item[];
  sourceItem?: Item | null;
  copies?: Array<{ id: number; path: string }>;
  level?: { id: number; name: string } | null;
  jobs: Array<{ id: number; kind: string; extractor: string; state: string; message: string | null; hint: string | null; progress: number | null }>;
}

export interface LevelRow {
  id: number;
  kind: 'level' | 'models';
  game: string | null;
  map: string | null;
  name: string;
  size: number;
  sha256: string | null;
  extractor: string | null;
  gameVersion: string | null;
  thumb: boolean;
  missing: boolean;
  path: string;
  mtime: number;
  uses: number;
}

export interface MapExtractor {
  id: string;
  name: string;
  games: string[];
  installed: boolean;
  version: string | null;
  checked: number | null;
  new: number;
  changed: number;
  outdated: number;
  maps: Array<{ id: string; state: string; game: string | null; name: string | null }>;
}

export interface LevelsAnswer {
  levels: LevelRow[];
  withoutLevel: Array<{ game: string; map: string; uses: number }>;
  extractors: MapExtractor[];
  levelsDir: string;
}

/** A thumbnail's address (its token makes it unguessable to other pages). */
export async function thumbUrl(token: string, id: number): Promise<string> {
  const w = await where();
  return `${w.url}/thumb/${token}/${id}`;
}

let thumbBase = '';
/** The thumbnail base, once known (synchronous, for `<img src>`). */
export function thumbSrc(token: string, id: number): string {
  return `${thumbBase}/thumb/${token}/${id}`;
}
void where().then((w) => (thumbBase = w.url));

/**
 * Fetches items' files as `File`s for the viewer's loaders. In the app the
 * answer also carries the core's token for the file, so the core reads it in
 * place and the page's copy is only a fallback.
 */
export async function fetchFiles(files: OpenFile[], progress?: (done: number, total: number, bytes: number) => void, signal?: AbortSignal): Promise<File[]> {
  const w = await where();
  const headers: Record<string, string> = { 'x-heat3d-library': '1' };
  if (w.key) headers['x-heat3d-key'] = w.key;
  const out: File[] = [];
  let bytes = 0;
  // A few at a time: the disk, not the page, sets the pace.
  const queue = files.slice();
  const one = async () => {
    for (;;) {
      const f = queue.shift();
      if (!f) return;
      const res = await fetch(`${w.url}/file/${f.id}`, { headers, signal });
      if (!res.ok) throw new LibraryError(`${f.name}: ${res.status === 410 ? 'not there now (its drive offline?)' : `HTTP ${res.status}`}`, res.status);
      const blob = await res.blob();
      const file = new File([blob], f.name, { type: blob.type });
      const token = res.headers.get('x-heat3d-token');
      if (token) setNativeToken(file, token);
      out.push(file);
      bytes += file.size;
      progress?.(out.length, files.length, bytes);
    }
  };
  await Promise.all([one(), one(), one(), one()]);
  // In the order asked.
  const order = new Map(files.map((f, i) => [f.name, i]));
  return out.sort((a, b) => (order.get(a.name) ?? 0) - (order.get(b.name) ?? 0));
}
