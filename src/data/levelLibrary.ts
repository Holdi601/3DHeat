import { t } from '../i18n';
import type { LevelCredit, MapAnchor } from '../render/level';
import type { Bounds, GeoPlacement } from '../state/types';
import type { WorldLabel } from '../world/backdrop';

/**
 * Local library of processed levels.
 *
 * Processing a level export is slow — parse, weld, decimate — and the result is
 * identical every time. Keeping it in IndexedDB means that cost is paid once per
 * map rather than once per session, which is the difference between a viewer you
 * open casually and one you avoid opening.
 *
 * Local-only by design. The storage layer is deliberately narrow so a shared
 * server can be put behind the same four calls later without touching the app.
 */

import { listLevelMetas, openLevelDb, putLevelRecord, STORE } from './levelDb';

export interface StoredLevelMeta {
  id: string;
  name: string;
  kind: 'image' | 'model';
  createdAt: number;
  /** Bytes of the stored payload, for the library listing. */
  bytes: number;
  /** Model only. */
  triangles?: number;
  sourceTriangles?: number;
  /** Image only. */
  width?: number;
  height?: number;
  anchors?: [MapAnchor, MapAnchor];
  /** A world backdrop's sources, whose credit must come back with it. */
  credits?: LevelCredit[];
  /** A world backdrop's place on the earth, so it can be moved under other data. */
  placement?: GeoPlacement;
  /** A world backdrop's place names, in its world coordinates. */
  labels?: WorldLabel[];
  /**
   * A streamed theatre: no geometry is stored, only what it streams and with
   * which options; loading it streams again, from the tile cache where the
   * tiles are still there. `bounds` is its reach, for the camera's range.
   */
  stream?: { theatre: string; runways: boolean; imagery: boolean };
  bounds?: Bounds;
  /** The game a level is known to be the map of (`dota2`: the 3DHeat Dota tool's map), so a button can find it again. */
  game?: string;
}

interface StoredLevel extends StoredLevelMeta {
  /** Image payload as an encoded blob; model payload as raw typed arrays. */
  blob?: Blob;
  vertices?: ArrayBuffer;
  /**
   * Per-vertex colour, on levels that came from a reconstruction.
   *
   * Optional in the same way the structure split and the water set are: an
   * entry saved before this existed has none, and must load as a colourless
   * level rather than fail.
   */
  colours?: ArrayBuffer;
  /** Per-vertex UV into `atlas`, and the atlas itself, on textured levels. */
  uvs?: ArrayBuffer;
  atlas?: Blob;
  /**
   * Per-vertex tile numbers and the tiles' rectangles, on a level with a
   * repeating texture. An entry saved before tiles existed has none, and its
   * UVs are all atlas UVs, which is what a missing array means.
   */
  uvTiles?: ArrayBuffer;
  tileRects?: ArrayBuffer;
  /** Ground triangles. */
  indices?: ArrayBuffer;
  /** Structure triangles and their wireframe edges. */
  structureIndices?: ArrayBuffer;
  structureEdges?: ArrayBuffer;
  // Added after the first entries were written, so it is optional in the same
  // way the structure split was: an older entry simply has its water in the
  // ground set, which is where it was put when that entry was saved.
  waterIndices?: ArrayBuffer;
}

function openDb(): Promise<IDBDatabase> {
  return openLevelDb().catch((err: unknown) => {
    throw err instanceof Error && err.message !== 'IndexedDB open failed' ? err : new Error(t('data.levelLibrary.openFailed'));
  });
}

/** Bytes copied per step when a level is saved: about a millisecond of copying, so no frame waits on it. */
const COPY_STEP = 4 << 20;

/**
 * A copy of a typed array's bytes, made a slice at a time with the event loop
 * let through between slices, so a level of hundreds of megabytes is copied
 * without holding up a frame. The copy is the library's own (the caller keeps
 * drawing from the original) and is then transferred to the writing worker.
 */
async function copyInSteps(view: ArrayBufferView): Promise<ArrayBuffer> {
  const src = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  const out = new Uint8Array(view.byteLength);
  for (let at = 0; at < src.length; at += COPY_STEP) {
    out.set(src.subarray(at, Math.min(src.length, at + COPY_STEP)), at);
    if (at + COPY_STEP < src.length) await new Promise((r) => setTimeout(r, 0));
  }
  return out.buffer;
}

let storeWorker: Worker | null = null;
let storeNext = 1;
const storeWaiting = new Map<number, { resolve: (metas?: unknown[]) => void; reject: (e: Error) => void }>();

/** The worker doing the library's heavy IndexedDB work (`levelStoreWorker.ts`); null where there can be none. */
function store(): Worker | null {
  if (storeWorker || typeof Worker === 'undefined') return storeWorker;
  try {
    storeWorker = new Worker(new URL('./levelStoreWorker.ts', import.meta.url), { type: 'module' });
  } catch {
    return null;
  }
  storeWorker.onmessage = (ev: MessageEvent<{ id: number; error?: string; metas?: unknown[] }>) => {
    const w = storeWaiting.get(ev.data.id);
    if (!w) return;
    storeWaiting.delete(ev.data.id);
    if (ev.data.error) w.reject(new Error(ev.data.error));
    else w.resolve(ev.data.metas);
  };
  return storeWorker;
}

function ask(message: { op: 'put'; record: unknown } | { op: 'list' }, transfer: ArrayBuffer[] = []): Promise<unknown[] | undefined> {
  const w = store()!;
  const id = storeNext++;
  return new Promise((resolve, reject) => {
    storeWaiting.set(id, { resolve, reject });
    w.postMessage({ id, ...message }, transfer);
  });
}

/**
 * Puts a record whose large buffers are listed in `transfer`: in the worker when
 * there is one (the buffers move there without a copy, and IndexedDB's clone and
 * write run on its thread), else here.
 */
async function putRecord(record: unknown, transfer: ArrayBuffer[]): Promise<void> {
  if (!store()) return putLevelRecord(record);
  await ask({ op: 'put', record }, transfer);
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const req = fn(transaction.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error(t('data.levelLibrary.requestFailed')));
        transaction.oncomplete = () => db.close();
      }),
  );
}

/** Everything in the library, newest first, without loading any payloads. */
export async function listLevels(): Promise<StoredLevelMeta[]> {
  // Read in the worker where there is one: reading the store clones every
  // level's geometry, which on this thread stalls a frame per large level.
  const metas = ((store() ? await ask({ op: 'list' }) : await listLevelMetas()) ?? []) as StoredLevelMeta[];
  return metas.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveImageLevel(
  name: string,
  blob: Blob,
  width: number,
  height: number,
  anchors: [MapAnchor, MapAnchor],
): Promise<string> {
  const id = `img-${Date.now()}-${Math.floor(width * height)}`;
  await tx('readwrite', (s) =>
    s.put({
      id,
      name,
      kind: 'image',
      createdAt: Date.now(),
      bytes: blob.size,
      width,
      height,
      anchors,
      blob,
    } satisfies StoredLevel),
  );
  return id;
}

export interface ModelLevelPayload {
  vertices: Float32Array;
  /** Per-vertex colour, when the source had any. */
  colours?: Float32Array | null;
  /** Per-vertex UV and the packed texture, when the source had any. */
  uvs?: Float32Array | null;
  atlas?: Blob | null;
  /** Per-vertex tile numbers and the tiles' rectangles, when a texture repeats. */
  uvTiles?: Uint16Array | null;
  tileRects?: Float32Array | null;
  /** Ground triangles. */
  indices: Uint32Array;
  structureIndices: Uint32Array;
  structureEdges: Uint32Array;
  // Optional: a level from a source with no water has none, and requiring it
  // would mean every caller has to know about a field that is empty for most
  // levels. Absent and empty mean the same thing here.
  waterIndices?: Uint32Array;
  triangles: number;
  sourceTriangles: number;
  /** A world backdrop's sources: see `ModelLevel.credits`. */
  credits?: LevelCredit[];
  placement?: GeoPlacement;
  labels?: WorldLabel[];
  stream?: { theatre: string; runways: boolean; imagery: boolean };
  bounds?: Bounds;
  game?: string;
}

export async function saveModelLevel(name: string, p: ModelLevelPayload): Promise<string> {
  const id = `mdl-${Date.now()}-${p.triangles}`;
  const bytes =
    p.vertices.byteLength +
    (p.colours?.byteLength ?? 0) +
    (p.uvs?.byteLength ?? 0) +
    (p.uvTiles?.byteLength ?? 0) +
    (p.atlas?.size ?? 0) +
    p.indices.byteLength +
    p.structureIndices.byteLength +
    p.structureEdges.byteLength +
    (p.waterIndices?.byteLength ?? 0);
  // Copies, because the caller keeps using these arrays for rendering; made a
  // slice at a time and written by a worker, so saving never holds up a frame.
  const copy = (v: ArrayBufferView) => copyInSteps(v);
  const vertices = await copy(p.vertices);
  const colours = p.colours ? await copy(p.colours) : null;
  const uvs = p.uvs && p.atlas ? await copy(p.uvs) : null;
  const tiles = p.uvs && p.atlas && p.uvTiles && p.tileRects ? [await copy(p.uvTiles), await copy(p.tileRects)] : null;
  const indices = await copy(p.indices);
  const structureIndices = await copy(p.structureIndices);
  const structureEdges = await copy(p.structureEdges);
  const waterIndices = await copy(p.waterIndices ?? new Uint32Array(0));
  const record = {
    id,
    name,
    kind: 'model',
    createdAt: Date.now(),
    bytes,
    triangles: p.triangles,
    sourceTriangles: p.sourceTriangles,
    ...(p.credits?.length ? { credits: [...p.credits] } : {}),
    ...(p.placement ? { placement: JSON.parse(JSON.stringify(p.placement)) as GeoPlacement } : {}),
    ...(p.labels?.length ? { labels: p.labels.map((l) => ({ ...l })) } : {}),
    ...(p.stream ? { stream: { ...p.stream }, ...(p.bounds ? { bounds: { ...p.bounds } } : {}) } : {}),
    ...(p.game ? { game: p.game } : {}),
    vertices,
    ...(colours ? { colours } : {}),
    ...(uvs && p.atlas ? { uvs, atlas: p.atlas } : {}),
    ...(tiles ? { uvTiles: tiles[0], tileRects: tiles[1] } : {}),
    indices,
    structureIndices,
    structureEdges,
    waterIndices,
  } satisfies StoredLevel;
  const transfer = [vertices, colours, uvs, ...(tiles ?? []), indices, structureIndices, structureEdges, waterIndices].filter(
    (b): b is ArrayBuffer => !!b && b.byteLength > 0,
  );
  await putRecord(record, transfer);
  return id;
}

export interface LoadedStoredLevel {
  meta: StoredLevelMeta;
  blob?: Blob;
  vertices?: Float32Array;
  colours?: Float32Array;
  uvs?: Float32Array;
  uvTiles?: Uint16Array;
  tileRects?: Float32Array;
  atlas?: Blob;
  indices?: Uint32Array;
  structureIndices?: Uint32Array;
  structureEdges?: Uint32Array;
  waterIndices?: Uint32Array;
}

export async function loadLevel(id: string): Promise<LoadedStoredLevel | null> {
  const rec = await tx<StoredLevel | undefined>(
    'readonly',
    (s) => s.get(id) as IDBRequest<StoredLevel | undefined>,
  );
  if (!rec) return null;
  const {
    blob,
    vertices,
    colours,
    uvs,
    uvTiles,
    tileRects,
    atlas,
    indices,
    structureIndices,
    structureEdges,
    waterIndices,
    ...meta
  } = rec;
  return {
    meta,
    blob,
    vertices: vertices ? new Float32Array(vertices) : undefined,
    colours: colours ? new Float32Array(colours) : undefined,
    uvs: uvs ? new Float32Array(uvs) : undefined,
    uvTiles: uvTiles ? new Uint16Array(uvTiles) : undefined,
    tileRects: tileRects ? new Float32Array(tileRects) : undefined,
    atlas,
    indices: indices ? new Uint32Array(indices) : undefined,
    // Absent on entries saved before the ground/structure split existed; those
    // load as ground-only rather than failing.
    structureIndices: structureIndices ? new Uint32Array(structureIndices) : undefined,
    structureEdges: structureEdges ? new Uint32Array(structureEdges) : undefined,
    waterIndices: waterIndices ? new Uint32Array(waterIndices) : undefined,
  };
}

export async function deleteLevel(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id) as unknown as IDBRequest<undefined>);
}

/** Rough storage usage, when the browser will report it. */
export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null;
  const e = await navigator.storage.estimate();
  return { usage: e.usage ?? 0, quota: e.quota ?? 0 };
}
