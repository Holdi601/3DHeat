/**
 * The level's messages to the native viewport (`viewport_level`, sent in 4 MB parts and one after
 * the other): what the WebGPU renderer uploads in `setLevel`, `uploadMesh`, `loadAtlas` and
 * `setWorldTiles`, as bytes the viewport reads (`native/crates/viewport/src/occlusion.rs`,
 * `LevelMesh::parse` and `Renderer::level_message`).
 *
 * Each message is a kind word, then its body:
 *
 * - `LEVEL_NONE`: no level (and no map);
 * - `LEVEL_MESH`: a mesh id (0 the level, else a world tile), a 10-word head (vertex floats,
 *   ground indices, has colours, structure indices, edge indices, water indices, has UVs, has
 *   tile numbers, tile-table floats, 0), the bounds (6 floats), then positions+normals, colours,
 *   UVs, tile numbers (u32), the tile table and the four index sets;
 * - `LEVEL_IMAGE`: a mesh id, width, height, mip count, then each level's RGBA (the level's
 *   atlas, a tile's image), each half the one before;
 * - `LEVEL_MAP`: an image level's picture: width, height, RGBA;
 * - `LEVEL_DROP`: a world tile's id, gone (`0xffffffff`: every tile).
 */
import { ATLAS_MIP_LEVELS } from '../../data/atlas';

export const LEVEL_NONE = 0;
export const LEVEL_MESH = 1;
export const LEVEL_IMAGE = 2;
export const LEVEL_MAP = 3;
export const LEVEL_DROP = 4;

/** The largest texture side the viewport is sent (wgpu's default limit); larger ones are scaled down, as `loadAtlas` does on a smaller device. */
export const NATIVE_TEXTURE_LIMIT = 8192;

export interface MeshSource {
  vertices: Float32Array;
  colours?: Float32Array | null;
  uvs?: Float32Array | null;
  uvTiles?: ArrayLike<number> | null;
  tileRects?: Float32Array | null;
  indices: Uint32Array;
  structureIndices?: Uint32Array | null;
  structureEdges?: Uint32Array | null;
  waterIndices?: Uint32Array | null;
  bounds?: { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number } | null;
}

const NONE = new Uint32Array(0);

/** `LEVEL_MESH`: the mesh as `uploadMesh` takes it (colours, UVs and tiles only when whole). */
export function meshMessage(id: number, m: MeshSource): Uint8Array {
  const nv = m.vertices.length - (m.vertices.length % 6);
  const n = nv / 6;
  const colours = m.colours && m.colours.length >= n * 3 ? m.colours.subarray(0, n * 3) : null;
  const uvs = m.uvs && m.uvs.length >= n * 2 ? m.uvs.subarray(0, n * 2) : null;
  const tiles = uvs && m.uvTiles && m.uvTiles.length >= n && m.tileRects ? m.uvTiles : null;
  const rects = tiles ? m.tileRects! : null;
  const sets = [m.indices, m.structureIndices ?? NONE, m.structureEdges ?? NONE, m.waterIndices ?? NONE];
  const words = 2 + 10 + 6 + nv + (colours?.length ?? 0) + (uvs?.length ?? 0) + (tiles ? n : 0) + (rects?.length ?? 0) + sets.reduce((a, s) => a + s.length, 0);
  const buf = new ArrayBuffer(words * 4);
  const u = new Uint32Array(buf);
  const f = new Float32Array(buf);
  u.set([LEVEL_MESH, id >>> 0, nv, sets[0].length, colours ? 1 : 0, sets[1].length, sets[2].length, sets[3].length, uvs ? 1 : 0, tiles ? 1 : 0, rects?.length ?? 0, 0]);
  const b = m.bounds;
  if (b) f.set([b.minX, b.minY, b.minZ, b.maxX, b.maxY, b.maxZ], 12);
  else f.set([-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity], 12);
  let at = 18;
  f.set(m.vertices.subarray(0, nv), at);
  at += nv;
  if (colours) {
    f.set(colours, at);
    at += colours.length;
  }
  if (uvs) {
    f.set(uvs, at);
    at += uvs.length;
  }
  if (tiles) {
    for (let i = 0; i < n; i++) u[at + i] = tiles[i];
    at += n;
  }
  if (rects) {
    f.set(rects, at);
    at += rects.length;
  }
  for (const s of sets) {
    u.set(s, at);
    at += s.length;
  }
  return new Uint8Array(buf);
}

/** A bitmap's RGBA, as `copyExternalImageToTexture` takes it (not premultiplied). */
export function bitmapPixels(b: ImageBitmap): Uint8Array {
  const c = new OffscreenCanvas(b.width, b.height);
  const g = c.getContext('2d', { willReadFrequently: true });
  if (!g) throw new Error('no 2d context');
  g.drawImage(b, 0, 0);
  const d = g.getImageData(0, 0, b.width, b.height);
  return new Uint8Array(d.data.buffer, d.data.byteOffset, d.data.byteLength);
}

/** `LEVEL_IMAGE` or `LEVEL_MAP` from its levels' pixels (the first the full size). */
export function imageMessage(kind: typeof LEVEL_IMAGE | typeof LEVEL_MAP, id: number, width: number, height: number, levels: Uint8Array[]): Uint8Array {
  const head = kind === LEVEL_IMAGE ? [kind, id >>> 0, width, height, levels.length] : [kind, width, height];
  const bytes = head.length * 4 + levels.reduce((a, l) => a + l.byteLength, 0);
  const out = new Uint8Array(bytes);
  new Uint32Array(out.buffer, 0, head.length).set(head);
  let at = head.length * 4;
  for (const l of levels) {
    out.set(l, at);
    at += l.byteLength;
  }
  return out;
}

/**
 * `loadAtlas`'s levels: the atlas decoded, shrunk to `limit`, and each mip level from the one
 * above by the browser's scaler, `ATLAS_MIP_LEVELS` at most (`mipCap`), as RGBA. Null if `stale`
 * turns true on the way.
 */
export async function imageLevels(
  source: Blob | ImageBitmap,
  mipCap: number,
  stale: () => boolean,
  chain = true,
  limit = NATIVE_TEXTURE_LIMIT,
): Promise<{ width: number; height: number; levels: Uint8Array[] } | null> {
  // Every bitmap made here is closed at the end; a bitmap passed in belongs to its caller.
  const made: ImageBitmap[] = [];
  const make = async (from: ImageBitmap | Blob, opts: ImageBitmapOptions) => {
    const b = await createImageBitmap(from, opts);
    made.push(b);
    return b;
  };
  try {
    let level = source instanceof ImageBitmap ? source : await make(source, { imageOrientation: 'none' });
    if (level.width < 1 || level.height < 1) return null;
    if (level.width > limit || level.height > limit) {
      const scale = limit / Math.max(level.width, level.height);
      level = await make(level, { resizeWidth: Math.floor(level.width * scale), resizeHeight: Math.floor(level.height * scale), resizeQuality: 'high' });
    }
    const top = level;
    const mips = Math.min(mipCap, Math.floor(Math.log2(Math.max(top.width, top.height))) + 1);
    const levels: Uint8Array[] = [];
    let width = top.width;
    let height = top.height;
    for (let mip = 0; mip < mips; mip++) {
      if (stale()) return null;
      levels.push(bitmapPixels(level).slice());
      if (mip + 1 === mips) break;
      width = Math.max(1, width >> 1);
      height = Math.max(1, height >> 1);
      // As `loadAtlas`, the atlas's levels each from the one above; as `uploadTileImage`, a
      // tile's from its full size (`chain` false).
      level = await make(chain ? level : top, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' });
    }
    return { width: top.width, height: top.height, levels };
  } finally {
    for (const b of made) b.close();
  }
}

export { ATLAS_MIP_LEVELS };
