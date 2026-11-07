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
import { APACHE, COBRA, HAVOC, HIND, HOKUM, TIGER } from './helis';

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

// ---------------------------------------------------------------- AH-64 Apache

// A: the small avionics bays on the cheeks, no mast radar. D: the bays grown forward (EFAB) and the Longbow
// radar's flat dome over the rotor (4.95 m high with it). E: the D with composite blades with swept tips.
// The tail rotor on the left of the fin, the stabilator at its foot; the M230 under the chin.
const APACHE_A: HeliSpec = {
  ...APACHE,
  bodies: [
    { top: [[3.4, -0.3], [3.0, 0.05], [0, 0.05], [-1, -0.25]], bottom: [[3.4, -0.55], [3.0, -0.85], [0, -0.85], [-1, -0.55]], plan: [[3.4, 0.1], [3.0, 0.3], [0, 0.3], [-1, 0.1]], side: 0.7, round: 6, stations: 8 },
    APACHE.bodies![1],
  ],
  oneSide: [pod(4.35, 3.65, -1.0, 0.3, 0.26)],
  guns: [[4.0, 0, -1.08, 1.7, 0.06]],
  mastTop: 2.15,
  tailRotorSide: -1, tailRotorAt: [-7.85, 2.1], tailRotorDiameter: 2.79,
  tailPlan: [[-7.0, 0.15], [-7.15, 1.7], [-7.9, 1.7], [-7.9, 0.15]], tailUp: 0.6,
  wheels: false, wheelAt: [[3.4, 1.05, -1.3, 0.36], [-6.4, 0, -1.45, 0.2]],
};
const APACHE_D: HeliSpec = {
  ...APACHE_A,
  bodies: [{ top: [[5.0, -0.3], [4.4, 0.1], [0, 0.1], [-1, -0.25]], bottom: [[5.0, -0.5], [4.4, -0.92], [0, -0.92], [-1, -0.55]], plan: [[5.0, 0.12], [4.4, 0.4], [0, 0.42], [-1, 0.12]], side: 0.74, round: 6, stations: 8 }, APACHE.bodies![1]],
  mastDome: true, mastDomeSize: [0.55, 0.28, 0.75],
};
H['ah-64a'] = { cls: 'heli-attack', ...APACHE_A };
H['ah-64d-apache'] = { cls: 'heli-attack', ...APACHE_D };
// AH-64D without the Longbow radar (most D models of other air arms fly without it).
H['ah-64d-no-radar'] = { cls: 'heli-attack', ...APACHE_D, mastDome: false };
H['ah-64e'] = { cls: 'heli-attack', ...APACHE_D, sweptTips: true };

// ---------------------------------------------------------------- AH-1 Cobra

// G: one engine under a small cowl, the curved canopy, the chin turret with a minigun and grenade launcher, two
// blades (fuselage 13.54 m, rotor 13.41 m, 4.12 m). S/F: the flat-plate canopy, the TOW sight ball in the nose,
// TOW launchers outboard, the M197 turret and the upturned exhaust (13.59 m). W: two engines in broad nacelles,
// a longer body and a 14.63 m rotor (13.87 m). Z: four blades (14.88 m), longer stubs with wingtip rails and the
// big TSS sensor ball on the nose (est 13.9 m body).
const cobraFin = (k: number): P2[] => COBRA.finPlan!.map(([x, h]) => [x * k, h] as P2);
const cobraTail = (k: number): Partial<HeliSpec> => ({ tailPlan: [[-3.3 * k, 0.2], [-3.4 * k, 1.1], [-4.0 * k, 1.1], [-4.0 * k, 0.2]], tailUp: 0.45, finPlan: cobraFin(k) });
const ONE_ENGINE: Outline = { top: [[1.6, 0.95], [1.2, 1.3], [-1.4, 1.25], [-2.0, 0.9]], bottom: [[1.6, 0.8], [-2.0, 0.7]], plan: [[1.6, 0.2], [1.2, 0.42], [-1.4, 0.4], [-2.0, 0.2]], round: 3, stations: 8 };
const TWIN_NACELLE: Outline = { top: [[1.4, 0.85], [1.0, 1.3], [-1.8, 1.25], [-2.6, 0.95]], bottom: [[1.4, 0.55], [-2.6, 0.6]], plan: [[1.4, 0.12], [1.0, 0.3], [-1.8, 0.3], [-2.6, 0.12]], side: 0.42, round: 2.6, stations: 8 };

const k1g = 13.54 / 13.9;
H['ah-1g-cobra'] = {
  cls: 'heli-attack', ...COBRA, ...cobraTail(k1g), length: 13.54, rotor: 13.41, height: 4.12, blades: 2,
  fuselage: stretch(COBRA.fuselage!, k1g),
  glass: [[4.75, 0.4, 0.8, 0.34, 0.38], [3.2, 0.7, 0.85, 0.34, 0.4]],
  bodies: [ONE_ENGINE],
  oneSide: [pod(6.0, 5.3, -0.82, 0.3, 0.28)],
  guns: [[5.6, 0.1, -0.85, 0.9, 0.04], [5.6, -0.1, -0.85, 0.5, 0.06]],
  mastTop: 2.3, tailRotorDiameter: 2.59, stubs: { span: 3.15, pylons: 2 }, stubAt: [0.6, -0.1, 0],
  skids: false, skidAt: [3.8, -1.8, 0.95, -1.45],
};
const k1s = 13.59 / 13.9;
const COBRA_S: HeliSpec = {
  ...COBRA, ...cobraTail(k1s), length: 13.59, rotor: 13.41, height: 4.09, blades: 2,
  fuselage: stretch(COBRA.fuselage!, k1s),
  glass: [[4.75, 0.34, 0.82, 0.33, 0.3], [3.2, 0.63, 0.86, 0.33, 0.32]],
  // The engine, the "toilet bowl" exhaust turned up behind it.
  bodies: [ONE_ENGINE, pod(-1.9, -2.7, 1.05, 0.3, 0.32, 0, 2.2), ...launchers(1.7, 1.4, 1.35, -0.25, 0.22, 1, 2)],
  oneSide: [pod(7.15, 6.4, -0.2, 0.33, 0.32), pod(6.0, 5.3, -0.82, 0.3, 0.28)],
  guns: [[5.6, 0, -0.85, 1.5, 0.05]],
  mastTop: 2.3, tailRotorDiameter: 2.59, stubs: { span: 3.15, pylons: 2 }, stubAt: [0.6, -0.1, 0],
  skids: false, skidAt: [3.8, -1.8, 0.95, -1.45],
};
H['ah-1s-cobra'] = { cls: 'heli-attack', ...COBRA_S };
const k1w = 13.87 / 13.9;
H['ah-1w-cobra'] = {
  cls: 'heli-attack', ...COBRA_S, ...cobraTail(k1w), length: 13.87, rotor: 14.63, height: 4.11,
  fuselage: stretch(COBRA.fuselage!, k1w),
  bodies: [TWIN_NACELLE, { ...ONE_ENGINE, plan: [[1.6, 0.15], [1.2, 0.3], [-1.4, 0.3], [-2.0, 0.15]] }, ...launchers(1.7, 1.6, 1.25, -0.35, 0.18, 2, 2)],
  tailRotorDiameter: 2.97, stubs: { span: 3.28, pylons: 2 },
};
H['ah-1z-viper'] = {
  cls: 'heli-attack', ...COBRA_S, ...cobraTail(1), length: 13.9, rotor: 14.88, height: 4.37, blades: 4,
  fuselage: COBRA.fuselage,
  bodies: [{ ...TWIN_NACELLE, top: [[1.6, 0.85], [1.2, 1.35], [-2.0, 1.3], [-2.9, 1.1]], plan: [[1.6, 0.14], [1.2, 0.34], [-2.0, 0.34], [-2.9, 0.18]], side: 0.45 }, ...launchers(1.7, 1.6, 1.25, -0.35, 0.18, 2, 2), pod(1.5, -1.4, -0.2, 0.07, 0.07, 2.2, 2)],
  oneSide: [pod(7.45, 6.55, -0.2, 0.4, 0.4), pod(5.9, 5.2, -0.85, 0.3, 0.28)],
  // est: the four-bladed tail rotor on the left, shared with the UH-1Y.
  tailRotorSide: -1, tailRotorDiameter: 2.9, stubs: { span: 4.4, pylons: 3 }, stubAt: [0.4, -0.05, 0],
};

// ---------------------------------------------------------------- Mi-24 Hind

// A: one large framed "greenhouse" cockpit, a single machine gun in the nose, the tail rotor on the right. D: the
// stepped twin bubbles, the four-barrel USPU-24 under the chin, the tail rotor moved to the left, Falanga rails at
// the wingtips. V: the D with twin Shturm tubes at the tips and the bigger Raduga-Sh sight under the left of the
// nose. P: no chin turret - the twin 30 mm cannon in a fairing on the right of the nose. Mi-35M: short wings
// without tip pylons, fixed gear, the twin 23 mm turret and a FLIR ball (fuselage 17.5 m, rotor 17.3 m).
const HIND_BASE: HeliSpec = {
  ...HIND,
  mastTop: 2.5, wheels: false, wheelAt: [[6.6, 0.3, -1.55, 0.3], [-1.2, 1.25, -1.45, 0.42]],
  tailRotorSide: -1, tailRotorAt: [-8.95, 2.6], tailRotorDiameter: 3.91,
  tailPlan: [[-5.8, 0.2], [-5.9, 1.7], [-6.6, 1.7], [-6.6, 0.2]], tailUp: 0.7,
};
const ENGINES_24 = HIND.bodies!;
// The wingtip launchers: a Falanga rail, or two Shturm tubes.
const FALANGA = pod(1.0, -0.5, -0.85, 0.09, 0.09, 3.3, 2);
const SHTURM = launchers(1.0, 1.8, 3.15, -0.9, 0.15, 2);
const USPU = [pod(8.35, 7.65, -0.78, 0.32, 0.3)];
H['mi-24a-hind'] = {
  cls: 'heli-attack', ...HIND_BASE,
  fuselage: { ...HIND.fuselage!, top: [[8.75, -0.15], [8.45, 0.45], [7.8, 0.92], [7.0, 1.12], [3.0, 1.2], [1.5, 1.4], [-1.5, 1.35], [-2.6, 0.9], [-5.0, 0.6], [-8.75, 0.75]], plan: [[8.75, 0.3], [8.0, 0.68], [6.0, 0.85], [4.0, 0.9], [2.0, 0.95], [-1.5, 0.9], [-2.5, 0.5], [-8.4, 0.3], [-8.75, 0.2]] },
  glass: [[6.4, 0.7, 1.9, 0.7, 0.5]],
  bodies: [...ENGINES_24, FALANGA],
  guns: [[8.5, 0, -0.35, 0.8, 0.04]],
  tailRotorSide: 1,
};
H['mi-24d-hind'] = { cls: 'heli-attack', ...HIND_BASE, bodies: [...ENGINES_24, FALANGA], oneSide: [...USPU, pod(7.4, 6.6, -0.62, 0.15, 0.15, -0.55)], guns: [[8.0, 0, -0.82, 0.9, 0.07]] };
H['mi-24v-hind'] = { cls: 'heli-attack', ...HIND_BASE, bodies: [...ENGINES_24, ...SHTURM], oneSide: [...USPU, pod(7.7, 6.8, -0.78, 0.22, 0.22, -0.52)], guns: [[8.0, 0, -0.82, 0.9, 0.07]] };
H['mi-24p-hind'] = {
  cls: 'heli-attack', ...HIND_BASE, bodies: [...ENGINES_24, ...SHTURM],
  oneSide: [pod(7.6, 4.8, -0.48, 0.2, 0.24, 0.66), pod(7.7, 6.8, -0.78, 0.22, 0.22, -0.52)],
  guns: [[7.4, 0.66, -0.4, 1.0, 0.05], [7.4, 0.7, -0.56, 1.0, 0.05]],
};
H['mi-35m-hind'] = {
  cls: 'heli-attack', ...HIND_BASE, bodies: [...ENGINES_24, ...launchers(0.9, 1.8, 1.65, -0.55, 0.15, 2, 2)],
  oneSide: [pod(8.4, 7.7, -0.8, 0.3, 0.28), pod(7.6, 7.0, -0.62, 0.22, 0.22, -0.45)],
  guns: [[8.0, 0.08, -0.85, 1.0, 0.05], [8.0, -0.08, -0.85, 1.0, 0.05]],
  // est: wings 4.6 m across with two pylons each.
  stubs: { span: 4.6, pylons: 2 }, stubAt: [-0.6, -0.1, 8], wheelAt: [[6.6, 0.32, -1.55, 0.3], [-1.2, 1.3, -1.45, 0.42]], sweptTips: true,
};

// ---------------------------------------------------------------- Mi-8 / Mi-17

// Mi-8T: plain open intakes on the engine cowl, small exhausts, the tail rotor on the right (fuselage 18.17 m,
// rotor 21.29 m, 5.65 m). Mi-8MT / Mi-17: the TV3-117 engines with the domed dust filters ahead of the intakes,
// the exhausts further forward and bigger, the tail rotor on the left. Armed versions carry outriggers with three
// pylons a side.
const HIP: HS = {
  cls: 'heli-transport', length: 18.17, rotor: 21.29, height: 5.65, bodyWidth: 2.5, bodyHeight: 2.6, cabin: 'cabin', blades: 5,
  fuselage: {
    top: [[9.08, -0.3], [8.6, 0.4], [7.8, 0.95], [6.6, 1.25], [5.8, 1.3], [-1.2, 1.3], [-1.8, 1.05], [-3.0, 0.75], [-8.6, 0.95], [-9.08, 1.0]],
    bottom: [[9.08, -0.55], [8.4, -1.1], [7.2, -1.3], [-0.6, -1.3], [-1.4, -1.0], [-2.0, -0.3], [-3.0, 0.25], [-8.6, 0.6], [-9.08, 0.65]],
    plan: [[9.08, 0.3], [8.4, 0.9], [7.4, 1.15], [6.4, 1.2], [-0.8, 1.2], [-1.4, 1.05], [-2.0, 0.6], [-3.0, 0.32], [-8.6, 0.2], [-9.08, 0.18]],
    round: [[9, 2.6], [6, 3.6], [-1, 3.6], [-9, 2.4]], stations: 26,
  },
  // The cowl over both engines and the gearbox, the fuel tanks low on both sides.
  bodies: [{ top: [[6.4, 1.3], [5.8, 2.0], [1.6, 2.15], [0.6, 1.95], [-0.4, 1.3]], bottom: [[6.4, 1.25], [-0.4, 1.25]], plan: [[6.4, 0.35], [5.6, 0.9], [1.0, 0.95], [-0.4, 0.4]], round: 3, stations: 10 }, pod(5.2, 2.2, -0.8, 0.4, 0.45, 1.35, 2.4)],
  glass: [[8.2, 0.55, 0.75, 0.95, 0.5]],
  finPlan: [[-8.2, 0], [-9.08, 0], [-9.6, 2.0], [-9.0, 2.1]],
  tailRotorAt: [-9.35, 2.6], tailRotorDiameter: 3.91,
  tailPlan: [[-7.3, 0.15], [-7.4, 1.4], [-8.0, 1.4], [-8.0, 0.15]], tailUp: 0.7,
  rotorX: 2.0, mastTop: 3.4, wheelAt: [[7.2, 0.35, -1.55, 0.3], [0.6, 1.6, -1.4, 0.45]],
};
const MI8T: HS = { ...HIP, bodies: [...HIP.bodies!, pod(1.6, 0.9, 1.65, 0.2, 0.2, 0.9)] };
const MI17: HS = { ...HIP, bodies: [...HIP.bodies!, pod(7.3, 6.2, 1.75, 0.38, 0.38, 0.45, 2.2), pod(3.4, 2.2, 1.6, 0.26, 0.26, 1.0)], tailRotorSide: -1 };
const HIP_STUBS: Partial<HeliSpec> = { stubs: { span: 5.4, pylons: 3 }, stubAt: [3.4, -0.25, 0] };
H['mi-8t'] = { ...MI8T, cls: 'heli-transport' };
H['mi-8-salon'] = { ...MI8T, cls: 'heli-transport' };
H['mi-8tv'] = { ...MI8T, cls: 'heli-transport', ...HIP_STUBS };
H['mi-8mtv2'] = { ...MI17, cls: 'heli-transport', ...HIP_STUBS };
H['mi-17'] = { ...MI17, cls: 'heli-transport' };
// Mi-8AMTSh: the Mi-17 with outriggers, an armoured cockpit and a radar thimble in the nose.
H['mi-8amtsh'] = { ...MI17, cls: 'heli-transport', ...HIP_STUBS, oneSide: [pod(9.5, 8.6, -0.35, 0.35, 0.35)] };

// ---------------------------------------------------------------- UH-1 Huey

// UH-1H: the long cabin, the small swept fin with the tail rotor on the left, the elevator half way along the boom
// (fuselage 12.77 m, rotor 14.63 m, 4.39 m). UH-1B: the short cabin and 13.41 m rotor (fuselage 12.08 m), often
// with side-mounted guns and rockets. UH-1N: the H with the twin-pac's broad cowl. UH-1Y: four blades, a longer
// cabin and bigger cowl, a FLIR ball under the nose (fuselage est 13.4 m, rotor 14.88 m).
function huey(L: number, cabinBack: number, cowl: number): Outline[] {
  const h = L / 2;
  return [
    {
      top: [[h, -0.2], [h - 0.4, 0.45], [h - 1.2, 0.95], [h - 2.0, 1.1], [cabinBack, 1.1], [cabinBack - 0.6, 0.75], [cabinBack - 1.8, 0.5], [-h, 0.45]],
      bottom: [[h, -0.35], [h - 0.5, -0.8], [h - 1.4, -1.0], [cabinBack, -1.0], [cabinBack - 0.6, -0.4], [cabinBack - 1.8, 0.05], [-h, 0.15]],
      plan: [[h, 0.3], [h - 0.5, 0.95], [h - 1.4, 1.25], [h - 2.2, 1.3], [cabinBack, 1.3], [cabinBack - 0.6, 0.75], [cabinBack - 1.8, 0.3], [-h, 0.18]],
      round: [[h, 3], [h - 2, 4], [cabinBack, 4], [-h, 2.4]], stations: 24,
    },
    { top: [[2.6, 1.1], [2.2, 1.65], [-1.2, 1.6], [-2.0, 1.0]], bottom: [[2.6, 1.05], [-2.0, 0.8]], plan: [[2.6, 0.35], [2.2, cowl], [-1.2, cowl * 0.92], [-2.0, 0.25]], round: 3, stations: 8 },
  ];
}
const HUEY: HS = {
  cls: 'heli-transport', length: 12.77, rotor: 14.63, height: 4.39, bodyWidth: 2.6, bodyHeight: 2.1, cabin: 'cabin', blades: 2,
  fuselage: huey(12.77, -0.6, 0.6)[0], bodies: [huey(12.77, -0.6, 0.6)[1]],
  glass: [[5.5, 0.35, 0.7, 1.1, 0.6]],
  finPlan: [[-5.6, 0], [-6.385, 0], [-7.0, 1.9], [-6.4, 1.95]],
  tailRotorSide: -1, tailRotorAt: [-6.75, 1.85], tailRotorDiameter: 2.59,
  tailPlan: [[-3.2, 0.2], [-3.3, 1.4], [-3.8, 1.4], [-3.8, 0.2]], tailUp: 0.4,
  rotorX: 0.6, mastTop: 2.55, skidAt: [4.4, -1.6, 1.2, -1.55],
};
H['uh-1h-huey'] = { ...HUEY };
const B_BODY = huey(12.08, -0.1, 0.55);
H['uh-1b-huey'] = {
  ...HUEY, length: 12.08, rotor: 13.41, fuselage: B_BODY[0], bodies: [B_BODY[1], ...launchers(1.6, 1.4, 1.45, -0.55, 0.3, 1), pod(1.8, 0.4, -0.15, 0.06, 0.06, 1.35, 2)],
  finPlan: [[-5.3, 0], [-6.04, 0], [-6.6, 1.8], [-6.0, 1.85]], tailRotorAt: [-6.35, 1.8], skidAt: [4.1, -1.4, 1.2, -1.55],
};
H['uh-1n-twin-huey'] = { ...HUEY, bodies: [huey(12.77, -0.6, 0.78)[1], pod(-1.8, -2.6, 1.15, 0.22, 0.2, 0.42)] };
const Y_BODY = huey(13.4, -0.8, 0.72);
H['uh-1y-venom'] = {
  ...HUEY, length: 13.4, rotor: 14.88, height: 4.5, blades: 4, fuselage: Y_BODY[0], bodies: [Y_BODY[1]],
  oneSide: [pod(6.9, 6.3, -0.75, 0.3, 0.3)],
  finPlan: [[-5.9, 0], [-6.7, 0], [-7.3, 1.95], [-6.7, 2.0]], tailRotorAt: [-7.05, 1.9], tailRotorDiameter: 2.9, skidAt: [4.6, -1.7, 1.25, -1.55],
};

// ---------------------------------------------------------------- UH-60 Black Hawk family

// UH-60A/L: the long cabin, two engine nacelles beside the gearbox, the canted tail rotor on the right high on the
// swept tail pylon, the big stabilator at its foot, the main wheels under the cockpit and a tail wheel far back
// (fuselage 15.26 m, rotor 16.36 m, 5.13 m). HH-60: the refuelling probe on the right of the nose. SH-60B / MH-60R
// Seahawk: the twin tail wheel moved forward under the cabin's end, a radome under the nose, short weapon pylons;
// the R with a FLIR ball under the chin.
const HAWK: HS = {
  cls: 'heli-transport', length: 15.26, rotor: 16.36, height: 5.13, bodyWidth: 2.36, bodyHeight: 2.15, cabin: 'cabin', blades: 4,
  fuselage: {
    top: [[7.63, -0.3], [7.2, 0.2], [6.3, 0.7], [5.2, 1.05], [4.6, 1.1], [0.0, 1.1], [-1.2, 0.95], [-3.0, 0.6], [-6.6, 0.55], [-7.63, 0.6]],
    bottom: [[7.63, -0.4], [7.0, -0.9], [6.0, -1.05], [-0.6, -1.05], [-1.6, -0.7], [-3.0, -0.2], [-6.6, 0.1], [-7.63, 0.2]],
    plan: [[7.63, 0.15], [7.0, 0.7], [5.8, 1.0], [4.8, 1.1], [-0.6, 1.1], [-1.6, 0.8], [-3.0, 0.4], [-7.0, 0.25], [-7.63, 0.22]],
    round: [[7.6, 2.6], [5, 4], [-1, 4], [-7.6, 2.6]], stations: 26,
  },
  bodies: [
    { top: [[2.6, 1.1], [2.2, 1.65], [-1.4, 1.6], [-2.0, 1.2]], bottom: [[2.6, 1.0], [-2.0, 1.0]], plan: [[2.6, 0.2], [2.2, 0.38], [-1.4, 0.36], [-2.0, 0.15]], side: 0.75, round: 2.6, stations: 8 },
    { top: [[3.6, 1.1], [3.0, 1.6], [0.6, 1.65], [-0.2, 1.2]], bottom: [[3.6, 1.05], [-0.2, 1.05]], plan: [[3.6, 0.3], [3.0, 0.45], [0.6, 0.45], [-0.2, 0.25]], round: 3, stations: 8 },
  ],
  glass: [[6.3, 0.3, 0.8, 0.95, 0.55]],
  finPlan: [[-6.4, 0], [-7.63, 0], [-8.5, 2.3], [-7.8, 2.4]],
  tailRotorAt: [-8.15, 2.2], tailRotorDiameter: 3.35,
  tailPlan: [[-7.0, 0.15], [-7.1, 2.19], [-7.9, 2.19], [-7.9, 0.15]], tailUp: 0.7,
  rotorX: 1.0, mastTop: 2.9, wheelAt: [[4.0, 1.4, -1.45, 0.35], [-5.4, 0, -1.55, 0.22]],
};
H['uh-60a-black-hawk'] = { ...HAWK };
// The ESSS stub wings with their pods.
H['mh-60l-dap'] = { ...HAWK, cls: 'heli-attack', stubs: { span: 6.4, pylons: 2 }, stubAt: [3.0, 0.9, 10] };
H['hh-60g-pave-hawk'] = { ...HAWK, oneSide: [pod(11.0, 4.6, 0.25, 0.08, 0.08, 0.85, 2)] };
const SEAHAWK: HS = {
  ...HAWK, cls: 'heli-transport', wheelAt: [[4.0, 1.4, -1.45, 0.35], [-1.5, 0.3, -1.6, 0.22]],
  bodies: [...HAWK.bodies!, pod(1.4, 0.2, -0.65, 0.12, 0.1, 1.55, 2)],
  oneSide: [pod(5.2, 3.6, -1.1, 0.55, 0.22)],
};
H['sh-60b'] = { ...SEAHAWK, oneSide: [pod(5.2, 3.6, -1.1, 0.55, 0.22), pod(0.8, -0.6, 0.2, 0.12, 0.12, 1.75, 2)] };
H['mh-60r'] = { ...SEAHAWK, oneSide: [pod(2.0, 0.4, -1.12, 0.5, 0.2), pod(7.2, 6.6, -0.7, 0.28, 0.28)] };

// ---------------------------------------------------------------- Ka-50 / Ka-52

// Ka-50: one seat behind the flat Shkval window, the 30 mm cannon on the right side under the wing. Ka-52: two seats
// side by side in a broad glazed cabin, the radar in a rounded nose, sensor balls above and under it.
const HOKUM2: HeliSpec = { ...HOKUM, mastTop: 1.9, coaxGap: 1.3, oneSide: [pod(2.7, 0.6, -0.6, 0.2, 0.2, 0.68)], guns: [[2.6, 0.68, -0.6, 1.6, 0.05]], wheels: false, wheelAt: [[4.6, 0.3, -1.25, 0.28], [-0.6, 1.0, -1.15, 0.38]] };
H['ka-50'] = { cls: 'heli-attack', ...HOKUM2 };
H['ka-52'] = {
  cls: 'heli-attack', ...HOKUM2, length: 13.53,
  fuselage: { ...HOKUM.fuselage!, top: [[6.77, -0.15], [6.3, 0.35], [5.4, 0.75], [4.0, 1.0], [1.0, 1.1], [-1.0, 0.95], [-2.5, 0.5], [-6.75, 0.4]], bottom: [[6.77, -0.4], [6.2, -0.8], [5.0, -0.95], [2, -0.95], [-1, -0.85], [-2.6, -0.3], [-6.75, 0.1]], plan: [[6.77, 0.3], [6.3, 0.7], [5.2, 0.9], [4.0, 0.95], [1.5, 0.82], [-1.0, 0.6], [-2.5, 0.3], [-6.75, 0.2]], round: [[6.7, 3], [4, 4], [-6.7, 3]] },
  glass: [[4.3, 0.75, 1.1, 0.88, 0.42]],
  oneSide: [pod(2.7, 0.6, -0.6, 0.2, 0.2, 0.68), pod(5.9, 5.2, -1.05, 0.33, 0.33), pod(5.9, 5.3, 0.95, 0.28, 0.28)],
};

// ---------------------------------------------------------------- Tiger

// HAP / HAD: the roof sight above the cabin, a 30 mm gun turret under the chin. UHT: the mast-mounted sight and no
// gun. Both: the end-plated tailplane, the tail rotor on the right (est).
const TIGER2: HeliSpec = {
  ...TIGER, mastTop: 1.85, wheels: false, wheelAt: [[3.8, 0.85, -1.25, 0.3], [-5.6, 0, -0.95, 0.18]],
  tailPlan: [[-6.0, 0.1], [-6.0, 1.2], [-6.6, 1.2], [-6.6, 0.1]], tailUp: 0.5,
  bodies: [...TIGER.bodies!, pod(-5.9, -6.7, 0.6, 0.05, 0.35, 1.22, 4)],
  tailRotorDiameter: 2.7,
};
H['tiger-hap'] = { cls: 'heli-attack', ...TIGER2, oneSide: [pod(4.4, 3.8, 1.25, 0.24, 0.24), pod(5.9, 5.3, -0.95, 0.25, 0.22)], guns: [[5.6, 0, -1.0, 1.4, 0.05]] };
H['tiger-uht'] = { cls: 'heli-attack', ...TIGER2, mastDome: true, mastDomeSize: [0.38, 0.32, 0.6], bodies: [...TIGER2.bodies!, ...launchers(0.8, 1.3, 1.55, -0.35, 0.18, 2, 2)] };

// ---------------------------------------------------------------- Gazelle and Alouette

// SA 341/342 Gazelle: the round glass cabin, the engine fairing behind it, a thin boom to the fenestron in its fin,
// a small end-plated tailplane, skids (fuselage 9.53 m, rotor 10.5 m, 3.19 m). 342M: HOT tubes on outriggers and the
// roof sight over the left seat; 342L: the 20 mm cannon on the right; Mistral: two missiles each side on the beam.
const GAZELLE: HS = {
  cls: 'heli-scout', length: 9.53, rotor: 10.5, height: 3.19, bodyWidth: 1.7, bodyHeight: 1.8, cabin: 'bubble', blades: 3, tailRotor: 'fenestron',
  fuselage: { top: [[4.77, -0.2], [4.5, 0.35], [3.8, 0.8], [2.8, 0.95], [1.0, 0.95], [0.0, 0.75], [-0.8, 0.45], [-3.6, 0.35], [-4.77, 0.4]], bottom: [[4.77, -0.35], [4.3, -0.75], [3.2, -0.85], [0.6, -0.85], [-0.4, -0.4], [-1.0, 0.0], [-3.6, 0.05], [-4.77, 0.1]], plan: [[4.77, 0.2], [4.3, 0.7], [3.4, 0.85], [1.2, 0.85], [0.2, 0.6], [-0.8, 0.3], [-3.6, 0.18], [-4.77, 0.15]], round: [[4.7, 2.2], [2, 3], [-4.7, 2.4]], stations: 22 },
  bodies: [{ top: [[1.8, 0.95], [1.5, 1.35], [-1.0, 1.3], [-1.6, 0.8]], bottom: [[1.8, 0.9], [-1.6, 0.6]], plan: [[1.8, 0.25], [1.4, 0.5], [-1.0, 0.45], [-1.6, 0.2]], round: 3, stations: 8 }, pod(-3.0, -3.5, 0.45, 0.04, 0.3, 0.95, 4)],
  glass: [[3.7, 0.15, 1.05, 0.82, 0.75]],
  finPlan: [[-3.7, -0.6], [-4.77, -0.6], [-5.0, 1.4], [-4.3, 1.4]],
  tailPlan: [[-3.0, 0.1], [-3.0, 0.95], [-3.5, 0.95], [-3.5, 0.1]], tailUp: 0.4,
  rotorX: 0.4, mastTop: 1.65, skidAt: [2.6, -1.0, 0.95, -1.35],
};
const BEAM = pod(1.0, 0.6, -0.05, 0.05, 0.05, 0.95, 2);
H['sa-342-gazelle'] = { ...GAZELLE };
H['sa-342m'] = { ...GAZELLE, cls: 'heli-attack', bodies: [...GAZELLE.bodies!, BEAM, ...launchers(1.5, 1.3, 1.15, 0.0, 0.18, 2)], oneSide: [pod(3.1, 2.6, 1.15, 0.18, 0.2, -0.35)] };
H['sa-342l'] = { ...GAZELLE, cls: 'heli-attack', oneSide: [pod(1.6, 0.0, -0.55, 0.12, 0.12, 1.0)], guns: [[1.6, 1.0, -0.55, 1.0, 0.03]] };
H['sa-342-mistral'] = { ...GAZELLE, cls: 'heli-attack', bodies: [...GAZELLE.bodies!, BEAM, ...launchers(1.2, 1.8, 1.0, 0.2, 0.1, 2)] };
H['sa-342-minigun'] = { ...GAZELLE, cls: 'heli-attack', oneSide: [pod(2.4, 1.8, -0.3, 0.12, 0.12, -0.95)], guns: [[2.2, -0.95, -0.3, 0.7, 0.04]] };

// SA 313B Alouette II: the glass bubble, the bare engine behind it and the open lattice boom (drawn solid) tapering to a
// small fin (fuselage 9.66 m, rotor 10.2 m, 2.75 m). SA 316B Alouette III: an enclosed cabin and boom, the engine
// bare on top, fixed tricycle wheels, the tail rotor on the left (est) (fuselage 10.03 m, rotor 11.02 m, 3.0 m).
H['alouette-ii'] = {
  cls: 'heli-scout', length: 9.66, rotor: 10.2, height: 2.75, bodyWidth: 1.65, bodyHeight: 1.6, cabin: 'bubble', blades: 3,
  fuselage: { top: [[4.83, -0.1], [4.5, 0.4], [3.8, 0.75], [2.8, 0.8], [2.0, 0.6], [1.6, 0.5], [-0.2, 0.45], [-4.83, 0.25]], bottom: [[4.83, -0.35], [4.3, -0.7], [3.2, -0.8], [2.0, -0.75], [1.6, -0.4], [-0.2, -0.3], [-4.83, 0.05]], plan: [[4.83, 0.2], [4.3, 0.7], [3.4, 0.82], [2.2, 0.75], [1.6, 0.3], [-0.2, 0.28], [-4.83, 0.08]], round: [[4.8, 2.2], [2, 2.4], [1.6, 6], [-4.8, 6]], stations: 20 },
  bodies: [pod(1.2, -0.6, 0.75, 0.3, 0.25)],
  glass: [[3.6, 0.05, 1.25, 0.8, 0.78]],
  finPlan: [[-4.3, -0.2], [-4.9, -0.2], [-5.0, 0.5], [-4.6, 0.5]],
  tailRotorAt: [-4.85, 0.35], tailRotorDiameter: 1.8,
  tailPlan: [[-4.1, 0.05], [-4.1, 0.7], [-4.5, 0.7], [-4.5, 0.05]], tailUp: 0.25,
  rotorX: 1.0, mastTop: 1.45, skidAt: [3.0, -0.6, 0.95, -1.15],
};
H['alouette-iii'] = {
  cls: 'heli-transport', length: 10.03, rotor: 11.02, height: 3.0, bodyWidth: 1.75, bodyHeight: 1.8, cabin: 'cabin', blades: 3,
  fuselage: { top: [[5.0, -0.2], [4.7, 0.45], [4.0, 0.85], [3.0, 0.95], [0.6, 0.95], [0.0, 0.7], [-1.2, 0.4], [-5.0, 0.3]], bottom: [[5.0, -0.4], [4.5, -0.8], [3.5, -0.9], [0.4, -0.9], [-0.6, -0.4], [-1.4, 0.0], [-5.0, 0.1]], plan: [[5.0, 0.25], [4.5, 0.75], [3.6, 0.88], [0.4, 0.88], [-0.6, 0.5], [-1.4, 0.22], [-5.0, 0.12]], round: [[5, 2.4], [2, 3.4], [-5, 2.4]], stations: 22 },
  bodies: [pod(0.4, -1.2, 1.15, 0.3, 0.25), pod(1.6, 0.4, 1.1, 0.35, 0.2), pod(-3.6, -4.0, 0.35, 0.04, 0.3, 1.0, 4)],
  glass: [[3.9, 0.1, 1.1, 0.85, 0.8]],
  finPlan: [[-4.4, -0.5], [-5.0, -0.5], [-5.2, 0.6], [-4.7, 0.6]],
  tailRotorSide: -1, tailRotorAt: [-5.0, 0.4], tailRotorDiameter: 1.91,
  tailPlan: [[-3.6, 0.05], [-3.6, 1.0], [-4.0, 1.0], [-4.0, 0.05]], tailUp: 0.3,
  rotorX: 1.0, mastTop: 1.7, wheelAt: [[4.0, 0, -1.25, 0.22], [-0.2, 1.15, -1.2, 0.27]],
};

// ---------------------------------------------------------------- Puma, Super Frelon, Sea King, Merlin, NH90

// SA 330 Puma: the engines in a long fairing ahead of the rotor, sponsons with the main wheels, the boom rising to
// the fin (fuselage 14.06 m, rotor 15.0 m, 5.14 m).
H['sa-330-puma'] = {
  cls: 'heli-transport', length: 14.06, rotor: 15.0, height: 5.14, bodyWidth: 2.3, bodyHeight: 2.2, cabin: 'cabin', blades: 4,
  fuselage: { top: [[7.03, -0.35], [6.6, 0.35], [5.7, 0.9], [4.8, 1.05], [-0.6, 1.05], [-1.6, 0.8], [-3.2, 0.55], [-7.03, 0.65]], bottom: [[7.03, -0.5], [6.4, -1.0], [5.4, -1.1], [-1.0, -1.1], [-2.0, -0.6], [-3.2, -0.05], [-7.03, 0.35]], plan: [[7.03, 0.3], [6.4, 0.85], [5.4, 1.0], [-1.0, 1.0], [-2.0, 0.65], [-3.2, 0.32], [-7.03, 0.2]], round: [[7, 2.6], [4, 3.6], [-7, 2.4]], stations: 24 },
  bodies: [pod(4.2, -0.8, 1.4, 0.75, 0.4), pod(1.2, -1.2, -0.75, 0.3, 0.32, 1.25)],
  glass: [[5.9, 0.35, 0.8, 0.85, 0.5]],
  finPlan: [[-5.9, 0], [-7.03, 0], [-7.6, 2.0], [-7.0, 2.1]],
  tailRotorAt: [-7.3, 2.2], tailRotorDiameter: 3.04,
  tailPlan: [[-6.2, 0.1], [-6.3, 0.9], [-6.8, 0.9], [-6.8, 0.1]], tailUp: 0.7,
  rotorX: 0.8, mastTop: 2.5, wheelAt: [[5.2, 0.3, -1.45, 0.25], [-0.1, 1.3, -1.4, 0.3]],
};
// SA 321 Super Frelon / Z-8: a long boat hull, three engines on top, sponsons, the tail rotor high on the fin
// (fuselage 19.4 m, rotor 18.9 m, 6.66 m).
H['z-8-super-frelon'] = {
  cls: 'heli-transport', length: 19.4, rotor: 18.9, height: 6.66, bodyWidth: 2.4, bodyHeight: 2.6, cabin: 'cabin', blades: 6,
  fuselage: { top: [[9.7, -0.4], [9.2, 0.4], [8.2, 1.05], [7.2, 1.3], [-2.4, 1.3], [-3.8, 1.0], [-6.0, 0.8], [-9.7, 1.0]], bottom: [[9.7, -0.7], [9.0, -1.2], [7.6, -1.3], [-3.0, -1.3], [-4.6, -0.5], [-6.4, 0.2], [-9.7, 0.6]], plan: [[9.7, 0.3], [9.0, 0.95], [7.6, 1.2], [-3.0, 1.2], [-4.6, 0.7], [-6.4, 0.35], [-9.7, 0.22]], round: [[9.6, 2.6], [4, 3.2], [-9.6, 2.4]], stations: 26 },
  bodies: [pod(6.4, -0.4, 1.7, 0.85, 0.45), pod(2.0, -0.8, -0.85, 0.4, 0.38, 1.55)],
  glass: [[8.3, 0.5, 0.8, 0.95, 0.5]],
  finPlan: [[-8.4, 0], [-9.7, 0], [-10.4, 2.4], [-9.7, 2.5]],
  tailRotorAt: [-10.05, 2.9], tailRotorDiameter: 4.0,
  tailPlan: [[-8.6, 0.1], [-8.8, 1.4], [-9.4, 1.4], [-9.4, 0.1]], tailUp: 2.4, tailOneSide: 1,
  rotorX: 1.2, mastTop: 2.75, wheelAt: [[7.4, 0.35, -1.65, 0.3], [0.6, 1.6, -1.6, 0.38]],
};
// SH-3 / S-61 Sea King: the boat hull with float sponsons carrying the main wheels, engines on top ahead of the rotor,
// the tail rotor on the left high on the fin and a small stabiliser on the right (fuselage 16.69 m, rotor 18.9 m, 5.13 m).
H['sh-3-sea-king'] = {
  cls: 'heli-transport', length: 16.69, rotor: 18.9, height: 5.13, bodyWidth: 2.2, bodyHeight: 2.4, cabin: 'cabin', blades: 5,
  fuselage: { top: [[8.35, -0.3], [7.9, 0.35], [7.0, 0.9], [6.0, 1.15], [-1.8, 1.15], [-3.0, 0.95], [-4.8, 0.75], [-8.35, 0.9]], bottom: [[8.35, -0.6], [7.6, -1.1], [6.4, -1.25], [-2.4, -1.25], [-4.0, -0.5], [-5.6, 0.15], [-8.35, 0.5]], plan: [[8.35, 0.3], [7.6, 0.85], [6.4, 1.0], [-2.4, 1.0], [-4.0, 0.6], [-5.6, 0.32], [-8.35, 0.22]], round: [[8, 2.6], [4, 3], [-8, 2.4]], stations: 24 },
  bodies: [pod(5.6, 1.0, 1.55, 0.7, 0.42), pod(1.6, -1.0, -0.85, 0.35, 0.35, 1.55)],
  glass: [[7.1, 0.45, 0.8, 0.85, 0.45]],
  finPlan: [[-7.0, 0], [-8.35, 0], [-9.0, 2.2], [-8.3, 2.3]],
  tailRotorSide: -1, tailRotorAt: [-8.7, 2.6], tailRotorDiameter: 3.23,
  tailPlan: [[-8.2, 0.1], [-8.4, 1.6], [-9.0, 1.6], [-9.0, 0.1]], tailUp: 2.6, tailOneSide: 1,
  rotorX: 1.3, mastTop: 2.6, wheelAt: [[0.2, 1.6, -1.55, 0.35], [-6.0, 0, -1.6, 0.2]],
};
// AW101 Merlin: three engines on top, sponsons, BERP-tipped blades, the tail rotor on the left and the tailplane high
// on the right (fuselage 19.53 m, rotor 18.59 m, 6.62 m).
H['aw101-merlin'] = {
  cls: 'heli-transport', length: 19.53, rotor: 18.59, height: 6.62, bodyWidth: 2.5, bodyHeight: 2.6, cabin: 'cabin', blades: 5, sweptTips: true,
  fuselage: { top: [[9.76, -0.4], [9.3, 0.35], [8.4, 1.0], [7.4, 1.25], [-1.6, 1.25], [-3.0, 1.0], [-5.0, 0.8], [-9.76, 0.95]], bottom: [[9.76, -0.55], [9.1, -1.15], [8.0, -1.3], [-2.0, -1.3], [-3.6, -0.5], [-5.4, 0.25], [-9.76, 0.55]], plan: [[9.76, 0.35], [9.1, 0.95], [8.0, 1.15], [-2.0, 1.2], [-3.6, 0.8], [-5.4, 0.4], [-9.76, 0.25]], round: [[9.7, 2.6], [4, 3.6], [-9.7, 2.4]], stations: 26 },
  bodies: [pod(6.0, -0.6, 1.65, 0.85, 0.42), pod(2.0, -1.4, -0.8, 0.35, 0.38, 1.45)],
  glass: [[8.4, 0.5, 0.8, 0.95, 0.5]],
  finPlan: [[-8.2, 0], [-9.76, 0], [-10.4, 2.6], [-9.7, 2.7]],
  tailRotorSide: -1, tailRotorAt: [-10.05, 3.0], tailRotorDiameter: 4.0,
  tailPlan: [[-9.9, 0.1], [-10.1, 1.6], [-10.6, 1.6], [-10.6, 0.1]], tailUp: 2.9, tailOneSide: 1,
  rotorX: 1.4, mastTop: 2.75, wheelAt: [[8.0, 0.3, -1.65, 0.3], [-0.2, 1.5, -1.6, 0.38]],
};
// NH90: a smooth composite body, sponsons, the tail rotor on the left and the stabiliser on the right (est)
// (fuselage 16.13 m, rotor 16.3 m, 5.23 m).
H['nh90'] = {
  cls: 'heli-transport', length: 16.13, rotor: 16.3, height: 5.23, bodyWidth: 2.4, bodyHeight: 2.3, cabin: 'cabin', blades: 4,
  fuselage: { top: [[8.065, -0.4], [7.6, 0.3], [6.6, 0.95], [5.6, 1.15], [0, 1.15], [-1.4, 0.95], [-3.4, 0.65], [-8.065, 0.75]], bottom: [[8.065, -0.5], [7.4, -1.0], [6.2, -1.15], [-1.0, -1.15], [-2.4, -0.6], [-3.6, 0.0], [-8.065, 0.4]], plan: [[8.065, 0.3], [7.4, 0.9], [6.2, 1.15], [-1.0, 1.2], [-2.4, 0.75], [-3.6, 0.4], [-8.065, 0.25]], round: [[8, 2.4], [4, 3.2], [-8, 2.4]], stations: 24 },
  bodies: [{ top: [[3.6, 1.15], [3.0, 1.8], [-0.6, 1.8], [-2.2, 1.15]], bottom: [[3.6, 1.1], [-2.2, 1.1]], plan: [[3.6, 0.4], [3.0, 0.85], [-0.6, 0.85], [-2.2, 0.3]], round: 3, stations: 8 }, pod(1.8, -1.2, -0.75, 0.32, 0.35, 1.25)],
  glass: [[6.6, 0.4, 0.8, 0.95, 0.5]],
  finPlan: [[-6.8, 0], [-8.065, 0], [-8.8, 2.4], [-8.1, 2.5]],
  tailRotorSide: -1, tailRotorAt: [-8.4, 2.45], tailRotorDiameter: 3.2,
  tailPlan: [[-7.2, 0.1], [-7.3, 1.6], [-8.0, 1.6], [-8.0, 0.1]], tailUp: 1.6, tailOneSide: 1,
  rotorX: 0.8, mastTop: 2.45, wheelAt: [[6.0, 0.3, -1.45, 0.28], [-0.2, 1.25, -1.4, 0.35]],
};

// ---------------------------------------------------------------- Chinook, Sea Stallion, Mi-26

// CH-47 Chinook: the long box with fuel pods along its lower sides, the forward rotor pylon over the cockpit and the
// tall rear pylon with an engine either side, four wheels (fuselage 15.87 m, rotors 18.29 m, 5.68 m). The F keeps
// the D's outline.
const CHINOOK: HS = {
  cls: 'heli-transport', length: 15.87, rotor: 18.29, height: 5.68, bodyWidth: 3.78, bodyHeight: 2.9, cabin: 'boxy', rotors: 'tandem', blades: 3, tailRotor: 'none',
  fuselage: { top: [[7.935, -0.4], [7.6, 0.4], [6.9, 1.0], [6.3, 1.45], [-7.935, 1.45]], bottom: [[7.935, -0.6], [7.4, -1.3], [6.5, -1.45], [-4.4, -1.45], [-6.6, -0.8], [-7.935, -0.4]], plan: [[7.935, 0.5], [7.4, 1.05], [6.6, 1.25], [-6.6, 1.25], [-7.935, 1.0]], round: [[7.9, 3], [6, 6], [-7.9, 6]], stations: 24 },
  bodies: [
    { top: [[7.2, 1.45], [6.8, 2.3], [5.4, 2.3], [4.6, 1.45]], bottom: [[7.2, 1.4], [4.6, 1.4]], plan: [[7.2, 0.3], [6.8, 0.5], [5.4, 0.5], [4.6, 0.3]], round: 3, stations: 8 },
    { top: [[-2.6, 1.45], [-4.4, 2.6], [-6.6, 3.1], [-7.935, 3.1], [-7.9, 1.45]], bottom: [[-2.6, 1.4], [-7.935, 1.4]], plan: [[-2.6, 0.2], [-4.4, 0.42], [-7.935, 0.42]], round: 3, stations: 10 },
    pod(-4.6, -7.7, 2.0, 0.42, 0.42, 0.95),
    pod(5.4, -4.0, -0.9, 0.34, 0.5, 1.55, 3),
  ],
  glass: [[7.0, 0.5, 0.75, 1.0, 0.55]],
  rotorX: 6.0, mastTop: 2.75, rotor2: [-6.4, 3.65],
  wheelAt: [[4.6, 1.1, -1.53, 0.42], [-4.2, 1.2, -1.53, 0.42]],
};
H['ch-47-chinook'] = { ...CHINOOK };
H['ch-47f'] = { ...CHINOOK };
// MH-47G: the special-operations Chinook with the long refuelling probe on the right of the nose.
H['mh-47g'] = { ...CHINOOK, oneSide: [pod(13.4, 6.4, 0.2, 0.09, 0.09, 1.05, 2)] };

// CH-53E Super Stallion: seven blades, three engines (the third on the left behind the rotor), sponsons with the
// main wheels, the refuelling probe on the right, the fin canted to the left (drawn upright) with the tail rotor on
// its left and the gull tailplane on its right (fuselage 22.35 m, rotor 24.08 m, 5.32 m to the rotor head).
const STALLION: HS = {
  cls: 'heli-transport', length: 22.35, rotor: 24.08, height: 5.32, bodyWidth: 2.69, bodyHeight: 2.7, cabin: 'cabin', blades: 7,
  fuselage: { top: [[11.175, -0.3], [10.6, 0.6], [9.6, 1.25], [8.8, 1.35], [-1.5, 1.35], [-3.0, 1.1], [-5.0, 0.9], [-11.175, 1.0]], bottom: [[11.175, -0.55], [10.4, -1.2], [9.4, -1.35], [-1.5, -1.35], [-3.4, -0.4], [-5.0, 0.2], [-11.175, 0.5]], plan: [[11.175, 0.35], [10.4, 1.0], [9.2, 1.3], [-1.5, 1.3], [-3.4, 0.9], [-5.0, 0.55], [-11.175, 0.3]], round: [[11, 2.6], [5, 3.6], [-11, 2.4]], stations: 26 },
  bodies: [
    { top: [[6.8, 1.35], [6.2, 2.2], [1.0, 2.3], [-0.6, 1.9], [-1.6, 1.35]], bottom: [[6.8, 1.3], [-1.6, 1.3]], plan: [[6.8, 0.5], [6.2, 0.9], [1.0, 0.9], [-1.6, 0.4]], round: 3, stations: 10 },
    pod(6.0, 2.0, 1.9, 0.45, 0.45, 1.15),
    pod(3.0, -1.2, -0.8, 0.55, 0.55, 1.75),
  ],
  oneSide: [pod(0.6, -2.6, 2.0, 0.45, 0.45, -0.5), pod(13.5, 9.0, 0.0, 0.08, 0.08, 0.9, 2)],
  glass: [[9.8, 0.5, 0.8, 1.05, 0.5]],
  finPlan: [[-9.6, 0], [-11.175, 0], [-12.0, 3.4], [-11.2, 3.6]],
  tailRotorSide: -1, tailRotorAt: [-11.8, 3.9], tailRotorDiameter: 6.1,
  tailPlan: [[-11.3, 0.1], [-11.5, 2.6], [-12.3, 2.6], [-12.3, 0.1]], tailUp: 3.9, tailOneSide: 1,
  rotorX: 1.6, mastTop: 3.4, wheelAt: [[8.8, 0.4, -1.5, 0.4], [0.4, 1.75, -1.5, 0.45]],
};
H['ch-53e'] = { ...STALLION };
// CH-53D / G Sea Stallion: two engines, six blades, a shorter body, no probe, the stabiliser straight on the right
// (fuselage 20.47 m, rotor 22.02 m).
H['ch-53g'] = {
  ...STALLION, length: 20.47, rotor: 22.02, blades: 6, fuselage: stretch(STALLION.fuselage!, 20.47 / 22.35),
  bodies: [stretch(STALLION.bodies![0], 0.92), pod(5.6, 1.8, 1.9, 0.45, 0.45, 1.15), pod(2.6, -1.2, -0.8, 0.55, 0.55, 1.75)], oneSide: [],
  finPlan: [[-8.8, 0], [-10.235, 0], [-11.0, 3.0], [-10.3, 3.2]], tailRotorAt: [-10.8, 3.5], tailRotorDiameter: 4.9,
  tailPlan: [[-10.0, 0.1], [-10.1, 2.2], [-10.8, 2.2], [-10.8, 0.1]], tailUp: 1.8, wheelAt: [[8.0, 0.4, -1.5, 0.4], [0.4, 1.75, -1.5, 0.45]],
};

// Mi-26: the biggest - a box with the long engine housing on top, clamshell doors and ramp, the boom up to a tall
// fin, eight blades (fuselage 33.73 m, rotor 32.0 m, 8.15 m).
H['mi-26'] = {
  cls: 'heli-transport', length: 33.73, rotor: 32.0, height: 8.15, bodyWidth: 3.6, bodyHeight: 3.6, cabin: 'cabin', blades: 8,
  fuselage: { top: [[16.865, -0.6], [16.3, 0.6], [15.0, 1.5], [13.6, 1.8], [-6.5, 1.8], [-8.0, 1.4], [-10.0, 1.1], [-16.865, 1.4]], bottom: [[16.865, -0.9], [16.0, -1.6], [14.4, -1.8], [-6.0, -1.8], [-8.6, -0.4], [-10.4, 0.5], [-16.865, 0.9]], plan: [[16.865, 0.5], [16.0, 1.4], [14.4, 1.8], [-6.0, 1.8], [-8.6, 1.1], [-10.4, 0.55], [-16.865, 0.35]], round: [[16, 2.6], [10, 4.5], [-8, 4.5], [-16, 2.6]], stations: 28 },
  bodies: [pod(12.0, -2.0, 2.4, 1.5, 0.6, 0, 3), pod(3.0, -2.6, 2.7, 1.0, 0.5)],
  glass: [[15.0, 0.8, 1.2, 1.5, 0.6]],
  finPlan: [[-14.8, 0], [-16.865, 0], [-17.8, 3.2], [-16.9, 3.4]],
  tailRotorAt: [-17.3, 4.0], tailRotorDiameter: 7.61,
  tailPlan: [[-13.2, 0.2], [-13.3, 2.4], [-14.2, 2.4], [-14.2, 0.2]], tailUp: 1.4,
  rotorX: 0.0, mastTop: 3.5, wheelAt: [[12.8, 0.6, -2.35, 0.45], [-1.0, 2.1, -2.3, 0.55]],
};

// ---------------------------------------------------------------- Kamov and the Dauphin family

// Ka-27: a box with coaxial rotors, the twin fins, four wheels and the radar under the nose (fuselage 11.3 m,
// rotors 15.9 m, 5.5 m). Ka-29: the assault version - a broad armoured nose with flat windows, stub pylons, a gun.
const HELIX: HS = {
  cls: 'heli-transport', length: 11.3, rotor: 15.9, height: 5.5, bodyWidth: 2.3, bodyHeight: 2.7, cabin: 'boxy', rotors: 'coaxial', blades: 3, tailRotor: 'none', twinFins: true,
  fuselage: { top: [[5.65, -0.4], [5.3, 0.4], [4.6, 1.0], [3.8, 1.25], [-1.6, 1.25], [-2.6, 1.0], [-5.65, 0.85]], bottom: [[5.65, -0.6], [5.0, -1.2], [4.0, -1.35], [-1.6, -1.35], [-2.8, -0.5], [-5.65, 0.3]], plan: [[5.65, 0.45], [5.0, 1.0], [4.0, 1.15], [-1.6, 1.15], [-2.8, 0.6], [-5.65, 0.35]], round: [[5.6, 3], [0, 4.5], [-5.6, 3]], stations: 22 },
  bodies: [pod(3.4, -1.4, 1.65, 0.85, 0.42)],
  glass: [[4.7, 0.6, 0.6, 0.95, 0.45]],
  finPlan: [[-5.0, 0], [-5.65, 0], [-5.65, 1.5], [-5.0, 1.5]],
  rotorX: 0.6, mastTop: 2.2, coaxGap: 1.4, wheelAt: [[3.8, 0.9, -1.6, 0.3], [-1.0, 1.4, -1.55, 0.35]],
};
H['ka-27'] = { ...HELIX, oneSide: [pod(4.6, 3.6, -1.45, 0.5, 0.22)] };
H['ka-29'] = {
  ...HELIX, cls: 'heli-attack',
  fuselage: { ...HELIX.fuselage!, top: [[5.65, -0.2], [5.3, 0.6], [4.6, 1.05], [3.8, 1.25], [-1.6, 1.25], [-2.6, 1.0], [-5.65, 0.85]], plan: [[5.65, 0.65], [5.0, 1.1], [4.0, 1.15], [-1.6, 1.15], [-2.8, 0.6], [-5.65, 0.35]] },
  glass: [[4.9, 0.7, 0.45, 1.0, 0.35]],
  stubs: { span: 5.0, pylons: 2 }, stubAt: [0.6, -0.4, 0],
  oneSide: [pod(5.2, 4.6, -0.6, 0.15, 0.15, 0.6)], guns: [[5.2, 0.6, -0.6, 0.6, 0.03]],
};
// Ka-60 Kasatka: one four-bladed rotor, a fenestron, a smooth body on retractable wheels (fuselage 13.26 m, rotor 13.5 m, 4.6 m).
H['ka-60'] = {
  cls: 'heli-transport', length: 13.26, rotor: 13.5, height: 4.6, bodyWidth: 2.1, bodyHeight: 2.1, cabin: 'cabin', blades: 4, tailRotor: 'fenestron',
  fuselage: { top: [[6.63, -0.35], [6.2, 0.3], [5.3, 0.85], [4.4, 1.05], [-0.4, 1.05], [-1.6, 0.8], [-3.0, 0.55], [-6.63, 0.6]], bottom: [[6.63, -0.45], [6.0, -0.95], [5.0, -1.05], [-0.8, -1.05], [-2.0, -0.5], [-3.2, 0.05], [-6.63, 0.3]], plan: [[6.63, 0.3], [6.0, 0.85], [5.0, 1.0], [-0.8, 1.0], [-2.0, 0.6], [-3.2, 0.3], [-6.63, 0.2]], round: [[6.6, 2.4], [3, 3.2], [-6.6, 2.4]], stations: 22 },
  bodies: [pod(3.0, -1.0, 1.4, 0.6, 0.38)],
  glass: [[5.5, 0.35, 0.8, 0.85, 0.5]],
  finPlan: [[-5.4, -0.7], [-6.63, -0.7], [-7.0, 1.6], [-6.3, 1.7]],
  tailPlan: [[-4.6, 0.1], [-4.7, 1.2], [-5.2, 1.2], [-5.2, 0.1]], tailUp: 0.55,
  rotorX: 0.8, mastTop: 2.1, wheelAt: [[4.8, 0.25, -1.45, 0.25], [-0.6, 1.0, -1.4, 0.3]],
};
// AS365 Dauphin / Z-9: a sleek body, the fenestron, an end-plated tailplane, retractable wheels (fuselage 12.11 m,
// rotor 11.94 m, 3.47 m). Z-9W/WA: stub pylons with HJ-8 missiles and a FLIR ball under the nose.
const DAUPHIN: HS = {
  cls: 'heli-transport', length: 12.11, rotor: 11.94, height: 3.47, bodyWidth: 1.9, bodyHeight: 1.9, cabin: 'cabin', blades: 4, tailRotor: 'fenestron',
  fuselage: { top: [[6.05, -0.3], [5.7, 0.25], [4.8, 0.75], [3.8, 0.95], [-0.4, 0.95], [-1.4, 0.7], [-2.6, 0.45], [-6.05, 0.5]], bottom: [[6.05, -0.4], [5.5, -0.85], [4.4, -0.95], [-0.6, -0.95], [-1.8, -0.45], [-2.8, 0.05], [-6.05, 0.2]], plan: [[6.05, 0.25], [5.5, 0.75], [4.4, 0.92], [-0.6, 0.92], [-1.8, 0.55], [-2.8, 0.28], [-6.05, 0.18]], round: [[6, 2.4], [3, 3.2], [-6, 2.4]], stations: 22 },
  bodies: [pod(2.4, -1.2, 1.25, 0.55, 0.33), pod(-4.2, -4.7, 0.5, 0.04, 0.3, 1.0, 4)],
  glass: [[4.8, 0.3, 0.8, 0.8, 0.45]],
  finPlan: [[-4.9, -0.6], [-6.05, -0.6], [-6.4, 1.4], [-5.7, 1.5]],
  tailPlan: [[-4.2, 0.1], [-4.2, 1.0], [-4.7, 1.0], [-4.7, 0.1]], tailUp: 0.45,
  rotorX: 0.6, mastTop: 1.75, wheelAt: [[4.6, 0.2, -1.3, 0.22], [-0.6, 0.95, -1.25, 0.28]],
};
H['z-9-dauphin'] = { ...DAUPHIN };
H['z-9w'] = { ...DAUPHIN, cls: 'heli-attack', stubs: { span: 4.2, pylons: 2 }, stubAt: [0.8, -0.3, 0], oneSide: [pod(6.4, 5.8, -0.55, 0.25, 0.25)] };

// ---------------------------------------------------------------- light and scout helicopters

/** A light helicopter's body: the glazed cabin to `cabinBack`, the boom tapering behind it; half width w, half height h. */
function light(L: number, cabinBack: number, w: number, h: number, boom = 0.12): Outline {
  const n = L / 2;
  return {
    top: [[n, -h * 0.32], [n - 0.3, h * 0.38], [n - L * 0.11, h * 0.85], [n - L * 0.2, h], [cabinBack, h], [cabinBack - 0.6, h * 0.75], [cabinBack - 1.3, h * 0.45], [-n, h * 0.4]],
    bottom: [[n, -h * 0.48], [n - 0.45, -h * 0.85], [n - L * 0.17, -h * 0.95], [cabinBack + 0.2, -h * 0.95], [cabinBack - 0.6, -h * 0.4], [cabinBack - 1.2, 0.05], [-n, h * 0.15]],
    plan: [[n, w * 0.3], [n - 0.45, w * 0.85], [n - L * 0.17, w], [cabinBack + 0.2, w], [cabinBack - 0.6, w * 0.5], [cabinBack - 1.2, boom * 1.6], [-n, boom]],
    round: [[n, 2.2], [cabinBack, 3], [-n, 2.4]],
    stations: 22,
  };
}

// Bell 206 JetRanger / OH-58A/C Kiowa: two blades, the cowl behind the cabin, the tail rotor on the left, a small
// tailplane half way, skids (fuselage 9.5 m, rotor 10.16 m, 2.91 m). OH-58D Kiowa Warrior: four blades, the ball
// sight over the rotor, a bigger cowl, weapon pylons both sides (fuselage 10.48 m, rotor 10.67 m, 3.93 m).
const JETRANGER: HS = {
  cls: 'heli-scout', length: 9.5, rotor: 10.16, height: 2.91, bodyWidth: 1.5, bodyHeight: 1.75, cabin: 'bubble', blades: 2,
  fuselage: light(9.5, 0.4, 0.75, 0.9),
  bodies: [pod(1.4, -0.8, 1.15, 0.4, 0.28)],
  glass: [[3.6, 0.2, 0.9, 0.72, 0.6]],
  finPlan: [[-4.0, -0.5], [-4.75, -0.5], [-5.05, 1.2], [-4.6, 1.25]],
  tailRotorSide: -1, tailRotorAt: [-4.85, 1.2], tailRotorDiameter: 1.65,
  tailPlan: [[-2.6, 0.05], [-2.6, 0.95], [-3.0, 0.95], [-3.0, 0.05]], tailUp: 0.35,
  rotorX: 0.5, mastTop: 1.55, skidAt: [2.8, -0.9, 0.95, -1.3],
};
H['bell-206'] = { ...JETRANGER };
H['oh-58a-kiowa'] = { ...JETRANGER, cls: 'heli-scout' };
H['oh-58d'] = {
  ...JETRANGER, length: 10.48, rotor: 10.67, height: 3.93, blades: 4, fuselage: light(10.48, 0.5, 0.78, 0.92),
  bodies: [pod(1.6, -1.2, 1.18, 0.48, 0.32), pod(-1.0, -1.6, 1.25, 0.25, 0.25), pod(1.3, 0.2, -0.35, 0.16, 0.16, 1.05), pod(1.6, 0.0, -0.6, 0.12, 0.12, 1.05)],
  glass: [[3.9, 0.2, 0.95, 0.75, 0.62]],
  finPlan: [[-4.4, -0.5], [-5.24, -0.5], [-5.55, 1.25], [-5.05, 1.3]], tailRotorAt: [-5.35, 1.25],
  tailPlan: [[-2.9, 0.05], [-2.9, 1.0], [-3.3, 1.0], [-3.3, 0.05]],
  mastTop: 1.65, mastDome: true, mastDomeSize: [0.33, 0.33, 0.85], skidAt: [3.0, -1.0, 1.0, -1.3],
};

// Hughes OH-6 Cayuse / MD 500 / MH-6 Little Bird: the egg-shaped cabin and a thin boom; the OH-6 with four blades
// and a plain fin, the MH-6M with six blades and a T-tail with end plates (fuselage 7.01 m, rotor 8.03 m / 8.33 m).
// AH-6: the planks across the cabin with gun and rocket pods.
const EGG: HS = {
  cls: 'heli-scout', length: 7.01, rotor: 8.03, height: 2.48, bodyWidth: 1.4, bodyHeight: 1.75, cabin: 'bubble', blades: 4,
  fuselage: { top: [[3.5, -0.3], [3.2, 0.35], [2.4, 0.75], [1.2, 0.85], [0.0, 0.8], [-0.7, 0.5], [-1.0, 0.3], [-3.5, 0.25]], bottom: [[3.5, -0.45], [3.0, -0.8], [1.8, -0.88], [0.2, -0.85], [-0.5, -0.5], [-1.0, 0.05], [-3.5, 0.12]], plan: [[3.5, 0.25], [3.0, 0.65], [2.0, 0.7], [0.4, 0.68], [-0.5, 0.45], [-1.0, 0.12], [-3.5, 0.08]], round: 2.2, stations: 20 },
  bodies: [pod(0.8, -0.6, 0.95, 0.3, 0.15)],
  glass: [[2.4, 0.15, 1.0, 0.68, 0.65]],
  finPlan: [[-2.9, -0.5], [-3.5, -0.5], [-3.8, 0.9], [-3.4, 0.95]],
  tailRotorSide: -1, tailRotorAt: [-3.55, 0.6], tailRotorDiameter: 1.3,
  tailPlan: [[-2.9, 0.05], [-2.9, 0.7], [-3.3, 0.7], [-3.3, 0.05]], tailUp: 0.25,
  rotorX: 0.3, mastTop: 1.25, skidAt: [1.9, -0.9, 0.8, -1.15],
};
H['oh-6-cayuse'] = { ...EGG };
const LITTLE_BIRD: HS = {
  ...EGG, length: 7.49, rotor: 8.33, blades: 6, fuselage: stretch(EGG.fuselage!, 7.49 / 7.01),
  finPlan: [[-3.15, -0.5], [-3.75, -0.5], [-4.0, 1.0], [-3.6, 1.0]], tailRotorAt: [-3.8, 0.6],
  tailPlan: [[-3.4, 0.05], [-3.4, 0.75], [-3.85, 0.75], [-3.85, 0.05]], tailUp: 1.35,
  bodies: [...EGG.bodies!, pod(-3.4, -3.85, 1.35, 0.04, 0.22, 0.75, 4)],
};
H['mh-6-little-bird'] = { ...LITTLE_BIRD };
H['ah-6-little-bird'] = { ...LITTLE_BIRD, cls: 'heli-attack', stubs: { span: 3.2, pylons: 1 }, stubAt: [0.6, -0.55, 0] };

// AS350 Ecureuil / Z-11: a big glazed cabin, the boom with an end-plated tailplane, the fin with its ventral fin,
// the tail rotor on the left (est), skids (fuselage 10.93 m, rotor 10.69 m, 3.14 m). Z-11WA: outriggers and a roof sight.
const SQUIRREL: HS = {
  cls: 'heli-scout', length: 10.93, rotor: 10.69, height: 3.14, bodyWidth: 1.8, bodyHeight: 1.9, cabin: 'bubble', blades: 3,
  fuselage: light(10.93, 0.2, 0.88, 0.95, 0.13),
  bodies: [pod(1.4, -1.2, 1.2, 0.45, 0.3), pod(-3.4, -3.9, 0.45, 0.04, 0.28, 0.9, 4)],
  glass: [[4.3, 0.25, 1.0, 0.85, 0.65]],
  finPlan: [[-4.6, -0.6], [-5.46, -0.6], [-5.8, 1.4], [-5.2, 1.45]],
  tailRotorSide: -1, tailRotorAt: [-5.5, 1.3], tailRotorDiameter: 1.86,
  tailPlan: [[-3.4, 0.05], [-3.4, 0.9], [-3.9, 0.9], [-3.9, 0.05]], tailUp: 0.4,
  rotorX: 0.6, mastTop: 1.6, skidAt: [3.2, -0.9, 1.05, -1.35],
};
H['as350-ecureuil'] = { ...SQUIRREL };
H['z-11'] = { ...SQUIRREL, cls: 'heli-attack', stubs: { span: 3.4, pylons: 1 }, stubAt: [0.8, -0.5, 0], oneSide: [pod(3.4, 2.9, 1.15, 0.2, 0.22, -0.35)] };

// MBB BO 105: a compact pod with clamshell doors, the boom with an end-plated tailplane, skids (fuselage 8.56 m,
// rotor 9.84 m, 3.0 m). PAH-1: three HOT tubes either side on outriggers and the roof sight over the left seat.
const BO105: HS = {
  cls: 'heli-scout', length: 8.56, rotor: 9.84, height: 3.0, bodyWidth: 1.6, bodyHeight: 1.85, cabin: 'bubble', blades: 4,
  fuselage: light(8.56, -0.3, 0.8, 0.92, 0.12),
  bodies: [pod(1.2, -0.8, 1.15, 0.42, 0.25), pod(-2.9, -3.3, 0.45, 0.04, 0.28, 1.0, 4)],
  glass: [[3.3, 0.25, 0.9, 0.75, 0.6]],
  finPlan: [[-3.6, -0.5], [-4.28, -0.5], [-4.6, 1.2], [-4.1, 1.25]],
  tailRotorSide: -1, tailRotorAt: [-4.4, 1.15], tailRotorDiameter: 1.9,
  tailPlan: [[-2.9, 0.05], [-2.9, 1.0], [-3.3, 1.0], [-3.3, 0.05]], tailUp: 0.4,
  rotorX: 0.4, mastTop: 1.55, skidAt: [2.6, -1.0, 0.95, -1.3],
};
H['bo-105'] = { ...BO105 };
H['bo-105-pah1'] = { ...BO105, cls: 'heli-attack', bodies: [...BO105.bodies!, pod(0.9, 0.5, -0.1, 0.05, 0.05, 0.9, 2), ...launchers(1.5, 1.3, 1.05, 0.05, 0.17, 3)], oneSide: [pod(2.8, 2.3, 1.1, 0.2, 0.22, -0.35)] };
// Hkp 9A: the Swedish BO 105 with four TOW tubes.
H['bo-105-tow'] = { ...BO105, cls: 'heli-attack', bodies: [...BO105.bodies!, pod(0.9, 0.5, -0.1, 0.05, 0.05, 0.9, 2), ...launchers(1.5, 1.3, 1.05, 0.05, 0.2, 1, 2)], oneSide: [pod(2.8, 2.3, 1.1, 0.2, 0.22, -0.35)] };

// Westland Lynx AH.1: a boxy cabin with a short nose, the engines on top, the boom rising to the fin with the tail
// rotor on the left and the stabiliser on the right, skids (fuselage 12.06 m, rotor 12.8 m, 3.73 m). AH.7: TOW
// launchers on the cabin sides and the roof sight. AH.9 and the naval HAS: wheels; AH.9 with BERP blades.
// AW159 Wildcat: the redesigned longer tail, the sensor ball under the nose, wheels, BERP blades (est 13.5 m).
const LYNX: HS = {
  cls: 'heli-transport', length: 12.06, rotor: 12.8, height: 3.73, bodyWidth: 2.0, bodyHeight: 2.0, cabin: 'cabin', blades: 4,
  fuselage: { top: [[6.03, -0.35], [5.7, 0.35], [4.9, 0.85], [4.1, 1.0], [-0.6, 1.0], [-1.6, 0.75], [-2.6, 0.6], [-5.0, 0.85], [-6.03, 1.0]], bottom: [[6.03, -0.45], [5.5, -0.9], [4.4, -1.0], [-0.8, -1.0], [-1.8, -0.4], [-2.8, 0.2], [-6.03, 0.6]], plan: [[6.03, 0.3], [5.5, 0.85], [4.4, 1.0], [-0.8, 1.0], [-1.8, 0.55], [-2.8, 0.3], [-6.03, 0.2]], round: [[6, 2.6], [3, 3.6], [-6, 2.4]], stations: 22 },
  bodies: [pod(2.2, -1.4, 1.3, 0.6, 0.32)],
  glass: [[4.9, 0.3, 0.75, 0.85, 0.5]],
  finPlan: [[-5.2, 0], [-6.03, 0], [-6.5, 1.6], [-5.9, 1.7]],
  tailRotorSide: -1, tailRotorAt: [-6.3, 2.2], tailRotorDiameter: 2.21,
  tailPlan: [[-5.9, 0.1], [-6.0, 1.0], [-6.5, 1.0], [-6.5, 0.1]], tailUp: 2.0, tailOneSide: 1,
  rotorX: 0.6, mastTop: 1.85, skidAt: [3.4, -1.6, 1.0, -1.4],
};
H['lynx-ah1'] = { ...LYNX };
H['lynx-ah7'] = { ...LYNX, cls: 'heli-attack', bodies: [...LYNX.bodies!, ...launchers(1.0, 1.3, 1.15, 0.0, 0.2, 2)], oneSide: [pod(4.0, 3.4, 1.15, 0.22, 0.24, -0.35)] };
H['lynx-has'] = { ...LYNX, sweptTips: true, skidAt: undefined, wheelAt: [[2.6, 1.15, -1.3, 0.25], [-0.6, 1.15, -1.3, 0.25]], oneSide: [pod(5.6, 4.6, -1.05, 0.4, 0.18)] };
H['aw159-wildcat'] = {
  ...LYNX, length: 12.5, sweptTips: true, fuselage: { ...LYNX.fuselage!, top: [[6.25, -0.35], [5.9, 0.35], [5.1, 0.85], [4.3, 1.0], [-0.6, 1.0], [-1.6, 0.75], [-2.6, 0.6], [-5.2, 0.85], [-6.25, 1.05]] },
  skidAt: undefined, wheelAt: [[2.6, 1.15, -1.3, 0.25], [-0.6, 1.15, -1.3, 0.25]],
  finPlan: [[-5.3, 0], [-6.25, 0], [-6.75, 1.8], [-6.05, 1.9]], tailRotorAt: [-6.5, 2.3],
  oneSide: [pod(5.8, 5.2, -1.1, 0.25, 0.25)],
};
// Westland Scout / Wasp: a small cabin, the engine bare under a cowl behind it, a thin boom to a fin with the tail
// rotor on the left; the Scout on skids, the naval Wasp on four castoring wheels (fuselage 9.24 m, rotor 9.83 m).
const SCOUT: HS = {
  cls: 'heli-scout', length: 9.24, rotor: 9.83, height: 2.72, bodyWidth: 1.6, bodyHeight: 1.7, cabin: 'cabin', blades: 4,
  fuselage: light(9.24, 0.4, 0.82, 0.85, 0.12),
  bodies: [pod(0.6, -1.4, 1.05, 0.4, 0.28)],
  glass: [[3.6, 0.2, 0.8, 0.78, 0.55]],
  finPlan: [[-3.9, 0], [-4.62, 0], [-5.0, 1.3], [-4.5, 1.35]],
  tailRotorSide: -1, tailRotorAt: [-4.75, 1.25], tailRotorDiameter: 2.29,
  tailPlan: [[-4.2, 0.05], [-4.2, 0.8], [-4.6, 0.8], [-4.6, 0.05]], tailUp: 1.45,
  rotorX: 0.6, mastTop: 1.5, skidAt: [2.6, -1.0, 1.0, -1.25],
};
H['westland-scout'] = { ...SCOUT };
H['westland-wasp'] = { ...SCOUT, skidAt: undefined, wheelAt: [[2.4, 1.1, -1.2, 0.2], [-0.6, 1.1, -1.2, 0.2]] };

// Agusta A109: a sleek body on retractable wheels, the tail rotor on the left, a fin with a ventral fin
// (fuselage 11.45 m, rotor 11.0 m, 3.5 m). A109EOA: the armed scout with the roof sight and weapon pylons.
const A109: HS = {
  cls: 'heli-transport', length: 11.45, rotor: 11.0, height: 3.5, bodyWidth: 1.6, bodyHeight: 1.75, cabin: 'cabin', blades: 4,
  fuselage: { top: [[5.72, -0.3], [5.3, 0.3], [4.4, 0.78], [3.5, 0.9], [-0.2, 0.9], [-1.2, 0.6], [-2.4, 0.4], [-5.72, 0.4]], bottom: [[5.72, -0.4], [5.1, -0.8], [4.0, -0.85], [-0.6, -0.85], [-1.6, -0.35], [-2.6, 0.05], [-5.72, 0.15]], plan: [[5.72, 0.25], [5.1, 0.7], [4.0, 0.8], [-0.6, 0.8], [-1.6, 0.45], [-2.6, 0.22], [-5.72, 0.12]], round: [[5.7, 2.4], [3, 3], [-5.7, 2.4]], stations: 22 },
  bodies: [pod(1.6, -1.4, 1.1, 0.45, 0.28)],
  glass: [[4.4, 0.3, 0.8, 0.75, 0.5]],
  finPlan: [[-4.8, -0.6], [-5.72, -0.6], [-6.1, 1.3], [-5.5, 1.35]],
  tailRotorSide: -1, tailRotorAt: [-5.85, 1.3], tailRotorDiameter: 2.0,
  tailPlan: [[-4.0, 0.1], [-4.1, 1.2], [-4.5, 1.2], [-4.5, 0.1]], tailUp: 0.45,
  rotorX: 0.4, mastTop: 1.65, wheelAt: [[4.2, 0, -1.2, 0.2], [-0.4, 0.95, -1.15, 0.25]],
};
H['a-109'] = { ...A109 };
H['a-109eoa'] = { ...A109, cls: 'heli-attack', stubs: { span: 3.2, pylons: 1 }, stubAt: [0.6, -0.4, 0], oneSide: [pod(3.4, 2.9, 1.05, 0.2, 0.22, -0.3)] };

// ---------------------------------------------------------------- more attack helicopters

// Z-10: a faceted narrow body with stepped tandem cockpits, engine nacelles high on the sides, stubs, a chin gun,
// the tail rotor at the fin top (fuselage 14.15 m, rotor 13.0 m, 3.85 m).
H['z-10'] = {
  cls: 'heli-attack', length: 14.15, rotor: 13.0, height: 3.85, bodyWidth: 1.25, bodyHeight: 1.9, cabin: 'tandem', blades: 5,
  fuselage: { top: [[7.07, -0.3], [6.5, 0.1], [5.3, 0.5], [4.2, 0.75], [3.0, 1.0], [1.6, 1.15], [-0.6, 1.1], [-2.0, 0.7], [-3.2, 0.45], [-7.07, 0.4]], bottom: [[7.07, -0.5], [6.0, -0.85], [2.0, -0.9], [-0.4, -0.85], [-1.8, -0.45], [-3.2, -0.1], [-7.07, 0.1]], plan: [[7.07, 0.12], [6.4, 0.45], [4.5, 0.58], [2.0, 0.62], [0, 0.6], [-1.6, 0.4], [-3.0, 0.25], [-7.07, 0.15]], round: 5, stations: 24 },
  bodies: [pod(1.4, -2.2, 0.95, 0.32, 0.32, 0.72)],
  glass: [[5.1, 0.45, 0.8, 0.42, 0.35], [3.4, 0.92, 0.8, 0.42, 0.35]],
  finPlan: [[-5.8, 0], [-7.07, 0], [-7.6, 2.0], [-6.9, 2.0]],
  tailRotorAt: [-7.3, 2.0], tailRotorDiameter: 2.6,
  tailPlan: [[-5.4, 0.1], [-5.5, 1.1], [-6.0, 1.1], [-6.0, 0.1]], tailUp: 0.5,
  oneSide: [pod(5.6, 5.0, -1.0, 0.27, 0.25)], guns: [[5.3, 0, -1.05, 1.3, 0.05]],
  stubs: { span: 4.4, pylons: 2 }, stubAt: [0.4, -0.05, 3],
  rotorX: 0.4, mastTop: 1.9, wheelAt: [[3.6, 0.95, -1.3, 0.3], [-5.6, 0, -1.0, 0.18]],
};
// Z-19: the Dauphin's dynamics under a narrow stepped tandem body, the fenestron, stubs; the Z-19 with the radar
// dome over the rotor, the Z-19E without (est 12.0 m, rotor 11.94 m).
const Z19: HS = {
  cls: 'heli-attack', length: 12.0, rotor: 11.94, height: 4.0, bodyWidth: 1.15, bodyHeight: 1.8, cabin: 'tandem', blades: 4, tailRotor: 'fenestron',
  fuselage: { top: [[6.0, -0.3], [5.5, 0.1], [4.4, 0.5], [3.4, 0.72], [2.4, 0.95], [1.2, 1.05], [-0.6, 1.0], [-1.8, 0.6], [-2.8, 0.4], [-6.0, 0.4]], bottom: [[6.0, -0.45], [5.0, -0.8], [1.5, -0.85], [-0.6, -0.8], [-1.8, -0.35], [-2.8, 0.0], [-6.0, 0.15]], plan: [[6.0, 0.12], [5.4, 0.42], [3.5, 0.55], [1.0, 0.58], [-1.0, 0.5], [-2.4, 0.28], [-6.0, 0.15]], round: 4, stations: 22 },
  bodies: [pod(1.2, -1.6, 1.05, 0.5, 0.3), pod(-4.2, -4.7, 0.5, 0.04, 0.3, 1.0, 4)],
  glass: [[4.3, 0.4, 0.75, 0.4, 0.33], [2.8, 0.85, 0.75, 0.4, 0.33]],
  finPlan: [[-4.9, -0.6], [-6.0, -0.6], [-6.4, 1.4], [-5.7, 1.5]],
  tailPlan: [[-4.2, 0.1], [-4.2, 1.0], [-4.7, 1.0], [-4.7, 0.1]], tailUp: 0.45,
  stubs: { span: 4.0, pylons: 2 }, stubAt: [0.3, -0.1, 0],
  rotorX: 0.5, mastTop: 1.75, wheelAt: [[3.0, 0.9, -1.2, 0.28], [-4.6, 0, -0.95, 0.16]],
};
H['z-19'] = { ...Z19, mastDome: true, mastDomeSize: [0.42, 0.25, 0.55] };
H['z-19e'] = { ...Z19 };
// Kawasaki OH-1: a stepped tandem scout with a fenestron and the sensor ball on the cabin roof ahead of the rotor
// (fuselage 12.0 m, rotor 11.6 m, 3.8 m).
H['oh-1-ninja'] = { ...Z19, cls: 'heli-scout', length: 12.0, rotor: 11.6, height: 3.8, stubs: { span: 3.2, pylons: 1 }, oneSide: [pod(2.6, 1.9, 1.35, 0.32, 0.32)] };

// A129 Mangusta: narrow and stepped, engines on the sides, stubs, a fin with a ventral fin and the tail rotor on the
// left (est) (fuselage 12.28 m, rotor 11.9 m, 3.35 m). A129 CBT: the three-barrel chin turret. T129 ATAK: five
// blades, a longer body, the nose sight and the chin gun (est 13.0 m).
const MANGUSTA: HS = {
  cls: 'heli-attack', length: 12.28, rotor: 11.9, height: 3.35, bodyWidth: 1.1, bodyHeight: 1.8, cabin: 'tandem', blades: 4,
  fuselage: { top: [[6.14, -0.25], [5.6, 0.1], [4.6, 0.45], [3.6, 0.62], [2.6, 0.85], [1.4, 1.0], [-0.6, 0.95], [-1.8, 0.55], [-2.8, 0.38], [-6.14, 0.35]], bottom: [[6.14, -0.45], [5.2, -0.8], [1.4, -0.85], [-0.6, -0.8], [-1.8, -0.4], [-2.8, -0.05], [-6.14, 0.1]], plan: [[6.14, 0.12], [5.6, 0.4], [3.8, 0.5], [1.4, 0.55], [-0.6, 0.5], [-2.0, 0.28], [-6.14, 0.14]], round: 3.5, stations: 22 },
  bodies: [pod(1.2, -1.6, 0.85, 0.3, 0.3, 0.6)],
  glass: [[4.4, 0.4, 0.7, 0.36, 0.3], [2.9, 0.82, 0.7, 0.36, 0.3]],
  finPlan: [[-5.0, -0.4], [-6.14, -0.4], [-6.6, 1.6], [-6.0, 1.65]],
  tailRotorSide: -1, tailRotorAt: [-6.3, 1.6], tailRotorDiameter: 2.24,
  tailPlan: [[-5.0, 0.1], [-5.0, 0.9], [-5.5, 0.9], [-5.5, 0.1]], tailUp: 0.4,
  stubs: { span: 3.2, pylons: 2 }, stubAt: [0.4, -0.05, 0],
  oneSide: [pod(6.5, 5.9, -0.15, 0.3, 0.3)],
  rotorX: 0.4, mastTop: 1.7, wheelAt: [[3.0, 0.85, -1.2, 0.28], [-5.0, 0, -0.95, 0.16]],
};
H['a-129-mangusta'] = { ...MANGUSTA };
H['a-129-cbt'] = { ...MANGUSTA, oneSide: [pod(6.5, 5.9, -0.15, 0.3, 0.3), pod(5.4, 4.8, -0.95, 0.26, 0.24)], guns: [[5.1, 0, -1.0, 1.3, 0.05]] };
H['t-129-atak'] = { ...MANGUSTA, length: 13.0, blades: 5, fuselage: stretch(MANGUSTA.fuselage!, 13.0 / 12.28), oneSide: [pod(6.85, 6.2, -0.15, 0.32, 0.32), pod(5.7, 5.1, -0.95, 0.26, 0.24)], guns: [[5.4, 0, -1.0, 1.3, 0.05]] };

// RAH-66 Comanche: a faceted stealth body, stepped tandem seats, the weapons inside, a fantail with the stabiliser on
// top of it, a chin gun (fuselage 13.2 m, rotor 11.9 m, 3.39 m).
H['rah-66-comanche'] = {
  cls: 'heli-attack', length: 13.2, rotor: 11.9, height: 3.39, bodyWidth: 1.7, bodyHeight: 1.8, cabin: 'tandem', blades: 5, tailRotor: 'fenestron',
  fuselage: { top: [[6.6, -0.2], [6.0, 0.15], [4.8, 0.45], [3.8, 0.7], [2.6, 0.9], [1.2, 1.0], [-0.8, 0.95], [-2.4, 0.55], [-6.6, 0.45]], bottom: [[6.6, -0.35], [5.6, -0.7], [1.0, -0.8], [-1.0, -0.75], [-2.6, -0.25], [-6.6, 0.1]], plan: [[6.6, 0.1], [6.0, 0.4], [4.0, 0.7], [1.0, 0.85], [-1.0, 0.8], [-2.6, 0.38], [-6.6, 0.2]], round: 8, stations: 22 },
  glass: [[4.6, 0.4, 0.75, 0.38, 0.3], [3.1, 0.8, 0.75, 0.38, 0.3]],
  finPlan: [[-5.4, -0.5], [-6.6, -0.5], [-7.0, 1.4], [-6.2, 1.45]],
  tailPlan: [[-6.1, 0.1], [-6.2, 1.2], [-6.9, 1.2], [-6.9, 0.1]], tailUp: 1.9,
  guns: [[5.0, 0, -0.85, 1.2, 0.04]],
  rotorX: 0.6, mastTop: 1.7, wheelAt: [[3.0, 0.9, -1.1, 0.26], [-5.2, 0, -0.85, 0.15]],
};
// AH-56 Cheyenne: a compound - stepped tandem seats, a low fixed wing with pylons, a pusher propeller behind the
// tail with the tail rotor on the left, a nose turret and a belly turret (fuselage 16.66 m, rotor 15.62 m, 4.18 m).
H['ah-56-cheyenne'] = {
  cls: 'heli-attack', length: 16.66, rotor: 15.62, height: 4.18, bodyWidth: 1.3, bodyHeight: 1.9, cabin: 'tandem', blades: 4,
  fuselage: { top: [[8.33, -0.2], [7.7, 0.2], [6.4, 0.55], [5.2, 0.8], [3.8, 1.0], [2.0, 1.1], [-0.4, 1.0], [-2.0, 0.6], [-6.8, 0.45], [-8.33, 0.3]], bottom: [[8.33, -0.4], [7.2, -0.8], [2.0, -0.9], [-0.4, -0.85], [-2.4, -0.35], [-6.8, -0.05], [-8.33, 0.05]], plan: [[8.33, 0.12], [7.6, 0.45], [5.0, 0.6], [2.0, 0.65], [-0.4, 0.6], [-2.4, 0.32], [-8.33, 0.15]], round: 3, stations: 24 },
  bodies: [pod(1.8, -1.6, 1.1, 0.4, 0.3)],
  glass: [[5.9, 0.45, 0.85, 0.42, 0.35], [4.2, 0.88, 0.85, 0.42, 0.35]],
  finPlan: [[-6.8, -0.8], [-7.9, -0.8], [-8.3, 1.6], [-7.6, 1.7]],
  tailRotorSide: -1, tailRotorAt: [-7.9, 1.6], tailRotorDiameter: 3.05,
  tailPlan: [[-6.6, 0.1], [-6.7, 1.6], [-7.3, 1.6], [-7.3, 0.1]], tailUp: 0.4,
  pusher: [-8.6, 0.25, 3.05, 3],
  stubs: { span: 8.0, pylons: 3 }, stubAt: [0.6, -0.6, 0],
  oneSide: [pod(1.0, 0.3, -1.05, 0.35, 0.3)], guns: [[8.0, 0, -0.6, 0.9, 0.05], [0.8, 0, -1.1, 1.2, 0.05]],
  rotorX: 0.8, mastTop: 1.9, wheelAt: [[1.6, 1.1, -1.4, 0.32], [-6.0, 0, -0.75, 0.15]],
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
  finPlan: [[-7.3, 0], [-8.4, 0], [-9.0, 2.1], [-8.4, 2.2]], tailRotorSide: 1, tailRotorAt: [-8.7, 2.6], tailRotorDiameter: 3.6,
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

// H145M: a light twin with a box cabin and clamshell doors, the boom raised to a fenestron and an end-plated
// tailplane, skids (fuselage 11.64 m, rotor 11.0 m, 3.95 m).
H['h145m'] = {
  cls: 'heli-transport', length: 11.64, rotor: 11.0, height: 3.95, bodyWidth: 1.75, bodyHeight: 2.0, cabin: 'cabin', blades: 4, tailRotor: 'fenestron',
  fuselage: light(11.64, -0.6, 0.86, 1.0, 0.16),
  bodies: [pod(1.6, -1.6, 1.2, 0.55, 0.3), pod(-4.1, -4.6, 0.6, 0.04, 0.32, 1.05, 4)],
  glass: [[4.6, 0.25, 0.95, 0.85, 0.65]],
  finPlan: [[-4.9, -0.7], [-5.82, -0.7], [-6.2, 1.4], [-5.5, 1.5]],
  tailPlan: [[-4.1, 0.1], [-4.1, 1.05], [-4.6, 1.05], [-4.6, 0.1]], tailUp: 0.55,
  rotorX: 0.6, mastTop: 1.75, skidAt: [3.0, -1.4, 1.1, -1.45],
};
// Denel Rooivalk: the Puma's dynamics under a big stepped tandem body, the chin gun turret and the nose sight,
// stubs, a tail wheel (fuselage 16.39 m, rotor 15.58 m, 5.19 m).
H['rooivalk'] = {
  cls: 'heli-attack', ...HAVOC, length: 16.39, rotor: 15.58, height: 5.19, blades: 4,
  fuselage: stretch(HAVOC.fuselage!, 16.39 / 17.01),
  oneSide: [pod(8.6, 7.9, -0.25, 0.33, 0.33), pod(6.6, 5.9, -1.05, 0.3, 0.28)],
  guns: [[6.3, 0, -1.1, 1.6, 0.05]],
  stubs: { span: 5.2, pylons: 2 }, stubAt: [0.0, 0.05, 4],
  wheels: false, wheelAt: [[4.4, 1.05, -1.55, 0.34], [-6.6, 0, -1.05, 0.2]],
};
// Superhind Mk III: the Mi-24 rebuilt with a 20 mm turret under the nose and four-tube missile launchers outboard.
H['superhind'] = {
  cls: 'heli-attack', ...HIND_BASE, bodies: [...ENGINES_24, ...launchers(1.0, 1.8, 2.6, -0.75, 0.14, 2, 2)],
  oneSide: [pod(8.1, 7.4, -0.82, 0.28, 0.26)], guns: [[7.8, 0, -0.88, 1.5, 0.05]],
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
