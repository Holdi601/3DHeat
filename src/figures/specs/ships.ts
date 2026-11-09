/**
 * Ships and boats: carriers (straight, angled, ski-jump), cruisers,
 * destroyers, frigates and corvettes with their gun turrets fore and aft,
 * missile cells and canisters and radars, battleships with superfiring
 * turrets, submarines, landing ships and craft, fast attack craft, river
 * boats, and merchant ships. Length and beam are published values;
 * freeboard, block sizes and turret places are judged from profiles (est).
 */

import type { Named, SpecSet } from './index';
import type { NavalSpec, NavalTurret } from '../naval';

const N: Named<NavalSpec> = {};

/** A turret pair fore with the second superfiring, or aft facing back. */
function pair(x: number, size: number, barrels: number, length: number, calibre: number, step: number, up: number, back = false, kind: NavalTurret['kind'] = 'box'): NavalTurret[] {
  const d = back ? 1 : -1;
  return [
    { x, size, barrels, length, calibre, back, kind },
    { x: x + d * step, size, barrels, length, calibre, back, up, kind },
  ];
}

// ---------------------------------------------------------------- carriers

// Nimitz class (starter `nimitz-carrier`) with its angled deck; Forrestal (325 m, 39.5 m beam).
N['nimitz-carrier'] = { cls: 'carrier', length: 333, beam: 41, freeboard: 18, hull: 'carrier', angled: true, superstructure: [{ x: -20, length: 40, width: 12, height: 22 }], masts: [{ x: -20, height: 45 }], radars: [{ x: -15, up: 36, kind: 'array', size: 7 }] };
N['forrestal'] = { cls: 'carrier', length: 325, beam: 39.5, freeboard: 17, hull: 'carrier', angled: true, superstructure: [{ x: 10, length: 30, width: 10, height: 20 }], masts: [{ x: 10, height: 40 }], radars: [{ x: 15, up: 32, kind: 'array', size: 7 }] };
// Admiral Kuznetsov: a ski jump at the bow and an angled deck (305 m, 35 m beam); the island with its flat array faces.
N['kuznetsov'] = { cls: 'carrier', length: 305, beam: 35, freeboard: 16, hull: 'carrier', angled: true, skiJump: true, superstructure: [{ x: -10, length: 50, width: 12, height: 26 }], masts: [{ x: -10, height: 50 }], radars: [{ x: -10, up: 32, kind: 'faces', size: 6 }] };
// Essex (270.7 m, 28.3 m beam), a straight deck and an island with its funnel.
N['essex'] = { cls: 'carrier', length: 270.7, beam: 28.3, freeboard: 15, hull: 'carrier', superstructure: [{ x: 10, length: 30, width: 8, height: 14 }], funnels: [{ x: 0, height: 20, diameter: 8 }], masts: [{ x: 15, height: 30 }] };
// Yorktown (251.4 m, 25.4 m beam) and Shokaku (257.5 m, 29 m beam).
N['yorktown'] = { ...N['essex'], length: 251.4, beam: 25.4, freeboard: 14 };
N['shokaku'] = { cls: 'carrier', length: 257.5, beam: 29, freeboard: 14, hull: 'carrier', superstructure: [{ x: 45, length: 14, width: 6, height: 10 }], funnels: [{ x: 0, height: 6, diameter: 6 }] };
// HMS Invincible: a ski jump on a straight deck (209 m, 36 m over the deck).
N['invincible'] = { cls: 'carrier', length: 209, beam: 31, freeboard: 13, hull: 'carrier', skiJump: true, superstructure: [{ x: 0, length: 55, width: 8, height: 18 }], funnels: [{ x: 10, height: 24, diameter: 7 }, { x: -15, height: 24, diameter: 7 }], masts: [{ x: 0, height: 36 }] };
// Colossus class (ARA 25 de Mayo): a light carrier with a small island (211.8 m, 24.5 m beam).
N['colossus'] = { cls: 'carrier', length: 211.8, beam: 24.5, freeboard: 13, hull: 'carrier', angled: true, superstructure: [{ x: 0, length: 25, width: 7, height: 12 }], funnels: [{ x: -5, height: 16, diameter: 6 }], masts: [{ x: 5, height: 28 }] };
// LHA Tarawa (254 m, 32.3 m beam) and the Type 071 LPD (210 m, 28 m beam).
N['tarawa'] = { cls: 'amphibious', length: 254, beam: 32.3, freeboard: 18, hull: 'carrier', superstructure: [{ x: -10, length: 60, width: 12, height: 20 }], masts: [{ x: -5, height: 40 }], radars: [{ x: -5, up: 32, kind: 'array', size: 6 }] };
N['type-071'] = { cls: 'amphibious', length: 210, beam: 28, freeboard: 12, superstructure: [{ x: 30, length: 70, width: 24, height: 20 }], masts: [{ x: 40, height: 38 }], turrets: [{ x: 85, size: 5, barrels: 1, length: 4.5, calibre: 0.076, kind: 'mount' }], helideck: true };

// ---------------------------------------------------------------- US and NATO surface combatants

// Ticonderoga: two tall blocks with the Aegis faces, two 5-inch mounts and two VLS fields (173 m, 16.8 m beam).
N['ticonderoga'] = { cls: 'cruiser', length: 173, beam: 16.8, freeboard: 7, superstructure: [{ x: 20, length: 34, width: 14, height: 14 }, { x: -22, length: 30, width: 12, height: 12 }], turrets: [{ x: 66, size: 6, barrels: 1, length: 8, calibre: 0.127, kind: 'mount' }, { x: -66, size: 6, barrels: 1, length: 8, calibre: 0.127, kind: 'mount', back: true }], funnels: [{ x: 4, height: 8, diameter: 5 }, { x: -6, height: 8, diameter: 5 }], masts: [{ x: 12, height: 28 }, { x: -18, height: 22 }], launchers: [{ x: 48, length: 14, width: 9 }, { x: -50, length: 14, width: 9 }], radars: [{ x: 26, up: 11, kind: 'faces', size: 4 }, { x: -28, up: 9, kind: 'faces', size: 4 }] };
// Arleigh Burke (starter) with the Aegis faces on its bridge; Flight IIa the same outside but for the hangar.
N['arleigh-burke'] = { cls: 'destroyer', length: 155, beam: 20, freeboard: 7, superstructure: [{ x: 18, length: 30, width: 15, height: 12 }, { x: -12, length: 22, width: 12, height: 7 }], turrets: [{ x: 58, size: 6, barrels: 1, length: 9, calibre: 0.127, kind: 'mount' }], funnels: [{ x: 0, height: 9, diameter: 4 }, { x: -22, height: 8, diameter: 4 }], masts: [{ x: 15, height: 30 }], launchers: [{ x: 42, length: 14, width: 8 }, { x: -48, length: 12, width: 8 }], radars: [{ x: 24, up: 9, kind: 'faces', size: 4 }], helideck: true };
// Oliver Hazard Perry: a long box superstructure, the single-arm launcher forward, the 76 mm amidships, a hangar and helideck (135.6 m, 13.7 m beam).
N['oliver-hazard-perry'] = { cls: 'frigate', length: 135.6, beam: 13.7, freeboard: 6, superstructure: [{ x: 0, length: 70, width: 12, height: 9 }], turrets: [{ x: 50, size: 3, barrels: 1, length: 4, calibre: 0.15, kind: 'mount' }, { x: -4, size: 3.5, barrels: 1, length: 4, calibre: 0.076, kind: 'mount', up: 9 }], funnels: [{ x: -16, height: 8, diameter: 4 }], masts: [{ x: 18, height: 26 }], radars: [{ x: 18, up: 20, kind: 'array', size: 6 }], helideck: true };
// Leander class: a twin 4.5-inch turret forward (113.4 m, 12.5 m beam).
N['leander'] = { cls: 'frigate', length: 113.4, beam: 12.5, freeboard: 6, superstructure: [{ x: 18, length: 20, width: 10, height: 9 }, { x: -10, length: 24, width: 9, height: 6 }], turrets: [{ x: 38, size: 5, barrels: 2, length: 5, calibre: 0.114, kind: 'box' }], funnels: [{ x: 2, height: 8, diameter: 5 }], masts: [{ x: 12, height: 22 }], radars: [{ x: 12, up: 18, kind: 'array', size: 6 }], helideck: true };
// Castle class OPV (81 m, 11.5 m beam), La Combattante IIa (47 m, 7.1 m beam).
N['castle-opv'] = { cls: 'patrol-ship', length: 81, beam: 11.5, freeboard: 5, superstructure: [{ x: 10, length: 26, width: 10, height: 8 }], turrets: [{ x: 28, size: 2.5, barrels: 1, length: 3, calibre: 0.04, kind: 'mount' }], masts: [{ x: 8, height: 18 }], helideck: true };
N['la-combattante'] = { cls: 'fast-attack', length: 47, beam: 7.1, freeboard: 2.8, superstructure: [{ x: 4, length: 14, width: 6, height: 4 }], turrets: [{ x: 16, size: 3, barrels: 1, length: 3.5, calibre: 0.076, kind: 'mount' }, { x: -19, size: 2.4, barrels: 2, length: 2.5, calibre: 0.035, kind: 'mount', back: true }], launchers: [{ x: -10, length: 5, width: 4, kind: 'tubes', count: 2, elevation: 0.15 }], masts: [{ x: 4, height: 12 }] };

// ---------------------------------------------------------------- Soviet and Russian

// Kirov (Pyotr Velikiy): a huge VLS field forward, the twin 130 mm aft (252 m, 28.5 m beam).
N['kirov'] = { cls: 'cruiser', length: 252, beam: 28.5, freeboard: 10, superstructure: [{ x: 20, length: 50, width: 20, height: 18 }, { x: -40, length: 30, width: 16, height: 10 }], turrets: [{ x: -95, size: 9, barrels: 2, length: 8, calibre: 0.13, back: true, kind: 'box' }], launchers: [{ x: 70, length: 40, width: 16 }, { x: 100, length: 12, width: 8 }], masts: [{ x: 15, height: 40 }, { x: -20, height: 30 }], radars: [{ x: 15, up: 32, kind: 'array', size: 9 }, { x: -20, up: 24, kind: 'array', size: 7 }], helideck: true };
// Slava (Moskva): sixteen big P-500 tubes along both sides forward, a twin 130 mm on the bow (186.4 m, 20.8 m beam).
N['slava'] = { cls: 'cruiser', length: 186.4, beam: 20.8, freeboard: 8, superstructure: [{ x: 0, length: 50, width: 16, height: 16 }, { x: -40, length: 22, width: 14, height: 10 }], turrets: [{ x: 80, size: 8, barrels: 2, length: 7, calibre: 0.13, kind: 'box' }], launchers: [{ x: 40, length: 12, width: 4, kind: 'tubes', count: 2, elevation: 0.25, up: 1 }], funnels: [{ x: -20, height: 10, diameter: 6 }], masts: [{ x: 5, height: 34 }], radars: [{ x: 5, up: 28, kind: 'array', size: 8 }], helideck: true };
// Neustrashimy (129.8 m, 15.6 m beam), Krivak / Rezky with its big quad launcher box forward and twin 100 mm aft (123 m, 14.2 m beam).
N['neustrashimy'] = { cls: 'frigate', length: 129.8, beam: 15.6, freeboard: 7, superstructure: [{ x: 15, length: 40, width: 13, height: 12 }, { x: -20, length: 20, width: 12, height: 8 }], turrets: [{ x: 50, size: 5, barrels: 1, length: 5, calibre: 0.1, kind: 'mount' }], launchers: [{ x: 38, length: 8, width: 6 }], masts: [{ x: 12, height: 28 }], radars: [{ x: 12, up: 24, kind: 'array', size: 7 }], helideck: true };
N['krivak'] = { cls: 'frigate', length: 123, beam: 14.2, freeboard: 6, superstructure: [{ x: 15, length: 26, width: 11, height: 10 }, { x: -12, length: 18, width: 10, height: 6 }], turrets: [{ x: -40, size: 5, barrels: 1, length: 5, calibre: 0.1, kind: 'mount', back: true }, { x: -50, size: 5, barrels: 1, length: 5, calibre: 0.1, kind: 'mount', back: true }], launchers: [{ x: 50, length: 8, width: 6, kind: 'box', up: 1 }], funnels: [{ x: -2, height: 7, diameter: 6 }], masts: [{ x: 14, height: 24 }], radars: [{ x: 14, up: 20, kind: 'array', size: 5 }] };
// Grisha (71.2 m, 9.8 m beam), Tarantul / Molniya with four Moskit tubes (56.1 m, 10.2 m beam), Project 22160 (94 m, 14 m beam).
N['grisha'] = { cls: 'corvette', length: 71.2, beam: 9.8, freeboard: 4, superstructure: [{ x: 6, length: 20, width: 8, height: 7 }], turrets: [{ x: -26, size: 3, barrels: 2, length: 3, calibre: 0.057, kind: 'mount', back: true }], masts: [{ x: 6, height: 18 }], radars: [{ x: 6, up: 15, kind: 'array', size: 4 }] };
N['tarantul'] = { cls: 'fast-attack', length: 56.1, beam: 10.2, freeboard: 3.5, superstructure: [{ x: 6, length: 22, width: 8, height: 6 }], turrets: [{ x: 20, size: 3, barrels: 1, length: 3.5, calibre: 0.076, kind: 'mount' }], launchers: [{ x: -6, length: 9, width: 4, kind: 'tubes', count: 2, elevation: 0.2, up: 1 }], masts: [{ x: 4, height: 14 }], radars: [{ x: 4, up: 12, kind: 'array', size: 3 }] };
N['project-22160'] = { cls: 'patrol-ship', length: 94, beam: 14, freeboard: 6, superstructure: [{ x: 5, length: 40, width: 12, height: 12 }], turrets: [{ x: 32, size: 3.5, barrels: 1, length: 4, calibre: 0.076, kind: 'mount' }], masts: [{ x: 10, height: 26 }], helideck: true };
N['project-22160-tor'] = { ...N['project-22160'], launchers: [{ x: -30, length: 8, width: 8 }] };
// Ropucha (112.5 m, 15 m beam): a landing ship, superstructure aft.
N['ropucha'] = { cls: 'amphibious', length: 112.5, beam: 15, freeboard: 7, superstructure: [{ x: -20, length: 30, width: 12, height: 10 }], turrets: [{ x: 30, size: 3, barrels: 2, length: 3, calibre: 0.057, kind: 'mount' }], masts: [{ x: -15, height: 22 }] };
// Osa / Type 021 missile boat: four big launch boxes (38.8 m, 7.6 m beam).
N['osa-missile-boat'] = { cls: 'fast-attack', length: 38.8, beam: 7.6, freeboard: 2.5, superstructure: [{ x: 4, length: 10, width: 5, height: 3.5 }], launchers: [{ x: -6, length: 8, width: 4, kind: 'tubes', count: 2, elevation: 0.2, up: 0.5 }], turrets: [{ x: 14, size: 2, barrels: 2, length: 2, calibre: 0.03, kind: 'mount' }] };

// ---------------------------------------------------------------- Chinese

N['type-052b'] = { cls: 'destroyer', length: 154, beam: 17, freeboard: 7, superstructure: [{ x: 18, length: 34, width: 15, height: 13 }, { x: -20, length: 26, width: 13, height: 8 }], turrets: [{ x: 56, size: 5, barrels: 1, length: 5, calibre: 0.1, kind: 'mount' }], launchers: [{ x: 42, length: 8, width: 6, kind: 'box' }], funnels: [{ x: 0, height: 9, diameter: 6 }], masts: [{ x: 14, height: 30 }], radars: [{ x: 14, up: 26, kind: 'array', size: 6 }], helideck: true };
N['type-052c'] = { ...N['type-052b'], launchers: [{ x: 42, length: 12, width: 8 }, { x: -6, length: 10, width: 8 }], radars: [{ x: 24, up: 10, kind: 'faces', size: 5 }] };
N['type-054a'] = { cls: 'frigate', length: 134, beam: 16, freeboard: 7, superstructure: [{ x: 10, length: 36, width: 14, height: 12 }, { x: -22, length: 22, width: 12, height: 8 }], turrets: [{ x: 48, size: 5, barrels: 1, length: 5, calibre: 0.076, kind: 'mount' }], launchers: [{ x: 36, length: 8, width: 8 }, { x: -2, length: 8, width: 5, kind: 'tubes', count: 2, elevation: 0.2 }], masts: [{ x: 10, height: 28 }], radars: [{ x: 10, up: 24, kind: 'array', size: 5 }], helideck: true };
N['type-093'] = { cls: 'submarine', length: 110, beam: 11, freeboard: 0, hull: 'submarine', sail: { x: 22, length: 12, height: 7 } };

// ---------------------------------------------------------------- submarines

// Kilo (starter), Tango (90.2 m, 9.1 m beam), Balao / GUPPY (95 m, 8.3 m beam), Type VIIC with deck gun and flak (67.1 m, 6.2 m beam), Gato (95 m, 8.3 m beam), Type IIB (42.7 m, 4.1 m beam), Shchuka (58.8 m, 6.2 m beam).
N['tango'] = { cls: 'submarine', length: 90.2, beam: 9.1, freeboard: 0, hull: 'submarine', sail: { x: 10, length: 16, height: 6 } };
N['balao'] = { cls: 'submarine', length: 95, beam: 8.3, freeboard: 0, hull: 'submarine', sail: { x: 8, length: 12, height: 5 } };
N['type-viic'] = { cls: 'submarine', length: 67.1, beam: 6.2, freeboard: 0, hull: 'submarine', sail: { x: 4, length: 8, height: 4.5 }, turrets: [{ x: 14, size: 1.4, barrels: 1, length: 3.5, calibre: 0.088 }] };
N['gato'] = { ...N['balao'], turrets: [{ x: 18, size: 1.6, barrels: 1, length: 3.5, calibre: 0.076 }] };
N['type-iib'] = { cls: 'submarine', length: 42.7, beam: 4.1, freeboard: 0, hull: 'submarine', sail: { x: 2, length: 5, height: 3.5 } };
N['shchuka'] = { cls: 'submarine', length: 58.8, beam: 6.2, freeboard: 0, hull: 'submarine', sail: { x: 4, length: 7, height: 4 }, turrets: [{ x: 10, size: 1.2, barrels: 1, length: 2.0, calibre: 0.045 }] };

// ---------------------------------------------------------------- WWII warships

// Fletcher (114.8 m, 12 m beam): five 5-inch mounts, two funnels.
N['fletcher'] = { cls: 'destroyer', length: 114.8, beam: 12, freeboard: 5, superstructure: [{ x: 28, length: 14, width: 9, height: 9 }], turrets: [...pair(45, 3.5, 1, 4, 0.127, 9, 2.5, false, 'mount'), ...pair(-30, 3.5, 1, 4, 0.127, 9, 2.5, true, 'mount'), { x: -50, size: 3.5, barrels: 1, length: 4, calibre: 0.127, back: true, kind: 'mount' }], funnels: [{ x: 10, height: 8, diameter: 3 }, { x: -6, height: 8, diameter: 3 }], masts: [{ x: 22, height: 18 }] };
// Gleaves (106 m, 11 m beam) and the Soviet Type 7 (112.8 m, 10.2 m beam): four guns, two funnels.
N['gleaves'] = { ...N['fletcher'], length: 106, beam: 11 };
N['type-7-destroyer'] = { cls: 'destroyer', length: 112.8, beam: 10.2, freeboard: 5, superstructure: [{ x: 30, length: 12, width: 7, height: 8 }], turrets: [...pair(44, 3, 1, 4, 0.13, 8, 2.5, false, 'mount'), ...pair(-36, 3, 1, 4, 0.13, 8, 2.5, true, 'mount')], funnels: [{ x: 12, height: 8, diameter: 3 }, { x: -6, height: 8, diameter: 3 }], masts: [{ x: 24, height: 16 }] };
// Akizuki (134.2 m, 11.6 m beam): four twin 10 cm turrets, one trunked funnel.
N['akizuki'] = { cls: 'destroyer', length: 134.2, beam: 11.6, freeboard: 5, superstructure: [{ x: 30, length: 16, width: 9, height: 10 }], turrets: [...pair(52, 4, 2, 4, 0.1, 10, 2.5), ...pair(-40, 4, 2, 4, 0.1, 10, 2.5, true)], funnels: [{ x: 6, height: 9, diameter: 5 }], masts: [{ x: 24, height: 20 }] };
// Battleships: Bismarck (starter), King George V (227.1 m, 31.4 m beam; quad-twin-quad), Yamato (263 m, 38.9 m beam; three triple 46 cm), Iron Duke (189.8 m, 27.4 m beam).
N['king-george-v'] = { cls: 'battleship', length: 227.1, beam: 31.4, freeboard: 8, superstructure: [{ x: 18, length: 40, width: 18, height: 16 }], turrets: [{ x: 72, size: 14, barrels: 4, length: 16, calibre: 0.356, kind: 'box' }, { x: 52, size: 12, barrels: 2, length: 16, calibre: 0.356, up: 4, kind: 'box' }, { x: -66, size: 14, barrels: 4, length: 16, calibre: 0.356, back: true, kind: 'box' }], funnels: [{ x: 5, height: 14, diameter: 7 }, { x: -18, height: 14, diameter: 7 }], masts: [{ x: 25, height: 34 }, { x: -30, height: 28 }] };
N['yamato'] = { cls: 'battleship', length: 263, beam: 38.9, freeboard: 9, superstructure: [{ x: 15, length: 30, width: 16, height: 26 }, { x: -10, length: 30, width: 20, height: 8 }], turrets: [{ x: 85, size: 16, barrels: 3, length: 20, calibre: 0.46, kind: 'box' }, { x: 62, size: 16, barrels: 3, length: 20, calibre: 0.46, up: 5, kind: 'box' }, { x: -70, size: 16, barrels: 3, length: 20, calibre: 0.46, back: true, kind: 'box' }], funnels: [{ x: -2, height: 16, diameter: 9 }], masts: [{ x: -20, height: 30 }] };
N['iron-duke'] = { cls: 'battleship', length: 189.8, beam: 27.4, freeboard: 8, superstructure: [{ x: 25, length: 22, width: 14, height: 12 }], turrets: [{ x: 68, size: 11, barrels: 2, length: 14, calibre: 0.343, kind: 'box' }, { x: 52, size: 11, barrels: 2, length: 14, calibre: 0.343, up: 4, kind: 'box' }, { x: -5, size: 11, barrels: 2, length: 14, calibre: 0.343, back: true, kind: 'box' }, { x: -50, size: 11, barrels: 2, length: 14, calibre: 0.343, back: true, up: 4, kind: 'box' }, { x: -66, size: 11, barrels: 2, length: 14, calibre: 0.343, back: true, kind: 'box' }], funnels: [{ x: 15, height: 14, diameter: 6 }, { x: 5, height: 14, diameter: 6 }], masts: [{ x: 30, height: 34 }] };
// A generic heavy and light cruiser of the 1930s-40s (est 190 m and 170 m).
N['heavy-cruiser'] = { cls: 'cruiser', length: 190, beam: 20, freeboard: 7, superstructure: [{ x: 20, length: 22, width: 12, height: 16 }], turrets: [...pair(60, 9, 3, 11, 0.203, 14, 3.5), { x: -60, size: 9, barrels: 3, length: 11, calibre: 0.203, back: true, kind: 'box' }], funnels: [{ x: 0, height: 10, diameter: 6 }, { x: -14, height: 10, diameter: 6 }], masts: [{ x: 22, height: 26 }, { x: -30, height: 20 }] };
N['light-cruiser'] = { cls: 'cruiser', length: 170, beam: 17, freeboard: 6, superstructure: [{ x: 22, length: 18, width: 11, height: 14 }], turrets: [...pair(56, 7, 3, 9, 0.152, 12, 3), ...pair(-50, 7, 3, 9, 0.152, 12, 3, true)], funnels: [{ x: 2, height: 9, diameter: 5 }, { x: -12, height: 9, diameter: 5 }], masts: [{ x: 24, height: 24 }] };

// ---------------------------------------------------------------- landing ships and craft, small craft

// LST Mk 2 (100 m, 15.24 m beam), Bayfield attack transport (150 m, 21 m beam), LCI(L) (48.3 m, 7.2 m beam), LCT (est 36 m, 10 m beam), LCM (15.2 m, 4.3 m beam), LCA (12.6 m, 3 m beam), Daihatsu (14.8 m, 3.4 m), MFP (47 m, 6.5 m), X-lighter (32 m, 6.4 m).
N['lst-mk2'] = { cls: 'amphibious', length: 100, beam: 15.24, freeboard: 4, superstructure: [{ x: -38, length: 16, width: 12, height: 9 }], masts: [{ x: -36, height: 16 }] };
N['attack-transport'] = { cls: 'amphibious', length: 150, beam: 21, freeboard: 8, hull: 'merchant', superstructure: [{ x: 0, length: 34, width: 18, height: 12 }], funnels: [{ x: -6, height: 10, diameter: 6 }], masts: [{ x: 35, height: 22 }, { x: -40, height: 20 }] };
N['lci-l'] = { cls: 'landing-craft', length: 48.3, beam: 7.2, freeboard: 2.5, superstructure: [{ x: -4, length: 6, width: 4, height: 4 }] };
N['lct'] = { cls: 'landing-craft', length: 36, beam: 10, freeboard: 2.0, hull: 'landing', superstructure: [{ x: -14, length: 5, width: 4, height: 3 }] };
N['lcm'] = { cls: 'landing-craft', length: 15.2, beam: 4.3, freeboard: 1.8, hull: 'landing' };
N['lca'] = { cls: 'landing-craft', length: 12.6, beam: 3.0, freeboard: 1.6, hull: 'landing' };
N['daihatsu'] = { cls: 'landing-craft', length: 14.8, beam: 3.4, freeboard: 1.8, hull: 'landing' };
N['marinefahrprahm'] = { cls: 'landing-craft', length: 47, beam: 6.5, freeboard: 2.2, hull: 'landing', superstructure: [{ x: -18, length: 6, width: 5, height: 3 }], turrets: [{ x: -12, size: 2, barrels: 1, length: 3, calibre: 0.088, back: true }] };
N['x-lighter'] = { cls: 'landing-craft', length: 32, beam: 6.4, freeboard: 3.0, hull: 'landing', superstructure: [{ x: -12, length: 4, width: 4, height: 2.5 }] };
// Fast attack: Schnellboot S-38 / S-130 (34.9 m, 5.3 m beam), G-5 (19 m, 3.5 m beam), CMB (12.2 m, 2.6 m), CB90 (15.9 m, 3.8 m), PBR (9.75 m, 3.53 m).
N['schnellboot'] = { cls: 'fast-attack', length: 34.9, beam: 5.3, freeboard: 2.2, hull: 'boat', superstructure: [{ x: 2, length: 6, width: 4, height: 2.5 }], turrets: [{ x: 13, size: 1.4, barrels: 1, length: 2, calibre: 0.02 }, { x: -12, size: 1.6, barrels: 1, length: 2, calibre: 0.037, back: true }] };
N['g-5-torpedo-boat'] = { cls: 'fast-attack', length: 19, beam: 3.5, freeboard: 1.5, hull: 'boat', superstructure: [{ x: 1, length: 3, width: 2.5, height: 1.5 }] };
N['coastal-motor-boat'] = { cls: 'fast-attack', length: 12.2, beam: 2.6, freeboard: 1.2, hull: 'boat', superstructure: [{ x: -1, length: 2, width: 2, height: 1 }] };
N['cb90'] = { cls: 'attack-boat', length: 15.9, beam: 3.8, freeboard: 2.0, hull: 'boat', superstructure: [{ x: 1, length: 6, width: 3.4, height: 2 }], turrets: [{ x: 1, size: 1.2, barrels: 1, length: 1.6, calibre: 0.013, up: 2 }] };
N['pbr'] = { cls: 'patrol-boat', length: 9.75, beam: 3.53, freeboard: 1.0, hull: 'boat', superstructure: [{ x: 0, length: 2.4, width: 2.4, height: 1.6 }], turrets: [{ x: 3.4, size: 1.0, barrels: 2, length: 1.4, calibre: 0.013 }] };
N['armed-speedboat'] = { cls: 'patrol-boat', length: 11, beam: 2.8, freeboard: 1.0, hull: 'boat', superstructure: [{ x: -0.5, length: 2.4, width: 2.0, height: 1.3 }], turrets: [{ x: 3.4, size: 0.9, barrels: 1, length: 1.4, calibre: 0.013 }] };
// Soviet river gunboat (Project 1124): two tank turrets on a small armoured hull (25.3 m, 4.0 m beam).
N['gunboat-1124'] = { cls: 'patrol-boat', length: 25.3, beam: 4.0, freeboard: 1.4, hull: 'boat', superstructure: [{ x: 0, length: 3, width: 2.5, height: 1.6 }], turrets: [{ x: 6, size: 2.2, barrels: 1, length: 2.0, calibre: 0.076 }, { x: -6, size: 2.2, barrels: 1, length: 2.0, calibre: 0.076, back: true }] };
// River barge (péniche, est 38 m, 5 m beam), sampan (8 m, 1.8 m), harbour tug (30 m, 9 m), passenger launch (25 m, 5 m).
N['peniche'] = { cls: 'merchant', length: 38, beam: 5, freeboard: 1.5, hull: 'merchant', superstructure: [{ x: -16, length: 4, width: 4, height: 2.5 }] };
N['sampan'] = { cls: 'sampan', length: 8, beam: 1.8, freeboard: 0.6, hull: 'boat', superstructure: [{ x: -1, length: 3, width: 1.6, height: 1.0 }] };
N['harbour-tug'] = { cls: 'merchant', length: 30, beam: 9, freeboard: 2.5, hull: 'boat', superstructure: [{ x: 4, length: 9, width: 6, height: 5 }], funnels: [{ x: -1, height: 3, diameter: 2 }] };
N['passenger-launch'] = { cls: 'merchant', length: 25, beam: 5, freeboard: 1.8, hull: 'boat', superstructure: [{ x: -1, length: 14, width: 4.4, height: 2.6 }] };

// ---------------------------------------------------------------- merchant ships

// A tanker with its bridge aft (Elnya 130 m; Handy-size tanker est 180 m, 30 m beam), a dry cargo ship with cranes (est 130 m, 19 m), a container ship (Atlantic Conveyor 212 m, 31 m), the Seawise Giant (458.5 m, 68.8 m).
N['tanker'] = { cls: 'merchant', length: 130, beam: 20, freeboard: 6, hull: 'merchant', superstructure: [{ x: -55, length: 14, width: 18, height: 12 }], funnels: [{ x: -60, height: 8, diameter: 4 }] };
N['bulker'] = { cls: 'merchant', length: 180, beam: 30, freeboard: 8, hull: 'merchant', superstructure: [{ x: -78, length: 16, width: 26, height: 16 }], funnels: [{ x: -82, height: 8, diameter: 5 }] };
N['cargo-ship'] = { cls: 'merchant', length: 130, beam: 19, freeboard: 7, hull: 'merchant', superstructure: [{ x: -10, length: 18, width: 16, height: 12 }], funnels: [{ x: -14, height: 8, diameter: 4 }], masts: [{ x: 35, height: 18 }, { x: -45, height: 16 }] };
// Black Marlin: a semi-submersible heavy-lift ship, the long open deck behind the accommodation block on the bow
// (217.8 x 42 m; the deck's 3.3 m over the water from its 13.3 m depth and 10.1 m draught, the block estimated).
N['black-marlin'] = { cls: 'merchant', length: 217.8, beam: 42, freeboard: 3.3, hull: 'merchant', superstructure: [{ x: 94, length: 22, width: 40, height: 16 }], masts: [{ x: 96, height: 10 }] };
N['container-ship'] = { cls: 'merchant', length: 212, beam: 31, freeboard: 10, hull: 'merchant', superstructure: [{ x: -80, length: 16, width: 28, height: 18 }, { x: 10, length: 140, width: 28, height: 8 }], funnels: [{ x: -86, height: 8, diameter: 5 }] };
N['supertanker'] = { cls: 'merchant', length: 458.5, beam: 68.8, freeboard: 14, hull: 'merchant', superstructure: [{ x: -205, length: 24, width: 50, height: 26 }], funnels: [{ x: -212, height: 12, diameter: 8 }] };
// A 1940s cargo ship (Liberty type, 134.6 m, 17.3 m beam) and armed tanker (est 150 m).
N['liberty-ship'] = { cls: 'merchant', length: 134.6, beam: 17.3, freeboard: 7, hull: 'merchant', superstructure: [{ x: 0, length: 16, width: 14, height: 10 }], funnels: [{ x: -4, height: 9, diameter: 4 }], masts: [{ x: 35, height: 22 }, { x: -35, height: 20 }] };
N['ww2-tanker'] = { cls: 'merchant', length: 150, beam: 20, freeboard: 7, hull: 'merchant', superstructure: [{ x: 30, length: 12, width: 14, height: 9 }, { x: -62, length: 14, width: 16, height: 9 }], funnels: [{ x: -66, height: 8, diameter: 4 }], turrets: [{ x: -72, size: 2.5, barrels: 1, length: 3.5, calibre: 0.1, back: true }] };
N['river-cargo-ship'] = { cls: 'merchant', length: 60, beam: 9, freeboard: 3, hull: 'merchant', superstructure: [{ x: -20, length: 10, width: 8, height: 6 }], funnels: [{ x: -22, height: 5, diameter: 2 }] };

// An airboat with its big pusher fan (5.5 x 2.4 m) and a fast interceptor boat (est 9-15 m).
N['airboat'] = { cls: 'patrol-boat', length: 5.5, beam: 2.4, freeboard: 0.6, hull: 'boat', funnels: [{ x: -1.8, height: 1.8, diameter: 1.8 }] };
N['interceptor-boat'] = { cls: 'patrol-boat', length: 12, beam: 3.0, freeboard: 1.2, hull: 'boat', superstructure: [{ x: 0, length: 3, width: 2.4, height: 1.4 }] };

export const SHIPS: SpecSet = { naval: N };
