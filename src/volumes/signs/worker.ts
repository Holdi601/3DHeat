/**
 * A chart signs' row worker: it keeps its share of the rows inside each
 * volume that has a sign (and, when a sign compares inside with outside, of
 * the rest), and folds every sign's chart over them (`charts/aggregate.ts`),
 * off the main thread. The page runs several (`client.ts`), each given every
 * so-many-th chunk of rows, so a scope's work is spread over the cores; each
 * sends its share of every sign's accumulators to the merging worker
 * (`mergeWorker.ts`), which adds them up into the chart.
 *
 * The rows arrive once per build, a chunk at a time, every column of a chunk
 * packed into one buffer that goes back with the ack to be filled again -
 * nothing is allocated per chunk on either side. Each chunk's positions are
 * tested against the volumes; the rows inside any of them are kept once, with
 * a bit per volume saying which hold each, and just the columns the signs and
 * the view's filters read - the dataset itself is never copied whole. Every
 * row is kept, exactly, up to the budget the page gives (its free share of the
 * tab's memory); past it the rest are thinned first and then the rows inside,
 * to an even sample whose rows each stand for the ones skipped, and the charts
 * say "from a sample" with its size.
 *
 * Then a scope (filters, time window, playhead) is one shared pass per table
 * (`scan.ts`): the rows shown kept as a mask beside the mask before, and every
 * sign folds the rows that changed out and in, or starts over from the rows
 * shown. Signs of one spec (the same chart on several volumes) are worked
 * together, in one fold over the rows any of them takes. The jobs run in steps
 * of at most `pace.run` ms with `pace.rest` ms between (the page slows the
 * workers while its frames come late); a newer scope is read between jobs, and
 * a share goes out only when it changed.
 */

import { accBuffers, accOf, type AggMeta, type AggScope, type RowTable } from '../../charts/aggregate';
import { compiled, compiledContains, type CompiledVolume, type Volume } from '../volume';
import { chunkViews, type ChunkField, type FromWorker, type SignJob, type ToMerge, type ToWorker } from './protocol';
import { feedsOf, scopeId, SignAgg, Slot, updateSteps, type Feed, type KeptTable } from './scan';

type Arr = Float32Array | Uint32Array | Uint16Array;

/** A column that grows as rows are appended, never past `max` (the budget and a chunk). */
class Grow<T extends Arr> {
  a: T;
  n = 0;
  constructor(
    private readonly make: (n: number) => T,
    private readonly max: number,
  ) {
    this.a = make(Math.min(1 << 16, max));
  }
  private room(k: number): void {
    const need = this.n + k;
    if (need <= this.a.length) return;
    const b = this.make(Math.max(need, Math.min(this.max, this.a.length * 2)));
    b.set(this.a.subarray(0, this.n));
    this.a = b;
  }
  /** Append `src[idx[0..k)]`. */
  gather(src: ArrayLike<number>, idx: Uint32Array, k: number): void {
    this.room(k);
    const a = this.a;
    let n = this.n;
    for (let j = 0; j < k; j++) a[n++] = src[idx[j]];
    this.n = n;
  }
  /** Append `src[0..k)`. */
  append(src: Arr, k: number): void {
    this.room(k);
    this.a.set(src.subarray(0, k), this.n);
    this.n += k;
  }
  /** Keep every other value (the even positions): the sample thinned by half. */
  halve(): void {
    const a = this.a;
    const n = this.n;
    let j = 0;
    for (let i = 0; i < n; i += 2) a[j++] = a[i];
    this.n = j;
  }
  done(): T {
    // Trimmed to its length when much of it is spare (the room goes back), else a view: no second copy.
    return this.a.length - this.n > this.n >> 2 ? (this.a.slice(0, this.n) as T) : (this.a.subarray(0, this.n) as T);
  }
}

const maker = (type: ChunkField['type']): ((n: number) => Arr) => (type === 'f32' ? (n) => new Float32Array(n) : type === 'u32' ? (n) => new Uint32Array(n) : (n) => new Uint16Array(n));

/** Rows kept for one table while a build runs. */
interface Keep {
  cols: (Grow<Arr> | null)[];
  member: Grow<Uint32Array> | null;
  n: number;
  /** Rows of this table seen, and one in how many of them is kept. */
  seen: number;
  keep: number;
}

function keeper(fields: readonly ChunkField[], withMember: boolean, max: number): Keep {
  return {
    cols: fields.map((f) => (f.key === 'x' || f.key === 'y' || f.key === 'z' ? null : new Grow<Arr>(maker(f.type), max))),
    member: withMember ? new Grow((n) => new Uint32Array(n), max) : null,
    n: 0,
    seen: 0,
    keep: 1,
  };
}

function halveKeep(k: Keep): void {
  for (const c of k.cols) c?.halve();
  k.member?.halve();
  k.n = Math.ceil(k.n / 2);
  k.keep *= 2;
}

function table(k: Keep, fields: readonly ChunkField[], sorted: boolean): KeptTable {
  const col = (key: string) => {
    const i = fields.findIndex((f) => f.key === key);
    return i >= 0 ? (k.cols[i]?.done() ?? null) : null;
  };
  const cols: RowTable['cols'] = {};
  fields.forEach((f, i) => {
    if (f.key.startsWith('c:')) cols[f.key.slice(2)] = k.cols[i]!.done() as Float32Array | Uint32Array;
  });
  const life = col('life') as Float32Array | null;
  let maxLife = life ? 0 : Infinity;
  if (life) for (let i = 0; i < life.length; i++) if (life[i] > maxLife) maxLife = life[i];
  return {
    t: { n: k.n, weight: k.keep, time: col('time') as Float32Array | null, life, team: col('team') as Uint16Array | null, person: col('person') as Uint32Array | null, session: col('session') as Uint32Array | null, cols, sorted },
    member: k.member ? k.member.done() : null,
    maxLife,
  };
}

/** Most volumes with signs one build serves (a bit each). */
export const MAX_VOLUMES = 32;

let meta: AggMeta | null = null;
let build: {
  id: number;
  volumes: { v: Volume; c: CompiledVolume }[];
  fields: ChunkField[];
  sorted: boolean;
  cap: number;
  inside: Keep;
  rest: Keep | null;
  restRows: number;
} | null = null;

/** Scratch for a chunk: each row's volume bits, the rows kept inside and in the rest. */
let bitsOf = new Uint32Array(0);
let inIdx = new Uint32Array(0);
let restIdx = new Uint32Array(0);

let inside: KeptTable | null = null;
let rest: KeptTable | null = null;
let bits = new Map<string, number>();
let slots: { inside: Slot; rest: Slot | null; insideUp: Slot | null; restUp: Slot | null } | null = null;

interface SignRun {
  job: SignJob;
  agg: SignAgg | null;
  /** Whether the merging worker has this sign's share as it is now (for this build). */
  sent: boolean;
}
const runs = new Map<string, SignRun>();
let scope: AggScope | null = null;
let upTo: AggScope | null = null;
let fresh = false;
let seq = 0;
let queue: string[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let busy = 0;
let scanMs = 0;
let folded = 0;
let fulls = 0;

const post = (m: FromWorker, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(m, transfer);
/** The merging worker, and this build's id (the shares say which rows they are of). */
let merge: MessagePort | null = null;
let builtId = 0;
const toMerge = (m: ToMerge, transfer: Transferable[] = []) => merge?.postMessage(m, transfer);

/** Signs folded together: one spec, the same kind of rows (up to now or the window). */
const groupKey = (j: SignJob) => `${j.upToNow ? 1 : 0}${JSON.stringify(j.spec)}`;

/** The job under way - a scan of the slots or a group of signs - in steps, and what to do when it ends. */
let job: { kind: 'scan' | 'fold'; steps: Generator<void, unknown>; done: () => void } | null = null;
/** The scope the slots show now (the shares are of it). */
let slotSeq = 0;
/**
 * How long a step may run, ms, and how long to rest after it: the page asks
 * for rest while its frames come late (a busy machine), so these workers take
 * less of it then.
 */
let pace = { run: 12, rest: 0 };

function schedule(delay = 0): void {
  if (timer === null) timer = setTimeout(step, delay);
}

/** The slots moved to a scope: one pass per table, for every sign. */
function* scanSteps(sc: AggScope, up: AggScope | null): Generator<void, void> {
  if (!slots || !inside) return;
  const ups = [...runs.values()].some((r) => r.job.upToNow);
  yield* slots.inside.steps(sc);
  if (slots.rest) yield* slots.rest.steps(sc);
  // "Up to now" signs read their own slots only while it differs from the view's (in playback).
  if (ups && up && scopeId(up) !== scopeId(sc)) {
    slots.insideUp ??= new Slot(inside);
    yield* slots.insideUp.steps(up);
    if (rest) {
      slots.restUp ??= new Slot(rest);
      yield* slots.restUp.steps(up);
    }
  } else {
    slots.insideUp = null;
    slots.restUp = null;
  }
}

/** The next job: the slots to a newer scope first, then the signs a group at a time; null when all is done. */
function nextJob(): typeof job {
  if (!meta || !scope || !slots) return null;
  if (fresh) {
    fresh = false;
    const s = seq;
    return {
      kind: 'scan',
      steps: scanSteps(scope, upTo),
      done: () => {
        slotSeq = s;
        queue = [...runs.keys()];
      },
    };
  }
  const id = queue.shift();
  if (id === undefined) {
    toMerge({ type: 'idle', build: builtId, seq: slotSeq, ms: busy, scan: scanMs, folded, full: fulls });
    busy = 0;
    scanMs = 0;
    folded = 0;
    fulls = 0;
    return null;
  }
  // The signs of this one's spec and kind of rows, still queued: one fold for all of them.
  const first = runs.get(id);
  const key = first ? groupKey(first.job) : '';
  const ids = [id];
  if (first) {
    queue = queue.filter((q) => {
      const r = runs.get(q);
      if (r && groupKey(r.job) === key) {
        ids.push(q);
        return false;
      }
      return true;
    });
  }
  const work: { r: SignRun; sign: SignAgg; feeds: Feed[] }[] = [];
  for (const sid of ids) {
    const r = runs.get(sid);
    const bit = r ? bits.get(r.job.volumeId) : undefined;
    if (!r || bit === undefined) continue;
    const up = r.job.upToNow && slots.insideUp;
    r.agg ??= new SignAgg(meta, r.job.spec);
    work.push({ r, sign: r.agg, feeds: feedsOf(r.job.spec, bit, up ? slots.insideUp! : slots.inside, up ? slots.restUp : slots.rest) });
  }
  const s = slotSeq;
  const b = builtId;
  return {
    kind: 'fold',
    steps: updateSteps(work),
    done: () => {
      if (!work.length) return;
      folded += work[0].sign.last.rows;
      if (work[0].sign.last.how === 'full') fulls += work.length;
      // Each sign's share, or word that it is as before.
      for (const { r, sign } of work) {
        if (r.sent && sign.last.how === 'same') toMerge({ type: 'partial', build: b, seq: s, id: r.job.id, acc: null });
        else {
          const acc = accOf(sign.agg!);
          toMerge({ type: 'partial', build: b, seq: s, id: r.job.id, acc }, accBuffers(acc));
          r.sent = true;
        }
      }
    },
  };
}

/** Jobs in steps for at most `pace.run` ms, then a rest: newer messages (a scope, the pace) are read between. */
function step(): void {
  timer = null;
  const t0 = performance.now();
  while (performance.now() - t0 < pace.run) {
    if (!job) {
      job = nextJob();
      if (!job) return;
    }
    const s0 = performance.now();
    const r = job.steps.next();
    const ms = performance.now() - s0;
    if (job.kind === 'scan') scanMs += ms;
    else busy += ms;
    if (r.done) {
      const j = job;
      job = null;
      j.done();
    }
  }
  schedule(pace.rest);
}

function onChunk(m: Extract<ToWorker, { type: 'chunk' }>): void {
  const b = build;
  if (!b || b.id !== m.build) return;
  const n = m.n;
  const views = chunkViews(m.buf, b.fields, n);
  const at = (key: string) => views[b.fields.findIndex((f) => f.key === key)] as Float32Array;
  const x = at('x');
  const y = at('y');
  const z = at('z');
  if (bitsOf.length < n) {
    bitsOf = new Uint32Array(n);
    inIdx = new Uint32Array(n);
    restIdx = new Uint32Array(n);
  }
  const vols = b.volumes;
  const ins = b.inside;
  const rs = b.rest;
  let ni = 0;
  let nr = 0;
  for (let i = 0; i < n; i++) {
    const px = x[i];
    const py = y[i];
    const pz = z[i];
    let here = 0;
    if (px === px && py === py && pz === pz)
      for (let k = 0; k < vols.length; k++) {
        const cv = vols[k].c;
        if (px < cv.min[0] || px > cv.max[0] || py < cv.min[1] || py > cv.max[1] || pz < cv.min[2] || pz > cv.max[2]) continue;
        if (compiledContains(cv, px, py, pz)) here |= 1 << k;
      }
    if (here !== 0) {
      if (ins.seen++ % ins.keep === 0) {
        bitsOf[ni] = here >>> 0;
        inIdx[ni++] = i;
      }
    } else if (rs) {
      b.restRows++;
      if (rs.seen++ % rs.keep === 0) restIdx[nr++] = i;
    }
  }
  // Column by column: a tight gather each.
  for (let f = 0; f < views.length; f++) {
    ins.cols[f]?.gather(views[f], inIdx, ni);
    rs?.cols[f]?.gather(views[f], restIdx, nr);
  }
  ins.member!.append(bitsOf, ni);
  ins.n += ni;
  if (rs) rs.n += nr;
  // Past the budget: the rest thinned first (down to an eighth of it), then the rows inside.
  while (ins.n + (rs?.n ?? 0) > b.cap) {
    if (rs && rs.n > b.cap / 8) halveKeep(rs);
    else halveKeep(ins);
  }
  post({ type: 'ack', build: m.build, buf: m.buf }, [m.buf]);
}

function onBuilt(id: number): void {
  const b = build;
  if (!b || b.id !== id) return;
  inside = table(b.inside, b.fields, b.sorted);
  rest = b.rest ? table(b.rest, b.fields, b.sorted) : null;
  bits = new Map(b.volumes.map(({ v }, k) => [v.id, (1 << k) >>> 0]));
  const member = inside.member!;
  const rows: Record<string, number> = {};
  for (const { v } of b.volumes) {
    const bit = bits.get(v.id)!;
    let n = 0;
    for (let i = 0; i < member.length; i++) if (member[i] & bit) n++;
    rows[v.id] = n * b.inside.keep;
  }
  slots = { inside: new Slot(inside), rest: rest ? new Slot(rest) : null, insideUp: null, restUp: null };
  build = null;
  builtId = id;
  for (const r of runs.values()) {
    r.agg = null;
    r.sent = false;
  }
  post({ type: 'ready', build: id, rows, kept: { inside: inside.t.n, keepInside: b.inside.keep, rest: rest?.t.n ?? 0, keepRest: b.rest?.keep ?? 1, restRows: b.restRows, budget: b.cap } });
  fresh = true;
  schedule();
}

self.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  switch (m.type) {
    case 'port':
      merge = m.port;
      break;
    case 'pace':
      pace = { run: m.run, rest: m.rest };
      break;
    case 'meta':
      meta = m.meta;
      job = null;
      fresh = true;
      for (const r of runs.values()) {
        r.agg = null;
        r.sent = false;
      }
      break;
    case 'build': {
      const cap = Math.max(1 << 16, Math.floor(m.keepRows));
      const max = cap + (1 << 17);
      // The old rows go first: the new ones need the room.
      job = null;
      inside = null;
      rest = null;
      slots = null;
      build = {
        id: m.build,
        volumes: m.volumes.slice(0, MAX_VOLUMES).map((v) => ({ v, c: compiled(v) })),
        fields: m.fields,
        sorted: m.sorted,
        cap,
        inside: keeper(m.fields, true, max),
        rest: m.rest ? keeper(m.fields, false, max) : null,
        restRows: 0,
      };
      break;
    }
    case 'chunk':
      onChunk(m);
      break;
    case 'built':
      onBuilt(m.build);
      break;
    case 'signs': {
      const keep = new Map<string, SignRun>();
      for (const job of m.signs) {
        const old = runs.get(job.id);
        const same = old && JSON.stringify(old.job) === JSON.stringify(job);
        keep.set(job.id, same ? old : { job, agg: null, sent: false });
        if (!same && !queue.includes(job.id)) queue.push(job.id);
      }
      runs.clear();
      for (const [k, v] of keep) runs.set(k, v);
      queue = queue.filter((id) => runs.has(id));
      // An "up to now" sign added: its slot is made at the next scan.
      if ([...runs.values()].some((r) => r.job.upToNow) && slots && !slots.insideUp) fresh = true;
      schedule();
      break;
    }
    case 'scope':
      scope = m.scope;
      upTo = m.upTo;
      seq = m.seq;
      fresh = true;
      schedule();
      break;
  }
};
