/**
 * The usage statistics in this browser: one IndexedDB store of events,
 * oldest pruned past MAX. Read whole only by the settings page and its
 * export; written a batch at a time when the browser is idle.
 */

import type { UsageEvent } from './schema';

const DB = 'heat3d-usage';
const STORE = 'events';
/** Events kept at most; the oldest go first. */
const MAX = 300_000;

let opening: Promise<IDBDatabase> | null = null;
let writes = 0;

function open(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('no IndexedDB'));
  opening ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      opening = null;
      reject(req.error);
    };
  });
  return opening;
}

const done = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

/** Adds a batch in one transaction; now and then prunes the oldest past MAX. */
export async function idbAdd(events: UsageEvent[]): Promise<void> {
  const db = await open();
  const tx = db.transaction(STORE, 'readwrite');
  const st = tx.objectStore(STORE);
  for (const e of events) st.add(e);
  await done(tx);
  if (++writes % 50 === 1) await prune(db);
}

async function prune(db: IDBDatabase): Promise<void> {
  const tx = db.transaction(STORE, 'readwrite');
  const st = tx.objectStore(STORE);
  const count = await new Promise<number>((r) => {
    const q = st.count();
    q.onsuccess = () => r(q.result);
    q.onerror = () => r(0);
  });
  if (count > MAX) {
    let extra = count - MAX;
    const cur = st.openKeyCursor();
    cur.onsuccess = () => {
      const c = cur.result;
      if (!c || extra-- <= 0) return;
      st.delete(c.primaryKey);
      c.continue();
    };
  }
  await done(tx);
}

/** Every event kept, oldest first. */
export async function idbAll(): Promise<UsageEvent[]> {
  const db = await open();
  const tx = db.transaction(STORE, 'readonly');
  const req = tx.objectStore(STORE).getAll();
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as UsageEvent[]);
    req.onerror = () => reject(req.error);
  });
}

/** Deletes every event kept in this browser. */
export async function idbClear(): Promise<void> {
  const db = await open();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).clear();
  await done(tx);
}
