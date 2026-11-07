/**
 * Round shapes for the race scene, shaded as they are built: a body lofted
 * through cross-sections, wheels as cylinders, rods between two points. Like
 * `box`, each face carries its own light - from above and a little ahead - so
 * nothing needs a lighting pass, and faces are shaded by which way they look
 * out from the shape, so their winding does not matter.
 */

import { at, shade, type Frame3, type Rgb, type Vec3, type VertexBuffer } from './geometry';

const LIGHT: Vec3 = normalise([0.3, 0.88, 0.36]);

function normalise(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** How much light a face looking along this unit normal gets: what `lit` multiplies by. */
export function lightOn(x: number, y: number, z: number): number {
  return 0.4 + 0.62 * Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
}

/** A face's colour under the scene's light, facing away from `inside`. */
function lit(points: Vec3[], inside: Vec3, col: Rgb): Rgb {
  let n = normalise(cross(sub(points[1], points[0]), sub(points[2], points[0])));
  const c: Vec3 = [0, 0, 0];
  for (const p of points) for (let k = 0; k < 3; k++) c[k] += p[k] / points.length;
  if (dot(n, sub(c, inside)) < 0) n = [-n[0], -n[1], -n[2]];
  return shade(col, 0.4 + 0.62 * Math.max(0, dot(n, LIGHT)));
}

export function litTriangle(out: VertexBuffer, a: Vec3, b: Vec3, c: Vec3, inside: Vec3, col: Rgb, alpha = 1): void {
  out.triangle(a, b, c, lit([a, b, c], inside, col), alpha);
}

export function litQuad(out: VertexBuffer, a: Vec3, b: Vec3, c: Vec3, d: Vec3, inside: Vec3, col: Rgb, alpha = 1): void {
  out.quad(a, b, c, d, lit([a, b, c], inside, col), alpha);
}

/** A cross-section of a lofted body, in the frame: how far forward, its half-width and half-height, its centre's height. */
export interface Section {
  x: number;
  w: number;
  h: number;
  z: number;
  /** Shift sideways, for a body off the centreline. */
  y?: number;
}

/**
 * A body through `sections` (front to back or back to front), each a rounded
 * rectangle - a superellipse of exponent `round`: 2 is an ellipse, higher is
 * squarer. Both ends are closed.
 */
export function loft(
  out: VertexBuffer,
  fr: Frame3,
  sections: Section[],
  col: Rgb,
  { segments = 14, round = 2.6, alpha = 1, topCol }: { segments?: number; round?: number; alpha?: number; topCol?: Rgb } = {},
): void {
  const e = 2 / round;
  const ring = (s: Section): Vec3[] =>
    Array.from({ length: segments }, (_, i) => {
      const a = (i / segments) * Math.PI * 2;
      const c = Math.cos(a);
      const n = Math.sin(a);
      const side = (s.y ?? 0) + s.w * Math.sign(c) * Math.abs(c) ** e;
      const up = s.z + s.h * Math.sign(n) * Math.abs(n) ** e;
      return at(fr, s.x, side, up);
    });
  const rings = sections.map(ring);
  const centres = sections.map((s) => at(fr, s.x, s.y ?? 0, s.z));
  for (let k = 0; k + 1 < rings.length; k++) {
    const inside: Vec3 = [
      (centres[k][0] + centres[k + 1][0]) / 2,
      (centres[k][1] + centres[k + 1][1]) / 2,
      (centres[k][2] + centres[k + 1][2]) / 2,
    ];
    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % segments;
      // The upper half in the top colour, where one is given.
      const upper = topCol && Math.sin(((i + 0.5) / segments) * Math.PI * 2) > 0.35;
      litQuad(out, rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i], inside, upper ? topCol : col, alpha);
    }
  }
  for (const k of [0, rings.length - 1]) {
    const inside = centres[k === 0 ? 1 : rings.length - 2];
    for (let i = 0; i < segments; i++) {
      litTriangle(out, centres[k], rings[k][i], rings[k][(i + 1) % segments], inside, col, alpha);
    }
  }
}

/**
 * A wheel: a cylinder round the frame's sideways axis, centred `side` across
 * and `up` high, `radius` and `width`, its outer face a rim in `rimCol`.
 * `outward` is +1 when the wheel's outer face is on the frame's right.
 */
export function wheel(
  out: VertexBuffer,
  fr: Frame3,
  side: number,
  up: number,
  radius: number,
  width: number,
  tyre: Rgb,
  rimCol: Rgb,
  outward: number,
  segments = 16,
): void {
  const point = (a: number, r: number, across: number): Vec3 =>
    at(fr, Math.cos(a) * r, side + across, up + Math.sin(a) * r);
  const centre = at(fr, 0, side, up);
  const half = width / 2;
  tread(out, fr, side, up, radius, width, tyre, segments);
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    for (const face of [-1, 1]) {
      const across = face * half;
      const rim = face === outward;
      // The sidewall, then the rim set into it on the outer face.
      const inner = rim ? radius * 0.62 : radius * 0.35;
      litQuad(
        out,
        point(a0, radius, across),
        point(a1, radius, across),
        point(a1, inner, across),
        point(a0, inner, across),
        centre,
        shade(tyre, 0.85),
      );
      litTriangle(out, at(fr, 0, side + across, up), point(a0, inner, across), point(a1, inner, across), centre, rim ? rimCol : shade(tyre, 0.7));
    }
  }
}

/** A wheel's running surface alone: the open cylinder round the frame's sideways axis. */
export function tread(
  out: VertexBuffer,
  fr: Frame3,
  side: number,
  up: number,
  radius: number,
  width: number,
  col: Rgb,
  segments = 16,
): void {
  const point = (a: number, across: number): Vec3 =>
    at(fr, Math.cos(a) * radius, side + across, up + Math.sin(a) * radius);
  const centre = at(fr, 0, side, up);
  const half = width / 2;
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    litQuad(out, point(a0, -half), point(a1, -half), point(a1, half), point(a0, half), centre, col);
  }
}

/** A flat disc upright in the frame's forward-up plane, `side` across, centred `up` high: a wheel's face. */
export function disc(out: VertexBuffer, fr: Frame3, side: number, up: number, radius: number, col: Rgb, segments = 12): void {
  const c = at(fr, 0, side, up);
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    out.triangle(c, at(fr, Math.cos(a0) * radius, side, up + Math.sin(a0) * radius), at(fr, Math.cos(a1) * radius, side, up + Math.sin(a1) * radius), col);
  }
}

/** A rod from `a` to `b` (world points), `thickness` across, as a square tube. */
export function rod(out: VertexBuffer, a: Vec3, b: Vec3, thickness: number, col: Rgb): void {
  const axis = normalise(sub(b, a));
  // Any vector not along the axis, for the tube's two sides.
  const helper: Vec3 = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = normalise(cross(axis, helper));
  const v = normalise(cross(axis, u));
  const h = thickness / 2;
  const corner = (p: Vec3, su: number, sv: number): Vec3 => [
    p[0] + (u[0] * su + v[0] * sv) * h,
    p[1] + (u[1] * su + v[1] * sv) * h,
    p[2] + (u[2] * su + v[2] * sv) * h,
  ];
  const signs: [number, number][] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  for (let i = 0; i < 4; i++) {
    const [s0, t0] = signs[i];
    const [s1, t1] = signs[(i + 1) % 4];
    litQuad(out, corner(a, s0, t0), corner(a, s1, t1), corner(b, s1, t1), corner(b, s0, t0), mid, col);
  }
}
