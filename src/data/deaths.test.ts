import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { deadAt, deadInSpan, deathsOf, lastDeadSpan, packDeadSpan } from './deaths';

interface Row {
  p: number;
  t: number;
  event?: string;
  alive?: number;
  health?: number;
}

function dataset(rows: Row[], persons: number): Dataset {
  rows = [...rows].sort((a, b) => a.t - b.t);
  const n = rows.length;
  const labels = [...new Set(rows.map((r) => r.event ?? 'position'))];
  const attrs: AttributeColumn[] = [
    { name: 'event', kind: 'category', data: Uint32Array.from(rows, (r) => labels.indexOf(r.event ?? 'position')), min: 0, max: labels.length - 1, categories: labels },
  ];
  if (rows.some((r) => r.alive !== undefined)) attrs.push({ name: 'alive', kind: 'number', data: Float32Array.from(rows, (r) => r.alive ?? NaN), min: 0, max: 1 });
  if (rows.some((r) => r.health !== undefined)) attrs.push({ name: 'health', kind: 'number', data: Float32Array.from(rows, (r) => r.health ?? NaN), min: 0, max: 100 });
  return {
    id: 'deaths',
    name: 'deaths',
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
    attrs,
  } as unknown as Dataset;
}

describe('deaths', () => {
  it('reads a wreck from the alive column until its rows end', () => {
    const rows: Row[] = [];
    for (let t = 0; t <= 20; t++) rows.push({ p: 0, t, alive: t < 8 ? 1 : 0 });
    // A death row at the same moment as an alive sample does not end the death.
    rows.push({ p: 0, t: 8, event: 'death' });
    for (let t = 0; t <= 20; t++) rows.push({ p: 1, t, alive: 1 });
    const e = deathsOf(dataset(rows, 2));
    expect(deadAt(e, 0, 7.5)).toBe(false);
    expect(deadAt(e, 0, 8)).toBe(true);
    expect(deadAt(e, 0, 30)).toBe(true);
    expect(deadAt(e, 1, 15)).toBe(false);
    expect(lastDeadSpan(e, 0)).toEqual([8, Infinity]);
    expect(lastDeadSpan(e, 1)).toBeNull();
  });

  it('takes death events, ended by a respawn or a healthy sample', () => {
    const rows: Row[] = [
      { p: 0, t: 0, health: 100 },
      { p: 0, t: 5, event: 'death' },
      { p: 0, t: 5.05, health: 100 },
      { p: 0, t: 6, health: 0 },
      { p: 0, t: 12, health: 100 },
      { p: 1, t: 0 },
      { p: 1, t: 3, event: 'Destroyed' },
      { p: 1, t: 9, event: 'respawn' },
      { p: 1, t: 10 },
    ];
    const e = deathsOf(dataset(rows, 2));
    expect(deadAt(e, 0, 5.04)).toBe(true);
    expect(deadAt(e, 0, 11)).toBe(true);
    expect(deadAt(e, 0, 12)).toBe(false);
    expect(deadAt(e, 1, 4)).toBe(true);
    expect(deadAt(e, 1, 9.5)).toBe(false);
  });

  it('packs a span as fractions of the keys the shaders compare', () => {
    const p = packDeadSpan(30, Infinity, 10, 50);
    expect(deadInSpan(p, 0.49)).toBe(false);
    expect(deadInSpan(p, 0.5)).toBe(true);
    expect(deadInSpan(p, 1.5)).toBe(true);
    const q = packDeadSpan(20, 40, 10, 50);
    expect(deadInSpan(q, 0.3)).toBe(true);
    expect(deadInSpan(q, 0.8)).toBe(false);
    // A death after the last key: from the last key on (while it is held).
    expect(deadInSpan(packDeadSpan(70, Infinity, 10, 50), 0.99)).toBe(false);
    expect(deadInSpan(packDeadSpan(70, Infinity, 10, 50), 1)).toBe(true);
    expect(packDeadSpan(Infinity, Infinity, 0, 1)).toBe(0);
  });
});
