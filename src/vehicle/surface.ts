/**
 * A figure's surface made fine enough to paint heat on: every triangle of the
 * template cut into small ones (no edge longer than a set length), each
 * vertex with its place, its normal and its lit colour, and then the hits
 * splatted onto it as a Gaussian over the surface - the vehicle heatmap's
 * canvas.
 *
 * The figures are the viewer's own and only roughly the game's shape, so a
 * hit point is first moved onto the figure: to the nearest point of the
 * surface that faces the way the shot came from (a shot from below does not
 * land on the top of a wing). Its heat then spreads over the surface near
 * it, but not round a thin edge to the far side: a vertex whose normal
 * turns away from the hit's takes less of it.
 */

import { VertexBuffer, type Rgb, type Vec3 } from '../race/geometry';
import { LOCAL, placeFrame, type Template } from '../figures/kit';

export interface HeatMesh {
  /** Vertices: a triangle list, three a triangle. */
  count: number;
  pos: Float32Array;
  /** Unit normals, per vertex. */
  nrm: Float32Array;
  /** The lit colour without heat: r, g, b, a per vertex. */
  base: Float32Array;
  /** 1 for vertices of the template's fixed part (gun metal, tracks, glass), 0 for the painted body. */
  fixed: Uint8Array;
  min: Vec3;
  max: Vec3;
  /** The longest edge a triangle was cut to, m. */
  edge: number;
}

/** The paint a vehicle is shown in: a light neutral grey, so every colour of the ramp reads on it. */
export const BODY: Rgb = [0.66, 0.68, 0.7];

/**
 * The template cut fine: about `targetTriangles` triangles over its whole
 * surface (fewer where it is small), never a triangle cut more than `maxCut`
 * times along an edge. `shaded`: the colours lit by the scene's light, as
 * the view shows them; else the paint itself, for a picture that shades it
 * its own way (the flat sheet).
 */
export function heatMeshOf(t: Template, targetTriangles = 90_000, maxCut = 24, shaded = true): HeatMesh {
  const lit = new VertexBuffer();
  if (shaded) placeFrame(lit, t, LOCAL, 1, BODY, 1);
  else {
    // The template frame is the mesh's: the same vertices placeFrame writes, in the same order, unlit.
    for (const [d, tint] of [[t.fixed, null], [t.team, BODY]] as const) {
      for (let i = 0; i < d.length; i += 7) {
        const k = tint ?? [1, 1, 1];
        lit.vertex(d[i], d[i + 1], d[i + 2], k[0] * d[i + 3], k[1] * d[i + 4], k[2] * d[i + 5], d[i + 6]);
      }
    }
  }
  const src = lit.data;
  const n = lit.count;
  // The template's normals, in the order `placeFrame` writes: fixed, then team.
  const fixedCount = t.fixed.length / 7;
  const normals = new Float32Array(n * 3);
  const put = (from: Float32Array | undefined, at: number, count: number) => {
    for (let i = 0; i < count; i++) {
      if (from) {
        normals[(at + i) * 3] = from[i * 4];
        normals[(at + i) * 3 + 1] = from[i * 4 + 1];
        normals[(at + i) * 3 + 2] = from[i * 4 + 2];
      }
    }
  };
  put(t.fixedN, 0, fixedCount);
  put(t.teamN, fixedCount, n - fixedCount);

  // The surface's area, for the edge length that gives about the target count.
  let area = 0;
  for (let v = 0; v + 2 < n; v += 3) area += triArea(src, v);
  const edge = Math.max(0.01, Math.sqrt((4 * area) / (Math.sqrt(3) * Math.max(1000, targetTriangles))));

  // How many cuts each triangle needs, so the arrays are made once at their size.
  const cuts = new Uint8Array(n / 3);
  let total = 0;
  for (let v = 0, tri = 0; v + 2 < n; v += 3, tri++) {
    const longest = Math.max(dist(src, v, v + 1), dist(src, v + 1, v + 2), dist(src, v + 2, v));
    const c = Math.min(maxCut, Math.max(1, Math.ceil(longest / edge)));
    cuts[tri] = c;
    total += c * c * 3;
  }
  const pos = new Float32Array(total * 3);
  const nrm = new Float32Array(total * 3);
  const base = new Float32Array(total * 4);
  const fixed = new Uint8Array(total);
  let o = 0;
  const p0: number[] = [0, 0, 0];
  const corner = (v0: number, a: number, b: number, c: number, isFixed: number, face: Vec3) => {
    // Barycentric a, b, c of the corners v0, v0+1, v0+2.
    for (let k = 0; k < 3; k++) {
      p0[k] = src[v0 * 7 + k] * a + src[(v0 + 1) * 7 + k] * b + src[(v0 + 2) * 7 + k] * c;
      pos[o * 3 + k] = p0[k];
    }
    let nx = 0, ny = 0, nz = 0;
    for (let j = 0; j < 3; j++) {
      const w = j === 0 ? a : j === 1 ? b : c;
      nx += normals[(v0 + j) * 3] * w;
      ny += normals[(v0 + j) * 3 + 1] * w;
      nz += normals[(v0 + j) * 3 + 2] * w;
    }
    let l = Math.hypot(nx, ny, nz);
    if (l < 1e-6) {
      nx = face[0];
      ny = face[1];
      nz = face[2];
      l = 1;
    }
    nrm[o * 3] = nx / l;
    nrm[o * 3 + 1] = ny / l;
    nrm[o * 3 + 2] = nz / l;
    for (let k = 0; k < 4; k++) base[o * 4 + k] = src[v0 * 7 + 3 + k] * a + src[(v0 + 1) * 7 + 3 + k] * b + src[(v0 + 2) * 7 + 3 + k] * c;
    fixed[o] = isFixed;
    o++;
  };
  const face: Vec3 = [0, 1, 0];
  for (let v = 0, tri = 0; v + 2 < n; v += 3, tri++) {
    faceNormal(src, v, face);
    const isFixed = v < fixedCount ? 1 : 0;
    const c = cuts[tri];
    // The triangle's grid of c x c small ones: rows i (from corner 0 towards 1), steps j along each row.
    for (let i = 0; i < c; i++) {
      for (let j = 0; j < c - i; j++) {
        const b0 = i / c, c0 = j / c;
        const b1 = (i + 1) / c, c1 = (j + 1) / c;
        corner(v, 1 - b0 - c0, b0, c0, isFixed, face);
        corner(v, 1 - b1 - c0, b1, c0, isFixed, face);
        corner(v, 1 - b0 - c1, b0, c1, isFixed, face);
        if (j < c - i - 1) {
          corner(v, 1 - b1 - c0, b1, c0, isFixed, face);
          corner(v, 1 - b1 - c1, b1, c1, isFixed, face);
          corner(v, 1 - b0 - c1, b0, c1, isFixed, face);
        }
      }
    }
  }
  return { count: o, pos: pos.subarray(0, o * 3), nrm: nrm.subarray(0, o * 3), base: base.subarray(0, o * 4), fixed: fixed.subarray(0, o), min: [...t.min], max: [...t.max], edge };
}

function dist(d: Float32Array, a: number, b: number): number {
  return Math.hypot(d[a * 7] - d[b * 7], d[a * 7 + 1] - d[b * 7 + 1], d[a * 7 + 2] - d[b * 7 + 2]);
}

function triArea(d: Float32Array, v: number): number {
  const ux = d[(v + 1) * 7] - d[v * 7], uy = d[(v + 1) * 7 + 1] - d[v * 7 + 1], uz = d[(v + 1) * 7 + 2] - d[v * 7 + 2];
  const wx = d[(v + 2) * 7] - d[v * 7], wy = d[(v + 2) * 7 + 1] - d[v * 7 + 1], wz = d[(v + 2) * 7 + 2] - d[v * 7 + 2];
  return 0.5 * Math.hypot(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx);
}

function faceNormal(d: Float32Array, v: number, out: Vec3): void {
  const ux = d[(v + 1) * 7] - d[v * 7], uy = d[(v + 1) * 7 + 1] - d[v * 7 + 1], uz = d[(v + 1) * 7 + 2] - d[v * 7 + 2];
  const wx = d[(v + 2) * 7] - d[v * 7], wy = d[(v + 2) * 7 + 1] - d[v * 7 + 1], wz = d[(v + 2) * 7 + 2] - d[v * 7 + 2];
  const x = uy * wz - uz * wy, y = uz * wx - ux * wz, z = ux * wy - uy * wx;
  const l = Math.hypot(x, y, z) || 1;
  out[0] = x / l;
  out[1] = y / l;
  out[2] = z / l;
}

/** A uniform grid over points, for the near ones of a place. */
class Grid {
  private readonly cells = new Map<number, number[]>();
  constructor(
    pts: Float32Array,
    count: number,
    readonly cell: number,
  ) {
    for (let i = 0; i < count; i++) {
      const k = this.key(Math.floor(pts[i * 3] / cell), Math.floor(pts[i * 3 + 1] / cell), Math.floor(pts[i * 3 + 2] / cell));
      let list = this.cells.get(k);
      if (!list) this.cells.set(k, (list = []));
      list.push(i);
    }
  }

  private key(x: number, y: number, z: number): number {
    return ((x + 512) * 1024 + (y + 512)) * 1024 + (z + 512);
  }

  /** Calls `fn` with every point within `r` cells of the cell of (x, y, z). */
  near(x: number, y: number, z: number, r: number, fn: (i: number) => void): void {
    const cx = Math.floor(x / this.cell), cy = Math.floor(y / this.cell), cz = Math.floor(z / this.cell);
    for (let a = cx - r; a <= cx + r; a++)
      for (let b = cy - r; b <= cy + r; b++)
        for (let c = cz - r; c <= cz + r; c++) {
          const list = this.cells.get(this.key(a, b, c));
          if (list) for (const i of list) fn(i);
        }
  }
}

/** A hit as the surface takes it: where it landed on the figure, the normal there, how much it counts. */
export interface Splat {
  p: Vec3;
  /** The surface normal at the point, or null when the hit was too far from the figure to move onto it. */
  n: Vec3 | null;
  weight: number;
}

/**
 * Moves each hit onto the surface: the nearest vertex within `reach` whose
 * normal does not face along the shot (it was hit from outside), else the
 * nearest at all; a hit further than `reach` from the figure keeps its place.
 */
export function snapHits(mesh: HeatMesh, hits: { p: Vec3; dir: Vec3 | null; weight: number }[], reach: number): Splat[] {
  if (!hits.length || mesh.count === 0) return [];
  const cell = Math.max(mesh.edge * 2, reach / 3);
  const grid = gridOf(mesh, cell);
  const rings = Math.max(1, Math.ceil(reach / cell));
  const out: Splat[] = [];
  for (const h of hits) {
    let best = -1;
    let bestScore = Infinity;
    const [x, y, z] = h.p;
    grid.near(x, y, z, rings, (i) => {
      const ex = mesh.pos[i * 3] - x, ey = mesh.pos[i * 3 + 1] - y, ez = mesh.pos[i * 3 + 2] - z;
      const d = Math.hypot(ex, ey, ez);
      if (d > reach) return;
      let score = d;
      if (h.dir) {
        // A surface facing along the shot is its far side: only taken when nothing else is near.
        const facing = mesh.nrm[i * 3] * h.dir[0] + mesh.nrm[i * 3 + 1] * h.dir[1] + mesh.nrm[i * 3 + 2] * h.dir[2];
        if (facing > 0.1) score += reach;
      }
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    });
    if (best < 0) out.push({ p: [x, y, z], n: null, weight: h.weight });
    else
      out.push({
        p: [mesh.pos[best * 3], mesh.pos[best * 3 + 1], mesh.pos[best * 3 + 2]],
        n: [mesh.nrm[best * 3], mesh.nrm[best * 3 + 1], mesh.nrm[best * 3 + 2]],
        weight: h.weight,
      });
  }
  return out;
}

const grids = new WeakMap<HeatMesh, Map<number, Grid>>();

function gridOf(mesh: HeatMesh, cell: number): Grid {
  let byCell = grids.get(mesh);
  if (!byCell) grids.set(mesh, (byCell = new Map()));
  const key = Math.round(cell * 1e4);
  let g = byCell.get(key);
  if (!g) byCell.set(key, (g = new Grid(mesh.pos, mesh.count, cell)));
  return g;
}

/**
 * Each vertex's heat: the sum over the splats of weight x a Gaussian of the
 * distance (`sigma` m), times how far the vertex's normal agrees with the
 * splat's (none past a right angle), so heat stays on the side it landed on.
 */
export function splatHeat(mesh: HeatMesh, splats: Splat[], sigma: number, out?: Float32Array): Float32Array {
  const heat = out && out.length >= mesh.count ? out : new Float32Array(mesh.count);
  heat.fill(0, 0, mesh.count);
  if (!splats.length) return heat;
  const cut = 3 * sigma;
  const pts = new Float32Array(splats.length * 3);
  splats.forEach((s, i) => pts.set(s.p, i * 3));
  const grid = new Grid(pts, splats.length, cut);
  const inv = 1 / (2 * sigma * sigma);
  const { pos, nrm } = mesh;
  for (let v = 0; v < mesh.count; v++) {
    const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
    let sum = 0;
    grid.near(x, y, z, 1, (i) => {
      const s = splats[i];
      const ex = x - s.p[0], ey = y - s.p[1], ez = z - s.p[2];
      const d2 = ex * ex + ey * ey + ez * ez;
      if (d2 > cut * cut) return;
      let w = s.weight * Math.exp(-d2 * inv);
      if (s.n) {
        const agree = nrm[v * 3] * s.n[0] + nrm[v * 3 + 1] * s.n[1] + nrm[v * 3 + 2] * s.n[2];
        // Full on the same side, fading out to nothing at a right angle and beyond.
        w *= agree <= 0 ? 0 : agree >= 0.5 ? 1 : agree * 2;
      }
      sum += w;
    });
    heat[v] = sum;
  }
  return heat;
}

/** The heat that fills the ramp: a high percentile of the heated vertices, so one hot spot does not dim the rest. */
export function autoSaturation(heat: Float32Array, count: number, percentile = 0.97): number {
  const vals: number[] = [];
  for (let i = 0; i < count; i++) if (heat[i] > 1e-6) vals.push(heat[i]);
  if (!vals.length) return 1;
  vals.sort((a, b) => a - b);
  return Math.max(1e-6, vals[Math.min(vals.length - 1, Math.floor(vals.length * percentile))]);
}

/** Where the heat's own light comes from, in the figure's frame (it stands unturned at the origin). */
const LIGHT: Vec3 = (() => {
  const l: Vec3 = [0.35, 0.85, 0.4];
  const n = Math.hypot(...l);
  return [l[0] / n, l[1] / n, l[2] / n];
})();

/** A colour ramp sampled at 0..1: r, g, b, a in 0..1 (the heatmap's own LUT row 0, RGBA8). */
export type Ramp = (t: number, out: number[]) => void;

export function rampOfLut(lut: Uint8Array, width = 256): Ramp {
  return (t, out) => {
    const i = Math.max(0, Math.min(width - 1, Math.round(t * (width - 1)))) * 4;
    out[0] = lut[i] / 255;
    out[1] = lut[i + 1] / 255;
    out[2] = lut[i + 2] / 255;
    out[3] = lut[i + 3] / 255;
  };
}

/**
 * The mesh's colours with the heat on them: the ramp at heat / saturation,
 * laid over the lit paint by the ramp's own opacity (the low end of a
 * heatmap ramp is clear, so cold metal shows as metal). The heat is not
 * shaded: it reads as the same value from every side.
 */
export function paint(mesh: HeatMesh, heat: Float32Array, saturation: number, ramp: Ramp, out: VertexBuffer, offset: Vec3 = [0, 0, 0]): void {
  const c = [0, 0, 0, 0];
  const inv = saturation > 0 ? 1 / saturation : 0;
  const { pos, base, nrm } = mesh;
  for (let v = 0; v < mesh.count; v++) {
    let r = base[v * 4], g = base[v * 4 + 1], b = base[v * 4 + 2];
    const h = heat[v] * inv;
    if (h > 1e-4) {
      ramp(Math.min(1, h), c);
      // Even the faintest heat shows a little, so a single hit is never lost on the paint.
      const a = Math.max(c[3], Math.min(1, h * 6) * 0.35);
      // A little of the light on the heat too, so a hot surface keeps its form.
      const lit = 0.72 + 0.28 * Math.max(0, nrm[v * 3] * LIGHT[0] + nrm[v * 3 + 1] * LIGHT[1] + nrm[v * 3 + 2] * LIGHT[2]);
      r = r * (1 - a) + c[0] * lit * a;
      g = g * (1 - a) + c[1] * lit * a;
      b = b * (1 - a) + c[2] * lit * a;
    }
    out.vertex(pos[v * 3] + offset[0], pos[v * 3 + 1] + offset[1], pos[v * 3 + 2] + offset[2], r, g, b, base[v * 4 + 3]);
  }
}
