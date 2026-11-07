/**
 * The figures' mesh: shared vertices and triangles, from which each corner's
 * normal is worked out the way a modeller's auto-smooth does it - the faces
 * round a vertex that bend less than the crease angle from the corner's own
 * face are averaged (by area), the rest are left out. So a fuselage, a nose
 * or a wing's leading edge come out smooth, and a cap, a trailing edge or a
 * hull's chine stay sharp, without each part saying which edges are which.
 *
 * Which way is out: for a closed solid the sign of its volume says (a mesh
 * wound inside out has a negative one); a flat part is given a direction.
 */

import type { Rgb, Vec3 } from '../race/geometry';
import type { FigBuffer } from './kit';

/** Faces bending more than this from each other meet in a sharp edge, degrees. */
export const CREASE = 52;

export class Mesh {
  readonly p: number[] = [];
  readonly c: number[] = [];
  readonly idx: number[] = [];

  /** Adds a vertex, returns its index. */
  v(p: Vec3, col: Rgb): number {
    this.p.push(p[0], p[1], p[2]);
    this.c.push(col[0], col[1], col[2]);
    return this.p.length / 3 - 1;
  }

  tri(a: number, b: number, c: number): void {
    this.idx.push(a, b, c);
  }

  /** Two triangles, corners in order round the quad. */
  quad(a: number, b: number, c: number, d: number): void {
    this.idx.push(a, b, c, a, c, d);
  }

  /**
   * A grid of rows (each a list of vertex indices), quads between neighbours;
   * `wrap` joins each row's last vertex to its first (a ring).
   */
  grid(rows: number[][], wrap: boolean): void {
    for (let k = 0; k + 1 < rows.length; k++) {
      const a = rows[k];
      const b = rows[k + 1];
      const n = a.length;
      for (let i = 0; i < (wrap ? n : n - 1); i++) {
        const j = (i + 1) % n;
        this.quad(a[i], a[j], b[j], b[i]);
      }
    }
  }

  /** A fan from `centre` round a ring of indices, wound to match a grid's first row (`first`) or its last. */
  fan(centre: number, ring: number[], first: boolean): void {
    const n = ring.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      if (first) this.tri(centre, ring[j], ring[i]);
      else this.tri(centre, ring[i], ring[j]);
    }
  }

  /** Six times the signed volume: positive when the triangles are wound with their fronts outward. */
  volume(): number {
    const p = this.p;
    let v = 0;
    for (let t = 0; t < this.idx.length; t += 3) {
      const a = this.idx[t] * 3;
      const b = this.idx[t + 1] * 3;
      const c = this.idx[t + 2] * 3;
      v +=
        p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) +
        p[a + 1] * (p[b + 2] * p[c] - p[b] * p[c + 2]) +
        p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c]);
    }
    return v;
  }

  /**
   * Writes the triangles with their normals into `out`. Outward is found from
   * the volume, or for a flat part (`facing`) as the side that direction is on.
   */
  emit(out: FigBuffer, opts: { alpha?: number; gloss?: number; crease?: number; facing?: Vec3; axis?: [Vec3, Vec3, boolean?]; unlit?: boolean } = {}): void {
    const { alpha = 1, gloss = 0, crease = CREASE, unlit = false } = opts;
    const p = this.p;
    const idx = this.idx;
    const nt = idx.length / 3;
    // Face normals (area-weighted, unnormalised) and unit ones.
    const fn = new Float64Array(nt * 3);
    const fu = new Float64Array(nt * 3);
    for (let t = 0; t < nt; t++) {
      const a = idx[t * 3] * 3;
      const b = idx[t * 3 + 1] * 3;
      const c = idx[t * 3 + 2] * 3;
      const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
      const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
      const x = uy * vz - uz * vy;
      const y = uz * vx - ux * vz;
      const z = ux * vy - uy * vx;
      fn[t * 3] = x;
      fn[t * 3 + 1] = y;
      fn[t * 3 + 2] = z;
      const l = Math.hypot(x, y, z);
      if (l > 0) {
        fu[t * 3] = x / l;
        fu[t * 3 + 1] = y / l;
        fu[t * 3 + 2] = z / l;
      }
    }
    let sign = 1;
    if (opts.facing) {
      let s = 0;
      for (let t = 0; t < nt; t++) s += fn[t * 3] * opts.facing[0] + fn[t * 3 + 1] * opts.facing[1] + fn[t * 3 + 2] * opts.facing[2];
      sign = s < 0 ? -1 : 1;
    } else if (opts.axis) {
      // Away from an axis (point, unit direction), or towards it for an inner surface (third item true).
      const [o, d, inward] = opts.axis;
      let s = 0;
      for (let t = 0; t < nt; t++) {
        let cx = 0, cy = 0, cz = 0;
        for (let k = 0; k < 3; k++) {
          const v = idx[t * 3 + k] * 3;
          cx += p[v] / 3 - o[0] / 3;
          cy += p[v + 1] / 3 - o[1] / 3;
          cz += p[v + 2] / 3 - o[2] / 3;
        }
        const along = cx * d[0] + cy * d[1] + cz * d[2];
        s += fn[t * 3] * (cx - along * d[0]) + fn[t * 3 + 1] * (cy - along * d[1]) + fn[t * 3 + 2] * (cz - along * d[2]);
      }
      sign = (s < 0 ? -1 : 1) * (inward ? -1 : 1);
    } else sign = this.volume() < 0 ? -1 : 1;
    // The faces round each vertex.
    const nv = p.length / 3;
    const start = new Int32Array(nv + 1);
    for (const i of idx) start[i + 1]++;
    for (let i = 0; i < nv; i++) start[i + 1] += start[i];
    const fill = start.slice(0, nv);
    const faces = new Int32Array(idx.length);
    for (let t = 0; t < nt; t++) for (let k = 0; k < 3; k++) faces[fill[idx[t * 3 + k]]++] = t;
    const cosC = Math.cos((crease * Math.PI) / 180);
    const n: Vec3 = [0, 0, 0];
    const pos: Vec3 = [0, 0, 0];
    const col: Rgb = [0, 0, 0];
    for (let t = 0; t < nt; t++) {
      if (fu[t * 3] === 0 && fu[t * 3 + 1] === 0 && fu[t * 3 + 2] === 0) continue;
      for (let k = 0; k < 3; k++) {
        const v = idx[t * 3 + k];
        if (unlit) {
          n[0] = n[1] = n[2] = 0;
        } else {
          let x = 0, y = 0, z = 0;
          for (let q = start[v]; q < start[v + 1]; q++) {
            const f = faces[q];
            const d = fu[f * 3] * fu[t * 3] + fu[f * 3 + 1] * fu[t * 3 + 1] + fu[f * 3 + 2] * fu[t * 3 + 2];
            if (d < cosC) continue;
            x += fn[f * 3];
            y += fn[f * 3 + 1];
            z += fn[f * 3 + 2];
          }
          const l = Math.hypot(x, y, z) || 1;
          n[0] = (sign * x) / l;
          n[1] = (sign * y) / l;
          n[2] = (sign * z) / l;
        }
        pos[0] = p[v * 3];
        pos[1] = p[v * 3 + 1];
        pos[2] = p[v * 3 + 2];
        col[0] = this.c[v * 3];
        col[1] = this.c[v * 3 + 1];
        col[2] = this.c[v * 3 + 2];
        out.vn(pos, n, col, alpha, gloss);
      }
    }
  }
}
