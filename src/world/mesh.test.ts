import { describe, expect, it } from 'vitest';
import type { AxisMapping } from '../state/types';
import { clipLine, clipRing, extrudeBuilding, handedness, MeshBuilder } from './mesh';
import { TerrainGrid, gridFor } from './backdrop';

/** One terrain pixel is one metre, east along x and north against y (pixels count south). */
const flatProject = (px: number, py: number): [number, number] => [px, -py];

const ACMI_AXES: AxisMapping = { up: 'z', flipX: false, flipY: true, flipZ: false, scale: 1 };

describe('buildings', () => {
  // A 10 x 20 m footprint, clockwise on screen as vector tiles draw outer rings.
  const ring = [0, 0, 10, 0, 10, 20, 0, 20];

  it('extrudes walls round the footprint and a roof on top', () => {
    const mb = new MeshBuilder(flatProject);
    extrudeBuilding(mb, [{ ring, cut: new Uint8Array(4) }], 100, 0, 12, [1, 1, 1]);
    const m = mb.finish(ACMI_AXES);
    // Four walls of two triangles, and a roof of two.
    expect(m.structureIndices.length / 3).toBe(10);
    // Top, bottom and corner edge per wall.
    expect(m.structureEdges.length / 2).toBe(12);
    expect(m.bounds.minY).toBe(100);
    expect(m.bounds.maxY).toBe(112);
    // World x east, z south (north flipped), as the data is.
    expect(m.bounds.minX).toBe(0);
    expect(m.bounds.maxX).toBe(10);
    expect(m.bounds.minZ).toBe(0);
    expect(m.bounds.maxZ).toBe(20);
  });

  it('faces every wall out and the roof up', () => {
    const mb = new MeshBuilder(flatProject);
    extrudeBuilding(mb, [{ ring, cut: new Uint8Array(4) }], 0, 0, 10, [1, 1, 1]);
    const m = mb.finish(ACMI_AXES);
    const v = m.vertices;
    const cx = 5;
    const cz = 10;
    for (let t = 0; t < m.structureIndices.length; t += 3) {
      const a = m.structureIndices[t] * 6;
      const b = m.structureIndices[t + 1] * 6;
      const c = m.structureIndices[t + 2] * 6;
      // The face normal from the winding, in the world.
      const ux = v[b] - v[a];
      const uy = v[b + 1] - v[a + 1];
      const uz = v[b + 2] - v[a + 2];
      const wx = v[c] - v[a];
      const wy = v[c + 1] - v[a + 1];
      const wz = v[c + 2] - v[a + 2];
      const nx = uy * wz - uz * wy;
      const ny = uz * wx - ux * wz;
      const nz = ux * wy - uy * wx;
      const mx = (v[a] + v[b] + v[c]) / 3 - cx;
      const mz = (v[a + 2] + v[b + 2] + v[c + 2]) / 3 - cz;
      if (Math.abs(ny) > 1e-6) expect(ny).toBeGreaterThan(0);
      else expect(nx * mx + nz * mz).toBeGreaterThan(0);
      // The stored vertex normal agrees with the face.
      expect(v[a + 3] * nx + v[a + 4] * ny + v[a + 5] * nz).toBeGreaterThan(0);
    }
  });

  it('starts at the minimum height and grows no wall along a tile seam', () => {
    const clipped = clipRing(ring, -5, -5, 15, 12);
    // The cut edge is the one along y = 12.
    expect(Array.from(clipped.cut).filter(Boolean)).toHaveLength(1);
    const mb = new MeshBuilder(flatProject);
    extrudeBuilding(mb, [clipped], 50, 20, 30, [1, 1, 1]);
    const m = mb.finish(ACMI_AXES);
    expect(m.bounds.minY).toBe(70);
    expect(m.bounds.maxY).toBe(80);
    // Three walls (six triangles) and a roof (two).
    expect(m.structureIndices.length / 3).toBe(8);
  });

  it('keeps the outside out when the axis mapping mirrors the world', () => {
    expect(handedness(ACMI_AXES)).toBe(1);
    expect(handedness({ up: 'z', flipX: false, flipY: false, flipZ: false, scale: 1 })).toBe(-1);
    const mb = new MeshBuilder(flatProject);
    extrudeBuilding(mb, [{ ring, cut: new Uint8Array(4) }], 0, 0, 10, [1, 1, 1]);
    const m = mb.finish({ up: 'z', flipX: false, flipY: false, flipZ: false, scale: 1 });
    // The roof's normals still point up the world's Y.
    let up = 0;
    for (let i = 0; i < m.vertices.length; i += 6) if (m.vertices[i + 1] === 10) up += m.vertices[i + 4] > 0.99 ? 1 : 0;
    expect(up).toBe(4);
  });
});

describe('clipping', () => {
  it('cuts a line to a rectangle, in pieces', () => {
    const pieces = clipLine([-5, 5, 5, 5, 5, 15, 15, 15, 15, 5, 25, 5], 0, 0, 20, 10);
    expect(pieces).toEqual([
      [0, 5, 5, 5, 5, 10],
      [15, 10, 15, 5, 20, 5],
    ]);
  });
});

describe('terrain grid', () => {
  it('reads heights on the same triangles the mesh draws', () => {
    // 2 x 2 vertices: a single cell with one corner raised.
    const g = new TerrainGrid(0, 0, 2, 2, 10, 10, new Float32Array([0, 0, 0, 10]));
    expect(g.at(0, 0)).toBe(0);
    expect(g.at(10, 10)).toBeCloseTo(10, 3);
    // On the diagonal, halfway: half the raised corner.
    expect(g.at(5, 5)).toBe(5);
    // Above the diagonal, the triangle (00, 10, 11).
    expect(g.at(10, 0)).toBe(0);
    expect(g.at(10, 5)).toBeCloseTo(5, 3);
    // Below it, the triangle (00, 11, 01).
    expect(g.at(0, 10)).toBe(0);
    expect(g.at(5, 10)).toBeCloseTo(5, 3);
  });

  it('thins a grid to fit its vertex cap', () => {
    const g = gridFor(4096, 2048, 100_000);
    expect(g.cols * g.rows).toBeLessThanOrEqual(100_000);
    expect(g.dx * (g.cols - 1)).toBeCloseTo(4096, 6);
    expect(g.dy * (g.rows - 1)).toBeCloseTo(2048, 6);
  });
});
