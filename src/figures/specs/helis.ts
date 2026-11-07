/**
 * The base outlines of the attack helicopters (Apache, Hind, Havoc, Hokum,
 * Cobra, Tiger) that ./heli-variants.ts builds each variant from, the Mi-28,
 * a gyrocopter and a tiltrotor: attack (tandem seats, stub wings, a mast
 * sight or radar), utility and transport (cabins, tandem and coaxial rotors,
 * Kamov twin fins), and scouts (bubble cabins, skids, fenestrons).
 *
 * `length` is the fuselage without rotors where published, `rotor` the main
 * rotor's diameter, `height` overall; body sizes from three-views (est).
 */

import type { Named, SpecSet } from './index';
import type { FixedWingSpec, HeliSpec } from '../air';
import type { Outline } from '../parts';

const H: Named<HeliSpec> = {};

/**
 * A flat-plate canopy's glass from the windscreen's foot `front` back to `back`: the windscreen raked over `rake` of
 * the length up to a flat crown `crown` above the axis, standing on the sill `sill`, `w` half wide (AH-1S, AH-64).
 */
export function plateCanopy(front: number, back: number, crown: number, sill: number, w: number, rake = 0.4): Outline {
  const r = front - (front - back) * rake;
  return { top: [[front, sill], [r, crown], [back + 0.08, crown], [back, crown - 0.1]], bottom: [[front, sill - 0.25], [back, crown - 0.6]], plan: [[front, w * 0.75], [r, w], [back, w]], round: 8, stations: 6 };
}


// A light gyrocopter (generic).
H['gyrocopter'] = { cls: 'heli-scout', length: 4.6, rotor: 8.4, height: 2.6, bodyWidth: 0.8, bodyHeight: 1.0, cabin: 'bubble', blades: 2, tailRotor: 'none', skids: true };

// ---------------------------------------------------------------- attack helicopters from their outlines

// AH-64 Apache: a narrow nose with the TADS drum at its tip and the PNVS on top, flat stepped tandem canopies, the
// rotor well forward over the engine nacelles that stand off the shoulders, avionics sponsons low on the sides,
// stubs under the mast, a thick boom to a tall swept fin (fuselage 15.5 m, rotor 14.63 m, 3.87 m to the rotor head).
// Depths and where things sit judged from public three-views (estimates): the hub 5.1 m behind the nose, the
// fuselage 2.3 m deep at the rear cockpit, the nacelles 1 m tall either side of the gearbox.
export const APACHE: HeliSpec = {
  length: 15.5, rotor: 14.63, height: 3.87, bodyWidth: 1.1, bodyHeight: 2.3, cabin: 'tandem', blades: 4,
  fuselage: {
    top: [[7.2, -0.1], [6.9, 0.05], [6.55, 0.2], [5.9, 0.75], [5.0, 0.92], [4.75, 0.98], [4.35, 1.3], [3.6, 1.42], [2.0, 1.42], [0.2, 1.25], [-0.8, 0.88], [-1.6, 0.74], [-7.0, 0.57], [-7.6, 0.55]],
    bottom: [[7.2, -0.5], [6.8, -0.78], [6.0, -0.9], [2.2, -0.92], [0.6, -0.76], [-1.2, -0.38], [-4.0, -0.2], [-7.0, -0.06], [-7.6, 0.05]],
    plan: [[7.2, 0.18], [6.8, 0.36], [6.0, 0.44], [4.5, 0.5], [3.0, 0.55], [1.0, 0.55], [-0.8, 0.42], [-1.6, 0.3], [-7.0, 0.2], [-7.6, 0.14]],
    round: [[7.2, 4], [3, 5], [-1.6, 4], [-7.6, 3]], stations: 28,
  },
  bodies: [
    // The avionics sponsons, then the engine nacelles off the shoulders with their exhausts.
    { top: [[5.4, -0.3], [4.8, -0.1], [2.0, -0.1], [1.4, -0.3]], bottom: [[5.4, -0.55], [4.8, -0.8], [2.0, -0.8], [1.4, -0.55]], plan: [[5.4, 0.12], [4.8, 0.28], [2.0, 0.28], [1.4, 0.12]], side: 0.68, round: 6, stations: 8 },
    { top: [[3.2, 1.0], [2.85, 1.5], [0.0, 1.55], [-0.6, 1.4]], bottom: [[3.2, 0.72], [2.85, 0.5], [0.0, 0.5], [-0.6, 0.72]], plan: [[3.2, 0.26], [2.85, 0.38], [0.0, 0.38], [-0.6, 0.3]], side: 0.95, round: 4, stations: 8 },
  ],
  glassOutlines: [plateCanopy(6.55, 4.75, 0.95, 0.15, 0.44, 0.45), plateCanopy(4.8, 3.45, 1.45, 0.85, 0.47, 0.3)],
  finPlan: [[-6.3, 0], [-7.5, 0], [-7.95, 1.95], [-7.2, 2.0]],
  // The blades' true chord (0.53 m), flat.
  bladeChord: 0.53, rotorX: 2.65, mastTop: 2.15, stubs: { span: 5.23, pylons: 2 }, stubAt: [2.75, 0.2, 4], wheels: true,
};

// Mi-24 Hind: big and deep - a bubble for the gunner low in the nose, the pilot's canopy stepped up behind, a
// troop cabin 2.4 m deep, two engines side by side on the roof with the gearbox between them, an upper deck that
// runs on into a long tapering boom, stub wings drooping with 12 degrees of anhedral under the rotor, a swept fin
// (fuselage 17.5 m, rotor 17.3 m, 6.5 m overall). Depths and stations judged from public three-views (estimates):
// the hub 7.1 m behind the nose, the engines' tops 3.3 m over the belly, the boom 1.6 m deep at its root.
export const HIND: HeliSpec = {
  length: 17.5, rotor: 17.3, height: 6.5, bodyWidth: 2.0, bodyHeight: 2.4, cabin: 'tandem', blades: 5,
  fuselage: {
    top: [[8.75, -0.4], [8.5, -0.1], [8.0, 0.12], [7.0, 0.2], [6.4, 0.3], [6.15, 0.7], [5.5, 0.8], [4.7, 1.0], [4.4, 1.2], [0.0, 1.25], [-1.0, 1.32], [-2.3, 1.55], [-5.0, 1.45], [-8.3, 1.3], [-8.75, 1.25]],
    bottom: [[8.75, -0.55], [8.4, -0.85], [7.6, -1.0], [6.5, -1.12], [0.0, -1.15], [-1.0, -1.0], [-2.3, -0.1], [-5.0, 0.4], [-8.3, 0.85], [-8.75, 0.9]],
    plan: [[8.75, 0.15], [8.3, 0.45], [7.3, 0.6], [6.2, 0.75], [5.0, 0.95], [0.0, 1.0], [-1.2, 0.95], [-2.3, 0.62], [-5.0, 0.42], [-8.3, 0.22], [-8.75, 0.2]],
    round: [[8.7, 3], [5, 3.6], [-1, 3.6], [-2.3, 3], [-8.7, 2.4]], stations: 30,
  },
  bodies: [
    // The gearbox deck sloping into the boom, the two engines on the roof, their exhausts turned out at the back.
    { top: [[5.0, 1.2], [4.5, 1.7], [3.8, 1.9], [-0.8, 1.9], [-2.4, 1.55]], bottom: [[5.0, 1.15], [-2.4, 1.15]], plan: [[5.0, 0.4], [4.4, 0.6], [-0.8, 0.6], [-2.4, 0.5]], round: 3.5, stations: 10 },
    { top: [[4.7, 1.65], [4.5, 2.05], [-0.3, 2.1], [-0.7, 1.85]], bottom: [[4.7, 1.25], [4.5, 1.15], [-0.3, 1.15], [-0.7, 1.3]], plan: [[4.7, 0.36], [4.5, 0.45], [-0.3, 0.45], [-0.7, 0.36]], side: 0.5, round: 2.2, stations: 10 },
    { top: [[-0.4, 1.55], [-0.65, 1.85], [-1.25, 1.85], [-1.5, 1.55]], bottom: [[-0.4, 1.55], [-0.65, 1.25], [-1.25, 1.25], [-1.5, 1.55]], plan: [[-0.4, 0.06], [-0.65, 0.26], [-1.25, 0.26], [-1.5, 0.06]], side: 0.98, round: 2.4, stations: 8 },
  ],
  glass: [[7.2, 0.15, 0.85, 0.5, 0.42], [5.35, 0.75, 0.85, 0.52, 0.45]],
  finPlan: [[-7.6, 0], [-8.75, -0.1], [-9.55, 2.0], [-8.85, 2.05]],
  rotorX: 1.6, mastTop: 2.75, stubs: { span: 6.6, pylons: 2 }, stubAt: [-0.1, 0.55, 12], wheels: true,
};

// Mi-28: the Hind's layout made narrow and armoured - the gunner low in front behind flat armoured glass, the pilot
// stepped up behind, the engines in nacelles on the shoulders with their exhausts bent down, the gearbox between
// them, the gun turret under the cockpit, short stubs with countermeasure pods at the tips, a thick boom to a swept
// fin with the X tail rotor on its right (as public photos show) and the stabiliser high on it, fixed main gear
// forward and a tail wheel (fuselage 17.01 m, rotor 17.2 m, 3.82 m to the head). Depths and stations judged from
// public photos (estimates).
export const HAVOC: HeliSpec = {
  length: 17.01, rotor: 17.2, height: 3.82, bodyWidth: 1.5, bodyHeight: 2.4, cabin: 'tandem', blades: 5,
  fuselage: {
    top: [[8.5, -0.35], [8.2, 0.0], [7.6, 0.25], [7.0, 0.35], [6.4, 0.45], [6.1, 0.85], [5.4, 1.0], [4.6, 1.15], [4.3, 1.3], [1.0, 1.35], [-1.2, 1.25], [-2.6, 0.75], [-8.0, 0.6], [-8.5, 0.6]],
    bottom: [[8.5, -0.45], [8.1, -0.8], [7.3, -0.95], [6.0, -1.05], [1.0, -1.05], [-1.2, -0.85], [-2.6, -0.2], [-8.0, 0.15], [-8.5, 0.2]],
    plan: [[8.5, 0.12], [8.0, 0.4], [7.0, 0.55], [5.5, 0.65], [3.0, 0.75], [0.5, 0.75], [-1.5, 0.55], [-2.6, 0.35], [-8.5, 0.2]],
    round: [[8.5, 4], [3, 4.5], [-2.6, 3.5], [-8.5, 3]], stations: 28,
  },
  bodies: [
    { top: [[2.6, 1.3], [2.2, 1.75], [-0.6, 1.75], [-1.4, 1.3]], bottom: [[2.6, 1.25], [-1.4, 1.2]], plan: [[2.6, 0.3], [2.2, 0.5], [-0.6, 0.5], [-1.4, 0.3]], round: 3, stations: 8 },
    { top: [[2.6, 1.15], [2.3, 1.65], [-1.0, 1.65], [-1.5, 1.3]], bottom: [[2.6, 0.95], [2.3, 0.65], [-1.0, 0.65], [-1.5, 0.95]], plan: [[2.6, 0.24], [2.3, 0.36], [-1.0, 0.36], [-1.5, 0.28]], side: 0.88, round: 2.6, stations: 8 },
    { top: [[-0.9, 1.25], [-1.1, 1.3], [-1.8, 1.0], [-1.9, 0.75]], bottom: [[-0.9, 0.75], [-1.1, 0.55], [-1.8, 0.4], [-1.9, 0.55]], plan: [[-0.9, 0.18], [-1.1, 0.28], [-1.8, 0.28], [-1.9, 0.18]], side: 1.0, round: 3, stations: 8 },
    { top: [[1.0, 0.1], [0.8, 0.22], [-0.1, 0.22], [-0.3, 0.1]], bottom: [[1.0, 0.1], [0.8, -0.05], [-0.1, -0.05], [-0.3, 0.1]], plan: [[1.0, 0.04], [0.8, 0.14], [-0.1, 0.14], [-0.3, 0.04]], side: 2.45, round: 2.4, stations: 6 },
  ],
  oneSide: [
    { top: [[6.25, -0.95], [6.05, -0.8], [5.55, -0.8], [5.35, -0.95]], bottom: [[6.25, -1.1], [6.05, -1.38], [5.55, -1.38], [5.35, -1.1]], plan: [[6.25, 0.1], [6.05, 0.3], [5.55, 0.3], [5.35, 0.1]], round: 2.4, stations: 6 },
  ],
  guns: [[5.9, 0, -1.2, 1.7, 0.06]],
  glass: [[7.0, 0.3, 0.8, 0.45, 0.38], [5.25, 0.85, 0.85, 0.48, 0.4]],
  finPlan: [[-7.0, 0], [-8.5, 0], [-9.2, 2.1], [-8.4, 2.15]],
  rotorX: 1.2, mastTop: 2.2, stubs: { span: 4.88, pylons: 2 }, stubAt: [0.4, 0.15, 6],
  // The X tail rotor: two pairs of blades about 35 degrees apart.
  tailRotorAt: [-8.85, 2.35], tailRotorDiameter: 3.84, tailScissor: 35,
  // The stabiliser high on the fin, braced by struts.
  tailPlan: [[-8.25, 0.1], [-8.45, 1.6], [-9.05, 1.6], [-9.05, 0.1]], tailUp: 2.6,
  wheelAt: [[4.6, 1.2, -1.6, 0.36], [-7.2, 0, -1.3, 0.2]],
};
// Mi-28N: the radar dome over the rotor and the sensor turret under a rounded nose.
H['mi-28n'] = {
  cls: 'heli-attack', ...HAVOC, mastDome: true, mastDomeSize: [0.5, 0.42, 0.75],
  oneSide: [...HAVOC.oneSide!, { top: [[8.75, -0.3], [8.55, -0.05], [8.05, -0.05], [7.85, -0.3]], bottom: [[8.75, -0.5], [8.55, -0.78], [8.05, -0.78], [7.85, -0.5]], plan: [[8.75, 0.12], [8.55, 0.32], [8.05, 0.32], [7.85, 0.12]], round: 2.2, stations: 6 }],
};
H['mi-28-havoc'] = { cls: 'heli-attack', ...HAVOC };

// Ka-50: one seat behind flat armoured panels well back of a long sloping nose with the Shkval window at its tip,
// a slab-sided deep body, the tall coaxial mast (two rotors 1.4 m apart), the engines in nacelles high on the sides
// behind it, straight stubs with countermeasure pods at the tips, no tail rotor - a swept fin and an end-plated
// tailplane (fuselage 13.5 m, rotor 14.5 m, 4.93 m). Stations and depths judged from public photos (estimates).
export const HOKUM: HeliSpec = {
  length: 13.5, rotor: 14.5, height: 4.93, bodyWidth: 1.35, bodyHeight: 2.2, cabin: 'boxy', rotors: 'coaxial', blades: 3, tailRotor: 'none',
  fuselage: {
    top: [[6.75, -0.3], [6.4, 0.0], [5.5, 0.35], [4.7, 0.6], [4.4, 0.72], [3.7, 1.05], [2.8, 1.2], [0.0, 1.2], [-1.2, 1.1], [-2.4, 0.7], [-6.2, 0.5], [-6.75, 0.5]],
    bottom: [[6.75, -0.45], [6.2, -0.75], [5.0, -0.95], [1.0, -1.0], [-1.2, -0.9], [-2.6, -0.35], [-6.2, 0.1], [-6.75, 0.15]],
    plan: [[6.75, 0.15], [6.2, 0.42], [5.0, 0.55], [3.5, 0.62], [1.0, 0.68], [-1.0, 0.6], [-2.5, 0.32], [-6.75, 0.2]],
    round: [[6.7, 6], [0, 4.5], [-6.7, 3]], stations: 26,
  },
  bodies: [
    { top: [[1.4, 1.0], [1.1, 1.4], [-1.6, 1.35], [-2.2, 1.0]], bottom: [[1.4, 0.55], [1.1, 0.4], [-1.6, 0.4], [-2.2, 0.6]], plan: [[1.4, 0.22], [1.1, 0.36], [-1.6, 0.36], [-2.2, 0.22]], side: 0.85, round: 2.6, stations: 8 },
    { top: [[1.6, 1.2], [1.2, 1.55], [-0.6, 1.55], [-1.2, 1.2]], bottom: [[1.6, 1.15], [-1.2, 1.15]], plan: [[1.6, 0.3], [1.2, 0.45], [-0.6, 0.45], [-1.2, 0.3]], round: 3, stations: 8 },
    { top: [[0.9, 0.1], [0.7, 0.22], [-0.3, 0.22], [-0.5, 0.1]], bottom: [[0.9, 0.1], [0.7, -0.05], [-0.3, -0.05], [-0.5, 0.1]], plan: [[0.9, 0.04], [0.7, 0.14], [-0.3, 0.14], [-0.5, 0.04]], side: 3.67, round: 2.4, stations: 6 },
    // The end plates of the tailplane.
    { top: [[-5.05, 0.55], [-5.15, 0.95], [-5.85, 0.95], [-5.95, 0.55]], bottom: [[-5.05, 0.55], [-5.15, 0.2], [-5.85, 0.2], [-5.95, 0.55]], plan: [[-5.05, 0.02], [-5.15, 0.05], [-5.85, 0.05], [-5.95, 0.02]], side: 1.45, round: 4, stations: 6 },
  ],
  glass: [[4.05, 0.85, 0.72, 0.5, 0.36]],
  finPlan: [[-5.4, 0], [-6.75, 0], [-7.2, 1.7], [-6.5, 1.75]],
  tailPlan: [[-5.0, 0.1], [-5.15, 1.45], [-5.9, 1.45], [-5.9, 0.1]], tailUp: 0.55,
  rotorX: 1.2, mastTop: 1.95, coaxGap: 1.4, stubs: { span: 7.34, pylons: 2 }, stubAt: [0.4, 0.0, 0], wheels: true,
};

// AH-1 Cobra / Viper: very narrow (under a metre), a long stepped tandem canopy, the rotor 4.5 m behind the nose over
// the engine, a boom that sweeps up into a swept fin, short stubs, skids (fuselage 13.9 m, rotor 14.63 m, 4.37 m).
// Depths judged from public three-views (estimates): 1.9 m from the belly to the rear canopy's top, the boom 1.1 m
// deep at its root and 0.5 m at the fin. The engines, sights and turrets come with each variant.
export const COBRA: HeliSpec = {
  length: 13.9, rotor: 14.63, height: 4.37, bodyWidth: 0.95, bodyHeight: 1.9, cabin: 'tandem', blades: 4,
  fuselage: {
    top: [[6.95, -0.18], [6.65, 0.15], [5.98, 0.27], [5.0, 0.88], [4.6, 0.92], [4.45, 1.05], [3.3, 1.09], [3.1, 1.02], [-0.2, 1.0], [-0.65, 0.38], [-4.7, 0.33], [-6.4, 0.4], [-6.95, 0.44]],
    bottom: [[6.95, -0.32], [6.5, -0.62], [5.95, -0.8], [5.0, -0.86], [-0.4, -0.82], [-1.6, -0.62], [-5.8, -0.3], [-6.95, -0.06]],
    plan: [[6.95, 0.1], [6.6, 0.28], [6.0, 0.4], [4.5, 0.46], [1.0, 0.48], [-0.5, 0.42], [-1.2, 0.3], [-6.95, 0.14]],
    round: [[6.9, 3], [4, 3.5], [-1, 3], [-6.9, 2.5]], stations: 26,
  },
  glass: [[5.25, 0.55, 0.72, 0.42, 0.38], [3.9, 0.72, 0.62, 0.42, 0.38]],
  finPlan: [[-4.8, -0.05], [-6.75, 1.35], [-7.25, 1.35], [-6.0, -0.5]],
  tailRotorAt: [-6.65, 1.35],
  rotorX: 2.4, mastTop: 2.35, stubs: { span: 3.3, pylons: 2 }, stubAt: [2.55, 0.05, 0], skidAt: [4.75, 1.0, 0.9, -1.5],
};

// Tiger: stepped tandem with the pilot low in front and the gunner raised 0.7 m higher behind under tall faceted
// glass, the rotor 5.1 m behind the nose on a tall gearbox fairing, long engine nacelles on the shoulders with
// their exhausts at the back, stubs right behind the cockpit, the fuselage sloping down behind the engines into a
// low boom, a swept fin with the tail rotor on its right and an end-plated tailplane low at its foot (fuselage
// 14.08 m, rotor 13.0 m, 3.83 m). Depths and stations judged from public photos (estimates): 2.6 m from the belly
// to the rear canopy's top.
export const TIGER: HeliSpec = {
  length: 14.08, rotor: 13.0, height: 3.83, bodyWidth: 1.2, bodyHeight: 2.6, cabin: 'tandem', blades: 4,
  fuselage: {
    top: [[7.04, -0.37], [6.6, -0.05], [5.66, 0.18], [5.0, 0.75], [4.55, 0.8], [4.46, 1.2], [3.6, 1.5], [2.8, 1.5], [0.0, 1.35], [-1.5, 0.9], [-2.6, 0.25], [-6.0, 0.05], [-7.04, 0.05]],
    bottom: [[7.04, -0.45], [6.4, -0.75], [5.4, -0.95], [4.4, -1.1], [-1.4, -1.1], [-2.4, -0.85], [-6.0, -0.6], [-7.04, -0.5]],
    plan: [[7.04, 0.12], [6.6, 0.38], [5.5, 0.5], [4.0, 0.55], [1.5, 0.62], [-0.6, 0.58], [-1.8, 0.4], [-2.6, 0.3], [-7.04, 0.18]],
    round: [[7, 4], [3, 5], [-2.6, 4], [-7, 3]], stations: 28,
  },
  bodies: [
    { top: [[3.0, 1.4], [2.6, 1.9], [0.8, 1.9], [0.0, 1.4]], bottom: [[3.0, 1.3], [0.0, 1.3]], plan: [[3.0, 0.3], [2.6, 0.45], [0.8, 0.45], [0.0, 0.3]], round: 3, stations: 8 },
    { top: [[2.3, 1.0], [2.0, 1.34], [-1.4, 1.3], [-1.9, 0.9]], bottom: [[2.3, 0.6], [2.0, 0.3], [-1.4, 0.3], [-1.9, 0.6]], plan: [[2.3, 0.2], [2.0, 0.3], [-1.4, 0.3], [-1.9, 0.22]], side: 0.68, round: 2.6, stations: 8 },
    { top: [[-1.4, 1.1], [-1.6, 1.3], [-2.0, 1.25], [-2.2, 1.0]], bottom: [[-1.4, 0.7], [-2.2, 0.75]], plan: [[-1.4, 0.12], [-1.6, 0.2], [-2.0, 0.2], [-2.2, 0.12]], side: 0.8, round: 2.4, stations: 6 },
  ],
  glass: [[4.85, 0.5, 0.55, 0.45, 0.35], [3.75, 1.12, 0.6, 0.47, 0.4]],
  finPlan: [[-5.0, 0], [-6.35, 1.8], [-6.85, 1.8], [-6.9, -0.2]],
  rotorX: 1.98, mastTop: 2.2, stubs: { span: 4.5, pylons: 2 }, stubAt: [3.05, 0.2, 3], wheels: true,
};

// V-22 Osprey: a tiltrotor shown with its rotors up (17.5 m, 25.8 m over the rotors, 6.73 m; rotor 11.6 m).
const A: Named<FixedWingSpec> = {
  'v-22-osprey': { cls: 'tiltrotor', length: 17.5, span: 14.0, height: 6.73, bodyWidth: 2.4, bodyHeight: 2.6, nose: 0.12, blunt: 0.7, wing: { x: 0.0, span: 14.0, rootChord: 2.6, tipChord: 2.4, sweep: 6, mount: 1 }, tail: { kind: 'h', finHeight: 2.0, finChord: 1.8, tailSpan: 5.6, tailChord: 1.4 }, engines: { kind: 'wing-props', count: 2, diameter: 1.4, at: [1.0], up: true, length: 5.0 }, propeller: { diameter: 11.6, blades: 3 }, canopy: { x: 6.5, length: 2, kind: 'airliner' } },
};

export const HELIS: SpecSet = { heli: H, air: A };
