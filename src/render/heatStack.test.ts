import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import type { DrawnRows } from './pick';
import {
  buildHeatField,
  drawnRadius,
  fieldCellAt,
  heatStackAlongRay,
  pickHeatLabels,
  relativeHeat,
  spriteRamp,
  visibleCells,
  visibleSpread,
  type SpriteKernel,
} from './heatStack';
import { readingSignature } from './heatField';

function dataset(points: Array<[number, number, number]>, teams?: number[]): Dataset {
  const n = points.length;
  return {
    id: 'd',
    name: 'd',
    count: n,
    px: Float32Array.from(points.map((p) => p[0])),
    py: Float32Array.from(points.map((p) => p[1])),
    pz: Float32Array.from(points.map((p) => p[2])),
    time: Float32Array.from(points.map((_, i) => i)),
    epochMs: null,
    lifetime: null,
    maxLifetimeGap: 0,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: null,
    teamId: teams ? Uint16Array.from(teams) : null,
    personLabels: [],
    teamLabels: teams ? ['A', 'B'] : [],
    sessionId: null,
    sessionLabels: [],
    sessionRows: null,
    sessionStart: null,
    sessionEnd: null,
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    attrs: [],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 100, maxY: 10, maxZ: 100 },
    timeRange: [0, n],
    timeSorted: true,
  } as unknown as Dataset;
}

function drawn(n: number, p: Partial<DrawnRows> = {}): DrawnRows {
  return {
    rowLo: 0,
    rowHi: n,
    filters: [],
    teamSign: null,
    useSign: false,
    splitMode: 0,
    splitColumn: null,
    splitSign: null,
    splitPositive: [0, 0],
    splitNegative: [0, 0],
    lifetime: null,
    cull: null,
    slice: null,
    groundY: null,
    ...p,
  };
}

const kernel: SpriteKernel = { radius: 2, minPx: 0, maxPx: 0, zoomInvariant: true, center: 1, edge: 0, falloff: 1, smooth: false, curve: null };

/** Runs a sliced generator to its end. */
function run<T>(g: Generator<unknown, T, void>): T {
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}

describe('spriteRamp', () => {
  it('is the centre intensity at the centre, the edge at the rim and nothing outside', () => {
    expect(spriteRamp(0, kernel)).toBe(1);
    expect(spriteRamp(0.5, kernel)).toBeCloseTo(0.5);
    expect(spriteRamp(1, kernel)).toBe(0);
    expect(spriteRamp(1.01, kernel)).toBe(0);
  });

  it('keeps the heat of the true size when a clamp grows the sprite', () => {
    const k = { ...kernel, minPx: 4 };
    // One pixel is a whole unit: the 2-unit sprite is drawn 4 units wide, each pixel a quarter as hot.
    const r = drawnRadius(k, 1);
    expect(r.radius).toBe(4);
    expect(r.scale).toBeCloseTo(0.25);
    expect(drawnRadius({ ...k, zoomInvariant: false }, 1).scale).toBe(1);
  });
});

describe('heatStackAlongRay', () => {
  it('finds the rows whose sprites cover the ray, strongest first, and sums them', () => {
    // A vertical ray down through x = 10, z = 10: two rows on it, one a unit off, one far away.
    const ds = dataset([
      [10, 0, 10],
      [11, 0, 10],
      [10, 5, 10],
      [50, 0, 50],
    ]);
    const ray = { origin: { x: 10, y: 100, z: 10 }, dir: { x: 0, y: -1, z: 0 } };
    const s = run(heatStackAlongRay(ds, drawn(4), ray, () => 0.01, kernel, null));
    expect(s.count).toBe(3);
    expect(Array.from(s.rows).slice(0, 2).sort()).toEqual([0, 2]);
    expect(s.rows[2]).toBe(1);
    expect(s.total).toBeCloseTo(1 + 1 + 0.5);
    expect(s.truncated).toBe(false);
  });

  it('reads the side of each row in a difference', () => {
    const ds = dataset(
      [
        [0, 0, 0],
        [0, 1, 0],
        [0, 2, 0],
      ],
      [0, 1, 1],
    );
    const ray = { origin: { x: 0, y: 100, z: 0 }, dir: { x: 0, y: -1, z: 0 } };
    const s = run(heatStackAlongRay(ds, drawn(3, { useSign: true, teamSign: Int8Array.from([1, -1]) }), ray, () => 0.01, kernel, null));
    expect(s.positive).toBeCloseTo(1);
    expect(s.negative).toBeCloseTo(-2);
    expect(s.total).toBeCloseTo(-1);
  });

  it('weighs rows by the value column', () => {
    const ds = dataset([[0, 0, 0]]);
    const ray = { origin: { x: 0, y: 10, z: 0 }, dir: { x: 0, y: -1, z: 0 } };
    const s = run(heatStackAlongRay(ds, drawn(1), ray, () => 0.01, kernel, { data: [3], scale: 2 }));
    expect(s.total).toBeCloseTo(6);
  });
});

describe('the heat field', () => {
  // A hot spot of 20 rows at (10, 10), a warm one of 5 at (60, 60), single rows elsewhere.
  const points: Array<[number, number, number]> = [];
  for (let i = 0; i < 20; i++) points.push([10 + (i % 3) * 0.3, 0, 10 + (i % 2) * 0.3]);
  for (let i = 0; i < 5; i++) points.push([60, 0, 60]);
  for (let i = 0; i < 10; i++) points.push([i * 9 + 1, 0, 90]);
  const ds = dataset(points);
  const field = run(buildHeatField(ds, drawn(points.length), 4, null));
  // A top-down view of the 100 x 100 square onto a 100 x 100 pixel canvas.
  const project = (x: number, _y: number, z: number) => ({ x, y: z });

  it('bins rows into places and finds the place under a point', () => {
    expect(field.rows).toBe(points.length);
    const c = fieldCellAt(field, 10.1, 0, 10.1);
    expect(c).toBeGreaterThanOrEqual(0);
    expect(field.value[c]).toBe(20);
    expect(fieldCellAt(field, 30, 0, 30)).toBe(-1);
  });

  it('places the hottest spot at the top of the view and a lone row near the bottom', () => {
    const cells = visibleCells(field, project, 100, 100);
    const spread = visibleSpread(field, cells);
    const hot = relativeHeat(20, spread)!;
    expect(hot.percentile).toBeGreaterThan(0.9);
    expect(hot.ofPeak).toBe(1);
    expect(hot.ofMedian).toBe(20);
    const lone = relativeHeat(1, spread)!;
    expect(lone.percentile).toBeLessThan(0.5);
    // Nothing on screen: nothing to compare with.
    expect(visibleCells(field, () => null, 100, 100).length).toBe(0);
  });

  it('labels the hottest places, apart from each other', () => {
    const cells = visibleCells(field, project, 100, 100);
    const labels = pickHeatLabels(field, cells, 2);
    expect(labels.map((l) => l.value)).toEqual([20, 5]);
    expect(labels[0].rank).toBe(1);
    expect(labels[0].x).toBeCloseTo(10.3, 0);
  });

  it('labels the most negative places of a signed field too', () => {
    const d2 = dataset(
      [
        [0, 0, 0],
        [0, 0, 0],
        [50, 0, 50],
        [50, 0, 50],
        [50, 0, 50],
      ],
      [0, 0, 1, 1, 1],
    );
    const f = run(buildHeatField(d2, drawn(5, { useSign: true, teamSign: Int8Array.from([1, -1]) }), 4, null));
    expect(f.signed).toBe(true);
    const labels = pickHeatLabels(f, visibleCells(f, project, 100, 100), 3);
    expect(labels.find((l) => l.side === 1)?.value).toBe(2);
    expect(labels.find((l) => l.side === -1)?.value).toBe(-3);
  });

  it('keeps each group share in team heat', () => {
    const d2 = dataset(
      [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      [0, 1, 1, 1],
    );
    const f = run(buildHeatField(d2, drawn(4), 4, null, 2));
    const [l] = pickHeatLabels(f, visibleCells(f, project, 100, 100), 1);
    expect(l.group).toBe(1);
    expect(l.share).toBeCloseTo(0.75);
  });
});

describe('readingSignature', () => {
  it('changes with the rows drawn and not with nothing', () => {
    const ds = dataset([[0, 0, 0]]);
    const r = { dataset: ds, drawn: drawn(1), kernel, weight: null, mode: 'heat-simple' };
    expect(readingSignature(r)).toBe(readingSignature({ ...r, drawn: drawn(1) }));
    expect(readingSignature(r)).not.toBe(readingSignature({ ...r, drawn: drawn(1, { rowLo: 1 }) }));
    expect(readingSignature(r)).not.toBe(readingSignature({ ...r, kernel: { ...kernel, radius: 3 } }));
  });
});
