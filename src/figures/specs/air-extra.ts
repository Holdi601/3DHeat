/**
 * Aircraft that had no figure of their own: the remaining early and Cold War
 * jets, and propeller aircraft left on a near relative, each drawn from its
 * own outline. Canopy and add-on helpers come from ./jet-variants; propeller
 * helpers from ./props and ./prop-variants.
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

export type Spec = FixedWingSpec & { cls: string };

const A: Named<FixedWingSpec> = {};

// ---------------------------------------------------------------- helpers

/** A fuselage station: forward position, top, bottom, half-width. */
export type Row = [number, number, number, number];
/** A wing station: out from the root, leading edge, trailing edge. */
export type Edge = [number, number, number];

/** A body from its stations, nose to tail. */
export function fus(rows: Row[], round: number | P2[] = 2.4, stations = 26): Outline {
  return { top: rows.map(([x, t]) => [x, t] as P2), bottom: rows.map(([x, , b]) => [x, b] as P2), plan: rows.map(([x, , , w]) => [x, w] as P2), round, stations };
}

/** A half planform from its stations, root to tip, the tip rounded over `r` as half an ellipse. */
export function planOf(rows: Edge[], r = 0): P2[] {
  const le: P2[] = rows.map(([y, l]) => [l, y]);
  const te: P2[] = rows.map(([y, , t]) => [t, y]);
  if (r <= 0 || rows.length < 2) return [...le, ...te.reverse()];
  const [Y, l1, t1] = rows[rows.length - 1];
  const [y0, l0, t0] = rows[rows.length - 2];
  const f = Math.max(0, Math.min(1, (Y - r - y0) / (Y - y0)));
  const la = l0 + (l1 - l0) * f;
  const ta = t0 + (t1 - t0) * f;
  le.pop();
  te.pop();
  const c = (la + ta) / 2;
  const h = (la - ta) / 2;
  const arc: P2[] = [];
  for (let i = 0; i <= 8; i++) {
    const th = (i / 8) * Math.PI;
    arc.push([c + h * Math.cos(th), Y - r + r * Math.sin(th)]);
  }
  return [...le, ...arc, ...te.reverse()];
}

/** A jet nacelle or intake trunk from its open front `x0` back to `x1`, radius `r`, its axis at (`side`, `up`); mirrored when off the centre line. */
export function jetNac(x0: number, x1: number, r: number, side: number, up: number, wide = 1): Outline {
  const L = x0 - x1;
  return {
    top: [[x0, up + r * 0.9], [x0 - L * 0.15, up + r], [x1 + L * 0.2, up + r * 0.95], [x1, up + r * 0.7]],
    bottom: [[x0, up - r * 0.9], [x0 - L * 0.15, up - r], [x1 + L * 0.2, up - r * 0.95], [x1, up - r * 0.7]],
    plan: [[x0, r * wide * 0.9], [x0 - L * 0.15, r * wide], [x1 + L * 0.2, r * wide * 0.95], [x1, r * wide * 0.7]],
    side: side || undefined,
    round: 2.2,
    stations: 8,
  };
}

/**
 * An intake trunk or engine bay along the body, its mouth at `x0`, faired into the body at `x1`: `top` and `bottom`
 * its heights, `half` its half-width, centred `side` out (mirrored; 0 on the centre line). The lip raked back by
 * `rake` from its top edge to its bottom (negative: the bottom edge forward); `round` 2 a round or D duct, 3 to 6 a
 * rounded box.
 */
export function trunk(x0: number, x1: number, top: number, bottom: number, half: number, side: number, rake = 0, round = 3): Outline {
  const L = x0 - x1;
  const mid = (top + bottom) / 2;
  const back = x1 + L * 0.22;
  const r = Math.abs(rake);
  return {
    top: rake < 0 ? [[x0, bottom + 0.06], [x0 - r, top], [back, top], [x1, mid + (top - mid) * 0.45]] : [[x0, top], [back, top], [x1, mid + (top - mid) * 0.45]],
    bottom: rake > 0 ? [[x0, top - 0.06], [x0 - r, bottom], [back, bottom], [x1, mid - (mid - bottom) * 0.45]] : [[x0, bottom], [back, bottom], [x1, mid - (mid - bottom) * 0.45]],
    plan: [[x0, half * 0.92], [x0 - Math.max(r, L * 0.06), half], [back, half], [x1, half * 0.55]],
    side: side || undefined,
    round,
    stations: 10,
  };
}

/** A piston engine's nacelle:a blunt radial cowl or a pointed inline nose, from `x` back to `back`, radius `r`, axis at (`side`, `z`). */
function nac(x: number, back: number, r: number, side: number, z: number, radial = true, below = 0, wide = 1): Outline {
  const L = x - back;
  const f0 = radial ? 0.86 : 0.32;
  const w = r * wide;
  return {
    top: [[x, z + r * f0], [x - r * 0.7, z + r], [x - L * 0.5, z + r * 0.92], [back, z + r * 0.2]],
    bottom: [[x, z - r * f0], [x - r * 0.7, z - r - below * 0.4], [x - L * 0.45, z - r - below], [back, z - r * 0.2]],
    plan: [[x, w * f0], [x - r * 0.7, w], [x - L * 0.5, w * 0.92], [back, w * 0.2]],
    side: side || undefined,
    round: 2.3,
    stations: 12,
  };
}

/** A flat wing as a body, both halves (a biplane's upper wing, a tandem wing, a canard): its half planform's stations at height `z`, `t` thick. */
function plane(rows: Edge[], z: number, t: number, r = 0): Outline {
  const poly = planOf(rows, r);
  const x0 = Math.min(...poly.map((p) => p[0]));
  const x1 = Math.max(...poly.map((p) => p[0]));
  const top: P2[] = [];
  const bottom: P2[] = [];
  const plan: P2[] = [];
  for (let i = 0; i <= 16; i++) {
    const xi = x1 - ((x1 - x0) * i) / 16;
    const x = Math.min(x1 - 1e-6, Math.max(x0 + 1e-6, xi));
    let y = 0;
    for (let j = 0; j < poly.length; j++) {
      const [ax, ay] = poly[j];
      const [bx, by] = poly[(j + 1) % poly.length];
      if ((ax - x) * (bx - x) <= 0 && ax !== bx) y = Math.max(y, ay + ((by - ay) * (x - ax)) / (bx - ax));
    }
    top.push([xi, z + t / 2]);
    bottom.push([xi, z - t / 2]);
    plan.push([xi, Math.max(0.02, y)]);
  }
  return { top, bottom, plan, round: 12, stations: 2 };
}

/** A thin upright plate as a body: a strut, a pylon, a ventral fin; raked back by `rake` at its foot. */
export function post(x0: number, x1: number, zTop: number, zBottom: number, half: number, side?: number, rake = 0): Outline {
  return { top: [[x0, zTop], [x1, zTop]], bottom: [[x0 - rake, zBottom], [x1 - rake, zBottom]], plan: [[x0, half], [x1, half]], side, round: 4, stations: 2 };
}

/** A fixed main wheel on its leg (in a spat when asked), standing on `ground`. */
function wheel(x: number, y: number, top: number, ground: number, r: number, spat = false): Outline[] {
  const zc = ground + r;
  const len = spat ? r * 2.8 : r * 2;
  const w = spat ? 0.2 : 0.1;
  return [
    { top: [[x + len / 2, zc], [x + len * 0.25, zc + r * 0.9], [x - len * 0.3, zc + r * 0.85], [x - len / 2, zc + r * 0.2]], bottom: [[x + len / 2, zc], [x + len * 0.25, zc - r * 0.9], [x - len * 0.3, zc - r * 0.9], [x - len / 2, zc]], plan: [[x + len / 2, 0.03], [x + len * 0.25, w], [x - len * 0.3, w], [x - len / 2, 0.03]], side: y, round: 2, stations: 6 },
    post(x + 0.1, x - 0.1, top, zc, 0.06, y),
  ];
}

/** A seaplane's float from `x0` back to `x1`, its deck at `top`, its keel at `keel`, `half` wide, at `side` (mirrored), with the step under its middle. */
function float(x0: number, x1: number, top: number, keel: number, half: number, side?: number): Outline {
  const L = x0 - x1;
  return {
    top: [[x0, top - (top - keel) * 0.3], [x0 - L * 0.12, top], [x1 + L * 0.1, top - (top - keel) * 0.1], [x1, top - (top - keel) * 0.35]],
    bottom: [[x0, top - (top - keel) * 0.35], [x0 - L * 0.2, keel], [x0 - L * 0.55, keel], [x0 - L * 0.56, keel + (top - keel) * 0.2], [x1, top - (top - keel) * 0.55]],
    plan: [[x0, half * 0.3], [x0 - L * 0.2, half], [x0 - L * 0.6, half * 0.95], [x1, half * 0.25]],
    side,
    round: 3,
    stations: 10,
  };
}

/** A small round body: a turret dome, a blister, a radome; `up` positive stands on top, negative hangs below. */
export function dome(x: number, z: number, r: number, len = r * 2, up = 1, side?: number): Outline {
  return { top: [[x + len / 2, z], [x + len * 0.2, z + Math.max(0, up) * r], [x - len * 0.2, z + Math.max(0, up) * r], [x - len / 2, z]], bottom: [[x + len / 2, z], [x + len * 0.2, z + Math.min(0, up) * r - (up > 0 ? 0.1 : 0)], [x - len * 0.2, z + Math.min(0, up) * r - (up > 0 ? 0.1 : 0)], [x - len / 2, z]], plan: [[x + len / 2, 0.04], [x + len * 0.2, r], [x - len * 0.2, r], [x - len / 2, 0.04]], side, round: 2, stations: 6 };
}

/** A radiator, gondola or tank under the body: front, back, its top, its deepest, half wide. */
function belly(x0: number, x1: number, top: number, deep: number, half: number, side?: number): Outline {
  const a = x0 - (x0 - x1) * 0.2;
  const b = x0 - (x0 - x1) * 0.75;
  return { top: [[x0, top], [x1, top]], bottom: [[x0, top - (top - deep) * 0.5], [a, deep], [b, deep], [x1, top]], plan: [[x0, half * 0.8], [a, half], [b, half], [x1, half * 0.4]], side, round: 3, stations: 6 };
}

/** A body drawn only where it is, not mirrored: an offset refuelling probe, a gun fairing on one side. */
export const oneSide = (o: Outline): Outline & { oneSide: boolean } => ({ ...o, oneSide: true });

/** A canopy moved to one side (an offset cockpit, one of a twin fuselage's). */
const aside = (o: Outline, side: number): Outline => ({ ...o, side });

export interface Fig {
  cls: string;
  length: number;
  span: number;
  height: number;
  body: Row[];
  round?: number | P2[];
  /** The wing's half planform, its height on the body and its dihedral (degrees). */
  wing: P2[];
  wingUp: number;
  dihedral?: number;
  /** The fin's outline (forward, up from `finBase`); two of them `twin` apart, canted out `cant` degrees; or a T-tail. */
  fin?: P2[];
  finBase?: number;
  twin?: number;
  cant?: number;
  tee?: boolean;
  /** The tailplane's half planform at `planeUp`. */
  tail?: P2[];
  planeUp?: number;
  /** Exhausts (forward, side, up) and their diameter. */
  nozzles?: [number, number, number][];
  nozzle?: number;
  glass?: Outline[];
  bodies?: (Outline & { oneSide?: boolean })[];
  /** The wing's thickness over its chord at the root, an outer panel's own dihedral; the tailplane's dihedral (negative droops it). */
  thick?: number;
  outerDihedral?: { at: number; deg: number };
  planeDihedral?: number;
  /** Propellers: (forward, side, up, diameter, blades), mirrored when off the centre line. */
  props?: [number, number, number, number, number][];
}

/** A figure from its outlines: the fuselage, the bodies on it, the wing, fin and tailplane, the glass, the propellers. */
export function fig(o: Fig): Spec {
  const bodyHeight = Math.max(...o.body.map((r) => r[1])) - Math.min(...o.body.map((r) => r[2]));
  const bodyWidth = 2 * Math.max(...o.body.map((r) => r[3]));
  const fh = o.fin ? Math.max(...o.fin.map((p) => p[1])) : 0;
  const ws = Math.max(...o.wing.map((p) => p[1]));
  const kind = !o.fin ? 'none' : o.tee ? 't' : o.twin ? 'twin' : 'single';
  const props = (o.props ?? []).flatMap(([x, side, up, diameter, blades]) => (side ? [-1, 1] : [1]).map((s) => ({ x, side: s * side, up, diameter, blades })));
  return {
    cls: o.cls,
    length: o.length,
    span: o.span,
    height: o.height,
    bodyWidth,
    bodyHeight,
    fuselage: fus(o.body, o.round ?? 2.4),
    bodies: o.bodies,
    wing: { x: 0, span: 2 * ws, rootChord: 3, tipChord: 1, sweep: 0, mount: o.wingUp / (bodyHeight * 0.4), dihedral: o.dihedral ?? 0, thicknessRatio: o.thick, outerDihedral: o.outerDihedral },
    wingPlan: o.wing,
    tail: { kind, finHeight: fh, finChord: 2, cant: o.cant, spacing: o.twin, tailSpan: o.tail ? 2 * Math.max(...o.tail.map((p) => p[1])) : 0, tailChord: 1, finBase: o.finBase ?? 0, planeUp: kind === 't' ? undefined : (o.planeUp ?? 0), planeDihedral: o.planeDihedral },
    finPlan: o.fin,
    tailPlan: o.tail,
    engines: o.nozzles ? { kind: 'internal', count: o.nozzles.length, diameter: o.nozzle ?? 0.8, nozzles: o.nozzles } : undefined,
    props,
    canopy: { x: 0, length: 1, kind: 'bubble' },
    glass: o.glass ?? [],
  };
}

// ---------------------------------------------------------------- US Navy and Air Force jets of the 1950s

// F3D-1 Skyknight: a deep, round-nosed body, the two-seat side-by-side cockpit under a wide framed canopy, the two
// J34s in cheek nacelles low on the sides exhausting under the body behind the wing, a straight mid wing, a swept
// fin (13.85 x 15.24 x 4.9 m).
A['f3d-1'] = fig({
  cls: 'fighter', length: 13.85, span: 15.24, height: 4.9,
  body: [[6.92, 0.0, -0.5, 0.15], [6.5, 0.45, -0.85, 0.6], [5.6, 0.75, -1.0, 0.8], [4.4, 0.95, -1.05, 0.85], [3.0, 1.0, -1.05, 0.85], [0, 0.95, -1.0, 0.8], [-2.0, 0.85, -0.6, 0.65], [-4.5, 0.7, -0.15, 0.4], [-6.92, 0.55, 0.2, 0.12]],
  wing: [[1.4, 0], [1.4, 0.9], [0.4, 7.62], [-1.1, 7.62], [-1.6, 0.9], [-1.6, 0]], wingUp: -0.2, dihedral: 3,
  fin: [[-3.2, 0], [-6.6, 0], [-7.3, 2.0], [-6.3, 2.05]], finBase: 0.55,
  tail: [[-5.0, 0.3], [-5.8, 2.9], [-6.7, 2.9], [-6.9, 0.3]], planeUp: 0.5,
  nozzles: [[-1.7, -0.95, -0.75], [-1.7, 0.95, -0.75]], nozzle: 0.7,
  bodies: [jetNac(2.8, -1.6, 0.5, 0.95, -0.75)],
  glass: [sideBySide(4.2, 2.4, 1.45, 0.9, 1.0, 0.62)],
});

// F-89 Scorpion: a long body, the tandem cockpit over intakes low on the sides, the two J35s exhausting under the
// body ahead of a slim tail boom, a thin straight wing with fat things on its tips, the tailplane a third of the way
// up the fin. F-89D: the round radome and long rocket-and-fuel pods on the tips (16.41 x 18.18 x 5.36 m). F-89B: the
// cannon nose and round tip tanks (16.28 m, estimate).
function scorpion(d: boolean): Spec {
  const n = d ? 8.2 : 8.14;
  return fig({
    cls: 'fighter', length: d ? 16.41 : 16.28, span: d ? 18.18 : 17.6, height: 5.36,
    body: [[n, 0.0, d ? -0.3 : -0.15, d ? 0.2 : 0.1], [n - 0.6, 0.45, -0.75, 0.6], [6.4, 0.75, -0.95, 0.75], [5.0, 0.95, -1.1, 0.8], [3.0, 1.0, -1.3, 1.05], [0.5, 0.95, -1.35, 1.1], [-2.0, 0.85, -1.2, 1.0], [-3.0, 0.8, -0.3, 0.6], [-6.0, 0.7, 0.05, 0.35], [-8.2, 0.6, 0.25, 0.2]],
    wing: [[1.4, 0], [1.4, 1.0], [0.9, 8.8], [-0.8, 8.8], [-2.2, 1.0], [-2.2, 0]], wingUp: -0.45, dihedral: 1,
    fin: [[-3.5, 0], [-7.0, 0], [-8.3, 2.1], [-7.2, 2.15]], finBase: 0.7,
    tail: [[-5.6, 0], [-6.2, 3.0], [-7.1, 3.0], [-7.4, 0]], planeUp: 1.4,
    nozzles: [[-2.6, -0.5, -0.85], [-2.6, 0.5, -0.85]], nozzle: 0.75,
    bodies: [jetNac(3.6, 0.0, 0.42, 0.75, -0.85), d ? pod(3.6, -3.2, 0.5, 8.95, -0.3, 0.3) : pod(2.4, -2.6, 0.45, 8.9, -0.3, 0.35)],
    glass: [tandem(5.4, 2.6, 1.5, 1.6, 0.95, 1.0, 0.45)],
  });
}
A['f-89b'] = scorpion(false);
A['f-89d'] = scorpion(true);

// F3H-2 Demon: the radar nose, a high cockpit over cheek intakes, a broad 45-degree wing, the J71's exhaust under a
// long tail boom carrying the fin and the low tailplane (17.98 x 10.77 x 4.44 m).
A['f3h-2'] = fig({
  cls: 'fighter', length: 17.98, span: 10.77, height: 4.44,
  body: [[8.99, 0.0, -0.25, 0.15], [8.3, 0.45, -0.6, 0.55], [7.0, 0.75, -0.8, 0.7], [5.6, 1.0, -0.9, 0.72], [4.6, 1.0, -1.0, 1.0], [1.0, 0.95, -1.05, 1.1], [-2.5, 0.85, -0.95, 0.95], [-4.2, 0.75, -0.8, 0.75], [-4.6, 0.7, -0.05, 0.45], [-7.5, 0.6, 0.1, 0.3], [-8.99, 0.5, 0.25, 0.15]],
  wing: [[2.4, 0], [2.4, 1.0], [-1.9, 5.39], [-3.6, 5.39], [-3.2, 1.0], [-3.2, 0]], wingUp: 0,
  fin: [[-3.8, 0], [-7.2, 0], [-8.4, 1.6], [-7.4, 1.65]], finBase: 0.6,
  tail: [[-6.4, 0.2], [-7.5, 2.4], [-8.4, 2.4], [-8.8, 0.2]], planeUp: 0.35,
  nozzles: [[-4.5, 0, -0.42]], nozzle: 1.0,
  bodies: [jetNac(5.0, 0.5, 0.45, 0.85, -0.45)],
  glass: [bubble(6.2, 4.4, 1.6, 0.85, 1.0, 0.42)],
});

// F-101C Voodoo: a long nose, intakes in the wing roots, a 47-degree mid wing, the two J57s exhausting under a long
// tail boom, the T-tail high on the fin (20.55 x 12.09 x 5.49 m).
A['f-101c'] = fig({
  cls: 'fighter', length: 20.55, span: 12.09, height: 5.49,
  body: [[10.28, 0.0, -0.2, 0.12], [9.4, 0.4, -0.5, 0.5], [7.8, 0.65, -0.75, 0.68], [6.5, 0.75, -0.85, 0.75], [4.0, 0.85, -0.95, 0.85], [1.0, 0.8, -1.0, 1.15], [-3.0, 0.75, -1.0, 1.15], [-5.6, 0.7, -0.85, 1.05], [-6.0, 0.65, -0.1, 0.55], [-9.0, 0.55, 0.1, 0.3], [-10.28, 0.45, 0.25, 0.15]],
  wing: [[3.0, 0], [3.0, 0.9], [2.2, 1.2], [-3.0, 6.05], [-4.8, 6.05], [-4.0, 1.2], [-4.0, 0]], wingUp: -0.1,
  fin: [[-4.6, 0], [-8.6, 0], [-10.0, 2.5], [-8.8, 2.55]], finBase: 0.6, tee: true,
  tail: [[-8.4, 0], [-9.6, 2.75], [-10.5, 2.75], [-10.3, 0]],
  nozzles: [[-5.8, -0.55, -0.5], [-5.8, 0.55, -0.5]], nozzle: 0.9,
  bodies: [jetNac(2.8, -0.5, 0.45, 1.05, -0.2)],
  glass: [bubble(6.6, 4.6, 1.35, 0.75, 0.85, 0.4)],
});

// F4D-1 Skyray: a short body in a broad tailless "ray" wing nearly as long as itself, its tips rounded, intakes beside
// the cockpit, one fin (13.93 x 10.21 x 3.96 m).
A['f4d-1'] = fig({
  cls: 'fighter', length: 13.93, span: 10.21, height: 3.96,
  body: [[6.97, 0.0, -0.25, 0.12], [6.3, 0.4, -0.55, 0.45], [5.0, 0.7, -0.7, 0.62], [3.8, 0.9, -0.75, 0.68], [3.0, 0.9, -0.8, 1.1], [0, 0.8, -0.8, 1.15], [-3.5, 0.65, -0.65, 0.9], [-5.6, 0.5, -0.5, 0.6], [-6.97, 0.4, -0.35, 0.4]],
  wing: [[3.4, 0], [3.0, 1.1], [-0.6, 4.0], [-1.4, 4.75], [-2.2, 5.1], [-3.0, 5.0], [-3.6, 4.6], [-4.3, 1.1], [-4.3, 0]], wingUp: -0.2,
  fin: [[-2.4, 0], [-5.4, 0], [-6.4, 1.6], [-5.4, 1.65]], finBase: 0.6,
  nozzles: [[-6.97, 0, 0]], nozzle: 0.85,
  bodies: [jetNac(3.6, -0.5, 0.4, 0.95, -0.1)],
  glass: [bubble(4.8, 3.2, 1.35, 0.7, 0.9, 0.4)],
});

// F-105D Thunderchief: a long area-ruled body, the radar nose, forward-swept intakes in the wing roots, a 45-degree
// mid wing, the tall fin and low all-moving tailplane (19.63 x 10.65 x 5.99 m). Checked by eye against a public
// dimensioned 3-view of the YF-105A, stretched to the D (estimates): a tall oval body 2.3 m deep and 1.3 m wide, belly
// to canopy top 2.3 m, 1.35 m deep 1.2 m before the tail, the fin's top 2.55 m over the axis.
A['f-105d'] = fig({
  cls: 'attack', length: 19.63, span: 10.65, height: 5.99,
  body: [[9.82, 0.0, -0.05, 0.05], [8.45, 0.25, -0.28, 0.3], [6.06, 0.78, -0.85, 0.55], [3.98, 0.82, -1.27, 0.62], [1.0, 0.76, -1.5, 0.65], [-3.47, 0.68, -1.45, 0.65], [-5.69, 0.75, -1.3, 0.62], [-8.64, 0.62, -0.7, 0.55], [-9.82, 0.42, -0.42, 0.45]],
  wing: [[2.4, 0], [2.4, 0.85], [-2.28, 5.33], [-3.9, 5.33], [-2.8, 0.85], [-2.8, 0]], wingUp: 0.25,
  fin: [[-4.4, 0], [-8.4, 0], [-9.7, 1.8], [-8.5, 1.85]], finBase: 0.7,
  tail: [[-6.6, 0.6], [-7.8, 2.6], [-8.9, 2.6], [-9.0, 0.6]], planeUp: -0.5,
  nozzles: [[-9.82, 0, 0]], nozzle: 1.0,
  bodies: [{ top: [[2.6, 0.5], [-1.4, 0.45]], bottom: [[1.9, -0.4], [-1.4, -0.4]], plan: [[2.6, 0.12], [1.9, 0.4], [-1.4, 0.35]], side: 0.95, round: 3, stations: 8 }],
  glass: [bubble(5.6, 2.2, 1.08, 0.8, 0.78, 0.4)],
});

// F-102A Delta Dagger: a long pointed nose, intakes behind the framed canopy, the area-ruled waist, a 60-degree
// tailless delta and a tall swept fin (20.83 x 11.62 x 6.45 m). The late F-102A has the infrared seeker's ball on
// the nose ahead of the windscreen. Drawn to the F-106's measured body (see there), the intakes forward beside the
// cockpit and the canopy higher.
function deltaDagger(irst: boolean): Spec {
  return fig({
    cls: 'fighter', length: 20.83, span: 11.62, height: 6.45,
    body: [[10.42, 0.0, -0.1, 0.06], [9.0, 0.32, -0.6, 0.42], [7.2, 0.45, -1.0, 0.62], [5.8, 0.55, -1.15, 0.72], [4.2, 0.7, -1.22, 0.8], [1.0, 0.76, -1.26, 1.15], [-2.0, 0.76, -1.26, 1.0], [-5.5, 0.82, -1.15, 1.05], [-8.5, 0.85, -0.85, 0.85], [-10.42, 0.55, -0.35, 0.55]],
    wing: [[1.8, 0], [1.8, 1.0], [-6.93, 5.81], [-7.8, 5.81], [-8.9, 1.0], [-8.9, 0]], wingUp: -0.37,
    fin: [[-3.6, 0], [-9.6, 0], [-10.4, 3.25], [-9.0, 3.25]], finBase: 0.8,
    nozzles: [[-10.42, 0, 0.15]], nozzle: 0.9,
    bodies: [jetNac(4.3, 0.5, 0.53, 0.72, 0.0), ...(irst ? [pod(6.9, 6.2, 0.17, 0, 0.6, 0.5)] : [])],
    glass: [bubble(6.3, 4.2, 1.1, 0.5, 0.72, 0.42)],
  });
}
A['f-102a'] = deltaDagger(false);
A['f-102a-late'] = deltaDagger(true);

// F-106A Delta Dart: the F-102's layout refined - a slimmer wasp waist, intakes set further back, a broad fin with
// its top cut square; from 1972 the frameless bubble canopy (21.56 x 11.67 x 6.18 m). Checked by eye against a public
// dimensioned 3-view (estimates): 2 m deep from the canopy's top to the flat belly, the canopy only 0.9 m over the
// axis, 2.45 m across the intakes that start behind the cockpit, the tail cone 0.9 m deep, the fin's top 3.95 m over
// the axis.
A['f-106a'] = fig({
  cls: 'fighter', length: 21.56, span: 11.67, height: 6.18,
  body: [[10.78, 0.0, -0.05, 0.03], [9.3, 0.0, -0.1, 0.06], [8.16, 0.32, -0.77, 0.45], [6.6, 0.42, -1.05, 0.62], [5.08, 0.46, -1.21, 0.72], [3.0, 0.62, -1.25, 0.8], [1.65, 0.7, -1.27, 0.85], [-1.5, 0.76, -1.28, 1.0], [-4.5, 0.8, -1.2, 1.05], [-7.5, 0.88, -0.9, 0.95], [-9.5, 0.85, -0.6, 0.75], [-10.78, 0.6, -0.26, 0.5]],
  wing: [[1.2, 0], [1.2, 1.0], [0.6, 1.1], [-7.78, 5.84], [-8.8, 5.84], [-9.5, 1.0], [-9.5, 0]], wingUp: -0.37,
  fin: [[-4.85, 0], [-10.0, 0], [-10.6, 3.15], [-8.9, 3.15]], finBase: 0.8,
  nozzles: [[-10.78, 0, 0.15]], nozzle: 0.95,
  bodies: [jetNac(1.9, -3.0, 0.55, 0.7, 0.0)],
  glass: [bubble(5.8, 2.6, 0.92, 0.38, 0.62, 0.42)],
});

// ---------------------------------------------------------------- swing wing, cranked arrow, double delta

// F-111: a wide flat body, the side-by-side cockpit, quarter-round intakes under the glove, the swing wing (shown at
// a middle sweep), the tall fin with its long fillet, all-moving tailplanes and ventral strakes. F-111A
// (22.4 x 19.2 spread / 9.74 swept x 5.22 m); F-111F the same with the Pave Tack pod under the belly; F-111C the long
// FB-111 wing (21.34 m spread).
function aardvark(longWing: boolean, paveTack: boolean): Spec {
  const t = longWing ? 8.4 : 7.5;
  return fig({
    cls: 'attack', length: 22.4, span: 2 * t, height: 5.22,
    body: [[11.2, 0.0, -0.2, 0.1], [10.2, 0.4, -0.55, 0.5], [8.6, 0.7, -0.85, 0.75], [7.0, 0.95, -0.95, 0.9], [5.5, 1.0, -1.0, 0.95], [3.0, 0.95, -1.05, 1.4], [0, 0.9, -1.05, 1.55], [-5, 0.85, -0.95, 1.5], [-9, 0.75, -0.75, 1.3], [-11.2, 0.6, -0.55, 1.1]],
    wing: [[4.6, 0], [4.6, 1.4], [0.7, 2.5], [-2.6, 2.5], [-3.4, 1.4], [-3.4, 0]], wingUp: 0.3,  // the fixed glove; the outer panel swings in ./swing.ts
    fin: [[-3.0, 0], [-9.6, 0], [-11.0, 2.2], [-9.6, 2.25], [-5.2, 0.5]], finBase: 0.85,
    tail: [[-6.6, 1.2], [-7.6, 1.6], [-9.4, 4.4], [-10.6, 4.4], [-10.9, 1.2]], planeUp: 0,
    nozzles: [[-11.2, -0.65, -0.1], [-11.2, 0.65, -0.1]], nozzle: 1.0,
    bodies: [jetNac(1.8, -2.0, 0.55, 1.35, -0.55), post(-7.0, -9.6, -0.6, -1.25, 0.05, 0.7), ...(paveTack ? [pod(1.0, -1.6, 0.35, 0, -1.15, 0.3)] : [])],
    glass: [sideBySide(7.6, 5.2, 1.55, 0.95, 1.0, 0.85)],
  });
}
A['f-111a'] = aardvark(false, false);
A['f-111f'] = aardvark(false, true);
A['f-111c'] = aardvark(true, false);

// F-16XL: the F-16's nose, cockpit and fin on a longer body in a cranked-arrow wing - 70 degrees inboard, 50 outboard -
// with no tailplanes (16.51 x 10.44 x 5.36 m).
A['f-16xl'] = fig({
  cls: 'multirole', length: 16.51, span: 10.44, height: 5.36,
  body: [[8.26, -0.15, -0.2, 0.04], [7.3, 0.2, -0.35, 0.35], [6.3, 0.36, -0.45, 0.55], [5.5, 0.48, -0.95, 0.62], [3.5, 0.62, -0.92, 0.75], [0, 0.7, -0.9, 0.82], [-4, 0.62, -0.7, 0.75], [-6.5, 0.5, -0.55, 0.62], [-8.0, 0.4, -0.4, 0.5]],
  wing: [[6.6, 0], [6.0, 0.6], [-0.8, 3.0], [-3.6, 5.22], [-4.5, 5.22], [-7.2, 1.0], [-7.2, 0]], wingUp: 0,
  fin: [[-4.1, 0], [-7.3, 0], [-7.6, 2.85], [-6.5, 2.85]], finBase: 0.5,
  nozzles: [[-8.26, 0, 0]], nozzle: 1.15,
  glass: [bubble(6.0, 3.2, 1.12, 0.36, 0.6, 0.4)],
});

// J-7E: the MiG-21 tube with the nose intake and its cone and the broad fin, on the double-delta wing - 57 degrees
// inboard, 42 outboard - of greater span (14.89 x 8.32 x 4.11 m).
A['j-7e'] = fig({
  cls: 'fighter', length: 14.89, span: 8.32, height: 4.11,
  body: [[7.445, 0.4, -0.45, 0.5], [6.0, 0.58, -0.62, 0.6], [4.2, 0.66, -0.64, 0.68], [2.2, 0.82, -0.65, 0.68], [-2.5, 0.85, -0.65, 0.66], [-4.6, 0.75, -0.6, 0.65], [-7.1, 0.5, -0.5, 0.55]], round: 2.1,
  wing: [[1.6, 0], [1.6, 0.6], [-1.48, 2.6], [-2.88, 4.16], [-3.78, 4.16], [-4.4, 0.6], [-4.4, 0]], wingUp: 0,
  fin: [[-2.6, 0], [-6.4, 0], [-7.1, 2.5], [-6.0, 2.5]], finBase: 0.55,
  tail: [[-4.8, 0.5], [-5.6, 1.85], [-6.4, 1.85], [-6.6, 0.5]], planeUp: 0,
  nozzles: [[-7.1, 0, 0]], nozzle: 1.0,
  bodies: [{ top: [[8.145, 0], [7.345, 0.38]], bottom: [[8.145, 0], [7.345, -0.38]], plan: [[8.145, 0.02], [7.345, 0.38]], round: 2, stations: 4 }],
  glass: [bubble(4.245, 2.245, 1.0, 0.66, 0.8, 0.36)],
});

// J-8II (J-8B, and the J-8F of the same outline): a long solid radar nose, square side intakes behind the cockpit,
// two engines side by side, a 60-degree delta with a low tailplane, the tall fin and a ventral fin
// (21.39 x 9.34 x 5.41 m).
A['j-8b'] = fig({
  cls: 'fighter', length: 21.39, span: 9.34, height: 5.41,
  body: [[10.7, 0.0, -0.15, 0.08], [9.6, 0.35, -0.5, 0.45], [8.0, 0.6, -0.75, 0.62], [6.4, 0.78, -0.85, 0.72], [5.0, 0.85, -0.95, 0.75], [3.8, 0.88, -0.95, 1.25], [0, 0.85, -0.95, 1.3], [-5.0, 0.8, -0.85, 1.15], [-9.0, 0.75, -0.7, 1.05], [-10.7, 0.65, -0.6, 0.95]], round: [[10.7, 2.2], [4.0, 2.4], [3.8, 4], [-10.7, 3]],
  wing: [[0.2, 0], [0.2, 1.3], [-6.24, 4.67], [-7.0, 4.67], [-6.9, 1.3], [-6.9, 0]], wingUp: -0.2,
  fin: [[-4.4, 0], [-9.6, 0], [-10.6, 2.2], [-9.4, 2.25]], finBase: 0.75,
  tail: [[-7.4, 1.0], [-8.8, 2.6], [-9.8, 2.6], [-10.2, 1.0]], planeUp: -0.1,
  nozzles: [[-10.7, -0.48, -0.05], [-10.7, 0.48, -0.05]], nozzle: 0.85,
  bodies: [post(-8.0, -9.8, -0.7, -1.45, 0.06, undefined, 0.3)],
  glass: [bubble(7.2, 5.4, 1.4, 0.78, 0.88, 0.4)],
});

// M-346FA: a tandem two-seater with the raised rear seat, intakes under long LERX, a trapezoid wing with tip rails,
// one fin and low tailplanes (11.49 x 9.72 x 4.76 m).
A['m-346fa'] = fig({
  cls: 'attack', length: 11.49, span: 9.72, height: 4.76,
  body: [[5.75, -0.15, -0.25, 0.04], [5.2, 0.2, -0.45, 0.35], [4.2, 0.45, -0.6, 0.5], [3.0, 0.75, -0.7, 0.55], [1.6, 0.85, -0.75, 0.95], [0, 0.85, -0.8, 1.0], [-2.5, 0.7, -0.65, 0.9], [-4.5, 0.5, -0.5, 0.6], [-5.75, 0.4, -0.4, 0.45]],
  wing: [[3.4, 0], [3.2, 0.6], [0.6, 1.3], [-1.53, 4.75], [-2.63, 4.75], [-2.4, 1.0], [-2.4, 0]], wingUp: -0.1,
  fin: [[-1.6, 0], [-4.5, 0], [-5.3, 2.2], [-4.3, 2.25]], finBase: 0.6,
  tail: [[-3.5, 0.5], [-4.4, 2.2], [-5.2, 2.2], [-5.4, 0.5]], planeUp: -0.15,
  nozzles: [[-5.75, -0.45, -0.05], [-5.75, 0.45, -0.05]], nozzle: 0.55,
  bodies: [jetNac(1.9, -1.4, 0.38, 0.85, -0.45), pod(-0.6, -2.9, 0.07, 4.86, 0, 0.1)],
  glass: [tandem(4.2, 1.0, 1.22, 1.4, 0.6, 0.82, 0.38)],
});

// ---------------------------------------------------------------- British jets of the 1950s

// Swift: side intakes beside the cockpit, a swept mid-low wing, the tailplane low on the body. F.1: the plain wing
// (12.64 x 9.85 x 3.96 m). F.7: the longer nose and the dogtoothed wing (13.41 x 9.86 x 4.0 m, estimate).
function swift(f7: boolean): Spec {
  const n = f7 ? 6.9 : 6.32;
  return fig({
    cls: 'fighter', length: f7 ? 13.41 : 12.64, span: f7 ? 9.86 : 9.85, height: f7 ? 4.0 : 3.96,
    body: [[n, -0.05, -0.25, 0.1], [n - 0.72, 0.35, -0.5, 0.45], [4.4, 0.6, -0.65, 0.6], [3.4, 0.75, -0.7, 0.62], [2.6, 0.8, -0.72, 0.95], [0, 0.78, -0.72, 0.9], [-3, 0.65, -0.6, 0.65], [-6.32, 0.45, -0.4, 0.45]],
    wing: f7 ? [[2.0, 0], [1.8, 0.7], [-0.4, 3.3], [-0.2, 3.35], [-1.75, 4.93], [-2.85, 4.93], [-2.4, 0.7], [-2.4, 0]] : [[2.0, 0], [1.8, 0.7], [-1.75, 4.93], [-2.85, 4.93], [-2.4, 0.7], [-2.4, 0]], wingUp: -0.25,
    fin: [[-3.0, 0], [-5.6, 0], [-6.6, 1.55], [-5.7, 1.6]], finBase: 0.5,
    tail: [[-4.8, 0.4], [-5.8, 2.0], [-6.5, 2.0], [-6.7, 0.4]], planeUp: 0.35,
    nozzles: [[-6.32, 0, 0]], nozzle: 0.8,
    bodies: [jetNac(3.2, 0.2, 0.42, 0.68, -0.05)],
    glass: [bubble(3.8, 2.2, 1.2, 0.75, 0.8, 0.36)],
  });
}
A['swift-f1'] = swift(false);
A['swift-f7'] = swift(true);

// Javelin FAW.9: a thick delta with cropped tips, intakes beside the tandem cockpit, the long reheat pipes past the
// trailing edge, the huge swept fin with the tailplane on its top (17.15 x 15.85 x 4.88 m).
A['javelin-faw9'] = fig({
  cls: 'fighter', length: 17.15, span: 15.85, height: 4.88,
  body: [[8.58, 0.0, -0.2, 0.12], [7.8, 0.45, -0.6, 0.5], [6.4, 0.75, -0.85, 0.7], [5.0, 0.95, -0.95, 0.8], [3.6, 1.0, -1.0, 1.4], [0, 0.95, -1.0, 1.5], [-3.4, 0.85, -0.85, 1.3], [-6.0, 0.7, -0.6, 0.8], [-8.58, 0.55, -0.3, 0.25]],
  wing: [[3.4, 0], [2.8, 1.4], [-2.88, 7.93], [-4.28, 7.93], [-4.8, 1.4], [-4.8, 0]], wingUp: -0.2,
  fin: [[-2.8, 0], [-7.4, 0], [-8.8, 2.1], [-7.6, 2.15]], finBase: 0.6, tee: true,
  tail: [[-7.4, 0], [-8.4, 2.4], [-9.6, 2.4], [-9.4, 0]],
  nozzles: [[-5.6, -0.72, -0.2], [-5.6, 0.72, -0.2]], nozzle: 0.85,
  bodies: [jetNac(4.0, -5.2, 0.48, 0.72, -0.2)],
  glass: [tandem(5.8, 2.8, 1.45, 1.5, 0.9, 1.0, 0.45)],
});

// Lightning F.6 (and the export F.53): the nose intake with its cone, the deep body over two engines stacked one
// above the other, the big ventral tank, a 60-degree wing with the notched trailing edge and the F.6's kinked
// leading edge, the tailplane low at the back, the tall square-topped fin (16.84 x 10.62 x 5.97 m).
A['lightning-f6'] = fig({
  cls: 'fighter', length: 16.84, span: 10.62, height: 5.97,
  body: [[8.42, 0.45, -0.45, 0.45], [7.6, 0.55, -0.6, 0.55], [6.0, 0.68, -0.75, 0.66], [4.4, 0.85, -0.85, 0.72], [2.0, 1.0, -1.0, 0.75], [-2, 1.0, -1.05, 0.75], [-5.5, 0.85, -1.0, 0.7], [-8.42, 0.7, -0.85, 0.6]], round: 2.2,
  wing: [[1.8, 0], [1.6, 0.75], [-1.6, 2.6], [-1.4, 2.65], [-4.0, 5.31], [-5.0, 5.31], [-3.6, 2.9], [-5.0, 0.9], [-5.0, 0]], wingUp: 0.25,
  fin: [[-3.0, 0], [-7.6, 0], [-8.6, 2.3], [-7.2, 2.3]], finBase: 0.75,
  tail: [[-5.6, 0.6], [-6.6, 2.2], [-7.4, 2.2], [-7.6, 0.6]], planeUp: -0.75,
  nozzles: [[-8.42, 0, 0.4], [-8.42, 0, -0.45]], nozzle: 0.8,
  bodies: [
    { top: [[9.1, 0], [8.3, 0.32]], bottom: [[9.1, 0], [8.3, -0.32]], plan: [[9.1, 0.02], [8.3, 0.32]], round: 2, stations: 4 },
    { top: [[2.6, -0.8], [-3.6, -0.8]], bottom: [[2.6, -0.9], [1.6, -1.6], [-2.6, -1.6], [-3.6, -1.0]], plan: [[2.6, 0.2], [1.6, 0.42], [-2.6, 0.42], [-3.6, 0.15]], round: 2.4, stations: 8 },
  ],
  glass: [bubble(5.0, 3.2, 1.35, 0.85, 1.0, 0.4)],
});

// Sea Vixen FAW.2: a central pod with the pilot's canopy offset to port, twin booms run forward past the leading edge
// for fuel, a swept wing with a dogtooth, the tailplane bridging the fin tips (17.02 x 15.54 x 3.28 m).
A['sea-vixen-faw2'] = fig({
  cls: 'fighter', length: 17.02, span: 15.54, height: 3.28,
  body: [[8.51, 0.0, -0.25, 0.15], [7.6, 0.5, -0.75, 0.6], [6.0, 0.8, -0.95, 0.8], [4.0, 0.95, -1.0, 0.95], [1.0, 0.95, -0.95, 1.0], [-2.0, 0.8, -0.75, 0.9], [-3.6, 0.5, -0.4, 0.55]],
  wing: [[2.4, 0], [2.0, 1.0], [-0.6, 4.2], [-0.45, 4.25], [-3.4, 7.77], [-4.8, 7.77], [-3.4, 1.0], [-3.4, 0]], wingUp: -0.1,
  fin: [[-5.0, 0], [-7.6, 0], [-8.5, 1.6], [-7.6, 1.6]], finBase: 0.2, twin: 5.0,
  tail: [[-7.4, 0], [-7.6, 2.8], [-8.4, 2.8], [-8.4, 0]], planeUp: 1.8,
  nozzles: [[-3.6, -0.45, 0], [-3.6, 0.45, 0]], nozzle: 0.6,
  bodies: [pod(2.8, -7.6, 0.32, 2.5, 0, 0.25)],
  glass: [aside(bubble(5.2, 3.6, 1.35, 0.9, 0.95, 0.38), -0.35)],
});

// Scimitar F.1: a big twin-Avon body with intakes beside the cockpit, the exhausts at the sides under a long tail
// boom, a broad 45-degree mid wing, the swept fin and a tailplane on the boom (16.84 x 11.33 x 5.28 m).
A['scimitar-f1'] = fig({
  cls: 'fighter', length: 16.84, span: 11.33, height: 5.28,
  body: [[8.42, 0.0, -0.2, 0.12], [7.6, 0.45, -0.55, 0.5], [6.2, 0.75, -0.8, 0.7], [5.0, 0.95, -0.9, 0.78], [4.0, 1.0, -0.95, 1.3], [0, 0.95, -1.0, 1.4], [-3.0, 0.85, -0.9, 1.35], [-4.2, 0.8, -0.7, 0.9], [-8.42, 0.55, 0.0, 0.25]],
  wing: [[3.2, 0], [2.6, 1.35], [-1.72, 5.67], [-3.3, 5.67], [-3.4, 1.35], [-3.4, 0]], wingUp: 0,
  fin: [[-3.4, 0], [-6.8, 0], [-8.2, 2.3], [-7.2, 2.35]], finBase: 0.55,
  tail: [[-6.4, 0.25], [-7.4, 2.6], [-8.2, 2.6], [-8.4, 0.25]], planeUp: 0.2,
  nozzles: [[-4.0, -0.95, -0.35], [-4.0, 0.95, -0.35]], nozzle: 0.85,
  bodies: [jetNac(4.4, 0.8, 0.5, 1.05, -0.1)],
  glass: [bubble(6.2, 4.4, 1.4, 0.9, 0.98, 0.4)],
});

// ---------------------------------------------------------------- Soviet, German and Japanese jets and rockets

// Yak-28B: a long slim body with the glazed navigator's nose and the pilot's bubble above, a shoulder wing swept 45
// degrees, the two engines in big nacelles under it with their cones far forward, outrigger wheels in the tips
// (20.0 x 11.78 x 3.95 m, estimate from the family's published figures).
A['yak-28b'] = fig({
  cls: 'bomber', length: 20.0, span: 11.78, height: 3.95,
  body: [[10.0, 0.0, -0.4, 0.15], [9.4, 0.45, -0.6, 0.5], [8.0, 0.7, -0.75, 0.68], [6.5, 0.8, -0.8, 0.75], [3.0, 0.85, -0.85, 0.78], [-2, 0.85, -0.8, 0.75], [-6, 0.7, -0.6, 0.55], [-10.0, 0.45, -0.2, 0.25]],
  wing: [[1.2, 0], [1.0, 0.75], [-4.14, 5.89], [-5.54, 5.89], [-3.8, 0.75], [-3.8, 0]], wingUp: 0.55,
  fin: [[-5.0, 0], [-8.4, 0], [-9.8, 1.5], [-8.8, 1.55]], finBase: 0.6,
  tail: [[-6.8, 0.3], [-7.8, 2.4], [-8.7, 2.4], [-9.0, 0.3]], planeUp: 0.3,
  nozzles: [[-3.6, -2.6, 0.05], [-3.6, 2.6, 0.05]], nozzle: 0.7,
  bodies: [jetNac(3.4, -3.6, 0.55, 2.6, 0.05), pod(4.0, 3.2, 0.32, 2.6, 0.05, 0.6), pod(-3.8, -5.6, 0.16, 5.7, 0.45, 0.3)],
  glass: [pod(10.1, 8.3, 0.55, 0, -0.1, 0.5), bubble(6.6, 4.6, 1.3, 0.8, 0.85, 0.42)],
});

// Me 163 B Komet (and the B-0): a stubby teardrop body with the small wind-driven generator's propeller on its nose,
// a swept tailless wing, a big fin, the rocket's nozzle in the tail (5.98 x 9.33 x 2.75 m). Ki-200 / J8M1 Shusui:
// the Japanese copy, a little longer with a broader wing (6.05 x 9.5 x 2.7 m).
function komet(L: number, span: number, height: number, cls = 'fighter'): Spec {
  const n = L / 2;
  const h = span / 2;
  return fig({
    cls, length: L, span, height,
    body: [[n, 0.0, -0.1, 0.1], [n - 0.3, 0.4, -0.4, 0.35], [2.0, 0.55, -0.55, 0.5], [0.8, 0.65, -0.6, 0.52], [-0.5, 0.6, -0.55, 0.48], [-1.8, 0.45, -0.35, 0.32], [-n, 0.25, -0.15, 0.12]],
    wing: [[1.0, 0], [0.9, 0.45], [0.9 - (h - 0.45) * 0.43, h], [0.9 - (h - 0.45) * 0.43 - 1.1, h], [-1.95, 0.45], [-1.95, 0]], wingUp: -0.15,
    fin: [[-0.4, 0], [-2.6, 0], [-3.0, 1.15], [-2.2, 1.25], [-1.5, 0.9]], finBase: 0.45,
    nozzles: [[-n, 0, -0.05]], nozzle: 0.25,
    props: [[n + 0.05, 0, 0, 0.5, 2]],
    glass: [bubble(1.6, 0.4, 0.82, 0.5, 0.6, 0.32)],
  });
}
A['me-163b'] = komet(5.98, 9.33, 2.75);
A['ki-200'] = komet(6.05, 9.5, 2.7);

// BI (Bereznyak-Isayev): a small rocket fighter, a cigar body with the nozzle in its tail, a straight tapered low
// wing, the tailplane with oval endplate fins (6.4 x 6.48 m; height 2.06 m, estimate).
A['bi'] = fig({
  cls: 'fighter', length: 6.4, span: 6.48, height: 2.06,
  body: [[3.2, 0.0, -0.2, 0.15], [2.8, 0.35, -0.45, 0.4], [1.8, 0.5, -0.5, 0.48], [0.4, 0.55, -0.5, 0.5], [-1.2, 0.45, -0.4, 0.4], [-2.6, 0.3, -0.25, 0.22], [-3.2, 0.22, -0.2, 0.15]],
  wing: [[1.0, 0], [0.9, 0.5], [0.45, 3.24], [-0.45, 3.24], [-1.1, 0.5], [-1.1, 0]], wingUp: -0.3, dihedral: 5,
  fin: [[-2.0, 0], [-3.1, 0], [-3.3, 0.85], [-2.7, 0.9]], finBase: 0.3,
  tail: [[-2.3, 0.2], [-2.6, 1.2], [-3.1, 1.2], [-3.2, 0.2]], planeUp: 0.15,
  nozzles: [[-3.2, 0, 0]], nozzle: 0.3,
  bodies: [post(-2.5, -3.15, 0.55, -0.25, 0.03, 1.2, -0.05)],
  glass: [bubble(1.4, 0.2, 0.85, 0.5, 0.55, 0.32)],
});

// Kikka: a small Me 262 - a triangular-section body, a straight tapered low wing with dihedral, two Ne-20s slung
// under it, one fin (8.13 x 10.0 x 2.95 m).
A['kikka'] = fig({
  cls: 'attack', length: 8.13, span: 10.0, height: 2.95,
  body: [[4.06, 0.0, -0.3, 0.15], [3.6, 0.35, -0.5, 0.45], [2.6, 0.5, -0.6, 0.55], [1.2, 0.75, -0.62, 0.58], [0, 0.75, -0.62, 0.58], [-1.0, 0.5, -0.6, 0.55], [-3.0, 0.4, -0.35, 0.35], [-4.06, 0.3, -0.05, 0.1]], round: [[4, 2.2], [2, 2.8], [-4, 3]],
  wing: [[1.2, 0], [1.1, 0.55], [0.4, 5.0], [-0.6, 5.0], [-1.3, 0.55], [-1.3, 0]], wingUp: -0.45, dihedral: 5,
  fin: [[-2.6, 0], [-3.7, 0], [-4.2, 1.25], [-3.6, 1.3]], finBase: 0.35,
  tail: [[-2.9, 0.2], [-3.2, 1.75], [-3.8, 1.75], [-4.0, 0.2]], planeUp: 0.3,
  nozzles: [[-1.4, -1.55, -0.75], [-1.4, 1.55, -0.75]], nozzle: 0.4,
  bodies: [jetNac(1.6, -1.4, 0.36, 1.55, -0.75)],
  glass: [bubble(1.8, 0.4, 1.05, 0.7, 0.65, 0.33)],
});

// R2Y2 Keiun Kai: the Keiun's long slim body and straight wing, the cockpit far forward, given jets (12.2 x 14.0 m,
// War Thunder's figures; height estimate). V1: two Ne-330s in pods under the wing; V2: in the rear body fed from
// wing-root intakes; V3 (Kai): the same with a big intake in the nose.
function keiun(kind: 'v1' | 'v2' | 'v3'): Spec {
  const rear: Row[] = kind === 'v1' ? [[-3, 0.6, -0.6, 0.55], [-6.1, 0.35, -0.15, 0.15]] : [[-3, 0.65, -0.7, 0.8], [-6.1, 0.5, -0.4, 0.6]];
  const nose: Row = kind === 'v3' ? [6.1, 0.4, -0.45, 0.48] : [6.1, 0.0, -0.3, 0.15];
  return fig({
    cls: 'fighter', length: 12.2, span: 14.0, height: 4.0,
    body: [nose, [5.6, 0.45, -0.55, 0.5], [4.6, 0.62, -0.7, 0.6], [3.0, 0.75, -0.75, 0.68], [0, 0.75, -0.8, 0.72], ...rear],
    wing: [[1.5, 0], [1.4, 0.7], [0.6, 7.0], [-0.6, 7.0], [-1.6, 0.7], [-1.6, 0]], wingUp: -0.35, dihedral: 5,
    fin: [[-3.6, 0], [-5.6, 0], [-6.3, 1.9], [-5.4, 1.95]], finBase: 0.45,
    tail: [[-4.4, 0.2], [-4.9, 2.6], [-5.7, 2.6], [-6.0, 0.2]], planeUp: 0.3,
    nozzles: kind === 'v1' ? [[-1.8, -2.4, -0.75], [-1.8, 2.4, -0.75]] : [[-6.1, -0.35, -0.1], [-6.1, 0.35, -0.1]], nozzle: 0.5,
    bodies: kind === 'v1' ? [jetNac(2.2, -1.8, 0.42, 2.4, -0.75)] : kind === 'v2' ? [jetNac(1.7, -1.2, 0.3, 0.85, -0.25)] : [],
    glass: [bubble(4.4, 2.6, 1.25, 0.72, 0.75, 0.38)],
  });
}
A['r2y2-v1'] = keiun('v1');
A['r2y2-v2'] = keiun('v2');
A['r2y2-v3'] = keiun('v3');

// ---------------------------------------------------------------- Italian, French and Swedish jets

// Sagittario 2: the Derwent in the nose with its exhaust under the middle of the body, a stepped-up boom behind,
// a highly swept low wing and swept tail, the bubble canopy over the engine (9.5 x 7.5 x 2.02 m).
A['sagittario-2'] = fig({
  cls: 'fighter', length: 9.5, span: 7.5, height: 2.02,
  body: [[4.75, 0.3, -0.35, 0.35], [4.2, 0.45, -0.55, 0.5], [2.8, 0.65, -0.65, 0.6], [1.2, 0.7, -0.65, 0.6], [0.0, 0.6, -0.6, 0.55], [-0.4, 0.55, -0.15, 0.4], [-2.5, 0.45, 0.0, 0.25], [-4.75, 0.35, 0.1, 0.12]],
  wing: [[1.5, 0], [1.4, 0.55], [-1.8, 3.75], [-2.6, 3.75], [-1.2, 0.55], [-1.2, 0]], wingUp: -0.2,
  fin: [[-2.4, 0], [-4.0, 0], [-4.9, 1.2], [-4.3, 1.25]], finBase: 0.35,
  tail: [[-3.3, 0.1], [-4.1, 1.5], [-4.7, 1.5], [-4.8, 0.1]], planeUp: 0.3,
  nozzles: [[-0.25, 0, -0.38]], nozzle: 0.5,
  glass: [bubble(2.6, 1.2, 1.05, 0.65, 0.68, 0.35)],
});

// SE.203 Aquilon: the licence-built Sea Venom as a single-seater with a bubble canopy and a bigger radar nose: a
// short pod, a wing swept on the leading edge with tip tanks, twin booms to the round-topped fins and the
// tailplane between them (the Sea Venom's 11.15 x 13.08 x 2.6 m).
A['aquilon-203'] = fig({
  cls: 'fighter', length: 11.15, span: 13.08, height: 2.6,
  body: [[5.58, 0.0, -0.25, 0.18], [5.0, 0.42, -0.55, 0.48], [4.0, 0.6, -0.7, 0.6], [2.6, 0.72, -0.72, 0.72], [0, 0.7, -0.7, 0.75], [-1.6, 0.55, -0.5, 0.55], [-2.2, 0.4, -0.35, 0.35]],
  wing: [[1.8, 0], [1.6, 0.75], [-0.25, 6.3], [-1.35, 6.3], [-1.6, 0.75], [-1.6, 0]], wingUp: -0.05,
  fin: [[-3.8, -0.2], [-5.4, -0.2], [-5.58, 0.7], [-5.3, 1.15], [-4.7, 1.2], [-4.3, 0.8]], finBase: 0, twin: 4.1,
  tail: [[-4.4, 0], [-4.4, 2.25], [-5.3, 2.25], [-5.3, 0]], planeUp: 0.15,
  nozzles: [[-2.2, 0, 0]], nozzle: 0.6,
  bodies: [pod(1.0, -5.0, 0.2, 2.05, 0, 0.2), pod(0.9, -2.0, 0.32, 6.45, -0.05, 0.3)],
  glass: [bubble(3.6, 2.2, 1.15, 0.7, 0.68, 0.36)],
});

// Saab 21R (J21RA and A21RB): the J 21's twin-boom airframe with a Goblin jet in the pod, the tailplane raised up
// the fins clear of the jet (10.45 x 11.37 x 2.95 m).
A['saab-21r'] = fig({
  cls: 'fighter', length: 10.45, span: 11.37, height: 2.95,
  body: [[5.23, -0.05, -0.35, 0.2], [4.7, 0.4, -0.6, 0.5], [3.4, 0.62, -0.7, 0.62], [1.6, 0.75, -0.72, 0.7], [0, 0.68, -0.62, 0.65], [-1.2, 0.45, -0.4, 0.45]],
  wing: [[1.5, 0], [1.4, 0.7], [0.4, 5.68], [-0.6, 5.68], [-1.2, 0.7], [-1.2, 0]], wingUp: -0.2, dihedral: 3,
  fin: [[-3.9, 0], [-5.0, 0], [-5.23, 1.3], [-4.6, 1.45], [-4.2, 1.2]], finBase: -0.4, twin: 3.8,
  tail: [[-4.4, 0], [-4.4, 2.1], [-5.0, 2.1], [-5.0, 0]], planeUp: 0.8,
  nozzles: [[-1.2, 0, 0]], nozzle: 0.55,
  bodies: [pod(1.4, -4.8, 0.22, 1.9, -0.05, 0.2)],
  glass: [bubble(3.0, 1.6, 1.15, 0.7, 0.72, 0.36)],
});

// ---------------------------------------------------------------- piston twin-boom, canard and twin-fuselage fighters

// Saab J 21 (J21A-1, A-2, A21A-3): a pod with the cockpit far forward and the DB 605 behind, turning a pusher
// between two booms, the tailplane low between the fins (10.45 x 11.6 x 3.97 m).
A['saab-j21a'] = fig({
  cls: 'ww2-fighter', length: 10.45, span: 11.6, height: 3.97,
  body: [[5.23, -0.05, -0.35, 0.2], [4.7, 0.4, -0.6, 0.5], [3.4, 0.62, -0.7, 0.62], [1.6, 0.75, -0.72, 0.7], [0, 0.68, -0.62, 0.65], [-1.4, 0.45, -0.4, 0.45], [-1.8, 0.15, -0.15, 0.15]],
  wing: [[1.5, 0], [1.4, 0.7], [0.4, 5.8], [-0.6, 5.8], [-1.2, 0.7], [-1.2, 0]], wingUp: -0.2, dihedral: 3,
  fin: [[-4.0, -0.4], [-5.0, -0.4], [-5.23, 0.7], [-4.7, 1.05], [-4.2, 0.8]], finBase: 0, twin: 3.8,
  tail: [[-4.4, 0], [-4.4, 2.1], [-5.0, 2.1], [-5.0, 0]], planeUp: 0.05,
  bodies: [pod(1.4, -4.8, 0.22, 1.9, -0.05, 0.2), jetNac(0.6, -0.6, 0.18, 0.66, -0.25)],
  props: [[-1.9, 0, 0, 3.1, 3]],
  glass: [bubble(3.0, 1.6, 1.15, 0.7, 0.72, 0.36)],
});

// SO.8000 Narval: a long nacelle with the cockpit ahead of the wing and a pusher behind it, twin booms to the fins
// and the tailplane between them, a straight low wing (11.83 x 11.77 x 3.2 m; propeller and boom spacing estimates).
A['narval'] = fig({
  cls: 'ww2-fighter', length: 11.83, span: 11.77, height: 3.2,
  body: [[5.92, 0.0, -0.3, 0.15], [5.3, 0.45, -0.6, 0.5], [3.6, 0.7, -0.75, 0.65], [1.4, 0.85, -0.78, 0.7], [-0.6, 0.75, -0.7, 0.65], [-2.2, 0.5, -0.45, 0.4], [-2.6, 0.2, -0.2, 0.15]],
  wing: [[1.5, 0], [1.4, 0.7], [0.6, 5.88], [-0.5, 5.88], [-1.2, 0.7], [-1.2, 0]], wingUp: -0.2, dihedral: 4,
  fin: [[-4.0, -0.3], [-5.6, -0.3], [-5.9, 1.2], [-5.3, 1.35], [-4.7, 1.0]], finBase: 0, twin: 4.2,
  tail: [[-4.6, 0], [-4.6, 2.3], [-5.4, 2.3], [-5.4, 0]], planeUp: 0.25,
  bodies: [pod(1.2, -5.4, 0.25, 2.1, 0, 0.2)],
  props: [[-2.75, 0, 0, 3.3, 6]],
  glass: [bubble(3.0, 1.6, 1.25, 0.75, 0.82, 0.38)],
});

// J7W1 Shinden: a canard pusher - canards on the nose, the cockpit behind the middle, a swept wing at the back with
// fins standing above and below it part way out, the six-bladed propeller at the tail (9.76 x 11.11 x 3.92 m).
A['j7w1'] = fig({
  cls: 'ww2-fighter', length: 9.76, span: 11.11, height: 3.92,
  body: [[4.88, 0.0, -0.15, 0.1], [4.4, 0.3, -0.4, 0.35], [3.0, 0.5, -0.55, 0.5], [1.0, 0.6, -0.6, 0.55], [-0.6, 0.85, -0.62, 0.55], [-2.0, 0.75, -0.6, 0.55], [-3.6, 0.55, -0.45, 0.45], [-4.4, 0.4, -0.3, 0.3]],
  wing: [[-0.3, 0], [-0.4, 0.55], [-2.2, 5.56], [-3.2, 5.56], [-2.8, 0.55], [-2.8, 0]], wingUp: -0.2, dihedral: 2,
  fin: [[-1.4, -0.9], [-1.5, 0.85], [-2.0, 0.95], [-2.9, 0.85], [-3.0, -0.9], [-2.6, -1.1]], finBase: -0.12, twin: 4.4,
  bodies: [plane([[0, 4.1, 3.3], [1.8, 3.75, 3.25]], 0.0, 0.08, 0.2), jetNac(-0.4, -2.6, 0.22, 0.62, -0.1)],
  props: [[-4.65, 0, 0, 3.4, 6]],
  glass: [bubble(0.4, -1.2, 1.1, 0.6, 0.85, 0.35)],
});

// F-82E Twin Mustang: two long Mustang fuselages side by side, each with its own canopy and belly scoop, joined by
// the wing's centre section and the tailplane, the Allisons turning opposite ways (12.93 x 15.62 x 4.22 m; the
// fuselages' spacing an estimate).
const TWIN_MUSTANG_SIDE = 2.15;
A['f-82e'] = fig({
  cls: 'ww2-heavy-fighter', length: 12.93, span: 15.62, height: 4.22,
  body: [[0.4, 0.04, -0.04, 0.04], [0, 0.04, -0.04, 0.04]],
  wing: [[1.6, 0], [1.6, 2.6], [0.9, 7.81], [-0.3, 7.81], [-1.0, 2.6], [-1.0, 0]], wingUp: -0.45, dihedral: 5,
  fin: [[-4.0, 0], [-6.4, 0], [-6.45, 1.2], [-6.1, 1.45], [-5.6, 1.4], [-4.9, 0.4]], finBase: 0.35, twin: 2 * TWIN_MUSTANG_SIDE,
  tail: [[-4.6, 0], [-4.6, 2.6], [-4.9, 3.6], [-5.6, 3.6], [-5.9, 2.6], [-5.9, 0]], planeUp: 0.2,
  bodies: [
    { ...fus([[6.47, 0.0, -0.1, 0.15], [6.1, 0.4, -0.45, 0.4], [4.8, 0.55, -0.6, 0.45], [2.6, 0.62, -0.65, 0.45], [0.8, 0.8, -0.65, 0.45], [-1.0, 0.7, -0.7, 0.42], [-3.0, 0.55, -0.45, 0.3], [-5.6, 0.4, -0.05, 0.12], [-6.47, 0.35, 0.15, 0.05]], 2.4, 22), side: TWIN_MUSTANG_SIDE },
    belly(-0.2, -2.4, -0.6, -0.95, 0.3, TWIN_MUSTANG_SIDE),
  ],
  props: [[6.6, TWIN_MUSTANG_SIDE, -0.05, 3.4, 4]],
  glass: [aside(bubble(1.4, -0.4, 1.02, 0.62, 0.62, 0.32), -TWIN_MUSTANG_SIDE), aside(bubble(1.4, -0.4, 1.02, 0.62, 0.62, 0.32), TWIN_MUSTANG_SIDE)],
});

// ---------------------------------------------------------------- biplanes and parasols

// Hawker Fury Mk.I: the slim pointed Kestrel nose with the radiator under it, a staggered single-bay biplane with
// the lower wing a little shorter, the open cockpit, Hawker's round fin (8.15 x 9.14 x 3.1 m). Mk.2: the wheels in
// spats (estimate: same size).
function fury(spats: boolean): Spec {
  const ground = -1.9;
  return fig({
    cls: 'biplane', length: 8.15, span: 9.14, height: 3.1,
    body: [[4.08, 0.05, -0.15, 0.12], [3.7, 0.38, -0.4, 0.38], [2.6, 0.5, -0.5, 0.45], [1.2, 0.5, -0.55, 0.45], [0, 0.5, -0.55, 0.43], [-1.5, 0.4, -0.4, 0.32], [-3.2, 0.25, -0.15, 0.15], [-4.08, 0.2, 0.0, 0.05]], round: [[4, 2.4], [3, 3.4], [-4, 3.4]],
    wing: planOf([[0, 1.55, 0.15], [4.1, 1.55, 0.15]], 0.4), wingUp: -0.5, dihedral: 3,
    fin: [[-3.0, 0], [-4.1, 0], [-4.15, 0.6], [-3.95, 0.9], [-3.6, 0.95], [-3.3, 0.7]], finBase: 0.2,
    tail: [[-3.1, 0.15], [-3.3, 1.6], [-3.9, 1.6], [-4.0, 0.15]], planeUp: 0.25,
    bodies: [
      plane([[0, 2.15, 0.65], [4.57, 2.15, 0.65]], 1.15, 0.12, 0.45),
      belly(1.9, 0.9, -0.5, -0.85, 0.28),
      post(2.0, 1.92, 1.15, -0.45, 0.03, 2.7, -0.1), post(0.9, 0.82, 1.15, -0.4, 0.03, 2.7, -0.1),
      post(1.8, 1.74, 1.15, 0.45, 0.03, 0.42, 0.1), post(0.9, 0.84, 1.15, 0.45, 0.03, 0.42, 0.1),
      ...wheel(1.5, 0.75, -0.5, ground, 0.33, spats),
    ],
    props: [[4.15, 0, 0.0, 2.6, 2]],
    glass: [bubble(1.1, 0.5, 0.78, 0.5, 0.5, 0.22)],
  });
}
A['fury-mk1'] = fury(false);
A['fury-mk2'] = fury(true);

// Dewoitine D.371 (and the D.371 HS9 and the naval D.373, of the same outline): a radial in a long-chord cowl, a
// slim body with the open cockpit, the parasol wing on struts above it, fixed wheels, Dewoitine's round fin
// (7.44 x 11.79 x 3.19 m).
A['d-371'] = fig({
  cls: 'ww2-fighter', length: 7.44, span: 11.79, height: 3.19,
  body: [[3.72, 0.45, -0.45, 0.5], [3.5, 0.55, -0.55, 0.55], [2.6, 0.55, -0.6, 0.5], [1.0, 0.55, -0.6, 0.45], [-1.0, 0.45, -0.45, 0.35], [-3.0, 0.3, -0.15, 0.15], [-3.72, 0.25, 0.0, 0.05]], round: [[3.7, 2.2], [2.6, 2.6], [-3.7, 3.2]],
  wing: planOf([[0, 1.85, 0.15], [5.9, 1.6, 0.2]], 0.5), wingUp: 1.15, dihedral: 1,
  fin: [[-2.8, 0], [-3.7, 0], [-3.8, 0.7], [-3.55, 1.0], [-3.2, 1.0], [-2.95, 0.6]], finBase: 0.25,
  tail: [[-2.8, 0.1], [-3.0, 1.5], [-3.6, 1.5], [-3.7, 0.1]], planeUp: 0.25,
  bodies: [
    post(1.6, 1.52, 1.15, 0.5, 0.03, 0.42, 0.1), post(0.6, 0.52, 1.15, 0.5, 0.03, 0.42, 0.1),
    post(1.3, 1.22, 1.12, -0.45, 0.035, 2.4, -0.4), post(0.7, 0.62, 1.12, -0.45, 0.035, 2.4, -0.4),
    ...wheel(1.9, 0.9, -0.5, -1.9, 0.33),
  ],
  props: [[3.8, 0, 0, 2.9, 3]],
  glass: [bubble(0.6, 0.1, 0.8, 0.55, 0.5, 0.22)],
});

// ---------------------------------------------------------------- floatplanes and flying boats

// He 115 (C-1, and the A-2 that Sweden flew as the T 2): a slim body with the glazed nose and a long canopy, a mid
// wing tapered on its leading edge, two BMW radials, two long floats on struts, a tall fin (17.3 x 22.28 x 6.6 m).
A['he-115'] = fig({
  cls: 'seaplane', length: 17.3, span: 22.28, height: 6.6,
  body: [[8.65, 0.0, -0.5, 0.25], [8.2, 0.5, -0.8, 0.6], [7.0, 0.85, -0.95, 0.72], [5.6, 0.95, -1.0, 0.75], [2, 0.95, -1.0, 0.72], [-2, 0.8, -0.8, 0.6], [-6, 0.55, -0.25, 0.35], [-8.65, 0.4, 0.15, 0.1]],
  wing: planOf([[0, 2.2, -1.4], [11.14, 0.4, -1.0]], 0.6), wingUp: 0.1, dihedral: 3,
  fin: [[-5.0, 0], [-8.2, 0], [-8.8, 2.6], [-8.2, 3.0], [-7.4, 3.0]], finBase: 0.4,
  tail: [[-6.0, 0.3], [-6.4, 3.6], [-7.6, 3.6], [-8.0, 0.3]], planeUp: 0.9,
  bodies: [
    nac(3.1, -1.8, 0.62, 3.4, 0.05),
    float(4.4, -5.2, -2.2, -3.0, 0.5, 2.9),
    post(2.4, 2.2, -0.1, -2.2, 0.04, 3.2), post(-0.8, -1.0, -0.1, -2.2, 0.04, 3.2), post(1.0, 0.85, -0.6, -2.2, 0.04, 1.6),
  ],
  props: [[3.2, 3.4, 0.05, 3.3, 3]],
  glass: [pod(8.75, 7.2, 0.6, 0, -0.1, 0.5), bubble(5.8, 2.6, 1.25, 0.9, 0.85, 0.42)],
});

// Late 298: a single-engined torpedo floatplane, the Hispano's pointed nose, a long glazed canopy, a straight
// mid-low wing, two floats on struts, one fin (12.56 x 15.5 x 5.23 m).
A['late-298'] = fig({
  cls: 'seaplane', length: 12.56, span: 15.5, height: 5.23,
  body: [[6.28, 0.05, -0.2, 0.15], [5.9, 0.5, -0.6, 0.5], [4.6, 0.7, -0.75, 0.62], [3.0, 0.75, -0.8, 0.62], [0, 0.9, -0.8, 0.6], [-2, 0.8, -0.65, 0.5], [-5, 0.5, -0.15, 0.2], [-6.28, 0.4, 0.15, 0.05]],
  wing: planOf([[0, 1.9, -1.0], [2.4, 1.9, -1.0], [7.75, 1.4, -0.4]], 0.4), wingUp: -0.4, dihedral: 2,
  fin: [[-4.0, 0], [-6.2, 0], [-6.6, 1.6], [-6.2, 2.0], [-5.4, 1.9]], finBase: 0.4,
  tail: [[-4.4, 0.2], [-4.8, 2.4], [-5.7, 2.4], [-6.0, 0.2]], planeUp: 0.4,
  bodies: [
    float(3.4, -3.8, -1.9, -2.6, 0.42, 2.2),
    post(1.6, 1.45, -0.5, -1.9, 0.04, 2.2), post(-0.6, -0.75, -0.5, -1.9, 0.04, 2.2), post(1.2, 1.05, -0.7, -1.9, 0.04, 0.9),
  ],
  props: [[6.35, 0, -0.05, 3.0, 3]],
  glass: [bubble(2.8, -0.6, 1.25, 0.75, 0.9, 0.4)],
});

// MBR-2: a wooden boat hull with the stepped keel, the high wing on a pylon, the M-34 in a nacelle on struts over it
// pushing, a tall fin with the braced tailplane up it, floats under the wing (13.5 x 19.0 x 5.36 m; propeller estimate).
A['mbr-2'] = fig({
  cls: 'flying-boat', length: 13.5, span: 19.0, height: 5.36,
  body: [[6.75, -0.2, -0.7, 0.35], [6.2, 0.4, -1.1, 0.7], [5.0, 0.65, -1.25, 0.85], [2.5, 0.75, -1.3, 0.88], [0.5, 0.75, -1.3, 0.88], [-0.2, 0.7, -0.8, 0.8], [-3, 0.6, -0.2, 0.55], [-6.75, 0.5, 0.4, 0.15]], round: 3,
  wing: planOf([[0, 1.8, -1.0], [9.5, 1.8, -1.0]], 0.9), wingUp: 1.4,
  fin: [[-3.6, 0], [-6.6, 0], [-6.9, 2.4], [-6.4, 2.8], [-5.6, 2.7]], finBase: 0.5,
  tail: [[-4.0, 0.2], [-4.3, 2.7], [-5.4, 2.7], [-5.6, 0.2]], planeUp: 1.4,
  bodies: [
    post(1.6, -0.8, 1.4, 0.7, 0.25),
    nac(2.2, -0.7, 0.5, 0, 2.3, false),
    post(1.4, 1.3, 2.0, 1.45, 0.04, 0.4), post(0.0, -0.1, 2.0, 1.45, 0.04, 0.4),
    pod(1.0, -0.8, 0.25, 7.0, 0.35, 0.3), post(0.2, 0.0, 1.35, 0.45, 0.04, 7.0),
  ],
  props: [[-0.85, 0, 2.3, 3.2, 4]],
  glass: [bubble(3.4, 2.2, 1.15, 0.72, 0.72, 0.42)],
});

// BV 238: the largest aircraft of its day - a deep boat hull with its step, the high wing with six DB 603s in
// nacelles along it, a tall single fin, floats under the outer wing (43.35 x 60.17 x 12.8 m; propeller estimate).
A['bv-238'] = fig({
  cls: 'flying-boat', length: 43.35, span: 60.17, height: 12.8,
  body: [[21.68, -0.5, -1.6, 0.6], [20.8, 1.0, -2.6, 1.6], [19.0, 1.9, -3.1, 2.2], [16.5, 2.4, -3.3, 2.4], [10, 2.5, -3.4, 2.45], [4.0, 2.5, -3.4, 2.45], [3.0, 2.4, -2.6, 2.4], [-6, 2.2, -1.8, 2.0], [-14, 1.8, 0.0, 1.3], [-21.68, 1.5, 1.0, 0.4]], round: 3,
  wing: planOf([[0, 5.0, -3.5], [30.08, 0.6, -2.4]], 1.0), wingUp: 2.3, dihedral: 1,
  fin: [[-10, 0], [-19.5, 0], [-21.6, 7.0], [-19.8, 7.4], [-17.0, 7.2]], finBase: 1.6,
  tail: [[-14.5, 0.4], [-15.8, 9.0], [-18.6, 9.0], [-19.8, 0.4]], planeUp: 2.4,
  bodies: [
    nac(7.2, -1.6, 0.75, 6.0, 2.25, false), nac(6.5, -2.0, 0.75, 11.4, 2.3, false), nac(5.8, -2.4, 0.75, 16.8, 2.4, false),
    pod(1.6, -2.6, 0.5, 26.0, -0.2, 0.3), post(0.3, -0.5, 2.6, 0.0, 0.08, 26.0),
  ],
  props: [[7.3, 6.0, 2.25, 3.6, 3], [6.6, 11.4, 2.3, 3.6, 3], [5.9, 16.8, 2.4, 3.6, 3]],
  glass: [bubble(16.2, 13.6, 3.0, 2.3, 2.45, 1.0)],
});

// ---------------------------------------------------------------- multi-engined pistons

// Tandem MAI (Sh-Tandem): a radial in the nose, a two-seat cockpit, the main wing ahead and a rear wing nearly half
// its area at the tail with the fins standing above and below it, a tail gunner (8.5 x 11.0 m; height and rear
// wing estimates).
A['tandem-mai'] = fig({
  cls: 'attack', length: 8.5, span: 11.0, height: 3.2,
  body: [[4.25, 0.45, -0.45, 0.55], [4.0, 0.6, -0.6, 0.65], [3.0, 0.62, -0.65, 0.65], [1.5, 0.7, -0.65, 0.6], [-1, 0.6, -0.55, 0.5], [-3.2, 0.45, -0.3, 0.35], [-4.25, 0.4, -0.1, 0.25]],
  wing: planOf([[0, 2.4, 0.6], [5.5, 1.8, 0.9]], 0.4), wingUp: -0.45, dihedral: 5,
  fin: [[-2.9, -0.6], [-2.8, 0.8], [-3.1, 0.95], [-3.8, 0.9], [-3.95, -0.5], [-3.6, -0.7]], finBase: 0.3, twin: 5.2,
  bodies: [plane([[0, -2.6, -3.9], [4.0, -2.9, -3.9]], 0.3, 0.1, 0.3), dome(-3.6, 0.4, 0.35, 0.9)],
  props: [[4.3, 0, 0, 3.0, 3]],
  glass: [bubble(1.8, 0.0, 1.05, 0.65, 0.6, 0.38)],
});

// NC.223.3: a slab-sided body with a glazed nose, a high wing with four Hispanos in two push-pull nacelles under it,
// twin fins on the tailplane's tips (22.0 x 33.6 x 5.1 m; nacelle and fin spacing estimates).
A['nc-223'] = fig({
  cls: 'ww2-bomber', length: 22.0, span: 33.6, height: 5.1,
  body: [[11.0, 0.0, -0.9, 0.4], [10.4, 0.8, -1.3, 0.9], [9.0, 1.2, -1.4, 1.0], [6.0, 1.3, -1.45, 1.05], [-3, 1.3, -1.4, 1.0], [-8, 1.0, -0.6, 0.7], [-11, 0.7, 0.2, 0.2]], round: 4,
  wing: planOf([[0, 4.0, -1.6], [16.8, 2.2, -0.4]], 0.8), wingUp: 1.25, dihedral: 1,
  fin: [[-9.0, -1.0], [-9.1, 1.2], [-9.6, 1.4], [-10.6, 1.35], [-10.8, -0.9], [-10.3, -1.2]], finBase: 1.0, twin: 7.6,
  tail: [[-8.0, 0], [-8.3, 3.9], [-10.2, 3.9], [-10.4, 0]], planeUp: 1.0,
  bodies: [{ ...nac(4.6, -3.0, 0.7, 5.6, 0.5, false), top: [[4.6, 0.72], [4.1, 1.2], [-2.5, 1.2], [-3.0, 0.72]], bottom: [[4.6, 0.28], [4.1, -0.2], [-2.5, -0.2], [-3.0, 0.28]] }, pod(11.1, 9.4, 0.65, 0, -0.35, 0.5)],
  props: [[4.7, 5.6, 0.5, 3.0, 3], [-3.1, 5.6, 0.5, 3.0, 3]],
  glass: [bubble(8.6, 7.0, 1.7, 1.25, 1.3, 0.75)],
});

// MB.162: a four-engined bomber - a slim, deep body with the glazed nose, a low-mid wing with four radials, twin fins
// on the tailplane's tips (21.91 x 28.1 x 3.76 m).
A['mb-162'] = fig({
  cls: 'ww2-bomber', length: 21.91, span: 28.1, height: 3.76,
  body: [[10.96, 0.0, -0.6, 0.3], [10.4, 0.65, -1.0, 0.8], [9.0, 1.0, -1.15, 0.95], [6.5, 1.15, -1.2, 0.95], [0, 1.1, -1.2, 0.9], [-5, 0.9, -0.7, 0.7], [-9, 0.65, -0.1, 0.35], [-10.96, 0.5, 0.2, 0.15]],
  wing: planOf([[0, 3.2, -1.4], [14.05, 0.8, -1.0]], 0.6), wingUp: -0.4, dihedral: 4,
  fin: [[-8.4, -0.7], [-8.5, 1.4], [-8.9, 1.6], [-9.9, 1.55], [-10.0, -0.6], [-9.6, -0.85]], finBase: 0.5, twin: 7.2,
  tail: [[-8.0, 0], [-8.3, 3.8], [-9.6, 3.8], [-9.9, 0]], planeUp: 0.5,
  bodies: [nac(4.4, -2.4, 0.65, 3.6, -0.15), nac(3.9, -2.2, 0.62, 7.4, 0.12)],
  props: [[4.5, 3.6, -0.15, 3.2, 3], [4.0, 7.4, 0.12, 3.2, 3]],
  glass: [pod(11.05, 9.6, 0.6, 0, -0.2, 0.5), bubble(7.2, 5.6, 1.55, 1.1, 1.15, 0.6)],
});

// PB4Y-2 Privateer: the Liberator's Davis wing on a much longer body, the tall single fin, oval cowlings, the bow
// turret, two dorsal turrets and waist blisters (22.73 x 33.53 x 9.17 m).
A['pb4y-2-privateer'] = fig({
  cls: 'patrol', length: 22.73, span: 33.53, height: 9.17,
  body: [[11.37, 0.3, -0.8, 0.5], [10.8, 0.75, -1.35, 0.9], [9.6, 1.15, -1.6, 1.15], [8.0, 1.3, -1.65, 1.2], [0, 1.3, -1.65, 1.2], [-5, 1.15, -1.1, 1.05], [-9, 0.9, -0.3, 0.65], [-11.37, 0.7, 0.2, 0.25]], round: 3,
  wing: planOf([[0, 2.6, -2.2], [6.0, 2.4, -1.9], [16.77, 0.8, -0.3]], 0.4), wingUp: 0.9, dihedral: 2,
  fin: [[-6.0, 0], [-8.4, 0.4], [-10.4, 4.1], [-11.8, 4.3], [-12.1, 3.4], [-11.4, 0]], finBase: 0.9,
  tail: [[-8.2, 0.3], [-8.8, 4.8], [-10.6, 4.8], [-11.2, 0.3]], planeUp: 0.6,
  bodies: [nac(4.3, -3.4, 0.7, 3.4, 0.7, true, 0.3, 0.75), nac(3.8, -2.8, 0.7, 7.6, 0.85, true, 0.3, 0.75), dome(6.6, 1.3, 0.55, 1.3), dome(1.6, 1.3, 0.55, 1.3), dome(-4.6, 0.3, 0.45, 1.4, 1, 1.05)],
  props: [[4.4, 3.4, 0.7, 3.53, 3], [3.9, 7.6, 0.85, 3.53, 3]],
  glass: [pod(11.6, 10.4, 0.55, 0, 0.0, 0.5), bubble(9.0, 7.6, 1.75, 1.25, 1.3, 0.75)],
});

// Saab B 18: a slim body with the cockpit offset to port above a glazed bomb-aimer's nose, a mid wing, twin fins on
// the tailplane's tips (13.23 x 17.04 x 4.35 m). B18A with Twin Wasp radials; B18B with DB 605 inlines; T18B the
// attack version with a solid gun nose and the inlines.
function saab18(radial: boolean, glassNose: boolean): Spec {
  const nacelle = radial ? nac(3.1, -2.4, 0.66, 2.6, -0.1) : nac(3.5, -2.6, 0.55, 2.6, -0.1, false, 0.15);
  return fig({
    cls: glassNose ? 'ww2-bomber' : 'ww2-heavy-fighter', length: 13.23, span: 17.04, height: 4.35,
    body: [[6.62, glassNose ? -0.1 : 0.0, -0.6, glassNose ? 0.3 : 0.15], [6.2, 0.45, -0.8, 0.6], [5.2, 0.7, -0.9, 0.7], [3.5, 0.8, -0.92, 0.72], [0, 0.8, -0.9, 0.68], [-3, 0.6, -0.55, 0.5], [-6.62, 0.35, 0.0, 0.1]],
    wing: planOf([[0, 1.8, -1.2], [8.52, 0.6, -0.6]], 0.4), wingUp: -0.2, dihedral: 5,
    fin: [[-5.4, -0.7], [-5.5, 1.2], [-5.9, 1.4], [-6.7, 1.35], [-6.8, -0.6], [-6.4, -0.85]], finBase: 0.4, twin: 5.0,
    tail: [[-5.0, 0], [-5.3, 2.6], [-6.3, 2.6], [-6.5, 0]], planeUp: 0.4,
    bodies: [nacelle],
    props: [[(radial ? 3.1 : 3.5) + 0.1, 2.6, -0.1, 3.3, 3]],
    glass: [aside(bubble(4.4, 2.4, 1.35, 0.8, 0.8, 0.42), -0.25), ...(glassNose ? [pod(6.7, 5.4, 0.45, 0, -0.45, 0.5)] : [])],
  });
}
A['saab-b18a'] = saab18(true, true);
A['saab-b18b'] = saab18(false, true);
A['saab-t18b'] = saab18(false, false);

// ---------------------------------------------------------------- Japanese twin-engined bombers

// Ki-21: a slim body with the glazed nose, a long stepped canopy and the dorsal gunner's glazing behind the wing, a
// mid wing with dihedral, two radials in slim nacelles, a tall rounded fin (16.0 x 22.5 x 4.35 m).
A['ki-21'] = fig({
  cls: 'ww2-bomber', length: 16.0, span: 22.5, height: 4.35,
  body: [[8.0, 0.0, -0.45, 0.25], [7.6, 0.55, -0.85, 0.65], [6.6, 0.85, -0.95, 0.75], [5.0, 1.1, -1.0, 0.78], [0, 1.05, -1.0, 0.75], [-3, 0.85, -0.7, 0.6], [-6.5, 0.55, -0.1, 0.3], [-8.0, 0.45, 0.15, 0.1]],
  wing: planOf([[0, 2.6, -1.4], [11.25, 0.7, -0.9]], 0.6), wingUp: -0.1, dihedral: 6,
  fin: [[-5.0, 0], [-6.5, 0.6], [-7.4, 2.4], [-7.9, 2.55], [-8.3, 2.2], [-8.2, 0]], finBase: 0.55,
  tail: [[-6.0, 0.3], [-6.4, 3.4], [-7.6, 3.4], [-8.0, 0.3]], planeUp: 0.5,
  bodies: [nac(3.9, -2.0, 0.65, 3.2, 0.2, true, 0.1)],
  props: [[4.0, 3.2, 0.2, 3.4, 3]],
  glass: [pod(8.1, 6.6, 0.6, 0, -0.15, 0.5), bubble(6.2, 3.6, 1.45, 1.0, 1.05, 0.5), bubble(0.0, -1.8, 1.35, 1.05, 0.95, 0.4)],
});

// Ki-49 Donryu: a deeper body with the glazed nose and the cockpit well forward, a mid wing, big radials, a dorsal
// turret over the wing's trailing edge, a single fin (16.5 x 20.42 x 4.25 m).
A['ki-49'] = fig({
  cls: 'ww2-bomber', length: 16.5, span: 20.42, height: 4.25,
  body: [[8.25, 0.0, -0.5, 0.25], [7.8, 0.55, -0.9, 0.7], [6.8, 0.9, -1.05, 0.8], [5.4, 1.15, -1.1, 0.82], [0, 1.1, -1.1, 0.8], [-3, 0.9, -0.75, 0.62], [-6.8, 0.6, -0.1, 0.3], [-8.25, 0.5, 0.15, 0.15]],
  wing: planOf([[0, 2.4, -1.5], [10.21, 0.7, -0.8]], 0.5), wingUp: -0.1, dihedral: 5,
  fin: [[-5.4, 0], [-6.8, 0.5], [-7.7, 2.5], [-8.2, 2.6], [-8.5, 2.2], [-8.4, 0]], finBase: 0.6,
  tail: [[-6.4, 0.3], [-6.8, 3.4], [-7.9, 3.4], [-8.3, 0.3]], planeUp: 0.5,
  bodies: [nac(4.0, -2.2, 0.7, 3.0, 0.2, true, 0.1), dome(-1.8, 1.05, 0.5, 1.2)],
  props: [[4.1, 3.0, 0.2, 3.4, 3]],
  glass: [pod(8.35, 6.9, 0.62, 0, -0.15, 0.5), bubble(6.4, 4.4, 1.45, 1.05, 1.1, 0.5)],
});

// Ki-67 Hiryu: a long slim body with the glazed nose, a stepped cockpit, the dorsal turret behind it, a mid wing,
// two Ha-104 radials, a tall fin with a long dorsal fillet (18.7 x 22.5 x 7.7 m as published).
A['ki-67'] = fig({
  cls: 'ww2-bomber', length: 18.7, span: 22.5, height: 7.7,
  body: [[9.35, 0.0, -0.5, 0.25], [8.9, 0.55, -0.9, 0.65], [7.8, 0.85, -1.0, 0.75], [6.4, 1.1, -1.05, 0.78], [0, 1.05, -1.05, 0.76], [-4, 0.85, -0.7, 0.58], [-7.8, 0.6, -0.1, 0.3], [-9.35, 0.5, 0.15, 0.12]],
  wing: planOf([[0, 2.7, -1.5], [11.25, 0.8, -0.8]], 0.6), wingUp: -0.15, dihedral: 6,
  fin: [[-4.6, 0], [-7.2, 0.6], [-8.6, 2.8], [-9.1, 2.95], [-9.5, 2.5], [-9.35, 0]], finBase: 0.6,
  tail: [[-7.0, 0.3], [-7.5, 3.6], [-8.8, 3.6], [-9.2, 0.3]], planeUp: 0.5,
  bodies: [nac(4.5, -2.6, 0.72, 3.4, 0.15, true, 0.1), dome(2.6, 1.1, 0.5, 1.1)],
  props: [[4.6, 3.4, 0.15, 3.6, 4]],
  glass: [pod(9.45, 8.0, 0.6, 0, -0.15, 0.5), bubble(7.2, 4.9, 1.5, 1.05, 1.1, 0.52)],
});

// ---------------------------------------------------------------- jets once drawn from proportions

// A-10A / A-10C Thunderbolt II: a deep box-sided body with the bubble high over the nose and the gun's muzzle under
// it, the thick straight low wing with the main wheels' pods hanging ahead of it, the two TF34s in big round
// nacelles on short pylons beside the rear body, the H tail low at the very end (16.26 x 17.53 x 4.47 m). The A-10C
// differs from the A only inside (avionics and cockpit), so the two share this outline. Checked by eye against a
// public 3-view (estimates): belly to canopy top 2.2 m (figure 2.2), body 1.3 m wide at the cockpit, nacelles 1.4 m
// across with their tops level with the canopy, 1.4 m out; wheel pods 2.7 m out; the tail boom only 0.4 m deep;
// fins 5.9 m apart, their tops 1 m over the canopy.
A['a-10c'] = fig({
  cls: 'attack', length: 16.26, span: 17.53, height: 4.47,
  body: [[8.13, -0.15, -0.55, 0.15], [7.5, 0.25, -0.85, 0.48], [6.6, 0.5, -0.95, 0.62], [6.1, 0.58, -0.98, 0.65], [4.0, 0.72, -1.0, 0.66], [2.0, 0.78, -0.92, 0.66], [0, 0.74, -0.82, 0.64], [-1.9, 0.54, -0.68, 0.56], [-3.0, 0.4, -0.45, 0.48], [-5.4, 0.12, -0.38, 0.36], [-7.7, 0.0, -0.4, 0.26], [-8.13, -0.02, -0.38, 0.2]], round: 3,
  wing: [[1.5, 0], [1.5, 0.8], [1.4, 2.6], [1.0, 8.765], [-0.6, 8.765], [-1.5, 2.6], [-1.5, 0]], wingUp: -0.45, dihedral: 0, outerDihedral: { at: 3.0, deg: 7 }, thick: 0.16,
  fin: [[-5.95, 0], [-8.0, 0], [-7.65, 2.8], [-6.35, 2.8]], finBase: -0.6, twin: 5.9,
  tail: [[-6.4, 0], [-6.4, 2.95], [-7.9, 2.95], [-7.9, 0]], planeUp: 0,
  nozzles: [[-5.3, -1.38, 0.68], [-5.3, 1.38, 0.68]], nozzle: 0.9,
  bodies: [jetNac(-1.8, -5.3, 0.7, 1.38, 0.68), post(-2.4, -4.4, 0.35, 0.0, 0.22, 0.78), pod(2.6, -0.6, 0.3, 2.67, -0.75, 0.3), pod(8.7, 7.9, 0.12, 0, -0.45, 0.1)],
  glass: [bubble(6.1, 3.3, 1.22, 0.58, 0.8, 0.46)],
});

// SEPECAT Jaguar: a long slab-sided body over two Adours, the box intakes behind the cockpit, the shoulder wing with
// 3 degrees of anhedral and a dogtooth, the tall swept fin, all-moving tailplanes low on the body, twin ventral fins
// (single seat 16.83 x 8.69 x 4.89 m). Jaguar A (and the export S / IS): the sharp pointed nose and its probe.
// GR.1 / GR.1A: the chisel laser-ranger nose and the warning receiver's bullet on the fin top. T.2 and E: two seats
// under a long stepped canopy, the nose 0.7 m longer (17.53 m). Checked by eye against a public 3-view (estimates):
// belly to canopy top 1.85 m, 1.65 m deep over the intakes, 1.2 m at the nozzles, 2.05 m wide over the 1.3 m tall
// intakes, the fin's top 4 m over the belly.
function jaguar(kind: 'a' | 'gr1' | 'two'): Spec {
  const s = kind === 'two' ? 0.7 : 0;
  const n = 8.415 + s;
  const nose: Row[] = kind === 'gr1' ? [[n, -0.2, -0.48, 0.14], [n - 0.35, 0.02, -0.62, 0.3], [n - 1.0, 0.2, -0.7, 0.42]] : [[n, -0.12, -0.22, 0.04], [n - 1.0, 0.15, -0.55, 0.32]];
  return fig({
    cls: kind === 'two' ? 'trainer' : 'attack', length: 16.83 + s, span: 8.69, height: 4.89,
    body: [...nose, [6.4 + s, 0.42, -0.7, 0.5], [5.2 + s, 0.56, -0.75, 0.54], [4.0 + s, 0.64, -0.78, 0.56], [2.6, 0.72, -0.84, 0.58], [1.0, 0.76, -0.88, 0.62], [-1.5, 0.78, -0.86, 0.8], [-4.0, 0.76, -0.75, 0.88], [-6.5, 0.72, -0.62, 0.85], [-8.415, 0.6, -0.5, 0.75]], round: 3,
    wing: [[0.8, 0], [0.8, 0.95], [-1.05, 2.6], [-0.9, 2.66], [-2.55, 4.345], [-3.5, 4.345], [-3.45, 0.95], [-3.5, 0]], wingUp: 0.62, dihedral: -3,
    fin: [[-3.6, 0], [-7.6, 0], [-8.4, 2.5], [-7.2, 2.55]], finBase: 0.62,
    tail: [[-5.9, 0.75], [-7.0, 2.27], [-8.0, 2.27], [-8.15, 0.75]], planeUp: 0, planeDihedral: -10,
    nozzles: [[-8.415, -0.42, -0.12], [-8.415, 0.42, -0.12]], nozzle: 0.7,
    bodies: [
      trunk(2.8, -2.6, 0.5, -0.82, 0.31, 0.72, 0.3, 4),
      spine(kind === 'two' ? 2.6 : 3.3, -3.8, 0.72, 0.1, 0.3),
      post(-6.0, -7.6, -0.65, -1.05, 0.03, 0.4, 0.15),
      ...(kind === 'gr1' ? [pod(-6.9, -8.7, 0.13, 0, 3.15, 0.25)] : kind === 'a' ? [pod(n + 0.8, n - 0.1, 0.035, 0, -0.17, 0.1)] : []),
    ],
    glass: [kind === 'two' ? tandem(6.3 + s - 0.7, 2.6, 1.1, 1.24, 0.58, 0.72, 0.42) : bubble(5.5, 3.3, 1.12, 0.56, 0.7, 0.42)],
  });
}
A['jaguar'] = jaguar('a');
A['jaguar-gr1'] = jaguar('gr1');
A['jaguar-t2'] = jaguar('two');

// Hawker Hunter: a smooth round body round the Avon, the pointed nose, the bubble canopy and a fairing behind it,
// triangular intakes in the wing roots, a 40-degree mid wing, the tailplane a third of the way up the swept fin
// (13.98 x 10.26 x 4.01 m). F.1: the plain leading edge. F.6 (and F.58, Dutch and Swedish F.6 and F.50): the
// dogtooth and the "Sabrina" link blisters under the cockpit. FGA.9: the same with the brake parachute's fairing over
// the jet pipe. T.7: two seats side by side in a broad, deep nose (14.9 m).
// Body, wing, tailplane and fin digitised from FM 30-30's Hunter silhouettes (1954, see sources.md) scaled to the
// published length and span (the drawn wing comes out at 31.6 m2, the F.1's published area): the wing's root 4.04 m
// behind the nose, the fin's top 2.25 m over the nose's height, the tailplane on the fin 0.83 m up. Heights are from
// the nose tip's level; behind the fin's root the body runs down to the jet pipe (0.7 m across) under the rudder.
const HUNTER_BODY: Row[] = [
  [6.99, 0.06, -0.06, 0.03], [6.47, 0.3, -0.32, 0.3], [5.96, 0.43, -0.46, 0.44], [5.44, 0.5, -0.56, 0.52], [4.92, 0.56, -0.63, 0.58], [4.41, 0.68, -0.69, 0.63],
  [3.89, 0.79, -0.71, 0.65], [3.37, 0.86, -0.75, 0.66], [2.86, 0.79, -0.75, 0.7], [2.34, 0.71, -0.75, 0.69], [1.82, 0.69, -0.77, 0.68], [0.79, 0.65, -0.79, 0.67],
  [-0.76, 0.61, -0.79, 0.64], [-2.31, 0.58, -0.8, 0.62], [-2.83, 0.58, -0.79, 0.61], [-3.34, 0.65, -0.77, 0.61], [-3.86, 0.77, -0.75, 0.61], [-4.38, 0.84, -0.71, 0.58],
  [-4.89, 0.75, -0.69, 0.54], [-5.41, 0.65, -0.68, 0.5], [-5.93, 0.55, -0.58, 0.46], [-6.45, 0.45, -0.5, 0.41], [-6.96, 0.36, -0.33, 0.35],
];
const HUNTER_WING: P2[] = [[2.95, 0], [2.95, 0.76], [2.73, 1.14], [2.55, 1.34], [2.43, 1.59], [0.76, 3.34], [-0.55, 4.66], [-1.67, 5.11], [-2.02, 5.13], [-2.37, 5.11], [-2.6, 4.66], [-1.84, 2.94], [-1.71, 2.55], [-1.28, 1.59], [-1.04, 0.97], [-1.03, 0.85], [-1.18, 0.76], [-1.18, 0]];
/** The F.6's dogtooth: the leading edge outboard of 3.25 m out brought forward, a notch at its inner end. */
const HUNTER_DOG: P2[] = [[2.95, 0], [2.95, 0.76], [2.73, 1.14], [2.55, 1.34], [2.43, 1.59], [0.67, 3.25], [0.86, 3.27], [-0.44, 4.66], [-1.62, 5.11], [-2.02, 5.13], [-2.37, 5.11], [-2.6, 4.66], [-1.84, 2.94], [-1.71, 2.55], [-1.28, 1.59], [-1.04, 0.97], [-1.03, 0.85], [-1.18, 0.76], [-1.18, 0]];

function hunter(kind: 'f1' | 'f6' | 'fga9' | 't7'): Spec {
  const t7 = kind === 't7';
  // The T.7's broad side-by-side nose, 0.92 m longer, ahead of the single-seater's body from behind the cockpit.
  const body: Row[] = t7
    ? [[7.91, -0.05, -0.25, 0.08], [7.2, 0.25, -0.52, 0.42], [6.1, 0.55, -0.74, 0.7], [4.9, 0.69, -0.8, 0.8], [3.6, 0.75, -0.8, 0.82], [2.2, 0.73, -0.78, 0.76], ...HUNTER_BODY.filter((r) => r[0] < 1)]
    : HUNTER_BODY;
  const dog = kind !== 'f1';
  return fig({
    cls: t7 ? 'trainer' : kind === 'fga9' ? 'attack' : 'fighter', length: t7 ? 14.9 : 13.98, span: 10.26, height: 4.01,
    body, round: 2.2,
    wing: dog ? HUNTER_DOG : HUNTER_WING, wingUp: -0.15,
    fin: [[-4.18, 0], [-4.47, 0.15], [-5.56, 0.96], [-6.0, 1.23], [-6.46, 1.36], [-6.89, 1.35], [-6.98, 1.29], [-6.98, -0.6], [-4.18, -0.1]], finBase: 0.88,
    tail: [[-5.26, 0], [-5.26, 0.92], [-6.08, 1.68], [-6.43, 1.82], [-6.62, 1.84], [-6.81, 1.82], [-6.94, 1.68], [-6.63, 0.92], [-6.63, 0]], planeUp: 0.83,
    nozzles: [[-6.96, 0, 0.01]], nozzle: 0.66,
    bodies: [
      // The intakes' triangular fairings in the wing roots, round the wing's root ahead of its spar.
      trunk(2.95, 0.4, 0.14, -0.4, 0.3, 0.86, 0, 4),
      ...(kind === 'f6' || kind === 'fga9' ? [pod(4.6, 3.3, 0.15, 0.42, -0.72, 0.3)] : []),
      ...(kind === 'fga9' ? [pod(-6.0, -7.3, 0.17, 0, 0.42, 0.2)] : []),
    ],
    glass: [t7 ? sideBySide(5.0, 3.0, 1.45, 0.69, 0.75, 0.62) : bubble(5.22, 3.45, 0.95, 0.53, 0.86, 0.38)],
  });
}
A['hunter-f1'] = hunter('f1');
A['hunter'] = hunter('f6');
A['hunter-fga9'] = hunter('fga9');
A['hunter-t7'] = hunter('t7');

// F-104 Starfighter: a long needle of a body, the half-cone intakes behind the cockpit, a dorsal spine, the tiny
// trapezoid wing with 10 degrees of anhedral, the T-tail, a ventral fin (16.66 x 6.36 x 4.09 m; the length over the
// 1.07 m nose probe). F-104A / C: the small fin, Sidewinders on the tips. F-104G / J: the fin a tenth bigger each way,
// tip tanks. F-104S: the G with two more ventral fins.
// Body, wing, tailplane and fin digitised from NASA's F-104 three-view (see sources.md), scaled so its length over
// the probe is the published one: the wing's root 9.0 m behind the probe's tip (its trailing edge 12.1 m), the canopy
// 3.1-5.2 m ahead of the middle, the spine 0.95 m over the nose tip's level, the fin's top 2.72 m, the wing's root
// 0.3 m up falling 10 degrees to its tips. Heights are from the nose tip's level.
function starfighter(kind: 'a' | 'g' | 's'): Spec {
  const tip = 0.3 - 3.18 * Math.tan((10 * Math.PI) / 180);
  const g = kind === 'a' ? 1 : 1.1;
  const fin: P2[] = [[-4.44, 0], [-5.08, 0.45], [-6.29, 1.65], [-6.59, 1.74], [-6.9, 1.74], [-7.34, 1.66], [-7.75, 1.52], [-7.6, 0.6], [-7.35, -0.1], [-4.44, -0.1]];
  // The G's bigger fin: grown about its root's leading edge.
  const fins = fin.map(([x, h]) => [-4.44 + (x + 4.44) * g, h * g] as P2);
  const top = 0.98 + 1.74 * g;
  return fig({
    cls: 'fighter', length: 16.66, span: 6.36, height: 4.09,
    body: [
      [7.26, 0.02, -0.02, 0.03], [6.72, 0.16, -0.14, 0.18], [6.18, 0.31, -0.24, 0.29], [5.64, 0.45, -0.33, 0.37], [5.1, 0.57, -0.4, 0.43], [4.56, 0.69, -0.45, 0.49],
      [4.02, 0.8, -0.48, 0.53], [3.48, 0.92, -0.5, 0.56], [2.94, 0.97, -0.52, 0.57], [2.4, 0.94, -0.53, 0.58], [1.33, 0.94, -0.5, 0.6], [-0.29, 0.95, -0.47, 0.6],
      [-2.45, 0.97, -0.43, 0.6], [-4.06, 0.98, -0.45, 0.6], [-5.14, 0.95, -0.32, 0.58], [-6.22, 0.85, -0.19, 0.53], [-7.3, 0.85, 0.05, 0.42],
    ], round: 2.1,
    wing: [[-0.6, 0], [-0.6, 0.62], [-0.9, 1.0], [-1.97, 3.18], [-3.53, 3.18], [-3.94, 1.0], [-4.1, 0.62], [-4.1, 0]], wingUp: 0.3, dihedral: -10,
    fin: fins, finBase: 0.98, tee: true,
    tail: [[-6.45, 0], [-7.11, 1.78], [-7.72, 1.8], [-8.2, 0]],
    nozzles: [[-7.3, 0, 0.45]], nozzle: 0.85,
    bodies: [
      // The half-cone intakes either side behind the cockpit, faired back along the body over the wing's root.
      trunk(1.0, -3.6, 0.6, -0.2, 0.25, 0.79, 0, 2.2),
      // The nose probe, and the bullet at the top of the fin where the tailplane sits.
      pod(8.33, 7.0, 0.035, 0, 0.0, 0.1),
      pod(-6.2, -8.33, 0.13, 0, top - 0.17, 0.3),
      post(-4.6, -5.8, -0.25, -0.6, 0.03, undefined, 0.2),
      kind === 'a' ? pod(-0.2, -3.0, 0.07, 3.25, tip, 0.15) : pod(-0.5, -4.1, 0.3, 3.35, tip, 0.3),
      ...(kind === 's' ? [post(-5.2, -6.6, -0.1, -0.55, 0.03, 0.42, 0.2)] : []),
    ],
    glass: [bubble(5.17, 3.14, 1.03, 0.56, 0.97, 0.34)],
  });
}
A['f-104'] = starfighter('a');
A['f-104g'] = starfighter('g');
A['f-104s'] = starfighter('s');

// F-84G Thunderjet: a fat round body with the round nose intake, the framed teardrop canopy, a straight mid-low wing
// with tip tanks, a straight tail (11.6 x 11.1 x 3.84 m). F-84F Thunderstreak: a deeper oval body, the canopy faired
// into a spine to the fin, the 40-degree wing, a taller swept fin (13.23 x 10.24 x 4.39 m).
A['f-84g'] = fig({
  cls: 'fighter', length: 11.6, span: 11.1, height: 3.84,
  body: [[5.8, 0.42, -0.42, 0.42], [5.2, 0.56, -0.6, 0.56], [4.0, 0.64, -0.7, 0.63], [3.0, 0.7, -0.73, 0.66], [1.5, 0.73, -0.75, 0.68], [0, 0.7, -0.74, 0.68], [-2.0, 0.62, -0.62, 0.6], [-4.0, 0.48, -0.46, 0.46], [-5.8, 0.36, -0.33, 0.33]], round: 2,
  wing: [[1.2, 0], [1.2, 0.7], [0.75, 5.25], [-0.5, 5.25], [-1.4, 0.7], [-1.4, 0]], wingUp: -0.3, dihedral: 4, thick: 0.09,
  fin: [[-2.6, 0], [-5.4, 0], [-6.0, 2.2], [-4.9, 2.25]], finBase: 0.4,
  tail: [[-4.1, 0], [-4.5, 2.0], [-5.5, 2.0], [-5.7, 0]], planeUp: 0.25,
  nozzles: [[-5.8, 0, 0]], nozzle: 0.62,
  bodies: [pod(1.3, -2.1, 0.34, 5.6, 0.07, 0.3)],
  glass: [bubble(3.0, 1.1, 1.24, 0.66, 0.72, 0.36)],
});
A['f-84f'] = fig({
  cls: 'fighter', length: 13.23, span: 10.24, height: 4.39,
  body: [[6.615, 0.42, -0.46, 0.44], [6.0, 0.6, -0.66, 0.57], [4.8, 0.74, -0.8, 0.65], [3.6, 0.84, -0.84, 0.7], [2.0, 0.9, -0.86, 0.72], [0, 0.88, -0.86, 0.72], [-2.0, 0.82, -0.76, 0.66], [-4.0, 0.7, -0.6, 0.55], [-6.615, 0.5, -0.4, 0.4]], round: 2.1,
  wing: [[1.0, 0], [1.0, 0.72], [-2.6, 5.12], [-3.7, 5.12], [-2.9, 0.72], [-2.9, 0]], wingUp: -0.35,
  fin: [[-2.4, 0], [-6.2, 0], [-7.0, 2.5], [-5.8, 2.55]], finBase: 0.55,
  tail: [[-4.8, 0], [-5.8, 2.1], [-6.6, 2.1], [-6.7, 0]], planeUp: 0.3,
  nozzles: [[-6.615, 0, 0]], nozzle: 0.75,
  bodies: [spine(1.9, -4.4, 0.86, 0.14, 0.22)],
  glass: [bubble(3.8, 1.9, 1.38, 0.84, 0.9, 0.36)],
});

// F-8 Crusader: the radome over the wide-mouthed chin intake, a long body, the bubble faired into a spine, the
// shoulder wing with 5 degrees of anhedral and the dogtooth at the fold, the big fin, tailplanes low on the body,
// ventral strakes (16.53 x 10.87 x 4.8 m). F-8C (F8U-2): the slim early radome. F-8E: the fatter radome for the
// bigger radar and the infrared seeker's dome on top of the nose. Both with the refuelling probe's fairing on the
// left side behind the cockpit.
function crusader(e: boolean): Spec {
  const nose: Row[] = e ? [[8.265, 0.0, -0.08, 0.06], [7.8, 0.28, -0.32, 0.36]] : [[8.265, 0.02, -0.06, 0.04], [7.8, 0.22, -0.26, 0.27]];
  return fig({
    cls: 'fighter', length: 16.53, span: 10.87, height: 4.8,
    body: [...nose, [7.6, 0.33, -0.88, 0.58], [6.6, 0.45, -0.92, 0.62], [5.4, 0.58, -0.95, 0.65], [4.2, 0.68, -0.95, 0.66], [2.0, 0.78, -0.92, 0.7], [-1.0, 0.78, -0.88, 0.72], [-4.0, 0.68, -0.75, 0.66], [-6.5, 0.58, -0.58, 0.58], [-8.265, 0.5, -0.45, 0.5]], round: [[8.2, 2.1], [7.6, 2.6], [-8.2, 2.3]],
    wing: [[1.6, 0], [1.6, 0.75], [-1.8, 4.0], [-1.55, 4.05], [-3.0, 5.435], [-3.9, 5.435], [-3.6, 0.75], [-3.6, 0]], wingUp: 0.62, dihedral: -5,
    fin: [[-2.6, 0], [-7.2, 0], [-8.2, 2.7], [-6.8, 2.75]], finBase: 0.6,
    tail: [[-5.4, 0.6], [-6.6, 2.6], [-7.7, 2.6], [-8.0, 0.6]], planeUp: -0.15,
    nozzles: [[-8.265, 0, 0]], nozzle: 0.85,
    bodies: [spine(3.4, -3.6, 0.78, 0.12, 0.28), post(-4.6, -6.8, -0.6, -1.0, 0.03, 0.35, 0.1), oneSide(pod(3.4, 1.8, 0.13, -0.6, 0.5, 0.3)), ...(e ? [dome(6.3, 0.48, 0.13, 0.5)] : [])],
    glass: [bubble(5.4, 3.4, 1.24, 0.6, 0.76, 0.38)],
  });
}
A['f-8c'] = crusader(false);
A['f-8e'] = crusader(true);

// Gloster Meteor: a slim body with the cockpit ahead of the straight wing, the two engines in big round nacelles
// through it, the cruciform tail. F.8: the nose 0.76 m longer, the bubble canopy, the squarer fin, clipped tips
// (13.59 x 11.32 x 3.96 m). F.3 / F.4: the short body, the framed canopy, the rounded fin (12.57 m). NF.11 to NF.14:
// the long radar nose, two seats under a long framed canopy, the long-span wing (14.78 x 13.11 m).
function meteor(kind: 'f3' | 'f8' | 'nf'): Spec {
  const nf = kind === 'nf';
  const front: Row[] = nf
    ? [[7.985, 0.05, -0.14, 0.08], [7.3, 0.36, -0.46, 0.45], [6.2, 0.56, -0.66, 0.58], [5.0, 0.66, -0.73, 0.62], [3.6, 0.69, -0.75, 0.62]]
    : kind === 'f8'
      ? [[6.795, 0.0, -0.15, 0.06], [6.2, 0.3, -0.45, 0.38], [5.0, 0.55, -0.65, 0.55], [3.6, 0.66, -0.73, 0.6]]
      : [[5.775, 0.0, -0.15, 0.06], [5.2, 0.3, -0.45, 0.38], [4.0, 0.55, -0.65, 0.55], [2.9, 0.66, -0.73, 0.6]];
  const h = nf ? 6.555 : 5.66;
  return fig({
    cls: nf ? 'fighter' : 'fighter', length: nf ? 14.78 : kind === 'f8' ? 13.59 : 12.57, span: nf ? 13.11 : 11.32, height: 3.96,
    body: [...front, [2.0, 0.7, -0.75, 0.62], [0, 0.68, -0.72, 0.6], [-2.0, 0.6, -0.58, 0.5], [-4.0, 0.48, -0.4, 0.38], [-6.795, 0.35, -0.22, 0.25]], round: 2.1,
    wing: [[1.5, 0], [1.5, 2.4], [0.85, h], [-0.3, h], [-1.5, 2.4], [-1.6, 0]], wingUp: -0.05, dihedral: 3, thick: 0.1,
    fin: kind === 'f8' ? [[-4.5, 0], [-6.6, 0], [-6.95, 2.2], [-5.9, 2.25]] : [[-4.6, 0], [-6.6, 0], [-6.75, 1.3], [-6.5, 1.9], [-6.0, 2.05], [-5.4, 1.6]], finBase: 0.3,
    tail: [[-4.9, 0], [-5.3, 2.3], [-6.2, 2.3], [-6.4, 0]], planeUp: 0.95,
    nozzles: [[-2.7, -1.85, -0.05], [-2.7, 1.85, -0.05]], nozzle: 0.62,
    bodies: [jetNac(3.0, -2.7, kind === 'f3' ? 0.48 : 0.56, 1.85, -0.05)],
    glass: [nf ? tandem(3.6, 0.2, 1.22, 1.25, 0.66, 0.68, 0.36) : kind === 'f8' ? bubble(3.4, 1.9, 1.28, 0.64, 0.7, 0.36) : bubble(2.5, 1.0, 1.16, 0.64, 0.7, 0.34)],
  });
}
A['meteor-f3'] = meteor('f3');
A['meteor'] = meteor('f8');
A['meteor-nf'] = meteor('nf');

// de Havilland Vampire FB.5: a short fat pod with the cockpit ahead of the Goblin and its exhaust, small intakes in the
// wing roots, two thin booms to the round-topped fins and the tailplane between them (9.37 x 11.58 x 2.69 m). Venom
// FB.4: the thinner wing swept on its leading edge with tip tanks (9.71 x 12.7 over the tanks x 1.88 m). Sea Venom
// FAW.20 / 21 (and the Venom NF): two seats side by side behind a radar nose (11.15 x 13.06 x 2.6 m).
function vampire(kind: 'fb5' | 'venom' | 'sea'): Spec {
  const sea = kind === 'sea';
  const L = sea ? 11.15 : kind === 'venom' ? 9.71 : 9.37;
  const n = L / 2;
  const t = -n;
  const pod0: Row[] = sea
    ? [[n, 0.05, -0.2, 0.12], [n - 0.55, 0.45, -0.55, 0.52], [n - 1.8, 0.7, -0.7, 0.78], [n - 3.2, 0.8, -0.72, 0.82], [1.0, 0.78, -0.7, 0.8]]
    : [[n, 0.0, -0.22, 0.1], [n - 0.5, 0.4, -0.52, 0.45], [n - 1.5, 0.62, -0.64, 0.6], [n - 2.5, 0.72, -0.66, 0.66], [1.0, 0.75, -0.66, 0.68]];
  const half = kind === 'fb5' ? 5.79 : sea ? 6.2 : 6.05;
  const tipUp = -0.05 + half * Math.tan((3 * Math.PI) / 180);
  return fig({
    cls: sea ? 'fighter' : 'fighter', length: L, span: kind === 'fb5' ? 11.58 : sea ? 13.06 : 12.7, height: sea ? 2.6 : kind === 'venom' ? 1.88 : 2.69,
    body: [...pod0, [0, 0.68, -0.6, 0.66], [-0.7, 0.52, -0.48, 0.55], [-1.0, 0.42, -0.4, 0.42]], round: 2.2,
    wing: kind === 'fb5' ? [[1.4, 0], [1.4, 1.5], [0.65, half], [-0.35, half], [-1.45, 1.5], [-1.5, 0]] : [[1.7, 0], [1.6, 1.5], [0.1, half], [-0.75, half], [-1.45, 1.5], [-1.5, 0]], wingUp: -0.05, dihedral: 3, thick: 0.1,
    fin: kind === 'fb5'
      ? [[t + 1.3, -0.35], [t + 0.07, -0.35], [t, 0.55], [t + 0.18, 1.15], [t + 0.55, 1.3], [t + 0.9, 1.1], [t + 1.1, 0.4]]
      : [[t + 1.3, -0.35], [t + 0.07, -0.35], [t, 0.7], [t + 0.25, 1.25], [t + 0.7, 1.32], [t + 1.0, 0.9]],
    finBase: 0, twin: 2.9,
    tail: [[t + 0.9, 0], [t + 0.9, 1.45], [t + 0.15, 1.45], [t + 0.15, 0]], planeUp: 0.1,
    nozzles: [[-1.0, 0, 0]], nozzle: 0.6,
    bodies: [
      trunk(1.45, -0.4, 0.15, -0.22, 0.22, 0.85, 0, 4),
      pod(1.0, t + 0.3, 0.16, 1.45, 0, 0.1),
      ...(kind === 'fb5' ? [] : [pod(1.5, -1.5, 0.3, half + 0.05, tipUp, 0.3)]),
    ],
    glass: [sea ? sideBySide(n - 2.2, n - 3.9, 1.3, 0.72, 0.76, 0.62) : bubble(n - 1.8, n - 3.1, 1.18, 0.66, 0.72, 0.36)],
  });
}
A['vampire'] = vampire('fb5');
A['venom'] = vampire('venom');
A['sea-venom'] = vampire('sea');

// Blackburn Buccaneer: a long nose, the stepped tandem canopy, the area-ruled body bulging behind the wing to the
// petal airbrake at the tail, the engines in nacelles hugging the body at the wing roots, the refuelling probe over
// the nose, a 40-degree mid wing, the T-tail (19.33 m). S.1: Gyron Juniors with small round intakes (12.9 x 4.95 m).
// S.2 / S.2B: Speys with big oval intakes, the wing a little wider (13.41 x 4.97 m).
function buccaneer(s2: boolean): Spec {
  const h = s2 ? 6.705 : 6.45;
  return fig({
    cls: 'attack', length: 19.33, span: 2 * h, height: s2 ? 4.97 : 4.95,
    body: [[9.665, 0.0, -0.3, 0.12], [8.8, 0.35, -0.6, 0.45], [7.6, 0.6, -0.78, 0.6], [6.4, 0.72, -0.85, 0.65], [4.8, 0.85, -0.9, 0.7], [3.0, 0.9, -0.92, 0.72], [1.0, 0.88, -0.92, 0.66], [-1.0, 0.85, -0.9, 0.68], [-3.0, 0.85, -0.86, 0.86], [-5.0, 0.85, -0.82, 0.92], [-7.0, 0.72, -0.7, 0.8], [-8.6, 0.6, -0.6, 0.6], [-9.665, 0.35, -0.35, 0.14]], round: 2.3,
    wing: [[1.8, 0], [1.6, 1.4], [-1.8, h], [-3.0, h], [-3.6, 1.4], [-3.6, 0]], wingUp: 0,
    fin: [[-5.0, 0], [-8.6, 0], [-9.6, 2.9], [-8.2, 2.95]], finBase: 0.65, tee: true,
    tail: [[-8.2, 0], [-8.9, 2.2], [-9.9, 2.2], [-9.9, 0]],
    nozzles: [[-3.2, -1.15, -0.15], [-3.2, 1.15, -0.15]], nozzle: s2 ? 0.85 : 0.7,
    bodies: [s2 ? trunk(3.4, -3.2, 0.5, -0.8, 0.56, 1.2, 0, 2.2) : trunk(3.1, -3.2, 0.36, -0.62, 0.42, 1.1, 0, 2.2), pod(8.6, 6.4, 0.06, 0, 0.78, 0.1)],
    glass: [tandem(6.4, 3.4, 1.35, 1.55, 0.72, 0.88, 0.45)],
  });
}
A['buccaneer-s1'] = buccaneer(false);
A['buccaneer'] = buccaneer(true);

// English Electric Canberra: a round body, the broad straight wing with the Avons in round nacelles through it, the
// tall rounded fin, the tailplane with dihedral (19.96 x 19.51 x 4.77 m). B.2 / B.6 / B(I).6: the glazed nose and the
// pilot's blister on the centre line. B(I).8: the solid nose and a fighter's canopy offset to port. PR.9: the same
// canopy, a longer body and the inner wing's chord grown forward (20.32 x 20.68 m). Martin B-57B: two seats in tandem
// under a long canopy on the centre line, a solid nose.
function canberra(kind: 'b2' | 'b8' | 'pr9' | 'b57'): Spec {
  const pr9 = kind === 'pr9';
  const n = pr9 ? 10.34 : 9.98;
  const h = pr9 ? 10.34 : 9.755;
  const offset = kind === 'b8' || pr9;
  return fig({
    cls: 'bomber', length: pr9 ? 20.32 : 19.96, span: 2 * h, height: 4.77,
    body: [[n, -0.05, -0.2, 0.08], [n - 0.78, 0.35, -0.55, 0.45], [8.0, 0.7, -0.85, 0.78], [6.5, 0.92, -0.98, 0.95], [4.0, 0.98, -1.0, 0.99], [0, 0.98, -1.0, 0.99], [-3.0, 0.92, -0.92, 0.92], [-6.0, 0.72, -0.68, 0.7], [-8.5, 0.5, -0.42, 0.45], [-9.98, 0.32, -0.25, 0.25]], round: 2,
    wing: [[pr9 ? 3.4 : 2.6, 0], [pr9 ? 3.4 : 2.6, 1.0], [2.4, 2.9], [0.9, h], [-0.5, h], [-3.2, 2.9], [-3.3, 1.0], [-3.3, 0]], wingUp: 0, thick: 0.12,
    fin: [[-5.4, 0], [-9.6, 0], [-10.0, 2.0], [-9.7, 3.0], [-9.0, 3.3], [-8.2, 2.6], [-6.8, 0.6]], finBase: 0.6,
    tail: [[-7.4, 0.3], [-8.0, 4.25], [-9.4, 4.25], [-9.8, 0.3]], planeUp: 0.3,
    nozzles: [[-3.6, -2.7, -0.1], [-3.6, 2.7, -0.1]], nozzle: 0.8,
    bodies: [jetNac(3.6, -3.6, 0.72, 2.7, -0.1)],
    glass: [
      ...(kind === 'b2' ? [pod(n + 0.05, n - 1.1, 0.42, 0, -0.18, 0.5)] : []),
      kind === 'b57' ? tandem(7.6, 3.8, 1.5, 1.58, 0.92, 0.98, 0.5) : offset ? aside(bubble(7.2, 5.4, 1.55, 0.88, 0.96, 0.42), -0.35) : bubble(7.3, 5.4, 1.58, 0.95, 0.98, 0.5),
    ],
  });
}
A['canberra'] = canberra('b2');
A['canberra-b8'] = canberra('b8');
A['canberra-pr9'] = canberra('pr9');
A['b-57b'] = canberra('b57');

// Fiat G.91 R and PAN: a small Sabre-like fighter - the nose intake under the camera nose, the bubble and its spine, a
// 37-degree low wing, the swept tail (10.3 x 8.56 x 4.0 m). G.91Y: two J85s side by side, a longer, wider body with
// twin nozzles and a bigger wing (11.67 x 9.01 x 4.43 m).
function g91(y: boolean): Spec {
  const n = y ? 5.835 : 5.15;
  const w = y ? 0.08 : 0;
  const h = y ? 4.505 : 4.28;
  return fig({
    cls: 'attack', length: y ? 11.67 : 10.3, span: 2 * h, height: y ? 4.43 : 4.0,
    body: [[n, 0.4, -0.36, 0.38], [n - 0.65, 0.56, -0.62, 0.55], [n - 1.75, 0.68, -0.72, 0.62 + w], [2.0, 0.78, -0.75, 0.65 + w], [0, 0.78, -0.75, 0.68 + w], [-2.0, 0.68, -0.64, 0.62 + w * 1.5], [-4.0, 0.52, -0.48, 0.5 + w * 2], [-n, 0.42, -0.36, 0.4 + w * 3]], round: 2.2,
    wing: [[0.9, 0], [0.9, 0.66], [-2.0, h], [-2.85, h], [-2.6, 0.66], [-2.6, 0]], wingUp: -0.4,
    fin: [[-2.0, 0], [-n + 0.55, 0], [-n - 0.15, 2.0], [-n + 0.85, 2.05]], finBase: 0.5,
    tail: [[-n + 1.35, 0], [-n + 0.75, 1.6], [-n + 0.05, 1.6], [-n - 0.05, 0]], planeUp: 0.35,
    nozzles: y ? [[-n, -0.32, -0.02], [-n, 0.32, -0.02]] : [[-n, 0, 0]], nozzle: y ? 0.5 : 0.7,
    bodies: [spine(1.0, -3.6, 0.76, 0.1, 0.2)],
    glass: [bubble(n - 2.5, n - 4.1, 1.26, 0.7, 0.76, 0.36)],
  });
}
A['g-91'] = g91(false);
A['g-91y'] = g91(true);

// Saab 35 Draken: a long tube in a double delta - 80 degrees inboard, 57 outboard - the thin oval intakes in the inner
// wing's roots beside the cockpit, one tall fin, no tailplane (15.35 x 9.42 x 3.89 m). J35A: the early short tail
// cone (15.2 m, estimate). J35D: the long tail. J35F / J and the Finnish 35XS: the infrared seeker under the nose.
function draken(kind: 'a' | 'd' | 'f'): Spec {
  const t = kind === 'a' ? -7.525 : -7.675;
  return fig({
    cls: 'fighter', length: kind === 'a' ? 15.2 : 15.35, span: 9.42, height: 3.89,
    body: [[7.675, 0.0, -0.1, 0.04], [7.0, 0.2, -0.3, 0.25], [5.8, 0.45, -0.52, 0.48], [4.6, 0.58, -0.62, 0.58], [3.0, 0.68, -0.68, 0.65], [0, 0.72, -0.72, 0.72], [-3.0, 0.7, -0.68, 0.7], [-5.5, 0.62, -0.6, 0.62], [t + 0.7, 0.55, -0.55, 0.55], [t, 0.48, -0.48, 0.48]], round: 2.2,
    wing: [[4.6, 0], [4.6, 0.75], [-1.0, 2.55], [-4.85, 4.71], [-5.9, 4.71], [-6.2, 0.75], [-6.2, 0]], wingUp: -0.1,
    fin: [[-2.8, 0], [-7.0, 0], [-7.6, 2.55], [-6.4, 2.6]], finBase: 0.55,
    nozzles: [[t, 0, 0]], nozzle: 0.9,
    bodies: [trunk(4.0, -1.0, 0.2, -0.38, 0.28, 0.82, 0, 2.6), spine(2.6, -3.0, 0.68, 0.1, 0.25), ...(kind === 'f' ? [dome(5.2, -0.56, 0.15, 0.5, -1)] : [])],
    glass: [bubble(4.4, 2.6, 1.15, 0.58, 0.68, 0.38)],
  });
}
A['j35a'] = draken('a');
A['j35-draken'] = draken('d');
A['j35f'] = draken('f');

// Saab 29 Tunnan: a fat barrel of a body with the round nose intake, the small canopy on top, the exhaust under a
// slim tail boom carrying the swept fin and tailplane, a 25-degree mid wing (10.23 x 11.0 x 3.75 m). J29F (and the
// A29 and S29): the dogtoothed leading edge.
function tunnan(dog: boolean): Spec {
  return fig({
    cls: 'fighter', length: 10.23, span: 11.0, height: 3.75,
    body: [[5.115, 0.5, -0.55, 0.52], [4.5, 0.75, -0.8, 0.72], [3.0, 0.95, -0.95, 0.85], [1.5, 1.0, -0.98, 0.9], [0, 0.95, -0.95, 0.88], [-1.0, 0.85, -0.85, 0.8], [-1.6, 0.7, -0.5, 0.6], [-2.8, 0.55, -0.05, 0.35], [-5.115, 0.4, 0.15, 0.2]], round: 2,
    wing: dog ? [[1.2, 0], [1.2, 0.9], [-0.5, 3.4], [-0.3, 3.45], [-1.0, 5.5], [-2.1, 5.5], [-1.8, 0.9], [-1.8, 0]] : [[1.2, 0], [1.2, 0.9], [-1.0, 5.5], [-2.1, 5.5], [-1.8, 0.9], [-1.8, 0]], wingUp: -0.2,
    fin: [[-1.8, 0], [-4.4, 0], [-5.2, 1.8], [-4.3, 1.85]], finBase: 0.35,
    tail: [[-3.6, 0], [-4.2, 1.75], [-4.9, 1.75], [-5.0, 0]], planeUp: 0.3,
    nozzles: [[-1.8, 0, -0.35]], nozzle: 0.7,
    glass: [bubble(3.2, 1.8, 1.55, 0.92, 0.95, 0.36)],
  });
}
A['j29-tunnan'] = tunnan(false);
A['j29f'] = tunnan(true);

// Saab 32 Lansen: a big smooth body, the intakes low beside the cockpit, two seats under a long stepped canopy, a
// 35-degree low wing, the swept tail with the tailplane at the fin's root (14.94 x 13.0 x 4.65 m). A32A: the attack
// nose. J32B: the afterburning Avon's longer jet pipe and the infrared sight's fairing under the nose (15.04 m).
function lansen(b: boolean): Spec {
  const t = b ? -7.57 : -7.47;
  return fig({
    cls: b ? 'fighter' : 'attack', length: b ? 15.04 : 14.94, span: 13.0, height: 4.65,
    body: [[7.47, -0.05, -0.2, 0.06], [6.6, 0.3, -0.55, 0.42], [5.4, 0.62, -0.78, 0.62], [4.2, 0.78, -0.88, 0.7], [2.5, 0.88, -0.95, 0.76], [0, 0.88, -0.95, 0.78], [-2.5, 0.8, -0.8, 0.72], [-5.0, 0.62, -0.58, 0.55], [t, 0.42, -0.35, 0.38]], round: 2.2,
    wing: [[1.4, 0], [1.4, 0.85], [-2.6, 6.5], [-3.7, 6.5], [-3.6, 0.85], [-3.6, 0]], wingUp: -0.4,
    fin: [[-3.0, 0], [-6.9, 0], [-7.7, 2.4], [-6.4, 2.45]], finBase: 0.6,
    tail: [[-5.6, 0], [-6.4, 2.4], [-7.4, 2.4], [-7.5, 0]], planeUp: 0.5,
    nozzles: [[t, 0, 0]], nozzle: b ? 0.75 : 0.65,
    bodies: [trunk(3.0, -1.6, 0.35, -0.6, 0.35, 0.85, 0.2, 3), ...(b ? [dome(5.6, -0.7, 0.14, 0.7, -1)] : [])],
    glass: [tandem(5.0, 1.6, 1.42, 1.55, 0.78, 0.88, 0.42)],
  });
}
A['j32-lansen'] = lansen(false);
A['j32b'] = lansen(true);

// Dassault Mystère IV A: a round body with the round nose intake, the bubble and its spine, a 38-degree mid wing, the
// tailplane a third of the way up the fin (12.85 x 11.12 x 4.6 m; the Mystère II close to it). Super Mystère B2: the
// intake's upper lip drawn forward, a slimmer body, the thin 45-degree wing, the tailplane low on the body
// (14.13 x 10.52 x 4.6 m).
A['mystere-iv'] = fig({
  cls: 'fighter', length: 12.85, span: 11.12, height: 4.6,
  body: [[6.425, 0.45, -0.45, 0.45], [5.8, 0.6, -0.62, 0.58], [4.6, 0.72, -0.75, 0.65], [3.4, 0.82, -0.8, 0.7], [1.5, 0.88, -0.82, 0.72], [-0.5, 0.85, -0.8, 0.72], [-2.5, 0.75, -0.7, 0.65], [-4.5, 0.6, -0.55, 0.52], [-6.425, 0.45, -0.4, 0.42]], round: 2,
  wing: [[1.0, 0], [1.0, 0.72], [-2.7, 5.56], [-3.7, 5.56], [-3.1, 0.72], [-3.1, 0]], wingUp: 0,
  fin: [[-2.6, 0], [-6.0, 0], [-6.9, 2.4], [-5.8, 2.45]], finBase: 0.55,
  tail: [[-5.0, 0], [-5.8, 1.9], [-6.6, 1.9], [-6.7, 0]], planeUp: 1.4,
  nozzles: [[-6.425, 0, 0]], nozzle: 0.75,
  bodies: [spine(1.9, -4.0, 0.86, 0.12, 0.2)],
  glass: [bubble(3.7, 1.9, 1.38, 0.82, 0.88, 0.36)],
});
A['mystere'] = fig({
  cls: 'fighter', length: 14.13, span: 10.52, height: 4.6,
  body: [[7.065, 0.46, 0.2, 0.3], [6.75, 0.55, -0.58, 0.58], [5.5, 0.66, -0.7, 0.66], [4.0, 0.75, -0.78, 0.7], [2.0, 0.82, -0.8, 0.72], [0, 0.8, -0.8, 0.72], [-2.5, 0.72, -0.7, 0.66], [-5.0, 0.6, -0.58, 0.55], [-7.065, 0.48, -0.45, 0.45]], round: 2.1,
  wing: [[1.4, 0], [1.4, 0.72], [-3.4, 5.26], [-4.4, 5.26], [-3.6, 0.72], [-3.6, 0]], wingUp: 0,
  fin: [[-2.8, 0], [-6.6, 0], [-7.6, 2.6], [-6.5, 2.65]], finBase: 0.6,
  tail: [[-5.2, 0.5], [-6.2, 2.4], [-7.1, 2.4], [-7.3, 0.5]], planeUp: -0.1,
  nozzles: [[-7.065, 0, 0]], nozzle: 0.8,
  bodies: [spine(2.6, -4.4, 0.8, 0.12, 0.22)],
  glass: [bubble(4.2, 2.6, 1.26, 0.75, 0.82, 0.36)],
});

// Dassault Étendard IV M: a slim pointed nose, half-round intakes beside the cockpit, a 45-degree mid wing with a
// dogtooth, the tailplane low on the fin (14.4 x 9.6 x 3.86 m, length estimate). Super Étendard: the fat radar nose
// and the refuelling probe before the windscreen (14.31 x 9.6 x 3.86 m).
function etendard(sup: boolean): Spec {
  const nose: Row[] = sup ? [[7.155, 0.0, -0.3, 0.1], [6.5, 0.32, -0.6, 0.45], [5.5, 0.55, -0.72, 0.58]] : [[7.2, -0.05, -0.15, 0.04], [6.5, 0.25, -0.45, 0.35], [5.5, 0.5, -0.66, 0.52]];
  return fig({
    cls: 'attack', length: sup ? 14.31 : 14.4, span: 9.6, height: 3.86,
    body: [...nose, [4.4, 0.66, -0.78, 0.6], [3.2, 0.72, -0.8, 0.62], [1.5, 0.78, -0.82, 0.65], [-1.0, 0.75, -0.8, 0.7], [-3.5, 0.65, -0.68, 0.62], [-5.5, 0.55, -0.52, 0.5], [-7.155, 0.45, -0.4, 0.4]], round: 2.2,
    wing: [[1.2, 0], [1.2, 0.8], [-1.6, 3.4], [-1.42, 3.45], [-2.5, 4.8], [-3.4, 4.8], [-3.2, 0.8], [-3.2, 0]], wingUp: 0,
    fin: [[-2.8, 0], [-6.6, 0], [-7.4, 2.25], [-6.2, 2.3]], finBase: 0.55,
    tail: [[-5.4, 0.4], [-6.2, 2.0], [-7.1, 2.0], [-7.2, 0.4]], planeUp: 0.35,
    nozzles: [[-7.155, 0, 0]], nozzle: 0.75,
    bodies: [trunk(2.9, -1.8, 0.35, -0.55, 0.38, 0.85, 0, 2.4), spine(2.6, -3.8, 0.72, 0.1, 0.24), ...(sup ? [pod(5.7, 4.3, 0.05, 0, 0.74, 0.1)] : [])],
    glass: [bubble(4.3, 2.6, 1.3, 0.66, 0.72, 0.38)],
  });
}
A['etendard-iv'] = etendard(false);
A['etendard'] = etendard(true);

// He 162 Volksjäger: a small body with the high wing and drooped tips, the BMW 003 in its nacelle on the back behind
// the cockpit, the tailplane with twin fins at its tips (9.05 x 7.2 x 2.6 m).
A['he-162'] = fig({
  cls: 'jet-fighter', length: 9.05, span: 7.2, height: 2.6,
  body: [[4.525, 0.0, -0.2, 0.1], [4.0, 0.35, -0.45, 0.38], [3.0, 0.5, -0.55, 0.48], [1.5, 0.55, -0.6, 0.5], [0, 0.5, -0.55, 0.46], [-2.0, 0.38, -0.38, 0.32], [-3.8, 0.25, -0.15, 0.18], [-4.525, 0.2, -0.05, 0.1]], round: 2.4,
  wing: [[0.9, 0], [0.9, 0.6], [0.2, 3.6], [-0.8, 3.6], [-1.4, 0.6], [-1.4, 0]], wingUp: 0.45,
  fin: [[-3.5, -0.45], [-4.4, -0.45], [-4.5, 0.8], [-3.8, 0.85]], finBase: 0.35, twin: 2.4,
  tail: [[-3.4, 0], [-3.6, 1.25], [-4.4, 1.25], [-4.5, 0]], planeUp: 0.35,
  nozzles: [[-2.6, 0, 0.95]], nozzle: 0.55,
  bodies: [jetNac(1.2, -2.6, 0.42, 0, 0.95), post(0.4, -1.6, 0.7, 0.4, 0.12, undefined)],
  glass: [bubble(2.6, 1.4, 1.0, 0.5, 0.52, 0.32)],
});

// SO.4050 Vautour II: a long slim body, the shoulder wing swept 35 degrees with the two Atars in round nacelles through
// it, the swept fin with the tailplane a third of the way up (15.57 x 15.09 x 4.5 m, height estimate). IIA: one seat
// under a bubble. IIB: the bomber's glazed nose and the pilot's bubble. IIN: the radar nose and two seats in tandem.
function vautour(kind: 'a' | 'b' | 'n'): Spec {
  return fig({
    cls: kind === 'a' ? 'attack' : kind === 'b' ? 'bomber' : 'fighter', length: 15.57, span: 15.09, height: 4.5,
    body: [[7.785, 0.0, -0.25, 0.1], [7.0, 0.4, -0.6, 0.48], [5.8, 0.62, -0.8, 0.65], [4.4, 0.75, -0.85, 0.72], [2.0, 0.8, -0.85, 0.75], [-1.0, 0.78, -0.82, 0.72], [-4.0, 0.65, -0.62, 0.6], [-7.785, 0.4, -0.3, 0.3]], round: 2.2,
    wing: [[2.4, 0], [2.2, 1.0], [-2.4, 7.545], [-3.6, 7.545], [-3.4, 1.0], [-3.4, 0]], wingUp: 0.5,
    fin: [[-3.0, 0], [-6.8, 0], [-7.9, 2.6], [-6.8, 2.65]], finBase: 0.5,
    tail: [[-5.6, 0], [-6.4, 2.6], [-7.4, 2.6], [-7.5, 0]], planeUp: 1.4,
    nozzles: [[-2.6, -2.6, 0.2], [-2.6, 2.6, 0.2]], nozzle: 0.75,
    bodies: [jetNac(2.6, -2.6, 0.55, 2.6, 0.2)],
    glass: kind === 'n' ? [tandem(5.2, 1.8, 1.3, 1.42, 0.72, 0.8, 0.42)] : kind === 'b' ? [pod(7.9, 6.6, 0.45, 0, -0.2, 0.5), bubble(4.6, 3.0, 1.3, 0.72, 0.8, 0.4)] : [bubble(4.6, 3.0, 1.3, 0.72, 0.8, 0.4)],
  });
}
A['vautour-iia'] = vautour('a');
A['vautour-iib'] = vautour('b');
A['vautour-iin'] = vautour('n');

// MD.450 Ouragan: a round body with the round nose intake, the bubble, a straight wing swept 14 degrees with tip
// tanks, the tailplane half way up the fin (10.74 x 13.16 over the tanks x 4.14 m).
A['ouragan'] = fig({
  cls: 'fighter', length: 10.74, span: 13.16, height: 4.14,
  body: [[5.37, 0.42, -0.42, 0.42], [4.8, 0.6, -0.64, 0.58], [3.6, 0.72, -0.76, 0.66], [2.2, 0.78, -0.8, 0.7], [0.5, 0.78, -0.8, 0.7], [-1.5, 0.7, -0.68, 0.62], [-3.5, 0.52, -0.48, 0.46], [-5.37, 0.38, -0.32, 0.34]], round: 2,
  wing: [[1.4, 0], [1.4, 0.7], [0.0, 6.1], [-1.0, 6.1], [-1.8, 0.7], [-1.8, 0]], wingUp: -0.25, dihedral: 3, thick: 0.09,
  fin: [[-2.4, 0], [-4.8, 0], [-5.5, 2.1], [-4.6, 2.15]], finBase: 0.45,
  tail: [[-3.9, 0], [-4.4, 2.0], [-5.2, 2.0], [-5.3, 0]], planeUp: 0.9,
  nozzles: [[-5.37, 0, 0]], nozzle: 0.6,
  bodies: [pod(1.2, -1.9, 0.33, 6.25, 0.07, 0.3)],
  glass: [bubble(2.9, 1.3, 1.3, 0.75, 0.8, 0.36)],
});

// Grumman F9F Panther (F9F-2 and -5): the cockpit well forward, triangular intakes in the wing roots, a straight wing
// with fixed tip tanks, the tall fin of the -5 (11.84 x 11.58 x 3.73 m). F9F-8 Cougar: the same body longer, the wing
// swept 35 degrees without tanks (13.54 x 10.52 x 3.73 m).
function grumman(cougar: boolean): Spec {
  const n = cougar ? 6.77 : 5.92;
  const s = cougar ? 0.85 : 0;
  return fig({
    cls: 'fighter', length: cougar ? 13.54 : 11.84, span: cougar ? 10.52 : 11.58, height: 3.73,
    body: [[n, 0.0, -0.2, 0.1], [n - 0.55, 0.42, -0.55, 0.45], [n - 1.75, 0.65, -0.72, 0.62], [n - 3.15, 0.75, -0.8, 0.68], [1.0, 0.8, -0.82, 0.72], [-1.0, 0.76, -0.74, 0.66], [-3.2, 0.6, -0.52, 0.5], [-n, 0.42, -0.32, 0.32]], round: 2.2,
    wing: cougar ? [[2.2, 0], [2.0, 0.85], [-1.6, 5.26], [-2.8, 5.26], [-2.4, 0.85], [-2.4, 0]] : [[1.5, 0], [1.5, 0.8], [0.9, 5.4], [-0.3, 5.4], [-1.4, 0.8], [-1.5, 0]], wingUp: -0.2, dihedral: cougar ? 0 : 3, thick: cougar ? 0.06 : 0.09,
    fin: [[-2.6 - s, 0], [-5.3 - s, 0], [-6.0 - s, 2.3], [-5.0 - s, 2.35]], finBase: 0.45,
    tail: cougar ? [[-4.8, 0.2], [-5.6, 2.2], [-6.5, 2.2], [-6.7, 0.2]] : [[-4.2, 0.2], [-4.6, 2.2], [-5.5, 2.2], [-5.7, 0.2]], planeUp: 0.55,
    nozzles: [[-n, 0, 0]], nozzle: 0.6,
    bodies: [trunk(cougar ? 2.2 : 1.6, -0.6, 0.22, -0.3, 0.3, 0.85, 0, 4), ...(cougar ? [] : [pod(1.4, -1.9, 0.35, 5.6, 0.08, 0.3)])],
    glass: [bubble(n - 2.3, n - 3.9, 1.3, 0.72, 0.8, 0.36)],
  });
}
A['f9f-panther'] = grumman(false);
A['f9f-cougar'] = grumman(true);

// Hawker Sea Hawk: a smooth body with intakes in the straight wing's roots and the jet pipe split to exhaust at the
// wing roots' trailing edge, a slim tail boom, the tailplane half way up the fin (12.09 x 11.89 x 2.79 m).
A['sea-hawk'] = fig({
  cls: 'fighter', length: 12.09, span: 11.89, height: 2.79,
  body: [[6.045, 0.0, -0.25, 0.12], [5.5, 0.42, -0.6, 0.48], [4.2, 0.65, -0.75, 0.66], [2.8, 0.75, -0.8, 0.72], [1.0, 0.78, -0.8, 0.8], [-1.0, 0.72, -0.72, 0.75], [-2.0, 0.62, -0.55, 0.55], [-4.0, 0.48, -0.3, 0.35], [-6.045, 0.38, -0.15, 0.22]], round: 2.2,
  wing: [[1.6, 0], [1.6, 0.9], [0.8, 5.945], [-0.4, 5.945], [-1.6, 0.9], [-1.7, 0]], wingUp: -0.05, dihedral: 3, thick: 0.1,
  fin: [[-3.4, 0], [-5.6, 0], [-6.1, 1.8], [-5.3, 1.85]], finBase: 0.35,
  tail: [[-4.4, 0], [-4.8, 2.3], [-5.7, 2.3], [-5.9, 0]], planeUp: 0.9,
  nozzles: [[-1.6, -0.85, -0.2], [-1.6, 0.85, -0.2]], nozzle: 0.55,
  bodies: [trunk(1.7, -1.6, 0.22, -0.32, 0.32, 0.9, 0, 4)],
  glass: [bubble(3.5, 2.0, 1.3, 0.72, 0.78, 0.36)],
});

// Supermarine Attacker: the Spiteful's straight laminar wing set low, intakes beside the cockpit, the jet pipe at the
// tail, Supermarine's rounded fin (11.43 x 11.25 x 3.02 m).
A['attacker'] = fig({
  cls: 'fighter', length: 11.43, span: 11.25, height: 3.02,
  body: [[5.715, 0.0, -0.25, 0.12], [5.2, 0.4, -0.55, 0.45], [4.0, 0.6, -0.7, 0.6], [2.6, 0.72, -0.75, 0.66], [1.0, 0.75, -0.75, 0.7], [-1.0, 0.68, -0.65, 0.62], [-3.0, 0.52, -0.45, 0.46], [-5.715, 0.35, -0.25, 0.3]], round: 2.2,
  wing: [[1.4, 0], [1.4, 0.8], [0.6, 5.625], [-0.4, 5.625], [-1.5, 0.8], [-1.6, 0]], wingUp: -0.4, dihedral: 4, thick: 0.09,
  fin: [[-3.6, 0], [-5.4, 0], [-5.75, 1.4], [-5.5, 1.75], [-4.9, 1.85], [-4.4, 1.3]], finBase: 0.35,
  tail: [[-4.0, 0.1], [-4.3, 2.0], [-5.2, 2.0], [-5.4, 0.1]], planeUp: 0.3,
  nozzles: [[-5.715, 0, 0]], nozzle: 0.55,
  bodies: [trunk(2.6, -1.0, 0.35, -0.45, 0.3, 0.72, 0, 2.4)],
  glass: [bubble(2.9, 1.3, 1.22, 0.7, 0.74, 0.36)],
});

/** Names in data with no alias elsewhere (War Thunder ids from the public wiki's vehicle lists). */
const ALIASES: Record<string, string> = {
  // Variants of the jets once drawn from proportions: Tacview, DCS and Battlefield names the prefix match misses.
  'jaguar gr.3': 'jaguar-gr1',
  'jaguar gr3': 'jaguar-gr1',
  'jaguar gr.3a': 'jaguar-gr1',
  'jaguar t.4': 'jaguar-t2',
  'jaguar b': 'jaguar-t2',
  'jaguar s': 'jaguar',
  'jaguar is': 'jaguar',
  'hunter f.58': 'hunter-fga9',
  'hunter fr.10': 'hunter-fga9',
  'hunter t.8': 'hunter-t7',
  'f-104j': 'f-104g',
  'f-104s asa': 'f-104s',
  'f-8 crusader': 'f-8e',
  'f-8j': 'f-8e',
  'f-8e(fn)': 'f-8e',
  'f-8a': 'f-8c',
  'f8u-1': 'f-8c',
  'meteor f.4': 'meteor-f3',
  'meteor nf.11': 'meteor-nf',
  'meteor nf.12': 'meteor-nf',
  'meteor nf.14': 'meteor-nf',
  'sea venom faw.21': 'sea-venom',
  'venom nf.3': 'sea-venom',
  'canberra b(i).8': 'canberra-b8',
  'canberra b(i)8': 'canberra-b8',
  'canberra_bimk8': 'canberra-b8',
  'canberra b.2': 'canberra',
  'canberra b.6': 'canberra',
  'canberra b(i).6': 'canberra',
  'martin b-57': 'b-57b',
  'fiat g.91y': 'g-91y',
  'g.91y': 'g-91y',
  'j 35a draken': 'j35a',
  'j 35f draken': 'j35f',
  'j 35j draken': 'j35f',
  'j35f draken': 'j35f',
  'j35j draken': 'j35f',
  'saab 35xs': 'j35f',
  'j 29f tunnan': 'j29f',
  'j 32b lansen': 'j32b',
  'mystère iv': 'mystere-iv',
  'mystère iva': 'mystere-iv',
  'mystere iv': 'mystere-iv',
  'mystere iva': 'mystere-iv',
  'mystère ii': 'mystere-iv',
  'super mystère': 'mystere',
  'super mystère b2': 'mystere',
  'super mystere b2': 'mystere',
  'étendard iv': 'etendard-iv',
  'étendard ivm': 'etendard-iv',
  'etendard iv': 'etendard-iv',
  'etendard ivm': 'etendard-iv',
  'super étendard': 'etendard',
  'super etendard': 'etendard',
  'super étendard modernisé': 'etendard',
  'a-10 warthog': 'a-10c',
  f_102a: 'f-102a',
  'me-163b': 'me-163b',
  'me-163b-0': 'me-163b',
  bi: 'bi',
  'yak-28b': 'yak-28b',
  swift_f1: 'swift-f1',
  swift_f7: 'swift-f7',
  dh_110_sea_vixen: 'sea-vixen-faw2',
  javelin_fmk9: 'javelin-faw9',
  scimitar_f1: 'scimitar-f1',
  lightning_f6: 'lightning-f6',
  lightning_f53: 'lightning-f6',
  kitsuka: 'kikka',
  j8m1: 'ki-200',
  r2y2_v1: 'r2y2-v1',
  r2y2_v2: 'r2y2-v2',
  r2y2_kai: 'r2y2-v3',
  sagittario_2: 'sagittario-2',
  se_203: 'aquilon-203',
  saab_j21ra: 'saab-21r',
  saab_a21rb: 'saab-21r',
  m_346fa: 'm-346fa',
  'f-82e': 'f-82e',
  he_115c_1: 'he-115',
  he_115a_2_sweden: 'he-115',
  'bv-238': 'bv-238',
  'mbr-2': 'mbr-2',
  tandem_mai: 'tandem-mai',
  nc_223_3: 'nc-223',
  mb_162: 'mb-162',
  late_298d: 'late-298',
  j7w1: 'j7w1',
  so_8000_narval: 'narval',
  'pb4y-2': 'pb4y-2-privateer',
  'pb4y-2_china': 'pb4y-2-privateer',
  'pb4y-2_france': 'pb4y-2-privateer',
  saab_b18a: 'saab-b18a',
  saab_b18b: 'saab-b18b',
  saab_t18b_1: 'saab-t18b',
  saab_t18b_2: 'saab-t18b',
  saab_j21a_1: 'saab-j21a',
  saab_j21a_2: 'saab-j21a',
  saab_a21a_3: 'saab-j21a',
  d_371: 'd-371',
  d_371_hs9: 'd-371',
  d_373: 'd-371',
};

export const AIR_EXTRA: SpecSet = { air: A, aliases: ALIASES };
