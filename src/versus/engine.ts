/**
 * The Compare panel's pass: groups x statistics (x a second dimension) over
 * the rows the view shows, inside a region, folded chunk by chunk.
 *
 * Free of threads and of the dataset: `run.ts` copies the columns a request
 * reads off the dataset a chunk at a time and feeds them here, in a worker
 * (`worker.ts`) or on the calling thread for the tests. Rows come in time
 * order, so tracks (distance, speed) are followed across chunks.
 *
 * A row lands in cells: each region slot it is in (the whole map, the union
 * of the volumes, or each volume), each group whose filter it passes and the
 * place's "All" group, its split value and the split's total, its dimension
 * value (a time bin, a round, a match, a category) and the dimension's total.
 * Each cell keeps every aggregate the statistics need; the statistics are
 * worked out from them at the end, with intervals by a Poisson bootstrap over
 * the matches (or the players), the same weights for every group so a
 * difference between two groups is a paired one.
 */

import { rowShown, type CompareChunk, type CompareScope } from '../volumes/compare';
import { compiled, compiledContains, type CompiledVolume, type Volume } from '../volumes/volume';
import { compare, type AggSpec, type RNode, type VNode } from './expr';

/** Keys of the columns the pass works out itself (`engine.ts`), beside the dataset's. */
export const K = {
  x: '@x',
  y: '@y',
  z: '@z',
  time: '@time',
  life: '@life',
  person: '@person',
  team: '@team',
  session: '@session',
  matchTime: '@matchTime',
  dwell: '@dwell',
  step: '@step',
  speed: '@speed',
} as const;

/** A split or a dimension by a column's values, kept as they turn up; the top ones shown, the rest as "other". */
export interface LazyKeys {
  kind: 'lazy';
  key: string;
  /** Category labels, or null for a number column (its values are the keys). */
  labels: string[] | null;
  /** Shown at most; the rest fold into "other". */
  top: number;
  /** Order shown: by rows (most first) or by key (rounds, matches, days). */
  order: 'count' | 'key';
  /** Days: the key is floor((epochSeconds + value) / 86400). */
  epoch?: number;
}

/** A dimension by bins of a number. */
export interface Bins {
  kind: 'bins';
  key: string;
  lo: number;
  hi: number;
  n: number;
}

export interface Request {
  scope: CompareScope;
  region: { mode: 'all' | 'union' | 'separate'; volumes: Volume[] };
  groups: { filter: RNode | null }[];
  split: LazyKeys | null;
  dim: LazyKeys | Bins | null;
  aggs: AggSpec[];
  /** The statistics, over `aggs`. */
  metrics: VNode[];
  /** The reference group differences are taken from. */
  ref: number;
  meta: Meta;
}

export interface Meta {
  persons: number;
  sessions: number;
  sessionStart: Float32Array | null;
  t0: number;
  dwellCap: number;
  personShared: Uint8Array | null;
  /** Category index -> 1 for a movement sample, on the event column (`eventKey`); null: every row moves. */
  moving: Uint8Array | null;
  eventKey: string | null;
  /** Win rate: the won and round columns, and rounds per match. */
  wonKey: string | null;
  roundKey: string | null;
  rounds: number;
  /** Bootstrap clusters: matches, else players, else none. */
  cluster: 'session' | 'person' | null;
  /** The computed columns asked for. */
  computed: { matchTime: boolean; dwell: boolean; step: boolean; speed: boolean };
  /** Resamples for the intervals (0 for none). */
  resamples?: number;
}

/** A slice of the columns, by key. */
export interface Chunk {
  n: number;
  cols: Record<string, Float32Array | Uint32Array | Uint16Array | null>;
  /** One per scope filter (`CompareChunk.filt`). */
  filt: (ArrayLike<number> | null)[];
}

const BUCKETS = 64;
const RESERVOIR = 4096;
const OTHER = -2;

// ---------------------------------------------------------------------------
// Row expressions as closures

type Fn = (j: number) => number;

function num(a: Float32Array | Uint32Array | Uint16Array | null | undefined): Fn {
  if (!a) return () => NaN;
  return (j) => a[j];
}

export function compileRow(n: RNode, cols: Chunk['cols']): Fn {
  switch (n.k) {
    case 'num': {
      const v = n.v;
      return () => v;
    }
    case 'col':
      return num(cols[n.c]);
    case 'map': {
      const a = cols[n.c];
      const t = n.table;
      if (!a) return () => -1;
      return (j) => t[a[j]] ?? -1;
    }
    case 'mask': {
      const f = compileRow(n.a, cols);
      const m = n.mask;
      return (j) => m[f(j)] ?? 0;
    }
    case 'un': {
      const f = compileRow(n.a, cols);
      return n.op === '-' ? (j) => -f(j) : (j) => (f(j) ? 0 : 1);
    }
    case 'bin': {
      const a = compileRow(n.a, cols);
      const b = compileRow(n.b, cols);
      switch (n.op) {
        case 'and': return (j) => (a(j) && b(j) ? 1 : 0);
        case 'or': return (j) => (a(j) || b(j) ? 1 : 0);
        case '+': return (j) => a(j) + b(j);
        case '-': return (j) => a(j) - b(j);
        case '*': return (j) => a(j) * b(j);
        case '/': return (j) => a(j) / b(j);
        case '%': return (j) => a(j) % b(j);
        case '==': return (j) => (a(j) === b(j) ? 1 : 0);
        case '!=': return (j) => (a(j) !== b(j) ? 1 : 0);
        case '<': return (j) => (a(j) < b(j) ? 1 : 0);
        case '<=': return (j) => (a(j) <= b(j) ? 1 : 0);
        case '>': return (j) => (a(j) > b(j) ? 1 : 0);
        default: return (j) => (a(j) >= b(j) ? 1 : 0);
      }
    }
    case 'fn': {
      const fs = n.args.map((x) => compileRow(x, cols));
      const scalar = scalarFn(n.fn);
      if (fs.length === 1) {
        const f = fs[0];
        return (j) => scalar([f(j)]);
      }
      return (j) => scalar(fs.map((f) => f(j)));
    }
  }
}

function scalarFn(fn: string): (xs: number[]) => number {
  switch (fn) {
    case 'abs': return (x) => Math.abs(x[0]);
    case 'sqrt': return (x) => Math.sqrt(x[0]);
    case 'log': return (x) => Math.log(x[0]);
    case 'log10': return (x) => Math.log10(x[0]);
    case 'exp': return (x) => Math.exp(x[0]);
    case 'round': return (x) => Math.round(x[0]);
    case 'floor': return (x) => Math.floor(x[0]);
    case 'ceil': return (x) => Math.ceil(x[0]);
    case 'sign': return (x) => Math.sign(x[0]);
    case 'min': return (x) => Math.min(...x);
    case 'max': return (x) => Math.max(...x);
    case 'hypot': return (x) => Math.hypot(...x);
    case 'pow': return (x) => Math.pow(x[0], x[1]);
    case 'clamp': return (x) => Math.min(x[2], Math.max(x[1], x[0]));
    case 'if': return (x) => (x[0] ? x[1] : x[2]);
    default: return () => NaN;
  }
}

/** A statistic from its aggregates' values; `all` gives the place's values for shrink and ofAll. */
export function evalValue(n: VNode, agg: (i: number) => number, all: ((n: VNode) => number) | null): number {
  switch (n.k) {
    case 'num': return n.v;
    case 'agg': return agg(n.i);
    case 'un': {
      const a = evalValue(n.a, agg, all);
      return n.op === '-' ? -a : a ? 0 : 1;
    }
    case 'bin': {
      const a = evalValue(n.a, agg, all);
      const b = evalValue(n.b, agg, all);
      switch (n.op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b === 0 ? NaN : a / b;
        case '%': return a % b;
        case 'and': return a && b ? 1 : 0;
        case 'or': return a || b ? 1 : 0;
        default: return compare(n.op, a, b) ? 1 : 0;
      }
    }
    case 'fn': return scalarFn(n.fn)(n.args.map((x) => evalValue(x, agg, all)));
    case 'shrink': {
      const a = evalValue(n.num, agg, all);
      const b = evalValue(n.den, agg, all);
      if (!(a + b > 0)) return NaN;
      const r0 = all ? all({ k: 'bin', op: '/', a: n.num, b: n.den }) : NaN;
      return (a + n.m * (Number.isFinite(r0) ? r0 : 1)) / (b + n.m);
    }
    case 'ofAll': {
      const a = evalValue(n.a, agg, all);
      const b = all ? all(n.a) : NaN;
      return b === 0 ? NaN : a / b;
    }
  }
}

/** The aggregates a statistic reads. */
export function aggsOf(n: VNode, out = new Set<number>()): Set<number> {
  switch (n.k) {
    case 'agg': out.add(n.i); break;
    case 'un': aggsOf(n.a, out); break;
    case 'bin': aggsOf(n.a, out); aggsOf(n.b, out); break;
    case 'fn': n.args.forEach((x) => aggsOf(x, out)); break;
    case 'shrink': aggsOf(n.num, out); aggsOf(n.den, out); break;
    case 'ofAll': aggsOf(n.a, out); break;
  }
  return out;
}

/** Parts an aggregate keeps per bootstrap bucket (0: it cannot be resampled that way). */
function partsOf(fn: AggSpec['fn']): number {
  switch (fn) {
    case 'count':
    case 'sum':
    case 'presence':
      return 1;
    case 'avg':
      return 2;
    case 'stdev':
      return 3;
    case 'winRate':
    case 'wins':
    case 'played':
      return 2;
    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Keys of a split or a dimension

class Keyer {
  /** Category index (or number key) -> slot + 1. */
  table: Int32Array | null;
  map = new Map<number, number>();
  keys: number[] = [];
  constructor(
    readonly spec: LazyKeys,
    readonly cap: number,
  ) {
    this.table = spec.labels && spec.labels.length <= 1 << 22 ? new Int32Array(spec.labels.length) : null;
  }
  /** Slot of a value, `cap` for one past the capacity, -1 for none. */
  slot(v: number): number {
    if (!(v === v)) return -1;
    let k = v;
    if (this.spec.epoch !== undefined) k = Math.floor((this.spec.epoch + v) / 86400);
    else if (!this.spec.labels) k = Math.round(v * 1000) / 1000;
    if (this.table && k >= 0 && k < this.table.length) {
      const s = this.table[k];
      if (s) return s - 1;
    } else {
      const s = this.map.get(k);
      if (s !== undefined) return s;
    }
    if (this.keys.length >= this.cap) return this.cap;
    const s = this.keys.push(k) - 1;
    if (this.table && k >= 0 && k < this.table.length) this.table[k] = s + 1;
    else this.map.set(k, s);
    return s;
  }
  label(k: number): string {
    if (this.spec.epoch !== undefined) return new Date(k * 86400000).toISOString().slice(0, 10);
    return this.spec.labels ? (this.spec.labels[k] ?? String(k)) : String(k);
  }
}

// ---------------------------------------------------------------------------
// The job

interface AggState {
  spec: AggSpec;
  parts: number;
  n: Float64Array | null;
  s: Float64Array | null;
  s2: Float64Array | null;
  mn: Float64Array | null;
  mx: Float64Array | null;
  res: (Float32Array | null)[] | null;
  seen: Float64Array | null;
  bits: (Uint8Array | null)[] | null;
  sets: (Set<number | string> | null)[] | null;
  cnt: Float64Array | null;
  inst: (Set<number> | null)[] | null;
  /** Per total-dimension cell and bucket, `parts` values. */
  boot: Float64Array | null;
}

export interface Job {
  req: Request;
  V: number;
  G: number;
  /** Split slots: kept keys up to `scap`, then other, then the total. */
  scap: number;
  SS: number;
  dcap: number;
  DD: number;
  cells: number;
  vols: CompiledVolume[];
  split: Keyer | null;
  dim: Keyer | null;
  aggs: AggState[];
  rows: Float64Array;
  /** Per cell and bucket: rows, for the clusters a cell has. */
  bucketRows: Uint32Array;
  shownRows: number;
  /** The global "everything shown" cell is the last. */
  instWon: Map<number, number>;
  lastPos: { x: Float32Array; y: Float32Array; z: Float32Array; t: Float32Array; s: Int32Array } | null;
  rng: () => number;
}

function rngOf(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createJob(req: Request): Job {
  const V = req.region.mode === 'separate' ? Math.max(1, req.region.volumes.length) : 1;
  const G = req.groups.length + 1;
  const nAgg = req.aggs.length;
  // Room for the split and dimension slots within a memory budget.
  const budget = 2_000_000 / Math.max(1, nAgg);
  let dcap = req.dim ? (req.dim.kind === 'bins' ? req.dim.n : Math.min(256, Math.max(8, req.dim.top * 4))) : 0;
  let scap = req.split ? Math.min(256, Math.max(8, req.split.top * 4)) : 0;
  const fit = () => V * G * (scap ? scap + 2 : 1) * (dcap ? dcap + 2 : 1) <= budget;
  while (!fit() && (scap > 8 || (req.dim?.kind === 'lazy' && dcap > 8))) {
    if (scap > 8) scap = Math.max(8, scap >> 1);
    if (!fit() && req.dim?.kind === 'lazy' && dcap > 8) dcap = Math.max(8, dcap >> 1);
  }
  const SS = scap ? scap + 2 : 1;
  const DD = dcap ? dcap + 2 : 1;
  const cells = V * G * SS * DD + 1;
  const totals = V * G * SS + 1;
  const B = req.meta.cluster ? BUCKETS : 0;
  const aggs: AggState[] = req.aggs.map((spec) => {
    const f = spec.fn;
    const parts = B ? partsOf(f) : 0;
    const mk = (on: boolean, fill = 0) => (on ? new Float64Array(cells).fill(fill) : null);
    const single = f === 'distinct' && spec.parts!.length === 1 && (spec.sizes![0] ?? 0) > 0 && spec.sizes![0] <= 1 << 22;
    return {
      spec,
      parts,
      n: mk(f === 'count' || f === 'avg' || f === 'stdev' || f === 'presence' || f === 'sum'),
      s: mk(f === 'sum' || f === 'avg' || f === 'stdev' || f === 'presence'),
      s2: mk(f === 'stdev'),
      mn: mk(f === 'min', Infinity),
      mx: mk(f === 'max', -Infinity),
      res: f === 'median' || f === 'percentile' ? new Array(cells).fill(null) : null,
      seen: mk(f === 'median' || f === 'percentile'),
      bits: single ? new Array(cells).fill(null) : null,
      sets: f === 'distinct' && !single ? new Array(cells).fill(null) : null,
      cnt: mk(f === 'distinct'),
      inst: f === 'winRate' || f === 'wins' || f === 'played' ? new Array(cells).fill(null) : null,
      boot: parts ? new Float64Array(totals * B * parts) : null,
    };
  });
  const P = req.meta.persons;
  const track = (req.meta.computed.step || req.meta.computed.speed) && P > 0;
  return {
    req,
    V,
    G,
    scap,
    SS,
    dcap,
    DD,
    cells,
    vols: req.region.mode === 'all' ? [] : req.region.volumes.map((v) => compiled(v)),
    split: req.split ? new Keyer(req.split, scap) : null,
    dim: req.dim && req.dim.kind === 'lazy' ? new Keyer(req.dim, dcap) : null,
    aggs,
    rows: new Float64Array(cells),
    bucketRows: new Uint32Array(B ? totals * B : 0),
    shownRows: 0,
    instWon: new Map(),
    lastPos: track
      ? { x: new Float32Array(P), y: new Float32Array(P), z: new Float32Array(P), t: new Float32Array(P).fill(NaN), s: new Int32Array(P).fill(-1) }
      : null,
    rng: rngOf(0x5eed),
  };
}

/** Cell index: region slot, group, split slot, dimension slot. */
function cellOf(job: Job, v: number, g: number, s: number, d: number): number {
  return ((v * job.G + g) * job.SS + s) * job.DD + d;
}

/** The total-dimension cell's index among the totals (for the bootstrap). */
function totalOf(job: Job, v: number, g: number, s: number): number {
  return (v * job.G + g) * job.SS + s;
}

/** Work out the computed columns of a chunk in place. */
function computeColumns(job: Job, ch: Chunk): void {
  const { meta } = job.req;
  const c = ch.cols;
  const n = ch.n;
  const time = c[K.time] as Float32Array | null;
  const session = c[K.session] as Uint32Array | null;
  if (meta.computed.matchTime && time) {
    const out = new Float32Array(n);
    for (let j = 0; j < n; j++) {
      const s = session ? session[j] : -1;
      const t0 = s >= 0 && meta.sessionStart && s < meta.sessionStart.length ? meta.sessionStart[s] : meta.t0;
      out[j] = time[j] - t0;
    }
    c[K.matchTime] = out;
  }
  if (meta.computed.dwell) {
    const life = c[K.life] as Float32Array | null;
    const out = new Float32Array(n);
    const cap = meta.dwellCap;
    if (life) for (let j = 0; j < n; j++) {
      const l = life[j];
      out[j] = l > 0 ? (l < cap ? l : cap) : 0;
    }
    c[K.dwell] = out;
  }
  const lp = job.lastPos;
  if (lp && time) {
    const person = c[K.person] as Uint32Array | null;
    const px = c[K.x] as Float32Array;
    const py = c[K.y] as Float32Array;
    const pz = c[K.z] as Float32Array;
    const ev = meta.eventKey ? (c[meta.eventKey] as Uint32Array | null) : null;
    const step = new Float32Array(n);
    const speed = new Float32Array(n).fill(NaN);
    const gapMax = Number.isFinite(meta.dwellCap) ? Math.max(meta.dwellCap, 1) : 30;
    for (let j = 0; j < n; j++) {
      const p = person ? person[j] : -1;
      if (p < 0 || p >= lp.t.length || (meta.personShared && meta.personShared[p])) continue;
      if (meta.moving && ev && !meta.moving[ev[j]]) continue;
      const s = session ? session[j] : 0;
      const x = px[j];
      const y = py[j];
      const z = pz[j];
      const t = time[j];
      if (lp.s[p] === s && lp.t[p] === lp.t[p]) {
        const dt = t - lp.t[p];
        if (dt > 0 && dt <= gapMax) {
          const d = Math.hypot(x - lp.x[p], y - lp.y[p], z - lp.z[p]);
          step[j] = d;
          speed[j] = d / dt;
        }
      }
      lp.x[p] = x;
      lp.y[p] = y;
      lp.z[p] = z;
      lp.t[p] = t;
      lp.s[p] = s;
    }
    c[K.step] = step;
    c[K.speed] = speed;
  }
}

/** Fold one chunk. */
export function stepJob(job: Job, ch: Chunk): void {
  const { req } = job;
  const { meta } = req;
  computeColumns(job, ch);
  const c = ch.cols;
  const px = c[K.x] as Float32Array;
  const py = c[K.y] as Float32Array;
  const pz = c[K.z] as Float32Array;
  const shownCh = {
    time: (c[K.time] as Float32Array | null) ?? null,
    life: (c[K.life] as Float32Array | null) ?? null,
    session: (c[K.session] as Uint32Array | null) ?? null,
    team: (c[K.team] as Uint16Array | null) ?? null,
    filt: ch.filt,
  } as unknown as CompareChunk;
  const groups = req.groups.map((g) => (g.filter ? compileRow(g.filter, c) : null));
  const aggFilter = job.aggs.map((a) => (a.spec.filter ? compileRow(a.spec.filter, c) : null));
  const aggValue = job.aggs.map((a) => (a.spec.value ? compileRow(a.spec.value, c) : null));
  const aggParts = job.aggs.map((a) => (a.spec.parts ? a.spec.parts.map((p) => compileRow(p, c)) : null));
  const splitCol = req.split ? c[req.split.key] : null;
  const dimCol = req.dim ? c[req.dim.key] : null;
  const dwell = c[K.dwell] as Float32Array | null;
  const won = meta.wonKey ? (c[meta.wonKey] as Float32Array | null) : null;
  const round = meta.roundKey ? (c[meta.roundKey] as Float32Array | Uint32Array | null) : null;
  const person = c[K.person] as Uint32Array | null;
  const team = c[K.team] as Uint16Array | null;
  const session = c[K.session] as Uint32Array | null;
  const clusterCol = meta.cluster === 'session' ? session : meta.cluster === 'person' ? person : null;
  const B = clusterCol ? BUCKETS : 0;
  const nv = job.vols.length;
  const mode = req.region.mode;
  const V = job.V;
  const G = job.G;
  const regions = new Int32Array(Math.max(1, V));
  const gl = new Int32Array(G);
  const nA = job.aggs.length;
  const pass = new Uint8Array(nA);
  const val = new Float64Array(nA);
  const R = Math.max(1, meta.rounds);
  const P = meta.persons;
  const W = P + 65536;
  const gcell = job.cells - 1;
  const dimSpec = req.dim;
  const binScale = dimSpec && dimSpec.kind === 'bins' ? dimSpec.n / Math.max(1e-12, dimSpec.hi - dimSpec.lo) : 0;
  for (let j = 0; j < ch.n; j++) {
    const x = px[j];
    const y = py[j];
    const z = pz[j];
    if (!(x === x && y === y && z === z) || !rowShown(req.scope, shownCh, j)) continue;
    job.shownRows++;
    // Region slots.
    let nr = 0;
    if (mode === 'all') regions[nr++] = 0;
    else {
      for (let a = 0; a < nv; a++) {
        const cv = job.vols[a];
        if (compiledContains(cv, x, y, z)) {
          if (mode === 'union') {
            regions[nr++] = 0;
            break;
          }
          regions[nr++] = a;
        }
      }
    }
    // The per-aggregate pass and value, once a row.
    for (let a = 0; a < nA; a++) {
      const f = aggFilter[a];
      pass[a] = !f || f(j) ? 1 : 0;
      const vf = aggValue[a];
      val[a] = vf ? vf(j) : 1;
    }
    // Win rate: the row's round instance, its result kept the first time.
    let inst = -1;
    if (won) {
      const w = won[j];
      if (w === w) {
        const who = person ? person[j] : (team ? team[j] : 0) + P;
        const sess = session ? session[j] : 0;
        const rd = round ? Math.max(0, Math.min(R - 1, Math.trunc(round[j]) || 0)) : 0;
        inst = (sess * R + rd) * W + who;
        if (!job.instWon.has(inst)) job.instWon.set(inst, w >= 0.5 ? 1 : 0);
      }
    }
    const bucket = B ? hashBucket(clusterCol![j]) : -1;
    const dw = dwell ? dwell[j] : 0;
    // Everything shown.
    fold(job, gcell, -1, -1, j, pass, val, aggParts, dw, inst);
    if (nr === 0) continue;
    let ng = 0;
    for (let g = 0; g < G - 1; g++) {
      const f = groups[g];
      if (!f || f(j)) gl[ng++] = g;
    }
    gl[ng++] = G - 1;
    const ss = job.split ? job.split.slot(splitCol ? splitCol[j] : NaN) : -1;
    let dd = -1;
    if (dimSpec && dimCol) {
      if (dimSpec.kind === 'bins') {
        const v = dimCol[j];
        if (v === v) {
          const b = Math.floor((v - dimSpec.lo) * binScale);
          dd = b < 0 ? 0 : b >= dimSpec.n ? dimSpec.n - 1 : b;
        }
      } else dd = job.dim!.slot(dimCol[j]);
    }
    const sTot = job.SS - 1;
    const dTot = job.DD - 1;
    for (let r = 0; r < nr; r++) {
      const v = regions[r];
      for (let q = 0; q < ng; q++) {
        const g = gl[q];
        for (let si = 0; si < 2; si++) {
          const s = si === 0 ? sTot : ss;
          if (s < 0 || (si === 1 && s === sTot)) continue;
          const tot = totalOf(job, v, g, s);
          fold(job, cellOf(job, v, g, s, dTot), tot, bucket, j, pass, val, aggParts, dw, inst);
          if (dd >= 0) fold(job, cellOf(job, v, g, s, dd), -1, -1, j, pass, val, aggParts, dw, inst);
        }
      }
    }
  }
}

function hashBucket(c: number): number {
  return (Math.imul(c + 1, 2654435761) >>> 0) % BUCKETS;
}

function fold(
  job: Job,
  cell: number,
  tot: number,
  bucket: number,
  j: number,
  pass: Uint8Array,
  val: Float64Array,
  parts: ((j: number) => number)[][] | (((j: number) => number)[] | null)[],
  dwell: number,
  inst: number,
): void {
  job.rows[cell]++;
  if (tot >= 0 && bucket >= 0) job.bucketRows[tot * BUCKETS + bucket]++;
  const aggs = job.aggs;
  for (let a = 0; a < aggs.length; a++) {
    if (!pass[a]) continue;
    const st = aggs[a];
    const f = st.spec.fn;
    const v = val[a];
    let b0 = -1;
    if (st.boot && tot >= 0 && bucket >= 0) b0 = (tot * BUCKETS + bucket) * st.parts;
    switch (f) {
      case 'count':
        st.n![cell]++;
        if (b0 >= 0) st.boot![b0]++;
        break;
      case 'presence':
        st.n![cell]++;
        st.s![cell] += dwell;
        if (b0 >= 0) st.boot![b0] += dwell;
        break;
      case 'sum':
      case 'avg':
      case 'stdev':
        if (!(v === v)) break;
        st.n![cell]++;
        st.s![cell] += v;
        if (st.s2) st.s2[cell] += v * v;
        if (b0 >= 0) {
          if (f === 'sum') st.boot![b0] += v;
          else {
            st.boot![b0] += 1;
            st.boot![b0 + 1] += v;
            if (f === 'stdev') st.boot![b0 + 2] += v * v;
          }
        }
        break;
      case 'min':
        if (v < st.mn![cell]) st.mn![cell] = v;
        break;
      case 'max':
        if (v > st.mx![cell]) st.mx![cell] = v;
        break;
      case 'median':
      case 'percentile': {
        if (!(v === v)) break;
        const seen = ++st.seen![cell];
        let r = st.res![cell];
        if (!r) r = st.res![cell] = new Float32Array(RESERVOIR);
        if (seen <= RESERVOIR) r[seen - 1] = v;
        else {
          const k = Math.floor(job.rng() * seen);
          if (k < RESERVOIR) r[k] = v;
        }
        break;
      }
      case 'distinct': {
        const ps = parts[a]!;
        if (st.bits) {
          const k = ps[0](j);
          if (!(k >= 0)) break;
          let bm = st.bits[cell];
          if (!bm) bm = st.bits[cell] = new Uint8Array(st.spec.sizes![0]);
          if (!bm[k]) {
            bm[k] = 1;
            st.cnt![cell]++;
          }
        } else {
          let key: number | string;
          if (ps.length === 1) key = ps[0](j);
          else {
            const sizes = st.spec.sizes!;
            let mixed = 0;
            let ok = true;
            for (let i = 0; i < ps.length; i++) {
              if (!(sizes[i] > 0)) ok = false;
              mixed = mixed * (sizes[i] || 1) + ps[i](j);
            }
            key = ok && mixed < Number.MAX_SAFE_INTEGER ? mixed : ps.map((p) => p(j)).join('|');
          }
          if (typeof key === 'number' && !(key === key)) break;
          let set = st.sets![cell];
          if (!set) set = st.sets![cell] = new Set();
          const before = set.size;
          set.add(key);
          if (set.size !== before) st.cnt![cell]++;
        }
        break;
      }
      case 'winRate':
      case 'wins':
      case 'played': {
        if (inst < 0) break;
        let set = st.inst![cell];
        if (!set) set = st.inst![cell] = new Set();
        set.add(inst);
        break;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Merging slots into "other"

function mergeCell(job: Job, dst: number, src: number): void {
  job.rows[dst] += job.rows[src];
  for (const st of job.aggs) {
    if (st.n) st.n[dst] += st.n[src];
    if (st.s) st.s[dst] += st.s[src];
    if (st.s2) st.s2[dst] += st.s2[src];
    if (st.mn) st.mn[dst] = Math.min(st.mn[dst], st.mn[src]);
    if (st.mx) st.mx[dst] = Math.max(st.mx[dst], st.mx[src]);
    if (st.res && st.res[src]) {
      const a = st.res[src]!;
      const na = Math.min(RESERVOIR, st.seen![src]);
      for (let i = 0; i < na; i++) {
        const seen = ++st.seen![dst];
        let r = st.res[dst];
        if (!r) r = st.res[dst] = new Float32Array(RESERVOIR);
        if (seen <= RESERVOIR) r[seen - 1] = a[i];
        else {
          const k = Math.floor(job.rng() * seen);
          if (k < RESERVOIR) r[k] = a[i];
        }
      }
      st.seen![dst] += st.seen![src] - na;
    }
    if (st.bits && st.bits[src]) {
      const a = st.bits[src]!;
      let b = st.bits[dst];
      if (!b) b = st.bits[dst] = new Uint8Array(a.length);
      let c = 0;
      for (let i = 0; i < a.length; i++) if ((b[i] |= a[i])) c++;
      st.cnt![dst] = c;
    }
    if (st.sets && st.sets[src]) {
      let b = st.sets[dst];
      if (!b) b = st.sets[dst] = new Set();
      for (const k of st.sets[src]!) b.add(k);
      st.cnt![dst] = b.size;
    }
    if (st.inst && st.inst[src]) {
      let b = st.inst[dst];
      if (!b) b = st.inst[dst] = new Set();
      for (const k of st.inst[src]!) b.add(k);
    }
  }
}

function mergeBoot(job: Job, dstTot: number, srcTot: number): void {
  for (let b = 0; b < (job.bucketRows.length ? BUCKETS : 0); b++) job.bucketRows[dstTot * BUCKETS + b] += job.bucketRows[srcTot * BUCKETS + b];
  for (const st of job.aggs) {
    if (!st.boot) continue;
    const n = BUCKETS * st.parts;
    for (let i = 0; i < n; i++) st.boot[dstTot * n + i] += st.boot[srcTot * n + i];
  }
}

// ---------------------------------------------------------------------------
// The result

export interface ResultRow {
  /** Region slot, group (G - 1 is the place's "All"), split slot (-1 the group's total, -2 other). */
  v: number;
  g: number;
  s: number;
  split: string | null;
  rows: number;
  /** Matches (or players) with a row here, for the small-sample flag. */
  clusters: number;
}

export interface MetricOut {
  /** Per row, then per dimension value (`dims`) after the rows' totals: rows x (1 + dims). */
  values: Float64Array;
  /** 95% interval of each row's value, and of its difference from its reference; NaN where none. */
  lo: Float64Array;
  hi: Float64Array;
  dlo: Float64Array;
  dhi: Float64Array;
  /** How the interval was found. */
  method: 'bootstrap' | 'poisson' | 'wilson' | null;
  /** A reservoir held a sample of the values: the percentile is approximate. */
  approx: boolean;
}

export interface Result {
  rows: ResultRow[];
  /** Per row, the row it is compared with (-1 none). */
  ref: Int32Array;
  dims: string[] | null;
  metrics: MetricOut[];
  /** Everything shown, whatever the region and groups. */
  shown: { rows: number; values: number[] };
  shownRows: number;
  /** Split values that did not fit the pass's room and went to "other" unseen. */
  overflow: boolean;
}

function aggValueAt(job: Job, a: number, cell: number): number {
  const st = job.aggs[a];
  const f = st.spec.fn;
  switch (f) {
    case 'count': return st.n![cell];
    case 'presence': return st.s![cell];
    case 'sum': return st.n![cell] > 0 ? st.s![cell] : 0;
    case 'avg': return st.n![cell] > 0 ? st.s![cell] / st.n![cell] : NaN;
    case 'stdev': {
      const n = st.n![cell];
      return n > 1 ? Math.sqrt(Math.max(0, (st.s2![cell] - (st.s![cell] * st.s![cell]) / n) / (n - 1))) : NaN;
    }
    case 'min': return Number.isFinite(st.mn![cell]) ? st.mn![cell] : NaN;
    case 'max': return Number.isFinite(st.mx![cell]) ? st.mx![cell] : NaN;
    case 'median':
    case 'percentile': {
      const r = st.res![cell];
      const n = Math.min(RESERVOIR, st.seen![cell]);
      if (!r || !n) return NaN;
      const sorted = r.slice(0, n).sort();
      return quantile(sorted, f === 'median' ? 0.5 : (st.spec.p ?? 50) / 100);
    }
    case 'distinct': return st.cnt![cell];
    case 'wins':
    case 'played':
    case 'winRate': {
      const set = st.inst![cell];
      let played = 0;
      let won = 0;
      if (set) for (const k of set) {
        played++;
        won += job.instWon.get(k) ?? 0;
      }
      if (f === 'wins') return won;
      if (f === 'played') return played;
      return winShrunk(won, played, overallWin(job, a));
    }
  }
}

/** Prior strength of a win rate, in rounds (`data/outcome.ts` WIN_PRIOR, kept out of the worker's imports). */
const WIN_PRIOR = 4;

function winShrunk(won: number, played: number, r0: number): number {
  if (!(played > 0)) return NaN;
  return (won + WIN_PRIOR * (Number.isFinite(r0) ? r0 : 0.5)) / (played + WIN_PRIOR);
}

function overallWin(job: Job, a: number): number {
  const set = job.aggs[a].inst![job.cells - 1];
  if (!set || !set.size) return NaN;
  let w = 0;
  for (const k of set) w += job.instWon.get(k) ?? 0;
  return w / set.size;
}

export function quantile(sorted: ArrayLike<number>, q: number): number {
  const n = sorted.length;
  if (!n) return NaN;
  const pos = (n - 1) * q;
  const i = Math.floor(pos);
  const f = pos - i;
  return i + 1 < n ? sorted[i] * (1 - f) + sorted[i + 1] * f : sorted[i];
}

/** A Poisson count's 95% interval (Wilson-Hilferty for Garwood's exact one). */
export function poissonInterval(n: number): [number, number] {
  if (!(n >= 0)) return [NaN, NaN];
  const z = 1.959964;
  const lo = n === 0 ? 0 : n * Math.pow(1 - 1 / (9 * n) - z / (3 * Math.sqrt(n)), 3);
  const m = n + 1;
  const hi = m * Math.pow(1 - 1 / (9 * m) + z / (3 * Math.sqrt(m)), 3);
  return [Math.max(0, lo), hi];
}

/** A proportion's 95% Wilson interval. */
export function wilsonInterval(k: number, n: number): [number, number] {
  if (!(n > 0)) return [NaN, NaN];
  const z = 1.959964;
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

function poissonWeights(rng: () => number, n: number): Float64Array {
  const w = new Float64Array(n);
  const L = Math.exp(-1);
  for (let i = 0; i < n; i++) {
    let k = 0;
    let p = rng();
    while (p > L) {
      k++;
      p *= rng();
    }
    w[i] = k;
  }
  return w;
}

export function finishJob(job: Job): Result {
  const { req } = job;
  const V = job.V;
  const G = job.G;
  const sTot = job.SS - 1;
  const dTot = job.DD - 1;
  // Which split slots are shown, in order; the rest fold into "other".
  let splitOrder: number[] = [];
  let overflow = false;
  if (job.split) {
    const n = job.split.keys.length;
    const rowsOf = (s: number) => {
      let r = 0;
      for (let v = 0; v < V; v++) r += job.rows[cellOf(job, v, G - 1, s, dTot)];
      return r;
    };
    const all = Array.from({ length: n }, (_, i) => i);
    if (req.split!.order === 'count') all.sort((a, b) => rowsOf(b) - rowsOf(a));
    else all.sort((a, b) => job.split!.keys[a] - job.split!.keys[b]);
    splitOrder = all.slice(0, req.split!.top);
    const rest = all.slice(req.split!.top);
    overflow = rowsOf(job.scap) > 0;
    for (const s of rest)
      for (let v = 0; v < V; v++)
        for (let g = 0; g < G; g++) {
          for (let d = 0; d < job.DD; d++) mergeCell(job, cellOf(job, v, g, job.scap, d), cellOf(job, v, g, s, d));
          mergeBoot(job, totalOf(job, v, g, job.scap), totalOf(job, v, g, s));
        }
  }
  // The dimension's values, in order; the rest fold into the other slot.
  let dimSlots: number[] | null = null;
  let dims: string[] | null = null;
  if (req.dim?.kind === 'bins') {
    const { lo, hi, n } = req.dim;
    dimSlots = Array.from({ length: n }, (_, i) => i);
    dims = dimSlots.map((i) => String(+(lo + ((hi - lo) * i) / n).toPrecision(4)));
  } else if (job.dim) {
    const kd = job.dim;
    const n = kd.keys.length;
    const tot = (d: number) => {
      let r = 0;
      for (let v = 0; v < V; v++) r += job.rows[cellOf(job, v, G - 1, sTot, d)];
      return r;
    };
    const all = Array.from({ length: n }, (_, i) => i);
    if (req.dim!.order === 'count') all.sort((a, b) => tot(b) - tot(a));
    else all.sort((a, b) => kd.keys[a] - kd.keys[b]);
    dimSlots = all.slice(0, (req.dim as LazyKeys).top);
    const rest = all.slice((req.dim as LazyKeys).top);
    for (const d of rest)
      for (let v = 0; v < V; v++) for (let g = 0; g < G; g++) for (let s = 0; s < job.SS; s++) mergeCell(job, cellOf(job, v, g, s, job.dcap), cellOf(job, v, g, s, d));
    dims = dimSlots.map((d) => kd.label(kd.keys[d]));
    if (rest.length || tot(job.dcap) > 0) {
      dimSlots.push(job.dcap);
      dims.push('\u0000other');
    }
  }
  // The rows of the table.
  const rows: ResultRow[] = [];
  const cellRows: number[] = [];
  const totRows: number[] = [];
  for (let v = 0; v < V; v++)
    for (let g = 0; g < G; g++) {
      const slots: [number, number, string | null][] = [[sTot, -1, null]];
      if (job.split) {
        for (const s of splitOrder) slots.push([s, s, job.split.label(job.split.keys[s])]);
        slots.push([job.scap, OTHER, '\u0000other']);
      }
      for (const [s, sid, label] of slots) {
        const cell = cellOf(job, v, g, s, dTot);
        if (sid !== -1 && job.rows[cell] === 0) continue;
        const tot = totalOf(job, v, g, s);
        let clusters = 0;
        if (job.bucketRows.length) for (let b = 0; b < BUCKETS; b++) if (job.bucketRows[tot * BUCKETS + b]) clusters++;
        rows.push({ v, g, s: sid, split: label, rows: job.rows[cell], clusters });
        cellRows.push(cell);
        totRows.push(tot);
      }
    }
  // The reference of each row: the reference group (with two or more groups), else the first region.
  const ref = new Int32Array(rows.length).fill(-1);
  const userGroups = G - 1;
  rows.forEach((r, i) => {
    if (r.g === G - 1 && userGroups > 0) return;
    const want = userGroups >= 2 ? { v: r.v, g: req.ref, s: r.s } : V > 1 ? { v: 0, g: r.g, s: r.s } : null;
    if (!want) return;
    const k = rows.findIndex((x) => x.v === want.v && x.g === want.g && x.s === want.s);
    if (k >= 0 && k !== i) ref[i] = k;
  });
  // Values.
  const nD = dimSlots ? dimSlots.length : 0;
  const allCellOf = (cell: number) => {
    // The place's "All" cell for a cell: same region, split and dimension slot.
    const d = cell % job.DD;
    const s = Math.floor(cell / job.DD) % job.SS;
    const v = Math.floor(cell / (job.DD * job.SS * G));
    return cellOf(job, v, G - 1, s, d);
  };
  const valueAt = (m: VNode, cell: number) =>
    evalValue(m, (i) => aggValueAt(job, i, cell), cell === job.cells - 1 ? null : (n) => evalValue(n, (i) => aggValueAt(job, i, allCellOf(cell)), null));
  // The bootstrap.
  const K_ = job.bucketRows.length ? (req.meta.resamples ?? 200) : 0;
  const weights: Float64Array[] = [];
  const wrng = rngOf(0xb007);
  for (let k = 0; k < K_; k++) weights.push(poissonWeights(wrng, BUCKETS));
  const wr = job.aggs.map((st, a) => (st.inst ? overallWin(job, a) : NaN));
  const bootAgg = (a: number, tot: number, k: number): number => {
    const st = job.aggs[a];
    const w = weights[k];
    const P = st.parts;
    let x = 0;
    let y = 0;
    let z = 0;
    if (st.inst) {
      // Won and played per bucket, from the instances (worked out once, below).
      const arr = winBoot[a]!;
      for (let b = 0; b < BUCKETS; b++) {
        x += w[b] * arr[(tot * BUCKETS + b) * 2];
        y += w[b] * arr[(tot * BUCKETS + b) * 2 + 1];
      }
      const f = st.spec.fn;
      return f === 'wins' ? x : f === 'played' ? y : winShrunk(x, y, wr[a]);
    }
    const base = tot * BUCKETS * P;
    for (let b = 0; b < BUCKETS; b++) {
      x += w[b] * st.boot![base + b * P];
      if (P > 1) y += w[b] * st.boot![base + b * P + 1];
      if (P > 2) z += w[b] * st.boot![base + b * P + 2];
    }
    switch (st.spec.fn) {
      case 'avg': return x > 0 ? y / x : NaN;
      case 'stdev': return x > 1 ? Math.sqrt(Math.max(0, (z - (y * y) / x) / (x - 1))) : NaN;
      default: return x;
    }
  };
  // Win instances per bucket of each total cell.
  const winBoot: (Float64Array | null)[] = job.aggs.map((st) => {
    if (!st.inst || !K_) return null;
    const totals = V * G * job.SS;
    const out = new Float64Array(totals * BUCKETS * 2);
    const R = Math.max(1, req.meta.rounds);
    const W = req.meta.persons + 65536;
    for (let t = 0; t < totals; t++) {
      const set = st.inst[t * job.DD + dTot];
      if (!set) continue;
      for (const inst of set) {
        const who = inst % W;
        const sess = Math.floor(inst / W / R);
        const c = req.meta.cluster === 'session' ? sess : who;
        const b = hashBucket(c);
        out[(t * BUCKETS + b) * 2] += job.instWon.get(inst) ?? 0;
        out[(t * BUCKETS + b) * 2 + 1]++;
      }
    }
    return out;
  });
  const metrics: MetricOut[] = req.metrics.map((m) => {
    const R = rows.length;
    const values = new Float64Array(R * (1 + nD)).fill(NaN);
    rows.forEach((_, i) => {
      values[i * (1 + nD)] = valueAt(m, cellRows[i]);
      if (dimSlots) {
        const r = rows[i];
        const s = r.s === -1 ? sTot : r.s === OTHER ? job.scap : r.s;
        dimSlots.forEach((d, q) => (values[i * (1 + nD) + 1 + q] = valueAt(m, cellOf(job, r.v, r.g, s, d))));
      }
    });
    const lo = new Float64Array(R).fill(NaN);
    const hi = new Float64Array(R).fill(NaN);
    const dlo = new Float64Array(R).fill(NaN);
    const dhi = new Float64Array(R).fill(NaN);
    const used = [...aggsOf(m)];
    const resamplable = K_ > 0 && used.every((a) => job.aggs[a].parts > 0 || (job.aggs[a].inst && winBoot[a]));
    let method: MetricOut['method'] = null;
    if (resamplable) {
      method = 'bootstrap';
      const boots = rows.map(() => new Float64Array(K_));
      rows.forEach((r, i) => {
        const tot = totRows[i];
        const allTot = totalOf(job, r.v, G - 1, Math.floor(tot % job.SS));
        for (let k = 0; k < K_; k++)
          boots[i][k] = evalValue(m, (a) => bootAgg(a, tot, k), (n) => evalValue(n, (a) => bootAgg(a, allTot, k), null));
      });
      rows.forEach((_, i) => {
        [lo[i], hi[i]] = percentileInterval(boots[i]);
        const rr = ref[i];
        if (rr >= 0) {
          const d = new Float64Array(K_);
          for (let k = 0; k < K_; k++) d[k] = boots[i][k] - boots[rr][k];
          [dlo[i], dhi[i]] = percentileInterval(d);
        }
      });
    } else if (m.k === 'agg' && job.aggs[m.i].spec.fn === 'count') {
      method = 'poisson';
      rows.forEach((_, i) => ([lo[i], hi[i]] = poissonInterval(values[i * (1 + nD)])));
    } else if (m.k === 'agg' && job.aggs[m.i].spec.fn === 'winRate') {
      method = 'wilson';
      const st = job.aggs[m.i];
      rows.forEach((_, i) => {
        const set = st.inst![cellRows[i]];
        let w = 0;
        if (set) for (const k of set) w += job.instWon.get(k) ?? 0;
        [lo[i], hi[i]] = wilsonInterval(w, set?.size ?? 0);
      });
    }
    const approx = used.some((a) => {
      const st = job.aggs[a];
      return !!st.seen && cellRows.some((c) => st.seen![c] > RESERVOIR);
    });
    return { values, lo, hi, dlo, dhi, method, approx };
  });
  const g = job.cells - 1;
  return {
    rows,
    ref,
    dims,
    metrics,
    shown: { rows: job.rows[g], values: req.metrics.map((m) => valueAt(m, g)) },
    shownRows: job.shownRows,
    overflow,
  };
}

function percentileInterval(xs: Float64Array): [number, number] {
  const f = Array.from(xs).filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (f.length < xs.length * 0.8 || f.length < 20) return [NaN, NaN];
  return [quantile(f, 0.025), quantile(f, 0.975)];
}
