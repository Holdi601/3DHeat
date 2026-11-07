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

import { finish, newKit, PAINT, type Kit, type Template } from './kit';
import { blob, block, fin, hexa, outlineBody, plate, prism, tiltBox, tube, type Outline, type P2 } from './parts';
import { disc, wheel } from '../race/shapes';
import type { Rgb, Vec3 } from '../race/geometry';

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
  /** For 'sloped' and 'casemate': how far the sides lean in, as a share of the width (default 0.15). */
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
  cab?: { length: number; height: number; glass?: boolean; bonnet?: number };
  /** What a truck carries behind the cab. */
  bed?: 'flat' | 'covered' | 'box' | 'tank';
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
}

/**
 * A part added to a vehicle: a block, a block pitched on a sloped plate, a
 * rounded lump, an upright drum, or an outline body. On the turret its
 * position is forward from the main turret's centre and up from its base; on
 * the hull, forward from the middle and up from the ground.
 */
export interface AddOn {
  on: 'turret' | 'hull';
  kind: 'box' | 'blob' | 'drum' | 'body';
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
}

const grey = (k: number): Rgb => [k, k, k];

export function buildGround(spec: GroundSpec): Template {
  const k = newKit();
  const L = spec.length;
  const W = spec.width;
  const H = spec.hullHeight;
  const chassis = spec.chassis;
  if (chassis === 'tracked' || chassis === 'halftrack') tracks(k, spec);
  if (chassis === 'wheeled' || chassis === 'towed' || chassis === 'halftrack' || chassis === 'trailer') wheels(k, spec);
  if (chassis === 'rail') bogies(k, spec);
  if (chassis === 'tracked' || chassis === 'wheeled' || chassis === 'halftrack' || chassis === 'rail' || chassis === 'hover') hull(k, spec);
  if (chassis === 'hover') blob(k.fixed, k.fr, [0, 0, 0.45], [L * 0.48, W * 0.48, 0.32], PAINT.dark);
  if (chassis === 'towed') carriage(k, spec);
  if (chassis === 'trailer') trailerBed(k, spec);
  if (chassis === 'pedestal') pedestal(k, spec);
  if (chassis === 'static') block(k.team, k.fr, [0, 0, H / 2], L, W, H, grey(0.8));
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

/** Draws an add-on about its origin (the main turret's centre and base, or the hull's middle on the ground). */
function addOn(k: Kit, a: AddOn, o: Vec3): void {
  const buf = a.metal ? k.fixed : k.team;
  const col = a.metal ? PAINT.metal : grey(0.86);
  for (const sd of a.mirror ? [1, -1] : [1]) {
    const c: Vec3 = [o[0] + a.at[0], o[1] + a.at[1] * sd, o[2] + a.at[2]];
    const [l, w, h] = a.size;
    if (a.kind === 'box') tiltBox(buf, k.fr, c, l, w, h, a.pitch ?? 0, col, 1, (a.yaw ?? 0) * sd);
    else if (a.kind === 'blob') blob(buf, k.fr, c, [l / 2, w / 2, h / 2], col);
    else if (a.kind === 'drum') tube(buf, k.fr, [c[0], c[1], c[2] - h / 2], [c[0], c[1], c[2] + h / 2], l / 2, w / 2, col, 12);
    else if (a.outline) {
      const ol = a.outline;
      const mv = (p: P2[], u: number): P2[] => p.map(([f, v]) => [c[0] + f, u + v]);
      outlineBody(buf, k.fr, { ...ol, top: mv(ol.top, c[2]), bottom: mv(ol.bottom, c[2]), plan: ol.plan.map(([f, v]) => [c[0] + f, v]), round: Array.isArray(ol.round) ? ol.round.map(([f, r]) => [c[0] + f, r]) : ol.round, side: c[1] }, col, 12);
    }
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
  const n = Math.max(3, spec.roadWheels ?? Math.round(L / 1.0));
  const r = spec.roadWheelRadius ?? (rhomboid ? 0.25 : Math.min(0.42, (L - 0.9) / n / 2.1, th * 0.38));
  if (spec.running && !rhomboid) {
    openRunning(k, spec, profile, th, tw);
    return;
  }
  for (const side of [-1, 1]) {
    const outer = side * (spec.width / 2);
    const inner = side * (spec.width / 2 - tw);
    prism(k.fixed, k.fr, profile, Math.min(inner, outer), Math.max(inner, outer), PAINT.track);
    if (rhomboid) {
      // The track frame's side plate, inside the run of the track.
      const inset: P2[] = profile.map(([x, u]) => [x0 + (x - x0) * 0.9, th * 0.08 + u * 0.82]);
      prism(k.team, k.fr, inset, outer - side * 0.02, outer + side * 0.03, grey(0.8));
      continue;
    }
    // Road wheels on the outside, evenly along the run.
    for (let i = 0; i < n; i++) {
      const x = x0 - half + 0.45 + r + ((L - 0.9 - 2 * r) * i) / Math.max(1, n - 1);
      const kfr = { ...k.fr, o: [x, 0, 0] as [number, number, number] };
      disc(k.fixed, kfr, outer + side * 0.012, r + 0.06, r, PAINT.metal, 10);
    }
    if (spec.skirts) prism(k.team, k.fr, spec.skirt ?? [[x0 - half + 0.2, th * 0.45], [x0 + half - 0.4, th * 0.45], [x0 + half - 0.4, th * 0.95], [x0 - half + 0.2, th * 0.95]], outer - side * 0.02, outer + side * 0.03, grey(0.78));
  }
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

/** The track as a band round its run, with the wheels inside it standing out solid: see `GroundSpec.running`. */
function openRunning(k: Kit, spec: GroundSpec, profile: P2[], th: number, tw: number): void {
  const run = spec.running!;
  const band = run.band ?? 0.1;
  const inner = insetPolygon(profile, band);
  const r = spec.roadWheelRadius ?? Math.min(0.42, th * 0.38);
  const xs = profile.map((p) => p[0]);
  const xf = Math.max(...xs);
  const xb = Math.min(...xs);
  // Sprocket and idler: wheels filling each end of the run, at the height of its furthest point.
  const end = (x: number): [number, number] => {
    const pts = profile.filter((p) => Math.abs(p[0] - x) < 1e-6);
    const u = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const re = Math.max(0.18, Math.min(0.4, th * 0.3));
    return [re, Math.max(re + band * 0.5, Math.min(th - re - band * 0.5, u))];
  };
  const [rf, uf] = end(xf);
  const [rb, ub] = end(xb);
  const rr = run.rollerRadius ?? Math.max(0.09, r * 0.35);
  for (const side of [-1, 1]) {
    const o = side * (spec.width / 2);
    const i = side * (spec.width / 2 - tw);
    const s0 = Math.min(o, i);
    const s1 = Math.max(o, i);
    for (let a = 0; a < profile.length; a++) {
      const b = (a + 1) % profile.length;
      prism(k.fixed, k.fr, [profile[a], profile[b], inner[b], inner[a]], s0, s1, PAINT.track);
    }
    const wheelAt = (x: number, u: number, radius: number, col: Rgb) => tube(k.fixed, k.fr, [x, s0 + 0.03, u], [x, s1 - 0.03, u], radius, radius, col, 14);
    for (const x of run.wheels) wheelAt(x, r + band, r, PAINT.metal);
    wheelAt(xf - rf - band * 0.3, uf, rf, PAINT.dark);
    wheelAt(xb + rb + band * 0.3, ub, rb, PAINT.dark);
    for (const x of run.rollers ?? []) wheelAt(x, th - band - rr, rr, PAINT.dark);
    if (spec.skirts) prism(k.team, k.fr, spec.skirt ?? [[xb + 0.2, th * 0.45], [xf - 0.4, th * 0.45], [xf - 0.4, th * 0.95], [xb + 0.2, th * 0.95]], o - side * 0.02, o + side * 0.03, grey(0.78));
  }
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
      const kfr = { ...k.fr, o: [x, 0, 0] as [number, number, number] };
      wheel(k.fixed, kfr, side * (spec.width / 2 - w / 2), r, r, w, PAINT.tyre, PAINT.metal, side, 12);
    }
  }
}

/** Two bogies of two axles each under a rail vehicle, and the frame between them. */
function bogies(k: Kit, spec: GroundSpec): void {
  const half = spec.length / 2;
  const r = spec.wheelRadius ?? 0.46;
  const gauge = Math.min(spec.width / 2 - 0.25, 0.76);
  const centres = spec.length > 9 ? [half - 2.4, -half + 2.4] : [half * 0.5, -half * 0.5];
  for (const c of centres) {
    const axles = spec.length > 9 ? [c + 0.9, c - 0.9] : [c];
    for (const x of axles) {
      for (const side of [-1, 1]) {
        const kfr = { ...k.fr, o: [x, 0, 0] as [number, number, number] };
        wheel(k.fixed, kfr, side * gauge, r, r, 0.14, PAINT.metal, PAINT.dark, side, 10);
      }
    }
    block(k.fixed, k.fr, [c, 0, r + 0.1], spec.length > 9 ? 3.0 : 1.2, gauge * 2 + 0.3, 0.35, PAINT.dark);
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
    prism(k.team, k.fr, lowerProfile, -(spec.width / 2 - tw), spec.width / 2 - tw, grey(0.7));
    if (spec.hullOutline) outlineBody(k.team, k.fr, spec.hullOutline, grey(0.86), 16, 1, grey(0.97));
    else {
      const upper = profile.map(([x, u]) => [x, Math.max(u, fender)] as P2);
      prism(k.team, k.fr, dedupe(upper), -w, w, grey(0.86), 1, grey(0.97));
    }
  } else if (spec.hullOutline) outlineBody(k.team, k.fr, spec.hullOutline, grey(0.86), 16, 1, grey(0.97));
  else prism(k.team, k.fr, profile, -w, w, grey(0.86), 1, grey(0.97));
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
  if (bonnet > 0) {
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
  if (bed === 'covered' || bed === 'box') block(k.team, k.fr, [(bx0 + bx1) / 2, 0, (floor + spec.hullHeight) / 2], bx1 - bx0, spec.width - 0.1, spec.hullHeight - floor, grey(bed === 'covered' ? 0.62 : 0.8));
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
  if (t.outline) outlineBody(k.team, k.fr, { ...t.outline, top: t.outline.top.map(([f, u]) => [x + f, base + u]), bottom: t.outline.bottom.map(([f, u]) => [x + f, base + u]), plan: t.outline.plan.map(([f, w2]) => [x + f, w2]), round: Array.isArray(t.outline.round) ? t.outline.round.map(([f, r]) => [x + f, r]) : t.outline.round, side: s }, grey(0.92), 18, 1, grey(1));
  else if (shape === 'cast' || shape === 'round') {
    blob(k.team, k.fr, [x, s, base + h * 0.42], [l / 2, w / 2, h * (shape === 'round' ? 0.62 : 0.55)], grey(0.92));
    block(k.team, k.fr, [x, s, base + h * 0.12], l * 0.8, w * 0.85, h * 0.25, grey(0.85));
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
  } else prism(k.team, k.fr, profile, s - w / 2, s + w / 2, grey(0.92), 1, grey(1));
  if (spec.cupola && t === spec.turret) blob(k.team, k.fr, [x - l * 0.15, s + w * 0.22, base + h + 0.08], [0.32, 0.32, 0.14], grey(0.7));
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
  const barrel = (x: number, side: number, up: number) => {
    const p = (f: number): [number, number, number] => [x + g.length * f * ce, side, up + g.length * f * se];
    tube(k.fixed, k.fr, p(0), p(1), r, r * 0.85, PAINT.metal, 8);
    if (g.sleeve) tube(k.fixed, k.fr, p(0), p(g.sleeve), r * 1.35, r * 1.25, PAINT.metal, 8);
    if (g.extractor !== undefined) tube(k.fixed, k.fr, p(g.extractor - 0.06), p(g.extractor + 0.06), r * 1.25, r * 1.25, PAINT.metal, 8);
    if (g.muzzle) tube(k.fixed, k.fr, p(0.97), p(1.02), r * 1.5, r * 1.5, PAINT.metal, 8);
  };
  if (g.mount === 'turret' && t) {
    const up = base + t.height * (g.at ?? 0.48);
    // A casemate's gun comes through its sloped front plate, partway up.
    const x = t.gunX !== undefined ? t.x + t.gunX : t.shape === 'casemate' ? t.x + t.length / 2 - Math.min(t.length * 0.45, t.height * 1.1) * (g.at ?? 0.48) - 0.1 : t.x + t.length / 2 - 0.1;
    if (!t.outline) block(k.team, k.fr, [x, t.side ?? 0, up], 0.35, Math.min(t.width * 0.4, 0.7), Math.min(t.height * 0.6, 0.55), grey(0.7));
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
