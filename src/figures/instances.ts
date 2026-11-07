/**
 * Figures drawn by the GPU: each template (full and coarse) is uploaded once
 * as a mesh, and every figure on screen is one instance of it - its place,
 * its turn, its size, its team's colour - so a frame writes 16 floats a
 * figure instead of every vertex of it. The vertex shader does what
 * `placeFrame` does on the CPU, light included (`light.ts`), and
 * `expand` below is that same arithmetic in JavaScript: the reference the
 * shaders are tested against and what a renderer without them would draw.
 *
 * Mesh vertex (12 floats): x, y, z (template metres; x forward, y up, z
 * right), r, g, b (the unlit colour: the shade on the team part), a, nx, ny,
 * nz (template-frame normal; 0 0 0 unlit), gloss, tint (1: times the team's
 * colour).
 *
 * Instance (16 floats): o.x, o.y, o.z, scale, f.x, f.y, f.z, alpha, u.x, u.y,
 * u.z, 0, team r, g, b, 0. The right axis is cross(f, u), as `poseFrame` and
 * a quaternion's frame both have it.
 */

import { VertexBuffer, type Frame3, type Rgb } from '../race/geometry';
import type { Template } from './kit';
import { shade } from './light';

export const MESH_STRIDE = 12;
export const INSTANCE_STRIDE = 16;

export interface FigureMesh {
  /** Stable for the life of the template: what a renderer keys its upload on. */
  readonly id: number;
  readonly data: Float32Array;
  /** Vertices (a triangle list). */
  readonly count: number;
}

/** One mesh's instances this frame. */
export interface FigureBatch {
  mesh: FigureMesh;
  data: Float32Array;
  count: number;
}

let nextId = 1;
const meshes = new WeakMap<Template, FigureMesh>();

/** A template as a mesh, built once. */
export function meshOf(t: Template): FigureMesh {
  let m = meshes.get(t);
  if (m) return m;
  const parts: [Float32Array, Float32Array | undefined, number][] = [
    [t.fixed, t.fixedN, 0],
    [t.team, t.teamN, 1],
  ];
  const count = (t.fixed.length + t.team.length) / 7;
  const data = new Float32Array(count * MESH_STRIDE);
  let o = 0;
  for (const [d, n, tint] of parts) {
    for (let i = 0, j = 0; i < d.length; i += 7, j += 4) {
      data[o] = d[i];
      data[o + 1] = d[i + 1];
      data[o + 2] = d[i + 2];
      data[o + 3] = d[i + 3];
      data[o + 4] = d[i + 4];
      data[o + 5] = d[i + 5];
      data[o + 6] = d[i + 6];
      data[o + 7] = n ? n[j] : 0;
      data[o + 8] = n ? n[j + 1] : 0;
      data[o + 9] = n ? n[j + 2] : 0;
      data[o + 10] = n ? n[j + 3] : 0;
      data[o + 11] = tint;
      o += MESH_STRIDE;
    }
  }
  m = { id: nextId++, data, count };
  meshes.set(t, m);
  return m;
}

/** This frame's instances, by mesh; the arrays are kept frame to frame. */
export class InstanceBatches {
  private readonly byMesh = new Map<FigureMesh, FigureBatch>();
  /** Batches with instances this frame, in the order their meshes first appeared. */
  readonly list: FigureBatch[] = [];
  /** Instances in all. */
  total = 0;

  reset(): void {
    for (const b of this.list) b.count = 0;
    this.list.length = 0;
    this.total = 0;
  }

  add(mesh: FigureMesh, fr: Frame3, scale: number, team: Rgb, alpha = 1): void {
    let b = this.byMesh.get(mesh);
    if (!b) {
      b = { mesh, data: new Float32Array(64 * INSTANCE_STRIDE), count: 0 };
      this.byMesh.set(mesh, b);
    }
    if (b.count === 0) this.list.push(b);
    if ((b.count + 1) * INSTANCE_STRIDE > b.data.length) {
      const next = new Float32Array(b.data.length * 2);
      next.set(b.data);
      b.data = next;
    }
    const d = b.data;
    const o = b.count * INSTANCE_STRIDE;
    d[o] = fr.o[0];
    d[o + 1] = fr.o[1];
    d[o + 2] = fr.o[2];
    d[o + 3] = scale;
    d[o + 4] = fr.f[0];
    d[o + 5] = fr.f[1];
    d[o + 6] = fr.f[2];
    d[o + 7] = alpha;
    d[o + 8] = fr.u[0];
    d[o + 9] = fr.u[1];
    d[o + 10] = fr.u[2];
    d[o + 11] = 0;
    d[o + 12] = team[0];
    d[o + 13] = team[1];
    d[o + 14] = team[2];
    d[o + 15] = 0;
    b.count++;
    this.total++;
  }

  /** Drops what no frame has used lately: a dataset's figures once another is loaded. */
  prune(): void {
    for (const [m, b] of this.byMesh) if (b.count === 0 && !this.list.includes(b)) this.byMesh.delete(m);
  }
}

/**
 * The triangles a batch stands for, as the shaders make them: 7 floats a
 * vertex (x, y, z, r, g, b, a) into `out`.
 */
export function expand(b: FigureBatch, out: VertexBuffer): void {
  const m = b.mesh.data;
  const d = b.data;
  for (let i = 0; i < b.count; i++) {
    const o = i * INSTANCE_STRIDE;
    const ox = d[o], oy = d[o + 1], oz = d[o + 2], k = d[o + 3];
    const fx = d[o + 4], fy = d[o + 5], fz = d[o + 6], alpha = d[o + 7];
    const ux = d[o + 8], uy = d[o + 9], uz = d[o + 10];
    const rx = fy * uz - fz * uy, ry = fz * ux - fx * uz, rz = fx * uy - fy * ux;
    const tr = d[o + 12], tg = d[o + 13], tb = d[o + 14];
    for (let v = 0; v < b.mesh.count; v++) {
      const p = v * MESH_STRIDE;
      const a = m[p] * k, bb = m[p + 1] * k, c = m[p + 2] * k;
      const tint = m[p + 11] > 0.5;
      const base: Rgb = tint ? [tr * m[p + 3], tg * m[p + 4], tb * m[p + 5]] : [m[p + 3], m[p + 4], m[p + 5]];
      const na = m[p + 7], nb = m[p + 8], nc = m[p + 9];
      const lit = shade(base, [fx * na + ux * nb + rx * nc, fy * na + uy * nb + ry * nc, fz * na + uz * nb + rz * nc], m[p + 10]);
      out.vertex(ox + fx * a + ux * bb + rx * c, oy + fy * a + uy * bb + ry * c, oz + fz * a + uz * bb + rz * c, lit[0], lit[1], lit[2], m[p + 6] * alpha);
    }
  }
}
