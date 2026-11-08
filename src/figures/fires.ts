/**
 * Fires on units in box replay: flames and a column of smoke where the data
 * says a part of a unit burns (`data/fires.ts`), from the moment it caught
 * fire until it is out, carried with the unit as it moves - a wreck's too,
 * for as long as the data says it burns. Up close a flame (two tapering
 * tongues that flicker) and puffs of smoke rising and spreading; far off a
 * small glow kept a few pixels big, as the figures are.
 *
 * Where it burns: the point the data gives, in the unit's own frame (forward,
 * up, right); where it gives none, a tank's engine deck at the rear, an
 * aircraft's engine, a ship's deck. The data does not say which part a
 * point is, so a fire in a turret stays where it was lit on the hull.
 *
 * Built on the CPU into the scene's triangles (both backends draw them), for
 * the fires burning at the playhead only, at most `MAX_FIRES` a frame and
 * `MAX_NEAR` of them in detail; nothing is allocated per frame but the
 * triangle buffer's own growth.
 */

import type { VertexBuffer } from '../race/geometry';
import { burningAt, FireBody, type Fires } from '../data/fires';

/** Fires drawn a frame at most, and how many of those in detail (the rest as glows). */
export const MAX_FIRES = 4096;
export const MAX_NEAR = 512;
/** Below this many pixels tall a fire is a glow. */
export const GLOW_PX = 8;
/** A glow's least size on screen, px. */
export const GLOW_MIN_PX = 5;
/** Smoke puffs a fire. */
const PUFFS = 4;

/** Where a fire with no place of its own burns (forward, up, right; metres), and how tall its flame is (m), by body. */
export const DEFAULT_PLACE: Record<FireBody, [number, number, number]> = {
  [FireBody.Ground]: [-2.2, 1.4, 0],
  [FireBody.Air]: [-1.5, 0, 0],
  [FireBody.Ship]: [0, 5, 0],
};
export const FLAME_M: Record<FireBody, number> = { [FireBody.Ground]: 3, [FireBody.Air]: 3, [FireBody.Ship]: 7 };

/** A unit's place and attitude: position, forward and up (unit, square), in data space. */
export interface FirePose {
  x: number;
  y: number;
  z: number;
  f: [number, number, number];
  u: [number, number, number];
  /** Times true size the unit's figure is drawn (kept a few pixels big far off): the fire sits on it as drawn. */
  scale: number;
}

export interface FireView {
  t: number;
  eye: ArrayLike<number>;
  /** Data units one pixel covers at a point. */
  pixelSize: (x: number, y: number, z: number) => number;
  /** Data units in a metre. */
  units: number;
  /** A person's pose at `t` into `out` (`body` what burns: aircraft take their pitch); false when it is not drawn now. */
  poseOf: (person: number, body: FireBody, out: FirePose) => boolean;
}

// Above 1: the scene's triangles are shaded, and a flame gives light rather than takes it.
const OUTER: [number, number, number] = [1.7, 0.62, 0.08];
const INNER: [number, number, number] = [1.8, 1.35, 0.5];
const SMOKE: [number, number, number] = [0.17, 0.16, 0.15];
const GLOW: [number, number, number] = [1.8, 0.85, 0.15];

/** Unit circle for a puff, six triangles round. */
const RING = Array.from({ length: 7 }, (_, i) => [Math.cos((i * Math.PI) / 3), Math.sin((i * Math.PI) / 3)]);

export class FireLayer {
  private readonly pose: FirePose = { x: 0, y: 0, z: 0, f: [1, 0, 0], u: [0, 1, 0], scale: 1 };
  /** Drawn last frame: in detail, as glows. */
  near = 0;
  far = 0;
  // The frame's scratch: the fire's point, the billboard's right and up.
  private px = 0;
  private py = 0;
  private pz = 0;
  private bx = 1;
  private bz = 0;
  private ux = 0;
  private uy = 1;
  private uz = 0;
  private out: VertexBuffer | null = null;

  /** Appends every fire burning at `v.t` to `out`; returns how many were drawn. */
  build(f: Fires, v: FireView, out: VertexBuffer): number {
    this.near = 0;
    this.far = 0;
    if (!f.count) return 0;
    this.out = out;
    return burningAt(f, v.t, MAX_FIRES, (k) => this.one(f, k, v));
  }

  private one(f: Fires, k: number, v: FireView): boolean {
    const p = this.pose;
    const body = f.body[k] as FireBody;
    p.scale = 1;
    if (!v.poseOf(f.person[k], body, p)) return false;
    let a = f.local[k * 3];
    let b = f.local[k * 3 + 1];
    let c = f.local[k * 3 + 2];
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) [a, b, c] = DEFAULT_PLACE[body];
    const m = v.units * (p.scale > 0 ? p.scale : 1);
    // Right = forward x up (`figures/kit.ts` poseFrame).
    const fx = p.f[0], fy = p.f[1], fz = p.f[2];
    const ux = p.u[0], uy = p.u[1], uz = p.u[2];
    const rx = fy * uz - fz * uy, ry = fz * ux - fx * uz, rz = fx * uy - fy * ux;
    this.px = p.x + (fx * a + ux * b + rx * c) * m;
    this.py = p.y + (fy * a + uy * b + ry * c) * m;
    this.pz = p.z + (fz * a + uz * b + rz * c) * m;
    // A billboard turned to the eye about the vertical: right is level, across the line of sight.
    let dx = this.px - v.eye[0];
    let dy = this.py - v.eye[1];
    let dz = this.pz - v.eye[2];
    const dl = Math.hypot(dx, dy, dz) || 1;
    dx /= dl;
    dy /= dl;
    dz /= dl;
    const hl = Math.hypot(dx, dz);
    this.bx = hl > 1e-6 ? -dz / hl : 1;
    this.bz = hl > 1e-6 ? dx / hl : 0;
    // The puffs' up: across the line of sight too (they face the eye from above as well).
    this.ux = -this.bz * dy;
    this.uy = this.bz * dx - this.bx * dz;
    this.uz = this.bx * dy;
    const ul = Math.hypot(this.ux, this.uy, this.uz) || 1;
    this.ux /= ul;
    this.uy /= ul;
    this.uz /= ul;
    if (this.uy < 0) {
      this.ux = -this.ux;
      this.uy = -this.uy;
      this.uz = -this.uz;
    }
    const H = FLAME_M[body] * m;
    const trueH = FLAME_M[body] * v.units;
    const ps = v.pixelSize(this.px, this.py, this.pz);
    const seed = (k * 0.6180339887) % 1;
    // Small on screen at true size: a glow on the figure as drawn.
    if (this.near >= MAX_NEAR || (ps > 0 && trueH / ps < GLOW_PX)) {
      const s = Math.max(trueH * 0.35, GLOW_MIN_PX * ps * 0.5);
      const flick = 0.85 + 0.15 * Math.sin(v.t * 9 + seed * 40);
      // Lifted half a flame (the figure's drawn size) above the point: over the deck of a figure kept big far off.
      this.square(Math.max(s * 0.6, H * 0.5), s * flick, GLOW, 0.95);
      this.far++;
      return true;
    }
    // The flame: two tongues, the inner hotter, flickering out of step.
    const w1 = 0.85 + 0.15 * Math.sin(v.t * 11 + seed * 31);
    const w2 = 0.8 + 0.2 * Math.sin(v.t * 15 + seed * 17);
    this.tongue(H * 0.55, H * w1, OUTER, 0.85);
    this.tongue(H * 0.3, H * 0.62 * w2, INNER, 0.95);
    // The smoke: puffs rising from it and spreading, fading as they go.
    for (let i = 0; i < PUFFS; i++) {
      const ph = (v.t * 0.22 + i / PUFFS + seed) % 1;
      const r = H * (0.35 + 1.3 * ph);
      const up = H * (0.7 + 5.5 * ph);
      const drift = H * 1.2 * ph;
      this.puff(up, drift, r, SMOKE, 0.55 * (1 - ph) * Math.min(1, ph * 6));
    }
    this.near++;
    return true;
  }

  /** A flame's tongue: wide at its foot, pointed at its tip, upright. */
  private tongue(w: number, h: number, col: [number, number, number], alpha: number): void {
    const o = this.out!;
    const x = this.px, y = this.py, z = this.pz;
    const hw = w / 2;
    const bx = this.bx * hw, bz = this.bz * hw;
    const mid = h * 0.4;
    // Foot left, foot right, waist left, waist right, tip.
    const r = col[0], g = col[1], b = col[2];
    o.vertex(x - bx * 0.7, y, z - bz * 0.7, r, g, b, alpha);
    o.vertex(x + bx * 0.7, y, z + bz * 0.7, r, g, b, alpha);
    o.vertex(x + bx, y + mid, z + bz, r, g, b, alpha);
    o.vertex(x - bx * 0.7, y, z - bz * 0.7, r, g, b, alpha);
    o.vertex(x + bx, y + mid, z + bz, r, g, b, alpha);
    o.vertex(x - bx, y + mid, z - bz, r, g, b, alpha);
    o.vertex(x - bx, y + mid, z - bz, r, g, b, alpha);
    o.vertex(x + bx, y + mid, z + bz, r, g, b, alpha);
    o.vertex(x, y + h, z, r, g, b, alpha * 0.6);
  }

  /** A square facing the eye, centred `lift` above the fire. */
  private square(lift: number, s: number, col: [number, number, number], alpha: number): void {
    const o = this.out!;
    const cx = this.px + this.ux * lift, cy = this.py + this.uy * lift, cz = this.pz + this.uz * lift;
    const bx = this.bx * s, bz = this.bz * s;
    const ux = this.ux * s, uy = this.uy * s, uz = this.uz * s;
    const [r, g, b] = col;
    o.vertex(cx - bx - ux, cy - uy, cz - bz - uz, r, g, b, alpha);
    o.vertex(cx + bx - ux, cy - uy, cz + bz - uz, r, g, b, alpha);
    o.vertex(cx + bx + ux, cy + uy, cz + bz + uz, r, g, b, alpha);
    o.vertex(cx - bx - ux, cy - uy, cz - bz - uz, r, g, b, alpha);
    o.vertex(cx + bx + ux, cy + uy, cz + bz + uz, r, g, b, alpha);
    o.vertex(cx - bx + ux, cy + uy, cz - bz + uz, r, g, b, alpha);
  }

  /** A round puff facing the eye, `up` above the fire and drifted `drift` along the level right. */
  private puff(up: number, drift: number, rad: number, col: [number, number, number], alpha: number): void {
    if (alpha <= 0.01) return;
    const o = this.out!;
    const cx = this.px + this.bx * drift, cy = this.py + up, cz = this.pz + this.bz * drift;
    const [r, g, b] = col;
    for (let i = 0; i < 6; i++) {
      const c0 = RING[i], c1 = RING[i + 1];
      o.vertex(cx, cy, cz, r, g, b, alpha);
      o.vertex(cx + (this.bx * c0[0] + this.ux * c0[1]) * rad, cy + this.uy * c0[1] * rad, cz + (this.bz * c0[0] + this.uz * c0[1]) * rad, r, g, b, alpha * 0.4);
      o.vertex(cx + (this.bx * c1[0] + this.ux * c1[1]) * rad, cy + this.uy * c1[1] * rad, cz + (this.bz * c1[0] + this.uz * c1[1]) * rad, r, g, b, alpha * 0.4);
    }
  }
}
