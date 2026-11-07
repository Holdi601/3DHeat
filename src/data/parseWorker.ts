/// <reference lib="webworker" />
import type { SourceBlock } from './builder';
import type { IngestProgress } from './ingest';
import { parseHere } from './ingestFiles';
import { errorMsg, type Msg } from './msg';
import type { ColumnMapping } from '../state/types';

/**
 * One parser thread: reads one file at a time into a block for the ingest
 * worker, which merges the blocks in selection order.
 *
 * Started by the ingest worker, never by the page, and only when the "Parser
 * threads" budget allows more than one. The block goes back by transfer, like
 * the finished dataset does, so its arrays move rather than being copied.
 */

export interface ParseRequest {
  id: number;
  file: File;
  mapping: ColumnMapping;
  columns: string[];
  stride: number;
}

export type ParseResponse =
  | { id: number; kind: 'progress'; progress: IngestProgress }
  | { id: number; kind: 'block'; block: SourceBlock }
  | { id: number; kind: 'error'; why: Msg | string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (ev: MessageEvent<ParseRequest>) => {
  const { id, file, mapping, columns, stride } = ev.data;
  const post = (r: ParseResponse, transfer?: Transferable[]) =>
    transfer ? ctx.postMessage(r, transfer) : ctx.postMessage(r);
  try {
    const block = await parseHere(file, mapping, columns, stride, (progress) =>
      post({ id, kind: 'progress', progress }),
    );
    post({ id, kind: 'block', block }, blockBuffers(block));
  } catch (err) {
    post({ id, kind: 'error', why: errorMsg(err) });
  }
};

/** Every distinct buffer in a block, deduplicated: transferring one twice throws. */
function blockBuffers(b: SourceBlock): Transferable[] {
  const seen = new Set<ArrayBufferLike>();
  const add = (v: ArrayBufferView | null | undefined) => {
    if (v) seen.add(v.buffer);
  };
  add(b.px);
  add(b.py);
  add(b.pz);
  add(b.time);
  add(b.yaw);
  add(b.pitch);
  add(b.personIds);
  add(b.teamIds);
  add(b.sessionIds);
  for (const a of b.attrs) add(a.data);
  return [...seen] as Transferable[];
}
