/**
 * One of the pool that reads the files of a person-hit load (`worker.ts` runs
 * it): a file in, its hits out as columns (`scan.ts`). Each file's hits are
 * kept in the browser's cache by its name, size and time, so the next load of
 * the same files reads no table at all.
 */

import { scanPersonFile } from './scan';
import { armaFactsStamp, loadArmaFacts } from './armaGear';
import { INT_COLUMNS, NUM_COLUMNS, SOURCE_FIELDS, TEXT_COLUMNS, allocColumns, transferList, type PersonBlock } from './types';

/** Bumped when what a scan keeps changes: older cached blocks are read again. */
export const PERSON_SCAN_VERSION = 3;

export type PersonScanRequest = { type: 'scan'; index: number; file: File; cache: boolean };
export type PersonScanReply = { type: 'block'; index: number; block: PersonBlock | null; cached: boolean; error?: string };

const DB = 'heat3d-person-hits';
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

// The Arma 3 catalogue facts in use are part of the key: a new catalogue reads the recordings again.
const keyOf = (f: File) => `${PERSON_SCAN_VERSION}|${armaFactsStamp()}|${f.name}|${f.size}|${f.lastModified}`;

type Stored = Omit<PersonBlock, 'cols'> & { cols: { n: number; buffers: ArrayBuffer[] } };

function pack(b: PersonBlock): Stored {
  return { ...b, cols: { n: b.cols.n, buffers: transferList(b.cols).map((x) => x.slice(0)) } };
}

function unpack(v: Stored): PersonBlock {
  const cols = allocColumns(0);
  cols.n = v.cols.n;
  let k = 0;
  for (const c of NUM_COLUMNS) cols.num[c] = new Float32Array(v.cols.buffers[k++]);
  for (const c of INT_COLUMNS) cols.int[c] = new Int16Array(v.cols.buffers[k++]);
  for (const c of TEXT_COLUMNS) cols.txt[c] = new Uint32Array(v.cols.buffers[k++]);
  for (const c of SOURCE_FIELDS) cols.src[c] = new Uint8Array(v.cols.buffers[k++]);
  return { ...v, cols };
}

async function cached(f: File): Promise<PersonBlock | null | undefined> {
  const d = await openDb();
  if (!d) return undefined;
  return new Promise((resolve) => {
    try {
      const r = d.transaction('blocks').objectStore('blocks').get(keyOf(f));
      r.onsuccess = () => {
        const v = r.result as Stored | { empty: true } | undefined;
        if (!v) return resolve(undefined);
        if ('empty' in v) return resolve(null);
        resolve(unpack(v));
      };
      r.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

async function keep(f: File, b: PersonBlock | null): Promise<void> {
  const d = await openDb();
  if (!d) return;
  try {
    d.transaction('blocks', 'readwrite').objectStore('blocks').put(b ? pack(b) : { empty: true }, keyOf(f));
  } catch {
    // A full or refused cache only means the next load reads the file again.
  }
}

self.onmessage = async (e: MessageEvent<PersonScanRequest>) => {
  const q = e.data;
  if (q.type !== 'scan') return;
  const post = (r: PersonScanReply) => (self as unknown as Worker).postMessage(r, r.block ? transferList(r.block.cols) : []);
  try {
    await loadArmaFacts();
    if (q.cache) {
      const had = await cached(q.file);
      if (had !== undefined) return post({ type: 'block', index: q.index, block: had ? { ...had, match: { ...had.match, file: q.index } } : null, cached: true });
    }
    const block = await scanPersonFile(q.file, q.index);
    if (q.cache) await keep(q.file, block);
    post({ type: 'block', index: q.index, block, cached: false });
  } catch (err) {
    post({ type: 'block', index: q.index, block: null, cached: false, error: (err as Error).message ?? String(err) });
  }
};
