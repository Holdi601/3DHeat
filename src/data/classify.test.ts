import { describe, expect, it } from 'vitest';
import { buildWireframe, classifyParts, splitByClass } from './classify';
import type { MeshBounds, MeshPart, RawMesh } from './modelParse';

function bounds(
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
): MeshBounds {
  return { minX, minY, minZ, maxX, maxY, maxZ };
}

function part(p: Partial<MeshPart> & { name: string }): MeshPart {
  return {
    name: p.name,
    start: p.start ?? 0,
    count: p.count ?? 3,
    upFacing: p.upFacing ?? 0.5,
    bounds: p.bounds ?? bounds(0, 0, 0, 10, 10, 10),
  };
}

function mesh(parts: MeshPart[], levelBounds = bounds(0, 0, 0, 1000, 100, 1000)): RawMesh {
  const indexCount = parts.reduce((n, p) => Math.max(n, p.start + p.count), 0);
  return {
    vertices: new Float32Array(6),
    indices: new Uint32Array(indexCount),
    triangles: indexCount / 3,
    bounds: levelBounds,
    parts,
  };
}

describe('classifyParts — by name', () => {
  it('recognises terrain names as ground', () => {
    for (const name of ['Terrain', 'terrain_01', 'Landscape', 'ground_mesh', 'Floor_A', 'heightmap']) {
      const r = classifyParts(mesh([part({ name }), part({ name: 'House_1', start: 3 })]));
      expect(r.classes[0], name).toBe('ground');
    }
  });

  it('recognises building and prop names as structures', () => {
    for (const name of ['House_03', 'building_a', 'Wall_North', 'crate_small', 'Tree_02', 'Bridge']) {
      const r = classifyParts(mesh([part({ name: 'Terrain' }), part({ name, start: 3 })]));
      expect(r.classes[1], name).toBe('structure');
    }
  });

  it('reports why each decision was made', () => {
    const r = classifyParts(mesh([part({ name: 'Terrain' }), part({ name: 'House', start: 3 })]));
    expect(r.reasons[0]).toMatch(/name matches/);
    expect(r.reasons[1]).toMatch(/name matches/);
  });

  it('separates water from ground rather than lumping the two', () => {
    // Water used to fall into the ground name list, which meant a lake was
    // shaded like terrain: slope darkening with nothing to darken, and contour
    // lines across a surface that is level by definition.
    for (const name of ['water:L_Example', 'Water_Plane', 'ocean', 'River_North', 'lake_02']) {
      const r = classifyParts(mesh([part({ name }), part({ name: 'House_1', start: 3 })]));
      expect(r.classes[0], name).toBe('water');
    }
  });

  it('does not read a seawall or a waterfront building as water', () => {
    for (const name of ['Seawall_01', 'Watertower_A', 'House_Riverside']) {
      const r = classifyParts(mesh([part({ name: 'Terrain' }), part({ name, start: 3 })]));
      expect(r.classes[1], name).not.toBe('water');
    }
  });
});

describe('classifyParts — labelled by the exporter', () => {
  it('takes an explicit ground or structure prefix at its word', () => {
    const r = classifyParts(
      mesh([part({ name: 'ground:L_Example' }), part({ name: 'structure:L_Example', start: 3 })]),
    );
    expect(r.classes).toEqual(['ground', 'structure']);
    expect(r.reasons[0]).toMatch(/exporter/);
  });

  it('beats a name that would otherwise say the opposite', () => {
    // The engine knows a landscape from a building; the word "Rock" in a part
    // the exporter called ground must not overturn that.
    const r = classifyParts(
      mesh([
        part({ name: 'ground:Rock_Terrain_Quarry' }),
        part({ name: 'structure:Landscape_Props', start: 3 }),
      ]),
    );
    expect(r.classes).toEqual(['ground', 'structure']);
  });

  it('beats geometry that would otherwise say the opposite', () => {
    // A wall-like part — tall, narrow, barely up-facing — labelled ground.
    const r = classifyParts(
      mesh([
        part({
          name: 'ground:Deck',
          upFacing: 0.05,
          bounds: bounds(0, 0, 0, 5, 90, 5),
        }),
        part({ name: 'structure:Hut', start: 3 }),
      ]),
    );
    expect(r.classes[0]).toBe('ground');
  });

  it('leaves unlabelled parts to the heuristics', () => {
    const r = classifyParts(
      mesh([part({ name: 'ground:Terrain' }), part({ name: 'House_03', start: 3 })]),
    );
    expect(r.reasons[0]).toMatch(/exporter/);
    expect(r.reasons[1]).toMatch(/name matches/);
  });
});

describe('classifyParts — by geometry', () => {
  it('treats a large flat mostly-up part as ground', () => {
    const r = classifyParts(
      mesh([
        part({
          name: 'mesh_1',
          upFacing: 0.95,
          bounds: bounds(0, 0, 0, 900, 5, 900),
        }),
        part({ name: 'mesh_2', start: 3, upFacing: 0.2, bounds: bounds(10, 0, 10, 30, 40, 30) }),
      ]),
    );
    expect(r.classes[0]).toBe('ground');
    expect(r.reasons[0]).toMatch(/covers/);
  });

  it('treats a small tall part with vertical faces as a structure', () => {
    const r = classifyParts(
      mesh([
        part({ name: 'terrain' }),
        part({
          name: 'mesh_9',
          start: 3,
          upFacing: 0.2,
          bounds: bounds(10, 0, 10, 30, 40, 30),
        }),
      ]),
    );
    expect(r.classes[1]).toBe('structure');
    expect(r.reasons[1]).toMatch(/up-facing/);
  });

  it('defaults an ambiguous part to ground rather than making it invisible', () => {
    // A near-invisible wireframe default would look like a rendering failure.
    const r = classifyParts(
      mesh([
        part({ name: 'terrain' }),
        part({
          name: 'mesh_x',
          start: 3,
          upFacing: 0.55,
          bounds: bounds(0, 0, 0, 120, 5, 120),
        }),
      ]),
    );
    expect(r.classes[1]).toBe('ground');
    expect(r.reasons[1]).toMatch(/ambiguous/);
  });

  it('treats a lone unnamed mesh as ground even when it looks structural', () => {
    const r = classifyParts(
      mesh([part({ name: 'mesh_0', upFacing: 0.1, bounds: bounds(0, 0, 0, 20, 90, 20) })]),
    );
    expect(r.classes[0]).toBe('ground');
    expect(r.reasons[0]).toMatch(/single unnamed mesh/);
    expect(r.structureTriangles).toBe(0);
  });

  it('counts triangles into the right bucket', () => {
    const r = classifyParts(
      mesh([
        part({ name: 'Terrain', start: 0, count: 30 }),
        part({ name: 'House', start: 30, count: 12 }),
      ]),
    );
    expect(r.groundTriangles).toBe(10);
    expect(r.structureTriangles).toBe(4);
  });
});

describe('splitByClass', () => {
  it('gathers each class into its own index buffer', () => {
    const m = mesh([
      part({ name: 'Terrain', start: 0, count: 6 }),
      part({ name: 'House', start: 6, count: 3 }),
      part({ name: 'Landscape', start: 9, count: 3 }),
    ]);
    m.indices = new Uint32Array([0, 1, 2, 3, 4, 5, 10, 11, 12, 20, 21, 22]);
    const split = splitByClass(m, ['ground', 'structure', 'ground']);
    expect(Array.from(split.groundIndices)).toEqual([0, 1, 2, 3, 4, 5, 20, 21, 22]);
    expect(Array.from(split.structureIndices)).toEqual([10, 11, 12]);
  });

  it('keeps a navigation mesh out of the drawn ground', () => {
    // Draped over the terrain and coplanar with it: drawn as ground, the two
    // fought for every pixel of the playable area.
    const m = mesh([
      part({ name: 'ground:terrain', start: 0, count: 3, upFacing: 1 }),
      part({ name: 'nav:walkable', start: 3, count: 3, upFacing: 1, bounds: bounds(0, 0, 0, 1000, 1, 1000) }),
    ]);
    m.indices = new Uint32Array([0, 1, 2, 3, 4, 5]);
    const c = classifyParts(m);
    expect(c.classes).toEqual(['ground', 'ground']);
    const split = splitByClass(m, c.classes);
    expect(Array.from(split.groundIndices)).toEqual([0, 1, 2]);
    expect(Array.from(split.navIndices)).toEqual([3, 4, 5]);
  });

  it('handles everything being one class', () => {
    const m = mesh([part({ name: 'Terrain', start: 0, count: 3 })]);
    m.indices = new Uint32Array([7, 8, 9]);
    const split = splitByClass(m, ['ground']);
    expect(Array.from(split.groundIndices)).toEqual([7, 8, 9]);
    expect(split.structureIndices.length).toBe(0);
  });
});

describe('buildWireframe', () => {
  it('emits three edges for a lone triangle', () => {
    const e = buildWireframe(new Uint32Array([0, 1, 2]));
    expect(e.length).toBe(6);
    const pairs = new Set<string>();
    for (let i = 0; i < e.length; i += 2) {
      pairs.add([e[i], e[i + 1]].sort((a, b) => a - b).join('-'));
    }
    expect(pairs).toEqual(new Set(['0-1', '1-2', '0-2']));
  });

  it('emits a shared edge only once', () => {
    // Two triangles of a quad share the 1-2 diagonal: 5 edges, not 6.
    const e = buildWireframe(new Uint32Array([0, 1, 2, 1, 3, 2]));
    expect(e.length / 2).toBe(5);
  });

  it('is direction-insensitive when deduplicating', () => {
    // The same edge traversed both ways must collapse to one line.
    const e = buildWireframe(new Uint32Array([0, 1, 2, 2, 1, 0]));
    expect(e.length / 2).toBe(3);
  });

  it('handles an empty input', () => {
    expect(buildWireframe(new Uint32Array(0)).length).toBe(0);
  });

  it('scales without collisions on large index values', () => {
    // The pair-packing key must stay exact well beyond any decimated mesh.
    const a = 1_000_000;
    const b = 2_000_000;
    const e = buildWireframe(new Uint32Array([a, b, a + 1, a, b, a + 1]));
    expect(e.length / 2).toBe(3);
  });

  it('preserves every vertex index it was given', () => {
    // The sort-based dedupe decodes indices back out of a packed key, so a
    // mistake in the arithmetic would silently move edges to other vertices
    // rather than fail — a wireframe of the wrong shape, on the right mesh.
    const idx = new Uint32Array([7, 900_001, 3, 900_001, 12, 7]);
    const e = buildWireframe(idx);
    const seen = new Set(Array.from(e));
    for (const v of idx) expect(seen.has(v)).toBe(true);
  });

  it('handles more edges than a Set can hold', () => {
    // The failure this was rewritten for. V8 caps a Set at 2^24 entries, so the
    // previous implementation threw "Set maximum size exceeded" on any structure
    // mesh past about 5.6M triangles — and the whole level then refused to load
    // rather than degrading. Reached with a level export of several hundred MB,
    // which is not a size anyone should have to reach to find a hard limit.
    //
    // A strip of triangles: 6M of them, 2 new edges each, so ~12M unique edges
    // and 18M before deduplication — comfortably past the old ceiling.
    const triangles = 6_000_000;
    const idx = new Uint32Array(triangles * 3);
    for (let t = 0; t < triangles; t++) {
      idx[t * 3] = t;
      idx[t * 3 + 1] = t + 1;
      idx[t * 3 + 2] = t + 2;
    }
    const e = buildWireframe(idx);
    // Each new triangle adds two edges and reuses one from its predecessor.
    expect(e.length / 2).toBe(triangles * 2 + 1);
  }, 60_000);
});
