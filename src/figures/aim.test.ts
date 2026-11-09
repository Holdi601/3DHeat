import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import type { Template } from './kit';
import { aimOf, lerpAngle } from './aim';
import { articulate, expand, InstanceBatches, meshOf, MESH_STRIDE, NO_PITCH } from './instances';
import { VertexBuffer } from '../race/geometry';
import { figureGlslVs, figureWgsl } from '../render/figureShaders';
import { packAim, unpackAim } from '../render/gpuTracks/store';

/** A turret on a hull: a yaw joint at the ring, a gun on it raised about its trunnion. One vertex each at the hull, the turret and the muzzle. */
function turretTemplate(): Template {
  const v = (x: number, y: number, z: number) => [x, y, z, 0.5, 0.5, 0.5, 1];
  const fixed = Float32Array.from([...v(-2, 0.5, 0), ...v(1, 1.2, 0.5), ...v(3, 1.5, 0)]);
  const fixedN = Float32Array.from([0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0]);
  return {
    team: new Float32Array(0),
    fixed,
    fixedN,
    teamN: new Float32Array(0),
    min: [-2, 0, -1],
    max: [3, 2, 1],
    anchor: 'ground',
    triangles: 1,
    joints: [
      { kind: 'yaw', pivot: [0, 1, 0], parent: -1, rest: 0 },
      { kind: 'pitch', pivot: [0.5, 1.5, 0], parent: 0, rest: 0, pitch: 0.1 },
    ],
    fixedJ: Uint8Array.from([0, 1, 2]),
    teamJ: new Uint8Array(0),
  } as Template;
}

describe('turrets that turn and guns that rise', () => {
  it('moves a muzzle about the trunnion, then round with the turret', () => {
    const m = meshOf(turretTemplate()).data;
    const out = [0, 0, 0];
    const muzzle = 2 * MESH_STRIDE;
    // As built: nothing moves (the elevation it was built at is 0.1).
    articulate(m, muzzle, 3, 1.5, 0, 0, NO_PITCH, true, out);
    expect(out).toEqual([3, 1.5, 0]);
    articulate(m, muzzle, 3, 1.5, 0, 0, 0.1, true, out);
    expect(out[0]).toBeCloseTo(3);
    expect(out[1]).toBeCloseTo(1.5);
    // Turned 90 degrees right: the muzzle 3 m to the right of the ring.
    articulate(m, muzzle, 3, 1.5, 0, Math.PI / 2, 0.1, true, out);
    expect(out[0]).toBeCloseTo(0);
    expect(out[2]).toBeCloseTo(3);
    // Raised 30 degrees past as built, then turned right.
    const a = Math.PI / 6;
    articulate(m, muzzle, 3, 1.5, 0, Math.PI / 2, 0.1 + a, true, out);
    expect(out[1]).toBeCloseTo(1.5 + 2.5 * Math.sin(a));
    expect(out[2]).toBeCloseTo(0.5 + 2.5 * Math.cos(a));
    expect(out[0]).toBeCloseTo(0);
    // The turret's own vertex turns, not rises; the hull's stays.
    articulate(m, MESH_STRIDE, 1, 1.2, 0.5, Math.PI, 0.6, true, out);
    expect(out).toEqual([expect.closeTo(-1), expect.closeTo(1.2), expect.closeTo(-0.5)]);
    articulate(m, 0, -2, 0.5, 0, Math.PI, 0.6, true, out);
    expect(out).toEqual([-2, 0.5, 0]);
  });

  it('draws the same on the CPU as the instance says', () => {
    const mesh = meshOf(turretTemplate());
    const b = new InstanceBatches();
    b.add(mesh, { o: [10, 0, 0], f: [1, 0, 0], u: [0, 1, 0], r: [0, 0, 1] }, 1, [1, 0, 0], 1, Math.PI / 2, 0.1);
    const out = new VertexBuffer();
    expand(b.list[0], out);
    // The muzzle (third vertex) 3 m right of the ring, which sits at x 10.
    expect(out.data[14]).toBeCloseTo(10);
    expect(out.data[16]).toBeCloseTo(3);
  });

  it('has shaders that move the parts', () => {
    expect(figureGlslVs()).toContain('articulate(aPos, iUp.w, iTeam.w, true)');
    expect(figureGlslVs()).toContain('layout(location = 10) in vec4 aArt2');
    expect(figureWgsl()).toContain('@location(10) art2');
  });

  it('interpolates angles the short way round', () => {
    expect(lerpAngle(3, -3, 0.5)).toBeCloseTo(Math.PI, 2);
    expect(lerpAngle(0.1, 0.3, 0.5)).toBeCloseTo(0.2);
    expect(lerpAngle(NaN, 1, 0.5)).toBe(1);
  });

  it('packs an aim into a key and back', () => {
    const [y, p] = unpackAim(packAim(-2.5, 0.3));
    expect(y).toBeCloseTo(-2.5, 3);
    expect(p).toBeCloseTo(0.3, 3);
    const [y2, p2] = unpackAim(packAim(NaN, NaN));
    expect(Number.isNaN(y2) && Number.isNaN(p2)).toBe(true);
  });
});

function tanks(cols: Record<string, number[]>, times: number[]): Dataset {
  const n = times.length;
  const attrs: AttributeColumn[] = Object.entries(cols).map(([name, v]) => ({ name, kind: 'number', data: Float32Array.from(v), min: 0, max: 1 }) as AttributeColumn);
  return {
    count: n,
    time: Float32Array.from(times),
    personId: new Uint32Array(n),
    personLabels: ['T'],
    timeSorted: true,
    attrs,
  } as unknown as Dataset;
}

describe('aim from the data', () => {
  it('reads War Thunder degrees and interpolates between rows', () => {
    const d = tanks({ turretYaw: [170, -170, NaN], gunPitch: [0, 10, NaN] }, [0, 1, 2]);
    const aim = aimOf(d)!;
    const now = { yaw: 0, pitch: 0 };
    aim.at(0, 0.5, now);
    expect(Math.abs(now.yaw)).toBeCloseTo(Math.PI, 3);
    expect(now.pitch).toBeCloseTo((5 * Math.PI) / 180);
    // A row without an aim keeps the last.
    aim.at(2, 2, now);
    expect(now.yaw).toBeCloseTo((-170 * Math.PI) / 180);
  });

  it('reads World of Tanks radians and gun steps', () => {
    const d = tanks({ turretYaw: [0.5, 0.5], gunStep: [0, 63] }, [0, 1]);
    const now = { yaw: 0, pitch: 0 };
    aimOf(d)!.at(0, 0, now);
    expect(now.yaw).toBeCloseTo(0.5);
    expect(now.pitch).toBeCloseTo((20 * Math.PI) / 180);
    aimOf(d)!.at(1, 1, now);
    expect(now.pitch).toBeCloseTo((-8 * Math.PI) / 180);
  });

  it('has none where the data has no turret', () => {
    expect(aimOf(tanks({ speed: [1] }, [0]))).toBeNull();
  });

  it('keeps the turret and the view apart, the turret from the view only where a vehicle has no turret rows', () => {
    // Two tanks heading east (90 degrees); the first has its turret, the second only where its player looks.
    const d = {
      ...tanks({ turretYaw: [10, NaN], gunPitch: [2, NaN], aimHeading: [150, 120], aimPitch: [5, 4] }, [0, 0]),
      personId: Uint32Array.of(0, 1),
      personLabels: ['A', 'B'],
      yaw: Float32Array.of(Math.PI / 2, Math.PI / 2),
      pitch: new Float32Array(2),
    } as Dataset;
    const aim = aimOf(d)!;
    const now = { yaw: 0, pitch: 0 };
    const deg = (v: number) => (v * Math.PI) / 180;
    // The first's turret by its own column, not by where its player looks (60 degrees right of the hull).
    aim.at(0, 0, now);
    expect(now.yaw).toBeCloseTo(deg(10));
    expect(now.pitch).toBeCloseTo(deg(2));
    aim.view!.at(0, 0, now);
    expect(now.yaw).toBeCloseTo(deg(60));
    // The second's turret from its view, marked so.
    aim.at(1, 0, now);
    expect(now.yaw).toBeCloseTo(deg(30));
    expect(now.pitch).toBeCloseTo(deg(4));
    expect(Array.from(aim.derived!)).toEqual([0, 1]);
    // `viewYaw` before the older `aimHeading`.
    const v = aimOf({ ...d, attrs: [...d.attrs, { name: 'viewYaw', kind: 'number', data: Float32Array.of(100, 100), min: 0, max: 1 } as AttributeColumn] } as Dataset)!;
    v.view!.at(1, 0, now);
    expect(now.yaw).toBeCloseTo(deg(10));
  });
});
