/**
 * Ships and boats by class, drawn from their own outlines: the hull from its
 * deck line (sheer, forecastle, quarterdeck) and its half-beam plan, the
 * superstructure, bridges, stacks and sails as bodies of their own, and on
 * them the builder's turrets, launchers, funnels, masts and radars where the
 * class has them.
 *
 * Length and beam are published values; deck heights, the blocks' sizes and
 * places are judged from the general shape of the real ship (estimates, not
 * traced from any drawing or game model). Coordinates: forward from the
 * ship's middle, out from the centre line, up from the waterline; metres.
 */

import type { Named, SpecSet } from './index';
import type { NavalSpec } from '../naval';
import type { Outline, P2 } from '../parts';

const N: Named<NavalSpec> = {};

/** A hull from its stations, bow to stern: forward position, deck height, half-beam. */
function hullOf(rows: [number, number, number][], round = 8): Outline {
  return { top: rows.map(([x, d]) => [x, d] as P2), bottom: rows.map(([x]) => [x, 0] as P2), plan: rows.map(([x, , w]) => [x, w] as P2), round, stations: 30 };
}

/** A block from x0 (front) back to x1, from z0 up to z1, `half` wide each side; its front raked back over `rake`, its back over `aft`. */
function blockOf(x0: number, x1: number, z0: number, z1: number, half: number, rake = 0, aft = 0, side?: number): Outline {
  const top: P2[] = [];
  if (rake > 0) top.push([x0, z0 + 0.05], [x0 - rake, z1]);
  else top.push([x0, z1]);
  if (aft > 0) top.push([x1 + aft, z1], [x1, z0 + 0.05]);
  else top.push([x1, z1]);
  return { top, bottom: [[x0, z0], [x1, z0]], plan: [[x0, half], [x1, half]], side, round: 10, stations: 4 };
}

// ---------------------------------------------------------------- modern warships

// Arleigh Burke (Flight IIA): a flared, sheered flush-deck hull; the tall forward deckhouse with its four SPY-1 faces
// and raked bridge; two square stacks; the aft deckhouse with the twin hangars; the raked mast; the 5-inch gun and
// the VLS fore and aft (155.3 x 20.1 m).
N['arleigh-burke'] = {
  cls: 'destroyer', length: 155.3, beam: 20.1, freeboard: 7.2,
  hullOutline: hullOf([[77.65, 9.5, 0.2], [70, 9.0, 3.5], [55, 8.3, 7.8], [35, 7.6, 9.8], [0, 7.2, 10.05], [-45, 6.8, 9.8], [-70, 6.4, 8.6], [-77.65, 6.3, 7.4]]),
  bodies: [blockOf(36, 4, 7.0, 15.5, 7.0, 3.5), blockOf(31, 15, 15.5, 19.5, 5.2, 2), blockOf(6, -1, 14, 21, 2.6, 0, 1.2), blockOf(-13, -20, 13, 19.5, 2.6, 0, 1.2), blockOf(-6, -48, 6.8, 14.5, 7.0, 1.5)],
  turrets: [{ x: 58, size: 4.5, barrels: 1, length: 7, calibre: 0.127, kind: 'mount' }],
  masts: [{ x: 13, height: 26 }],
  launchers: [{ x: 46, length: 13, width: 8 }, { x: -56, length: 10, width: 8 }],
  radars: [{ x: 24, up: 9, kind: 'faces', size: 4 }],
  helideck: true,
};

// ---------------------------------------------------------------- Second World War

// Fletcher: a long flush-deck destroyer with sheer forward, the bridge, two raked funnels, five single 5-inch mounts
// (two forward, the third on the aft deckhouse, two aft) (114.8 x 12.0 m).
N['fletcher'] = {
  cls: 'destroyer', length: 114.8, beam: 12.0, freeboard: 5.3,
  hullOutline: hullOf([[57.4, 7.6, 0.15], [50, 7.0, 2.6], [35, 6.0, 5.4], [10, 5.3, 6.0], [-30, 5.0, 5.8], [-50, 4.9, 4.8], [-57.4, 5.0, 3.8]]),
  bodies: [blockOf(31, 21, 5.6, 12.5, 3.6, 1.5), blockOf(28, 23, 12.5, 14.3, 2.4), blockOf(-19, -30, 5.0, 8.0, 3.0)],
  funnels: [{ x: 11, height: 8.5, diameter: 3.0 }, { x: -3, height: 8.0, diameter: 3.0 }],
  masts: [{ x: 20, height: 18 }],
  turrets: [{ x: 41, size: 3.2, barrels: 1, length: 6.4, calibre: 0.127 }, { x: 34, size: 3.2, barrels: 1, length: 6.4, calibre: 0.127, up: 2.2 }, { x: -24, size: 3.2, barrels: 1, length: 6.4, calibre: 0.127, up: 2.7, back: true }, { x: -36, size: 3.2, barrels: 1, length: 6.4, calibre: 0.127, back: true }, { x: -47, size: 3.2, barrels: 1, length: 6.4, calibre: 0.127, back: true }],
  launchers: [{ x: 2, length: 6, width: 2.4, kind: 'tubes', count: 1, elevation: 0 }, { x: -12, length: 6, width: 2.4, kind: 'tubes', count: 1, elevation: 0 }],
};

// Bismarck: the Atlantic bow with its sheer, four twin 38 cm turrets (Anton and Bruno forward, Caesar and Dora aft),
// the tall forward tower, the single big funnel, the aft superstructure, six twin 15 cm turrets on the sides
// (251 x 36 m).
N['bismarck-battleship'] = {
  cls: 'battleship', length: 251, beam: 36, freeboard: 10,
  hullOutline: hullOf([[125.5, 15.5, 0.3], [115, 14.0, 6.5], [95, 12.0, 14.5], [70, 10.5, 17.5], [0, 10.0, 18], [-70, 9.8, 17.5], [-105, 9.6, 13.5], [-125.5, 9.6, 8.0]]),
  bodies: [blockOf(42, 16, 10, 22, 8, 2), blockOf(38, 22, 22, 32, 5, 2), blockOf(33, 26, 32, 39, 3), blockOf(-12, -42, 10, 21, 7.5, 0, 2), blockOf(-18, -30, 21, 27, 3.5)],
  funnels: [{ x: 4, height: 16, diameter: 10 }],
  masts: [{ x: 29, height: 40 }, { x: -24, height: 30 }],
  turrets: [
    { x: 82, size: 14, barrels: 2, length: 20, calibre: 0.38, kind: 'box' }, { x: 64, size: 14, barrels: 2, length: 20, calibre: 0.38, up: 4, kind: 'box' },
    { x: -54, size: 14, barrels: 2, length: 20, calibre: 0.38, up: 4, back: true, kind: 'box' }, { x: -72, size: 14, barrels: 2, length: 20, calibre: 0.38, back: true, kind: 'box' },
    ...[30, 12, -6].flatMap((x) => [-1, 1].map((s) => ({ x, size: 6, barrels: 2, length: 8, calibre: 0.15, up: 3, side: s * 11, kind: 'box' as const, back: x < 0 }))),
  ],
};

// Yamato: the long sheered hull with its dip amidships, three triple 46 cm turrets (two forward, one aft), the
// stepped tower bridge, the strongly raked funnel, triple 15.5 cm turrets fore and aft of the superstructure (263 x 38.9 m).
N['yamato'] = {
  cls: 'battleship', length: 263, beam: 38.9, freeboard: 10,
  hullOutline: hullOf([[131.5, 17.0, 0.3], [115, 14.5, 8.5], [95, 12.0, 16.5], [60, 10.5, 19.4], [0, 10.0, 19.45], [-60, 9.5, 19.0], [-100, 8.6, 15.0], [-131.5, 8.6, 9.0]]),
  bodies: [blockOf(32, 6, 10, 24, 9.5), blockOf(28, 12, 24, 36, 5.5, 2), blockOf(24, 15, 36, 44, 3.2), blockOf(-16, -40, 10, 18, 7)],
  funnels: [{ x: -2, height: 17, diameter: 11 }],
  masts: [{ x: -24, height: 28 }],
  turrets: [
    { x: 70, size: 15, barrels: 3, length: 21, calibre: 0.46, kind: 'box' }, { x: 51, size: 15, barrels: 3, length: 21, calibre: 0.46, up: 4, kind: 'box' },
    { x: -62, size: 15, barrels: 3, length: 21, calibre: 0.46, back: true, kind: 'box' },
    { x: 36, size: 8, barrels: 3, length: 10, calibre: 0.155, up: 9, kind: 'box' }, { x: -44, size: 8, barrels: 3, length: 10, calibre: 0.155, up: 4, back: true, kind: 'box' },
  ],
};

// ---------------------------------------------------------------- submarines

// Kilo: a blunt teardrop hull awash, the long low sail well forward, the cruciform stern planes (73.8 x 9.9 m).
N['kilo-submarine'] = {
  cls: 'submarine', length: 73.8, beam: 9.9, freeboard: 0, hull: 'submarine',
  hullOutline: { top: [[36.9, 0], [35.5, 2.5], [30, 3.6], [10, 4.0], [-15, 3.8], [-30, 2.2], [-36.9, 0.2]], bottom: [[36.9, 0], [35.5, -2.5], [30, -4.4], [0, -4.95], [-20, -4.0], [-36.9, -0.2]], plan: [[36.9, 0.1], [35.5, 2.7], [30, 4.3], [5, 4.95], [-15, 4.2], [-36.9, 0.15]], round: 2.2, stations: 24 },
  bodies: [
    { top: [[14.5, 4.2], [13.5, 8.6], [5.5, 9.2], [4.0, 4.0]], bottom: [[14.5, 3.8], [4.0, 3.8]], plan: [[14.5, 0.3], [12.5, 1.4], [6, 1.3], [4.0, 0.3]], round: 3, stations: 8 },
    { top: [[-31, 0.15], [-35.5, 0.15]], bottom: [[-31, -0.15], [-35.5, -0.15]], plan: [[-31, 1.5], [-33, 3.8], [-35.5, 3.8]], round: 4, stations: 4 },
    { top: [[-31, 0.5], [-33, 4.6], [-35.5, 4.6]], bottom: [[-31, -0.5], [-33, -4.4], [-35.5, -4.4]], plan: [[-31, 0.15], [-35.5, 0.15]], round: 4, stations: 4 },
  ],
};

// Type VIIC: the narrow pressure hull under its flat casing deck, the conning tower with the "Wintergarten" aft,
// the 88 mm deck gun forward of it, the bow planes (67.1 x 6.2 m).
N['type-viic'] = {
  cls: 'submarine', length: 67.1, beam: 6.2, freeboard: 2.6, hull: 'submarine',
  hullOutline: { top: [[33.55, 1.0], [30, 2.4], [20, 2.6], [-20, 2.5], [-30, 2.0], [-33.55, 1.2]], bottom: [[33.55, 0.6], [30, -1.5], [10, -3.0], [-20, -2.8], [-33.55, 0.2]], plan: [[33.55, 0.1], [28, 1.8], [10, 3.1], [-15, 3.0], [-33.55, 0.2]], round: 3, stations: 24 },
  bodies: [
    { top: [[4.5, 2.6], [3.5, 6.2], [-3.0, 6.0], [-5.0, 3.6], [-6.5, 3.6], [-7.0, 2.6]], bottom: [[4.5, 2.4], [-7.0, 2.4]], plan: [[4.5, 0.4], [3.0, 1.0], [-3.0, 1.1], [-7.0, 0.5]], round: 3, stations: 10 },
    { top: [[29, 0.6], [27, 0.6]], bottom: [[29, 0.45], [27, 0.45]], plan: [[29, 3.4], [27, 3.6]], round: 4, stations: 2 },
  ],
  turrets: [{ x: 10, size: 1.2, barrels: 1, length: 3.5, calibre: 0.088, kind: 'mount' }],
};

export const SHIP_CLASSES: SpecSet = { naval: N };
