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
/** Names in data that the prefix match does not reach (lower case). */
const ALIASES: Record<string, string> = {
  'ef_2000_typhoon_aesa': 'eurofighter-typhoon',
  'typhoon t': 'eurofighter-typhoon-t',
  'eurofighter typhoon t': 'eurofighter-typhoon-t',
  'f_2a': 'f-2a',
  'f_2a_adtw': 'f-2a',
  'mirage_4000': 'mirage-4000',
  'j-15': 'su-33',
  'j_15': 'su-33',
  'j_15t': 'su-33',
  'j-15t': 'su-33',
  'j-16': 'su-30',
  'su-27ub': 'su-30',
  'su_27ub': 'su-30',
  'su-30mkk': 'su-30',
  'f-15b': 'f-15d',
  'f-15ex': 'f-15e',
  'f_15ex': 'f-15e',
  'f/a-18b': 'f-a-18d',
  'fa_18b': 'f-a-18d',
  'fa_18d': 'f-a-18d',
  'fa_18f': 'f-a-18f',
  'fa_18e': 'f-a-18e',
  'ea_18g': 'ea-18g',
  'f-16i': 'f-16d-spine',
  'f-16f': 'f-16d-spine',
  'f-16e': 'f-16c-cft',
  'mig-29m2': 'mig-35',
  'mig-29kub': 'mig-35',
  'mig_29m2': 'mig-35',
  'mig-29m': 'mig-29k',
  'mig-29 9-12': 'mig-29a',
  'mirage 2000n': 'mirage-2000d',
  'mirage 2000b': 'mirage-2000d',
  'mirage 2000d': 'mirage-2000d',
  'mirage_2000n': 'mirage-2000d',
  'mirage_2000b': 'mirage-2000d',
  'tornado ecr': 'tornado-ids',
  'tornado_ecr': 'tornado-ids',
  'f-4d': 'f-4b',
  'f-4n': 'f-4b',
  'f-4m': 'f-4k',
  'phantom fgr2': 'f-4k',
  'phantom fg1': 'f-4k',
  'phantom fgr.2': 'f-4k',
  'phantom fg.1': 'f-4k',
  'j-7': 'mig-21f-13',
  'j-7e': 'j-7e',
  'j-7g': 'j-7e',
  'mig-23bn': 'mig-27k',
};

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

/**
 * An intake trunk, a nacelle or a conformal body of boxy-to-round section, `side` out: its lip at `x0`, the full
 * section (`top`, `bottom`, `w` half wide) back to `xf`, then through `mid` stations (x, top, bottom, half width)
 * to its end. `rake` sets one lip back that far: positive, the lower lip (a raked box or caret intake, the top lip
 * forward); negative, the upper one (a chin scoop with its lower lip forward).
 */
function duct(x0: number, xf: number, top: number, bottom: number, w: number, side: number, mid: [number, number, number, number][], round: number | P2[] = 4, rake = 0): Outline {
  const lip = Math.abs(rake);
  const after = (i: number): P2[] => mid.map((m) => [m[0], m[i]]);
  return {
    top: rake < 0 ? [[x0, bottom + 0.06], [x0 - lip, top], [xf, top], ...after(1)] : [[x0, top], [xf, top], ...after(1)],
    bottom: rake > 0 ? [[x0, top - 0.06], [x0 - lip, bottom], [xf, bottom], ...after(2)] : [[x0, bottom], [xf, bottom], ...after(2)],
    plan: [[x0, w], [xf, w], ...after(3)],
    side: side || undefined,
    round,
    stations: 12,
  };
}

/**
 * A flat lens on the centre line: the thickness of a LERX, a strake or a blended wing root where it runs into
 * the fuselage, its edge at the planform `plan`, its top and bottom along the body.
 */
function lens(plan: P2[], top: P2[], bottom: P2[]): Outline {
  return { top, bottom, plan, round: 2, stations: 14 };
}

/** A thin upright plate `side` out: a splitter plate, a pylon (forward, up from x0 at the bottom back to x1). */
function plateBody(x0: number, x1: number, bottom: number, top: number, side: number, rake: number, t = 0.03): Outline {
  return { top: [[x0, bottom + 0.05], [x0 - rake, top], [x1, top]], bottom: [[x0, bottom], [x1, bottom]], plan: [[x0, t], [x1, t]], side: side || undefined, round: 8, stations: 4 };
}

/** A big engine nacelle with an open intake, `side` out with its axis at `up`: a bomber's pod engines. */
function bomberPod(x0: number, x1: number, r: number, side: number, up: number): Outline {
  return {
    top: [[x0, up + r * 0.85], [x0 - 0.6, up + r], [x1 + 1.0, up + r], [x1, up + r * 0.5]],
    bottom: [[x0, up - r * 0.85], [x0 - 0.6, up - r], [x1 + 1.0, up - r], [x1, up - r * 0.5]],
    plan: [[x0, r * 0.85], [x0 - 0.6, r], [x1 + 1.0, r], [x1, r * 0.5]],
    side,
    round: 2,
    stations: 8,
  };
}

// ---------------------------------------------------------------- F/A-18 Hornet and Super Hornet

// Legacy Hornet (A to D): the long narrow LERX curving out from under the windscreen to the wing, round-lipped
// D-shaped intakes straight up and down under them, a 27-degree wing with tip rails, two fins canted out 20 degrees
// and set well ahead of the stabilators (17.07 x 12.31 over the tip missiles x 4.66 m).
// Body (judged from a public 3-view; estimates): the nose 0.9 m deep at the radome's base, the windscreen's foot
// 0.35 m and the canopy's crown 1.25 m over the wing, the canopy's fairing running into a dorsal a metre up that
// slopes straight down to the tail; the belly 0.75 m down; the D-shaped intakes under the LERX where it meets the
// wing, 0.75 m wide and 1.1 m deep, 2.7 m over both; the fins 2.4 m tall.
// Side stations, depth from the belly or intake bottom to the top, canopy included (reference judged from the
// 3-view, estimates / figure), m: nose 1.0 / 1.05, cockpit 2.1-2.2 / 2.1, intake lip and wing root 1.9 / 1.93,
// behind the wing 1.55 / 1.59, nozzles 1.2 / 1.15; over the intakes 2.7 / 2.7 wide.
const HORNET: FixedWingSpec = {
  length: 17.07, span: 12.31, height: 4.66, bodyWidth: 2.2, bodyHeight: 1.6,
  fuselage: {
    top: [[8.535, -0.25], [7.8, 0.0], [6.6, 0.28], [5.5, 0.48], [4.0, 0.62], [1.7, 0.88], [1.2, 0.98], [-0.5, 0.86], [-3.7, 0.6], [-6.3, 0.38], [-8.3, 0.28]],
    bottom: [[8.535, -0.27], [7.8, -0.5], [6.6, -0.64], [5.0, -0.72], [2.0, -0.75], [-1.0, -0.78], [-5.0, -0.76], [-8.3, -0.62]],
    plan: [[8.535, 0.03], [7.8, 0.36], [6.6, 0.55], [5.5, 0.6], [3.5, 0.62], [1.0, 0.68], [-0.5, 0.8], [-3.0, 0.95], [-6.0, 0.98], [-8.3, 0.92]],
    round: [[8.5, 2.2], [5.0, 2.4], [1.0, 2.6], [-3.0, 3.4], [-8.3, 4]],
    stations: 28,
  },
  bodies: [
    // The D-shaped intakes straight up and down under the LERX, their trunks running back into the engine bays.
    duct(-0.5, -2.0, 0.08, -1.08, 0.37, 0.97, [[-5.5, 0.0, -1.0, 0.3], [-8.0, -0.1, -0.8, 0.12]], 2.6, 0.1),
    // The LERX thickening into the fuselage.
    lens([[5.9, 0.5], [5.5, 0.72], [5.0, 0.95], [4.4, 1.1], [3.0, 1.2], [1.5, 1.3], [0.2, 1.4], [-0.55, 1.47], [-2.5, 1.2]], [[5.9, 0.25], [4.0, 0.42], [1.0, 0.45], [-0.5, 0.42], [-2.5, 0.3]], [[5.9, 0.05], [4.0, -0.05], [1.0, -0.08], [-0.5, -0.05], [-2.5, 0.0]]),
    pod(-1.9, -4.9, 0.08, 5.95, 0.12, 0.1),
  ],
  wing: { x: -2.65, span: 11.43, rootChord: 4.1, tipChord: 1.68, sweep: 26.7, mount: 0.2 },
  wingPlan: [[6.0, 0], [5.9, 0.5], [5.5, 0.72], [5.0, 0.95], [4.4, 1.1], [3.0, 1.2], [1.5, 1.3], [0.2, 1.4], [-0.55, 1.47], [-2.69, 5.72], [-4.37, 5.72], [-4.7, 1.47], [-4.75, 0]],
  tail: { kind: 'twin', finHeight: 2.4, finChord: 2.9, cant: 22, spacing: 1.9, tailSpan: 6.58, tailChord: 2.4, finBase: 0.35 },
  finPlan: [[-3.4, 0], [-6.3, 0], [-6.65, 2.4], [-5.6, 2.4]],
  tailPlan: [[-4.9, 0.95], [-5.2, 1.25], [-7.85, 3.29], [-8.3, 3.29], [-8.5, 1.25], [-8.5, 0.95]],
  engines: { kind: 'internal', count: 2, diameter: 0.9, nozzles: [[-8.35, -0.48, -0.3], [-8.35, 0.48, -0.3]] },
  canopy: { x: 3.6, length: 3.75, kind: 'bubble' },
  glass: [bubble(5.5, 1.75, 1.42, 0.48, 0.88, 0.45)],
};
A['f-a-18c'] = { ...HORNET, cls: 'multirole' };
// The two-seat B and D: the same airframe, the canopy a metre longer over the second seat, which sits a little higher.
A['f-a-18d'] = { ...HORNET, cls: 'multirole', canopy: { x: 3.25, length: 4.5, kind: 'tandem' }, glass: [tandem(5.5, 1.0, 1.36, 1.46, 0.48, 0.92, 0.45)] };

// Super Hornet (E and F): a fifth larger - the fuselage longer and wider, the LERX broad with straight edges, the
// intakes rectangular carets raked back, the wing bigger with a dogtooth snag, bigger fins and stabilators
// (18.31 x 13.62 over the tip missiles x 4.88 m).
// Body (judged from public drawings; estimates): the Hornet's section grown a little and squarer, the LERX meeting
// the wing 2 m out, the rectangular intakes 0.8 m wide and 1.2 m deep with their lips raked back, 3 m over both.
// Side stations (reference judged from a public schematic, estimates / figure), m: nose 1.0 / 1.05, cockpit 2.0 /
// 2.1, intake lip 1.8 / 1.8, wing root 1.85 / 1.94, behind the wing 1.6 / 1.66, nozzles 1.2 / 1.17.
const SUPER_HORNET: FixedWingSpec = {
  length: 18.31, span: 13.62, height: 4.88, bodyWidth: 2.6, bodyHeight: 1.7,
  fuselage: {
    top: [[9.155, -0.25], [8.3, 0.0], [7.0, 0.3], [5.8, 0.5], [4.0, 0.66], [1.2, 0.92], [0.7, 1.02], [-1.0, 0.9], [-3.6, 0.66], [-6.6, 0.42], [-8.9, 0.3]],
    bottom: [[9.155, -0.27], [8.3, -0.52], [7.0, -0.68], [5.4, -0.76], [2.0, -0.8], [-1.0, -0.82], [-5.5, -0.8], [-8.9, -0.64]],
    plan: [[9.155, 0.03], [8.3, 0.36], [7.0, 0.56], [5.8, 0.62], [3.5, 0.66], [1.0, 0.72], [-0.5, 0.85], [-3.0, 1.02], [-6.0, 1.06], [-8.9, 0.98]],
    round: [[9.1, 2.0], [5.5, 2.6], [1.0, 2.8], [-3.0, 3.6], [-8.9, 4.2]],
    stations: 28,
  },
  bodies: [
    // The rectangular caret intakes, their lips raked back, under the broad LERX.
    duct(0.8, -2.0, 0.08, -1.05, 0.4, 1.1, [[-5.8, 0.0, -1.0, 0.32], [-8.4, -0.1, -0.84, 0.14]], [[0.8, 6], [-2.0, 5], [-8.4, 3]], 0.75),
    lens([[5.0, 0.45], [4.7, 0.5], [4.0, 0.85], [3.2, 1.3], [2.4, 1.55], [1.5, 1.8], [0.5, 1.95], [-0.25, 2.0], [-2.5, 1.6]], [[5.0, 0.25], [3.0, 0.44], [0.5, 0.48], [-2.5, 0.32]], [[5.0, 0.05], [3.0, -0.05], [0.5, -0.08], [-2.5, 0.0]]),
    pod(-1.8, -4.8, 0.08, 6.45, 0.12, 0.1),
  ],
  wing: { x: -2.45, span: 12.4, rootChord: 4.4, tipChord: 1.95, sweep: 29, mount: 0.2 },
  wingPlan: [[5.2, 0], [4.7, 0.5], [4.0, 0.85], [3.2, 1.3], [2.4, 1.55], [1.5, 1.8], [0.5, 1.95], [-0.25, 2.0], [-1.6, 4.4], [-1.4, 4.5], [-2.15, 6.2], [-4.1, 6.2], [-4.6, 2.0], [-4.65, 0]],
  tail: { kind: 'twin', finHeight: 2.65, finChord: 3.2, cant: 20, spacing: 2.1, tailSpan: 7.2, tailChord: 2.8, finBase: 0.38 },
  finPlan: [[-3.4, 0], [-6.6, 0], [-7.0, 2.65], [-5.85, 2.65]],
  tailPlan: [[-5.6, 1.0], [-5.9, 1.3], [-8.4, 3.6], [-9.0, 3.6], [-9.25, 1.3], [-9.25, 1.0]],
  engines: { kind: 'internal', count: 2, diameter: 0.95, nozzles: [[-8.7, -0.5, -0.3], [-8.7, 0.5, -0.3]] },
  canopy: { x: 3.9, length: 3.8, kind: 'bubble' },
  glass: [bubble(5.8, 2.0, 1.42, 0.5, 0.9, 0.47)],
};
A['f-a-18e'] = { ...SUPER_HORNET, cls: 'multirole' };
A['f-a-18f'] = { ...SUPER_HORNET, cls: 'multirole', canopy: { x: 3.4, length: 4.75, kind: 'tandem' }, glass: [tandem(5.8, 1.05, 1.36, 1.48, 0.5, 0.96, 0.47)] };
// EA-18G Growler: the two-seat F with fat ALQ-218 receiver pods on the wingtips in place of the missile rails.
A['ea-18g'] = { ...A['f-a-18f'], cls: 'ew', bodies: [...SUPER_HORNET.bodies!.slice(0, 2), pod(-1.2, -5.0, 0.2, 6.35, 0.12, 0.3)] };

// ---------------------------------------------------------------- F-15 Eagle and Strike Eagle

// The F-15's tall narrow cockpit section standing over the box intakes and the broad flat body behind them, the
// tall bubble canopy, a 45-degree wing with raked tips, twin upright fins on the engine booms (19.43 x 13.05 x
// 5.63 m). Body (judged from a public 3-view; estimates): the cockpit's sill 0.7 m and the canopy's crown 1.45 m
// over the wing, the belly 0.6 m under the axis; the intakes 0.9 m wide and 1.25 m deep, their top lips well ahead
// of the lower ones, 3.4 m over both, the trunks 3.7 m over both at the wing; the dorsal 1.2 m up behind the canopy,
// sloping down to the tail; the fins 2.85 m tall.
// Side stations (reference judged from the 3-view's side view, estimates / figure), m: windscreen 1.45 / 1.55,
// canopy 2.1 / 2.13, intake lip 1.9 / 1.77, wing root 1.62 / 1.68, mid-wing 1.53 / 1.58, fin root 1.25 / 1.26; over
// the intakes 3.4 / 3.4 wide. The intakes' lower lips run level with the belly; their raked top lips tell them.
const EAGLE: FixedWingSpec = {
  length: 19.43, span: 13.05, height: 5.63, bodyWidth: 2.9, bodyHeight: 1.7,
  fuselage: {
    top: [[9.715, -0.45], [8.8, 0.0], [7.25, 0.5], [6.65, 0.52], [4.5, 0.75], [3.0, 0.85], [1.5, 0.55], [-1.0, 0.35], [-5.0, 0.32], [-8.4, 0.3]],
    bottom: [[9.715, -0.47], [8.8, -0.65], [7.25, -0.72], [6.0, -0.78], [3.5, -0.8], [-4.0, -0.8], [-7.0, -0.78], [-8.4, -0.72]],
    plan: [[9.715, 0.03], [8.8, 0.42], [7.6, 0.62], [6.5, 0.68], [4.5, 0.68], [2.5, 0.72], [0.0, 0.85], [-3.0, 1.1], [-6.5, 1.3], [-8.4, 1.3]],
    round: [[9.7, 2.2], [5.0, 2.6], [0.0, 3.0], [-8.4, 3.5]],
    stations: 28,
  },
  bodies: [
    // The box intakes beside the cockpit, raked with the top lip forward, their trunks the body's flat sides back to the fin booms.
    duct(4.06, 2.0, 0.43, -0.8, 0.45, 1.25, [[0.3, 0.43, -0.82, 0.6], [-4.0, 0.43, -0.82, 0.6], [-8.0, 0.45, -0.7, 0.45]], [[4.0, 8], [0.0, 6], [-8.0, 3.5]], 1.1),
    // The narrow dorsal spine behind the canopy, over the broad flat engine bay.
    { top: [[3.4, 0.85], [2.6, 0.97], [0.0, 0.82], [-2.5, 0.62], [-5.1, 0.45], [-6.5, 0.35]], bottom: [[3.4, 0.3], [-6.5, 0.2]], plan: [[3.4, 0.5], [2.6, 0.55], [-2.5, 0.55], [-5.1, 0.45], [-6.5, 0.3]], round: 2.6, stations: 12 },
  ],
  // The wing's published 1 degree of anhedral.
  wing: { x: -2.55, span: 13.05, rootChord: 5.7, tipChord: 1.7, sweep: 45, mount: 0.63, dihedral: -1 },
  wingPlan: [[2.6, 0], [2.6, 1.2], [0.6, 1.86], [0.3, 2.0], [-3.75, 6.35], [-4.4, 6.52], [-5.8, 6.4], [-5.45, 2.0], [-5.5, 0]],
  tail: { kind: 'twin', finHeight: 2.85, finChord: 3.0, spacing: 3.2, tailSpan: 8.6, tailChord: 2.8, finBase: 0.45 },
  finPlan: [[-5.6, 0], [-9.0, 0], [-9.25, 2.85], [-7.9, 2.85], [-7.7, 2.6]],
  tailPlan: [[-6.6, 0.9], [-6.9, 1.55], [-7.25, 1.6], [-8.75, 4.3], [-9.65, 4.3], [-9.9, 1.6], [-9.9, 0.9]],
  engines: { kind: 'internal', count: 2, diameter: 1.15, nozzles: [[-8.4, -0.72, -0.2], [-8.4, 0.72, -0.2]] },
  canopy: { x: 5.0, length: 3.3, kind: 'bubble' },
  glass: [bubble(6.65, 3.4, 1.35, 0.52, 0.88, 0.52)],
};
A['f-15c'] = { ...EAGLE, cls: 'fighter' };
// F-15B / D: two seats under one long canopy, no conformal tanks.
A['f-15d'] = { ...EAGLE, cls: 'fighter', canopy: { x: 4.5, length: 4.35, kind: 'tandem' }, glass: [tandem(6.65, 2.3, 1.3, 1.38, 0.52, 0.95, 0.52)] };
// F-15E / EX: the two-seat canopy and the conformal fuel tanks along the intake trunks under the wing roots,
// widening the body ahead of the wing and from the front (0.6 m wide, a metre deep; estimate).
const CFT_15: Outline = { top: [[2.6, 0.25], [1.8, 0.38], [-5.0, 0.38], [-5.8, 0.2]], bottom: [[2.6, -0.35], [1.8, -0.75], [-5.0, -0.72], [-5.8, -0.4]], plan: [[2.6, 0.08], [1.8, 0.3], [-5.0, 0.3], [-5.8, 0.1]], side: 1.95, round: 4, stations: 10 };
A['f-15e'] = { ...A['f-15d'], cls: 'multirole', bodies: [...EAGLE.bodies!, CFT_15] };

// ---------------------------------------------------------------- F-16 Fighting Falcon

// F-16A / C: the bubble canopy right at the nose with no frame, the big chin intake, curved strakes into a
// 40-degree wing with tip rails, one tall fin, low stabilators (15.06 x 9.96 x 4.88 m). Body (judged from a public
// 3-view; estimates): the forward fuselage 1.25 m round behind the radome, the canopy's crown 1.2 m over the wing,
// a nearly level back 0.75 m up to the tail; the chin intake 1.4 m wide and 0.65 m deep, its duct the belly to
// the engine; the strakes blending thickly into the body; the fin 2.65 m tall on a dorsal fillet.
// Side stations (reference judged from the 3-view, estimates / figure), m: nose 0.8 / 0.84, cockpit 1.47 / 1.54,
// intake lip 2.0 / 2.14, wing root 1.8 / 1.81, mid-wing 1.8 / 1.76, behind the wing 1.57 / 1.51.
const VIPER: FixedWingSpec = {
  length: 15.06, span: 9.96, height: 4.88, bodyWidth: 1.6, bodyHeight: 1.6,
  fuselage: {
    top: [[7.53, -0.2], [6.8, 0.08], [5.6, 0.34], [4.88, 0.5], [3.0, 0.72], [1.3, 0.84], [0.0, 0.82], [-2.0, 0.74], [-4.4, 0.72], [-6.5, 0.68], [-7.3, 0.62]],
    bottom: [[7.53, -0.22], [6.8, -0.36], [5.6, -0.45], [4.0, -0.42], [3.2, -0.33], [2.4, -0.36], [1.0, -0.5], [-1.0, -0.6], [-4.0, -0.6], [-6.5, -0.55], [-7.3, -0.5]],
    plan: [[7.53, 0.03], [6.8, 0.3], [5.6, 0.5], [4.6, 0.6], [3.0, 0.64], [1.0, 0.72], [-1.5, 0.78], [-4.0, 0.75], [-6.2, 0.66], [-7.3, 0.6]],
    round: [[7.5, 2.2], [4.6, 2.4], [2.0, 2.8], [-7.3, 2.2]],
    stations: 26,
  },
  bodies: [
    // The chin intake, its upper lip a splitter standing off the fuselage, the duct running back as the belly.
    duct(3.13, 1.6, -0.45, -0.99, 0.7, 0, [[-1.0, -0.42, -0.99, 0.7], [-3.5, -0.4, -0.85, 0.62], [-6.5, -0.35, -0.6, 0.5]], [[3.1, 2.4], [-1.0, 3.0], [-6.5, 2.6]], 0.2),
    // The diverter between the splitter and the fuselage.
    { top: [[2.6, -0.3], [-1.0, -0.4]], bottom: [[2.6, -0.5], [-1.0, -0.5]], plan: [[2.6, 0.1], [1.6, 0.3], [-1.0, 0.5]], round: 4, stations: 4 },
    // The strakes and the wing root blending into the body.
    lens([[4.6, 0.55], [4.0, 0.62], [2.6, 0.95], [1.4, 1.2], [0.4, 1.45], [-1.5, 1.4], [-3.6, 1.2]], [[4.6, 0.25], [2.5, 0.4], [0.0, 0.45], [-3.6, 0.3]], [[4.6, -0.15], [2.5, -0.3], [0.0, -0.35], [-3.6, -0.25]]),
    pod(-1.2, -3.85, 0.09, 4.85, 0, 0.1),
  ],
  wing: { x: -1.6, span: 9.96, rootChord: 4.0, tipChord: 0.9, sweep: 40, mount: 0 },
  wingPlan: [[4.6, 0], [4.0, 0.62], [2.6, 0.95], [1.4, 1.2], [0.4, 1.45], [-2.65, 4.85], [-3.55, 4.85], [-3.6, 1.45], [-3.8, 0]],
  tail: { kind: 'single', finHeight: 2.65, finChord: 3.2, tailSpan: 5.6, tailChord: 2.0, finBase: 0.72, planeUp: -0.15 },
  finPlan: [[-2.0, 0], [-7.1, 0], [-7.7, 2.65], [-6.7, 2.65], [-4.4, 0.35]],
  tailPlan: [[-5.2, 0.6], [-5.4, 0.9], [-6.6, 2.8], [-7.6, 2.8], [-7.6, 0.6]],
  engines: { kind: 'internal', count: 1, diameter: 1.15 },
  canopy: { x: 3.1, length: 3.6, kind: 'bubble' },
  glass: [bubble(4.88, 1.28, 1.18, 0.5, 0.86, 0.42)],
};
const VIPER_TWO = tandem(4.88, 0.6, 1.14, 1.22, 0.5, 0.84, 0.42);
// Conformal tanks on the shoulders over the wing roots (block 52+, 60, 70): bulges either side of the spine.
const CFT_16: Outline = { top: [[1.6, 0.45], [1.0, 0.72], [-3.2, 0.72], [-4.4, 0.45]], bottom: [[1.6, 0.2], [-4.4, 0.2]], plan: [[1.6, 0.1], [1.0, 0.38], [-3.2, 0.38], [-4.4, 0.1]], side: 0.85, round: 3, stations: 10 };
A['f-16c'] = { ...VIPER, cls: 'multirole' };
A['f-16d'] = { ...VIPER, cls: 'multirole', canopy: { x: 2.75, length: 4.3, kind: 'tandem' }, glass: [VIPER_TWO] };
A['f-16c-cft'] = { ...VIPER, cls: 'multirole', bodies: [...VIPER.bodies!, CFT_16] };
// Mitsubishi F-2A: the F-16 layout grown - a longer nose, a broader wing of a quarter more area, a framed
// three-piece canopy, a deeper intake and bigger tailplanes (15.52 x 11.13 x 4.96 m).
A['f-2a'] = {
  ...VIPER, cls: 'multirole', length: 15.52, span: 11.13, height: 4.96,
  fuselage: {
    ...VIPER.fuselage!,
    top: [[7.76, -0.2], [6.9, 0.1], [5.7, 0.36], [4.95, 0.52], [3.0, 0.73], [1.3, 0.84], [0.0, 0.82], [-2.0, 0.74], [-4.4, 0.72], [-6.5, 0.68], [-7.3, 0.62]],
    bottom: [[7.76, -0.22], [6.9, -0.38], [5.7, -0.47], [4.0, -0.42], [3.2, -0.33], [2.4, -0.36], [1.0, -0.5], [-1.0, -0.6], [-4.0, -0.6], [-6.5, -0.55], [-7.3, -0.5]],
    plan: [[7.76, 0.03], [6.9, 0.32], [5.7, 0.52], [4.6, 0.62], [3.0, 0.66], [1.0, 0.74], [-1.5, 0.8], [-4.0, 0.76], [-6.2, 0.66], [-7.3, 0.6]],
  },
  bodies: [
    duct(3.2, 1.6, -0.45, -1.06, 0.74, 0, [[-1.0, -0.42, -1.04, 0.74], [-3.5, -0.4, -0.88, 0.64], [-6.5, -0.35, -0.6, 0.5]], [[3.1, 2.4], [-1.0, 3.0], [-6.5, 2.6]], 0.2),
    VIPER.bodies![1],
    lens([[4.6, 0.55], [4.0, 0.66], [2.6, 1.05], [1.4, 1.35], [0.6, 1.6], [-1.5, 1.5], [-3.8, 1.25]], [[4.6, 0.25], [2.5, 0.4], [0.0, 0.45], [-3.8, 0.3]], [[4.6, -0.15], [2.5, -0.3], [0.0, -0.35], [-3.8, -0.25]]),
    pod(-1.0, -3.6, 0.08, 5.55, 0, 0.1),
  ],
  wingPlan: [[4.6, 0], [4.0, 0.66], [2.6, 1.05], [1.4, 1.35], [0.6, 1.6], [-2.4, 5.45], [-3.5, 5.45], [-3.8, 1.6], [-3.95, 0]],
  tailPlan: [[-5.1, 0.6], [-5.3, 0.9], [-6.6, 3.1], [-7.7, 3.1], [-7.7, 0.6]],
  engines: { kind: 'internal', count: 1, diameter: 1.15, nozzles: [[-7.7, 0, 0]] },
  glass: [bubble(4.95, 1.3, 1.16, 0.52, 0.86, 0.42)],
};
// The two-seaters with the big dorsal spine from the canopy to the fin, and conformal tanks (F-16I Sufa, block 52+ D, block 60 F).
A['f-16d-spine'] = { ...VIPER, cls: 'multirole', canopy: { x: 2.75, length: 4.3, kind: 'tandem' }, glass: [VIPER_TWO], bodies: [...VIPER.bodies!, CFT_16, spine(0.8, -4.6, 0.75, 0.4, 0.32)] };

// ---------------------------------------------------------------- F-14 Tomcat

// The Tomcat: a long slim nose and the big tandem canopy over a cockpit section that runs back as a spine between
// two engine nacelles set far apart, the flat "pancake" body between them, the tall raked box intakes under the
// glove beside the rear cockpit, two fins on the nacelles and ventral fins under them; the chin pod: one (TCS) on
// the A and B, the twin IRST and TCS pods side by side on the D. Body (estimates): the canopy's crown 1.2 m up, the
// nacelles 4.3 m over both, their intakes 1.4 m deep and a metre wide, the fins 2.7 m tall.
// Side stations (reference judged from a public 3-view, estimates / figure), m: windscreen 1.35 / 1.37, cockpit
// 2.2 / 2.13, intake lip 2.05 / 2.13, glove 1.72 / 1.79, mid-body 1.57 / 1.67, before the fins 1.6 / 1.55; over the
// nacelles 4.5 / 4.3 wide.
const TOMCAT_FUSELAGE: Outline = {
  top: [[9.55, -0.4], [8.4, 0.0], [7.4, 0.24], [6.4, 0.42], [4.5, 0.68], [2.3, 0.85], [0.5, 0.72], [-2.0, 0.6], [-5.0, 0.55], [-8.0, 0.45], [-9.0, 0.3]],
  bottom: [[9.55, -0.45], [8.4, -0.78], [7.0, -0.95], [5.0, -1.0], [3.0, -0.98], [0.5, -0.6], [-2.0, -0.3], [-9.0, -0.15]],
  plan: [[9.55, 0.03], [8.4, 0.42], [7.0, 0.6], [5.5, 0.72], [3.5, 0.8], [1.0, 0.85], [-3.0, 0.8], [-6.0, 0.65], [-9.0, 0.5]],
  round: [[9.5, 2.2], [5.0, 2.6], [0.0, 3.0], [-9.0, 3.0]],
  stations: 26,
};
const TOMCAT: FixedWingSpec = {
  length: 19.1, span: 15.0, height: 4.88, bodyWidth: 4.6, bodyHeight: 1.6,
  fuselage: TOMCAT_FUSELAGE,
  bodies: [
    // The intakes, raked with the top lip forward, and the nacelles behind them.
    duct(3.0, 0.5, 0.42, -1.05, 0.5, 1.6, [[-2.0, 0.35, -1.03, 0.6], [-6.5, 0.32, -0.98, 0.6], [-8.6, 0.25, -0.8, 0.55]], [[3.0, 8], [0.5, 6], [-4.0, 3], [-8.6, 2.4]], 0.8),
    // The pancake between the nacelles.
    { top: [[3.2, 0.2], [1.0, 0.32], [-8.8, 0.3]], bottom: [[3.2, -0.1], [1.0, -0.15], [-8.8, -0.1]], plan: [[3.2, 0.5], [1.0, 1.4], [-8.8, 1.4]], round: 6, stations: 8 },
    // The ventral fins under the nacelles.
    { top: [[-5.4, -0.85], [-7.6, -0.72]], bottom: [[-5.4, -0.9], [-6.4, -1.45], [-7.6, -1.45]], plan: [[-5.4, 0.04], [-7.6, 0.04]], side: 1.45, round: 8, stations: 4 },
    pod(8.1, 7.0, 0.13, 0, -0.85, 0.3),
  ],
  wing: { x: -2.4, span: 15.0, rootChord: 3.4, tipChord: 1.4, sweep: 40, mount: 0.4 },
  wingPlan: [[6.0, 0], [5.5, 1.0], [-0.2, 3.0], [-3.6, 3.0], [-4.8, 2.4], [-4.8, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
  tail: { kind: 'twin', finHeight: 2.75, finChord: 3.4, cant: 5, spacing: 3.5, tailSpan: 9.9, tailChord: 2.8, finBase: 0.3 },
  finPlan: [[-5.0, 0], [-8.4, 0], [-8.9, 2.75], [-7.6, 2.75]],
  tailPlan: [[-6.6, 1.6], [-6.8, 2.4], [-8.6, 4.95], [-9.7, 4.95], [-9.9, 1.6]],
  engines: { kind: 'internal', count: 2, diameter: 1.25, nozzles: [[-8.9, -1.6, -0.28], [-8.9, 1.6, -0.28]] },
  canopy: { x: 4.45, length: 4.3, kind: 'tandem' },
  glass: [tandem(6.4, 2.3, 1.1, 1.2, 0.42, 0.85, 0.5)],
};
A['f-14a'] = { ...TOMCAT, cls: 'fighter' };
A['f-14b'] = { ...TOMCAT, cls: 'fighter' };
A['f-14d'] = { ...TOMCAT, cls: 'fighter', bodies: [...TOMCAT.bodies!.slice(0, 3), pod(8.2, 6.9, 0.14, 0.17, -0.85, 0.3)] };

// ---------------------------------------------------------------- F-4 Phantom II

// The Phantom's common rear: the tall intakes beside the cockpit with their splitter plates standing off the
// fuselage, the level spine from the canopy to the fin, the engines' nozzles under the fuselage at the wing's
// trailing edge and the slim tail boom over them, the dogtoothed wing with upturned outer panels, the drooped
// tailplane, the swept fin, the humped tandem canopy. The nose tells the families apart: the Navy's blunt radome (B,
// N and the Air Force's C and D, 17.76 m), the same with no chin seeker on the J and S, the long slim nose over the
// gun on the E and F (19.2 m), the G's antenna fairings, the British K and M's deeper, wider Spey rear. Body (judged
// from public 3-views and the manual's heights; estimates): the spine 1.35 m and the rear canopy 1.4 m over the
// axis, the belly 0.55 m under it; the intakes 0.65 m wide and 1.4 m deep, 2.6 m over both.
// Side stations, F-4B (reference from the F-4C manual's heights over the ground / figure), m: windscreen 1.5 /
// 1.69, front cockpit and intake lip 2.15 / 2.35, rear cockpit 1.92 / 1.97, wing 1.91 / 1.98, nozzles 1.89 / 1.96,
// tail 1.35 / 1.45; over the intakes 2.6 / 2.6 wide.
function phantom(nose: 'navy' | 'navy-j' | 'gun' | 'wild-weasel' | 'spey'): FixedWingSpec & { cls: string } {
  const long = nose === 'gun' || nose === 'wild-weasel';
  const tip = long ? 9.6 : 8.16;
  const top: P2[] = long ? [[9.6, -0.3], [8.8, 0.0], [7.6, 0.35], [6.5, 0.5]] : [[8.16, -0.26], [7.4, 0.15], [6.5, 0.42]];
  const bottom: P2[] = long ? [[9.6, -0.33], [8.8, -0.55], [7.6, -0.72], [6.5, -0.78]] : [[8.16, -0.3], [7.4, -0.62], [6.5, -0.75]];
  const plan: P2[] = long ? [[9.6, 0.03], [8.8, 0.3], [7.6, 0.46], [6.5, 0.52]] : [[8.16, 0.03], [7.4, 0.36], [6.5, 0.5]];
  const spey = nose === 'spey';
  const bodies: Outline[] = [
    // The intakes and their trunks, and the splitter plates standing off the fuselage ahead of them.
    duct(3.75, 3.0, 0.75, -0.95, spey ? 0.36 : 0.33, spey ? 1.0 : 0.97, [[1.5, 0.72, -0.66, spey ? 0.36 : 0.33], [-3.0, 0.6, -0.65, spey ? 0.36 : 0.33], [-5.4, 0.3, spey ? -0.72 : -0.62, 0.3]], [[3.75, 4], [-5.4, 3]]),
    plateBody(4.2, 2.8, -0.65, 0.78, 0.6, 0.3),
  ];
  if (nose === 'navy') bodies.push(pod(7.4, 6.6, 0.12, 0, -0.74, 0.4));
  if (nose === 'gun') bodies.push(pod(9.4, 6.2, 0.16, 0, -0.62, 0.12));
  if (nose === 'wild-weasel') bodies.push(pod(9.0, 7.0, 0.14, 0, -0.7, 0.25), pod(-7.8, -9.6, 0.16, 0, 3.1, 0.25));
  return {
    cls: 'fighter', length: tip + 9.6, span: 11.7, height: 5.0, bodyWidth: 2.7, bodyHeight: 1.7,
    fuselage: {
      top: [...top, [5.66, 0.6], [4.0, 0.85], [2.26, 1.15], [0.0, 1.32], [-2.5, 1.36], [-4.5, 1.3], [-7.0, 1.22], [-9.0, 1.1], [-9.6, 0.85]],
      bottom: [...bottom, [5.0, -0.78], [3.0, -0.62], [0.0, -0.55], [-3.0, spey ? -0.62 : -0.55], [-5.7, spey ? -0.72 : -0.6], [-7.0, spey ? -0.55 : -0.45], [-9.6, -0.35]],
      plan: [...plan, [5.0, 0.58], [3.0, 0.62], [0.0, 0.7], [-3.0, spey ? 0.82 : 0.75], [-5.7, spey ? 0.82 : 0.72], [-7.5, 0.45], [-9.6, 0.25]],
      round: [[tip, 2.2], [3.0, 2.6], [-5.7, 3.0], [-9.6, 2.4]],
      stations: 28,
    },
    bodies,
    wing: { x: -1.4, span: 11.7, rootChord: 7.8, tipChord: 1.3, sweep: 45, mount: -0.3, outerDihedral: { at: 4.3, deg: 12 } },
    wingPlan: [[2.8, 0], [2.8, 1.3], [-1.6, 4.3], [-1.3, 4.35], [-3.0, 5.85], [-4.3, 5.85], [-5.0, 1.3], [-5.0, 0]],
    tail: { kind: 'single', finHeight: 1.9, finChord: 4.7, tailSpan: 5.6, tailChord: 2.0, finBase: 1.15, planeUp: 0.6, planeDihedral: -23 },
    finPlan: [[-4.5, 0], [-9.2, 0], [-9.45, 1.88], [-8.0, 1.88]],
    tailPlan: [[-7.6, 0.5], [-8.6, 2.8], [-9.6, 2.8], [-9.6, 0.5]],
    engines: { kind: 'internal', count: 2, diameter: spey ? 1.1 : 0.95, nozzles: [[-5.7, -0.6, -0.25], [-5.7, 0.6, -0.25]] },
    canopy: { x: 3.95, length: 3.4, kind: 'tandem' },
    glass: [tandem(5.66, 2.26, 1.08, 1.41, 0.6, 1.15, 0.45)],
  };
}
A['f-4b'] = { ...phantom('navy'), cls: 'fighter' };
A['f-4j'] = { ...phantom('navy-j'), cls: 'fighter' };
A['f-4e'] = { ...phantom('gun'), cls: 'fighter' };
A['f-4g'] = { ...phantom('wild-weasel'), cls: 'sead' };
A['f-4k'] = { ...phantom('spey'), cls: 'fighter', length: 17.55 };

// ---------------------------------------------------------------- F-22, F-35

// F-22: the chined nose and the long frameless bubble, the raked caret intakes beside the cockpit, the broad flat
// body back to the 2-D nozzles, the 42-degree wing meeting the chine well aft, the canted fins. Body (judged from a
// public 3-view; estimates): the canopy's crown 1.25 m and the back 0.8 m over the wing, the intakes 0.9 m wide and
// 1.15 m deep with their lips swept back, 3.6 m over both; the fins 2.7 m tall.
// Side stations (reference judged from the 3-view, estimates / figure), m: windscreen 1.48 / 1.65, canopy 2.16 /
// 1.98, intake lip 1.84 / 1.81, mid-body 1.78 / 1.71, fin root 1.39 / 1.45; over the intakes 3.6 / 3.6 wide.
const RAPTOR: FixedWingSpec = {
  length: 18.92, span: 13.56, height: 5.08, bodyWidth: 3.4, bodyHeight: 1.6,
  fuselage: {
    top: [[9.46, -0.02], [8.4, 0.3], [7.2, 0.55], [6.4, 0.66], [4.0, 0.95], [2.5, 1.02], [0.0, 0.98], [-3.0, 0.88], [-6.0, 0.7], [-9.1, 0.45]],
    bottom: [[9.46, -0.05], [8.4, -0.3], [7.2, -0.45], [5.5, -0.55], [3.0, -0.6], [0.0, -0.62], [-4.0, -0.6], [-7.0, -0.4], [-9.1, -0.2]],
    plan: [[9.46, 0.03], [8.4, 0.5], [7.2, 0.78], [5.5, 0.92], [3.5, 0.98], [0.0, 1.1], [-4.0, 1.2], [-7.0, 1.15], [-9.1, 1.0]],
    round: [[9.4, 1.6], [5.5, 2.0], [2.0, 3.5], [-9.1, 5]],
    stations: 28,
  },
  bodies: [
    // The caret intakes, their lips swept back, and the trunks as the body's flat sides.
    duct(4.5, 2.5, 0.35, -0.8, 0.45, 1.33, [[0.0, 0.3, -0.8, 0.5], [-5.0, 0.3, -0.7, 0.45], [-8.5, 0.35, -0.3, 0.35]], [[4.5, 6], [0.0, 5], [-8.5, 4]], 1.3),
    // The chines from the nose to the wing.
    lens([[8.8, 0.3], [7.0, 0.9], [5.0, 1.2], [3.6, 1.45], [0.3, 1.95], [-3.0, 1.8]], [[8.8, 0.05], [5.0, 0.2], [0.3, 0.3], [-3.0, 0.3]], [[8.8, -0.05], [5.0, -0.1], [0.3, -0.1], [-3.0, 0.0]]),
  ],
  wing: { x: -2.8, span: 13.56, rootChord: 6.2, tipChord: 1.1, sweep: 42, mount: 0.3 },
  wingPlan: [[3.6, 0], [3.6, 1.8], [0.3, 2.0], [-4.3, 6.78], [-5.4, 6.78], [-5.9, 2.0], [-5.9, 0]],
  tail: { kind: 'twin', finHeight: 2.7, finChord: 3.9, cant: 28, spacing: 3.2, tailSpan: 8.8, tailChord: 2.4, finBase: 0.55 },
  finPlan: [[-3.8, 0], [-7.75, 0], [-7.3, 2.7], [-4.9, 2.7]],
  tailPlan: [[-6.8, 1.2], [-8.4, 4.4], [-9.8, 4.4], [-10.0, 1.2]],
  engines: { kind: 'internal', count: 2, diameter: 1.1, nozzles: [[-9.0, -0.62, 0.12], [-9.0, 0.62, 0.12]] },
  canopy: { x: 5.3, length: 3.4, kind: 'bubble' },
  glass: [bubble(6.8, 3.6, 1.45, 0.62, 0.98, 0.5)],
};
A['f-22'] = { ...RAPTOR, cls: 'fighter' };

// F-35A: the F-22's family look on a deeper, shorter single-engined body (15.67 x 10.7 x 4.38 m). F-35B: the lift
// fan's doors in a raised back behind the cockpit, a canopy ending sooner (15.61 m). F-35C: the bigger wing with
// folding tips and bigger tail surfaces (15.7 x 13.1 x 4.48 m). Body (judged from a public 3-view; estimates): the
// deep body, its back 1.15 m up behind the canopy and its belly a metre down; the bumped caret intakes 0.75 m wide
// and 1.4 m deep, 3 m over both; the fins 1.9 m tall.
// Side stations, F-35A (reference judged from the 3-view, estimates / figure), m: windscreen 1.68 / 1.65, canopy
// 2.07 / 2.0, intake lip 2.14 / 1.95, mid-body 2.15 / 2.06, fin root 1.93 / 1.89, nozzle 1.0 / 1.19; over the
// intakes 3.0 / 3.0 wide.
function lightning(kind: 'a' | 'b' | 'c'): FixedWingSpec {
  const c = kind === 'c';
  const half = c ? 6.55 : 5.35;
  const fh = c ? 2.05 : 1.9;
  return {
    length: kind === 'b' ? 15.61 : c ? 15.7 : 15.67, span: half * 2, height: c ? 4.48 : 4.38, bodyWidth: 3.2, bodyHeight: 1.8,
    fuselage: {
      top: [[7.83, 0.0], [7.0, 0.3], [6.0, 0.55], [5.8, 0.6], [4.0, 0.92], [3.0, 1.12], [1.0, 1.17], [-2.0, 1.12], [-4.0, 1.0], [-6.0, 0.75], [-7.5, 0.4]],
      bottom: [[7.83, -0.02], [7.0, -0.3], [6.0, -0.52], [4.0, -0.68], [3.0, -0.8], [1.0, -0.95], [-3.0, -0.95], [-5.5, -0.75], [-7.5, -0.6]],
      plan: [[7.83, 0.03], [7.0, 0.38], [6.0, 0.6], [4.5, 0.8], [3.0, 0.95], [0.0, 1.2], [-3.0, 1.25], [-5.5, 1.0], [-7.5, 0.7]],
      round: [[7.8, 1.8], [5.0, 2.4], [2.0, 3.4], [-7.5, 3.0]],
      stations: 28,
    },
    bodies: [
      // The caret intakes with their bumps, beside and behind the cockpit.
      duct(3.6, 2.4, 0.78, -0.62, 0.38, 1.12, [[0.0, 0.7, -0.75, 0.38], [-4.0, 0.5, -0.7, 0.3]], [[3.6, 5], [0.0, 4], [-4.0, 3]], 1.0),
      lens([[7.4, 0.3], [6.0, 0.75], [4.5, 1.05], [3.6, 1.4], [0.4, 1.75], [-3.0, 1.6]], [[7.4, 0.08], [4.5, 0.25], [0.4, 0.32], [-3.0, 0.3]], [[7.4, -0.05], [4.5, -0.12], [0.4, -0.12], [-3.0, 0.0]]),
      ...(kind === 'b' ? [spine(3.4, -0.4, 1.05, 0.22, 0.75)] : []),
    ],
    wing: { x: -1.7, span: half * 2, rootChord: 4.4, tipChord: c ? 1.7 : 1.4, sweep: 34, mount: 0.3 },
    wingPlan: c ? [[2.6, 0], [2.6, 1.4], [0.4, 1.75], [-2.3, 6.55], [-4.0, 6.55], [-4.4, 1.6], [-4.4, 0]] : [[2.6, 0], [2.6, 1.4], [0.4, 1.75], [-1.85, 5.35], [-3.25, 5.35], [-4.0, 1.6], [-4.0, 0]],
    tail: { kind: 'twin', finHeight: fh, finChord: 2.8, cant: 25, spacing: 2.6, tailSpan: c ? 7.6 : 6.6, tailChord: 2.2, finBase: 0.7 },
    finPlan: c ? [[-3.6, 0], [-6.7, 0], [-7.3, fh], [-5.7, fh]] : [[-3.8, 0], [-6.6, 0], [-7.2, fh], [-5.7, fh]],
    tailPlan: c ? [[-5.0, 0.8], [-6.5, 3.8], [-7.8, 3.8], [-8.0, 0.8]] : [[-5.2, 0.8], [-6.5, 3.3], [-7.6, 3.3], [-7.9, 0.8]],
    engines: { kind: 'internal', count: 1, diameter: 1.2, nozzles: [[-7.6, 0, -0.1]] },
    canopy: { x: 4.5, length: 2.6, kind: 'bubble' },
    glass: [kind === 'b' ? bubble(5.83, 3.5, 1.35, 0.6, 1.08, 0.46) : bubble(5.83, 3.23, 1.35, 0.6, 1.1, 0.46)],
  };
}
A['f-35a'] = { ...lightning('a'), cls: 'multirole' };
A['f-35b'] = { ...lightning('b'), cls: 'multirole' };
A['f-35c'] = { ...lightning('c'), cls: 'multirole' };

// ---------------------------------------------------------------- stealth: F-117, J-20

// F-117A: a faceted pyramid of a body on a 67-degree arrow wing, the notched trailing edge, the canted V tail, the
// faceted canopy on the peak, the gridded intakes on the flanks (20.08 x 13.2 x 3.78 m).
// Side stations (reference judged from a public 3-view, estimates / figure), m: nose 1.13 / 1.16, cockpit 1.85 /
// 1.93, intakes 1.64 / 1.69, mid-body 1.43 / 1.41.
A['f-117a'] = {
  cls: 'attack', length: 20.08, span: 13.2, height: 3.78, bodyWidth: 3.8, bodyHeight: 1.5,
  // The body a faceted pyramid, its peak at the cockpit (round 1: a diamond section), over a flat belly; the gridded
  // intakes on its upper flanks behind the cockpit (estimates).
  fuselage: { top: [[10.04, -0.05], [7.0, 0.85], [5.4, 1.3], [4.0, 1.35], [0, 1.0], [-6, 0.65], [-10.04, 0.15]], bottom: [[10.04, -0.1], [6, -0.45], [0, -0.55], [-8, -0.35], [-10.04, -0.12]], plan: [[10.04, 0.05], [6, 0.9], [3, 1.5], [0, 1.9], [-6, 1.6], [-8.5, 1.3], [-10.04, 0.7]], round: 1.1, stations: 22 },
  bodies: [
    { top: [[9.0, -0.05], [-9.6, -0.05]], bottom: [[9.0, -0.15], [6.0, -0.42], [0, -0.5], [-8, -0.32], [-9.6, -0.15]], plan: [[9.0, 0.2], [6, 0.85], [3, 1.4], [0, 1.8], [-6, 1.5], [-9.6, 0.9]], round: 6, stations: 14 },
    duct(2.4, 1.2, 0.72, 0.12, 0.3, 1.2, [[-0.5, 0.6, 0.1, 0.28]], 8),
  ],
  wing: { x: -2.4, span: 13.2, rootChord: 12, tipChord: 1.5, sweep: 67.5, mount: -0.3 },
  wingPlan: [[8.6, 0], [-5.9, 6.6], [-7.4, 6.6], [-6.2, 3.6], [-8.6, 2.0], [-10.04, 0.5], [-10.04, 0]],
  tail: { kind: 'v', tailSpan: 0, tailChord: 0, finHeight: 3.0, finChord: 3.0, finBase: 0.6 },
  finPlan: [[-5.6, 0], [-8.6, 0], [-9.6, 3.0], [-8.2, 3.0]],
  engines: { kind: 'internal', count: 2, diameter: 0.6, nozzles: [[-9.6, -1.0, 0.1], [-9.6, 1.0, 0.1]] },
  canopy: { x: 5.2, length: 2.4, kind: 'framed' },
  glass: [{ ...bubble(6.5, 4.0, 1.5, 1.0, 1.3, 0.5), round: 6 }],
};
// ---------------------------------------------------------------- bombers

// B-52H: a long slab-sided fuselage, the stepped cockpit, a shoulder wing swept 35 degrees with the eight engines in
// four paired pods and small tanks near the tips, the tall fin (cut short on the G and H) and a broad tailplane
// (48.5 x 56.39 x 12.4 m).
// Side stations (reference judged from a dimensioned 3-view, estimates / figure), m: fuselage 3.56 / 3.56 deep, 3.0
// / 2.9 wide; pods 10.2 and 17.9 m out.
A['b-52h'] = {
  cls: 'bomber', length: 48.5, span: 56.39, height: 12.4, bodyWidth: 2.9, bodyHeight: 3.4,
  // Body (judged from a public 3-view; estimates): 3 m wide and 3.7 m deep; the paired engine pods hung on swept
  // pylons almost wholly ahead of the wing, 10.2 and 17.9 m out, their axes 1.2 m under it.
  fuselage: { top: [[24.25, -0.4], [22.6, 0.9], [21.4, 1.3], [19.4, 1.55], [10, 1.6], [-15, 1.5], [-22, 1.0], [-24.25, 0.6]], bottom: [[24.25, -0.6], [22.5, -1.6], [18, -2.0], [0, -2.05], [-15, -1.75], [-22, -0.7], [-24.25, 0.2]], plan: [[24.25, 0.2], [22.5, 1.1], [19, 1.5], [-15, 1.45], [-22, 0.8], [-24.25, 0.4]], round: 3.2, stations: 26 },
  bodies: [
    ...[[10.2, 4.8], [17.9, -0.6]].flatMap(([s, x0]) => [
      ...[-0.62, 0.62].map((d) => bomberPod(x0, x0 - 5.1, 0.58, s + d, 0.16)),
      plateBody(x0 - 1.6, x0 - 4.9, 0.5, 1.3, s, 1.2, 0.12),
    ]),
    pod(-9.0, -13.4, 0.45, 23.2, 0.9, 0.25),
  ],
  wing: { x: 0.75, span: 56.39, rootChord: 10.5, tipChord: 2.5, sweep: 35, mount: 1 },
  wingPlan: [[6, 0], [6, 1.4], [-12.8, 28.2], [-15.3, 28.2], [-4.5, 1.4], [-4.5, 0]],
  tail: { kind: 'single', finHeight: 6.0, finChord: 8.0, tailSpan: 15.4, tailChord: 4.0, finBase: 1.4, planeUp: 0.4 },
  finPlan: [[-15, 0], [-22.8, 0], [-24.4, 6.0], [-20.6, 6.0]],
  tailPlan: [[-17.5, 0], [-19.8, 7.7], [-22.2, 7.7], [-23.6, 0]],
  canopy: { x: 20.5, length: 2.0, kind: 'airliner' },
  glass: [sideBySide(21.6, 19.6, 1.85, 1.15, 1.5, 1.0)],
};
// B-1B: a blended body with the small canard vanes at the nose, the swing wing out of a long glove (shown at
// 25 degrees, its cruise sweep; ./swing.ts), two paired engine nacelles under the glove, the tall fin with the tailplane low on it
// (44.5 x 41.8 spread / 24.1 swept x 10.4 m).
// Side stations (reference judged from a small public 3-view, estimates / figure), m: fuselage 2.4-3.1 / 2.8; the
// nacelles' bottom 1.2-1.6 / 1.17 under the fuselage's.
A['b-1b'] = {
  cls: 'bomber', length: 44.5, span: 33.0, height: 10.4, bodyWidth: 4.4, bodyHeight: 2.9,
  fuselage: { top: [[22.25, -0.3], [20.5, 0.6], [18.6, 1.0], [16.4, 1.35], [12, 1.45], [0, 1.4], [-12, 1.3], [-18, 1.0], [-22.25, 0.5]], bottom: [[22.25, -0.4], [20, -1.1], [15, -1.4], [0, -1.45], [-12, -1.2], [-22.25, -0.2]], plan: [[22.25, 0.1], [20, 0.9], [16, 1.35], [10, 1.5], [6, 2.2], [-4, 3.6], [-10, 2.6], [-16, 1.3], [-22.25, 0.6]], round: [[22, 2.4], [10, 2.6], [0, 6], [-16, 4], [-22, 2.4]], stations: 28 },
  // The paired nacelles under the glove, their intakes raked, running back past the glove to the nozzles (estimates).
  bodies: [duct(1.0, -1.0, 0.3, -2.6, 1.25, 3.1, [[-8.0, 0.25, -2.5, 1.2], [-11.0, 0.0, -2.0, 1.0]], [[1.0, 8], [-8.0, 5], [-11.0, 3]], 0.8)],
  wing: { x: -2.0, span: 33.0, rootChord: 6.5, tipChord: 2.3, sweep: 40, mount: 0.4 },
  wingPlan: [[8, 0], [8, 2.2], [-0.9, 6.6], [-5.2, 6.6], [-6, 4], [-6, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
  canard: { x: 18.2, span: 4.2, chord: 0.9 },
  tail: { kind: 'single', finHeight: 6.4, finChord: 7.8, tailSpan: 13.7, tailChord: 3.6, finBase: 1.2, planeUp: 1.9 },
  finPlan: [[-14, 0], [-21.8, 0], [-22.8, 6.4], [-19.4, 6.4]],
  tailPlan: [[-17.8, 0], [-19.5, 6.85], [-21.2, 6.85], [-22.2, 0]],
  engines: { kind: 'internal', count: 4, diameter: 0.95, nozzles: [[-11.3, -3.7, -1.0], [-11.3, -2.5, -1.0], [-11.3, 2.5, -1.0], [-11.3, 3.7, -1.0]] },
  canopy: { x: 17, length: 1.6, kind: 'framed' },
  glass: [sideBySide(17.8, 16.2, 1.65, 1.05, 1.4, 0.9)],
};
// ---------------------------------------------------------------- V-22 Osprey

// V-22: a boxy fuselage with sponsons, the high straight wing with an engine nacelle at each tip tilted up into
// rotors (shown hovering), the H tail with its two fins, the cockpit glazing in the blunt nose
// (17.48 x 25.78 over the rotors x 6.73 m; rotors 11.6 m).
// Side stations (reference judged from a public line drawing, estimates / figure), m: cabin 2.64 / 2.49 deep, 4.5 /
// 4.4 wide over the sponsons.
A['v-22-osprey'] = {
  cls: 'tiltrotor', length: 17.48, span: 14.0, height: 6.73, bodyWidth: 2.4, bodyHeight: 2.6,
  fuselage: { top: [[8.74, -0.35], [8.0, 0.35], [6.6, 0.95], [5.2, 1.2], [-3, 1.25], [-6.6, 1.0], [-8.74, 0.85]], bottom: [[8.74, -0.55], [8.0, -1.05], [6.0, -1.3], [-3.6, -1.3], [-6.0, -0.6], [-8.74, 0.35]], plan: [[8.74, 0.2], [8.0, 0.75], [6.0, 1.15], [-4, 1.2], [-6.6, 0.8], [-8.74, 0.35]], round: 4, stations: 22 },
  bodies: [{ top: [[2.8, -0.3], [2.0, -0.2], [-2.2, -0.2], [-2.8, -0.35]], bottom: [[2.8, -1.2], [-2.8, -1.25]], plan: [[2.8, 0.2], [2.1, 0.5], [-2.1, 0.5], [-2.8, 0.2]], side: 1.7, round: 4, stations: 8 }],
  wing: { x: 0.0, span: 14.0, rootChord: 2.6, tipChord: 2.4, sweep: 6, mount: 1 },
  wingPlan: [[1.3, 0], [1.1, 7.0], [-1.3, 7.0], [-1.3, 0]],
  tail: { kind: 'h', finHeight: 2.2, finChord: 1.8, spacing: 5.6, tailSpan: 5.6, tailChord: 1.4, planeUp: 1.1 },
  finPlan: [[-6.9, 0], [-8.6, 0], [-8.8, 2.2], [-7.4, 2.2]],
  tailPlan: [[-7.0, 0], [-7.2, 2.8], [-8.5, 2.8], [-8.6, 0]],
  engines: { kind: 'wing-props', count: 2, diameter: 1.4, at: [1.0], up: true, length: 5.0 },
  propeller: { diameter: 11.6, blades: 3 },
  canopy: { x: 6.5, length: 2, kind: 'airliner' },
  glass: [{ ...bubble(8.2, 6.2, 0.98, 0.2, 1.05, 0.95), round: 3 }],
};

export const JET_VARIANTS: SpecSet = { air: A, aliases: ALIASES };
