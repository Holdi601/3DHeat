/**
 * The Compare panel's pass, from the panel's setup to a result: the columns
 * the expressions can name (`buildSchema`), the setup bound into a request
 * (`prepare`), and the request run over the dataset in a worker (`runVersus`)
 * or here (`versusSync`, for the tests).
 *
 * As the volume comparison does (`volumes/compareRun.ts`), the main thread
 * only copies slices of the columns a request reads - a native memory copy, no
 * per-row script - and hands them over a few chunks in flight; the worker
 * folds them. A new request aborts the running one (the worker is ended).
 */

import { ACTORS, CANON, EVENT_KINDS, VEHICLE_CLASSES, eventKindOf } from '../data/canonical';
import { SOURCE_COLUMN } from '../data/builder';
import { outcomeColumns, roundNumberColumn } from '../data/outcome';
import { WEAPON_CLASSES, weaponClassOf } from '../breakdown/breakdownRun';
import { filterColumnData } from '../render/filterTables';
import { lowerBound } from '../render/sampling';
import type { CompareScope } from '../volumes/compare';
import { dwellCapOf } from '../volumes/stats';
import type { Volume } from '../volumes/volume';
import type { Dataset } from '../state/types';
import { bindMetric, bindPredicate, columnsOf, ExprError, type AggSpec, type Column, type RNode, type Schema, type VNode } from './expr';
import { createJob, finishJob, K, stepJob, type Bins, type Chunk, type LazyKeys, type Request, type Result } from './engine';
import type { MetricDef } from './metrics';

export const CHUNK = 1 << 18;
const IN_FLIGHT = 3;

// ---------------------------------------------------------------------------
// The columns

export function attrKey(name: string): string {
  return `a:${name}`;
}

export function buildSchema(ds: Dataset): Schema {
  const cols: Column[] = [
    { name: 'x', key: K.x, type: 'num' },
    { name: 'y', key: K.y, type: 'num', aliases: ['alt', 'altitude', 'height'] },
    { name: 'z', key: K.z, type: 'num' },
  ];
  if (ds.time) {
    cols.push({ name: 'time', key: K.time, type: 'num' });
    cols.push({ name: 'matchTime', key: K.matchTime, type: 'num', aliases: ['match time', 'clock'] });
  }
  if (ds.lifetime) cols.push({ name: 'dwell', key: K.dwell, type: 'num', aliases: ['gap'] });
  if (ds.time && ds.personId) {
    cols.push({ name: 'step', key: K.step, type: 'num', aliases: ['distance'] });
    cols.push({ name: 'speed', key: K.speed, type: 'num' });
  }
  if (ds.teamId) cols.push({ name: 'team', key: K.team, type: 'cat', labels: ds.teamLabels, aliases: ['side', 'group'] });
  if (ds.personId) cols.push({ name: 'person', key: K.person, type: 'cat', labels: ds.personLabels, aliases: ['player', 'name', 'unit'] });
  if (ds.sessionId) cols.push({ name: 'match', key: K.session, type: 'cat', labels: ds.sessionLabels, aliases: ['session'] });
  const taxonomy: Record<string, readonly string[]> = {
    [CANON.event]: EVENT_KINDS,
    [CANON.actor]: ACTORS,
    [CANON.vehicleClass]: VEHICLE_CLASSES,
    [CANON.targetClass]: VEHICLE_CLASSES,
  };
  const alias: Record<string, string[]> = {
    [CANON.event]: ['event', 'kind', 'eventType'],
    [CANON.actor]: ['actor'],
    [CANON.vehicleClass]: ['class', 'vehicleClass'],
    [CANON.targetClass]: ['targetClass'],
    [SOURCE_COLUMN]: ['source', 'file', 'container'],
  };
  for (const a of ds.attrs) {
    const c: Column = { name: a.name, key: attrKey(a.name), type: a.kind === 'category' ? 'cat' : 'num', labels: a.categories, aliases: alias[a.name] };
    const kinds = taxonomy[a.name];
    if (kinds && a.categories) c.canon = { map: Int8Array.from(a.categories, (l) => kinds.indexOf(l)), kinds };
    else if (a.categories && /^event/i.test(a.name)) c.canon = { map: Int8Array.from(a.categories, (l) => EVENT_KINDS.indexOf(eventKindOf(l))), kinds: EVENT_KINDS };
    cols.push(c);
  }
  const oc = outcomeColumns(ds);
  const round = oc.round ? roundNumberColumn(ds) : null;
  const ev = ds.attrs.find((a) => a.name === CANON.event && a.categories);
  return {
    cols,
    event: ev ? attrKey(ev.name) : null,
    person: ds.personId ? K.person : null,
    session: ds.sessionId ? K.session : null,
    round: round ? attrKey(round.name) : null,
    won: oc.round ? attrKey(oc.round.name) : null,
    presence: !!ds.lifetime,
    weaponClass: { classes: WEAPON_CLASSES, of: weaponClassOf },
  };
}

// ---------------------------------------------------------------------------
// The setup

export interface GroupSetup {
  label: string;
  /** A filter expression; empty for every row. */
  filter: string;
  /** Rows of these values of a source column only (`Source file`, the match), or none. */
  source?: { column: string; values: string[] } | null;
}

export type DimSetup =
  | { kind: 'matchTime' | 'time'; bins: number }
  | { kind: 'round' | 'match' | 'day' }
  | { kind: 'column'; column: string; top: number }
  | { kind: 'bins'; column: string; bins: number };

export interface Setup {
  region: { mode: 'all' | 'union' | 'separate'; volumes: Volume[] };
  groups: GroupSetup[];
  split: { column: string; top: number } | null;
  dim: DimSetup | null;
  metrics: MetricDef[];
  ref: number;
}

export interface Prepared {
  req: Request;
  /** Chunk keys the pass reads. */
  keys: string[];
  /** Mistakes, by group index and by metric id. */
  groupErrors: (ExprError | null)[];
  metricErrors: Map<string, ExprError>;
  /** The metrics that bound, in the request's order. */
  metrics: MetricDef[];
  lo: number;
  hi: number;
}

function sourceFilter(schema: Schema, src: GroupSetup['source']): RNode | null {
  if (!src || !src.values.length) return null;
  const col = schema.cols.find((c) => c.name === src.column) ?? null;
  if (!col || !col.labels) return null;
  const mask = Uint8Array.from(col.labels, (l) => (src.values.includes(l) ? 1 : 0));
  return { k: 'mask', a: { k: 'col', c: col.key }, mask };
}

/** Offset every aggregate of a statistic by `base` (the statistics share one list). */
function shift(n: VNode, map: number[]): VNode {
  switch (n.k) {
    case 'agg': return { k: 'agg', i: map[n.i] };
    case 'num': return n;
    case 'un': return { ...n, a: shift(n.a, map) };
    case 'bin': return { ...n, a: shift(n.a, map), b: shift(n.b, map) };
    case 'fn': return { ...n, args: n.args.map((x) => shift(x, map)) };
    case 'shrink': return { ...n, num: shift(n.num, map), den: shift(n.den, map) };
    case 'ofAll': return { ...n, a: shift(n.a, map) };
  }
}

export function prepare(ds: Dataset, setup: Setup, scope: CompareScope, schema = buildSchema(ds)): Prepared {
  const groupErrors: (ExprError | null)[] = [];
  const groups: { filter: RNode | null }[] = [];
  for (const g of setup.groups) {
    try {
      const f = bindPredicate(g.filter, schema);
      const s = sourceFilter(schema, g.source);
      groups.push({ filter: f && s ? { k: 'bin', op: 'and', a: s, b: f } : (f ?? s) });
      groupErrors.push(null);
    } catch (e) {
      groupErrors.push(e instanceof ExprError ? e : new ExprError('internal', { message: String(e) }));
      groups.push({ filter: { k: 'num', v: 0 } });
    }
  }
  const aggs: AggSpec[] = [];
  const metrics: VNode[] = [];
  const bound: MetricDef[] = [];
  const metricErrors = new Map<string, ExprError>();
  for (const m of setup.metrics) {
    try {
      const b = bindMetric(m.expr, schema);
      const map = b.aggs.map((a) => {
        const i = aggs.findIndex((x) => x.key === a.key);
        return i >= 0 ? i : aggs.push(a) - 1;
      });
      metrics.push(shift(b.expr, map));
      bound.push(m);
    } catch (e) {
      metricErrors.set(m.id, e instanceof ExprError ? e : new ExprError('internal', { message: String(e) }));
    }
  }
  const colOf = (name: string) => schema.cols.find((c) => c.name === name) ?? null;
  let split: LazyKeys | null = null;
  if (setup.split) {
    const c = colOf(setup.split.column);
    if (c) split = { kind: 'lazy', key: c.key, labels: c.labels ?? null, top: Math.max(1, setup.split.top), order: c.labels ? 'count' : 'key' };
  }
  let dim: LazyKeys | Bins | null = null;
  const d = setup.dim;
  let span = Math.max(1e-6, ds.timeRange[1] - ds.timeRange[0]);
  if (ds.sessionStart && ds.sessionEnd && ds.sessionStart.length) {
    span = 0;
    for (let s = 0; s < ds.sessionStart.length; s++) span = Math.max(span, ds.sessionEnd[s] - ds.sessionStart[s]);
  }
  if (d && ds.time) {
    if (d.kind === 'matchTime') dim = { kind: 'bins', key: K.matchTime, lo: 0, hi: Math.max(1, span), n: d.bins };
    else if (d.kind === 'time') dim = { kind: 'bins', key: K.time, lo: ds.timeRange[0], hi: Math.max(ds.timeRange[0] + 1, ds.timeRange[1]), n: d.bins };
    else if (d.kind === 'day' && ds.epochMs !== null) dim = { kind: 'lazy', key: K.time, labels: null, top: 64, order: 'key', epoch: ds.epochMs / 1000 };
  }
  if (d?.kind === 'round' && schema.round) dim = { kind: 'lazy', key: schema.round, labels: schema.cols.find((c) => c.key === schema.round)?.labels ?? null, top: 64, order: 'key' };
  if (d?.kind === 'match' && ds.sessionId) dim = { kind: 'lazy', key: K.session, labels: ds.sessionLabels, top: 48, order: 'key' };
  if (d?.kind === 'column') {
    const c = colOf(d.column);
    if (c) dim = { kind: 'lazy', key: c.key, labels: c.labels ?? null, top: Math.max(1, d.top), order: c.labels ? 'count' : 'key' };
  }
  if (d?.kind === 'bins') {
    const a = ds.attrs.find((x) => x.name === d.column && x.kind === 'number');
    if (a && a.max > a.min) dim = { kind: 'bins', key: attrKey(a.name), lo: a.min, hi: a.max, n: d.bins };
  }
  // The keys read.
  const keys = new Set<string>([K.x, K.y, K.z]);
  if (ds.time) keys.add(K.time);
  if (ds.lifetime) keys.add(K.life);
  if (ds.sessionId) keys.add(K.session);
  if (ds.teamId) keys.add(K.team);
  for (const g of groups) columnsOf(g.filter, keys);
  for (const a of aggs) {
    columnsOf(a.value, keys);
    columnsOf(a.filter, keys);
    a.parts?.forEach((p) => columnsOf(p, keys));
  }
  if (split) keys.add(split.key);
  if (dim) keys.add(dim.key);
  const usesWin = aggs.some((a) => a.fn === 'winRate' || a.fn === 'wins' || a.fn === 'played');
  if (usesWin) {
    if (schema.won) keys.add(schema.won);
    if (schema.round) keys.add(schema.round);
    if (ds.personId) keys.add(K.person);
  }
  const computed = {
    matchTime: keys.has(K.matchTime),
    dwell: keys.has(K.dwell) || aggs.some((a) => a.fn === 'presence'),
    step: keys.has(K.step),
    speed: keys.has(K.speed),
  };
  if (computed.step || computed.speed) {
    keys.add(K.person);
    if (schema.event) keys.add(schema.event);
  }
  const cluster: Request['meta']['cluster'] = ds.sessionId && ds.sessionLabels.length >= 2 ? 'session' : ds.personId && ds.personLabels.length >= 2 ? 'person' : null;
  if (cluster === 'session') keys.add(K.session);
  if (cluster === 'person') keys.add(K.person);
  let moving: Uint8Array | null = null;
  if (schema.event) {
    const ev = schema.cols.find((c) => c.key === schema.event)!;
    const pos = EVENT_KINDS.indexOf('position');
    if (ev.canon && Array.from(ev.canon.map).includes(pos)) moving = Uint8Array.from(ev.canon.map as Int8Array, (k) => (k === pos ? 1 : 0));
  }
  let rounds = 1;
  if (schema.round) {
    const a = ds.attrs.find((x) => attrKey(x.name) === schema.round)!;
    rounds = Math.max(1, Math.min(1024, Math.trunc(a.max) + 1));
  }
  for (const k of [...keys]) if (k === K.matchTime || k === K.dwell || k === K.step || k === K.speed) keys.delete(k);
  const req: Request = {
    scope,
    region: { mode: setup.region.mode, volumes: setup.region.mode === 'all' ? [] : [...setup.region.volumes] },
    groups,
    split,
    dim,
    aggs,
    metrics,
    ref: Math.max(0, Math.min(groups.length - 1, setup.ref)),
    meta: {
      persons: ds.personId ? ds.personLabels.length : 0,
      sessions: ds.sessionId ? ds.sessionLabels.length : 0,
      sessionStart: ds.sessionId && ds.sessionStart ? ds.sessionStart.slice() : null,
      t0: ds.timeRange[0],
      dwellCap: computed.dwell || computed.step || computed.speed ? dwellCapOf(ds) : Infinity,
      personShared: ds.personShared && (computed.step || computed.speed) ? ds.personShared.slice() : null,
      moving,
      eventKey: schema.event,
      wonKey: usesWin ? schema.won : null,
      roundKey: usesWin ? schema.round : null,
      rounds,
      cluster,
      computed,
    },
  };
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
  // Tracks need their history: step and speed read from the start.
  if (computed.step || computed.speed) lo = 0;
  return { req, keys: [...keys], groupErrors, metricErrors, metrics: bound, lo, hi: Math.max(lo, hi) };
}

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

function sourceOf(ds: Dataset, key: string): Float32Array | Uint32Array | Uint16Array | null {
  switch (key) {
    case K.x: return ds.px;
    case K.y: return ds.py;
    case K.z: return ds.pz;
    case K.time: return ds.time;
    case K.life: return ds.lifetime;
    case K.person: return ds.personId;
    case K.team: return ds.teamId;
    case K.session: return ds.sessionId;
  }
  return key.startsWith('a:') ? (ds.attrs.find((a) => a.name === key.slice(2))?.data ?? null) : null;
}

export function chunkAt(ds: Dataset, p: Prepared, lo: number, n: number): { chunk: Chunk; transfer: ArrayBuffer[] } {
  const transfer: ArrayBuffer[] = [];
  const cut = <T extends Float32Array | Uint32Array | Uint16Array>(a: T | null): T | null => {
    if (!a) return null;
    const c = a.slice(lo, lo + n) as T;
    transfer.push(c.buffer as ArrayBuffer);
    return c;
  };
  const cols: Chunk['cols'] = {};
  for (const k of p.keys) cols[k] = cut(sourceOf(ds, k));
  const filt = p.req.scope.filters.map((f) => {
    const d = filterColumnData(ds, f.column);
    return d ? cut(d as Float32Array | Uint32Array) : null;
  });
  return { chunk: { n, cols, filt }, transfer };
}

/** The whole pass on this thread: the tests and small data. */
export function versusSync(ds: Dataset, p: Prepared): Result {
  const job = createJob(p.req);
  for (let lo = p.lo; lo < p.hi; lo += CHUNK) stepJob(job, chunkAt(ds, p, lo, Math.min(CHUNK, p.hi - lo)).chunk);
  return finishJob(job);
}

/** The pass in a worker; rejects with an AbortError when `signal` is aborted. */
export function runVersus(ds: Dataset, p: Prepared, opts: { signal?: AbortSignal; onProgress?: (f: number) => void } = {}): Promise<Result> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
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
        const n = Math.min(CHUNK, p.hi - next);
        const { chunk, transfer } = chunkAt(ds, p, next, n);
        worker.postMessage({ type: 'chunk', chunk }, transfer);
        next += n;
        inFlight++;
      }
      if (!over && !finishing && next >= p.hi && inFlight === 0) {
        finishing = true;
        worker.postMessage({ type: 'finish' });
      }
    };
    worker.onmessage = (e: MessageEvent<{ type: 'ack' } | { type: 'done'; result: Result } | { type: 'error'; message: string }>) => {
      if (over) return;
      const m = e.data;
      if (m.type === 'ack') {
        inFlight--;
        const total = p.hi - p.lo;
        opts.onProgress?.(total > 0 ? Math.max(0, next - inFlight * CHUNK - p.lo) / total : 1);
        // A chunk at a time from an idle callback keeps the copy off busy frames.
        const idle = (globalThis as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
        if (idle) idle(pump, { timeout: 50 });
        else setTimeout(pump, 0);
      } else if (m.type === 'error') fail(new Error(m.message));
      else {
        end();
        resolve(m.result);
      }
    };
    worker.onerror = (e) => fail(new Error(e.message || 'compare worker failed'));
    if (opts.signal?.aborted) return fail(new DOMException('aborted', 'AbortError'));
    worker.postMessage({ type: 'start', req: p.req });
    pump();
  });
}
