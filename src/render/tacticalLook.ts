/**
 * The tactical display: the replay redrawn as a debrief telemetry screen.
 * What the engine needs to draw it, as pure functions:
 *
 * - `postDrawFor` - the screen pass's weights (`post/tacticalPost.ts`) from the
 *   viewer's settings and the scene's scale;
 * - `tacticalLevel` - the level dimmed and drained of colour, structures as
 *   wireframes, so the screen pass can turn it into the display's monochrome;
 * - `tacticalLines` - range rings round the followed unit and an altitude
 *   ladder under each flying one, as line pairs in the trail format.
 */

import type { LevelDraw, PostDraw } from './types';

export type LookQuality = 'low' | 'medium' | 'high';
export type LookColour = 'cyan' | 'amber' | 'green';
export const LOOK_QUALITIES: LookQuality[] = ['low', 'medium', 'high'];
export const LOOK_COLOURS: LookColour[] = ['cyan', 'amber', 'green'];

export interface TacticalLook {
  on: boolean;
  quality: LookQuality;
  colour: LookColour;
  bloom: boolean;
  contours: boolean;
  grid: boolean;
  edges: boolean;
  scan: boolean;
  rings: boolean;
  ladders: boolean;
  panels: boolean;
  director: boolean;
}

export const DEFAULT_LOOK: TacticalLook = {
  on: false,
  quality: 'medium',
  colour: 'cyan',
  bloom: true,
  contours: true,
  grid: true,
  edges: true,
  scan: true,
  rings: true,
  ladders: true,
  panels: true,
  director: false,
};

/** A saved look, each field checked; what is missing or wrong is the default. */
export function readLook(v: unknown): TacticalLook {
  const out = { ...DEFAULT_LOOK };
  if (!v || typeof v !== 'object') return out;
  const o = v as Record<string, unknown>;
  for (const k of Object.keys(DEFAULT_LOOK) as Array<keyof TacticalLook>) {
    if (typeof DEFAULT_LOOK[k] === 'boolean' && typeof o[k] === 'boolean') (out as unknown as Record<string, unknown>)[k] = o[k];
  }
  if (LOOK_QUALITIES.includes(o.quality as LookQuality)) out.quality = o.quality as LookQuality;
  if (LOOK_COLOURS.includes(o.colour as LookColour)) out.colour = o.colour as LookColour;
  return out;
}

export const LOOK_TINT: Record<LookColour, [number, number, number]> = {
  cyan: [0.25, 0.85, 1.0],
  amber: [1.0, 0.68, 0.22],
  green: [0.35, 1.0, 0.55],
};

/** 1, 2 or 5 times a power of ten, the nearest at or above `x`. */
export function niceStep(x: number): number {
  if (!(x > 0) || !Number.isFinite(x)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  const m = x / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

/** The scene's scale in world units: its horizontal extent and its height range. */
export interface LookScene {
  extent: number;
  heightRange: number;
  unitsPerMetre: number;
}

export function postDrawFor(look: TacticalLook, scene: LookScene, time: number, flash: number): PostDraw {
  const q = look.quality === 'high' ? 2 : look.quality === 'medium' ? 1 : 0;
  const m = Math.max(1e-6, scene.unitsPerMetre);
  const extent = Math.max(scene.extent, 50 * m);
  return {
    quality: q,
    bloom: look.bloom && q > 0 ? (q === 2 ? 1.15 : 0.95) : 0,
    edges: look.edges ? 0.9 : 0,
    contours: look.contours ? 1 : 0,
    grid: look.grid ? 1 : 0,
    scanlines: look.scan ? 1 : 0,
    chroma: look.scan ? 1 : 0,
    vignette: 0.8,
    noise: look.scan && q > 0 ? 1 : 0,
    terrain: 0.85,
    tint: LOOK_TINT[look.colour],
    // Some fifteen contours over the relief, never closer than a metre.
    contourSpacing: niceStep(Math.max(scene.heightRange / 15, m)),
    // Some forty grid lines across, a major line every ten.
    gridSpacing: niceStep(extent / 40),
    fogNear: extent * 0.7,
    fogFar: extent * 2.5,
    time,
    flash: Math.max(0, Math.min(1, flash)),
  };
}

/** The level as the display wants it under the screen pass: dark, colourless, structures as wires. */
export function tacticalLevel(draw: LevelDraw | null): LevelDraw | null {
  if (!draw) return null;
  return {
    ...draw,
    brightness: draw.brightness * 0.55,
    desaturate: 1,
    groundWireOpacity: Math.max(draw.groundWireOpacity, 0.06),
    structure: {
      ...draw.structure,
      faceOpacity: Math.min(draw.structure.faceOpacity, 0.55),
      showWire: true,
      wireOpacity: Math.max(draw.structure.wireOpacity, 0.55),
    },
  };
}

/** A live unit for the rings and ladders: data coordinates and its colour. */
export interface LookTrack {
  x: number;
  y: number;
  z: number;
  colour: ArrayLike<number>;
  air: boolean;
  /** Squared distance to the camera, for keeping the nearest when there are many. */
  near: number;
}

const STRIDE = 7;
const RING_SEGMENTS = 96;

/** How many units get a ladder, by quality. */
export function ladderBudget(quality: LookQuality): number {
  return quality === 'high' ? 64 : quality === 'medium' ? 24 : 8;
}

/**
 * Range rings and altitude ladders, appended to `base` (line pairs, seven
 * floats a vertex: xyz rgba). `follow` is the unit the rings are centred on,
 * `floor` the ground height the ladders stand on, `extent` the scene's size.
 */
export function tacticalLines(
  tracks: LookTrack[],
  follow: LookTrack | null,
  opts: { floor: number; extent: number; unitsPerMetre: number; rings: boolean; ladders: boolean; quality: LookQuality; tint: readonly number[] },
  base: Float32Array | null,
  baseCount: number,
  scratch: { buf: Float32Array },
): { data: Float32Array; count: number } {
  const tint = opts.tint;
  // Ladders: the nearest flying units first.
  const air = opts.ladders ? tracks.filter((t) => t.air && t.y - opts.floor > 0) : [];
  if (air.length > ladderBudget(opts.quality)) {
    air.sort((a, b) => a.near - b.near);
    air.length = ladderBudget(opts.quality);
  }
  let top = 0;
  for (const t of air) top = Math.max(top, t.y - opts.floor);
  const step = niceStep(Math.max(top / 8, 10 * opts.unitsPerMetre));
  const ringStep = niceStep(opts.extent / 10);
  let need = baseCount;
  for (const t of air) need += 2 + 4 * Math.floor((t.y - opts.floor) / step) + 2 * 24;
  if (opts.rings && follow) need += 4 * (RING_SEGMENTS * 2 + 24) + 2;
  if (scratch.buf.length < need * STRIDE) scratch.buf = new Float32Array(need * STRIDE * 2);
  const out = scratch.buf;
  if (base && baseCount) out.set(base.subarray(0, baseCount * STRIDE));
  let o = baseCount * STRIDE;
  const v = (x: number, y: number, z: number, r: number, g: number, b: number, a: number) => {
    out[o++] = x;
    out[o++] = y;
    out[o++] = z;
    out[o++] = r;
    out[o++] = g;
    out[o++] = b;
    out[o++] = a;
  };
  const seg = (ax: number, ay: number, az: number, bx: number, by: number, bz: number, c: readonly number[], a: number) => {
    v(ax, ay, az, c[0], c[1], c[2], a);
    v(bx, by, bz, c[0], c[1], c[2], a);
  };
  const circle = (cx: number, cy: number, cz: number, r: number, n: number, c: readonly number[], a: number) => {
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      seg(cx + Math.cos(a0) * r, cy, cz + Math.sin(a0) * r, cx + Math.cos(a1) * r, cy, cz + Math.sin(a1) * r, c, a);
    }
  };
  for (const t of air) {
    const c = [0.5 * (t.colour[0] + tint[0]), 0.5 * (t.colour[1] + tint[1]), 0.5 * (t.colour[2] + tint[2])];
    seg(t.x, opts.floor, t.z, t.x, t.y, t.z, c, 0.45);
    const ticks = Math.floor((t.y - opts.floor) / step);
    for (let k = 1; k <= ticks; k++) {
      const y = opts.floor + k * step;
      const w = (k % 5 === 0 ? 0.35 : 0.15) * step;
      seg(t.x - w, y, t.z, t.x + w, y, t.z, c, 0.55);
      seg(t.x, y, t.z - w, t.x, y, t.z + w, c, 0.55);
    }
    circle(t.x, opts.floor, t.z, step * 0.3, 24, c, 0.5);
  }
  if (opts.rings && follow) {
    for (let k = 1; k <= 4; k++) {
      const r = ringStep * k;
      circle(follow.x, follow.y, follow.z, r, RING_SEGMENTS, tint, k === 4 ? 0.5 : 0.3);
      // Bearing ticks every 30 degrees on each ring.
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const inner = r * (i % 3 === 0 ? 0.9 : 0.95);
        seg(follow.x + Math.cos(a) * inner, follow.y, follow.z + Math.sin(a) * inner, follow.x + Math.cos(a) * r, follow.y, follow.z + Math.sin(a) * r, tint, 0.45);
      }
    }
    // North: the compass zero, yaw 0 forward (0, 0, -1).
    seg(follow.x, follow.y, follow.z, follow.x, follow.y, follow.z - ringStep * 4.3, tint, 0.6);
  }
  return { data: out, count: o / STRIDE };
}
