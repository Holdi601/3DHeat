import { describe, expect, it } from 'vitest';
import {
  ATLAS_MAX,
  GUTTER,
  TILE_SLACK,
  atlasType,
  planAtlas,
  planTiling,
  remapUvs,
  settleAlpha,
  tileVertices,
  type AtlasCell,
} from './atlas';

function overlaps(a: AtlasCell, b: AtlasCell): boolean {
  // Compared with their gutters, which must not overlap either.
  return (
    a.x - GUTTER < b.x + b.width + GUTTER &&
    b.x - GUTTER < a.x + a.width + GUTTER &&
    a.y - GUTTER < b.y + b.height + GUTTER &&
    b.y - GUTTER < a.y + a.height + GUTTER
  );
}

function cellsOf(plan: ReturnType<typeof planAtlas>): AtlasCell[] {
  return plan.cells.filter((c): c is AtlasCell => c !== null);
}

describe('planAtlas', () => {
  it('keeps the ground at full size when small textures share the atlas', () => {
    // An extracted racetrack: two 2048-pixel ground tiles and eighty model
    // textures. A grid sized to the largest image shrank every cell - the
    // ground's included - to 800 pixels.
    const sizes = [
      { width: 2048, height: 2048 },
      { width: 2048, height: 2048 },
      ...Array.from({ length: 80 }, () => ({ width: 256, height: 256 })),
    ];
    const plan = planAtlas(sizes);
    expect(plan.cells[0]).toMatchObject({ width: 2048, height: 2048 });
    expect(plan.cells[1]).toMatchObject({ width: 2048, height: 2048 });
    expect(plan.cells[2]).toMatchObject({ width: 256, height: 256 });
    expect(plan.width).toBeLessThanOrEqual(ATLAS_MAX);
    expect(plan.height).toBeLessThanOrEqual(ATLAS_MAX);
  });

  it('never overlaps two cells, gutters included, and keeps all inside', () => {
    const sizes = [
      { width: 1024, height: 1024 },
      { width: 256, height: 512 },
      { width: 512, height: 256 },
      ...Array.from({ length: 30 }, (_, i) => ({ width: 64 << (i % 3), height: 64 << ((i + 1) % 3) })),
    ];
    const plan = planAtlas(sizes);
    const cells = cellsOf(plan);
    expect(cells).toHaveLength(sizes.length);
    for (const c of cells) {
      expect(c.x - GUTTER).toBeGreaterThanOrEqual(0);
      expect(c.y - GUTTER).toBeGreaterThanOrEqual(0);
      expect(c.x + c.width + GUTTER).toBeLessThanOrEqual(plan.width);
      expect(c.y + c.height + GUTTER).toBeLessThanOrEqual(plan.height);
    }
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) expect(overlaps(cells[i], cells[j])).toBe(false);
    }
  });

  it('keeps each image its own shape', () => {
    const plan = planAtlas([
      { width: 128, height: 512 },
      { width: 512, height: 128 },
    ]);
    expect(plan.cells[0]).toMatchObject({ width: 128, height: 512 });
    expect(plan.cells[1]).toMatchObject({ width: 512, height: 128 });
  });

  it('shrinks everything by one factor only when it cannot fit', () => {
    const sizes = Array.from({ length: 25 }, () => ({ width: 2048, height: 2048 }));
    const plan = planAtlas(sizes);
    const cells = cellsOf(plan);
    expect(cells).toHaveLength(25);
    expect(plan.width).toBeLessThanOrEqual(ATLAS_MAX);
    expect(plan.height).toBeLessThanOrEqual(ATLAS_MAX);
    expect(cells[0].width).toBeLessThan(2048);
    expect(new Set(cells.map((c) => c.width)).size).toBe(1);
  });

  it('respects a lower ceiling', () => {
    const plan = planAtlas([{ width: 2048, height: 2048 }], 1024);
    expect(plan.width).toBeLessThanOrEqual(1024);
    expect(plan.cells[0]!.width).toBeLessThanOrEqual(1024 - 2 * GUTTER);
  });

  it('gives a missing image no cell and an empty list an empty atlas', () => {
    const plan = planAtlas([null, { width: 64, height: 64 }, { width: 0, height: 0 }]);
    expect(plan.cells[0]).toBeNull();
    expect(plan.cells[1]).not.toBeNull();
    expect(plan.cells[2]).toBeNull();
    expect(planAtlas([])).toEqual({ width: 0, height: 0, cells: [] });
  });
});

describe('remapUvs', () => {
  const plan = {
    width: 100,
    height: 50,
    cells: [{ x: 10, y: 5, width: 40, height: 20 }, null],
  };

  it('maps a vertex into its image cell', () => {
    const out = remapUvs(new Float32Array([0, 0, 1, 1, 0.5, 0.5]), new Int16Array([0, 0, 0]), plan);
    expect(Array.from(out)).toEqual([0.1, 0.1, 0.5, 0.5, 0.3, 0.3].map((v) => Math.fround(v)));
  });

  it('marks a vertex with no image, or an image with no cell, as -1', () => {
    const out = remapUvs(new Float32Array([0.5, 0.5, 0.5, 0.5]), new Int16Array([-1, 1]), plan);
    expect(Array.from(out)).toEqual([-1, -1, -1, -1]);
  });

  it('clamps a UV past its own image so it cannot reach a neighbour', () => {
    const out = remapUvs(new Float32Array([1.2, -0.3]), new Int16Array([0]), plan);
    expect(out[0]).toBeCloseTo(0.5);
    expect(out[1]).toBeCloseTo(0.1);
  });
});

describe('settleAlpha', () => {
  const texels = () => new Uint8ClampedArray([200, 100, 50, 255, 200, 100, 50, 90, 200, 100, 50, 0, 200, 100, 50, 150]);

  it('cuts a masked image at its own cutoff: 0 and black below, 255 at or above', () => {
    const p = texels();
    settleAlpha(p, 0.5);
    expect(Array.from(p)).toEqual([200, 100, 50, 255, 0, 0, 0, 0, 0, 0, 0, 0, 200, 100, 50, 255]);
  });

  it('honours a lower cutoff', () => {
    const p = texels();
    settleAlpha(p, 0.3);
    // 90 of 255 is 0.35, kept; 0 is cut.
    expect([p[7], p[11], p[15]]).toEqual([255, 0, 255]);
  });

  it('makes an image drawn opaque fully opaque and leaves its colour alone', () => {
    const p = texels();
    settleAlpha(p, undefined);
    expect(Array.from(p)).toEqual([200, 100, 50, 255, 200, 100, 50, 255, 200, 100, 50, 255, 200, 100, 50, 255]);
  });
});

describe('atlasType', () => {
  const plan = planAtlas([{ width: 8, height: 8 }, { width: 8, height: 8 }]);
  const jpeg = { mime: 'image/jpeg', bytes: new Uint8Array([1]) };

  it('stays JPEG while every image is opaque', () => {
    expect(atlasType([jpeg, { mime: 'image/png', bytes: new Uint8Array([1]) }], plan)).toBe('image/jpeg');
  });

  it('keeps alpha once a cut-out image has a cell', () => {
    expect(atlasType([jpeg, { mime: 'image/png', bytes: new Uint8Array([1]), cutoff: 0.5 }], plan)).toBe('image/webp');
  });

  it('ignores a cut-out image that has no cell or no bytes', () => {
    const one = planAtlas([{ width: 8, height: 8 }, null]);
    expect(atlasType([jpeg, { mime: 'image/png', bytes: new Uint8Array([1]), cutoff: 0.5 }], one)).toBe('image/jpeg');
    expect(atlasType([jpeg, { mime: 'image/png', bytes: new Uint8Array(0), cutoff: 0.5 }], plan)).toBe('image/jpeg');
  });
});

describe('planTiling', () => {
  const plan = {
    width: 100,
    height: 50,
    cells: [
      { x: 10, y: 5, width: 40, height: 20 },
      { x: 60, y: 5, width: 20, height: 20 },
      { x: 60, y: 30, width: 10, height: 10 },
      null,
    ],
  };
  // Image 0: a brick wall, 0 to 6 along u and 0 to 2 up v. Image 1: a sign,
  // inside 0..1 but for rounding. Image 2: a trim running 0 to 3 along u only.
  // Image 3: no cell.
  const uvs = new Float32Array([0, 0, 6, 2, 0, 1 + TILE_SLACK / 2, 1, -TILE_SLACK / 2, -1, 0.2, 3, 0.8, 5, 5]);
  const imageOf = new Int16Array([0, 0, 1, 1, 2, 2, 3]);

  it('makes a tile of each image whose repeating UVs leave 0..1, numbered from 1', () => {
    const tiling = planTiling(uvs, imageOf, [{}, {}, {}, {}], plan);
    expect(Array.from(tiling.tileOf)).toEqual([1, 0, 2, 0]);
    expect(Array.from(tiling.axes)).toEqual([3, 0, 1, 0]);
    // The cell as fractions of the atlas; the trim's v clamps, so its height is negative.
    expect(Array.from(tiling.rects)).toEqual([0.1, 0.1, 0.4, 0.4, 0.6, 0.6, 0.1, -0.2].map(Math.fround));
  });

  it('leaves an image clamped along an axis its sampler clamps', () => {
    const tiling = planTiling(uvs, imageOf, [{ repeatU: false }, {}, { repeatU: false, repeatV: true }, {}], plan);
    // The wall still repeats up its height; the trim, clamped along its only
    // repeating axis, is no tile at all.
    expect(Array.from(tiling.tileOf)).toEqual([1, 0, 0, 0]);
    expect(Array.from(tiling.axes)).toEqual([2, 0, 0, 0]);
    expect(tiling.rects[2]).toBeCloseTo(-0.4);
    expect(tiling.rects[3]).toBeCloseTo(0.4);
  });

  it('numbers each vertex by its image tile, and gives none when nothing tiles', () => {
    const tiling = planTiling(uvs, imageOf, [{}, {}, {}, {}], plan);
    expect(Array.from(tileVertices(new Int16Array([0, 1, 2, -1, 3]), tiling)!)).toEqual([1, 0, 2, 0, 0]);
    const none = planTiling(new Float32Array([0.5, 0.5]), new Int16Array([0]), [{}], plan);
    expect(none.rects).toHaveLength(0);
    expect(tileVertices(new Int16Array([0]), none)).toBeNull();
  });

  it('keeps a tiled vertex UV its own and maps the rest into their cells', () => {
    const tiling = planTiling(uvs, imageOf, [{}, {}, {}, {}], plan);
    const out = remapUvs(uvs, imageOf, plan, tiling);
    // The wall and the trim: as they were, unclamped.
    expect(Array.from(out.slice(0, 4))).toEqual([0, 0, 6, 2]);
    expect(Array.from(out.slice(8, 12))).toEqual([-1, 0.2, 3, 0.8].map(Math.fround));
    // The sign: clamped into its cell, as before tiles existed.
    expect(out[4]).toBeCloseTo(0.6);
    expect(out[5]).toBeCloseTo(0.5);
    // No cell: no texture.
    expect(Array.from(out.slice(12))).toEqual([-1, -1]);
  });
});
