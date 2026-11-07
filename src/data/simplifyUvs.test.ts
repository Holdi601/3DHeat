import { describe, expect, it } from 'vitest';
import { compactGeometry, keepUvSeams } from './simplify';

describe('compactGeometry with UVs', () => {
  it('moves each vertex UV along with the vertex', () => {
    // Four vertices, the first unused: after compaction the rest shift down one
    // and their UVs have to shift with them.
    const vertices = new Float32Array(4 * 6);
    for (let v = 0; v < 4; v++) vertices[v * 6] = v;
    const uvs = new Float32Array([9, 9, 0.1, 0.2, 0.3, 0.4, -1, -1]);
    const out = compactGeometry(vertices, new Uint32Array([1, 2, 3]), null, uvs);
    expect(Array.from(out.indices)).toEqual([0, 1, 2]);
    expect(out.uvs).not.toBeNull();
    expect(Array.from(out.uvs!)).toEqual([0.1, 0.2, 0.3, 0.4, -1, -1].map(Math.fround));
    expect(out.vertices[0]).toBe(1);
  });

  it('returns no UVs for a level without them', () => {
    const out = compactGeometry(new Float32Array(3 * 6), new Uint32Array([0, 1, 2]));
    expect(out.uvs).toBeNull();
    expect(out.uvTiles).toBeNull();
  });

  it('moves each vertex tile along with its UV', () => {
    const uvs = new Float32Array([9, 9, 0, 0, 4, 0, 0, 3]);
    const tiles = new Uint16Array([7, 1, 1, 0]);
    const out = compactGeometry(new Float32Array(4 * 6), new Uint32Array([1, 2, 3]), null, uvs, tiles);
    expect(Array.from(out.uvTiles!)).toEqual([1, 1, 0]);
  });
});

describe('keepUvSeams', () => {
  it('unwelds two copies of a corner that address different images', () => {
    // Vertex 1 was welded onto vertex 0 by position; their UVs differ (two
    // terrain tiles meeting), so the weld must be undone. Vertex 3 onto 2 has
    // the same UV and stays welded.
    const remap = new Uint32Array([0, 0, 2, 2]);
    const uvs = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.5, 0.5, 0.5, 0.5]);
    expect(Array.from(keepUvSeams(remap, uvs))).toEqual([0, 1, 2, 2]);
  });

  it('unwelds two images with the same tiled UV', () => {
    // A repeating texture keeps its own UVs, so a wall and the trim along its
    // top can both have a corner at (2, 0); only the tile tells them apart.
    const remap = new Uint32Array([0, 0, 2, 2]);
    const uvs = new Float32Array([2, 0, 2, 0, 1, 1, 1, 1]);
    expect(Array.from(keepUvSeams(remap, uvs, new Uint16Array([1, 2, 3, 3])))).toEqual([0, 1, 2, 2]);
  });

  it('changes nothing for a level without UVs', () => {
    const remap = new Uint32Array([0, 0, 1]);
    expect(keepUvSeams(remap, null)).toBe(remap);
  });
});
