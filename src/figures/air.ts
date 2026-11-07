/**
 * Aircraft, helicopters and missiles, put together from what makes a type
 * recognisable from outside: the fuselage's length and girth, the wing's plan
 * (straight, swept, delta, its sweep and where it sits), the tail (single,
 * twin, V, T), canards, where the engines and intakes are, the canopy, the
 * propellers; for a helicopter its rotors, tail and stub wings; for a missile
 * its body and its sets of fins. Built from published sizes, never from a
 * game's model.
 *
 * Frame: x forward, z right, y up, metres, built round the aircraft's middle
 * (telemetry gives the centre of an aircraft, not its wheels).
 */

import { finish, newKit, PAINT, type Kit, type Template } from './kit';
import { blob, block, body, foil, lathe, lerpPoly, outlineBody, plate, ring, tube, wheel, type Outline, type P2 } from './parts';
import type { Section } from '../race/shapes';
import type { Frame3, Rgb, Vec3 } from '../race/geometry';

const grey = (k: number): Rgb => [k, k, k];

/**
 * A frame for `ring` that stands a disc upright, facing forward: its
 * arguments (forward, side, up) become (up, side, forward). Propellers and
 * intakes.
 */
const FACING_FORWARD: Frame3 = { o: [0, 0, 0], f: [0, 1, 0], r: [0, 0, 1], u: [1, 0, 0] };

export interface WingSpec {
  /** Forward position of the root's middle, metres from the aircraft's middle. */
  x: number;
  span: number;
  rootChord: number;
  tipChord: number;
  /** Leading-edge sweep, degrees. */
  sweep: number;
  /** Height on the fuselage: -1 low, 0 mid, 1 high (shoulder). */
  mount?: number;
  /** Dihedral, degrees (negative: anhedral). */
  dihedral?: number;
  /** A gull wing (Corsair, Stuka): the inner part bent down. */
  gull?: boolean;
  /**
   * A swing wing's fixed glove: the moving wing pivots `span / 2` out from
   * the centreline, and the glove's leading edge starts `chord` ahead of the
   * wing's root leading edge at the fuselage (F-14, Tornado, MiG-23, B-1).
   */
  glove?: { span: number; chord: number };
  /**
   * The wing's thickness over its chord at the root (default 0.05); it thins to
   * three quarters of that at the tip and follows the local chord, so a
   * delta's tip is thin. About 0.16 for an A-10, 0.04 for a fighter.
   */
  thicknessRatio?: number;
  /**
   * An outer panel bent to its own dihedral: `at` metres out from the centre
   * line the wing bends to `deg` degrees (the F-4's upturned outer panels at
   * about 12). With `wingPlan`, which is cut there so the bend shows.
   */
  outerDihedral?: { at: number; deg: number };
}

/**
 * A swing wing's moving outer panel (F-14, Tornado, MiG-23, Su-24, B-1,
 * Tu-160): its half planform (forward, out from the centre line) drawn at the
 * leading-edge sweep `ref`, turned about `pivot` to `sweep`. With it,
 * `wingPlan` is the fixed glove alone; the panel's root reaches in under the
 * glove and into the body, so nothing opens where the wing turns.
 *
 * `sweep` is the figure's own state, the type's usual one in flight; `spread`
 * and `swept` are the published end states, [leading-edge sweep in degrees,
 * span in metres], which the panel's tips must meet. The catalogue offers
 * `<name>@spread` and `<name>@swept` beside the figure, and replay picks one by
 * Mach: spread below `mach[0]`, swept above `mach[1]` (default 0.4 and 0.8).
 */
export interface SwingWing {
  pivot: P2;
  outer: P2[];
  ref: number;
  sweep: number;
  spread: [number, number];
  swept: [number, number];
  mach?: [number, number];
}

/**
 * A trapezoid swing panel for `SwingWing.outer`: the root chord through the
 * pivot, `share` of it ahead of the pivot; the leading edge at `sweep`
 * degrees out `length` metres to a streamwise tip of `tip` chord. Behind the
 * pivot the root runs on `inset` metres inboard (default half the chord, at
 * most 60 % of the way in), as a real panel's root slides into the body:
 * spread, its trailing root swings out and still meets the glove.
 */
export function swingPanel(p: { pivot: P2; chord: number; share: number; sweep: number; length: number; tip: number; inset?: number }): P2[] {
  const [a, b] = p.pivot;
  const le = a + p.share * p.chord;
  const te = a - (1 - p.share) * p.chord;
  const tipLe = le - p.length * Math.tan((p.sweep * Math.PI) / 180);
  const inset = p.inset ?? Math.min(p.chord * 0.5, b * 0.6);
  return [[le, b], [tipLe, b + p.length], [tipLe - p.tip, b + p.length], [te, b], [te, b - inset], [a, b - inset]];
}

/** The outer panel's half planform at a sweep (default its own). */
export function swingPlan(s: SwingWing, sweep = s.sweep): P2[] {
  const t = ((sweep - s.ref) * Math.PI) / 180;
  const c = Math.cos(t);
  const n = Math.sin(t);
  const [pa, pb] = s.pivot;
  // Swept further back, a point behind the pivot comes inboard and one outboard goes back.
  return s.outer.map(([a, b]) => [pa + (a - pa) * c - (b - pb) * n, pb + (a - pa) * n + (b - pb) * c] as P2);
}

/** The span over the outer panels' tips at a sweep, metres. */
export function swingSpan(s: SwingWing, sweep = s.sweep): number {
  return 2 * Math.max(...swingPlan(s, sweep).map((p) => p[1]));
}

/** A swing-wing figure at another sweep, its span following. */
export function atSweep<T extends FixedWingSpec>(spec: T, sweep: number): T {
  const s = spec.swing;
  if (!s) return spec;
  const span = swingSpan(s, sweep);
  return { ...spec, span, wing: { ...spec.wing, span, sweep }, swing: { ...s, sweep } };
}

export interface FixedWingSpec {
  length: number;
  span: number;
  height: number;
  /** Fuselage width and height at its widest, metres. */
  bodyWidth: number;
  bodyHeight: number;
  /** Nose length as a share of the length, and how blunt (0 sharp .. 1 round). */
  nose?: number;
  blunt?: number;
  wing: WingSpec;
  /** A second wing above (biplanes). */
  upperWing?: WingSpec;
  /** More wings: a triplane's middle wing, a sesquiplane's or a big biplane's extra planes. */
  extraWings?: WingSpec[];
  /** Canards; `up` is their height above the axis (default 15% of the half body height), for canards set high on the intakes. */
  canard?: { x: number; span: number; chord: number; up?: number };
  tail: {
    kind: 'single' | 'twin' | 'v' | 't' | 'h' | 'none';
    /** Height of the fin's root (with `finPlan`; default the fuselage's upper side). */
    finBase?: number;
    /** Height of the tailplane (with `tailPlan`; default 0, or the fin's top on a T-tail). */
    planeUp?: number;
    finHeight: number;
    finChord: number;
    /** Twin fins: their cant outward, degrees, and spacing. */
    cant?: number;
    spacing?: number;
    /** Tailplane span and chord; 0 for none (deltas). */
    tailSpan: number;
    tailChord: number;
    /** The tailplane's dihedral, degrees; negative for anhedral (the F-4's drooped stabilators about -23, Jaguar, Harrier). */
    planeDihedral?: number;
  };
  engines?: {
    kind: 'internal' | 'wing-pods' | 'rear-pods' | 'nose-prop' | 'wing-props' | 'pusher' | 'tail-top';
    count: number;
    /** Nacelle or pod diameter. */
    diameter?: number;
    /** Positions along the span for wing engines, as share of the half span. */
    at?: number[];
    /** Wing pods: two engines side by side in each (B-52). */
    pair?: boolean;
    /** Wing pods and nacelles: their length (default from the wing chord). */
    length?: number;
    /** Wing props turned up as rotors (a tiltrotor hovering, a VTOL's lift fans). */
    up?: boolean;
    /** Internal engines: where each nozzle ends, (forward, side, up), when not side by side at the tail (nacelles set apart). */
    nozzles?: [number, number, number][];
  };
  intakes?: 'side' | 'chin' | 'nose' | 'dorsal' | 'under' | 'none';
  /** tandem: two seats one behind the other under one long canopy, the rear one raised (trainers, two-seat fighters). */
  canopy?: { x: number; length: number; kind: 'bubble' | 'framed' | 'tandem' | 'airliner' | 'glass-nose' | 'none' };
  propeller?: { diameter: number; blades: number };
  /**
   * A short central nacelle instead of a fuselage to the tail, and two booms
   * from the wing to the tail carrying the fins (P-38, Fw 189, Vampire,
   * OV-10): `x` is where the booms start, `spacing` their distance apart.
   */
  booms?: { x: number; spacing: number; diameter: number };
  /** The fuselage's own length when it is shorter than the aircraft (a twin-boom's nacelle). */
  bodyLength?: number;
  /** A radar rotodome on struts above the fuselage (AWACS). */
  rotodome?: { x: number; diameter: number };
  /**
   * Leading-edge root extensions: strakes from the wing root forward along
   * the fuselage, `length` ahead of the root's leading edge and `span` out
   * from the body (F/A-18, Su-27, MiG-29, F-16).
   */
  lerx?: { length: number; span: number };
  /** A tail sting between the engines, this far behind them (Su-27 family). */
  sting?: number;
  /** Fixed main wheels in spats (Stuka, Val, biplanes, light aircraft). */
  fixedGear?: boolean;
  /** Two floats under the wing (seaplanes). */
  floats?: boolean;
  /**
   * True outlines, which replace the generic shapes they name: the fuselage
   * from its side profile and plan (forward from the aircraft's middle, up
   * from its axis); more bodies (nacelles, intakes, pods, canopies' fairings),
   * mirrored to both sides when off the centre line; the wing's and the
   * tailplane's half planform (forward, out from the centre line) and the
   * fin's (forward, up from its root).
   */
  fuselage?: Outline;
  /** A body with `oneSide: true` is drawn where it is, not mirrored, though off the centre line (the A-4's offset refuelling probe). */
  bodies?: (Outline & { oneSide?: boolean })[];
  wingPlan?: P2[];
  /** A swing wing: the outer panel turned about its pivot; `wingPlan` is then the fixed glove. */
  swing?: SwingWing;
  tailPlan?: P2[];
  finPlan?: P2[];
  /** The canopy's true shape: glass bodies (forward, up from the axis), drawn in place of `canopy`'s blobs. */
  glass?: Outline[];
  /** Propellers where they really are, besides the engines' own: outboard props on a wing with dihedral. */
  props?: { x: number; side: number; up: number; diameter: number; blades: number }[];
  /** The fins' thickness (default 5 % of the fin plan's chord, at least 0.1 m), so they show from the front. */
  finThickness?: number;
}

export function buildFixedWing(spec: FixedWingSpec): Template {
  const k = newKit();
  const L = spec.length;
  const half = L / 2;
  const bw = spec.bodyWidth / 2;
  const bh = spec.bodyHeight / 2;
  const nose = spec.nose ?? 0.18;
  const blunt = spec.blunt ?? 0.15;
  // The fuselage: a nose taper, the full section through the middle, a taper to the tail.
  const S = (x: number, w: number, h: number, z = 0): Section => ({ x, w: Math.max(0.02, w), h: Math.max(0.02, h), z });
  // Two engines side by side keep the tail wide (F-15, Su-27); one engine or a prop tapers it.
  const twin = spec.engines?.kind === 'internal' && spec.engines.count >= 2;
  const tailW = twin ? 0.9 : 0.45;
  // The fuselage runs from the nose back; a twin-boom's nacelle stops short.
  const Lb = spec.bodyLength ?? L;
  const B = half - Lb;
  const sections: Section[] = [
    S(half, bw * blunt * 0.4, bh * blunt * 0.4, -bh * 0.05),
    S(half - Lb * nose * 0.45, bw * (0.55 + blunt * 0.25), bh * (0.6 + blunt * 0.25), 0),
    S(half - Lb * nose, bw, bh, 0),
    S(half - Lb * 0.6, bw, bh, 0),
    S(B + Lb * 0.12, bw * tailW, bh * (twin ? 0.7 : 0.55), twin ? 0 : bh * 0.25),
    S(B, bw * tailW * (twin ? 0.9 : 0.5), bh * (twin ? 0.55 : 0.3), twin ? 0 : bh * 0.4),
  ];
  if (spec.fuselage) outlineBody(k.team, k.fr, spec.fuselage, grey(0.9), 14);
  else body(k.team, k.fr, sections, grey(0.9), 12, 2.2);
  for (const b of spec.bodies ?? []) {
    outlineBody(k.team, k.fr, b, grey(0.84), 12);
    if (b.side && !b.oneSide) outlineBody(k.team, k.fr, { ...b, side: -b.side }, grey(0.84), 12);
  }
  if (spec.wingPlan || spec.swing) {
    const up = mountHeight(spec.wing, spec);
    const dih = Math.tan(((spec.wing.dihedral ?? 0) * Math.PI) / 180);
    // A gull wing (Stuka, Corsair: inverted) bends down over its inner third, then climbs with the dihedral.
    const half = spec.wing.span / 2;
    const bend = half * 0.33;
    const drop = -spec.bodyHeight * 0.3;
    // An outer panel with its own dihedral bends `at` out; the planform is cut there so the bend is an edge.
    const ob = spec.wing.outerDihedral;
    const outer = ob ? Math.tan((ob.deg * Math.PI) / 180) : 0;
    const h = (b: number) => (spec.wing.gull ? (b < bend ? (drop * b) / bend : drop + (b - bend) * Math.max(dih, 0.14)) : ob && b > ob.at ? ob.at * dih + (b - ob.at) * outer : b * dih);
    const pieces = (plan: P2[]) => (ob ? [clipSpan(plan, ob.at, -1), clipSpan(plan, ob.at, 1)].filter((p) => p.length >= 3) : [plan]);
    const ratio = spec.wing.thicknessRatio ?? THICKNESS_RATIO;
    const reach = Math.max(half, ...(spec.wingPlan ?? []).map((p) => p[1]));
    const map = (side: number) => (a: number, b: number): Vec3 => [a, side * b, up + h(b)];
    if (spec.wingPlan) {
      const plan = spec.wingPlan;
      for (const side of [-1, 1]) for (const p of pieces(plan)) wingSlab(k, p, map(side), (b) => wingThickness(plan, b, ratio, reach), grey(0.86));
    }
    // A swing wing's outer panel at its sweep, thinner than the glove's edge so its root stays hidden inside it.
    if (spec.swing) {
      const plan = swingPlan(spec.swing);
      const glove = spec.wingPlan;
      const cap = glove ? wingThickness(glove, Math.max(...glove.map((p) => p[1])) - 1e-3, ratio, reach) * 0.8 : Infinity;
      for (const side of [-1, 1]) for (const p of pieces(plan)) wingSlab(k, p, map(side), (b) => Math.min(cap, wingThickness(plan, b, ratio, reach) * 0.8), grey(0.86));
    }
  } else wing(k, spec.wing, spec, grey(0.86));
  if (spec.upperWing) {
    wing(k, spec.upperWing, spec, grey(0.86));
    // Struts between the two wings.
    for (const side of [-1, 1]) {
      const s = side * spec.upperWing.span * 0.3;
      tube(k.fixed, k.fr, [spec.wing.x, s, mountHeight(spec.wing, spec)], [spec.upperWing.x, s, mountHeight(spec.upperWing, spec)], 0.04, 0.04, PAINT.dark, 4);
    }
  }
  for (const w of spec.extraWings ?? []) wing(k, w, spec, grey(0.86));
  if (spec.canard) {
    const c = spec.canard;
    const cu = c.up ?? bh * 0.15;
    const plan: P2[] = [[c.x + c.chord / 2, bw * 0.8], [c.x - c.chord / 2, bw * 0.8], [c.x - c.chord / 2, c.span / 2], [c.x - c.chord * 0.1, c.span / 2]];
    for (const side of [-1, 1]) foil(k.team, k.fr, plan, (a, b) => [a, side * b, cu], [0, 0, 1], Math.max(0.06, c.chord * 0.06), grey(0.84));
  }
  if (spec.booms) {
    const b = spec.booms;
    for (const side of [-1, 1]) tube(k.team, k.fr, [b.x, side * b.spacing / 2, 0], [-half + spec.tail.finChord * 0.2, side * b.spacing / 2, 0], b.diameter / 2, b.diameter * 0.3, grey(0.86), 10);
  }
  tail(k, spec);
  engines(k, spec);
  intakes(k, spec);
  if (spec.glass) for (const g of spec.glass) outlineBody(k.fixed, k.fr, g, PAINT.glass, 12);
  else canopy(k, spec);
  for (const p of spec.props ?? []) propeller(k, p.x, p.side, p.up, p.diameter, p.blades);
  if (spec.propeller && spec.engines?.kind === 'nose-prop') propeller(k, half + 0.1, 0, 0, spec.propeller.diameter, spec.propeller.blades);
  if (spec.rotodome) {
    const r = spec.rotodome;
    const up = spec.bodyHeight / 2 + Math.max(0.9, r.diameter * 0.14);
    for (const dx of [-r.diameter * 0.12, r.diameter * 0.12]) tube(k.fixed, k.fr, [r.x + dx, 0, spec.bodyHeight * 0.4], [r.x + dx, 0, up], 0.18, 0.15, PAINT.metal, 6);
    blob(k.fixed, k.fr, [r.x, 0, up + r.diameter * 0.06], [r.diameter / 2, r.diameter / 2, r.diameter * 0.08], PAINT.light, 1, 4, 20);
  }
  if (spec.lerx) {
    const le = spec.wing.x + spec.wing.rootChord / 2;
    const root = spec.bodyWidth * 0.42;
    const plan: P2[] = [[le + spec.lerx.length, root], [le - 0.5, root], [le - 0.5, root + spec.lerx.span], [le + spec.lerx.length * 0.35, root + spec.lerx.span * 0.75]];
    const lu = mountHeight(spec.wing, spec);
    for (const side of [-1, 1]) foil(k.team, k.fr, plan, (a, b) => [a, side * b, lu], [0, 0, 1], 0.12, grey(0.88));
  }
  if (spec.sting) lathe(k.team, k.fr, [-half + 0.5, 0, 0], [-half - spec.sting, 0, 0], [[0, spec.bodyHeight * 0.18], [0.7, spec.bodyHeight * 0.15], [1, spec.bodyHeight * 0.08]], grey(0.85));
  if (spec.fixedGear) gear(k, spec);
  if (spec.floats) floats(k, spec);
  return finish(k, 'centre');
}

/** Fixed main wheels in their spats under the wing roots, and a tail wheel. */
function gear(k: Kit, spec: FixedWingSpec): void {
  const bh = spec.bodyHeight / 2;
  const x = spec.wing.x + spec.wing.rootChord * 0.15;
  const s = Math.max(spec.bodyWidth * 0.75, spec.span * 0.12);
  const down = bh + Math.max(0.6, spec.height * 0.25);
  const r = Math.max(0.25, spec.height * 0.09);
  for (const side of [-1, 1]) {
    tube(k.fixed, k.fr, [x, side * s * 0.6, -bh * 0.5], [x, side * s, -down + r], 0.06, 0.05, PAINT.dark, 4);
    blob(k.team, k.fr, [x, side * s, -down + r], [r * 1.7, r * 0.55, r * 1.05], grey(0.82));
  }
  tube(k.fixed, k.fr, [-spec.length / 2 + 0.6, 0, -bh * 0.3], [-spec.length / 2 + 0.6, 0, -bh * 0.9], 0.04, 0.04, PAINT.dark, 4);
}

/** A seaplane's two floats on struts. */
function floats(k: Kit, spec: FixedWingSpec): void {
  const bh = spec.bodyHeight / 2;
  const len = spec.length * 0.62;
  const x = spec.wing.x + len * 0.12;
  const s = Math.max(spec.bodyWidth, spec.span * 0.16);
  const down = bh + Math.max(1.0, spec.height * 0.38);
  const d = Math.max(0.45, spec.length * 0.06);
  for (const side of [-1, 1]) {
    tube(k.team, k.fr, [x + len / 2, side * s, -down], [x - len / 2, side * s, -down], d * 0.3, d * 0.45, grey(0.8), 8);
    for (const dx of [len * 0.2, -len * 0.15]) tube(k.fixed, k.fr, [x + dx, side * s * 0.4, -bh * 0.4], [x + dx, side * s, -down + d * 0.4], 0.05, 0.05, PAINT.dark, 4);
  }
}

function mountHeight(w: WingSpec, spec: FixedWingSpec): number {
  return (w.mount ?? 0) * spec.bodyHeight * 0.4;
}

/** A wing's underside: a shade lighter than the top's light alone would leave it, as aircraft are painted. */
const UNDER = grey(0.8);

function wing(k: Kit, w: WingSpec, spec: FixedWingSpec, col: Rgb): void {
  const up = mountHeight(w, spec);
  const sweep = Math.tan((w.sweep * Math.PI) / 180);
  const dih = Math.tan(((w.dihedral ?? 0) * Math.PI) / 180);
  const bodyRoot = spec.bodyWidth * 0.35;
  // A swing wing starts at its pivot, out in the glove.
  const root = w.glove ? Math.max(bodyRoot, w.glove.span / 2) : bodyRoot;
  const halfSpan = w.span / 2;
  // As thick as the chord there allows: the root's share at the root, three quarters of it at the tip.
  const ratio = w.thicknessRatio ?? THICKNESS_RATIO;
  const thick = Math.max(MIN_THICKNESS, w.rootChord * ratio);
  const tipThick = Math.max(MIN_THICKNESS, w.tipChord * ratio * 0.75);
  if (w.glove) {
    const le = w.x + w.rootChord / 2;
    const plan: P2[] = [[le + w.glove.chord, bodyRoot], [le - w.rootChord, bodyRoot], [le - w.rootChord, root], [le, root]];
    for (const side of [-1, 1]) foil(k.team, k.fr, plan, (a, b) => [a, side * b, up], [0, 0, 1], thick * 1.2, grey(0.88), { under: UNDER });
  }
  const le0 = w.x + w.rootChord / 2;
  const span = Math.max(1e-6, halfSpan - root);
  const leAt = (s: number) => le0 - (s - root) * sweep;
  const chordAt = (s: number) => w.rootChord + (w.tipChord - w.rootChord) * ((s - root) / span);
  // A gull's bend (Stuka, Corsair) a third of the way out: the wing as two panels, the inner one dropping.
  const midS = w.gull ? halfSpan * 0.35 : 0;
  const plan: P2[] = w.gull
    ? [[le0, root], [le0 - w.rootChord, root], [leAt(midS) - chordAt(midS), midS], [leAt(halfSpan) - w.tipChord, halfSpan], [leAt(halfSpan), halfSpan], [leAt(midS), midS]]
    : [[le0, root], [le0 - w.rootChord, root], [leAt(halfSpan) - w.tipChord, halfSpan], [leAt(halfSpan), halfSpan]];
  const drop = -spec.bodyHeight * 0.25;
  const h = (s: number) => (w.gull ? (s < midS ? (drop * (s - root)) / Math.max(1e-6, midS - root) : drop + (s - midS) * Math.max(dih, 0.12)) : (s - root) * dih);
  const t = (s: number) => thick + (tipThick - thick) * Math.min(1, Math.max(0, (s - root) / span));
  for (const side of [-1, 1]) foil(k.team, k.fr, plan, (a, b) => [a, side * b, up + h(b)], [0, 0, 1], t, col, { under: UNDER });
}

/** A wing's thickness over its chord at the root when the spec gives none, and the least any part of a wing is thick. */
const THICKNESS_RATIO = 0.05;
const MIN_THICKNESS = 0.04;

/** The chord of a planform at a station `b` out from the centre line: the length of its cut there. */
export function chordAt(poly: P2[], b: number): number {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [a0, b0] = poly[i];
    const [a1, b1] = poly[(i + 1) % poly.length];
    if (b < Math.min(b0, b1) - 1e-6 || b > Math.max(b0, b1) + 1e-6) continue;
    const cut = Math.abs(b1 - b0) < 1e-9 ? [a0, a1] : [a0 + ((a1 - a0) * (b - b0)) / (b1 - b0)];
    lo = Math.min(lo, ...cut);
    hi = Math.max(hi, ...cut);
  }
  return hi > lo ? hi - lo : 0;
}

/** A wing's thickness at a station: its ratio of the local chord, the ratio thinning to three quarters at `reach`. */
function wingThickness(plan: P2[], b: number, ratio: number, reach: number): number {
  return Math.max(MIN_THICKNESS, chordAt(plan, b) * ratio * (1 - 0.25 * Math.min(1, Math.abs(b) / Math.max(1e-6, reach))));
}

/** The part of a planform inboard (`keep` -1) or outboard (1) of the station `cut`. */
function clipSpan(poly: P2[], cut: number, keep: -1 | 1): P2[] {
  const inside = (p: P2) => (p[1] - cut) * keep >= 0;
  const out: P2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    if (inside(p)) out.push(p);
    if (inside(p) !== inside(q)) {
      const t = (cut - p[1]) / (q[1] - p[1]);
      if (t > 0 && t < 1) out.push([p[0] + (q[0] - p[0]) * t, cut]);
    }
  }
  return out;
}

/** A wing from its half planform, thick by `thick` at each station, placed by `map` (forward, side, up): a true airfoil. */
function wingSlab(k: Kit, poly: P2[], map: (a: number, b: number) => Vec3, thick: (b: number) => number, col: Rgb): void {
  foil(k.team, k.fr, poly, map, [0, 0, 1], thick, col, { under: UNDER });
}

/** The unit vector along (forward, side, up). */
function unit(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function tail(k: Kit, spec: FixedWingSpec): void {
  const t = spec.tail;
  const L = spec.length;
  const back = -L / 2;
  const bh = spec.bodyHeight / 2;
  const top = bh * 0.55;
  if (spec.finPlan || spec.tailPlan) {
    // True planforms: the fins standing on their root, canted out when twin; the tailplane level.
    const base = t.finBase ?? top;
    const fins = spec.finPlan ?? [];
    const fh = fins.length ? Math.max(...fins.map((p) => p[1])) : 0;
    const ft = spec.finThickness ?? (fins.length ? Math.max(0.1, (Math.max(...fins.map((p) => p[0])) - Math.min(...fins.map((p) => p[0]))) * 0.05) : 0.1);
    if (fins.length && (t.kind === 'single' || t.kind === 't')) foil(k.team, k.fr, fins, (a, h) => [a, 0, base + h], [0, 1, 0], ft, grey(0.82));
    if (fins.length && (t.kind === 'twin' || t.kind === 'h')) {
      const sp = (spec.booms?.spacing ?? t.spacing ?? spec.bodyWidth * 0.8) / 2;
      const cant = Math.tan(((t.cant ?? 0) * Math.PI) / 180);
      const b0 = t.kind === 'h' ? (t.planeUp ?? 0) - fh * 0.35 : base;
      for (const side of [-1, 1]) foil(k.team, k.fr, fins, (a, h) => [a, side * (sp + h * cant), b0 + h], unit([0, side, -cant * side]), ft, grey(0.8));
    }
    if (spec.tailPlan) {
      const up = t.planeUp ?? (t.kind === 't' ? base + fh : 0);
      // With dihedral (or anhedral) the tailplane rises from its root.
      const tan = Math.tan(((t.planeDihedral ?? 0) * Math.PI) / 180);
      const root = Math.min(...spec.tailPlan.map((p) => p[1]));
      for (const side of [-1, 1]) foil(k.team, k.fr, spec.tailPlan, (a, b) => [a, side * b, up + (b - root) * tan], [0, 0, 1], 0.12, grey(0.84), { under: UNDER });
    }
    if (t.kind === 'v' && fins.length) {
      for (const side of [-1, 1]) foil(k.team, k.fr, fins, (a, h) => [a, side * h * 0.8, base + h * 0.6], unit([0, side * 0.6, -0.8]), ft * 0.8, grey(0.8));
    }
    return;
  }
  const fh = t.finHeight;
  const fc = t.finChord;
  // The fin's outline: forward, height above its root.
  const finOutline: P2[] = [
    [back + fc, 0],
    [back + 0.05 * fc, 0],
    [back - 0.05 * fc + fc * 0.25, fh],
    [back + fc * 0.55, fh],
  ];
  const ft = Math.max(0.08, fc * 0.06);
  if (t.kind === 'single' || t.kind === 't') foil(k.team, k.fr, finOutline, (a, h) => [a, 0, top + h], [0, 1, 0], ft, grey(0.82));
  if (t.kind === 'twin' || t.kind === 'h') {
    const sp = (spec.booms?.spacing ?? t.spacing ?? spec.bodyWidth * 0.8) / 2;
    // A canted fin: its tip moved outward by its height times tan(cant).
    const cant = Math.tan(((t.cant ?? 0) * Math.PI) / 180);
    const base = t.kind === 'h' ? 0 : top;
    for (const side of [-1, 1]) foil(k.team, k.fr, finOutline, (a, h) => [a, side * (sp + h * cant), base + h], unit([0, side, -cant * side]), ft, grey(0.8));
  }
  if (t.kind === 'v') {
    const a = 0.6;
    const vOutline: P2[] = [[back + fc, 0], [back, 0], [back + fc * 0.3, fh], [back + fc * 0.8, fh]];
    const out = Math.sin(a) * 1.4;
    for (const side of [-1, 1]) foil(k.team, k.fr, vOutline, (x, h) => [x, side * h * out, top + h * Math.cos(a)], unit([0, Math.cos(a), -side * out]), ft, grey(0.78));
  }
  if (t.tailSpan > 0 && t.kind !== 'v') {
    const up = t.kind === 't' ? top + fh : 0;
    const x0 = back + t.tailChord * 1.05;
    const sw = t.tailChord * 0.55;
    const s0 = spec.bodyWidth * 0.2;
    const plane: P2[] = [[x0, s0], [x0 - t.tailChord, s0], [x0 - t.tailChord - sw * 0.2, t.tailSpan / 2], [x0 - sw, t.tailSpan / 2]];
    const tan = Math.tan(((t.planeDihedral ?? 0) * Math.PI) / 180);
    for (const side of [-1, 1]) foil(k.team, k.fr, plane, (a, b) => [a, side * b, up + (b - s0) * tan], [0, 0, 1], Math.max(0.06, t.tailChord * 0.07), grey(0.84), { under: UNDER });
    if (t.kind === 'h') {
      const hOutline: P2[] = [[x0 - 0.1, 0], [x0 - t.tailChord, 0], [x0 - t.tailChord, fh], [x0 - 0.3, fh]];
      for (const side of [-1, 1]) foil(k.team, k.fr, hOutline, (a, h) => [a, side * t.tailSpan / 2, h - fh * 0.4], [0, 1, 0], 0.1, grey(0.8));
    }
  }
}

/** A jet nozzle: its outer shell, the lip, and a dark inside going in, so the opening has depth. */
function nozzle(k: Kit, x: number, s: number, u: number, d: number, length = 0.45): void {
  lathe(k.fixed, k.fr, [x + length, s, u], [x, s, u], [[0, d * 0.5], [0.85, d * 0.48], [1, d * 0.46], [1, d * 0.41]], PAINT.metal, 0, 1, { open: true });
  lathe(k.fixed, k.fr, [x + length, s, u], [x, s, u], [[1, d * 0.41], [0.25, d * 0.37]], PAINT.dark, 0, 1, { inner: true });
  // The bottom of the opening: the turbine face, darker still.
  ring(k.fixed, { o: [0, 0, 0], f: [0, 1, 0], r: [0, 0, 1], u: [-1, 0, 0] }, u, s, -(x + length * 0.75), d * 0.38, [0.05, 0.05, 0.055], 1, 14);
}

/** A podded engine's nacelle from its intake back, its intake's dark face set in the lip. */
function nacelle(k: Kit, x0: number, s: number, u: number, len: number, d: number, col: Rgb, jet: boolean): void {
  const profile: P2[] = jet
    ? [[0, d * 0.44], [0.03, d * 0.5], [0.4, d * 0.5], [0.85, d * 0.42], [1, d * 0.35]]
    : [[0, d * 0.32], [0.08, d * 0.47], [0.35, d * 0.5], [0.75, d * 0.42], [1, d * 0.22]];
  lathe(k.team, k.fr, [x0, s, u], [x0 - len, s, u], profile, col);
  if (jet) ring(k.fixed, FACING_FORWARD, u, s, x0 + 0.01, d * 0.4, PAINT.dark, 1, 14);
}

function engines(k: Kit, spec: FixedWingSpec): void {
  const e = spec.engines;
  if (!e) return;
  const d = e.diameter ?? spec.bodyHeight * 0.45;
  const w = spec.wing;
  const up = mountHeight(w, spec);
  const half = w.span / 2;
  const sweep = Math.tan((w.sweep * Math.PI) / 180);
  const positions = e.at ?? (e.count >= 4 ? [0.3, 0.58] : e.count >= 2 ? [0.32] : [0]);
  const L = spec.length;
  if (e.kind === 'wing-pods' || e.kind === 'wing-props') {
    for (const side of [-1, 1]) {
      for (const p of positions) {
        const s = side * half * p;
        const le = w.x + w.rootChord / 2 - Math.abs(s) * sweep;
        const len = e.length ?? Math.max(d * 2.4, w.rootChord * 0.9);
        const x0 = e.kind === 'wing-pods' ? le + len * 0.45 : le + d * 0.6;
        const below = e.kind === 'wing-pods' ? up - d * 0.75 : up;
        for (const ds of e.pair ? [-d * 0.55, d * 0.55] : [0]) nacelle(k, x0, s + ds, below, len, d, grey(0.8), e.kind === 'wing-pods');
        if (e.kind === 'wing-props' && e.up) rotorUp(k, x0 - len * 0.3, s, below + d * 0.6, spec.propeller?.diameter ?? d * 2.8, spec.propeller?.blades ?? 3);
        else if (e.kind === 'wing-props') propeller(k, x0 + 0.08, s, below, spec.propeller?.diameter ?? d * 2.8, spec.propeller?.blades ?? 3);
      }
    }
  } else if (e.kind === 'rear-pods') {
    for (const side of [-1, 1]) nacelle(k, -L * 0.22, side * (spec.bodyWidth / 2 + d * 0.55), spec.bodyHeight * 0.2, d * 2.6, d, grey(0.8), true);
  } else if (e.kind === 'tail-top') {
    nacelle(k, -L * 0.25, 0, spec.bodyHeight * 0.6, d * 2.8, d, grey(0.8), true);
  } else if (e.kind === 'internal' && e.nozzles) {
    for (const [x, s, u] of e.nozzles) nozzle(k, x, s, u, d);
  } else if (e.kind === 'internal') {
    // Exhausts at the tail.
    const n = Math.max(1, e.count);
    for (let i = 0; i < n; i++) {
      const s = (i - (n - 1) / 2) * d * 1.05;
      nozzle(k, -L / 2 - 0.15, s, 0, d);
    }
  } else if (e.kind === 'pusher' && spec.propeller) {
    // Behind the fuselage, or behind a twin-boom's short nacelle.
    propeller(k, L / 2 - (spec.bodyLength ?? L) - 0.1, 0, 0, spec.propeller.diameter, spec.propeller.blades);
  }
}

function intakes(k: Kit, spec: FixedWingSpec): void {
  const kind = spec.intakes ?? 'none';
  const L = spec.length;
  const bw = spec.bodyWidth / 2;
  const bh = spec.bodyHeight / 2;
  const x = L / 2 - L * 0.3;
  if (kind === 'side') {
    for (const side of [-1, 1]) block(k.team, k.fr, [x - L * 0.08, side * (bw + bh * 0.25), -bh * 0.1], L * 0.28, bh * 0.55, bh * 1.2, grey(0.8));
  } else if (kind === 'chin') {
    block(k.team, k.fr, [x - L * 0.05, 0, -bh * 1.05], L * 0.32, bw * 1.2, bh * 0.7, grey(0.78));
  } else if (kind === 'under') {
    block(k.team, k.fr, [x - L * 0.1, 0, -bh * 0.95], L * 0.3, bw * 1.8, bh * 0.6, grey(0.78));
  } else if (kind === 'dorsal') {
    block(k.team, k.fr, [-L * 0.1, 0, bh * 1.0], L * 0.2, bw * 0.8, bh * 0.6, grey(0.78));
  }
}

function canopy(k: Kit, spec: FixedWingSpec): void {
  const c = spec.canopy;
  if (!c || c.kind === 'none') return;
  const bh = spec.bodyHeight / 2;
  const bw = spec.bodyWidth / 2;
  if (c.kind === 'airliner') return;
  if (c.kind === 'glass-nose') {
    blob(k.fixed, k.fr, [spec.length / 2 - c.length / 2, 0, 0], [c.length / 2, bw * 0.85, bh * 0.85], PAINT.glass);
    return;
  }
  if (c.kind === 'tandem') {
    // Two seats under one long canopy, the rear one stepped up.
    const q = c.length / 4;
    blob(k.fixed, k.fr, [c.x + q, 0, bh * 0.72], [q * 1.15, bw * 0.55, bh * 0.45], PAINT.glass);
    blob(k.fixed, k.fr, [c.x - q, 0, bh * 0.84], [q * 1.15, bw * 0.55, bh * 0.52], PAINT.glass);
    return;
  }
  const h = c.kind === 'bubble' ? bh * 0.55 : bh * 0.4;
  blob(k.fixed, k.fr, [c.x, 0, bh * 0.75], [c.length / 2, bw * 0.55, h], PAINT.glass);
}

/** A rotor lying level above (x, side, up): a tiltrotor's prop-rotor turned up. */
function rotorUp(k: Kit, x: number, side: number, up: number, diameter: number, blades: number): void {
  const r = diameter / 2;
  ring(k.fixed, k.fr, x, side, up, r, PAINT.rotor, 0.2, 24);
  const c = r * 0.14;
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2 + 0.3;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    foil(k.fixed, k.fr, bladePlan(r, c), (s, q) => [x + ca * s - sa * q, side + sa * s + ca * q, up], [0, 0, 1], c * 0.2, PAINT.rotor, { span: 'a' });
  }
  lathe(k.fixed, k.fr, [x, side, up - r * 0.06], [x, side, up + r * 0.1], [[0, r * 0.1], [0.5, r * 0.09], [1, 0]], PAINT.metal);
}

/** A propeller blade's planform (along the blade, across it): narrow at the hub, widest past halfway, a rounded tip. */
function bladePlan(r: number, chord: number): P2[] {
  const c = chord / 2;
  return [[r * 0.12, c * 0.7], [r * 0.55, c * 1.1], [r * 0.9, c * 0.85], [r, c * 0.2], [r, -c * 0.4], [r * 0.9, -c * 0.85], [r * 0.55, -c], [r * 0.12, -c * 0.6]];
}

/** Propeller blades with a little twist off the disc, a faint disc, and the spinner, facing forward at (x, side, up). */
function propeller(k: Kit, x: number, side: number, up: number, diameter: number, blades: number): void {
  const r = diameter / 2;
  ring(k.fixed, FACING_FORWARD, up, side, x - 0.02, r, PAINT.rotor, 0.18, 28);
  const c = r * 0.16;
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2 + 0.3;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    // Along the blade (side, up) and across it towards the way it turns, the chord pitched 30 degrees off the disc.
    const pc = Math.cos(0.5);
    const ps = Math.sin(0.5);
    foil(k.fixed, k.fr, bladePlan(r, c), (s, q) => [x + q * ps, side + ca * s - sa * q * pc, up + sa * s + ca * q * pc], unit([pc, sa * ps, -ca * ps]), c * 0.18, PAINT.rotor, { span: 'a' });
  }
  // The spinner: a rounded cone ahead of the blades.
  const rs = Math.max(0.08, r * 0.13);
  lathe(k.fixed, k.fr, [x - rs * 0.6, side, up], [x + rs * 1.7, side, up], [[0, rs], [0.35, rs * 0.97], [0.7, rs * 0.7], [0.92, rs * 0.3], [1, 0]], PAINT.metal);
}

// ---------------------------------------------------------------- helicopters

export interface HeliSpec {
  /** Fuselage length (without the rotor), rotor diameter, overall height. */
  length: number;
  rotor: number;
  height: number;
  bodyWidth: number;
  bodyHeight: number;
  /** tandem: narrow, two seats one behind the other (attack); cabin: a box with doors (transport); bubble: a small glass front (scout). */
  cabin: 'tandem' | 'cabin' | 'bubble' | 'boxy';
  rotors?: 'single' | 'tandem' | 'coaxial';
  blades?: number;
  tailRotor?: 'conventional' | 'fenestron' | 'notar' | 'none';
  /** Stub wings with stores: span, and pylons per side. */
  stubs?: { span: number; pylons: number };
  /** Mast-mounted sight or radar dome above the rotor. */
  mastDome?: boolean;
  /** Fixed landing gear, skids or wheels. */
  skids?: boolean;
  /** Engine pods on the sides of the cabin roof (Mi-24 and Apache style). */
  sideEngines?: boolean;
  /** Two fins at the ends of the tailplane instead of one (Ka-27 and the Kamov utility family). */
  twinFins?: boolean;
  /** Main wheels on legs under the cabin. */
  wheels?: boolean;
  /**
   * True outlines: the fuselage with its tail boom from side profile and plan
   * (forward from the middle, up from the cabin's axis), its glass as blobs
   * (forward, up, half length, half width, half height), the tail fin's
   * outline (forward, up from the boom), where the main rotor's hub is.
   */
  fuselage?: Outline;
  /** More bodies with a fuselage outline: engine pods, sponsons, mirrored when off the centre line. */
  bodies?: Outline[];
  /** Stub wings' forward position and height (with a fuselage outline), and their anhedral, degrees. */
  stubAt?: [number, number, number?];
  glass?: [number, number, number, number, number][];
  /**
   * The glass as Outline bodies (forward, up from the axis), drawn as the
   * fixed-wing `glass` is: flat-plate canopies in their true shape (AH-1S,
   * AH-64). Drawn besides any `glass` blobs, and in place of the default glass.
   */
  glassOutlines?: Outline[];
  finPlan?: P2[];
  rotorX?: number;
  mastTop?: number;
  /** The tail rotor's side (1 right, the default; -1 left), its hub (forward, up) and its diameter. */
  tailRotorSide?: 1 | -1;
  tailRotorAt?: [number, number];
  tailRotorDiameter?: number;
  /** The tail rotor's blade count (default four, as two crossed pairs). */
  tailBlades?: number;
  /** Four tail-rotor blades as two pairs this many degrees apart, a scissor or X rotor (Mi-28 about 35, AH-64 about 55). */
  tailScissor?: number;
  /** The tailplane's half planform (forward, out) at height `tailUp`, in place of the generic one; on one side only when `tailOneSide` is set (CH-53E). */
  tailPlan?: P2[];
  tailUp?: number;
  tailOneSide?: 1 | -1;
  /** Gun barrels, not mirrored: (forward, side, up) of the breech, length forward, radius (Mi-24P's fixed cannon, chin turrets). */
  guns?: [number, number, number, number, number][];
  /** Bodies drawn where they are, not mirrored (a cannon fairing on one side, a hoist, a radome off the centre line). */
  oneSide?: Outline[];
  /** The mast sight or radar: half width, half height, and its centre's height above the rotor head. */
  mastDomeSize?: [number, number, number];
  /** Skids with a fuselage outline: from forward x0 to x1, out at `side`, at height `up`. */
  skidAt?: [number, number, number, number];
  /** Wheels with a fuselage outline: (forward, side, up of the axle, radius); mirrored when off the centre line. */
  wheelAt?: [number, number, number, number][];
  /** Tandem rotors: the rear hub (forward, up). Coaxial: the gap between the two rotors. */
  rotor2?: [number, number];
  coaxGap?: number;
  /** Rotor blades with swept (BERP-like) tips. */
  sweptTips?: boolean;
  /**
   * The main rotor blades' chord, metres. Set, the blades are drawn flat at
   * their true width (default: thin round blades, about 2.4 % of the
   * diameter wide).
   */
  bladeChord?: number;
  /** The swept tips' chord at their root, metres, where wider than the blade's (AH-64E); draws the blades flat as `bladeChord` does. */
  tipChord?: number;
  /** Two intermeshing rotors side by side, their hubs this far apart (Flettner's synchropters, the K-MAX). */
  synchropter?: number;
  /** A pusher propeller at the tail: (forward, up, diameter, blades) (AH-56 Cheyenne, X3, Raider). */
  pusher?: [number, number, number, number];
}

export function buildHeli(spec: HeliSpec): Template {
  const k = newKit();
  const L = spec.length;
  const half = L / 2;
  const bw = spec.bodyWidth / 2;
  const bh = spec.bodyHeight / 2;
  const tandem = spec.rotors === 'tandem';
  const cabinLen = tandem ? L * 0.9 : L * 0.5;
  const S = (x: number, w: number, h: number, z = 0): Section => ({ x, w: Math.max(0.02, w), h: Math.max(0.02, h), z });
  // The cabin, then the tail boom to the back.
  const cabinFront = half;
  const cabinBack = half - cabinLen;
  const shape = spec.cabin;
  const sections: Section[] =
    shape === 'tandem'
      ? [S(cabinFront, bw * 0.25, bh * 0.3, -bh * 0.2), S(cabinFront - cabinLen * 0.18, bw * 0.75, bh * 0.75), S(cabinFront - cabinLen * 0.6, bw, bh), S(cabinBack, bw * 0.8, bh * 0.8, bh * 0.1)]
      : shape === 'bubble'
        ? [S(cabinFront, bw * 0.3, bh * 0.35), S(cabinFront - cabinLen * 0.25, bw * 0.95, bh * 0.95), S(cabinFront - cabinLen * 0.75, bw, bh), S(cabinBack, bw * 0.45, bh * 0.5, bh * 0.3)]
        : [S(cabinFront, bw * 0.55, bh * 0.55, -bh * 0.1), S(cabinFront - cabinLen * 0.12, bw * 0.95, bh * 0.92), S(cabinFront - cabinLen * 0.8, bw, bh), S(cabinBack, bw * 0.6, bh * 0.7, bh * 0.2)];
  if (spec.fuselage) outlineBody(k.team, k.fr, spec.fuselage, grey(0.9), 14);
  else body(k.team, k.fr, sections, grey(0.9), 12, shape === 'boxy' ? 3.6 : 2.6);
  // Glass at the front.
  for (const g of spec.glassOutlines ?? []) outlineBody(k.fixed, k.fr, g, PAINT.glass, 12);
  if (spec.glass) for (const [gx, gu, hl, hw, hh] of spec.glass) blob(k.fixed, k.fr, [gx, 0, gu], [hl, hw, hh], PAINT.glass);
  else if (spec.glassOutlines) {
    // The outlines are the glass.
  } else if (shape === 'tandem') {
    blob(k.fixed, k.fr, [cabinFront - cabinLen * 0.2, 0, bh * 0.55], [cabinLen * 0.13, bw * 0.55, bh * 0.4], PAINT.glass);
    blob(k.fixed, k.fr, [cabinFront - cabinLen * 0.42, 0, bh * 0.75], [cabinLen * 0.13, bw * 0.55, bh * 0.42], PAINT.glass);
  } else if (shape === 'bubble') {
    blob(k.fixed, k.fr, [cabinFront - cabinLen * 0.18, 0, bh * 0.05], [cabinLen * 0.2, bw * 0.9, bh * 0.85], PAINT.glass);
  } else {
    blob(k.fixed, k.fr, [cabinFront - cabinLen * 0.06, 0, bh * 0.35], [cabinLen * 0.08, bw * 0.8, bh * 0.45], PAINT.glass);
  }
  // Tail boom.
  if (!tandem) {
    const boomEnd = -half;
    // With a fuselage outline the boom is part of it; its top at the end is where the fin stands.
    const tz = spec.fuselage ? lerpPoly(spec.fuselage.top, boomEnd + 0.4) : bh * 0.5;
    if (!spec.fuselage) tube(k.team, k.fr, [cabinBack + 0.3, 0, bh * 0.3], [boomEnd, 0, bh * 0.55], Math.max(0.2, bh * 0.35), Math.max(0.1, bh * 0.16), grey(0.85), 10);
    const tr = spec.tailRotor ?? 'conventional';
    const finH = spec.finPlan ? Math.max(...spec.finPlan.map((p) => p[1])) : spec.height * 0.35;
    if (spec.twinFins) {
      const s = spec.bodyWidth * 0.75;
      plate(k.team, k.fr, [[boomEnd + 1.2, -s], [boomEnd + 0.3, -s], [boomEnd + 0.3, s], [boomEnd + 1.2, s]], tz, 0.06, grey(0.8));
      for (const side of [-1, 1]) foil(k.team, k.fr, [[boomEnd + 1.2, tz - finH * 0.25], [boomEnd + 0.3, tz - finH * 0.25], [boomEnd + 0.2, tz + finH * 0.7], [boomEnd + 0.9, tz + finH * 0.7]], (a, h) => [a, side * s, h], [0, 1, 0], 0.12, grey(0.82));
    } else {
      if (spec.finPlan) foil(k.team, k.fr, spec.finPlan, (a, h) => [a, 0, tz + h], [0, 1, 0], tr === 'fenestron' ? 0.3 : 0.14, grey(0.82), { ratio: tr === 'fenestron' ? 0.5 : 0.34 });
      else foil(k.team, k.fr, [[boomEnd + 1.0, tz], [boomEnd + 0.15, tz], [boomEnd - 0.1, tz + finH], [boomEnd + 0.4, tz + finH]], (a, h) => [a, 0, h], [0, 1, 0], tr === 'fenestron' ? 0.3 : 0.12, grey(0.82), { ratio: tr === 'fenestron' ? 0.5 : 0.34 });
      if (spec.tailPlan) {
        const sides = spec.tailOneSide ? [spec.tailOneSide] : [-1, 1];
        for (const side of sides) foil(k.team, k.fr, spec.tailPlan, (a, b) => [a, side * b, spec.tailUp ?? tz], [0, 0, 1], 0.1, grey(0.8), { under: UNDER });
      } else plate(k.team, k.fr, [[boomEnd + 1.6, -spec.bodyWidth * 0.6], [boomEnd + 1.0, -spec.bodyWidth * 0.6], [boomEnd + 1.0, spec.bodyWidth * 0.6], [boomEnd + 1.6, spec.bodyWidth * 0.6]], tz, 0.06, grey(0.8));
    }
    if (tr === 'conventional') {
      const r = (spec.tailRotorDiameter ?? spec.rotor * 0.2) / 2;
      const [tx, tu] = spec.tailRotorAt ?? [boomEnd + 0.25, tz + finH * 0.55];
      const ts = (spec.tailRotorSide ?? 1) * (0.25 + spec.bodyWidth * 0.12);
      const fr = { o: [0, 0, 0] as [number, number, number], f: [1, 0, 0] as [number, number, number], r: [0, 1, 0] as [number, number, number], u: [0, 0, 1] as [number, number, number] };
      ring(k.fixed, fr, tx, tu, ts * 0.88, r, PAINT.rotor, 0.3, 16);
      // The tail rotor's blades, so the silhouette shows them: two crossed pairs, a scissor's pairs, or single blades.
      const nb = spec.tailBlades ?? 4;
      if (spec.tailScissor || nb === 4) {
        const pairs = [0.4, 0.4 + (spec.tailScissor ? (spec.tailScissor * Math.PI) / 180 : Math.PI / 2)];
        for (const a of pairs) tube(k.fixed, k.fr, [tx + Math.cos(a) * r, ts, tu + Math.sin(a) * r], [tx - Math.cos(a) * r, ts, tu - Math.sin(a) * r], r * 0.06, r * 0.06, PAINT.rotor, 4);
      } else {
        for (let i = 0; i < nb; i++) {
          const a = 0.4 + (i / nb) * Math.PI * 2;
          tube(k.fixed, k.fr, [tx, ts, tu], [tx + Math.cos(a) * r, ts, tu + Math.sin(a) * r], r * 0.06, r * 0.06, PAINT.rotor, 4);
        }
      }
    }
  }
  // Rotors: a faint disc and the blades.
  const mast = spec.mastTop ?? bh + Math.max(0.35, spec.height - spec.bodyHeight - 0.4) * 0.45;
  const hubs: [number, number, number][] = spec.rotor2
    ? [[spec.rotorX ?? cabinFront - 0.6, mast, 0], [...spec.rotor2, 0]]
    : tandem
      ? [[cabinFront - 0.6, mast, 0], [cabinBack + 0.6, mast + 0.5, 0]]
      : spec.synchropter
        ? [-1, 1].map((s) => [spec.rotorX ?? 0, mast, (s * spec.synchropter!) / 2] as [number, number, number])
        : [[spec.rotorX ?? cabinFront - cabinLen * 0.55, mast, 0]];
  const levels = spec.rotors === 'coaxial' ? [mast, mast + (spec.coaxGap ?? 0.7)] : [mast];
  for (const [x, up, y] of hubs) {
    for (const lv of levels) {
      const u = lv + (up - mast);
      tube(k.fixed, k.fr, [x, y * 0.3, bh * 0.8], [x, y, u], 0.1, 0.08, PAINT.metal, 6);
      ring(k.fixed, k.fr, x, y, u, spec.rotor / 2, PAINT.rotor, 0.22, 28);
      const n = spec.blades ?? 4;
      for (let i = 0; i < n; i++) {
        // Two blades at 45 degrees, so their span shows from the side and the front alike.
        const a = (i / n) * Math.PI * 2 + (n === 2 ? Math.PI / 4 : 0.4);
        const R = spec.rotor / 2;
        const tip = spec.sweptTips ? 0.92 : 1;
        if (spec.bladeChord || spec.tipChord) {
          // Blades of a given chord: flat (0.12 m thick, a little over true so they still read edge-on), so their width
          // shows from above.
          const w = (spec.bladeChord ?? spec.rotor * 0.024) / 2;
          const wt = (spec.tipChord ?? w * 2) / 2;
          const c = Math.cos(a);
          const sn = Math.sin(a);
          // Along the blade, and across it towards the way it turns.
          const map = (r: number, q: number): Vec3 => [x + c * r - sn * q, y + sn * r + c * q, u];
          foil(k.fixed, k.fr, [[R * 0.06, w], [R * tip, w], [R * tip, -w], [R * 0.06, -w]], map, [0, 0, 1], 0.12, PAINT.rotor, { span: 'a', ratio: 0.5 });
          // The swept tip, its leading edge running back to a narrower end (AH-64E, Merlin, Lynx's BERP blades).
          if (spec.sweptTips) foil(k.fixed, k.fr, [[R * tip, wt], [R, wt * 0.2 - R * (1 - tip) * 0.6], [R, -wt * 0.6 - R * (1 - tip) * 0.6], [R * tip, -wt]], map, [0, 0, 1], 0.1, PAINT.rotor, { span: 'a', ratio: 0.5 });
          continue;
        }
        // Blades of no given chord: about 2.6 % of the diameter wide, a little thicker than true so they read edge-on.
        const w = spec.rotor * 0.013;
        const c = Math.cos(a);
        const sn = Math.sin(a);
        const map = (r: number, q: number): Vec3 => [x + c * r - sn * q, y + sn * r + c * q, u];
        foil(k.fixed, k.fr, [[R * 0.06, w], [R * tip, w], [R * tip, -w], [R * 0.06, -w]], map, [0, 0, 1], 0.12, PAINT.rotor, { span: 'a', ratio: 0.5 });
        // A swept tip: the last part of the blade bent back against the turn (AH-64E, Merlin, Lynx's BERP blades).
        if (spec.sweptTips) foil(k.fixed, k.fr, [[R * tip, w], [R, w * 0.2 - R * (1 - tip) * 0.6], [R, -w * 0.6 - R * (1 - tip) * 0.6], [R * tip, -w]], map, [0, 0, 1], 0.1, PAINT.rotor, { span: 'a', ratio: 0.5 });
      }
      // The hub.
      lathe(k.fixed, k.fr, [x, y, u - 0.18], [x, y, u + 0.16], [[0, Math.max(0.15, spec.rotor * 0.02)], [0.6, Math.max(0.15, spec.rotor * 0.022)], [1, Math.max(0.06, spec.rotor * 0.008)]], PAINT.metal);
    }
    if (spec.mastDome) {
      const [dw, dh, du] = spec.mastDomeSize ?? [0.45, 0.35, 0.5];
      tube(k.fixed, k.fr, [x, 0, up], [x, 0, up + du], 0.08, 0.08, PAINT.metal, 6);
      blob(k.fixed, k.fr, [x, 0, up + du], [dw, dw, dh], PAINT.light);
    }
  }
  for (const [gx, gs, gu, gl, gr] of spec.guns ?? []) tube(k.fixed, k.fr, [gx, gs, gu], [gx + gl, gs, gu], gr, gr * 0.85, PAINT.dark, 6);
  if (spec.pusher) propeller(k, spec.pusher[0], 0, spec.pusher[1], spec.pusher[2], spec.pusher[3]);
  for (const b of spec.oneSide ?? []) outlineBody(k.team, k.fr, b, grey(0.8), 12);
  // Engine housing on the roof.
  for (const b of spec.bodies ?? []) {
    outlineBody(k.team, k.fr, b, grey(0.8), 12);
    if (b.side) outlineBody(k.team, k.fr, { ...b, side: -b.side }, grey(0.8), 12);
  }
  if (spec.fuselage) {
    // Engines and the rest are in the outline and the bodies.
  } else if (spec.sideEngines) {
    for (const side of [-1, 1]) tube(k.team, k.fr, [cabinFront - cabinLen * 0.45, side * bw * 0.85, bh * 0.85], [cabinBack, side * bw * 0.85, bh * 0.85], bh * 0.32, bh * 0.25, grey(0.75), 8);
  } else if (!tandem) block(k.team, k.fr, [cabinFront - cabinLen * 0.6, 0, bh * 1.05], cabinLen * 0.5, bw * 1.1, bh * 0.4, grey(0.82));
  if (spec.stubs) {
    const sx = spec.stubAt ? spec.stubAt[0] : cabinFront - cabinLen * 0.62;
    const span = spec.stubs.span / 2;
    const su = spec.stubAt ? spec.stubAt[1] : -bh * 0.1;
    const an = Math.tan(((spec.stubAt?.[2] ?? 0) * Math.PI) / 180);
    const chord = spec.stubAt ? 0.6 + spec.stubs.span * 0.05 : 0.4;
    for (const side of [-1, 1]) {
      // A stub wing out from the side (drooping with anhedral, as on the Mi-24), its stores under it.
      foil(k.team, k.fr, [[sx + chord, bw * 0.8], [sx - chord, bw * 0.8], [sx - chord * 0.9, span], [sx + chord * 0.8, span]], (a, b) => [a, side * b, su - (b - bw * 0.8) * an], [0, 0, 1], chord * 0.24, grey(0.82), { under: UNDER });
      for (let i = 0; i < spec.stubs.pylons; i++) {
        const y = bw + ((span - bw) * (i + 0.6)) / spec.stubs.pylons;
        const z = su - (y - bw * 0.8) * an - 0.35;
        tube(k.fixed, k.fr, [sx + 0.8, side * y, z], [sx - 0.9, side * y, z], 0.2, 0.2, PAINT.metal, 8);
      }
    }
  }
  for (const [wx, ws, wu, wr] of spec.wheelAt ?? []) {
    for (const side of ws ? [-1, 1] : [1]) {
      const s = side * ws;
      const belly = spec.fuselage ? lerpPoly(spec.fuselage.bottom, wx) + 0.05 : wu + wr * 1.6;
      tube(k.fixed, k.fr, [wx, s * 0.6, belly], [wx, s, wu], 0.06, 0.05, PAINT.dark, 4);
      wheel(k.fixed, k.fr, s, wu, wr, wr * 0.8, PAINT.tyre, PAINT.metal, side);
    }
  }
  if (spec.wheels && !spec.wheelAt) {
    for (const side of [-1, 1]) {
      const x = cabinFront - cabinLen * 0.6;
      tube(k.fixed, k.fr, [x, side * bw * 0.7, -bh * 0.6], [x, side * bw * 1.1, -bh - 0.35], 0.06, 0.05, PAINT.dark, 4);
      tube(k.fixed, k.fr, [x, side * bw * 1.1 - 0.15, -bh - 0.35], [x, side * bw * 1.1 + 0.15, -bh - 0.35], 0.32, 0.32, PAINT.tyre, 10);
    }
  }
  if (spec.skidAt) {
    const [x0, x1, s, u] = spec.skidAt;
    for (const side of [-1, 1]) {
      tube(k.fixed, k.fr, [x0, side * s, u + 0.12], [x1, side * s, u], 0.06, 0.06, PAINT.dark, 5);
      // The two cross tubes up to the belly.
      for (const f of [0.3, 0.75]) {
        const x = x0 + (x1 - x0) * f;
        tube(k.fixed, k.fr, [x, side * s, u], [x, side * s * 0.45, spec.fuselage ? lerpPoly(spec.fuselage.bottom, x) + 0.1 : -bh], 0.05, 0.05, PAINT.dark, 4);
      }
    }
  } else if (spec.skids) {
    for (const side of [-1, 1]) tube(k.fixed, k.fr, [cabinFront - 0.2, side * bw * 1.1, -bh - 0.45], [cabinBack - 0.2, side * bw * 1.1, -bh - 0.45], 0.05, 0.05, PAINT.dark, 5);
  }
  return finish(k, 'centre');
}

// ---------------------------------------------------------------- missiles

export interface MissileFigureSpec {
  length: number;
  diameter: number;
  /** Sets of four fins: where along the body (share from the front), span tip to tip, chord. */
  fins: {
    at: number;
    span: number;
    chord: number;
    /** Rotated 45 degrees to the next set. */
    x?: boolean;
    /** The chord at the tip (default 0.55 of the root's): 0 for a pointed delta, the root's for a square fin. */
    tip?: number;
  }[];
  /** ogive: pointed; blunt: a glass seeker; cone: sharp; round: a bomb's nose. */
  nose?: 'ogive' | 'blunt' | 'cone' | 'round';
  /** Pop-out wings of a cruise missile: span, chord. */
  wings?: { span: number; chord: number; at: number };
  /** A bomb's fatter body: diameter at the middle over the tail. */
  bulge?: number;
  /**
   * The body's true outline in place of the nose kind's: (distance from the nose as a share of the length,
   * radius in metres), front to back - a stepped motor (R-27ER), a seeker's bulge, a bomb's boat tail.
   */
  profile?: P2[];
  /** An aerospike on the nose this long (Igla, Trident). */
  spike?: number;
}

export function buildMissile(spec: MissileFigureSpec): Template {
  const k = newKit();
  const L = spec.length;
  const r = spec.diameter / 2;
  const half = L / 2;
  const nose = spec.nose ?? 'ogive';
  const noseLen = nose === 'blunt' ? r * 1.2 : nose === 'round' ? r * 1.6 : r * 4;
  const bulge = spec.bulge ?? 1;
  const S = (x: number, w: number): Section => ({ x, w: Math.max(0.005, w), h: Math.max(0.005, w), z: 0 });
  const sections = spec.profile
    ? spec.profile.map(([s, rad]) => S(half - L * s, rad))
    : [S(half, nose === 'blunt' ? r * 0.7 : nose === 'round' ? r * 0.35 : 0.005), S(half - noseLen * 0.5, r * (nose === 'cone' ? 0.5 : 0.8) * bulge), S(half - noseLen, r * bulge), S(-half + L * 0.25, r * bulge), S(-half, r * (bulge > 1 ? 0.55 : 0.9))];
  body(k.team, k.fr, sections, grey(0.92), 10, 2);
  // The body's radius where a fin's root stands.
  const radiusAt = (x: number) => (spec.profile ? lerpPoly(spec.profile.map(([s, rad]) => [half - L * s, rad] as P2), x) : r);
  if (spec.spike) {
    tube(k.fixed, k.fr, [half, 0, 0], [half + spec.spike, 0, 0], r * 0.12, r * 0.08, PAINT.metal, 6);
    blob(k.fixed, k.fr, [half + spec.spike, 0, 0], [r * 0.12, r * 0.2, r * 0.2], PAINT.metal, 1, 3, 6);
  }
  if (nose === 'blunt') blob(k.fixed, k.fr, [half + r * 0.05, 0, 0], [r * 0.3, r * 0.65, r * 0.65], PAINT.glass, 1, 4, 8);
  for (const f of spec.fins) {
    const x = half - L * f.at;
    const rot = f.x ? Math.PI / 4 : 0;
    for (let i = 0; i < 4; i++) {
      const a = rot + (i * Math.PI) / 2;
      const ds = Math.cos(a);
      const du = Math.sin(a);
      const tip = f.span / 2;
      const t = Math.max(0.004, r * 0.08);
      const root = Math.min(radiusAt(x - f.chord / 2), tip * 0.98);
      const tc = f.tip ?? f.chord * 0.55;
      const p = (fwd: number, rad: number, n: number): [number, number, number] => [fwd, du * rad + ds * n, ds * rad - du * n];
      // A swept fin from the body out to its tip.
      k.team.quad(p(x, root, -t), p(x - f.chord, root, -t), p(x - f.chord, tip, -t), p(x - f.chord + tc, tip, -t), grey(0.7));
      k.team.quad(p(x, root, t), p(x - f.chord + tc, tip, t), p(x - f.chord, tip, t), p(x - f.chord, root, t), grey(0.8));
    }
  }
  if (spec.wings) {
    const w = spec.wings;
    const x = half - L * w.at;
    plate(k.team, k.fr, [[x + w.chord, -w.span / 2], [x, -w.span / 2], [x, w.span / 2], [x + w.chord, w.span / 2]], 0, r * 0.15, grey(0.8));
  }
  return finish(k, 'centre');
}
