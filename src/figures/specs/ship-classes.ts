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
import { defaultHull, type NavalSpec, type NavalTurret } from '../naval';
import { lerpPoly, type Outline, type P2 } from '../parts';

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


// ---------------------------------------------------------------- a class from its layout

interface ShipO {
  cls: string;
  /** Length, beam, the main (or forecastle) deck's height, its rise to the bow. */
  L: number;
  B: number;
  fb: number;
  sheer?: number;
  /** A forecastle ending at this x, the deck stepping down this much aft of it. */
  fc?: [number, number];
  transom?: number;
  /**
   * The guns, one mount per word: x[,side]:barrels/calibre(mm)[^raised][b][m] - side mirrors it to both beams,
   * ^ raises it above the deck there (superfiring), b faces aft, m is a modern faceted mount.
   */
  guns?: string;
  /** Funnels: x, height above the deck, diameter. */
  funnels?: [number, number, number][];
  /** Superstructure blocks: front x, back x, top above the waterline, half-width, the front's rake. */
  blocks?: [number, number, number, number, number?][];
  /** Masts: x, height above the deck. */
  masts?: [number, number][];
  launchers?: NavalSpec['launchers'];
  radars?: NavalSpec['radars'];
  helideck?: boolean;
}

function ship(o: ShipO): NavalSpec & { cls: string } {
  const base: NavalSpec = { length: o.L, beam: o.B, freeboard: o.fb, sheer: o.sheer, forecastle: o.fc ? { x: o.fc[0], step: o.fc[1] } : undefined, transom: o.transom };
  const hull = defaultHull(base);
  const deck = (x: number) => lerpPoly(hull.top, x);
  const turrets: NavalTurret[] = [];
  for (const tok of (o.guns ?? '').split(/\s+/).filter(Boolean)) {
    const m = tok.match(/^(-?[\d.]+)(?:,([\d.]+))?:(\d)\/(\d+)(?:\^(-?[\d.]+))?([bm]*)$/);
    if (!m) throw new Error(`bad gun ${tok}`);
    const x = +m[1];
    const n = +m[3];
    const cal = +m[4] / 1000;
    const size = cal < 0.14 ? 2.4 + 0.5 * n : 3 + cal * 22 + (n - 1) * cal * 3;
    const t: NavalTurret = { x, size, barrels: n, length: cal * 50, calibre: cal, up: deck(x) - o.fb + (m[5] ? +m[5] : 0), back: m[6].includes('b'), kind: m[6].includes('m') ? 'mount' : cal >= 0.2 ? 'box' : 'round' };
    if (m[2]) for (const sd of [-1, 1]) turrets.push({ ...t, side: sd * +m[2] });
    else turrets.push(t);
  }
  return {
    cls: o.cls, ...base,
    bodies: (o.blocks ?? []).map(([x0, x1, z1, half, rake]) => blockOf(x0, x1, Math.min(deck(x0), deck(x1)) - 0.2, z1, half, rake ?? 0)),
    funnels: (o.funnels ?? []).map(([x, h, d]) => ({ x, height: h + deck(x) - o.fb, diameter: d })),
    masts: (o.masts ?? []).map(([x, h]) => ({ x, height: h })),
    turrets, launchers: o.launchers, radars: o.radars, helideck: o.helideck,
  };
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

// ---------------------------------------------------------------- battleships and battlecruisers by class
// Layouts (turrets fore, amidships, aft; superfiring; wing turrets), funnels, towers and masts by class; main
// dimensions published, heights and places estimates.

const S: Record<string, Parameters<typeof ship>[0]> = {
  // United States.
  'delaware': { cls: 'battleship', L: 158.2, B: 26.0, fb: 8, guns: '55:2/305 43:2/305^2.5 -25:2/305b -42:2/305^2.5b -58:2/305b', funnels: [[8, 14, 5], [-6, 14, 5]], blocks: [[36, 26, 17, 6, 1]], masts: [[30, 30], [-14, 30]] },
  'wyoming': { cls: 'battleship', L: 171.3, B: 28.4, fb: 8, guns: '62:2/305 50:2/305^2.5 -6:2/305^2.5b -22:2/305b -48:2/305^2.5b -62:2/305b', funnels: [[8, 14, 6]], blocks: [[40, 28, 22, 6, 1]], masts: [[32, 32], [-10, 26]] },
  'new-york': { cls: 'battleship', L: 174.7, B: 29.1, fb: 8, guns: '60:2/356 47:2/356^2.5 -10:2/356b -42:2/356^2.5b -56:2/356b', funnels: [[6, 14, 6]], blocks: [[38, 26, 22, 6, 1]], masts: [[30, 34], [-20, 28]] },
  'nevada': { cls: 'battleship', L: 177.7, B: 32.9, fb: 8, guns: '62:3/356 50:2/356^2.5 -48:2/356^2.5b -62:3/356b', funnels: [[2, 14, 6]], blocks: [[36, 24, 24, 6, 1]], masts: [[30, 34], [-18, 28]] },
  'pennsylvania': { cls: 'battleship', L: 185.4, B: 32.4, fb: 8, guns: '64:3/356 51:3/356^2.5 -52:3/356^2.5b -65:3/356b', funnels: [[4, 14, 6]], blocks: [[38, 24, 24, 6, 1], [-14, -24, 18, 5]], masts: [[30, 36], [-16, 30]] },
  'tennessee': { cls: 'battleship', L: 190.3, B: 34.8, fb: 8, guns: '64:3/356 51:3/356^2.5 -52:3/356^2.5b -65:3/356b 20,13:2/127^3 2,13:2/127^3', funnels: [[0, 14, 7]], blocks: [[36, 14, 24, 8, 1], [34, 22, 32, 4]], masts: [[26, 36]] },
  'new-mexico': { cls: 'battleship', L: 190.2, B: 32.4, fb: 8, guns: '64:3/356 51:3/356^2.5 -52:3/356^2.5b -65:3/356b', funnels: [[2, 14, 6]], blocks: [[40, 22, 30, 6, 1]], masts: [[-18, 26]] },
  'colorado': { cls: 'battleship', L: 190.2, B: 29.7, fb: 8, guns: '64:2/406 51:2/406^2.5 -52:2/406^2.5b -65:2/406b', funnels: [[6, 14, 6]], blocks: [[38, 24, 22, 6, 1]], masts: [[30, 36], [-14, 32]] },
  'north-carolina': { cls: 'battleship', L: 222.1, B: 33.0, fb: 9, sheer: 4, guns: '62:3/406 46:3/406^3 -55:3/406b 18,12:2/127^3 2,12:2/127^3 -14,12:2/127^3b', funnels: [[6, 12, 7], [-10, 12, 7]], blocks: [[34, 12, 28, 8, 2], [30, 18, 38, 3.5]], masts: [[-4, 30]] },
  'south-dakota': { cls: 'battleship', L: 207.3, B: 33.0, fb: 9, sheer: 4, guns: '56:3/406 41:3/406^3 -52:3/406b 16,12:2/127^3 2,12:2/127^3 -12,12:2/127^3b', funnels: [[4, 13, 9]], blocks: [[30, 8, 28, 9, 2], [26, 16, 38, 3.5]], masts: [[-6, 26]] },
  'iowa': { cls: 'battleship', L: 270.4, B: 33.0, fb: 9, sheer: 6, guns: '78:3/406 61:3/406^3 -72:3/406b 26,12:2/127^3 10,12:2/127^3 -8,12:2/127^3b', funnels: [[8, 12, 7], [-14, 12, 7]], blocks: [[44, 18, 30, 8, 2], [38, 26, 40, 3.5], [-20, -36, 18, 5]], masts: [[0, 32]] },
  'alaska': { cls: 'battlecruiser', L: 246.4, B: 27.8, fb: 9, sheer: 5, guns: '70:3/305 55:3/305^3 -64:3/305b 24,10:2/127^3 -24,10:2/127^3b', funnels: [[0, 12, 7]], blocks: [[36, 14, 26, 7, 2], [32, 20, 34, 3]], masts: [[-8, 28]] },
  // Germany.
  'nassau': { cls: 'battleship', L: 146.1, B: 26.9, fb: 8, guns: '52:2/280 -52:2/280b 20,8:2/280 -12,8:2/280b', funnels: [[8, 14, 5], [-4, 14, 5]], blocks: [[36, 26, 18, 5, 1]], masts: [[30, 24], [-24, 22]] },
  'helgoland': { cls: 'battleship', L: 167.2, B: 28.5, fb: 8, guns: '60:2/305 -60:2/305b 22,9:2/305 -14,9:2/305b', funnels: [[12, 14, 5], [2, 14, 5], [-8, 14, 5]], blocks: [[40, 30, 18, 5, 1]], masts: [[34, 26], [-28, 22]] },
  'kaiser': { cls: 'battleship', L: 172.4, B: 29.0, fb: 8, guns: '60:2/305 8,8:2/305 -44:2/305^2.5b -60:2/305b', funnels: [[18, 14, 5], [6, 14, 5]], blocks: [[42, 30, 18, 5, 1]], masts: [[34, 26], [-20, 22]] },
  'konig': { cls: 'battleship', L: 175.4, B: 29.5, fb: 8, guns: '62:2/305 50:2/305^2.5 0:2/305 -46:2/305^2.5b -60:2/305b', funnels: [[18, 14, 5], [8, 14, 5]], blocks: [[40, 30, 18, 5, 1]], masts: [[34, 26], [-22, 22]] },
  'von-der-tann': { cls: 'battlecruiser', L: 171.7, B: 26.6, fb: 8, guns: '60:2/280 -58:2/280b 12,8:2/280', funnels: [[16, 13, 5], [-4, 13, 5]], blocks: [[40, 30, 16, 5, 1]], masts: [[34, 24], [-20, 22]] },
  'derfflinger': { cls: 'battlecruiser', L: 210.4, B: 29.0, fb: 8, sheer: 4, guns: '75:2/305 63:2/305^2.5 -52:2/305^2.5b -66:2/305b', funnels: [[22, 14, 6], [4, 14, 6]], blocks: [[46, 34, 18, 5, 1]], masts: [[40, 26], [-10, 24]] },
  'mackensen': { cls: 'battlecruiser', L: 223.0, B: 30.4, fb: 8, sheer: 4, guns: '80:2/350 67:2/350^2.5 -58:2/350^2.5b -72:2/350b', funnels: [[22, 14, 6], [4, 14, 6]], blocks: [[50, 36, 20, 6, 1]], masts: [[44, 28], [-14, 24]] },
  'ersatz-yorck': { cls: 'battlecruiser', L: 227.8, B: 30.4, fb: 8, sheer: 4, guns: '80:2/380 67:2/380^2.5 -60:2/380^2.5b -74:2/380b', funnels: [[10, 15, 8]], blocks: [[48, 34, 22, 6, 1]], masts: [[42, 28], [-14, 24]] },
  'bayern': { cls: 'battleship', L: 180.0, B: 30.0, fb: 8, guns: '63:2/380 51:2/380^2.5 -50:2/380^2.5b -63:2/380b', funnels: [[12, 14, 6], [2, 14, 6]], blocks: [[38, 26, 20, 6, 1]], masts: [[32, 30], [-18, 22]] },
  'scharnhorst': { cls: 'battleship', L: 235.0, B: 30.0, fb: 9, sheer: 6, guns: '76:3/283 60:3/283^3 -66:3/283b 28,10:2/150^3 12,10:2/150^3 -30,10:1/150^3b', funnels: [[4, 14, 8]], blocks: [[44, 16, 30, 7, 2], [38, 26, 40, 3]], masts: [[-8, 28]] },
  'gneisenau-380': { cls: 'battleship', L: 235.0, B: 30.0, fb: 9, sheer: 6, guns: '76:2/380 60:2/380^3 -66:2/380b 28,10:2/150^3 12,10:2/150^3 -30,10:1/150^3b', funnels: [[4, 14, 8]], blocks: [[44, 16, 30, 7, 2], [38, 26, 40, 3]], masts: [[-8, 28]] },
  // Russia and the Soviet Union.
  'gangut': { cls: 'battleship', L: 181.2, B: 26.9, fb: 7, sheer: 3, guns: '60:3/305 20:3/305 -22:3/305b -62:3/305b', funnels: [[38, 14, 5], [0, 14, 5]], blocks: [[50, 40, 24, 5, 1]], masts: [[44, 28], [-44, 22]] },
  'imperatritsa-mariya': { cls: 'battleship', L: 168.0, B: 27.4, fb: 7, guns: '58:3/305 18:3/305 -20:3/305b -58:3/305b', funnels: [[34, 14, 5], [-2, 14, 5]], blocks: [[46, 36, 22, 5, 1]], masts: [[40, 26], [-38, 22]] },
  'izmail': { cls: 'battlecruiser', L: 223.9, B: 30.5, fb: 8, guns: '75:3/356 25:3/356 -28:3/356b -76:3/356b', funnels: [[48, 14, 5], [4, 14, 5], [-12, 14, 5]], blocks: [[60, 50, 22, 5, 1]], masts: [[55, 28], [-50, 24]] },
  'cavour-1933': { cls: 'battleship', L: 186.4, B: 28.0, fb: 8, sheer: 3, guns: '62:3/320 50:2/320^2.5 -50:2/320^2.5b -62:3/320b', funnels: [[14, 12, 6], [-2, 12, 6]], blocks: [[36, 24, 26, 6, 2], [32, 26, 32, 3]], masts: [[-14, 24]] },
  'doria-1940': { cls: 'battleship', L: 186.9, B: 28.0, fb: 8, sheer: 3, guns: '62:3/320 50:2/320^2.5 -50:2/320^2.5b -62:3/320b', funnels: [[12, 12, 6], [-4, 12, 6]], blocks: [[38, 22, 28, 7, 2], [34, 26, 34, 3]], masts: [[-16, 22]] },
  'kronshtadt': { cls: 'battlecruiser', L: 250.5, B: 31.6, fb: 9, sheer: 5, guns: '78:3/305 62:3/305^3 -70:3/305b', funnels: [[2, 14, 8]], blocks: [[44, 18, 30, 7, 2], [38, 24, 38, 3]], masts: [[-14, 28]] },
  'stalingrad': { cls: 'battlecruiser', L: 273.5, B: 32.0, fb: 9, sheer: 6, guns: '86:3/305 69:3/305^3 -78:3/305b', funnels: [[0, 14, 8]], blocks: [[48, 20, 30, 7, 2], [42, 26, 38, 3]], masts: [[-16, 28]] },
  'sovetsky-soyuz': { cls: 'battleship', L: 269.4, B: 38.9, fb: 10, sheer: 6, guns: '82:3/406 65:3/406^3 -76:3/406b 30,13:2/152^4 -30,13:2/152^4b', funnels: [[0, 15, 10]], blocks: [[44, 18, 32, 9, 2], [38, 24, 42, 4]], masts: [[-18, 28]] },
  'royal-sovereign': { cls: 'battleship', L: 189.2, B: 27.0, fb: 8, guns: '62:2/381 50:2/381^2.5 -48:2/381^2.5b -62:2/381b', funnels: [[6, 14, 7]], blocks: [[34, 20, 26, 6, 1]], masts: [[28, 34], [-16, 26]] },
  // Britain.
  'invincible-1908': { cls: 'battlecruiser', L: 172.8, B: 23.9, fb: 8, guns: '58:2/305 -58:2/305b 4,8:2/305', funnels: [[20, 14, 5], [10, 14, 5], [-14, 14, 5]], blocks: [[42, 32, 18, 5, 1]], masts: [[36, 30], [-6, 26]] },
  'colossus-1910': { cls: 'battleship', L: 166.4, B: 26.4, fb: 8, guns: '56:2/305 6,9:2/305 -40:2/305b -56:2/305b', funnels: [[22, 14, 5], [-14, 14, 5]], blocks: [[40, 30, 18, 5, 1]], masts: [[2, 30]] },
  'orion': { cls: 'battleship', L: 177.0, B: 27.0, fb: 8, guns: '60:2/343 48:2/343^2.5 -4:2/343 -46:2/343^2.5b -60:2/343b', funnels: [[18, 14, 5], [6, 14, 5]], blocks: [[38, 28, 20, 6, 1]], masts: [[30, 32]] },
  'queen-mary': { cls: 'battlecruiser', L: 214.4, B: 27.2, fb: 8, sheer: 3, guns: '75:2/343 63:2/343^2.5 -24:2/343 -75:2/343b', funnels: [[40, 14, 5], [14, 14, 5], [0, 14, 5]], blocks: [[52, 44, 20, 5, 1]], masts: [[46, 32]] },
  'glorious': { cls: 'battlecruiser', L: 239.8, B: 24.7, fb: 8, sheer: 4, guns: '75:2/381 -75:2/381b', funnels: [[6, 14, 7]], blocks: [[44, 24, 24, 6, 1]], masts: [[36, 34]] },
  'renown': { cls: 'battlecruiser', L: 242.0, B: 27.4, fb: 8, sheer: 4, guns: '80:2/381 67:2/381^2.5 -78:2/381b', funnels: [[22, 14, 6], [0, 14, 6]], blocks: [[50, 36, 24, 6, 1]], masts: [[42, 34], [-24, 28]] },
  'nelson': { cls: 'battleship', L: 216.4, B: 32.3, fb: 9, sheer: 3, guns: '70:3/406 54:3/406^3 38:3/406 -40,9:2/152^2b -54,9:2/152^2b', funnels: [[0, 14, 7]], blocks: [[26, 12, 32, 7, 1]], masts: [[-16, 26]] },
  'warspite': { cls: 'battleship', L: 196.8, B: 31.7, fb: 8, guns: '64:2/381 52:2/381^2.5 -52:2/381^2.5b -64:2/381b', funnels: [[8, 14, 7]], blocks: [[34, 20, 30, 7, 2]], masts: [[-12, 28]] },
  'barham': { cls: 'battleship', L: 196.8, B: 31.7, fb: 8, guns: '64:2/381 52:2/381^2.5 -52:2/381^2.5b -64:2/381b', funnels: [[8, 14, 7]], blocks: [[34, 26, 24, 6, 1]], masts: [[30, 36], [-12, 26]] },
  'hood': { cls: 'battlecruiser', L: 262.3, B: 31.8, fb: 9, sheer: 5, guns: '88:2/381 75:2/381^2.5 -72:2/381^2.5b -86:2/381b', funnels: [[22, 14, 7], [4, 14, 7]], blocks: [[50, 34, 28, 7, 1]], masts: [[44, 36], [-14, 26]] },
  'vanguard': { cls: 'battleship', L: 248.2, B: 32.9, fb: 9, sheer: 7, guns: '80:2/381 67:2/381^3 -64:2/381^3b -78:2/381b', funnels: [[10, 13, 7], [-10, 13, 7]], blocks: [[40, 22, 30, 8, 2], [34, 26, 38, 3.5]], masts: [[18, 34], [-18, 26]] },
  'lion-1938': { cls: 'battleship', L: 239.6, B: 32.0, fb: 9, sheer: 6, guns: '76:3/406 60:3/406^3 -70:3/406b', funnels: [[8, 13, 7], [-10, 13, 7]], blocks: [[40, 22, 30, 8, 2], [34, 26, 38, 3.5]], masts: [[14, 32], [-20, 26]] },
  // Japan.
  'kawachi': { cls: 'battleship', L: 160.6, B: 25.7, fb: 8, guns: '56:2/305 -56:2/305b 20,9:2/305 -14,9:2/305b', funnels: [[22, 14, 5], [4, 14, 5], [-6, 14, 5]], blocks: [[40, 30, 18, 5, 1]], masts: [[34, 28], [-26, 22]] },
  'kongo': { cls: 'battlecruiser', L: 222.0, B: 31.0, fb: 8, sheer: 3, guns: '74:2/356 62:2/356^2.5 -36:2/356b -72:2/356b', funnels: [[16, 13, 7], [0, 13, 7]], blocks: [[46, 34, 26, 7, 1], [44, 38, 40, 3]], masts: [[-50, 24]] },
  'fuso': { cls: 'battleship', L: 212.8, B: 33.1, fb: 8, sheer: 3, guns: '70:2/356 58:2/356^2.5 2:2/356 -26:2/356b -56:2/356^2.5b -70:2/356b', funnels: [[16, 13, 7]], blocks: [[44, 34, 28, 7, 1], [42, 36, 44, 3.5], [40, 38, 52, 2.5]], masts: [[-40, 24]] },
  'ise': { cls: 'battleship', L: 215.8, B: 33.8, fb: 8, sheer: 3, guns: '70:2/356 58:2/356^2.5 -10:2/356^2.5b -24:2/356b -58:2/356^2.5b -72:2/356b', funnels: [[12, 13, 7]], blocks: [[44, 32, 28, 7, 1], [42, 36, 42, 3]], masts: [[-38, 22]] },
  'nagato': { cls: 'battleship', L: 224.9, B: 34.6, fb: 8, sheer: 3, guns: '74:2/410 61:2/410^2.5 -56:2/410^2.5b -70:2/410b', funnels: [[14, 13, 8]], blocks: [[44, 30, 28, 7, 1], [42, 34, 42, 3.5]], masts: [[-18, 24]] },
  'tosa': { cls: 'battleship', L: 231.7, B: 30.5, fb: 8, sheer: 3, guns: '76:2/410 63:2/410^2.5 -24:2/410b -60:2/410^2.5b -74:2/410b', funnels: [[14, 13, 8]], blocks: [[46, 32, 26, 7, 1]], masts: [[40, 32]] },
  'amagi': { cls: 'battlecruiser', L: 252.0, B: 30.8, fb: 8, sheer: 3, guns: '84:2/410 71:2/410^2.5 -10:2/410b -66:2/410^2.5b -80:2/410b', funnels: [[22, 13, 8], [6, 13, 8]], blocks: [[50, 36, 26, 7, 1]], masts: [[44, 32]] },
  // Italy.
  'dante-alighieri': { cls: 'battleship', L: 168.1, B: 26.6, fb: 7, guns: '58:3/305 18:3/305 -22:3/305b -58:3/305b', funnels: [[36, 12, 5], [0, 12, 5], [-6, 12, 5]], blocks: [[46, 38, 18, 5, 1]], masts: [[42, 26], [-38, 22]] },
  'cavour-1915': { cls: 'battleship', L: 176.0, B: 28.0, fb: 7, guns: '62:3/305 50:2/305^2.5 0:3/305 -50:2/305^2.5b -62:3/305b', funnels: [[22, 12, 5], [-20, 12, 5]], blocks: [[38, 30, 18, 5, 1]], masts: [[34, 26], [-26, 22]] },
  'caracciolo': { cls: 'battleship', L: 212.0, B: 29.6, fb: 8, guns: '72:2/381 60:2/381^2.5 -56:2/381^2.5b -70:2/381b', funnels: [[14, 13, 6], [-2, 13, 6]], blocks: [[40, 30, 22, 6, 1]], masts: [[34, 30]] },
  'littorio': { cls: 'battleship', L: 240.7, B: 32.8, fb: 9, sheer: 5, guns: '76:3/381 60:3/381^3 -68:3/381b 26,11:3/152^3 -20,11:3/152^3b', funnels: [[6, 12, 7], [-10, 12, 7]], blocks: [[40, 20, 30, 8, 2], [36, 26, 40, 3]], masts: [[-26, 24]] },
  // France.
  'courbet': { cls: 'battleship', L: 166.0, B: 27.0, fb: 8, guns: '60:2/305 48:2/305^2.5 6,9:2/305 -46:2/305^2.5b -58:2/305b', funnels: [[22, 12, 5], [-14, 12, 5]], blocks: [[38, 30, 20, 5, 1]], masts: [[32, 26]] },
  'bretagne': { cls: 'battleship', L: 166.0, B: 26.9, fb: 8, guns: '60:2/340 48:2/340^2.5 -2:2/340 -46:2/340^2.5b -58:2/340b', funnels: [[20, 12, 5], [-12, 12, 5]], blocks: [[38, 28, 22, 6, 1]], masts: [[32, 28]] },
  'dunkerque': { cls: 'battleship', L: 214.5, B: 31.1, fb: 9, sheer: 6, guns: '64:4/330 49:4/330^3 -50:4/130^2b -62,8:4/130b', funnels: [[0, 13, 8]], blocks: [[34, 16, 30, 8, 2], [30, 22, 38, 3]], masts: [[-10, 24]] },
  'richelieu': { cls: 'battleship', L: 247.9, B: 33.1, fb: 9, sheer: 7, guns: '76:4/380 59:4/380^3 -60:3/152^2b -40,10:3/152^3b', funnels: [[-2, 13, 8]], blocks: [[40, 20, 32, 9, 2], [34, 26, 42, 3.5]], masts: [[-10, 28]] },

  // ---------------------------------------------------------------- cruisers by class
  // United States.
  'omaha': { cls: 'light-cruiser', L: 169.4, B: 16.9, fb: 8, fc: [-30, 2.4], guns: '62:2/152 -62:2/152b', funnels: [[22, 11, 3], [14, 11, 3], [6, 11, 3], [-2, 11, 3]], blocks: [[38, 28, 16, 4, 1]], masts: [[34, 26], [-30, 20]] },
  'northampton': { cls: 'heavy-cruiser', L: 182.9, B: 20.1, fb: 8, fc: [-24, 2.4], guns: '56:3/203 44:3/203^2.5 -52:3/203b', funnels: [[6, 12, 4], [-8, 12, 4]], blocks: [[32, 22, 20, 5, 1]], masts: [[26, 30], [-20, 24]] },
  'portland': { cls: 'heavy-cruiser', L: 186.0, B: 20.1, fb: 8, fc: [-24, 2.4], guns: '58:3/203 46:3/203^2.5 -54:3/203b', funnels: [[6, 12, 4], [-8, 12, 4]], blocks: [[34, 20, 22, 6, 1]], masts: [[26, 32], [-20, 26]] },
  'pensacola': { cls: 'heavy-cruiser', L: 178.5, B: 19.9, fb: 8, fc: [-24, 2.4], guns: '58:2/203 46:3/203^2.5 -44:3/203^2.5b -56:2/203b', funnels: [[4, 12, 4], [-8, 12, 4]], blocks: [[30, 22, 20, 6, 1]], masts: [[24, 30], [-18, 26]] },
  'new-orleans': { cls: 'heavy-cruiser', L: 179.2, B: 18.8, fb: 8, fc: [-20, 2.4], guns: '54:3/203 42:3/203^2.5 -50:3/203b', funnels: [[4, 11, 4], [-8, 11, 4]], blocks: [[30, 16, 22, 6, 2]], masts: [[22, 26], [-18, 22]] },
  'brooklyn': { cls: 'light-cruiser', L: 185.4, B: 18.6, fb: 8, guns: '62:3/152 51:3/152^2.5 40:3/152 -52:3/152^2.5b -64:3/152b', funnels: [[6, 11, 4], [-6, 11, 4]], blocks: [[30, 18, 20, 6, 1]], masts: [[22, 26], [-14, 22]] },
  'cleveland': { cls: 'light-cruiser', L: 186.0, B: 20.2, fb: 8, sheer: 3, guns: '56:3/152 45:3/152^2.5 -48:3/152^2.5b -60:3/152b', funnels: [[6, 11, 4], [-8, 11, 4]], blocks: [[32, 18, 22, 6, 2], [-14, -24, 16, 4]], masts: [[16, 26], [-10, 22]] },
  'fargo': { cls: 'light-cruiser', L: 186.0, B: 20.2, fb: 8, sheer: 3, guns: '56:3/152 45:3/152^2.5 -48:3/152^2.5b -60:3/152b', funnels: [[-2, 11, 5]], blocks: [[32, 14, 22, 7, 2], [-14, -24, 16, 4]], masts: [[16, 26], [-10, 22]] },
  'atlanta': { cls: 'light-cruiser', L: 165.0, B: 16.2, fb: 7, sheer: 3, guns: '56:2/127 48:2/127^2.5 40:2/127^5 -40:2/127^5b -48:2/127^2.5b -56:2/127b', funnels: [[6, 10, 3.5], [-6, 10, 3.5]], blocks: [[32, 16, 20, 5, 1]], masts: [[14, 26]] },
  'worcester': { cls: 'light-cruiser', L: 207.1, B: 21.5, fb: 8, sheer: 4, guns: '66:2/152 55:2/152^2.5 44:2/152^5 -46:2/152^5b -57:2/152^2.5b -68:2/152b', funnels: [[8, 12, 5], [-8, 12, 5]], blocks: [[36, 18, 24, 7, 2]], masts: [[16, 28]] },
  'baltimore': { cls: 'heavy-cruiser', L: 205.3, B: 21.6, fb: 8, sheer: 4, guns: '64:3/203 51:3/203^2.5 -60:3/203b 28,9:2/127^3 -24,9:2/127^3b', funnels: [[6, 12, 5], [-10, 12, 5]], blocks: [[36, 18, 24, 7, 2]], masts: [[16, 28], [-16, 22]] },
  'oregon-city': { cls: 'heavy-cruiser', L: 205.3, B: 21.6, fb: 8, sheer: 4, guns: '64:3/203 51:3/203^2.5 -60:3/203b 28,9:2/127^3 -24,9:2/127^3b', funnels: [[-2, 12, 6]], blocks: [[36, 14, 24, 7, 2]], masts: [[16, 28], [-16, 22]] },
  'des-moines': { cls: 'heavy-cruiser', L: 218.4, B: 23.3, fb: 9, sheer: 4, guns: '68:3/203 54:3/203^2.5 -64:3/203b', funnels: [[-2, 13, 6]], blocks: [[38, 18, 26, 8, 2], [34, 22, 32, 4]], masts: [[10, 30], [-18, 24]] },
  // Germany.
  'pillau': { cls: 'light-cruiser', L: 135.3, B: 13.6, fb: 7, fc: [-10, 2.4], guns: '48:1/150 -48:1/150b 20,5:1/150 -10,5:1/150b', funnels: [[12, 11, 3], [4, 11, 3], [-4, 11, 3]], blocks: [[30, 24, 14, 3, 1]], masts: [[26, 20], [-26, 18]] },
  'emden-1925': { cls: 'light-cruiser', L: 155.1, B: 14.3, fb: 7, fc: [-20, 2.2], guns: '50:1/150 -50:1/150b 20,6:1/150 6,6:1/150 -10,6:1/150b', funnels: [[12, 11, 4], [0, 11, 4]], blocks: [[30, 22, 16, 4, 1]], masts: [[24, 22], [-20, 18]] },
  'konigsberg': { cls: 'light-cruiser', L: 174.0, B: 15.3, fb: 7, guns: '56:3/150 -44:3/150^2.5b -58:3/150b', funnels: [[8, 11, 4], [-6, 11, 4]], blocks: [[32, 20, 18, 5, 1]], masts: [[26, 22], [-14, 18]] },
  'leipzig': { cls: 'light-cruiser', L: 177.0, B: 16.3, fb: 7, guns: '58:3/150 -46:3/150^2.5b -60:3/150b', funnels: [[2, 12, 5]], blocks: [[34, 20, 20, 5, 1]], masts: [[28, 24], [-16, 18]] },
  'deutschland': { cls: 'heavy-cruiser', L: 186.0, B: 21.7, fb: 8, sheer: 4, guns: '60:3/283 -60:3/283b 10,9:1/150 -6,9:1/150b', funnels: [[0, 12, 6]], blocks: [[36, 16, 26, 6, 2], [32, 20, 34, 3]], masts: [[-14, 22]] },
  'hipper': { cls: 'heavy-cruiser', L: 202.8, B: 21.3, fb: 8, sheer: 5, guns: '68:2/203 56:2/203^2.5 -54:2/203^2.5b -66:2/203b', funnels: [[4, 13, 6]], blocks: [[38, 18, 26, 6, 2], [34, 22, 34, 3]], masts: [[-14, 24]] },
  // Soviet Union.
  'krasny-kavkaz': { cls: 'light-cruiser', L: 169.5, B: 15.7, fb: 7, fc: [-20, 2.2], guns: '56:1/180 46:1/180^2 -48:1/180^2b -58:1/180b', funnels: [[14, 11, 4], [0, 11, 4]], blocks: [[32, 24, 18, 4, 1]], masts: [[28, 24], [-20, 20]] },
  'svetlana': { cls: 'light-cruiser', L: 158.4, B: 15.4, fb: 7, fc: [-14, 2.4], guns: '52:1/130 -52:1/130b 20,6:1/130 -10,6:1/130b', funnels: [[16, 11, 3], [6, 11, 3], [-4, 11, 3]], blocks: [[32, 24, 15, 4, 1]], masts: [[28, 22], [-28, 18]] },
  'kirov-1936': { cls: 'light-cruiser', L: 191.4, B: 17.7, fb: 8, sheer: 3, guns: '58:3/180 46:3/180^2.5 -56:3/180b', funnels: [[2, 12, 5]], blocks: [[32, 20, 24, 5, 2]], masts: [[26, 28], [-18, 22]] },
  'maxim-gorky': { cls: 'light-cruiser', L: 191.2, B: 17.5, fb: 8, sheer: 3, guns: '58:3/180 46:3/180^2.5 -56:3/180b', funnels: [[2, 12, 5]], blocks: [[34, 18, 26, 6, 2], [30, 22, 32, 3]], masts: [[-18, 22]] },
  'chapayev': { cls: 'light-cruiser', L: 201.0, B: 19.7, fb: 8, sheer: 3, guns: '64:3/152 52:3/152^2.5 -52:3/152^2.5b -64:3/152b', funnels: [[8, 12, 5], [-10, 12, 5]], blocks: [[36, 22, 22, 6, 2]], masts: [[30, 28], [-18, 22]] },
  'sverdlov': { cls: 'light-cruiser', L: 210.0, B: 22.0, fb: 8, sheer: 4, guns: '68:3/152 56:3/152^2.5 -56:3/152^2.5b -68:3/152b', funnels: [[8, 12, 6], [-12, 12, 6]], blocks: [[38, 22, 24, 7, 2]], masts: [[22, 28], [-20, 24]] },
  // Britain.
  'hawkins': { cls: 'heavy-cruiser', L: 184.4, B: 19.8, fb: 8, fc: [-30, 2.4], guns: '58:1/190 48:1/190^2 -48:1/190^2b -58:1/190b 4,8:1/190', funnels: [[12, 12, 5], [-2, 12, 5]], blocks: [[34, 24, 20, 5, 1]], masts: [[28, 28], [-22, 22]] },
  'emerald': { cls: 'light-cruiser', L: 173.7, B: 16.6, fb: 7, fc: [-30, 2.4], guns: '60:2/152 48:1/152^2 -48:1/152b -60:1/152b', funnels: [[16, 12, 4], [6, 12, 4], [-4, 12, 4]], blocks: [[36, 26, 18, 5, 1]], masts: [[30, 26], [-28, 20]] },
  'arethusa': { cls: 'light-cruiser', L: 154.2, B: 15.5, fb: 7, fc: [-28, 2.2], guns: '52:2/152 42:2/152^2.5 -50:2/152b', funnels: [[0, 11, 4]], blocks: [[28, 18, 18, 5, 1]], masts: [[22, 24], [-16, 20]] },
  'leander': { cls: 'light-cruiser', L: 169.0, B: 17.0, fb: 7, fc: [-30, 2.2], guns: '58:2/152 47:2/152^2.5 -46:2/152^2.5b -58:2/152b', funnels: [[2, 12, 6]], blocks: [[32, 20, 20, 5, 1]], masts: [[24, 26], [-16, 22]] },
  'dido': { cls: 'light-cruiser', L: 156.1, B: 15.4, fb: 7, fc: [-30, 2.2], guns: '54:2/133 46:2/133^2.5 38:2/133^5 -42:2/133^2.5b -52:2/133b', funnels: [[8, 11, 4], [-4, 11, 4]], blocks: [[30, 18, 18, 5, 1]], masts: [[22, 24], [-14, 20]] },
  'kent': { cls: 'heavy-cruiser', L: 192.0, B: 20.8, fb: 10, guns: '64:2/203 52:2/203^2.5 -52:2/203^2.5b -64:2/203b', funnels: [[16, 13, 4], [6, 13, 4], [-4, 13, 4]], blocks: [[36, 24, 22, 6, 1]], masts: [[28, 30], [-26, 24]] },
  'london-1941': { cls: 'heavy-cruiser', L: 192.8, B: 20.1, fb: 10, guns: '64:2/203 52:2/203^2.5 -52:2/203^2.5b -64:2/203b', funnels: [[8, 13, 5], [-8, 13, 5]], blocks: [[36, 20, 26, 7, 2]], masts: [[16, 30], [-24, 24]] },
  'york': { cls: 'heavy-cruiser', L: 175.3, B: 17.4, fb: 10, guns: '56:2/203 45:2/203^2.5 -56:2/203b', funnels: [[8, 12, 4], [-4, 12, 4]], blocks: [[32, 20, 22, 6, 1]], masts: [[24, 28], [-18, 22]] },
  'southampton': { cls: 'light-cruiser', L: 180.3, B: 19.3, fb: 8, sheer: 3, guns: '60:3/152 49:3/152^2.5 -50:3/152^2.5b -62:3/152b', funnels: [[10, 12, 5], [-6, 12, 5]], blocks: [[34, 22, 22, 6, 1], [2, -2, 16, 6]], masts: [[26, 28], [-18, 24]] },
  'belfast': { cls: 'light-cruiser', L: 187.0, B: 19.3, fb: 8, sheer: 3, guns: '62:3/152 51:3/152^2.5 -52:3/152^2.5b -64:3/152b', funnels: [[8, 12, 5], [-10, 12, 5]], blocks: [[36, 22, 24, 7, 2], [0, -4, 16, 6]], masts: [[22, 30], [-20, 26]] },
  'fiji': { cls: 'light-cruiser', L: 169.3, B: 18.9, fb: 8, sheer: 3, transom: 0.8, guns: '56:3/152 45:3/152^2.5 -46:3/152^2.5b -58:3/152b', funnels: [[8, 12, 5], [-6, 12, 5]], blocks: [[32, 20, 22, 6, 2]], masts: [[24, 28], [-16, 24]] },
  'tiger-1959': { cls: 'light-cruiser', L: 169.3, B: 19.5, fb: 8, sheer: 3, guns: '56:2/152m -54:2/152mb 44:2/76m -42,6:2/76mb', funnels: [[6, 10, 5], [-10, 10, 5]], blocks: [[34, 16, 22, 7, 2], [-4, -26, 16, 6]], masts: [[18, 26], [-6, 22]] },
  // Japan.
  'kuma': { cls: 'light-cruiser', L: 162.1, B: 14.2, fb: 7, fc: [-6, 2.4], guns: '54:1/140 46:1/140^2 -46:1/140^2b -54:1/140b 10,6:1/140', funnels: [[12, 11, 3.5], [2, 11, 3.5], [-8, 11, 3.5]], blocks: [[32, 24, 18, 4, 1]], masts: [[26, 24], [-28, 18]] },
  'sendai': { cls: 'light-cruiser', L: 162.1, B: 14.2, fb: 7, fc: [-6, 2.4], guns: '54:1/140 46:1/140^2 -46:1/140^2b -54:1/140b 10,6:1/140', funnels: [[16, 11, 3.5], [6, 11, 3.5], [-4, 11, 3.5], [-14, 11, 3.5]], blocks: [[32, 24, 18, 4, 1]], masts: [[26, 24], [-28, 18]] },
  'yubari': { cls: 'light-cruiser', L: 139.0, B: 12.0, fb: 6, fc: [-18, 2.2], guns: '46:1/140 38:2/140^2 -38:2/140^2b -46:1/140b', funnels: [[0, 11, 4]], blocks: [[28, 20, 16, 4, 1]], masts: [[22, 20], [-18, 16]] },
  'furutaka': { cls: 'heavy-cruiser', L: 185.2, B: 16.9, fb: 8, fc: [-22, 2.4], guns: '58:2/203 48:2/203^2.5 -56:2/203b', funnels: [[10, 11, 4], [-4, 11, 4]], blocks: [[32, 22, 20, 5, 1]], masts: [[24, 24], [-18, 18]] },
  'myoko': { cls: 'heavy-cruiser', L: 203.8, B: 19.0, fb: 8, fc: [-20, 2.4], guns: '66:2/203 56:2/203^2.5 46:2/203^0.5 -50:2/203^2.5b -62:2/203b', funnels: [[14, 12, 5], [0, 12, 5]], blocks: [[38, 26, 26, 6, 1]], masts: [[-8, 24]] },
  'mogami': { cls: 'heavy-cruiser', L: 200.6, B: 20.2, fb: 8, fc: [-20, 2.4], guns: '66:2/203 56:2/203^2.5 46:2/203^0.5 -48:2/203^2.5b -60:2/203b', funnels: [[6, 12, 5]], blocks: [[34, 24, 26, 6, 1]], masts: [[-12, 22]] },
  'mogami-1943': { cls: 'heavy-cruiser', L: 200.6, B: 20.2, fb: 8, fc: [-20, 2.4], guns: '66:2/203 56:2/203^2.5 46:2/203^0.5', funnels: [[6, 12, 5]], blocks: [[34, 24, 26, 6, 1], [-34, -92, 8.4, 9]], masts: [[-12, 22]] },
  'tone': { cls: 'heavy-cruiser', L: 201.6, B: 19.4, fb: 8, fc: [-20, 2.4], guns: '68:2/203 58:2/203^2.5 48:2/203^0.5 38:2/203^2', funnels: [[2, 12, 5]], blocks: [[26, 16, 24, 6, 1]], masts: [[-14, 22]] },
  'agano': { cls: 'light-cruiser', L: 174.1, B: 15.2, fb: 7, fc: [-14, 2.4], guns: '56:2/152 46:2/152^2.5 -50:2/152b', funnels: [[4, 11, 4]], blocks: [[30, 20, 20, 5, 1]], masts: [[-10, 20]] },
  'oyodo': { cls: 'light-cruiser', L: 192.1, B: 16.6, fb: 7, fc: [-10, 2.4], guns: '58:3/155 48:3/155^2.5', funnels: [[6, 12, 5]], blocks: [[32, 20, 22, 6, 1], [-8, -30, 14, 6]], masts: [[-6, 22]] },
  'ikoma': { cls: 'armoured-cruiser', L: 147.8, B: 22.8, fb: 8, guns: '50:2/305 -50:2/305b 18,8:2/203 -14,8:2/203b', funnels: [[10, 13, 4], [-6, 13, 4]], blocks: [[32, 24, 18, 5, 1]], masts: [[28, 26], [-24, 24]] },
  'kurama': { cls: 'armoured-cruiser', L: 147.8, B: 22.8, fb: 8, guns: '50:2/305 -50:2/305b 18,8:2/203 -14,8:2/203b', funnels: [[14, 13, 4], [2, 13, 4], [-10, 13, 4]], blocks: [[32, 24, 18, 5, 1]], masts: [[28, 26], [-24, 24]] },
  // Italy.
  'trento': { cls: 'heavy-cruiser', L: 196.9, B: 20.6, fb: 8, sheer: 3, guns: '64:2/203 53:2/203^2.5 -52:2/203^2.5b -64:2/203b', funnels: [[8, 12, 4], [-6, 12, 4]], blocks: [[34, 22, 24, 6, 1]], masts: [[26, 28], [-14, 24]] },
  'zara': { cls: 'heavy-cruiser', L: 182.8, B: 20.6, fb: 8, fc: [-20, 2.4], guns: '58:2/203 47:2/203^2.5 -46:2/203^2.5b -58:2/203b', funnels: [[8, 12, 5], [-6, 12, 5]], blocks: [[32, 20, 24, 6, 1]], masts: [[26, 28]] },
  'giussano': { cls: 'light-cruiser', L: 169.3, B: 15.5, fb: 7, fc: [-20, 2.2], guns: '56:2/152 46:2/152^2.5 -46:2/152^2.5b -56:2/152b', funnels: [[8, 11, 4], [-6, 11, 4]], blocks: [[30, 20, 20, 5, 1]], masts: [[24, 24]] },
  'montecuccoli': { cls: 'light-cruiser', L: 182.2, B: 16.5, fb: 7, sheer: 3, guns: '60:2/152 49:2/152^2.5 -48:2/152^2.5b -60:2/152b', funnels: [[12, 11, 4], [-10, 11, 4]], blocks: [[32, 22, 22, 6, 1]], masts: [[26, 26], [-4, 22]] },
  'abruzzi': { cls: 'light-cruiser', L: 187.0, B: 18.9, fb: 8, sheer: 3, guns: '62:3/152 51:2/152^2.5 -50:2/152^2.5b -62:3/152b', funnels: [[10, 11, 5], [-8, 11, 5]], blocks: [[34, 22, 22, 6, 1]], masts: [[26, 26]] },
  'etna': { cls: 'light-cruiser', L: 153.8, B: 14.5, fb: 6, fc: [-10, 2], guns: '50:2/135 41:2/135^2.5 -46:2/135b', funnels: [[0, 11, 4]], blocks: [[28, 18, 18, 5, 1]], masts: [[20, 22]] },
  'capitani-romani': { cls: 'light-cruiser', L: 142.9, B: 14.4, fb: 6, fc: [-14, 2], guns: '48:2/135 40:2/135^2.5 -40:2/135^2.5b -48:2/135b', funnels: [[8, 10, 3.5], [-4, 10, 3.5]], blocks: [[26, 18, 16, 4, 1]], masts: [[18, 20]] },
  // France.
  'jeanne-d-arc': { cls: 'light-cruiser', L: 170.0, B: 17.7, fb: 8, fc: [-26, 2.4], guns: '56:2/155 46:2/155^2.5 -46:2/155^2.5b -56:2/155b', funnels: [[8, 12, 5], [-6, 12, 5]], blocks: [[32, 20, 22, 6, 1]], masts: [[24, 26], [-20, 22]] },
  'duguay-trouin': { cls: 'light-cruiser', L: 181.3, B: 17.5, fb: 7, fc: [-20, 2.4], guns: '60:2/155 50:2/155^2.5 -50:2/155^2.5b -60:2/155b', funnels: [[12, 12, 4], [-2, 12, 4]], blocks: [[34, 22, 20, 5, 1]], masts: [[28, 26], [-24, 22]] },
  'suffren': { cls: 'heavy-cruiser', L: 194.0, B: 19.3, fb: 8, fc: [-24, 2.4], guns: '62:2/203 52:2/203^2.5 -52:2/203^2.5b -62:2/203b', funnels: [[12, 12, 5], [-8, 12, 5]], blocks: [[34, 24, 22, 6, 1]], masts: [[28, 28], [-20, 22]] },
  'algerie': { cls: 'heavy-cruiser', L: 186.2, B: 20.0, fb: 8, sheer: 3, guns: '62:2/203 52:2/203^2.5 -52:2/203^2.5b -62:2/203b', funnels: [[0, 12, 6]], blocks: [[34, 18, 26, 7, 2], [30, 22, 32, 3]], masts: [[-10, 22]] },
  'emile-bertin': { cls: 'light-cruiser', L: 177.0, B: 16.0, fb: 7, fc: [-20, 2.2], guns: '58:3/152 48:3/152^2.5 -54:3/152b', funnels: [[10, 11, 4], [-2, 11, 4]], blocks: [[30, 20, 20, 5, 1]], masts: [[24, 24]] },
  'la-galissoniere': { cls: 'light-cruiser', L: 179.5, B: 17.5, fb: 7, fc: [-20, 2.2], guns: '58:3/152 48:3/152^2.5 -54:3/152b', funnels: [[0, 12, 5]], blocks: [[30, 18, 22, 6, 2]], masts: [[-12, 22]] },

  // ---------------------------------------------------------------- destroyers by class
  // United States.
  'clemson': { cls: 'destroyer', L: 95.8, B: 9.4, fb: 4.5, sheer: 2.5, guns: '40:1/102 -42:1/102b 8,4:1/102', funnels: [[16, 7, 2], [10, 7, 2], [4, 7, 2], [-2, 7, 2]], blocks: [[30, 24, 9, 2.4, 1]], masts: [[22, 14], [-28, 10]] },
  'farragut': { cls: 'destroyer', L: 104.0, B: 10.4, fb: 5.4, fc: [-14, 1.4], guns: '38:1/127 31:1/127^2 -24:1/127^2b -34:1/127b -44:1/127b', funnels: [[8, 7, 2.8], [-4, 7, 2.8]], blocks: [[24, 18, 11, 3, 1]], masts: [[17, 16]] },
  'mahan': { cls: 'destroyer', L: 104.0, B: 10.5, fb: 5.4, fc: [-14, 1.4], guns: '38:1/127 31:1/127^2 -26:1/127^2b -36:1/127b -46:1/127b', funnels: [[10, 7, 2.6], [-2, 7, 2.6]], blocks: [[24, 18, 11, 3, 1], [-12, -18, 8, 2.4]], masts: [[17, 16], [-14, 10]] },
  'bagley': { cls: 'destroyer', L: 104.0, B: 10.9, fb: 5.4, fc: [-12, 1.4], guns: '38:1/127 31:1/127^2 -30:1/127^2b -42:1/127b', funnels: [[2, 7.5, 3.2]], blocks: [[24, 18, 11, 3, 1]], masts: [[16, 16]] },
  'porter': { cls: 'destroyer', L: 116.2, B: 11.1, fb: 5.6, fc: [-14, 1.4], guns: '44:2/127 36:2/127^2 -34:2/127^2b -46:2/127b', funnels: [[8, 8, 3], [-4, 8, 3]], blocks: [[28, 22, 13, 3.5, 1]], masts: [[20, 18]] },
  'somers': { cls: 'destroyer', L: 116.2, B: 11.0, fb: 5.6, fc: [-14, 1.4], guns: '44:2/127 36:2/127^2 -34:2/127^2b -46:2/127b', funnels: [[2, 8, 3.6]], blocks: [[28, 22, 13, 3.5, 1]], masts: [[20, 18]] },
  'sumner': { cls: 'destroyer', L: 114.8, B: 12.5, fb: 5.6, sheer: 2, guns: '42:2/127 34:2/127^2 -40:2/127b', funnels: [[8, 8, 3], [-4, 8, 3]], blocks: [[28, 20, 13, 3.5, 1]], masts: [[18, 18]] },
  'gearing': { cls: 'destroyer', L: 119.0, B: 12.5, fb: 5.6, sheer: 2, guns: '44:2/127 36:2/127^2 -42:2/127b', funnels: [[10, 8, 3], [-6, 8, 3]], blocks: [[30, 22, 13, 3.5, 1]], masts: [[20, 18]] },
  'mitscher': { cls: 'destroyer', L: 150.3, B: 14.8, fb: 6.5, sheer: 3, guns: '56:1/127m -56:1/127mb', funnels: [[12, 9, 3.5], [-6, 9, 3.5]], blocks: [[36, 22, 14, 5, 1], [-14, -30, 11, 4]], masts: [[24, 20], [2, 18]] },
  'forrest-sherman': { cls: 'destroyer', L: 127.4, B: 13.7, fb: 6, sheer: 3, guns: '46:1/127m -40:1/127^2bm -52:1/127mb', funnels: [[8, 8, 3.2], [-10, 8, 3.2]], blocks: [[32, 16, 13, 4, 1]], masts: [[18, 20]] },
  'charles-f-adams': { cls: 'destroyer', L: 133.2, B: 14.3, fb: 6, sheer: 3, guns: '50:1/127m -54:1/127mb', funnels: [[10, 8, 3.2], [-10, 8, 3.2]], blocks: [[34, 16, 13, 4, 1], [-12, -22, 11, 4]], masts: [[16, 20], [-4, 18]], launchers: [{ x: -42, length: 5, width: 4, kind: 'box' }] },
  // Germany.
  'raubtier': { cls: 'destroyer', L: 92.6, B: 8.6, fb: 5, fc: [16, 1.6], guns: '36:1/105 -30:1/105b -42:1/105b', funnels: [[6, 6, 2.4], [-4, 6, 2.4]], blocks: [[24, 18, 9, 2.4, 1]], masts: [[18, 12]] },
  'type-1934a': { cls: 'destroyer', L: 119.0, B: 11.3, fb: 6, sheer: 2, guns: '48:1/127 40:1/127^2 -32:1/127^2b -44:1/127b -54:1/127b', funnels: [[10, 8, 3], [-4, 8, 3]], blocks: [[30, 22, 13, 3.5, 1]], masts: [[20, 18]] },
  'type-1936': { cls: 'destroyer', L: 123.4, B: 11.8, fb: 6, sheer: 3, guns: '50:1/127 42:1/127^2 -34:1/127^2b -46:1/127b -56:1/127b', funnels: [[10, 8, 3], [-4, 8, 3]], blocks: [[32, 24, 13, 3.5, 1]], masts: [[22, 18]] },
  'type-1936a': { cls: 'destroyer', L: 127.0, B: 12.0, fb: 6, sheer: 3, guns: '50:2/150 -34:1/150^2b -46:1/150b -56:1/150b', funnels: [[10, 8, 3], [-4, 8, 3]], blocks: [[32, 24, 13, 4, 1]], masts: [[22, 18]] },
  'type-1936c': { cls: 'destroyer', L: 127.0, B: 12.2, fb: 6, sheer: 3, guns: '50:2/128 -38:2/128^2b -52:2/128b', funnels: [[10, 8, 3], [-4, 8, 3]], blocks: [[32, 24, 13, 4, 1]], masts: [[22, 18]] },
  'type-1939': { cls: 'destroyer', L: 102.5, B: 10.0, fb: 5.4, fc: [-6, 1.4], guns: '40:1/105 -30:1/105^2b -42:1/105b', funnels: [[6, 7, 3], [-6, 7, 3]], blocks: [[26, 20, 10, 3, 1]], masts: [[18, 14]] },
  'z51': { cls: 'destroyer', L: 114.3, B: 11.0, fb: 6, sheer: 3, guns: '44:1/128 36:1/128^2 -36:1/128^2b -46:1/128b', funnels: [[2, 8, 3.5]], blocks: [[28, 20, 12, 3.4, 1]], masts: [[18, 18]] },
  'z52': { cls: 'destroyer', L: 126.2, B: 12.0, fb: 6, sheer: 3, guns: '48:2/128 -36:2/128^2b -50:2/128b', funnels: [[4, 8, 3.6]], blocks: [[30, 22, 13, 3.6, 1]], masts: [[20, 18]] },
  // Russia and the Soviet Union.
  'novik': { cls: 'destroyer', L: 102.4, B: 9.5, fb: 4.8, sheer: 2, guns: '40:1/102 -40:1/102b 0:1/102', funnels: [[18, 7, 2.4], [10, 7, 2.4], [2, 7, 2.4], [-6, 7, 2.4]], blocks: [[30, 24, 9, 2.4, 1]], masts: [[24, 14], [-30, 12]] },
  'opytny': { cls: 'destroyer', L: 113.5, B: 10.2, fb: 5.6, guns: '44:1/130 -38:1/130^2b -50:1/130b', funnels: [[6, 8, 3], [-6, 8, 3]], blocks: [[30, 22, 12, 3.5, 1]], masts: [[20, 16]] },
  'type-7u': { cls: 'destroyer', L: 112.5, B: 10.2, fb: 5.4, guns: '44:1/130 37:1/130^2 -38:1/130^2b -48:1/130b', funnels: [[8, 8, 3], [-4, 8, 3]], blocks: [[28, 22, 12, 3.2, 1]], masts: [[20, 16]] },
  'leningrad': { cls: 'destroyer', L: 127.5, B: 11.7, fb: 5.6, guns: '50:1/130 42:1/130^2 -38:1/130^2b -50:1/130b -58:1/130b', funnels: [[14, 8, 3], [4, 8, 3], [-6, 8, 3]], blocks: [[32, 26, 13, 3.5, 1]], masts: [[24, 18]] },
  'regele-ferdinand': { cls: 'destroyer', L: 101.9, B: 9.6, fb: 5.4, guns: '40:1/120 32:1/120^2 -36:1/120^2b -46:1/120b', funnels: [[6, 7, 2.8], [-4, 7, 2.8]], blocks: [[26, 20, 11, 3, 1]], masts: [[20, 14]] },
  'project-30bis': { cls: 'destroyer', L: 120.5, B: 11.8, fb: 6, sheer: 2, guns: '46:2/130 -46:2/130b', funnels: [[8, 8, 3.2], [-6, 8, 3.2]], blocks: [[32, 22, 13, 3.5, 1]], masts: [[22, 18], [-20, 14]] },
  'project-48': { cls: 'destroyer', L: 127.8, B: 11.7, fb: 6, guns: '50:2/130 41:2/130^2 -48:2/130b', funnels: [[8, 8, 3.4], [-6, 8, 3.4]], blocks: [[32, 22, 14, 4, 1]], masts: [[22, 18]] },
  'kotlin': { cls: 'destroyer', L: 126.1, B: 12.7, fb: 6, sheer: 2, guns: '48:2/130 -44:2/130b 34:4/45 -34:4/45^2b', funnels: [[8, 8, 3.4], [-8, 8, 3.4]], blocks: [[32, 20, 13, 4, 1]], masts: [[20, 18], [-2, 14]] },
  'project-41': { cls: 'destroyer', L: 133.8, B: 13.6, fb: 6, sheer: 2, guns: '50:2/130 -48:2/130b', funnels: [[10, 9, 3.6], [-8, 9, 3.6]], blocks: [[34, 22, 14, 4, 1]], masts: [[22, 20]] },
  // Britain.
  'v-class': { cls: 'destroyer', L: 95.1, B: 9.0, fb: 4.6, fc: [16, 1.2], guns: '36:1/102 30:1/102^2 -30:1/102^2b -38:1/102b', funnels: [[8, 7, 3], [-2, 7, 2.6]], blocks: [[24, 20, 9, 2.6, 1]], masts: [[18, 14], [-14, 10]] },
  'g-class': { cls: 'destroyer', L: 98.5, B: 10.1, fb: 5, fc: [12, 1.3], guns: '38:1/120 32:1/120^2 -32:1/120^2b -42:1/120b', funnels: [[8, 7, 3], [-2, 7, 3]], blocks: [[26, 20, 10, 3, 1]], masts: [[18, 15]] },
  's-class': { cls: 'destroyer', L: 110.5, B: 10.9, fb: 5.2, fc: [12, 1.3], guns: '42:1/120 35:1/120^2 -36:1/120^2b -46:1/120b', funnels: [[2, 7.5, 3.4]], blocks: [[28, 22, 11, 3, 1]], masts: [[20, 16]] },
  'hunt-ii': { cls: 'destroyer', L: 85.3, B: 9.6, fb: 4.8, fc: [-6, 1.2], guns: '34:2/102 27:2/102^2 -34:2/102b', funnels: [[0, 6, 2.8]], blocks: [[22, 14, 9, 3, 1]], masts: [[14, 13]] },
  'hunt-iii': { cls: 'destroyer', L: 85.3, B: 9.6, fb: 4.8, fc: [-6, 1.2], guns: '34:2/102 -34:2/102b', funnels: [[0, 6, 2.8]], blocks: [[24, 14, 9, 3, 1]], masts: [[14, 13]] },
  'hunt-iv': { cls: 'destroyer', L: 90.2, B: 10.4, fb: 5, guns: '36:2/102 28:2/102^2 -36:2/102b', funnels: [[2, 6.5, 3]], blocks: [[24, 14, 9.5, 3.2, 1]], masts: [[14, 14]] },
  'tribal': { cls: 'destroyer', L: 115.1, B: 11.1, fb: 5.4, fc: [16, 1.4], guns: '44:2/120 37:2/120^2 -36:2/120^2b -46:2/120b', funnels: [[10, 7.5, 3], [-2, 7.5, 3]], blocks: [[28, 22, 12, 3.5, 1]], masts: [[20, 16]] },
  'j-class': { cls: 'destroyer', L: 108.7, B: 10.9, fb: 5.2, fc: [12, 1.3], guns: '42:2/120 35:2/120^2 -44:2/120b', funnels: [[2, 7.5, 3.6]], blocks: [[28, 22, 11, 3.4, 1]], masts: [[20, 16]] },
  'battle': { cls: 'destroyer', L: 115.5, B: 12.3, fb: 5.6, fc: [6, 1.3], guns: '44:2/114 36:2/114^2', funnels: [[0, 8, 3.6]], blocks: [[28, 18, 13, 4, 1]], masts: [[10, 16]] },
  'daring': { cls: 'destroyer', L: 118.9, B: 13.1, fb: 6, sheer: 2, guns: '44:2/114m 36:2/114^2m -46:2/114mb', funnels: [[0, 7, 4]], blocks: [[28, 14, 13, 4, 1]], masts: [[10, 18]] },
  // Japan.
  'momi': { cls: 'destroyer', L: 85.3, B: 7.9, fb: 4.4, fc: [22, 1.4], guns: '34:1/120 -2:1/120 -36:1/120b', funnels: [[8, 6, 2.2], [-12, 6, 2.2]], blocks: [[24, 20, 8, 2.2, 1]], masts: [[20, 12]] },
  'kamikaze': { cls: 'destroyer', L: 102.6, B: 9.2, fb: 4.8, fc: [28, 1.6], guns: '38:1/120 6:1/120 -30:1/120b -42:1/120b', funnels: [[14, 6.5, 2.4], [-6, 6.5, 2.4]], blocks: [[28, 24, 9, 2.4, 1]], masts: [[22, 13]] },
  'mutsuki': { cls: 'destroyer', L: 102.7, B: 9.2, fb: 4.8, sheer: 2.5, fc: [28, 1.6], guns: '38:1/120 6:1/120 -30:1/120b -42:1/120b', funnels: [[14, 6.5, 2.4], [-6, 6.5, 2.4]], blocks: [[28, 24, 9, 2.4, 1]], masts: [[22, 13]] },
  'hatsuharu': { cls: 'destroyer', L: 109.5, B: 10.0, fb: 5, fc: [16, 1.4], guns: '40:2/127 33:2/127^2 -38:2/127b', funnels: [[10, 7, 3], [-2, 7, 3]], blocks: [[28, 22, 12, 3, 1]], masts: [[20, 15]] },
  'shiratsuyu': { cls: 'destroyer', L: 107.5, B: 9.9, fb: 5, fc: [16, 1.4], guns: '40:2/127 -28:1/127^2b -40:2/127b', funnels: [[10, 7, 3], [-2, 7, 3]], blocks: [[28, 22, 12, 3, 1]], masts: [[20, 15]] },
  'kagero': { cls: 'destroyer', L: 118.5, B: 10.8, fb: 5.4, fc: [18, 1.4], guns: '44:2/127 -32:2/127^2b -44:2/127b', funnels: [[10, 7.5, 3], [-2, 7.5, 3]], blocks: [[30, 24, 12, 3.2, 1]], masts: [[22, 16]] },
  'matsu': { cls: 'destroyer', L: 100.0, B: 9.4, fb: 5, fc: [16, 1.3], guns: '36:1/127 -36:2/127b', funnels: [[8, 6.5, 2.6], [-2, 6.5, 2.6]], blocks: [[26, 22, 10, 2.8, 1]], masts: [[20, 14]] },
  'shimakaze': { cls: 'destroyer', L: 129.5, B: 11.2, fb: 5.6, fc: [22, 1.5], guns: '50:2/127 -38:2/127^2b -50:2/127b', funnels: [[12, 7.5, 3], [0, 7.5, 3]], blocks: [[34, 28, 12, 3.2, 1]], masts: [[26, 16]] },
  // Italy.
  'turbine': { cls: 'destroyer', L: 93.2, B: 9.2, fb: 4.8, fc: [12, 1.2], guns: '36:2/120 -36:2/120b', funnels: [[6, 6.5, 2.6], [-4, 6.5, 2.6]], blocks: [[24, 18, 9, 3, 1]], masts: [[16, 13]] },
  'freccia': { cls: 'destroyer', L: 96.2, B: 9.8, fb: 5, fc: [10, 1.2], guns: '38:2/120 -38:2/120b', funnels: [[2, 6.5, 3.4]], blocks: [[24, 16, 10, 3, 1]], masts: [[14, 14]] },
  'maestrale': { cls: 'destroyer', L: 106.7, B: 10.2, fb: 5.2, fc: [12, 1.2], guns: '40:2/120 -34:2/120^2b', funnels: [[2, 7, 3.4]], blocks: [[26, 18, 11, 3, 1]], masts: [[16, 15]] },
  'soldati': { cls: 'destroyer', L: 106.7, B: 10.2, fb: 5.2, fc: [12, 1.2], guns: '40:2/120 -34:2/120^2b 0:1/120', funnels: [[4, 7, 3.4]], blocks: [[26, 18, 11, 3, 1]], masts: [[16, 15]] },
  'navigatori': { cls: 'destroyer', L: 107.3, B: 10.2, fb: 5.2, fc: [14, 1.2], guns: '40:2/120 -2:2/120 -40:2/120b', funnels: [[10, 7, 3], [-12, 7, 3]], blocks: [[26, 18, 11, 3, 1]], masts: [[16, 15]] },
  'leone': { cls: 'destroyer', L: 113.4, B: 10.4, fb: 5.2, fc: [18, 1.3], guns: '42:2/120 35:2/120^2 -35:2/120^2b -44:2/120b', funnels: [[12, 7, 2.6], [4, 7, 2.6], [-4, 7, 2.6]], blocks: [[28, 22, 11, 3, 1]], masts: [[20, 15]] },
  'medaglie-d-oro': { cls: 'destroyer', L: 120.7, B: 12.1, fb: 5.6, sheer: 2, guns: '46:1/135 39:1/135^2 -40:1/135^2b -50:1/135b', funnels: [[2, 8, 3.6]], blocks: [[30, 22, 12, 3.6, 1]], masts: [[20, 17]] },
  'impetuoso': { cls: 'destroyer', L: 127.6, B: 13.2, fb: 6, sheer: 2, guns: '50:2/127m -50:2/127mb', funnels: [[8, 7, 3.6], [-8, 7, 3.6]], blocks: [[32, 14, 13, 4, 1]], masts: [[16, 20], [-2, 16]] },
  'vifor': { cls: 'destroyer', L: 94.7, B: 9.5, fb: 5, fc: [20, 1.3], guns: '36:1/120 -10:1/120 -36:1/120b', funnels: [[12, 7, 2.6], [4, 7, 2.6], [-4, 7, 2.6]], blocks: [[26, 22, 10, 2.8, 1]], masts: [[20, 14]] },
  // France.
  'bourrasque': { cls: 'destroyer', L: 105.8, B: 9.6, fb: 5, fc: [16, 1.3], guns: '40:1/130 33:1/130^2 -34:1/130^2b -44:1/130b', funnels: [[12, 7, 2.6], [4, 7, 2.6], [-4, 7, 2.6]], blocks: [[26, 20, 10, 3, 1]], masts: [[18, 14]] },
  'jaguar-1923': { cls: 'destroyer', L: 126.8, B: 11.4, fb: 5.6, fc: [20, 1.3], guns: '48:1/130 41:1/130^2 -34:1/130^2b -46:1/130b -56:1/130b', funnels: [[18, 8, 2.6], [12, 8, 2.6], [2, 8, 2.6], [-4, 8, 2.6]], blocks: [[32, 26, 12, 3.4, 1]], masts: [[24, 18]] },
  'guepard': { cls: 'destroyer', L: 130.2, B: 11.8, fb: 5.8, fc: [24, 1.3], guns: '50:1/138 43:1/138^2 -34:1/138^2b -46:1/138b -58:1/138b', funnels: [[18, 8, 2.8], [10, 8, 2.8], [2, 8, 2.8], [-6, 8, 2.8]], blocks: [[34, 28, 12, 3.4, 1]], masts: [[26, 18]] },
  'le-fantasque': { cls: 'destroyer', L: 132.4, B: 12.4, fb: 6, fc: [24, 1.3], guns: '52:1/138 45:1/138^2 -36:1/138^2b -48:1/138b -60:1/138b', funnels: [[16, 8, 3], [6, 8, 3], [-4, 8, 3]], blocks: [[34, 28, 12, 3.4, 1]], masts: [[26, 18]] },
  'mogador': { cls: 'destroyer', L: 137.5, B: 12.7, fb: 6, fc: [26, 1.4], guns: '54:2/138 46:2/138^2 -46:2/138^2b -58:2/138b', funnels: [[10, 8, 3.4], [-2, 8, 3.4]], blocks: [[34, 26, 13, 3.6, 1]], masts: [[26, 18]] },
};
for (const [name, o] of Object.entries(S)) N[name] = ship(o);
// The Gnevny-class Type 7 keeps its catalogue name, now drawn from its layout: one funnel, two guns fore and aft.
N['type-7-destroyer'] = ship({ cls: 'destroyer', L: 112.8, B: 10.2, fb: 5.4, guns: '44:1/130 37:1/130^2 -38:1/130^2b -48:1/130b', funnels: [[2, 8, 3.6]], blocks: [[28, 22, 12, 3.2, 1]], masts: [[20, 16]] });

export const SHIP_CLASSES: SpecSet = { naval: N };
