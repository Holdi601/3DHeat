import type { Bounds } from '../state/types';

/**
 * The streamed world backdrop's tiles: many small meshes, each a piece of the
 * earth at one level of detail, drawn together with the current level's look.
 *
 * The streamer (src/world/stream.ts) decides which tiles are wanted from the
 * camera and puts them here; the engine hands the set to the renderer
 * whenever `version` changes, and the renderer uploads the tiles it has not
 * seen and frees the ones that are gone (by `id`, and by object identity: a
 * tile is never changed in place, a changed tile is a new object).
 *
 * A tile is a model level's geometry in miniature, already in the viewer's
 * world through the load's axis mapping: interleaved position+normal vertices,
 * per-vertex colour, ground / structure / water triangle sets, structure
 * edges. It is drawn exactly as a model level's ground, structures and water
 * are - the same appearance uniforms (the level's opacity, brightness,
 * relief, structure tint, water opacity, colour on or off), the same depth
 * rules, so the heat is hidden behind it like behind any level.
 *
 * `image` is the tile's own imagery (a satellite picture of its square), and
 * `uvs` place each vertex in it (0..1, v down; -1 where there is none). Drawn
 * when the level's `showTexture` is on, as a model level's atlas is.
 */
export interface WorldTile {
  /** "z/x/y" of the Web Mercator tile it covers, plus a suffix for its content version. */
  id: string;
  vertices: Float32Array;
  colours: Float32Array;
  uvs: Float32Array | null;
  image: ImageBitmap | null;
  indices: Uint32Array;
  structureIndices: Uint32Array;
  structureEdges: Uint32Array;
  waterIndices: Uint32Array;
  bounds: Bounds;
}

/** The tiles to draw now. */
export class WorldTileSet {
  private map = new Map<string, WorldTile>();
  /** Bumped on every change; the engine compares it each frame. */
  version = 0;

  get tiles(): WorldTile[] {
    return [...this.map.values()];
  }

  get size(): number {
    return this.map.size;
  }

  /** Replaces the whole set at once (one version bump). */
  replace(tiles: Iterable<WorldTile>): void {
    const next = new Map<string, WorldTile>();
    for (const t of tiles) next.set(t.id, t);
    let same = next.size === this.map.size;
    if (same) for (const [k, v] of next) if (this.map.get(k) !== v) same = false;
    if (same) return;
    this.map = next;
    this.version++;
  }

  clear(): void {
    if (!this.map.size) return;
    this.map = new Map();
    this.version++;
  }
}

/** The one set the engine draws. */
export const worldTiles = new WorldTileSet();
