import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { teamHeatLab } from '../colors';
import { tileChannelWeights, type ChannelRules } from './channels';
import { kernelRadius, KERNEL_CELLS, selectTiles } from './lod';
import { decodeTile, toHalf, TILE } from './tileFormat';

const rules = (over: Partial<ChannelRules>): ChannelRules => ({
  names: ['red', 'blue'],
  groups: null,
  mode: 'heat',
  teamSign: null,
  positive: [],
  negative: [],
  visibility: {},
  splitMode: 0,
  splitScale: [1, 1],
  teamColors: false,
  ...over,
});

describe('heat tile channels', () => {
  it('plain heat sums the channels (no weights)', () => {
    expect(tileChannelWeights(rules({}))).toBeNull();
    expect(tileChannelWeights(rules({ names: ['only'] }))).toBeNull();
  });

  it('a hidden group weighs 0; groups found by label in the rows', () => {
    const w = tileChannelWeights(rules({ groups: ['blue', 'red'], teamSign: new Int8Array([0, 1]) }))!;
    // Channel 0 is "red" = group 1 (shown), channel 1 "blue" = group 0 (hidden).
    expect(Array.from(w.w)).toEqual([1, 0]);
  });

  it('the difference signs each side and scales it; tiles alone use the side lists', () => {
    const w = tileChannelWeights(
      rules({
        names: ['a', 'b', 'c'],
        mode: 'heat-difference',
        positive: [0],
        negative: [2],
        splitScale: [1, 0.5],
      }),
    )!;
    expect(Array.from(w.w)).toEqual([1, 0, -0.5]);
  });

  it('team colours carry the group colour as the splat does', () => {
    const w = tileChannelWeights(rules({ teamColors: true, mode: 'heat-teams' }))!;
    expect(w.components).toBe(4);
    const [L, a, b] = teamHeatLab(1, 2);
    expect(Array.from(w.w.slice(4))).toEqual(Array.from(new Float32Array([1, a, b, L])));
  });

  it('decodes a split tile with weights, one component and four', () => {
    const bytes = new Uint8Array(readFileSync(resolve(__dirname, '../../../native/vectors/tiles/tile.bin')));
    // Cell 1 holds 3 and 4 in the two channels.
    const one = decodeTile(bytes, {
      components: 1,
      w: new Float32Array([1, -1]),
      key: 'd',
    });
    expect(one.counts[1]).toBe(-1);
    const four = decodeTile(bytes, {
      components: 4,
      w: new Float32Array([1, 0.5, 0, 0.7, 1, -0.5, 0, 0.7]),
      key: 't',
    });
    expect(four.amp).toBeGreaterThan(0);
    expect(four.counts[1]).toBe(7);
    expect(four.rgba![4]).toBe(toHalf(7 / four.amp!));
    expect(four.rgba![5]).toBe(toHalf((3 * 0.5 - 4 * 0.5) / four.amp!));
    // Weights for another channel count are ignored: summed.
    expect(decodeTile(bytes, { components: 1, w: new Float32Array([2]), key: 'x' }).counts[1]).toBe(7);
  });

  it('half floats round as the GPU reads them', () => {
    expect(toHalf(1)).toBe(0x3c00);
    expect(toHalf(-2)).toBe(0xc000);
    expect(toHalf(0.5)).toBe(0x3800);
    expect(toHalf(65504)).toBe(0x7bff);
    expect(toHalf(1e9)).toBe(0x7c00);
    expect(toHalf(2 ** -24)).toBe(1);
  });
});

describe('heat tile LOD with a kernel', () => {
  it('refines no finer than the sprite needs', () => {
    const vp = new Float32Array([1 / 1000, 0, 0, 0, 0, 0, -1 / 1000, 0, 0, 1 / 1000, 0, 0, 0, 0, 0.5, 1]);
    const view = {
      viewProj: vp,
      cameraPos: new Float32Array([0, 100, 0]),
      perspective: false,
      pxPerUnit: 1,
      cellPx: 0.01,
      maxTiles: 4096,
    };
    const p = { x0: -1000, y0: -1000, size: 2000, leafLevel: 5 };
    const place = { sx: 1, sz: 1, ground: 0 };
    const deepest = (k?: { radius: number; minPx: number; maxPx: number }) => Math.max(...selectTiles(p, place, { ...view, kernel: k }).map((t) => t.level));
    expect(deepest()).toBe(5);
    // Radius 4: cells of 2000 / 2^l / 256 stop at 2-4 cells a radius.
    const l = deepest({ radius: 4, minPx: 0, maxPx: 0 });
    const cell = 2000 / (1 << l) / TILE;
    expect(l).toBeLessThan(5);
    expect(4 / cell).toBeGreaterThanOrEqual(KERNEL_CELLS / 2);
    expect(4 / cell).toBeLessThanOrEqual(KERNEL_CELLS);
    // The pixel clamp widens the sprite: 8 px at 1 px a unit is 8 units.
    expect(kernelRadius({ radius: 1, minPx: 8, maxPx: 0 }, 1, false, 1)).toBe(8);
    expect(kernelRadius({ radius: 100, minPx: 0, maxPx: 10 }, 2, true, 4)).toBe(20);
  });
});
