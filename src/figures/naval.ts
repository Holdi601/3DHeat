/**
 * Ships and boats from their hull and what stands on the deck: superstructure
 * blocks, gun turrets with their barrels, funnels, masts and the radars on
 * them, missile cells and canisters, a flight deck and island for a carrier,
 * a sail for a submarine. Built on the waterline (y = 0) with what is under
 * water left out, as a ship is seen.
 */

import { finish, newKit, PAINT, type Kit, type Template } from './kit';
import { blob, block, body, hexa, lerpPoly, outlineBody, plate, slab, tiltBox, tube, type Outline, type P2 } from './parts';
import { litQuad, litTriangle, type Section } from '../race/shapes';
import { at, type Rgb, type Vec3 } from '../race/geometry';

const grey = (k: number): Rgb => [k, k, k];

export interface NavalTurret {
  x: number;
  size: number;
  barrels: number;
  length: number;
  calibre: number;
  /** Faces aft. */
  back?: boolean;
  /** Raised above the deck (superfiring). */
  up?: number;
  /** Off the centreline (wing turrets, secondary mounts). */
  side?: number;
  /**
   * round: a domed gunhouse (default). box: a big-gun turret with a flat
   * sloped face (battleships, cruisers). mount: a small faceted modern gun
   * mount. shield: an open gun behind a shield wrapping its front and sides.
   */
  kind?: 'round' | 'box' | 'mount' | 'shield';
  /** The gunhouse's (or shield's) height over its base, in place of the default share of its size. */
  height?: number;
}

export interface NavalRadar {
  x: number;
  /** Height of the antenna above the deck. */
  up: number;
  /**
   * array: a wide rotating search antenna on a mast. dish, dome. panel: one
   * flat face. faces: four fixed phased-array faces round a block (Aegis).
   */
  kind: 'array' | 'dish' | 'dome' | 'panel' | 'faces';
  size: number;
  side?: number;
}

export interface NavalSpec {
  length: number;
  beam: number;
  /** Deck height above the waterline. */
  freeboard: number;
  hull?: 'warship' | 'boat' | 'carrier' | 'submarine' | 'landing' | 'rhib' | 'hover' | 'merchant';
  /** Blocks on deck: forward position of the middle, length, width, height above the deck. */
  superstructure?: { x: number; length: number; width: number; height: number; side?: number; up?: number }[];
  turrets?: NavalTurret[];
  /**
   * Funnels: diameter is fore and aft; width, when given, athwartships (an oval
   * stack); rake, how far the top stands aft per metre of height; cap, a
   * deeper band or cowl round the top this high.
   */
  funnels?: { x: number; height: number; diameter: number; side?: number; width?: number; rake?: number; cap?: number }[];
  /**
   * Masts: pole (default), tripod (two legs splayed aft), lattice (a tapering
   * truss); yard, the yardarm's span (default a third of the beam); base, the
   * height its foot stands on over the deck (a mast stepped on a bridge).
   */
  masts?: { x: number; height: number; side?: number; kind?: 'pole' | 'tripod' | 'lattice'; yard?: number; base?: number }[];
  /**
   * Missile launchers: forward position, length, width. vls: flush cells, a
   * grid of hatches (default). box: a raised armoured box. tubes: canisters
   * angled up, in pairs either side (`count` per side).
   */
  launchers?: { x: number; length: number; width: number; kind?: 'vls' | 'box' | 'tubes'; count?: number; elevation?: number; up?: number; height?: number }[];
  radars?: NavalRadar[];
  /** A submarine's sail: forward position, length, height. */
  sail?: { x: number; length: number; height: number };
  /** Carrier: an angled landing deck to port. */
  angled?: boolean;
  /** Carrier: a ski-jump ramp at the bow. */
  skiJump?: boolean;
  /** A helicopter deck marked on the stern. */
  helideck?: boolean;
  /**
   * The hull's true shape, in place of the generic one: its deck line (sheer,
   * forecastle step, quarterdeck) over the waterline and its half-beam plan
   * (the bow's entry, the transom), forward from the middle, up from the
   * waterline. Not for submarines and hovercraft.
   */
  hullOutline?: Outline;
  /** More parts from outlines: superstructure, bridges, hangars, stacks, sails; mirrored when off the centre line. */
  bodies?: Outline[];
  /** The deck's rise to the bow above the freeboard (default a third of it). */
  sheer?: number;
  /** A raised forecastle (or a flush deck's break): where it ends, forward of the middle, and how far the deck steps down aft of it. */
  forecastle?: { x: number; step: number };
  /** The stern's width at the transom as a share of the beam (default 0.55; a cruiser stern narrower). */
  transom?: number;
  /** Bodies standing off the centre line on one side only, not mirrored: a carrier's island, a crane, a deckhouse to one side. */
  oneSide?: Outline[];
  /**
   * Flat decks from their plan, any shape (forward, side; positive side is
   * starboard): a carrier's flight deck with its angled deck and sponsons, a
   * vehicle deck, a helicopter platform. A carrier given decks draws no
   * default flight deck.
   */
  decks?: { plan: P2[]; up: number; thickness?: number }[];
  /** Ducted propellers and fans, their axis fore and aft: a hovercraft's or an airboat's. */
  ducts?: { x: number; side: number; up: number; diameter: number; length: number }[];
}

/**
 * The hull a warship or merchant gets without an outline of its own: the deck
 * rising to the bow over its sheer, stepping down aft of a forecastle, a fine
 * entry widening to full beam, and the stern narrowing to its transom.
 */
export function defaultHull(spec: NavalSpec): Outline {
  const L = spec.length;
  const h = L / 2;
  const b = spec.beam / 2;
  const fb = spec.freeboard;
  const rise = spec.sheer ?? fb * 0.3;
  const step = spec.forecastle?.step ?? 0;
  const pts: P2[] = [[h, fb + rise], [h - L * 0.06, fb + rise * 0.7], [h - L * 0.18, fb + rise * 0.35], [h - L * 0.35, fb + rise * 0.05]];
  if (spec.forecastle) {
    const x = Math.min(spec.forecastle.x, h - L * 0.36);
    pts.push([x + 0.3, fb], [x - 0.3, fb - step]);
  }
  pts.push([-h + L * 0.05, fb - step + rise * 0.05], [-h, fb - step + rise * 0.1]);
  const top = pts.sort((p, q) => q[0] - p[0]);
  const plan: P2[] = [[h, b * 0.03], [h - L * 0.04, b * 0.35], [h - L * 0.12, b * 0.7], [h - L * 0.28, b * 0.97], [h - L * 0.4, b], [-h + L * 0.22, b], [-h + L * 0.07, b * 0.85], [-h, b * (spec.transom ?? (spec.hull === 'merchant' ? 0.7 : 0.55))]];
  return { top, bottom: plan.map(([x]) => [x, 0] as P2), plan, round: 8, stations: 30 };
}

export function buildNaval(spec: NavalSpec): Template {
  const k = newKit();
  const L = spec.length;
  const half = L / 2;
  const b = spec.beam / 2;
  let fb = spec.freeboard;
  const kind = spec.hull ?? 'warship';
  const S = (x: number, w: number, h: number, z: number): Section => ({ x, w: Math.max(0.02, w), h: Math.max(0.02, h), z });
  if (kind === 'submarine') {
    if (spec.hullOutline) {
      // A boat from its outlines: the hull awash, the sail, planes and rudders as bodies.
      outlineBody(k.team, k.fr, spec.hullOutline, grey(0.55), 14);
      for (const o of spec.bodies ?? []) {
        outlineBody(k.team, k.fr, o, grey(0.5), 12);
        if (o.side) outlineBody(k.team, k.fr, { ...o, side: -o.side }, grey(0.5), 12);
      }
      for (const t of spec.turrets ?? []) turret(k, t, fb);
      return finish(k, 'ground');
    }
    // A long round body awash: a round bow, tapering to the stern, the sail standing up from it.
    body(k.team, k.fr, [S(half, b * 0.35, b * 0.35, 0), S(half - L * 0.03, b * 0.85, b * 0.85, 0), S(half - L * 0.1, b, b, 0), S(-half + L * 0.32, b, b, 0), S(-half + L * 0.06, b * 0.35, b * 0.35, 0), S(-half, 0.05, 0.05, 0)], grey(0.55), 12, 2);
    // The cross of control surfaces at the stern.
    plate(k.team, k.fr, [[-half + L * 0.1, -b * 1.2], [-half + L * 0.03, -b * 1.2], [-half + L * 0.03, b * 1.2], [-half + L * 0.1, b * 1.2]], 0, 0.15, grey(0.5));
    block(k.team, k.fr, [-half + L * 0.065, 0, 0], L * 0.07, 0.15, b * 2.4, grey(0.5));
    const s = spec.sail ?? { x: L * 0.15, length: L * 0.1, height: b * 2.2 };
    block(k.team, k.fr, [s.x, 0, b + s.height / 2 - b * 0.4], s.length, b * 0.45, s.height, grey(0.5));
    plate(k.team, k.fr, [[s.x + s.length * 0.2, -b * 1.1], [s.x - s.length * 0.2, -b * 1.1], [s.x - s.length * 0.2, b * 1.1], [s.x + s.length * 0.2, b * 1.1]], b + s.height * 0.6 - b * 0.4, 0.15, grey(0.5));
    if (!spec.turrets?.length) return finish(k, 'ground');
    // A deck gun stands on the casing's top.
    fb = b * 0.95;
    for (const t of spec.turrets) turret(k, t, fb);
    return finish(k, 'ground');
  }
  if (kind === 'hover') {
    blob(k.fixed, k.fr, [0, 0, fb * 0.35], [half, b, fb * 0.4], PAINT.dark);
    block(k.team, k.fr, [0, 0, fb * 0.9], L * 0.85, spec.beam * 0.85, fb * 0.4, grey(0.85));
    for (const side of [-1, 1]) tube(k.fixed, k.fr, [-half * 0.75, side * b * 0.4, fb * 1.1], [-half * 0.85, side * b * 0.4, fb * 1.1], fb * 0.7, fb * 0.7, PAINT.metal, 12);
  } else {
    // The hull: a sharp bow, full beam from a third of the length aft, a transom stern.
    const bow = kind === 'landing' ? 0.85 : kind === 'rhib' || kind === 'boat' ? 0.35 : kind === 'merchant' ? 0.3 : 0.08;
    const hullO = spec.hullOutline ?? (kind === 'warship' || kind === 'merchant' ? defaultHull(spec) : undefined);
    if (hullO) outlineBody(k.team, k.fr, hullO, grey(0.75), 14, 1, grey(0.55));
    else body(
      k.team,
      k.fr,
      [S(half, b * bow, fb * 0.5, fb * 0.55), S(half - L * 0.12, b * 0.7, fb * 0.5, fb * 0.5), S(half - L * 0.32, b, fb * 0.5, fb * 0.5), S(-half + L * 0.1, b, fb * 0.5, fb * 0.5), S(-half, b * 0.85, fb * 0.45, fb * 0.55)],
      grey(0.75),
      12,
      4,
    );
    // The deck.
    const deckCol = kind === 'carrier' ? grey(0.45) : PAINT.deck;
    if (kind === 'carrier' && spec.decks?.length) {
      // The flight deck comes from its own plan below.
    } else if (kind === 'carrier') {
      // A flight deck wider than the hull, overhanging to the left.
      plate(k.fixed, k.fr, [[half - L * 0.02, -b * 1.6], [-half, -b * 1.6], [-half, b * 1.15], [half - L * 0.02, b * 0.9]], fb + 0.5, 1.0, deckCol);
      if (spec.angled) {
        // The angled deck's sponson out to port, and its centreline.
        plate(k.fixed, k.fr, [[half - L * 0.35, -b * 1.6], [-half + L * 0.05, -b * 1.6], [-half + L * 0.05, -b * 2.1], [half - L * 0.45, -b * 2.35]], fb + 0.5, 1.0, deckCol);
        plate(k.fixed, k.fr, [[half - L * 0.42, -b * 1.9], [-half + L * 0.05, -b * 0.25], [-half + L * 0.05, -b * 0.15], [half - L * 0.42, -b * 1.8]], fb + 1.02, 0.05, PAINT.light);
      } else plate(k.fixed, k.fr, [[half - L * 0.4, -b * 0.08], [-half + L * 0.05, -b * 0.08], [-half + L * 0.05, b * 0.02], [half - L * 0.4, b * 0.02]], fb + 1.02, 0.05, PAINT.light);
      if (spec.skiJump) {
        const x0 = half - L * 0.14;
        hexa(k.fixed, k.fr, [[x0, -b * 1.1, fb + 1.0], [half - L * 0.02, -b * 1.1, fb + 1.0], [half - L * 0.02, b * 0.85, fb + 1.0], [x0, b * 0.85, fb + 1.0]], [[x0, -b * 1.1, fb + 1.0], [half - L * 0.02, -b * 1.1, fb + 1.0 + L * 0.025], [half - L * 0.02, b * 0.85, fb + 1.0 + L * 0.025], [x0, b * 0.85, fb + 1.0]], grey(0.5));
      }
    } else if (kind === 'rhib') {
      blob(k.fixed, k.fr, [0, -b * 0.85, fb * 0.6], [half * 0.95, b * 0.2, fb * 0.35], PAINT.dark);
      blob(k.fixed, k.fr, [0, b * 0.85, fb * 0.6], [half * 0.95, b * 0.2, fb * 0.35], PAINT.dark);
    } else if (kind === 'landing') {
      plate(k.fixed, k.fr, [[half, -b * 0.9], [-half + L * 0.2, -b * 0.9], [-half + L * 0.2, b * 0.9], [half, b * 0.9]], fb * 0.6, 0.1, deckCol);
      block(k.team, k.fr, [half - 0.15, 0, fb * 1.0], 0.3, spec.beam * 0.9, fb * 0.9, grey(0.8));
    }
    if (spec.helideck) {
      const x0 = -half + Math.min(L * 0.02, 2);
      const x1 = x0 + Math.min(L * 0.18, 26);
      // On the hull's own deck where it has one (lower than the freeboard at the stern).
      const hd = hullO ? Math.min(fb, lerpPoly(hullO.top, (x0 + x1) / 2)) : fb;
      plate(k.fixed, k.fr, [[x1, -b * 0.85], [x0, -b * 0.8], [x0, b * 0.8], [x1, b * 0.85]], hd + 0.03, 0.04, grey(0.36));
      plate(k.fixed, k.fr, [[(x0 + x1) / 2 + b * 0.25, -b * 0.25], [(x0 + x1) / 2 - b * 0.25, -b * 0.25], [(x0 + x1) / 2 - b * 0.25, b * 0.25], [(x0 + x1) / 2 + b * 0.25, b * 0.25]], hd + 0.07, 0.03, PAINT.light, 0.7);
    }
  }
  const carrierOff = kind === 'carrier' ? b * 0.9 : 0;
  const deckUp = kind === 'carrier' ? 1 : 0;
  for (const s of spec.superstructure ?? []) {
    const side = s.side ?? carrierOff;
    const base = fb + deckUp + (s.up ?? 0);
    block(k.team, k.fr, [s.x, side, base + s.height / 2], s.length, s.width, s.height, grey(0.88));
    // Bridge windows on the front face.
    block(k.fixed, k.fr, [s.x + s.length / 2 + 0.02, side, base + s.height * 0.8], 0.06, s.width * 0.8, Math.min(0.9, s.height * 0.15), PAINT.glass);
  }
  for (const f of spec.funnels ?? []) {
    const fs = f.side ?? carrierOff;
    if (f.width === undefined && f.rake === undefined && !f.cap) tube(k.team, k.fr, [f.x, fs, fb + deckUp], [f.x - f.diameter * 0.3, fs, fb + deckUp + f.height], f.diameter / 2, f.diameter * 0.45, grey(0.6), 10);
    else stack(k, f, fs, fb + deckUp);
  }
  for (const m of spec.masts ?? []) mast(k, m, m.side ?? carrierOff, fb + (m.base ?? 0), fb + deckUp + m.height, fb + deckUp + m.height * 0.75, spec.beam);
  for (const d of spec.decks ?? []) slab(k.fixed, k.fr, d.plan, (f, s) => [f, s, d.up], [0, 0, 1], d.thickness ?? 0.4, kind === 'carrier' ? grey(0.45) : PAINT.deck);
  for (const o of spec.bodies ?? []) {
    outlineBody(k.team, k.fr, o, grey(0.86), 12);
    if (o.side) outlineBody(k.team, k.fr, { ...o, side: -o.side }, grey(0.86), 12);
  }
  for (const o of spec.oneSide ?? []) outlineBody(k.team, k.fr, o, grey(0.86), 12);
  for (const d of spec.ducts ?? []) duct(k, d);
  for (const r of spec.radars ?? []) radar(k, r, fb + deckUp, r.side ?? carrierOff);
  for (const t of spec.turrets ?? []) turret(k, t, fb);
  for (const l of spec.launchers ?? []) launcher(k, l, fb, spec.beam);
  return finish(k, 'ground');
}

function turret(k: Kit, t: NavalTurret, fb: number): void {
  const up = fb + (t.up ?? 0);
  const s = t.side ?? 0;
  const dir = t.back ? -1 : 1;
  const kind = t.kind ?? 'round';
  const z = t.size;
  let face = z * 0.3;
  let gunUp = up + z * 0.22;
  if (kind === 'round') blob(k.team, k.fr, [t.x, s, up + ((t.height ?? z * 0.46) * 0.18) / 0.46], [z / 2, z / 2, ((t.height ?? z * 0.46) * 0.28) / 0.46], grey(0.82));
  else if (kind === 'shield') {
    // An open gun: the pedestal, and the shield round its front and sides, its face raked back.
    const h = t.height ?? z * 0.55;
    const l = z * 0.55;
    const w = z * 0.75;
    const fx = t.x + dir * l * 0.6;
    const bx = t.x - dir * l * 0.4;
    const bottom: Vec3[] = [[bx, s - w / 2, up + 0.15], [fx, s - w / 2, up + 0.15], [fx, s + w / 2, up + 0.15], [bx, s + w / 2, up + 0.15]];
    const top: Vec3[] = [[bx, s - w / 2, up + h], [fx - dir * h * 0.25, s - w / 2, up + h], [fx - dir * h * 0.25, s + w / 2, up + h], [bx, s + w / 2, up + h]];
    if (dir < 0) {
      bottom.reverse();
      top.reverse();
    }
    hexa(k.team, k.fr, bottom, top, grey(0.8));
    tube(k.fixed, k.fr, [t.x, s, up], [t.x, s, up + 0.2], z * 0.4, z * 0.4, PAINT.metal, 10);
    face = l * 0.5;
    gunUp = up + h * 0.5;
  } else {
    // A gunhouse: flat sides and roof, the face sloped back; a modern mount narrower on top.
    const h = t.height ?? (kind === 'box' ? z * 0.36 : z * 0.42);
    const l = kind === 'box' ? z * 1.05 : z;
    const w = kind === 'box' ? z * 0.9 : z * 0.7;
    const lean = kind === 'mount' ? w * 0.2 : w * 0.05;
    const fx = t.x + (dir * l) / 2;
    const bx = t.x - (dir * l) / 2;
    const ftop = fx - dir * h * (kind === 'mount' ? 1.0 : 0.6);
    const btop = bx + dir * h * 0.1;
    const bottom: [number, number, number][] = [[bx, s - w / 2, up], [fx, s - w / 2, up], [fx, s + w / 2, up], [bx, s + w / 2, up]];
    const top: [number, number, number][] = [[btop, s - w / 2 + lean, up + h], [ftop, s - w / 2 + lean, up + h], [ftop, s + w / 2 - lean, up + h], [btop, s + w / 2 - lean, up + h]];
    if (dir < 0) {
      bottom.reverse();
      top.reverse();
    }
    hexa(k.team, k.fr, bottom, top, grey(0.84), 1, grey(0.92));
    face = (l / 2) * 0.8;
    gunUp = up + Math.min(h * 0.45, z * 0.22 + 0.4);
  }
  const r = Math.max(0.06, t.calibre * 0.8);
  for (let i = 0; i < t.barrels; i++) {
    const off = (i - (t.barrels - 1) / 2) * Math.max(r * 3, (z * 0.6) / Math.max(1, t.barrels));
    tube(k.fixed, k.fr, [t.x + dir * face, s + off, gunUp], [t.x + dir * (face + t.length), s + off, gunUp + z * 0.03], r, r * 0.8, PAINT.metal, 8);
  }
}

function radar(k: Kit, r: NavalRadar, deck: number, side: number): void {
  const up = deck + r.up;
  const z = r.size;
  switch (r.kind) {
    case 'array':
      // A wide search antenna, a little deep, on its pedestal.
      tiltBox(k.fixed, k.fr, [r.x, side, up], z * 0.12, z, z * 0.22, 0.2, PAINT.light);
      tube(k.fixed, k.fr, [r.x, side, up - z * 0.2], [r.x, side, up - z * 0.05], z * 0.06, z * 0.05, PAINT.metal, 6);
      break;
    case 'dish':
      blob(k.fixed, k.fr, [r.x, side, up], [z * 0.12, z / 2, z / 2], PAINT.light, 1, 4, 12);
      break;
    case 'dome':
      blob(k.fixed, k.fr, [r.x, side, up], [z / 2, z / 2, z / 2], PAINT.light, 1, 6, 12);
      break;
    case 'panel':
      tiltBox(k.fixed, k.fr, [r.x, side, up], z * 0.08, z, z, 0.3, PAINT.light);
      break;
    case 'faces':
      // Four fixed faces, two looking forward-out and two aft-out, leaned back.
      for (const f of [-1, 1]) {
        for (const sd of [-1, 1]) {
          tiltBox(k.fixed, k.fr, [r.x + f * z * 0.55, side + sd * z * 0.55, up], 0.15, z, z, f * 0.3, PAINT.light, 1, f * sd * -0.78);
        }
      }
      break;
  }
}

function launcher(k: Kit, l: NonNullable<NavalSpec['launchers']>[number], fb: number, beam: number): void {
  const kind = l.kind ?? 'vls';
  const up = fb + (l.up ?? 0);
  if (kind === 'box') {
    const h = l.height ?? 0.6;
    block(k.fixed, k.fr, [l.x, 0, up + h / 2], l.length, l.width, h, PAINT.metal);
    return;
  }
  if (kind === 'tubes') {
    // Canisters in rows either side, raised toward the bow.
    const n = Math.max(1, l.count ?? 2);
    const d = Math.min(l.width / Math.max(1, n), 1.8);
    const e = l.elevation ?? 0.25;
    for (const sd of [-1, 1]) {
      for (let i = 0; i < n; i++) {
        const s = sd * (beam * 0.25 + i * d * 1.1);
        tiltBox(k.team, k.fr, [l.x, s, up + d * 0.5 + (l.length / 2) * Math.sin(e)], l.length, d, d, e, grey(0.78));
      }
    }
    return;
  }
  // Flush cells: the deck patch and a grid of hatches on it.
  block(k.fixed, k.fr, [l.x, 0, up + 0.05], l.length, l.width, 0.1, PAINT.metal);
  const cell = 1.6;
  const nx = Math.max(1, Math.floor(l.length / cell));
  const ny = Math.max(1, Math.floor(l.width / cell));
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const x = l.x - l.length / 2 + (i + 0.5) * (l.length / nx);
      const s = -l.width / 2 + (j + 0.5) * (l.width / ny);
      block(k.fixed, k.fr, [x, s, up + 0.12], (l.length / nx) * 0.78, (l.width / ny) * 0.78, 0.06, grey(0.42));
    }
  }
}

/** A ring-shaped shroud round a propeller or fan, its axis fore and aft, with the hub and blades as a thin disc inside. */
function duct(k: Kit, d: NonNullable<NavalSpec['ducts']>[number]): void {
  const n = 16;
  const r1 = d.diameter / 2;
  const r0 = r1 * 0.9;
  const x0 = d.x + d.length / 2;
  const x1 = d.x - d.length / 2;
  const p = (x: number, a: number, r: number): [number, number, number] => [x, d.side + Math.cos(a) * r, d.up + Math.sin(a) * r];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    hexa(k.team, k.fr, [p(x0, a0, r0), p(x0, a0, r1), p(x0, a1, r1), p(x0, a1, r0)], [p(x1, a0, r0), p(x1, a0, r1), p(x1, a1, r1), p(x1, a1, r0)], grey(0.7));
  }
  tube(k.fixed, k.fr, [d.x - d.length * 0.1, d.side, d.up], [d.x - d.length * 0.2, d.side, d.up], r0 * 0.95, r0 * 0.95, PAINT.metal, 12, 0.4);
  tube(k.fixed, k.fr, [d.x + d.length * 0.2, d.side, d.up], [d.x - d.length * 0.4, d.side, d.up], r0 * 0.18, r0 * 0.1, PAINT.metal, 8);
}

/** An oval, raked funnel lofted from its foot to its top, with a cap band round the top. */
function stack(k: Kit, f: NonNullable<NavalSpec['funnels']>[number], side: number, deck: number): void {
  const n = 14;
  const a = f.diameter / 2;
  const b = (f.width ?? f.diameter) / 2;
  const rake = f.rake ?? (f.diameter * 0.3) / Math.max(1, f.height);
  const ring = (z: number, k0: number): Vec3[] => Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    return [f.x - rake * (z - deck) + Math.cos(t) * a * k0, side + Math.sin(t) * b * k0, z] as Vec3;
  });
  const top = deck + f.height;
  const cap = Math.min(f.cap ?? 0, f.height * 0.4);
  const levels: [number, number, Rgb][] = [[deck, 1, grey(0.6)], [top - cap, 0.95, grey(0.6)]];
  if (cap > 0) levels.push([top - cap, 1.04, PAINT.dark], [top, 1.04, PAINT.dark]);
  else levels.push([top, 0.95, grey(0.6)]);
  const rings = levels.map(([z, k0]) => ring(z, k0).map(([x, y, zz]) => at(k.fr, x, y, zz)));
  const centre = (z: number): Vec3 => at(k.fr, f.x - rake * (z - deck), side, z);
  for (let r = 0; r + 1 < rings.length; r++) {
    const inside = centre((levels[r][0] + levels[r + 1][0]) / 2);
    const col = levels[r + 1][2];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      litQuad(k.team, rings[r][i], rings[r][j], rings[r + 1][j], rings[r + 1][i], inside, col);
    }
  }
  // The top's opening, dark.
  const last = rings[rings.length - 1];
  const c = centre(top);
  const below = centre(top - 0.5);
  for (let i = 0; i < n; i++) litTriangle(k.fixed, c, last[i], last[(i + 1) % n], below, PAINT.dark);
}

/** A mast: a pole, a tripod with its two legs splayed aft, or a tapering lattice; the yardarm across it. */
function mast(k: Kit, m: NonNullable<NavalSpec['masts']>[number], side: number, foot: number, top: number, yardAt: number, beam: number): void {
  const h = top - foot;
  if (h <= 0) return;
  const kind = m.kind ?? 'pole';
  if (kind === 'lattice') {
    // Four corner legs drawn as one tapering square truss, and a thin pole above it.
    tube(k.fixed, k.fr, [m.x, side, foot], [m.x, side, foot + h * 0.8], Math.max(0.5, h * 0.09), Math.max(0.25, h * 0.025), PAINT.metal, 4);
    tube(k.fixed, k.fr, [m.x, side, foot + h * 0.8], [m.x, side, top], 0.15, 0.06, PAINT.metal, 6);
  } else {
    tube(k.fixed, k.fr, [m.x, side, foot], [m.x, side, top], Math.max(0.12, m.height * 0.03), 0.06, PAINT.metal, 6);
    if (kind === 'tripod') {
      for (const sd of [-1, 1]) tube(k.fixed, k.fr, [m.x - h * 0.2, side + sd * h * 0.12, foot], [m.x, side, foot + h * 0.62], Math.max(0.1, h * 0.022), 0.08, PAINT.metal, 6);
    }
  }
  block(k.fixed, k.fr, [m.x, side, yardAt], 0.2, m.yard ?? Math.max(1.5, beam * 0.35), 0.2, PAINT.metal);
}
