/**
 * One of the pool that reads the files of a vehicle-hit load (`hitWorker.ts`
 * runs it): a file in, its hits out as columns (`scan.ts`), read here with
 * the browser's Parquet reader or by the native core when the page named the
 * file to it. Each file's hits are kept in the browser's cache by its name,
 * size and time, so the next load of the same files reads no table at all.
 */

import { parquetReader } from '../../data/native/readers';
import type { CoreEndpoint } from '../../data/native/core';
import { memberOf } from '../../data/container';
import { scanFile } from './scan';
import { COLUMN_NAMES, COLUMN_TYPES, transferList, type HitBlock, type HitColumns } from './types';

/** Bumped when what a scan keeps changes: older cached blocks are read again. */
export const SCAN_VERSION = 3;

export type ScanRequest = { type: 'names'; names: string[] | null } | {
  type: 'scan';
  index: number;
  file: File;
  partNames: string[] | null;
  pose: boolean;
  cache: boolean;
  /** The core and the picked file's token there, when the native app reads it. */
  native: { core: CoreEndpoint; token: string } | null;
};
export type ScanReply = { type: 'block'; index: number; block: HitBlock | null; cached: boolean; error?: string };

const DB = 'heat3d-vehicle-hits';
let db: Promise<IDBDatabase | null> | null = null;
function openDb(): Promise<IDBDatabase | null> {
  db ??= new Promise((resolve) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore('blocks');
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return db;
}

const keyOf = (f: File, pose: boolean) => `${SCAN_VERSION}|${pose ? 1 : 0}|${f.name}|${f.size}|${f.lastModified}`;

async function cached(f: File, pose: boolean): Promise<HitBlock | null | undefined> {
  const d = await openDb();
  if (!d) return undefined;
  return new Promise((resolve) => {
    try {
      const r = d.transaction('blocks').objectStore('blocks').get(keyOf(f, pose));
      r.onsuccess = () => {
        const v = r.result as (Omit<HitBlock, 'cols'> & { cols: Record<string, ArrayBuffer> & { n: number } }) | { empty: true } | undefined;
        if (!v) return resolve(undefined);
        if ('empty' in v) return resolve(null);
        const cols = { n: v.cols.n } as HitColumns;
        for (const k of COLUMN_NAMES) (cols as unknown as Record<string, unknown>)[k] = new COLUMN_TYPES[k](v.cols[k]);
        resolve({ ...v, cols });
      };
      r.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

async function keep(f: File, pose: boolean, b: HitBlock | null): Promise<void> {
  const d = await openDb();
  if (!d) return;
  try {
    const value = b ? { ...b, cols: Object.fromEntries([['n', b.cols.n], ...COLUMN_NAMES.map((k) => [k, (b.cols[k] as Uint8Array).slice().buffer])]) } : { empty: true };
    d.transaction('blocks', 'readwrite').objectStore('blocks').put(value, keyOf(f, pose));
  } catch {
    // A full or refused cache only means the next load reads the file again.
  }
}

/** The game's part names, sent once. */
let names: string[] | null = null;

self.onmessage = async (e: MessageEvent<ScanRequest>) => {
  const q = e.data;
  if (q.type === 'names') {
    names = q.names;
    return;
  }
  if (q.type !== 'scan') return;
  try {
    if (q.cache) {
      const had = await cached(q.file, q.pose);
      if (had !== undefined) {
        const block = had ? { ...had, match: { ...had.match, file: q.index } } : null;
        (self as unknown as Worker).postMessage({ type: 'block', index: q.index, block, cached: true } satisfies ScanReply, block ? transferList(block.cols) : []);
        return;
      }
    }
    const native = q.native;
    const block = await scanFile(q.file, q.index, q.partNames ?? names, { pose: q.pose, readerFor: native ? (table) => parquetReader(native.core, { token: native.token, member: memberOf(table)?.name ?? '' }) : undefined });
    if (q.cache) await keep(q.file, q.pose, block);
    (self as unknown as Worker).postMessage({ type: 'block', index: q.index, block, cached: false } satisfies ScanReply, block ? transferList(block.cols) : []);
  } catch (err) {
    (self as unknown as Worker).postMessage({ type: 'block', index: q.index, block: null, cached: false, error: (err as Error).message ?? String(err) } satisfies ScanReply);
  }
};
