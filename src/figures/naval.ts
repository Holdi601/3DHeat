/**
 * Ships and boats from their hull and what stands on the deck: superstructure
 * blocks, gun turrets with their barrels, funnels, masts and the radars on
 * them, missile cells and canisters, a flight deck and island for a carrier,
 * a sail for a submarine. Built on the waterline (y = 0) with what is under
 * water left out, as a ship is seen.
 *
 * The hull is lofted from its outline (deck line, deck-edge plan) through
 * sections of a ship's own shape rather than a rounded box: the sides flare
 * out from a narrower waterline to the deck edge, more at the bow, the stem
 * rakes forward, a bulwark lip runs round the deck edge and the deck takes
 * its own colour. Deckhouses are crisp solids with a window band on the
 * bridge; guns, funnels, masts and radars are built from their real shapes,
 * all through `Mesh`, so the figure is lit where it is placed.
 */

import { detail, finish, newKit, PAINT, withCoarse, type Kit, type Template } from './kit';
import { blob, foil, lerpPoly, outlineBody, plate, ring, slab, tiltBox, triangulate, type Outline, type P2 } from './parts';
import { Mesh } from './mesh';
import { at, type Frame3, type Rgb, type Vec3 } from '../race/geometry';

const grey = (k: number): Rgb => [k, k, k];

/** Team greys: the hull a little darker than the deckhouses, the boot-topping band at the waterline near black. */
const HULL = grey(0.8);
const HOUSE = grey(0.9);
const BOOT = grey(0.16);
const SUBHULL = grey(0.55);
/** Fixed colours: a wooden deck (big-gun ships of the gun era), a flight deck, a helicopter deck, array faces, cell hatches. */
const TEAK: Rgb = [0.55, 0.47, 0.36];
const FLIGHT: Rgb = [0.27, 0.28, 0.29];
const NONSKID: Rgb = [0.3, 0.31, 0.32];
const FACE: Rgb = [0.33, 0.36, 0.39];
const HATCH: Rgb = [0.38, 0.39, 0.4];
const CELLS: Rgb = [0.24, 0.25, 0.26];
const MARK: Rgb = [0.86, 0.86, 0.82];

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
   * round: a domed gunhouse (default; a light gun's open tub under 50 mm). box:
   * a big-gun turret with a flat sloped face (battleships, cruisers). mount: a
   * small faceted modern gun mount. shield: an open gun behind a shield
   * wrapping its front and sides.
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
  /** The class (destroyer, patrol-boat, merchant...): the hull's form follows it - a merchant's wall sides, a boat's raked bow. */
  cls?: string;
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

/** A boat's hull without an outline: the deck rising a little to a raked bow, full aft to a wide transom. */
function boatHull(spec: NavalSpec): Outline {
  const L = spec.length;
  const h = L / 2;
  const b = spec.beam / 2;
  const fb = spec.freeboard;
  const top: P2[] = [[h, fb * 1.1], [h - L * 0.2, fb * 1.03], [-h, fb]];
  const plan: P2[] = [[h, b * 0.06], [h - L * 0.08, b * 0.55], [h - L * 0.25, b * 0.92], [h - L * 0.42, b], [-h, b * 0.92]];
  return { top, bottom: [[h, 0], [-h, 0]], plan, round: 8 };
}

/** A landing craft's box hull: a square bow (its ramp), straight sides, a square stern. */
function landingHull(spec: NavalSpec): Outline {
  const h = spec.length / 2;
  const b = spec.beam / 2;
  return { top: [[h, spec.freeboard], [-h, spec.freeboard]], bottom: [[h, 0], [-h, 0]], plan: [[h, b * 0.86], [h - spec.length * 0.06, b * 0.98], [-h, b * 0.96]], round: 8 };
}

// ---------------------------------------------------------------- small helpers

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function smooth(t: number): number {
  const u = clamp(t, 0, 1);
  return u * u * (3 - 2 * u);
}

function sub3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross3(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function unit(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

/**
 * A closed solid of revolution into `m` between `a` and `b` (world points):
 * `profile` gives (share of the way, radius); `n` sides, turned by `phase`
 * (a square rod with n 4). Barrels, canisters, rods, barbettes.
 */
function spin(m: Mesh, a: Vec3, b: Vec3, profile: P2[], n: number, col: Rgb, phase = 0): void {
  const axis = unit(sub3(b, a));
  const helper: Vec3 = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = unit(cross3(axis, helper));
  const v = unit(cross3(axis, u));
  const rows = profile.map(([t, r]) => {
    const c: Vec3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    return Array.from({ length: n }, (_, i) => {
      const q = phase + (i / n) * Math.PI * 2;
      const cu = Math.cos(q) * r;
      const cv = Math.sin(q) * r;
      return m.v([c[0] + u[0] * cu + v[0] * cv, c[1] + u[1] * cu + v[1] * cv, c[2] + u[2] * cu + v[2] * cv], col);
    });
  });
  m.grid(rows, true);
  m.fan(m.v(a, col), rows[0], true);
  m.fan(m.v(b, col), rows[rows.length - 1], false);
}

/**
 * A closed ring-shaped solid: the section `loop` - (radius, height along the
 * axis) points round it - swept round the axis through `c` from angle `a0` to
 * `a1` (radians from the frame's forward, toward its side), its ends closed
 * when it is not a full turn. A gun tub's wall, a shield, a duct's shroud.
 */
function sweep(m: Mesh, c: Vec3, axis: Vec3, ref: Vec3, loop: P2[], a0: number, a1: number, n: number, col: Rgb): void {
  const w = unit(cross3(axis, ref));
  const full = Math.abs(a1 - a0) >= Math.PI * 2 - 1e-6;
  const count = full ? n : n + 1;
  const rows: number[][] = [];
  for (let i = 0; i < count; i++) {
    const q = a0 + ((a1 - a0) * i) / n;
    const cq = Math.cos(q);
    const sq = Math.sin(q);
    rows.push(loop.map(([r, h]) => m.v([c[0] + axis[0] * h + (ref[0] * cq + w[0] * sq) * r, c[1] + axis[1] * h + (ref[1] * cq + w[1] * sq) * r, c[2] + axis[2] * h + (ref[2] * cq + w[2] * sq) * r], col)));
  }
  if (full) rows.push(rows[0]);
  m.grid(rows, true);
  if (!full) {
    for (const [k, first] of [[0, true], [rows.length - 1, false]] as const) {
      for (const [p, q, r] of triangulate(loop)) {
        if (first) m.tri(rows[k][p], rows[k][r], rows[k][q]);
        else m.tri(rows[k][p], rows[k][q], rows[k][r]);
      }
    }
  }
}

/**
 * A closed loft along the fore-and-aft axis through stations of one section
 * polygon (side, up; flat bottom first): each station (forward position,
 * width share, height share). Faceted gunhouses.
 */
function loftPoly(m: Mesh, fr: Frame3, x: number, side: number, up: number, dir: number, stations: [number, number, number][], poly: P2[], w: number, h: number, col: Rgb): void {
  const rows = stations.map(([u, wk, hk]) => poly.map(([s, z]) => m.v(at(fr, x + dir * u, side + s * w * wk, up + z * h * hk), col)));
  m.grid(rows, true);
  const centre = (k: number): number => {
    const [u, , hk] = stations[k];
    return m.v(at(fr, x + dir * u, side, up + h * hk * 0.45), col);
  };
  m.fan(centre(0), rows[0], true);
  m.fan(centre(rows.length - 1), rows[rows.length - 1], false);
}

// ---------------------------------------------------------------- the hull

/**
 * How a hull's sections are shaped: the waterline's half-beam as a share of
 * the deck edge's amidships and at the stem, the flare's curve, the stem's
 * rake and the stern's overhang (metres), the bulwark lip round the deck edge
 * and its thickness, how far the deck lies below the gunwale (a landing
 * craft's well), the boot-topping band's height.
 */
interface HullForm {
  mid: number;
  bow: number;
  flare: number;
  rake: number;
  aft: number;
  lip: number;
  lipT: number;
  drop: number;
  boot: number;
}

const SMALL = new Set(['patrol-boat', 'fast-attack', 'fast-attack-craft', 'torpedo-boat', 'attack-boat', 'gunboat', 'rhib', 'sampan', 'hydrofoil', 'landing-craft']);
const GUN_ERA = new Set(['battleship', 'battlecruiser', 'heavy-cruiser', 'light-cruiser', 'armoured-cruiser']);

function formOf(spec: NavalSpec, kind: string, o: Outline): HullForm {
  const L = spec.length;
  const b = spec.beam / 2;
  const fb = spec.freeboard;
  const bowX = Math.max(...o.top.map((p) => p[0]));
  const tb = lerpPoly(o.top, bowX);
  const cls = spec.cls ?? '';
  if (kind === 'landing') return { mid: 0.97, bow: 0.95, flare: 1, rake: 0, aft: 0, lip: 0, lipT: clamp(b * 0.08, 0.08, 0.5), drop: fb * 0.45, boot: 0 };
  if (kind === 'carrier') return { mid: 0.9, bow: 0.4, flare: 1.5, rake: tb * 0.8, aft: fb * 0.25, lip: 0, lipT: 0, drop: 0, boot: clamp(fb * 0.04, 0.3, 0.8) };
  if (SMALL.has(cls) || L < 45 || kind === 'boat' || kind === 'rhib') {
    return { mid: 0.86, bow: 0.42, flare: 0.85, rake: tb * 0.95, aft: 0, lip: clamp(fb * 0.07, 0.05, 0.2), lipT: clamp(b * 0.03, 0.04, 0.12), drop: 0, boot: L > 20 ? clamp(fb * 0.06, 0.08, 0.2) : 0 };
  }
  if (cls === 'merchant' || kind === 'merchant') return { mid: 0.99, bow: 0.55, flare: 1.3, rake: tb * 0.45, aft: fb * 0.2, lip: clamp(fb * 0.1, 0.3, 1.2), lipT: clamp(b * 0.015, 0.1, 0.3), drop: 0, boot: clamp(fb * 0.06, 0.2, 0.6) };
  return { mid: 0.93, bow: 0.42, flare: 1.4, rake: tb * 0.6, aft: fb * 0.2, lip: clamp(fb * 0.05, 0.12, 0.55), lipT: clamp(b * 0.012, 0.06, 0.22), drop: 0, boot: clamp(fb * 0.09, 0.2, 0.9) };
}

/** Stations along a hull, bow first: every outline corner, more toward the ends and closest at the stem. */
function hullStations(o: Outline): number[] {
  const lists = [o.top, o.plan];
  const x0 = Math.max(...lists.map((l) => Math.min(...l.map((p) => p[0]))));
  const x1 = Math.min(...lists.map((l) => Math.max(...l.map((p) => p[0]))));
  const len = x1 - x0;
  const xs: number[] = [];
  for (const l of lists) for (const [x] of l) if (x >= x0 - 1e-9 && x <= x1 + 1e-9) xs.push(x);
  const n = detail(22, 8);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    xs.push(x0 + len * (0.5 * t + 0.25 * (1 - Math.cos(Math.PI * t))));
  }
  // The bow curves most: a few more there.
  for (const s of detail(4, 2) > 2 ? [0.012, 0.03, 0.055, 0.09] : [0.03, 0.08]) xs.push(x1 - len * s);
  xs.sort((a, b) => b - a);
  return xs.filter((x, i) => i === 0 || xs[i - 1] - x > len * 0.004);
}

/**
 * The hull from its outline (deck line over the waterline, deck-edge
 * half-beam): sections flaring from the waterline to the deck edge, the stem
 * raked, the bulwark lip, the boot-topping band; the deck in `deckCol` (none:
 * hidden under a flight deck).
 */
function hullLoft(k: Kit, o: Outline, f: HullForm, deckCol: Rgb): void {
  const xs = hullStations(o);
  const x1 = xs[0];
  const x0 = xs[xs.length - 1];
  const len = x1 - x0;
  const fadeB = Math.max(f.rake * 2.5, len * 0.1);
  const fadeS = Math.max(f.aft * 3, len * 0.04);
  const nv = detail(5, 3);
  const vs = Array.from({ length: nv }, (_, i) => 1 - i / (nv - 1));
  const m = new Mesh();
  const deck = new Mesh();
  const rings: number[][] = [];
  const flat: P2[][] = [];
  const deckRows: number[][] = [];
  const W = (x: number, s: number, z: number): Vec3 => at(k.fr, x, s, z);
  for (const x of xs) {
    const t = lerpPoly(o.top, x);
    const zb = lerpPoly(o.bottom, x);
    const w = Math.max(0.02, lerpPoly(o.plan, x));
    const r = f.mid + (f.bow - f.mid) * smooth((x - (x1 - len * 0.32)) / (len * 0.32));
    const wl = w * r;
    const kb = clamp(1 - (x1 - x) / fadeB, 0, 1);
    const ks = clamp(1 - (x - x0) / fadeS, 0, 1);
    const sx = (v: number) => x - f.rake * (1 - v) * kb * kb + f.aft * (1 - v) * ks;
    const lt = Math.min(f.lipT, w * 0.35);
    // The port half, from the deck's edge over the lip and down the side to the waterline: (half-beam, height, x, colour).
    const half: [number, number, number, Rgb][] = [];
    if (f.lip > 0 || f.drop > 0) {
      half.push([w - lt, t - f.drop, x, HULL], [w - lt, t + f.lip, x, HULL]);
      if (f.lip > 0) half.push([w, t + f.lip, x, HULL]);
    }
    const vb = f.boot > 0 && t - zb > f.boot * 3 ? Math.min(f.boot / (t - zb), vs[nv - 2] * 0.5) : 0;
    for (let i = 0; i < nv; i++) {
      const v = vs[i];
      const at2 = (vv: number): [number, number] => [wl + (w - wl) * vv ** f.flare, zb + (t - zb) * vv];
      if (i === nv - 1 && vb > 0) {
        const [hb, zbb] = at2(vb);
        half.push([hb, zbb, sx(vb), HULL], [hb, zbb, sx(vb), BOOT]);
      }
      const [hw, z] = at2(v);
      half.push([hw, z, sx(v), vb > 0 && i === nv - 1 ? BOOT : HULL]);
    }
    const ids = [...half.map(([s, z, xx, c]) => m.v(W(xx, -s, z), c)), ...[...half].reverse().map(([s, z, xx, c]) => m.v(W(xx, s, z), c))];
    rings.push(ids);
    flat.push([...half.map(([s, z]) => [-s, z] as P2), ...[...half].reverse().map(([s, z]) => [s, z] as P2)]);
    const dh = f.lip > 0 || f.drop > 0 ? w - lt : w;
    deckRows.push([deck.v(W(x, -dh, t - f.drop), deckCol), deck.v(W(x, dh, t - f.drop), deckCol)]);
  }
  m.grid(rings, false);
  // The stem's and the transom's faces, wound to look forward and aft.
  for (const [k0, want] of [[0, 1], [rings.length - 1, -1]] as const) {
    const ids = rings[k0];
    const poly = flat[k0];
    const keep: number[] = [];
    for (let i = 0; i < poly.length; i++) {
      const j = keep[keep.length - 1];
      if (j === undefined || Math.abs(poly[i][0] - poly[j][0]) > 1e-6 || Math.abs(poly[i][1] - poly[j][1]) > 1e-6) keep.push(i);
    }
    const p2 = keep.map((i) => poly[i]);
    for (const [a, b, c] of triangulate(p2)) {
      const A = ids[keep[a]];
      const B = ids[keep[b]];
      const C = ids[keep[c]];
      const pa: Vec3 = [m.p[A * 3], m.p[A * 3 + 1], m.p[A * 3 + 2]];
      const n = cross3(sub3([m.p[B * 3], m.p[B * 3 + 1], m.p[B * 3 + 2]], pa), sub3([m.p[C * 3], m.p[C * 3 + 1], m.p[C * 3 + 2]], pa));
      const fwd = at(k.fr, 1, 0, 0);
      const o0 = at(k.fr, 0, 0, 0);
      const along = n[0] * (fwd[0] - o0[0]) + n[1] * (fwd[1] - o0[1]) + n[2] * (fwd[2] - o0[2]);
      if (along * want >= 0) m.tri(A, B, C);
      else m.tri(A, C, B);
    }
  }
  // Outward is the way the waterline's bottom faces: down.
  m.emit(k.team, { facing: sub3(at(k.fr, 0, 0, -1), at(k.fr, 0, 0, 0)), crease: 40 });
  deck.grid(deckRows, false);
  deck.emit(k.fixed, { facing: sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0)) });
}

// ---------------------------------------------------------------- deckhouses

/** A body that is a plain block (from a spec's `blockOf`): a flat foot, the same width all along, hard-edged. */
function isBox(o: Outline): boolean {
  if (o.bottom.length !== 2 || o.plan.length !== 2 || Math.abs(o.plan[0][1] - o.plan[1][1]) > 1e-6) return false;
  if (Math.abs(o.bottom[0][1] - o.bottom[1][1]) > 1e-6) return false;
  return typeof o.round === 'number' && o.round >= 8;
}

/** The barbette a spec draws under a raised gun (`barbettes` in the class specs): the builder draws its own. */
function isBarbette(o: Outline): boolean {
  return o.plan.length === 5 && o.plan[0][1] === 0.1 && o.round === 10 && o.stations === 6;
}

/** A block's place: front and back, foot and top, half-width, centre line, the front's rake. */
interface Box {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  half: number;
  side: number;
  rake: number;
  o: Outline;
  /** Corners cut at 45 degrees this far back from each wall (a deckhouse carrying fixed array faces). */
  cham?: number;
}

function boxOf(o: Outline, side: number): Box {
  const xs = o.bottom.map((p) => p[0]);
  const x0 = Math.max(...xs);
  const x1 = Math.min(...xs);
  const z0 = o.bottom[0][1];
  const z1 = Math.max(...o.top.map((p) => p[1]));
  const front = [...o.top].sort((p, q) => q[0] - p[0]).find((p) => p[1] > z1 - 1e-6);
  return { x0, x1, z0, z1, half: o.plan[0][1], side, rake: front ? Math.max(0, x0 - front[0]) : 0, o };
}

/** A deckhouse: the block's side profile pushed across, its walls leaning in by `slope` per metre of height; crisp faces. */
function house(k: Kit, b: Box, slope: number): void {
  if (b.cham) {
    chamfered(k, b, slope);
    return;
  }
  const prof: P2[] = [[b.x0, b.z0]];
  for (const p of [...b.o.top].sort((p, q) => q[0] - p[0])) {
    // The spec's rake starts a hair over the foot; start it at the foot.
    if (p[1] - b.z0 < 0.12 && (Math.abs(p[0] - b.x0) < 1e-6 || Math.abs(p[0] - b.x1) < 1e-6)) continue;
    prof.push(p);
  }
  prof.push([b.x1, b.z0]);
  let area = 0;
  for (let i = 0; i < prof.length; i++) {
    const [xa, za] = prof[i];
    const [xb, zb] = prof[(i + 1) % prof.length];
    area += xa * zb - xb * za;
  }
  const P = area < 0 ? prof.reverse() : prof;
  const h = Math.max(0.1, b.z1 - b.z0);
  const k0 = Math.min(slope, (b.half * 0.3) / h);
  const m = new Mesh();
  const wAt = (z: number) => b.half - k0 * (z - b.z0);
  const port = P.map(([x, z]) => m.v(at(k.fr, x, b.side - wAt(z), z), HOUSE));
  const stbd = P.map(([x, z]) => m.v(at(k.fr, x, b.side + wAt(z), z), HOUSE));
  for (const [i, j, l] of triangulate(P)) {
    m.tri(stbd[i], stbd[j], stbd[l]);
    m.tri(port[i], port[l], port[j]);
  }
  for (let i = 0; i < P.length; i++) {
    const j = (i + 1) % P.length;
    m.quad(port[i], port[j], stbd[j], stbd[i]);
  }
  m.emit(k.team, { crease: 30 });
}

/** The front and back of a block at height z (its front raked, its back maybe raked forward) and its half-width there. */
function boxAt(b: Box, slope: number, z: number): { xf: number; xb: number; w: number } {
  const h = Math.max(0.1, b.z1 - b.z0);
  const flat = b.o.top.filter((p) => p[1] > b.z1 - 1e-6).map((p) => p[0]);
  const aft = Math.max(0, Math.min(...flat) - b.x1);
  const u = clamp((z - b.z0) / h, 0, 1);
  return { xf: b.x0 - b.rake * u, xb: b.x1 + aft * u, w: b.half - Math.min(slope, (b.half * 0.3) / h) * (z - b.z0) };
}

/** The deckhouse a radar's faces stand in: one holding its place at its height (or just over the roof). */
function hostOf(boxes: Box[], r: NavalRadar, up: number, side: number): Box | undefined {
  return boxes.find((bx) => r.x <= bx.x0 && r.x >= bx.x1 && Math.abs(side - bx.side) <= bx.half && up >= bx.z0 && up <= bx.z1 + 1.5);
}

/** A deckhouse with its four upright corners cut at 45 degrees, where an Aegis-type ship carries its array faces. */
function chamfered(k: Kit, b: Box, slope: number): void {
  const m = new Mesh();
  const ringAt = (z: number) => {
    const { xf, xb, w } = boxAt(b, slope, z);
    const c = Math.min(b.cham!, w * 0.45, (xf - xb) * 0.3);
    const pts: P2[] = [[xf - c, -w], [xf, -w + c], [xf, w - c], [xf - c, w], [xb + c, w], [xb, w - c], [xb, -w + c], [xb + c, -w]];
    return pts.map(([x, s]) => m.v(at(k.fr, x, b.side + s, z), HOUSE));
  };
  const lo = ringAt(b.z0);
  const hi = ringAt(b.z1);
  m.grid([lo, hi], true);
  const n = lo.length;
  for (let i = 1; i + 1 < n; i++) {
    m.tri(lo[0], lo[i + 1], lo[i]);
    m.tri(hi[0], hi[i], hi[i + 1]);
  }
  m.emit(k.team, { crease: 30 });
}

/** An uptake's top: the dark exhaust opening inset in its roof and the stubs of two pipes standing out of it. */
function exhaust(k: Kit, b: Box, slope: number): void {
  const h = Math.max(0.1, b.z1 - b.z0);
  const w = b.half - Math.min(slope, (b.half * 0.3) / h) * h;
  const top = [...b.o.top].sort((p, q) => q[0] - p[0]).filter((p) => p[1] > b.z1 - 1e-6);
  const xa = top[0][0];
  const xb = top[top.length - 1][0];
  const i = Math.min(0.25, w * 0.15, (xa - xb) * 0.1);
  plate(k.fixed, k.fr, [[xa - i, b.side - w + i], [xb + i, b.side - w + i], [xb + i, b.side + w - i], [xa - i, b.side + w - i]], b.z1 + 0.02, 0.06, PAINT.dark);
  const m = new Mesh();
  const r = Math.min(w, (xa - xb) / 2) * 0.32;
  for (const f of [0.3, 0.7]) {
    const x = xa - (xa - xb) * f;
    spin(m, at(k.fr, x, b.side, b.z1 - 0.2), at(k.fr, x, b.side, b.z1 + r * 1.4), [[0, r], [1, r]], detail(10, 6), PAINT.dark);
  }
  m.emit(k.fixed);
}

/** The bridge's windows: a dark glossy band across the front face near its top, wrapping a little way down each side. */
function windows(k: Kit, b: Box, slope: number, wings: number): void {
  const h = b.z1 - b.z0;
  if (h < 0.8 || b.half < 0.4) return;
  const bh = clamp(h * 0.22, 0.25, 1.1);
  const zt = b.z1 - Math.min(0.35, h * 0.12);
  const zl = zt - bh;
  const k0 = Math.min(slope, (b.half * 0.3) / h);
  const fx = (z: number) => b.x0 - (b.rake * (z - b.z0)) / h;
  const wAt = (z: number) => b.half - k0 * (z - b.z0);
  const e = 0.04;
  const wrap = Math.min(b.x0 - b.x1, Math.max(1.2, (b.x0 - b.x1) * 0.3));
  const m = new Mesh();
  const g = (x: number, s: number, z: number) => m.v(at(k.fr, x, b.side + s, z), PAINT.glass);
  // The front, then each side.
  m.quad(g(fx(zl) + e, -wAt(zl) * 0.97, zl), g(fx(zl) + e, wAt(zl) * 0.97, zl), g(fx(zt) + e, wAt(zt) * 0.97, zt), g(fx(zt) + e, -wAt(zt) * 0.97, zt));
  for (const sd of [-1, 1]) {
    const a = [g(fx(zl) - 0.1, sd * (wAt(zl) + e), zl), g(fx(zl) - wrap, sd * (wAt(zl) + e), zl), g(fx(zt) - wrap, sd * (wAt(zt) + e), zt), g(fx(zt) - 0.1, sd * (wAt(zt) + e), zt)];
    m.quad(a[0], a[1], a[2], a[3]);
  }
  m.emit(k.fixed, { gloss: 1, axis: [at(k.fr, (b.x0 + b.x1) / 2, b.side, 0), sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0))] });
  if (wings > b.half + 0.4) {
    // Bridge wings: open platforms out to the ship's side at the bridge deck, just under the windows.
    const wl = Math.min(3, (b.x0 - b.x1) * 0.35);
    const x = fx(zl) - 0.3;
    for (const sd of [-1, 1]) {
      const s0 = b.side + sd * (wAt(zl) - 0.1);
      const s1 = b.side + sd * wings;
      plate(k.team, k.fr, [[x, s0], [x - wl, s0], [x - wl, s1], [x, s1]], zl - 0.15, 0.22, HOUSE);
    }
  }
}

// ---------------------------------------------------------------- the build

/** A ship or boat from its spec, with its coarse build for when it is small on screen. */
export function buildNaval(spec: NavalSpec): Template {
  return withCoarse(() => buildNavalAt(spec))();
}

function buildNavalAt(spec: NavalSpec): Template {
  const k = newKit();
  const L = spec.length;
  const half = L / 2;
  const b = spec.beam / 2;
  let fb = spec.freeboard;
  const kind = spec.hull ?? 'warship';
  const cls = spec.cls ?? '';
  if (kind === 'submarine') {
    submarine(k, spec);
    if (!spec.hullOutline && spec.turrets?.length) fb = b * 0.95;
    for (const t of spec.turrets ?? []) turret(k, t, fb, () => fb, () => true);
    return finish(k, 'ground');
  }
  let hullO: Outline | undefined;
  if (kind === 'hover' && !spec.hullOutline) hover(k, spec);
  else {
    hullO = spec.hullOutline ?? (kind === 'warship' || kind === 'merchant' || kind === 'carrier' ? defaultHull(spec) : kind === 'landing' ? landingHull(spec) : boatHull(spec));
    const deckCol = GUN_ERA.has(cls) ? TEAK : PAINT.deck;
    const round = typeof hullO.round === 'number' ? hullO.round : 8;
    if (round < 6) {
      // A rounded hull - a turtle-backed boat, a sampan, a hovercraft's skirt - keeps its lofted shape.
      outlineBody(cls === 'hovercraft' ? k.fixed : k.team, k.fr, hullO, cls === 'hovercraft' ? PAINT.dark : HULL, 14);
    } else hullLoft(k, hullO, formOf(spec, kind, hullO), deckCol);
    if (kind === 'carrier' && !spec.decks?.length) {
      // A flight deck wider than the hull, overhanging to the left.
      const plan: P2[] = [[half - L * 0.02, -b * 1.6], [-half, -b * 1.6], [-half, b * 1.15], [half - L * 0.02, b * 0.9]];
      if (spec.angled) plan.splice(1, 0, [half - L * 0.45, -b * 2.35], [-half + L * 0.05, -b * 2.1], [-half + L * 0.05, -b * 1.6]);
      flightDeck(k, plan, fb + 0.5, 1.0, !!spec.angled);
      if (spec.skiJump) {
        const x0 = half - L * 0.14;
        const x1 = half - L * 0.02;
        const lip = L * 0.025;
        const prof: P2[] = [[x0, fb + 1.0], [x1, fb + 1.0], [x1, fb + 1.0 + lip], [x0 + (x1 - x0) * 0.6, fb + 1.0 + lip * 0.4]];
        prism3(k, prof, -b * 1.1, b * 0.85, FLIGHT, k.fixed);
      }
    } else if (kind === 'rhib') {
      rhibTube(k, spec);
    } else if (kind === 'landing') {
      // The bow ramp, raised.
      tiltBox(k.team, k.fr, [half - 0.2, 0, fb * 0.55], 0.25, spec.beam * 0.86, fb * 1.05, 0.12, HULL);
    }
    if (spec.helideck) {
      const x0 = -half + Math.min(L * 0.02, 2);
      const x1 = x0 + Math.min(L * 0.18, 26);
      // On the hull's own deck where it has one (lower than the freeboard at the stern).
      const hd = Math.min(fb, lerpPoly(hullO.top, (x0 + x1) / 2));
      const wd = Math.min(b * 0.85, lerpPoly(hullO.plan, x0) * 0.97);
      plate(k.fixed, k.fr, [[x1, -b * 0.85], [x0, -wd], [x0, wd], [x1, b * 0.85]], hd + 0.03, 0.04, NONSKID);
      const cx = (x0 + x1) / 2;
      const r = Math.min(b * 0.55, (x1 - x0) * 0.32);
      ring(k.fixed, k.fr, cx, 0, hd + 0.07, r, MARK, 1, 24, r * 0.9);
      plate(k.fixed, k.fr, [[x1 - 0.5, -0.12], [x0 + 0.5, -0.12], [x0 + 0.5, 0.12], [x1 - 0.5, 0.12]], hd + 0.065, 0.02, MARK);
    }
  }
  // The deck under a point; off the hull's side (a gallery, a sponson) nothing, so a gun there keeps its own height.
  const deckAt = (x: number, s = 0) => (hullO ? (Math.abs(s) <= lerpPoly(hullO.plan, x) ? lerpPoly(hullO.top, x) : -Infinity) : fb);
  const carrierOff = kind === 'carrier' ? b * 0.9 : 0;
  const deckUp = kind === 'carrier' ? 1 : 0;
  // Superstructure: the spec's blocks and its block bodies as crisp deckhouses, the rest of its bodies lofted.
  const modern = !!(spec.launchers?.length || spec.radars?.some((r) => r.kind === 'faces' || r.kind === 'panel' || r.kind === 'dome'));
  const slope = modern && kind !== 'carrier' ? 0.1 : 0;
  const boxes: Box[] = [];
  for (const s of spec.superstructure ?? []) {
    const side = s.side ?? carrierOff;
    const base = fb + deckUp + (s.up ?? 0);
    const x0 = s.x + s.length / 2;
    const x1 = s.x - s.length / 2;
    const o: Outline = { top: [[x0, base + s.height], [x1, base + s.height]], bottom: [[x0, base], [x1, base]], plan: [[x0, s.width / 2], [x1, s.width / 2]], round: 10 };
    boxes.push(boxOf(o, side));
  }
  const loose: Outline[] = [];
  for (const o of spec.bodies ?? []) {
    if (isBarbette(o)) continue;
    if (isBox(o)) {
      boxes.push(boxOf(o, o.side ?? 0));
      if (o.side) boxes.push(boxOf(o, -o.side));
    } else loose.push(o);
  }
  const island: Box[] = [];
  for (const o of spec.oneSide ?? []) {
    const top = [...o.top].sort((p, q) => q[0] - p[0]);
    if (kind === 'carrier' && isBox(o) && top.length >= 3 && top[0][1] > top[top.length - 1][1] + 1) {
      // A ski-jump ramp: the flight deck curving up to its lip.
      const b0 = o.bottom[0][1];
      prism3(k, [...top, [top[top.length - 1][0], b0], [top[0][0], b0]], (o.side ?? 0) - o.plan[0][1], (o.side ?? 0) + o.plan[0][1], FLIGHT, k.fixed);
      continue;
    }
    if (isBox(o)) island.push(boxOf(o, o.side ?? 0));
    else outlineBody(k.team, k.fr, o, HOUSE, 12);
  }
  // A deckhouse carrying fixed array faces has its corners cut for them.
  for (const r of spec.radars ?? []) {
    if (r.kind !== 'faces') continue;
    const host = hostOf([...boxes, ...island], r, fb + deckUp + r.up, r.side ?? carrierOff);
    if (host) host.cham = Math.max(host.cham ?? 0, r.size * 0.75);
  }
  for (const bx of [...boxes, ...island]) house(k, bx, slope);
  if (!spec.funnels?.length && kind !== 'carrier') {
    // A modern ship's stacks are blocks: a tall narrow one standing over its neighbours, holding no mast or radar, is
    // an uptake - its top is the dark exhaust with the pipes' ends.
    const hosts = [...(spec.masts ?? []).map((mt) => mt.x), ...(spec.radars ?? []).map((r) => r.x)];
    for (const bx of boxes) {
      if (bx.half > spec.beam * 0.2 || bx.x0 - bx.x1 > L * 0.08 || bx.z1 - bx.z0 < 5) continue;
      if (hosts.some((x) => x <= bx.x0 + 0.5 && x >= bx.x1 - 0.5)) continue;
      if (boxes.some((o) => o !== bx && o.z1 >= bx.z1 - 0.5 && o.x0 > bx.x1 && o.x1 < bx.x0 && Math.abs(o.side - bx.side) < o.half + bx.half)) continue;
      exhaust(k, bx, slope);
    }
  }
  for (const o of loose) {
    // A RHIB's round bodies are its inflated collar: dark rubber, not paint.
    const collar = cls === 'rhib' && typeof o.round === 'number' && o.round <= 2.6;
    const out = collar ? k.fixed : k.team;
    const col = collar ? PAINT.dark : HOUSE;
    outlineBody(out, k.fr, o, col, 12);
    if (o.side) outlineBody(out, k.fr, { ...o, side: -o.side }, col, 12);
  }
  // The bridge: the highest broad block forward (a merchant's aft), or on a carrier each block of the island.
  if (kind === 'carrier') for (const bx of island.length ? island : boxes) windows(k, bx, 0, 0);
  else {
    const broad = boxes.filter((bx) => bx.half >= spec.beam * 0.2 && bx.x0 - bx.x1 >= Math.max(1.2, L * 0.02) && bx.z1 - bx.z0 > 0.8);
    const fwd = broad.filter((bx) => bx.x0 > L * 0.05);
    const pick = (fwd.length ? fwd : broad).sort((p, q) => q.z1 - p.z1 || q.x0 - p.x0)[0];
    if (pick) {
      const zl = pick.z1 - Math.min(0.35, (pick.z1 - pick.z0) * 0.12) - clamp((pick.z1 - pick.z0) * 0.22, 0.25, 1.1);
      const deckHalf = hullO ? lerpPoly(hullO.plan, pick.x0) : b;
      windows(k, pick, slope, L >= 40 && zl > deckAt(pick.x0) + 1.5 ? Math.min(deckHalf * 0.98, pick.half * 1.6 + 1) : 0);
    }
  }
  for (const f of spec.funnels ?? []) stack(k, f, f.side ?? carrierOff, fb + deckUp);
  for (const mt of spec.masts ?? []) mast(k, mt, mt.side ?? carrierOff, fb + (mt.base ?? 0), fb + deckUp + mt.height, fb + deckUp + mt.height * 0.75, spec.beam);
  for (const d of spec.decks ?? []) {
    if (kind === 'carrier') flightDeck(k, d.plan, d.up, d.thickness ?? 0.4, !!spec.angled);
    else slab(k.fixed, k.fr, d.plan, (f, s) => [f, s, d.up], [0, 0, 1], d.thickness ?? 0.4, PAINT.deck);
  }
  for (const d of spec.ducts ?? []) duct(k, d);
  for (const r of spec.radars ?? []) radar(k, r, fb + deckUp, r.side ?? carrierOff, [...boxes, ...island], slope);
  const covered = (x: number, s: number, z: number) => [...boxes, ...island].some((bx) => x <= bx.x0 + 0.2 && x >= bx.x1 - 0.2 && Math.abs(s - bx.side) <= bx.half + 0.2 && bx.z1 >= z - 0.5);
  for (const t of spec.turrets ?? []) turret(k, t, fb, deckAt, covered);
  for (const l of spec.launchers ?? []) launcher(k, l, fb, spec.beam);
  return finish(k, 'ground');
}

/** A side profile (forward, up) pushed from side0 to side1 with crisp faces: a ski-jump ramp. */
function prism3(k: Kit, prof: P2[], side0: number, side1: number, col: Rgb, out = k.team): void {
  let area = 0;
  for (let i = 0; i < prof.length; i++) area += prof[i][0] * prof[(i + 1) % prof.length][1] - prof[(i + 1) % prof.length][0] * prof[i][1];
  const P = area < 0 ? [...prof].reverse() : prof;
  const m = new Mesh();
  const a = P.map(([x, z]) => m.v(at(k.fr, x, side0, z), col));
  const c = P.map(([x, z]) => m.v(at(k.fr, x, side1, z), col));
  for (const [i, j, l] of triangulate(P)) {
    m.tri(c[i], c[j], c[l]);
    m.tri(a[i], a[l], a[j]);
  }
  for (let i = 0; i < P.length; i++) m.quad(a[i], a[(i + 1) % P.length], c[(i + 1) % P.length], c[i]);
  m.emit(out, { crease: 30 });
}

/** A carrier's flight deck from its plan, dark, with the landing area's lines and the bow's catapult tracks marked. */
function flightDeck(k: Kit, plan: P2[], up: number, thickness: number, angled: boolean): void {
  slab(k.fixed, k.fr, plan, (f, s) => [f, s, up], [0, 0, 1], thickness, FLIGHT);
  const top = up + thickness / 2 + 0.03;
  const xs = plan.map((p) => p[0]);
  const xb = Math.max(...xs);
  const xa = Math.min(...xs);
  const len = xb - xa;
  const m = new Mesh();
  const line = (p: P2, q: P2, w: number) => {
    const dx = q[0] - p[0];
    const ds = q[1] - p[1];
    const l = Math.hypot(dx, ds) || 1;
    const ns = (dx / l) * (w / 2);
    const nx = (-ds / l) * (w / 2);
    m.quad(m.v(at(k.fr, p[0] + nx, p[1] + ns, top), MARK), m.v(at(k.fr, q[0] + nx, q[1] + ns, top), MARK), m.v(at(k.fr, q[0] - nx, q[1] - ns, top), MARK), m.v(at(k.fr, p[0] - nx, p[1] - ns, top), MARK));
  };
  // Where the deck is widest to port forward of the middle: the angled deck's forward end.
  const port = plan.filter((p) => p[0] > xa + len * 0.4).sort((p, q) => p[1] - q[1])[0];
  if (angled && port) {
    const s0: P2 = [xa + len * 0.06, port[1] * 0.08];
    const s1: P2 = [port[0] + len * 0.02, port[1] * 0.72];
    const off = Math.max(6, -port[1] * 0.3);
    line(s0, s1, 0.5);
    for (const sd of [-1, 1]) {
      const dx = s1[0] - s0[0];
      const ds = s1[1] - s0[1];
      const l = Math.hypot(dx, ds);
      line([s0[0] + (ds / l) * off * sd, s0[1] - (dx / l) * off * sd], [s1[0] + (ds / l) * off * sd, s1[1] - (dx / l) * off * sd], 0.35);
    }
  } else line([xa + len * 0.04, 0], [xb - len * 0.04, 0], 0.5);
  // Two catapult tracks on the bow.
  for (const sd of [-1, 1]) line([xb - len * 0.03, sd * len * 0.025], [xb - len * 0.28, sd * len * 0.012], 0.3);
  m.emit(k.fixed, { facing: sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0)) });
}

/** A RHIB's inflated collar: a dark tube round the gunwale from one quarter round the bow to the other, open at the stern. */
function rhibTube(k: Kit, spec: NavalSpec): void {
  const h = spec.length / 2;
  const b = spec.beam / 2;
  const fb = spec.freeboard;
  const r = Math.min(fb * 0.4, b * 0.25);
  const path: Vec3[] = [];
  const n = detail(14, 7);
  for (let i = 0; i <= n; i++) {
    // Round the bow on a half ellipse, straight aft along the sides.
    const t = -Math.PI / 2 + (Math.PI * i) / n;
    path.push([h * 0.55 + Math.cos(t) * h * 0.42, Math.sin(t) * (b - r), fb * 0.85]);
  }
  path.unshift([-h * 0.98, -(b - r), fb * 0.8]);
  path.push([-h * 0.98, b - r, fb * 0.8]);
  tubeAlong(k, path, r, PAINT.dark);
}

/** A round tube along a path (points forward, side, up) with rounded ends. */
function tubeAlong(k: Kit, path: Vec3[], r: number, col: Rgb): void {
  const n = detail(10, 6);
  const m = new Mesh();
  const rows: number[][] = [];
  const P = path.map(([f, s, u]) => at(k.fr, f, s, u));
  const upW = unit(sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0)));
  for (let i = 0; i < P.length; i++) {
    const d = unit(sub3(P[Math.min(P.length - 1, i + 1)], P[Math.max(0, i - 1)]));
    const sideV = unit(cross3(d, upW));
    const upV = unit(cross3(sideV, d));
    rows.push(Array.from({ length: n }, (_, j) => {
      const q = (j / n) * Math.PI * 2;
      return m.v([P[i][0] + (sideV[0] * Math.cos(q) + upV[0] * Math.sin(q)) * r, P[i][1] + (sideV[1] * Math.cos(q) + upV[1] * Math.sin(q)) * r, P[i][2] + (sideV[2] * Math.cos(q) + upV[2] * Math.sin(q)) * r], col);
    }));
  }
  m.grid(rows, true);
  const end = (i: number, dirSign: number) => {
    const d = unit(sub3(P[i], P[i - dirSign]));
    return m.v([P[i][0] + d[0] * r * 0.8, P[i][1] + d[1] * r * 0.8, P[i][2] + d[2] * r * 0.8], col);
  };
  m.fan(end(0, -1), rows[0], true);
  m.fan(end(P.length - 1, 1), rows[rows.length - 1], false);
  m.emit(k.fixed);
}

/** A hovercraft without its own outline: the black skirt round it, the buoyancy deck, side structures and two ducted props aft. */
function hover(k: Kit, spec: NavalSpec): void {
  const h = spec.length / 2;
  const b = spec.beam / 2;
  const fb = spec.freeboard;
  const r = fb * 0.32;
  const path: Vec3[] = [];
  const n = detail(24, 12);
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    path.push([Math.sign(c) * Math.abs(c) ** 0.4 * (h - r), Math.sign(s) * Math.abs(s) ** 0.4 * (b - r), r]);
  }
  tubeAlong(k, path, r, PAINT.dark);
  plate(k.team, k.fr, [[h - r, -(b - r)], [-(h - r), -(b - r)], [-(h - r), b - r], [h - r, b - r]], r * 2, 0.4, HULL);
  for (const sd of [-1, 1]) house(k, boxOf({ top: [[h * 0.85, fb * 1.15], [-h * 0.7, fb * 1.15]], bottom: [[h * 0.85, r * 2], [-h * 0.7, r * 2]], plan: [[h * 0.85, b * 0.14], [-h * 0.7, b * 0.14]], round: 10 }, sd * b * 0.72), 0);
  for (const sd of [-1, 1]) duct(k, { x: -h * 0.8, side: sd * b * 0.45, up: fb * 1.15, diameter: fb * 1.2, length: fb * 0.5 });
}

// ---------------------------------------------------------------- submarines

/** Thickness, span and height of an outline body, sampled along it. */
function extentOf(o: Outline): { thick: number; plan: number; x0: number; x1: number } {
  const xs = [...o.top, ...o.bottom, ...o.plan].map((p) => p[0]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  let thick = 0;
  for (let i = 0; i <= 8; i++) {
    const x = x0 + ((x1 - x0) * i) / 8;
    thick = Math.max(thick, lerpPoly(o.top, x) - lerpPoly(o.bottom, x));
  }
  return { thick, plan: Math.max(...o.plan.map((p) => p[1])), x0, x1 };
}

/**
 * A body on a submarine: a thin flat one (a plane) or a thin upright one (a
 * rudder, an end plate) as a true foil with a round leading edge, the rest
 * (the sail, a pod, a casing) lofted.
 */
function subBody(k: Kit, o: Outline, col: Rgb): void {
  const e = extentOf(o);
  const sides = o.side ? [o.side, -o.side] : [0];
  if (e.thick <= 0.9 && e.plan >= e.thick * 3) {
    const xm = (e.x0 + e.x1) / 2;
    const z = (lerpPoly(o.top, xm) + lerpPoly(o.bottom, xm)) / 2;
    const poly: P2[] = [...o.plan.map(([x, w]) => [x, w] as P2), ...[...o.plan].reverse().map(([x, w]) => [x, -w] as P2)];
    for (const s of sides) foil(k.team, k.fr, poly, (c, sp) => [c, s + sp, z], [0, 0, 1], e.thick, col, { ratio: 0.14 });
    return;
  }
  if (e.plan <= 0.4 && e.thick >= e.plan * 6) {
    const poly: P2[] = [...o.top.map(([x, z]) => [x, z] as P2), ...[...o.bottom].reverse().map(([x, z]) => [x, z] as P2)];
    for (const s of sides) foil(k.team, k.fr, poly, (c, sp) => [c, s, sp], [0, 1, 0], e.plan * 2, col, { ratio: 0.14 });
    return;
  }
  for (const s of sides) outlineBody(k.team, k.fr, { ...o, side: s || undefined }, col, 14);
}

/** A submarine: its hull of revolution, the sail, the planes and rudders as foils. */
function submarine(k: Kit, spec: NavalSpec): void {
  const L = spec.length;
  const half = L / 2;
  const b = spec.beam / 2;
  let hullO = spec.hullOutline;
  let bodies = spec.bodies ?? [];
  if (!hullO) {
    // No outline: a round body awash, a round bow, tapering to the stern; the sail standing from it; the cross of fins.
    const rad: P2[] = [[half, b * 0.3], [half - L * 0.03, b * 0.85], [half - L * 0.1, b], [-half + L * 0.32, b], [-half + L * 0.06, b * 0.35], [-half, 0.05]];
    hullO = { top: rad, bottom: rad.map(([x, r]) => [x, -r] as P2), plan: rad, round: 2, stations: 24 };
    const s = spec.sail ?? { x: L * 0.15, length: L * 0.1, height: b * 2.2 };
    const s0 = s.x + s.length / 2;
    const s1 = s.x - s.length / 2;
    const top = b * 0.6 + s.height;
    const xa = -half + L * 0.1;
    const xb = -half + L * 0.03;
    bodies = [
      { top: [[s0, top - 0.3], [s0 - s.length * 0.15, top], [s1, top]], bottom: [[s0, b * 0.6], [s1, b * 0.6]], plan: [[s0, b * 0.15], [s0 - s.length * 0.2, b * 0.24], [s1, b * 0.14]], round: 3.5, stations: 8 },
      { top: [[s0 - s.length * 0.2, top - s.height * 0.4 + 0.15], [s1 + s.length * 0.4, top - s.height * 0.4 + 0.15]], bottom: [[s0 - s.length * 0.2, top - s.height * 0.4 - 0.15], [s1 + s.length * 0.4, top - s.height * 0.4 - 0.15]], plan: [[s0 - s.length * 0.2, b * 1.1], [s1 + s.length * 0.4, b * 1.1]], round: 6, stations: 2 },
      { top: [[xa, 0.15], [xb, 0.15]], bottom: [[xa, -0.15], [xb, -0.15]], plan: [[xa, b * 0.4], [xa - (xa - xb) * 0.5, b * 1.2], [xb, b * 1.2]], round: 6, stations: 4 },
      { top: [[xa, b * 0.4], [xa - (xa - xb) * 0.5, b * 1.2], [xb, b * 1.2]], bottom: [[xa, -b * 0.4], [xa - (xa - xb) * 0.5, -b * 1.2], [xb, -b * 1.2]], plan: [[xa, 0.15], [xb, 0.15]], round: 6, stations: 4 },
    ];
  }
  outlineBody(k.team, k.fr, hullO, SUBHULL, 16);
  for (const o of bodies) subBody(k, o, grey(0.5));
}

// ---------------------------------------------------------------- guns

/** The faceted section of a modern mount and a big-gun turret: flat foot, upright sides, chamfered top corners. */
const MOUNT_SECTION: P2[] = [[-1, 0], [1, 0], [1, 0.5], [0.6, 1], [-0.6, 1], [-1, 0.5]];
const BOX_SECTION: P2[] = [[-1, 0], [1, 0], [0.98, 0.84], [0.92, 1], [-0.92, 1], [-0.98, 0.84]];

function turret(k: Kit, t: NavalTurret, fb: number, deckAt: (x: number, s?: number) => number, covered: (x: number, s: number, z: number) => boolean): void {
  const s = t.side ?? 0;
  const dir = t.back ? -1 : 1;
  const kind = t.kind ?? 'round';
  const z = t.size;
  // On the deck where it is: a gun forward stands no lower than the sheered deck under it.
  const deck = deckAt(t.x, s);
  const up = Math.max(fb + (t.up ?? 0), deck);
  const tub = kind === 'round' && t.calibre < 0.05;
  const torpedo = kind === 'mount' && t.calibre >= 0.25 && t.length >= 5.5 && z < 4;
  const team = new Mesh();
  const gun = new Mesh();
  // A raised gun stands on a barbette (or a deckhouse) down to the deck.
  if (Number.isFinite(deck) && up - deck > 0.3 && !covered(t.x, s, up)) {
    const rb = tub ? z * 0.5 : z * 0.42;
    spin(team, at(k.fr, t.x, s, deck - 0.2), at(k.fr, t.x, s, up), [[0, rb], [1, rb]], detail(14, 8), HOUSE);
  }
  let face = z * 0.3;
  let gunUp = up + z * 0.22;
  let profile: P2[] = [[0, 1], [1, 0.8]];
  if (torpedo) {
    // A torpedo mount: the tubes lie on a low turntable, centred over it.
    spin(team, at(k.fr, t.x, s, up), at(k.fr, t.x, s, up + 0.5), [[0, z * 0.45], [1, z * 0.42]], detail(12, 8), HOUSE);
    const r = Math.max(0.2, t.calibre * 0.8);
    const n = Math.max(1, t.barrels);
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * r * 2.3;
      spin(gun, at(k.fr, t.x - dir * t.length * 0.4, s + off, up + 0.5 + r), at(k.fr, t.x + dir * t.length * 0.6, s + off, up + 0.5 + r), [[0, r], [0.9, r], [1, r * 0.92]], detail(8, 5), PAINT.metal);
    }
    team.emit(k.team);
    gun.emit(k.fixed);
    return;
  }
  if (tub) {
    // A light gun's open tub: a low round wall, the gun on its pedestal inside.
    const r = z * 0.5;
    const h = Math.min(1.0, Math.max(0.35, z * 0.32));
    const th = Math.max(0.05, r * 0.08);
    sweep(team, at(k.fr, t.x, s, up), sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0)), sub3(at(k.fr, 1, 0, 0), at(k.fr, 0, 0, 0)), [[r, 0], [r, h], [r - th, h], [r - th, 0.05]], 0, Math.PI * 2, detail(14, 8), HOUSE);
    spin(gun, at(k.fr, t.x, s, up), at(k.fr, t.x, s, up + h * 0.9), [[0, r * 0.22], [1, r * 0.16]], 6, PAINT.metal);
    face = r * 0.1;
    gunUp = up + h * 0.95;
  } else if (kind === 'round') {
    const h = t.height ?? z * 0.46;
    blob(k.team, k.fr, [t.x, s, up + (h * 0.18) / 0.46], [z / 2, z / 2, (h * 0.28) / 0.46], HOUSE);
  } else if (kind === 'shield') {
    // An open gun: the pedestal, and the shield wrapping its front and sides, its top raked back.
    const h = t.height ?? z * 0.55;
    const r = z * 0.42;
    const ref = sub3(at(k.fr, dir, 0, 0), at(k.fr, 0, 0, 0));
    const upV = sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0));
    sweep(team, at(k.fr, t.x, s, up + 0.15), upV, ref, [[r, 0], [r - h * 0.15, h], [r - h * 0.15 - 0.06, h], [r - 0.06, 0]], -1.75, 1.75, detail(8, 5), HOUSE);
    spin(gun, at(k.fr, t.x, s, up), at(k.fr, t.x, s, up + h * 0.45), [[0, z * 0.18], [1, z * 0.14]], 8, PAINT.metal);
    face = r * 0.6;
    gunUp = up + h * 0.5;
  } else if (kind === 'box') {
    // A big-gun turret: the face sloped back, the sides drawn in toward it, a flat roof; a rangefinder's ears on a big one.
    const h = t.height ?? z * 0.36;
    const l = z * 1.05;
    const w = z * 0.45;
    const run = Math.min(0.3, (0.55 * h) / l);
    loftPoly(team, k.fr, t.x, s, up, dir, [[-0.5 * l, 0.97, 1], [-0.42 * l, 1, 1], [(0.5 - run) * l, 0.86, 1], [0.5 * l, 0.8, 0.36]], BOX_SECTION, w, h, HOUSE);
    if (z >= 9) spin(team, at(k.fr, t.x - dir * l * 0.3, s - w * 1.18, up + h * 0.62), at(k.fr, t.x - dir * l * 0.3, s + w * 1.18, up + h * 0.62), [[0, z * 0.04], [1, z * 0.04]], 8, HOUSE);
    face = l * (0.5 - run * 0.6);
    gunUp = up + Math.min(h * 0.42, z * 0.22 + 0.4);
    profile = t.calibre >= 0.2 ? [[0, 1.7], [0.06, 1.7], [0.085, 1.15], [0.96, 0.82], [1, 0.92]] : [[0, 1.4], [0.08, 1.4], [0.1, 1], [1, 0.82]];
  } else {
    // A modern mount (or a destroyer's enclosed gunhouse): faceted, its nose sloped, its back rounded.
    const h = t.height ?? z * 0.42;
    const l = z;
    const w = z * 0.36;
    loftPoly(team, k.fr, t.x, s, up, dir, [[-0.5 * l, 0.6, 0.8], [-0.38 * l, 0.92, 0.97], [-0.1 * l, 1, 1], [0.2 * l, 0.94, 0.92], [0.5 * l, 0.62, 0.38]], MOUNT_SECTION, w, h, HOUSE);
    face = l * 0.38;
    gunUp = up + Math.min(h * 0.45, z * 0.22 + 0.4);
    profile = [[0, 1.5], [0.07, 1.5], [0.09, 1], [1, 0.8]];
  }
  const r = Math.max(0.05, t.calibre * 0.8);
  const nb = detail(8, 5);
  for (let i = 0; i < t.barrels; i++) {
    const off = (i - (t.barrels - 1) / 2) * Math.max(r * 3, (z * 0.6) / Math.max(1, t.barrels));
    const a = at(k.fr, t.x + dir * face, s + off, gunUp);
    const e = at(k.fr, t.x + dir * (face + t.length), s + off, gunUp + z * 0.03);
    spin(gun, a, e, profile.map(([p, q]) => [p, q * r] as P2), nb, PAINT.metal);
  }
  if (team.idx.length) team.emit(k.team, { crease: 35 });
  if (gun.idx.length) gun.emit(k.fixed);
}

// ---------------------------------------------------------------- radars, launchers, funnels, masts

function radar(k: Kit, r: NavalRadar, deck: number, side: number, boxes: Box[], slope: number): void {
  const up = deck + r.up;
  const z = r.size;
  const m = new Mesh();
  switch (r.kind) {
    case 'array':
      // A wide search antenna, thin, leaned back a little, on its pedestal.
      tiltBox(k.fixed, k.fr, [r.x, side, up], z * 0.07, z, z * 0.24, 0.25, PAINT.light);
      spin(m, at(k.fr, r.x, side, up - z * 0.22), at(k.fr, r.x, side, up - z * 0.08), [[0, z * 0.05], [1, z * 0.04]], 8, PAINT.metal);
      break;
    case 'dish': {
      // A shallow bowl looking forward, on a stalk.
      const d = z * 0.18;
      const ref = sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0));
      sweep(m, at(k.fr, r.x - d, side, up), sub3(at(k.fr, 1, 0, 0), at(k.fr, 0, 0, 0)), ref, [[0.02, 0], [z * 0.25, d * 0.3], [z * 0.5, d], [z * 0.48, d], [z * 0.23, d * 0.35], [0.02, d * 0.1]], 0, Math.PI * 2, detail(14, 8), PAINT.light);
      spin(m, at(k.fr, r.x - d, side, up - z * 0.5), at(k.fr, r.x - d, side, up), [[0, z * 0.05], [1, z * 0.05]], 6, PAINT.metal);
      break;
    }
    case 'dome':
      blob(k.fixed, k.fr, [r.x, side, up], [z / 2, z / 2, z / 2], PAINT.light, 1, 6, 12);
      spin(m, at(k.fr, r.x, side, up - z * 0.75), at(k.fr, r.x, side, up - z * 0.3), [[0, z * 0.22], [1, z * 0.2]], 10, PAINT.light);
      break;
    case 'panel':
      tiltBox(k.fixed, k.fr, [r.x, side, up], z * 0.08, z, z, 0.3, PAINT.light);
      break;
    case 'faces': {
      // Four fixed octagonal faces leaned back, on the corners of the deckhouse they stand in (two looking
      // forward-out, two aft-out), or round the radar's place when no deckhouse holds it.
      const host = hostOf(boxes, r, up, side);
      const lean = (f: number): number => {
        // A cut corner leans back as much as its two walls do between them.
        if (!host) return 0.3;
        const h = Math.max(0.1, host.z1 - host.z0);
        const a0 = boxAt(host, slope, host.z0);
        const a1 = boxAt(host, slope, host.z1);
        const back = f > 0 ? a0.xf - a1.xf : a1.xb - a0.xb;
        return Math.atan((back + (a0.w - a1.w)) / (Math.SQRT2 * h));
      };
      for (const f of [-1, 1]) {
        for (const sd of [-1, 1]) {
          const df = f / Math.SQRT2;
          const ds = sd / Math.SQRT2;
          const tilt = lean(f);
          const n: Vec3 = [df * Math.cos(tilt), ds * Math.cos(tilt), Math.sin(tilt)];
          const ua: Vec3 = [-ds, df, 0];
          const va: Vec3 = [-df * Math.sin(tilt), -ds * Math.sin(tilt), Math.cos(tilt)];
          let c: Vec3 = [r.x + f * z * 0.55, side + sd * z * 0.55, up];
          if (host) {
            // On the cut corner, its middle at the radar's height (kept within the deckhouse), just proud of it.
            const zc = Math.max(host.z0 + z * 0.55, Math.min(up, host.z1 - z * 0.55));
            const { xf, xb, w } = boxAt(host, slope, zc);
            const cc = Math.min(host.cham ?? 0, w * 0.45, (xf - xb) * 0.3);
            c = [(f > 0 ? xf : xb) - (f * cc) / 2 + n[0] * 0.08, host.side + sd * (w - cc / 2) + n[1] * 0.08, zc];
          }
          const oct: P2[] = Array.from({ length: 8 }, (_, i) => {
            const q = Math.PI / 8 + (i * Math.PI) / 4;
            return [Math.cos(q) * z * 0.54, Math.sin(q) * z * 0.54];
          });
          slab(k.fixed, k.fr, oct, (a, b) => [c[0] + ua[0] * a + va[0] * b, c[1] + ua[1] * a + va[1] * b, c[2] + ua[2] * a + va[2] * b], n, 0.15, FACE);
        }
      }
      break;
    }
  }
  if (m.idx.length) m.emit(k.fixed);
}

function launcher(k: Kit, l: NonNullable<NavalSpec['launchers']>[number], fb: number, beam: number): void {
  const kind = l.kind ?? 'vls';
  const up = fb + (l.up ?? 0);
  if (kind === 'box') {
    // An armoured launcher box, its front face raked.
    const h = l.height ?? 0.6;
    const x0 = l.x + l.length / 2;
    const x1 = l.x - l.length / 2;
    prism3(k, [[x0, up], [x0 - Math.min(h * 0.5, l.length * 0.2), up + h], [x1, up + h], [x1, up]], -l.width / 2, l.width / 2, PAINT.metal, k.fixed);
    return;
  }
  if (kind === 'tubes') {
    // Canisters in rows either side, raised toward the bow, on a low cradle.
    const n = Math.max(1, l.count ?? 2);
    const d = Math.min(l.width / Math.max(1, n), 1.8);
    const e = l.elevation ?? 0.25;
    const m = new Mesh();
    const team = new Mesh();
    const seg = detail(10, 6);
    for (const sd of [-1, 1]) {
      for (let i = 0; i < n; i++) {
        const s = sd * (beam * 0.25 + i * d * 1.1);
        const h0 = up + d * 0.5;
        const dx = (l.length / 2) * Math.cos(e);
        const dz = (l.length / 2) * Math.sin(e);
        spin(team, at(k.fr, l.x - dx, s, h0 + (l.length / 2) * Math.sin(e) - dz), at(k.fr, l.x + dx, s, h0 + (l.length / 2) * Math.sin(e) + dz), [[0, d * 0.48], [0.03, d * 0.5], [0.97, d * 0.5], [1, d * 0.46]], seg, grey(0.8));
      }
      spin(m, at(k.fr, l.x - l.length * 0.3, sd * (beam * 0.25 + (n - 1) * d * 0.55), up), at(k.fr, l.x - l.length * 0.3, sd * (beam * 0.25 + (n - 1) * d * 0.55), up + d * 0.5), [[0, d * 0.3], [1, d * 0.3]], 4, PAINT.metal, Math.PI / 4);
    }
    team.emit(k.team);
    m.emit(k.fixed);
    return;
  }
  // Flush cells: the deck patch and a grid of hatches on it.
  plate(k.fixed, k.fr, [[l.x + l.length / 2, -l.width / 2], [l.x - l.length / 2, -l.width / 2], [l.x - l.length / 2, l.width / 2], [l.x + l.length / 2, l.width / 2]], up + 0.05, 0.1, CELLS);
  const cell = 1.6;
  const nx = Math.max(1, Math.floor(l.length / cell));
  const ny = Math.max(1, Math.floor(l.width / cell));
  const m = new Mesh();
  const z = up + 0.12;
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const x = l.x - l.length / 2 + (i + 0.5) * (l.length / nx);
      const s = -l.width / 2 + (j + 0.5) * (l.width / ny);
      const hx = (l.length / nx) * 0.38;
      const hs = (l.width / ny) * 0.38;
      m.quad(m.v(at(k.fr, x - hx, s - hs, z), HATCH), m.v(at(k.fr, x + hx, s - hs, z), HATCH), m.v(at(k.fr, x + hx, s + hs, z), HATCH), m.v(at(k.fr, x - hx, s + hs, z), HATCH));
    }
  }
  m.emit(k.fixed, { facing: sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0)) });
}

/** A ring-shaped shroud round a propeller or fan, its axis fore and aft, with the hub, the blades and a rudder behind it. */
function duct(k: Kit, d: NonNullable<NavalSpec['ducts']>[number]): void {
  const r1 = d.diameter / 2;
  const th = Math.max(0.06, r1 * 0.09);
  const team = new Mesh();
  const fixed = new Mesh();
  const axis = sub3(at(k.fr, -1, 0, 0), at(k.fr, 0, 0, 0));
  const ref = sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0));
  const c = at(k.fr, d.x + d.length / 2, d.side, d.up);
  // The shroud's section: a thick rounded lip at the front, thinning aft.
  sweep(team, c, axis, ref, [[r1 - th, 0], [r1 - th * 0.2, d.length * 0.08], [r1 + th * 0.3, d.length * 0.3], [r1 + th * 0.1, d.length], [r1 - th * 0.6, d.length], [r1 - th * 0.9, d.length * 0.3]], 0, Math.PI * 2, detail(20, 10), HULL);
  // The hub, and the blades as a cross of thin plates.
  spin(fixed, at(k.fr, d.x + d.length * 0.25, d.side, d.up), at(k.fr, d.x - d.length * 0.25, d.side, d.up), [[0, 0.02], [0.3, r1 * 0.16], [1, r1 * 0.14]], 8, PAINT.metal);
  for (let i = 0; i < 4; i++) {
    const q = (i * Math.PI) / 2 + 0.4;
    tiltBox(k.fixed, k.fr, [d.x, d.side + Math.cos(q) * r1 * 0.5, d.up + Math.sin(q) * r1 * 0.5], 0.08, r1 * 0.85, r1 * 0.22, 0, PAINT.metal, 1, Math.PI / 2 - q);
  }
  // A rudder in the slipstream behind it.
  tiltBox(k.team, k.fr, [d.x - d.length / 2 - r1 * 0.25, d.side, d.up], r1 * 0.4, 0.12, r1 * 1.6, 0, HULL);
  team.emit(k.team);
  fixed.emit(k.fixed);
}

/** A funnel: an oval loft from its foot to its top, raked aft, a dark cap band if it has one, and the dark opening at the top. */
function stack(k: Kit, f: NonNullable<NavalSpec['funnels']>[number], side: number, deck: number): void {
  const n = detail(16, 8);
  const a = f.diameter / 2;
  const b = (f.width ?? f.diameter) / 2;
  const rake = f.rake ?? (f.diameter * 0.3) / Math.max(1, f.height);
  const top = deck + f.height;
  const cap = Math.min(f.cap ?? 0, f.height * 0.4);
  const ringAt = (m: Mesh, z: number, kk: number, col: Rgb): number[] =>
    Array.from({ length: n }, (_, i) => {
      const t = (i / n) * Math.PI * 2;
      const c = Math.cos(t);
      const s = Math.sin(t);
      // A touch squarer than an ellipse: a funnel's casing has flat-ish sides.
      return m.v(at(k.fr, f.x - rake * (z - deck) + Math.sign(c) * Math.abs(c) ** 0.85 * a * kk, side + Math.sign(s) * Math.abs(s) ** 0.85 * b * kk, z), col);
    });
  const axisO = at(k.fr, f.x, side, deck);
  const axisD = unit(sub3(at(k.fr, f.x - rake, side, deck + 1), axisO));
  const body = new Mesh();
  const zc = top - cap;
  body.grid([ringAt(body, deck - 0.3, 1, HOUSE), ringAt(body, zc, 0.96, HOUSE)], true);
  if (!cap) body.grid([ringAt(body, zc, 0.96, HOUSE), ringAt(body, top - 0.001, 0.96, HOUSE)], true);
  body.emit(k.team, { axis: [axisO, axisD] });
  const kTop = cap ? 1.0 : 0.96;
  if (cap) {
    const band = new Mesh();
    band.grid([ringAt(band, zc, 1.0, PAINT.dark), ringAt(band, top, 1.0, PAINT.dark)], true);
    band.emit(k.fixed, { axis: [axisO, axisD] });
  }
  // The rim, the inside wall a little way down and the dark floor: the opening.
  const rim = new Mesh();
  rim.grid([ringAt(rim, top, kTop, PAINT.dark), ringAt(rim, top, kTop * 0.86, PAINT.dark)], true);
  rim.emit(k.fixed, { facing: sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0)) });
  const depth = Math.min(f.height * 0.3, Math.max(a, b) * 0.8);
  const inner = new Mesh();
  inner.grid([ringAt(inner, top, kTop * 0.86, PAINT.dark), ringAt(inner, top - depth, kTop * 0.86, PAINT.dark)], true);
  inner.emit(k.fixed, { axis: [axisO, axisD, true] });
  const floor = new Mesh();
  floor.fan(floor.v(at(k.fr, f.x - rake * (top - depth - deck), side, top - depth), PAINT.dark), ringAt(floor, top - depth, kTop * 0.86, PAINT.dark), false);
  floor.emit(k.fixed, { facing: sub3(at(k.fr, 0, 0, 1), at(k.fr, 0, 0, 0)) });
}

/** A mast: a tapered pole, a tripod with its two legs splayed aft, or a tapering square lattice truss; the yardarm across it. */
function mast(k: Kit, mt: NonNullable<NavalSpec['masts']>[number], side: number, foot: number, top: number, yardAt: number, beam: number): void {
  const h = top - foot;
  if (h <= 0) return;
  const kind = mt.kind ?? 'pole';
  const m = new Mesh();
  const W = (x: number, s: number, z: number) => at(k.fr, x, s, z);
  const rod = (a: Vec3, b: Vec3, r0: number, r1: number, n = 6) => spin(m, W(a[0], a[1], a[2]), W(b[0], b[1], b[2]), [[0, r0], [1, r1]], n, PAINT.metal, n === 4 ? Math.PI / 4 : 0);
  if (kind === 'lattice') {
    // Four corner legs tapering to a square top, a horizontal ring at each level and one brace across each face of a bay.
    const a0 = Math.max(0.5, h * 0.09);
    const a1 = Math.max(0.25, h * 0.025);
    const tz = foot + h * 0.8;
    const rl = clamp(h * 0.006, 0.05, 0.2);
    const corner = (i: number, z: number): Vec3 => {
      const s = a0 + ((a1 - a0) * (z - foot)) / (tz - foot);
      const q = Math.PI / 4 + (i * Math.PI) / 2;
      return [mt.x + Math.cos(q) * s * Math.SQRT2, side + Math.sin(q) * s * Math.SQRT2, z];
    };
    for (let i = 0; i < 4; i++) rod(corner(i, foot), corner(i, tz), rl, rl * 0.8, 4);
    const bays = detail(4, 2);
    for (let j = 0; j <= bays; j++) {
      const z = foot + ((tz - foot) * j) / bays;
      for (let i = 0; i < 4; i++) {
        if (j > 0) rod(corner(i, z), corner((i + 1) % 4, z), rl * 0.6, rl * 0.6, 4);
        if (j < bays) rod(corner(i, z), corner((i + 1) % 4, foot + ((tz - foot) * (j + 1)) / bays), rl * 0.5, rl * 0.5, 4);
      }
    }
    // A platform on top and the pole above it.
    plate(k.fixed, k.fr, [[mt.x + a1 * 1.6, side - a1 * 1.6], [mt.x - a1 * 1.6, side - a1 * 1.6], [mt.x - a1 * 1.6, side + a1 * 1.6], [mt.x + a1 * 1.6, side + a1 * 1.6]], tz, 0.15, PAINT.metal);
    rod([mt.x, side, tz], [mt.x, side, top], 0.15, 0.06);
  } else {
    rod([mt.x, side, foot], [mt.x, side, top], Math.max(0.12, mt.height * 0.03), Math.max(0.06, mt.height * 0.008), detail(8, 5));
    if (kind === 'pole' && h >= 12) {
      // A tall pole carries a platform for its lights and aerials and a second, shorter yard near the top.
      const p = Math.max(0.8, h * 0.04);
      plate(k.fixed, k.fr, [[mt.x + p, side - p], [mt.x - p, side - p], [mt.x - p, side + p], [mt.x + p, side + p]], foot + h * 0.58, 0.12, PAINT.metal);
      const y2 = (mt.yard ?? Math.max(1.5, beam * 0.35)) * 0.55;
      rod([mt.x, side - y2 / 2, foot + h * 0.9], [mt.x, side + y2 / 2, foot + h * 0.9], 0.06, 0.06, 4);
    }
    if (kind === 'tripod') {
      for (const sd of [-1, 1]) rod([mt.x - h * 0.2, side + sd * h * 0.12, foot], [mt.x, side, foot + h * 0.62], Math.max(0.1, h * 0.022), 0.08);
      // The tripod's top: a small platform where its legs meet.
      plate(k.fixed, k.fr, [[mt.x + 1, side - 1], [mt.x - 1.4, side - 1], [mt.x - 1.4, side + 1], [mt.x + 1, side + 1]].map(([x, s]) => [x, s] as P2), foot + h * 0.62, 0.15, PAINT.metal);
    }
  }
  const yard = mt.yard ?? Math.max(1.5, beam * 0.35);
  rod([mt.x, side - yard / 2, yardAt], [mt.x, side + yard / 2, yardAt], 0.08, 0.08, 4);
  m.emit(k.fixed);
}
