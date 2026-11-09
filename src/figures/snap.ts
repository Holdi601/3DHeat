/**
 * Hit points put onto a figure's surface, for the marks the hits leave on
 * it (`hitmarks.ts`): each point moved to the nearest point of the figure's
 * triangles, with that triangle's normal, and whether it lies on the turret.
 *
 * The game's point is in the unit's frame with the turret as it stood at the
 * hit; the figure's turret is built at rest. So a point is tried on the hull
 * as it is and on the turret turned back by the turret's yaw then, and the
 * nearer surface wins (a triangle facing along the shot, the far side, only
 * when nothing else is near). The point and normal come back in the figure's
 * frame with the turret at rest, to be turned as the turret turns.
 *
 * Every triangle is looked at for every point: done once per vehicle, off
 * the main thread (`turretWorker.ts`).
 */
import type { Template } from './kit';
import { turretOf } from './turret';

/** Floats a snapped point takes: x, y, z, normal x, y, z, 1 on the turret else 0. */
export const SNAP_STRIDE = 7;

/** Which joints turn with the main turret: it and every joint carried on it. */
function turretJoints(t: Template): Uint8Array | null {
  const js = t.joints;
  if (!js) return null;
  const main = js.findIndex((x) => x.kind === 'yaw' && x.parent < 0);
  if (main < 0) return null;
  const on = new Uint8Array(js.length + 1);
  for (let j = 0; j < js.length; j++) {
    let k = j;
    for (let guard = 0; k >= 0 && guard < 8; guard++) {
      if (k === main) {
        on[j + 1] = 1;
        break;
      }
      k = js[k].parent;
    }
  }
  return on;
}

/**
 * Snaps `n` points (`pts`, x y z each, the figure's frame: forward, up,
 * right) onto the figure. `yaw` per point: the turret's yaw at the hit
 * (radians, NaN for none known); `dir` the way each shot travelled (unit, NaN
 * for not known).
 */
export function snapToFigure(t: Template, pts: Float32Array, yaw: Float32Array, dir: Float32Array): Float32Array {
  const n = yaw.length;
  const out = new Float32Array(n * SNAP_STRIDE).fill(NaN);
  const tb = turretOf(t);
  const g = gridOf(t);
  // The figure's middle, for which way a face looks where the shot's way is not known.
  const mx = (t.min[0] + t.max[0]) / 2, my = (t.min[1] + t.max[1]) / 2, mz = (t.min[2] + t.max[2]) / 2;
  for (let i = 0; i < n; i++) {
    const px = pts[i * 3], py = pts[i * 3 + 1], pz = pts[i * 3 + 2];
    const dx = dir[i * 3], dy = dir[i * 3 + 1], dz = dir[i * 3 + 2];
    // On the hull as it is; on the turret turned back to rest, where the turret's yaw then is known. Where it is
    // not, the turret stands as built, as the figure draws it then: any triangle.
    const turned = !!tb && g.turret && Number.isFinite(yaw[i]);
    let hit = nearest(g, px, py, pz, turned ? 0 : -1);
    let onTurret = false;
    if (turned) {
      const a = -(yaw[i] - tb!.rest);
      const c = Math.cos(a), s = Math.sin(a);
      const rx = px - tb!.px, rz = pz - tb!.pz;
      const best = hit >= 0 ? D[0] : Infinity;
      const keep = [P[0], P[1], P[2]];
      const h2 = nearest(g, tb!.px + rx * c - rz * s, py, tb!.pz + rx * s + rz * c, 1);
      if (h2 >= 0 && D[0] < best) {
        hit = h2;
        onTurret = true;
      } else {
        P[0] = keep[0];
        P[1] = keep[1];
        P[2] = keep[2];
      }
    }
    if (hit < 0) continue;
    const sx = P[0], sy = P[1], sz = P[2];
    let nx = g.normal[hit * 3], ny = g.normal[hit * 3 + 1], nz = g.normal[hit * 3 + 2];
    // The normal faces against the shot where it is known (a shot strikes the side towards it), else outwards.
    const away = Number.isFinite(dx) ? -(nx * dx + ny * dy + nz * dz) : nx * (sx - mx) + ny * (sy - my) + nz * (sz - mz);
    if (away < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    const o = i * SNAP_STRIDE;
    out[o] = sx;
    out[o + 1] = sy;
    out[o + 2] = sz;
    out[o + 3] = nx;
    out[o + 4] = ny;
    out[o + 5] = nz;
    out[o + 6] = onTurret ? 1 : 0;
  }
  return out;
}

/** A figure's triangles in cells, to look only near a point. */
interface Grid {
  /** Nine floats a triangle. */
  tri: Float32Array;
  normal: Float32Array;
  /** 1 for a triangle on the turret (or what it carries). */
  part: Uint8Array;
  turret: boolean;
  min: [number, number, number];
  cell: number;
  dims: [number, number, number];
  /** Per cell, its triangles: `start` into `items`. */
  start: Int32Array;
  items: Int32Array;
  /** Per triangle, the query that last looked at it. */
  seen: Int32Array;
  stamp: number;
}

const grids = new WeakMap<Template, Grid>();

function gridOf(t: Template): Grid {
  const hit = grids.get(t);
  if (hit) return hit;
  const onTurret = turretJoints(t);
  const tris: number[] = [];
  const part: number[] = [];
  for (const [v, js] of [
    [t.team, t.teamJ],
    [t.fixed, t.fixedJ],
  ] as const) {
    for (let k = 0; k + 21 <= v.length; k += 21) {
      tris.push(v[k], v[k + 1], v[k + 2], v[k + 7], v[k + 8], v[k + 9], v[k + 14], v[k + 15], v[k + 16]);
      part.push(onTurret && js ? onTurret[js[k / 7]] : 0);
    }
  }
  const m = part.length;
  const tri = Float32Array.from(tris);
  const normal = new Float32Array(m * 3);
  for (let i = 0; i < m; i++) {
    const o = i * 9;
    const e1x = tri[o + 3] - tri[o], e1y = tri[o + 4] - tri[o + 1], e1z = tri[o + 5] - tri[o + 2];
    const e2x = tri[o + 6] - tri[o], e2y = tri[o + 7] - tri[o + 1], e2z = tri[o + 8] - tri[o + 2];
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
    const l = Math.hypot(nx, ny, nz) || 1;
    normal[i * 3] = nx / l;
    normal[i * 3 + 1] = ny / l;
    normal[i * 3 + 2] = nz / l;
  }
  const size = Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.1);
  const cell = Math.max(0.05, size / 24);
  const min: [number, number, number] = [t.min[0] - cell, t.min[1] - cell, t.min[2] - cell];
  const dims: [number, number, number] = [0, 1, 2].map((a) => Math.max(1, Math.ceil((t.max[a] - t.min[a] + 2 * cell) / cell))) as [number, number, number];
  const cells = dims[0] * dims[1] * dims[2];
  const counts = new Int32Array(cells + 1);
  const each = (i: number, f: (c: number) => void) => {
    const o = i * 9;
    const lo = [0, 1, 2].map((a) => Math.max(0, Math.min(dims[a] - 1, Math.floor((Math.min(tri[o + a], tri[o + 3 + a], tri[o + 6 + a]) - min[a]) / cell))));
    const hi = [0, 1, 2].map((a) => Math.max(0, Math.min(dims[a] - 1, Math.floor((Math.max(tri[o + a], tri[o + 3 + a], tri[o + 6 + a]) - min[a]) / cell))));
    for (let x = lo[0]; x <= hi[0]; x++) for (let y = lo[1]; y <= hi[1]; y++) for (let z = lo[2]; z <= hi[2]; z++) f((x * dims[1] + y) * dims[2] + z);
  };
  for (let i = 0; i < m; i++) each(i, (c) => counts[c + 1]++);
  for (let c = 0; c < cells; c++) counts[c + 1] += counts[c];
  const items = new Int32Array(counts[cells]);
  const fill = counts.slice(0, cells);
  for (let i = 0; i < m; i++) each(i, (c) => (items[fill[c]++] = i));
  const g: Grid = { tri, normal, part: Uint8Array.from(part), turret: part.some((p) => p === 1), min, cell, dims, start: counts, items, seen: new Int32Array(m), stamp: 0 };
  grids.set(t, g);
  return g;
}

/** `nearest`'s distance, reused. */
const D = [0];

/**
 * The triangle of part `part` (-1: any) nearest a point (its index, -1 for none), the
 * point on it into `P` and the distance into `D`: the cells round the point
 * looked at in growing boxes until the nearest found lies inside the box.
 */
function nearest(g: Grid, x: number, y: number, z: number, part: number): number {
  const stamp = ++g.stamp;
  const { dims, min, cell } = g;
  const cx = Math.max(0, Math.min(dims[0] - 1, Math.floor((x - min[0]) / cell)));
  const cy = Math.max(0, Math.min(dims[1] - 1, Math.floor((y - min[1]) / cell)));
  const cz = Math.max(0, Math.min(dims[2] - 1, Math.floor((z - min[2]) / cell)));
  // How far the point lies outside the grid, to start the search where the grid begins.
  const outside = Math.hypot(Math.max(0, min[0] - x, x - (min[0] + dims[0] * cell)), Math.max(0, min[1] - y, y - (min[1] + dims[1] * cell)), Math.max(0, min[2] - z, z - (min[2] + dims[2] * cell)));
  const most = Math.max(dims[0], dims[1], dims[2]);
  let best = Infinity, bi = -1, bx = 0, by = 0, bz = 0;
  for (let r = 0; r <= most; r++) {
    for (let ix = Math.max(0, cx - r); ix <= Math.min(dims[0] - 1, cx + r); ix++) {
      for (let iy = Math.max(0, cy - r); iy <= Math.min(dims[1] - 1, cy + r); iy++) {
        for (let iz = Math.max(0, cz - r); iz <= Math.min(dims[2] - 1, cz + r); iz++) {
          // Only the shell of the box: its inside was looked at before.
          if (Math.max(Math.abs(ix - cx), Math.abs(iy - cy), Math.abs(iz - cz)) !== r) continue;
          const c = (ix * dims[1] + iy) * dims[2] + iz;
          for (let k = g.start[c]; k < g.start[c + 1]; k++) {
            const i = g.items[k];
            if (g.seen[i] === stamp || (part >= 0 && g.part[i] !== part)) continue;
            g.seen[i] = stamp;
            const o = i * 9, v = g.tri;
            closest(x, y, z, v[o], v[o + 1], v[o + 2], v[o + 3], v[o + 4], v[o + 5], v[o + 6], v[o + 7], v[o + 8]);
            const d = Math.hypot(P[0] - x, P[1] - y, P[2] - z);
            if (d < best) {
              best = d;
              bi = i;
              bx = P[0];
              by = P[1];
              bz = P[2];
            }
          }
        }
      }
    }
    // Everything nearer than the box's inner reach has been seen.
    if (bi >= 0 && best <= outside + r * cell) break;
  }
  P[0] = bx;
  P[1] = by;
  P[2] = bz;
  D[0] = best;
  return bi;
}

/** `closest`'s answer, reused. */
const P = [0, 0, 0];

function put(x: number, y: number, z: number): void {
  P[0] = x;
  P[1] = y;
  P[2] = z;
}

/** The point of triangle a b c nearest p, into `P` (Ericson, Real-Time Collision Detection, 5.1.5). */
function closest(px: number, py: number, pz: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, cx: number, cy: number, cz: number): void {
  const abx = bx - ax, aby = by - ay, abz = bz - az;
  const acx = cx - ax, acy = cy - ay, acz = cz - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz;
  const d2 = acx * apx + acy * apy + acz * apz;
  if (d1 <= 0 && d2 <= 0) return put(ax, ay, az);
  const bpx = px - bx, bpy = py - by, bpz = pz - bz;
  const d3 = abx * bpx + aby * bpy + abz * bpz;
  const d4 = acx * bpx + acy * bpy + acz * bpz;
  if (d3 >= 0 && d4 <= d3) return put(bx, by, bz);
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    return put(ax + abx * v, ay + aby * v, az + abz * v);
  }
  const cpx = px - cx, cpy = py - cy, cpz = pz - cz;
  const d5 = abx * cpx + aby * cpy + abz * cpz;
  const d6 = acx * cpx + acy * cpy + acz * cpz;
  if (d6 >= 0 && d5 <= d6) return put(cx, cy, cz);
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    return put(ax + acx * w, ay + acy * w, az + acz * w);
  }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
    return put(bx + (cx - bx) * w, by + (cy - by) * w, bz + (cz - bz) * w);
  }
  const denom = 1 / (va + vb + vc);
  const v = vb * denom;
  const w = vc * denom;
  return put(ax + abx * v + acx * w, ay + aby * v + acy * w, az + abz * v + acz * w);
}
