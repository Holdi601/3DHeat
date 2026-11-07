import { describe, expect, it } from 'vitest';
import { floatKeyToSortableUint, MAX_SORTABLE_ROWS, radixSortIndices } from './sort';
import { lowerBound, upperBound } from '../render/sampling';

describe('floatKeyToSortableUint', () => {
  it('preserves float ordering as unsigned integer ordering', () => {
    const values = [-Infinity, -1e30, -1, -1e-30, -0, 0, 1e-30, 1, 1e30, Infinity];
    const f = new Float32Array(1);
    const u = new Uint32Array(f.buffer);
    const keys = values.map((v) => {
      f[0] = v;
      return floatKeyToSortableUint(u[0]) >>> 0;
    });
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i] >= keys[i - 1], `${values[i - 1]} -> ${values[i]}`).toBe(true);
    }
  });
});

describe('radixSortIndices', () => {
  const check = (values: number[]) => {
    const a = new Float32Array(values);
    const order = radixSortIndices(a);
    expect(order.length).toBe(a.length);
    const sorted = Array.from(order, (i) => a[i]);
    const expected = [...a].sort((x, y) => x - y);
    expect(sorted).toEqual(expected);
    return order;
  };

  it('sorts already-sorted, reversed and random input', () => {
    check([1, 2, 3, 4, 5]);
    check([5, 4, 3, 2, 1]);
    check([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
  });

  it('sorts negatives and mixed signs', () => {
    check([-3, 5, -1, 0, 2, -7, 4]);
  });

  it('is stable for equal keys', () => {
    // Stability keeps rows with identical timestamps in file order, which is
    // what makes a reload reproduce the same picture.
    const a = new Float32Array([7, 7, 7, 7, 7]);
    expect(Array.from(radixSortIndices(a))).toEqual([0, 1, 2, 3, 4]);
  });

  it('sorts a large random array correctly', () => {
    const n = 200_000;
    const a = new Float32Array(n);
    let seed = 12345;
    for (let i = 0; i < n; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      a[i] = (seed / 0x7fffffff) * 2000 - 1000;
    }
    const order = radixSortIndices(a);
    for (let i = 1; i < n; i++) {
      expect(a[order[i]] >= a[order[i - 1]]).toBe(true);
    }
  });

  it('sorts only the given subset, and in order', () => {
    const a = new Float32Array([50, 10, 40, 20, 30]);
    const subset = new Uint32Array([4, 1, 2]); // values 30, 10, 40
    const order = radixSortIndices(a, subset);
    expect(Array.from(order)).toEqual([1, 4, 2]);
    expect(Array.from(order, (i) => a[i])).toEqual([10, 30, 40]);
  });

  it('refuses a size that would be pathological in a browser tab', () => {
    // Guard rather than allocate 20GB and die: the message points at the CLI.
    const fake = { length: MAX_SORTABLE_ROWS + 1, buffer: new ArrayBuffer(8), byteOffset: 0 };
    expect(() => radixSortIndices(fake as unknown as Float32Array)).toThrow(/unmap the time column/);
  });
});

describe('binary search over a time column', () => {
  const t = new Float32Array([0, 1, 1, 1, 2, 5, 5, 9]);

  it('lowerBound finds the first index >= t', () => {
    expect(lowerBound(t, -1)).toBe(0);
    expect(lowerBound(t, 0)).toBe(0);
    expect(lowerBound(t, 1)).toBe(1);
    expect(lowerBound(t, 1.5)).toBe(4);
    expect(lowerBound(t, 5)).toBe(5);
    expect(lowerBound(t, 10)).toBe(8);
  });

  it('upperBound finds the first index > t', () => {
    expect(upperBound(t, -1)).toBe(0);
    expect(upperBound(t, 0)).toBe(1);
    expect(upperBound(t, 1)).toBe(4);
    expect(upperBound(t, 5)).toBe(7);
    expect(upperBound(t, 9)).toBe(8);
    expect(upperBound(t, 100)).toBe(8);
  });

  it('brackets a window exactly, including all duplicates', () => {
    // The window [1, 5] must include every row at 1 and every row at 5.
    const lo = lowerBound(t, 1);
    const hi = upperBound(t, 5);
    expect(Array.from(t.slice(lo, hi))).toEqual([1, 1, 1, 2, 5, 5]);
  });
});
