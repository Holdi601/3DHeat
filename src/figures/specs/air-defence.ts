/**
 * Air defence: SAM launchers and the radars, command posts and generators of
 * their batteries, self-propelled AA guns and missiles, and towed or emplaced
 * AA guns, from the Second World War to now. A battery's parts are separate
 * figures because a replay places them separately (DCS puts a Fan Song, its
 * launchers and a Flat Face each where the mission maker put them).
 *
 * Sizes are published values of the real system, rounded; `est` marks an
 * estimate (antenna sizes of Soviet radars are mostly estimated from photos).
 * Shapes: what one sees from outside - how many missiles, on rails or in
 * boxes, which antenna on what mast. Nothing from a game's model.
 */

import type { Named, SpecSet } from './index';
import type { GroundSpec } from '../ground';
import { BRDM_2, FMTV, GM_CHASSIS, HEMTT, HMMWV, M113, M548, MAN_HX, MAZ_543, MT_LB, PICKUP, SEMI, TRAILER, URAL_4320, ZIL_131 } from './base';

const G: Named<GroundSpec> = {};

// ---------------------------------------------------------------- SA-2 S-75

// SM-90 launcher: one V-750 (10.6 m, 0.5 m body, 0.65 m booster) on a rail on a turntable with outriggers; launcher base est.
G['s-75-launcher'] = { cls: 'sam', chassis: 'pedestal', length: 6.5, width: 6.5, hullHeight: 1.3, turret: { x: -0.8, length: 2.4, width: 1.6, height: 0.9, shape: 'box' }, missiles: [{ mount: 'turret-top', rows: 1, cols: 1, length: 9.5, diameter: 0.6, rail: true, elevation: 0.45, x: 1.6, up: 1.0 }] };
// SNR-75 Fan Song: antenna post on a trailer; a wide horizontal trough, an upright trough and small dishes (antenna sizes est).
G['snr-75-fan-song'] = { cls: 'radar', ...SEMI, length: 8.0, width: 2.7, hullHeight: 1.5, boxes: [{ x: -1.2, length: 3.0, height: 1.4, width: 2.4 }, { x: 1.6, length: 1.6, height: 1.2, width: 1.6 }], radars: [{ kind: 'peel', x: 1.7, up: 2.0, size: 3.8, height: 0.8, mast: 'none', hull: true }, { kind: 'panel', x: 1.7, up: 2.9, size: 0.8, height: 3.0, side: -2.0, mast: 'none', hull: true }, { kind: 'dish', x: 1.9, up: 1.6, size: 0.9, side: 1.2, mast: 'none', hull: true }] };
// RD-75 Amazonka range finder: a small dish on a trailer (est).
G['rd-75-amazonka'] = { cls: 'radar', ...TRAILER, length: 5.0, boxes: [{ x: -0.4, length: 2.4, height: 1.2, width: 2.0 }], radars: [{ kind: 'dish', x: -0.4, up: 2.1, size: 1.6, mast: 'pole' }] };
// ZiL-131 tractor that tows the S-75 launcher.
G['zil-131-s-75-tractor'] = { cls: 'truck', ...ZIL_131, bed: 'covered' };
// PR-11 transloader trailer with a missile on it (est).
G['s-75-trailer'] = { cls: 'truck', ...SEMI, length: 11.0, width: 2.5, hullHeight: 1.3, missiles: [{ mount: 'hull', rows: 1, cols: 1, length: 10.0, diameter: 0.6, rail: true, elevation: 0, x: -0.6, up: 0.5 }] };

// ---------------------------------------------------------------- SA-3 S-125

// 5P73 launcher: four V-601 (6.1 m, 0.375 / 0.55 m booster), two per arm either side of the turntable (base est).
G['s-125-launcher'] = { cls: 'sam', chassis: 'pedestal', length: 5.5, width: 5.5, hullHeight: 1.0, turret: { x: 0, length: 1.6, width: 1.2, height: 1.0, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 5.6, diameter: 0.5, rail: true, elevation: 0.42, up: 1.45 }] };
// SNR-125 Low Blow: two big trough antennas at an angle and a dish on a trailer (est).
G['snr-125-low-blow'] = { cls: 'radar', ...SEMI, length: 7.5, width: 2.7, hullHeight: 1.5, boxes: [{ x: -0.8, length: 3.0, height: 1.3, width: 2.4 }], radars: [{ kind: 'peel', x: 0.6, up: 2.8, size: 4.2, height: 1.0, tilt: 0.7, mast: 'pole' }, { kind: 'panel', x: 0.6, up: 3.0, size: 1.0, height: 3.4, tilt: 0.7, side: -0.4 }, { kind: 'dish', x: 1.2, up: 1.6, size: 0.8, side: 1.6 }] };
// P-19 Flat Face: two stacked elliptical reflectors on the roof of a ZiL-131 cabin (antenna est 5 x 1.5 m).
G['p-19-flat-face'] = { cls: 'radar', ...ZIL_131, bed: 'box', radars: [{ kind: 'peel', x: -1.8, up: 1.1, size: 5.0, height: 1.3, mast: 'pole', hull: true }, { kind: 'peel', x: -1.8, up: 2.6, size: 5.0, height: 1.3, mast: 'none', hull: true }] };

// ---------------------------------------------------------------- SA-5 S-200

// 5P72 launcher: one 5V21 (10.8 m, 0.86 m, four strap-on boosters) on a heavy rail (base est).
G['s-200-launcher'] = { cls: 'sam', chassis: 'pedestal', length: 7.0, width: 7.0, hullHeight: 1.6, turret: { x: -1.2, length: 3.0, width: 2.2, height: 1.2, shape: 'box' }, missiles: [{ mount: 'turret-top', rows: 1, cols: 1, length: 10.0, diameter: 1.3, rail: true, elevation: 0.55, x: 2.2, up: 1.6 }] };
// 5N62 Square Pair: a big dish and a smaller one on a rotating cabin on its base (est).
G['5n62-square-pair'] = { cls: 'radar', chassis: 'static', length: 6.5, width: 6.0, hullHeight: 2.6, turret: { x: 0, length: 4.0, width: 3.4, height: 1.8, shape: 'box' }, radars: [{ kind: 'dish', x: 1.6, up: 2.2, size: 6.0, mast: 'none', side: -0.6 }, { kind: 'dish', x: 1.4, up: 1.2, size: 1.8, mast: 'none', side: 2.5 }] };
// P-14 Tall King: a 32 x 11 m mesh reflector on a ground frame (P-14 published as about 32 m wide; height est).
G['p-14-tall-king'] = { cls: 'radar', chassis: 'static', length: 6.0, width: 6.0, hullHeight: 1.5, radars: [{ kind: 'peel', x: 0, up: 6.0, size: 32, height: 10, tilt: 0.25, mast: 'tower' }] };
// ST-68U / 19J6 Tin Shield: a large curved array on a mast over its cabin (array est 9.5 x 3.5 m).
G['19j6-tin-shield'] = { cls: 'radar', ...SEMI, length: 10.0, boxes: [{ x: -1.2, length: 5.0, height: 2.0, width: 2.6 }], radars: [{ kind: 'peel', x: 0.5, up: 5.0, size: 9.5, height: 3.4, tilt: 0.2, mast: 'tower', hull: true }] };

// ---------------------------------------------------------------- SA-10 S-300PS

// 5P85 TEL on MAZ-543: four 5V55 canisters (7.25 m, 0.8 m est) raised upright behind the cab; the S variant adds a cabin.
const TEL_5P85: GroundSpec = { ...MAZ_543, length: 13.0, missiles: [{ mount: 'hull', rows: 2, cols: 2, length: 7.25, diameter: 0.78, pod: false, boxes: true, elevation: 1.48, x: -4.0, up: 3.75 }] };
G['5p85s-s-300-tel'] = { cls: 'sam', ...TEL_5P85, boxes: [{ x: 2.4, length: 2.0, height: 1.3, width: 2.6 }] };
G['5p85d-s-300-tel'] = { cls: 'sam', ...TEL_5P85 };
// 30N6 Flap Lid: a square phased-array face on a short mast over a MAZ-7910 trailer cabin (face est 3.3 m).
G['30n6-flap-lid'] = { cls: 'radar', ...MAZ_543, length: 12.0, boxes: [{ x: -2.4, length: 5.5, height: 1.8, width: 2.8 }], radars: [{ kind: 'panel', x: -2.0, up: 3.6, size: 3.3, height: 3.3, depth: 0.7, tilt: 0.35, mast: 'pole', hull: true }] };
// 64N6 Big Bird: a large back-to-back array on its semitrailer (array est 6 x 5 m).
G['64n6-big-bird'] = { cls: 'radar', ...SEMI, length: 13.0, width: 3.1, boxes: [{ x: -2.0, length: 6.0, height: 1.6, width: 2.8 }], radars: [{ kind: 'panel', x: -1.5, up: 4.4, size: 6.4, height: 5.0, depth: 1.4, tilt: 0.25, mast: 'none', hull: true }] };
// 76N6 Clam Shell: a curved reflector on the 40V6 lattice tower (tower about 24 m; reflector est).
G['76n6-clam-shell'] = { cls: 'radar', chassis: 'static', length: 8.0, width: 8.0, hullHeight: 0.6, radars: [{ kind: 'peel', x: 0, up: 24.0, size: 6.0, height: 2.4, tilt: 0.2, mast: 'tower' }] };
// 54K6 command post: a cabin on MAZ-543.
G['54k6-s-300-cp'] = { cls: 'sam-cp', ...MAZ_543, boxes: [{ x: -1.8, length: 7.0, height: 1.7, width: 2.9 }] };

// ---------------------------------------------------------------- SA-6 Kub

// 2P25 TEL on GM-578: three 3M9 (5.8 m, 0.335 m) on a turntable, the back of the hull (7.39 x 3.18 x 3.45 m).
G['2p25-kub-tel'] = { cls: 'sam', ...GM_CHASSIS, length: 7.39, width: 3.18, hullHeight: 1.6, turret: { x: -0.8, length: 1.6, width: 1.6, height: 0.35, shape: 'cylinder' }, missiles: [{ mount: 'turret-top', rows: 1, cols: 3, length: 5.8, diameter: 0.34, rail: true, elevation: 0.15, x: 0.6, up: 0.45 }] };
// 1S91 Straight Flush: a search antenna above a tracking dish on a turret (7.39 x 3.18, about 4.6 m with antennas up).
G['1s91-straight-flush'] = { cls: 'radar', ...GM_CHASSIS, length: 7.39, width: 3.18, hullHeight: 1.6, turret: { x: -0.6, length: 2.0, width: 2.0, height: 0.9, shape: 'cylinder' }, radars: [{ kind: 'dish', x: 0.3, up: 0.6, size: 1.8, mast: 'none' }, { kind: 'peel', x: 0, up: 1.9, size: 3.2, height: 0.9, tilt: 0.2 }] };

// ---------------------------------------------------------------- SA-8, SA-9, SA-13, SA-11, SA-15, SA-19, SA-22

// 9A33 Osa: BAZ-5937 6x6 amphibian, 9.14 x 2.75 x 4.2 m; a search antenna turning on top, a tracking dish in front, three missile boxes each side.
G['9a33-osa'] = { cls: 'sam', chassis: 'wheeled', length: 9.14, width: 2.75, hullHeight: 2.0, axles: 3, wheelRadius: 0.6, hull: 'boat', turret: { x: -0.4, length: 1.8, width: 1.4, height: 1.0, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 3, cols: 1, length: 3.15, diameter: 0.28, boxes: true, elevation: 0.2, up: 0.55 }], radars: [{ kind: 'peel', x: -0.4, up: 0.9, size: 2.4, height: 0.7, back: true }, { kind: 'dish', x: 1.0, up: -0.2, size: 1.0, mast: 'none' }] };
// 9P31 Strela-1 on BRDM-2: four missile boxes on a small turret, two each side.
G['9p31-strela-1'] = { cls: 'sam', ...BRDM_2, turret: { x: 0, length: 1.0, width: 0.9, height: 0.55, shape: 'cast' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 2.0, diameter: 0.22, boxes: true, elevation: 0.2, up: 0.45 }] };
// 9A35 Strela-10 on MT-LB: four canisters on a turret over the back, with the range-only radar (6.6 x 2.85 x 3.8 m).
G['9a35-strela-10'] = { cls: 'sam', ...MT_LB, length: 6.6, turret: { x: -0.9, length: 1.3, width: 1.1, height: 0.8, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 2.25, diameter: 0.3, boxes: true, elevation: 0.25, up: 0.5 }], boxes: [{ x: 2.3, length: 1.5, height: 0.35, width: 2.4 }] };
// 9A310 Buk TELAR on GM-569: four 9M38 (5.55 m, 0.4 m) on rails on a turret with the Fire Dome radar in front (9.3 x 3.25 x 3.8 m).
G['9a310-buk-telar'] = { cls: 'sam', ...GM_CHASSIS, length: 9.3, width: 3.25, hullHeight: 1.65, turret: { x: -0.6, length: 2.6, width: 2.0, height: 0.75, shape: 'box' }, missiles: [{ mount: 'turret-top', rows: 1, cols: 4, length: 5.55, diameter: 0.4, rail: true, elevation: 0.08, x: -0.6, up: 0.3 }], radars: [{ kind: 'dish', x: 1.45, up: -0.35, size: 1.5, mast: 'none' }] };
// 9S18 Snow Drift on GM-567: a wide flat search antenna raised on a folding mast (9.6 x 3.25 m; antenna est 6.5 x 1.9 m).
G['9s18-snow-drift'] = { cls: 'radar', ...GM_CHASSIS, length: 9.6, width: 3.25, hullHeight: 1.65, boxes: [{ x: -0.6, length: 4.2, height: 1.0, width: 3.0 }], radars: [{ kind: 'panel', x: -1.4, up: 4.0, size: 6.5, height: 1.9, tilt: 0.35, mast: 'pole', hull: true }] };
// 9S470 command post on GM-579: a tall cabin, whip antennas.
G['9s470-buk-cp'] = { cls: 'sam-cp', ...GM_CHASSIS, length: 9.0, width: 3.25, hullHeight: 1.65, boxes: [{ x: -0.8, length: 5.4, height: 1.3, width: 3.0 }], radars: [{ kind: 'bar', x: -2.0, up: 2.4, size: 0.6, hull: true }] };
// 9A331 Tor-M1 on GM-355: a tall turret with eight vertical cells, the search antenna turning on top and the tracking array on its face (7.5 x 3.3 x 5.1 m).
G['9a331-tor-m1'] = { cls: 'sam', ...GM_CHASSIS, length: 7.5, width: 3.3, hullHeight: 1.6, turret: { x: -0.4, length: 3.0, width: 2.4, height: 1.65, shape: 'tall' }, radars: [{ kind: 'panel', x: -0.7, up: 0.45, size: 2.8, height: 0.9, tilt: 0.45, back: true, mast: 'none' }, { kind: 'panel', x: 1.55, up: -0.7, size: 1.4, height: 1.2, mast: 'none', depth: 0.25 }] };
// Tor-M2 on the same chassis, the search antenna a flatter wider face (est).
G['9a331-tor-m2'] = { ...G['9a331-tor-m1'], radars: [{ kind: 'panel', x: -0.7, up: 0.45, size: 3.2, height: 1.0, tilt: 0.55, back: true, mast: 'none', depth: 0.3 }, { kind: 'panel', x: 1.55, up: -0.7, size: 1.5, height: 1.3, mast: 'none', depth: 0.3 }] };
// Pantsir-S1 on KamAZ-6560 8x8: a turret with two packs of six canisters, twin 30 mm guns either side, search antenna on top (est 10.6 x 2.6 x 4.5 m).
G['pantsir-s1'] = { cls: 'sam', chassis: 'wheeled', length: 10.6, width: 2.55, hullHeight: 1.6, axles: 4, axleAt: [0.75, 0.48, -0.42, -0.7], wheelRadius: 0.6, hull: 'truck', cab: { length: 2.4, height: 3.0 }, bed: 'flat', turret: { x: -2.4, length: 2.6, width: 1.9, height: 1.3, shape: 'box', up: 0.25 }, missiles: [{ mount: 'turret-side', rows: 2, cols: 3, length: 3.2, diameter: 0.21, boxes: true, elevation: 0.3, up: 1.0 }], guns: [{ mount: 'turret-side', count: 2, length: 2.2, calibre: 0.03, elevation: 0.2, at: 0.35, spread: 0.18 }], radars: [{ kind: 'panel', x: -0.4, up: 0.45, size: 2.2, height: 1.0, tilt: 0.4, back: true, mast: 'none' }] };

// ---------------------------------------------------------------- SHORAD and SPAAG (Western and others)

// M163 VADS: M113 with an open 20 mm Vulcan turret and its ranging radar dish beside the gun (4.86 x 2.85 x 2.74 m).
G['m163-vulcan'] = { cls: 'spaa', ...M113, width: 2.85, turret: { x: -0.5, length: 1.7, width: 1.6, height: 0.6, shape: 'open' }, guns: [{ mount: 'turret', length: 1.8, calibre: 0.1, elevation: 0.3, at: 0.5 }], radars: [{ kind: 'dish', x: 0.2, up: 0.2, size: 0.7, side: 0.95, mast: 'none' }] };
// M48 Chaparral: M730 carrier with a four-rail launch station behind the cab (6.06 x 2.69 x 2.68 m).
G['m48-chaparral'] = { cls: 'sam', ...M548, length: 6.06, turret: { x: -1.2, length: 1.4, width: 1.2, height: 0.9, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 2.9, diameter: 0.127, rail: true, elevation: 0.2, up: 0.45 }] };
// M1097 Avenger: HMMWV with a gunner's turret between two pods of four Stingers (4.95 x 2.18 x 2.6 m).
G['m1097-avenger'] = { cls: 'sam', ...HMMWV, length: 4.95, width: 2.18, turret: { x: -0.7, length: 1.1, width: 0.9, height: 0.85, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 2, length: 1.6, diameter: 0.18, pod: true, elevation: 0.15, up: 0.45 }] };
// HQ-7B TELAR: a 6x6 carrier with four missile boxes round a radar turret (est 7.2 x 3.0 m).
G['hq-7-telar'] = { cls: 'sam', chassis: 'wheeled', length: 7.2, width: 3.0, hullHeight: 1.9, axles: 3, wheelRadius: 0.55, hull: 'boat', turret: { x: -0.6, length: 1.8, width: 1.4, height: 0.9, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 2.9, diameter: 0.3, boxes: true, elevation: 0.18, up: 0.45 }], radars: [{ kind: 'dish', x: 1.0, up: -0.2, size: 0.8, mast: 'none' }] };
G['hq-7-str'] = { cls: 'radar', chassis: 'wheeled', length: 7.2, width: 3.0, hullHeight: 1.9, axles: 3, wheelRadius: 0.55, hull: 'boat', turret: { x: -0.6, length: 1.6, width: 1.4, height: 0.6, shape: 'box' }, radars: [{ kind: 'panel', x: 0, up: 1.1, size: 2.6, height: 0.9, tilt: 0.3, back: true }] };

// Rapier FSA: a launcher trailer with two missiles either side of the radar drum (est 4.0 x 2.0 m; missile 2.24 m).
G['rapier-launcher'] = { cls: 'sam', ...TRAILER, length: 4.0, width: 1.9, hullHeight: 0.9, outriggers: true, turret: { x: -0.2, length: 1.0, width: 0.9, height: 0.9, shape: 'cylinder' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 2.24, diameter: 0.133, rail: true, elevation: 0.18, up: 0.4 }], radars: [{ kind: 'drum', x: 0, up: 0.3, size: 0.75, mast: 'none' }] };
// Rapier optical tracker: an optical head on a tripod (est).
G['rapier-tracker'] = { cls: 'sam-cp', chassis: 'pedestal', length: 1.6, width: 1.6, hullHeight: 1.0, turret: { x: 0, length: 0.7, width: 0.6, height: 0.5, shape: 'box' } };
// Rapier Blindfire: a tracking radar under a round housing on a trailer (est).
G['rapier-blindfire'] = { cls: 'radar', ...TRAILER, length: 4.0, width: 2.0, hullHeight: 1.0, outriggers: true, turret: { x: -0.3, length: 1.6, width: 1.4, height: 0.6, shape: 'box' }, radars: [{ kind: 'drum', x: 0, up: 0.6, size: 1.3, mast: 'none' }] };

// MIM-23 Hawk M192 launcher: three missiles (5.08 m, 0.37 m) side by side on a beam over a two-wheeled carriage (est 4.9 x 3.25 m).
G['hawk-m192-launcher'] = { cls: 'sam', ...TRAILER, length: 4.9, width: 3.25, hullHeight: 0.9, outriggers: true, turret: { x: -0.4, length: 1.2, width: 1.0, height: 0.6, shape: 'cylinder' }, missiles: [{ mount: 'turret-top', rows: 1, cols: 3, length: 5.08, diameter: 0.37, rail: true, elevation: 0.3, x: 0.9, up: 0.35 }] };
// AN/MPQ-50 PAR: an open reflector on a trailer (est 4.3 x 1.6 m).
G['hawk-mpq-50-par'] = { cls: 'radar', ...TRAILER, length: 4.8, outriggers: true, radars: [{ kind: 'peel', x: -0.3, up: 2.0, size: 4.3, height: 1.5, tilt: 0.3, mast: 'pole' }] };
// AN/MPQ-46 HPIR: two dishes side by side on a trailer (est).
G['hawk-mpq-46-hpir'] = { cls: 'radar', ...TRAILER, length: 4.6, outriggers: true, boxes: [{ x: -0.4, length: 1.6, height: 0.8, width: 1.6 }], radars: [{ kind: 'dish', x: 0, up: 1.7, size: 1.3, side: -0.75, mast: 'pole' }, { kind: 'dish', x: 0, up: 1.7, size: 1.3, side: 0.75, mast: 'none' }] };
// AN/MPQ-55 CWAR: two back-to-back flat antennas turning on a trailer (est).
G['hawk-mpq-55-cwar'] = { cls: 'radar', ...TRAILER, length: 4.2, outriggers: true, radars: [{ kind: 'panel', x: -0.2, up: 1.6, size: 1.9, height: 1.0, depth: 0.5, mast: 'pole' }] };
// Platoon command post: a shelter on a trailer (est).
G['hawk-pcp'] = { cls: 'sam-cp', ...TRAILER, length: 5.0, boxes: [{ x: -0.6, length: 3.2, height: 2.0, width: 2.1 }] };

// Patriot M901 launcher: four canisters (5.8 x 0.9 m) raised on a semitrailer behind an M983 tractor (est overall 15 m).
G['patriot-m901-launcher'] = { cls: 'sam', chassis: 'wheeled', length: 15.0, width: 2.9, hullHeight: 1.4, axles: 4, axleAt: [0.84, 0.6, -0.55, -0.75], wheelRadius: 0.6, hull: 'truck', cab: { length: 2.3, height: 2.84 }, bed: 'flat', missiles: [{ mount: 'hull', rows: 2, cols: 2, length: 5.8, diameter: 0.8, pod: true, elevation: 0.66, x: -3.3, up: 2.2 }] };
// AN/MPQ-53 radar set: a large phased-array face leaning back on the front of a semitrailer (face est 3.0 x 2.4 m).
G['patriot-mpq-53'] = { cls: 'radar', ...SEMI, length: 10.4, boxes: [{ x: -0.8, length: 6.0, height: 1.9, width: 2.8 }], radars: [{ kind: 'panel', x: 2.5, up: 2.4, size: 3.0, height: 2.6, depth: 0.5, tilt: 0.45, mast: 'none', hull: true }] };
// Engagement control station: a shelter on an M927 5-ton truck.
G['patriot-ecs'] = { cls: 'sam-cp', ...M939_SHELTER() };
// Electric power plant: two generator sets on an M977 HEMTT.
G['patriot-epp'] = { cls: 'sam-cp', ...HEMTT, bed: 'flat', boxes: [{ x: -1.2, length: 2.4, height: 1.4, width: 2.2 }, { x: -3.8, length: 2.4, height: 1.4, width: 2.2 }] };
// Antenna mast group: a truck with two tall masts (est 20 m raised).
G['patriot-amg'] = { cls: 'radar', ...FMTV, bed: 'flat', hullHeight: 1.2, radars: [{ kind: 'dish', x: -1.4, up: 18.0, size: 1.4, mast: 'pole', hull: true }, { kind: 'dish', x: -2.6, up: 16.0, size: 1.4, mast: 'pole', side: 0.6, hull: true }] };
// Information and coordination central: a shelter truck.
G['patriot-icc'] = { cls: 'sam-cp', ...M939_SHELTER() };

// NASAMS: canister launcher of six AMRAAMs on a trailer, the Sentinel radar, a command shelter (est).
G['nasams-launcher'] = { cls: 'sam', ...TRAILER, length: 6.4, width: 2.5, hullHeight: 1.1, outriggers: true, missiles: [{ mount: 'hull', rows: 2, cols: 3, length: 4.0, diameter: 0.3, pod: true, elevation: 0.5, x: -0.6, up: 1.4 }] };
G['nasams-mpq-64-sentinel'] = { cls: 'radar', ...TRAILER, length: 6.6, width: 2.4, hullHeight: 1.1, outriggers: true, boxes: [{ x: -1.0, length: 3.0, height: 1.2, width: 2.2 }], radars: [{ kind: 'panel', x: -0.9, up: 2.2, size: 2.4, height: 1.4, depth: 0.4, tilt: 0.2, mast: 'none' }] };
G['nasams-cp'] = { cls: 'sam-cp', ...TRAILER, length: 5.0, boxes: [{ x: -0.6, length: 3.2, height: 2.0, width: 2.1 }] };

// IRIS-T SLM: a MAN truck with eight canisters raised upright, the TRML-4D radar truck, a command shelter (est).
G['iris-t-slm-launcher'] = { cls: 'sam', ...MAN_HX, bed: 'flat', hullHeight: 1.2, outriggers: true, missiles: [{ mount: 'hull', rows: 2, cols: 4, length: 3.4, diameter: 0.25, pod: true, elevation: 1.45, x: -3.0, up: 2.4 }] };
G['iris-t-slm-str'] = { cls: 'radar', ...MAN_HX, bed: 'box', radars: [{ kind: 'panel', x: -2.6, up: 1.4, size: 2.4, height: 1.6, depth: 0.4, tilt: 0.2, hull: true }] };
G['iris-t-slm-cp'] = { cls: 'sam-cp', ...MAN_HX, bed: 'box' };

// Roland EWR: a search radar on a mast over a MAN truck's shelter (est).
G['roland-ewr'] = { cls: 'radar', ...MAN_HX, bed: 'box', radars: [{ kind: 'panel', x: -2.6, up: 2.8, size: 1.8, height: 0.5, tilt: 0.2, hull: true }] };
// M6 Linebacker: a Bradley whose TOW box is a four-round Stinger pod (6.55 x 3.6 m).
G['m6-linebacker'] = { cls: 'spaa', chassis: 'tracked', length: 6.55, width: 3.6, hullHeight: 2.0, roadWheels: 6, hull: 'box', skirts: true, turret: { x: 0.0, length: 2.3, width: 2.0, height: 0.8, shape: 'wedge', side: 0.35 }, guns: [{ mount: 'turret', length: 2.6, calibre: 0.025 }], missiles: [{ mount: 'turret-side', rows: 2, cols: 2, length: 1.6, diameter: 0.16, pod: true, elevation: 0.1, up: 0.55 }] };

// LPWS C-RAM: a Phalanx mount - white radome over a gatling - on a trailer behind a HEMTT (est).
G['c-ram-phalanx'] = { cls: 'spaa', ...HEMTT, length: 12.0, bed: 'flat', turret: { x: -3.6, length: 1.4, width: 1.4, height: 0.9, shape: 'cylinder', up: 0.2 }, guns: [{ mount: 'turret', length: 1.7, calibre: 0.09, elevation: 0.2, at: 0.4 }], radars: [{ kind: 'dome', x: -0.2, up: 0.55, size: 1.2, mast: 'none' }] };

// ---------------------------------------------------------------- Soviet AA guns

// ZSU-57-2: T-54-based, a big open-topped turret with twin 57 mm (hull 6.22 m, 3.27 x 2.75 m).
G['zsu-57-2'] = { cls: 'spaa', chassis: 'tracked', length: 6.22, width: 3.27, hullHeight: 1.45, roadWheels: 4, hull: 'tank', turret: { x: 0.0, length: 3.2, width: 2.8, height: 1.15, shape: 'open' }, guns: [{ mount: 'turret', count: 2, length: 4.0, calibre: 0.057, spread: 0.45, elevation: 0.2, at: 0.6 }] };
// S-60 57 mm on its four-wheeled carriage (8.5 x 2.05 x 2.37 m).
G['s-60-57mm'] = { cls: 'towed-aa', chassis: 'towed', length: 8.5, width: 2.05, hullHeight: 1.3, axles: 2, axleAt: [0.55, -0.3], wheelRadius: 0.45, guns: [{ mount: 'hull', length: 4.4, calibre: 0.057, elevation: 0.35, at: 1.25, x: -0.4 }] };
// KS-19 100 mm on its four-wheeled carriage (9.45 x 2.35 x 2.2 m).
G['ks-19-100mm'] = { cls: 'towed-aa', chassis: 'towed', length: 9.45, width: 2.35, hullHeight: 1.5, axles: 2, axleAt: [0.6, -0.35], wheelRadius: 0.5, guns: [{ mount: 'hull', length: 5.8, calibre: 0.1, elevation: 0.3, at: 1.3, x: -0.6 }] };
// SON-9 Fire Can: a fire-control dish on a van trailer (est 6.5 x 2.6 m).
G['son-9-fire-can'] = { cls: 'radar', ...SEMI, length: 6.5, width: 2.6, boxes: [{ x: -0.3, length: 4.5, height: 2.0, width: 2.5 }], radars: [{ kind: 'dish', x: 0.2, up: 3.3, size: 1.8, mast: 'pole', hull: true }] };
// Ural-375 with a ZU-23-2 on the bed.
G['ural-375-zu-23'] = { cls: 'spaa', ...URAL_4320, bed: 'flat', hullHeight: 1.1, turret: { x: -1.6, length: 1.6, width: 1.6, height: 0.5, shape: 'box' }, guns: [{ mount: 'turret', count: 2, length: 2.0, calibre: 0.023, elevation: 0.35, at: 0.9, spread: 0.3 }] };
// Pickups with a ZU-23-2 (Hilux and Land Cruiser class).
G['technical-zu-23'] = { cls: 'technical', ...PICKUP, turret: { x: -1.5, length: 1.4, width: 1.4, height: 0.4, shape: 'box', up: 0 }, guns: [{ mount: 'turret', count: 2, length: 2.0, calibre: 0.023, elevation: 0.35, at: 0.9, spread: 0.3 }] };
// Pickups with a heavy machine gun (DShK, Kord).
G['technical-hmg'] = { cls: 'technical', ...PICKUP, turret: { x: -1.3, length: 0.5, width: 0.4, height: 0.9, shape: 'box', up: 0 }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.02, elevation: 0.12, at: 0.9 }] };
// Pickups with a rocket pod (B8M1 80 mm).
G['technical-rocket'] = { cls: 'technical', ...PICKUP, missiles: [{ mount: 'hull', rows: 1, cols: 1, length: 2.7, diameter: 0.5, pod: true, elevation: 0.25, x: -1.4, up: 0.6 }] };
// Dog Ear (9S80 Sborka) on MT-LBu: a search antenna on a raised mast (est).
G['9s80-dog-ear'] = { cls: 'radar', ...MT_LB, length: 7.2, hullHeight: 1.8, boxes: [{ x: -0.4, length: 3.6, height: 0.5, width: 2.6 }], radars: [{ kind: 'peel', x: -1.2, up: 3.4, size: 3.4, height: 0.9, tilt: 0.2 }] };
// 1L13 Nebo-SV: a large yagi array on its trailer (est 11 x 5 m).
G['1l13-nebo-sv'] = { cls: 'radar', ...SEMI, length: 11.0, boxes: [{ x: -1.0, length: 4.0, height: 1.6, width: 2.6 }], radars: [{ kind: 'grid', x: 0, up: 5.6, size: 11.0, height: 5.0, mast: 'tower', hull: true }] };
// 55Zh6 Nebo-U (55G6): a very large meter-band array on a ground frame (est 30 x 10 m).
G['55g6-nebo'] = { cls: 'radar', chassis: 'static', length: 8.0, width: 8.0, hullHeight: 1.2, radars: [{ kind: 'grid', x: 0, up: 9.0, size: 30.0, height: 10.0, mast: 'tower' }] };
// AN/FPS-117: a large flat array turning on a tower, or under a radome (est 7 x 4 m array, 15 m dome).
G['fps-117'] = { cls: 'radar', chassis: 'static', length: 8.0, width: 8.0, hullHeight: 3.0, radars: [{ kind: 'panel', x: 0, up: 4.0, size: 7.0, height: 4.0, depth: 0.8, tilt: 0.1, mast: 'pole' }] };
G['fps-117-dome'] = { cls: 'radar', chassis: 'static', length: 12.0, width: 12.0, hullHeight: 6.0, radars: [{ kind: 'dome', x: 0, up: 6.0, size: 14.0, mast: 'none' }] };
G['fps-117-ecs'] = { cls: 'sam-cp', chassis: 'static', length: 6.0, width: 2.5, hullHeight: 2.6 };
// 5I57 diesel power station on its trailer (est).
G['5i57-generator'] = { cls: 'sam-cp', ...SEMI, length: 7.0, width: 2.5, boxes: [{ x: -0.5, length: 5.0, height: 1.8, width: 2.4 }] };
// GCI station: a cabin on a ZiL-131 with a whip mast.
G['zil-131-cabin'] = { cls: 'sam-cp', ...ZIL_131, bed: 'box' };

// ---------------------------------------------------------------- Second World War AA

// 8.8 cm Flak 18/36/37 emplaced on its cruciform platform with shield (barrel 4.94 m, platform est 6 m across).
G['flak-36-88mm'] = { cls: 'towed-aa', chassis: 'pedestal', length: 6.0, width: 6.0, hullHeight: 1.0, shield: true, turret: { x: 0, length: 1.8, width: 1.4, height: 1.2, shape: 'box' }, guns: [{ mount: 'turret', length: 4.9, calibre: 0.088, elevation: 0.45, at: 0.75 }] };
// Flak 41: a longer barrel (6.5 m) on a lower turntable.
G['flak-41-88mm'] = { cls: 'towed-aa', chassis: 'pedestal', length: 6.5, width: 6.5, hullHeight: 0.8, turret: { x: 0, length: 2.2, width: 2.2, height: 1.3, shape: 'sloped' }, guns: [{ mount: 'turret', length: 6.5, calibre: 0.088, elevation: 0.4, at: 0.7 }] };
// 2 cm Flak 30/38 on its triangular mount (est 2.2 m across).
G['flak-38-20mm'] = { cls: 'towed-aa', chassis: 'pedestal', length: 2.4, width: 2.4, hullHeight: 0.5, turret: { x: 0, length: 0.8, width: 0.9, height: 0.7, shape: 'open' }, guns: [{ mount: 'turret', length: 1.9, calibre: 0.02, elevation: 0.5, at: 0.8 }] };
// Flakvierling 38: four 2 cm guns on one mount, a shield (est 3 m across).
G['flakvierling-38'] = { cls: 'towed-aa', chassis: 'pedestal', length: 3.0, width: 3.0, hullHeight: 0.55, turret: { x: 0, length: 1.2, width: 1.4, height: 0.9, shape: 'open' }, guns: [{ mount: 'turret', count: 4, length: 1.9, calibre: 0.02, elevation: 0.5, at: 0.8, spread: 0.4 }] };
// Bofors 40 mm L/60 on its four-wheeled carriage (6.4 x 1.9 x 2.1 m).
G['bofors-40mm'] = { cls: 'towed-aa', chassis: 'towed', length: 6.4, width: 1.9, hullHeight: 1.0, axles: 2, axleAt: [0.6, -0.6], wheelRadius: 0.4, shield: false, guns: [{ mount: 'hull', length: 2.8, calibre: 0.04, elevation: 0.5, at: 1.45, x: -0.3 }] };
// M1 37 mm on its carriage (6.2 x 1.9 x 2.1 m).
G['m1-37mm'] = { ...G['bofors-40mm'], length: 6.2, guns: [{ mount: 'hull', length: 2.4, calibre: 0.037, elevation: 0.5, at: 1.45, x: -0.3 }] };
// QF 3.7-inch on its four-wheeled carriage (8.7 x 2.4 x 2.5 m).
G['qf-3-7-inch'] = { cls: 'towed-aa', chassis: 'towed', length: 8.7, width: 2.4, hullHeight: 1.5, axles: 2, axleAt: [0.6, -0.4], wheelRadius: 0.5, guns: [{ mount: 'hull', length: 4.7, calibre: 0.094, elevation: 0.45, at: 1.3, x: -0.6 }] };
// M45 Quadmount on its M17 trailer: four .50 guns either side of the gunner (2.9 x 2.1 x 1.6 m).
G['m45-quadmount'] = { cls: 'towed-aa', ...TRAILER, length: 2.9, width: 2.1, hullHeight: 0.6, turret: { x: -0.2, length: 1.0, width: 0.8, height: 0.9, shape: 'box' }, guns: [{ mount: 'turret-side', count: 2, length: 1.6, calibre: 0.013, elevation: 0.35, at: 0.55, spread: 0.2 }] };
// Japanese Type 88 75 mm and Type 3 80 mm on pedestal mounts (est).
G['type-88-75mm'] = { cls: 'towed-aa', chassis: 'pedestal', length: 5.0, width: 5.0, hullHeight: 0.9, turret: { x: 0, length: 1.4, width: 1.3, height: 1.0, shape: 'box' }, guns: [{ mount: 'turret', length: 3.3, calibre: 0.075, elevation: 0.5, at: 0.7 }] };
G['type-3-80mm'] = { ...G['type-88-75mm'], guns: [{ mount: 'turret', length: 4.0, calibre: 0.08, elevation: 0.5, at: 0.7 }] };
// Type 96 25 mm twin mount (est).
G['type-96-25mm'] = { cls: 'towed-aa', chassis: 'pedestal', length: 2.6, width: 2.6, hullHeight: 0.8, turret: { x: 0, length: 1.0, width: 1.1, height: 0.8, shape: 'open' }, guns: [{ mount: 'turret', count: 2, length: 1.8, calibre: 0.025, elevation: 0.5, at: 0.8, spread: 0.35 }] };
// Type 94 truck with a twin 25 mm on the bed (est).
G['type-94-25mm-truck'] = { cls: 'spaa', chassis: 'wheeled', length: 5.4, width: 1.9, hullHeight: 1.0, axles: 3, wheelRadius: 0.4, hull: 'truck', cab: { length: 1.4, height: 2.0, bonnet: 1.2 }, bed: 'flat', turret: { x: -1.4, length: 1.0, width: 1.0, height: 0.6, shape: 'open', up: 0.1 }, guns: [{ mount: 'turret', count: 2, length: 1.8, calibre: 0.025, elevation: 0.45, at: 0.8, spread: 0.35 }] };
// Kommandogerät 40 and the Allied director: a range-finder bar on a stand (est 4 m bar).
G['aa-rangefinder'] = { cls: 'sam-cp', chassis: 'pedestal', length: 2.4, width: 2.4, hullHeight: 0.9, turret: { x: 0, length: 0.9, width: 0.9, height: 0.8, shape: 'box' }, radars: [{ kind: 'bar', x: 0, up: 0.2, size: 4.0, mast: 'none' }] };
// FuMG 401 Freya: a yagi array on a turning cabin (est 6 x 3.5 m).
G['fumg-401-freya'] = { cls: 'radar', chassis: 'static', length: 3.5, width: 3.0, hullHeight: 2.2, radars: [{ kind: 'grid', x: 0, up: 2.4, size: 6.0, height: 3.6, mast: 'none' }] };
// FuSe 65 Würzburg-Riese: a 7.5 m dish on its base.
G['fuse-65-wurzburg-riese'] = { cls: 'radar', chassis: 'static', length: 4.0, width: 4.0, hullHeight: 2.0, radars: [{ kind: 'dish', x: 0, up: 3.8, size: 7.5, mast: 'pole' }] };
// Maschinensatz 33: a generator on a small trailer.
G['generator-trailer'] = { cls: 'sam-cp', ...TRAILER, length: 3.5, width: 1.8, hullHeight: 0.9, boxes: [{ x: -0.3, length: 2.2, height: 1.1, width: 1.6 }] };

// ---------------------------------------------------------------- strategic and coastal missiles

// Scud-B on MAZ-543 (9P117): the R-17 (11.25 m, 0.88 m) lying on the erector (13.36 m overall).
G['scud-b-tel'] = { cls: 'mlrs', ...MAZ_543, length: 13.36, missiles: [{ mount: 'hull', rows: 1, cols: 1, length: 11.25, diameter: 0.88, rail: true, elevation: 0.0, x: -0.6, up: 0.75 }] };
// Iskander 9P78 on MZKT-7930: two missiles under a covered launcher (13.07 x 3.07 x 3.3 m).
G['iskander-tel'] = { cls: 'mlrs', ...MZKT_7930_LONG() };
// HY-2 / Silkworm launcher: one winged missile on a trailer rail (missile 7.36 m; est trailer).
G['silkworm-launcher'] = { cls: 'sam', ...SEMI, length: 9.0, width: 2.8, hullHeight: 1.2, missiles: [{ mount: 'hull', rows: 1, cols: 1, length: 7.36, diameter: 0.76, rail: true, elevation: 0.2, x: -0.4, up: 1.1 }] };
G['silkworm-radar'] = { cls: 'radar', ...ZIL_131, bed: 'box', radars: [{ kind: 'peel', x: -1.8, up: 1.4, size: 3.4, height: 0.9, tilt: 0.2, hull: true }] };
// V-1 launch ramp: a long inclined ramp (48 m) with the missile at its foot.
G['v-1-ramp'] = { cls: 'ramp', chassis: 'static', length: 45.0, width: 2.0, hullHeight: 0.6, missiles: [{ mount: 'hull', rows: 1, cols: 1, length: 45.0, diameter: 0.6, pod: true, elevation: 0.11, x: 0, up: 2.5 }] };

function M939_SHELTER(): Omit<GroundSpec, 'cls'> {
  return { chassis: 'wheeled', length: 7.9, width: 2.5, hullHeight: 3.3, axles: 3, axleAt: [0.72, -0.38, -0.7], wheelRadius: 0.55, hull: 'truck', cab: { length: 1.8, height: 2.9, bonnet: 1.6 }, bed: 'box' };
}

function MZKT_7930_LONG(): Omit<GroundSpec, 'cls'> {
  return { chassis: 'wheeled', length: 13.07, width: 3.07, hullHeight: 1.4, axles: 4, axleAt: [0.76, 0.5, -0.3, -0.6], wheelRadius: 0.72, hull: 'truck', cab: { length: 2.4, height: 3.0 }, bed: 'flat', missiles: [{ mount: 'hull', rows: 1, cols: 2, length: 7.6, diameter: 1.0, pod: true, elevation: 0, x: -2.2, up: 0.6 }] };
}

export const AIR_DEFENCE: SpecSet = { ground: G };

