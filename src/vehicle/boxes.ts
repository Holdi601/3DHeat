/**
 * World of Tanks' struck points on a figure.
 *
 * The game sends each point as a collision component and where in that
 * component's bounding box the shell went in and where its path ended, 8
 * bits an axis (`exporters/ext/wot-replay`: `stream.hit_point`). Checked
 * against the attacker's bearing on the test replays (`hitW` against the
 * attacker being ahead: correlation 0.66-0.80 for components 0, 4, 5, 6;
 * `hitU` against being to the right: 0.75-0.83): u runs to the vehicle's
 * right, v up, w forward. Components 0, 1, 4, 5 and 6 keep the hull's
 * frame; 2 and 3 (fewer hits, and as well or better in the turret's frame)
 * are read as the turret and the gun, in the turret's own frame - the
 * figure's turret faces forward, so a hit on the turret's left cheek is
 * drawn on the figure's turret's left cheek, however the turret stood.
 *
 * The boxes themselves are the game's (its vehicles' collision models,
 * which are not in a replay and not on this machine), so the point is put
 * in the matching part of the figure's own box - the hull the lower seven
 * tenths at full length and width, the turret a box round the figure's
 * middle above the hull, the gun a thin box ahead of it - and the surface
 * snap (`surface.ts`) puts it on the figure. Approximate by its nature: the
 * part and the side are right; a few tenths of a metre are not.
 */

import type { Vec3 } from '../race/geometry';
import type { VehicleHit } from './hits';

/** A box in the figure's frame: least and most corner. */
interface Box {
  min: Vec3;
  max: Vec3;
  /** Turns with the turret, about a vertical axis through x = pivot. */
  turret: boolean;
}

export type ComponentRole = 'chassis' | 'hull' | 'turret' | 'gun';

/** What each component index is read as (see the module note). */
export function roleOf(component: number): ComponentRole {
  if (component === 0) return 'chassis';
  if (component === 2) return 'turret';
  if (component === 3) return 'gun';
  return 'hull';
}

function boxOf(role: ComponentRole, min: Vec3, max: Vec3): Box {
  const L = max[0] - min[0], H = max[1] - min[1], W = max[2] - min[2];
  const cx = (min[0] + max[0]) / 2, cz = (min[2] + max[2]) / 2;
  switch (role) {
    case 'chassis':
      return { min: [min[0], min[1], min[2]], max: [max[0], min[1] + 0.4 * H, max[2]], turret: false };
    case 'hull':
      return { min: [min[0], min[1], min[2]], max: [max[0], min[1] + 0.7 * H, max[2]], turret: false };
    case 'turret':
      return { min: [cx - 0.3 * L, min[1] + 0.55 * H, cz - 0.42 * W], max: [cx + 0.22 * L, max[1], cz + 0.42 * W], turret: true };
    case 'gun':
      return { min: [cx + 0.2 * L, min[1] + 0.68 * H, cz - 0.05 * W], max: [max[0], min[1] + 0.86 * H, cz + 0.05 * W], turret: true };
  }
}

/**
 * A point in a component's box (u right, v up, w forward; 0..1) in the
 * figure's frame; with `turret`, a turret or gun point turned by that yaw
 * (to draw it on a figure whose turret is turned the same way).
 */
export function boxPoint(component: number, uvw: Vec3, min: Vec3, max: Vec3, turret: number | null = null): Vec3 {
  const b = boxOf(roleOf(component), min, max);
  const x = b.min[0] + uvw[2] * (b.max[0] - b.min[0]);
  const y = b.min[1] + uvw[1] * (b.max[1] - b.min[1]);
  const z = b.min[2] + uvw[0] * (b.max[2] - b.min[2]);
  if (!b.turret || !turret) return [x, y, z];
  // The turret turns about its middle; + yaw is to the right (forward towards +z).
  const px = (b.min[0] + b.max[0]) / 2 - (b.max[0] - b.min[0]) * 0.1;
  const pz = (min[2] + max[2]) / 2;
  const a = x - px, c = z - pz;
  const cos = Math.cos(turret), sin = Math.sin(turret);
  return [px + a * cos - c * sin, y, pz + a * sin + c * cos];
}

const placed = new WeakMap<VehicleHit[], { key: string; out: VehicleHit[] }>();

/** The hits with their component points placed on a figure of the given box (the same array when none has a box). */
export function placeBoxHits(hits: VehicleHit[], min: Vec3, max: Vec3): VehicleHit[] {
  if (!hits.some((h) => h.box)) return hits;
  const key = `${min.join(',')}|${max.join(',')}`;
  const c = placed.get(hits);
  if (c && c.key === key) return c.out;
  const out = hits.map((h) => {
    if (!h.box) return h;
    const b = h.box;
    return {
      ...h,
      // The figure's turret faces forward: turret and gun points stay in the turret's frame.
      local: boxPoint(b.component, b.entry, min, max),
      exit: b.exit ? boxPoint(b.component, b.exit, min, max) : null,
    };
  });
  placed.set(hits, { key, out });
  return out;
}
