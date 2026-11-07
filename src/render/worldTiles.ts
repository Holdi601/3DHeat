import type { Bounds } from '../state/types';
import type { WorldTile } from '../world/tileSet';

/**
 * The renderer-side bookkeeping for the streamed world tiles (src/world/tileSet),
 * shared by both backends: which tiles to upload and free, which ones the camera
 * can see, and what they cost.
 *
 * Pure, so the parts that decide what reaches the GPU can be tested without one.
 */

/**
 * What changed between the tiles a renderer holds and the set it is handed.
 *
 * By id and by object: a tile is never changed in place, so a tile with a known
 * id but a different object is new content under the same name, and is freed and
 * uploaded again rather than kept. `removed` is to be freed before `added` is
 * uploaded, so a replaced id never has two uploads alive at once.
 */
export function diffWorldTiles(
  held: ReadonlyMap<string, WorldTile>,
  next: readonly WorldTile[],
): { added: WorldTile[]; removed: string[] } {
  const wanted = new Map<string, WorldTile>();
  for (const t of next) wanted.set(t.id, t);
  const removed: string[] = [];
  for (const [id, tile] of held) if (wanted.get(id) !== tile) removed.push(id);
  const added: WorldTile[] = [];
  for (const [id, tile] of wanted) if (held.get(id) !== tile) added.push(tile);
  return { added, removed };
}

/**
 * Bytes a tile's buffers take on the GPU, before its texture.
 *
 * As the renderers allocate them: colour and UVs always backed (white and -1 for
 * a tile without), so every vertex costs the same whatever the tile carries.
 */
export function worldTileBufferBytes(tile: WorldTile): number {
  const vertexCount = Math.floor(tile.vertices.length / 6);
  return (
    tile.vertices.byteLength +
    vertexCount * 12 +
    vertexCount * 8 +
    tile.indices.byteLength +
    tile.structureIndices.byteLength +
    tile.structureEdges.byteLength +
    tile.waterIndices.byteLength
  );
}

/** A texture's bytes with its mip chain, which adds about a third. */
export function textureBytes(width: number, height: number, mipped: boolean): number {
  return Math.round(width * height * 4 * (mipped ? 1.34 : 1));
}

/**
 * The view's clipping planes from a column-major view-projection matrix, as
 * (a, b, c, d) per plane with the inside where ax + by + cz + d >= 0.
 *
 * Left, right, bottom, top and near. No far plane: the camera's far distance is
 * the user's to set and a tile past it is cut by the depth range anyway, while a
 * far plane from a matrix with a very distant far is numerically the weakest of
 * the six. The near plane is OpenGL's (z >= -w), which holds everything WebGPU's
 * (z >= 0) does and a sliver more - so the one matrix serves both backends and
 * the test only ever keeps too much, never too little.
 */
export function frustumPlanes(m: ArrayLike<number>, out = new Float32Array(20)): Float32Array {
  // Row i of a column-major matrix is (m[i], m[4 + i], m[8 + i], m[12 + i]).
  const r = (i: number, j: number) => m[j * 4 + i];
  const set = (p: number, sign: number, row: number) => {
    out[p * 4] = r(3, 0) + sign * r(row, 0);
    out[p * 4 + 1] = r(3, 1) + sign * r(row, 1);
    out[p * 4 + 2] = r(3, 2) + sign * r(row, 2);
    out[p * 4 + 3] = r(3, 3) + sign * r(row, 3);
  };
  set(0, 1, 0);
  set(1, -1, 0);
  set(2, 1, 1);
  set(3, -1, 1);
  set(4, 1, 2);
  return out;
}

/**
 * Whether a box lies wholly outside one of the planes, and so cannot be seen.
 *
 * The usual corner test: for each plane, the corner furthest along its normal; if
 * even that one is outside, the whole box is. Conservative - a box near a corner
 * of the frustum can pass every plane and still be out of view - which only
 * costs a draw, never a missing tile.
 */
export function boxOutsideFrustum(planes: Float32Array, b: Bounds): boolean {
  for (let p = 0; p < planes.length; p += 4) {
    const a = planes[p];
    const bb = planes[p + 1];
    const c = planes[p + 2];
    const d = planes[p + 3];
    const x = a >= 0 ? b.maxX : b.minX;
    const y = bb >= 0 ? b.maxY : b.minY;
    const z = c >= 0 ? b.maxZ : b.minZ;
    if (a * x + bb * y + c * z + d < 0) return true;
  }
  return false;
}
