/**
 * Running the close-quarters analysis on a loaded dataset: in its own worker,
 * beside the insight pass, over the same chunks of the same rows (the view's
 * filters, hidden groups and match apply; the time does not). The main thread
 * only copies slices; resolving rows (`feed.ts`) and the walk happen in the
 * worker. The result goes into the report as `lens.cqb`.
 */

import { EVENT_KINDS } from '../../data/canonical';
import type { Dataset } from '../../state/types';
import type { CompareScope } from '../../volumes/compare';
import { chunkAt, COMPARE_CHUNK, prepareCompare } from '../../volumes/compareRun';
import { buyScore } from './buy';
import { feedRows, type CqbChunk, type CqbMeta } from './feed';
import { finishCqb, type CqbMetrics, type CqbNames } from './finish';
import { canonKind, createWalk, finishFlags, rawKind, stepWalk } from './walk';

const IN_FLIGHT = 3;
const OTHER = ['other', 'victim', 'killer', 'attacker', 'target'];
const PLACE = /^(place|area|callout|zone|room|location|place.?name)$/i;
const WEAPON = /^(weapon|weapon.?name)$/i;
const FLASHED = ['state_flashed', 'flashed', 'blind'];

interface Prep {
  meta: CqbMeta;
  cmp: ReturnType<typeof prepareCompare>;
  cols: { yaw: Float32Array | null; raw: Uint32Array | null; other: Uint32Array | null; place: Uint32Array | null; weapon: Uint32Array | null; won: Float32Array | null; flashed: Float32Array | null; buy: Uint32Array | null };
  names: CqbNames;
}

/** Null when the data cannot carry the analysis: no time, people, sides or kills. */
function prepare(ds: Dataset, scope: CompareScope): Prep | null {
  if (!ds.time || !ds.personId || !ds.teamId || ds.teamLabels.length < 2) return null;
  const sc = { ...scope, timeLo: -Infinity, timeHi: Infinity, lifetimeNow: null };
  const cmp = prepareCompare(ds, [], sc, null);
  cmp.meta.hasDir = false;
  const attr = (pred: (n: string) => boolean, kind?: 'category' | 'number') => ds.attrs.find((a) => pred(a.name) && (!kind || (kind === 'category' ? !!a.categories : !a.categories)));
  const rawA = attr((n) => n === 'event', 'category');
  const otherA = OTHER.map((n) => attr((x) => x === n, 'category')).find(Boolean);
  const placeA = attr((n) => PLACE.test(n), 'category');
  const weaponA = attr((n) => WEAPON.test(n), 'category');
  const wonA = attr((n) => /^won$/i.test(n), 'number');
  const flashedA = FLASHED.map((n) => attr((x) => x === n, 'number')).find(Boolean);
  const buyA = attr((n) => /^buy$/i.test(n), 'category');
  const kindOf = cmp.meta.eventMap ? Int8Array.from(cmp.meta.eventMap, (k) => (k >= 0 ? canonKind(EVENT_KINDS[k]) : -1)) : null;
  if (!kindOf || !kindOf.some((k) => k === 1 || k === 2)) return null;
  const persons = new Map(ds.personLabels.map((l, i) => [l, i]));
  const meta: CqbMeta = {
    scope: cmp.scope,
    kindOf,
    rawOf: rawA?.categories ? Int8Array.from(rawA.categories, rawKind) : null,
    otherOf: otherA?.categories ? Int32Array.from(otherA.categories, (c) => persons.get(c) ?? -1) : null,
    buyOf: buyA?.categories ? Float32Array.from(buyA.categories, buyScore) : null,
    upm: ds.entitySize ? ds.entitySize / 0.8 : 1,
  };
  return {
    meta,
    cmp,
    cols: {
      yaw: ds.yaw,
      raw: (rawA?.data as Uint32Array) ?? null,
      other: (otherA?.data as Uint32Array) ?? null,
      place: (placeA?.data as Uint32Array) ?? null,
      weapon: (weaponA?.data as Uint32Array) ?? null,
      won: (wonA?.data as Float32Array) ?? null,
      flashed: (flashedA?.data as Float32Array) ?? null,
      buy: (buyA?.data as Uint32Array) ?? null,
    },
    names: { teams: ds.teamLabels.slice(), places: placeA?.categories?.slice() ?? null, weapons: weaponA?.categories?.slice() ?? null },
  };
}

function chunk(p: Prep, lo: number, n: number): { chunk: CqbChunk; transfer: ArrayBuffer[] } {
  const { chunk: c, transfer } = chunkAt(p.cmp, lo, n);
  const cut = <T extends Float32Array | Uint32Array>(a: T | null): T | null => {
    if (!a) return null;
    const s = a.slice(lo, lo + n) as T;
    transfer.push(s.buffer as ArrayBuffer);
    return s;
  };
  const k = p.cols;
  return { chunk: { ...c, row0: lo, yaw: cut(k.yaw), raw: cut(k.raw), other: cut(k.other), place: cut(k.place), weapon: cut(k.weapon), won: cut(k.won), flashed: cut(k.flashed), buy: cut(k.buy) }, transfer };
}

function named(m: CqbMetrics | undefined, ds: Dataset): CqbMetrics | undefined {
  if (m?.impact) for (const v of [...m.impact.wpa, ...m.impact.rapm]) v.person = ds.personLabels[v.personIndex] ?? `#${v.personIndex}`;
  if (m?.outcome) for (const v of [...m.outcome.best, ...m.outcome.worst]) v.person = ds.personLabels[v.personIndex] ?? `#${v.personIndex}`;
  return m;
}

interface Done {
  metrics?: CqbMetrics;
  flags?: Uint32Array;
}

/** On this thread: the tests and small data. */
export function cqbSync(ds: Dataset, scope: CompareScope): CqbMetrics | undefined {
  return syncWalk(ds, scope, false).metrics;
}

/** Each row's situation bits (`walk.ts` F_*), on this thread; null where the data cannot carry them. */
export function cqbFlagsSync(ds: Dataset, scope: CompareScope): Uint32Array | null {
  return syncWalk(ds, scope, true).flags ?? null;
}

function syncWalk(ds: Dataset, scope: CompareScope, flags: boolean): Done {
  const p = prepare(ds, scope);
  if (!p) return {};
  const w = createWalk({ upm: p.meta.upm, rows: flags ? ds.count : 0 });
  for (let lo = p.cmp.lo; lo < p.cmp.hi; lo += COMPARE_CHUNK) stepWalk(w, feedRows(p.meta, chunk(p, lo, Math.min(COMPARE_CHUNK, p.cmp.hi - lo)).chunk));
  if (flags) {
    const f = finishFlags(w);
    return { flags: f ? Uint32Array.from(f) : undefined };
  }
  return { metrics: named(finishCqb(w, p.names), ds) };
}

/** In a worker; undefined when the data cannot carry it or the analysis fails (it never costs the report). */
export function runCqb(ds: Dataset, scope: CompareScope, signal?: AbortSignal): Promise<CqbMetrics | undefined> {
  return walkInWorker(ds, scope, false, signal).then((d) => named(d.metrics, ds));
}

/** Each row's situation bits, in a worker; null where the data cannot carry them. */
export function runCqbFlags(ds: Dataset, scope: CompareScope, signal?: AbortSignal): Promise<Uint32Array | null> {
  return walkInWorker(ds, scope, true, signal).then((d) => d.flags ?? null);
}

function walkInWorker(ds: Dataset, scope: CompareScope, flags: boolean, signal?: AbortSignal): Promise<Done> {
  const p = prepare(ds, scope);
  if (!p) return Promise.resolve({});
  return new Promise((resolveP) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    let next = p.cmp.lo;
    let inFlight = 0;
    let over = false;
    const end = (d: Done = {}) => {
      if (over) return;
      over = true;
      worker.terminate();
      resolveP(d);
    };
    signal?.addEventListener('abort', () => end(), { once: true });
    const pump = () => {
      while (!over && inFlight < IN_FLIGHT && next < p.cmp.hi) {
        const n = Math.min(COMPARE_CHUNK, p.cmp.hi - next);
        const { chunk: c, transfer } = chunk(p, next, n);
        worker.postMessage({ type: 'chunk', chunk: c }, transfer);
        next += n;
        inFlight++;
      }
      if (!over && next >= p.cmp.hi && inFlight === 0) worker.postMessage({ type: 'finish', names: p.names });
    };
    worker.onmessage = (e: MessageEvent<{ type: 'ack' } | ({ type: 'done' } & Done)>) => {
      if (e.data.type === 'ack') {
        inFlight--;
        pump();
      } else end({ metrics: e.data.metrics, flags: e.data.flags });
    };
    worker.onerror = (e) => {
      console.warn('cqb worker failed', e.message);
      end();
    };
    if (signal?.aborted) return end();
    worker.postMessage({ type: 'start', meta: p.meta, rows: flags ? ds.count : 0 });
    pump();
  });
}
