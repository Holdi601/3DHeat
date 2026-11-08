/// <reference lib="webworker" />
/**
 * A lean overlay decode worker: reads one job's rows of one Parquet file -
 * only the columns its pass needs - and hands back what `scan.ts` makes of
 * them: counts and spans (pass 1) or the keys themselves (pass 2), by
 * transfer. Several run at once, each on its own job; they keep nothing
 * between jobs but the files' footers.
 */

import { parquetMetadataAsync } from 'hyparquet';
import type { FileMetaData } from 'hyparquet';
import { asyncBuffer, readColumns } from './columns';
import { scanPass1, scanPass2, specColumns, type LeanSpec, type Pass1Result, type Pass2Result } from './scan';

export type DecodeRequest =
  | { id: number; pass: 1; file: File; fileIndex: number; rowStart: number; rowEnd: number; spec: LeanSpec; levels: number[] }
  | { id: number; pass: 2; file: File; fileIndex: number; rowStart: number; rowEnd: number; spec: LeanSpec; base: Float64Array; alloc: Uint32Array; level: number };

export type DecodeResponse =
  | { id: number; ok: true; pass: 1; result: Pass1Result }
  | { id: number; ok: true; pass: 2; result: Pass2Result }
  | { id: number; ok: false; error: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const footers = new Map<number, Promise<FileMetaData>>();

ctx.onmessage = async (ev: MessageEvent<DecodeRequest>) => {
  const q = ev.data;
  try {
    let meta = footers.get(q.fileIndex);
    if (!meta) {
      meta = parquetMetadataAsync(asyncBuffer(q.file));
      footers.set(q.fileIndex, meta);
    }
    const metadata = await meta;
    const cols = await readColumns(q.file, metadata, specColumns(q.spec, q.pass), q.rowStart, q.rowEnd);
    const n = q.rowEnd - q.rowStart;
    if (q.pass === 1) {
      const r = scanPass1(cols, n, q.spec, q.rowStart, q.levels);
      const transfer = [r.firstRow.buffer, r.lastRow.buffer, r.samples.buffer, r.box.buffer, r.keys.buffer, r.groupStart.buffer, r.groupRows.buffer, r.markers.pos.buffer, r.markers.t.buffer, r.markers.group.buffer];
      ctx.postMessage({ id: q.id, ok: true, pass: 1, result: r } satisfies DecodeResponse, transfer as Transferable[]);
    } else {
      const r = scanPass2(cols, n, q.spec, q.base, q.alloc, q.level);
      ctx.postMessage({ id: q.id, ok: true, pass: 2, result: r } satisfies DecodeResponse, [r.offset.buffer, r.used.buffer, r.keysA.buffer, r.keysB.buffer, r.spans.buffer, r.chunkOff.buffer] as Transferable[]);
    }
  } catch (e) {
    ctx.postMessage({ id: q.id, ok: false, error: e instanceof Error ? e.message : String(e) } satisfies DecodeResponse);
  }
};
