import { describe, expect, it } from 'vitest';
import { structureDraw, structuresTextured, type ModelLevel } from './level';

function level(over: Partial<ModelLevel>): ModelLevel {
  return {
    kind: 'model',
    name: 't',
    vertices: new Float32Array(4 * 6),
    indices: new Uint32Array([0, 1, 2]),
    structureIndices: new Uint32Array([1, 2, 3]),
    triangles: 1,
    sourceTriangles: 1,
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 1, maxY: 1, maxZ: 1 },
    opacity: 1,
    desaturate: 0,
    brightness: 1,
    wireframe: false,
    ...over,
  } as ModelLevel;
}

describe('structuresTextured', () => {
  it('is true when any structure vertex has a UV', () => {
    const uvs = new Float32Array([0.5, 0.5, -1, -1, -1, -1, 0.2, 0.3]);
    expect(structuresTextured(new Uint32Array([1, 2, 3]), uvs)).toBe(true);
  });

  it('is false when only the ground is textured', () => {
    // An extracted course exported without its placed models: textured ground,
    // and structures - if any - in flat colour, which want the shell.
    const uvs = new Float32Array([0.5, 0.5, -1, -1, -1, -1, -1, -1]);
    expect(structuresTextured(new Uint32Array([1, 2, 3]), uvs)).toBe(false);
  });

  it('is true for a tiled structure vertex, whose UV may be negative', () => {
    const uvs = new Float32Array([0.5, 0.5, -1, -1, -3, -2, -1, -1]);
    expect(structuresTextured(new Uint32Array([1, 2, 3]), uvs)).toBe(false);
    expect(structuresTextured(new Uint32Array([1, 2, 3]), uvs, new Uint16Array([0, 0, 4, 0]))).toBe(true);
  });

  it('is false with nothing to look at', () => {
    expect(structuresTextured(undefined, new Float32Array(8))).toBe(false);
    expect(structuresTextured(new Uint32Array([0]), null)).toBe(false);
  });
});

describe('structureDraw', () => {
  const uvs = new Float32Array(8);
  const atlas = new Blob([new Uint8Array(4)]);

  it('draws textured structures only when asked and when there is an atlas', () => {
    expect(structureDraw(level({ structureTexture: true, uvs, atlas })).textured).toBe(true);
    expect(structureDraw(level({ structureTexture: true, uvs, atlas: null })).textured).toBe(false);
    expect(structureDraw(level({ structureTexture: true, uvs: null, atlas })).textured).toBe(false);
  });

  it('keeps the shell for a level saved before textured structures existed', () => {
    expect(structureDraw(level({ uvs, atlas })).textured).toBe(false);
  });
});
