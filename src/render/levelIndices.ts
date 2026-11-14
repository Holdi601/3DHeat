import type { Level, ModelLevel } from './level';

/**
 * A level's triangles swapped for others over the same vertices: what a new
 * simplification target changes (src/render/levelSimplify.ts).
 *
 * Uploading the whole level again for it - vertices, colours, the texture
 * atlas decoded anew - is the cost of loading the level, in one frame. Only the
 * index sets differ, so only they go up, a slice a frame, and the old ones are
 * drawn until all of the new have arrived.
 */

/** Indices a frame writes of a level's new index sets: 2M, 8 MB, a few milliseconds of copying. */
export const INDEX_SLICE = 2_000_000;

/** The index sets a simplification replaces. Water and the navigation mesh are never simplified. */
export interface LevelIndexSets {
  ground: Uint32Array;
  structure: Uint32Array;
  edges: Uint32Array;
}

/** A renderer that can swap a loaded level's index sets in over frames, keeping its vertices and texture. */
export interface LevelIndexUploader {
  setLevelIndices(sets: LevelIndexSets): void;
}

const NONE = new Uint32Array(0);

export function levelIndexSets(level: ModelLevel): LevelIndexSets {
  return { ground: level.indices, structure: level.structureIndices ?? NONE, edges: level.structureEdges ?? NONE };
}

/** Whether `b` is `a` with other ground, structure or edge indices and everything else the GPU holds the same. */
export function onlyIndicesChanged(a: Level | null, b: Level | null): b is ModelLevel {
  if (!a || !b || a.kind !== 'model' || b.kind !== 'model') return false;
  return (
    a.vertices === b.vertices &&
    a.colours === b.colours &&
    a.uvs === b.uvs &&
    a.uvTiles === b.uvTiles &&
    a.tileRects === b.tileRects &&
    a.atlas === b.atlas &&
    a.waterIndices === b.waterIndices &&
    (a.indices !== b.indices || a.structureIndices !== b.structureIndices || a.structureEdges !== b.structureEdges)
  );
}

/**
 * Index sets written into new buffers a budget at a time: `step` writes up to
 * `budget` indices through `write` (buffer, first index, the slice) and says
 * whether all of them are written. An empty set has no buffer (null).
 */
export class IndexUpload<B> {
  readonly buffers: (B | null)[];
  private set = 0;
  private at = 0;

  constructor(
    readonly sets: Uint32Array[],
    make: (count: number) => B,
  ) {
    this.buffers = sets.map((s) => (s.length ? make(s.length) : null));
  }

  get done(): boolean {
    return this.set >= this.sets.length;
  }

  step(write: (buffer: B, at: number, data: Uint32Array) => void, budget = INDEX_SLICE): boolean {
    while (budget > 0 && this.set < this.sets.length) {
      const src = this.sets[this.set];
      const buffer = this.buffers[this.set];
      if (buffer === null || this.at >= src.length) {
        this.set++;
        this.at = 0;
        continue;
      }
      const n = Math.min(budget, src.length - this.at);
      write(buffer, this.at, src.subarray(this.at, this.at + n));
      this.at += n;
      budget -= n;
    }
    return this.done;
  }
}
