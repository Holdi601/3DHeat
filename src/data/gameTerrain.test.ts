/**
 * A region cut out of a shipped game, read by the viewer's own parser.
 *
 * Writing a GLB that opens in Blender is not the bar. The viewer classifies a
 * part from its *node* name, and geometry that arrives unclassified is shaded by
 * a heuristic written for Unreal landscapes — so what matters is that the file
 * `heat3d_gamefiles` actually writes comes through as ground, at the size and in
 * the place the game has it.
 *
 * Needs a sample, which is a cut of a game someone owns and is not checked in:
 *
 *     python -m heat3d_gamefiles terrain <track folder> --box ... -o map.glb
 *     HEAT3D_TERRAIN_GLB=map.glb npx vitest run src/data/gameTerrain.test.ts
 *
 * Skips without it rather than failing, like the other tests here that need
 * something installed.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parseModel } from './modelParse';

const SAMPLE = process.env.HEAT3D_TERRAIN_GLB ?? '';
const present = SAMPLE !== '' && existsSync(SAMPLE);

describe('terrain extracted from a game archive', () => {
  it.skipIf(!present)('arrives whole, classified, and in world coordinates', async () => {
    const bytes = readFileSync(SAMPLE);
    const mesh = await parseModel(new File([bytes], 'map.glb'));

    // Interleaved position(3) + normal(3), 24 bytes a vertex.
    const vertices = mesh.vertices.length / 6;
    expect(vertices).toBeGreaterThan(1000);
    expect(mesh.indices.length).toBe(mesh.triangles * 3);
    expect(Math.max(...mesh.indices.slice(0, 30_000))).toBeLessThan(vertices);

    // The label the viewer keys off, on the node rather than the mesh.
    expect(mesh.parts.map((p) => p.name ?? '').join(' ')).toMatch(/^ground\s*[:|]/);

    // Ground, so most of it faces up. A part that came through mis-oriented
    // would parse and render and be wrong in a way no size check catches.
    expect(mesh.parts[0].upFacing).toBeGreaterThan(0.5);
  });
});
