/**
 * Figures drawn by the GPU: each template (full and coarse) is uploaded once
 * as a mesh, and every figure on screen is one instance of it - its place,
 * its turn, its size, its team's colour - so a frame writes 16 floats a
 * figure instead of every vertex of it. The vertex shader does what
 * `placeFrame` does on the CPU, light included (`light.ts`), and
 * `expand` below is that same arithmetic in JavaScript: the reference the
 * shaders are tested against and what a renderer without them would draw.
 *
 * Mesh vertex (24 floats): x, y, z (template metres; x forward, y up, z
 * right), r, g, b (the unlit colour: the shade on the team part), a, nx, ny,
 * nz (template-frame normal; 0 0 0 unlit), gloss, tint (1: times the team's
 * colour), then how it moves (`articulate`): kind (0 fixed, 1 a turret, 2 a
 * gun on a turret, 3 a gun on the hull), the turret's pivot x and z and the
 * yaw it was built facing, the gun's trunnion x, y, z and the yaw it was
 * built pointing, the elevation it was built at, and three zeros.
 *
 * Instance (16 floats): o.x, o.y, o.z, scale, f.x, f.y, f.z, alpha, u.x, u.y,
 * u.z, turret yaw (radians from the hull's forward, right positive), team r,
 * g, b, gun elevation (radians, up positive; `NO_PITCH`: as built). The right
 * axis is cross(f, u), as `poseFrame` and a quaternion's frame both have it.
 */

import { VertexBuffer, type Frame3, type Rgb } from '../race/geometry';
import type { Joint, Template } from './kit';
import { shade } from './light';

export const MESH_STRIDE = 24;
export const INSTANCE_STRIDE = 16;
/** An instance's gun elevation when the data has none: the gun stays as it was built. */
export const NO_PITCH = -100;
/** Below this an instance's gun elevation means `NO_PITCH`. */
export const NO_PITCH_BELOW = -50;

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
  const parts: [Float32Array, Float32Array | undefined, Uint8Array | undefined, number][] = [
    [t.fixed, t.fixedN, t.fixedJ, 0],
    [t.team, t.teamN, t.teamJ, 1],
  ];
  const joints = t.joints ?? [];
  const count = (t.fixed.length + t.team.length) / 7;
  const data = new Float32Array(count * MESH_STRIDE);
  let o = 0;
  for (const [d, n, jn, tint] of parts) {
    for (let i = 0, j = 0, v = 0; i < d.length; i += 7, j += 4, v++) {
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
      const ji = jn ? jn[v] - 1 : -1;
      const jt = ji >= 0 ? joints[ji] : undefined;
      if (jt) writeJoint(data, o + 12, jt, jt.parent >= 0 ? joints[jt.parent] : undefined, joints);
      o += MESH_STRIDE;
    }
  }
  m = { id: nextId++, data, count };
  meshes.set(t, m);
  return m;
}

/** Whether a template has parts that turn (a turret, a gun). */
export function hasJoints(t: Template): boolean {
  return !!t.joints?.length;
}

/**
 * The yaw joint that carries a yaw joint round: itself, or for one on another turret (a cupola, a sub-turret on the
 * turret roof: `parent` a yaw joint) the outermost turret it rides on. A figure has one yaw, so a turret on a turret
 * turns with the one under it, about that one's pivot, rather than about its own.
 */
export function carrierOf(joints: Joint[], j: Joint): Joint {
  let c = j;
  for (let n = 0; n < joints.length && c.parent >= 0 && joints[c.parent]?.kind === 'yaw'; n++) c = joints[c.parent];
  return c;
}

/** A vertex's movement (the 12 floats after its tint) for the joint it moves with. */
function writeJoint(out: Float32Array, o: number, j: Joint, parent: Joint | undefined, joints: Joint[]): void {
  if (j.kind === 'yaw') {
    const c = carrierOf(joints, j);
    out[o] = 1;
    out[o + 1] = c.pivot[0];
    out[o + 2] = c.pivot[2];
    out[o + 3] = c.rest;
    return;
  }
  const turret = parent && parent.kind === 'yaw' ? carrierOf(joints, parent) : undefined;
  out[o] = turret ? 2 : 3;
  if (turret) {
    out[o + 1] = turret.pivot[0];
    out[o + 2] = turret.pivot[2];
    out[o + 3] = turret.rest;
  }
  out[o + 4] = j.pivot[0];
  out[o + 5] = j.pivot[1];
  out[o + 6] = j.pivot[2];
  out[o + 7] = j.rest;
  out[o + 8] = j.pitch ?? 0;
}

/**
 * Where a vertex (or, with `point` false, a normal) of a moving part goes for
 * a turret yaw and a gun elevation - what the shaders do, in JavaScript: a
 * gun is first raised about its trunnion, across the way it was built
 * pointing, then carried round with its turret about the turret's vertical.
 * `m` is the mesh data, `p` the vertex's offset; the result goes in `out`.
 */
export function articulate(m: Float32Array, p: number, x: number, y: number, z: number, yaw: number, pitch: number, point: boolean, out: number[]): void {
  const kind = m[p + 12];
  if (kind >= 1.5 && pitch > NO_PITCH_BELOW) {
    const gr = m[p + 19];
    const dx = Math.cos(gr);
    const dz = Math.sin(gr);
    const tx = point ? m[p + 16] : 0;
    const ty = point ? m[p + 17] : 0;
    const tz = point ? m[p + 18] : 0;
    const wx = x - tx;
    const wy = y - ty;
    const wz = z - tz;
    const along = wx * dx + wz * dz;
    const sx = wx - dx * along;
    const sz = wz - dz * along;
    const a = pitch - m[p + 20];
    const c = Math.cos(a);
    const s = Math.sin(a);
    const al = along * c - wy * s;
    const up = along * s + wy * c;
    x = tx + dx * al + sx;
    y = ty + up;
    z = tz + dz * al + sz;
  }
  if (kind > 0.5 && kind < 2.5) {
    const a = yaw - m[p + 15];
    const c = Math.cos(a);
    const s = Math.sin(a);
    const cx = point ? m[p + 13] : 0;
    const cz = point ? m[p + 14] : 0;
    const rx = x - cx;
    const rz = z - cz;
    x = cx + rx * c - rz * s;
    z = cz + rx * s + rz * c;
  }
  out[0] = x;
  out[1] = y;
  out[2] = z;
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

  /** One instance; `yaw` turns its turrets (radians from the hull's forward, right positive), `pitch` raises its guns (`NO_PITCH`: as built). */
  add(mesh: FigureMesh, fr: Frame3, scale: number, team: Rgb, alpha = 1, yaw = 0, pitch = NO_PITCH): void {
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
    d[o + 11] = Number.isFinite(yaw) ? yaw : 0;
    d[o + 12] = team[0];
    d[o + 13] = team[1];
    d[o + 14] = team[2];
    d[o + 15] = Number.isFinite(pitch) ? pitch : NO_PITCH;
    b.count++;
    this.total++;
  }

  /** Drops what no frame has used lately: a dataset's figures once another is loaded. */
  prune(): void {
    for (const [m, b] of this.byMesh) if (b.count === 0 && !this.list.includes(b)) this.byMesh.delete(m);
  }
}

const at = [0, 0, 0];

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
    const yaw = d[o + 11], pitch = d[o + 15];
    for (let v = 0; v < b.mesh.count; v++) {
      const p = v * MESH_STRIDE;
      articulate(m, p, m[p], m[p + 1], m[p + 2], yaw, pitch, true, at);
      const a = at[0] * k, bb = at[1] * k, c = at[2] * k;
      const tint = m[p + 11] > 0.5;
      const base: Rgb = tint ? [tr * m[p + 3], tg * m[p + 4], tb * m[p + 5]] : [m[p + 3], m[p + 4], m[p + 5]];
      articulate(m, p, m[p + 7], m[p + 8], m[p + 9], yaw, pitch, false, at);
      const na = at[0], nb = at[1], nc = at[2];
      const lit = shade(base, [fx * na + ux * nb + rx * nc, fy * na + uy * nb + ry * nc, fz * na + uz * nb + rz * nc], m[p + 10]);
      out.vertex(ox + fx * a + ux * bb + rx * c, oy + fy * a + uy * bb + ry * c, oz + fz * a + uz * bb + rz * c, lit[0], lit[1], lit[2], m[p + 6] * alpha);
    }
  }
}
