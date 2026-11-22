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
  /** Counts per cell, channels summed (what the heat draws). */
  counts: Float32Array;
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

export function decodeTile(bytes: Uint8Array): DecodedTile {
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
  const counts = new Float32Array(n);
  for (let c = 0; c < channels; c++) {
    const off = c * n;
    for (let i = 0; i < n; i++) counts[i] += cells[off + i];
  }
  return {
    level: bytes[8],
    x: dv.getUint32(12, true),
    y: dv.getUint32(16, true),
    channels,
    estimate: (bytes[7] & 1) !== 0,
    max: dv.getUint32(20, true),
    counts,
  };
}
