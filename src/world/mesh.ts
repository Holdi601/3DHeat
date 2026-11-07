import { ShapeUtils, Vector2 } from 'three';
import { dataToWorld } from '../render/pose';
import type { AxisMapping, Bounds } from '../state/types';

/**
 * The backdrop's geometry, built in the dataset's own east, north and height
 * metres and handed over in the viewer's world through the load's axis mapping.
 *
 * Callers work in "terrain pixels": global Web Mercator pixel coordinates at
 * the terrain's zoom, x east and y south. Every shape is clipped, triangulated
 * and densified there, where the terrain grid is regular and a height is one
 * lookup, and becomes metres only when a vertex is written (`project`).
 */

export type MeshSet = 'ground' | 'structure' | 'water';

export type Rgb = readonly [number, number, number];

/** A height at a terrain-pixel position. */
export type HeightAt = (px: number, py: number) => number;

/** Terrain pixels to the dataset's east and north metres. */
export type Project = (px: number, py: number) => [number, number];

/** One named run of triangles in a set, for saying what a click hit. */
interface Run {
  part: number;
  end: number;
}

class Grow {
  a: Float64Array;
  n = 0;
  constructor(cap = 1 << 14) {
    this.a = new Float64Array(cap);
  }
  push3(x: number, y: number, z: number): void {
    if (this.n + 3 > this.a.length) {
      const b = new Float64Array(this.a.length * 2);
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = x;
    this.a[this.n++] = y;
    this.a[this.n++] = z;
  }
}

class GrowU32 {
  a: Uint32Array;
  n = 0;
  constructor(cap = 1 << 14) {
    this.a = new Uint32Array(cap);
  }
  push(v: number): void {
    if (this.n + 1 > this.a.length) {
      const b = new Uint32Array(this.a.length * 2);
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = v;
  }
  done(): Uint32Array {
    return this.a.slice(0, this.n);
  }
}

export interface BuiltMesh {
  vertices: Float32Array;
  colours: Float32Array;
  indices: Uint32Array;
  structureIndices: Uint32Array;
  structureEdges: Uint32Array;
  waterIndices: Uint32Array;
  partNames: string[];
  partRuns: { ground: Uint32Array; structure: Uint32Array; water: Uint32Array };
  bounds: Bounds;
  /** Height range of the terrain alone, world Y. */
  groundBand: { minY: number; maxY: number };
}

/**
 * Collects vertices (east, north, height, colour) and triangles per set.
 *
 * Ground and water triangles are turned to face up whatever order they come
 * in, since draped shapes are built from lines and rings of either winding.
 * Structure triangles are taken as given: a wall's outside is its caller's to
 * know.
 */
export class MeshBuilder {
  private readonly pos = new Grow();
  private readonly col = new Grow();
  private readonly sets: Record<MeshSet, GrowU32> = { ground: new GrowU32(), structure: new GrowU32(), water: new GrowU32() };
  private readonly edges = new GrowU32();
  private readonly runs: Record<MeshSet, Run[]> = { ground: [], structure: [], water: [] };
  private readonly names: string[] = [];
  private part: Record<MeshSet, number> = { ground: -1, structure: -1, water: -1 };
  /** Vertices that belong to the terrain grid, for the relief band: the first `terrainVertices`. */
  terrainVertices = 0;

  constructor(public project: Project) {}

  get vertexCount(): number {
    return this.pos.n / 3;
  }

  triangles(set: MeshSet): number {
    return this.sets[set].n / 3;
  }

  get totalTriangles(): number {
    return (this.sets.ground.n + this.sets.structure.n + this.sets.water.n) / 3;
  }

  /** Names the triangles that follow in a set, until the next name. */
  begin(set: MeshSet, name: string): void {
    let p = this.names.indexOf(name);
    if (p < 0) {
      p = this.names.length;
      this.names.push(name);
    }
    this.closeRun(set);
    this.part[set] = p;
  }

  private closeRun(set: MeshSet): void {
    const p = this.part[set];
    if (p < 0) return;
    const end = this.triangles(set);
    const runs = this.runs[set];
    const last = runs[runs.length - 1];
    if (last && last.end === end) return;
    if (last && last.part === p) last.end = end;
    else runs.push({ part: p, end });
  }

  /** A vertex at a terrain pixel and height; its index. */
  vertexAt(px: number, py: number, h: number, c: Rgb): number {
    const [e, n] = this.project(px, py);
    return this.vertex(e, n, h, c);
  }

  /** Moves a vertex already made up or down: the sea floor is flattened once the map says where the sea is. */
  setHeight(i: number, h: number): void {
    this.pos.a[i * 3 + 2] = h;
  }

  /** Repaints a vertex already made: the terrain is coloured once the map says what covers it. */
  setColour(i: number, c: Rgb): void {
    this.col.a[i * 3] = c[0];
    this.col.a[i * 3 + 1] = c[1];
    this.col.a[i * 3 + 2] = c[2];
  }

  /** A vertex in east, north and height metres; its index. */
  vertex(e: number, n: number, h: number, c: Rgb): number {
    this.pos.push3(e, n, h);
    this.col.push3(c[0], c[1], c[2]);
    return this.pos.n / 3 - 1;
  }

  tri(set: MeshSet, a: number, b: number, c: number): void {
    const s = this.sets[set];
    if (set !== 'structure') {
      const p = this.pos.a;
      const cross = (p[b * 3] - p[a * 3]) * (p[c * 3 + 1] - p[a * 3 + 1]) - (p[b * 3 + 1] - p[a * 3 + 1]) * (p[c * 3] - p[a * 3]);
      if (cross < 0) {
        const t = b;
        b = c;
        c = t;
      }
    }
    s.push(a);
    s.push(b);
    s.push(c);
  }

  edge(a: number, b: number): void {
    this.edges.push(a);
    this.edges.push(b);
  }

  /**
   * The mesh in the viewer's world: positions through the load's axis mapping,
   * triangles turned where the mapping mirrors the world, normals from the
   * faces around each vertex.
   */
  finish(
    axes: AxisMapping | null | undefined,
    frame: { toData: (e: number, n: number, h: number) => { x: number; y: number; z: number }; sense: number } = {
      toData: (e, n, h) => ({ x: e, y: n, z: h }),
      sense: 1,
    },
  ): BuiltMesh {
    for (const s of ['ground', 'structure', 'water'] as MeshSet[]) this.closeRun(s);
    const nv = this.vertexCount;
    const src = this.pos.a;
    const vertices = new Float32Array(nv * 6);
    const bounds: Bounds = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };
    let bandLo = Infinity;
    let bandHi = -Infinity;
    for (let i = 0; i < nv; i++) {
      // East, north, height into the data's frame (see `GeoReference`).
      const w = dataToWorld(frame.toData(src[i * 3], src[i * 3 + 1], src[i * 3 + 2]), axes);
      vertices[i * 6] = w.x;
      vertices[i * 6 + 1] = w.y;
      vertices[i * 6 + 2] = w.z;
      if (w.x < bounds.minX) bounds.minX = w.x;
      if (w.x > bounds.maxX) bounds.maxX = w.x;
      if (w.y < bounds.minY) bounds.minY = w.y;
      if (w.y > bounds.maxY) bounds.maxY = w.y;
      if (w.z < bounds.minZ) bounds.minZ = w.z;
      if (w.z > bounds.maxZ) bounds.maxZ = w.z;
      if (i < this.terrainVertices) {
        if (w.y < bandLo) bandLo = w.y;
        if (w.y > bandHi) bandHi = w.y;
      }
    }
    if (!Number.isFinite(bandLo)) {
      bandLo = bounds.minY;
      bandHi = bounds.maxY;
    }
    // A frame that mirrors east, north, height counts too.
    const mirrored = handedness(axes) * frame.sense < 0;
    const out = (set: MeshSet) => {
      const idx = this.sets[set].done();
      if (mirrored) {
        for (let i = 0; i + 2 < idx.length; i += 3) {
          const t = idx[i + 1];
          idx[i + 1] = idx[i + 2];
          idx[i + 2] = t;
        }
      }
      return idx;
    };
    const indices = out('ground');
    const structureIndices = out('structure');
    const waterIndices = out('water');
    for (const idx of [indices, structureIndices, waterIndices]) accumulateNormals(vertices, idx);
    for (let i = 0; i < nv; i++) {
      const o = i * 6 + 3;
      const l = Math.hypot(vertices[o], vertices[o + 1], vertices[o + 2]);
      if (l > 0) {
        vertices[o] /= l;
        vertices[o + 1] /= l;
        vertices[o + 2] /= l;
      } else vertices[o + 1] = 1;
    }
    const runs = (set: MeshSet) => {
      const r = this.runs[set];
      const a = new Uint32Array(r.length * 2);
      r.forEach((x, i) => {
        a[i * 2] = x.part;
        a[i * 2 + 1] = x.end;
      });
      return a;
    };
    return {
      vertices,
      colours: Float32Array.from(this.col.a.subarray(0, this.col.n)),
      indices,
      structureIndices,
      structureEdges: this.edges.done(),
      waterIndices,
      partNames: [...this.names],
      partRuns: { ground: runs('ground'), structure: runs('structure'), water: runs('water') },
      bounds,
      groundBand: { minY: bandLo, maxY: bandHi },
    };
  }
}

/** +1 when the axis mapping keeps the data's handedness, -1 when it mirrors it. */
export function handedness(axes: AxisMapping | null | undefined): number {
  if (!axes) return 1;
  const s = (axes.flipX ? -1 : 1) * (axes.flipY ? -1 : 1) * (axes.flipZ ? -1 : 1);
  // Z up swaps two axes on the way into the world, which is itself a mirror.
  return axes.up === 'z' ? -s : s;
}

/** Adds each triangle's area-weighted normal to its three vertices (interleaved position+normal). */
export function accumulateNormals(v: Float32Array, idx: Uint32Array): void {
  for (let i = 0; i + 2 < idx.length; i += 3) {
    const a = idx[i] * 6;
    const b = idx[i + 1] * 6;
    const c = idx[i + 2] * 6;
    const ux = v[b] - v[a];
    const uy = v[b + 1] - v[a + 1];
    const uz = v[b + 2] - v[a + 2];
    const wx = v[c] - v[a];
    const wy = v[c + 1] - v[a + 1];
    const wz = v[c + 2] - v[a + 2];
    const nx = uy * wz - uz * wy;
    const ny = uz * wx - ux * wz;
    const nz = ux * wy - uy * wx;
    for (const o of [a, b, c]) {
      v[o + 3] += nx;
      v[o + 4] += ny;
      v[o + 5] += nz;
    }
  }
}

// ------------------------------------------------------------------ shapes

/** Twice the signed area of a flat ring [x0, y0, x1, y1, ...]; positive is clockwise on screen (y down). */
export function area2(ring: ArrayLike<number>): number {
  let a = 0;
  const n = ring.length;
  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n;
    a += ring[i] * ring[j + 1] - ring[j] * ring[i + 1];
  }
  return a;
}

/** Triangles of a polygon (outer ring and holes, flat x,y arrays) as index triples into the rings joined. */
export function triangulate(outer: number[], holes: number[][]): number[][] {
  const v = (r: number[]) => {
    const out: Vector2[] = [];
    for (let i = 0; i < r.length; i += 2) out.push(new Vector2(r[i], r[i + 1]));
    return out;
  };
  try {
    return ShapeUtils.triangulateShape(v(outer), holes.map(v));
  } catch {
    return [];
  }
}

/**
 * A rectangle clip of a ring (Sutherland-Hodgman), with which of the result's
 * edges lie along the rectangle's sides: those are seams with the next tile,
 * where a building cut in two must not grow a wall.
 */
export function clipRing(ring: number[], x0: number, y0: number, x1: number, y1: number): { ring: number[]; cut: Uint8Array } {
  let pts = ring;
  const sides: Array<[(x: number, y: number) => boolean, (ax: number, ay: number, bx: number, by: number) => [number, number]]> = [
    [(x) => x >= x0, (ax, ay, bx, by) => [x0, ay + ((by - ay) * (x0 - ax)) / (bx - ax)]],
    [(x) => x <= x1, (ax, ay, bx, by) => [x1, ay + ((by - ay) * (x1 - ax)) / (bx - ax)]],
    [(_, y) => y >= y0, (ax, ay, bx, by) => [ax + ((bx - ax) * (y0 - ay)) / (by - ay), y0]],
    [(_, y) => y <= y1, (ax, ay, bx, by) => [ax + ((bx - ax) * (y1 - ay)) / (by - ay), y1]],
  ];
  for (const [inside, cross] of sides) {
    const next: number[] = [];
    const n = pts.length;
    if (n < 6) break;
    for (let i = 0; i < n; i += 2) {
      const ax = pts[(i - 2 + n) % n];
      const ay = pts[(i - 1 + n) % n];
      const bx = pts[i];
      const by = pts[i + 1];
      const ain = inside(ax, ay);
      const bin = inside(bx, by);
      if (bin) {
        if (!ain) next.push(...cross(ax, ay, bx, by));
        next.push(bx, by);
      } else if (ain) next.push(...cross(ax, ay, bx, by));
    }
    pts = next;
  }
  const n = pts.length;
  const cut = new Uint8Array(n / 2);
  const eps = 1e-9 * Math.max(1, Math.abs(x1), Math.abs(y1));
  const on = (a: number, b: number) => Math.abs(a - b) <= eps;
  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n;
    const ax = pts[i];
    const ay = pts[i + 1];
    const bx = pts[j];
    const by = pts[j + 1];
    if ((on(ax, x0) && on(bx, x0)) || (on(ax, x1) && on(bx, x1)) || (on(ay, y0) && on(by, y0)) || (on(ay, y1) && on(by, y1))) cut[i / 2] = 1;
  }
  return { ring: n >= 6 ? pts : [], cut: n >= 6 ? cut : new Uint8Array(0) };
}

/** A rectangle clip of a line (Liang-Barsky per segment), as the pieces inside. */
export function clipLine(line: number[], x0: number, y0: number, x1: number, y1: number): number[][] {
  const out: number[][] = [];
  let cur: number[] | null = null;
  for (let i = 0; i + 3 < line.length; i += 2) {
    const ax = line[i];
    const ay = line[i + 1];
    const dx = line[i + 2] - ax;
    const dy = line[i + 3] - ay;
    let t0 = 0;
    let t1 = 1;
    let keep = true;
    for (const [p, q] of [
      [-dx, ax - x0],
      [dx, x1 - ax],
      [-dy, ay - y0],
      [dy, y1 - ay],
    ]) {
      if (p === 0) {
        if (q < 0) keep = false;
      } else {
        const r = q / p;
        if (p < 0) t0 = Math.max(t0, r);
        else t1 = Math.min(t1, r);
      }
    }
    if (!keep || t0 > t1) {
      cur = null;
      continue;
    }
    const sx = ax + t0 * dx;
    const sy = ay + t0 * dy;
    const ex = ax + t1 * dx;
    const ey = ay + t1 * dy;
    if (!cur || t0 > 0) {
      cur = [sx, sy];
      out.push(cur);
    }
    cur.push(ex, ey);
    if (t1 < 1) cur = null;
  }
  return out.filter((l) => l.length >= 4);
}

/**
 * A building: walls from `bottom` to `top` metres above `base` round every
 * ring, a flat roof, and outline edges for the wireframe. Rings are in terrain
 * pixels, the outer one clockwise on screen (the vector-tile convention) and
 * holes the other way, so every wall faces out. Edges flagged in `cut` are
 * seams with a neighbouring tile and get no wall.
 */
export function extrudeBuilding(
  mb: MeshBuilder,
  rings: Array<{ ring: number[]; cut: Uint8Array }>,
  base: number,
  bottom: number,
  top: number,
  colour: Rgb,
): void {
  const lo = base + bottom;
  const hi = base + Math.max(top, bottom + 0.5);
  for (const { ring, cut } of rings) {
    const n = ring.length / 2;
    const proj: Array<[number, number]> = [];
    for (let i = 0; i < n; i++) proj.push(mb.project(ring[i * 2], ring[i * 2 + 1]));
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const [ae, an] = proj[i];
      const [be, bn] = proj[j];
      if (cut[i]) continue;
      // A tile's y runs south, so a ring clockwise on screen is clockwise on
      // a north-up map too, and its outside is to the left of each edge:
      // walls wound bottom-a, top-b, bottom-b face that way.
      const ab = mb.vertex(ae, an, lo, colour);
      const bb = mb.vertex(be, bn, lo, colour);
      const bt = mb.vertex(be, bn, hi, colour);
      const at = mb.vertex(ae, an, hi, colour);
      mb.tri('structure', ab, bt, bb);
      mb.tri('structure', ab, at, bt);
      mb.edge(ab, bb);
      mb.edge(at, bt);
      mb.edge(ab, at);
    }
  }
  // The roof, its own vertices so it shades flat.
  const outer = rings[0].ring;
  const holes = rings.slice(1).map((r) => r.ring);
  const faces = triangulate(outer, holes);
  if (!faces.length) return;
  const all = [outer, ...holes];
  const ids: number[] = [];
  const flat: number[] = [];
  for (const r of all) {
    for (let i = 0; i < r.length; i += 2) {
      const [e, nn] = mb.project(r[i], r[i + 1]);
      ids.push(mb.vertex(e, nn, hi, colour));
      flat.push(e, nn);
    }
  }
  for (const [a, b, c] of faces) {
    const ax = flat[a * 2];
    const ay = flat[a * 2 + 1];
    const cross = (flat[b * 2] - ax) * (flat[c * 2 + 1] - ay) - (flat[b * 2 + 1] - ay) * (flat[c * 2] - ax);
    if (cross >= 0) mb.tri('structure', ids[a], ids[b], ids[c]);
    else mb.tri('structure', ids[a], ids[c], ids[b]);
  }
}

/** Points of a line at most `step` apart, in its own units. */
export function densify(line: number[], step: number): number[] {
  const out: number[] = [line[0], line[1]];
  for (let i = 0; i + 3 < line.length; i += 2) {
    const ax = line[i];
    const ay = line[i + 1];
    const bx = line[i + 2];
    const by = line[i + 3];
    const k = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let s = 1; s <= k; s++) out.push(ax + ((bx - ax) * s) / k, ay + ((by - ay) * s) / k);
  }
  return out;
}

/**
 * A flat ribbon along a line, draped on the terrain: `halfWidth` either side
 * in terrain pixels, its points no further apart than `step`, each at the
 * ground's height plus `lift`.
 */
export function ribbon(mb: MeshBuilder, set: MeshSet, line: number[], halfWidth: number, step: number, heightAt: HeightAt, lift: number, colour: Rgb): void {
  const pts = densify(line, step);
  const n = pts.length / 2;
  if (n < 2) return;
  let prevL = -1;
  let prevR = -1;
  for (let i = 0; i < n; i++) {
    const x = pts[i * 2];
    const y = pts[i * 2 + 1];
    // The direction here: the mean of the segments either side, so joins mitre.
    let dx = 0;
    let dy = 0;
    if (i > 0) {
      const l = Math.hypot(x - pts[i * 2 - 2], y - pts[i * 2 - 1]) || 1;
      dx += (x - pts[i * 2 - 2]) / l;
      dy += (y - pts[i * 2 - 1]) / l;
    }
    if (i < n - 1) {
      const l = Math.hypot(pts[i * 2 + 2] - x, pts[i * 2 + 3] - y) || 1;
      dx += (pts[i * 2 + 2] - x) / l;
      dy += (pts[i * 2 + 3] - y) / l;
    }
    const dl = Math.hypot(dx, dy);
    if (dl < 1e-9) continue;
    dx /= dl;
    dy /= dl;
    // A sharp turn would stretch the mitre without end; past 60 degrees it is held.
    let miter = 1;
    if (i > 0 && i < n - 1) {
      const l = Math.hypot(pts[i * 2 + 2] - x, pts[i * 2 + 3] - y) || 1;
      const cos = (dx * (pts[i * 2 + 2] - x) + dy * (pts[i * 2 + 3] - y)) / l;
      miter = 1 / Math.max(0.5, cos);
    }
    const ox = -dy * halfWidth * miter;
    const oy = dx * halfWidth * miter;
    const lx = x + ox;
    const ly = y + oy;
    const rx = x - ox;
    const ry = y - oy;
    const L = mb.vertexAt(lx, ly, heightAt(lx, ly) + lift, colour);
    const R = mb.vertexAt(rx, ry, heightAt(rx, ry) + lift, colour);
    if (prevL >= 0) {
      mb.tri(set, prevL, prevR, R);
      mb.tri(set, prevL, R, L);
    }
    prevL = L;
    prevR = R;
  }
}

/**
 * A polygon laid on the ground: triangulated, then split until no edge is
 * longer than `maxEdge` terrain pixels so it can follow the relief, each
 * vertex at `heightAt`. A flat `heightAt` (the sea, a lake) needs no split:
 * pass `maxEdge` = Infinity.
 */
export function drapePolygon(mb: MeshBuilder, set: MeshSet, outer: number[], holes: number[][], maxEdge: number, heightAt: HeightAt, colour: Rgb): void {
  const faces = triangulate(outer, holes);
  if (!faces.length) return;
  const xy: number[] = [...outer];
  for (const h of holes) xy.push(...h);
  const ids = new Map<number, number>();
  const id = (k: number) => {
    let v = ids.get(k);
    if (v === undefined) {
      v = mb.vertexAt(xy[k * 2], xy[k * 2 + 1], heightAt(xy[k * 2], xy[k * 2 + 1]), colour);
      ids.set(k, v);
    }
    return v;
  };
  // Midpoints shared by the two triangles on an edge, so a split edge stays closed.
  const mids = new Map<string, number>();
  const mid = (a: number, b: number) => {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    let m = mids.get(key);
    if (m === undefined) {
      m = xy.length / 2;
      xy.push((xy[a * 2] + xy[b * 2]) / 2, (xy[a * 2 + 1] + xy[b * 2 + 1]) / 2);
      mids.set(key, m);
    }
    return m;
  };
  const len2 = (a: number, b: number) => (xy[a * 2] - xy[b * 2]) ** 2 + (xy[a * 2 + 1] - xy[b * 2 + 1]) ** 2;
  const max2 = maxEdge * maxEdge;
  const stack: Array<[number, number, number, number]> = faces.map(([a, b, c]) => [a, b, c, 0]);
  while (stack.length) {
    const [a, b, c, depth] = stack.pop()!;
    const ab = len2(a, b);
    const bc = len2(b, c);
    const ca = len2(c, a);
    const longest = Math.max(ab, bc, ca);
    if (longest > max2 && depth < 24) {
      // Halve the longest edge.
      if (longest === ab) {
        const m = mid(a, b);
        stack.push([a, m, c, depth + 1], [m, b, c, depth + 1]);
      } else if (longest === bc) {
        const m = mid(b, c);
        stack.push([a, b, m, depth + 1], [a, m, c, depth + 1]);
      } else {
        const m = mid(c, a);
        stack.push([a, b, m, depth + 1], [m, b, c, depth + 1]);
      }
      continue;
    }
    mb.tri(set, id(a), id(b), id(c));
  }
}
