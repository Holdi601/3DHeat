/**
 * The lean overlay's coordinator: plans the jobs, merges what pass 1 found,
 * chooses how much to thin (nothing, when it fits), lays the keys out, takes
 * pass 2's keys into place and builds the small dataset that stands for the
 * overlay - two rows a unit, its first and last place, with what it is - so
 * the viewer's panels, filters, cards and timeline have something to read
 * while the GPU draws the units from the keys.
 *
 * The keys of a unit are written run by run, one run a job, each into room
 * pass 1 measured, in 16 bits of a span each 64 keys of the run
 * (`gpuTracks/chunks.ts`); afterwards the runs are closed up (a key not after
 * the one before it is dropped) and the units closed up after them. A run
 * that does not start a track's next chunk is counted again from the
 * track's own chunks. All moves go left, so it is done in place.
 *
 * Runs in the load worker; the jobs run in decode workers, or inline in tests.
 */

import { DatasetBuilder, type BlockAttr, type SourceBlock } from '../../data/builder';
import { Dictionary } from '../../data/growable';
import type { Dataset } from '../../state/types';
import { setDeadSpan, TRACK_U32 } from '../../render/gpuTracks/store';
import { packDeadSpan } from '../../data/deaths';
import { CHUNK_KEYS, CHUNK_SHIFT, CHUNK_U32, encodeChunk } from '../../render/gpuTracks/chunks';
import { BOX, KEY_LEVELS, SPAN, STEPS, type LeanSpec, type Pass1Result, type Pass2Result } from './scan';
import { holdFor } from '../../data/despawn';

export interface LeanFile {
  name: string;
  /** Rows of each row group, in order. */
  rowGroups: number[];
}

export interface LeanJob {
  file: number;
  rowStart: number;
  rowEnd: number;
}

/** Most rows a job: what one decode holds at once. */
export const JOB_ROWS = 300_000;

/** Jobs over the files: whole row groups, small ones together, none past `JOB_ROWS` unless a group is. */
export function planJobs(files: LeanFile[], maxRows = JOB_ROWS): LeanJob[] {
  const jobs: LeanJob[] = [];
  files.forEach((f, file) => {
    let start = 0;
    let end = 0;
    for (const n of f.rowGroups) {
      if (end > start && end - start + n > maxRows) {
        jobs.push({ file, rowStart: start, rowEnd: end });
        start = end;
      }
      end += n;
    }
    if (end > start) jobs.push({ file, rowStart: start, rowEnd: end });
  });
  return jobs;
}

const s8 = (v: number) => ((v & 0xff) << 24) >> 24;

function quatDot(a: number, b: number): number {
  return s8(a) * s8(b) + s8(a >>> 8) * s8(b >>> 8) + s8(a >>> 16) * s8(b >>> 16) + s8(a >>> 24) * s8(b >>> 24);
}

function negQuat(a: number): number {
  const n = (v: number) => -s8(v) & 0xff;
  return (n(a) | (n(a >>> 8) << 8) | (n(a >>> 16) << 16) | (n(a >>> 24) << 24)) >>> 0;
}

/** Growable typed storage indexed by unit. */
class Column<T extends Float64Array | Uint32Array | Int32Array> {
  data: T;
  constructor(
    private readonly make: (n: number) => T,
    private readonly fill: number,
  ) {
    this.data = make(1024);
    this.data.fill(fill);
  }
  ensure(n: number): void {
    if (n <= this.data.length) return;
    let cap = this.data.length;
    while (cap < n) cap *= 2;
    const next = this.make(cap);
    next.set(this.data);
    next.fill(this.fill, this.data.length);
    this.data = next;
  }
}

export interface LeanMarkers {
  count: number;
  /** x, y, z, t (overlay seconds) a marker. */
  data: Float32Array;
  /** Team (index into the dataset's team labels; 0xffff none). */
  team: Uint16Array;
  /** Overlay group. */
  group: Uint32Array;
}

/** What a load hands the viewer: the standing-in dataset, the GPU tracks' arrays, and where each unit came from. */
export interface LeanBuilt {
  dataset: Dataset;
  tracks: number;
  /** TRACK_U32 a track: first key, count and span filled; colour, meshes and flags are the viewer's to fill. */
  trackData: Uint32Array;
  keysA: Uint32Array;
  keysB: Uint32Array;
  keys: number;
  /** Own samples read. */
  samples: number;
  /** Index into `KEY_LEVELS`, and the metres it stands for. */
  level: number;
  tolerance: number;
  /** Per track: the dataset row standing for it, its group, file, and the file rows its rows lie between. */
  trackRow: Int32Array;
  trackGroup: Uint32Array;
  trackFile: Uint32Array;
  trackRows: Float64Array;
  /** Per track: its unit's track value (what its rows carry in the track column) and match value. */
  trackKey: string[];
  trackMatch: string[];
  groups: string[];
  /** Per group, its match's own value in the files ('' for a file that is one match). */
  groupMatch: string[];
  /** Per group, its start in file seconds; overlay seconds are file seconds less it and `origin`. */
  groupStart: Float64Array;
  origin: number;
  spec: LeanSpec;
  /** Names of the files read, by the index `trackFile` holds. */
  files: string[];
  markers: LeanMarkers;
  /** Rows read in all, and units with no own sample (left out). */
  rows: number;
  empty: number;
}

export class LeanAssembler {
  readonly levels: number[];
  private readonly unitIndex = new Map<string, number>();
  private units = 0;
  private readonly uFile = new Column((n) => new Uint32Array(n), 0);
  private readonly uGroup = new Column((n) => new Uint32Array(n), 0);
  private readonly uSamples = new Column((n) => new Float64Array(n), 0);
  private readonly uBox = new Column((n) => new Float64Array(n), NaN);
  private readonly uFirst = new Column((n) => new Float64Array(n), Infinity);
  private readonly uLast = new Column((n) => new Float64Array(n), -Infinity);
  /** Its first death row's time in file seconds, Infinity for none. */
  private readonly uDeath = new Column((n) => new Float64Array(n), Infinity);
  /** The job whose first own row of the unit came first, for what the unit is. */
  private readonly uMetaJob = new Column((n) => new Int32Array(n), 0x7fffffff);
  private readonly uMeta: Column<Uint32Array>[];
  private readonly uTeam = new Column((n) => new Uint32Array(n), 0);
  private readonly metaDict: Dictionary[];
  private readonly teamDict = new Dictionary();
  private readonly uKey: string[] = [];
  private readonly uMatch: string[] = [];
  private readonly groupIndex = new Map<string, number>();
  private readonly groupLabel: string[] = [];
  /** Each match's own value in the files (`groupLabel` names one with none by its file): one string a match, not a unit. */
  private readonly groupMatch: string[] = [];
  private readonly groupStart: number[] = [];
  private readonly groupFile: number[] = [];
  private readonly mPos: number[] = [];
  private readonly mT: number[] = [];
  private readonly mGroup: number[] = [];
  private readonly mTeam: string[] = [];
  /** Per job, after pass 1: its local units' global ids and keys a level. */
  private readonly jobUnits: (Int32Array | null)[];
  private readonly jobKeys: (Uint32Array | null)[];
  private rowsRead = 0;
  // After pass 1.
  private level = 0;
  private trackOfUnit: Int32Array | null = null;
  private order: Int32Array | null = null;
  private offset: Float64Array | null = null;
  private spans: Float64Array | null = null;
  /** Per track, the file second its keys' times count from: its match's start and the overlay's origin. */
  private base: Float64Array | null = null;
  private origin = 0;
  private jobSpans: (Float32Array | null)[] = [];
  private jobChunkOff: (Uint32Array | null)[] = [];
  private jobSlot: (Float64Array | null)[] = [];
  private jobUsed: (Uint32Array | null)[] = [];
  private keysA: Uint32Array | null = null;
  private keysB: Uint32Array | null = null;
  private allocKeys = 0;

  constructor(
    readonly files: LeanFile[],
    readonly jobs: LeanJob[],
    readonly spec: LeanSpec,
    /** Count keys at every tolerance (the data may not fit), or only at none. */
    ladder: boolean,
  ) {
    this.levels = ladder ? KEY_LEVELS.map((_, i) => i) : [0];
    this.uMeta = spec.meta.map(() => new Column((n) => new Uint32Array(n), 0));
    this.metaDict = spec.meta.map(() => {
      const d = new Dictionary();
      d.intern('');
      return d;
    });
    this.teamDict.intern('');
    this.jobUnits = jobs.map(() => null);
    this.jobKeys = jobs.map(() => null);
  }

  private groupOf(file: number, label: string): number {
    const k = `${file}\u0001${label}`;
    let g = this.groupIndex.get(k);
    if (g === undefined) {
      g = this.groupLabel.length;
      this.groupIndex.set(k, g);
      this.groupLabel.push(label || this.files[file].name.replace(/\.parquet$/i, ''));
      this.groupMatch.push(label);
      this.groupStart.push(Infinity);
      this.groupFile.push(file);
    }
    return g;
  }

  addPass1(j: number, r: Pass1Result): void {
    const job = this.jobs[j];
    const file = job.file;
    this.rowsRead += r.rows;
    const gl = r.groups.map((label, i) => {
      const g = this.groupOf(file, label);
      if (r.groupStart[i] < this.groupStart[g]) this.groupStart[g] = r.groupStart[i];
      return g;
    });
    const ids = new Int32Array(r.units);
    for (let u = 0; u < r.units; u++) {
      // Keyed by the match's number, not its name: millions of units (an evening of DCS shells) in a worker's heap.
      const grp = this.groupOf(file, r.match[u]);
      const key = `${grp}\u0001${r.track[u]}`;
      let g = this.unitIndex.get(key);
      if (g === undefined) {
        g = this.units++;
        this.unitIndex.set(key, g);
        for (const c of [this.uFile, this.uGroup, this.uSamples, this.uFirst, this.uLast, this.uDeath, this.uMetaJob, this.uTeam, ...this.uMeta]) c.ensure(this.units);
        this.uBox.ensure(this.units * BOX);
        this.uFile.data[g] = file;
        this.uGroup.data[g] = grp;
        this.uKey.push(r.track[u]);
        this.uMatch.push(this.groupMatch[grp]);
      }
      ids[u] = g;
      this.uFirst.data[g] = Math.min(this.uFirst.data[g], r.firstRow[u]);
      this.uLast.data[g] = Math.max(this.uLast.data[g], r.lastRow[u]);
      this.uDeath.data[g] = Math.min(this.uDeath.data[g], r.death[u]);
      if (!r.samples[u]) continue;
      this.uSamples.data[g] += r.samples[u];
      const b = this.uBox.data;
      const o = g * BOX;
      const s = u * BOX;
      for (let c = 0; c < 3; c++) {
        b[o + c] = Number.isNaN(b[o + c]) ? r.box[s + c] : Math.min(b[o + c], r.box[s + c]);
        b[o + 3 + c] = Number.isNaN(b[o + 3 + c]) ? r.box[s + 3 + c] : Math.max(b[o + 3 + c], r.box[s + 3 + c]);
      }
      b[o + 6] = Number.isNaN(b[o + 6]) ? r.box[s + 6] : Math.min(b[o + 6], r.box[s + 6]);
      b[o + 7] = Number.isNaN(b[o + 7]) ? r.box[s + 7] : Math.max(b[o + 7], r.box[s + 7]);
      if (j < this.uMetaJob.data[g]) {
        this.uMetaJob.data[g] = j;
        for (let m = 0; m < this.uMeta.length; m++) this.uMeta[m].data[g] = this.metaDict[m].intern(r.meta[m][u]);
        this.uTeam.data[g] = this.teamDict.intern(r.team[u]);
      }
    }
    const mk = r.markers;
    for (let i = 0; i < mk.count; i++) {
      this.mPos.push(mk.pos[i * 3], mk.pos[i * 3 + 1], mk.pos[i * 3 + 2]);
      this.mT.push(mk.t[i]);
      this.mGroup.push(gl[mk.group[i]]);
      this.mTeam.push(mk.team[i]);
    }
    this.jobUnits[j] = ids;
    this.jobKeys[j] = r.keys;
  }

  /** Own samples counted, and keys at each level (of `levels`). */
  totals(): { samples: number; keys: number[] } {
    const L = this.levels.length;
    const keys = new Array<number>(L).fill(0);
    for (const k of this.jobKeys) if (k) for (let i = 0; i < k.length; i++) keys[i % L] += k[i];
    let samples = 0;
    for (let g = 0; g < this.units; g++) samples += this.uSamples.data[g];
    return { samples, keys };
  }

  /**
   * After pass 1: the least thinning whose keys fit in `maxKeys`, the tracks'
   * order (by match, then first row) and spans, and the room each job's run
   * of each unit is given. Null when nothing fits even thinned the most.
   */
  plan(maxKeys: number): { level: number; keys: number } | null {
    // Pass 1 is done: the units' keys are no longer looked up.
    this.unitIndex.clear();
    const { keys } = this.totals();
    const li = keys.findIndex((k) => k <= maxKeys);
    if (li < 0) return null;
    this.level = this.levels[li];
    const L = this.levels.length;
    // Tracks: units with samples, by match then first row.
    const list: number[] = [];
    for (let g = 0; g < this.units; g++) if (this.uSamples.data[g] > 0) list.push(g);
    const grp = this.uGroup.data;
    const first = this.uFirst.data;
    list.sort((a, b) => grp[a] - grp[b] || first[a] - first[b]);
    const T = list.length;
    const order = Int32Array.from(list);
    const trackOf = new Int32Array(this.units).fill(-1);
    for (let i = 0; i < T; i++) trackOf[order[i]] = i;
    const alloc = new Float64Array(T);
    this.jobs.forEach((_, j) => {
      const ids = this.jobUnits[j]!;
      const k = this.jobKeys[j]!;
      for (let u = 0; u < ids.length; u++) {
        const tr = trackOf[ids[u]];
        if (tr >= 0) alloc[tr] += k[u * L + li];
      }
    });
    const offset = new Float64Array(T + 1);
    for (let i = 0; i < T; i++) offset[i + 1] = offset[i] + alloc[i];
    const cursor = offset.slice(0, T);
    this.jobSlot = this.jobs.map((_, j) => {
      const ids = this.jobUnits[j]!;
      const k = this.jobKeys[j]!;
      const slot = new Float64Array(ids.length).fill(-1);
      const room = new Uint32Array(ids.length);
      this.chosenAlloc[j] = room;
      for (let u = 0; u < ids.length; u++) {
        const tr = trackOf[ids[u]];
        const n = k[u * L + li];
        if (tr < 0 || !n) continue;
        room[u] = n;
        slot[u] = cursor[tr];
        cursor[tr] += n;
      }
      return slot;
    });
    // Spans: the box and times of each track's samples in 16-bit steps.
    const spans = new Float64Array(T * SPAN);
    const b = this.uBox.data;
    for (let i = 0; i < T; i++) {
      const o = order[i] * BOX;
      const step = Math.max(b[o + 3] - b[o], b[o + 4] - b[o + 1], b[o + 5] - b[o + 2], 1e-6) / STEPS;
      spans.set([b[o], b[o + 1], b[o + 2], step, b[o + 6], Math.max(b[o + 7] - b[o + 6], 1e-6) / STEPS], i * SPAN);
    }
    // Times from each match's start, less the earliest track's first time (the dataset's origin, `finish`).
    const gs = (g: number) => (Number.isFinite(this.groupStart[g]) ? this.groupStart[g] : 0);
    let origin = Infinity;
    for (let i = 0; i < T; i++) origin = Math.min(origin, b[order[i] * BOX + 6] - gs(grp[order[i]]));
    this.origin = Number.isFinite(origin) ? origin : 0;
    this.base = Float64Array.from(order, (g) => gs(grp[g]) + this.origin);
    this.order = order;
    this.trackOfUnit = trackOf;
    this.offset = offset;
    this.spans = spans;
    this.allocKeys = offset[T];
    this.keysA = new Uint32Array(this.allocKeys * 2);
    this.keysB = new Uint32Array(this.spec.look !== 'none' ? this.allocKeys : 0);
    this.jobUsed = this.jobs.map(() => null);
    // The level counts of every job are no longer needed: only the chosen one, in the slots.
    for (let j = 0; j < this.jobs.length; j++) this.jobKeys[j] = null;
    return { level: this.level, keys: this.allocKeys };
  }

  private chosenAlloc: (Uint32Array | null)[] = [];

  /** What pass 2 of job `j` needs: the second its units' times count from, their room (what pass 1 counted at the level), and the level. */
  pass2Input(j: number): { base: Float64Array; alloc: Uint32Array; level: number } {
    const ids = this.jobUnits[j]!;
    const slot = this.jobSlot[j]!;
    const base = new Float64Array(ids.length);
    for (let u = 0; u < ids.length; u++) {
      const tr = this.trackOfUnit![ids[u]];
      if (tr >= 0 && slot[u] >= 0) base[u] = this.base![tr];
    }
    return { base, alloc: this.chosenAlloc[j]!, level: this.level };
  }

  addPass2(j: number, r: Pass2Result): void {
    const slot = this.jobSlot[j]!;
    const A = this.keysA!;
    const B = this.keysB!;
    const withB = B.length > 0 && r.keysB.length > 0;
    for (let u = 0; u < slot.length; u++) {
      const n = r.used[u];
      if (!n || slot[u] < 0) continue;
      const o = r.offset[u];
      A.set(r.keysA.subarray(o * 2, (o + n) * 2), slot[u] * 2);
      if (withB) B.set(r.keysB.subarray(o, o + n), slot[u]);
    }
    this.jobUsed[j] = r.used;
    this.jobSpans[j] = r.spans;
    this.jobChunkOff[j] = r.chunkOff;
  }

  /** After pass 2: the keys closed up, the tracks' table, and the dataset standing for them. */
  /** Milliseconds of each step of `finish`, for the load's report. */
  readonly finishMs: Record<string, number> = {};

  finish(name: string, entitySize?: number): LeanBuilt {
    let lapAt = performance.now();
    const lap = (k: string) => {
      const now = performance.now();
      this.finishMs[k] = Math.round(now - lapAt);
      lapAt = now;
    };
    const T = this.order!.length;
    const A = this.keysA!;
    const B = this.keysB!;
    const withB = B.length > 0;
    const offset = this.offset!;
    const wr = offset.slice(0, T);
    const lastT = new Float64Array(T).fill(-Infinity);
    // The tracks' chunk spans after the tracks: room for one a 64 keys of each track's room.
    const chunkAt = new Float64Array(T + 1);
    for (let i = 0; i < T; i++) chunkAt[i + 1] = chunkAt[i] + Math.ceil((offset[i + 1] - offset[i]) / CHUNK_KEYS);
    const head = Math.max(1, T) * TRACK_U32;
    const trackData = new Uint32Array(head + chunkAt[T] * CHUNK_U32);
    const f32 = new Float32Array(trackData.buffer);
    const CT = f32.subarray(head);
    const buf = new Float64Array(CHUNK_KEYS * 4);
    /** Key `k` (absolute) as numbers into `buf` at `q`, from the span at `so` of `S`. */
    const decode = (S: Float32Array, so: number, k: number, q: number) => {
      const a = A[k * 2];
      const c = A[k * 2 + 1];
      const st = S[so + 3];
      buf[q * 4] = S[so] + (a & 0xffff) * st;
      buf[q * 4 + 1] = S[so + 1] + (a >>> 16) * st;
      buf[q * 4 + 2] = S[so + 2] + (c & 0xffff) * st;
      buf[q * 4 + 3] = S[so + 4] + (c >>> 16) * S[so + 5];
    };
    // Each track's runs closed up, in job order; a key not after the one before is dropped.
    for (let j = 0; j < this.jobs.length; j++) {
      const ids = this.jobUnits[j]!;
      const slot = this.jobSlot[j]!;
      const used = this.jobUsed[j];
      const RS = this.jobSpans[j]!;
      const RC = this.jobChunkOff[j]!;
      if (!used) continue;
      for (let u = 0; u < ids.length; u++) {
        const n = used[u];
        if (!n || slot[u] < 0) continue;
        const tr = this.trackOfUnit![ids[u]];
        const s0 = slot[u];
        const runSpan = (k: number) => (RC[u] + (k >> CHUNK_SHIFT)) * CHUNK_U32;
        const timeOf = (k: number) => {
          const so = runSpan(k);
          return RS[so + 4] + (A[(s0 + k) * 2 + 1] >>> 16) * RS[so + 5];
        };
        let k0 = 0;
        while (k0 < n && timeOf(k0) <= lastT[tr]) k0++;
        if (k0 >= n) continue;
        const dst = wr[tr];
        const len = dst - offset[tr];
        const m = n - k0;
        const lastTime = timeOf(n - 1);
        if (k0 === 0 && (len & (CHUNK_KEYS - 1)) === 0) {
          // The run starts the track's next chunk: its keys and spans as they are.
          if (dst !== s0) {
            A.copyWithin(dst * 2, s0 * 2, (s0 + n) * 2);
            if (withB) B.copyWithin(dst, s0, s0 + n);
          }
          const c = Math.ceil(n / CHUNK_KEYS);
          CT.set(RS.subarray(RC[u] * CHUNK_U32, (RC[u] + c) * CHUNK_U32), (chunkAt[tr] + (len >> CHUNK_SHIFT)) * CHUNK_U32);
        } else {
          // Counted again, from the track's last chunk on: its keys first, then the run's.
          let c = len >> CHUNK_SHIFT;
          let q = 0;
          const own = (chunkAt[tr] + c) * CHUNK_U32;
          for (let k = offset[tr] + (c << CHUNK_SHIFT); k < dst; k++) decode(CT, own, k, q++);
          for (let k = k0; k < n; k++) {
            decode(RS, runSpan(k), s0 + k, q);
            if (withB) B[dst + k - k0] = B[s0 + k];
            if (++q === CHUNK_KEYS) {
              encodeChunk(buf, q, A, offset[tr] + (c << CHUNK_SHIFT), CT, (chunkAt[tr] + c) * CHUNK_U32);
              c++;
              q = 0;
            }
          }
          if (q) encodeChunk(buf, q, A, offset[tr] + (c << CHUNK_SHIFT), CT, (chunkAt[tr] + c) * CHUNK_U32);
        }
        // The run's attitudes on the same side as the key before it, as within a run, so slerps take the short arc.
        if (withB && dst > offset[tr] && quatDot(B[dst - 1], B[dst]) < 0) for (let k = dst; k < dst + m; k++) B[k] = negQuat(B[k]);
        wr[tr] = dst + m;
        lastT[tr] = lastTime;
      }
    }
    this.jobSpans = [];
    this.jobChunkOff = [];
    lap('runs');
    // Then the tracks closed up.
    let cursor = 0;
    for (let i = 0; i < T; i++) {
      const s = offset[i];
      const n = wr[i] - s;
      if (cursor !== s && n > 0) {
        A.copyWithin(cursor * 2, s * 2, (s + n) * 2);
        if (withB) B.copyWithin(cursor, s, s + n);
      }
      const o = i * TRACK_U32;
      trackData[o] = cursor;
      trackData[o + 1] = n;
      trackData[o + 7] = head + chunkAt[i] * CHUNK_U32;
      cursor += n;
    }
    const keys = cursor;
    // Views, not copies: a copy of gigabytes of keys would double the peak for the few dropped.
    const keysA = A.subarray(0, keys * 2);
    const keysB = withB ? B.subarray(0, keys) : new Uint32Array(0);
    this.keysA = null;
    this.keysB = null;

    lap('closeUp');
    // The standing-in dataset: each track's first and last key, and what it is.
    const order = this.order!;
    const spans = this.spans!;
    const groupStart = this.groupStart.map((v) => (Number.isFinite(v) ? v : 0));
    const rows = T * 2;
    const px = new Float32Array(rows);
    const py = new Float32Array(rows);
    const pz = new Float32Array(rows);
    const time = new Float64Array(rows);
    const personIds = new Uint32Array(rows);
    const teamIds = new Uint32Array(rows);
    const groupIds = new Uint32Array(rows);
    const metaIds = this.spec.meta.map(() => new Uint32Array(rows));
    const personLabels: string[] = new Array(T);
    const trackGroup = new Uint32Array(T);
    const trackFile = new Uint32Array(T);
    const trackRows = new Float64Array(T * 2);
    const trackKey: string[] = new Array(T);
    const trackMatch: string[] = new Array(T);
    for (let i = 0; i < T; i++) {
      const g = order[i];
      const grp = this.uGroup.data[g];
      const o = i * SPAN;
      const t0rel = spans[o + 4] - groupStart[grp];
      const tr = i * TRACK_U32;
      f32[tr + 8] = spans[o];
      f32[tr + 9] = spans[o + 1];
      f32[tr + 10] = spans[o + 2];
      f32[tr + 11] = spans[o + 3];
      f32[tr + 12] = t0rel;
      f32[tr + 13] = spans[o + 5];
      const first = trackData[tr];
      const n = trackData[tr + 1];
      const cs = (k: number) => trackData[tr + 7] - head + ((k - first) >> CHUNK_SHIFT) * CHUNK_U32;
      // Held past its last key a few of its own sample intervals (`data/despawn.ts`), plus one.
      f32[tr + 14] = holdFor(keyInterval(keysA, CT, trackData[tr + 7] - head, first, n)) + 1;
      // A wreck from its death on, across its own samples' times (`data/deaths.ts`).
      const dt = this.uDeath.data[g];
      if (dt < Infinity) setDeadSpan(trackData, tr, packDeadSpan(dt, Infinity, this.uBox.data[g * BOX + 6], this.uBox.data[g * BOX + 7]));
      for (let e = 0; e < 2; e++) {
        const k = e === 0 ? first : first + Math.max(0, n - 1);
        const r = i * 2 + e;
        if (!n) {
          px[r] = spans[o];
          py[r] = spans[o + 1];
          pz[r] = spans[o + 2];
          time[r] = t0rel;
        } else {
          const so = cs(k);
          const a = keysA[k * 2];
          const c = keysA[k * 2 + 1];
          px[r] = CT[so] + (a & 0xffff) * CT[so + 3];
          py[r] = CT[so + 1] + (a >>> 16) * CT[so + 3];
          pz[r] = CT[so + 2] + (c & 0xffff) * CT[so + 3];
          // The keys' times are from the origin; the dataset's from each match's start, its origin the least.
          time[r] = CT[so + 4] + (c >>> 16) * CT[so + 5] + this.origin;
        }
        personIds[r] = i;
        teamIds[r] = this.uTeam.data[g];
        groupIds[r] = grp;
        for (let m = 0; m < metaIds.length; m++) metaIds[m][r] = this.uMeta[m].data[g];
      }
      personLabels[i] = `${this.uKey[g]} · ${this.groupLabel[grp]}`;
      trackGroup[i] = grp;
      trackFile[i] = this.uFile.data[g];
      trackRows[i * 2] = this.uFirst.data[g];
      trackRows[i * 2 + 1] = this.uLast.data[g];
      trackKey[i] = this.uKey[g];
      trackMatch[i] = this.uMatch[g];
    }
    const groupCol = this.spec.match ?? 'match';
    const attrs: BlockAttr[] = this.spec.meta
      .map((m, k): BlockAttr => ({ name: m, kind: 'category', data: metaIds[k], categories: this.metaDict[k].labels }))
      .filter((a) => a.name !== groupCol && a.name !== this.spec.team);
    attrs.push({ name: groupCol, kind: 'category', data: groupIds, categories: [...this.groupLabel] });
    const block: SourceBlock = {
      rows,
      px,
      py,
      pz,
      time,
      timeIsAbsolute: false,
      yaw: null,
      pitch: null,
      personIds,
      personLabels,
      teamIds: this.spec.team ? teamIds : null,
      teamLabels: this.teamDict.labels,
      sessionIds: null,
      sessionLabels: [],
      attrs,
      rejected: 0,
    };
    lap('tracks');
    const b = new DatasetBuilder(rows);
    b.append(block);
    const dataset = b.finish(name);
    lap('dataset');
    if (entitySize) dataset.entitySize = entitySize;
    dataset.roleColumns = { x: this.spec.x, y: this.spec.y ?? undefined, z: this.spec.z ?? undefined, time: this.spec.time, person: this.spec.track, team: this.spec.team ?? undefined };
    // The dataset's times count from its first; the tracks' with them.
    const origin = dataset.timeOrigin ?? 0;
    if (origin) for (let i = 0; i < T; i++) f32[i * TRACK_U32 + 12] -= origin;
    const trackRow = new Int32Array(T).fill(-1);
    if (dataset.personId) for (let r = dataset.count - 1; r >= 0; r--) trackRow[dataset.personId[r]] = r;

    // Deaths, in overlay seconds, by team.
    const M = this.mT.length;
    const mData = new Float32Array(M * 4);
    const mTeam = new Uint16Array(M);
    const teamIdx = new Map(dataset.teamLabels.map((l, i) => [l, i]));
    for (let i = 0; i < M; i++) {
      mData[i * 4] = this.mPos[i * 3];
      mData[i * 4 + 1] = this.mPos[i * 3 + 1];
      mData[i * 4 + 2] = this.mPos[i * 3 + 2];
      mData[i * 4 + 3] = this.mT[i] - groupStart[this.mGroup[i]] - origin;
      mTeam[i] = teamIdx.get(this.mTeam[i]) ?? 0xffff;
    }
    const { samples } = this.totals();
    return {
      dataset,
      tracks: T,
      trackData,
      keysA,
      keysB,
      keys,
      samples,
      level: this.level,
      tolerance: KEY_LEVELS[this.level],
      trackRow,
      trackGroup,
      trackFile,
      trackRows,
      trackKey,
      trackMatch,
      groups: [...this.groupLabel],
      groupMatch: [...this.groupMatch],
      groupStart: Float64Array.from(groupStart),
      origin,
      spec: this.spec,
      files: this.files.map((f) => f.name),
      markers: { count: M, data: mData, team: mTeam, group: Uint32Array.from(this.mGroup) },
      rows: this.rowsRead,
      empty: this.units - T,
    };
  }
}

/** The median time between a track's keys (spans from `cb` of `CT`), from at most a few hundred of them; NaN for one key. */
function keyInterval(keysA: Uint32Array, CT: Float32Array, cb: number, first: number, n: number): number {
  if (n < 2) return NaN;
  const stride = Math.max(1, Math.floor((n - 1) / 400));
  const gaps: number[] = [];
  const timeOf = (k: number) => {
    const so = cb + ((k - first) >> CHUNK_SHIFT) * CHUNK_U32;
    return CT[so + 4] + (keysA[k * 2 + 1] >>> 16) * CT[so + 5];
  };
  let prev = timeOf(first);
  for (let k = first + stride; k < first + n; k += stride) {
    const tq = timeOf(k);
    if (tq > prev) gaps.push((tq - prev) / stride);
    prev = tq;
  }
  if (!gaps.length) return NaN;
  gaps.sort((a, b) => a - b);
  return gaps[gaps.length >> 1];
}

/**
 * Leaves out the strings a track has that the page can make again (its label
 * and its match), for the message to the page: millions of tracks' strings do
 * not fit one structured clone. `restoreTrackStrings` puts them back.
 */
export function stripTrackStrings(b: LeanBuilt): void {
  b.dataset.personLabels = [];
  b.trackMatch = [];
}

/** The strings `stripTrackStrings` left out, made again from each track's key and match, as `finish` makes them. */
export function restoreTrackStrings(b: LeanBuilt): void {
  const T = b.tracks;
  const labels: string[] = new Array(T);
  const match: string[] = new Array(T);
  for (let i = 0; i < T; i++) {
    const g = b.trackGroup[i];
    labels[i] = `${b.trackKey[i]} · ${b.groups[g]}`;
    match[i] = b.groupMatch[g];
  }
  b.dataset.personLabels = labels;
  b.trackMatch = match;
}
