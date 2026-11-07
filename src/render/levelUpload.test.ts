import { describe, expect, it } from 'vitest';
import { sameLevelUpload, type Level } from './level';

const model = (): Level =>
  ({
    kind: 'model',
    name: 'm',
    vertices: new Float32Array(6),
    indices: new Uint32Array(3),
    structureIndices: new Uint32Array(0),
    structureEdges: new Uint32Array(0),
  }) as unknown as Level;

describe('sameLevelUpload', () => {
  it('does not upload again for a setting', () => {
    const a = model();
    expect(sameLevelUpload(a, { ...a, structureOpacity: 0.5 } as Level)).toBe(true);
  });
  it('uploads when the geometry changes', () => {
    const a = model();
    expect(sameLevelUpload(a, { ...a, vertices: new Float32Array(6) } as Level)).toBe(false);
    expect(sameLevelUpload(a, model())).toBe(false);
    expect(sameLevelUpload(a, null)).toBe(false);
    expect(sameLevelUpload(null, null)).toBe(true);
  });
});
