/**
 * Small and odd figures the vehicle builders do not make: something ridden
 * astride (a motorcycle, a quad, a snowmobile, a jet ski, a horse), a crewed
 * weapon on the ground (a machine gun, an ATGM tripod, a mortar, a
 * searchlight, a bunker), a quadcopter, an airship, and the generic walker
 * that stands in for every game-invented one. Sizes are the class's general
 * proportions or a named type's published size.
 */

import { finish, newKit, PAINT, type Kit, type Template } from './kit';
import { blob, block, body, fin, plate, ring, tube } from './parts';
import type { Section } from '../race/shapes';
import type { Rgb } from '../race/geometry';
import { wheel } from '../race/shapes';

const grey = (k: number): Rgb => [k, k, k];

export type RideKind = 'motorcycle' | 'sidecar' | 'quad' | 'snowmobile' | 'jetski' | 'kettenkrad' | 'horse';

export interface RideSpec {
  kind: RideKind;
  length: number;
  width: number;
}

/** A rider sitting at (x, 0, seat): legs, body, helmet. */
function rider(k: Kit, x: number, seat: number, side = 0): void {
  for (const s of [-0.16, 0.16]) tube(k.team, k.fr, [x, side + s, seat], [x + 0.35, side + s * 1.4, seat - 0.45], 0.07, 0.06, grey(0.75), 5);
  block(k.team, k.fr, [x - 0.02, side, seat + 0.32], 0.26, 0.4, 0.55, grey(0.92));
  blob(k.fixed, k.fr, [x + 0.02, side, seat + 0.72], [0.11, 0.1, 0.12], PAINT.skin);
  blob(k.team, k.fr, [x, side, seat + 0.79], [0.14, 0.13, 0.08], grey(0.5));
  for (const s of [-0.22, 0.22]) tube(k.team, k.fr, [x, side + s, seat + 0.5], [x + 0.42, side + s * 1.2, seat + 0.25], 0.045, 0.04, grey(0.78), 5);
}

function wheelAt(k: Kit, x: number, side: number, r: number, w: number): void {
  const kfr = { ...k.fr, o: [x, 0, 0] as [number, number, number] };
  wheel(k.fixed, kfr, side, r, r, w, PAINT.tyre, PAINT.metal, side >= 0 ? 1 : -1, 12);
}

export function buildRide(spec: RideSpec): Template {
  const k = newKit();
  const L = spec.length;
  const W = spec.width;
  const half = L / 2;
  switch (spec.kind) {
    case 'motorcycle':
    case 'sidecar': {
      const r = 0.33;
      wheelAt(k, half - r, 0, r, 0.14);
      wheelAt(k, -half + r, 0, r, 0.16);
      tube(k.team, k.fr, [half - r - 0.1, 0, r + 0.55], [-half + r + 0.2, 0, r + 0.3], 0.14, 0.12, grey(0.85), 8);
      tube(k.fixed, k.fr, [half - r, 0, r], [half - r - 0.2, 0, r + 0.75], 0.03, 0.03, PAINT.dark, 4);
      tube(k.fixed, k.fr, [half - r - 0.2, -0.35, r + 0.75], [half - r - 0.2, 0.35, r + 0.75], 0.025, 0.025, PAINT.dark, 4);
      rider(k, -0.1, r + 0.5);
      if (spec.kind === 'sidecar') {
        const s = W / 2 - 0.3;
        body(k.team, k.fr, [{ x: half * 0.6, w: 0.08, h: 0.08, z: 0.55, y: s }, { x: 0.2, w: 0.3, h: 0.25, z: 0.55, y: s }, { x: -half * 0.6, w: 0.28, h: 0.25, z: 0.55, y: s }], grey(0.85), 10, 2.4);
        wheelAt(k, -0.1, s + 0.15, 0.28, 0.12);
        rider(k, -0.35, 0.7, s);
      }
      break;
    }
    case 'quad': {
      const r = 0.3;
      for (const x of [half - r - 0.05, -half + r + 0.05]) for (const s of [-1, 1]) wheelAt(k, x, s * (W / 2 - 0.12), r, 0.24);
      block(k.team, k.fr, [0, 0, r + 0.3], L * 0.75, W * 0.55, 0.35, grey(0.86));
      tube(k.fixed, k.fr, [half * 0.45, -0.35, r + 0.75], [half * 0.45, 0.35, r + 0.75], 0.025, 0.025, PAINT.dark, 4);
      rider(k, -0.15, r + 0.55);
      break;
    }
    case 'snowmobile': {
      for (const s of [-1, 1]) block(k.fixed, k.fr, [half - 0.45, s * (W / 2 - 0.1), 0.05], 0.9, 0.12, 0.08, PAINT.dark);
      block(k.fixed, k.fr, [-half * 0.35, 0, 0.25], L * 0.55, W * 0.45, 0.4, PAINT.track);
      body(k.team, k.fr, [{ x: half, w: 0.15, h: 0.12, z: 0.45 }, { x: half * 0.4, w: W * 0.4, h: 0.3, z: 0.55 }, { x: -half, w: W * 0.3, h: 0.2, z: 0.55 }], grey(0.86), 10, 2.6);
      rider(k, -0.2, 0.75);
      break;
    }
    case 'jetski': {
      body(k.team, k.fr, [{ x: half, w: 0.05, h: 0.12, z: 0.35 }, { x: half * 0.4, w: W * 0.45, h: 0.3, z: 0.3 }, { x: -half, w: W * 0.42, h: 0.25, z: 0.25 }], grey(0.88), 10, 3);
      rider(k, -0.25, 0.65);
      break;
    }
    case 'kettenkrad': {
      // A motorcycle front wheel and a tracked body behind it.
      wheelAt(k, half - 0.3, 0, 0.3, 0.12);
      for (const s of [-1, 1]) block(k.fixed, k.fr, [-half * 0.3, s * (W / 2 - 0.15), 0.3], L * 0.62, 0.25, 0.55, PAINT.track);
      block(k.team, k.fr, [-half * 0.25, 0, 0.75], L * 0.62, W * 0.55, 0.4, grey(0.86));
      rider(k, 0.1, 0.95);
      break;
    }
    case 'horse': {
      // A horse's body, neck and head forward, four legs, a rider in the saddle.
      body(k.team, k.fr, [{ x: 0.75, w: 0.18, h: 0.25, z: 1.25 }, { x: 0.35, w: 0.26, h: 0.33, z: 1.2 }, { x: -0.55, w: 0.26, h: 0.32, z: 1.22 }, { x: -0.85, w: 0.12, h: 0.18, z: 1.25 }], grey(0.7), 10, 2.2);
      tube(k.team, k.fr, [0.65, 0, 1.35], [1.0, 0, 1.75], 0.13, 0.1, grey(0.68), 8);
      body(k.team, k.fr, [{ x: 1.25, w: 0.07, h: 0.08, z: 1.68 }, { x: 0.95, w: 0.1, h: 0.13, z: 1.8 }], grey(0.66), 8, 2.2);
      for (const x of [0.55, -0.6]) for (const s of [-0.13, 0.13]) tube(k.team, k.fr, [x, s, 1.0], [x + 0.03, s, 0], 0.06, 0.04, grey(0.62), 5);
      rider(k, -0.05, 1.5);
      break;
    }
  }
  return finish(k, 'ground');
}

export type EmplacementKind = 'mg' | 'atgm' | 'mortar' | 'searchlight' | 'bunker' | 'sandbags' | 'manpad' | 'tower' | 'tent';

export interface EmplacementSpec {
  kind: EmplacementKind;
  /** Footprint size, metres (bunkers, towers, tents). */
  length?: number;
  width?: number;
  height?: number;
}

/** A crewed weapon on the ground, or a fieldwork. */
export function buildEmplacement(spec: EmplacementSpec): Template {
  const k = newKit();
  const L = spec.length ?? 1.6;
  const W = spec.width ?? L;
  const H = spec.height ?? 1.0;
  const tripod = (x: number, up: number) => {
    for (const [dx, s] of [[0.45, 0], [-0.3, 0.38], [-0.3, -0.38]]) tube(k.fixed, k.fr, [x, 0, up], [x + dx, s, 0], 0.025, 0.025, PAINT.dark, 4);
  };
  switch (spec.kind) {
    case 'mg':
      tripod(0, 0.6);
      tube(k.fixed, k.fr, [-0.45, 0, 0.65], [0.95, 0, 0.65], 0.06, 0.04, PAINT.dark, 6);
      block(k.team, k.fr, [-0.2, 0, 0.65], 0.45, 0.18, 0.2, grey(0.8));
      sandbags(k, 1.3, 0.55);
      break;
    case 'atgm':
      tripod(0, 0.75);
      tube(k.team, k.fr, [-0.6, 0, 0.85], [0.75, 0, 0.85], 0.12, 0.12, grey(0.82), 10);
      block(k.fixed, k.fr, [-0.1, 0.22, 0.85], 0.35, 0.2, 0.25, PAINT.dark);
      break;
    case 'mortar':
      block(k.fixed, k.fr, [-0.25, 0, 0.04], 0.5, 0.5, 0.08, PAINT.dark);
      tube(k.team, k.fr, [-0.25, 0, 0.08], [0.25, 0, 0.95], 0.06, 0.055, grey(0.75), 8);
      for (const s of [-0.25, 0.25]) tube(k.fixed, k.fr, [0.35, s, 0], [0.12, 0, 0.6], 0.02, 0.02, PAINT.dark, 4);
      break;
    case 'searchlight':
      tube(k.fixed, k.fr, [0, 0, 0], [0, 0, 1.0], 0.12, 0.1, PAINT.dark, 6);
      tube(k.team, k.fr, [-0.4, 0, 1.4], [0.4, 0, 1.6], 0.75, 0.75, grey(0.8), 14);
      ring(k.fixed, { o: [0, 0, 0], f: [0, 1, 0], r: [0, 0, 1], u: [1, 0, 0] }, 1.6, 0, 0.42, 0.6, PAINT.light, 1, 14);
      for (const s of [-0.9, 0.9]) block(k.fixed, k.fr, [0, s, 0.05], 2.0, 0.2, 0.1, PAINT.dark);
      break;
    case 'bunker':
      // A low concrete block with a firing slit.
      block(k.team, k.fr, [0, 0, H / 2], L, W, H, grey(0.78));
      block(k.team, k.fr, [0, 0, H + 0.15], L * 1.05, W * 1.05, 0.3, grey(0.7));
      block(k.fixed, k.fr, [L / 2 + 0.01, 0, H * 0.7], 0.04, W * 0.6, 0.18, PAINT.dark);
      break;
    case 'sandbags':
      sandbags(k, L / 2, H);
      break;
    case 'manpad':
      // A soldier kneeling with a launcher on the shoulder.
      block(k.team, k.fr, [0, 0, 0.6], 0.3, 0.42, 0.6, grey(0.9));
      blob(k.fixed, k.fr, [0.02, 0, 1.05], [0.11, 0.1, 0.12], PAINT.skin);
      blob(k.team, k.fr, [0, 0, 1.12], [0.15, 0.14, 0.09], grey(0.5));
      tube(k.fixed, k.fr, [-0.7, 0.18, 0.98], [0.8, 0.18, 1.1], 0.06, 0.06, PAINT.metal, 8);
      for (const s of [-0.12, 0.12]) block(k.team, k.fr, [0.15, s, 0.15], 0.45, 0.14, 0.3, grey(0.75));
      break;
    case 'tower': {
      // A watch tower on four legs with a hut on top.
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) tube(k.fixed, k.fr, [a * L * 0.45, b * W * 0.45, 0], [a * L * 0.35, b * W * 0.35, H - 2.2], 0.1, 0.08, PAINT.metal, 4);
      block(k.team, k.fr, [0, 0, H - 1.6], L * 0.85, W * 0.85, 1.2, grey(0.82));
      fin(k.team, k.fr, [[-L * 0.5, H - 1.0], [L * 0.5, H - 1.0], [0, H]], 0, W, grey(0.7));
      break;
    }
    case 'tent':
      fin(k.team, k.fr, [[-L / 2, 0], [L / 2, 0], [L / 2, H * 0.7], [0, H], [-L / 2, H * 0.7]], 0, W, grey(0.75));
      break;
  }
  return finish(k, 'ground');
}

/** A ring of sandbags round the middle, `radius` out and `h` high. */
function sandbags(k: Kit, radius: number, h: number): void {
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 1.6 - Math.PI * 0.8;
    blob(k.team, k.fr, [Math.cos(a) * radius, Math.sin(a) * radius, h * 0.4], [0.32, 0.22, h * 0.42], grey(0.66), 1, 4, 8);
  }
}

export interface DroneSpec {
  /** Rotors on a multicopter. */
  rotors: number;
  /** Tip to tip, metres. */
  span: number;
}

/** A multicopter: a small body, its arms and a rotor disc at each end. */
export function buildDrone(spec: DroneSpec): Template {
  const k = newKit();
  const r = spec.span / 2;
  const prop = (r * 2 * Math.PI) / spec.rotors / 2.4;
  blob(k.team, k.fr, [0, 0, 0], [r * 0.3, r * 0.3, r * 0.15], grey(0.88));
  blob(k.fixed, k.fr, [r * 0.22, 0, -r * 0.12], [r * 0.1, r * 0.1, r * 0.1], PAINT.dark, 1, 4, 8);
  for (let i = 0; i < spec.rotors; i++) {
    const a = ((i + 0.5) / spec.rotors) * Math.PI * 2;
    const x = Math.cos(a) * r * 0.8;
    const s = Math.sin(a) * r * 0.8;
    tube(k.team, k.fr, [0, 0, 0], [x, s, r * 0.05], r * 0.04, r * 0.035, grey(0.8), 5);
    ring(k.fixed, k.fr, x, s, r * 0.1, prop, PAINT.rotor, 0.4, 16);
  }
  return finish(k, 'centre');
}

export interface AirshipSpec {
  length: number;
  diameter: number;
  /** A rigid airship's long gondolas, or a blimp's one small car. */
  gondolas?: number;
  /** A barrage balloon: short and fat, three fins, on its cable. */
  balloon?: boolean;
}

/** An airship or barrage balloon: the envelope, its tail fins, gondolas under it. */
export function buildAirship(spec: AirshipSpec): Template {
  const k = newKit();
  const L = spec.length;
  const r = spec.diameter / 2;
  const half = L / 2;
  const S = (x: number, w: number): Section => ({ x, w: Math.max(0.05, w), h: Math.max(0.05, w), z: 0 });
  body(k.team, k.fr, [S(half, r * 0.05), S(half - L * 0.06, r * 0.7), S(half - L * 0.2, r), S(-half + L * 0.35, r), S(-half + L * 0.08, r * 0.45), S(-half, r * 0.05)], grey(0.9), 14, 2);
  const finL = L * (spec.balloon ? 0.3 : 0.14);
  const finS = r * (spec.balloon ? 0.9 : 0.85);
  const fins = spec.balloon ? [Math.PI / 2, Math.PI * (7 / 6), Math.PI * (11 / 6)] : [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
  for (const a of fins) {
    const ds = Math.cos(a);
    const du = Math.sin(a);
    const x0 = -half + L * 0.04;
    const p = (x: number, rad: number): [number, number, number] => [x, ds * rad, du * rad];
    k.team.quad(p(x0 + finL, r * 0.5), p(x0, r * 0.3), p(x0, r * 0.3 + finS), p(x0 + finL * 0.45, r * 0.4 + finS), grey(0.78));
    k.team.quad(p(x0 + finL * 0.45, r * 0.4 + finS), p(x0, r * 0.3 + finS), p(x0, r * 0.3), p(x0 + finL, r * 0.5), grey(0.7));
  }
  const g = spec.gondolas ?? (spec.balloon ? 0 : 1);
  for (let i = 0; i < g; i++) {
    const x = g === 1 ? L * 0.1 : half - L * 0.25 - (i * L * 0.45) / Math.max(1, g - 1);
    block(k.team, k.fr, [x, 0, -r - L * 0.012], Math.max(2, L * 0.07), Math.max(1, r * 0.25), Math.max(1, L * 0.012), grey(0.8));
  }
  return finish(k, 'centre');
}

/** The generic walker that stands for every game-invented one: a pod on two legs. Never a likeness of any game's design. */
export function buildWalker(height = 8): Template {
  const k = newKit();
  const hip = height * 0.55;
  blob(k.team, k.fr, [0, 0, hip + height * 0.12], [height * 0.28, height * 0.25, height * 0.16], grey(0.88));
  plate(k.fixed, k.fr, [[height * 0.3, -height * 0.12], [height * 0.2, -height * 0.12], [height * 0.2, height * 0.12], [height * 0.3, height * 0.12]], hip + height * 0.16, height * 0.08, PAINT.glass);
  for (const s of [-1, 1]) {
    const side = s * height * 0.2;
    tube(k.team, k.fr, [0, side, hip], [height * 0.15, side * 1.2, hip * 0.5], height * 0.05, height * 0.045, grey(0.75), 6);
    tube(k.team, k.fr, [height * 0.15, side * 1.2, hip * 0.5], [-height * 0.02, side * 1.25, 0.2], height * 0.045, height * 0.04, grey(0.72), 6);
    block(k.fixed, k.fr, [0, side * 1.25, 0.1], height * 0.18, height * 0.1, 0.2, PAINT.dark);
    tube(k.fixed, k.fr, [0, s * height * 0.3, hip + height * 0.1], [height * 0.45, s * height * 0.3, hip + height * 0.1], height * 0.03, height * 0.03, PAINT.metal, 6);
  }
  return finish(k, 'ground');
}
