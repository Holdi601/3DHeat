import { describe, expect, it } from 'vitest';
import { figureFromModelGlb, isOwnModel, kinFor, modelVariantName, packSide, platesFromModelGlb, sidesMeet, vehicleKey, type ModelPackIndex } from './modelpack';
import { buildMeshFigure } from './meshfig';
import { installModelPackIndex, removeFigurePack } from './figurepack';
import type { Template } from './kit';

/** A box as a glb mesh: 8 corners, 12 triangles. */
function box(lo: number[], hi: number[]): { p: Float32Array; i: Uint16Array } {
  const p = new Float32Array(24);
  for (let c = 0; c < 8; c++) {
    p[c * 3] = c & 1 ? hi[0] : lo[0];
    p[c * 3 + 1] = c & 2 ? hi[1] : lo[1];
    p[c * 3 + 2] = c & 4 ? hi[2] : lo[2];
  }
  const i = new Uint16Array([0, 1, 3, 0, 3, 2, 4, 6, 7, 4, 7, 5, 0, 4, 5, 0, 5, 1, 2, 3, 7, 2, 7, 6, 0, 2, 6, 0, 6, 4, 1, 5, 7, 1, 7, 3]);
  return { p, i };
}

type BoxPart = { lo: number[]; hi: number[]; extras?: object };

/**
 * A synthetic unit file in the pack layout: by default a hull, running gear, a turret and a gun, at two levels of
 * detail; `dm` regions under a `dm` node.
 */
function syntheticGlb(given?: Record<string, BoxPart>, dm: Record<string, BoxPart> = {}): Uint8Array {
  const parts: Record<string, BoxPart> = given ?? {
    hull: { lo: [-3, 0.4, -1.5], hi: [3, 1.6, 1.5] },
    gear: { lo: [-3, 0, -1.6], hi: [3, 0.6, 1.6] },
    turret: { lo: [-1, 1.6, -1], hi: [1, 2.3, 1], extras: { joint: 'yaw', pivot: [0.2, 1.6, 0] } },
    gun: { lo: [1, 1.9, -0.1], hi: [4.5, 2.1, 0.1], extras: { joint: 'pitch', pivot: [1.0, 2.0, 0], parent: 'turret' } },
  };
  const chunks: Uint8Array[] = [];
  let size = 0;
  const views: object[] = [];
  const accessors: object[] = [];
  const meshes: object[] = [];
  const nodes: { name: string; mesh?: number; children?: number[]; extras?: object }[] = [{ name: 'unit', children: [], extras: { anchor: 'ground' } }];
  const add = (b: Uint8Array) => {
    views.push({ buffer: 0, byteOffset: size, byteLength: b.length });
    chunks.push(b);
    size += (b.length + 3) & ~3;
    if (b.length & 3) chunks.push(new Uint8Array(4 - (b.length & 3)));
    return views.length - 1;
  };
  const mesh = (q: BoxPart) => {
    const { p, i } = box(q.lo, q.hi);
    accessors.push({ bufferView: add(new Uint8Array(p.buffer)), componentType: 5126, count: 8, type: 'VEC3' });
    accessors.push({ bufferView: add(new Uint8Array(i.buffer)), componentType: 5123, count: 36, type: 'SCALAR' });
    meshes.push({ primitives: [{ attributes: { POSITION: accessors.length - 2 }, indices: accessors.length - 1 }] });
    return meshes.length - 1;
  };
  if (Object.keys(dm).length) {
    const di = nodes.push({ name: 'dm', children: [] }) - 1;
    for (const [name, q] of Object.entries(dm)) nodes[di].children!.push(nodes.push({ name: `dm:${name}`, mesh: mesh(q), ...(q.extras ? { extras: q.extras } : {}) }) - 1);
  }
  for (let l = 0; l < 2; l++) {
    const li = nodes.push({ name: `lod${l}`, children: [] }) - 1;
    nodes[0].children!.push(li);
    for (const [name, q] of Object.entries(parts)) {
      const { p, i } = box(q.lo, q.hi);
      accessors.push({ bufferView: add(new Uint8Array(p.buffer)), componentType: 5126, count: 8, type: 'VEC3' });
      accessors.push({ bufferView: add(new Uint8Array(i.buffer)), componentType: 5123, count: 36, type: 'SCALAR' });
      meshes.push({ primitives: [{ attributes: { POSITION: accessors.length - 2 }, indices: accessors.length - 1 }] });
      nodes[li].children!.push(nodes.push({ name, mesh: meshes.length - 1, ...(q.extras ? { extras: q.extras } : {}) }) - 1);
    }
  }
  let js = new TextEncoder().encode(JSON.stringify({ asset: { version: '2.0' }, nodes, meshes, accessors, bufferViews: views, buffers: [{ byteLength: size }] }));
  if (js.length & 3) js = new Uint8Array([...js, ...new Array(4 - (js.length & 3)).fill(32)]);
  const bin = new Uint8Array(size);
  let o = 0;
  for (const c of chunks) {
    bin.set(c, o);
    o += c.length;
  }
  const out = new Uint8Array(12 + 8 + js.length + 8 + bin.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x46546c67, true);
  dv.setUint32(4, 2, true);
  dv.setUint32(8, out.length, true);
  dv.setUint32(12, js.length, true);
  dv.setUint32(16, 0x4e4f534a, true);
  out.set(js, 20);
  dv.setUint32(20 + js.length, bin.length, true);
  dv.setUint32(24 + js.length, 0x004e4942, true);
  out.set(bin, 28 + js.length);
  return out;
}

describe('model pack', () => {
  it('turns a unit file into a jointed mesh figure', () => {
    const m = figureFromModelGlb(syntheticGlb());
    expect(m.parts.map((p) => p.name)).toEqual(['hull', 'gear', 'turret', 'gun']);
    expect(m.parts[2]).toMatchObject({ joint: 'yaw', pivot: [0.2, 1.6, 0] });
    expect(m.parts[3]).toMatchObject({ joint: 'pitch', pivot: [1.0, 2.0, 0], parent: 0 });
    expect(m.lods).toHaveLength(3);
    const t: Template = buildMeshFigure(m);
    expect(t.joints?.map((j) => j.kind)).toEqual(['yaw', 'pitch']);
    expect(t.joints?.[1].parent).toBe(0);
    expect(t.joints?.[0].pivot[1]).toBeCloseTo(1.6, 3);
    // The running gear is drawn in the track colour (the fixed part), the rest takes the team's.
    expect(t.fixed.length / 7).toBe(36);
    expect(t.team.length / 7).toBe(36 * 3);
    // The unit keeps its own origin: the box is the model's, not re-centred.
    expect(t.min[0]).toBeCloseTo(-3, 2);
    expect(t.max[0]).toBeCloseTo(4.5, 2);
    expect(t.coarse?.().triangles).toBeGreaterThan(0);
  });

  it("draws a unit as its own game's model, else another game's model of the same vehicle, else its figure", () => {
    const own = (): Template => ({ team: new Float32Array(0), fixed: new Float32Array(0), min: [0, 0, 0], max: [1, 1, 1], anchor: 'ground', triangles: 0 });
    const catalog: Record<string, { domain: string; cls: string; build: () => Template }> = {
      'm2a4': { domain: 'ground', cls: 'light-tank', build: own },
      't-72b3': { domain: 'ground', cls: 'mbt', build: own },
      mbt: { domain: 'ground', cls: 'mbt', build: own },
    };
    const aliases: Record<string, string> = {
      a_m2a4: 'm2a4',
      a_m2a4_variant: 'm2a4',
      a_t72b3: 't-72b3',
      // Another game's ids of the same vehicles.
      b_t72b3: 't-72b3',
      b_t72b3_own: 't-72b3',
      b_m2a4: 'm2a4',
    };
    const index: ModelPackIndex = {
      version: 1,
      packs: [
        { game: 'gameb', units: { b_t72b3_own: { tag: 'x', name: 'T-72B3' } } },
        {
          game: 'gamea',
          units: {
            a_m2a4_variant: { tag: 'v' },
            a_m2a4: { tag: 'a', name: 'M2A4' },
            a_t72b3: { tag: 't', name: 'T-72B3 mod. 2016' },
            a_new_tank: { tag: 'b', domain: 'ground', type: 'typeMediumTank' },
          },
        },
      ],
    };
    const n = installModelPackIndex(catalog, index, undefined, aliases);
    expect(n).toBe(5);
    // Own models.
    expect(aliases.a_m2a4).toBe(modelVariantName('m2a4', 'gamea', 'a_m2a4'));
    expect(aliases.a_m2a4_variant).toBe('m2a4@model:gamea:a_m2a4_variant');
    expect(aliases.b_t72b3_own).toBe('t-72b3@model:gameb:b_t72b3_own');
    expect(aliases.a_new_tank).toBe('mbt@model:gamea:a_new_tank');
    expect(isOwnModel(aliases.a_m2a4, 'a_m2a4')).toBe(true);
    // Another game's model of the same figure: the shortest id among the units that stand for it.
    expect(aliases.b_m2a4).toBe('m2a4@model:gamea:a_m2a4');
    expect(isOwnModel(aliases.b_m2a4, 'b_m2a4')).toBe(false);
    // The first pack that has a model of the vehicle lends it.
    expect(aliases.b_t72b3).toBe('t-72b3@model:gameb:b_t72b3_own');
    // A real vehicle name the catalogue lacks names the model too.
    expect(aliases[vehicleKey('T-72B3 mod. 2016')]).toBe('t-72b3@model:gamea:a_t72b3');
    expect(aliases[vehicleKey('T-72B3')]).toBe('t-72b3@model:gameb:b_t72b3_own');
    expect(catalog[aliases.a_m2a4]).toBeDefined();
    removeFigurePack(catalog);
    expect(aliases.a_m2a4).toBe('m2a4');
    expect(aliases.b_m2a4).toBe('m2a4');
    expect(aliases[vehicleKey('T-72B3 mod. 2016')]).toBeUndefined();
    expect(catalog['m2a4@model:gamea:a_m2a4']).toBeUndefined();
  });

  it('finds a stand-in figure by the type word when the unit has no alias', () => {
    const figs: Record<string, { domain: string; cls: string }> = {
      'light-tank': { domain: 'ground', cls: 'light-tank' },
      mbt: { domain: 'ground', cls: 'mbt' },
      'ww2-fighter': { domain: 'air', cls: 'ww2-fighter' },
      destroyer: { domain: 'sea', cls: 'destroyer' },
      'transport-helicopter': { domain: 'heli', cls: 'heli-transport' },
      'attack-helicopter': { domain: 'heli', cls: 'heli-attack' },
      'drone-fixed': { domain: 'air', cls: 'drone-fixed' },
      'f-15c': { domain: 'air', cls: 'fighter' },
    };
    const entry = (n: string) => figs[n];
    expect(kinFor('a', { tag: '', domain: 'ground', type: 'typeLightTank' }, entry, {})).toBe('light-tank');
    expect(kinFor('a', { tag: '', domain: 'air', type: 'typeFighter' }, entry, {})).toBe('ww2-fighter');
    expect(kinFor('a', { tag: '', domain: 'sea', type: 'typeDestroyer' }, entry, {})).toBe('destroyer');
    // A helicopter is never a fighter's kin, whichever way its game words it (War Thunder: kind helicopter, type
    // typeFighter; Reforger: domain air, kind heli-transport; DCS: domain heli).
    expect(kinFor('a', { tag: '', domain: 'air', kind: 'helicopter', type: 'typeFighter' }, entry, {})).toBe('transport-helicopter');
    expect(kinFor('a', { tag: '', domain: 'air', kind: 'heli-transport', type: 'heli-transport helicopter' }, entry, {})).toBe('transport-helicopter');
    expect(kinFor('a', { tag: '', domain: 'heli', kind: 'heli-attack', type: 'heli-attack helicopter' }, entry, {})).toBe('attack-helicopter');
    expect(kinFor('a', { tag: '', domain: 'air', kind: 'uav', type: 'uav' }, entry, {})).toBe('drone-fixed');
    // Its alias is taken only when that figure is of its side.
    expect(kinFor('mi8', { tag: '', domain: 'heli', kind: 'heli-transport' }, entry, { mi8: 'f-15c' })).toBe('transport-helicopter');
    expect(kinFor('f15', { tag: '', domain: 'air', kind: 'fighter' }, entry, { f15: 'f-15c' })).toBe('f-15c');
    // Static objects and items stand for no unit.
    expect(kinFor('barrier', { tag: '', domain: 'ground', kind: 'static', type: 'static' }, entry, {})).toBeNull();
    expect(kinFor('knife', { tag: '', domain: 'item', kind: 'knife' }, entry, {})).toBeNull();
  });

  it('tells the sides apart: helicopters, aircraft, drones, ground, sea', () => {
    expect(packSide({ domain: 'air', kind: 'helicopter', type: 'typeFighter' })).toBe('heli');
    expect(packSide({ domain: 'air', kind: 'fighter' })).toBe('air');
    expect(packSide({ domain: 'air', kind: 'uav' })).toBe('drone');
    expect(packSide({ domain: 'ground', kind: 'static' })).toBe('static');
    expect(sidesMeet('heli', 'air')).toBe(false);
    expect(sidesMeet('air', 'heli')).toBe(false);
    expect(sidesMeet('drone', 'air')).toBe(false);
    expect(sidesMeet('heli', 'air', 'tiltrotor')).toBe(true);
    expect(sidesMeet('static', 'ground')).toBe(false);
  });

  it("lends another game's model only to a unit of its side, on that unit's own figure", () => {
    const own = (): Template => ({ team: new Float32Array(0), fixed: new Float32Array(0), min: [0, 0, 0], max: [1, 1, 1], anchor: 'ground', triangles: 0 });
    const catalog: Record<string, { domain: string; cls: string; build: () => Template }> = {
      'mi-8mtv2': { domain: 'heli', cls: 'heli-transport', build: own },
      'transport-helicopter': { domain: 'heli', cls: 'heli-transport', build: own },
      'ww2-fighter': { domain: 'air', cls: 'ww2-fighter', build: own },
      typhoon: { domain: 'air', cls: 'multirole', build: own },
      truck: { domain: 'ground', cls: 'truck', build: own },
    };
    const aliases: Record<string, string> = { 'mi-8mt': 'mi-8mtv2', typhoon: 'typhoon', container_20ft: 'truck' };
    const index: ModelPackIndex = {
      version: 1,
      packs: [
        {
          game: 'gamer',
          units: {
            // A helicopter its game words as an aircraft.
            mi8mt_armed: { tag: 'a', domain: 'air', kind: 'heli-transport', type: 'heli-transport helicopter', name: 'Mi-8MT' },
            // A truck called like a fighter.
            typhoon_truck: { tag: 'b', domain: 'ground', kind: 'truck', type: 'truck', name: 'Typhoon' },
            // A static object.
            container_20ft_x: { tag: 'c', domain: 'ground', kind: 'static', type: 'static', name: 'Container_20ft' },
          },
        },
      ],
    };
    installModelPackIndex(catalog, index, undefined, aliases);
    // Its own variant sits on a helicopter's figure, and another game's Mi-8MT gets the model on its own figure.
    expect(aliases.mi8mt_armed).toBe('transport-helicopter@model:gamer:mi8mt_armed');
    expect(aliases['mi-8mt']).toBe('mi-8mtv2@model:gamer:mi8mt_armed');
    expect(catalog[aliases['mi-8mt']]?.domain).toBe('heli');
    // The truck's model is no fighter's.
    expect(aliases.typhoon).toBe('typhoon');
    // The static object is not installed at all.
    expect(aliases.container_20ft_x).toBeUndefined();
    expect(aliases.container_20ft).toBe('truck');
    removeFigurePack(catalog);
    expect(aliases['mi-8mt']).toBe('mi-8mtv2');
    expect(catalog['mi-8mtv2@model:gamer:mi8mt_armed']).toBeUndefined();
  });

  it("keeps antennas out of the figure size and folds an aircraft's landing gear on its own joint", () => {
    const m = figureFromModelGlb(
      syntheticGlb({
        hull: { lo: [-5, 1, -1], hi: [5, 3, 1] },
        aerial: { lo: [0, 3, -0.01], hi: [0.02, 6, 0.01] },
        gear: { lo: [-1, 0, -1], hi: [1, 1, 1], extras: { retract: true, pivot: [0, 1, 0] } },
      }),
    );
    expect(m.parts.map((p) => p.name)).toEqual(['hull', 'aerial', 'gear']);
    expect(m.parts[2]).toMatchObject({ joint: 'gear', pivot: [0, 1, 0] });
    expect(m.box[4]).toBeCloseTo(6, 3);
    expect(m.bounds?.[4]).toBeCloseTo(3, 3);
    const t = buildMeshFigure(m);
    expect(t.max[1]).toBeCloseTo(3, 2);
    expect(t.joints?.map((j) => j.kind)).toEqual(['gear']);
    // A ground unit's gear stays running gear in the track colour, on no joint.
    const g = figureFromModelGlb(syntheticGlb());
    expect(g.parts[1]).toMatchObject({ name: 'gear', track: true });
  });

  it('reads hit regions of every game: direction zones, pieces, hit zones by thickness', () => {
    const plates = platesFromModelGlb(
      syntheticGlb(undefined, {
        turret_front: { lo: [0, 1.6, -1], hi: [1, 2.3, 1], extras: { part: 'turret', group: 'zone', zone: 'front', hp: 1000, shield: 175 } },
        piece3: { lo: [-3, 0.4, -1.5], hi: [-2, 1, -1], extras: { part: 'hull', group: 'piece', hp: 100, material: 'Main' } },
        armour_armor_5mm: { lo: [-3, 0.4, -1.5], hi: [3, 1.6, 1.5], extras: { part: 'armor_5mm', group: 'armour', material: 'armor_5mm', thickness: 5 } },
      }),
    );
    expect(plates.map((p) => [p.name, p.part, p.group, p.zone ?? null, p.mm ?? null])).toEqual([
      ['turret_front', 'turret', 'zone', 'front', null],
      ['piece3', 'hull', 'piece', null, null],
      ['armour_armor_5mm', 'hull', 'armour', null, 5],
    ]);
    expect(plates[0].hp).toBe(1000);
  });
});
