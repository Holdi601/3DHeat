import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { finish, newKit, type Template } from '../figures/kit';
import { hitsFromDataset, filterHits, sectorOf, FATAL_WINDOW } from './hits';
import { autoSaturation, heatMeshOf, snapHits, splatHeat } from './surface';
import { personRegions, regionOf, REGIONS, NO_REGION } from './regions';
import { VehicleScene, figureOfVehicle, heatOf, onFigure, templateOfFigure } from './scene';
import { drawSide, sheetScale, SIDES } from './sheet';
import type { Vec3 } from '../race/geometry';

/** A dataset of rows given as objects: text columns become categories, numbers numbers (NaN where a row has none). */
function dataset(rows: Record<string, string | number>[]): Dataset {
  const names = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((n) => n !== 'time');
  const attrs: AttributeColumn[] = names.map((name) => {
    const isText = rows.some((r) => typeof r[name] === 'string');
    if (isText) {
      const cats = [''];
      const data = new Uint32Array(rows.map((r) => {
        const v = String(r[name] ?? '');
        let i = cats.indexOf(v);
        if (i < 0) i = cats.push(v) - 1;
        return i;
      }));
      return { name, kind: 'category', data, min: 0, max: cats.length - 1, categories: cats };
    }
    const data = new Float32Array(rows.map((r) => (typeof r[name] === 'number' ? (r[name] as number) : NaN)));
    return { name, kind: 'number', data, min: 0, max: 0 };
  });
  return {
    count: rows.length,
    attrs,
    time: new Float32Array(rows.map((r) => Number(r.time ?? 0))),
    sessionId: null,
    sessionLabels: [],
  } as unknown as Dataset;
}

/** A thin plate 2 m square, 2 cm thick, lying flat at y = 1: its top faces up, its bottom down. */
function plate(): Template {
  const k = newKit();
  const top = 1.01, bottom = 0.99;
  const q = (y: number, up: boolean) => {
    const a: Vec3 = [-1, y, -1], b: Vec3 = [1, y, -1], c: Vec3 = [1, y, 1], d: Vec3 = [-1, y, 1];
    const n: Vec3 = [0, up ? 1 : -1, 0];
    const col: [number, number, number] = [1, 1, 1];
    for (const p of up ? [a, c, b, a, d, c] : [a, b, c, a, c, d]) k.team.vn(p, n, col);
  };
  q(top, true);
  q(bottom, false);
  return finish(k, 'centre');
}

describe('hits from a recording', () => {
  const wt = dataset([
    { time: 10, event: 'position', player: 'Blue', Vehicle: 'p-51d-30', life: '7#1', kind: 'aircraft', VehicleName: 'P-51D-30' },
    { time: 11, event: 'shot', player: 'Red', Vehicle: 'bf-109f-4', other: 'Blue', otherVehicle: 'p-51d-30', otherLife: '7#1', hitLocalX: 1, hitLocalY: 0.25, hitLocalZ: 2, hitDirX: 0, hitDirY: 0, hitDirZ: -1, hitPart: 17310, match: 'm1' },
    { time: 11.3, event: 'shot', player: 'Red', Vehicle: 'bf-109f-4', other: 'Blue', otherVehicle: 'p-51d-30', otherLife: '7#1', hitLocalX: -3, hitLocalY: 0.125, hitLocalZ: 0, hitDirX: 1, hitDirY: 0, hitDirZ: 0, match: 'm1' },
    { time: 11.35, event: 'module_destroyed', player: 'Blue', Vehicle: 'p-51d-30', life: '7#1', other: 'Red', weapon: 'part 4965', match: 'm1' },
    // Shot long before the death, by someone else: not a killing hit.
    { time: 2, event: 'shot', player: 'Green', Vehicle: 'yak-3', other: 'Blue', otherVehicle: 'p-51d-30', otherLife: '7#1', hitLocalX: 0, hitLocalY: 0.5, hitLocalZ: 0.1, match: 'm1' },
    // An old conversion's row: no point.
    { time: 3, event: 'shot', player: 'Green', Vehicle: 'yak-3', other: 'Blue', otherVehicle: 'p-51d-30', match: 'm1' },
    { time: 12, event: 'death', player: 'Blue', Vehicle: 'p-51d-30', life: '7#1', other: 'Red', match: 'm1' },
  ]);

  it('reads War Thunder shots in the victim frame, ties the killing hits to the death and places a module', () => {
    const set = hitsFromDataset(wt);
    expect(set.source).toBe('warthunder');
    expect(set.unplaced).toBe(1);
    const hits = set.hits.filter((h) => h.kind === 'hit');
    expect(hits).toHaveLength(3);
    expect(hits[0]).toMatchObject({ vehicle: 'p-51d-30', victim: 'Blue', shooter: 'Red', shooterVehicle: 'bf-109f-4', local: [1, 0.25, 2], dir: [0, 0, -1], part: 17310, match: 'm1' });
    // The two by the killer within the window before the death; not the one by Green ten seconds before.
    expect(hits.filter((h) => h.fatal).map((h) => h.time)).toEqual([11, 11.3].map((t) => Math.fround(t)));
    expect(12 - 11).toBeLessThan(FATAL_WINDOW);
    const mod = set.hits.find((h) => h.kind === 'module')!;
    expect(mod.part).toBe(4965);
    expect(mod.local).toEqual([-3, 0.125, 0]); // the last hit before it
    const info = set.vehicles.get('p-51d-30')!;
    expect(info).toMatchObject({ name: 'P-51D-30', kind: 'aircraft', hits: 3, modules: 1 });
    expect(filterHits(set, { vehicle: 'p-51d-30', matches: null, shooters: null, weapons: null, layer: 'kills' })).toHaveLength(2);
    expect(filterHits(set, { vehicle: 'p-51d-30', matches: null, shooters: ['Green'], weapons: null, layer: 'all' })).toHaveLength(1);
    expect(filterHits(set, { vehicle: 'p-51d-30', matches: null, shooters: null, weapons: ['yak-3'], layer: 'all' })).toHaveLength(1);
    expect(filterHits(set, { vehicle: 'p-51d-30', matches: null, shooters: null, weapons: null, layer: 'modules' })).toHaveLength(1);
  });

  it('reads CS2 hurts by hitgroup, the last hurt of a life as the killing one', () => {
    const cs = dataset([
      { time: 1, event: 'hurt', player: 'Vic', other: 'Att', weapon: 'AK-47', hitgroup: 'head', damage: 100, health: 0 },
      { time: 2, event: 'hurt', player: 'Vic', other: 'Att', weapon: 'AK-47', hitgroup: 'chest', damage: 27, health: 73 },
      { time: 3, event: 'hurt', player: 'Vic', other: 'Att', weapon: 'HE Grenade', hitgroup: 'generic', damage: 5, health: 68 },
      { time: 4, event: 'shot', player: 'Att', weapon: 'AK-47' },
    ]);
    const set = hitsFromDataset(cs);
    expect(set.source).toBe('cs2');
    expect(set.hits.map((h) => [h.vehicle, h.region, h.fatal])).toEqual([
      ['soldier', 'head', true],
      ['soldier', 'chest', false],
      ['soldier', 'generic', false],
    ]);
    expect(regionOf('Left Arm')).toBe('left_arm');
    expect(regionOf('neck')).toBe('head');
    expect(regionOf('generic')).toBeNull();
  });

  it('says where a shot came from', () => {
    expect(sectorOf([1, 0, 0])).toBe('rear'); // travelling forward along the vehicle: it came from behind
    expect(sectorOf([0, -1, 0])).toBe('above');
    expect(sectorOf([0, 0, -1])).toBe('right');
    expect(sectorOf([-0.9, 0.1, 0.2])).toBe('front');
  });
});

describe('heat on the surface', () => {
  it('cuts a figure fine, every vertex with a unit normal', () => {
    const t = plate();
    const m = heatMeshOf(t, 2000);
    expect(m.count % 3).toBe(0);
    expect(m.count / 3).toBeGreaterThan(1000);
    expect(m.edge).toBeLessThan(0.2);
    for (let v = 0; v < m.count; v += 97) expect(Math.hypot(m.nrm[v * 3], m.nrm[v * 3 + 1], m.nrm[v * 3 + 2])).toBeCloseTo(1, 4);
  });

  it('keeps a hit on the side it struck: a shot from above warms the top of a thin plate, not its underside', () => {
    const m = heatMeshOf(plate(), 4000);
    // The point a little inside the plate, the shot travelling down.
    const splats = snapHits(m, [{ p: [0.2, 1.0, 0.1], dir: [0, -1, 0], weight: 1 }], 0.5);
    expect(splats[0].n).toEqual([0, 1, 0]);
    const heat = splatHeat(m, splats, 0.15);
    let top = 0, under = 0;
    for (let v = 0; v < m.count; v++) {
      if (m.nrm[v * 3 + 1] > 0) top = Math.max(top, heat[v]);
      else under = Math.max(under, heat[v]);
    }
    expect(top).toBeGreaterThan(0.8);
    expect(under).toBe(0);
    // From below, the other way round.
    const below = splatHeat(m, snapHits(m, [{ p: [0.2, 1.0, 0.1], dir: [0, 1, 0], weight: 1 }], 0.5), 0.15);
    let top2 = 0;
    for (let v = 0; v < m.count; v++) if (m.nrm[v * 3 + 1] > 0) top2 = Math.max(top2, below[v]);
    expect(top2).toBe(0);
    expect(autoSaturation(heat, m.count)).toBeGreaterThan(0);
  });

  it('falls off as a Gaussian of the distance', () => {
    const m = heatMeshOf(plate(), 8000);
    const heat = splatHeat(m, [{ p: [0, 1.01, 0], n: [0, 1, 0], weight: 1 }], 0.2);
    const at = (x: number) => {
      let best = Infinity, h = 0;
      for (let v = 0; v < m.count; v++) {
        if (m.nrm[v * 3 + 1] <= 0) continue;
        const d = Math.abs(Math.hypot(m.pos[v * 3], m.pos[v * 3 + 2]) - x);
        if (d < best) { best = d; h = heat[v]; }
      }
      return h;
    };
    expect(at(0)).toBeCloseTo(1, 1);
    expect(at(0.2)).toBeCloseTo(Math.exp(-0.5), 1);
    expect(at(0.7)).toBe(0); // past three sigma
  });

  it('drops points far off the figure (sent in another frame)', () => {
    const t = { min: [-5, -1, -5] as Vec3, max: [5, 1, 5] as Vec3 };
    expect(onFigure([4, 0, 4], t)).toBe(true);
    expect(onFigure([-225, -294, 197], t)).toBe(false);
  });
});

describe('body regions', () => {
  it('splits the soldier into head, chest, stomach, arms and legs, left on its own left', () => {
    const t = templateOfFigure('soldier')!;
    const m = heatMeshOf(t, 20000);
    const tags = personRegions(m);
    const where = new Map<string, { y: number; z: number; n: number }>();
    for (let v = 0; v < m.count; v++) {
      if (tags[v] === NO_REGION) continue;
      const r = REGIONS[tags[v]];
      const w = where.get(r) ?? { y: 0, z: 0, n: 0 };
      w.y += m.pos[v * 3 + 1];
      w.z += m.pos[v * 3 + 2];
      w.n++;
      where.set(r, w);
    }
    const mid = (r: string) => { const w = where.get(r)!; return { y: w.y / w.n, z: w.z / w.n }; };
    for (const r of REGIONS) expect(where.get(r)?.n ?? 0).toBeGreaterThan(10);
    expect(mid('head').y).toBeGreaterThan(mid('chest').y);
    expect(mid('chest').y).toBeGreaterThan(mid('stomach').y);
    expect(mid('stomach').y).toBeGreaterThan(mid('left_leg').y);
    expect(mid('left_leg').z).toBeLessThan(0);
    expect(mid('right_leg').z).toBeGreaterThan(0);
    expect(mid('left_arm').z).toBeLessThan(mid('right_arm').z);
  });

  it('paints a region by its count', () => {
    const m = heatMeshOf(templateOfFigure('soldier')!, 8000);
    const r = heatOf(m, [
      { region: 'head', local: null } as never,
      { region: 'head', local: null } as never,
      { region: 'left_leg', local: null } as never,
    ], 0.1, personRegions(m));
    expect(r.regions!.get('head')).toBe(2);
    expect(r.auto).toBe(2);
    expect(r.drawn).toBe(3);
  });
});

describe('the scene', () => {
  it('draws a vehicle as its figure, else its class', () => {
    expect(figureOfVehicle({ id: 'soldier', name: '', kind: '' })).toBe('soldier');
    expect(templateOfFigure(figureOfVehicle({ id: 'zz_unknown', name: '', kind: 'aircraft' }))).not.toBeNull();
    expect(templateOfFigure(figureOfVehicle({ id: 'zz_unknown', name: '', kind: '' }))).not.toBeNull();
  });

  it('rebuilds only what changed', () => {
    const scene = new VehicleScene();
    const figure = figureOfVehicle({ id: 'zz', name: '', kind: 'tank' });
    const hits = [{ local: [0, 1, 0], dir: [0, -1, 0], kind: 'hit' } as never];
    const lut = new Uint8Array(256 * 4).fill(255);
    const look = { radius: 0, exposure: 0, showPoints: true, showArrows: true, colourBy: 'none' as const };
    const [f1, c1] = scene.build({ figure, hits, look, lut, lutKey: 1 });
    expect(c1).toBe(true);
    expect(f1.tris.count).toBeGreaterThan(1000);
    expect(f1.lines.count).toBeGreaterThan(6);
    expect(scene.build({ figure, hits, look, lut, lutKey: 1 })[1]).toBe(false);
    expect(scene.build({ figure, hits, look: { ...look, exposure: 1 }, lut, lutKey: 1 })[1]).toBe(true);
    // Lifted onto the grid.
    let low = Infinity;
    for (let i = 0; i < f1.tris.count; i++) low = Math.min(low, f1.tris.data[i * 7 + 1]);
    expect(low).toBeCloseTo(0, 3);
  });
});

describe('the flat sheet', () => {
  it('draws the side facing the eye, the nearer surface over the farther', () => {
    const m = heatMeshOf(plate(), 500);
    const rgba = new Float32Array(m.count * 4);
    // Top red, underside blue.
    for (let v = 0; v < m.count; v++) rgba.set(m.nrm[v * 3 + 1] > 0 ? [1, 0, 0, 1] : [0, 0, 1, 1], v * 4);
    const w = 60, h = 60;
    const img = { data: new Uint8ClampedArray(w * h * 4), width: w, height: h };
    const scale = sheetScale(m.min, m.max, w, h);
    expect(scale).toBeGreaterThan(10);
    drawSide(img, 'top', m.pos, m.nrm, rgba, m.count, m.min, m.max, { x: 0, y: 0, w, h }, scale);
    const o = (30 * w + 30) * 4;
    expect([img.data[o], img.data[o + 2], img.data[o + 3]]).toEqual([255, 0, 255]);
    const img2 = { data: new Uint8ClampedArray(w * h * 4), width: w, height: h };
    drawSide(img2, 'bottom', m.pos, m.nrm, rgba, m.count, m.min, m.max, { x: 0, y: 0, w, h }, scale);
    expect([img2.data[o], img2.data[o + 2]]).toEqual([0, 255]);
    // No holes between the small triangles.
    let empty = 0;
    for (let y = 15; y < 45; y++) for (let x = 15; x < 45; x++) if (img.data[(y * w + x) * 4 + 3] === 0) empty++;
    expect(empty).toBe(0);
    expect(SIDES).toHaveLength(6);
  });
});

describe('fitting hits to the figure', () => {
  it('finds the shift between the game model origin and the figure', async () => {
    const { distanceField, fitOffset, offsetFor, shiftHits, FIT_MIN_HITS } = await import('./fit');
    const t = templateOfFigure(figureOfVehicle({ id: 'zz', name: '', kind: 'aircraft' }))!;
    const m = heatMeshOf(t, 4000);
    // Points on the figure's surface, as a game with its origin 3 m further forward and 0.4 m lower would send them.
    const pts: Vec3[] = [];
    for (let v = 0; v < m.count; v += 37) pts.push([m.pos[v * 3] - 3, m.pos[v * 3 + 1] + 0.4, m.pos[v * 3 + 2]]);
    expect(pts.length).toBeGreaterThan(FIT_MIN_HITS);
    const o = fitOffset(t, distanceField(t), pts);
    const cell = Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2]) / 100;
    expect(Math.abs(o[0] - 3)).toBeLessThan(2 * cell);
    expect(Math.abs(o[1] + 0.4)).toBeLessThan(2 * cell);
    expect(Math.abs(o[2])).toBeLessThan(2 * cell);
    // Points already on it stay where they are.
    const on = pts.map((p) => [p[0] + 3, p[1] - 0.4, p[2]] as Vec3);
    expect(fitOffset(t, distanceField(t), on).every((v) => Math.abs(v) < 2 * cell)).toBe(true);
    // Too few: not moved.
    const few = pts.slice(0, FIT_MIN_HITS - 1).map((p) => ({ local: p }));
    expect(offsetFor(t, few)).toEqual([0, 0, 0]);
    const hits = [{ local: [1, 2, 3] as Vec3 }, { local: null }];
    const moved = shiftHits(hits, [1, 0, -1]);
    expect(moved[0].local).toEqual([2, 2, 2]);
    expect(moved[1]).toBe(hits[1]);
    expect(shiftHits(hits, [1, 0, -1])).toBe(moved);
    expect(shiftHits(hits, [0, 0, 0])).toBe(hits);
  });
});
