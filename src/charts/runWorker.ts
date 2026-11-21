/**
 * One chart over the whole dataset (or the rows inside one volume), counted
 * in one pass a chunk at a time (`run.ts` feeds it): each chunk folded into
 * the aggregation (`aggregate.ts`) and let go, nothing kept.
 */

import { addRows, createAgg, finishAgg, type Agg, type AggMeta, type AggScope, type AggSource, type RowTable } from './aggregate';
import type { ChartSpec } from './types';
import { compiled, compiledContains, type CompiledVolume, type Volume } from '../volumes/volume';

export interface RunChunk {
  n: number;
  x?: Float32Array;
  y?: Float32Array;
  z?: Float32Array;
  time?: Float32Array;
  life?: Float32Array;
  team?: Uint16Array;
  person?: Uint32Array;
  session?: Uint32Array;
  cols: Record<string, Float32Array | Uint32Array>;
}

export type RunMsg =
  | { type: 'start'; meta: AggMeta; spec: ChartSpec; scope: AggScope; volume: Volume | null }
  | { type: 'chunk'; chunk: RunChunk }
  | { type: 'finish' };

let agg: Agg | null = null;
let scope: AggScope | null = null;
let vol: CompiledVolume | null = null;
let inout = false;

self.onmessage = (e: MessageEvent<RunMsg>) => {
  const m = e.data;
  if (m.type === 'start') {
    agg = createAgg(m.meta, m.spec);
    scope = m.scope;
    vol = m.volume ? compiled(m.volume) : null;
    inout = m.spec.diff === 'inout' && !!vol;
    return;
  }
  if (m.type === 'chunk') {
    if (agg && scope) {
      const c = m.chunk;
      const table: RowTable = { n: c.n, weight: 1, time: c.time ?? null, life: c.life ?? null, team: c.team ?? null, person: c.person ?? null, session: c.session ?? null, cols: c.cols, sorted: false };
      const srcs: AggSource[] = [];
      if (vol && c.x && c.y && c.z) {
        // Inside: rows outside skipped; outside (for the diff): the other way round.
        const outside = new Uint8Array(c.n);
        for (let i = 0; i < c.n; i++) if (!compiledContains(vol, c.x[i], c.y[i], c.z[i])) outside[i] = 1;
        srcs.push({ table, side: inout ? 0 : -1, skip: outside });
        if (inout) {
          const inside = new Uint8Array(c.n);
          for (let i = 0; i < c.n; i++) inside[i] = outside[i] ? 0 : 1;
          srcs.push({ table, side: 1, skip: inside });
        }
      } else srcs.push({ table, side: -1, skip: null });
      for (const s of srcs) addRows(agg, s, 0, c.n, scope, 1);
    }
    (self as unknown as Worker).postMessage({ type: 'ack' });
    return;
  }
  if (agg && scope) (self as unknown as Worker).postMessage({ type: 'done', data: finishAgg(agg, scope) });
  agg = null;
};
