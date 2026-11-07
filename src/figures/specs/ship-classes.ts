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
  /** The hull from its own stations, bow to stern (forward position, deck height, half-beam), in place of the default. */
  hull?: [number, number, number][];
  /** Blocks on one side only (front x, back x, top, half-width, side, the front's rake): a deckhouse or crane off the centre line. */
  oneSide?: [number, number, number, number, number, number?][];
  /** More bodies from outlines, mirrored when off the centre line. */
  extra?: Outline[];
  /** Anything else of the spec: decks, ducts, the hull kind. */
  more?: Partial<NavalSpec>;
  /** How round the hull's sections are (default 8, hard-chined; 3-4 a turtle-backed boat). */
  hullRound?: number;
  /** Missile launcher arms (Mk 13, Mk 26, Shtil, Osa-M): x, arms, raised over the deck, facing aft. */
  arms?: [number, number, number?, boolean?][];
  /** Torpedo tube mounts on the centre line aft of the funnels: how many, tubes in each. */
  tt?: [number, number];
}

/** The guns, one mount per word (see `ShipO.guns`), standing on the deck `deck(x)` over the freeboard `fb`. */
function gunsOf(guns: string | undefined, deck: (x: number) => number, fb: number): NavalTurret[] {
  const turrets: NavalTurret[] = [];
  for (const tok of (guns ?? '').split(/\s+/).filter(Boolean)) {
    const g = tok.match(/^(-?[\d.]+)(?:,(-?[\d.]+))?:(\d)\/(\d+)([bmos]*)(?:\^(-?[\d.]+))?([bmos]*)$/);
    if (!g) throw new Error(`bad gun ${tok}`);
    // The flags may stand before or after the raise.
    const m = [g[0], g[1], g[2], g[3], g[4], g[6], g[5] + g[7]];
    const x = +m[1];
    const n = +m[3];
    const cal = +m[4] / 1000;
    // A machine gun's or light cannon's tub is far smaller than a gunhouse.
    const size = cal < 0.05 ? 0.6 + cal * 40 + 0.2 * n : cal < 0.14 ? 2.4 + 0.5 * n : 3 + cal * 22 + (n - 1) * cal * 3;
    // s: a small open mount (a light gun or cannon); o: one side only, not mirrored.
    const small = m[6].includes('s');
    const t: NavalTurret = { x, size: small ? 0.6 + cal * 12 : size, barrels: n, length: small ? 1 + cal * 40 : cal * 50, calibre: cal, up: deck(x) - fb + (m[5] ? +m[5] : 0), back: m[6].includes('b'), kind: m[6].includes('m') ? 'mount' : cal >= 0.2 ? 'box' : 'round' };
    if (m[2] && !m[6].includes('o')) for (const sd of [-1, 1]) turrets.push({ ...t, side: sd * +m[2] });
    else turrets.push(m[2] ? { ...t, side: +m[2] } : t);
  }
  return turrets;
}

/** The barbette under each raised (superfiring) gun, from the deck up to the gunhouse, so no turret floats. */
function barbettes(turrets: NavalTurret[], deck: (x: number) => number, fb: number): Outline[] {
  const out: Outline[] = [];
  for (const t of turrets) {
    const base = deck(t.x);
    const top = fb + (t.up ?? 0);
    if (top - base < 0.3) continue;
    const r = t.size * 0.42;
    out.push({ top: [[t.x + r, top], [t.x - r, top]], bottom: [[t.x + r, base - 0.2], [t.x - r, base - 0.2]], plan: [[t.x + r, 0.1], [t.x + r * 0.7, r * 0.71], [t.x, r], [t.x - r * 0.7, r * 0.71], [t.x - r, 0.1]], round: 10, side: t.side, stations: 6 });
  }
  return out;
}

function ship(o: ShipO): NavalSpec & { cls: string } {
  const base: NavalSpec = { length: o.L, beam: o.B, freeboard: o.fb, sheer: o.sheer, forecastle: o.fc ? { x: o.fc[0], step: o.fc[1] } : undefined, transom: o.transom };
  const hull = o.hull ? hullOf(o.hull, o.hullRound) : defaultHull(base);
  const deck = (x: number) => lerpPoly(hull.top, x);
  const turrets = gunsOf(o.guns, deck, o.fb);
  if (o.tt) {
    // The mounts stand aft of the funnels, one behind the other; the tubes lie over their mount.
    const fx = o.funnels?.length ? Math.min(...o.funnels.map(([x]) => x)) - 5 : 0;
    for (let i = 0; i < o.tt[0]; i++) {
      const x = fx - 8 * i;
      turrets.push({ x: x - 3.4, size: 1.2 + o.tt[1] * 0.25, barrels: o.tt[1], length: 7, calibre: 0.27, kind: 'mount', up: deck(x) - o.fb });
    }
  }
  for (const [x, n, up, back] of o.arms ?? []) turrets.push({ x, size: 2.6, barrels: n, length: 4.4, calibre: 0.3, kind: 'mount', up: deck(x) - o.fb + (up ?? 0), back });
  return {
    cls: o.cls, ...base,
    ...(o.hull ? { hullOutline: hull } : {}),
    bodies: [
      ...(o.blocks ?? []).map(([x0, x1, z1, half, rake]) => blockOf(x0, x1, Math.min(deck(x0), deck(x1)) - 0.2, z1, half, rake ?? 0)),
      // A funnel aft of a forecastle break stands on a casing up from the lower deck.
      ...(o.funnels ?? []).filter(([x]) => deck(x) < o.fb - 0.1).map(([x, , d]) => blockOf(x + d * 0.6, x - d * 0.6, deck(x) - 0.2, o.fb + 0.1, d * 0.6)),
      ...(o.extra ?? []),
    ],
    oneSide: (o.oneSide ?? []).map(([x0, x1, z1, half, side, rake]) => blockOf(x0, x1, Math.min(deck(x0), deck(x1)) - 0.2, z1, half, rake ?? 0, 0, side)),
    funnels: (o.funnels ?? []).map(([x, h, d]) => ({ x, height: h + deck(x) - o.fb, diameter: d })),
    masts: (o.masts ?? []).map(([x, h]) => ({ x, height: h })),
    turrets, launchers: o.launchers?.map((l) => ({ ...l, up: (l.up ?? 0) + deck(l.x) - o.fb })), radars: o.radars, helideck: o.helideck,
    ...o.more,
  };
}

// ---------------------------------------------------------------- modern warships

// Arleigh Burke (Flight IIA): a flared, sheered flush-deck hull; the tall forward deckhouse with its four SPY-1 faces
// and raked bridge; two square stacks; the aft deckhouse with the twin hangars; the raked mast; the 5-inch gun and
// the VLS fore and aft (155.3 x 20.1 m).
N['arleigh-burke'] = {
  cls: 'destroyer', length: 155.3, beam: 20.1, freeboard: 7.2,
  hullOutline: hullOf([[77.65, 9.5, 0.2], [70, 9.0, 3.5], [55, 8.3, 7.8], [35, 7.6, 9.8], [0, 7.2, 10.05], [-45, 6.8, 9.8], [-70, 6.4, 8.6], [-77.65, 6.3, 7.4]]),
  bodies: [blockOf(36, 4, 7.0, 15.5, 7.0, 3.5), blockOf(31, 15, 15.5, 19.5, 5.2, 2), blockOf(6, -1, 7.0, 21, 2.6, 0, 1.2), blockOf(-13, -20, 6.8, 19.5, 2.6, 0, 1.2), blockOf(4, -8, 7.0, 11, 4.2), blockOf(-6, -48, 6.8, 14.5, 7.0, 1.5)],
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
/** Torpedo tube mounts by destroyer class: mounts, tubes in each (published armament; places estimates). */
const TT: Record<string, [number, number]> = {
  'clemson': [2, 3], 'farragut': [2, 4], 'mahan': [3, 4], 'bagley': [2, 4], 'porter': [2, 4], 'somers': [3, 4], 'sumner': [2, 5], 'gearing': [2, 5],
  'raubtier': [2, 3], 'type-1934a': [2, 4], 'type-1936': [2, 4], 'type-1936a': [2, 4], 'type-1936c': [2, 4], 'type-1939': [2, 3],
  'novik': [3, 3], 'opytny': [3, 3], 'type-7u': [2, 3], 'leningrad': [2, 4], 'regele-ferdinand': [2, 3], 'project-30bis': [2, 5], 'project-48': [2, 3], 'kotlin': [2, 5], 'project-41': [2, 5],
  'v-class': [2, 3], 'g-class': [2, 4], 's-class': [2, 4], 'hunt-iii': [1, 2], 'tribal': [1, 4], 'j-class': [2, 5], 'battle': [2, 4], 'daring': [2, 5],
  'momi': [2, 2], 'kamikaze': [2, 2], 'mutsuki': [2, 3], 'hatsuharu': [2, 3], 'shiratsuyu': [2, 4], 'kagero': [2, 4], 'matsu': [1, 4], 'shimakaze': [3, 5],
  'turbine': [2, 3], 'freccia': [2, 3], 'maestrale': [2, 3], 'soldati': [2, 3], 'navigatori': [2, 3], 'leone': [2, 3], 'medaglie-d-oro': [2, 3],
  'bourrasque': [2, 3], 'jaguar-1923': [2, 3], 'guepard': [2, 3], 'le-fantasque': [3, 3], 'mogador': [2, 3],
};
for (const [name, o] of Object.entries(S)) N[name] = ship(TT[name] ? { ...o, tt: TT[name] } : o);
// The Gnevny-class Type 7 keeps its catalogue name, now drawn from its layout: one funnel, two guns fore and aft.
N['type-7-destroyer'] = ship({ cls: 'destroyer', L: 112.8, B: 10.2, fb: 5.4, guns: '44:1/130 37:1/130^2 -38:1/130^2b -48:1/130b', funnels: [[2, 8, 3.6]], blocks: [[28, 22, 12, 3.2, 1]], masts: [[20, 16]] });

// ---------------------------------------------------------------- coastal forces and escorts by class

const C: Record<string, Parameters<typeof ship>[0]> = {
  // Motor torpedo boats and gunboats: a low planing hull, the bridge, guns and torpedo tubes along the sides.
  'elco-80': { cls: 'torpedo-boat', L: 24.4, B: 6.3, fb: 1.6, sheer: 0.6, guns: '6:2/13^0.6 -6,1.8:2/13^0.6 -10:1/40b', blocks: [[5, 1, 2.9, 1.4, 0.6]], masts: [[1, 3]], launchers: [{ x: 2, length: 6, width: 1.2, kind: 'tubes', count: 2, elevation: 0 }] },
  'higgins-78': { cls: 'torpedo-boat', L: 23.8, B: 6.1, fb: 1.5, sheer: 0.5, guns: '7:1/20 -5,1.6:2/13^0.5 -10:1/40b', blocks: [[4, 0, 2.8, 1.5, 0.4]], masts: [[0, 3]], launchers: [{ x: 1, length: 6, width: 1.2, kind: 'tubes', count: 2, elevation: 0 }] },
  'vosper-mtb': { cls: 'torpedo-boat', L: 22.0, B: 5.9, fb: 1.5, sheer: 0.6, guns: '-6:1/20b 4,1.5:2/8^0.4', blocks: [[3, 0, 2.6, 1.3, 0.5]], masts: [[0, 3]], launchers: [{ x: 0, length: 6, width: 1.2, kind: 'tubes', count: 1, elevation: 0 }] },
  'mas-boat': { cls: 'torpedo-boat', L: 18.0, B: 4.7, fb: 1.3, sheer: 0.5, guns: '-5:1/20b', blocks: [[3, -1, 2.3, 1.2, 0.4]], launchers: [{ x: 0, length: 5, width: 1, kind: 'tubes', count: 1, elevation: 0 }] },
  'vtb-boat': { cls: 'torpedo-boat', L: 20.0, B: 4.5, fb: 1.4, sheer: 0.5, guns: '-6:1/20b 3:2/13^0.4', blocks: [[4, 0, 2.5, 1.3, 0.4]], launchers: [{ x: -1, length: 5, width: 1, kind: 'tubes', count: 1, elevation: 0 }] },
  'fairmile-b': { cls: 'patrol-boat', L: 34.1, B: 5.6, fb: 2.2, sheer: 0.8, guns: '10:1/76 -12:1/20b', blocks: [[6, 0, 4.6, 1.8, 0.6]], masts: [[3, 5]] },
  'fairmile-d': { cls: 'torpedo-boat', L: 35.1, B: 6.4, fb: 2.4, sheer: 1.0, guns: '12:1/57 4,2:2/13^1 -10:1/57b', blocks: [[6, 0, 5.0, 2.2, 0.6]], masts: [[2, 5]], launchers: [{ x: -3, length: 6, width: 1.3, kind: 'tubes', count: 2, elevation: 0 }] },
  'r-boot': { cls: 'patrol-boat', L: 37.8, B: 5.8, fb: 2.2, sheer: 0.8, guns: '12:1/20 -12:1/37b', blocks: [[4, -2, 4.4, 2, 0.6]], masts: [[0, 6]], funnels: [[-3, 2, 1.2]] },
  'project-183': { cls: 'torpedo-boat', L: 25.4, B: 6.2, fb: 1.6, sheer: 0.6, guns: '7:2/25 -8:2/25b', blocks: [[4, -2, 3.2, 1.8, 0.5]], masts: [[0, 4]], launchers: [{ x: -2, length: 6, width: 1.2, kind: 'tubes', count: 1, elevation: 0 }] },
  'project-206': { cls: 'torpedo-boat', L: 34.7, B: 6.7, fb: 2.0, sheer: 0.8, guns: '10:2/30m -12:2/30bm', blocks: [[4, -4, 4.0, 2.4, 0.8]], masts: [[0, 5]], launchers: [{ x: 0, length: 6, width: 1.4, kind: 'tubes', count: 2, elevation: 0 }] },
  'type-143-fac': { cls: 'fast-attack-craft', L: 57.6, B: 7.8, fb: 3.2, sheer: 1.0, guns: '22:1/76m -22:1/76bm', blocks: [[12, -6, 7, 3, 1]], masts: [[4, 9]], launchers: [{ x: -12, length: 6, width: 4, kind: 'box' }] },
  'pc-subchaser': { cls: 'patrol-boat', L: 52.9, B: 7.0, fb: 3.2, sheer: 1.0, guns: '18:1/76 -18:1/40b', funnels: [[-2, 3.5, 1.8]], blocks: [[10, 2, 6.5, 2.2, 0.8]], masts: [[6, 10]] },
  // Corvettes, sloops, escorts and frigates.
  'flower-corvette': { cls: 'corvette', L: 62.5, B: 10.1, fb: 4.4, sheer: 1.8, fc: [12, 1.6], guns: '24:1/102 -24:1/40^1.5b', funnels: [[0, 6, 2.2]], blocks: [[16, 8, 9, 3, 1]], masts: [[11, 14]] },
  'aviso-elan': { cls: 'corvette', L: 78.3, B: 8.7, fb: 4.2, sheer: 1.5, fc: [10, 1.2], guns: '28:1/100 -28:1/100b', funnels: [[0, 5, 2.4]], blocks: [[18, 6, 9, 2.8, 1]], masts: [[12, 12]] },
  'gabbiano-corvette': { cls: 'corvette', L: 64.4, B: 8.7, fb: 4.0, sheer: 1.5, guns: '24:1/100 -26:1/20b', funnels: [[0, 4, 2.2]], blocks: [[16, 4, 8, 2.8, 1]], masts: [[8, 12]] },
  'hiburi-kaibokan': { cls: 'corvette', L: 78.8, B: 9.1, fb: 4.4, sheer: 1.5, fc: [10, 1.2], guns: '28:1/120 -24:2/120^1.5b', funnels: [[-6, 5, 2.4]], blocks: [[16, 4, 9, 3, 1]], masts: [[10, 12]] },
  'ciclone-tb': { cls: 'torpedo-boat', L: 87.8, B: 9.9, fb: 4.6, sheer: 1.5, fc: [14, 1.3], guns: '34:1/100 -30:1/100^1.5b -40:1/100b', funnels: [[2, 5, 2.6]], blocks: [[22, 12, 10, 3, 1]], masts: [[16, 14]] },
  'river-frigate': { cls: 'frigate', L: 91.9, B: 11.1, fb: 5, sheer: 1.8, fc: [8, 1.4], guns: '36:2/102 -36:1/102b', funnels: [[2, 6, 2.6]], blocks: [[24, 12, 11, 3.5, 1]], masts: [[16, 16]] },
  'buckley-de': { cls: 'frigate', L: 93.3, B: 11.3, fb: 5, sheer: 1.5, guns: '36:1/76 30:1/76^1.5 -36:1/76b', funnels: [[2, 5, 2.8]], blocks: [[24, 14, 11, 3.5, 1]], masts: [[16, 16]] },
  'koln-frigate': { cls: 'frigate', L: 109.9, B: 11.0, fb: 5.5, sheer: 2, guns: '42:1/100m 30:1/100^1.5m -32:1/100^1.5bm -42:1/100bm', funnels: [[6, 5, 3], [-8, 5, 3]], blocks: [[26, 14, 12, 4, 1], [-2, -18, 10, 4]], masts: [[12, 16]] },
};
for (const [name, o] of Object.entries(C)) N[name] = ship(o);

// ---------------------------------------------------------------- carriers and big-deck amphibious ships

interface CarrierO {
  cls: string;
  /** Hull length and beam on the waterline; the flight deck's top above the water. */
  L: number;
  B: number;
  deck: number;
  /** The flight deck's outline round it, (forward, side), starboard positive: the angled deck, sponsons and lifts. */
  plan: P2[];
  /** Island blocks: front x, back x, top above the water, side of its middle, half-width, the front's rake. */
  island: [number, number, number, number, number, number?][];
  /** Masts: x, height over the flight deck, side. */
  masts?: [number, number, number][];
  radars?: NavalSpec['radars'];
  turrets?: NavalTurret[];
  /** A ski-jump ramp: front x, back x, its lip over the deck, side of its middle, half-width. */
  ramp?: [number, number, number, number, number];
  /** The hull's middle forward of the deck's (a deck overhanging the stern more than the bow). */
  shift?: number;
  more?: Partial<NavalSpec>;
}

function carrier(o: CarrierO): NavalSpec & { cls: string } {
  const fb = o.deck - 1;
  const base: NavalSpec = { length: o.L, beam: o.B, freeboard: fb, sheer: 0.8, transom: 0.8, hull: 'carrier' };
  const h = defaultHull(base);
  const dx = o.shift ?? 0;
  const mv = (p: P2[]) => p.map(([x, v]) => [x + dx, v] as P2);
  const oneSide = o.island.map(([x0, x1, z1, side, half, rake]) => blockOf(x0, x1, fb + 0.9, z1, half, rake ?? 0, 0, side));
  if (o.ramp) {
    const [x0, x1, lip, side, half] = o.ramp;
    oneSide.push({ top: [[x0, o.deck + lip], [x0 - (x0 - x1) * 0.4, o.deck + lip * 0.45], [x1, o.deck]], bottom: [[x0, fb], [x1, fb]], plan: [[x0, half], [x1, half]], side, round: 12, stations: 8 });
  }
  return {
    cls: o.cls, ...base,
    hullOutline: { ...h, top: mv(h.top), bottom: mv(h.bottom), plan: mv(h.plan) },
    decks: [{ plan: o.plan, up: fb + 0.5, thickness: 1 }],
    oneSide,
    masts: (o.masts ?? []).map(([x, height, side]) => ({ x, height, side })),
    radars: o.radars, turrets: o.turrets,
    ...o.more,
  };
}

/** Guns standing at the height `z` (a gallery, a sponson) on a ship of freeboard `fb`, by the gun words of `ShipO.guns`. */
const level = (guns: string, z: number, fb: number) => gunsOf(guns, () => z, fb);

// Nimitz: the angled deck to port, three lifts to starboard and one to port aft, the island between the second and
// third lift with its mast and the radar mast aft of it (332.8 m long, 40.8 m beam on the waterline, 76.8 m over the
// flight deck; about 100,000 t full load).
N['nimitz-carrier'] = carrier({
  cls: 'carrier', L: 326, B: 40.8, deck: 19.5,
  plan: [[166.4, -9], [166.4, 9], [150, 17], [120, 22], [60, 22], [60, 32], [39, 32], [39, 22], [32, 22], [32, 32], [11, 32], [11, 22], [-50, 22], [-50, 32], [-71, 32], [-71, 22], [-150, 22], [-166.4, 17], [-166.4, -17], [-140, -22], [-126, -24.5], [-126, -37], [-105, -37], [-105, -27], [40, -46], [62, -44], [95, -30], [130, -20]],
  island: [[-2, -40, 33, 18, 4.5, 1], [-6, -34, 39, 18, 3.8, 1], [-10, -26, 43.5, 18.4, 3, 1.5]],
  masts: [[-20, 40, 18.5], [-47, 24, 19.5]],
  radars: [{ x: -21, up: 30, kind: 'panel', size: 5, side: 18.5 }, { x: -47, up: 20, kind: 'array', size: 7, side: 19.5 }],
});
// Gerald R. Ford: the same hull, a smaller, taller island 43 m further aft with its fixed array faces, two lifts
// forward of it to starboard, none aft, one to port (337 m long, 41 m beam on the waterline, 78 m over the flight deck;
// about 100,000 t).
N['ford-carrier'] = carrier({
  cls: 'carrier', L: 330, B: 41, deck: 19.5,
  plan: [[168.5, -10], [168.5, 10], [150, 18], [120, 23], [44, 23], [44, 33], [23, 33], [23, 23], [12, 23], [12, 33], [-9, 33], [-9, 23], [-152, 23], [-168.5, 17], [-168.5, -17], [-140, -23], [-128, -25], [-128, -38], [-107, -38], [-107, -27.5], [38, -47], [66, -45], [92, -33], [130, -21]],
  island: [[-46, -78, 34, 19, 4.5, 1], [-49, -74, 41, 19, 3.8, 1], [-54, -70, 49.5, 19.2, 3.2]],
  masts: [[-62, 37, 19.2]],
  radars: [{ x: -61, up: 23, kind: 'faces', size: 4.5, side: 19 }],
});
// Forrestal: the first angled-deck supercarrier; the island forward of the middle, one lift ahead of it, two aft of it,
// the port lift at the forward end of the angled deck (325 m long as modernised, 39.5 m beam on the waterline, 76.8 m
// over the flight deck; 81,000 t).
N['forrestal'] = carrier({
  cls: 'carrier', L: 318, B: 39.5, deck: 18.5,
  plan: [[162.5, -8], [162.5, 8], [145, 16], [115, 21], [50, 21], [50, 31], [29, 31], [29, 21], [-18, 21], [-18, 31], [-39, 31], [-39, 21], [-46, 21], [-46, 31], [-67, 31], [-67, 21], [-148, 21], [-162.5, 16], [-162.5, -16], [-130, -22], [20, -40], [20, -50], [41, -50], [41, -40], [62, -36], [100, -24], [130, -16]],
  island: [[20, -12, 31, 17.5, 4.2, 1], [16, -6, 37, 17.8, 3.4, 1.5]],
  masts: [[2, 32, 18]],
  radars: [{ x: 2, up: 25, kind: 'array', size: 8, side: 18 }],
});
// Admiral Kuznetsov: the ski-jump bow, the angled deck, the long island to starboard between two lifts with its mast
// and dome (305 m long, 270 m on the waterline, 35 m beam on the waterline, 72 m over the flight deck; 58,500 t full).
N['kuznetsov'] = carrier({
  cls: 'carrier', L: 292, B: 35, deck: 17, shift: 6,
  plan: [[152.5, -10], [152.5, 10], [130, 16], [100, 20], [45, 20], [45, 30], [30, 30], [30, 20], [-48, 20], [-48, 30], [-63, 30], [-63, 20], [-140, 20], [-152.5, 15], [-152.5, -15], [-120, -22], [30, -38], [60, -37], [90, -24], [120, -15]],
  ramp: [152.5, 100, 6, -1, 12],
  island: [[14, -38, 30, 17.5, 5, 1], [8, -30, 38, 17.5, 4, 2], [0, -18, 47, 17.8, 3, 1]],
  masts: [[-8, 38, 17.8]],
  radars: [{ x: -8, up: 31, kind: 'array', size: 6, side: 17.8 }, { x: -8, up: 39, kind: 'dome', size: 3.5, side: 17.8 }],
});
// Essex: a straight deck ending short of the open bow, the island on the starboard edge with its big raked funnel, the
// four twin 5-inch turrets fore and aft of it, the port deck-edge lift (270.7 m long, 28.3 m beam on the waterline;
// 36,380 t full).
N['essex'] = carrier({
  cls: 'carrier', L: 266, B: 28.3, deck: 16, shift: 2,
  plan: [[126, -10], [126, 10], [120, 16.5], [-130, 16.5], [-137, 14], [-137, -14], [-130, -16.5], [-10, -16.5], [-10, -27], [8, -27], [8, -16.5], [120, -16.5]],
  island: [[48, -48, 17.5, 17.2, 2.8], [22, -22, 27, 17.2, 3.2, 1], [16, -2, 31, 17.3, 2.6, 1], [-4, -20, 34, 17.3, 3.6, 3]],
  masts: [[6, 26, 17.3]],
  turrets: level('42,17.2:2/127o 33,17.2:2/127^3o -33,17.2:2/127^3bo -42,17.2:2/127bo', 16, 15),
});
// Yorktown: a straight deck open at bow and stern, a compact island with the funnel built in and a tripod mast, the
// 5-inch singles in galleries at the deck's four corners (251.4 m long, 25.4 m beam on the waterline; 25,500 t full).
N['yorktown'] = carrier({
  cls: 'carrier', L: 245, B: 25.4, deck: 15,
  plan: [[116, -9], [116, 9], [110, 13], [-118, 13], [-125, 11], [-125, -11], [-118, -13], [110, -13]],
  island: [[12, -18, 22, 14.8, 2.8, 1], [8, -4, 26, 14.8, 2.4, 1], [-4, -18, 31, 14.9, 3.4, 3]],
  masts: [[4, 24, 14.8]],
  turrets: level('100,13.8:1/127 92,13.8:1/127 -102,13.8:1/127b -110,13.8:1/127b', 13, 14),
  more: { bodies: [blockOf(105, 87, 11.5, 13, 2.2, 0, 0, 13.4), blockOf(-97, -115, 11.5, 13, 2.2, 0, 0, 13.4)] },
});
// Shokaku: a long flight deck, a small island well forward to starboard, the two funnels curving down and out over the
// starboard side amidships, twin 12.7 cm mounts in sponsons along both sides (257.5 m long, 26 m beam on the
// waterline; 32,105 t full).
N['shokaku'] = carrier({
  cls: 'carrier', L: 254, B: 26, deck: 15,
  plan: [[110, -10], [110, 10], [100, 14.5], [-122, 14.5], [-130, 12], [-130, -12], [-122, -14.5], [100, -14.5]],
  island: [[52, 42, 22, 15.3, 2.6, 1], [50, 44, 25, 15.3, 2.0]],
  masts: [[46, 16, 15.3]],
  turrets: level('86,14.5:2/127 70,14.5:2/127 -62,14.5:2/127b -80,14.5:2/127b', 12.5, 14),
  more: { bodies: [blockOf(91, 65, 11, 12.5, 2.4, 0, 0, 14), blockOf(-57, -85, 11, 12.5, 2.4, 0, 0, 14)] },
});
N['shokaku'].oneSide!.push(blockOf(7, 1, 4.5, 10.5, 2.6, 0, 0, 15), blockOf(-3, -9, 4.5, 10.5, 2.6, 0, 0, 15), blockOf(6, 2, 4.5, 6.5, 2.0, 0, 0, 18), blockOf(-4, -8, 4.5, 6.5, 2.0, 0, 0, 18));
// Invincible: the ski jump at the port bow, the Sea Dart launcher on the forecastle beside it, the long island with two
// funnels and two masts, the flight deck offset to port (209.1 m long, 27.5 m beam on the waterline, 36 m over the
// deck; 22,000 t full).
N['invincible'] = carrier({
  cls: 'carrier', L: 206, B: 27.5, deck: 14,
  plan: [[100, -12], [100, -1], [72, 6], [45, 10], [-95, 10], [-104.5, 9], [-104.5, -14], [-80, -17], [60, -17], [85, -14]],
  ramp: [101, 76, 4, -6, 6],
  island: [[42, -56, 23, 13.8, 3.6, 1], [36, 20, 28, 13.8, 3.0, 1.5], [13, 2, 30, 13.8, 2.6], [-22, -34, 30, 13.8, 2.6], [-4, -14, 26, 13.8, 2.2]],
  masts: [[28, 26, 13.8], [-9, 22, 13.8]],
  radars: [{ x: 28, up: 21, kind: 'array', size: 7, side: 13.8 }, { x: -9, up: 18, kind: 'array', size: 4, side: 13.8 }],
  turrets: [{ x: 86, side: 6, size: 3.4, barrels: 2, length: 3.6, calibre: 0.3, kind: 'mount', up: 0 }],
});
// Colossus class as ARA Veinticinco de Mayo: a light carrier with an angled deck added, a small island with its raked
// funnel and the lattice mast with the big search radar (211.8 m long, 24.5 m beam on the waterline; 19,900 t full).
N['colossus'] = carrier({
  cls: 'carrier', L: 206, B: 24.5, deck: 13, shift: 2,
  plan: [[104, -9], [104, 9], [96, 11.5], [-100, 11.5], [-106, 10], [-106, -11], [-60, -13], [40, -20], [60, -18], [90, -11]],
  island: [[18, -12, 21, 13, 2.8, 1], [14, 2, 25, 13, 2.2, 1], [0, -12, 28, 13.1, 2.6, 2.5]],
  masts: [[6, 24, 13]],
  radars: [{ x: 6, up: 21, kind: 'array', size: 7, side: 13 }],
});
// Tarawa (LHA): a full-length straight flight deck on a slab-sided hull, the big island to starboard with two masts,
// the 5-inch guns on sponsons at the forward corners and one aft, the port side lift (254 m long, 32.3 m beam; 39,400 t
// full).
N['tarawa'] = carrier({
  cls: 'amphibious', L: 250, B: 32.3, deck: 20, shift: -2,
  plan: [[118, -10], [118, 10], [105, 16], [-127, 16], [-127, -16], [-42, -16], [-42, -23], [-25, -23], [-25, -16], [105, -16]],
  island: [[28, -36, 30, 11.5, 4.5, 1], [20, -22, 36, 11.8, 3.5, 1.5], [12, 0, 40, 11.8, 2.6]],
  masts: [[14, 34, 11.8], [-24, 26, 12]],
  radars: [{ x: 14, up: 26, kind: 'array', size: 6, side: 11.8 }, { x: -24, up: 20, kind: 'dish', size: 4, side: 12 }],
  turrets: level('108,12:1/127m', 15, 19).concat(level('-112,-12:1/127mbo', 15, 19)),
  more: { bodies: [blockOf(112, 103, 13.5, 15, 4, 0, 0, 10), blockOf(-107, -117, 13.5, 15, 4, 0, 0, 10)] },
});

// ---------------------------------------------------------------- submarines by class

interface SubO {
  cls: string;
  L: number;
  /** The hull's diameter. */
  D: number;
  /** The hull's axis below the waterline as a share of its diameter (default 0.1). */
  sink?: number;
  /** The rounded bow's and the tapering stern's lengths as shares of the length. */
  bow?: number;
  tail?: number;
  /** The sail: front x, back x, its top over the water, half-width; how far its front and its back slope. */
  sail: [number, number, number, number, number?, number?];
  /** Planes on the sail: their span from the centre line, and their height up the sail as a share of it. */
  sailPlanes?: [number, number];
  /** Bow planes: x, span from the centre line. */
  bowPlanes?: [number, number];
  /** The stern's cross of fins: span from the axis, chord; with plates at the planes' tips. */
  fins: [number, number, boolean?];
  /** A pod on the upper rudder: length, diameter. */
  pod?: [number, number];
  /** A raised deck aft of the sail (the missile compartment): front x, back x, its rise over the hull. */
  hump?: [number, number, number];
  /** More bodies (a stepped sail, a casing). */
  extra?: Outline[];
}

/** A modern submarine: a round hull awash, its sail, planes and the cross of fins at the stern. */
function sub(o: SubO): NavalSpec & { cls: string } {
  const R = o.D / 2;
  const h = o.L / 2;
  const z0 = -(o.sink ?? 0.1) * o.D;
  const nose = (o.bow ?? 0.1) * o.L;
  const tail = (o.tail ?? 0.3) * o.L;
  const rad: P2[] = [];
  for (const u of [0, 0.08, 0.2, 0.4, 0.6, 0.8, 1]) rad.push([h - nose * u, R * Math.max(0.06, Math.sqrt(1 - (1 - u) ** 2))]);
  for (const v of [0, 0.2, 0.4, 0.6, 0.8, 0.92, 1]) rad.push([-h + tail * (1 - v), R * (1 - 0.92 * v ** 1.6)]);
  const top = rad.map(([x, r]) => [x, z0 + r] as P2);
  if (o.hump) {
    const [a, b, rise] = o.hump;
    const at = (x: number) => z0 + lerpPoly(rad, x);
    const keep = top.filter(([x]) => x > a + 3 || x < b - 3);
    keep.push([a + 3, at(a + 3)], [a, at(a) + rise], [b, at(b) + rise], [b - 3, at(b - 3)]);
    top.splice(0, top.length, ...keep.sort((p, q) => q[0] - p[0]));
  }
  const hullOutline: Outline = { top, bottom: rad.map(([x, r]) => [x, z0 - r] as P2), plan: rad, round: 2.2, stations: 28 };
  const [s0, s1, st, sw, fr, ar] = o.sail;
  const sb = z0 + lerpPoly(rad, (s0 + s1) / 2) * 0.8;
  const sail: Outline = {
    top: [[s0, sb + (fr ?? 0) * 0.1], [s0 - (fr ?? 0), st], [s1 + (ar ?? 0), st], [s1, sb + (ar ? 0.3 : st - sb)]],
    bottom: [[s0, sb], [s1, sb]],
    plan: [[s0, sw * 0.3], [s0 - Math.min(2, (s0 - s1) * 0.2), sw], [s1 + Math.min(2, (s0 - s1) * 0.2), sw], [s1, sw * (ar ? 0.3 : 0.6)]],
    round: 3.5, stations: 10,
  };
  const bodies: Outline[] = [sail, ...(o.extra ?? [])];
  const flat = (x0: number, x1: number, z: number, span: number, t = 0.25): Outline => ({ top: [[x0, z + t], [x1, z + t]], bottom: [[x0, z - t], [x1, z - t]], plan: [[x0, span * 0.85], [x0 - (x0 - x1) * 0.35, span], [x1, span]], round: 6, stations: 4 });
  if (o.sailPlanes) {
    const [span, share] = o.sailPlanes;
    const c = Math.min(4, (s0 - s1) * 0.3);
    bodies.push(flat(s0 - 1, s0 - 1 - c, sb + (st - sb) * share, span, 0.35));
  }
  if (o.bowPlanes) bodies.push(flat(o.bowPlanes[0], o.bowPlanes[0] - 2.5, z0 + R * 0.35, o.bowPlanes[1], 0.2));
  // The stern's cross: planes level with the axis and the rudders above and below it.
  const [span, chord, plates] = o.fins;
  const xa = -h + chord * 1.4;
  const xb = xa - chord;
  bodies.push({ top: [[xa, z0 + 0.25], [xb, z0 + 0.25]], bottom: [[xa, z0 - 0.25], [xb, z0 - 0.25]], plan: [[xa, R * 0.4], [xa - chord * 0.5, span], [xb, span]], round: 6, stations: 6 });
  bodies.push({ top: [[xa, z0 + R * 0.4], [xa - chord * 0.5, z0 + span], [xb, z0 + span]], bottom: [[xa, z0 - R * 0.4], [xa - chord * 0.5, z0 - span], [xb, z0 - span]], plan: [[xa, 0.25], [xb, 0.25]], round: 6, stations: 6 });
  if (plates) bodies.push({ top: [[xa - chord * 0.45, z0 + span * 0.3], [xb, z0 + span * 0.3]], bottom: [[xa - chord * 0.45, z0 - span * 0.3], [xb, z0 - span * 0.3]], plan: [[xa - chord * 0.45, 0.2], [xb, 0.2]], round: 6, stations: 2, side: span });
  if (o.pod) {
    const [pl, pd] = o.pod;
    const p0 = xa - chord * 0.25;
    const zp = z0 + span;
    bodies.push({ top: [[p0, zp + pd * 0.2], [p0 - 1.5, zp + pd * 0.5], [p0 - pl + 1, zp + pd * 0.5], [p0 - pl, zp + pd * 0.1]], bottom: [[p0, zp - pd * 0.2], [p0 - 1.5, zp - pd * 0.5], [p0 - pl + 1, zp - pd * 0.5], [p0 - pl, zp - pd * 0.1]], plan: [[p0, 0.3], [p0 - 1.5, pd / 2], [p0 - pl + 1, pd / 2], [p0 - pl, 0.3]], round: 2.2, stations: 8 });
  }
  return { cls: o.cls, length: o.L, beam: o.D, freeboard: 0, hull: 'submarine', hullOutline, bodies };
}

// Los Angeles (688): a long cylinder, the sail well forward with its planes, the cross of stern planes with small end
// plates (109.7 m long, 10.1 m beam; 6,927 t submerged).
N['los-angeles'] = sub({ cls: 'submarine', L: 109.7, D: 10.1, sail: [33, 22, 10.6, 1.4, 1, 0], sailPlanes: [4.8, 0.62], fins: [5.6, 5, true] });
// Virginia: the sail with its fillet at the foot, no sail planes but bow planes low forward, the cross of stern
// planes (114.9 m long, 10.4 m beam; 7,800 t submerged).
N['virginia'] = sub({ cls: 'submarine', L: 114.9, D: 10.4, sail: [31, 20, 10.4, 1.5, 2.5, 0], bowPlanes: [44, 4.4], fins: [5.6, 5.4, true] });
// Ohio: very long, the sail forward with its planes, the raised flat missile deck aft of it, the cross of fins with
// plates (170.7 m long, 12.8 m beam; 18,750 t submerged).
N['ohio'] = sub({ cls: 'submarine', L: 170.7, D: 12.8, sail: [52, 38, 13.2, 1.6, 1, 0], sailPlanes: [5.6, 0.6], hump: [37, -34, 0.9], fins: [7, 6.5, true], tail: 0.24 });
// Akula (Project 971): the long, low sail blending aft into the casing, the big pod on the upper rudder, the planes in
// the bow drawn in (110.3 m long, 13.6 m beam; 12,770 t submerged).
N['akula'] = sub({ cls: 'submarine', L: 110.3, D: 13.6, sink: 0.12, sail: [20, -8, 11.5, 2.2, 2, 9], fins: [6.4, 6, false], pod: [8, 2.6], hump: [26, -30, 0.6] });
// Type 093 (Shang): the sail with planes, the hump aft of it, the cross of fins (110 m long, 11 m beam; about 7,000 t
// submerged, estimate).
N['type-093'] = sub({ cls: 'submarine', L: 110, D: 11, sail: [30, 19, 11.2, 1.6, 1.5, 0], sailPlanes: [5, 0.6], hump: [18, -10, 1.1], fins: [6, 5.4, false] });
// Tango (Project 641B): a long high casing over the hull, the long stepped sail, the stern planes (90.2 m long,
// 9.1 m beam; 3,800 t submerged).
N['tango'] = sub({
  cls: 'submarine', L: 90.2, D: 9.1, sink: 0.05, bow: 0.12, sail: [18, -2, 9.4, 1.5, 1.5, 1.5], fins: [5, 4.5, false], hump: [40, -30, 1.2],
  extra: [{ top: [[17, 9], [16, 10.4], [9, 10.4], [8, 9]], bottom: [[17, 8.5], [8, 8.5]], plan: [[17, 0.5], [15, 1.3], [9, 1.2], [8, 0.5]], round: 3, stations: 6 }],
});

// ---------------------------------------------------------------- Second World War submarines by class

interface WSubO {
  cls: string;
  L: number;
  B: number;
  /** The casing deck's height over the water. */
  fb: number;
  /** The conning tower: front x, back x, its top, half-width. */
  tower: [number, number, number, number];
  /** Platforms on or by the tower (gun decks, the cut-down bridge): front x, back x, top, half-width. */
  steps?: [number, number, number, number][];
  guns?: string;
  /** A rounded, streamlined (GUPPY) bow instead of a ship's stem. */
  round?: boolean;
  /** Bow planes: x, span. */
  planes?: [number, number];
}

/** A submarine of the 1910s-50s on the surface: the pressure hull under a flat casing, the ship's bow, the tower. */
function wsub(o: WSubO): NavalSpec & { cls: string } {
  const h = o.L / 2;
  const b = o.B / 2;
  const L = o.L;
  const fb = o.fb;
  const hullOutline: Outline = {
    top: [[h, o.round ? fb * 0.75 : fb * 1.08], [h - L * 0.05, fb * 1.02], [h - L * 0.2, fb], [-h + L * 0.2, fb * 0.97], [-h + L * 0.07, fb * 0.75], [-h, fb * 0.45]],
    bottom: [[h, o.round ? 0 : fb * 0.55], [h - L * 0.06, -b * 0.6], [h - L * 0.2, -b * 0.95], [-h + L * 0.25, -b * 0.95], [-h + L * 0.06, -b * 0.35], [-h, fb * 0.15]],
    plan: [[h, o.round ? b * 0.25 : 0.1], [h - L * 0.08, b * 0.55], [h - L * 0.25, b], [-h + L * 0.3, b * 0.95], [-h + L * 0.1, b * 0.5], [-h, 0.15]],
    round: 3, stations: 26,
  };
  const [t0, t1, tt, tw] = o.tower;
  const bodies: Outline[] = [
    { top: [[t0, fb], [t0 - 1.2, tt], [t1 + 0.6, tt], [t1, fb]], bottom: [[t0, fb - 0.2], [t1, fb - 0.2]], plan: [[t0, tw * 0.35], [t0 - 2, tw], [t1 + 1, tw], [t1, tw * 0.5]], round: 3, stations: 10 },
    ...(o.steps ?? []).map(([x0, x1, z, w]) => blockOf(x0, x1, fb - 0.2, z, w)),
    // The stern planes and the rudder.
    { top: [[-h + 3, fb * 0.1 + 0.15], [-h + 0.5, fb * 0.1 + 0.15]], bottom: [[-h + 3, fb * 0.1 - 0.15], [-h + 0.5, fb * 0.1 - 0.15]], plan: [[-h + 3, b * 0.5], [-h + 0.5, b * 0.9]], round: 6, stations: 2 },
  ];
  if (o.planes) bodies.push({ top: [[o.planes[0], 0.6], [o.planes[0] - 2, 0.6]], bottom: [[o.planes[0], 0.4], [o.planes[0] - 2, 0.4]], plan: [[o.planes[0], o.planes[1]], [o.planes[0] - 2, o.planes[1]]], round: 4, stations: 2 });
  return { cls: o.cls, length: L, beam: o.B, freeboard: fb, hull: 'submarine', hullOutline, bodies, turrets: gunsOf(o.guns, () => fb, fb) };
}

// Gato: the fleet boat's long casing, the cut-down tower with gun platforms fore and aft, the 3-inch gun aft of it
// (95 m long, 8.3 m beam; 2,460 t submerged).
N['gato'] = wsub({ cls: 'submarine', L: 95, B: 8.3, fb: 2.4, tower: [7, -9, 6.6, 1.3], steps: [[9, 6, 5.0, 1.0], [-8, -12, 5.0, 1.1]], guns: '-17:1/76 10:1/20^2.6s -10:1/20^2.6bs', planes: [40, 3.6] });
// Balao: the same hull, built deeper, its 5-inch gun forward of the tower and 40 mm guns on the platforms (95 m long,
// 8.3 m beam; 2,463 t submerged).
N['balao'] = wsub({ cls: 'submarine', L: 95, B: 8.3, fb: 2.4, tower: [6, -8, 6.4, 1.3], steps: [[9, 5, 5.0, 1.2], [-7, -13, 5.0, 1.2]], guns: '16:1/127 7:1/40^2.6s -10:1/40^2.6bs', planes: [40, 3.6] });
// GUPPY II as ARA Santa Fe: the fleet boat streamlined, the rounded bow, the stepped fin sail, no guns (93.6 m long,
// 8.2 m beam; 2,420 t submerged).
N['guppy-ii'] = wsub({ cls: 'submarine', L: 93.6, B: 8.2, fb: 2.2, round: true, tower: [9, -10, 7.2, 1.4], steps: [[2, -9, 9.0, 1.1]] });
// Type IIB: a small coastal boat, the tower with a 20 mm gun on its platform (42.7 m long, 4.1 m beam; 414 t
// submerged).
N['type-iib'] = wsub({ cls: 'submarine', L: 42.7, B: 4.1, fb: 1.5, tower: [3, -3, 4.2, 0.8], steps: [[-2, -4.5, 3.4, 0.8]], guns: '-3.5:1/20^1.9bs' });
// Shch (Series X): the streamlined "limousine" tower with a 45 mm gun at each end (58.8 m long, 6.2 m beam; 704 t
// submerged).
N['shchuka'] = wsub({ cls: 'submarine', L: 58.8, B: 6.2, fb: 2.0, tower: [7, -7, 5.4, 1.1], steps: [[9, 6, 3.6, 1.0], [-6, -9, 3.6, 1.0]], guns: '7.5:1/45^1.6 -7.5:1/45^1.6b' });

// ---------------------------------------------------------------- modern surface combatants by class
// Gun words as in `ShipO.guns`; a Phalanx, AK-630 or Goalkeeper is a small `m` mount of 20-30 mm.

const M: Record<string, ShipO> = {
  // Ticonderoga: the Spruance hull with its sheer, the two tall deckhouses each with two SPY-1 faces, a pair of square
  // stacks in each, two masts, the 5-inch gun and VLS at each end (172.8 x 16.8 m; 9,800 t full).
  'ticonderoga': {
    cls: 'cruiser', L: 172.8, B: 16.8, fb: 7, sheer: 3.5, transom: 0.6,
    guns: '64:1/127m -68:1/127mb 30,4.5:1/20m^9.5 -36,4.5:1/20m^8',
    blocks: [[42, 6, 17, 7, 2.5], [36, 16, 21.5, 5, 1.5], [4, -4, 21, 2.6], [-6, -40, 15.5, 6.8, 1], [-10, -24, 19.5, 5.2], [-24, -32, 22, 2.6]],
    masts: [[14, 31], [-17, 25]],
    launchers: [{ x: 51, length: 10, width: 7 }, { x: -55, length: 10, width: 7 }],
    radars: [{ x: 29, up: 10.5, kind: 'faces', size: 3.8 }, { x: -16, up: 9, kind: 'faces', size: 3.8 }, { x: 14, up: 24, kind: 'array', size: 5 }],
  },
  // Oliver Hazard Perry: the long box superstructure, the Mk 13 arm on the forecastle, the 76 mm gun on the roof aft of
  // the single square stack, the lattice mast with its big search array, twin hangars and the flight deck (135.6 x
  // 13.7 m; 4,100 t full).
  'oliver-hazard-perry': {
    cls: 'frigate', L: 135.6, B: 13.7, fb: 6.2, sheer: 2.6, transom: 0.7,
    guns: '-14:1/76m^7 -34:1/20m^7',
    arms: [[47, 1, 0.4]],
    blocks: [[36, -42, 13, 6.2, 1.5], [36, 24, 16, 4.8, 1.5], [26, 20, 19, 1.6], [2, -6, 19.5, 2.6, 1.5], [-20, -24, 17.5, 1.5]],
    masts: [[16, 26]],
    radars: [{ x: 16, up: 23, kind: 'array', size: 6.5 }, { x: 23, up: 13.6, kind: 'dome', size: 2.4 }, { x: -22, up: 12.4, kind: 'dome', size: 2.2 }],
    helideck: true,
  },
  // Leander (gun-armed): the twin 4.5-inch turret forward, the bridge, the lattice foremast, the single capped funnel,
  // the big double-bedstead radar aft of it, the hangar with Seacat on its roof and the flight deck (113.4 x 12.5 m;
  // 2,860 t full).
  'leander-frigate': {
    cls: 'frigate', L: 113.4, B: 12.5, fb: 5.6, sheer: 3, transom: 0.6,
    guns: '36:2/114 -30:4/40m^6',
    funnels: [[-2, 7.5, 4.8]],
    blocks: [[28, 12, 12.5, 4.6, 1.5], [25, 17, 15, 3.4, 1], [8, -16, 10, 4.4], [-20, -36, 11.2, 5]],
    masts: [[10, 22], [-12, 19]],
    radars: [{ x: 10, up: 17, kind: 'array', size: 3.5 }, { x: -12, up: 19, kind: 'array', size: 7 }],
    helideck: true,
  },
  // Type 23 (Duke): the 4.5-inch Mk 8 forward, the Sea Wolf silo, the Harpoon launchers across the deck before the
  // bridge, the faceted superstructure with the foremast tower and the exhaust mack, the hangar and flight deck
  // (133 x 16.1 m; 4,900 t full).
  'type-23': {
    cls: 'frigate', L: 133, B: 16.1, fb: 7, sheer: 3, transom: 0.7,
    guns: '50:1/114m -26,5:1/30m^7',
    blocks: [[31, -40, 12.5, 7.4, 1.5], [30, 16, 15.5, 6, 2], [17, 8, 24, 2.6, 1.5], [-4, -14, 18, 3.6, 1], [-24, -40, 14, 6.4]],
    masts: [[12, 22], [-10, 18]],
    launchers: [{ x: 41, length: 7, width: 6 }, { x: 34, length: 3, width: 9, kind: 'box' }],
    radars: [{ x: 12, up: 18, kind: 'array', size: 5 }, { x: -10, up: 13, kind: 'dish', size: 2 }],
    helideck: true,
  },
  // Type 45 (Daring): the 4.5-inch gun, the Sylver silo, the tall faceted foremast with SAMPSON on top, the wide
  // superstructure, the big funnel, the aft mast with its long search array, the hangar and flight deck (152.4 x
  // 21.2 m; 8,500 t full).
  'type-45': {
    cls: 'destroyer', L: 152.4, B: 21.2, fb: 7.5, sheer: 3.5, transom: 0.7,
    guns: '57:1/114m',
    blocks: [[36, -46, 15.5, 9.4, 2], [34, 20, 19.5, 7, 2.5], [22, 6, 30, 4.4, 3], [17, 10, 36.5, 2.2, 1], [-2, -18, 23.5, 4.2, 1], [-6, -14, 27, 2.8], [-30, -46, 16.5, 8]],
    masts: [[-10, 19]],
    launchers: [{ x: 45, length: 10, width: 8 }],
    radars: [{ x: 13.5, up: 30.5, kind: 'panel', size: 4.5 }, { x: -10, up: 18, kind: 'array', size: 7 }],
    helideck: true,
  },
  // Kirov (Pyotr Velikiy): the long forecastle with the S-300F and Granit silos, the massive superstructure with its two
  // macks (combined masts and stacks), the big back-to-back array forward, the twin 130 mm aft (252 x 28.5 m; 28,000 t full).
  'kirov': {
    cls: 'cruiser', L: 252, B: 28.5, fb: 9, sheer: 4.5, transom: 0.7,
    guns: '-102:2/130mb 52,10:1/30m^1 -60,10:1/30mb^1',
    blocks: [[50, -58, 18.5, 11, 2], [46, 22, 26, 8.5, 2], [38, 26, 32, 5.5, 1.5], [24, 12, 41, 4.2, 1], [-4, -32, 30, 6.4, 1], [-12, -24, 37, 4]],
    masts: [[18, 44], [-18, 38]],
    launchers: [{ x: 90, length: 14, width: 10 }, { x: 68, length: 22, width: 13 }, { x: -76, length: 10, width: 8 }],
    radars: [{ x: 18, up: 36, kind: 'array', size: 10 }, { x: -18, up: 30, kind: 'array', size: 7 }, { x: 32, up: 25, kind: 'dome', size: 4 }, { x: -44, up: 10, kind: 'dome', size: 4 }],
    helideck: true,
  },
  // Slava (Moskva): the twin 130 mm on the bow, the sixteen big P-1000 tubes in pairs along both sides of the forward
  // structure, the pyramid foremast, the big exhaust block, the S-300F silo and the Top Dome aft (186.4 x 20.8 m;
  // 11,490 t full).
  'slava': {
    cls: 'cruiser', L: 186.4, B: 20.8, fb: 7.5, sheer: 3.5, transom: 0.7,
    guns: '72:2/130m -30,8:1/30m^5',
    blocks: [[50, 14, 11, 3.6], [16, -8, 18, 7.4, 2], [12, 0, 23, 5.4, 1.5], [-12, -32, 15, 7.6], [-16, -28, 23.5, 5.4, 1], [-34, -42, 18.5, 3.2]],
    masts: [[6, 34]],
    launchers: [{ x: 42, length: 13, width: 4, kind: 'tubes', count: 2, elevation: 0.13, up: 1.2 }, { x: 26, length: 13, width: 4, kind: 'tubes', count: 2, elevation: 0.13, up: 1.2 }, { x: -52, length: 16, width: 9 }],
    radars: [{ x: 6, up: 28, kind: 'array', size: 9 }, { x: -38, up: 14, kind: 'dome', size: 6 }],
    helideck: true,
  },
  // Udaloy (Project 1155): two 100 mm guns forward, the quad SS-N-14 boxes beside the bridge, the lattice foremast,
  // two pairs of side-by-side funnels, the tall mainmast, twin hangars and the flight deck (163.5 x 19.3 m; 7,570 t full).
  'udaloy': {
    cls: 'destroyer', L: 163.5, B: 19.3, fb: 7, sheer: 3.5, transom: 0.7,
    guns: '62:1/100m 52:1/100m^2.4',
    blocks: [[56, 46, 9.4, 3], [42, 16, 16, 7, 2], [38, 24, 19.5, 5, 1.5], [10, -22, 12.5, 6.4], [-22, -44, 14.5, 8.6]],
    extra: [blockOf(7, 1, 9, 20, 1.6, 0, 1, 2.2), blockOf(-11, -17, 9, 20, 1.6, 0, 1, 2.2)],
    masts: [[22, 26], [-4, 31]],
    launchers: [{ x: 32, length: 8, width: 3.2, kind: 'tubes', count: 1, elevation: 0.25, up: 1.5 }],
    radars: [{ x: 22, up: 23, kind: 'array', size: 7 }, { x: -4, up: 28, kind: 'array', size: 6 }],
    helideck: true,
  },
  // Sovremenny (Project 956): twin 130 mm turrets fore and aft, the Shtil arm launchers behind them, the quad Moskit
  // launchers beside the bridge, the big single funnel, the telescopic hangar (156.5 x 17.2 m; 7,940 t full).
  'sovremenny': {
    cls: 'destroyer', L: 156.5, B: 17.2, fb: 7, sheer: 3.5, transom: 0.7,
    guns: '58:2/130m -64:2/130mb',
    arms: [[46, 1, 2], [-52, 1, 2, true]],
    blocks: [[49, 43, 9.5, 2.8], [38, 14, 16.5, 6.4, 2], [34, 22, 20, 4.8, 1.5], [12, -24, 12.5, 5.4], [-24, -38, 14, 6.4], [-49, -55, 9.5, 2.8]],
    funnels: [[-4, 10, 6]],
    masts: [[18, 29], [-16, 22]],
    launchers: [{ x: 28, length: 9, width: 3.6, kind: 'tubes', count: 2, elevation: 0.27, up: 1.6 }],
    radars: [{ x: 18, up: 25, kind: 'array', size: 7 }, { x: -16, up: 19, kind: 'array', size: 5 }],
    helideck: true,
  },
  // Neustrashimy (Project 11540): the 100 mm gun, the Kinzhal silo, the long integrated superstructure with its mast and
  // stack, the hangar and flight deck (129.8 x 15.6 m; 4,250 t full).
  'neustrashimy': {
    cls: 'frigate', L: 129.8, B: 15.6, fb: 6.5, sheer: 3, transom: 0.7,
    guns: '46:1/100m -26,5:1/30m^7',
    blocks: [[28, -40, 13.5, 6.8, 1.5], [26, 12, 17, 5.4, 2], [-8, -20, 19, 3.6, 1.5], [-28, -40, 15, 6.6]],
    masts: [[4, 28]],
    launchers: [{ x: 36, length: 8, width: 6 }],
    radars: [{ x: 4, up: 24, kind: 'array', size: 6 }],
    helideck: true,
  },
  // Krivak II (Rezky): the big URPK-5 quad box on the bow, the Osa-M bins, the bridge and foremast, the wide low funnel,
  // two single 100 mm guns aft (123 x 14.2 m; 3,600 t full).
  'krivak': {
    cls: 'frigate', L: 123, B: 14.2, fb: 6, sheer: 3, transom: 0.7,
    guns: '-42:1/100m^2.6b -52:1/100mb',
    blocks: [[30, 10, 13, 5, 1.5], [26, 16, 15.5, 3.5, 1], [8, -24, 10, 5], [-26, -46, 8.6, 3.4]],
    funnels: [[-4, 5, 7]],
    masts: [[16, 20]],
    launchers: [{ x: 46, length: 7, width: 4, kind: 'box', up: 0.8 }, { x: 37, length: 3, width: 3, kind: 'box' }],
    radars: [{ x: 16, up: 18, kind: 'array', size: 5 }, { x: 20, up: 10, kind: 'dome', size: 2.6 }],
  },
  // Grisha (Albatros, Project 1124): the Osa-M bin forward, the RBU-6000s before the bridge, the pole mast, the low
  // stack, the twin 57 mm turret aft (71.2 x 9.8 m; 1,070 t full).
  'grisha': {
    cls: 'corvette', L: 71.2, B: 9.8, fb: 4.4, sheer: 2, transom: 0.7,
    guns: '-25:2/57mb -15:1/30m^3',
    blocks: [[14, -10, 9.5, 3.8, 1.5], [12, 2, 11.5, 2.8, 1], [-12, -18, 7, 2.6]],
    funnels: [[-4, 6, 3]],
    masts: [[5, 16]],
    launchers: [{ x: 24, length: 3.5, width: 3, kind: 'box' }],
    radars: [{ x: 5, up: 14, kind: 'array', size: 3.5 }, { x: 10, up: 7.5, kind: 'dome', size: 1.8 }],
  },
  // Tarantul / Molniya (Project 1241): the 76 mm gun forward, the wide superstructure with its radome and mast, two
  // pairs of Moskit tubes aft angled up, the AK-630s at the stern (56.1 x 10.2 m; 493 t full).
  'tarantul': {
    cls: 'corvette', L: 56.1, B: 10.2, fb: 3.6, sheer: 1.4, transom: 0.8,
    guns: '19:1/76m -22,2:1/30m^1.6b',
    blocks: [[12, -6, 7.5, 4.4, 1.5], [9, 1, 9.5, 3, 1], [-16, -26, 5.2, 4]],
    masts: [[0, 13]],
    launchers: [{ x: -10, length: 9, width: 3.6, kind: 'tubes', count: 2, elevation: 0.16, up: 0.9 }],
    radars: [{ x: 4, up: 7, kind: 'dome', size: 2.8 }, { x: 0, up: 11, kind: 'array', size: 2 }],
  },
  // Project 22160 (Vasily Bykov): a patrol ship with a long, flat-sided superstructure and its tower mast, the 76 mm gun
  // forward, the hangar and the long flight deck aft (94 x 14 m; 1,700 t full).
  'project-22160': {
    cls: 'patrol-ship', L: 94, B: 14, fb: 6, sheer: 2.5, transom: 0.8,
    guns: '33:1/76m',
    blocks: [[25, -20, 13.5, 6.6, 2], [22, 10, 16, 5.6, 2], [10, 2, 23, 2.6, 2]],
    masts: [[6, 19]],
    radars: [{ x: 6, up: 17, kind: 'array', size: 4 }],
    helideck: true,
  },
  // Ropucha (Project 775): a landing ship with a long open foredeck over the tank deck and bow doors, the superstructure
  // aft of the middle with mast and stack, twin 57 mm turrets on the bridge front and the stern (112.5 x 15 m; 4,080 t full).
  'ropucha': {
    cls: 'amphibious', L: 112.5, B: 15, fb: 7,
    hull: [[56.25, 8.4, 2.2], [54.5, 8.2, 5.2], [49, 7.8, 7.1], [32, 7.2, 7.5], [-40, 7.0, 7.5], [-56.25, 7.0, 6.4]],
    guns: '-2:2/57m^5 -48:2/57mb^2.5',
    blocks: [[-4, -38, 13, 6.8, 1.5], [-8, -26, 17, 5, 1.5], [-46, -52, 9.2, 2.4]],
    funnels: [[-30, 9, 4]],
    masts: [[-14, 18]],
    launchers: [{ x: 26, length: 3, width: 9, kind: 'box' }],
    radars: [{ x: -14, up: 16, kind: 'array', size: 4 }],
  },
  // Osa (Project 205; the Chinese Type 021): four big P-15 launch boxes in pairs aft, the small bridge with its radar,
  // twin 30 mm turrets fore and aft (38.6 x 7.6 m; 245 t full).
  'osa-missile-boat': {
    cls: 'fast-attack', L: 38.6, B: 7.6, fb: 2.6, sheer: 1, transom: 0.85,
    guns: '14:2/30m -17:2/30mb',
    blocks: [[9, -1, 5.4, 2.4, 1], [6, 1, 6.5, 1.4]],
    masts: [[3, 8]],
    launchers: [{ x: -6, length: 8, width: 3.6, kind: 'tubes', count: 2, elevation: 0.2, up: 0.3 }],
    radars: [{ x: 3, up: 7.5, kind: 'dome', size: 1.6 }],
  },
  // Type 052B (Guangzhou): the 100 mm gun, Shtil arm launchers fore and aft, the bridge with its pyramid mast, the big
  // funnel, YJ-83 launchers amidships, the hangar and flight deck (154 x 17 m; 6,500 t full).
  'type-052b': {
    cls: 'destroyer', L: 154, B: 17, fb: 7, sheer: 3.5, transom: 0.7,
    guns: '61:1/100m',
    arms: [[49, 1, 2], [-48, 1, 2, true]],
    blocks: [[52, 44, 9.4, 2.6], [38, 16, 16.5, 6.6, 2], [34, 22, 20.5, 5, 1.5], [10, -36, 12.5, 6], [-22, -38, 14.5, 7], [-44, -52, 9.4, 2.6]],
    funnels: [[-6, 9, 6]],
    masts: [[18, 27], [-16, 20]],
    launchers: [{ x: 4, length: 6, width: 4, kind: 'tubes', count: 2, elevation: 0.2, up: 5.5 }],
    radars: [{ x: 18, up: 25, kind: 'array', size: 7 }],
    helideck: true,
  },
  // Type 052C (Lanzhou): the four big array faces on the forward superstructure, the revolver VLS forward and aft, the
  // 100 mm gun, the tall funnel, the hangar and flight deck (155.5 x 17.2 m; 7,000 t full).
  'type-052c': {
    cls: 'destroyer', L: 155.5, B: 17.2, fb: 7, sheer: 3.5, transom: 0.7,
    guns: '62:1/100m',
    blocks: [[40, 10, 17, 7, 2], [36, 16, 24, 5.6, 2], [10, -38, 12.5, 6.4], [-2, -12, 21, 3.4, 1], [-22, -38, 15, 7]],
    masts: [[20, 30]],
    launchers: [{ x: 50, length: 12, width: 9 }, { x: -16, length: 6, width: 6 }, { x: 4, length: 6, width: 4, kind: 'tubes', count: 2, elevation: 0.2, up: 5.5 }],
    radars: [{ x: 26, up: 13, kind: 'faces', size: 5 }, { x: 20, up: 28, kind: 'array', size: 4 }],
    helideck: true,
  },
  // Type 054A (Jiangkai II): the 76 mm gun, the 32-cell VLS, the flat-sided superstructure with its closed mast, YJ-83
  // launchers across the waist, the hangar and flight deck (134 x 16 m; 4,053 t full).
  'type-054a': {
    cls: 'frigate', L: 134, B: 16, fb: 6.5, sheer: 3, transom: 0.7,
    guns: '48:1/76m -28,5:1/30m^7',
    blocks: [[31, 8, 13, 6.8, 2], [30, 18, 16, 5.4, 2], [16, 8, 24, 2.6, 2], [-6, -38, 13, 6.8, 1], [-8, -16, 17, 3.4]],
    masts: [[12, 19]],
    launchers: [{ x: 39, length: 8, width: 6 }, { x: 2, length: 7, width: 3.6, kind: 'tubes', count: 2, elevation: 0.2, up: 0.5 }],
    radars: [{ x: 12, up: 18, kind: 'array', size: 5 }],
    helideck: true,
  },
  // Type 071 (Yuzhao): a high-sided dock ship, the big superstructure forward of the middle with its closed mast, the
  // 76 mm gun on the bow, the hangar and long flight deck aft (210 x 28 m; 25,000 t full).
  'type-071': {
    cls: 'amphibious', L: 210, B: 28, fb: 10, sheer: 2.5, transom: 0.95,
    guns: '88:1/76m 60,10:1/30m^1',
    blocks: [[64, -12, 26, 13.4, 2], [60, 40, 30, 11, 2], [34, 22, 40, 3.6, 2], [-12, -30, 21, 12]],
    masts: [[28, 32]],
    radars: [{ x: 28, up: 29, kind: 'array', size: 6 }],
    more: { decks: [{ plan: [[-30, -13], [-30, 13], [-104, 13], [-104, -13]], up: 10.1, thickness: 0.2 }] },
  },
  // Castle class (HMS Dumbarton Castle): an offshore patrol ship with the bridge forward and a big flight deck raised
  // amidships, a single 30 mm gun on the bow (81 x 11.5 m; 1,427 t full).
  'castle-opv': {
    cls: 'patrol-ship', L: 81, B: 11.5, fb: 5, sheer: 2.4, transom: 0.8,
    guns: '30:1/30m',
    blocks: [[25, 8, 11.5, 5, 1.5], [21, 12, 14, 3.6, 1], [8, -32, 8.2, 5.6]],
    masts: [[14, 17]],
    radars: [{ x: 14, up: 15, kind: 'array', size: 3 }],
    more: { decks: [{ plan: [[4, -5.7], [4, 5.7], [-30, 5.7], [-30, -5.7]], up: 8.3, thickness: 0.3 }] },
  },
  // La Combattante IIa: the 76 mm gun forward, the superstructure and mast amidships, two pairs of Exocet launchers
  // angled out aft, the twin 40 mm on the stern (47 x 7.1 m; 255 t full).
  'la-combattante': {
    cls: 'fast-attack', L: 47, B: 7.1, fb: 2.8, sheer: 1, transom: 0.85,
    guns: '15:1/76m -19:2/40mb',
    blocks: [[8, -4, 6, 2.8, 1], [6, 0, 7.4, 2]],
    masts: [[2, 10]],
    launchers: [{ x: -10, length: 6, width: 3.6, kind: 'tubes', count: 2, elevation: 0.15, up: 0.2 }],
    radars: [{ x: 2, up: 8.5, kind: 'dome', size: 1.6 }],
  },
};
for (const [name, o] of Object.entries(M)) N[name] = ship(o);
// Project 22160 with the Tor-M2KM module bolted onto its flight deck: the box with its eight missiles upright and the
// search radar on top (as above).
N['project-22160-tor'] = ship({ ...M['project-22160'], extra: [blockOf(-27, -35, 6, 9.6, 2.2), blockOf(-29, -33, 9.6, 10.8, 1.6)], radars: [...M['project-22160'].radars!, { x: -31, up: 5.4, kind: 'panel', size: 2.4 }] });

// Arleigh Burke Flight I: the Flight IIA's hull a little shorter at the stern, no hangar; the aft deckhouse short and
// low, the aft VLS behind it and the flight deck on the stern (153.9 x 20.1 m; 8,300 t full).
N['arleigh-burke-flight-i'] = {
  cls: 'destroyer', length: 153.9, beam: 20.1, freeboard: 7.2,
  hullOutline: hullOf([[76.95, 9.5, 0.2], [69.3, 9.0, 3.5], [54.3, 8.3, 7.8], [34.3, 7.6, 9.8], [-0.7, 7.2, 10.05], [-45.7, 6.8, 9.8], [-69.3, 6.4, 8.6], [-76.95, 6.3, 7.4]]),
  bodies: [blockOf(35.3, 3.3, 7.0, 15.5, 7.0, 3.5), blockOf(30.3, 14.3, 15.5, 19.5, 5.2, 2), blockOf(5.3, -1.7, 7.0, 21, 2.6, 0, 1.2), blockOf(-13.7, -20.7, 6.8, 19.5, 2.6, 0, 1.2), blockOf(3.3, -8.7, 7.0, 11, 4.2), blockOf(-6.7, -28, 6.8, 12.5, 6.0, 1.5)],
  turrets: [{ x: 57.3, size: 4.5, barrels: 1, length: 7, calibre: 0.127, kind: 'mount' }, { x: 36, size: 2.6, barrels: 1, length: 1.2, calibre: 0.02, kind: 'mount', up: 8.4 }, { x: -24, size: 2.6, barrels: 1, length: 1.2, calibre: 0.02, kind: 'mount', up: 5.5, back: true }],
  masts: [{ x: 12.3, height: 26 }],
  launchers: [{ x: 45.3, length: 13, width: 8 }, { x: -38, length: 10, width: 8 }],
  radars: [{ x: 23.3, up: 9, kind: 'faces', size: 4 }],
  helideck: true,
};

// ---------------------------------------------------------------- more Second World War warships by class

const W: Record<string, ShipO> = {
  // Gleaves: a flush-decker with sheer forward, two round funnels, four single 5-inch mounts (two forward, two aft, the
  // inner ones superfiring), two quintuple torpedo mounts (106.2 x 11 m; 2,395 t full).
  'gleaves': {
    cls: 'destroyer', L: 106.2, B: 11.0, fb: 5.4, sheer: 2.5,
    guns: '38:1/127 31:1/127^2 -31:1/127^2b -42:1/127b',
    funnels: [[10, 8, 3], [-1, 8, 3]],
    blocks: [[27, 19, 11.5, 3, 1], [25, 21, 13.2, 2.2], [-26, -35, 7.6, 2.6]],
    masts: [[18, 17]],
    launchers: [{ x: 4, length: 6, width: 2.4, kind: 'tubes', count: 1, elevation: 0 }, { x: -12, length: 6, width: 2.4, kind: 'tubes', count: 1, elevation: 0 }],
  },
  // Akizuki: the long forecastle, four twin 10 cm gunhouses (superfiring pairs fore and aft), the single big raked
  // funnel, one quadruple torpedo mount (134.2 x 11.6 m; 3,700 t full).
  'akizuki': {
    cls: 'destroyer', L: 134.2, B: 11.6, fb: 6, fc: [-6, 1.6], sheer: 2.5,
    guns: '50:2/100m 42:2/100m^2.4 -42:2/100mb^2.4 -52:2/100mb',
    funnels: [[-1, 9, 5.5]],
    blocks: [[34, 24, 14, 3.4, 1.5], [31, 26, 17, 2.4]],
    masts: [[24, 20], [-24, 12]],
    launchers: [{ x: -14, length: 7, width: 2.6, kind: 'tubes', count: 1, elevation: 0 }],
  },
  // King George V: an almost level deck, the quadruple 14-inch turret forward with the twin superfiring over it, the
  // quadruple aft, two upright funnels, the tower bridge, eight twin 5.25-inch turrets along the sides (227.1 x 31.4 m;
  // 42,237 t full).
  'king-george-v': {
    cls: 'battleship', L: 227.1, B: 31.4, fb: 9, sheer: 2,
    guns: '72:4/356 57:2/356^3 -66:4/356b 34,11:2/133^3 22,11:2/133^3 -16,11:2/133^3b -28,11:2/133^3b',
    funnels: [[8, 14, 7], [-14, 14, 7]],
    blocks: [[46, 22, 20, 8, 2], [42, 28, 28, 5, 1.5], [38, 32, 34, 3], [0, -30, 16, 6], [-32, -42, 20, 3.5]],
    masts: [[30, 36], [-34, 30]],
  },
  // Iron Duke: five twin 13.5-inch turrets (A and B forward, Q amidships, X and Y aft), two funnels close together,
  // the tripod foremast (189.8 x 27.4 m; 29,560 t full).
  'iron-duke': {
    cls: 'battleship', L: 189.8, B: 27.4, fb: 8, sheer: 2.5,
    guns: '62:2/343 50:2/343^2.5 -8:2/343 -46:2/343^2.5b -60:2/343b',
    funnels: [[18, 14, 6], [6, 14, 6]],
    blocks: [[38, 26, 18, 6, 1], [34, 28, 22, 3.5]],
    masts: [[28, 34], [-28, 22]],
  },
  // A heavy and a light cruiser of the 1930s-40s, not of one class (estimates, 190 x 20 m and 170 x 17 m).
  'heavy-cruiser': {
    cls: 'cruiser', L: 190, B: 20, fb: 8, fc: [-24, 2.4],
    guns: '60:3/203 48:3/203^2.5 -56:3/203b',
    funnels: [[6, 12, 5], [-8, 12, 5]],
    blocks: [[34, 20, 22, 6, 1], [-28, -38, 13, 4]],
    masts: [[26, 28], [-22, 22]],
  },
  'light-cruiser': {
    cls: 'cruiser', L: 170, B: 17, fb: 7, sheer: 3,
    guns: '56:3/152 45:3/152^2.5 -46:3/152^2.5b -57:3/152b',
    funnels: [[6, 11, 4.5], [-8, 11, 4.5]],
    blocks: [[32, 18, 20, 6, 1.5]],
    masts: [[22, 26], [-14, 20]],
  },

  // ---------------------------------------------------------------- landing ships and craft

  // LST Mk 2: the bluff bow with its doors, the long main deck, the bridge and quarters aft, LCVPs in davits, 40 mm guns
  // at bow and stern (100 x 15.24 m; 4,080 t loaded).
  'lst-mk2': {
    cls: 'amphibious', L: 100, B: 15.24, fb: 4.6,
    hull: [[50, 6.6, 3.2], [48.5, 6.4, 6.0], [44, 5.8, 7.4], [36, 5.0, 7.62], [-42, 4.6, 7.62], [-50, 4.7, 6.4]],
    guns: '45:1/40s -46:1/40bs 20,6.5:1/20s -20,6.5:1/20s',
    blocks: [[-28, -44, 11.5, 6.8, 0.5], [-30, -40, 14, 4.2]],
    masts: [[-34, 13]],
    extra: [blockOf(-2, -13, 4.6, 7, 1.6, 0, 0, 7.6)],
  },
  // Bayfield attack transport (C3 hull): the merchant's midships house and funnel, kingposts and booms, the landing
  // craft stacked along both sides, a 5-inch gun aft (150 x 21.2 m; 16,100 t full).
  'attack-transport': {
    cls: 'amphibious', L: 150, B: 21.2, fb: 8, sheer: 3, transom: 0.7,
    guns: '64:1/76s -70:1/127mb',
    funnels: [[-12, 14, 6]],
    blocks: [[8, -18, 15, 9.5, 1], [4, -8, 18.5, 7, 1]],
    masts: [[40, 22], [26, 14], [-30, 14], [-46, 20]],
    extra: [blockOf(32, 10, 8, 11, 1.6, 0, 0, 9.6), blockOf(-22, -42, 8, 11, 1.6, 0, 0, 9.6)],
  },
  // LCI(L): a ship's bow with the two gangway ramps along its sides, the round conning tower amidships, 20 mm guns (48.3 x
  // 7.2 m; 387 t loaded).
  'lci-l': {
    cls: 'landing-craft', L: 48.3, B: 7.2, fb: 2.4, sheer: 0.8, transom: 0.8,
    guns: '15:1/20s -16:1/20bs -21:1/20bs',
    blocks: [[-2, -10, 5.2, 2.6, 0.5]],
    extra: [{ top: [[-4, 7.4], [-9, 7.4]], bottom: [[-4, 4.8], [-9, 4.8]], plan: [[-4, 0.2], [-4.7, 1.8], [-6.5, 2.5], [-8.3, 1.8], [-9, 0.2]], round: 10, stations: 6 }, { top: [[23, 1.4], [12, 3.6]], bottom: [[23, 1.0], [12, 3.2]], plan: [[23, 0.6], [12, 0.6]], side: 3.0, round: 8, stations: 2 }],
    masts: [[-7, 9]],
  },
  // LCT Mk 5: a box hull with its high sides round the tank deck, the bow ramp raised, the deckhouse aft, 20 mm guns
  // on its wings (35.7 x 9.8 m; 286 t loaded).
  'lct': {
    cls: 'landing-craft', L: 35.7, B: 9.8, fb: 2.6,
    hull: [[17.85, 2.9, 4.4], [17.3, 2.9, 4.9], [-17, 2.6, 4.9], [-17.85, 2.6, 4.6]],
    guns: '-14,3.8:1/20^2.6s',
    blocks: [[-12, -17.8, 5.4, 4.6], [-13, -16, 7, 1.6]],
    extra: [blockOf(18.2, 17.6, 0.6, 3.6, 4.0)],
  },
  // LCM(3): the bow ramp, the open well, the coxswain's and engine housing aft (15.2 x 4.3 m; 52 t loaded).
  'lcm': {
    cls: 'landing-craft', L: 15.2, B: 4.3, fb: 1.7,
    hull: [[7.6, 1.9, 1.8], [7.2, 1.9, 2.15], [-7.1, 1.7, 2.15], [-7.6, 1.7, 1.9]],
    blocks: [[-5.2, -7.4, 2.6, 2.0]],
    oneSide: [[-5.4, -6.2, 3.2, 0.4, 1.4]],
    extra: [blockOf(7.9, 7.4, 0.4, 2.4, 1.8)],
  },
  // LCA: an armoured boat, the bow doors and ramp, the coxswain's and the Bren gunner's armoured shelters forward,
  // the covered well (12.6 x 3.05 m; 13.5 t loaded).
  'lca': {
    cls: 'landing-craft', L: 12.6, B: 3.05, fb: 1.3,
    hull: [[6.3, 1.6, 1.0], [5.8, 1.6, 1.4], [-5.8, 1.3, 1.52], [-6.3, 1.3, 1.3]],
    oneSide: [[4.8, 3.2, 2.3, 0.45, 0.9, 0.3], [4.8, 3.6, 2.1, 0.4, -0.9, 0.3]],
    blocks: [[-1, -6.0, 1.9, 1.5]],
    extra: [blockOf(6.5, 6.1, 0.3, 1.9, 1.1)],
  },
  // Daihatsu: the twin-keeled bow with its ramp, the open well, the steering shelter aft (14.8 x 3.4 m; 9.5 t empty).
  'daihatsu': {
    cls: 'landing-craft', L: 14.8, B: 3.4, fb: 1.5,
    hull: [[7.4, 1.9, 0.9], [7.0, 1.8, 1.5], [5.0, 1.6, 1.7], [-6.0, 1.4, 1.7], [-7.4, 1.5, 1.3]],
    blocks: [[-5, -7, 2.5, 1.0]],
    extra: [blockOf(7.6, 7.2, 0.5, 2.3, 1.2)],
  },
  // Marinefaehrprahm (Type A): a flat landing barge, the bow ramp, the bridge and the gun platforms aft (47 x 6.5 m;
  // 220 t).
  'marinefahrprahm': {
    cls: 'landing-craft', L: 47, B: 6.5, fb: 2.2,
    hull: [[23.5, 2.7, 1.7], [22, 2.7, 2.8], [18, 2.4, 3.25], [-20, 2.2, 3.25], [-23.5, 2.4, 2.9]],
    guns: '-12:1/88b^1.2 -21:1/20bs^3.4',
    blocks: [[-15, -22, 4.8, 2.8, 0.5], [-17, -21, 6.2, 1.8]],
    masts: [[-18, 7]],
    extra: [blockOf(23.8, 23.2, 0.6, 3.2, 1.6)],
  },
  // X-lighter ("Beetle"): a small steel landing barge, the bow ramp, the wheelhouse aft (32.2 x 6.4 m; 135 t, estimate).
  'x-lighter': {
    cls: 'landing-craft', L: 32.2, B: 6.4, fb: 2.6,
    hull: [[16.1, 3.0, 2.0], [15, 3.0, 3.0], [12, 2.8, 3.2], [-15, 2.6, 3.2], [-16.1, 2.6, 2.9]],
    blocks: [[-11, -16, 5, 2.6, 0.4]],
    masts: [[-13, 6]],
    extra: [blockOf(16.4, 15.8, 0.6, 3.6, 1.8)],
  },
  // LCVP (Higgins boat): the steel bow ramp, the open well, the coxswain aft to starboard, two .30 guns in tubs aft
  // (10.9 x 3.3 m; 8.2 t empty).
  'lcvp-landing-craft': {
    cls: 'landing-craft', L: 10.9, B: 3.3, fb: 1.5,
    hull: [[5.45, 1.8, 1.4], [5.1, 1.8, 1.6], [-4.8, 1.6, 1.65], [-5.45, 1.5, 1.45]],
    guns: '-3.8,1.1:1/8^0.4s',
    blocks: [[-3.4, -5.4, 2.0, 1.5]],
    oneSide: [[-3.0, -4.0, 2.7, 0.35, 0.8]],
    extra: [blockOf(5.7, 5.3, 0.4, 2.2, 1.35)],
  },

  // ---------------------------------------------------------------- boats

  // Schnellboot (S-100 class): the raised forecastle with the two torpedo tubes in it, the armoured dome bridge, a
  // 20 mm gun in the bow well, the twin 20 mm amidships and the 40 mm aft (34.9 x 5.3 m; 117 t full).
  'schnellboot': {
    cls: 'fast-attack', L: 34.9, B: 5.3, fb: 2.0, sheer: 1, fc: [6, 0.5], transom: 0.75,
    guns: '11:1/20s^-0.3 -5:2/20s -15:1/40bs',
    masts: [[-1, 5.5]],
    extra: [{ top: [[14, 2.8], [6, 2.8]], bottom: [[14, 1.6], [6, 1.6]], plan: [[14, 0.45], [6, 0.45]], side: 1.5, round: 2, stations: 4 }, { top: [[3.5, 2.0], [2.5, 4.0], [-1.5, 4.0], [-2.5, 2.0]], bottom: [[3.5, 1.9], [-2.5, 1.9]], plan: [[3.5, 0.8], [2, 1.7], [-1.5, 1.7], [-2.5, 1.2]], round: 2.5, stations: 6 }],
  },
  // G-5: a stepped hydroplane with a turtle-back deck, the small conning cupola, the two torpedoes in troughs at the
  // stern (19.1 x 3.4 m; 17.8 t).
  'g-5-torpedo-boat': {
    cls: 'fast-attack', L: 19.1, B: 3.4, fb: 1.1, hullRound: 3.5,
    hull: [[9.55, 1.3, 0.2], [8, 1.45, 1.1], [4, 1.5, 1.65], [-8, 1.3, 1.7], [-9.55, 1.2, 1.55]],
    guns: '1:1/8s^0.6',
    extra: [{ top: [[3, 1.4], [2.4, 2.3], [0.8, 2.3], [0.2, 1.4]], bottom: [[3, 1.2], [0.2, 1.2]], plan: [[3, 0.3], [2.4, 0.75], [0.6, 0.7], [0.2, 0.3]], round: 2.5, stations: 6 }, blockOf(-3, -9.5, 0.9, 1.5, 0.35, 0, 0, 1.0)],
  },
  // Coastal Motor Boat (40 ft): a turtle-backed hydroplane, the small cockpit, the torpedo in its trough at the stern
  // (12.2 x 2.6 m; 4.25 t).
  'coastal-motor-boat': {
    cls: 'fast-attack', L: 12.2, B: 2.6, fb: 1.0, hullRound: 3.5,
    hull: [[6.1, 1.1, 0.15], [5, 1.2, 0.9], [2, 1.25, 1.25], [-5, 1.15, 1.3], [-6.1, 1.1, 1.2]],
    extra: [blockOf(-0.5, -2.2, 1.0, 1.6, 0.6, 0.3), blockOf(-3, -6.1, 0.9, 1.5, 0.3)],
  },
  // CB90: the narrow bow with its ramp, the armoured cabin with the gun on its roof, the waterjets (15.9 x 3.8 m;
  // 20.5 t loaded).
  'cb90': {
    cls: 'attack-boat', L: 15.9, B: 3.8, fb: 1.6, sheer: 0.4, transom: 0.9,
    guns: '-1:1/13s^1.9 5.5:1/13s',
    blocks: [[3, -4, 3.4, 1.7, 0.6]],
    extra: [blockOf(8.2, 7.6, 1.0, 2.2, 0.8)],
  },
  // PBR Mk II: a fibreglass river boat, the twin .50 guns in the bow tub, the canopied coxswain's flat, a .50 aft
  // (9.8 x 3.5 m; 7.3 t).
  'pbr': {
    cls: 'patrol-boat', L: 9.8, B: 3.5, fb: 0.9, sheer: 0.3, transom: 0.9,
    guns: '3.4:2/13s^0.5 -3.9:1/13bs',
    blocks: [[1.2, -1.6, 2.5, 1.3, 0.6]],
  },
  // An armed speedboat with an open cockpit and a machine gun (estimate, 11 x 2.8 m).
  'armed-speedboat': {
    cls: 'patrol-boat', L: 11, B: 2.8, fb: 1.0, sheer: 0.4, transom: 0.9,
    guns: '3:1/13s^0.4',
    blocks: [[0.6, -1.4, 1.9, 1.1, 0.8]],
  },
  // Project 1124 armoured river boat: two T-34 turrets fore and aft of the armoured conning tower (25.3 x 4 m; 52 t).
  'gunboat-1124': {
    cls: 'patrol-boat', L: 25.3, B: 4.0, fb: 1.3, sheer: 0.6, transom: 0.8,
    guns: '6.5:1/76^0.4 -6.5:1/76^0.4b',
    blocks: [[2, -1.5, 3.3, 1.2, 0.3]],
    masts: [[0, 5]],
  },
  // A fast interceptor with a long foredeck and a low, raked enclosed cabin (estimate, 15.7 x 3.2 m).
  'interceptor-boat': {
    cls: 'patrol-boat', L: 15.7, B: 3.2, fb: 1.0, sheer: 0.4, transom: 0.85,
    guns: '-5:1/13bs^0.4',
    blocks: [[3, -4, 2.3, 1.3, 2.5]],
  },
  // An airboat: a flat punt, the raised driver's seat, the big caged fan aft (5.5 x 2.4 m).
  'airboat': {
    cls: 'patrol-boat', L: 5.5, B: 2.4, fb: 0.5,
    hull: [[2.75, 0.7, 0.9], [2.3, 0.6, 1.15], [-2.75, 0.5, 1.2]],
    blocks: [[0.2, -0.8, 1.4, 0.5]],
    more: { ducts: [{ x: -2.0, side: 0, up: 1.6, diameter: 2.0, length: 0.5 }] },
  },
  // A rigid-hulled inflatable boat: the inflated tubes round a deep-vee hull, the console, the radar arch, twin
  // outboards (11 x 3.4 m).
  'rhib': {
    cls: 'rhib', L: 11, B: 3.4, fb: 0.9,
    hull: [[5.5, 1.0, 0.3], [4.5, 0.95, 1.0], [2, 0.9, 1.3], [-5.5, 0.8, 1.25]],
    blocks: [[0.6, -0.8, 1.9, 0.5]],
    extra: [
      { top: [[3, 1.15], [-5.5, 1.1]], bottom: [[3, 0.5], [-5.5, 0.55]], plan: [[3, 0.32], [-5.5, 0.3]], side: 1.38, round: 2, stations: 4 },
      { top: [[5.6, 1.35], [3, 1.15]], bottom: [[5.6, 0.75], [3, 0.5]], plan: [[5.6, 0.2], [4.8, 1.0], [3, 1.7]], round: 2.5, stations: 6 },
      blockOf(-3.3, -3.6, 0.9, 2.9, 0.08, 0, 0, 1.05), blockOf(-3.3, -3.6, 2.7, 2.9, 1.15), blockOf(-5.3, -5.9, 0.4, 1.6, 0.3, 0, 0, 0.5),
    ],
  },
  // A generic patrol boat with a cabin, mast and a cannon forward (estimate, 25 x 5.5 m).
  'patrol-boat': {
    cls: 'patrol-boat', L: 25, B: 5.5, fb: 2.2, sheer: 0.8, transom: 0.85,
    guns: '8:1/30m',
    blocks: [[4, -4, 4.8, 2.0, 1]],
    masts: [[0, 7]],
  },
  // A sampan: the upswept bow and stern, the arched mat roof amidships (8 x 1.8 m).
  'sampan': {
    cls: 'sampan', L: 8, B: 1.8, fb: 0.5, hullRound: 4,
    hull: [[4, 1.0, 0.25], [3, 0.7, 0.75], [0, 0.55, 0.9], [-3, 0.7, 0.8], [-4, 0.95, 0.45]],
    extra: [{ top: [[1.6, 1.1], [1.2, 1.55], [-1.6, 1.55], [-2.0, 1.1]], bottom: [[1.6, 0.5], [-2.0, 0.5]], plan: [[1.6, 0.75], [-2.0, 0.75]], round: 2.4, stations: 4 }],
  },
  // A harbour tug: the high bow, the wheelhouse forward of the middle, the funnel behind it, the low towing deck aft
  // (estimate, 30 x 9 m).
  'harbour-tug': {
    cls: 'merchant', L: 30, B: 9, fb: 2.4, sheer: 1.6, transom: 0.75,
    funnels: [[-2, 4.5, 1.8]],
    blocks: [[8, -6, 4.6, 3.4, 0.5], [6, 0, 6.6, 2.8, 1]],
    masts: [[2, 8]],
  },
  // A small passenger ship with a long deckhouse and the wheelhouse forward (estimate, 25 x 5 m).
  'passenger-launch': {
    cls: 'merchant', L: 25, B: 5, fb: 1.6, sheer: 0.7, transom: 0.8,
    blocks: [[6, -9, 3.8, 2.2, 1.2], [6, 2, 5.0, 1.8, 1]],
    masts: [[3, 6.5]],
  },
  // A Freycinet canal barge (peniche): the long hold under its hatch boards, the wheelhouse and quarters aft (38.5 x
  // 5.05 m).
  'peniche': {
    cls: 'merchant', L: 38.5, B: 5.05, fb: 1.2,
    hull: [[19.25, 1.6, 1.4], [18.2, 1.4, 2.3], [16, 1.25, 2.52], [-17, 1.2, 2.52], [-19.25, 1.4, 2.0]],
    blocks: [[-15, -17.5, 3.6, 1.2, 0.2], [-13.5, -18.6, 2.4, 2.2]],
    extra: [{ top: [[15, 1.2], [14.5, 1.9], [-12.5, 1.9], [-13, 1.2]], bottom: [[15, 1.1], [-13, 1.1]], plan: [[15, 2.2], [-13, 2.2]], round: 3, stations: 4 }],
  },
  // A river cargo ship: the hold amidships, the bridge and funnel aft (estimate, 60 x 9 m).
  'river-cargo-ship': {
    cls: 'merchant', L: 60, B: 9, fb: 2.2, sheer: 0.8, transom: 0.85,
    funnels: [[-24, 7.5, 1.6]],
    blocks: [[-18, -28, 6, 4, 1], [-20, -26, 7.8, 2.8, 1]],
    masts: [[18, 7]],
    extra: [blockOf(16, -14, 1.9, 3.2, 3.6)],
  },

  // ---------------------------------------------------------------- merchant ships

  // Fleet tanker (Elnya, Project 160 Altay class): the forecastle, the long tank deck with its masts, the bridge,
  // quarters and funnel aft (106.2 x 15.5 m; 7,230 t full).
  'tanker': {
    cls: 'merchant', L: 106.2, B: 15.5, fb: 5, sheer: 2, transom: 0.7,
    funnels: [[-47, 15, 3.5]],
    blocks: [[53, 44, 7, 6], [-36, -53, 14, 7.4, 1], [-38, -48, 17, 5.5, 1]],
    masts: [[30, 14], [-4, 10]],
  },
  // A Handysize bulk carrier: five hatches with four deck cranes between them, the forecastle, the tall house and
  // funnel aft (estimate, 180 x 30 m).
  'bulker': {
    cls: 'merchant', L: 180, B: 30, fb: 7, sheer: 2.5, transom: 0.75,
    funnels: [[-80, 26, 6]],
    blocks: [[90, 80, 10, 12], [-66, -82, 26, 13, 1], [-68, -78, 30, 9, 1]],
    masts: [[52, 22], [30, 22], [8, 22], [-14, 22]],
    extra: [blockOf(62, 48, 6.8, 8.6, 10), blockOf(40, 26, 6.8, 8.6, 10), blockOf(18, 4, 6.8, 8.6, 10), blockOf(-4, -18, 6.8, 8.6, 10), blockOf(-26, -40, 6.8, 8.6, 10)],
  },
  // A general cargo ship: the hatches, derrick masts, the house and funnel three-quarters aft (estimate, 130 x 19 m).
  'cargo-ship': {
    cls: 'merchant', L: 130, B: 19, fb: 6.5, sheer: 2.5, transom: 0.75,
    funnels: [[-38, 15, 4]],
    blocks: [[63, 56, 8.5, 8], [-26, -40, 16, 8.4, 1], [-28, -36, 19, 6, 1]],
    masts: [[40, 16], [12, 16], [-56, 14]],
    extra: [blockOf(52, 44, 6.3, 8, 6.4), blockOf(32, 22, 6.3, 8, 6.4), blockOf(4, -14, 6.3, 8, 6.4), blockOf(-46, -56, 6.3, 8, 6.4)],
  },
  // A container and ro-ro ship (Atlantic Conveyor): the long container stacks, the house and funnel aft (212 x 31 m;
  // the house's place an estimate).
  'container-ship': {
    cls: 'merchant', L: 212, B: 31, fb: 9, sheer: 2.5, transom: 0.8,
    funnels: [[-76, 27, 6]],
    blocks: [[-62, -78, 30, 14, 1], [-64, -74, 34, 10, 1]],
    extra: [blockOf(96, -58, 8.8, 17, 13.5)],
  },
  // Seawise Giant: the longest ship built, a flat tank deck, the forecastle, the house and funnel at the stern
  // (458.5 x 68.8 m; 657,019 DWT).
  'supertanker': {
    cls: 'merchant', L: 458.5, B: 68.8, fb: 10, sheer: 3, transom: 0.8,
    funnels: [[-218, 32, 9]],
    blocks: [[229, 214, 14, 30], [-196, -222, 32, 26, 1], [-200, -216, 40, 18, 1]],
    masts: [[200, 14]],
    extra: [blockOf(12, -12, 9.8, 12, 22)],
  },
  // Liberty ship (EC2): the midships house with its funnel, three masts with derricks over five hatches, gun tubs at
  // bow and stern (134.6 x 17.3 m; 14,474 t full).
  'liberty-ship': {
    cls: 'merchant', L: 134.6, B: 17.3, fb: 6.5, sheer: 2.6, transom: 0.7,
    guns: '60:1/76^1.6 -62:1/127b^2.4 0,8:1/20s^9',
    funnels: [[-4, 13, 4]],
    blocks: [[64, 58, 8.6, 5], [8, -12, 13, 7.6, 0.5], [6, -8, 16, 5.8, 0.5]],
    masts: [[38, 22], [20, 16], [-40, 20]],
    extra: [blockOf(52, 42, 6.3, 7.8, 5.5), blockOf(30, 18, 6.3, 7.8, 5.5), blockOf(-18, -28, 6.3, 7.8, 5.5), blockOf(-46, -56, 6.3, 7.8, 5.5)],
  },
  // T2 tanker: the bridge house forward of the middle, the engine house and funnel aft, a 3-inch gun on the bow and a
  // 5-inch on the stern (159.6 x 20.7 m; 21,880 t full).
  'ww2-tanker': {
    cls: 'merchant', L: 159.6, B: 20.7, fb: 5.6, sheer: 2.2, transom: 0.7,
    guns: '70:1/76^2 -72:1/127b^2.8',
    funnels: [[-66, 13, 5]],
    blocks: [[30, 16, 14, 7.4, 1], [26, 18, 17, 5, 1], [-50, -78, 12.5, 9.4, 0.5], [-56, -72, 15, 6]],
    masts: [[50, 16], [-30, 14]],
  },
};
for (const [name, o] of Object.entries(W)) N[name] = ship(o);
// Project 1124 with the BM-13 rocket launcher in place of the aft turret (as above).
N['gunboat-1124-mrls'] = ship({ ...W['gunboat-1124'], guns: '6.5:1/76^0.4', launchers: [{ x: -6.5, length: 5, width: 2.2, kind: 'tubes', count: 2, elevation: 0.3, up: 0.6 }] });

// LCAC: the skirt round the buoyancy box, the open cargo deck between the two side structures with the control cabin
// forward to starboard, the two ducted propellers aft (26.4 x 14.3 m; 150 t full).
N['lcac-hovercraft'] = {
  cls: 'hovercraft', length: 26.4, beam: 14.3, freeboard: 2.0, hull: 'boat',
  hullOutline: { top: [[13.2, 1.2], [12.4, 1.8], [-12.4, 1.8], [-13.2, 1.2]], bottom: [[13.2, 0], [-13.2, 0]], plan: [[13.2, 5.5], [12.6, 6.9], [11, 7.15], [-11, 7.15], [-12.6, 6.9], [-13.2, 5.5]], round: 3, stations: 16 },
  decks: [{ plan: [[12, -4.2], [12, 4.2], [-12, 4.2], [-12, -4.2]], up: 2.0, thickness: 0.3 }],
  bodies: [blockOf(11.5, -11, 1.6, 4.4, 1.3, 0.8, 0, 5.4)],
  oneSide: [blockOf(11, 6, 4.2, 7.2, 1.2, 0.6, 0, 5.4), blockOf(11, 7, 4.2, 6.2, 1.1, 0.6, 0, -5.4)],
  ducts: [{ x: -10.6, side: 4.6, up: 4.3, diameter: 4.0, length: 2.0 }, { x: -10.6, side: -4.6, up: 4.3, diameter: 4.0, length: 2.0 }],
};
// A small assault hovercraft: the skirt, the enclosed cabin forward, a gun on its roof, one big ducted fan aft (as in
// Battlefield; estimate, 12 x 6 m).
N['assault-hovercraft'] = {
  cls: 'hovercraft', length: 12, beam: 6, freeboard: 1.6, hull: 'boat',
  hullOutline: { top: [[6, 1.0], [5.5, 1.5], [-5.5, 1.5], [-6, 1.0]], bottom: [[6, 0], [-6, 0]], plan: [[6, 2.2], [5.5, 2.9], [4.5, 3.0], [-5, 3.0], [-5.8, 2.6], [-6, 2.0]], round: 3, stations: 12 },
  bodies: [{ top: [[4.5, 1.5], [3.0, 3.0], [-1.5, 3.0], [-2.5, 1.5]], bottom: [[4.5, 1.4], [-2.5, 1.4]], plan: [[4.5, 1.6], [3, 2.1], [-2.5, 2.1]], round: 5, stations: 8 }],
  turrets: [{ x: 0.5, size: 1.2, barrels: 1, length: 1.6, calibre: 0.02, up: 1.4 }],
  ducts: [{ x: -4.6, side: 0, up: 3.0, diameter: 2.8, length: 1.0 }],
};

// ---------------------------------------------------------------- classes that data named by a near relative
// War Thunder ships that pointed at a sister or a look-alike now get their own class.

/** A hydrofoil's struts and foils below the hull: x, side of each strut (mirrored when not 0), the foil's span and depth. */
function foils(rows: [number, number, number][], depth: number): Outline[] {
  return rows.flatMap(([x, side, span]) => [
    blockOf(x + 0.4, x - 0.4, -depth, 0.3, 0.12, 0, 0, side || undefined),
    { top: [[x + 0.8, -depth + 0.12], [x - 0.8, -depth + 0.12]], bottom: [[x + 0.8, -depth - 0.12], [x - 0.8, -depth - 0.12]], plan: [[x + 0.8, span], [x - 0.8, span]], side: side || undefined, round: 8, stations: 2 },
  ]);
}

const R: Record<string, ShipO> = {
  // Fubuki ("special type"): the long forecastle, three twin 12.7 cm gunhouses (one forward, two aft), two funnels
  // the forward one the larger, three triple torpedo mounts (118.4 x 10.4 m; 2,090 t full).
  'fubuki': { cls: 'destroyer', L: 118.4, B: 10.4, fb: 5.4, fc: [16, 1.5], guns: '44:2/127m -32:2/127mb^2 -43:2/127mb', funnels: [[9, 7.5, 3.6], [-4, 7, 3]], blocks: [[30, 22, 12.5, 3.2, 1], [-27, -36, 6.4, 2.6]], masts: [[22, 16], [-20, 10]], tt: [2, 3] },
  // Yugumo: Kagero's improved sister, three twin 12.7 cm turrets, two funnels, two quadruple torpedo mounts (119.2 x
  // 10.8 m; 2,520 t full).
  'yugumo': { cls: 'destroyer', L: 119.2, B: 10.8, fb: 5.4, fc: [18, 1.4], guns: '45:2/127m -32:2/127mb^2 -45:2/127mb', funnels: [[10, 7.5, 3.2], [-2, 7.5, 3]], blocks: [[31, 24, 12.5, 3.4, 1.5], [29, 25, 14, 2.4]], masts: [[22, 16]], tt: [2, 4] },
  // Nagara: Kuma's successor, seven single 14 cm guns, three funnels, the aircraft hangar in the bridge's base (162.1 x
  // 14.2 m; 5,570 t full).
  'nagara': { cls: 'light-cruiser', L: 162.1, B: 14.2, fb: 7, fc: [-6, 2.4], guns: '56:1/140 47:1/140^2 -46:1/140^2b -54:1/140b 10,6:1/140', funnels: [[12, 11, 3.5], [2, 11, 3.5], [-8, 11, 3.5]], blocks: [[38, 30, 11, 3, 1], [32, 24, 18, 4, 1]], masts: [[26, 24], [-28, 18]], tt: [2, 4] },
  // Dreadnought (1906): five twin 12-inch turrets, one forward, two on the wings amidships and two aft, two funnels
  // with the tripod foremast between bridge and funnel (160.6 x 25 m; 21,060 t full).
  'dreadnought': { cls: 'battleship', L: 160.6, B: 25, fb: 8, sheer: 3, guns: '56:2/305 8,8.5:2/305 -40:2/305b -56:2/305b', funnels: [[20, 13, 5], [2, 13, 5]], blocks: [[36, 28, 16, 5, 1], [-12, -24, 13, 4]], masts: [[27, 30], [-14, 26]] },
  // Tashkent: the Italian-built destroyer leader, three twin 130 mm turrets, two funnels, three triple torpedo mounts
  // (139.7 x 13.7 m; 4,175 t full).
  'tashkent': { cls: 'destroyer', L: 139.7, B: 13.7, fb: 6, sheer: 3, guns: '50:2/130m 42:2/130m^2.5 -46:2/130mb', funnels: [[6, 9, 4], [-8, 9, 4]], blocks: [[34, 24, 14, 3.8, 1.5], [31, 26, 16.5, 2.6]], masts: [[24, 20], [-24, 14]], tt: [2, 3] },
  // Abdiel: a fast minelayer, a long forecastle, three funnels, three twin 4-inch mounts, the mine deck aft (127.4 x
  // 12.2 m; 4,000 t full).
  'abdiel': { cls: 'minelayer', L: 127.4, B: 12.2, fb: 6, fc: [-30, 1.8], sheer: 2.5, guns: '44:2/102 36:2/102^2 -42:2/102b', funnels: [[10, 8, 4], [0, 8, 4], [-10, 8, 4]], blocks: [[28, 18, 14, 3.6, 1.5], [25, 20, 16.5, 2.4]], masts: [[17, 20], [-26, 12]] },
  // Egret: a sloop, two twin 4-inch mounts forward and two aft, the bridge, one funnel (89.4 x 11.3 m; 1,600 t full).
  'egret-sloop': { cls: 'sloop', L: 89.4, B: 11.3, fb: 5, fc: [-14, 1.6], sheer: 2, guns: '32:2/102 26:2/102^2 -22:2/102b^2 -30:2/102b', funnels: [[2, 6, 3.2]], blocks: [[20, 12, 11, 3.4, 1]], masts: [[11, 16]] },
  // Admirable: a minesweeper with a 3-inch gun forward, the tall bridge, one funnel and 40 mm guns aft (56.2 x 10.1 m;
  // 945 t full).
  'admirable-am': { cls: 'minesweeper', L: 56.2, B: 10.1, fb: 4, sheer: 1.6, guns: '18:1/76 -14:1/40bs -20:1/40bs', funnels: [[-3, 5, 2.2]], blocks: [[12, 0, 8.6, 3.4, 1], [10, 3, 10.4, 2.4]], masts: [[5, 14]] },
  // Dealey: an early post-war escort, enclosed twin 3-inch mounts fore and aft, one capped funnel (95.9 x 11.2 m;
  // 1,914 t full).
  'dealey-de': { cls: 'frigate', L: 95.9, B: 11.2, fb: 5.2, sheer: 2.5, guns: '31:2/76m -34:2/76mb', funnels: [[-2, 6, 3]], blocks: [[23, 6, 10.5, 4.2, 1], [21, 12, 13, 3]], masts: [[9, 18]], radars: [{ x: 9, up: 15, kind: 'array', size: 4 }] },
  // Asheville: a patrol gunboat, the enclosed 3-inch gun forward, the superstructure with its mast, the 40 mm aft (50.1 x
  // 7.3 m; 245 t full).
  'asheville-pg': { cls: 'gunboat', L: 50.1, B: 7.3, fb: 3.2, sheer: 1.2, transom: 0.85, guns: '16:1/76m -18:1/40b', blocks: [[9, -7, 6.4, 3, 1], [7, 1, 8, 2.2, 1]], masts: [[2, 10]], radars: [{ x: 2, up: 8, kind: 'array', size: 2 }] },
  // Cyclone: a coastal patrol ship, a tall superstructure with its mast, 25 mm guns fore and aft (54.6 x 7.9 m; 331 t full).
  'cyclone-pc': { cls: 'patrol-ship', L: 54.6, B: 7.9, fb: 3.4, sheer: 1.5, transom: 0.85, guns: '17:1/25m -14:1/25mb', blocks: [[11, -8, 7.2, 3.4, 1.5], [9, 1, 9.2, 2.6, 1]], masts: [[3, 12]], radars: [{ x: 3, up: 10, kind: 'array', size: 2 }] },
  // PGM-39 class (Kim Qui, PGM-59): a small steel gunboat, a 40 mm gun forward, the bridge amidships, a twin 20 mm aft
  // (30.8 x 6.4 m; 146 t full).
  'pgm-39': { cls: 'gunboat', L: 30.8, B: 6.4, fb: 2.4, sheer: 1, transom: 0.85, guns: '9:1/40 -9:2/20bs', blocks: [[4, -4, 4.8, 2.4, 0.8], [3, -1, 6, 1.6]], masts: [[0, 7]] },
  // Nasty (PTF): a Norwegian-built fast patrol boat, the low bridge, a 40 mm aft and a 20 mm forward (24.5 x 7.5 m;
  // 85 t full).
  'nasty-ptf': { cls: 'torpedo-boat', L: 24.5, B: 7.5, fb: 1.8, sheer: 0.7, transom: 0.85, guns: '8:1/20s -9:1/40b', blocks: [[3, -2, 3.6, 2.2, 0.8]], masts: [[0, 5]] },
  // Flagstaff (PGH-1): a hydrofoil gunboat, the main foils forward on two struts, the tail foil aft on one, the gun on
  // the foredeck (22.2 x 6.6 m; 67.5 t full; as built with a 40 mm gun).
  'flagstaff-pgh': { cls: 'gunboat', L: 22.2, B: 6.6, fb: 2.2, sheer: 0.8, transom: 0.85, guns: '7:1/40', blocks: [[3, -3, 4.4, 2.4, 1]], masts: [[0, 6]], extra: foils([[2, 2.8, 1.6], [-9.5, 0, 2.2]], 3) },
  // Tucumcari (PGH-2): a hydrofoil gunboat with one bow foil and the main foil aft on two struts, a 40 mm gun forward
  // (22.6 x 5.9 m; 58 t full).
  'tucumcari-pgh': { cls: 'gunboat', L: 22.6, B: 5.9, fb: 2.2, sheer: 0.8, transom: 0.85, guns: '6:1/40 -7:2/13bs', blocks: [[2, -3, 4.2, 2.2, 1]], masts: [[0, 6]], extra: foils([[9, 0, 1.2], [-6, 2.4, 1.6]], 3) },
  // Riga (Project 50): a patrol ship, the forecastle with two 100 mm guns, one funnel, a triple torpedo mount, the third
  // 100 mm aft (91.5 x 10.2 m; 1,510 t full).
  'riga-frigate': { cls: 'frigate', L: 91.5, B: 10.2, fb: 5, fc: [-10, 1.4], sheer: 2, guns: '28:1/100m 21:1/100m^2 -30:1/100mb', funnels: [[0, 7, 3.4]], blocks: [[16, 8, 11, 3.4, 1], [14, 9, 12.6, 2.4]], masts: [[10, 16]], tt: [1, 3] },
  // Petya (Project 159): a patrol ship, twin 76 mm turrets fore and aft, the bridge and mast, the wide low funnel, a
  // quintuple torpedo mount (81.8 x 9.2 m; 1,150 t full).
  'petya': { cls: 'frigate', L: 81.8, B: 9.2, fb: 4.6, sheer: 2, transom: 0.7, guns: '24:2/76m -28:2/76mb', funnels: [[-6, 4, 6]], blocks: [[15, 2, 9.6, 3.4, 1.5], [13, 6, 11.5, 2.4]], masts: [[7, 16]], radars: [{ x: 7, up: 14, kind: 'array', size: 3 }], tt: [1, 5] },
  // Parchim (Project 1331): a small anti-submarine ship, the long superstructure, a twin 57 mm aft, a twin 30 mm
  // forward (75.2 x 9.8 m; 960 t full).
  'parchim': { cls: 'corvette', L: 75.2, B: 9.8, fb: 4.4, sheer: 2, transom: 0.75, guns: '22:2/30m -27:2/57mb', blocks: [[14, -16, 8.8, 3.8, 1.5], [12, 2, 11, 2.8, 1]], masts: [[4, 15]], radars: [{ x: 4, up: 13, kind: 'array', size: 3 }] },
  // Leopard (Type 41): a diesel frigate, no funnels but the exhausts in the masts, twin 4.5-inch turrets fore and aft,
  // the long superstructure (103.6 x 12.2 m; 2,300 t full).
  'leopard-type-41': { cls: 'frigate', L: 103.6, B: 12.2, fb: 5.4, sheer: 2.6, transom: 0.7, guns: '33:2/114 -33:2/114b', blocks: [[25, -24, 9.6, 4.8, 1], [22, 12, 12.4, 3.4, 1], [2, -4, 13, 2], [-14, -20, 13, 2]], masts: [[16, 18], [-17, 16]], radars: [{ x: 16, up: 15, kind: 'array', size: 4 }, { x: -17, up: 13, kind: 'array', size: 4 }] },
  // Whitby (Type 12): the high raked bow, a twin 4.5-inch turret forward, the bridge and lattice mast, one funnel, the
  // Limbo mortar well aft (112.8 x 12.5 m; 2,560 t full).
  'whitby-type-12': { cls: 'frigate', L: 112.8, B: 12.5, fb: 5.4, sheer: 3.6, transom: 0.65, guns: '35:2/114', funnels: [[-4, 7, 4.2]], blocks: [[27, 12, 11.5, 4.4, 1.5], [24, 16, 14, 3.2, 1], [-10, -26, 9, 4]], masts: [[9, 20]], radars: [{ x: 9, up: 17, kind: 'array', size: 4 }] },
  // Restigouche: a Canadian escort, a twin 3-inch/70 forward and a twin 3-inch/50 aft, one funnel, the lattice mast
  // (113.1 x 12.8 m; 2,800 t full).
  'restigouche': { cls: 'frigate', L: 113.1, B: 12.8, fb: 5.6, sheer: 3.4, transom: 0.65, guns: '35:2/76m -36:2/76mb', funnels: [[-2, 7, 4]], blocks: [[27, 12, 11.6, 4.4, 1.5], [24, 16, 14, 3.2, 1], [-10, -26, 9, 4]], masts: [[10, 20]], radars: [{ x: 10, up: 17, kind: 'array', size: 4 }] },
  // Le Corse (E 50): a French escort, two twin 57 mm forward and one aft, one funnel, the mast with its radar (99.8 x
  // 10.3 m; 1,702 t full).
  'le-corse-e50': { cls: 'frigate', L: 99.8, B: 10.3, fb: 5.2, sheer: 2.6, transom: 0.7, guns: '33:2/57m 26:2/57m^2 -33:2/57mb', funnels: [[-2, 6, 3.6]], blocks: [[20, 8, 11, 3.6, 1.5], [18, 11, 13.5, 2.6]], masts: [[10, 18]], radars: [{ x: 10, up: 15, kind: 'array', size: 4 }], tt: [1, 3] },
  // Albatros (Italian corvette): two 76 mm guns fore and aft, the bridge and one funnel (76.3 x 9.6 m; 950 t full).
  'albatros-corvette': { cls: 'corvette', L: 76.3, B: 9.6, fb: 4.6, sheer: 2, transom: 0.7, guns: '25:1/76m -26:1/76mb', funnels: [[-2, 5, 2.8]], blocks: [[16, 4, 9.4, 3.4, 1], [14, 8, 11.2, 2.4]], masts: [[7, 15]] },
  // Cassiopea: an offshore patrol ship, the 76 mm gun forward, the superstructure and mast, the hangar and the flight deck
  // aft (79.8 x 11.8 m; 1,475 t full).
  'cassiopea-opv': { cls: 'patrol-ship', L: 79.8, B: 11.8, fb: 5, sheer: 2.2, transom: 0.8, guns: '27:1/76m', blocks: [[19, -14, 10, 5, 1.5], [16, 6, 12.6, 3.8, 1.5]], masts: [[6, 18]], radars: [{ x: 6, up: 15, kind: 'array', size: 3 }], helideck: true },
  // Peacock: a Hong Kong patrol ship (later the Irish Orla), the 76 mm gun forward, a long superstructure with its mast
  // (62.6 x 10 m; 712 t full).
  'peacock-pc': { cls: 'corvette', L: 62.6, B: 10, fb: 4.2, sheer: 1.8, transom: 0.8, guns: '21:1/76m', blocks: [[13, -12, 8.4, 4.2, 1.5], [11, 3, 10.4, 3, 1.5]], masts: [[4, 13]], radars: [{ x: 4, up: 11, kind: 'array', size: 2.5 }] },
  // Jaguar (Type 140): a German torpedo boat, 40 mm guns fore and aft, the low bridge, four torpedo tubes along the
  // sides (42.6 x 7.1 m; 210 t full).
  'jaguar-type-140': { cls: 'torpedo-boat', L: 42.6, B: 7.1, fb: 2.4, sheer: 1, transom: 0.85, guns: '13:1/40 -16:1/40b', blocks: [[6, -1, 5, 2.6, 0.8]], masts: [[2, 8]], launchers: [{ x: -6, length: 7, width: 3, kind: 'tubes', count: 1, elevation: 0 }] },
  // Brave: a gas-turbine fast patrol boat, 40 mm guns fore and aft, the low bridge, torpedo tubes on the sides (29.9 x
  // 7.8 m; 114 t full).
  'brave-fpb': { cls: 'torpedo-boat', L: 29.9, B: 7.8, fb: 1.9, sheer: 0.7, transom: 0.9, guns: '9:1/40 -10:1/40b', blocks: [[3, -2.5, 4, 2.6, 0.8]], masts: [[0, 6]], launchers: [{ x: -4, length: 6, width: 2.6, kind: 'tubes', count: 1, elevation: 0 }] },
  // Trident: a French patrol boat, a 40 mm gun forward, the bridge, SS-12 missile rails aft (40.7 x 5.9 m; 145 t full).
  'trident-pc': { cls: 'patrol-boat', L: 40.7, B: 5.9, fb: 2.4, sheer: 1, transom: 0.85, guns: '12:1/40', blocks: [[5, -3, 5.4, 2.4, 1]], masts: [[1, 8]], launchers: [{ x: -11, length: 3, width: 2, kind: 'tubes', count: 1, elevation: 0.2 }] },
};
for (const [name, o] of Object.entries(R)) N[name] = ship(o);

// Every surface ship's raised guns stand on barbettes from the deck (the classes above and the hand-built ones alike).
for (const spec of Object.values(N)) {
  if (spec.hull === 'submarine' || spec.hull === 'carrier' || !spec.turrets?.length) continue;
  const top = (spec.hullOutline ?? defaultHull(spec)).top;
  const more = barbettes(spec.turrets, (x) => lerpPoly(top, x), spec.freeboard);
  if (more.length) spec.oneSide = [...(spec.oneSide ?? []), ...more];
}

/** War Thunder coastal and escort ships that had no figure, mapped to their class (from the public wiki's vehicle lists); a few still to a near relative. */
const ALIASES: Record<string, string> = {
  'germ_kanonenboot_k4_lorelei': 'aviso-elan',
  'germ_kanonenboot_k2': 'aviso-elan',
  'uk_egret_class': 'egret-sloop',
  'uk_minelayer_abdiel_class_abdiel': 'abdiel',
  'jp_minelayer_tsugaru': 'j-class',
  'us_pt6': 'elco-80',
  'us_elco_77ft_pt20': 'elco-80',
  'us_nasty_ptf': 'nasty-ptf',
  'us_huckins_78ft_pt95': 'elco-80',
  'us_pt3': 'elco-80',
  'us_elco_80ft_pt_boat': 'elco-80',
  'us_pc_451': 'pc-subchaser',
  'us_higgins_78ft_pt71': 'higgins-78',
  'us_sc_497': 'pc-subchaser',
  'us_pc_466_carmi': 'pc-subchaser',
  'us_huckins_78ft_pt262': 'elco-80',
  'us_elco_80ft_pt174': 'elco-80',
  'us_elco_80ft_pt109_boat': 'elco-80',
  'us_elco_80ft_pt_boat_mod01': 'elco-80',
  'us_higgins_78ft_pt625': 'higgins-78',
  'us_pgm_59_class': 'pgm-39',
  'us_elco_80ft_pt_boat_mod02': 'elco-80',
  'us_elco_77ft_pt59': 'elco-80',
  'us_lcm_zippo': 'lcm',
  'us_higgins_78ft_pt658': 'higgins-78',
  'us_elco_80ft_pt_boat_thunderbolt': 'elco-80',
  'us_flagstaff_pgh1': 'flagstaff-pgh',
  'us_tucumcari_pgh2': 'tucumcari-pgh',
  'us_ashville_class': 'asheville-pg',
  'us_pgm_9_class': 'type-143-fac',
  'us_pt812': 'elco-80',
  'us_admirable_class': 'admirable-am',
  'us_pt811': 'elco-80',
  'us_ashville_class_douglas': 'asheville-pg',
  'us_pt810': 'elco-80',
  'us_lcs_l_3': 'lci-l',
  'us_cyclone_class_cyclone': 'cyclone-pc',
  'us_frigate_tacoma': 'river-frigate',
  'us_frigate_buckley_class_coolbaugh': 'buckley-de',
  'us_frigate_dealey': 'dealey-de',
  'germ_ls_class': 'mas-boat',
  'germ_rboot_r41': 'r-boot',
  'germ_s38': 'schnellboot',
  'germ_ls4_class': 'mas-boat',
  'germ_km5': 'mas-boat',
  'germ_s38b': 'schnellboot',
  'germ_rboot_r130': 'r-boot',
  'germ_s30_s61': 'schnellboot',
  'germ_rboot_r301': 'r-boot',
  'germ_s_100_class': 'schnellboot',
  'germ_rboot_r310': 'r-boot',
  'germ_s_100_s_174_class': 'schnellboot',
  'germ_sf40_schwere_flakkampffaehre': 'marinefahrprahm',
  'germ_vs10_hydrofoil': 'schnellboot',
  'germ_pr_131': 'project-206',
  'germ_sf40_leichte_flakkampffaehre': 'marinefahrprahm',
  'germ_s_100_s204_lang': 'schnellboot',
  'germ_s_700_s_706': 'schnellboot',
  'germ_vs8_hydrofoil': 'schnellboot',
  'germ_s_700_s_701': 'schnellboot',
  'germ_mz_1': 'marinefahrprahm',
  'germ_artilleriefahrprahm_typ_d1': 'marinefahrprahm',
  'germ_rdm242': 'r-boot',
  'germ_minelayer_drache': 'aviso-elan',
  'germ_artilleriefahrprahm_typ_d3': 'marinefahrprahm',
  'germ_schutze_class': 'r-boot',
  'germ_escort_typem1935': 'flower-corvette',
  'germ_kondor2_class': 'pc-subchaser',
  'germ_escort_typem1943': 'flower-corvette',
  'germ_frigate_koln_lubeck': 'koln-frigate',
  'germ_skr_pr50_karl_marx': 'riga-frigate',
  'germ_type143_albatros': 'type-143-fac',
  'germ_type140_jaguar': 'jaguar-type-140',
  'germ_pr1331': 'parchim',
  'germ_pr_206': 'project-206',
  'germ_frigate_koln': 'koln-frigate',
  'germ_type152_hugin': 'jaguar-type-140',
  'germ_type153_pfeil': 'jaguar-type-140',
  'germ_type143_bussard': 'type-143-fac',
  'ussr_g5_mtb': 'g-5-torpedo-boat',
  'ussr_mo_4': 'project-183',
  'ussr_d3_tk126': 'project-183',
  'ussr_d3': 'project-183',
  'ussr_od_200': 'project-183',
  'ussr_pr_103_sm4': 'project-183',
  'ussr_g5_mtb_shvak': 'g-5-torpedo-boat',
  'ussr_g5_rct': 'g-5-torpedo-boat',
  'ussr_ya_5m': 'armed-speedboat',
  'ussr_mpk_163': 'pc-subchaser',
  'ussr_mpk_122a': 'pc-subchaser',
  'ussr_pr253l': 'project-183',
  'ussr_pr_123bis': 'project-183',
  'ussr_1124_art': 'gunboat-1124',
  'ussr_pr_123k': 'project-183',
  'ussr_pr_123k_hydrofoils': 'project-183',
  'ussr_1124_rct': 'gunboat-1124-mrls',
  'ussr_pr_1204': 'gunboat-1124',
  'ussr_mpk_122bis': 'pc-subchaser',
  'ussr_pr_1204_late': 'gunboat-1124',
  'ussr_1124_ack': 'gunboat-1124',
  'ussr_pr_191': 'gunboat-1124',
  'ussr_fugas_t1_strela': 'flower-corvette',
  'ussr_pr_191m': 'gunboat-1124',
  'ussr_pr_183_egypt_bm_21': 'project-183',
  'ussr_mbk_161_1943': 'gunboat-1124',
  'ussr_bmo': 'gunboat-1124',
  'ussr_skr_groza_1943': 'aviso-elan',
  'ussr_mkl_186': 'gunboat-1124',
  'ussr_pr_183': 'project-183',
  'ussr_mpk_201m': 'pc-subchaser',
  'ussr_mbk_161_1944': 'gunboat-1124',
  'ussr_mpk_204': 'pc-subchaser',
  'ussr_mkl_186_mk85': 'gunboat-1124',
  'ussr_mpk_201k': 'pc-subchaser',
  'ussr_skr_pr50plo_rosomacha': 'riga-frigate',
  'ussr_mpk_pr12412p': 'pc-subchaser',
  'ussr_pr_206': 'project-206',
  'ussr_skr_pr50_jenot': 'riga-frigate',
  'ussr_mpk_pr12412': 'pc-subchaser',
  'ussr_pr_206m': 'project-206',
  'ussr_mpk_pr1331m': 'parchim',
  'ussr_mpk_pr11451': 'pc-subchaser',
  'ussr_skr_pr159': 'petya',
  'ussr_mpk_pr_1124': 'grisha',
  'ussr_skr_pr35': 'petya',
  'ussr_pr_205pe_k225': 'osa-missile-boat',
  'uk_mtb_1series': 'vosper-mtb',
  'uk_mtb_vosper_1series': 'vosper-mtb',
  'uk_mtb35_vosper': 'vosper-mtb',
  'uk_mtb_vosper_2series': 'vosper-mtb',
  'uk_fairmile_a_ml100': 'fairmile-b',
  'uk_hdml_ml1383': 'fairmile-b',
  'uk_70ft_mgb': 'vosper-mtb',
  'uk_mtb_2series': 'vosper-mtb',
  'uk_73ft_vosper_type1': 'vosper-mtb',
  'uk_isles_class_trawler': 'flower-corvette',
  'uk_fairmile_b_ml345': 'fairmile-b',
  'uk_flower_class': 'flower-corvette',
  'uk_dark_class': 'vosper-mtb',
  'uk_73ft_vosper_type2': 'vosper-mtb',
  'uk_71ft_mgb': 'vosper-mtb',
  'uk_71ft_mtb460': 'vosper-mtb',
  'uk_fairmile_c': 'fairmile-b',
  'uk_dark_class_mtb': 'vosper-mtb',
  'uk_fairmile_lcs_l_h_mk2': 'lci-l',
  'uk_fairmile_d_617_632': 'fairmile-d',
  'uk_fairmile_d_601_616': 'fairmile-d',
  'uk_gay_class_archer': 'vosper-mtb',
  'uk_higgins_78ft_mtb422': 'higgins-78',
  'uk_fairmile_d_5001_5029': 'fairmile-d',
  'uk_dark_class_mtb_td': 'vosper-mtb',
  'uk_sgb_309': 'fairmile-d',
  'uk_fairmile_d_697_800': 'fairmile-d',
  'uk_attack_class_arrow': 'fairmile-b',
  'uk_sgb_304': 'fairmile-d',
  'uk_fremantle_class': 'fairmile-d',
  'uk_fairmile_c_332': 'fairmile-b',
  'uk_corvette_orla': 'peacock-pc',
  'uk_frigate_river': 'river-frigate',
  'uk_frigate_whitby': 'whitby-type-12',
  'uk_brave_borderer': 'brave-fpb',
  'uk_frigate_whitby_blackpool': 'whitby-type-12',
  'uk_destroyer_restigouche_class_terranova': 'restigouche',
  'uk_corvette_peacock': 'peacock-pc',
  'uk_frigate_leopard': 'leopard-type-41',
  'jp_t14_class': 'mas-boat',
  'jp_type_t1_1941': 'mas-boat',
  'jp_t14_class_mod02': 'mas-boat',
  'jp_abtei_pr1': 'gunboat-1124',
  'jp_type5_escortboat': 'mas-boat',
  'jp_t14_class_mod01': 'mas-boat',
  'jp_ujishima_msc': 'r-boot',
  'jp_abtei_pr4': 'gunboat-1124',
  'jp_karotei_type2': 'mas-boat',
  'jp_type38_1944': 'mas-boat',
  'jp_sehatei_mod1': 'mas-boat',
  'jp_type1_pt2': 'elco-80',
  'jp_kusen_tei_13_1942': 'pc-subchaser',
  'jp_karotei_type4': 'mas-boat',
  'jp_kusen_tei_13_1944': 'pc-subchaser',
  'jp_no1_ch2': 'pc-subchaser',
  'jp_t51b': 'mas-boat',
  'jp_no4_ch8': 'pc-subchaser',
  'jp_pc301_kari_class': 'pc-subchaser',
  'jp_type7_pt808': 'elco-80',
  'jp_type9_pt809': 'elco-80',
  'jp_t51a': 'mas-boat',
  'jp_type_11_pt_15': 'elco-80',
  'jp_escort_chikugo_class': 'buckley-de',
  'jp_escort_ikazuchi_class': 'buckley-de',
  'jp_escort_akebono_class': 'buckley-de',
  'jp_pg02': 'elco-80',
  'jp_escort_hiburi_class_syonan': 'hiburi-kaibokan',
  'jp_destroyer_isuzu': 'buckley-de',
  'jp_yuri_class_asagao': 'vosper-mtb',
  'jp_destroyer_ayanami': 'koln-frigate',
  'jp_destroyer_chidori': 'ciclone-tb',
  'jp_escort_hiburi_class_shisaka': 'hiburi-kaibokan',
  'it_mas_classe500_3_1944': 'mas-boat',
  'it_mas_classe500_3': 'mas-boat',
  'it_vas_baglietto_68t_1serie': 'vosper-mtb',
  'it_mas_classe429': 'mas-boat',
  'it_mas_classe500_4': 'mas-boat',
  'it_ms15_1a': 'vosper-mtb',
  'it_ms53_2a': 'vosper-mtb',
  'it_mas_stefano_turr': 'mas-boat',
  'it_mas441': 'mas-boat',
  'it_a1_vosper': 'vosper-mtb',
  'it_ms471_1a': 'vosper-mtb',
  'it_ms473_2a': 'vosper-mtb',
  'it_ms444': 'vosper-mtb',
  'it_mc_485': 'vosper-mtb',
  'it_mc490_folgore': 'vosper-mtb',
  'it_ms473_2a_art': 'vosper-mtb',
  'it_mc492_baleno': 'vosper-mtb',
  'it_gabbiano_class': 'gabbiano-corvette',
  'it_gabbiano_class_c16': 'gabbiano-corvette',
  'it_p493_freccia': 'type-143-fac',
  'it_p420_sparviero': 'mas-boat',
  'it_alano_9851': 'type-143-fac',
  'it_ciclone_class_ghibli': 'ciclone-tb',
  'it_cassiopea_p401': 'cassiopea-opv',
  'it_albatros_class_f543': 'albatros-corvette',
  'it_p494_saetta': 'type-143-fac',
  'it_albatros_class_f544': 'albatros-corvette',
  'fr_vtb8': 'vtb-boat',
  'fr_vtb11': 'vtb-boat',
  'fr_vtb14': 'vtb-boat',
  'fr_vtb13': 'vtb-boat',
  'fr_vtb12_mod': 'vtb-boat',
  'fr_lcm_monitor': 'lcm',
  'fr_vtb18': 'vtb-boat',
  'fr_vtb10': 'vtb-boat',
  'fr_vtb9': 'vtb-boat',
  'fr_type40k_vedette': 'vtb-boat',
  'fr_mtb96_vosper': 'vosper-mtb',
  'fr_flower_class_aconit': 'flower-corvette',
  'fr_adroit_class': 'bourrasque',
  'fr_lcg_m_l9059': 'lci-l',
  'fr_arras_class_arras': 'aviso-elan',
  'fr_marne_class_marne': 'aviso-elan',
  'fr_arras_class_amiens': 'aviso-elan',
  'fr_trident_class_glaive_p671': 'trident-pc',
  'fr_marne_class_aisne': 'aviso-elan',
  'fr_vlt1': 'vtb-boat',
  'fr_elan_class_commandant_domine': 'aviso-elan',
  'fr_frigate_croix_de_lorraine_class_la_surprise': 'river-frigate',
  'fr_vlt2': 'vtb-boat',
  'fr_frigate_corse_class_corse': 'le-corse-e50',
  'fr_p730_combattante': 'la-combattante',
  'fr_frigate_corse_class_brestois': 'le-corse-e50',
};

export const SHIP_CLASSES: SpecSet = { naval: N, aliases: ALIASES };
