/**
 * Gadgets of close-quarters games: what a player throws, places or fixes to a
 * wall - a throwable two-wheeled drone, cameras, barbed wire, a deployable
 * shield, wall reinforcement, a wooden barricade, breaching charges, traps
 * and mines, a one-way window, an armour panel across a door, grenades and gas
 * canisters, jammers and sensors, the defuser. Generic shapes of the viewer's
 * own, at the true size of the real-world thing each stands for (a claymore's
 * published 22 by 8 cm face, a throwable robot's 20-30 cm, a door 1 m by
 * 2.1 m); never a game's model or a brand's design.
 *
 * Floor things stand on their position; things fixed to a wall (a camera, a
 * breaching charge, a window) are built round theirs, facing forward (+x)
 * out of the wall. Parts that say whose it is take the team's colour.
 */

import { finish, newKit, PAINT, type Kit, type Template } from './kit';
import { blob, block, hexa, ring, tube, wheel } from './parts';
import type { Rgb } from '../race/geometry';

export type GadgetKind =
  | 'throw-drone'
  | 'wall-camera'
  | 'bulletproof-camera'
  | 'barbed-wire'
  | 'deployable-shield'
  | 'wall-reinforcement'
  | 'barricade'
  | 'breach-charge'
  | 'hard-breach-charge'
  | 'sticky-charge'
  | 'floor-trap'
  | 'claymore'
  | 'one-way-window'
  | 'armor-panel'
  | 'grenade'
  | 'smoke-grenade'
  | 'stun-grenade'
  | 'gas-canister'
  | 'jammer'
  | 'proximity-sensor'
  | 'laser-gate'
  | 'supply-box'
  | 'defuser'
  | 'device';

export const GADGET_KINDS: GadgetKind[] = [
  'throw-drone', 'wall-camera', 'bulletproof-camera', 'barbed-wire', 'deployable-shield', 'wall-reinforcement', 'barricade',
  'breach-charge', 'hard-breach-charge', 'sticky-charge', 'floor-trap', 'claymore', 'one-way-window', 'armor-panel', 'grenade',
  'smoke-grenade', 'stun-grenade', 'gas-canister', 'jammer', 'proximity-sensor', 'laser-gate', 'supply-box', 'defuser', 'device',
];

const grey = (k: number): Rgb => [k, k, k];
const RED: Rgb = [0.95, 0.12, 0.1];
const LASER: Rgb = [1, 0.2, 0.15];
const WOOD: Rgb = [0.55, 0.38, 0.22];
const STEEL: Rgb = [0.42, 0.44, 0.46];
const WIRE: Rgb = [0.55, 0.56, 0.58];
const CHARGE: Rgb = [0.48, 0.46, 0.3];
const LENS: Rgb = [0.08, 0.1, 0.14];

/** A small light: a lens or an LED, `r` across. */
function light(k: Kit, f: number, s: number, u: number, r: number, col: Rgb): void {
  blob(k.fixed, k.fr, [f, s, u], [r, r, r], col);
}

export function buildGadget(kind: GadgetKind): Template {
  const k = newKit();
  const T = k.team;
  const F = k.fixed;
  const fr = k.fr;
  switch (kind) {
    case 'throw-drone': {
      // A two-wheeled throwable robot: two big wheels on one axle, the body between, a camera ahead, a tail behind.
      const r = 0.065;
      const w = 0.28;
      for (const o of [-1, 1]) wheel(F, fr, o * (w / 2 - 0.02), r, r, 0.04, PAINT.tyre, PAINT.metal, o);
      tube(T, fr, [0, -w / 2 + 0.04, r], [0, w / 2 - 0.04, r], 0.045, 0.045, grey(0.85), 10);
      light(k, 0.045, 0, r + 0.01, 0.018, LENS);
      tube(F, fr, [-0.03, 0, r - 0.01], [-0.16, 0, 0.012], 0.008, 0.006, PAINT.dark, 4);
      break;
    }
    case 'wall-camera': {
      // A small dome camera on a round wall plate.
      tube(T, fr, [-0.02, 0, 0], [0, 0, 0], 0.07, 0.07, grey(0.8), 12);
      blob(F, fr, [0.02, 0, 0], [0.05, 0.055, 0.055], LENS);
      light(k, 0.06, 0, 0.03, 0.006, RED);
      break;
    }
    case 'bulletproof-camera': {
      // A boxy armoured camera on a bracket, its lens forward.
      block(T, fr, [0.04, 0, 0], 0.12, 0.16, 0.12, grey(0.75));
      block(F, fr, [-0.03, 0, -0.03], 0.04, 0.1, 0.03, PAINT.metal);
      tube(F, fr, [0.1, 0, 0.005], [0.125, 0, 0.005], 0.035, 0.03, LENS, 10);
      light(k, 0.1, 0.06, 0.04, 0.006, RED);
      break;
    }
    case 'barbed-wire': {
      // A low coil of wire across a passage, about 1.5 m long and 0.45 m high, on a few stakes.
      const L = 1.5;
      const R = 0.22;
      const loops = 9;
      const n = 8;
      for (let i = 0; i < loops; i++) {
        const s0 = -L / 2 + (L * i) / (loops - 1);
        const tilt = 0.06;
        for (let j = 0; j < n; j++) {
          const a0 = (j / n) * Math.PI * 2;
          const a1 = ((j + 1) / n) * Math.PI * 2;
          const p = (a: number): [number, number, number] => [Math.cos(a) * R, s0 + Math.cos(a) * tilt, R + Math.sin(a) * R];
          tube(F, fr, p(a0), p(a1), 0.012, 0.012, WIRE, 4);
        }
      }
      for (const s of [-L / 2, 0, L / 2]) tube(T, fr, [0, s, 0], [0, s, 0.5], 0.015, 0.012, grey(0.7), 4);
      break;
    }
    case 'deployable-shield': {
      // A waist-high shield standing on its feet, about a metre wide and high, leaning back a little, a view slit near its top.
      const lean = 0.18;
      for (let i = 0; i < 3; i++) {
        const s = (i - 1) * 0.34;
        const yaw = (i - 1) * -0.22;
        const c: [number, number, number] = [Math.abs(i - 1) * -0.07, s, 0.52];
        tiltPanel(k, c, 0.04, 0.36, 1.0, lean, yaw, grey(0.7));
      }
      block(F, fr, [0.0, 0, 0.88], 0.06, 0.24, 0.05, PAINT.glass);
      for (const s of [-0.38, 0.38]) block(F, fr, [-0.18, s, 0.03], 0.36, 0.06, 0.06, PAINT.metal);
      break;
    }
    case 'wall-reinforcement': {
      // A steel wall panel, about 1.4 m wide and 2.5 m high, its braces outward.
      block(T, fr, [0, 0, 1.25], 0.06, 1.4, 2.5, grey(0.7));
      for (const u of [0.45, 1.25, 2.05]) block(F, fr, [0.05, 0, u], 0.05, 1.3, 0.08, STEEL);
      for (const s of [-0.5, 0.5]) block(F, fr, [0.05, s, 1.25], 0.05, 0.08, 2.3, STEEL);
      break;
    }
    case 'barricade': {
      // Wooden boards across a doorway, about 1 m wide and 2.1 m high.
      for (let i = 0; i < 7; i++) block(F, fr, [0, 0, 0.18 + i * 0.29], 0.03, 1.0, 0.2, i % 2 ? WOOD : [0.6, 0.42, 0.25]);
      for (const s of [-0.48, 0.48]) block(T, fr, [-0.02, s, 1.05], 0.03, 0.05, 2.1, grey(0.6));
      break;
    }
    case 'breach-charge': {
      // A frame of explosive cord about 0.6 m by 1 m on the wall, its detonator in the middle.
      const W = 0.6;
      const H = 1.0;
      const r = 0.018;
      tube(F, fr, [0, -W / 2, -H / 2], [0, W / 2, -H / 2], r, r, CHARGE, 5);
      tube(F, fr, [0, -W / 2, H / 2], [0, W / 2, H / 2], r, r, CHARGE, 5);
      tube(F, fr, [0, -W / 2, -H / 2], [0, -W / 2, H / 2], r, r, CHARGE, 5);
      tube(F, fr, [0, W / 2, -H / 2], [0, W / 2, H / 2], r, r, CHARGE, 5);
      block(T, fr, [0.02, 0, 0], 0.05, 0.14, 0.1, grey(0.75));
      light(k, 0.05, 0.04, 0.03, 0.008, RED);
      break;
    }
    case 'hard-breach-charge': {
      // A heavy charge for armoured walls: a box about 0.5 m square on the wall, two canisters on it, the detonator below.
      block(T, fr, [0.04, 0, 0], 0.08, 0.5, 0.5, grey(0.7));
      for (const s of [-0.12, 0.12]) tube(F, fr, [0.08, s, -0.18], [0.08, s, 0.18], 0.06, 0.06, CHARGE, 10);
      block(F, fr, [0.1, 0, -0.2], 0.05, 0.12, 0.08, PAINT.dark);
      light(k, 0.13, 0.03, -0.18, 0.008, RED);
      break;
    }
    case 'sticky-charge': {
      // A fist-sized charge stuck to a surface: a puck with prongs and a light.
      tube(T, fr, [0, 0, 0], [0.05, 0, 0], 0.06, 0.05, grey(0.75), 10);
      for (const a of [0, 2.1, 4.2]) tube(F, fr, [0, Math.cos(a) * 0.05, Math.sin(a) * 0.05], [-0.03, Math.cos(a) * 0.07, Math.sin(a) * 0.07], 0.006, 0.004, PAINT.dark, 4);
      light(k, 0.055, 0, 0, 0.012, RED);
      break;
    }
    case 'floor-trap': {
      // A mine or trap on the floor: a low disc about 0.25 m across, a red light on top.
      tube(T, fr, [0, 0, 0], [0, 0, 0.06], 0.13, 0.11, grey(0.75), 14);
      tube(F, fr, [0, 0, 0.06], [0, 0, 0.075], 0.06, 0.05, PAINT.dark, 10);
      light(k, 0, 0, 0.08, 0.015, RED);
      break;
    }
    case 'claymore': {
      // A directional mine about 22 cm wide, 8 cm high and 4 cm deep, bowed outward, on scissor legs; its trip laser forward.
      for (let i = 0; i < 3; i++) {
        const s = (i - 1) * 0.073;
        block(T, fr, [i === 1 ? 0.008 : 0, s, 0.14], 0.035, 0.074, 0.085, grey(0.6));
      }
      for (const s of [-0.08, 0.08]) {
        tube(F, fr, [0, s, 0.1], [0.05, s * 1.3, 0], 0.005, 0.005, PAINT.dark, 4);
        tube(F, fr, [0, s, 0.1], [-0.05, s * 1.3, 0], 0.005, 0.005, PAINT.dark, 4);
      }
      tube(F, fr, [0.02, 0, 0.16], [1.2, 0, 0.16], 0.004, 0.004, LASER, 4, 0.6);
      break;
    }
    case 'one-way-window': {
      // A window set into a wall, about 0.5 m by 0.35 m: a thick frame and dark glass.
      block(T, fr, [0, 0, 0], 0.1, 0.56, 0.42, grey(0.65));
      block(F, fr, [0.055, 0, 0], 0.02, 0.46, 0.32, PAINT.glass);
      block(F, fr, [0.04, 0.24, -0.16], 0.04, 0.05, 0.06, PAINT.dark);
      break;
    }
    case 'armor-panel': {
      // An armour panel across a door, about 1 m wide and 2.1 m high, ribbed across.
      block(T, fr, [0, 0, 1.05], 0.05, 1.0, 2.1, grey(0.68));
      for (let i = 0; i < 5; i++) block(F, fr, [0.035, 0, 0.25 + i * 0.4], 0.025, 0.94, 0.06, STEEL);
      break;
    }
    case 'grenade':
    case 'smoke-grenade':
    case 'stun-grenade': {
      // A hand grenade about 12 cm long; a smoke's cloud starting round it, a stun's flash rays.
      tube(T, fr, [0, 0, 0], [0, 0, 0.1], 0.03, 0.03, grey(0.7), 10);
      tube(F, fr, [0, 0, 0.1], [0, 0, 0.125], 0.015, 0.012, PAINT.metal, 6);
      tube(F, fr, [0, 0.015, 0.12], [0, 0.04, 0.03], 0.004, 0.004, PAINT.metal, 4);
      if (kind === 'smoke-grenade') {
        for (const [f, s, u, r] of [[0.15, 0.05, 0.25, 0.3], [-0.2, 0.1, 0.35, 0.35], [0.05, -0.2, 0.45, 0.32]] as const) blob(F, fr, [f, s, u], [r, r, r * 0.8], grey(0.82), 0.4);
      }
      if (kind === 'stun-grenade') {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          tube(F, fr, [0, 0, 0.08], [Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0.08 + (i % 2 ? 0.2 : -0.04)], 0.02, 0.004, [1, 0.95, 0.6], 4, 0.8);
        }
      }
      break;
    }
    case 'gas-canister': {
      // A canister about 0.3 m high with a valve on top.
      tube(T, fr, [0, 0, 0], [0, 0, 0.26], 0.07, 0.07, grey(0.7), 12);
      tube(F, fr, [0, 0, 0.26], [0, 0, 0.31], 0.025, 0.02, PAINT.metal, 8);
      block(F, fr, [0, 0, 0.13], 0.15, 0.15, 0.03, [0.85, 0.75, 0.15]);
      break;
    }
    case 'jammer': {
      // An electronic box about 0.2 m long on the floor or a wall, two antennas.
      block(T, fr, [0, 0, 0.05], 0.2, 0.15, 0.1, grey(0.72));
      for (const s of [-0.05, 0.05]) tube(F, fr, [-0.06, s, 0.1], [-0.07, s, 0.3], 0.006, 0.004, PAINT.dark, 4);
      light(k, 0.1, 0.04, 0.07, 0.01, [0.3, 0.8, 1]);
      break;
    }
    case 'proximity-sensor': {
      // A small sensor about 8 cm across, a light on its face.
      block(T, fr, [0, 0, 0], 0.04, 0.08, 0.08, grey(0.75));
      light(k, 0.025, 0, 0, 0.018, RED);
      break;
    }
    case 'laser-gate': {
      // Two posts either side of a door, about a metre apart, red beams between.
      for (const s of [-0.5, 0.5]) block(T, fr, [0, s, 0.55], 0.06, 0.06, 1.1, grey(0.7));
      for (const u of [0.3, 0.6, 0.9]) tube(F, fr, [0, -0.47, u], [0, 0.47, u], 0.006, 0.006, LASER, 4, 0.7);
      break;
    }
    case 'supply-box': {
      // A supply case about 0.4 m long with a cross on its lid.
      block(T, fr, [0, 0, 0.13], 0.42, 0.3, 0.26, grey(0.72));
      block(F, fr, [0, 0, 0.265], 0.18, 0.05, 0.01, PAINT.light);
      block(F, fr, [0, 0, 0.265], 0.05, 0.18, 0.01, PAINT.light);
      break;
    }
    case 'defuser': {
      // A defusing device about 0.35 m long: a case with a handle, a display and an antenna, a light that shows it is running.
      block(T, fr, [0, 0, 0.1], 0.35, 0.24, 0.2, grey(0.7));
      tube(F, fr, [-0.1, 0, 0.22], [0.1, 0, 0.22], 0.015, 0.015, PAINT.dark, 6);
      block(F, fr, [0.1, 0.04, 0.205], 0.1, 0.1, 0.01, [0.2, 0.75, 0.35]);
      tube(F, fr, [-0.14, 0.09, 0.2], [-0.14, 0.09, 0.45], 0.006, 0.004, PAINT.dark, 4);
      light(k, -0.14, 0.09, 0.46, 0.015, RED);
      ring(F, fr, 0, 0, 0.01, 1.2, RED, 0.18, 24, 1.1);
      break;
    }
    case 'device': {
      // Something placed whose kind the data does not say: a puck with a light.
      tube(T, fr, [0, 0, 0], [0, 0, 0.05], 0.08, 0.07, grey(0.75), 12);
      light(k, 0, 0, 0.06, 0.02, [0.95, 0.85, 0.3]);
      break;
    }
  }
  return finish(k, 'ground');
}

/** A flat panel `l` thick, `w` wide and `h` high round `c`, leant back `lean` radians and turned `yaw` about up. */
function tiltPanel(k: Kit, c: [number, number, number], l: number, w: number, h: number, lean: number, yaw: number, col: Rgb): void {
  const cl = Math.cos(lean);
  const sl = Math.sin(lean);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  // Corners of the upright panel, leant back about its foot, then turned.
  const p = (a: number, b: number, d: number): [number, number, number] => {
    const up = d + h / 2;
    const f = a - up * sl;
    const u = up * cl;
    return [c[0] + f * cy - b * sy, c[1] + f * sy + b * cy, c[2] - h / 2 + u];
  };
  const L = l / 2;
  const W = w / 2;
  const H = h / 2;
  hexa(k.team, k.fr, [p(-L, -W, -H), p(L, -W, -H), p(L, W, -H), p(-L, W, -H)], [p(-L, -W, H), p(L, -W, H), p(L, W, H), p(-L, W, H)], col);
}

