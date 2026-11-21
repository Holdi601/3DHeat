/**
 * The folder a session file's data was found in, kept for the next time.
 *
 * Where the browser has the File System Access API (Chromium), the folder is
 * picked with `showDirectoryPicker` and its handle kept in IndexedDB: the next
 * session file that lacks data offers that folder again with one click (the
 * browser asks to allow reading it). Elsewhere the folder is picked with the
 * plain folder input every time and nothing is kept.
 */

import { openPicker, type PickedFile } from '../data/filePick';

const DB = 'heat3d-session-folder';
const STORE = 'folders';
const KEY = 'last';
/** Folders deeper than this under the picked one are not walked. */
const MAX_DEPTH = 4;
/** Files listed at most: a pick of a whole drive stops here. */
const MAX_FILES = 50_000;

interface DirHandle {
  kind: 'directory';
  name: string;
  values(): AsyncIterable<DirHandle | FileHandle>;
  queryPermission?(o: { mode: 'read' }): Promise<PermissionState>;
  requestPermission?(o: { mode: 'read' }): Promise<PermissionState>;
}
interface FileHandle {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
}

type DirPicker = (o?: { id?: string; mode?: 'read' }) => Promise<DirHandle>;

const picker = (): DirPicker | null => {
  const w = globalThis as unknown as { showDirectoryPicker?: DirPicker };
  return typeof w.showDirectoryPicker === 'function' ? w.showDirectoryPicker : null;
};

function db(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => resolve(null);
  });
}

async function keep(handle: DirHandle): Promise<void> {
  const d = await db();
  if (!d) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = d.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(handle, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      // A handle the browser cannot store: not kept.
      resolve();
    }
  });
  d.close();
}

async function kept(): Promise<DirHandle | null> {
  const d = await db();
  if (!d) return null;
  const h = await new Promise<DirHandle | null>((resolve) => {
    try {
      const r = d.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      r.onsuccess = () => resolve((r.result as DirHandle | undefined) ?? null);
      r.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  d.close();
  return h;
}

/** Every file under a folder handle, with its path under it. */
async function walk(dir: DirHandle): Promise<PickedFile[]> {
  const out: PickedFile[] = [];
  const go = async (d: DirHandle, prefix: string, depth: number) => {
    for await (const e of d.values()) {
      if (out.length >= MAX_FILES) return;
      if (e.kind === 'file') {
        if (e.name.startsWith('.')) continue;
        try {
          out.push({ file: await e.getFile(), relativePath: `${prefix}${e.name}` });
        } catch {
          // Gone or locked: left out.
        }
      } else if (depth < MAX_DEPTH) await go(e, `${prefix}${e.name}/`, depth + 1);
    }
  };
  await go(dir, `${dir.name}/`, 0);
  return out;
}

/** The name of the folder kept from last time, or null (none, or no File System Access here). */
export async function keptFolderName(): Promise<string | null> {
  if (!picker()) return null;
  return (await kept())?.name ?? null;
}

/** The files of the folder kept from last time, after the browser allowed reading it again; null when it did not. */
export async function filesOfKeptFolder(): Promise<PickedFile[] | null> {
  const h = await kept();
  if (!h) return null;
  try {
    let p = (await h.queryPermission?.({ mode: 'read' })) ?? 'granted';
    if (p !== 'granted') p = (await h.requestPermission?.({ mode: 'read' })) ?? 'denied';
    if (p !== 'granted') return null;
    return await walk(h);
  } catch {
    return null;
  }
}

/** A folder picked by the user, its files listed; its handle kept where the browser can. */
export async function pickDataFolder(): Promise<PickedFile[]> {
  const show = picker();
  if (!show) return openPicker(true, true);
  let h: DirHandle;
  try {
    h = await show({ id: 'heat3d-session-data', mode: 'read' });
  } catch {
    // Cancelled.
    return [];
  }
  void keep(h);
  return walk(h);
}
