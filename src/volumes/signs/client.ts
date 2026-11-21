/**
 * The main thread's side of the chart signs: what the worker (`worker.ts`)
 * is told, and what it says back.
 *
 * - A build when the data, a signed volume's shape or the columns the signs
 *   read change (after a short quiet): the rows go over a chunk at a time,
 *   copied from the dataset's columns (a native copy, no per-row script) and
 *   transferred, two chunks in flight, a pause between them so the page keeps
 *   painting.
 * - A scope when the filters, the time window, the groups or the match
 *   change, and during playback at most every `PLAY_EVERY` ms - never per
 *   frame.
 * - Results are said in the viewer's language, coloured per sign (a sign's
 *   series keep their colours), kept, and the overlay told which signs are
 *   dirty; it repaints only those, a few per frame.
 */

import type { AggMeta, AggScope } from '../../charts/aggregate';
import { colorChart, type ChartTheme } from '../../charts/palette';
import { localizeChart } from '../../charts/format';
import type { ChartData, ChartSpec } from '../../charts/types';
import { CANON, EVENT_KINDS, eventKindOf } from '../../data/canonical';
import { outcomeColumns } from '../../data/outcome';
import { PERSON_FILTER_COLUMN } from '../../render/filterTables';
import type { Engine } from '../../render/engine';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { currentScope } from '../scope';
import type { Scope } from '../stats';
import { useVolumeStore } from '../store';
import type { Volume } from '../volume';
import type { Sign } from './sign';
import { liveSigns, useSignStore } from './store';
import type { ChunkCols, FromWorker, SignJob, ToWorker } from './worker';

/** Rows a chunk. */
export const SIGN_CHUNK = 1 << 17;
const IN_FLIGHT = 2;
/** Quiet before a build, ms: a volume dragged rebuilds once it is let go. */
const BUILD_QUIET = 400;
/** Most often the scope is sent during playback, ms. */
export const PLAY_EVERY = 250;
/** Rows the sample of the whole data keeps, at most (for "inside against outside"). */
const SAMPLE_ROWS = 1_000_000;

type Listener = (dirty: Set<string>) => void;

/** The columns a spec reads. */
export function specColumns(spec: ChartSpec, meta: Pick<AggMeta, 'won' | 'event'>): string[] {
  const out = new Set<string>();
  const col = (k: string | undefined) => {
    if (k && k.startsWith('col:')) out.add(k.slice(4));
  };
  col(spec.group);
  col(spec.stack);
  if (spec.x) out.add(spec.x);
  if (spec.y) out.add(spec.y);
  if (spec.measure.column) out.add(spec.measure.column);
  if (spec.filter?.column) out.add(spec.filter.column);
  const m = spec.measure.kind;
  if (meta.won && (spec.diff === 'outcome' || m === 'winShare' || spec.kind === 'tiles' || spec.filter?.outcome)) out.add(meta.won);
  if (meta.event && (m === 'kd' || spec.kind === 'tiles')) out.add(meta.event);
  return [...out];
}

/** What the aggregation knows of a dataset. */
export function metaOf(ds: Dataset): AggMeta {
  const won = outcomeColumns(ds).round;
  const ev = ds.attrs.find((a) => a.name === CANON.event && a.kind === 'category');
  const kinds = ev?.categories?.map((c) => (EVENT_KINDS as readonly string[]).includes(c) ? c : eventKindOf(c)) ?? [];
  let span = 0;
  if (ds.sessionStart && ds.sessionEnd) for (let s = 0; s < ds.sessionStart.length; s++) span = Math.max(span, ds.sessionEnd[s] - ds.sessionStart[s]);
  return {
    teams: ds.teamId ? ds.teamLabels.slice() : [],
    persons: ds.personId ? ds.personLabels.slice() : [],
    sessions: ds.sessionId ? ds.sessionLabels.slice() : [],
    sessionStart: ds.sessionId && ds.sessionStart ? Array.from(ds.sessionStart) : null,
    timeRange: [ds.timeRange[0], ds.timeRange[1]],
    matchSpan: span > 0 ? span : Math.max(1, ds.timeRange[1] - ds.timeRange[0]),
    columns: ds.attrs.map((a) => ({ name: a.name, kind: a.kind === 'category' ? 'category' : 'number', labels: a.categories?.slice(), min: a.min, max: a.max })),
    won: won ? won.name : null,
    event: ev ? ev.name : null,
    kill: kinds.flatMap((k, i) => (k === 'kill' ? [i] : [])),
    death: kinds.flatMap((k, i) => (k === 'death' || k === 'destroyed' ? [i] : [])),
  };
}

/** Minutes of data time a window shows: summed over the matches it overlaps, else its span within the data. */
export function windowMinutes(ds: Dataset, lo: number, hi: number, session: number): number {
  const a = Math.max(lo, ds.timeRange[0]);
  const b = Math.min(hi, ds.timeRange[1]);
  if (ds.sessionStart && ds.sessionEnd && ds.sessionStart.length > 0) {
    let s = 0;
    for (let k = 0; k < ds.sessionStart.length; k++) {
      if (session >= 0 && k !== session) continue;
      s += Math.max(0, Math.min(b, ds.sessionEnd[k]) - Math.max(a, ds.sessionStart[k]));
    }
    return s / 60;
  }
  return Math.max(0, b - a) / 60;
}

/** The scope as the aggregation takes it, and the same up to the playhead (`upToNow` signs). */
export function aggScopes(ds: Dataset, sc: Scope, playhead: number | null): { scope: AggScope; upTo: AggScope } {
  const key = [sc.defaultLifetime, sc.lifetimeNow !== null ? 'L' : 'W', sc.filters.map((f) => f.key).join(';'), sc.groupShown ? Array.from(sc.groupShown).join('') : '', sc.session].join('|');
  const lo = sc.lifetimeNow !== null ? sc.lifetimeNow - sc.defaultLifetime : sc.timeLo;
  const hi = sc.lifetimeNow !== null ? sc.lifetimeNow : sc.timeHi;
  const scope: AggScope = { ...sc, minutes: windowMinutes(ds, lo, hi, sc.session), key };
  if (playhead === null || hi === Infinity) return { scope, upTo: scope };
  const upTo: AggScope = { ...scope, timeLo: -Infinity, timeHi: playhead, lifetimeNow: null, minutes: windowMinutes(ds, -Infinity, playhead, sc.session), key: key.replace('|L|', '|W|') };
  return { scope, upTo };
}

class SignClient {
  private worker: Worker | null = null;
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
  /** Progress of a build, 0-1; null when none runs. */
  progress: number | null = null;
  /** Worker milliseconds of the last scope's recompute, and results received. */
  stats = { workerMs: 0, results: 0, builds: 0, scopes: 0 };

  start(engine: Engine | null): void {
    this.engine = engine;
    if (this.worker) return;
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e: MessageEvent<FromWorker>) => this.onMessage(e.data);
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
    this.worker?.terminate();
    this.worker = null;
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

  private post(m: ToWorker, transfer: Transferable[] = []): void {
    this.worker?.postMessage(m, transfer);
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
    const key = JSON.stringify([ds.id, ds.count, vols.map((v) => [v.id, v.shape]), columns]);
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
      this.buildTimer = setTimeout(() => this.build(ds, vols, columns, jobs), this.stats.builds > 0 ? BUILD_QUIET : 30);
      return;
    }
    if (this.ready) this.post({ type: 'signs', signs: jobs });
    // Signs gone: their results go too.
    for (const id of [...this.raw.keys()]) if (!jobs.some((j) => j.id === id)) {
      this.raw.delete(id);
      this.results.delete(id);
    }
  }

  private build(ds: Dataset, vols: Volume[], columns: string[], jobs: SignJob[]): void {
    const id = ++this.buildId;
    this.building = true;
    this.stats.builds++;
    this.notify();
    const stride = Math.max(1, Math.ceil(ds.count / SAMPLE_ROWS));
    this.post({ type: 'build', build: id, volumes: vols, columns, stride, sorted: !!ds.time && ds.timeSorted, total: ds.count });
    let next = 0;
    let inFlight = 0;
    this.progress = 0;
    const attrs = columns.map((c) => [c, ds.attrs.find((a) => a.name === c)!.data] as const);
    const pump = () => {
      if (id !== this.buildId || this.ds !== ds) return;
      while (inFlight < IN_FLIGHT && next < ds.count) {
        const n = Math.min(SIGN_CHUNK, ds.count - next);
        const lo = next;
        const hi = lo + n;
        const transfer: ArrayBuffer[] = [];
        const cut = <T extends Float32Array | Uint32Array | Uint16Array>(a: T | null): T | undefined => {
          if (!a) return undefined;
          const c = a.slice(lo, hi) as T;
          transfer.push(c.buffer as ArrayBuffer);
          return c;
        };
        const cols: ChunkCols['cols'] = {};
        for (const [name, data] of attrs) cols[name] = cut(data)!;
        const data: ChunkCols = { x: cut(ds.px)!, y: cut(ds.py)!, z: cut(ds.pz)!, time: cut(ds.time), life: cut(ds.lifetime), team: cut(ds.teamId), person: cut(ds.personId), session: cut(ds.sessionId), cols };
        this.post({ type: 'chunk', build: id, lo, n, data }, transfer);
        next = hi;
        inFlight++;
      }
      if (next >= ds.count && inFlight === 0) {
        this.post({ type: 'built', build: id });
        this.post({ type: 'signs', signs: jobs });
        this.progress = null;
        return;
      }
    };
    this.onAck = (b) => {
      if (b !== id) return;
      inFlight--;
      this.progress = ds.count > 0 ? Math.min(1, next / ds.count) : 1;
      // A pause between chunks: the copy is a native one, but not on every frame.
      setTimeout(pump, 0);
    };
    pump();
  }

  private onAck: ((build: number) => void) | null = null;

  private onMessage(m: FromWorker): void {
    if (m.type === 'ack') this.onAck?.(m.build);
    else if (m.type === 'ready') {
      if (m.build !== this.buildId) return;
      this.building = false;
      this.ready = true;
      this.notify();
      this.rowsInside = m.rows;
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
    } else if (m.type === 'idle') this.stats.workerMs = m.ms;
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

  get isBuilding(): boolean {
    return this.building;
  }
}

export const signClient = new SignClient();
