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

const H: Named<HeliSpec> = {};

// A light gyrocopter (generic).
H['gyrocopter'] = { cls: 'heli-scout', length: 4.6, rotor: 8.4, height: 2.6, bodyWidth: 0.8, bodyHeight: 1.0, cabin: 'bubble', blades: 2, tailRotor: 'none', skids: true };

// ---------------------------------------------------------------- attack helicopters from their outlines

// AH-64 Apache: a narrow fuselage with flat stepped tandem canopies, avionics sponsons low on the sides, engine
// pods high behind the mast, short stubs, a thin boom with a tall swept fin and the stabilator at its foot
// (fuselage 15.5 m, rotor 14.63 m, 3.87 m to the rotor head).
export const APACHE: HeliSpec = {
  length: 15.5, rotor: 14.63, height: 3.87, bodyWidth: 1.2, bodyHeight: 1.8, cabin: 'tandem', blades: 4,
  fuselage: { top: [[7.75, -0.2], [7.0, 0.1], [5.6, 0.35], [4.6, 0.75], [3.2, 0.95], [2.4, 1.15], [0.5, 1.1], [-1.5, 0.75], [-3, 0.5], [-7.75, 0.45]], bottom: [[7.75, -0.5], [6.5, -0.75], [3, -0.9], [0, -0.85], [-1.5, -0.5], [-3, -0.15], [-7.75, 0.1]], plan: [[7.75, 0.1], [7.0, 0.42], [5.0, 0.52], [3.0, 0.58], [1.0, 0.6], [-1.0, 0.5], [-2.0, 0.3], [-7.0, 0.2], [-7.75, 0.16]], round: 4, stations: 24 },
  bodies: [
    { top: [[4.6, -0.3], [3.6, 0.1], [0.0, 0.1], [-1, -0.2]], bottom: [[4.6, -0.5], [3.6, -0.85], [0, -0.85], [-1, -0.5]], plan: [[4.6, 0.12], [3.6, 0.32], [0.0, 0.32], [-1.0, 0.12]], side: 0.72, round: 6, stations: 8 },
    { top: [[0.8, 0.85], [0.4, 1.15], [-2.2, 1.1], [-2.6, 0.95]], bottom: [[0.8, 0.55], [0.4, 0.45], [-2.2, 0.45], [-2.6, 0.6]], plan: [[0.8, 0.22], [0.4, 0.36], [-2.2, 0.34], [-2.6, 0.18]], side: 0.78, round: 2.5, stations: 8 },
  ],
  glass: [[5.3, 0.45, 0.75, 0.42, 0.38], [3.4, 0.85, 0.7, 0.42, 0.38]],
  finPlan: [[-6.3, 0], [-7.6, 0], [-8.1, 2.1], [-7.4, 2.1]],
  rotorX: 0.6, mastTop: 1.75, stubs: { span: 5.23, pylons: 2 }, stubAt: [0.4, -0.05, 4], wheels: true,
};

// Mi-24 Hind: big - a bubble for the gunner low in the nose, the pilot's canopy stepped up behind, a troop cabin,
// two engines on top with their intakes forward, stub wings drooping with strong anhedral, a thick boom curving
// up to a swept fin (fuselage 17.5 m, rotor 17.3 m, 6.5 m overall).
export const HIND: HeliSpec = {
  length: 17.5, rotor: 17.3, height: 6.5, bodyWidth: 1.9, bodyHeight: 2.3, cabin: 'tandem', blades: 5,
  fuselage: { top: [[8.75, -0.4], [8.2, 0.0], [7.0, 0.35], [5.6, 0.75], [4.5, 1.05], [3.0, 1.15], [1.5, 1.4], [-1.5, 1.35], [-2.6, 0.9], [-5.0, 0.6], [-8.75, 0.75]], bottom: [[8.75, -0.55], [7.5, -0.9], [4.0, -1.1], [0, -1.15], [-2.0, -0.95], [-3.0, -0.4], [-8.75, 0.25]], plan: [[8.75, 0.15], [8.0, 0.5], [6.0, 0.62], [4.0, 0.85], [2.0, 0.95], [-1.5, 0.9], [-2.5, 0.5], [-8.4, 0.3], [-8.75, 0.2]], round: [[8.7, 3], [4, 3.5], [-3, 3], [-8.7, 2.5]], stations: 26 },
  bodies: [{ top: [[3.0, 1.15], [2.6, 1.6], [-1.6, 1.6], [-2.2, 1.3]], bottom: [[3.0, 0.85], [2.6, 0.8], [-1.6, 0.8], [-2.2, 1.0]], plan: [[3.0, 0.2], [2.6, 0.42], [-1.6, 0.42], [-2.2, 0.2]], side: 0.68, round: 2.4, stations: 8 }],
  glass: [[7.1, 0.15, 0.9, 0.45, 0.45], [5.0, 0.75, 0.9, 0.5, 0.45]],
  finPlan: [[-7.4, 0], [-8.5, 0], [-9.3, 2.3], [-8.5, 2.3]],
  rotorX: 0.4, mastTop: 2.2, stubs: { span: 6.6, pylons: 3 }, stubAt: [-0.6, -0.1, 12], wheels: true,
};

// Mi-28: the Hind's layout made narrow and armoured - flat stepped tandem canopies, engines on the sides, short
// stubs with slight anhedral, a boom with fin and the X tail rotor (fuselage 17.01 m, rotor 17.2 m, 3.82 m to the head).
export const HAVOC: HeliSpec = {
  length: 17.01, rotor: 17.2, height: 3.82, bodyWidth: 1.5, bodyHeight: 2.1, cabin: 'tandem', blades: 5,
  fuselage: { top: [[8.5, -0.35], [7.8, 0.05], [6.6, 0.45], [5.4, 0.85], [4.0, 1.1], [2.5, 1.25], [0, 1.3], [-1.6, 1.0], [-2.8, 0.6], [-8.5, 0.55]], bottom: [[8.5, -0.5], [7.5, -0.85], [4.0, -1.0], [0, -0.95], [-2.0, -0.6], [-3, -0.2], [-8.5, 0.2]], plan: [[8.5, 0.12], [7.6, 0.45], [5.5, 0.6], [3.0, 0.72], [0.5, 0.72], [-1.5, 0.55], [-2.5, 0.35], [-8.5, 0.22]], round: 4, stations: 24 },
  bodies: [{ top: [[2.2, 1.0], [1.8, 1.35], [-1.6, 1.35], [-2.2, 1.1]], bottom: [[2.2, 0.6], [1.8, 0.5], [-1.6, 0.5], [-2.2, 0.7]], plan: [[2.2, 0.2], [1.8, 0.4], [-1.6, 0.4], [-2.2, 0.2]], side: 0.85, round: 2.5, stations: 8 }],
  glass: [[6.4, 0.35, 0.8, 0.4, 0.35], [4.6, 0.85, 0.8, 0.4, 0.35]],
  finPlan: [[-7.0, 0], [-8.4, 0], [-9.0, 2.0], [-8.2, 2.0]],
  rotorX: 0.2, mastTop: 2.0, stubs: { span: 4.88, pylons: 2 }, stubAt: [0.0, 0.05, 6],
  // The X-shaped tail rotor high on the fin (on the right, est), the stabiliser at the fin's foot, a fixed tail-wheel gear
  // with the main legs under the cockpits.
  tailRotorAt: [-8.7, 2.3], tailRotorDiameter: 3.84,
  tailPlan: [[-7.0, 0.15], [-7.1, 1.6], [-7.8, 1.6], [-7.8, 0.15]], tailUp: 0.75,
  wheelAt: [[3.6, 1.15, -1.6, 0.36], [-6.8, 0, -1.4, 0.2]],
};
H['mi-28n'] = { cls: 'heli-attack', ...HAVOC, mastDome: true };
H['mi-28-havoc'] = { cls: 'heli-attack', ...HAVOC };

// Ka-50: one seat, the coaxial rotors, a slender boxy nose, engines high on the sides, straight stubs, no tail
// rotor - a plain fin (fuselage 13.5 m, rotor 14.5 m, 4.93 m).
export const HOKUM: HeliSpec = {
  length: 13.5, rotor: 14.5, height: 4.93, bodyWidth: 1.4, bodyHeight: 2.0, cabin: 'boxy', rotors: 'coaxial', blades: 3, tailRotor: 'none',
  fuselage: { top: [[6.75, -0.3], [6.0, 0.2], [4.8, 0.6], [3.6, 0.85], [1.0, 1.1], [-1.0, 0.95], [-2.5, 0.5], [-6.75, 0.4]], bottom: [[6.75, -0.5], [5.5, -0.8], [2, -0.95], [-1, -0.85], [-2.6, -0.3], [-6.75, 0.1]], plan: [[6.75, 0.15], [6.0, 0.5], [4.0, 0.62], [1.5, 0.7], [-1.0, 0.6], [-2.5, 0.3], [-6.75, 0.2]], round: [[6.7, 6], [0, 4], [-6.7, 3]], stations: 22 },
  bodies: [{ top: [[1.0, 0.85], [0.6, 1.15], [-2.0, 1.1], [-2.6, 0.9]], bottom: [[1.0, 0.45], [0.6, 0.4], [-2.0, 0.4], [-2.6, 0.5]], plan: [[1.0, 0.22], [0.6, 0.4], [-2.0, 0.4], [-2.6, 0.2]], side: 0.95, round: 2.5, stations: 8 }],
  glass: [[4.6, 0.55, 0.9, 0.5, 0.35]],
  finPlan: [[-5.4, 0], [-6.8, 0], [-7.2, 1.8], [-6.4, 1.8]],
  rotorX: 0.4, mastTop: 1.6, stubs: { span: 7.34, pylons: 2 }, stubAt: [0.2, 0.0, 0], wheels: true,
};
// Ka-52: the same with two seats side by side in a broad nose and a radar ball on it.

// AH-1 Cobra / Viper: very narrow, a long stepped tandem canopy, the engine on top, short stubs, skids (fuselage 13.9 m, rotor 14.63 m, 4.37 m).
export const COBRA: HeliSpec = {
  length: 13.9, rotor: 14.63, height: 4.37, bodyWidth: 1.0, bodyHeight: 1.8, cabin: 'tandem', blades: 4,
  fuselage: { top: [[6.95, -0.25], [6.2, 0.05], [5.0, 0.45], [3.8, 0.6], [2.6, 0.85], [1.2, 1.05], [-1.5, 0.95], [-2.8, 0.45], [-6.95, 0.4]], bottom: [[6.95, -0.45], [5.5, -0.75], [1, -0.85], [-2, -0.6], [-3, -0.15], [-6.95, 0.15]], plan: [[6.95, 0.1], [6.2, 0.35], [4.0, 0.45], [1.5, 0.5], [-1.0, 0.45], [-2.5, 0.25], [-6.95, 0.15]], round: 3, stations: 22 },
  glass: [[4.9, 0.35, 0.8, 0.33, 0.3], [3.3, 0.65, 0.85, 0.33, 0.32]],
  finPlan: [[-5.6, 0], [-6.9, 0], [-7.4, 1.9], [-6.6, 1.9]],
  rotorX: 0.6, mastTop: 1.75, stubs: { span: 3.3, pylons: 2 }, stubAt: [0.6, -0.1, 0], skids: true,
};

// Tiger: stepped tandem (the pilot in front), engines on the sides, stubs, a fin and an end-plated tailplane (fuselage 14.08 m, rotor 13.0 m, 3.83 m).
export const TIGER: HeliSpec = {
  length: 14.08, rotor: 13.0, height: 3.83, bodyWidth: 1.2, bodyHeight: 1.8, cabin: 'tandem', blades: 4,
  fuselage: { top: [[7.04, -0.3], [6.3, 0.1], [5.0, 0.5], [3.8, 0.7], [2.6, 0.95], [1.0, 1.15], [-1.2, 0.95], [-2.6, 0.45], [-7.04, 0.4]], bottom: [[7.04, -0.45], [5.8, -0.8], [1.5, -0.85], [-1.5, -0.6], [-2.8, -0.2], [-7.04, 0.1]], plan: [[7.04, 0.12], [6.2, 0.45], [4.0, 0.55], [1.5, 0.6], [-1.0, 0.5], [-2.4, 0.28], [-7.04, 0.18]], round: 4, stations: 22 },
  bodies: [{ top: [[1.2, 0.85], [0.8, 1.1], [-1.6, 1.05], [-2.2, 0.85]], bottom: [[1.2, 0.5], [0.8, 0.45], [-1.6, 0.45], [-2.2, 0.55]], plan: [[1.2, 0.2], [0.8, 0.34], [-1.6, 0.34], [-2.2, 0.18]], side: 0.6, round: 2.5, stations: 8 }],
  glass: [[5.0, 0.4, 0.85, 0.38, 0.33], [3.3, 0.75, 0.85, 0.38, 0.33]],
  finPlan: [[-5.8, 0], [-7.0, 0], [-7.3, 1.6], [-6.6, 1.6]],
  rotorX: 0.3, mastTop: 1.6, stubs: { span: 4.5, pylons: 2 }, stubAt: [0.3, -0.05, 3], wheels: true,
};

// V-22 Osprey: a tiltrotor shown with its rotors up (17.5 m, 25.8 m over the rotors, 6.73 m; rotor 11.6 m).
const A: Named<FixedWingSpec> = {
  'v-22-osprey': { cls: 'tiltrotor', length: 17.5, span: 14.0, height: 6.73, bodyWidth: 2.4, bodyHeight: 2.6, nose: 0.12, blunt: 0.7, wing: { x: 0.0, span: 14.0, rootChord: 2.6, tipChord: 2.4, sweep: 6, mount: 1 }, tail: { kind: 'h', finHeight: 2.0, finChord: 1.8, tailSpan: 5.6, tailChord: 1.4 }, engines: { kind: 'wing-props', count: 2, diameter: 1.4, at: [1.0], up: true, length: 5.0 }, propeller: { diameter: 11.6, blades: 3 }, canopy: { x: 6.5, length: 2, kind: 'airliner' } },
};

export const HELIS: SpecSet = { heli: H, air: A };
