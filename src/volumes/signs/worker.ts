/**
 * The chart signs' worker: it keeps the rows inside each volume that has a
 * sign, and aggregates every sign's chart from them (`charts/aggregate.ts`),
 * off the main thread.
 *
 * The rows arrive once per build, a chunk at a time (`client.ts`): each
 * chunk's positions are tested against the volumes and the rows inside any
 * of them are kept once, with a bit per volume saying which hold it, and
 * just the columns the signs and the view's filters read - the dataset
 * itself is never copied whole. Past `KEEP_CAP` rows inside, every other
 * kept row is let go and each that stays stands for two (and so on), so a
 * volume round most of a huge dataset costs a bounded amount of memory and
 * is charted from an even sample of its rows. A sample of every row (one in
 * `stride`) is kept too, for "inside against outside".
 *
 * Then every scope (filters, time window, playhead) is a recompute of the
 * signs whose rows it changes, newest scope first: a window that only slid
 * forward folds in the rows it gained and out those it lost (`advanceAgg`),
 * anything else starts that sign over. A result goes back only when it
 * differs from the last one sent.
 */

import { addRows, advanceAgg, canAdvance, createAgg, finishAgg, type Agg, type AggMeta, type AggScope, type AggSource, type RowTable } from '../../charts/aggregate';
import type { ChartData, ChartSpec } from '../../charts/types';
import { compiled, compiledContains, type CompiledVolume, type Volume } from '../volume';

export interface SignJob {
  id: string;
  volumeId: string;
  spec: ChartSpec;
  upToNow: boolean;
}

export type ChunkCols = {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  time?: Float32Array;
  life?: Float32Array;
  team?: Uint16Array;
  person?: Uint32Array;
  session?: Uint32Array;
  cols: Record<string, Float32Array | Uint32Array>;
};

export type ToWorker =
  | { type: 'meta'; meta: AggMeta }
  | { type: 'build'; build: number; volumes: Volume[]; columns: string[]; stride: number; sorted: boolean; total: number }
  | { type: 'chunk'; build: number; lo: number; n: number; data: ChunkCols }
  | { type: 'built'; build: number }
  | { type: 'signs'; signs: SignJob[] }
  | { type: 'scope'; seq: number; scope: AggScope; upTo: AggScope };

export type FromWorker =
  | { type: 'ack'; build: number }
  | { type: 'ready'; build: number; rows: Record<string, number>; sample: number; kept: number; keep: number }
  | { type: 'result'; id: string; data: ChartData; seq: number; ms: number }
  | { type: 'idle'; seq: number; ms: number };

type Arr = Float32Array | Uint32Array | Uint16Array;

/** A column that grows as rows are appended. */
class Grow<T extends Arr> {
  a: T;
  n = 0;
  constructor(private readonly make: (n: number) => T) {
    this.a = make(1024);
  }
  /** Keep every other value (the even positions): the sample thinned by half. */
  halve(): void {
    const a = this.a;
    const n = this.n;
    let j = 0;
    for (let i = 0; i < n; i += 2) a[j++] = a[i];
    this.n = j;
  }
  push(v: number): void {
    if (this.n === this.a.length) {
      const b = this.make(this.a.length * 2);
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = v;
  }
  done(): T {
    return this.a.subarray(0, this.n) as T;
  }
}

interface Builder {
  n: number;
  time: Grow<Float32Array> | null;
  life: Grow<Float32Array> | null;
  team: Grow<Uint16Array> | null;
  person: Grow<Uint32Array> | null;
  session: Grow<Uint32Array> | null;
  cols: Record<string, Grow<Float32Array> | Grow<Uint32Array>>;
  xyz: Grow<Float32Array> | null;
}

/** Most rows kept inside the volumes before the kept rows are thinned to an even sample. */
export const KEEP_CAP = 16_000_000;
/** Most volumes with signs one build serves (a bit each). */
export const MAX_VOLUMES = 32;

const f32 = (n: number) => new Float32Array(n);
const u32 = (n: number) => new Uint32Array(n);
const u16 = (n: number) => new Uint16Array(n);

function builder(c: ChunkCols, columns: string[], withXyz: boolean): Builder {
  const cols: Builder['cols'] = {};
  for (const name of columns) if (c.cols[name]) cols[name] = c.cols[name] instanceof Uint32Array ? new Grow(u32) : new Grow(f32);
  return {
    n: 0,
    time: c.time ? new Grow(f32) : null,
    life: c.life ? new Grow(f32) : null,
    team: c.team ? new Grow(u16) : null,
    person: c.person ? new Grow(u32) : null,
    session: c.session ? new Grow(u32) : null,
    cols,
    xyz: withXyz ? new Grow(f32) : null,
  };
}

function append(b: Builder, c: ChunkCols, i: number): void {
  b.n++;
  b.time?.push(c.time![i]);
  b.life?.push(c.life![i]);
  b.team?.push(c.team![i]);
  b.person?.push(c.person![i]);
  b.session?.push(c.session![i]);
  for (const k in b.cols) b.cols[k].push(c.cols[k][i]);
  if (b.xyz) {
    b.xyz.push(c.x[i]);
    b.xyz.push(c.y[i]);
    b.xyz.push(c.z[i]);
  }
}

function halveAll(b: Builder): void {
  b.time?.halve();
  b.life?.halve();
  b.team?.halve();
  b.person?.halve();
  b.session?.halve();
  for (const k in b.cols) b.cols[k].halve();
  b.n = b.time?.n ?? b.team?.n ?? Math.ceil(b.n / 2);
}

function finish(b: Builder, weight: number, sorted: boolean): RowTable {
  const cols: RowTable['cols'] = {};
  for (const k in b.cols) cols[k] = b.cols[k].done();
  return { n: b.n, weight, time: b.time?.done() ?? null, life: b.life?.done() ?? null, team: b.team?.done() ?? null, person: b.person?.done() ?? null, session: b.session?.done() ?? null, cols, sorted };
}

let meta: AggMeta | null = null;
let build: {
  id: number;
  volumes: { v: Volume; c: CompiledVolume }[];
  columns: string[];
  stride: number;
  sorted: boolean;
  inside: Builder | null;
  member: Grow<Uint32Array>;
  /** Rows inside seen, and one in how many of them is kept. */
  seen: number;
  keep: number;
  sample: Builder | null;
} | null = null;
/** The rows inside any signed volume, which volumes hold each (a bit per volume), and each volume's bit. */
let inside: RowTable | null = null;
let member: Uint32Array | null = null;
let bits = new Map<string, number>();
let sample: RowTable | null = null;
let sampleXyz: Float32Array | null = null;
/** Per volume, which sampled rows are inside it (left out of "outside"). */
let sampleInside = new Map<string, Uint8Array>();

interface SignRun {
  job: SignJob;
  agg: Agg | null;
  scope: AggScope | null;
  last: string;
}
const runs = new Map<string, SignRun>();
let scope: AggScope | null = null;
let upTo: AggScope | null = null;
let seq = 0;
let queue: string[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let busy = 0;

const post = (m: FromWorker) => (self as unknown as Worker).postMessage(m);

function sourcesOf(r: SignRun): AggSource[] | null {
  const bit = bits.get(r.job.volumeId);
  if (!inside || bit === undefined) return null;
  const out: AggSource[] = [{ table: inside, side: r.job.spec.diff === 'inout' ? 0 : -1, skip: null, member, bit }];
  if (r.job.spec.diff === 'inout' && sample) out.push({ table: sample, side: 1, skip: sampleInside.get(r.job.volumeId) ?? null });
  return out;
}

/** Everything again: every sign's queued. */
function queueAll(): void {
  queue = [...runs.keys()];
  schedule();
}

function schedule(): void {
  if (timer === null) timer = setTimeout(step, 0);
}

/** One sign per step, so a newer scope (a message waiting) is read between signs. */
function step(): void {
  timer = null;
  if (!meta || !scope) return;
  const id = queue.shift();
  if (id === undefined) {
    post({ type: 'idle', seq, ms: busy });
    busy = 0;
    return;
  }
  const r = runs.get(id);
  const srcs = r ? sourcesOf(r) : null;
  if (r && srcs) {
    const t0 = performance.now();
    const sc = r.job.upToNow && upTo ? upTo : scope;
    if (r.agg && r.scope && canAdvance(r.scope, sc, srcs)) advanceAgg(r.agg, srcs, r.scope, sc);
    else {
      r.agg = createAgg(meta, r.job.spec);
      for (const s of srcs) addRows(r.agg, s, 0, s.table.n, sc, 1);
    }
    r.scope = sc;
    const data = finishAgg(r.agg, sc);
    const json = JSON.stringify(data);
    const ms = performance.now() - t0;
    busy += ms;
    if (json !== r.last) {
      r.last = json;
      post({ type: 'result', id, data, seq, ms });
    }
  }
  schedule();
}

self.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  switch (m.type) {
    case 'meta':
      meta = m.meta;
      for (const r of runs.values()) {
        r.agg = null;
        r.last = '';
      }
      break;
    case 'build':
      build = {
        id: m.build,
        volumes: m.volumes.slice(0, MAX_VOLUMES).map((v) => ({ v, c: compiled(v) })),
        columns: m.columns,
        stride: Math.max(1, m.stride),
        sorted: m.sorted,
        inside: null,
        member: new Grow(u32),
        seen: 0,
        keep: 1,
        sample: null,
      };
      break;
    case 'chunk': {
      const b = build;
      if (!b || b.id !== m.build) break;
      const c = m.data;
      if (!b.inside) b.inside = builder(c, b.columns, false);
      if (!b.sample) b.sample = builder(c, b.columns, true);
      const vols = b.volumes;
      const ins = b.inside;
      // The sample keeps every row whose index is a multiple of the stride.
      let next = Math.ceil(m.lo / b.stride) * b.stride - m.lo;
      for (let i = 0; i < m.n; i++) {
        const x = c.x[i];
        const y = c.y[i];
        const z = c.z[i];
        if (i === next) {
          append(b.sample, c, i);
          next += b.stride;
        }
        if (!(x === x && y === y && z === z)) continue;
        let bitsHere = 0;
        for (let k = 0; k < vols.length; k++) {
          const cv = vols[k].c;
          if (x < cv.min[0] || x > cv.max[0] || y < cv.min[1] || y > cv.max[1] || z < cv.min[2] || z > cv.max[2]) continue;
          if (compiledContains(cv, x, y, z)) bitsHere |= 1 << k;
        }
        if (bitsHere === 0) continue;
        if (b.seen++ % b.keep !== 0) continue;
        append(ins, c, i);
        b.member.push(bitsHere >>> 0);
        if (ins.n >= KEEP_CAP) {
          // Too many: keep every other one, each now standing for twice as many.
          halveAll(ins);
          b.member.halve();
          ins.n = b.member.n;
          b.keep *= 2;
        }
      }
      post({ type: 'ack', build: m.build });
      break;
    }
    case 'built': {
      const b = build;
      if (!b || b.id !== m.build) break;
      inside = b.inside ? finish(b.inside, b.keep, b.sorted) : { n: 0, weight: 1, time: null, life: null, team: null, person: null, session: null, cols: {}, sorted: true };
      member = b.member.done();
      bits = new Map(b.volumes.map(({ v }, k) => [v.id, (1 << k) >>> 0]));
      const rows: Record<string, number> = {};
      for (const { v } of b.volumes) {
        const bit = bits.get(v.id)!;
        let n = 0;
        for (let i = 0; i < member.length; i++) if (member[i] & bit) n++;
        rows[v.id] = n * b.keep;
      }
      sample = b.sample ? finish(b.sample, b.stride, b.sorted) : null;
      sampleXyz = b.sample?.xyz?.done() ?? null;
      sampleInside = new Map();
      if (sample && sampleXyz) {
        for (const { v, c } of b.volumes) {
          const mask = new Uint8Array(sample.n);
          for (let i = 0; i < sample.n; i++) if (compiledContains(c, sampleXyz[i * 3], sampleXyz[i * 3 + 1], sampleXyz[i * 3 + 2])) mask[i] = 1;
          sampleInside.set(v.id, mask);
        }
      }
      build = null;
      for (const r of runs.values()) r.agg = null;
      post({ type: 'ready', build: m.build, rows, sample: sample?.n ?? 0, kept: inside.n, keep: b.keep });
      queueAll();
      break;
    }
    case 'signs': {
      const keep = new Map<string, SignRun>();
      for (const job of m.signs) {
        const old = runs.get(job.id);
        const same = old && JSON.stringify(old.job) === JSON.stringify(job);
        keep.set(job.id, same ? old : { job, agg: null, scope: null, last: '' });
        if (!same && !queue.includes(job.id)) queue.push(job.id);
      }
      runs.clear();
      for (const [k, v] of keep) runs.set(k, v);
      queue = queue.filter((id) => runs.has(id));
      schedule();
      break;
    }
    case 'scope':
      scope = m.scope;
      upTo = m.upTo;
      seq = m.seq;
      queueAll();
      break;
  }
};
