import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { EDGE_AT, MESH_STRIDE, markEdges, meshOf } from './instances';

/** A unit cube's twelve flat-shaded triangles in mesh layout (normal per face), as the figures' boxes are built. */
function cube(): Float32Array {
  const faces: [number[], number[][]][] = [
    [[1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]],
    [[-1, 0, 0], [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]],
    [[0, 1, 0], [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]]],
    [[0, -1, 0], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],
    [[0, 0, 1], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]],
    [[0, 0, -1], [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]]],
  ];
  const out = new Float32Array(36 * MESH_STRIDE);
  let v = 0;
  for (const [n, q] of faces) {
    for (const k of [0, 1, 2, 0, 2, 3]) {
      out.set(q[k], v * MESH_STRIDE);
      out.set([0.5, 0.5, 0.5, 1], v * MESH_STRIDE + 3);
      out.set(n, v * MESH_STRIDE + 7);
      v++;
    }
  }
  return out;
}

/** Whether side j (facing corner j) of triangle t is marked a feature. */
function feature(d: Float32Array, t: number, j: number): boolean {
  const code = d[t * 3 * MESH_STRIDE + EDGE_AT];
  if (code === 0) return false;
  const mask = Math.floor((code - 1) / 3);
  return (mask & (1 << j)) === 0;
}

describe('feature edges', () => {
  it("outlines a box's twelve edges and not its faces' diagonals", () => {
    const d = cube();
    markEdges(d, 36);
    let n = 0;
    for (let t = 0; t < 12; t++) for (let j = 0; j < 3; j++) if (feature(d, t, j)) n++;
    // Each of the 12 edges is a side of two triangles; the 6 diagonals are none.
    expect(n).toBe(24);
    // Each corner's code names its own corner.
    for (let v = 0; v < 36; v++) expect((d[v * MESH_STRIDE + EDGE_AT] - 1) % 3).toBe(v % 3);
  });

  it('leaves a smooth surface without lines and unlit triangles without code', () => {
    const d = cube();
    // All six faces given one shared normal per corner position: as a smooth blob would be lit.
    for (let v = 0; v < 36; v++) {
      const p = v * MESH_STRIDE;
      const l = Math.hypot(d[p] - 0.5, d[p + 1] - 0.5, d[p + 2] - 0.5);
      d.set([(d[p] - 0.5) / l, (d[p + 1] - 0.5) / l, (d[p + 2] - 0.5) / l], p + 7);
    }
    d.fill(0, 7, 10);
    d.fill(0, MESH_STRIDE + 7, MESH_STRIDE + 10);
    d.fill(0, 2 * MESH_STRIDE + 7, 2 * MESH_STRIDE + 10);
    markEdges(d, 36);
    for (let v = 0; v < 3; v++) expect(d[v * MESH_STRIDE + EDGE_AT]).toBe(0);
    let n = 0;
    for (let t = 1; t < 12; t++) for (let j = 0; j < 3; j++) if (feature(d, t, j)) n++;
    // Only the sides that border the unlit triangle (which counts as no neighbour) stay features.
    expect(n).toBeLessThanOrEqual(3);
  });

  it('marks the edges of a tank in a few milliseconds', () => {
    const t = CATALOG['leopard-2a4m-can'].build();
    const t0 = performance.now();
    const m = meshOf(t);
    const ms = performance.now() - t0;
    let coded = 0;
    for (let v = 0; v < m.count; v++) if (m.data[v * MESH_STRIDE + EDGE_AT] > 0) coded++;
    expect(coded).toBeGreaterThan(m.count * 0.3);
    expect(ms).toBeLessThan(100);
  });
});
