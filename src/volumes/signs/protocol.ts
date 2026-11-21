/**
 * What the chart signs' page side (`client.ts`), its row workers
 * (`worker.ts`, each holding a share of the rows) and the merging worker
 * (`mergeWorker.ts`) say to each other, and the packing of a chunk of rows.
 * Kept apart from the workers so the page imports no worker's code.
 */

import type { AggAcc, AggMeta, AggScope } from '../../charts/aggregate';
import type { ChartData, ChartSpec } from '../../charts/types';
import type { Volume } from '../volume';

export interface SignJob {
  id: string;
  volumeId: string;
  spec: ChartSpec;
  upToNow: boolean;
}

/** A column a chunk carries: the position, a core column, or an attribute (`c:<name>`). */
export interface ChunkField {
  key: string;
  type: 'f32' | 'u32' | 'u16';
}

/** Bytes a field takes in a chunk of `n` rows, kept to four-byte steps. */
export function fieldBytes(f: ChunkField, n: number): number {
  return f.type === 'u16' ? (2 * n + 3) & ~3 : 4 * n;
}

/** The typed arrays of a packed chunk, in field order. */
export function chunkViews(buf: ArrayBuffer, fields: readonly ChunkField[], n: number): (Float32Array | Uint32Array | Uint16Array)[] {
  let off = 0;
  return fields.map((f) => {
    const v = f.type === 'f32' ? new Float32Array(buf, off, n) : f.type === 'u32' ? new Uint32Array(buf, off, n) : new Uint16Array(buf, off, n);
    off += fieldBytes(f, n);
    return v;
  });
}

/** The page to a row worker. */
export type ToWorker =
  | { type: 'port'; port: MessagePort; shard: number }
  /** How long a worker's step may run and rest after, ms. */
  | { type: 'pace'; run: number; rest: number }
  | { type: 'meta'; meta: AggMeta }
  | { type: 'build'; build: number; volumes: Volume[]; fields: ChunkField[]; rest: boolean; keepRows: number; sorted: boolean; total: number }
  | { type: 'chunk'; build: number; lo: number; n: number; buf: ArrayBuffer }
  | { type: 'built'; build: number }
  | { type: 'signs'; signs: SignJob[] }
  | { type: 'scope'; seq: number; scope: AggScope; upTo: AggScope };

/** How a build kept its rows: all of them (`keep` 1) or one in `keep`. */
export interface KeptInfo {
  inside: number;
  keepInside: number;
  rest: number;
  keepRest: number;
  /** Rows in no signed volume (when the rest is kept). */
  restRows: number;
  /** Most rows the budget let it keep. */
  budget: number;
}

/** A row worker to the page. */
export type FromWorker = { type: 'ack'; build: number; buf: ArrayBuffer } | { type: 'ready'; build: number; rows: Record<string, number>; kept: KeptInfo };

/** A row worker to the merging worker: a sign's share (unchanged since the last: no `acc`), and when it has done every sign for a scope. */
export type ToMerge =
  | { type: 'partial'; build: number; seq: number; id: string; acc: AggAcc | null }
  | { type: 'idle'; build: number; seq: number; ms: number; scan: number; folded: number; full: number };

/** The page to the merging worker. */
export type ToMerger =
  | { type: 'port'; port: MessagePort; shard: number }
  | { type: 'meta'; meta: AggMeta }
  | { type: 'build'; build: number; shards: number }
  | { type: 'signs'; signs: SignJob[] }
  | { type: 'scope'; seq: number; scope: AggScope; upTo: AggScope };

/** The merging worker to the page. */
export type FromMerger =
  | { type: 'result'; id: string; data: ChartData; seq: number }
  | { type: 'idle'; seq: number; ms: number; scan: number; folded: number; full: number };
