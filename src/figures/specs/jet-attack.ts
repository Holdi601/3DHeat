/**
 * Attack aircraft, trainers, early jets and drones by variant, each variant
 * whose silhouette differs (canopy, nose, intakes, humps, wing, fin) as a
 * figure of its own. Helpers for canopies and add-ons come from
 * ./jet-variants.
 *
 * Sizes are published values; outlines are judged from the general shape of
 * the real aircraft (estimates, not traced from any drawing or game model).
 * Coordinates: forward from the aircraft's middle, out from the centre line,
 * up from the fuselage axis; metres.
 */

import type { Named, SpecSet } from './index';
import type { FixedWingSpec } from '../air';
import type { Outline, P2 } from '../parts';
import { bubble, pod, sideBySide, spine, tandem } from './jet-variants';
import { fig, post, trunk, type Fig, type Row } from './air-extra';
import { AIRCRAFT } from './aircraft';

const A: Named<FixedWingSpec> = {};

interface Make {
  cls: string;
  length: number;
  span: number;
  height: number;
  /** The fuselage's side profile (top and bottom) and plan, and how round it is. */
  top: P2[];
  bottom: P2[];
  plan: P2[];
  round?: number | P2[];
  /** The wing's half planform, its height on the body and its dihedral (degrees). */
  wing: P2[];
  wingUp?: number;
  dihedral?: number;
  /** The fin's outline (forward, up from `finBase`); the tailplane's half planform at `planeUp`. */
  fin: P2[];
  finBase: number;
  tail?: P2[];
  planeUp?: number;
  /** Twin fins this far apart; a V-tail. */
  twin?: number;
  v?: boolean;
  /** Exhausts at the tail: how many, and their diameter (none when 0). */
  engines?: number;
  nozzle?: number;
  glass: Outline[];
  bodies?: Outline[];
  canard?: { x: number; span: number; chord: number };
  propeller?: { diameter: number; blades: number };
}

/** A figure from its outlines: the fuselage, the bodies on it, the wing, fin and tailplane, the canopy as glass. */
function make(p: Make): FixedWingSpec & { cls: string } {
  const bw = 2 * Math.max(...p.plan.map((q) => q[1]));
  const bh = Math.max(...p.top.map((q) => q[1])) - Math.min(...p.bottom.map((q) => q[1]));
  const fh = Math.max(...p.fin.map((q) => Math.abs(q[1])));
  const ws = Math.max(...p.wing.map((q) => q[1]));
  const ts = p.tail ? Math.max(...p.tail.map((q) => q[1])) : 0;
  const kind = p.v ? 'v' : p.twin ? 'twin' : p.planeUp !== undefined && p.planeUp >= p.finBase + fh * 0.9 ? 't' : 'single';
  return {
    cls: p.cls,
    length: p.length,
    span: p.span,
    height: p.height,
    bodyWidth: bw,
    bodyHeight: bh,
    fuselage: { top: p.top, bottom: p.bottom, plan: p.plan, round: p.round ?? 2.6, stations: 24 },
    bodies: p.bodies,
    glass: p.glass,
    wing: { x: 0, span: 2 * ws, rootChord: 3, tipChord: 1, sweep: 30, mount: (p.wingUp ?? 0) / (bh * 0.4), dihedral: p.dihedral ?? 0 },
    wingPlan: p.wing,
    canard: p.canard,
    tail: { kind, finHeight: fh, finChord: 3, spacing: p.twin, tailSpan: 2 * ts, tailChord: 1.5, finBase: p.finBase, planeUp: kind === 't' ? undefined : (p.planeUp ?? 0) },
    finPlan: p.fin,
    tailPlan: p.tail,
    engines: p.propeller ? { kind: 'pusher', count: 1 } : p.engines === 0 ? undefined : { kind: 'internal', count: p.engines ?? 1, diameter: p.nozzle ?? bh * 0.5 },
    propeller: p.propeller,
    canopy: { x: 0, length: 1, kind: 'bubble' },
  };
}

/** A body's outline moved forward or back by `dx`. */
function shift(o: Outline, dx: number): Outline {
  const m = (q: P2[]) => q.map(([x, v]) => [x + dx, v] as P2);
  return { ...o, top: m(o.top), bottom: m(o.bottom), plan: m(o.plan) };
}

/** A profile with the points ahead of `x` replaced: a new nose on the same body. */
function nose(line: P2[], x: number, front: P2[]): P2[] {
  return [...front, ...line.filter((q) => q[0] < x)];
}

// ---------------------------------------------------------------- Harrier

// First-generation Harrier (GR.1/GR.3, AV-8A/C/S): the low canopy, the big intakes beside it, the shoulder wing with
// 12 degrees of anhedral and outrigger wheels at the tips, four nozzles on the body's sides, an anhedral tailplane
// (13.87 x 7.7 x 3.45 m). The GR.3 with the long chisel laser nose; the AV-8A and GR.1 with the plain pointed one.
const HARRIER_TOP: P2[] = [[6.94, -0.12], [6.3, 0.18], [5.2, 0.45], [4.6, 0.55], [3.0, 0.8], [1.0, 0.8], [-1.5, 0.75], [-3.5, 0.55], [-6.9, 0.3]];
const HARRIER_BOTTOM: P2[] = [[6.94, -0.3], [6.0, -0.55], [4.4, -0.75], [3.0, -0.95], [-0.5, -0.95], [-2.5, -0.6], [-6.9, -0.1]];
const HARRIER_PLAN: P2[] = [[6.94, 0.05], [6.2, 0.4], [4.8, 0.55], [3.8, 0.6], [3.3, 1.15], [1.0, 1.2], [-1.5, 1.0], [-3.0, 0.55], [-6.9, 0.25]];
const NOZZLES = [pod(1.3, 0.5, 0.26, 1.25, -0.55, 0.3), pod(-0.6, -1.4, 0.26, 1.15, -0.55, 0.3)];
const HARRIER1: Make = {
  cls: 'attack', length: 13.87, span: 7.7, height: 3.45,
  top: HARRIER_TOP, bottom: HARRIER_BOTTOM, plan: HARRIER_PLAN, round: [[6.9, 2.4], [3.4, 3.4], [-6.9, 2.6]],
  wing: [[1.4, 0], [1.4, 1.1], [-0.46, 3.85], [-1.36, 3.85], [-2.4, 1.1], [-2.4, 0]], wingUp: 0.8, dihedral: -12,
  fin: [[-3.6, 0], [-6.3, 0], [-6.6, 1.4], [-5.6, 1.48]], finBase: 0.4,
  tail: [[-5.0, 0.3], [-5.6, 2.1], [-6.4, 2.1], [-6.6, 0.3]], planeUp: 0.1,
  engines: 0,
  glass: [bubble(4.7, 2.9, 1.02, 0.55, 0.78, 0.38)],
  bodies: [...NOZZLES, pod(-0.9, -1.9, 0.12, 3.7, -0.15)],
};
A['harrier-gr3'] = make({ ...HARRIER1, top: nose(HARRIER_TOP, 6.0, [[7.2, -0.05], [6.6, 0.05], [6.1, 0.2]]), bottom: nose(HARRIER_BOTTOM, 6.0, [[7.2, -0.35], [6.6, -0.42], [6.1, -0.52]]), plan: nose(HARRIER_PLAN, 6.0, [[7.2, 0.18], [6.6, 0.3], [6.1, 0.42]]), length: 14.27 });
A['av-8a'] = make({ ...HARRIER1, length: 13.69, top: nose(HARRIER_TOP, 6.2, [[6.85, -0.15], [6.3, 0.18]]), bottom: nose(HARRIER_BOTTOM, 6.0, [[6.85, -0.25], [6.0, -0.55]]), plan: nose(HARRIER_PLAN, 6.2, [[6.85, 0.04], [6.2, 0.4]]) });

// Sea Harrier FRS.1: the first-generation wing with the cockpit raised high in a bubble, the pointed Blue Fox radome
// (14.5 x 7.6 x 3.71 m). FA.2: the rounder, fatter Blue Vixen radome and a longer rear body.
const SHAR_TOP: P2[] = [[7.25, -0.08], [6.6, 0.22], [5.6, 0.48], [4.8, 0.72], [3.0, 0.98], [1.0, 0.92], [-1.5, 0.78], [-3.5, 0.55], [-7.2, 0.3]];
const SHAR: Make = {
  ...HARRIER1, length: 14.5, span: 7.6, height: 3.71,
  top: SHAR_TOP, bottom: [[7.25, -0.12], [6.4, -0.5], [4.6, -0.75], [3.0, -0.95], [-0.5, -0.95], [-2.5, -0.6], [-7.2, -0.1]], plan: [[7.25, 0.03], [6.4, 0.4], [4.8, 0.58], [3.8, 0.62], [3.3, 1.15], [1.0, 1.2], [-1.5, 1.0], [-3.0, 0.55], [-7.2, 0.25]],
  glass: [bubble(4.9, 3.0, 1.28, 0.72, 0.98, 0.4)],
};
A['sea-harrier-frs1'] = make(SHAR);
A['sea-harrier-fa2'] = make({
  ...SHAR, length: 14.17,
  top: nose(SHAR_TOP, 5.6, [[7.4, 0.12], [7.0, 0.38], [6.2, 0.55], [5.6, 0.6]]),
  bottom: [[7.4, -0.25], [6.8, -0.55], [4.6, -0.75], [3.0, -0.95], [-0.5, -0.95], [-2.5, -0.6], [-7.2, -0.1]],
  plan: [[7.4, 0.2], [6.8, 0.5], [5.6, 0.62], [3.8, 0.62], [3.3, 1.15], [1.0, 1.2], [-1.5, 1.0], [-3.0, 0.55], [-7.2, 0.25]],
});

// Second generation (AV-8B, GR.5/7/9): the bigger wing with less sweep and LERX, the cockpit raised in a big bubble,
// the night-attack FLIR hump on the nose (14.12 x 9.25 x 3.55 m). AV-8B Plus: the radar nose (14.55 m). T.10 / TAV-8B:
// two seats under a long stepped canopy, a taller fin (15.79 m).
const BEE_TOP: P2[] = [[7.06, -0.12], [6.5, 0.2], [5.6, 0.48], [4.8, 0.72], [3.0, 1.0], [1.0, 0.95], [-1.5, 0.8], [-3.5, 0.55], [-7.0, 0.3]];
const BEE: Make = {
  ...HARRIER1, length: 14.12, span: 9.25, height: 3.55,
  top: BEE_TOP, bottom: [[7.06, -0.22], [6.4, -0.52], [4.6, -0.75], [3.0, -0.95], [-0.5, -0.95], [-2.5, -0.6], [-7.0, -0.1]], plan: [[7.06, 0.05], [6.4, 0.42], [4.8, 0.6], [3.8, 0.62], [3.3, 1.18], [1.0, 1.22], [-1.5, 1.0], [-3.0, 0.55], [-7.0, 0.25]],
  wing: [[2.6, 0], [2.4, 1.0], [1.4, 1.3], [0.0, 4.62], [-1.1, 4.62], [-2.6, 1.3], [-2.7, 0]], wingUp: 0.85, dihedral: -12,
  glass: [bubble(5.0, 2.9, 1.32, 0.72, 1.0, 0.42)],
  bodies: [...NOZZLES, pod(-0.6, -1.6, 0.12, 4.0, -0.2)],
};
const FLIR_HUMP = spine(6.3, 5.1, 0.45, 0.24, 0.17);
A['av-8b'] = make({ ...BEE, bodies: [...BEE.bodies!, FLIR_HUMP] });
A['av-8b-plus'] = make({ ...BEE, length: 14.55, top: nose(BEE_TOP, 6.0, [[7.28, 0.0], [6.9, 0.35], [6.3, 0.55]]), bottom: [[7.28, -0.3], [6.8, -0.55], [4.6, -0.75], [3.0, -0.95], [-0.5, -0.95], [-2.5, -0.6], [-7.0, -0.1]], plan: [[7.28, 0.15], [6.8, 0.45], [5.6, 0.6], [3.8, 0.62], [3.3, 1.18], [1.0, 1.22], [-1.5, 1.0], [-3.0, 0.55], [-7.0, 0.25]], bodies: [...BEE.bodies!, shift(FLIR_HUMP, -0.6)] });
A['harrier-t10'] = make({
  ...BEE, length: 15.79,
  top: [[7.9, -0.12], [7.3, 0.2], [6.4, 0.48], [5.6, 0.72], [3.0, 1.05], [1.0, 0.95], [-1.5, 0.8], [-3.5, 0.55], [-7.9, 0.3]],
  bottom: [[7.9, -0.22], [7.2, -0.52], [4.6, -0.75], [3.0, -0.95], [-0.5, -0.95], [-2.5, -0.6], [-7.9, -0.1]],
  plan: [[7.9, 0.05], [7.2, 0.42], [5.6, 0.6], [3.8, 0.62], [3.3, 1.18], [1.0, 1.22], [-1.5, 1.0], [-3.0, 0.55], [-7.9, 0.25]],
  fin: [[-4.2, 0], [-7.2, 0], [-7.6, 1.75], [-6.4, 1.85]], tail: [[-5.8, 0.3], [-6.4, 2.1], [-7.2, 2.1], [-7.4, 0.3]],
  glass: [tandem(5.8, 2.0, 1.3, 1.5, 0.72, 1.05, 0.42)], bodies: [...BEE.bodies!, shift(FLIR_HUMP, 0.8)],
});

// ---------------------------------------------------------------- A-4 Skyhawk

// The small delta-like low wing, side intakes, the canopy over a short nose, the tailplane half way up the fin
// (12.22 x 8.38 x 4.57 m). B/C: the early round-topped fin and small canopy. E: the longer nose. F, and the A-4PTM:
// the avionics hump behind the cockpit. M and N: the hump, the bigger canopy and the square-topped fin; H and N with
// the long tailpipe.
const SKY_TOP: P2[] = [[6.11, -0.15], [5.4, 0.3], [4.2, 0.6], [3.4, 0.72], [1.6, 0.8], [0, 0.75], [-3, 0.58], [-6.0, 0.42]];
const SKY_BOTTOM: P2[] = [[6.11, -0.3], [5.2, -0.62], [3.6, -0.8], [0, -0.85], [-3.0, -0.66], [-6.0, -0.42]];
// The half-round intakes on the body's sides behind the cockpit.
const SKY_INTAKE = trunk(2.5, -1.2, 0.5, -0.6, 0.3, 0.68, 0, 2.2);
const SKY_PLAN: P2[] = [[6.11, 0.04], [5.2, 0.35], [3.8, 0.5], [2.6, 0.55], [2.2, 0.95], [-0.5, 0.95], [-2.5, 0.7], [-6.0, 0.4]];
const SKY: Make = {
  cls: 'attack', length: 12.22, span: 8.38, height: 4.57,
  top: SKY_TOP, bottom: SKY_BOTTOM, plan: SKY_PLAN,
  wing: [[1.6, 0], [1.6, 0.7], [-0.87, 4.19], [-1.67, 4.19], [-3.2, 0.7], [-3.2, 0]], wingUp: -0.45,
  fin: [[-2.6, 0], [-5.6, 0], [-6.1, 2.3], [-5.7, 2.5], [-5.0, 2.55], [-4.6, 2.4]], finBase: 0.45,
  tail: [[-4.6, 0], [-5.3, 1.7], [-6.1, 1.7], [-6.1, 0]], planeUp: 1.4,
  nozzle: 0.6,
  glass: [bubble(3.9, 2.5, 1.2, 0.68, 0.76, 0.38)],
  bodies: [SKY_INTAKE],
};
const SQUARE_FIN: P2[] = [[-2.6, 0], [-5.6, 0], [-6.15, 2.75], [-4.85, 2.75]];
// The avionics hump: from the canopy's back, nearly as high, sloping down to the fin.
const SKY_HUMP: Outline = { top: [[2.6, 0.8], [2.3, 1.08], [0.6, 1.02], [-2.4, 0.76], [-2.9, 0.62]], bottom: [[2.6, 0.5], [-2.9, 0.4]], plan: [[2.6, 0.18], [2.3, 0.3], [0.6, 0.3], [-2.4, 0.22], [-2.9, 0.1]], round: 3, stations: 10 };
const LONG_PIPE = pod(-5.6, -6.6, 0.32, 0, 0.0, 0.05);
A['a-4b'] = make(SKY);
A['a-4e'] = make({ ...SKY, length: 12.52, top: nose(SKY_TOP, 5.4, [[6.26, -0.15], [5.5, 0.28]]), bottom: nose(SKY_BOTTOM, 5.2, [[6.26, -0.25], [5.3, -0.55]]), plan: nose(SKY_PLAN, 5.2, [[6.26, 0.04], [5.3, 0.35]]) });
A['a-4f'] = make({ ...SKY, length: 12.52, top: nose(SKY_TOP, 5.4, [[6.26, -0.15], [5.5, 0.28]]), bodies: [SKY_INTAKE, SKY_HUMP] });
// The catalogue's plain 'a-4' is the A-4E.
A['a-4'] = A['a-4e'];
A['a-4h'] = make({ ...SKY, length: 12.52, fin: SQUARE_FIN, bodies: [SKY_INTAKE, LONG_PIPE] });
A['a-4m'] = make({ ...SKY, length: 12.27, fin: SQUARE_FIN, glass: [bubble(4.0, 2.2, 1.3, 0.68, 0.8, 0.42)], bodies: [SKY_INTAKE, SKY_HUMP] });
A['a-4n'] = make({ ...SKY, length: 12.27, fin: SQUARE_FIN, glass: [bubble(4.0, 2.2, 1.3, 0.68, 0.8, 0.42)], bodies: [SKY_INTAKE, SKY_HUMP, LONG_PIPE] });

// ---------------------------------------------------------------- A-6, A-7, AMX

// A-6E Intruder: two seats side by side under a broad canopy behind the bulbous radome, the refuelling probe standing
// up in front of the windscreen, the TRAM turret under the nose, a mid wing of 25 degrees (16.69 x 16.15 x 4.93 m).
A['a-6e'] = make({
  cls: 'attack', length: 16.69, span: 16.15, height: 4.93,
  top: [[8.345, -0.1], [7.8, 0.4], [7.0, 0.75], [6.2, 0.9], [4.0, 1.0], [1.0, 0.85], [-3, 0.6], [-8.2, 0.4]],
  bottom: [[8.345, -0.3], [7.6, -0.75], [6.4, -0.95], [4.0, -1.0], [0, -1.0], [-3, -0.7], [-8.2, -0.3]],
  plan: [[8.345, 0.2], [7.6, 0.75], [6.4, 1.0], [4.0, 1.1], [1.0, 1.1], [-3, 0.8], [-8.2, 0.4]],
  wing: [[1.6, 0], [1.6, 1.1], [-1.75, 8.07], [-3.15, 8.07], [-3.0, 1.1], [-3.0, 0]], wingUp: 0.1,
  fin: [[-4.2, 0], [-7.6, 0], [-8.6, 2.9], [-7.2, 2.95]], finBase: 0.55,
  tail: [[-5.8, 0.3], [-6.6, 3.1], [-7.7, 3.1], [-8.0, 0.3]], planeUp: 0.1,
  engines: 2, nozzle: 0.75,
  glass: [sideBySide(6.3, 3.8, 1.55, 0.92, 0.95, 0.75)],
  bodies: [pod(4.6, -2.4, 0.45, 1.05, -0.45, 0.15), pod(8.6, 6.4, 0.06, 0, 1.0, 0.1), pod(7.2, 6.6, 0.3, 0, -0.95, 0.4)],
});
// A-7 Corsair II: the stubby body over the big chin intake, the shoulder wing with anhedral, a tall fin (14.06 x 11.8
// x 4.9 m). A-7K: the two-seater, 0.86 m longer with the stepped tandem canopy.
const CORSAIR: Make = {
  cls: 'attack', length: 14.06, span: 11.8, height: 4.9,
  top: [[7.03, 0.05], [6.6, 0.4], [5.6, 0.65], [4.6, 0.8], [2.0, 0.85], [-2, 0.7], [-5, 0.55], [-7.0, 0.45]],
  bottom: [[7.03, -0.6], [6.6, -0.9], [5.0, -1.0], [1.0, -0.95], [-2.5, -0.7], [-7.0, -0.4]],
  plan: [[7.03, 0.45], [6.6, 0.7], [5.0, 0.85], [1.0, 0.95], [-2.5, 0.8], [-7.0, 0.45]],
  round: 2.8,
  wing: [[1.6, 0], [1.6, 0.9], [-2.1, 5.9], [-3.3, 5.9], [-3.7, 0.9], [-3.7, 0]], wingUp: 0.75, dihedral: -5,
  fin: [[-2.4, 0], [-6.2, 0], [-6.9, 2.7], [-5.5, 2.75]], finBase: 0.75,
  tail: [[-5.0, 0.4], [-5.8, 2.75], [-6.8, 2.75], [-7.0, 0.4]], planeUp: -0.1,
  nozzle: 0.75,
  glass: [bubble(4.9, 3.0, 1.38, 0.8, 0.85, 0.42)],
};
A['a-7'] = make(CORSAIR);
A['a-7k'] = make({ ...CORSAIR, length: 14.92, top: [[7.46, 0.05], [7.0, 0.4], [6.0, 0.65], [5.0, 0.8], [2.0, 0.88], [-2, 0.7], [-5, 0.55], [-7.0, 0.45]], bottom: [[7.46, -0.6], [7.0, -0.9], [5.0, -1.0], [1.0, -0.95], [-2.5, -0.7], [-7.0, -0.4]], plan: [[7.46, 0.45], [7.0, 0.7], [5.0, 0.85], [1.0, 0.95], [-2.5, 0.8], [-7.0, 0.45]], glass: [tandem(5.4, 1.9, 1.36, 1.5, 0.8, 0.88, 0.42)] });
// AMX: a small shoulder-winged attack jet with side intakes and a big fin (13.23 x 8.87 x 4.55 m).
A['amx'] = make({
  cls: 'attack', length: 13.23, span: 8.87, height: 4.55,
  top: [[6.62, -0.1], [6.0, 0.3], [5.0, 0.55], [4.2, 0.65], [2.0, 0.7], [-2, 0.6], [-6.5, 0.4]],
  bottom: [[6.62, -0.2], [5.8, -0.5], [4.2, -0.7], [0, -0.75], [-3, -0.6], [-6.5, -0.35]],
  plan: [[6.62, 0.05], [5.8, 0.38], [4.2, 0.55], [3.2, 0.58], [2.8, 1.0], [-1, 1.0], [-4, 0.7], [-6.5, 0.45]],
  wing: [[1.6, 0], [1.6, 0.9], [-0.6, 4.43], [-1.5, 4.43], [-2.6, 0.9], [-2.6, 0]], wingUp: 0.6,
  fin: [[-2.4, 0], [-5.8, 0], [-6.6, 2.6], [-5.4, 2.7]], finBase: 0.55,
  tail: [[-4.6, 0.4], [-5.4, 2.3], [-6.3, 2.3], [-6.5, 0.4]], planeUp: 0.1,
  nozzle: 0.7,
  glass: [bubble(4.4, 2.6, 1.2, 0.65, 0.7, 0.38)],
  bodies: [trunk(3.0, -1.2, 0.4, -0.6, 0.32, 0.7, 0, 2.6)],
});

// ---------------------------------------------------------------- Su-7, Su-17/20/22, Su-24, JH-7

// Su-7B: a round body with the nose intake and its cone, a fixed 60-degree wing, a dorsal spine (16.8 x 9.31 x 4.8 m).
const SU7: Make = {
  cls: 'attack', length: 16.8, span: 9.31, height: 4.8,
  top: [[8.4, 0.5], [7.0, 0.6], [4.8, 0.7], [3.6, 0.85], [1.0, 0.85], [-3, 0.7], [-8.2, 0.55]],
  bottom: [[8.4, -0.5], [6.0, -0.62], [0, -0.7], [-4, -0.65], [-8.2, -0.55]],
  plan: [[8.4, 0.5], [6.5, 0.62], [2, 0.72], [-4, 0.7], [-8.2, 0.55]], round: 2.1,
  wing: [[1.2, 0], [1.2, 0.7], [-2.8, 4.65], [-3.6, 4.65], [-4.2, 0.7], [-4.2, 0]],
  fin: [[-3.6, 0], [-7.6, 0], [-8.6, 2.6], [-7.4, 2.7]], finBase: 0.6,
  tail: [[-5.8, 0.5], [-6.8, 2.4], [-7.8, 2.4], [-8.0, 0.5]], planeUp: -0.1,
  nozzle: 0.95,
  glass: [bubble(4.4, 2.8, 1.12, 0.7, 0.85, 0.38)],
  bodies: [pod(9.2, 8.2, 0.3, 0, 0, 0.6), spine(2.8, -3.0, 0.85, 0.15, 0.22)],
};
A['su-7b'] = make(SU7);
// Su-17M2 / Su-22M: the Su-7's body lengthened with the swing-wing outer panels (shown half swept), a bigger cone and a
// longer spine (18.2 x 11.8 at this sweep x 5.0 m). Su-17M4 / Su-22M4: the fixed cone and the ram-air scoop at the
// fin's root. Su-22UM3K: two seats, the instructor's canopy stepped up behind with the long hump to the fin.
const FITTER_TOP: P2[] = [[9.1, 0.52], [7.6, 0.62], [5.4, 0.72], [4.2, 0.9], [1.4, 0.9], [-3, 0.75], [-8.9, 0.58]];
const FITTER: Make = {
  ...SU7, length: 18.2, span: 11.8, height: 5.0,
  top: FITTER_TOP, bottom: [[9.1, -0.52], [6.6, -0.64], [0, -0.72], [-4, -0.68], [-8.9, -0.58]], plan: [[9.1, 0.52], [7.2, 0.64], [2, 0.74], [-4, 0.72], [-8.9, 0.58]],
  wing: [[1.2, 0], [1.2, 0.75], [-1.5, 2.5], [-3.3, 2.5], [-4.6, 0.75], [-4.6, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
  fin: [[-4.0, 0], [-8.2, 0], [-9.3, 2.8], [-8.0, 2.9]], finBase: 0.65,
  tail: [[-6.4, 0.5], [-7.4, 2.6], [-8.5, 2.6], [-8.7, 0.5]],
  glass: [bubble(5.1, 3.5, 1.15, 0.72, 0.9, 0.38)],
  bodies: [pod(10.0, 8.8, 0.34, 0, 0, 0.6), spine(3.5, -3.6, 0.9, 0.2, 0.24)],
};
A['su-17m2'] = make(FITTER);
A['su-17m4'] = make({ ...FITTER, bodies: [...FITTER.bodies!, pod(-3.4, -4.4, 0.16, 0, 1.0, 0.3)] });
A['su-22um3k'] = make({ ...FITTER, glass: [tandem(5.2, 2.6, 1.15, 1.3, 0.72, 0.95, 0.38)], bodies: [pod(10.0, 8.8, 0.34, 0, 0, 0.6), spine(2.8, -4.0, 0.95, 0.32, 0.28)] });

// Su-24M: two seats side by side behind a big radome, box intakes, the glove and swing wing (shown at 45 degrees),
// twin engines, one big fin (22.67 x 14.0 at this sweep x 6.19 m).
A['su-24m'] = make({
  cls: 'attack', length: 22.67, span: 14.0, height: 6.19,
  top: [[11.3, -0.1], [10.3, 0.45], [8.8, 0.85], [7.8, 1.05], [5.5, 1.1], [2, 1.0], [-4, 0.85], [-11.2, 0.6]],
  bottom: [[11.3, -0.15], [10.2, -0.6], [8.4, -0.85], [6.6, -0.9], [6.2, -1.2], [-4, -1.15], [-8, -0.8], [-11.2, -0.5]],
  plan: [[11.3, 0.05], [10.2, 0.6], [8.4, 0.85], [7.0, 0.95], [6.6, 1.5], [-3, 1.55], [-8, 1.3], [-11.2, 1.05]],
  round: [[11, 2.4], [7, 2.6], [6.5, 5], [-11, 4]],
  wing: [[3.8, 0], [3.8, 1.5], [0.0, 2.9], [-2.6, 2.9], [-4.6, 1.55], [-4.6, 0]], wingUp: 0.85,  // the fixed glove; the outer panel swings in ./swing.ts
  fin: [[-5.4, 0], [-10.4, 0], [-11.4, 3.5], [-9.6, 3.6]], finBase: 1.0,
  tail: [[-7.8, 1.3], [-9.0, 4.0], [-10.6, 4.0], [-11.0, 1.3]], planeUp: 0.1,
  engines: 2, nozzle: 1.0,
  glass: [sideBySide(8.3, 6.2, 1.62, 1.0, 1.1, 0.78)],
});
// JH-7: two seats in tandem, side intakes, a shoulder wing with a dogtooth, twin engines, a tall fin (22.33 x 12.8 x 6.58 m).
const FLOUNDER: Make = {
  cls: 'attack', length: 22.33, span: 12.8, height: 6.58,
  top: [[11.165, -0.1], [10.0, 0.45], [8.4, 0.85], [7.4, 1.0], [4.0, 1.05], [-3, 0.9], [-11.0, 0.6]],
  bottom: [[11.165, -0.15], [10.0, -0.55], [8.0, -0.8], [6.4, -0.85], [6.0, -1.15], [-4, -1.1], [-11, -0.5]],
  plan: [[11.165, 0.05], [10.0, 0.55], [8.0, 0.8], [6.6, 0.85], [6.2, 1.4], [-3, 1.45], [-8, 1.25], [-11, 1.0]],
  round: [[11, 2.4], [6.5, 2.6], [6, 5], [-11, 4]],
  wing: [[2.4, 0], [2.4, 1.45], [-1.4, 4.2], [-1.2, 4.25], [-3.4, 6.4], [-4.6, 6.4], [-5.0, 1.45], [-5.0, 0]], wingUp: 0.85, dihedral: -3,
  fin: [[-4.6, 0], [-9.8, 0], [-10.8, 3.7], [-9.0, 3.8]], finBase: 1.0,
  tail: [[-7.6, 1.2], [-8.6, 4.0], [-10.2, 4.0], [-10.6, 1.2]], planeUp: 0.0,
  engines: 2, nozzle: 0.95,
  glass: [tandem(8.6, 4.8, 1.55, 1.75, 0.95, 1.0, 0.5)],
};
A['jh-7'] = make(FLOUNDER);

// ---------------------------------------------------------------- Su-25

// Su-25 (K, SM, BM): the long drooping nose, the armoured cockpit high behind it and its fairing to the fin, the deep
// engine trunks from intakes beside the cockpit along the body under the shoulder wing to nozzles past its trailing
// edge, the split airbrakes' pods on the wingtips (15.53 x 14.36 x 4.8 m). Su-25T/TM: the broad nose with the Shkval
// window and the tall hump behind the single cockpit where the trainer's second seat was (15.33 m). Su-25UB: two
// seats, the instructor's high behind, a taller fin (15.36 m).
const FROG_REAR: Row[] = [[2.8, 0.78, -0.82, 0.58], [1.5, 0.82, -0.8, 0.6], [0, 0.82, -0.72, 0.58], [-2.0, 0.75, -0.55, 0.52], [-4.0, 0.62, -0.32, 0.42], [-6.0, 0.5, -0.1, 0.3], [-7.6, 0.42, 0.05, 0.2]];
function frogfoot(kind: 'k' | 't' | 'ub'): FixedWingSpec & { cls: string } {
  const t = kind === 't';
  const nose: Row[] = t
    ? [[7.665, 0.0, -0.42, 0.2], [7.1, 0.3, -0.64, 0.45], [6.0, 0.52, -0.76, 0.55], [5.0, 0.64, -0.8, 0.58], [4.0, 0.72, -0.82, 0.6]]
    : [[7.765, -0.12, -0.28, 0.06], [7.0, 0.15, -0.5, 0.3], [6.0, 0.38, -0.66, 0.44], [5.0, 0.55, -0.76, 0.52], [4.0, 0.68, -0.8, 0.56]];
  const tip = 0.5 - 7.18 * Math.tan((2.5 * Math.PI) / 180);
  const hump: Outline = { top: [[3.0, 0.9], [2.6, 1.3], [0.5, 1.32], [-2.5, 1.0], [-3.6, 0.7]], bottom: [[3.0, 0.6], [-3.6, 0.5]], plan: [[3.0, 0.35], [2.6, 0.48], [0.5, 0.5], [-2.5, 0.35], [-3.6, 0.15]], round: 3, stations: 10 };
  return fig({
    cls: kind === 'ub' ? 'trainer' : 'attack', length: t ? 15.33 : kind === 'ub' ? 15.36 : 15.53, span: 14.36, height: 4.8,
    body: [...nose, ...FROG_REAR], round: 2.6,
    wing: [[2.2, 0], [2.0, 1.5], [-0.15, 7.18], [-1.45, 7.18], [-2.7, 1.5], [-2.8, 0]], wingUp: 0.5, dihedral: -2.5,
    fin: kind === 'ub' ? [[-3.4, 0], [-6.9, 0], [-7.7, 3.0], [-6.5, 3.05]] : [[-3.4, 0], [-6.9, 0], [-7.6, 2.55], [-6.5, 2.6]], finBase: 0.5,
    tail: [[-5.3, 0.35], [-6.3, 2.3], [-7.3, 2.3], [-7.45, 0.35]], planeUp: 0.35,
    nozzles: [[-5.9, -1.0, -0.3], [-5.9, 1.0, -0.3]], nozzle: 0.65,
    bodies: [
      trunk(2.7, -5.6, 0.45, -0.95, 0.55, 1.0, 0.15, 2.6),
      pod(0.2, -1.9, 0.18, 7.1, tip, 0.3),
      t ? hump : kind === 'ub' ? spine(1.2, -3.5, 0.8, 0.28, 0.36) : spine(2.9, -3.5, 0.8, 0.12, 0.32),
    ],
    glass: [kind === 'ub' ? tandem(4.8, 1.2, 1.25, 1.6, 0.66, 1.0, 0.42) : t ? bubble(4.5, 3.0, 1.3, 0.7, 0.85, 0.42) : bubble(4.4, 2.9, 1.25, 0.66, 0.8, 0.4)],
  });
}
A['su-25'] = frogfoot('k');
A['su-25t'] = frogfoot('t');
A['su-25ub'] = frogfoot('ub');

// ---------------------------------------------------------------- Q-5 / A-5

// Q-5 Fantan: the MiG-19 reworked - a solid pointed nose, side intakes, the 52-degree wing, twin engines, a dorsal
// spine (15.65 x 9.68 x 4.33 m).
A['q-5'] = make({
  cls: 'attack', length: 15.65, span: 9.68, height: 4.33,
  top: [[7.825, -0.1], [6.8, 0.35], [5.4, 0.6], [4.4, 0.75], [2, 0.8], [-3, 0.7], [-7.7, 0.5]],
  bottom: [[7.825, -0.15], [6.8, -0.45], [5.0, -0.65], [0, -0.75], [-4, -0.7], [-7.7, -0.5]],
  plan: [[7.825, 0.03], [6.8, 0.4], [5.2, 0.6], [4.2, 0.62], [3.8, 1.05], [-1, 1.05], [-5, 0.85], [-7.7, 0.65]],
  wing: [[1.6, 0], [1.6, 1.0], [-2.0, 4.84], [-2.8, 4.84], [-3.6, 1.0], [-3.6, 0]],
  fin: [[-3.0, 0], [-7.0, 0], [-7.8, 2.7], [-6.6, 2.75]], finBase: 0.7,
  tail: [[-5.4, 0.6], [-6.4, 2.4], [-7.4, 2.4], [-7.6, 0.6]], planeUp: -0.1,
  engines: 2, nozzle: 0.75,
  glass: [bubble(4.6, 2.8, 1.18, 0.75, 0.85, 0.38)],
  bodies: [spine(2.8, -3.2, 0.8, 0.14, 0.22), trunk(4.0, -1.0, 0.45, -0.6, 0.35, 0.72, 0, 2.6)],
});

// ---------------------------------------------------------------- trainers

// Alpha Jet: a shoulder wing with anhedral, side intakes, two stepped seats; the German A with the long pointed nose
// (13.23 m with the probe), the French E with the short round one (11.75 m) (span 9.11, 4.19 m).
const ALPHA: Make = {
  cls: 'trainer', length: 13.23, span: 9.11, height: 4.19,
  top: [[6.615, -0.05], [5.8, 0.2], [5.0, 0.42], [4.0, 0.6], [1.0, 0.75], [-2, 0.65], [-6.4, 0.4]],
  bottom: [[6.615, -0.1], [5.8, -0.4], [4.0, -0.65], [0, -0.8], [-3, -0.6], [-6.4, -0.3]],
  plan: [[6.615, 0.03], [5.8, 0.3], [4.2, 0.5], [2.6, 0.52], [2.2, 0.95], [-1.2, 0.95], [-4, 0.6], [-6.4, 0.3]],
  wing: [[1.3, 0], [1.3, 0.95], [-0.8, 4.55], [-1.6, 4.55], [-2.4, 0.95], [-2.4, 0]], wingUp: 0.75, dihedral: -6,
  fin: [[-2.6, 0], [-5.8, 0], [-6.6, 2.2], [-5.6, 2.3]], finBase: 0.5,
  tail: [[-4.6, 0.3], [-5.4, 1.95], [-6.2, 1.95], [-6.4, 0.3]], planeUp: 0.1,
  engines: 2, nozzle: 0.45,
  glass: [tandem(4.6, 1.4, 1.2, 1.4, 0.58, 0.72, 0.38)],
  bodies: [trunk(2.4, -1.4, 0.45, -0.6, 0.3, 0.68, 0, 2.4)],
};
A['alpha-jet-a'] = make(ALPHA);
A['alpha-jet-e'] = make({ ...ALPHA, length: 11.75, top: [[5.875, -0.2], [5.5, 0.25], [5.0, 0.42], [4.0, 0.6], [1.0, 0.75], [-2, 0.65], [-5.875, 0.4]], bottom: [[5.875, -0.3], [5.4, -0.55], [4.0, -0.65], [0, -0.8], [-3, -0.6], [-5.875, -0.3]], plan: [[5.875, 0.12], [5.4, 0.4], [4.2, 0.5], [2.6, 0.52], [2.2, 0.95], [-1.2, 0.95], [-4, 0.6], [-5.875, 0.3]], fin: [[-2.1, 0], [-5.3, 0], [-6.1, 2.2], [-5.1, 2.3]], tail: [[-4.1, 0.3], [-4.9, 1.95], [-5.7, 1.95], [-5.875, 0.3]] });

// L-39 Albatros: a low straight wing with tip tanks, side intakes over it, two seats stepped high, a tall fin
// (12.13 x 9.46 x 4.77 m).
A['l-39'] = make({
  cls: 'trainer', length: 12.13, span: 9.46, height: 4.77,
  top: [[6.065, -0.15], [5.5, 0.25], [4.4, 0.55], [3.6, 0.7], [1.0, 0.75], [-2, 0.6], [-5.9, 0.4]],
  bottom: [[6.065, -0.25], [5.2, -0.6], [3.6, -0.75], [0, -0.8], [-3, -0.55], [-5.9, -0.3]],
  plan: [[6.065, 0.06], [5.2, 0.4], [3.6, 0.5], [1.6, 0.55], [1.2, 0.85], [-1.2, 0.85], [-3.6, 0.55], [-5.9, 0.3]],
  wing: [[1.2, 0], [1.2, 0.7], [0.9, 4.4], [-0.7, 4.4], [-1.4, 0.7], [-1.4, 0]], wingUp: -0.55, dihedral: 2.5,
  fin: [[-2.6, 0], [-5.5, 0], [-6.2, 2.4], [-5.2, 2.5]], finBase: 0.5,
  tail: [[-4.6, 0.3], [-5.0, 2.2], [-5.9, 2.2], [-6.0, 0.3]], planeUp: 0.2,
  nozzle: 0.55,
  glass: [tandem(4.3, 1.2, 1.25, 1.5, 0.6, 0.75, 0.4)],
  bodies: [pod(1.1, -1.0, 0.24, 4.6, -0.42), trunk(1.4, -1.6, 0.6, -0.3, 0.28, 0.6, 0, 2.2)],
});

// Hawk T.1: a low swept wing, side intakes, two seats stepped (11.17 x 9.39 x 3.99 m). Hawk 200 / 209: one seat, the
// radar nose, the fuselage faired behind the cockpit (11.38 m).
const HAWK: Make = {
  cls: 'trainer', length: 11.17, span: 9.39, height: 3.99,
  top: [[5.585, -0.15], [5.0, 0.25], [4.0, 0.55], [3.2, 0.65], [1.0, 0.7], [-2, 0.6], [-5.5, 0.35]],
  bottom: [[5.585, -0.2], [4.8, -0.55], [3.2, -0.7], [0, -0.8], [-3, -0.55], [-5.5, -0.3]],
  plan: [[5.585, 0.05], [4.8, 0.38], [3.2, 0.5], [2.2, 0.52], [1.8, 0.9], [-1.4, 0.9], [-3.6, 0.55], [-5.5, 0.3]],
  wing: [[1.2, 0], [1.2, 0.85], [-1.1, 4.7], [-1.8, 4.7], [-2.7, 0.85], [-2.7, 0]], wingUp: -0.55, dihedral: 2,
  fin: [[-2.2, 0], [-5.0, 0], [-5.8, 2.1], [-4.8, 2.2]], finBase: 0.45,
  tail: [[-3.9, 0.3], [-4.7, 2.2], [-5.5, 2.2], [-5.6, 0.3]], planeUp: 0.0,
  nozzle: 0.55,
  glass: [tandem(3.8, 0.9, 1.15, 1.35, 0.55, 0.65, 0.38)],
  bodies: [trunk(2.0, -1.6, 0.45, -0.45, 0.3, 0.62, 0, 2.4)],
};
A['bae-hawk'] = make(HAWK);
A['hawk-200'] = make({ ...HAWK, cls: 'attack', length: 11.38, top: [[5.69, 0.0], [5.3, 0.32], [4.6, 0.5], [3.6, 0.6], [1.0, 0.72], [-2, 0.6], [-5.5, 0.35]], bottom: [[5.69, -0.3], [5.2, -0.55], [3.2, -0.7], [0, -0.8], [-3, -0.55], [-5.5, -0.3]], plan: [[5.69, 0.15], [5.2, 0.42], [3.2, 0.5], [2.2, 0.52], [1.8, 0.9], [-1.4, 0.9], [-3.6, 0.55], [-5.5, 0.3]], glass: [bubble(3.4, 1.8, 1.14, 0.58, 0.68, 0.38)] });
// BAC Strikemaster: two seats side by side, a low straight wing with tip tanks, wing-root intakes (10.27 x 11.23 x 3.34 m).
A['strikemaster'] = make({
  cls: 'trainer', length: 10.27, span: 11.23, height: 3.34,
  top: [[5.135, -0.2], [4.6, 0.25], [3.6, 0.55], [2.8, 0.6], [0.5, 0.65], [-1.5, 0.45], [-5.0, 0.3]],
  bottom: [[5.135, -0.3], [4.4, -0.6], [2.8, -0.7], [0, -0.75], [-2.5, -0.45], [-5.0, -0.2]],
  plan: [[5.135, 0.1], [4.4, 0.5], [3.0, 0.65], [0.5, 0.68], [-1.5, 0.5], [-5.0, 0.2]],
  wing: [[1.6, 0], [1.6, 1.2], [0.9, 5.0], [-0.4, 5.0], [-1.4, 1.2], [-1.4, 0]], wingUp: -0.55, dihedral: 4,
  fin: [[-3.0, 0], [-4.9, 0], [-5.4, 1.8], [-4.6, 1.85]], finBase: 0.4,
  tail: [[-3.8, 0.2], [-4.0, 2.0], [-4.9, 2.0], [-5.0, 0.2]], planeUp: 0.1,
  nozzle: 0.45,
  glass: [sideBySide(3.8, 1.8, 1.25, 0.58, 0.65, 0.6)],
  bodies: [pod(1.4, -0.6, 0.25, 5.2, -0.5)],
});

// MB-339: a low straight wing with tip tanks, wing-root intakes, two seats stepped very high (10.97 x 10.86 x 3.6 m).
// MB-326: the earlier, lower canopy (10.67 m); MB-326K: one seat.
const MACCHI: Make = {
  cls: 'trainer', length: 10.97, span: 10.86, height: 3.6,
  top: [[5.485, -0.15], [5.0, 0.25], [4.0, 0.5], [3.2, 0.65], [0.6, 0.7], [-2, 0.5], [-5.3, 0.35]],
  bottom: [[5.485, -0.25], [4.6, -0.55], [3.0, -0.7], [0, -0.75], [-2.6, -0.5], [-5.3, -0.25]],
  plan: [[5.485, 0.06], [4.6, 0.4], [3.0, 0.52], [0, 0.55], [-2.6, 0.45], [-5.3, 0.25]],
  wing: [[1.4, 0], [1.4, 0.9], [0.8, 5.0], [-0.5, 5.0], [-1.4, 0.9], [-1.4, 0]], wingUp: -0.5, dihedral: 3,
  fin: [[-2.6, 0], [-4.9, 0], [-5.5, 2.0], [-4.6, 2.1]], finBase: 0.45,
  tail: [[-3.8, 0.25], [-4.2, 1.95], [-5.0, 1.95], [-5.2, 0.25]], planeUp: 0.1,
  nozzle: 0.45,
  glass: [tandem(4.0, 1.0, 1.28, 1.58, 0.55, 0.7, 0.38)],
  bodies: [pod(1.4, -0.9, 0.26, 5.15, -0.45)],
};
A['mb-339'] = make(MACCHI);
A['mb-326'] = make({ ...MACCHI, length: 10.67, span: 10.56, glass: [tandem(3.9, 1.1, 1.12, 1.28, 0.55, 0.7, 0.38)] });
A['mb-326k'] = make({ ...MACCHI, cls: 'attack', length: 10.67, span: 10.56, glass: [bubble(3.8, 2.2, 1.12, 0.55, 0.68, 0.38)] });

// CASA C-101: a low straight wing without tip tanks, side intakes, two seats stepped (12.5 x 10.6 x 4.25 m).
A['c-101'] = make({
  cls: 'trainer', length: 12.5, span: 10.6, height: 4.25,
  top: [[6.25, -0.15], [5.6, 0.3], [4.6, 0.6], [3.8, 0.72], [1.0, 0.8], [-2, 0.65], [-6.1, 0.4]],
  bottom: [[6.25, -0.25], [5.4, -0.6], [3.8, -0.75], [0, -0.85], [-3, -0.6], [-6.1, -0.3]],
  plan: [[6.25, 0.06], [5.4, 0.42], [3.8, 0.55], [2.0, 0.58], [1.6, 0.9], [-1.2, 0.9], [-3.6, 0.6], [-6.1, 0.3]],
  wing: [[1.4, 0], [1.4, 0.85], [0.6, 5.3], [-0.7, 5.3], [-1.6, 0.85], [-1.6, 0]], wingUp: -0.6, dihedral: 5,
  fin: [[-2.8, 0], [-5.6, 0], [-6.4, 2.4], [-5.5, 2.5]], finBase: 0.5,
  tail: [[-4.6, 0.3], [-5.2, 2.3], [-6.1, 2.3], [-6.2, 0.3]], planeUp: 0.1,
  nozzle: 0.55,
  glass: [tandem(4.4, 1.2, 1.3, 1.55, 0.6, 0.78, 0.42)],
  bodies: [trunk(1.8, -1.4, 0.5, -0.55, 0.3, 0.62, 0, 2.4)],
});

// Yak-130: the long LERX, two engines in nacelles under the wing roots, two seats stepped very high (11.49 x 9.84 x 4.76 m).
A['yak-130'] = make({
  cls: 'trainer', length: 11.49, span: 9.84, height: 4.76,
  top: [[5.745, -0.15], [5.2, 0.3], [4.3, 0.62], [3.4, 0.75], [0.5, 0.8], [-2.5, 0.6], [-5.6, 0.4]],
  bottom: [[5.745, -0.25], [5.0, -0.6], [3.4, -0.75], [1.2, -0.8], [-3, -0.6], [-5.6, -0.35]],
  plan: [[5.745, 0.05], [5.0, 0.42], [3.4, 0.55], [0, 0.6], [-3, 0.55], [-5.6, 0.4]],
  wing: [[4.0, 0], [3.0, 0.55], [1.4, 0.95], [0.4, 1.3], [-1.6, 4.92], [-2.4, 4.92], [-3.0, 1.3], [-3.2, 0]], wingUp: -0.1,
  fin: [[-2.4, 0], [-5.0, 0], [-5.8, 2.6], [-4.8, 2.7]], finBase: 0.55,
  tail: [[-3.8, 0.5], [-4.6, 2.3], [-5.6, 2.3], [-5.8, 0.5]], planeUp: -0.1,
  engines: 0,
  glass: [tandem(4.2, 1.2, 1.3, 1.62, 0.62, 0.78, 0.4)],
  bodies: [pod(1.8, -4.6, 0.42, 0.95, -0.55, 0.15)],
});

// ---------------------------------------------------------------- T-38, F-5, F-20

// T-38 Talon: the needle nose, two seats in tandem, side intakes, a thin wing without LERX (14.13 x 7.7 x 3.92 m).
// The F-5 family's small half-round intakes behind the cockpit.
const TIGER_INTAKE = trunk(2.4, -1.8, 0.32, -0.42, 0.3, 0.68, 0, 2.4);
const TALON: Make = {
  cls: 'trainer', length: 14.13, span: 7.7, height: 3.92,
  top: [[7.065, -0.05], [5.6, 0.25], [4.4, 0.42], [3.6, 0.55], [0.5, 0.62], [-4, 0.5], [-6.9, 0.4]],
  bottom: [[7.065, -0.08], [5.6, -0.3], [3.0, -0.5], [-3, -0.55], [-6.9, -0.35]],
  plan: [[7.065, 0.03], [5.6, 0.35], [3.8, 0.48], [2.6, 0.55], [2.2, 0.92], [-3, 0.92], [-6.9, 0.62]], round: 2.8,
  wing: [[2.0, 0], [2.0, 0.9], [0.0, 3.85], [-0.6, 3.85], [-2.6, 0.9], [-2.6, 0]], wingUp: -0.4,
  fin: [[-2.2, 0], [-6.4, 0], [-7.0, 2.2], [-6.0, 2.2], [-3.6, 0.3]], finBase: 0.45,
  tail: [[-5.2, 0.7], [-6.0, 2.1], [-6.8, 2.1], [-6.8, 0.7]], planeUp: 0,
  engines: 2, nozzle: 0.55,
  glass: [tandem(4.8, 1.2, 1.05, 1.22, 0.42, 0.6, 0.36)],
  bodies: [TIGER_INTAKE],
};
A['t-38'] = make(TALON);
// F-5A / C / G: one seat, the T-38's body with small LERX and tip tanks (14.38 x 7.7 x 4.01 m).
A['f-5a'] = make({ ...TALON, cls: 'fighter', length: 14.38, wing: [[2.6, 0], [2.0, 0.8], [0.8, 0.95], [0.0, 3.85], [-0.6, 3.85], [-2.6, 0.95], [-2.6, 0]], glass: [bubble(4.6, 2.6, 1.08, 0.42, 0.6, 0.36)], bodies: [TIGER_INTAKE, pod(0.5, -2.6, 0.27, 3.9, -0.3)] });
// F-5E: the existing outline with its own bubble canopy; F-5F: the two-seater, 1.2 m longer; F-20: one engine, the
// bigger LERX and wing.
const TIGER2 = AIRCRAFT.air!['f-5e'];
A['f-5e'] = { ...TIGER2, bodies: [TIGER_INTAKE], glass: [bubble(4.4, 2.2, 1.1, 0.42, 0.66, 0.36)] };
// (Its length stays the F-5E's here: the nose is stretched ahead of the same tail, 15.65 m overall.)
A['f-5f'] = { ...TIGER2, fuselage: { ...TIGER2.fuselage!, top: TIGER2.fuselage!.top.map(([x, v]) => [x > 0 ? x * 1.17 : x, v] as P2), bottom: TIGER2.fuselage!.bottom.map(([x, v]) => [x > 0 ? x * 1.17 : x, v] as P2), plan: TIGER2.fuselage!.plan.map(([x, v]) => [x > 0 ? x * 1.17 : x, v] as P2) }, bodies: [TIGER_INTAKE], glass: [tandem(5.2, 1.6, 1.08, 1.22, 0.42, 0.66, 0.36)] };
A['f-20'] = { ...TIGER2, length: 14.17, span: 8.53, wingPlan: [[4.4, 0], [2.8, 1.0], [0.9, 1.15], [-1.1, 4.26], [-1.9, 4.26], [-2.8, 1.15], [-2.9, 0]], engines: { kind: 'internal', count: 1, diameter: 1.0 }, bodies: [TIGER_INTAKE], glass: [bubble(4.4, 2.1, 1.14, 0.42, 0.66, 0.38)] };

// ---------------------------------------------------------------- Viggen

// Saab 37 Viggen: the big canards with flaps on the intakes, the double-delta main wing with a dogtooth well aft, a
// tall fin (16.4 x 10.6 x 5.9 m). AJ, AJS and JA share the outline.
A['ajs-37'] = make({
  cls: 'attack', length: 16.4, span: 10.6, height: 5.9,
  top: [[8.2, -0.1], [7.2, 0.3], [5.8, 0.55], [4.8, 0.7], [2.0, 0.8], [-3, 0.7], [-8.0, 0.5]],
  bottom: [[8.2, -0.15], [7.0, -0.45], [5.4, -0.6], [0, -0.75], [-4, -0.7], [-8.0, -0.5]],
  plan: [[8.2, 0.04], [7.0, 0.4], [5.4, 0.55], [4.4, 0.58], [4.0, 1.1], [-2, 1.1], [-5, 0.8], [-8.0, 0.6]],
  wing: [[-0.4, 0], [-0.4, 1.1], [-2.6, 3.3], [-2.4, 3.35], [-5.0, 5.3], [-6.0, 5.3], [-7.0, 1.1], [-7.0, 0]],
  canard: { x: 2.8, span: 5.45, chord: 2.2 },
  fin: [[-1.6, 0], [-6.6, 0], [-7.6, 3.5], [-6.0, 3.6]], finBase: 0.7,
  nozzle: 1.1,
  glass: [bubble(5.4, 3.6, 1.28, 0.7, 0.78, 0.4)],
});

// ---------------------------------------------------------------- early jets

/**
 * The MiG-15's fat barrel with the split nose intake, the bubble high on it, the shoulder wing with 2 degrees of
 * anhedral and its fences, the tall swept fin with the tailplane half way up, stretched to length `L`; the MiG-17's
 * thinner 45-degree wing when `w45`.
 */
function fagot(L: number, w45: boolean): FixedWingSpec & { cls: string } {
  const k = L / 10.11;
  const r = (rows: Row[]): Row[] => rows.map(([x, a, b, c]) => [x * k, a, b, c]);
  const m = (q: P2[]) => q.map(([x, v]) => [x * k, v] as P2);
  const h = w45 ? 4.815 : 5.04;
  return fig({
    cls: 'fighter', length: L, span: 2 * h, height: w45 ? 3.8 : 3.7,
    body: r([[5.055, 0.48, -0.5, 0.5], [4.6, 0.68, -0.72, 0.66], [3.6, 0.82, -0.85, 0.75], [2.4, 0.88, -0.88, 0.78], [1.0, 0.85, -0.85, 0.76], [-0.5, 0.78, -0.75, 0.68], [-2.0, 0.65, -0.58, 0.55], [-3.5, 0.5, -0.42, 0.42], [-5.055, 0.38, -0.3, 0.34]]), round: 2,
    wing: w45 ? [[0.9, 0], [0.9, 0.75], [-3.5, h], [-4.4, h], [-2.9, 0.75], [-2.9, 0]] : [[0.9, 0], [0.9, 0.75], [-2.6, h], [-3.6, h], [-2.5, 0.75], [-2.5, 0]], wingUp: 0.15, dihedral: -2,
    fin: m([[-2.4, 0], [-4.7, 0], [-5.6, 2.05], [-4.5, 2.1]]), finBase: 0.42,
    tail: m([[-4.3, 0], [-4.95, 1.6], [-5.65, 1.6], [-5.75, 0]]), planeUp: 1.35,
    nozzles: [[-5.055 * k, 0, -0.05]], nozzle: 0.62,
    bodies: [post(-0.6 * k, -2.4 * k, 0.75, 0.3, 0.12, undefined)],
    glass: [bubble(2.9 * k, 1.2 * k, 1.32, 0.8, 0.84, 0.34)],
  });
}
A['mig-15bis'] = fagot(10.11, false);
A['mig-15bis-ish'] = { ...A['mig-15bis'], cls: 'attack', bodies: [...A['mig-15bis'].bodies!, pod(0.4, -1.6, 0.16, 2.8, 0.0)] };
A['mig-17'] = fagot(11.26, true);
// MiG-17PF: the search radar's bullet in the intake's splitter and the ranging radar's fairing over the lip (11.68 m).
A['mig-17pf'] = { ...fagot(11.68, true), bodies: [pod(6.3, 5.5, 0.2, 0, 0.05, 0.6), spine(5.85, 4.9, 0.6, 0.22, 0.26)] };
// MiG-19: twin engines side by side behind the nose intake, the 55-degree wing with big fences, twin nozzles
// (12.54 x 9.0 x 3.89 m). MiG-19P/PT/PM and J-6A: the radar cone in the intake.
const FARMER: Make = {
  cls: 'fighter', length: 12.54, span: 9.0, height: 3.89,
  top: [[6.27, 0.45], [5.4, 0.6], [3.8, 0.7], [3.0, 0.85], [0.6, 0.85], [-3, 0.7], [-6.2, 0.55]],
  bottom: [[6.27, -0.45], [5.2, -0.62], [0, -0.75], [-4, -0.72], [-6.2, -0.55]],
  plan: [[6.27, 0.48], [5.4, 0.6], [2, 0.72], [-4, 0.75], [-6.2, 0.65]], round: 2.3,
  wing: [[1.2, 0], [1.2, 0.7], [-2.6, 4.5], [-3.4, 4.5], [-3.4, 0.7], [-3.4, 0]],
  fin: [[-2.2, 0], [-5.6, 0], [-6.6, 2.4], [-5.4, 2.5]], finBase: 0.6,
  tail: [[-4.4, 0.5], [-5.4, 2.3], [-6.4, 2.3], [-6.5, 0.5]], planeUp: -0.2,
  engines: 2, nozzle: 0.65,
  glass: [bubble(3.6, 2.0, 1.2, 0.85, 0.85, 0.34)],
};
A['mig-19s'] = make(FARMER);
A['mig-19p'] = make({ ...FARMER, bodies: [pod(6.7, 5.8, 0.22, 0, 0.0, 0.6)] });
// MiG-9: two engines side by side with their exhausts under the belly, the split nose intake, a straight wing, the
// tailplane on the fin (9.75 x 10.0 x 3.22 m).
A['mig-9'] = make({
  cls: 'fighter', length: 9.75, span: 10.0, height: 3.22,
  top: [[4.875, 0.45], [4.0, 0.6], [2.4, 0.65], [1.2, 0.85], [-0.6, 0.75], [-2.4, 0.5], [-4.8, 0.35]],
  bottom: [[4.875, -0.45], [3.8, -0.65], [0.6, -0.7], [0.0, -0.4], [-1.6, -0.1], [-4.8, 0.0]],
  plan: [[4.875, 0.5], [4.0, 0.62], [0.8, 0.65], [-0.6, 0.45], [-2.4, 0.28], [-4.8, 0.15]],
  wing: [[1.4, 0], [1.4, 0.65], [0.6, 5.0], [-0.6, 5.0], [-1.2, 0.65], [-1.2, 0]],
  fin: [[-3.0, 0], [-4.6, 0], [-5.0, 1.6], [-4.2, 1.65]], finBase: 0.35,
  tail: [[-3.8, 0], [-4.1, 1.6], [-4.8, 1.6], [-4.9, 0]], planeUp: 0.9,
  engines: 0,
  glass: [bubble(2.4, 0.8, 1.1, 0.7, 0.75, 0.32)],
  bodies: [pod(0.3, -0.4, 0.26, 0.3, -0.5, 0.05)],
});
// Yak-15 / Yak-17: a pod-and-boom - the engine in the nose, its exhaust under the belly ahead of a stepped-up boom, a
// straight wing (8.7 x 9.2 x 2.27 m). Yak-23: shorter, the tailplane high on a bigger fin (8.12 x 8.73 x 3.31 m).
const FEATHER: Make = {
  cls: 'fighter', length: 8.7, span: 9.2, height: 2.27,
  top: [[4.35, 0.45], [3.6, 0.6], [2.0, 0.65], [0.6, 0.7], [-1.0, 0.5], [-2.0, 0.35], [-4.3, 0.3]],
  bottom: [[4.35, -0.45], [3.4, -0.6], [0.4, -0.65], [0.0, -0.3], [-1.5, -0.05], [-4.3, 0.05]],
  plan: [[4.35, 0.45], [3.6, 0.58], [0.8, 0.6], [-0.5, 0.4], [-2.0, 0.22], [-4.3, 0.15]], round: 2.2,
  wing: [[1.6, 0], [1.6, 0.6], [1.0, 4.6], [-0.2, 4.6], [-0.8, 0.6], [-0.8, 0]], wingUp: -0.2,
  fin: [[-3.0, 0], [-4.3, 0], [-4.6, 1.4], [-3.8, 1.45]], finBase: 0.3,
  tail: [[-3.2, 0.1], [-3.4, 1.6], [-4.1, 1.6], [-4.2, 0.1]], planeUp: 0.3,
  engines: 0,
  glass: [bubble(1.8, 0.4, 1.0, 0.65, 0.55, 0.3)],
  bodies: [pod(0.1, -0.5, 0.28, 0, -0.45, 0.05)],
};
A['yak-15'] = make(FEATHER);
A['yak-23'] = make({ ...FEATHER, length: 8.12, span: 8.73, height: 3.31, top: FEATHER.top.map(([x, v]) => [x * 0.93, v] as P2), bottom: FEATHER.bottom.map(([x, v]) => [x * 0.93, v] as P2), plan: FEATHER.plan.map(([x, v]) => [x * 0.93, v] as P2), wing: [[1.5, 0], [1.5, 0.6], [0.9, 4.37], [-0.1, 4.37], [-0.7, 0.6], [-0.7, 0]], fin: [[-2.6, 0], [-4.0, 0], [-4.5, 1.9], [-3.6, 1.95]], tail: [[-3.4, 0], [-3.7, 1.5], [-4.3, 1.5], [-4.4, 0]], planeUp: 1.3 });
// La-15: a nose intake, the shoulder swept wing with anhedral, a T-tail (9.56 x 8.83 x 3.8 m); the La-174 its prototype.
A['la-15'] = make({
  cls: 'fighter', length: 9.56, span: 8.83, height: 3.8,
  top: [[4.78, 0.4], [4.0, 0.55], [2.6, 0.65], [1.6, 0.8], [-0.5, 0.7], [-3, 0.5], [-4.7, 0.4]],
  bottom: [[4.78, -0.4], [3.8, -0.55], [0, -0.6], [-3, -0.45], [-4.7, -0.3]],
  plan: [[4.78, 0.42], [3.8, 0.55], [1, 0.6], [-3, 0.45], [-4.7, 0.3]], round: 2.1,
  wing: [[0.8, 0], [0.8, 0.6], [-2.0, 4.41], [-2.8, 4.41], [-2.4, 0.6], [-2.4, 0]], wingUp: 0.5, dihedral: -3,
  fin: [[-1.8, 0], [-4.4, 0], [-5.4, 2.2], [-4.4, 2.25]], finBase: 0.45,
  tail: [[-4.5, 0], [-5.0, 1.5], [-5.6, 1.5], [-5.6, 0]], planeUp: 2.7,
  nozzle: 0.6,
  glass: [bubble(2.4, 1.0, 1.1, 0.65, 0.72, 0.3)],
});
// La-200: a big two-seat interceptor - the radar in the nose intake's centre body, a mid swept wing, the tailplane
// half way up the fin (17.2 x 12.96 x 4.8 m, est height).
A['la-200'] = make({
  cls: 'fighter', length: 17.2, span: 12.96, height: 4.8,
  top: [[8.6, 0.55], [7.4, 0.75], [5.6, 0.85], [4.4, 1.0], [1.0, 1.0], [-3, 0.85], [-8.5, 0.6]],
  bottom: [[8.6, -0.55], [7.2, -0.75], [0, -0.85], [-4, -0.8], [-8.5, -0.55]],
  plan: [[8.6, 0.58], [7.2, 0.75], [2, 0.88], [-4, 0.82], [-8.5, 0.6]], round: 2.2,
  wing: [[1.4, 0], [1.4, 0.88], [-2.6, 6.48], [-3.8, 6.48], [-3.6, 0.88], [-3.6, 0]],
  fin: [[-3.4, 0], [-7.6, 0], [-8.8, 3.0], [-7.6, 3.1]], finBase: 0.7,
  tail: [[-6.4, 0], [-7.4, 2.6], [-8.6, 2.6], [-8.8, 0]], planeUp: 2.0,
  nozzle: 0.9,
  glass: [tandem(5.6, 2.4, 1.38, 1.45, 0.85, 1.0, 0.45)],
  bodies: [pod(9.3, 8.0, 0.36, 0, 0.0, 0.6)],
});
// Sukhoi Su-9 (1946) / Su-11: the Me 262 layout - two engines in nacelles under a straight wing, a slim body (10.55 x
// 11.2 x 3.4 m).
A['su-9-1946'] = make({
  cls: 'fighter', length: 10.55, span: 11.2, height: 3.4,
  top: [[5.275, -0.1], [4.7, 0.35], [3.4, 0.55], [2.0, 0.65], [-1, 0.6], [-5.2, 0.4]],
  bottom: [[5.275, -0.2], [4.4, -0.5], [2.0, -0.6], [-1.0, -0.55], [-5.2, -0.15]],
  plan: [[5.275, 0.1], [4.4, 0.45], [2.0, 0.6], [-1.0, 0.55], [-5.2, 0.2]],
  wing: [[1.4, 0], [1.4, 0.6], [0.6, 5.6], [-0.5, 5.6], [-1.6, 0.6], [-1.6, 0]],
  fin: [[-3.6, 0], [-5.2, 0], [-5.5, 1.6], [-4.7, 1.65]], finBase: 0.4,
  tail: [[-3.8, 0.1], [-4.1, 2.1], [-4.9, 2.1], [-5.1, 0.1]], planeUp: 0.6,
  engines: 0,
  glass: [bubble(2.6, 1.0, 1.1, 0.62, 0.62, 0.32)],
  bodies: [pod(2.4, -1.6, 0.4, 2.0, -0.5, 0.25)],
});

// Il-28: the glazed nose, the pilot's bubble above, two big nacelles slung under a straight wing, the tail gunner's
// turret, a swept fin and tailplane (17.65 x 21.45 x 6.7 m). Il-28Sh: pylons out along the wing. Tu-14T: the same
// layout stretched, the nacelles further out (21.95 x 21.69 x 5.69 m).
const BEAGLE: Make = {
  cls: 'bomber', length: 17.65, span: 21.45, height: 6.7,
  top: [[8.825, -0.3], [8.3, 0.35], [7.2, 0.75], [5.8, 0.85], [2, 0.95], [-4, 0.8], [-7.6, 0.6], [-8.825, 0.2]],
  bottom: [[8.825, -0.5], [8.0, -0.85], [6.0, -0.95], [-2, -0.95], [-6, -0.6], [-8.4, -0.2], [-8.825, -0.1]],
  plan: [[8.825, 0.25], [8.0, 0.65], [6.0, 0.82], [-2, 0.85], [-6, 0.6], [-8.825, 0.3]], round: 2.4,
  wing: [[1.6, 0], [1.6, 0.85], [0.2, 10.7], [-1.0, 10.7], [-1.8, 0.85], [-1.8, 0]], wingUp: 0.3,
  fin: [[-5.0, 0], [-8.0, 0], [-9.2, 3.5], [-7.8, 3.6]], finBase: 0.6,
  tail: [[-6.6, 0.3], [-8.0, 3.6], [-9.2, 3.6], [-9.4, 0.3]], planeUp: 0.6,
  engines: 0,
  glass: [bubble(5.4, 3.8, 1.35, 0.85, 0.9, 0.42), pod(9.0, 7.4, 0.55, 0, -0.25, 0.5)],
  bodies: [pod(4.6, -2.6, 0.72, 3.2, -0.6, 0.2), pod(-8.4, -9.4, 0.36, 0, -0.25, 0.3)],
};
A['il-28'] = make(BEAGLE);
A['il-28sh'] = make({ ...BEAGLE, cls: 'attack', bodies: [...BEAGLE.bodies!, pod(0.6, -1.4, 0.14, 5.6, -0.45), pod(0.4, -1.6, 0.14, 7.6, -0.4)] });
A['tu-14'] = make({ ...BEAGLE, length: 21.95, span: 21.69, height: 5.69, top: BEAGLE.top.map(([x, v]) => [x * 1.244, v] as P2), bottom: BEAGLE.bottom.map(([x, v]) => [x * 1.244, v] as P2), plan: BEAGLE.plan.map(([x, v]) => [x * 1.244, v] as P2), fin: BEAGLE.fin.map(([x, v]) => [x * 1.244, v] as P2), tail: BEAGLE.tail!.map(([x, v]) => [x * 1.244, v] as P2), glass: [bubble(6.4, 4.6, 1.35, 0.85, 0.9, 0.42), pod(11.2, 9.4, 0.55, 0, -0.25, 0.5)], bodies: [pod(4.4, -2.4, 0.62, 3.6, -0.5, 0.2), pod(-10.4, -11.4, 0.36, 0, -0.25, 0.3)] });

// F-86F Sabre: a slimmer body than the MiG's, the oval nose intake, the bubble set further back and faired into a
// spine, a low 35-degree wing with dihedral, the tailplane low by the fin's root (11.4 x 11.3 x 4.5 m). F-86D / K: the
// radome over a chin intake (12.27 m). FJ-4 Fury: a deeper body, the spine running to the fin, a thinner, broader wing
// (11.08 x 11.92 x 4.24 m).
const SABRE_REAR: Row[] = [[1.0, 0.85, -0.86, 0.72], [-1.0, 0.8, -0.78, 0.68], [-3.0, 0.65, -0.58, 0.56], [-5.7, 0.45, -0.38, 0.38]];
const SABRE: Fig = {
  cls: 'fighter', length: 11.4, span: 11.3, height: 4.5,
  body: [[5.7, 0.42, -0.45, 0.42], [5.2, 0.6, -0.65, 0.56], [4.0, 0.74, -0.8, 0.66], [2.6, 0.82, -0.86, 0.7], ...SABRE_REAR], round: 2.1,
  wing: [[1.2, 0], [1.2, 0.72], [-2.3, 5.65], [-3.5, 5.65], [-2.8, 0.72], [-2.8, 0]], wingUp: -0.45, dihedral: 3,
  fin: [[-2.0, 0], [-5.3, 0], [-6.0, 2.35], [-4.8, 2.4]], finBase: 0.5,
  tail: [[-4.2, 0], [-5.2, 1.95], [-6.0, 1.95], [-6.05, 0]], planeUp: 0.25,
  nozzles: [[-5.7, 0, 0]], nozzle: 0.7,
  bodies: [spine(1.5, -3.6, 0.84, 0.1, 0.22)],
  glass: [bubble(3.3, 1.5, 1.32, 0.78, 0.84, 0.36)],
};
A['f-86f'] = fig(SABRE);
A['f-86k'] = fig({ ...SABRE, length: 12.27, body: [[6.135, 0.12, 0.0, 0.1], [5.8, 0.42, -0.2, 0.38], [5.5, 0.55, -0.72, 0.56], [4.4, 0.75, -0.82, 0.66], [2.6, 0.84, -0.86, 0.7], ...SABRE_REAR], glass: [bubble(3.6, 1.8, 1.32, 0.8, 0.84, 0.36)] });
A['fj-4'] = fig({
  ...SABRE, length: 11.08, span: 11.92, height: 4.24,
  body: [[5.54, 0.4, -0.5, 0.42], [5.0, 0.62, -0.72, 0.58], [3.8, 0.8, -0.86, 0.68], [2.4, 0.88, -0.92, 0.72], [0.8, 0.9, -0.92, 0.74], [-1.2, 0.85, -0.82, 0.7], [-3.2, 0.7, -0.6, 0.56], [-5.54, 0.48, -0.38, 0.38]],
  wing: [[1.0, 0], [1.0, 0.74], [-2.4, 5.96], [-3.3, 5.96], [-2.9, 0.74], [-2.9, 0]],
  nozzles: [[-5.54, 0, 0]],
  bodies: [spine(1.4, -4.6, 0.88, 0.25, 0.3)],
  glass: [bubble(3.2, 1.6, 1.36, 0.84, 0.9, 0.36)],
});
// F-100 Super Sabre: the oval nose intake with its upper lip forward, a 45-degree wing, a tall fin, the low tailplane
// (14.36 x 11.81 x 4.95 m). F-100F: the two-seater, 0.9 m longer.
const HUN: Make = {
  cls: 'fighter', length: 14.36, span: 11.81, height: 4.95,
  top: [[7.18, 0.35], [6.4, 0.55], [4.8, 0.7], [3.8, 0.85], [1.0, 0.85], [-3, 0.7], [-7.1, 0.5]],
  bottom: [[7.0, -0.5], [6.4, -0.62], [2, -0.75], [-3, -0.7], [-7.1, -0.5]],
  plan: [[7.18, 0.5], [6.4, 0.62], [2, 0.75], [-3, 0.72], [-7.1, 0.55]], round: 2.3,
  wing: [[1.4, 0], [1.4, 0.75], [-3.5, 5.9], [-4.5, 5.9], [-4.0, 0.75], [-4.0, 0]], wingUp: -0.2,
  fin: [[-2.8, 0], [-6.4, 0], [-7.6, 3.0], [-6.4, 3.1]], finBase: 0.6,
  tail: [[-5.2, 0.5], [-6.4, 2.8], [-7.4, 2.8], [-7.6, 0.5]], planeUp: -0.35,
  nozzle: 0.85,
  glass: [bubble(4.4, 2.6, 1.25, 0.85, 0.85, 0.36)],
};
A['f-100d'] = make(HUN);
A['f-100f'] = make({ ...HUN, length: 15.27, top: [[7.64, 0.35], [6.9, 0.55], [5.2, 0.7], [4.2, 0.85], [1.0, 0.88], [-3, 0.7], [-7.1, 0.5]], bottom: [[7.46, -0.5], [6.9, -0.62], [2, -0.75], [-3, -0.7], [-7.1, -0.5]], plan: [[7.64, 0.5], [6.9, 0.62], [2, 0.75], [-3, 0.72], [-7.1, 0.55]], glass: [tandem(5.0, 1.8, 1.22, 1.32, 0.85, 0.88, 0.36)] });

// ---------------------------------------------------------------- more jets

// Saab 105 / SK 60: two seats side by side, a shoulder wing with anhedral, the engines in pods low on the body's
// sides, a T-tail (10.5 x 9.5 x 2.7 m).
A['saab-105'] = make({
  cls: 'trainer', length: 10.5, span: 9.5, height: 2.7,
  top: [[5.25, -0.2], [4.8, 0.25], [3.8, 0.55], [3.0, 0.62], [0, 0.62], [-2, 0.5], [-5.2, 0.35]],
  bottom: [[5.25, -0.3], [4.6, -0.55], [3.0, -0.65], [0, -0.68], [-3, -0.5], [-5.2, -0.25]],
  plan: [[5.25, 0.12], [4.6, 0.55], [3.0, 0.68], [0, 0.7], [-2.5, 0.5], [-5.2, 0.2]],
  wing: [[1.4, 0], [1.4, 0.7], [0.3, 4.75], [-0.6, 4.75], [-1.6, 0.7], [-1.6, 0]], wingUp: 0.55, dihedral: -6,
  fin: [[-2.4, 0], [-4.8, 0], [-5.6, 1.7], [-4.8, 1.75]], finBase: 0.45,
  tail: [[-4.8, 0], [-5.2, 1.65], [-5.8, 1.65], [-5.8, 0]], planeUp: 2.2,
  engines: 0,
  glass: [sideBySide(3.8, 1.6, 1.15, 0.58, 0.62, 0.62)],
  bodies: [pod(0.8, -2.6, 0.32, 0.9, -0.35, 0.2)],
});
// Grumman F11F Tiger: an area-ruled body, side intakes, a thin 35-degree wing (14.31 x 9.64 x 4.03 m).
A['f11f'] = make({
  cls: 'fighter', length: 14.31, span: 9.64, height: 4.03,
  top: [[7.155, -0.1], [6.2, 0.3], [4.8, 0.5], [4.0, 0.65], [1.0, 0.68], [-3, 0.55], [-7.0, 0.4]],
  bottom: [[7.155, -0.15], [6.0, -0.45], [4.0, -0.6], [0, -0.7], [-3.0, -0.6], [-7.0, -0.4]],
  plan: [[7.155, 0.03], [6.0, 0.4], [4.4, 0.55], [3.2, 0.58], [2.8, 0.95], [0, 0.85], [-3, 0.85], [-7.0, 0.5]],
  wing: [[1.4, 0], [1.4, 0.9], [-1.6, 4.82], [-2.6, 4.82], [-3.0, 0.9], [-3.0, 0]], wingUp: 0.2,
  fin: [[-2.8, 0], [-6.4, 0], [-7.2, 2.4], [-6.0, 2.45]], finBase: 0.55,
  tail: [[-5.0, 0.5], [-5.8, 2.3], [-6.8, 2.3], [-7.0, 0.5]], planeUp: -0.1,
  nozzle: 0.8,
  glass: [bubble(4.6, 2.8, 1.18, 0.6, 0.66, 0.36)],
  bodies: [trunk(3.0, -1.0, 0.4, -0.55, 0.3, 0.68, 0, 2.4)],
});
// Mitsubishi T-2: the Jaguar-like shoulder wing with anhedral, side intakes, two seats in tandem, twin engines
// (17.85 x 7.88 x 4.39 m). F-1: one seat, the rear cockpit faired over.
const T2_INTAKE = trunk(4.4, -1.4, 0.4, -0.55, 0.32, 0.7, 0.2, 4);
const T2: Make = {
  cls: 'trainer', length: 17.85, span: 7.88, height: 4.39,
  top: [[8.925, -0.1], [7.8, 0.3], [6.4, 0.55], [5.6, 0.65], [2, 0.75], [-3, 0.65], [-8.8, 0.45]],
  bottom: [[8.925, -0.15], [7.6, -0.45], [5.6, -0.6], [0, -0.7], [-4, -0.65], [-8.8, -0.45]],
  plan: [[8.925, 0.03], [7.6, 0.4], [5.6, 0.55], [4.6, 0.58], [4.2, 1.0], [-2, 1.0], [-6, 0.85], [-8.8, 0.65]],
  wing: [[0.8, 0], [0.8, 1.0], [-1.8, 3.94], [-2.6, 3.94], [-3.4, 1.0], [-3.4, 0]], wingUp: 0.7, dihedral: -9,
  fin: [[-3.6, 0], [-7.8, 0], [-8.8, 2.9], [-7.4, 3.0]], finBase: 0.65,
  tail: [[-6.2, 0.5], [-7.2, 2.5], [-8.4, 2.5], [-8.6, 0.5]], planeUp: 0.0,
  engines: 2, nozzle: 0.7,
  glass: [tandem(6.4, 2.6, 1.15, 1.3, 0.62, 0.72, 0.38)],
  bodies: [T2_INTAKE],
};
A['t-2'] = make(T2);
A['mitsubishi-f1'] = make({ ...T2, cls: 'attack', glass: [bubble(6.4, 4.6, 1.15, 0.62, 0.7, 0.38)], bodies: [T2_INTAKE, spine(4.6, 2.0, 0.66, 0.36, 0.36)] });
// HAL HF-24 Marut: side intakes, a 52-degree wing, twin engines, a tall fin (15.87 x 9.0 x 3.6 m).
A['hf-24'] = make({
  cls: 'attack', length: 15.87, span: 9.0, height: 3.6,
  top: [[7.935, -0.1], [6.8, 0.35], [5.4, 0.6], [4.6, 0.72], [1, 0.75], [-3, 0.62], [-7.8, 0.45]],
  bottom: [[7.935, -0.15], [6.8, -0.45], [4.8, -0.62], [0, -0.75], [-4, -0.7], [-7.8, -0.45]],
  plan: [[7.935, 0.03], [6.8, 0.42], [5.2, 0.58], [4.2, 0.6], [3.8, 1.0], [-1, 1.0], [-5, 0.85], [-7.8, 0.65]],
  wing: [[1.0, 0], [1.0, 1.0], [-2.4, 4.5], [-3.2, 4.5], [-3.8, 1.0], [-3.8, 0]], wingUp: -0.2,
  fin: [[-3.0, 0], [-7.0, 0], [-8.0, 2.4], [-6.8, 2.5]], finBase: 0.65,
  tail: [[-5.6, 0.6], [-6.6, 2.4], [-7.6, 2.4], [-7.8, 0.6]], planeUp: -0.2,
  engines: 2, nozzle: 0.65,
  glass: [bubble(5.2, 3.4, 1.2, 0.72, 0.75, 0.38)],
  bodies: [trunk(4.0, -1.2, 0.4, -0.6, 0.32, 0.7, 0, 2.6)],
});
// Bell P-59 Airacomet: a straight mid wing, two engines in nacelles hugging the body under the wing roots (11.83 x
// 13.87 x 3.76 m).
A['p-59a'] = make({
  cls: 'jet-fighter', length: 11.83, span: 13.87, height: 3.76,
  top: [[5.915, -0.1], [5.4, 0.35], [4.4, 0.6], [3.2, 0.7], [1.0, 0.68], [-2, 0.5], [-5.9, 0.35]],
  bottom: [[5.915, -0.2], [5.0, -0.55], [3.0, -0.65], [0, -0.65], [-3, -0.45], [-5.9, -0.2]],
  plan: [[5.915, 0.1], [5.0, 0.48], [3.0, 0.6], [0, 0.6], [-3, 0.4], [-5.9, 0.2]],
  wing: [[1.6, 0], [1.6, 1.2], [0.8, 6.9], [-0.4, 6.9], [-1.6, 1.2], [-1.6, 0]], dihedral: 3,
  fin: [[-3.6, 0], [-5.7, 0], [-6.0, 1.9], [-5.0, 1.95]], finBase: 0.4,
  tail: [[-4.0, 0.2], [-4.3, 2.6], [-5.2, 2.6], [-5.4, 0.2]], planeUp: 0.25,
  engines: 0,
  glass: [bubble(4.4, 2.6, 1.05, 0.6, 0.68, 0.36)],
  bodies: [pod(2.0, -2.0, 0.42, 0.95, -0.25, 0.25)],
});
// FFA P-16: a thin straight wing with big tip tanks, side intakes, a swept tail (14.25 x 11.14 x 4.1 m).
A['ffa-p16'] = make({
  cls: 'attack', length: 14.25, span: 11.14, height: 4.1,
  top: [[7.125, -0.1], [6.4, 0.3], [5.2, 0.55], [4.2, 0.68], [1, 0.72], [-3, 0.6], [-7.0, 0.4]],
  bottom: [[7.125, -0.15], [6.2, -0.5], [4.2, -0.65], [0, -0.75], [-3, -0.6], [-7.0, -0.35]],
  plan: [[7.125, 0.03], [6.2, 0.42], [4.4, 0.55], [3.4, 0.58], [3.0, 0.95], [-1, 0.95], [-4, 0.7], [-7.0, 0.4]],
  wing: [[1.4, 0], [1.4, 0.95], [0.6, 5.2], [-0.6, 5.2], [-1.6, 0.95], [-1.6, 0]],
  fin: [[-3.0, 0], [-6.4, 0], [-7.4, 2.4], [-6.2, 2.5]], finBase: 0.6,
  tail: [[-5.4, 0.5], [-6.2, 2.3], [-7.0, 2.3], [-7.2, 0.5]], planeUp: 0.6,
  nozzle: 0.7,
  glass: [bubble(4.8, 3.0, 1.18, 0.68, 0.72, 0.38)],
  bodies: [pod(1.8, -1.4, 0.35, 5.4, 0), trunk(3.2, -1.0, 0.4, -0.55, 0.3, 0.68, 0, 2.4)],
});
// Yak-38: a lift-jet VTOL - side intakes, a small wing with folding tips, the lift-engine doors behind the cockpit, a
// conventional tail (16.37 x 7.32 x 4.25 m). Yak-141: twin booms with twin fins either side of the swivelling nozzle,
// side intakes, a trapezoid shoulder wing (18.36 x 10.1 x 5.0 m).
A['yak-38'] = make({
  cls: 'attack', length: 16.37, span: 7.32, height: 4.25,
  top: [[8.185, -0.1], [7.2, 0.3], [5.8, 0.55], [5.0, 0.7], [2.0, 0.85], [-3, 0.7], [-8.1, 0.45]],
  bottom: [[8.185, -0.15], [7.0, -0.45], [5.2, -0.62], [0, -0.85], [-3, -0.75], [-8.1, -0.3]],
  plan: [[8.185, 0.03], [7.0, 0.4], [5.4, 0.55], [4.6, 0.58], [4.2, 1.0], [-1, 1.05], [-4, 0.8], [-8.1, 0.4]],
  wing: [[0.8, 0], [0.8, 1.05], [-0.8, 3.66], [-1.8, 3.66], [-2.6, 1.05], [-2.6, 0]], wingUp: 0.55, dihedral: -4,
  fin: [[-3.8, 0], [-7.6, 0], [-8.4, 2.4], [-7.2, 2.5]], finBase: 0.6,
  tail: [[-5.8, 0.4], [-6.6, 2.1], [-7.6, 2.1], [-7.8, 0.4]], planeUp: 0.0,
  engines: 0,
  glass: [bubble(5.6, 3.8, 1.2, 0.7, 0.8, 0.38)],
  bodies: [spine(3.6, 1.6, 0.8, 0.15, 0.45), pod(0.2, -1.2, 0.36, 0.9, -0.75, 0.2), trunk(4.4, -1.0, 0.45, -0.6, 0.35, 0.72, 0, 3)],
});
A['yak-141'] = make({
  cls: 'fighter', length: 18.36, span: 10.1, height: 5.0,
  top: [[9.18, -0.1], [8.0, 0.35], [6.4, 0.6], [5.4, 0.75], [2, 0.85], [-2, 0.7], [-3.6, 0.4]],
  bottom: [[9.18, -0.15], [8.0, -0.5], [6.0, -0.65], [0, -0.75], [-3, -0.6], [-3.6, -0.3]],
  plan: [[9.18, 0.04], [8.0, 0.45], [6.0, 0.6], [5.0, 0.62], [4.6, 1.1], [0, 1.2], [-3.6, 0.9]],
  wing: [[1.2, 0], [1.2, 1.2], [-1.0, 5.05], [-2.0, 5.05], [-2.8, 1.2], [-2.8, 0]], wingUp: 0.6,
  fin: [[-6.4, 0], [-8.6, 0], [-9.3, 2.6], [-8.0, 2.7]], finBase: 0.2, twin: 2.3,
  tail: [[-7.2, 0], [-7.6, 1.6], [-8.8, 1.6], [-9.0, 0]], planeUp: 0.2,
  nozzle: 1.0,
  glass: [bubble(6.4, 4.4, 1.25, 0.6, 0.85, 0.4)],
  bodies: [pod(-2.0, -9.2, 0.26, 1.15, 0.0, 0.1), trunk(4.8, -1.0, 0.5, -0.65, 0.38, 0.8, 0.2, 4)],
});

// ---------------------------------------------------------------- S-3 and drones

// S-3B Viking: a high wing with two engine pods under it, a tall fin, the side-by-side cockpit high in the nose, the
// MAD boom at the tail (16.26 x 20.93 x 6.93 m).
A['s-3b'] = make({
  cls: 'patrol', length: 16.26, span: 20.93, height: 6.93,
  top: [[8.13, -0.4], [7.6, 0.4], [6.4, 1.05], [5.2, 1.25], [-2, 1.25], [-5, 1.0], [-8.0, 0.7]],
  bottom: [[8.13, -0.6], [7.4, -1.1], [6.0, -1.25], [-2, -1.25], [-5, -0.7], [-8.0, 0.1]],
  plan: [[8.13, 0.3], [7.4, 0.9], [6.0, 1.15], [-2, 1.2], [-5, 0.8], [-8, 0.35]], round: 3,
  wing: [[1.6, 0], [1.6, 1.2], [-0.8, 10.46], [-2.2, 10.46], [-2.0, 1.2], [-2.0, 0]], wingUp: 1.15,
  fin: [[-3.6, 0], [-7.4, 0], [-8.6, 4.1], [-7.0, 4.2]], finBase: 1.0,
  tail: [[-5.8, 0.4], [-6.8, 4.1], [-8.0, 4.1], [-8.2, 0.4]], planeUp: 0.5,
  engines: 0,
  glass: [sideBySide(6.6, 5.2, 1.4, 1.0, 1.18, 0.85)],
  bodies: [pod(1.8, -1.6, 0.6, 2.5, 0.2, 0.25), pod(-7.8, -9.4, 0.1, 0, 0.2)],
});
// MQ-1 Predator: the bulbous satellite-dish nose, a long straight wing, the inverted V-tail and the pusher (8.22 x
// 14.8 x 2.1 m). MQ-9 Reaper: bigger, a V-tail pointing up with a ventral fin (11.0 x 20.1 x 3.81 m). Wing Loong I:
// the Predator's layout with an upright V-tail and a ventral fin (9.05 x 14.0 x 2.77 m).
const PREDATOR: Make = {
  cls: 'drone-fixed', length: 8.22, span: 14.8, height: 2.1,
  top: [[4.11, -0.1], [3.6, 0.35], [2.6, 0.42], [0, 0.3], [-3.0, 0.2], [-4.11, 0.12]],
  bottom: [[4.11, -0.2], [3.4, -0.38], [1.0, -0.4], [-2.0, -0.3], [-4.11, -0.1]],
  plan: [[4.11, 0.1], [3.4, 0.38], [1.0, 0.42], [-2.0, 0.3], [-4.11, 0.1]], round: 2.4,
  wing: [[0.6, 0], [0.6, 0.4], [0.3, 7.4], [-0.2, 7.4], [-0.5, 0.4], [-0.5, 0]], wingUp: 0.2,
  fin: [[-3.0, 0], [-4.0, 0], [-4.2, -1.4], [-3.7, -1.4]], finBase: 0.1, v: true,
  glass: [],
  propeller: { diameter: 1.8, blades: 2 },
};
A['mq-1-predator'] = make(PREDATOR);
A['mq-9-reaper'] = make({
  ...PREDATOR, length: 11.0, span: 20.1, height: 3.81,
  top: [[5.5, -0.1], [4.9, 0.45], [3.6, 0.55], [0, 0.42], [-4.0, 0.28], [-5.5, 0.15]],
  bottom: [[5.5, -0.25], [4.6, -0.5], [1.0, -0.55], [-3.0, -0.4], [-5.5, -0.12]],
  plan: [[5.5, 0.12], [4.6, 0.5], [1.0, 0.55], [-3.0, 0.4], [-5.5, 0.12]],
  wing: [[0.8, 0], [0.8, 0.55], [0.4, 10.05], [-0.2, 10.05], [-0.7, 0.55], [-0.7, 0]], wingUp: 0.25,
  fin: [[-4.0, 0], [-5.4, 0], [-5.7, 2.0], [-5.0, 2.0]], finBase: 0.15,
  bodies: [{ top: [[-4.6, -0.1], [-5.5, -0.1]], bottom: [[-4.6, -0.2], [-5.3, -1.1], [-5.6, -1.1]], plan: [[-4.6, 0.04], [-5.5, 0.04]], round: 6, stations: 6 }],
  propeller: { diameter: 2.8, blades: 3 },
});
A['wing-loong'] = make({ ...PREDATOR, length: 9.05, span: 14.0, height: 2.77, fin: [[-3.4, 0], [-4.4, 0], [-4.7, 1.5], [-4.1, 1.5]], bodies: [{ top: [[-3.8, -0.1], [-4.5, -0.1]], bottom: [[-3.8, -0.2], [-4.4, -0.9], [-4.6, -0.9]], plan: [[-3.8, 0.04], [-4.5, 0.04]], round: 6, stations: 6 }], top: PREDATOR.top.map(([x, v]) => [x * 1.1, v] as P2), bottom: PREDATOR.bottom.map(([x, v]) => [x * 1.1, v] as P2), plan: PREDATOR.plan.map(([x, v]) => [x * 1.1, v] as P2), wing: [[0.6, 0], [0.6, 0.4], [0.3, 7.0], [-0.2, 7.0], [-0.5, 0.4], [-0.5, 0]] });

/** Names in data with no alias elsewhere (War Thunder ids from the public wiki's aviation tree, DCS and Battlefield names). */
const ALIASES: Record<string, string> = {
  a_4b: 'a-4b',
  a_4e_early: 'a-4e',
  a_4e_early_iaf: 'a-4e',
  a_4e_late_iaf: 'a-4h',
  a_4h: 'a-4h',
  a_4ptm_malaysia: 'a-4f',
  'a-4e-c': 'a-4e',
  a_7d: 'a-7',
  a_7e: 'a-7',
  a_7e_thailand: 'a-7',
  a_7e_greece: 'a-7',
  a_7h_greece: 'a-7',
  a_7k: 'a-7k',
  amx: 'amx',
  amx_a_1a_brazil: 'amx',
  marut_mk1: 'hf-24',
  'f-5t_thailand': 'f-5e',
  'f-5th_thailand': 'f-5e',
  'su-25sm': 'su-25',
  'su-25ub': 'su-25ub',
  'mig-19pm': 'mig-19p',
  md_460_sambad: 'mystere',
  // Tacview's long names, which the prefix match does not reach.
  'a-4e skyhawk': 'a-4e',
  'a-4f skyhawk': 'a-4f',
  'a-4m skyhawk': 'a-4m',
  'a-6e intruder': 'a-6e',
  'a-7e corsair ii': 'a-7',
  'av-8b harrier ii': 'av-8b',
  'su-25 frogfoot': 'su-25',
  'su-25t frogfoot': 'su-25t',
  'su-24 fencer': 'su-24m',
  'su-17 fitter': 'su-17m4',
  'mig-15 fagot': 'mig-15bis',
  'mig-17 fresco': 'mig-17',
  'mig-19 farmer': 'mig-19s',
  'f-86 sabre': 'f-86f',
  'f-100 super sabre': 'f-100d',
  'f-104 starfighter': 'f-104g',
  'l-39 albatros': 'l-39',
  'alpha jet': 'alpha-jet-e',
  't-38 talon': 't-38',
  'f-5e tiger ii': 'f-5e',
  'il-28 beagle': 'il-28',
  'yak-130 mitten': 'yak-130',
};

export const JET_ATTACK: SpecSet = { air: A, aliases: ALIASES };
