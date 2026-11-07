/**
 * Ground vehicles, put together from parts so that one type can be told from
 * another: the running gear (tracks with their road wheels, or axles), the
 * hull's side profile, a turret of a given shape and place, and what sits on
 * it - guns by mount, count and length, missile boxes, radars on masts. A
 * vehicle is a `GroundSpec` of its published size and its visible features;
 * nothing is copied from a game's model.
 *
 * Besides vehicles the same parts make what an air-defence site is built
 * from: launchers on a turntable with outriggers, radars and cabins on
 * trailers, antennas on lattice towers; and rail vehicles on their bogies.
 *
 * Frame: x forward, z right, y up, metres; the footprint's middle at the
 * origin, standing on y = 0.
 */

import { detail, finish, newKit, PAINT, withCoarse, type FigBuffer, type Kit, type Template } from './kit';
import { blob, block, fin, hexa, lerpPoly, outlineBody, plate, prism, slab, tiltBox, triangulate, tube, type Outline, type P2 } from './parts';
import { Mesh } from './mesh';
import { at, type Frame3, type Rgb, type Vec3 } from '../race/geometry';

/**
 * tracked, wheeled, halftrack: vehicles. towed: a gun on its carriage.
 * trailer: a flat towed bed with a drawbar (radars, launchers, cabins).
 * pedestal: a turntable on a cross of outriggers (emplaced launchers and AA
 * guns). rail: a body on two bogies. hover: a hull floating on a skirt.
 * static: a plain block.
 */
export type Chassis = 'tracked' | 'wheeled' | 'halftrack' | 'towed' | 'static' | 'trailer' | 'pedestal' | 'rail' | 'hover';
/**
 * ww2: a near-upright front plate and a flat deck. rhomboid: a WWI tank whose
 * tracks run round the whole hull side.
 */
export type HullShape = 'tank' | 'box' | 'boat' | 'mrap' | 'casemate' | 'low' | 'truck' | 'car' | 'open' | 'ww2' | 'rhomboid';
/**
 * sloped: a box whose sides lean in (WWII welded turrets, modern box
 * turrets). casemate: a fixed superstructure with a steep sloped front
 * (StuG, Jagdpanther). open: walls round an open top (open SPGs, AA mounts).
 * cylinder: an upright drum (launcher turntables).
 */
export type TurretShape = 'wedge' | 'cast' | 'box' | 'flat' | 'round' | 'tall' | 'open' | 'sloped' | 'casemate' | 'cylinder';

export interface TurretSpec {
  /** Centre, forward of the hull's middle, metres. */
  x: number;
  length: number;
  width: number;
  height: number;
  shape?: TurretShape;
  /** Sideways offset of the turret's middle. */
  side?: number;
  /**
   * How far the sides lean in, as a share of the width: for 'sloped' and 'casemate' (default 0.15), and for a welded
   * main turret of any other shape or outline (default 8 % of its height).
   */
  slope?: number;
  /** Raised above the deck by this much (a second turret on a step, a launcher on a column). */
  up?: number;
  /**
   * The turret's true shape: its side profile and plan, relative to the
   * turret's centre (forward) and its base (up), which replaces `shape`. The
   * gun comes out at `gunX` forward of the centre (default the front).
   */
  outline?: Outline;
  gunX?: number;
  /**
   * Kept for the specs that set it: a cast main turret (an outline of `round` under 5) is now drawn broad at its
   * base, standing on the deck as the casting does, so no separate ring is drawn under it either way.
   */
  ring?: boolean;
}

export interface GunSpec {
  /**
   * Where the gun sits: through the turret front, on the turret's sides, out
   * of the hull front, in a sponson on the hull side, or on top (a machine gun).
   */
  mount: 'turret' | 'turret-side' | 'hull' | 'top' | 'sponson';
  /** Barrels: on 'turret-side', per side. */
  count?: number;
  length: number;
  /** Calibre in metres; drawn thicker than true so it shows. */
  calibre: number;
  /** Elevation, radians. */
  elevation?: number;
  /** Spacing between barrels of one mount. */
  spread?: number;
  /** Height on the turret, 0..1 of its height (on the hull: of the hull height). */
  at?: number;
  /** Which turret: 0 the main one, 1.. the extra `turrets`. */
  turret?: number;
  /** A fume extractor's bulge, this far along the barrel (0 breech, 1 muzzle). */
  extractor?: number;
  /** A muzzle brake at the end. */
  muzzle?: boolean;
  /** A thicker thermal sleeve over this share of the barrel from the breech. */
  sleeve?: number;
  /** Hull and sponson guns: forward position of the breech (default near the front) and sideways offset. */
  x?: number;
  side?: number;
  /** A sponson gun on both sides. */
  both?: boolean;
}

export interface MissileSpec {
  /** On the turret's sides, on the turret top, on the hull behind it, or a box in place of a turret. */
  mount: 'turret-side' | 'turret-top' | 'hull' | 'turret-front';
  /** Rows and columns per side (per launcher). */
  rows: number;
  cols: number;
  length: number;
  diameter: number;
  elevation?: number;
  /** Boxes (square launchers) rather than round tubes. */
  boxes?: boolean;
  /** One closed pod round all of them (MLRS pods, canister launchers). */
  pod?: boolean;
  /** Missiles bare on launch rails (SA-2, SA-3, Hawk). */
  rail?: boolean;
  /** Forward offset from the mount's middle. */
  x?: number;
  /** Height above the mount's base. */
  up?: number;
  /** Sideways offset (hull mounts). */
  side?: number;
}

export interface RadarSpec {
  /**
   * A dish facing forward, a flat panel (search radar), a bar, a round dome,
   * a cylinder (a drum), a wide curved mesh reflector (an orange-peel search
   * antenna), an open lattice (a yagi or mesh array).
   */
  kind: 'dish' | 'panel' | 'bar' | 'dome' | 'drum' | 'peel' | 'grid';
  /** Forward position, relative to the turret's middle (or the hull's when there is no turret). */
  x: number;
  /** Height of the antenna's centre above the turret top (or hull top). */
  up: number;
  /** Diameter, or width of a panel. */
  size: number;
  /** Panel height (panels, peels, grids). */
  height?: number;
  /** Faces backwards. */
  back?: boolean;
  side?: number;
  /** Leaned back from upright, radians (panels and peels). */
  tilt?: number;
  /** Panel thickness, for deep phased-array faces. */
  depth?: number;
  /** What holds it up: a pole (default when raised), a four-legged lattice tower, or nothing. */
  mast?: 'pole' | 'tower' | 'none';
  /** Placed on the hull even when there is a turret. */
  hull?: boolean;
}

/** A box on the deck: cabins, shelters, engine covers, a container on a truck. */
export interface DeckBox {
  x: number;
  length: number;
  height: number;
  /** Default: the hull width less a little. */
  width?: number;
  side?: number;
  /** Raised above the deck. */
  up?: number;
}

export interface GroundSpec {
  chassis: Chassis;
  length: number;
  width: number;
  /** Height of the hull top (deck) above the ground. */
  hullHeight: number;
  hull?: HullShape;
  roadWheels?: number;
  axles?: number;
  /** Axle positions as a share of the half length from the middle, +1 at the front: for trucks whose rear axles pair up. */
  axleAt?: number[];
  wheelRadius?: number;
  /** Driver's cab at the front (trucks): its length and height; a bonnet ahead of it for a normal-control truck. */
  cab?: { length: number; height: number; glass?: boolean; bonnet?: number; outline?: Outline };
  /** What a truck carries behind the cab; 'none' draws only the frame, for a body built from `addOns`. */
  bed?: 'flat' | 'covered' | 'box' | 'tank' | 'none';
  turret?: TurretSpec;
  /** More turrets (multi-turret tanks, sub-turrets); guns pick theirs by `turret` index (1 = the first of these). */
  turrets?: TurretSpec[];
  guns?: GunSpec[];
  missiles?: MissileSpec[];
  radars?: RadarSpec[];
  boxes?: DeckBox[];
  /** Side skirts over the tracks. */
  skirts?: boolean;
  /** A small remote weapon station on the hull roof. */
  rws?: boolean;
  /** Commander's cupola on the turret. */
  cupola?: boolean;
  /** A windscreen and open top (jeeps). */
  open?: boolean;
  /** The fighting compartment is open above (half-tracks, open SPGs). */
  openTop?: boolean;
  /** An engine bonnet ahead of the hull, this long (half-tracks, armoured cars). */
  bonnet?: number;
  /** Spade at the back (towed guns and artillery). */
  spade?: boolean;
  /** A gun shield: on a towed gun by default; on an emplaced mount when set. */
  shield?: boolean;
  /** Levelling jacks at the corners (emplaced trailers and launchers). */
  outriggers?: boolean;
  /** A steam locomotive's boiler: its length and diameter, ahead of the cab. */
  boiler?: { length: number; diameter: number };
  /**
   * The upper hull's true shape, side profile and plan in the vehicle's frame
   * (forward from the middle, up from the ground), in place of `hull`'s
   * generic profile. The lower hull between the tracks stays.
   */
  hullOutline?: Outline;
  /** The run of the track seen from the side, (forward, up), in place of the generic one: where the sprocket and idler sit. */
  trackProfile?: P2[];
  /** Road wheel radius (default from the run and count). */
  roadWheelRadius?: number;
  /**
   * Open running gear, so a tank is known by its wheels from the side: the
   * track drawn as a band round its run (light shows between the wheels and
   * under the hull), solid road wheels at `wheels` (forward from the middle),
   * the sprocket and idler filling the ends, return rollers under the top run
   * at `rollers`. `band` is the track's thickness (default 0.1).
   */
  running?: { wheels: number[]; rollers?: number[]; band?: number; rollerRadius?: number };
  /** The side skirt seen from the side, (forward, up), convex, in place of the default band; with `skirts`. */
  skirt?: P2[];
  /** Parts added to the turret or the hull: armour packages, ERA bricks, sights, bustle racks, stowage. */
  addOns?: AddOn[];
  /**
   * Only the running gear is drawn for the chassis (wheels, tracks, bogies); the generic carriage, trailer bed,
   * pedestal or block is left out and the body comes from `hullOutline` (on any chassis) and `addOns`: a towed gun's
   * true trail, a trailer's own frame, a launcher's own base, a shelter of its own shape.
   */
  bare?: boolean;
  /** A rail vehicle's bogie centres, forward from the middle; the axles in each (default 2 on a long vehicle) and their spacing (default 1.8). */
  bogieAt?: number[];
  bogieAxles?: number;
  axleSpacing?: number;
}

/**
 * A part added to a vehicle: a block, a block pitched on a sloped plate, a
 * rounded lump, an upright drum, or an outline body. On the turret its
 * position is forward from the main turret's centre and up from its base; on
 * the hull, forward from the middle and up from the ground.
 */
export interface AddOn {
  on: 'turret' | 'hull';
  kind: 'box' | 'blob' | 'drum' | 'body' | 'tube' | 'slab';
  /** Centre (forward, side, up). */
  at: Vec3;
  /** Length, width, height (a drum: diameter, diameter, height). */
  size: Vec3;
  /** Nose up and turned to the right, radians, for boxes: bricks on a glacis, cheeks swept back. */
  pitch?: number;
  yaw?: number;
  /** For 'body': its outline about `at` (forward and up from `at`, half-widths). */
  outline?: Outline;
  /** Also on the other side (side mirrored). */
  mirror?: boolean;
  /** Dark metal rather than the team's colour: sight heads, racks, smoke dischargers. */
  metal?: boolean;
  /** For 'tube': its other end (forward, side, up), in the frame `at` is in; `size` gives the diameters at `at` and at `to`. */
  to?: Vec3;
  /**
   * For 'slab': a flat part of any outline, convex or not (a reflector, a launcher arm, a trailer's side frame, a
   * shelter seen side-on), `size[0]` thick, its polygon about `at` in its plane: 'side' upright along the vehicle
   * (forward, up), 'front' upright across it (side, up), 'plan' level (forward, side).
   */
  poly?: P2[];
  plane?: 'side' | 'front' | 'plan';
  /** For 'slab': the plate bowed toward its face by this much at the ends of its first axis (a trough or orange-peel reflector). */
  curve?: number;
  /** Rolled about its own forward axis, right side down, radians: for 'slab', 'tube' and 'body', as `pitch` and `yaw` are. */
  roll?: number;
  /** A fixed part in this paint rather than the team's colour: antennas and missiles 'light', glass, tyres. */
  paint?: 'metal' | 'dark' | 'light' | 'glass' | 'tyre' | 'track';
  /** The team part's shade, 0..1 (default 0.86): a canvas tilt darker, a radome lighter. */
  shade?: number;
  /** Round parts' segments (tubes; default 8). */
  segments?: number;
}

const grey = (k: number): Rgb => [k, k, k];

/**
 * A spec that spreads a base chassis and changes its length (a longer TELAR on the same family of hull) keeps the base's
 * hull outline, track run and wheel places; stretch those along the length to fit, when they are more than 5 % out.
 */
function fitLength(spec: GroundSpec): GroundSpec {
  const o = spec.hullOutline;
  if (!o) return spec;
  const xs = o.top.map((p) => p[0]);
  const span = Math.max(...xs) - Math.min(...xs);
  if (!(span > 0) || Math.abs(span - spec.length) / spec.length < 0.05) return spec;
  const k = spec.length / span;
  const sx = (p: P2[]): P2[] => p.map(([x, v]) => [x * k, v]);
  return {
    ...spec,
    hullOutline: { ...o, top: sx(o.top), bottom: sx(o.bottom), plan: sx(o.plan), round: Array.isArray(o.round) ? sx(o.round) : o.round },
    trackProfile: spec.trackProfile && sx(spec.trackProfile),
    running: spec.running && { ...spec.running, wheels: spec.running.wheels.map((x) => x * k), rollers: spec.running.rollers?.map((x) => x * k) },
  };
}

/** A ground figure, with its coarse build (fewer segments, the same shape) for when it is small on screen. */
export function buildGround(input: GroundSpec): Template {
  return withCoarse(() => buildAt(input))();
}

function buildAt(input: GroundSpec): Template {
  const spec = fitLength(input);
  const k = newKit();
  const L = spec.length;
  const W = spec.width;
  const H = spec.hullHeight;
  const chassis = spec.chassis;
  if (chassis === 'tracked' || chassis === 'halftrack') tracks(k, spec);
  if (chassis === 'wheeled' || chassis === 'towed' || chassis === 'halftrack' || chassis === 'trailer') wheels(k, spec);
  if (chassis === 'rail') bogies(k, spec);
  const bare = !!spec.bare;
  if (chassis === 'tracked' || chassis === 'wheeled' || chassis === 'halftrack' || chassis === 'rail' || chassis === 'hover') {
    if (!bare || spec.hullOutline) hull(k, spec);
  } else if (bare && spec.hullOutline) shell(k.team, k.fr, spec.hullOutline, grey(0.86));
  if (chassis === 'hover') blob(k.fixed, k.fr, [0, 0, 0.45], [L * 0.48, W * 0.48, 0.32], PAINT.dark);
  if (chassis === 'towed' && !bare) carriage(k, spec);
  if (chassis === 'trailer' && !bare) trailerBed(k, spec);
  if (chassis === 'pedestal' && !bare) pedestal(k, spec);
  if (chassis === 'static' && !bare) block(k.team, k.fr, [0, 0, H / 2], L, W, H, grey(0.8));
  if (spec.cab) truck(k, spec);
  if (spec.boiler) boiler(k, spec);
  const top = deckAt(spec);
  for (const b of spec.boxes ?? []) {
    const w = b.width ?? W - 0.2;
    block(k.team, k.fr, [b.x, b.side ?? 0, top + (b.up ?? 0) + b.height / 2], b.length, w, b.height, grey(0.84));
  }
  const turrets = [spec.turret, ...(spec.turrets ?? [])].filter((t): t is TurretSpec => !!t);
  for (const t of turrets) turret(k, spec, t, top + (t.up ?? 0));
  const main = spec.turret;
  const base = main ? top + (main.up ?? 0) + main.height : top;
  const mountX = main ? main.x : 0;
  if (spec.shield && chassis !== 'towed' && main) {
    // A gun shield standing in front of an emplaced gun's mount.
    const sx = main.x + main.length / 2 + 0.12;
    const sb = top + (main.up ?? 0) + main.height * 0.15;
    fin(k.team, k.fr, [[sx, sb], [sx + 0.12, sb], [sx + 0.12, sb + main.height * 1.15], [sx, sb + main.height * 1.05]], main.side ?? 0, main.width * 1.5, grey(0.85));
  }
  for (const g of spec.guns ?? []) gun(k, spec, g, top, turrets);
  if (chassis === 'tracked' && main && spec.hullOutline && (spec.guns ?? []).some((g) => g.mount === 'turret' && (g.turret ?? 0) === 0 && g.calibre >= 0.075)) engineDeck(k, spec, main);
  for (const m of spec.missiles ?? []) missiles(k, spec, m, top);
  for (const r of spec.radars ?? []) {
    if (r.hull || !main) radar(k, r, 0, top, 0);
    else radar(k, r, mountX, base, main.side ?? 0);
  }
  if (spec.rws) {
    const x = main ? main.x - main.length * 0.2 : L * 0.1;
    block(k.fixed, k.fr, [x, W * 0.15, top + 0.18], 0.4, 0.35, 0.3, PAINT.metal);
    tube(k.fixed, k.fr, [x + 0.1, W * 0.15, top + 0.25], [x + 0.9, W * 0.15, top + 0.25], 0.03, 0.03, PAINT.dark, 5);
  }
  for (const a of spec.addOns ?? []) addOn(k, a, a.on === 'turret' && main ? [main.x, main.side ?? 0, top + (main.up ?? 0)] : [0, 0, 0]);
  return finish(k, 'ground');
}

/**
 * The frame of an add-on turned about its centre `c` (forward, side, up in `fr`): rolled right side down, pitched
 * nose up, then turned to the right, as `tiltBox` turns; `sd` -1 for the mirrored copy, a true reflection.
 */
function turned(fr: Frame3, c: Vec3, roll: number, pitch: number, yaw: number, sd: number): Frame3 {
  const cr = Math.cos(roll * sd);
  const sr = Math.sin(roll * sd);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cy = Math.cos(yaw * sd);
  const sy = Math.sin(yaw * sd);
  // A vector given as (forward, right, up): rolled, pitched, yawed, then put in the kit's frame.
  const v = (a0: number, b0: number, c0: number): Vec3 => {
    const b1 = b0 * cr + c0 * sr;
    const c1 = -b0 * sr + c0 * cr;
    const a2 = a0 * cp - c1 * sp;
    const c2 = a0 * sp + c1 * cp;
    const a3 = a2 * cy - b1 * sy;
    const b3 = a2 * sy + b1 * cy;
    return [fr.f[0] * a3 + fr.r[0] * b3 + fr.u[0] * c2, fr.f[1] * a3 + fr.r[1] * b3 + fr.u[1] * c2, fr.f[2] * a3 + fr.r[2] * b3 + fr.u[2] * c2];
  };
  const r = v(0, 1, 0);
  return { o: at(fr, c[0], c[1], c[2]), f: v(1, 0, 0), r: sd < 0 ? [-r[0], -r[1], -r[2]] : r, u: v(0, 0, 1) };
}

/** A slab add-on's polygon with its edges cut short enough along the first axis that a bowed plate bends smoothly. */
function densify(poly: P2[], step: number): P2[] {
  const out: P2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const n = Math.max(1, Math.ceil(Math.abs(q[0] - p[0]) / step));
    for (let j = 0; j < n; j++) out.push([p[0] + ((q[0] - p[0]) * j) / n, p[1] + ((q[1] - p[1]) * j) / n]);
  }
  return out;
}

/** Draws an add-on about its origin (the main turret's centre and base, or the hull's middle on the ground). */
function addOn(k: Kit, a: AddOn, o: Vec3): void {
  const buf = a.metal || a.paint ? k.fixed : k.team;
  const col = a.paint ? PAINT[a.paint] : a.metal ? PAINT.metal : grey(a.shade ?? 0.86);
  const turnedAt = (c: Vec3, sd: number) => turned(k.fr, c, a.roll ?? 0, a.pitch ?? 0, a.yaw ?? 0, sd);
  for (const sd of a.mirror ? [1, -1] : [1]) {
    const c: Vec3 = [o[0] + a.at[0], o[1] + a.at[1] * sd, o[2] + a.at[2]];
    const [l, w, h] = a.size;
    if (a.kind === 'box') tiltBox(buf, k.fr, c, l, w, h, a.pitch ?? 0, col, 1, (a.yaw ?? 0) * sd);
    else if (a.kind === 'blob') blob(buf, k.fr, c, [l / 2, w / 2, h / 2], col);
    else if (a.kind === 'drum') tube(buf, k.fr, [c[0], c[1], c[2] - h / 2], [c[0], c[1], c[2] + h / 2], l / 2, w / 2, col, 12);
    else if (a.kind === 'tube') {
      const e = a.to ?? a.at;
      const d: Vec3 = [e[0] - a.at[0], e[1] - a.at[1], e[2] - a.at[2]];
      if (a.roll || a.pitch || a.yaw) tube(buf, turnedAt(c, sd), [0, 0, 0], d, l / 2, w / 2, col, a.segments ?? 8);
      else tube(buf, k.fr, c, [o[0] + e[0], o[1] + e[1] * sd, o[2] + e[2]], l / 2, w / 2, col, a.segments ?? 8);
    } else if (a.kind === 'slab') {
      if (!a.poly || a.poly.length < 3) continue;
      const plane = a.plane ?? 'side';
      const span = Math.max(...a.poly.map((p) => Math.abs(p[0]))) || 1;
      const poly = a.curve ? densify(a.poly, span / 6) : a.poly;
      const bend = (p: number) => (a.curve ?? 0) * (p / span) ** 2;
      const map = (p: number, q: number): Vec3 => (plane === 'side' ? [p, bend(p), q] : plane === 'front' ? [bend(p), p, q] : [p, q, bend(p)]);
      const normal: Vec3 = plane === 'side' ? [0, 1, 0] : plane === 'front' ? [1, 0, 0] : [0, 0, 1];
      slab(buf, turnedAt(c, sd), poly, map, normal, l, col);
    } else if (a.outline && (a.roll || a.pitch || a.yaw)) outlineBody(buf, turnedAt(c, sd), a.outline, col, 12);
    else if (a.outline) {
      const ol = a.outline;
      const mv = (p: P2[], u: number): P2[] => p.map(([f, v]) => [c[0] + f, u + v]);
      outlineBody(buf, k.fr, { ...ol, top: mv(ol.top, c[2]), bottom: mv(ol.bottom, c[2]), plan: ol.plan.map(([f, v]) => [c[0] + f, v]), round: Array.isArray(ol.round) ? ol.round.map(([f, r]) => [c[0] + f, r]) : ol.round, side: c[1] }, col, 12);
    }
  }
}

// ---------------------------------------------------------------- bodies: welded plates and castings

/** Where an outline's three polylines all reach: the x range a body from it spans. */
function spanOf(o: Outline): [number, number] {
  const lists = [o.top, o.bottom, o.plan];
  return [Math.max(...lists.map((l) => Math.min(...l.map((p) => p[0])))), Math.min(...lists.map((l) => Math.max(...l.map((p) => p[0]))))];
}

/** The outline's roundness at `x` (a number, or by station). */
function roundAt(o: Outline, x: number, fallback: number): number {
  return typeof o.round === 'number' ? o.round : o.round ? lerpPoly(o.round, x) : fallback;
}

/** An outline's corners in its range; a step (two corners at one x) as a station just either side of it. */
function cornersOf(o: Outline, x0: number, x1: number): number[] {
  const set = new Set<number>([x0, x1]);
  for (const l of [o.top, o.bottom, o.plan, ...(Array.isArray(o.round) ? [o.round] : [])]) {
    for (let i = 0; i < l.length; i++) {
      const x = l[i][0];
      if (x <= x0 || x >= x1) continue;
      const step = (i > 0 && Math.abs(l[i - 1][0] - x) < 1e-9) || (i + 1 < l.length && Math.abs(l[i + 1][0] - x) < 1e-9);
      if (step) {
        set.add(x - 1e-3);
        set.add(x + 1e-3);
      } else set.add(x);
    }
  }
  return [...set].sort((a, b) => a - b).filter((x, i, a) => i === 0 || x - a[i - 1] > 2e-4);
}

/**
 * A welded body from its outlines (as `outlineBody` takes them): cut only at the outlines' corners, so between them
 * each face is one flat plate, and every section an octagon - the sides leaning in by `lean` of the height, the top
 * edges chamfered (more the lower the outline's `round`) and the bottom ones a little. Hulls, turrets, cabs and boxes
 * come out as armour plate with crisp lit edges and the glacis, deck and rear plates each catching the light their
 * own way, where a soft loft would round them into one another.
 */
function facetBody(out: FigBuffer, fr: Frame3, o: Outline, col: Rgb, lean = 0): void {
  const side = o.side ?? 0;
  const [x0, x1] = spanOf(o);
  if (!(x1 > x0)) return;
  const m = new Mesh();
  const rows = cornersOf(o, x0, x1).map((x) => {
    const w = Math.max(1e-3, lerpPoly(o.plan, x));
    const t = lerpPoly(o.top, x);
    const b = Math.min(t - 1e-3, lerpPoly(o.bottom, x));
    const h = t - b;
    const c = Math.min(0.3, Math.max(0.05, 0.9 / roundAt(o, x, 10))) * Math.min(w, h);
    const cb = c * 0.5;
    const lw = Math.min(w * 0.4, lean * h);
    const ring: P2[] = [[w - cb, b], [w, b + cb], [w - lw, t - c], [w - lw - c, t], [-(w - lw - c), t], [-(w - lw), t - c], [-w, b + cb], [-(w - cb), b]];
    return { x, mid: (t + b) / 2, ids: ring.map(([s, u]) => m.v(at(fr, x, side + s, u), col)) };
  });
  m.grid(rows.map((r) => r.ids), true);
  const first = rows[0];
  const last = rows[rows.length - 1];
  m.fan(m.v(at(fr, first.x, side, first.mid), col), first.ids, true);
  m.fan(m.v(at(fr, last.x, side, last.mid), col), last.ids, false);
  m.emit(out, { crease: 12 });
}

/** |c|^e with c's sign. */
const spow = (c: number, e: number) => Math.sign(c) * Math.abs(c) ** e;

/**
 * A cast turret from its outlines: smooth all over, its section a dome over near-upright lower sides - widest about
 * a third of the way up, the roof flattened, the base broad on the turret ring - and its ends drawn in round, as
 * the Soviet castings and the wartime cast turrets are.
 */
function castBody(out: FigBuffer, fr: Frame3, o: Outline, col: Rgb): void {
  const side = o.side ?? 0;
  const [x0, x1] = spanOf(o);
  if (!(x1 > x0)) return;
  const span = x1 - x0;
  const set = new Set(cornersOf(o, x0, x1));
  const ns = detail(12, 6);
  for (let i = 0; i <= ns; i++) {
    const t = i / ns;
    set.add(x0 + span * (0.5 * t + 0.25 * (1 - Math.cos(Math.PI * t))));
  }
  const xs = [...set].sort((a, b) => a - b).filter((x, i, a) => i === 0 || x - a[i - 1] > span * 0.012);
  const n = detail(18, 10) & ~1;
  // The ends drawn in over their last stretch, as a dome's would be.
  const D = Math.min(span * 0.18, 0.3);
  const m = new Mesh();
  const rows = xs.map((x) => {
    const edge = Math.min(x - x0, x1 - x);
    const g = edge >= D ? 1 : Math.max(0.6, Math.sqrt(1 - (1 - edge / D) ** 2));
    const w = Math.max(1e-3, lerpPoly(o.plan, x)) * g;
    const top = lerpPoly(o.top, x);
    const b = lerpPoly(o.bottom, x);
    const t = b + Math.max(1e-3, top - b) * (0.55 + 0.45 * g);
    const zc = b + (t - b) * 0.32;
    const e = 2 / (Math.max(2.2, roundAt(o, x, 2.4)) + 0.4);
    const ids = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const sd = s >= 0 ? w * spow(c, e) : w * spow(c, 0.5);
      const up = s >= 0 ? zc + (t - zc) * s ** e : zc - (zc - b) * (-s) ** 0.5;
      return m.v(at(fr, x, side + sd, up), col);
    });
    return { x, zc, ids };
  });
  m.grid(rows.map((r) => r.ids), true);
  const first = rows[0];
  const last = rows[rows.length - 1];
  m.fan(m.v(at(fr, first.x, side, first.zc), col), first.ids, true);
  m.fan(m.v(at(fr, last.x, side, last.zc), col), last.ids, false);
  m.emit(out, {});
}

/** A body from an outline: cast and rounded below `round` 5 when `cast`, welded plates from 5 up, the kernel's soft loft for other round parts. */
function shell(out: FigBuffer, fr: Frame3, o: Outline, col: Rgb, lean = 0, cast = false): void {
  const r = typeof o.round === 'number' ? o.round : o.round ? Math.min(...o.round.map((p) => p[1])) : 2.4;
  if (r >= 5) facetBody(out, fr, o, col, lean);
  else if (cast) castBody(out, fr, o, col);
  else outlineBody(out, fr, o, col, 14);
}

/** A convex side profile (forward, up) as an outline of `half` width: its top and its underside at each corner. */
function profileOutline(profile: P2[], half: number, round = 12, side = 0): Outline {
  const xs = [...new Set(profile.map((p) => p[0]))].sort((a, b) => a - b);
  const cut = (x: number): [number, number] => {
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < profile.length; i++) {
      const [a0, b0] = profile[i];
      const [a1, b1] = profile[(i + 1) % profile.length];
      if (x < Math.min(a0, a1) - 1e-9 || x > Math.max(a0, a1) + 1e-9) continue;
      const vs = Math.abs(a1 - a0) < 1e-9 ? [b0, b1] : [b0 + ((b1 - b0) * (x - a0)) / (a1 - a0)];
      for (const v of vs) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    }
    return [lo, hi];
  };
  const cuts = xs.map((x) => [x, ...cut(x)] as const);
  return { top: cuts.map(([x, , hi]) => [x, hi]), bottom: cuts.map(([x, lo]) => [x, lo]), plan: [[xs[0], half], [xs[xs.length - 1], half]], round, side };
}

/**
 * The glass of a cab or a car body drawn from its outline: where the roof ends in a steep drop forward - a
 * windscreen raked back between 40 and 80 degrees, at least 0.35 m tall - the screen on that face and side windows
 * along the roof behind it. A body whose front falls more gently (an armoured car's glacis) has none.
 */
function glazing(k: Kit, o: Outline): void {
  const top = o.top;
  const hi = Math.max(...top.map((p) => p[1]));
  let i = -1;
  for (let j = 0; j < top.length; j++) if (top[j][1] > hi - 1e-6) i = j;
  if (i < 0 || i + 1 >= top.length) return;
  const [xa, ua] = top[i];
  const [xb, ub] = top[i + 1];
  const drop = ua - ub;
  const angle = Math.atan2(drop, xb - xa);
  if (!(xb > xa) || drop < 0.35 || angle < (40 * Math.PI) / 180 || angle > (80 * Math.PI) / 180) return;
  const side = o.side ?? 0;
  const l = Math.hypot(xb - xa, drop);
  // Out of the screen's face, forward and up.
  const nf = drop / l;
  const nu = (xb - xa) / l;
  const along = (t: number): [number, number] => [xa + (xb - xa) * t + nf * 0.012, ua - drop * t + nu * 0.012];
  const pane = (c: Vec3[], normal: Vec3) => slab(k.fixed, k.fr, [[0, 0], [1, 0], [1, 1], [0, 1]], (p, q) => {
    const lo = c[0].map((v, a) => v + (c[1][a] - v) * p);
    const up = c[3].map((v, a) => v + (c[2][a] - v) * p);
    return lo.map((v, a) => v + (up[a] - v) * q) as Vec3;
  }, normal, 0.015, PAINT.glass);
  const [f0, u0] = along(0.82);
  const [f1, u1] = along(0.1);
  const w0 = lerpPoly(o.plan, f0) * 0.82;
  const w1 = lerpPoly(o.plan, f1) * 0.82;
  pane([[f0, side - w0, u0], [f0, side + w0, u0], [f1, side + w1, u1], [f1, side - w1, u1]], [nf, 0, nu]);
  // Side windows: the upper part of the cab's sides behind the screen, as far back as the roof runs level.
  let back = xa;
  for (let j = i - 1; j >= 0 && top[j][1] > hi - 0.08; j--) back = top[j][0];
  const x0 = back + Math.min(0.25, (xa - back) * 0.15);
  const x1 = xa - 0.06;
  if (x1 - x0 < 0.3) return;
  const lo = hi - Math.min(0.5, drop * 0.75);
  const top2 = hi - Math.min(0.12, drop * 0.2);
  for (const sd of [-1, 1]) {
    const wx0 = lerpPoly(o.plan, x0) + 0.008;
    const wx1 = lerpPoly(o.plan, x1) + 0.008;
    pane([[x0, side + sd * wx0, lo], [x1, side + sd * wx1, lo], [x1, side + sd * wx1, top2], [x0, side + sd * wx0, top2]], [0, sd, 0]);
  }
}

/** The deck the turret stands on. */
function deckAt(spec: GroundSpec): number {
  return spec.hullHeight;
}

function trackHeight(spec: GroundSpec): number {
  if (spec.hull === 'rhomboid') return spec.hullHeight;
  return Math.min(1.05, spec.hullHeight * 0.62);
}

function trackWidth(spec: GroundSpec): number {
  return spec.hull === 'rhomboid' ? Math.max(0.5, spec.width * 0.2) : Math.max(0.3, spec.width * 0.17);
}

function tracks(k: Kit, spec: GroundSpec): void {
  const L = spec.chassis === 'halftrack' ? spec.length * 0.55 : spec.length * 0.97;
  const x0 = spec.chassis === 'halftrack' ? -spec.length / 2 + L / 2 : 0;
  const th = trackHeight(spec);
  const tw = trackWidth(spec);
  const half = L / 2;
  const rhomboid = spec.hull === 'rhomboid';
  // The run of the track: low at the back, the drive or idler raised at the
  // front; on a rhomboid the track climbs to a high front horn and runs back
  // over the top.
  const profile: P2[] = spec.trackProfile
    ? spec.trackProfile
    : rhomboid
    ? [
        [x0 - half + 1.0, 0],
        [x0 + half - 2.4, 0],
        [x0 + half, th * 0.66],
        [x0 + half - 0.8, th],
        [x0 - half + 0.4, th],
        [x0 - half, th * 0.45],
      ]
    : [
        [x0 - half + 0.35, 0],
        [x0 + half - 0.55, 0],
        [x0 + half, th * 0.62],
        [x0 + half - 0.25, th * 0.92],
        [x0 - half + 0.15, th * 0.92],
        [x0 - half, th * 0.55],
      ];
  if (rhomboid) {
    for (const side of [-1, 1]) {
      const outer = side * (spec.width / 2);
      const inner = side * (spec.width / 2 - tw);
      prism(k.fixed, k.fr, profile, Math.min(inner, outer), Math.max(inner, outer), PAINT.track);
      // The track frame's side plate, inside the run of the track.
      const inset: P2[] = profile.map(([x, u]) => [x0 + (x - x0) * 0.9, th * 0.08 + u * 0.82]);
      prism(k.team, k.fr, inset, outer - side * 0.02, outer + side * 0.03, grey(0.8));
    }
    return;
  }
  const run = spec.running;
  let wheelsAt: number[];
  let r: number;
  if (run) {
    wheelsAt = run.wheels;
    r = spec.roadWheelRadius ?? Math.min(0.42, th * 0.38);
  } else {
    // Evenly along the ground run, the end wheels a little in from where the track leaves the ground.
    const n = Math.max(3, spec.roadWheels ?? Math.round(L / 1.0));
    r = spec.roadWheelRadius ?? Math.min(0.42, (L - 0.9) / n / 2.1, th * 0.38);
    const ground = profile.filter((p) => p[1] < th * 0.08).map((p) => p[0]);
    const g0 = ground.length > 1 ? Math.min(...ground) + r * 0.5 : x0 - half + 0.45 + r;
    const g1 = ground.length > 1 ? Math.max(...ground) - r * 0.5 : x0 + half - 0.45 - r;
    wheelsAt = Array.from({ length: n }, (_, i) => g0 + ((g1 - g0) * i) / Math.max(1, n - 1));
  }
  runningGear(k, spec, profile, th, tw, wheelsAt, r, run?.rollers ?? [], run?.band ?? 0.1, run?.rollerRadius);
}

/** The steel of the track's shoes, a little lighter than the rubber and shadow between them, so the links show. */
const SHOE: Rgb = [0.3, 0.29, 0.27];

/**
 * The running gear on both sides: the track as a belt round its wheels (light shows through it between the wheels
 * and under the hull, as on the real vehicle), its links alternating shoe and gap along the tread and the outer
 * edge; road wheels with their rubber tyres and dished discs, the toothed sprocket at the higher end of the run and
 * the idler at the other, return rollers under the top run; side skirts over it when the spec has them.
 */
function runningGear(k: Kit, spec: GroundSpec, profile: P2[], th: number, tw: number, wheelsAt: number[], r: number, rollers: number[], band: number, rollerRadius?: number): void {
  const xs = profile.map((p) => p[0]);
  const xf = Math.max(...xs);
  const xb = Math.min(...xs);
  const endAt = (x: number) => {
    const pts = profile.filter((p) => Math.abs(p[0] - x) < 1e-6);
    return pts.reduce((s, p) => s + p[1], 0) / pts.length;
  };
  // Sprocket and idler: each end of the run wraps round a wheel whose outside reaches the run's furthest point.
  const re = Math.max(0.18, Math.min(0.4, th * 0.3));
  const endCentre = (x: number, sign: number): [number, number] => [x - sign * re, Math.max(re + 0.02, Math.min(th - re, endAt(x)))];
  const [fx, fu] = endCentre(xf, 1);
  const [bx, bu] = endCentre(xb, -1);
  // The drive sprocket is the end held higher (the front on most wartime tanks, the back on modern ones).
  const sprocketFront = endAt(xf) > endAt(xb) + 0.02;
  const solid = r < 0.05;
  const rr = rollerRadius ?? Math.max(0.09, r * 0.35);
  const circles: { x: number; u: number; r: number }[] = [{ x: fx, u: fu, r: re }, { x: bx, u: bu, r: re }];
  for (const x of wheelsAt) if (!solid) circles.push({ x, u: band + r, r: r + band });
  for (const x of rollers) circles.push({ x, u: th - band - rr, r: rr + band });
  // The run's own corners hold the belt where no wheel does: the ground run's ends and the top run's.
  for (const [x, u] of profile) {
    if (x === xf || x === xb) continue;
    const c = u < th * 0.5 ? 0.12 : 0.04;
    circles.push({ x, u: u < th * 0.5 ? c : u - c, r: c });
  }
  const outerPath = belt(circles);
  for (const side of [-1, 1]) {
    const o = side * (spec.width / 2);
    const i = side * (spec.width / 2 - tw);
    trackBand(k.fixed, k.fr, outerPath, band, Math.min(o, i), Math.max(o, i), side);
    if (solid) {
      // Tracks run round a closed pannier (a Churchill's): its side plate fills the run.
      prism(k.team, k.fr, insetPolygon(outerPath, band + 0.02), o - side * 0.06, o - side * 0.02, grey(0.8));
    } else {
      // The wheels' outer faces stand a little inside the track's edge, their hubs just short of it.
      const face = o - side * 0.075;
      const width = tw - 0.12;
      for (const x of wheelsAt) roadWheel(k, x, band + r, r, face, width, side);
      for (const x of rollers) roadWheel(k, x, th - band - rr, rr, face - side * 0.02, Math.min(width, 0.2), side, true);
      const [sx, su, ix, iu] = sprocketFront ? [fx, fu, bx, bu] : [bx, bu, fx, fu];
      sprocket(k, sx, su, re - band * 0.35, re - band - 0.03, face, side);
      roadWheel(k, ix, iu, re - band - 0.01, face, width, side, true);
    }
    if (spec.skirts) skirtPanels(k, spec.skirt ?? [[xb + 0.2, th * 0.45], [xf - 0.4, th * 0.45], [xf - 0.4, th * 0.95], [xb + 0.2, th * 0.95]], o - side * 0.02, o + side * 0.03);
  }
}

/**
 * A gun tank's engine deck behind the turret, where the hull's roof runs level: a low raised plate with two dark
 * louvred grilles in it, so the long back deck reads as one from above.
 */
function engineDeck(k: Kit, spec: GroundSpec, t: TurretSpec): void {
  const top = spec.hullOutline!.top;
  const x0 = -spec.length / 2 + 0.4;
  const x1 = t.x - t.length / 2 - 0.15;
  if (x1 - x0 < 0.9) return;
  const u0 = lerpPoly(top, x0);
  const u1 = lerpPoly(top, x1);
  if (Math.abs(u0 - u1) > 0.1) return;
  const u = Math.max(u0, u1);
  const half = Math.min(...spec.hullOutline!.plan.map((p) => p[1])) * 0.78;
  plate(k.team, k.fr, [[x0, -half], [x1, -half], [x1, half], [x0, half]], u + 0.015, 0.05, grey(0.84));
  const gw = half * 0.82;
  const louvres = detail(4, 2);
  for (const sd of [-1, 1]) {
    const c = sd * half * 0.5;
    plate(k.fixed, k.fr, [[x0 + 0.12, c - gw / 2], [x1 - 0.12, c - gw / 2], [x1 - 0.12, c + gw / 2], [x0 + 0.12, c + gw / 2]], u + 0.042, 0.01, PAINT.dark);
    for (let i = 1; i <= louvres; i++) {
      const x = x0 + 0.12 + ((x1 - x0 - 0.24) * i) / (louvres + 1);
      block(k.team, k.fr, [x, c, u + 0.055], 0.05, gw, 0.03, grey(0.8));
    }
  }
}

/** A side skirt (its outline seen from the side, convex) hung as a row of panels about a metre long, a thin gap between each. */
function skirtPanels(k: Kit, poly: P2[], s0: number, s1: number): void {
  const xs = poly.map((p) => p[0]);
  const a = Math.min(...xs);
  const b = Math.max(...xs);
  const n = Math.max(1, Math.round((b - a) / 1.1));
  const gap = 0.025;
  for (let i = 0; i < n; i++) {
    const x0 = a + ((b - a) * i) / n + (i > 0 ? gap / 2 : 0);
    const x1 = a + ((b - a) * (i + 1)) / n - (i + 1 < n ? gap / 2 : 0);
    const piece = clipX(poly, x0, x1);
    if (piece.length >= 3) extrude(k.team, k.fr, piece, s0, s1, grey(0.84));
  }
}

/** A convex polygon (forward, up) cut to the strip between x0 and x1. */
function clipX(poly: P2[], x0: number, x1: number): P2[] {
  const cut = (pts: P2[], keep: (p: P2) => boolean, x: number): P2[] => {
    const out: P2[] = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      if (keep(p)) out.push(p);
      if (keep(p) !== keep(q)) {
        const t = (x - p[0]) / (q[0] - p[0]);
        out.push([x, p[1] + (q[1] - p[1]) * t]);
      }
    }
    return out;
  };
  return cut(cut(poly, (p) => p[0] >= x0, x0), (p) => p[0] <= x1, x1);
}

/** The outline of a belt round circles (x, up, radius): their convex hull, counter-clockwise. */
function belt(circles: { x: number; u: number; r: number }[]): P2[] {
  const n = detail(12, 8);
  const pts: P2[] = [];
  for (const c of circles) for (let i = 0; i < n; i++) pts.push([c.x + Math.cos((i / n) * Math.PI * 2) * c.r, c.u + Math.sin((i / n) * Math.PI * 2) * c.r]);
  return convexHull(pts);
}

/** The convex hull of points, counter-clockwise (the monotone chain). */
function convexHull(points: P2[]): P2[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const turn = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: P2[] = [];
  for (const q of p) {
    while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], q) <= 1e-9) lower.pop();
    lower.push(q);
  }
  const upper: P2[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], q) <= 1e-9) upper.pop();
    upper.push(q);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/**
 * A track as a band round its run: `path` its outside (forward, up; convex, counter-clockwise), `band` thick, from
 * `s0` to `s1` across, `side` the vehicle's side it is on. Cut into links along its length - each flat, alternately
 * shoe and gap on the tread and the outer edge - so it reads as a track, not a belt, and bends round the sprocket
 * in short straight pieces as a real one does. Its inside and the edge toward the hull are left out: they are
 * hidden behind the wheels and the hull.
 */
function trackBand(out: FigBuffer, fr: Frame3, path: P2[], band: number, s0: number, s1: number, side: number): void {
  const pitch = 0.3 / Math.max(0.5, detail(10, 4) / 10);
  const pts: P2[] = [];
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 1e-4) continue;
    const pieces = Math.max(1, Math.round(len / pitch));
    for (let j = 0; j < pieces; j++) pts.push([a[0] + ((b[0] - a[0]) * j) / pieces, a[1] + ((b[1] - a[1]) * j) / pieces]);
  }
  const inner = insetPolygon(pts, band);
  const so = side > 0 ? s1 : s0;
  const n = pts.length;
  const w = (f: number, s: number, u: number) => at(fr, f, s, u);
  const dir = (f: number, s: number, u: number): Vec3 => [fr.f[0] * f + fr.r[0] * s + fr.u[0] * u, fr.f[1] * f + fr.r[1] * s + fr.u[1] * u, fr.f[2] * f + fr.r[2] * s + fr.u[2] * u];
  const quad = (a: Vec3, b: Vec3, c: Vec3, d: Vec3, nn: Vec3, col: Rgb) => {
    for (const p of [a, b, c, a, c, d]) out.vn(p, nn, col);
  };
  // Pieces alternate; an odd count would put two shoes together once round, where the run starts.
  const even = n % 2 === 0 ? n : n - 1;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [pf, pu] = pts[i];
    const [qf, qu] = pts[j];
    const l = Math.hypot(qf - pf, qu - pu) || 1;
    // Outward from the run, for a counter-clockwise path: the edge turned right.
    const nf = (qu - pu) / l;
    const nu = -(qf - pf) / l;
    const col = i % 2 === 0 || i >= even ? SHOE : PAINT.track;
    quad(w(pf, s0, pu), w(qf, s0, qu), w(qf, s1, qu), w(pf, s1, pu), dir(nf, 0, nu), col);
    quad(w(pf, so, pu), w(qf, so, qu), w(inner[j][0], so, inner[j][1]), w(inner[i][0], so, inner[i][1]), dir(0, side, 0), col);
  }
}

/**
 * A solid of revolution of the ground figures' own, about the axis from `a` along the unit `d` (both forward, side,
 * up): `prof` gives (distance along the axis, radius) in order, a radius of 0 a pole. Its segment count is given, not
 * set by its size as the parts' lathe sets it, so a dozen road wheels or a barrel's many rings stay light.
 */
function revolve(out: FigBuffer, fr: Frame3, a: Vec3, d: Vec3, prof: P2[], n: number, col: Rgb, crease = 40): void {
  const helper: Vec3 = Math.abs(d[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const u = unit(cross3(d, helper));
  const v = cross3(d, u);
  const m = new Mesh();
  const rows = prof.map(([t, r]) => {
    const c: Vec3 = [a[0] + d[0] * t, a[1] + d[1] * t, a[2] + d[2] * t];
    if (r <= 1e-6) {
      const i = m.v(at(fr, c[0], c[1], c[2]), col);
      return Array.from({ length: n }, () => i);
    }
    return Array.from({ length: n }, (_, i) => {
      const ca = Math.cos((i / n) * Math.PI * 2) * r;
      const sa = Math.sin((i / n) * Math.PI * 2) * r;
      return m.v(at(fr, c[0] + u[0] * ca + v[0] * sa, c[1] + u[1] * ca + v[1] * sa, c[2] + u[2] * ca + v[2] * sa), col);
    });
  });
  m.grid(rows, true);
  const wa = at(fr, a[0], a[1], a[2]);
  const wb = at(fr, a[0] + d[0], a[1] + d[1], a[2] + d[2]);
  m.emit(out, { crease, axis: [wa, [wb[0] - wa[0], wb[1] - wa[1], wb[2] - wa[2]]] });
}

function cross3(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function unit(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

/**
 * A road wheel at `x`, its centre `u` high: the rubber tyre round it, and the dished disc in the vehicle's paint
 * swelling out to the hub. `face` is where its outer face stands across, `width` how wide it is, `side` which side of
 * the vehicle. A return roller or an idler (`plain`) is all steel, its disc flatter.
 */
function roadWheel(k: Kit, x: number, u: number, r: number, face: number, width: number, side: number, plain = false): void {
  const n = detail(plain ? 8 : 10, 6);
  const a: Vec3 = [x, face - side * width, u];
  const d: Vec3 = [0, side, 0];
  revolve(k.fixed, k.fr, a, d, [[0, r], [width, r], [width, r * 0.8]], n, plain ? PAINT.metal : PAINT.tyre);
  const dish = Math.min(0.07, r * 0.2);
  revolve(k.team, k.fr, a, d, [[width, r * 0.8], [width + dish * 0.6, r * 0.3], [width + dish, 0]], n, grey(0.8), plain ? 30 : 60);
}

/** The drive sprocket: a toothed ring in the vehicle's paint at the track's outer face, and its hub. */
function sprocket(k: Kit, x: number, u: number, tip: number, root: number, face: number, side: number): void {
  const teeth = detail(9, 6);
  const poly: P2[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rad = i % 2 === 0 ? tip : root;
    poly.push([x + Math.cos(a) * rad, u + Math.sin(a) * rad]);
  }
  extrude(k.team, k.fr, poly, face - side * 0.05, face + side * 0.05, grey(0.78));
  revolve(k.team, k.fr, [x, face + side * 0.05, u], [0, side, 0], [[0, root * 0.45], [0.02, root * 0.3], [0.04, 0]], detail(8, 6), grey(0.82));
}

/** A flat-sided solid from its outline (forward, up; any simple polygon) pushed from `s0` to `s1` across, its edges crisp, no bevel. */
function extrude(out: FigBuffer, fr: Frame3, poly: P2[], s0: number, s1: number, col: Rgb): void {
  const m = new Mesh();
  const lo = Math.min(s0, s1);
  const hi = Math.max(s0, s1);
  const a = poly.map(([f, u]) => m.v(at(fr, f, lo, u), col));
  const b = poly.map(([f, u]) => m.v(at(fr, f, hi, u), col));
  m.grid([a, b], true);
  const ca = poly.map(([f, u]) => m.v(at(fr, f, lo, u), col));
  const cb = poly.map(([f, u]) => m.v(at(fr, f, hi, u), col));
  for (const [i, j, l] of triangulate(poly)) {
    m.tri(ca[i], ca[l], ca[j]);
    m.tri(cb[i], cb[j], cb[l]);
  }
  m.emit(out, { crease: 30 });
}

/** A convex polygon moved inward by `d` along each edge's normal. */
function insetPolygon(poly: P2[], d: number): P2[] {
  const n = poly.length;
  let area = 0;
  for (let i = 0; i < n; i++) area += poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1];
  const s = area > 0 ? 1 : -1;
  // Each edge's line moved inward: a point on it and its direction.
  const lines = poly.map((p, i) => {
    const q = poly[(i + 1) % n];
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const l = Math.hypot(dx, dy) || 1;
    return { p: [p[0] - (s * dy * d) / l, p[1] + (s * dx * d) / l] as P2, e: [dx / l, dy / l] as P2 };
  });
  return poly.map((_, i) => {
    const a = lines[(i + n - 1) % n];
    const b = lines[i];
    const den = a.e[0] * b.e[1] - a.e[1] * b.e[0];
    if (Math.abs(den) < 1e-6) return b.p;
    const t = ((b.p[0] - a.p[0]) * b.e[1] - (b.p[1] - a.p[1]) * b.e[0]) / den;
    return [a.p[0] + a.e[0] * t, a.p[1] + a.e[1] * t] as P2;
  });
}

function wheelRadiusOf(spec: GroundSpec): number {
  return spec.wheelRadius ?? Math.min(0.6, Math.max(0.3, spec.hullHeight * 0.32));
}

function wheels(k: Kit, spec: GroundSpec): void {
  const r = wheelRadiusOf(spec);
  const half = spec.length / 2;
  const front = spec.chassis === 'halftrack' ? half - r - 0.4 : half - r - Math.max(0.35, spec.length * 0.12);
  const axles = spec.chassis === 'halftrack' ? 1 : Math.max(1, spec.axles ?? (spec.chassis === 'trailer' && spec.length > 5 ? 2 : spec.chassis === 'trailer' ? 1 : 2));
  const back = spec.chassis === 'towed' ? 0 : -half + r + Math.max(0.35, spec.length * 0.12);
  const xs: number[] = [];
  if (spec.axleAt) for (const a of spec.axleAt) xs.push(a * half);
  else if (spec.chassis === 'trailer') {
    // A trailer's wheels under its back half, the drawbar ahead.
    const c = -half * 0.3;
    for (let i = 0; i < axles; i++) xs.push(c + (i - (axles - 1) / 2) * (2 * r + 0.2));
  } else if (axles === 1) xs.push(spec.chassis === 'halftrack' ? front : 0);
  else if (axles === 2) xs.push(front, back);
  else {
    // Front axles grouped, the rest spread to the back, as on most 6x6 and 8x8.
    for (let i = 0; i < axles; i++) xs.push(front - ((front - back) * i) / (axles - 1));
  }
  const w = Math.max(0.2, Math.min(0.5, r * 0.8));
  for (const x of xs) {
    for (const side of [-1, 1]) {
      tyre(k, x, side * (spec.width / 2 - w), r, r, w, side);
    }
  }
}

/**
 * A road vehicle's wheel at `x`: the tyre from `inner` across (signed) `w` wide toward `side`, its shoulders
 * rounded, and the steel wheel in its face, dished in to the hub, in the vehicle's paint.
 */
export function tyre(k: Kit, x: number, inner: number, up: number, r: number, w: number, side: number): void {
  const n = detail(12, 8);
  const a: Vec3 = [x, inner, up];
  const d: Vec3 = [0, side, 0];
  revolve(k.fixed, k.fr, a, d, [[0, r * 0.66], [w * 0.16, r], [w * 0.84, r], [w, r * 0.66]], n, PAINT.tyre, 75);
  revolve(k.team, k.fr, a, d, [[w, r * 0.66], [w - 0.04, r * 0.52], [w - 0.02, r * 0.2], [w + 0.01, 0]], n, grey(0.78), 50);
}

/** Two bogies of two axles each under a rail vehicle, and the frame between them. */
function bogies(k: Kit, spec: GroundSpec): void {
  const half = spec.length / 2;
  const r = spec.wheelRadius ?? 0.46;
  const gauge = Math.min(spec.width / 2 - 0.25, 0.76);
  const centres = spec.bogieAt ?? (spec.length > 9 ? [half - 2.4, -half + 2.4] : [half * 0.5, -half * 0.5]);
  const n = spec.bogieAxles ?? (spec.length > 9 ? 2 : 1);
  const step = spec.axleSpacing ?? 1.8;
  for (const c of centres) {
    const axles = Array.from({ length: n }, (_, i) => c + ((n - 1) / 2 - i) * step);
    for (const x of axles) {
      for (const side of [-1, 1]) {
        // A steel rail wheel: its flange inside (standing on the ground, the rail left out), the tread, the web dished in to the hub.
        const n = detail(12, 8);
        revolve(k.fixed, k.fr, [x, side * (gauge - 0.07), r * 1.06], [0, side, 0], [[0, r * 0.7], [0, r * 1.06], [0.025, r * 1.06], [0.04, r], [0.14, r], [0.14, r * 0.85], [0.11, r * 0.3], [0.16, r * 0.18], [0.17, 0]], n, PAINT.metal);
      }
    }
    block(k.fixed, k.fr, [c, 0, r + 0.1], (n - 1) * step + 1.2, gauge * 2 + 0.3, 0.35, PAINT.dark);
  }
}

function hull(k: Kit, spec: GroundSpec): void {
  const H = spec.hullHeight;
  // The armoured body runs from the back to the bonnet, if there is one.
  const bonnet = spec.bonnet ?? 0;
  const front = spec.length / 2 - bonnet;
  const back = -spec.length / 2;
  const L = front - back;
  const c = (front + back) / 2;
  const half = L / 2;
  const tracked = spec.chassis === 'tracked';
  const floor = tracked
    ? trackHeight(spec) * 0.42
    : spec.chassis === 'rail'
      ? (spec.wheelRadius ?? 0.46) * 2 + 0.3
      : spec.chassis === 'hover'
        ? 0.6
        : Math.max(0.35, (spec.wheelRadius ?? H * 0.32) * 1.05);
  const shape = spec.hull ?? (tracked ? 'tank' : 'box');
  if (shape === 'rhomboid') {
    rhomboidHull(k, spec);
    return;
  }
  let profile: P2[];
  switch (shape) {
    case 'tank':
      // A low hull, its glacis sloped back to the deck.
      profile = [[-half + 0.05, floor], [half - 0.45, floor], [half, H * 0.6], [half - L * 0.2, H], [-half + 0.1, H], [-half, H * 0.72]];
      break;
    case 'ww2':
      // A lower glacis, then a near-upright driver's plate up to a flat deck.
      profile = [[-half + 0.05, floor], [half - 0.3, floor], [half, H * 0.55], [half - L * 0.05, H], [-half + 0.1, H], [-half, H * 0.72]];
      break;
    case 'casemate':
      profile = [[-half + 0.05, floor], [half - 0.4, floor], [half, H * 0.55], [half - L * 0.35, H], [-half + 0.25, H], [-half, H * 0.7]];
      break;
    case 'boat':
      // An amphibious hull: a pointed bow under, a long sloped front plate.
      profile = [[-half + 0.2, floor], [half - 1.0, floor * 0.9], [half, H * 0.55], [half - L * 0.28, H], [-half + 0.1, H], [-half, H * 0.6]];
      break;
    case 'mrap':
      profile = [[-half + 0.1, floor], [half - 0.3, floor], [half, H * 0.52], [half - 0.4, H * 0.62], [half - L * 0.32, H], [-half + 0.05, H], [-half, H * 0.85]];
      break;
    case 'low':
      profile = [[-half + 0.05, floor], [half - 0.3, floor], [half, H * 0.7], [half - 0.6, H], [-half + 0.1, H], [-half, H * 0.8]];
      break;
    case 'car':
      profile = [[-half, floor], [half, floor], [half, H * 0.62], [half - L * 0.3, H * 0.7], [-half + 0.1, H * 0.7], [-half, H * 0.62]];
      break;
    case 'open':
      profile = [[-half, floor], [half - 0.2, floor], [half, H * 0.8], [half - 0.3, H], [-half + 0.1, H], [-half, H * 0.85]];
      break;
    case 'truck':
      profile = [[-half, floor], [half, floor], [half, floor + 0.25], [-half, floor + 0.25]];
      break;
    default:
      profile = [[-half + 0.05, floor], [half - 0.2, floor], [half, H * 0.6], [half - 0.5, H], [-half + 0.05, H], [-half, H * 0.85]];
  }
  if (c !== 0) profile = profile.map(([x, u]) => [x + c, u] as P2);
  const w = spec.width / 2 - (tracked ? 0.02 : 0.05);
  if (tracked) {
    // The lower hull sits between the tracks; the upper hull spans them, its
    // sides the fenders, so the run of the track shows below it.
    const th = trackHeight(spec);
    const tw = trackWidth(spec);
    const fender = th * 0.92;
    const lowerProfile: P2[] = [[c - half + 0.3, floor], [c + half - 0.5, floor], [c + half - 0.15, fender], [c - half + 0.15, fender]];
    prism(k.team, k.fr, lowerProfile, -(spec.width / 2 - tw), spec.width / 2 - tw, grey(0.8));
    // The upper hull's sides lean in a little above the fenders, as welded hull plates do.
    if (spec.hullOutline) shell(k.team, k.fr, spec.hullOutline, grey(0.86), 0.06);
    else {
      const upper = profile.map(([x, u]) => [x, Math.max(u, fender)] as P2);
      facetBody(k.team, k.fr, profileOutline(dedupe(upper), w), grey(0.86), 0.06);
    }
  } else if (spec.hullOutline) {
    shell(k.team, k.fr, spec.hullOutline, grey(0.86));
    if (spec.chassis === 'wheeled') glazing(k, spec.hullOutline);
  } else facetBody(k.team, k.fr, profileOutline(profile, w), grey(0.86), shape === 'truck' ? 0 : 0.04);
  if (bonnet > 0) {
    // The engine bonnet, narrower and lower than the body, a radiator in front.
    const hb = Math.max(floor + 0.4, H * 0.72);
    const x1 = spec.length / 2;
    prism(k.team, k.fr, [[front + 0.05, floor], [x1, floor], [x1, hb * 0.85], [x1 - 0.25, hb], [front + 0.05, hb]], -w * 0.8, w * 0.8, grey(0.84), 1, grey(0.95));
    block(k.fixed, k.fr, [x1 + 0.01, 0, (floor + hb * 0.85) / 2], 0.04, w * 1.1, (hb * 0.85 - floor) * 0.8, PAINT.dark);
  }
  if (spec.openTop) {
    // The open fighting compartment: a dark well behind the driver.
    const x0 = back + 0.25;
    const x1 = front - Math.min(L * 0.3, 1.6);
    plate(k.fixed, k.fr, [[x1, -w * 0.85], [x0, -w * 0.85], [x0, w * 0.85], [x1, w * 0.85]], H + 0.01, 0.02, PAINT.dark);
  }
  if (spec.open) {
    // A windscreen and seats, open above.
    plate(k.fixed, k.fr, [[c + L * 0.12, -w], [c + L * 0.16, -w], [c + L * 0.16, w], [c + L * 0.12, w]], H * 0.7 + 0.25, 0.5, PAINT.glass, 0.6);
    block(k.fixed, k.fr, [c - L * 0.05, -w * 0.45, H * 0.7 + 0.25], 0.5, 0.45, 0.5, PAINT.dark);
    block(k.fixed, k.fr, [c - L * 0.05, w * 0.45, H * 0.7 + 0.25], 0.5, 0.45, 0.5, PAINT.dark);
  }
  if (shape === 'mrap') {
    // The armoured cab's windows.
    plate(k.fixed, k.fr, [[c + half - L * 0.3, -w * 0.9], [c + half - L * 0.18, -w * 0.9], [c + half - L * 0.18, w * 0.9], [c + half - L * 0.3, w * 0.9]], H * 0.88, 0.3, PAINT.glass);
  }
}

/** A WWI tank's hull between its rhomboid track frames, and the driver's cab on the front of the roof. */
function rhomboidHull(k: Kit, spec: GroundSpec): void {
  const half = spec.length / 2;
  const H = spec.hullHeight;
  const inner = spec.width / 2 - trackWidth(spec);
  prism(k.team, k.fr, [[-half + 0.6, 0.35], [half - 1.6, 0.35], [half - 0.6, H * 0.8], [-half + 0.4, H * 0.9], [-half + 0.2, H * 0.5]], -inner, inner, grey(0.82), 1, grey(0.95));
  block(k.team, k.fr, [half - 2.2, 0, H + 0.25], 1.3, inner * 1.6, 0.5, grey(0.88));
}

/** A profile without points that fell onto their neighbour when it was clipped. */
function dedupe(points: P2[]): P2[] {
  const out: P2[] = [];
  for (const p of points) {
    const q = out[out.length - 1];
    if (!q || Math.abs(q[0] - p[0]) > 1e-3 || Math.abs(q[1] - p[1]) > 1e-3) out.push(p);
  }
  const first = out[0];
  const last = out[out.length - 1];
  if (out.length > 1 && Math.abs(first[0] - last[0]) < 1e-3 && Math.abs(first[1] - last[1]) < 1e-3) out.pop();
  return out;
}

function truck(k: Kit, spec: GroundSpec): void {
  const cab = spec.cab!;
  const half = spec.length / 2;
  const floor = Math.max(0.6, (spec.wheelRadius ?? 0.5) * 1.6);
  const w = spec.width / 2 - 0.05;
  const bonnet = cab.bonnet ?? 0;
  const x1 = half - bonnet;
  const x0 = x1 - cab.length;
  if (cab.outline) {
    // The cab and bonnet from their true side profile and plan, in the vehicle's frame.
    shell(k.team, k.fr, cab.outline, grey(0.88));
    glazing(k, cab.outline);
  } else if (bonnet > 0) {
    // A normal-control truck: the engine under a bonnet ahead of the cab.
    const hb = Math.max(floor + 0.5, cab.height * 0.62);
    prism(k.team, k.fr, [[x1, floor], [half, floor], [half, hb * 0.92], [half - 0.2, hb], [x1, hb]], -w * 0.72, w * 0.72, grey(0.85), 1, grey(0.96));
    block(k.fixed, k.fr, [half + 0.01, 0, (floor + hb) / 2], 0.04, w * 1.1, (hb - floor) * 0.75, PAINT.dark);
    prism(k.team, k.fr, [[x0, floor], [x1, floor], [x1, cab.height], [x0, cab.height]], -w, w, grey(0.88), 1, grey(0.97));
    if (cab.glass !== false) block(k.fixed, k.fr, [x1 + 0.01, 0, cab.height * 0.8], 0.04, w * 1.7, cab.height * 0.22, PAINT.glass);
  } else {
    prism(k.team, k.fr, [[x0, floor], [x1, floor], [x1, cab.height * 0.6], [x1 - cab.length * 0.25, cab.height], [x0, cab.height]], -w, w, grey(0.88), 1, grey(0.97));
    if (cab.glass !== false) plate(k.fixed, k.fr, [[x1 - cab.length * 0.27, -w * 0.9], [x1 - cab.length * 0.05, -w * 0.9], [x1 - cab.length * 0.05, w * 0.9], [x1 - cab.length * 0.27, w * 0.9]], cab.height * 0.82, cab.height * 0.22, PAINT.glass);
  }
  const bx1 = x0 - 0.15;
  const bx0 = -half;
  const bed = spec.bed ?? 'covered';
  if (bed === 'covered') {
    // A canvas tilt over bows: upright sides, the roof's shoulders rounded, the ends a little lower.
    const H = spec.hullHeight;
    const bw = spec.width / 2 - 0.05;
    outlineBody(k.team, k.fr, { top: [[bx0, H - 0.12], [bx0 + 0.2, H], [bx1 - 0.2, H], [bx1, H - 0.12]], bottom: [[bx0, floor], [bx1, floor]], plan: [[bx0, bw], [bx1, bw]], round: [[bx0, 4], [bx1, 4]], stations: 6 }, grey(0.62), 16);
  } else if (bed === 'none') {
    // Only the frame: the body is built from add-ons.
  } else if (bed === 'box') block(k.team, k.fr, [(bx0 + bx1) / 2, 0, (floor + spec.hullHeight) / 2], bx1 - bx0, spec.width - 0.1, spec.hullHeight - floor, grey(0.8));
  else if (bed === 'tank') {
    tube(k.team, k.fr, [bx0 + 0.2, 0, (floor + spec.hullHeight) / 2], [bx1 - 0.1, 0, (floor + spec.hullHeight) / 2], (spec.hullHeight - floor) / 2, (spec.hullHeight - floor) / 2, grey(0.75), 12);
  } else block(k.team, k.fr, [(bx0 + bx1) / 2, 0, floor + 0.12], bx1 - bx0, spec.width - 0.1, 0.24, grey(0.7));
  block(k.fixed, k.fr, [0, 0, floor - 0.1], spec.length - 0.3, 0.6, 0.2, PAINT.dark);
}

/** A steam locomotive's boiler and chimney ahead of its cab. */
function boiler(k: Kit, spec: GroundSpec): void {
  const b = spec.boiler!;
  const half = spec.length / 2;
  const r = b.diameter / 2;
  const up = spec.hullHeight + r * 0.9;
  tube(k.team, k.fr, [half - 0.3, 0, up], [half - 0.3 - b.length, 0, up], r, r, grey(0.55), 14);
  tube(k.fixed, k.fr, [half - 1.0, 0, up + r * 0.6], [half - 1.0, 0, up + r + 0.7], 0.3, 0.33, PAINT.dark, 10);
  blob(k.team, k.fr, [half - 0.3 - b.length * 0.5, 0, up + r], [0.4, 0.35, 0.3], grey(0.5));
}

function carriage(k: Kit, spec: GroundSpec): void {
  const half = spec.length / 2;
  const h = spec.hullHeight;
  if ((spec.axles ?? 1) >= 2) {
    // A four-wheeled AA carriage: a platform between the axles, outriggers folded out to the sides.
    const xs = (spec.axleAt ?? [0.6, -0.6]).map((a) => a * half);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const r = wheelRadiusOf(spec);
    block(k.team, k.fr, [(x0 + x1) / 2, 0, r * 1.1], x1 - x0 + 0.6, spec.width * 0.55, 0.3, grey(0.78));
    for (const side of [-1, 1]) {
      tube(k.fixed, k.fr, [(x0 + x1) / 2, side * spec.width * 0.25, r * 1.1], [(x0 + x1) / 2, side * (spec.width / 2 + 1.0), 0.08], 0.06, 0.05, PAINT.dark, 4);
      block(k.fixed, k.fr, [(x0 + x1) / 2, side * (spec.width / 2 + 1.0), 0.05], 0.4, 0.4, 0.1, PAINT.dark);
    }
    tube(k.team, k.fr, [(x0 + x1) / 2, 0, r * 1.1], [(x0 + x1) / 2, 0, h * 0.95], 0.35, 0.3, grey(0.75), 10);
  }
  // A towed gun's split trail and shield.
  else for (const side of [-1, 1]) tube(k.team, k.fr, [0.2, side * 0.2, h * 0.5], [-half + 0.2, side * spec.width * 0.35, 0.1], 0.07, 0.06, grey(0.78), 5);
  if (spec.shield !== false) fin(k.team, k.fr, [[0.15, h * 0.35], [0.3, h * 0.35], [0.3, h * 1.25], [0.15, h * 1.15]], 0, spec.width * 0.8, grey(0.85));
  else block(k.team, k.fr, [0, 0, h * 0.6], 0.8, 0.8, h * 0.5, grey(0.8));
}

/** A flat towed bed, its drawbar to the front, and jacks at the corners when emplaced. */
function trailerBed(k: Kit, spec: GroundSpec): void {
  const half = spec.length / 2;
  const H = spec.hullHeight;
  const bar = Math.min(1.6, spec.length * 0.2);
  const x1 = half - bar;
  const r = wheelRadiusOf(spec);
  block(k.team, k.fr, [(x1 - half) / 2, 0, H - 0.15], x1 + half, spec.width - 0.1, 0.3, grey(0.78));
  block(k.fixed, k.fr, [(x1 - half) / 2, 0, Math.min(H - 0.35, r + 0.05)], x1 + half - 0.4, 0.5, 0.2, PAINT.dark);
  tube(k.fixed, k.fr, [x1, 0, H - 0.25], [half, 0, Math.max(0.45, r)], 0.07, 0.06, PAINT.dark, 5);
  if (spec.outriggers) {
    for (const sx of [-1, 1]) {
      for (const ss of [-1, 1]) {
        const x = sx > 0 ? x1 - 0.2 : -half + 0.2;
        const s = ss * (spec.width / 2 + 0.25);
        tube(k.fixed, k.fr, [x, ss * (spec.width / 2 - 0.2), H - 0.2], [x, s, 0.1], 0.05, 0.05, PAINT.dark, 4);
        block(k.fixed, k.fr, [x, s, 0.05], 0.35, 0.35, 0.1, PAINT.dark);
      }
    }
  }
}

/** A turntable column on a cross of outriggers. */
function pedestal(k: Kit, spec: GroundSpec): void {
  const L = spec.length;
  const W = spec.width;
  const H = spec.hullHeight;
  const arm = Math.min(L, W);
  block(k.fixed, k.fr, [0, 0, 0.12], arm, 0.35, 0.24, PAINT.dark);
  block(k.fixed, k.fr, [0, 0, 0.12], 0.35, arm, 0.24, PAINT.dark);
  for (const [x, s] of [[arm / 2, 0], [-arm / 2, 0], [0, arm / 2], [0, -arm / 2]]) block(k.fixed, k.fr, [x, s, 0.06], 0.45, 0.45, 0.12, PAINT.dark);
  const r = Math.max(0.35, arm * 0.13);
  tube(k.team, k.fr, [0, 0, 0.2], [0, 0, H], r * 1.2, r, grey(0.78), 12);
}

function turret(k: Kit, spec: GroundSpec, t: TurretSpec, base: number): void {
  const x = t.x;
  const l = t.length;
  const w = t.width;
  const h = t.height;
  const s = t.side ?? 0;
  const shape = t.shape ?? 'wedge';
  const P = (f: number, u: number): P2 => [x + f, base + u];
  let profile: P2[];
  switch (shape) {
    case 'wedge':
      profile = [P(-l / 2, 0), P(l / 2 - 0.15 * l, 0), P(l / 2, h * 0.5), P(l / 2 - 0.3 * l, h), P(-l / 2 + 0.05, h), P(-l / 2 - 0.08 * l, h * 0.45)];
      break;
    case 'flat':
      profile = [P(-l / 2, 0), P(l / 2, 0), P(l / 2 - 0.1 * l, h * 0.8), P(l / 2 - 0.25 * l, h), P(-l / 2 + 0.05 * l, h), P(-l / 2, h * 0.7)];
      break;
    case 'tall':
      profile = [P(-l / 2, 0), P(l / 2, 0), P(l / 2, h * 0.8), P(l / 2 - 0.12 * l, h), P(-l / 2, h)];
      break;
    case 'box':
      profile = [P(-l / 2, 0), P(l / 2, 0), P(l / 2, h), P(-l / 2, h)];
      break;
    default:
      profile = [];
  }
  const main = t === spec.turret;
  // How far a welded turret's sides lean in, as a share of its height; a spec's `slope` is a share of the width.
  const lean = main ? (t.slope !== undefined ? (t.slope * w) / Math.max(0.2, h) : 0.08) : 0;
  if (t.outline) {
    const o = t.outline;
    shell(k.team, k.fr, { ...o, top: o.top.map(([f, u]) => [x + f, base + u]), bottom: o.bottom.map(([f, u]) => [x + f, base + u]), plan: o.plan.map(([f, w2]) => [x + f, w2]), round: Array.isArray(o.round) ? o.round.map(([f, r]) => [x + f, r]) : o.round, side: s }, grey(0.9), lean, main);
  } else if (shape === 'cast' || shape === 'round') {
    // A casting: widest a little behind its middle, the front drawn in under the gun, the roof a low dome.
    const k2 = shape === 'round' ? 1 : 0.9;
    castBody(k.team, k.fr, { plan: [[x - l / 2, w * 0.36], [x - l * 0.22, w / 2], [x + l * 0.15, w * 0.47], [x + l / 2, w * 0.28]], top: [[x - l / 2, base + h * 0.62 * k2], [x - l * 0.15, base + h], [x + l * 0.2, base + h * 0.96], [x + l / 2, base + h * 0.55 * k2]], bottom: [[x - l / 2, base], [x + l / 2, base]], round: 2.4, side: s }, grey(0.9));
  } else if (shape === 'sloped' || shape === 'casemate') {
    // Sides leaning in; a casemate's front plate laid back steeply.
    const lean = (t.slope ?? 0.15) * w;
    const front = shape === 'casemate' ? Math.min(l * 0.45, h * 1.1) : Math.min(l * 0.2, h * 0.45);
    const rear = shape === 'casemate' ? h * 0.25 : h * 0.2;
    const x0 = x - l / 2;
    const x1 = x + l / 2;
    const y0 = s - w / 2;
    const y1 = s + w / 2;
    const bottom: Vec3[] = [[x0, y0, base], [x1, y0, base], [x1, y1, base], [x0, y1, base]];
    const top: Vec3[] = [[x0 + rear, y0 + lean, base + h], [x1 - front, y0 + lean, base + h], [x1 - front, y1 - lean, base + h], [x0 + rear, y1 - lean, base + h]];
    hexa(k.team, k.fr, bottom, top, grey(0.9), 1, grey(1));
  } else if (shape === 'open') {
    // Walls round an open top, a dark floor inside.
    const th = Math.min(0.08, w * 0.05);
    block(k.fixed, k.fr, [x, s, base + 0.03], l - 0.1, w - 0.1, 0.06, PAINT.dark);
    block(k.team, k.fr, [x + l / 2 - th / 2, s, base + h / 2], th, w, h, grey(0.9));
    block(k.team, k.fr, [x - l / 2 + th / 2, s, base + h * 0.4], th, w, h * 0.8, grey(0.85));
    for (const side of [-1, 1]) block(k.team, k.fr, [x, s + side * (w / 2 - th / 2), base + h * 0.45], l, th, h * 0.9, grey(0.88));
  } else if (shape === 'cylinder') {
    tube(k.team, k.fr, [x, s, base], [x, s, base + h], l / 2, w / 2, grey(0.88), 14);
  } else facetBody(k.team, k.fr, profileOutline(profile, w / 2, 12, s), grey(0.9), lean);
  if (spec.cupola && main) {
    // The commander's cupola: a low drum on the roof, its hatch a shallow dome, the vision blocks round its rim dark.
    const cx = x - l * 0.15;
    const cs = s + w * 0.22;
    const roof = t.outline ? base + lerpPoly(t.outline.top, cx - x) - 0.04 : base + h - 0.04;
    const n = detail(12, 7);
    revolve(k.team, k.fr, [cx, cs, roof], [0, 0, 1], [[0, 0], [0, 0.34], [0.12, 0.34], [0.16, 0.31], [0.2, 0.22], [0.22, 0]], n, grey(0.84), 35);
    revolve(k.fixed, k.fr, [cx, cs, roof + 0.07], [0, 0, 1], [[0, 0.345], [0.06, 0.345]], n, PAINT.dark);
  }
}

function gun(k: Kit, spec: GroundSpec, g: GunSpec, top: number, turrets: TurretSpec[]): void {
  const t = turrets[g.turret ?? 0];
  const base = t ? top + (t.up ?? 0) : top;
  const elev = g.elevation ?? 0.03;
  // Barrels a little thicker than true, or a 23 mm gun vanishes at any distance.
  const r = Math.max(0.065, g.calibre * 0.75);
  const ce = Math.cos(elev);
  const se = Math.sin(elev);
  const count = Math.max(1, g.count ?? 1);
  const spread = g.spread ?? r * 3;
  const prof = barrelProfile(g, r);
  const n = detail(r < 0.08 ? 8 : 11, 6);
  const end = prof[prof.length - 1][0];
  const barrel = (x: number, side: number, up: number) => {
    const d: Vec3 = [ce, 0, se];
    revolve(k.fixed, k.fr, [x, side, up], d, prof, n, PAINT.metal, 30);
    // The bore's dark end, just inside the muzzle.
    revolve(k.fixed, k.fr, [x, side, up], d, [[end + 0.004, 0], [end + 0.004, r * 0.58]], n, PAINT.dark);
  };
  if (g.mount === 'turret' && t) {
    const up = base + t.height * (g.at ?? 0.48);
    // A casemate's gun comes through its sloped front plate, partway up.
    const x = t.gunX !== undefined ? t.x + t.gunX : t.shape === 'casemate' ? t.x + t.length / 2 - Math.min(t.length * 0.45, t.height * 1.1) * (g.at ?? 0.48) - 0.1 : t.x + t.length / 2 - 0.1;
    if (!t.outline) {
      // A rounded mantlet lying across the turret front, the gun coming out of it.
      const mr = Math.min(t.height * 0.32, 0.3);
      const mw = Math.min(t.width * 0.42, 0.75);
      revolve(k.team, k.fr, [x - mr * 0.3, (t.side ?? 0) - mw / 2, up], [0, 1, 0], [[0, 0], [0, mr * 0.8], [0.05, mr], [mw - 0.05, mr], [mw, mr * 0.8], [mw, 0]], detail(10, 6), grey(0.84));
    }
    for (let i = 0; i < count; i++) {
      const off = (i - (count - 1) / 2) * spread;
      // Pairs above and below for four barrels (2 x 2), side by side otherwise.
      if (count === 4) barrel(x, (t.side ?? 0) + (i % 2 ? 1 : -1) * spread * 0.6, up + (i < 2 ? 1 : -1) * spread * 0.45);
      else barrel(x, (t.side ?? 0) + off, up);
    }
  } else if (g.mount === 'turret-side' && t) {
    const up = base + t.height * (g.at ?? 0.55);
    for (const side of [-1, 1]) {
      const s = (t.side ?? 0) + side * (t.width / 2 + r + 0.12);
      block(k.team, k.fr, [t.x + t.length * 0.1, s, up], t.length * 0.55, r * 4 + 0.1, r * 4 + 0.15, grey(0.72));
      for (let i = 0; i < count; i++) barrel(t.x + t.length * 0.35, s + (i - (count - 1) / 2) * spread, up);
    }
  } else if (g.mount === 'hull') {
    const up = spec.hullHeight * (g.at ?? 0.72);
    const x = g.x ?? spec.length / 2 - spec.length * 0.12;
    // A towed gun's cradle and breech, which the barrel comes out of.
    if (spec.chassis === 'towed' || spec.chassis === 'pedestal') block(k.team, k.fr, [x, g.side ?? 0, up], 0.9, Math.max(0.35, spread * (count - 1) + 0.35), 0.4, grey(0.72));
    for (let i = 0; i < count; i++) barrel(x, (g.side ?? 0) + (i - (count - 1) / 2) * spread, up);
  } else if (g.mount === 'sponson') {
    // A half-round sponson on the hull side, its gun forward.
    const up = spec.hullHeight * (g.at ?? 0.6);
    const x = g.x ?? spec.length * 0.12;
    const off = Math.abs(g.side ?? spec.width / 2);
    const sides = g.both ? [-1, 1] : [Math.sign(g.side ?? 1) || 1];
    const size = Math.max(0.45, Math.min(0.9, spec.hullHeight * 0.3));
    for (const sd of sides) {
      blob(k.team, k.fr, [x, sd * off, up], [size, size * 0.7, size * 0.8], grey(0.86));
      for (let i = 0; i < count; i++) barrel(x + size * 0.5, sd * (off + size * 0.15) + (i - (count - 1) / 2) * spread, up);
    }
  } else {
    const x = t ? t.x : 0;
    const up = (t ? base + t.height : base) + 0.25;
    tube(k.fixed, k.fr, [x, g.side ?? 0.25, up], [x + g.length, g.side ?? 0.25, up], r, r, PAINT.dark, 5);
  }
}

/**
 * A gun barrel's profile as (distance from the breech at the mantlet, radius): the boot where it leaves the turret,
 * a gentle taper to the muzzle, the thermal sleeve's step, the fume extractor's smooth bulge, the muzzle brake, and
 * the bore going in at the end (its bottom dark, drawn by the caller just past where the profile ends).
 */
function barrelProfile(g: GunSpec, r: number): P2[] {
  const L = g.length;
  const base = (d: number) => r * (1.1 - (0.2 * d) / L);
  const S = g.sleeve ? g.sleeve * L : -1;
  const E = g.extractor !== undefined ? g.extractor * L : NaN;
  const hl = Math.min(0.45, Math.max(0.18, L * 0.05));
  const R = (d: number) => {
    let v = base(d);
    if (d <= S) v = Math.max(v, r * 1.3);
    const q = (d - E) / hl;
    if (Math.abs(q) < 1) v = Math.max(v, base(E) * (1 + 0.42 * Math.sqrt(1 - q * q)));
    return v;
  };
  // A muzzle brake ends 2 % past the barrel's length, as the spec's gun length has always been read.
  const brake = g.muzzle ? Math.min(0.5, Math.max(0.2, L * 0.06)) : 0;
  const tip = g.muzzle ? L * 1.02 : L;
  const from = Math.min(0.15, L * 0.1);
  const knots = new Set<number>([from, tip - brake - 1e-3]);
  if (S > 0) for (const d of [S - 0.01, S + 0.01]) knots.add(d);
  if (!Number.isNaN(E)) for (const q of [-1, -0.55, 0.55, 1]) knots.add(E + q * hl);
  const ds = [...knots].filter((d) => d >= from && d <= tip - brake).sort((a, b) => a - b);
  const p: P2[] = [[-0.2, 0], [-0.2, r * 1.9]];
  for (const d of ds) p.push([d, R(d)]);
  const lip = g.muzzle ? r * 1.55 : base(L) * 1.06;
  if (g.muzzle) p.push([tip - brake, lip], [tip - 0.02, lip]);
  p.push([tip, lip * 0.92], [tip, r * 0.58], [tip - 0.08, 0]);
  return p;
}

function missiles(k: Kit, spec: GroundSpec, m: MissileSpec, base: number): void {
  const t = spec.turret;
  const tBase = t ? base + (t.up ?? 0) : base;
  const elev = m.elevation ?? 0.18;
  const ce = Math.cos(elev);
  const se = Math.sin(elev);
  const d = m.diameter;
  const pack = (cx: number, cs: number, cu: number) => {
    if (m.pod) {
      // One closed pod round the tubes, their mouths dark at the front.
      const pw = m.cols * d * 1.15 + 0.12;
      const ph = m.rows * d * 1.15 + 0.12;
      tiltBox(k.team, k.fr, [cx, cs, cu], m.length, pw, ph, elev, grey(0.7));
      tiltBox(k.fixed, k.fr, [cx + (m.length / 2) * ce, cs, cu + (m.length / 2) * se], 0.05, pw * 0.88, ph * 0.88, elev, PAINT.dark);
      return;
    }
    for (let r = 0; r < m.rows; r++) {
      for (let c = 0; c < m.cols; c++) {
        const s = cs + (c - (m.cols - 1) / 2) * d * (m.rail ? 1.6 : 1.15);
        const u = cu + (r - (m.rows - 1) / 2) * d * (m.rail ? 1.9 : 1.15);
        const a: [number, number, number] = [cx - (m.length / 2) * ce, s, u - (m.length / 2) * se];
        const b: [number, number, number] = [cx + (m.length / 2) * ce, s, u + (m.length / 2) * se];
        if (m.boxes) tube(k.team, k.fr, a, b, d * 0.62, d * 0.62, grey(0.66), 4);
        else if (m.rail) {
          // A bare missile with a pointed nose, its rail under it.
          const nose: [number, number, number] = [b[0] + d * 1.2 * ce, s, b[2] + d * 1.2 * se];
          tube(k.fixed, k.fr, a, b, d / 2, d / 2, PAINT.light, 8);
          tube(k.fixed, k.fr, b, nose, d / 2, 0, PAINT.light, 8);
          tiltBox(k.fixed, k.fr, [cx + se * d * 0.75, s, u - ce * d * 0.75], m.length * 0.8, 0.12, 0.14, elev, PAINT.dark);
          // Its cross of tail fins and a smaller one forward.
          for (const [at, span, chord] of [[0.06, d * 3.2, 0.12], [0.55, d * 1.9, 0.08]]) {
            const fx = cx + (at * m.length - m.length / 2) * ce;
            const fu = u + (at * m.length - m.length / 2) * se;
            tiltBox(k.fixed, k.fr, [fx, s, fu], chord * m.length, span, 0.03, elev, PAINT.light);
            tiltBox(k.fixed, k.fr, [fx, s, fu], chord * m.length, 0.03, span, elev, PAINT.light);
          }
        } else tube(k.fixed, k.fr, a, b, d / 2, d / 2, PAINT.light, 8);
      }
    }
  };
  if (m.mount === 'turret-side' && t) {
    const up = tBase + (m.up ?? t.height * 0.7);
    const span = (m.cols * d * 1.15) / 2 + 0.1;
    for (const side of [-1, 1]) pack(t.x + (m.x ?? 0), (t.side ?? 0) + side * (t.width / 2 + span), up);
  } else if (m.mount === 'turret-top' && t) {
    pack(t.x + (m.x ?? 0), t.side ?? 0, tBase + t.height + (m.up ?? (m.rows * d * 1.15) / 2 + 0.1));
  } else if (m.mount === 'turret-front' && t) {
    pack(t.x + t.length / 2 + (m.x ?? 0), t.side ?? 0, tBase + (m.up ?? t.height * 0.5));
  } else {
    pack(m.x ?? -spec.length * 0.15, m.side ?? 0, base + (m.up ?? (m.rows * d * 1.15) / 2 + 0.15));
  }
}

function radar(k: Kit, r: RadarSpec, mx: number, top: number, side: number): void {
  const x = mx + r.x;
  const s = side + (r.side ?? 0);
  const up = top + r.up;
  const mast = r.mast ?? (r.up > 0.25 ? 'pole' : 'none');
  const ph = r.height ?? r.size * 0.35;
  // What holds the antenna up: a pole, or a lattice tower of four legs.
  if (mast === 'pole') tube(k.fixed, k.fr, [x, s, top], [x, s, up - r.size * 0.1], 0.06, 0.05, PAINT.metal, 6);
  else if (mast === 'tower') {
    const foot = Math.min(2.2, 0.4 + r.up * 0.1);
    const head = 0.35;
    const peak = up - ph / 2 - 0.1;
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) tube(k.fixed, k.fr, [x + a * foot, s + b * foot, top], [x + a * head, s + b * head, peak], 0.07, 0.05, PAINT.metal, 4);
    for (const f of [0.3, 0.6]) {
      const h = top + (peak - top) * f;
      const sp = foot + (head - foot) * f;
      block(k.fixed, k.fr, [x, s, h], sp * 2, sp * 2, 0.08, PAINT.metal);
    }
    block(k.fixed, k.fr, [x, s, peak], 1.0, 1.0, 0.2, PAINT.metal);
  }
  const dir = r.back ? -1 : 1;
  const tilt = (r.tilt ?? 0) * dir;
  switch (r.kind) {
    case 'dish': {
      // A shallow dish facing along `dir`, tilted up a little.
      const kfr = { ...k.fr, o: [x, 0, 0] as [number, number, number] };
      const rr = r.size / 2;
      blob(k.fixed, kfr, [0, s, up], [rr * 0.22, rr, rr], PAINT.light, 1, 4, 14);
      tube(k.fixed, k.fr, [x, s, up], [x + dir * rr * 0.7, s, up], 0.025, 0.02, PAINT.dark, 4);
      break;
    }
    case 'panel':
      if (r.tilt || r.depth) tiltBox(k.fixed, k.fr, [x, s, up], r.depth ?? 0.16, r.size, ph, tilt, PAINT.light);
      else fin(k.fixed, k.fr, [[x - 0.08, up - ph / 2], [x + 0.08, up - ph / 2], [x + 0.08, up + ph / 2], [x - 0.08, up + ph / 2]], s, r.size, PAINT.light);
      break;
    case 'peel': {
      // A wide reflector curved round toward its face: three panels, the outer ones turned in.
      const third = r.size / 3;
      const a = 0.42;
      tiltBox(k.fixed, k.fr, [x, s, up], 0.12, third, ph, tilt, PAINT.light);
      for (const sd of [-1, 1]) {
        tiltBox(k.fixed, k.fr, [x + dir * (third / 2) * Math.sin(a), s + sd * (third / 2) * (1 + Math.cos(a)), up], 0.12, third, ph, tilt, PAINT.light, 1, -dir * sd * a);
      }
      tube(k.fixed, k.fr, [x, s, up - ph * 0.3], [x + dir * r.size * 0.3, s, up], 0.05, 0.04, PAINT.dark, 4);
      break;
    }
    case 'grid': {
      // An open lattice: a frame and its uprights.
      const bar = 0.07;
      for (const u of [up - ph / 2, up + ph / 2, up]) block(k.fixed, k.fr, [x, s, u], bar, r.size, bar, PAINT.light);
      const n = Math.max(3, Math.round(r.size / 1.2));
      for (let i = 0; i < n; i++) block(k.fixed, k.fr, [x, s - r.size / 2 + (r.size * i) / (n - 1), up], bar, bar, ph, PAINT.light);
      break;
    }
    case 'bar':
      block(k.fixed, k.fr, [x, s, up], 0.18, r.size, 0.18, PAINT.light);
      break;
    case 'dome':
      blob(k.fixed, k.fr, [x, s, up], [r.size / 2, r.size / 2, r.size * 0.4], PAINT.light);
      break;
    case 'drum':
      tube(k.fixed, k.fr, [x, s, up - r.size * 0.3], [x, s, up + r.size * 0.3], r.size / 2, r.size / 2, PAINT.light, 12);
      break;
  }
}
