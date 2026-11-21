/// <reference lib="webworker" />
import type { AttributeColumn } from '../state/types';
import { readColumn } from './columnRead';
import type { ColumnSource } from './columnSource';
import { errorMsg, type Msg } from './msg';

/**
 * Reads a column on demand, off the page (`columnSource.ts`).
 *
 * The row map lives here, handed over by transfer when a load finishes, so the
 * page holds none of it; the decode, the gather into the dataset's order and
 * the column's span all happen here, and the column goes back by transfer. The
 * frame never waits on any of it.
 */

export type ColumnWorkerRequest =
  | { kind: 'register'; source: string; src: ColumnSource }
  | { kind: 'drop'; source: string }
  | { kind: 'read'; id: number; source: string; name: string; column: 'number' | 'category' };

export type ColumnWorkerResponse =
  | { kind: 'progress'; id: number; fraction: number }
  | { kind: 'column'; id: number; column: AttributeColumn }
  | { kind: 'error'; id: number; message: Msg | string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const sources = new Map<string, ColumnSource>();

ctx.onmessage = async (ev: MessageEvent<ColumnWorkerRequest>) => {
  const req = ev.data;
  if (req.kind === 'register') {
    sources.set(req.source, req.src);
    return;
  }
  if (req.kind === 'drop') {
    sources.delete(req.source);
    return;
  }
  const src = sources.get(req.source);
  try {
    if (!src) throw new Error('column source gone');
    let last = 0;
    const column = await readColumn(src, req.name, req.column, (fraction) => {
      const now = performance.now();
      if (now - last < 150 && fraction < 1) return;
      last = now;
      ctx.postMessage({ kind: 'progress', id: req.id, fraction } satisfies ColumnWorkerResponse);
    });
    ctx.postMessage({ kind: 'column', id: req.id, column } satisfies ColumnWorkerResponse, [column.data.buffer as ArrayBuffer]);
  } catch (err) {
    ctx.postMessage({ kind: 'error', id: req.id, message: errorMsg(err) } satisfies ColumnWorkerResponse);
  }
};
