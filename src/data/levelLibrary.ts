import { t } from '../i18n';
import type { LevelCredit, MapAnchor } from '../render/level';
import type { GeoPlacement } from '../state/types';

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

const DB_NAME = '3dheat';
const DB_VERSION = 1;
const STORE = 'levels';

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
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error(t('data.levelLibrary.openFailed')));
  });
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
  const all = await tx<StoredLevel[]>('readonly', (s) => s.getAll() as IDBRequest<StoredLevel[]>);
  return all
    .map(({ blob: _blob, vertices: _v, indices: _i, ...meta }) => meta)
    .sort((a, b) => b.createdAt - a.createdAt);
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
  // Copies, because the caller keeps using these arrays for rendering and
  // IndexedDB would otherwise store a view onto a buffer we may transfer away.
  await tx('readwrite', (s) =>
    s.put({
      id,
      name,
      kind: 'model',
      createdAt: Date.now(),
      bytes,
      triangles: p.triangles,
      sourceTriangles: p.sourceTriangles,
      ...(p.credits?.length ? { credits: [...p.credits] } : {}),
      ...(p.placement ? { placement: JSON.parse(JSON.stringify(p.placement)) as GeoPlacement } : {}),
      vertices: p.vertices.slice().buffer,
      ...(p.colours ? { colours: p.colours.slice().buffer } : {}),
      ...(p.uvs && p.atlas ? { uvs: p.uvs.slice().buffer, atlas: p.atlas } : {}),
      ...(p.uvs && p.atlas && p.uvTiles && p.tileRects
        ? { uvTiles: p.uvTiles.slice().buffer, tileRects: p.tileRects.slice().buffer }
        : {}),
      indices: p.indices.slice().buffer,
      structureIndices: p.structureIndices.slice().buffer,
      structureEdges: p.structureEdges.slice().buffer,
      waterIndices: (p.waterIndices ?? new Uint32Array(0)).slice().buffer,
    } satisfies StoredLevel),
  );
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
