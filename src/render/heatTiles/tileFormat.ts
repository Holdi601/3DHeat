/**
 * Heat tiles (Stage 6) as the core writes them (`native/crates/core/src/tiles.rs`):
 * a 32-byte header, then a zstd frame of 256 x 256 cells per channel, u16 or
 * u32 little-endian. Level `l` covers the pyramid's square with 2^l x 2^l tiles.
 */

import { decompress as zstd } from 'fzstd';

export const TILE = 256;
const HEADER = 32;

export interface DecodedTile {
  level: number;
  x: number;
  y: number;
  channels: number;
  estimate: boolean;
  max: number;
  /** Rows in the tile, every channel, unweighted (what a load of its square would read). */
  rows: number;
  /** Counts per cell, channels summed (what the heat draws), or weighed by `ChannelWeights` with one component. */
  counts: Float32Array;
  /**
   * With four-component weights: each cell's (heat, a, b, L) sums as half
   * floats, divided by `amp` so the largest is 1 (the heat target's team
   * colours, render/colors.ts `teamHeatLab`).
   */
  rgba?: Uint16Array;
  amp?: number;
}

/**
 * How a split pyramid's channels are drawn (`channels.ts`): per channel the
 * weight of its counts, one component (a signed heat: the difference) or four
 * (heat, and the group's Oklab a, b, L times it: team colours).
 */
export interface ChannelWeights {
  components: 1 | 4;
  /** channels x components. */
  w: Float32Array;
  /** Equal keys, equal weights. */
  key: string;
}

const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);
/** A float as IEEE half bits (round to nearest; overflow to infinity, tiny to zero). */
export function toHalf(v: number): number {
  f32[0] = v;
  const x = u32[0];
  const sign = (x >>> 16) & 0x8000;
  const e = ((x >>> 23) & 0xff) - 127 + 15;
  const m = x & 0x7fffff;
  if (e >= 31) return sign | 0x7c00;
  if (e <= 0) {
    if (e < -10) return sign;
    const mm = (m | 0x800000) >>> (1 - e);
    return sign | ((mm + 0x1000) >>> 13);
  }
  return sign | ((e << 10) + ((m + 0x1000) >>> 13));
}

/** `level << 56 | y << 28 | x`, as the protocol's tile ids. */
export function tileId(level: number, x: number, y: number): bigint {
  return (BigInt(level) << 56n) | (BigInt(y) << 28n) | BigInt(x);
}

export function tileOf(id: bigint): { level: number; x: number; y: number } {
  return {
    level: Number(id >> 56n),
    y: Number((id >> 28n) & 0x0fffffffn),
    x: Number(id & 0x0fffffffn),
  };
}

/** A string key for maps: "l/x/y". */
export function tileKey(level: number, x: number, y: number): string {
  return `${level}/${x}/${y}`;
}

export function decodeTile(bytes: Uint8Array, weights: ChannelWeights | null = null): DecodedTile {
  if (bytes.length < HEADER || bytes[0] !== 0x48 || bytes[1] !== 0x33 || bytes[2] !== 0x44 || bytes[3] !== 0x54 || bytes[4] !== 1) {
    throw new Error('not a heat tile');
  }
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = bytes[5];
  const channels = bytes[6];
  const rawLen = dv.getUint32(24, true);
  if ((width !== 2 && width !== 4) || channels === 0 || rawLen !== TILE * TILE * channels * width) throw new Error('bad heat tile header');
  const raw = zstd(bytes.subarray(HEADER), new Uint8Array(rawLen));
  const cells = width === 4 ? new Uint32Array(raw.buffer, raw.byteOffset, rawLen / 4) : new Uint16Array(raw.buffer, raw.byteOffset, rawLen / 2);
  const n = TILE * TILE;
  let rows = 0;
  for (let i = 0; i < cells.length; i++) rows += cells[i];
  const head = {
    rows,
    level: bytes[8],
    x: dv.getUint32(12, true),
    y: dv.getUint32(16, true),
    channels,
    estimate: (bytes[7] & 1) !== 0,
    max: dv.getUint32(20, true),
  };
  // Weights for another channel count (the pyramid changed under them) count for nothing: summed.
  const w = weights && weights.w.length === channels * weights.components ? weights : null;
  if (w && w.components === 4) {
    const sums = new Float32Array(n * 4);
    let big = 0;
    for (let c = 0; c < channels; c++) {
      const off = c * n;
      const [k0, k1, k2, k3] = [w.w[c * 4], w.w[c * 4 + 1], w.w[c * 4 + 2], w.w[c * 4 + 3]];
      if (k0 === 0 && k1 === 0 && k2 === 0 && k3 === 0) continue;
      for (let i = 0; i < n; i++) {
        const v = cells[off + i];
        if (v === 0) continue;
        sums[i * 4] += v * k0;
        sums[i * 4 + 1] += v * k1;
        sums[i * 4 + 2] += v * k2;
        sums[i * 4 + 3] += v * k3;
      }
    }
    for (let i = 0; i < sums.length; i++) big = Math.max(big, Math.abs(sums[i]));
    const amp = big > 0 ? big : 1;
    const rgba = new Uint16Array(n * 4);
    for (let i = 0; i < sums.length; i++) rgba[i] = toHalf(sums[i] / amp);
    // The plain sum too: what the exposure and an ancestor stand-in read.
    const counts = new Float32Array(n);
    for (let i = 0; i < n; i++) counts[i] = sums[i * 4];
    return { ...head, counts, rgba, amp };
  }
  const counts = new Float32Array(n);
  for (let c = 0; c < channels; c++) {
    const off = c * n;
    const k = w ? w.w[c] : 1;
    if (k === 0) continue;
    for (let i = 0; i < n; i++) counts[i] += k * cells[off + i];
  }
  return { ...head, counts };
}
