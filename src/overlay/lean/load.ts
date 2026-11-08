/**
 * The lean overlay on the page: how many keys this machine can hold, the load
 * worker driven with progress and cancel, and the tracks it hands back made
 * ready to draw - what each unit is drawn as, its colour, the deaths - and
 * registered for the dataset that stands for them (`registerGpuTrackStore`),
 * so the engine draws that dataset from the GPU tracks.
 *
 * A unit's own rows are not kept; when one is picked, `unitRows` reads them
 * from its file again (only the row groups it is in).
 */

import { parquetMetadataAsync } from 'hyparquet';
import type { Dataset } from '../../state/types';
import { registerGpuTrackStore, TRACK_U32, TrackFigures, type GpuTrackStore } from '../../render/gpuTracks/store';
import { teamHeatColor, teamMemberColor } from '../../render/colors';
import { restoreTrackStrings, type LeanBuilt } from './assemble';
import type { LoadProgress, LoadRequest, LoadResponse } from './loadWorker';
import { asyncBuffer, readColumns } from './columns';
import { MAX_TAB_ARRAY_BYTES } from '../../data/memory';

/** Bytes a key takes on the CPU and on the GPU alike: x, y, z, t in 8 bytes, the attitude in 4, a share of its chunk span's 32. */
export const KEY_BYTES = 12.5;

/**
 * Bytes a key holds in the page at the peak of a load: its keys twice (the
 * worker's, and the page's while the worker hands them over in pieces) and
 * its chunk span's share. Worker and page share one wall (`MAX_TAB_ARRAY_BYTES`).
 */
export const PEAK_KEY_BYTES = 2 * 12 + 0.5;


/** What the load holds besides the keys at that peak: the decodes in flight, the units' records, the page's own. */
export const LOAD_HEADROOM = 4e9;

export interface LeanBudget {
  /** Most keys the load may keep. */
  maxKeys: number;
  /** What bounds it: the GPU's largest buffer, its memory, or the machine's. */
  limit: 'gpuBuffer' | 'gpuMemory' | 'ram';
  ramBytes: number;
  gpuBytes: number;
}

/**
 * The keys this machine holds: within what the GPU's key buffers hold (the
 * x, y, z, t keys go in up to two bindings, see the renderer's `gpuTracksMaxBytes`), within half its memory, and within the
 * RAM the page may take - half what is free when the host says, else what
 * the browser admits to (`navigator.deviceMemory`, capped at 8 GB), a quarter
 * of it - and never past the wall of typed arrays one tab holds, the keys
 * counted at their peak (`PEAK_KEY_BYTES`) beside the rest of the load.
 */
export function leanBudget(o: { gpuMaxBufferBytes: number; vramBytes: number | null; freeBytes: number | null; totalBytes: number | null; deviceMemoryGB: number | null }): LeanBudget {
  const gpuBuffer = o.gpuMaxBufferBytes > 0 ? Math.floor(o.gpuMaxBufferBytes / 8) : Infinity;
  const gpuMemory = o.vramBytes ? Math.floor((o.vramBytes * 0.5) / KEY_BYTES) : Infinity;
  const ram = o.freeBytes ? o.freeBytes * 0.5 : o.totalBytes ? o.totalBytes * 0.25 : (o.deviceMemoryGB ?? 4) * 1e9 * 0.25;
  const ramBytes = Math.min(ram, MAX_TAB_ARRAY_BYTES - LOAD_HEADROOM);
  const ramKeys = Math.floor(ramBytes / PEAK_KEY_BYTES);
  const maxKeys = Math.max(1, Math.min(gpuBuffer, gpuMemory, ramKeys));
  const limit = maxKeys === gpuBuffer ? 'gpuBuffer' : maxKeys === gpuMemory ? 'gpuMemory' : 'ram';
  return { maxKeys, limit, ramBytes, gpuBytes: Number.isFinite(gpuMemory) ? gpuMemory * KEY_BYTES : o.gpuMaxBufferBytes };
}

export type LeanColour = 'team' | 'group';

/**
 * The match files among those picked: Parquet, without a converter's side
 * files (flight data, messages). Effects files (the ACMI converter's shells,
 * shrapnel and decoys) only when nothing else is picked: a folder loads its
 * units, and the effects when they are picked alone.
 */
export function overlayFiles(files: File[]): File[] {
  const parquet = files.filter((f) => /\.parquet$/i.test(f.name) && !/\.(flight|messages|events|chat)\.parquet$/i.test(f.name));
  const units = parquet.filter((f) => !/\.effects\.parquet$/i.test(f.name));
  return (units.length ? units : parquet).sort((a, b) => a.name.localeCompare(b.name));
}

/** A loaded lean overlay: what was read, the tracks, and where each came from. */
export interface LeanOverlay {
  built: LeanBuilt;
  store: GpuTrackStore;
  files: File[];
  skipped: string[];
  /** Load phases, ms. */
  ms: Record<string, number>;
  /** Wall time of the whole load, ms. */
  loadMs: number;
  budget: LeanBudget;
  colour: LeanColour;
}

const overlays = new WeakMap<Dataset, LeanOverlay>();

/** The lean overlay a dataset stands for, if it does. */
export function leanOverlayOf(d: Dataset | null): LeanOverlay | null {
  return d ? (overlays.get(d) ?? null) : null;
}

const WEAPON_WORD = /missile|rocket|bomb|torpedo|shell|projectile|bullet|grenade|weapon/i;

/** Each track's colour, figure and flags, and the deaths in team colours: the store the GPU draws. */
export function leanStore(b: LeanBuilt, colour: LeanColour, t0 = performance.now()): GpuTrackStore {
  const d = b.dataset;
  const T = b.tracks;
  const trackData = b.trackData;
  const f32 = new Float32Array(trackData.buffer, trackData.byteOffset, trackData.length);
  const figures = new TrackFigures(d);
  const kinds = d.attrs.filter((a) => a.kind === 'category' && /^(kind|type|class|category)$/i.test(a.name.trim()));
  const personOf = new Int32Array(T);
  const trackOf = new Int32Array(T);
  const G = b.groups.length;
  for (let i = 0; i < T; i++) {
    const row = b.trackRow[i];
    const weapon = row >= 0 && kinds.some((a) => WEAPON_WORD.test(a.categories![(a.data as Uint32Array)[row]] ?? ''));
    figures.place(trackData, f32, i * TRACK_U32, i, row, b.keysB.length > 0, colour === 'group' ? teamHeatColor(b.trackGroup[i], G) : null, weapon);
    personOf[i] = i;
    trackOf[i] = i;
  }
  const M = b.markers.count;
  const mc = new Uint32Array(M);
  for (let i = 0; i < M; i++) {
    const team = b.markers.team[i];
    const [r, g, bl] = team === 0xffff ? [1, 1, 1] : colour === 'group' ? teamHeatColor(b.markers.group[i], G) : teamMemberColor(team, 0, 1);
    const c = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 255);
    mc[i] = (c(r) | (c(g) << 8) | (c(bl) << 16) | (255 << 24)) >>> 0;
  }
  const store: GpuTrackStore = {
    dataset: d,
    tracks: T,
    // The tracks with their chunk spans after them.
    trackData,
    keysA: b.keysA,
    keysB: b.keysB,
    keyRow: null,
    trackRow: b.trackRow,
    markers: { count: M, data: b.markers.data, colour: mc },
    keys: b.keys,
    meshes: figures.meshes,
    meshTracks: figures.meshTracks.slice(0, figures.meshes.length),
    personOf,
    trackOf,
    units: d.entitySize ? d.entitySize / 0.8 : 1,
    tolerance: b.tolerance,
    samples: b.samples,
    bytes: trackData.byteLength + b.keysA.byteLength + b.keysB.byteLength,
    buildMs: performance.now() - t0,
  };
  return store;
}

/** Recolours a loaded overlay (team or group): a new store over the same keys, so the GPU takes it anew. */
export function recolour(o: LeanOverlay, colour: LeanColour): LeanOverlay {
  const next = { ...o, colour, store: leanStore(o.built, colour) };
  registerGpuTrackStore(o.built.dataset, next.store);
  overlays.set(o.built.dataset, next);
  return next;
}

export interface LeanLoadHandle {
  promise: Promise<LeanOverlay>;
  cancel: () => void;
}

/** Loads `files` as a lean overlay; `onProgress` as it goes, `cancel` to stop (the promise then rejects with 'cancelled'). */
export function loadLeanOverlay(files: File[], name: string, budget: LeanBudget, onProgress: (p: LoadProgress | { phase: 'planned'; samples: number; keys: number; level: number }) => void): LeanLoadHandle {
  const t0 = performance.now();
  const w = new Worker(new URL('./loadWorker.ts', import.meta.url), { type: 'module' });
  let reject: (e: Error) => void = () => {};
  // The arrays too big to come in one message, put together again from their pieces.
  const big = new Map<string, Uint8Array>();
  const promise = new Promise<LeanOverlay>((resolve, rej) => {
    reject = rej;
    w.onmessage = (ev: MessageEvent<LoadResponse>) => {
      const r = ev.data;
      if (r.kind === 'piece') {
        let whole = big.get(r.key);
        if (!whole) big.set(r.key, (whole = new Uint8Array(r.total)));
        whole.set(r.part, r.offset);
      } else if (r.kind === 'progress') onProgress(r.progress);
      else if (r.kind === 'planned') onProgress({ phase: 'planned', samples: r.samples, keys: r.keys, level: r.level });
      else if (r.kind === 'error') {
        w.terminate();
        rej(Object.assign(new Error(r.reason), { detail: r.detail }));
      } else {
        w.terminate();
        for (const [key, whole] of big) r.built[key as 'keysA' | 'keysB' | 'trackData'] = new Uint32Array(whole.buffer);
        big.clear();
        restoreTrackStrings(r.built);
        const store = leanStore(r.built, 'team');
        registerGpuTrackStore(r.built.dataset, store);
        const o: LeanOverlay = { built: r.built, store, files, skipped: r.skipped, ms: r.ms, loadMs: performance.now() - t0, budget, colour: 'team' };
        overlays.set(r.built.dataset, o);
        resolve(o);
      }
    };
    w.onerror = (ev) => {
      ev.preventDefault();
      w.terminate();
      rej(new Error('failed'));
    };
  });
  const threads = Math.max(2, Math.min(8, Math.floor((navigator.hardwareConcurrency || 4) / 2)));
  w.postMessage({ files, maxKeys: budget.maxKeys, threads, name } satisfies LoadRequest);
  return {
    promise,
    cancel: () => {
      w.terminate();
      reject(new Error('cancelled'));
    },
  };
}

/** One unit's own rows: every column of its file, at the rows that carry its track and match. */
export interface UnitRows {
  columns: string[];
  /** Per column, its values at those rows. */
  values: unknown[][];
  /** Overlay seconds of each row. */
  time: Float64Array;
}

const unitCache = new WeakMap<LeanOverlay, Map<number, Promise<UnitRows | null>>>();

/** A unit's rows, read from its file when first asked (only the rows its rows lie between). */
export function unitRows(o: LeanOverlay, track: number): Promise<UnitRows | null> {
  let m = unitCache.get(o);
  if (!m) unitCache.set(o, (m = new Map()));
  let p = m.get(track);
  if (!p) {
    p = readUnit(o, track).catch(() => null);
    m.set(track, p);
  }
  return p;
}

async function readUnit(o: LeanOverlay, track: number): Promise<UnitRows | null> {
  const b = o.built;
  const name = b.files[b.trackFile[track]];
  const file = o.files.find((f) => f.name === name);
  if (!file) return null;
  const md = await parquetMetadataAsync(asyncBuffer(file));
  const columns = md.schema.slice(1).filter((e) => !e.num_children).map((e) => e.name);
  const r0 = b.trackRows[track * 2];
  const r1 = b.trackRows[track * 2 + 1] + 1;
  const cols = await readColumns(file, md, columns, r0, r1);
  const s = b.spec;
  const tc = cols[s.track];
  const mc = s.match ? cols[s.match] : undefined;
  const timeCol = cols[s.time];
  const key = b.trackKey[track];
  const match = b.trackMatch[track];
  const at: number[] = [];
  for (let i = 0; i < r1 - r0; i++) {
    if (String(tc?.[i] ?? '') !== key) continue;
    if (mc && String(mc[i] ?? '') !== match) continue;
    at.push(i);
  }
  const start = b.groupStart[b.trackGroup[track]] + b.origin;
  return {
    columns,
    values: columns.map((c) => at.map((i) => cols[c]?.[i])),
    time: Float64Array.from(at, (i) => {
      const v = timeCol?.[i];
      const n = typeof v === 'bigint' ? Number(v) : v instanceof Date ? v.getTime() : Number(v);
      return n * s.timeScale - start;
    }),
  };
}

const resolved = new WeakMap<LeanOverlay, Map<number, UnitRows | null>>();

function shown(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(Math.round(v * 1000) / 1000) : '';
  if (typeof v === 'bigint') return v.toString();
  if (v instanceof Date) return v.toISOString();
  const s = String(v);
  return s.length > 80 ? `${s.slice(0, 79)}…` : s;
}

/**
 * The raw telemetry of a lean overlay's unit at time `t`: every column of its
 * own row at or before it, read from its file the first time it is asked for
 * (empty until then). Null when `d` is not a lean overlay.
 */
export function leanRawRows(d: Dataset, person: number, t: number): [string, string][] | null {
  const o = leanOverlayOf(d);
  if (!o) return null;
  let m = resolved.get(o);
  if (!m) resolved.set(o, (m = new Map()));
  if (!m.has(person)) {
    m.set(person, null);
    void unitRows(o, person).then((r) => m.set(person, r));
    return [];
  }
  const r = m.get(person);
  if (!r || !r.time.length) return [];
  let lo = 0;
  let hi = r.time.length - 1;
  if (r.time[0] > t) hi = 0;
  else
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (r.time[mid] <= t) lo = mid;
      else hi = mid - 1;
    }
  const row = hi;
  const out: [string, string][] = [];
  r.columns.forEach((c, k) => {
    const v = shown(r.values[k][row]);
    if (v.trim()) out.push([c, v]);
  });
  return out;
}
