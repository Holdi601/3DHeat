import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MESH_FS, MESH_VS, PEEL_FS, PEEL_VS } from './webgl2/shaders';
import { MESH_WGSL, PEEL_WGSL } from './webgpu/shaders';

/**
 * A repeating texture is wrapped into its atlas tile by the shaders, per pixel
 * (see `planTiling`). Three things have to hold in both backends, colour and
 * depth passes alike, or the repeat shows: the wrap itself, a mip level taken
 * from the unwrapped UV - the wrapped one jumps a whole tile at every seam -
 * and the tile reaching the fragment unchanged across the triangle.
 */
describe('repeating textures in the level shaders', () => {
  const source = (file: string) => readFileSync(resolve(__dirname, file), 'utf8').replace(/\r\n/g, '\n');

  it('wraps a tiled UV into its rectangle with the unwrapped gradients in WebGL2', () => {
    for (const [name, fs] of [
      ['MESH_FS', MESH_FS],
      ['PEEL_FS', PEEL_FS],
    ]) {
      const fn = fs.slice(fs.indexOf('vec4 sampleAtlas('), fs.indexOf('void main()'));
      expect(fn, name).toContain('vec2 dx = dFdx(uv);');
      expect(fn, name).toContain('fract(uv)');
      expect(fn, name).toContain('textureGrad(atlas, tile.xy + local * size, dx * size, dy * size)');
      // Derivatives before the branch, which is not uniform across a level.
      expect(fn.indexOf('dFdx(uv)'), name).toBeLessThan(fn.indexOf('if (tile.z == 0.0)'));
      // Interpolated, not flat: flat cost a city level nearly all of its
      // frame rate under ANGLE on Direct3D (see TILE_VS).
      expect(fs, name).toContain('in vec4 vTile;');
      expect(fs, name).not.toContain('flat in vec4 vTile;');
    }
    for (const [name, vs] of [
      ['MESH_VS', MESH_VS],
      ['PEEL_VS', PEEL_VS],
    ]) {
      expect(vs, name).toContain('out vec4 vTile;');
      expect(vs, name).not.toContain('flat out vec4 vTile;');
      expect(vs, name).toContain('vTile = tileRect(aTile);');
      expect(vs, name).toContain('texelFetch(uTiles');
    }
  });

  it('wraps a tiled UV into its rectangle with the unwrapped gradients in WebGPU', () => {
    for (const [name, wgsl] of [
      ['MESH_WGSL', MESH_WGSL],
      ['PEEL_WGSL', PEEL_WGSL],
    ]) {
      const fn = wgsl.slice(wgsl.indexOf('fn sampleAtlas('));
      expect(fn, name).toContain('let dx = dpdx(uv);');
      expect(fn, name).toContain('fract(uv)');
      expect(fn, name).toContain('textureSampleGrad(atlas, atlasSampler, tile.xy + local * size, dx * size, dy * size)');
      expect(fn.indexOf('dpdx(uv)'), name).toBeLessThan(fn.indexOf('if (tile.z == 0.0)'));
      expect(wgsl, name).toContain('@interpolate(flat) tile : vec4<f32>');
      expect(wgsl, name).toContain('tile : u32');
      // The implicit-derivative read is gone: it would take its mip from the
      // wrapped coordinate.
      expect(wgsl, name).not.toContain('textureSample(atlas');
    }
    expect(MESH_FS).not.toContain('texture(uAtlas');
    expect(PEEL_FS).not.toContain('texture(uAtlas');
  });

  it('backs the WebGL2 tile attribute and table in every pass that reads them', () => {
    const src = source('webgl2/renderer.ts');
    // A float a vertex, exact for any 16-bit tile number.
    expect(src).toContain('gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 4, 0);');
    expect(src).not.toContain('gl.UNSIGNED_SHORT, false, 2, 0');
    // A float texture with linear filtering is incomplete and reads as black.
    const table = src.slice(src.indexOf('  private makeTileTable('), src.indexOf('  private bindAtlas('));
    expect(table).toContain('gl.RGBA32F');
    expect(table).toContain('gl.TEXTURE_MIN_FILTER, gl.NEAREST');
    // Every mesh and peel pass binds the atlas through bindAtlas, which binds
    // the table too and pins the attribute at 0 when the level has no tiles.
    const bind = src.slice(src.indexOf('  private bindAtlas('), src.indexOf('  private blankTile'));
    expect(bind).toContain("u.i1('uTiles', TILE_UNIT);");
    expect(bind).toContain('if (!this.tileVbo) gl.vertexAttrib1f(4, 0);');
  });

  it('backs the WebGPU tile attribute and table in every pass that reads them', () => {
    const src = source('webgpu/renderer.ts');
    expect(src).toContain("attributes: [{ shaderLocation: 4, offset: 0, format: 'uint32' }]");
    expect(src).toContain("attributes: [{ shaderLocation: 2, offset: 0, format: 'uint32' }]");
    expect(src).toContain('{ binding: 2, resource: { buffer: tiles } }');
    // Wherever the UVs are bound for the mesh pipelines, the tiles are bound beside them.
    const uvBinds = src.match(/pass\.setVertexBuffer\(2, this\.meshUvBuffer\);\n\s*pass\.setVertexBuffer\(3, this\.meshTileBuffer\);/g) ?? [];
    expect(uvBinds.length).toBe((src.match(/pass\.setVertexBuffer\(2, this\.meshUvBuffer\);/g) ?? []).length);
    expect(src).toContain('pass.setVertexBuffer(2, this.meshTileBuffer);');
  });
});
