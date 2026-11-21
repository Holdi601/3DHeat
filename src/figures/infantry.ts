/**
 * People: a soldier standing, crouching or lying, with what they carry. Built
 * to stand 1.8 m tall; the uniform takes the team's colour, the helmet a
 * darker shade of it, so a crowd reads by team at a glance and the head shows
 * which way someone faces.
 *
 * Close-quarters soldiers (`vest`) wear a plate carrier and hold their weapon
 * by class: an assault rifle, a short SMG with its magazine, a shotgun with
 * its pump, a long DMR with its scope, an LMG with its box, a handgun held out
 * in both hands, or a ballistic shield with a view port and a handgun beside
 * it. Weapon lengths are the classes' usual ones (an SMG about 0.6 m, a rifle
 * 0.8-0.9 m, a shotgun or DMR about 1 m, a shield about 0.6 m by 1 m). `band`
 * puts a fixed colour on the plate carrier, both upper arms and round the
 * helmet: the side someone is on (attack, defence), beside the team's colour.
 */

import { finish, into, joint, newKit, PAINT, type Kit, type Template } from './kit';
import { blob, block, tube } from './parts';
import type { Rgb } from '../race/geometry';

export type Stance = 'stand' | 'crouch' | 'prone' | 'supine';
export type Kitbag = 'rifle' | 'sniper' | 'launcher' | 'crew' | 'medic' | 'none' | 'smg' | 'shotgun' | 'dmr' | 'lmg' | 'pistol' | 'shield';

export interface PersonSpec {
  stance?: Stance;
  carry?: Kitbag;
  /** Standing height, metres. */
  height?: number;
  /** A plate carrier over the chest (close-quarters soldiers). */
  vest?: boolean;
  /** A fixed colour on the upper arms and round the helmet (the side someone is on). */
  band?: Rgb;
  /** Without the helmet (and its band) or the backpack: for a figure that puts its own on (`operators.ts`). */
  helmet?: boolean;
  pack?: boolean;
  /** How broad the body is: 1 as built, about 0.9 a lightly armoured soldier, 1.12 a heavily armoured one. */
  bulk?: number;
  /** A shield's shape: a ballistic shield (0.6 by 1 m), a tall one covering the whole body, or a wider riot shield. */
  shield?: 'standard' | 'tall' | 'riot';
  /**
   * Fixed clothes in place of the team's colour: jacket and sleeves, trousers,
   * and gear (plate carrier, pack, shield). The side then shows by `band` alone.
   */
  outfit?: { top: Rgb; bottom: Rgb; gear: Rgb };
}

/** Where a built person's parts are, for parts put on afterwards (template frame: forward, side, up). */
export interface PersonAnchors {
  /** Lying down: on the belly (`prone`), or on the back (`supine` too). */
  prone: boolean;
  supine: boolean;
  /** The head's centre. */
  head: [number, number, number];
  /** Heights of the hips, the top of the chest and the shoulders (standing and crouching). */
  hip: number;
  chest: number;
  shoulder: number;
  /** Where the hands are (standing and crouching). */
  hands: [number, number, number];
  /** The body's breadth factor (`bulk`). */
  bulk: number;
  s: number;
}

const grey = (k: number): Rgb => [k, k, k];

/** A shield's face: a dark grey that reads against any team colour. */
const SHIELD: Rgb = [0.24, 0.25, 0.27];

export function buildPerson(spec: PersonSpec = {}): Template {
  const k = newKit();
  personInto(k, spec);
  return finish(k, 'ground');
}

/** Builds a person into a kit and says where its parts are. */
export function personInto(k: Kit, spec: PersonSpec = {}): PersonAnchors {
  const T = k.team;
  const F = k.fixed;
  const fr = k.fr;
  const stance = spec.stance ?? 'stand';
  const carry = spec.carry ?? 'rifle';
  const s = (spec.height ?? 1.8) / 1.8;
  const v = (f: number, side: number, up: number): [number, number, number] => [f * s, side * s, up * s];
  const b = spec.bulk ?? 1;
  const helmet = spec.helmet ?? true;
  const o = spec.outfit;
  // A part's buffer and colour: the team's shade, or the outfit's colour darkened by the same step.
  const P = (part: 'top' | 'bottom' | 'gear', shade: number, base: number): [typeof T, Rgb] =>
    o ? [F, scale(o[part], shade / base)] : [T, grey(shade)];

  if (stance === 'supine') return supineInto(k, spec, P);
  if (stance === 'prone') {
    // Lying along the forward axis, head forward, weapon ahead of the head.
    const [lb, lc] = P('bottom', 0.85, 0.85);
    block(lb, fr, v(-0.55, -0.1 * b, 0.12), 0.9 * s, 0.14 * b * s, 0.16 * s, lc);
    block(lb, fr, v(-0.55, 0.1 * b, 0.12), 0.9 * s, 0.14 * b * s, 0.16 * s, lc);
    // From the hips up it leans (rolls about the forward axis) as the data says: `LEAN` below.
    into(k, lean(k, [-0.12 * s, 0.14 * s, 0]));
    const [tb, tc] = o ? P('top', 1, 1) : [T, WHITE_SHADE];
    block(tb, fr, v(0.2, 0, 0.16), 0.7 * s, 0.42 * b * s, 0.24 * s, tc);
    blob(F, fr, v(0.68, 0, 0.24), v(0.12, 0.1, 0.11), PAINT.skin);
    if (helmet) blob(T, fr, v(0.69, 0, 0.3), v(0.14, 0.13, 0.08), grey(0.55));
    if (carry === 'rifle' || carry === 'sniper') tube(F, fr, v(0.45, 0.12, 0.2), v(carry === 'sniper' ? 1.65 : 1.35, 0.12, 0.2), 0.03 * s, 0.025 * s, PAINT.dark, 6);
    if (spec.vest) {
      const [vb, vc] = o ? P('gear', 1, 1) : spec.band ? [F, spec.band] : [T, grey(0.45)];
      block(vb, fr, v(0.25, 0, 0.3), 0.5 * s, 0.44 * b * s, 0.06 * s, vc);
    }
    const reach: Partial<Record<Kitbag, number>> = { smg: 1.1, shotgun: 1.45, dmr: 1.5, lmg: 1.45, pistol: 0.95 };
    const end = reach[carry];
    if (end !== undefined) {
      const thick = carry === 'shotgun' ? 0.035 : 0.03;
      tube(F, fr, v(0.45, 0.12, 0.2), v(end, 0.12, 0.2), thick * s, thick * 0.8 * s, PAINT.dark, 6);
      if (carry === 'lmg') block(F, fr, v(0.7, 0.12, 0.12), 0.12 * s, 0.1 * s, 0.1 * s, PAINT.dark);
      if (carry === 'dmr') tube(F, fr, v(0.62, 0.12, 0.26), v(0.85, 0.12, 0.26), 0.03 * s, 0.03 * s, PAINT.metal, 6);
    }
    // A shield lies ahead of the head, standing on its edge.
    if (carry === 'shield') block(o ? F : T, fr, v(0.98, 0.04, 0.28), 0.05 * s, 0.6 * s, 0.56 * s, SHIELD);
    if (spec.band && helmet) blob(F, fr, v(0.69, 0, 0.27), v(0.15, 0.14, 0.03), spec.band);
    return { prone: true, supine: false, head: v(0.68, 0, 0.24), hip: 0.12 * s, chest: 0.28 * s, shoulder: 0.2 * s, hands: v(0.45, 0.12, 0.2), bulk: b, s };
  }

  const crouch = stance === 'crouch';
  const hip = crouch ? 0.62 : 0.92;
  // Legs: standing, two upright blocks; crouching, a thigh forward and a shin down.
  for (const side of [-0.11 * b, 0.11 * b]) {
    if (crouch) {
      const [ub, uc] = P('bottom', 0.8, 0.8);
      const [db, dc] = P('bottom', 0.75, 0.8);
      block(ub, fr, v(0.16, side, 0.5), 0.38 * s, 0.15 * b * s, 0.15 * s, uc);
      block(db, fr, v(0.33, side, 0.24), 0.15 * s, 0.15 * b * s, 0.48 * s, dc);
    } else {
      const [ub, uc] = P('bottom', 0.8, 0.8);
      block(ub, fr, v(0, side, hip / 2), 0.17 * b * s, 0.15 * b * s, hip * s, uc);
    }
    block(F, fr, v(crouch ? 0.38 : 0.04, side, 0.04), 0.26 * s, 0.12 * s, 0.08 * s, PAINT.dark);
  }
  // From the hips up the body leans (rolls about the forward axis) as the data says.
  into(k, lean(k, [0, hip * s, 0]));
  // Torso and backpack.
  const chest = hip + 0.58;
  {
    const [tb, tc] = o ? P('top', 1, 1) : [T, WHITE_SHADE];
    block(tb, fr, v(0, 0, (hip + chest) / 2), 0.26 * b * s, 0.44 * b * s, (chest - hip) * s, tc);
  }
  if (spec.pack ?? true) {
    const [pb, pc] = P('gear', 0.62, 0.62);
    block(pb, fr, v(-0.2, 0, hip + 0.32), 0.16 * s, 0.34 * s, 0.4 * s, pc);
  }
  // A plate carrier: front and back plates over the chest, a shade darker.
  // With a band, the carrier's front plate is in the band's colour: the side shows from far off.
  if (spec.vest) {
    const [vb, vc] = o ? P('gear', 1, 1) : spec.band ? [F, spec.band] : [T, grey(0.45)];
    block(vb, fr, v(0.09 * b, 0, hip + 0.36), 0.1 * s, 0.4 * b * s, 0.36 * s, vc);
    const [wb, wc] = P('gear', 0.4, 0.45);
    block(wb, fr, v(0.15 * b, 0, hip + 0.2), 0.06 * s, 0.36 * b * s, 0.1 * s, wc);
  }
  // Head, helmet a shade darker so the face shows the way they look.
  blob(F, fr, v(0.02, 0, chest + 0.14), v(0.11, 0.1, 0.12), PAINT.skin);
  if (carry === 'crew') blob(T, fr, v(0, 0, chest + 0.2), v(0.13, 0.12, 0.08), grey(0.5));
  else if (carry === 'sniper') blob(T, fr, v(-0.01, 0, chest + 0.21), v(0.13, 0.12, 0.07), grey(0.42));
  else if (helmet) blob(T, fr, v(-0.01, 0, chest + 0.2), v(0.15, 0.14, 0.09), grey(0.5));
  // Arms and what the hands hold: a handgun is held out at arm's length, a shield's handgun beside it.
  const shoulder = chest - 0.06;
  const out = carry === 'pistol';
  const hands: [number, number, number] = out ? v(0.55, 0, shoulder - 0.08) : v(0.42, 0.04, shoulder - 0.2);
  if (carry === 'shield') {
    // The left arm holds the shield's grip, the right a handgun past its edge.
    const [ab, ac] = P('top', 0.78, 0.85);
    tube(ab, fr, v(0, -0.25 * b, shoulder), v(0.36, -0.1, shoulder - 0.2), 0.05 * b * s, 0.045 * b * s, ac, 5);
    tube(ab, fr, v(0, 0.25 * b, shoulder), v(0.45, 0.36, shoulder - 0.1), 0.05 * b * s, 0.045 * b * s, ac, 5);
  } else {
    const [ab, ac] = P('top', 0.78, 0.85);
    for (const side of [-0.25 * b, 0.25 * b]) tube(ab, fr, v(0, side, shoulder), hands, 0.05 * b * s, 0.045 * b * s, ac, 5);
  }
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
  if (carry === 'smg') {
    // About 0.6 m, its magazine straight down in front of the trigger.
    tube(F, fr, v(0.14, 0.08, shoulder - 0.13), v(0.74, 0.04, shoulder - 0.2), 0.04 * s, 0.03 * s, PAINT.dark, 6);
    block(F, fr, v(0.46, 0.05, shoulder - 0.3), 0.05 * s, 0.03 * s, 0.16 * s, PAINT.dark);
  }
  if (carry === 'shotgun') {
    // About a metre, a thick barrel and the pump under it.
    tube(F, fr, v(0.08, 0.08, shoulder - 0.12), v(1.02, 0.04, shoulder - 0.19), 0.042 * s, 0.03 * s, PAINT.dark, 6);
    tube(F, fr, v(0.55, 0.04, shoulder - 0.25), v(0.82, 0.04, shoulder - 0.25), 0.035 * s, 0.035 * s, PAINT.metal, 6);
  }
  if (carry === 'dmr' || carry === 'lmg') {
    // About a metre; a DMR's scope on top, an LMG's box under it.
    tube(F, fr, v(0.1, 0.08, shoulder - 0.12), v(1.08, 0.04, shoulder - 0.2), 0.04 * s, 0.026 * s, PAINT.dark, 6);
    if (carry === 'dmr') tube(F, fr, v(0.32, 0.07, shoulder - 0.05), v(0.58, 0.07, shoulder - 0.06), 0.032 * s, 0.032 * s, PAINT.metal, 6);
    else block(F, fr, v(0.36, 0.08, shoulder - 0.3), 0.14 * s, 0.11 * s, 0.14 * s, PAINT.dark);
  }
  if (carry === 'pistol') block(F, fr, v(0.62, 0, shoulder - 0.04), 0.18 * s, 0.035 * s, 0.13 * s, PAINT.dark);
  if (carry === 'shield') {
    // A ballistic shield about 0.6 m by 1 m in front, its view port at eye height; the handgun at its right edge.
    // A tall shield covers the body to the eyes (about 0.7 by 1.6 m), a riot shield is wider (0.66 by 1.4 m).
    const kind = spec.shield ?? 'standard';
    const [sw, sh] = kind === 'tall' ? [0.72, crouch ? 1.2 : 1.6] : kind === 'riot' ? [0.66, crouch ? 1.1 : 1.4] : [0.6, 1.0];
    const mid = kind === 'standard' ? (crouch ? 0.55 : 0.98) : sh / 2 + 0.02;
    block(o ? F : T, fr, v(0.42, -0.04, mid), 0.05 * s, sw * s, sh * s, SHIELD);
    // The view port at eye height, or near the top of a shield held low in a crouch (the eyes over it).
    block(F, fr, v(0.45, -0.04, Math.min(chest + 0.1, mid + sh / 2 - 0.07)), 0.02 * s, 0.26 * s, 0.08 * s, PAINT.glass);
    block(F, fr, v(0.52, 0.38, shoulder - 0.08), 0.18 * s, 0.035 * s, 0.13 * s, PAINT.dark);
  }
  if (spec.band) {
    // Without the team's colour on the body (an outfit), the arm bands are broader.
    const ab = o ? 1.35 : 1;
    for (const side of [-0.25 * b, 0.25 * b]) block(F, fr, v(0.03, side * 1.02, shoulder - (o ? 0.1 : 0.08)), 0.12 * ab * s, 0.11 * ab * s, 0.07 * ab * ab * s, spec.band);
    if (helmet) block(F, fr, v(-0.01, 0, chest + 0.16), 0.31 * s, 0.29 * s, 0.035 * s, spec.band);
  }
  return { prone: false, supine: false, head: v(0.02, 0, chest + 0.14), hip: hip * s, chest: chest * s, shoulder: shoulder * s, hands, bulk: b, s };
}

const WHITE_SHADE: Rgb = [0.95, 0.95, 0.95];

/**
 * The upper body's lean: a joint about the forward axis through `pivot`
 * (template frame: forward, up, right). Built as a part pointing right that
 * the instance's elevation raises, so the renderers turn it without anything
 * of their own: an elevation of +a rolls the top to the left (`posture.ts`).
 */
function lean(k: Kit, pivot: [number, number, number]): number {
  return joint(k, { kind: 'pitch', pivot, parent: -1, rest: Math.PI / 2, pitch: 0 });
}

/**
 * Lying on the back along the forward axis, head forward and face up, one
 * knee drawn up; the weapon across the chest. From above the face, the chest
 * and the knee show where a prone figure shows its back.
 */
function supineInto(k: Kit, spec: PersonSpec, P: (part: 'top' | 'bottom' | 'gear', shade: number, base: number) => [Kit['team'], Rgb]): PersonAnchors {
  const F = k.fixed;
  const fr = k.fr;
  const s = (spec.height ?? 1.8) / 1.8;
  const v = (f: number, side: number, up: number): [number, number, number] => [f * s, side * s, up * s];
  const b = spec.bulk ?? 1;
  const o = spec.outfit;
  const [lb, lc] = P('bottom', 0.85, 0.85);
  // The left leg flat, the right one with its knee up.
  block(lb, fr, v(-0.55, -0.1 * b, 0.1), 0.9 * s, 0.14 * b * s, 0.16 * s, lc);
  tube(lb, fr, v(-0.15, 0.1 * b, 0.12), v(-0.42, 0.1 * b, 0.42), 0.08 * b * s, 0.07 * b * s, lc, 6);
  tube(lb, fr, v(-0.42, 0.1 * b, 0.42), v(-0.72, 0.1 * b, 0.06), 0.07 * b * s, 0.06 * b * s, lc, 6);
  block(F, fr, v(-1.02, -0.1 * b, 0.1), 0.08 * s, 0.12 * s, 0.24 * s, PAINT.dark);
  into(k, lean(k, [-0.12 * s, 0.12 * s, 0]));
  const [tb, tc] = o ? P('top', 1, 1) : [k.team, WHITE_SHADE];
  block(tb, fr, v(0.2, 0, 0.13), 0.7 * s, 0.42 * b * s, 0.24 * s, tc);
  if (spec.vest) {
    const [vb, vc] = o ? P('gear', 1, 1) : spec.band ? [F, spec.band] : [k.team, grey(0.45)];
    block(vb, fr, v(0.25, 0, 0.27), 0.5 * s, 0.44 * b * s, 0.06 * s, vc);
  }
  // The head with the face up; a helmet under it.
  blob(F, fr, v(0.68, 0, 0.17), v(0.12, 0.1, 0.11), PAINT.skin);
  if (spec.helmet ?? true) blob(o ? F : k.team, fr, v(0.67, 0, 0.1), v(0.15, 0.14, 0.09), o ? o.gear : grey(0.5));
  // Arms along the sides, the weapon across the chest.
  const [ab, ac] = P('top', 0.78, 0.85);
  for (const side of [-0.26 * b, 0.26 * b]) tube(ab, fr, v(0.45, side, 0.14), v(0.05, side * 0.6, 0.3), 0.05 * b * s, 0.045 * b * s, ac, 5);
  const carry = spec.carry ?? 'rifle';
  if (carry === 'shield') block(o ? F : k.team, fr, v(0.15, 0, 0.32), 0.7 * s, 0.55 * s, 0.05 * s, SHIELD);
  else if (carry !== 'none' && carry !== 'crew') tube(F, fr, v(0.0, -0.28, 0.33), v(0.5, 0.3, 0.33), 0.035 * s, 0.028 * s, PAINT.dark, 6);
  if (spec.band) for (const side of [-0.27 * b, 0.27 * b]) block(F, fr, v(0.4, side, 0.16), 0.12 * s, 0.06 * s, 0.1 * s, spec.band);
  return { prone: true, supine: true, head: v(0.68, 0, 0.17), hip: 0.1 * s, chest: 0.25 * s, shoulder: 0.2 * s, hands: v(0.05, 0, 0.3), bulk: b, s };
}

const scale = (c: Rgb, k: number): Rgb => [Math.min(1, c[0] * k), Math.min(1, c[1] * k), Math.min(1, c[2] * k)];
