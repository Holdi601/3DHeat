/// <reference lib="webworker" />
/**
 * The mass analysis off the page's thread: takes the picked files, finds
 * each match's summary - the folder's index (`3dheat-index.jsonl.gz`) when
 * it is there and current, else the browser's cache, else the container's
 * `summary` member, else worked out by a pool of `summarizeWorker`s and
 * cached - keeps the heads as `MassStore` columns, and answers the panel's
 * questions from them. Grids are never held for all matches: a map's are
 * streamed into one `GridMerge` when the map is asked for.
 */

import { isContainer, openContainer } from '../data/container';
import { isOcapName } from '../data/ocap';
import { massInsights, insightMatches, type MassInsight, type MassReport } from './detect';
import { GridMerge, mergeCell, type Channel } from './grids';
import { discoverNiches, livesTable, nicheChildren, PlaceTables, roundsTable, type NicheCond, type NicheTable, type NicheTarget } from './niche';
import { discoverPlaces, planOf, scanFrame, type PlaceJob, type PlaceMatch } from './scan';
import {
  MassStore, balance, drillMatches, overview, phases, populations, sides, storeBytes, trends,
  type BalanceBy, type BalanceSplit, type Bucket, type MassDrill, type MassFilter,
} from './store';
import type { SummarizeRequest, SummarizeResponse } from './summarizeWorker';
import { GRID_KINDS, SUMMARY_FORMAT, SUMMARY_VERSION, type MatchSummary, type SummaryGrid, type SummaryHead } from './types';
import { maneuverRows } from './maneuvers';
import { cqbRows } from './cqb';
import { surfaceRows } from './marks';
import { analyseOutcome, type OutcomeOptions, type OutcomeReport } from '../outcome/analyze';
import type { OutcomeGroup, OutcomeMatch } from '../outcome/features';
import { compactMoves, MOVES_VERSION } from '../outcome/types';
import { outcomeMap } from '../outcome/view';

export type MassQuery =
  | { kind: 'overview' }
  | { kind: 'balance'; by: BalanceBy; split: BalanceSplit; minUnits: number; classes?: string[]; players?: boolean }
  | { kind: 'trends'; by: 'vehicle' | 'class'; bucket: Bucket }
  | { kind: 'populations' }
  | { kind: 'sides' }
  | { kind: 'maneuvers' }
  | { kind: 'cqb' }
  | { kind: 'surfaces' }
  | { kind: 'phases' };

export type MassRequest =
  | { type: 'files'; files: { file: File; path: string }[] }
  | { type: 'open'; files: { file: File; path: string }[]; add: boolean }
  | { type: 'query'; id: number; filter: MassFilter; q: MassQuery }
  | { type: 'grid'; id: number; filter: MassFilter; map: string; channel: Channel; level: number; team: string | null }
  | { type: 'insights'; id: number; filter: MassFilter; maps: number; stageB?: boolean }
  | { type: 'niche'; id: number; filter: MassFilter; table: string; target: NicheTarget; base: NicheCond[] }
  | { type: 'drill'; id: number; filter: MassFilter; drill?: MassDrill; insight?: MassInsight }
  /** The outcome analysis (`outcome/`) of the filter's matches; `compute` works out the moves of matches whose summaries lack them. */
  | { type: 'outcome'; id: number; filter: MassFilter; options?: Partial<OutcomeOptions>; compute?: boolean; minMatches?: number }
  | { type: 'outcomeCancel' }
  /** A side's zones and routes coloured by win rate, for a window or a moment (slice) of the last outcome run. */
  | { type: 'outcomeMap'; id: number; group: string; side: number; window?: number; slice?: number };

/** What the outcome analysis hands back besides its report: what it could not read. */
export interface OutcomeResult {
  report: OutcomeReport;
  /** Matches in the filter, those read, those without moves in their summaries (worked out with `compute`), in groups too small. */
  matches: number;
  read: number;
  missing: number;
  computed: number;
  small: number;
  /** Per group: its slices for the time slider, and the slice length. */
  slices: Record<string, { slices: number; slice: number }>;
}

export interface MassFacets {
  matches: number;
  games: string[];
  maps: { map: string; game: string; matches: number }[];
  modes: string[];
  from: number | null;
  to: number | null;
}

export interface MassLoadStats {
  files: number;
  fromIndex: number;
  fromCache: number;
  fromMember: number;
  computed: number;
  failed: number;
  ms: number;
  /** Mean ms a computed summary took in its worker. */
  computeMs: number;
  storeBytes: number;
}

export type MassResponse =
  | { type: 'progress'; done: number; total: number; phase: 'index' | 'summaries' | 'grids' | 'outcome' | 'moves' }
  | { type: 'ready'; facets: MassFacets; stats: MassLoadStats }
  | { type: 'result'; id: number; data: unknown; ms: number }
  | { type: 'error'; id?: number; message: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const post = (m: MassResponse) => ctx.postMessage(m);

type GridRef = { kind: 'index'; gz: File; path: string } | { kind: 'idb'; key: string } | { kind: 'member' } | { kind: 'memory' } | { kind: 'none' };

let store = new MassStore();
/** Per match: its file, grid source and robust extent. */
let files: (File | null)[] = [];
let grids: GridRef[] = [];
let extents: ([number, number, number, number] | null)[] = [];
const memoryGrids = new Map<number, SummaryGrid>();
let lastMerge: { key: string; merge: GridMerge } | null = null;

// ---------------------------------------------------------------------------
// The browser's cache: heads and grids by file name, size and time.

let dbp: Promise<IDBDatabase | null> | null = null;
function db(): Promise<IDBDatabase | null> {
  dbp ??= new Promise((resolve) => {
    try {
      const r = indexedDB.open('3dheat-mass', 1);
      r.onupgradeneeded = () => {
        r.result.createObjectStore('heads');
        r.result.createObjectStore('grids');
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbp;
}

async function idbGet<T>(name: 'heads' | 'grids', key: string): Promise<T | undefined> {
  const d = await db();
  if (!d) return undefined;
  return new Promise((resolve) => {
    try {
      const r = d.transaction(name).objectStore(name).get(key);
      r.onsuccess = () => resolve(r.result as T | undefined);
      r.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

async function idbPut(name: 'heads' | 'grids', key: string, v: unknown): Promise<boolean> {
  const d = await db();
  if (!d) return false;
  return new Promise((resolve) => {
    try {
      const tx = d.transaction(name, 'readwrite');
      tx.objectStore(name).put(v, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

const cacheKey = (path: string, f: File) => `${path}|${f.size}|${f.lastModified}`;

// ---------------------------------------------------------------------------
// Reading

async function* lines(file: Blob): AsyncGenerator<string> {
  const reader = file.stream().pipeThrough(new DecompressionStream('gzip')).pipeThrough(new TextDecoderStream()).getReader();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line) yield line;
    }
  }
  if (buf.trim()) yield buf;
}

const INDEX = /(^|\/)3dheat-index\.jsonl\.gz$/i;
const GRIDS = /(^|\/)3dheat-index\.grids\.jsonl\.gz$/i;
/** A loose table, not a sidecar (`<match>.<role>.parquet`). */
const TABLE = /^(?!.*\.(messages|flight|packets|events|entities|props|units|combatlog|strings|raw|effects|objectives|chat)\.parquet$).*\.parquet$/i;
/** An OCAP recording (`ocap.ts`), not the small JSON files beside a table or a level. */
const RECORDING = (name: string) => isOcapName(name) && !/\.(match|course|level|meta|summary|session|hints|layouts|model-pack)\.json$/i.test(name) && !/^(catalog|ranges|figures[^/]*)\.json$/i.test(name);

const valid = (s: { format?: string; version?: number } | null | undefined) => !!s && s.format === SUMMARY_FORMAT && s.version === SUMMARY_VERSION;

class Pool {
  private readonly idle: Worker[] = [];
  private readonly all: Worker[] = [];
  private readonly waiting: (() => void)[] = [];
  private next = 1;
  private readonly pending = new Map<number, (r: SummarizeResponse) => void>();
  constructor(n: number) {
    for (let i = 0; i < n; i++) {
      const w = new Worker(new URL('./summarizeWorker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (ev: MessageEvent<SummarizeResponse>) => {
        const p = this.pending.get(ev.data.id);
        this.pending.delete(ev.data.id);
        this.idle.push(w);
        this.waiting.shift()?.();
        p?.(ev.data);
      };
      this.all.push(w);
      this.idle.push(w);
    }
  }
  async run(req: Omit<SummarizeRequest, 'id'>): Promise<SummarizeResponse> {
    while (!this.idle.length) await new Promise<void>((r) => this.waiting.push(r));
    const w = this.idle.pop()!;
    const id = this.next++;
    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      w.postMessage({ ...req, id });
    });
  }
  close(): void {
    for (const w of this.all) w.terminate();
  }
}

function addMatch(path: string, file: File | null, head: SummaryHead, grid: GridRef): void {
  store.add(path, head);
  files.push(file);
  grids.push(grid);
  extents.push(head.extent ?? null);
}

async function open(list: { file: File; path: string }[], add: boolean): Promise<void> {
  const t0 = performance.now();
  if (!add) {
    store = new MassStore();
    files = [];
    grids = [];
    extents = [];
    memoryGrids.clear();
  }
  lastMerge = null;
  const stats: MassLoadStats = { files: 0, fromIndex: 0, fromCache: 0, fromMember: 0, computed: 0, failed: 0, ms: 0, computeMs: 0, storeBytes: 0 };
  const dir = (p: string) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/') + 1) : '');
  const known = new Set(store.paths);
  const matchFiles = new Map<string, File>();
  for (const { file, path } of list) if ((isContainer(file.name) || TABLE.test(file.name) || RECORDING(file.name)) && !known.has(path)) matchFiles.set(path, file);
  stats.files = matchFiles.size;
  const gzOf = new Map<string, File>();
  for (const { file, path } of list) if (GRIDS.test(path)) gzOf.set(dir(path), file);
  // 1. The folders' indexes: a line a match, taken when its file is here with the same size. Index files
  // picked without any match (an index copied from where the matches are): every line, nothing to load.
  const indexes = list.filter((f) => INDEX.test(f.path));
  const indexOnly = matchFiles.size === 0 && indexes.length > 0;
  let done = 0;
  for (const ix of indexes) {
    const base = dir(ix.path);
    for await (const line of lines(ix.file)) {
      let e: { path: string; size: number; head: SummaryHead };
      try {
        e = JSON.parse(line);
      } catch {
        continue;
      }
      const path = base + e.path;
      const f = matchFiles.get(path);
      if (indexOnly) {
        if (!valid(e.head) || known.has(path)) continue;
        const gz = gzOf.get(base);
        addMatch(path, null, e.head, gz ? { kind: 'index', gz, path: e.path } : { kind: 'none' });
        stats.fromIndex++;
        if (++done % 500 === 0) post({ type: 'progress', done, total: done, phase: 'index' });
        continue;
      }
      if (!f || f.size !== e.size || !valid(e.head)) continue;
      matchFiles.delete(path);
      const gz = gzOf.get(base);
      addMatch(path, f, e.head, gz ? { kind: 'index', gz, path: e.path } : { kind: 'member' });
      stats.fromIndex++;
      if (++done % 500 === 0) post({ type: 'progress', done, total: stats.files, phase: 'index' });
    }
  }
  // 2. The rest: the cache, the container's member, or worked out.
  const rest = [...matchFiles];
  // An OCAP recording is summarised from its whole table in memory (a long mission's is over a gigabyte): two at a
  // time, as the page's threads share one process's memory.
  const ocap = rest.some(([, f]) => RECORDING(f.name));
  const threads = Math.max(1, Math.min(ocap ? 2 : 6, (navigator.hardwareConcurrency || 4) - 2));
  let pool: Pool | null = null;
  let next = 0;
  let computeMs = 0;
  const work = async () => {
    for (;;) {
      const i = next++;
      if (i >= rest.length) return;
      const [path, file] = rest[i];
      const key = cacheKey(path, file);
      try {
        const cached = await idbGet<SummaryHead>('heads', key);
        if (valid(cached)) {
          addMatch(path, file, cached!, { kind: 'idb', key });
          stats.fromCache++;
        } else {
          let s: MatchSummary | null = null;
          if (isContainer(file.name)) {
            const c = await openContainer(file);
            if (c.manifest.roles?.summary) {
              const m = (await c.json('summary')) as MatchSummary | null;
              if (valid(m)) s = m;
            }
          }
          if (s) {
            const { grid, ...head } = s;
            addMatch(path, file, head, { kind: 'member' });
            stats.fromMember++;
            void idbPut('heads', key, head).then((ok) => ok && grid && idbPut('grids', key, grid));
          } else {
            pool ??= new Pool(threads);
            const r = await pool.run({ file, path });
            if (!r.ok || !r.summary) throw new Error(r.ok ? 'no position, time or unit column' : r.error);
            computeMs += r.ms;
            const { grid, ...head } = r.summary;
            const cachedOk = await idbPut('heads', key, head);
            if (cachedOk && grid) await idbPut('grids', key, grid);
            const idx = store.matches;
            addMatch(path, file, head, cachedOk ? { kind: 'idb', key } : grid ? { kind: 'memory' } : { kind: 'none' });
            if (!cachedOk && grid) memoryGrids.set(idx, grid);
            stats.computed++;
          }
        }
      } catch {
        stats.failed++;
      }
      if (++done % 25 === 0 || done === stats.files) post({ type: 'progress', done, total: stats.files, phase: 'summaries' });
    }
  };
  await Promise.all(Array.from({ length: Math.min(16, Math.max(1, rest.length)) }, work));
  (pool as Pool | null)?.close();
  stats.ms = Math.round(performance.now() - t0);
  stats.computeMs = stats.computed ? Math.round(computeMs / stats.computed) : 0;
  stats.storeBytes = storeBytes(store);
  post({ type: 'ready', facets: facets(), stats });
}

function facets(): MassFacets {
  const all = new Uint8Array(store.matches).fill(1);
  const o = overview(store, all);
  return {
    matches: store.matches,
    games: o.byGame.map((g) => g.key),
    maps: o.byMap.map((m) => ({ map: m.key, game: m.game, matches: m.matches })),
    modes: o.byMode.map((m) => m.key).filter(Boolean),
    from: o.first,
    to: o.last,
  };
}

// ---------------------------------------------------------------------------
// Grids

async function gridOf(i: number): Promise<SummaryGrid | null> {
  const g = grids[i];
  if (g.kind === 'idb') return (await idbGet<SummaryGrid>('grids', g.key)) ?? null;
  if (g.kind === 'memory') return memoryGrids.get(i) ?? null;
  if (g.kind === 'member' && files[i] && isContainer(files[i]!.name)) {
    const c = await openContainer(files[i]!);
    const s = (await c.json('summary')) as MatchSummary | null;
    return s?.grid ?? null;
  }
  return null;
}

function teamsOf(i: number): string[] {
  const t0 = store.m.team0.get(i);
  const n = store.m.teams.get(i);
  return Array.from({ length: n }, (_, k) => store.str(store.t.name.a[t0 + k]));
}

/** The matches' grids summed (indexes streamed once each, the rest read one by one). */
async function mergeOf(list: number[], team: string | null, progress: boolean): Promise<GridMerge> {
  const merge = new GridMerge(mergeCell(list.map((i) => extents[i])));
  await streamGrids(list, (i, g) => merge.add(g, teamsOf(i), extents[i], team), progress);
  return merge;
}

/** Each match's grid handed to `visit`, a match at a time: indexes streamed once each, the rest read one by one. */
async function streamGrids(list: number[], visit: (i: number, g: SummaryGrid) => void, progress: boolean): Promise<void> {
  const byGz = new Map<File, Map<string, number>>();
  const other: number[] = [];
  for (const i of list) {
    const g = grids[i];
    if (g.kind === 'index') {
      let m = byGz.get(g.gz);
      if (!m) byGz.set(g.gz, (m = new Map()));
      m.set(g.path, i);
    } else other.push(i);
  }
  let done = 0;
  const tick = () => {
    if (progress && ++done % 100 === 0) post({ type: 'progress', done, total: list.length, phase: 'grids' });
  };
  for (const [gz, want] of byGz) {
    for await (const line of lines(gz)) {
      // The path first: only the lines wanted are parsed.
      const m = /^\{"path":"((?:[^"\\]|\\.)*)"/.exec(line);
      const path = m ? JSON.parse(`"${m[1]}"`) : null;
      const i = path === null ? undefined : want.get(path);
      if (i === undefined) continue;
      const e = JSON.parse(line) as { grid: SummaryGrid };
      if (e.grid) visit(i, e.grid);
      want.delete(path);
      tick();
      if (!want.size) break;
    }
    // Lines the index lacks: from the containers.
    for (const i of want.values()) other.push(i);
  }
  let next = 0;
  const work = async () => {
    for (;;) {
      const k = next++;
      if (k >= other.length) return;
      const i = other[k];
      try {
        const g = await gridOf(i);
        if (g) visit(i, g);
      } catch {
        // a file gone or unreadable: its grid is left out
      }
      tick();
    }
  };
  await Promise.all(Array.from({ length: Math.min(8, other.length) }, work));
}

/** The niche explorer's tables: the lives of the filter, and the places of the last insights run on it. */
let nicheTables: { key: string; tables: NicheTable[] } | null = null;

/** What the place scan looks for on a map: from the heads of its matches. */
function planFor(list: number[]) {
  const rows: { cls: string; kills: number; deaths: number }[] = [];
  const teams: { name: string; kills: number; deaths: number }[] = [];
  const events: Record<string, number> = {};
  const want = new Set(list);
  for (let r = 0; r < store.v.match.n; r++) if (want.has(store.v.match.a[r])) rows.push({ cls: store.str(store.v.cls.a[r]), kills: store.v.kills.a[r], deaths: store.v.deaths.a[r] });
  for (let r = 0; r < store.t.match.n; r++) if (want.has(store.t.match.a[r])) teams.push({ name: store.str(store.t.name.a[r]), kills: store.t.kills.a[r], deaths: store.t.deaths.a[r] });
  const GK = GRID_KINDS.length;
  for (const i of list) GRID_KINDS.forEach((k, j) => (events[k] = (events[k] ?? 0) + store.events.a[i * GK + j]));
  // The sides' win rate where enough matches count rounds by result.
  const win = list.filter((i) => (store.outcome[i]?.r.length ?? 0) >= 6).length >= 8;
  return planOf(rows, teams, events, win);
}

const filterKey = (f: MassFilter) => JSON.stringify(f);

// ---------------------------------------------------------------------------
// The outcome analysis

let outcomeGroups = new Map<string, OutcomeGroup>();
let outcomeCancel = false;
/** Side-rounds a group needs before it is read at all (each arm of a test needs `minArm`). */
const OUTCOME_MIN_ROUNDS = 50;

async function outcomeRun(m: Extract<MassRequest, { type: 'outcome' }>): Promise<OutcomeResult> {
  outcomeCancel = false;
  const mask = store.matchMask(m.filter);
  // Groups: a map, mode and mission each; small ones are not read.
  const byKey = new Map<string, number[]>();
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const key = [store.str(store.m.map.get(i)), store.str(store.m.mode.get(i)), store.str(store.m.mission.get(i))].filter(Boolean).join(' · ') || '-';
    let l = byKey.get(key);
    if (!l) byKey.set(key, (l = []));
    l.push(i);
  }
  const rounds = (i: number) => Math.max(1, (store.outcome[i]?.r.length ?? 3) / 3);
  const minRounds = Math.max(OUTCOME_MIN_ROUNDS, m.minMatches ?? 0);
  const keys = [...byKey].filter(([, l]) => l.reduce((a, i) => a + rounds(i), 0) >= minRounds).map(([k]) => k);
  const small = [...byKey].filter(([k]) => !keys.includes(k)).reduce((a, [, l]) => a + l.length, 0);
  const groupOf = new Map<number, string>();
  for (const k of keys) for (const i of byKey.get(k)!) groupOf.set(i, k);
  const want = [...groupOf.keys()];
  const got = new Map<string, OutcomeMatch[]>(keys.map((k) => [k, []]));
  const grounds = new Map<string, number>();
  const missing = new Set<number>();
  const readSet = new Set<number>();
  const take = (i: number, g: SummaryGrid) => {
    const key = groupOf.get(i)!;
    if (!g.mv || !(g.mv.v >= MOVES_VERSION)) {
      missing.add(i);
      return;
    }
    // The ground's heights from a few matches of each group: enough to draw on.
    const ng = grounds.get(key) ?? 0;
    grounds.set(key, ng + 1);
    const started = store.m.started.get(i);
    got.get(key)!.push({
      i, started: Number.isFinite(started) ? started * 1000 : null, teams: teamsOf(i), mv: compactMoves(g.mv), rounds: store.outcome[i] ?? null,
      ground: ng < 20 ? { cell: g.cell, ix: g.ix, iz: g.iz, y: g.y, p: g.p } : null,
    });
    missing.delete(i);
    readSet.add(i);
  };
  let seen = 0;
  await streamGrids(want, (i, g) => {
    if (outcomeCancel) throw new Error('cancelled');
    take(i, g);
    if (++seen % 100 === 0) post({ type: 'progress', done: seen, total: want.length, phase: 'grids' });
  }, false);
  // Matches whose grid could not be read at all count as missing too.
  for (const i of want) if (!readSet.has(i)) missing.add(i);
  let computed = 0;
  if (m.compute && missing.size) {
    const list = [...missing];
    const threads = Math.max(1, Math.min(6, (navigator.hardwareConcurrency || 4) - 2));
    const pool = new Pool(threads);
    let next = 0;
    let done = 0;
    const work = async () => {
      for (;;) {
        if (outcomeCancel) return;
        const k = next++;
        if (k >= list.length) return;
        const i = list[k];
        const file = files[i];
        if (!file) continue;
        const path = store.paths[store.m.source.get(i)] ?? file.name;
        try {
          const r = await pool.run({ file, path });
          if (r.ok && r.summary?.grid) {
            const key = cacheKey(path, file);
            const { grid, ...head } = r.summary;
            // Cached as any summary worked out here, so the next run reads it.
            if (await idbPut('grids', key, grid)) {
              await idbPut('heads', key, head);
              grids[i] = { kind: 'idb', key };
            } else {
              memoryGrids.set(i, grid);
              grids[i] = { kind: 'memory' };
            }
            take(i, grid);
            computed++;
          }
        } catch {
          // left out
        }
        post({ type: 'progress', done: ++done, total: list.length, phase: 'moves' });
      }
    };
    try {
      await Promise.all(Array.from({ length: threads }, work));
    } finally {
      pool.close();
    }
    if (outcomeCancel) throw new Error('cancelled');
  }
  const input = keys.map((key) => ({ key, matches: got.get(key)! })).filter((x) => x.matches.length);
  got.clear();
  const { report, groups } = await analyseOutcome(input, m.options ?? {}, {
    progress: (done, total) => post({ type: 'progress', done, total, phase: 'outcome' }),
    cancelled: () => outcomeCancel,
    // A task boundary between groups: a cancel gets in.
    yieldEvery: () => new Promise((r) => setTimeout(r, 0)),
  });
  outcomeGroups = new Map(groups.map((g) => [g.key, g]));
  const slices: OutcomeResult['slices'] = {};
  for (const g of groups) slices[g.key] = { slices: g.slices, slice: g.slice };
  return { report, matches: mask.reduce((a, v) => a + v, 0), read: readSet.size, missing: missing.size, computed, small, slices };
}
/** Files handed over before an `open`, a slice a message. */
let incoming: { file: File; path: string }[] = [];

// ---------------------------------------------------------------------------

ctx.onmessage = async (ev: MessageEvent<MassRequest>) => {
  const m = ev.data;
  const t0 = performance.now();
  try {
    if (m.type === 'files') {
      incoming.push(...m.files);
      return;
    }
    if (m.type === 'open') {
      const list = [...incoming, ...m.files];
      incoming = [];
      return await open(list, m.add);
    }
    if (m.type === 'query') {
      const mask = store.matchMask(m.filter);
      const q = m.q;
      const data =
        q.kind === 'overview' ? overview(store, mask)
        : q.kind === 'balance' ? balance(store, mask, q.by, q.split, { minUnits: q.minUnits, classes: q.classes, players: q.players })
        : q.kind === 'trends' ? trends(store, mask, q.by, q.bucket)
        : q.kind === 'populations' ? populations(store, mask)
        : q.kind === 'sides' ? sides(store, mask)
        : q.kind === 'maneuvers' ? maneuverRows(store, mask)
        : q.kind === 'cqb' ? cqbRows(store, mask)
        : q.kind === 'surfaces' ? surfaceRows(store, mask)
        : phases(store, mask);
      return post({ type: 'result', id: m.id, data, ms: performance.now() - t0 });
    }
    if (m.type === 'grid') {
      const key = `${filterKey(m.filter)}|${m.map}|${m.team}`;
      if (!lastMerge || lastMerge.key !== key) {
        const mask = store.matchMask({ ...m.filter, maps: [m.map] });
        const list: number[] = [];
        for (let i = 0; i < mask.length; i++) if (mask[i]) list.push(i);
        lastMerge = { key, merge: await mergeOf(list, m.team, true) };
      }
      const r = lastMerge.merge.raster(m.channel, m.level);
      const data = { ...r, matches: lastMerge.merge.matches, cells: lastMerge.merge.ix.length, bytes: lastMerge.merge.bytes(), teams: lastMerge.merge.teams };
      ctx.postMessage({ type: 'result', id: m.id, data, ms: performance.now() - t0 } satisfies MassResponse, [r.v.buffer, ...(r.d ? [r.d.buffer] : [])]);
      return;
    }
    if (m.type === 'insights') {
      const mask = store.matchMask(m.filter);
      const o = overview(store, mask);
      const merges = new Map<string, GridMerge>();
      const stageB = m.stageB !== false;
      const tables = stageB ? new PlaceTables(store, mask) : null;
      const jobs: PlaceJob[] = [];
      const lists = new Map<string, number[]>();
      for (const mp of o.byMap.filter((x) => x.key).slice(0, m.maps)) {
        const mm = store.matchMask({ ...m.filter, maps: [mp.key] });
        const list: number[] = [];
        for (let i = 0; i < mm.length; i++) if (mm[i]) list.push(i);
        lists.set(mp.key, list);
        merges.set(mp.key, new GridMerge(mergeCell(list.map((i) => extents[i]))));
        const frame = stageB ? scanFrame(list.map((i) => extents[i])) : null;
        if (frame)
          jobs.push({
            map: mp.key,
            frame,
            plan: planFor(list),
            read: (visit) => streamGrids(list, (i, grid) => visit({ i, grid, teams: teamsOf(i), duration: store.m.duration.get(i) } satisfies PlaceMatch), false),
          });
      }
      let places = null;
      if (stageB) {
        // One read feeds the summed grids, the place scan and the niche tables; the scan reads its maps again for stability.
        const frames = new Map(jobs.map((j) => [j.map, j.frame]));
        places = await discoverPlaces(jobs, (map, pm) => {
          merges.get(map)!.add(pm.grid, pm.teams, extents[pm.i], null);
          tables!.add(map, frames.get(map)!, pm);
        });
      }
      // Maps without a raster (no extents) still get their summed grids.
      for (const [map, list] of lists) if (!jobs.some((j) => j.map === map)) await streamGrids(list, (i, g) => merges.get(map)!.add(g, teamsOf(i), extents[i], null), false);
      let niches = null;
      if (stageB) {
        const all = [livesTable(store, mask), roundsTable(store, mask), ...tables!.tables()];
        nicheTables = { key: filterKey(m.filter), tables: all };
        niches = discoverNiches(all, store.matches);
      }
      const report: MassReport = massInsights({ store, mask, filter: m.filter, grids: merges, places, niches });
      return post({ type: 'result', id: m.id, data: report, ms: performance.now() - t0 });
    }
    if (m.type === 'niche') {
      const key = filterKey(m.filter);
      if (!nicheTables || nicheTables.key !== key) {
        const mask = store.matchMask(m.filter);
        nicheTables = { key, tables: [livesTable(store, mask), roundsTable(store, mask)] };
      }
      const t = nicheTables.tables.find((x) => x.name === m.table) ?? nicheTables.tables[0];
      return post({ type: 'result', id: m.id, data: nicheChildren(t, m.target, m.base, store.matches), ms: performance.now() - t0 });
    }
    if (m.type === 'outcomeCancel') {
      outcomeCancel = true;
      return;
    }
    if (m.type === 'outcome') {
      const data = await outcomeRun(m);
      return post({ type: 'result', id: m.id, data, ms: performance.now() - t0 });
    }
    if (m.type === 'outcomeMap') {
      const g = outcomeGroups.get(m.group);
      const data = g ? outcomeMap(g, m.side, { window: m.window, slice: m.slice }) : null;
      return post({ type: 'result', id: m.id, data, ms: performance.now() - t0 });
    }
    if (m.type === 'drill') {
      const list = m.insight ? insightMatches(store, m.filter, m.insight) : drillMatches(store, store.matchMask(m.filter), m.drill ?? {});
      const out = list.map((i) => files[i]).filter((f): f is File => !!f);
      return post({ type: 'result', id: m.id, data: { files: out, matches: list.length }, ms: performance.now() - t0 });
    }
  } catch (e) {
    post({ type: 'error', id: 'id' in m ? m.id : undefined, message: e instanceof Error ? e.message : String(e) });
  }
};
