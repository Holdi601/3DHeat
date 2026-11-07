/**
 * Parts the figures are built from: a lofted body from its outlines or its
 * sections, a wing or fin with a true airfoil from its planform, solids of
 * revolution (nacelles, pods, spinners, barrels), tubes, rounded blobs, and
 * bevelled plates, prisms and boxes for hulls, decks and blocks. All take
 * points as (forward, side, up) in the kit's frame.
 *
 * Every part is a `Mesh`, so each vertex gets a normal - smooth over curved
 * surfaces, sharp at creases - and the figure is lit where it is placed
 * (`light.ts`). How many segments and stations a part gets follows the kit's
 * detail level (`detail`), so the coarse build of a figure is the same shape
 * with fewer triangles.
 */

import { at, type Frame3, type Rgb, type Vec3 } from '../race/geometry';
import { detail, PAINT, type FigBuffer } from './kit';
import { Mesh } from './mesh';
import type { Section } from '../race/shapes';

export type P2 = [number, number];

/** Glass is glossy; everything else is paint. */
function glossOf(col: Rgb): number {
  const g = PAINT.glass;
  return col === g || (col[0] === g[0] && col[1] === g[1] && col[2] === g[2]) ? 1 : 0;
}

/** Writes a finished mesh, glass glossy, see-through parts as drawn. */
function put(out: FigBuffer, m: Mesh, col: Rgb, alpha: number, crease?: number): void {
  m.emit(out, { alpha, gloss: glossOf(col), crease });
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function norm(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function mean(points: Vec3[]): Vec3 {
  const c: Vec3 = [0, 0, 0];
  for (const p of points) for (let i = 0; i < 3; i++) c[i] += p[i] / points.length;
  return c;
}

/** Signed area of a polygon, positive counter-clockwise. */
function area2(poly: P2[]): number {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % poly.length];
    a += x0 * y1 - x1 * y0;
  }
  return a / 2;
}

/** The polygon counter-clockwise, its repeated points dropped. */
function ccw(poly: P2[]): P2[] {
  const q = poly.filter((p, i) => {
    const n = poly[(i + 1) % poly.length];
    return Math.abs(p[0] - n[0]) > 1e-9 || Math.abs(p[1] - n[1]) > 1e-9;
  });
  return area2(q) < 0 ? [...q].reverse() : q;
}

/**
 * A polygon (counter-clockwise) moved in by `d` along each edge, its corners
 * mitred and the mitre held to three times `d`.
 */
function inset(poly: P2[], d: number): P2[] {
  const n = poly.length;
  const normal = (i: number): P2 => {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % n];
    const l = Math.hypot(x1 - x0, y1 - y0) || 1;
    // Inward for a counter-clockwise polygon: the edge turned left.
    return [-(y1 - y0) / l, (x1 - x0) / l];
  };
  return poly.map((p, i) => {
    const a = normal((i + n - 1) % n);
    const b = normal(i);
    const dot = a[0] * b[0] + a[1] * b[1];
    let k = d / Math.max(0.2, 1 + dot);
    const mx = (a[0] + b[0]) * k;
    const my = (a[1] + b[1]) * k;
    const len = Math.hypot(mx, my);
    k = len > 3 * d ? (3 * d) / len : 1;
    return [p[0] + mx * k, p[1] + my * k];
  });
}

// ---------------------------------------------------------------- flat parts

/**
 * A prism: the side profile `profile` - points (forward, up), in order round
 * it - pushed from `side0` to `side1` across, its edges bevelled. Hulls,
 * tracks, cabins; faces that look up take `topCol`.
 */
export function prism(out: FigBuffer, fr: Frame3, profile: P2[], side0: number, side1: number, col: Rgb, alpha = 1, topCol?: Rgb): void {
  const poly = ccw(profile);
  if (poly.length < 3) return;
  const width = Math.abs(side1 - side0);
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const size = Math.min(width, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const bev = Math.min(0.1, size * 0.06);
  const lo = Math.min(side0, side1);
  const hi = Math.max(side0, side1);
  const small = bev > 0.004 ? inset(poly, bev) : poly;
  const rings: [P2[], number][] = bev > 0.004 ? [[small, lo], [poly, lo + bev], [poly, hi - bev], [small, hi]] : [[poly, lo], [poly, hi]];
  const m = new Mesh();
  const n = poly.length;
  const c: P2 = [xs.reduce((s, x) => s + x, 0) / n, ys.reduce((s, y) => s + y, 0) / n];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    // An edge's outward normal in the profile, for its colour.
    const ex = poly[j][0] - poly[i][0];
    const ey = poly[j][1] - poly[i][1];
    let ny = -ex;
    const nx = ey;
    const mx = (poly[i][0] + poly[j][0]) / 2 - c[0];
    const my = (poly[i][1] + poly[j][1]) / 2 - c[1];
    if (nx * mx + ny * my < 0) ny = -ny;
    const up = topCol && ny > Math.abs(nx) * 0.5;
    const cc = up ? topCol! : col;
    const strip = rings.map(([p, s]) => [m.v(at(fr, p[i][0], s, p[i][1]), cc), m.v(at(fr, p[j][0], s, p[j][1]), cc)]);
    m.grid(strip, false);
  }
  for (const [k, first] of [[0, true], [rings.length - 1, false]] as const) {
    const [p, s] = rings[k];
    const ids = p.map((q) => m.v(at(fr, q[0], s, q[1]), col));
    for (const [a, b, d] of triangulate(p)) {
      if (first) m.tri(ids[a], ids[d], ids[b]);
      else m.tri(ids[a], ids[b], ids[d]);
    }
  }
  put(out, m, col, alpha, 20);
}

/**
 * A flat plate: the plan `outline` - points (forward, side) - at height
 * `up`, `thickness` thick: decks, fenders, panels. (Wings use `foil`.)
 */
export function plate(out: FigBuffer, fr: Frame3, outline: P2[], up: number, thickness: number, col: Rgb, alpha = 1): void {
  slab(out, fr, outline, (a, b) => [a, b, up], [0, 0, 1], thickness, col, alpha);
}

/**
 * An upright plate: the outline `outline` - points (forward, up) - at `side`
 * across, `thickness` thick. Walls, shields, flags.
 */
export function fin(out: FigBuffer, fr: Frame3, outline: P2[], side: number, thickness: number, col: Rgb, alpha = 1): void {
  prism(out, fr, outline, side - thickness / 2, side + thickness / 2, col, alpha);
}

/**
 * A thin flat part from a simple polygon, convex or not: `map` takes a
 * polygon point to the mid-surface (forward, side, up), `normal` is the way
 * the thickness goes. Flat faces, sharp edges: decks, plates, armour.
 */
export function slab(out: FigBuffer, fr: Frame3, poly: P2[], map: (a: number, b: number) => Vec3, normal: Vec3, thickness: number, col: Rgb, alpha = 1, underCol?: Rgb): void {
  const q = ccw(poly);
  if (q.length < 3) return;
  const t = thickness / 2;
  const mid = q.map(([a, b]) => map(a, b));
  const m = new Mesh();
  const top = mid.map(([f, s, u]) => m.v(at(fr, f + normal[0] * t, s + normal[1] * t, u + normal[2] * t), col));
  const bot = mid.map(([f, s, u]) => m.v(at(fr, f - normal[0] * t, s - normal[1] * t, u - normal[2] * t), underCol ?? col));
  // Edges with their own vertices, so the top's and the bottom's colours stay apart.
  const topE = mid.map(([f, s, u]) => m.v(at(fr, f + normal[0] * t, s + normal[1] * t, u + normal[2] * t), col));
  const botE = mid.map(([f, s, u]) => m.v(at(fr, f - normal[0] * t, s - normal[1] * t, u - normal[2] * t), col));
  for (const [i, j, k] of triangulate(q)) {
    m.tri(top[i], top[j], top[k]);
    m.tri(bot[i], bot[k], bot[j]);
  }
  for (let i = 0; i < q.length; i++) {
    const j = (i + 1) % q.length;
    m.quad(topE[j], topE[i], botE[i], botE[j]);
  }
  put(out, m, col, alpha, 30);
}

/**
 * A six-faced solid from its bottom and top faces, each four points (forward,
 * side, up) in the same order round it: a frustum, a sloped casemate, a turret
 * with sloped sides. Flat faces, sharp edges; the top in `topCol`.
 */
export function hexa(out: FigBuffer, fr: Frame3, bottom: Vec3[], top: Vec3[], col: Rgb, alpha = 1, topCol?: Rgb): void {
  const m = new Mesh();
  const b = bottom.map(([f, s, u]) => m.v(at(fr, f, s, u), col));
  const t = top.map(([f, s, u]) => m.v(at(fr, f, s, u), col));
  m.grid([b, t], true);
  m.quad(b[3], b[2], b[1], b[0]);
  const tc = top.map(([f, s, u]) => m.v(at(fr, f, s, u), topCol ?? col));
  m.quad(tc[0], tc[1], tc[2], tc[3]);
  put(out, m, col, alpha, 20);
}

/** A box by its centre (forward, side, up) and its length, width and height, its edges bevelled. */
export function block(out: FigBuffer, fr: Frame3, c: Vec3, l: number, w: number, h: number, col: Rgb, alpha = 1): void {
  const x0 = c[0] - l / 2;
  const x1 = c[0] + l / 2;
  const z0 = c[2] - h / 2;
  const z1 = c[2] + h / 2;
  prism(out, fr, [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], c[1] - w / 2, c[1] + w / 2, col, alpha);
}

/**
 * A box of length `l`, width `w` and height `h` round `c` (forward, side, up),
 * turned `yaw` radians to the right about up and then `pitch` radians nose up
 * about its own side axis: raised launchers, tilted radar faces, rails.
 */
export function tiltBox(out: FigBuffer, fr: Frame3, c: Vec3, l: number, w: number, h: number, pitch: number, col: Rgb, alpha = 1, yaw = 0): void {
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const p = (a: number, b: number, d: number): Vec3 => {
    // Pitch in the forward-up plane, then yaw in the forward-side plane.
    const f = a * cp - d * sp;
    const u = a * sp + d * cp;
    return [c[0] + f * cy - b * sy, c[1] + f * sy + b * cy, c[2] + u];
  };
  const L = l / 2;
  const W = w / 2;
  const H = h / 2;
  hexa(out, fr, [p(-L, -W, -H), p(L, -W, -H), p(L, W, -H), p(-L, W, -H)], [p(-L, -W, H), p(L, -W, H), p(L, W, H), p(-L, W, H)], col, alpha);
}

/**
 * A flat disc lying level at height `up`, centre (forward, side): rotor discs,
 * areas on the ground. A see-through disc is drawn unlit, the same from
 * either side.
 */
export function ring(out: FigBuffer, fr: Frame3, f: number, s: number, up: number, radius: number, col: Rgb, alpha = 1, segments = 24, inner = 0): void {
  const n = detail(segments, 8);
  const m = new Mesh();
  const p = (a: number, r: number) => m.v(at(fr, f + Math.cos(a) * r, s + Math.sin(a) * r, up), col);
  const outer = Array.from({ length: n }, (_, i) => p((i / n) * Math.PI * 2, radius));
  if (inner > 0) m.grid([outer, Array.from({ length: n }, (_, i) => p((i / n) * Math.PI * 2, inner))], true);
  else m.fan(m.v(at(fr, f, s, up), col), outer, false);
  const facing = sub(at(fr, 0, 0, 1), at(fr, 0, 0, 0));
  m.emit(out, { alpha, gloss: glossOf(col), facing, unlit: alpha < 1 });
}

/** A flat disc upright in the frame's forward-up plane, `side` across, centred `up` high: a wheel's face. */
export function disc(out: FigBuffer, fr: Frame3, side: number, up: number, radius: number, col: Rgb, segments = 12): void {
  const n = detail(segments, 8);
  const m = new Mesh();
  const rim = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return m.v(at(fr, Math.cos(a) * radius, side, up + Math.sin(a) * radius), col);
  });
  m.fan(m.v(at(fr, 0, side, up), col), rim, false);
  m.emit(out, { facing: sub(at(fr, 0, Math.sign(side) || 1, 0), at(fr, 0, 0, 0)) });
}

// ---------------------------------------------------------------- round parts

/** Ring vertices round an axis point: `u`, `v` unit vectors across it, `n` of them. */
function ringAround(m: Mesh, c: Vec3, u: Vec3, v: Vec3, r: number, n: number, col: Rgb): number[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const cu = Math.cos(t) * r;
    const cv = Math.sin(t) * r;
    return m.v([c[0] + u[0] * cu + v[0] * cv, c[1] + u[1] * cu + v[1] * cv, c[2] + u[2] * cu + v[2] * cv], col);
  });
}

/** Segments round a part of radius `r`: thin rods get few, bodies many. */
function roundSegments(r: number, asked: number): number {
  const want = r < 0.05 ? 6 : r < 0.15 ? 10 : r < 0.5 ? 14 : 18;
  return detail(Math.max(asked, want), r < 0.05 ? 4 : 6);
}

/**
 * A solid of revolution between `a` and `b` (points forward, side, up):
 * `profile` gives (share of the way from a to b, radius) in order. Ends of
 * radius 0 close to a point, others with a flat cap. Nacelles, pods, drop
 * tanks, spinners, barrels with their muzzle brakes.
 */
export function lathe(out: FigBuffer, fr: Frame3, a: Vec3, b: Vec3, profile: P2[], col: Rgb, segments = 0, alpha = 1, opts: { open?: boolean; inner?: boolean } = {}): void {
  const wa = at(fr, a[0], a[1], a[2]);
  const wb = at(fr, b[0], b[1], b[2]);
  const axis = norm(sub(wb, wa));
  const helper: Vec3 = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = norm(cross(axis, helper));
  const v = norm(cross(axis, u));
  const rmax = Math.max(...profile.map((p) => p[1]));
  const n = roundSegments(rmax, segments);
  const m = new Mesh();
  const pointOf = (t: number): Vec3 => [wa[0] + (wb[0] - wa[0]) * t, wa[1] + (wb[1] - wa[1]) * t, wa[2] + (wb[2] - wa[2]) * t];
  const rows = profile.map(([t, r]) => (r > 1e-5 ? ringAround(m, pointOf(t), u, v, r, n, col) : Array.from({ length: n }, () => -1)));
  // A ring of radius 0 is one point: a pole.
  const poles = profile.map(([t, r]) => (r > 1e-5 ? -1 : m.v(pointOf(t), col)));
  for (let k = 0; k + 1 < rows.length; k++) {
    const r0 = rows[k][0] < 0 ? rows[k].map(() => poles[k]) : rows[k];
    const r1 = rows[k + 1][0] < 0 ? rows[k + 1].map(() => poles[k + 1]) : rows[k + 1];
    m.grid([r0, r1], true);
  }
  const last = rows.length - 1;
  if (opts.open || opts.inner) {
    // A shell without caps (a nozzle's lip, its inside): which way is out is said by the axis.
    m.emit(out, { alpha, gloss: glossOf(col), axis: [wa, axis, opts.inner] });
    return;
  }
  if (rows[0][0] >= 0) m.fan(m.v(pointOf(profile[0][0]), col), rows[0], true);
  if (rows[last][0] >= 0) m.fan(m.v(pointOf(profile[last][0]), col), rows[last], false);
  put(out, m, col, alpha);
}

/** A round tube from `a` to `b` - points (forward, side, up) - of radius `r0` at `a` and `r1` at `b`, its ends capped. */
export function tube(out: FigBuffer, fr: Frame3, a: Vec3, b: Vec3, r0: number, r1 = r0, col: Rgb, segments = 8, alpha = 1): void {
  // A thin rod's ends are too small to see: left open.
  lathe(out, fr, a, b, [[0, r0], [1, r1]], col, Math.min(segments, 6), alpha, { open: Math.max(r0, r1) < 0.06 });
}

/** A cross-section's ring: a superellipse of exponent `round` (2 an ellipse, higher squarer). */
function superRing(m: Mesh, fr: Frame3, x: number, side: number, w: number, z: number, h: number, round: number, n: number, col: Rgb, topCol?: Rgb): number[] {
  const e = 2 / round;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const upper = topCol && s > 0.35;
    return m.v(at(fr, x, side + w * Math.sign(c) * Math.abs(c) ** e, z + h * Math.sign(s) * Math.abs(s) ** e), upper ? topCol! : col);
  });
}

/**
 * A body through rings at stations: each (x, centre side, half-width, centre
 * height, half-height, roundness). Ends small against the body close to a
 * point at their centre, so a nose or a tail comes to a smooth tip; larger
 * ones take a flat cap (a nozzle, a cut-off tail).
 */
function loftRings(out: FigBuffer, fr: Frame3, st: { x: number; y: number; w: number; z: number; h: number; r: number }[], col: Rgb, n: number, alpha: number, topCol?: Rgb): void {
  if (st.length < 2) return;
  const m = new Mesh();
  const rows = st.map((s) => superRing(m, fr, s.x, s.y, s.w, s.z, s.h, s.r, n, col, topCol));
  m.grid(rows, true);
  const big = Math.max(...st.map((s) => Math.max(s.w, s.h)));
  for (const [k, first] of [[0, true], [st.length - 1, false]] as const) {
    const s = st[k];
    const centre = m.v(at(fr, s.x, s.y, s.z), col);
    m.fan(centre, rows[k], first);
    void big;
  }
  put(out, m, col, alpha);
}

/** Catmull-Rom between four values. */
function cr(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

/**
 * A lofted body through cross-sections (each a rounded rectangle of exponent
 * `round`), smoothed between them, both ends closed.
 */
export function body(out: FigBuffer, fr: Frame3, sections: Section[], col: Rgb, segments = 10, round = 2.4, alpha = 1): void {
  if (sections.length < 2) return;
  const n = detail(segments <= 8 ? 14 : 18, 6);
  const per = detail(3, 1);
  const st: { x: number; y: number; w: number; z: number; h: number; r: number }[] = [];
  const S = sections;
  for (let k = 0; k + 1 < S.length; k++) {
    const p0 = S[Math.max(0, k - 1)];
    const p1 = S[k];
    const p2 = S[k + 1];
    const p3 = S[Math.min(S.length - 1, k + 2)];
    for (let i = 0; i < per; i++) {
      const t = i / per;
      st.push({
        x: p1.x + (p2.x - p1.x) * t,
        y: cr(p0.y ?? 0, p1.y ?? 0, p2.y ?? 0, p3.y ?? 0, t),
        w: Math.max(1e-3, cr(p0.w, p1.w, p2.w, p3.w, t)),
        z: cr(p0.z, p1.z, p2.z, p3.z, t),
        h: Math.max(1e-3, cr(p0.h, p1.h, p2.h, p3.h, t)),
        r: round,
      });
    }
  }
  const e = S[S.length - 1];
  st.push({ x: e.x, y: e.y ?? 0, w: e.w, z: e.z, h: e.h, r: round });
  loftRings(out, fr, st, col, n, alpha);
}

/** A rounded blob centred at (forward, side, up) with half-sizes along each: heads, domes, clouds. */
export function blob(out: FigBuffer, fr: Frame3, c: Vec3, half: Vec3, col: Rgb, alpha = 1, rings = 6, segments = 10): void {
  const size = Math.max(half[0], half[1], half[2]);
  const nr = detail(Math.max(rings, size < 0.1 ? 5 : 9), 4);
  const ns = detail(Math.max(segments, size < 0.1 ? 8 : 16), 6);
  const m = new Mesh();
  const rows: number[][] = [];
  for (let i = 1; i < nr; i++) {
    const t = Math.PI * (i / nr);
    const x = c[0] + half[0] * Math.cos(t);
    const k = Math.sin(t);
    rows.push(superRing(m, fr, x, c[1], half[1] * k, c[2], half[2] * k, 2, ns, col));
  }
  m.grid(rows, true);
  m.fan(m.v(at(fr, c[0] + half[0], c[1], c[2]), col), rows[0], true);
  m.fan(m.v(at(fr, c[0] - half[0], c[1], c[2]), col), rows[rows.length - 1], false);
  put(out, m, col, alpha);
}

/**
 * A wheel: a tyre round the frame's sideways axis, centred `side` across and
 * `up` high, `radius` and `width`, its shoulders rounded, the rim and hub on
 * its outer face in `rimCol`. `outward` is +1 when the outer face is on the
 * frame's right.
 */
export function wheel(out: FigBuffer, fr: Frame3, side: number, up: number, radius: number, width: number, tyre: Rgb, rimCol: Rgb, outward: number, segments = 16): void {
  const o = outward >= 0 ? 1 : -1;
  const w = width / 2;
  const a: Vec3 = [0, side - o * w, up];
  const b: Vec3 = [0, side + o * w, up];
  const r = radius;
  // Inner face to outer face: sidewall, rounded tread, sidewall, into the rim.
  lathe(out, fr, a, b, [[0, r * 0.45], [0, r * 0.8], [0.12, r * 0.95], [0.3, r], [0.7, r], [0.88, r * 0.95], [1, r * 0.8], [1, r * 0.62]], tyre, segments);
  // The rim, just proud of the tyre's face, and the hub standing out of it.
  const rimAt = (t: number): Vec3 => [0, side + o * w * t, up];
  lathe(out, fr, rimAt(0.9), rimAt(1.03), [[0, r * 0.6], [1, r * 0.6]], rimCol, segments);
  lathe(out, fr, rimAt(1.03), rimAt(1.15), [[0, r * 0.24], [0.6, r * 0.18], [1, 0]], rimCol, 10);
}

// ---------------------------------------------------------------- outline-driven parts

/**
 * A body given by its silhouettes: the side profile's top and bottom and the
 * plan's half-width, each a polyline of (x, value) with x running one way,
 * and how round its cross-section is. Sampled at stations along x and lofted
 * through rounded rectangles, so the body seen from the side, from above and
 * from the front matches the outlines. Coordinates are (forward, up) for the
 * profile and (forward, half-width) for the plan.
 */
export interface Outline {
  top: P2[];
  bottom: P2[];
  plan: P2[];
  /** Superellipse exponent: 2 round (a cast turret, a fuselage), 4 a rounded box, 8 and up hard-edged; or (x, exponent) along the body. */
  round?: number | P2[];
  /** The body's centre line off to the side (nacelles, pods). */
  side?: number;
  /** At least this many stations (default 24); every outline corner is a station too. */
  stations?: number;
}

/** Linear interpolation along a polyline of (x, value), sorted or not; clamped at its ends. */
export function lerpPoly(p: P2[], x: number): number {
  const q = p[0][0] <= p[p.length - 1][0] ? p : [...p].reverse();
  if (x <= q[0][0]) return q[0][1];
  for (let i = 1; i < q.length; i++) {
    if (x <= q[i][0]) {
      const [x0, y0] = q[i - 1];
      const [x1, y1] = q[i];
      return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return q[q.length - 1][1];
}

/**
 * The stations an outline is sampled at: every corner, and between them
 * closer together towards the ends, where a nose or a tail curves most.
 */
function stationsOf(o: Outline): number[] {
  const lists = [o.top, o.bottom, o.plan];
  const x0 = Math.max(...lists.map((l) => Math.min(...l.map((p) => p[0]))));
  const x1 = Math.min(...lists.map((l) => Math.max(...l.map((p) => p[0]))));
  const xs = new Set<number>();
  for (const l of lists) for (const [x] of l) if (x >= x0 - 1e-9 && x <= x1 + 1e-9) xs.add(x);
  const n = detail(Math.min(o.stations ?? 20, 20), 6);
  for (let i = 0; i <= n; i++) {
    // Half even, half bunched to the ends.
    const t = i / n;
    const s = 0.5 * t + 0.25 * (1 - Math.cos(Math.PI * t));
    xs.add(x0 + (x1 - x0) * s);
  }
  const sorted = [...xs].sort((a, b) => a - b);
  // Corners that fall within a hair of an even station make slivers; drop them.
  return sorted.filter((x, i) => i === 0 || x - sorted[i - 1] > (x1 - x0) * 2e-3);
}

export function outlineBody(out: FigBuffer, fr: Frame3, o: Outline, col: Rgb, segments = 14, alpha = 1, topCol?: Rgb): void {
  const side = o.side ?? 0;
  const big = Math.max(...o.plan.map((p) => p[1]), ...o.top.map((p) => p[1]).map((t, i) => (t - (o.bottom[Math.min(i, o.bottom.length - 1)]?.[1] ?? 0)) / 2));
  // Round enough for its size: a fuselage gets twenty sides, a pod or a fairing fewer.
  const n = detail(big > 0.9 ? 20 : big > 0.35 ? 16 : 12, 8) - (segments <= 12 ? 2 : 0);
  const st = stationsOf(o).map((x) => {
    const w = Math.max(1e-3, lerpPoly(o.plan, x));
    const t = lerpPoly(o.top, x);
    const b = lerpPoly(o.bottom, x);
    const r = typeof o.round === 'number' ? o.round : o.round ? lerpPoly(o.round, x) : 2.4;
    return { x, y: side, w, z: (t + b) / 2, h: Math.max(1e-3, (t - b) / 2), r };
  });
  loftRings(out, fr, st, col, n, alpha, topCol);
}

/** Triangles of a simple polygon (convex or not), by ear clipping; indices into it. */
export function triangulate(poly: P2[]): [number, number, number][] {
  const n = poly.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % n];
    area += x0 * y1 - x1 * y0;
  }
  const isCcw = area > 0;
  const idx = Array.from({ length: n }, (_, i) => i);
  const tris: [number, number, number][] = [];
  const crs = (a: P2, b: P2, c: P2) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inside = (p: P2, a: P2, b: P2, c: P2) => {
    const d1 = crs(a, b, p);
    const d2 = crs(b, c, p);
    const d3 = crs(c, a, p);
    return isCcw ? d1 > 1e-12 && d2 > 1e-12 && d3 > 1e-12 : d1 < -1e-12 && d2 < -1e-12 && d3 < -1e-12;
  };
  let guard = 0;
  while (idx.length > 3 && guard++ < n * n) {
    let clipped = false;
    for (let i = 0; i < idx.length; i++) {
      const ia = idx[(i + idx.length - 1) % idx.length];
      const ib = idx[i];
      const ic = idx[(i + 1) % idx.length];
      const c = crs(poly[ia], poly[ib], poly[ic]);
      if (isCcw ? c <= 0 : c >= 0) continue;
      if (idx.some((j) => j !== ia && j !== ib && j !== ic && inside(poly[j], poly[ia], poly[ib], poly[ic]))) continue;
      tris.push([ia, ib, ic]);
      idx.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) break;
  }
  if (idx.length === 3) tris.push([idx[0], idx[1], idx[2]]);
  return tris;
}

// ---------------------------------------------------------------- airfoils

/** The chord's cut through a planform at span station `s`: its lowest and highest chord coordinate. */
function cutAt(poly: P2[], s: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [c0, s0] = poly[i];
    const [c1, s1] = poly[(i + 1) % poly.length];
    if (s < Math.min(s0, s1) - 1e-9 || s > Math.max(s0, s1) + 1e-9) continue;
    if (Math.abs(s1 - s0) < 1e-12) {
      lo = Math.min(lo, c0, c1);
      hi = Math.max(hi, c0, c1);
    } else {
      const c = c0 + ((c1 - c0) * (s - s0)) / (s1 - s0);
      lo = Math.min(lo, c);
      hi = Math.max(hi, c);
    }
  }
  return hi >= lo ? [lo, hi] : [0, 0];
}

/** A symmetric airfoil's half-thickness along the chord (0 leading edge, 1 trailing edge), 1 at its thickest. */
function airfoil(x: number): number {
  if (x >= 1) return 0;
  const y = 0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4;
  return Math.max(0, y / 0.10015);
}

/**
 * A wing, tailplane, fin, canard or blade from its planform, with a true
 * airfoil: a round leading edge, a sharp trailing edge, thickest a third of
 * the way back. `poly` is the planform (chord coordinate, span coordinate);
 * `map` takes it to the mid-surface (forward, side, up) and `normal` is the
 * way the thickness goes. `thickness` is the greatest thickness, metres,
 * fixed or by span station; it never passes a third of the local chord. The
 * leading edge is at the chord coordinate's high end. With `span: 'a'` the
 * polygon's first coordinate runs along the span instead (rotor blades).
 */
export function foil(
  out: FigBuffer,
  fr: Frame3,
  poly: P2[],
  map: (a: number, b: number) => Vec3,
  normal: Vec3,
  thickness: number | ((s: number) => number),
  col: Rgb,
  opts: { alpha?: number; under?: Rgb; span?: 'a' | 'b'; ratio?: number } = {},
): void {
  const { alpha = 1, under, span = 'b' } = opts;
  const ratio = opts.ratio ?? 0.34;
  // Work in (chord, span); `pt` takes it back to the caller's (a, b).
  const q: P2[] = span === 'b' ? poly : poly.map(([a, b]) => [b, a]);
  const pt = (c: number, s: number): Vec3 => (span === 'b' ? map(c, s) : map(s, c));
  const ss = [...new Set(q.map((p) => p[1]))].sort((a, b) => a - b);
  if (ss.length < 2) return;
  const range = ss[ss.length - 1] - ss[0];
  const eps = range * 1e-4;
  // Stations: every corner; where the edges jump there (a dogtooth, a notch), one just either side.
  const st: number[] = [ss[0]];
  for (let i = 1; i + 1 < ss.length; i++) {
    const s = ss[i];
    const a = cutAt(q, s - eps);
    const b = cutAt(q, s + eps);
    const jump = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) > Math.max(1e-3, (a[1] - a[0]) * 0.02);
    if (jump) st.push(s - eps, s + eps);
    else st.push(s);
  }
  st.push(ss[ss.length - 1]);
  // Long gaps get stations between, so the thickness can follow the span.
  const stations: number[] = [];
  const most = range / detail(4, 2);
  for (let i = 0; i < st.length; i++) {
    if (i > 0) {
      const gap = st[i] - st[i - 1];
      const k = Math.floor(gap / most);
      for (let j = 1; j <= k; j++) stations.push(st[i - 1] + (gap * j) / (k + 1));
    }
    stations.push(st[i]);
  }
  const np = detail(5, 3);
  const xs = Array.from({ length: np + 1 }, (_, i) => (1 - Math.cos((Math.PI * i) / np)) / 2);
  const m = new Mesh();
  const rows: number[][] = [];
  for (const s of stations) {
    const [lo, hi] = cutAt(q, Math.min(ss[ss.length - 1], Math.max(ss[0], s)));
    const chord = hi - lo;
    const T = Math.min(typeof thickness === 'number' ? thickness : thickness(s), chord * ratio);
    const row: number[] = [];
    const point = (x: number, sign: number, c: Rgb) => {
      const [f, sd, u] = pt(hi - x * chord, s);
      const h = (sign * T * airfoil(x)) / 2;
      return m.v(at(fr, f + normal[0] * h, sd + normal[1] * h, u + normal[2] * h), c);
    };
    // Upper side trailing edge to leading edge, then the lower side back.
    for (let i = np; i >= 0; i--) row.push(point(xs[i], 1, col));
    for (let i = 1; i <= np; i++) row.push(point(xs[i], -1, under ?? col));
    rows.push(row);
  }
  m.grid(rows, false);
  // Root and tip closed flat.
  for (const [k, first] of [[0, true], [rows.length - 1, false]] as const) {
    const r = rows[k];
    const ps: Vec3[] = r.map((i) => [m.p[i * 3], m.p[i * 3 + 1], m.p[i * 3 + 2]]);
    m.fan(m.v(mean(ps), col), r, first);
  }
  m.emit(out, { alpha, gloss: glossOf(col) });
}
