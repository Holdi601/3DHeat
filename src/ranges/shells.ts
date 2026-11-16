/**
 * The range shells: per unit and weapon a shell at each band's radius (least
 * range, best range, most range), drawn by both backends as instances of one
 * mesh uploaded once - a unit sphere, then the side of a unit cone for the
 * weapons that fire forward. What makes each shell its own (where, how big,
 * its colour, its cuts) is `SHELL_FLOATS` floats an instance, made here on the
 * CPU each frame for the few units shown.
 *
 * A shell is cut where its weapon cannot reach: below its lowest or above its
 * highest target height, outside its elevation limits, outside its cone. The
 * cuts, and (`viewshed.ts`) where the unit's line of sight ends, are drawn as
 * bright edges; the faces themselves stay faint, so the shells inside show
 * through the ones outside (`shellShaders.ts`).
 */

import type { WeaponClass, WeaponRange } from './catalog';
import { WEAPON_CLASSES } from './catalog';
import type { RangeSettings } from './settings';

/**
 * Floats an instance:
 * 0-3 middle (relative to the frame's origin), radius;
 * 4-7 colour, alpha;
 * 8-11 forward (unit), cosine of the cone's half-angle (-2: no cone);
 * 12-15 lowest and highest target height (relative), sines of the lowest and highest elevation;
 * 16-19 band (0 least, 1 best, 2 most), view slot (-1 none), weapon class, line of sight applies (0/1);
 * 20-23 least and best range (for the rings on a cone's side), unused, unused.
 */
export const SHELL_FLOATS = 24;
/** Segments round and rings up the sphere; rings out and segments round the cone. */
export const SPHERE_SEGMENTS = 64;
export const SPHERE_RINGS = 32;
export const CONE_RINGS = 12;
export const CONE_SEGMENTS = 48;

export const BAND = { min: 0, opt: 1, max: 2 } as const;

/**
 * The shell mesh, four floats a vertex: a unit sphere's points (xyz, 0), then
 * the cone side's (distance out 0..1, cos and sin round, 1), as triangles.
 * `sphere` vertices first, `cone` after.
 */
export function shellMesh(): { data: Float32Array; sphere: number; cone: number } {
  const out: number[] = [];
  const sp = (lat: number, lon: number) => {
    const t = (lat / SPHERE_RINGS) * Math.PI - Math.PI / 2;
    const f = (lon / SPHERE_SEGMENTS) * Math.PI * 2;
    return [Math.cos(t) * Math.cos(f), Math.sin(t), Math.cos(t) * Math.sin(f), 0];
  };
  for (let i = 0; i < SPHERE_RINGS; i++)
    for (let j = 0; j < SPHERE_SEGMENTS; j++) {
      const a = sp(i, j), b = sp(i + 1, j), c = sp(i + 1, j + 1), d = sp(i, j + 1);
      out.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  const sphere = out.length / 4;
  const cp = (ring: number, seg: number) => {
    const f = (seg / CONE_SEGMENTS) * Math.PI * 2;
    return [ring / CONE_RINGS, Math.cos(f), Math.sin(f), 1];
  };
  for (let i = 0; i < CONE_RINGS; i++)
    for (let j = 0; j < CONE_SEGMENTS; j++) {
      const a = cp(i, j), b = cp(i + 1, j), c = cp(i + 1, j + 1), d = cp(i, j + 1);
      out.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  return { data: new Float32Array(out), sphere, cone: out.length / 4 - sphere };
}

/** A unit whose ranges are drawn. */
export interface RangeUnit {
  person: number;
  /** Where its weapons are, relative to the frame's origin. */
  x: number;
  y: number;
  z: number;
  /** Its nose, unit length. */
  fwd: [number, number, number];
  /** Height above the ground, metres (for bombs), and speed, metres a second. */
  height: number;
  speed: number;
  weapons: WeaponRange[];
  /** Each weapon's colour, beside `weapons` (`weaponColour`); absent: the class colours. */
  colours?: [number, number, number][];
  /** Its view slot (`viewshed.ts`), -1 for none. */
  slot: number;
}

/** How far a bomb dropped now reaches: a free fall's throw from this height and speed, at most the weapon's reach. */
export function dropReach(w: WeaponRange, height: number, speed: number): number {
  if (w.cone >= 60) return w.max;
  const h = Math.max(0, height);
  const fall = Math.sqrt((2 * h) / 9.81);
  return Math.max(w.min + 1, Math.min(w.max, Math.hypot(h, speed * fall) * 1.1));
}

/**
 * The shells of `units` into `out` (grown as needed): the sphere-only ones
 * first, then those with a cone's side (`coneStart` on). `k` data units a metre.
 * Written straight into the buffer, two passes, nothing made a frame.
 */
export function buildShells(
  units: readonly RangeUnit[],
  s: RangeSettings,
  k: number,
  colours: Record<WeaponClass, [number, number, number]>,
  out: { data: Float32Array; count: number; coneStart: number },
): void {
  let n = 0;
  for (let pass = 0; pass < 2; pass++) {
    if (pass === 1) out.coneStart = n;
    for (const u of units) {
      for (let wi = 0; wi < u.weapons.length; wi++) {
        const w = u.weapons[wi];
        if (!s.classes[w.cls]) continue;
        const forward = w.shape !== 'sphere';
        const max = w.shape === 'drop' ? dropReach(w, u.height, u.speed) : w.max;
        const min = Math.min(w.min, max);
        const opt = Math.min(w.opt, max);
        for (let band = 0; band < 3; band++) {
          const r = band === BAND.min ? (s.bands.min && min > 0 ? min : 0) : band === BAND.opt ? (s.bands.opt && opt > min && opt < max ? opt : 0) : s.bands.max ? max : 0;
          if (!(r > 0)) continue;
          // The cone's side once a weapon, with the outermost shell: in the second pass.
          if ((forward && band === BAND.max) !== (pass === 1)) continue;
          if (out.data.length < (n + 1) * SHELL_FLOATS) {
            const next = new Float32Array(Math.max(64, (n + 1) * 2) * SHELL_FLOATS);
            next.set(out.data.subarray(0, n * SHELL_FLOATS));
            out.data = next;
          }
          writeShell(out.data, n * SHELL_FLOATS, u, w, band, r, min, opt, k, u.colours?.[wi] ?? colours[w.cls]);
          n++;
        }
      }
    }
  }
  out.count = n;
}

function writeShell(o: Float32Array, at: number, u: RangeUnit, w: WeaponRange, band: number, r: number, min: number, opt: number, k: number, col: [number, number, number]): void {
  // A bomb's cone points down and ahead; a gun's and a missile's along the nose.
  let f0 = u.fwd[0], f1 = u.fwd[1], f2 = u.fwd[2];
  let e0 = w.elev[0], e1 = w.elev[1];
  if (w.shape === 'drop') {
    const hz = Math.hypot(f0, f2) || 1;
    const c = Math.cos(Math.PI / 3);
    f0 = (f0 / hz) * c;
    f1 = -Math.sin(Math.PI / 3);
    f2 = (f2 / hz) * c;
    e1 = Math.min(0, e1);
  }
  e0 = Math.max(-90, e0);
  e1 = Math.min(90, e1);
  o[at] = u.x;
  o[at + 1] = u.y;
  o[at + 2] = u.z;
  o[at + 3] = r * k;
  o[at + 4] = col[0];
  o[at + 5] = col[1];
  o[at + 6] = col[2];
  o[at + 7] = 1;
  o[at + 8] = f0;
  o[at + 9] = f1;
  o[at + 10] = f2;
  o[at + 11] = w.shape !== 'sphere' ? Math.cos((w.cone * Math.PI) / 180) : -2;
  o[at + 12] = Math.max(-1e9, w.alt[0] * k);
  o[at + 13] = Math.min(1e9, w.alt[1] * k);
  o[at + 14] = Math.sin((e0 * Math.PI) / 180);
  o[at + 15] = Math.sin((e1 * Math.PI) / 180);
  o[at + 16] = band;
  o[at + 17] = w.los ? u.slot : -1;
  o[at + 18] = WEAPON_CLASSES.indexOf(w.cls);
  o[at + 19] = w.los ? 1 : 0;
  o[at + 20] = min * k;
  o[at + 21] = opt * k;
  o[at + 22] = 0;
  o[at + 23] = 0;
}
type Rgb = [number, number, number];

function toHsl([r, g, b]: Rgb): Rgb {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function toRgb([h, s, l]: Rgb): Rgb {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

/** Hue steps (degrees) and lightness steps of a unit's weapons, first weapon first. */
const HUE_STEP = [0, 30, -30, 55, -55, 15, -15, 75];
const LIGHT_STEP = [0, 0.12, -0.1, 0.18, -0.16, 0.06, -0.05, 0.22];

/**
 * The colour of a unit's `i`-th weapon: its team's colour for the first, then
 * neighbouring hues of the same family (a red side: red, orange, pink...; a
 * blue side: blue, cyan, violet...), each also lighter or darker so they part
 * for colour-blind eyes too. Saturated enough to read as a hue on a dark scene.
 */
export function weaponColour(team: Rgb, i: number): Rgb {
  const [h, s, l] = toHsl(team);
  const j = i % HUE_STEP.length;
  const hue = (((h + HUE_STEP[j]) % 360) + 360) % 360;
  return toRgb([hue, Math.max(0.55, s), Math.min(0.78, Math.max(0.38, l + LIGHT_STEP[j]))]);
}