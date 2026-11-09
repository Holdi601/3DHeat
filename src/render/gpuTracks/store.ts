/**
 * Tracks for the GPU: every tracked thing's keyframes in two flat typed
 * arrays, built once a dataset, so a compute pass can place every unit at the
 * playhead and the CPU does nothing per unit per frame. What the figure
 * overlay of hundreds or thousands of matches is drawn from.
 *
 * Per key 12 bytes: x, y, z and t in 16 bits each, across the span of the
 * `CHUNK_KEYS` keys around it (a fighter's 16 s at 300 m/s in 7 cm and
 * 0.25 ms steps, wherever in a theatre and however long the recording; a
 * soldier's in well under a millimetre), and the attitude as a
 * quaternion in four signed bytes (0.5 degree). Velocities are not stored: the shader takes them from the
 * neighbouring keys, the three-point estimate `motion.ts` uses, so the curve
 * on the GPU is the curve on the CPU.
 *
 * Lossless by default: every own position sample is a key (doubled times
 * dropped). Only when the keys would not fit the GPU's largest buffer is the
 * data reduced, adaptively: a sample is left out while the curve through the
 * ones kept stays within `tolerance` metres of it (dead-reckoning test from
 * the last kept key at its velocity), with at most `MAX_GAP` seconds between
 * keys. The tolerance used and what it cost are kept, to be shown.
 *
 * Per track 64 bytes: first key, key count, team colour (rgba8), full and
 * coarse mesh index (the far one in slot 6), the figure's longest side,
 * flags (air: turns with its pitch and roll; attitude: has one; weapon: a
 * missile, rocket or bomb, drawn with a streak behind it), the dead span
 * in the upper halves of slots 5 and 6 (`setDeadSpan`), and the
 * span its keys are in: origin x, y, z and the step of a position unit
 * (slots 8-11), first time and the step of a time unit (12-13), and the
 * seconds it is held past its last key plus one (14; 0 for the viewer's
 * lifetime alone, `data/despawn.ts`), and what it is far off - domain,
 * symbol class and team (15, `figures/symbolClass.ts`). Slot 7: where in the same table the
 * track's chunk spans start (u32), one of `CHUNK_U32` per `CHUNK_KEYS` keys
 * laid out as slots 8-13; 0 where every key is in the track's span (the lean
 * overlay's). Over a whole track 16 bits are too coarse for a long or
 * theatre-sized one (five hours in 0.27 s steps: 80 m along the path of a
 * fast jet), so keys count from their chunk's span; the track's span stays
 * as its bounds.
 */

import type { Dataset } from '../../state/types';
import { teamMemberColor } from '../colors';
import { FigureReplay } from '../../figures/replay';
import { meshOf, type FigureMesh } from '../../figures/instances';
import { poseFrame } from '../../figures/kit';
import { positionRows, quatOfFrame } from '../../figures/motion';
import { CATALOG } from '../../figures/catalog';
import { endsOf, holdAfterKeys } from '../../data/despawn';
import { FRESH, sliceBudget, sliced, WAIT, type SliceJob } from '../../data/slices';
import type { ModelAnswer } from '../../figures/modelWorker';
import { deadInSpan, deathsOf, lastDeadSpan, packDeadSpan } from '../../data/deaths';
import { aimOf, type AimNow } from '../../figures/aim';
import { CHUNK_KEYS, CHUNK_SHIFT, CHUNK_U32 } from './chunks';
import { dartIndex, dartMeshes } from '../symbols/darts';
import { classify, Domain, isEffectDomain, isWeaponDomain, packWord } from '../../figures/symbolClass';

export { CHUNK_KEYS, CHUNK_SHIFT, CHUNK_U32, encodeChunk } from './chunks';

export const TRACK_U32 = 16;
export const KEY_U32 = 2;
/**
 * Keys one GPU buffer of x, y, z, t holds (8 bytes each, just under the 2 GB
 * a WebGPU buffer may be): beyond them the keys go on in a second buffer, so
 * the GPU tracks hold up to `KEY_BUFFERS` times this many.
 */
export const KEYS_PER_BUFFER = (1 << 28) - (1 << 16);
export const KEY_BUFFERS = 2;
/** Steps a coordinate or the time spans within a chunk or track (16 bits). */
const STEPS = 65535;
/** Most seconds between two keys when the data is reduced. */
const MAX_GAP = 4;
/** Tolerances tried, metres, when lossless does not fit. */
const TOLERANCES = [0.5, 1, 2, 5, 10, 20, 50, 100];

export const FLAG_AIR = 1;
export const FLAG_ATTITUDE = 2;
export const FLAG_WEAPON = 4;
/** Slot 14 of a track the data says lives on past its last key: held until the recording ends, not by the viewer's lifetime. */
export const HOLD_ON = 2e9;
/** The track has turret and gun keys (`keysAim`). */
export const FLAG_AIM = 8;
/** A packed aim half that is not there. */
export const AIM_NONE = 0xffff;

/** A turret yaw (radians) and gun elevation (radians) in one u32: 16 bits each across a turn and a half turn; `AIM_NONE` for either missing. */
export function packAim(yaw: number, pitch: number): number {
  const y = Number.isFinite(yaw) ? Math.round(((((yaw + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * 65534) : AIM_NONE;
  const p = Number.isFinite(pitch) ? Math.round((Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)) + Math.PI / 2) / Math.PI * 65534) : AIM_NONE;
  return (y | (p << 16)) >>> 0;
}

/** `packAim` undone: [yaw, pitch], NaN for a missing half. */
export function unpackAim(v: number): [number, number] {
  const y = v & 0xffff;
  const p = v >>> 16;
  return [y === AIM_NONE ? NaN : (y / 65534) * 2 * Math.PI - Math.PI, p === AIM_NONE ? NaN : (p / 65534) * Math.PI - Math.PI / 2];
}

/**
 * A track's dead span (`data/deaths.ts` `packDeadSpan`) in its slots: the
 * death in the upper half of slot 5 (the flags keep the lower), the return
 * to life in the upper half of slot 6 (the far mesh keeps the lower).
 */
export function setDeadSpan(trackData: Uint32Array, o8: number, packed: number): void {
  trackData[o8 + 5] = ((trackData[o8 + 5] & 0xffff) | ((packed & 0xffff) << 16)) >>> 0;
  trackData[o8 + 6] = ((trackData[o8 + 6] & 0xffff) | (packed & 0xffff0000)) >>> 0;
}

/** Whether track `i` is a wreck at fraction `frac` of its keys, first to last (`setDeadSpan`). */
export function trackDeadAt(trackData: Uint32Array, i: number, frac: number): boolean {
  const o = i * TRACK_U32;
  return deadInSpan(((trackData[o + 5] >>> 16) | (trackData[o + 6] & 0xffff0000)) >>> 0, frac);
}

/** Deaths to mark: x, y, z and the time a marker, and its team colour (rgba8). */
export interface TrackMarkers {
  count: number;
  data: Float32Array;
  colour: Uint32Array;
}

export interface GpuTrackStore {
  readonly dataset: Dataset;
  readonly tracks: number;
  /** TRACK_U32 a track. */
  readonly trackData: Uint32Array;
  /** KEY_U32 a key: x | y << 16, z | t << 16, each 16 bits across its track's span (`decodeKey`). */
  readonly keysA: Uint32Array;
  /** One a key: the attitude, snorm8 x4 (x, y, z, w). */
  readonly keysB: Uint32Array;
  /** The row each key was made from (CPU only, for labels and cards); null where a row stands for a whole track (`trackRow`). */
  readonly keyRow: Int32Array | null;
  /**
   * One a key where the data has turrets and guns (`figures/aim.ts`): the
   * turret's yaw and the gun's elevation (`packAim`). Uploaded after the
   * tracks, in the same buffer; the tracks it is for carry `FLAG_AIM`.
   */
  readonly keysAim?: Uint32Array | null;
  /** The row standing for each track, where keys have no rows of their own (the lean overlay). */
  readonly trackRow?: Int32Array;
  /** Deaths to mark, where the data has them. */
  readonly markers?: TrackMarkers | null;
  readonly keys: number;
  /** First the darts, the far stand-ins, one a domain (`symbols/darts.ts`); then each figure's full, coarse and far builds. */
  readonly meshes: FigureMesh[];
  /** Per mesh, how many tracks may draw with it: the room its instances need. */
  readonly meshTracks: Uint32Array;
  /** Track -> person, person -> track (-1: none). */
  readonly personOf: Int32Array;
  readonly trackOf: Int32Array;
  /** Data units in a metre. */
  readonly units: number;
  /** 0: every sample kept; else the metres a reduced curve stays within. */
  readonly tolerance: number;
  readonly samples: number;
  /** Bytes on the GPU for tracks and keys. */
  readonly bytes: number;
  readonly buildMs: number;
}

const DARTS = dartMeshes();

function packQuat(q: ArrayLike<number>): number {
  const b = (x: number) => (Math.round(Math.max(-1, Math.min(1, x)) * 127) & 0xff) >>> 0;
  return (b(q[0]) | (b(q[1]) << 8) | (b(q[2]) << 16) | (b(q[3]) << 24)) >>> 0;
}

function rgba8(r: number, g: number, b: number): number {
  const c = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 255);
  return (c(r) | (c(g) << 8) | (c(b) << 16) | (255 << 24)) >>> 0;
}

/**
 * What tracks are drawn as: each track's figure (by its row's name and type
 * columns), its full, coarse and far meshes, longest side and flags, and its
 * team colour (or a colour of its own group's, where asked) - slots 2 to 6.
 */
/** A kind's models as the model worker built them, once a session: pure geometry, the same for every load. */
interface KindModels {
  full: FigureMesh;
  coarse: FigureMesh | null;
  far: FigureMesh | null;
  longest: number;
  air: boolean;
}

/** Ids for the meshes the worker built: far above the ones `meshOf` counts up from, so the two never meet. */
let workerMeshId = 1 << 30;
/** Above 0 while a store is built whole (`gpuTrackStore`): the kinds are built on this thread then. */
let syncBuild = 0;
let modelWorker: Worker | null | undefined;
const kindJobs = new Map<string, { done: boolean; value: KindModels | null; failed: boolean }>();

/**
 * A kind's models from the worker (`figures/modelWorker.ts`), asked for once:
 * done when they are back. Null where there is no worker (tests, tools) or
 * work is not sliced - the caller builds them itself.
 */
function kindModels(kind: string): { done: boolean; value: KindModels | null; failed: boolean } | null {
  if (sliceBudget.ms === Infinity || syncBuild > 0) return null;
  const hit = kindJobs.get(kind);
  if (hit) return hit;
  if (modelWorker === undefined) {
    try {
      modelWorker = typeof Worker === 'undefined' ? null : new Worker(new URL('../../figures/modelWorker.ts', import.meta.url), { type: 'module' });
    } catch {
      modelWorker = null;
    }
    if (modelWorker) {
      modelWorker.onmessage = (e: MessageEvent<ModelAnswer>) => {
        const job = kindJobs.get(e.data.kind);
        if (!job) return;
        const m = e.data.models;
        const adopt = (x: { data: Float32Array; count: number } | null): FigureMesh | null => (x ? { id: workerMeshId++, data: x.data, count: x.count } : null);
        job.value = m ? { full: adopt(m.full)!, coarse: adopt(m.coarse), far: adopt(m.far), longest: m.longest, air: m.air } : null;
        job.failed = !!e.data.error;
        job.done = true;
      };
      // A worker that cannot start: every kind asked of it is built here instead.
      modelWorker.onerror = () => {
        for (const job of kindJobs.values()) if (!job.done) Object.assign(job, { done: true, failed: true });
        modelWorker = null;
      };
    }
  }
  if (!modelWorker) return null;
  const job = { done: false, value: null as KindModels | null, failed: false };
  kindJobs.set(kind, job);
  modelWorker.postMessage({ kind });
  return job;
}

export class TrackFigures {
  readonly meshes: FigureMesh[] = [...DARTS];
  /** Per mesh, the tracks that may draw with it. */
  readonly meshTracks = new Uint32Array(0x10000);
  private readonly meshIndex = new Map<FigureMesh, number>(DARTS.map((m, i) => [m, i]));
  private readonly kindMeshes = new Map<string, { full: number; coarse: number; far: number; longest: number; air: boolean } | null>();
  private readonly fr = new FigureReplay();
  private readonly knows: boolean;

  constructor(private readonly d: Dataset) {
    this.knows = this.fr.knowsTypes(d);
  }

  private meshFor(m: FigureMesh): number {
    let i = this.meshIndex.get(m);
    if (i === undefined) {
      i = this.meshes.length;
      this.meshes.push(m);
      this.meshIndex.set(m, i);
    }
    return i;
  }

  /** The figure kind for a dataset row (null: a dart). */
  kindAt(row: number): string | null {
    return this.fr.kindOf(this.d, row) ?? (this.knows ? null : 'soldier');
  }

  /**
   * Slots 2 to 6 of the track at u32 offset `o8`, for person `p` drawn from
   * dataset row `row`. `colour` overrides the team colour (rgb 0..1); `weapon`
   * marks a weapon its figure does not say is one.
   */
  /**
   * A kind's models built ahead of `place`, a piece a step: the template, its
   * full, coarse and far meshes - each up to tens of milliseconds for a ship,
   * each a slice's step of its own (`data/slices.ts` FRESH).
   */
  *prepare(kind: string | null): SliceJob<void> {
    if (!kind || this.kindMeshes.has(kind)) return;
    // From the model worker where there is one: this thread only waits.
    const job = kindModels(kind);
    if (job) {
      while (!job.done) yield WAIT;
      if (!job.failed) {
        const v = job.value;
        if (!v) this.kindMeshes.set(kind, null);
        else {
          const full = this.meshFor(v.full);
          const coarse = v.coarse ? this.meshFor(v.coarse) : full;
          this.kindMeshes.set(kind, { full, coarse, far: v.far ? this.meshFor(v.far) : coarse, longest: v.longest, air: v.air });
        }
        return;
      }
    }
    yield FRESH;
    const t = this.fr.templateOf(kind);
    if (!t) {
      this.kindMeshes.set(kind, null);
      return;
    }
    yield FRESH;
    const full = this.meshFor(meshOf(t));
    yield FRESH;
    const c = t.coarse?.();
    yield FRESH;
    const coarse = c ? this.meshFor(meshOf(c)) : full;
    yield FRESH;
    const fa = t.far?.();
    yield FRESH;
    const far = fa ? this.meshFor(meshOf(fa)) : coarse;
    this.kindMeshes.set(kind, { full, coarse, far, longest: Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.1), air: t.anchor === 'centre' });
  }

  place(trackData: Uint32Array, f32: Float32Array, o8: number, p: number, row: number, attitude: boolean, colour?: [number, number, number] | null, weapon = false): void {
    const d = this.d;
    let kind = row >= 0 ? this.kindAt(row) : null;
    let km = kind ? this.kindMeshes.get(kind) : undefined;
    if (kind && km === undefined) {
      const t = this.fr.templateOf(kind);
      if (t) {
        const full = this.meshFor(meshOf(t));
        const c = t.coarse?.();
        const coarse = c ? this.meshFor(meshOf(c)) : full;
        const fa = t.far?.();
        const far = fa ? this.meshFor(meshOf(fa)) : coarse;
        km = { full, coarse, far, longest: Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.1), air: t.anchor === 'centre' };
      } else km = null;
      this.kindMeshes.set(kind, km);
    }
    if (!km) kind = null;
    const persons = Math.max(1, d.personLabels.length);
    const team = d.personTeam ? d.personTeam[p] : 0;
    const [cr, cg, cb] = colour ?? teamMemberColor(team, d.personSlot ? d.personSlot[p] : p, d.teamSizes ? d.teamSizes[team] : persons);
    trackData[o8 + 2] = rgba8(cr, cg, cb);
    trackData[o8 + 3] = km ? (km.full | (km.coarse << 16)) >>> 0 : 0;
    f32[o8 + 4] = km ? km.longest : 1;
    // The upper halves of slots 5 and 6 are the dead span's (`setDeadSpan`), kept.
    trackData[o8 + 5] = ((trackData[o8 + 5] & 0xffff0000) | (km && km.air ? FLAG_AIR : 0) | (attitude ? FLAG_ATTITUDE : 0) | (weapon || isWeaponKind(kind) ? FLAG_WEAPON : 0)) >>> 0;
    trackData[o8 + 6] = ((trackData[o8 + 6] & 0xffff0000) | (km ? km.far : 0)) >>> 0;
    // What it is far off: its domain, symbol class and team (`symbolClass.ts`).
    const uc = classify(kind, row >= 0 ? this.fr.typeText(d, row) : '');
    trackData[o8 + 15] = packWord(uc, d.personTeam ? team : null);
    // Decoys and shells go with the weapons: hidden with them, streaked like them.
    if (isWeaponDomain(uc.domain) || (isEffectDomain(uc.domain) && uc.domain !== Domain.Misc)) trackData[o8 + 5] |= FLAG_WEAPON;
    if (km) for (const m of new Set([km.full, km.coarse, km.far])) this.meshTracks[m]++;
    this.meshTracks[dartIndex(uc.domain)]++;
  }
}

export interface BuildOptions {
  /** Most keys the GPU can hold (its largest buffer over 8 bytes). */
  maxKeys: number;
}

const cache = new WeakMap<Dataset, GpuTrackStore>();
const registered = new WeakSet<Dataset>();

/** Tracks built elsewhere (the lean overlay's loader) for a dataset that only stands for them. */
export function registerGpuTrackStore(d: Dataset, s: GpuTrackStore): void {
  cache.set(d, s);
  registered.add(d);
}

/** The tracks registered for `d`, which is drawn from them whatever its size; null for any other dataset. */
export function registeredGpuTrackStore(d: Dataset | null): GpuTrackStore | null {
  return d && registered.has(d) ? (cache.get(d) ?? null) : null;
}

/** Whether `b` differs from `a` only in its tracks' table (colours, say): the keys, meshes and markers are the same. */
export function sameKeys(a: GpuTrackStore, b: GpuTrackStore): boolean {
  return a.keysA === b.keysA && a.keysB === b.keysB && a.tracks === b.tracks && a.markers?.data === b.markers?.data && a.meshes.length === b.meshes.length && a.meshes.every((m, i) => m === b.meshes[i]);
}

/** The dataset row for key `key` of track `track`. */
export function rowOfKey(s: GpuTrackStore, track: number, key: number): number {
  return s.keyRow ? s.keyRow[key] : (s.trackRow?.[track] ?? -1);
}

/** Whether a figure kind is a weapon in flight (a missile, rocket or bomb). */
export function isWeaponKind(kind: string | null): boolean {
  return !!kind && CATALOG[kind.replace(/@.*$/, '')]?.domain === 'missile';
}

export function gpuTrackStore(d: Dataset, o: BuildOptions): GpuTrackStore | null {
  const hit = cache.get(d);
  if (hit) return hit;
  // Whole, here and now: no waiting on the model worker.
  syncBuild++;
  let s: GpuTrackStore | null;
  try {
    const g = buildSteps(d, o);
    let r = g.next();
    while (!r.done) r = g.next();
    s = r.value;
  } finally {
    syncBuild--;
  }
  if (s) cache.set(d, s);
  return s;
}

const slicedCache = new WeakMap<Dataset, GpuTrackStore | null>();
const slicedJobs = new WeakMap<Dataset, SliceJob<GpuTrackStore | null>>();

/**
 * `gpuTrackStore` worked out a slice a frame (`data/slices.ts`): the store
 * (or null: none for this data) once built, `undefined` while it is being
 * built - a recording of thousands of units takes half a second, and no
 * frame may wait for it.
 */
export function gpuTrackStoreSliced(d: Dataset, o: BuildOptions, after?: (s: GpuTrackStore) => SliceJob<void>): GpuTrackStore | null | undefined {
  const hit = cache.get(d);
  if (hit) return hit;
  const s = sliced(slicedCache, slicedJobs, d, function* () {
    const s = yield* buildSteps(d, o);
    // What the first frames would work out on it (`after`): done in the same slices.
    if (s && after) yield* after(s);
    return s;
  });
  if (s) cache.set(d, s);
  return s;
}

function* buildSteps(d: Dataset, o: BuildOptions): SliceJob<GpuTrackStore | null> {
  const t0 = performance.now();
  const { time, personId, px, py, pz, count } = d;
  if (!time || !personId) return null;
  const persons = Math.max(1, d.personLabels.length);
  const units = d.entitySize ? d.entitySize / 0.8 : 1;
  const { own, ids } = positionRows(d);

  // Rows per person, in time order (the rows are), own positions only.
  const start = new Int32Array(persons + 1);
  for (let r = 0; r < count; r++) {
    if ((r & 0xffff) === 0) yield;
    if ((!own || own[ids![r]]) && Number.isFinite(px[r])) start[personId[r] + 1]++;
  }
  for (let p = 0; p < persons; p++) start[p + 1] += start[p];
  const rows = new Int32Array(start[persons]);
  const fill = start.slice(0, persons);
  for (let r = 0; r < count; r++) {
    if ((r & 0xffff) === 0) yield;
    if ((!own || own[ids![r]]) && Number.isFinite(px[r])) rows[fill[personId[r]]++] = r;
  }
  const samples = rows.length;
  yield;

  /** Marks the rows kept as keys at a tolerance (0: all but doubled times); returns how many. */
  const held = heldSamples(rows, start, persons, px, py, pz, time, units);
  yield;
  const keep = new Uint8Array(samples);
  const choose = function* (tol: number): Generator<void, number, void> {
    let n = 0;
    const tolU = tol * units;
    let since = 0;
    for (let p = 0; p < persons; p++) {
      const a = start[p];
      since += start[p + 1] - a;
      if (since > 0x8000) {
        since = 0;
        yield;
      }
      const b = start[p + 1];
      let last = -1;
      let vx = 0, vy = 0, vz = 0;
      for (let k = a; k < b; k++) {
        const r = rows[k];
        keep[k] = 0;
        if (held[k]) continue;
        if (last >= 0 && time[r] - time[rows[last]] < 1e-3) continue;
        if (last >= 0 && tol > 0 && k !== b - 1) {
          const lr = rows[last];
          const dt = time[r] - time[lr];
          if (dt < MAX_GAP) {
            const ex = px[r] - (px[lr] + vx * dt);
            const ey = py[r] - (py[lr] + vy * dt);
            const ez = pz[r] - (pz[lr] + vz * dt);
            if (ex * ex + ey * ey + ez * ez <= tolU * tolU) continue;
          }
        }
        keep[k] = 1;
        n++;
        // The velocity at this key, from its raw neighbours: what the next samples are tested against.
        const r0 = rows[Math.max(a, k - 1)];
        const r1 = rows[Math.min(b - 1, k + 1)];
        const h = time[r1] - time[r0];
        if (h > 1e-6) {
          vx = (px[r1] - px[r0]) / h;
          vy = (py[r1] - py[r0]) / h;
          vz = (pz[r1] - pz[r0]) / h;
        } else vx = vy = vz = 0;
        last = k;
      }
    }
    return n;
  };
  let tolerance = 0;
  let keys = yield* choose(0);
  for (const tol of TOLERANCES) {
    if (keys <= o.maxKeys) break;
    tolerance = tol;
    keys = yield* choose(tol);
  }
  if (keys > o.maxKeys) return null;

  // What each track is drawn as.
  const figures = new TrackFigures(d);
  // Every kind asked of the model worker at once, so it builds them while the keys are worked out.
  for (let p = 0; p < persons; p++) {
    if ((p & 255) === 255) yield;
    const a = start[p];
    if (a < start[p + 1]) {
      const kind = figures.kindAt(rows[a]);
      if (kind) kindModels(kind);
    }
  }
  const rollCol = d.attrs.find((a) => a.kind !== 'category' && /^roll$/i.test(a.name.trim()));
  const roll = rollCol ? (rollCol.data as Float32Array) : null;

  let chunkCount = 0;
  for (let p = 0; p < persons; p++) {
    let n = 0;
    for (let k = start[p]; k < start[p + 1]; k++) n += keep[k];
    chunkCount += Math.ceil(n / CHUNK_KEYS);
  }
  const trackData = new Uint32Array(persons * TRACK_U32);
  const f32 = new Float32Array(trackData.buffer);
  const chunkData = new Uint32Array(chunkCount * CHUNK_U32);
  const chunkF = new Float32Array(chunkData.buffer);
  const kept = new Int32Array(samples);
  let chunkAt = 0;
  const keysA = new Uint32Array(keys * KEY_U32);
  const keysB = new Uint32Array(keys);
  const keyRow = new Int32Array(keys);
  const personOf = new Int32Array(persons);
  const trackOf = new Int32Array(persons).fill(-1);
  const ends = endsOf(d);
  yield;
  const deaths = deathsOf(d);
  yield;
  const q: [number, number, number, number] = [0, 0, 0, 1];
  let tracks = 0;
  let key = 0;
  let meshesBefore = figures.meshes.length;
  let since = 0;
  for (let p = 0; p < persons; p++) {
    const a = start[p];
    const b = start[p + 1];
    if (a >= b) continue;
    if (d.personShared && d.personShared[p]) continue;
    // A slice's end now and then; and after a figure, which may have built its model (`TrackFigures.place`).
    since += b - a;
    if (since > 0x4000 || figures.meshes.length !== meshesBefore) {
      since = 0;
      meshesBefore = figures.meshes.length;
      yield;
    }
    const first = key;
    // The span of the kept keys: where the 16-bit steps are counted from, and how big one is.
    let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity, t0k = Infinity, t1k = -Infinity;
    for (let k = a; k < b; k++) {
      if (!keep[k]) continue;
      const r = rows[k];
      x0 = Math.min(x0, px[r]);
      x1 = Math.max(x1, px[r]);
      y0 = Math.min(y0, py[r]);
      y1 = Math.max(y1, py[r]);
      z0 = Math.min(z0, pz[r]);
      z1 = Math.max(z1, pz[r]);
      t0k = Math.min(t0k, time[r]);
      t1k = Math.max(t1k, time[r]);
    }
    if (!(t1k >= t0k)) continue;
    const step = Math.max(x1 - x0, y1 - y0, z1 - z0, 1e-6) / STEPS;
    const tStep = Math.max(t1k - t0k, 1e-6) / STEPS;
    let m = 0;
    for (let k = a; k < b; k++) if (keep[k]) kept[m++] = rows[k];
    const firstChunk = chunkAt;
    let lastQt = -1;
    for (let n = 0; n < m; n++) {
      const r = kept[n];
      if (n % CHUNK_KEYS === 0) {
        chunkSpan(px, py, pz, time, kept, n, Math.min(m, n + CHUNK_KEYS), chunkF, chunkAt);
        chunkAt += CHUNK_U32;
        lastQt = -1;
      }
      const c = chunkAt - CHUNK_U32;
      const st = chunkF[c + 3];
      // A step apart at least, so no two keys share a time (the samples are 1 ms apart at least).
      const qt = Math.min(STEPS, Math.max(lastQt + 1, q16(time[r], chunkF[c + 4], chunkF[c + 5])));
      lastQt = qt;
      const o2 = key * KEY_U32;
      keysA[o2] = (q16(px[r], chunkF[c], st) | (q16(py[r], chunkF[c + 1], st) << 16)) >>> 0;
      keysA[o2 + 1] = (q16(pz[r], chunkF[c + 2], st) | (qt << 16)) >>> 0;
      keyRow[key] = r;
      if (d.yaw) {
        const rl = roll ? (roll[r] * Math.PI) / 180 : 0;
        quatOfFrame(poseFrame({ x: 0, y: 0, z: 0, yaw: Math.PI - d.yaw[r], pitch: d.pitch ? d.pitch[r] || 0 : 0, roll: Number.isFinite(rl) ? rl : 0 }), q);
        // The same hemisphere as the key before, so the shader's slerp takes the short arc.
        if (key > first) {
          const pb = keysB[key - 1];
          const s8 = (v: number) => ((v & 0xff) << 24) >> 24;
          const dot = s8(pb) * q[0] + s8(pb >>> 8) * q[1] + s8(pb >>> 16) * q[2] + s8(pb >>> 24) * q[3];
          if (dot < 0) for (let i = 0; i < 4; i++) q[i] = -q[i];
        }
        keysB[key] = packQuat(q);
      }
      key++;
    }
    if (key === first) continue;
    // The figure, from the track's first own row.
    const o8 = tracks * TRACK_U32;
    trackData[o8] = first;
    trackData[o8 + 1] = key - first;
    trackData[o8 + 7] = firstChunk + 1;
    yield* figures.prepare(figures.kindAt(rows[a]));
    figures.place(trackData, f32, o8, p, rows[a], !!d.yaw);
    f32[o8 + 8] = x0;
    f32[o8 + 9] = y0;
    f32[o8 + 10] = z0;
    f32[o8 + 11] = step;
    f32[o8 + 12] = t0k;
    f32[o8 + 13] = tStep;
    // How long it is held past its last key, plus one (0: the viewer's lifetime alone; HOLD_ON: until the recording ends).
    const hold = holdAfterKeys(ends, p, t1k);
    f32[o8 + 14] = hold === Infinity ? HOLD_ON : hold + 1;
    // When it is a wreck: its last dead span, across its keys.
    const span = deaths.any ? lastDeadSpan(deaths, p) : null;
    if (span) setDeadSpan(trackData, o8, packDeadSpan(span[0], span[1], t0k, t1k));
    personOf[tracks] = p;
    trackOf[p] = tracks;
    tracks++;
  }
  // The chunk spans after the tracks: slot 7 from an index into them (plus one) to where they are.
  const head = Math.max(1, tracks) * TRACK_U32;
  const table = new Uint32Array(head + chunkAt);
  table.set(trackData.subarray(0, head));
  table.set(chunkData.subarray(0, chunkAt), head);
  for (let i = 0; i < tracks; i++) table[i * TRACK_U32 + 7] += head - 1;
  yield;
  return {
    dataset: d,
    tracks,
    trackData: table,
    keysA: keysA.subarray(0, key * KEY_U32),
    keysB: keysB.subarray(0, key),
    keyRow: keyRow.subarray(0, key),
    keysAim: aimKeys(d, keyRow.subarray(0, key), table, tracks),
    keys: key,
    meshes: figures.meshes,
    meshTracks: figures.meshTracks.slice(0, figures.meshes.length),
    personOf: personOf.subarray(0, tracks),
    trackOf,
    units,
    tolerance,
    samples,
    bytes: table.byteLength + key * (KEY_U32 * 4 + 4),
    buildMs: performance.now() - t0,
  };
}

/** The turret and gun at each key, where the data has them; marks the tracks that have them. */
function aimKeys(d: Dataset, keyRow: Int32Array, trackData: Uint32Array, tracks: number): Uint32Array | null {
  const aim = aimOf(d);
  if (!aim || !d.time) return null;
  const out = new Uint32Array(keyRow.length);
  const now: AimNow = { yaw: NaN, pitch: NaN };
  for (let k = 0; k < keyRow.length; k++) {
    const r = keyRow[k];
    aim.at(r, d.time[r], now);
    out[k] = packAim(now.yaw, now.pitch);
  }
  for (let i = 0; i < tracks; i++) trackData[i * TRACK_U32 + 5] |= FLAG_AIM;
  return out;
}

/**
 * Samples that only hold a moving unit's last position (`rows` grouped by
 * `start`): a run at one place, after it moved and before it moves on, under
 * `MAX_GAP` seconds, after which it is where its speed would have taken it.
 * A recording writes them where an update did not come in
 * time or a line changed the attitude alone (a DCS server's Tacview: a jet's
 * client late by a frame); as keys they would stop the unit and jump it on.
 * The first sample of the run is where the unit was then, and stays.
 */
export function heldSamples(rows: Int32Array, start: Int32Array, persons: number, px: ArrayLike<number>, py: ArrayLike<number>, pz: ArrayLike<number>, time: ArrayLike<number>, units: number): Uint8Array {
  const held = new Uint8Array(rows.length);
  const same = (i: number, j: number) => px[rows[i]] === px[rows[j]] && py[rows[i]] === py[rows[j]] && pz[rows[i]] === pz[rows[j]];
  const dist = (i: number, j: number) => Math.hypot(px[rows[j]] - px[rows[i]], py[rows[j]] - py[rows[i]], pz[rows[j]] - pz[rows[i]]);
  for (let p = 0; p < persons; p++) {
    const a = start[p];
    const b = start[p + 1];
    for (let k = a + 1; k < b - 1; k++) {
      if (!same(k, k - 1)) continue;
      // The run k - 1 .. e at one place.
      let e = k;
      while (e + 1 < b && same(e + 1, k - 1)) e++;
      const from = k - 1;
      if (from > a && e < b - 1 && time[rows[e + 1]] - time[rows[from]] < MAX_GAP) {
        const vIn = dist(from - 1, from) / Math.max(1e-3, time[rows[from]] - time[rows[from - 1]]);
        const vOut = dist(e, e + 1) / Math.max(1e-3, time[rows[e + 1]] - time[rows[from]]);
        // Moving into it (a metre a second at least), and the step out of it catching up the whole run at
        // about that speed: a unit that stops, however briefly, stays stopped.
        if (vIn > units && Math.abs(vOut - vIn) < 0.3 * vIn) for (let j = k; j <= e; j++) held[j] = 1;
      }
      k = e;
    }
  }
  return held;
}

const q16 = (v: number, o: number, st: number) => Math.max(0, Math.min(STEPS, Math.round((v - o) / st)));

/**
 * The span of keys `from` to `to` of `kept` (rows) into `out` at `o`, as the
 * float32 the GPU reads: the low corner and the first time as the data has
 * them, and steps just big enough for 16 bits to reach across.
 */
function chunkSpan(px: ArrayLike<number>, py: ArrayLike<number>, pz: ArrayLike<number>, time: ArrayLike<number>, kept: Int32Array, from: number, to: number, out: Float32Array, o: number): void {
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let n = from; n < to; n++) {
    const r = kept[n];
    x0 = Math.min(x0, px[r]);
    x1 = Math.max(x1, px[r]);
    y0 = Math.min(y0, py[r]);
    y1 = Math.max(y1, py[r]);
    z0 = Math.min(z0, pz[r]);
    z1 = Math.max(z1, pz[r]);
  }
  out[o] = x0;
  out[o + 1] = y0;
  out[o + 2] = z0;
  out[o + 3] = (Math.max(x1 - out[o], y1 - out[o + 1], z1 - out[o + 2], 1e-6) / STEPS) * (1 + 1e-6);
  out[o + 4] = time[kept[from]];
  out[o + 5] = (Math.max(time[kept[to - 1]] - out[o + 4], 1e-6) / STEPS) * (1 + 1e-6);
}

/** Where the span of key `j` of the track at u32 offset `b` is: its chunk's, else the track's own (slots 8-13). */
export function spanOfKey(trackData: Uint32Array, b: number, j: number): number {
  const c = trackData[b + 7];
  return c ? c + ((j - trackData[b]) >>> CHUNK_SHIFT) * CHUNK_U32 : b + 8;
}

// The track table's float view, kept: made anew per key it was a million views a frame
// (a pick over every unit), garbage that the collector then paused frames for.
let viewOf: Uint32Array | null = null;
let viewF32: Float32Array = new Float32Array(0);

/** `trackData` read as floats (the spans' slots): one view per table, not one per call. */
export function trackFloats(T: Uint32Array): Float32Array {
  if (viewOf !== T) {
    viewOf = T;
    viewF32 = new Float32Array(T.buffer, T.byteOffset, T.length);
  }
  return viewF32;
}

/** The time of key `j` of the track at u32 offset `b`. */
export function keyTime(s: GpuTrackStore, b: number, j: number): number {
  const f = trackFloats(s.trackData);
  const o = spanOfKey(s.trackData, b, j);
  return f[o + 4] + (s.keysA[j * KEY_U32 + 1] >>> 16) * f[o + 5];
}

/** Key `j` of the track at u32 offset `b` of `trackData`, decoded into `out` (x, y, z, t). */
export function decodeKey(s: GpuTrackStore, b: number, j: number, out: number[]): void {
  const f = trackFloats(s.trackData);
  const o = spanOfKey(s.trackData, b, j);
  const a = s.keysA[j * KEY_U32];
  const c = s.keysA[j * KEY_U32 + 1];
  const step = f[o + 3];
  out[0] = f[o] + (a & 0xffff) * step;
  out[1] = f[o + 1] + (a >>> 16) * step;
  out[2] = f[o + 2] + (c & 0xffff) * step;
  out[3] = f[o + 4] + (c >>> 16) * f[o + 5];
}
