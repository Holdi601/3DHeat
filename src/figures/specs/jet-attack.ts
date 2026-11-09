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
import { fig, oneSide, post, trunk, type Fig, type Row } from './air-extra';
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
  /** The exhausts' height when the tail is not on the axis, and where they end when not at the tail (a fin or a probe beyond them). */
  nozzleUp?: number;
  nozzleX?: number;
  glass: Outline[];
  bodies?: (Outline & { oneSide?: boolean })[];
  /** The wing's thickness over its chord at the root, an outer panel's own dihedral; the tailplane's dihedral (negative droops it). */
  thick?: number;
  outerDihedral?: { at: number; deg: number };
  planeDihedral?: number;
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
    wing: { x: 0, span: 2 * ws, rootChord: 3, tipChord: 1, sweep: 30, mount: (p.wingUp ?? 0) / (bh * 0.4), dihedral: p.dihedral ?? 0, thicknessRatio: p.thick, outerDihedral: p.outerDihedral },
    wingPlan: p.wing,
    canard: p.canard,
    tail: { kind, finHeight: fh, finChord: 3, spacing: p.twin, tailSpan: 2 * ts, tailChord: 1.5, finBase: p.finBase, planeUp: kind === 't' ? undefined : (p.planeUp ?? 0), planeDihedral: p.planeDihedral },
    finPlan: p.fin,
    tailPlan: p.tail,
    engines: p.propeller ? { kind: 'pusher', count: 1 } : p.engines === 0 ? undefined : { kind: 'internal', count: p.engines ?? 1, diameter: p.nozzle ?? bh * 0.5, nozzles: p.nozzleUp === undefined ? undefined : Array.from({ length: p.engines ?? 1 }, (_, i) => [p.nozzleX ?? -p.length / 2 + 0.3, (i - ((p.engines ?? 1) - 1) / 2) * (p.nozzle ?? bh * 0.5) * 1.05, p.nozzleUp!] as [number, number, number]) },
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
// 12 degrees of anhedral and outrigger wheels at the tips, four nozzles on the body's sides, a drooped tailplane
// (13.87 x 7.7 x 3.45 m). The GR.3 with the long chisel laser nose; the AV-8A and GR.1 with the plain pointed one.
// Proportioned from the AV-8B's measured body below (estimates; no first-generation 3-view at hand): belly to the
// spine 1.5 m, to the lower canopy 1.7 m, the fin's top 3.3 m over the belly.
const HARRIER_TOP: P2[] = [[6.94, -0.35], [6.3, -0.08], [5.2, 0.2], [4.6, 0.3], [2.9, 0.65], [1.0, 0.68], [-1.5, 0.66], [-3.5, 0.6], [-5.5, 0.5], [-6.9, 0.42]];
const HARRIER_BOTTOM: P2[] = [[6.94, -0.45], [6.0, -0.68], [4.4, -0.8], [3.0, -0.85], [-0.5, -0.85], [-2.5, -0.6], [-4.0, -0.4], [-6.9, -0.05]];
const HARRIER_PLAN: P2[] = [[6.94, 0.05], [6.2, 0.4], [4.8, 0.55], [3.8, 0.6], [3.3, 1.2], [1.0, 1.25], [-1.5, 1.0], [-3.0, 0.55], [-6.9, 0.25]];
const NOZZLES = [pod(1.3, 0.5, 0.26, 1.25, -0.55, 0.3), pod(-0.6, -1.4, 0.26, 1.15, -0.55, 0.3)];
const HARRIER1: Make = {
  cls: 'attack', length: 13.87, span: 7.7, height: 3.45,
  top: HARRIER_TOP, bottom: HARRIER_BOTTOM, plan: HARRIER_PLAN, round: [[6.9, 2.4], [3.4, 3.4], [-6.9, 2.6]],
  wing: [[1.4, 0], [1.4, 1.1], [-0.46, 3.85], [-1.36, 3.85], [-2.4, 1.1], [-2.4, 0]], wingUp: 0.62, dihedral: -12, planeDihedral: -15,
  fin: [[-3.6, 0], [-6.3, 0], [-6.6, 1.85], [-5.6, 1.9]], finBase: 0.5,
  tail: [[-5.0, 0.3], [-5.6, 2.1], [-6.4, 2.1], [-6.6, 0.3]], planeUp: 0.4,
  engines: 0,
  glass: [bubble(4.7, 2.9, 0.85, 0.3, 0.66, 0.38)],
  bodies: [...NOZZLES, pod(-0.9, -1.9, 0.12, 3.7, -0.15)],
};
A['harrier-gr3'] = make({ ...HARRIER1, top: nose(HARRIER_TOP, 6.0, [[7.2, -0.3], [6.6, -0.15], [6.1, -0.02]]), bottom: nose(HARRIER_BOTTOM, 6.0, [[7.2, -0.5], [6.6, -0.58], [6.1, -0.65]]), plan: nose(HARRIER_PLAN, 6.0, [[7.2, 0.18], [6.6, 0.3], [6.1, 0.42]]), length: 14.27 });
A['av-8a'] = make({ ...HARRIER1, length: 13.69, top: nose(HARRIER_TOP, 6.2, [[6.85, -0.35], [6.3, -0.08]]), bottom: nose(HARRIER_BOTTOM, 6.0, [[6.85, -0.45], [6.0, -0.68]]), plan: nose(HARRIER_PLAN, 6.2, [[6.85, 0.04], [6.2, 0.4]]) });

// Sea Harrier FRS.1: the first-generation wing with the cockpit raised high in a bubble, the pointed Blue Fox radome
// (14.5 x 7.6 x 3.71 m). FA.2: the rounder, fatter Blue Vixen radome and a longer rear body.
const SHAR_TOP: P2[] = [[7.25, -0.3], [6.6, 0.0], [5.6, 0.25], [4.8, 0.5], [3.0, 0.78], [1.0, 0.74], [-1.5, 0.68], [-3.5, 0.6], [-5.5, 0.5], [-7.2, 0.42]];
const SHAR_BOTTOM: P2[] = [[7.25, -0.4], [6.4, -0.66], [4.6, -0.8], [3.0, -0.85], [-0.5, -0.85], [-2.5, -0.6], [-4.0, -0.4], [-7.2, -0.05]];
const SHAR: Make = {
  ...HARRIER1, length: 14.5, span: 7.6, height: 3.71,
  top: SHAR_TOP, bottom: SHAR_BOTTOM, plan: [[7.25, 0.03], [6.4, 0.4], [4.8, 0.58], [3.8, 0.62], [3.3, 1.2], [1.0, 1.25], [-1.5, 1.0], [-3.0, 0.55], [-7.2, 0.25]],
  glass: [bubble(4.9, 3.0, 1.1, 0.5, 0.78, 0.4)],
};
A['sea-harrier-frs1'] = make(SHAR);
A['sea-harrier-fa2'] = make({
  ...SHAR, length: 14.17,
  top: nose(SHAR_TOP, 5.6, [[7.4, -0.05], [7.0, 0.2], [6.2, 0.32], [5.6, 0.35]]),
  bottom: [[7.4, -0.45], [6.8, -0.68], ...SHAR_BOTTOM.slice(2)],
  plan: [[7.4, 0.2], [6.8, 0.5], [5.6, 0.62], [3.8, 0.62], [3.3, 1.2], [1.0, 1.25], [-1.5, 1.0], [-3.0, 0.55], [-7.2, 0.25]],
});

// Second generation (AV-8B, GR.5/7/9): the bigger wing with less sweep and LERX, the cockpit raised in a long bubble
// over a drooping nose, the spine running level back to the fin, the night-attack FLIR hump on the nose
// (14.12 x 9.25 x 3.55 m). AV-8B Plus: the radar nose (14.55 m). T.10 / TAV-8B: two seats under a long stepped canopy,
// a taller fin (15.79 m). Checked by eye against a public 3-view (estimates): belly to canopy top 1.8 m, to the spine
// 1.55 m, 2.65 m wide over the intakes, the rear body still 1.1 m deep 4 m behind the middle, the fin's top 3.4 m
// over the belly.
const BEE_TOP: P2[] = [[7.06, -0.4], [6.5, -0.1], [5.7, 0.05], [3.15, 0.74], [0, 0.74], [-2.4, 0.74], [-4.0, 0.72], [-5.6, 0.64], [-7.0, 0.58]];
const BEE_BOTTOM: P2[] = [[7.06, -0.46], [6.4, -0.66], [5.7, -0.73], [4.6, -0.8], [3.0, -0.85], [-0.5, -0.85], [-2.4, -0.6], [-4.0, -0.4], [-5.6, -0.15], [-7.0, 0.02]];
const BEE_PLAN: P2[] = [[7.06, 0.05], [6.4, 0.38], [4.8, 0.55], [3.8, 0.6], [3.3, 1.28], [1.0, 1.32], [-1.5, 1.05], [-3.0, 0.6], [-7.0, 0.28]];
const BEE: Make = {
  ...HARRIER1, length: 14.12, span: 9.25, height: 3.55,
  top: BEE_TOP, bottom: BEE_BOTTOM, plan: BEE_PLAN,
  wing: [[2.6, 0], [2.4, 1.0], [1.4, 1.3], [0.0, 4.62], [-1.1, 4.62], [-2.6, 1.3], [-2.7, 0]], wingUp: 0.66, dihedral: -12,
  fin: [[-3.6, 0], [-6.4, 0], [-6.65, 1.95], [-5.75, 2.0]], finBase: 0.6,
  planeUp: 0.45,
  glass: [bubble(5.7, 3.15, 1.02, 0.05, 0.74, 0.42)],
  bodies: [...NOZZLES, pod(-0.6, -1.6, 0.12, 4.0, -0.2)],
};
const FLIR_HUMP = spine(6.4, 5.4, -0.05, 0.25, 0.17);
A['av-8b'] = make({ ...BEE, bodies: [...BEE.bodies!, FLIR_HUMP] });
A['av-8b-plus'] = make({ ...BEE, length: 14.55, top: nose(BEE_TOP, 5.7, [[7.28, -0.15], [6.8, 0.0], [6.2, 0.05]]), bottom: nose(BEE_BOTTOM, 5.7, [[7.28, -0.5], [6.8, -0.68], [6.2, -0.72]]), plan: nose(BEE_PLAN, 4.8, [[7.28, 0.15], [6.8, 0.42], [5.6, 0.55]]), bodies: [...BEE.bodies!, shift(FLIR_HUMP, -0.6)] });
A['harrier-t10'] = make({
  ...BEE, length: 15.79,
  top: nose(BEE_TOP, 3.15, [[7.9, -0.4], [7.3, -0.1], [6.5, 0.05]]),
  bottom: nose(BEE_BOTTOM, 4.6, [[7.9, -0.46], [7.2, -0.66], [6.5, -0.73]]),
  plan: nose(BEE_PLAN, 4.8, [[7.9, 0.05], [7.2, 0.38], [5.6, 0.55]]),
  fin: [[-4.2, 0], [-7.2, 0], [-7.5, 2.25], [-6.4, 2.3]], tail: [[-5.8, 0.3], [-6.4, 2.1], [-7.2, 2.1], [-7.4, 0.3]],
  glass: [tandem(6.5, 2.4, 0.98, 1.2, 0.05, 0.8, 0.42)], bodies: [...BEE.bodies!, shift(FLIR_HUMP, 0.8)],
});

// ---------------------------------------------------------------- A-4 Skyhawk

// The small delta-like low wing, side intakes, the canopy over a short drooping nose, the tailplane low on the fin
// (12.22 x 8.38 x 4.57 m). B/C: the early round-topped fin and small canopy. E: the longer nose. F, and the A-4PTM:
// the avionics hump behind the cockpit. M and N: the hump, the bigger canopy and the square-topped fin; H and N with
// the long tailpipe. Checked by eye against a public 3-view of the A-4M (estimates): belly to canopy top 1.85 m, to
// the hump 1.95 m, level from the canopy to the fin; the half-round intakes 0.95 m tall, high on the sides; 1.65 m
// wide over them; the belly rising from the wing back to the tail; the tailplane 1.6 m over the belly.
const SKY_TOP: P2[] = [[6.11, -0.5], [5.6, -0.15], [4.4, 0.25], [3.4, 0.5], [2.3, 0.66], [0, 0.68], [-3, 0.6], [-6.0, 0.35]];
const SKY_BOTTOM: P2[] = [[6.11, -0.6], [5.8, -0.8], [3.6, -0.85], [1.4, -0.76], [-0.8, -0.6], [-3.0, -0.44], [-5.2, -0.22], [-6.0, -0.1]];
// The half-round intakes high on the body's sides behind the cockpit.
const SKY_INTAKE = trunk(2.5, -1.2, 0.68, -0.27, 0.27, 0.55, 0, 2.2);
// The fixed refuelling probe along the nose's right side, reaching well past its tip.
const SKY_PROBE = oneSide(pod(7.4, 3.0, 0.07, 0.5, 0.05, 0.05));
const SKY_PLAN: P2[] = [[6.11, 0.04], [5.2, 0.32], [3.8, 0.48], [2.6, 0.55], [2.2, 0.72], [-0.5, 0.72], [-2.5, 0.62], [-6.0, 0.38]];
const SKY: Make = {
  cls: 'attack', length: 12.22, span: 8.38, height: 4.57,
  top: SKY_TOP, bottom: SKY_BOTTOM, plan: SKY_PLAN,
  wing: [[1.6, 0], [1.6, 0.7], [-0.87, 4.19], [-1.67, 4.19], [-3.2, 0.7], [-3.2, 0]], wingUp: -0.55,
  fin: [[-2.6, 0], [-5.6, 0], [-6.1, 2.3], [-5.7, 2.5], [-5.0, 2.55], [-4.6, 2.4]], finBase: 0.45,
  tail: [[-4.6, 0], [-5.3, 1.7], [-6.1, 1.7], [-6.1, 0]], planeUp: 0.78,
  nozzle: 0.6, nozzleUp: 0.12,
  glass: [bubble(4.3, 2.4, 0.95, 0.27, 0.66, 0.38)],
  bodies: [SKY_INTAKE, SKY_PROBE, SKY_PROBE],
};
const SQUARE_FIN: P2[] = [[-2.6, 0], [-5.6, 0], [-6.15, 2.65], [-4.85, 2.65]];
// The avionics hump: from the canopy's back, as high as its top, level to the fin.
const SKY_HUMP: Outline = { top: [[2.4, 0.66], [2.2, 1.05], [-2.6, 1.03], [-3.0, 0.85]], bottom: [[2.4, 0.4], [-3.0, 0.4]], plan: [[2.4, 0.2], [2.2, 0.32], [-2.6, 0.28], [-3.0, 0.12]], round: 3, stations: 10 };
const LONG_PIPE = pod(-5.6, -6.6, 0.32, 0, 0.0, 0.05);
const SKY_E_TOP = nose(SKY_TOP, 5.6, [[6.26, -0.5], [5.7, -0.15]]);
A['a-4b'] = make(SKY);
A['a-4e'] = make({ ...SKY, length: 12.52, top: SKY_E_TOP, bottom: nose(SKY_BOTTOM, 5.8, [[6.26, -0.6], [5.9, -0.8]]), plan: nose(SKY_PLAN, 5.2, [[6.26, 0.04], [5.3, 0.32]]) });
A['a-4f'] = make({ ...SKY, length: 12.52, top: SKY_E_TOP, bodies: [SKY_INTAKE, SKY_PROBE, SKY_HUMP] });
// The catalogue's plain 'a-4' is the A-4E.
A['a-4'] = A['a-4e'];
A['a-4h'] = make({ ...SKY, length: 12.52, fin: SQUARE_FIN, bodies: [SKY_INTAKE, SKY_PROBE, LONG_PIPE] });
A['a-4m'] = make({ ...SKY, length: 12.27, fin: SQUARE_FIN, glass: [bubble(4.36, 2.28, 1.01, 0.27, 0.66, 0.4)], bodies: [SKY_INTAKE, SKY_PROBE, SKY_HUMP] });
A['a-4n'] = make({ ...SKY, length: 12.27, fin: SQUARE_FIN, glass: [bubble(4.36, 2.28, 1.01, 0.27, 0.66, 0.4)], bodies: [SKY_INTAKE, SKY_PROBE, SKY_HUMP, LONG_PIPE] });

// ---------------------------------------------------------------- A-6, A-7, AMX

// A-6E Intruder: two seats side by side under a broad canopy behind the bulbous radome, the refuelling probe standing
// up in front of the windscreen, the TRAM turret under the nose, a mid wing of 25 degrees (16.69 x 16.15 x 4.93 m).
// Checked by eye against a public 3-view (estimates): canopy top to the intakes' bottom 2.6 m, the canopy 1.85 m wide,
// 2.7 m across the intakes, the tail boom 1.05 m deep 2.7 m behind the middle.
A['a-6e'] = make({
  cls: 'attack', length: 16.69, span: 16.15, height: 4.93,
  top: [[8.345, -0.1], [7.8, 0.4], [7.0, 0.75], [6.2, 0.9], [4.0, 1.0], [1.0, 0.8], [-3, 0.45], [-8.2, 0.25]],
  bottom: [[8.345, -0.3], [7.6, -0.75], [6.4, -0.95], [4.0, -1.0], [0, -1.0], [-3, -0.62], [-8.2, -0.35]],
  plan: [[8.345, 0.2], [7.6, 0.75], [6.4, 1.0], [4.0, 1.1], [1.0, 1.1], [-3, 0.8], [-8.2, 0.4]],
  wing: [[1.6, 0], [1.6, 1.1], [-1.75, 8.07], [-3.15, 8.07], [-3.0, 1.1], [-3.0, 0]], wingUp: 0.1,
  fin: [[-4.2, 0], [-7.6, 0], [-8.6, 2.9], [-7.2, 2.95]], finBase: 0.55,
  tail: [[-5.8, 0.3], [-6.6, 3.1], [-7.7, 3.1], [-8.0, 0.3]], planeUp: 0.1,
  engines: 2, nozzle: 0.75,
  glass: [sideBySide(6.3, 3.8, 1.55, 0.92, 0.95, 0.75)],
  bodies: [pod(4.6, -2.4, 0.45, 1.05, -0.45, 0.15), pod(8.6, 6.4, 0.06, 0, 1.0, 0.1), pod(7.2, 6.6, 0.3, 0, -0.95, 0.4)],
});
// A-7 Corsair II: the stubby body over the big chin intake, the canopy long over a short radome, the spine running high
// and level to the tall fin, the belly sweeping up to the jet pipe, the shoulder wing with anhedral (14.06 x 11.8 x
// 4.9 m). A-7K: the two-seater, 0.86 m longer with the stepped tandem canopy. Checked by eye against a public 3-view
// (estimates): belly to canopy top 2.3 m, to the spine 2.15 m all the way back to the fin, 1.6 m deep 2.5 m before
// the tail; 1.6 m wide; the fin's top 4.65 m over the belly.
const CORSAIR_REAR: [P2[], P2[]] = [[[3.07, 1.19], [-0.29, 1.15], [-2.82, 1.12], [-4.5, 1.07], [-7.0, 0.73]], [[-0.29, -1.0], [-2.82, -0.87], [-4.5, -0.53], [-7.0, 0.06]]];
const CORSAIR: Make = {
  cls: 'attack', length: 14.06, span: 11.8, height: 4.9,
  top: [[7.03, 0.48], [6.27, 0.57], [4.76, 0.6], ...CORSAIR_REAR[0]],
  bottom: [[7.03, -0.87], [6.27, -1.0], ...CORSAIR_REAR[1]],
  plan: [[7.03, 0.45], [6.6, 0.65], [5.0, 0.75], [1.0, 0.79], [-2.5, 0.7], [-7.0, 0.42]],
  round: 2.8,
  wing: [[1.6, 0], [1.6, 0.9], [-2.1, 5.9], [-3.3, 5.9], [-3.7, 0.9], [-3.7, 0]], wingUp: 0.85, dihedral: -5,
  fin: [[-2.4, 0], [-6.2, 0], [-6.9, 2.55], [-5.5, 2.6]], finBase: 1.05,
  tail: [[-5.0, 0.4], [-5.8, 2.75], [-6.8, 2.75], [-7.0, 0.4]], planeUp: 0.0,
  nozzle: 0.7, nozzleUp: 0.4,
  glass: [bubble(6.5, 3.07, 1.32, 0.5, 1.15, 0.42)],
};
A['a-7'] = make(CORSAIR);
A['a-7k'] = make({ ...CORSAIR, length: 14.92, top: [[7.46, 0.48], [6.7, 0.57], [5.2, 0.6], ...CORSAIR_REAR[0]], bottom: [[7.46, -0.87], [6.7, -1.0], ...CORSAIR_REAR[1]], plan: [[7.46, 0.45], [7.0, 0.65], [5.0, 0.75], [1.0, 0.79], [-2.5, 0.7], [-7.0, 0.42]], glass: [tandem(6.9, 2.2, 1.28, 1.4, 0.5, 1.15, 0.42)] });
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
// The wing and the all-moving tailplane from the FM 44-80 three-view (scaled by span and length): the wing's root
// from 4.3 m behind the nose, its leading edge swept about 64 degrees and the trailing edge 47, the tips well back
// by the tailplane; the chords scaled to the published 34 m2. The tailplane swept as steeply.
const SU7: Make = {
  cls: 'attack', length: 16.8, span: 9.31, height: 4.8,
  top: [[8.4, 0.59], [7.0, 0.66], [5.6, 0.7], [3.6, 0.88], [1.0, 0.92], [-3, 0.82], [-8.2, 0.4]],
  bottom: [[8.4, -0.71], [6.4, -0.85], [4.6, -0.95], [0, -0.95], [-4, -0.78], [-8.2, -0.4]],
  plan: [[8.4, 0.6], [6.5, 0.68], [2, 0.78], [-4, 0.74], [-8.2, 0.52]], round: 2.1,
  wing: [[4.11, 0], [4.11, 0.75], [-4.0, 4.655], [-5.52, 4.655], [-1.09, 0.75], [-1.09, 0]],
  fin: [[-3.6, 0], [-7.6, 0], [-8.5, 2.35], [-7.4, 2.4]], finBase: 0.75,
  tail: [[-5.27, 0.6], [-8.2, 2.4], [-8.5, 2.4], [-7.14, 0.6]], planeUp: 0.2,
  nozzle: 0.95,
  glass: [bubble(6.6, 4.2, 1.35, 0.66, 0.88, 0.4)],
  bodies: [pod(9.2, 8.2, 0.34, 0, -0.06, 0.6), spine(3.6, -5.0, 0.85, 0.3, 0.38)],
};
A['su-7b'] = make(SU7);
// Su-17M2 / Su-22M: the Su-7's body lengthened with the swing-wing outer panels (shown half swept), a bigger cone and a
// longer spine (19.02 m over the long nose probe, 11.8 m across at this sweep, 5.0 m). Su-17M4 / Su-22M4: the fixed
// cone and the ram-air scoop at the fin's root. Su-22UM3K: two seats, the instructor's canopy stepped up behind with
// the long hump to the fin. Body, glove, fin and tailplane places digitised from the US Army's Su-17 three-view (see
// sources.md) at the published length over the probe: the 2.3 m probe ahead of the intake's lip, the body 2.0 m deep
// over the spine (heights from the probe's level), the glove's root from 5.4 to 12.0 m behind the probe's tip, the
// fin's flat top 2.9 m up, the jet pipe ending 0.9 m ahead of the rudder's tip.
const FITTER_TOP: P2[] = [[7.15, 0.15], [6.71, 0.18], [6.31, 0.25], [5.51, 0.49], [5.1, 0.62], [4.3, 0.85], [3.5, 0.92], [-3.7, 0.92], [-5.3, 0.86], [-7.0, 0.72], [-8.6, 0.42]];
const FITTER: Make = {
  ...SU7, length: 19.02, span: 11.8, height: 5.0,
  top: FITTER_TOP, bottom: [[7.15, -0.75], [6.71, -0.8], [6.31, -0.86], [5.51, -0.98], [4.71, -1.04], [-4.09, -1.04], [-5.69, -0.98], [-6.89, -0.92], [-7.69, -0.74], [-8.6, -0.5]],
  plan: [[7.15, 0.5], [6.31, 0.62], [5.0, 0.7], [2, 0.78], [-4, 0.74], [-7.0, 0.62], [-8.6, 0.46]],
  wing: [[4.1, 0], [4.1, 0.9], [3.6, 1.4], [1.4, 2.3], [-0.2, 2.5], [-2.45, 2.5], [-2.45, 0.75], [-2.45, 0]],  // the fixed glove; the outer panel swings in ./swing.ts
  fin: [[-4.0, 0], [-6.09, 1.0], [-7.69, 1.86], [-8.0, 1.98], [-9.45, 1.98], [-8.4, 0], [-8.4, -0.2], [-4.0, -0.2]], finBase: 0.9,
  tail: [[-5.5, 0.55], [-7.3, 2.55], [-8.6, 2.65], [-7.6, 0.55]], planeUp: 0.65,
  nozzle: 0.9, nozzleUp: -0.18, nozzleX: -8.6,
  glass: [bubble(5.3, 3.7, 1.05, 0.55, 0.92, 0.38)],
  // The cone, the probe, and the tall fence on each glove's outer end by the pivot (its height an estimate from photos).
  bodies: [pod(7.7, 6.8, 0.32, 0, -0.3, 0.6), pod(9.51, 7.3, 0.04, 0, 0.0, 0.1), post(1.6, -2.45, 0.32, 0.0, 0.02, 2.2)],
};
A['su-17m2'] = make(FITTER);
A['su-17m4'] = make({ ...FITTER, bodies: [...FITTER.bodies!, pod(-3.4, -4.3, 0.16, 0, 0.95, 0.3)] });
A['su-22um3k'] = make({ ...FITTER, glass: [tandem(5.3, 2.4, 1.02, 1.22, 0.55, 0.95, 0.4)], bodies: [...FITTER.bodies!, spine(2.6, -6.0, 0.8, 0.3, 0.42)] });

// Su-24M: two seats side by side behind a big radome, box intakes, the glove and swing wing (shown at 35 degrees,
// its cruise sweep; ./swing.ts), twin engines, one big fin (22.67 x 17.64 spread / 10.37 swept x 6.19 m). Checked by eye against a public 3-view (estimates):
// belly to canopy top 2.3 m, 2.2 m deep over the intakes and the wing root, 3.45 m wide over the box intakes.
A['su-24m'] = make({
  cls: 'attack', length: 22.67, span: 14.0, height: 6.19,
  top: [[11.3, -0.1], [10.3, 0.45], [8.8, 0.85], [7.8, 1.05], [5.5, 1.1], [2, 1.0], [-4, 0.85], [-11.2, 0.6]],
  bottom: [[11.3, -0.15], [10.2, -0.6], [8.4, -0.85], [6.6, -0.9], [6.2, -1.2], [-4, -1.15], [-8, -0.8], [-11.2, -0.5]],
  plan: [[11.3, 0.05], [10.2, 0.6], [8.4, 0.85], [7.0, 0.98], [6.6, 1.68], [-3, 1.72], [-8, 1.4], [-11.2, 1.1]],
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
    wing: [[2.2, 0], [2.0, 1.5], [-0.15, 7.18], [-1.45, 7.18], [-2.7, 1.5], [-2.8, 0]], wingUp: 0.5, dihedral: -2.5, thick: 0.1,
    fin: kind === 'ub' ? [[-3.4, 0], [-6.9, 0], [-7.7, 3.0], [-6.5, 3.05]] : [[-3.4, 0], [-6.9, 0], [-7.6, 2.55], [-6.5, 2.6]], finBase: 0.5,
    tail: [[-5.3, 0.35], [-6.3, 2.3], [-7.3, 2.3], [-7.45, 0.35]], planeUp: 0.35,
    nozzles: [[-5.9, -1.0, -0.3], [-5.9, 1.0, -0.3]], nozzle: 0.65,
    bodies: [
      trunk(2.7, -5.6, 0.45, -0.95, 0.55, 1.0, 0.15, 2.6),
      pod(0.2, -1.9, 0.18, 7.1, tip, 0.3),
      // The twin cannon's fairing under the nose's left side.
      oneSide(pod(5.4, 3.6, 0.16, -0.32, -0.8, 0.3)),
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
// spine (15.65 x 9.68 x 4.33 m). The wing from the FM 44-80 three-view (scaled by span and length): the root from
// 5 m behind the nose, the leading edge swept 57 degrees; the chords set to the published 27.95 m2.
A['q-5'] = make({
  cls: 'attack', length: 15.65, span: 9.68, height: 4.33,
  top: [[7.825, -0.1], [6.8, 0.35], [5.4, 0.6], [4.4, 0.75], [2, 0.8], [-3, 0.7], [-7.7, 0.5]],
  bottom: [[7.825, -0.15], [6.8, -0.45], [5.0, -0.65], [0, -0.75], [-4, -0.7], [-7.7, -0.5]],
  plan: [[7.825, 0.03], [6.8, 0.4], [5.2, 0.6], [4.2, 0.62], [3.8, 1.05], [-1, 1.05], [-5, 0.85], [-7.7, 0.65]],
  wing: [[2.8, 0], [2.8, 1.0], [-3.08, 4.84], [-4.28, 4.84], [-1.2, 1.0], [-1.2, 0]],
  fin: [[-3.0, 0], [-7.0, 0], [-7.8, 2.7], [-6.6, 2.75]], finBase: 0.7,
  tail: [[-5.4, 0.6], [-6.4, 2.4], [-7.4, 2.4], [-7.6, 0.6]], planeUp: -0.1,
  engines: 2, nozzle: 0.75,
  glass: [bubble(4.6, 2.8, 1.18, 0.75, 0.85, 0.38)],
  bodies: [spine(2.8, -3.2, 0.8, 0.14, 0.22), trunk(4.0, -1.0, 0.45, -0.6, 0.35, 0.72, 0, 2.6)],
});

// ---------------------------------------------------------------- trainers

// Alpha Jet: a shoulder wing with anhedral, side intakes low on the body, two stepped seats under a long canopy that
// runs on into a high spine, the belly sweeping up to the tail; the German A with the long pointed nose (13.23 m with
// the probe), the French E with the short round one (11.75 m) (span 9.11, 4.19 m). Checked by eye against a public
// 3-view (estimates): belly to the rear canopy's top 1.85 m, 1.8 m deep at the wing, 0.8 m 2.5 m before the tail;
// 1.85 m wide over the 0.75 m tall intakes; the fin's top 3.6 m over the belly.
const ALPHA: Make = {
  cls: 'trainer', length: 13.23, span: 9.11, height: 4.19,
  top: [[6.615, -0.38], [4.51, 0.06], [4.12, 0.1], [0.46, 0.96], [-1.72, 0.88], [-4.05, 0.6], [-6.4, 0.48]],
  bottom: [[6.615, -0.44], [4.51, -0.61], [2.0, -0.8], [-1.72, -0.8], [-4.05, -0.22], [-6.4, -0.1]],
  plan: [[6.615, 0.03], [5.8, 0.3], [4.2, 0.5], [2.6, 0.52], [2.2, 0.93], [-1.2, 0.93], [-4, 0.6], [-6.4, 0.3]],
  wing: [[1.3, 0], [1.3, 0.95], [-0.8, 4.55], [-1.6, 4.55], [-2.4, 0.95], [-2.4, 0]], wingUp: 0.75, dihedral: -6,
  fin: [[-2.6, 0], [-5.8, 0], [-6.6, 2.2], [-5.6, 2.25]], finBase: 0.55,
  tail: [[-4.6, 0.3], [-5.4, 1.95], [-6.2, 1.95], [-6.4, 0.3]], planeUp: 0.25, planeDihedral: -8,
  engines: 2, nozzle: 0.42, nozzleUp: 0.15,
  glass: [tandem(4.12, 0.46, 0.84, 1.07, 0.1, 0.96, 0.42)],
  bodies: [trunk(2.4, -1.4, 0.2, -0.6, 0.3, 0.64, 0, 2.4)],
};
A['alpha-jet-a'] = make(ALPHA);
A['alpha-jet-e'] = make({ ...ALPHA, length: 11.75, top: [[5.875, -0.2], [5.5, 0.0], [4.51, 0.08], [4.12, 0.1], [0.46, 0.96], [-1.72, 0.88], [-4.05, 0.6], [-5.875, 0.48]], bottom: [[5.875, -0.42], [5.4, -0.6], [2.0, -0.8], [-1.72, -0.8], [-4.05, -0.22], [-5.875, -0.1]], plan: [[5.875, 0.12], [5.4, 0.4], [4.2, 0.5], [2.6, 0.52], [2.2, 0.93], [-1.2, 0.93], [-4, 0.6], [-5.875, 0.3]], fin: [[-2.1, 0], [-5.3, 0], [-6.1, 2.2], [-5.1, 2.25]], tail: [[-4.1, 0.3], [-4.9, 1.95], [-5.7, 1.95], [-5.875, 0.3]] });

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

// Hawk T.1: a low swept wing, side intakes, two seats stepped under a long canopy that runs on into a high spine, the
// tail low with drooped tailplanes (11.17 x 9.39 x 3.99 m). Hawk 200 / 209: one seat, the radar nose, the fuselage
// faired behind the cockpit (11.38 m). Checked by eye against a public 3-view silhouette (estimates): belly to the rear
// canopy's top 1.9 m, 1.75 m deep behind it, 0.65 m at the tail cone; 1.8 m wide over the 0.7 m tall intakes; the fin's
// top 3.1 m over the belly.
const HAWK_REAR: [P2[], P2[]] = [[[-0.64, 0.82], [-2.41, 0.7], [-4.19, 0.2], [-5.5, 0.12]], [[-0.64, -0.85], [-2.41, -0.65], [-4.19, -0.48], [-5.5, -0.12]]];
const HAWK: Make = {
  cls: 'trainer', length: 11.17, span: 9.39, height: 3.99,
  top: [[5.585, -0.25], [4.7, 0.17], [3.87, 0.32], [0.67, 0.95], ...HAWK_REAR[0]],
  bottom: [[5.585, -0.35], [4.7, -0.6], [1.74, -0.78], ...HAWK_REAR[1]],
  plan: [[5.585, 0.05], [4.8, 0.38], [3.2, 0.5], [2.2, 0.52], [1.8, 0.9], [-1.4, 0.9], [-3.6, 0.55], [-5.5, 0.3]],
  wing: [[1.2, 0], [1.2, 0.85], [-1.1, 4.7], [-1.8, 4.7], [-2.7, 0.85], [-2.7, 0]], wingUp: -0.6, dihedral: 2,
  fin: [[-2.2, 0], [-5.0, 0], [-5.8, 2.1], [-4.8, 2.15]], finBase: 0.2,
  tail: [[-3.9, 0.3], [-4.7, 2.2], [-5.5, 2.2], [-5.6, 0.3]], planeUp: 0.0, planeDihedral: -10,
  nozzle: 0.5,
  glass: [tandem(3.87, 0.67, 0.94, 1.15, 0.32, 0.95, 0.42)],
  bodies: [trunk(2.0, -1.6, 0.3, -0.45, 0.3, 0.6, 0, 2.4)],
};
A['bae-hawk'] = make(HAWK);
A['hawk-200'] = make({ ...HAWK, cls: 'attack', length: 11.38, top: [[5.69, -0.1], [5.3, 0.2], [4.6, 0.35], [3.4, 0.55], [1.8, 0.85], ...HAWK_REAR[0]], bottom: [[5.69, -0.4], [5.2, -0.6], [1.74, -0.78], ...HAWK_REAR[1]], plan: [[5.69, 0.15], [5.2, 0.42], [3.2, 0.5], [2.2, 0.52], [1.8, 0.9], [-1.4, 0.9], [-3.6, 0.55], [-5.5, 0.3]], glass: [bubble(3.4, 1.8, 1.08, 0.45, 0.85, 0.4)] });
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

// T-38 Talon: the needle nose, two seats in tandem under a canopy that runs on into a high spine, side intakes, a thin
// wing without LERX (14.13 x 7.7 x 3.92 m). Checked by eye against a public 3-view (estimates): belly to canopy top
// 1.55 m, to the spine behind it 1.35 m, 1.2 m deep at the wing, 0.45 m at the nozzles; 1.8 m wide over the 0.65 m
// tall intakes, 1 m at the cockpit; the fin's top 3 m over the belly. The F-5 family shares the body.
// The F-5 family's small half-round intakes behind the cockpit.
const TIGER_INTAKE = trunk(2.4, -1.8, 0.3, -0.38, 0.3, 0.6, 0, 2.4);
const TALON: Make = {
  cls: 'trainer', length: 14.13, span: 7.7, height: 3.92,
  top: [[7.065, -0.15], [6.2, -0.05], [4.87, 0.35], [2.6, 0.6], [0.96, 0.9], [-0.78, 0.78], [-2.95, 0.65], [-5.1, 0.43], [-6.9, 0.33]],
  bottom: [[7.065, -0.25], [6.2, -0.4], [4.87, -0.5], [1.4, -0.46], [-0.78, -0.41], [-2.95, -0.35], [-5.1, -0.22], [-6.9, -0.08]],
  plan: [[7.065, 0.03], [5.6, 0.35], [3.8, 0.48], [2.6, 0.5], [2.2, 0.89], [-3, 0.89], [-6.9, 0.6]], round: 2.8,
  wing: [[2.0, 0], [2.0, 0.9], [0.0, 3.85], [-0.6, 3.85], [-2.6, 0.9], [-2.6, 0]], wingUp: -0.3,
  fin: [[-2.2, 0], [-6.4, 0], [-7.0, 1.9], [-6.0, 1.9], [-3.6, 0.3]], finBase: 0.55,
  tail: [[-5.2, 0.7], [-6.0, 2.1], [-6.8, 2.1], [-6.8, 0.7]], planeUp: 0.05,
  engines: 2, nozzle: 0.45, nozzleUp: 0.12,
  glass: [tandem(4.87, 0.96, 1.0, 1.07, 0.35, 0.9, 0.4)],
  bodies: [TIGER_INTAKE],
};
A['t-38'] = make(TALON);
// F-5A / C / G: one seat, the T-38's body with small LERX and tip tanks (14.38 x 7.7 x 4.01 m).
A['f-5a'] = make({ ...TALON, cls: 'fighter', length: 14.38, wing: [[2.6, 0], [2.0, 0.8], [0.8, 0.95], [0.0, 3.85], [-0.6, 3.85], [-2.6, 0.95], [-2.6, 0]], glass: [bubble(4.87, 2.4, 1.04, 0.35, 0.8, 0.38)], bodies: [TIGER_INTAKE, pod(0.5, -2.6, 0.27, 3.9, -0.3)] });
// F-5E: the T-38's deeper body with its spine, the shark nose and bubble, the LERX'd wing (sizes and engines from
// ./aircraft.ts); F-5F: the two-seater, 1.2 m longer; F-20: one engine, the bigger LERX and wing.
const TIGER2 = AIRCRAFT.air!['f-5e'];
// The F-5E's body, wing, fin and tailplane digitised from the US Army's F-5 three-view (see sources.md) at the
// published length: the windscreen 4.2 m behind the nose and the canopy 2.9 m long, the intakes' lips 5.9 m behind the
// nose under the LERX, the wing's leading edge meeting the LERX 7.6 m back, its trailing edge straight across 10.3 m
// back, the tailplane from 12 to 13.5 m, the fin's flat top 2.5 m over the nose tip. Heights from the axis 0.18 m over
// the nose tip.
const F5_FUS: Outline = {
  top: [[7.22, -0.18], [6.42, -0.04], [5.62, 0.15], [4.82, 0.29], [4.02, 0.43], [3.22, 0.57], [2.0, 0.72], [0.2, 0.95], [-0.78, 0.89], [-1.98, 0.8], [-2.78, 0.71], [-3.58, 0.61], [-5.2, 0.45], [-7.0, 0.33]],
  bottom: [[7.22, -0.23], [6.42, -0.37], [5.62, -0.41], [4.42, -0.51], [3.22, -0.55], [-3.18, -0.6], [-4.78, -0.46], [-6.38, -0.37], [-7.0, -0.27]],
  plan: [[7.22, 0.03], [6.42, 0.35], [5.62, 0.45], [5.0, 0.49], [3.2, 0.53], [1.6, 0.54], [1.2, 0.62], [0.4, 0.72], [-3.6, 0.8], [-4.8, 0.85], [-6.4, 0.7], [-7.0, 0.55]],
  round: 2.8, stations: 22,
};
const F5_INTAKE = trunk(1.35, -2.6, 0.3, -0.45, 0.28, 0.6, 0, 2.4);
const F5_CANOPY = bubble(3.05, 0.2, 1.08, 0.57, 0.95, 0.38);
const F5_WING: P2[] = [[1.6, 0], [1.6, 0.55], [1.22, 0.73], [0.82, 1.1], [0.42, 1.34], [-0.38, 1.42], [-1.95, 4.06], [-2.95, 4.06], [-3.05, 0.9], [-3.05, 0]];
const stretch = (q: P2[]) => q.map(([x, v]) => [x > 0 ? x * 1.17 : x, v] as P2);
const TIGER_TAIL = {
  finPlan: [[-2.6, 0], [-3.7, 0.16], [-4.38, 0.91], [-5.18, 2.03], [-5.4, 2.07], [-6.05, 2.07], [-6.3, 0.6], [-6.6, 0.3], [-6.6, 0]] as P2[],
  tailPlan: [[-4.8, 0.85], [-5.95, 2.23], [-6.25, 2.23], [-6.25, 0.85]] as P2[],
};
// The Sidewinders on the wing-tip rails (2.87 m long, 0.127 m across, published), their noses well ahead of the tip.
const F5_TIP_AAM = pod(-0.1, -2.97, 0.064, 4.13, -0.31, 0.25);
A['f-5e'] = { ...TIGER2, fuselage: F5_FUS, wingPlan: F5_WING, ...TIGER_TAIL, bodies: [F5_INTAKE, F5_TIP_AAM], glass: [F5_CANOPY] };
// (Its length stays the F-5E's here: the nose is stretched ahead of the same tail, 15.65 m overall.)
A['f-5f'] = { ...TIGER2, fuselage: { ...F5_FUS, top: stretch(F5_FUS.top), bottom: stretch(F5_FUS.bottom), plan: stretch(F5_FUS.plan) }, wingPlan: F5_WING, ...TIGER_TAIL, bodies: [F5_INTAKE], glass: [tandem(3.57, -0.3, 1.04, 1.14, 0.62, 0.95, 0.38)] };
A['f-20'] = { ...TIGER2, length: 14.17, span: 8.53, fuselage: F5_FUS, wingPlan: [[4.4, 0], [2.8, 1.0], [0.9, 1.15], [-1.1, 4.26], [-1.9, 4.26], [-2.8, 1.15], [-2.9, 0]], engines: { kind: 'internal', count: 1, diameter: 1.0 }, bodies: [F5_INTAKE], glass: [F5_CANOPY] };

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
 * thinner 45-degree wing when `w45`. Checked by eye against a public 3-view (estimates): the body 1.55 m deep and
 * 1.4 m wide at most, the nose intake 1.1 m tall, belly to canopy top 1.8 m, to the fin's top 3.2 m.
 */
function fagot(L: number, w45: boolean): FixedWingSpec & { cls: string } {
  const k = L / 10.11;
  const r = (rows: Row[]): Row[] => rows.map(([x, a, b, c]) => [x * k, a, b, c]);
  const m = (q: P2[]) => q.map(([x, v]) => [x * k, v] as P2);
  const h = w45 ? 4.815 : 5.04;
  return fig({
    cls: 'fighter', length: L, span: 2 * h, height: w45 ? 3.8 : 3.7,
    body: r([[5.055, 0.52, -0.56, 0.5], [4.6, 0.62, -0.66, 0.6], [3.6, 0.72, -0.76, 0.67], [2.4, 0.76, -0.78, 0.7], [1.0, 0.75, -0.77, 0.69], [-0.5, 0.7, -0.68, 0.62], [-2.0, 0.6, -0.52, 0.5], [-3.5, 0.5, -0.38, 0.4], [-5.055, 0.4, -0.28, 0.32]]), round: 2,
    wing: w45 ? [[0.9, 0], [0.9, 0.75], [-3.5, h], [-4.4, h], [-2.9, 0.75], [-2.9, 0]] : [[0.9, 0], [0.9, 0.75], [-2.6, h], [-3.6, h], [-2.5, 0.75], [-2.5, 0]], wingUp: -0.05, dihedral: -2,
    fin: m([[-2.4, 0], [-4.7, 0], [-5.6, 1.92], [-4.5, 1.97]]), finBase: 0.5,
    tail: m([[-4.3, 0], [-4.95, 1.6], [-5.65, 1.6], [-5.75, 0]]), planeUp: 1.55,
    nozzles: [[-5.055 * k, 0, -0.05]], nozzle: 0.62,
    bodies: [post(-0.6 * k, -2.4 * k, 0.7, 0.3, 0.12, undefined)],
    glass: [bubble(2.9 * k, 1.2 * k, 1.03, 0.66, 0.74, 0.32)],
  });
}
A['mig-15bis'] = fagot(10.11, false);
A['mig-15bis-ish'] = { ...A['mig-15bis'], cls: 'attack', bodies: [...A['mig-15bis'].bodies!, pod(0.4, -1.6, 0.16, 2.8, 0.0)] };
A['mig-17'] = fagot(11.26, true);
// MiG-17PF: the search radar's bullet in the intake's splitter and the ranging radar's fairing over the lip (11.68 m).
A['mig-17pf'] = { ...fagot(11.68, true), bodies: [pod(6.3, 5.5, 0.2, 0, 0.05, 0.6), spine(5.85, 4.9, 0.6, 0.22, 0.26)] };
// MiG-19: twin engines side by side behind the nose intake, the 55-degree wing with big fences, twin nozzles
// (12.54 x 9.0 x 3.89 m). MiG-19P/PT/PM and J-6A: the radar cone in the intake. Checked by eye against a public
// 3-view (estimates): the nose intake 1.25 m tall, 1.75 m deep at most, 1.4 m wide, belly to canopy top 1.9 m, to the
// fin's top 3.2 m. The wing from the FM 44-80 three-view (scaled by span and length): the root from 2.2 m behind the
// nose, the leading edge swept 58 degrees, the trailing edge 45, a 1 m tip (about the published 25 m2).
const FARMER: Make = {
  cls: 'fighter', length: 12.54, span: 9.0, height: 3.89,
  top: [[6.27, 0.6], [5.4, 0.7], [3.8, 0.78], [3.0, 0.85], [0.6, 0.88], [-3, 0.72], [-6.2, 0.55]],
  bottom: [[6.27, -0.62], [5.2, -0.75], [0, -0.86], [-4, -0.74], [-6.2, -0.55]],
  plan: [[6.27, 0.6], [5.4, 0.66], [2, 0.71], [-4, 0.72], [-6.2, 0.65]], round: 2.3,
  wing: [[4.1, 0], [4.1, 0.7], [-2.11, 4.5], [-3.13, 4.5], [0.37, 0.7], [0.37, 0]],
  fin: [[-2.2, 0], [-5.6, 0], [-6.4, 1.8], [-5.3, 1.85]], finBase: 0.6,
  tail: [[-4.4, 0.5], [-5.4, 2.3], [-6.4, 2.3], [-6.5, 0.5]], planeUp: 0.1,
  engines: 2, nozzle: 0.65,
  glass: [bubble(3.6, 2.0, 1.2, 0.85, 0.85, 0.34)],
};
A['mig-19s'] = make(FARMER);
A['mig-19p'] = make({ ...FARMER, bodies: [pod(6.75, 5.8, 0.26, 0, 0.0, 0.6)] });
// MiG-9: two engines side by side with their exhausts under the belly, the split nose intake, a straight wing, the
// tailplane on the fin (9.75 x 10.0 x 3.22 m).
A['mig-9'] = make({
  cls: 'fighter', length: 9.75, span: 10.0, height: 3.22,
  top: [[4.875, 0.45], [4.0, 0.6], [2.4, 0.65], [1.2, 0.85], [-0.6, 0.75], [-2.4, 0.5], [-4.8, 0.35]],
  bottom: [[4.875, -0.45], [3.8, -0.65], [0.6, -0.7], [0.0, -0.4], [-1.6, -0.1], [-4.8, 0.0]],
  plan: [[4.875, 0.5], [4.0, 0.62], [0.8, 0.65], [-0.6, 0.45], [-2.4, 0.28], [-4.8, 0.15]],
  wing: [[1.4, 0], [1.4, 0.65], [0.6, 5.0], [-0.6, 5.0], [-1.2, 0.65], [-1.2, 0]], thick: 0.1,
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
  wing: [[1.6, 0], [1.6, 0.6], [1.0, 4.6], [-0.2, 4.6], [-0.8, 0.6], [-0.8, 0]], wingUp: -0.2, thick: 0.1,
  fin: [[-3.0, 0], [-4.3, 0], [-4.6, 1.4], [-3.8, 1.45]], finBase: 0.3,
  tail: [[-3.2, 0.1], [-3.4, 1.6], [-4.1, 1.6], [-4.2, 0.1]], planeUp: 0.3,
  engines: 0,
  glass: [bubble(1.8, 0.4, 1.0, 0.65, 0.55, 0.3)],
  bodies: [pod(0.1, -0.5, 0.28, 0, -0.45, 0.05)],
};
// The Yak-15 itself digitised from FM 30-30's Yak-15 silhouettes (1951, see sources.md) at the published length (the
// drawn wing scaled to the published span): the blunt nose intake, the body stepping up behind the exhaust 4 m behind
// the nose into the boom, the canopy's crown 1.26 m over the intake's middle, the wing's root from 2.2 m ahead of the
// middle to 0.4 m behind it, its trailing edge swept forward to the tips, the fin's flat top 2.1 m up.
A['yak-15'] = make({
  ...FEATHER, length: 8.78,
  top: [[4.39, 0.23], [4.14, 0.4], [3.89, 0.56], [3.39, 0.65], [2.89, 0.78], [2.39, 0.86], [1.89, 0.92], [1.39, 0.95], [0.3, 0.98], [-0.61, 1.07], [-1.36, 1.06], [-2.11, 1.03], [-2.61, 1.0], [-3.86, 1.0], [-4.39, 0.98]],
  bottom: [[4.39, -0.2], [4.14, -0.36], [3.89, -0.41], [3.39, -0.45], [2.89, -0.48], [1.89, -0.51], [0.89, -0.48], [0.45, -0.45], [0.3, 0.08], [-0.61, 0.11], [-1.36, 0.13], [-2.11, 0.2], [-2.61, 0.27], [-3.86, 0.49], [-4.39, 0.86]],
  plan: [[4.39, 0.2], [4.14, 0.38], [3.89, 0.42], [3.39, 0.44], [0.45, 0.44], [-0.61, 0.42], [-1.36, 0.35], [-2.11, 0.31], [-2.61, 0.27], [-3.86, 0.18], [-4.39, 0.08]],
  wing: [[2.2, 0], [2.2, 0.5], [1.89, 1.4], [1.64, 2.83], [1.39, 4.1], [1.14, 4.57], [0.89, 4.6], [0.64, 4.5], [0.39, 3.98], [0.14, 2.88], [-0.11, 1.62], [-0.36, 0.6], [-0.4, 0]], wingUp: 0.15,
  fin: [[-2.61, 0], [-3.36, 1.11], [-3.61, 1.1], [-3.86, 0.96], [-4.11, 0.68], [-4.36, 0.16], [-4.4, -0.1], [-2.61, -0.1]], finBase: 1.0,
  tail: [[-3.25, 0.25], [-3.61, 1.5], [-3.86, 1.78], [-4.11, 1.7], [-4.38, 0.6], [-4.38, 0.25]], planeUp: 0.72,
  glass: [bubble(1.5, 0.1, 1.26, 0.95, 1.05, 0.3)],
  bodies: [pod(0.9, 0.3, 0.27, 0, -0.2, 0.05)],
});
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
  wing: [[1.4, 0], [1.4, 0.6], [0.6, 5.6], [-0.5, 5.6], [-1.6, 0.6], [-1.6, 0]], thick: 0.1,
  fin: [[-3.6, 0], [-5.2, 0], [-5.5, 1.6], [-4.7, 1.65]], finBase: 0.4,
  tail: [[-3.8, 0.1], [-4.1, 2.1], [-4.9, 2.1], [-5.1, 0.1]], planeUp: 0.6,
  engines: 0,
  glass: [bubble(2.6, 1.0, 1.1, 0.62, 0.62, 0.32)],
  bodies: [pod(2.4, -1.6, 0.4, 2.0, -0.5, 0.25)],
});

// Il-28: the glazed nose, the pilot's bubble above, two big nacelles slung under a straight wing, the tail gunner's
// turret, a swept fin and tailplane (17.65 x 21.45 x 6.7 m). Il-28Sh: pylons out along the wing. Tu-14T: the same
// layout stretched, the nacelles further out (21.95 x 21.69 x 5.69 m). Checked by eye against a public 3-view of
// the Il-28 (estimates): 1.7 m deep at the wing, 1.15 m 4.7 m behind the middle, 1.6 m wide, belly to the pilot's canopy
// top 2 m; the nacelles 1.55 m across, level with the body's axis, 3 m out; the fin's top 4.15 m over the belly.
const BEAGLE: Make = {
  cls: 'bomber', length: 17.65, span: 21.45, height: 6.7,
  top: [[8.825, -0.1], [8.3, 0.5], [6.8, 0.84], [5.2, 0.73], [2.2, 0.73], [-1.25, 0.73], [-3.55, 0.66], [-5.85, 0.61], [-8.825, 0.45]],
  bottom: [[8.825, -0.3], [8.0, -0.7], [6.8, -0.81], [5.2, -0.95], [2.2, -1.0], [-1.25, -0.95], [-3.55, -0.65], [-5.85, -0.31], [-8.825, -0.15]],
  plan: [[8.825, 0.25], [8.0, 0.65], [6.0, 0.8], [-2, 0.8], [-6, 0.55], [-8.825, 0.3]], round: 2.4,
  wing: [[1.6, 0], [1.6, 0.85], [0.2, 10.7], [-1.0, 10.7], [-1.8, 0.85], [-1.8, 0]], wingUp: 0.45, thick: 0.1,
  fin: [[-5.0, 0], [-8.0, 0], [-9.0, 2.55], [-7.8, 2.6]], finBase: 0.6,
  tail: [[-6.6, 0.3], [-8.0, 3.6], [-9.2, 3.6], [-9.4, 0.3]], planeUp: 1.15,
  engines: 0,
  glass: [bubble(5.4, 3.8, 1.07, 0.73, 0.73, 0.42), pod(9.0, 7.4, 0.55, 0, -0.2, 0.5)],
  bodies: [pod(4.6, -2.6, 0.77, 3.0, -0.05, 0.2), pod(-8.4, -9.4, 0.36, 0, 0.1, 0.3)],
};
A['il-28'] = make(BEAGLE);
A['il-28sh'] = make({ ...BEAGLE, cls: 'attack', bodies: [...BEAGLE.bodies!, pod(0.6, -1.4, 0.14, 5.6, -0.45), pod(0.4, -1.6, 0.14, 7.6, -0.4)] });
A['tu-14'] = make({ ...BEAGLE, length: 21.95, span: 21.69, height: 5.69, top: BEAGLE.top.map(([x, v]) => [x * 1.244, v] as P2), bottom: BEAGLE.bottom.map(([x, v]) => [x * 1.244, v] as P2), plan: BEAGLE.plan.map(([x, v]) => [x * 1.244, v] as P2), fin: BEAGLE.fin.map(([x, v]) => [x * 1.244, v] as P2), tail: BEAGLE.tail!.map(([x, v]) => [x * 1.244, v] as P2), glass: [bubble(6.4, 4.6, 1.35, 0.85, 0.9, 0.42), pod(11.2, 9.4, 0.55, 0, -0.25, 0.5)], bodies: [pod(4.4, -2.4, 0.62, 3.6, -0.5, 0.2), pod(-10.4, -11.4, 0.36, 0, -0.25, 0.3)] });

// F-86F Sabre: a slimmer body than the MiG's, the oval nose intake, the bubble set further back, a low 35-degree wing
// with dihedral, the tailplane with 10 degrees of dihedral low on the fin's root over the jet pipe (11.44 x 11.31 x
// 4.5 m). F-86D / K: the radome over a chin intake (12.27 m). FJ-4 Fury: a deeper body, the spine running to the fin,
// a thinner, broader wing (11.08 x 11.92 x 4.24 m).
// Body, fin and tailplane digitised from FM 30-30's F-86 Sabre silhouettes (1952, see sources.md) at the published
// length; the wing's edges from the dimensioned F-86A three-view of its erection manual (root chord 10.3 ft on the
// centre line, tip chord 5.3 ft, 35 degrees): its leading edge meets the body 2.75 m behind the nose, its trailing edge
// 5.7 m; the wing low, its root 0.72 m under the lip (the front views). Heights from the intake's upper lip: the spine 0.56 m over it, the belly 0.9 m under it, the canopy's crown
// 1.0 m; the jet pipe ends 0.6 m ahead of the tailplane's and the rudder's trailing edges.
const SABRE_REAR: Row[] = [
  [3.1, 0.49, -0.9, 0.63], [2.33, 0.52, -0.91, 0.63], [1.49, 0.54, -0.9, 0.63], [0.64, 0.56, -0.88, 0.63], [-0.21, 0.56, -0.83, 0.62], [-1.05, 0.54, -0.78, 0.58],
  [-1.9, 0.59, -0.73, 0.53], [-2.75, 0.61, -0.66, 0.46], [-3.6, 0.6, -0.58, 0.37], [-4.2, 0.57, -0.49, 0.31], [-4.6, 0.53, -0.15, 0.29], [-4.85, 0.5, 0.03, 0.28],
];
const SABRE: Fig = {
  cls: 'fighter', length: 11.44, span: 11.31, height: 4.5,
  body: [[5.72, 0.03, -0.03, 0.07], [5.58, 0.12, -0.24, 0.26], [5.48, 0.17, -0.74, 0.34], [5.2, 0.27, -0.8, 0.4], [4.77, 0.39, -0.84, 0.48], [4.33, 0.46, -0.86, 0.53], [3.6, 0.48, -0.88, 0.6], ...SABRE_REAR], round: 2.1,
  wing: [[2.97, 0], [2.97, 0.69], [-0.35, 5.45], [-0.6, 5.655], [-1.95, 5.655], [-2.05, 5.5], [0.02, 0.69], [0.02, 0]], wingUp: -0.72, dihedral: 3,
  fin: [[-3.0, 0], [-3.13, 0.11], [-3.26, 0.25], [-4.04, 1.09], [-4.75, 1.83], [-4.95, 1.9], [-5.34, 1.9], [-5.61, 1.85], [-5.42, 1.38], [-5.12, 0.62], [-4.82, -0.1], [-3.0, -0.1]], finBase: 0.6,
  tail: [[-3.75, 0], [-3.75, 0.35], [-5.1, 1.95], [-5.72, 1.92], [-4.9, 0.3], [-4.9, 0]], planeUp: 0.42, planeDihedral: 10,
  nozzles: [[-4.85, 0, 0.27]], nozzle: 0.5,
  glass: [bubble(4.33, 1.67, 1.0, 0.46, 0.54, 0.36)],
};
A['f-86f'] = fig(SABRE);
// F-86K: the F-86D's body - the radome over its chin intake, a deeper and wider fuselage than the F's, the long
// canopy fairing back into the spine, the afterburner's nozzle out behind the fin, a bigger flat tailplane (12.27 x
// 11.31 x 4.57 m). Drawn from the dimensioned F-86D three-view of T.O. 1F-86D-3 (see sources.md) at the published
// length, heights over the drawing's fuselage reference line (the radome's tip 0.12 m up): the wing's leading edge
// meets the centre line 3.44 m behind the nose, its root chord 10.3 ft; the drawing's span is 3% over the published
// 37.1 ft, so the wing's stations are pulled in to it. The tailplane as drawn in plan (4.5 m; the sheet's figure says
// 16.6 ft, its front view about 11.5 ft).
A['f-86k'] = fig({
  ...SABRE, length: 12.27, height: 4.57,
  body: [
    [6.135, 0.17, 0.06, 0.05], [5.97, 0.35, -0.09, 0.21], [5.67, 0.49, -0.19, 0.33], [5.28, 0.6, -0.26, 0.44], [5.05, 0.64, -0.62, 0.48], [4.88, 0.69, -0.7, 0.51],
    [4.49, 0.75, -0.75, 0.57], [4.09, 0.8, -0.79, 0.63], [3.6, 0.78, -0.81, 0.68], [3.1, 0.75, -0.83, 0.73], [2.11, 0.75, -0.83, 0.77], [1.13, 0.85, -0.82, 0.77],
    [0.4, 0.91, -0.82, 0.77], [-0.5, 0.91, -0.8, 0.77], [-1.34, 0.91, -0.74, 0.76], [-2.33, 0.91, -0.65, 0.72], [-3.32, 0.9, -0.55, 0.66], [-4.01, 0.9, -0.48, 0.61],
    [-4.6, 0.9, -0.35, 0.54], [-5.3, 0.88, -0.1, 0.45], [-5.65, 0.86, 0.0, 0.32],
  ],
  wing: [[2.12, 0], [2.12, 0.75], [-1.43, 5.37], [-1.68, 5.56], [-1.82, 5.655], [-3.0, 5.655], [-3.12, 5.37], [-0.81, 0.75], [-0.81, 0]], wingUp: -0.66,
  fin: [
    [-2.2, 0], [-2.43, 0.09], [-2.83, 0.19], [-3.22, 0.3], [-3.62, 0.4], [-4.01, 0.54], [-4.31, 0.78], [-5.69, 2.26], [-5.79, 2.31], [-6.28, 2.33],
    [-5.99, 1.28], [-5.69, 0.29], [-5.6, -0.1], [-2.2, -0.1],
  ], finBase: 0.9,
  tail: [[-4.0, 0], [-4.0, 0.36], [-5.33, 2.17], [-5.44, 2.25], [-5.8, 2.25], [-5.98, 2.17], [-5.18, 0.33], [-5.18, 0]], planeUp: 0.92, planeDihedral: 0,
  nozzles: [[-5.7, 0, 0.4]], nozzle: 0.7,
  glass: [{
    top: [[0.75, 0.91], [1.13, 1.08], [1.52, 1.23], [1.92, 1.33], [2.3, 1.4], [2.7, 1.38], [2.9, 1.32], [3.3, 1.14], [3.69, 0.93], [3.95, 0.8]],
    bottom: [[0.75, 0.6], [3.95, 0.5]],
    plan: [[0.75, 0.15], [1.5, 0.38], [2.4, 0.45], [3.3, 0.38], [3.95, 0.15]],
    round: 2.2,
    stations: 14,
  }],
});
A['fj-4'] = fig({
  ...SABRE, length: 11.08, span: 11.92, height: 4.24,
  body: [[5.54, 0.4, -0.38, 0.42], [5.0, 0.62, -0.6, 0.58], [3.8, 0.78, -0.75, 0.68], [2.4, 0.84, -0.8, 0.72], [0.8, 0.86, -0.8, 0.74], [-1.2, 0.82, -0.72, 0.7], [-3.2, 0.68, -0.48, 0.56], [-5.54, 0.48, -0.2, 0.38]],
  wing: [[1.0, 0], [1.0, 0.74], [-2.4, 5.96], [-3.3, 5.96], [-2.9, 0.74], [-2.9, 0]],
  planeUp: 0.6,
  nozzles: [[-5.54, 0, 0.12]],
  bodies: [spine(1.4, -4.6, 0.84, 0.2, 0.3)],
  glass: [bubble(3.2, 1.6, 1.25, 0.8, 0.84, 0.36)],
});
// F-100 Super Sabre: the oval nose intake with its upper lip forward, a 45-degree wing, a tall fin, the low tailplane
// (14.36 x 11.81 x 4.95 m). F-100F: the two-seater, 0.9 m longer. The wing swept 45 degrees at its quarter chord
// with the published 35.8 m2 (root chord 4.9 m, tip 1.2 m; where the root sits is an estimate).
const HUN: Make = {
  cls: 'fighter', length: 14.36, span: 11.81, height: 4.95,
  top: [[7.18, 0.35], [6.4, 0.55], [4.8, 0.7], [3.8, 0.85], [1.0, 0.85], [-3, 0.7], [-7.1, 0.5]],
  bottom: [[7.0, -0.5], [6.4, -0.62], [2, -0.75], [-3, -0.7], [-7.1, -0.5]],
  plan: [[7.18, 0.5], [6.4, 0.62], [2, 0.75], [-3, 0.72], [-7.1, 0.55]], round: 2.3,
  wing: [[1.4, 0], [1.4, 0.75], [-4.56, 5.9], [-5.76, 5.9], [-3.03, 0.75], [-3.03, 0]], wingUp: -0.2,
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
  wing: [[1.6, 0], [1.6, 1.2], [0.8, 6.9], [-0.4, 6.9], [-1.6, 1.2], [-1.6, 0]], thick: 0.1, dihedral: 3,
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
