import { LOD_TARGETS, STRUCTURE_BUDGET_SHARE, type LodPreset } from '../data/simplify';
import type { ModelLevel } from './level';
import type { SimplifyAnswer, SimplifyPart, SimplifyRequest } from './levelSimplifyWorker';

/**
 * The level panel's simplification target applied to the level already loaded.
 *
 * It used to act only on the next model file imported through the panel: a
 * level from the library, from beside a match or from an exporter was drawn as
 * it came whatever the menu said. Now a change of target simplifies the loaded
 * level again, in a worker, from the triangles it was loaded with - kept, so a
 * coarser target can be undone - and the new triangles reach the GPU a slice a
 * frame (levelIndices.ts). The vertices stay as they are: every set indexes
 * them, and only the triangles change.
 */

/** Values a frame posts to the worker, 8 MB of them: copying more at once is a frame dropped. */
const POST_SLICE = 2_000_000;

/** What a level was loaded with, by its vertex array: the triangles every target is taken from. */
interface Source {
  indices: Uint32Array;
  structureIndices?: Uint32Array;
  structureEdges?: Uint32Array;
  triangles: number;
  structureTriangles?: number;
  partRuns?: ModelLevel['partRuns'];
}

const sources = new WeakMap<Float32Array, Source>();

function sourceOf(level: ModelLevel): Source {
  let s = sources.get(level.vertices);
  if (!s) {
    s = {
      indices: level.indices,
      structureIndices: level.structureIndices,
      structureEdges: level.structureEdges,
      triangles: level.triangles,
      structureTriangles: level.structureTriangles,
      partRuns: level.partRuns,
    };
    sources.set(level.vertices, s);
  }
  return s;
}

/** The level's fields a simplification sets. */
export type SimplifiedSets = Pick<ModelLevel, 'indices' | 'structureIndices' | 'structureEdges' | 'triangles' | 'structureTriangles' | 'partRuns'>;

/** A simplification's sets, the triangles it was taken from, and the simplifier's relative deviation. */
export interface Resimplified {
  sets: SimplifiedSets;
  source: number;
  error: number;
}

/** Whether the panel's target can apply to this level: a model level built once, not a streamed theatre. */
export function canResimplify(level: ModelLevel | null | undefined): level is ModelLevel {
  return !!level && level.kind === 'model' && !level.stream && level.indices.length > 0;
}

let running: { worker: Worker; reject: (e: Error) => void } | null = null;

/** Stop a simplification under way; its promise is rejected with `cancelled`. */
export function cancelResimplify(): void {
  if (!running) return;
  running.worker.terminate();
  running.reject(new Error('cancelled'));
  running = null;
}

const frame = () => new Promise<void>((r) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => r()) : setTimeout(r, 0)));

/**
 * The level's triangle sets for `preset`, taken from what it was loaded with:
 * those very sets where the target is at or above them (no worker), else
 * simplified in a worker. One at a time; a new call cancels the last.
 */
export async function resimplifyLevel(level: ModelLevel, preset: LodPreset): Promise<Resimplified> {
  cancelResimplify();
  const src = sourceOf(level);
  const target = LOD_TARGETS[preset];
  const structureTris = (src.structureIndices?.length ?? 0) / 3;
  const total = src.indices.length / 3 + structureTris;
  const original: SimplifiedSets = {
    indices: src.indices,
    structureIndices: src.structureIndices,
    structureEdges: src.structureEdges,
    triangles: src.triangles,
    structureTriangles: src.structureTriangles,
    partRuns: src.partRuns,
  };
  if (!Number.isFinite(target) || total <= target) return { sets: original, source: total, error: 0 };

  const worker = new Worker(new URL('./levelSimplifyWorker.ts', import.meta.url), { type: 'module' });
  let rejectRun: (e: Error) => void = () => undefined;
  const answered = new Promise<SimplifyAnswer>((resolve, reject) => {
    rejectRun = reject;
    worker.onmessage = (ev: MessageEvent<SimplifyAnswer>) => resolve(ev.data);
    worker.onerror = (ev) => reject(new Error(ev.message || 'simplify worker failed'));
  });
  const me = { worker, reject: rejectRun };
  running = me;
  try {
    const send = async (name: SimplifyPart, data: Float32Array | Uint32Array | Uint16Array | null | undefined) => {
      if (!data || data.length === 0) return;
      for (let at = 0; at < data.length; at += POST_SLICE) {
        if (running !== me) throw new Error('cancelled');
        // A copy of the slice, transferred: a view posted as it is clones its whole buffer.
        const part = data.slice(at, Math.min(data.length, at + POST_SLICE));
        worker.postMessage({ kind: 'part', name, total: data.length, at, data: part } satisfies SimplifyRequest, [part.buffer]);
        await frame();
      }
    };
    await send('vertices', level.vertices);
    if (level.uvs) {
      await send('uvs', level.uvs);
      await send('uvTiles', level.uvTiles);
    }
    await send('ground', src.indices);
    await send('structure', src.structureIndices);
    if (running !== me) throw new Error('cancelled');
    // Split as an import splits it: structures, the many small objects, take the larger share.
    const structureBudget = structureTris > 0 ? target * STRUCTURE_BUDGET_SHARE : 0;
    worker.postMessage({ kind: 'run', groundBudget: target - structureBudget, structureBudget: structureBudget || Infinity } satisfies SimplifyRequest);
    const a = await answered;
    if (a.kind === 'error') throw new Error(a.message);
    const simplified = (n: number, before: number) => n !== before;
    const sets: SimplifiedSets = {
      indices: a.ground,
      structureIndices: structureTris > 0 ? a.structure : src.structureIndices,
      structureEdges: structureTris > 0 ? a.edges : src.structureEdges,
      triangles: a.ground.length / 3,
      structureTriangles: structureTris > 0 ? a.structure.length / 3 : src.structureTriangles,
      // A rebuilt set's triangles are no longer runs of whole parts; a click on it is named from the part boxes.
      partRuns: src.partRuns && {
        ...src.partRuns,
        ground: simplified(a.ground.length, src.indices.length) ? null : src.partRuns.ground,
        structure: simplified(a.structure.length, src.structureIndices?.length ?? 0) ? null : src.partRuns.structure,
      },
    };
    return { sets, source: total, error: a.error };
  } finally {
    worker.terminate();
    if (running === me) running = null;
  }
}
