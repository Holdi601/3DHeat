import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HeatTileSource, type PyramidInfo, type TileBatch } from './source';
import { tileOf } from './tileFormat';

const vector = new Uint8Array(readFileSync(resolve(__dirname, '../../../native/vectors/tiles/tile.bin')));
/** The shared vector re-labelled as tile (level, x, y): the header is outside the zstd frame. */
function tileBytes(level: number, x: number, y: number): Uint8Array {
  const b = vector.slice();
  const dv = new DataView(b.buffer);
  b[8] = level;
  dv.setUint32(12, x, true);
  dv.setUint32(16, y, true);
  return b;
}

const info: PyramidInfo = {
  key: 'k',
  x0: -1000,
  y0: -1000,
  size: 2000,
  leafLevel: 3,
  complete: true,
  estimateLevels: 0,
  levelMax: [],
  rowsCounted: 1,
  fraction: 1,
  how: 'full',
  error: '',
};
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('heat tile source', () => {
  it('asks coarse first within the budget, draws ancestors meanwhile', async () => {
    const asked: bigint[][] = [];
    const budgets: number[] = [];
    const src = new HeatTileSource(
      {
        query: async () => info,
        read: async (_k, ids, budget): Promise<TileBatch> => {
          asked.push(ids);
          budgets.push(budget);
          return {
            tiles: ids.map((id) => ({
              id,
              bytes: tileBytes(tileOf(id).level, tileOf(id).x, tileOf(id).y),
              estimate: false,
            })),
            empty: [],
            pending: [],
            deferred: [],
          };
        },
      },
      { sx: 1, sz: 1, ground: 0 },
      { bytesPerSecond: 1e6, cellPx: 1.5 },
    );
    src.start();
    await flush();
    // Straight down from high up: a parallel view sees all of it, cells of 2000/256/8 world units at 4 px a unit.
    const vp = new Float32Array([0.0009, 0, 0, 0, 0, 0, -0.0001, 0, 0, 0.0009, 0, 0, 0, 0, 0.5, 1]);
    const view = {
      viewProj: vp,
      cameraPos: new Float32Array([0, 5000, 0]),
      perspective: false,
      pxPerUnit: 4,
      cellPx: 0,
      maxTiles: 0,
    };
    const first = src.frame(view)!;
    expect(first.tiles.length).toBe(0);
    await flush();
    expect(asked.length).toBe(1);
    // Ordered coarse first, all from the finest level wanted.
    expect(asked[0].map((id) => tileOf(id).level)).toEqual([...asked[0].map((id) => tileOf(id).level)].sort());
    expect(budgets[0]).toBeLessThanOrEqual(0.5e6);
    const second = src.frame(view)!;
    expect(second.tiles.length).toBe(asked[0].length);
    expect(second.tiles.every((t) => t.perCount > 0)).toBe(true);
    src.dispose();
  });
});
