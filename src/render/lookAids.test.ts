import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { cameraGlyph, cameraTracks, fovAt, verticalFov, viewCone, type LookFrame } from './lookAids';

const f: LookFrame = { o: [0, 0, 0], fwd: [1, 0, 0], up: [0, 1, 0], right: [0, 0, 1] };

describe('where people look', () => {
  it('draws a view cone as wide as its field of view', () => {
    const c = viewCone(f, 90, 1, 10);
    // Four edges, the far rim, the line of sight; a rim halfway.
    expect(c.edges.length).toBe(9);
    expect(c.mid.length).toBe(4);
    const far = c.edges.map(([, b]) => b).filter((p) => Math.abs(p[0] - 10) < 1e-9);
    // 90 degrees across: the far corners 10 to either side.
    expect(Math.max(...far.map((p) => p[2]))).toBeCloseTo(10);
    expect(Math.min(...far.map((p) => p[2]))).toBeCloseTo(-10);
    expect(viewCone(f, 0, 1, 10).edges).toEqual([[[0, 0, 0], [10, 0, 0]]]);
    expect(verticalFov(90, 16 / 9)).toBeCloseTo(58.7, 1);
  });

  it('draws a camera with its frustum', () => {
    const g = cameraGlyph(f, 60, 16 / 9, 1, 20);
    expect(g.length).toBeGreaterThan(30);
    // Nothing reaches past the frustum's far end and its up mark.
    expect(Math.max(...g.flat().map((p) => p[0]))).toBeCloseTo(20);
  });

  it('finds a recorded camera by its kind or name, and its field of view', () => {
    const cat = (name: string, values: string[]): AttributeColumn => {
      const labels = [...new Set(values)];
      return { name, kind: 'category', data: Uint32Array.from(values.map((v) => labels.indexOf(v))), min: 0, max: 1, categories: labels } as AttributeColumn;
    };
    const d = {
      count: 3,
      personId: Uint32Array.from([0, 1, 2]),
      personLabels: ['tank', 'me camera #ca', 'plane'],
      attrs: [cat('kind', ['tank', 'camera', 'aircraft'])],
    } as unknown as Dataset;
    const c = cameraTracks(d);
    expect(c.any).toBe(true);
    expect([...c.persons]).toEqual([0, 1, 0]);
    const fov = { name: 'fov', kind: 'number', data: Float32Array.from([75, 1.2, NaN]) } as AttributeColumn;
    expect(fovAt(fov, 0)).toBe(75);
    expect(fovAt(fov, 1)).toBeCloseTo(68.75, 1);
    expect(fovAt(fov, 2)).toBeNaN();
  });
});
