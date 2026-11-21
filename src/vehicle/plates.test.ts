import { describe, expect, it } from 'vitest';
import { HitPart } from '../figures/snap';
import { hitPartSide, partSide, platesOfHits, type Plate } from './plates';
import type { VehicleHit } from './hits';

/** A flat square region facing one way: two triangles on the plane `axis` = `at`, spanning -1..1 on the others. */
function face(name: string, part: string, axis: number, at: number, extra: Partial<Plate> = {}): Plate {
  const o = [0, 1, 2].filter((a) => a !== axis);
  const corner = (u: number, v: number) => {
    const p = [0, 0, 0];
    p[axis] = at;
    p[o[0]] = u;
    p[o[1]] = v;
    return p;
  };
  const tris = new Float32Array([...corner(-1, -1), ...corner(1, -1), ...corner(1, 1), ...corner(-1, -1), ...corner(1, 1), ...corner(-1, 1)]);
  return { name, part, mm: null, cls: '', group: 'zone', zone: name.split('_')[1] ?? '', hp: 1000, tris, min: [-1, -1, -1], max: [1, 1, 1], ...extra };
}

const hit = (id: number, local: [number, number, number]) => ({ id, local, part: null }) as unknown as VehicleHit;

describe('hit regions', () => {
  it("puts a hit on the direction zone whose face is nearest, where a part's zones share one box", () => {
    const list = [face('hull_front', 'hull', 0, 1), face('hull_rear', 'hull', 0, -1), face('hull_top', 'hull', 1, 1), face('hull_left', 'hull', 2, -1)];
    const at = platesOfHits([hit(1, [0.95, 0, 0]), hit(2, [-0.9, 0.1, 0]), hit(3, [0, 0.97, 0.2]), hit(4, [0.1, 0, -0.99])], list, null);
    expect([1, 2, 3, 4].map((id) => list[at.get(id)!].name)).toEqual(['hull_front', 'hull_rear', 'hull_top', 'hull_left']);
  });

  it("tells the turret from the hull by the region's model part, whatever the game calls it", () => {
    const list = [face('bashnya', 'turret', 1, 1), face('Engine_01', 'hull', 0, 1), face('gun_front', 'gun', 0, 1)];
    expect(hitPartSide('bashnya', list)).toBe(HitPart.Turret);
    expect(hitPartSide('Engine_01', list)).toBe(HitPart.Hull);
    expect(hitPartSide('gun_front', null)).toBe(HitPart.Turret);
    expect(hitPartSide('hull_left', null)).toBe(HitPart.Hull);
    expect(partSide('turret.2')).toBe(HitPart.Turret);
    expect(partSide('gear')).toBe(HitPart.Hull);
  });
});
