/**
 * Packing a level's textures into one image.
 *
 * A level can carry any number of textures - an extracted racetrack carries one
 * per 512-metre tile - and drawing each with its own binding would mean a draw
 * call per texture and a second bind-group layout for WebGPU's level pipeline.
 * One atlas keeps the level at one draw, one sampler and one UV attribute, and
 * every renderer change down to the shader is "sample this, if the UV is valid".
 *
 * A texture that repeats - a brick wall drawn with a UV running 0 to 40 along
 * its length - cannot be clamped into its cell, and the atlas sampler cannot
 * wrap it either: wrapping happens at the edge of the whole atlas, not of one
 * cell. Such an image becomes a *tile*: its vertices keep their own UVs, carry
 * the tile's number, and the shaders wrap the UV into the tile's rectangle
 * themselves (see `planTiling`).
 *
 * Planning and UV remapping are pure and live here with the tests; drawing the
 * pixels needs a canvas, which only a browser has, so `composeAtlas` is the one
 * function that does not run in Node.
 *
 * The size ceiling is 8192, WebGPU's default limit for a 2D texture. That is
 * sixteen 2048-pixel tiles at full resolution; past that each cell shrinks, so
 * a larger cut of map keeps all its ground at somewhat coarser detail rather
 * than failing to load.
 */

import type { RawImage } from './modelParse';

export const ATLAS_MAX = 8192;

/**
 * Pixels of each cell given over to a copy of the image's own edge.
 *
 * Without it, sampling near a cell's border at a coarse mip blends in whatever
 * image sits next to it in the atlas - which is not the ground next to it in
 * the world - and every tile boundary shows a seam in a colour from elsewhere.
 */
export const GUTTER = 16;

/**
 * Mip levels the atlas may be sampled at: as many as the gutter protects.
 *
 * Each level halves the gutter. At level log2(GUTTER) it is one texel wide and
 * still keeps a bilinear read inside the image's own edge colour; one level
 * more and a small texture's cell reads its neighbours - a billboard in the
 * distance picked up another model's black tyre tread as dark strokes across
 * its face. Coarser levels than this are not generated; far off, the texture
 * aliases a little instead of borrowing from the next cell.
 */
export const ATLAS_MIP_LEVELS = Math.log2(GUTTER) + 1;

export interface AtlasCell {
  /** The cell's inner rectangle, where the image itself sits. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AtlasPlan {
  width: number;
  height: number;
  /** One per source image, in the same order; null for an image with nothing to draw. */
  cells: Array<AtlasCell | null>;
}

/**
 * How far past 0..1 a UV may stray before its image is drawn as a tile.
 *
 * Exported UVs on a texture meant to cover a face once land a hair outside
 * their range - 1.0002, -0.0001 - from rounding. Clamped, as before, those
 * read the image's edge; wrapped, they would read a sliver of the opposite
 * edge, which is correct and invisible but costs a tile for nothing.
 */
export const TILE_SLACK = 1 / 256;

/**
 * The images drawn as repeating tiles, and where each one is in the atlas.
 *
 * An image tiles along an axis when its glTF sampler repeats along it (the
 * glTF default) and some vertex's UV actually leaves 0..1 along it. One that
 * stays inside its range on both axes is drawn as it always was, clamped into
 * its cell, whatever its sampler says - which keeps a terrain tile's edges
 * blending into the next tile's rather than into its own opposite edge.
 */
export interface AtlasTiling {
  /** Per image: its tile number, from 1, or 0 for an image drawn clamped. */
  tileOf: Uint16Array;
  /** Per image: 1 if it repeats along u, 2 along v, 3 both, 0 neither. */
  axes: Uint8Array;
  /**
   * Four floats per tile, tile 1 first: the cell's x, y, width and height as
   * fractions of the atlas. A negative width or height marks an axis that
   * clamps rather than repeats - a texture that repeats along a wall's length
   * but not up its height.
   */
  rects: Float32Array;
}

/** Decide which images tile, from their samplers and the UVs that address them. */
export function planTiling(
  uvs: Float32Array,
  imageOf: Int16Array,
  images: Array<Pick<RawImage, 'repeatU' | 'repeatV'>>,
  plan: AtlasPlan,
): AtlasTiling {
  const n = images.length;
  const lo = new Float32Array(n * 2).fill(Infinity);
  const hi = new Float32Array(n * 2).fill(-Infinity);
  for (let v = 0; v < imageOf.length; v++) {
    const i = imageOf[v];
    if (i < 0 || i >= n) continue;
    const u = uvs[v * 2];
    const w = uvs[v * 2 + 1];
    if (u < lo[i * 2]) lo[i * 2] = u;
    if (u > hi[i * 2]) hi[i * 2] = u;
    if (w < lo[i * 2 + 1]) lo[i * 2 + 1] = w;
    if (w > hi[i * 2 + 1]) hi[i * 2 + 1] = w;
  }
  const outside = (i: number, axis: number) =>
    lo[i * 2 + axis] < -TILE_SLACK || hi[i * 2 + axis] > 1 + TILE_SLACK;
  const tileOf = new Uint16Array(n);
  const axes = new Uint8Array(n);
  const rects: number[] = [];
  for (let i = 0; i < n; i++) {
    const cell = plan.cells[i];
    // Tile numbers are 16 bits per vertex; past that an image stays clamped.
    if (!cell || rects.length / 4 >= 0xffff) continue;
    const a =
      (images[i].repeatU !== false && outside(i, 0) ? 1 : 0) |
      (images[i].repeatV !== false && outside(i, 1) ? 2 : 0);
    if (a === 0) continue;
    axes[i] = a;
    tileOf[i] = rects.length / 4 + 1;
    rects.push(
      cell.x / plan.width,
      cell.y / plan.height,
      ((a & 1 ? 1 : -1) * cell.width) / plan.width,
      ((a & 2 ? 1 : -1) * cell.height) / plan.height,
    );
  }
  return { tileOf, axes, rects: new Float32Array(rects) };
}

/**
 * Per-vertex tile numbers: the vertex's image's, 0 where it is drawn clamped.
 *
 * Null when nothing tiles, so a level without a repeating texture carries no
 * extra array at all.
 */
export function tileVertices(imageOf: Int16Array, tiling: AtlasTiling): Uint16Array | null {
  if (tiling.rects.length === 0) return null;
  const out = new Uint16Array(imageOf.length);
  for (let v = 0; v < imageOf.length; v++) {
    const i = imageOf[v];
    out[v] = i >= 0 && i < tiling.tileOf.length ? tiling.tileOf[i] : 0;
  }
  return out;
}

/**
 * Where each image goes.
 *
 * Shelves: images sorted tallest first, laid left to right in rows, each at its
 * own size. A grid of equal cells - what this used to be - is right while every
 * image is a terrain tile of one size, and badly wrong the moment they differ:
 * two 2048-pixel ground tiles beside eighty 256-pixel guardrail and sign
 * textures made a ten-by-nine grid, and every cell, the ground's included,
 * shrank to 800 pixels. The ground lost more than half its resolution to make
 * room for textures a tenth its size.
 *
 * Only if the shelves will not fit within `max` both ways is everything scaled
 * down, by one factor for all, until they do.
 */
export function planAtlas(
  sizes: Array<{ width: number; height: number } | null>,
  max = ATLAS_MAX,
): AtlasPlan {
  const order = sizes
    .map((s, i) => ({ s, i }))
    .filter((e): e is { s: { width: number; height: number }; i: number } => !!e.s && e.s.width > 0 && e.s.height > 0)
    .sort((a, b) => b.s.height - a.s.height || b.s.width - a.s.width);
  if (order.length === 0) return { width: 0, height: 0, cells: sizes.map(() => null) };

  let scale = 1;
  for (let attempt = 0; attempt < 64; attempt++) {
    const packed = shelves(order, scale, max);
    if (packed) {
      const cells: Array<AtlasCell | null> = sizes.map(() => null);
      for (const { i, cell } of packed.cells) cells[i] = cell;
      return { width: packed.width, height: packed.height, cells };
    }
    scale *= 0.9;
  }
  // Unreachable for any real input: at 0.9^64 every image is a pixel.
  return { width: 0, height: 0, cells: sizes.map(() => null) };
}

/** One packing attempt at `scale`, or null if it does not fit in `max`. */
function shelves(
  order: Array<{ s: { width: number; height: number }; i: number }>,
  scale: number,
  max: number,
): { width: number; height: number; cells: Array<{ i: number; cell: AtlasCell }> } | null {
  const boxes = order.map(({ s, i }) => {
    const width = Math.max(1, Math.round(s.width * scale));
    const height = Math.max(1, Math.round(s.height * scale));
    return { i, width, height, outerW: width + 2 * GUTTER, outerH: height + 2 * GUTTER };
  });
  const widest = Math.max(...boxes.map((b) => b.outerW));
  if (widest > max) return null;
  // Aim for a square: the shelf width that the total area would need, but never
  // narrower than the widest image, nor wider than the ceiling.
  const area = boxes.reduce((sum, b) => sum + b.outerW * b.outerH, 0);
  const shelfWidth = Math.min(max, Math.max(widest, Math.ceil(Math.sqrt(area * 1.15))));

  const cells: Array<{ i: number; cell: AtlasCell }> = [];
  let x = 0;
  let y = 0;
  let shelfHeight = 0;
  let usedWidth = 0;
  for (const b of boxes) {
    if (x + b.outerW > shelfWidth) {
      y += shelfHeight;
      x = 0;
      shelfHeight = 0;
    }
    if (y + b.outerH > max) return null;
    cells.push({ i: b.i, cell: { x: x + GUTTER, y: y + GUTTER, width: b.width, height: b.height } });
    x += b.outerW;
    usedWidth = Math.max(usedWidth, x);
    shelfHeight = Math.max(shelfHeight, b.outerH);
  }
  return { width: usedWidth, height: y + shelfHeight, cells };
}

/**
 * Per-vertex UVs into the atlas.
 *
 * `-1` in both components marks a vertex with no texture, which the shaders
 * test for. Source UVs are clamped to their own image first: a UV a hair past
 * 1.0 is harmless on its own texture with clamp-to-edge, and in an atlas it
 * would reach into the neighbour.
 *
 * A vertex whose image tiles keeps its own UV, unclamped: the shaders wrap it
 * into the tile's rectangle per pixel, which no per-vertex mapping can do.
 */
export function remapUvs(
  uvs: Float32Array,
  imageOf: Int16Array,
  plan: AtlasPlan,
  tiling?: AtlasTiling,
): Float32Array {
  const out = new Float32Array(uvs.length);
  for (let v = 0; v < imageOf.length; v++) {
    const cell = imageOf[v] >= 0 ? plan.cells[imageOf[v]] : null;
    if (!cell) {
      out[v * 2] = -1;
      out[v * 2 + 1] = -1;
      continue;
    }
    if (tiling && tiling.tileOf[imageOf[v]] > 0) {
      out[v * 2] = uvs[v * 2];
      out[v * 2 + 1] = uvs[v * 2 + 1];
      continue;
    }
    const u = Math.min(1, Math.max(0, uvs[v * 2]));
    const w = Math.min(1, Math.max(0, uvs[v * 2 + 1]));
    out[v * 2] = (cell.x + u * cell.width) / plan.width;
    out[v * 2 + 1] = (cell.y + w * cell.height) / plan.height;
  }
  return out;
}

/**
 * The atlas's encoding: JPEG, as it has always been, unless a cut-out image is
 * in it. JPEG has no alpha; WebP keeps it at a similar size, and a browser that
 * cannot encode WebP hands back PNG, which keeps it too.
 */
export function atlasType(images: RawImage[], plan: AtlasPlan): 'image/jpeg' | 'image/webp' {
  return images.some((image, i) => image.cutoff !== undefined && plan.cells[i] && image.bytes.length > 0)
    ? 'image/webp'
    : 'image/jpeg';
}

/**
 * Settle a cell's alpha, in place, once it is drawn: 0 or 255 on a cut-out
 * image, by its own material's cutoff; 255 on any other.
 *
 * After this one threshold serves every material: the shaders discard a
 * textured fragment whose alpha samples below 0.5, which a texel at 255 never
 * does. A colour image that happens to carry alpha but is drawn opaque gets
 * 255, so it looks as it did before atlases had alpha. An empty texel's colour
 * is 0 - the canvas keeps colour premultiplied - which is what lets the shader
 * divide a leaf's edge by its alpha and get the leaf's colour back.
 */
export function settleAlpha(pixels: Uint8ClampedArray, cutoff: number | undefined): void {
  const level = cutoff === undefined ? -1 : cutoff * 255;
  for (let i = 3; i < pixels.length; i += 4) {
    if (cutoff === undefined || pixels[i] >= level) {
      pixels[i] = 255;
    } else {
      pixels[i] = 0;
      pixels[i - 3] = 0;
      pixels[i - 2] = 0;
      pixels[i - 1] = 0;
    }
  }
}

/**
 * Draw the images into one, and encode it.
 *
 * Returns an encoded blob rather than pixels because the atlas is also what the
 * level library stores, and a JPEG of a 4096-pixel atlas is a few megabytes
 * where its pixels are sixty-four.
 */
export async function composeAtlas(
  images: RawImage[],
  plan: AtlasPlan,
  tiling?: AtlasTiling,
): Promise<Blob | null> {
  if (plan.width === 0 || typeof OffscreenCanvas === 'undefined') return null;
  const canvas = new OffscreenCanvas(plan.width, plan.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, plan.width, plan.height);
  ctx.imageSmoothingQuality = 'high';
  const type = atlasType(images, plan);
  for (let i = 0; i < images.length; i++) {
    const cell = plan.cells[i];
    if (!cell || images[i].bytes.length === 0) continue;
    const bitmap = await createImageBitmap(
      new Blob([images[i].bytes], { type: images[i].mime || 'image/jpeg' }),
    );
    const outer = [cell.x - GUTTER, cell.y - GUTTER, cell.width + 2 * GUTTER, cell.height + 2 * GUTTER] as const;
    const cutoff = images[i].cutoff;
    // A cut-out image goes onto nothing rather than onto the grey: drawn over
    // the grey, its empty texels would turn grey and solid.
    if (cutoff !== undefined) ctx.clearRect(...outer);
    // The gutter first, as the image stretched over the whole cell, so its
    // border is the image's own edge colour; then the image itself inside.
    ctx.drawImage(bitmap, ...outer);
    // A tile's gutter is its own opposite edge instead, along each axis it
    // repeats: the texels a bilinear or mipmapped read takes from across the
    // cell's border are then the ones the next repeat starts with, and the
    // seam where the shader wraps the UV does not show.
    const axes = tiling?.axes[i] ?? 0;
    if (axes) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(...outer);
      ctx.clip();
      for (const dy of axes & 2 ? [-1, 0, 1] : [0]) {
        for (const dx of axes & 1 ? [-1, 0, 1] : [0]) {
          if (dx === 0 && dy === 0) continue;
          ctx.drawImage(bitmap, cell.x + dx * cell.width, cell.y + dy * cell.height, cell.width, cell.height);
        }
      }
      ctx.restore();
    }
    ctx.drawImage(bitmap, cell.x, cell.y, cell.width, cell.height);
    bitmap.close();
    // Only an atlas that keeps alpha needs it settled, and in it only the cells
    // that can hold any: a JPEG is opaque already.
    if (type !== 'image/jpeg' && (cutoff !== undefined || !/jpe?g/i.test(images[i].mime))) {
      const pixels = ctx.getImageData(...outer);
      settleAlpha(pixels.data, cutoff);
      ctx.putImageData(pixels, outer[0], outer[1]);
    }
  }
  return canvas.convertToBlob({ type, quality: 0.92 });
}

/** What the worker carries on from the atlas: per-vertex arrays and the image. */
export interface BuiltAtlas {
  uvs: Float32Array;
  /** Per-vertex tile number, 0 for a clamped vertex; null when nothing tiles. */
  uvTiles: Uint16Array | null;
  /** The tiles' rectangles, four floats each (see `AtlasTiling.rects`); null when nothing tiles. */
  tileRects: Float32Array | null;
  atlas: Blob;
}

/** Everything the worker needs to do, in one call: plan, remap, draw. */
export async function buildAtlas(
  uvs: Float32Array | null | undefined,
  imageOf: Int16Array | null | undefined,
  images: RawImage[] | undefined,
): Promise<BuiltAtlas | null> {
  if (!uvs || !imageOf || !images?.length) return null;
  const sizes = await Promise.all(
    images.map(async (image) => {
      if (image.bytes.length === 0 || typeof createImageBitmap === 'undefined') return null;
      const bitmap = await createImageBitmap(new Blob([image.bytes], { type: image.mime || 'image/jpeg' }));
      const size = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return size;
    }),
  );
  const plan = planAtlas(sizes);
  const tiling = planTiling(uvs, imageOf, images, plan);
  const atlas = await composeAtlas(images, plan, tiling);
  if (!atlas) return null;
  const uvTiles = tileVertices(imageOf, tiling);
  return {
    uvs: remapUvs(uvs, imageOf, plan, tiling),
    uvTiles,
    tileRects: uvTiles ? tiling.rects : null,
    atlas,
  };
}
