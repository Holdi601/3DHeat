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
  'a-1-skyraider': { kc: 1.1, kb: 1.258, kw: 1.08 },
  'a-20g': { kb: 1.073 },
  'a-26-invader': { kb: 1.131 },
  'a-26c': { kb: 1.131 },
  a2d: { kb: 1.114, kw: 1.08 },
  'am-1': { kc: 1.1, dx: 0.4, kb: 1.095 },
  'b-17g': { ks: 0.95, kc: 0.9, dx: 0.4 },
  'b-18': { dx: -0.4, kw: 1.08 },
  'b-25': { ks: 1.05, dx: 0.4, kt: 1.15, kb: 1.375 },
  'b-26-marauder': { kb: 1.375, kw: 0.92 },
  'b-29': { ks: 0.95, dx: -0.4, kw: 0.92 },
  'b-34': { kb: 1.061 },
  'b5n-kate': { kc: 1.1, dx: 0.4, kt: 0.85, kb: 0.897 },
  'bf-109-e': { kc: 1.1, kb: 1.087 },
  'bf-109-f': { kb: 1.04 },
  'bf-109-g6': { kb: 1.06 },
  'bf-109-k4': { kb: 1.057 },
  'bf-110': { kw: 0.92 },
  'bf-110g': { kb: 1.171, kw: 0.92 },
  bf2c: { kb: 1.131 },
  'blenheim-iv': { kb: 1.375, kw: 0.92 },
  'br-20': { kw: 1.08, kc: 1.1, dx: 0.4, kb: 1.25 },
  'btd-1': { kw: 1.08, ks: 0.95, kc: 1.1, kb: 1.203 },
  'bv-238': { kc: 1.1, dx: 0.8, kb: 1.129 },
  'c-3604': { dx: 0.8 },
  'cr-714': { kw: 0.92, kt: 1.15, kb: 1.085 },
  'cw-21': { ks: 1.05, kw: 0.92 },
  'do-217': { dx: 0.4, kb: 1.135 },
  'do-335': { kc: 1.2, dx: 0.4, kb: 1.143 },
  'er-2': { ks: 0.95, kc: 1.2, dx: -0.4, kb: 1.07, kw: 1.08 },
  'f-104': { dx: 0.4, kw: 1.08 },
  'f-104g': { ks: 0.95, dx: 0.4, kw: 1.08 },
  'f-15c': { ks: 0.95, dx: -0.4 },
  'f-15e': { ks: 0.95, dx: -0.4, kb: 1.021 },
  'f-16c': { ks: 0.95, dx: -0.4 },
  'f-4b': { kw: 1.08, ks: 0.95, kc: 0.9, dx: -0.4 },
  'f-5e': { ks: 0.95, dx: -0.4, kb: 0.94 },
  'f-82e': { ks: 1.1, kc: 1.1, kb: 1.16 },
  'f-84g': { ks: 0.9, kc: 1.1, kt: 0.85, kw: 0.92 },
  'f-86f': { kc: 1.1, kb: 1.044, kw: 1.08 },
  'f-86k': { ks: 1.05 },
  'f-a-18e': { dx: -0.4, kb: 0.923, kw: 0.92 },
  'f-a-18f': { kw: 0.92, dx: -0.4, kb: 0.923 },
  'f2a-buffalo': { kb: 1.056 },
  'f3d-1': { dx: 0.8, kw: 1.08 },
  f3f: { ks: 0.95, kc: 1.1, kb: 1.25 },
  'f4u-4': { kb: 1.029 },
  'f6f-hellcat': { ks: 1.05, kw: 1.08 },
  f7f: { kc: 1.1, dx: -0.4, kt: 1.3, kb: 1.032, kw: 0.92 },
  'f8f-bearcat': { kc: 1.1, kw: 1.08 },
  'ffvs-j22': { dx: 0.4, kt: 0.85, kb: 0.875 },
  firebrand: { dx: 0.4 },
  firecrest: { kc: 1.1, kb: 1.145 },
  'firefly-mk4': { kc: 1.1, dx: -0.4, kb: 1.109 },
  'fokker-g1': { ks: 1.05, kc: 1.1, dx: 0.8, kt: 0.85, kw: 0.92 },
  'fw-189': { ks: 1.05, kc: 1.1, dx: -0.4, kb: 1.076 },
  'fw-190-a8': { kb: 1.055 },
  'fw-190-d9': { dx: 0.4 },
  'g4m-betty': { dx: 0.8, kw: 1.08 },
  h8k: { kb: 1.161 },
  'he-100': { kc: 1.1 },
  'he-111': { ks: 1.05, dx: 0.4, kb: 0.965, kw: 0.92 },
  'he-112': { ks: 1.05 },
  'he-112a': { ks: 1.05 },
  'he-162': { ks: 0.95, kc: 0.9, dx: 0.4, kt: 1.15 },
  'hs-129': { kc: 0.9, dx: -0.4, kb: 1.099 },
  'hs-129b-3': { dx: -0.4 },
  hudson: { kw: 1.08, kb: 1.03 },
  'hunter-f1': { ks: 1.05, kb: 1.083, kw: 1.08 },
  hurricane: { kw: 1.08 },
  'i-153': { kc: 1.2, kt: 0.85, kb: 1.25 },
  'i-16': { kc: 0.9 },
  'ia-58': { kw: 1.08, kc: 1.1, dx: -0.4 },
  'iar-80': { ks: 1.05, kc: 0.9, dx: 0.4 },
  'il-10': { kc: 1.1 },
  'il-2': { kc: 1.1 },
  'il-2-1941': { kc: 1.1 },
  'il-4': { kc: 1.1, dx: -0.4, kb: 1.212 },
  j1n1: { ks: 0.95, kw: 0.92 },
  'jaguar-gr1': { dx: -0.4, kw: 0.92 },
  'jas-39e': { ks: 0.95, kc: 0.9, dx: 0.4, kw: 1.08 },
  'ju-88c': { dx: 0.4 },
  'ki-21': { kc: 0.9, dx: -0.4, kb: 1.072 },
  'ki-43': { kc: 1.2 },
  'ki-43-i': { kc: 1.1, dx: 0.4 },
  'ki-44': { dx: 0.4, kt: 1.15, kw: 0.92 },
  'ki-45': { dx: -0.4 },
  'ki-49': { ks: 0.95, kc: 1.2, dx: 0.4 },
  'ki-61': { kw: 1.08, dx: -0.4, kt: 0.85, kb: 0.912 },
  'ki-67': { kw: 1.08 },
  'ki-84': { kw: 1.08 },
  'l-39': { dx: -0.4, kt: 0.85 },
  'la-7': { kc: 1.1 },
  'lagg-3': { ks: 1.05, kc: 1.1, dx: -0.4 },
  'lightning-f6': { ks: 1.05, kc: 0.9, dx: 0.8 },
  'mb-152': { kw: 0.92, ks: 0.95, kc: 0.9, kb: 1.104 },
  'mb-157': { kc: 1.2, kb: 1.135 },
  'me-262-u4': { kb: 0.947 },
  'me-264': { kb: 1.167 },
  'me-410': { dx: -0.4 },
  'mig-21f-13': { kc: 0.9, dx: 0.8, kw: 0.92 },
  'mig-29smt': { kt: 0.85, kb: 0.943 },
  'mig-35': { dx: 0.4 },
  'ms-406': { kb: 1.362 },
  'ms-410': { dx: 0.4 },
  myrsky: { dx: 0.4, kb: 1.041 },
  narval: { kc: 1.1, kt: 1.15, kb: 0.888, kw: 1.08 },
  'nc-223': { kw: 0.92, dx: 0.4 },
  'p-108': { ks: 0.95, kc: 1.1, dx: 0.8 },
  'p-35': { kc: 1.1, dx: 0.4, kt: 0.85 },
  'p-39': { kb: 1.037 },
  'p-43': { kc: 1.1 },
  'p-47d': { kb: 1.033 },
  'p-47d-razorback': { kw: 0.92 },
  'p-47n': { ks: 1.05, kc: 0.9, kb: 1.042, kw: 0.92 },
  'p-51b': { kb: 1.124 },
  'p-51d-mustang': { ks: 1.05, kb: 1.085, kw: 1.08 },
  'p-59a': { kw: 0.92, kc: 1.1, dx: 0.4, kb: 1.138 },
  'p-61': { ks: 0.95, kc: 0.9, dx: -0.4, kt: 0.85, kw: 0.92 },
  'p-63': { kc: 1.1, dx: 0.4 },
  pbm: { kb: 1.041 },
  'pby-catalina': { ks: 1.05, kc: 1.1, dx: -0.4 },
  'pe-2': { kc: 0.9, kw: 1.08 },
  'pe-8': { dx: 0.4 },
  'potez-63': { kw: 0.92, kc: 1.1, dx: 0.4 },
  rafale: { ks: 0.95 },
  're-2000': { kc: 1.1, kb: 1.047 },
  're-2001': { kc: 1.1 },
  're-2005': { kc: 1.1, kw: 0.92 },
  'recon-micro-uav': { kc: 1.2, kt: 0.85 },
  's-199': { kc: 1.1, kt: 1.15, kw: 0.92 },
  'saab-105': { dx: -0.4, kt: 0.85 },
  'saab-b18a': { kc: 1.1, dx: 0.8, kt: 1.15 },
  'saab-j21a': { ks: 0.95, kc: 1.1, dx: 0.4, kw: 0.92 },
  'saab-t18b': { ks: 1.05, kc: 1.1, dx: 0.8, kt: 1.15, kb: 1.131, kw: 0.92 },
  'sb-2': { ks: 0.9, kc: 1.1, dx: 0.4 },
  'sb2c-helldiver': { kw: 1.08, kc: 1.1, kb: 1.139 },
  sb2u: { kc: 1.1, dx: 0.4 },
  'sm-79': { dx: -0.4 },
  'sm-91': { kc: 1.1 },
  'spitfire-mk-ix': { kt: 0.85 },
  'spitfire-mk-v': { kb: 1.052 },
  'spitfire-mk-xiv': { kb: 1.135 },
  stirling: { dx: -0.4, kb: 0.974 },
  'su-17m4': { ks: 0.95, dx: -0.8, kw: 1.08 },
  'su-2': { ks: 0.95 },
  'su-24m': { dx: -0.8, kb: 0.944, kw: 0.92 },
  'su-30': { ks: 0.95, kc: 0.9 },
  'su-30mki': { ks: 0.95, dx: -0.4, kb: 0.931 },
  'su-33': { ks: 0.95, dx: -0.4, kb: 0.891 },
  'su-34': { kw: 1.08, ks: 0.95, dx: -0.4 },
  'su-6-2': { dx: 0.4 },
  'su-7b': { dx: -0.4, kb: 0.961, kw: 1.08 },
  'su-9-1946': { kc: 0.9, dx: 0.4, kb: 1.081 },
  'ta-154': { kc: 1.1 },
  'tbd-1': { kc: 1.2, dx: 0.4, kb: 1.098 },
  'tempest-v': { kb: 1.031, kw: 0.92 },
  'tis-ma': { kw: 0.92, ks: 1.05, kc: 1.1, dx: -0.4 },
  'tu-2': { kb: 0.957, kw: 0.92 },
  'tu-95m': { dx: 0.8 },
  'vb-10': { dx: -0.4, kw: 1.08 },
  vengeance: { kc: 1.1 },
  'vg-33': { dx: -0.4 },
  wellington: { dx: -0.4 },
  whirlwind: { ks: 1.05, kc: 1.1, dx: 0.4, kt: 1.15 },
  'xp-55': { ks: 0.95 },
  'yak-15': { dx: -0.4, kb: 1.073 },
  'yak-3': { kc: 1.1 },
  'yak-4': { kc: 1.2, dx: 0.4, kb: 1.1 },
  'yak-7b': { kw: 1.08 },
  'z-1007': { dx: 0.4, kt: 0.85 },
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
