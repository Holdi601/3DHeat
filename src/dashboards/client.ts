/**
 * The page's side of the dashboards: which tiles are on screen (the window's
 * page, a document's embedded page), their queries planned (`plan.ts`), the
 * rows and columns they read sent to the row workers (`worker.ts`), their
 * partial numbers summed and finished (`finish.ts`) into what each tile draws.
 *
 * - **Workers.** Per data source a pool of row workers (as many as the chart
 *   signs use: an eighth of the cores, at most eight), each a contiguous share
 *   of the rows. Only the columns some tile reads are sent - a column once,
 *   when a tile first reads it - a chunk at a time between frames (at most
 *   `FRAME_BUDGET` ms of copying per task), transferred.
 * - **Memory.** Past half of what the tab's budget leaves once the data is
 *   loaded, the workers keep an even sample (every second row, every
 *   fourth...), each kept row standing for those it skips; tiles then say so.
 * - **Never on the frame path.** Nothing here runs per frame. A change (an
 *   edit, a slicer, a selection, the view's filters, the playhead a few times
 *   a second while following the view) plans every shown tile again - plain
 *   objects, no rows - and sends one run; the next run waits for every worker
 *   to answer the last. The workers fold only what changed (`query.ts`).
 * - **Late frames slow the workers**, as for the signs: the intervals between
 *   frames are watched while they work (nothing read back from the GPU).
 */

import { MAX_TAB_ARRAY_BYTES } from '../data/memory';
import { residentBytes } from '../data/resident';
import { aggScopes } from '../charts/data';
import type { Engine as RenderEngine } from '../render/engine';
import { useStore } from '../state/store';
import type { Dataset, FilterSpec } from '../state/types';
import { K } from '../versus/engine';
import { bindRow, type RNode } from '../versus/expr';
import { currentScope } from '../volumes/scope';
import { useVolumeStore } from '../volumes/store';
import { rowWorkers } from '../volumes/signs/client';
import { datasetColumn, derivedNeeds, queryColumns } from './columns';
import { catalogOf, type CalcRanges, type Catalog } from './fields';
import { finishTile, type TileData } from './finish';
import type { Dashboard, Tile } from './model';
import { planTile, type LinkInputs, type TilePlan } from './plan';
import { mergePartials, words, type ColArr, type Merged, type Partial, type QuerySpec } from './query';
import { dashboardSource, onSourcesChanged, VIEW_SOURCE } from './sources';
import { interOf, useDash, pageShown } from './store';
import type { FromDashWorker, ToDashWorker } from './worker';

const CHUNK = 1 << 16;
const IN_FLIGHT = 3;
const FRAME_BUDGET = 2;
const FRAME_BUDGET_SLOW = 0.5;
const PACE_FAST = { run: 12, rest: 0 };
const PACE_SLOW = { run: 3, rest: 12 };
const LATE_MS = 24;
/** Most often the tiles follow the playhead, ms. */
export const DASH_PLAY_EVERY = 250;
/** Columns a row is budgeted for when the sample is chosen. */
const BUDGET_COLUMNS = 12;
/** Bitsets each worker keeps for its clause and mask caches, at most (and their bytes, at most). */
const MAX_BITSETS = 48;
const BITSET_BYTES = 256 * 1024 * 1024;
/** Tiles redrawn a frame at most when new numbers come in. */
const TILES_A_FRAME = 3;

/** The probes' view of what the dashboards cost the main thread. */
export const dashTiming = { taskMax: 0, taskSum: 0, tasks: 0, taskMs: [] as number[] };
export function resetDashTiming(): void {
  Object.assign(dashTiming, { taskMax: 0, taskSum: 0, tasks: 0, taskMs: [] });
}
function timed(t0: number): void {
  const ms = performance.now() - t0;
  dashTiming.taskMax = Math.max(dashTiming.taskMax, ms);
  dashTiming.taskSum += ms;
  dashTiming.tasks++;
  if (dashTiming.taskMs.length < 20000) dashTiming.taskMs.push(ms);
}

type Kind = 'f32' | 'u32' | 'u16';
const kindOf = (a: ColArr): Kind => (a instanceof Uint16Array ? 'u16' : a instanceof Uint32Array ? 'u32' : 'f32');

/** The rows of one dataset, held by a pool of row workers. */
class Pool {
  shards: Worker[] = [];
  /** Per shard, its first kept row and how many. */
  spans: [number, number][] = [];
  stride = 1;
  have = new Set<string>();
  ranges = new Map<string, [number, number]>();
  /** Each calculated column's expression as it was worked out. */
  calcSrc = new Map<string, string>();
  private pending: { seq: number; parts: (Partial[] | null)[]; resolve: (p: Partial[][]) => void; ms: number[] } | null = null;
  private seq = 0;
  private acks: number[] = [];
  private ackWait: (() => void)[] = [];
  private rangeWait = new Map<string, { left: number; lo: number; hi: number; done: () => void }>();
  lastMs = 0;
  stats: Record<string, number> = {};

  constructor(
    public ds: Dataset,
    n: number,
  ) {
    const ram = useStore.getState().budgets?.ram ?? 4 * 1024 ** 3;
    const room = (Math.min(ram, MAX_TAB_ARRAY_BYTES) - residentBytes(ds)) * 0.5;
    const perRow = 4 * BUDGET_COLUMNS + MAX_BITSETS / 8;
    const keep = Math.max(1 << 20, Math.floor(room / perRow));
    this.stride = Math.max(1, Math.ceil(ds.count / keep));
    const kept = Math.ceil(ds.count / this.stride);
    const shards = Math.max(1, Math.min(n, Math.ceil(kept / (1 << 16))));
    const sessionStart = ds.sessionStart ? Array.from(ds.sessionStart) : null;
    for (let k = 0; k < shards; k++) {
      const lo = Math.floor((kept * k) / shards);
      const hi = Math.floor((kept * (k + 1)) / shards);
      this.spans.push([lo, hi - lo]);
      const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e: MessageEvent<FromDashWorker>) => this.onMessage(k, e.data);
      const bits = Math.max(8, Math.min(MAX_BITSETS, Math.floor(BITSET_BYTES / Math.max(1, words(hi - lo) * 4))));
      w.postMessage({ type: 'reset', n: hi - lo, weight: this.stride, sorted: ds.timeSorted, sessionStart, timeLo: ds.timeRange[0], maxBitsets: bits } satisfies ToDashWorker);
      this.shards.push(w);
      this.acks.push(0);
    }
  }

  get rows(): number {
    return this.spans.reduce((s, x) => s + x[1], 0);
  }

  stop(): void {
    for (const w of this.shards) w.terminate();
    this.shards = [];
  }

  pace(slow: boolean): void {
    for (const w of this.shards) w.postMessage({ type: 'pace', ...(slow ? PACE_SLOW : PACE_FAST) } satisfies ToDashWorker);
  }

  private onMessage(k: number, m: FromDashWorker): void {
    if (m.type === 'ack') {
      this.acks[k]--;
      const w = this.ackWait.splice(0);
      for (const f of w) f();
    } else if (m.type === 'range') {
      const r = this.rangeWait.get(m.key);
      if (r) {
        r.lo = Math.min(r.lo, m.lo);
        r.hi = Math.max(r.hi, m.hi);
        if (--r.left === 0) {
          this.rangeWait.delete(m.key);
          this.ranges.set(m.key, [r.lo, r.hi]);
          r.done();
        }
      }
    } else if (m.type === 'result') {
      const p = this.pending;
      if (!p || p.seq !== m.seq) return;
      p.parts[k] = m.partials;
      p.ms[k] = m.ms;
      this.stats = m.stats as unknown as Record<string, number>;
      if (p.parts.every((x) => x)) {
        this.pending = null;
        this.lastMs = Math.max(...p.ms);
        p.resolve(p.parts as Partial[][]);
      }
    }
  }

  /** Send the columns not yet sent, a chunk at a time between frames. */
  async send(keys: readonly string[], slow: () => boolean): Promise<void> {
    for (const key of keys) {
      if (this.have.has(key)) continue;
      const src = datasetColumn(this.ds, key);
      if (!src) continue;
      const kind = kindOf(src);
      for (let s = 0; s < this.shards.length; s++) {
        const [start, n] = this.spans[s];
        for (let off = 0; off < n; ) {
          const t0 = performance.now();
          const budget = typeof document !== 'undefined' && document.hidden ? Infinity : slow() ? FRAME_BUDGET_SLOW : FRAME_BUDGET;
          while (off < n && performance.now() - t0 < budget && this.acks[s] < IN_FLIGHT) {
            const len = Math.min(CHUNK, n - off);
            const from = (start + off) * this.stride;
            let data: ColArr;
            if (this.stride === 1) data = src.slice(from, from + len) as ColArr;
            else {
              data = new (src.constructor as { new (n: number): ColArr })(len);
              for (let i = 0; i < len; i++) data[i] = src[from + i * this.stride];
            }
            this.acks[s]++;
            this.shards[s].postMessage({ type: 'col', key, kind, off, data, last: off + len >= n } satisfies ToDashWorker, [data.buffer as ArrayBuffer]);
            off += len;
          }
          timed(t0);
          if (off < n) await new Promise<void>((r) => (this.acks[s] >= IN_FLIGHT ? this.ackWait.push(r) : setTimeout(r, 0)));
        }
      }
      this.have.add(key);
    }
  }

  /** Work a column out in every worker (time into the match, a calculated one); resolves with its range. */
  derive(key: string, node: RNode | null): Promise<void> {
    return new Promise((done) => {
      this.rangeWait.set(key, { left: this.shards.length, lo: Infinity, hi: -Infinity, done });
      for (const w of this.shards) w.postMessage({ type: 'derive', key, node } satisfies ToDashWorker);
      this.have.add(key);
    });
  }

  drop(keys: string[]): void {
    for (const k of keys) this.have.delete(k);
    for (const w of this.shards) w.postMessage({ type: 'drop', keys } satisfies ToDashWorker);
  }

  run(queries: QuerySpec[]): Promise<Partial[][]> {
    const seq = ++this.seq;
    return new Promise((resolve) => {
      this.pending = { seq, parts: this.shards.map(() => null), resolve, ms: [] };
      for (const w of this.shards) w.postMessage({ type: 'run', seq, queries } satisfies ToDashWorker);
    });
  }
}

/** A page some view shows: the window's, a document's embedded one. */
interface Watch {
  dashId: string;
  pageId: string | null;
}

type Listener = (dirty: Set<string>) => void;

export class DashClient {
  private pools = new Map<string, Pool>();
  private watches = new Map<number, Watch>();
  private watchSeq = 0;
  private listeners = new Set<Listener>();
  private engine: RenderEngine | null = null;
  private running = false;
  private again = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private playTimer: ReturnType<typeof setInterval> | null = null;
  private lastPlay = NaN;
  private unsub: (() => void)[] = [];
  private paceSlow = false;
  private watchingFrames = false;
  /** Each shown tile's data, and its plan. */
  readonly results = new Map<string, TileData>();
  readonly plans = new Map<string, TilePlan>();
  /** Catalogs by dashboard (their fields over the data). */
  readonly catalogs = new Map<string, Catalog>();
  /** When the last change came, and how long until its numbers were in, ms. */
  lastChange = 0;
  freshMs = 0;
  /** Filters this viewer's dashboards set on the view (`link.ts`): left out of the view clause. */
  owned: FilterSpec[] = [];
  stats = { runs: 0, workerMs: 0, queries: 0, plans: 0, building: false, rows: 0, stride: 1, workers: 0, slowed: 0 };

  start(engine: RenderEngine | null): void {
    if (engine) this.engine = engine;
    if (this.unsub.length) return;
    const go = () => this.schedule(0);
    this.unsub.push(
      useDash.subscribe((s, p) => {
        if (s.dashboards !== p.dashboards || s.pages !== p.pages || s.tiles !== p.tiles || s.inter !== p.inter || s.page !== p.page || s.open !== p.open || s.shown !== p.shown) go();
      }),
      useStore.subscribe((s, p) => {
        if (s.dataset !== p.dataset) {
          for (const [id, pool] of this.pools) if (id === VIEW_SOURCE) pool.stop();
          this.pools.delete(VIEW_SOURCE);
          this.results.clear();
          go();
          return;
        }
        if (s.filters !== p.filters || s.timeline !== p.timeline || s.teamVisibility !== p.teamVisibility || s.mode !== p.mode || s.team !== p.team) this.schedule(40);
      }),
      useVolumeStore.subscribe((s, p) => {
        if (s.selected !== p.selected || s.volumes !== p.volumes) this.schedule(60);
      }),
      onSourcesChanged(go),
    );
    this.playTimer = setInterval(() => this.tickPlay(), DASH_PLAY_EVERY);
  }

  stop(): void {
    for (const u of this.unsub) u();
    this.unsub = [];
    if (this.playTimer) clearInterval(this.playTimer);
    for (const p of this.pools.values()) p.stop();
    this.pools.clear();
  }

  /** A view shows a dashboard's page (null: the page the dashboard shows); returns the function that stops it. */
  watch(dashId: string, pageId: string | null = null): () => void {
    const id = ++this.watchSeq;
    this.watches.set(id, { dashId, pageId });
    this.start(null);
    this.schedule(0);
    return () => {
      this.watches.delete(id);
      this.schedule(50);
    };
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  /** Whether every shown tile has its numbers for the newest change. */
  get isIdle(): boolean {
    return !this.running && !this.again && this.timer === null;
  }

  /** The kept rows and sample stride of a source's pool (the tiles' "from a sample" note). */
  sampleOf(source: string | undefined): { rows: number; stride: number } | null {
    const p = this.pools.get(source ?? VIEW_SOURCE);
    return p ? { rows: p.rows, stride: p.stride } : null;
  }

  catalog(dash: Dashboard): Catalog | null {
    const ds = dashboardSource(dash.source).dataset();
    if (!ds) return null;
    const pool = this.pools.get(dash.source ?? VIEW_SOURCE);
    const ranges: CalcRanges = {};
    for (const c of dash.columns ?? []) {
      const r = pool?.ranges.get(`k:${c.id}`);
      if (r) ranges[c.id] = r;
    }
    const key = JSON.stringify([ds.id, ds.count, dash.columns, dash.bins, dash.hierarchies, ranges]);
    const cached = this.catalogs.get(dash.id);
    if (cached && (cached as Catalog & { _key?: string })._key === key) return cached;
    const cat = catalogOf(ds, dash, ranges) as Catalog & { _key?: string };
    cat._key = key;
    this.catalogs.set(dash.id, cat);
    return cat;
  }

  private schedule(ms: number): void {
    if (!this.lastChange || this.isIdle) this.lastChange = performance.now();
    if (this.running) {
      this.again = true;
      return;
    }
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.refresh();
    }, ms);
  }

  private playhead(): number {
    return this.engine?.live.playhead ?? useStore.getState().timeline.playhead;
  }

  private tickPlay(): void {
    const s = useStore.getState();
    if (s.timeline.mode === 'all' || !this.watches.size) return;
    const p = this.playhead();
    if (p === this.lastPlay) return;
    this.lastPlay = p;
    if (this.followsView()) this.schedule(0);
  }

  private followsView(): boolean {
    const st = useDash.getState();
    for (const w of this.watches.values()) {
      const d = st.dashboards.find((x) => x.id === w.dashId);
      if (d?.link.followView && (d.source ?? VIEW_SOURCE) === VIEW_SOURCE) return true;
    }
    return false;
  }

  /** What the 3D view adds: its rows (without the filters the dashboards set on it) and the selected volume. */
  private linkFor(dash: Dashboard, ds: Dataset): LinkInputs {
    if ((dash.source ?? VIEW_SOURCE) !== VIEW_SOURCE) return { view: null, volume: null, minutes: 0 };
    const s = useStore.getState();
    const owned = new Set(this.owned.map((f) => JSON.stringify(f)));
    const filters = owned.size ? s.filters.filter((f) => !owned.has(JSON.stringify(f))) : s.filters;
    const p = Math.floor(this.playhead() * 10) / 10;
    const sc = currentScope({ ...s, filters }, p);
    const { scope } = aggScopes(ds, sc, null);
    const vs = useVolumeStore.getState();
    const volume = vs.selected ? (vs.volumes.find((v) => v.id === vs.selected) ?? null) : null;
    const viewIsAll = sc.timeLo === -Infinity && sc.timeHi === Infinity && sc.lifetimeNow === null && !sc.filters.length && !sc.groupShown && sc.session < 0;
    return { view: dash.link.followView && !viewIsAll ? scope : null, volume, minutes: dash.link.followView ? scope.minutes : 0 };
  }

  private watchFrames(): void {
    if (this.watchingFrames || typeof requestAnimationFrame !== 'function') return;
    this.watchingFrames = true;
    const late: number[] = [];
    let last = -1;
    let lastLate = -Infinity;
    const tick = (now: number) => {
      if (!this.running && !this.stats.building) {
        this.watchingFrames = false;
        if (this.paceSlow) this.setPace(false);
        return;
      }
      if (last >= 0 && now - last > LATE_MS) {
        late.push(now);
        lastLate = now;
      }
      while (late.length && late[0] < now - 1000) late.shift();
      if (!this.paceSlow && late.length >= 2) this.setPace(true);
      else if (this.paceSlow && now - lastLate > 1500) this.setPace(false);
      last = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private setPace(slow: boolean): void {
    if (slow === this.paceSlow) return;
    this.paceSlow = slow;
    if (slow) this.stats.slowed++;
    for (const p of this.pools.values()) p.pace(slow);
  }

  private pool(source: string, ds: Dataset): Pool {
    let p = this.pools.get(source);
    if (p && p.ds !== ds) {
      p.stop();
      p = undefined;
    }
    if (!p) {
      p = new Pool(ds, rowWorkers());
      this.pools.set(source, p);
      if (this.paceSlow) p.pace(true);
    }
    return p;
  }

  /** Plan every shown tile, send what the workers lack, run, finish. */
  private async refresh(): Promise<void> {
    if (this.running) {
      this.again = true;
      return;
    }
    this.running = true;
    this.again = false;
    this.watchFrames();
    const started = this.lastChange;
    try {
      const t0 = performance.now();
      const st = useDash.getState();
      // Per source: the tiles, their plans and queries.
      const bySource = new Map<string, { ds: Dataset; items: { tile: Tile; plan: TilePlan; cat: Catalog }[]; calc: Map<string, RNode> }>();
      const live = new Set<string>();
      for (const w of this.watches.values()) {
        const dash = st.dashboards.find((d) => d.id === w.dashId);
        if (!dash) continue;
        const page = w.pageId ? st.pages.find((p) => p.id === w.pageId) : pageShown(st, dash.id);
        if (!page) continue;
        const source = dash.source ?? VIEW_SOURCE;
        const ds = dashboardSource(source).dataset();
        if (!ds) continue;
        const cat = this.catalog(dash);
        if (!cat) continue;
        let g = bySource.get(source);
        if (!g) bySource.set(source, (g = { ds, items: [], calc: new Map() }));
        for (const c of dash.columns ?? []) {
          try {
            g.calc.set(`k:${c.id}`, bindRow(c.expr, cat.schema));
          } catch {
            // Said on the tiles that read it (their measure or filter does not bind).
          }
        }
        const inter = interOf(st, dash.id, page.id);
        const link = this.linkFor(dash, ds);
        for (const tile of st.tiles) {
          if (tile.pageId !== page.id || live.has(tile.id)) continue;
          const plan = planTile(cat, dash, page, tile, inter, link);
          if (!plan) continue;
          live.add(tile.id);
          this.plans.set(tile.id, plan);
          g.items.push({ tile, plan, cat });
        }
      }
      for (const id of [...this.results.keys()]) if (!live.has(id)) this.results.delete(id);
      this.stats.plans = live.size;
      timed(t0);
      for (const [source, g] of bySource) {
        const queries = g.items.flatMap((x) => x.plan.queries);
        if (!queries.length) continue;
        const pool = this.pool(source, g.ds);
        this.stats.rows = pool.rows;
        this.stats.stride = pool.stride;
        this.stats.workers = pool.shards.length;
        const need = queryColumns(queries);
        // Derived columns: their sources first.
        const derived: string[] = [];
        for (const k of [...need]) {
          const d = derivedNeeds(k, g.calc);
          if (d) {
            derived.push(k);
            for (const x of d) need.add(x);
          }
        }
        const plain = [...need].filter((k) => !derived.includes(k) && datasetColumn(g.ds, k));
        const missing = plain.filter((k) => !pool.have.has(k));
        const newDerived = derived.filter((k) => !pool.have.has(k) || (k.startsWith('k:') && pool.calcSrc.get(k) !== JSON.stringify(g.calc.get(k))));
        if (missing.length || newDerived.length) {
          this.stats.building = true;
          this.notify(new Set());
          await pool.send(missing, () => this.paceSlow);
          const srcs = pool.calcSrc;
          await Promise.all(
            newDerived.map((k) => {
              srcs.set(k, JSON.stringify(g.calc.get(k)));
              return pool.derive(k, k === K.matchTime ? null : (g.calc.get(k) ?? null));
            }),
          );
          this.stats.building = false;
          // New ranges of calculated columns change their bins: plan again.
          if (newDerived.some((k) => k.startsWith('k:'))) {
            this.again = true;
            continue;
          }
        }
        const uniq = new Map(queries.map((q) => [q.id, q]));
        const qs = [...uniq.values()];
        const parts = await pool.run(qs);
        const t1 = performance.now();
        const merged = new Map<string, Merged>();
        qs.forEach((q, i) => merged.set(q.id, mergePartials(q, parts.map((p) => p[i]))));
        const dirty = new Set<string>();
        for (const it of g.items) {
          try {
            this.results.set(it.tile.id, finishTile(it.cat, it.tile, it.plan, merged));
          } catch (e) {
            this.results.set(it.tile.id, { kind: 'empty', message: 'dash.err.tile', values: { error: String(e) } });
          }
          dirty.add(it.tile.id);
        }
        this.stats.runs++;
        this.stats.queries = qs.length;
        this.stats.workerMs = pool.lastMs;
        timed(t1);
        if (!this.again) this.freshMs = performance.now() - started;
        this.notify(dirty);
      }
    } finally {
      this.running = false;
      this.stats.building = false;
      if (this.again) {
        this.again = false;
        this.schedule(0);
      }
    }
  }

  private pendingDirty = new Set<string>();
  private paintTimer: ReturnType<typeof setTimeout> | null = null;
  /** Tiles told of their new numbers since the last change, for the probes. */
  delivered = 0;

  /**
   * Tell the tiles their numbers changed - a few at a time, a frame's time
   * apart, so twelve tiles redrawing at once never make one long task.
   */
  private notify(dirty: Set<string>): void {
    if (!dirty.size) {
      for (const l of this.listeners) l(dirty);
      return;
    }
    for (const id of dirty) this.pendingDirty.add(id);
    if (this.paintTimer) return;
    const pump = () => {
      this.paintTimer = null;
      const batch = new Set<string>();
      for (const id of this.pendingDirty) {
        batch.add(id);
        if (batch.size >= TILES_A_FRAME) break;
      }
      for (const id of batch) this.pendingDirty.delete(id);
      this.delivered += batch.size;
      for (const l of this.listeners) l(batch);
      if (this.pendingDirty.size) this.paintTimer = setTimeout(pump, 16);
    };
    this.paintTimer = setTimeout(pump, 0);
  }

  /** Whether every tile was told of its newest numbers. */
  get painted(): boolean {
    return this.pendingDirty.size === 0 && this.paintTimer === null;
  }

  /** Every result again (a theme or language change), without counting. */
  touch(): void {
    this.notify(new Set(this.results.keys()));
  }

  /** The workers' share of the work of the last run, for the probes. */
  workerStats(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const p of this.pools.values()) Object.assign(out, p.stats);
    return out;
  }
}

export const dashClient = new DashClient();
