/**
 * Figures with a builder of their own (`../small.ts`) and the generic figure
 * of each class that has no named type: emplacements and fieldworks, riders,
 * drones, airships, buildings, and the classes that exist only as game
 * inventions (walkers, hover tanks, VTOL gunships, flying capital ships). A
 * fictional design is never recreated: data naming one maps to these.
 */

import type { FigureEntry } from '../catalog';
import type { Named, SpecSet } from './index';
import type { GroundSpec } from '../ground';
import type { FixedWingSpec, HeliSpec } from '../air';
import { buildAirship, buildDrone, buildEmplacement, buildRide, buildWalker, type EmplacementKind, type RideKind } from '../small';

const F: Record<string, FigureEntry> = {};

const emplacement = (cls: string, kind: EmplacementKind, size?: { length: number; width?: number; height: number }): FigureEntry => ({ domain: 'ground', cls, build: () => buildEmplacement({ kind, ...size }) });
const ride = (cls: string, kind: RideKind, length: number, width: number): FigureEntry => ({ domain: 'ground', cls, build: () => buildRide({ kind, length, width }) });

F['emplacement-mg'] = emplacement('emplacement-mg', 'mg');
F['emplacement-atgm'] = emplacement('emplacement-atgm', 'atgm');
F['mortar'] = emplacement('mortar', 'mortar');
F['searchlight'] = emplacement('searchlight', 'searchlight');
F['manpads'] = emplacement('manpads', 'manpad');
F['bunker'] = emplacement('building', 'bunker', { length: 4, width: 4, height: 2.2 });
F['sandbag-ring'] = emplacement('building', 'sandbags', { length: 3, height: 1.0 });
F['watch-tower'] = emplacement('building', 'tower', { length: 3, width: 3, height: 8 });
F['tent'] = emplacement('building', 'tent', { length: 5, width: 4, height: 2.6 });
// Motorcycle (2.2 x 0.8 m), with sidecar (2.4 x 1.73 m), quad (2.1 x 1.2 m), snowmobile (3.2 x 1.2 m), jet ski (3.3 x 1.2 m), Kettenkrad (3.0 x 1.0 m), a horse and rider (2.4 m).
F['motorcycle'] = ride('motorcycle', 'motorcycle', 2.2, 0.8);
F['motorcycle-sidecar'] = ride('motorcycle', 'sidecar', 2.4, 1.73);
F['quad-bike'] = ride('quad', 'quad', 2.1, 1.2);
F['snowmobile'] = ride('snowmobile', 'snowmobile', 3.2, 1.2);
F['jet-ski'] = ride('jetski', 'jetski', 3.3, 1.2);
F['kettenkrad'] = ride('motorcycle', 'kettenkrad', 3.0, 1.0);
F['horse'] = ride('cavalry', 'horse', 2.4, 0.65);
// Quadcopter (0.5 m) and a hexacopter (1.0 m).
F['quadcopter'] = { domain: 'heli', cls: 'drone-rotary', build: () => buildDrone({ rotors: 4, span: 0.5 }) };
F['hexacopter'] = { domain: 'heli', cls: 'drone-rotary', build: () => buildDrone({ rotors: 6, span: 1.0 }) };
// Zeppelin L 30 class (198 x 23.9 m), a C-class blimp (59 x 12 m), a barrage balloon (est 19 x 7.6 m), a WWI observation balloon (est 27 x 8.5 m).
F['zeppelin'] = { domain: 'air', cls: 'airship', build: () => buildAirship({ length: 198, diameter: 23.9, gondolas: 3 }) };
F['blimp'] = { domain: 'air', cls: 'airship', build: () => buildAirship({ length: 59, diameter: 12, gondolas: 1 }) };
F['barrage-balloon'] = { domain: 'air', cls: 'airship', build: () => buildAirship({ length: 19, diameter: 7.6, balloon: true }) };
F['observation-balloon'] = { domain: 'air', cls: 'airship', build: () => buildAirship({ length: 27, diameter: 8.5, balloon: true }) };
// Game-invented classes: generic shapes only.
F['walker'] = { domain: 'ground', cls: 'walker', build: () => buildWalker(8) };
F['titan'] = { domain: 'air', cls: 'titan', build: () => buildAirship({ length: 400, diameter: 80, gondolas: 0 }) };

const G: Named<GroundSpec> = {
  // A plain building, a hangar and a concrete gun casemate with its gun (sizes est).
  building: { cls: 'building', chassis: 'static', length: 10, width: 10, hullHeight: 6 },
  hangar: { cls: 'building', chassis: 'static', length: 40, width: 30, hullHeight: 12 },
  'emplacement-gun': { cls: 'emplacement-gun', chassis: 'static', length: 8, width: 8, hullHeight: 2.4, turret: { x: 0, length: 3.4, width: 3.0, height: 1.2, shape: 'sloped' }, guns: [{ mount: 'turret', length: 6.5, calibre: 0.15, elevation: 0.05 }] },
  // A generic hover tank: a tank hull and turret floating on a skirt.
  'hover-tank': { cls: 'hover-tank', chassis: 'hover', length: 9.0, width: 4.0, hullHeight: 1.5, hull: 'tank', turret: { x: -0.4, length: 3.8, width: 3.0, height: 0.8, shape: 'wedge' }, guns: [{ mount: 'turret', length: 4.0, calibre: 0.12 }] },
  // A generic small ground robot (est 1.5 x 0.8 m).
  'ground-robot': { cls: 'drone-ground', chassis: 'tracked', length: 1.5, width: 0.8, hullHeight: 0.5, roadWheels: 3, hull: 'box', radars: [{ kind: 'bar', x: 0.2, up: 0.5, size: 0.25 }] },
  // A generic command or spawn vehicle: a big armoured box with a mast.
  'command-vehicle': { cls: 'mobile-spawn', chassis: 'wheeled', length: 10, width: 3.5, hullHeight: 3.4, axles: 4, wheelRadius: 0.65, hull: 'box', radars: [{ kind: 'bar', x: -3.0, up: 3.0, size: 0.8 }] },
};

const A: Named<FixedWingSpec> = {
  // A generic VTOL gunship and VTOL transport: a fuselage on lift fans turned up (no game's design).
  'vtol-gunship': { cls: 'vtol-gunship', length: 12, span: 9, height: 3.5, bodyWidth: 1.8, bodyHeight: 1.8, nose: 0.25, wing: { x: -1.0, span: 6.0, rootChord: 2.0, tipChord: 1.4, sweep: 10, mount: 0.4 }, tail: { kind: 'twin', finHeight: 1.4, finChord: 1.4, spacing: 2.0, tailSpan: 3.6, tailChord: 1.0 }, engines: { kind: 'wing-props', count: 2, diameter: 1.0, at: [1.0], up: true, length: 2.0 }, propeller: { diameter: 3.0, blades: 4 }, canopy: { x: 3.5, length: 2.4, kind: 'tandem' } },
  'vtol-transport': { cls: 'vtol-transport', length: 18, span: 14, height: 5, bodyWidth: 3.0, bodyHeight: 3.0, nose: 0.15, blunt: 0.6, wing: { x: 0, span: 10, rootChord: 3.0, tipChord: 2.4, sweep: 5, mount: 1 }, tail: { kind: 'single', finHeight: 2.6, finChord: 2.6, tailSpan: 5.0, tailChord: 1.6 }, engines: { kind: 'wing-props', count: 2, diameter: 1.6, at: [1.0], up: true, length: 3.0 }, propeller: { diameter: 4.4, blades: 4 }, canopy: { x: 6.5, length: 2, kind: 'airliner' } },
  // A generic fixed-wing drone: no cockpit, long straight wing, V tail, pusher prop.
  'drone-fixed': { cls: 'drone-fixed', length: 8.2, span: 14.8, height: 2.1, bodyWidth: 0.8, bodyHeight: 0.9, nose: 0.2, blunt: 0.9, wing: { x: -0.4, span: 14.8, rootChord: 1.0, tipChord: 0.45, sweep: 2, mount: 0.2 }, tail: { kind: 'v', finHeight: 1.4, finChord: 0.8, tailSpan: 0, tailChord: 0 }, engines: { kind: 'pusher', count: 1 }, propeller: { diameter: 1.8, blades: 3 } },
};

// Generic class figures for the air classes: plain average shapes of the class, for data that names only a class or a game-invented type.
A['multirole-jet'] = { cls: 'multirole', length: 16.0, span: 11.0, height: 4.8, bodyWidth: 1.8, bodyHeight: 1.6, nose: 0.2, wing: { x: -1.6, span: 11.0, rootChord: 5.0, tipChord: 1.4, sweep: 38, mount: 0 }, tail: { kind: 'single', finHeight: 2.8, finChord: 3.2, tailSpan: 5.6, tailChord: 2.0 }, engines: { kind: 'internal', count: 1, diameter: 1.1 }, intakes: 'side', canopy: { x: 3.6, length: 2.8, kind: 'bubble' } };
A['fighter-jet'] = { cls: 'fighter', length: 19.0, span: 13.5, height: 5.0, bodyWidth: 2.6, bodyHeight: 1.6, nose: 0.2, wing: { x: -2.2, span: 13.5, rootChord: 6.6, tipChord: 1.5, sweep: 42, mount: 0.4 }, tail: { kind: 'twin', finHeight: 2.8, finChord: 2.8, cant: 15, spacing: 3.0, tailSpan: 8.4, tailChord: 2.6 }, engines: { kind: 'internal', count: 2, diameter: 1.1 }, intakes: 'side', canopy: { x: 4.6, length: 3.2, kind: 'bubble' } };
A['ww2-fighter'] = { cls: 'ww2-fighter', length: 9.5, span: 11.5, height: 3.5, bodyWidth: 1.1, bodyHeight: 1.3, nose: 0.2, blunt: 0.4, wing: { x: 0.8, span: 11.5, rootChord: 2.5, tipChord: 1.2, sweep: 4, mount: -0.8, dihedral: 6 }, tail: { kind: 'single', finHeight: 1.4, finChord: 1.3, tailSpan: 3.6, tailChord: 0.9 }, engines: { kind: 'nose-prop', count: 1 }, propeller: { diameter: 3.2, blades: 3 }, canopy: { x: 0.2, length: 1.7, kind: 'bubble' } };

const H: Named<HeliSpec> = {
  'attack-helicopter': { cls: 'heli-attack', length: 15.0, rotor: 14.0, height: 4.0, bodyWidth: 1.3, bodyHeight: 1.7, cabin: 'tandem', blades: 4, stubs: { span: 4.8, pylons: 2 } },
  'transport-helicopter': { cls: 'heli-transport', length: 16.0, rotor: 16.0, height: 5.0, bodyWidth: 2.4, bodyHeight: 2.4, cabin: 'cabin', blades: 4 },
  'scout-helicopter': { cls: 'heli-scout', length: 8.5, rotor: 9.0, height: 2.6, bodyWidth: 1.5, bodyHeight: 1.6, cabin: 'bubble', blades: 4, skids: true },
};

export const GENERIC: SpecSet = { ground: G, air: A, heli: H, figures: F };
