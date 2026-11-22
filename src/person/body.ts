/**
 * The body a person-hit analysis is drawn on (docs/person-hits.md "The
 * view"): the game's own player model where the local model pack has one with
 * hit groups (a CS2 agent's `dm:head`, `dm:chest`... parts, `modelpack.ts`),
 * else a plain figure built here with the standard regions. Drawn flat-shaded
 * on a 2D canvas, back to front, once a change - never on the 3D view's
 * frame path.
 *
 * Frame: metres, x forward, y up, z right, the feet at y = 0 (the model
 * packs' figure frame, and CS2's traced hit points).
 */

import { platesOf, type Plate } from '../vehicle/plates';
import { hitGroupOf, regionOfGroup, REGIONS } from './types';

export interface BodyPart {
  /** Index into `REGIONS`, -1 a part no hit names. */
  region: number;
  /** Triangles, three corners each (x, y, z). */
  tris: Float32Array;
}

export interface Body {
  name: string;
  parts: BodyPart[];
  height: number;
}

/** A tapered, elliptical tube from p0 to p1 (radii forward and sideways at each end), closed at both ends. */
function tube(out: number[], p0: [number, number, number], p1: [number, number, number], r0: [number, number], r1: [number, number], sides = 10): void {
  const ax = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  const len = Math.hypot(ax[0], ax[1], ax[2]) || 1;
  const a = ax.map((v) => v / len);
  // Two axes across the tube: one towards x (forward), one towards z (sideways).
  let u = [1, 0, 0];
  const d = u[0] * a[0] + u[1] * a[1] + u[2] * a[2];
  u = [u[0] - d * a[0], u[1] - d * a[1], u[2] - d * a[2]];
  let ul = Math.hypot(u[0], u[1], u[2]);
  if (ul < 1e-6) {
    u = [0, 1, 0];
    ul = 1;
  }
  u = u.map((v) => v / ul);
  const w = [a[1] * u[2] - a[2] * u[1], a[2] * u[0] - a[0] * u[2], a[0] * u[1] - a[1] * u[0]];
  const ring = (p: number[], r: [number, number]) =>
    Array.from({ length: sides }, (_, k) => {
      const t = (k / sides) * Math.PI * 2;
      const c = Math.cos(t) * r[0], s = Math.sin(t) * r[1];
      return [p[0] + u[0] * c + w[0] * s, p[1] + u[1] * c + w[1] * s, p[2] + u[2] * c + w[2] * s];
    });
  const A = ring(p0, r0), B = ring(p1, r1);
  const tri = (x: number[], y: number[], z: number[]) => out.push(...x, ...y, ...z);
  for (let k = 0; k < sides; k++) {
    const k2 = (k + 1) % sides;
    tri(A[k], B[k], B[k2]);
    tri(A[k], B[k2], A[k2]);
    tri(p0, A[k2], A[k]);
    tri(p1, B[k], B[k2]);
  }
}

/** An ellipsoid about `c` with radii (forward, up, sideways). */
function blob(out: number[], c: [number, number, number], r: [number, number, number], rings = 8, sides = 12): void {
  const pt = (i: number, k: number) => {
    const th = (i / rings) * Math.PI, ph = (k / sides) * Math.PI * 2;
    return [c[0] + r[0] * Math.sin(th) * Math.cos(ph), c[1] + r[1] * Math.cos(th), c[2] + r[2] * Math.sin(th) * Math.sin(ph)];
  };
  for (let i = 0; i < rings; i++)
    for (let k = 0; k < sides; k++) {
      const a = pt(i, k), b = pt(i + 1, k), c2 = pt(i + 1, k + 1), d = pt(i, k + 1);
      out.push(...a, ...b, ...c2, ...a, ...c2, ...d);
    }
}

let generic: Body | null = null;

/** A plain standing figure, 1.8 m, in the seven regions. */
export function genericBody(): Body {
  if (generic) return generic;
  const part = (region: string, build: (o: number[]) => void): BodyPart => {
    const o: number[] = [];
    build(o);
    return { region: REGIONS.indexOf(region as (typeof REGIONS)[number]), tris: new Float32Array(o) };
  };
  generic = {
    name: 'generic',
    height: 1.8,
    parts: [
      part('head', (o) => {
        blob(o, [0.01, 1.64, 0], [0.11, 0.13, 0.095]);
        tube(o, [0, 1.46, 0], [0, 1.53, 0], [0.055, 0.055], [0.055, 0.055]);
      }),
      part('chest', (o) => tube(o, [0, 1.15, 0], [0, 1.47, 0], [0.12, 0.17], [0.11, 0.21])),
      part('stomach', (o) => tube(o, [0, 0.88, 0], [0, 1.15, 0], [0.11, 0.16], [0.12, 0.17])),
      part('left_arm', (o) => {
        tube(o, [0, 1.43, -0.24], [0.02, 1.13, -0.29], [0.055, 0.055], [0.045, 0.045]);
        tube(o, [0.02, 1.13, -0.29], [0.12, 0.92, -0.3], [0.045, 0.045], [0.035, 0.035]);
      }),
      part('right_arm', (o) => {
        tube(o, [0, 1.43, 0.24], [0.02, 1.13, 0.29], [0.055, 0.055], [0.045, 0.045]);
        tube(o, [0.02, 1.13, 0.29], [0.12, 0.92, 0.3], [0.045, 0.045], [0.035, 0.035]);
      }),
      part('left_leg', (o) => {
        tube(o, [0, 0.9, -0.1], [0.01, 0.48, -0.11], [0.085, 0.08], [0.06, 0.055]);
        tube(o, [0.01, 0.48, -0.11], [0, 0.06, -0.12], [0.06, 0.055], [0.045, 0.045]);
        tube(o, [0.08, 0.04, -0.12], [-0.05, 0.05, -0.12], [0.04, 0.05], [0.04, 0.05], 6);
      }),
      part('right_leg', (o) => {
        tube(o, [0, 0.9, 0.1], [0.01, 0.48, 0.11], [0.085, 0.08], [0.06, 0.055]);
        tube(o, [0.01, 0.48, 0.11], [0, 0.06, 0.12], [0.06, 0.055], [0.045, 0.045]);
        tube(o, [0.08, 0.04, 0.12], [-0.05, 0.05, 0.12], [0.04, 0.05], [0.04, 0.05], 6);
      }),
    ],
  };
  return generic;
}

/** A pack model's hit groups as body parts; null when it has none, undefined while they are asked for. */
export function bodyOfPack(game: string, unit: string): Body | null | undefined {
  const plates = platesOf(`agent@model:${game}:${unit}`);
  if (plates === undefined) return undefined;
  if (!plates || !plates.length) return null;
  return bodyOfPlates(`${game}:${unit}`, plates);
}

export function bodyOfPlates(name: string, plates: readonly Pick<Plate, 'name' | 'group' | 'tris' | 'max'>[]): Body | null {
  const parts: BodyPart[] = [];
  let top = 0;
  for (const p of plates) {
    const region = regionOfGroup(hitGroupOf(p.group || p.name.replace(/^dm:/, '')));
    parts.push({ region, tris: p.tris });
    top = Math.max(top, p.max[1]);
  }
  if (!parts.some((p) => p.region >= 0)) return null;
  return { name, parts, height: top || 1.8 };
}

/** The CS2 agent each side is drawn as, from the local model pack. */
export const CS2_AGENTS: Record<string, string> = { CT: 'ctm_fbi', T: 'tm_phoenix' };

// ---------------------------------------------------------------------------
// Drawing.

export interface BodyLook {
  /** Turned about the vertical, degrees: 0 faces the viewer. */
  yaw: number;
  pitch: number;
  /** Each region's colour as css, '' for no data. */
  fill: string[];
  noData: string;
  background: string;
  /** The region under the pointer, outlined. */
  hover: number;
  /** Marks: points in the body's frame, a colour each. */
  marks?: { x: Float32Array; y: Float32Array; z: Float32Array; colour: string[] } | null;
}

interface Projected {
  depth: number;
  region: number;
  shade: number;
  p: [number, number, number, number, number, number];
}

/** The view: the body turned and fitted to the canvas; returns a picker of the region at a pixel. */
export function drawBody(ctx: CanvasRenderingContext2D, w: number, h: number, body: Body, look: BodyLook): (x: number, y: number) => number {
  ctx.fillStyle = look.background;
  ctx.fillRect(0, 0, w, h);
  const yaw = (look.yaw * Math.PI) / 180, pitch = (look.pitch * Math.PI) / 180;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const scale = (h * 0.86) / Math.max(1, body.height);
  const midY = body.height / 2;
  // At yaw 0 the figure faces the viewer: its forward (+x) is towards the viewer (depth grows towards the viewer).
  const project = (x: number, y: number, z: number): [number, number, number] => {
    const rx = x * cy - z * sy, rz = x * sy + z * cy;
    const yy = y - midY;
    const ry = yy * cp - rx * sp, depth = yy * sp + rx * cp;
    return [w / 2 - rz * scale, h / 2 - ry * scale, depth];
  };
  const tris: Projected[] = [];
  // Light from the upper left, in front: x right, y down, depth towards the viewer.
  const L = [-0.45, -0.55, 0.7];
  for (const part of body.parts) {
    const t = part.tris;
    for (let k = 0; k + 8 < t.length; k += 9) {
      const a = project(t[k], t[k + 1], t[k + 2]), b = project(t[k + 3], t[k + 4], t[k + 5]), c = project(t[k + 6], t[k + 7], t[k + 8]);
      // Normal in view space for shading (both sides lit: packs' faces wind either way).
      // Depth in pixels too, so the normal is the surface's (screen x right, y down, depth towards the viewer).
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = (b[2] - a[2]) * scale, vx = c[0] - a[0], vy = c[1] - a[1], vz = (c[2] - a[2]) * scale;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz) || 1;
      const shade = Math.abs((nx * L[0] + ny * L[1] + nz * L[2]) / nl);
      tris.push({ depth: (a[2] + b[2] + c[2]) / 3, region: part.region, shade, p: [a[0], a[1], b[0], b[1], c[0], c[1]] });
    }
  }
  tris.sort((p, q) => p.depth - q.depth);
  const parsed = new Map<string, [number, number, number]>();
  const rgb = (css: string): [number, number, number] => {
    let v = parsed.get(css);
    if (!v) {
      const m = /^#([0-9a-f]{6})$/i.exec(css);
      v = m ? [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)] : [128, 128, 128];
      parsed.set(css, v);
    }
    return v;
  };
  for (const t of tris) {
    const base = rgb((t.region >= 0 ? look.fill[t.region] : '') || look.noData);
    const k = 0.55 + 0.45 * t.shade;
    ctx.fillStyle = `rgb(${Math.round(base[0] * k)},${Math.round(base[1] * k)},${Math.round(base[2] * k)})`;
    ctx.beginPath();
    ctx.moveTo(t.p[0], t.p[1]);
    ctx.lineTo(t.p[2], t.p[3]);
    ctx.lineTo(t.p[4], t.p[5]);
    ctx.closePath();
    ctx.fill();
    // A hairline of the same colour closes the seams between triangles.
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  if (look.hover >= 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.5;
    for (const t of tris) {
      if (t.region !== look.hover) continue;
      ctx.beginPath();
      ctx.moveTo(t.p[0], t.p[1]);
      ctx.lineTo(t.p[2], t.p[3]);
      ctx.lineTo(t.p[4], t.p[5]);
      ctx.closePath();
      ctx.stroke();
    }
  }
  // Marks on the side facing the viewer.
  const m = look.marks;
  if (m) {
    for (let k = 0; k < m.x.length; k++) {
      const p = project(m.x[k], m.y[k], m.z[k]);
      if (m.x[k] * cy - m.z[k] * sy < -0.02) continue;
      ctx.fillStyle = m.colour[k];
      ctx.beginPath();
      ctx.arc(p[0], p[1], 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // The picker: the front-most triangle under a pixel.
  return (x: number, y: number) => {
    for (let k = tris.length - 1; k >= 0; k--) {
      const p = tris[k].p;
      if (inTri(x, y, p)) return tris[k].region;
    }
    return -1;
  };
}

function inTri(x: number, y: number, p: Projected['p']): boolean {
  const d = (ax: number, ay: number, bx: number, by: number) => (x - bx) * (ay - by) - (ax - bx) * (y - by);
  const d1 = d(p[0], p[1], p[2], p[3]), d2 = d(p[2], p[3], p[4], p[5]), d3 = d(p[4], p[5], p[0], p[1]);
  const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/** A sequential ramp for the regions' colours: low light, high saturated (readable on dark and light grounds). */
export function rampCss(t: number): string {
  const stops: [number, number, number][] = [
    [253, 231, 160],
    [250, 170, 90],
    [232, 98, 70],
    [190, 40, 80],
    [120, 20, 110],
  ];
  const x = Math.max(0, Math.min(1, Number.isFinite(t) ? t : 0)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
  const c = stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
