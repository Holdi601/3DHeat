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
import { cowlLip, hood, type Body, type FixedWingSpec } from '../air';
import { lerpPoly, type Outline, type P2 } from '../parts';
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

// ---------------------------------------------------------------- twins and bombers

// P-38 Lightning: a short central nacelle, two booms carrying the engines and the oval fins, the tailplane between them (11.53 x 15.85 x 3.0 m).
// The wing's planform outboard of the booms, the booms' places, widths and heights, the central nacelle's profile and
// plan, the canopy's run and the fins' outline measured on FM 30-30 (1943), sheet "P-38 Lightning", with
// tools/figures/twinview.py; the centre section's trailing edge runs on the outer panels' line (the drawing's plan
// view closes the gap between the booms), the booms' depth behind the wing is judged from its side view.
A['p-38j'] = {
  cls: 'ww2-heavy-fighter', length: 11.53, span: 15.85, height: 3.0, bodyWidth: 1.0, bodyHeight: 1.8,
  fuselage: { top: [[5.765, 0.03], [5.34, 0.39], [4.91, 0.53], [4.48, 0.62], [4.06, 0.67], [3.63, 0.69], [3.2, 0.69], [2.78, 0.95], [2.35, 1.1], [1.92, 1.08], [1.5, 0.96], [1.07, 0.8], [0.64, 0.72], [0, 0.65], [-1.0, 0.45], [-1.8, 0.22]], bottom: [[5.765, -0.06], [5.34, -0.35], [4.91, -0.49], [4.48, -0.57], [4.06, -0.62], [3.63, -0.65], [3.2, -0.67], [2.35, -0.67], [1.92, -0.64], [1.5, -0.5], [1.07, -0.46], [0.64, -0.4], [0, -0.3], [-1.0, -0.1], [-1.8, 0.12]], plan: [[5.765, 0.04], [5.34, 0.24], [4.91, 0.35], [4.48, 0.41], [4.06, 0.45], [3.63, 0.48], [3.2, 0.5], [2.35, 0.5], [1.5, 0.45], [0.64, 0.38], [0, 0.3], [-1.0, 0.18], [-1.8, 0.03]], round: 2.2, stations: 18 },
  bodies: [{ top: [[4.86, 0.18], [4.46, 0.55], [4.06, 0.68], [3.26, 0.76], [0.85, 0.76], [-1.56, 0.62], [-3.96, 0.5], [-5.57, 0.42]], bottom: [[4.86, 0.18], [4.46, -0.2], [4.06, -0.32], [3.26, -0.4], [0.85, -0.4], [-1.56, -0.12], [-3.96, -0.02], [-5.57, 0.0]], plan: [[4.86, 0.05], [4.46, 0.25], [4.06, 0.33], [3.26, 0.42], [0.85, 0.42], [-1.56, 0.37], [-3.96, 0.34], [-5.57, 0.31]], side: 2.34, round: 2.2, stations: 18 }],
  wing: { x: 1.1, span: 15.85, rootChord: 3.0, tipChord: 1.2, sweep: 2, mount: 0 },
  wingPlan: [[2.59, 0], [2.59, 1.62], [2.47, 3.06], [2.33, 4.09], [2.2, 5.28], [2.09, 6.57], [1.96, 7.65], [1.75, 7.92], [1.49, 7.92], [1.19, 7.65], [0.81, 6.57], [0.59, 5.28], [0.4, 4.09], [0.25, 3.25], [-0.43, 0]],
  tail: { kind: 'twin', finHeight: 2.0, finChord: 1.38, spacing: 4.68, tailSpan: 5.2, tailChord: 1.2, finBase: 0 },
  finPlan: [[-4.38, -0.08], [-4.52, 1.44], [-4.68, 1.76], [-4.95, 2.0], [-5.2, 2.0], [-5.43, 1.8], [-5.63, 1.4], [-5.76, 0.74], [-5.72, 0.42], [-5.6, 0.21], [-5.27, -0.03], [-4.6, 0.1]],
  tailPlan: [[-4.4, 0], [-4.4, 2.5], [-5.6, 2.5], [-5.6, 0]],
  engines: { kind: 'wing-props', count: 2, diameter: 1.0, at: [0.295], length: 0.6 },
  propeller: { diameter: 3.5, blades: 3 },
  canopy: { x: 2.47, length: 1.42, kind: 'bubble' },
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
// The wings' thickness at the root as a share of the chord (estimates): the P-38's thin laminar wing, the bombers' deep spars.
for (const [k, r] of [['p-38j', 0.15], ['b-17g', 0.18]] as [string, number][]) A[k]!.wing.thicknessRatio = r;

// ---------------------------------------------------------------- piston aircraft from proportions

/**
 * A tapered half planform, root (leading edge `le0`, trailing edge `te0`) at
 * `y0` out to the tip (`le1`, `te1`) at `y1`, its tip rounded: `r` is the
 * rounding's reach inboard as a share of the tip chord (0 a square tip, about
 * 0.7 a fully round one). The edges run on to where the rounding starts and
 * turn round half an ellipse whose outermost point lies a little aft of mid
 * chord, as a real round tip's does; the span stays `y1`.
 */
export function roundedPlan(y0: number, le0: number, te0: number, y1: number, le1: number, te1: number, r: number): P2[] {
  if (r <= 0) return [[le0, y0], [le1, y1], [te1, y1], [te0, y0]];
  const rr = Math.min(r * (le1 - te1), (y1 - y0) * 0.45);
  const ys = y1 - rr;
  const f = (ys - y0) / (y1 - y0);
  const la = le0 + (le1 - le0) * f;
  const ta = te0 + (te1 - te0) * f;
  const mid = (la + ta) / 2;
  const hc = (la - ta) / 2;
  const arc: P2[] = [];
  for (let i = 0; i <= 6; i++) {
    const th = (i / 6) * Math.PI;
    arc.push([mid + hc * Math.cos(th) - hc * 0.18 * Math.sin(th), ys + rr * Math.sin(th)]);
  }
  return [[le0, y0], ...arc, [te0, y0]];
}

/** A wing's half planform from its family: elliptic (Spitfire), tapered (straight edges, the tip's corners eased), round-tipped, square-tipped. */
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
  return roundedPlan(rootY, le, le - root, half, tipLe, tipLe - tip, kind === 'round' ? 0.75 : kind === 'tapered' ? 0.3 : 0.08);
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
  /** The spine stays high from the canopy back to the fin (a razorback), instead of the cut-down deck. */
  razor?: boolean;
  /** The canopy's height above the deck (default 0.5 m, a bubble 0.55 m; estimates). */
  hood?: number;
  /** A radial's cowl radius, and its half-depth when an oval (default the half-width); the half-width at the cockpit. */
  cowl?: number;
  cowlH?: number;
  waist?: number;
  /** The spinner's radius (default: an inline's from the propeller, a radial's two fifths of the cowl's). */
  spinner?: number;
  /** A radial's cylinders seen in its cowl (default 9; a two-row engine shows its front row's 7 or 9). */
  cylinders?: number;
  /** Radiators under the wings (Bf 109, Spitfire): front, out from the centre line, length, depth. */
  rads?: [number, number, number, number];
  /** The wing's thickness at the root as a share of its chord (default 0.15, an estimate for a piston fighter's wing). */
  thick?: number;
  /** Outlines digitised from a public three-view drawing, in place of the estimates (see `Drawn`). */
  draw?: Drawn;
  /** The engine behind the cockpit (P-39, P-63): the wing stands near the middle as estimated, so `LE_FIX` does not apply. */
  midEngine?: boolean;
}

/**
 * Outlines digitised from a public three-view drawing with tools/figures/threeview.py (each drawing is
 * listed in ./sources.md), forward from the aircraft's middle, up from the thrust line, metres: the
 * fuselage's side profile (`top`, with the deck run straight under the canopy and the spine under the fin,
 * and `bottom`) and its `plan` (half width); the wing's and the tailplane's half planforms (forward, out); the
 * fin's side outline from its root's leading edge over the top to the rudder's foot (forward, up); the
 * canopy's top line; from the front view the wing's middle on the centre line (`wingZ`), its dihedral and the
 * tailplane's height. Absent parts stay `piston`'s estimates.
 */
export interface Drawn {
  top: P2[];
  bottom: P2[];
  plan: P2[];
  wing: P2[];
  tail?: P2[];
  fin?: P2[];
  canopy?: P2[];
  wingZ?: number;
  dihedral?: number;
  tailZ?: number;
  /** A gull wing's bend from the head-on view: metres out, and how far its middle there stands below the root's. */
  gull?: { at: number; drop: number };
  /** Fixed main wheels where the drawing has them (see `gearAt` in air.ts). */
  gear?: { x: number; side: number; bottom: number };
  /** A sister type's drawing with a cut-down deck, worn by a razorback: `piston`'s spine is added over it. */
  razor?: boolean;
  /**
   * The body's cross-section from the head-on view (see `Body` in air.ts), its height from the deepest station's
   * bottom to the deck, its half width a share of `frontW`; `frontW` the body's greatest half width head on. A
   * plan's half width beyond it is the wing's root fillet or a radiator seen from above, and is cut to it.
   */
  section?: P2[];
  frontW?: number;
}

/**
 * How far aft the estimated wings stood, as a share of the length. Nine public three-views (FM 30-30, 1943:
 * Bf 109 F, Fw 190 A, Spitfire V, Hurricane, Typhoon, P-47, Mustang I, F6F, A6M) put a single-engined
 * fighter's wing, at half its span, a median 0.135 of the length (about 1.2 m) further forward than the
 * specs' `le` estimates had it, with little spread: the estimates stood the wing near the middle, where the
 * real one is well ahead of it, behind a long engine (not so on the mid-engined P-39 and P-63: `midEngine`).
 * `piston` moves every estimated wing (and the radiators under it, drawn wing or not) forward by that,
 * keeping each estimate's differences between types; a drawn wing (`draw`) stands where its drawing has it.
 */
export const LE_FIX = 0.135;
/**
 * The same for the dive and torpedo bombers (`ww2-attack` or `attack` under a greenhouse at least a quarter of the
 * length long): seven FM 30-30 sheets (SBD, SB2C, TBF, Vengeance, Ju 87 B, B5N, D3A) put their wings, at a quarter
 * of the span, a median 0.036 of the length further aft than `LE_FIX` had moved those types' estimates: behind a
 * two- or three-seat cockpit the estimates had already stood the wing further forward than a fighter's. Single-seat
 * attack aircraft keep `LE_FIX` (no drawing measured).
 */
export const LE_FIX_ATTACK = 0.1;
/**
 * The tailplane, from the same drawings: its root's trailing edge about 0.06 of the length ahead of the
 * rudder's (the estimates had them flush), its root chord with the fillet about 1.3 times the `tailRoot`
 * estimates.
 */
const TAIL_TE = 0.06;
const TAIL_CHORD = 1.3;

/**
 * Points along a smooth run from (x0, v0) to (x1, v1), `n` between: with
 * `bulge` above 0 the value falls slowly at first and faster towards the end
 * (a full rear body), below 0 the other way (a belly sweeping up).
 */
function run(x0: number, v0: number, x1: number, v1: number, n: number, bulge: number): P2[] {
  return Array.from({ length: n }, (_, i) => {
    const u = (i + 1) / (n + 1);
    return [x0 + (x1 - x0) * u, v1 + (v0 - v1) * (1 - u) * (1 + bulge * u)] as P2;
  });
}

/** Where a drawn radial's cowl begins: going back from the nose, where the plan first reaches three quarters of its widest over the front 30 %. */
function cowlFront(plan: P2[], n: number, L: number): number {
  const xs = Array.from({ length: 121 }, (_, i) => n - (L * 0.3 * i) / 120);
  const widest = Math.max(...xs.map((x) => lerpPoly(plan, x)));
  return xs.find((x) => lerpPoly(plan, x) >= widest * 0.75) ?? n - L * 0.05;
}

export function piston(p: Piston): FixedWingSpec & { cls: string } {
  const L = p.length;
  const n = L / 2;
  const t = -L / 2;
  const d = p.draw;
  const c = p.canopy;
  // A drawn canopy runs where its line does.
  const xf = d?.canopy ? d.canopy[0][0] : c.x + c.length / 2;
  const xb = d?.canopy ? d.canopy[d.canopy.length - 1][0] : c.x - c.length / 2;
  // The wing where the drawings put it (see LE_FIX); what hangs under it moves with it.
  const attack = (p.cls === 'ww2-attack' || p.cls === 'attack') && c.length >= 0.25 * L;
  const fix = d || p.midEngine ? 0 : (attack ? LE_FIX_ATTACK : LE_FIX) * L;
  const le = p.le + fix;
  const te = le - p.root;
  const fr = Math.min(p.finRoot, L * 0.2);
  // A drawn body's girth from its outlines.
  const h = d ? Math.max(...d.top.map(([x, v]) => (v - lerpPoly(d.bottom, x)) / 2)) : p.h;
  const w = d ? Math.max(...d.plan.map((q) => q[1])) : p.w;
  // The deck at the cockpit, the canopy's crown on it (estimates: a fighter's hood stands about half a metre).
  const sill = d ? lerpPoly(d.top, xf) : h * 0.92;
  const crown = d?.canopy ? Math.max(...d.canopy.map((q) => q[1])) : sill + (p.hood ?? (c.kind === 'bubble' ? 0.5 : 0.45));
  // The nose: a radial's blunt round cowl, or an inline's spinner and the cowl swelling back to the windscreen.
  const R = p.cowl ?? w;
  const RH = p.cowlH ?? R;
  // The spinner's tip is the nose: a radial's broad and short, an inline's long and pointed.
  const rs = p.spinner ?? (p.radial ? Math.min(R, RH) * 0.42 : Math.max(0.22, Math.min(0.36, p.prop * 0.1)));
  // A drawn radial's cowl lip where its plan first reaches three quarters of the cowl's width; the spinner reaches
  // from there to the nose.
  const drawnLip = d && p.radial ? cowlFront(d.plan, n, L) : undefined;
  const sl = drawnLip !== undefined ? Math.max(rs * 1.6, (n - drawnLip) / 0.72) : p.radial ? rs * 2.0 : rs * 2.6;
  // A radial's cowl lip stands a little behind the spinner's tip, its body behind the lip; an inline's cowl closes
  // round the spinner's base.
  const lipX = drawnLip ?? n - sl * 0.72;
  const x0 = p.radial ? lipX - cowlLip(Math.max(R, RH)) : n - sl + 0.03;
  const mid = (x0 - 0.3 + xf) / 2;
  const waist = p.waist ?? (p.radial ? Math.min(w, R * 0.82) : w);
  // The body's cross-section: round at a radial's cowl, a rounded box at the cockpit, where the canopy stands on
  // the sides of the deck, rounder again towards the tail.
  const boxy = 3.2;
  const round: P2[] = [[x0, p.radial ? 2.1 : 2.3], [xf + 0.6, 2.5], [xf, boxy], [xb, boxy], [t + fr, 2.5], [t, 2.3]];
  // How wide the deck is at the sill, where the canopy's sides rise from it.
  const cw = d ? Math.min(0.4, lerpPoly(d.plan, (xf + xb) / 2) * 0.8) : Math.min(0.4, waist * (1 - 0.92 ** boxy) ** (1 / boxy) * 0.96);
  const top: P2[] = p.radial
    ? [[x0, RH], [x0 - 0.3, RH], [Math.max(xf + 0.1, x0 - 1.2), Math.max(RH * 0.97, sill * 0.98)], [xf, sill]]
    : [[x0, rs * 1.04], [x0 - 0.15, rs * 1.25 + 0.03], [mid, h * 0.8], [xf, sill]];
  const bottom: P2[] = p.radial
    ? [[x0, -RH], [x0 - 0.3, -RH], [Math.max(le, x0 - 1.4), -h * 0.98]]
    : [[x0, -rs * 1.04], [x0 - 0.15, -rs * 1.35], [mid, -h * 0.9], [Math.max(le, mid - 0.4), -h * 0.98]];
  const plan: P2[] = p.radial
    ? [[x0, R], [x0 - 0.3, R], [Math.max(xf + 0.1, x0 - 1.2), R * 0.96], [xf, waist * 0.98], [c.x, waist]]
    : [[x0, rs * 1.04], [x0 - 0.15, rs * 1.22], [mid, w * 0.9], [xf, w * 0.98], [c.x, w]];
  // Behind the cockpit the body tapers smoothly to the tail: the deck falls away (a razorback keeps a narrow spine
  // up to the fin), the belly runs level under the wing and sweeps up, the sides close in.
  top.push([xb, sill * 0.97], ...run(xb, sill * 0.97, t + fr, h * 0.56, 2, 0.3), [t + fr, h * 0.56], [t, h * 0.48]);
  bottom.push([te, -h], ...run(te, -h, t, h * 0.02, 3, -0.35), [t, h * 0.02]);
  plan.push([xb, waist * 0.95], ...run(xb, waist * 0.95, t, 0.07, 3, 0.35), [t, 0.07]);
  // A drawn body from the spinner's base (or the cowl's lip) back: the spinner and the cowl are drawn on their own.
  const from = (poly: P2[]): P2[] => [[x0, lerpPoly(poly, x0)], ...poly.filter((q) => q[0] < x0 - 0.02)];
  const fw = d?.frontW ?? Infinity;
  const fuselage: Body = d ? { top: from(d.top), bottom: from(d.bottom), plan: from(d.plan).map(([x, v]) => [x, Math.min(v, fw)] as P2), round, section: d.section, stations: 16 } : { top, bottom, plan, round, stations: 16 };
  // A drawn radial's cowl: as wide and deep as the body at its lip, round the body's middle there.
  const cowlAt = d
    ? { radius: lerpPoly(d.plan, lipX), height: (lerpPoly(d.top, lipX) - lerpPoly(d.bottom, lipX)) / 2, up: (lerpPoly(d.top, lipX) + lerpPoly(d.bottom, lipX)) / 2 }
    : { radius: R, height: RH, up: 0 };
  const bodies: Outline[] = [];
  if (p.razor && (!d || d.razor)) {
    // A razorback: a narrow spine from the canopy's back, as high as its rear glazing, falling to the fin.
    const s0 = crown - 0.08;
    bodies.push({ top: [[xb + 0.05, s0], [xb - 0.4, s0 - 0.06], ...run(xb - 0.4, s0 - 0.06, t + fr, h * 0.62, 2, 0.2), [t + fr, h * 0.62], [t + fr * 0.4, h * 0.52]], bottom: [[xb + 0.05, sill - 0.3], [t + fr * 0.4, h * 0.2]], plan: [[xb + 0.05, cw * 0.82], [xb - 0.4, cw * 0.7], [t + fr, 0.1], [t + fr * 0.4, 0.06]], round: 2.2, stations: 10 });
  }
  if (p.scoop) {
    // A belly scoop (P-51) or radiator bath (Yak, LaGG): narrower than the body, its lip deepest at the front.
    const [sx, sln, sd] = p.scoop;
    const s0 = sx + sln / 2;
    const s1 = sx - sln / 2;
    const hw = Math.min(w * 0.72, 0.38);
    // Under a drawn body, from its own belly there.
    const belly = d ? -lerpPoly(d.bottom, sx) : h;
    bodies.push({ top: [[s0, -belly * 0.6], [s1, -belly * 0.6]], bottom: [[s0, -belly - sd * 0.8], [s0 - Math.min(0.25, sln * 0.15), -belly - sd], [s0 - sln * 0.55, -belly - sd * 0.85], [s1, -belly * 0.92]], plan: [[s0, hw * 0.92], [s0 - 0.2, hw], [s1 + sln * 0.2, hw * 0.8], [s1, hw * 0.35]], round: 2.6, stations: 8 });
  }
  // A drawn wing's height from its front view: its middle on the centre line, as the builder's mount gives it.
  const mount = d?.wingZ !== undefined ? d.wingZ / (h * 2 * 0.4) : (p.mount ?? -0.8);
  const dihedral = d?.dihedral ?? p.dihedral ?? 6;
  if (p.rads) {
    const [r0, ry, rl, rd] = p.rads;
    // Placed by the estimated wing, so moved with it (see LE_FIX) under a drawn one too.
    const rx = r0 + (p.midEngine ? 0 : (attack ? LE_FIX_ATTACK : LE_FIX) * L);
    const up = mount * 2 * h * 0.4 + ry * Math.tan((dihedral * Math.PI) / 180) - (p.thick ?? 0.15) * p.root * 0.3;
    bodies.push({ top: [[rx, up], [rx - rl, up]], bottom: [[rx, up - rd * 0.8], [rx - rl * 0.2, up - rd], [rx - rl * 0.7, up - rd * 0.9], [rx - rl, up - 0.05]], plan: [[rx, 0.26], [rx - rl * 0.2, 0.3], [rx - rl * 0.7, 0.28], [rx - rl, 0.15]], side: ry, round: 3, stations: 6 });
  }
  // A gull wing bends a third of the way out (where the builder bends it), or where its drawing has the bend.
  const half = p.span / 2;
  const bend = d?.gull?.at ?? half * 0.33;
  const plan0 = d ? d.wing : wingOf(p.wing, le, p.root, p.tip, half, p.sweep ?? 2);
  // A gull wing's planform gets corners at the bend, so the slab bends there instead of running straight from root to tip.
  const bent: P2[] = plan0.flatMap((a, i): P2[] => {
    const b = plan0[(i + 1) % plan0.length];
    return (a[1] - bend) * (b[1] - bend) < 0 ? [a, [a[0] + ((b[0] - a[0]) * (bend - a[1])) / (b[1] - a[1]), bend]] : [a];
  });
  // Starting at the root's trailing edge, the triangulation clips the inner panel first, so no triangle runs across the bend.
  const wingPlan: P2[] = !p.gull ? plan0 : [bent[bent.length - 1], ...bent.slice(0, -1)];
  // The fin: a round top as an ellipse's arc over the rudder, or a straight swept one; the rudder's heel reaches
  // down past the tail's end to the body's underside, as the rudder post stands.
  const heel = -h * 0.38;
  const fins: P2[] = p.roundFin
    ? [[t + p.finRoot, 0], [t + p.finRoot * 0.3, heel * 0.8], [t + 0.06, heel], [t - 0.02, heel * 0.4], [t, p.fin * 0.55], [t + p.finRoot * 0.05, p.fin * 0.8], [t + p.finRoot * 0.16, p.fin * 0.95], [t + p.finRoot * 0.32, p.fin], [t + p.finRoot * 0.5, p.fin * 0.95], [t + p.finRoot * 0.66, p.fin * 0.8], [t + p.finRoot * 0.86, p.fin * 0.42]]
    : [[t + p.finRoot, 0], [t + p.finRoot * 0.3, heel * 0.8], [t + 0.06, heel], [t - 0.06, heel * 0.4], [t - 0.1, p.fin * 0.9], [t + p.finRoot * 0.05, p.fin], [t + p.finRoot * 0.45, p.fin]];
  // The tailplane: a swept leading edge, a near-straight elevator hinge, a round tip; its root's trailing edge
  // ahead of the rudder's (TAIL_TE).
  const tte = t + TAIL_TE * L;
  const tc = p.tailRoot * TAIL_CHORD;
  // The canopy: a hood of its kind standing on the deck; a drawn one keeps its drawing's top line.
  const glass = c.kind === 'glass-nose' ? undefined : hood(c.kind, xf, xb, sill, crown, cw, !!p.razor && (!d || !!d.razor));
  if (glass && d?.canopy) glass.top = d.canopy;
  return {
    cls: p.cls,
    length: L,
    span: p.span,
    height: p.height,
    bodyWidth: Math.max(w, d ? 0 : R) * 2,
    bodyHeight: h * 2,
    fuselage,
    bodies,
    wing: { x: le - p.root / 2, span: p.span, rootChord: p.root, tipChord: p.tip, sweep: p.sweep ?? 2, mount, dihedral, gull: p.gull, gullBend: p.gull ? d?.gull : undefined, thicknessRatio: p.thick ?? 0.15 },
    wingPlan,
    tail: { kind: 'single', finHeight: p.fin, finChord: p.finRoot, tailSpan: p.tailSpan, tailChord: p.tailRoot, finBase: d?.fin ? 0 : h * 0.45, planeUp: d?.tailZ ?? h * 0.3 },
    finPlan: d?.fin ?? fins,
    tailPlan: d?.tail ?? roundedPlan(0, tte + tc, tte, p.tailSpan / 2, tte + tc * 0.82, tte + tc * 0.18, 0.7),
    engines: { kind: 'nose-prop', count: 1 },
    propeller: { diameter: p.prop, blades: p.blades, spinner: rs, spinnerLength: sl },
    cowls: p.radial ? [{ x: lipX, radius: cowlAt.radius, height: cowlAt.height, up: cowlAt.up, gills: Math.max(0.5, R * 1.1), cylinders: p.cylinders }] : undefined,
    canopy: c,
    glass: glass ? [glass] : undefined,
    fixedGear: p.gear,
    gearAt: p.gear ? d?.gear : undefined,
  };
}

/**
 * Outlines digitised from public-domain three-views (listed in ./sources.md) with
 * tools/figures/threeview.py, scaled to each type's published length and span (see `Drawn`).
 */
export const DRAWN: Record<string, Drawn> = {
  // FM 30-30 (1943), Me 109 F.
  'bf-109-f': {
    top: [[4.47, 0.013], [4.182, 0.27], [3.893, 0.37], [3.605, 0.425], [2.74, 0.538], [1.875, 0.563], [0.144, 0.775], [-1.298, 0.7], [-2.451, 0.6], [-3.028, 0.6], [-4.47, 0.438]],
    bottom: [[4.47, -0.038], [4.182, -0.282], [3.893, -0.375], [3.316, -0.438], [3.028, -0.538], [2.74, -0.538], [2.451, -0.488], [1.875, -0.45], [1.586, -0.488], [1.298, -0.488], [1.009, -0.55], [0.721, -0.55], [0.433, -0.525], [0.144, -0.425], [-0.144, -0.438], [-0.433, -0.413], [-1.875, -0.225], [-3.028, -0.038], [-3.316, 0.016], [-3.605, 0.104], [-3.893, 0.138], [-4.182, 0.225], [-4.47, 0.388]],
    plan: [[4.47, 0.038], [4.182, 0.265], [3.893, 0.366], [3.605, 0.41], [3.316, 0.508], [2.74, 0.504], [2.451, 0.586], [0.433, 0.536], [0.144, 0.512], [-0.144, 0.416], [-0.721, 0.391], [-3.028, 0.207], [-3.893, 0.028], [-4.182, 0], [-4.47, 0]],
    wing: [[2.442, 0], [2.442, 0.643], [2.345, 0.673], [2.339, 0.723], [2.3, 2.003], [2.183, 4.36], [2.118, 4.653], [1.853, 4.947], [1.713, 4.96], [1.574, 4.947], [1.198, 4.653], [0.952, 4.07], [0.868, 3.783], [0.706, 2.962], [0.68, 2.706], [0.227, 0.633], [0.227, 0]],
    tail: [[-2.825, 0], [-2.825, 0.283], [-3.097, 0.332], [-3.284, 1.405], [-3.492, 1.544], [-3.615, 1.557], [-3.738, 1.544], [-3.88, 1.405], [-3.887, 1.268], [-3.978, 1.005], [-4.062, 0.471], [-3.919, 0.247], [-3.919, 0]],
    fin: [[-2.913, 0.613], [-3.426, 1.313], [-3.538, 1.325], [-3.551, 1.35], [-3.626, 1.375], [-3.826, 1.375], [-4.001, 1.325], [-4.139, 1.238], [-4.239, 1.138], [-4.401, 0.813], [-4.464, 0.438]],
    canopy: [[1.763, 0.575], [1.628, 0.575], [1.492, 0.608], [1.357, 0.743], [1.222, 0.788], [1.087, 0.788], [0.951, 0.775], [0.816, 0.775], [0.681, 0.775], [0.546, 0.775], [0.41, 0.763], [0.275, 0.763]],
    wingZ: -0.377, dihedral: 4.08, tailZ: 0.665,
    section: [[-1, 0.56], [-0.9, 0.56], [-0.5, 1.0], [-0.3, 0.88], [-0.1, 0.86], [0.1, 0.83], [0.3, 0.67], [0.5, 0.65], [0.7, 0.58], [0.9, 0.44], [1, 0.44]], frontW: 0.496,
  },
  // FM 30-30 (1943), Me 109 F, at the G-6's length.
  'bf-109-g6': {
    top: [[4.51, 0.013], [4.219, 0.272], [3.928, 0.374], [3.637, 0.429], [2.764, 0.542], [1.891, 0.568], [0.145, 0.782], [-1.309, 0.706], [-2.473, 0.606], [-3.055, 0.605], [-4.51, 0.441]],
    bottom: [[4.51, -0.038], [4.219, -0.285], [3.928, -0.378], [3.346, -0.442], [3.055, -0.542], [2.764, -0.542], [2.473, -0.492], [1.891, -0.454], [1.6, -0.492], [1.309, -0.492], [1.018, -0.555], [0.727, -0.555], [0.436, -0.53], [0.145, -0.429], [-0.145, -0.442], [-0.436, -0.416], [-1.891, -0.227], [-3.055, -0.038], [-3.346, 0.016], [-3.637, 0.105], [-3.928, 0.139], [-4.219, 0.227], [-4.51, 0.391]],
    plan: [[4.51, 0.038], [4.219, 0.265], [3.928, 0.366], [3.637, 0.41], [3.346, 0.508], [2.764, 0.504], [2.473, 0.586], [0.436, 0.536], [0.145, 0.512], [-0.145, 0.416], [-0.727, 0.391], [-3.055, 0.207], [-3.928, 0.028], [-4.219, 0], [-4.51, 0]],
    wing: [[2.464, 0], [2.464, 0.643], [2.366, 0.673], [2.36, 0.723], [2.32, 2.003], [2.203, 4.36], [2.137, 4.653], [1.869, 4.947], [1.729, 4.96], [1.588, 4.947], [1.209, 4.653], [0.961, 4.07], [0.876, 3.783], [0.712, 2.962], [0.686, 2.706], [0.229, 0.633], [0.229, 0]],
    tail: [[-2.85, 0], [-2.85, 0.283], [-3.124, 0.332], [-3.314, 1.405], [-3.523, 1.544], [-3.647, 1.557], [-3.771, 1.544], [-3.915, 1.405], [-3.922, 1.268], [-4.013, 1.005], [-4.098, 0.471], [-3.954, 0.247], [-3.954, 0]],
    fin: [[-2.939, 0.618], [-3.457, 1.325], [-3.57, 1.337], [-3.583, 1.362], [-3.658, 1.388], [-3.86, 1.388], [-4.037, 1.337], [-4.176, 1.249], [-4.277, 1.148], [-4.441, 0.82], [-4.504, 0.442]],
    canopy: [[1.779, 0.58], [1.642, 0.58], [1.506, 0.614], [1.369, 0.75], [1.233, 0.795], [1.096, 0.795], [0.96, 0.782], [0.823, 0.782], [0.687, 0.782], [0.55, 0.782], [0.414, 0.77], [0.278, 0.77]],
    wingZ: -0.376, dihedral: 4.08, tailZ: 0.666,
    section: [[-1, 0.56], [-0.9, 0.56], [-0.5, 1.0], [-0.3, 0.86], [-0.1, 0.85], [0.1, 0.83], [0.3, 0.67], [0.5, 0.65], [0.7, 0.58], [0.9, 0.44], [1, 0.44]], frontW: 0.496,
  },
  // FM 30-30 (1943), Me 109 F, at the K-4's length; the K's tall fin and rudder (estimate: the F's a fifth taller).
  'bf-109-k4': {
    top: [[4.475, 0.013], [4.186, 0.27], [3.898, 0.371], [3.609, 0.426], [2.743, 0.538], [1.877, 0.563], [0.144, 0.776], [-1.299, 0.701], [-2.454, 0.601], [-3.031, 0.6], [-4.475, 0.438]],
    bottom: [[4.475, -0.038], [4.186, -0.282], [3.898, -0.376], [3.32, -0.438], [3.031, -0.538], [2.743, -0.538], [2.454, -0.488], [1.877, -0.451], [1.588, -0.488], [1.299, -0.488], [1.01, -0.551], [0.722, -0.551], [0.433, -0.526], [0.144, -0.426], [-0.144, -0.438], [-0.433, -0.413], [-1.877, -0.225], [-3.031, -0.038], [-3.32, 0.016], [-3.609, 0.104], [-3.898, 0.138], [-4.186, 0.225], [-4.475, 0.388]],
    plan: [[4.475, 0.038], [4.186, 0.265], [3.898, 0.366], [3.609, 0.41], [3.32, 0.508], [2.743, 0.504], [2.454, 0.586], [0.433, 0.536], [0.144, 0.512], [-0.144, 0.416], [-0.722, 0.391], [-3.031, 0.207], [-3.898, 0.028], [-4.186, 0], [-4.475, 0]],
    wing: [[2.445, 0], [2.445, 0.643], [2.348, 0.673], [2.341, 0.723], [2.302, 2.003], [2.186, 4.36], [2.121, 4.653], [1.855, 4.947], [1.715, 4.96], [1.576, 4.947], [1.2, 4.653], [0.953, 4.07], [0.869, 3.783], [0.707, 2.962], [0.681, 2.706], [0.227, 0.633], [0.227, 0]],
    tail: [[-2.828, 0], [-2.828, 0.283], [-3.1, 0.332], [-3.288, 1.405], [-3.496, 1.544], [-3.619, 1.557], [-3.742, 1.544], [-3.885, 1.405], [-3.891, 1.268], [-3.982, 1.005], [-4.066, 0.471], [-3.924, 0.247], [-3.924, 0]],
    fin: [[-2.917, 0.613], [-3.43, 1.454], [-3.542, 1.47], [-3.555, 1.5], [-3.63, 1.53], [-3.83, 1.53], [-4.006, 1.47], [-4.143, 1.364], [-4.243, 1.244], [-4.406, 0.854], [-4.469, 0.403]],
    canopy: [[1.765, 0.576], [1.63, 0.576], [1.494, 0.609], [1.359, 0.744], [1.223, 0.789], [1.088, 0.789], [0.952, 0.776], [0.817, 0.776], [0.682, 0.776], [0.546, 0.776], [0.411, 0.764], [0.275, 0.764]],
    wingZ: -0.377, dihedral: 4.08, tailZ: 0.665,
    section: [[-1, 0.56], [-0.9, 0.56], [-0.5, 1.0], [-0.3, 0.86], [-0.1, 0.85], [0.1, 0.83], [0.3, 0.67], [0.5, 0.65], [0.7, 0.58], [0.9, 0.44], [1, 0.44]], frontW: 0.496,
  },
  // FM 30-30 (1943), F.W. 190 A-3, at the A-8's length.
  'fw-190-a8': {
    top: [[4.5, 0.053], [4.21, 0.225], [3.919, 0.238], [3.629, 0.595], [2.177, 0.727], [1.597, 0.754], [-0.435, 0.766], [-2.177, 0.515], [-2.468, 0.502], [-2.758, 0.555], [-4.5, 0.565]],
    bottom: [[4.5, -0.053], [4.21, -0.238], [3.919, -0.238], [3.629, -0.608], [2.758, -0.621], [2.468, -0.581], [-1.016, -0.423], [-1.597, -0.383], [-3.339, -0.159], [-3.629, -0.264], [-3.919, -0.053], [-4.21, 0.013], [-4.5, 0.515]],
    plan: [[4.5, 0.033], [4.21, 0.241], [3.919, 0.247], [3.629, 0.581], [0.726, 0.669], [0.435, 0.627], [0.145, 0.48], [-0.145, 0.423], [-0.726, 0.364], [-1.887, 0.28], [-3.629, 0.126], [-4.21, 0.066], [-4.5, 0.007]],
    wing: [[2.85, 0], [2.85, 0.741], [2.83, 0.898], [2.79, 0.991], [2.75, 1.388], [2.468, 4.936], [2.193, 5.243], [1.975, 5.257], [1.757, 5.243], [1.294, 4.936], [1.214, 4.629], [1.046, 3.732], [0.959, 3.446], [0.765, 2.163], [0.503, 0.825], [0.496, 0]],
    tail: [[-2.924, 0], [-2.937, 0.718], [-3.025, 1.594], [-3.346, 1.757], [-3.461, 1.77], [-3.575, 1.757], [-3.796, 1.594], [-3.836, 1.434], [-3.836, 0.844], [-3.87, 0.718], [-3.87, 0.603], [-3.836, 0.412], [-3.823, 0]],
    fin: [[-2.775, 0.555], [-2.974, 0.7], [-3.423, 1.361], [-3.502, 1.441], [-3.753, 1.546], [-3.925, 1.546], [-4.044, 1.52], [-4.176, 1.441], [-4.282, 1.335], [-4.335, 1.216], [-4.493, 0.568]],
    canopy: [[1.639, 0.753], [1.445, 0.815], [1.252, 0.902], [1.058, 0.965], [0.865, 0.965], [0.672, 0.952], [0.478, 0.938], [0.285, 0.899], [0.091, 0.871], [-0.102, 0.833], [-0.296, 0.801], [-0.489, 0.767]],
    wingZ: -0.354, dihedral: 3.56, tailZ: 0.334,
    section: [[-1, 0.49], [-0.9, 0.49], [-0.3, 1.0], [-0.1, 1.0], [0.1, 0.97], [0.3, 0.96], [0.5, 0.72], [0.7, 0.5], [0.9, 0.41], [1, 0.41]], frontW: 0.643,
  },
  // Journal of Recognition, Sept. 1944, P-51D; the drawing's canopy is open line work, so the hood is the generic bubble.
  'p-51d-mustang': {
    top: [[4.915, 0.042], [4.598, 0.246], [3.964, 0.382], [3.33, 0.448], [1.744, 0.518], [-0.476, 0.527], [-0.793, 0.433], [-2.378, 0.383], [-3.33, 0.605], [-3.647, 0.519], [-4.915, 0.075]],
    bottom: [[4.915, -0.008], [4.598, -0.246], [4.281, -0.314], [3.964, -0.561], [3.647, -0.64], [3.012, -0.756], [2.695, -0.789], [0.793, -0.838], [0.476, -1.044], [-0.159, -1.061], [-0.793, -1.01], [-1.11, -0.925], [-1.427, -0.806], [-2.061, -0.518], [-3.647, -0.331], [-4.598, -0.178], [-4.915, 0.025]],
    plan: [[4.915, 0], [4.598, 0.239], [3.964, 0.387], [3.647, 0.486], [3.33, 0.428], [2.378, 0.461], [2.061, 0.519], [-0.476, 0.429], [-0.793, 0.379], [-1.427, 0.354], [-3.33, 0.204], [-4.598, 0], [-4.915, 0]],
    wing: [[2.291, 0], [2.291, 0.581], [2.237, 0.675], [1.939, 1.494], [1.894, 1.703], [1.632, 5.279], [1.497, 5.624], [1.263, 5.64], [1.028, 5.624], [0.325, 5.279], [-0.397, 0.675], [-0.406, 0]],
    tail: [[-2.958, 0], [-2.958, 0.232], [-3.328, 0.26], [-3.589, 1.785], [-3.67, 1.968], [-3.842, 1.984], [-4.013, 1.968], [-4.311, 1.785], [-4.374, 1.095], [-4.482, 0.373], [-4.482, 0]],
    fin: [[-3.362, 0.62], [-3.531, 0.688], [-3.65, 0.857], [-3.973, 1.486], [-4.058, 1.519], [-4.601, 1.486], [-4.669, 1.418], [-4.686, 1.367], [-4.907, 0.246]],
    wingZ: -0.573, dihedral: 5.57, tailZ: 0.231,
    section: [[-1, 0.7], [-0.9, 0.7], [-0.7, 0.77], [-0.5, 0.93], [-0.1, 0.86], [0.1, 0.86], [0.3, 0.86], [0.5, 1.0], [0.7, 0.69], [0.9, 0.61], [1, 0.61]], frontW: 0.503,
  },
  // FM 30-30 (1943), Mustang I.
  'p-51a': {
    top: [[4.915, -0.014], [4.281, 0.459], [3.647, 0.515], [1.744, 0.529], [0.159, 0.725], [-0.793, 0.682], [-1.11, 0.693], [-1.427, 0.613], [-1.744, 0.599], [-2.378, 0.501], [-2.695, 0.515], [-3.012, 0.444], [-3.33, 0.47], [-4.915, 0.231]],
    bottom: [[4.915, -0.028], [4.598, -0.268], [4.281, -0.334], [3.647, -0.613], [3.33, -0.682], [2.378, -0.724], [0.793, -0.682], [0.476, -0.91], [0.159, -0.919], [-0.793, -0.863], [-1.11, -0.78], [-1.427, -0.752], [-1.744, -0.682], [-2.061, -0.529], [-2.378, -0.529], [-3.012, -0.418], [-3.33, -0.334], [-4.281, -0.168], [-4.598, -0.139], [-4.915, 0.181]],
    plan: [[4.915, 0], [4.598, 0.252], [3.964, 0.4], [3.33, 0.433], [2.695, 0.447], [2.378, 0.473], [2.061, 0.56], [-0.159, 0.643], [-0.476, 0.497], [-0.793, 0.415], [-1.11, 0.384], [-1.427, 0.377], [-2.061, 0.335], [-2.695, 0.258], [-3.012, 0.237], [-3.964, 0.093], [-4.598, 0.042], [-4.915, 0]],
    wing: [[2.251, 0], [2.251, 0.713], [2.167, 0.986], [2.075, 1.419], [1.886, 3.981], [1.816, 4.63], [1.788, 5.296], [1.55, 5.633], [1.374, 5.647], [1.199, 5.633], [0.547, 5.296], [0.245, 3.668], [0.042, 2.789], [0.014, 2.521], [-0.273, 0.986], [-0.309, 0.713], [-0.309, 0]],
    tail: [[-2.678, 0], [-2.678, 0.266], [-3.015, 0.296], [-3.232, 1.871], [-3.365, 2.059], [-3.45, 2.073], [-3.534, 2.059], [-4.004, 1.871], [-4.004, 1.684], [-4.137, 0.412], [-4.144, 0]],
    fin: [[-3.307, 0.473], [-3.474, 0.738], [-3.53, 0.891], [-3.557, 0.891], [-3.655, 1.114], [-3.697, 1.142], [-3.725, 1.253], [-3.933, 1.615], [-4.017, 1.657], [-4.546, 1.643], [-4.574, 1.615], [-4.616, 1.615], [-4.657, 1.49], [-4.811, 0.71], [-4.852, 0.613], [-4.908, 0.265]],
    canopy: [[1.525, 0.557], [1.384, 0.697], [1.244, 0.766], [1.103, 0.78], [0.963, 0.766], [0.822, 0.766], [0.682, 0.766], [0.541, 0.766], [0.401, 0.766], [0.26, 0.766], [0.12, 0.752], [-0.021, 0.752]],
    wingZ: -0.448, dihedral: 4.94, tailZ: 0.331,
    section: [[-1, 0.73], [-0.9, 0.73], [-0.7, 0.87], [-0.1, 0.93], [0.1, 0.9], [0.3, 1.0], [0.5, 0.77], [0.7, 0.71], [0.9, 0.56], [1, 0.56]], frontW: 0.485,
  },
  // FM 30-30 (1943), Mustang I: the B's airframe, its Merlin nose and framed hood alike in outline.
  'p-51b': {
    top: [[4.915, -0.014], [4.281, 0.459], [3.647, 0.515], [1.744, 0.529], [0.159, 0.725], [-0.793, 0.682], [-1.11, 0.693], [-1.427, 0.613], [-1.744, 0.599], [-2.378, 0.501], [-2.695, 0.515], [-3.012, 0.444], [-3.33, 0.47], [-4.915, 0.231]],
    bottom: [[4.915, -0.028], [4.598, -0.268], [4.281, -0.334], [3.647, -0.613], [3.33, -0.682], [2.378, -0.724], [0.793, -0.682], [0.476, -0.91], [0.159, -0.919], [-0.793, -0.863], [-1.11, -0.78], [-1.427, -0.752], [-1.744, -0.682], [-2.061, -0.529], [-2.378, -0.529], [-3.012, -0.418], [-3.33, -0.334], [-4.281, -0.168], [-4.598, -0.139], [-4.915, 0.181]],
    plan: [[4.915, 0], [4.598, 0.252], [3.964, 0.4], [3.33, 0.433], [2.695, 0.447], [2.378, 0.473], [2.061, 0.56], [-0.159, 0.643], [-0.476, 0.497], [-0.793, 0.415], [-1.11, 0.384], [-1.427, 0.377], [-2.061, 0.335], [-2.695, 0.258], [-3.012, 0.237], [-3.964, 0.093], [-4.598, 0.042], [-4.915, 0]],
    wing: [[2.251, 0], [2.251, 0.713], [2.167, 0.986], [2.075, 1.419], [1.886, 3.981], [1.816, 4.63], [1.788, 5.296], [1.55, 5.633], [1.374, 5.647], [1.199, 5.633], [0.547, 5.296], [0.245, 3.668], [0.042, 2.789], [0.014, 2.521], [-0.273, 0.986], [-0.309, 0.713], [-0.309, 0]],
    tail: [[-2.678, 0], [-2.678, 0.266], [-3.015, 0.296], [-3.232, 1.871], [-3.365, 2.059], [-3.45, 2.073], [-3.534, 2.059], [-4.004, 1.871], [-4.004, 1.684], [-4.137, 0.412], [-4.144, 0]],
    fin: [[-3.307, 0.473], [-3.474, 0.738], [-3.53, 0.891], [-3.557, 0.891], [-3.655, 1.114], [-3.697, 1.142], [-3.725, 1.253], [-3.933, 1.615], [-4.017, 1.657], [-4.546, 1.643], [-4.574, 1.615], [-4.616, 1.615], [-4.657, 1.49], [-4.811, 0.71], [-4.852, 0.613], [-4.908, 0.265]],
    canopy: [[1.525, 0.557], [1.384, 0.697], [1.244, 0.766], [1.103, 0.78], [0.963, 0.766], [0.822, 0.766], [0.682, 0.766], [0.541, 0.766], [0.401, 0.766], [0.26, 0.766], [0.12, 0.752], [-0.021, 0.752]],
    wingZ: -0.448, dihedral: 4.94, tailZ: 0.331,
    section: [[-1, 0.73], [-0.9, 0.73], [-0.7, 0.87], [-0.1, 0.93], [0.1, 0.9], [0.3, 1.0], [0.5, 0.77], [0.7, 0.71], [0.9, 0.56], [1, 0.56]], frontW: 0.485,
  },
  // Journal of Recognition, Sept. 1944, La-5 (FN), at the La-7's length, without the La-5's intake on top of the cowl and its oil cooler under it.
  'la-7': {
    top: [[4.3, 0.049], [4.023, 0.236], [3.745, 0.521], [3.19, 0.62], [2.6, 0.612], [2.358, 0.604], [1.526, 0.618], [-0.694, 0.84], [-2.081, 0.799], [-2.913, 0.818], [-4.3, 0.64]],
    bottom: [[4.3, -0.049], [4.023, -0.222], [3.745, -0.485], [3.468, -0.59], [3.19, -0.64], [2.7, -0.62], [2.358, -0.59], [1.803, -0.604], [1.526, -0.577], [0.416, -0.563], [-0.139, -0.507], [-0.694, -0.493], [-1.803, -0.313], [-2.635, -0.136], [-2.913, -0.035], [-3.19, 0.021], [-4.023, 0.271], [-4.3, 0.59]],
    plan: [[4.3, 0], [3.745, 0.482], [3.468, 0.606], [2.913, 0.613], [2.635, 0.67], [2.358, 0.635], [2.081, 0.795], [0.139, 0.623], [-0.139, 0.549], [-0.416, 0.435], [-0.694, 0.388], [-1.526, 0.338], [-2.358, 0.261], [-2.635, 0.23], [-4.023, 0], [-4.3, 0]],
    wing: [[2.154, 0], [2.154, 0.877], [2.012, 2.35], [1.941, 3.54], [1.877, 3.802], [1.884, 4.068], [1.835, 4.612], [1.651, 4.886], [1.502, 4.9], [1.353, 4.886], [0.928, 4.612], [0.751, 4.339], [0.652, 4.068], [0.347, 2.798], [-0.057, 0.905], [-0.057, 0]],
    tail: [[-2.231, 0], [-2.231, 0.26], [-2.635, 0.285], [-2.989, 1.16], [-3.145, 1.465], [-3.159, 1.624], [-3.315, 1.784], [-3.414, 1.798], [-3.514, 1.784], [-3.684, 1.624], [-3.726, 1.465], [-3.889, 1.16], [-3.953, 0.883], [-3.995, 0.544], [-3.981, 0.326], [-3.939, 0.26], [-3.939, 0]],
    fin: [[-2.737, 0.841], [-3.279, 1.438], [-3.293, 1.577], [-3.39, 1.577], [-3.473, 1.646], [-3.626, 1.646], [-3.848, 1.535], [-4.043, 1.355], [-4.224, 1.049], [-4.251, 0.882], [-4.279, 0.841], [-4.293, 0.674]],
    canopy: [[1.292, 0.632], [1.111, 0.688], [0.931, 0.896], [0.75, 0.938], [0.57, 0.938], [0.389, 0.938], [0.208, 0.924], [0.028, 0.91], [-0.153, 0.896], [-0.333, 0.896], [-0.514, 0.868], [-0.695, 0.841]],
    wingZ: -0.497, dihedral: 4.55, tailZ: 0.502,
  },
  // Journal of Recognition, Sept. 1944, La-5 (FN).
  'la-5': {
    top: [[4.335, 0.049], [4.055, 0.238], [3.776, 0.525], [3.216, 0.707], [2.657, 0.689], [2.377, 0.609], [1.259, 0.637], [0.14, 0.871], [-0.14, 0.903], [-0.979, 0.833], [-2.098, 0.805], [-2.937, 0.825], [-4.335, 0.645]],
    bottom: [[4.335, -0.049], [4.055, -0.224], [3.776, -0.489], [3.496, -0.595], [3.216, -0.741], [2.937, -0.777], [2.657, -0.777], [2.377, -0.595], [1.818, -0.609], [1.538, -0.581], [0.14, -0.553], [-0.14, -0.511], [-0.699, -0.497], [-1.818, -0.315], [-2.657, -0.137], [-2.937, -0.035], [-3.216, 0.021], [-4.055, 0.273], [-4.335, 0.595]],
    plan: [[4.335, 0], [3.776, 0.482], [3.496, 0.606], [2.937, 0.613], [2.657, 0.67], [2.377, 0.635], [2.098, 0.795], [0.14, 0.623], [-0.14, 0.549], [-0.42, 0.435], [-0.699, 0.388], [-1.538, 0.338], [-2.377, 0.261], [-2.657, 0.23], [-4.055, 0], [-4.335, 0]],
    wing: [[2.171, 0], [2.171, 0.877], [2.028, 2.35], [1.957, 3.54], [1.893, 3.802], [1.9, 4.068], [1.85, 4.612], [1.664, 4.886], [1.514, 4.9], [1.364, 4.886], [0.936, 4.612], [0.757, 4.339], [0.657, 4.068], [0.35, 2.798], [-0.057, 0.905], [-0.057, 0]],
    tail: [[-2.25, 0], [-2.25, 0.26], [-2.657, 0.285], [-3.014, 1.16], [-3.171, 1.465], [-3.185, 1.624], [-3.342, 1.784], [-3.442, 1.798], [-3.542, 1.784], [-3.714, 1.624], [-3.757, 1.465], [-3.921, 1.16], [-3.985, 0.883], [-4.028, 0.544], [-4.014, 0.326], [-3.971, 0.26], [-3.971, 0]],
    fin: [[-2.759, 0.847], [-3.306, 1.45], [-3.32, 1.59], [-3.418, 1.59], [-3.502, 1.66], [-3.656, 1.66], [-3.88, 1.548], [-4.076, 1.366], [-4.258, 1.057], [-4.286, 0.889], [-4.314, 0.847], [-4.328, 0.679]],
    canopy: [[1.135, 0.679], [1.024, 0.818], [0.913, 0.915], [0.802, 0.945], [0.691, 0.945], [0.581, 0.945], [0.47, 0.945], [0.359, 0.945], [0.248, 0.931], [0.138, 0.917], [0.027, 0.917], [-0.084, 0.917]],
    wingZ: -0.496, dihedral: 4.55, tailZ: 0.502,
  },
  // FM 30-30 (1943), P-47D (razorback).
  'p-47d-razorback': {
    top: [[5.5, 0.041], [5.145, 0.108], [4.79, 0.61], [4.435, 0.717], [4.081, 0.786], [3.726, 0.819], [3.016, 0.868], [2.306, 0.885], [1.952, 0.926], [0.177, 1.216], [-0.887, 1.09], [-1.597, 0.959], [-1.952, 0.935], [-3.016, 0.686], [-3.371, 0.68], [-5.5, 0.472]],
    bottom: [[5.5, -0.025], [5.145, -0.093], [4.79, -0.809], [-0.532, -0.819], [-1.242, -0.703], [-1.952, -0.686], [-2.306, -0.488], [-3.726, -0.207], [-4.79, 0.041], [-5.145, 0.174], [-5.5, 0.422]],
    plan: [[5.5, 0.016], [5.145, 0.131], [4.79, 0.604], [4.435, 0.743], [3.371, 0.832], [0.177, 0.944], [-0.177, 0.889], [-0.532, 0.702], [-0.887, 0.694], [-1.242, 0.661], [-1.952, 0.56], [-2.661, 0.522], [-3.016, 0.473], [-3.371, 0.416], [-3.726, 0.335], [-5.5, 0]],
    wing: [[2.84, 0], [2.84, 1.043], [2.805, 1.611], [2.754, 1.784], [2.771, 1.978], [2.643, 3.823], [2.626, 4.47], [2.541, 5.498], [2.456, 5.849], [2.098, 6.202], [1.936, 6.218], [1.774, 6.202], [1.339, 5.849], [1.032, 5.498], [0.614, 4.807], [0.46, 4.47], [0.298, 3.823], [0.196, 3.515], [-0.017, 2.191], [-0.068, 1.459], [-0.068, 0]],
    tail: [[-3.223, 0], [-3.223, 0.373], [-3.752, 0.408], [-4.119, 1.826], [-4.264, 2.259], [-4.511, 2.481], [-4.647, 2.497], [-4.784, 2.481], [-5.057, 2.259], [-5.312, 1.619], [-5.44, 1.063], [-5.466, 0.766], [-5.449, 0.645], [-5.338, 0.465], [-5.278, 0.408], [-5.27, 0]],
    fin: [[-3.308, 0.686], [-3.341, 0.769], [-3.457, 0.902], [-3.556, 1.117], [-3.606, 1.133], [-3.805, 1.447], [-4.003, 1.679], [-4.235, 2.059], [-4.268, 2.059], [-4.35, 2.175], [-4.383, 2.175], [-4.499, 2.274], [-4.747, 2.291], [-4.863, 2.274], [-4.88, 2.225], [-5.029, 2.142], [-5.128, 2.01], [-5.227, 1.778], [-5.277, 1.646], [-5.31, 1.431], [-5.343, 1.398], [-5.409, 0.802], [-5.442, 0.786], [-5.492, 0.455]],
    canopy: [[1.985, 0.918], [1.824, 1.074], [1.663, 1.183], [1.502, 1.232], [1.341, 1.232], [1.18, 1.249], [1.02, 1.249], [0.859, 1.249], [0.698, 1.249], [0.537, 1.24], [0.376, 1.232], [0.215, 1.216]],
    wingZ: -0.363, dihedral: 6.16, tailZ: 0.541,
    section: [[-1, 0.42], [-0.9, 0.42], [-0.7, 0.63], [-0.3, 1.0], [-0.1, 0.89], [0.1, 0.89], [0.3, 0.89], [0.5, 0.74], [0.7, 0.54], [0.9, 0.34], [1, 0.34]], frontW: 0.864,
  },
  // Journal of Recognition, Jan. 1945, P-47N's body and bubble at the D-25's length (the same fuselage); the D's wing and tail planforms from FM 30-30 (1943)'s P-47D.
  'p-47d': {
    top: [[5.5, 0.038], [5.145, 0.125], [4.79, 0.133], [4.435, 0.603], [3.726, 0.678], [2.306, 0.735], [1.597, 0.697], [1.242, 0.639], [0.887, 0.547], [0.532, 0.509], [0.177, 0.509], [-0.532, 0.588], [-0.887, 0.527], [-1.597, 0.471], [-2.661, 0.343], [-3.371, 0.283], [-3.726, 0.292], [-5.5, -0.025]],
    bottom: [[5.5, -0.019], [5.145, -0.132], [4.79, -0.763], [4.435, -0.98], [4.081, -1.055], [3.016, -1.149], [1.597, -1.187], [0.532, -1.187], [-0.177, -1.149], [-1.952, -0.961], [-2.306, -0.961], [-2.661, -0.776], [-3.016, -0.76], [-3.726, -0.678], [-5.145, -0.377], [-5.5, -0.075]],
    plan: [[5.5, 0.055], [5.145, 0.147], [4.79, 0.618], [4.435, 0.7], [4.081, 0.716], [3.726, 0.698], [3.371, 0.734], [0.177, 0.798], [-0.177, 0.688], [-0.887, 0.652], [-1.952, 0.551], [-2.661, 0.443], [-3.726, 0.307], [-5.145, 0.077], [-5.5, 0]],
    wing: [[2.84, 0], [2.84, 1.043], [2.805, 1.611], [2.754, 1.784], [2.771, 1.978], [2.643, 3.823], [2.626, 4.47], [2.541, 5.498], [2.456, 5.849], [2.098, 6.202], [1.936, 6.218], [1.774, 6.202], [1.339, 5.849], [1.032, 5.498], [0.614, 4.807], [0.46, 4.47], [0.298, 3.823], [0.196, 3.515], [-0.017, 2.191], [-0.068, 1.459], [-0.068, 0]],
    tail: [[-3.223, 0], [-3.223, 0.373], [-3.752, 0.408], [-4.119, 1.826], [-4.264, 2.259], [-4.511, 2.481], [-4.647, 2.497], [-4.784, 2.481], [-5.057, 2.259], [-5.312, 1.619], [-5.44, 1.063], [-5.466, 0.766], [-5.449, 0.645], [-5.338, 0.465], [-5.278, 0.408], [-5.27, 0]],
    fin: [[-3.569, 0.32], [-3.682, 0.452], [-3.795, 0.659], [-4.398, 1.545], [-4.568, 1.714], [-4.718, 1.771], [-4.831, 1.771], [-5.02, 1.62], [-5.152, 1.432], [-5.246, 1.243], [-5.378, 0.885], [-5.472, 0.49], [-5.491, 0.283]],
    canopy: [[1.535, 0.735], [1.463, 0.772], [1.391, 0.822], [1.319, 0.856], [1.247, 0.904], [1.176, 0.943], [1.104, 0.997], [1.032, 1.017], [0.96, 1.017], [0.888, 1.017], [0.816, 1.017], [0.744, 0.509]],
    wingZ: -0.664, dihedral: 5.68, tailZ: 0.193,
    section: [[-1, 0.49], [-0.9, 0.49], [-0.7, 0.7], [-0.1, 0.99], [0.1, 0.99], [0.3, 1.0], [0.5, 0.85], [0.7, 0.73], [0.9, 0.51], [1, 0.51]], frontW: 0.716,
  },
  // Journal of Recognition, Jan. 1945, P-47N.
  'p-47n': {
    top: [[5.565, 0.038], [5.206, 0.127], [4.847, 0.135], [4.488, 0.61], [3.77, 0.686], [2.334, 0.743], [1.257, 0.666], [0.539, 0.515], [0.18, 0.515], [-0.539, 0.595], [-0.898, 0.534], [-1.616, 0.476], [-2.693, 0.347], [-3.411, 0.286], [-3.77, 0.295], [-5.565, -0.026]],
    bottom: [[5.565, -0.019], [5.206, -0.133], [4.847, -0.772], [4.488, -0.991], [4.129, -1.067], [3.052, -1.163], [1.616, -1.201], [0.539, -1.201], [-0.18, -1.163], [-1.975, -0.972], [-2.334, -0.972], [-2.693, -0.785], [-3.052, -0.769], [-3.77, -0.686], [-5.206, -0.381], [-5.565, -0.076]],
    plan: [[5.565, 0.055], [5.206, 0.147], [4.847, 0.618], [4.488, 0.7], [4.129, 0.716], [3.77, 0.698], [3.411, 0.734], [0.18, 0.798], [-0.18, 0.688], [-0.898, 0.652], [-1.975, 0.551], [-2.693, 0.443], [-3.77, 0.307], [-5.206, 0.077], [-5.565, 0]],
    wing: [[3.111, 0], [3.111, 0.915], [3.063, 1.491], [2.985, 3.237], [2.889, 6.089], [2.647, 6.472], [2.382, 6.49], [2.116, 6.472], [1.314, 6.089], [1.13, 5.708], [0.841, 4.958], [0.647, 4.237], [0.531, 3.891], [0.367, 2.643], [0.28, 1.679], [0.242, 0.915], [0.213, 0.863], [0.213, 0]],
    tail: [[-3.217, 0], [-3.217, 0.347], [-3.691, 0.358], [-4.241, 1.999], [-4.348, 2.215], [-4.493, 2.433], [-4.638, 2.451], [-4.782, 2.433], [-5.092, 1.999], [-5.217, 1.584], [-5.275, 0.883], [-5.246, 0.527], [-5.227, 0.449], [-5.15, 0.347], [-5.15, 0]],
    fin: [[-3.612, 0.324], [-3.726, 0.457], [-3.84, 0.667], [-3.897, 0.724], [-4.45, 1.563], [-4.622, 1.734], [-4.774, 1.791], [-4.888, 1.791], [-5.079, 1.639], [-5.212, 1.448], [-5.308, 1.258], [-5.441, 0.896], [-5.536, 0.496], [-5.555, 0.286]],
    canopy: [[1.572, 0.724], [1.5, 0.778], [1.427, 0.813], [1.354, 0.858], [1.281, 0.901], [1.208, 0.953], [1.136, 0.991], [1.063, 1.024], [0.99, 1.029], [0.917, 1.029], [0.845, 1.029], [0.772, 1.029]],
    wingZ: -0.665, dihedral: 5.68, tailZ: 0.192,
    section: [[-1, 0.48], [-0.9, 0.48], [-0.7, 0.69], [-0.1, 0.99], [0.1, 0.99], [0.3, 1.0], [0.5, 0.85], [0.7, 0.73], [0.9, 0.5], [1, 0.5]], frontW: 0.716,
  },
  // FM 30-30 (1943), Spitfire V.
  'spitfire-mk-v': {
    top: [[4.56, -0.007], [4.266, 0.19], [3.972, 0.274], [2.795, 0.373], [1.618, 0.399], [1.324, 0.431], [0.441, 0.647], [-0.147, 0.595], [-0.735, 0.608], [-1.324, 0.543], [-2.795, 0.438], [-3.383, 0.458], [-4.56, 0.227]],
    bottom: [[4.56, -0.02], [4.266, -0.216], [3.972, -0.28], [3.677, -0.543], [3.383, -0.64], [2.501, -0.752], [2.206, -0.883], [1.618, -0.805], [1.324, -0.975], [1.03, -0.962], [0.735, -0.909], [0.441, -0.739], [0.147, -0.674], [-0.147, -0.7], [-0.735, -0.661], [-2.795, -0.412], [-3.089, -0.334], [-4.266, -0.164], [-4.56, 0.177]],
    plan: [[4.56, 0], [4.266, 0.196], [3.677, 0.387], [3.383, 0.457], [0.147, 0.666], [-0.441, 0.43], [-0.735, 0.352], [-1.03, 0.38], [-1.618, 0.345], [-2.501, 0.276], [-3.089, 0.212], [-3.383, 0], [-4.56, 0]],
    wing: [[2.62, 0], [2.593, 1.836], [2.519, 3.097], [2.384, 4.328], [2.256, 4.986], [2.162, 5.32], [1.805, 5.656], [1.731, 5.67], [1.657, 5.656], [1.192, 5.32], [0.849, 4.654], [0.707, 4.328], [0.485, 3.694], [0.33, 3.097], [0.108, 1.836], [0.04, 1.283], [0.027, 0.914], [-0.034, 0.742], [-0.034, 0]],
    tail: [[-3.26, 0], [-3.253, 0.04], [-2.917, 0.089], [-2.917, 0.347], [-3.247, 0.467], [-3.334, 0.908], [-3.476, 1.255], [-3.476, 1.439], [-3.597, 1.627], [-3.853, 1.816], [-3.92, 1.83], [-3.987, 1.816], [-4.23, 1.627], [-4.297, 1.439], [-4.257, 1.255], [-4.311, 1.078], [-4.385, 0.467], [-4.264, 0.347], [-4.196, 0.243], [-4.23, 0.157], [-4.216, 0.04], [-4.243, 0]],
    fin: [[-3.219, 0.491], [-3.35, 0.622], [-3.454, 0.883], [-3.481, 0.896], [-3.638, 1.171], [-3.664, 1.197], [-3.716, 1.197], [-3.755, 1.289], [-3.795, 1.289], [-3.834, 1.341], [-3.912, 1.367], [-4.135, 1.354], [-4.318, 1.223], [-4.475, 0.936], [-4.553, 0.582]],
    canopy: [[1.322, 0.438], [1.232, 0.488], [1.143, 0.547], [1.054, 0.608], [0.965, 0.661], [0.875, 0.687], [0.786, 0.687], [0.697, 0.713], [0.608, 0.7], [0.519, 0.695], [0.429, 0.687], [0.34, 0.674]],
    wingZ: -0.764, dihedral: 5.29, tailZ: 0.243,
    section: [[-1, 0.93], [-0.5, 0.93], [-0.3, 0.93], [-0.1, 0.94], [0.1, 0.9], [0.3, 1.0], [0.5, 0.66], [0.7, 0.58], [0.9, 0.42], [1, 0.42]], frontW: 0.468,
  },
  // FM 30-30 (1943), Spitfire V, its nose 0.35 m longer for the IX's two-stage Merlin (9.12 to 9.47 m).
  'spitfire-mk-ix': {
    top: [[4.735, -0.007], [4.441, 0.19], [4.147, 0.274], [2.62, 0.373], [1.443, 0.399], [1.149, 0.431], [0.266, 0.647], [-0.322, 0.595], [-0.91, 0.608], [-1.499, 0.543], [-2.97, 0.438], [-3.558, 0.458], [-4.735, 0.227]],
    bottom: [[4.735, -0.02], [4.441, -0.216], [4.147, -0.28], [3.852, -0.543], [3.558, -0.64], [2.326, -0.752], [2.031, -0.883], [1.443, -0.805], [1.149, -0.975], [0.855, -0.962], [0.56, -0.909], [0.266, -0.739], [-0.028, -0.674], [-0.322, -0.7], [-0.91, -0.661], [-2.97, -0.412], [-3.264, -0.334], [-4.441, -0.164], [-4.735, 0.177]],
    plan: [[4.735, 0], [4.441, 0.196], [3.852, 0.387], [3.558, 0.457], [-0.028, 0.666], [-0.616, 0.43], [-0.91, 0.352], [-1.205, 0.38], [-1.793, 0.345], [-2.676, 0.276], [-3.264, 0.212], [-3.558, 0], [-4.735, 0]],
    wing: [[2.445, 0], [2.418, 1.836], [2.344, 3.097], [2.209, 4.328], [2.081, 4.986], [1.987, 5.32], [1.63, 5.656], [1.556, 5.67], [1.482, 5.656], [1.017, 5.32], [0.674, 4.654], [0.532, 4.328], [0.31, 3.694], [0.155, 3.097], [-0.067, 1.836], [-0.135, 1.283], [-0.148, 0.914], [-0.209, 0.742], [-0.209, 0]],
    tail: [[-3.435, 0], [-3.428, 0.04], [-3.092, 0.089], [-3.092, 0.347], [-3.422, 0.467], [-3.509, 0.908], [-3.651, 1.255], [-3.651, 1.439], [-3.772, 1.627], [-4.028, 1.816], [-4.095, 1.83], [-4.162, 1.816], [-4.405, 1.627], [-4.472, 1.439], [-4.432, 1.255], [-4.486, 1.078], [-4.56, 0.467], [-4.439, 0.347], [-4.371, 0.243], [-4.405, 0.157], [-4.391, 0.04], [-4.418, 0]],
    fin: [[-3.394, 0.491], [-3.525, 0.622], [-3.629, 0.883], [-3.656, 0.896], [-3.813, 1.171], [-3.839, 1.197], [-3.891, 1.197], [-3.93, 1.289], [-3.97, 1.289], [-4.009, 1.341], [-4.087, 1.367], [-4.31, 1.354], [-4.493, 1.223], [-4.65, 0.936], [-4.728, 0.582]],
    canopy: [[1.147, 0.438], [1.057, 0.488], [0.968, 0.547], [0.879, 0.608], [0.79, 0.661], [0.7, 0.687], [0.611, 0.687], [0.522, 0.713], [0.433, 0.7], [0.344, 0.695], [0.254, 0.687], [0.165, 0.674]],
    wingZ: -0.764, dihedral: 5.29, tailZ: 0.243,
    section: [[-1, 0.93], [-0.5, 0.93], [-0.3, 0.93], [-0.1, 0.94], [0.1, 0.9], [0.3, 1.0], [0.5, 0.66], [0.7, 0.58], [0.9, 0.42], [1, 0.42]], frontW: 0.468,
  },
  // Journal of Recognition, May 1945, Spitfire XIV.
  'spitfire-mk-xiv': {
    top: [[4.98, 0.032], [4.659, 0.195], [4.337, 0.292], [4.016, 0.357], [3.695, 0.357], [3.374, 0.454], [3.052, 0.454], [2.731, 0.487], [1.125, 0.487], [0.482, 0.424], [0.161, 0.357], [-0.161, 0.357], [-0.482, 0.454], [-0.803, 0.487], [-2.731, 0.357], [-3.374, 0.362], [-4.98, 0.131]],
    bottom: [[4.98, 0], [4.659, -0.2], [4.337, -0.324], [4.016, -0.406], [3.695, -0.552], [3.374, -0.649], [3.052, -0.681], [2.731, -0.811], [2.088, -0.811], [1.767, -0.746], [1.446, -0.811], [0.482, -0.811], [-0.161, -0.746], [-0.803, -0.746], [-2.731, -0.552], [-3.052, -0.487], [-4.659, -0.292], [-4.98, 0.081]],
    plan: [[4.98, 0], [4.659, 0.227], [4.337, 0.324], [4.016, 0.379], [3.695, 0.485], [3.374, 0.437], [3.052, 0.445], [0.161, 0.702], [-0.161, 0.682], [-0.482, 0.485], [-0.803, 0.388], [-1.125, 0.34], [-1.767, 0.324], [-2.731, 0.259], [-3.374, 0.178], [-3.695, 0.16], [-4.659, 0.018], [-4.98, 0]],
    wing: [[2.438, 0], [2.43, 1.866], [2.369, 2.562], [2.369, 2.824], [2.232, 3.987], [2.025, 4.944], [1.921, 5.27], [1.628, 5.599], [1.542, 5.615], [1.456, 5.599], [1.06, 5.27], [0.681, 4.62], [0.422, 3.987], [0.138, 2.824], [-0.043, 1.667], [-0.095, 1.064], [-0.095, 0]],
    tail: [[-3.24, 0], [-3.24, 0.225], [-3.584, 0.265], [-3.61, 0.575], [-3.662, 0.807], [-3.782, 1.077], [-3.972, 1.373], [-4.041, 1.527], [-4.23, 1.683], [-4.342, 1.699], [-4.454, 1.683], [-4.627, 1.527], [-4.61, 1.373], [-4.678, 1.222], [-4.756, 0.938], [-4.782, 0.477], [-4.756, 0.321], [-4.687, 0.225], [-4.687, 0]],
    fin: [[-3.188, 0.389], [-3.317, 0.454], [-3.48, 0.616], [-3.561, 0.762], [-3.642, 0.844], [-3.658, 0.908], [-3.707, 0.941], [-3.755, 1.038], [-3.885, 1.168], [-3.982, 1.168], [-4.015, 1.298], [-4.128, 1.33], [-4.145, 1.363], [-4.291, 1.363], [-4.307, 1.33], [-4.388, 1.33], [-4.437, 1.265], [-4.518, 1.233], [-4.647, 1.071], [-4.696, 0.973], [-4.745, 0.941], [-4.777, 0.876], [-4.793, 0.746], [-4.875, 0.681], [-4.891, 0.584], [-4.907, 0.584], [-4.972, 0.227]],
    canopy: [[1.046, 0.519], [0.993, 0.568], [0.94, 0.6], [0.887, 0.643], [0.834, 0.714], [0.781, 0.714], [0.728, 0.693], [0.675, 0.619], [0.622, 0.519], [0.568, 0.487], [0.515, 0.454], [0.462, 0.422]],
    wingZ: -0.595, dihedral: 5.75, tailZ: 0.435,
  },
  // Journal of Recognition, May 1945, Yak-9.
  'yak-9': {
    top: [[4.275, 0], [3.999, 0.185], [3.448, 0.315], [1.517, 0.413], [1.241, 0.328], [-0.138, 0.411], [-0.414, 0.356], [-2.069, 0.271], [-2.62, 0.271], [-2.896, 0.298], [-4.275, 0.292]],
    bottom: [[4.275, -0.014], [3.999, -0.185], [3.723, -0.302], [3.448, -0.543], [3.172, -0.74], [2.62, -0.755], [2.344, -0.841], [2.069, -0.812], [0.69, -0.812], [0.414, -0.983], [0.138, -0.983], [-0.414, -0.898], [-0.69, -0.755], [-1.517, -0.727], [-2.62, -0.613], [-3.999, -0.356], [-4.275, 0.242]],
    plan: [[4.275, 0.021], [3.999, 0.169], [3.172, 0.412], [2.344, 0.536], [2.069, 0.591], [-0.138, 0.585], [-0.414, 0.44], [-0.69, 0.366], [-0.965, 0.338], [-1.241, 0.338], [-1.517, 0.31], [-2.069, 0.282], [-2.896, 0.197], [-4.275, 0.021]],
    wing: [[2.294, 0], [2.294, 0.649], [1.662, 3.998], [1.51, 4.568], [1.321, 4.856], [1.205, 4.87], [1.089, 4.856], [0.842, 4.568], [0.697, 4.282], [0.61, 3.998], [0.276, 2.665], [0.094, 1.774], [0.022, 1.585], [-0.189, 0.679], [-0.218, 0.639], [-0.218, 0]],
    tail: [[-2.671, 0], [-2.671, 0.274], [-3.172, 1.471], [-3.295, 1.614], [-3.426, 1.628], [-3.556, 1.614], [-3.687, 1.471], [-3.767, 1.19], [-3.905, 0.505], [-3.905, 0.362], [-3.883, 0.311], [-3.796, 0.244], [-3.796, 0]],
    fin: [[-2.7, 0.299], [-2.829, 0.599], [-2.871, 0.641], [-2.914, 0.77], [-3.085, 1.083], [-3.128, 1.097], [-3.142, 1.14], [-3.228, 1.211], [-3.342, 1.226], [-3.612, 1.211], [-3.627, 1.183], [-3.726, 1.154], [-3.983, 0.869], [-3.997, 0.812], [-4.068, 0.727], [-4.168, 0.47], [-4.239, 0.413], [-4.268, 0.314]],
    canopy: [[1.076, 0.385], [0.963, 0.613], [0.85, 0.613], [0.738, 0.613], [0.625, 0.599], [0.512, 0.599], [0.4, 0.599], [0.287, 0.584], [0.174, 0.556], [0.062, 0.527], [-0.051, 0.483], [-0.164, 0.442]],
    wingZ: -0.652, dihedral: 4.87, tailZ: 0.181,
    section: [[-1, 0.51], [-0.9, 0.51], [-0.7, 0.56], [-0.1, 0.98], [0.1, 0.98], [0.3, 1.0], [0.5, 0.91], [0.7, 0.77], [0.9, 0.66], [1, 0.66]], frontW: 0.458,
  },
  // Journal of Recognition, May 1945, Fw 190 inline-engined model (provisional); the drawing's canopy is open line work, so the hood is the generic bubble.
  'fw-190-d9': {
    top: [[5.095, 0], [4.766, 0.273], [4.438, 0.406], [4.109, 0.593], [1.808, 0.769], [-0.493, 0.864], [-1.479, 0.673], [-2.465, 0.545], [-3.123, 0.529], [-3.451, 0.567], [-5.095, 0.419]],
    bottom: [[5.095, -0.032], [4.766, -0.272], [4.438, -0.304], [4.109, -0.545], [3.78, -0.577], [2.794, -0.609], [1.479, -0.593], [-1.479, -0.401], [-1.808, -0.417], [-2.137, -0.352], [-3.451, -0.224], [-4.109, -0.128], [-4.438, -0.281], [-4.766, -0.032], [-5.095, 0.369]],
    plan: [[5.095, 0.054], [4.766, 0.279], [4.438, 0.314], [4.109, 0.559], [3.78, 0.597], [3.451, 0.658], [0.164, 0.673], [-0.164, 0.544], [-0.493, 0.444], [-3.123, 0.199], [-4.766, 0.061], [-5.095, 0]],
    wing: [[2.42, 0], [2.42, 0.738], [2.32, 1.101], [2.279, 1.384], [1.858, 4.927], [1.528, 5.235], [1.296, 5.25], [1.065, 5.235], [0.52, 4.927], [0.454, 4.621], [0.363, 3.725], [0.289, 3.439], [0.281, 2.893], [0.058, 0.738], [0.041, 0.727], [0.041, 0]],
    tail: [[-3.237, 0], [-3.237, 0.199], [-3.51, 0.224], [-3.642, 1.569], [-3.922, 1.73], [-4.092, 1.745], [-4.261, 1.73], [-4.41, 1.569], [-4.443, 0.699], [-4.418, 0]],
    fin: [[-3.341, 0.577], [-3.421, 0.625], [-3.517, 0.737], [-4.03, 1.506], [-4.094, 1.57], [-4.222, 1.618], [-4.27, 1.666], [-4.382, 1.666], [-4.414, 1.618], [-4.622, 1.602], [-4.702, 1.554], [-4.847, 1.394], [-4.927, 1.154], [-4.991, 0.817], [-5.039, 0.737], [-5.087, 0.545]],
    wingZ: -0.408, dihedral: 6.19, tailZ: 0.376,
    section: [[-1, 0.57], [-0.9, 0.57], [-0.3, 1.0], [-0.1, 0.95], [0.1, 0.89], [0.3, 0.98], [0.5, 0.59], [0.7, 0.39], [0.9, 0.34], [1, 0.34]], frontW: 0.661,
  },
  // Journal of Recognition, May 1945, Yak-9, at the Yak-1b's length and span (the same airframe and cut-down deck).
  'yak-1b': {
    top: [[4.24, 0], [3.966, 0.184], [3.419, 0.313], [1.505, 0.41], [1.231, 0.325], [-0.137, 0.407], [-0.41, 0.353], [-2.052, 0.269], [-2.599, 0.269], [-2.872, 0.296], [-4.24, 0.29]],
    bottom: [[4.24, -0.014], [3.966, -0.184], [3.693, -0.3], [3.419, -0.539], [3.146, -0.734], [2.599, -0.749], [2.325, -0.834], [2.052, -0.806], [0.684, -0.806], [0.41, -0.975], [0.137, -0.975], [-0.41, -0.89], [-0.684, -0.749], [-1.505, -0.721], [-2.599, -0.608], [-3.966, -0.353], [-4.24, 0.24]],
    plan: [[4.24, 0.022], [3.966, 0.174], [3.146, 0.423], [2.325, 0.55], [2.052, 0.607], [-0.137, 0.601], [-0.41, 0.452], [-0.684, 0.376], [-0.957, 0.347], [-1.231, 0.347], [-1.505, 0.318], [-2.052, 0.289], [-2.872, 0.202], [-4.24, 0.022]],
    wing: [[2.275, 0], [2.275, 0.667], [1.648, 4.105], [1.497, 4.69], [1.31, 4.986], [1.195, 5], [1.08, 4.986], [0.835, 4.69], [0.691, 4.396], [0.605, 4.105], [0.274, 2.736], [0.094, 1.822], [0.022, 1.627], [-0.187, 0.697], [-0.216, 0.656], [-0.216, 0]],
    tail: [[-2.649, 0], [-2.649, 0.281], [-3.146, 1.51], [-3.268, 1.657], [-3.398, 1.671], [-3.527, 1.657], [-3.657, 1.51], [-3.736, 1.222], [-3.873, 0.519], [-3.873, 0.372], [-3.851, 0.319], [-3.765, 0.25], [-3.765, 0]],
    fin: [[-2.678, 0.297], [-2.805, 0.594], [-2.848, 0.636], [-2.89, 0.763], [-3.06, 1.074], [-3.102, 1.088], [-3.116, 1.131], [-3.201, 1.201], [-3.314, 1.215], [-3.583, 1.201], [-3.597, 1.173], [-3.696, 1.145], [-3.95, 0.862], [-3.964, 0.806], [-4.035, 0.721], [-4.134, 0.466], [-4.205, 0.41], [-4.233, 0.311]],
    canopy: [[1.067, 0.382], [0.954, 0.608], [0.841, 0.608], [0.728, 0.608], [0.615, 0.594], [0.502, 0.594], [0.389, 0.594], [0.276, 0.579], [0.163, 0.551], [0.049, 0.523], [-0.064, 0.466], [-0.177, 0.41]],
    wingZ: -0.677, dihedral: 4.87, tailZ: 0.178,
    section: [[-1, 0.51], [-0.9, 0.51], [-0.7, 0.56], [-0.1, 0.98], [0.1, 0.98], [0.3, 1.0], [0.5, 0.91], [0.7, 0.77], [0.9, 0.66], [1, 0.66]], frontW: 0.47,
  },
  // Journal of Recognition, May 1945, Yak-9, at the Yak-1's length and span; the Yak-1's razorback spine added.
  'yak-1': {
    top: [[4.24, 0], [3.966, 0.184], [3.419, 0.313], [1.505, 0.41], [1.231, 0.325], [-0.137, 0.407], [-0.41, 0.353], [-2.052, 0.269], [-2.599, 0.269], [-2.872, 0.296], [-4.24, 0.29]],
    bottom: [[4.24, -0.014], [3.966, -0.184], [3.693, -0.3], [3.419, -0.539], [3.146, -0.734], [2.599, -0.749], [2.325, -0.834], [2.052, -0.806], [0.684, -0.806], [0.41, -0.975], [0.137, -0.975], [-0.41, -0.89], [-0.684, -0.749], [-1.505, -0.721], [-2.599, -0.608], [-3.966, -0.353], [-4.24, 0.24]],
    plan: [[4.24, 0.022], [3.966, 0.174], [3.146, 0.423], [2.325, 0.55], [2.052, 0.607], [-0.137, 0.601], [-0.41, 0.452], [-0.684, 0.376], [-0.957, 0.347], [-1.231, 0.347], [-1.505, 0.318], [-2.052, 0.289], [-2.872, 0.202], [-4.24, 0.022]],
    wing: [[2.275, 0], [2.275, 0.667], [1.648, 4.105], [1.497, 4.69], [1.31, 4.986], [1.195, 5], [1.08, 4.986], [0.835, 4.69], [0.691, 4.396], [0.605, 4.105], [0.274, 2.736], [0.094, 1.822], [0.022, 1.627], [-0.187, 0.697], [-0.216, 0.656], [-0.216, 0]],
    tail: [[-2.649, 0], [-2.649, 0.281], [-3.146, 1.51], [-3.268, 1.657], [-3.398, 1.671], [-3.527, 1.657], [-3.657, 1.51], [-3.736, 1.222], [-3.873, 0.519], [-3.873, 0.372], [-3.851, 0.319], [-3.765, 0.25], [-3.765, 0]],
    fin: [[-2.678, 0.297], [-2.805, 0.594], [-2.848, 0.636], [-2.89, 0.763], [-3.06, 1.074], [-3.102, 1.088], [-3.116, 1.131], [-3.201, 1.201], [-3.314, 1.215], [-3.583, 1.201], [-3.597, 1.173], [-3.696, 1.145], [-3.95, 0.862], [-3.964, 0.806], [-4.035, 0.721], [-4.134, 0.466], [-4.205, 0.41], [-4.233, 0.311]],
    canopy: [[1.067, 0.382], [0.954, 0.608], [0.841, 0.608], [0.728, 0.608], [0.615, 0.594], [0.502, 0.594], [0.389, 0.594], [0.276, 0.579], [0.163, 0.551], [0.049, 0.523], [-0.064, 0.466], [-0.177, 0.41]],
    wingZ: -0.677, dihedral: 4.87, tailZ: 0.178,
    section: [[-1, 0.51], [-0.9, 0.51], [-0.7, 0.56], [-0.1, 0.98], [0.1, 0.98], [0.3, 1.0], [0.5, 0.91], [0.7, 0.77], [0.9, 0.66], [1, 0.66]], frontW: 0.47, razor: true,
  },
  // Journal of Recognition, May 1945, Yak-9, at the Yak-7B's length and span; the Yak-7B's razorback spine added.
  'yak-7b': {
    top: [[4.24, 0], [3.966, 0.184], [3.419, 0.313], [1.505, 0.41], [1.231, 0.325], [-0.137, 0.407], [-0.41, 0.353], [-2.052, 0.269], [-2.599, 0.269], [-2.872, 0.296], [-4.24, 0.29]],
    bottom: [[4.24, -0.014], [3.966, -0.184], [3.693, -0.3], [3.419, -0.539], [3.146, -0.734], [2.599, -0.749], [2.325, -0.834], [2.052, -0.806], [0.684, -0.806], [0.41, -0.975], [0.137, -0.975], [-0.41, -0.89], [-0.684, -0.749], [-1.505, -0.721], [-2.599, -0.608], [-3.966, -0.353], [-4.24, 0.24]],
    plan: [[4.24, 0.022], [3.966, 0.174], [3.146, 0.423], [2.325, 0.55], [2.052, 0.607], [-0.137, 0.601], [-0.41, 0.452], [-0.684, 0.376], [-0.957, 0.347], [-1.231, 0.347], [-1.505, 0.318], [-2.052, 0.289], [-2.872, 0.202], [-4.24, 0.022]],
    wing: [[2.275, 0], [2.275, 0.667], [1.648, 4.105], [1.497, 4.69], [1.31, 4.986], [1.195, 5], [1.08, 4.986], [0.835, 4.69], [0.691, 4.396], [0.605, 4.105], [0.274, 2.736], [0.094, 1.822], [0.022, 1.627], [-0.187, 0.697], [-0.216, 0.656], [-0.216, 0]],
    tail: [[-2.649, 0], [-2.649, 0.281], [-3.146, 1.51], [-3.268, 1.657], [-3.398, 1.671], [-3.527, 1.657], [-3.657, 1.51], [-3.736, 1.222], [-3.873, 0.519], [-3.873, 0.372], [-3.851, 0.319], [-3.765, 0.25], [-3.765, 0]],
    fin: [[-2.678, 0.297], [-2.805, 0.594], [-2.848, 0.636], [-2.89, 0.763], [-3.06, 1.074], [-3.102, 1.088], [-3.116, 1.131], [-3.201, 1.201], [-3.314, 1.215], [-3.583, 1.201], [-3.597, 1.173], [-3.696, 1.145], [-3.95, 0.862], [-3.964, 0.806], [-4.035, 0.721], [-4.134, 0.466], [-4.205, 0.41], [-4.233, 0.311]],
    canopy: [[1.067, 0.382], [0.954, 0.608], [0.841, 0.608], [0.728, 0.608], [0.615, 0.594], [0.502, 0.594], [0.389, 0.594], [0.276, 0.579], [0.163, 0.551], [0.049, 0.523], [-0.064, 0.466], [-0.177, 0.41]],
    wingZ: -0.677, dihedral: 4.87, tailZ: 0.178,
    section: [[-1, 0.51], [-0.9, 0.51], [-0.7, 0.56], [-0.1, 0.98], [0.1, 0.98], [0.3, 1.0], [0.5, 0.91], [0.7, 0.77], [0.9, 0.66], [1, 0.66]], frontW: 0.47, razor: true,
  },
  // FM 30-30 (1943), Me 109 F, at the E's length and span, its wing squared off where the F's tip rounding begins (the E's square tips).
  'bf-109-e': {
    top: [[4.32, 0.012], [4.041, 0.261], [3.763, 0.358], [3.484, 0.411], [2.648, 0.52], [1.812, 0.544], [0.139, 0.749], [-1.254, 0.677], [-2.369, 0.58], [-2.926, 0.58], [-4.32, 0.425]],
    bottom: [[4.32, -0.036], [4.041, -0.273], [3.763, -0.363], [3.205, -0.423], [2.926, -0.52], [2.648, -0.52], [2.369, -0.471], [1.812, -0.435], [1.533, -0.471], [1.254, -0.471], [0.975, -0.532], [0.697, -0.532], [0.418, -0.508], [0.139, -0.411], [-0.139, -0.423], [-0.418, -0.399], [-1.812, -0.218], [-2.926, -0.036], [-3.205, 0.015], [-3.484, 0.1], [-3.763, 0.133], [-4.041, 0.218], [-4.32, 0.375]],
    plan: [[4.32, 0.038], [4.041, 0.263], [3.763, 0.364], [3.484, 0.408], [3.205, 0.505], [2.648, 0.502], [2.369, 0.583], [0.418, 0.534], [0.139, 0.51], [-0.139, 0.414], [-0.697, 0.389], [-2.926, 0.206], [-3.763, 0.028], [-4.041, 0], [-4.32, 0]],
    wing: [[2.36, 0], [2.36, 0.64], [2.266, 0.67], [2.26, 0.72], [2.223, 1.993], [2.11, 4.338], [2.081, 4.935], [1.172, 4.935], [0.92, 4.049], [0.839, 3.764], [0.682, 2.948], [0.657, 2.692], [0.219, 0.63], [0.219, 0]],
    tail: [[-2.73, 0], [-2.73, 0.281], [-2.993, 0.331], [-3.174, 1.398], [-3.375, 1.536], [-3.494, 1.549], [-3.613, 1.536], [-3.75, 1.398], [-3.757, 1.262], [-3.844, 1], [-3.926, 0.469], [-3.788, 0.246], [-3.788, 0]],
    fin: [[-2.816, 0.592], [-3.311, 1.269], [-3.42, 1.281], [-3.504, 1.329], [-3.698, 1.329], [-3.867, 1.281], [-4, 1.196], [-4.096, 1.1], [-4.254, 0.785], [-4.314, 0.423]],
    canopy: [[1.716, 0.556], [1.584, 0.556], [1.452, 0.578], [1.32, 0.713], [1.189, 0.761], [1.057, 0.761], [0.925, 0.749], [0.793, 0.749], [0.661, 0.749], [0.529, 0.749], [0.398, 0.737], [0.266, 0.737]],
    wingZ: -0.378, dihedral: 4.08, tailZ: 0.658,
    section: [[-1, 0.56], [-0.9, 0.56], [-0.5, 1.0], [-0.3, 0.86], [-0.1, 0.85], [0.1, 0.83], [0.3, 0.67], [0.5, 0.65], [0.7, 0.58], [0.9, 0.44], [1, 0.44]], frontW: 0.494,
  },
  // FM 30-30 (1943), F4U-1 (its rudder set forward of the projecting fuselage tip). The sheet's small side view has the
  // body only 1.0 m deep at the cowl, where its own head-on view (and the plan) draw the round cowl 1.34-1.42 m across:
  // the side view's belly is deepened to the round cowl, its shape kept (the line under it scaled by the same 1.88).
  'f4u-corsair': {
    top: [[5.1, 0.058], [4.771, 0.157], [4.442, 0.543], [4.113, 0.634], [3.784, 0.651], [3.455, 0.618], [3.126, 0.667], [1.481, 0.717], [1.152, 0.75], [-0.165, 1.03], [-1.152, 0.964], [-2.468, 0.783], [-5.1, 0.174]],
    bottom: [[5.1, -0.041], [4.771, -0.173], [4.442, -0.667], [-2.797, -0.667], [-3.455, -0.543], [-3.784, -0.418], [-4.113, -0.202], [-4.771, 0.008], [-5.1, 0.124]],
    plan: [[5.1, 0], [4.771, 0.19], [4.442, 0.609], [4.113, 0.684], [3.784, 0.693], [3.455, 0.66], [3.126, 0.709], [-0.165, 0.627], [-1.481, 0.544], [-2.797, 0.412], [-3.126, 0.367], [-3.455, 0.297], [-4.771, 0.093], [-5.1, 0]],
    wing: [[2.893, 0], [2.901, 1.082], [2.884, 1.218], [2.91, 2.238], [2.675, 5.489], [2.575, 5.86], [2.032, 6.234], [1.852, 6.25], [1.672, 6.234], [1.037, 5.86], [0.769, 5.489], [0.644, 5.121], [0.518, 4.402], [0.242, 2.502], [0.184, 0.969], [0.184, 0]],
    tail: [[-3.503, 0], [-3.503, 0.428], [-3.796, 2.052], [-3.871, 2.278], [-4.147, 2.507], [-4.264, 2.523], [-4.381, 2.507], [-4.649, 2.278], [-4.791, 1.414], [-4.891, 0.368], [-4.891, 0]],
    fin: [[-2.653, 0.75], [-3.032, 1.854], [-3.114, 1.87], [-3.131, 1.986], [-3.197, 2.052], [-3.213, 2.117], [-3.378, 2.117], [-3.395, 2.15], [-3.691, 2.134], [-3.839, 2.068], [-4.004, 1.92], [-4.153, 1.656], [-4.334, 0.568], [-4.4, 0.519], [-4.416, 0.453], [-4.564, 0.453], [-4.943, 0.371], [-5.026, 0.321], [-5.092, 0.222]],
    canopy: [[1.121, 0.75], [1.005, 0.667], [0.89, 0.634], [0.774, 0.98], [0.659, 1.03], [0.544, 1.046], [0.428, 1.046], [0.313, 1.046], [0.198, 0.931], [0.082, 0.931], [-0.033, 0.947], [-0.148, 1.03]],
    wingZ: 0.014, dihedral: 8.69, tailZ: 0.705,
    section: [[-1, 0.43], [-0.9, 0.43], [-0.3, 0.99], [-0.1, 1.0], [0.1, 1.0], [0.3, 0.92], [0.7, 0.6], [0.9, 0.49], [1, 0.49]], frontW: 0.671,
  },
  // FM 30-30 (1943), F4U-1, at the F4U-4's length.
  'f4u-4': {
    top: [[5.135, 0.058], [4.804, 0.158], [4.472, 0.546], [4.141, 0.639], [3.81, 0.655], [3.479, 0.622], [3.147, 0.672], [1.491, 0.722], [1.16, 0.755], [-0.166, 1.037], [-1.16, 0.971], [-2.485, 0.788], [-5.135, 0.174]],
    bottom: [[5.135, -0.041], [4.804, -0.174], [4.472, -0.672], [-2.816, -0.672], [-3.479, -0.546], [-3.81, -0.422], [-4.141, -0.203], [-4.804, 0.008], [-5.135, 0.124]],
    plan: [[5.135, 0], [4.804, 0.19], [4.472, 0.609], [4.141, 0.684], [3.81, 0.693], [3.479, 0.66], [3.147, 0.709], [-0.166, 0.627], [-1.491, 0.544], [-2.816, 0.412], [-3.147, 0.367], [-3.479, 0.297], [-4.804, 0.093], [-5.135, 0]],
    wing: [[2.913, 0], [2.921, 1.082], [2.904, 1.218], [2.929, 2.238], [2.694, 5.489], [2.593, 5.86], [2.046, 6.234], [1.865, 6.25], [1.684, 6.234], [1.044, 5.86], [0.774, 5.489], [0.648, 5.121], [0.522, 4.402], [0.244, 2.502], [0.185, 0.969], [0.185, 0]],
    tail: [[-3.527, 0], [-3.527, 0.428], [-3.822, 2.052], [-3.898, 2.278], [-4.175, 2.507], [-4.293, 2.523], [-4.411, 2.507], [-4.68, 2.278], [-4.824, 1.414], [-4.925, 0.368], [-4.925, 0]],
    fin: [[-2.671, 0.755], [-3.053, 1.867], [-3.136, 1.883], [-3.152, 1.999], [-3.219, 2.066], [-3.235, 2.132], [-3.401, 2.132], [-3.418, 2.165], [-3.716, 2.149], [-3.866, 2.082], [-4.032, 1.933], [-4.181, 1.667], [-4.364, 0.572], [-4.43, 0.523], [-4.446, 0.456], [-4.596, 0.456], [-4.977, 0.373], [-5.11, 0.274], [-5.127, 0.224]],
    canopy: [[1.128, 0.755], [1.012, 0.672], [0.896, 0.639], [0.78, 0.987], [0.664, 1.037], [0.548, 1.054], [0.431, 1.054], [0.315, 1.054], [0.199, 0.937], [0.083, 0.937], [-0.033, 0.954], [-0.149, 1.037]],
    wingZ: 0.02, dihedral: 8.69, tailZ: 0.707,
    section: [[-1, 0.43], [-0.9, 0.43], [-0.3, 0.99], [-0.1, 1.0], [0.1, 1.0], [0.3, 0.92], [0.7, 0.59], [0.9, 0.49], [1, 0.49]], frontW: 0.671,
  },
  // FM 30-30 (1943), sheet "Nate" Type 97 F (Ki-27), at the published 7.53 x 11.31 m; the belly run straight past the
  // spatted main wheels and the plan's leading edge past the wheel legs, the wheels where the side and head-on views
  // put them.
  'ki-27': {
    top: [[3.765, 0.036], [3.522, 0.135], [3.279, 0.586], [3.036, 0.62], [2.793, 0.606], [2.55, 0.697], [2.308, 0.563], [2.065, 0.584], [1.093, 0.834], [0.607, 0.763], [0.121, 0.649], [-0.364, 0.478], [-1.822, 0.321], [-2.065, 0.264], [-2.308, 0.304], [-3.765, 0.271]],
    bottom: [[3.765, -0.021], [3.522, -0.107], [3.279, -0.586], [3.036, -0.635], [2.793, -0.649], [2.308, -0.702], [1.822, -0.755], [1.093, -0.834], [0.85, -0.693], [0.607, -0.606], [0.121, -0.578], [-0.121, -0.506], [-0.364, -0.492], [-0.607, -0.535], [-0.85, -0.521], [-3.279, -0.278], [-3.522, -0.221], [-3.765, 0.221]],
    plan: [[3.765, 0.036], [3.522, 0.146], [3.279, 0.62], [2.55, 0.661], [0.364, 0.885], [0.121, 0.829], [-0.121, 0.638], [-0.607, 0.416], [-2.308, 0.248], [-2.793, 0.171], [-3.522, 0.031], [-3.765, 0.0]],
    wing: [[2.495, 0.0], [2.48, 1.356], [2.458, 1.824], [2.353, 5.004], [2.316, 5.322], [2.024, 5.64], [1.871, 5.655], [1.718, 5.64], [1.307, 5.322], [1.113, 5.004], [0.979, 4.69], [0.269, 1.067], [0.261, 0.0]],
    tail: [[-2.316, 0.0], [-2.316, 0.231], [-2.63, 0.261], [-2.674, 0.836], [-2.816, 1.505], [-2.958, 1.885], [-3.1, 2.08], [-3.19, 2.094], [-3.279, 2.08], [-3.406, 1.885], [-3.511, 1.505], [-3.66, 0.576], [-3.66, 0.0]],
    fin: [[-2.203, 0.307], [-3.016, 1.276], [-3.173, 1.362], [-3.33, 1.362], [-3.458, 1.276], [-3.601, 1.02], [-3.715, 0.692], [-3.758, 0.278]],
    canopy: [[2.089, 0.578], [2.0, 0.71], [1.91, 0.799], [1.821, 0.849], [1.731, 0.877], [1.642, 0.877], [1.553, 0.877], [1.463, 0.863], [1.374, 0.877], [1.284, 0.863], [1.195, 0.863], [1.105, 0.834]],
    wingZ: -0.872, dihedral: 5.41, tailZ: -0.371,
    gear: { x: 2.19, side: 1.04, bottom: -1.58 },
  },
  // FM 30-30 (1943), sheet "F6F Hellcat" (F6F-3), at the published 10.24 x 13.06 m: the deep body with the chin under
  // the cowl, the square-tipped wing, the fin and tailplane.
  'f6f-hellcat': {
    top: [[5.12, 0.049], [4.79, 0.273], [4.459, 0.653], [4.129, 0.78], [1.817, 0.845], [1.156, 1.079], [0.826, 1.154], [0.165, 0.943], [-0.165, 0.894], [-0.826, 0.683], [-1.156, 0.618], [-1.486, 0.504], [-1.817, 0.423], [-2.477, 0.18], [-2.808, 0.094], [-3.138, 0.081], [-3.468, 0.024], [-5.12, -0.633]],
    bottom: [[5.12, -0.033], [4.79, -0.276], [4.459, -0.864], [4.129, -1.024], [3.799, -1.089], [3.468, -1.105], [3.138, -1.089], [2.477, -1.235], [-1.486, -1.235], [-4.129, -1.073], [-4.79, -1.086], [-5.12, -0.683]],
    plan: [[5.12, 0.032], [4.79, 0.235], [4.459, 0.276], [4.129, 0.641], [3.799, 0.681], [3.138, 0.722], [2.808, 0.657], [2.477, 0.676], [-0.165, 0.705], [-0.495, 0.627], [-0.826, 0.592], [-1.156, 0.576], [-2.808, 0.372], [-3.138, 0.312], [-3.468, 0.272], [-4.79, 0.04], [-5.12, 0.0]],
    wing: [[2.766, 0.0], [2.749, 1.094], [2.443, 4.222], [2.298, 6.121], [2.008, 6.514], [1.713, 6.53], [1.419, 6.514], [0.653, 6.121], [0.564, 5.731], [0.339, 4.222], [0.258, 3.868], [0.169, 3.197], [-0.234, 0.762], [-0.234, 0.0]],
    tail: [[-2.822, 0.0], [-2.83, 0.381], [-3.346, 0.451], [-3.386, 0.671], [-3.644, 1.391], [-3.911, 2.374], [-4.088, 2.642], [-4.08, 2.912], [-4.233, 2.928], [-4.386, 2.912], [-4.862, 2.374], [-4.926, 2.112], [-4.951, 1.86], [-4.951, 0.671], [-4.935, 0.548], [-4.781, 0.324], [-4.781, 0.0]],
    fin: [[-3.243, 0.114], [-3.356, 0.179], [-3.438, 0.276], [-3.828, 0.878], [-3.909, 1.057], [-4.023, 1.203], [-4.169, 1.284], [-4.185, 1.317], [-4.559, 1.317], [-4.689, 1.284], [-4.868, 1.154], [-4.949, 0.926], [-4.982, 0.358], [-5.112, -0.666]],
    canopy: [[1.764, 0.861], [1.685, 0.94], [1.607, 1.034], [1.529, 1.113], [1.45, 1.17], [1.372, 1.203], [1.294, 1.203], [1.215, 1.203], [1.137, 1.203], [1.059, 1.197], [0.98, 1.17], [0.902, 1.17]],
    wingZ: -0.849, dihedral: 8.2, tailZ: 0.0,
  },
  // FM 30-30 (1943), sheet "A-35 Vengeance".
  'vengeance': {
    top: [[6.06, 0.055], [5.669, 0.199], [5.278, 0.75], [4.105, 0.823], [2.932, 0.859], [-0.195, 1.192], [-0.586, 1.133], [-0.977, 0.841], [-3.323, 0.666], [-6.06, 0.269]],
    bottom: [[6.06, 0], [5.669, -0.183], [5.278, -0.786], [4.887, -0.841], [-1.368, -0.841], [-1.759, -0.823], [-2.15, -0.731], [-4.496, -0.347], [-5.669, -0.11], [-6.06, 0.219]],
    plan: [[6.06, 0.019], [5.669, 0.184], [5.278, 0.658], [4.887, 0.732], [3.714, 0.714], [0.195, 0.797], [-0.195, 0.723], [-0.977, 0.714], [-1.759, 0.658], [-2.15, 0.603], [-2.932, 0.534], [-3.714, 0.436], [-4.496, 0.326], [-6.06, 0]],
    wing: [[3.155, 0], [3.155, 0.861], [3.02, 1.233], [2.944, 1.583], [2.781, 2.039], [2.56, 2.904], [2.56, 6.857], [2.416, 7.296], [2.076, 7.315], [1.736, 7.296], [1.41, 6.857], [0.297, 3.235], [0.221, 2.904], [0.192, 2.593], [0.201, 0.996], [0.221, 0.921], [0.201, 0.861], [0.201, 0]],
    tail: [[-3.778, 0], [-3.778, 0.416], [-4.286, 0.461], [-4.334, 0.773], [-4.334, 0.931], [-4.392, 1.114], [-4.603, 2.889], [-4.689, 3.18], [-4.967, 3.199], [-5.245, 3.18], [-5.523, 2.889], [-5.753, 1.546], [-5.897, 0.931], [-5.926, 0.641], [-5.983, 0.461], [-5.983, 0]],
    fin: [[-3.254, 0.676], [-3.29, 0.859], [-3.437, 1.133], [-3.455, 1.261], [-3.638, 1.7], [-3.711, 1.938], [-3.766, 2.029], [-3.784, 2.139], [-3.967, 2.596], [-3.985, 2.706], [-4.003, 2.706], [-4.077, 2.87], [-4.186, 2.943], [-4.552, 2.943], [-4.588, 2.907], [-4.899, 2.907], [-4.917, 2.852], [-4.954, 2.852], [-5.009, 2.504], [-5.045, 2.358], [-5.082, 2.34], [-5.1, 2.139], [-5.137, 2.084], [-5.192, 1.81], [-5.228, 1.444], [-5.301, 1.225], [-5.32, 0.951], [-5.374, 0.896], [-5.393, 0.768], [-5.448, 0.768], [-5.466, 0.658], [-5.612, 0.64], [-5.704, 0.603], [-5.758, 0.384], [-6.014, 0.384], [-6.051, 0.274]],
    canopy: [[2.559, 0.896], [2.297, 1.122], [2.034, 1.207], [1.772, 1.225], [1.509, 1.225], [1.246, 1.225], [0.984, 1.225], [0.721, 1.243], [0.459, 1.225], [0.196, 1.225], [-0.066, 1.207], [-0.329, 1.207]],
    wingZ: -0.415, dihedral: 6.13, tailZ: 0.563,
  },
  // FM 30-30 (1943), sheet "P-39 Airacobra" (P-39E); the radio mast taken out of the spine's line.
  'p-39': {
    top: [[4.6, 0.025], [4.303, 0.038], [4.006, 0.241], [3.71, 0.329], [3.116, 0.431], [2.226, 0.511], [0.742, 0.778], [-0.148, 0.596], [-0.445, 0.718], [-0.742, 0.697], [-1.039, 0.615], [-1.632, 0.536], [-2.523, 0.507], [-2.819, 0.542], [-4.6, 0.494]],
    bottom: [[4.6, -0.013], [4.303, -0.013], [4.006, -0.194], [3.71, -0.329], [2.819, -0.57], [1.929, -0.697], [1.632, -0.659], [1.335, -0.748], [1.039, -0.76], [0.742, -0.836], [0.445, -0.824], [-0.445, -0.684], [-0.742, -0.57], [-1.039, -0.583], [-1.335, -0.545], [-4.006, -0.076], [-4.303, 0.025], [-4.6, 0.444]],
    plan: [[4.6, 0.0], [4.303, 0.0], [4.006, 0.24], [3.413, 0.468], [3.116, 0.455], [2.226, 0.455], [-0.742, 0.617], [-1.039, 0.431], [-1.335, 0.326], [-1.632, 0.372], [-2.226, 0.319], [-4.303, 0.055], [-4.6, 0.0]],
    wing: [[1.682, 0.0], [1.682, 0.667], [1.656, 0.761], [1.682, 0.927], [1.527, 2.829], [1.32, 4.859], [1.003, 5.166], [0.809, 5.18], [0.615, 5.166], [0.194, 4.859], [-0.039, 4.554], [-0.129, 4.251], [-0.725, 0.761], [-0.731, 0.0]],
    tail: [[-3.002, 0.0], [-3.008, 0.281], [-3.041, 0.329], [-3.235, 0.973], [-3.41, 1.647], [-3.494, 1.831], [-3.688, 2.016], [-3.817, 2.03], [-3.947, 2.016], [-4.108, 1.831], [-4.192, 1.647], [-4.27, 1.295], [-4.296, 0.698], [-4.283, 0.395], [-4.27, 0.329], [-4.16, 0.242], [-4.16, 0.0]],
    fin: [[-2.706, 0.545], [-2.794, 0.57], [-2.959, 0.672], [-3.276, 1.191], [-3.453, 1.407], [-3.656, 1.521], [-3.871, 1.546], [-4.036, 1.521], [-4.239, 1.407], [-4.378, 1.229], [-4.48, 1.039], [-4.543, 0.849], [-4.568, 0.57], [-4.594, 0.52]],
    canopy: [[2.249, 0.507], [2.109, 0.52], [1.968, 0.583], [1.828, 0.662], [1.687, 0.722], [1.547, 0.779], [1.406, 0.849], [1.265, 0.862], [1.125, 0.849], [0.984, 0.839], [0.844, 0.811], [0.703, 0.786]],
    wingZ: -0.636, dihedral: 5.6, tailZ: 0.43,
    section: [[-1, 0.78], [-0.9, 0.78], [-0.5, 0.97], [-0.3, 0.94], [-0.1, 1.0], [0.1, 1.0], [0.3, 0.88], [0.5, 0.77], [0.7, 0.72], [0.9, 0.62], [1, 0.62]], frontW: 0.449,
  },
  // Journal of Recognition, Sept. 1943, sheet "IL-2 Stormovik" (the two-seater's greenhouse); the wing's edges run
  // straight past the gear fairings and the radiator under the belly is left to the scoop (the drawing's white
  // detail lines cut notches there), the fin's staircase smoothed.
  'il-2': {
    top: [[5.8, 0.02], [5.426, 0.216], [5.052, 0.374], [4.303, 0.531], [3.929, 0.57], [3.555, 0.57], [3.181, 0.649], [2.806, 0.688], [2.432, 0.688], [2.058, 0.569], [0.561, 0.534], [0.187, 0.492], [-0.187, 0.531], [-0.561, 0.531], [-1.684, 0.492], [-2.058, 0.452], [-2.432, 0.452], [-3.555, 0.323], [-5.8, -0.088]],
    bottom: [[5.8, -0.02], [5.052, -0.438], [4.303, -0.639], [3.555, -0.727], [2.4, -0.75], [0.935, -0.73], [0.561, -0.727], [-0.187, -0.727], [-0.561, -0.688], [-1.31, -0.688], [-1.684, -0.649], [-2.058, -0.649], [-3.929, -0.452], [-4.677, -0.295], [-5.052, -0.256], [-5.426, -0.138], [-5.8, -0.138]],
    plan: [[5.8, 0.039], [5.052, 0.39], [4.677, 0.41], [4.303, 0.483], [3.555, 0.527], [-0.187, 0.55], [-0.561, 0.449], [-0.935, 0.527], [-1.31, 0.527], [-1.684, 0.488], [-2.432, 0.449], [-2.806, 0.41], [-3.181, 0.39], [-4.5, 0.25], [-5.426, 0.1], [-5.8, 0.0]],
    wing: [[3.06, 0.0], [3.06, 0.834], [3.0, 1.24], [2.93, 2.1], [2.827, 3.136], [2.75, 4.267], [2.653, 5.095], [2.557, 6.409], [2.46, 6.858], [2.209, 7.31], [2.054, 7.32], [1.899, 7.31], [1.242, 6.858], [1.029, 6.409], [0.875, 5.964], [0.604, 4.675], [0.449, 4.267], [0.43, 3.873], [0.237, 3.136], [0.198, 2.795], [0.063, 2.179], [-0.053, 1.659], [-0.184, 0.941], [-0.305, 0.696], [-0.305, 0.0]],
    tail: [[-3.495, 0.0], [-3.495, 0.664], [-3.823, 1.45], [-4.15, 2.0], [-4.384, 2.184], [-4.616, 2.45], [-4.713, 2.596], [-4.829, 2.586], [-5.041, 2.384], [-5.138, 2.184], [-5.409, 1.15], [-5.525, 0.696], [-5.525, 0.0]],
    fin: [[-3.278, 0.374], [-3.55, 0.77], [-3.95, 1.32], [-4.35, 1.78], [-4.55, 1.907], [-4.9, 1.907], [-5.1, 1.75], [-5.26, 1.51], [-5.41, 1.1], [-5.45, 0.26], [-5.6, 0.24], [-5.75, 0.1], [-5.795, -0.098]],
    canopy: [[2.109, 0.57], [1.954, 1.121], [1.799, 1.121], [1.645, 1.121], [1.49, 1.121], [1.336, 1.121], [1.181, 1.121], [1.026, 1.121], [0.872, 1.042], [0.717, 0.963], [0.563, 0.885], [0.408, 0.531]],
    wingZ: -0.235, dihedral: 3.29, tailZ: -0.05, frontW: 0.55,
  },
  // Journal of Recognition, Sept. 1943, sheet "I-16 & I-16C" (type 24); the top view's centre run is cut by the
  // drawing's white detail lines, so the plan aft of the cowl is read off the view by eye; gear and tail wheel left out.
  'i-16': {
    top: [[3.065, 0.047], [2.867, 0.259], [2.67, 0.259], [2.472, 0.66], [2.076, 0.731], [1.681, 0.754], [1.285, 0.754], [1.088, 0.684], [0.692, 0.775], [0.297, 0.704], [-0.099, 0.684], [-0.297, 0.967], [-0.692, 0.919], [-1.285, 0.778], [-1.681, 0.778], [-3.065, 0.592]],
    bottom: [[3.065, -0.047], [2.867, -0.259], [2.67, -0.259], [2.472, -0.66], [2.274, -0.684], [2.076, -0.66], [1.681, -0.66], [0.099, -0.637], [-1.285, -0.472], [-1.879, -0.354], [-2.274, -0.212], [-2.67, -0.15], [-3.065, 0.05]],
    plan: [[3.065, 0.0], [2.99, 0.27], [2.86, 0.37], [2.65, 0.39], [2.64, 0.68], [2.55, 0.71], [2.07, 0.71], [1.0, 0.68], [-0.8, 0.58], [-1.6, 0.4], [-2.4, 0.25], [-3.065, 0.05]],
    wing: [[2.348, 0.0], [2.348, 0.681], [2.307, 0.752], [2.046, 0.814], [2.035, 0.893], [1.849, 4.244], [1.518, 4.506], [1.399, 4.512], [1.28, 4.506], [0.769, 4.244], [0.63, 3.984], [0.549, 3.726], [0.154, 1.889], [0.049, 1.532], [-0.032, 1.374], [-0.334, 0.989], [-0.694, 0.707], [-0.798, 0.681], [-0.798, 0.0]],
    tail: [[-1.669, 0.0], [-1.669, 0.632], [-1.739, 0.711], [-2.203, 1.447], [-2.249, 1.696], [-2.389, 1.823], [-2.447, 1.829], [-2.505, 1.823], [-2.76, 1.696], [-2.888, 1.45], [-3.004, 1.108], [-3.062, 0.711], [-3.05, 0.0]],
    fin: [[-1.506, 0.802], [-1.7, 1.037], [-2.0, 1.37], [-2.2, 1.6], [-2.33, 1.65], [-2.54, 1.63], [-2.8, 1.415], [-2.92, 1.25], [-3.0, 1.1], [-3.062, 0.872]],
    canopy: [[0.71, 0.778], [0.55, 0.95], [0.32, 0.99], [0.28, 0.7]],
    wingZ: -0.22, dihedral: 2.18, tailZ: 0.141,
  },
  // FM 30-30 (1943), sheet "Hurricane" (II); the wing's edge run straight past a notch the gun ports cut.
  'hurricane': {
    top: [[4.92, 0.022], [4.603, 0.186], [3.968, 0.305], [3.65, 0.409], [2.063, 0.568], [0.476, 0.816], [0.159, 0.825], [-0.476, 0.751], [-1.111, 0.632], [-1.428, 0.602], [-2.063, 0.493], [-2.698, 0.424], [-3.015, 0.423], [-4.92, 0.251]],
    bottom: [[4.92, -0.037], [4.603, -0.186], [4.285, -0.275], [3.968, -0.453], [3.65, -0.586], [3.333, -0.691], [3.015, -0.751], [2.698, -0.914], [2.381, -0.736], [1.746, -0.78], [1.428, -1.024], [1.111, -1.033], [0.794, -0.988], [0.476, -0.884], [0.159, -0.691], [-1.111, -0.617], [-2.063, -0.513], [-2.381, -0.572], [-2.698, -0.557], [-3.333, -0.587], [-3.65, -0.498], [-3.968, -0.491], [-4.285, -0.427], [-4.603, -0.349], [-4.92, 0.201]],
    plan: [[4.92, 0.036], [4.603, 0.204], [4.285, 0.277], [3.968, 0.518], [3.65, 0.539], [3.333, 0.496], [3.015, 0.532], [2.698, 0.475], [0.476, 0.931], [0.159, 0.914], [-0.159, 0.615], [-0.476, 0.488], [-0.794, 0.445], [-2.063, 0.365], [-2.698, 0.307], [-3.333, 0.235], [-4.603, 0.0], [-4.92, 0.0]],
    wing: [[2.807, 0.0], [2.807, 1.354], [2.784, 1.795], [2.67, 2.915], [2.624, 3.474], [2.456, 5.397], [2.281, 5.738], [1.96, 6.08], [1.808, 6.095], [1.655, 6.08], [1.22, 5.738], [1.068, 5.397], [0.45, 1.982], [0.359, 1.169], [0.275, 1.111], [0.252, 1.064], [0.252, 0.0]],
    tail: [[-2.792, 0.0], [-2.799, 0.292], [-3.204, 0.315], [-3.372, 1.273], [-3.425, 1.418], [-3.539, 1.566], [-3.799, 1.715], [-3.89, 1.73], [-3.982, 1.715], [-4.188, 1.566], [-4.302, 1.418], [-4.409, 1.133], [-4.439, 1.0], [-4.424, 0.874], [-4.462, 0.354], [-4.447, 0.315], [-4.356, 0.284], [-4.356, 0.0]],
    fin: [[-3.01, 0.424], [-3.069, 0.557], [-3.114, 0.587], [-3.396, 1.003], [-3.634, 1.256], [-3.827, 1.405], [-3.946, 1.42], [-3.976, 1.494], [-4.125, 1.524], [-4.259, 1.524], [-4.392, 1.479], [-4.526, 1.39], [-4.615, 1.286], [-4.69, 1.152], [-4.794, 0.87], [-4.838, 0.602], [-4.868, 0.602], [-4.913, 0.498]],
    canopy: [[1.955, 0.572], [1.807, 0.718], [1.66, 0.864], [1.513, 0.884], [1.365, 0.884], [1.218, 0.87], [1.071, 0.87], [0.924, 0.87], [0.776, 0.87], [0.629, 0.855], [0.482, 0.855], [0.334, 0.84]],
    wingZ: -0.601, dihedral: 3.15, tailZ: 0.286,
    section: [[-1, 0.65], [-0.9, 0.65], [-0.7, 0.67], [-0.3, 0.83], [-0.1, 0.83], [0.1, 0.83], [0.3, 1.0], [0.5, 0.65], [0.7, 0.44], [0.9, 0.35], [1, 0.35]], frontW: 0.625,
  },
  // FM 30-30 (1943), sheet "Zeke" (A6M2).
  'a6m-zero': {
    top: [[4.53, 0.065], [4.238, 0.179], [3.945, 0.582], [3.361, 0.653], [2.776, 0.668], [2.192, 0.725], [1.9, 0.902], [-0.438, 0.642], [-1.023, 0.61], [-2.192, 0.495], [-2.776, 0.473], [-4.53, 0.072]],
    bottom: [[4.53, -0.05], [4.238, -0.151], [3.945, -0.61], [3.653, -0.61], [3.069, -0.739], [2.776, -0.673], [2.484, -0.553], [2.192, -0.567], [1.9, -0.682], [1.023, -0.682], [0.731, -0.538], [0.438, -0.553], [-0.438, -0.51], [-1.9, -0.38], [-3.653, -0.151], [-4.53, 0.022]],
    plan: [[4.53, 0.0], [4.238, 0.178], [3.945, 0.554], [3.653, 0.582], [3.069, 0.582], [2.776, 0.662], [0.438, 0.694], [0.146, 0.558], [-0.146, 0.489], [-1.9, 0.293], [-2.484, 0.27], [-3.653, 0.114], [-4.53, 0.014]],
    wing: [[2.858, 0.0], [2.858, 0.752], [2.605, 2.967], [2.41, 5.273], [2.337, 5.629], [1.997, 5.986], [1.863, 6.0], [1.73, 5.986], [1.31, 5.629], [1.201, 5.273], [1.042, 4.574], [0.362, 0.861], [0.347, 0.0]],
    tail: [[-2.214, 0.0], [-2.214, 0.34], [-2.468, 0.937], [-2.844, 1.974], [-3.039, 2.166], [-3.144, 2.18], [-3.249, 2.166], [-3.379, 1.974], [-3.423, 1.784], [-3.604, 0.37], [-3.604, 0.0]],
    fin: [[-2.556, 0.524], [-2.671, 0.668], [-2.8, 0.826], [-2.929, 0.998], [-3.202, 1.429], [-3.36, 1.572], [-3.532, 1.716], [-3.819, 1.73], [-4.006, 1.558], [-4.106, 1.242], [-4.221, 0.739], [-4.293, 0.366], [-4.422, 0.122], [-4.523, 0.065]],
    canopy: [[1.924, 0.912], [1.707, 0.999], [1.491, 1.041], [1.274, 1.027], [1.057, 1.027], [0.841, 0.984], [0.624, 0.94], [0.407, 0.897], [0.191, 0.84], [-0.026, 0.826], [-0.243, 0.653], [-0.459, 0.639]],
    wingZ: -0.386, dihedral: 4.38, tailZ: 0.172,
    section: [[-1, 0.25], [-0.9, 0.25], [-0.7, 0.39], [-0.3, 0.97], [-0.1, 1.0], [0.1, 1.0], [0.3, 0.84], [0.5, 0.71], [0.7, 0.56], [0.9, 0.46], [1, 0.46]], frontW: 0.588,
  },
  // FM 30-30 (1943), sheet "Typhoon" (IB, car-door hood); the tail's end taken under the rudder.
  'typhoon': {
    top: [[4.865, 0.023], [4.551, 0.268], [3.923, 0.486], [3.61, 0.533], [2.982, 0.579], [2.04, 0.61], [1.726, 0.645], [0.785, 0.89], [0.471, 0.873], [-0.785, 0.656], [-1.412, 0.486], [-1.726, 0.502], [-2.668, 0.456], [-2.982, 0.456], [-4.865, 0.3]],
    bottom: [[4.865, 0.008], [4.551, -0.268], [4.237, -0.378], [3.923, -1.073], [3.296, -1.087], [2.982, -1.051], [2.354, -0.873], [1.726, -0.903], [1.412, -0.888], [-2.982, -0.44], [-3.296, -0.457], [-3.61, -0.378], [-3.923, -0.44], [-4.237, -0.456], [-4.551, -0.363], [-4.865, 0.05]],
    plan: [[4.865, 0.0], [4.551, 0.273], [4.237, 0.402], [3.923, 0.48], [3.61, 0.611], [3.296, 0.634], [2.982, 0.716], [0.785, 0.809], [0.471, 0.731], [0.157, 0.487], [-0.785, 0.41], [-1.099, 0.402], [-2.668, 0.271], [-2.982, 0.272], [-4.237, 0.092], [-4.551, 0.062], [-4.865, 0.0]],
    wing: [[3.251, 0.0], [3.251, 0.898], [3.148, 2.104], [3.03, 4.155], [2.911, 5.58], [2.816, 5.949], [2.342, 6.32], [2.128, 6.335], [1.914, 6.32], [1.471, 5.949], [1.353, 5.58], [1.147, 4.155], [0.886, 2.611], [0.759, 1.677], [0.57, 0.898], [0.57, 0.0]],
    tail: [[-2.872, 0.0], [-2.872, 0.346], [-2.911, 0.454], [-3.061, 1.639], [-3.125, 1.812], [-3.322, 1.988], [-3.473, 2.003], [-3.623, 1.988], [-3.789, 1.812], [-3.9, 1.639], [-4.201, 0.346], [-4.201, 0.0]],
    fin: [[-3.127, 0.486], [-3.359, 0.888], [-3.39, 0.981], [-3.575, 1.243], [-3.9, 1.552], [-4.116, 1.629], [-4.379, 1.629], [-4.548, 1.537], [-4.626, 1.46], [-4.78, 1.181], [-4.842, 0.95], [-4.857, 0.78]],
    canopy: [[1.799, 0.626], [1.702, 0.722], [1.606, 0.804], [1.509, 0.87], [1.412, 0.903], [1.315, 0.919], [1.218, 0.919], [1.121, 0.934], [1.024, 0.934], [0.927, 0.919], [0.83, 0.903], [0.734, 0.903]],
    wingZ: -0.852, dihedral: 5.49, tailZ: 0.194,
    section: [[-1, 0.83], [-0.5, 0.83], [-0.3, 0.84], [-0.1, 0.87], [0.1, 1.0], [0.3, 0.7], [0.5, 0.55], [0.7, 0.43], [0.9, 0.3], [1, 0.3]], frontW: 0.634,
  },
  // Journal of Recognition, Sept. 1944, sheet "Tempest V"; its bubble is drawn as open line work, so the hood is the generic bubble.
  'tempest-v': {
    top: [[5.13, 0.05], [4.799, 0.3], [4.468, 0.416], [4.137, 0.5], [2.813, 0.583], [1.489, 0.596], [1.158, 0.533], [-0.496, 0.55], [-2.482, 0.4], [-2.813, 0.406], [-5.13, 0.083]],
    bottom: [[5.13, -0.033], [4.799, -0.3], [4.468, -0.383], [4.137, -1.133], [3.806, -1.133], [3.144, -1.083], [2.813, -0.883], [2.482, -0.899], [2.151, -0.883], [0.496, -0.894], [0.165, -0.849], [-0.496, -0.816], [-3.475, -0.5], [-4.137, -0.45], [-4.468, -0.5], [-4.799, -0.433], [-5.13, 0.033]],
    plan: [[5.13, 0.0], [4.799, 0.34], [4.468, 0.425], [4.137, 0.595], [3.806, 0.638], [3.475, 0.629], [0.496, 0.706], [0.165, 0.689], [-0.165, 0.489], [-1.489, 0.451], [-2.813, 0.331], [-4.468, 0.247], [-4.799, 0.0], [-5.13, 0.0]],
    wing: [[3.021, 0.0], [3.012, 1.996], [3.029, 2.505], [3.012, 3.083], [2.943, 4.404], [2.804, 5.86], [2.639, 6.233], [2.179, 6.25], [1.719, 6.233], [1.38, 5.86], [1.007, 5.122], [0.877, 4.759], [0.59, 3.72], [0.408, 2.786], [0.286, 1.771], [0.217, 0.886], [0.148, 0.771], [0.148, 0.0]],
    tail: [[-2.647, 0.0], [-2.656, 0.437], [-3.073, 0.511], [-3.229, 1.709], [-3.325, 1.909], [-3.298, 2.114], [-3.559, 2.321], [-3.724, 2.338], [-3.889, 2.321], [-4.149, 2.114], [-4.158, 1.909], [-4.245, 1.709], [-4.331, 1.331], [-4.427, 0.511], [-4.444, 0.437], [-4.522, 0.351], [-4.522, 0.0]],
    fin: [[-2.623, 0.433], [-3.056, 0.616], [-3.389, 0.833], [-3.623, 1.049], [-3.922, 1.449], [-4.072, 1.599], [-4.272, 1.699], [-4.455, 1.699], [-4.505, 1.649], [-4.589, 1.649], [-4.672, 1.616], [-4.805, 1.516], [-4.922, 1.366], [-4.988, 1.249], [-5.072, 1.016], [-5.105, 0.866], [-5.122, 0.466]],
    wingZ: -1.049, dihedral: 6.23, tailZ: 0.091,
    section: [[-1, 1.0], [-0.9, 1.0], [-0.3, 0.94], [-0.1, 0.95], [0.1, 0.97], [0.3, 0.96], [0.5, 0.8], [0.7, 0.64], [0.9, 0.54], [1, 0.54]], frontW: 0.63,
  },
  // Journal of Recognition, Sept. 1943, sheet "Tony, Type 3 SSF" (provisional).
  'ki-61': {
    top: [[4.47, 0.102], [4.182, 0.305], [3.893, 0.339], [3.605, 0.542], [3.316, 0.635], [2.74, 0.711], [1.586, 0.755], [0.721, 0.83], [0.433, 0.982], [-0.144, 0.914], [-0.433, 0.847], [-0.721, 0.83], [-2.163, 0.643], [-2.451, 0.643], [-2.74, 0.61], [-3.028, 0.638], [-4.47, 0.211]],
    bottom: [[4.47, -0.102], [4.182, -0.271], [3.893, -0.305], [3.316, -0.567], [2.74, -0.658], [2.163, -0.677], [1.875, -0.711], [1.009, -0.643], [0.721, -0.643], [0.433, -0.88], [0.144, -0.948], [-0.144, -0.948], [-0.433, -0.914], [-0.721, -0.813], [-1.009, -0.542], [-1.875, -0.44], [-2.163, -0.372], [-3.605, -0.203], [-3.893, -0.097], [-4.182, -0.102], [-4.47, 0.161]],
    plan: [[4.47, 0.0], [4.182, 0.262], [3.893, 0.295], [3.605, 0.393], [3.316, 0.443], [3.028, 0.447], [2.451, 0.443], [0.144, 0.345], [-0.433, 0.361], [-0.721, 0.344], [-1.009, 0.273], [-1.298, 0.328], [-1.586, 0.311], [-1.875, 0.279], [-2.451, 0.246], [-3.316, 0.15], [-4.182, 0.023], [-4.47, 0.0]],
    wing: [[3.096, 0.0], [3.096, 0.478], [3.063, 0.53], [2.424, 0.594], [2.34, 1.283], [2.206, 3.135], [2.054, 4.516], [1.987, 5.631], [1.777, 6.008], [1.659, 6.016], [1.542, 6.008], [0.828, 5.631], [0.71, 5.255], [0.508, 3.464], [0.395, 2.819], [0.374, 2.518], [0.122, 0.797], [0.122, 0.683], [-0.034, 0.491], [-0.034, 0.0]],
    tail: [[-3.0, 0.0], [-3.0, 0.177], [-3.222, 0.216], [-3.239, 0.414], [-3.424, 0.905], [-3.626, 1.576], [-3.726, 1.758], [-3.794, 1.943], [-3.945, 1.951], [-4.096, 1.943], [-4.231, 1.758], [-4.315, 1.06], [-4.315, 0.761], [-4.348, 0.514], [-4.348, 0.414], [-4.315, 0.33], [-4.046, 0.177], [-4.046, 0.0]],
    fin: [[-3.01, 0.643], [-3.086, 0.745], [-3.187, 0.982], [-3.247, 1.05], [-3.289, 1.219], [-3.357, 1.355], [-3.416, 1.422], [-3.458, 1.524], [-3.518, 1.592], [-3.56, 1.659], [-3.628, 1.693], [-4.059, 1.693], [-4.127, 1.659], [-4.195, 1.592], [-4.237, 1.524], [-4.296, 1.439], [-4.339, 1.211], [-4.373, 1.05], [-4.407, 0.847], [-4.44, 0.44], [-4.466, 0.415]],
    canopy: [[1.63, 0.745], [1.529, 0.847], [1.428, 0.914], [1.327, 1.016], [1.226, 1.05], [1.126, 1.05], [1.025, 1.05], [0.924, 1.016], [0.823, 1.016], [0.722, 1.016], [0.621, 1.016], [0.521, 1.007]],
    wingZ: -0.413, dihedral: 4.8,
    section: [[-1, 0.55], [-0.7, 0.55], [-0.5, 0.76], [-0.3, 0.91], [-0.1, 1.0], [0.1, 1.0], [0.3, 0.97], [0.5, 0.89], [0.7, 0.57], [1, 0.57]], frontW: 0.459,
  },
  // Journal of Recognition, May 1944, sheet "Frank 1".
  'ki-84': {
    top: [[4.96, 0.027], [4.64, 0.226], [4.32, 0.578], [4.0, 0.605], [3.68, 0.691], [1.76, 0.785], [0.48, 1.013], [0.16, 0.987], [-0.16, 0.847], [-0.48, 0.667], [-1.44, 0.636], [-3.04, 0.542], [-3.36, 0.556], [-4.96, 0.382]],
    bottom: [[4.96, -0.043], [4.64, -0.215], [4.32, -0.562], [4.0, -0.66], [3.68, -0.683], [3.36, -0.777], [3.04, -0.71], [2.4, -0.738], [1.44, -0.73], [0.48, -0.636], [0.16, -0.648], [-0.48, -0.605], [-1.44, -0.5], [-3.36, -0.23], [-4.64, 0.016], [-4.96, 0.332]],
    plan: [[4.96, 0.0], [4.64, 0.219], [4.32, 0.583], [4.0, 0.629], [3.04, 0.631], [0.8, 0.687], [0.48, 0.677], [0.16, 0.458], [-2.72, 0.242], [-4.64, 0.059], [-4.96, 0.0]],
    wing: [[2.937, 0.0], [2.925, 1.641], [2.892, 2.295], [2.913, 2.545], [2.88, 4.954], [2.851, 5.284], [2.49, 5.616], [2.33, 5.624], [2.17, 5.616], [1.473, 5.284], [1.317, 4.954], [1.136, 3.987], [1.038, 3.677], [0.981, 3.377], [0.968, 3.088], [0.533, 0.852], [0.521, 0.0]],
    tail: [[-2.306, 0.0], [-2.306, 0.265], [-2.691, 0.276], [-2.699, 0.364], [-3.167, 1.866], [-3.257, 2.075], [-3.413, 2.286], [-3.495, 2.294], [-3.577, 2.286], [-3.778, 2.075], [-3.861, 1.866], [-4.033, 0.536], [-4.033, 0.364], [-3.947, 0.265], [-3.947, 0.0]],
    fin: [[-3.13, 0.581], [-3.208, 0.652], [-3.668, 1.292], [-3.793, 1.409], [-3.988, 1.502], [-4.316, 1.518], [-4.433, 1.479], [-4.542, 1.393], [-4.644, 1.284], [-4.722, 1.151], [-4.8, 1.089], [-4.831, 0.972], [-4.855, 0.956], [-4.956, 0.425]],
    canopy: [[1.764, 0.784], [1.633, 0.916], [1.501, 1.031], [1.37, 1.104], [1.239, 1.128], [1.108, 1.136], [0.976, 1.136], [0.845, 1.136], [0.714, 1.136], [0.583, 1.112], [0.451, 1.097], [0.32, 1.042]],
    wingZ: -0.467, dihedral: 5.57, tailZ: 0.519,
    section: [[-1, 0.34], [-0.9, 0.34], [-0.5, 0.83], [-0.3, 0.86], [-0.1, 1.0], [0.1, 0.86], [0.3, 0.81], [0.5, 0.62], [0.7, 0.46], [0.9, 0.32], [1, 0.32]], frontW: 0.725,
  },
  // Journal of Recognition, May 1944, sheet "George 11" (N1K1-J; the N1K2 alike in outline); the deck run under the hood.
  'n1k2': {
    top: [[4.69, 0.017], [4.387, 0.248], [4.085, 0.251], [3.782, 0.599], [3.48, 0.684], [2.572, 0.836], [1.664, 0.917], [0.454, 0.89], [-0.454, 0.87], [-2.269, 0.794], [-2.572, 0.802], [-2.875, 0.772], [-4.69, 0.354]],
    bottom: [[4.69, -0.042], [4.387, -0.27], [4.085, -0.318], [3.782, -0.743], [3.48, -0.768], [2.875, -0.768], [2.572, -0.819], [2.269, -0.751], [1.362, -0.743], [-0.454, -0.652], [-0.756, -0.726], [-1.059, -0.616], [-1.664, -0.573], [-2.875, -0.418], [-4.085, -0.194], [-4.387, -0.084], [-4.69, 0.304]],
    plan: [[4.69, 0.0], [4.387, 0.241], [4.085, 0.266], [3.782, 0.555], [3.48, 0.655], [2.875, 0.717], [0.151, 0.927], [-0.454, 0.715], [-0.756, 0.625], [-1.059, 0.557], [-1.362, 0.523], [-2.572, 0.437], [-2.875, 0.396], [-3.177, 0.35], [-4.387, 0.092], [-4.69, 0.008]],
    wing: [[2.609, 0.0], [2.614, 1.195], [2.302, 5.313], [2.204, 5.651], [1.748, 5.991], [1.659, 5.999], [1.569, 5.991], [1.015, 5.651], [0.883, 5.313], [0.064, 1.022], [0.064, 0.0]],
    tail: [[-3.074, 0.0], [-3.078, 0.492], [-3.594, 1.872], [-3.68, 2.064], [-3.859, 2.258], [-3.974, 2.267], [-4.089, 2.258], [-4.289, 2.064], [-4.34, 1.872], [-4.532, 0.401], [-4.532, 0.0]],
    fin: [[-2.634, 0.827], [-2.803, 1.013], [-3.571, 2.009], [-3.698, 2.085], [-3.766, 2.085], [-3.791, 2.111], [-3.985, 2.111], [-4.145, 2.018], [-4.272, 1.824], [-4.34, 1.537], [-4.382, 1.461], [-4.568, 0.751], [-4.686, 0.397]],
    canopy: [[1.68, 0.912], [1.589, 1.012], [1.497, 1.072], [1.406, 1.131], [1.315, 1.182], [1.223, 1.233], [1.132, 1.274], [1.041, 1.292], [0.949, 1.3], [0.858, 1.3], [0.767, 1.292], [0.675, 1.266]],
    wingZ: -0.052, dihedral: 5.36, tailZ: 0.617,
    section: [[-1, 0.42], [-0.9, 0.42], [-0.7, 0.74], [-0.5, 0.93], [-0.3, 1.0], [-0.1, 1.0], [0.1, 0.97], [0.3, 0.89], [0.5, 0.64], [0.7, 0.42], [0.9, 0.36], [1, 0.36]], frontW: 0.701,
  },
  // Journal of Recognition, May 1945, sheet "Tojo".
  'ki-44': {
    top: [[4.42, 0.019], [4.135, 0.184], [3.85, 0.453], [3.565, 0.575], [3.279, 0.643], [2.709, 0.658], [1.854, 0.643], [1.568, 0.786], [1.283, 0.77], [0.428, 0.536], [-0.143, 0.537], [-2.709, 0.244], [-2.994, 0.274], [-4.42, 0.264]],
    bottom: [[4.42, -0.019], [4.135, -0.18], [3.85, -0.473], [3.565, -0.615], [2.994, -0.718], [2.139, -0.733], [1.854, -0.77], [1.283, -0.77], [0.713, -0.755], [0.428, -0.725], [0.143, -0.74], [-0.713, -0.688], [-4.135, -0.312], [-4.42, 0.214]],
    plan: [[4.42, 0.019], [4.135, 0.185], [3.85, 0.477], [3.565, 0.624], [3.279, 0.643], [2.994, 0.636], [2.709, 0.657], [0.428, 0.611], [0.143, 0.447], [-0.713, 0.383], [-2.139, 0.242], [-2.424, 0.242], [-3.565, 0.098], [-3.85, 0.076], [-4.135, 0.0], [-4.42, 0.0]],
    wing: [[2.722, 0.0], [2.722, 0.711], [2.663, 0.795], [2.573, 1.043], [2.538, 1.295], [2.401, 4.175], [2.362, 4.448], [2.089, 4.721], [1.974, 4.729], [1.859, 4.721], [1.468, 4.448], [1.3, 4.175], [0.925, 2.876], [0.582, 1.445], [0.461, 0.72], [0.461, 0.0]],
    tail: [[-2.276, 0.0], [-2.284, 0.314], [-2.682, 1.449], [-2.831, 1.755], [-2.936, 1.763], [-3.042, 1.755], [-3.178, 1.601], [-3.268, 1.3], [-3.362, 0.66], [-3.362, 0.409], [-3.288, 0.282], [-3.288, 0.0]],
    fin: [[-2.913, 0.274], [-3.627, 0.958], [-3.755, 1.019], [-3.92, 1.019], [-4.04, 0.951], [-4.146, 0.831], [-4.416, 0.237]],
    canopy: [[1.424, 0.808], [1.327, 0.883], [1.229, 0.958], [1.131, 0.958], [1.034, 0.951], [0.936, 0.951], [0.838, 0.928], [0.74, 0.913], [0.643, 0.883], [0.545, 0.861], [0.447, 0.816], [0.35, 0.515]],
    wingZ: -0.487, dihedral: 4.31, tailZ: 0.102,
    section: [[-1, 0.2], [-0.9, 0.2], [-0.7, 0.69], [-0.3, 0.98], [-0.1, 0.98], [0.1, 1.0], [0.3, 0.97], [0.5, 0.89], [0.7, 0.75], [0.9, 0.47], [1, 0.47]], frontW: 0.683,
  },
  // FM 30-30 (1943), sheet "P-40" (Tomahawk / Kittyhawk; the E's outline), the chin radiator in the body's line.
  'p-40e': {
    top: [[4.83, -0.007], [4.518, 0.209], [4.207, 0.354], [3.584, 0.478], [3.272, 0.505], [1.714, 0.532], [-0.467, 0.847], [-0.779, 0.869], [-2.337, 0.734], [-2.96, 0.653], [-3.272, 0.672], [-4.83, 0.515]],
    bottom: [[4.83, -0.034], [4.207, -0.273], [3.895, -0.773], [3.584, -0.882], [3.272, -0.923], [2.337, -0.909], [1.714, -0.829], [0.779, -0.842], [-0.467, -0.788], [-1.091, -0.707], [-1.402, -0.519], [-4.207, -0.071], [-4.518, 0.025], [-4.83, 0.465]],
    plan: [[4.83, 0.021], [4.518, 0.232], [4.207, 0.358], [3.895, 0.461], [3.272, 0.523], [2.337, 0.523], [-0.467, 0.682], [-1.091, 0.41], [-1.714, 0.372], [-2.649, 0.282], [-2.96, 0.261], [-3.272, 0.262], [-4.518, 0.078], [-4.83, 0.021]],
    wing: [[2.041, 0.0], [2.041, 0.846], [2.109, 1.028], [2.006, 1.296], [1.965, 1.85], [1.896, 4.024], [1.828, 5.34], [1.457, 5.676], [1.285, 5.69], [1.113, 5.676], [0.687, 5.34], [0.515, 5.005], [0.337, 4.345], [0.199, 3.711], [0.089, 3.407], [0.048, 3.113], [-0.515, 0.926], [-0.55, 0.755], [-0.55, 0.0]],
    tail: [[-3.133, 0.0], [-3.14, 0.34], [-3.58, 1.573], [-3.662, 1.738], [-3.861, 1.906], [-3.964, 1.92], [-4.067, 1.906], [-4.328, 1.738], [-4.5, 1.411], [-4.617, 0.834], [-4.624, 0.519], [-4.541, 0.34], [-4.486, 0.305], [-4.486, 0.0]],
    fin: [[-3.058, 0.694], [-3.436, 1.233], [-3.57, 1.421], [-3.705, 1.57], [-3.88, 1.637], [-4.001, 1.637], [-4.15, 1.597], [-4.311, 1.489], [-4.473, 1.381], [-4.581, 1.233], [-4.675, 1.085], [-4.783, 0.842], [-4.823, 0.532]],
    canopy: [[1.455, 0.559], [1.259, 0.675], [1.063, 0.802], [0.867, 0.891], [0.671, 0.909], [0.475, 0.909], [0.279, 0.909], [0.083, 0.909], [-0.113, 0.909], [-0.309, 0.896], [-0.505, 0.896], [-0.701, 0.882]],
    wingZ: -0.575, dihedral: 6.49, tailZ: 0.505,
    section: [[-1, 0.72], [-0.9, 0.72], [-0.3, 0.94], [-0.1, 0.93], [0.1, 1.0], [0.3, 0.8], [0.5, 0.66], [0.7, 0.55], [0.9, 0.39], [1, 0.39]], frontW: 0.541,
  },
};
// FM 30-30 (1943), sheet "Junkers Ju. 87 Stuka" (a B): the spats and the extended tail wheel taken out of the body's
// bottom line (the builder draws the fixed gear where the side and head-on views put the spats), the leading edge run
// straight past the spats; the gull's bend and the tailplane's height from the head-on view, lined up with the side
// view by the radiator (its body is drawn shallower than the side view's); the wing's root on the body's underside.
DRAWN['ju-87-b'] = {
  top: [[5.55, 0.018], [5.192, 0.33], [4.834, 0.425], [3.402, 0.622], [3.044, 0.703], [2.685, 0.74], [2.327, 0.864], [1.969, 1.11], [1.611, 1.086], [-0.537, 0.684], [-0.895, 0.592], [-2.685, 0.481], [-3.044, 0.518], [-3.402, 0.62], [-5.55, 1.067]],
  bottom: [[5.55, -0.018], [5.192, -0.277], [4.834, -0.448], [4.476, -0.991], [3.76, -1.036], [3.402, -0.721], [3.044, -0.611], [2.4, -0.62], [1.6, -0.64], [0.895, -0.647], [0.537, -0.684], [0.179, -0.72], [-0.537, -0.55], [-1.253, -0.462], [-2.685, -0.351], [-3.044, -0.296], [-4.118, -0.222], [-4.8, -0.12], [-5.192, -0.05], [-5.55, 1.017]],
  plan: [[5.55, 0.0], [5.192, 0.306], [4.834, 0.384], [4.476, 0.549], [3.76, 0.577], [3.402, 0.65], [3.044, 0.549], [-0.537, 0.522], [-0.895, 0.586], [-1.253, 0.503], [-1.611, 0.485], [-2.685, 0.384], [-3.402, 0.302], [-3.76, 0.229], [-4.118, 0.216], [-4.834, 0.096], [-5.192, 0.082], [-5.55, 0.037]],
  wing: [[2.751, 0.0], [2.74, 1.114], [2.72, 2.003], [2.487, 6.453], [2.307, 6.882], [2.113, 6.9], [1.919, 6.882], [1.248, 6.453], [1.078, 6.025], [0.482, 4.376], [0.265, 3.614], [-0.236, 1.509], [-0.463, 0.826], [-0.463, 0.0]],
  tail: [[-3.81, 0.0], [-3.81, 0.287], [-3.858, 0.396], [-3.886, 0.587], [-3.858, 0.714], [-3.867, 2.292], [-3.943, 2.526], [-4.122, 2.544], [-4.302, 2.526], [-4.907, 2.292], [-4.907, 1.615], [-4.869, 1.21], [-4.869, 0.0]],
  fin: [[-3.265, 0.592], [-3.358, 0.629], [-3.432, 0.666], [-3.524, 0.758], [-3.58, 0.906], [-4.024, 1.72], [-4.153, 1.85], [-4.431, 1.868], [-4.708, 1.905], [-5.226, 1.942], [-5.374, 1.868], [-5.393, 1.72], [-5.467, 1.591], [-5.541, 1.276]],
  canopy: [[1.841, 1.128], [1.632, 1.128], [1.424, 1.128], [1.215, 1.147], [1.007, 1.128], [0.798, 1.135], [0.589, 1.147], [0.381, 1.147], [0.172, 1.165], [-0.036, 1.091], [-0.245, 0.912], [-0.453, 0.703]],
  wingZ: -0.4, dihedral: 8.3, tailZ: 0.47, gull: { at: 2.0, drop: 0.22 }, gear: { x: 2.45, side: 1.55, bottom: -2.25 },
};
/** A drawing at a sister's length: its forward positions scaled. */
function atLength(d: Drawn, k: number): Drawn {
  const s = (p?: P2[]): P2[] | undefined => p?.map(([x, v]) => [x * k, v] as P2);
  return { ...d, top: s(d.top)!, bottom: s(d.bottom)!, plan: s(d.plan)!, wing: s(d.wing)!, tail: s(d.tail), fin: s(d.fin), canopy: s(d.canopy), gear: d.gear && { ...d.gear, x: d.gear.x * k } };
}
// The Ju 87 D on the B's drawing at its own length (11.5 m against 11.1).
DRAWN['ju-87-d'] = atLength(DRAWN['ju-87-b'], 11.5 / 11.1);
DRAWN['il-2-1941'] = { ...DRAWN['il-2'],canopy: [[2.109, 0.57], [1.954, 1.121], [1.6, 1.121], [1.3, 1.121], [1.1, 1.0], [1.0, 0.75]], razor: true };
// BuAer's A2D-1 Standard Aircraft Characteristics three-view (1950), its outline read by hand station by station (the
// line drawing does not fill into closed views): heights over its thrust line through the spinner, at the drawing's
// own 50 ft span (its length then comes out at the published 12.55 m). The slim gearbox nose behind the propellers,
// the deep body over the wing's root fairing, the big root fillet, the 20 ft 2 in tailplane, the square-topped fin.
DRAWN['a2d'] = {
  top: [[6.275, 0.02], [6.16, 0.23], [6.09, 0.29], [5.6, 0.42], [4.95, 0.55], [4.79, 0.69], [4.65, 0.77], [4.36, 0.93], [4.22, 1.0], [4.02, 1.04], [2.25, 1.04], [1.08, 1.1], [-0.63, 1.14], [-1.37, 1.16], [-2.1, 1.2], [-2.84, 1.27], [-3.6, 1.3], [-5.2, 0.95], [-6.275, 0.06]],
  bottom: [[6.275, -0.02], [6.16, -0.22], [6.09, -0.27], [5.6, -0.4], [4.95, -0.64], [4.65, -0.7], [4.36, -0.75], [4.02, -0.82], [3.78, -0.88], [3.41, -0.92], [3.04, -0.98], [1.57, -1.0], [-2.1, -1.0], [-2.84, -0.96], [-3.57, -0.93], [-4.31, -0.88], [-4.68, -0.81], [-5.05, -0.73], [-5.41, -0.69], [-5.78, -0.62], [-6.15, -0.52], [-6.275, -0.43]],
  plan: [[6.275, 0], [6.2, 0.17], [6.1, 0.26], [6.0, 0.34], [5.6, 0.33], [5.0, 0.4], [4.8, 0.6], [4.68, 0.68], [4.07, 0.72], [0.09, 0.72], [-0.52, 0.68], [-1.14, 0.61], [-1.75, 0.54], [-2.36, 0.47], [-2.97, 0.39], [-3.59, 0.32], [-4.2, 0.25], [-4.81, 0.14], [-5.42, 0.05], [-6.275, 0]],
  wing: [[3.335, 0], [3.335, 0.72], [2.97, 0.8], [2.6, 1.1], [2.355, 1.59], [2.233, 2.45], [1.779, 7.35], [1.706, 7.47], [1.595, 7.53], [1.388, 7.6], [1.13, 7.62], [0.885, 7.6], [0.456, 7.53], [0.334, 7.47], [0.015, 7.35], [-0.107, 6.125], [-0.328, 3.675], [-0.499, 1.96], [-0.597, 0.8], [-0.634, 0.72], [-0.634, 0]],
  tail: [[-4.32, 0], [-4.32, 0.31], [-4.58, 1.23], [-4.92, 2.45], [-5.02, 2.82], [-5.2, 3.0], [-5.49, 3.08], [-5.73, 3.0], [-6.0, 2.82], [-6.07, 0.12], [-6.07, 0]],
  fin: [[-2.84, 1.27], [-3.57, 1.4], [-3.82, 1.41], [-4.31, 1.9], [-4.49, 2.88], [-4.61, 3.15], [-4.8, 3.25], [-5.78, 3.25], [-5.9, 3.06], [-6.02, 1.9], [-6.14, 0.8], [-6.27, 0.06]],
  canopy: [[4.02, 1.04], [3.65, 1.35], [3.29, 1.47], [2.8, 1.53], [2.43, 1.51], [2.0, 1.25], [1.7, 1.1]],
  wingZ: -0.82, dihedral: 4.8, tailZ: 0.83,
};

// Bf 109 E: the square-tipped wing. From the Me 109 F's drawing with the E's square tips (DRAWN); its small oil cooler under the nose (estimate).
A['bf-109-e'] = piston({ cls: 'ww2-fighter', length: 8.64, span: 9.87, height: 2.5, w: 0.45, h: 0.58, wing: 'square', le: 1.3, root: 2.15, tip: 1.2, sweep: 3, fin: 1.2, finRoot: 1.25, roundFin: true, tailSpan: 3.0, tailRoot: 0.9, canopy: { x: 0.5, length: 1.6, kind: 'framed' }, prop: 3.0, blades: 3, spinner: 0.28, rads: [0.9, 1.3, 1.1, 0.17], draw: DRAWN['bf-109-e'] });
A['bf-109-e'].bodies!.push({ top: [[3.2, -0.3], [2.5, -0.3]], bottom: [[3.2, -0.6], [3.0, -0.7], [2.7, -0.68], [2.5, -0.45]], plan: [[3.2, 0.12], [3.0, 0.16], [2.5, 0.08]], round: 3, stations: 6 });
// The E's strut under each tailplane half (the F dropped them), from the tailplane's front spar down to the body's
// side; drawn upright half way between its ends (estimate).
A['bf-109-e'].bodies!.push({ top: [[-2.95, 0.62], [-3.05, 0.62]], bottom: [[-2.95, 0.24], [-3.05, 0.24]], plan: [[-2.95, 0.025], [-3.05, 0.025]], side: 0.4, round: 4, stations: 2 });
// Fw 190 A: the big round radial cowl, a straight-tapered wing, a bulged bubble hood (9.0 x 10.5 x 3.95 m).
A['fw-190-a8'] = piston({ cls: 'ww2-fighter', length: 9.0, span: 10.5, height: 3.95, w: 0.62, h: 0.68, radial: true, wing: 'tapered', le: 1.6, root: 2.3, tip: 1.05, sweep: 5, fin: 1.25, finRoot: 1.3, roundFin: true, tailSpan: 3.65, tailRoot: 0.95, canopy: { x: 0.575, length: 2.15, kind: 'bubble' }, prop: 3.3, blades: 3, draw: DRAWN['fw-190-a8'] });
// Fw 190 D-9: the long annular-cowled inline nose and a stretched tail (10.19 m).
// Drawn from the Journal of Recognition's provisional three-view (DRAWN); the hood where that drawing has it.
A['fw-190-d9'] = piston({ cls: 'ww2-fighter', length: 10.19, span: 10.5, height: 3.36, w: 0.6, h: 0.66, radial: true, wing: 'tapered', le: 1.3, root: 2.3, tip: 1.05, sweep: 5, fin: 1.35, finRoot: 1.5, roundFin: true, tailSpan: 3.65, tailRoot: 0.95, canopy: { x: 0.37, length: 1.75, kind: 'bubble' }, prop: 3.5, blades: 3, draw: DRAWN['fw-190-d9'] });
// A6M Zero: a slim radial fighter, a long canopy, a wide round-tipped wing (9.06 x 12.0 x 3.05 m).
A['a6m-zero'] = piston({ cls: 'ww2-fighter', length: 9.06, span: 12.0, height: 3.05, w: 0.55, h: 0.6, radial: true, wing: 'round', le: 1.6, root: 2.5, tip: 1.1, sweep: 4, fin: 1.2, finRoot: 1.5, tailSpan: 4.8, tailRoot: 1.1, canopy: { x: -0.1, length: 2.4, kind: 'framed' }, prop: 2.9, blades: 3, draw: DRAWN['a6m-zero'] });
// F4U Corsair: the inverted gull wing, a very long nose with the cockpit far back (10.2 x 12.5 x 4.5 m).
export const F4U = { cls: 'ww2-fighter', length: 10.2, span: 12.5, height: 4.5, w: 0.65, h: 0.75, radial: true, wing: 'round' as const, le: 1.5, root: 2.7, tip: 1.3, sweep: 3, gull: true, mount: -0.9, dihedral: 9, fin: 1.6, finRoot: 1.6, roundFin: true, tailSpan: 5.1, tailRoot: 1.2, canopy: { x: -1.2, length: 1.8, kind: 'bubble' as const }, prop: 4.0, blades: 3 };
// Drawn from FM 30-30's F4U-1 (DRAWN): the rudder set forward of the projecting fuselage tip.
A['f4u-corsair'] = piston({ ...F4U, draw: DRAWN['f4u-corsair'] });
// Il-2: an armoured nose, a long two-seat canopy, a tapered wing with swept outer leading edges (11.6 x 14.6 x 4.2 m).
A['il-2'] = piston({ cls: 'ww2-attack', length: 11.6, span: 14.6, height: 4.2, w: 0.65, h: 0.8, wing: 'tapered', le: 1.8, root: 3.2, tip: 1.2, sweep: 12, fin: 1.4, finRoot: 1.7, roundFin: true, tailSpan: 4.6, tailRoot: 1.3, canopy: { x: 0.1, length: 2.8, kind: 'framed' }, prop: 3.6, blades: 3, scoop: [0.5, 1.6, 0.25], draw: DRAWN['il-2'] });
// Ju 87 Stuka: the inverted gull wing, the fixed spatted gear, the long greenhouse, a square fin (11.5 x 13.8 x 3.88 m).
// Il-2 mod. 1941: the first single-seater, its short hood on the armoured hump (11.6 x 14.6 x 4.2 m).
A['il-2-1941'] = piston({ cls: 'ww2-attack', length: 11.6, span: 14.6, height: 4.2, w: 0.65, h: 0.8, wing: 'tapered', le: 1.8, root: 3.2, tip: 1.2, sweep: 12, fin: 1.4, finRoot: 1.7, roundFin: true, tailSpan: 4.6, tailRoot: 1.3, canopy: { x: 0.6, length: 1.7, kind: 'framed' }, razor: true, prop: 3.6, blades: 3, scoop: [0.5, 1.6, 0.25], draw: DRAWN['il-2-1941'] });
const JU87: Piston = { cls: 'ww2-attack', length: 11.5, span: 13.8, height: 3.88, w: 0.6, h: 0.8, wing: 'square', le: 2.0, root: 2.8, tip: 1.3, sweep: 3, gull: true, mount: -0.9, dihedral: 8, fin: 1.6, finRoot: 1.8, tailSpan: 4.8, tailRoot: 1.2, canopy: { x: 0.6, length: 3.2, kind: 'framed' }, prop: 3.4, blades: 3, gear: true, spinner: 0.3 };
// The D (and the generic Stuka) on the B's drawing at the D's length; the B and R at their own (11.1 m); the D-5's
// longer outer panels (15.0 m span).
A['ju-87-stuka'] = piston({ ...JU87, draw: DRAWN['ju-87-d'] });
A['ju-87-d'] = { ...A['ju-87-stuka'] };
A['ju-87-b'] = piston({ ...JU87, length: 11.1, height: 4.01, draw: DRAWN['ju-87-b'] });
A['ju-87-d5'] = piston({ ...JU87, span: 15.0, draw: { ...DRAWN['ju-87-d'], wing: DRAWN['ju-87-d'].wing.map(([x, y]) => [x, y > 2.0 ? 2.0 + ((y - 2.0) * 5.5) / 4.9 : y] as P2) } });

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

// The jets once drawn here with jet() - F-104, F-84, F-8, Jaguar, Hunter, Meteor, Vampire, Buccaneer, Canberra, G.91,
// Saab 29, 32 and 35, Mystère, Étendard, He 162 - are outline figures with their variants in ./air-extra; the A-10,
// Su-25, MiG-15 and 17 and F-86 too (./air-extra, ./jet-attack). jet() stays for the jets of ./prop-variants.

// Grumman F4F Wildcat: a barrel radial fighter, mid wing with square tips (8.76 x 11.58 x 3.61 m); F8F Bearcat smaller with a bubble (8.61 x 10.92 x 4.21 m).
A['f4f-wildcat'] = piston({ cls: 'ww2-fighter', length: 8.76, span: 11.58, height: 3.61, w: 0.65, h: 0.75, radial: true, wing: 'square', le: 1.3, root: 2.4, tip: 1.3, sweep: 2, mount: 0, fin: 1.4, finRoot: 1.5, roundFin: true, tailSpan: 4.4, tailRoot: 1.1, canopy: { x: 0.6, length: 1.6, kind: 'framed' }, prop: 3.0, blades: 3 });
// The Bearcat's planform from the BuAer Standard Aircraft Characteristics three-view (F8F-2, 1949; sources.md), measured
// from the nose: the wing's leading edge 1.87 m behind it at the centre line, 2.40 m at the tips, the trailing edge
// 4.80 m to 3.57 m (chords 2.93 and 1.17 m, the published 244 sq ft); the cowl 1.38 m across; the tailplane 15 ft 9 in
// across, its chord about 1.0 m at the root. `le` stands the root's leading edge there after LE_FIX.
A['f8f-bearcat'] = piston({ cls: 'ww2-fighter', length: 8.61, span: 10.92, height: 4.21, w: 0.69, h: 0.75, radial: true, wing: 'square', le: 1.28, root: 2.93, tip: 1.17, sweep: 1, fin: 1.7, finRoot: 1.6, tailSpan: 4.8, tailRoot: 0.77, canopy: { x: 0.2, length: 1.6, kind: 'bubble' }, prop: 3.8, blades: 4 });
// TBF Avenger: a deep barrel fuselage, a long greenhouse with the ball turret (12.48 x 16.51 x 4.7 m); SB2C Helldiver,
// drawn as the most-built SB2C-3 to -5 with the four-bladed Curtiss propeller (11.18 x 15.16 x 4.0 m).
A['tbf-avenger'] = piston({ cls: 'ww2-attack', length: 12.48, span: 16.51, height: 4.7, w: 0.72, h: 1.0, cowl: 0.75, radial: true, wing: 'tapered', le: 1.8, root: 3.2, tip: 1.3, sweep: 3, mount: -0.4, fin: 2.0, finRoot: 2.0, tailSpan: 6.4, tailRoot: 1.6, canopy: { x: 0.9, length: 3.4, kind: 'framed' }, prop: 4.0, blades: 3 });
// The ball turret at the back of the greenhouse and the deep belly with the ventral gunner's step (estimates).
A['tbf-avenger'].bodies!.push({ top: [[-0.5, 0.9], [-0.85, 1.55], [-1.55, 1.55], [-1.9, 0.9]], bottom: [[-0.5, 0.5], [-1.9, 0.5]], plan: [[-0.5, 0.3], [-0.85, 0.5], [-1.55, 0.5], [-1.9, 0.3]], round: 2, stations: 6 }, { top: [[1.8, -0.6], [-2.8, -0.6]], bottom: [[1.8, -1.0], [1.0, -1.3], [-1.6, -1.3], [-2.8, -0.75]], plan: [[1.8, 0.45], [1.0, 0.55], [-1.6, 0.5], [-2.8, 0.25]], round: 3, stations: 8 });
A['sb2c-helldiver'] = piston({ cls: 'ww2-attack', length: 11.18, span: 15.16, height: 4.0, w: 0.7, h: 0.9, radial: true, wing: 'tapered', le: 1.6, root: 3.2, tip: 1.3, sweep: 3, fin: 2.0, finRoot: 2.0, tailSpan: 6.0, tailRoot: 1.4, canopy: { x: 0.4, length: 3.6, kind: 'framed' }, prop: 3.8, blades: 4 });
// Dewoitine D.520 (8.76 x 10.18 x 2.57 m) and Morane-Saulnier MS.406 (8.17 x 10.62 x 2.71 m).
A['d-520'] = piston({ cls: 'ww2-fighter', length: 8.76, span: 10.18, height: 2.57, w: 0.48, h: 0.6, wing: 'round', le: 1.2, root: 2.3, tip: 1.0, sweep: 3, fin: 1.3, finRoot: 1.3, roundFin: true, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.4, length: 1.6, kind: 'framed' }, prop: 3.0, blades: 3 });
A['ms-406'] = piston({ cls: 'ww2-fighter', length: 8.17, span: 10.62, height: 2.71, w: 0.5, h: 0.62, wing: 'round', le: 1.2, root: 2.4, tip: 1.1, sweep: 4, fin: 1.3, finRoot: 1.3, roundFin: true, tailSpan: 3.6, tailRoot: 0.9, canopy: { x: 0.0, length: 2.0, kind: 'framed' }, prop: 3.0, blades: 3 });
// Fiat G.55 / Macchi C.200 / Reggiane Re.2001 class Italian fighters share the MC.202 look; P-36 / Hawk 75 a radial with a long canopy (8.69 x 11.38 x 2.82 m).
A['p-36'] = piston({ cls: 'ww2-fighter', length: 8.69, span: 11.38, height: 2.82, w: 0.6, h: 0.7, radial: true, wing: 'round', le: 1.4, root: 2.6, tip: 1.2, sweep: 3, fin: 1.4, finRoot: 1.4, roundFin: true, tailSpan: 4.0, tailRoot: 1.0, canopy: { x: 0.0, length: 2.0, kind: 'framed' }, prop: 3.0, blades: 3 });

// The wings' thickness at the root as a share of the chord, from the published root sections (D. Lednicer, The Incomplete
// Guide to Airfoil Usage): Spitfire NACA 2213, Bf 109 NACA 2R1 14.2, Fw 190 and Ta 152 NACA 23015.3, Mustang NAA/NACA 45-100
// (15.1 %), Corsair, Wildcat and Avenger NACA 23015, Hellcat NACA 23015.6, Zero NACA 2315, Yak-1 and Yak-3 Clark YH 14 %, Il-2
// Clark YH 14 %, Tempest NACA 22 14.5, Typhoon NACA 22 19.5, Dauntless NACA 2415, B-25 NACA 23017, B-24 Davis 22 %, B-29
// Boeing 117 22 %, Lancaster NACA 23018, B-17 NACA 0018, A-20 NACA 23018, Helldiver NACA 23017, C-47 and Li-2 NACA 2215, Halifax
// NACA 23021, MiG-3 Clark YH 14 %, LaGG-3 and La-5 NACA 23016, Bf 110 NACA 2R1 14.2, A-26 NACA 65,2-215. The tips thin to three
// quarters of it.
const ROOT_TC: [string, number][] = [['spitfire-mk-ix', 0.13], ['spitfire-mk-v', 0.13], ['spitfire-mk-xiv', 0.13], ['bf-109-e', 0.142], ['bf-109-g6', 0.142], ['bf-109-k4', 0.142], ['fw-190-a8', 0.153], ['fw-190-d9', 0.153], ['ta-152h', 0.153], ['p-51b', 0.151], ['p-51d-mustang', 0.151], ['f4u-corsair', 0.15], ['f6f-hellcat', 0.156], ['f4f-wildcat', 0.15], ['a6m-zero', 0.15], ['yak-3', 0.14], ['yak-1b', 0.14], ['il-2', 0.14], ['il-2-1941', 0.14], ['tempest-v', 0.145], ['typhoon', 0.195], ['sbd-dauntless', 0.15], ['tbf-avenger', 0.15], ['b-25h', 0.17], ['b-25', 0.17], ['b-24', 0.22], ['b-29', 0.22], ['lancaster', 0.18], ['b-17e', 0.18], ['a-20g', 0.18], ['sb2c-helldiver', 0.17], ['c-47', 0.15], ['li-2', 0.15], ['halifax', 0.21], ['mig-3', 0.14], ['lagg-3', 0.16], ['la-5', 0.16], ['bf-110g', 0.142], ['a-26c', 0.15]];
for (const [k, r] of ROOT_TC) if (A[k]?.wing) A[k]!.wing.thicknessRatio = r;

export const AIRCRAFT: SpecSet = { air: A };
