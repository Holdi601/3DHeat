/**
 * The main thread's side of the chart signs: what the row workers
 * (`worker.ts`, each holding every so-many-th chunk of rows) and the merging
 * worker (`mergeWorker.ts`, adding up their shares into the charts) are told,
 * and what they say back (`protocol.ts`).
 *
 * - A build when the data, a signed volume's shape, the columns the signs
 *   read or whether one compares inside with outside change (after a short
 *   quiet): the rows go over a chunk at a time, every column of a chunk copied
 *   (a native copy, no per-row script) into one buffer that is transferred and
 *   comes back with the worker's ack to be filled again - so a build allocates
 *   nothing per chunk and leaves the garbage collector nothing to do. The
 *   copies run between frames, at most `FRAME_BUDGET` ms of them a frame.
 *   (Not zero-copy: the dataset's columns are ordinary ArrayBuffers - the page
 *   is not cross-origin isolated, see vite.config.ts - and the page keeps
 *   using them, so they can be neither shared nor transferred.)
 * - A scope when the filters, the time window, the groups or the match
 *   change, and during playback at most every `PLAY_EVERY` ms - never per
 *   frame.
 * - Results are said in the viewer's language, coloured per sign (a sign's
 *   series keep their colours), kept, and the overlay told which signs are
 *   dirty; it repaints only those, a few per frame.
 * - While the workers work, the intervals between frames are watched; late
 *   frames slow the workers (`PACE_SLOW`) and the build's copies, calm ones
 *   let them go again.
 */

import type { AggMeta } from '../../charts/aggregate';
import { MAX_TAB_ARRAY_BYTES } from '../../data/memory';
import { residentBytes } from '../../data/resident';
import { aggScopes, metaOf, specColumns } from '../../charts/data';
import { colorChart, type ChartTheme } from '../../charts/palette';
import { localizeChart } from '../../charts/format';
import type { ChartData } from '../../charts/types';
import { PERSON_FILTER_COLUMN } from '../../render/filterTables';
import type { Engine } from '../../render/engine';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { currentScope, savedRowsNow, type SavedRows } from '../scope';
import { useVolumeStore } from '../store';
import type { Volume } from '../volume';
import type { Sign } from './sign';
import { liveSigns, useSignStore } from './store';
import { chunkViews, fieldBytes, type ChunkField, type FromMerger, type FromWorker, type KeptInfo, type SignJob, type ToMerger, type ToWorker } from './protocol';

/** Rows a chunk. */
export const SIGN_CHUNK = 1 << 15;
/** Chunks on their way per row worker (and buffers in the pool). */
const IN_FLIGHT = 2;

/**
 * Row workers: an eighth of the logical cores, at least one, at most eight.
 * Each holds a share of the rows and folds them for every sign, so a filter
 * change is worked on that many cores at once; the merging worker adds their
 * shares. Not more: the rest of the cores stay free for the page, the GPU
 * process and whatever else the machine runs - a filter change that starves
 * the frames is worse than one that takes longer. Measured on 32 logical
 * cores busy with other work, plain busy workers beside the heat view on 50M
 * rows: 4 left the frames as they were (p99 18 ms), 8 dropped them (p99 81).
 */
export function rowWorkers(cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 4): number {
  // `?signWorkers=N` for the probes.
  const asked = typeof location !== 'undefined' ? Number(new URLSearchParams(location.search).get('signWorkers')) : 0;
  if (asked >= 1) return Math.min(64, Math.floor(asked));
  return Math.max(1, Math.min(8, Math.floor((cores || 4) / 8)));
}
/** Most main-thread milliseconds a frame spends copying rows for a build (while frames come late: less). */
const FRAME_BUDGET = 2;
const FRAME_BUDGET_SLOW = 0.5;
/**
 * The row workers' pace: a step of `run` ms, then `rest` ms of rest. While
 * the frames come late during their work - a busy machine, where every
 * thread that runs takes time from the page and the GPU process - they work
 * a quarter of the time; once the frames are on time again, flat out.
 */
const PACE_FAST = { run: 12, rest: 0 };
const PACE_SLOW = { run: 3, rest: 12 };
/** A frame this late counts as dropped, ms; so many dropped within `LATE_WINDOW` ms slow the workers, none for `CALM` ms frees them. */
const LATE_MS = 24;
const LATE_COUNT = 2;
const LATE_WINDOW = 1000;
const CALM = 1500;
/** Least, and most, rows the worker keeps (one column of the most stays under 2 GiB). */
const MIN_KEEP = 1 << 20;
const MAX_KEEP = (1 << 29) - (1 << 18);
/** Quiet before a build, ms: a volume dragged rebuilds once it is let go. */
const BUILD_QUIET = 400;
/** Most often the scope is sent during playback, ms. */
export const PLAY_EVERY = 250;

type Col = Float32Array | Uint32Array | Uint16Array;

/** The columns a build sends, packed in this order into each chunk. */
export function chunkFields(ds: Dataset, columns: readonly string[]): { fields: ChunkField[]; data: Col[] } {
  const fields: ChunkField[] = [];
  const data: Col[] = [];
  const add = (key: string, a: Col | null | undefined) => {
    if (!a) return;
    fields.push({ key, type: a instanceof Uint16Array ? 'u16' : a instanceof Uint32Array ? 'u32' : 'f32' });
    data.push(a);
  };
  add('x', ds.px);
  add('y', ds.py);
  add('z', ds.pz);
  add('time', ds.time);
  add('life', ds.lifetime);
  add('team', ds.teamId);
  add('person', ds.personId);
  add('session', ds.sessionId);
  for (const c of columns) add(`c:${c}`, ds.attrs.find((a) => a.name === c)?.data as Col | undefined);
  return { fields, data };
}

/**
 * Rows the worker may keep: half the room the tab has left for arrays (its
 * RAM budget, at most what one tab can allocate, less the dataset), at the
 * bytes a kept row costs there - its columns, its volume bits, the masks and
 * the lists of the shared scans. Below this the charts are exact.
 */
export function keepBudget(ds: Dataset, fields: readonly ChunkField[], ramBudget: number): number {
  const room = (Math.min(ramBudget, MAX_TAB_ARRAY_BYTES) - residentBytes(ds)) * 0.5;
  let perRow = 4 + 4 + 8;
  for (const f of fields) if (f.key !== 'x' && f.key !== 'y' && f.key !== 'z') perRow += f.type === 'u16' ? 2 : 4;
  return Math.max(MIN_KEEP, Math.min(MAX_KEEP, Math.floor(room / perRow)));
}

type Listener = (dirty: Set<string>) => void;

/**
 * What the signs cost the main thread, for the probes (tools/smoke-signs.mjs):
 * the longest a frame's sign work took (placing, painting), the longest a
 * message from the worker or a scope sent took, and their sums.
 */
export const signTiming = { frameMax: 0, frameSum: 0, frames: 0, taskMax: 0, taskSum: 0, tasks: 0, frameMs: [] as number[], taskMs: [] as number[] };

export function resetSignTiming(): void {
  Object.assign(signTiming, { frameMax: 0, frameSum: 0, frames: 0, taskMax: 0, taskSum: 0, tasks: 0, frameMs: [], taskMs: [] });
}

/** Keep a duration for the probes' percentiles (the most recent few thousand). */
export function noteSignMs(list: number[], ms: number): void {
  if (list.length < 8192) list.push(ms);
}

function timedTask(t0: number): void {
  const ms = performance.now() - t0;
  signTiming.taskMax = Math.max(signTiming.taskMax, ms);
  signTiming.taskSum += ms;
  signTiming.tasks++;
  noteSignMs(signTiming.taskMs, ms);
}

class SignClient {
  private shards: Worker[] = [];
  private merger: Worker | null = null;
  /** Row workers' readiness for the build running, and what each kept. */
  private readyFrom: ({ rows: Record<string, number>; kept: KeptInfo } | null)[] = [];
  private engine: Engine | null = null;
  private ds: Dataset | null = null;
  private meta: AggMeta | null = null;
  private buildKey = '';
  private buildId = 0;
  private building = false;
  private buildTimer: ReturnType<typeof setTimeout> | null = null;
  private scopeTimer: ReturnType<typeof setTimeout> | null = null;
  private playTimer: ReturnType<typeof setInterval> | null = null;
  private seq = 0;
  /** The last scope the worker finished every sign for. */
  private doneSeq = -1;
  private lastScopeKey = '';
  private lastPlayhead = NaN;
  private ready = false;
  private unsub: (() => void)[] = [];
  private listeners = new Set<Listener>();
  private memories = new Map<string, Map<string, number>>();
  private theme: ChartTheme | null = null;
  /** Each sign's chart as it was last said, coloured. */
  readonly results = new Map<string, ChartData>();
  /** The raw result, to say again when the language or the theme changes. */
  private raw = new Map<string, ChartData>();
  /** Rows inside each signed volume, after the last build. */
  rowsInside: Record<string, number> = {};
  /** How the last build kept its rows (all, or a sample of one in so many). */
  kept: KeptInfo | null = null;
  /** Progress of a build, 0-1; null when none runs. */
  progress: number | null = null;
  /** Whether the workers are held to the slow pace now, and how often they were. */
  paceSlow = false;
  paceSlowed = 0;
  private watching = false;
  /** Worker milliseconds of the last scope's recompute (its shared scans, rows folded, signs started over), and results received. */
  stats = { workerMs: 0, scanMs: 0, folded: 0, full: 0, results: 0, builds: 0, scopes: 0 };

  start(engine: Engine | null): void {
    this.engine = engine;
    if (this.merger) return;
    this.merger = new Worker(new URL('./mergeWorker.ts', import.meta.url), { type: 'module' });
    this.merger.onmessage = (e: MessageEvent<FromMerger>) => this.onMessage(e.data);
    const n = rowWorkers();
    for (let k = 0; k < n; k++) {
      const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e: MessageEvent<FromWorker>) => this.onMessage(e.data, k);
      // Each row worker talks to the merging worker directly, not through the page.
      const ch = new MessageChannel();
      w.postMessage({ type: 'port', port: ch.port1, shard: k } satisfies ToWorker, [ch.port1]);
      this.merger.postMessage({ type: 'port', port: ch.port2, shard: k } satisfies ToMerger, [ch.port2]);
      this.shards.push(w);
    }
    const sync = () => this.sync();
    this.unsub.push(useSignStore.subscribe(sync), useVolumeStore.subscribe(sync));
    this.unsub.push(
      useStore.subscribe((s, p) => {
        if (s.dataset !== p.dataset) return this.sync();
        if (s.filters !== p.filters) this.sync();
        if (s.filters !== p.filters || s.timeline !== p.timeline || s.teamVisibility !== p.teamVisibility || s.mode !== p.mode || s.team !== p.team) this.scheduleScope(60);
      }),
    );
    this.playTimer = setInterval(() => this.tickPlay(), PLAY_EVERY);
    this.sync();
  }

  stop(): void {
    for (const u of this.unsub) u();
    this.unsub = [];
    if (this.playTimer) clearInterval(this.playTimer);
    for (const w of this.shards) w.terminate();
    this.shards = [];
    this.merger?.terminate();
    this.merger = null;
    this.ready = false;
    this.building = false;
    this.buildKey = '';
    // A new worker knows nothing: the next start tells it the data again.
    this.ds = null;
    this.meta = null;
    this.buildId++;
  }

  /** Tell the overlay something around the charts changed (a build began or ended). */
  private notify(): void {
    const none = new Set<string>();
    for (const l of this.listeners) l(none);
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  /** Colour and say every result again (a theme or a language change). */
  restyle(theme: ChartTheme): void {
    this.theme = theme;
    const dirty = new Set<string>();
    for (const [id, d] of this.raw) {
      this.results.set(id, this.dress(id, d));
      dirty.add(id);
    }
    if (dirty.size) for (const l of this.listeners) l(dirty);
  }

  private dress(id: string, d: ChartData): ChartData {
    const out = localizeChart(structuredClone(d));
    let mem = this.memories.get(id);
    if (!mem) this.memories.set(id, (mem = new Map()));
    if (this.theme) colorChart(out, this.theme, mem);
    return out;
  }

  /** To every row worker, and what the merging worker must know too (it first: their shares follow). */
  private post(m: ToWorker): void {
    if (m.type === 'meta' || m.type === 'signs' || m.type === 'scope') this.merger?.postMessage(m satisfies ToMerger);
    for (const w of this.shards) w.postMessage(m);
  }

  /** Row workers running. */
  get rowWorkers(): number {
    return this.shards.length;
  }

  private setPace(slow: boolean): void {
    if (slow === this.paceSlow) return;
    this.paceSlow = slow;
    if (slow) this.paceSlowed++;
    const pace = slow ? PACE_SLOW : PACE_FAST;
    for (const w of this.shards) w.postMessage({ type: 'pace', ...pace } satisfies ToWorker);
  }

  /**
   * While the workers work (a build, a scope not yet counted), the frames are
   * watched: late ones slow the workers down, calm ones let them go. Only
   * intervals between frames are read - nothing is drawn or measured on the
   * GPU.
   */
  private watchFrames(): void {
    if (this.watching || typeof requestAnimationFrame !== 'function') return;
    this.watching = true;
    /** When the recent late frames came. */
    const late: number[] = [];
    let lastLate = -Infinity;
    let last = -1;
    const tick = (now: number) => {
      const busy = this.building || (this.ready && this.doneSeq !== this.seq);
      if (!busy || !this.merger) {
        this.watching = false;
        // The next job starts flat out.
        this.setPace(false);
        return;
      }
      if (last >= 0) {
        if (now - last > LATE_MS) {
          late.push(now);
          lastLate = now;
        }
        while (late.length && late[0] < now - LATE_WINDOW) late.shift();
        if (!this.paceSlow && late.length >= LATE_COUNT) this.setPace(true);
        else if (this.paceSlow && now - lastLate > CALM) this.setPace(false);
      }
      last = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private signs(): Sign[] {
    return liveSigns(useSignStore.getState().signs, useVolumeStore.getState().volumes);
  }

  /** What the worker must hold: the volumes with signs, the columns they and the filters read. */
  private sync(): void {
    const ds = useStore.getState().dataset;
    if (ds !== this.ds) {
      this.ds = ds;
      this.meta = ds ? metaOf(ds) : null;
      this.ready = false;
      this.buildKey = '';
      this.results.clear();
      this.raw.clear();
      if (this.meta) this.post({ type: 'meta', meta: this.meta });
    }
    if (!ds || !this.meta) return;
    const signs = this.signs();
    const vols = useVolumeStore.getState().volumes.filter((v) => signs.some((s) => s.volumeId === v.id));
    const cols = new Set<string>();
    for (const s of signs) for (const c of specColumns(s.spec, this.meta)) cols.add(c);
    for (const f of useStore.getState().filters) if (f.kind === 'range' || f.kind === 'categories') cols.add(f.column);
    const columns = [...cols].filter((c) => c !== PERSON_FILTER_COLUMN && ds.attrs.some((a) => a.name === c)).sort();
    // The rest of the rows only when a sign compares inside with outside.
    const rest = signs.some((s) => s.spec.diff === 'inout');
    const key = JSON.stringify([ds.id, ds.count, vols.map((v) => [v.id, v.shape]), columns, rest]);
    const jobs: SignJob[] = signs.map((s) => ({ id: s.id, volumeId: s.volumeId, spec: s.spec, upToNow: s.upToNow }));
    if (key !== this.buildKey) {
      this.buildKey = key;
      // The worker's rows are stale until the build: nothing is asked of them meanwhile.
      this.ready = false;
      if (this.buildTimer) clearTimeout(this.buildTimer);
      if (vols.length === 0) {
        this.post({ type: 'signs', signs: [] });
        return;
      }
      this.buildTimer = setTimeout(() => this.build(ds, vols, columns, rest, jobs), this.stats.builds > 0 ? BUILD_QUIET : 30);
      return;
    }
    if (this.ready) this.post({ type: 'signs', signs: jobs });
    // Signs gone: their results go too.
    for (const id of [...this.raw.keys()]) if (!jobs.some((j) => j.id === id)) {
      this.raw.delete(id);
      this.results.delete(id);
    }
  }

  private build(ds: Dataset, vols: Volume[], columns: string[], rest: boolean, jobs: SignJob[]): void {
    const id = ++this.buildId;
    this.building = true;
    this.stats.builds++;
    this.notify();
    const { fields, data } = chunkFields(ds, columns);
    const keepRows = keepBudget(ds, fields, useStore.getState().budgets.ram);
    const W = this.shards.length;
    this.readyFrom = new Array(W).fill(null);
    this.merger?.postMessage({ type: 'build', build: id, shards: W } satisfies ToMerger);
    // Each row worker keeps its share of the budget: every W-th chunk.
    for (const w of this.shards) w.postMessage({ type: 'build', build: id, volumes: vols, fields, rest, keepRows: keepRows / W, sorted: !!ds.time && ds.timeSorted, total: ds.count } satisfies ToWorker);
    const inFlightMax = IN_FLIGHT * W;
    let chunkBytes = 0;
    for (const f of fields) chunkBytes += fieldBytes(f, SIGN_CHUNK);
    const pool: ArrayBuffer[] = [];
    let made = 0;
    let next = 0;
    let inFlight = 0;
    /** Main-thread ms spent copying since the last frame began. */
    let spent = 0;
    let queued = false;
    let done = false;
    this.progress = 0;
    const live = () => id === this.buildId && this.ds === ds;
    /** One chunk copied into a buffer from the pool and sent; false when none may go now. */
    const sendOne = (): boolean => {
      if (inFlight >= inFlightMax || next >= ds.count) return false;
      let buf = pool.pop();
      if (!buf && made < inFlightMax) {
        made++;
        buf = new ArrayBuffer(chunkBytes);
      }
      if (!buf) return false;
      const lo = next;
      const n = Math.min(SIGN_CHUNK, ds.count - lo);
      const views = chunkViews(buf, fields, n);
      for (let k = 0; k < views.length; k++) views[k].set(data[k].subarray(lo, lo + n));
      // Chunk by chunk round the row workers: each one's rows stay in time order.
      this.shards[Math.floor(lo / SIGN_CHUNK) % W]?.postMessage({ type: 'chunk', build: id, lo, n, buf } satisfies ToWorker, [buf]);
      next = lo + n;
      inFlight++;
      return true;
    };
    const kick = () => {
      if (queued) return;
      queued = true;
      setTimeout(pump, 0);
    };
    /** Copies between frames, at most FRAME_BUDGET ms of them a frame (any amount in a hidden tab, which has no frames). */
    const pump = () => {
      queued = false;
      if (!live()) return;
      const t0 = performance.now();
      const budget = document.hidden ? Infinity : this.paceSlow ? FRAME_BUDGET_SLOW : FRAME_BUDGET;
      let sent = 0;
      while (spent + (performance.now() - t0) < budget && sendOne()) sent++;
      if (sent) {
        spent += performance.now() - t0;
        timedTask(t0);
      }
      if (next >= ds.count && inFlight === 0 && !done) {
        done = true;
        this.post({ type: 'built', build: id });
        this.post({ type: 'signs', signs: jobs });
        this.progress = null;
      }
    };
    // Each frame a new budget, while the build runs.
    const frame = () => {
      if (!live() || done) return;
      spent = 0;
      kick();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    this.watchFrames();
    this.onAck = (b, buf) => {
      if (b !== id) return;
      inFlight--;
      if (buf.byteLength === chunkBytes) pool.push(buf);
      this.progress = ds.count > 0 ? Math.min(1, next / ds.count) : 1;
      kick();
    };
    kick();
  }

  private onAck: ((build: number, buf: ArrayBuffer) => void) | null = null;

  private onMessage(m: FromWorker | FromMerger, shard = -1): void {
    const t0 = performance.now();
    this.handle(m, shard);
    timedTask(t0);
  }

  private handle(m: FromWorker | FromMerger, shard: number): void {
    if (m.type === 'ack') this.onAck?.(m.build, m.buf);
    else if (m.type === 'ready') {
      if (m.build !== this.buildId || shard < 0) return;
      this.readyFrom[shard] = { rows: m.rows, kept: m.kept };
      if (this.readyFrom.some((r) => !r)) return;
      // Every row worker has its share: the rows inside and how they were kept, summed.
      const rows: Record<string, number> = {};
      const kept: KeptInfo = { inside: 0, keepInside: 1, rest: 0, keepRest: 1, restRows: 0, budget: 0 };
      for (const r of this.readyFrom as { rows: Record<string, number>; kept: KeptInfo }[]) {
        for (const [v, n] of Object.entries(r.rows)) rows[v] = (rows[v] ?? 0) + n;
        kept.inside += r.kept.inside;
        kept.rest += r.kept.rest;
        kept.restRows += r.kept.restRows;
        kept.budget += r.kept.budget;
        kept.keepInside = Math.max(kept.keepInside, r.kept.keepInside);
        kept.keepRest = Math.max(kept.keepRest, r.kept.keepRest);
      }
      this.building = false;
      this.ready = true;
      this.notify();
      this.rowsInside = rows;
      this.kept = kept;
      this.lastScopeKey = '';
      // Signs changed while it built: tell the worker the ones there are now.
      this.sync();
      this.sendScope(true);
    } else if (m.type === 'result') {
      this.stats.results++;
      this.raw.set(m.id, m.data);
      this.results.set(m.id, this.dress(m.id, m.data));
      const dirty = new Set([m.id]);
      for (const l of this.listeners) l(dirty);
    } else if (m.type === 'idle') {
      Object.assign(this.stats, { workerMs: m.ms + m.scan, scanMs: m.scan, folded: m.folded, full: m.full });
      this.doneSeq = m.seq;
    }
  }

  private scheduleScope(ms: number): void {
    if (this.scopeTimer) return;
    this.scopeTimer = setTimeout(() => {
      this.scopeTimer = null;
      this.sendScope(false);
    }, ms);
  }

  private playhead(): number {
    return this.engine?.live.playhead ?? useStore.getState().timeline.playhead;
  }

  private tickPlay(): void {
    if (!this.ready) return;
    const tl = useStore.getState().timeline;
    if (tl.mode === 'all') return;
    const p = this.playhead();
    if (p === this.lastPlayhead) return;
    this.sendScope(false);
  }

  private sendScope(force: boolean): void {
    const t0 = performance.now();
    this.postScope(force);
    timedTask(t0);
  }

  private postScope(force: boolean): void {
    const ds = this.ds;
    if (!ds || !this.ready || this.building) return;
    const s = useStore.getState();
    const playing = s.timeline.mode !== 'all' && !!ds.time;
    const p = Math.floor(this.playhead() * 10) / 10;
    this.lastPlayhead = this.playhead();
    const sc = currentScope(s, p);
    const { scope, upTo } = aggScopes(ds, sc, playing ? p : null);
    const k = JSON.stringify([scope.key, scope.timeLo, scope.timeHi, scope.lifetimeNow, upTo.timeHi]);
    if (!force && k === this.lastScopeKey) return;
    this.lastScopeKey = k;
    this.stats.scopes++;
    this.post({ type: 'scope', seq: ++this.seq, scope, upTo });
    this.watchFrames();
  }

  /** The rows the signs count now, as rules a document keeps (`upToNow`: up to the playhead). */
  rowsNow(upToNow: boolean): SavedRows {
    return savedRowsNow(useStore.getState(), Math.floor(this.playhead() * 10) / 10, upToNow);
  }

  /** The playhead along a chart's time axis, for its hairline; null outside playback. */
  nowOn(d: ChartData): number | null {
    const ds = this.ds;
    if (!ds || !d.axis?.time || useStore.getState().timeline.mode === 'all') return null;
    const p = this.playhead();
    if (d.axis.lo === 0 && ds.sessionStart && ds.sessionStart.length > 0) {
      const sess = useStore.getState().team.session;
      if (sess >= 0) return p - ds.sessionStart[sess];
      // Matches on one clock: the playhead into the match it is in.
      for (let k = ds.sessionStart.length - 1; k >= 0; k--) if (ds.sessionStart[k] <= p && (!ds.sessionEnd || p <= ds.sessionEnd[k])) return p - ds.sessionStart[k];
      return null;
    }
    return p;
  }

  /** Every sign counted for the newest scope sent (the probes wait on it). */
  get isIdle(): boolean {
    return this.ready && !this.building && this.doneSeq === this.seq && this.scopeTimer === null;
  }

  get isBuilding(): boolean {
    return this.building;
  }
}

export const signClient = new SignClient();
