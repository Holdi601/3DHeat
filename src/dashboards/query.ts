/**
 * The dashboards' query engine: rows (columns of typed arrays) to the
 * accumulators of every tile, by masks, incrementally. Pure and DOM-free: it
 * runs in the dashboard row workers (`worker.ts`), one share of the rows each,
 * and in tests.
 *
 * - A **clause** is one condition on the rows (a slicer's values, a range, the
 *   3D view's scope, a Compare predicate, the inside of a volume, a
 *   cross-filter's marks). Each is worked out once into a bitset and kept by
 *   its key, so a slicer change re-reads one column, not every filter.
 * - A **mask** is the AND of a tile's clauses, kept by the sorted clause keys:
 *   tiles with the same filters share it, and fold from one pass over it
 *   (the shared scan).
 * - A **query** is a tile's grouping (`DimSpec`s, their cells the product of
 *   their sizes) and accumulators (`AccSpec`s: counts, sums, min / max, fine
 *   histograms for medians and percentiles, distinct values). When its mask
 *   changes and the change is smaller than the rows shown, the rows that left
 *   are folded out and those that came in folded in - every accumulator but
 *   min / max subtracts as easily as it adds - else it starts over. The last
 *   few masks' results are kept, so a filter taken off again is no work.
 *
 * Partials (`Partial`) are summed across the workers on the main thread
 * (`mergePartials`): every accumulator is a sum, a min / max or a set union.
 */

import { shownMask, type AggScope, type RowTable } from '../charts/aggregate';
import { compileRow } from '../versus/engine';
import type { RNode } from '../versus/expr';
import { compiled, compiledContains, type Volume } from '../volumes/volume';

export type ColArr = Float32Array | Uint32Array | Uint16Array;

/** A worker's rows: columns by key (`@time`, `@team`, `a:<column>`, `k:<calculated>`), each standing for `weight` rows. */
export interface Store {
  n: number;
  weight: number;
  cols: Record<string, ColArr>;
  /** Rows ascending in `@time`. */
  sorted: boolean;
  /** The longest lifetime in `@life`, seconds (lifetime windows); Infinity when unknown. */
  maxLife: number;
}

/** A grouping: a category column's index, or equal bins over a numeric one. */
export type DimSpec = { k: 'cat'; key: string; size: number } | { k: 'bin'; key: string; lo: number; step: number; count: number };

export type Clause =
  | { k: 'in'; key: string; values: number[]; out?: boolean }
  | { k: 'range'; key: string; lo: number; hi: number }
  | { k: 'view'; scope: AggScope }
  | { k: 'expr'; node: RNode }
  | { k: 'volume'; volume: Volume }
  /** A cross-filter: the rows whose cell over `dims` is one of `cells`. */
  | { k: 'tuples'; dims: DimSpec[]; cells: number[] }
  | { k: 'none' };

export type AccSpec =
  | { k: 'count'; where?: RNode | null }
  | { k: 'sum'; key: string; where?: RNode | null }
  | { k: 'min'; key: string; where?: RNode | null }
  | { k: 'max'; key: string; where?: RNode | null }
  | { k: 'hist'; key: string; lo: number; hi: number; bins: number; where?: RNode | null }
  | { k: 'distinct'; key: string; where?: RNode | null };

export interface QuerySpec {
  id: string;
  dims: DimSpec[];
  accs: AccSpec[];
  clauses: Clause[];
}

/** One worker's accumulators of a query: arrays per acc (a distinct's present keys), summed across workers. */
export interface Partial {
  id: string;
  cells: number;
  rows: number;
  accs: Float64Array[];
}

/** Most cells a query may have (the product of its dims' sizes). */
export const MAX_CELLS = 1 << 20;
/** Most histogram bins over all cells of one accumulator. */
export const MAX_HIST = 1 << 22;
const BLOCK = 4096;
const TWO32 = 4294967296;

export function cellsOf(dims: readonly DimSpec[]): number {
  let c = 1;
  for (const d of dims) c *= Math.max(1, d.k === 'cat' ? d.size : d.count);
  return c;
}

// ---------------------------------------------------------------------------
// Bitsets

export const words = (n: number) => (n + 31) >>> 5;

export function popcount(b: Uint32Array): number {
  let c = 0;
  for (let i = 0; i < b.length; i++) {
    let v = b[i];
    v = v - ((v >>> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
    c += (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
  }
  return c;
}

function pop32(v: number): number {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

/** Bits [lo, hi) set. */
function setRange(b: Uint32Array, lo: number, hi: number): void {
  if (hi <= lo) return;
  const w0 = lo >>> 5;
  const w1 = (hi - 1) >>> 5;
  if (w0 === w1) {
    b[w0] |= (0xffffffff >>> (32 - (hi - lo))) << (lo & 31);
    return;
  }
  b[w0] |= 0xffffffff << (lo & 31);
  for (let w = w0 + 1; w < w1; w++) b[w] = 0xffffffff;
  const r = hi & 31;
  b[w1] |= r === 0 ? 0xffffffff : 0xffffffff >>> (32 - r);
}

function bound(a: ColArr, n: number, v: number, after: boolean): number {
  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (after ? a[m] <= v : a[m] < v) lo = m + 1;
    else hi = m;
  }
  return lo;
}

// ---------------------------------------------------------------------------
// Clauses

export function clauseKey(c: Clause): string {
  return JSON.stringify(c, (_k, v) => (ArrayBuffer.isView(v) ? Array.from(v as Uint8Array) : v === Infinity ? 'inf' : v === -Infinity ? '-inf' : v));
}

/** A mask's key: its clauses' keys, sorted (the same filters in any order are one mask). */
export function maskKey(clauses: readonly Clause[]): string {
  return clauses.map(clauseKey).sort().join('&');
}

const scratch8 = new Uint8Array(BLOCK);
const rowsBuf = new Uint32Array(BLOCK);
const cellBuf = new Int32Array(BLOCK);
const idxBuf = new Int32Array(BLOCK);
const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);

/** The store as the chart module's `RowTable` (the view clause reuses its `shownMask`). */
function rowTable(s: Store): RowTable {
  const cols: RowTable['cols'] = {};
  for (const k of Object.keys(s.cols)) if (k.startsWith('a:')) cols[k.slice(2)] = s.cols[k] as Float32Array | Uint32Array;
  // The person filter reads the person column under its own name (render/filterTables.ts).
  return {
    n: s.n,
    weight: s.weight,
    time: (s.cols['@time'] as Float32Array) ?? null,
    life: (s.cols['@life'] as Float32Array) ?? null,
    team: (s.cols['@team'] as Uint16Array) ?? null,
    person: (s.cols['@person'] as Uint32Array) ?? null,
    session: (s.cols['@session'] as Uint32Array) ?? null,
    cols,
    sorted: s.sorted,
  };
}

/** Pack rows [lo, hi) of a 0/1 byte test into the bitset. */
function packBlocks(b: Uint32Array, lo: number, hi: number, test: (from: number, to: number, out: Uint8Array) => void): void {
  for (let a = lo; a < hi; a += BLOCK) {
    const e = Math.min(hi, a + BLOCK);
    test(a, e, scratch8);
    for (let i = a; i < e; i++) if (scratch8[i - a]) b[i >>> 5] |= 1 << (i & 31);
  }
}

/** Fill `out` with each row's cell over `dims` (-1 for none) for rows[0..k). */
export function fillCells(s: Store, dims: readonly DimSpec[], rows: Uint32Array, k: number, out: Int32Array): void {
  out.fill(0, 0, k);
  let mult = 1;
  for (const d of dims) {
    const col = s.cols[d.key];
    const size = d.k === 'cat' ? d.size : d.count;
    if (!col) {
      out.fill(-1, 0, k);
      return;
    }
    if (d.k === 'cat') {
      for (let j = 0; j < k; j++) {
        const c = out[j];
        if (c < 0) continue;
        const v = col[rows[j]];
        out[j] = v >= 0 && v < size && v === v ? c + Math.trunc(v) * mult : -1;
      }
    } else {
      const lo = d.lo;
      const inv = 1 / d.step;
      for (let j = 0; j < k; j++) {
        const c = out[j];
        if (c < 0) continue;
        const v = col[rows[j]];
        if (!(v === v)) {
          out[j] = -1;
          continue;
        }
        let b = Math.floor((v - lo) * inv);
        if (b < 0) b = 0;
        else if (b >= size) b = size - 1;
        out[j] = c + b * mult;
      }
    }
    mult *= size;
  }
}

/** A clause as a bitset over the store's rows. */
export function clauseBits(s: Store, c: Clause): Uint32Array {
  const n = s.n;
  const b = new Uint32Array(words(n));
  switch (c.k) {
    case 'none':
      return b;
    case 'in': {
      const col = s.cols[c.key];
      if (!col) {
        if (c.out) setRange(b, 0, n);
        return b;
      }
      let max = 0;
      for (const v of c.values) if (v > max) max = v;
      const m = new Uint8Array(max + 2);
      for (const v of c.values) if (v >= 0) m[v] = 1;
      const out = c.out ? 1 : 0;
      const ml = m.length;
      packBlocks(b, 0, n, (a, e, o) => {
        for (let i = a; i < e; i++) {
          const v = col[i];
          o[i - a] = (v >= 0 && v < ml ? m[v] : 0) ^ out;
        }
      });
      return b;
    }
    case 'range': {
      const col = s.cols[c.key];
      if (!col) return b;
      const lo = c.lo;
      const hi = c.hi;
      if (c.key === '@time' && s.sorted) {
        setRange(b, lo === -Infinity ? 0 : bound(col, n, lo, false), hi === Infinity ? n : bound(col, n, hi, true));
        return b;
      }
      packBlocks(b, 0, n, (a, e, o) => {
        for (let i = a; i < e; i++) {
          const v = col[i];
          o[i - a] = v >= lo && v <= hi ? 1 : 0;
        }
      });
      return b;
    }
    case 'view': {
      const t = rowTable(s);
      const sc = c.scope;
      // On time-sorted rows only the window's can show.
      let lo = 0;
      let hi = n;
      if (t.sorted && t.time) {
        if (sc.lifetimeNow !== null) {
          const life = Math.max(s.maxLife, sc.defaultLifetime);
          lo = Number.isFinite(life) ? bound(t.time, n, sc.lifetimeNow - life, false) : 0;
          hi = bound(t.time, n, sc.lifetimeNow, true);
        } else {
          lo = sc.timeLo === -Infinity ? 0 : bound(t.time, n, sc.timeLo, false);
          hi = sc.timeHi === Infinity ? n : bound(t.time, n, sc.timeHi, true);
        }
      }
      packBlocks(b, lo, hi, (a, e, o) => shownMask(t, sc, a, e, o, true, a));
      return b;
    }
    case 'expr': {
      const f = compileRow(c.node, s.cols);
      packBlocks(b, 0, n, (a, e, o) => {
        for (let i = a; i < e; i++) o[i - a] = f(i) ? 1 : 0;
      });
      return b;
    }
    case 'volume': {
      const v = compiled(c.volume);
      const x = s.cols['@x'];
      const y = s.cols['@y'];
      const z = s.cols['@z'];
      if (!x || !y || !z) return b;
      packBlocks(b, 0, n, (a, e, o) => {
        for (let i = a; i < e; i++) o[i - a] = compiledContains(v, x[i], y[i], z[i]) ? 1 : 0;
      });
      return b;
    }
    case 'tuples': {
      const set = new Set(c.cells);
      for (let a = 0; a < n; a += BLOCK) {
        const e = Math.min(n, a + BLOCK);
        const k = e - a;
        for (let j = 0; j < k; j++) rowsBuf[j] = a + j;
        fillCells(s, c.dims, rowsBuf, k, cellBuf);
        for (let j = 0; j < k; j++) if (cellBuf[j] >= 0 && set.has(cellBuf[j])) b[(a + j) >>> 5] |= 1 << ((a + j) & 31);
      }
      return b;
    }
  }
}

// ---------------------------------------------------------------------------
// Accumulators

export interface QueryState {
  spec: QuerySpec;
  /** dims + accs: equal for queries that fold the same way. */
  shape: string;
  cells: number;
  accs: Acc[];
  /** The mask it holds the numbers of, and its key. */
  bits: Uint32Array | null;
  key: string;
  rows: number;
  /** Results for the last few masks, by key. */
  memo: Map<string, { accs: Acc[]; rows: number; bits: Uint32Array }>;
}

export type Acc = { spec: AccSpec; arr: Float64Array | null; map: Map<number, number> | null; fn: ((i: number) => number) | null };

export const shapeOf = (q: Pick<QuerySpec, 'dims' | 'accs'>) => JSON.stringify([q.dims, q.accs], (_k, v) => (ArrayBuffer.isView(v) ? Array.from(v as Uint8Array) : v));

export function subtractable(q: Pick<QuerySpec, 'accs'>): boolean {
  return q.accs.every((a) => a.k !== 'min' && a.k !== 'max');
}

function newAcc(spec: AccSpec, cells: number, s: Store): Acc {
  const fn = spec.where ? compileRow(spec.where, s.cols) : null;
  switch (spec.k) {
    case 'count':
      return { spec, arr: new Float64Array(cells), map: null, fn };
    case 'sum':
      return { spec, arr: new Float64Array(cells * 2), map: null, fn };
    case 'min':
      return { spec, arr: new Float64Array(cells).fill(Infinity), map: null, fn };
    case 'max':
      return { spec, arr: new Float64Array(cells).fill(-Infinity), map: null, fn };
    case 'hist':
      return { spec, arr: new Float64Array(cells * spec.bins), map: null, fn };
    case 'distinct':
      return { spec, arr: null, map: new Map(), fn };
  }
}

export function createQuery(spec: QuerySpec, s: Store): QueryState {
  const cells = cellsOf(spec.dims);
  return { spec, shape: shapeOf(spec), cells, accs: spec.accs.map((a) => newAcc(a, cells, s)), bits: null, key: '', rows: 0, memo: new Map() };
}

function cloneAccs(accs: readonly Acc[]): Acc[] {
  return accs.map((a) => ({ spec: a.spec, fn: a.fn, arr: a.arr ? a.arr.slice() : null, map: a.map ? new Map(a.map) : null }));
}

/** Fold rows[0..k) in (`sign` 1) or out (-1). */
export function foldBlock(q: QueryState, s: Store, rows: Uint32Array, k: number, sign: 1 | -1): void {
  fillCells(s, q.spec.dims, rows, k, idxBuf);
  const w = s.weight * sign;
  q.rows += k * sign;
  for (const a of q.accs) {
    const fn = a.fn;
    const sp = a.spec;
    const arr = a.arr;
    if (sp.k === 'count') {
      for (let j = 0; j < k; j++) {
        const c = idxBuf[j];
        if (c < 0 || (fn && !fn(rows[j]))) continue;
        arr![c] += w;
      }
      continue;
    }
    const col = s.cols[sp.key];
    if (!col) continue;
    switch (sp.k) {
      case 'sum':
        for (let j = 0; j < k; j++) {
          const c = idxBuf[j];
          if (c < 0) continue;
          const r = rows[j];
          const v = col[r];
          if (!(v === v) || (fn && !fn(r))) continue;
          arr![2 * c] += v * w;
          arr![2 * c + 1] += w;
        }
        break;
      case 'min':
        for (let j = 0; j < k; j++) {
          const c = idxBuf[j];
          if (c < 0) continue;
          const v = col[rows[j]];
          if (v < arr![c] && (!fn || fn(rows[j]))) arr![c] = v;
        }
        break;
      case 'max':
        for (let j = 0; j < k; j++) {
          const c = idxBuf[j];
          if (c < 0) continue;
          const v = col[rows[j]];
          if (v > arr![c] && (!fn || fn(rows[j]))) arr![c] = v;
        }
        break;
      case 'hist': {
        const bins = sp.bins;
        const lo = sp.lo;
        const sc = bins / Math.max(1e-12, sp.hi - sp.lo);
        for (let j = 0; j < k; j++) {
          const c = idxBuf[j];
          if (c < 0) continue;
          const r = rows[j];
          const v = col[r];
          if (!(v === v) || (fn && !fn(r))) continue;
          let b = Math.floor((v - lo) * sc);
          if (b < 0) b = 0;
          else if (b >= bins) b = bins - 1;
          arr![c * bins + b] += w;
        }
        break;
      }
      case 'distinct': {
        const m = a.map!;
        const isF = col instanceof Float32Array;
        for (let j = 0; j < k; j++) {
          const c = idxBuf[j];
          if (c < 0) continue;
          const r = rows[j];
          let v: number;
          if (isF) {
            f32[0] = col[r];
            if (!(f32[0] === f32[0])) continue;
            v = u32[0];
          } else v = col[r];
          if (fn && !fn(r)) continue;
          const key = c * TWO32 + v;
          const now = (m.get(key) ?? 0) + sign;
          if (now <= 0) m.delete(key);
          else m.set(key, now);
        }
        break;
      }
    }
  }
}

/**
 * Fold the rows set in `a` and not in `b` (b null: every row of `a`) into
 * every query of a group, one pass over the bits for all of them: the shared
 * scan. Yields every `yieldWords` words so the worker can rest.
 */
export function* foldBits(group: readonly QueryState[], s: Store, a: Uint32Array, b: Uint32Array | null, sign: 1 | -1, yieldWords = 1 << 15): Generator<void, void, void> {
  let k = 0;
  const nw = a.length;
  for (let wi = 0; wi < nw; wi++) {
    let v = b ? a[wi] & ~b[wi] : a[wi];
    while (v !== 0) {
      const t = v & -v;
      const bit = 31 - Math.clz32(t);
      rowsBuf[k++] = (wi << 5) + bit;
      v ^= t;
      if (k === BLOCK) {
        for (const q of group) foldBlock(q, s, rowsBuf, k, sign);
        k = 0;
      }
    }
    if ((wi & (yieldWords - 1)) === yieldWords - 1) yield;
  }
  if (k) for (const q of group) foldBlock(q, s, rowsBuf, k, sign);
}

/** Rows set in `a` but not `b`, plus in `b` but not `a`. */
export function diffCount(a: Uint32Array, b: Uint32Array): number {
  let c = 0;
  for (let i = 0; i < a.length; i++) c += pop32(a[i] ^ b[i]);
  return c;
}

export function resetQuery(q: QueryState, s: Store): void {
  q.accs = q.spec.accs.map((a) => newAcc(a, q.cells, s));
  q.rows = 0;
}

/** Remember the query's numbers under its mask (at most `keep`), for a filter taken off again. */
export function memoize(q: QueryState, keep = 3): void {
  if (!q.bits) return;
  q.memo.delete(q.key);
  q.memo.set(q.key, { accs: cloneAccs(q.accs), rows: q.rows, bits: q.bits });
  while (q.memo.size > keep) q.memo.delete(q.memo.keys().next().value as string);
}

/** Take numbers remembered for a mask; true when there were some. */
export function recall(q: QueryState, key: string): boolean {
  const m = q.memo.get(key);
  if (!m) return false;
  q.accs = cloneAccs(m.accs);
  q.rows = m.rows;
  q.bits = m.bits;
  q.key = key;
  return true;
}

export function partialOf(q: QueryState): Partial {
  return {
    id: q.spec.id,
    cells: q.cells,
    rows: q.rows,
    accs: q.accs.map((a) => (a.map ? Float64Array.from(a.map.keys()) : a.arr!.slice())),
  };
}

// ---------------------------------------------------------------------------
// The main thread's side: workers' partials summed into one result

/** A query's numbers over every worker. */
export interface Merged {
  id: string;
  cells: number;
  rows: number;
  /** Per acc: counts per cell, [sum, n] per cell, min / max per cell, bins per cell, distinct count per cell. */
  accs: Float64Array[];
}

export function mergePartials(spec: Pick<QuerySpec, 'id' | 'accs'>, parts: readonly Partial[]): Merged {
  const cells = parts[0]?.cells ?? 1;
  const out: Merged = { id: spec.id, cells, rows: 0, accs: [] };
  for (const p of parts) out.rows += p.rows;
  spec.accs.forEach((a, i) => {
    if (a.k === 'distinct') {
      const set = new Set<number>();
      for (const p of parts) for (const k of p.accs[i]) set.add(k);
      const cnt = new Float64Array(cells);
      for (const k of set) cnt[Math.floor(k / TWO32)]++;
      out.accs.push(cnt);
      return;
    }
    const first = parts[0]?.accs[i];
    if (!first) {
      out.accs.push(new Float64Array(a.k === 'sum' ? cells * 2 : a.k === 'hist' ? cells * a.bins : cells));
      return;
    }
    const acc = first.slice();
    for (let p = 1; p < parts.length; p++) {
      const x = parts[p].accs[i];
      if (a.k === 'min') for (let j = 0; j < acc.length; j++) acc[j] = Math.min(acc[j], x[j]);
      else if (a.k === 'max') for (let j = 0; j < acc.length; j++) acc[j] = Math.max(acc[j], x[j]);
      else for (let j = 0; j < acc.length; j++) acc[j] += x[j];
    }
    out.accs.push(acc);
  });
  return out;
}

/** The value at quantile `q` (0..1) of one cell's fine histogram over [lo, hi]. */
export function histQuantile(h: Float64Array, off: number, bins: number, lo: number, hi: number, q: number): number {
  let total = 0;
  for (let b = 0; b < bins; b++) total += h[off + b];
  if (total <= 0) return NaN;
  const want = q * total;
  let acc = 0;
  const step = (hi - lo) / bins;
  for (let b = 0; b < bins; b++) {
    const v = h[off + b];
    if (acc + v >= want && v > 0) return lo + step * (b + (want - acc) / v);
    acc += v;
  }
  return hi;
}

/** Everything of one worker: the store, its clause and mask caches, its queries. */
export class Engine {
  clauses = new Map<string, Uint32Array>();
  masks = new Map<string, Uint32Array>();
  queries = new Map<string, QueryState>();
  /** Bitsets kept in the caches at most (each `words(n)` words). */
  maxBitsets = 48;
  stats = { scans: 0, folded: 0, full: 0, recalled: 0, delta: 0 };
  constructor(public store: Store) {}

  private lru<T>(m: Map<string, T>, k: string, v: T): void {
    m.delete(k);
    m.set(k, v);
    while (m.size > Math.max(4, this.maxBitsets >> 1)) m.delete(m.keys().next().value as string);
  }

  clause(c: Clause): Uint32Array {
    const k = clauseKey(c);
    let b = this.clauses.get(k);
    if (b) {
      this.lru(this.clauses, k, b);
      return b;
    }
    this.stats.scans++;
    b = clauseBits(this.store, c);
    this.lru(this.clauses, k, b);
    return b;
  }

  mask(clauses: readonly Clause[]): { key: string; bits: Uint32Array } {
    const key = maskKey(clauses);
    let b = this.masks.get(key);
    if (b) {
      this.lru(this.masks, key, b);
      return { key, bits: b };
    }
    const n = this.store.n;
    b = new Uint32Array(words(n));
    if (!clauses.length) setRange(b, 0, n);
    else {
      b.set(this.clause(clauses[0]));
      for (let i = 1; i < clauses.length; i++) {
        const c = this.clause(clauses[i]);
        for (let w = 0; w < b.length; w++) b[w] &= c[w];
      }
    }
    this.lru(this.masks, key, b);
    return { key, bits: b };
  }

  /** Columns changed (a new one, a calculated one again): everything that read them starts over. */
  invalidate(): void {
    this.clauses.clear();
    this.masks.clear();
    this.queries.clear();
  }

  /**
   * Bring every query up to date with its clauses, in steps; the partials of
   * them all at the end. Queries of one mask fold together (one pass over its
   * bits), a query one small change away folds only the change.
   */
  *run(specs: readonly QuerySpec[]): Generator<void, Partial[], void> {
    const s = this.store;
    const live = new Set(specs.map((q) => q.id));
    for (const id of [...this.queries.keys()]) if (!live.has(id)) this.queries.delete(id);
    const full = new Map<string, { bits: Uint32Array; qs: QueryState[] }>();
    const delta: { qs: QueryState; from: Uint32Array; to: Uint32Array }[] = [];
    for (const spec of specs) {
      const shape = shapeOf(spec);
      let q = this.queries.get(spec.id);
      if (!q || q.shape !== shape) {
        q = createQuery(spec, s);
        this.queries.set(spec.id, q);
      }
      q.spec = spec;
      const m = this.mask(spec.clauses);
      if (q.bits && q.key === m.key) continue;
      memoize(q);
      if (recall(q, m.key)) {
        this.stats.recalled++;
        continue;
      }
      const shown = popcount(m.bits);
      if (q.bits && subtractable(spec) && diffCount(q.bits, m.bits) * 2 < shown) {
        delta.push({ qs: q, from: q.bits, to: m.bits });
        this.stats.delta++;
      } else {
        resetQuery(q, s);
        let g = full.get(m.key);
        if (!g) full.set(m.key, (g = { bits: m.bits, qs: [] }));
        g.qs.push(q);
        this.stats.full++;
      }
      q.bits = m.bits;
      q.key = m.key;
    }
    for (const g of full.values()) {
      this.stats.folded += popcount(g.bits);
      yield* foldBits(g.qs, s, g.bits, null, 1);
    }
    for (const d of delta) {
      yield* foldBits([d.qs], s, d.from, d.to, -1);
      yield* foldBits([d.qs], s, d.to, d.from, 1);
    }
    return specs.map((sp) => partialOf(this.queries.get(sp.id)!));
  }
}

/** Run a stepped job to its end at once (tests, small data). */
export function runAll<T>(g: Generator<void, T, void>): T {
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}
