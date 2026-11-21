import { describe, expect, it } from 'vitest';
import { figureFromModelGlb, isOwnModel, kinFor, modelVariantName, vehicleKey, type ModelPackIndex } from './modelpack';
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

/** A synthetic unit file in the pack layout: a hull, running gear, a turret and a gun, at two levels of detail. */
function syntheticGlb(): Uint8Array {
  const parts: Record<string, { lo: number[]; hi: number[]; extras?: object }> = {
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
    const has = (n: string) => ['light-tank', 'mbt', 'ww2-fighter', 'destroyer'].includes(n);
    expect(kinFor('a', { tag: '', domain: 'ground', type: 'typeLightTank' }, has, {})).toBe('light-tank');
    expect(kinFor('a', { tag: '', domain: 'air', type: 'typeFighter' }, has, {})).toBe('ww2-fighter');
    expect(kinFor('a', { tag: '', domain: 'sea', type: 'typeDestroyer' }, has, {})).toBe('destroyer');
  });
});
