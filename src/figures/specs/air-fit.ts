/**
 * Wing and tail proportions fitted to the War Thunder reference. Where public sources do not fix an aircraft's plan
 * well enough for the top view (the user's call, 2026-11-14: hits and events have to land on the right spot of the
 * aircraft), the figure may be fitted to the reference silhouette. `ks` scales the wing's span (its planform outward,
 * the upper wing's, propellers and nacelles set out on it), `kc` its chords (the planform about its root's middle),
 * `dx` moves the wing forward (+) or back (-) along the fuselage with what hangs on it, and `kt` scales the tailplane
 * and fin; `kb` scales the fuselage's height about its axis (its profile, the canopy and what rides on the centre line).
 * Found by measuring each figure at several settings and keeping the one that matched the top and side views
 * best; listed in sources.md as fitted to the WT reference.
 */

import type { FixedWingSpec, WingSpec } from '../air';
import type { Outline, P2 } from '../parts';

/** A wing's fitted span, chord, place and tail scale. */
export interface AirFit {
  ks?: number;
  kc?: number;
  dx?: number;
  kt?: number;
  kb?: number;
}

export const AIR_FIT: Record<string, AirFit> = {};

/** The spec with its wing `ks` times as wide, `kc` times as deep, `dx` further forward and its tail `kt` times as large. */
export function scaleWing(s: FixedWingSpec, f: AirFit): FixedWingSpec {
  const ks = f.ks ?? 1;
  const kc = f.kc ?? 1;
  const dx = f.dx ?? 0;
  const kt = f.kt ?? 1;
  const kb = f.kb ?? 1;
  const tall = (o: Outline): Outline => (kb === 1 ? o : { ...o, top: o.top.map(([x, y]): P2 => [x, y * kb]), bottom: o.bottom.map(([x, y]): P2 => [x, y * kb]) });
  const half = s.wing.span / 2;
  const x0 = s.wing.x;
  const wing = (w: WingSpec): WingSpec => ({ ...w, x: w.x + dx, span: w.span * ks, rootChord: w.rootChord * kc, tipChord: w.tipChord * kc });
  // A plan point: chord-wise about the root's middle, span-wise outward.
  const plan = (p: P2[]): P2[] => p.map(([x, y]): P2 => [x0 + (x - x0) * kc + dx, y * ks]);
  // A part out on the wing (beyond a fifth of the half span) moves out with it and along with it.
  const out = (side: number) => Math.abs(side) > half * 0.2;
  return {
    ...s,
    bodyHeight: s.bodyHeight * kb,
    ...(s.fuselage ? { fuselage: tall(s.fuselage) } : {}),
    ...(s.glass ? { glass: s.glass.map((g) => ({ ...g, ...tall(g) })) } : {}),
    span: s.span * ks,
    wing: wing(s.wing),
    ...(s.upperWing ? { upperWing: wing(s.upperWing) } : {}),
    ...(s.wingPlan ? { wingPlan: plan(s.wingPlan) } : {}),
    ...(s.bodies ? { bodies: s.bodies.map((b) => (b.side && out(b.side) ? { ...b, side: b.side * ks, top: b.top.map(([x, y]): P2 => [x + dx, y]), bottom: b.bottom.map(([x, y]): P2 => [x + dx, y]), plan: b.plan.map(([x, y]): P2 => [x + dx, y]) } : tall(b))) } : {}),
    ...(s.props ? { props: s.props.map((p) => (out(p.side) ? { ...p, side: p.side * ks, x: p.x + dx } : p)) } : {}),
    tail: { ...s.tail, ...(s.tail.finBase !== undefined ? { finBase: s.tail.finBase * kb } : {}), ...(s.tail.planeUp !== undefined ? { planeUp: s.tail.planeUp * kb } : {}), tailSpan: s.tail.tailSpan * kt, tailChord: s.tail.tailChord * kt, finHeight: s.tail.finHeight * kt, finChord: s.tail.finChord * kt },
    ...(s.tailPlan && kt !== 1 ? { tailPlan: tailScaled(s.tailPlan, kt) } : {}),
    ...(s.finPlan && kt !== 1 ? { finPlan: tailScaled(s.finPlan, kt) } : {}),
  } as FixedWingSpec;
}

/** A tail planform scaled about its root's middle (the hinge stays where it is along the fuselage). */
function tailScaled(p: P2[], k: number): P2[] {
  const xs = p.map((q) => q[0]);
  const xm = (Math.min(...xs) + Math.max(...xs)) / 2;
  return p.map(([x, y]): P2 => [xm + (x - xm) * k, y * k]);
}

/** Fits the listed aircraft in place. */
export function fitAircraft(A: Record<string, FixedWingSpec>): void {
  for (const [name, f] of Object.entries(AIR_FIT)) {
    const s = A[name];
    if (s) A[name] = scaleWing(s, f);
  }
}
