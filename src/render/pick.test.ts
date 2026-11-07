import { Matrix4, PerspectiveCamera } from 'three';
import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import { buildActiveFilters } from './filterTables';
import {
  buildSurfaceIndex,
  finish,
  nearestDrawnRow,
  partByBounds,
  partOfTriangle,
  projectPoint,
  rayTriangle,
  raycastSurface,
  rowDrawn,
  type DrawnRows,
  type Ray,
  type TriangleSet,
} from './pick';

describe('a ray against a triangle', () => {
  it('meets it from either side, and misses past its edges', () => {
    // The unit triangle in y = 0, ray straight down from y = 5.
    const tri = [0, 0, 0, 1, 0, 0, 0, 0, 1] as const;
    expect(rayTriangle(0.2, 5, 0.2, 0, -1, 0, ...tri)).toBeCloseTo(5);
    expect(rayTriangle(0.2, -5, 0.2, 0, 1, 0, ...tri)).toBeCloseTo(5);
    expect(rayTriangle(0.8, 5, 0.8, 0, -1, 0, ...tri)).toBe(-1);
    // Behind the origin does not count.
    expect(rayTriangle(0.2, 5, 0.2, 0, 1, 0, ...tri)).toBe(-1);
    // Parallel to the plane.
    expect(rayTriangle(0.2, 5, 0.2, 1, 0, 0, ...tri)).toBe(-1);
  });
});

/**
 * A level: a ground grid of `n` x `n` quads over [0, size]^2 at y = 0, and a
 * box standing on it from (40, 40) to (60, 60), 30 high, as structure.
 */
function level(n = 50, size = 100) {
  const v: number[] = [];
  const ground: number[] = [];
  const step = size / n;
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) v.push(i * step, 0, j * step, 0, 1, 0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i;
      ground.push(a, a + 1, a + n + 1, a + 1, a + n + 2, a + n + 1);
    }
  }
  const base = v.length / 6;
  // Box corners: bottom 0..3, top 4..7.
  for (const y of [0, 30]) for (const [x, z] of [[40, 40], [60, 40], [60, 60], [40, 60]]) v.push(x, y, z, 0, 1, 0);
  const quad = (a: number, b: number, c: number, d: number) => [a, b, c, a, c, d].map((k) => base + k);
  const structure = [
    ...quad(4, 5, 6, 7), // roof
    ...quad(0, 1, 5, 4), // z = 40 wall
    ...quad(1, 2, 6, 5), // x = 60 wall
    ...quad(2, 3, 7, 6), // z = 60 wall
    ...quad(3, 0, 4, 7), // x = 40 wall
  ];
  // A huge backdrop plane far below, larger than the grid: the big list.
  const back = v.length / 6;
  v.push(-1e4, -50, -1e4, 0, 1, 0, 1e4, -50, -1e4, 0, 1, 0, 0, -50, 1e4, 0, 1, 0);
  const sets: TriangleSet[] = [
    { name: 'ground', indices: new Uint32Array([...ground, back, back + 1, back + 2]) },
    { name: 'structure', indices: new Uint32Array(structure) },
    { name: 'water', indices: new Uint32Array(0) },
  ];
  return { vertices: new Float32Array(v), sets };
}

describe('the surface index', () => {
  const { vertices, sets } = level();
  const index = finish(buildSurfaceIndex(vertices, sets, 97));
  const down = (x: number, z: number): Ray => ({ origin: { x, y: 100, z }, dir: { x: 0, y: -1, z: 0 } });

  it('finds the ground, and the roof over it', () => {
    const g = raycastSurface(index, vertices, down(10, 10))!;
    expect(g.set).toBe(0);
    expect(g.point.y).toBeCloseTo(0);
    const r = raycastSurface(index, vertices, down(50, 50))!;
    expect(r.set).toBe(1);
    expect(r.point.y).toBeCloseTo(30);
  });

  it('meets the nearest wall along a slanted ray, not the ground behind it', () => {
    // From the west, slightly downwards, at the box's middle.
    const len = Math.hypot(1, -0.1);
    const hit = raycastSurface(index, vertices, { origin: { x: 0, y: 10, z: 50 }, dir: { x: 1 / len, y: -0.1 / len, z: 0 } })!;
    expect(hit.set).toBe(1);
    expect(hit.point.x).toBeCloseTo(40);
    expect(hit.point.y).toBeCloseTo(6);
  });

  it('agrees with testing every triangle, from any direction', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 300; k++) {
      const o = { x: rnd() * 140 - 20, y: rnd() * 60 + 1, z: rnd() * 140 - 20 };
      const d0 = { x: rnd() * 2 - 1, y: -rnd(), z: rnd() * 2 - 1 };
      const l = Math.hypot(d0.x, d0.y, d0.z);
      const ray = { origin: o, dir: { x: d0.x / l, y: d0.y / l, z: d0.z / l } };
      let best = Infinity;
      for (const set of sets) {
        for (let t = 0; t < set.indices.length; t += 3) {
          const [a, b, c] = [set.indices[t] * 6, set.indices[t + 1] * 6, set.indices[t + 2] * 6];
          const hit = rayTriangle(
            o.x, o.y, o.z, ray.dir.x, ray.dir.y, ray.dir.z,
            vertices[a], vertices[a + 1], vertices[a + 2],
            vertices[b], vertices[b + 1], vertices[b + 2],
            vertices[c], vertices[c + 1], vertices[c + 2],
          );
          if (hit > 0 && hit < best) best = hit;
        }
      }
      const got = raycastSurface(index, vertices, ray);
      if (best === Infinity) expect(got).toBeNull();
      else expect(got!.t).toBeCloseTo(best, 4);
    }
  });

  it('goes through what the view does not draw', () => {
    // A slice that leaves only what is below 20: the roof is not there.
    const hit = raycastSurface(index, vertices, down(50, 50), Infinity, (_x, y) => y < 20)!;
    expect(hit.set).toBe(0);
    expect(hit.point.y).toBeCloseTo(0);
  });

  it('names the part a triangle came from', () => {
    // Parts 0 and 2 are ground (10 and 5 triangles), part 1 is structure.
    const runs = new Uint32Array([0, 10, 2, 15]);
    expect(partOfTriangle(runs, 0)).toBe(0);
    expect(partOfTriangle(runs, 9)).toBe(0);
    expect(partOfTriangle(runs, 10)).toBe(2);
    expect(partOfTriangle(runs, 14)).toBe(2);
    expect(partOfTriangle(runs, 15)).toBe(-1);
    expect(partOfTriangle(null, 3)).toBe(-1);
    // From boxes: the smallest of the right class that holds the point.
    const bounds = new Float32Array([0, 0, 0, 100, 1, 100, 40, 0, 40, 60, 30, 60, 0, 0, 0, 100, 50, 100]);
    expect(partByBounds(bounds, ['ground', 'structure', 'structure'], 'structure', { x: 50, y: 30, z: 50 }, 0.1)).toBe(1);
    expect(partByBounds(bounds, ['ground', 'structure', 'structure'], 'structure', { x: 10, y: 30, z: 10 }, 0.1)).toBe(2);
    expect(partByBounds(bounds, ['ground', 'structure', 'structure'], 'water', { x: 10, y: 0, z: 10 }, 0.1)).toBe(-1);
  });
});

// ------------------------------------------------------------ data points

/** Rows on a line along +x at z = 0, y = 0, one per unit, time = x. */
function rows(n = 101): Dataset {
  const px = new Float32Array(n);
  const time = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    px[i] = i - 50;
    time[i] = i;
  }
  return {
    count: n,
    px,
    py: new Float32Array(n),
    pz: new Float32Array(n),
    time,
    timeSorted: true,
    lifetime: null,
    teamId: new Uint16Array(n).map((_, i) => i % 2),
    teamLabels: ['a', 'b'],
    personId: null,
    personLabels: [],
    attrs: [{ name: 'speed', kind: 'number', data: new Float32Array(n).map((_, i) => i), min: 0, max: n - 1 }],
  } as unknown as Dataset;
}

const everything = (ds: Dataset): DrawnRows => ({
  rowLo: 0,
  rowHi: ds.count,
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
});

/** A camera 100 above the origin looking straight down, on a 800 x 600 canvas. */
function view() {
  const cam = new PerspectiveCamera(60, 800 / 600, 0.5, 1000);
  cam.position.set(0, 100, 0);
  cam.lookAt(0, 0, 0);
  cam.updateMatrixWorld(true);
  const vp = new Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
  const screen = { viewProj: new Float32Array(vp.elements), width: 800, height: 600 };
  const m11 = cam.projectionMatrix.elements[5];
  const worldPerPixel = (t: number) => (2 * (t + 0.5)) / (m11 * 600);
  return { screen, worldPerPixel };
}

/** The ray through a canvas pixel, by unprojecting it. */
function rayAt(screen: { viewProj: Float32Array; width: number; height: number }, x: number, y: number): Ray {
  const inv = new Matrix4().fromArray(screen.viewProj).invert();
  const ndc = [(x / screen.width) * 2 - 1, 1 - (y / screen.height) * 2];
  const un = (z: number) => {
    const e = inv.elements;
    const [a, b] = ndc;
    const w = e[3] * a + e[7] * b + e[11] * z + e[15];
    return {
      x: (e[0] * a + e[4] * b + e[8] * z + e[12]) / w,
      y: (e[1] * a + e[5] * b + e[9] * z + e[13]) / w,
      z: (e[2] * a + e[6] * b + e[10] * z + e[14]) / w,
    };
  };
  const o = un(-1);
  const f = un(1);
  const l = Math.hypot(f.x - o.x, f.y - o.y, f.z - o.z);
  return { origin: o, dir: { x: (f.x - o.x) / l, y: (f.y - o.y) / l, z: (f.z - o.z) / l } };
}

describe('the drawn row under a click', () => {
  const ds = rows();
  const { screen, worldPerPixel } = view();
  const pick = (drawn: DrawnRows, x: number, y: number) =>
    finish(nearestDrawnRow(ds, drawn, screen, { x, y }, rayAt(screen, x, y), worldPerPixel, 8, 7));

  it('is the nearest on screen, within the radius', () => {
    const at = projectPoint(screen, 10, 0, 0)!;
    expect(pick(everything(ds), at.x + 2, at.y + 1)!.row).toBe(60);
    // Far from the line: nothing.
    expect(pick(everything(ds), at.x, at.y + 40)).toBeNull();
  });

  it('is only ever one that was drawn', () => {
    const at = projectPoint(screen, 10, 0, 0)!;
    // Outside the time window.
    expect(pick({ ...everything(ds), rowLo: 0, rowHi: 50 }, at.x, at.y)).toBeNull();
    // A filter keeps speed <= 59: the nearest that passes is the row before.
    const filters = buildActiveFilters(ds, [{ kind: 'range', column: 'speed', min: 0, max: 59 }]);
    const r = pick({ ...everything(ds), filters }, at.x, at.y);
    expect(r?.row).toBe(59);
    // Group b hidden: odd rows are not drawn.
    const hidden = { ...everything(ds), teamSign: new Int8Array([1, 0]), useSign: true };
    expect(rowDrawn(ds, 60, hidden)).toBe(true);
    expect(rowDrawn(ds, 61, hidden)).toBe(false);
    // Cut by the far bound.
    const cull = { near: 0, far: 100.2, planar: false, eye: { x: 0, y: 100, z: 0 }, forward: { x: 0, y: -1, z: 0 } };
    expect(rowDrawn(ds, 50, { ...everything(ds), cull })).toBe(true);
    expect(rowDrawn(ds, 70, { ...everything(ds), cull })).toBe(false);
    // Expired: lifetime 5, now 80, so rows before 75 are gone.
    const withLife = { ...ds, lifetime: new Float32Array(ds.count).fill(-1) } as Dataset;
    const life = { ...everything(ds), lifetime: { now: 80, defaultLifetime: 5 } };
    expect(rowDrawn(withLife, 76, life)).toBe(true);
    expect(rowDrawn(withLife, 70, life)).toBe(false);
  });

  it('is drawn on the ground when the heat is flattened onto it', () => {
    // Raise every row; flattened, they are still found at y = 0.
    const high = { ...ds, py: new Float32Array(ds.count).fill(40) } as Dataset;
    const at = projectPoint(screen, 10, 0, 0)!;
    const r = finish(
      nearestDrawnRow(high, { ...everything(ds), groundY: 0 }, screen, at, rayAt(screen, at.x, at.y), worldPerPixel, 8),
    );
    expect(r?.row).toBe(60);
    expect(r?.point.y).toBe(0);
  });
});
