/**
 * Jet variants drawn from their own outlines: each variant whose silhouette
 * differs - one seat or two, the canopy's length and hump, round or caret
 * intakes, the LERX, conformal tanks and dorsal spines, canards, the nose and
 * its radome, chin pods, wingtip rails or pods, the fins, the size - as a
 * figure of its own, so a single-seat Hornet is told from a two-seat one and
 * a Super Hornet from a legacy Hornet by the silhouette alone.
 *
 * Length, span and height are published values. The outlines are judged from
 * the general shape of the real aircraft (estimates, not traced from any
 * drawing or game model). Coordinates: forward from the aircraft's middle,
 * out from the centre line, up from the fuselage axis; metres.
 */

import type { Named, SpecSet } from './index';
import type { FixedWingSpec } from '../air';
import type { Outline, P2 } from '../parts';

const A: Named<FixedWingSpec> = {};
const ALIASES: Record<string, string> = {};

// ---------------------------------------------------------------- canopies and add-ons

/**
 * A one-seat bubble canopy from the windscreen's foot `front` back to `back`,
 * its crown `crown` above the axis, standing on the fuselage at `sillF` in
 * front and `sillB` behind, `w` half wide.
 */
export function bubble(front: number, back: number, crown: number, sillF: number, sillB: number, w: number): Outline {
  const L = front - back;
  return {
    top: [[back, sillB], [back + L * 0.18, crown - 0.05], [back + L * 0.45, crown], [front - L * 0.3, crown - 0.07], [front - L * 0.08, sillF + (crown - sillF) * 0.35], [front, sillF]],
    bottom: [[back, sillB - 0.3], [front, sillF - 0.3]],
    plan: [[back, w * 0.3], [back + L * 0.25, w * 0.95], [back + L * 0.55, w], [front - L * 0.2, w * 0.85], [front, w * 0.3]],
    round: 2.2,
    stations: 14,
  };
}

/** Two seats one behind the other under one canopy (or two), the rear crown `crown2`, the front `crown1`. */
export function tandem(front: number, back: number, crown1: number, crown2: number, sillF: number, sillB: number, w: number): Outline {
  const L = front - back;
  return {
    top: [[back, sillB], [back + L * 0.1, crown2 - 0.06], [back + L * 0.28, crown2], [back + L * 0.46, crown2 - 0.04], [back + L * 0.6, crown1], [front - L * 0.2, crown1 - 0.06], [front - L * 0.05, sillF + (crown1 - sillF) * 0.35], [front, sillF]],
    bottom: [[back, sillB - 0.3], [front, sillF - 0.3]],
    plan: [[back, w * 0.3], [back + L * 0.15, w * 0.95], [back + L * 0.5, w], [front - L * 0.15, w * 0.85], [front, w * 0.3]],
    round: 2.2,
    stations: 18,
  };
}

/** Two seats side by side (Su-24, Su-34, A-6, F-111): a wide, flat-crowned canopy. */
export function sideBySide(front: number, back: number, crown: number, sillF: number, sillB: number, w: number): Outline {
  const L = front - back;
  return {
    top: [[back, sillB], [back + L * 0.2, crown - 0.04], [back + L * 0.55, crown], [front - L * 0.25, crown - 0.08], [front, sillF]],
    bottom: [[back, sillB - 0.3], [front, sillF - 0.3]],
    plan: [[back, w * 0.5], [back + L * 0.25, w], [front - L * 0.25, w * 0.95], [front, w * 0.45]],
    round: 3,
    stations: 14,
  };
}

/** A long body of round section from `x0` back to `x1`, radius `r`, its axis at (`side`, `up`): pods, rails, probes, tanks. */
export function pod(x0: number, x1: number, r: number, side: number, up: number, noseShare = 0.2): Outline {
  const L = x0 - x1;
  return {
    top: [[x0, up], [x0 - L * noseShare, up + r], [x1 + L * 0.08, up + r], [x1, up + r * 0.4]],
    bottom: [[x0, up], [x0 - L * noseShare, up - r], [x1 + L * 0.08, up - r], [x1, up - r * 0.4]],
    plan: [[x0, 0.02], [x0 - L * noseShare, r], [x1 + L * 0.08, r], [x1, r * 0.4]],
    side,
    round: 2,
    stations: 8,
  };
}

/** A hump on the back from `x0` to `x1`: `h` high above `base`, `w` half wide (dorsal spines, avionics humps). */
export function spine(x0: number, x1: number, base: number, h: number, w: number, side = 0): Outline {
  const L = x0 - x1;
  return {
    top: [[x0, base], [x0 - L * 0.12, base + h], [x1 + L * 0.15, base + h * 0.92], [x1, base]],
    bottom: [[x0, base - 0.25], [x1, base - 0.25]],
    plan: [[x0, w * 0.4], [x0 - L * 0.12, w], [x1 + L * 0.15, w * 0.9], [x1, w * 0.3]],
    side: side || undefined,
    round: 3,
    stations: 10,
  };
}

// ---------------------------------------------------------------- F/A-18 Hornet and Super Hornet

// Legacy Hornet (A to D): the long narrow LERX curving out from under the windscreen to the wing, round-lipped
// D-shaped intakes straight up and down under them, a 27-degree wing with tip rails, two fins canted out 20 degrees
// and set well ahead of the stabilators (17.07 x 12.31 over the tip missiles x 4.66 m).
const HORNET: FixedWingSpec = {
  length: 17.07, span: 12.31, height: 4.66, bodyWidth: 2.2, bodyHeight: 1.6,
  fuselage: {
    top: [[8.535, -0.12], [7.6, 0.22], [6.4, 0.42], [5.5, 0.5], [2.6, 0.6], [0.5, 0.62], [-3, 0.52], [-6.5, 0.42], [-8.3, 0.32]],
    bottom: [[8.535, -0.16], [7.6, -0.42], [6.0, -0.56], [3.8, -0.6], [1.9, -0.62], [1.75, -0.84], [-1, -0.86], [-4.5, -0.66], [-8.3, -0.36]],
    plan: [[8.535, 0.04], [7.6, 0.36], [6.0, 0.52], [4.0, 0.6], [2.0, 0.66], [1.7, 1.02], [-1.0, 1.12], [-4.5, 1.1], [-7.0, 0.95], [-8.3, 0.8]],
    round: [[8.5, 2.2], [3.0, 2.4], [1.7, 3.2], [-8.3, 3.2]],
    stations: 26,
  },
  bodies: [pod(0.1, -3.2, 0.08, 5.95, 0.12, 0.1)],
  wing: { x: -1.75, span: 11.43, rootChord: 4.5, tipChord: 1.6, sweep: 26.7, mount: 0.2 },
  wingPlan: [[5.6, 0], [5.0, 0.5], [3.6, 0.72], [2.0, 0.95], [0.9, 1.35], [0.5, 1.62], [-1.57, 5.72], [-3.17, 5.72], [-3.9, 1.62], [-4.0, 0]],
  tail: { kind: 'twin', finHeight: 3.05, finChord: 3.4, cant: 20, spacing: 2.3, tailSpan: 6.58, tailChord: 2.4, finBase: 0.42 },
  finPlan: [[-2.6, 0], [-6.0, 0], [-6.75, 3.05], [-5.45, 3.05]],
  tailPlan: [[-5.6, 0.95], [-5.9, 1.25], [-7.4, 3.29], [-8.4, 3.29], [-8.6, 1.25], [-8.6, 0.95]],
  engines: { kind: 'internal', count: 2, diameter: 0.9 },
  canopy: { x: 4.0, length: 2.9, kind: 'bubble' },
  glass: [bubble(5.5, 2.6, 1.08, 0.5, 0.6, 0.42)],
};
A['f-a-18c'] = { ...HORNET, cls: 'multirole' };
// The two-seat B and D: the same airframe, the canopy a metre longer over the second seat, which sits a little higher.
A['f-a-18d'] = { ...HORNET, cls: 'multirole', canopy: { x: 3.6, length: 3.7, kind: 'tandem' }, glass: [tandem(5.5, 1.75, 1.02, 1.12, 0.5, 0.62, 0.42)] };

// Super Hornet (E and F): a fifth larger - the fuselage longer and wider, the LERX broad with straight edges, the
// intakes rectangular carets raked back, the wing bigger with a dogtooth snag, bigger fins and stabilators
// (18.31 x 13.62 over the tip missiles x 4.88 m).
const SUPER_HORNET: FixedWingSpec = {
  length: 18.31, span: 13.62, height: 4.88, bodyWidth: 2.6, bodyHeight: 1.7,
  fuselage: {
    top: [[9.155, -0.12], [8.1, 0.24], [6.9, 0.45], [6.0, 0.54], [3.0, 0.64], [0.5, 0.68], [-3.5, 0.56], [-7, 0.45], [-8.9, 0.34]],
    bottom: [[9.155, -0.16], [8.1, -0.44], [6.4, -0.58], [3.6, -0.62], [2.5, -0.64], [1.7, -0.96], [-1.2, -0.96], [-4.8, -0.7], [-8.9, -0.38]],
    plan: [[9.155, 0.04], [8.1, 0.38], [6.4, 0.56], [4.0, 0.66], [2.5, 0.72], [1.9, 1.22], [-1.0, 1.3], [-5, 1.24], [-7.6, 1.04], [-8.9, 0.86]],
    round: [[9.1, 2.2], [2.6, 2.4], [1.9, 7], [-1, 4], [-8.9, 3.4]],
    stations: 26,
  },
  bodies: [pod(0.6, -3.0, 0.08, 6.45, 0.12, 0.1)],
  wing: { x: -1.9, span: 12.4, rootChord: 5.2, tipChord: 2.0, sweep: 29, mount: 0.2 },
  wingPlan: [[6.2, 0], [5.4, 0.62], [3.8, 1.02], [2.4, 1.45], [1.2, 1.95], [0.7, 2.15], [-0.35, 4.0], [-0.18, 4.05], [-1.42, 6.2], [-3.4, 6.2], [-4.4, 2.15], [-4.5, 0]],
  tail: { kind: 'twin', finHeight: 3.25, finChord: 3.8, cant: 20, spacing: 2.6, tailSpan: 7.2, tailChord: 2.8, finBase: 0.45 },
  finPlan: [[-2.8, 0], [-6.6, 0], [-7.4, 3.25], [-5.9, 3.25]],
  tailPlan: [[-5.9, 1.0], [-6.2, 1.3], [-7.9, 3.6], [-9.0, 3.6], [-9.25, 1.3], [-9.25, 1.0]],
  engines: { kind: 'internal', count: 2, diameter: 0.95 },
  canopy: { x: 4.5, length: 3.0, kind: 'bubble' },
  glass: [bubble(6.0, 3.0, 1.14, 0.54, 0.64, 0.45)],
};
A['f-a-18e'] = { ...SUPER_HORNET, cls: 'multirole' };
A['f-a-18f'] = { ...SUPER_HORNET, cls: 'multirole', canopy: { x: 4.0, length: 3.9, kind: 'tandem' }, glass: [tandem(6.0, 2.1, 1.07, 1.16, 0.54, 0.66, 0.45)] };
// EA-18G Growler: the two-seat F with fat ALQ-218 receiver pods on the wingtips in place of the missile rails.
A['ea-18g'] = { ...A['f-a-18f'], cls: 'ew', bodies: [pod(1.0, -2.9, 0.2, 6.35, 0.12, 0.3)] };

// ---------------------------------------------------------------- F-15 Eagle and Strike Eagle

// The F-15's flat wide body with box intakes beside the cockpit (as drawn in ./aircraft.ts), here with its tall
// bubble canopy standing high over the nose (19.43 x 13.05 x 5.63 m).
const EAGLE: FixedWingSpec = {
  length: 19.43, span: 13.05, height: 5.63, bodyWidth: 2.9, bodyHeight: 1.7,
  fuselage: { top: [[9.7, -0.05], [8.6, 0.32], [7.2, 0.5], [6.1, 0.58], [3.4, 0.64], [0, 0.62], [-6.5, 0.58], [-9.3, 0.42]], bottom: [[9.7, -0.12], [8.6, -0.42], [6.6, -0.58], [4.6, -0.62], [3.6, -0.95], [0, -0.85], [-6.5, -0.72], [-9.3, -0.45]], plan: [[9.7, 0.04], [8.6, 0.38], [6.6, 0.6], [4.8, 0.72], [4.2, 1.42], [0, 1.48], [-6.8, 1.4], [-9.3, 1.15]], round: [[9.7, 2.2], [5.0, 2.4], [4.0, 6], [-9.3, 5]], stations: 26 },
  wing: { x: -1.6, span: 13.05, rootChord: 7.6, tipChord: 1.6, sweep: 45, mount: 0.3 },
  wingPlan: [[2.2, 0], [2.2, 1.4], [-2.95, 6.3], [-3.6, 6.52], [-4.5, 6.4], [-5.2, 1.4], [-5.4, 0]],
  tail: { kind: 'twin', finHeight: 3.1, finChord: 3.0, spacing: 3.1, tailSpan: 8.6, tailChord: 2.8, finBase: 0.55 },
  finPlan: [[-6.0, 0], [-9.35, 0], [-9.55, 3.15], [-8.2, 3.15], [-8.0, 2.9]],
  tailPlan: [[-6.6, 0.9], [-6.9, 1.55], [-7.25, 1.6], [-8.75, 4.3], [-9.65, 4.3], [-9.9, 1.6], [-9.9, 0.9]],
  engines: { kind: 'internal', count: 2, diameter: 1.15 },
  canopy: { x: 4.9, length: 3.4, kind: 'bubble' },
  glass: [bubble(6.3, 3.0, 1.36, 0.58, 0.64, 0.5)],
};
A['f-15c'] = { ...EAGLE, cls: 'fighter' };
// F-15B / D: two seats under one long canopy, no conformal tanks.
A['f-15d'] = { ...EAGLE, cls: 'fighter', canopy: { x: 4.4, length: 4.2, kind: 'tandem' }, glass: [tandem(6.3, 2.0, 1.32, 1.4, 0.58, 0.64, 0.5)] };
// F-15E / EX: the two-seat canopy and the conformal fuel tanks along the intake trunks under the wing roots,
// widening the body ahead of the wing and from the front.
const CFT_15: Outline = { top: [[3.0, -0.05], [2.4, 0.18], [-5.0, 0.18], [-5.6, 0.0]], bottom: [[3.0, -0.4], [2.4, -0.68], [-5.0, -0.66], [-5.6, -0.4]], plan: [[3.0, 0.08], [2.4, 0.34], [-5.0, 0.34], [-5.6, 0.12]], side: 1.72, round: 4, stations: 10 };
A['f-15e'] = { ...A['f-15d'], cls: 'multirole', bodies: [CFT_15] };

// ---------------------------------------------------------------- F-16 Fighting Falcon

// F-16A / C: the bubble canopy right at the nose with no frame, the big chin intake, curved strakes into a
// 40-degree wing with tip rails, one tall fin, low stabilators (15.06 x 9.96 x 4.88 m).
const VIPER: FixedWingSpec = {
  length: 15.06, span: 9.96, height: 4.88, bodyWidth: 1.6, bodyHeight: 1.6,
  fuselage: {
    top: [[7.53, -0.15], [6.6, 0.2], [5.6, 0.36], [4.2, 0.48], [2.8, 0.6], [1.0, 0.7], [-3, 0.62], [-6.2, 0.45], [-7.3, 0.4]],
    bottom: [[7.53, -0.2], [6.6, -0.35], [5.4, -0.45], [4.8, -0.95], [0, -0.9], [-4.5, -0.6], [-7.3, -0.4]],
    plan: [[7.53, 0.04], [6.6, 0.35], [5.0, 0.55], [3.5, 0.68], [0, 0.82], [-5, 0.7], [-7.3, 0.5]],
    round: [[7.5, 2.2], [4.8, 2.4], [3.5, 3.2], [-7.3, 2.4]],
    stations: 24,
  },
  bodies: [pod(0.4, -2.8, 0.08, 4.98, 0, 0.1)],
  wing: { x: -1.2, span: 9.96, rootChord: 5.0, tipChord: 1.2, sweep: 40, mount: 0 },
  wingPlan: [[4.4, 0], [3.8, 0.55], [2.4, 0.9], [1.0, 1.2], [-2.3, 4.85], [-3.5, 4.85], [-3.7, 1.2], [-3.9, 0]],
  tail: { kind: 'single', finHeight: 2.8, finChord: 3.3, tailSpan: 5.6, tailChord: 2.0, finBase: 0.5, planeUp: -0.15 },
  finPlan: [[-3.6, 0], [-6.8, 0], [-7.1, 2.85], [-6.0, 2.85]],
  tailPlan: [[-5.2, 0.6], [-5.4, 0.9], [-6.6, 2.8], [-7.6, 2.8], [-7.6, 0.6]],
  engines: { kind: 'internal', count: 1, diameter: 1.15 },
  canopy: { x: 4.3, length: 2.7, kind: 'bubble' },
  glass: [bubble(5.7, 2.9, 1.12, 0.36, 0.6, 0.4)],
};
const VIPER_TWO = tandem(5.7, 2.0, 1.08, 1.16, 0.36, 0.66, 0.4);
// Conformal tanks on the shoulders over the wing roots (block 52+, 60, 70): bulges either side of the spine.
const CFT_16: Outline = { top: [[1.8, 0.4], [1.1, 0.74], [-3.3, 0.74], [-4.5, 0.46]], bottom: [[1.8, 0.15], [-4.5, 0.15]], plan: [[1.8, 0.1], [1.0, 0.36], [-3.3, 0.36], [-4.5, 0.1]], side: 0.78, round: 3, stations: 10 };
A['f-16c'] = { ...VIPER, cls: 'multirole' };
A['f-16d'] = { ...VIPER, cls: 'multirole', canopy: { x: 3.9, length: 3.6, kind: 'tandem' }, glass: [VIPER_TWO] };
A['f-16c-cft'] = { ...VIPER, cls: 'multirole', bodies: [...VIPER.bodies!, CFT_16] };
// The two-seaters with the big dorsal spine from the canopy to the fin, and conformal tanks (F-16I Sufa, block 52+ D, block 60 F).
A['f-16d-spine'] = { ...VIPER, cls: 'multirole', canopy: { x: 3.9, length: 3.6, kind: 'tandem' }, glass: [VIPER_TWO], bodies: [...VIPER.bodies!, CFT_16, spine(2.1, -4.9, 0.66, 0.36, 0.3)] };

// ---------------------------------------------------------------- F-14 Tomcat

// The Tomcat as drawn in ./aircraft.ts, with its tandem canopy and the chin pod: one pod (TCS) on the A and B,
// the twin IRST and TCS pods side by side on the D.
const TOMCAT_FUSELAGE: Outline = { top: [[9.55, -0.1], [8.2, 0.3], [6.6, 0.5], [5.8, 0.56], [2.6, 0.62], [-2, 0.4], [-9.0, 0.25]], bottom: [[9.55, -0.15], [8.2, -0.45], [6.2, -0.62], [3, -0.6], [-2, -0.3], [-9.0, -0.15]], plan: [[9.55, 0.04], [8.2, 0.45], [6.2, 0.68], [4.6, 0.82], [3.0, 1.0], [-4, 0.9], [-9.0, 0.55]], round: 2.6, stations: 24 };
const TOMCAT: FixedWingSpec = {
  length: 19.1, span: 15.0, height: 4.88, bodyWidth: 4.6, bodyHeight: 1.6,
  fuselage: TOMCAT_FUSELAGE,
  bodies: [
    { top: [[4.6, 0.0], [-8.6, 0.1]], bottom: [[4.6, -1.05], [-2, -0.95], [-8.6, -0.65]], plan: [[4.6, 0.6], [-5, 0.66], [-8.6, 0.5]], side: 1.8, round: [[4.6, 8], [0, 3], [-8.6, 2.4]], stations: 14 },
    { top: [[3.0, 0.15], [-8.8, 0.12]], bottom: [[3.0, -0.15], [-8.8, -0.12]], plan: [[3.2, 0.5], [1.0, 2.2], [-8.8, 2.2]], round: 6, stations: 8 },
    pod(8.1, 7.0, 0.13, 0, -0.62, 0.3),
  ],
  wing: { x: -2.4, span: 15.0, rootChord: 3.4, tipChord: 1.4, sweep: 40, mount: 0.4 },
  wingPlan: [[6.0, 0], [5.5, 1.0], [-0.5, 3.3], [-4.0, 7.5], [-5.4, 7.5], [-3.8, 3.3], [-4.8, 2.4], [-4.8, 0]],
  tail: { kind: 'twin', finHeight: 3.2, finChord: 3.4, cant: 5, spacing: 3.6, tailSpan: 9.9, tailChord: 2.8, finBase: 0.15 },
  finPlan: [[-5.0, 0], [-8.4, 0], [-8.9, 3.2], [-7.6, 3.2]],
  tailPlan: [[-6.6, 1.6], [-6.8, 2.4], [-8.6, 4.95], [-9.7, 4.95], [-9.9, 1.6]],
  engines: { kind: 'internal', count: 2, diameter: 1.25, nozzles: [[-8.9, -1.8, -0.27], [-8.9, 1.8, -0.27]] },
  canopy: { x: 4.4, length: 4.2, kind: 'tandem' },
  glass: [tandem(6.6, 2.3, 1.12, 1.22, 0.54, 0.62, 0.48)],
};
A['f-14a'] = { ...TOMCAT, cls: 'fighter' };
A['f-14b'] = { ...TOMCAT, cls: 'fighter' };
A['f-14d'] = { ...TOMCAT, cls: 'fighter', bodies: [...TOMCAT.bodies!.slice(0, 2), pod(8.2, 6.9, 0.14, 0.17, -0.62, 0.3)] };

// ---------------------------------------------------------------- F-4 Phantom II

// The Phantom's common rear: the intakes beside the cockpit, the dogtoothed wing with upturned outer panels, the
// drooped tailplane, the swept fin, the humped tandem canopy. The nose tells the families apart: the Navy's blunt
// radome (B, N and the Air Force's C and D, 17.76 m), the same with no chin seeker on the J and S, the long slim nose
// over the gun on the E and F (19.2 m), the G's antenna fairings, the British K and M's deeper Spey rear.
function phantom(nose: 'navy' | 'navy-j' | 'gun' | 'wild-weasel' | 'spey'): FixedWingSpec & { cls: string } {
  const long = nose === 'gun' || nose === 'wild-weasel';
  const tip = long ? 9.6 : 8.16;
  const top: P2[] = long ? [[9.6, -0.08], [8.6, 0.22], [7.0, 0.45], [5.9, 0.58]] : [[8.16, -0.02], [7.6, 0.3], [6.6, 0.5], [5.9, 0.6]];
  const bottom: P2[] = long ? [[9.6, -0.12], [8.8, -0.36], [7.6, -0.6], [6.4, -0.66], [5.4, -0.66]] : [[8.16, -0.1], [7.6, -0.45], [6.6, -0.6], [5.4, -0.64]];
  const plan: P2[] = long ? [[9.6, 0.04], [8.6, 0.3], [7.0, 0.52], [5.4, 0.66]] : [[8.16, 0.05], [7.6, 0.42], [6.6, 0.58], [5.4, 0.66]];
  const spey = nose === 'spey';
  const bodies: Outline[] = [];
  if (nose === 'navy') bodies.push(pod(7.5, 6.7, 0.12, 0, -0.58, 0.4));
  if (nose === 'wild-weasel') bodies.push(pod(10.0, 7.2, 0.14, 0, -0.62, 0.2), pod(-6.6, -9.2, 0.16, 0, 3.55, 0.2));
  return {
    cls: 'fighter', length: tip + 9.6, span: 11.7, height: 5.0, bodyWidth: 2.7, bodyHeight: 1.7,
    fuselage: {
      top: [...top, [2, 0.62], [-2, 0.7], [-6, 0.55], [-9.3, 0.45]],
      bottom: [...bottom, [3.5, -0.86], [-2, spey ? -0.95 : -0.8], [-6, spey ? -0.62 : -0.45], [-9.3, spey ? -0.28 : -0.1]],
      plan: [...plan, [4.4, 0.7], [3.6, spey ? 1.42 : 1.3], [0, spey ? 1.45 : 1.35], [-5, spey ? 1.15 : 1.0], [-9.3, spey ? 0.62 : 0.5]],
      round: 3,
      stations: 26,
    },
    bodies,
    wing: { x: -1.4, span: 11.7, rootChord: 7.8, tipChord: 1.3, sweep: 45, mount: -0.3, dihedral: 4 },
    wingPlan: [[2.8, 0], [2.8, 1.3], [-1.6, 4.3], [-1.3, 4.35], [-3.0, 5.85], [-4.3, 5.85], [-5.0, 1.3], [-5.0, 0]],
    tail: { kind: 'single', finHeight: 2.8, finChord: 4.0, tailSpan: 5.6, tailChord: 2.0, finBase: 0.5, planeUp: 0.25 },
    finPlan: [[-4.6, 0], [-8.6, 0], [-9.5, 2.8], [-8.2, 2.8]],
    tailPlan: [[-7.6, 0.5], [-8.6, 2.8], [-9.6, 2.8], [-9.6, 0.5]],
    engines: { kind: 'internal', count: 2, diameter: spey ? 1.15 : 1.0 },
    canopy: { x: 3.8, length: 4.0, kind: 'tandem' },
    glass: [tandem(5.9, 1.9, 1.12, 1.22, 0.6, 0.66, 0.42)],
  };
}
A['f-4b'] = { ...phantom('navy'), cls: 'fighter' };
A['f-4j'] = { ...phantom('navy-j'), cls: 'fighter' };
A['f-4e'] = { ...phantom('gun'), cls: 'fighter' };
A['f-4g'] = { ...phantom('wild-weasel'), cls: 'sead' };
A['f-4k'] = { ...phantom('spey'), cls: 'fighter', length: 17.55 };

// ---------------------------------------------------------------- Flankers

// The Flanker: a slim drooping nose and humped cockpit, curved LERX from under the windscreen to the wing, two
// nacelles slung apart under it with the tunnel between, the long tail cone between the nozzles, fins and
// stabilators outboard on booms, wingtip rails (Su-27: 21.9 x 14.7 x 5.93 m).
interface FlankerOpts {
  length?: number;
  /** Where the tail cone ends and how thick it is there. */
  tail?: [number, number];
  canards?: boolean;
  seats?: 'one' | 'two';
  /** The fins' height (the two-seaters' and Su-30's are taller). */
  fin?: number;
  /** Long thrust-vectoring nozzles. */
  tvc?: boolean;
}
const FLANKER_NACELLE: Outline = { top: [[3.4, -0.08], [0, 0.0], [-8.4, 0.12]], bottom: [[3.4, -1.4], [-2, -1.25], [-8.4, -0.75]], plan: [[3.4, 0.62], [-5, 0.66], [-8.4, 0.5]], side: 1.4, round: [[3.4, 8], [-1, 4], [-8.4, 2.4]], stations: 14 };
function flanker(o: FlankerOpts): FixedWingSpec {
  const [tx, th] = o.tail ?? [-10.95, 0.16];
  const fh = o.fin ?? 3.4;
  const bodies: Outline[] = [FLANKER_NACELLE, pod(-2.4, -5.6, 0.08, 7.35, 0, 0.1)];
  if (o.tvc) bodies.push(pod(-8.0, -9.3, 0.5, 1.4, -0.3, 0.05));
  return {
    length: o.length ?? 21.9, span: 14.7, height: 5.93 + (fh - 3.4), bodyWidth: 2.0, bodyHeight: 1.6,
    fuselage: {
      top: [[10.95, -0.28], [9.6, 0.22], [8.0, 0.44], [7.1, 0.52], [4.0, 0.6], [2.4, 0.66], [0, 0.55], [-6, 0.35], [-8.6, 0.25], [tx, th]],
      bottom: [[10.95, -0.32], [9.6, -0.52], [7.6, -0.62], [3.4, -0.55], [0, -0.32], [-6, -0.2], [-8.6, -0.16], [tx, -th * 0.6]],
      plan: [[10.95, 0.04], [9.6, 0.42], [7.6, 0.62], [5.0, 0.72], [2.0, 0.85], [-1, 1.0], [-4, 1.3], [-7.6, 1.25], [-8.6, 0.5], [-8.8, th + 0.08], [tx, th]],
      round: [[10.9, 2.4], [0, 2.4], [-4, 4], [-8.6, 4], [-8.8, 2.4]],
      stations: 28,
    },
    bodies,
    wing: { x: -2.0, span: 14.7, rootChord: 6.6, tipChord: 1.4, sweep: 42, mount: 0.2 },
    wingPlan: [[6.4, 0], [5.8, 0.7], [4.2, 1.15], [2.5, 1.75], [1.1, 2.3], [-3.6, 7.3], [-5.0, 7.3], [-5.7, 2.4], [-5.8, 0]],
    canard: o.canards ? { x: 4.6, span: 6.4, chord: 1.5 } : undefined,
    tail: { kind: 'twin', finHeight: fh, finChord: 3.0, spacing: 4.3, tailSpan: 9.9, tailChord: 3.0, finBase: 0.15 },
    finPlan: [[-5.3, 0], [-9.1, 0], [-9.9, fh], [-8.7, fh]],
    tailPlan: [[-6.3, 0.9], [-6.4, 2.0], [-8.5, 4.95], [-9.6, 4.95], [-10.3, 2.2], [-10.3, 0.9]],
    engines: { kind: 'internal', count: 2, diameter: 1.2, nozzles: [[-8.6, -1.4, -0.32], [-8.6, 1.4, -0.32]] },
    canopy: o.seats === 'two' ? { x: 5.0, length: 4.2, kind: 'tandem' } : { x: 5.5, length: 3.2, kind: 'bubble' },
    glass: [o.seats === 'two' ? tandem(7.1, 2.8, 1.18, 1.42, 0.52, 0.66, 0.5) : bubble(7.1, 3.9, 1.25, 0.52, 0.62, 0.48)],
  };
}
A['su-27'] = { ...flanker({}), cls: 'fighter' };
// Su-30 (and the two-seat Su-27UB, the Su-30MKK and MK2, the J-16): the raised rear seat under a long canopy, taller fins, no canards.
A['su-30'] = { ...flanker({ seats: 'two', fin: 3.82 }), cls: 'multirole' };
// Su-30MKI, SM and MKM: the two-seater with canards and the long thrust-vectoring nozzles.
A['su-30mki'] = { ...flanker({ seats: 'two', fin: 3.82, canards: true, tvc: true }), cls: 'multirole' };
// Su-33 (and J-15): canards ahead of the LERX and the tail cone cut short for the deck (21.19 m).
A['su-33'] = { ...flanker({ length: 21.19, tail: [-10.25, 0.22], canards: true }), cls: 'fighter' };
// Su-35S: no canards, no dorsal airbrake, the tail cone shorter and thicker (estimate), thrust-vectoring nozzles.
A['su-35'] = { ...flanker({ tail: [-10.4, 0.3], tvc: true }), cls: 'fighter', span: 15.3 };
// Su-34: the flattened "platypus" nose, a wide side-by-side cockpit with a fat spine behind it, canards and a long
// thick tail cone (23.34 x 14.7 x 6.09 m).
A['su-34'] = {
  ...flanker({ canards: true }), cls: 'bomber', length: 23.34, height: 6.09, bodyWidth: 2.4,
  fuselage: {
    top: [[11.67, -0.22], [10.6, 0.08], [9.0, 0.38], [7.6, 0.62], [4.6, 0.72], [2.4, 0.92], [0, 0.75], [-6, 0.45], [-10, 0.34], [-11.67, 0.24]],
    bottom: [[11.67, -0.3], [10.6, -0.48], [9.0, -0.64], [7, -0.74], [3.4, -0.6], [0, -0.32], [-6, -0.2], [-11.67, -0.1]],
    plan: [[11.67, 0.3], [10.6, 0.66], [9.0, 0.86], [7, 0.98], [4.0, 1.02], [2, 1.0], [-1, 1.05], [-4, 1.3], [-7.6, 1.25], [-8.6, 0.6], [-9.2, 0.44], [-11.67, 0.34]],
    round: [[11.6, 4], [7, 3], [0, 2.6], [-4, 4], [-8.6, 4], [-9.2, 2.4]],
    stations: 28,
  },
  canard: { x: 4.4, span: 6.4, chord: 1.4 },
  canopy: { x: 6.2, length: 2.6, kind: 'framed' },
  glass: [sideBySide(7.6, 4.8, 1.2, 0.62, 0.74, 0.85)],
};
// Su-57: a flat chined body, the nacelles far apart under leading-edge flaps (LEVCON) with square intakes, a
// long tail cone between them, small canted all-moving fins and a diamond-edged wing (20.1 x 14.1 x 4.6 m).
A['su-57'] = {
  cls: 'fighter', length: 20.1, span: 14.1, height: 4.6, bodyWidth: 3.6, bodyHeight: 1.5,
  fuselage: { top: [[10.05, -0.1], [9, 0.2], [7.4, 0.42], [6.0, 0.48], [3, 0.55], [0, 0.45], [-6, 0.3], [-10.05, 0.12]], bottom: [[10.05, -0.14], [9, -0.35], [7.4, -0.48], [4.5, -0.5], [0, -0.35], [-10.05, -0.04]], plan: [[10.05, 0.04], [9, 0.42], [7.4, 0.62], [5.5, 0.78], [4.6, 1.5], [0, 1.85], [-5, 1.75], [-8.5, 0.6], [-10.05, 0.25]], round: [[10, 3], [5, 5], [-10, 4]], stations: 26 },
  bodies: [{ top: [[4.4, -0.1], [-8.4, 0.0]], bottom: [[4.4, -0.95], [-2, -0.9], [-8.4, -0.45]], plan: [[4.4, 0.55], [-5, 0.58], [-8.4, 0.5]], side: 1.55, round: [[4.4, 8], [-2, 5], [-8.4, 3]], stations: 14 }],
  wing: { x: -2.2, span: 14.1, rootChord: 7.4, tipChord: 1.2, sweep: 48, mount: 0.1 },
  wingPlan: [[5.6, 0], [5.4, 1.6], [4.6, 2.05], [3.0, 2.6], [-1.94, 7.05], [-3.1, 7.05], [-5.0, 2.6], [-6.0, 1.7], [-6.0, 0]],
  tail: { kind: 'twin', finHeight: 2.2, finChord: 3.2, cant: 26, spacing: 3.2, tailSpan: 9.9, tailChord: 2.8, finBase: 0.2 },
  finPlan: [[-4.6, 0], [-7.8, 0], [-8.6, 2.2], [-6.8, 2.2]],
  tailPlan: [[-6.4, 1.8], [-6.5, 2.6], [-8.6, 4.95], [-9.8, 4.95], [-10.1, 2.6], [-10.1, 1.8]],
  engines: { kind: 'internal', count: 2, diameter: 1.1, nozzles: [[-8.6, -1.55, -0.22], [-8.6, 1.55, -0.22]] },
  canopy: { x: 5.6, length: 3.4, kind: 'bubble' },
  glass: [bubble(7.4, 3.8, 1.12, 0.46, 0.55, 0.48)],
};

// ---------------------------------------------------------------- MiG-29 family

// MiG-29 (9-12): shorter than a Flanker, the LERX straight and sharp to the cockpit, nacelles under them with
// intakes slanting down, no tail cone, fins canted a little on the booms (17.32 x 11.36 x 4.73 m). The 9-13 adds
// the humped back; the SMT a much bigger hump running to the fins; the UB two seats; the K and M the bigger wing
// and the big hump; the MiG-35, M2 and KUB the two-seat K airframe.
interface FulcrumOpts {
  hump?: 'none' | 'small' | 'big';
  seats?: 'one' | 'two';
  bigWing?: boolean;
}
function fulcrum(o: FulcrumOpts): FixedWingSpec {
  const half = o.bigWing ? 6.0 : 5.68;
  const bodies: Outline[] = [{ top: [[2.4, -0.1], [0, 0.0], [-7.4, 0.1]], bottom: [[2.4, -1.25], [1.8, -1.2], [-2, -1.05], [-7.4, -0.6]], plan: [[2.4, 0.55], [-4, 0.62], [-7.4, 0.48]], side: 1.25, round: [[2.4, 8], [-1, 4], [-7.4, 2.4]], stations: 12 }];
  if (o.hump === 'small') bodies.push(spine(3.0, -2.6, 0.5, 0.18, 0.4));
  if (o.hump === 'big') bodies.push(spine(3.0, -5.8, 0.5, 0.42, 0.55));
  return {
    length: 17.32, span: half * 2, height: 4.73, bodyWidth: 1.8, bodyHeight: 1.5,
    fuselage: { top: [[8.66, -0.2], [7.5, 0.22], [6.2, 0.42], [5.7, 0.48], [3.0, 0.56], [1.5, 0.55], [0, 0.45], [-5, 0.3], [-7.6, 0.2]], bottom: [[8.66, -0.24], [7.5, -0.45], [5.8, -0.55], [2.2, -0.45], [0, -0.3], [-7.6, -0.1]], plan: [[8.66, 0.04], [7.5, 0.4], [5.8, 0.58], [3.6, 0.68], [0, 0.85], [-4, 1.15], [-7.0, 1.05], [-7.6, 0.7]], round: [[8.6, 2.4], [0, 2.4], [-4, 4], [-7.6, 4]], stations: 24 },
    bodies,
    wing: { x: -1.8, span: half * 2, rootChord: 5.4, tipChord: 1.3, sweep: 42, mount: 0.2 },
    wingPlan: [[5.8, 0], [5.2, 0.62], [1.2, 1.85], [-2.6, half - 0.28], [-3.2, half], [-4.0, half - 0.08], [-4.6, 1.9], [-4.8, 0]],
    tail: { kind: 'twin', finHeight: 2.9, finChord: 2.6, cant: 6, spacing: 3.8, tailSpan: 7.8, tailChord: 2.6, finBase: 0.1 },
    finPlan: [[-3.6, 0], [-4.4, 0.15], [-7.6, 0.15], [-8.2, 2.9], [-7.1, 2.9]],
    tailPlan: [[-5.0, 0.8], [-5.1, 1.9], [-6.9, 3.9], [-7.9, 3.9], [-8.6, 1.9], [-8.6, 0.8]],
    engines: { kind: 'internal', count: 2, diameter: 1.0, nozzles: [[-7.6, -1.25, -0.25], [-7.6, 1.25, -0.25]] },
    canopy: o.seats === 'two' ? { x: 4.2, length: 3.6, kind: 'tandem' } : { x: 4.3, length: 2.8, kind: 'bubble' },
    glass: [o.seats === 'two' ? tandem(6.0, 2.4, 1.1, 1.3, 0.44, 0.6, 0.42) : bubble(5.7, 2.9, 1.12, 0.48, 0.56, 0.42)],
  };
}
A['mig-29a'] = { ...fulcrum({}), cls: 'fighter' };
A['mig-29-9-13'] = { ...fulcrum({ hump: 'small' }), cls: 'fighter' };
A['mig-29smt'] = { ...fulcrum({ hump: 'big' }), cls: 'multirole' };
A['mig-29ub'] = { ...fulcrum({ seats: 'two' }), cls: 'trainer' };
A['mig-29k'] = { ...fulcrum({ hump: 'big', bigWing: true }), cls: 'multirole' };
A['mig-35'] = { ...fulcrum({ hump: 'big', bigWing: true, seats: 'two' }), cls: 'multirole' };

// ---------------------------------------------------------------- MiG-21 family

// MiG-21: a round tube with the nose intake and its shock cone, a tailed 57-degree delta. The F-13 is short with a
// small cone, a slim back and the narrow fin; the PF a bigger cone and a raised spine; the MF the broad fin; the
// bis the big humped spine; the UM two separate canopies (lengths without the probe; estimates for the PF and UM).
function fishbed(length: number, spineH: number, broadFin: boolean, cone: number, two = false): FixedWingSpec {
  const n = length / 2;
  const c = n - 3.6;
  return {
    length, span: 7.15, height: 4.1, bodyWidth: 1.35, bodyHeight: 1.35,
    fuselage: { top: [[n, 0.4], [n - 1.4, 0.58], [c + 0.4, 0.66], [c - (two ? 2.9 : 1.6), spineH * 0.96], [-2.5, spineH], [-4.6, spineH - 0.1], [-n + 0.3, 0.5]], bottom: [[n, -0.45], [n - 2.2, -0.62], [0, -0.65], [-n + 0.3, -0.5]], plan: [[n, cone + 0.12], [n - 1.2, 0.6], [3, 0.68], [-4, 0.65], [-n + 0.3, 0.55]], round: 2.1, stations: 22 },
    bodies: [{ top: [[n + 0.7, 0], [n - 0.1, cone]], bottom: [[n + 0.7, 0], [n - 0.1, -cone]], plan: [[n + 0.7, 0.02], [n - 0.1, cone]], round: 2, stations: 4 }],
    wing: { x: -1.4, span: 7.15, rootChord: 6.0, tipChord: 0.5, sweep: 57, mount: 0 },
    wingPlan: [[1.6, 0], [1.6, 0.6], [-3.5, 3.57], [-4.0, 3.57], [-4.4, 0.6], [-4.4, 0]],
    tail: { kind: 'single', finHeight: 2.5, finChord: 3.8, tailSpan: 3.7, tailChord: 1.4, finBase: 0.55 },
    finPlan: broadFin ? [[-2.6, 0], [-6.4, 0], [-7.1, 2.5], [-6.0, 2.5]] : [[-3.5, 0], [-6.4, 0], [-6.95, 2.45], [-6.2, 2.45]],
    tailPlan: [[-4.8, 0.5], [-5.6, 1.85], [-6.4, 1.85], [-6.6, 0.5]],
    engines: { kind: 'internal', count: 1, diameter: 1.0 },
    canopy: { x: c - 1.0, length: two ? 3.6 : 2.0, kind: two ? 'tandem' : 'framed' },
    glass: two ? [bubble(c + 0.4, c - 1.2, 1.0, 0.66, 0.68, 0.36), bubble(c - 1.3, c - 2.9, 1.06, 0.68, spineH, 0.36)] : [bubble(c + 0.4, c - 1.6, 1.0, 0.66, 0.68, 0.36)],
  };
}
A['mig-21f-13'] = { ...fishbed(13.46, 0.7, false, 0.3), cls: 'fighter' };
A['mig-21pf'] = { ...fishbed(14.1, 0.8, false, 0.36), cls: 'fighter' };
A['mig-21mf'] = { ...fishbed(14.7, 0.84, true, 0.38), cls: 'fighter' };
A['mig-21bis'] = { ...fishbed(14.7, 0.94, true, 0.38), cls: 'fighter' };
A['mig-21um'] = { ...fishbed(14.5, 0.84, true, 0.36, true), cls: 'trainer' };

// ---------------------------------------------------------------- MiG-23 and MiG-27

// MiG-23: square side intakes, the glove and swing wing (shown half swept), a big fin with a ventral fin. The MF's
// dorsal fillet runs far forward and its glove is plain; the MLD's fillet is cut short and its glove notched.
// The MiG-27 (and MiG-23BN) has the sloping "duck" nose with no radar (16.7 / 17.07 x 10.5 x 4.82 m).
function flogger(mld: boolean, duck: boolean): FixedWingSpec {
  return {
    length: duck ? 17.07 : 16.7, span: 10.5, height: 4.82, bodyWidth: 2.3, bodyHeight: 1.5,
    fuselage: duck
      ? { top: [[8.5, -0.25], [6.8, 0.15], [5.4, 0.42], [3.0, 0.62], [0, 0.74], [-6, 0.6], [-8.2, 0.5]], bottom: [[8.5, -0.3], [6.8, -0.5], [3.5, -0.7], [-4, -0.7], [-8.2, -0.4]], plan: [[8.5, 0.2], [6.8, 0.5], [5.0, 0.62], [3.8, 0.7], [3.2, 1.15], [-2, 1.1], [-5.5, 0.85], [-8.2, 0.6]], round: 3.5, stations: 22 }
      : { top: [[8.35, -0.08], [6.8, 0.3], [5.0, 0.48], [3.0, 0.62], [0, 0.72], [-6, 0.6], [-8.1, 0.5]], bottom: [[8.35, -0.1], [6.8, -0.4], [3.5, -0.7], [-4, -0.7], [-8.1, -0.4]], plan: [[8.35, 0.03], [6.8, 0.45], [5.0, 0.6], [3.8, 0.7], [3.2, 1.15], [-2, 1.1], [-5.5, 0.85], [-8.1, 0.6]], round: 3.5, stations: 22 },
    wing: { x: -1.6, span: 10.5, rootChord: 3.6, tipChord: 1.0, sweep: 45, mount: 0.6 },
    wingPlan: mld ? [[3.2, 0], [3.2, 1.1], [1.9, 1.55], [2.05, 1.62], [0.6, 2.0], [-2.6, 5.25], [-3.6, 5.25], [-2.2, 2.0], [-3.0, 1.1], [-3.0, 0]] : [[3.2, 0], [3.2, 1.1], [0.6, 2.0], [-2.6, 5.25], [-3.6, 5.25], [-2.2, 2.0], [-3.0, 1.1], [-3.0, 0]],
    tail: { kind: 'single', finHeight: 3.0, finChord: 4.0, tailSpan: 5.8, tailChord: 2.0, finBase: 0.6 },
    finPlan: mld ? [[-2.6, 0], [-7.6, 0], [-8.3, 3.0], [-6.8, 3.0], [-3.2, 0.35]] : [[-0.8, 0], [-7.6, 0], [-8.3, 3.0], [-6.8, 3.0], [-3.0, 0.5]],
    tailPlan: [[-5.4, 0.9], [-6.8, 2.9], [-7.9, 2.9], [-8.0, 0.9]],
    engines: { kind: 'internal', count: 1, diameter: 1.1 },
    canopy: { x: 3.8, length: 2.4, kind: 'framed' },
    glass: [bubble(duck ? 5.2 : 4.9, 2.6, duck ? 1.06 : 0.98, duck ? 0.46 : 0.48, 0.66, 0.4)],
  };
}
A['mig-23mf'] = { ...flogger(false, false), cls: 'fighter' };
A['mig-23mld'] = { ...flogger(true, false), cls: 'fighter' };
A['mig-27k'] = { ...flogger(true, true), cls: 'attack' };

export const JET_VARIANTS: SpecSet = { air: A, aliases: ALIASES };
