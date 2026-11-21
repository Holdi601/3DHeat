/**
 * The chart signs' shared scans: the rows a scope shows, worked out once for
 * every sign that reads them, and kept up to date by what changed.
 *
 * Each row worker (`worker.ts`) keeps two tables of its share of the rows:
 * those inside any signed volume (with a bit per volume saying which hold each
 * row) and, when a sign compares inside with outside, the rest. For each table
 * and scope (the view's, and the "up to now" one while it differs) a `Slot`
 * keeps a mask of the rows shown. A new scope updates the mask a column at a
 * time (`shownMask`), only over the rows it can change - on a time-sorted
 * table the time window's rows by binary search, and with the same filters
 * only the rows the window gained or lost - keeping the mask as it was there.
 *
 * A sign (`SignAgg`) reads one or more slots through `Feed`s (its volume's
 * rows, the rows outside it). It follows each slot by version: one change
 * behind, and the change smaller than the rows shown, it folds the rows no
 * longer shown out and the rows newly shown in (every accumulator subtracts
 * as easily as it adds); otherwise it starts over from the rows shown. Signs
 * of one spec on several volumes fold together (`updateSteps`), each row read
 * once for all of them; the rows are gathered from the masks a block at a time
 * into reused scratch, so nothing is allocated per change. Twenty signs on
 * four volumes after a filter change cost one mask pass per table and a fold
 * of the changed rows per spec - not twenty scans of every row. Work is done
 * in steps (generators) so the worker can rest between them.
 *
 * Pure and DOM-free: runs in the worker and in tests.
 */

import { createAgg, foldShared, shownMask, type Agg, type AggMeta, type AggScope, type FoldPart, type RowTable } from '../../charts/aggregate';
import type { ChartSpec } from '../../charts/types';

/** Rows kept for the signs: a table, which volumes hold each row, the longest lifetime. */
export interface KeptTable {
  t: RowTable;
  /** Per row a bit per signed volume holding it; null for the rest (rows in no volume). */
  member: Uint32Array | null;
  /** The longest a row stays alive (lifetime windows), seconds; Infinity when unknown. */
  maxLife: number;
}

/** Rows a mask pass and a fold work through at a time (their scratch blocks). */
const BLOCK = 1 << 16;
/** Rows a step works through before it yields (a multiple of BLOCK). */
const STEP_ROWS = 1 << 18;

/** First index of a sorted column whose value is >= v (`after`: > v). */
function bound(a: Float32Array, n: number, v: number, after: boolean): number {
  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (after ? a[m] <= v : a[m] < v) lo = m + 1;
    else hi = m;
  }
  return lo;
}

/** The rows a scope can show at all: on a time-sorted table its time window's, else every row. */
export function rangeOf(k: KeptTable, sc: AggScope): [number, number] {
  const t = k.t;
  if (!t.sorted || !t.time) return [0, t.n];
  if (sc.lifetimeNow !== null) {
    const life = Math.max(k.maxLife, sc.defaultLifetime);
    const lo = Number.isFinite(life) ? bound(t.time, t.n, sc.lifetimeNow - life, false) : 0;
    return [lo, bound(t.time, t.n, sc.lifetimeNow, true)];
  }
  return [sc.timeLo === -Infinity ? 0 : bound(t.time, t.n, sc.timeLo, false), sc.timeHi === Infinity ? t.n : bound(t.time, t.n, sc.timeHi, true)];
}

/** Equal ids: equal rows shown. */
export function scopeId(sc: AggScope): string {
  return `${sc.key}#${sc.timeLo}#${sc.timeHi}#${sc.lifetimeNow}`;
}

/** Scratch, reused by every pass: a block of the new mask, and blocks of row indices to fold. */
const block = new Uint8Array(BLOCK);
const rowsA = new Uint32Array(BLOCK);
const rowsB = new Uint32Array(BLOCK);

/** A stepped job run to its end at once. */
export function run<T>(g: Generator<void, T>): T {
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}

/**
 * The rows one table shows under one scope, as a mask, and its last change:
 * the mask as it was before (`prev`, valid within the ranges the change
 * touched). Nothing is allocated per scope - the rows to fold are gathered a
 * block at a time into reused scratch - so a filter change on tens of millions
 * of rows costs the machine no memory traffic beyond the masks themselves.
 */
export class Slot {
  readonly mask: Uint8Array;
  private readonly prev: Uint8Array;
  /** Rows outside [lo, hi) are not shown. */
  lo = 0;
  hi = 0;
  scope: AggScope | null = null;
  id = '';
  version = 0;
  shown = 0;
  /** The ranges the last change (version - 1 to version) may have changed; null when not known (the first scope). */
  changed: [number, number][] | null = null;
  /** Rows the last change did change. */
  changes = 0;
  /** Rows the last update looked at, for the probes. */
  touched = 0;

  constructor(readonly table: KeptTable) {
    this.mask = new Uint8Array(table.t.n);
    this.prev = new Uint8Array(table.t.n);
  }

  /** Move to a scope; false when it shows the same rows. */
  update(sc: AggScope): boolean {
    return run(this.steps(sc));
  }

  /** `update` in steps: it yields every few hundred thousand rows, so the worker can pause between. */
  *steps(sc: AggScope): Generator<void, boolean> {
    const id = scopeId(sc);
    if (id === this.id) {
      this.scope = sc;
      return false;
    }
    const t = this.table.t;
    const mask = this.mask;
    const prev = this.prev;
    const [nlo, nhi] = rangeOf(this.table, sc);
    const old = this.scope;
    const ranges: [number, number][] = [];
    let gained = 0;
    let lost = 0;
    let touched = 0;
    if (old && old.key === sc.key && old.lifetimeNow === null && sc.lifetimeNow === null && t.sorted && t.time) {
      // Same filters, another window over sorted rows: only the rows it left and those it entered change.
      const drops: [number, number][] = [
        [this.lo, Math.min(this.hi, nlo)],
        [Math.max(this.lo, nhi), this.hi],
      ];
      for (const [a, b] of drops) {
        if (b <= a) continue;
        prev.set(mask.subarray(a, b), a);
        for (let i = a; i < b; i++) lost += mask[i];
        mask.fill(0, a, b);
        ranges.push([a, b]);
        touched += b - a;
        yield;
      }
      // Rows entering lay outside the old window: their mask is 0 and is written in place.
      const enters: [number, number][] = nhi <= this.lo || nlo >= this.hi ? [[nlo, nhi]] : [[nlo, Math.min(nhi, this.lo)], [Math.max(nlo, this.hi), nhi]];
      for (const [ea, eb] of enters) {
        if (eb <= ea) continue;
        prev.fill(0, ea, eb);
        for (let a = ea; a < eb; a += STEP_ROWS) {
          const b = Math.min(eb, a + STEP_ROWS);
          shownMask(t, sc, a, b, mask, false);
          for (let i = a; i < b; i++) gained += mask[i];
          touched += b - a;
          yield;
        }
        ranges.push([ea, eb]);
      }
    } else {
      // Anything else: the mask again over every row either scope can show, a block at a time.
      const ulo = old ? Math.min(this.lo, nlo) : nlo;
      const uhi = old ? Math.max(this.hi, nhi) : nhi;
      for (let a = ulo; a < uhi; a += BLOCK) {
        if ((a - ulo) % STEP_ROWS === 0 && a > ulo) yield;
        const b = Math.min(uhi, a + BLOCK);
        const ia = Math.max(a, nlo);
        const ib = Math.min(b, nhi);
        prev.set(mask.subarray(a, b), a);
        if (ib > ia) shownMask(t, sc, ia, ib, block, true, a);
        for (let i = a; i < b; i++) {
          const v = i >= ia && i < ib ? block[i - a] : 0;
          const was = mask[i];
          gained += v & (was ^ 1);
          lost += was & (v ^ 1);
          mask[i] = v;
        }
      }
      if (uhi > ulo) ranges.push([ulo, uhi]);
      touched = uhi - ulo;
    }
    this.touched = touched;
    this.lo = nlo;
    this.hi = nhi;
    this.shown += gained - lost;
    this.scope = sc;
    this.id = id;
    this.version++;
    this.changed = old ? ranges : null;
    this.changes = gained + lost;
    return true;
  }

  /** Whether a sign at `version` can be brought here by the last change (or is here). */
  canCatchUp(version: number): boolean {
    return version === this.version || (version === this.version - 1 && this.changed !== null);
  }

  /**
   * Fold the rows shown now - those in any of the volumes `bits` names, or
   * every one for 0 - a block at a time.
   */
  *foldShown(bits: number, parts: FoldPart[], member: Uint32Array | null): Generator<void, number> {
    const mask = this.mask;
    const mem = bits ? this.table.member : null;
    const t = this.table.t;
    let rows = 0;
    for (let a = this.lo; a < this.hi; a += BLOCK) {
      const b = Math.min(this.hi, a + BLOCK);
      let k = 0;
      if (mem)
        for (let i = a; i < b; i++) {
          rowsA[k] = i;
          k += mask[i] & ((mem[i] & bits) !== 0 ? 1 : 0);
        }
      else
        for (let i = a; i < b; i++) {
          rowsA[k] = i;
          k += mask[i];
        }
      foldShared(t, member, null, rowsA, 0, k, 1, parts);
      rows += k;
      if ((a - this.lo + BLOCK) % STEP_ROWS === 0) yield;
    }
    return rows;
  }

  /** Fold the last change: the rows no longer shown out, the rows newly shown in, a block at a time. */
  *foldChange(parts: FoldPart[], member: Uint32Array | null): Generator<void, number> {
    const mask = this.mask;
    const prev = this.prev;
    const t = this.table.t;
    let rows = 0;
    let since = 0;
    for (const [ra, rb] of this.changed ?? []) {
      for (let a = ra; a < rb; a += BLOCK) {
        const b = Math.min(rb, a + BLOCK);
        let nl = 0;
        let ng = 0;
        for (let i = a; i < b; i++) {
          const was = prev[i];
          const now = mask[i];
          rowsA[nl] = i;
          nl += was & (now ^ 1);
          rowsB[ng] = i;
          ng += now & (was ^ 1);
        }
        if (nl) foldShared(t, member, null, rowsA, 0, nl, -1, parts);
        if (ng) foldShared(t, member, null, rowsB, 0, ng, 1, parts);
        rows += nl + ng;
        since += b - a;
        if (since >= STEP_ROWS) {
          since = 0;
          yield;
        }
      }
    }
    return rows;
  }
}

/** What a sign reads from a slot: the rows with (or without) a volume's bit, as one side of its chart. */
export interface Feed {
  slot: Slot;
  /** The series these rows are (inside 0, outside 1), or -1 to read it per row. */
  side: number;
  /** The volume's bit; 0 for every row of the table. */
  bit: number;
  outside: boolean;
}

/** The feeds of a sign on a volume: its rows, and for "inside vs outside" the rows outside it too. */
export function feedsOf(spec: ChartSpec, bit: number, inside: Slot, rest: Slot | null): Feed[] {
  if (spec.diff !== 'inout') return [{ slot: inside, side: -1, bit, outside: false }];
  const f: Feed[] = [
    { slot: inside, side: 0, bit, outside: false },
    { slot: inside, side: 1, bit, outside: true },
  ];
  if (rest) f.push({ slot: rest, side: 1, bit: 0, outside: false });
  return f;
}

type How = 'same' | 'delta' | 'full' | 'cached';

/** Sets of rows a sign remembers its aggregation for, and the most one may take. */
const CACHE_SETS = 4;
const CACHE_BYTES = 1 << 20;

/** The rows feeds read, by their slots' scopes. */
const cacheKey = (feeds: Feed[]) => feeds.map((f) => f.slot.id).join('\u0001');

/** An aggregation's accumulators copied (its dimensions, which never change, shared). */
function cloneAgg(a: Agg): Agg {
  const c = (x: Float64Array | null) => (x ? x.slice() : null);
  return { ...a, count: a.count.slice(), total: a.total.slice(), sum: c(a.sum), n: c(a.n), hist: c(a.hist), played: c(a.played), won: c(a.won), kills: c(a.kills), deaths: c(a.deaths), personRows: a.personRows ? a.personRows.map((p) => p.slice()) : null, players: c(a.players) };
}

function aggBytes(a: Agg): number {
  let n = 0;
  for (const x of [a.count, a.total, a.sum, a.n, a.hist, a.played, a.won, a.kills, a.deaths, a.players, ...(a.personRows ?? [])]) if (x) n += x.byteLength;
  return n;
}

/** A feed as its chart's part of a shared fold. */
const partOf = (agg: Agg, f: Feed): FoldPart => ({ agg, bit: f.bit, want: f.outside ? 0 : f.bit, side: f.side });

/** One sign's aggregation, kept in step with the slots it reads. */
export class SignAgg {
  agg: Agg | null = null;
  private feeds: Feed[] = [];
  private at: number[] = [];
  /** How the last update went, for the probes: 'same', 'delta' or 'full', and the rows folded. */
  last: { how: How; rows: number } = { how: 'same', rows: 0 };
  /** The aggregation as it was for the last few sets of rows (by the slots' scopes): a filter taken off again is no work. */
  private cache = new Map<string, Agg>();

  constructor(
    readonly meta: AggMeta,
    readonly spec: ChartSpec,
  ) {}

  /** What bringing it to these feeds takes: nothing, folding the changes since, or starting over. */
  plan(feeds: Feed[]): Exclude<How, 'cached'> {
    const same = this.agg && feeds.length === this.feeds.length && feeds.every((f, k) => f.slot === this.feeds[k].slot && f.bit === this.feeds[k].bit && f.outside === this.feeds[k].outside && f.side === this.feeds[k].side);
    if (!same) return 'full';
    if (feeds.every((f, k) => f.slot.version === this.at[k])) return 'same';
    // By the change when it is known and smaller than the rows now shown; else over again.
    return feeds.every((f, k) => f.slot.canCatchUp(this.at[k]) && (f.slot.version === this.at[k] || f.slot.changes <= f.slot.shown)) ? 'delta' : 'full';
  }

  /** The slot versions it has folded, per feed. */
  versions(): readonly number[] {
    return this.at;
  }

  /** Mark it brought to these feeds' current rows. */
  settle(feeds: Feed[], how: How, rows: number): void {
    this.feeds = feeds;
    this.at = feeds.map((f) => f.slot.version);
    this.last = { how, rows };
    if (how !== 'same' && this.agg) this.remember(feeds);
  }

  /** Take the aggregation for these feeds' rows from the cache, when it was counted before. */
  recall(feeds: Feed[]): boolean {
    const k = cacheKey(feeds);
    const c = this.cache.get(k);
    if (!c) return false;
    this.agg = cloneAgg(c);
    // The most recently used last.
    this.cache.delete(k);
    this.cache.set(k, c);
    return true;
  }

  private remember(feeds: Feed[]): void {
    const a = this.agg!;
    if (aggBytes(a) > CACHE_BYTES) return;
    const k = cacheKey(feeds);
    this.cache.delete(k);
    this.cache.set(k, cloneAgg(a));
    while (this.cache.size > CACHE_SETS) this.cache.delete(this.cache.keys().next().value!);
  }

  /** Bring the aggregation to the slots' current rows on its own; true when it changed. */
  update(feeds: Feed[]): boolean {
    return updateSigns([{ sign: this, feeds }]) > 0;
  }
}

/**
 * Bring signs of one spec (on any volumes, reading slots alike) to their
 * slots' current rows together: one fold over the rows any of them takes,
 * the rows read once per row and accumulated per sign - those that can by the
 * changes since they last folded, the others from the rows shown now.
 * Returns how many of them changed.
 */
export function updateSigns(list: readonly { sign: SignAgg; feeds: Feed[] }[]): number {
  return run(updateSteps(list));
}

/** `updateSigns` in steps: it yields every few hundred thousand rows folded. */
export function* updateSteps(list: readonly { sign: SignAgg; feeds: Feed[] }[]): Generator<void, number> {
  const full: { sign: SignAgg; feeds: Feed[] }[] = [];
  const delta = new Map<string, { sign: SignAgg; feeds: Feed[] }[]>();
  for (const x of list) {
    const how = x.sign.plan(x.feeds);
    if (how === 'same') x.sign.settle(x.feeds, 'same', 0);
    // Counted for these very rows a moment ago (a filter taken off again): taken as it was.
    else if (x.sign.recall(x.feeds)) x.sign.settle(x.feeds, 'cached', 0);
    else if (how === 'full') full.push(x);
    else {
      const k = x.sign.versions().join(',');
      const g = delta.get(k);
      if (g) g.push(x);
      else delta.set(k, [x]);
    }
  }
  if (full.length) {
    for (const x of full) x.sign.agg = createAgg(x.sign.meta, x.sign.spec);
    let rows = 0;
    for (let f = 0; f < full[0].feeds.length; f++) {
      const slot = full[0].feeds[f].slot;
      const parts = full.map((x) => partOf(x.sign.agg!, x.feeds[f]));
      // Every part taking its volume's rows: the rows in any of them; else every row shown.
      let any = 0;
      for (const p of parts) any = p.bit !== 0 && p.want === p.bit ? any | p.bit : -1;
      rows += yield* slot.foldShown(any > 0 ? any : 0, parts, any !== 0 ? slot.table.member : null);
    }
    for (const x of full) x.sign.settle(x.feeds, 'full', rows);
  }
  for (const group of delta.values()) {
    const at = group[0].sign.versions();
    let rows = 0;
    for (let f = 0; f < group[0].feeds.length; f++) {
      const slot = group[0].feeds[f].slot;
      const parts = group.map((x) => partOf(x.sign.agg!, x.feeds[f]));
      const member = parts.some((p) => p.bit !== 0) ? slot.table.member : null;
      if (at[f] !== slot.version) rows += yield* slot.foldChange(parts, member);
    }
    for (const x of group) x.sign.settle(x.feeds, 'delta', rows);
  }
  return list.length - list.filter((x) => x.sign.last.how === 'same').length;
}
