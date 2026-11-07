import { describe, expect, it } from 'vitest';
import {
  buildSpatialIndex,
  cellRowRange,
  frustumFrom,
  visibleCells,
  type Bounds3,
} from './spatial';

/**
 * The index has one job — never lose a row that could contribute, while losing
 * as many as possible that cannot — and both halves fail silently. Dropping rows
 * makes the picture quietly wrong; keeping them makes the optimisation pointless
 * while still looking like it works.
 *
 * So the tests come in pairs: a conservative check that everything inside is
 * kept, and a check that the thing actually rejects.
 */

const BOUNDS: Bounds3 = { minX: -400, minY: 0, minZ: -400, maxX: 400, maxY: 200, maxZ: 400 };

/** A grid of rows filling the bounds, plus their arrays. */
function field(n: number) {
  const px = new Float32Array(n);
  const py = new Float32Array(n);
  const pz = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    // Deterministic spread rather than random: a failure has to be reproducible.
    px[i] = -400 + ((i * 37) % 800);
    py[i] = (i * 13) % 200;
    pz[i] = -400 + ((i * 71) % 800);
  }
  return { px, py, pz };
}

describe('buildSpatialIndex', () => {
  it('is a permutation — every row exactly once', () => {
    // The property that makes it safe to draw through. A repeated row double-
    // counts heat; a missing one is a hole in the data that nothing reports.
    const n = 5000;
    const { px, py, pz } = field(n);
    const ix = buildSpatialIndex(px, py, pz, 0, n, BOUNDS);
    expect(ix.order.length).toBe(n);
    const seen = new Uint8Array(n);
    for (const r of ix.order) seen[r]++;
    expect([...seen].every((v) => v === 1)).toBe(true);
  });

  it('is ascending within every cell', () => {
    // What lets the time window be intersected with a cell by binary search.
    const n = 5000;
    const { px, py, pz } = field(n);
    const ix = buildSpatialIndex(px, py, pz, 0, n, BOUNDS);
    for (let c = 0; c < ix.cells; c++) {
      for (let i = ix.cellStart[c] + 1; i < ix.cellStart[c + 1]; i++) {
        expect(ix.order[i]).toBeGreaterThan(ix.order[i - 1]);
      }
    }
  });

  it('groups rows that are close together', () => {
    // Two tight clusters far apart must not share a cell, or the index cannot
    // separate them and the whole exercise is pointless.
    const px = new Float32Array([-390, -389, -388, 390, 389, 388]);
    const py = new Float32Array([10, 11, 12, 10, 11, 12]);
    const pz = new Float32Array([-390, -389, -388, 390, 389, 388]);
    const ix = buildSpatialIndex(px, py, pz, 0, 6, BOUNDS);
    const cellOfRow = new Map<number, number>();
    for (let c = 0; c < ix.cells; c++) {
      for (let i = ix.cellStart[c]; i < ix.cellStart[c + 1]; i++) cellOfRow.set(ix.order[i], c);
    }
    expect(cellOfRow.get(0)).toBe(cellOfRow.get(2));
    expect(cellOfRow.get(3)).toBe(cellOfRow.get(5));
    expect(cellOfRow.get(0)).not.toBe(cellOfRow.get(3));
  });

  it('keeps rows outside the bounds rather than dropping them', () => {
    // Bounds come from the dataset and are not always right; a row past them is
    // still a row, and silently losing it is the worst option available.
    const px = new Float32Array([-99999, 0, 99999]);
    const py = new Float32Array([-500, 100, 5000]);
    const pz = new Float32Array([-99999, 0, 99999]);
    const ix = buildSpatialIndex(px, py, pz, 0, 3, BOUNDS);
    expect([...ix.order].sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });

  it('handles an empty range and degenerate bounds', () => {
    const { px, py, pz } = field(4);
    expect(buildSpatialIndex(px, py, pz, 0, 0, BOUNDS).order.length).toBe(0);
    const flat: Bounds3 = { minX: 5, minY: 5, minZ: 5, maxX: 5, maxY: 5, maxZ: 5 };
    const ix = buildSpatialIndex(px, py, pz, 0, 4, flat);
    expect([...ix.order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });

  it('stores rows chunk-local, so a chunk index stands alone', () => {
    const n = 300;
    const { px, py, pz } = field(n);
    const ix = buildSpatialIndex(px, py, pz, 100, 200, BOUNDS);
    expect(ix.order.length).toBe(100);
    // Local indices, so 0..99 rather than 100..199.
    expect(Math.min(...ix.order)).toBe(0);
    expect(Math.max(...ix.order)).toBe(99);
  });
});

describe('visibleCells — the distance shell', () => {
  const n = 20_000;
  const { px, py, pz } = field(n);
  const ix = buildSpatialIndex(px, py, pz, 0, n, BOUNDS);

  it('keeps everything when the shell is unbounded', () => {
    const all = visibleCells(ix, { eyeX: 0, eyeY: 100, eyeZ: 0, near: 0, far: 0, margin: 0 });
    const occupied = countOccupied(ix);
    expect(all.length).toBe(occupied);
  });

  it('rejects nearly everything for a tight shell', () => {
    // The measured case: looking at a doorway with a matching far cull. A tight
    // shell has to actually cut, or none of this pays for itself.
    const tight = visibleCells(ix, {
      eyeX: -390, eyeY: 10, eyeZ: -390, near: 0, far: 60, margin: 0,
    });
    expect(tight.length).toBeGreaterThan(0);
    expect(tight.length).toBeLessThan(countOccupied(ix) * 0.05);
  });

  it('returns cells nearest first', () => {
    // What makes a partial frame look finished: the near sprites cover the most
    // pixels, so they are the ones to spend a short budget on.
    const cells = visibleCells(ix, { eyeX: 0, eyeY: 100, eyeZ: 0, near: 0, far: 0, margin: 0 });
    for (let i = 1; i < cells.length; i++) {
      expect(cells[i].distance).toBeGreaterThanOrEqual(cells[i - 1].distance);
    }
  });

  it('excludes cells entirely inside the near bound', () => {
    const cells = visibleCells(ix, {
      eyeX: 0, eyeY: 100, eyeZ: 0, near: 300, far: 0, margin: 0,
    });
    const centre = cells.find((c) => c.distance === 0);
    expect(centre).toBeUndefined();
  });

  it('grows cells by the sprite margin, so a row just outside is still drawn', () => {
    // A sprite has width. Testing centres alone cuts a ring of sprites that
    // paint into the view from outside it, and the seam is visible.
    const bare = visibleCells(ix, { eyeX: -390, eyeY: 10, eyeZ: -390, near: 0, far: 60, margin: 0 });
    const grown = visibleCells(ix, {
      eyeX: -390, eyeY: 10, eyeZ: -390, near: 0, far: 60, margin: 200,
    });
    expect(grown.length).toBeGreaterThan(bare.length);
  });

  it('skips empty cells', () => {
    // Most of a 32x8x32 grid holds nothing on real data; carrying them through to
    // the planner would cost more than the index saves.
    const sparsePx = new Float32Array([0, 1]);
    const sparsePy = new Float32Array([100, 100]);
    const sparsePz = new Float32Array([0, 1]);
    const sparse = buildSpatialIndex(sparsePx, sparsePy, sparsePz, 0, 2, BOUNDS);
    const cells = visibleCells(sparse, { eyeX: 0, eyeY: 100, eyeZ: 0, near: 0, far: 0, margin: 0 });
    expect(cells.length).toBe(1);
  });
});

describe('visibleCells — the frustum', () => {
  const n = 20_000;
  const { px, py, pz } = field(n);
  const ix = buildSpatialIndex(px, py, pz, 0, n, BOUNDS);

  /** A view-projection looking down -Z from `z`, as three.js would build it. */
  function lookingDownMinusZ(z: number): Float32Array {
    const fov = (60 * Math.PI) / 180;
    const f = 1 / Math.tan(fov / 2);
    const near = 1;
    const far = 5000;
    // Perspective, column-major.
    const p = new Float32Array(16);
    p[0] = f;
    p[5] = f;
    p[10] = (far + near) / (near - far);
    p[11] = -1;
    p[14] = (2 * far * near) / (near - far);
    // View: translate by -z.
    const v = new Float32Array(16);
    v[0] = 1; v[5] = 1; v[10] = 1; v[15] = 1;
    v[14] = -z;
    // p * v, column-major multiply.
    const m = new Float32Array(16);
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += p[k * 4 + r] * v[c * 4 + k];
        m[c * 4 + r] = s;
      }
    }
    return m;
  }

  it('rejects what is behind the camera', () => {
    // The one reject the frustum is unambiguously good for. Everything at
    // positive Z is behind a camera looking down -Z.
    const planes = frustumFrom(lookingDownMinusZ(500));
    const cells = visibleCells(ix, {
      eyeX: 0, eyeY: 100, eyeZ: 500, near: 0, far: 0, planes, margin: 0,
    });
    for (const c of cells) {
      // Cell centre Z must be in front of the eye, within a cell's half-depth.
      expect(ix.cellBounds[c.cell * 6 + 2]).toBeLessThan(500 + ix.cellBounds[c.cell * 6 + 5]);
    }
    expect(cells.length).toBeLessThan(countOccupied(ix));
  });

  it('keeps the cells straight ahead', () => {
    const planes = frustumFrom(lookingDownMinusZ(500));
    const cells = visibleCells(ix, {
      eyeX: 0, eyeY: 100, eyeZ: 500, near: 0, far: 0, planes, margin: 0,
    });
    expect(cells.length).toBeGreaterThan(0);
  });

  it('is not the main filter — a cone still holds much of the map', () => {
    // Recorded because it is the finding that shaped the design: frustum culling
    // alone leaves roughly a quarter of a map in frame, because the cone widens
    // all the way to the far plane. Anyone tempted to drop the distance shell
    // and keep only this should see the number first.
    const planes = frustumFrom(lookingDownMinusZ(500));
    const cells = visibleCells(ix, {
      eyeX: 0, eyeY: 100, eyeZ: 500, near: 0, far: 0, planes, margin: 0,
    });
    expect(cells.length).toBeGreaterThan(countOccupied(ix) * 0.15);
  });
});

describe('cellRowRange', () => {
  const n = 4000;
  const { px, py, pz } = field(n);
  const ix = buildSpatialIndex(px, py, pz, 0, n, BOUNDS);

  it('intersects a cell with the time window', () => {
    // The join between the two orderings: time decides the candidates, the cell
    // decides which of them are worth drawing.
    const cell = firstOccupied(ix);
    const [a, b] = cellRowRange(ix, cell, 0, n);
    expect(a).toBe(ix.cellStart[cell]);
    expect(b).toBe(ix.cellStart[cell + 1]);
  });

  it('returns an empty span when the window excludes the cell', () => {
    const cell = firstOccupied(ix);
    const [a, b] = cellRowRange(ix, cell, n + 10, n + 20);
    expect(b - a).toBe(0);
  });

  it('returns only the rows inside a partial window', () => {
    const cell = firstOccupied(ix);
    const mid = Math.floor(n / 2);
    const [a, b] = cellRowRange(ix, cell, 0, mid);
    for (let i = a; i < b; i++) expect(ix.order[i]).toBeLessThan(mid);
    // And nothing inside the window was left out.
    let expected = 0;
    for (let i = ix.cellStart[cell]; i < ix.cellStart[cell + 1]; i++) {
      if (ix.order[i] < mid) expected++;
    }
    expect(b - a).toBe(expected);
  });

  it('loses no row across every cell for any window', () => {
    // The conservative half, stated globally: summing the per-cell intersections
    // must equal the number of rows in the window. This is the check that would
    // catch an off-by-one in the binary search, which would otherwise show up as
    // a slightly too dim picture that nobody could attribute.
    for (const [lo, hi] of [[0, n], [0, 1], [n - 1, n], [1000, 2500], [777, 778]]) {
      let sum = 0;
      for (let c = 0; c < ix.cells; c++) {
        const [a, b] = cellRowRange(ix, c, lo, hi);
        sum += b - a;
      }
      expect(sum).toBe(hi - lo);
    }
  });
});

function countOccupied(ix: { cells: number; cellStart: Uint32Array }): number {
  let n = 0;
  for (let c = 0; c < ix.cells; c++) if (ix.cellStart[c + 1] > ix.cellStart[c]) n++;
  return n;
}

function firstOccupied(ix: { cells: number; cellStart: Uint32Array }): number {
  for (let c = 0; c < ix.cells; c++) if (ix.cellStart[c + 1] > ix.cellStart[c]) return c;
  throw new Error('no occupied cell');
}
