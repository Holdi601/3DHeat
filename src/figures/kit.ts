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

/** The frame every template is built in: forward x, right z, up y. */
export const LOCAL: Frame3 = { o: [0, 0, 0], f: [1, 0, 0], r: [0, 0, 1], u: [0, 1, 0] };

export const WHITE: Rgb = [1, 1, 1];

/** Colours of the parts that are not the team's. */
export const PAINT = {
  metal: [0.2, 0.21, 0.22] as Rgb,
  dark: [0.11, 0.115, 0.12] as Rgb,
  track: [0.13, 0.13, 0.13] as Rgb,
  tyre: [0.1, 0.1, 0.1] as Rgb,
  glass: [0.32, 0.46, 0.56] as Rgb,
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
  team: VertexBuffer;
  fixed: VertexBuffer;
  fr: Frame3;
}

/** A built figure, ready to place. */
export interface Template {
  /** Team part: x, y, z, shade, shade, shade, alpha per vertex. */
  team: Float32Array;
  /** Fixed part: x, y, z, r, g, b, alpha per vertex. */
  fixed: Float32Array;
  /** Bounding box in the template frame. */
  min: Vec3;
  max: Vec3;
  anchor: Anchor;
  /** Triangles in all, for budgets. */
  triangles: number;
}

export function newKit(): Kit {
  return { team: new VertexBuffer(), fixed: new VertexBuffer(), fr: LOCAL };
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
  return { team, fixed, min, max, anchor, triangles: (k.team.count + k.fixed.count) / 3 };
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
  const fr = poseFrame(pose);
  const k = pose.scale ?? 1;
  const { o, f, r, u } = fr;
  const put = (d: Float32Array, tint: boolean) => {
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
  put(t.fixed, false);
  put(t.team, true);
}

/** The size of a template along each axis: length, height, width. */
export function extent(t: Template): { length: number; height: number; width: number } {
  return { length: t.max[0] - t.min[0], height: t.max[1] - t.min[1], width: t.max[2] - t.min[2] };
}
