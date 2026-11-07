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
// The nacelle boxes hang under the LERX, ~1.25 m wide and 1.45 m deep, their mouths raked back from the upper lip,
// running straight and flat-bottomed back to the round engine bays and the nozzles (estimates).
const FLANKER_NACELLE: Outline = {
  top: [[3.7, -0.02], [-2, 0.06], [-6, 0.24], [-8.4, 0.3]],
  bottom: [[3.7, -0.12], [2.95, -1.5], [-2, -1.5], [-5, -1.38], [-8.4, -0.95]],
  plan: [[3.7, 0.62], [-2, 0.66], [-6, 0.66], [-8.4, 0.62]],
  side: 1.4, round: [[3.7, 10], [-1, 7], [-5.5, 2.6]], stations: 16,
};
// The LERX's thick root: the flat, blended centre body widening from under the windscreen to the wing (estimate).
// The ventral fins under the tail booms (estimate).
const FLANKER_VENTRAL: Outline = { top: [[-4.4, 0.0], [-7.8, 0.0]], bottom: [[-4.4, -0.05], [-5.6, -1.7], [-7.2, -1.75], [-7.8, -0.1]], plan: [[-4.4, 0.04], [-7.8, 0.04]], side: 2.05, round: 8, stations: 6 };
const FLANKER_LERX: Outline = { top: [[6.6, 0.3], [3.4, 0.36], [0, 0.34], [-4, 0.28]], bottom: [[6.6, 0.0], [3.4, -0.1], [0, -0.14], [-4, -0.1]], plan: [[6.6, 0.4], [4.2, 1.2], [2.5, 1.8], [0.4, 2.3], [-4, 2.3]], round: 8, stations: 12 };
function flanker(o: FlankerOpts): FixedWingSpec {
  const [tx, th] = o.tail ?? [-10.95, 0.2];
  const fh = o.fin ?? 3.4;
  const two = o.seats === 'two';
  const bodies: Outline[] = [FLANKER_NACELLE, FLANKER_LERX, FLANKER_VENTRAL, pod(-2.4, -5.6, 0.08, 7.35, 0.13, 0.1)];
  if (o.tvc) bodies.push(pod(-8.0, -9.3, 0.52, 1.4, -0.32, 0.05));
  return {
    length: o.length ?? 21.9, span: 14.7, height: 5.93 + (fh - 3.4), bodyWidth: 2.0, bodyHeight: 1.6,
    // The drooped radome (about 1.05 m at its base), the deep cockpit section over the nose gear, the raised
    // spine behind the canopy (higher behind a second seat), the tunnel floor between the nacelles (estimates).
    fuselage: {
      top: [[10.95, -0.16], [10.2, 0.12], [9.4, 0.3], [8.6, 0.42], [7.5, 0.55], [3.6, 0.64], [two ? 2.6 : 3.0, two ? 0.98 : 0.84], [1.0, two ? 0.84 : 0.76], [-1, 0.66], [-5, 0.48], [-8.6, 0.32], [tx, th]],
      bottom: [[10.95, -0.22], [10.2, -0.44], [9.4, -0.58], [8.6, -0.68], [7.4, -0.84], [5.8, -0.94], [4.2, -0.9], [3.0, -0.72], [1.4, -0.5], [-2, -0.42], [-6, -0.36], [-8.6, -0.24], [tx, -th * 0.5]],
      plan: [[10.95, 0.04], [10.2, 0.32], [9.4, 0.44], [8.6, 0.52], [7.5, 0.6], [6.0, 0.68], [4.4, 0.74], [2.0, 0.85], [-1, 1.0], [-4, 1.25], [-7.6, 1.2], [-8.6, 0.5], [-8.8, th + 0.1], [tx, th]],
      round: [[10.9, 2.2], [7.5, 2.4], [4.4, 2.8], [1.0, 4], [-8.6, 4], [-8.8, 2.4]],
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
    glass: [two ? tandem(7.4, 2.7, 1.3, 1.6, 0.55, 0.96, 0.54) : bubble(7.4, 3.2, 1.38, 0.55, 0.84, 0.52)],
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
  // The duck-bill radome, flat and wide with sharp chines, the deep armoured cockpit tub about 2.1 m wide, the fat
  // spine running back into the long thick tail cone (estimates).
  fuselage: {
    top: [[11.67, -0.2], [10.8, 0.04], [9.6, 0.3], [8.0, 0.66], [5.0, 0.8], [3.4, 1.02], [1.0, 0.96], [-3, 0.78], [-7, 0.56], [-10, 0.42], [-11.67, 0.3]],
    bottom: [[11.67, -0.32], [10.8, -0.55], [9.6, -0.78], [8.0, -0.98], [5.6, -1.08], [4.0, -1.0], [2.8, -0.78], [1.2, -0.52], [-6, -0.38], [-10, -0.3], [-11.67, -0.2]],
    plan: [[11.67, 0.34], [10.8, 0.66], [9.6, 0.9], [8.0, 1.04], [5.0, 1.08], [2, 1.02], [-1, 1.05], [-4, 1.3], [-7.6, 1.25], [-8.6, 0.62], [-9.2, 0.48], [-11.67, 0.4]],
    round: [[11.6, 5], [9.6, 4.2], [8.0, 3], [2, 3], [-1, 4], [-8.6, 4], [-9.2, 2.6]],
    stations: 30,
  },
  canard: { x: 4.4, span: 6.4, chord: 1.4 },
  canopy: { x: 6.2, length: 2.6, kind: 'framed' },
  glass: [sideBySide(8.0, 4.6, 1.5, 0.66, 0.92, 0.92)],
};
// Su-57: a flat chined body, the nacelles far apart under leading-edge flaps (LEVCON) with square intakes, a
// long tail cone between them, small canted all-moving fins and a diamond-edged wing (20.1 x 14.1 x 4.6 m).
A['su-57'] = {
  cls: 'fighter', length: 20.1, span: 14.1, height: 4.6, bodyWidth: 3.6, bodyHeight: 1.5,
  // A chined nose, the deep cockpit section, the wide flat centre body over the tandem weapons bays (estimates).
  fuselage: { top: [[10.05, -0.12], [9, 0.18], [7.6, 0.44], [6.0, 0.52], [3, 0.6], [0, 0.5], [-6, 0.36], [-10.05, 0.16]], bottom: [[10.05, -0.18], [9, -0.42], [7.6, -0.6], [5.6, -0.72], [3.6, -0.66], [2, -0.6], [-4, -0.55], [-8.4, -0.3], [-10.05, -0.08]], plan: [[10.05, 0.04], [9, 0.44], [7.6, 0.64], [6.0, 0.8], [5.0, 1.3], [3.6, 1.7], [0, 1.85], [-5, 1.75], [-8.5, 0.6], [-10.05, 0.25]], round: [[10, 3.2], [7.6, 3.6], [5, 5], [-10, 4]], stations: 28 },
  // The square intakes under the LEVCON, raked back from the upper lip, the nacelles flat-sided to the nozzles (estimates).
  bodies: [{ top: [[4.8, -0.06], [-2, 0.04], [-8.4, 0.16]], bottom: [[4.8, -0.16], [4.0, -1.12], [-2, -1.08], [-5.5, -0.95], [-8.4, -0.6]], plan: [[4.8, 0.56], [-5, 0.6], [-8.4, 0.52]], side: 1.55, round: [[4.8, 10], [-2, 6], [-7, 2.8]], stations: 16 }],
  wing: { x: -2.2, span: 14.1, rootChord: 7.4, tipChord: 1.2, sweep: 48, mount: 0.1 },
  wingPlan: [[5.6, 0], [5.4, 1.6], [4.6, 2.05], [3.0, 2.6], [-1.94, 7.05], [-3.1, 7.05], [-5.0, 2.6], [-6.0, 1.7], [-6.0, 0]],
  tail: { kind: 'twin', finHeight: 2.2, finChord: 3.2, cant: 26, spacing: 3.2, tailSpan: 9.9, tailChord: 2.8, finBase: 0.2 },
  finPlan: [[-4.6, 0], [-7.8, 0], [-8.6, 2.2], [-6.8, 2.2]],
  tailPlan: [[-6.4, 1.8], [-6.5, 2.6], [-8.6, 4.95], [-9.8, 4.95], [-10.1, 2.6], [-10.1, 1.8]],
  engines: { kind: 'internal', count: 2, diameter: 1.1, nozzles: [[-8.6, -1.55, -0.22], [-8.6, 1.55, -0.22]] },
  canopy: { x: 5.6, length: 3.4, kind: 'bubble' },
  glass: [bubble(7.6, 3.6, 1.28, 0.48, 0.6, 0.5)],
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
// The wedge intakes hang under the LERX, about 1.0 m wide and 1.25 m deep, the mouth raked back from the upper lip
// to the low (drooping) lower lip, the nacelle floor rising gently back to the nozzles (estimates).
const FULCRUM_NACELLE: Outline = {
  top: [[2.5, -0.04], [-2, 0.04], [-5.5, 0.18], [-7.4, 0.22]],
  bottom: [[2.5, -0.14], [1.75, -1.42], [0.6, -1.34], [-2, -1.24], [-5, -1.06], [-7.4, -0.74]],
  plan: [[2.5, 0.48], [-2, 0.54], [-5, 0.6], [-7.4, 0.52]],
  side: 1.2, round: [[2.5, 10], [-1, 7], [-5, 2.6]], stations: 16,
};
// The LERX's thick root, the flat centre body widening from the windscreen to the wing (estimate).
const FULCRUM_LERX: Outline = { top: [[5.8, 0.28], [3.0, 0.34], [0, 0.32], [-3.4, 0.26]], bottom: [[5.8, 0.0], [3.0, -0.08], [0, -0.12], [-3.4, -0.08]], plan: [[5.8, 0.36], [3.2, 1.25], [1.2, 1.85], [-3.4, 1.9]], round: 8, stations: 12 };
function fulcrum(o: FulcrumOpts): FixedWingSpec {
  const half = o.bigWing ? 6.0 : 5.68;
  const two = o.seats === 'two';
  const bodies: Outline[] = [FULCRUM_NACELLE, FULCRUM_LERX];
  // The 9-13's fuel hump behind the canopy to the wing's trailing edge; the SMT's, K's and M2's big hump to the fins.
  if (o.hump === 'small') bodies.push(spine(3.5, -3.2, 0.58, 0.34, 0.44));
  if (o.hump === 'big') bodies.push(spine(two ? 3.2 : 4.0, -6.4, 0.6, 0.56, 0.56));
  return {
    length: 17.32, span: half * 2, height: 4.73, bodyWidth: 1.8, bodyHeight: 1.5,
    // A pointed radome about 0.95 m at its base, the cockpit section over the nose gear, the slim spine, the
    // tunnel floor between the nacelles and the flat beaver tail between the nozzles (estimates).
    fuselage: {
      top: [[8.66, -0.14], [7.9, 0.12], [7.0, 0.3], [5.9, 0.46], [3.0, 0.56], [two ? 2.4 : 2.6, two ? 0.84 : 0.76], [1.0, 0.66], [0, 0.58], [-4, 0.44], [-7.6, 0.24]],
      bottom: [[8.66, -0.2], [7.9, -0.42], [7.0, -0.56], [5.8, -0.72], [4.2, -0.8], [2.8, -0.72], [1.4, -0.48], [-2, -0.38], [-7.6, -0.14]],
      plan: [[8.66, 0.04], [7.9, 0.3], [7.0, 0.42], [5.8, 0.54], [3.6, 0.62], [0, 0.85], [-4, 1.15], [-7.0, 1.05], [-7.6, 0.7]],
      round: [[8.6, 2.2], [5.8, 2.4], [3.6, 2.8], [1.0, 4], [-7.6, 4]],
      stations: 26,
    },
    bodies,
    wing: { x: -1.8, span: half * 2, rootChord: 5.4, tipChord: 1.3, sweep: 42, mount: 0.2 },
    wingPlan: [[5.8, 0], [5.2, 0.62], [1.2, 1.85], [-2.6, half - 0.28], [-3.2, half], [-4.0, half - 0.08], [-4.6, 1.9], [-4.8, 0]],
    tail: { kind: 'twin', finHeight: 2.9, finChord: 2.6, cant: 6, spacing: 3.8, tailSpan: 7.8, tailChord: 2.6, finBase: 0.1 },
    finPlan: [[-3.6, 0], [-4.4, 0.15], [-7.6, 0.15], [-8.2, 2.9], [-7.1, 2.9]],
    tailPlan: [[-5.0, 0.8], [-5.1, 1.9], [-6.9, 3.9], [-7.9, 3.9], [-8.6, 1.9], [-8.6, 0.8]],
    engines: { kind: 'internal', count: 2, diameter: 1.0, nozzles: [[-7.6, -1.25, -0.26], [-7.6, 1.25, -0.26]] },
    canopy: two ? { x: 4.2, length: 3.8, kind: 'tandem' } : { x: 4.3, length: 3.0, kind: 'bubble' },
    glass: [two ? tandem(6.0, 2.3, 1.14, 1.36, 0.46, 0.84, 0.44) : bubble(5.9, 2.6, 1.22, 0.46, 0.76, 0.44)],
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
// canopies (lengths without the probe; estimates for the PF and UM).
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
// The box intakes stand off the fuselage on splitter plates from beside the cockpit's rear, about 0.6 m wide and
// 1.15 m deep, and fair into the body at the wing's trailing edge (estimates).
const FLOGGER_INTAKE: Outline = { top: [[3.9, 0.46], [-1.5, 0.52], [-5, 0.3]], bottom: [[3.9, -0.5], [3.6, -0.66], [-1.5, -0.72], [-5, -0.5]], plan: [[3.9, 0.3], [-1.5, 0.34], [-5, 0.12]], side: 0.94, round: [[3.9, 8], [-5, 4]], stations: 12 };
// The ventral fin under the tail (folded out in flight).
const FLOGGER_VENTRAL: Outline = { top: [[-4.4, -0.6], [-7.6, -0.5]], bottom: [[-4.4, -0.65], [-5.8, -1.45], [-7.1, -1.5], [-7.6, -0.55]], plan: [[-4.4, 0.05], [-7.6, 0.05]], round: 8, stations: 6 };
function flogger(mld: boolean, duck: boolean): FixedWingSpec {
  return {
    length: duck ? 17.07 : 16.7, span: 10.5, height: 4.82, bodyWidth: 2.3, bodyHeight: 1.5,
    // A round tube about 1.45 m across behind the radome (MiG-23), or the flat-sided, sloping "duck" nose with its
    // window (MiG-27), the deep body over the wing box, the tail pipe (estimates).
    fuselage: duck
      ? { top: [[8.5, -0.32], [7.4, -0.04], [6.4, 0.22], [5.3, 0.48], [2.6, 0.66], [0, 0.76], [-4, 0.68], [-8.2, 0.5]], bottom: [[8.5, -0.42], [7.4, -0.6], [6.0, -0.74], [4, -0.8], [0, -0.82], [-4, -0.76], [-6.5, -0.6], [-8.2, -0.45]], plan: [[8.5, 0.2], [7.4, 0.44], [6.0, 0.58], [4.4, 0.64], [0, 0.72], [-4, 0.75], [-6, 0.66], [-8.2, 0.58]], round: [[8.5, 4], [5, 3.2], [0, 2.6]], stations: 24 }
      : { top: [[8.35, -0.06], [7.4, 0.2], [6.4, 0.38], [5.3, 0.5], [2.6, 0.66], [0, 0.76], [-4, 0.68], [-8.1, 0.5]], bottom: [[8.35, -0.1], [7.4, -0.38], [6.0, -0.6], [4, -0.74], [0, -0.82], [-4, -0.76], [-6.5, -0.6], [-8.1, -0.45]], plan: [[8.35, 0.03], [7.4, 0.36], [6.0, 0.52], [4.4, 0.62], [0, 0.72], [-4, 0.75], [-6, 0.66], [-8.1, 0.58]], round: 2.6, stations: 24 },
    bodies: [FLOGGER_INTAKE, FLOGGER_VENTRAL],
    wing: { x: -1.6, span: 10.5, rootChord: 3.6, tipChord: 1.0, sweep: 45, mount: 0.6 },
    wingPlan: mld ? [[3.2, 0], [3.2, 1.1], [1.9, 1.55], [2.05, 1.62], [0.3, 2.0], [-1.9, 2.0], [-3.0, 1.1], [-3.0, 0]] : [[3.2, 0], [3.2, 1.1], [0.3, 2.0], [-1.9, 2.0], [-3.0, 1.1], [-3.0, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
    tail: { kind: 'single', finHeight: 3.0, finChord: 4.0, tailSpan: 5.8, tailChord: 2.0, finBase: 0.6 },
    finPlan: mld ? [[-2.6, 0], [-7.6, 0], [-8.3, 3.0], [-6.8, 3.0], [-3.2, 0.35]] : [[-0.8, 0], [-7.6, 0], [-8.3, 3.0], [-6.8, 3.0], [-3.0, 0.5]],
    tailPlan: [[-5.4, 0.9], [-6.8, 2.9], [-7.9, 2.9], [-8.0, 0.9]],
    engines: { kind: 'internal', count: 1, diameter: 1.1 },
    canopy: { x: 3.8, length: 2.4, kind: 'framed' },
    glass: [bubble(5.3, 2.4, duck ? 1.16 : 1.1, duck ? 0.48 : 0.5, 0.72, 0.42)],
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
function mirage3(kind: 'radar' | 'slim' | 'kfir'): FixedWingSpec {
  const tip = kind === 'radar' ? 7.53 : kind === 'slim' ? 8.05 : 8.15;
  // The radome (IIIE), the long slim nose with no radar (5), the broad flattened nose (Kfir) (estimates).
  const nose: P2[] = kind === 'radar' ? [[7.53, -0.04], [6.6, 0.2], [5.4, 0.4], [4.3, 0.5]] : kind === 'slim' ? [[8.05, -0.04], [6.8, 0.16], [5.4, 0.36], [4.3, 0.5]] : [[8.15, -0.1], [6.9, 0.14], [5.4, 0.38], [4.3, 0.52]];
  const kfir = kind === 'kfir';
  return {
    length: tip + 7.5, span: 8.22, height: 4.5, bodyWidth: 2.1, bodyHeight: 1.3,
    // The slim, waisted fuselage about 1.3 m across, the canopy faired into the spine running to the fin; the Kfir's
    // J79 rear deeper and wider (estimates).
    fuselage: {
      top: [...nose, [2.0, 0.66], [0, 0.68], [-3, 0.62], [-6.2, kfir ? 0.64 : 0.5], [-7.5, kfir ? 0.54 : 0.42]],
      bottom: [[tip, -0.1], [tip - 1.0, -0.3], [5.4, -0.48], [3.8, -0.6], [0, -0.68], [-4, kfir ? -0.7 : -0.62], [-7.5, kfir ? -0.54 : -0.42]],
      plan: [[tip, kfir ? 0.1 : 0.03], [tip - 1.0, kfir ? 0.36 : 0.28], [5.4, 0.45], [4.0, 0.56], [2.0, 0.62], [-2, 0.66], [-5, kfir ? 0.72 : 0.6], [-7.5, kfir ? 0.62 : 0.52]],
      round: [[tip, kfir ? 4 : 2.2], [5.4, 2.4], [-7.5, 2.4]],
      stations: 24,
    },
    // The half-cone intakes from beside the canopy's rear (the Kfir's larger and squarer), the Kfir's fin-root scoop.
    bodies: kfir ? [...halfCone(3.2, -1.8, 0.86, 0.46, -0.64, 0.36, 0.45), spine(-2.2, -4.6, 0.56, 0.22, 0.32)] : halfCone(3.3, -1.6, 0.84, 0.4, -0.56, 0.3),
    wing: { x: -1.8, span: 8.22, rootChord: 7.2, tipChord: 0.8, sweep: 60, mount: -0.3 },
    wingPlan: kfir ? [[1.8, 0], [1.8, 1.0], [-1.0, 2.6], [-0.75, 2.66], [-3.6, 4.11], [-4.4, 4.11], [-5.4, 1.0], [-5.4, 0]] : [[1.8, 0], [1.8, 1.0], [-3.6, 4.11], [-4.4, 4.11], [-5.4, 1.0], [-5.4, 0]],
    canard: kfir ? { x: 2.6, span: 3.7, chord: 1.1 } : undefined,
    tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 3.0, finChord: 4.2, finBase: 0.5 },
    finPlan: [[-2.4, 0], [-6.6, 0], [-7.3, 3.0], [-6.0, 3.0]],
    engines: { kind: 'internal', count: 1, diameter: kfir ? 1.0 : 0.9, nozzles: [[-7.65, 0, 0.0]] },
    canopy: { x: 3.0, length: 2.2, kind: 'framed' },
    glass: [bubble(4.3, 1.9, 1.02, 0.5, 0.66, 0.37)],
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
    // A deeper, fuller body than the Mirage III's, about 1.4 m wide and 1.5 m deep, the canopy faired into the
    // spine, the shoulder wing on top (estimates).
    fuselage: {
      top: [[tip, -0.06], [tip - 1.25, 0.26], [tip - 2.6, 0.5], [2.4, 0.68], [-3, 0.66], [-7.4, 0.48]],
      bottom: [[tip, -0.12], [tip - 1.25, -0.42], [tip - 2.6, -0.62], [2.0, -0.78], [-3, -0.78], [-6, -0.62], [-7.4, -0.44]],
      plan: [[tip, 0.03], [tip - 1.25, 0.38], [tip - 2.6, 0.52], [3.0, 0.62], [-2, 0.68], [-5, 0.62], [-7.4, 0.54]],
      round: [[tip, 2.2], [3.0, 2.6], [-7.4, 2.4]],
      stations: 24,
    },
    bodies: [pod(-1.8, -4.4, 0.08, 4.25, 0.5, 0.1), ...halfCone(3.3, -2.4, 0.88, 0.44, -0.64, 0.32), F1_VENTRAL],
    wing: { x: -1.4, span: 8.4, rootChord: 4.4, tipChord: 1.0, sweep: 47.5, mount: 0.9 },
    wingPlan: [[0.8, 0], [0.8, 0.9], [-2.8, 4.2], [-3.8, 4.2], [-3.6, 0.9], [-3.6, 0]],
    tail: { kind: 'single', finHeight: 2.4, finChord: 3.8, tailSpan: 4.0, tailChord: 1.6, finBase: 0.55, planeUp: 0.1 },
    finPlan: [[-3.0, 0], [-6.8, 0], [-7.5, 2.4], [-6.2, 2.4]],
    tailPlan: [[-5.4, 0.5], [-6.6, 2.0], [-7.4, 2.0], [-7.6, 0.5]],
    engines: { kind: 'internal', count: 1, diameter: 1.0, nozzles: [[-7.7, 0, 0.02]] },
    canopy: { x: 3.6, length: two ? 3.4 : 2.2, kind: two ? 'tandem' : 'bubble' },
    glass: [two ? tandem(tip - 2.6, 1.6, 1.08, 1.16, 0.5, 0.7, 0.38) : bubble(tip - 2.6, 2.6, 1.1, 0.5, 0.7, 0.38)],
  };
}
A['mirage-f1'] = { ...mirageF1(false), cls: 'multirole' };
A['mirage-f1b'] = { ...mirageF1(true), cls: 'trainer' };

// Mirage 2000 as drawn in ./aircraft.ts, with its bubble; the two-seat B, D and N under one long canopy (14.55 m).
const M2000: FixedWingSpec = {
  length: 14.36, span: 9.13, height: 5.2, bodyWidth: 2.3, bodyHeight: 1.4,
  // The pointed radome, the area-ruled body about 1.35 m across, the canopy faired into the spine (estimates).
  fuselage: {
    top: [[7.18, -0.06], [6.0, 0.24], [4.8, 0.44], [4.2, 0.5], [1.4, 0.72], [0, 0.72], [-3, 0.66], [-6.8, 0.48]],
    bottom: [[7.18, -0.1], [6.0, -0.38], [4.6, -0.56], [3, -0.68], [-3, -0.72], [-6.8, -0.46]],
    plan: [[7.18, 0.03], [6.0, 0.38], [4.6, 0.54], [3.0, 0.62], [0, 0.68], [-4, 0.66], [-6.8, 0.56]],
    round: [[7.1, 2.2], [3.0, 2.6], [-6.8, 2.4]],
    stations: 24,
  },
  // The half-cone intakes beside the cockpit's rear (estimate).
  bodies: halfCone(3.0, -2.0, 0.9, 0.44, -0.6, 0.32),
  wing: { x: -2.4, span: 9.13, rootChord: 8.0, tipChord: 0.8, sweep: 58, mount: -0.3 },
  wingPlan: [[1.6, 0], [1.6, 1.0], [-4.6, 4.56], [-5.4, 4.56], [-6.4, 1.0], [-6.4, 0]],
  tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 3.3, finChord: 4.8, finBase: 0.6 },
  finPlan: [[-1.6, 0], [-6.4, 0], [-7.0, 3.3], [-5.8, 3.3]],
  engines: { kind: 'internal', count: 1, diameter: 1.1, nozzles: [[-7.15, 0, 0.0]] },
  canopy: { x: 2.9, length: 2.6, kind: 'bubble' },
  glass: [bubble(4.2, 1.4, 1.14, 0.5, 0.72, 0.4)],
};
A['mirage-2000c'] = { ...M2000, cls: 'multirole' };
// Mirage 4000: the 2000 grown to two engines, a bigger delta and fin, small canards on the intakes (18.7 x 12.0 x 5.8 m).
A['mirage-4000'] = {
  ...M2000, cls: 'multirole', length: 18.7, span: 12.0, height: 5.8, bodyWidth: 2.9, bodyHeight: 1.7,
  // Wider and deeper for the two engines side by side (estimates).
  fuselage: {
    top: [[9.35, -0.08], [7.8, 0.3], [6.2, 0.52], [5.4, 0.58], [2.4, 0.84], [0, 0.86], [-4, 0.78], [-9.0, 0.56]],
    bottom: [[9.35, -0.12], [7.8, -0.46], [6.0, -0.7], [3.6, -0.82], [-3, -0.86], [-9.0, -0.56]],
    plan: [[9.35, 0.04], [7.8, 0.46], [6.0, 0.66], [3.6, 0.78], [1.0, 0.95], [-3, 1.2], [-9.0, 1.05]],
    round: [[9.3, 2.2], [3.6, 2.6], [-3, 3.4], [-9.0, 3.4]],
    stations: 24,
  },
  bodies: halfCone(3.8, -2.6, 1.22, 0.54, -0.74, 0.4),
  wing: { x: -3.2, span: 12.0, rootChord: 10.4, tipChord: 1.0, sweep: 58, mount: -0.3 },
  wingPlan: [[2.0, 0], [2.0, 1.45], [-6.0, 6.0], [-7.0, 6.0], [-8.4, 1.45], [-8.4, 0]],
  canard: { x: 3.2, span: 4.4, chord: 1.1 },
  tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 3.9, finChord: 6.2, finBase: 0.7 },
  finPlan: [[-2.4, 0], [-8.4, 0], [-9.1, 3.9], [-7.6, 3.9]],
  engines: { kind: 'internal', count: 2, diameter: 1.05, nozzles: [[-9.35, -0.56, 0.0], [-9.35, 0.56, 0.0]] },
  canopy: { x: 3.8, length: 2.8, kind: 'bubble' },
  glass: [bubble(5.4, 2.5, 1.3, 0.58, 0.78, 0.44)],
};
A['mirage-2000d'] = { ...M2000, cls: 'attack', length: 14.55, canopy: { x: 2.6, length: 3.4, kind: 'tandem' }, glass: [tandem(4.3, 0.6, 1.04, 1.12, 0.48, 0.66, 0.4)] };

// ---------------------------------------------------------------- Rafale, Typhoon, Gripen

// Rafale C and M: the close-coupled canard delta with the intakes under the canards (15.27 x 10.8 x 5.34 m); the B two
// seats under a longer canopy, the spine raised behind it.
function rafale(two: boolean): FixedWingSpec {
  return {
    length: 15.27, span: 10.8, height: 5.34, bodyWidth: 1.9, bodyHeight: 1.6,
    // A slim drooped nose, the cockpit set high, the body widening over the two engines side by side (estimates).
    fuselage: {
      top: [[7.64, -0.1], [6.6, 0.22], [5.6, 0.42], [5.3, 0.48], [two ? 1.6 : 2.4, two ? 0.8 : 0.74], [0, 0.72], [-4, 0.6], [-7.3, 0.42]],
      bottom: [[7.64, -0.16], [6.6, -0.4], [5.4, -0.56], [4.0, -0.66], [2.0, -0.72], [-2, -0.7], [-5, -0.55], [-7.3, -0.4]],
      plan: [[7.64, 0.04], [6.6, 0.34], [5.4, 0.48], [4.2, 0.56], [2.4, 0.64], [0, 0.84], [-4, 0.95], [-7.3, 0.8]],
      round: [[7.6, 2.2], [4, 2.6], [0, 3.2], [-7.3, 3.2]],
      stations: 24,
    },
    // The split intakes low on the body's sides under the canard roots, the lower lip reaching forward, the trunks
    // fairing into the belly under the wing (estimates).
    bodies: [
      pod(-1.6, -4.2, 0.08, 5.32, -0.3, 0.1),
      { top: [[3.2, -0.42], [2.6, -0.04], [-1, -0.04], [-3.4, -0.2]], bottom: [[3.2, -0.56], [2.9, -0.88], [-1, -0.86], [-3.4, -0.62]], plan: [[3.2, 0.34], [-1, 0.36], [-3.4, 0.12]], side: 0.84, round: [[3.2, 4], [-3.4, 3]], stations: 12 },
    ],
    wing: { x: -2.4, span: 10.8, rootChord: 6.8, tipChord: 1.2, sweep: 48, mount: -0.2 },
    wingPlan: [[1.0, 0], [1.0, 1.2], [-3.4, 5.25], [-4.5, 5.25], [-5.4, 1.2], [-5.6, 0]],
    canard: { x: 2.0, span: 5.0, chord: 1.4 },
    tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 2.8, finChord: 3.4, finBase: 0.55 },
    finPlan: [[-3.6, 0], [-7.0, 0], [-7.3, 2.8], [-6.2, 2.8]],
    engines: { kind: 'internal', count: 2, diameter: 0.85, nozzles: [[-7.7, -0.46, 0.0], [-7.7, 0.46, 0.0]] },
    canopy: two ? { x: 3.4, length: 3.6, kind: 'tandem' } : { x: 3.9, length: 2.6, kind: 'bubble' },
    glass: [two ? tandem(5.4, 1.5, 1.14, 1.24, 0.48, 0.8, 0.4) : bubble(5.4, 2.3, 1.2, 0.48, 0.74, 0.4)],
  };
}
A['rafale'] = { ...rafale(false), cls: 'multirole' };
A['rafale-b'] = { ...rafale(true), cls: 'multirole' };

// Typhoon: canards far forward under the cockpit, the "smile" chin intake, a cranked delta well back, one fin
// (15.96 x 10.95 x 5.28 m); the two-seat T the same length with the rear seat raised under a longer canopy.
function typhoon(two: boolean): FixedWingSpec {
  return {
    length: 15.96, span: 10.95, height: 5.28, bodyWidth: 1.7, bodyHeight: 1.7,
    // A slim radome, the cockpit, the raised spine behind it over the airbrake, the body widening to the two
    // engines (estimates).
    fuselage: {
      top: [[7.98, -0.1], [6.9, 0.26], [5.8, 0.44], [5.5, 0.5], [two ? 1.6 : 2.6, two ? 0.8 : 0.74], [0, 0.74], [-4, 0.62], [-7.6, 0.45]],
      bottom: [[7.98, -0.16], [6.9, -0.4], [5.6, -0.52], [4.0, -0.6], [0, -0.62], [-4.5, -0.6], [-7.6, -0.45]],
      plan: [[7.98, 0.04], [6.9, 0.36], [5.6, 0.5], [4.0, 0.58], [1.0, 0.7], [-4, 0.85], [-7.6, 0.7]],
      round: [[8, 2.2], [4, 2.4], [0, 3], [-7.6, 3]],
      stations: 24,
    },
    // The chin intake about 1.7 m wide under the cockpit's rear, its lower lip curving up at the corners (the
    // "smile"), the duct fairing into the belly behind the wing's leading edge (estimates).
    bodies: [
      pod(-2.4, -5.0, 0.12, 5.48, -0.2, 0.25),
      { top: [[3.6, -0.32], [-3, -0.3], [-5.6, -0.32]], bottom: [[3.6, -0.56], [3.2, -1.16], [-1.5, -1.14], [-4.5, -0.78], [-5.6, -0.6]], plan: [[3.6, 0.84], [0, 0.9], [-3, 0.85], [-5.6, 0.6]], round: [[3.6, 3], [-1, 4], [-5.6, 4]], stations: 14 },
    ],
    wing: { x: -2.6, span: 10.95, rootChord: 7.4, tipChord: 0.9, sweep: 53, mount: -0.2 },
    wingPlan: [[1.4, 0], [1.4, 0.9], [-1.2, 2.8], [-4.0, 5.3], [-5.0, 5.3], [-5.7, 0.9], [-5.9, 0]],
    canard: { x: 4.7, span: 4.4, chord: 1.3 },
    tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 3.3, finChord: 3.6, finBase: 0.6 },
    finPlan: [[-3.4, 0], [-7.2, 0], [-7.6, 3.3], [-6.5, 3.3]],
    engines: { kind: 'internal', count: 2, diameter: 0.9, nozzles: [[-7.98, -0.47, 0.0], [-7.98, 0.47, 0.0]] },
    canopy: two ? { x: 3.6, length: 3.8, kind: 'tandem' } : { x: 4.0, length: 2.8, kind: 'bubble' },
    glass: [two ? tandem(5.6, 1.5, 1.16, 1.28, 0.5, 0.8, 0.42) : bubble(5.6, 2.4, 1.22, 0.5, 0.74, 0.42)],
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
    // A slim nose, the narrow cockpit section about 1.1 m across, the body over the wing box (the E's wider) and the
    // single engine (estimates).
    fuselage: {
      top: [[t, -0.1], [t - 1.1, 0.24], [t - 2.4, 0.44], [t - 2.6, 0.48], [two ? t - 6.4 : t - 5.6, two ? 0.72 : 0.68], [-4, 0.58], [-7.3, 0.42]],
      bottom: [[t, -0.16], [t - 1.1, -0.4], [t - 2.6, -0.56], [t - 3.6, -0.62], [0, -0.62], [-4, -0.55], [-7.3, -0.38]],
      plan: [[t, 0.04], [t - 1.1, 0.34], [t - 2.6, 0.5], [t - 3.6, 0.56], [0, e ? 0.82 : 0.66], [-4.5, e ? 0.78 : 0.7], [-7.3, 0.55]],
      round: [[t, 2.2], [t - 3.6, 2.4], [0, 3], [-7.3, 2.6]],
      stations: 24,
    },
    // The D-shaped side intakes, raked back from the upper lip, the canards set on them (estimates).
    bodies: [
      pod(-1.6, -3.6, 0.08, e ? 4.3 : 4.2, 0, 0.1),
      { top: [[3.6, 0.3], [-1.5, 0.3], [-3.4, 0.05]], bottom: [[3.6, 0.1], [3.2, -0.55], [-1.5, -0.56], [-3.4, -0.2]], plan: [[3.6, e ? 0.3 : 0.28], [-1.5, 0.3], [-3.4, 0.08]], side: e ? 0.82 : 0.78, round: [[3.6, 2.8], [-3.4, 2.6]], stations: 12 },
    ],
    wing: { x: -2.4, span: e ? 8.6 : 8.4, rootChord: 6.2, tipChord: 1.0, sweep: 45, mount: 0 },
    wingPlan: [[1.4, 0], [1.4, 1.1], [-1.2, 3.0], [-1.0, 3.05], [-3.0, e ? 4.3 : 4.2], [-4.1, e ? 4.3 : 4.2], [-4.6, 1.1], [-4.8, 0]],
    canard: { x: 2.6, span: 4.4, chord: 1.5 },
    tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 2.6, finChord: 3.0, finBase: 0.55 },
    finPlan: [[-3.4, 0], [-6.8, 0], [-7.1, 2.6], [-6.1, 2.6]],
    engines: { kind: 'internal', count: 1, diameter: 1.0, nozzles: [[-7.6, 0, 0.02]] },
    canopy: { x: t - 3.8, length: two ? 3.4 : 2.4, kind: two ? 'tandem' : 'bubble' },
    glass: [two ? tandem(t - 2.6, t - 6.4, 1.08, 1.18, 0.48, 0.72, 0.38) : bubble(t - 2.6, t - 5.4, 1.14, 0.48, 0.68, 0.38)],
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
const J10_VENTRAL: Outline = { top: [[-4.2, -0.5], [-6.9, -0.42]], bottom: [[-4.2, -0.55], [-5.4, -1.3], [-6.5, -1.3], [-6.9, -0.46]], plan: [[-4.2, 0.04], [-6.9, 0.04]], side: 0.5, round: 8, stations: 6 };
function j10(dsi: boolean, two: boolean): FixedWingSpec {
  // The chin intake under the cockpit's rear, about 1.3 m wide and 0.85 m deep below the belly: the J-10A's square
  // mouth on its splitter plate, the J-10C's DSI raked forward to its lower lip; the duct fairs into the belly under
  // the wing (estimates).
  const intake: Outline = dsi
    ? { top: [[5.0, -1.12], [4.3, -0.56], [0, -0.56], [-4.4, -0.54]], bottom: [[5.0, -1.3], [4.8, -1.46], [0, -1.42], [-2.5, -1.18], [-4.4, -0.7]], plan: [[5.0, 0.6], [4.3, 0.64], [0, 0.66], [-4.4, 0.46]], round: [[5.2, 5], [-4.4, 4]], stations: 14 }
    : { top: [[4.8, -0.56], [0, -0.56], [-4.4, -0.54]], bottom: [[4.8, -0.7], [4.65, -1.48], [0, -1.44], [-2.5, -1.18], [-4.4, -0.7]], plan: [[4.8, 0.66], [0, 0.68], [-4.4, 0.46]], round: [[4.8, 9], [0, 6], [-4.4, 4]], stations: 14 };
  return {
    length: 16.9, span: 9.75, height: 5.43, bodyWidth: 1.8, bodyHeight: 1.7,
    // A slim radome, the cockpit, the spine running back to the fin (higher behind the J-10S's second seat), the body
    // over the single engine (estimates).
    fuselage: {
      top: [[8.45, -0.12], [7.3, 0.24], [6.4, 0.44], [6.1, 0.5], [two ? 2.0 : 2.8, two ? 0.8 : 0.76], [0, 0.74], [-4, 0.62], [-7.9, 0.45]],
      bottom: [[8.45, -0.18], [7.3, -0.42], [6.2, -0.56], [4.6, -0.6], [0, -0.62], [-4, -0.62], [-7.9, -0.45]],
      plan: [[8.45, 0.04], [7.3, 0.36], [6.0, 0.52], [4.4, 0.6], [0, 0.75], [-4, 0.75], [-7.9, 0.58]],
      round: [[8.4, 2.2], [4.4, 2.6], [0, 3], [-7.9, 2.4]],
      stations: 24,
    },
    bodies: [intake, J10_VENTRAL],
    wing: { x: -2.4, span: 9.75, rootChord: 7.6, tipChord: 0.8, sweep: 54, mount: -0.2 },
    wingPlan: [[2.4, 0], [2.4, 0.9], [-0.6, 3.2], [-3.4, 4.85], [-4.4, 4.85], [-5.4, 0.9], [-5.6, 0]],
    canard: { x: 3.3, span: 5.4, chord: 1.6 },
    tail: { kind: 'single', tailSpan: 0, tailChord: 0, finHeight: 3.2, finChord: 3.6, finBase: 0.6 },
    finPlan: [[-3.6, 0], [-7.4, 0], [-7.8, 3.2], [-6.7, 3.2]],
    engines: { kind: 'internal', count: 1, diameter: 1.1, nozzles: [[-8.35, 0, 0.0]] },
    canopy: { x: 4.6, length: two ? 3.8 : 2.8, kind: two ? 'tandem' : 'bubble' },
    glass: [two ? tandem(6.2, 2.0, 1.18, 1.3, 0.5, 0.8, 0.42) : bubble(6.2, 2.8, 1.24, 0.5, 0.76, 0.42)],
  };
}
A['j-10'] = { ...j10(false, false), cls: 'multirole' };
A['j-10c'] = { ...j10(true, false), cls: 'multirole' };
A['j-10s'] = { ...j10(false, true), cls: 'multirole' };

// JF-17: bumped DSI intakes on the sides behind the cockpit, LERX into a trapezoid wing with tip rails, one fin,
// low all-moving tailplanes (14.93 x 9.45 x 4.72 m).
A['jf-17'] = {
  cls: 'multirole', length: 14.93, span: 9.45, height: 4.72, bodyWidth: 1.7, bodyHeight: 1.5,
  // A slim radome, the cockpit, the spine to the fin, the body over the single engine (estimates).
  fuselage: {
    top: [[7.46, -0.1], [6.4, 0.24], [5.2, 0.44], [5.0, 0.48], [2.4, 0.7], [0, 0.68], [-4, 0.58], [-7.2, 0.42]],
    bottom: [[7.46, -0.16], [6.4, -0.4], [5.0, -0.56], [3.0, -0.64], [0, -0.68], [-4, -0.58], [-7.2, -0.4]],
    plan: [[7.46, 0.04], [6.4, 0.34], [5.0, 0.48], [3.4, 0.54], [0, 0.66], [-4, 0.66], [-7.2, 0.5]],
    round: [[7.4, 2.2], [3.4, 2.4], [0, 2.8], [-7.2, 2.6]],
    stations: 24,
  },
  // The side intakes under the LERX's start, raked back from the upper lip, the DSI bump on the body ahead of each,
  // two ventral fins (estimates).
  bodies: [
    pod(-0.2, -2.8, 0.08, 4.72, 0, 0.1),
    { top: [[2.9, 0.3], [-1.5, 0.3], [-3.6, 0.05]], bottom: [[2.9, 0.1], [2.3, -0.62], [-1.5, -0.64], [-3.6, -0.3]], plan: [[2.9, 0.3], [-1.5, 0.32], [-3.6, 0.08]], side: 0.84, round: [[2.9, 3], [-3.6, 2.6]], stations: 12 },
    pod(3.7, 2.2, 0.2, 0.6, -0.12, 0.5),
    { ...J10_VENTRAL, top: [[-3.8, -0.46], [-6.2, -0.4]], bottom: [[-3.8, -0.5], [-4.8, -1.0], [-5.8, -1.0], [-6.2, -0.44]], plan: [[-3.8, 0.04], [-6.2, 0.04]], side: 0.42 },
  ],
  wing: { x: -1.4, span: 9.45, rootChord: 4.4, tipChord: 1.2, sweep: 38, mount: 0.1 },
  wingPlan: [[3.2, 0], [2.6, 0.9], [1.0, 1.15], [0.6, 1.4], [-1.9, 4.65], [-3.1, 4.65], [-3.6, 1.4], [-3.7, 0]],
  tail: { kind: 'single', finHeight: 2.6, finChord: 3.2, tailSpan: 5.0, tailChord: 1.8, finBase: 0.5, planeUp: -0.1 },
  finPlan: [[-3.2, 0], [-6.6, 0], [-7.0, 2.6], [-5.8, 2.6]],
  tailPlan: [[-5.0, 0.5], [-5.3, 0.8], [-6.4, 2.5], [-7.3, 2.5], [-7.4, 0.5]],
  engines: { kind: 'internal', count: 1, diameter: 1.0 },
  canopy: { x: 3.6, length: 2.6, kind: 'bubble' },
  glass: [bubble(5.1, 2.4, 1.14, 0.48, 0.7, 0.4)],
};

// ---------------------------------------------------------------- Tornado

// Tornado IDS and ECR: the huge fin, square side intakes, the glove and swing wing (half swept), tandem seats
// (16.72 x 11.4 x 5.95 m). The ADV is 1.36 m longer, with a longer radome and a plug behind the cockpit (18.68 m).
function tornado(adv: boolean): FixedWingSpec {
  const tip = adv ? 10.32 : 8.36;
  const c = adv ? 6.4 : 5.6;
  return {
    length: tip + 8.36, span: 11.4, height: 5.95, bodyWidth: 2.5, bodyHeight: 1.8,
    // The radome (the ADV's longer), the tandem cockpit, the deep, wide body over the two engines side by side under
    // the broad spine (estimates).
    fuselage: {
      top: [[tip, -0.05], [tip - 1.6, 0.36], [c + 0.2, 0.6], [c - 3.9, 0.92], [0, 0.92], [-4, 0.8], [-8, 0.55]],
      bottom: [[tip, -0.1], [tip - 1.6, -0.48], [c, -0.72], [2.6, -0.8], [-4, -0.9], [-8, -0.55]],
      plan: [[tip, 0.03], [tip - 1.6, 0.48], [c, 0.62], [2.6, 0.7], [0, 0.8], [-4, 1.0], [-8, 0.95]],
      round: [[tip, 2.4], [c, 2.8], [0, 3.6], [-8, 3.6]],
      stations: 26,
    },
    // The box intakes under the glove, their mouths raked back from the upper lip (estimates).
    bodies: [{ top: [[2.8, 0.5], [-2, 0.56], [-4.2, 0.4]], bottom: [[2.8, 0.35], [2.0, -0.92], [-2, -0.94], [-4.2, -0.8]], plan: [[2.8, 0.36], [-2, 0.4], [-4.2, 0.2]], side: 1.02, round: [[2.8, 10], [-4.2, 5]], stations: 12 }],
    wing: { x: -1.2, span: 11.4, rootChord: 3.4, tipChord: 1.0, sweep: 45, mount: 0.7 },
    wingPlan: [[2.8, 0], [2.8, 1.25], [0.0, 2.15], [-2.2, 2.15], [-3.2, 1.25], [-3.2, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
    tail: { kind: 'single', finHeight: 3.7, finChord: 5.8, tailSpan: 6.6, tailChord: 2.4, finBase: 0.7 },
    finPlan: [[-1.4, 0], [-7.2, 0], [-8.0, 3.7], [-6.2, 3.7], [-2.4, 0.4]],
    tailPlan: [[-5.2, 1.0], [-5.6, 1.3], [-7.4, 3.3], [-8.6, 3.3], [-8.6, 1.0]],
    engines: { kind: 'internal', count: 2, diameter: 1.0, nozzles: [[-8.35, -0.5, -0.05], [-8.35, 0.5, -0.05]] },
    canopy: { x: c - 1.8, length: 3.6, kind: 'tandem' },
    glass: [tandem(c, c - 3.8, 1.28, 1.38, 0.6, 0.92, 0.44)],
  };
}
A['tornado-ids'] = { ...tornado(false), cls: 'attack' };
A['tornado-adv'] = { ...tornado(true), cls: 'fighter' };
// J-20: a long canard delta with bumped DSI intakes on the sides, LERX into a cranked delta, two all-moving canted
// fins and two ventral fins (20.4 x 13.0 x 4.45 m).
A['j-20'] = {
  cls: 'fighter', length: 20.4, span: 13.0, height: 4.45, bodyWidth: 3.2, bodyHeight: 1.6,
  // A long chined nose, the cockpit, the wide flat body over the weapons bay and the engines (estimates).
  fuselage: {
    top: [[10.2, -0.1], [9.0, 0.22], [7.6, 0.46], [7.4, 0.5], [3.4, 0.72], [0, 0.66], [-6, 0.55], [-10.0, 0.35]],
    bottom: [[10.2, -0.16], [9.0, -0.4], [7.4, -0.56], [5.2, -0.66], [0, -0.75], [-6, -0.62], [-10.0, -0.35]],
    plan: [[10.2, 0.04], [9.0, 0.48], [7.4, 0.7], [5.4, 0.82], [3, 0.95], [0, 1.25], [-6, 1.4], [-10.0, 1.0]],
    round: [[10.2, 3.5], [7.4, 3.4], [0, 4], [-10, 4]],
    stations: 26,
  },
  // The DSI intakes beside the cockpit's rear under the canards, raked back from the upper lip, the bump ahead of
  // each, two ventral fins (estimates).
  bodies: [
    { top: [[5.0, 0.42], [0, 0.45], [-4, 0.3]], bottom: [[5.0, 0.2], [4.2, -0.66], [0, -0.72], [-4, -0.5]], plan: [[5.0, 0.42], [0, 0.46], [-4, 0.2]], side: 1.2, round: [[5.0, 6], [-4, 4]], stations: 12 },
    pod(5.9, 4.2, 0.24, 0.92, -0.1, 0.5),
    { top: [[-6.2, -0.5], [-8.8, -0.42]], bottom: [[-6.2, -0.55], [-7.2, -1.25], [-8.4, -1.25], [-8.8, -0.46]], plan: [[-6.2, 0.04], [-8.8, 0.04]], side: 1.15, round: 8, stations: 6 },
  ],
  wing: { x: -3.2, span: 13.0, rootChord: 8.0, tipChord: 1.2, sweep: 48, mount: 0.2 },
  wingPlan: [[3.6, 0], [3.0, 1.6], [0.8, 2.6], [-4.8, 6.5], [-6.0, 6.5], [-7.2, 1.6], [-7.2, 0]],
  canard: { x: 3.6, span: 6.0, chord: 1.7 },
  tail: { kind: 'twin', tailSpan: 0, tailChord: 0, finHeight: 2.2, finChord: 2.8, cant: 30, spacing: 3.2, finBase: 0.35 },
  finPlan: [[-6.2, 0], [-8.6, 0], [-9.4, 2.2], [-7.8, 2.2]],
  engines: { kind: 'internal', count: 2, diameter: 1.05, nozzles: [[-10.15, -0.72, -0.05], [-10.15, 0.72, -0.05]] },
  canopy: { x: 5.6, length: 3.4, kind: 'bubble' },
  glass: [bubble(7.5, 3.4, 1.22, 0.5, 0.72, 0.46)],
};

// Tu-160: the B-1's layout grown - a longer, slimmer nose, the swing wing out of a long glove blended into the
// body, the engine pairs far out under the glove, an all-moving upper fin with the tailplane part way up it
// (54.1 x 55.7 spread / 35.6 swept x 13.1 m; shown at a middle sweep).
A['tu-160'] = {
  cls: 'bomber', length: 54.1, span: 44.0, height: 13.1, bodyWidth: 5.0, bodyHeight: 3.2,
  // A long pointed radome with a slight droop, the cockpit section about 2.8 m across, the body flattening and
  // widening into the glove, the slim tail cone past the fin (estimates).
  fuselage: {
    top: [[27.05, -0.4], [25.4, 0.32], [23.6, 0.9], [22.2, 1.3], [20.2, 1.62], [12, 1.7], [0, 1.6], [-14, 1.4], [-22, 1.0], [-27.05, 0.5]],
    bottom: [[27.05, -0.5], [25.4, -0.98], [23.6, -1.3], [20, -1.55], [10, -1.65], [0, -1.6], [-14, -1.3], [-22, -0.8], [-27.05, -0.2]],
    plan: [[27.05, 0.1], [25.4, 0.7], [23.6, 1.08], [20, 1.4], [12, 1.6], [6, 3.0], [-4, 4.4], [-12, 3.2], [-20, 1.4], [-27.05, 0.6]],
    round: [[27, 2.2], [20, 2.4], [12, 2.8], [0, 6], [-20, 4], [-27, 2.4]],
    stations: 30,
  },
  // The paired engine nacelles under the glove, each about 2.6 m wide and 2.2 m deep, the intake mouths raked back
  // from the upper lip, the round engine bays aft (estimates).
  bodies: [{ top: [[2.4, -0.62], [-4, -0.6], [-11.0, -0.66]], bottom: [[2.4, -0.9], [1.0, -2.85], [-4, -2.85], [-8, -2.7], [-11.0, -2.4]], plan: [[2.4, 1.3], [-4, 1.32], [-11.0, 1.22]], side: 3.6, round: [[2.4, 10], [-3, 7], [-11, 4]], stations: 14 }],
  wing: { x: -2.0, span: 44.0, rootChord: 7.5, tipChord: 2.6, sweep: 40, mount: 0.4 },
  wingPlan: [[10, 0], [10, 2.6], [-0.8, 8.8], [-6.4, 8.8], [-7, 5], [-7, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
  tail: { kind: 'single', finHeight: 7.2, finChord: 9.0, tailSpan: 13.25, tailChord: 4.0, finBase: 1.3, planeUp: 3.4 },
  finPlan: [[-15, 0], [-25.2, 0], [-26.6, 7.2], [-22.6, 7.2]],
  tailPlan: [[-20.4, 0], [-22.4, 6.6], [-24.4, 6.6], [-25.8, 0]],
  engines: { kind: 'internal', count: 4, diameter: 1.1, nozzles: [[-11.2, -4.2, -1.7], [-11.2, -3.0, -1.7], [-11.2, 3.0, -1.7], [-11.2, 4.2, -1.7]] },
  canopy: { x: 21, length: 2.0, kind: 'framed' },
  glass: [sideBySide(22.2, 20.2, 1.85, 1.2, 1.55, 1.0)],
};
// Tu-22M3: a long fuselage with big wedge intakes along its sides, a low swing wing out of a fixed glove (shown
// at a middle sweep), the tall fin with its long dorsal fillet, the two nozzles side by side
// (42.46 x 34.28 spread / 23.3 swept x 11.05 m).
A['tu-22m3'] = {
  cls: 'bomber', length: 42.46, span: 28.0, height: 11.05, bodyWidth: 4.4, bodyHeight: 2.6,
  // A long pointed radome, the cockpit section about 2.3 m across, the slim body between the intakes widening aft
  // over the two engines side by side, the spine rising into the fin's fillet (estimates).
  fuselage: {
    top: [[21.23, -0.4], [19, 0.6], [17.2, 0.96], [16.6, 1.02], [14.2, 1.3], [8, 1.3], [-6, 1.25], [-12, 1.2], [-17, 0.98], [-21.23, 0.62]],
    bottom: [[21.23, -0.5], [19, -0.95], [16, -1.18], [8, -1.3], [0, -1.3], [-12, -1.15], [-17, -0.95], [-21.23, -0.6]],
    plan: [[21.23, 0.1], [19, 0.8], [15.5, 1.12], [10, 1.2], [0, 1.25], [-8, 1.5], [-13, 1.95], [-18, 1.6], [-21.23, 1.2]],
    round: [[21, 2.4], [13, 2.6], [0, 3], [-13, 4], [-21, 4]],
    stations: 30,
  },
  // The big wedge intakes along the sides from behind the cockpit, about 1.5 m wide and 2.3 m deep, their mouths
  // raked far back from the upper lip, the ducts merging into the engine bays (estimates).
  bodies: [{ top: [[13.2, 1.0], [0, 1.08], [-12, 0.95]], bottom: [[13.2, 0.7], [11.2, -1.3], [0, -1.32], [-12, -1.1]], plan: [[13.2, 0.72], [0, 0.78], [-12, 0.42]], side: 1.55, round: [[13.2, 10], [0, 7], [-12, 5]], stations: 14 }],
  wing: { x: -1.0, span: 28.0, rootChord: 8, tipChord: 2.2, sweep: 40, mount: -0.5 },
  wingPlan: [[6, 0], [6, 2.2], [1.6, 6.1], [-3.0, 6.1], [-5.6, 5.0], [-6.4, 2.2], [-6.4, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
  tail: { kind: 'single', finHeight: 5.6, finChord: 10.5, tailSpan: 15.0, tailChord: 4.4, finBase: 0.9, planeUp: 0.2 },
  finPlan: [[-8, 0], [-18.5, 0], [-20.6, 5.5], [-17.6, 5.6], [-10, 1.1]],
  tailPlan: [[-15, 1.0], [-17.5, 7.5], [-19.8, 7.5], [-20.4, 1.0]],
  engines: { kind: 'internal', count: 2, diameter: 1.4 },
  canopy: { x: 15.5, length: 2.2, kind: 'framed' },
  glass: [sideBySide(17.2, 14.4, 1.72, 0.96, 1.28, 0.95)],
};
// Tu-95MS: a slim fuselage, the 35-degree mid wing with four turboprops on long nacelles turning eight-bladed
// contra-rotating props, the tall swept fin, the radar nose (49.5 x 50.1 x 13.3 m). Tu-142: a longer fuselage, the
// glazed-free nose with a probe, the MAD fairing on the fin top (Tu-142M 53.07 m).
function bear(maritime: boolean): FixedWingSpec {
  const tip = maritime ? 28.3 : 24.75;
  return {
    length: tip + 24.75, span: 50.1, height: 13.3, bodyWidth: 2.9, bodyHeight: 3.0,
    // The round fuselage about 2.9 m across, the radar nose, the stepped cockpit, the tail tapering up to the
    // gunner's station (estimates).
    fuselage: {
      top: [[tip, -0.3], [tip - 1.75, 0.82], [tip - 3.2, 1.2], [tip - 5.2, 1.55], [10, 1.5], [-15, 1.42], [-22, 1.1], [-24.75, 0.7]],
      bottom: [[tip, -0.5], [tip - 1.75, -1.2], [tip - 5.8, -1.48], [0, -1.5], [-15, -1.38], [-22, -0.72], [-24.75, 0.0]],
      plan: [[tip, 0.15], [tip - 1.75, 0.95], [tip - 5.8, 1.45], [-15, 1.42], [-22, 0.85], [-24.75, 0.5]],
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
    glass: [sideBySide(tip - 3.2, tip - 5.2, 1.9, 1.2, 1.5, 1.0)],
  };
}
A['tu-95ms'] = { ...bear(false), cls: 'bomber' };
A['tu-142'] = { ...bear(true), cls: 'patrol' };
// H-6 (Tu-16): a mid swept wing with the two engines buried in its roots against the fuselage, the glazed nose,
// tail turret, tall swept fin (34.8 x 33.0 x 10.36 m). The H-6K has a solid radar nose and bigger engines.
function badger(k: boolean): FixedWingSpec {
  return {
    length: 34.8, span: 33.0, height: 10.36, bodyWidth: 2.6, bodyHeight: 2.6,
    // The round fuselage about 2.5 m across, the glazed nose (H-6) or the solid radome (H-6K), the tail cone with
    // its gun turret (H-6) or the longer fairing (H-6K) (estimates).
    fuselage: {
      top: [[17.4, k ? -0.3 : 0.0], [16.2, 0.8], [13.8, 1.25], [12.6, 1.35], [6, 1.3], [-10, 1.2], [-15.5, 0.8], [-17.4, 0.4]],
      bottom: [[17.4, k ? -0.4 : -0.5], [16.2, -1.0], [12, -1.3], [0, -1.32], [-10, -1.12], [-15.5, -0.5], [-17.4, -0.1]],
      plan: [[17.4, k ? 0.15 : 0.4], [16.2, 0.95], [12, 1.28], [-10, 1.2], [-15.5, 0.7], [-17.4, 0.35]],
      round: 2.2,
      stations: 26,
    },
    bodies: [
      // The engine nacelles in the wing roots hard against the fuselage, about 1.6 m across, their round intakes ahead
      // of the leading edge (bigger and further forward on the H-6K's D-30s), the nozzles just behind the wing (estimates).
      { top: [[k ? 7.4 : 6.6, 0.62], [3, 0.82], [-3, 0.8], [-6.4, 0.5]], bottom: [[k ? 7.4 : 6.6, -0.82], [3, -1.0], [-3, -0.96], [-6.4, -0.62]], plan: [[k ? 7.4 : 6.6, k ? 0.78 : 0.72], [3, 0.86], [-3, 0.82], [-6.4, 0.6]], side: 1.75, round: 2.4, stations: 12 },
      // The main gear's housings behind the wing (estimate).
      pod(-1.0, -8.6, 0.55, 5.6, -0.1, 0.1),
    ],
    wing: { x: 0, span: 33.0, rootChord: 8, tipChord: 2.4, sweep: 37, mount: 0 },
    wingPlan: [[4.6, 0], [4.6, 2.4], [-5.6, 16.5], [-8.0, 16.5], [-4.0, 2.4], [-4.0, 0]],
    tail: { kind: 'single', finHeight: 5.6, finChord: 6.4, tailSpan: 11.8, tailChord: 3.4, finBase: 1.1, planeUp: 0.3 },
    finPlan: [[-10, 0], [-15.8, 0], [-17.4, 5.6], [-14.8, 5.6], [-12, 1.0]],
    tailPlan: [[-12.6, 0], [-14.6, 5.9], [-16.4, 5.9], [-17.0, 0]],
    engines: { kind: 'internal', count: 2, diameter: k ? 1.3 : 1.15, nozzles: [[-6.6, -1.75, -0.15], [-6.6, 1.75, -0.15]] },
    canopy: { x: 12.8, length: 2.0, kind: 'framed' },
    glass: k ? [sideBySide(14.2, 12.4, 1.75, 1.15, 1.35, 0.85)] : [sideBySide(14.2, 12.4, 1.75, 1.15, 1.35, 0.85), { ...pod(17.6, 15.4, 0.75, 0, -0.1, 0.5), side: undefined }],
  };
}
A['h-6'] = { ...badger(false), cls: 'bomber' };
A['h-6k'] = { ...badger(true), cls: 'bomber' };

// ---------------------------------------------------------------- MiG-25 and MiG-31

// MiG-25PD: huge box intakes along a long flat body, a thin anhedral shoulder wing, twin fins canted out, a small
// low framed canopy (19.75 x 14.01 x 6.1 m). MiG-31: 2.9 m longer, two seats under two hoods one behind the other,
// a bigger radome (22.69 x 13.46 x 6.15 m).
function foxbat(two: boolean): FixedWingSpec {
  const tip = two ? 12.81 : 9.87;
  const d = tip - 9.87;
  // The intake boxes beside the cockpit, about 1.0 m wide and 1.6 m deep, the mouths raked back from the upper
  // lip, merging aft into the flat engine box (estimates).
  const lip = 5.0 + d * 0.4;
  const intake: Outline = { top: [[lip, 0.58], [0, 0.66], [-4, 0.6]], bottom: [[lip, 0.3], [lip - 1.1, -1.04], [0, -1.04], [-4, -0.96]], plan: [[lip, 0.5], [0, 0.52], [-4, 0.42]], side: 1.3, round: [[lip, 10], [-4, 6]], stations: 12 };
  return {
    length: tip + 9.88, span: two ? 13.46 : 14.01, height: two ? 6.15 : 6.1, bodyWidth: 3.6, bodyHeight: 1.9,
    // The slim radar nose (the MiG-31's bigger), the narrow cockpit between the intakes, then the long flat box of the
    // engine bays, about 3.5 m wide (estimates).
    fuselage: {
      top: [[tip, -0.1], [8.4 + d, two ? 0.32 : 0.26], [6.9 + d, 0.52], [5.4 + d * 0.5, 0.62], [3, 0.74], [-4, 0.7], [-9.4, 0.5]],
      bottom: [[tip, -0.16], [8.4 + d, -0.5], [6.4 + d, -0.68], [5 + d * 0.5, -0.74], [2.5, -0.92], [-4, -0.94], [-9.4, -0.6]],
      plan: [[tip, 0.03], [8.4 + d, two ? 0.5 : 0.45], [6.4 + d * 0.5, 0.66], [4.0, 0.76], [2.6, 1.3], [-1, 1.75], [-4, 1.8], [-9.4, 1.4]],
      round: [[tip, 2.2], [4.0, 2.6], [2.6, 6], [-9.4, 5]],
      stations: 28,
    },
    bodies: [intake],
    wing: { x: -2.4, span: two ? 13.46 : 14.01, rootChord: 7.0, tipChord: 1.6, sweep: 42, mount: 0.8, dihedral: -5 },
    wingPlan: [[1.0, 0], [1.0, 1.8], [-3.6, two ? 6.73 : 7.0], [-5.2, two ? 6.73 : 7.0], [-6.0, 1.8], [-6.0, 0]],
    tail: { kind: 'twin', finHeight: 3.4, finChord: 4.4, cant: 8, spacing: 3.2, tailSpan: 8.8, tailChord: 2.8, finBase: 0.7 },
    finPlan: [[-4.4, 0], [-8.8, 0], [-9.6, 3.4], [-8.0, 3.4]],
    tailPlan: [[-6.6, 1.2], [-8.6, 4.4], [-9.8, 4.4], [-10.2, 1.2]],
    engines: { kind: 'internal', count: 2, diameter: 1.3, nozzles: [[-9.75, -0.72, -0.05], [-9.75, 0.72, -0.05]] },
    canopy: { x: two ? 7.0 : 5.6, length: two ? 4.0 : 2.4, kind: two ? 'tandem' : 'framed' },
    glass: two ? [bubble(9.6, 8.0, 1.06, 0.5, 0.66, 0.42), bubble(7.9, 6.0, 1.1, 0.66, 0.74, 0.42)] : [bubble(6.9, 4.4, 1.06, 0.52, 0.74, 0.42)],
  };
}
A['mig-25pd'] = { ...foxbat(false), cls: 'fighter' };
A['mig-31'] = { ...foxbat(true), cls: 'fighter' };

export const JET_VARIANTS_WORLD: SpecSet = { air: A };
