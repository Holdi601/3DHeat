/**
 * Ground vehicles since 1945: tanks, infantry carriers, scout cars, MRAPs,
 * self-propelled guns, rocket launchers, trucks and cars. Families share a
 * base and change what changes: a T-72B3 is a T-72B with its new sight and
 * armour, a T-90 a T-72 with its welded turret and Shtora lamps; a Leopard
 * 2A5 is a 2A4 with the wedge on its turret front.
 *
 * Lengths are of the hull (without the gun) unless a comment says otherwise;
 * widths with skirts; `hullHeight` the deck, the turret's height on top of it.
 * Values are rounded published figures; `est` marks an estimate.
 */

import type { Named, SpecSet } from './index';
import type { GroundSpec, TurretSpec } from '../ground';
import { BRDM_2, FMTV, GAZ_66, HEMTT, HMMWV, KAMAZ_43101, KRAZ_255, KRAZ_6322, M113, M939, MAN_HX, MAZ_543, MT_LB, SEMI, TRAILER, URAL_4320, ZIL_131 } from './base';

const G: Named<GroundSpec> = {};

/** Small boxes on a turret's front corners: the Shtora dazzlers of a T-90, sights, ERA bricks. */
function cheeks(x: number, side: number, up: number, l = 0.35, w = 0.35, h = 0.28): TurretSpec[] {
  return [-1, 1].map((s) => ({ x, length: l, width: w, height: h, shape: 'box' as const, side: s * side, up }));
}

// ---------------------------------------------------------------- Soviet and Russian tanks

// T-54 / T-55 / Type 59: a round cast turret well forward, five big road wheels (6.2 x 3.27 x 2.4 m).
G['t-54'] = { cls: 'mbt', chassis: 'tracked', length: 6.04, width: 3.27, hullHeight: 1.45, roadWheels: 5, turret: { x: 0.35, length: 2.7, width: 2.5, height: 0.85, shape: 'round' }, guns: [{ mount: 'turret', length: 4.4, calibre: 0.1 }] };
G['type-59'] = { ...G['t-54'] };
// T-62: a longer hull, the round turret further back, a 115 mm smoothbore (6.63 x 3.52 x 2.4 m).
G['t-62'] = { cls: 'mbt', chassis: 'tracked', length: 6.63, width: 3.52, hullHeight: 1.45, roadWheels: 5, turret: { x: 0.1, length: 2.9, width: 2.7, height: 0.85, shape: 'round' }, guns: [{ mount: 'turret', length: 5.6, calibre: 0.115 }] };
// T-62M: brow armour on the turret front.
G['t-62m'] = { ...G['t-62'], turrets: cheeks(1.2, 0.9, 0.35, 0.35, 0.7, 0.4) };
// T-64BV: six small road wheels, a low cast turret, Kontakt-1 bricks (6.54 x 3.42 x 2.17 m).
G['t-64bv'] = { cls: 'mbt', chassis: 'tracked', length: 6.54, width: 3.42, hullHeight: 1.4, roadWheels: 6, skirts: true, turret: { x: 0.25, length: 3.0, width: 2.8, height: 0.75, shape: 'cast' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.125 }], turrets: cheeks(1.25, 0.95, 0.35, 0.4, 0.8, 0.35) };
// T-72A / T-72B: six big road wheels with gaps, the domed cast turret (6.86 x 3.59 x 2.23 m).
G['t-72a'] = { cls: 'mbt', chassis: 'tracked', length: 6.86, width: 3.59, hullHeight: 1.45, roadWheels: 6, skirts: true, turret: { x: 0.2, length: 3.2, width: 2.9, height: 0.8, shape: 'cast' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.125 }], cupola: true };
G['t-72b'] = { ...G['t-72a'], turrets: cheeks(1.3, 0.85, 0.3, 0.5, 0.9, 0.4) };
// T-72B3: the B with Relikt bricks and the Sosna-U sight box on the roof.
G['t-72b3'] = { ...G['t-72b'], turrets: [...cheeks(1.3, 0.85, 0.3, 0.55, 0.95, 0.45), { x: 0.9, length: 0.5, width: 0.45, height: 0.45, shape: 'box', side: -0.6, up: 0.75 }] };
// T-90 (1992): a T-72 hull, the cast turret, Shtora lamps (6.86 x 3.78 x 2.23 m).
G['t-90'] = { cls: 'mbt', chassis: 'tracked', length: 6.86, width: 3.78, hullHeight: 1.45, roadWheels: 6, skirts: true, turret: { x: 0.2, length: 3.3, width: 3.0, height: 0.8, shape: 'cast' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.125 }], cupola: true, turrets: cheeks(1.65, 0.6, 0.4, 0.35, 0.4, 0.3) };
// T-90A: the welded angular turret that replaced the cast one, Shtora lamps either side of the gun.
G['t-90a'] = { cls: 'mbt', chassis: 'tracked', length: 6.86, width: 3.78, hullHeight: 1.45, roadWheels: 6, skirts: true, turret: { x: 0.2, length: 3.3, width: 3.0, height: 0.8, shape: 'sloped', slope: 0.12 }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.125 }], cupola: true, turrets: cheeks(1.75, 0.6, 0.45, 0.35, 0.4, 0.3) };
// T-90M: a box bustle at the back of the turret, Relikt front.
G['t-90m'] = { ...G['t-90a'], turrets: [...cheeks(1.65, 0.95, 0.35, 0.6, 1.0, 0.45), { x: -1.75, length: 0.9, width: 2.6, height: 0.6, shape: 'box', up: 0.1 }] };
// T-80B: a T-72-like turret on a longer hull with the turbine's flat deck (7.0 x 3.58 x 2.2 m).
G['t-80b'] = { cls: 'mbt', chassis: 'tracked', length: 7.0, width: 3.58, hullHeight: 1.4, roadWheels: 6, skirts: true, turret: { x: 0.35, length: 3.1, width: 2.8, height: 0.75, shape: 'cast' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.125 }], cupola: true };
// T-80U / T-80UD: the Kontakt-5 wedge on the turret front gives it a flat-topped, squared look.
G['t-80u'] = { ...G['t-80b'], turret: { x: 0.35, length: 3.4, width: 3.0, height: 0.78, shape: 'flat' }, turrets: cheeks(1.55, 0.9, 0.3, 0.6, 0.95, 0.42) };
// T-84 Oplot-M: a welded turret with a long box bustle (7.08 x 3.78 x 2.22 m).
G['t-84-oplot-m'] = { cls: 'mbt', chassis: 'tracked', length: 7.08, width: 3.78, hullHeight: 1.4, roadWheels: 6, skirts: true, turret: { x: 0.0, length: 4.0, width: 3.1, height: 0.8, shape: 'wedge' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.125 }], cupola: true };
// ZTZ-96B: a T-72-like hull, a welded wedge turret (6.9 x 3.5 x 2.3 m, est).
G['ztz-96b'] = { cls: 'mbt', chassis: 'tracked', length: 6.9, width: 3.5, hullHeight: 1.45, roadWheels: 6, skirts: true, turret: { x: 0.1, length: 3.6, width: 3.0, height: 0.8, shape: 'wedge' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.125 }] };
// ZTZ-99: a longer hull, a big arrow-headed turret (7.6 x 3.5 x 2.37 m).
G['ztz-99'] = { cls: 'mbt', chassis: 'tracked', length: 7.6, width: 3.5, hullHeight: 1.45, roadWheels: 6, skirts: true, turret: { x: -0.2, length: 4.4, width: 3.3, height: 0.85, shape: 'wedge' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.125 }], cupola: true };
// BMPT Terminator: a T-72 hull with a low turret, twin 30 mm and four Ataka tubes in two armoured boxes.
G['bmpt-terminator'] = { ...G['t-72a'], cls: 'ifv', cupola: false, turret: { x: -0.3, length: 2.8, width: 2.4, height: 0.7, shape: 'sloped' }, guns: [{ mount: 'turret', count: 2, length: 2.8, calibre: 0.03, spread: 0.5, elevation: 0.05 }], missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 2.2, diameter: 0.3, boxes: true, elevation: 0.05, up: 0.6 }] };
// TOS-1A: a T-72 hull with a 24-tube box launcher (est 6.9 x 3.46 m).
G['tos-1a'] = { ...G['t-72a'], cls: 'mlrs', cupola: false, turret: undefined, guns: undefined, missiles: [{ mount: 'hull', rows: 4, cols: 6, length: 4.2, diameter: 0.22, pod: true, elevation: 0.3, x: -0.6, up: 1.05 }] };

// ---------------------------------------------------------------- Western tanks

// M60A3: a tall hull, the long cast turret and its big commander's cupola (6.95 x 3.63 x 3.27 m).
G['m60a3'] = { cls: 'mbt', chassis: 'tracked', length: 6.95, width: 3.63, hullHeight: 1.75, roadWheels: 6, turret: { x: 0.0, length: 3.8, width: 3.0, height: 0.95, shape: 'cast' }, guns: [{ mount: 'turret', length: 5.4, calibre: 0.105 }], turrets: [{ x: -0.5, length: 1.0, width: 1.0, height: 0.45, shape: 'cylinder', side: 0.6, up: 0.95 }] };
// M48 Patton: lower and rounder than the M60 (6.82 x 3.65 x 3.1 m).
G['m48-patton'] = { cls: 'mbt', chassis: 'tracked', length: 6.82, width: 3.65, hullHeight: 1.6, roadWheels: 6, turret: { x: 0.1, length: 3.4, width: 3.0, height: 0.95, shape: 'round' }, guns: [{ mount: 'turret', length: 4.6, calibre: 0.09 }], cupola: true };
// M1A1 and M1A2 SEPv3: the Abrams with the bustle rack; the C a little heavier (7.93 x 3.66 x 2.44 m).
G['m1a2c-sepv3'] = { cls: 'mbt', chassis: 'tracked', length: 7.93, width: 3.66, hullHeight: 1.6, roadWheels: 7, skirts: true, turret: { x: -0.5, length: 5.6, width: 3.6, height: 0.85, shape: 'wedge' }, guns: [{ mount: 'turret', length: 5.3, calibre: 0.12 }], cupola: true, rws: true };
// Leopard 1A3 / 1A5: the welded turret with spaced armour; the A5 squarer.
G['leopard-1a3'] = { cls: 'mbt', chassis: 'tracked', length: 7.09, width: 3.25, hullHeight: 1.55, roadWheels: 7, skirts: true, turret: { x: -0.1, length: 3.5, width: 3.0, height: 0.95, shape: 'sloped', slope: 0.18 }, guns: [{ mount: 'turret', length: 5.4, calibre: 0.105 }] };
// Leopard 2A4: the upright-faced box turret (7.72 x 3.7 x 2.48 m).
G['leopard-2a4'] = { cls: 'mbt', chassis: 'tracked', length: 7.72, width: 3.7, hullHeight: 1.75, roadWheels: 7, skirts: true, turret: { x: -0.3, length: 4.2, width: 3.3, height: 0.9, shape: 'flat' }, guns: [{ mount: 'turret', length: 5.3, calibre: 0.12 }], cupola: true };
// Leopard 2A5: the add-on wedge on the turret front.
G['leopard-2a5'] = { ...G['leopard-2a4'], turret: { x: -0.3, length: 4.4, width: 3.3, height: 0.95, shape: 'wedge' } };
// Leopard 2A6 / 2A6M: the 2A5 with the longer L/55 gun (the starter `leopard-2a6`).
// Challenger 2: slab-sided turret with a long bustle (8.3 x 3.5 x 2.49 m).
G['challenger-2'] = { cls: 'mbt', chassis: 'tracked', length: 8.3, width: 3.52, hullHeight: 1.7, roadWheels: 6, skirts: true, turret: { x: -0.5, length: 4.6, width: 3.3, height: 0.85, shape: 'sloped', slope: 0.1 }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.12 }], cupola: true };
// Chieftain Mk 3: a long sloped cast turret, a low hull with skirts (7.52 x 3.5 x 2.9 m).
G['chieftain-mk3'] = { cls: 'mbt', chassis: 'tracked', length: 7.52, width: 3.5, hullHeight: 1.6, roadWheels: 6, skirts: true, turret: { x: 0.0, length: 4.2, width: 3.1, height: 0.85, shape: 'wedge' }, guns: [{ mount: 'turret', length: 6.1, calibre: 0.12 }], cupola: true };
// Leclerc: a compact turret with the autoloader bustle (6.88 x 3.71 x 2.53 m).
G['leclerc'] = { cls: 'mbt', chassis: 'tracked', length: 6.88, width: 3.71, hullHeight: 1.6, roadWheels: 6, skirts: true, turret: { x: -0.4, length: 4.1, width: 3.2, height: 0.9, shape: 'box' }, guns: [{ mount: 'turret', length: 6.2, calibre: 0.12 }], cupola: true };
// Merkava Mk 4: the engine in front, a long arrow-shaped turret set well back (7.6 x 3.72 x 2.66 m).
G['merkava-mk4'] = { cls: 'mbt', chassis: 'tracked', length: 7.6, width: 3.72, hullHeight: 1.65, roadWheels: 6, skirts: true, hull: 'tank', turret: { x: -1.0, length: 4.6, width: 3.2, height: 0.95, shape: 'wedge' }, guns: [{ mount: 'turret', length: 6.2, calibre: 0.12 }], cupola: true };
// Type 90 / K2 / Altay class Western-style tanks share the Leopard 2A5 look (generic, not used for a named type).

// ---------------------------------------------------------------- light tanks and gun systems

// PT-76: a long boat hull, six road wheels, a flat conical turret (6.91 x 3.14 x 2.33 m).
G['pt-76'] = { cls: 'light-tank', chassis: 'tracked', length: 6.91, width: 3.14, hullHeight: 1.45, roadWheels: 6, hull: 'boat', turret: { x: 0.9, length: 2.2, width: 2.1, height: 0.7, shape: 'round' }, guns: [{ mount: 'turret', length: 3.5, calibre: 0.076 }] };
// FV101 Scorpion: a small hull, five road wheels, the 76 mm short gun (4.79 x 2.24 x 2.1 m).
G['fv101-scorpion'] = { cls: 'light-tank', chassis: 'tracked', length: 4.79, width: 2.24, hullHeight: 1.35, roadWheels: 5, turret: { x: -0.3, length: 1.9, width: 1.7, height: 0.6, shape: 'sloped' }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.076 }] };
// FV107 Scimitar: the Scorpion with the 30 mm Rarden.
G['fv107-scimitar'] = { ...G['fv101-scorpion'], guns: [{ mount: 'turret', length: 2.6, calibre: 0.03 }] };
// M551 Sheridan: aluminium hull, five road wheels, a short fat gun-launcher (6.3 x 2.8 x 2.3 m).
G['m551-sheridan'] = { cls: 'light-tank', chassis: 'tracked', length: 6.3, width: 2.8, hullHeight: 1.4, roadWheels: 5, turret: { x: 0.1, length: 2.6, width: 2.3, height: 0.75, shape: 'cast' }, guns: [{ mount: 'turret', length: 1.9, calibre: 0.152 }] };
// 2S25 Sprut-SD: a BMD-3-based hull with a big 125 mm turret (7.08 x 3.15 x 3.05 m).
G['2s25-sprut-sd'] = { cls: 'light-tank', chassis: 'tracked', length: 7.08, width: 3.15, hullHeight: 1.55, roadWheels: 7, hull: 'boat', turret: { x: 0.0, length: 3.2, width: 2.6, height: 0.8, shape: 'sloped' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.125 }] };
// M1128 Stryker MGS: the Stryker with a low turret and its 105 mm (6.95 x 2.72 x 2.64 m).
G['m1128-stryker-mgs'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 6.95, width: 2.72, hullHeight: 2.0, axles: 4, wheelRadius: 0.55, hull: 'box', turret: { x: -0.2, length: 2.6, width: 1.6, height: 0.6, shape: 'sloped' }, guns: [{ mount: 'turret', length: 5.2, calibre: 0.105 }] };
// Centauro / ZTL-11 class 8x8 tank destroyers (est 7.4 x 3.0 m).
G['centauro'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 7.4, width: 3.05, hullHeight: 1.75, axles: 4, wheelRadius: 0.6, hull: 'boat', turret: { x: -0.2, length: 3.2, width: 2.5, height: 0.75, shape: 'wedge' }, guns: [{ mount: 'turret', length: 5.5, calibre: 0.105 }] };

// ---------------------------------------------------------------- infantry fighting vehicles

// BMP-1: low wedge hull, the small round turret with the short 73 mm and the Malyutka rail (6.74 x 2.94 x 2.07 m).
G['bmp-1'] = { cls: 'ifv', chassis: 'tracked', length: 6.74, width: 2.94, hullHeight: 1.45, roadWheels: 6, hull: 'boat', turret: { x: 0.3, length: 1.9, width: 1.8, height: 0.55, shape: 'round' }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.073 }], missiles: [{ mount: 'turret-top', rows: 1, cols: 1, length: 0.9, diameter: 0.13, elevation: 0.05, x: 0.6 }] };
// BMP-3: a longer hull, the turret with the 100 mm and coaxial 30 mm (7.14 x 3.15 x 2.3 m).
G['bmp-3'] = { cls: 'ifv', chassis: 'tracked', length: 7.14, width: 3.15, hullHeight: 1.55, roadWheels: 6, hull: 'boat', turret: { x: 0.2, length: 2.4, width: 2.2, height: 0.65, shape: 'sloped' }, guns: [{ mount: 'turret', length: 3.3, calibre: 0.1 }, { mount: 'turret', length: 3.0, calibre: 0.03, at: 0.25 }] };
G['bmp-3-era'] = { ...G['bmp-3'], skirts: true };
// BMD-1/-2: a small airborne hull, five road wheels, a BMP turret (5.4 x 2.63 x 1.97 m).
G['bmd-1'] = { cls: 'ifv', chassis: 'tracked', length: 5.4, width: 2.63, hullHeight: 1.25, roadWheels: 5, hull: 'boat', turret: { x: 0.4, length: 1.8, width: 1.7, height: 0.55, shape: 'round' }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.073 }], missiles: [{ mount: 'turret-top', rows: 1, cols: 1, length: 0.9, diameter: 0.13, elevation: 0.05, x: 0.6 }] };
G['bmd-2'] = { ...G['bmd-1'], guns: [{ mount: 'turret', length: 3.0, calibre: 0.03 }], missiles: [{ mount: 'turret-side', rows: 1, cols: 1, length: 1.2, diameter: 0.15, elevation: 0.05 }] };
// BMD-3/-4: longer, seven small road wheels (6.36 x 3.13 x 2.25 m).
G['bmd-3'] = { cls: 'ifv', chassis: 'tracked', length: 6.36, width: 3.13, hullHeight: 1.35, roadWheels: 7, hull: 'boat', turret: { x: 0.3, length: 2.0, width: 1.8, height: 0.6, shape: 'round' }, guns: [{ mount: 'turret', length: 3.0, calibre: 0.03 }] };
G['bmd-4'] = { ...G['bmd-3'], turret: { x: 0.3, length: 2.3, width: 2.1, height: 0.65, shape: 'sloped' }, guns: [{ mount: 'turret', length: 2.2, calibre: 0.1 }, { mount: 'turret', length: 2.6, calibre: 0.03, at: 0.25 }] };
// BTR-D / BTR-RD: the turretless BMD-1 carrier (5.88 x 2.63 x 1.67 m).
G['btr-d'] = { cls: 'apc-tracked', chassis: 'tracked', length: 5.88, width: 2.63, hullHeight: 1.45, roadWheels: 6, hull: 'boat', boxes: [{ x: -0.6, length: 2.6, height: 0.3, width: 2.0 }] };
// 2S9 Nona: the BTR-D with a short 120 mm turret.
G['2s9-nona'] = { ...G['btr-d'], cls: 'sp-artillery', boxes: undefined, turret: { x: -0.2, length: 2.0, width: 1.9, height: 0.65, shape: 'sloped' }, guns: [{ mount: 'turret', length: 1.8, calibre: 0.12, elevation: 0.15 }] };
// Marder 1A3: tall box hull, a small 20 mm turret, Milan on the side (6.79 x 3.24 x 2.98 m).
G['marder-1a3'] = { cls: 'ifv', chassis: 'tracked', length: 6.79, width: 3.24, hullHeight: 1.9, roadWheels: 6, hull: 'box', skirts: true, turret: { x: 0.1, length: 1.9, width: 1.6, height: 0.6, shape: 'box' }, guns: [{ mount: 'turret', length: 2.4, calibre: 0.02 }], missiles: [{ mount: 'turret-side', rows: 1, cols: 1, length: 1.2, diameter: 0.12, elevation: 0.05 }] };
// FV510 Warrior: box hull, the Rarden turret (6.34 x 3.03 x 2.8 m).
G['fv510-warrior'] = { cls: 'ifv', chassis: 'tracked', length: 6.34, width: 3.03, hullHeight: 1.95, roadWheels: 6, hull: 'box', turret: { x: 0.2, length: 2.0, width: 1.9, height: 0.75, shape: 'sloped' }, guns: [{ mount: 'turret', length: 2.6, calibre: 0.03 }] };
// CV90: a low long hull, seven road wheels, a 30/35/40 mm turret (6.8 x 3.2 x 2.8 m).
G['cv90'] = { cls: 'ifv', chassis: 'tracked', length: 6.8, width: 3.2, hullHeight: 1.75, roadWheels: 7, hull: 'box', skirts: true, turret: { x: 0.1, length: 2.6, width: 2.2, height: 0.8, shape: 'sloped' }, guns: [{ mount: 'turret', length: 3.0, calibre: 0.035 }] };
// Bradley M2A3 / M3A3: the starter `m2a2-bradley`.
// ZBD-04A: a BMP-3-like turret on a longer hull (7.2 x 3.2 x 2.5 m).
G['zbd-04a'] = { cls: 'ifv', chassis: 'tracked', length: 7.2, width: 3.2, hullHeight: 1.65, roadWheels: 6, hull: 'boat', turret: { x: 0.2, length: 2.4, width: 2.2, height: 0.65, shape: 'sloped' }, guns: [{ mount: 'turret', length: 3.0, calibre: 0.1 }, { mount: 'turret', length: 3.0, calibre: 0.03, at: 0.25 }] };
// ZBD-05: a large amphibious hull with a bow plate (9.5 x 3.6 x 3.1 m).
G['zbd-05'] = { cls: 'ifv', chassis: 'tracked', length: 9.5, width: 3.6, hullHeight: 1.85, roadWheels: 6, hull: 'boat', turret: { x: 0.5, length: 2.4, width: 2.2, height: 0.7, shape: 'sloped' }, guns: [{ mount: 'turret', length: 3.0, calibre: 0.03 }] };
G['ztd-05'] = { ...G['zbd-05'], cls: 'tank-destroyer', turret: { x: 0.2, length: 3.4, width: 2.8, height: 0.8, shape: 'sloped' }, guns: [{ mount: 'turret', length: 5.0, calibre: 0.105 }] };
// AAV-7A1: the tall amphibious box, its small turret to the right (7.94 x 3.27 x 3.26 m).
G['aav-7a1'] = { cls: 'apc-tracked', chassis: 'tracked', length: 7.94, width: 3.27, hullHeight: 2.6, roadWheels: 6, hull: 'boat', turret: { x: 1.4, length: 1.1, width: 1.0, height: 0.6, shape: 'cylinder', side: 0.9 }, guns: [{ mount: 'turret', length: 1.2, calibre: 0.04 }] };

// ---------------------------------------------------------------- wheeled carriers and scouts

// BTR-60PB / BTR-70: the long boat hull, eight wheels, a small 14.5 mm turret (7.56 x 2.83 x 2.31 m).
G['btr-60'] = { cls: 'apc-wheeled', chassis: 'wheeled', length: 7.56, width: 2.83, hullHeight: 1.85, axles: 4, wheelRadius: 0.55, hull: 'boat', turret: { x: 1.0, length: 1.2, width: 1.1, height: 0.45, shape: 'cast' }, guns: [{ mount: 'turret', length: 1.5, calibre: 0.0145 }] };
G['btr-70'] = { ...G['btr-60'], length: 7.54, width: 2.8 };
// BTR-82A: the BTR-80 with a 30 mm turret (7.65 x 2.9 x 2.8 m).
G['btr-82a'] = { cls: 'apc-wheeled', chassis: 'wheeled', length: 7.65, width: 2.9, hullHeight: 2.0, axles: 4, wheelRadius: 0.55, hull: 'boat', turret: { x: 1.0, length: 1.5, width: 1.3, height: 0.55, shape: 'cast' }, guns: [{ mount: 'turret', length: 2.6, calibre: 0.03 }] };
// BTR-90 / BTR-4 class 8x8 with a BMP-2 turret (est).
G['btr-90'] = { cls: 'ifv', chassis: 'wheeled', length: 7.64, width: 3.2, hullHeight: 2.1, axles: 4, wheelRadius: 0.6, hull: 'boat', turret: { x: 0.6, length: 1.9, width: 1.8, height: 0.6, shape: 'round' }, guns: [{ mount: 'turret', length: 3.0, calibre: 0.03 }] };
// LAV-25: eight wheels, the 25 mm turret (6.39 x 2.5 x 2.69 m).
G['lav-25'] = { cls: 'ifv', chassis: 'wheeled', length: 6.39, width: 2.5, hullHeight: 1.95, axles: 4, wheelRadius: 0.52, hull: 'boat', turret: { x: 0.0, length: 1.8, width: 1.6, height: 0.65, shape: 'sloped' }, guns: [{ mount: 'turret', length: 2.4, calibre: 0.025 }] };
// LAV-AD: the LAV with a Blazer turret - a 25 mm gatling and Stinger pods.
G['lav-ad'] = { ...G['lav-25'], cls: 'spaa', turret: { x: -0.2, length: 2.0, width: 1.6, height: 0.9, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 2, length: 1.6, diameter: 0.16, pod: true, elevation: 0.15, up: 0.5 }] };
// Stryker family: a slab-sided 8x8; the ATGM with a TOW turret, the CV with antennas, the Dragoon with a 30 mm turret.
G['m1134-stryker-atgm'] = { cls: 'apc-wheeled', chassis: 'wheeled', length: 6.95, width: 2.72, hullHeight: 2.2, axles: 4, wheelRadius: 0.55, hull: 'box', turret: { x: -0.4, length: 1.0, width: 0.8, height: 0.5, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 1, cols: 2, length: 1.4, diameter: 0.22, boxes: true, elevation: 0.05, up: 0.3 }] };
G['m1130-stryker-cv'] = { cls: 'apc-wheeled', chassis: 'wheeled', length: 6.95, width: 2.72, hullHeight: 2.2, axles: 4, wheelRadius: 0.55, hull: 'box', rws: true, radars: [{ kind: 'bar', x: -2.4, up: 2.2, size: 0.3 }, { kind: 'bar', x: -2.8, up: 1.8, size: 0.3, side: 0.8 }] };
G['m1296-stryker-dragoon'] = { cls: 'ifv', chassis: 'wheeled', length: 6.95, width: 2.72, hullHeight: 2.2, axles: 4, wheelRadius: 0.55, hull: 'box', turret: { x: -0.2, length: 1.6, width: 1.3, height: 0.5, shape: 'box' }, guns: [{ mount: 'turret', length: 2.6, calibre: 0.03 }] };
// TPz Fuchs: a 6x6 with a pointed front (6.83 x 2.98 x 2.37 m).
G['tpz-fuchs'] = { cls: 'apc-wheeled', chassis: 'wheeled', length: 6.83, width: 2.98, hullHeight: 2.2, axles: 3, wheelRadius: 0.55, hull: 'boat', rws: true };
// VAB 4x4; the Mephisto carries a raised HOT launcher (5.98 x 2.49 x 2.06 m).
G['vab'] = { cls: 'apc-wheeled', chassis: 'wheeled', length: 5.98, width: 2.49, hullHeight: 2.0, axles: 2, wheelRadius: 0.55, hull: 'box', rws: true };
G['vab-mephisto'] = { ...G['vab'], cls: 'atgm', rws: false, turret: { x: -0.6, length: 0.9, width: 0.8, height: 0.5, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 1.4, diameter: 0.2, boxes: true, elevation: 0.05, up: 0.4 }] };
// WZ-551 / ZSL-92: a boxy 6x6 (6.63 x 2.86 x 2.89 m).
G['wz-551'] = { cls: 'apc-wheeled', chassis: 'wheeled', length: 6.63, width: 2.86, hullHeight: 2.0, axles: 3, wheelRadius: 0.55, hull: 'boat', turret: { x: 0.2, length: 1.6, width: 1.5, height: 0.6, shape: 'sloped' }, guns: [{ mount: 'turret', length: 2.4, calibre: 0.025 }] };
// BRDM-2 (base), the Malyutka version with its six-rail launcher raised from the hull.
G['brdm-2'] = { cls: 'scout-car', ...BRDM_2, turret: { x: 0.0, length: 1.0, width: 0.9, height: 0.55, shape: 'cast' }, guns: [{ mount: 'turret', length: 1.5, calibre: 0.0145 }] };
G['brdm-2-malyutka'] = { cls: 'atgm', ...BRDM_2, turret: { x: -0.2, length: 1.6, width: 1.4, height: 0.15, shape: 'box' }, missiles: [{ mount: 'turret-top', rows: 1, cols: 6, length: 0.86, diameter: 0.13, elevation: 0.05, up: 0.15 }] };
// BRDM-1 (est): the older open-topped scout car.
G['brdm-1'] = { cls: 'scout-car', ...BRDM_2, length: 5.7, width: 2.25, openTop: true };
// Otokar Cobra 4x4 (5.24 x 2.23 x 2.1 m).
G['otokar-cobra'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.24, width: 2.23, hullHeight: 1.95, axles: 2, wheelRadius: 0.5, hull: 'boat', rws: true };

// ---------------------------------------------------------------- MRAPs and light vehicles

// M-ATV (6.27 x 2.49 x 2.7 m), MaxxPro (6.5 x 2.6 x 3.0 m), Tigr (5.7 x 2.4 x 2.4 m), Titan (est).
G['m-atv'] = { cls: 'mrap', chassis: 'wheeled', length: 6.27, width: 2.49, hullHeight: 2.6, axles: 2, hull: 'mrap', wheelRadius: 0.6, rws: true };
G['maxxpro'] = { cls: 'mrap', chassis: 'wheeled', length: 6.5, width: 2.6, hullHeight: 3.0, axles: 2, hull: 'mrap', wheelRadius: 0.55, rws: true };
G['gaz-tigr'] = { cls: 'mrap', chassis: 'wheeled', length: 5.7, width: 2.4, hullHeight: 2.2, axles: 2, hull: 'mrap', wheelRadius: 0.55 };
G['za-spn-titan'] = { cls: 'mrap', chassis: 'wheeled', length: 6.0, width: 2.55, hullHeight: 2.6, axles: 2, hull: 'mrap', wheelRadius: 0.6, rws: true };
// JLTV (6.2 x 2.5 x 2.6 m), Marauder (6.9 x 2.7 x 2.9 m), Vodnik (5.13 x 2.45 x 2.2 m), Bushmaster-class.
G['jltv'] = { cls: 'mrap', chassis: 'wheeled', length: 6.2, width: 2.5, hullHeight: 2.5, axles: 2, hull: 'mrap', wheelRadius: 0.6, rws: true };
G['marauder'] = { cls: 'mrap', chassis: 'wheeled', length: 6.9, width: 2.7, hullHeight: 2.8, axles: 2, hull: 'mrap', wheelRadius: 0.62, rws: true };
G['gaz-vodnik'] = { cls: 'mrap', chassis: 'wheeled', length: 5.13, width: 2.45, hullHeight: 2.0, axles: 2, hull: 'mrap', wheelRadius: 0.55 };
// HMMWV variants: with a roof MG, and with a TOW launcher.
G['m1043-hmmwv-mg'] = { cls: 'jeep', ...HMMWV, turret: { x: -0.3, length: 0.8, width: 0.8, height: 0.35, shape: 'cylinder' }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.013 }] };
G['m1045-hmmwv-tow'] = { cls: 'atgm', ...HMMWV, turret: { x: -0.3, length: 0.8, width: 0.8, height: 0.35, shape: 'cylinder' }, missiles: [{ mount: 'turret-top', rows: 1, cols: 1, length: 1.6, diameter: 0.25, elevation: 0.05 }] };
// UAZ-469 (4.03 x 1.79 x 2.05 m), Land Rover 109 (4.45 x 1.68 x 2.0 m), G-Wagen class.
G['uaz-469'] = { cls: 'jeep', chassis: 'wheeled', length: 4.03, width: 1.79, hullHeight: 1.95, axles: 2, hull: 'car', wheelRadius: 0.4 };
G['land-rover-109'] = { cls: 'jeep', chassis: 'wheeled', length: 4.45, width: 1.68, hullHeight: 1.95, axles: 2, hull: 'car', wheelRadius: 0.4 };
G['land-rover-101'] = { cls: 'truck', chassis: 'wheeled', length: 4.3, width: 1.84, hullHeight: 2.1, axles: 2, wheelRadius: 0.45, hull: 'truck', cab: { length: 1.3, height: 2.1, bonnet: 1.0 }, bed: 'covered' };
// Buggies and light strike vehicles: an open cage (DPV 4.08 x 2.11 x 2.01 m).
G['dpv-buggy'] = { cls: 'light-strike', chassis: 'wheeled', length: 4.08, width: 2.11, hullHeight: 1.1, axles: 2, hull: 'open', open: true, wheelRadius: 0.4, guns: [{ mount: 'top', length: 1.4, calibre: 0.013 }] };
G['flyer-72'] = { cls: 'light-strike', chassis: 'wheeled', length: 5.3, width: 2.0, hullHeight: 1.2, axles: 2, hull: 'open', open: true, wheelRadius: 0.45, guns: [{ mount: 'top', length: 1.4, calibre: 0.013 }] };
// A sedan, a van, a bus, a trolley bus.
G['car-sedan'] = { cls: 'civilian-car', chassis: 'wheeled', length: 4.3, width: 1.7, hullHeight: 1.45, axles: 2, hull: 'car', wheelRadius: 0.32 };
G['bus'] = { cls: 'bus', chassis: 'wheeled', length: 11.0, width: 2.5, hullHeight: 3.0, axles: 2, axleAt: [0.65, -0.45], wheelRadius: 0.5, hull: 'box' };
G['trolleybus'] = { ...G['bus'], length: 11.8, radars: [{ kind: 'bar', x: 1.0, up: 1.0, size: 0.4, mast: 'pole' }] };

// ---------------------------------------------------------------- self-propelled guns and rocket launchers

// 2S1 Gvozdika: an MT-LB-derived hull, the turret at the back, 122 mm (7.26 x 2.85 x 2.73 m).
G['2s1-gvozdika'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.26, width: 2.85, hullHeight: 1.6, roadWheels: 7, hull: 'boat', turret: { x: -0.9, length: 2.6, width: 2.4, height: 0.95, shape: 'sloped' }, guns: [{ mount: 'turret', length: 4.3, calibre: 0.122, elevation: 0.05 }] };
// 2S3 Akatsiya: a big round turret over the back, 152 mm (7.76 x 3.25 x 3.05 m).
G['2s3-akatsiya'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.76, width: 3.25, hullHeight: 1.6, roadWheels: 6, turret: { x: -1.0, length: 3.6, width: 3.0, height: 1.4, shape: 'cast' }, guns: [{ mount: 'turret', length: 5.0, calibre: 0.152, elevation: 0.05 }] };
// 2S19 Msta-S: the boxy turret on a T-80-based hull, 152 mm L/47 (7.15 x 3.38 x 2.99 m).
G['2s19-msta'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.15, width: 3.38, hullHeight: 1.6, roadWheels: 6, skirts: true, turret: { x: -0.8, length: 4.2, width: 3.2, height: 1.4, shape: 'tall' }, guns: [{ mount: 'turret', length: 7.1, calibre: 0.152, elevation: 0.08, at: 0.5 }] };
// Dana vz. 77: a Tatra 8x8 with an armoured cab and the gun housing on the back (11.16 x 3.0 x 2.85 m).
G['dana-vz77'] = { cls: 'sp-artillery', chassis: 'wheeled', length: 11.16, width: 3.0, hullHeight: 1.6, axles: 4, axleAt: [0.72, 0.42, -0.45, -0.72], wheelRadius: 0.6, hull: 'truck', cab: { length: 2.6, height: 2.6 }, bed: 'flat', turret: { x: -1.6, length: 5.2, width: 2.8, height: 1.2, shape: 'box' }, guns: [{ mount: 'turret', length: 5.0, calibre: 0.152, elevation: 0.05 }] };
// T-155 Fırtına / K9: a long hull, a big turret at the back (7.44 x 3.4 x 2.73 m).
G['k9-firtina'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.44, width: 3.4, hullHeight: 1.55, roadWheels: 6, turret: { x: -0.9, length: 4.2, width: 3.2, height: 1.25, shape: 'sloped', slope: 0.08 }, guns: [{ mount: 'turret', length: 7.4, calibre: 0.155, elevation: 0.06 }] };
// PLZ-05 (est 7.3 x 3.4 m): a tall angular turret.
G['plz-05'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.3, width: 3.4, hullHeight: 1.6, roadWheels: 7, turret: { x: -0.8, length: 4.4, width: 3.3, height: 1.35, shape: 'sloped', slope: 0.1 }, guns: [{ mount: 'turret', length: 8.0, calibre: 0.155, elevation: 0.06 }] };
// M110A2: an open mount at the back, 203 mm (hull 5.72 m; 10.73 m with gun).
G['m110a2'] = { cls: 'sp-artillery', chassis: 'tracked', length: 5.72, width: 3.15, hullHeight: 1.5, roadWheels: 5, turret: { x: -1.6, length: 1.6, width: 2.2, height: 0.8, shape: 'open' }, guns: [{ mount: 'turret', length: 7.6, calibre: 0.203, elevation: 0.15, at: 0.6 }] };
// M270 MLRS: a Bradley-derived carrier, its armoured cab and two six-round pods behind it (6.86 x 2.97 x 2.59 m).
G['m270-mlrs'] = { cls: 'mlrs', chassis: 'tracked', length: 6.86, width: 2.97, hullHeight: 1.15, roadWheels: 6, hull: 'box', boxes: [{ x: 2.5, length: 1.9, height: 1.35, width: 2.9 }], missiles: [{ mount: 'hull', rows: 2, cols: 6, length: 4.2, diameter: 0.3, pod: true, elevation: 0.1, x: -0.9, up: 0.5 }] };
// M142 HIMARS: an FMTV with one six-round pod (7.0 x 2.4 x 3.2 m).
G['m142-himars'] = { cls: 'mlrs', ...FMTV, bed: 'flat', hullHeight: 1.2, missiles: [{ mount: 'hull', rows: 2, cols: 3, length: 4.2, diameter: 0.3, pod: true, elevation: 0.15, x: -1.3, up: 0.55 }] };
// BM-27 Uragan on ZiL-135: sixteen 220 mm tubes (9.63 x 2.8 x 3.23 m).
G['bm-27-uragan'] = { cls: 'mlrs', chassis: 'wheeled', length: 9.63, width: 2.8, hullHeight: 1.45, axles: 4, axleAt: [0.78, 0.36, -0.36, -0.78], wheelRadius: 0.62, hull: 'truck', cab: { length: 2.4, height: 2.6 }, bed: 'flat', missiles: [{ mount: 'hull', rows: 3, cols: 6, length: 5.2, diameter: 0.22, elevation: 0.12, x: -1.8, up: 0.65 }] };
// BM-30 Smerch on MAZ-543M: twelve 300 mm tubes (12.1 x 3.05 x 3.05 m).
G['bm-30-smerch'] = { cls: 'mlrs', ...MAZ_543, length: 12.1, missiles: [{ mount: 'hull', rows: 3, cols: 4, length: 7.6, diameter: 0.3, elevation: 0.1, x: -2.2, up: 0.8 }] };
// BM-21 Grad: the starter `bm-21-grad`.

// ---------------------------------------------------------------- towed artillery

// L118 light gun: the box trail and 105 mm (6.1 x 1.78 x 2.13 m).
G['l118-light-gun'] = { cls: 'towed-gun', chassis: 'towed', length: 6.1, width: 1.78, hullHeight: 1.0, axles: 1, wheelRadius: 0.5, shield: false, guns: [{ mount: 'hull', length: 3.2, calibre: 0.105, elevation: 0.2, at: 1.1, x: 0.2 }] };
// M2A1 / M101 105 mm (5.94 x 2.19 x 1.57 m).
G['m101-105mm'] = { cls: 'towed-gun', chassis: 'towed', length: 5.94, width: 2.19, hullHeight: 1.0, axles: 1, wheelRadius: 0.55, guns: [{ mount: 'hull', length: 2.6, calibre: 0.105, elevation: 0.2, at: 1.05, x: 0.2 }] };
// 2B11 120 mm mortar (and other heavy mortars).
// ZU-23-2 on its two-wheeled carriage, no shield (4.57 x 2.88 x 1.87 m travelling).
G['zu-23-2'] = { cls: 'towed-aa', chassis: 'towed', length: 4.57, width: 2.88, hullHeight: 0.9, axles: 1, wheelRadius: 0.4, shield: false, guns: [{ mount: 'hull', count: 2, length: 2.0, calibre: 0.023, elevation: 0.4, at: 1.1, spread: 0.3, x: -0.4 }] };

// ---------------------------------------------------------------- trucks and support vehicles

G['ural-4320-armoured'] = { cls: 'truck', ...URAL_4320, bed: 'box' };
G['ural-4320-tanker'] = { cls: 'truck', ...URAL_4320, bed: 'tank', hullHeight: 2.5 };
G['ural-4320-flatbed'] = { cls: 'truck', ...URAL_4320, bed: 'flat', hullHeight: 1.1 };
G['zil-131-kung'] = { cls: 'truck', ...ZIL_131 };
G['zil-131-covered'] = { cls: 'truck', ...ZIL_131, bed: 'covered' };
G['zil-4331'] = { cls: 'truck', ...ZIL_131, axles: 2, axleAt: undefined, length: 7.0, bed: 'covered' };
G['zil-135'] = { cls: 'truck', chassis: 'wheeled', length: 9.3, width: 2.8, hullHeight: 2.6, axles: 4, axleAt: [0.78, 0.36, -0.36, -0.78], wheelRadius: 0.62, hull: 'truck', cab: { length: 2.4, height: 2.6 }, bed: 'covered' };
G['gaz-66'] = { cls: 'truck', ...GAZ_66 };
G['gaz-3307'] = { cls: 'truck', chassis: 'wheeled', length: 6.55, width: 2.38, hullHeight: 2.35, axles: 2, wheelRadius: 0.48, hull: 'truck', cab: { length: 1.7, height: 2.35, bonnet: 1.5 }, bed: 'covered' };
G['kamaz-43101'] = { cls: 'truck', ...KAMAZ_43101 };
G['kraz-6322'] = { cls: 'truck', ...KRAZ_6322 };
G['kraz-tractor-trailer'] = { cls: 'truck', ...KRAZ_255, length: 16.0, axles: 5, axleAt: [0.82, 0.55, 0.4, -0.65, -0.82], bed: 'tank', hullHeight: 2.9 };
G['maz-6303'] = { cls: 'truck', chassis: 'wheeled', length: 9.1, width: 2.5, hullHeight: 3.2, axles: 3, axleAt: [0.72, -0.4, -0.72], wheelRadius: 0.55, hull: 'truck', cab: { length: 2.2, height: 3.0 }, bed: 'covered' };
G['maz-7410-tractor-trailer'] = { cls: 'truck', chassis: 'wheeled', length: 18.0, width: 2.8, hullHeight: 2.9, axles: 6, axleAt: [0.85, 0.65, 0.53, -0.6, -0.72, -0.84], wheelRadius: 0.6, hull: 'truck', cab: { length: 2.4, height: 3.1 }, bed: 'tank' };
G['m939'] = { cls: 'truck', ...M939 };
G['hemtt'] = { cls: 'truck', ...HEMTT, bed: 'covered', hullHeight: 2.6 };
G['hemtt-tanker'] = { cls: 'truck', ...HEMTT, bed: 'tank', hullHeight: 2.6 };
G['m1083-fmtv'] = { cls: 'truck', ...FMTV };
G['man-hx'] = { cls: 'truck', ...MAN_HX };
G['hx81-tractor-trailer'] = { cls: 'truck', ...MAN_HX, length: 18.5, axles: 6, axleAt: [0.85, 0.65, 0.52, -0.55, -0.7, -0.85], bed: 'flat', hullHeight: 1.4 };
G['firetruck'] = { cls: 'truck', chassis: 'wheeled', length: 8.0, width: 2.5, hullHeight: 3.0, axles: 2, wheelRadius: 0.55, hull: 'truck', cab: { length: 2.4, height: 2.9 }, bed: 'box' };
G['airport-tug'] = { cls: 'truck', chassis: 'wheeled', length: 4.2, width: 2.0, hullHeight: 1.2, axles: 2, wheelRadius: 0.4, hull: 'low', boxes: [{ x: -0.9, length: 1.3, height: 1.0, width: 1.5 }] };
G['larc-v'] = { cls: 'truck', chassis: 'wheeled', length: 10.6, width: 3.05, hullHeight: 2.2, axles: 2, wheelRadius: 0.75, hull: 'boat', boxes: [{ x: 3.4, length: 1.6, height: 1.0, width: 2.0 }] };
G['van-shelter'] = { cls: 'truck', ...ZIL_131, bed: 'box', radars: [{ kind: 'dish', x: -2.4, up: 0.9, size: 1.6, hull: true }] };
G['trailer-shelter'] = { cls: 'truck', ...TRAILER, boxes: [{ x: -0.5, length: 3.2, height: 2.0, width: 2.1 }] };
G['flatbed-semitrailer'] = { cls: 'truck', ...SEMI, length: 13.0 };

// ---------------------------------------------------------------- carriers

G['mt-lb'] = { cls: 'apc-tracked', ...MT_LB, turret: { x: 1.8, length: 0.9, width: 0.8, height: 0.35, shape: 'cast', side: -0.6 }, guns: [{ mount: 'turret', length: 1.0, calibre: 0.0127 }] };
G['m113'] = { cls: 'apc-tracked', ...M113, guns: [{ mount: 'top', length: 1.6, calibre: 0.013 }] };
G['fv432'] = { cls: 'apc-tracked', ...M113, length: 5.25, width: 2.8, hullHeight: 1.85 };

// M50 Ontos: a small tracked carrier with three recoilless rifles on each side of its turret (3.83 x 2.6 x 2.13 m).
G['m50-ontos'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 3.83, width: 2.6, hullHeight: 1.45, roadWheels: 3, hull: 'box', turret: { x: 0.1, length: 0.8, width: 0.6, height: 0.4, shape: 'box' }, guns: [{ mount: 'turret-side', count: 3, length: 2.6, calibre: 0.08, spread: 0.22, at: 0.6 }] };
// PGZ-95 (Type 95 SPAAA): four 25 mm guns, two each side of a turret with its search radar (6.71 x 3.24 x 2.4 m).
G['pgz-95'] = { cls: 'spaa', chassis: 'tracked', length: 6.71, width: 3.24, hullHeight: 1.5, roadWheels: 6, hull: 'box', turret: { x: -0.4, length: 2.4, width: 2.0, height: 0.9, shape: 'box' }, guns: [{ mount: 'turret-side', count: 2, length: 2.2, calibre: 0.025, spread: 0.2, elevation: 0.25, at: 0.45 }], radars: [{ kind: 'panel', x: -0.8, up: 0.6, size: 1.6, height: 0.5, back: true }] };
// Growler ITV: a small open-cage utility vehicle (4.32 x 1.52 x 1.63 m).
G['growler-itv'] = { cls: 'light-strike', chassis: 'wheeled', length: 4.32, width: 1.52, hullHeight: 1.0, axles: 2, hull: 'open', open: true, wheelRadius: 0.4, guns: [{ mount: 'top', length: 1.4, calibre: 0.013 }] };
// A pickup or van (civilian, 5.5 x 2.0 m) and a bulldozer (est 6 x 3 m).
G['pickup'] = { cls: 'civilian-car', chassis: 'wheeled', length: 5.3, width: 1.85, hullHeight: 0.9, axles: 2, wheelRadius: 0.38, hull: 'truck', cab: { length: 2.4, height: 1.8, bonnet: 1.3 }, bed: 'flat' };
G['bulldozer'] = { cls: 'truck', chassis: 'tracked', length: 6.0, width: 3.0, hullHeight: 1.2, roadWheels: 6, hull: 'box', boxes: [{ x: -1.0, length: 1.8, height: 1.8, width: 1.8 }, { x: 3.2, length: 0.3, height: 1.4, width: 3.4, up: -1.0 }] };

export const GROUND_MODERN: SpecSet = { ground: G };
