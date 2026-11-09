import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MESH_FS, MESH_VS, PEEL_FS, PEEL_VS } from './webgl2/shaders';
import { MESH_WGSL, PEEL_WGSL } from './webgpu/shaders';

/**
 * The level shaders drop a cut-out texel - one the atlas holds at alpha 0 -
 * and only on a textured fragment. Opaque images are 255 throughout the atlas
 * (see settleAlpha), so for them the test never fires and the colour, divided
 * by an alpha of 1, is what it was.
 */
describe('alpha cut-out in the level shaders', () => {
  it('discards a textured WebGL2 fragment below half alpha, after the read', () => {
    const read = MESH_FS.indexOf('vec4 sampled = sampleAtlas(uAtlas, vUv, vTile);');
    const test = MESH_FS.indexOf('if (sampled.a < 0.5) discard;');
    expect(read).toBeGreaterThan(0);
    expect(test).toBeGreaterThan(read);
    // Inside the textured branch, not for every fragment.
    expect(MESH_FS.slice(MESH_FS.lastIndexOf('if (uTexture > 0.0 && textured)', test), test)).not.toContain('}');
  });

  it('discards a textured WebGPU fragment below half alpha, after the read', () => {
    const read = MESH_WGSL.indexOf('let sampled = sampleAtlas(in.uv, in.tile);');
    const test = MESH_WGSL.indexOf('if (sampled.a < 0.5) { discard; }');
    expect(read).toBeGreaterThan(0);
    expect(test).toBeGreaterThan(read);
    expect(MESH_WGSL.slice(MESH_WGSL.lastIndexOf('if (u.cullCfg.w > 0.5 && textured)', test), test)).not.toContain('}');
  });
});

/** One method of a renderer, from its signature to its closing brace. */
function method(file: string, name: string): string {
  const src = readFileSync(resolve(__dirname, file), 'utf8').replace(/\r\n/g, '\n');
  const start = src.indexOf(`  private ${name}(`);
  expect(start, `${file}: ${name}`).toBeGreaterThan(0);
  return src.slice(start, src.indexOf('\n  }\n', start));
}

/**
 * The depth the heat is occluded by has to match the picture. A leaf card whose
 * corners the colour pass drops, written whole into the structure depth or a
 * peeled layer, hides the heat behind foliage that is plainly not there.
 */
describe('alpha cut-out in the depth-only passes', () => {
  it('peels past a cut-out texel in WebGL2, reading the atlas before either discard', () => {
    const main = PEEL_FS.slice(PEEL_FS.indexOf('void main()'));
    const read = main.indexOf('sampleAtlas(uAtlas, vUv, vTile)');
    expect(read).toBeGreaterThan(0);
    expect(main.indexOf(') discard;')).toBeGreaterThan(read);
    // Only for a textured vertex - tiled, or with a UV that is not -1 - and
    // only with the atlas in use.
    expect(main).toContain('if (uTexture > 0.0 && (vTile.z != 0.0 || vUv.x >= 0.0) && alpha < 0.5) discard;');
  });

  it('takes the WebGL2 peel UV and tile from the attributes the mesh VAO backs', () => {
    expect(PEEL_VS).toContain('layout(location = 3) in vec2 aUv;');
    expect(MESH_VS).toContain('layout(location = 3) in vec2 aUv;');
    expect(PEEL_VS).toContain('layout(location = 4) in float aTile;');
    expect(MESH_VS).toContain('layout(location = 4) in float aTile;');
    expect(PEEL_VS).toContain('vUv = aUv;');
    expect(PEEL_VS).toContain('vTile = tileRect(aTile);');
  });

  it('peels past a cut-out texel in WebGPU, sampling before either discard', () => {
    const fs = PEEL_WGSL.slice(PEEL_WGSL.indexOf('fn fsPeel'));
    const read = fs.indexOf('sampleAtlas(in.uv, in.tile)');
    expect(read).toBeGreaterThan(0);
    expect(fs.indexOf('{ discard; }')).toBeGreaterThan(read);
    expect(fs).toContain('if (u.cfg.w > 0.5 && (in.tile.z != 0.0 || in.uv.x >= 0.0) && alpha < 0.5) { discard; }');
    expect(PEEL_WGSL).toContain('@location(1) uv : vec2<f32>');
    expect(PEEL_WGSL).toContain('@location(2) tile : u32');
  });

  it('declares the WebGPU peel atlas exactly as the mesh shader does', () => {
    // One bind group shape, so the renderer's atlas bind group serves both.
    for (const line of [
      '@group(1) @binding(0) var atlas : texture_2d<f32>;',
      '@group(1) @binding(1) var atlasSampler : sampler;',
      '@group(1) @binding(2) var<storage, read> tiles : array<vec4<f32>>;',
    ]) {
      expect(PEEL_WGSL).toContain(line);
      expect(MESH_WGSL).toContain(line);
    }
  });

  it('binds the atlas in every WebGL2 depth-only pass, whatever the structures look like', () => {
    const file = 'webgl2/renderer.ts';
    // On whenever the mesh's texture has arrived (the level's atlas, a world
    // tile's image): bindAtlas itself falls back to the opaque blank texture and
    // uTexture 0 without one.
    expect(method(file, 'bindAtlas')).toContain('const use = on && mesh.texture !== null;');
    for (const [name, call] of [
      ['sealStructureDepth', 'this.bindAtlas(u, m, true, 2);'],
      ['renderStructureDepth', 'this.bindAtlas(u, m, true, 2);'],
      // Unit 1 in the peel, whose unit 0 holds the previous layer.
      ['peelDepthLayers', 'this.bindAtlas(u, m, true, 2, 1);'],
    ]) {
      const body = method(file, name);
      expect(body, name).toContain(call);
      // Not tied to the textured look: foliage never occludes heat, shell included.
      expect(body, name).not.toContain('structure.textured');
    }
    expect(readFileSync(resolve(__dirname, file), 'utf8')).toContain("this.makeProg(PEEL_VS, PEEL_FS, 'peel')");
  });

  it('binds the atlas and the UVs in every WebGPU depth-only pass, whatever the structures look like', () => {
    const file = 'webgpu/renderer.ts';
    const src = readFileSync(resolve(__dirname, file), 'utf8').replace(/\r\n/g, '\n');
    // The structure seal and the structure-depth target run fsMesh, colour masked.
    expect(src).toContain("this.buildMeshPipeline('triangle-list', true, false)");
    // The seal has uniform slots of its own, with texture mode 2 for a mesh
    // whose texture has arrived and 0 for one without - rather than the
    // structures' colour slot, whose mode is 0 in the shell look.
    const sealSlot = method(file, 'pushSealUniform');
    expect(sealSlot).toMatch(/model\.structure\.flat,\s*false,\s*textured \? 2 : false,\s*\)/);
    expect(sealSlot).not.toContain('structure.textured');
    expect(method(file, 'pushMeshUniforms')).toContain(
      'const seal = pair((textured) => this.pushSealUniform(params, model, textured));',
    );
    // pushSceneUniform takes the mode as given; the callers pass it only for a
    // mesh whose texture is there.
    expect(method(file, 'pushSceneUniform')).toContain('u[47] = texture ? (texture === 2 ? 2 : 1) : 0;');
    // The seal, last in the scene pass (after the figures, which it would otherwise hide).
    const level = method(file, 'sealStructures');
    expect(method(file, 'drawScene')).toContain('if (model && slots) this.sealStructures(pass, slots);');
    expect(level).toContain(
      "this.sceneBindGroup(this.structDepthPipeline, 'structdepth', slots.seal[m.texture !== null ? 1 : 0])",
    );
    expect(level).toContain('this.atlasBindGroup(this.structDepthPipeline, m)');
    const structDepth = method(file, 'renderStructureDepth');
    expect(structDepth).toContain('this.pushSealUniform(params, model, textured)');
    expect(structDepth).toContain("offsets[m.texture !== null ? 1 : 0]");
    expect(structDepth).not.toContain('structure.textured');
    expect(structDepth).toContain('this.atlasBindGroup(this.structDepthPipeline, m)');
    expect(structDepth).toContain('this.setMeshBuffers(pass, m)');
    const buffers = method(file, 'setMeshBuffers');
    expect(buffers).toContain('pass.setVertexBuffer(2, m.uvBuffer)');
    expect(buffers).toContain('pass.setVertexBuffer(3, m.tileBuffer)');
    const peel = method(file, 'peelDepthLayers');
    expect(peel).toContain('this.atlasBindGroup(this.peelPipeline, m)');
    expect(peel).toContain('pass.setVertexBuffer(1, m.uvBuffer)');
    expect(peel).toContain('pass.setVertexBuffer(2, m.tileBuffer)');
    expect(peel).toContain('offsets[m.texture !== null ? 1 : 0]');
    expect(method(file, 'buildPeelPipeline')).toContain("{ shaderLocation: 1, offset: 0, format: 'float32x2' }");
    expect(method(file, 'buildPeelPipeline')).toContain("{ shaderLocation: 2, offset: 0, format: 'uint32' }");
    const peelUniform = method(file, 'pushPeelUniform');
    expect(peelUniform).toContain('u[19] = textured ? 1 : 0;');
    expect(peelUniform).not.toContain('structure.textured');
  });

  it('leaves the colour passes on the textured look alone', () => {
    // The shell look still draws a leaf card whole; only its depth is cut.
    expect(MESH_FS).toContain('if (uTexture > 0.0 && textured) {');
    expect(MESH_WGSL).toContain('if (u.cullCfg.w > 0.5 && textured) {');
    const gl = readFileSync(resolve(__dirname, 'webgl2/renderer.ts'), 'utf8');
    expect(gl).toContain('this.bindAtlas(u, m, s.textured, 2);');
    const gpu = readFileSync(resolve(__dirname, 'webgpu/renderer.ts'), 'utf8').replace(/\r\n/g, '\n');
    expect(gpu).toContain('this.sceneBindGroup(pipeline, key, slots.struct[m.texture !== null ? 1 : 0])');
    expect(gpu).toContain("if (solid) this.drawStructureFaces(pass, level, slots, this.meshPipeline, 'struct-solid');");
    expect(gpu).toContain("if (!solid) this.drawStructureFaces(pass, level, slots, this.structPipeline, 'struct');");
    expect(gpu).toContain('s.textured && textured ? 2 : false,');
  });
});
