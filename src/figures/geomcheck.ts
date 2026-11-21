/**
 * Geometry sanity of a built figure, for the tests and the local look tools:
 * what a figure must not have whatever it depicts.
 *
 *   floating   a part (a cluster of triangles) that touches nothing else of
 *              the figure: an add-on placed off its hull or turret, a turret
 *              standing clear of its hull. Checked as built and with every
 *              turret turned and every gun raised, so a part riding on the
 *              wrong joint (a turret box drawn on the hull) shows too.
 *   inverted   triangles of a closed part whose lighting normal points into
 *              the part: it is lit as if it faced away, dark in the sun.
 *   degenerate triangles with no area to speak of.
 *
 * Parts are found by welding the triangles' corners (they share points);
 * parts touch where their surfaces come within `tol` of each other (sampled
 * into cubes of that size); a ground figure's part resting on the ground (a
 * wheel, an emplacement's wall, a spade) stands whatever else it touches.
 * Faint triangles (rotor and propeller discs, exhaust, alpha under 0.5) are
 * left out: they float by design.
 */

import type { Template } from './kit';
import { articulate, meshOf, MESH_STRIDE } from './instances';

type V3 = [number, number, number];

export interface FloatingPart {
  /** Triangles in the part. */
  tris: number;
  min: V3;
  max: V3;
  /** How most of it moves: 0 with the hull, 1 a turret, 2 a turret's gun, 3 a gun on the hull. */
  moves: number;
  /** How far its box stands off the body's box, m; `tol` where the boxes overlap. */
  gap: number;
}

export interface GeomReport {
  triangles: number;
  degenerate: number;
  /** Triangles in closed parts lit from inside. */
  inverted: number;
  /** Parts away from the main body as built, and with the turrets turned and the guns raised. */
  floating: FloatingPart[];
  floatingPosed: FloatingPart[];
  /** The touching distance used, m. */
  tol: number;
}

/** The touching distance for a figure of this size: 8 cm on a tank, 3 cm on a person, more on a ship. */
export function tolFor(t: Template): number {
  const ext = Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2]);
  return Math.max(0.03, Math.min(0.6, ext * 0.008));
}

/** Vertex positions with each joint turned by `yaw` (radians from its rest) and each gun at `pitch` (radians up). */
function posed(m: Float32Array, count: number, yaw: number | null, pitch: number): Float32Array {
  const P = new Float32Array(count * 3);
  const at = [0, 0, 0];
  for (let v = 0; v < count; v++) {
    const o = v * MESH_STRIDE;
    if (yaw === null) {
      P[v * 3] = m[o];
      P[v * 3 + 1] = m[o + 1];
      P[v * 3 + 2] = m[o + 2];
      continue;
    }
    // A turret's yaw is absolute (`articulate` subtracts the rest): turned `yaw` from the way it was built.
    articulate(m, o, m[o], m[o + 1], m[o + 2], m[o + 15] + yaw, pitch, true, at);
    P[v * 3] = at[0];
    P[v * 3 + 1] = at[1];
    P[v * 3 + 2] = at[2];
  }
  return P;
}

function find(parent: Int32Array, a: number): number {
  while (parent[a] !== a) {
    parent[a] = parent[parent[a]];
    a = parent[a];
  }
  return a;
}

function union(parent: Int32Array, a: number, b: number): void {
  const ra = find(parent, a);
  const rb = find(parent, b);
  if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
}

/** Corners welded by position (to `q` m): a vertex index per corner. */
function weld(P: Float32Array, count: number, min: number[], max: number[], q: number): Int32Array {
  const ids = new Int32Array(count);
  const seen = new Map<number, number>();
  const ny = Math.ceil((max[1] - min[1]) / q) + 2;
  const nz = Math.ceil((max[2] - min[2]) / q) + 2;
  for (let v = 0; v < count; v++) {
    const x = Math.round((P[v * 3] - min[0]) / q);
    const y = Math.round((P[v * 3 + 1] - min[1]) / q);
    const z = Math.round((P[v * 3 + 2] - min[2]) / q);
    const key = (x * ny + y) * nz + z;
    let id = seen.get(key);
    if (id === undefined) {
      id = seen.size;
      seen.set(key, id);
    }
    ids[v] = id;
  }
  return ids;
}

/** The parts (welded triangle clusters) of the solid triangles: a part index per triangle, -1 for faint ones. */
function partsOf(m: Float32Array, nt: number, ids: Int32Array): { part: Int32Array; parts: number } {
  const parent = new Int32Array(ids.length).map((_, i) => i);
  const solid = (t: number) => m[t * 3 * MESH_STRIDE + 6] >= 0.5;
  for (let t = 0; t < nt; t++) {
    if (!solid(t)) continue;
    union(parent, ids[t * 3], ids[t * 3 + 1]);
    union(parent, ids[t * 3], ids[t * 3 + 2]);
  }
  const part = new Int32Array(nt).fill(-1);
  const index = new Map<number, number>();
  for (let t = 0; t < nt; t++) {
    if (!solid(t)) continue;
    const r = find(parent, ids[t * 3]);
    let k = index.get(r);
    if (k === undefined) {
      k = index.size;
      index.set(r, k);
    }
    part[t] = k;
  }
  return { part, parts: index.size };
}

/** Cubes (non-negative keys) to parts: open addressing, grown as it fills. */
class Cubes {
  keys = new Float64Array(1 << 12).fill(-1);
  vals = new Int32Array(1 << 12);
  private n = 0;

  private slot(k: number): number {
    const mask = this.keys.length - 1;
    // The key is (x * N + y) * N + z with N = 2^14: its low and high 21 bits mixed.
    const lo = k % 2097152, hi = (k - lo) / 2097152;
    let i = (Math.imul(lo, 0x9e3779b1) ^ Math.imul(hi, 0x85ebca6b)) >>> 0;
    i = (i ^ (i >>> 15)) & mask;
    while (this.keys[i] !== -1 && this.keys[i] !== k) i = (i + 1) & mask;
    return i;
  }

  /** The part already in cube `k` (-1 for none, then `p` goes in). */
  put(k: number, p: number): number {
    const i = this.slot(k);
    if (this.keys[i] === k) return this.vals[i];
    this.keys[i] = k;
    this.vals[i] = p;
    if (++this.n * 2 > this.keys.length) this.grow();
    return -1;
  }

  get(k: number): number {
    const i = this.slot(k);
    return this.keys[i] === k ? this.vals[i] : -1;
  }

  private grow(): void {
    const { keys, vals } = this;
    this.keys = new Float64Array(keys.length * 2).fill(-1);
    this.vals = new Int32Array(keys.length * 2);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] < 0) continue;
      const j = this.slot(keys[i]);
      this.keys[j] = keys[i];
      this.vals[j] = vals[i];
    }
  }
}

/** Clusters of parts whose surfaces come within `tol`; the largest is the body, the rest float. */
function floatingOf(m: Float32Array, P: Float32Array, nt: number, part: Int32Array, parts: number, tol: number, ground: boolean): FloatingPart[] {
  if (parts < 2) return [];
  const min = [Infinity, Infinity, Infinity];
  for (let i = 0; i < P.length; i++) min[i % 3] = Math.min(min[i % 3], P[i] - 2 * tol);
  // One more part: the ground a ground figure stands on (a part resting on it - a wheel, an emplacement's wall, a
  // spade - stands, whatever it touches).
  const parent = new Int32Array(parts + 1).map((_, i) => i);
  let floor = -Infinity;
  if (ground) {
    floor = Infinity;
    for (let i = 1; i < P.length; i += 3) floor = Math.min(floor, P[i]);
    floor += tol;
  }
  // Each cube's first part; a second part in it or a neighbour joins them.
  const cube = new Cubes();
  const N = 1 << 14;
  const key = (x: number, y: number, z: number) => (x * N + y) * N + z;
  let last = -1;
  const mark = (x: number, y: number, z: number, p: number) => {
    const k = key(x, y, z);
    if (k === last) return;
    last = k;
    const q = cube.put(k, p);
    if (q >= 0 && q !== p) union(parent, q, p);
  };
  const step = tol;
  const a: V3 = [0, 0, 0], b: V3 = [0, 0, 0], c: V3 = [0, 0, 0];
  for (let t = 0; t < nt; t++) {
    const p = part[t];
    if (p < 0) continue;
    // A sample in the cube the one before was in is skipped: only within one triangle (another may be another part's).
    last = -1;
    for (let i = 0; i < 3; i++) {
      a[i] = P[t * 9 + i] - min[i];
      b[i] = P[t * 9 + 3 + i] - min[i];
      c[i] = P[t * 9 + 6 + i] - min[i];
    }
    // Rows across from the corner opposite the longest side to that side, each sampled along: as many samples as the
    // area needs, a sliver's too.
    let A = a, B = b, C = c;
    const lab = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const lbc = Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2]);
    const lca = Math.hypot(a[0] - c[0], a[1] - c[1], a[2] - c[2]);
    if (lab >= lbc && lab >= lca) [A, B, C] = [c, a, b];
    else if (lca >= lbc && lca >= lab) [A, B, C] = [b, c, a];
    const base = Math.max(lab, lbc, lca);
    const ux = B[1] - A[1], uy = B[2] - A[2], uz = B[0] - A[0];
    const vx = C[1] - A[1], vy = C[2] - A[2], vz = C[0] - A[0];
    const area2 = Math.hypot(ux * vy - uy * vx, uy * vz - uz * vy, uz * vx - ux * vz);
    const rows = Math.max(1, Math.ceil(area2 / Math.max(base, 1e-9) / step));
    for (let i = 0; i <= rows; i++) {
      const f = i / rows;
      const n = Math.max(1, Math.ceil((base * f) / step));
      for (let j = 0; j <= n; j++) {
        const g = (j / n) * f;
        const h = f - g;
        const x = A[0] + (B[0] - A[0]) * h + (C[0] - A[0]) * g;
        const y = A[1] + (B[1] - A[1]) * h + (C[1] - A[1]) * g;
        const z = A[2] + (B[2] - A[2]) * h + (C[2] - A[2]) * g;
        mark(Math.floor(x / tol) + 1, Math.floor(y / tol) + 1, Math.floor(z / tol) + 1, p);
        if (y + min[1] < floor) union(parent, parts, p);
      }
    }
  }
  // Neighbouring cubes touch too (a surface just across a cube's face): looked at only round the parts not yet joined
  // to the body (the largest cluster), as nearly every part already shares a cube with the one it sits on.
  const count = new Map<number, number>();
  for (let t = 0; t < nt; t++) if (part[t] >= 0) count.set(find(parent, part[t]), (count.get(find(parent, part[t])) ?? 0) + 1);
  let bodyRoot = -1;
  for (const [r, c] of count) if (bodyRoot < 0 || c > count.get(bodyRoot)!) bodyRoot = r;
  if (count.size < 2) return [];
  for (let i = 0; i < cube.keys.length; i++) {
    const k = cube.keys[i];
    if (k < 0) continue;
    const p = cube.vals[i];
    if (find(parent, p) === bodyRoot) continue;
    const z = k % N;
    const y = Math.floor(k / N) % N;
    const x = Math.floor(k / N / N);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      const q = cube.get(key(x + dx, y + dy, z + dz));
      if (q >= 0 && q !== p) union(parent, q, p);
    }
  }
  // Clusters, by triangle count; the largest is the body.
  const tris = new Map<number, number[]>();
  for (let t = 0; t < nt; t++) {
    if (part[t] < 0) continue;
    const r = find(parent, part[t]);
    const l = tris.get(r);
    if (l) l.push(t);
    else tris.set(r, [t]);
  }
  if (tris.size < 2) return [];
  const clusters = [...tris.values()].sort((x, y) => y.length - x.length);
  const body = clusters[0];
  const bodyBox = boxOf(P, body);
  return clusters.slice(1).map((l) => {
    const bx = boxOf(P, l);
    const gap = Math.max(0, ...[0, 1, 2].map((i) => Math.max(bx.min[i] - bodyBox.max[i], bodyBox.min[i] - bx.max[i])));
    const js = new Map<number, number>();
    for (const t of l) {
      const j = Math.round(m[t * 3 * MESH_STRIDE + 12]);
      js.set(j, (js.get(j) ?? 0) + 1);
    }
    const moves = [...js.entries()].sort((x, y) => y[1] - x[1])[0][0];
    return { tris: l.length, min: bx.min, max: bx.max, moves, gap: Math.max(gap, tol) };
  });
}

function boxOf(P: Float32Array, tris: number[]): { min: V3; max: V3 } {
  const min: V3 = [Infinity, Infinity, Infinity];
  const max: V3 = [-Infinity, -Infinity, -Infinity];
  for (const t of tris) {
    for (let v = 0; v < 3; v++) {
      for (let i = 0; i < 3; i++) {
        const x = P[(t * 3 + v) * 3 + i];
        if (x < min[i]) min[i] = x;
        if (x > max[i]) max[i] = x;
      }
    }
  }
  return { min, max };
}

/** Triangles of closed parts whose normal points into the part. */
function invertedOf(m: Float32Array, P: Float32Array, nt: number, ids: Int32Array, part: Int32Array, parts: number): number {
  // A part is closed when every edge (welded) is shared by exactly two of its triangles.
  const edges = new Map<number, number>();
  const nv = ids.reduce((a, b) => Math.max(a, b), 0) + 1;
  for (let t = 0; t < nt; t++) {
    if (part[t] < 0) continue;
    for (let e = 0; e < 3; e++) {
      const a = ids[t * 3 + e];
      const b = ids[t * 3 + ((e + 1) % 3)];
      if (a === b) continue;
      const k = Math.min(a, b) * nv + Math.max(a, b);
      edges.set(k, (edges.get(k) ?? 0) + 1);
    }
  }
  const open = new Uint8Array(parts);
  const volume = new Float64Array(parts);
  for (let t = 0; t < nt; t++) {
    const p = part[t];
    if (p < 0) continue;
    for (let e = 0; e < 3; e++) {
      const a = ids[t * 3 + e];
      const b = ids[t * 3 + ((e + 1) % 3)];
      if (a !== b && edges.get(Math.min(a, b) * nv + Math.max(a, b)) !== 2) open[p] = 1;
    }
    const o = t * 9;
    volume[p] += (P[o] * (P[o + 4] * P[o + 8] - P[o + 5] * P[o + 7]) - P[o + 1] * (P[o + 3] * P[o + 8] - P[o + 5] * P[o + 6]) + P[o + 2] * (P[o + 3] * P[o + 7] - P[o + 4] * P[o + 6])) / 6;
  }
  let bad = 0;
  for (let t = 0; t < nt; t++) {
    const p = part[t];
    if (p < 0 || open[p] || Math.abs(volume[p]) < 1e-6) continue;
    const o = t * 9;
    const ux = P[o + 3] - P[o], uy = P[o + 4] - P[o + 1], uz = P[o + 5] - P[o + 2];
    const vx = P[o + 6] - P[o], vy = P[o + 7] - P[o + 1], vz = P[o + 8] - P[o + 2];
    const s = Math.sign(volume[p]);
    const gx = (uy * vz - uz * vy) * s, gy = (uz * vx - ux * vz) * s, gz = (ux * vy - uy * vx) * s;
    const gl = Math.hypot(gx, gy, gz);
    if (gl < 1e-12) continue;
    let nx = 0, ny = 0, nz = 0;
    for (let v = 0; v < 3; v++) {
      const q = (t * 3 + v) * MESH_STRIDE;
      nx += m[q + 7];
      ny += m[q + 8];
      nz += m[q + 9];
    }
    const nl = Math.hypot(nx, ny, nz);
    if (nl < 1e-6) continue;
    if ((nx * gx + ny * gy + nz * gz) / (nl * gl) < -0.3) bad++;
  }
  return bad;
}

/** Checks a figure (see the top); `tol` the touching distance (default `tolFor`), `yaw` and `pitch` how far its turrets turn and its guns rise for the posed check (radians). */
export function checkGeometry(t: Template, opts: { tol?: number; yaw?: number; pitch?: number } = {}): GeomReport {
  const { data: m, count } = meshOf(t);
  const nt = Math.floor(count / 3);
  const tol = opts.tol ?? tolFor(t);
  const ext = Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2]);
  const rest = posed(m, count, null, 0);
  const ids = weld(rest, count, [t.min[0] - 1, t.min[1] - 1, t.min[2] - 1], [t.max[0] + 1, t.max[1] + 1, t.max[2] + 1], Math.max(1e-4, ext * 1e-5));
  const { part, parts } = partsOf(m, nt, ids);
  let degenerate = 0;
  const tiny = (ext * 1e-5) ** 2;
  for (let i = 0; i < nt; i++) {
    const o = i * 9;
    const ux = rest[o + 3] - rest[o], uy = rest[o + 4] - rest[o + 1], uz = rest[o + 5] - rest[o + 2];
    const vx = rest[o + 6] - rest[o], vy = rest[o + 7] - rest[o + 1], vz = rest[o + 8] - rest[o + 2];
    if (Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2 < tiny) degenerate++;
  }
  const floating = floatingOf(m, rest, nt, part, parts, tol, t.anchor === 'ground');
  const moving = (t.joints ?? []).length > 0;
  const turned = moving ? posed(m, count, opts.yaw ?? 1.1, opts.pitch ?? 0.25) : rest;
  const floatingPosed = moving ? floatingOf(m, turned, nt, part, parts, tol, t.anchor === 'ground') : floating;
  return { triangles: nt, degenerate, inverted: invertedOf(m, rest, nt, ids, part, parts), floating, floatingPosed, tol };
}
