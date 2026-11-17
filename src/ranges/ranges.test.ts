import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import { GAMES, RANGES, defaultArmament, detectRangeGame, readCatalogue, unitWeapons, weaponOfLabel } from './catalog';
import { Loadouts } from './loadout';
import { DEFAULT_RANGES, readRanges } from './settings';
import { BAND, CONE_RINGS, CONE_SEGMENTS, SHELL_FLOATS, SPHERE_RINGS, SPHERE_SEGMENTS, buildShells, dropReach, shellMesh, weaponColour, type RangeUnit } from './shells';
import { ViewshedPlan, type RangeView } from './viewshed';
import { ViewFov, acrossOf, gameFov, magnified, upOf } from './view';
import { RecordedRadars, gameSensors, sectorShape, sensorBands, sensorsFor, turned } from './sensors';
import { FACES, MAX_VIEWS, faceOf, faceUv } from './viewshedShaders';
import { installLocal, localSight, readLocal } from './local';

describe('range catalogue', () => {
  it('reads every entry, with unique ids and known armament', () => {
    expect(RANGES.weapons.length).toBeGreaterThan(80);
    expect(new Set(RANGES.weapons.map((w) => w.id)).size).toBe(RANGES.weapons.length);
    for (const w of RANGES.weapons) {
      expect(w.min).toBeLessThanOrEqual(w.opt);
      expect(w.opt).toBeLessThanOrEqual(w.max);
      expect(w.match.length).toBeGreaterThan(0);
    }
    expect(Object.keys(RANGES.classes).length).toBeGreaterThan(60);
    for (const ids of [...Object.values(RANGES.classes), ...Object.values(RANGES.figures)]) expect(ids.every((id) => RANGES.byId.has(id))).toBe(true);
  });

  it('names the weapon a label means, the most specific match winning', () => {
    const id = (l: string) => weaponOfLabel(l)?.id ?? null;
    expect(id('AIM_120C')).toBe('aim-120');
    expect(id('AIM-9X')).toBe('aim-9x');
    expect(id('AIM-9M')).toBe('aim-9');
    expect(id('R-27ER')).toBe('r-27');
    expect(id('MG 151/20')).toBe('air-cannon-ww2');
    expect(id('ak47')).toBe('rifle');
    expect(id('awp')).toBe('sniper');
    expect(id('9M311')).toBe('9m311');
    expect(id('GBU-12')).toBe('lgb');
    expect(id('Mk-82')).toBe('bomb');
    expect(id('FGM-148 Javelin')).toBe('javelin');
    expect(id('S-300PS')).toBe('s-300');
    expect(id('nothing at all')).toBeNull();
  });

  it('gives a vehicle its armament, by name, by class, and keeps what the data names first', () => {
    expect(defaultArmament('2k22-tunguska').map((w) => w.id)).toEqual(['9m311', '2a38']);
    expect(defaultArmament('m1a2-abrams').map((w) => w.cls)).toContain('gun');
    expect(defaultArmament(null)).toEqual([]);
    const f16 = unitWeapons('f-16c', ['AIM_120C']);
    expect(f16[0]).toMatchObject({ from: 'data' });
    expect(f16[0].weapon.id).toBe('aim-120');
    // The gun stays (a class the data named none of); the default AAMs give way to the one the data names.
    expect(f16.map((w) => w.weapon.id)).toContain('air-gun');
    expect(f16.filter((w) => w.weapon.cls === 'aam').map((w) => w.weapon.id)).toEqual(['aim-120']);
  });

  it('skips broken entries and keeps the rest', () => {
    const c = readCatalogue({ weapons: [{ id: 'a', cls: 'gun', range: [0, 1, 2], match: ['x'] }, { id: 'b', cls: 'nope', range: [0, 1, 2] }, { id: 'c', cls: 'gun', range: [5, 1] }] }, { classes: { x: ['a', 'zz'] } });
    expect(c.weapons.map((w) => w.id)).toEqual(['a']);
    expect(c.classes.x).toEqual(['a']);
  });
});

function table(rows: { p: number; ev: string; w: string }[], extra: Partial<Dataset> = {}): Dataset {
  const cat = (vals: string[]) => {
    const cats = [...new Set(vals)];
    return { cats, data: Uint32Array.from(vals, (v) => cats.indexOf(v)) };
  };
  const ev = cat(rows.map((r) => r.ev));
  const w = cat(rows.map((r) => r.w));
  return {
    count: rows.length,
    personId: Uint32Array.from(rows, (r) => r.p),
    personLabels: ['a', 'b', 'c'],
    attrs: [
      { name: 'event', kind: 'category', data: ev.data, min: 0, max: ev.cats.length - 1, categories: ev.cats },
      { name: 'weapon', kind: 'category', data: w.data, min: 0, max: w.cats.length - 1, categories: w.cats },
    ],
    ...extra,
  } as unknown as Dataset;
}

describe('game catalogues', () => {
  it('reads every game file, each weapon with its source, every vehicle weapon known', () => {
    for (const id of ['wt', 'dcs', 'cs2', 'r6', 'valorant', 'bf4', 'bf1', 'bf6', 'squad', 'arma3', 'wot', 'wows', 'il2']) expect(GAMES.has(id)).toBe(true);
    for (const g of GAMES.values()) {
      for (const w of g.weapons) {
        expect(w.game).toBe(g.id);
        expect(w.source ?? '').toMatch(/^https?:\/\//);
        expect(w.min).toBeLessThanOrEqual(w.max);
      }
      for (const v of g.vehicles) expect(v.weapons.every((id) => RANGES.byId.has(id))).toBe(true);
    }
  });

  it('tells the game by name or columns, and prefers its own figures', () => {
    expect(detectRangeGame('de_dust2.dem', [], [])?.id).toBe('cs2');
    expect(detectRangeGame('flight.acmi', ['Type', 'Coalition'], [])?.id).toBe('dcs');
    expect(detectRangeGame('table', ['aimHeading'], [])?.id).toBe('wt');
    expect(detectRangeGame('table', [], ['nothing'])).toBeNull();
    const cs2 = GAMES.get('cs2')!;
    const ak = weaponOfLabel('ak47', RANGES, cs2)!;
    expect(ak.id).toBe('cs2-ak47');
    expect(ak.src).toBe('game');
    // By the table's own weapon names when nothing else says.
    expect(detectRangeGame('table', [], ['ak47', 'awp', 'm4a1_silencer'])?.id).toBe('cs2');
  });

  it("colours a unit's weapons in its side's family, each its own shade", () => {
    const hue = ([r, g, b]: number[]) => {
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return ((h * 60) + 360) % 360;
    };
    const red: [number, number, number] = [0.85, 0.2, 0.18];
    const cols = [0, 1, 2, 3].map((i) => weaponColour(red, i));
    expect(Math.abs(hue(cols[0]) - hue(red))).toBeLessThan(3);
    for (const c of cols) {
      const off = Math.min(Math.abs(hue(c) - hue(red)), 360 - Math.abs(hue(c) - hue(red)));
      expect(off).toBeLessThanOrEqual(56);
    }
    const lum = cols.map((c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]);
    expect(new Set(lum.map((l) => l.toFixed(2))).size).toBe(4);
  });
});

describe('loadouts', () => {
  it('reads the weapons a unit uses, a slice at a time, not the ones that hit it', () => {
    const d = table([
      { p: 0, ev: 'shot', w: 'ak47' },
      { p: 1, ev: 'hurt', w: 'ak47' },
      { p: 1, ev: 'shot', w: 'awp' },
      { p: 0, ev: 'kill', w: 'deagle' },
      { p: 2, ev: 'death', w: 'awp' },
    ]);
    const l = new Loadouts();
    let steps = 0;
    while (l.step(d, 2)) steps++;
    expect(steps).toBe(2);
    expect(l.done).toBe(true);
    expect([...l.of(0)].sort()).toEqual(['ak47', 'deagle']);
    expect(l.of(1)).toEqual(['awp']);
    expect(l.of(2)).toEqual([]);
  });
});

describe('range shells', () => {
  const unit = (over: Partial<RangeUnit> = {}): RangeUnit => ({ person: 0, x: 1, y: 2, z: 3, fwd: [1, 0, 0], height: 1000, speed: 200, weapons: [], slot: 1, ...over });

  it('makes a unit sphere and a unit cone side', () => {
    const m = shellMesh();
    expect(m.sphere).toBe(SPHERE_RINGS * SPHERE_SEGMENTS * 6);
    expect(m.cone).toBe(CONE_RINGS * CONE_SEGMENTS * 6);
    for (let i = 0; i < m.sphere; i++) expect(Math.hypot(m.data[i * 4], m.data[i * 4 + 1], m.data[i * 4 + 2])).toBeCloseTo(1, 5);
  });

  it('lays a shell a band, cones last, in data units', () => {
    const out = { data: new Float32Array(0), count: 0, coneStart: 0 };
    const tunguska = defaultArmament('2k22-tunguska');
    const jet = unitWeapons('f-16c', []).map((w) => w.weapon);
    buildShells([unit({ weapons: tunguska }), unit({ person: 1, weapons: jet, slot: -1 })], DEFAULT_RANGES, 2, RANGES.colours, out);
    // Tunguska: missiles and guns, least, best, most; the jet: gun (best, most), two missiles and the
    // Maverick (least, best, most), the guided bomb (best, most) - five with a cone's side.
    expect(out.count).toBe(6 + 13);
    expect(out.coneStart).toBe(out.count - 5);
    const missile = out.data.subarray(0, SHELL_FLOATS);
    expect(missile[3]).toBe(2500 * 2);
    expect(missile[16]).toBe(BAND.min);
    expect(missile[17]).toBe(1);
    expect(missile[12]).toBe(15 * 2);
    expect(missile[13]).toBe(3500 * 2);
    expect(missile[11]).toBe(-2);
    // A cone's side goes with its outermost shell.
    for (let i = out.coneStart; i < out.count; i++) {
      expect(out.data[i * SHELL_FLOATS + 16]).toBe(BAND.max);
      expect(out.data[i * SHELL_FLOATS + 11]).toBeGreaterThan(-1);
    }
  });

  it('leaves out the kinds and bands turned off', () => {
    const out = { data: new Float32Array(0), count: 0, coneStart: 0 };
    const s = readRanges({ classes: { cannon: false }, bands: { min: false, opt: false } });
    buildShells([unit({ weapons: defaultArmament('2k22-tunguska') })], s, 1, RANGES.colours, out);
    expect(out.count).toBe(1);
    expect(out.data[3]).toBe(8000);
  });

  it('throws a bomb as far as the fall from its height carries it', () => {
    const bomb = RANGES.byId.get('bomb')!;
    expect(dropReach(bomb, 0, 0)).toBeLessThan(10);
    expect(dropReach(bomb, 1000, 200)).toBeGreaterThan(2500);
    expect(dropReach(bomb, 9000, 300)).toBe(bomb.max);
    expect(dropReach(RANGES.byId.get('jdam')!, 100, 100)).toBe(RANGES.byId.get('jdam')!.max);
  });
});

describe('settings', () => {
  it('reads saved choices and falls back on the defaults', () => {
    expect(readRanges(null)).toEqual(DEFAULT_RANGES);
    const r = readRanges({ on: true, units: 'team', opacity: 7, maxUnits: 100, style: 'lines' });
    expect(r).toMatchObject({ on: true, units: 'team', opacity: 1, maxUnits: 32, style: 'lines', los: true });
  });
});

describe('line of sight', () => {
  /**
   * A synthetic level: a wall across x = 50 (y 0..10, z -20..20) and the ground
   * at y = 0. The faces are taken by casting each texel's ray, as the GPU draws
   * them (rows bottom up, as WebGL2's), then points are tested the way the
   * shaders do.
   */
  const N = 128;
  const eye: [number, number, number] = [0, 2, 0];
  const far = 400;
  const hit = (d: number[]): number => {
    let t = Infinity;
    if (d[0] > 0) {
      const s = 50 / d[0];
      const y = eye[1] + d[1] * s, z = eye[2] + d[2] * s;
      if (y >= 0 && y <= 10 && Math.abs(z) <= 20) t = Math.min(t, s);
    }
    if (d[1] < 0) t = Math.min(t, -eye[1] / d[1]);
    return t;
  };
  const faces = FACES.map(([a, r, u]) => {
    const depth = new Float32Array(N * N);
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        // The texel's middle, pushed back by the spread across it (the shaders' slope bias).
        const at = (ox: number, oy: number) => {
          const s = ((x + ox) / N) * 2 - 1, v = ((y + oy) / N) * 2 - 1;
          const d = [a[0] + s * r[0] + v * u[0], a[1] + s * r[1] + v * u[1], a[2] + s * r[2] + v * u[2]];
          const l = Math.hypot(d[0], d[1], d[2]);
          return hit(d.map((c) => c / l));
        };
        const mid = at(0.5, 0.5);
        const slope = Math.max(Math.abs(at(1.5, 0.5) - mid), Math.abs(at(0.5, 1.5) - mid));
        depth[y * N + x] = Math.min(1, (mid + 1.5 * (Number.isFinite(slope) ? slope : 0)) / far);
      }
    return depth;
  });
  const seen = (p: number[]): boolean => {
    const d = [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]];
    const dist = Math.hypot(d[0], d[1], d[2]);
    const f = faceOf(d);
    const [u, v] = faceUv(d, f);
    const px = Math.min(N - 1, Math.max(0, Math.floor((u * 0.5 + 0.5) * N)));
    const py = Math.min(N - 1, Math.max(0, Math.floor((v * 0.5 + 0.5) * N)));
    return dist <= faces[f][py * N + px] * far + 0.004 * dist + 0.5;
  };

  it('cuts what lies behind the wall and keeps what is in front, beside and above it', () => {
    expect(seen([30, 5, 0])).toBe(true);
    expect(seen([80, 3, 0])).toBe(false);
    expect(seen([80, 3, 60])).toBe(true);
    expect(seen([80, 40, 0])).toBe(true);
    expect(seen([-80, 3, 0])).toBe(true);
    // The ground seen in front of the wall, not behind it.
    expect(seen([30, 0, 5])).toBe(true);
    expect(seen([90, 0, 0])).toBe(false);
  });

  it('puts every direction on a face it lies inside', () => {
    for (let i = 0; i < 500; i++) {
      const d = [Math.sin(i * 1.3) * 3, Math.cos(i * 0.7) * 2, Math.sin(i * 2.1 + 1)];
      const [u, v] = faceUv(d, faceOf(d));
      expect(Math.abs(u)).toBeLessThanOrEqual(1 + 1e-9);
      expect(Math.abs(v)).toBeLessThanOrEqual(1 + 1e-9);
    }
  });

  it('takes the faces a few a frame, again only when the unit moves', () => {
    const plan = new ViewshedPlan();
    const view = (x: number, id = 7): RangeView => ({ id, eye: [x, 0, 0], far: 1000, tolerance: 5, band: [0, 500, 1000], colour: [1, 1, 1] });
    const views: (RangeView | null)[] = Array.from({ length: MAX_VIEWS }, () => null);
    views[0] = view(0);
    expect(plan.plan(views, 'level', 4)).toHaveLength(4);
    expect(plan.pending).toBe(true);
    expect(plan.plan(views, 'level', 4)).toHaveLength(2);
    expect(plan.pending).toBe(false);
    expect(plan.plan(views, 'level', 4)).toHaveLength(0);
    views[0] = view(3);
    expect(plan.plan(views, 'level', 4)).toHaveLength(0);
    views[0] = view(30);
    expect(plan.plan(views, 'level', 6)).toHaveLength(6);
    // Another unit in the slot, or another level: all again.
    views[0] = view(30, 8);
    expect(plan.plan(views, 'level', 6)).toHaveLength(6);
    expect(plan.plan(views, 'other level', 6)).toHaveLength(6);
    const u = plan.uniforms(views, [10, 0, 0]);
    expect([u[0], u[3]]).toEqual([20, 1000]);
    // A slot not in use: nothing taken, reach 0.
    expect(u[6 * 4 + 3]).toBe(0);
  });
});

describe('view cone', () => {
  const d = (attrs: unknown[]) => ({ count: 3, attrs } as unknown as Dataset);
  it("takes the game's field of view, else 90 across", () => {
    expect(gameFov(null)).toBe(90);
    expect(gameFov(GAMES.get('cs2')!)).toBe(90);
    expect(acrossOf(upOf(100))).toBeCloseTo(100, 6);
  });

  it('narrows through a sight: by a fov or zoom column, or an aiming flag', () => {
    const f = new ViewFov();
    const zoom = d([{ name: 'zoom', kind: 'number', data: Float32Array.of(1.19, 4, 0), min: 0, max: 4 }]);
    // War Thunder's 1.19: a third-person camera, not a sight.
    expect(f.wanted(zoom, null, 0)).toBe(90);
    expect(f.wanted(zoom, null, 1)).toBeCloseTo(magnified(90, 4), 6);
    expect(magnified(90, 4)).toBeCloseTo(28.07, 1);
    const fov = d([{ name: 'fov', kind: 'number', data: Float32Array.of(40, 90, 10), min: 10, max: 90 }]);
    expect(f.wanted(fov, null, 2)).toBe(10);
    const ads = d([{ name: 'ads', kind: 'category', data: Uint32Array.of(0, 1, 0), min: 0, max: 1, categories: ['false', 'true'] }]);
    expect(f.wanted(ads, null, 0)).toBe(90);
    expect(f.wanted(ads, null, 1)).toBeLessThan(90);
  });

  it('eases to a new width instead of jumping', () => {
    const f = new ViewFov();
    const zoom = d([{ name: 'zoom', kind: 'number', data: Float32Array.of(1, 4, 4), min: 0, max: 4 }]);
    expect(f.at(zoom, null, 0, 0, 0)).toBe(90);
    const mid = f.at(zoom, null, 0, 1, 0.1);
    expect(mid).toBeGreaterThan(magnified(90, 4));
    expect(mid).toBeLessThan(90);
    expect(f.at(zoom, null, 0, 2, 2)).toBeCloseTo(magnified(90, 4), 1);
  });

  it('lays a frustum with its sides, cut by the line of sight', () => {
    const out = { data: new Float32Array(0), count: 0, coneStart: 0 };
    const unit: RangeUnit = { person: 0, x: 0, y: 0, z: 0, fwd: [0, 0, -1], height: 0, speed: 0, weapons: [], slot: 2, view: { length: 400, tanH: 1, tanV: 0.5625, fwd: [0, 0, -1], colour: [1, 1, 1] } };
    buildShells([unit], DEFAULT_RANGES, 1, RANGES.colours, out);
    expect(out.count).toBe(1);
    expect(out.coneStart).toBe(0);
    expect(Array.from(out.data.subarray(0, SHELL_FLOATS))).toEqual(expect.arrayContaining([400, -3]));
    expect(out.data[11]).toBe(-3);
    expect(out.data[17]).toBe(2);
    expect([out.data[22], out.data[23]]).toEqual([1, 0.5625]);
  });
});
describe('sensors', () => {
  it("reads a game's sensors and finds a vehicle's by its name", () => {
    const wt = gameSensors(GAMES.get('wt')!);
    expect(wt.length).toBeGreaterThan(3);
    const gepard = sensorsFor(wt, 'germ_flakpanzer_gepard', null);
    expect(gepard.map((s) => s.kind)).toContain('radar');
    expect(sensorsFor(wt, 'us_m1_abrams', null).filter((s) => s.kind === 'radar')).toEqual([]);
    // How far a ship is seen is not a sensor of its own.
    expect(gameSensors(GAMES.get('wows')!).some((s) => /detectab/i.test(`${s.name} ${s.note ?? ''}`))).toBe(false);
  });

  it("shrinks a radar's reach with the fourth root of the target's cross-section", () => {
    const [min, opt, max] = sensorBands({ kind: 'radar', range: 100000 });
    expect(max).toBe(100000);
    expect(opt).toBeCloseTo(56234, 0);
    expect(min).toBeCloseTo(31623, 0);
    expect(sensorBands({ kind: 'irst', range: 8000 })).toEqual([0, 0, 8000]);
  });

  it('draws an all-round search as a dome and a forward one as a frustum about its middle', () => {
    expect(sectorShape([0, 0, -1], [-180, 180], [0, 85])).toEqual({ dome: true, el: [0, 85] });
    const f = sectorShape([0, 0, -1], [-60, 60], [-10, 30]);
    expect(f.dome).toBe(false);
    if (!f.dome) {
      expect(f.tanH).toBeCloseTo(Math.tan(Math.PI / 3), 6);
      expect(f.tanV).toBeCloseTo(Math.tan((20 * Math.PI) / 180), 6);
      expect(f.fwd[1]).toBeCloseTo(Math.sin((10 * Math.PI) / 180), 6);
    }
    const right = turned([0, 0, -1], 90, 0);
    expect(right[0]).toBeCloseTo(1, 6);
  });

  it('reads the radar a recording has on, and nothing while it is off', () => {
    const col = (name: string, v: number[]) => ({ name, kind: 'number', data: Float32Array.from(v), min: 0, max: 1 });
    const d = { attrs: [col('RadarMode', [1, 0]), col('RadarRange', [80000, 80000]), col('RadarAzimuth', [10, 10]), col('RadarHorizontalBeamwidth', [120, 120])] } as unknown as Dataset;
    const r = new RecordedRadars();
    expect(r.at(d, 0)).toMatchObject({ range: 80000, az: 10, el: 0, h: 120 });
    expect(r.at(d, 1)).toBeNull();
  });

  it("lays a sector's bands, the frustum's outermost with its sides", () => {
    const out = { data: new Float32Array(0), count: 0, coneStart: 0 };
    const unit: RangeUnit = {
      person: 0, x: 0, y: 0, z: 0, fwd: [0, 0, -1], height: 0, speed: 0, weapons: [], slot: 0,
      sectors: [
        { bands: [316, 562, 1000], dome: false, el: [-10, 10], fwd: [0, 0, -1], tanH: 1, tanV: 0.2, colour: [1, 1, 1], los: true },
        { bands: [0, 0, 500], dome: true, el: [0, 85], fwd: [0, 0, -1], tanH: 0, tanV: 0, colour: [1, 1, 1], los: false },
      ],
    };
    buildShells([unit], DEFAULT_RANGES, 1, RANGES.colours, out);
    expect(out.count).toBe(4);
    expect(out.coneStart).toBe(3);
    const last = out.data.subarray(3 * SHELL_FLOATS, 4 * SHELL_FLOATS);
    expect([last[3], last[11], last[20], last[21]]).toEqual([1000, -3, 316, 562]);
    const dome = out.data.subarray(2 * SHELL_FLOATS, 3 * SHELL_FLOATS);
    expect([dome[3], dome[11], dome[17]]).toEqual([500, -2, -1]);
  });
});
describe('local catalogue (from the user installation)', () => {
  const raw = {
    version: 1,
    game: 'zz',
    name: 'Test game',
    weapons: [
      { id: 'local-zz-gun', cls: 'gun', name: '105 mm test gun', range: [0, 2000, 7000], shape: 'sphere', labels: ['test_gun_105', '105mm_test_shell'] },
      { id: 'local-zz-bad', cls: 'nope', name: 'broken', range: [0, 1, 2] },
    ],
    sensors: {
      'local-zz-radar': { kind: 'radar', name: 'Test radar', range: 20000, az: [-60, 60], el: [-10, 70], rcsRef: 5, mount: 'turret' },
      'local-zz-norange': { kind: 'radar', name: 'Unknown' },
    },
    units: [
      {
        names: ['zz_tank', 'Test Tank'],
        weapons: ['local-zz-gun', 'local-zz-missing'],
        sensors: ['local-zz-radar', 'local-zz-norange'],
        optics: [{ who: 'gunner', fov: [5, 25], thermal: { gen: 2 }, nv: false, mount: 'gun' }],
      },
    ],
  };

  it('reads weapons, sensors and units, skipping what it cannot use', () => {
    const byId = new Map(RANGES.byId);
    const l = readLocal(raw, byId)!;
    expect(l.weapons.map((w) => w.id)).toEqual(['local-zz-gun']);
    expect(l.weapons[0].src).toBe('local');
    expect(byId.has('local-zz-gun')).toBe(true);
    expect(l.labels.get('105mm_test_shell')?.id).toBe('local-zz-gun');
    const u = l.units.get('test tank')!;
    expect(u).toBe(l.units.get('zz_tank'));
    expect(u.weapons.map((w) => w.id)).toEqual(['local-zz-gun']);
    expect(u.sensors.map((s) => [s.id, s.mount, s.src])).toEqual([['local-zz-radar', 'turret', 'local']]);
    expect(u.optics[0].fov).toEqual([25, 5]);
    expect(readLocal({ game: 'zz' })).toBeNull();
  });

  it('wins over the public catalogue for the units and labels it lists, the rest unchanged', () => {
    const games = new Map(GAMES);
    const cat = { ...RANGES, byId: new Map(RANGES.byId) };
    expect(installLocal(raw, games, cat)).toBe('zz');
    const g = games.get('zz')!;
    expect(weaponOfLabel('105MM_TEST_SHELL', cat, g)?.id).toBe('local-zz-gun');
    expect(defaultArmament(null, cat, g, 'Test Tank').map((w) => w.id)).toEqual(['local-zz-gun']);
    expect(sensorsFor(gameSensors(g), 'zz_tank', null, g).map((s) => s.id)).toEqual(['local-zz-radar']);
    expect(sensorsFor(gameSensors(g), 'other', null, g)).toEqual([]);
    expect(localSight(g, 'zz_tank', null)).toEqual([25, 5]);
    expect(localSight(g, 'other', null)).toBeNull();
    // A magnified view stays within the unit's own sight.
    const v = new ViewFov();
    const d = { name: 't', count: 1, attrs: [{ name: 'zoom', kind: 'number', data: new Float32Array([40]) }] } as unknown as Dataset;
    expect(v.wanted(d, g, 0, [25, 5])).toBeCloseTo(5);
  });
});
