/**
 * The figure kit: simple figures of the viewer's own - a soldier, a tank, a
 * helicopter, a smoke cloud - for box replay and the tactics board.
 *
 * Every figure is built once, as a template in its own frame, from the race
 * scene's shaded shapes (`../race/shapes.ts`), and then placed as often as it
 * is needed: moved, turned and coloured, which is a few multiplications a
 * vertex. Nothing is drawn from a game's assets; each shape is made here from
 * a class's general proportions and, for a named vehicle, its published size.
 *
 * A template has two parts. The fixed part keeps its own colours (tracks,
 * glass, gun metal); the team part is built white, so its colours are only the
 * shading, and takes the team's colour when it is placed.
 *
 * The template frame: x forward, y up, z right, metres. Ground things stand on
 * y = 0 with the middle of their footprint at the origin; aircraft are built
 * round their middle, because telemetry gives an aircraft's centre.
 */

import { VertexBuffer, type Frame3, type Rgb, type Vec3 } from '../race/geometry';
import { AMBIENT, GROUND_COLOR, SHEEN_BASE, SHEEN_COLOR, SHEEN_UP, SKY_COLOR, SUN_COLOR, SUN_DIR, UNLIT } from './light';

/**
 * A kit's vertex buffer: the usual seven floats a vertex, and beside them the
 * vertex's normal and gloss (four floats), so a placed figure is lit where it
 * is and as it is turned. Builders give each vertex its normal (`vn`); a
 * vertex written the old way (`vertex`, `triangle`, `quad`) takes its face's
 * normal at `finish`.
 */
export class FigBuffer extends VertexBuffer {
  nrm = new Float32Array(4 * 4096);
  /** Per vertex, the joint it moves with: 0 the hull, j + 1 the kit's joint j (see `Joint`). */
  jnt = new Uint8Array(4096);
  /** The joint the next vertices are written into (set by `into`). */
  joint = 0;

  override vertex(x: number, y: number, z: number, r: number, g: number, b: number, a: number): void {
    super.vertex(x, y, z, r, g, b, a);
    this.setNormal(this.count - 1, NaN, 0, 0, 0);
  }

  /** A vertex with its own unit normal and gloss (0 paint, 1 glass; normal 0,0,0: unlit, for discs). */
  vn(p: Vec3, n: Vec3, col: Rgb, alpha = 1, gloss = 0): void {
    super.vertex(p[0], p[1], p[2], col[0], col[1], col[2], alpha);
    this.setNormal(this.count - 1, n[0], n[1], n[2], gloss);
  }

  private setNormal(i: number, x: number, y: number, z: number, g: number): void {
    if ((i + 1) * 4 > this.nrm.length) {
      const next = new Float32Array(Math.max(this.nrm.length * 2, (i + 1) * 8));
      next.set(this.nrm);
      this.nrm = next;
    }
    if (i >= this.jnt.length) {
      const next = new Uint8Array(Math.max(this.jnt.length * 2, i + 1));
      next.set(this.jnt);
      this.jnt = next;
    }
    this.jnt[i] = this.joint;
    const o = i * 4;
    this.nrm[o] = x;
    this.nrm[o + 1] = y;
    this.nrm[o + 2] = z;
    this.nrm[o + 3] = g;
  }
}

/**
 * How finely the round parts are built: 1 is full detail, less is the coarse
 * figure drawn when it is small on screen. Read by the parts as they build.
 */
let detailLevel = 1;

/** A count of segments or stations at the current detail, never under `min`. */
export function detail(n: number, min = 3): number {
  // The far build may go under the usual floors: it is a few pixels across.
  return Math.max(detailLevel < 0.3 ? Math.min(min, 4) : min, Math.round(n * detailLevel));
}

/** Builds at a detail level, then puts the level back. */
export function atDetail<T>(level: number, build: () => T): T {
  const was = detailLevel;
  detailLevel = level;
  try {
    return build();
  } finally {
    detailLevel = was;
  }
}

/** The detail of a figure's coarse build, and of its far build (a few hundred triangles, for crowds far off). */
export const COARSE = 0.45;
export const FAR = 0.12;

/**
 * A builder whose templates carry their coarse build: made the first time it
 * is asked for, at `COARSE` detail, with the full figure's bounds so picking
 * and sizing stay the same.
 */
export function withCoarse(build: () => Template): () => Template {
  return () => {
    const t = build();
    let c: Template | undefined;
    let f: Template | undefined;
    t.coarse = () => {
      if (!c) {
        c = atDetail(COARSE, build);
        c.min = t.min;
        c.max = t.max;
      }
      return c;
    };
    t.far = () => {
      if (!f) {
        f = atDetail(FAR, build);
        f.min = t.min;
        f.max = t.max;
      }
      return f;
    };
    return t;
  };
}

/** The frame every template is built in: forward x, right z, up y. */
export const LOCAL: Frame3 = { o: [0, 0, 0], f: [1, 0, 0], r: [0, 0, 1], u: [0, 1, 0] };

export const WHITE: Rgb = [1, 1, 1];

/** Colours of the parts that are not the team's. */
export const PAINT = {
  metal: [0.2, 0.21, 0.22] as Rgb,
  dark: [0.11, 0.115, 0.12] as Rgb,
  track: [0.13, 0.13, 0.13] as Rgb,
  tyre: [0.1, 0.1, 0.1] as Rgb,
  glass: [0.17, 0.22, 0.27] as Rgb,
  rotor: [0.16, 0.16, 0.17] as Rgb,
  skin: [0.72, 0.6, 0.5] as Rgb,
  deck: [0.42, 0.4, 0.36] as Rgb,
  hullRed: [0.42, 0.14, 0.12] as Rgb,
  light: [0.85, 0.85, 0.8] as Rgb,
};

/** Where a placed figure's position is on the figure. */
export type Anchor = 'ground' | 'centre';

/** What a builder writes into: the team part and the fixed part, both in `LOCAL`. */
export interface Kit {
  team: FigBuffer;
  fixed: FigBuffer;
  fr: Frame3;
  /** The figure's moving parts, in the order they were added (`joint`). */
  joints: Joint[];
}

/**
 * A moving part of a figure, for replay to turn a turret or raise a gun: a
 * turret turns about the vertical through `pivot` (`yaw`), a gun about the
 * horizontal through its trunnion `pivot` (`pitch`), carried round by its
 * turret (`parent`, -1 for a hull or casemate gun).
 */
export interface Joint {
  kind: 'yaw' | 'pitch';
  /** In the template frame (x forward, y up, z right), metres. */
  pivot: Vec3;
  /** The yaw joint a pitch joint rides on, an index into `joints`; -1 for none. */
  parent: number;
  /** The yaw the part was built facing, radians, right (+z) positive: 0 forward, PI aft (a ship's after turret). */
  rest: number;
  /** For a gun: the elevation it was built at, radians, up positive. */
  pitch?: number;
}

/** Adds a moving part to the kit and returns its index (vertices go into it with `into`). */
export function joint(k: Kit, j: Joint): number {
  k.joints.push(j);
  return k.joints.length - 1;
}

/** Writes the next vertices of both parts into joint `j` (an index from `joint`), or back into the hull with -1. */
export function into(k: Kit, j: number): void {
  k.team.joint = j + 1;
  k.fixed.joint = j + 1;
}

/** A built figure, ready to place. */
export interface Template {
  /** Team part: x, y, z, shade, shade, shade, alpha per vertex - the paint's lightness, before light. */
  team: Float32Array;
  /** Fixed part: x, y, z, r, g, b, alpha per vertex, before light. */
  fixed: Float32Array;
  /**
   * Each vertex's normal and gloss (nx, ny, nz, gloss) in the template frame;
   * placing lights the figure with them (`light.ts`). Normal 0, 0, 0 is
   * unlit. Absent, the colours are drawn as they are (shading baked in).
   */
  teamN?: Float32Array;
  fixedN?: Float32Array;
  /** Bounding box in the template frame. */
  min: Vec3;
  max: Vec3;
  anchor: Anchor;
  /** Triangles in all, for budgets. */
  triangles: number;
  /** The moving parts (turrets, guns), and per vertex which one it moves with: 0 the hull, j + 1 joint j. Coarse and far builds have the same joints in the same order. */
  joints?: Joint[];
  teamJ?: Uint8Array;
  fixedJ?: Uint8Array;
  /** The same figure built coarse, for when it is small on screen (`withCoarse`); same bounds. */
  coarse?: () => Template;
  /** Coarser still, for crowds of figures far off (`withCoarse`); same bounds. */
  far?: () => Template;
}

export function newKit(): Kit {
  return { team: new FigBuffer(), fixed: new FigBuffer(), fr: LOCAL, joints: [] };
}

/** Freezes what a kit holds into a template. */
export function finish(k: Kit, anchor: Anchor): Template {
  const team = k.team.data.slice(0, k.team.count * 7);
  const fixed = k.fixed.data.slice(0, k.fixed.count * 7);
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const d of [team, fixed]) {
    for (let o = 0; o < d.length; o += 7) {
      for (let c = 0; c < 3; c++) {
        if (d[o + c] < min[c]) min[c] = d[o + c];
        if (d[o + c] > max[c]) max[c] = d[o + c];
      }
    }
  }
  if (!Number.isFinite(min[0])) {
    min.fill(0);
    max.fill(0);
  }
  const mid: Vec3 = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const teamN = normalsOf(team, k.team.nrm.slice(0, k.team.count * 4), mid);
  const fixedN = normalsOf(fixed, k.fixed.nrm.slice(0, k.fixed.count * 4), mid);
  const t: Template = { team, fixed, teamN, fixedN, min, max, anchor, triangles: (k.team.count + k.fixed.count) / 3 };
  if (k.joints.length) {
    t.joints = k.joints.map((j) => ({ ...j, pivot: [...j.pivot] as Vec3 }));
    t.teamJ = k.team.jnt.slice(0, k.team.count);
    t.fixedJ = k.fixed.jnt.slice(0, k.fixed.count);
  }
  return t;
}

/**
 * Fills the normals a builder left unset with their face's, turned away from
 * `mid` (the figure's middle): flat parts written without one.
 */
function normalsOf(d: Float32Array, n: Float32Array, mid: Vec3): Float32Array {
  const tris = Math.floor(d.length / 21);
  for (let t = 0; t < tris; t++) {
    const v0 = t * 12;
    if (!Number.isNaN(n[v0]) && !Number.isNaN(n[v0 + 4]) && !Number.isNaN(n[v0 + 8])) continue;
    const a = t * 21;
    const b = a + 7;
    const c = a + 14;
    const ux = d[b] - d[a], uy = d[b + 1] - d[a + 1], uz = d[b + 2] - d[a + 2];
    const vx = d[c] - d[a], vy = d[c + 1] - d[a + 1], vz = d[c + 2] - d[a + 2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l;
    ny /= l;
    nz /= l;
    const cx = (d[a] + d[b] + d[c]) / 3 - mid[0];
    const cy = (d[a + 1] + d[b + 1] + d[c + 1]) / 3 - mid[1];
    const cz = (d[a + 2] + d[b + 2] + d[c + 2]) / 3 - mid[2];
    if (nx * cx + ny * cy + nz * cz < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    for (let v = 0; v < 3; v++) {
      const o = v0 + v * 4;
      if (!Number.isNaN(n[o])) continue;
      n[o] = nx;
      n[o + 1] = ny;
      n[o + 2] = nz;
      n[o + 3] = 0;
    }
  }
  return n;
}

/** Builds a template once per key and keeps it. */
export class TemplateCache {
  private readonly built = new Map<string, Template>();

  get(key: string, build: () => Template): Template {
    let t = this.built.get(key);
    if (!t) {
      t = build();
      this.built.set(key, t);
    }
    return t;
  }

  get size(): number {
    return this.built.size;
  }
}

/** A placed figure's pose: where, which way, how big. */
export interface Pose {
  x: number;
  y: number;
  z: number;
  /** Heading, atan2(dx, dz) as in `headingFrame`: 0 looks along +z. */
  yaw: number;
  /** Nose up, radians. */
  pitch?: number;
  /** Right side down, radians. */
  roll?: number;
  /** 1 is true size. */
  scale?: number;
}

/** The frame a pose puts a template in: heading, then pitch about the right axis, then roll about forward. */
export function poseFrame(p: Pose): Frame3 {
  const s = Math.sin(p.yaw);
  const c = Math.cos(p.yaw);
  let f: Vec3 = [s, 0, c];
  let r: Vec3 = [-c, 0, s];
  let u: Vec3 = [0, 1, 0];
  const pitch = p.pitch ?? 0;
  if (pitch) {
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const f2: Vec3 = [f[0] * cp + u[0] * sp, f[1] * cp + u[1] * sp, f[2] * cp + u[2] * sp];
    u = [u[0] * cp - f[0] * sp, u[1] * cp - f[1] * sp, u[2] * cp - f[2] * sp];
    f = f2;
  }
  const roll = p.roll ?? 0;
  if (roll) {
    const cr = Math.cos(roll);
    const sr = Math.sin(roll);
    const r2: Vec3 = [r[0] * cr - u[0] * sr, r[1] * cr - u[1] * sr, r[2] * cr - u[2] * sr];
    u = [u[0] * cr + r[0] * sr, u[1] * cr + r[1] * sr, u[2] * cr + r[2] * sr];
    r = r2;
  }
  return { o: [p.x, p.y, p.z], f, r, u };
}

/**
 * Writes a template into `out` at a pose, the team part in `team`'s colour.
 * `alpha` multiplies every vertex's own, for a figure that fades or a ghost
 * on the tactics board.
 */
export function place(out: VertexBuffer, t: Template, pose: Pose, team: Rgb, alpha = 1): void {
  placeFrame(out, t, poseFrame(pose), pose.scale ?? 1, team, alpha);
}

/** Writes a template into `out` in a frame (forward, up, right at `o`), `k` times its size. */
export function placeFrame(out: VertexBuffer, t: Template, fr: Frame3, k: number, team: Rgb, alpha = 1): void {
  const { o, f, r, u } = fr;
  const put = (d: Float32Array, tint: boolean, n: Float32Array | undefined) => {
    if (n) {
      lit(out, d, n, fr, k, tint ? team : null, alpha);
      return;
    }
    for (let i = 0; i < d.length; i += 7) {
      const a = d[i] * k;
      const b = d[i + 1] * k;
      const c = d[i + 2] * k;
      const x = o[0] + f[0] * a + u[0] * b + r[0] * c;
      const y = o[1] + f[1] * a + u[1] * b + r[1] * c;
      const z = o[2] + f[2] * a + u[2] * b + r[2] * c;
      if (tint) out.vertex(x, y, z, team[0] * d[i + 3], team[1] * d[i + 4], team[2] * d[i + 5], d[i + 6] * alpha);
      else out.vertex(x, y, z, d[i + 3], d[i + 4], d[i + 5], d[i + 6] * alpha);
    }
  };
  put(t.fixed, false, t.fixedN);
  put(t.team, true, t.teamN);
}

/**
 * Writes vertices lit where they are: each normal turned into the world with
 * the frame and its colour (times the team's) shaded there - `shade` in
 * `light.ts`, written out here so placing allocates nothing.
 */
function lit(out: VertexBuffer, d: Float32Array, n: Float32Array, fr: Frame3, k: number, team: Rgb | null, alpha: number): void {
  const { o, f, r, u } = fr;
  const tr = team ? team[0] : 1;
  const tg = team ? team[1] : 1;
  const tb = team ? team[2] : 1;
  // Every constant in a local: module bindings can cost a lookup each time they are read.
  const [sx, sy, sz] = SUN_DIR;
  const [s0, s1, s2] = SUN_COLOR;
  const [h0, h1, h2] = SHEEN_COLOR;
  const sheenBase = SHEEN_BASE;
  const sheenUp = SHEEN_UP;
  const unlit = UNLIT;
  const g0 = AMBIENT + GROUND_COLOR[0], g1 = AMBIENT + GROUND_COLOR[1], g2 = AMBIENT + GROUND_COLOR[2];
  const k0 = SKY_COLOR[0] - GROUND_COLOR[0], k1 = SKY_COLOR[1] - GROUND_COLOR[1], k2 = SKY_COLOR[2] - GROUND_COLOR[2];
  for (let i = 0, j = 0; i < d.length; i += 7, j += 4) {
    const a = d[i] * k;
    const b = d[i + 1] * k;
    const c = d[i + 2] * k;
    const na = n[j];
    const nb = n[j + 1];
    const nc = n[j + 2];
    const br = tr * d[i + 3];
    const bg = tg * d[i + 4];
    const bb = tb * d[i + 5];
    let cr: number, cg: number, cb: number;
    if (na === 0 && nb === 0 && nc === 0) {
      cr = br * unlit;
      cg = bg * unlit;
      cb = bb * unlit;
    } else {
      const wx = f[0] * na + u[0] * nb + r[0] * nc;
      const wy = f[1] * na + u[1] * nb + r[1] * nc;
      const wz = f[2] * na + u[2] * nb + r[2] * nc;
      const dot = wx * sx + wy * sy + wz * sz;
      const sun = dot > 0 ? dot : 0;
      const h = 0.5 + 0.5 * wy;
      const up = wy > 0 ? wy : 0;
      const sheen = n[j + 3] * (sheenBase + sheenUp * up * up);
      cr = br * (g0 + k0 * h + s0 * sun) + sheen * h0;
      cg = bg * (g1 + k1 * h + s1 * sun) + sheen * h1;
      cb = bb * (g2 + k2 * h + s2 * sun) + sheen * h2;
    }
    out.vertex(
      o[0] + f[0] * a + u[0] * b + r[0] * c,
      o[1] + f[1] * a + u[1] * b + r[1] * c,
      o[2] + f[2] * a + u[2] * b + r[2] * c,
      cr < 1 ? cr : 1,
      cg < 1 ? cg : 1,
      cb < 1 ? cb : 1,
      d[i + 6] * alpha,
    );
  }
}

/** The size of a template along each axis: length, height, width. */
export function extent(t: Template): { length: number; height: number; width: number } {
  return { length: t.max[0] - t.min[0], height: t.max[1] - t.min[1], width: t.max[2] - t.min[2] };
}
