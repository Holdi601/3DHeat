import { describe, expect, it } from 'vitest';
import { buildRemap } from './simplify';

describe('buildRemap', () => {
  it('maps each old vertex to where compaction put it', () => {
    const before = new Uint32Array([5, 9, 5, 2]);
    const after = new Uint32Array([0, 1, 0, 2]);
    const map = buildRemap(before, after);
    expect(map[5]).toBe(0);
    expect(map[9]).toBe(1);
    expect(map[2]).toBe(2);
    expect(map[3]).toBe(-1);
  });

  it('holds more vertices than a Map can', () => {
    // 2^24 + 10 distinct vertices: a Map<number, number> throws "Map maximum
    // size exceeded" here, which is how a 15-million-triangle course failed.
    const n = (1 << 24) + 10;
    const before = new Uint32Array(n);
    for (let i = 0; i < n; i++) before[i] = i;
    const map = buildRemap(before, before);
    expect(map[n - 1]).toBe(n - 1);
  });
});
