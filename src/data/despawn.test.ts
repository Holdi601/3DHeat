import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { endsOf, holdFor, MAX_HOLD, MIN_HOLD } from './despawn';
import { CUBE_STRIDE, TrackCursor } from './tracks';

interface Row {
  p: number;
  t: number;
  event?: string;
}

function dataset(rows: Row[], persons: number): Dataset {
  rows = [...rows].sort((a, b) => a.t - b.t);
  const n = rows.length;
  const labels = [...new Set(rows.map((r) => r.event ?? 'position'))];
  const ev: AttributeColumn = {
    name: 'event',
    kind: 'category',
    data: Uint32Array.from(rows, (r) => labels.indexOf(r.event ?? 'position')),
    min: 0,
    max: labels.length - 1,
    categories: labels,
  } as AttributeColumn;
  return {
    id: 'despawn',
    name: 'despawn',
    count: n,
    px: Float32Array.from(rows, (r) => r.p * 10),
    py: new Float32Array(n),
    pz: new Float32Array(n),
    time: Float32Array.from(rows, (r) => r.t),
    personId: Uint32Array.from(rows, (r) => r.p),
    personLabels: Array.from({ length: persons }, (_, i) => `P${i}`),
    personShared: null,
    sessionId: null,
    lifetime: null,
    yaw: null,
    pitch: null,
    timeSorted: true,
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 100, maxY: 1, maxZ: 1 },
    timeRange: [rows[0].t, rows[n - 1].t],
    attrs: [ev],
  } as unknown as Dataset;
}

const track = (p: number, from: number, to: number, dt: number, last?: string): Row[] => {
  const out: Row[] = [];
  for (let t = from; t <= to + 1e-9; t += dt) out.push({ p, t });
  if (last) out[out.length - 1].event = last;
  return out;
};

describe('things leave when their data does', () => {
  it('holds a few of its own sample intervals, within bounds', () => {
    expect(holdFor(0.1)).toBeCloseTo(0.3);
    expect(holdFor(0.01)).toBe(MIN_HOLD);
    expect(holdFor(5)).toBe(MAX_HOLD);
    expect(holdFor(NaN)).toBe(MAX_HOLD);
  });

  it('works the hold out per thing, and ends a removed one at once', () => {
    const d = dataset([...track(0, 0, 10, 0.1), ...track(1, 0, 10, 1), ...track(2, 0, 5, 0.1, 'removed')], 3);
    const e = endsOf(d);
    expect(e.explicit).toBe(true);
    expect(e.hold[0]).toBe(Infinity);
    expect(e.hold[2]).toBe(0);
    expect(e.end[2]).toBeCloseTo(5);
    const plain = endsOf(dataset([...track(0, 0, 10, 0.1), ...track(1, 0, 10, 1)], 2));
    expect(plain.explicit).toBe(false);
    expect(plain.hold[0]).toBeCloseTo(0.3, 2);
    expect(plain.hold[1]).toBe(MAX_HOLD);
  });

  const shownAt = (d: Dataset) => {
    const cursor = new TrackCursor(d);
    return (t: number) => {
      cursor.update(t);
      const c = cursor.buildCubes(t, true, 10, () => true, endsOf(d));
      const xs: number[] = [];
      for (let i = 0; i < c.count; i++) xs.push(Math.round(c.data[i * CUBE_STRIDE] / 10));
      return xs.sort();
    };
  };

  it('ends a unit at its end row, and keeps one without until the next row however long', () => {
    const shown = shownAt(dataset([...track(0, 0, 10, 0.1), ...track(1, 0, 20, 0.1), ...track(2, 0, 5, 0.1, 'removed')], 3));
    expect(shown(5.0)).toEqual([0, 1, 2]);
    expect(shown(5.1)).toEqual([0, 1]);
    expect(shown(10.5)).toEqual([0, 1]);
    expect(shown(19)).toEqual([0, 1]);
  });

  it('drops a unit shortly after its last sample where the data does not say when things end', () => {
    const shown = shownAt(dataset([...track(0, 0, 10, 0.1), ...track(1, 0, 20, 0.1)], 2));
    expect(shown(10.2)).toEqual([0, 1]);
    expect(shown(10.5)).toEqual([1]);
  });
});
