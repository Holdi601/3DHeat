/**
 * A figure's main turret, for the hit marks that turn with it
 * (`hitmarks.ts`): small enough to load in the worker that builds figures off
 * the main thread (`turretWorker.ts`).
 */
import type { Vec3 } from '../race/geometry';
import type { Template } from './kit';

/**
 * A figure's main turret: the pivot, the rest yaw, the box of its vertices
 * (template frame) and how far from the pivot, level, the box reaches.
 */
export interface TurretBox {
  px: number;
  pz: number;
  rest: number;
  min: Vec3;
  max: Vec3;
  reach: number;
}

const turrets = new WeakMap<Template, TurretBox | null>();

/** The main turret of a figure (`TurretBox`), or null for a figure with none. */
export function turretOf(t: Template): TurretBox | null {
  const hit = turrets.get(t);
  if (hit !== undefined) return hit;
  let out: TurretBox | null = null;
  const j = t.joints ? t.joints.findIndex((x) => x.kind === 'yaw' && x.parent < 0) : -1;
  if (j >= 0) {
    const min: Vec3 = [Infinity, Infinity, Infinity];
    const max: Vec3 = [-Infinity, -Infinity, -Infinity];
    for (const [v, js] of [
      [t.team, t.teamJ],
      [t.fixed, t.fixedJ],
    ] as const) {
      if (!js) continue;
      for (let i = 0; i < js.length; i++) {
        if (js[i] !== j + 1) continue;
        for (let a = 0; a < 3; a++) {
          const x = v[i * 7 + a];
          if (x < min[a]) min[a] = x;
          if (x > max[a]) max[a] = x;
        }
      }
    }
    const jt = t.joints![j];
    if (min[0] <= max[0]) {
      const px = jt.pivot[0], pz = jt.pivot[2];
      const reach = Math.max(Math.hypot(min[0] - px, min[2] - pz), Math.hypot(min[0] - px, max[2] - pz), Math.hypot(max[0] - px, min[2] - pz), Math.hypot(max[0] - px, max[2] - pz));
      out = { px, pz, rest: jt.rest, min, max, reach };
    }
  }
  turrets.set(t, out);
  return out;
}
