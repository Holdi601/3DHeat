/**
 * Terrarium elevation tiles: heights packed into a PNG's colour.
 *
 * The AWS Terrain Tiles (Mapzen / Tilezen, `elevation-tiles-prod`) store one
 * height per pixel as `R * 256 + G + B / 256 - 32768` metres above sea level,
 * negative under the sea. 256 px Web Mercator tiles, zoom 0 to 15.
 */

export const TERRARIUM_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';

/** Deepest Terrarium zoom; deeper requests are 404. */
export const TERRARIUM_MAX_ZOOM = 15;

export const TILE_SIZE = 256;

/** One pixel's height, metres. */
export function terrariumHeight(r: number, g: number, b: number): number {
  return r * 256 + g + b / 256 - 32768;
}

/** Heights of a decoded RGBA image, one per pixel, row by row. */
export function decodeTerrarium(rgba: Uint8Array | Uint8ClampedArray, out?: Float32Array): Float32Array {
  const n = rgba.length >> 2;
  const h = out ?? new Float32Array(n);
  for (let i = 0, j = 0; i < n; i++, j += 4) h[i] = rgba[j] * 256 + rgba[j + 1] + rgba[j + 2] / 256 - 32768;
  return h;
}

/**
 * A PNG's pixels, decoded off the main thread: an ImageBitmap drawn onto an
 * OffscreenCanvas. Colour management is switched off at every step, since the
 * colour here is a number and a profile conversion would change the height.
 */
export async function decodePng(bytes: ArrayBuffer): Promise<{ width: number; height: number; rgba: Uint8ClampedArray }> {
  const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }), {
    colorSpaceConversion: 'none',
    premultiplyAlpha: 'none',
  });
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('2d context unavailable');
    ctx.drawImage(bitmap, 0, 0);
    const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
    return { width: bitmap.width, height: bitmap.height, rgba: data };
  } finally {
    bitmap.close();
  }
}
