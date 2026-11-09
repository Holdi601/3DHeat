/**
 * Figures behind a see-through structure: the shells are drawn after the
 * figures (seen through them like the ground behind), and the structures'
 * depth seal last, never before anything it would hide.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (f: string) => readFileSync(resolve(__dirname, f), 'utf8').replace(/\r\n/g, '\n');
const after = (src: string, first: string, then: string) => {
  const a = src.indexOf(first), b = src.indexOf(then);
  expect(a).toBeGreaterThan(-1);
  expect(b).toBeGreaterThan(a);
};

describe('see-through structures over the figures', () => {
  it('WebGL2: the ground first, the figures, then the shells, then the seal', () => {
    const gl = source('webgl2/renderer.ts');
    const scene = gl.slice(gl.indexOf('  private drawScene('), gl.indexOf('\n  }\n', gl.indexOf('  private drawScene(')));
    after(scene, 'this.drawLevel(params, params.level, false)', 'this.figures.draw(');
    after(scene, 'this.figures.draw(', 'this.drawLevel(params, params.level, true)');
    after(scene, 'this.drawLevel(params, params.level, true)', 'this.symbols.draw(');
    after(scene, 'this.drawLevel(params, params.level, true)', 'this.sealStructureDepth(params)');
  });

  it('WebGPU: the same, the seal last in the scene pass', () => {
    const gpu = source('webgpu/renderer.ts');
    const scene = gpu.slice(gpu.indexOf('  private drawScene('), gpu.indexOf('\n  }\n', gpu.indexOf('  private drawScene(')));
    after(scene, 'this.drawLevel(pass, params.level, mapOffset, slots, false)', 'this.figures.draw(');
    after(scene, 'this.tracks.draw(', 'this.drawLevel(pass, model, mapOffset, slots, true)');
    after(scene, 'this.drawLevel(pass, model, mapOffset, slots, true)', 'this.symbols.draw(');
    after(scene, 'pass.draw(params.overlayVertCount)', 'this.sealStructures(pass, slots)');
    const level = gpu.slice(gpu.indexOf('  private drawLevel('), gpu.indexOf('\n  }\n', gpu.indexOf('  private drawLevel(')));
    expect(level).not.toContain('structDepthPipeline');
  });
});
