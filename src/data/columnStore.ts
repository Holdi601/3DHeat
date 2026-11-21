import { create } from 'zustand';
import type { AttributeColumn, Dataset, FilterSpec, SplitRule } from '../state/types';
import { chooseEvictions, rowMapBytes, sourceBuffers } from './columnSource';
import type { ColumnWorkerRequest, ColumnWorkerResponse } from './columnWorker';
import { say, type Msg } from './msg';
import { residentBytes, stringBytes } from './resident';

/**
 * The page's side of the columns on demand (`columnSource.ts`): which columns
 * the loaded dataset could read again, which of them are in memory, and the
 * least recently used of them given back when room is needed.
 *
 * A column arrives into `dataset.attrs` of the dataset on screen - the same
 * object, so the renderers keep what they uploaded - and leaves it the same
 * way. Every consumer already treats a column that is not in `attrs` as not
 * there, so a column not yet read, or evicted, is simply absent until it
 * comes back; what keeps that from changing the picture is that a column the
 * view uses (a filter, the split, the value weight, the route events) is
 * pinned: read as soon as the view asks for it and never evicted while it
 * does.
 *
 * The renderers' copies on the GPU are not touched by an eviction. They are
 * keyed by column name and stay until the GPU budget wants the room, so a
 * column read again finds its upload still there.
 */

export type ColumnState = 'deferred' | 'loading' | 'resident' | 'evicted' | 'error';

export interface ColumnEntry {
  name: string;
  kind: 'number' | 'category';
  state: ColumnState;
  /** In memory now, or what it will take (four bytes a row) while it is not. */
  bytes: number;
  /** `performance.now()` of the last use: a pin, a read, a panel asking. */
  lastUsed: number;
  /** Left to be read on demand at load, rather than loaded and evictable. */
  onDemand: boolean;
  /** While loading. */
  fraction: number;
  /** Why the last read failed. */
  error: string | null;
  /** Times it was evicted. */
  evictions: number;
}

interface ColumnStoreState {
  /** The source the entries belong to, or null. */
  source: string | null;
  entries: Record<string, ColumnEntry>;
  /** Bytes of the row map, held in the column worker. */
  mapBytes: number;
  /** Columns evicted since the load. */
  evicted: number;
  /** Bumped on every arrival and eviction, for panels listing `attrs`. */
  version: number;
}

export const useColumnStore = create<ColumnStoreState>(() => ({ source: null, entries: {}, mapBytes: 0, evicted: 0, version: 0 }));

/** A dataset's rows, cheaply: enough to tell a reordered or different dataset from a copy of the same one. */
export function rowFingerprint(ds: Pick<Dataset, 'count' | 'px' | 'pz' | 'time'>): string {
  const n = ds.count;
  const parts: number[] = [n];
  const K = 64;
  for (let k = 0; k < K && n > 0; k++) {
    const i = Math.floor((k * (n - 1)) / (K - 1));
    parts.push(ds.px[i], ds.pz[i], ds.time ? ds.time[i] : 0);
  }
  return parts.join(',');
}

let worker: Worker | null = null;
let nextId = 1;
let nextSource = 1;
/** The rows the current source was built for (`rowFingerprint`). */
let fingerprint = '';
const pending = new Map<number, { name: string; source: string; resolve: () => void }>();

function post(req: ColumnWorkerRequest, transfer: Transferable[] = []): void {
  if (!worker) {
    worker = new Worker(new URL('./columnWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (ev: MessageEvent<ColumnWorkerResponse>) => receive(ev.data);
  }
  worker.postMessage(req, transfer);
}

/** Bytes a column holds: its array and its labels. */
export function columnBytes(a: Pick<AttributeColumn, 'data' | 'categories'>): number {
  let b = a.data.byteLength;
  for (const s of a.categories ?? []) b += 8 + stringBytes(s);
  return b;
}

/**
 * Take the row map a load left on its dataset (`Dataset.columnSource`) into the
 * column worker, and start the entries for it. The dataset keeps no part of it.
 */
export function adoptColumnSource(ds: Dataset): void {
  const src = ds.columnSource;
  delete ds.columnSource;
  const prev = useColumnStore.getState().source;
  if (prev) post({ kind: 'drop', source: prev });
  if (!src) {
    reset();
    return;
  }
  const source = `cs-${nextSource++}`;
  post({ kind: 'register', source, src }, sourceBuffers(src));
  fingerprint = rowFingerprint(ds);
  const now = performance.now();
  const entries: Record<string, ColumnEntry> = {};
  const base = { lastUsed: now, fraction: 0, error: null, evictions: 0 };
  for (const c of src.deferred) entries[c.name] = { ...base, name: c.name, kind: c.kind, state: 'deferred', bytes: src.rows * 4, onDemand: true };
  for (const c of src.refetchable) {
    const a = ds.attrs.find((x) => x.name === c.name);
    if (a) entries[c.name] = { ...base, name: c.name, kind: c.kind, state: 'resident', bytes: columnBytes(a), onDemand: false };
  }
  useColumnStore.setState((s) => ({ source, entries, mapBytes: rowMapBytes(src), evicted: 0, version: s.version + 1 }));
}

function reset(): void {
  const prev = useColumnStore.getState().source;
  if (prev) post({ kind: 'drop', source: prev });
  fingerprint = '';
  for (const [id, p] of pending) {
    pending.delete(id);
    p.resolve();
  }
  inflight.clear();
  useColumnStore.setState((s) => ({ source: null, entries: {}, mapBytes: 0, evicted: 0, version: s.version + 1 }));
}

function patch(name: string, p: Partial<ColumnEntry>, bump = false): void {
  useColumnStore.setState((s) => {
    const e = s.entries[name];
    if (!e) return {};
    return { entries: { ...s.entries, [name]: { ...e, ...p } }, ...(bump ? { version: s.version + 1 } : {}) };
  });
}

/** The columns a view's settings read: they are read first and never evicted. */
export function pinnedColumns(s: {
  filters: readonly FilterSpec[];
  split: SplitRule;
  heat: { weightBy: string | null };
  lines: { column: string | null };
}): Set<string> {
  const out = new Set<string>();
  for (const f of s.filters) if (f.kind === 'range' || f.kind === 'categories') out.add(f.column);
  if (s.split.kind !== 'teams') out.add(s.split.column);
  if (s.heat.weightBy) out.add(s.heat.weightBy);
  if (s.lines.column) out.add(s.lines.column);
  return out;
}

/** The parts of the store the columns answer to. */
export interface ColumnHost {
  getState: () => {
    dataset: Dataset | null;
    filters: FilterSpec[];
    split: SplitRule;
    heat: { weightBy: string | null };
    lines: { column: string | null };
    budgets: { ram: number };
    setFilters: (f: FilterSpec[]) => void;
  };
}

let host: ColumnHost | null = null;

/**
 * Read these columns where they are not in memory; mark them used. Resolves
 * when each has arrived or failed.
 */
export function ensureColumns(names: Iterable<string>): Promise<void> {
  const st = useColumnStore.getState();
  const now = performance.now();
  const waits: Promise<void>[] = [];
  for (const name of names) {
    const e = st.entries[name];
    if (!e) continue;
    if (e.state === 'resident') {
      if (now - e.lastUsed > 1000) patch(name, { lastUsed: now });
      continue;
    }
    const busy = inflight.get(name);
    if (busy) {
      waits.push(busy);
      continue;
    }
    // A failed read is tried again only when asked by hand (`retry`), not by
    // every change of the view that still pins it.
    if (e.state === 'error') continue;
    waits.push(read(e));
  }
  return Promise.all(waits).then(() => undefined);
}

/** Read a column whose last read failed, or any not in memory: the panels' button. */
export function retryColumn(name: string): Promise<void> {
  const e = useColumnStore.getState().entries[name];
  if (!e || e.state === 'resident') return Promise.resolve();
  return inflight.get(name) ?? read(e);
}

const inflight = new Map<string, Promise<void>>();

function read(e: ColumnEntry): Promise<void> {
  const source = useColumnStore.getState().source;
  const ds = host?.getState().dataset;
  if (!source || !ds || !host) return Promise.resolve();
  makeRoom(e.bytes, new Set([...pinnedColumns(host.getState()), e.name]));
  patch(e.name, { state: 'loading', fraction: 0, error: null, lastUsed: performance.now() }, true);
  const id = nextId++;
  const done = new Promise<void>((resolve) => {
    pending.set(id, { name: e.name, source, resolve });
    post({ kind: 'read', id, source, name: e.name, column: e.kind });
  }).finally(() => inflight.delete(e.name));
  inflight.set(e.name, done);
  return done;
}

/**
 * Evict the least recently used columns that are not pinned until `need` more
 * bytes fit in the RAM budget.
 */
function makeRoom(need: number, pinned: ReadonlySet<string>): void {
  const st = host?.getState();
  const ds = st?.dataset;
  if (!st || !ds) return;
  const resident = Object.values(useColumnStore.getState().entries).filter((x) => x.state === 'resident');
  for (const name of chooseEvictions(resident, pinned, residentBytes(ds), need, st.budgets.ram)) evictColumn(name);
}

/** Give a column's memory back; it is read again from the files when next needed. */
export function evictColumn(name: string): boolean {
  const st = host?.getState();
  const ds = st?.dataset;
  const e = useColumnStore.getState().entries[name];
  // Never one the view is using: the picture would change under it.
  if (!st || !ds || !e || e.state !== 'resident' || pinnedColumns(st).has(name)) return false;
  const i = ds.attrs.findIndex((a) => a.name === name);
  if (i >= 0) ds.attrs.splice(i, 1);
  useColumnStore.setState((s) => ({
    entries: { ...s.entries, [name]: { ...e, state: 'evicted', evictions: e.evictions + 1 } },
    evicted: s.evicted + 1,
    version: s.version + 1,
  }));
  return true;
}

function receive(res: ColumnWorkerResponse): void {
  const p = pending.get(res.id);
  if (!p) return;
  if (res.kind === 'progress') {
    patch(p.name, { fraction: res.fraction });
    return;
  }
  pending.delete(res.id);
  const st = host?.getState();
  const ds = st?.dataset;
  const current = useColumnStore.getState().source === p.source && !!ds && rowFingerprint(ds) === fingerprint;
  if (!current || !st || !ds) {
    p.resolve();
    return;
  }
  if (res.kind === 'error') {
    patch(p.name, { state: 'error', error: say(res.message as Msg | string) }, true);
    p.resolve();
    return;
  }
  const col = res.column;
  if (!ds.attrs.some((a) => a.name === col.name)) ds.attrs.push(col);
  patch(p.name, { state: 'resident', bytes: columnBytes(col), fraction: 1, lastUsed: performance.now() }, true);
  // A filter on the column applies from now: the same specs in a new list,
  // which every consumer of the filters takes as a change.
  st.setFilters([...st.filters]);
  p.resolve();
}

/**
 * Follow the view: read what it pins, keep the entries to the dataset they
 * were built for. Once, at startup.
 */
export function installColumnDemand(store: ColumnHost & { subscribe: (fn: () => void) => () => void }): () => void {
  host = store;
  let seen: unknown[] = [];
  return store.subscribe(() => {
    const s = store.getState();
    const now = [s.dataset, s.filters, s.split, s.heat.weightBy, s.lines.column];
    if (now.every((v, i) => v === seen[i])) return;
    const datasetChanged = now[0] !== seen[0];
    seen = now;
    if (datasetChanged) {
      // A load's row map is taken when its dataset is shown, not when it
      // arrives: a load made for something else (a comparison, a mass run)
      // must not take the place of the one on screen.
      if (s.dataset?.columnSource) adoptColumnSource(s.dataset);
      else if (useColumnStore.getState().source) {
        // A copy of the same rows (the sides lined up, an outcome added) keeps
        // its columns; different rows, or the same in another order, do not.
        if (!s.dataset || rowFingerprint(s.dataset) !== fingerprint) {
          reset();
          return;
        }
        useColumnStore.setState((c) => ({ version: c.version + 1 }));
      }
    }
    if (useColumnStore.getState().source) void ensureColumns(pinnedColumns(s));
  });
}
