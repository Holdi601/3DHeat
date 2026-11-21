/**
 * Assets the host shares with the session: levels, the catalogue and packs
 * from the host's catalogue folder, by content hash
 * (native/crates/session/src/share.rs).
 *
 * The host lists its catalogue (`/__heat3d/share`, the host's token only;
 * items marked confidential are flagged and need a second, warned
 * confirmation), confirms the rights per item, and shares it. A member lists what
 * is shared (`/api/shared`), fetches an item's manifest and then each file
 * by its SHA-256 (`/a/<hash>`), and checks every hash before using it. The
 * files are kept in this browser's cache by hash and checked again when
 * they are taken from it, so a cache someone changed is never trusted.
 */

import { session } from './client';
import { handLevel } from './dataRefs';

export type ShareKind = 'level' | 'course' | 'layouts' | 'ranges' | 'cars' | 'catalog' | 'figure-pack' | 'model-pack' | 'other';

/** An item of the host's catalogue, as the host sees it. */
export interface CatalogEntry {
  path: string;
  kind: ShareKind;
  game: string;
  name: string;
  size: number;
  /** Made from a game's own models: shared only when the host allows it for this pack. */
  extracted: boolean;
  /** Marked confidential (a confidential folder, a marker file, a word): shared only after a warned confirmation. */
  confidential: boolean;
}

/** A shared item, as members see it: never a path. */
export interface SharedItem {
  id: string;
  kind: ShareKind;
  game: string;
  name: string;
  size: number;
  files: number;
  manifest: string;
  /** Marked confidential by the host's machine: for people entitled to see it only. */
  confidential?: boolean;
}

export interface ShareIndex {
  available: boolean;
  items: CatalogEntry[];
  blocked: number;
  shared: SharedItem[];
}

interface Manifest {
  format: '3dheat-share';
  version: 1;
  kind: ShareKind;
  game: string;
  name: string;
  files: { path: string; hash: string; size: number }[];
}

function base(): string {
  const s = session.serverUrl();
  return s ? new URL(s, location.href).origin : location.origin;
}

const HEX64 = /^[0-9a-f]{64}$/;

export async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  return [...d].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ------------------------------------------------------------ the host

async function hostCall<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${base()}/__heat3d/share${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${session.hostToken()}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    let why = String(res.status);
    try {
      why = ((await res.json()) as { error?: string }).error ?? why;
    } catch {
      /* no reason given */
    }
    throw new Error(why);
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

export const shareIndex = () => hostCall<ShareIndex>('');
export const shareItem = (path: string, rights: boolean, allowExtracted: boolean, confidentialOk = false) =>
  hostCall<{ item: SharedItem }>('', { path, rights, allow_extracted: allowExtracted, confidential_ok: confidentialOk });
export const unshare = (id: string) => hostCall<null>('/stop', { id });

// ------------------------------------------------------------ a member

export async function sharedItems(): Promise<SharedItem[]> {
  const res = await fetch(`${base()}/api/shared`, { headers: { Authorization: `Bearer ${session.token()}` } });
  if (!res.ok) return [];
  const j = (await res.json()) as { items?: SharedItem[] };
  return (j.items ?? []).filter((i) => HEX64.test(i.manifest));
}

const CACHE = 'heat3d-assets-v1';
const cacheKey = (hash: string) => `https://heat3d.invalid/a/${hash}`;

async function fromCache(hash: string): Promise<ArrayBuffer | null> {
  if (typeof caches === 'undefined') return null;
  try {
    const c = await caches.open(CACHE);
    const hit = await c.match(cacheKey(hash));
    if (!hit) return null;
    const buf = await hit.arrayBuffer();
    if ((await sha256Hex(buf)) === hash) return buf;
    await c.delete(cacheKey(hash));
  } catch {
    /* no cache in this browser (private window): fetched again */
  }
  return null;
}

async function toCache(hash: string, buf: ArrayBuffer): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    const c = await caches.open(CACHE);
    await c.put(cacheKey(hash), new Response(buf, { headers: { 'content-type': 'application/octet-stream' } }));
  } catch {
    /* full or not allowed: it still loads this time */
  }
}

/** One file by its hash: from the cache when it is there and still that hash, else from the host; checked either way. */
export async function fetchVerified(hash: string): Promise<ArrayBuffer> {
  if (!HEX64.test(hash)) throw new Error('hash');
  const cached = await fromCache(hash);
  if (cached) return cached;
  const res = await fetch(`${base()}/a/${hash}`, { headers: { Authorization: `Bearer ${session.token()}` } });
  if (!res.ok) throw new Error(String(res.status));
  const buf = await res.arrayBuffer();
  if ((await sha256Hex(buf)) !== hash) throw new Error('hash');
  await toCache(hash, buf);
  return buf;
}

/** A shared item's files, each checked: its manifest first, then every file it names. */
export async function fetchShared(item: SharedItem, onProgress?: (done: number, all: number) => void): Promise<{ manifest: Manifest; files: File[] }> {
  const m = JSON.parse(new TextDecoder().decode(await fetchVerified(item.manifest))) as Manifest;
  if (m.format !== '3dheat-share' || !Array.isArray(m.files)) throw new Error('manifest');
  const files: File[] = [];
  for (const [i, f] of m.files.entries()) {
    if (!HEX64.test(f.hash) || typeof f.path !== 'string') throw new Error('manifest');
    const buf = await fetchVerified(f.hash);
    // The name only: a pack's folders stay in the file's relative path, never a path of the host's.
    const leaf = f.path.split('/').pop() || 'file';
    files.push(new File([buf], leaf));
    onProgress?.(i + 1, m.files.length);
  }
  return { manifest: m, files };
}

/** Loads a shared item where it belongs: a level (with its layouts) in the level panel; anything else is saved or kept. */
export async function loadShared(item: SharedItem, onProgress?: (done: number, all: number) => void): Promise<'level' | 'kept'> {
  const { manifest, files } = await fetchShared(item, onProgress);
  if (manifest.kind === 'level' || manifest.kind === 'course') {
    const model = files.find((f) => /\.(glb|gltf)$/i.test(f.name));
    const layouts = files.find((f) => /\.layouts\.json$/i.test(f.name)) ?? null;
    if (model) {
      handLevel(model, layouts);
      return 'level';
    }
  }
  // A single file (a range catalogue, a car or figure pack): saved for the member to load where it goes. A
  // pack of many files stays in this browser's cache, checked.
  if (files.length === 1) saveFile(files[0]);
  return 'kept';
}

function saveFile(f: File): void {
  const url = URL.createObjectURL(f);
  const a = document.createElement('a');
  a.href = url;
  a.download = f.name;
  a.rel = 'noopener';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
