/**
 * Where a shell met the armour: the plate's surface normal at the hit point
 * (the nearest of its triangles, in the model's rest pose), the angle between
 * the shell's way in and that normal, and the armour it had to go through
 * along its way (the plate's thickness over the cosine of that angle).
 *
 * A hit on a turret or gun plate is turned back to the rest pose first (the
 * victim's turret yaw and gun elevation at the hit, `atRest`), its direction
 * with it, so the plate it is compared with is the one the model holds.
 */

import type { Vec3 } from '../../race/geometry';
import { pointTri2 } from '../plates';

/** The triangle of `tris` (9 floats each) nearest `p`, and its squared distance; -1 when there are none. */
export function nearestTriangle(p: Vec3, tris: Float32Array): { k: number; d2: number } {
  let best = -1, bestD = Infinity;
  for (let k = 0; k + 8 < tris.length; k += 9) {
    const d = pointTri2(p[0], p[1], p[2], tris, k);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  return { k: best, d2: bestD };
}

/** A triangle's unit normal (its winding's side; plates are not wound outward reliably, so only its line counts). */
export function triNormal(tris: Float32Array, k: number): Vec3 {
  const ux = tris[k + 3] - tris[k], uy = tris[k + 4] - tris[k + 1], uz = tris[k + 5] - tris[k + 2];
  const vx = tris[k + 6] - tris[k], vy = tris[k + 7] - tris[k + 1], vz = tris[k + 8] - tris[k + 2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

/** Degrees between the shell's way (`dir`, unit) and the plate's normal: 0 square on, 90 grazing. */
export function impactAngle(dir: Vec3, n: Vec3): number {
  const c = Math.min(1, Math.abs(dir[0] * n[0] + dir[1] * n[1] + dir[2] * n[2]));
  return (Math.acos(c) * 180) / Math.PI;
}

/** The armour along the shell's way: thickness over the cosine of the angle (an 85 degree cap: grazing is not infinite). */
export function effectiveThickness(mm: number, angleDeg: number): number {
  const a = Math.min(85, Math.max(0, angleDeg));
  return mm / Math.cos((a * Math.PI) / 180);
}

/** A direction on a turned turret (raised gun) back in the rest pose, as `atRest` turns a point. */
export function dirAtRest(d: Vec3, part: string, yaw: number, pitch: number): Vec3 {
  let [x, y, z] = d;
  if ((part === 'turret' || part === 'gun') && Number.isFinite(yaw)) {
    const c = Math.cos(-yaw), s = Math.sin(-yaw);
    [x, z] = [x * c - z * s, x * s + z * c];
  }
  if (part === 'gun' && Number.isFinite(pitch)) {
    const c = Math.cos(-pitch), s = Math.sin(-pitch);
    [x, y] = [x * c - y * s, x * s + y * c];
  }
  return [x, y, z];
}

/** Below the horizontal, degrees, of a way given in a frame whose y is up (+ coming down). */
export function descentOf(dir: Vec3): number {
  const l = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return (Math.asin(Math.max(-1, Math.min(1, -dir[1] / l))) * 180) / Math.PI;
}

/**
 * Where a line through `p` along `dir` (unit) first enters the triangles of `plates`: the entry point (the smallest
 * distance along `dir` from `p - reach * dir`), the plate and its triangle; null when the line misses them all. For
 * a hit whose point is only where the weapon's path passed nearest the unit (a Tacview recording's), this is the
 * point of the model it struck on that path (Moller-Trumbore, both sides of each triangle).
 */
export function rayEntry(p: Vec3, dir: Vec3, plates: readonly { tris: Float32Array }[], reach: number): { plate: number; k: number; point: Vec3 } | null {
  const ox = p[0] - dir[0] * reach, oy = p[1] - dir[1] * reach, oz = p[2] - dir[2] * reach;
  let best = Infinity, bp = -1, bk = -1;
  for (let i = 0; i < plates.length; i++) {
    const t = plates[i].tris;
    for (let k = 0; k + 8 < t.length; k += 9) {
      const e1x = t[k + 3] - t[k], e1y = t[k + 4] - t[k + 1], e1z = t[k + 5] - t[k + 2];
      const e2x = t[k + 6] - t[k], e2y = t[k + 7] - t[k + 1], e2z = t[k + 8] - t[k + 2];
      const px = dir[1] * e2z - dir[2] * e2y, py = dir[2] * e2x - dir[0] * e2z, pz = dir[0] * e2y - dir[1] * e2x;
      const det = e1x * px + e1y * py + e1z * pz;
      if (Math.abs(det) < 1e-12) continue;
      const inv = 1 / det;
      const sx = ox - t[k], sy = oy - t[k + 1], sz = oz - t[k + 2];
      const u = (sx * px + sy * py + sz * pz) * inv;
      if (u < 0 || u > 1) continue;
      const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x;
      const v = (dir[0] * qx + dir[1] * qy + dir[2] * qz) * inv;
      if (v < 0 || u + v > 1) continue;
      const d = (e2x * qx + e2y * qy + e2z * qz) * inv;
      if (d > 0 && d < best) {
        best = d;
        bp = i;
        bk = k;
      }
    }
  }
  return bp < 0 ? null : { plate: bp, k: bk, point: [ox + dir[0] * best, oy + dir[1] * best, oz + dir[2] * best] };
}
