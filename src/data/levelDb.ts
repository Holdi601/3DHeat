/**
 * The level library's IndexedDB, shared by the library (main thread) and the
 * worker that writes large levels (`levelStoreWorker.ts`). Kept free of the
 * app's other modules so the worker loads nothing else.
 */

export const DB_NAME = '3dheat';
export const DB_VERSION = 1;
export const STORE = 'levels';

export function openLevelDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
}

/** A stored level's geometry and pictures: everything a listing leaves out. */
export const PAYLOAD_FIELDS = [
  'blob',
  'vertices',
  'colours',
  'uvs',
  'atlas',
  'uvTiles',
  'tileRects',
  'indices',
  'structureIndices',
  'structureEdges',
  'waterIndices',
] as const;

/** Every record without its payload. */
export function listLevelMetas(): Promise<unknown[]> {
  return openLevelDb().then(
    (db) =>
      new Promise<unknown[]>((resolve, reject) => {
        const transaction = db.transaction(STORE, 'readonly');
        const req = transaction.objectStore(STORE).getAll();
        req.onsuccess = () => {
          const metas = (req.result as Array<Record<string, unknown>>).map((r) => {
            const meta = { ...r };
            for (const f of PAYLOAD_FIELDS) delete meta[f];
            return meta;
          });
          resolve(metas);
        };
        req.onerror = () => reject(req.error ?? new Error('IndexedDB read failed'));
        transaction.oncomplete = () => db.close();
      }),
  );
}

/** Puts one record; resolves when the transaction has committed. */
export function putLevelRecord(record: unknown): Promise<void> {
  return openLevelDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE, 'readwrite');
        transaction.objectStore(STORE).put(record);
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error ?? new Error('IndexedDB write failed'));
        };
        transaction.onabort = () => {
          db.close();
          reject(transaction.error ?? new Error('IndexedDB write aborted'));
        };
      }),
  );
}
