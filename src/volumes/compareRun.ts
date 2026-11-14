/**
 * Running the volume comparison (`compare.ts`) off the main thread.
 *
 * The page is not cross-origin isolated, so the worker cannot share the
 * dataset's columns, and a copy of a 100M-row dataset would double the memory
 * the load was sized to fit. So the columns go over a chunk at a time: the
 * main thread copies a slice of each column it needs (a native memory copy,
 * no per-row script) and hands it over, a few chunks in flight, the worker
 * folding each into the totals and asking for the next. A time window that
 * cuts the rows is applied by sending only the rows it can show.
 */

import { ACTORS, CANON, EVENT_KINDS, VEHICLE_CLASSES } from '../data/canonical';
import { filterColumnData } from '../render/filterTables';
import { valueColumnsOf } from '../data/cost';
import { lowerBound } from '../render/sampling';
import type { Dataset } from '../state/types';
import { createCompare, finishCompare, packYaw, stepCompare, type CompareChunk, type CompareMeta, type CompareResult, type CompareScope } from './compare';
import { dwellCapOf } from './stats';
import type { Volume } from './volume';

/** Rows a chunk: a few megabytes a column. */
export const COMPARE_CHUNK = 1 << 18;
const IN_FLIGHT = 3;

export interface ComparePrep {
  ds: Dataset;
  meta: CompareMeta;
  scope: CompareScope;
  volumes: Volume[];
  /** Rows the pass reads. */
  lo: number;
  hi: number;
  /** Packed bearings per row (directional heat), or null to use the view yaw. */
  dir: Uint8Array | null;
}

function taxonomyMap(ds: Dataset, column: string, kinds: readonly string[]): Int8Array | null {
  const a = ds.attrs.find((c) => c.name === column);
  if (!a || !a.categories) return null;
  const m = new Int8Array(a.categories.length);
  for (let i = 0; i < m.length; i++) m[i] = kinds.indexOf(a.categories[i]);
  return m;
}

export function prepareCompare(ds: Dataset, volumes: readonly Volume[], scope: CompareScope, dir: Uint8Array | null): ComparePrep {
  let span = Math.max(0, ds.timeRange[1] - ds.timeRange[0]);
  if (ds.sessionStart && ds.sessionEnd && ds.sessionStart.length > 0) {
    span = 0;
    for (let s = 0; s < ds.sessionStart.length; s++) span = Math.max(span, ds.sessionEnd[s] - ds.sessionStart[s]);
  }
  const meta: CompareMeta = {
    persons: ds.personId ? ds.personLabels.length : 0,
    teams: ds.teamId ? ds.teamLabels.length : 0,
    sessions: ds.sessionId ? ds.sessionLabels.length : 0,
    sessionStart: ds.sessionId && ds.sessionStart ? ds.sessionStart.slice() : null,
    t0: ds.timeRange[0],
    span: span > 0 ? span : 1,
    dwellCap: dwellCapOf(ds),
    personShared: ds.personId && ds.personShared ? ds.personShared.slice() : null,
    eventKinds: EVENT_KINDS.length,
    vehicleClasses: VEHICLE_CLASSES.length,
    actors: ACTORS.length,
    kill: EVENT_KINDS.indexOf('kill'),
    death: EVENT_KINDS.indexOf('death'),
    position: -1,
    eventMap: taxonomyMap(ds, CANON.event, EVENT_KINDS),
    actorMap: taxonomyMap(ds, CANON.actor, ACTORS),
    classMap: taxonomyMap(ds, CANON.vehicleClass, VEHICLE_CLASSES),
    hasTime: !!ds.time,
    hasLife: !!ds.lifetime,
    hasDir: !!(dir && dir.length === ds.count) || !!ds.yaw,
    values: valueColumnsOf(ds.attrs).map((c) => c.name),
  };
  // Follow tracks on movement samples only when there are any.
  const pos = EVENT_KINDS.indexOf('position');
  if (meta.eventMap && meta.eventMap.includes(pos)) meta.position = pos;
  // Rows in time order: only those the window can show.
  let lo = 0;
  let hi = ds.count;
  if (ds.time && ds.timeSorted) {
    if (scope.lifetimeNow !== null) {
      lo = lowerBound(ds.time, scope.lifetimeNow - Math.max(ds.maxLifetimeGap, scope.defaultLifetime));
      hi = upperBound(ds.time, scope.lifetimeNow);
    } else {
      if (scope.timeLo > -Infinity) lo = lowerBound(ds.time, scope.timeLo);
      if (scope.timeHi < Infinity) hi = upperBound(ds.time, scope.timeHi);
    }
  }
  return { ds, meta, scope, volumes: [...volumes], lo, hi: Math.max(lo, hi), dir: dir && dir.length === ds.count ? dir : null };
}

/** First index with `time[i] > t`. */
function upperBound(time: Float32Array, t: number): number {
  let a = 0;
  let b = time.length;
  while (a < b) {
    const m = (a + b) >>> 1;
    if (time[m] <= t) a = m + 1;
    else b = m;
  }
  return a;
}

/** Rows `[lo, lo + n)`, copied, with the buffers to transfer. */
export function chunkAt(p: ComparePrep, lo: number, n: number): { chunk: CompareChunk; transfer: ArrayBuffer[] } {
  const { ds } = p;
  const hi = lo + n;
  const transfer: ArrayBuffer[] = [];
  const cut = <T extends Float32Array | Uint32Array | Uint16Array | Uint8Array>(a: T | null | undefined): T | null => {
    if (!a) return null;
    const c = a.slice(lo, hi) as T;
    transfer.push(c.buffer as ArrayBuffer);
    return c;
  };
  const cat = (name: string) => (ds.attrs.find((a) => a.name === name)?.data as Uint32Array | undefined) ?? null;
  let dir = cut(p.dir);
  if (!dir && ds.yaw && p.meta.hasDir) {
    dir = packYaw(ds.yaw.subarray(lo, hi));
    transfer.push(dir.buffer as ArrayBuffer);
  }
  const chunk: CompareChunk = {
    n,
    px: cut(ds.px)!,
    py: cut(ds.py)!,
    pz: cut(ds.pz)!,
    time: cut(ds.time),
    life: cut(ds.lifetime),
    person: cut(ds.personId),
    team: cut(ds.teamId),
    session: cut(ds.sessionId),
    event: p.meta.eventMap ? cut(cat(CANON.event)) : null,
    actor: p.meta.actorMap ? cut(cat(CANON.actor)) : null,
    cls: p.meta.classMap ? cut(cat(CANON.vehicleClass)) : null,
    dir,
    filt: p.scope.filters.map((f) => {
      const d = filterColumnData(ds, f.column);
      return d ? cut(d as Float32Array | Uint32Array) : null;
    }),
    values: (p.meta.values ?? []).map((name) => cut(ds.attrs.find((a) => a.name === name)?.data as Float32Array | undefined)),
  };
  return { chunk, transfer };
}

/** The whole pass on this thread: for the tests and small data. */
export function compareSync(ds: Dataset, volumes: readonly Volume[], scope: CompareScope, dir: Uint8Array | null = null): CompareResult {
  const p = prepareCompare(ds, volumes, scope, dir);
  const job = createCompare(p.meta, p.volumes, p.scope);
  for (let lo = p.lo; lo < p.hi; lo += COMPARE_CHUNK) stepCompare(job, chunkAt(p, lo, Math.min(COMPARE_CHUNK, p.hi - lo)).chunk);
  return finishCompare(job);
}

/** The pass in a worker; rejects with an AbortError when `signal` is aborted. */
export function runCompare(
  ds: Dataset,
  volumes: readonly Volume[],
  scope: CompareScope,
  dir: Uint8Array | null,
  opts: { signal?: AbortSignal; onProgress?: (fraction: number) => void } = {},
): Promise<CompareResult> {
  const p = prepareCompare(ds, volumes, scope, dir);
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./compareWorker.ts', import.meta.url), { type: 'module' });
    let next = p.lo;
    let inFlight = 0;
    let finishing = false;
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
      while (!over && inFlight < IN_FLIGHT && next < p.hi) {
        const n = Math.min(COMPARE_CHUNK, p.hi - next);
        const { chunk, transfer } = chunkAt(p, next, n);
        worker.postMessage({ type: 'chunk', chunk }, transfer);
        next += n;
        inFlight++;
      }
      if (!over && !finishing && next >= p.hi && inFlight === 0) {
        finishing = true;
        worker.postMessage({ type: 'finish' });
      }
    };
    worker.onmessage = (e: MessageEvent<{ type: 'ack' } | { type: 'done'; result: CompareResult }>) => {
      if (over) return;
      const m = e.data;
      if (m.type === 'ack') {
        inFlight--;
        const total = p.hi - p.lo;
        opts.onProgress?.(total > 0 ? (next - inFlight * COMPARE_CHUNK - p.lo) / total : 1);
        pump();
      } else {
        end();
        resolve(m.result);
      }
    };
    worker.onerror = (e) => fail(new Error(e.message || 'compare worker failed'));
    if (opts.signal?.aborted) return fail(new DOMException('aborted', 'AbortError'));
    worker.postMessage({ type: 'start', meta: p.meta, volumes: p.volumes, scope: p.scope });
    pump();
  });
}
