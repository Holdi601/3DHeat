/**
 * The figures by name: generic ones for each class, and named types built to
 * their published size with the features that tell them apart. Sizes are
 * rounded published values (length without the gun unless stated); the
 * feature placement is judged from public photographs, not taken from any
 * game.
 *
 * A name maps to a builder, so a template is only made when it is first
 * needed (`TemplateCache` keeps it).
 */

import type { Template } from './kit';
import { buildPerson } from './infantry';
import { buildGround, type GroundSpec } from './ground';
import { buildFixedWing, buildHeli, buildMissile, type FixedWingSpec, type HeliSpec, type MissileFigureSpec } from './air';
import { buildNaval, type NavalSpec } from './naval';
import { buildMarker, type MarkerKind } from './markers';
import { SPEC_SETS } from './specs';

export type FigureDomain = 'person' | 'ground' | 'air' | 'heli' | 'missile' | 'sea' | 'marker';

export interface FigureEntry {
  domain: FigureDomain;
  /** The taxonomy class (see taxonomy notes); for matching data to figures. */
  cls: string;
  build: () => Template;
}

// ---------------------------------------------------------------- ground

const G: Record<string, GroundSpec & { cls: string }> = {
  // Generic classes.
  mbt: { cls: 'mbt', chassis: 'tracked', length: 7.6, width: 3.6, hullHeight: 1.75, roadWheels: 7, skirts: true, turret: { x: -0.4, length: 4.6, width: 3.3, height: 0.85, shape: 'wedge' }, guns: [{ mount: 'turret', length: 5.5, calibre: 0.12 }], cupola: true },
  'light-tank': { cls: 'light-tank', chassis: 'tracked', length: 6.2, width: 2.9, hullHeight: 1.4, roadWheels: 5, turret: { x: -0.2, length: 3.0, width: 2.4, height: 0.8, shape: 'wedge' }, guns: [{ mount: 'turret', length: 3.8, calibre: 0.09 }] },
  ifv: { cls: 'ifv', chassis: 'tracked', length: 6.6, width: 3.2, hullHeight: 1.9, roadWheels: 6, hull: 'box', turret: { x: 0.2, length: 2.0, width: 1.8, height: 0.75, shape: 'wedge' }, guns: [{ mount: 'turret', length: 2.6, calibre: 0.04 }] },
  'apc-tracked': { cls: 'apc-tracked', chassis: 'tracked', length: 4.9, width: 2.7, hullHeight: 1.85, roadWheels: 5, hull: 'box', rws: true },
  'apc-wheeled': { cls: 'apc-wheeled', chassis: 'wheeled', length: 7.0, width: 2.9, hullHeight: 2.0, axles: 4, hull: 'boat', turret: { x: 0.6, length: 1.5, width: 1.4, height: 0.55, shape: 'cast' }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.03 }] },
  mrap: { cls: 'mrap', chassis: 'wheeled', length: 6.4, width: 2.5, hullHeight: 2.6, axles: 2, hull: 'mrap', wheelRadius: 0.55, rws: true },
  jeep: { cls: 'jeep', chassis: 'wheeled', length: 4.6, width: 2.2, hullHeight: 1.6, axles: 2, hull: 'car', wheelRadius: 0.42 },
  truck: { cls: 'truck', chassis: 'wheeled', length: 7.4, width: 2.5, hullHeight: 2.9, axles: 3, wheelRadius: 0.55, hull: 'truck', cab: { length: 2.2, height: 2.6 }, bed: 'covered' },
  spaa: { cls: 'spaa', chassis: 'tracked', length: 6.5, width: 3.2, hullHeight: 1.6, roadWheels: 6, turret: { x: 0, length: 2.6, width: 2.4, height: 0.9, shape: 'box' }, guns: [{ mount: 'turret-side', count: 1, length: 3.0, calibre: 0.035, elevation: 0.35 }], radars: [{ kind: 'dish', x: -1.0, up: 0.7, size: 1.4, back: true }] },
  'sp-artillery': { cls: 'sp-artillery', chassis: 'tracked', length: 6.8, width: 3.2, hullHeight: 1.6, roadWheels: 7, turret: { x: -0.9, length: 3.9, width: 3.0, height: 1.5, shape: 'tall' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.155, elevation: 0.12, at: 0.45 }] },
  mlrs: { cls: 'mlrs', chassis: 'wheeled', length: 7.4, width: 2.4, hullHeight: 1.4, axles: 3, wheelRadius: 0.55, hull: 'truck', cab: { length: 2.2, height: 2.5 }, bed: 'flat', missiles: [{ mount: 'hull', rows: 4, cols: 10, length: 3.0, diameter: 0.12, elevation: 0.3, x: -1.4, up: 1.0 }] },
  'towed-gun': { cls: 'towed-gun', chassis: 'towed', length: 5.5, width: 2.1, hullHeight: 1.0, axles: 1, wheelRadius: 0.45, guns: [{ mount: 'hull', length: 3.6, calibre: 0.1, elevation: 0.1, at: 1.0 }] },

  // Named types: the four that must not be confused.
  'zsu-23-4-shilka': { cls: 'spaa', chassis: 'tracked', length: 6.5, width: 3.1, hullHeight: 1.45, roadWheels: 6, hull: 'low', turret: { x: 0.35, length: 3.1, width: 2.9, height: 0.75, shape: 'flat' }, guns: [{ mount: 'turret', count: 4, length: 2.0, calibre: 0.023, spread: 0.18, elevation: 0.25, at: 0.45 }], radars: [{ kind: 'dish', x: -1.0, up: 0.75, size: 1.25 }] },
  '2k22-tunguska': { cls: 'spaa', chassis: 'tracked', length: 7.9, width: 3.25, hullHeight: 1.65, roadWheels: 6, hull: 'low', turret: { x: 0.2, length: 3.4, width: 2.5, height: 1.0, shape: 'tall' }, guns: [{ mount: 'turret-side', count: 2, length: 2.6, calibre: 0.03, spread: 0.2, elevation: 0.2, at: 0.35 }], missiles: [{ mount: 'turret-side', rows: 2, cols: 2, length: 2.6, diameter: 0.17, boxes: true, elevation: 0.2, x: -0.3, up: 1.05 }], radars: [{ kind: 'panel', x: -1.2, up: 0.55, size: 2.3, height: 0.7 }, { kind: 'dish', x: 1.6, up: 0.5, size: 0.9 }] },
  'flakpanzer-gepard': { cls: 'spaa', chassis: 'tracked', length: 7.7, width: 3.3, hullHeight: 1.65, roadWheels: 7, skirts: true, turret: { x: -0.2, length: 3.2, width: 2.2, height: 1.0, shape: 'box' }, guns: [{ mount: 'turret-side', count: 1, length: 3.2, calibre: 0.035, elevation: 0.15, at: 0.45 }], radars: [{ kind: 'panel', x: -1.4, up: 0.75, size: 1.9, height: 0.5 }, { kind: 'dish', x: 1.75, up: 0.35, size: 1.0 }] },
  'roland-marder': { cls: 'spaa', chassis: 'tracked', length: 6.9, width: 3.25, hullHeight: 1.75, roadWheels: 6, hull: 'box', turret: { x: -0.4, length: 1.8, width: 1.4, height: 1.0, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 1, cols: 2, length: 2.6, diameter: 0.27, elevation: 0.25, up: 0.75 }], radars: [{ kind: 'panel', x: -0.1, up: 0.55, size: 1.6, height: 0.35 }, { kind: 'dish', x: 0.9, up: 0.0, size: 0.55 }] },

  // Tanks.
  'm1a2-abrams': { cls: 'mbt', chassis: 'tracked', length: 7.9, width: 3.66, hullHeight: 1.6, roadWheels: 7, skirts: true, turret: { x: -0.5, length: 5.4, width: 3.6, height: 0.82, shape: 'wedge' }, guns: [{ mount: 'turret', length: 5.3, calibre: 0.12 }], cupola: true, rws: true },
  'leopard-2a6': { cls: 'mbt', chassis: 'tracked', length: 7.7, width: 3.75, hullHeight: 1.75, roadWheels: 7, skirts: true, turret: { x: -0.3, length: 4.4, width: 3.3, height: 0.95, shape: 'wedge' }, guns: [{ mount: 'turret', length: 6.6, calibre: 0.12 }], cupola: true },
  't-90a': { cls: 'mbt', chassis: 'tracked', length: 6.9, width: 3.78, hullHeight: 1.45, roadWheels: 6, skirts: true, turret: { x: 0.1, length: 3.3, width: 3.0, height: 0.8, shape: 'cast' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.125 }], cupola: true },
  'leopard-1a5': { cls: 'mbt', chassis: 'tracked', length: 7.1, width: 3.25, hullHeight: 1.6, roadWheels: 7, skirts: true, turret: { x: -0.1, length: 3.6, width: 3.0, height: 1.0, shape: 'wedge' }, guns: [{ mount: 'turret', length: 5.4, calibre: 0.105 }] },
  't-55a': { cls: 'mbt', chassis: 'tracked', length: 6.2, width: 3.27, hullHeight: 1.45, roadWheels: 5, turret: { x: 0.3, length: 2.8, width: 2.6, height: 0.85, shape: 'round' }, guns: [{ mount: 'turret', length: 5.4, calibre: 0.1 }] },

  // Infantry fighting vehicles and carriers.
  'bmp-2': { cls: 'ifv', chassis: 'tracked', length: 6.7, width: 3.15, hullHeight: 1.55, roadWheels: 6, hull: 'boat', turret: { x: 0.3, length: 1.9, width: 1.8, height: 0.6, shape: 'round' }, guns: [{ mount: 'turret', length: 3.0, calibre: 0.03, elevation: 0.05 }], missiles: [{ mount: 'turret-top', rows: 1, cols: 1, length: 1.2, diameter: 0.15, elevation: 0.05 }] },
  'm2a2-bradley': { cls: 'ifv', chassis: 'tracked', length: 6.55, width: 3.6, hullHeight: 2.0, roadWheels: 6, hull: 'box', skirts: true, turret: { x: 0.0, length: 2.3, width: 2.0, height: 0.8, shape: 'wedge', side: 0.35 }, guns: [{ mount: 'turret', length: 2.6, calibre: 0.025 }], missiles: [{ mount: 'turret-side', rows: 1, cols: 2, length: 1.3, diameter: 0.22, boxes: true, elevation: 0, up: 0.55 }] },
  'btr-80': { cls: 'apc-wheeled', chassis: 'wheeled', length: 7.65, width: 2.9, hullHeight: 2.0, axles: 4, wheelRadius: 0.55, hull: 'boat', turret: { x: 1.0, length: 1.3, width: 1.2, height: 0.5, shape: 'cast' }, guns: [{ mount: 'turret', length: 1.5, calibre: 0.0145 }] },
  'm1126-stryker': { cls: 'apc-wheeled', chassis: 'wheeled', length: 6.95, width: 2.72, hullHeight: 2.2, axles: 4, wheelRadius: 0.55, hull: 'box', rws: true },
  'm1025-humvee': { cls: 'jeep', chassis: 'wheeled', length: 4.6, width: 2.16, hullHeight: 1.75, axles: 2, wheelRadius: 0.45, hull: 'car', rws: true },
  'ural-4320': { cls: 'truck', chassis: 'wheeled', length: 7.4, width: 2.5, hullHeight: 2.9, axles: 3, wheelRadius: 0.55, hull: 'truck', cab: { length: 2.4, height: 2.6 }, bed: 'covered' },
  'bm-21-grad': { cls: 'mlrs', chassis: 'wheeled', length: 7.35, width: 2.4, hullHeight: 1.6, axles: 3, wheelRadius: 0.55, hull: 'truck', cab: { length: 2.4, height: 2.5 }, bed: 'flat', missiles: [{ mount: 'hull', rows: 4, cols: 10, length: 3.0, diameter: 0.122, elevation: 0.28, x: -1.5, up: 1.1 }] },
  'm109-paladin': { cls: 'sp-artillery', chassis: 'tracked', length: 6.2, width: 3.15, hullHeight: 1.6, roadWheels: 7, turret: { x: -0.7, length: 3.9, width: 3.0, height: 1.6, shape: 'tall' }, guns: [{ mount: 'turret', length: 6.0, calibre: 0.155, elevation: 0.08, at: 0.55 }] },
  '9k330-tor': { cls: 'sam', chassis: 'tracked', length: 7.5, width: 3.3, hullHeight: 1.6, roadWheels: 6, turret: { x: -0.3, length: 3.2, width: 2.6, height: 1.6, shape: 'tall' }, radars: [{ kind: 'panel', x: -0.8, up: 0.6, size: 2.6, height: 0.9 }, { kind: 'dish', x: 1.65, up: -0.6, size: 1.0 }] },
  'zu-23-2': { cls: 'towed-aa', chassis: 'towed', length: 4.6, width: 2.9, hullHeight: 0.9, axles: 1, wheelRadius: 0.4, guns: [{ mount: 'hull', count: 2, length: 2.0, calibre: 0.023, elevation: 0.4, at: 1.1, spread: 0.3 }] },
  'mim-104-patriot-launcher': { cls: 'sam', chassis: 'wheeled', length: 10.4, width: 2.9, hullHeight: 1.4, axles: 2, wheelRadius: 0.55, hull: 'truck', missiles: [{ mount: 'hull', rows: 2, cols: 2, length: 5.8, diameter: 0.85, boxes: true, elevation: 0.65, x: -1.0, up: 1.6 }] },
};

// ---------------------------------------------------------------- air

const A: Record<string, FixedWingSpec & { cls: string }> = {
  'f-16c': { cls: 'multirole', length: 15.0, span: 9.96, height: 4.9, bodyWidth: 1.6, bodyHeight: 1.6, nose: 0.2, wing: { x: -1.2, span: 9.5, rootChord: 5.0, tipChord: 1.2, sweep: 40, mount: 0 }, tail: { kind: 'single', finHeight: 2.8, finChord: 3.3, tailSpan: 5.6, tailChord: 2.0 }, engines: { kind: 'internal', count: 1, diameter: 1.15 }, intakes: 'chin', canopy: { x: 3.4, length: 3.0, kind: 'bubble' } },
  'f-15c': { cls: 'fighter', length: 19.4, span: 13.05, height: 5.6, bodyWidth: 2.7, bodyHeight: 1.7, nose: 0.2, wing: { x: -2.0, span: 13.05, rootChord: 6.5, tipChord: 1.7, sweep: 45, mount: 0.7 }, tail: { kind: 'twin', finHeight: 3.1, finChord: 3.0, spacing: 2.6, tailSpan: 8.6, tailChord: 2.8 }, engines: { kind: 'internal', count: 2, diameter: 1.15 }, intakes: 'side', canopy: { x: 4.7, length: 3.6, kind: 'bubble' } },
  'f-a-18c': { cls: 'multirole', length: 17.1, span: 12.3, height: 4.7, bodyWidth: 2.0, bodyHeight: 1.6, nose: 0.2, wing: { x: -1.6, span: 11.4, rootChord: 4.6, tipChord: 1.7, sweep: 26, mount: 0.2 }, canard: undefined, tail: { kind: 'twin', finHeight: 3.0, finChord: 2.6, cant: 20, spacing: 2.0, tailSpan: 6.6, tailChord: 2.4 }, engines: { kind: 'internal', count: 2, diameter: 1.0 }, intakes: 'side', canopy: { x: 4.0, length: 3.2, kind: 'bubble' } },
  'su-27': { cls: 'fighter', length: 21.9, span: 14.7, height: 5.9, bodyWidth: 2.4, bodyHeight: 1.6, nose: 0.22, wing: { x: -2.2, span: 14.7, rootChord: 6.5, tipChord: 1.6, sweep: 42, mount: 0.2 }, tail: { kind: 'twin', finHeight: 3.4, finChord: 3.0, spacing: 4.3, tailSpan: 9.9, tailChord: 3.0 }, engines: { kind: 'internal', count: 2, diameter: 1.2 }, intakes: 'under', canopy: { x: 5.6, length: 3.4, kind: 'bubble' } },
  'mig-29a': { cls: 'fighter', length: 17.3, span: 11.4, height: 4.7, bodyWidth: 2.2, bodyHeight: 1.5, nose: 0.22, wing: { x: -1.8, span: 11.4, rootChord: 5.2, tipChord: 1.4, sweep: 42, mount: 0.2 }, tail: { kind: 'twin', finHeight: 2.8, finChord: 2.6, cant: 6, spacing: 3.8, tailSpan: 7.8, tailChord: 2.6 }, engines: { kind: 'internal', count: 2, diameter: 1.0 }, intakes: 'under', canopy: { x: 4.4, length: 3.0, kind: 'bubble' } },
  'a-10c': { cls: 'attack', length: 16.3, span: 17.5, height: 4.5, bodyWidth: 1.6, bodyHeight: 1.9, nose: 0.18, blunt: 0.5, wing: { x: -0.4, span: 17.5, rootChord: 3.0, tipChord: 2.0, sweep: 4, mount: -0.8 }, tail: { kind: 'h', finHeight: 2.4, finChord: 1.9, tailSpan: 5.7, tailChord: 1.6 }, engines: { kind: 'rear-pods', count: 2, diameter: 1.3 }, canopy: { x: 4.5, length: 2.2, kind: 'bubble' } },
  'mig-21bis': { cls: 'fighter', length: 14.5, span: 7.15, height: 4.1, bodyWidth: 1.3, bodyHeight: 1.4, nose: 0.15, blunt: 0.6, wing: { x: -1.6, span: 7.15, rootChord: 5.6, tipChord: 0.3, sweep: 57, mount: 0 }, tail: { kind: 'single', finHeight: 2.4, finChord: 3.2, tailSpan: 3.7, tailChord: 1.4 }, engines: { kind: 'internal', count: 1, diameter: 1.0 }, intakes: 'nose', canopy: { x: 3.2, length: 2.0, kind: 'framed' } },
  'mirage-2000c': { cls: 'multirole', length: 14.4, span: 9.13, height: 5.2, bodyWidth: 1.6, bodyHeight: 1.6, nose: 0.25, wing: { x: -2.0, span: 9.13, rootChord: 8.0, tipChord: 0.3, sweep: 58, mount: -0.3 }, tail: { kind: 'single', finHeight: 3.2, finChord: 3.6, tailSpan: 0, tailChord: 0 }, engines: { kind: 'internal', count: 1, diameter: 1.1 }, intakes: 'side', canopy: { x: 2.8, length: 2.6, kind: 'bubble' } },
  'eurofighter-typhoon': { cls: 'multirole', length: 15.96, span: 10.95, height: 5.3, bodyWidth: 1.7, bodyHeight: 1.7, nose: 0.22, wing: { x: -2.2, span: 10.95, rootChord: 7.0, tipChord: 0.9, sweep: 53, mount: -0.2 }, canard: { x: 3.8, span: 4.4, chord: 1.4 }, tail: { kind: 'single', finHeight: 3.3, finChord: 3.5, tailSpan: 0, tailChord: 0 }, engines: { kind: 'internal', count: 2, diameter: 0.95 }, intakes: 'chin', canopy: { x: 4.0, length: 2.8, kind: 'bubble' } },
  'su-25t': { cls: 'attack', length: 15.5, span: 14.4, height: 4.8, bodyWidth: 2.2, bodyHeight: 1.6, nose: 0.2, wing: { x: -0.8, span: 14.4, rootChord: 3.9, tipChord: 1.5, sweep: 20, mount: 0.6 }, tail: { kind: 'single', finHeight: 2.6, finChord: 2.6, tailSpan: 4.6, tailChord: 1.6 }, engines: { kind: 'internal', count: 2, diameter: 0.9 }, intakes: 'side', canopy: { x: 3.9, length: 2.0, kind: 'framed' } },
  'c-130h-hercules': { cls: 'transport', length: 29.8, span: 40.4, height: 11.6, bodyWidth: 4.3, bodyHeight: 4.6, nose: 0.12, blunt: 0.7, wing: { x: 1.0, span: 40.4, rootChord: 4.9, tipChord: 2.8, sweep: 2, mount: 1 }, tail: { kind: 'single', finHeight: 6.0, finChord: 6.0, tailSpan: 16.0, tailChord: 4.0 }, engines: { kind: 'wing-props', count: 4, diameter: 1.0, at: [0.26, 0.5] }, propeller: { diameter: 4.1, blades: 4 }, canopy: { x: 13, length: 2, kind: 'airliner' } },
  'bf-109-g6': { cls: 'ww2-fighter', length: 9.0, span: 9.9, height: 2.6, bodyWidth: 1.0, bodyHeight: 1.3, nose: 0.2, wing: { x: 0.8, span: 9.9, rootChord: 2.1, tipChord: 1.0, sweep: 6, mount: -0.8, dihedral: 6 }, tail: { kind: 'single', finHeight: 1.4, finChord: 1.2, tailSpan: 3.0, tailChord: 0.9 }, engines: { kind: 'nose-prop', count: 1 }, propeller: { diameter: 3.0, blades: 3 }, canopy: { x: 0.4, length: 1.8, kind: 'framed' } },
  'spitfire-mk-ix': { cls: 'ww2-fighter', length: 9.47, span: 11.23, height: 3.86, bodyWidth: 1.0, bodyHeight: 1.4, nose: 0.25, wing: { x: 0.9, span: 11.23, rootChord: 2.6, tipChord: 0.7, sweep: 2, mount: -0.8, dihedral: 6 }, tail: { kind: 'single', finHeight: 1.5, finChord: 1.3, tailSpan: 3.3, tailChord: 1.0 }, engines: { kind: 'nose-prop', count: 1 }, propeller: { diameter: 3.3, blades: 4 }, canopy: { x: 0.1, length: 1.6, kind: 'bubble' } },
  'p-51d-mustang': { cls: 'ww2-fighter', length: 9.83, span: 11.28, height: 4.08, bodyWidth: 1.0, bodyHeight: 1.5, nose: 0.25, wing: { x: 0.7, span: 11.28, rootChord: 2.6, tipChord: 1.2, sweep: 4, mount: -0.85, dihedral: 5 }, tail: { kind: 'single', finHeight: 1.6, finChord: 1.6, tailSpan: 4.1, tailChord: 1.1 }, engines: { kind: 'nose-prop', count: 1 }, intakes: 'under', propeller: { diameter: 3.4, blades: 4 }, canopy: { x: -0.1, length: 1.8, kind: 'bubble' } },
  'fw-190-a8': { cls: 'ww2-fighter', length: 9.0, span: 10.5, height: 3.95, bodyWidth: 1.25, bodyHeight: 1.4, nose: 0.2, blunt: 1, wing: { x: 1.0, span: 10.5, rootChord: 2.3, tipChord: 1.2, sweep: 5, mount: -0.85, dihedral: 6 }, tail: { kind: 'single', finHeight: 1.4, finChord: 1.2, tailSpan: 3.6, tailChord: 0.9 }, engines: { kind: 'nose-prop', count: 1 }, propeller: { diameter: 3.3, blades: 3 }, canopy: { x: 0.3, length: 1.7, kind: 'bubble' } },
  'ju-87-stuka': { cls: 'ww2-attack', length: 11.0, span: 13.8, height: 4.0, bodyWidth: 1.2, bodyHeight: 1.6, nose: 0.2, wing: { x: 1.3, span: 13.8, rootChord: 2.6, tipChord: 1.3, sweep: 5, mount: -0.9, gull: true, dihedral: 8 }, tail: { kind: 'single', finHeight: 1.7, finChord: 1.5, tailSpan: 4.6, tailChord: 1.2 }, engines: { kind: 'nose-prop', count: 1 }, propeller: { diameter: 3.4, blades: 3 }, canopy: { x: 0.8, length: 3.0, kind: 'framed' } },
  'b-17g': { cls: 'ww2-bomber', length: 22.7, span: 31.6, height: 5.8, bodyWidth: 2.3, bodyHeight: 2.6, nose: 0.1, blunt: 0.6, wing: { x: 2.5, span: 31.6, rootChord: 5.6, tipChord: 2.0, sweep: 6, mount: -0.2, dihedral: 4 }, tail: { kind: 'single', finHeight: 4.0, finChord: 5.0, tailSpan: 13.0, tailChord: 3.0 }, engines: { kind: 'wing-props', count: 4, diameter: 1.35, at: [0.24, 0.48] }, propeller: { diameter: 3.5, blades: 3 }, canopy: { x: 9.5, length: 1.6, kind: 'glass-nose' } },
  'sopwith-camel': { cls: 'biplane', length: 5.7, span: 8.5, height: 2.6, bodyWidth: 0.9, bodyHeight: 1.0, nose: 0.15, blunt: 1, wing: { x: 1.0, span: 8.2, rootChord: 1.4, tipChord: 1.4, sweep: 0, mount: -1, dihedral: 5 }, upperWing: { x: 1.2, span: 8.5, rootChord: 1.4, tipChord: 1.4, sweep: 0, mount: 1, dihedral: 0 }, tail: { kind: 'single', finHeight: 0.9, finChord: 0.9, tailSpan: 2.6, tailChord: 0.8 }, engines: { kind: 'nose-prop', count: 1 }, propeller: { diameter: 2.6, blades: 2 } },
};

const H: Record<string, HeliSpec & { cls: string }> = {
  'ah-64d-apache': { cls: 'heli-attack', length: 15.5, rotor: 14.6, height: 3.9, bodyWidth: 1.3, bodyHeight: 1.6, cabin: 'tandem', blades: 4, stubs: { span: 5.0, pylons: 2 }, mastDome: true, sideEngines: true },
  'mi-24p-hind': { cls: 'heli-attack', length: 17.5, rotor: 17.3, height: 6.5, bodyWidth: 1.7, bodyHeight: 2.0, cabin: 'tandem', blades: 5, stubs: { span: 6.6, pylons: 3 }, sideEngines: true },
  'ka-50': { cls: 'heli-attack', length: 13.5, rotor: 14.5, height: 4.9, bodyWidth: 1.4, bodyHeight: 1.8, cabin: 'boxy', rotors: 'coaxial', blades: 3, tailRotor: 'none', stubs: { span: 7.3, pylons: 2 } },
  'uh-1h-huey': { cls: 'heli-transport', length: 12.7, rotor: 14.6, height: 4.4, bodyWidth: 2.6, bodyHeight: 2.2, cabin: 'cabin', blades: 2, skids: true },
  'uh-60a-black-hawk': { cls: 'heli-transport', length: 15.3, rotor: 16.4, height: 5.1, bodyWidth: 2.4, bodyHeight: 2.3, cabin: 'cabin', blades: 4 },
  'ch-47-chinook': { cls: 'heli-transport', length: 15.8, rotor: 18.3, height: 5.7, bodyWidth: 3.8, bodyHeight: 3.6, cabin: 'boxy', rotors: 'tandem', blades: 3, tailRotor: 'none' },
  'mi-8mtv2': { cls: 'heli-transport', length: 18.2, rotor: 21.3, height: 5.7, bodyWidth: 2.5, bodyHeight: 2.8, cabin: 'cabin', blades: 5 },
  'sa-342-gazelle': { cls: 'heli-scout', length: 9.5, rotor: 10.5, height: 3.2, bodyWidth: 1.8, bodyHeight: 1.7, cabin: 'bubble', blades: 3, tailRotor: 'fenestron', skids: true },
};

const M: Record<string, MissileFigureSpec & { cls: string }> = {
  'aim-9m': { cls: 'aam', length: 2.87, diameter: 0.127, nose: 'blunt', fins: [{ at: 0.12, span: 0.38, chord: 0.16 }, { at: 0.8, span: 0.64, chord: 0.5 }] },
  'aim-120c': { cls: 'aam', length: 3.66, diameter: 0.178, nose: 'ogive', fins: [{ at: 0.42, span: 0.45, chord: 0.3 }, { at: 0.86, span: 0.45, chord: 0.35 }] },
  'aim-7m': { cls: 'aam', length: 3.66, diameter: 0.203, nose: 'ogive', fins: [{ at: 0.32, span: 1.0, chord: 0.6 }, { at: 0.86, span: 0.8, chord: 0.4 }] },
  'r-73': { cls: 'aam', length: 2.9, diameter: 0.17, nose: 'blunt', fins: [{ at: 0.08, span: 0.35, chord: 0.12 }, { at: 0.16, span: 0.5, chord: 0.12, x: true }, { at: 0.82, span: 0.51, chord: 0.45 }] },
  'r-27r': { cls: 'aam', length: 4.0, diameter: 0.23, nose: 'ogive', fins: [{ at: 0.35, span: 0.8, chord: 0.7 }, { at: 0.86, span: 0.8, chord: 0.35 }] },
  'agm-65d': { cls: 'agm', length: 2.49, diameter: 0.305, nose: 'blunt', fins: [{ at: 0.55, span: 0.72, chord: 0.85 }] },
  'agm-114-hellfire': { cls: 'agm', length: 1.63, diameter: 0.178, nose: 'round', fins: [{ at: 0.25, span: 0.33, chord: 0.12 }, { at: 0.85, span: 0.33, chord: 0.2 }] },
  'mk-82': { cls: 'bomb', length: 2.2, diameter: 0.273, nose: 'round', bulge: 1, fins: [{ at: 0.82, span: 0.38, chord: 0.38, x: true }] },
  'bgm-109-tomahawk': { cls: 'cruise-missile', length: 5.56, diameter: 0.52, nose: 'round', fins: [{ at: 0.93, span: 0.9, chord: 0.35, x: true }], wings: { span: 2.67, chord: 0.38, at: 0.42 } },
};

const N: Record<string, NavalSpec & { cls: string }> = {
  'arleigh-burke': { cls: 'destroyer', length: 155, beam: 20, freeboard: 7, superstructure: [{ x: 18, length: 30, width: 15, height: 12 }, { x: -12, length: 22, width: 12, height: 7 }], turrets: [{ x: 58, size: 6, barrels: 1, length: 9, calibre: 0.127 }], funnels: [{ x: 0, height: 9, diameter: 4 }, { x: -22, height: 8, diameter: 4 }], masts: [{ x: 15, height: 30 }], launchers: [{ x: 42, length: 14, width: 8 }, { x: -48, length: 12, width: 8 }] },
  'nimitz-carrier': { cls: 'carrier', length: 333, beam: 41, freeboard: 18, hull: 'carrier', superstructure: [{ x: -20, length: 40, width: 12, height: 22 }], masts: [{ x: -20, height: 45 }] },
  'kilo-submarine': { cls: 'submarine', length: 73, beam: 9.9, freeboard: 0, hull: 'submarine', sail: { x: 8, length: 12, height: 7 } },
  'bismarck-battleship': { cls: 'battleship', length: 251, beam: 36, freeboard: 9, superstructure: [{ x: 15, length: 45, width: 20, height: 14 }], turrets: [{ x: 85, size: 14, barrels: 2, length: 20, calibre: 0.38 }, { x: 62, size: 14, barrels: 2, length: 20, calibre: 0.38, up: 4 }, { x: -50, size: 14, barrels: 2, length: 20, calibre: 0.38, back: true, up: 4 }, { x: -74, size: 14, barrels: 2, length: 20, calibre: 0.38, back: true }], funnels: [{ x: 0, height: 14, diameter: 9 }], masts: [{ x: 25, height: 35 }, { x: -30, height: 25 }] },
  rhib: { cls: 'rhib', length: 11, beam: 3.4, freeboard: 1.0, hull: 'rhib', superstructure: [{ x: 0, length: 1.8, width: 1.2, height: 1.3 }] },
  'lcvp-landing-craft': { cls: 'landing-craft', length: 11, beam: 3.2, freeboard: 1.8, hull: 'landing' },
  'patrol-boat': { cls: 'patrol-boat', length: 25, beam: 5.5, freeboard: 2.2, hull: 'boat', superstructure: [{ x: 1, length: 7, width: 4, height: 3 }], turrets: [{ x: 8, size: 1.6, barrels: 1, length: 2.5, calibre: 0.03 }], masts: [{ x: 0, height: 7 }] },
  'lcac-hovercraft': { cls: 'hovercraft', length: 26.4, beam: 14.3, freeboard: 2.5, hull: 'hover' },
};

const MARKERS: Record<string, { kind: MarkerKind; radius?: number; height?: number }> = {
  'cs2-smoke': { kind: 'smoke', radius: 3.6, height: 3.4 },
  'cs2-flash': { kind: 'flash', radius: 2 },
  'cs2-molotov': { kind: 'fire', radius: 3 },
  'cs2-he': { kind: 'blast', radius: 8.9 },
  'cs2-decoy': { kind: 'decoy', radius: 1 },
  'cs2-bomb': { kind: 'bomb', radius: 1.5 },
  'ability-wall': { kind: 'wall', radius: 12, height: 4 },
  'ability-recon': { kind: 'recon', radius: 9 },
  'ability-trap': { kind: 'trap', radius: 2.5 },
  'ability-heal': { kind: 'heal', radius: 3 },
  'objective-flag': { kind: 'flag', radius: 12 },
  spawn: { kind: 'spawn', radius: 4 },
  'forward-base': { kind: 'base', radius: 150 },
  'rally-point': { kind: 'rally', radius: 10 },
  waypoint: { kind: 'waypoint' },
};

// The named sets in ./specs, merged over the starter set.
for (const set of SPEC_SETS) {
  Object.assign(G, set.ground ?? {});
  Object.assign(A, set.air ?? {});
  Object.assign(H, set.heli ?? {});
  Object.assign(M, set.missile ?? {});
  Object.assign(N, set.naval ?? {});
}

/** Names in data (lower case) mapped to catalogue entries, from every spec set. */
export const ALIASES: Record<string, string> = Object.assign({}, ...SPEC_SETS.map((s) => s.aliases ?? {}));

export const CATALOG: Record<string, FigureEntry> = {
  soldier: { domain: 'person', cls: 'soldier', build: () => buildPerson({ carry: 'rifle' }) },
  'soldier-crouch': { domain: 'person', cls: 'soldier', build: () => buildPerson({ carry: 'rifle', stance: 'crouch' }) },
  'soldier-prone': { domain: 'person', cls: 'soldier', build: () => buildPerson({ carry: 'rifle', stance: 'prone' }) },
  sniper: { domain: 'person', cls: 'sniper', build: () => buildPerson({ carry: 'sniper' }) },
  'anti-tank': { domain: 'person', cls: 'anti-tank', build: () => buildPerson({ carry: 'launcher' }) },
  medic: { domain: 'person', cls: 'medic', build: () => buildPerson({ carry: 'medic' }) },
  crew: { domain: 'person', cls: 'crew', build: () => buildPerson({ carry: 'crew' }) },
  ...Object.fromEntries(Object.entries(G).map(([n, s]) => [n, { domain: 'ground' as const, cls: s.cls, build: () => buildGround(s) }])),
  ...Object.fromEntries(Object.entries(A).map(([n, s]) => [n, { domain: 'air' as const, cls: s.cls, build: () => buildFixedWing(s) }])),
  ...Object.fromEntries(Object.entries(H).map(([n, s]) => [n, { domain: 'heli' as const, cls: s.cls, build: () => buildHeli(s) }])),
  ...Object.fromEntries(Object.entries(M).map(([n, s]) => [n, { domain: 'missile' as const, cls: s.cls, build: () => buildMissile(s) }])),
  ...Object.fromEntries(Object.entries(N).map(([n, s]) => [n, { domain: 'sea' as const, cls: s.cls, build: () => buildNaval(s) }])),
  ...Object.fromEntries(Object.entries(MARKERS).map(([n, s]) => [n, { domain: 'marker' as const, cls: s.kind, build: () => buildMarker(s) }])),
  ...Object.assign({}, ...SPEC_SETS.map((s) => s.figures ?? {})),
};

/** Every figure's builder by name: what the contact sheet and the tests walk. */
export const FIGURES: Record<string, () => Template> = Object.fromEntries(Object.entries(CATALOG).map(([n, e]) => [n, e.build]));
