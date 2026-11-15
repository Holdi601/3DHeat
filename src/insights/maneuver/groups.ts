/**
 * Groups: the units of a side that move together. At every step the units
 * of one side and domain are linked when they are close (the domain's link
 * distance) and moving alike (velocities within half the faster one's
 * speed, or both standing) - single linkage, through a spatial hash. A
 * cluster takes over the group most of its members were in a step before,
 * so a group keeps its id while units join, leave or die; when a group
 * splits, the bigger part keeps it.
 *
 * Each step also gives the group's shape relative to its heading (`shapeOf`):
 * column and line by the spreads along and across, a wedge where the middle
 * leads and the sides trail, an echelon where the units step back to one
 * side, a box where they hold the corners.
 */

import { SCALE, velAt, type Frame } from './frame';
import { AIR, type FormationShape } from './types';

export interface GroupStep {
  s: number;
  members: Int32Array;
  cx: number;
  cy: number;
  cz: number;
  vx: number;
  vz: number;
  /** RMS distance of the members from the centroid. */
  spread: number;
  shape: FormationShape | null;
}

export interface Group {
  id: number;
  team: number;
  dom: number;
  steps: GroupStep[];
  /** Units ever in it. */
  units: Set<number>;
  maxSize: number;
}

export interface Groups {
  list: Group[];
  /** Group id of unit `u` at step `s` (`s * N + u`), -1 none. */
  at: Int32Array;
  /** Velocities per cell. */
  VX: Float32Array;
  VZ: Float32Array;
  /** Index of a group's step by step: `stepIndex(g, s)`. */
}

/** The group's step at `s`, or null. Steps are in order; a binary search. */
export function stepAt(g: Group, s: number): GroupStep | null {
  let lo = 0;
  let hi = g.steps.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    const v = g.steps[m].s;
    if (v === s) return g.steps[m];
    if (v < s) lo = m + 1;
    else hi = m - 1;
  }
  return null;
}

function find(p: Int32Array, a: number): number {
  while (p[a] !== a) {
    p[a] = p[p[a]];
    a = p[a];
  }
  return a;
}

/** The shape of points (along/across their heading), or null under three. */
export function shapeOf(xs: ArrayLike<number>, zs: ArrayLike<number>, hx: number, hz: number): FormationShape | null {
  const n = xs.length;
  if (n < 2) return null;
  let mx = 0;
  let mz = 0;
  for (let i = 0; i < n; i++) {
    mx += xs[i];
    mz += zs[i];
  }
  mx /= n;
  mz /= n;
  const h = Math.hypot(hx, hz);
  if (!(h > 0)) return null;
  const ux = hx / h;
  const uz = hz / h;
  const a = new Float64Array(n);
  const c = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dz = zs[i] - mz;
    a[i] = dx * ux + dz * uz;
    c[i] = -dx * uz + dz * ux;
  }
  if (n === 2) {
    const ang = Math.atan2(Math.abs(c[0] - c[1]), Math.abs(a[0] - a[1])) * (180 / Math.PI);
    return ang >= 65 ? 'line' : ang <= 25 ? 'column' : 'echelon';
  }
  let sa = 0;
  let sc = 0;
  for (let i = 0; i < n; i++) {
    sa += a[i] * a[i];
    sc += c[i] * c[i];
  }
  sa = Math.sqrt(sa / n);
  sc = Math.sqrt(sc / n);
  if (sa + sc <= 0) return 'cluster';
  if (sa >= 2.2 * sc) return 'column';
  if (sc >= 2.2 * sa) return 'line';
  const absC = Float64Array.from(c, Math.abs);
  const rAbs = corr(a, absC);
  const rC = corr(a, c);
  let left = 0;
  let right = 0;
  for (let i = 0; i < n; i++) {
    if (c[i] < -0.3 * sc) left++;
    else if (c[i] > 0.3 * sc) right++;
  }
  if (rAbs <= -0.6 && left > 0 && right > 0) return 'wedge';
  if (Math.abs(rC) >= 0.75) return 'echelon';
  if (n >= 4) {
    let edge = 0;
    for (let i = 0; i < n; i++) if (Math.abs(a[i]) > 0.6 * sa || Math.abs(c[i]) > 0.6 * sc) edge++;
    if (edge / n >= 0.8 && sa / sc > 0.5 && sa / sc < 2) return 'box';
  }
  return 'cluster';
}

export function corr(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const n = a.length;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i];
    mb += b[i];
  }
  ma /= n;
  mb /= n;
  let sab = 0;
  let saa = 0;
  let sbb = 0;
  for (let i = 0; i < n; i++) {
    sab += (a[i] - ma) * (b[i] - mb);
    saa += (a[i] - ma) ** 2;
    sbb += (b[i] - mb) ** 2;
  }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : 0;
}

export interface GroupOptions {
  /** Link distance as a multiple of the domain's (1). */
  scale?: number;
  /** Link only units moving alike (true). */
  velocity?: boolean;
  /** Domains grouped (all). */
  doms?: number[];
  /** Velocities already worked out. */
  vel?: { VX: Float32Array; VZ: Float32Array };
}

export function findGroups(f: Frame, opt: GroupOptions = {}): Groups {
  const { S, N, X, Z, alive } = f;
  const scale = opt.scale ?? 1;
  const byVel = opt.velocity ?? true;
  let VX: Float32Array;
  let VZ: Float32Array;
  if (opt.vel) ({ VX, VZ } = opt.vel);
  else {
    VX = new Float32Array(S * N);
    VZ = new Float32Array(S * N);
    for (let s = 0; s < S; s++)
      for (let u = 0; u < N; u++) {
        const v = velAt(f, s, u);
        if (v) {
          VX[s * N + u] = v[0];
          VZ[s * N + u] = v[1];
        }
      }
  }
  const at = new Int32Array(S * N).fill(-1);
  const list: Group[] = [];
  const parent = new Int32Array(N);
  // Buckets: one per side and domain.
  const buckets = new Map<number, number[]>();
  for (let u = 0; u < N; u++) {
    if (opt.doms && !opt.doms.includes(f.dom[u])) continue;
    const k = f.team[u] * 8 + f.dom[u];
    let l = buckets.get(k);
    if (!l) buckets.set(k, (l = []));
    l.push(u);
  }
  const hash = new Map<number, number[]>();
  const counts = new Map<number, number>();
  for (let s = 0; s < S; s++) {
    for (let u = 0; u < N; u++) parent[u] = u;
    for (const units of buckets.values()) {
      const d = f.dom[units[0]];
      const sc = SCALE[d];
      const L = sc.link * f.upm * scale;
      const mv = sc.move * f.upm;
      hash.clear();
      for (const u of units) {
        const k = s * N + u;
        if (!alive[k]) continue;
        const hk = Math.floor(X[k] / L) * 1_000_003 + Math.floor(Z[k] / L);
        let l = hash.get(hk);
        if (!l) hash.set(hk, (l = []));
        l.push(u);
      }
      for (const u of units) {
        const k = s * N + u;
        if (!alive[k]) continue;
        const gx = Math.floor(X[k] / L);
        const gz = Math.floor(Z[k] / L);
        const m1 = Math.hypot(VX[k], VZ[k]);
        for (let dx = -1; dx <= 1; dx++)
          for (let dz = -1; dz <= 1; dz++) {
            const l = hash.get((gx + dx) * 1_000_003 + gz + dz);
            if (!l) continue;
            for (const w of l) {
              if (w <= u) continue;
              const kw = s * N + w;
              if (Math.hypot(X[kw] - X[k], Z[kw] - Z[k]) > L) continue;
              const m2 = Math.hypot(VX[kw], VZ[kw]);
              const slow1 = m1 < mv;
              const slow2 = m2 < mv;
              if (byVel && slow1 !== slow2) continue;
              if (byVel && !slow1 && Math.hypot(VX[kw] - VX[k], VZ[kw] - VZ[k]) > 0.5 * Math.max(m1, m2) + mv) continue;
              const a = find(parent, u);
              const b = find(parent, w);
              if (a !== b) parent[a] = b;
            }
          }
      }
    }
    // Clusters at this step.
    const clusters = new Map<number, number[]>();
    for (let u = 0; u < N; u++) {
      if (!alive[s * N + u] || (opt.doms && !opt.doms.includes(f.dom[u]))) continue;
      const r = find(parent, u);
      let l = clusters.get(r);
      if (!l) clusters.set(r, (l = []));
      l.push(u);
    }
    // Biggest first: they claim their predecessor's id first.
    const ordered = [...clusters.values()].sort((a, b) => b.length - a.length);
    const claimed = new Set<number>();
    for (const mem of ordered) {
      counts.clear();
      for (const u of mem) {
        // The group it was in at most three steps back.
        for (let b = 1; b <= 3 && s - b >= 0; b++) {
          const g = at[(s - b) * N + u];
          if (g >= 0) {
            counts.set(g, (counts.get(g) ?? 0) + 1);
            break;
          }
        }
      }
      let best = -1;
      let bestN = 0;
      for (const [g, c] of counts) if (c > bestN && !claimed.has(g)) ((best = g), (bestN = c));
      let grp: Group;
      if (best >= 0 && bestN * 2 >= Math.min(mem.length, list[best].steps[list[best].steps.length - 1].members.length)) grp = list[best];
      else {
        grp = { id: list.length, team: f.team[mem[0]], dom: f.dom[mem[0]], steps: [], units: new Set(), maxSize: 0 };
        list.push(grp);
      }
      claimed.add(grp.id);
      let cx = 0;
      let cy = 0;
      let cz = 0;
      let vx = 0;
      let vz = 0;
      for (const u of mem) {
        const k = s * N + u;
        at[k] = grp.id;
        grp.units.add(u);
        cx += X[k];
        cy += f.Y[k];
        cz += Z[k];
        vx += VX[k];
        vz += VZ[k];
      }
      const n = mem.length;
      cx /= n;
      cy /= n;
      cz /= n;
      vx /= n;
      vz /= n;
      let sp = 0;
      for (const u of mem) sp += (X[s * N + u] - cx) ** 2 + (Z[s * N + u] - cz) ** 2;
      sp = Math.sqrt(sp / n);
      let shape: FormationShape | null = null;
      if (n >= 2) {
        const xs = mem.map((u) => X[s * N + u]);
        const zs = mem.map((u) => Z[s * N + u]);
        const mv = SCALE[grp.dom].move * f.upm;
        let hx = vx;
        let hz = vz;
        if (Math.hypot(vx, vz) < mv) {
          // Standing: the line it stands on, by its principal axis, read across it.
          const ax = principal(xs, zs);
          hx = -ax[1];
          hz = ax[0];
        }
        shape = shapeOf(xs, zs, hx, hz);
        if (grp.dom === AIR && shape === 'line' && n < 3) shape = 'line';
      }
      grp.steps.push({ s, members: Int32Array.from(mem), cx, cy, cz, vx, vz, spread: sp, shape });
      if (n > grp.maxSize) grp.maxSize = n;
    }
  }
  return { list, at, VX, VZ };
}

/** Unit vector of the points' principal axis. */
export function principal(xs: ArrayLike<number>, zs: ArrayLike<number>): [number, number] {
  const n = xs.length;
  let mx = 0;
  let mz = 0;
  for (let i = 0; i < n; i++) {
    mx += xs[i];
    mz += zs[i];
  }
  mx /= n;
  mz /= n;
  let sxx = 0;
  let szz = 0;
  let sxz = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dz = zs[i] - mz;
    sxx += dx * dx;
    szz += dz * dz;
    sxz += dx * dz;
  }
  const th = 0.5 * Math.atan2(2 * sxz, sxx - szz);
  return [Math.cos(th), Math.sin(th)];
}

/** The convex hull of points (ground x, z), as a ring. */
export function hull(pts: [number, number][]): [number, number][] {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: [number, number][] = [];
  for (const q of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: [number, number][] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  up.pop();
  lo.pop();
  return lo.concat(up);
}
