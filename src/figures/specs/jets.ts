/**
 * Jet aircraft: fighters, attack aircraft, trainers, bombers, tankers,
 * AWACS and transports, from the first jets to now. A family shares a base:
 * the Flankers (Su-27, Su-30, Su-33, Su-35, J-11) differ by canards and
 * canopy; swing-wing types carry their glove and are shown at a middle sweep.
 *
 * Length, span and height are published values; body width and height,
 * chords and fin sizes are judged from three-view drawings (estimates, not
 * marked one by one). A swing wing's span is the span at the sweep drawn.
 */

import type { Named, SpecSet } from './index';
import type { FixedWingSpec } from '../air';

const A: Named<FixedWingSpec> = {};

// ---------------------------------------------------------------- US fighters and attack

// F-4E Phantom II: 19.2 x 11.7 x 5.0 m; side intakes, two engines, tandem canopy, drooped tailplane drawn level.
A['f-4e'] = { cls: 'fighter', length: 19.2, span: 11.7, height: 5.0, bodyWidth: 2.4, bodyHeight: 1.7, nose: 0.2, wing: { x: -1.4, span: 11.7, rootChord: 6.0, tipChord: 1.8, sweep: 45, mount: -0.3, dihedral: 4 }, tail: { kind: 'single', finHeight: 2.8, finChord: 3.4, tailSpan: 5.5, tailChord: 2.0 }, engines: { kind: 'internal', count: 2, diameter: 1.0 }, intakes: 'side', canopy: { x: 3.6, length: 4.0, kind: 'tandem' } };
// F-14 Tomcat: 19.1 m long, 19.55 m spread / 11.65 m swept, 4.88 m; wide-set nacelles, twin fins, a big glove.
A['f-14a'] = { cls: 'fighter', length: 19.1, span: 15.0, height: 4.88, bodyWidth: 3.6, bodyHeight: 1.6, nose: 0.2, wing: { x: -2.4, span: 15.0, rootChord: 3.4, tipChord: 1.2, sweep: 40, mount: 0.6, glove: { span: 6.2, chord: 5.0 } }, tail: { kind: 'twin', finHeight: 3.0, finChord: 3.0, cant: 5, spacing: 3.2, tailSpan: 9.9, tailChord: 2.8 }, engines: { kind: 'internal', count: 2, diameter: 1.25 }, intakes: 'side', canopy: { x: 5.0, length: 4.0, kind: 'tandem' } };
A['f-14b'] = { ...A['f-14a'] };
// F-15E Strike Eagle: the F-15 with a second seat and conformal tanks.
A['f-15e'] = { cls: 'multirole', length: 19.43, span: 13.05, height: 5.63, bodyWidth: 3.0, bodyHeight: 1.8, nose: 0.2, wing: { x: -2.0, span: 13.05, rootChord: 6.5, tipChord: 1.7, sweep: 45, mount: 0.7 }, tail: { kind: 'twin', finHeight: 3.1, finChord: 3.0, spacing: 2.6, tailSpan: 8.6, tailChord: 2.8 }, engines: { kind: 'internal', count: 2, diameter: 1.15 }, intakes: 'side', canopy: { x: 4.6, length: 4.4, kind: 'tandem' } };
// F/A-18C Hornet: the starter with its long LERX (17.1 x 12.3 x 4.7 m).
A['f-a-18c'] = { cls: 'multirole', length: 17.1, span: 12.3, height: 4.7, bodyWidth: 2.0, bodyHeight: 1.6, nose: 0.2, lerx: { length: 4.4, span: 0.8 }, wing: { x: -1.6, span: 11.4, rootChord: 4.6, tipChord: 1.7, sweep: 26, mount: 0.2 }, tail: { kind: 'twin', finHeight: 3.0, finChord: 2.6, cant: 20, spacing: 2.0, tailSpan: 6.6, tailChord: 2.4 }, engines: { kind: 'internal', count: 2, diameter: 1.0 }, intakes: 'side', canopy: { x: 4.0, length: 3.2, kind: 'bubble' } };
// F-16C: the starter with its small strakes and a two-seat D (15.06 x 9.96 x 4.88 m).
A['f-16c'] = { cls: 'multirole', length: 15.0, span: 9.96, height: 4.9, bodyWidth: 1.6, bodyHeight: 1.6, nose: 0.2, lerx: { length: 2.4, span: 0.45 }, wing: { x: -1.2, span: 9.5, rootChord: 5.0, tipChord: 1.2, sweep: 40, mount: 0 }, tail: { kind: 'single', finHeight: 2.8, finChord: 3.3, tailSpan: 5.6, tailChord: 2.0 }, engines: { kind: 'internal', count: 1, diameter: 1.15 }, intakes: 'chin', canopy: { x: 3.4, length: 3.0, kind: 'bubble' } };
A['f-16d'] = { ...A['f-16c'], canopy: { x: 3.2, length: 3.8, kind: 'tandem' } };
// F/A-18E/F Super Hornet: bigger than the C, square intakes (18.31 x 13.62 x 4.88 m).
A['f-a-18e'] = { cls: 'multirole', length: 18.31, span: 13.62, height: 4.88, bodyWidth: 2.2, bodyHeight: 1.7, nose: 0.2, lerx: { length: 4.8, span: 0.9 }, wing: { x: -1.8, span: 13.62, rootChord: 5.0, tipChord: 1.8, sweep: 28, mount: 0.2 }, tail: { kind: 'twin', finHeight: 3.1, finChord: 2.8, cant: 20, spacing: 2.2, tailSpan: 7.0, tailChord: 2.6 }, engines: { kind: 'internal', count: 2, diameter: 1.0 }, intakes: 'side', canopy: { x: 4.2, length: 3.4, kind: 'bubble' } };
// F-5E Tiger II: small, a sharp nose, twin engines, low wing (14.45 x 8.13 x 4.08 m).
A['f-5e'] = { cls: 'fighter', length: 14.45, span: 8.13, height: 4.08, bodyWidth: 1.4, bodyHeight: 1.3, nose: 0.28, wing: { x: -1.0, span: 8.13, rootChord: 3.6, tipChord: 0.7, sweep: 32, mount: -0.6 }, tail: { kind: 'single', finHeight: 2.0, finChord: 2.6, tailSpan: 4.2, tailChord: 1.3 }, engines: { kind: 'internal', count: 2, diameter: 0.6 }, intakes: 'side', canopy: { x: 3.3, length: 2.2, kind: 'bubble' } };
// F-86F Sabre: nose intake, 35-degree wing (11.4 x 11.3 x 4.5 m).
A['f-86f'] = { cls: 'fighter', length: 11.4, span: 11.3, height: 4.5, bodyWidth: 1.45, bodyHeight: 1.6, nose: 0.12, blunt: 0.75, wing: { x: 0.2, span: 11.3, rootChord: 3.2, tipChord: 1.3, sweep: 37, mount: -0.6, dihedral: 3 }, tail: { kind: 'single', finHeight: 2.3, finChord: 2.4, tailSpan: 3.9, tailChord: 1.2 }, engines: { kind: 'internal', count: 1, diameter: 0.9 }, intakes: 'nose', canopy: { x: 2.2, length: 1.9, kind: 'bubble' } };
// F-100D Super Sabre: an oval nose intake, a 45-degree wing (15.09 x 11.81 x 4.95 m).
A['f-100d'] = { cls: 'fighter', length: 15.09, span: 11.81, height: 4.95, bodyWidth: 1.7, bodyHeight: 1.8, nose: 0.1, blunt: 0.8, wing: { x: -1.2, span: 11.81, rootChord: 4.6, tipChord: 1.4, sweep: 49, mount: -0.6 }, tail: { kind: 'single', finHeight: 2.8, finChord: 3.4, tailSpan: 5.6, tailChord: 1.6 }, engines: { kind: 'internal', count: 1, diameter: 1.0 }, intakes: 'nose', canopy: { x: 3.0, length: 2.2, kind: 'bubble' } };
// F-117A: a faceted flying arrow with a V tail (20.08 x 13.2 x 3.78 m).
A['f-117a'] = { cls: 'attack', length: 20.08, span: 13.2, height: 3.78, bodyWidth: 3.2, bodyHeight: 1.5, nose: 0.4, wing: { x: -3.5, span: 13.2, rootChord: 11.0, tipChord: 1.0, sweep: 67, mount: 0 }, tail: { kind: 'v', finHeight: 3.0, finChord: 2.4, tailSpan: 0, tailChord: 0 }, engines: { kind: 'internal', count: 2, diameter: 0.8 }, intakes: 'dorsal', canopy: { x: 4.5, length: 2.6, kind: 'framed' } };
// F-22 Raptor: a diamond wing, twin canted fins, twin engines (18.92 x 13.56 x 5.08 m).
A['f-22'] = { cls: 'fighter', length: 18.92, span: 13.56, height: 5.08, bodyWidth: 3.0, bodyHeight: 1.7, nose: 0.2, wing: { x: -2.4, span: 13.56, rootChord: 7.6, tipChord: 1.2, sweep: 42, mount: 0.4 }, tail: { kind: 'twin', finHeight: 2.6, finChord: 2.8, cant: 28, spacing: 3.6, tailSpan: 8.8, tailChord: 2.4 }, engines: { kind: 'internal', count: 2, diameter: 1.1 }, intakes: 'side', canopy: { x: 4.6, length: 3.4, kind: 'bubble' } };
// F-35A/B/C Lightning II: one engine, canted twin fins, side intakes (15.67 x 10.7 x 4.38 m).
A['f-35a'] = { cls: 'multirole', length: 15.67, span: 10.7, height: 4.38, bodyWidth: 2.6, bodyHeight: 1.8, nose: 0.2, wing: { x: -1.8, span: 10.7, rootChord: 6.0, tipChord: 1.5, sweep: 34, mount: 0.4 }, tail: { kind: 'twin', finHeight: 2.2, finChord: 2.4, cant: 25, spacing: 2.6, tailSpan: 6.6, tailChord: 2.2 }, engines: { kind: 'internal', count: 1, diameter: 1.2 }, intakes: 'side', canopy: { x: 3.6, length: 3.0, kind: 'bubble' } };
// A-6E Intruder: a fat side-by-side cockpit nose, mid wing (16.69 x 16.15 x 4.93 m).
A['a-6e'] = { cls: 'attack', length: 16.69, span: 16.15, height: 4.93, bodyWidth: 2.6, bodyHeight: 2.2, nose: 0.18, blunt: 0.85, wing: { x: -0.8, span: 16.15, rootChord: 4.4, tipChord: 1.6, sweep: 25, mount: 0 }, tail: { kind: 'single', finHeight: 2.8, finChord: 3.4, tailSpan: 6.2, tailChord: 2.0 }, engines: { kind: 'internal', count: 2, diameter: 0.9 }, intakes: 'side', canopy: { x: 4.4, length: 2.6, kind: 'bubble' } };
// S-3B Viking: high wing, two pods under it (16.26 x 20.93 x 6.93 m).
A['s-3b'] = { cls: 'patrol', length: 16.26, span: 20.93, height: 6.93, bodyWidth: 2.5, bodyHeight: 2.6, nose: 0.15, blunt: 0.8, wing: { x: 0.0, span: 20.93, rootChord: 3.8, tipChord: 1.6, sweep: 15, mount: 1 }, tail: { kind: 'single', finHeight: 4.0, finChord: 3.4, tailSpan: 8.2, tailChord: 2.0 }, engines: { kind: 'wing-pods', count: 2, diameter: 1.2, at: [0.3], length: 3.4 }, canopy: { x: 5.6, length: 2, kind: 'airliner' } };
// AV-8B Harrier II: a shoulder wing with anhedral, big intakes beside the cockpit (14.12 x 9.25 x 3.55 m).
A['av-8b'] = { cls: 'attack', length: 14.12, span: 9.25, height: 3.55, bodyWidth: 2.4, bodyHeight: 1.8, nose: 0.22, wing: { x: -0.6, span: 9.25, rootChord: 4.0, tipChord: 1.3, sweep: 34, mount: 1, dihedral: -12 }, tail: { kind: 'single', finHeight: 1.9, finChord: 2.2, tailSpan: 4.2, tailChord: 1.4 }, engines: { kind: 'internal', count: 1, diameter: 1.2 }, intakes: 'side', canopy: { x: 3.4, length: 2.4, kind: 'bubble' } };
// B-52H: eight engines in four paired pods under a high wing (48.5 x 56.4 x 12.4 m).
A['b-52h'] = { cls: 'bomber', length: 48.5, span: 56.4, height: 12.4, bodyWidth: 3.0, bodyHeight: 3.6, nose: 0.08, blunt: 0.7, wing: { x: 0.0, span: 56.4, rootChord: 13.0, tipChord: 3.0, sweep: 36, mount: 1, dihedral: -3 }, tail: { kind: 'single', finHeight: 6.2, finChord: 8.0, tailSpan: 15.0, tailChord: 4.0 }, engines: { kind: 'wing-pods', count: 8, diameter: 1.25, at: [0.3, 0.6], pair: true, length: 5.2 }, canopy: { x: 20, length: 2, kind: 'airliner' } };
// B-1B Lancer: swing wing over a blended body, four engines in two pairs under it (44.5 m long, 41.8 / 24.1 m span, 10.4 m).
A['b-1b'] = { cls: 'bomber', length: 44.5, span: 33.0, height: 10.4, bodyWidth: 4.4, bodyHeight: 3.6, nose: 0.16, wing: { x: -1.5, span: 33.0, rootChord: 6.5, tipChord: 2.4, sweep: 40, mount: 0.4, glove: { span: 13.7, chord: 9.0 } }, tail: { kind: 'single', finHeight: 6.0, finChord: 6.5, tailSpan: 13.7, tailChord: 3.8 }, engines: { kind: 'wing-pods', count: 4, diameter: 1.5, at: [0.22], pair: true, length: 7.0 }, canopy: { x: 17, length: 2, kind: 'airliner' } };

// ---------------------------------------------------------------- F-16 family

// F-16C: the starter `f-16c`. Blocks and the A differ inside, not out.

// ---------------------------------------------------------------- transports, tankers, AWACS

// Boeing 707 family (KC-135, E-3): low swept wing, four pods (KC-135 41.53 x 39.88 x 12.7 m).
A['kc-135'] = { cls: 'tanker', length: 41.53, span: 39.88, height: 12.7, bodyWidth: 3.7, bodyHeight: 4.0, nose: 0.08, blunt: 0.75, wing: { x: 1.0, span: 39.88, rootChord: 8.0, tipChord: 2.4, sweep: 35, mount: -0.8, dihedral: 6 }, tail: { kind: 'single', finHeight: 8.0, finChord: 6.0, tailSpan: 12.5, tailChord: 3.6 }, engines: { kind: 'wing-pods', count: 4, diameter: 1.5, at: [0.35, 0.62], length: 4.6 }, canopy: { x: 18, length: 2, kind: 'airliner' } };
// E-3 Sentry: the 707 with its 9.1 m rotodome (46.61 x 44.42 x 12.6 m).
A['e-3a'] = { ...A['kc-135'], cls: 'awacs', length: 46.61, span: 44.42, height: 12.6, rotodome: { x: -5.5, diameter: 9.1 } };
// Il-76 family: high wing, T-tail, four pods (46.59 x 50.5 x 14.76 m); A-50 and KJ-2000 add a 10 m rotodome.
A['il-76md'] = { cls: 'transport', length: 46.59, span: 50.5, height: 14.76, bodyWidth: 4.8, bodyHeight: 4.8, nose: 0.1, blunt: 0.6, wing: { x: 0.0, span: 50.5, rootChord: 9.0, tipChord: 3.0, sweep: 25, mount: 1, dihedral: -3 }, tail: { kind: 't', finHeight: 7.0, finChord: 7.0, tailSpan: 17.4, tailChord: 4.0 }, engines: { kind: 'wing-pods', count: 4, diameter: 1.7, at: [0.32, 0.56], length: 5.0 }, canopy: { x: 20, length: 2, kind: 'airliner' } };
A['a-50'] = { ...A['il-76md'], cls: 'awacs', rotodome: { x: -3.0, diameter: 10.0 } };
// C-17A: high wing, T-tail, four big pods (53.04 x 51.75 x 16.79 m).
A['c-17a'] = { cls: 'transport', length: 53.04, span: 51.75, height: 16.79, bodyWidth: 6.9, bodyHeight: 6.0, nose: 0.1, blunt: 0.7, wing: { x: 1.0, span: 51.75, rootChord: 10.0, tipChord: 3.0, sweep: 25, mount: 1, dihedral: -3 }, tail: { kind: 't', finHeight: 8.0, finChord: 8.0, tailSpan: 19.8, tailChord: 4.5 }, engines: { kind: 'wing-pods', count: 4, diameter: 2.4, at: [0.33, 0.58], length: 5.5 }, canopy: { x: 23, length: 2, kind: 'airliner' } };
// C-130J-30: the stretched Hercules (34.37 m) with six-bladed props.
A['c-130j-30'] = { cls: 'transport', length: 34.37, span: 40.4, height: 11.84, bodyWidth: 4.3, bodyHeight: 4.6, nose: 0.12, blunt: 0.7, wing: { x: 1.0, span: 40.4, rootChord: 4.9, tipChord: 2.8, sweep: 2, mount: 1 }, tail: { kind: 'single', finHeight: 6.0, finChord: 6.0, tailSpan: 16.0, tailChord: 4.0 }, engines: { kind: 'wing-props', count: 4, diameter: 1.0, at: [0.26, 0.5] }, propeller: { diameter: 4.1, blades: 6 }, canopy: { x: 15, length: 2, kind: 'airliner' } };
// E-2C Hawkeye: high wing, two turboprops, a 7.3 m rotodome, the four-finned tail (17.6 x 24.56 x 5.58 m).
A['e-2c'] = { cls: 'awacs', length: 17.6, span: 24.56, height: 5.58, bodyWidth: 2.4, bodyHeight: 2.6, nose: 0.12, blunt: 0.8, wing: { x: 1.0, span: 24.56, rootChord: 3.4, tipChord: 1.6, sweep: 3, mount: 1 }, tail: { kind: 'h', finHeight: 2.6, finChord: 1.8, tailSpan: 7.9, tailChord: 1.6 }, engines: { kind: 'wing-props', count: 2, diameter: 1.2, at: [0.3] }, propeller: { diameter: 4.1, blades: 4 }, rotodome: { x: -1.0, diameter: 7.3 }, canopy: { x: 6.5, length: 2, kind: 'airliner' } };
// An-26 / An-30: high wing, two turboprops, a single fin (23.8 x 29.2 x 8.58 m).
A['an-26'] = { cls: 'transport', length: 23.8, span: 29.2, height: 8.58, bodyWidth: 2.9, bodyHeight: 2.9, nose: 0.1, blunt: 0.7, wing: { x: 1.2, span: 29.2, rootChord: 3.6, tipChord: 1.4, sweep: 7, mount: 1, dihedral: -2 }, tail: { kind: 'single', finHeight: 4.6, finChord: 4.6, tailSpan: 10.0, tailChord: 2.4 }, engines: { kind: 'wing-props', count: 2, diameter: 1.3, at: [0.28] }, propeller: { diameter: 3.9, blades: 4 }, canopy: { x: 10, length: 2, kind: 'airliner' } };
// Yak-40: three engines at the tail, a T-tail (20.36 x 25.0 x 6.5 m).
A['yak-40'] = { cls: 'transport', length: 20.36, span: 25.0, height: 6.5, bodyWidth: 2.4, bodyHeight: 2.6, nose: 0.1, blunt: 0.7, wing: { x: 1.0, span: 25.0, rootChord: 3.8, tipChord: 1.6, sweep: 2, mount: -0.8, dihedral: 5 }, tail: { kind: 't', finHeight: 3.4, finChord: 3.6, tailSpan: 7.5, tailChord: 2.0 }, engines: { kind: 'rear-pods', count: 2, diameter: 1.0 }, canopy: { x: 8.5, length: 2, kind: 'airliner' } };
// Tu-95MS / Tu-142: four turboprops with contra-rotating props on a swept wing (49.5 x 50.1 x 12.12 m; Tu-142 53.08 m).
A['tu-95ms'] = { cls: 'bomber', length: 49.5, span: 50.1, height: 12.12, bodyWidth: 3.0, bodyHeight: 3.4, nose: 0.08, blunt: 0.7, wing: { x: 1.0, span: 50.1, rootChord: 9.0, tipChord: 3.0, sweep: 35, mount: 0.2 }, tail: { kind: 'single', finHeight: 6.5, finChord: 7.0, tailSpan: 14.8, tailChord: 4.4 }, engines: { kind: 'wing-props', count: 4, diameter: 1.4, at: [0.3, 0.55], length: 7.0 }, propeller: { diameter: 5.6, blades: 8 }, canopy: { x: 20, length: 2, kind: 'airliner' } };
A['tu-142'] = { ...A['tu-95ms'], length: 53.08 };
// Tu-22M3: swing wing, side intakes, a single big fin (42.46 m long, 34.28 / 23.3 m span, 11.05 m).
A['tu-22m3'] = { cls: 'bomber', length: 42.46, span: 29.0, height: 11.05, bodyWidth: 4.6, bodyHeight: 3.2, nose: 0.14, wing: { x: -1.5, span: 29.0, rootChord: 5.6, tipChord: 2.2, sweep: 40, mount: -0.2, glove: { span: 10.0, chord: 10.0 } }, tail: { kind: 'single', finHeight: 6.0, finChord: 7.0, tailSpan: 13.0, tailChord: 4.4 }, engines: { kind: 'internal', count: 2, diameter: 1.6 }, intakes: 'side', canopy: { x: 15, length: 3, kind: 'framed' } };
// Tu-160: a bigger swing-wing bomber, the engines in pairs under the wing roots (54.1 m, 55.7 / 35.6 m, 13.1 m).
A['tu-160'] = { cls: 'bomber', length: 54.1, span: 45.0, height: 13.1, bodyWidth: 5.0, bodyHeight: 3.8, nose: 0.15, wing: { x: -2.0, span: 45.0, rootChord: 7.0, tipChord: 2.4, sweep: 40, mount: 0.2, glove: { span: 19.0, chord: 14.0 } }, tail: { kind: 'single', finHeight: 7.5, finChord: 8.0, tailSpan: 13.3, tailChord: 4.4 }, engines: { kind: 'wing-pods', count: 4, diameter: 1.7, at: [0.3], pair: true, length: 9.0 }, canopy: { x: 20, length: 3, kind: 'framed' } };
// H-6 (Tu-16): engines in the wing roots, a 35-degree wing (34.8 x 33.0 x 10.36 m).
A['h-6'] = { cls: 'bomber', length: 34.8, span: 33.0, height: 10.36, bodyWidth: 2.6, bodyHeight: 2.8, nose: 0.1, blunt: 0.6, wing: { x: -0.5, span: 33.0, rootChord: 7.5, tipChord: 2.6, sweep: 37, mount: 0, dihedral: -3 }, tail: { kind: 'single', finHeight: 5.6, finChord: 6.0, tailSpan: 11.8, tailChord: 3.2 }, engines: { kind: 'wing-pods', count: 2, diameter: 1.8, at: [0.13], length: 9.0 }, canopy: { x: 14.5, length: 2.4, kind: 'glass-nose' } };

// ---------------------------------------------------------------- Soviet and Russian fighters

// The Flanker family: Su-27 (starter), J-11A the same; Su-30 two seats; Su-33 and Su-30 canards; Su-34 a wide flat nose.
const FLANKER: FixedWingSpec = { lerx: { length: 5.0, span: 0.9 }, sting: 1.6, length: 21.9, span: 14.7, height: 5.9, bodyWidth: 2.4, bodyHeight: 1.6, nose: 0.22, wing: { x: -2.2, span: 14.7, rootChord: 6.5, tipChord: 1.6, sweep: 42, mount: 0.2 }, tail: { kind: 'twin', finHeight: 3.4, finChord: 3.0, spacing: 4.3, tailSpan: 9.9, tailChord: 3.0 }, engines: { kind: 'internal', count: 2, diameter: 1.2 }, intakes: 'under', canopy: { x: 5.6, length: 3.4, kind: 'bubble' } };
A['su-30'] = { ...FLANKER, cls: 'multirole', length: 21.94, canard: { x: 4.6, span: 6.4, chord: 1.4 }, canopy: { x: 5.4, length: 4.2, kind: 'tandem' } };
A['su-33'] = { ...FLANKER, cls: 'fighter', length: 21.94, canard: { x: 4.6, span: 6.4, chord: 1.4 } };
A['su-35'] = { ...FLANKER, cls: 'fighter', length: 21.9, span: 15.3 };
A['su-34'] = { ...FLANKER, cls: 'bomber', length: 23.34, height: 6.09, bodyWidth: 2.6, blunt: 0.5, canard: { x: 4.4, span: 6.4, chord: 1.3 }, canopy: { x: 6.6, length: 3.2, kind: 'framed' } };
// Su-27: the starter with its strakes and tail sting, which tell it from an F-15 from above.
A['su-27'] = { ...FLANKER, cls: 'fighter' };
// MiG-29: strakes running forward to the cockpit, wide-set engines, no sting (17.32 x 11.36 x 4.73 m).
A['mig-29a'] = { cls: 'fighter', length: 17.32, span: 11.36, height: 4.73, bodyWidth: 2.2, bodyHeight: 1.5, nose: 0.22, lerx: { length: 3.6, span: 0.8 }, wing: { x: -1.8, span: 11.36, rootChord: 5.2, tipChord: 1.4, sweep: 42, mount: 0.2 }, tail: { kind: 'twin', finHeight: 2.8, finChord: 2.6, cant: 6, spacing: 3.8, tailSpan: 7.8, tailChord: 2.6 }, engines: { kind: 'internal', count: 2, diameter: 1.0 }, intakes: 'under', canopy: { x: 4.4, length: 3.0, kind: 'bubble' } };
// Su-57: a long flat body, small canted fins, wide-set engines (20.1 x 14.1 x 4.6 m).
A['su-57'] = { cls: 'fighter', length: 20.1, span: 14.1, height: 4.6, bodyWidth: 3.6, bodyHeight: 1.5, nose: 0.2, wing: { x: -2.2, span: 14.1, rootChord: 7.4, tipChord: 1.4, sweep: 48, mount: 0.2 }, tail: { kind: 'twin', finHeight: 2.2, finChord: 2.4, cant: 26, spacing: 4.4, tailSpan: 10.0, tailChord: 2.6 }, engines: { kind: 'internal', count: 2, diameter: 1.2 }, intakes: 'under', canopy: { x: 5.2, length: 3.2, kind: 'bubble' } };
// MiG-23MLD / MiG-27K: swing wing, side intakes, a big fin (MiG-23MLD 16.7 m, 13.97 / 7.78 m, 4.82 m).
A['mig-23mld'] = { cls: 'fighter', length: 16.7, span: 10.5, height: 4.82, bodyWidth: 2.2, bodyHeight: 1.7, nose: 0.2, wing: { x: -1.6, span: 10.5, rootChord: 3.6, tipChord: 1.4, sweep: 45, mount: 0.6, glove: { span: 4.0, chord: 3.0 } }, tail: { kind: 'single', finHeight: 3.2, finChord: 3.6, tailSpan: 5.6, tailChord: 2.0 }, engines: { kind: 'internal', count: 1, diameter: 1.1 }, intakes: 'side', canopy: { x: 3.6, length: 2.4, kind: 'framed' } };
// MiG-27K: the MiG-23 with a sloping "duck" nose (17.07 m).
A['mig-27k'] = { ...A['mig-23mld'], cls: 'attack', length: 17.07, nose: 0.24, blunt: 0.55 };
// MiG-25 / MiG-31: big box intakes, twin fins canted out, a thin shoulder wing (MiG-25PD 19.75 x 14.01 x 6.1 m; MiG-31 22.69 x 13.46 x 6.15 m, two seats).
A['mig-25pd'] = { cls: 'fighter', length: 19.75, span: 14.01, height: 6.1, bodyWidth: 3.6, bodyHeight: 1.9, nose: 0.2, wing: { x: -2.4, span: 14.01, rootChord: 5.8, tipChord: 1.8, sweep: 42, mount: 0.8, dihedral: -5 }, tail: { kind: 'twin', finHeight: 3.6, finChord: 3.6, cant: 8, spacing: 3.0, tailSpan: 8.8, tailChord: 2.8 }, engines: { kind: 'internal', count: 2, diameter: 1.3 }, intakes: 'side', canopy: { x: 5.6, length: 2.4, kind: 'framed' } };
A['mig-31'] = { ...A['mig-25pd'], length: 22.69, span: 13.46, height: 6.15, canopy: { x: 6.0, length: 4.0, kind: 'tandem' } };
// MiG-15bis / MiG-17: nose intake, swept wing, the tailplane high on the fin (MiG-15bis 10.11 x 10.08 x 3.7 m; MiG-17 11.26 x 9.63 x 3.8 m).
A['mig-15bis'] = { cls: 'fighter', length: 10.11, span: 10.08, height: 3.7, bodyWidth: 1.45, bodyHeight: 1.6, nose: 0.12, blunt: 0.8, wing: { x: 0.2, span: 10.08, rootChord: 3.0, tipChord: 1.6, sweep: 37, mount: 0.4, dihedral: -2 }, tail: { kind: 't', finHeight: 2.3, finChord: 2.4, tailSpan: 3.2, tailChord: 1.1 }, engines: { kind: 'internal', count: 1, diameter: 0.9 }, intakes: 'nose', canopy: { x: 2.0, length: 1.8, kind: 'bubble' } };
A['mig-17'] = { ...A['mig-15bis'], length: 11.26, span: 9.63, height: 3.8, wing: { x: 0.0, span: 9.63, rootChord: 3.3, tipChord: 1.4, sweep: 45, mount: 0.4, dihedral: -3 } };
// MiG-19: nose intake, two engines, a 55-degree wing (12.54 x 9.0 x 3.88 m).
A['mig-19p'] = { cls: 'fighter', length: 12.54, span: 9.0, height: 3.88, bodyWidth: 1.6, bodyHeight: 1.6, nose: 0.12, blunt: 0.75, wing: { x: -0.8, span: 9.0, rootChord: 3.8, tipChord: 1.2, sweep: 58, mount: 0.2 }, tail: { kind: 'single', finHeight: 2.4, finChord: 3.0, tailSpan: 4.4, tailChord: 1.4 }, engines: { kind: 'internal', count: 2, diameter: 0.75 }, intakes: 'nose', canopy: { x: 2.6, length: 2.0, kind: 'bubble' } };
// Su-24M: swing wing, side-by-side crew, side intakes (22.67 m, 17.64 / 10.37 m, 6.19 m).
A['su-24m'] = { cls: 'attack', length: 22.67, span: 14.0, height: 6.19, bodyWidth: 3.0, bodyHeight: 2.0, nose: 0.22, blunt: 0.45, wing: { x: -1.6, span: 14.0, rootChord: 4.0, tipChord: 1.6, sweep: 45, mount: 0.8, glove: { span: 6.2, chord: 3.6 } }, tail: { kind: 'single', finHeight: 3.6, finChord: 4.4, tailSpan: 8.0, tailChord: 2.6 }, engines: { kind: 'internal', count: 2, diameter: 1.2 }, intakes: 'side', canopy: { x: 6.0, length: 2.6, kind: 'framed' } };
// Su-17M4: the swing-wing Su-7 with its nose intake and shock cone (19.03 m, 13.68 / 10.02 m, 5.12 m).
A['su-17m4'] = { cls: 'attack', length: 19.03, span: 11.8, height: 5.12, bodyWidth: 1.7, bodyHeight: 1.8, nose: 0.1, blunt: 0.85, wing: { x: -1.6, span: 11.8, rootChord: 4.6, tipChord: 1.4, sweep: 45, mount: -0.2, glove: { span: 4.2, chord: 3.0 } }, tail: { kind: 'single', finHeight: 3.3, finChord: 4.0, tailSpan: 5.6, tailChord: 1.8 }, engines: { kind: 'internal', count: 1, diameter: 1.1 }, intakes: 'nose', canopy: { x: 3.4, length: 2.2, kind: 'framed' } };

// ---------------------------------------------------------------- European, Chinese and others

// Tornado IDS / GR4: swing wing, side intakes, a big single fin, two seats (16.72 m, 13.91 / 8.6 m, 5.95 m).
A['tornado-ids'] = { cls: 'attack', length: 16.72, span: 11.4, height: 5.95, bodyWidth: 2.3, bodyHeight: 1.9, nose: 0.22, wing: { x: -1.2, span: 11.4, rootChord: 3.4, tipChord: 1.4, sweep: 45, mount: 0.7, glove: { span: 4.4, chord: 3.4 } }, tail: { kind: 'single', finHeight: 3.6, finChord: 4.0, tailSpan: 6.6, tailChord: 2.4 }, engines: { kind: 'internal', count: 2, diameter: 1.0 }, intakes: 'side', canopy: { x: 3.8, length: 3.6, kind: 'tandem' } };
// AJS 37 Viggen: a canard delta, the canards big and set high (16.4 x 10.6 x 5.9 m).
A['ajs-37'] = { cls: 'attack', length: 16.4, span: 10.6, height: 5.9, bodyWidth: 1.8, bodyHeight: 1.8, nose: 0.25, wing: { x: -2.4, span: 10.6, rootChord: 7.0, tipChord: 1.6, sweep: 55, mount: -0.3 }, canard: { x: 2.2, span: 5.4, chord: 2.2 }, tail: { kind: 'single', finHeight: 3.6, finChord: 4.0, tailSpan: 0, tailChord: 0 }, engines: { kind: 'internal', count: 1, diameter: 1.2 }, intakes: 'side', canopy: { x: 4.0, length: 2.4, kind: 'bubble' } };
// JAS 39 Gripen: a smaller canard delta (C 14.1 m; E 15.2 x 8.6 x 4.5 m).
A['jas-39'] = { cls: 'multirole', length: 15.2, span: 8.6, height: 4.5, bodyWidth: 1.6, bodyHeight: 1.6, nose: 0.24, wing: { x: -2.0, span: 8.6, rootChord: 5.6, tipChord: 1.0, sweep: 45, mount: 0.1 }, canard: { x: 2.6, span: 4.2, chord: 1.3 }, tail: { kind: 'single', finHeight: 2.6, finChord: 3.0, tailSpan: 0, tailChord: 0 }, engines: { kind: 'internal', count: 1, diameter: 1.0 }, intakes: 'side', canopy: { x: 3.6, length: 2.4, kind: 'bubble' } };
// Rafale: a canard delta, two engines (15.27 x 10.8 x 5.34 m).
A['rafale'] = { cls: 'multirole', length: 15.27, span: 10.8, height: 5.34, bodyWidth: 1.9, bodyHeight: 1.6, nose: 0.25, wing: { x: -2.2, span: 10.8, rootChord: 6.4, tipChord: 1.2, sweep: 48, mount: -0.2 }, canard: { x: 2.4, span: 5.0, chord: 1.4 }, tail: { kind: 'single', finHeight: 2.8, finChord: 3.2, tailSpan: 0, tailChord: 0 }, engines: { kind: 'internal', count: 2, diameter: 0.85 }, intakes: 'under', canopy: { x: 3.8, length: 2.6, kind: 'bubble' } };
// Mirage F1: a shoulder-mounted swept wing, side intakes, a tailplane (15.3 x 8.4 x 4.5 m); the B two seats.
A['mirage-f1'] = { cls: 'fighter', length: 15.3, span: 8.4, height: 4.5, bodyWidth: 1.6, bodyHeight: 1.6, nose: 0.25, wing: { x: -1.2, span: 8.4, rootChord: 3.4, tipChord: 1.6, sweep: 47, mount: 1 }, tail: { kind: 'single', finHeight: 2.8, finChord: 3.2, tailSpan: 4.6, tailChord: 1.6 }, engines: { kind: 'internal', count: 1, diameter: 1.0 }, intakes: 'side', canopy: { x: 3.6, length: 2.2, kind: 'bubble' } };
A['mirage-f1b'] = { ...A['mirage-f1'], canopy: { x: 3.4, length: 3.4, kind: 'tandem' } };
// Mirage III / 5: the thin delta with a shock cone in the side intakes (15.03 x 8.22 x 4.5 m).
A['mirage-iii'] = { cls: 'fighter', length: 15.03, span: 8.22, height: 4.5, bodyWidth: 1.5, bodyHeight: 1.5, nose: 0.28, wing: { x: -2.2, span: 8.22, rootChord: 7.6, tipChord: 0.4, sweep: 60, mount: -0.4 }, tail: { kind: 'single', finHeight: 3.0, finChord: 3.6, tailSpan: 0, tailChord: 0 }, engines: { kind: 'internal', count: 1, diameter: 1.0 }, intakes: 'side', canopy: { x: 3.0, length: 2.2, kind: 'bubble' } };
// JF-17: side intakes, one engine, a cropped delta with a tailplane (14.93 x 9.45 x 4.72 m).
A['jf-17'] = { cls: 'multirole', length: 14.93, span: 9.45, height: 4.72, bodyWidth: 1.6, bodyHeight: 1.6, nose: 0.22, wing: { x: -1.4, span: 9.45, rootChord: 4.0, tipChord: 1.2, sweep: 38, mount: 0.2 }, tail: { kind: 'single', finHeight: 2.6, finChord: 3.0, tailSpan: 5.0, tailChord: 1.6 }, engines: { kind: 'internal', count: 1, diameter: 1.0 }, intakes: 'side', canopy: { x: 3.4, length: 2.4, kind: 'bubble' } };
// J-10: a canard delta, one engine, a chin intake (16.9 x 9.75 x 5.43 m).
A['j-10'] = { cls: 'multirole', length: 16.9, span: 9.75, height: 5.43, bodyWidth: 1.8, bodyHeight: 1.7, nose: 0.22, wing: { x: -2.4, span: 9.75, rootChord: 6.6, tipChord: 1.0, sweep: 50, mount: -0.2 }, canard: { x: 2.6, span: 5.0, chord: 1.6 }, tail: { kind: 'single', finHeight: 3.0, finChord: 3.4, tailSpan: 0, tailChord: 0 }, engines: { kind: 'internal', count: 1, diameter: 1.1 }, intakes: 'chin', canopy: { x: 3.8, length: 2.6, kind: 'bubble' } };
// J-20: a long body, canards, a delta and canted fins (21.2 x 13.01 x 4.69 m).
A['j-20'] = { cls: 'fighter', length: 21.2, span: 13.01, height: 4.69, bodyWidth: 3.0, bodyHeight: 1.7, nose: 0.22, wing: { x: -3.2, span: 13.01, rootChord: 7.6, tipChord: 1.2, sweep: 46, mount: 0.4 }, canard: { x: 3.0, span: 6.6, chord: 1.6 }, tail: { kind: 'twin', finHeight: 2.4, finChord: 2.4, cant: 25, spacing: 3.6, tailSpan: 0, tailChord: 0 }, engines: { kind: 'internal', count: 2, diameter: 1.1 }, intakes: 'side', canopy: { x: 5.6, length: 3.2, kind: 'bubble' } };
// Q-5 Fantan: side intakes, a 52-degree wing, two engines (15.65 x 9.7 x 4.33 m).
A['q-5'] = { cls: 'attack', length: 15.65, span: 9.7, height: 4.33, bodyWidth: 1.9, bodyHeight: 1.6, nose: 0.25, wing: { x: -1.2, span: 9.7, rootChord: 4.0, tipChord: 1.2, sweep: 52, mount: 0.2 }, tail: { kind: 'single', finHeight: 2.6, finChord: 3.0, tailSpan: 4.6, tailChord: 1.4 }, engines: { kind: 'internal', count: 2, diameter: 0.8 }, intakes: 'side', canopy: { x: 3.4, length: 2.2, kind: 'bubble' } };

// ---------------------------------------------------------------- trainers and light jets

// L-39 Albatros: straight wing with tip tanks, tandem seats, intakes by the cockpit (12.13 x 9.46 x 4.77 m).
A['l-39'] = { cls: 'trainer', length: 12.13, span: 9.46, height: 4.77, bodyWidth: 1.4, bodyHeight: 1.6, nose: 0.25, wing: { x: -0.6, span: 9.46, rootChord: 2.6, tipChord: 1.4, sweep: 3, mount: -0.6, dihedral: 3 }, tail: { kind: 'single', finHeight: 2.4, finChord: 2.2, tailSpan: 4.4, tailChord: 1.2 }, engines: { kind: 'internal', count: 1, diameter: 0.8 }, intakes: 'side', canopy: { x: 2.2, length: 3.2, kind: 'tandem' } };
// MB-339: tip tanks, tandem seats, a long canopy (10.97 x 10.86 x 3.99 m).
A['mb-339'] = { ...A['l-39'], length: 10.97, span: 10.86, height: 3.99, canopy: { x: 1.8, length: 3.2, kind: 'tandem' } };
// BAe Hawk: low swept wing, tandem canopy (11.95 x 9.39 x 3.98 m).
A['bae-hawk'] = { cls: 'trainer', length: 11.95, span: 9.39, height: 3.98, bodyWidth: 1.4, bodyHeight: 1.6, nose: 0.25, wing: { x: -0.8, span: 9.39, rootChord: 2.8, tipChord: 1.1, sweep: 26, mount: -0.6, dihedral: 2 }, tail: { kind: 'single', finHeight: 2.2, finChord: 2.4, tailSpan: 4.4, tailChord: 1.2 }, engines: { kind: 'internal', count: 1, diameter: 0.7 }, intakes: 'side', canopy: { x: 2.2, length: 3.2, kind: 'tandem' } };
// C-101 Aviojet: straight low wing, tandem seats (12.5 x 10.6 x 4.25 m).
A['c-101'] = { ...A['l-39'], length: 12.5, span: 10.6, height: 4.25 };
// T-38 Talon / F-5F: the two-seat F-5 (14.14 x 7.7 x 3.92 m).
A['t-38'] = { ...A['f-5e'], cls: 'trainer', length: 14.14, span: 7.7, height: 3.92, canopy: { x: 3.0, length: 3.6, kind: 'tandem' } };

// ---------------------------------------------------------------- drones

// MQ-1 Predator (8.22 x 14.8 x 2.1 m; inverted V tail) and MQ-9 Reaper (11.0 x 20.0 x 3.81 m; V tail with a ventral fin); Wing Loong I alike (9.05 x 14.0 x 2.77 m).
A['mq-1-predator'] = { cls: 'drone-fixed', length: 8.22, span: 14.8, height: 2.1, bodyWidth: 0.8, bodyHeight: 0.9, nose: 0.2, blunt: 0.9, wing: { x: -0.4, span: 14.8, rootChord: 1.0, tipChord: 0.45, sweep: 2, mount: 0.2 }, tail: { kind: 'v', finHeight: 1.4, finChord: 0.8, tailSpan: 0, tailChord: 0 }, engines: { kind: 'pusher', count: 1 }, propeller: { diameter: 1.8, blades: 2 } };
A['mq-9-reaper'] = { ...A['mq-1-predator'], length: 11.0, span: 20.0, height: 3.81, bodyWidth: 1.1, bodyHeight: 1.2, wing: { x: -0.6, span: 20.0, rootChord: 1.4, tipChord: 0.6, sweep: 2, mount: 0.2 }, tail: { kind: 'v', finHeight: 1.9, finChord: 1.1, tailSpan: 0, tailChord: 0 }, propeller: { diameter: 2.8, blades: 3 } };
A['wing-loong'] = { ...A['mq-1-predator'], length: 9.05, span: 14.0, height: 2.77 };

export const JETS: SpecSet = { air: A };
