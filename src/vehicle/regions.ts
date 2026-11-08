/**
 * A person figure's body regions, for hits that name a region rather than a
 * point (CS2's hitgroups): each vertex of the figure's heat mesh given the
 * region it belongs to, by where it is in proportion to the figure's height
 * and width - the soldier figures share a build (`figures/infantry.ts`), so
 * the proportions hold for all of them, standing, at any height.
 *
 * Kept apart from the figures: a region is what the heatmap needs of them,
 * not something they draw.
 */

import type { HeatMesh } from './surface';

/** The regions, in CS2's names for its hitgroups. */
export const REGIONS = ['head', 'chest', 'stomach', 'left_arm', 'right_arm', 'left_leg', 'right_leg'] as const;
export type Region = (typeof REGIONS)[number];

/** A region's number in `personRegions`' output; 255 for gear (a rifle, the boots' soles) that takes no heat. */
export const NO_REGION = 255;

/** Hitgroups of a game mapped onto the regions; names not here are not drawn ("generic", "gear"). */
const ALIASES: Record<string, Region> = {
  head: 'head',
  neck: 'head',
  chest: 'chest',
  stomach: 'stomach',
  left_arm: 'left_arm',
  leftarm: 'left_arm',
  right_arm: 'right_arm',
  rightarm: 'right_arm',
  left_leg: 'left_leg',
  leftleg: 'left_leg',
  right_leg: 'right_leg',
  rightleg: 'right_leg',
};

/** The region a hitgroup names, or null ("generic", "gear", unknown). */
export function regionOf(hitgroup: string): Region | null {
  return ALIASES[hitgroup.trim().toLowerCase().replace(/[\s-]+/g, '_')] ?? ALIASES[hitgroup.trim().toLowerCase().replace(/[\s_-]+/g, '')] ?? null;
}

/**
 * Each vertex's region. Proportions of the standing figure (1.8 m): legs up
 * to the hip at 0.51 of the height, the stomach to 0.66, the chest to the
 * shoulders' top at 0.845, the head above; the arms outside the torso's
 * half width (0.13 of the height) or ahead of the chest, where the hands
 * hold the weapon; left is the figure's own left (-z, as x is forward and z
 * right). The fixed part's dark metal over the knees is the weapon: no
 * region.
 */
export function personRegions(mesh: HeatMesh): Uint8Array {
  const out = new Uint8Array(mesh.count);
  const h = Math.max(0.1, mesh.max[1] - mesh.min[1]);
  const y0 = mesh.min[1];
  const idx = (r: Region) => REGIONS.indexOf(r);
  for (let v = 0; v < mesh.count; v++) {
    const x = mesh.pos[v * 3];
    const y = (mesh.pos[v * 3 + 1] - y0) / h;
    const z = mesh.pos[v * 3 + 2];
    const r = mesh.base[v * 4], g = mesh.base[v * 4 + 1], b = mesh.base[v * 4 + 2];
    const dark = mesh.fixed[v] === 1 && Math.max(r, g, b) < 0.3 && Math.abs(r - b) < 0.05;
    if (dark && y > 0.3) {
      out[v] = NO_REGION;
      continue;
    }
    const left = z < 0;
    let region: Region;
    if (y < 0.51) region = left ? 'left_leg' : 'right_leg';
    else if (y > 0.845 && Math.abs(z) < 0.09 * h && x < 0.11 * h) region = 'head';
    else if (Math.abs(z) > 0.13 * h || x > 0.085 * h) region = z < 0.02 * h ? 'left_arm' : 'right_arm';
    else if (y > 0.845) region = 'head';
    else region = y < 0.66 ? 'stomach' : 'chest';
    out[v] = idx(region);
  }
  return out;
}

/**
 * Each vertex's heat from counts per region: the region's count, so a whole
 * body part carries how often it was hit.
 */
export function regionHeat(regions: Uint8Array, counts: Map<Region, number>, out?: Float32Array): Float32Array {
  const heat = out && out.length >= regions.length ? out : new Float32Array(regions.length);
  const per = REGIONS.map((r) => counts.get(r) ?? 0);
  for (let v = 0; v < regions.length; v++) heat[v] = regions[v] === NO_REGION ? 0 : per[regions[v]];
  return heat;
}

/** The middle of each region on the mesh, for its label and its count. */
export function regionCentres(mesh: HeatMesh, regions: Uint8Array): Map<Region, [number, number, number]> {
  const sum = REGIONS.map(() => [0, 0, 0, 0]);
  for (let v = 0; v < mesh.count; v++) {
    const k = regions[v];
    if (k === NO_REGION) continue;
    sum[k][0] += mesh.pos[v * 3];
    sum[k][1] += mesh.pos[v * 3 + 1];
    sum[k][2] += mesh.pos[v * 3 + 2];
    sum[k][3]++;
  }
  const out = new Map<Region, [number, number, number]>();
  REGIONS.forEach((r, i) => {
    const s = sum[i];
    if (s[3]) out.set(r, [s[0] / s[3], s[1] / s[3], s[2] / s[3]]);
  });
  return out;
}
