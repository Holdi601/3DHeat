import type { PartClass } from './classify';
import type { ModelRequest, ModelResponse } from './modelWorker';
import { msg as message, say } from './msg';

export interface ModelProgress {
  label: string;
  fraction: number | null;
}

export interface LoadedModel {
  vertices: Float32Array;
  /** Per-vertex colour, or null when the source carried none. */
  colours: Float32Array | null;
  /** Per-vertex UV into `atlas`, -1 where untextured; null with no texture. */
  uvs: Float32Array | null;
  /** See `ModelLevel.uvTiles`. */
  uvTiles?: Uint16Array | null;
  /** See `ModelLevel.tileRects`. */
  tileRects?: Float32Array | null;
  /** The level's textures, packed into one encoded image. */
  atlas: Blob | null;
  /** Ground triangles. */
  indices: Uint32Array;
  /** Structure triangles, and their deduplicated edges for the wireframe. */
  structureIndices: Uint32Array;
  structureEdges: Uint32Array;
  /** Water surfaces: flat, undecimated, shaded without terrain cues. */
  waterIndices: Uint32Array;
  /** Navigation meshes: kept for clicks, not drawn. Absent on library entries. */
  navIndices?: Uint32Array;
  triangles: number;
  structureTriangles: number;
  waterTriangles: number;
  sourceTriangles: number;
  sourceStructureTriangles: number;
  /** Geometric deviation reported by the simplifier. */
  error: number;
  partNames: string[];
  partClasses: PartClass[];
  partReasons: string[];
  /** Which part each triangle came from, per set, where known; see `ModelLevel.partRuns`. */
  partRuns?: { ground: Uint32Array | null; structure: Uint32Array | null; water: Uint32Array | null; nav: Uint32Array | null };
  /** Each part's box; see `ModelLevel.partBounds`. */
  partBounds?: Float32Array;
  bounds: {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
  };
  /** Height range of the ground alone, for scaling the relief cues to it. */
  groundBand: { minY: number; maxY: number };
}

/**
 * Main-thread client for the model worker.
 *
 * One request at a time: processing a level is measured in seconds and the only
 * sensible response to a second request is to abandon the first, so the worker
 * is torn down rather than queued.
 *
 * The worker speaks in messages, having no language of its own; they are said
 * here, in the viewer's, before anything reaches the UI.
 */
class ModelLoader {
  private worker: Worker | null = null;
  private nextId = 1;
  private active: {
    id: number;
    resolve: (m: LoadedModel) => void;
    reject: (e: Error) => void;
    onProgress?: (p: ModelProgress) => void;
  } | null = null;

  load(
    file: File,
    targetTriangles: number,
    onProgress?: (p: ModelProgress) => void,
    overrides?: Record<string, PartClass>,
  ): Promise<LoadedModel> {
    this.cancel();
    const worker = new Worker(new URL('./modelWorker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    const id = this.nextId++;

    return new Promise<LoadedModel>((resolve, reject) => {
      this.active = { id, resolve, reject, onProgress };
      worker.onmessage = (ev: MessageEvent<ModelResponse>) => {
        const msg = ev.data;
        if (!this.active || msg.id !== this.active.id) return;
        if (msg.kind === 'progress') {
          this.active.onProgress?.({ label: say(msg.label), fraction: msg.fraction });
          return;
        }
        const done = this.active;
        this.active = null;
        worker.terminate();
        if (this.worker === worker) this.worker = null;
        if (msg.kind === 'error') done.reject(new Error(say(msg.message)));
        else {
          done.resolve({
            vertices: msg.vertices,
            colours: msg.colours,
            uvs: msg.uvs,
            uvTiles: msg.uvTiles,
            tileRects: msg.tileRects,
            atlas: msg.atlas,
            indices: msg.groundIndices,
            structureIndices: msg.structureIndices,
            structureEdges: msg.structureEdges,
            waterIndices: msg.waterIndices,
            navIndices: msg.navIndices,
            triangles: msg.groundTriangles,
            structureTriangles: msg.structureTriangles,
            waterTriangles: msg.waterTriangles,
            sourceTriangles: msg.sourceGroundTriangles,
            sourceStructureTriangles: msg.sourceStructureTriangles,
            error: msg.error,
            partNames: msg.partNames,
            partClasses: msg.partClasses,
            partReasons: msg.partReasons.map(say),
            partRuns: msg.partRuns,
            partBounds: msg.partBounds,
            bounds: msg.bounds,
        groundBand: msg.groundBand,
          });
        }
      };
      worker.onerror = (ev) => {
        const done = this.active;
        this.active = null;
        worker.terminate();
        if (this.worker === worker) this.worker = null;
        done?.reject(new Error(ev.message || say(message('data.modelLoader.crashed'))));
      };
      worker.postMessage({ id, file, targetTriangles, overrides } satisfies ModelRequest);
    });
  }

  cancel(): void {
    if (this.active) {
      this.active.reject(new Error(say(message('data.modelLoader.cancelled'))));
      this.active = null;
    }
    this.worker?.terminate();
    this.worker = null;
  }
}

export const modelLoader = new ModelLoader();

