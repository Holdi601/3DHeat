import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { decodeTile, tileId, tileOf, TILE } from './tileFormat';

describe('heat tile format', () => {
  it('reads the tile the core wrote (native/vectors/tiles/tile.bin)', () => {
    const bytes = new Uint8Array(readFileSync(resolve(__dirname, '../../../native/vectors/tiles/tile.bin')));
    const t = decodeTile(bytes);
    expect([t.level, t.x, t.y, t.channels, t.max, t.estimate]).toEqual([3, 2, 5, 2, 70000, false]);
    // Channels summed: cell 1 is 3 + 4.
    expect(t.counts[1]).toBe(7);
    expect(t.counts[TILE + 2]).toBe(70000);
    expect(t.counts.reduce((a, b) => a + b, 0)).toBe(70007);
  });

  it('packs ids as the protocol does', () => {
    expect(tileOf(tileId(7, 127, 3))).toEqual({ level: 7, x: 127, y: 3 });
    expect(tileId(1, 1, 0)).toBe((1n << 56n) | 1n);
  });
});
