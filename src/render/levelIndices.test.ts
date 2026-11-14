import { describe, expect, it } from 'vitest';
import { IndexUpload, onlyIndicesChanged } from './levelIndices';
import type { Level } from './level';

const model = (): Level =>
  ({
    kind: 'model',
    name: 'm',
    vertices: new Float32Array(6),
    indices: new Uint32Array(3),
    structureIndices: new Uint32Array(0),
    structureEdges: new Uint32Array(0),
  }) as unknown as Level;

describe('level index swap', () => {
  it('knows a new simplification from a new level', () => {
    const a = model();
    expect(onlyIndicesChanged(a, { ...a, indices: new Uint32Array(3) } as Level)).toBe(true);
    expect(onlyIndicesChanged(a, { ...a, opacity: 0.5 } as Level)).toBe(false);
    expect(onlyIndicesChanged(a, { ...a, vertices: new Float32Array(6), indices: new Uint32Array(3) } as Level)).toBe(false);
    expect(onlyIndicesChanged(null, a)).toBe(false);
  });

  it('writes every set in slices of the budget, none for an empty set', () => {
    const sets = [Uint32Array.from({ length: 10 }, (_, i) => i), new Uint32Array(0), Uint32Array.from([7, 8, 9])];
    const out = new Map<number, number[]>();
    const up = new IndexUpload(sets, (n) => {
      const id = out.size;
      out.set(id, new Array<number>(n).fill(-1));
      return id;
    });
    expect(up.buffers).toEqual([0, null, 1]);
    const write = (b: number, at: number, d: Uint32Array) => {
      expect(d.length).toBeLessThanOrEqual(4);
      out.get(b)!.splice(at, d.length, ...d);
    };
    let steps = 0;
    while (!up.step(write, 4)) steps++;
    expect(steps).toBe(3);
    expect(out.get(0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(out.get(1)).toEqual([7, 8, 9]);
  });
});
