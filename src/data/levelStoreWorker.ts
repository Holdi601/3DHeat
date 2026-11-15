/// <reference lib="webworker" />
/**
 * The level library's heavy IndexedDB work, off the main thread.
 *
 * A model level is tens to hundreds of megabytes of typed arrays. On the main
 * thread, IndexedDB's structured clone of such a record takes a whole frame or
 * more - writing one (a 6M-triangle map: a 139 ms frame right after loading)
 * and reading the whole store back to list it. Here the buffers to write arrive
 * transferred (no copy on the way), and a listing sends back only the small
 * descriptions, never the geometry.
 */
import { listLevelMetas, putLevelRecord } from './levelDb';

export type LevelStoreRequest = { id: number; op: 'put'; record: unknown } | { id: number; op: 'list' };

export interface LevelStoreResponse {
  id: number;
  error?: string;
  metas?: unknown[];
}

const reply = (msg: LevelStoreResponse) => (self as unknown as Worker).postMessage(msg);

self.onmessage = (ev: MessageEvent<LevelStoreRequest>) => {
  const req = ev.data;
  const work: Promise<unknown[] | void> = req.op === 'put' ? putLevelRecord(req.record) : listLevelMetas();
  work.then(
    (metas) => reply({ id: req.id, ...(metas ? { metas } : {}) }),
    (err: unknown) => reply({ id: req.id, error: err instanceof Error ? err.message : String(err) }),
  );
};
