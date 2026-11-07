import { describe, expect, it } from 'vitest';
import { VertexBuffer, type Frame3 } from '../race/geometry';
import { extent, finish, newKit } from './kit';
import { outlineBody, slab, triangulate, type P2 } from './parts';
import { buildGround, type GroundSpec } from './ground';
import { buildFixedWing, buildHeli, type FixedWingSpec, type HeliSpec } from './air';
import { buildNaval } from './naval';
import { buildAirship, buildDrone, buildEmplacement, buildRide, buildWalker } from './small';

const LOCAL: Frame3 = { o: [0, 0, 0], f: [1, 0, 0], r: [0, 0, 1], u: [0, 1, 0] };

function bounds(out: VertexBuffer): { min: number[]; max: number[] } {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < out.count; i++) {
    for (let c = 0; c < 3; c++) {
      min[c] = Math.min(min[c], out.data[i * 7 + c]);
      max[c] = Math.max(max[c], out.data[i * 7 + c]);
    }
  }
  return { min, max };
}

describe('outline parts', () => {
  it('lofts a body whose silhouettes match its side profile and plan', () => {
    const out = new VertexBuffer();
    outlineBody(out, LOCAL, { top: [[-3, 0.5], [0, 1.2], [3, 0.2]], bottom: [[-3, -0.2], [3, -0.4]], plan: [[-3, 0.3], [-1, 0.9], [3, 0.1]], round: 4 }, [1, 1, 1]);
    const b = bounds(out);
    expect(b.min[0]).toBeCloseTo(-3, 5);
    expect(b.max[0]).toBeCloseTo(3, 5);
    expect(b.max[1]).toBeCloseTo(1.2, 1);
    expect(b.max[2]).toBeCloseTo(0.9, 1);
    expect(b.min[2]).toBeCloseTo(-0.9, 1);
  });

  it('triangulates a concave planform without losing area', () => {
    // A cranked delta with a LERX: concave where the strake meets the wing.
    const poly: P2[] = [[6, 0], [5, 0.6], [2, 1.0], [0, 1.6], [-2, 5], [-3.5, 5], [-4, 1.6], [-4, 0]];
    const area = (p: P2[]) => Math.abs(p.reduce((s, [x0, y0], i) => s + x0 * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * y0, 0)) / 2;
    const tris = triangulate(poly);
    expect(tris.length).toBe(poly.length - 2);
    const sum = tris.reduce((s, [a, b, c]) => s + area([poly[a], poly[b], poly[c]]), 0);
    expect(sum).toBeCloseTo(area(poly), 6);
  });

  it('lays a slab on the surface its map gives', () => {
    const out = new VertexBuffer();
    slab(out, LOCAL, [[0, 0], [1, 0], [1, 2], [0, 2]], (a, b) => [a, b, 0.5 + b * 0.1], [0, 0, 1], 0.1, [1, 1, 1]);
    const b = bounds(out);
    expect(b.max[2]).toBeCloseTo(2, 5);
    expect(b.max[1]).toBeCloseTo(0.5 + 0.2 + 0.05, 5);
  });
});

describe('ground builder features', () => {
  const tank: GroundSpec = { chassis: 'tracked', length: 7, width: 3.5, hullHeight: 1.6, roadWheels: 6 };

  it('stands every new chassis on the ground', () => {
    for (const chassis of ['trailer', 'pedestal', 'rail', 'hover'] as const) {
      const t = buildGround({ chassis, length: 8, width: 3, hullHeight: 1.4, outriggers: true, boiler: chassis === 'rail' ? { length: 4, diameter: 1.6 } : undefined });
      expect(t.min[1], chassis).toBeGreaterThan(-0.05);
      expect(t.triangles, chassis).toBeGreaterThan(10);
    }
  });

  it('draws a turret from its outline, wider and longer than its box would be', () => {
    const plain = buildGround({ ...tank, turret: { x: 0, length: 3, width: 2.4, height: 0.8 } });
    const outlined = buildGround({ ...tank, turret: { x: 0, length: 3, width: 2.4, height: 0.8, outline: { plan: [[-1.5, 1.2], [1.0, 1.5], [2.2, 0.4]], top: [[-1.5, 0.8], [2.2, 0.4]], bottom: [[-1.5, 0], [2.2, 0]], round: 8 } } });
    expect(extent(outlined).width).toBeGreaterThanOrEqual(extent(plain).width - 1e-6);
    expect(outlined.max[0]).toBeGreaterThan(2.1);
  });

  it('follows a hull outline and a track profile', () => {
    const t = buildGround({ ...tank, hullOutline: { top: [[-3.5, 1.5], [3.5, 1.0]], bottom: [[-3.5, 0.8], [3.5, 0.8]], plan: [[-3.5, 1.75], [3.5, 1.75]], round: 10 }, trackProfile: [[-3, 0], [3, 0], [3.6, 0.6], [3.3, 0.9], [-3.3, 0.9], [-3.6, 0.6]] });
    expect(t.max[0]).toBeCloseTo(3.6, 1);
    expect(t.max[1]).toBeCloseTo(1.5, 1);
  });

  it('adds extra turrets, sponsons, pods and rail missiles', () => {
    const base = buildGround(tank).triangles;
    const multi = buildGround({ ...tank, turret: { x: 0, length: 2, width: 2, height: 0.8 }, turrets: [{ x: 2, length: 1, width: 1, height: 0.6, shape: 'cylinder' }], guns: [{ mount: 'turret', turret: 1, length: 1, calibre: 0.01 }, { mount: 'sponson', both: true, length: 1, calibre: 0.05 }] }).triangles;
    expect(multi).toBeGreaterThan(base);
    const pod = buildGround({ ...tank, missiles: [{ mount: 'hull', rows: 2, cols: 3, length: 4, diameter: 0.3, pod: true, elevation: 0.5 }] });
    const rail = buildGround({ ...tank, missiles: [{ mount: 'hull', rows: 1, cols: 1, length: 6, diameter: 0.5, rail: true, elevation: 0.5 }] });
    expect(pod.max[1]).toBeGreaterThan(tank.hullHeight + 1);
    expect(rail.max[1]).toBeGreaterThan(tank.hullHeight + 1.5);
  });

  it('puts radars on a lattice tower at their height', () => {
    const t = buildGround({ chassis: 'static', length: 6, width: 6, hullHeight: 1, radars: [{ kind: 'peel', x: 0, up: 20, size: 8, height: 3, mast: 'tower' }] });
    expect(t.max[1]).toBeGreaterThan(21);
    expect(extent(t).width).toBeGreaterThan(7.5);
  });
});

describe('air builder features', () => {
  const jet: FixedWingSpec = { length: 15, span: 10, height: 4.5, bodyWidth: 1.6, bodyHeight: 1.6, wing: { x: -1, span: 10, rootChord: 4, tipChord: 1.2, sweep: 40 }, tail: { kind: 'single', finHeight: 2.5, finChord: 3, tailSpan: 5, tailChord: 2 } };

  it('draws a planform wing to its span and fins with cant', () => {
    const t = buildFixedWing({ ...jet, wingPlan: [[3, 0], [2, 1.0], [-2, 6], [-3, 6], [-3.5, 0]], finPlan: [[-4, 0], [-7, 0], [-7.4, 2.5], [-6.2, 2.5]], tail: { ...jet.tail, kind: 'twin', spacing: 3, cant: 20 } });
    expect(extent(t).width).toBeCloseTo(12, 1);
  });

  it('adds a glove, booms, a rotodome, fixed gear, floats and extra wings', () => {
    const base = buildFixedWing(jet).triangles;
    for (const extra of [{ wing: { ...jet.wing, glove: { span: 4, chord: 3 } } }, { booms: { x: 2, spacing: 4, diameter: 0.8 } }, { rotodome: { x: -2, diameter: 6 } }, { fixedGear: true }, { floats: true }, { extraWings: [{ ...jet.wing, mount: 1 }] }]) {
      expect(buildFixedWing({ ...jet, ...extra }).triangles).toBeGreaterThan(base);
    }
    const dome = buildFixedWing({ ...jet, rotodome: { x: -2, diameter: 6 } });
    expect(dome.max[1]).toBeGreaterThan(1.5);
  });

  it('builds a helicopter from its fuselage outline with drooping stubs', () => {
    const heli: HeliSpec = { length: 16, rotor: 16, height: 5, bodyWidth: 1.8, bodyHeight: 2, cabin: 'tandem', blades: 5, fuselage: { top: [[8, 0], [0, 1.2], [-8, 0.6]], bottom: [[8, -0.5], [0, -1.1], [-8, 0.2]], plan: [[8, 0.2], [0, 0.9], [-8, 0.2]] }, stubs: { span: 6, pylons: 2 }, stubAt: [0, 0, 12], finPlan: [[-7, 0], [-8, 0], [-8.6, 2], [-7.8, 2]] };
    const t = buildHeli(heli);
    expect(t.triangles).toBeGreaterThan(200);
    expect(extent(t).width).toBeGreaterThan(15);
  });
});

describe('naval, small and generic figures', () => {
  it('builds carriers with an angled deck and a ski jump, cells, radars and a sub with its deck gun', () => {
    const plain = buildNaval({ length: 300, beam: 35, freeboard: 16, hull: 'carrier' });
    const kuz = buildNaval({ length: 300, beam: 35, freeboard: 16, hull: 'carrier', angled: true, skiJump: true });
    expect(kuz.triangles).toBeGreaterThan(plain.triangles);
    const ship = buildNaval({ length: 150, beam: 18, freeboard: 7, launchers: [{ x: 40, length: 12, width: 8 }], radars: [{ x: 10, up: 20, kind: 'faces', size: 4 }], turrets: [{ x: 60, size: 6, barrels: 2, length: 8, calibre: 0.13, kind: 'box' }], helideck: true });
    expect(ship.triangles).toBeGreaterThan(100);
    const sub = buildNaval({ length: 67, beam: 6.2, freeboard: 0, hull: 'submarine', turrets: [{ x: 14, size: 1.4, barrels: 1, length: 3.5, calibre: 0.088 }] });
    expect(sub.max[1]).toBeGreaterThan(3);
  });

  it('builds riders, emplacements, drones, airships and the generic walker', () => {
    for (const t of [buildRide({ kind: 'motorcycle', length: 2.2, width: 0.8 }), buildRide({ kind: 'horse', length: 2.4, width: 0.65 }), buildEmplacement({ kind: 'mg' }), buildEmplacement({ kind: 'searchlight' }), buildDrone({ rotors: 4, span: 0.5 }), buildAirship({ length: 200, diameter: 24, gondolas: 2 }), buildWalker(8)]) {
      expect(t.triangles).toBeGreaterThan(10);
      expect(t.triangles).toBeLessThan(12000);
    }
    expect(extent(buildWalker(8)).height).toBeGreaterThan(6);
    expect(extent(buildWalker(8)).height).toBeLessThanOrEqual(8);
  });

  it('keeps an empty kit sane', () => {
    expect(finish(newKit(), 'ground').triangles).toBe(0);
  });
});
