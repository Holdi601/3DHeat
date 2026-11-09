/**
 * Hit points put onto a figure's surface, for the marks the hits leave on
 * it (`hitmarks.ts`).
 *
 * Where the way the shot travelled is known, the mark goes where the shot's
 * line through the data's point first meets the figure, coming from the
 * shooter's side: a shot from the front lands on the front, whatever the
 * point's error. Where it is not known, or the line misses the figure, the
 * point goes to the nearest point of the figure's triangles. Either way with
 * that triangle's normal, and whether it lies on the turret.
 *
 * The game's point is in the unit's frame with the turret as it stood at the
 * hit; the figure's turret is built at rest. So a point is tried on the hull
 * as it is and on the turret turned back by the turret's yaw then, and the
 * surface the shot meets first (else the nearer) wins. The point and normal
 * come back in the figure's frame with the turret at rest, to be turned as
 * the turret turns.
 *
 * The points may come in another scale than the figure's metres (War
 * Thunder's ground hits as converted so far lie about 1.6 times too far out,
 * so nearly every point lay outside the figure and went to its nearest
 * edge): `fitScale` finds the scale at which the shots' lines meet the
 * figures at their points, across the vehicles of a battle.
 *
 * Done once per vehicle, off the main thread (`markWorker.ts`).
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
 * right; times `scale`) onto the figure. `yaw` per point: the turret's yaw
 * at the hit (radians, NaN for none known); `dir` the way each shot
 * travelled (unit, NaN for not known).
 */
export function snapToFigure(t: Template, pts: Float32Array, yaw: Float32Array, dir: Float32Array, scale = 1): Float32Array {
  const n = yaw.length;
  const out = new Float32Array(n * SNAP_STRIDE).fill(NaN);
  const tb = turretOf(t);
  const g = gridOf(t);
  // The figure's middle, for which way a face looks where the shot's way is not known.
  const mx = (t.min[0] + t.max[0]) / 2, my = (t.min[1] + t.max[1]) / 2, mz = (t.min[2] + t.max[2]) / 2;
  for (let i = 0; i < n; i++) {
    const px = pts[i * 3] * scale, py = pts[i * 3 + 1] * scale, pz = pts[i * 3 + 2] * scale;
    const dx = dir[i * 3], dy = dir[i * 3 + 1], dz = dir[i * 3 + 2];
    const along = Number.isFinite(dx) && Number.isFinite(dy) && Number.isFinite(dz);
    // On the hull as it is; on the turret turned back to rest, where the turret's yaw then is known. Where it is
    // not, the turret stands as built, as the figure draws it then: any triangle.
    const turned = !!tb && g.turret && Number.isFinite(yaw[i]);
    // The point and the shot's way in the turret's frame at rest.
    let tx = px, tz = pz, tdx = dx, tdz = dz;
    if (turned) {
      const a = -(yaw[i] - tb!.rest);
      const c = Math.cos(a), s = Math.sin(a);
      const rx = px - tb!.px, rz = pz - tb!.pz;
      tx = tb!.px + rx * c - rz * s;
      tz = tb!.pz + rx * s + rz * c;
      tdx = dx * c - dz * s;
      tdz = dx * s + dz * c;
    }
    let hit = -1;
    let onTurret = false;
    // Along the shot: from outside the figure towards the point, the first surface met.
    if (along) {
      const back = g.reach + Math.hypot(px - mx, py - my, pz - mz);
      hit = ray(g, px - dx * back, py - dy * back, pz - dz * back, dx, dy, dz, turned ? 0 : -1);
      if (turned) hit = better(hit, ray(g, tx - tdx * back, py - dy * back, tz - tdz * back, tdx, dy, tdz, 1));
    }
    // The line misses the figure, or the shot's way is not known: the nearest surface.
    if (hit < 0) {
      hit = nearest(g, px, py, pz, turned ? 0 : -1);
      if (turned) hit = better(hit, nearest(g, tx, py, tz, 1));
    }
    if (hit < 0) continue;
    const onT = turned && g.part[hit] === 1;
    const sx = P[0], sy = P[1], sz = P[2];
    let nx = g.normal[hit * 3], ny = g.normal[hit * 3 + 1], nz = g.normal[hit * 3 + 2];
    // The normal faces against the shot where it is known (a shot strikes the side towards it), else outwards.
    const fx = onT ? tdx : dx, fz = onT ? tdz : dz;
    const away = along ? -(nx * fx + ny * dy + nz * fz) : nx * (sx - mx) + ny * (sy - my) + nz * (sz - mz);
    if (away < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    onTurret = onT;
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

/** The hull's find (`first`, its point in `KEEP`, distance in `KEPT`) or the turret's (`P`, `D`), whichever is nearer, into `P`. */
function better(first: number, second: number): number {
  // `first`'s answer was overwritten by the second search: kept before it.
  return second >= 0 && (first < 0 || D[0] < KEPT[0]) ? second : (restore(), first);
}

/** The scales `fitScale` tries, and the most shots it looks at. */
const SCALES = Array.from({ length: 46 }, (_, i) => 0.4 + i * 0.02);
const FIT_SHOTS = 400;
/** How far off a shot's line may meet the figure before it counts as missing, m. */
const FIT_MISS = 1;

/**
 * The scale the hit points of a battle's vehicles are in, by their figures:
 * the one at which the shots' lines through the points (`dir` known) meet
 * the figures nearest the points. 1 unless another is clearly better, or
 * too few shots say.
 */
export function fitScale(figures: { t: Template; pts: Float32Array; dir: Float32Array }[]): number {
  const shots: { g: Grid; mid: number[]; p: number[]; d: number[] }[] = [];
  for (const f of figures) {
    const g = gridOf(f.t);
    const mid = [0, 1, 2].map((a) => (f.t.min[a] + f.t.max[a]) / 2);
    for (let i = 0; i * 3 < f.pts.length && shots.length < FIT_SHOTS; i++) {
      const d = [f.dir[i * 3], f.dir[i * 3 + 1], f.dir[i * 3 + 2]];
      const p = [f.pts[i * 3], f.pts[i * 3 + 1], f.pts[i * 3 + 2]];
      if (d.every(Number.isFinite) && p.every(Number.isFinite)) shots.push({ g, mid, p, d });
    }
  }
  if (shots.length < 8) return 1;
  const cost = (s: number) => {
    let c = 0;
    for (const { g, mid, p, d } of shots) {
      const x = p[0] * s, y = p[1] * s, z = p[2] * s;
      const back = g.reach + Math.hypot(x - mid[0], y - mid[1], z - mid[2]);
      const hit = ray(g, x - d[0] * back, y - d[1] * back, z - d[2] * back, d[0], d[1], d[2], -1);
      c += hit >= 0 ? Math.min(FIT_MISS, Math.abs(D[0] - back)) : FIT_MISS;
    }
    return c;
  };
  const one = cost(1);
  let best = 1, least = one;
  for (const s of SCALES) {
    const c = cost(s);
    if (c < least) {
      least = c;
      best = s;
    }
  }
  // Another scale only where it clearly puts the shots nearer: a fifth less off at least.
  return least < one * 0.8 ? best : 1;
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
  /** The figure's box's diagonal and a metre, m: a line from this far back starts outside it. */
  reach: number;
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
  const g: Grid = { tri, normal, part: Uint8Array.from(part), turret: part.some((p) => p === 1), min, cell, dims, start: counts, items, seen: new Int32Array(m), stamp: 0, reach: Math.hypot(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2]) + 1 };
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
  keep();
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

/**
 * The first triangle of part `part` (-1: any) a line from `o` along `d`
 * (unit) meets (its index, -1 for none), the point into `P` and how far
 * along into `D`: the grid's cells walked in the line's order (Amanatides
 * and Woo), each cell's triangles tested (Moeller and Trumbore). The
 * previous answer is kept in `KEEP`, `KEPT` first.
 */
function ray(g: Grid, ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, part: number): number {
  keep();
  const stamp = ++g.stamp;
  const { dims, min, cell } = g;
  const o = [ox, oy, oz], d = [dx, dy, dz];
  // Into the grid's box.
  let t0 = 0, t1 = Infinity;
  for (let a = 0; a < 3; a++) {
    const lo = min[a], hi = min[a] + dims[a] * cell;
    if (Math.abs(d[a]) < 1e-12) {
      if (o[a] < lo || o[a] > hi) return -1;
      continue;
    }
    let ta = (lo - o[a]) / d[a], tb = (hi - o[a]) / d[a];
    if (ta > tb) [ta, tb] = [tb, ta];
    t0 = Math.max(t0, ta);
    t1 = Math.min(t1, tb);
  }
  if (t0 > t1) return -1;
  const c = [0, 0, 0], step = [0, 0, 0], next = [0, 0, 0], delta = [0, 0, 0];
  for (let a = 0; a < 3; a++) {
    c[a] = Math.max(0, Math.min(dims[a] - 1, Math.floor((o[a] + d[a] * t0 - min[a]) / cell)));
    step[a] = d[a] > 0 ? 1 : d[a] < 0 ? -1 : 0;
    delta[a] = step[a] ? cell / Math.abs(d[a]) : Infinity;
    next[a] = step[a] ? (min[a] + (c[a] + (step[a] > 0 ? 1 : 0)) * cell - o[a]) / d[a] : Infinity;
  }
  let best = Infinity, bi = -1;
  const v = g.tri;
  for (;;) {
    const cc = (c[0] * dims[1] + c[1]) * dims[2] + c[2];
    for (let k = g.start[cc]; k < g.start[cc + 1]; k++) {
      const i = g.items[k];
      if (g.seen[i] === stamp || (part >= 0 && g.part[i] !== part)) continue;
      g.seen[i] = stamp;
      const q = i * 9;
      const e1x = v[q + 3] - v[q], e1y = v[q + 4] - v[q + 1], e1z = v[q + 5] - v[q + 2];
      const e2x = v[q + 6] - v[q], e2y = v[q + 7] - v[q + 1], e2z = v[q + 8] - v[q + 2];
      const pvx = dy * e2z - dz * e2y, pvy = dz * e2x - dx * e2z, pvz = dx * e2y - dy * e2x;
      const det = e1x * pvx + e1y * pvy + e1z * pvz;
      if (Math.abs(det) < 1e-12) continue;
      const inv = 1 / det;
      const sx = ox - v[q], sy = oy - v[q + 1], sz = oz - v[q + 2];
      const u = (sx * pvx + sy * pvy + sz * pvz) * inv;
      if (u < 0 || u > 1) continue;
      const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x;
      const w = (dx * qx + dy * qy + dz * qz) * inv;
      if (w < 0 || u + w > 1) continue;
      const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
      if (t >= 0 && t < best) {
        best = t;
        bi = i;
      }
    }
    // The next cell along; done once the nearest found lies before it, or the line leaves the grid.
    const a = next[0] < next[1] ? (next[0] < next[2] ? 0 : 2) : next[1] < next[2] ? 1 : 2;
    if (best <= next[a] || next[a] > t1) break;
    c[a] += step[a];
    if (c[a] < 0 || c[a] >= dims[a]) break;
    next[a] += delta[a];
  }
  if (bi < 0) return -1;
  put(ox + dx * best, oy + dy * best, oz + dz * best);
  D[0] = best;
  return bi;
}

/** The answer before the last search (`ray`, `nearest`), for `better`. */
const KEEP = [0, 0, 0];
const KEPT = [Infinity];

function keep(): void {
  KEEP[0] = P[0];
  KEEP[1] = P[1];
  KEEP[2] = P[2];
  KEPT[0] = D[0];
}

function restore(): void {
  P[0] = KEEP[0];
  P[1] = KEEP[1];
  P[2] = KEEP[2];
  D[0] = KEPT[0];
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
