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
import { cowlLip, hood, type FixedWingSpec } from '../air';
import type { Outline, P2 } from '../parts';
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
  // The cockpit's glasshouse standing on the deck, the nose, mid-upper and tail turrets (estimates).
  glass: [
    { top: [[7.1, 1.15], [6.6, 1.95], [5.0, 2.0], [4.3, 1.55]], bottom: [[7.1, 0.9], [4.3, 0.9]], plan: [[7.1, 0.35], [6.6, 0.6], [5.0, 0.6], [4.3, 0.45]], round: 2.4, stations: 8 },
    { top: [[11.05, -0.15], [10.85, 0.35], [10.3, 0.45], [9.9, 0.2]], bottom: [[11.05, -0.25], [10.85, -0.75], [10.3, -0.85], [9.9, -0.5]], plan: [[11.05, 0.1], [10.85, 0.5], [10.3, 0.55], [9.9, 0.45]], round: 2, stations: 6 },
    { top: [[-2.4, 1.1], [-2.7, 1.75], [-3.5, 1.75], [-3.8, 1.1]], bottom: [[-2.4, 0.9], [-3.8, 0.9]], plan: [[-2.4, 0.3], [-2.7, 0.5], [-3.5, 0.5], [-3.8, 0.3]], round: 2, stations: 6 },
    { top: [[-10.2, 0.75], [-10.6, 0.85], [-11.2, 0.6], [-11.4, 0.2]], bottom: [[-10.2, -0.3], [-10.6, -0.4], [-11.2, -0.3], [-11.4, 0.0]], plan: [[-10.2, 0.45], [-10.6, 0.5], [-11.2, 0.4], [-11.4, 0.15]], round: 2, stations: 6 },
  ],
};

// The wings' thickness at the root as a share of the chord (estimates): the P-38's thin laminar wing, the bombers' deep spars.
for (const [k, r] of [['p-38j', 0.15], ['b-17g', 0.18], ['lancaster', 0.17]] as [string, number][]) A[k]!.wing.thicknessRatio = r;

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
}

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

export function piston(p: Piston): FixedWingSpec & { cls: string } {
  const L = p.length;
  const n = L / 2;
  const t = -L / 2;
  const h = p.h;
  const w = p.w;
  const c = p.canopy;
  const xf = c.x + c.length / 2;
  const xb = c.x - c.length / 2;
  const te = p.le - p.root;
  const fr = Math.min(p.finRoot, L * 0.2);
  // The deck at the cockpit, the canopy's crown on it (estimates: a fighter's hood stands about half a metre).
  const sill = h * 0.92;
  const crown = sill + (p.hood ?? (c.kind === 'bubble' ? 0.5 : 0.45));
  // The nose: a radial's blunt round cowl, or an inline's spinner and the cowl swelling back to the windscreen.
  const R = p.cowl ?? w;
  const RH = p.cowlH ?? R;
  // The spinner's tip is the nose: a radial's broad and short, an inline's long and pointed.
  const rs = p.spinner ?? (p.radial ? Math.min(R, RH) * 0.42 : Math.max(0.22, Math.min(0.36, p.prop * 0.1)));
  const sl = p.radial ? rs * 2.0 : rs * 2.6;
  // A radial's cowl lip stands a little behind the spinner's tip, its body behind the lip; an inline's cowl closes
  // round the spinner's base.
  const lipX = n - sl * 0.72;
  const x0 = p.radial ? lipX - cowlLip(Math.max(R, RH)) : n - sl + 0.03;
  const mid = (x0 - 0.3 + xf) / 2;
  const waist = p.waist ?? (p.radial ? Math.min(w, R * 0.82) : w);
  // The body's cross-section: round at a radial's cowl, a rounded box at the cockpit, where the canopy stands on
  // the sides of the deck, rounder again towards the tail.
  const boxy = 3.2;
  const round: P2[] = [[x0, p.radial ? 2.1 : 2.3], [xf + 0.6, 2.5], [xf, boxy], [xb, boxy], [t + fr, 2.5], [t, 2.3]];
  // How wide the deck is at the sill, where the canopy's sides rise from it.
  const cw = Math.min(0.4, waist * (1 - 0.92 ** boxy) ** (1 / boxy) * 0.96);
  const top: P2[] = p.radial
    ? [[x0, RH], [x0 - 0.3, RH], [Math.max(xf + 0.1, x0 - 1.2), Math.max(RH * 0.97, sill * 0.98)], [xf, sill]]
    : [[x0, rs * 1.04], [x0 - 0.15, rs * 1.25 + 0.03], [mid, h * 0.8], [xf, sill]];
  const bottom: P2[] = p.radial
    ? [[x0, -RH], [x0 - 0.3, -RH], [Math.max(p.le, x0 - 1.4), -h * 0.98]]
    : [[x0, -rs * 1.04], [x0 - 0.15, -rs * 1.35], [mid, -h * 0.9], [Math.max(p.le, mid - 0.4), -h * 0.98]];
  const plan: P2[] = p.radial
    ? [[x0, R], [x0 - 0.3, R], [Math.max(xf + 0.1, x0 - 1.2), R * 0.96], [xf, waist * 0.98], [c.x, waist]]
    : [[x0, rs * 1.04], [x0 - 0.15, rs * 1.22], [mid, w * 0.9], [xf, w * 0.98], [c.x, w]];
  // Behind the cockpit the body tapers smoothly to the tail: the deck falls away (a razorback keeps a narrow spine
  // up to the fin), the belly runs level under the wing and sweeps up, the sides close in.
  top.push([xb, sill * 0.97], ...run(xb, sill * 0.97, t + fr, h * 0.56, 2, 0.3), [t + fr, h * 0.56], [t, h * 0.48]);
  bottom.push([te, -h], ...run(te, -h, t, h * 0.02, 3, -0.35), [t, h * 0.02]);
  plan.push([xb, waist * 0.95], ...run(xb, waist * 0.95, t, 0.07, 3, 0.35), [t, 0.07]);
  const bodies: Outline[] = [];
  if (p.razor) {
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
    bodies.push({ top: [[s0, -h * 0.6], [s1, -h * 0.6]], bottom: [[s0, -h - sd * 0.8], [s0 - Math.min(0.25, sln * 0.15), -h - sd], [s0 - sln * 0.55, -h - sd * 0.85], [s1, -h * 0.92]], plan: [[s0, hw * 0.92], [s0 - 0.2, hw], [s1 + sln * 0.2, hw * 0.8], [s1, hw * 0.35]], round: 2.6, stations: 8 });
  }
  if (p.rads) {
    const [rx, ry, rl, rd] = p.rads;
    const up = (p.mount ?? -0.8) * 2 * h * 0.4 + ry * Math.tan(((p.dihedral ?? 6) * Math.PI) / 180) - (p.thick ?? 0.15) * p.root * 0.3;
    bodies.push({ top: [[rx, up], [rx - rl, up]], bottom: [[rx, up - rd * 0.8], [rx - rl * 0.2, up - rd], [rx - rl * 0.7, up - rd * 0.9], [rx - rl, up - 0.05]], plan: [[rx, 0.26], [rx - rl * 0.2, 0.3], [rx - rl * 0.7, 0.28], [rx - rl, 0.15]], side: ry, round: 3, stations: 6 });
  }
  // A gull wing bends a third of the way out (where the builder bends it).
  const half = p.span / 2;
  const bend = half * 0.33;
  const plan0 = wingOf(p.wing, p.le, p.root, p.tip, half, p.sweep ?? 2);
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
  const tp = p.tailRoot;
  return {
    cls: p.cls,
    length: L,
    span: p.span,
    height: p.height,
    bodyWidth: Math.max(w, R) * 2,
    bodyHeight: h * 2,
    fuselage: { top, bottom, plan, round, stations: 16 },
    bodies,
    wing: { x: p.le - p.root / 2, span: p.span, rootChord: p.root, tipChord: p.tip, sweep: p.sweep ?? 2, mount: p.mount ?? -0.8, dihedral: p.dihedral ?? 6, gull: p.gull, thicknessRatio: p.thick ?? 0.15 },
    wingPlan,
    tail: { kind: 'single', finHeight: p.fin, finChord: p.finRoot, tailSpan: p.tailSpan, tailChord: tp, finBase: h * 0.45, planeUp: h * 0.3 },
    finPlan: fins,
    // The tailplane: a swept leading edge, a near-straight elevator hinge, a round tip.
    tailPlan: roundedPlan(0, t + tp, t, p.tailSpan / 2, t + tp * 0.82, t + tp * 0.18, 0.7),
    engines: { kind: 'nose-prop', count: 1 },
    propeller: { diameter: p.prop, blades: p.blades, spinner: rs, spinnerLength: sl },
    cowls: p.radial ? [{ x: lipX, radius: R, height: RH, gills: Math.max(0.5, R * 1.1), cylinders: p.cylinders }] : undefined,
    canopy: c,
    glass: c.kind === 'glass-nose' ? undefined : [hood(c.kind, c.x + c.length / 2, c.x - c.length / 2, sill, crown, cw, !!p.razor)],
    fixedGear: p.gear,
  };
}

// Bf 109 E: the square-tipped wing.
A['bf-109-e'] = piston({ cls: 'ww2-fighter', length: 8.64, span: 9.87, height: 2.5, w: 0.45, h: 0.58, wing: 'square', le: 1.3, root: 2.15, tip: 1.2, sweep: 3, fin: 1.2, finRoot: 1.25, roundFin: true, tailSpan: 3.0, tailRoot: 0.9, canopy: { x: 0.5, length: 1.6, kind: 'framed' }, prop: 3.0, blades: 3, spinner: 0.28, rads: [0.9, 1.3, 1.1, 0.17] });
// Its small oil cooler under the nose (estimate).
A['bf-109-e'].bodies!.push({ top: [[3.2, -0.3], [2.5, -0.3]], bottom: [[3.2, -0.6], [3.0, -0.7], [2.7, -0.68], [2.5, -0.45]], plan: [[3.2, 0.12], [3.0, 0.16], [2.5, 0.08]], round: 3, stations: 6 });
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
// Il-2 mod. 1941: the first single-seater, its short hood on the armoured hump (11.6 x 14.6 x 4.2 m).
A['il-2-1941'] = piston({ cls: 'ww2-attack', length: 11.6, span: 14.6, height: 4.2, w: 0.65, h: 0.8, wing: 'tapered', le: 1.8, root: 3.2, tip: 1.2, sweep: 12, fin: 1.4, finRoot: 1.7, roundFin: true, tailSpan: 4.6, tailRoot: 1.3, canopy: { x: 0.6, length: 1.7, kind: 'framed' }, razor: true, prop: 3.6, blades: 3, scoop: [0.5, 1.6, 0.25] });
A['ju-87-stuka'] = piston({ cls: 'ww2-attack', length: 11.5, span: 13.8, height: 3.88, w: 0.6, h: 0.8, wing: 'square', le: 2.0, root: 2.8, tip: 1.3, sweep: 3, gull: true, mount: -0.9, dihedral: 8, fin: 1.6, finRoot: 1.8, tailSpan: 4.8, tailRoot: 1.2, canopy: { x: 0.6, length: 3.2, kind: 'framed' }, prop: 3.4, blades: 3, gear: true, scoop: [4.3, 1.5, 0.38], spinner: 0.3 });
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

// The jets once drawn here with jet() - F-104, F-84, F-8, Jaguar, Hunter, Meteor, Vampire, Buccaneer, Canberra, G.91,
// Saab 29, 32 and 35, Mystère, Étendard, He 162 - are outline figures with their variants in ./air-extra; the A-10,
// Su-25, MiG-15 and 17 and F-86 too (./air-extra, ./jet-attack). jet() stays for the jets of ./prop-variants.

// Grumman F4F Wildcat: a barrel radial fighter, mid wing with square tips (8.76 x 11.58 x 3.61 m); F8F Bearcat smaller with a bubble (8.61 x 10.92 x 4.21 m).
A['f4f-wildcat'] = piston({ cls: 'ww2-fighter', length: 8.76, span: 11.58, height: 3.61, w: 0.65, h: 0.75, radial: true, wing: 'square', le: 1.3, root: 2.4, tip: 1.3, sweep: 2, mount: 0, fin: 1.4, finRoot: 1.5, roundFin: true, tailSpan: 4.4, tailRoot: 1.1, canopy: { x: 0.6, length: 1.6, kind: 'framed' }, prop: 3.0, blades: 3 });
A['f8f-bearcat'] = piston({ cls: 'ww2-fighter', length: 8.61, span: 10.92, height: 4.21, w: 0.65, h: 0.75, radial: true, wing: 'square', le: 1.4, root: 2.5, tip: 1.3, sweep: 2, fin: 1.7, finRoot: 1.6, tailSpan: 4.6, tailRoot: 1.1, canopy: { x: 0.2, length: 1.6, kind: 'bubble' }, prop: 3.8, blades: 4 });
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

export const AIRCRAFT: SpecSet = { air: A };
