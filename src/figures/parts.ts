/**
 * Parts the figures are built from, on top of the race scene's shapes: a
 * prism from a side profile (hulls, tracks, cabins), a plate from a plan view
 * (wings, fins), a round tube between two points (guns, booms), a lofted body
 * and a rounded blob. All take points as (forward, side, up) in the kit's frame
 * and shade each face as it is made.
 */

import { at, box, type Frame3, type Rgb, type Vec3, type VertexBuffer } from '../race/geometry';
import { litQuad, litTriangle, loft, type Section } from '../race/shapes';

export type P2 = [number, number];

function centroid(points: Vec3[]): Vec3 {
  const c: Vec3 = [0, 0, 0];
  for (const p of points) for (let i = 0; i < 3; i++) c[i] += p[i] / points.length;
  return c;
}

/**
 * A prism: the convex side profile `profile` - points (forward, up), in order
 * round it - pushed from `side0` to `side1` across.
 */
export function prism(out: VertexBuffer, fr: Frame3, profile: P2[], side0: number, side1: number, col: Rgb, alpha = 1, topCol?: Rgb): void {
  const a = profile.map(([f, u]) => at(fr, f, side0, u));
  const b = profile.map(([f, u]) => at(fr, f, side1, u));
  const inside = centroid([...a, ...b]);
  const ca = centroid(a);
  const cb = centroid(b);
  const n = profile.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    // A face that looks up gets the top colour.
    litQuad(out, a[i], a[j], b[j], b[i], inside, topCol && upwardFace(profile, i) ? topCol : col, alpha);
    litTriangle(out, ca, a[i], a[j], inside, col, alpha);
    litTriangle(out, cb, b[i], b[j], inside, col, alpha);
  }
}

/** Whether the profile's edge from point i to the next faces up: its outward normal has an up component. */
function upwardFace(profile: P2[], i: number): boolean {
  const j = (i + 1) % profile.length;
  const c = profile.reduce((s, p) => [s[0] + p[0] / profile.length, s[1] + p[1] / profile.length], [0, 0]);
  const dx = profile[j][0] - profile[i][0];
  const dy = profile[j][1] - profile[i][1];
  let nx = dy;
  let ny = -dx;
  const mx = (profile[i][0] + profile[j][0]) / 2 - c[0];
  const my = (profile[i][1] + profile[j][1]) / 2 - c[1];
  if (nx * mx + ny * my < 0) {
    nx = -nx;
    ny = -ny;
  }
  return ny > Math.abs(nx) * 0.5;
}

/**
 * A flat plate: the convex plan `outline` - points (forward, side) - at height
 * `up`, `thickness` thick. Wings, tailplanes, decks, rotor blades.
 */
export function plate(out: VertexBuffer, fr: Frame3, outline: P2[], up: number, thickness: number, col: Rgb, alpha = 1): void {
  const t = thickness / 2;
  const top = outline.map(([f, s]) => at(fr, f, s, up + t));
  const bot = outline.map(([f, s]) => at(fr, f, s, up - t));
  const inside = centroid([...top, ...bot]);
  const ct = centroid(top);
  const cb = centroid(bot);
  const n = outline.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    litTriangle(out, ct, top[i], top[j], inside, col, alpha);
    litTriangle(out, cb, bot[i], bot[j], inside, col, alpha);
    litQuad(out, top[i], top[j], bot[j], bot[i], inside, col, alpha);
  }
}

/**
 * An upright plate: the convex outline `outline` - points (forward, up) - at
 * `side` across, `thickness` thick. Fins, rudders, masts' flags, walls.
 */
export function fin(out: VertexBuffer, fr: Frame3, outline: P2[], side: number, thickness: number, col: Rgb, alpha = 1): void {
  prism(out, fr, outline, side - thickness / 2, side + thickness / 2, col, alpha);
}

/** A round tube from `a` to `b` - points (forward, side, up) - of radius `r0` at `a` and `r1` at `b`. */
export function tube(out: VertexBuffer, fr: Frame3, a: Vec3, b: Vec3, r0: number, r1 = r0, col: Rgb, segments = 8, alpha = 1): void {
  const wa = at(fr, a[0], a[1], a[2]);
  const wb = at(fr, b[0], b[1], b[2]);
  const axis = norm([wb[0] - wa[0], wb[1] - wa[1], wb[2] - wa[2]]);
  const helper: Vec3 = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = norm(cross(axis, helper));
  const v = norm(cross(axis, u));
  const ring = (p: Vec3, r: number) =>
    Array.from({ length: segments }, (_, i) => {
      const t = (i / segments) * Math.PI * 2;
      const cu = Math.cos(t) * r;
      const cv = Math.sin(t) * r;
      return [p[0] + u[0] * cu + v[0] * cv, p[1] + u[1] * cu + v[1] * cv, p[2] + u[2] * cu + v[2] * cv] as Vec3;
    });
  const ra = ring(wa, r0);
  const rb = ring(wb, r1);
  const mid: Vec3 = [(wa[0] + wb[0]) / 2, (wa[1] + wb[1]) / 2, (wa[2] + wb[2]) / 2];
  for (let i = 0; i < segments; i++) {
    const j = (i + 1) % segments;
    litQuad(out, ra[i], ra[j], rb[j], rb[i], mid, col, alpha);
    if (r1 > 0) litTriangle(out, wb, rb[i], rb[j], mid, col, alpha);
    if (r0 > 0) litTriangle(out, wa, ra[i], ra[j], mid, col, alpha);
  }
}

/** A lofted body through cross-sections; the race scene's `loft`, re-exported for the figures. */
export function body(out: VertexBuffer, fr: Frame3, sections: Section[], col: Rgb, segments = 10, round = 2.4, alpha = 1): void {
  loft(out, fr, sections, col, { segments, round, alpha });
}

/** A rounded blob centred at (forward, side, up) with half-sizes along each: heads, domes, clouds. */
export function blob(out: VertexBuffer, fr: Frame3, c: Vec3, half: Vec3, col: Rgb, alpha = 1, rings = 6, segments = 10): void {
  const sections: Section[] = [];
  for (let i = 0; i <= rings; i++) {
    const t = -1 + (2 * i) / rings;
    const k = Math.sqrt(Math.max(0, 1 - t * t));
    sections.push({ x: c[0] + t * half[0], w: Math.max(1e-4, half[1] * k), h: Math.max(1e-4, half[2] * k), z: c[2], y: c[1] });
  }
  loft(out, fr, sections, col, { segments, round: 2, alpha });
}

/** A box by its centre (forward, side, up) and its length, width and height: the race scene's `box`. */
export function block(out: VertexBuffer, fr: Frame3, c: Vec3, l: number, w: number, h: number, col: Rgb, alpha = 1): void {
  box(out, fr, c[0], c[1], c[2], l, w, h, col, alpha);
}

/**
 * A six-faced solid from its bottom and top faces, each four points (forward,
 * side, up) in the same order round it: a frustum, a sloped casemate, a turret
 * with sloped sides. Both faces must be convex and the solid must not twist.
 */
export function hexa(out: VertexBuffer, fr: Frame3, bottom: Vec3[], top: Vec3[], col: Rgb, alpha = 1, topCol?: Rgb): void {
  const b = bottom.map(([f, s, u]) => at(fr, f, s, u));
  const t = top.map(([f, s, u]) => at(fr, f, s, u));
  const inside = centroid([...b, ...t]);
  litQuad(out, b[0], b[1], b[2], b[3], inside, col, alpha);
  litQuad(out, t[0], t[1], t[2], t[3], inside, topCol ?? col, alpha);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    litQuad(out, b[i], b[j], t[j], t[i], inside, col, alpha);
  }
}

/**
 * A box of length `l`, width `w` and height `h` round `c` (forward, side, up),
 * turned `yaw` radians to the right about up and then `pitch` radians nose up
 * about its own side axis: raised launchers, tilted radar faces, rails.
 */
export function tiltBox(out: VertexBuffer, fr: Frame3, c: Vec3, l: number, w: number, h: number, pitch: number, col: Rgb, alpha = 1, yaw = 0): void {
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

/** A flat disc lying level at height `up`, centre (forward, side): rotor discs, areas on the ground. */
export function ring(out: VertexBuffer, fr: Frame3, f: number, s: number, up: number, radius: number, col: Rgb, alpha = 1, segments = 24, inner = 0): void {
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    const p = (a: number, r: number) => at(fr, f + Math.cos(a) * r, s + Math.sin(a) * r, up);
    if (inner > 0) out.quad(p(a0, radius), p(a1, radius), p(a1, inner), p(a0, inner), col, alpha);
    else out.triangle(at(fr, f, s, up), p(a0, radius), p(a1, radius), col, alpha);
  }
}

function norm(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
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

/** The stations an outline is sampled at: every corner, and evenly between. */
function stationsOf(o: Outline): number[] {
  const lists = [o.top, o.bottom, o.plan];
  const x0 = Math.max(...lists.map((l) => Math.min(...l.map((p) => p[0]))));
  const x1 = Math.min(...lists.map((l) => Math.max(...l.map((p) => p[0]))));
  const xs = new Set<number>();
  for (const l of lists) for (const [x] of l) if (x >= x0 - 1e-9 && x <= x1 + 1e-9) xs.add(x);
  const n = o.stations ?? 24;
  for (let i = 0; i <= n; i++) xs.add(x0 + ((x1 - x0) * i) / n);
  const sorted = [...xs].sort((a, b) => a - b);
  // Corners that fall within a hair of an even station make slivers; drop them.
  return sorted.filter((x, i) => i === 0 || x - sorted[i - 1] > (x1 - x0) * 1e-3);
}

export function outlineBody(out: VertexBuffer, fr: Frame3, o: Outline, col: Rgb, segments = 14, alpha = 1, topCol?: Rgb): void {
  const side = o.side ?? 0;
  const xs = stationsOf(o);
  const rings: Vec3[][] = [];
  const centres: Vec3[] = [];
  for (const x of xs) {
    const w = Math.max(1e-3, lerpPoly(o.plan, x));
    const t = lerpPoly(o.top, x);
    const b = lerpPoly(o.bottom, x);
    const h = Math.max(1e-3, (t - b) / 2);
    const z = (t + b) / 2;
    const r = typeof o.round === 'number' ? o.round : o.round ? lerpPoly(o.round, x) : 2.4;
    const e = 2 / r;
    rings.push(
      Array.from({ length: segments }, (_, i) => {
        const a = (i / segments) * Math.PI * 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        return at(fr, x, side + w * Math.sign(c) * Math.abs(c) ** e, z + h * Math.sign(s) * Math.abs(s) ** e);
      }),
    );
    centres.push(at(fr, x, side, z));
  }
  for (let k = 0; k + 1 < rings.length; k++) {
    const inside: Vec3 = [(centres[k][0] + centres[k + 1][0]) / 2, (centres[k][1] + centres[k + 1][1]) / 2, (centres[k][2] + centres[k + 1][2]) / 2];
    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % segments;
      const upper = topCol && Math.sin(((i + 0.5) / segments) * Math.PI * 2) > 0.35;
      litQuad(out, rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i], inside, upper ? topCol! : col, alpha);
    }
  }
  for (const k of [0, rings.length - 1]) {
    const inside = centres[k === 0 ? Math.min(1, rings.length - 1) : Math.max(0, rings.length - 2)];
    for (let i = 0; i < segments; i++) litTriangle(out, centres[k], rings[k][i], rings[k][(i + 1) % segments], inside, col, alpha);
  }
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
  const ccw = area > 0;
  const idx = Array.from({ length: n }, (_, i) => i);
  const tris: [number, number, number][] = [];
  const cross = (a: P2, b: P2, c: P2) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inside = (p: P2, a: P2, b: P2, c: P2) => {
    const d1 = cross(a, b, p);
    const d2 = cross(b, c, p);
    const d3 = cross(c, a, p);
    return ccw ? d1 > 1e-12 && d2 > 1e-12 && d3 > 1e-12 : d1 < -1e-12 && d2 < -1e-12 && d3 < -1e-12;
  };
  let guard = 0;
  while (idx.length > 3 && guard++ < n * n) {
    let clipped = false;
    for (let i = 0; i < idx.length; i++) {
      const ia = idx[(i + idx.length - 1) % idx.length];
      const ib = idx[i];
      const ic = idx[(i + 1) % idx.length];
      const c = cross(poly[ia], poly[ib], poly[ic]);
      if (ccw ? c <= 0 : c >= 0) continue;
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

/**
 * A thin flat part from a simple polygon (wings, tailplanes, fins with their
 * true planform: LERX, cranks, dogtooth, raked tips). `map` takes a polygon
 * point to the part's mid-surface (forward, side, up); `normal` is the
 * direction the thickness goes, in the same frame.
 */
export function slab(out: VertexBuffer, fr: Frame3, poly: P2[], map: (a: number, b: number) => Vec3, normal: Vec3, thickness: number, col: Rgb, alpha = 1, underCol?: Rgb): void {
  const t = thickness / 2;
  const mid = poly.map(([a, b]) => map(a, b));
  const top = mid.map(([f, s, u]) => at(fr, f + normal[0] * t, s + normal[1] * t, u + normal[2] * t));
  const bot = mid.map(([f, s, u]) => at(fr, f - normal[0] * t, s - normal[1] * t, u - normal[2] * t));
  const inside = centroid([...top, ...bot]);
  // Each face triangle gets its light against the triangle opposite it, just inside the slab, so a thin slab shades
  // its two sides apart and a bent one (a gull wing, dihedral) keeps its upper side up wherever it bends.
  for (const [i, j, k] of triangulate(poly)) {
    litTriangle(out, top[i], top[j], top[k], centroid([bot[i], bot[j], bot[k]]), col, alpha);
    litTriangle(out, bot[i], bot[j], bot[k], centroid([top[i], top[j], top[k]]), underCol ?? col, alpha);
  }
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    litQuad(out, top[i], top[j], bot[j], bot[i], inside, col, alpha);
  }
}
