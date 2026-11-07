/**
 * People: a soldier standing, crouching or lying, with what they carry. Built
 * to stand 1.8 m tall; the uniform takes the team's colour, the helmet a
 * darker shade of it, so a crowd reads by team at a glance and the head shows
 * which way someone faces.
 */

import { finish, newKit, PAINT, type Template } from './kit';
import { blob, block, tube } from './parts';
import type { Rgb } from '../race/geometry';

export type Stance = 'stand' | 'crouch' | 'prone';
export type Kitbag = 'rifle' | 'sniper' | 'launcher' | 'crew' | 'medic' | 'none';

export interface PersonSpec {
  stance?: Stance;
  carry?: Kitbag;
  /** Standing height, metres. */
  height?: number;
}

const grey = (k: number): Rgb => [k, k, k];

export function buildPerson(spec: PersonSpec = {}): Template {
  const k = newKit();
  const T = k.team;
  const F = k.fixed;
  const fr = k.fr;
  const stance = spec.stance ?? 'stand';
  const carry = spec.carry ?? 'rifle';
  const s = (spec.height ?? 1.8) / 1.8;
  const v = (f: number, side: number, up: number): [number, number, number] => [f * s, side * s, up * s];

  if (stance === 'prone') {
    // Lying along the forward axis, head forward, weapon ahead of the head.
    block(T, fr, v(-0.55, -0.1, 0.12), 0.9 * s, 0.14 * s, 0.16 * s, grey(0.85));
    block(T, fr, v(-0.55, 0.1, 0.12), 0.9 * s, 0.14 * s, 0.16 * s, grey(0.85));
    block(T, fr, v(0.2, 0, 0.16), 0.7 * s, 0.42 * s, 0.24 * s, WHITE_SHADE);
    blob(F, fr, v(0.68, 0, 0.24), v(0.12, 0.1, 0.11), PAINT.skin);
    blob(T, fr, v(0.69, 0, 0.3), v(0.14, 0.13, 0.08), grey(0.55));
    if (carry === 'rifle' || carry === 'sniper') tube(F, fr, v(0.45, 0.12, 0.2), v(carry === 'sniper' ? 1.65 : 1.35, 0.12, 0.2), 0.03 * s, 0.025 * s, PAINT.dark, 6);
    return finish(k, 'ground');
  }

  const crouch = stance === 'crouch';
  const hip = crouch ? 0.62 : 0.92;
  // Legs: standing, two upright blocks; crouching, a thigh forward and a shin down.
  for (const side of [-0.11, 0.11]) {
    if (crouch) {
      block(T, fr, v(0.16, side, 0.5), 0.38 * s, 0.15 * s, 0.15 * s, grey(0.8));
      block(T, fr, v(0.33, side, 0.24), 0.15 * s, 0.15 * s, 0.48 * s, grey(0.75));
    } else {
      block(T, fr, v(0, side, hip / 2), 0.17 * s, 0.15 * s, hip * s, grey(0.8));
    }
    block(F, fr, v(crouch ? 0.38 : 0.04, side, 0.04), 0.26 * s, 0.12 * s, 0.08 * s, PAINT.dark);
  }
  // Torso and backpack.
  const chest = hip + 0.58;
  block(T, fr, v(0, 0, (hip + chest) / 2), 0.26 * s, 0.44 * s, (chest - hip) * s, WHITE_SHADE);
  block(T, fr, v(-0.2, 0, hip + 0.32), 0.16 * s, 0.34 * s, 0.4 * s, grey(0.62));
  // Head, helmet a shade darker so the face shows the way they look.
  blob(F, fr, v(0.02, 0, chest + 0.14), v(0.11, 0.1, 0.12), PAINT.skin);
  if (carry === 'crew') blob(T, fr, v(0, 0, chest + 0.2), v(0.13, 0.12, 0.08), grey(0.5));
  else if (carry === 'sniper') blob(T, fr, v(-0.01, 0, chest + 0.21), v(0.13, 0.12, 0.07), grey(0.42));
  else blob(T, fr, v(-0.01, 0, chest + 0.2), v(0.15, 0.14, 0.09), grey(0.5));
  // Arms and what the hands hold.
  const shoulder = chest - 0.06;
  const hands: [number, number, number] = v(0.42, 0.04, shoulder - 0.2);
  for (const side of [-0.25, 0.25]) tube(T, fr, v(0, side, shoulder), hands, 0.05 * s, 0.045 * s, grey(0.78), 5);
  if (carry === 'rifle') tube(F, fr, v(0.12, 0.08, shoulder - 0.12), v(0.92, 0.04, shoulder - 0.2), 0.035 * s, 0.025 * s, PAINT.dark, 6);
  if (carry === 'sniper') {
    tube(F, fr, v(0.1, 0.08, shoulder - 0.12), v(1.25, 0.04, shoulder - 0.2), 0.035 * s, 0.022 * s, PAINT.dark, 6);
    tube(F, fr, v(0.35, 0.06, shoulder - 0.06), v(0.6, 0.06, shoulder - 0.07), 0.035 * s, 0.035 * s, PAINT.metal, 6);
  }
  if (carry === 'launcher') tube(F, fr, v(-0.45, 0.16, shoulder + 0.06), v(0.65, 0.16, shoulder + 0.02), 0.07 * s, 0.07 * s, PAINT.metal, 8);
  if (carry === 'medic') {
    block(F, fr, v(-0.29, 0, hip + 0.34), 0.02 * s, 0.22 * s, 0.07 * s, PAINT.light);
    block(F, fr, v(-0.29, 0, hip + 0.34), 0.02 * s, 0.07 * s, 0.22 * s, PAINT.light);
    tube(F, fr, v(0.12, 0.08, shoulder - 0.12), v(0.75, 0.04, shoulder - 0.2), 0.03 * s, 0.022 * s, PAINT.dark, 6);
  }
  return finish(k, 'ground');
}

const WHITE_SHADE: Rgb = [0.95, 0.95, 0.95];
