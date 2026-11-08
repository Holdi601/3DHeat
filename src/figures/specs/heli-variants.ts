/**
 * Helicopter variants drawn from their own outlines: each variant whose
 * silhouette differs (cockpit, mast sight or radar, cannon, engines and
 * filters, tail rotor side, stubs and launchers, tailplane) as a figure of its
 * own, so that an AH-64A is told from a Longbow, a Mi-24A from a Mi-24P and a
 * Mi-8T from a Mi-17.
 *
 * Fuselage length, rotor diameter and height are published values; outlines,
 * which side the tail rotor turns on where sources disagree, and the sizes of
 * sights, pods and launchers are judged from the general shape of the real
 * helicopter (estimates, marked "est" where a single value is a guess; not
 * traced from any drawing or game model). Coordinates: forward from the
 * fuselage's middle, out from the centre line, up from the cabin's axis;
 * metres.
 */

import type { Named, SpecSet } from './index';
import type { HeliSpec } from '../air';
import type { Outline, P2 } from '../parts';
import type { Vec3 } from '../../race/geometry';
import { APACHE, COBRA, HAVOC, HIND, HOKUM, plateCanopy, TIGER } from './helis';

const H: Named<HeliSpec> = {};
type HS = HeliSpec & { cls: string };

/** A rounded body from x1 (front) back to x0, half width w and half height h round height `up`; mirrored when `side` is set. */
function pod(x1: number, x0: number, up: number, w: number, h: number, side = 0, round = 2.4, t = Math.min(w, (x1 - x0) * 0.25)): Outline {
  return { top: [[x1, up], [x1 - t, up + h], [x0 + t, up + h], [x0, up]], bottom: [[x1, up], [x1 - t, up - h], [x0 + t, up - h], [x0, up]], plan: [[x1, w * 0.2], [x1 - t, w], [x0 + t, w], [x0, w * 0.2]], side, round, stations: 8 };
}

/** A base outline stretched along its length (a longer or shorter variant of the same body). */
function stretch(o: Outline, k: number): Outline {
  const m = (p: P2[]) => p.map(([x, v]) => [x * k, v] as P2);
  return { ...o, top: m(o.top), bottom: m(o.bottom), plan: m(o.plan) };
}

/** Tubes for missiles or rockets, `n` side by side and `rows` high, starting `side` out: launchers on stub pylons and outriggers. */
function launchers(x1: number, len: number, side: number, up: number, d: number, n: number, rows = 1): Outline[] {
  const out: Outline[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) out.push(pod(x1, x1 - len, up - j * d * 1.1, d / 2, d / 2, side + i * d * 1.1, 2, d * 0.3));
  return out;
}

/**
 * An open lattice boom from x0 back to x1 in `bays` bays: two upper longerons (the top line's heights `top` and half
 * widths `half` at both ends) and one under the centre line (`bottom`), each side face braced zigzag, as thin tubes.
 */
function lattice(x0: number, x1: number, bays: number, top: P2, bottom: P2, half: P2, r: number, rb: number): [Vec3, Vec3, number][] {
  const at = (f: number): [number, number, number, number] => [x0 + (x1 - x0) * f, top[0] + (top[1] - top[0]) * f, bottom[0] + (bottom[1] - bottom[0]) * f, half[0] + (half[1] - half[0]) * f];
  const out: [Vec3, Vec3, number][] = [];
  const [ax, at0, ab0, aw0] = at(0);
  const [bx, at1, ab1, aw1] = at(1);
  for (const s of [-1, 1]) out.push([[ax, s * aw0, at0], [bx, s * aw1, at1], r]);
  out.push([[ax, 0, ab0], [bx, 0, ab1], r]);
  for (let i = 0; i < bays; i++) {
    const [p, pt, pb, pw] = at(i / bays);
    const [q, qt, qb, qw] = at((i + 1) / bays);
    // Each side face: a zigzag from the upper longeron down to the lower and back.
    for (const s of [-1, 1]) out.push(i % 2 ? [[p, 0, pb], [q, s * qw, qt], rb] : [[p, s * pw, pt], [q, 0, qb], rb]);
    // The top face: a cross brace between the upper longerons.
    out.push([[p, -pw, pt], [q, qw, qt], rb]);
  }
  return out;
}

/** A tube along a line of (forward, up) points on the centre line. */
function loop(p: P2[], r: number): [Vec3, Vec3, number][] {
  return p.slice(1).map((q, i) => [[p[i][0], 0, p[i][1]], [q[0], 0, q[1]], r]);
}

/** A variant's whole layout stretched along its length: every forward position scales by `k`, heights stay. */
function scaled(o: HeliSpec, k: number): HeliSpec {
  const xs = (p?: P2[]) => p?.map(([x, v]) => [x * k, v] as P2);
  return {
    ...o,
    fuselage: o.fuselage && stretch(o.fuselage, k),
    bodies: o.bodies?.map((b) => stretch(b, k)),
    oneSide: o.oneSide?.map((b) => stretch(b, k)),
    glassOutlines: o.glassOutlines?.map((b) => stretch(b, k)),
    glass: o.glass?.map(([x, u, l, w, h]) => [x * k, u, l * k, w, h] as [number, number, number, number, number]),
    finPlan: xs(o.finPlan),
    tailPlan: xs(o.tailPlan),
    rotorX: o.rotorX === undefined ? undefined : o.rotorX * k,
    rotor2: o.rotor2 && [o.rotor2[0] * k, o.rotor2[1]],
    tailRotorAt: o.tailRotorAt && [o.tailRotorAt[0] * k, o.tailRotorAt[1]],
    stubAt: o.stubAt && [o.stubAt[0] * k, o.stubAt[1], o.stubAt[2]],
    skidAt: o.skidAt && [o.skidAt[0] * k, o.skidAt[1] * k, o.skidAt[2], o.skidAt[3]],
    wheelAt: o.wheelAt?.map(([x, s, u, r]) => [x * k, s, u, r] as [number, number, number, number]),
    guns: o.guns?.map(([x, s, u, l, r]) => [x * k, s, u, l, r] as [number, number, number, number, number]),
    pusher: o.pusher && [o.pusher[0] * k, o.pusher[1], o.pusher[2], o.pusher[3]],
  };
}

// ---------------------------------------------------------------- AH-64 Apache

// A: the small avionics bays on the cheeks, no mast radar. D: the bays grown forward almost to the nose (EFAB),
// deeper and wider, and the Longbow radar's flat dome over the rotor (4.95 m high with it). E: the D with composite
// blades with swept tips. All: the TADS drum hanging at the nose tip with the PNVS turret on top of it, the
// "Black Hole" exhaust boxes turned outward behind the nacelles, the M230 under the front cockpit, the tail rotor on
// the left high on the fin, the stabilator at its foot, the main wheels on long legs, a tail wheel under the fin.
// Positions from TM 1-1520-238-10 fig. 2-3 (see APACHE): the TADS drum 1.7 m up at the nose tip, the gun's turret
// under the front cockpit 2.5-3.2 m behind the nose, the main wheels 3.8 m back on a 2.03 m tread, the tail wheel
// 14.3 m back, the stabilator 1.2 m up at the fin's foot (3.4 m span).
const TADS = [pod(7.5, 6.85, -0.08, 0.3, 0.3, 0, 3), pod(7.35, 6.85, 0.3, 0.17, 0.17)];
const BLACK_HOLE = pod(0.0, -0.9, 0.5, 0.22, 0.28, 1.15, 4);
const APACHE_A: HeliSpec = {
  ...APACHE,
  bodies: [...APACHE.bodies!, BLACK_HOLE],
  oneSide: [...TADS, pod(5.0, 4.3, -0.9, 0.28, 0.24)],
  guns: [[4.6, 0, -0.95, 1.7, 0.06]],
  // The scissor tail rotor: two pairs of blades about 55 degrees apart.
  tailRotorSide: -1, tailRotorAt: [-6.5, 1.2], tailRotorDiameter: 2.79, tailScissor: 55,
  tailPlan: [[-5.85, 0.15], [-5.95, 1.7], [-7.0, 1.7], [-7.0, 0.15]], tailUp: -0.58,
  wheels: false, wheelAt: [[3.69, 1.015, -1.47, 0.31], [-6.83, 0, -1.62, 0.16]],
};
// The Longbow radar's dome 4.95 m over the ground (published) on its mast over the hub.
const APACHE_D: HeliSpec = {
  ...APACHE_A,
  bodies: [{ top: [[6.6, -0.25], [5.95, 0.07], [1.9, 0.07], [1.1, -0.25]], bottom: [[6.6, -0.5], [5.95, -0.9], [1.9, -0.9], [1.1, -0.6]], plan: [[6.6, 0.14], [5.95, 0.38], [1.9, 0.4], [1.1, 0.14]], side: 0.72, round: 6, stations: 8 }, APACHE.bodies![1], BLACK_HOLE],
  mastDome: true, mastDomeSize: [0.62, 0.3, 1.07],
};
H['ah-64a'] = { cls: 'heli-attack', ...APACHE_A };
H['ah-64d-apache'] = { cls: 'heli-attack', ...APACHE_D };
// AH-64D without the Longbow radar (most D models of other air arms fly without it).
H['ah-64d-no-radar'] = { cls: 'heli-attack', ...APACHE_D, mastDome: false };
H['ah-64e'] = { cls: 'heli-attack', ...APACHE_D, sweptTips: true, tipChord: 0.85 };

// ---------------------------------------------------------------- AH-1 Cobra

// G: one engine under a narrow cowl with a plain exhaust pipe, the rounded canopy, the chin turret with a minigun
// and grenade launcher, rocket pods on the stubs, two blades on a tall mast (fuselage 13.54 m, rotor 13.41 m,
// 4.12 m). S/F: the flat-plate canopy, the TOW sight at the nose tip, two-by-two TOW tubes outboard of a rocket pod,
// the M197 turret and the upturned "toilet bowl" exhaust (13.59 m). W: two engines in broad nacelles bulging out
// beside the gearbox with their exhausts pointing back, the TOW and Hellfire racks, a 14.63 m rotor (13.87 m).
// Z: still broader nacelles, four blades (14.88 m), longer stubs with Sidewinder rails at the tips, the big TSS
// sensor ball at the nose (13.9 m body). The tail rotor on the right of the fin, on the Z on the left.
const ONE_ENGINE: Outline = { top: [[3.15, 1.0], [2.8, 1.45], [2.2, 1.6], [-0.1, 1.6], [-0.4, 1.3]], bottom: [[3.15, 0.95], [-0.4, 0.9]], plan: [[3.15, 0.25], [2.8, 0.38], [-0.1, 0.38], [-0.4, 0.3]], round: 3, stations: 8 };
const GEARBOX: Outline = { ...ONE_ENGINE, plan: [[3.15, 0.18], [2.8, 0.28], [-0.1, 0.28], [-0.4, 0.2]] };
const cobraNacelle = (side: number, w: number, top: number, back: number): Outline => ({ top: [[2.2, 0.75], [1.9, top], [back + 0.45, top], [back, top - 0.2]], bottom: [[2.2, 0.45], [1.9, 0.15], [back + 0.45, 0.15], [back, 0.45]], plan: [[2.2, w * 0.5], [1.9, w], [back + 0.45, w], [back, w * 0.7]], side, round: 3, stations: 8 });
const COBRA_TAIL: Partial<HeliSpec> = { tailPlan: [[-2.9, 0.2], [-3.0, 1.1], [-3.6, 1.1], [-3.6, 0.2]], tailUp: 0.4 };
const M197 = [pod(5.85, 5.15, -0.86, 0.3, 0.28)];
const TOW_SIGHT = pod(7.2, 6.5, -0.15, 0.3, 0.28);
const COBRA_G: HeliSpec = {
  ...COBRA, ...COBRA_TAIL, rotor: 13.41, height: 4.12, blades: 2,
  glass: [[5.25, 0.62, 0.75, 0.43, 0.43], [3.9, 0.8, 0.66, 0.43, 0.43]],
  bodies: [ONE_ENGINE, pod(-0.3, -1.0, 1.25, 0.2, 0.2), pod(3.2, 1.8, -0.35, 0.22, 0.22, 0.95), pod(3.2, 1.8, -0.35, 0.22, 0.22, 1.42)],
  oneSide: [pod(6.15, 5.5, -0.84, 0.32, 0.28)],
  guns: [[6.0, 0.1, -0.88, 0.9, 0.04], [6.0, -0.1, -0.88, 0.5, 0.06]],
  mastTop: 2.5, tailRotorDiameter: 2.59, tailBlades: 2, bladeChord: 0.69, stubs: { span: 3.15, pylons: 2 },
};
H['ah-1g-cobra'] = { cls: 'heli-attack', ...scaled(COBRA_G, 13.54 / 13.9), length: 13.54 };
const COBRA_S: HeliSpec = {
  ...COBRA_G,
  // The flat-plate canopy.
  glass: undefined, glassOutlines: [plateCanopy(5.98, 4.5, 0.96, 0.27, 0.4, 0.45), plateCanopy(4.55, 3.25, 1.13, 0.88, 0.42, 0.25)],
  bodies: [ONE_ENGINE, pod(-0.2, -1.0, 1.25, 0.34, 0.38, 0, 2.2), ...launchers(3.2, 1.9, 1.3, -0.15, 0.2, 2, 2), pod(3.2, 1.8, -0.35, 0.24, 0.24, 0.85)],
  oneSide: [TOW_SIGHT, ...M197],
  guns: [[5.5, 0, -0.92, 1.6, 0.05]],
};
H['ah-1s-cobra'] = { cls: 'heli-attack', ...scaled(COBRA_S, 13.59 / 13.9), length: 13.59 };
const COBRA_W: HeliSpec = {
  ...COBRA_S, rotor: 14.63, height: 4.11, bladeChord: 0.84, glassOutlines: undefined,
  glass: [[5.25, 0.6, 0.75, 0.44, 0.42], [3.9, 0.78, 0.66, 0.44, 0.42]],
  bodies: [GEARBOX, cobraNacelle(0.5, 0.3, 1.36, -1.45), pod(-1.3, -1.85, 0.8, 0.18, 0.18, 0.55), ...launchers(3.2, 1.7, 1.25, -0.25, 0.18, 2, 2), pod(3.2, 1.8, -0.35, 0.24, 0.24, 0.85)],
  tailRotorDiameter: 2.97, stubs: { span: 3.28, pylons: 2 },
};
H['ah-1w-cobra'] = { cls: 'heli-attack', ...scaled(COBRA_W, 13.87 / 13.9), length: 13.87 };
H['ah-1z-viper'] = {
  cls: 'heli-attack', ...COBRA_W, rotor: 14.88, height: 4.37, blades: 4,
  glass: [[5.1, 0.6, 0.95, 0.44, 0.42], [3.75, 0.78, 0.6, 0.44, 0.42]],
  bodies: [GEARBOX, cobraNacelle(0.62, 0.34, 1.3, -1.35), pod(-1.2, -1.9, 0.75, 0.2, 0.2, 0.66), ...launchers(2.9, 1.6, 1.3, -0.35, 0.18, 2, 2), pod(2.9, 1.5, -0.35, 0.24, 0.24, 1.9), pod(3.0, 0.8, -0.2, 0.08, 0.08, 2.2, 2)],
  oneSide: [pod(7.4, 6.55, -0.25, 0.42, 0.42, 0, 2), ...M197],
  // The four-bladed tail rotor on the left of the fin (as the public three-views show), shared with the UH-1Y.
  tailRotorSide: -1, tailRotorDiameter: 2.9, tailBlades: 4, bladeChord: 0.66, stubs: { span: 4.4, pylons: 3 }, stubAt: [2.2, 0.05, 0], mastTop: 2.4,
};

// ---------------------------------------------------------------- Mi-24 Hind

// A: one large framed "greenhouse" cockpit for both crew, its front blunt and its top level with the roof, a single
// machine gun in the nose, the tail rotor on the right, Falanga rails at the wingtips. D: the stepped twin bubbles,
// the gunner low in a narrow nose with the four-barrel USPU-24 under the chin and the Raduga-F pod on the left, the
// tail rotor moved to the left. V: the D with twin Shturm tubes at the tips and the bigger Raduga-Sh sight under the
// left of the nose. P: no chin turret - the twin 30 mm cannon in a long fairing on the right of the nose. Mi-35M:
// short wings without tip pylons, the twin 23 mm turret, a FLIR ball under the nose, the boxed exhaust suppressors
// (fuselage 17.5 m, rotor 17.3 m).
const HIND_BASE: HeliSpec = {
  ...HIND,
  wheels: false, wheelAt: [[7.3, 0.3, -1.6, 0.3], [-0.4, 1.35, -1.55, 0.42]],
  tailRotorSide: -1, tailRotorAt: [-9.15, 2.7], tailRotorDiameter: 3.91, tailBlades: 3,
  tailPlan: [[-6.8, 0.2], [-6.9, 1.7], [-7.6, 1.7], [-7.6, 0.2]], tailUp: 1.05,
};
const ENGINES_24 = HIND.bodies!;
// The Mi-35M's and late Hinds' exhaust suppressors: boxes along the nacelles' outsides, bent down at the back.
const EVU = pod(0.2, -2.0, 1.5, 0.28, 0.42, 1.05, 4);
// The wingtip launchers: a Falanga rail, or two Shturm tubes.
const FALANGA = pod(0.9, -0.9, 0.0, 0.09, 0.12, 3.25, 2);
const SHTURM = launchers(0.9, 1.8, 3.05, -0.05, 0.16, 2);
const USPU = [pod(8.55, 7.75, -0.82, 0.32, 0.3)];
H['mi-24a-hind'] = {
  cls: 'heli-attack', ...HIND_BASE,
  fuselage: { ...HIND.fuselage!, top: [[8.75, -0.1], [8.6, 0.45], [8.25, 0.78], [7.6, 0.95], [5.6, 1.05], [4.4, 1.2], [0.0, 1.25], [-1.0, 1.32], [-2.3, 1.55], [-5.0, 1.45], [-8.3, 1.3], [-8.75, 1.25]], bottom: [[8.75, -0.3], [8.5, -0.8], [7.8, -1.05], [0.0, -1.15], [-1.0, -1.0], [-2.3, -0.1], [-5.0, 0.4], [-8.3, 0.85], [-8.75, 0.9]], plan: [[8.75, 0.45], [8.3, 0.75], [7.0, 0.88], [5.0, 0.95], [0.0, 1.0], [-1.2, 0.95], [-2.3, 0.62], [-5.0, 0.42], [-8.3, 0.22], [-8.75, 0.2]] },
  glass: [[7.25, 0.42, 1.55, 0.86, 0.62]],
  bodies: [...ENGINES_24, FALANGA],
  guns: [[8.7, 0, -0.45, 0.8, 0.04]],
  tailRotorSide: 1,
};
H['mi-24d-hind'] = { cls: 'heli-attack', ...HIND_BASE, bodies: [...ENGINES_24, FALANGA], oneSide: [...USPU, pod(7.6, 6.7, -0.75, 0.16, 0.16, -0.55)], guns: [[8.2, 0, -0.86, 0.9, 0.07]] };
H['mi-24v-hind'] = { cls: 'heli-attack', ...HIND_BASE, bodies: [...ENGINES_24, ...SHTURM], oneSide: [...USPU, pod(7.9, 6.9, -0.85, 0.24, 0.24, -0.5)], guns: [[8.2, 0, -0.86, 0.9, 0.07]] };
H['mi-24p-hind'] = {
  cls: 'heli-attack', ...HIND_BASE, bodies: [...ENGINES_24, ...SHTURM],
  oneSide: [pod(7.9, 4.6, -0.5, 0.22, 0.28, 0.72), pod(7.9, 6.9, -0.85, 0.24, 0.24, -0.5)],
  guns: [[7.7, 0.72, -0.42, 1.1, 0.05], [7.7, 0.76, -0.6, 1.1, 0.05]],
};
H['mi-35m-hind'] = {
  cls: 'heli-attack', ...HIND_BASE, bodies: [...ENGINES_24, EVU, ...launchers(0.8, 1.8, 1.75, 0.05, 0.16, 2, 2)],
  oneSide: [pod(8.6, 7.9, -0.84, 0.3, 0.28), pod(7.9, 7.2, -0.95, 0.24, 0.24, -0.4)],
  guns: [[8.3, 0.08, -0.88, 1.0, 0.05], [8.3, -0.08, -0.88, 1.0, 0.05]],
  // est: wings 4.6 m across with two pylons each.
  stubs: { span: 4.6, pylons: 2 }, stubAt: [-0.1, 0.55, 10], stubPlan: [[1.05, 0.8], [-0.25, 0.8], [-0.16, 2.3], [0.81, 2.3]], wheelAt: [[7.3, 0.32, -1.6, 0.3], [-0.4, 1.4, -1.55, 0.42]], sweptTips: true,
};

// ---------------------------------------------------------------- Mi-8 / Mi-17

// Mi-8T: the cowl over both engines with plain open intakes in its front face, small exhausts on its sides, the
// tail rotor on the right (fuselage 18.17 m, rotor 21.29 m, 5.65 m). Mi-8MT / Mi-17: the TV3-117 engines with the
// domed dust filters standing ahead of the intakes, bigger exhausts further forward on the cowl's sides, the tail
// rotor on the left. Armed versions carry outriggers with three pylons a side over the fuel tanks. All: the rotor
// 5.8 m behind the glazed nose, a cabin 2.3 m deep and 2.5 m wide with the fuel tanks low on its sides, clamshell
// doors under a boom that leaves the cowl's level and tapers to the fin, the main wheels out on struts (stations
// and depths judged from public three-views, estimates).
const HIP: HS = {
  cls: 'heli-transport', length: 18.17, rotor: 21.29, height: 5.65, bodyWidth: 2.5, bodyHeight: 2.3, cabin: 'cabin', blades: 5,
  fuselage: {
    top: [[9.08, -0.4], [8.9, 0.1], [8.5, 0.45], [7.8, 0.66], [7.3, 0.95], [6.8, 1.08], [-0.6, 1.08], [-1.1, 1.2], [-1.6, 1.38], [-4.0, 1.25], [-8.6, 0.95], [-9.08, 0.95]],
    bottom: [[9.08, -0.5], [8.8, -0.85], [8.2, -1.05], [7.4, -1.15], [0.0, -1.15], [-0.8, -1.0], [-1.4, 0.1], [-2.0, 0.5], [-8.6, 0.7], [-9.08, 0.75]],
    plan: [[9.08, 0.35], [8.6, 0.85], [7.8, 1.1], [6.8, 1.22], [0.0, 1.22], [-0.8, 1.1], [-1.4, 0.6], [-2.0, 0.45], [-8.6, 0.18], [-9.08, 0.16]],
    round: [[9, 2.6], [7, 3.4], [-0.8, 3.6], [-1.4, 3], [-9, 2.4]], stations: 30,
  },
  // The cowl over both engines and the gearbox, the fuel tanks low on both sides.
  bodies: [
    { top: [[6.8, 1.05], [6.6, 1.5], [5.0, 1.6], [4.7, 1.95], [2.0, 2.05], [1.2, 1.85], [-1.4, 1.4]], bottom: [[6.8, 1.0], [-1.4, 1.0]], plan: [[6.8, 0.6], [6.5, 0.72], [2.0, 0.75], [-0.2, 0.6], [-1.4, 0.4]], round: 3, stations: 12 },
    pod(5.2, 1.6, -0.82, 0.36, 0.33, 1.28, 2.4),
  ],
  glass: [[8.15, 0.3, 0.85, 1.08, 0.55]],
  // The tail pylon and rotor: 5.65 m to the top of the tail rotor's disc (published overall height).
  finPlan: [[-8.0, -0.1], [-9.08, -0.1], [-9.55, 1.4], [-9.0, 1.45]],
  tailRotorAt: [-9.25, 1.73], tailRotorDiameter: 3.91, tailBlades: 3,
  tailPlan: [[-7.2, 0.15], [-7.3, 1.35], [-7.9, 1.35], [-7.9, 0.15]], tailUp: 0.7,
  rotorX: 3.3, mastTop: 2.65, wheelAt: [[6.6, 0.3, -1.55, 0.3], [2.15, 2.15, -1.55, 0.43]],
};
const MI8T: HS = { ...HIP, bodies: [...HIP.bodies!, pod(3.0, 2.3, 1.55, 0.2, 0.2, 0.78)] };
const MI17: HS = { ...HIP, bodies: [...HIP.bodies!, pod(7.35, 6.5, 1.5, 0.42, 0.42, 0.42, 2.2), pod(4.6, 3.4, 1.5, 0.3, 0.3, 0.85)], tailRotorSide: -1 };
const HIP_STUBS: Partial<HeliSpec> = { stubs: { span: 5.6, pylons: 3 }, stubAt: [3.6, -0.15, 0] };
H['mi-8t'] = { ...MI8T, cls: 'heli-transport' };
H['mi-8-salon'] = { ...MI8T, cls: 'heli-transport' };
H['mi-8tv'] = { ...MI8T, cls: 'heli-transport', ...HIP_STUBS };
H['mi-8mtv2'] = { ...MI17, cls: 'heli-transport', ...HIP_STUBS };
H['mi-17'] = { ...MI17, cls: 'heli-transport' };
// Mi-8AMTSh: the Mi-17 with outriggers, an armoured cockpit and a radar thimble in the nose.
H['mi-8amtsh'] = { ...MI17, cls: 'heli-transport', ...HIP_STUBS, oneSide: [pod(9.45, 8.7, -0.4, 0.38, 0.38)] };

// ---------------------------------------------------------------- UH-1 Huey

// UH-1H: a short boxy cabin under a big slanted windscreen with chin windows, the rotor only 3.7 m behind the nose
// over the narrow engine cowl, a 6.4 m boom tapering to the small swept fin with the tail rotor on its left, the
// synchronised elevator half way along the boom, skids (fuselage 12.77 m, rotor 14.63 m, 4.39 m). Stations from
// the public dimensioned drawing: the roof 2.48 m and the belly 0.54 m over the ground, the hub at 3.86 m, the
// tail rotor's hub at 3.11 m; the cabin 2.5 m wide. UH-1B: the cabin 0.7 m shorter and a 13.41 m rotor (fuselage
// 12.08 m), often with side-mounted guns and rockets. UH-1N: the H with the twin-pac's broad, taller cowl and its
// two exhausts side by side. UH-1Y: four blades (14.88 m), the cabin 0.53 m longer ahead of the mast, a bigger cowl
// with exhausts turned up, a FLIR ball under the nose (fuselage est 13.4 m).
/** A Huey's body, its stations given back from the nose: the roof's end and the cowl's front and back. */
function huey(L: number, roofEnd: number, cowlFront: number, cowlBack: number, cowlW: number, cowlTop = 1.17): Outline[] {
  const h = L / 2;
  const x = (d: number) => h - d;
  return [
    {
      top: [[x(0), -0.2], [x(0.2), 0.2], [x(0.5), 0.3], [x(1.22), 0.92], [x(1.5), 0.97], [x(roofEnd), 0.97], [x(roofEnd + 0.6), 0.42], [x(roofEnd + 1.2), 0.38], [-h + 0.5, 0.26], [-h, 0.24]],
      bottom: [[x(0), -0.3], [x(0.3), -0.61], [x(0.7), -0.92], [x(1.2), -0.97], [x(roofEnd - 0.8), -0.97], [x(roofEnd + 0.6), -0.38], [x(roofEnd + 1.2), -0.3], [-h + 0.5, 0.0], [-h, 0.05]],
      plan: [[x(0), 0.35], [x(0.3), 0.85], [x(0.8), 1.15], [x(1.4), 1.25], [x(roofEnd - 0.4), 1.25], [x(roofEnd + 0.6), 0.55], [x(roofEnd + 1.2), 0.32], [-h, 0.14]],
      round: [[x(0), 3], [x(1.4), 4.5], [x(roofEnd), 4.5], [x(roofEnd + 1.2), 2.8], [-h, 2.4]], stations: 26,
    },
    { top: [[x(cowlFront), 0.97], [x(cowlFront + 0.35), cowlTop], [x(cowlBack - 0.4), cowlTop], [x(cowlBack), 0.85]], bottom: [[x(cowlFront), 0.92], [x(cowlBack), 0.6]], plan: [[x(cowlFront), cowlW * 0.6], [x(cowlFront + 0.35), cowlW], [x(cowlBack - 0.4), cowlW], [x(cowlBack), cowlW * 0.6]], round: 3.4, stations: 8 },
  ];
}
const HUEY: HS = {
  cls: 'heli-transport', length: 12.77, rotor: 14.63, height: 4.39, bodyWidth: 2.5, bodyHeight: 1.94, cabin: 'cabin', blades: 2,
  fuselage: huey(12.77, 5.6, 2.85, 6.1, 0.48)[0], bodies: [huey(12.77, 5.6, 2.85, 6.1, 0.48)[1], pod(0.45, -0.1, 0.95, 0.2, 0.2)],
  glass: [[5.55, 0.25, 0.8, 1.17, 0.7]],
  finPlan: [[-5.1, 0], [-6.385, 0], [-6.3, 1.45], [-5.85, 1.5]],
  tailRotorSide: -1, tailRotorAt: [-5.9, 1.6], tailRotorDiameter: 2.59, tailBlades: 2,
  tailPlan: [[-2.75, 0.2], [-2.85, 1.42], [-3.45, 1.42], [-3.45, 0.2]], tailUp: 0.15,
  rotorX: 2.7, mastTop: 2.35, skidAt: [5.3, 1.6, 1.3, -1.36],
};
H['uh-1h-huey'] = { ...HUEY };
const B_BODY = huey(12.08, 4.9, 2.85, 5.4, 0.45);
H['uh-1b-huey'] = {
  ...HUEY, length: 12.08, rotor: 13.41, fuselage: B_BODY[0], bodies: [B_BODY[1], pod(1.0, 0.4, 0.95, 0.18, 0.18), ...launchers(3.4, 1.4, 1.45, -0.55, 0.3, 1), pod(3.9, 2.4, -0.15, 0.06, 0.06, 1.35, 2)],
  finPlan: [[-4.8, 0], [-6.04, 0], [-5.95, 1.45], [-5.5, 1.5]], tailRotorAt: [-5.55, 1.55], rotorX: 2.37,
  tailPlan: [[-2.4, 0.2], [-2.5, 1.42], [-3.1, 1.42], [-3.1, 0.2]], skidAt: [5.0, 1.3, 1.3, -1.36],
};
H['uh-1n-twin-huey'] = { ...HUEY, bodies: [huey(12.77, 5.6, 2.85, 6.2, 0.62, 1.3)[1], pod(0.35, -0.35, 1.0, 0.2, 0.2, 0.32)] };
const Y_BODY = huey(13.4, 6.13, 2.9, 6.6, 0.6, 1.3);
H['uh-1y-venom'] = {
  ...HUEY, length: 13.4, rotor: 14.88, height: 4.5, blades: 4, fuselage: Y_BODY[0], bodies: [Y_BODY[1], pod(0.4, -0.3, 1.2, 0.2, 0.24, 0.35)],
  oneSide: [pod(6.75, 6.15, -0.75, 0.3, 0.3)],
  // The tail rotor on the left, as on the AH-1Z it shares it with.
  finPlan: [[-5.4, 0], [-6.7, 0], [-6.6, 1.45], [-6.15, 1.5]], tailRotorAt: [-6.2, 1.6], tailRotorDiameter: 2.9, tailBlades: 4, rotorX: 3.0,
  tailPlan: [[-2.95, 0.2], [-3.05, 1.42], [-3.65, 1.42], [-3.65, 0.2]], skidAt: [5.6, 1.6, 1.3, -1.36],
};

// ---------------------------------------------------------------- UH-60 Black Hawk family

// UH-60A/L: the rotor 4.9 m behind the nose over a short, flat-topped gearbox fairing, the two engine nacelles
// standing off its shoulders with their exhausts turned out, a cabin 2.25 m deep and 2.36 m wide, then a long tail
// cone tapering from the cabin's full depth to the tall swept tail pylon with the canted tail rotor on its right
// and the big stabilator low at its foot, the main wheels under the cockpit and a tail wheel far back (fuselage
// 15.26 m, rotor 16.36 m, 5.13 m; stations and depths judged from public three-views, estimates). HH-60: the long
// refuelling probe on the right of the nose and a FLIR ball under it. SH-60B / MH-60R Seahawk: the twin tail wheel
// moved forward under the cabin's end, short weapon pylons; the B with the flat radome under the cockpit, the R
// with its radome under the cabin and a FLIR ball under the chin.
const HAWK: HS = {
  cls: 'heli-transport', length: 15.26, rotor: 16.36, height: 5.13, bodyWidth: 2.36, bodyHeight: 2.25, cabin: 'cabin', blades: 4,
  fuselage: {
    top: [[7.63, -0.35], [7.4, 0.05], [7.0, 0.4], [6.2, 0.85], [5.2, 1.08], [4.6, 1.19], [-1.1, 1.19], [-1.8, 0.95], [-4.58, 0.47], [-6.0, 0.25], [-7.63, 0.1]],
    bottom: [[7.63, -0.45], [7.3, -0.8], [6.6, -0.98], [5.8, -1.05], [-1.1, -1.05], [-4.58, -0.7], [-7.63, -0.35]],
    plan: [[7.63, 0.2], [7.3, 0.6], [6.6, 0.9], [5.6, 1.1], [4.6, 1.18], [-1.1, 1.15], [-2.0, 0.85], [-4.58, 0.45], [-7.63, 0.25]],
    round: [[7.6, 2.6], [5, 3.6], [-1.1, 3.6], [-4.6, 3], [-7.6, 2.5]], stations: 28,
  },
  bodies: [
    { top: [[4.0, 1.19], [3.6, 1.6], [0.6, 1.65], [-0.6, 1.3], [-1.2, 1.19]], bottom: [[4.0, 1.15], [-1.2, 1.15]], plan: [[4.0, 0.45], [3.6, 0.6], [0.6, 0.6], [-1.2, 0.35]], round: 3, stations: 8 },
    { top: [[3.7, 1.25], [3.4, 1.57], [0.2, 1.55], [-0.4, 1.35]], bottom: [[3.7, 0.95], [3.4, 0.85], [0.2, 0.85], [-0.4, 1.0]], plan: [[3.7, 0.2], [3.4, 0.3], [0.2, 0.3], [-0.4, 0.2]], side: 0.85, round: 2.6, stations: 8 },
    pod(-0.1, -0.8, 1.2, 0.2, 0.2, 1.1),
  ],
  glass: [[6.15, 0.4, 0.95, 1.1, 0.6]],
  finPlan: [[-6.0, 0.05], [-8.3, 3.0], [-8.85, 3.0], [-7.7, -0.45]],
  tailRotorAt: [-8.4, 2.0], tailRotorDiameter: 3.35,
  tailPlan: [[-6.7, 0.15], [-6.85, 2.19], [-7.9, 2.19], [-7.9, 0.15]], tailUp: 0.05,
  rotorX: 2.75, mastTop: 2.15, wheelAt: [[3.85, 1.35, -1.28, 0.3], [-5.75, 0, -1.34, 0.2]],
};
H['uh-60a-black-hawk'] = { ...HAWK };
// The ESSS stub wings with their pods.
H['mh-60l-dap'] = { ...HAWK, cls: 'heli-attack', stubs: { span: 6.4, pylons: 2 }, stubAt: [2.4, 0.9, 10] };
H['hh-60g-pave-hawk'] = { ...HAWK, oneSide: [pod(11.4, 5.4, 0.45, 0.1, 0.1, 0.95, 2), pod(7.45, 6.85, -0.72, 0.26, 0.26)] };
const SEAHAWK: HS = {
  ...HAWK, cls: 'heli-transport', wheelAt: [[3.85, 1.35, -1.28, 0.3], [-1.6, 0.3, -1.4, 0.22]],
  bodies: [...HAWK.bodies!, pod(1.0, -0.2, -0.65, 0.14, 0.12, 1.5, 2)],
};
H['sh-60b'] = { ...SEAHAWK, oneSide: [pod(5.2, 3.4, -1.12, 0.62, 0.2), pod(-0.4, -1.8, 0.4, 0.13, 0.13, 1.6, 2)] };
H['mh-60r'] = { ...SEAHAWK, oneSide: [pod(2.6, 0.6, -1.12, 0.6, 0.2), pod(7.45, 6.85, -0.72, 0.28, 0.28)] };

// ---------------------------------------------------------------- Ka-50 / Ka-52

// Ka-50: one seat, the 30 mm cannon in its fairing on the right side under the wing root. Ka-52: two seats side by
// side in a broad, tall glazed cabin, the radar in a rounded nose, the sensor ball under the chin and the second on
// the cabin roof.
const HOKUM2: HeliSpec = { ...HOKUM, oneSide: [pod(2.6, 0.2, -0.55, 0.22, 0.24, 0.72)], guns: [[2.5, 0.72, -0.55, 1.8, 0.05]], wheels: false, wheelAt: [[4.7, 0.3, -1.3, 0.28], [-0.2, 1.0, -1.25, 0.38]] };
// The Ka-50's blades have swept-back tips (FAS military analysis network, Ka-50).
H['ka-50'] = { cls: 'heli-attack', ...HOKUM2, sweptTips: true };
H['ka-52'] = {
  cls: 'heli-attack', ...HOKUM2, length: 13.53,
  fuselage: { ...HOKUM.fuselage!, top: [[6.77, -0.15], [6.5, 0.25], [5.9, 0.55], [5.3, 0.75], [4.7, 1.0], [3.6, 1.15], [2.6, 1.2], [0.0, 1.2], [-1.2, 1.1], [-2.4, 0.7], [-6.2, 0.5], [-6.75, 0.5]], bottom: [[6.77, -0.4], [6.4, -0.75], [5.4, -0.95], [1.0, -1.0], [-1.2, -0.9], [-2.6, -0.35], [-6.2, 0.1], [-6.75, 0.15]], plan: [[6.77, 0.35], [6.4, 0.65], [5.6, 0.82], [4.4, 0.9], [3.0, 0.85], [1.0, 0.72], [-1.0, 0.6], [-2.5, 0.32], [-6.75, 0.2]], round: [[6.7, 3], [4, 4], [0, 4.5], [-6.7, 3]] },
  glass: [[4.5, 0.65, 1.1, 0.86, 0.5]],
  oneSide: [pod(2.6, 0.2, -0.55, 0.22, 0.24, 0.72), pod(6.2, 5.5, -1.05, 0.34, 0.34), pod(3.6, 3.0, 1.45, 0.3, 0.3)],
};

// ---------------------------------------------------------------- Tiger

// HAP / HAD: the roof sight over the raised rear canopy of the gunner, the 30 mm turret under the chin, rocket pods
// and Mistral pairs. UHT: the mast-mounted sight, no gun, HOT or PARS launchers two by two. Both: the end-plated
// tailplane, fixed main gear under the cockpit and a tail wheel, the tail rotor on the right (as public photos show).
const TIGER2: HeliSpec = {
  ...TIGER, wheels: false, wheelAt: [[4.45, 0.9, -1.55, 0.3], [-3.8, 0, -1.5, 0.18]],
  tailPlan: [[-5.9, 0.1], [-5.9, 1.2], [-6.75, 1.2], [-6.75, 0.1]], tailUp: -0.4,
  bodies: [...TIGER.bodies!, pod(-5.8, -6.85, -0.1, 0.05, 0.65, 1.22, 4)],
  tailRotorAt: [-6.6, 1.45], tailRotorDiameter: 2.7, tailBlades: 3,
};
H['tiger-hap'] = { cls: 'heli-attack', ...TIGER2, bodies: [...TIGER2.bodies!, pod(3.8, 2.3, -0.3, 0.25, 0.25, 1.15)], oneSide: [pod(3.9, 3.3, 1.78, 0.26, 0.26), pod(5.9, 5.3, -1.1, 0.26, 0.24)], guns: [[5.6, 0, -1.14, 1.4, 0.05]] };
H['tiger-uht'] = { cls: 'heli-attack', ...TIGER2, mastDome: true, mastDomeSize: [0.38, 0.32, 0.6], bodies: [...TIGER2.bodies!, ...launchers(3.9, 1.5, 1.5, -0.3, 0.18, 2, 2)] };

// ---------------------------------------------------------------- Gazelle and Alouette

// SA 341/342 Gazelle: the round glass cabin 1.5 m deep, the rotor only 2.9 m behind the nose, the engine bare behind
// the gearbox under a narrow cowl with its exhaust pipe pointing back, a thin boom to the swept fin with the
// fenestron in it and a ventral fin under it, a small end-plated tailplane, skids (fuselage 9.53 m, rotor 10.5 m,
// 3.19 m; stations and depths judged from public three-views, estimates). 342M: two HOT tubes either side on an
// outrigger behind the doors and the Viviane roof sight over the left seat; 342L: the 20 mm cannon on the right;
// Mistral: two missiles each side on the beam; the minigun on the left.
const GAZELLE: HS = {
  cls: 'heli-scout', length: 9.53, rotor: 10.5, height: 3.19, bodyWidth: 1.7, bodyHeight: 1.5, cabin: 'bubble', blades: 3, tailRotor: 'fenestron',
  fuselage: {
    top: [[4.77, -0.26], [4.6, 0.15], [4.2, 0.48], [3.66, 0.68], [3.0, 0.74], [0.56, 0.74], [0.3, 0.58], [-2.93, 0.58], [-4.4, 0.6]],
    bottom: [[4.77, -0.3], [4.5, -0.6], [4.06, -0.74], [0.88, -0.74], [0.25, -0.3], [-2.93, 0.0], [-4.4, 0.05]],
    plan: [[4.77, 0.25], [4.5, 0.6], [4.0, 0.8], [3.0, 0.85], [0.88, 0.82], [0.25, 0.35], [-2.93, 0.18], [-4.4, 0.15]],
    round: [[4.7, 2.2], [2, 2.8], [0.3, 2.6], [-4.4, 2.4]], stations: 24,
  },
  bodies: [
    { top: [[2.4, 0.74], [2.2, 1.06], [0.6, 1.06], [0.2, 0.9]], bottom: [[2.4, 0.7], [0.2, 0.7]], plan: [[2.4, 0.2], [2.2, 0.3], [0.6, 0.3], [0.2, 0.2]], round: 3, stations: 8 },
    pod(0.6, -0.25, 0.82, 0.14, 0.14),
    pod(-2.7, -3.25, 0.55, 0.04, 0.3, 0.95, 4),
  ],
  glass: [[3.6, 0.1, 1.15, 0.86, 0.68]],
  finPlan: [[-2.95, -0.1], [-4.05, 1.35], [-4.55, 1.35], [-4.77, -0.6]],
  tailPlan: [[-2.75, 0.1], [-2.75, 0.95], [-3.2, 0.95], [-3.2, 0.1]], tailUp: 0.55,
  rotorX: 1.87, mastTop: 1.45, skidAt: [3.9, 1.1, 0.95, -1.09],
};
const BEAM = pod(1.5, 1.1, -0.1, 0.05, 0.05, 0.95, 2);
H['sa-342-gazelle'] = { ...GAZELLE };
H['sa-342m'] = { ...GAZELLE, cls: 'heli-attack', bodies: [...GAZELLE.bodies!, BEAM, ...launchers(1.95, 1.3, 1.1, 0.12, 0.2, 2)], oneSide: [pod(3.2, 2.6, 0.98, 0.2, 0.22, -0.35)] };
H['sa-342l'] = { ...GAZELLE, cls: 'heli-attack', oneSide: [pod(1.9, 0.3, -0.5, 0.14, 0.14, 1.0)], guns: [[1.9, 1.0, -0.5, 1.1, 0.035]] };
H['sa-342-mistral'] = { ...GAZELLE, cls: 'heli-attack', bodies: [...GAZELLE.bodies!, BEAM, ...launchers(2.1, 1.8, 1.0, 0.15, 0.12, 2)] };
H['sa-342-minigun'] = { ...GAZELLE, cls: 'heli-attack', oneSide: [pod(2.6, 2.0, -0.3, 0.13, 0.13, -0.98)], guns: [[2.5, -0.98, -0.3, 0.7, 0.04]] };

// SA 313B Alouette II: the glass bubble 1.4 m deep, the rotor right behind it over the bare engine, the open lattice
// boom (three steel-tube longerons, two on top and one under, braced zigzag) tapering to a small fin and the tail
// rotor (fuselage 9.66 m, rotor 10.2 m, 2.75 m to the rotor head). SA 316B
// Alouette III: an enclosed cabin 1.55 m deep with a rounded glazed nose, the rotor 2.7 m behind the nose, the engine
// bare on top behind it, a box boom to an end-plated tailplane and the tail rotor on the left (as the public
// three-view shows), fixed tricycle wheels (fuselage 10.03 m, rotor 11.02 m, 3.0 m). Stations and depths judged from
// public three-views (estimates).
H['alouette-ii'] = {
  cls: 'heli-scout', length: 9.66, rotor: 10.2, height: 2.75, bodyWidth: 1.6, bodyHeight: 1.42, cabin: 'bubble', blades: 3,
  // The bubble and the frame under the engine; the boom is open lattice (struts).
  fuselage: {
    top: [[4.83, -0.15], [4.7, 0.3], [4.3, 0.62], [3.6, 0.71], [3.0, 0.65], [2.6, 0.5], [2.4, 0.53], [2.0, 0.5]],
    bottom: [[4.83, -0.3], [4.6, -0.55], [4.0, -0.7], [2.8, -0.71], [2.4, -0.48], [2.0, -0.42]],
    plan: [[4.83, 0.2], [4.5, 0.6], [3.8, 0.8], [3.0, 0.78], [2.5, 0.5], [2.4, 0.3], [2.0, 0.28]],
    round: [[4.8, 2.2], [2.6, 2.4], [2.4, 6], [2.0, 6]], stations: 16,
  },
  // The bare engine and its exhaust, the tail rotor's gearbox at the boom's end.
  bodies: [pod(2.15, 0.4, 0.5, 0.28, 0.25), pod(0.5, -0.1, 0.62, 0.1, 0.1), pod(-3.3, -3.85, 0.3, 0.08, 0.1)],
  // The lattice boom, and the tubular guard looped round under and behind the tail rotor (FM 44-80 three-view).
  struts: [...lattice(2.3, -3.4, 7, [0.53, 0.37], [-0.45, 0.2], [0.3, 0.08], 0.03, 0.018), ...loop([[-3.24, 0.5], [-4.3, 0.48], [-4.79, 0.29], [-4.75, -0.1], [-4.67, -0.37], [-4.01, -0.59], [-3.46, -0.37], [-3.3, 0.2]], 0.03)],
  glass: [[3.6, 0.0, 1.15, 0.82, 0.72]],
  finPlan: [[-3.0, -0.5], [-3.8, -0.5], [-3.95, 0.3], [-3.45, 0.3]],
  tailRotorAt: [-3.65, 0.6], tailRotorDiameter: 1.8, tailBlades: 3,
  tailPlan: [[-2.7, 0.05], [-2.7, 0.7], [-3.1, 0.7], [-3.1, 0.05]], tailUp: 0.3,
  // The rotor head 2.75 m up (published height).
  rotorX: 2.25, mastTop: 1.48, skidAt: [3.9, 1.0, 1.0, -1.05],
};
H['alouette-iii'] = {
  cls: 'heli-transport', length: 10.03, rotor: 11.02, height: 3.0, bodyWidth: 1.75, bodyHeight: 1.55, cabin: 'cabin', blades: 3,
  fuselage: {
    top: [[5.015, -0.08], [4.95, 0.25], [4.6, 0.6], [4.06, 0.77], [1.5, 0.77], [0.6, 0.5], [0.5, 0.48], [-3.2, 0.55], [-4.0, 0.55]],
    bottom: [[5.015, -0.2], [4.8, -0.55], [4.35, -0.77], [1.65, -0.77], [1.3, -0.65], [0.5, -0.3], [-3.2, 0.2], [-4.0, 0.3]],
    plan: [[5.015, 0.3], [4.7, 0.7], [4.2, 0.86], [1.65, 0.86], [0.8, 0.5], [0.5, 0.3], [-3.2, 0.15], [-4.0, 0.12]],
    round: [[5, 2.6], [3, 3.2], [0.5, 3], [-4, 4]], stations: 22,
  },
  bodies: [pod(1.75, 0.2, 0.75, 0.3, 0.25), pod(0.25, -0.35, 0.84, 0.12, 0.12), pod(2.75, 2.15, 0.95, 0.28, 0.25), pod(-2.7, -3.3, 0.55, 0.04, 0.25, 1.15, 4)],
  glass: [[4.2, 0.1, 1.0, 0.9, 0.72]],
  finPlan: [[-3.4, -0.4], [-4.0, -0.4], [-4.1, 0.2], [-3.7, 0.25]],
  tailRotorSide: -1, tailRotorAt: [-4.23, 0.6], tailRotorDiameter: 1.91, tailBlades: 3,
  tailPlan: [[-2.7, 0.05], [-2.7, 1.15], [-3.3, 1.15], [-3.3, 0.05]], tailUp: 0.5,
  rotorX: 2.3, mastTop: 1.55, wheelAt: [[4.2, 0, -1.05, 0.2], [1.3, 1.44, -1.0, 0.22]],
};

// ---------------------------------------------------------------- Puma, Super Frelon, Sea King, Merlin, NH90

// SA 330 Puma: a cabin 2.75 m deep under the engine deck ahead of the rotor, which sits 4.8 m behind the nose,
// sponsons with the main wheels, a slender boom leaving the cabin's upper rear to the tail pylon with the five-blade
// tail rotor on its right and the stabiliser on its left (fuselage 14.06 m, rotor 15.0 m, 5.14 m; proportions
// judged from the public Super Puma three-view, estimates).
H['sa-330-puma'] = {
  cls: 'heli-transport', length: 14.06, rotor: 15.0, height: 5.14, bodyWidth: 2.3, bodyHeight: 2.75, cabin: 'cabin', blades: 4,
  fuselage: {
    top: [[7.03, -0.67], [6.6, 0.06], [5.6, 0.93], [5.0, 1.3], [4.4, 1.36], [-0.22, 1.36], [-1.08, 0.72], [-5.29, 0.5], [-7.03, 0.55]],
    bottom: [[7.03, -0.95], [6.3, -1.39], [-0.22, -1.39], [-1.08, -0.38], [-5.29, -0.15], [-7.03, -0.1]],
    plan: [[7.03, 0.3], [6.4, 0.85], [5.4, 1.0], [-0.22, 1.0], [-1.08, 0.55], [-5.29, 0.3], [-7.03, 0.2]],
    round: [[7, 2.6], [4, 3.6], [-0.2, 3.6], [-1.1, 3], [-7, 2.4]], stations: 26,
  },
  bodies: [
    { top: [[4.2, 1.36], [3.8, 1.8], [0.4, 1.8], [-0.5, 1.36]], bottom: [[4.2, 1.3], [-0.5, 1.3]], plan: [[4.2, 0.55], [3.8, 0.75], [0.4, 0.75], [-0.5, 0.5]], round: 3, stations: 8 },
    pod(1.6, -0.4, -0.8, 0.35, 0.5, 1.2),
  ],
  glass: [[5.8, 0.55, 0.75, 0.95, 0.6]],
  finPlan: [[-5.3, 0], [-6.55, 2.1], [-7.1, 2.1], [-7.03, -0.3]],
  tailRotorAt: [-6.6, 1.65], tailRotorDiameter: 3.04, tailBlades: 5,
  tailPlan: [[-6.0, 0.1], [-6.1, 1.6], [-6.7, 1.6], [-6.7, 0.1]], tailUp: 0.5, tailOneSide: -1,
  rotorX: 2.25, mastTop: 2.1, wheelAt: [[5.44, 0.3, -1.68, 0.25], [0.65, 1.3, -1.68, 0.3]],
};
// SA 321 Super Frelon / Z-8: a long boat hull 2.9 m deep, three engines on top ahead of the rotor, float sponsons
// with the main wheels, the tail rotor high on the fin (fuselage 19.4 m, rotor 18.9 m, 6.66 m; stations and depths
// judged from the public three-view, estimates).
H['z-8-super-frelon'] = {
  cls: 'heli-transport', length: 19.4, rotor: 18.9, height: 6.66, bodyWidth: 2.4, bodyHeight: 2.86, cabin: 'cabin', blades: 6,
  fuselage: {
    top: [[9.7, -0.74], [9.3, 0.2], [8.0, 1.09], [7.1, 1.43], [-2.6, 1.43], [-4.0, 1.25], [-8.87, 0.97], [-9.7, 1.0]],
    bottom: [[9.7, -0.9], [9.3, -1.3], [8.3, -1.43], [-0.9, -1.43], [-3.4, -0.6], [-6.4, 0.15], [-8.87, 0.4], [-9.7, 0.55]],
    plan: [[9.7, 0.3], [9.0, 0.95], [7.6, 1.2], [-1.0, 1.2], [-3.4, 0.75], [-6.4, 0.38], [-9.7, 0.22]],
    round: [[9.6, 2.6], [4, 3.2], [-9.6, 2.4]], stations: 28,
  },
  bodies: [pod(5.9, -0.9, 1.75, 0.85, 0.55), pod(2.4, -0.4, -0.95, 0.42, 0.45, 1.6)],
  glass: [[8.3, 0.6, 0.8, 0.95, 0.55]],
  finPlan: [[-8.4, 0], [-9.7, 0], [-10.4, 2.4], [-9.7, 2.5]],
  tailRotorAt: [-10.3, 2.75], tailRotorDiameter: 4.0, tailBlades: 5,
  tailPlan: [[-8.6, 0.1], [-8.8, 1.4], [-9.4, 1.4], [-9.4, 0.1]], tailUp: 2.4, tailOneSide: 1,
  rotorX: 2.44, mastTop: 3.0, wheelAt: [[7.7, 0.35, -1.75, 0.3], [0.3, 1.6, -1.75, 0.38]],
};
// SH-3 / S-61 Sea King: a deep boat hull (3.2 m from the keel to the roof), the engines on top ahead of the rotor,
// which sits 5 m behind the nose, float sponsons with the main wheels, the hull rising to the tail pylon with the
// tail rotor on its left and a small stabiliser high on its right, the tail wheel under the hull's step (fuselage
// 16.69 m, rotor 18.9 m, 5.13 m; stations and depths judged from the public three-view, estimates).
H['sh-3-sea-king'] = {
  cls: 'heli-transport', length: 16.69, rotor: 18.9, height: 5.13, bodyWidth: 2.1, bodyHeight: 3.2, cabin: 'cabin', blades: 5,
  fuselage: {
    top: [[8.345, -0.6], [8.2, 0.2], [7.7, 1.1], [7.0, 1.6], [-2.7, 1.6], [-7.7, 1.32], [-8.345, 1.3]],
    bottom: [[8.345, -0.8], [8.0, -1.35], [7.0, -1.6], [-1.5, -1.6], [-3.5, -1.1], [-6.0, -0.2], [-8.345, 0.32]],
    plan: [[8.345, 0.3], [8.0, 0.8], [7.0, 1.05], [-1.5, 1.05], [-3.5, 0.8], [-6.0, 0.45], [-8.345, 0.25]],
    round: [[8.3, 2.6], [6, 3.2], [-2, 3.2], [-8.3, 2.4]], stations: 26,
  },
  bodies: [pod(6.2, 1.6, 1.95, 0.75, 0.35), pod(4.9, 1.6, -0.95, 0.42, 0.5, 1.5)],
  glass: [[7.6, 0.85, 0.6, 1.0, 0.55]],
  finPlan: [[-6.6, 0], [-8.1, 1.85], [-8.6, 1.85], [-8.345, -0.3]],
  tailRotorSide: -1, tailRotorAt: [-8.6, 2.15], tailRotorDiameter: 3.23, tailBlades: 5,
  tailPlan: [[-8.2, 0.1], [-8.35, 1.5], [-8.9, 1.5], [-8.9, 0.1]], tailUp: 2.4, tailOneSide: 1,
  rotorX: 3.39, mastTop: 2.72, wheelAt: [[2.2, 1.65, -1.75, 0.35], [-3.3, 0, -1.75, 0.2]],
};
// AW101 Merlin: a cabin 2.5 m deep under a tall deck with three engines ahead of and beside the rotor, sponsons, the
// rear fuselage tapering over the ramp to the tail pylon, BERP-tipped blades, the tail rotor on the left and the
// tailplane high on the right (fuselage 19.53 m, rotor 18.59 m, 6.62 m; stations and depths judged from the public
// three-view, estimates).
H['aw101-merlin'] = {
  cls: 'heli-transport', length: 19.53, rotor: 18.59, height: 6.62, bodyWidth: 2.5, bodyHeight: 2.5, cabin: 'cabin', blades: 5, sweptTips: true,
  fuselage: {
    top: [[9.765, -0.48], [9.4, 0.2], [8.9, 0.8], [7.5, 1.25], [-0.6, 1.25], [-3.0, 1.4], [-7.5, 1.3], [-9.765, 1.3]],
    bottom: [[9.765, -0.65], [9.1, -1.18], [8.4, -1.25], [-1.3, -1.25], [-4.5, -0.4], [-7.5, 0.38], [-9.765, 0.5]],
    plan: [[9.765, 0.35], [9.1, 0.95], [8.0, 1.15], [-1.3, 1.2], [-4.5, 0.8], [-7.5, 0.4], [-9.765, 0.25]],
    round: [[9.7, 2.6], [4, 3.6], [-1.3, 3.6], [-9.7, 2.4]], stations: 28,
  },
  bodies: [
    { top: [[5.0, 1.25], [4.4, 2.3], [0.0, 2.46], [-1.5, 1.9], [-3.0, 1.4]], bottom: [[5.0, 1.2], [-3.0, 1.2]], plan: [[5.0, 0.6], [4.4, 0.95], [0.0, 0.95], [-3.0, 0.5]], round: 3, stations: 10 },
    pod(1.3, -1.2, -0.85, 0.35, 0.4, 1.45),
  ],
  glass: [[8.4, 0.5, 0.8, 0.95, 0.5]],
  finPlan: [[-7.2, 0], [-9.0, 2.2], [-9.8, 2.2], [-9.765, -0.3]],
  tailRotorSide: -1, tailRotorAt: [-9.6, 3.15], tailRotorDiameter: 4.0,
  tailPlan: [[-9.3, 0.1], [-9.5, 1.6], [-10.0, 1.6], [-10.0, 0.1]], tailUp: 2.9, tailOneSide: 1,
  rotorX: 2.95, mastTop: 3.15, wheelAt: [[8.2, 0.3, -1.6, 0.3], [0.9, 1.5, -1.6, 0.38]],
};
// NH90: a smooth composite body 2.75 m deep under a low fairing over the engines, the rotor 5.6 m behind the
// sloping nose, sponsons with the main wheels, the boom leaving the cabin's top to a swept fin with the tail rotor on
// its left and the stabiliser on its right (as the public three-views show) (fuselage 16.13 m, rotor 16.3 m,
// 5.23 m; stations and depths judged from those views, estimates).
H['nh90'] = {
  cls: 'heli-transport', length: 16.13, rotor: 16.3, height: 5.23, bodyWidth: 2.4, bodyHeight: 2.75, cabin: 'cabin', blades: 4,
  fuselage: {
    top: [[8.065, -0.75], [7.8, -0.2], [7.3, 0.4], [6.6, 0.88], [6.2, 1.2], [5.4, 1.36], [-0.9, 1.36], [-1.2, 1.16], [-6.5, 1.1], [-8.065, 1.1]],
    bottom: [[8.065, -0.85], [7.7, -1.2], [7.0, -1.36], [-0.9, -1.39], [-1.8, 0.0], [-2.6, 0.3], [-6.5, 0.65], [-8.065, 0.7]],
    plan: [[8.065, 0.35], [7.6, 0.85], [6.8, 1.1], [5.6, 1.2], [-0.9, 1.2], [-1.8, 0.6], [-2.6, 0.42], [-8.065, 0.22]],
    round: [[8, 2.6], [6, 3.4], [-1, 3.4], [-2, 2.8], [-8, 2.4]], stations: 28,
  },
  bodies: [
    { top: [[5.4, 1.36], [4.8, 1.68], [-0.2, 1.68], [-0.9, 1.36]], bottom: [[5.4, 1.3], [-0.9, 1.3]], plan: [[5.4, 0.6], [4.8, 0.85], [-0.2, 0.85], [-0.9, 0.55]], round: 3, stations: 8 },
    pod(-0.3, -1.0, 1.5, 0.25, 0.2, 0.55),
    pod(2.7, -0.1, -1.05, 0.4, 0.3, 1.55),
  ],
  glass: [[6.9, 0.45, 0.75, 1.05, 0.5]],
  finPlan: [[-6.5, 0], [-8.065, -0.4], [-8.6, 2.05], [-7.95, 2.1]],
  tailRotorSide: -1, tailRotorAt: [-8.45, 2.3], tailRotorDiameter: 3.2,
  tailPlan: [[-7.1, 0.1], [-7.2, 1.6], [-7.9, 1.6], [-7.9, 0.1]], tailUp: 1.35, tailOneSide: 1,
  rotorX: 2.47, mastTop: 2.36, wheelAt: [[7.15, 0.3, -1.6, 0.25], [0.7, 1.6, -1.55, 0.32]],
};

// ---------------------------------------------------------------- Chinook, Sea Stallion, Mi-26

// CH-47 Chinook: the long box 2.9 m deep with fuel pods along its lower sides, the low forward rotor pylon over the
// cockpit and the tall rear pylon with an engine either side of it, the loading ramp rising to the tail, four wheels
// (fuselage 15.87 m, rotors 18.29 m, 5.68 m; stations from public three-views: the hubs 2.2 m behind the nose and
// 2.1 m ahead of the tail, the rear one a metre higher). The F keeps the D's outline. MH-47G: the long refuelling
// probe on the right of the nose.
const CHINOOK: HS = {
  cls: 'heli-transport', length: 15.87, rotor: 18.29, height: 5.68, bodyWidth: 3.78, bodyHeight: 2.9, cabin: 'boxy', rotors: 'tandem', blades: 3, tailRotor: 'none',
  fuselage: {
    top: [[7.935, -0.05], [7.75, 0.6], [7.3, 1.2], [6.8, 1.46], [-7.0, 1.46], [-7.935, 1.4]],
    bottom: [[7.935, -0.35], [7.75, -0.9], [7.2, -1.3], [6.5, -1.46], [-5.0, -1.46], [-7.935, 0.13]],
    plan: [[7.935, 0.6], [7.6, 1.0], [7.0, 1.2], [6.4, 1.25], [-7.5, 1.25], [-7.935, 1.1]],
    round: [[7.9, 3], [6.4, 6], [-7.9, 6]], stations: 26,
  },
  bodies: [
    { top: [[7.2, 1.46], [6.9, 2.2], [6.5, 2.5], [4.3, 2.5], [3.9, 1.46]], bottom: [[7.2, 1.4], [3.9, 1.4]], plan: [[7.2, 0.3], [6.9, 0.5], [4.3, 0.5], [3.9, 0.3]], round: 3, stations: 8 },
    { top: [[-3.1, 1.46], [-4.2, 3.1], [-4.5, 3.3], [-7.3, 3.3], [-7.9, 2.6], [-7.935, 1.46]], bottom: [[-3.1, 1.4], [-7.935, 1.4]], plan: [[-3.1, 0.3], [-4.2, 0.5], [-7.3, 0.5], [-7.935, 0.4]], round: 3, stations: 10 },
    pod(-3.8, -6.6, 1.17, 0.5, 0.5, 1.05),
    pod(3.9, -5.2, -0.8, 0.34, 0.62, 1.55, 3),
  ],
  glass: [[7.2, 0.6, 0.65, 1.05, 0.65]],
  rotorX: 5.78, mastTop: 2.67, rotor2: [-5.81, 3.68],
  wheelAt: [[1.9, 1.6, -1.84, 0.3], [-4.6, 1.6, -1.84, 0.3]],
};
H['ch-47-chinook'] = { ...CHINOOK };
H['ch-47f'] = { ...CHINOOK };
H['mh-47g'] = { ...CHINOOK, oneSide: [pod(13.0, 6.4, 0.3, 0.1, 0.1, 1.05, 2)] };

// CH-53E Super Stallion: a deep boat hull (4 m from the belly to the top of the deck), seven blades on a hub 7.1 m
// behind the nose, three engines - two in nacelles off the shoulders beside the gearbox, the third on the left
// behind it - sponsons with the main wheels and the big drop tanks, the refuelling probe on the right, the belly
// rising to a slim tail cone and the tall pylon canted to the left (drawn upright) with the big tail rotor on its
// left and the gull tailplane on its right (fuselage 22.35 m, rotor 24.08 m, 5.32 m to the rotor head; stations
// and depths judged from public three-views, estimates).
const STALLION: HS = {
  cls: 'heli-transport', length: 22.35, rotor: 24.08, height: 5.32, bodyWidth: 2.69, bodyHeight: 4.0, cabin: 'cabin', blades: 7,
  fuselage: {
    top: [[11.175, -0.75], [10.9, 0.0], [10.3, 0.85], [9.6, 1.35], [8.6, 1.6], [7.8, 1.85], [-1.5, 1.85], [-2.2, 1.6], [-8.5, 1.07], [-11.175, 1.1]],
    bottom: [[11.175, -0.95], [10.8, -1.5], [10.0, -1.9], [9.0, -2.05], [-2.5, -2.05], [-4.0, -1.6], [-8.0, -0.4], [-11.175, 0.3]],
    plan: [[11.175, 0.4], [10.8, 0.9], [10.0, 1.2], [9.0, 1.35], [-2.5, 1.35], [-4.0, 1.1], [-8.0, 0.55], [-11.175, 0.3]],
    round: [[11, 2.8], [9, 3.6], [-2.5, 3.6], [-8, 2.8], [-11, 2.4]], stations: 30,
  },
  bodies: [
    { top: [[6.95, 1.2], [6.6, 1.88], [3.3, 1.88], [2.9, 1.4]], bottom: [[6.95, 0.95], [6.6, 0.98], [3.3, 0.98], [2.9, 1.1]], plan: [[6.95, 0.35], [6.6, 0.45], [3.3, 0.45], [2.9, 0.3]], side: 1.5, round: 2.4, stations: 8 },
    { top: [[7.0, -1.3], [6.6, -1.1], [0.9, -1.1], [0.3, -1.3]], bottom: [[7.0, -1.6], [6.6, -1.9], [0.9, -1.9], [0.3, -1.6]], plan: [[7.0, 0.15], [6.6, 0.35], [0.9, 0.35], [0.3, 0.15]], side: 1.65, round: 3, stations: 8 },
    pod(7.4, 1.4, -1.2, 0.42, 0.42, 2.45, 2.2),
  ],
  oneSide: [pod(0.2, -1.8, 1.6, 0.45, 0.45, -1.0), pod(14.0, 10.0, -1.0, 0.1, 0.1, 0.9, 2)],
  glass: [[9.9, 0.55, 0.8, 1.1, 0.55]],
  finPlan: [[-8.25, 0], [-10.5, 3.25], [-11.4, 3.25], [-11.175, 0]],
  tailRotorSide: -1, tailRotorAt: [-11.8, 4.3], tailRotorDiameter: 6.1,
  tailPlan: [[-10.7, 0.1], [-10.9, 2.6], [-11.6, 2.6], [-11.6, 0.1]], tailUp: 3.2, tailOneSide: 1,
  rotorX: 4.0, mastTop: 3.2, wheelAt: [[10.2, 0.35, -2.0, 0.3], [2.0, 1.75, -2.0, 0.38]],
};
H['ch-53e'] = { ...STALLION };
// CH-53D / G Sea Stallion: two engines, six blades, a shorter body, no probe, the stabiliser straight on the right
// (fuselage 20.47 m, rotor 22.02 m).
const kG = 20.47 / 22.35;
H['ch-53g'] = {
  ...scaled(STALLION, kG), cls: 'heli-transport', length: 20.47, rotor: 22.02, blades: 6, oneSide: [],
  bodies: [stretch(STALLION.bodies![0], kG), stretch(STALLION.bodies![1], kG)],
  finPlan: [[-7.6, 0], [-9.8, 3.0], [-10.6, 3.0], [-10.235, 0]], tailRotorAt: [-10.8, 3.9], tailRotorDiameter: 4.9,
  tailPlan: [[-9.8, 0.1], [-9.9, 2.2], [-10.5, 2.2], [-10.5, 0.1]], tailUp: 2.0,
};

// Mi-26: the biggest - a box 4 m deep with the tall engine deck on top running back into the boom, clamshell doors
// and ramp under it, the rotor 12 m behind the nose, the boom up to a tall fin with the tail rotor at its top, eight
// blades (fuselage 33.73 m, rotor 32.0 m, 8.15 m to the rotor head; stations and depths judged from the public
// three-view, estimates).
H['mi-26'] = {
  cls: 'heli-transport', length: 33.73, rotor: 32.0, height: 8.15, bodyWidth: 3.6, bodyHeight: 4.0, cabin: 'cabin', blades: 8,
  fuselage: {
    top: [[16.865, -1.0], [16.5, 0.3], [15.2, 1.37], [14.0, 1.6], [11.3, 1.97], [-2.0, 1.97], [-4.0, 2.4], [-13.0, 2.5], [-16.865, 2.5]],
    bottom: [[16.865, -1.3], [16.3, -1.8], [15.2, -2.05], [-1.1, -2.05], [-5.4, 0.25], [-13.0, 1.6], [-16.865, 1.8]],
    plan: [[16.865, 0.5], [16.0, 1.4], [14.4, 1.8], [-1.1, 1.8], [-5.4, 1.0], [-13.0, 0.5], [-16.865, 0.35]],
    round: [[16, 2.6], [10, 4.5], [-2, 4.5], [-5.4, 3], [-16, 2.6]], stations: 30,
  },
  bodies: [{ top: [[11.5, 1.97], [10.5, 3.3], [9.0, 4.1], [2.0, 4.1], [-2.0, 2.9], [-4.0, 2.4]], bottom: [[11.5, 1.9], [-4.0, 1.9]], plan: [[11.5, 0.8], [10.5, 1.4], [2.0, 1.4], [-4.0, 0.6]], round: 3, stations: 10 }],
  glass: [[15.0, 0.9, 1.2, 1.5, 0.6]],
  finPlan: [[-12.5, 0], [-15.6, 3.3], [-16.6, 3.3], [-16.865, -0.3]],
  tailRotorAt: [-16.9, 5.0], tailRotorDiameter: 7.61, tailBlades: 5,
  tailPlan: [[-13.2, 0.2], [-13.3, 2.4], [-14.2, 2.4], [-14.2, 0.2]], tailUp: 2.3,
  rotorX: 4.9, mastTop: 5.0, wheelAt: [[14.3, 0.6, -2.5, 0.45], [3.2, 2.1, -2.45, 0.55]],
};

// ---------------------------------------------------------------- Kamov and the Dauphin family

// Ka-27: a compact box 2 m deep, the tall engine deck under coaxial rotors 1.8 m apart and 4.15 m behind the nose, a
// short thick boom to the twin end-plate fins, four wheels and the radar under the nose (fuselage 11.3 m, rotors
// 15.9 m, 5.5 m; stations and depths judged from the public three-view, estimates). Ka-29: the assault version - a
// broad armoured nose with flat windows, stub pylons, a gun.
const HELIX: HS = {
  cls: 'heli-transport', length: 11.3, rotor: 15.9, height: 5.5, bodyWidth: 2.3, bodyHeight: 2.04, cabin: 'boxy', rotors: 'coaxial', blades: 3, tailRotor: 'none', twinFins: true,
  fuselage: {
    top: [[5.65, -0.2], [5.25, 0.7], [4.65, 1.0], [-2.37, 1.0], [-3.9, 0.9], [-5.65, 0.2]],
    bottom: [[5.65, -0.37], [5.1, -0.9], [4.65, -1.04], [-1.45, -1.04], [-2.37, -0.37], [-3.9, 0.1], [-5.65, 0.1]],
    plan: [[5.65, 0.45], [5.1, 1.0], [4.4, 1.15], [-1.45, 1.15], [-2.37, 0.8], [-3.9, 0.45], [-5.65, 0.35]],
    round: [[5.6, 3], [0, 4.5], [-5.6, 3]], stations: 22,
  },
  bodies: [{ top: [[3.9, 1.0], [3.5, 1.75], [-0.9, 1.83], [-1.6, 1.0]], bottom: [[3.9, 0.95], [-1.6, 0.95]], plan: [[3.9, 0.6], [3.5, 0.95], [-0.9, 0.95], [-1.6, 0.6]], round: 3, stations: 8 }],
  glass: [[4.9, 0.55, 0.6, 1.0, 0.45]],
  finPlan: [[-5.0, 0], [-5.65, 0], [-5.65, 2.14], [-5.0, 2.14]],
  rotorX: 1.5, mastTop: 1.81, coaxGap: 1.8, wheelAt: [[3.5, 0.9, -1.45, 0.3], [0.7, 1.4, -1.4, 0.35]],
};
H['ka-27'] = { ...HELIX, oneSide: [pod(4.6, 3.6, -1.45, 0.5, 0.22)] };
H['ka-29'] = {
  ...HELIX, cls: 'heli-attack',
  fuselage: { ...HELIX.fuselage!, top: [[5.65, 0.0], [5.3, 0.75], [4.65, 1.0], [-2.37, 1.0], [-3.9, 0.9], [-5.65, 0.2]], plan: [[5.65, 0.65], [5.0, 1.1], [4.4, 1.15], [-1.45, 1.15], [-2.37, 0.8], [-3.9, 0.45], [-5.65, 0.35]] },
  glass: [[4.95, 0.65, 0.45, 1.05, 0.35]],
  stubs: { span: 5.0, pylons: 2 }, stubAt: [1.0, -0.3, 0],
  oneSide: [pod(5.2, 4.6, -0.6, 0.15, 0.15, 0.6)], guns: [[5.2, 0.6, -0.6, 0.6, 0.03]],
};
// Ka-60 Kasatka: one four-bladed rotor, a cabin 2.35 m deep, a thick boom to the fenestron fin with the stabiliser on
// its top, a smooth body on retractable wheels (fuselage 13.26 m, rotor 13.5 m, 4.6 m; judged from public photos,
// estimates).
H['ka-60'] = {
  cls: 'heli-transport', length: 13.26, rotor: 13.5, height: 4.6, bodyWidth: 2.1, bodyHeight: 2.35, cabin: 'cabin', blades: 4, tailRotor: 'fenestron',
  fuselage: {
    top: [[6.63, -0.35], [6.2, 0.35], [5.3, 0.95], [4.4, 1.2], [-0.6, 1.2], [-1.8, 0.95], [-3.2, 0.65], [-6.63, 0.6]],
    bottom: [[6.63, -0.5], [6.0, -1.0], [5.0, -1.15], [-0.8, -1.15], [-2.0, -0.55], [-3.2, 0.0], [-6.63, 0.25]],
    plan: [[6.63, 0.3], [6.0, 0.85], [5.0, 1.0], [-0.8, 1.0], [-2.0, 0.6], [-3.2, 0.32], [-6.63, 0.2]],
    round: [[6.6, 2.4], [3, 3.2], [-6.6, 2.4]], stations: 24,
  },
  bodies: [pod(3.6, -0.4, 1.45, 0.6, 0.4)],
  glass: [[5.5, 0.4, 0.8, 0.88, 0.55]],
  finPlan: [[-5.2, -0.8], [-6.63, -0.8], [-7.0, 1.7], [-6.3, 1.8]],
  tailPlan: [[-6.4, 0.1], [-6.5, 1.0], [-6.95, 1.0], [-6.95, 0.1]], tailUp: 2.35,
  rotorX: 1.3, mastTop: 2.1, wheelAt: [[4.8, 0.25, -1.5, 0.25], [-0.6, 1.0, -1.45, 0.3]],
};
// AS365 Dauphin / Z-9: a sleek cabin 1.6 m deep with a low pointed nose, the rotor 4.3 m behind it on a raised
// deck, the tail cone tapering to the fenestron fin with a ventral fin, an end-plated tailplane, retractable wheels
// (fuselage 12.11 m, rotor 11.94 m, 3.47 m; stations and depths judged from the public three-view, estimates).
// Z-9W/WA: stub pylons with HJ-8 missiles and a FLIR ball under the nose.
const DAUPHIN: HS = {
  cls: 'heli-transport', length: 12.11, rotor: 11.94, height: 3.47, bodyWidth: 1.85, bodyHeight: 1.6, cabin: 'cabin', blades: 4, tailRotor: 'fenestron',
  fuselage: {
    top: [[6.055, -0.25], [5.6, 0.25], [5.0, 0.65], [4.0, 0.8], [-0.8, 0.8], [-1.5, 0.65], [-3.0, 0.5], [-4.8, 0.45], [-6.055, 0.5]],
    bottom: [[6.055, -0.35], [5.5, -0.7], [4.7, -0.8], [0.0, -0.8], [-1.5, -0.5], [-3.0, -0.1], [-4.8, 0.05], [-6.055, 0.1]],
    plan: [[6.055, 0.25], [5.5, 0.7], [4.6, 0.9], [0.0, 0.92], [-1.5, 0.55], [-3.0, 0.3], [-6.055, 0.18]],
    round: [[6, 2.4], [3, 3.2], [-1.5, 3], [-6, 2.4]], stations: 24,
  },
  bodies: [
    { top: [[3.2, 0.8], [2.8, 1.4], [0.0, 1.46], [-0.9, 0.8]], bottom: [[3.2, 0.75], [-0.9, 0.75]], plan: [[3.2, 0.4], [2.8, 0.6], [0.0, 0.6], [-0.9, 0.35]], round: 3, stations: 8 },
    pod(-3.95, -4.55, 0.45, 0.04, 0.35, 1.0, 4),
  ],
  glass: [[5.0, 0.3, 0.75, 0.8, 0.5]],
  finPlan: [[-4.2, -0.1], [-5.25, 2.0], [-6.05, 2.0], [-6.1, -0.6], [-5.0, -0.75]],
  tailPlan: [[-4.0, 0.1], [-4.0, 1.0], [-4.5, 1.0], [-4.5, 0.1]], tailUp: 0.45,
  rotorX: 1.72, mastTop: 2.1, wheelAt: [[4.86, 0.2, -1.0, 0.2], [1.14, 0.95, -1.0, 0.25]],
};
H['z-9-dauphin'] = { ...DAUPHIN };
H['z-9w'] = { ...DAUPHIN, cls: 'heli-attack', stubs: { span: 4.2, pylons: 2 }, stubAt: [1.6, -0.3, 0], oneSide: [pod(6.4, 5.8, -0.55, 0.25, 0.25)] };

// ---------------------------------------------------------------- light and scout helicopters

// Bell 206 JetRanger / OH-58A/C Kiowa: two blades on a mast 2.8 m behind the low pointed nose, a cabin 1.65 m deep,
// the engine cowl sweeping back from the roof into a thin boom, a small tailplane half way, the fin above and below
// the boom's end with the tail rotor low on its left, skids (fuselage 9.5 m, rotor 10.16 m, 2.91 m). OH-58D Kiowa
// Warrior: the same body stretched, four blades, the ball sight over the rotor, a bigger cowl with the exhaust
// turned up, weapon pylons both sides (fuselage 10.48 m, rotor 10.67 m, 3.93 m). Stations and depths judged from
// the public three-views (estimates).
const JETRANGER: HS = {
  cls: 'heli-scout', length: 9.5, rotor: 10.16, height: 2.91, bodyWidth: 1.45, bodyHeight: 1.65, cabin: 'bubble', blades: 2,
  fuselage: {
    top: [[4.75, -0.55], [4.4, -0.3], [3.8, 0.2], [3.0, 0.83], [1.2, 0.83], [-0.5, 0.49], [-3.6, 0.62], [-4.4, 0.62]],
    bottom: [[4.75, -0.62], [4.3, -0.78], [3.5, -0.83], [1.0, -0.83], [0.0, -0.35], [-0.5, 0.02], [-3.6, 0.45], [-4.4, 0.45]],
    plan: [[4.75, 0.15], [4.3, 0.5], [3.4, 0.72], [1.0, 0.72], [0.0, 0.45], [-0.5, 0.2], [-3.6, 0.1], [-4.4, 0.08]],
    round: [[4.7, 2.4], [2, 3], [-0.5, 2.4], [-4.4, 2.4]], stations: 22,
  },
  bodies: [
    { top: [[2.6, 0.83], [2.2, 1.0], [0.8, 1.0], [-0.5, 0.55]], bottom: [[2.6, 0.8], [-0.5, 0.45]], plan: [[2.6, 0.35], [2.2, 0.45], [0.8, 0.42], [-0.5, 0.2]], round: 3, stations: 8 },
    pod(1.4, 0.9, 1.05, 0.12, 0.15),
  ],
  glass: [[3.6, 0.15, 0.85, 0.72, 0.6]],
  finPlan: [[-3.85, 0], [-4.27, 1.07], [-4.75, 1.07], [-4.65, -0.98], [-4.35, -0.98]],
  tailRotorSide: -1, tailRotorAt: [-4.15, 0.55], tailRotorDiameter: 1.65, tailBlades: 2,
  tailPlan: [[-1.7, 0.05], [-1.7, 0.95], [-2.1, 0.95], [-2.1, 0.05]], tailUp: 0.4,
  rotorX: 1.99, mastTop: 1.32, skidAt: [3.53, 1.18, 0.95, -1.37],
};
H['bell-206'] = { ...JETRANGER };
H['oh-58a-kiowa'] = { ...JETRANGER, cls: 'heli-scout' };
H['oh-58d'] = {
  ...scaled({ ...JETRANGER, bodies: [{ ...JETRANGER.bodies![0], top: [[2.6, 0.83], [2.2, 1.12], [0.8, 1.12], [-0.5, 0.55]], plan: [[2.6, 0.4], [2.2, 0.52], [0.8, 0.5], [-0.5, 0.22]] }, pod(0.5, 0.0, 1.15, 0.18, 0.26), pod(2.0, 0.9, -0.35, 0.16, 0.16, 1.05), pod(2.3, 0.7, -0.6, 0.12, 0.12, 1.05)] }, 10.48 / 9.5),
  cls: 'heli-scout', length: 10.48, rotor: 10.67, height: 3.93, blades: 4,
  mastDome: true, mastDomeSize: [0.33, 0.33, 0.85],
};

// Hughes OH-6 Cayuse / MD 500 / MH-6 Little Bird: the tall egg-shaped cabin 2 m deep under a short mast, the thin
// boom leaving its upper rear to a fin above and below with the tail rotor on its left; the OH-6 with four blades
// and a stabiliser on the right, the MH-6M with six blades and a T-tail with end plates (fuselage 7.01 m, rotor
// 8.03 m / 8.33 m; stations and depths judged from the public three-views, estimates). AH-6: the planks across the
// cabin with gun and rocket pods.
const EGG: HS = {
  cls: 'heli-scout', length: 7.01, rotor: 8.03, height: 2.48, bodyWidth: 1.6, bodyHeight: 2.0, cabin: 'bubble', blades: 4,
  fuselage: {
    top: [[3.5, -0.15], [3.3, 0.45], [2.9, 0.75], [2.2, 0.95], [1.7, 1.0], [0.1, 1.0], [-0.3, 0.55], [-2.95, 0.32], [-3.3, 0.32]],
    bottom: [[3.5, -0.2], [3.37, -0.72], [2.9, -0.92], [2.15, -1.0], [0.25, -1.0], [-0.22, -0.53], [-0.4, -0.15], [-2.95, 0.13], [-3.3, 0.15]],
    plan: [[3.5, 0.25], [3.2, 0.65], [2.5, 0.8], [1.0, 0.82], [0.0, 0.7], [-0.3, 0.3], [-0.5, 0.12], [-3.3, 0.07]],
    round: 2.2, stations: 22,
  },
  bodies: [pod(1.9, 0.5, 1.0, 0.3, 0.12)],
  glass: [[2.3, 0.15, 1.15, 0.8, 0.82]],
  finPlan: [[-2.76, 0], [-3.24, 0.9], [-3.48, 0.9], [-3.35, -0.85], [-2.95, -0.85]],
  tailRotorSide: -1, tailRotorAt: [-3.1, 0.2], tailRotorDiameter: 1.3, tailBlades: 2,
  tailPlan: [[-2.75, 0.05], [-2.75, 1.0], [-3.2, 1.0], [-3.2, 0.05]], tailUp: 0.32, tailOneSide: 1,
  rotorX: 1.48, mastTop: 1.32, skidAt: [3.46, 1.0, 1.0, -1.38],
};
H['oh-6-cayuse'] = { ...EGG };
const LITTLE_BIRD: HS = {
  ...scaled(EGG, 7.49 / 7.01), cls: 'heli-scout', length: 7.49, rotor: 8.33, blades: 6,
  finPlan: [[-2.95, 0], [-3.45, 1.05], [-3.75, 1.05], [-3.6, -0.85], [-3.15, -0.85]],
  tailPlan: [[-3.4, 0.05], [-3.4, 0.75], [-3.85, 0.75], [-3.85, 0.05]], tailUp: 1.4, tailOneSide: undefined,
  bodies: [...EGG.bodies!, pod(-3.35, -3.9, 1.4, 0.04, 0.22, 0.75, 4)],
};
H['mh-6-little-bird'] = { ...LITTLE_BIRD };
H['ah-6-little-bird'] = { ...LITTLE_BIRD, cls: 'heli-attack', stubs: { span: 3.2, pylons: 1 }, stubAt: [1.3, -0.55, 0] };

// AS350 Ecureuil / Z-11: a big glazed cabin 1.75 m deep, the rotor 3.9 m behind the nose over the cowl with the
// engine behind the gearbox, a thin boom from the upper rear to an end-plated tailplane and the fin with its ventral
// fin, the two-blade tail rotor on the right (as public photos show), skids (fuselage 10.93 m, rotor 10.69 m, 3.14 m;
// judged from public photos, estimates). Z-11WA: outriggers and a roof sight.
const SQUIRREL: HS = {
  cls: 'heli-scout', length: 10.93, rotor: 10.69, height: 3.14, bodyWidth: 1.8, bodyHeight: 1.75, cabin: 'bubble', blades: 3,
  fuselage: {
    top: [[5.465, -0.2], [5.25, 0.35], [4.6, 0.8], [3.9, 0.9], [0.4, 0.9], [-0.5, 0.6], [-1.0, 0.5], [-4.6, 0.55], [-5.2, 0.55]],
    bottom: [[5.465, -0.35], [5.2, -0.7], [4.6, -0.85], [0.8, -0.88], [-0.4, -0.4], [-1.0, 0.15], [-4.6, 0.3], [-5.2, 0.3]],
    plan: [[5.465, 0.3], [5.1, 0.75], [4.3, 0.9], [0.8, 0.9], [-0.4, 0.5], [-1.0, 0.2], [-4.6, 0.12], [-5.2, 0.1]],
    round: [[5.4, 2.4], [3, 3], [-0.5, 2.6], [-5.2, 2.4]], stations: 24,
  },
  bodies: [
    { top: [[2.6, 0.9], [2.3, 1.3], [-0.6, 1.25], [-1.0, 0.75]], bottom: [[2.6, 0.85], [-1.0, 0.6]], plan: [[2.6, 0.4], [2.3, 0.55], [-0.6, 0.5], [-1.0, 0.25]], round: 3, stations: 8 },
    pod(-0.8, -1.3, 0.95, 0.15, 0.18),
    pod(-3.4, -3.9, 0.45, 0.04, 0.28, 0.9, 4),
  ],
  glass: [[4.3, 0.2, 1.05, 0.9, 0.68]],
  finPlan: [[-4.6, -0.6], [-5.46, -0.6], [-5.8, 1.4], [-5.2, 1.45]],
  tailRotorAt: [-5.5, 1.3], tailRotorDiameter: 1.86, tailBlades: 2,
  tailPlan: [[-3.4, 0.05], [-3.4, 0.9], [-3.9, 0.9], [-3.9, 0.05]], tailUp: 0.45,
  rotorX: 1.57, mastTop: 1.6, skidAt: [3.4, 0.9, 1.0, -1.33],
};
H['as350-ecureuil'] = { ...SQUIRREL };
H['z-11'] = { ...SQUIRREL, cls: 'heli-attack', stubs: { span: 3.4, pylons: 1 }, stubAt: [1.5, -0.5, 0], oneSide: [pod(3.4, 2.9, 1.15, 0.2, 0.22, -0.35)] };

// MBB BO 105: a compact pod 1.6 m deep with clamshell doors at the back, the rotor 2.5 m behind the rounded nose, a
// flat engine deck, the boom level with the roof to an end-plated tailplane and a swept fin with the tail rotor at
// its top, skids (fuselage 8.56 m, rotor 9.84 m, 3.0 m; stations and depths judged from the public three-view,
// estimates). PAH-1: three HOT tubes either side on outriggers and the roof sight over the left seat.
const BO105: HS = {
  cls: 'heli-scout', length: 8.56, rotor: 9.84, height: 3.0, bodyWidth: 1.58, bodyHeight: 1.58, cabin: 'bubble', blades: 4,
  fuselage: {
    top: [[4.28, -0.13], [4.0, 0.5], [3.26, 0.79], [0.1, 0.79], [0.0, 0.72], [-2.4, 0.78], [-3.0, 0.78]],
    bottom: [[4.28, -0.3], [4.0, -0.62], [3.7, -0.79], [0.6, -0.79], [0.3, -0.4], [0.0, 0.22], [-2.4, 0.31], [-3.0, 0.33]],
    plan: [[4.28, 0.3], [4.0, 0.65], [3.4, 0.79], [0.6, 0.79], [0.1, 0.45], [0.0, 0.2], [-2.4, 0.18], [-3.0, 0.15]],
    round: [[4.2, 2.4], [2, 3.2], [0.1, 3], [0, 2.6], [-3, 2.6]], stations: 22,
  },
  bodies: [
    { top: [[2.2, 0.79], [2.0, 1.1], [0.75, 1.1], [0.5, 0.79]], bottom: [[2.2, 0.75], [0.5, 0.75]], plan: [[2.2, 0.45], [2.0, 0.55], [0.75, 0.55], [0.5, 0.4]], round: 4, stations: 8 },
    pod(-2.35, -2.95, 0.55, 0.04, 0.28, 1.0, 4),
  ],
  glass: [[3.4, 0.15, 0.85, 0.78, 0.62]],
  finPlan: [[-2.4, 0], [-3.65, 0.85], [-4.28, 0.85], [-3.6, -0.3]],
  tailRotorSide: -1, tailRotorAt: [-4.04, 1.6], tailRotorDiameter: 1.9, tailBlades: 2,
  tailPlan: [[-2.4, 0.05], [-2.4, 1.0], [-2.95, 1.0], [-2.95, 0.05]], tailUp: 0.55,
  rotorX: 1.77, mastTop: 1.65, skidAt: [3.7, 1.22, 0.95, -1.11],
};
H['bo-105'] = { ...BO105 };
H['bo-105-pah1'] = { ...BO105, cls: 'heli-attack', bodies: [...BO105.bodies!, pod(0.9, 0.5, -0.1, 0.05, 0.05, 0.9, 2), ...launchers(1.5, 1.3, 1.05, 0.05, 0.17, 3)], oneSide: [pod(2.8, 2.3, 1.1, 0.2, 0.22, -0.35)] };
// Hkp 9A: the Swedish BO 105 with four TOW tubes.
H['bo-105-tow'] = { ...BO105, cls: 'heli-attack', bodies: [...BO105.bodies!, pod(0.9, 0.5, -0.1, 0.05, 0.05, 0.9, 2), ...launchers(1.5, 1.3, 1.05, 0.05, 0.2, 1, 2)], oneSide: [pod(2.8, 2.3, 1.1, 0.2, 0.22, -0.35)] };

// Westland Lynx AH.1: a boxy cabin 1.9 m deep behind a short, steep nose, the rotor 4.3 m behind the nose over a
// low cowl with the two engines side by side behind it, the boom rising to the fin with the tail rotor on its left
// and the half tailplane on its right, skids (fuselage 12.06 m, rotor 12.8 m, 3.73 m; stations from the public
// dimensioned drawing of the naval Lynx: the roof 2.34 m and the belly 0.46 m over the ground). AH.7: TOW
// launchers on the cabin sides and the roof sight. AH.9 and the naval HAS: wheels; AH.9 with BERP blades.
// AW159 Wildcat: a longer, more pointed nose, the redesigned taller tail with a bigger tail rotor, the sensor ball
// under the nose, wheels, BERP blades (fuselage est 12.5 m).
const LYNX: HS = {
  cls: 'heli-transport', length: 12.06, rotor: 12.8, height: 3.73, bodyWidth: 2.1, bodyHeight: 1.9, cabin: 'cabin', blades: 4,
  fuselage: {
    top: [[6.03, -0.3], [5.85, 0.2], [5.4, 0.55], [4.8, 0.88], [4.2, 0.95], [-0.2, 0.95], [-0.8, 0.9], [-2.0, 0.92], [-5.4, 1.12], [-6.03, 1.15]],
    bottom: [[6.03, -0.4], [5.7, -0.78], [5.0, -0.93], [0.0, -0.95], [-0.8, -0.72], [-2.0, -0.45], [-5.4, 0.2], [-6.03, 0.35]],
    plan: [[6.03, 0.35], [5.7, 0.8], [5.0, 1.0], [0.0, 1.05], [-0.8, 0.8], [-2.0, 0.42], [-5.4, 0.22], [-6.03, 0.2]],
    round: [[6, 3], [4.5, 4], [-0.5, 4], [-2.0, 3], [-6, 2.4]], stations: 24,
  },
  bodies: [
    { top: [[3.0, 0.95], [2.7, 1.25], [-0.4, 1.25], [-1.6, 1.0]], bottom: [[3.0, 0.9], [-1.6, 0.85]], plan: [[3.0, 0.45], [2.7, 0.65], [-0.4, 0.65], [-1.6, 0.4]], round: 3, stations: 8 },
    pod(-1.2, -1.9, 1.0, 0.2, 0.2, 0.35),
  ],
  glass: [[5.0, 0.3, 0.75, 0.95, 0.52]],
  finPlan: [[-5.2, 0], [-6.03, 0], [-6.4, 1.35], [-5.85, 1.4]],
  tailRotorSide: -1, tailRotorAt: [-6.15, 1.6], tailRotorDiameter: 2.21,
  tailPlan: [[-5.9, 0.1], [-6.0, 1.0], [-6.5, 1.0], [-6.5, 0.1]], tailUp: 2.0, tailOneSide: 1,
  rotorX: 1.73, mastTop: 1.65, skidAt: [4.0, 0.3, 1.0, -1.32],
};
const LYNX_WHEELS: Partial<HeliSpec> = { skidAt: undefined, wheelAt: [[3.5, 0.25, -1.2, 0.2], [1.2, 1.39, -1.2, 0.25]] };
H['lynx-ah1'] = { ...LYNX };
H['lynx-ah7'] = { ...LYNX, cls: 'heli-attack', bodies: [...LYNX.bodies!, ...launchers(2.2, 1.3, 1.15, 0.0, 0.2, 2)], oneSide: [pod(4.5, 3.9, 1.15, 0.22, 0.24, -0.35)] };
H['lynx-has'] = { ...LYNX, ...LYNX_WHEELS, sweptTips: true, oneSide: [pod(5.9, 5.0, -1.0, 0.45, 0.2)] };
H['aw159-wildcat'] = {
  ...LYNX, ...LYNX_WHEELS, length: 12.5, sweptTips: true,
  fuselage: { ...LYNX.fuselage!, top: [[6.48, -0.3], [6.2, 0.1], [5.6, 0.45], [4.8, 0.88], [4.2, 0.95], [-0.2, 0.95], [-0.8, 0.9], [-2.0, 0.92], [-5.4, 1.12], [-6.03, 1.15]], bottom: [[6.48, -0.4], [6.0, -0.75], [5.0, -0.93], [0.0, -0.95], [-0.8, -0.72], [-2.0, -0.45], [-5.4, 0.2], [-6.03, 0.35]], plan: [[6.48, 0.25], [6.0, 0.7], [5.0, 1.0], [0.0, 1.05], [-0.8, 0.8], [-2.0, 0.42], [-5.4, 0.22], [-6.03, 0.2]] },
  glass: [[5.15, 0.3, 0.8, 0.95, 0.52]],
  finPlan: [[-5.0, 0], [-6.03, 0], [-6.5, 1.75], [-5.8, 1.85]], tailRotorAt: [-6.2, 1.9], tailRotorDiameter: 2.4,
  tailPlan: [[-5.6, 0.1], [-5.7, 1.1], [-6.2, 1.1], [-6.2, 0.1]], tailUp: 1.45,
  oneSide: [pod(6.2, 5.6, -0.95, 0.27, 0.27)],
};
// Westland Scout / Wasp: a small cabin 1.75 m deep, the rotor 3 m behind the nose, the engine bare under a cowl
// behind it, a deep tapering box boom low on the body to a fin above and below with the tail rotor on its left; the
// Scout on skids, the naval Wasp on four castoring wheels (fuselage 9.24 m, rotor 9.83 m; stations and depths judged
// from the public three-view, estimates).
const SCOUT: HS = {
  cls: 'heli-scout', length: 9.24, rotor: 9.83, height: 2.72, bodyWidth: 1.6, bodyHeight: 1.75, cabin: 'cabin', blades: 4,
  fuselage: {
    top: [[4.62, -0.3], [4.4, 0.3], [3.9, 0.75], [3.4, 0.86], [1.4, 0.86], [0.9, 0.6], [0.3, 0.41], [-2.9, 0.1], [-4.4, 0.05]],
    bottom: [[4.62, -0.45], [4.4, -0.75], [3.8, -0.89], [1.0, -0.89], [0.3, -0.68], [-2.9, -0.25], [-4.4, -0.2]],
    plan: [[4.62, 0.3], [4.3, 0.7], [3.6, 0.8], [1.0, 0.8], [0.3, 0.35], [-2.9, 0.15], [-4.4, 0.12]],
    round: [[4.6, 2.6], [2, 3.2], [0.3, 3], [-4.4, 3]], stations: 22,
  },
  bodies: [pod(1.5, -0.6, 0.65, 0.35, 0.35), pod(-0.5, -0.9, 0.8, 0.15, 0.15)],
  glass: [[3.7, 0.2, 0.8, 0.8, 0.55]],
  finPlan: [[-3.3, 0], [-4.05, 1.6], [-4.55, 1.55], [-4.62, -0.55], [-4.2, -0.55]],
  tailRotorSide: -1, tailRotorAt: [-4.35, 0.86], tailRotorDiameter: 2.29, tailBlades: 2,
  tailPlan: [[-3.2, 0.05], [-3.2, 0.85], [-3.6, 0.85], [-3.6, 0.05]], tailUp: 0.15,
  rotorX: 1.65, mastTop: 1.41, skidAt: [4.0, 0.78, 1.0, -1.16],
};
H['westland-scout'] = { ...SCOUT };
H['westland-wasp'] = { ...SCOUT, skidAt: undefined, wheelAt: [[2.4, 1.1, -1.2, 0.2], [-0.6, 1.1, -1.2, 0.2]] };

// Agusta A109: a sleek cabin 1.55 m deep behind a low pointed nose, the rotor 3.8 m behind it over a raised cowl, a
// long tail cone tapering from the cabin to a swept fin with a ventral fin and the two-blade tail rotor on its left,
// retractable wheels (fuselage 11.45 m, rotor 11.0 m, 3.5 m; stations and depths judged from the public three-view,
// estimates). A109EOA: the armed scout with the roof sight and weapon pylons.
const A109: HS = {
  cls: 'heli-transport', length: 11.45, rotor: 11.0, height: 3.5, bodyWidth: 1.6, bodyHeight: 1.56, cabin: 'cabin', blades: 4,
  fuselage: {
    top: [[5.725, -0.4], [5.3, -0.1], [4.9, 0.0], [4.5, 0.35], [3.5, 0.78], [-0.4, 0.78], [-1.0, 0.74], [-4.9, 0.78], [-5.4, 0.8]],
    bottom: [[5.725, -0.5], [5.2, -0.75], [4.5, -0.8], [-0.4, -0.62], [-1.0, -0.5], [-4.9, 0.25], [-5.4, 0.4]],
    plan: [[5.725, 0.25], [5.2, 0.6], [4.4, 0.78], [0.0, 0.8], [-1.0, 0.6], [-4.9, 0.22], [-5.4, 0.18]],
    round: [[5.7, 2.4], [3, 3], [-1, 2.8], [-5.4, 2.4]], stations: 24,
  },
  bodies: [{ top: [[3.0, 0.78], [2.6, 1.3], [1.0, 1.41], [0.2, 0.9]], bottom: [[3.0, 0.75], [0.2, 0.75]], plan: [[3.0, 0.35], [2.6, 0.5], [1.0, 0.5], [0.2, 0.3]], round: 3, stations: 8 }],
  glass: [[4.4, 0.25, 0.85, 0.78, 0.5]],
  finPlan: [[-4.2, 0], [-5.55, 1.6], [-6.1, 1.6], [-5.725, -0.85], [-5.0, -0.8]],
  tailRotorSide: -1, tailRotorAt: [-5.1, 0.75], tailRotorDiameter: 2.0, tailBlades: 2,
  tailPlan: [[-4.3, 0.1], [-4.4, 1.2], [-4.8, 1.2], [-4.8, 0.1]], tailUp: 0.75,
  rotorX: 1.95, mastTop: 1.8, wheelAt: [[4.2, 0, -1.2, 0.2], [-0.4, 0.95, -1.15, 0.25]],
};
H['a-109'] = { ...A109 };
H['a-109eoa'] = { ...A109, cls: 'heli-attack', stubs: { span: 3.2, pylons: 1 }, stubAt: [1.4, -0.4, 0], oneSide: [pod(3.4, 2.9, 1.05, 0.2, 0.22, -0.3)] };

// ---------------------------------------------------------------- more attack helicopters

// Z-10: a faceted narrow body 2.3 m deep at the raised rear cockpit, the engine nacelles on the shoulders with boxed
// exhausts turned up behind them, the rear fuselage a deep low box to a fin above and below with the stabiliser on
// its top, the sight ball on the roof, stubs, a chin gun (fuselage 14.15 m, rotor 13.0 m, 3.85 m; stations and
// depths judged from public drawings, estimates).
H['z-10'] = {
  cls: 'heli-attack', length: 14.15, rotor: 13.0, height: 3.85, bodyWidth: 1.25, bodyHeight: 2.28, cabin: 'tandem', blades: 5,
  fuselage: {
    top: [[7.075, -0.7], [6.6, -0.2], [5.4, 0.35], [4.2, 0.61], [3.9, 0.7], [3.65, 1.14], [2.4, 1.14], [1.0, 1.0], [-1.0, 0.6], [-4.8, 0.18], [-7.075, 0.2]],
    bottom: [[7.075, -0.75], [5.4, -1.08], [4.6, -1.14], [-1.1, -1.14], [-4.8, -0.79], [-7.075, -0.4]],
    plan: [[7.075, 0.12], [6.4, 0.4], [4.5, 0.58], [2.0, 0.62], [-1.0, 0.55], [-4.8, 0.35], [-7.075, 0.2]],
    round: 6, stations: 26,
  },
  bodies: [
    { top: [[3.0, 1.1], [2.6, 1.58], [1.0, 1.58], [0.4, 1.1]], bottom: [[3.0, 1.0], [0.4, 1.0]], plan: [[3.0, 0.3], [2.6, 0.42], [1.0, 0.42], [0.4, 0.3]], round: 3, stations: 8 },
    { top: [[2.0, 0.9], [1.8, 1.14], [-0.9, 1.14], [-1.0, 0.9]], bottom: [[2.0, 0.5], [1.8, 0.26], [-0.9, 0.26], [-1.0, 0.5]], plan: [[2.0, 0.2], [1.8, 0.3], [-0.9, 0.3], [-1.0, 0.25]], side: 0.62, round: 5, stations: 8 },
    { top: [[-0.7, 1.0], [-0.9, 1.23], [-2.05, 1.15], [-2.1, 0.9]], bottom: [[-0.7, 0.4], [-2.1, 0.75]], plan: [[-0.7, 0.25], [-2.1, 0.22]], side: 0.68, round: 5, stations: 6 },
  ],
  glass: [[4.7, 0.3, 0.6, 0.42, 0.33], [3.05, 0.78, 0.65, 0.44, 0.36]],
  finPlan: [[-4.9, 0], [-6.35, 1.65], [-6.95, 1.65], [-7.075, -0.3], [-6.6, -1.3], [-6.0, -1.2]],
  tailRotorAt: [-6.6, 1.75], tailRotorDiameter: 2.6,
  tailPlan: [[-6.4, 0.1], [-6.5, 1.1], [-7.0, 1.1], [-7.0, 0.1]], tailUp: 1.85,
  oneSide: [pod(7.0, 6.4, -1.15, 0.27, 0.25), pod(3.2, 2.7, 1.45, 0.22, 0.22)], guns: [[6.9, 0, -1.2, 1.3, 0.05]],
  stubs: { span: 4.4, pylons: 2 }, stubAt: [1.7, -0.2, 3],
  rotorX: 1.55, mastTop: 1.74, wheelAt: [[3.2, 0.95, -1.67, 0.3], [-5.47, 0, -1.5, 0.18]],
};
// Z-19: the Dauphin's dynamics under a narrow stepped tandem body 2 m deep, engine nacelles on the shoulders with
// their exhausts behind, the low rear fuselage to the big fenestron fin with a stabiliser and end plates ahead of it,
// stubs; the Z-19 with the radar dome over the rotor, the Z-19E without (est 12.0 m, rotor 11.94 m; stations and
// depths judged from public drawings, estimates).
const Z19: HS = {
  cls: 'heli-attack', length: 12.0, rotor: 11.94, height: 4.0, bodyWidth: 1.15, bodyHeight: 2.0, cabin: 'tandem', blades: 4, tailRotor: 'fenestron',
  fuselage: {
    top: [[6.0, -0.3], [5.6, 0.0], [4.56, 0.14], [3.95, 0.59], [3.7, 0.62], [3.45, 1.0], [2.4, 1.0], [1.0, 0.9], [-0.5, 0.5], [-2.3, 0.14], [-4.2, 0.15], [-5.6, 0.3]],
    bottom: [[6.0, -0.5], [5.0, -0.85], [4.1, -1.0], [-0.1, -1.0], [-3.1, -0.7], [-4.2, -0.65], [-5.6, -0.6]],
    plan: [[6.0, 0.12], [5.5, 0.38], [4.0, 0.52], [2.0, 0.56], [-0.5, 0.5], [-3.0, 0.32], [-5.6, 0.2]],
    round: 4.5, stations: 24,
  },
  bodies: [
    { top: [[2.9, 1.0], [2.6, 1.5], [1.4, 1.5], [1.0, 1.0]], bottom: [[2.9, 0.95], [1.0, 0.95]], plan: [[2.9, 0.28], [2.6, 0.4], [1.4, 0.4], [1.0, 0.28]], round: 3, stations: 8 },
    { top: [[1.6, 0.85], [1.4, 1.12], [-0.6, 1.12], [-0.7, 0.85]], bottom: [[1.6, 0.5], [1.4, 0.3], [-0.6, 0.3], [-0.7, 0.5]], plan: [[1.6, 0.2], [1.4, 0.28], [-0.6, 0.28], [-0.7, 0.22]], side: 0.58, round: 4, stations: 8 },
    { top: [[-0.6, 1.0], [-0.8, 1.1], [-1.9, 0.9], [-1.9, 0.6]], bottom: [[-0.6, 0.35], [-1.9, 0.4]], plan: [[-0.6, 0.22], [-1.9, 0.2]], side: 0.62, round: 4, stations: 6 },
    pod(-2.25, -3.35, -0.2, 0.04, 0.4, 1.0, 4),
  ],
  glass: [[4.25, 0.25, 0.55, 0.4, 0.33], [3.0, 0.68, 0.6, 0.42, 0.35]],
  finPlan: [[-3.7, -0.1], [-5.05, 1.9], [-5.75, 1.95], [-5.9, 0.5], [-5.6, -1.0], [-4.4, -1.2], [-3.75, -0.8]],
  tailPlan: [[-2.3, 0.1], [-2.5, 1.0], [-3.3, 1.0], [-3.3, 0.1]], tailUp: -0.2,
  stubs: { span: 4.0, pylons: 2 }, stubAt: [1.05, -0.1, 0],
  rotorX: 1.29, mastTop: 1.73, wheelAt: [[2.73, 0.9, -1.53, 0.28], [-4.87, 0, -1.28, 0.16]],
};
H['z-19'] = { ...Z19, mastDome: true, mastDomeSize: [0.42, 0.25, 0.55] };
H['z-19e'] = { ...Z19 };
// Kawasaki OH-1: a stepped tandem scout with a fenestron and the sensor ball on the cabin roof ahead of the rotor
// (fuselage 12.0 m, rotor 11.6 m, 3.8 m).
H['oh-1-ninja'] = { ...Z19, cls: 'heli-scout', length: 12.0, rotor: 11.6, height: 3.8, stubs: { span: 3.2, pylons: 1 }, oneSide: [pod(3.0, 2.3, 1.35, 0.32, 0.32)] };

// A129 Mangusta: narrow and stepped, 2 m deep at the raised rear cockpit, the rotor 4.3 m behind the nose over the
// engine nacelles on the shoulders, stubs under the mast, the boom tapering to a swept fin with the two-blade tail
// rotor on its left and the stabiliser low at its foot, the sight box at the nose (fuselage 12.28 m, rotor 11.9 m,
// 3.35 m; stations and depths judged from the public three-view, estimates). A129 CBT: the three-barrel chin
// turret. T129 ATAK: five blades, a longer body, the sight ball on the nose and the chin gun (est 13.0 m).
const MANGUSTA: HS = {
  cls: 'heli-attack', length: 12.28, rotor: 11.9, height: 3.35, bodyWidth: 1.0, bodyHeight: 2.0, cabin: 'tandem', blades: 4,
  fuselage: {
    top: [[6.14, -0.3], [5.6, -0.05], [5.1, 0.05], [4.6, 0.37], [4.0, 0.37], [3.8, 0.75], [3.2, 0.99], [2.6, 0.99], [1.5, 1.0], [-0.2, 0.6], [-1.3, 0.55], [-4.7, 0.42], [-6.14, 0.42]],
    bottom: [[6.14, -0.5], [5.6, -0.85], [4.9, -1.0], [2.5, -1.02], [2.3, -1.0], [-0.5, -0.7], [-4.7, 0.03], [-6.14, 0.1]],
    plan: [[6.14, 0.12], [5.6, 0.32], [4.5, 0.45], [2.0, 0.5], [-0.5, 0.45], [-1.5, 0.3], [-6.14, 0.14]],
    round: [[6.1, 3.5], [2, 4], [-1.5, 3], [-6.1, 2.6]], stations: 24,
  },
  bodies: [
    { top: [[2.0, 0.9], [1.8, 1.25], [-0.6, 1.25], [-0.9, 0.95]], bottom: [[2.0, 0.55], [1.8, 0.29], [-0.6, 0.29], [-0.9, 0.55]], plan: [[2.0, 0.18], [1.8, 0.25], [-0.6, 0.25], [-0.9, 0.18]], side: 0.62, round: 2.6, stations: 8 },
    { top: [[2.6, 1.0], [2.3, 1.35], [0.9, 1.35], [0.5, 1.0]], bottom: [[2.6, 0.95], [0.5, 0.95]], plan: [[2.6, 0.25], [2.3, 0.35], [0.9, 0.35], [0.5, 0.25]], round: 3, stations: 8 },
  ],
  glass: [[4.3, 0.15, 0.45, 0.38, 0.3], [3.2, 0.62, 0.55, 0.4, 0.34]],
  finPlan: [[-4.3, 0], [-5.6, 1.95], [-6.1, 1.9], [-6.14, -0.3]],
  tailRotorSide: -1, tailRotorAt: [-5.82, 1.78], tailRotorDiameter: 2.24, tailBlades: 2,
  tailPlan: [[-4.4, 0.1], [-4.5, 1.3], [-5.0, 1.3], [-5.0, 0.1]], tailUp: 0.2,
  stubs: { span: 3.2, pylons: 2 }, stubAt: [1.75, 0.0, 0],
  oneSide: [pod(6.3, 5.6, -0.35, 0.3, 0.28)],
  rotorX: 1.83, mastTop: 1.6, wheelAt: [[2.75, 0.85, -1.36, 0.28], [-4.64, 0, -0.9, 0.16]],
};
H['a-129-mangusta'] = { ...MANGUSTA };
H['a-129-cbt'] = { ...MANGUSTA, oneSide: [pod(6.3, 5.6, -0.35, 0.3, 0.28), pod(5.6, 5.0, -1.05, 0.26, 0.24)], guns: [[5.3, 0, -1.1, 1.3, 0.05]] };
H['t-129-atak'] = { ...scaled(MANGUSTA, 13.0 / 12.28), cls: 'heli-attack', length: 13.0, blades: 5, oneSide: [pod(6.75, 6.15, 0.05, 0.35, 0.35), pod(6.0, 5.4, -1.02, 0.26, 0.24)], guns: [[5.7, 0, -1.06, 1.3, 0.05]] };
// RAH-66 Comanche: a faceted stealth body with sharp chines, wide and flat under the nose, 2 m deep at the raised
// rear cockpit, the weapons inside, a thick tapering tail to the fantail with a T stabiliser and its end plates on
// top, a chin gun (fuselage 13.2 m, rotor 11.9 m, 3.39 m; judged from public photos, estimates).
H['rah-66-comanche'] = {
  cls: 'heli-attack', length: 13.2, rotor: 11.9, height: 3.39, bodyWidth: 1.7, bodyHeight: 2.0, cabin: 'tandem', blades: 5, tailRotor: 'fenestron',
  fuselage: {
    top: [[6.6, -0.25], [6.0, 0.1], [5.0, 0.38], [4.4, 0.62], [3.9, 0.66], [3.6, 0.98], [2.4, 1.05], [1.0, 1.05], [-0.8, 0.9], [-2.4, 0.5], [-6.6, 0.42]],
    bottom: [[6.6, -0.35], [5.6, -0.75], [4.0, -0.95], [1.0, -0.95], [-1.0, -0.85], [-2.6, -0.3], [-6.6, 0.05]],
    plan: [[6.6, 0.15], [6.0, 0.5], [4.5, 0.78], [2.0, 0.85], [-0.6, 0.8], [-2.6, 0.4], [-6.6, 0.22]],
    round: 8, stations: 24,
  },
  bodies: [pod(-6.0, -6.9, 1.9, 0.05, 0.38, 1.2, 4)],
  glass: [[4.65, 0.3, 0.7, 0.42, 0.34], [3.2, 0.72, 0.75, 0.44, 0.34]],
  finPlan: [[-5.4, -0.5], [-6.6, -0.5], [-7.0, 1.45], [-6.2, 1.5]],
  tailPlan: [[-6.0, 0.1], [-6.1, 1.2], [-6.9, 1.2], [-6.9, 0.1]], tailUp: 1.9,
  guns: [[5.0, 0, -0.95, 1.2, 0.04]],
  rotorX: 1.4, mastTop: 1.75, wheelAt: [[3.0, 0.9, -1.2, 0.26], [-5.2, 0, -0.9, 0.15]],
};
// AH-56 Cheyenne: a compound - stepped tandem seats, a low fixed wing with pylons, a pusher propeller behind the
// tail with the tail rotor on the left, a nose turret and a belly turret (fuselage 16.66 m, rotor 15.62 m, 4.18 m).
H['ah-56-cheyenne'] = {
  cls: 'heli-attack', length: 16.66, rotor: 15.62, height: 4.18, bodyWidth: 1.3, bodyHeight: 1.9, cabin: 'tandem', blades: 4,
  fuselage: { top: [[8.33, -0.2], [7.7, 0.2], [6.4, 0.55], [5.2, 0.8], [3.8, 1.0], [2.0, 1.1], [-0.4, 1.0], [-2.0, 0.6], [-6.8, 0.45], [-8.33, 0.3]], bottom: [[8.33, -0.4], [7.2, -0.8], [2.0, -0.9], [-0.4, -0.85], [-2.4, -0.35], [-6.8, -0.05], [-8.33, 0.05]], plan: [[8.33, 0.12], [7.6, 0.45], [5.0, 0.6], [2.0, 0.65], [-0.4, 0.6], [-2.4, 0.32], [-8.33, 0.15]], round: 3, stations: 24 },
  bodies: [pod(2.8, -0.6, 1.1, 0.4, 0.3)],
  glass: [[5.9, 0.45, 0.85, 0.42, 0.35], [4.2, 0.88, 0.85, 0.42, 0.35]],
  finPlan: [[-6.8, -0.8], [-7.9, -0.8], [-8.3, 1.6], [-7.6, 1.7]],
  tailRotorSide: -1, tailRotorAt: [-7.9, 1.6], tailRotorDiameter: 3.05,
  tailPlan: [[-6.6, 0.1], [-6.7, 1.6], [-7.3, 1.6], [-7.3, 0.1]], tailUp: 0.4,
  pusher: [-8.6, 0.25, 3.05, 3],
  stubs: { span: 8.0, pylons: 3 }, stubAt: [0.6, -0.6, 0],
  oneSide: [pod(1.0, 0.3, -1.05, 0.35, 0.3)], guns: [[8.0, 0, -0.6, 0.9, 0.05], [0.8, 0, -1.1, 1.2, 0.05]],
  rotorX: 1.8, mastTop: 1.9, wheelAt: [[1.6, 1.1, -1.4, 0.32], [-6.0, 0, -0.75, 0.15]],
};

// ---------------------------------------------------------------- piston-engined transports and the Kolibri

// Sikorsky H-34 / S-58: the radial engine in the nose under clamshell doors, the cockpit high above it, a tapering
// boom, the tail rotor on the left, a tail wheel (fuselage 14.25 m, rotor 17.07 m, 4.85 m). Wessex: the turbine nose,
// longer and lower, with its exhausts on the sides (fuselage 14.74 m). Mi-4: the same layout, bigger, on four
// wheels, the navigator's gondola under the cabin (fuselage 16.8 m, rotor 21.0 m, 4.4 m).
const H34: HS = {
  cls: 'heli-transport', length: 14.25, rotor: 17.07, height: 4.85, bodyWidth: 1.75, bodyHeight: 2.4, cabin: 'cabin', blades: 4,
  fuselage: { top: [[7.12, -0.2], [6.9, 0.4], [6.2, 0.8], [5.4, 1.25], [4.4, 1.45], [1.0, 1.35], [-0.6, 1.1], [-2.4, 0.85], [-7.12, 0.95]], bottom: [[7.12, -0.55], [6.6, -0.95], [5.0, -1.05], [-0.6, -1.05], [-1.6, -0.6], [-3.0, 0.1], [-7.12, 0.55]], plan: [[7.12, 0.45], [6.6, 0.75], [5.0, 0.85], [0, 0.85], [-1.2, 0.6], [-3.0, 0.3], [-7.12, 0.2]], round: 3, stations: 24 },
  glass: [[5.4, 1.2, 0.7, 0.75, 0.35]],
  finPlan: [[-6.2, 0], [-7.12, 0], [-7.7, 1.9], [-7.1, 2.0]],
  tailRotorSide: -1, tailRotorAt: [-7.4, 2.4], tailRotorDiameter: 2.9,
  tailPlan: [[-6.6, 0.1], [-6.8, 1.2], [-7.4, 1.2], [-7.4, 0.1]], tailUp: 2.2, tailOneSide: 1,
  rotorX: 1.6, mastTop: 2.5, wheelAt: [[4.4, 1.4, -1.6, 0.35], [-4.6, 0, -1.55, 0.2]],
};
H['h-34'] = { ...H34 };
H['wessex'] = {
  ...H34, length: 14.74, fuselage: { ...H34.fuselage!, top: [[7.37, -0.35], [7.0, 0.1], [6.2, 0.6], [5.4, 1.2], [4.4, 1.45], [1.0, 1.35], [-0.6, 1.1], [-2.4, 0.85], [-7.12, 0.95]], bottom: [[7.37, -0.6], [6.6, -0.95], [5.0, -1.05], [-0.6, -1.05], [-1.6, -0.6], [-3.0, 0.1], [-7.12, 0.55]], plan: [[7.37, 0.35], [6.6, 0.75], [5.0, 0.85], [0, 0.85], [-1.2, 0.6], [-3.0, 0.3], [-7.12, 0.2]] },
  bodies: [pod(6.0, 5.0, 0.1, 0.22, 0.22, 0.9)],
};
H['mi-4'] = {
  ...H34, length: 16.8, rotor: 21.0, height: 4.4, bodyWidth: 1.9, fuselage: stretch(H34.fuselage!, 16.8 / 14.25),
  oneSide: [pod(4.8, 3.4, -1.3, 0.35, 0.3)],
  finPlan: [[-7.3, 0], [-8.4, 0], [-9.0, 2.1], [-8.4, 2.2]], tailRotorSide: 1, tailRotorAt: [-8.7, 2.6], tailRotorDiameter: 3.6, tailBlades: 3,
  tailPlan: [[-7.6, 0.1], [-7.8, 1.3], [-8.4, 1.3], [-8.4, 0.1]], tailUp: 0.9, tailOneSide: undefined,
  rotorX: 1.8, mastTop: 2.6, wheelAt: [[5.0, 0.9, -1.85, 0.3], [0.6, 1.5, -1.85, 0.4]],
};
H['mi-4av'] = { ...H['mi-4'], cls: 'heli-attack', stubs: { span: 4.4, pylons: 2 }, stubAt: [1.0, -0.6, 0] };

// Flettner Fl 282 Kolibri: two intermeshing rotors side by side on splayed masts over an open cockpit, the radial
// engine behind it, a tailplane and fin (fuselage 6.56 m, rotors 11.96 m, 2.2 m).
H['fl-282-kolibri'] = {
  cls: 'heli-scout', length: 6.56, rotor: 11.96, height: 2.2, bodyWidth: 0.9, bodyHeight: 1.3, cabin: 'bubble', blades: 2, tailRotor: 'none', synchropter: 1.2,
  fuselage: { top: [[3.28, -0.2], [3.0, 0.3], [2.4, 0.45], [1.6, 0.6], [0.0, 0.6], [-1.0, 0.35], [-3.28, 0.3]], bottom: [[3.28, -0.4], [2.6, -0.65], [0.0, -0.65], [-1.0, -0.3], [-3.28, 0.05]], plan: [[3.28, 0.15], [2.6, 0.42], [0.0, 0.45], [-1.0, 0.25], [-3.28, 0.08]], round: 2.6, stations: 16 },
  finPlan: [[-2.6, -0.3], [-3.28, -0.3], [-3.5, 0.8], [-3.0, 0.85]],
  rotorX: 0.6, mastTop: 1.1, wheelAt: [[1.6, 0.9, -0.8, 0.25], [-2.8, 0, -0.3, 0.12]],
};

// ---------------------------------------------------------------- War Thunder's remaining helicopters

// H145M: a light twin with a box cabin 1.9 m deep and clamshell doors at the back, a raised deck over the engines
// and the rotor 3.8 m behind the nose, the boom level with the roof to the big fenestron fin with a ventral fin, an
// end-plated tailplane, skids (fuselage 11.64 m, rotor 11.0 m, 3.95 m; proportions judged from the public EC135
// three-view, estimates).
H['h145m'] = {
  cls: 'heli-transport', length: 11.64, rotor: 11.0, height: 3.95, bodyWidth: 1.75, bodyHeight: 1.9, cabin: 'cabin', blades: 4, tailRotor: 'fenestron',
  fuselage: {
    top: [[5.82, -0.1], [5.6, 0.45], [5.0, 0.8], [3.9, 0.94], [-0.7, 0.94], [-3.2, 0.96], [-4.0, 0.96]],
    bottom: [[5.82, -0.3], [5.5, -0.7], [4.8, -0.9], [1.3, -0.96], [-0.7, 0.33], [-3.2, 0.73], [-4.0, 0.75]],
    plan: [[5.82, 0.3], [5.5, 0.7], [4.6, 0.86], [1.3, 0.86], [-0.7, 0.3], [-3.2, 0.18], [-4.0, 0.15]],
    round: [[5.8, 2.4], [3, 3.2], [-0.7, 2.8], [-4, 2.6]], stations: 24,
  },
  bodies: [
    { top: [[3.2, 0.94], [2.8, 1.3], [1.2, 1.45], [-0.7, 0.94]], bottom: [[3.2, 0.9], [-0.7, 0.9]], plan: [[3.2, 0.45], [2.8, 0.65], [1.2, 0.65], [-0.7, 0.35]], round: 3, stations: 8 },
    pod(-3.15, -3.75, 0.75, 0.04, 0.35, 1.05, 4),
  ],
  glass: [[4.7, 0.2, 0.95, 0.86, 0.68]],
  finPlan: [[-3.5, 0], [-4.85, 1.7], [-5.8, 1.7], [-5.85, -0.6], [-5.2, -1.35], [-4.2, -1.2], [-3.6, -0.5]],
  tailPlan: [[-3.2, 0.1], [-3.2, 1.05], [-3.7, 1.05], [-3.7, 0.1]], tailUp: 0.75,
  rotorX: 2.04, mastTop: 2.06, skidAt: [4.4, 1.33, 1.1, -1.27],
};
// Denel Rooivalk: the Puma's dynamics under a big stepped tandem body, the chin gun turret and the nose sight,
// stubs, a tail wheel (fuselage 16.39 m, rotor 15.58 m, 5.19 m).
H['rooivalk'] = {
  cls: 'heli-attack', ...scaled(HAVOC, 16.39 / 17.01), length: 16.39, rotor: 15.58, height: 5.19, blades: 4,
  // The Puma's five-blade tail rotor on the right, the stabiliser high at the fin's top (public photos).
  tailScissor: undefined, tailBlades: 5, tailPlan: [[-7.9, 0.1], [-8.1, 1.5], [-8.6, 1.5], [-8.6, 0.1]], tailUp: 2.5,
  oneSide: [pod(8.5, 7.75, -0.2, 0.34, 0.34), pod(6.0, 5.3, -1.1, 0.3, 0.28)],
  guns: [[5.7, 0, -1.15, 1.6, 0.05]],
  rotorX: 2.3, stubs: { span: 5.2, pylons: 2 }, stubAt: [1.3, 0.1, 4],
  wheelAt: [[5.2, 1.05, -1.55, 0.34], [-7.3, 0, -1.05, 0.2]],
};
// Superhind Mk III: the Mi-24 rebuilt with a 20 mm turret under the nose and four-tube missile launchers outboard.
H['superhind'] = {
  cls: 'heli-attack', ...HIND_BASE, bodies: [...ENGINES_24, EVU, ...launchers(0.9, 1.8, 2.5, 0.0, 0.14, 2, 2)],
  oneSide: [pod(8.55, 7.8, -0.84, 0.28, 0.26)], guns: [[8.2, 0, -0.9, 1.5, 0.05]],
};
// MD 500 Defender with TOW (Lahatut): the egg with five blades and a T-tail, two TOW tubes either side and the mast sight.
H['md-500-tow'] = {
  ...LITTLE_BIRD, cls: 'heli-attack', blades: 5,
  bodies: [...LITTLE_BIRD.bodies!, pod(0.6, 0.2, -0.45, 0.05, 0.05, 0.75, 2), ...launchers(1.1, 1.2, 0.95, -0.25, 0.17, 1, 2)],
  mastDome: true, mastDomeSize: [0.28, 0.28, 0.6],
};

export const HELI_VARIANTS: SpecSet = {
  heli: H,
  // Names in data with no alias elsewhere: War Thunder unit ids (from the public wiki's helicopter tree),
  // Battlefield names, a DCS community type.
  aliases: {
    mi_4av: 'mi-4av',
    h145m: 'h145m',
    super_hind_mk3: 'superhind',
    ah_2_rooivalk: 'rooivalk',
    a_109_eoa2: 'a-109eoa',
    // The A129 International: five blades and the chin gun, the T129's outline.
    a_129_a: 't-129-atak',
    iar_316b: 'alouette-iii',
    hkp3c: 'uh-1b-huey',
    hkp2: 'alouette-ii',
    hkp9a_cb2: 'bo-105-tow',
    hkp9a_cb3_fc: 'bo-105-tow',
    ah_1g_iaf: 'ah-1g-cobra',
    // Tzefa B (AH-1Q) and D/E (AH-1F): the TOW Cobras with the nose sight.
    ah_1q_iaf: 'ah-1s-cobra',
    ah_1f_iaf: 'ah-1s-cobra',
    ah_64a_iaf: 'ah-64a',
    // AHS: the AH-64A Sweden tried in its 1995 attack helicopter competition.
    ahs: 'ah-64a',
    ah_64d_i_saraph: 'ah-64d-no-radar',
    md_500_tow_late: 'md-500-tow',
    'ah-6j little bird': 'ah-6-little-bird',
    'z-11w': 'z-11',
    'uh-60l': 'uh-60a-black-hawk',
  },
};
