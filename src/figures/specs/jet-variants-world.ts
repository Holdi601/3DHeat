/**
 * Jet variants of the Soviet and Russian, Chinese and European air forces, drawn from their own outlines,
 * as ./jet-variants.ts draws the American ones: each variant whose silhouette differs - seats, canopy,
 * intakes, LERX, humps and spines, canards, nose, fins, size - as a figure of its own.
 *
 * Length, span and height are published values. The outlines are judged from the general shape of the real
 * aircraft (estimates, not traced from any drawing or game model). Coordinates: forward from the aircraft's
 * middle, out from the centre line, up from the fuselage axis; metres.
 */

import type { Named, SpecSet } from './index';
import type { FixedWingSpec } from '../air';
import type { Outline, P2 } from '../parts';
import { bubble, pod, sideBySide, spine, tandem } from './jet-variants';

const A: Named<FixedWingSpec> = {};

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
// Measured against a published 3-view (estimates; heights from the nose tip, depth from the lowest point of the body
// or nacelle to the top of the spine or canopy):
//   station              3-view          figure
//   nose (5 %)           0.95 deep       0.95
//   cockpit (25 %)       2.3, canopy top +1.8 over the nose tip      2.3, +1.8
//   intake lip (40-50 %) upper lip 40 %, lower lip 49 %, 1.45 under the nose tip   the same
//   wing root (55 %)     2.35            2.35
//   nacelles             1.5 wide, 1.5 deep, 3.0 apart              the same
// The nacelle boxes hang under the LERX behind the cockpit, their mouths raked back from the upper lip, running
// straight and flat-bottomed back to the round engine bays and the nozzles (estimates).
const FLANKER_NACELLE: Outline = {
  top: [[2.2, 0.04], [-2, 0.08], [-6, 0.24], [-8.4, 0.3]],
  bottom: [[2.2, -0.06], [0.1, -1.45], [-2, -1.46], [-5, -1.36], [-8.4, -0.95]],
  plan: [[2.2, 0.72], [-2, 0.75], [-6, 0.72], [-8.4, 0.64]],
  side: 1.5, round: [[2.2, 10], [-1, 7], [-5.5, 2.6]], stations: 16,
};
// The LERX's thick root: the flat, blended centre body widening from under the windscreen to the wing (estimate).
// The ventral fins under the tail booms (estimate).
const FLANKER_VENTRAL: Outline = { top: [[-4.4, 0.0], [-7.8, 0.0]], bottom: [[-4.4, -0.05], [-5.6, -1.55], [-7.2, -1.6], [-7.8, -0.1]], plan: [[-4.4, 0.04], [-7.8, 0.04]], side: 2.05, round: 8, stations: 6 };
const FLANKER_LERX: Outline = { top: [[6.6, 0.3], [3.4, 0.36], [0, 0.34], [-4, 0.28]], bottom: [[6.6, 0.0], [3.4, -0.1], [0, -0.14], [-4, -0.1]], plan: [[6.6, 0.4], [4.2, 1.2], [2.5, 1.8], [0.4, 2.3], [-4, 2.3]], round: 8, stations: 12 };
function flanker(o: FlankerOpts): FixedWingSpec {
  const [tx, th] = o.tail ?? [-10.95, 0.24];
  const fh = o.fin ?? 3.4;
  const two = o.seats === 'two';
  const bodies: Outline[] = [FLANKER_NACELLE, FLANKER_LERX, FLANKER_VENTRAL, pod(-2.4, -5.6, 0.08, 7.35, 0.13, 0.1)];
  if (o.tvc) bodies.push(pod(-8.0, -9.3, 0.52, 1.4, -0.32, 0.05));
  return {
    length: o.length ?? 21.9, span: 14.7, height: 5.93 + (fh - 3.4), bodyWidth: 2.0, bodyHeight: 1.6,
    // The drooped radome (about 0.95 m at its base), the cockpit section standing high over the nose, the tall
    // humped spine behind the canopy falling to the tail (higher behind a second seat), the tunnel floor between the
    // nacelles (estimates).
    fuselage: {
      top: [[10.95, -0.15], [9.85, 0.32], [8.6, 0.66], [7.0, 0.95], [3.3, two ? 1.56 : 1.48], [1.1, two ? 1.3 : 1.2], [-1.1, 0.88], [-3.3, 0.52], [-6, 0.38], [-8.6, 0.28], [tx, th * 0.4]],
      bottom: [[10.95, -0.2], [9.85, -0.62], [7.7, -0.73], [5.5, -0.64], [3.3, -0.48], [1.4, -0.5], [-2, -0.5], [-6, -0.4], [-8.6, -0.4], [tx, -th * 1.4]],
      plan: [[10.95, 0.04], [10.2, 0.32], [9.4, 0.44], [8.6, 0.52], [7.5, 0.6], [6.0, 0.68], [4.4, 0.72], [2.0, 0.82], [-1, 1.0], [-4, 1.25], [-7.6, 1.2], [-8.6, 0.5], [-8.8, th + 0.1], [tx, th]],
      round: [[10.9, 2.2], [4.4, 2.4], [1.0, 2.6], [-4, 3.4], [-8.6, 4], [-8.8, 2.4]],
      stations: 30,
    },
    bodies,
    wing: { x: -2.0, span: 14.7, rootChord: 6.6, tipChord: 1.4, sweep: 42, mount: 0.2 },
    wingPlan: [[6.4, 0], [5.8, 0.7], [4.2, 1.15], [2.5, 1.75], [1.1, 2.3], [-3.6, 7.3], [-5.0, 7.3], [-5.7, 2.4], [-5.8, 0]],
    canard: o.canards ? { x: 4.6, span: 6.4, chord: 1.5 } : undefined,
    tail: { kind: 'twin', finHeight: fh, finChord: 3.0, spacing: 4.3, tailSpan: 9.9, tailChord: 3.0, finBase: 0.15 },
    finPlan: [[-5.3, 0], [-9.1, 0], [-9.9, fh], [-8.7, fh]],
    tailPlan: [[-6.3, 0.9], [-6.4, 2.0], [-8.5, 4.95], [-9.6, 4.95], [-10.3, 2.2], [-10.3, 0.9]],
    engines: { kind: 'internal', count: 2, diameter: 1.2, nozzles: [[-8.6, -1.4, -0.32], [-8.6, 1.4, -0.32]] },
    canopy: two ? { x: 5.0, length: 4.6, kind: 'tandem' } : { x: 5.5, length: 3.6, kind: 'bubble' },
    glass: [two ? tandem(7.1, 2.4, 1.64, 1.84, 0.95, 1.5, 0.54) : bubble(7.0, 3.2, 1.7, 0.95, 1.46, 0.52)],
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
  // Measured against a published 3-view (estimates; its side view scaled to the Flanker nacelles it shares): the
  // probe 1.5 m ahead of the radome, the nose top sloping straight up to the windscreen 3.1 m behind the radome tip,
  // canopy top and spine 3.0 m over the nacelle floor, the nose 2.2 m wide at the windscreen, the tail cone 0.6 m
  // deep; the figure matches within 0.05 m. The duck-bill radome, flat and wide with sharp chines, the deep armoured
  // cockpit tub, the fat spine falling into the long thick tail cone (estimates).
  fuselage: {
    top: [[10.17, -0.5], [7.04, 0.38], [5.6, 1.18], [3.0, 1.58], [1.17, 1.38], [-1.17, 0.84], [-3.5, 0.5], [-8.6, 0.46], [-9.3, 0.5], [-11.67, 0.4]],
    bottom: [[10.17, -0.64], [8.77, -0.78], [3.0, -0.78], [1.0, -0.6], [-6, -0.42], [-8.6, -0.3], [-9.3, -0.2], [-11.67, -0.12]],
    plan: [[10.17, 0.3], [9.2, 0.6], [7.0, 1.05], [5.0, 1.1], [2, 1.02], [-1, 1.05], [-4, 1.3], [-7.6, 1.25], [-8.6, 0.62], [-9.2, 0.48], [-11.67, 0.36]],
    round: [[10.1, 5], [8.0, 3.4], [4.0, 3], [-1, 4], [-8.6, 4], [-9.2, 2.6]],
    stations: 30,
  },
  bodies: [...flanker({}).bodies!, pod(11.67, 10.0, 0.05, 0, -0.57, 0.05)],
  canard: { x: 4.4, span: 6.4, chord: 1.4 },
  canopy: { x: 5.5, length: 3.1, kind: 'framed' },
  glass: [sideBySide(5.7, 3.4, 1.62, 1.14, 1.56, 0.92)],
};
// Su-57: a flat chined body, the nacelles far apart under leading-edge flaps (LEVCON) with square intakes, a
// long tail cone between them, small canted all-moving fins and a diamond-edged wing (20.1 x 14.1 x 4.6 m).
A['su-57'] = {
  cls: 'fighter', length: 20.1, span: 14.1, height: 4.6, bodyWidth: 3.6, bodyHeight: 1.5,
  // Measured against a published 3-view of the T-50 (estimates; heights from the radome tip): canopy top +1.52,
  // spine +1.2 behind it, intakes' upper lips 6.1 m and lower lips 7.9 m behind the radome tip, nacelle floor -0.9,
  // 4.2 m over both nacelles; the figure matches within 0.1 m. A chined nose, the cockpit, the wide flat centre body
  // over the tandem weapons bays (estimates).
  fuselage: { top: [[10.05, -0.12], [9, 0.22], [7.3, 0.86], [4.25, 1.08], [-1.55, 0.68], [-7.6, 0.48], [-10.05, 0.2]], bottom: [[10.05, -0.18], [9, -0.36], [7.6, -0.42], [5.6, -0.46], [3.6, -0.5], [2, -0.55], [-4, -0.55], [-8.4, -0.3], [-10.05, -0.08]], plan: [[10.05, 0.04], [9, 0.44], [7.6, 0.64], [6.0, 0.8], [5.0, 1.3], [3.6, 1.7], [0, 1.85], [-5, 1.75], [-8.5, 0.6], [-10.05, 0.25]], round: [[10, 3.2], [7.6, 3.6], [5, 5], [-10, 4]], stations: 28 },
  // The square intakes under the LEVCON, raked back from the upper lip, the nacelles flat-sided to the nozzles (estimates).
  bodies: [{ top: [[3.95, -0.06], [-2, 0.04], [-8.4, 0.16]], bottom: [[3.95, -0.16], [1.8, -0.92], [-2, -0.92], [-5.5, -0.82], [-8.4, -0.6]], plan: [[3.95, 0.58], [-5, 0.6], [-8.4, 0.52]], side: 1.52, round: [[3.95, 10], [-2, 6], [-7, 2.8]], stations: 16 }],
  wing: { x: -2.2, span: 14.1, rootChord: 7.4, tipChord: 1.2, sweep: 48, mount: 0.1 },
  wingPlan: [[5.6, 0], [5.4, 1.6], [4.6, 2.05], [3.0, 2.6], [-1.94, 7.05], [-3.1, 7.05], [-5.0, 2.6], [-6.0, 1.7], [-6.0, 0]],
  tail: { kind: 'twin', finHeight: 2.2, finChord: 3.2, cant: 26, spacing: 3.2, tailSpan: 9.9, tailChord: 2.8, finBase: 0.2 },
  finPlan: [[-4.6, 0], [-7.8, 0], [-8.6, 2.2], [-6.8, 2.2]],
  tailPlan: [[-6.4, 1.8], [-6.5, 2.6], [-8.6, 4.95], [-9.8, 4.95], [-10.1, 2.6], [-10.1, 1.8]],
  engines: { kind: 'internal', count: 2, diameter: 1.1, nozzles: [[-8.6, -1.55, -0.22], [-8.6, 1.55, -0.22]] },
  canopy: { x: 5.6, length: 3.4, kind: 'bubble' },
  glass: [bubble(7.3, 4.25, 1.4, 0.86, 1.08, 0.5)],
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
// Measured against a published 3-view (estimates; heights from the radome tip):
//   station              3-view                          figure
//   nose probe           1.3 m ahead of the radome         the same
//   cockpit              canopy top +1.55, belly -0.2      the same
//   intake lip           upper lip 39 %, lower lip 46 % of the length, 0.8 under the radome tip   the same
//   wing root            1.75 deep                         1.8
//   nacelles             1.0 wide, 2.0 apart at the intakes, nozzles 1.75 apart                   the same
// The wedge intakes hang under the LERX, the mouth raked back from the upper lip to the low (drooping) lower lip,
// the nacelle floor rising gently back to the nozzles (estimates).
const FULCRUM_NACELLE: Outline = {
  top: [[2.0, -0.02], [-2, 0.04], [-5.5, 0.16], [-7.0, 0.2]],
  bottom: [[2.0, -0.12], [0.7, -0.94], [-1.4, -0.96], [-4.5, -0.84], [-7.0, -0.62]],
  plan: [[2.0, 0.48], [-2, 0.5], [-5, 0.5], [-7.0, 0.48]],
  side: 0.98, round: [[2.0, 10], [-1, 7], [-5, 2.6]], stations: 16,
};
// The LERX's thick root, the flat centre body widening from the windscreen to the wing (estimate).
const FULCRUM_LERX: Outline = { top: [[4.3, 0.3], [2.0, 0.34], [-0.3, 0.32], [-4.0, 0.26]], bottom: [[4.3, 0.02], [2.0, -0.06], [-0.3, -0.1], [-4.0, -0.08]], plan: [[4.3, 0.4], [2.0, 1.0], [-0.3, 1.6], [-4.0, 1.62]], round: 8, stations: 12 };
function fulcrum(o: FulcrumOpts): FixedWingSpec {
  const half = o.bigWing ? 6.0 : 5.68;
  const two = o.seats === 'two';
  // The nose probe, then the radome from 1.3 m behind the tip of the published length.
  const bodies: Outline[] = [FULCRUM_NACELLE, FULCRUM_LERX, pod(8.66, 7.2, 0.05, 0, -0.14, 0.05)];
  // The 9-13's fuel hump behind the canopy to the wing's trailing edge; the SMT's, K's and M2's big hump to the fins.
  if (o.hump === 'small') bodies.push(spine(2.3, -3.6, 0.5, 0.78, 0.42));
  if (o.hump === 'big') bodies.push(spine(two ? 1.8 : 2.4, -6.6, 0.3, 1.06, 0.55));
  return {
    length: 17.32, span: half * 2, height: 4.73, bodyWidth: 1.8, bodyHeight: 1.5,
    // A pointed radome about 0.9 m at its base, the slim cockpit section standing over it, the spine falling from the
    // canopy to the fins, the tunnel floor between the nacelles and the flat beaver tail between the nozzles (estimates).
    fuselage: {
      top: [[7.36, -0.14], [6.4, 0.34], [5.4, 0.62], [4.5, 0.77], [two ? 1.4 : 1.9, two ? 1.2 : 1.16], [0.05, 0.98], [-1.66, 0.77], [-3.25, 0.48], [-7.0, 0.26], [-7.6, 0.2]],
      bottom: [[7.36, -0.2], [6.4, -0.34], [5.4, -0.36], [4.4, -0.32], [2.6, -0.26], [1.0, -0.36], [-2, -0.36], [-7.0, -0.2], [-7.6, -0.14]],
      plan: [[7.36, 0.04], [6.4, 0.3], [5.4, 0.42], [4.4, 0.48], [2.4, 0.52], [0, 0.66], [-4, 0.8], [-7.0, 0.66], [-7.6, 0.5]],
      round: [[7.3, 2.2], [4.4, 2.4], [1.0, 2.8], [-2, 3.6], [-7.6, 4]],
      stations: 26,
    },
    bodies,
    wing: { x: -2.6, span: half * 2, rootChord: 5.4, tipChord: 1.3, sweep: 42, mount: 0.2 },
    wingPlan: [[4.3, 0], [4.3, 0.45], [-0.3, 1.63], [-3.8, half - 0.2], [-4.1, half], [-4.95, half - 0.05], [-5.05, 1.6], [-5.1, 0]],
    tail: { kind: 'twin', finHeight: 2.9, finChord: 2.6, cant: 6, spacing: 3.4, tailSpan: 7.8, tailChord: 2.6, finBase: 0.1 },
    finPlan: [[-3.3, 0], [-4.1, 0.15], [-7.05, 0.15], [-7.4, 2.9], [-6.5, 2.9]],
    tailPlan: [[-5.0, 0.8], [-5.3, 1.9], [-7.0, 3.8], [-7.9, 3.8], [-8.6, 1.9], [-8.6, 0.8]],
    engines: { kind: 'internal', count: 2, diameter: 1.0, nozzles: [[-7.2, -0.9, -0.2], [-7.2, 0.9, -0.2]] },
    canopy: two ? { x: 3.2, length: 3.6, kind: 'tandem' } : { x: 3.3, length: 2.7, kind: 'bubble' },
    glass: [two ? tandem(4.9, 1.3, 1.38, 1.54, 0.74, 1.2, 0.44) : bubble(4.5, 1.8, 1.44, 0.77, 1.16, 0.44)],
  };
}
A['mig-29a'] = { ...fulcrum({}), cls: 'fighter' };
A['mig-29-9-13'] = { ...fulcrum({ hump: 'small' }), cls: 'fighter' };
A['mig-29smt'] = { ...fulcrum({ hump: 'big' }), cls: 'multirole' };
A['mig-29ub'] = { ...fulcrum({ seats: 'two' }), cls: 'trainer' };
A['mig-29k'] = { ...fulcrum({ hump: 'big', bigWing: true }), cls: 'multirole' };
A['mig-35'] = { ...fulcrum({ hump: 'big', bigWing: true, seats: 'two' }), cls: 'multirole' };

// ---------------------------------------------------------------- MiG-21 family

// MiG-21: a round tube with the nose intake and its shock cone, a tailed 57-degree delta, a ventral fin under the
// tail. The F-13 is short with a small cone, a slim spine and the narrow fin; the PF a bigger cone and a raised spine;
// the MF the broad fin and a fuller spine; the bis the big humped spine level with the canopy; the UM two separate
// canopies (lengths without the probe; estimates for the PF and UM). No 3-view to measure was found: the tube is
// 1.3 m across round the nose intake, the canopy and the bis's spine about 0.4 m over it (estimates).
function fishbed(length: number, spineH: number, broadFin: boolean, cone: number, two = false): FixedWingSpec {
  const n = length / 2;
  const c = n - 3.6;
  // The intake lip's radius (the cone fills most of it), the cone sticking out ahead of the lip (estimates).
  const ri = cone + 0.1;
  const back = c - (two ? 2.9 : 1.6);
  return {
    length, span: 7.15, height: 4.1, bodyWidth: 1.35, bodyHeight: 1.35,
    fuselage: {
      top: [[n, ri], [n - 1.2, ri + 0.14], [n - 2.4, 0.6], [c + 0.4, 0.66], [-4.6, 0.62], [-n + 0.3, 0.5]],
      bottom: [[n, -ri], [n - 1.2, -ri - 0.14], [n - 2.6, -0.62], [0, -0.66], [-4, -0.64], [-n + 0.3, -0.5]],
      plan: [[n, ri], [n - 1.2, ri + 0.14], [n - 2.6, 0.64], [0, 0.68], [-4, 0.66], [-n + 0.3, 0.55]],
      round: 2.1, stations: 22,
    },
    bodies: [
      { top: [[n + 0.45 + cone, 0], [n - 0.1, cone]], bottom: [[n + 0.45 + cone, 0], [n - 0.1, -cone]], plan: [[n + 0.45 + cone, 0.02], [n - 0.1, cone]], round: 2, stations: 5 },
      // The dorsal spine from the canopy back to the fin: narrow and low on the F-13, broad and high on the bis.
      spine(back + 0.3, -5.0, 0.5, spineH - 0.5, 0.18 + (spineH - 0.6) * 0.6),
      // The ventral fin under the tail.
      { top: [[-3.9, -0.5], [-6.6, -0.48]], bottom: [[-3.9, -0.55], [-5.2, -1.22], [-6.2, -1.26], [-6.6, -0.52]], plan: [[-3.9, 0.04], [-6.6, 0.04]], round: 8, stations: 6 },
    ],
    wing: { x: -1.4, span: 7.15, rootChord: 6.0, tipChord: 0.5, sweep: 57, mount: 0 },
    wingPlan: [[1.6, 0], [1.6, 0.6], [-3.5, 3.57], [-4.0, 3.57], [-4.4, 0.6], [-4.4, 0]],
    tail: { kind: 'single', finHeight: 2.5, finChord: 3.8, tailSpan: 3.7, tailChord: 1.4, finBase: 0.55 },
    finPlan: broadFin ? [[-2.6, 0], [-6.4, 0], [-7.1, 2.5], [-6.0, 2.5]] : [[-3.5, 0], [-6.4, 0], [-6.95, 2.45], [-6.2, 2.45]],
    tailPlan: [[-4.8, 0.5], [-5.6, 1.85], [-6.4, 1.85], [-6.6, 0.5]],
    engines: { kind: 'internal', count: 1, diameter: 1.0 },
    canopy: { x: c - 1.0, length: two ? 3.6 : 2.0, kind: two ? 'tandem' : 'framed' },
    glass: two ? [bubble(c + 0.4, c - 1.2, 1.02, 0.66, 0.7, 0.36), bubble(c - 1.3, back, 1.08, 0.7, spineH, 0.36)] : [bubble(c + 0.4, back, 1.04, 0.66, Math.max(0.7, spineH - 0.04), 0.37)],
  };
}
A['mig-21f-13'] = { ...fishbed(13.46, 0.74, false, 0.26), cls: 'fighter' };
A['mig-21pf'] = { ...fishbed(14.1, 0.84, false, 0.34), cls: 'fighter' };
A['mig-21mf'] = { ...fishbed(14.7, 0.9, true, 0.37), cls: 'fighter' };
A['mig-21bis'] = { ...fishbed(14.7, 1.02, true, 0.37), cls: 'fighter' };
A['mig-21um'] = { ...fishbed(14.5, 0.9, true, 0.34, true), cls: 'trainer' };

// ---------------------------------------------------------------- MiG-23 and MiG-27

// MiG-23: square side intakes, the glove and swing wing (shown half swept), a big fin with a ventral fin. The MF's
// dorsal fillet runs far forward and its glove is plain; the MLD's fillet is cut short and its glove notched.
// The MiG-27 (and MiG-23BN) has the sloping "duck" nose with no radar (16.7 / 17.07 x 10.5 x 4.82 m).
// Measured against a published 3-view of the MiG-23MF (estimates; heights from the radome tip):
//   station              3-view                          figure
//   nose probe           1.1 m ahead of the radome         the same
//   cockpit              canopy top +1.08, belly -0.3      the same
//   intake lip           just behind the canopy, +0.73 to -0.14, 0.36 wide, 1.8 over both   the same
//   wing root            1.35 deep, 1.1 wide               the same
//   nozzle               1.0 across, its centre +0.32      the same
// The box intakes stand off the upper sides of the fuselage on splitter plates from the canopy's rear and fair into
// the body under the glove (estimates).
const FLOGGER_INTAKE: Outline = { top: [[3.05, 0.63], [-1.5, 0.66], [-4.5, 0.5]], bottom: [[3.05, -0.24], [-1.5, -0.3], [-4.5, -0.2]], plan: [[3.05, 0.18], [-1.5, 0.2], [-4.5, 0.08]], side: 0.72, round: [[3.05, 8], [-4.5, 4]], stations: 12 };
// The ventral fin under the tail (folded out in flight).
const FLOGGER_VENTRAL: Outline = { top: [[-4.1, -0.3], [-6.9, -0.22]], bottom: [[-4.1, -0.35], [-5.4, -1.25], [-6.5, -1.3], [-6.9, -0.27]], plan: [[-4.1, 0.05], [-6.9, 0.05]], round: 8, stations: 6 };
function flogger(mld: boolean, duck: boolean): FixedWingSpec {
  return {
    length: duck ? 17.07 : 16.7, span: 10.5, height: 4.82, bodyWidth: 2.3, bodyHeight: 1.5,
    // A slim tube about 1.1 m wide and 1.35 m deep behind the radome (MiG-23), or the flat-sided, sloping "duck"
    // nose with its window (MiG-27), the flat back from the canopy to the fin, the tail pipe (estimates).
    fuselage: duck
      ? { top: [[7.55, -0.42], [6.4, -0.08], [4.9, 0.4], [3.0, 0.92], [-4.1, 0.92], [-6.9, 0.72]], bottom: [[7.55, -0.5], [6.4, -0.64], [5.0, -0.7], [4, -0.68], [-4.1, -0.6], [-6.9, -0.36]], plan: [[7.55, 0.16], [6.4, 0.38], [5.0, 0.48], [4.0, 0.52], [0, 0.55], [-4, 0.55], [-6.9, 0.5]], round: [[7.5, 4], [4.5, 3.2], [2, 2.6]], stations: 24 }
      : { top: [[7.25, -0.1], [6.2, 0.32], [5.2, 0.5], [4.1, 0.56], [2.8, 0.98], [-4.1, 0.95], [-6.9, 0.72]], bottom: [[7.25, -0.14], [6.2, -0.44], [5.0, -0.52], [3.5, -0.5], [0, -0.45], [-4.1, -0.42], [-6.9, -0.3]], plan: [[7.25, 0.03], [6.2, 0.3], [5.0, 0.42], [4.0, 0.5], [0, 0.55], [-4, 0.55], [-6.9, 0.5]], round: 2.6, stations: 24 },
    // The intakes, the ventral fin and the nose probe (the MiG-27's is short, on the side of the nose).
    bodies: [FLOGGER_INTAKE, FLOGGER_VENTRAL, duck ? { ...pod(8.53, 7.3, 0.04, 0.3, -0.3, 0.05), oneSide: true } : pod(8.35, 7.1, 0.04, 0, -0.1, 0.05)],
    // A shoulder wing, about 0.7 m above the axis (estimate).
    wing: { x: -1.6, span: 10.5, rootChord: 3.6, tipChord: 1.0, sweep: 45, mount: 1.15 },
    wingPlan: mld ? [[3.2, 0], [3.2, 1.1], [1.9, 1.55], [2.05, 1.62], [0.3, 2.0], [-1.9, 2.0], [-3.0, 1.1], [-3.0, 0]] : [[3.2, 0], [3.2, 1.1], [0.3, 2.0], [-1.9, 2.0], [-3.0, 1.1], [-3.0, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
    tail: { kind: 'single', finHeight: 3.0, finChord: 4.0, tailSpan: 5.8, tailChord: 2.0, finBase: -0.2, planeUp: 0.28 },
    finPlan: mld ? [[-2.6, 0], [-7.6, 0], [-8.3, 3.0], [-6.8, 3.0], [-3.2, 0.35]] : [[-0.8, 0], [-7.6, 0], [-8.3, 3.0], [-6.8, 3.0], [-3.0, 0.5]],
    tailPlan: [[-5.4, 0.9], [-6.8, 2.9], [-7.9, 2.9], [-8.0, 0.9]],
    engines: { kind: 'internal', count: 1, diameter: 1.0, nozzles: [[-7.5, 0, 0.22]] },
    canopy: { x: 3.6, length: 1.8, kind: 'framed' },
    glass: [duck ? bubble(4.9, 2.9, 1.04, 0.4, 0.92, 0.4) : bubble(4.1, 2.75, 1.0, 0.56, 0.98, 0.38)],
  };
}
A['mig-23mf'] = { ...flogger(false, false), cls: 'fighter' };
A['mig-23mld'] = { ...flogger(true, false), cls: 'fighter' };
A['mig-27k'] = { ...flogger(true, true), cls: 'attack' };

// ---------------------------------------------------------------- Mirage III, 5, Kfir, F1 and 2000

// Mirage III: a tailless 60-degree delta, half-cone intakes beside the cockpit, a framed canopy blending into the
// spine, a tall fin (IIIE 15.03 x 8.22 x 4.5 m). The Mirage 5 has the long slim nose with no radar (15.55 m); the
// Kfir the J79's fatter rear with an intake at the fin's root, fixed canards on the intakes, a dogtoothed wing and a
// flattened nose (15.65 m).
/**
 * A half-cone ("souris") intake beside the cockpit: the D-shaped trunk from its lip at `lip` back to `back`, `side`
 * out, from `top` down to `bottom`, `w` half wide, and its shock half-cone sticking out ahead of the lip.
 */
function halfCone(lip: number, back: number, side: number, top: number, bottom: number, w: number, cone = 0.62): Outline[] {
  const mid = (top + bottom) / 2;
  return [
    { top: [[lip, top], [back + 1.2, top * 0.92], [back, mid + 0.1]], bottom: [[lip, bottom], [back + 1.2, bottom * 0.92], [back, mid - 0.1]], plan: [[lip, w], [back + 1.6, w * 0.9], [back, 0.08]], side, round: 2.6, stations: 10 },
    pod(lip + 0.75, lip - 0.3, w * cone, side - w * 0.3, mid, 0.85),
  ];
}
// Measured against a published 3-view of the Mirage III (estimates; heights from the radome tip):
//   station              3-view                              figure
//   cockpit              canopy top +1.27, belly -0.2          the same
//   intake lip           +0.74 to -0.07, 2.0 over both         the same
//   wing root            1.75 deep (spine +1.4, belly -0.34)   the same
//   jet pipe             1.15 across, its centre +0.6          the same
// The Kfir against its own 3-view: probe 0.9 m, canopy top +1.5 and the J79 rear's top +1.85 over the belly, intakes
// 1.3 m deep; the figure matches within 0.1 m.
function mirage3(kind: 'radar' | 'slim' | 'kfir'): FixedWingSpec {
  // The Kfir's radome tip 0.9 m behind the tip of its probe (the published length).
  const tip = kind === 'radar' ? 7.53 : kind === 'slim' ? 8.05 : 7.25;
  // The radome (IIIE), the long slim nose with no radar (5), the broad flattened nose (Kfir) (estimates).
  const nose: P2[] = kind === 'radar' ? [[7.53, 0.0], [6.6, 0.3], [5.32, 0.63]] : kind === 'slim' ? [[8.05, 0.0], [6.8, 0.26], [5.32, 0.63]] : [[7.25, -0.24], [6.2, 0.16], [4.8, 0.58]];
  const kfir = kind === 'kfir';
  return {
    length: kfir ? 15.65 : tip + 7.5, span: 8.22, height: 4.5, bodyWidth: 2.1, bodyHeight: 1.3,
    // The waisted fuselage about 1.25 m across and 1.75 m deep, the canopy faired into the high spine running level
    // to the fin, the belly rising to the jet pipe; the Kfir's J79 rear wider (estimates).
    fuselage: {
      top: kfir ? [...nose, [2.85, 1.2], [-1.85, 1.2], [-2.3, 1.6], [-6.2, 1.6], [-7.5, 1.42]] : [...nose, [3.1, 1.24], [1.8, 1.4], [-1.2, 1.4], [-4, 1.32], [-6.2, 1.2], [-7.5, 1.12]],
      bottom: kfir ? [[tip, -0.28], [6.2, -0.27], [1.8, -0.28], [-5.5, -0.3], [-7.5, 0.1]] : [[tip, -0.04], [tip - 1.0, -0.16], [4.4, -0.26], [1.8, -0.34], [-5.5, -0.34], [-7.5, 0.04]],
      plan: [[tip, kfir ? 0.1 : 0.03], [tip - 1.0, kfir ? 0.34 : 0.25], [5.4, 0.42], [4.0, 0.52], [2.0, 0.6], [-2, 0.64], [-5, kfir ? 0.7 : 0.6], [-7.5, kfir ? 0.62 : 0.55]],
      round: [[tip, kfir ? 4 : 2.2], [5.4, 2.4], [2, 2.8], [-7.5, 2.4]],
      stations: 24,
    },
    // The half-cone intakes from beside the canopy's rear (the Kfir's larger and squarer), the Kfir's fin-root scoop.
    bodies: kfir ? [...halfCone(2.7, -1.8, 0.8, 1.0, -0.3, 0.32, 0.45), spine(-2.2, -4.6, 1.52, 0.24, 0.32), pod(8.15, 7.0, 0.04, 0, -0.26, 0.05)] : halfCone(3.58, -1.8, 0.78, 0.74, -0.07, 0.26),
    wing: { x: -1.8, span: 8.22, rootChord: 7.2, tipChord: 0.8, sweep: 60, mount: 0.25 },
    wingPlan: kfir ? [[1.8, 0], [1.8, 1.0], [-1.0, 2.6], [-0.75, 2.66], [-3.6, 4.11], [-4.4, 4.11], [-5.4, 1.0], [-5.4, 0]] : [[1.8, 0], [1.8, 1.0], [-3.6, 4.11], [-4.4, 4.11], [-5.4, 1.0], [-5.4, 0]],
    // The Kfir's fixed canards stand on top of the intakes (estimate).
    canard: kfir ? { x: 1.7, span: 3.7, chord: 1.1, up: 0.55 } : undefined,
    tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 3.0, finChord: 4.2, finBase: 0.5 },
    finPlan: [[-2.4, 0], [-6.6, 0], [-7.3, 3.0], [-6.0, 3.0]],
    engines: { kind: 'internal', count: 1, diameter: kfir ? 1.1 : 1.0, nozzles: [[-7.65, 0, kfir ? 0.73 : 0.58]] },
    canopy: { x: 4.2, length: 2.2, kind: 'framed' },
    glass: [kfir ? bubble(4.8, 2.85, 1.24, 0.6, 1.2, 0.37) : bubble(5.32, 3.0, 1.3, 0.63, 1.2, 0.37)],
  };
}
A['mirage-iii'] = { ...mirage3('radar'), cls: 'fighter' };
A['mirage-5'] = { ...mirage3('slim'), cls: 'attack' };
A['kfir'] = { ...mirage3('kfir'), cls: 'multirole' };

// Mirage F1: a high swept wing with tip rails and a conventional tail, the half-moon intakes beside the cockpit
// (F1C 15.3 x 8.4 x 4.5 m); the F1B two seats, 15.53 m.
// The F1's twin ventral fins under the rear fuselage (estimate).
const F1_VENTRAL: Outline = { top: [[-4.6, -0.55], [-6.8, -0.45]], bottom: [[-4.6, -0.6], [-5.6, -1.1], [-6.5, -1.1], [-6.8, -0.5]], plan: [[-4.6, 0.04], [-6.8, 0.04]], side: 0.36, round: 8, stations: 6 };
function mirageF1(two: boolean): FixedWingSpec {
  const tip = two ? 7.88 : 7.65;
  return {
    length: tip + 7.65, span: 8.4, height: 4.5, bodyWidth: 2.0, bodyHeight: 1.4,
    // No 3-view to measure was found; set by the measured Mirage III and 2000 (canopy and spine 1.0 to 1.3 m over the
    // radome tip, the belly 0.6 under it): a fuller body than the Mirage III's, about 1.4 m wide and 1.65 m deep,
    // the canopy faired into the spine, the shoulder wing on top (estimates).
    fuselage: {
      top: [[tip, -0.06], [tip - 1.25, 0.28], [tip - 2.6, 0.56], [2.4, 0.92], [-3, 0.9], [-7.4, 0.72]],
      bottom: [[tip, -0.12], [tip - 1.25, -0.42], [tip - 2.6, -0.6], [2.0, -0.74], [-3, -0.74], [-6, -0.56], [-7.4, -0.3]],
      plan: [[tip, 0.03], [tip - 1.25, 0.38], [tip - 2.6, 0.52], [3.0, 0.62], [-2, 0.68], [-5, 0.62], [-7.4, 0.54]],
      round: [[tip, 2.2], [3.0, 2.6], [-7.4, 2.4]],
      stations: 24,
    },
    bodies: [pod(-1.8, -4.4, 0.08, 4.25, 0.74, 0.1), ...halfCone(3.3, -2.4, 0.88, 0.62, -0.62, 0.32), F1_VENTRAL],
    wing: { x: -1.4, span: 8.4, rootChord: 4.4, tipChord: 1.0, sweep: 47.5, mount: 1.3 },
    wingPlan: [[0.8, 0], [0.8, 0.9], [-2.8, 4.2], [-3.8, 4.2], [-3.6, 0.9], [-3.6, 0]],
    tail: { kind: 'single', finHeight: 2.4, finChord: 3.8, tailSpan: 4.0, tailChord: 1.6, finBase: 0.8, planeUp: 0.2 },
    finPlan: [[-3.0, 0], [-6.8, 0], [-7.5, 2.4], [-6.2, 2.4]],
    tailPlan: [[-5.4, 0.5], [-6.6, 2.0], [-7.4, 2.0], [-7.6, 0.5]],
    engines: { kind: 'internal', count: 1, diameter: 1.0, nozzles: [[-7.7, 0, 0.2]] },
    canopy: { x: 3.6, length: two ? 3.4 : 2.2, kind: two ? 'tandem' : 'bubble' },
    glass: [two ? tandem(tip - 2.6, 1.6, 1.3, 1.4, 0.56, 0.92, 0.38) : bubble(tip - 2.6, 2.4, 1.34, 0.56, 0.92, 0.38)],
  };
}
A['mirage-f1'] = { ...mirageF1(false), cls: 'multirole' };
A['mirage-f1b'] = { ...mirageF1(true), cls: 'trainer' };

// Mirage 2000 as drawn in ./aircraft.ts, with its bubble; the two-seat B, D and N under one long canopy (14.55 m).
const M2000: FixedWingSpec = {
  length: 14.36, span: 9.13, height: 5.2, bodyWidth: 2.3, bodyHeight: 1.4,
  // Measured against a published 3-view (estimates; heights from the radome tip): canopy top +1.35, spine +1.06,
  // belly -0.47, intakes +0.71 to -0.35 and 2.1 m over both, jet pipe 1.2 m across with its centre +0.47; the figure
  // matches these within 0.05 m. The pointed radome, the area-ruled body about 1.3 m across, the canopy faired into
  // the spine (estimates).
  fuselage: {
    top: [[7.18, -0.06], [6.0, 0.3], [4.53, 0.62], [2.4, 1.0], [0, 1.0], [-3, 0.94], [-6.8, 0.98]],
    bottom: [[7.18, -0.1], [6.0, -0.38], [4.6, -0.48], [3, -0.52], [-3, -0.53], [-5.5, -0.4], [-6.8, -0.12]],
    plan: [[7.18, 0.03], [6.0, 0.38], [4.6, 0.54], [3.0, 0.62], [0, 0.68], [-4, 0.66], [-6.8, 0.56]],
    round: [[7.1, 2.2], [3.0, 2.6], [-6.8, 2.4]],
    stations: 24,
  },
  // The half-cone intakes beside the cockpit's rear (estimate).
  bodies: halfCone(3.0, -2.0, 0.9, 0.65, -0.41, 0.32),
  wing: { x: -2.4, span: 9.13, rootChord: 8.0, tipChord: 0.8, sweep: 58, mount: -0.3 },
  wingPlan: [[1.6, 0], [1.6, 1.0], [-4.6, 4.56], [-5.4, 4.56], [-6.4, 1.0], [-6.4, 0]],
  tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 3.3, finChord: 4.8, finBase: 0.3 },
  finPlan: [[-1.6, 0], [-6.4, 0], [-7.0, 3.3], [-5.8, 3.3]],
  engines: { kind: 'internal', count: 1, diameter: 1.1, nozzles: [[-7.15, 0, 0.43]] },
  canopy: { x: 3.4, length: 2.4, kind: 'bubble' },
  glass: [bubble(4.53, 2.2, 1.3, 0.62, 1.0, 0.42)],
};
A['mirage-2000c'] = { ...M2000, cls: 'multirole' };
// Mirage 4000: the 2000 grown to two engines, a bigger delta and fin, small canards on the intakes (18.7 x 12.0 x 5.8 m).
A['mirage-4000'] = {
  ...M2000, cls: 'multirole', length: 18.7, span: 12.0, height: 5.8, bodyWidth: 2.9, bodyHeight: 1.7,
  // Wider and deeper for the two engines side by side (estimates).
  fuselage: {
    top: [[9.35, -0.08], [7.8, 0.36], [5.9, 0.76], [3.2, 1.24], [0, 1.26], [-4, 1.18], [-9.0, 1.12]],
    bottom: [[9.35, -0.12], [7.8, -0.48], [6.0, -0.62], [3.6, -0.66], [-3, -0.68], [-7, -0.5], [-9.0, -0.12]],
    plan: [[9.35, 0.04], [7.8, 0.46], [6.0, 0.66], [3.6, 0.78], [1.0, 0.95], [-3, 1.2], [-9.0, 1.05]],
    round: [[9.3, 2.2], [3.6, 2.6], [-3, 3.4], [-9.0, 3.4]],
    stations: 24,
  },
  bodies: halfCone(3.8, -2.6, 1.22, 0.8, -0.52, 0.4),
  wing: { x: -3.2, span: 12.0, rootChord: 10.4, tipChord: 1.0, sweep: 58, mount: -0.3 },
  wingPlan: [[2.0, 0], [2.0, 1.45], [-6.0, 6.0], [-7.0, 6.0], [-8.4, 1.45], [-8.4, 0]],
  canard: { x: 3.2, span: 4.4, chord: 1.1 },
  tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 3.9, finChord: 6.2, finBase: 0.4 },
  finPlan: [[-2.4, 0], [-8.4, 0], [-9.1, 3.9], [-7.6, 3.9]],
  engines: { kind: 'internal', count: 2, diameter: 1.05, nozzles: [[-9.35, -0.56, 0.5], [-9.35, 0.56, 0.5]] },
  canopy: { x: 4.4, length: 3.0, kind: 'bubble' },
  glass: [bubble(5.9, 2.9, 1.6, 0.76, 1.24, 0.44)],
};
A['mirage-2000d'] = { ...M2000, cls: 'attack', length: 14.55, canopy: { x: 2.6, length: 3.4, kind: 'tandem' }, glass: [tandem(4.6, 1.0, 1.26, 1.36, 0.62, 1.0, 0.42)] };

// ---------------------------------------------------------------- Rafale, Typhoon, Gripen

// Rafale C and M: the close-coupled canard delta with the intakes under the canards (15.27 x 10.8 x 5.34 m); the B two
// seats under a longer canopy, the spine raised behind it.
function rafale(two: boolean): FixedWingSpec {
  return {
    length: 15.27, span: 10.8, height: 5.34, bodyWidth: 1.9, bodyHeight: 1.6,
    // Measured against a published 3-view of the B (estimates; heights from the radome tip): canopy top +1.6, spine
    // +1.43 behind it falling to +0.96 over the engines, belly -0.6, intakes reaching -0.75; the figure matches within
    // 0.1 m. A slim drooped nose, the cockpit set high, the body widening over the two engines side by side.
    fuselage: {
      top: [[7.64, -0.1], [6.6, 0.22], [5.6, 0.42], [5.3, 0.48], [two ? 1.2 : 2.2, two ? 1.3 : 1.18], [-0.8, 1.02], [-2.3, 0.86], [-4.5, 0.8], [-7.3, 0.86]],
      bottom: [[7.64, -0.16], [6.6, -0.4], [5.4, -0.5], [4.0, -0.55], [2.0, -0.58], [-2, -0.58], [-5, -0.5], [-7.3, -0.12]],
      plan: [[7.64, 0.04], [6.6, 0.34], [5.4, 0.48], [4.2, 0.56], [2.4, 0.64], [0, 0.84], [-4, 0.95], [-7.3, 0.8]],
      round: [[7.6, 2.2], [4, 2.6], [0, 3.2], [-7.3, 3.2]],
      stations: 24,
    },
    // The split intakes low on the body's sides under the canard roots, the lower lip reaching forward, the trunks
    // fairing into the belly under the wing (estimates).
    bodies: [
      pod(-1.6, -4.2, 0.08, 5.32, -0.3, 0.1),
      { top: [[3.2, -0.34], [2.6, 0.0], [-1, 0.0], [-3.4, -0.16]], bottom: [[3.2, -0.5], [2.9, -0.74], [-1, -0.74], [-3.4, -0.56]], plan: [[3.2, 0.34], [-1, 0.36], [-3.4, 0.12]], side: 0.84, round: [[3.2, 4], [-3.4, 3]], stations: 12 },
    ],
    wing: { x: -2.4, span: 10.8, rootChord: 6.8, tipChord: 1.2, sweep: 48, mount: -0.2 },
    wingPlan: [[1.0, 0], [1.0, 1.2], [-3.4, 5.25], [-4.5, 5.25], [-5.4, 1.2], [-5.6, 0]],
    canard: { x: 2.0, span: 5.0, chord: 1.4 },
    tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 2.8, finChord: 3.4, finBase: 0.55 },
    finPlan: [[-3.6, 0], [-7.0, 0], [-7.3, 2.8], [-6.2, 2.8]],
    engines: { kind: 'internal', count: 2, diameter: 0.85, nozzles: [[-7.7, -0.46, 0.42], [-7.7, 0.46, 0.42]] },
    canopy: two ? { x: 3.4, length: 3.6, kind: 'tandem' } : { x: 3.9, length: 2.6, kind: 'bubble' },
    glass: [two ? tandem(5.4, 1.2, 1.36, 1.5, 0.48, 1.3, 0.4) : bubble(5.4, 2.2, 1.44, 0.48, 1.18, 0.4)],
  };
}
A['rafale'] = { ...rafale(false), cls: 'multirole' };
A['rafale-b'] = { ...rafale(true), cls: 'multirole' };

// Typhoon: canards far forward under the cockpit, the "smile" chin intake, a cranked delta well back, one fin
// (15.96 x 10.95 x 5.28 m); the two-seat T the same length with the rear seat raised under a longer canopy.
function typhoon(two: boolean): FixedWingSpec {
  return {
    length: 15.96, span: 10.95, height: 5.28, bodyWidth: 1.7, bodyHeight: 1.7,
    // Measured against a published 3-view (estimates; heights from the radome tip): canopy top +1.5, spine +1.13
    // behind the canopy, intake 2.2 m wide with its floor -0.88, belly -0.45, nozzles' centres +0.3; the figure
    // matches within 0.05 m. A slim radome, the cockpit, the raised spine over the airbrake, the body widening to the
    // two engines (estimates).
    fuselage: {
      top: [[7.98, -0.1], [6.9, 0.24], [5.68, 0.56], [two ? 1.4 : 1.78, two ? 1.1 : 1.03], [-0.8, 0.85], [-5.8, 0.48], [-7.6, 0.4]],
      bottom: [[7.98, -0.16], [6.9, -0.34], [5.6, -0.42], [4.0, -0.5], [0, -0.6], [-4.5, -0.78], [-6.5, -0.62], [-7.6, -0.35]],
      plan: [[7.98, 0.04], [6.9, 0.36], [5.6, 0.5], [4.0, 0.58], [1.0, 0.7], [-4, 0.85], [-7.6, 0.7]],
      round: [[8, 2.2], [4, 2.4], [0, 3], [-7.6, 3]],
      stations: 24,
    },
    // The chin intake about 1.7 m wide under the cockpit's rear, its lower lip curving up at the corners (the
    // "smile"), the duct fairing into the belly behind the wing's leading edge (estimates).
    bodies: [
      pod(-2.4, -5.0, 0.12, 5.48, -0.2, 0.25),
      { top: [[3.7, -0.2], [-3, -0.2], [-5.6, -0.25]], bottom: [[3.7, -0.56], [3.3, -0.98], [-1.5, -0.98], [-4.5, -0.7], [-5.6, -0.5]], plan: [[3.7, 1.0], [0, 1.05], [-3, 0.95], [-5.6, 0.6]], round: [[3.7, 3], [-1, 4], [-5.6, 4]], stations: 14 },
    ],
    wing: { x: -2.6, span: 10.95, rootChord: 7.4, tipChord: 0.9, sweep: 53, mount: -0.2 },
    wingPlan: [[1.4, 0], [1.4, 0.9], [-1.2, 2.8], [-4.0, 5.3], [-5.0, 5.3], [-5.7, 0.9], [-5.9, 0]],
    canard: { x: 4.7, span: 4.4, chord: 1.3 },
    tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 3.3, finChord: 3.6, finBase: 0.1 },
    finPlan: [[-3.4, 0], [-7.2, 0], [-7.6, 3.3], [-6.5, 3.3]],
    engines: { kind: 'internal', count: 2, diameter: 0.9, nozzles: [[-7.98, -0.47, 0.2], [-7.98, 0.47, 0.2]] },
    canopy: two ? { x: 3.6, length: 3.8, kind: 'tandem' } : { x: 4.0, length: 2.8, kind: 'bubble' },
    glass: [two ? tandem(5.68, 1.2, 1.36, 1.5, 0.6, 1.1, 0.45) : bubble(5.68, 2.0, 1.4, 0.6, 1.03, 0.45)],
  };
}
A['eurofighter-typhoon'] = { ...typhoon(false), cls: 'multirole' };
A['eurofighter-typhoon-t'] = { ...typhoon(true), cls: 'multirole' };

// Gripen: a small canard delta, the side intakes with the canards set on them, a dogtooth on the leading edge,
// one fin. A/C 14.1 m, the two-seat D 14.8 m, the E 15.2 m with a wider body where its main gear moved to the
// wing roots, all 8.4 to 8.6 m span.
function gripen(length: number, two: boolean, e: boolean): FixedWingSpec {
  // The tail stays at -7.3; the nose moves with the length.
  const t = length - 7.3;
  return {
    length, span: e ? 8.6 : 8.4, height: 4.5, bodyWidth: 1.6, bodyHeight: 1.6,
    // Measured against a published 3-view of the C (estimates; heights from the radome tip): canopy top +1.37, spine
    // +1.16, belly -0.25, intakes +0.66 to -0.08 and 1.5 m over both, cockpit 0.85 m wide, jet pipe centre +0.58; the
    // figure matches within 0.05 m. A slim nose, the narrow cockpit, the body over the wing box (the E's wider) and
    // the single engine (estimates).
    fuselage: {
      top: [[t, 0.0], [t - 1.1, 0.34], [t - 2.4, 0.74], [two ? t - 6.0 : t - 5.0, two ? 1.25 : 1.19], [-1.5, 1.16], [-5.4, 1.07], [-7.3, 0.9]],
      bottom: [[t, -0.06], [t - 1.1, -0.2], [t - 2.6, -0.26], [0, -0.25], [-4, -0.25], [-7.3, 0.12]],
      plan: [[t, 0.04], [t - 1.1, 0.3], [t - 2.6, 0.4], [t - 3.6, 0.44], [0, e ? 0.62 : 0.52], [-4.5, e ? 0.62 : 0.55], [-7.3, 0.45]],
      round: [[t, 2.2], [t - 3.6, 2.4], [0, 3], [-7.3, 2.6]],
      stations: 24,
    },
    // The D-shaped side intakes, raked back from the upper lip, the canards set on them (estimates).
    bodies: [
      pod(-1.6, -3.6, 0.08, e ? 4.3 : 4.2, 0, 0.1),
      { top: [[t - 3.8, 0.66], [-1.5, 0.7], [-3.4, 0.5]], bottom: [[t - 3.8, 0.5], [t - 4.2, -0.08], [-1.5, -0.1], [-3.4, 0.1]], plan: [[t - 3.8, e ? 0.26 : 0.24], [-1.5, 0.26], [-3.4, 0.08]], side: e ? 0.56 : 0.5, round: [[t - 3.8, 2.8], [-3.4, 2.6]], stations: 12 },
    ],
    wing: { x: -2.4, span: e ? 8.6 : 8.4, rootChord: 6.2, tipChord: 1.0, sweep: 45, mount: 0.31 },
    wingPlan: [[1.4, 0], [1.4, 1.1], [-1.2, 3.0], [-1.0, 3.05], [-3.0, e ? 4.3 : 4.2], [-4.1, e ? 4.3 : 4.2], [-4.6, 1.1], [-4.8, 0]],
    // The canards on top of the intakes (estimate).
    canard: { x: 1.9, span: 4.4, chord: 1.5, up: 0.55 },
    tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 2.6, finChord: 3.0, finBase: 0.55 },
    finPlan: [[-3.4, 0], [-6.8, 0], [-7.1, 2.6], [-6.1, 2.6]],
    engines: { kind: 'internal', count: 1, diameter: 0.9, nozzles: [[-7.6, 0, 0.52]] },
    canopy: { x: t - 3.8, length: two ? 3.4 : 2.4, kind: two ? 'tandem' : 'bubble' },
    glass: [two ? tandem(t - 2.4, t - 6.0, 1.36, 1.46, 0.74, 1.25, 0.4) : bubble(t - 2.4, t - 5.0, 1.4, 0.74, 1.19, 0.4)],
  };
}
A['jas-39'] = { ...gripen(14.1, false, false), cls: 'multirole' };
A['jas-39d'] = { ...gripen(14.8, true, false), cls: 'multirole' };
A['jas-39e'] = { ...gripen(15.2, false, true), cls: 'multirole' };

// ---------------------------------------------------------------- J-10, JF-17

// J-10A: a canard delta with a big square chin intake (its splitter plate standing off the belly), canards behind
// the cockpit, one fin, two ventral fins (16.9 x 9.75 x 5.43 m). J-10C: the bumped, raked DSI intake with no
// splitter; J-10S two seats.
// The two ventral fins under the rear fuselage, canted out (estimate).
// Measured against a published 3-view of the J-10A (estimates; heights from the radome tip):
//   station              3-view                              figure
//   nose probe           0.9 m ahead of the radome             the same
//   cockpit              canopy top +1.34, belly -0.3          the same
//   intake lip           3.2 to 3.5 m behind the radome tip, -0.24 to -0.93, 1.3 wide   the same
//   wing root            1.6 deep over the duct, belly -0.73   the same
//   nozzle               1.1 across, its centre +0.24          the same
// The two ventral fins under the rear fuselage, canted out (estimate).
const J10_VENTRAL: Outline = { top: [[-4.2, -0.6], [-6.9, -0.4]], bottom: [[-4.2, -0.65], [-5.4, -1.32], [-6.5, -1.34], [-6.9, -0.44]], plan: [[-4.2, 0.04], [-6.9, 0.04]], side: 0.5, round: 8, stations: 6 };
function j10(dsi: boolean, two: boolean): FixedWingSpec {
  // The chin intake under the cockpit's rear: the J-10A's square mouth on its splitter plate, the J-10C's DSI raked
  // forward to its lower lip; the duct runs back as the deep belly under the wing (estimates).
  const intake: Outline = dsi
    ? { top: [[4.6, -0.9], [4.0, -0.38], [0, -0.38], [-5.6, -0.4]], bottom: [[4.6, -0.98], [4.4, -1.05], [0.35, -1.05], [-2.5, -0.9], [-5.6, -0.8]], plan: [[4.6, 0.6], [4.0, 0.64], [0, 0.66], [-5.6, 0.5]], round: [[4.6, 5], [-5.6, 4]], stations: 18 }
    : { top: [[4.35, -0.36], [0, -0.38], [-5.6, -0.4]], bottom: [[4.35, -0.42], [4.2, -1.05], [0.35, -1.05], [-2.5, -0.9], [-5.6, -0.8]], plan: [[4.35, 0.64], [0, 0.66], [-5.6, 0.5]], round: [[4.35, 9], [0, 6], [-5.6, 4]], stations: 18 };
  return {
    length: 16.9, span: 9.75, height: 5.43, bodyWidth: 1.8, bodyHeight: 1.7,
    // A slim radome behind the probe, the cockpit, the spine running back to the fin (higher behind the J-10S's
    // second seat), the body over the single engine (estimates).
    fuselage: {
      top: [[7.55, -0.12], [6.5, 0.3], [5.45, 0.53], [two ? 1.6 : 2.45, two ? 0.98 : 0.93], [-0.25, 0.73], [-3.05, 0.63], [-7.9, 0.45]],
      bottom: [[7.55, -0.18], [6.5, -0.36], [5.4, -0.42], [3, -0.46], [0, -0.5], [-4, -0.6], [-5.6, -0.7], [-7.9, -0.3]],
      plan: [[7.55, 0.04], [6.5, 0.32], [5.4, 0.48], [4.0, 0.54], [0, 0.7], [-4, 0.75], [-7.9, 0.58]],
      round: [[7.5, 2.2], [4.0, 2.6], [0, 3], [-7.9, 2.4]],
      stations: 24,
    },
    bodies: [intake, J10_VENTRAL, pod(8.45, 7.4, 0.04, 0, -0.12, 0.05)],
    wing: { x: -2.4, span: 9.75, rootChord: 7.6, tipChord: 0.8, sweep: 54, mount: -0.2 },
    wingPlan: [[2.4, 0], [2.4, 0.9], [-0.6, 3.2], [-3.4, 4.85], [-4.4, 4.85], [-5.4, 0.9], [-5.6, 0]],
    canard: { x: 2.5, span: 5.4, chord: 1.6 },
    tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 3.2, finChord: 3.6, finBase: 0.6 },
    finPlan: [[-3.6, 0], [-7.4, 0], [-7.8, 3.2], [-6.7, 3.2]],
    engines: { kind: 'internal', count: 1, diameter: 1.1, nozzles: [[-8.35, 0, 0.1]] },
    canopy: { x: 4.6, length: two ? 3.8 : 2.8, kind: two ? 'tandem' : 'bubble' },
    glass: [two ? tandem(5.45, 1.5, 1.2, 1.32, 0.53, 0.98, 0.42) : bubble(5.45, 2.45, 1.22, 0.53, 0.93, 0.42)],
  };
}
A['j-10'] = { ...j10(false, false), cls: 'multirole' };
A['j-10c'] = { ...j10(true, false), cls: 'multirole' };
A['j-10s'] = { ...j10(false, true), cls: 'multirole' };

// JF-17: bumped DSI intakes on the sides behind the cockpit, LERX into a trapezoid wing with tip rails, one fin,
// low all-moving tailplanes (14.93 x 9.45 x 4.72 m).
A['jf-17'] = {
  cls: 'multirole', length: 14.93, span: 9.45, height: 4.72, bodyWidth: 1.7, bodyHeight: 1.5,
  // No 3-view to measure was found; set by the measured J-10 and Gripen (canopy top about 1.45 m and spine 1.1 m over
  // the radome tip, belly 0.4 m under it): a slim radome, the cockpit, the spine to the fin (estimates).
  fuselage: {
    top: [[7.46, -0.1], [6.4, 0.26], [5.2, 0.5], [5.0, 0.54], [2.4, 1.0], [0, 0.96], [-4, 0.8], [-7.2, 0.62]],
    bottom: [[7.46, -0.16], [6.4, -0.36], [5.0, -0.46], [3.0, -0.5], [0, -0.52], [-4, -0.46], [-7.2, -0.2]],
    plan: [[7.46, 0.04], [6.4, 0.34], [5.0, 0.48], [3.4, 0.54], [0, 0.66], [-4, 0.66], [-7.2, 0.5]],
    round: [[7.4, 2.2], [3.4, 2.4], [0, 2.8], [-7.2, 2.6]],
    stations: 24,
  },
  // The side intakes under the LERX's start, raked back from the upper lip, the DSI bump on the body ahead of each,
  // two ventral fins (estimates).
  bodies: [
    pod(-0.2, -2.8, 0.08, 4.72, 0, 0.1),
    { top: [[2.9, 0.5], [-1.5, 0.52], [-3.6, 0.3]], bottom: [[2.9, 0.3], [2.3, -0.5], [-1.5, -0.52], [-3.6, -0.2]], plan: [[2.9, 0.3], [-1.5, 0.32], [-3.6, 0.08]], side: 0.84, round: [[2.9, 3], [-3.6, 2.6]], stations: 12 },
    pod(3.7, 2.2, 0.2, 0.6, 0.08, 0.5),
    { ...J10_VENTRAL, top: [[-3.8, -0.46], [-6.2, -0.4]], bottom: [[-3.8, -0.5], [-4.8, -1.0], [-5.8, -1.0], [-6.2, -0.44]], plan: [[-3.8, 0.04], [-6.2, 0.04]], side: 0.42 },
  ],
  wing: { x: -1.4, span: 9.45, rootChord: 4.4, tipChord: 1.2, sweep: 38, mount: 0.1 },
  wingPlan: [[3.2, 0], [2.6, 0.9], [1.0, 1.15], [0.6, 1.4], [-1.9, 4.65], [-3.1, 4.65], [-3.6, 1.4], [-3.7, 0]],
  tail: { kind: 'single', finHeight: 2.6, finChord: 3.2, tailSpan: 5.0, tailChord: 1.8, finBase: 0.5, planeUp: -0.1 },
  finPlan: [[-3.2, 0], [-6.6, 0], [-7.0, 2.6], [-5.8, 2.6]],
  tailPlan: [[-5.0, 0.5], [-5.3, 0.8], [-6.4, 2.5], [-7.3, 2.5], [-7.4, 0.5]],
  engines: { kind: 'internal', count: 1, diameter: 1.0, nozzles: [[-7.6, 0, 0.2]] },
  canopy: { x: 3.6, length: 2.6, kind: 'bubble' },
  glass: [bubble(5.0, 2.4, 1.36, 0.54, 1.0, 0.4)],
};

// ---------------------------------------------------------------- Tornado

// Tornado IDS and ECR: the huge fin, square side intakes, the glove and swing wing (half swept), tandem seats
// (16.72 x 11.4 x 5.95 m). The ADV is 1.36 m longer, with a longer radome and a plug behind the cockpit (18.68 m).
function tornado(adv: boolean): FixedWingSpec {
  const tip = adv ? 10.32 : 8.36;
  const c = adv ? 6.4 : 5.6;
  return {
    length: tip + 8.36, span: 11.4, height: 5.95, bodyWidth: 2.5, bodyHeight: 1.8,
    // Measured against a published 3-view of the IDS (estimates; heights from the radome tip): canopy top +1.55,
    // spine +1.45, belly -0.45 rising to -0.25 at the tail, nose 1.45 deep 2.5 m behind the radome tip; the figure
    // matches within 0.1 m. The radome (the ADV's longer), the tandem cockpit, the deep, wide body over the two engines
    // side by side under the broad spine (estimates).
    fuselage: {
      top: [[tip, -0.05], [tip - 1.6, 0.4], [c + 0.2, 0.68], [c - 3.9, 1.3], [0, 1.38], [-4, 1.3], [-8, 0.9]],
      bottom: [[tip, -0.1], [tip - 1.6, -0.72], [c, -0.66], [2.6, -0.56], [-4, -0.5], [-8, -0.22]],
      plan: [[tip, 0.03], [tip - 1.6, 0.48], [c, 0.62], [2.6, 0.7], [0, 0.8], [-4, 1.0], [-8, 0.95]],
      round: [[tip, 2.4], [c, 2.8], [0, 3.6], [-8, 3.6]],
      stations: 26,
    },
    // The box intakes under the glove, their mouths raked back from the upper lip (estimates).
    bodies: [{ top: [[2.8, 0.9], [-2, 0.96], [-4.2, 0.8]], bottom: [[2.8, 0.75], [2.0, -0.62], [-2, -0.64], [-4.2, -0.5]], plan: [[2.8, 0.36], [-2, 0.4], [-4.2, 0.2]], side: 1.02, round: [[2.8, 10], [-4.2, 5]], stations: 12 }],
    wing: { x: -1.2, span: 11.4, rootChord: 3.4, tipChord: 1.0, sweep: 45, mount: 0.7 },
    wingPlan: [[2.8, 0], [2.8, 1.25], [0.0, 2.15], [-2.2, 2.15], [-3.2, 1.25], [-3.2, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
    tail: { kind: 'single', finHeight: 3.7, finChord: 5.8, tailSpan: 6.6, tailChord: 2.4, finBase: 0.7 },
    finPlan: [[-1.4, 0], [-7.2, 0], [-8.0, 3.7], [-6.2, 3.7], [-2.4, 0.4]],
    tailPlan: [[-5.2, 1.0], [-5.6, 1.3], [-7.4, 3.3], [-8.6, 3.3], [-8.6, 1.0]],
    engines: { kind: 'internal', count: 2, diameter: 1.0, nozzles: [[-8.35, -0.5, 0.34], [-8.35, 0.5, 0.34]] },
    canopy: { x: c - 1.8, length: 3.6, kind: 'tandem' },
    glass: [tandem(c, c - 3.8, 1.46, 1.56, 0.68, 1.3, 0.44)],
  };
}
A['tornado-ids'] = { ...tornado(false), cls: 'attack' };
A['tornado-adv'] = { ...tornado(true), cls: 'fighter' };
// J-20: a long canard delta with bumped DSI intakes on the sides, LERX into a cranked delta, two all-moving canted
// fins and two ventral fins (20.4 x 13.0 x 4.45 m).
A['j-20'] = {
  cls: 'fighter', length: 20.4, span: 13.0, height: 4.45, bodyWidth: 3.2, bodyHeight: 1.6,
  // No 3-view to measure was found; set by the measured Su-57 and J-10 (canopy top about 1.5 m and spine 1.1 m over
  // the radome tip, belly 0.55 m under it): a long chined nose, the cockpit, the wide flat body over the weapons bay
  // and the engines (estimates).
  fuselage: {
    top: [[10.2, -0.1], [9.0, 0.24], [7.6, 0.52], [7.4, 0.56], [3.4, 1.0], [0, 0.9], [-6, 0.7], [-10.0, 0.45]],
    bottom: [[10.2, -0.16], [9.0, -0.36], [7.4, -0.5], [5.2, -0.58], [0, -0.66], [-6, -0.56], [-10.0, -0.3]],
    plan: [[10.2, 0.04], [9.0, 0.48], [7.4, 0.7], [5.4, 0.82], [3, 0.95], [0, 1.25], [-6, 1.4], [-10.0, 1.0]],
    round: [[10.2, 3.5], [7.4, 3.4], [0, 4], [-10, 4]],
    stations: 26,
  },
  // The DSI intakes beside the cockpit's rear under the canards, raked back from the upper lip, the bump ahead of
  // each, two ventral fins (estimates).
  bodies: [
    { top: [[5.0, 0.56], [0, 0.6], [-4, 0.42]], bottom: [[5.0, 0.34], [4.2, -0.6], [0, -0.64], [-4, -0.46]], plan: [[5.0, 0.42], [0, 0.46], [-4, 0.2]], side: 1.2, round: [[5.0, 6], [-4, 4]], stations: 12 },
    pod(5.9, 4.2, 0.24, 0.92, 0.1, 0.5),
    { top: [[-6.2, -0.5], [-8.8, -0.42]], bottom: [[-6.2, -0.55], [-7.2, -1.25], [-8.4, -1.25], [-8.8, -0.46]], plan: [[-6.2, 0.04], [-8.8, 0.04]], side: 1.15, round: 8, stations: 6 },
  ],
  wing: { x: -3.2, span: 13.0, rootChord: 8.0, tipChord: 1.2, sweep: 48, mount: 0.2 },
  wingPlan: [[3.6, 0], [3.0, 1.6], [0.8, 2.6], [-4.8, 6.5], [-6.0, 6.5], [-7.2, 1.6], [-7.2, 0]],
  canard: { x: 3.6, span: 6.0, chord: 1.7 },
  tail: { kind: 'twin', tailSpan: 0, tailChord: 0, finHeight: 2.2, finChord: 2.8, cant: 30, spacing: 3.2, finBase: 0.35 },
  finPlan: [[-6.2, 0], [-8.6, 0], [-9.4, 2.2], [-7.8, 2.2]],
  engines: { kind: 'internal', count: 2, diameter: 1.05, nozzles: [[-10.15, -0.72, 0.08], [-10.15, 0.72, 0.08]] },
  canopy: { x: 5.6, length: 3.4, kind: 'bubble' },
  glass: [bubble(7.4, 3.4, 1.42, 0.56, 1.0, 0.46)],
};

// Tu-160: the B-1's layout grown - a longer, slimmer nose, the swing wing out of a long glove blended into the
// body, the engine pairs far out under the glove, an all-moving upper fin with the tailplane part way up it
// (54.1 x 55.7 spread / 35.6 swept x 13.1 m; shown at a middle sweep).
A['tu-160'] = {
  cls: 'bomber', length: 54.1, span: 44.0, height: 13.1, bodyWidth: 5.0, bodyHeight: 3.2,
  // Measured against a published 3-view (estimates; heights from the radome tip): cockpit top +2.0, spine +1.8,
  // belly -0.8, nacelle floor -2.15, nacelles 2.0 deep and 2.6 wide; the figure matches within 0.1 m. A long pointed
  // radome with a slight droop, the cockpit section, the body flattening and widening into the glove, the slim tail
  // cone past the fin (estimates).
  fuselage: {
    top: [[27.05, -0.4], [25.4, 0.32], [23.6, 0.9], [22.2, 1.3], [20.2, 1.62], [12, 1.7], [0, 1.6], [-14, 1.4], [-22, 1.0], [-27.05, 0.5]],
    bottom: [[27.05, -0.5], [25.4, -0.98], [23.6, -1.15], [20, -1.25], [10, -1.15], [0, -1.1], [-14, -1.0], [-22, -0.8], [-27.05, -0.2]],
    plan: [[27.05, 0.1], [25.4, 0.7], [23.6, 1.08], [20, 1.4], [12, 1.6], [6, 3.0], [-4, 4.4], [-12, 3.2], [-20, 1.4], [-27.05, 0.6]],
    round: [[27, 2.2], [20, 2.4], [12, 2.8], [0, 6], [-20, 4], [-27, 2.4]],
    stations: 30,
  },
  // The paired engine nacelles under the glove, each about 2.6 m wide and 2.2 m deep, the intake mouths raked back
  // from the upper lip, the round engine bays aft (estimates).
  bodies: [{ top: [[2.4, -0.62], [-4, -0.6], [-11.0, -0.7]], bottom: [[2.4, -0.9], [1.0, -2.55], [-4, -2.55], [-8, -2.45], [-11.0, -2.2]], plan: [[2.4, 1.3], [-4, 1.32], [-11.0, 1.22]], side: 3.6, round: [[2.4, 10], [-3, 7], [-11, 4]], stations: 14 }],
  wing: { x: -2.0, span: 44.0, rootChord: 7.5, tipChord: 2.6, sweep: 40, mount: 0.4 },
  wingPlan: [[10, 0], [10, 2.6], [-0.8, 8.8], [-6.4, 8.8], [-7, 5], [-7, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
  tail: { kind: 'single', finHeight: 7.2, finChord: 9.0, tailSpan: 13.25, tailChord: 4.0, finBase: 1.3, planeUp: 3.4 },
  finPlan: [[-15, 0], [-25.2, 0], [-26.6, 7.2], [-22.6, 7.2]],
  tailPlan: [[-20.4, 0], [-22.4, 6.6], [-24.4, 6.6], [-25.8, 0]],
  engines: { kind: 'internal', count: 4, diameter: 1.1, nozzles: [[-11.2, -4.2, -1.45], [-11.2, -3.0, -1.45], [-11.2, 3.0, -1.45], [-11.2, 4.2, -1.45]] },
  canopy: { x: 21, length: 2.0, kind: 'framed' },
  glass: [sideBySide(22.2, 20.2, 1.85, 1.2, 1.55, 1.0)],
};
// Tu-22M3: a long fuselage with big wedge intakes along its sides, a low swing wing out of a fixed glove (shown
// at a middle sweep), the tall fin with its long dorsal fillet, the two nozzles side by side
// (42.46 x 34.28 spread / 23.3 swept x 11.05 m).
A['tu-22m3'] = {
  cls: 'bomber', length: 42.46, span: 28.0, height: 11.05, bodyWidth: 4.4, bodyHeight: 2.6,
  // Measured against a published four-view silhouette (estimates; heights from the radome tip): body 2.9 m deep from
  // the cockpit back (spine +1.9, belly -1.0), the cockpit about 6 m behind the radome tip; the figure matches within
  // 0.1 m. A long pointed radome, the cockpit section about 2.3 m across, the slim body between the intakes widening
  // aft over the two engines side by side, the spine rising into the fin's fillet (estimates).
  fuselage: {
    top: [[21.23, -0.4], [19.1, 0.14], [17.0, 0.62], [14.6, 1.08], [12.4, 1.5], [8, 1.56], [-6, 1.56], [-12, 1.45], [-17, 1.1], [-21.23, 0.62]],
    bottom: [[21.23, -0.5], [19.1, -0.74], [17, -1.0], [15, -1.2], [8, -1.3], [0, -1.33], [-12, -1.2], [-17, -0.95], [-21.23, -0.6]],
    plan: [[21.23, 0.1], [19, 0.8], [15.5, 1.12], [10, 1.2], [0, 1.25], [-8, 1.5], [-13, 1.95], [-18, 1.6], [-21.23, 1.2]],
    round: [[21, 2.4], [13, 2.6], [0, 3], [-13, 4], [-21, 4]],
    stations: 30,
  },
  // The big wedge intakes along the sides from behind the cockpit, about 1.5 m wide and 2.3 m deep, their mouths
  // raked far back from the upper lip, the ducts merging into the engine bays (estimates).
  bodies: [{ top: [[13.2, 1.3], [0, 1.36], [-12, 1.2]], bottom: [[13.2, 1.0], [11.2, -1.3], [0, -1.32], [-12, -1.1]], plan: [[13.2, 0.72], [0, 0.78], [-12, 0.42]], side: 1.55, round: [[13.2, 10], [0, 7], [-12, 5]], stations: 14 }],
  wing: { x: -1.0, span: 28.0, rootChord: 8, tipChord: 2.2, sweep: 40, mount: -0.5 },
  wingPlan: [[6, 0], [6, 2.2], [1.6, 6.1], [-3.0, 6.1], [-5.6, 5.0], [-6.4, 2.2], [-6.4, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
  tail: { kind: 'single', finHeight: 5.6, finChord: 10.5, tailSpan: 15.0, tailChord: 4.4, finBase: 0.9, planeUp: 0.2 },
  finPlan: [[-8, 0], [-18.5, 0], [-20.6, 5.5], [-17.6, 5.6], [-10, 1.1]],
  tailPlan: [[-15, 1.0], [-17.5, 7.5], [-19.8, 7.5], [-20.4, 1.0]],
  engines: { kind: 'internal', count: 2, diameter: 1.4 },
  canopy: { x: 13.5, length: 2.2, kind: 'framed' },
  glass: [sideBySide(14.6, 12.4, 1.68, 1.08, 1.5, 0.95)],
};
// Tu-95MS: a slim fuselage, the 35-degree mid wing with four turboprops on long nacelles turning eight-bladed
// contra-rotating props, the tall swept fin, the radar nose (49.5 x 50.1 x 13.3 m). Tu-142: a longer fuselage, the
// glazed-free nose with a probe, the MAD fairing on the fin top (Tu-142M 53.07 m).
function bear(maritime: boolean, glazed = false): FixedWingSpec {
  const tip = maritime ? 28.3 : 24.75;
  return {
    length: tip + 24.75, span: 50.1, height: 13.3, bodyWidth: 2.9, bodyHeight: 3.0,
    // The round fuselage about 2.75 m across (a published 3-view reads 2.6 m, the published figure 2.9 m), the radar
    // nose, the stepped cockpit 0.45 m over the fuselage, the tail tapering up to the gunner's station (estimates).
    fuselage: {
      top: [[tip, -0.3], [tip - 1.75, 0.78], [tip - 3.2, 1.14], [tip - 5.2, 1.42], [10, 1.42], [-15, 1.36], [-22, 1.06], [-24.75, 0.7]],
      bottom: [[tip, -0.5], [tip - 1.75, -1.14], [tip - 5.8, -1.38], [0, -1.38], [-15, -1.3], [-22, -0.7], [-24.75, 0.0]],
      plan: [[tip, 0.15], [tip - 1.75, 0.92], [tip - 5.8, 1.38], [-15, 1.36], [-22, 0.82], [-24.75, 0.5]],
      round: 2.2,
      stations: 28,
    },
    // The inner nacelles run on far past the trailing edge as the main gear's housings (estimate).
    bodies: maritime ? [pod(-20.0, -25.0, 0.5, 0, 9.2, 0.3), pod(-2.0, -10.2, 0.78, 6.76, 0.0, 0.1)] : [pod(-2.0, -10.2, 0.78, 6.76, 0.0, 0.1)],
    wing: { x: 1.0, span: 50.1, rootChord: 9, tipChord: 2.5, sweep: 37, mount: 0.1 },
    wingPlan: [[5.5, 0], [5.5, 1.5], [-12.5, 25.05], [-15, 25.05], [-3.5, 1.5], [-3.5, 0]],
    tail: { kind: 'single', finHeight: 7.6, finChord: 9.0, tailSpan: 14.0, tailChord: 4.6, finBase: 1.2, planeUp: 0.4 },
    finPlan: [[-14, 0], [-22, 0], [-24.2, 7.6], [-21.4, 7.6], [-17, 1.2]],
    tailPlan: [[-17.5, 0], [-20.2, 7.0], [-22.6, 7.0], [-23.8, 0]],
    engines: { kind: 'wing-props', count: 4, diameter: 1.5, at: [0.27, 0.53], length: 7.0 },
    propeller: { diameter: 5.6, blades: 8 },
    canopy: { x: tip - 4.5, length: 2.0, kind: 'framed' },
    glass: [sideBySide(tip - 3.2, tip - 5.2, 1.86, 1.14, 1.42, 1.0), ...(glazed ? [{ ...pod(tip + 0.15, tip - 2.4, 0.95, 0, -0.15, 0.55), side: undefined }] : [])],
  };
}
A['tu-95ms'] = { ...bear(false), cls: 'bomber' };
A['tu-142'] = { ...bear(true), cls: 'patrol' };
// Tu-95M (and the earlier bombers): the glazed bomb-aimer's nose in place of the MS's radar nose.
A['tu-95m'] = { ...bear(false, true), cls: 'bomber' };
// H-6 (Tu-16): a mid swept wing with the two engines buried in its roots against the fuselage, the glazed nose,
// tail turret, tall swept fin (34.8 x 33.0 x 10.36 m). The H-6K has a solid radar nose and bigger engines.
function badger(k: boolean): FixedWingSpec {
  return {
    length: 34.8, span: 33.0, height: 10.36, bodyWidth: 2.6, bodyHeight: 2.6,
    // Measured against a published 3-view of the Tu-16 (estimates): the fuselage 2.2 m across there (2.5 m published;
    // the figure takes 2.35), the nacelles 4.9 m over both with their intakes 9.7 m behind the nose and the jet pipes
    // ending 22 m behind it, the gear housings from mid-chord to past the trailing edge 5.4 m out. The round
    // fuselage, the glazed nose (H-6) or the solid radome (H-6K), the tail cone with its gun turret (H-6) or the
    // longer fairing (H-6K) (estimates).
    fuselage: {
      top: [[17.4, k ? -0.3 : 0.0], [16.2, 0.74], [13.8, 1.12], [12.6, 1.2], [6, 1.18], [-10, 1.1], [-15.5, 0.74], [-17.4, 0.4]],
      bottom: [[17.4, k ? -0.4 : -0.5], [16.2, -0.96], [12, -1.18], [0, -1.18], [-10, -1.04], [-15.5, -0.5], [-17.4, -0.1]],
      plan: [[17.4, k ? 0.15 : 0.4], [16.2, 0.9], [12, 1.17], [-10, 1.12], [-15.5, 0.68], [-17.4, 0.35]],
      round: 2.2,
      stations: 26,
    },
    bodies: [
      // The engine nacelles in the wing roots hard against the fuselage, about 1.6 m across, their round intakes ahead
      // of the leading edge (bigger and further forward on the H-6K's D-30s), the nozzles just behind the wing (estimates).
      { top: [[k ? 8.3 : 7.7, 0.62], [3, 0.82], [-3, 0.8], [-5.0, 0.5]], bottom: [[k ? 8.3 : 7.7, -0.82], [3, -1.0], [-3, -0.96], [-5.0, -0.62]], plan: [[k ? 8.3 : 7.7, k ? 0.76 : 0.7], [3, 0.84], [-3, 0.8], [-5.0, 0.6]], side: 1.6, round: 2.4, stations: 12 },
      // The main gear's housings from mid-chord to past the trailing edge (estimate).
      pod(1.6, -4.0, 0.5, 5.4, -0.2, 0.25),
    ],
    wing: { x: 0, span: 33.0, rootChord: 8, tipChord: 2.4, sweep: 37, mount: 0 },
    wingPlan: [[4.6, 0], [4.6, 2.4], [-5.6, 16.5], [-8.0, 16.5], [-4.0, 2.4], [-4.0, 0]],
    tail: { kind: 'single', finHeight: 5.6, finChord: 6.4, tailSpan: 11.8, tailChord: 3.4, finBase: 0.7, planeUp: 0.3 },
    finPlan: [[-10, 0], [-15.8, 0], [-17.4, 5.6], [-14.8, 5.6], [-12, 1.0]],
    tailPlan: [[-12.6, 0], [-14.6, 5.9], [-16.4, 5.9], [-17.0, 0]],
    engines: { kind: 'internal', count: 2, diameter: k ? 1.3 : 1.15, nozzles: [[-5.2, -1.6, -0.06], [-5.2, 1.6, -0.06]] },
    canopy: { x: 12.8, length: 2.0, kind: 'framed' },
    glass: k ? [sideBySide(14.2, 12.4, 1.64, 1.04, 1.22, 0.85)] : [sideBySide(14.2, 12.4, 1.64, 1.04, 1.22, 0.85), { ...pod(17.6, 15.4, 0.75, 0, -0.1, 0.5), side: undefined }],
  };
}
A['h-6'] = { ...badger(false), cls: 'bomber' };
A['h-6k'] = { ...badger(true), cls: 'bomber' };

// ---------------------------------------------------------------- MiG-25 and MiG-31

// MiG-25PD: huge box intakes along a long flat body, a thin anhedral shoulder wing, twin fins canted out, a small
// low framed canopy (19.75 x 14.01 x 6.1 m). MiG-31: 2.9 m longer, two seats under two hoods one behind the other,
// a bigger radome (22.69 x 13.46 x 6.15 m).
function foxbat(two: boolean): FixedWingSpec {
  // The MiG-31's radome tip 1.2 m behind the tip of its probe (the published length).
  const tip = two ? 11.6 : 9.87;
  const d = tip - 9.87;
  const b = two ? 0.1 : 0;
  // Measured against published 3-views of the MiG-25 and MiG-31 (estimates; heights from the radome tip):
  //   station              3-view                              figure
  //   cockpit              canopy top +1.15, belly -0.5, 1.0 wide   the same
  //   intake lip           top +1.1, bottom -0.5, 3.3 over both     the same
  //   wing root            1.85 deep, the wing on top               the same
  //   nozzles              1.6 apart, their centres +0.4            the same
  // The intake boxes beside the cockpit, about 0.9 m wide and 1.7 m deep, their tops level with the canopy's sill,
  // the mouths raked back from the upper lip, merging aft into the flat engine box (estimates).
  const lip = 5.0 + d * 0.6;
  const intake: Outline = { top: [[lip, 1.04], [0, 1.1], [-4, 1.0]], bottom: [[lip, 0.76], [lip - 1.1, -0.62 - b], [0, -0.64 - b], [-4, -0.6 - b]], plan: [[lip, 0.45], [0, 0.46], [-4, 0.36]], side: 1.2, round: [[lip, 10], [-4, 6]], stations: 12 };
  return {
    length: two ? 22.69 : 19.75, span: two ? 13.46 : 14.01, height: two ? 6.15 : 6.1, bodyWidth: 3.6, bodyHeight: 2.4,
    // The slim radar nose (the MiG-31's bigger), the narrow cockpit between the intakes, then the long flat box of the
    // engine bays, about 3.2 m wide (estimates).
    fuselage: {
      top: [[tip, -0.1], [8.4 + d, two ? 0.36 : 0.3], [6.9 + d, 0.6], [5.4 + d * 0.5, 0.8], [3, 1.16 + b * 0.5], [-4, 1.12 + b * 0.5], [-9.4, 0.9]],
      bottom: [[tip, -0.16], [8.4 + d, -0.46], [6.4 + d, -0.56], [5 + d * 0.5, -0.6], [2.5, -0.62 - b], [-4, -0.64 - b], [-9.4, -0.3]],
      plan: [[tip, 0.03], [8.4 + d, two ? 0.48 : 0.42], [6.4 + d * 0.5, 0.5], [4.0, 0.52], [2.6, 1.2], [-1, 1.55], [-4, 1.6], [-9.4, 1.4]],
      round: [[tip, 2.2], [4.0, 2.6], [2.6, 6], [-9.4, 5]],
      stations: 28,
    },
    bodies: two ? [intake, pod(12.81, 11.4, 0.05, 0, -0.1, 0.05)] : [intake],
    wing: { x: -2.4, span: two ? 13.46 : 14.01, rootChord: 7.0, tipChord: 1.6, sweep: 42, mount: 1.05, dihedral: -5 },
    wingPlan: [[1.0, 0], [1.0, 1.8], [-3.6, two ? 6.73 : 7.0], [-5.2, two ? 6.73 : 7.0], [-6.0, 1.8], [-6.0, 0]],
    tail: { kind: 'twin', finHeight: 3.4, finChord: 4.4, cant: 8, spacing: 3.2, tailSpan: 8.8, tailChord: 2.8, finBase: 1.0, planeUp: 0.3 },
    finPlan: [[-4.4, 0], [-8.8, 0], [-9.6, 3.4], [-8.0, 3.4]],
    tailPlan: [[-6.6, 1.2], [-8.6, 4.4], [-9.8, 4.4], [-10.2, 1.2]],
    engines: { kind: 'internal', count: 2, diameter: 1.3, nozzles: [[-9.75, -0.8, 0.3], [-9.75, 0.8, 0.3]] },
    canopy: { x: two ? 6.6 : 5.6, length: two ? 3.4 : 2.4, kind: two ? 'tandem' : 'framed' },
    glass: two ? [bubble(8.3, 6.8, 1.4, 0.66, 0.95, 0.42), bubble(6.7, 5.0, 1.42, 0.95, 1.12, 0.42)] : [bubble(6.9, 4.4, 1.08, 0.6, 0.98, 0.42)],
  };
}
A['mig-25pd'] = { ...foxbat(false), cls: 'fighter' };
A['mig-31'] = { ...foxbat(true), cls: 'fighter' };

export const JET_VARIANTS_WORLD: SpecSet = { air: A };
