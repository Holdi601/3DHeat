import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { burningAt, FireBody, firesOf } from './fires';
import { DEFAULT_PLACE, FireLayer, MAX_NEAR, type FirePose } from '../figures/fires';
import { VertexBuffer } from '../race/geometry';

interface Row {
  p: number;
  t: number;
  event?: string;
  id?: string;
  kind?: string;
  local?: [number, number, number];
}

function cat(name: string, rows: Row[], get: (r: Row) => string): AttributeColumn {
  const labels = [...new Set(rows.map(get))];
  return { name, kind: 'category', data: Uint32Array.from(rows, (r) => labels.indexOf(get(r))), min: 0, max: labels.length - 1, categories: labels };
}

function dataset(rows: Row[], persons: number): Dataset {
  rows = [...rows].sort((a, b) => a.t - b.t);
  const n = rows.length;
  const attrs: AttributeColumn[] = [
    cat('event', rows, (r) => r.event ?? 'position'),
    cat('fireId', rows, (r) => r.id ?? ''),
    cat('kind', rows, (r) => r.kind ?? 'tank'),
  ];
  ['fireLocalX', 'fireLocalY', 'fireLocalZ'].forEach((name, c) =>
    attrs.push({ name, kind: 'number', data: Float32Array.from(rows, (r) => (r.local ? r.local[c] : NaN)), min: -5, max: 5 }),
  );
  return {
    id: 'fires',
    name: 'fires',
    count: n,
    px: new Float32Array(n),
    py: new Float32Array(n),
    pz: new Float32Array(n),
    time: Float32Array.from(rows, (r) => r.t),
    personId: Uint32Array.from(rows, (r) => r.p),
    personLabels: Array.from({ length: persons }, (_, i) => `P${i}`),
    timeSorted: true,
    attrs,
  } as unknown as Dataset;
}

function track(p: number, t1: number): Row[] {
  return Array.from({ length: t1 + 1 }, (_, t) => ({ p, t }));
}

describe('fires', () => {
  it('pairs each fire_on with its fire_off by id, with its place and body', () => {
    const rows: Row[] = [
      ...track(0, 60),
      ...track(1, 60),
      { p: 0, t: 10, event: 'fire_on', id: '301:969', local: [0.5, 1.4, 1.7] },
      { p: 0, t: 12, event: 'fire_on', id: '200:858' },
      { p: 0, t: 15, event: 'fire_off', id: '200:858' },
      { p: 0, t: 20, event: 'fire_off', id: '301:969' },
      // Never put out: burns to its last row. A gun burst is not a fire.
      { p: 1, t: 30, event: 'fire_on', id: '1:2', kind: 'ship' },
      { p: 1, t: 31, event: 'fire_start' },
    ];
    const f = firesOf(dataset(rows, 2));
    expect(f.count).toBe(3);
    expect(Array.from(f.from)).toEqual([10, 12, 30]);
    expect(Array.from(f.to)).toEqual([20, 15, 60]);
    expect(Array.from(f.local.subarray(0, 3)).map((v) => Math.round(v * 10) / 10)).toEqual([0.5, 1.4, 1.7]);
    expect(Number.isNaN(f.local[3])).toBe(true);
    expect(f.body[2]).toBe(FireBody.Ship);
    expect(f.longest).toBe(30);
    const at = (t: number) => {
      const k: number[] = [];
      burningAt(f, t, 100, (i) => void k.push(i));
      return k.sort();
    };
    expect(at(9)).toEqual([]);
    expect(at(13)).toEqual([0, 1]);
    expect(at(16)).toEqual([0]);
    expect(at(25)).toEqual([]);
    expect(at(45)).toEqual([2]);
  });

  it('pairs oldest first where the data has no fire id', () => {
    const rows: Row[] = [...track(0, 30), { p: 0, t: 5, event: 'burning' }, { p: 0, t: 6, event: 'fire' }, { p: 0, t: 9, event: 'extinguished' }];
    const f = firesOf(dataset(rows, 1));
    expect(Array.from(f.to)).toEqual([9, 30]);
  });

  it('has none without fire rows', () => {
    expect(firesOf(dataset([...track(0, 5), { p: 0, t: 2, event: 'fire_start' }], 1)).count).toBe(0);
  });
});

describe('fire layer', () => {
  const pose = (x: number) => (_p: number, _b: number, out: FirePose) => {
    out.x = x;
    out.y = 0;
    out.z = 0;
    // Facing +z, upright: right is f x u = -x.
    out.f[0] = 0;
    out.f[1] = 0;
    out.f[2] = 1;
    out.u[0] = 0;
    out.u[1] = 1;
    out.u[2] = 0;
    return true;
  };

  it('draws a flame and smoke at the point on the unit up close, a glow far off', () => {
    const rows: Row[] = [...track(0, 30), { p: 0, t: 5, event: 'fire_on', id: 'a', local: [2, 1, 1] }];
    const f = firesOf(dataset(rows, 1));
    const layer = new FireLayer();
    const out = new VertexBuffer();
    const view = { t: 10, eye: [0, 5, -50], pixelSize: () => 0.01, units: 1, poseOf: pose(100) };
    expect(layer.build(f, view, out)).toBe(1);
    expect(layer.near).toBe(1);
    // The flame's foot is at the point: 2 forward (+z), 1 up, 1 right (-x).
    const d = out.data;
    const foot = [(d[0] + d[7]) / 2, d[1], (d[2] + d[9]) / 2];
    expect(foot[0]).toBeCloseTo(99, 3);
    expect(foot[1]).toBeCloseTo(1, 3);
    expect(foot[2]).toBeCloseTo(2, 3);
    const nearVerts = out.count;
    out.reset();
    // A pixel covers 10 m: a glow, a few pixels big.
    layer.build(f, { ...view, pixelSize: () => 10 }, out);
    expect(layer.far).toBe(1);
    expect(out.count).toBe(6);
    expect(nearVerts).toBeGreaterThan(6);
    out.reset();
    expect(layer.build(f, { ...view, t: 40 }, out)).toBe(0);
  });

  it('puts a fire with no place on a tank engine deck, and keeps to its budget', () => {
    const rows: Row[] = [...track(0, 30)];
    for (let i = 0; i < MAX_NEAR + 10; i++) rows.push({ p: 0, t: 5, event: 'fire_on', id: `f${i}` });
    const f = firesOf(dataset(rows, 1));
    const layer = new FireLayer();
    const out = new VertexBuffer();
    layer.build(f, { t: 10, eye: [0, 5, -50], pixelSize: () => 0.01, units: 1, poseOf: pose(0) }, out);
    expect(layer.near).toBe(MAX_NEAR);
    expect(layer.far).toBe(10);
    const [a, b] = DEFAULT_PLACE[FireBody.Ground];
    const foot = [(out.data[0] + out.data[7]) / 2, out.data[1], (out.data[2] + out.data[9]) / 2];
    expect(foot[1]).toBeCloseTo(b, 3);
    expect(foot[2]).toBeCloseTo(a, 3);
  });
});
