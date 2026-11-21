/**
 * A chart counted once over the loaded data - all of it, the rows the view
 * shows, or the rows inside one volume - for a chart that is not a live sign:
 * an analysis document's chart block. The rows go to a worker
 * (`runWorker.ts`) a chunk at a time, copied (a native copy, no per-row
 * script), only the columns the chart reads, with a pause between chunks so
 * the page keeps painting; the worker folds each in and lets it go.
 */

import type { AggScope } from './aggregate';
import { aggScopes, metaOf, specColumns } from './data';
import type { ChartData, ChartSpec } from './types';
import { PERSON_FILTER_COLUMN } from '../render/filterTables';
import type { Dataset } from '../state/types';
import { FULL_SCOPE, type Scope } from '../volumes/stats';
import type { Volume } from '../volumes/volume';
import type { RunChunk } from './runWorker';

const CHUNK = 1 << 16;
const IN_FLIGHT = 3;

export interface RunOptions {
  /** The rows the view shows; absent: every row. */
  scope?: Scope | null;
  /** Only the rows inside it (and "inside vs outside" against it). */
  volume?: Volume | null;
  signal?: AbortSignal;
  onProgress?: (fraction: number) => void;
}

/** Count a chart over the data in a worker. */
export function runChart(ds: Dataset, spec: ChartSpec, opts: RunOptions = {}): Promise<ChartData> {
  const meta = metaOf(ds);
  const scope: AggScope = aggScopes(ds, opts.scope ?? FULL_SCOPE, null).scope;
  const cols = new Set(specColumns(spec, meta));
  for (const f of scope.filters) if (f.column !== PERSON_FILTER_COLUMN) cols.add(f.column);
  const columns = [...cols].map((c) => [c, ds.attrs.find((a) => a.name === c)?.data] as const).filter((x): x is readonly [string, Float32Array | Uint32Array] => !!x[1]);
  const vol = opts.volume ?? null;
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./runWorker.ts', import.meta.url), { type: 'module' });
    let next = 0;
    let inFlight = 0;
    let over = false;
    const end = () => {
      over = true;
      worker.terminate();
    };
    const fail = (e: unknown) => {
      if (over) return;
      end();
      reject(e);
    };
    opts.signal?.addEventListener('abort', () => fail(new DOMException('aborted', 'AbortError')), { once: true });
    const pump = () => {
      if (over) return;
      while (inFlight < IN_FLIGHT && next < ds.count) {
        const lo = next;
        const hi = Math.min(ds.count, lo + CHUNK);
        const transfer: ArrayBuffer[] = [];
        const cut = <T extends Float32Array | Uint32Array | Uint16Array>(a: T | null | undefined): T | undefined => {
          if (!a) return undefined;
          const c = a.slice(lo, hi) as T;
          transfer.push(c.buffer as ArrayBuffer);
          return c;
        };
        const chunk: RunChunk = { n: hi - lo, time: cut(ds.time), life: cut(ds.lifetime), team: cut(ds.teamId), person: cut(ds.personId), session: cut(ds.sessionId), cols: {} };
        if (vol) {
          chunk.x = cut(ds.px);
          chunk.y = cut(ds.py);
          chunk.z = cut(ds.pz);
        }
        for (const [name, data] of columns) chunk.cols[name] = cut(data)!;
        worker.postMessage({ type: 'chunk', chunk }, transfer);
        next = hi;
        inFlight++;
      }
      if (next >= ds.count && inFlight === 0) worker.postMessage({ type: 'finish' });
    };
    worker.onmessage = (e: MessageEvent<{ type: 'ack' } | { type: 'done'; data: ChartData }>) => {
      if (over) return;
      if (e.data.type === 'ack') {
        inFlight--;
        opts.onProgress?.(ds.count ? next / ds.count : 1);
        setTimeout(pump, 0);
      } else {
        end();
        resolve(e.data.data);
      }
    };
    worker.onerror = (e) => fail(new Error(e.message || 'chart worker failed'));
    if (opts.signal?.aborted) return fail(new DOMException('aborted', 'AbortError'));
    worker.postMessage({ type: 'start', meta, spec, scope, volume: vol });
    pump();
  });
}
