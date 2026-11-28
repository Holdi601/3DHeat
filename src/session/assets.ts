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

import { create } from 'zustand';
import { session } from './client';
import { handData, loadedData } from './dataRefs';

export type ShareKind = 'level' | 'course' | 'layouts' | 'ranges' | 'cars' | 'catalog' | 'figure-pack' | 'model-pack' | 'other';

/** An item of the host's catalogue, as the host sees it. */
export interface CatalogEntry {
  path: string;
  kind: ShareKind;
  game: string;
  name: string;
  size: number;
  /** What sharing it sends in all: a level with its side files (textures, terrain, layouts), a pack with its folder. */
  total?: number;
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
  /** What is shared now; the host's list has each item's place in the catalogue folder. */
  shared: (SharedItem & { path?: string })[];
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

/** The host's catalogue as last read, for the panel and the room (`room.ts`); null before the first read. */
export const useShareIndex = create<{ index: ShareIndex | null; at: number }>(() => ({ index: null, at: 0 }));

/** Reads the host's catalogue again (it lists what is shared too); kept in `useShareIndex`. */
export async function refreshShareIndex(): Promise<ShareIndex | null> {
  try {
    const index = await shareIndex();
    useShareIndex.setState({ index, at: Date.now() });
    return index;
  } catch {
    const index: ShareIndex = { available: false, items: [], blocked: 0, shared: [] };
    useShareIndex.setState({ index, at: Date.now() });
    return null;
  }
}

/** What an item sends in all, bytes. */
export const itemBytes = (it: CatalogEntry): number => it.total ?? it.size;

/** The host publishes the loaded data for members to fetch by its hash (the first file), and says so in the session. */
export async function publishData(): Promise<boolean> {
  const { files } = loadedData();
  if (!files.length) return false;
  const f = files[0];
  const res = await fetch(`${base()}/api/publish?name=${encodeURIComponent(f.name)}`, { method: 'POST', headers: { Authorization: `Bearer ${session.hostToken()}` }, body: f });
  if (!res.ok) throw new Error(String(res.status));
  const { hash, size } = (await res.json()) as { hash: string; size: number };
  session.dataset({ name: f.name, hash, size, published: true });
  return true;
}
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

/** Whether every file of a shared item is in this browser's cache already (checked by hash): loading it then fetches nothing. */
export async function inCache(item: SharedItem): Promise<boolean> {
  try {
    const m = await fromCache(item.manifest);
    if (!m) return false;
    const man = JSON.parse(new TextDecoder().decode(m)) as Manifest;
    if (!Array.isArray(man.files)) return false;
    if (typeof caches === 'undefined') return false;
    const c = await caches.open(CACHE);
    for (const f of man.files) if (!HEX64.test(f.hash) || !(await c.match(cacheKey(f.hash)))) return false;
    return true;
  } catch {
    return false;
  }
}

/** The host's published data by its hash, checked, then loaded in the data panel. */
export async function loadHostData(d: { name: string; hash: string }): Promise<void> {
  const buf = await fetchVerified(d.hash);
  handData([new File([buf], d.name)], true);
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
    const file = new File([buf], leaf);
    // Its place in the item (a pack's `units/t_80ud.glb`), under the item only.
    Object.defineProperty(file, 'sharedPath', { value: f.path.split('\\').join('/').replace(/^\/+/, '') });
    Object.defineProperty(file, 'sharedHash', { value: f.hash });
    files.push(file);
    onProgress?.(i + 1, m.files.length);
  }
  return { manifest: m, files };
}

/** A shared file's place in its item (`units/t_80ud.glb`), or its name. */
export function sharedPath(f: File): string {
  return (f as File & { sharedPath?: string }).sharedPath ?? f.name;
}

/** A shared file's SHA-256, as its manifest named it and it was checked against. */
export function sharedHash(f: File): string | undefined {
  return (f as File & { sharedHash?: string }).sharedHash;
}

/**
 * Loads a shared item where it belongs, by itself: a level as the level (its
 * layouts, its tiled terrain when it has one), a
 * unit catalogue or a model pack into the figures (`sharedPacks.ts`); a single
 * other file (a range catalogue, a car pack) is saved for the member to load
 * where it goes.
 */
export async function loadShared(item: SharedItem, onProgress?: (done: number, all: number) => void): Promise<'level' | 'pack' | 'kept'> {
  const { manifest, files } = await fetchShared(item, onProgress);
  if (manifest.kind === 'level' || manifest.kind === 'course') {
    const { loadSharedLevel } = await import('./sharedLevel');
    if (await loadSharedLevel(manifest.name, files)) return 'level';
  }
  if (manifest.kind === 'catalog' || manifest.kind === 'model-pack') {
    const { installSharedPack } = await import('./sharedPacks');
    if (await installSharedPack(manifest.kind, manifest.game, files)) return 'pack';
  }
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
