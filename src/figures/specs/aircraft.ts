/**
 * Aircraft drawn from their outlines: the fuselage from its side profile and
 * plan, engine nacelles and intakes as bodies of their own, and wings,
 * tailplanes and fins from their true planforms - LERX and strakes, cranked
 * leading edges, dogtooth notches, raked tips, canards - so a type is known
 * by its silhouette from the side, the top and the front.
 *
 * Length, span and height are published values. The outlines are judged from
 * the general shape of the real aircraft (estimates, not traced from any
 * drawing or model). Coordinates: forward from the aircraft's middle, out from
 * the centre line, up from the fuselage axis; metres.
 */

import type { Named, SpecSet } from './index';
import type { FixedWingSpec } from '../air';
import type { P2 } from '../parts';
import { bubble, tandem } from './jet-variants';

const A: Named<FixedWingSpec> = {};

// ---------------------------------------------------------------- more jets
// F-5E Tiger II: a long sharp nose, small LERX, a thin 24-degree wing with tip rails (14.45 x 8.13 x 4.08 m).
A['f-5e'] = {
  cls: 'fighter', length: 14.45, span: 8.13, height: 4.08, bodyWidth: 1.6, bodyHeight: 1.3,
  fuselage: { top: [[7.22, -0.05], [5.6, 0.25], [4, 0.42], [3, 0.72], [1, 0.62], [-4, 0.5], [-7, 0.4]], bottom: [[7.22, -0.08], [5.6, -0.3], [3, -0.5], [-3, -0.55], [-7, -0.35]], plan: [[7.22, 0.03], [5.6, 0.4], [4, 0.55], [2.8, 0.62], [2.2, 1.0], [-3, 0.95], [-7.0, 0.65]], round: 2.8, stations: 22 },
  wing: { x: -1.0, span: 8.13, rootChord: 3.9, tipChord: 0.8, sweep: 32, mount: -0.6 },
  wingPlan: [[3.8, 0], [2.6, 0.9], [0.9, 1.1], [-1.1, 4.06], [-1.9, 4.06], [-2.8, 1.1], [-2.9, 0]],
  tail: { kind: 'single', finHeight: 2.2, finChord: 3.0, tailSpan: 4.2, tailChord: 1.3, finBase: 0.45 },
  finPlan: [[-1.8, 0], [-6.6, 0], [-7.2, 2.2], [-6.1, 2.2], [-3.4, 0.3]],
  tailPlan: [[-5.4, 0.7], [-6.2, 2.1], [-7.0, 2.1], [-7.0, 0.7]],
  engines: { kind: 'internal', count: 2, diameter: 0.6 },
  canopy: { x: 3.3, length: 2.2, kind: 'bubble' },
};
// A-10 Thunderbolt II: a straight thick low wing, two big engine pods high on the rear fuselage, the H tail at the end (16.26 x 17.53 x 4.47 m).
A['a-10c'] = {
  cls: 'attack', length: 16.26, span: 17.53, height: 4.47, bodyWidth: 1.7, bodyHeight: 2.0,
  fuselage: { top: [[8.13, 0.1], [6.5, 0.6], [4.6, 1.0], [2.2, 1.05], [-4, 0.75], [-8, 0.55]], bottom: [[8.13, -0.25], [6.5, -0.8], [0, -0.95], [-5, -0.55], [-8, 0.1]], plan: [[8.13, 0.2], [6.5, 0.65], [3.5, 0.85], [-2, 0.8], [-8.0, 0.45]], round: 4, stations: 20 },
  bodies: [{ top: [[-2.0, 1.85], [-6.3, 1.75]], bottom: [[-2.0, 0.65], [-6.3, 0.75]], plan: [[-2.0, 0.62], [-4.0, 0.65], [-6.3, 0.45]], side: 1.3, round: 2.2, stations: 10 }],
  wing: { x: -0.1, span: 17.53, rootChord: 3.0, tipChord: 1.8, sweep: 0, mount: -0.8 },
  wingPlan: [[1.4, 0], [1.4, 2.5], [1.2, 8.76], [-0.6, 8.76], [-1.6, 2.5], [-1.6, 0]],
  tail: { kind: 'h', finHeight: 2.4, finChord: 1.9, spacing: 5.8, tailSpan: 5.8, tailChord: 1.6, planeUp: 0.6 },
  finPlan: [[-6.2, 0], [-8.1, 0], [-8.2, 2.4], [-6.8, 2.4]],
  tailPlan: [[-6.3, 0], [-6.6, 2.9], [-7.9, 2.9], [-7.9, 0]],
  canopy: { x: 4.5, length: 2.2, kind: 'bubble' },
};
// Su-25: a shoulder wing, the long engine nacelles along the fuselage sides, one fin, a pointed nose (15.53 x 14.36 x 4.8 m).
A['su-25t'] = {
  cls: 'attack', length: 15.53, span: 14.36, height: 4.8, bodyWidth: 2.6, bodyHeight: 1.6,
  fuselage: { top: [[7.76, -0.05], [6.4, 0.35], [4.5, 0.6], [3.6, 0.95], [1.5, 0.85], [-4, 0.6], [-7.6, 0.4]], bottom: [[7.76, -0.1], [6.4, -0.4], [3.6, -0.65], [-3, -0.65], [-7.6, -0.3]], plan: [[7.76, 0.03], [6.4, 0.4], [4.5, 0.6], [3.4, 0.7], [-3, 0.7], [-7.6, 0.45]], round: 3, stations: 20 },
  bodies: [{ top: [[2.6, 0.35], [-5.0, 0.35]], bottom: [[2.6, -0.7], [-5, -0.6]], plan: [[2.6, 0.45], [-3, 0.5], [-5, 0.35]], side: 1.05, round: [[2.6, 6], [-5, 2.4]], stations: 10 }],
  wing: { x: -0.5, span: 14.36, rootChord: 4.2, tipChord: 1.3, sweep: 20, mount: 0.8 },
  wingPlan: [[1.6, 0], [1.6, 1.5], [-0.4, 7.18], [-1.7, 7.18], [-2.6, 1.5], [-2.6, 0]],
  tail: { kind: 'single', finHeight: 2.6, finChord: 3.4, tailSpan: 4.6, tailChord: 1.6, finBase: 0.55, planeUp: 0.4 },
  finPlan: [[-3.8, 0], [-7.2, 0], [-7.6, 2.6], [-6.4, 2.6]],
  tailPlan: [[-5.6, 0.4], [-6.4, 2.3], [-7.4, 2.3], [-7.4, 0.4]],
  canopy: { x: 3.9, length: 2.0, kind: 'framed' },
};
// MiG-15bis: a short fat body with the nose intake, a 35-degree wing with anhedral, the tailplane halfway up the swept fin (10.11 x 10.08 x 3.7 m); MiG-17 the 45-degree wing.
A['mig-15bis'] = {
  cls: 'fighter', length: 10.11, span: 10.08, height: 3.7, bodyWidth: 1.45, bodyHeight: 1.5,
  fuselage: { top: [[5.05, 0.4], [3.6, 0.72], [2.4, 0.95], [0, 0.8], [-3, 0.6], [-5, 0.45]], bottom: [[5.05, -0.45], [3.5, -0.75], [0, -0.75], [-3, -0.55], [-5, -0.3]], plan: [[5.05, 0.5], [4, 0.68], [1.5, 0.72], [-2, 0.6], [-5.0, 0.4]], round: 2.1, stations: 18 },
  wing: { x: -0.8, span: 10.08, rootChord: 3.4, tipChord: 1.2, sweep: 37, mount: 0.3, dihedral: -2 },
  wingPlan: [[0.9, 0], [0.9, 0.7], [-2.6, 5.04], [-3.6, 5.04], [-2.5, 0.7], [-2.5, 0]],
  tail: { kind: 'single', finHeight: 2.4, finChord: 3.2, tailSpan: 3.2, tailChord: 1.1, finBase: 0.5, planeUp: 1.9 },
  finPlan: [[-1.4, 0], [-4.6, 0], [-5.6, 2.4], [-4.4, 2.4]],
  tailPlan: [[-4.6, 0], [-5.2, 1.6], [-5.9, 1.6], [-5.9, 0]],
  engines: { kind: 'internal', count: 1, diameter: 0.9 },
  canopy: { x: 2.0, length: 1.8, kind: 'bubble' },
};
A['mig-17'] = { ...A['mig-15bis'], length: 11.26, span: 9.63, height: 3.8, wingPlan: [[0.9, 0], [0.9, 0.7], [-3.4, 4.8], [-4.3, 4.8], [-2.9, 0.7], [-2.9, 0]] };
// F-86 Sabre: slender, the nose intake, a low 35-degree wing, the tailplane low on the fuselage (11.4 x 11.3 x 4.5 m).
A['f-86f'] = {
  cls: 'fighter', length: 11.4, span: 11.3, height: 4.5, bodyWidth: 1.45, bodyHeight: 1.5,
  fuselage: { top: [[5.7, 0.45], [4.4, 0.7], [2.6, 0.95], [1, 0.8], [-3, 0.6], [-5.6, 0.45]], bottom: [[5.7, -0.45], [4.4, -0.72], [0, -0.78], [-3, -0.6], [-5.6, -0.35]], plan: [[5.7, 0.5], [4.6, 0.68], [2, 0.72], [-2, 0.6], [-5.6, 0.4]], round: 2.1, stations: 18 },
  wing: { x: -0.8, span: 11.3, rootChord: 4.0, tipChord: 1.2, sweep: 37, mount: -0.6, dihedral: 3 },
  wingPlan: [[1.2, 0], [1.2, 0.7], [-2.3, 5.65], [-3.5, 5.65], [-2.8, 0.7], [-2.8, 0]],
  tail: { kind: 'single', finHeight: 2.3, finChord: 3.4, tailSpan: 3.9, tailChord: 1.2, finBase: 0.5, planeUp: 0.2 },
  finPlan: [[-2.0, 0], [-5.4, 0], [-6.0, 2.3], [-4.8, 2.3]],
  tailPlan: [[-4.2, 0], [-5.2, 1.95], [-6.0, 1.95], [-6.0, 0]],
  engines: { kind: 'internal', count: 1, diameter: 0.9 },
  canopy: { x: 2.4, length: 1.9, kind: 'bubble' },
};

// ---------------------------------------------------------------- twins and bombers

// P-38 Lightning: a short central nacelle, two booms carrying the engines and the oval fins, the tailplane between them (11.53 x 15.85 x 3.0 m).
A['p-38j'] = {
  cls: 'ww2-heavy-fighter', length: 11.53, span: 15.85, height: 3.0, bodyWidth: 1.3, bodyHeight: 1.3,
  fuselage: { top: [[5.1, 0], [4.4, 0.45], [2.6, 0.65], [1.8, 0.95], [0, 0.7], [-1.8, 0.2]], bottom: [[5.1, 0], [4.4, -0.45], [1, -0.6], [-1.8, -0.2]], plan: [[5.1, 0.05], [4.4, 0.5], [2.5, 0.65], [-0.5, 0.55], [-1.8, 0.1]], round: 2.2, stations: 14 },
  bodies: [{ top: [[3.7, 0], [3.4, 0.55], [0, 0.6], [-2.0, 0.6], [-5.6, 0.3]], bottom: [[3.7, 0], [3.4, -0.55], [0, -0.75], [-2, -0.5], [-5.6, -0.2]], plan: [[3.7, 0.08], [3.4, 0.55], [0, 0.6], [-2, 0.4], [-5.6, 0.28]], side: 2.4, round: 2.2, stations: 16 }],
  wing: { x: 0.1, span: 15.85, rootChord: 3.0, tipChord: 1.2, sweep: 2, mount: 0 },
  wingPlan: [[1.6, 0], [1.6, 3.0], [0.8, 7.92], [-0.4, 7.92], [-1.4, 3.0], [-1.4, 0]],
  tail: { kind: 'twin', finHeight: 1.4, finChord: 1.2, spacing: 4.8, tailSpan: 5.2, tailChord: 1.0, finBase: 0 },
  finPlan: [[-4.6, -0.9], [-5.8, -0.9], [-5.8, 1.4], [-4.8, 1.4]],
  tailPlan: [[-4.6, 0], [-4.6, 2.6], [-5.6, 2.6], [-5.6, 0]],
  engines: { kind: 'wing-props', count: 2, diameter: 1.0, at: [0.303], length: 0.6 },
  propeller: { diameter: 3.5, blades: 3 },
  canopy: { x: 1.8, length: 1.8, kind: 'bubble' },
};
// B-17G: four radials, the glazed nose and chin turret, a tapered wing, the great dorsal fin fillet (22.66 x 31.62 x 5.82 m).
A['b-17g'] = {
  cls: 'ww2-heavy-bomber', length: 22.66, span: 31.62, height: 5.82, bodyWidth: 2.3, bodyHeight: 2.6,
  fuselage: { top: [[11.33, 0.0], [10, 0.6], [7, 1.1], [5.5, 1.45], [2, 1.35], [-4, 1.15], [-9, 0.8], [-11.3, 0.4]], bottom: [[11.33, -0.4], [10, -0.95], [4, -1.25], [-4, -1.1], [-9, -0.5], [-11.3, -0.1]], plan: [[11.33, 0.3], [10, 0.85], [6, 1.15], [-2, 1.1], [-8, 0.7], [-11.3, 0.25]], round: 2.2, stations: 22 },
  wing: { x: 1.0, span: 31.62, rootChord: 7.4, tipChord: 2.0, sweep: 6, mount: -0.2, dihedral: 4 },
  wingPlan: [[4.6, 0], [4.6, 1.2], [1.0, 15.8], [-1.0, 15.8], [-2.8, 1.2], [-2.8, 0]],
  tail: { kind: 'single', finHeight: 4.4, finChord: 9.0, tailSpan: 13.2, tailChord: 3.0, finBase: 1.0, planeUp: 0.6 },
  finPlan: [[-2.0, 0], [-11.0, 0], [-11.4, 3.9], [-9.6, 4.4], [-7.0, 1.4]],
  tailPlan: [[-8.2, 0], [-8.6, 3.0], [-9.8, 6.6], [-11.1, 6.6], [-11.4, 0]],
  engines: { kind: 'wing-props', count: 4, diameter: 1.35, at: [0.24, 0.48] },
  propeller: { diameter: 3.5, blades: 3 },
  canopy: { x: 10.0, length: 2.2, kind: 'glass-nose' },
};
// Avro Lancaster: a deep fuselage with a big canopy and turrets, a long straight wing, four inline engines, twin oval fins on the tailplane tips (21.18 x 31.09 x 6.25 m).
A['lancaster'] = {
  cls: 'ww2-heavy-bomber', length: 21.18, span: 31.09, height: 6.25, bodyWidth: 2.0, bodyHeight: 2.7,
  fuselage: { top: [[10.6, 0.2], [9.2, 0.8], [6.5, 1.2], [5.5, 1.65], [3.5, 1.4], [-6, 1.2], [-10.6, 0.7]], bottom: [[10.6, -0.5], [9.2, -1.1], [6, -1.35], [-4, -1.3], [-9, -0.7], [-10.6, -0.2]], plan: [[10.6, 0.5], [9.4, 0.9], [6, 1.0], [-4, 1.0], [-9, 0.7], [-10.6, 0.4]], round: 3, stations: 22 },
  wing: { x: 0.1, span: 31.09, rootChord: 5.4, tipChord: 1.5, sweep: 3, mount: 0.2, dihedral: 4 },
  wingPlan: [[2.8, 0], [2.8, 4.0], [2.4, 8.5], [0.9, 15.55], [-0.6, 15.55], [-1.8, 8.5], [-2.6, 4.0], [-2.6, 0]],
  tail: { kind: 'h', finHeight: 3.4, finChord: 2.0, spacing: 6.6, tailSpan: 6.6, tailChord: 2.0, planeUp: 0.5 },
  finPlan: [[-8.2, -1.0], [-9.8, -1.2], [-10.2, 0], [-10.0, 2.0], [-8.8, 2.4], [-8.0, 1.6]],
  tailPlan: [[-7.8, 0], [-8.0, 3.3], [-9.8, 3.3], [-9.9, 0]],
  engines: { kind: 'wing-props', count: 4, diameter: 1.3, at: [0.24, 0.46] },
  propeller: { diameter: 4.0, blades: 3 },
  canopy: { x: 6.0, length: 2.4, kind: 'framed' },
};

// ---------------------------------------------------------------- piston aircraft from proportions

/** A wing's half planform from its family: elliptic (Spitfire), tapered (straight edges), round-tipped, square-tipped. */
export function wingOf(kind: 'elliptic' | 'tapered' | 'round' | 'square', le: number, root: number, tip: number, half: number, sweep = 2, rootY = 0): P2[] {
  const sw = Math.tan((sweep * Math.PI) / 180);
  if (kind === 'elliptic') {
    // A straight quarter-chord line, the chord falling off as an ellipse.
    const q = le - 0.25 * root;
    const ts = [0, 0.3, 0.55, 0.75, 0.88, 0.96, 1];
    const c = (t: number) => Math.max(root * 0.12, root * Math.sqrt(1 - t * t));
    const y = (t: number) => rootY + (half - rootY) * t;
    return [...ts.map((t) => [q + 0.25 * c(t), y(t)] as P2), ...ts.slice(0, -1).reverse().map((t) => [q - 0.75 * c(t), y(t)] as P2)];
  }
  // Sweep is of the quarter-chord line; the taper splits a quarter ahead of it, three quarters behind.
  const tipLe = le - (half - rootY) * sw - 0.25 * (root - tip);
  const pts: P2[] = [[le, rootY], [tipLe, half - (kind === 'round' ? tip * 0.35 : 0)]];
  if (kind === 'round') pts.push([tipLe - tip * 0.2, half - tip * 0.08], [tipLe - tip * 0.55, half], [tipLe - tip * 0.85, half - tip * 0.1]);
  else pts.push([tipLe - tip, half]);
  pts.push([le - root, rootY]);
  return pts;
}

export interface Piston {
  cls: string;
  length: number;
  span: number;
  height: number;
  /** Fuselage half-width and half-height at its widest. */
  w: number;
  h: number;
  radial?: boolean;
  wing: 'elliptic' | 'tapered' | 'round' | 'square';
  /** Wing root leading edge's forward position (from the middle), root and tip chords, leading-edge sweep. */
  le: number;
  root: number;
  tip: number;
  sweep?: number;
  mount?: number;
  dihedral?: number;
  gull?: boolean;
  /** Fin height above the fuselage top and its root chord; tailplane span and root chord. */
  fin: number;
  finRoot: number;
  tailSpan: number;
  tailRoot: number;
  /** A rounded fin top (Spitfire, P-47) or a straight, swept one (P-51, Zero). */
  roundFin?: boolean;
  canopy: { x: number; length: number; kind: 'bubble' | 'framed' | 'tandem' | 'glass-nose' };
  prop: number;
  blades: number;
  /** A belly radiator scoop (P-51) or bulge (Il-2): forward position, length, depth. */
  scoop?: [number, number, number];
  gear?: boolean;
}

export function piston(p: Piston): FixedWingSpec & { cls: string } {
  const L = p.length;
  const n = L / 2;
  const t = -L / 2;
  const cowl = p.radial ? 0.95 : 0.6;
  // The belly runs level under the wing, then sweeps up to the tail.
  const te = p.le - p.root;
  const bottom: P2[] = [[n, 0], [n - 0.35, -p.h * cowl], [n - L * 0.3, -p.h], [te, -p.h], [t + L * 0.22, -p.h * 0.42], [t + 0.3, -p.h * 0.1], [t, 0.05]];
  if (p.scoop) {
    const [sx, sl, sd] = p.scoop;
    bottom.splice(3, 0, [sx + sl / 2, -p.h], [sx, -p.h - sd], [sx - sl / 2, -p.h - sd * 0.7]);
  }
  const fins: P2[] = p.roundFin
    ? [[t + p.finRoot, 0], [t + 0.05, 0], [t + 0.02, p.fin * 0.7], [t + p.finRoot * 0.12, p.fin * 0.95], [t + p.finRoot * 0.35, p.fin], [t + p.finRoot * 0.6, p.fin * 0.88], [t + p.finRoot * 0.85, p.fin * 0.45]]
    : [[t + p.finRoot, 0], [t + 0.05, 0], [t - 0.1, p.fin], [t + p.finRoot * 0.45, p.fin]];
  const tp = p.tailRoot;
  return {
    cls: p.cls,
    length: L,
    span: p.span,
    height: p.height,
    bodyWidth: p.w * 2,
    bodyHeight: p.h * 2,
    fuselage: {
      // The decking falls away behind the cockpit to a thin tail.
      top: [[n, 0], [n - 0.35, p.h * cowl], [n - L * 0.22, p.h], [p.canopy.x - p.canopy.length * 0.45, p.h * 0.95], [t + L * 0.2, p.h * 0.6], [t + 0.3, p.h * 0.45], [t, p.h * 0.38]],
      bottom,
      plan: [[n, 0.08], [n - 0.35, p.w * cowl], [n - L * 0.25, p.w], [p.canopy.x - p.canopy.length * 0.5, p.w * 0.95], [t + L * 0.25, p.w * 0.45], [t + 0.4, p.w * 0.2], [t, 0.06]],
      round: 2.3,
      stations: 20,
    },
    wing: { x: p.le - p.root / 2, span: p.span, rootChord: p.root, tipChord: p.tip, sweep: p.sweep ?? 2, mount: p.mount ?? -0.8, dihedral: p.dihedral ?? 6, gull: p.gull },
    wingPlan: wingOf(p.wing, p.le, p.root, p.tip, p.span / 2, p.sweep ?? 2),
    tail: { kind: 'single', finHeight: p.fin, finChord: p.finRoot, tailSpan: p.tailSpan, tailChord: tp, finBase: p.h * 0.45, planeUp: p.h * 0.3 },
    finPlan: fins,
    tailPlan: [[t + tp, 0], [t + tp * 0.95, p.tailSpan * 0.3], [t + tp * 0.6, p.tailSpan / 2], [t + tp * 0.15, p.tailSpan * 0.47], [t, p.tailSpan * 0.3], [t, 0]],
    engines: { kind: 'nose-prop', count: 1 },
    propeller: { diameter: p.prop, blades: p.blades },
    canopy: p.canopy,
    fixedGear: p.gear,
  };
}

// Bf 109 E: the square-tipped wing.
A['bf-109-e'] = piston({ cls: 'ww2-fighter', length: 8.64, span: 9.87, height: 2.5, w: 0.48, h: 0.6, wing: 'square', le: 1.3, root: 2.15, tip: 1.2, sweep: 3, fin: 1.2, finRoot: 1.25, roundFin: true, tailSpan: 3.0, tailRoot: 0.9, canopy: { x: 0.5, length: 1.6, kind: 'framed' }, prop: 3.0, blades: 3 });
// Fw 190 A: the big round radial cowl, a straight-tapered wing, a bulged bubble hood (9.0 x 10.5 x 3.95 m).
A['fw-190-a8'] = piston({ cls: 'ww2-fighter', length: 9.0, span: 10.5, height: 3.95, w: 0.62, h: 0.68, radial: true, wing: 'tapered', le: 1.6, root: 2.3, tip: 1.05, sweep: 5, fin: 1.25, finRoot: 1.3, roundFin: true, tailSpan: 3.65, tailRoot: 0.95, canopy: { x: 0.1, length: 1.8, kind: 'bubble' }, prop: 3.3, blades: 3 });
// Fw 190 D-9: the long annular-cowled inline nose and a stretched tail (10.19 m).
A['fw-190-d9'] = piston({ cls: 'ww2-fighter', length: 10.19, span: 10.5, height: 3.36, w: 0.6, h: 0.66, radial: true, wing: 'tapered', le: 1.3, root: 2.3, tip: 1.05, sweep: 5, fin: 1.35, finRoot: 1.5, roundFin: true, tailSpan: 3.65, tailRoot: 0.95, canopy: { x: -0.2, length: 1.8, kind: 'bubble' }, prop: 3.5, blades: 3 });
// A6M Zero: a slim radial fighter, a long canopy, a wide round-tipped wing (9.06 x 12.0 x 3.05 m).
A['a6m-zero'] = piston({ cls: 'ww2-fighter', length: 9.06, span: 12.0, height: 3.05, w: 0.55, h: 0.6, radial: true, wing: 'round', le: 1.6, root: 2.5, tip: 1.1, sweep: 4, fin: 1.2, finRoot: 1.5, tailSpan: 4.8, tailRoot: 1.1, canopy: { x: -0.1, length: 2.4, kind: 'framed' }, prop: 2.9, blades: 3 });
// F4U Corsair: the inverted gull wing, a very long nose with the cockpit far back (10.2 x 12.5 x 4.5 m).
A['f4u-corsair'] = piston({ cls: 'ww2-fighter', length: 10.2, span: 12.5, height: 4.5, w: 0.65, h: 0.75, radial: true, wing: 'round', le: 1.5, root: 2.7, tip: 1.3, sweep: 3, gull: true, mount: -0.9, dihedral: 9, fin: 1.6, finRoot: 1.6, roundFin: true, tailSpan: 5.1, tailRoot: 1.2, canopy: { x: -1.2, length: 1.8, kind: 'bubble' }, prop: 4.0, blades: 3 });
// Il-2: an armoured nose, a long two-seat canopy, a tapered wing with swept outer leading edges (11.6 x 14.6 x 4.2 m).
A['il-2'] = piston({ cls: 'ww2-attack', length: 11.6, span: 14.6, height: 4.2, w: 0.65, h: 0.8, wing: 'tapered', le: 1.8, root: 3.2, tip: 1.2, sweep: 12, fin: 1.4, finRoot: 1.7, roundFin: true, tailSpan: 4.6, tailRoot: 1.3, canopy: { x: 0.1, length: 2.8, kind: 'framed' }, prop: 3.6, blades: 3, scoop: [0.5, 1.6, 0.25] });
// Ju 87 Stuka: the inverted gull wing, the fixed spatted gear, the long greenhouse, a square fin (11.5 x 13.8 x 3.88 m).
A['ju-87-stuka'] = piston({ cls: 'ww2-attack', length: 11.5, span: 13.8, height: 3.88, w: 0.6, h: 0.8, wing: 'square', le: 2.0, root: 2.8, tip: 1.3, sweep: 3, gull: true, mount: -0.9, dihedral: 8, fin: 1.6, finRoot: 1.8, tailSpan: 4.8, tailRoot: 1.2, canopy: { x: 0.6, length: 3.2, kind: 'framed' }, prop: 3.4, blades: 3, gear: true, scoop: [3.4, 1.2, 0.3] });
A['ju-87-d'] = { ...A['ju-87-stuka'] };

// ---------------------------------------------------------------- more jets and props from proportions (War Thunder families)

export interface Jet {
  cls: string;
  length: number;
  span: number;
  height: number;
  /** Fuselage half-width and half-height. */
  w: number;
  h: number;
  /** nose: a round nose intake; side: intakes beside the cockpit; chin: under it; root: in the wing roots. */
  intake: 'nose' | 'side' | 'chin' | 'root';
  /** The wing's half planform. */
  wingPlan: P2[];
  mount?: number;
  dihedral?: number;
  /** Fin outline (forward, up from its root) and the tailplane's half planform; none for a tailless delta. */
  fin: P2[];
  tail?: P2[];
  /** The tailplane high on the fin (T-tail) or at this height. */
  planeUp?: number;
  engines?: number;
  canopy: { x: number; length: number; kind: 'bubble' | 'framed' | 'tandem' };
  /** Tip tanks or pods: their length and radius. */
  tipTanks?: [number, number];
}

export function jet(p: Jet): FixedWingSpec & { cls: string } {
  const n = p.length / 2;
  const t = -n;
  const nose = p.intake === 'nose';
  const wide = p.intake === 'side' || p.intake === 'root' ? 1.45 : 1;
  const ix = n - p.length * 0.28;
  const plan: P2[] = nose
    ? [[n, p.w * 0.8], [n - p.length * 0.1, p.w], [t + p.length * 0.3, p.w * 0.85], [t, p.w * 0.6]]
    : [[n, 0.04], [n - p.length * 0.1, p.w * 0.6], [ix + 0.6, p.w * 0.85], [ix, p.w * wide], [t + p.length * 0.3, p.w * wide * 0.85], [t, p.w * 0.6]];
  const bottom: P2[] = p.intake === 'chin' ? [[n, -p.h * 0.15], [n - p.length * 0.1, -p.h * 0.6], [ix + 0.5, -p.h * 0.7], [ix, -p.h * 1.35], [t + p.length * 0.3, -p.h * 1.1], [t, -p.h * 0.6]] : [[n, nose ? -p.h * 0.8 : -p.h * 0.15], [n - p.length * 0.12, -p.h], [t + p.length * 0.3, -p.h * 0.9], [t, -p.h * 0.55]];
  const fh = Math.max(...p.fin.map((q) => q[1]));
  const bodies = p.tipTanks ? [{ top: [[0.8, p.tipTanks[1]], [0.8 - p.tipTanks[0], p.tipTanks[1]]] as P2[], bottom: [[0.8, -p.tipTanks[1]], [0.8 - p.tipTanks[0], -p.tipTanks[1]]] as P2[], plan: [[1.0, 0.02], [0.6, p.tipTanks[1]], [0.8 - p.tipTanks[0] + 0.4, p.tipTanks[1]], [0.8 - p.tipTanks[0], 0.02]] as P2[], side: Math.max(...p.wingPlan.map((q) => q[1])), round: 2, stations: 8 }] : undefined;
  return {
    cls: p.cls,
    length: p.length,
    span: p.span,
    height: p.height,
    bodyWidth: p.w * 2 * wide,
    bodyHeight: p.h * 2,
    fuselage: { top: [[n, nose ? p.h * 0.8 : -p.h * 0.1], [n - p.length * 0.12, p.h * 0.7], [p.canopy.x - p.canopy.length / 2, p.h], [t + p.length * 0.3, p.h * 0.85], [t, p.h * 0.6]], bottom, plan, round: 2.4, stations: 22 },
    bodies,
    wing: { x: 0, span: p.span, rootChord: 3, tipChord: 1, sweep: 30, mount: p.mount ?? 0, dihedral: p.dihedral ?? 0 },
    wingPlan: p.wingPlan,
    tail: { kind: p.planeUp !== undefined && p.planeUp >= fh * 0.9 ? 't' : 'single', finHeight: fh, finChord: 3, tailSpan: p.tail ? 2 * Math.max(...p.tail.map((q) => q[1])) : 0, tailChord: 1.5, finBase: p.h * 0.75, planeUp: p.planeUp ?? 0 },
    finPlan: p.fin,
    tailPlan: p.tail,
    engines: { kind: 'internal', count: p.engines ?? 1, diameter: p.h * 1.1 },
    canopy: p.canopy,
    // The canopy's glass standing on the decking: one bubble, or two seats with the rear one raised.
    glass: [p.canopy.kind === 'tandem' ? tandem(p.canopy.x + p.canopy.length / 2, p.canopy.x - p.canopy.length / 2, p.h + 0.42, p.h + 0.5, p.h * 0.85, p.h * 0.98, p.w * 0.62) : bubble(p.canopy.x + p.canopy.length / 2, p.canopy.x - p.canopy.length / 2, p.h + (p.canopy.kind === 'framed' ? 0.34 : 0.44), p.h * 0.85, p.h * 0.98, p.w * 0.62)],
  };
}

// F-104 Starfighter: a long needle, side intakes, a tiny straight trapezoid wing with anhedral and tip tanks, the T-tail (16.66 x 6.36 x 4.09 m).
A['f-104'] = jet({ cls: 'fighter', length: 16.66, span: 6.36, height: 4.09, w: 0.6, h: 0.65, intake: 'side', wingPlan: [[0.8, 0], [0.8, 0.6], [-0.4, 3.18], [-1.3, 3.18], [-2.0, 0.6], [-2.0, 0]], mount: -0.3, dihedral: -10, fin: [[-4.0, 0], [-7.6, 0], [-8.1, 2.4], [-6.4, 2.4]], tail: [[-6.6, 0], [-7.2, 1.7], [-8.0, 1.7], [-8.0, 0]], planeUp: 2.4, canopy: { x: 3.4, length: 2.2, kind: 'framed' }, tipTanks: [3.0, 0.3] });
// F-84F Thunderstreak: a swept wing on a round body with the nose intake (13.23 x 10.24 x 4.39 m); F-84G straight wing with tip tanks (11.6 x 11.1 m).
A['f-84f'] = jet({ cls: 'fighter', length: 13.23, span: 10.24, height: 4.39, w: 0.7, h: 0.75, intake: 'nose', wingPlan: [[1.2, 0], [1.2, 0.7], [-2.2, 5.12], [-3.4, 5.12], [-2.9, 0.7], [-2.9, 0]], mount: -0.3, fin: [[-2.8, 0], [-6.3, 0], [-6.9, 2.6], [-5.6, 2.6]], tail: [[-4.8, 0], [-5.6, 2.1], [-6.5, 2.1], [-6.5, 0]], planeUp: 0.2, canopy: { x: 2.8, length: 2.0, kind: 'bubble' } });
A['f-84g'] = jet({ cls: 'fighter', length: 11.6, span: 11.1, height: 3.84, w: 0.7, h: 0.75, intake: 'nose', wingPlan: [[1.2, 0], [1.2, 0.7], [0.6, 5.55], [-0.6, 5.55], [-1.6, 0.7], [-1.6, 0]], mount: -0.4, fin: [[-2.6, 0], [-5.5, 0], [-6.0, 2.2], [-4.9, 2.2]], tail: [[-4.4, 0], [-4.8, 1.9], [-5.8, 1.9], [-5.8, 0]], planeUp: 0.2, canopy: { x: 2.6, length: 2.0, kind: 'bubble' }, tipTanks: [3.0, 0.32] });
// F-8 Crusader: a chin intake under a long nose, a shoulder wing, a big fin (16.53 x 10.87 x 4.8 m).
A['f-8e'] = jet({ cls: 'fighter', length: 16.53, span: 10.87, height: 4.8, w: 0.75, h: 0.8, intake: 'chin', wingPlan: [[1.4, 0], [1.4, 0.8], [-2.0, 4.0], [-1.7, 4.05], [-3.1, 5.43], [-4.0, 5.43], [-3.9, 0.8], [-3.9, 0]], mount: 1, dihedral: -5, fin: [[-2.8, 0], [-7.4, 0], [-8.0, 2.8], [-6.6, 2.8]], tail: [[-6.0, 0], [-6.8, 2.6], [-7.8, 2.6], [-8.0, 0]], planeUp: 0, canopy: { x: 3.4, length: 2.2, kind: 'bubble' } });
// SEPECAT Jaguar: a long slim body, side intakes, a shoulder wing with anhedral, the slab tailplanes with anhedral (16.83 x 8.69 x 4.89 m).
A['jaguar'] = jet({ cls: 'attack', length: 16.83, span: 8.69, height: 4.89, w: 0.75, h: 0.75, intake: 'side', wingPlan: [[0.4, 0], [0.4, 0.9], [-2.6, 4.35], [-3.4, 4.35], [-3.6, 0.9], [-3.6, 0]], mount: 1, dihedral: -3, fin: [[-3.4, 0], [-7.4, 0], [-8.2, 2.8], [-6.8, 2.8]], tail: [[-6.4, 0.6], [-7.4, 2.4], [-8.4, 2.4], [-8.4, 0.6]], engines: 2, canopy: { x: 4.4, length: 2.2, kind: 'bubble' } });
// Hawker Hunter: wing-root intakes, a 40-degree wing, the tailplane partway up the fin (13.98 x 10.26 x 4.01 m).
A['hunter'] = jet({ cls: 'fighter', length: 13.98, span: 10.26, height: 4.01, w: 0.7, h: 0.75, intake: 'root', wingPlan: [[1.2, 0], [1.2, 0.8], [-2.6, 5.13], [-3.6, 5.13], [-3.4, 0.8], [-3.4, 0]], mount: 0, fin: [[-3.0, 0], [-6.4, 0], [-7.0, 2.3], [-5.8, 2.3]], tail: [[-5.4, 0], [-6.2, 1.9], [-7.0, 1.9], [-7.0, 0]], planeUp: 1.0, canopy: { x: 3.4, length: 1.8, kind: 'bubble' } });
// Gloster Meteor: two engine nacelles in a straight wing, a cruciform tail (13.59 x 11.32 x 3.96 m).
A['meteor'] = { ...jet({ cls: 'fighter', length: 13.59, span: 11.32, height: 3.96, w: 0.65, h: 0.75, intake: 'nose', wingPlan: [[1.4, 0], [1.4, 1.8], [0.8, 5.66], [-0.4, 5.66], [-1.6, 1.8], [-1.6, 0]], mount: 0, fin: [[-4.6, 0], [-6.6, 0], [-6.8, 2.3], [-5.8, 2.3]], tail: [[-5.0, 0], [-5.4, 2.4], [-6.3, 2.4], [-6.4, 0]], planeUp: 1.0, canopy: { x: 3.2, length: 1.8, kind: 'bubble' } }), bodies: [{ top: [[2.6, 0.5], [-2.2, 0.45]], bottom: [[2.6, -0.5], [-2.2, -0.45]], plan: [[2.6, 0.45], [1.8, 0.55], [-1.6, 0.5], [-2.2, 0.3]], side: 1.8, round: 2.2, stations: 10 }] };
// de Havilland Vampire / Venom: a short pod with twin booms to the tail (9.37 x 11.58 x 2.69 m).
A['vampire'] = { ...jet({ cls: 'fighter', length: 9.37, span: 11.58, height: 2.69, w: 0.65, h: 0.75, intake: 'root', wingPlan: [[1.4, 0], [1.4, 1.5], [0.6, 5.79], [-0.4, 5.79], [-1.4, 1.5], [-1.4, 0]], mount: 0, fin: [[-3.4, -0.3], [-4.6, -0.3], [-4.7, 1.4], [-4.0, 1.5]], tail: [[-3.8, 0], [-3.8, 1.5], [-4.6, 1.5], [-4.6, 0]], planeUp: 0.6, canopy: { x: 2.2, length: 1.4, kind: 'bubble' } }), fuselage: { top: [[3.4, -0.1], [2.6, 0.6], [1.6, 0.85], [-1.0, 0.7], [-2.0, 0.3]], bottom: [[3.4, -0.2], [2.6, -0.6], [-1.0, -0.7], [-2.0, -0.3]], plan: [[3.4, 0.05], [2.6, 0.5], [0.5, 0.7], [-2.0, 0.35]], round: 2.4, stations: 14 }, bodies: [{ top: [[-0.8, 0.15], [-4.7, 0.12]], bottom: [[-0.8, -0.15], [-4.7, -0.12]], plan: [[-0.8, 0.15], [-4.7, 0.12]], side: 1.5, round: 2, stations: 6 }], tail: { kind: 'twin', finHeight: 1.5, finChord: 1.2, spacing: 3.0, tailSpan: 3.0, tailChord: 0.8, finBase: 0, planeUp: 0.6 } };
// Blackburn Buccaneer: a long area-ruled body, a mid wing, the T-tail (19.33 x 13.41 x 4.97 m).
A['buccaneer'] = jet({ cls: 'attack', length: 19.33, span: 13.41, height: 4.97, w: 0.85, h: 0.85, intake: 'root', wingPlan: [[1.4, 0], [1.4, 1.2], [-1.8, 6.7], [-3.0, 6.7], [-3.4, 1.2], [-3.4, 0]], mount: 0, fin: [[-5.0, 0], [-8.8, 0], [-9.6, 3.0], [-8.0, 3.0]], tail: [[-8.0, 0], [-8.6, 2.2], [-9.6, 2.2], [-9.6, 0]], planeUp: 3.0, engines: 2, canopy: { x: 4.8, length: 2.6, kind: 'tandem' } });
// English Electric Canberra: a straight broad wing with two nacelles, a slim body (19.96 x 19.51 x 4.77 m).
A['canberra'] = { ...jet({ cls: 'bomber', length: 19.96, span: 19.51, height: 4.77, w: 1.0, h: 1.0, intake: 'nose', wingPlan: [[2.0, 0], [2.0, 2.4], [0.6, 9.75], [-0.6, 9.75], [-3.0, 2.4], [-3.0, 0]], mount: 0, fin: [[-6.6, 0], [-9.4, 0], [-9.8, 3.2], [-8.4, 3.2]], tail: [[-7.6, 0], [-8.2, 4.2], [-9.6, 4.2], [-9.8, 0]], planeUp: 0.3, canopy: { x: 6.6, length: 2.0, kind: 'bubble' } }), bodies: [{ top: [[2.8, 0.7], [-3.6, 0.6]], bottom: [[2.8, -0.7], [-3.6, -0.6]], plan: [[2.8, 0.65], [2.0, 0.8], [-3.0, 0.7], [-3.6, 0.45]], side: 3.0, round: 2.2, stations: 10 }] };
// Fiat G.91: a small swept fighter with the nose intake (10.3 x 8.56 x 4.0 m).
// The Meteor's and Canberra's noses are pointed: their intakes are in the engine nacelles, not the nose.
for (const [n, tip] of [['meteor', 6.795], ['canberra', 9.98]] as const) {
  const f = A[n].fuselage!;
  A[n] = { ...A[n], fuselage: { ...f, top: [[tip, 0.02], ...f.top.slice(1)], bottom: [[tip, -0.12], ...f.bottom.slice(1)], plan: [[tip, 0.06], ...f.plan.slice(1)] } };
}
A['g-91'] = jet({ cls: 'attack', length: 10.3, span: 8.56, height: 4.0, w: 0.6, h: 0.7, intake: 'nose', wingPlan: [[0.8, 0], [0.8, 0.6], [-2.0, 4.28], [-2.8, 4.28], [-2.6, 0.6], [-2.6, 0]], mount: -0.4, fin: [[-2.2, 0], [-4.8, 0], [-5.3, 2.0], [-4.3, 2.0]], tail: [[-3.8, 0], [-4.4, 1.6], [-5.1, 1.6], [-5.1, 0]], planeUp: 0.5, canopy: { x: 2.0, length: 1.6, kind: 'bubble' } });
// Saab J35 Draken: the double delta (15.35 x 9.42 x 3.89 m); J29 Tunnan: a barrel body with the nose intake and a swept wing (10.23 x 11.0 x 3.75 m); J32 Lansen (14.94 x 13.0 x 4.65 m).
A['j35-draken'] = jet({ cls: 'fighter', length: 15.35, span: 9.42, height: 3.89, w: 0.75, h: 0.75, intake: 'root', wingPlan: [[4.6, 0], [4.6, 0.8], [-1.0, 2.6], [-4.8, 4.71], [-5.8, 4.71], [-6.6, 0.8], [-6.6, 0]], fin: [[-2.6, 0], [-7.2, 0], [-7.6, 2.6], [-6.4, 2.6]], canopy: { x: 3.4, length: 2.0, kind: 'bubble' } });
A['j29-tunnan'] = jet({ cls: 'fighter', length: 10.23, span: 11.0, height: 3.75, w: 0.85, h: 0.9, intake: 'nose', wingPlan: [[1.6, 0], [1.6, 0.9], [-1.6, 5.5], [-2.6, 5.5], [-2.0, 0.9], [-2.0, 0]], mount: 0, fin: [[-2.0, 0], [-4.6, 0], [-5.2, 2.0], [-4.2, 2.0]], tail: [[-3.8, 0], [-4.4, 1.7], [-5.1, 1.7], [-5.1, 0]], planeUp: 0.2, canopy: { x: 2.2, length: 1.6, kind: 'bubble' } });
A['j32-lansen'] = jet({ cls: 'attack', length: 14.94, span: 13.0, height: 4.65, w: 0.8, h: 0.85, intake: 'side', wingPlan: [[1.2, 0], [1.2, 0.9], [-2.4, 6.5], [-3.6, 6.5], [-3.4, 0.9], [-3.4, 0]], mount: -0.6, fin: [[-3.0, 0], [-6.9, 0], [-7.5, 2.6], [-6.2, 2.6]], tail: [[-5.6, 0], [-6.4, 2.4], [-7.4, 2.4], [-7.4, 0]], planeUp: 0.6, canopy: { x: 3.4, length: 2.8, kind: 'tandem' } });
// Dassault Mystère IV / Super Mystère: a swept wing, nose intake (Super Mystère 14.13 x 10.52 x 4.6 m).
A['mystere'] = jet({ cls: 'fighter', length: 14.13, span: 10.52, height: 4.6, w: 0.7, h: 0.75, intake: 'nose', wingPlan: [[1.2, 0], [1.2, 0.7], [-2.8, 5.26], [-3.8, 5.26], [-3.2, 0.7], [-3.2, 0]], mount: 0, fin: [[-3.2, 0], [-6.6, 0], [-7.2, 2.6], [-6.0, 2.6]], tail: [[-5.4, 0], [-6.2, 1.9], [-7.0, 1.9], [-7.0, 0]], planeUp: 1.0, canopy: { x: 2.8, length: 2.0, kind: 'bubble' } });
// Super Étendard: a swept mid wing, side intakes (14.31 x 9.6 x 3.86 m).
A['etendard'] = jet({ cls: 'attack', length: 14.31, span: 9.6, height: 3.86, w: 0.7, h: 0.75, intake: 'side', wingPlan: [[1.0, 0], [1.0, 0.8], [-2.4, 4.8], [-3.3, 4.8], [-3.2, 0.8], [-3.2, 0]], mount: 0, fin: [[-3.2, 0], [-6.6, 0], [-7.2, 2.2], [-6.0, 2.2]], tail: [[-5.4, 0], [-6.2, 2.0], [-7.1, 2.0], [-7.1, 0]], planeUp: 0.6, canopy: { x: 3.0, length: 2.0, kind: 'bubble' } });

// Grumman F4F Wildcat: a barrel radial fighter, mid wing with square tips (8.76 x 11.58 x 3.61 m); F8F Bearcat smaller with a bubble (8.61 x 10.92 x 4.21 m).
A['f4f-wildcat'] = piston({ cls: 'ww2-fighter', length: 8.76, span: 11.58, height: 3.61, w: 0.65, h: 0.75, radial: true, wing: 'square', le: 1.3, root: 2.4, tip: 1.3, sweep: 2, mount: 0, fin: 1.4, finRoot: 1.5, roundFin: true, tailSpan: 4.4, tailRoot: 1.1, canopy: { x: 0.6, length: 1.6, kind: 'framed' }, prop: 3.0, blades: 3 });
A['f8f-bearcat'] = piston({ cls: 'ww2-fighter', length: 8.61, span: 10.92, height: 4.21, w: 0.65, h: 0.75, radial: true, wing: 'square', le: 1.4, root: 2.5, tip: 1.3, sweep: 2, fin: 1.7, finRoot: 1.6, tailSpan: 4.6, tailRoot: 1.1, canopy: { x: 0.2, length: 1.6, kind: 'bubble' }, prop: 3.8, blades: 4 });
// TBF Avenger: a deep barrel fuselage, a long greenhouse with the ball turret (12.48 x 16.51 x 4.7 m); SB2C Helldiver (11.18 x 15.16 x 4.0 m).
A['tbf-avenger'] = piston({ cls: 'ww2-attack', length: 12.48, span: 16.51, height: 4.7, w: 0.75, h: 1.0, radial: true, wing: 'tapered', le: 1.8, root: 3.2, tip: 1.3, sweep: 3, mount: -0.4, fin: 2.0, finRoot: 2.0, tailSpan: 6.4, tailRoot: 1.6, canopy: { x: 0.6, length: 4.0, kind: 'framed' }, prop: 4.0, blades: 3 });
A['sb2c-helldiver'] = piston({ cls: 'ww2-attack', length: 11.18, span: 15.16, height: 4.0, w: 0.7, h: 0.9, radial: true, wing: 'tapered', le: 1.6, root: 3.2, tip: 1.3, sweep: 3, fin: 2.0, finRoot: 2.0, tailSpan: 6.0, tailRoot: 1.4, canopy: { x: 0.4, length: 3.6, kind: 'framed' }, prop: 3.8, blades: 3 });
// Dewoitine D.520 (8.76 x 10.18 x 2.57 m) and Morane-Saulnier MS.406 (8.17 x 10.62 x 2.71 m).
A['d-520'] = piston({ cls: 'ww2-fighter', length: 8.76, span: 10.18, height: 2.57, w: 0.48, h: 0.6, wing: 'round', le: 1.2, root: 2.3, tip: 1.0, sweep: 3, fin: 1.3, finRoot: 1.3, roundFin: true, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.4, length: 1.6, kind: 'framed' }, prop: 3.0, blades: 3 });
A['ms-406'] = piston({ cls: 'ww2-fighter', length: 8.17, span: 10.62, height: 2.71, w: 0.5, h: 0.62, wing: 'round', le: 1.2, root: 2.4, tip: 1.1, sweep: 4, fin: 1.3, finRoot: 1.3, roundFin: true, tailSpan: 3.6, tailRoot: 0.9, canopy: { x: 0.0, length: 2.0, kind: 'framed' }, prop: 3.0, blades: 3 });
// Fiat G.55 / Macchi C.200 / Reggiane Re.2001 class Italian fighters share the MC.202 look; P-36 / Hawk 75 a radial with a long canopy (8.69 x 11.38 x 2.82 m).
A['p-36'] = piston({ cls: 'ww2-fighter', length: 8.69, span: 11.38, height: 2.82, w: 0.6, h: 0.7, radial: true, wing: 'round', le: 1.4, root: 2.6, tip: 1.2, sweep: 3, fin: 1.4, finRoot: 1.4, roundFin: true, tailSpan: 4.0, tailRoot: 1.0, canopy: { x: 0.0, length: 2.0, kind: 'framed' }, prop: 3.0, blades: 3 });
// He 162 Volksjäger: the jet on the back of a small body, twin fins (9.05 x 7.2 x 2.6 m).
A['he-162'] = { ...jet({ cls: 'jet-fighter', length: 9.05, span: 7.2, height: 2.6, w: 0.55, h: 0.6, intake: 'chin', wingPlan: [[0.8, 0], [0.8, 0.6], [0.0, 3.6], [-1.0, 3.6], [-1.4, 0.6], [-1.4, 0]], mount: 1, fin: [[-3.6, -0.4], [-4.4, -0.4], [-4.5, 1.0], [-3.8, 1.0]], tail: [[-3.4, 0], [-3.6, 1.2], [-4.4, 1.2], [-4.5, 0]], planeUp: 0.6, canopy: { x: 2.0, length: 1.4, kind: 'bubble' } }), bodies: [{ top: [[0.8, 1.2], [-3.0, 1.1]], bottom: [[0.8, 0.5], [-3.0, 0.6]], plan: [[0.8, 0.35], [-2.4, 0.38], [-3.0, 0.25]], round: 2.2, stations: 8 }], tail: { kind: 'twin', finHeight: 1.0, finChord: 0.8, spacing: 2.4, tailSpan: 2.4, tailChord: 0.8, finBase: 0, planeUp: 0.6 } };

export const AIRCRAFT: SpecSet = { air: A };
