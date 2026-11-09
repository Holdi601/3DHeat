import { describe, expect, it } from 'vitest';
import type { LoadedModel } from '../data/modelLoader';
import { alongOffset, DcsGround, dcsBuildings, dcsGroundFrom, judge, mergeDcsModels } from './dcsGround';
import { DCS_PROJECTIONS, fromDcs, toDcs } from './dcsProjection';
import type { Runway } from './runways';
import { latToMy, lonToMx } from './tiles';

const proj = DCS_PROJECTIONS.Caucasus;
const O = toDcs(proj, 43.2, 44.6);

/**
 * A synthetic DCS level: a 4 km square of land rising 0.01 m a metre to the
 * east, a 2 km sea strip south of it, and a runway-coloured strip 60 m wide
 * running north-south `offset` metres east of the square's middle.
 */
function level(offset = 0) {
  const verts: number[] = [];
  const cols: number[] = [];
  const ground: number[] = [];
  const water: number[] = [];
  const quad = (x0: number, z0: number, x1: number, z1: number, h: (x: number, z: number) => number, c: number[], into: number[]) => {
    const i = verts.length / 6;
    for (const [x, z] of [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ]) {
      verts.push(O.x + x, h(x, z), O.z + z, 0, 1, 0);
      cols.push(...c);
    }
    into.push(i, i + 1, i + 2, i, i + 2, i + 3);
  };
  const slope = (_x: number, z: number) => 100 + 0.01 * (z + 2000);
  const land = [0.63, 0.59, 0.49];
  const runway = [0.1, 0.1, 0.1];
  const zr = offset;
  quad(-2000, -2000, 2000, zr - 30, slope, land, ground);
  quad(-2000, zr - 30, 2000, zr + 30, slope, runway, ground);
  quad(-2000, zr + 30, 2000, 2000, slope, land, ground);
  quad(-4000, -2000, -2000, 2000, () => 0, [0.24, 0.45, 0.72], water);
  return dcsGroundFrom('Caucasus', new Float32Array(verts), new Float32Array(cols), new Uint32Array(ground), new Uint32Array(water));
}

describe('dcsGround', () => {
  it('reads heights, sea and class colours under a point', () => {
    const g = new DcsGround(level());
    const s = g.at(O.x + 100, O.z + 1000)!;
    expect(s.h).toBeCloseTo(130, 3);
    expect(s.sea).toBe(false);
    expect(s.rgb[0]).toBeCloseTo(0.63, 2);
    expect(g.at(O.x + 100, O.z)!.rgb[0]).toBeCloseTo(0.1, 2);
    const sea = g.at(O.x - 3000, O.z)!;
    expect(sea.sea).toBe(true);
    expect(sea.h).toBe(0);
    expect(g.at(O.x + 3000, O.z)).toBeNull();
    const [lat, lon] = fromDcs(proj, O.x + 100, O.z + 1000);
    expect(g.atLatLon(lat, lon)!.h).toBeCloseTo(130, 1);
  });

  it('keeps the colours out when the level has none', () => {
    const d = level();
    const g = new DcsGround({ ...d, colours: null });
    expect(g.at(O.x, O.z + 1000)!.rgb).toEqual([0.24, 0.45, 0.72]);
    expect(g.findShifts([])).toEqual([]);
  });

  it('judges a tile by its coast and its heights', () => {
    const n = 100;
    const covered = new Uint8Array(n).fill(1);
    const sea = new Uint8Array(n);
    const game = new Float32Array(n).fill(200);
    const near = new Float32Array(n).fill(210);
    expect(judge(near, game, sea, covered, 15)).toMatchObject({ covered: 100, agree: true, bias: 10, median: 0 });
    // Level with it up to a constant: agrees, the constant told apart.
    expect(judge(new Float32Array(n).fill(300), game, sea, covered, 15)).toMatchObject({ agree: true, bias: 100 });
    // A ridge where the game has a valley: half the points 200 m apart.
    const ridge = new Float32Array(n).map((_, k) => (k % 2 ? 400 : 200));
    expect(judge(ridge, game, sea, covered, 15)).toMatchObject({ agree: false, median: 200 });
    // A coarse tile allows more: 300 m at a 2 km spacing.
    expect(judge(ridge, game, sea, covered, 2000).agree).toBe(true);
    // Five of a hundred points sea in the game and land in the real world.
    const coastal = new Float32Array(near);
    for (let k = 0; k < 5; k++) {
      sea[k] = 1;
      game[k] = 0;
      coastal[k] = 40;
    }
    const v = judge(coastal, game, sea, covered, 15);
    expect(v.coast).toBeCloseTo(0.05, 5);
    expect(v.agree).toBe(false);
    expect(judge(near, game, sea, new Uint8Array(n), 15)).toMatchObject({ covered: 0, agree: true });
  });

  it("finds the game's runway beside the surveyed one and shifts toward it", () => {
    const g = new DcsGround(level(40));
    const [laA, loA] = fromDcs(proj, O.x - 1500, O.z);
    const [laB, loB] = fromDcs(proj, O.x + 1500, O.z);
    const rw: Runway = { airport: 'TEST', le: [laA, loA], he: [laB, loB], leIdent: '18', heIdent: '36', width: 45, surface: 'ASP' };
    const s = g.findShifts([rw]);
    expect(s).toHaveLength(1);
    expect(Math.abs(s[0].dx)).toBeLessThan(2);
    expect(s[0].dz).toBeGreaterThan(36);
    expect(s[0].dz).toBeLessThan(44);
    // A surveyed runway with nothing drawn beside it is left alone.
    const [laC, loC] = fromDcs(proj, O.x - 1500, O.z - 1000);
    const [laD, loD] = fromDcs(proj, O.x + 1500, O.z - 1000);
    expect(g.findShifts([{ ...rw, le: [laC, loC], he: [laD, loD] }])).toHaveLength(0);
    g.shifts = s;
    expect(g.shiftAt(O.x, O.z).dz).toBeCloseTo(s[0].dz, 5);
    expect(g.shiftAt(O.x + 70_000, O.z)).toEqual({ dx: 0, dz: 0 });
  });

  it("tells how far along the surveyed runway the game's lies", () => {
    // Runway-coloured cells 5 m square, 40 m wide, along x from a0 to a1 (the surveyed runway runs 0..3000 m).
    const strip = (a0: number, a1: number, out: number[] = []) => {
      for (let a = a0; a < a1; a += 5) for (let s = -20; s < 20; s += 5) out.push(a + 2.5, s + 2.5, 25, a, s, a + 5, s, a + 5, s + 5);
      return out;
    };
    const along = (cents: number[]) => alongOffset(cents, 0, 0, 1, 0, 0, 1, 3000, -30, 30, 45);
    expect(along(strip(-100, 2900))).toBeCloseTo(-100, -1);
    expect(along(strip(60, 3060))).toBeCloseTo(60, -1);
    // Shorter at both ends by the same: in place.
    expect(along(strip(50, 2950))).toBeCloseTo(0, -1);
    // A taxiway running on past the high end: the low end alone tells.
    expect(along(strip(-80, 3700))).toBeCloseTo(-80, -1);
    // Nothing under the middle: no move.
    expect(along(strip(0, 1000))).toBe(0);
    // Drawn in two triangles the runway's length, as the game does: the area spread along them.
    const long = [1400, 0, 1500 * 40, -100, -20, 2900, -20, 2900, 20, 1400, 0, 1500 * 40, -100, -20, 2900, 20, -100, 20];
    expect(along(long)).toBeCloseTo(-100, -1);
  });

  it("packs and finds the level's buildings", () => {
    const rows = [
      [O.x + 100, O.z + 100, 120, 8, 10, 5, 90, 0],
      [O.x - 900, O.z + 1500, 110, 20, 15, 15, 0, 1],
      [Number.NaN, 0, 0, 0, 0, 0, 0, 0],
    ];
    const b = dcsBuildings(rows)!;
    expect(b.length).toBe(16);
    expect(b[6]).toBeCloseTo(Math.PI / 2, 5);
    expect(dcsBuildings([])).toBeNull();
    const g = new DcsGround({ ...level(), buildings: b });
    expect(g.buildingsIn(O.x, O.z, O.x + 200, O.z + 200)).toEqual([0]);
    expect(g.buildingsIn(O.x - 1000, O.z, O.x + 200, O.z + 2000).sort()).toEqual([0, 1]);
    expect(g.buildingsIn(O.x + 300, O.z + 300, O.x + 400, O.z + 400)).toEqual([]);
  });

  it('samples a tile grid on the moved points and judges it', () => {
    const g = new DcsGround(level(40));
    g.shifts = [{ x: O.x, z: O.z, dx: 0, dz: 40, airport: 'TEST', lateral: 40 }];
    const z = 16;
    const S = 256 * 2 ** z;
    const [lat, lon] = fromDcs(proj, O.x, O.z);
    const px0 = lonToMx(lon) * S - 64;
    const py0 = latToMy(lat) * S - 64;
    const grid = 5;
    const real = new Float32Array(grid * grid).fill(120);
    const t = g.forTile(px0, py0, 32, grid, S, real, 10)!;
    expect(t.covered.every((c) => c === 1)).toBe(true);
    // Moved 40 m east: the middle point lands on the runway's middle, 0.4 m higher than unmoved.
    const mid = Math.floor((grid * grid) / 2);
    expect(t.colours[mid * 3]).toBeCloseTo(0.1, 2);
    expect(t.heights[mid]).toBeCloseTo(100 + 0.01 * 2040, 0);
    expect(t.shift[0]).toBeGreaterThan(0);
    expect(t.verdict.agree).toBe(true);
    expect(g.forTile(px0 + 1e6, py0, 32, grid, S, real, 10)).toBeNull();
  });
});

describe('theatreOfDcsFolder', () => {
  it("names the theatre of a DCS terrain folder, the converter's names included", async () => {
    const { theatreOfDcsFolder } = await import('./theatres');
    expect(theatreOfDcsFolder('Caucasus')?.id).toBe('Caucasus');
    expect(theatreOfDcsFolder('GermanyColdWar')?.historical).toBe(true);
    expect(theatreOfDcsFolder('MarianasWWII')?.id).toBe('MarianaIslandsWWII');
    expect(theatreOfDcsFolder('il2-moscow')).toBeUndefined();
    expect(theatreOfDcsFolder('Nowhere')).toBeUndefined();
  });
});

describe('theatreOfData', () => {
  it('goes by the middle of the data before its reference, and by a named theatre first', async () => {
    const { theatreOfData } = await import('./theatres');
    const { dataOfEastNorth, planeForward } = await import('./tiles');
    const geo = { lat0: 38, lon0: 36, projection: 'tangent-plane' as const };
    const fwd = planeForward(geo);
    const [e0, n0] = fwd(41, 37);
    const [e1, n1] = fwd(45, 45);
    const a = dataOfEastNorth(geo, e0, n0, 0);
    const b = dataOfEastNorth(geo, e1, n1, 9000);
    const bounds = { minX: a.x, minY: a.y, minZ: a.z, maxX: b.x, maxY: b.y, maxZ: b.z };
    expect(theatreOfData(geo, bounds, null)?.id).toBe('Caucasus');
    expect(theatreOfData(geo, null, null)).toBeUndefined();
    expect(theatreOfData({ lat0: 13, lon0: 145, projection: 'dcs-tm', theatre: 'MarianasWWII' }, null, null)?.id).toBe('MarianaIslandsWWII');
  });
});

describe('mergeDcsModels', () => {
  const model = (x: number, parts: string[]) => {
    const vertices = new Float32Array([x, 0, 0, 0, 1, 0, x + 1, 0, 0, 0, 1, 0, x, 0, 1, 0, 1, 0, x + 1, 5, 1, 0, 1, 0]);
    return {
      vertices,
      colours: new Float32Array(12).fill(0.5),
      uvs: null,
      atlas: null,
      indices: new Uint32Array([0, 1, 2]),
      structureIndices: new Uint32Array([1, 2, 3]),
      structureEdges: new Uint32Array([1, 2]),
      waterIndices: new Uint32Array(0),
      triangles: 1,
      structureTriangles: 1,
      waterTriangles: 0,
      sourceTriangles: 1,
      sourceStructureTriangles: 1,
      error: 0,
      partNames: parts,
      partClasses: parts.map(() => 'ground' as const),
      partReasons: parts.map(() => ''),
      partRuns: { ground: new Uint32Array([0, 1]), structure: new Uint32Array([1, 1]), water: new Uint32Array(0), nav: null },
      bounds: { minX: x, minY: 0, minZ: 0, maxX: x + 1, maxY: 5, maxZ: 1 },
      groundBand: { minY: 0, maxY: 5 },
    } as unknown as LoadedModel;
  };

  it('joins areas of one theatre: indices, parts and runs past the ones before', async () => {
    const m = await mergeDcsModels([model(0, ['g:a', 's:a']), model(100, ['g:b', 's:b'])], async () => {});
    expect(m.vertices.length).toBe(48);
    expect([...m.indices]).toEqual([0, 1, 2, 4, 5, 6]);
    expect([...m.structureIndices]).toEqual([1, 2, 3, 5, 6, 7]);
    expect([...m.structureEdges]).toEqual([1, 2, 5, 6]);
    expect(m.partNames).toEqual(['g:a', 's:a', 'g:b', 's:b']);
    expect([...m.partRuns!.ground!]).toEqual([0, 1, 2, 2]);
    expect([...m.partRuns!.structure!]).toEqual([1, 1, 3, 2]);
    expect(m.partRuns!.nav).toBeNull();
    expect(m.triangles).toBe(2);
    expect(m.bounds.minX).toBe(0);
    expect(m.bounds.maxX).toBe(101);
    expect(m.colours!.length).toBe(24);
  });
});
