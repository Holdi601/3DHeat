/**
 * Wing and tail proportions fitted to the War Thunder reference. Where public sources do not fix an aircraft's plan
 * well enough for the top view (the user's call, 2026-11-14: hits and events have to land on the right spot of the
 * aircraft), the figure may be fitted to the reference silhouette. `ks` scales the wing's span (its planform outward,
 * the upper wing's, propellers and nacelles set out on it), `kc` its chords (the planform about its root's middle),
 * `dx` moves the wing forward (+) or back (-) along the fuselage with what hangs on it, and `kt` scales the tailplane
 * and fin; `kb` scales the fuselage's height about its axis (its profile, the canopy and what rides on the centre line),
 * `kw` its width (its plan and what rides on the centre line).
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
  kw?: number;
}

export const AIR_FIT: Record<string, AirFit> = {
  'a-1-skyraider': { kc: 1.1, kb: 1.172 },
  'a-20g': { kb: 1.073 },
  'a-26-invader': { kb: 1.131 },
  'a-26c': { kb: 1.131 },
  a2d: { kb: 1.114 },
  'b-18': { dx: -0.4 },
  'b-25': { ks: 1.05, dx: 0.4, kt: 1.15, kb: 1.25 },
  'b-26-marauder': { kb: 1.25 },
  'b-29': { ks: 0.95, dx: -0.4 },
  'bf-109-e': { kc: 1.1, kb: 1.058 },
  'bf-109-f': { kb: 1.04 },
  'bf-109-k4': { kb: 1.057 },
  'bf-110g': { kb: 1.114 },
  bf2c: { kb: 1.131 },
  'blenheim-iv': { kb: 1.25 },
  'bv-238': { kc: 1.1, dx: 0.4, kb: 1.129 },
  'c-3604': { dx: 0.4 },
  'cw-21': { ks: 1.05 },
  'do-217': { dx: 0.4, kb: 1.09 },
  'do-335': { kc: 1.1, dx: 0.4, kb: 1.143 },
  'er-2': { ks: 0.95, kc: 1.1, dx: -0.4, kb: 1.07 },
  'f-104': { dx: 0.4 },
  'f-104g': { ks: 0.95, dx: 0.4 },
  'f-15c': { ks: 0.95, dx: -0.4 },
  'f-15e': { ks: 0.95, dx: -0.4, kb: 1.021 },
  'f-5e': { ks: 0.95, dx: -0.4, kb: 0.96 },
  'f-82e': { ks: 1.05, kc: 1.1, kb: 1.16 },
  'f-84g': { ks: 0.95, kc: 1.1, kt: 0.85 },
  'f-86f': { kc: 1.1, kb: 1.044 },
  'f-86k': { ks: 1.05 },
  'f-a-18e': { dx: -0.4, kb: 0.923 },
  'f2a-buffalo': { kb: 1.056 },
  'f3d-1': { dx: 0.4 },
  'f4u-4': { kb: 1.029 },
  'f6f-hellcat': { ks: 1.05 },
  f7f: { kc: 1.1, dx: -0.4, kt: 1.15, kb: 1.032 },
  'f8f-bearcat': { kc: 1.1 },
  'ffvs-j22': { dx: 0.4, kt: 0.85, kb: 0.875 },
  firecrest: { kc: 1.1, kb: 1.097 },
  'firefly-mk4': { kc: 1.1, dx: -0.4, kb: 1.073 },
  'fokker-g1': { ks: 1.05, kc: 1.1, dx: 0.4, kt: 0.85 },
  'fw-189': { ks: 1.05, kc: 1.1, dx: -0.4, kb: 1.076 },
  'fw-190-a8': { kb: 1.055 },
  'fw-190-d9': { dx: 0.4 },
  'g4m-betty': { dx: 0.4 },
  'he-100': { kc: 1.1 },
  'he-111': { ks: 1.05, dx: 0.4, kb: 0.965 },
  'he-112': { ks: 1.05 },
  'hs-129': { kc: 0.9, dx: -0.4, kb: 1.066 },
  'hs-129b-3': { dx: -0.4 },
  'hunter-f1': { ks: 1.05, kb: 1.083 },
  'i-153': { kc: 1.1, kt: 0.85, kb: 1.25 },
  'i-16': { kc: 0.9 },
  'il-10': { kc: 1.1 },
  'il-2': { kc: 1.1 },
  'il-2-1941': { kc: 1.1 },
  j1n1: { ks: 0.95 },
  'jaguar-gr1': { dx: -0.4 },
  'jas-39e': { ks: 0.95, kc: 0.9, dx: 0.4 },
  'ki-43': { kc: 1.1 },
  'ki-44': { dx: 0.4, kt: 1.15 },
  'ki-45': { dx: -0.4 },
  'ki-49': { ks: 0.95, kc: 1.1, dx: 0.4 },
  'la-7': { kc: 1.1 },
  'lagg-3': { ks: 1.05, kc: 1.1, dx: -0.4 },
  'lightning-f6': { ks: 1.05, kc: 0.9, dx: 0.4 },
  'mb-157': { kc: 1.1, kb: 1.135 },
  'me-262-u4': { kb: 0.947 },
  'me-264': { kb: 1.167 },
  'me-410': { dx: -0.4 },
  'mig-21f-13': { kc: 0.9, dx: 0.4 },
  'ms-406': { kb: 1.241 },
  'ms-410': { dx: 0.4 },
  myrsky: { dx: 0.4, kb: 1.041 },
  narval: { kc: 1.1, kt: 1.15, kb: 0.925 },
  'p-108': { ks: 0.95, kc: 1.1, dx: 0.4 },
  'p-39': { kb: 1.025 },
  'p-47d': { kb: 1.033 },
  'p-47n': { ks: 1.05, kc: 0.9, kb: 1.042 },
  'p-51b': { kb: 1.083 },
  'p-51d-mustang': { ks: 1.05, kb: 1.085 },
  'p-61': { ks: 0.95, kc: 0.9, dx: -0.4, kt: 0.85 },
  'p-63': { kc: 1.1, dx: 0.4 },
  pbm: { kb: 1.041 },
  'pby-catalina': { ks: 1.05, kc: 1.1, dx: -0.4 },
  'pe-2': { kc: 0.9 },
  rafale: { ks: 0.95 },
  're-2000': { kc: 1.1, kb: 1.047 },
  're-2001': { kc: 1.1 },
  're-2005': { kc: 1.1 },
  'recon-micro-uav': { kc: 1.1, kt: 0.85 },
  's-199': { kc: 1.1, kt: 1.15 },
  'saab-b18a': { kc: 1.1, dx: 0.4, kt: 1.15 },
  'saab-j21a': { ks: 0.95, kc: 1.1, dx: 0.4 },
  'saab-t18b': { ks: 1.05, kc: 1.1, dx: 0.4, kt: 1.15, kb: 1.131 },
  'sb-2': { ks: 0.95, kc: 1.1, dx: 0.4 },
  sb2u: { kc: 1.1, dx: 0.4 },
  'sm-91': { kc: 1.1 },
  'spitfire-mk-xiv': { kb: 1.09 },
  'su-17m4': { ks: 0.95, dx: -0.4 },
  'su-2': { ks: 0.95 },
  'su-24m': { dx: -0.4, kb: 0.944 },
  'su-30': { ks: 0.95, kc: 0.9 },
  'su-30mki': { ks: 0.95, dx: -0.4, kb: 0.931 },
  'su-33': { ks: 0.95, dx: -0.4, kb: 0.891 },
  'su-7b': { dx: -0.4, kb: 0.961 },
  'tbd-1': { kc: 1.1, dx: 0.4, kb: 1.098 },
  'tempest-v': { kb: 1.031 },
  'tu-2': { kb: 0.957 },
  'tu-95m': { dx: 0.4 },
  'vb-10': { dx: -0.4 },
  vengeance: { kc: 1.1 },
  'vg-33': { dx: -0.4 },
  whirlwind: { ks: 1.05, kc: 1.1, dx: 0.4, kt: 1.15 },
  'yak-3': { kc: 1.1 },
  'yak-4': { kc: 1.1, dx: 0.4, kb: 1.1 },
};

/** The spec with its wing `ks` times as wide, `kc` times as deep, `dx` further forward and its tail `kt` times as large. */
export function scaleWing(s: FixedWingSpec, f: AirFit): FixedWingSpec {
  const ks = f.ks ?? 1;
  const kc = f.kc ?? 1;
  const dx = f.dx ?? 0;
  const kt = f.kt ?? 1;
  const kb = f.kb ?? 1;
  const kw = f.kw ?? 1;
  const tall = (o: Outline): Outline => (kb === 1 && kw === 1 ? o : { ...o, top: o.top.map(([x, y]): P2 => [x, y * kb]), bottom: o.bottom.map(([x, y]): P2 => [x, y * kb]), plan: o.plan.map(([x, y]): P2 => [x, y * kw]) });
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
    bodyWidth: s.bodyWidth * kw,
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
