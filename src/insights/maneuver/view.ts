/**
 * Where the camera looks when a maneuver is picked (`ui/insights/Maneuvers.tsx`):
 * fitted to the ways of the units that made it over its time, with the
 * others' - the enemy, the missile - where they come near. Kept apart from
 * the panel so it is tested on its own.
 */

import type { Maneuver } from './types';

/** Metres the view shows at least around a maneuver: an aircraft's turn, a tank platoon's ground. */
const MIN_VIEW_M = { air: 600, ground: 80, sea: 600, infantry: 25 } as const;

/** A box around points, grown point by point. */
class Box {
  x0 = Infinity;
  y0 = Infinity;
  z0 = Infinity;
  x1 = -Infinity;
  y1 = -Infinity;
  z1 = -Infinity;
  add([x, y, z]: [number, number, number]): void {
    this.x0 = Math.min(this.x0, x);
    this.x1 = Math.max(this.x1, x);
    this.y0 = Math.min(this.y0, y);
    this.y1 = Math.max(this.y1, y);
    this.z0 = Math.min(this.z0, z);
    this.z1 = Math.max(this.z1, z);
  }
  get empty(): boolean {
    return !(this.x1 >= this.x0);
  }
  get c(): [number, number, number] {
    return [(this.x0 + this.x1) / 2, (this.y0 + this.y1) / 2, (this.z0 + this.z1) / 2];
  }
  get r(): number {
    return 0.6 * Math.max(this.x1 - this.x0, this.y1 - this.y0, this.z1 - this.z0);
  }
}

/** How far from the maneuver the others' ways still count for the view, in its own sizes: a shooter far off is named, not fitted. */
const OTHERS_WITHIN = 2.5;

/**
 * The ball the camera is fitted to: the ways of the units that made the
 * maneuver over its time, with the others' (the enemy, the missile) where
 * they come within `OTHERS_WITHIN` of its size - a little room around, at
 * least the domain's `MIN_VIEW_M`.
 */
export function viewOf(m: Maneuver, upm: number): { x: number; y: number; z: number; r: number } {
  const min = (MIN_VIEW_M[m.domain] ?? 80) * upm;
  const own = new Box();
  const mine = new Set(m.units);
  const isOwn = (i: number) => {
    const o = m.owners?.[i];
    return !o || (!o.weapon && (o.unit >= 0 ? mine.has(o.unit) : o.team === m.team));
  };
  m.paths.forEach((p, i) => isOwn(i) && p.forEach((q) => own.add(q)));
  if (own.empty) return { x: m.place.x, y: m.place.y, z: m.place.z, r: Math.max(min, Math.min(m.place.radius, min * 4)) };
  const [cx, cy, cz] = own.c;
  const reach = OTHERS_WITHIN * Math.max(own.r, min);
  const all = new Box();
  m.paths.forEach((p, i) => p.forEach((q) => (isOwn(i) || Math.hypot(q[0] - cx, q[1] - cy, q[2] - cz) <= reach) && all.add(q)));
  const [x, y, z] = all.c;
  return { x, y, z, r: Math.max(min, all.r) };
}
