/**
 * Second World War armour by variant: tanks, tank destroyers and assault guns
 * whose silhouettes differ (turret, mantlet, hull front, cupola, road wheels,
 * gun) as figures of their own.
 *
 * Each is built from its outlines: the upper hull's side profile and plan,
 * the turret's, the track run with the road wheels where they sit (the track
 * drawn as a band, so light shows between the wheels as it does on the real
 * vehicle), and the parts that tell a variant apart - a drum or a low cupola,
 * a mantlet with or without its chin, skirts, a stowage bin, external fuel
 * tanks, exhausts.
 *
 * Overall sizes are published values: hull length without the gun, width,
 * height to the turret roof or cupola, and length with the gun, which sets how
 * far the gun reaches. The outlines, wheel spacing and part sizes are judged
 * from the general shape of the real vehicle (estimates, not traced from any
 * drawing or game model). Coordinates: forward from the hull's middle, out
 * from the centre line, up from the ground; turret outlines from the turret's
 * centre and base.
 */

import type { Named, SpecSet } from './index';
import type { GroundSpec, GunSpec, TurretSpec } from '../ground';
import { lerpPoly, type P2 } from '../parts';

const G: Named<GroundSpec> = {};

// ---------------------------------------------------------------- helpers

/** `n` wheel centres evenly from `a` to `b`. */
const even = (n: number, a: number, b: number): number[] => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
/** Wheels in pairs (bogies) round each centre, `gap` apart. */
const pairs = (centres: number[], gap: number): number[] => centres.flatMap((c) => [c + gap / 2, c - gap / 2]);
/** A round plan of radius `r` round `x`, as half-widths along x. */
const circle = (x: number, r: number): P2[] => [[x - r, 0.02], [x - r * 0.7, r * 0.71], [x, r], [x + r * 0.7, r * 0.71], [x + r, 0.02]];

function size(plan: P2[], top: P2[], bottom: P2[]): { length: number; width: number; height: number } {
  const xs = plan.map((p) => p[0]);
  return { length: Math.max(...xs) - Math.min(...xs), width: 2 * Math.max(...plan.map((p) => p[1])), height: Math.max(...top.map((p) => p[1])) - Math.min(...bottom.map((p) => p[1])) };
}

/** The main turret from its plan (back to front, half-widths) and height profile, standing on the deck. */
function turret(x: number, plan: P2[], top: P2[], round: number, gunX: number, side = 0): TurretSpec {
  const xs = plan.map((p) => p[0]);
  const bottom: P2[] = [[Math.min(...xs), 0], [Math.max(...xs), 0]];
  return { x, side, gunX, ...size(plan, top, bottom), outline: { plan, top, bottom, round, stations: 14 } };
}

/** A part placed in the vehicle's own frame (forward from the middle, up from the ground): a nose between the tracks, skirts, fuel tanks, exhausts. */
function part(deck: number, plan: P2[], top: P2[], bottom: P2[] | number, round = 8, side = 0): TurretSpec {
  const xs = plan.map((p) => p[0]);
  const b: P2[] = typeof bottom === 'number' ? [[Math.min(...xs), bottom], [Math.max(...xs), bottom]] : bottom;
  return { x: 0, up: -deck, side, ...size(plan, top, b), outline: { plan, top, bottom: b, round, stations: 6 } };
}

/** A part on a turret, in the turret's frame (forward from its centre, up from its base): mantlets, cupolas, bins, skirts. */
function on(t: TurretSpec, plan: P2[], top: P2[], bottom: P2[] | number, round = 8, side = 0): TurretSpec {
  const xs = plan.map((p) => p[0]);
  const b: P2[] = typeof bottom === 'number' ? [[Math.min(...xs), bottom], [Math.max(...xs), bottom]] : bottom;
  return { x: t.x, up: t.up ?? 0, side: (t.side ?? 0) + side, ...size(plan, top, b), outline: { plan, top, bottom: b, round, stations: 6 } };
}

/** A commander's cupola on the turret roof at `dx` forward and `side` across: a tall drum with vision slits, or a low cast one with periscopes. */
function cupola(t: TurretSpec, dx: number, side: number, r: number, h: number): TurretSpec {
  const roof = lerpPoly(t.outline!.top, dx) - 0.03;
  return on(t, circle(dx, r), [[dx - r, roof + h], [dx + r, roof + h]], roof, 8, side);
}

/** Thin side plates (skirts, Schürzen) at `out` either side of the centre line, from x0 to x1 and between two heights. */
function skirtPair(deck: number, x0: number, x1: number, out: number, lo: number, hi: number): TurretSpec[] {
  return [-1, 1].map((s) => part(deck, [[x0, 0.025], [x1, 0.025]], [[x0, hi], [x1, hi]], lo, 16, s * out));
}

/** A cylinder lying along x at `side`, from x0 to x1, centred at height `u`: fuel drums, mufflers. */
const drumX = (deck: number, x0: number, x1: number, side: number, u: number, r: number): TurretSpec => part(deck, [[x0, r * 0.7], [x0 + 0.05, r], [x1 - 0.05, r], [x1, r * 0.7]], [[x0, u + r * 0.7], [x0 + 0.05, u + r], [x1 - 0.05, u + r], [x1, u + r * 0.7]], [[x0, u - r * 0.7], [x0 + 0.05, u - r], [x1 - 0.05, u - r], [x1, u - r * 0.7]], 2, side);
/** An upright pipe at (x, side) from height `lo` to `hi`: exhaust stacks. */
const pipe = (deck: number, x: number, side: number, r: number, lo: number, hi: number): TurretSpec => part(deck, circle(x, r), [[x - r, hi], [x + r, hi]], lo, 2, side);

interface Ww2 {
  cls: string;
  /** Hull length, width, deck height (where the turret stands), top of the track run (bottom of the upper hull over the tracks). */
  L: number;
  W: number;
  deck: number;
  fender: number;
  /** The upper hull's top seen from the side, back to front. */
  top: P2[];
  /** The upper hull's underside where it is not the fender line (a stepped sponson), back to front. */
  under?: P2[];
  /** Its half-width along the hull (default the full width). */
  plan?: P2[];
  hullRound?: number;
  track: P2[];
  wheels: number[];
  r: number;
  rollers?: number[];
  /** Tracks drawn solid (a Churchill's, run round a closed pannier). */
  solid?: boolean;
  turret?: TurretSpec;
  gun?: Partial<GunSpec> & { length: number; calibre: number };
  guns?: GunSpec[];
  parts?: TurretSpec[];
  /** Parts built on the turret once it is known. */
  turretParts?: (t: TurretSpec) => TurretSpec[];
}

function ww2(v: Ww2): GroundSpec & { cls: string } {
  const h = v.L / 2;
  const tw = Math.max(0.3, v.W * 0.17);
  // The turret's parts first, so a gun can name its mount by index (1 = the first of them).
  const parts = [...(v.turret && v.turretParts ? v.turretParts(v.turret) : []), ...(v.parts ?? [])];
  const o = v.turret?.outline;
  if (v.turret && o && (v.turret.up ?? 0) === 0 && typeof o.round === 'number' && o.round < 5) {
    // A rounded cast turret narrows to its base; the ring it sits on fills under it, as on the real tank.
    parts.push(on(v.turret, o.plan.map(([x, w]) => [x * 0.9, w * 0.88] as P2), [[o.plan[0][0] * 0.9, 0.22], [o.plan[o.plan.length - 1][0] * 0.9, 0.22]], -0.05, 12));
  }
  if (!v.solid) {
    // The lower hull between the tracks, from the belly up to the upper hull and under the glacis where it runs
    // lower: seen from the side it closes the space behind the wheels, as the real hull side does.
    const inner = v.W / 2 - tw - 0.02;
    const x0 = -h + 0.15;
    const x1 = h - 0.05;
    const xs = [x0, ...v.top.map((p) => p[0]).filter((x) => x > x0 && x < x1), x1];
    const top: P2[] = xs.map((x) => [x, Math.max(0.5, Math.min(v.fender + 0.05, lerpPoly(v.top, x)))]);
    parts.push(part(v.deck, [[x0, inner], [x1, inner]], top, [[x0, 0.6], [x0 + 0.35, 0.42], [x1 - 0.5, 0.42], [x1, Math.max(0.45, top[top.length - 1][1] - 0.12)]], 14));
  }
  const guns: GunSpec[] = v.guns ?? (v.gun ? [{ mount: 'turret', at: 0.45, ...v.gun }] : []);
  return {
    cls: v.cls,
    chassis: 'tracked',
    length: v.L,
    width: v.W,
    hullHeight: v.deck,
    roadWheels: v.wheels.length,
    // Solid tracks hide their wheels; the builder's own discs are kept out of sight.
    roadWheelRadius: v.solid ? 0.01 : v.r,
    trackProfile: v.track,
    running: v.solid ? undefined : { wheels: v.wheels, rollers: v.rollers },
    hullOutline: { top: v.top, bottom: v.under ?? [[-h, v.fender], [h, v.fender]], plan: v.plan ?? [[-h, v.W / 2 - 0.03], [h, v.W / 2 - 0.03]], round: v.hullRound ?? 12, stations: 12 },
    turret: v.turret,
    turrets: parts,
    guns,
  };
}

// ---------------------------------------------------------------- Tiger I

// Tiger I: a slab box - the superstructure overhanging the tracks, the near-upright driver's plate, flat deck and
// sides; eight interleaved 0.8 m wheel stations; the horseshoe turret with upright sides and the broad flat mantlet.
// Hull 6.32 x 3.56 m, 3.0 m high, 8.45 m with the 88 mm L/56.
const TIGER_T = turret(0.05, [[-1.55, 0.85], [-1.3, 1.25], [0.4, 1.4], [1.15, 1.36], [1.32, 1.2], [1.38, 0.95]], [[-1.55, 0.82], [1.38, 0.86]], 10, 1.55);
const TIGER: Ww2 = {
  cls: 'heavy-tank', L: 6.32, W: 3.56, deck: 1.92, fender: 1.0,
  top: [[-3.16, 1.85], [-3.12, 1.92], [2.5, 1.92], [2.56, 1.3], [3.0, 1.22], [3.16, 1.05]],
  plan: [[-3.16, 1.74], [3.16, 1.74]], hullRound: 16,
  track: [[-1.95, 0], [1.95, 0], [3.1, 0.68], [2.8, 1.0], [-2.85, 1.0], [-3.1, 0.6]],
  wheels: even(8, -1.85, 1.85), r: 0.4,
  turret: TIGER_T,
  gun: { length: 3.7, calibre: 0.088, muzzle: true, at: 0.5 },
  parts: [pipe(1.92, -3.27, -0.55, 0.1, 1.3, 2.05), pipe(1.92, -3.27, 0.55, 0.1, 1.3, 2.05)],
  turretParts: (t) => [on(t, [[1.38, 0.8], [1.6, 0.78]], [[1.38, 0.8], [1.6, 0.76]], [[1.38, 0.08], [1.6, 0.12]], 10)],
};
const tigerExtras = (t: TurretSpec, early: boolean): TurretSpec[] => [
  ...TIGER.turretParts!(t),
  // Early (H1): the tall drum cupola with vision slits; from mid-1943 the low cast cupola with periscopes.
  early ? cupola(t, -0.85, -0.5, 0.33, 0.3) : cupola(t, -0.85, -0.5, 0.36, 0.17),
];
// Mid production (summer 1943 on): the low cupola, no Feifel filters.
G['tiger-i'] = { ...ww2({ ...TIGER, turretParts: (t) => tigerExtras(t, false) }) };
// Early, Ausf. H1 (1942-43): the drum cupola, and the Feifel air filters on the rear plate with their pipes.
G['tiger-i-h1'] = ww2({
  ...TIGER,
  parts: [...TIGER.parts!, ...[-1, 1].map((s) => drumX(1.92, -3.44, -3.16, s * 0.95, 1.45, 0.17)), ...[-1, 1].map((s) => part(1.92, [[-3.2, 0.06], [-2.4, 0.06]], [[-3.2, 2.02], [-2.4, 2.02]], 1.92, 2, s * 0.95))],
  turretParts: (t) => tigerExtras(t, true),
});
// Late, Ausf. E (1944): the low cupola and spare track links hung on the turret sides, which widen it seen from the front and above.
G['tiger-i-e'] = ww2({ ...TIGER, turretParts: (t) => [...tigerExtras(t, false), ...[-1, 1].map((s) => on(t, [[-0.55, 0.05], [0.65, 0.05]], [[-0.55, 0.62], [0.65, 0.62]], 0.15, 16, s * 1.42))] });

// ---------------------------------------------------------------- Tiger II

// Tiger II: a long sloped glacis to a flat deck, nine interleaved wheel stations, the turret far back.
// Hull 7.38 x 3.755 m, 3.09 m high, 10.29 m with the 88 mm L/71.
const KT: Ww2 = {
  cls: 'heavy-tank', L: 7.38, W: 3.755, deck: 1.95, fender: 1.02,
  top: [[-3.69, 1.25], [-3.5, 1.95], [1.25, 1.95], [3.69, 0.98]],
  under: [[-3.69, 1.02], [3.3, 1.02], [3.69, 0.9]],
  plan: [[-3.69, 1.72], [3.2, 1.75], [3.69, 1.55]], hullRound: 8,
  track: [[-2.1, 0], [2.1, 0], [3.58, 0.72], [3.25, 1.02], [-3.3, 1.02], [-3.62, 0.62]],
  wheels: even(9, -2.05, 2.05), r: 0.4,
  gun: { length: 4.75, calibre: 0.088, muzzle: true, at: 0.42 },
  parts: [pipe(1.95, -3.78, -0.5, 0.11, 1.2, 2.1), pipe(1.95, -3.78, 0.5, 0.11, 1.2, 2.1)],
};
/** The small conical Saukopf mantlet. */
const saukopf = (t: TurretSpec, x0: number, x1: number, r0: number, r1: number, u: number): TurretSpec => on(t, [[x0, r0], [x1, r1]], [[x0, u + r0], [x1, u + r1]], [[x0, u - r0], [x1, u - r1]], 2.4);
// Henschel (production) turret: the flat, sloped front plate, straight sloped sides, the long overhanging bustle.
const KT_H = turret(-0.3, [[-2.4, 1.05], [-2.1, 1.38], [0.9, 1.4], [1.45, 1.12], [1.75, 0.78]], [[-2.4, 0.68], [-2.1, 0.82], [0.9, 0.86], [1.5, 0.72], [1.75, 0.62]], 10, 2.0);
G['tiger-ii'] = ww2({ ...KT, turret: KT_H, turretParts: (t) => [saukopf(t, 1.75, 2.05, 0.34, 0.2, 0.38), cupola(t, -1.0, -0.62, 0.35, 0.17)] });
G['tiger-ii-h'] = G['tiger-ii'];
// Porsche turret (the first 50): the curved front, the roof falling to it, and the bulge in the left side for the cupola.
const KT_P = turret(-0.25, [[-2.15, 1.0], [-1.85, 1.3], [0.4, 1.32], [1.1, 1.1], [1.5, 0.72], [1.68, 0.32]], [[-2.15, 0.7], [-1.8, 0.82], [0.3, 0.84], [1.05, 0.72], [1.45, 0.5], [1.68, 0.3]], 4, 1.75);
G['tiger-ii-p'] = ww2({
  ...KT,
  turret: KT_P,
  turretParts: (t) => [saukopf(t, 1.6, 1.92, 0.34, 0.2, 0.36), on(t, circle(-0.7, 0.42), [[-1.12, 0.62], [-0.28, 0.62]], 0.12, 3, -1.12), cupola(t, -0.7, -1.05, 0.33, 0.2)],
});

// ---------------------------------------------------------------- Panther

// Panther: a long sloped glacis, sloped hull sides and rear, eight interleaved 0.86 m wheel stations, the narrow turret
// tapering to its mantlet, the long 75 mm L/70. Hull 6.87 x 3.27 m (3.42 m with skirts), 2.99 m high, 8.66 m with the gun.
const PANTHER_T = turret(-0.2, [[-1.75, 0.9], [-1.55, 1.18], [0.6, 1.25], [1.3, 1.08], [1.42, 0.85]], [[-1.75, 0.6], [-1.5, 0.84], [0.8, 0.88], [1.42, 0.62]], 6, 1.65);
const PANTHER: Ww2 = {
  cls: 'medium-tank', L: 6.87, W: 3.27, deck: 1.9, fender: 1.05,
  top: [[-3.44, 1.35], [-3.12, 1.9], [1.5, 1.9], [3.44, 0.92]],
  plan: [[-3.44, 1.55], [3.2, 1.6], [3.44, 1.45]], hullRound: 6,
  track: [[-2.05, 0], [2.05, 0], [3.35, 0.7], [3.0, 1.05], [-3.0, 1.05], [-3.38, 0.62]],
  wheels: even(8, -1.95, 1.95), r: 0.43,
  turret: PANTHER_T,
  gun: { length: 3.78, calibre: 0.075, muzzle: true, at: 0.42 },
};
/** The rounded early mantlet, or the late G's with its chin reaching down to the roof. */
const pantherMantlet = (t: TurretSpec, chin: boolean): TurretSpec => on(t, [[1.38, 0.5], [1.55, 0.48], [1.68, 0.3]], [[1.38, 0.66], [1.55, 0.6], [1.68, 0.45]], chin ? [[1.38, -0.1], [1.6, -0.12], [1.68, 0.15]] : [[1.38, 0.02], [1.55, 0.08], [1.68, 0.2]], 3);
const pantherSkirts = skirtPair(1.9, -2.6, 2.4, 1.66, 0.62, 1.32);
const pantherExhaust = (r: number, lo: number): TurretSpec[] => [-1, 1].map((s) => pipe(1.9, -3.52, s * 0.45, r, lo, 2.0));
// Ausf. D (1943): the tall drum cupola, smoke dischargers on the turret sides, the early rounded mantlet, the upper hull's
// side stepped up behind the last wheel station.
G['panther-d'] = ww2({
  ...PANTHER,
  under: [[-3.44, 1.3], [-2.75, 1.3], [-2.6, 1.05], [3.44, 1.05]],
  parts: [...pantherSkirts, ...pantherExhaust(0.1, 1.0)],
  turretParts: (t) => [pantherMantlet(t, false), cupola(t, -0.95, -0.5, 0.33, 0.34), ...[-1, 1].map((s) => on(t, [[0.4, 0.09], [0.78, 0.09]], [[0.4, 0.62], [0.78, 0.62]], 0.38, 4, s * 1.3))],
});
// Ausf. A (late 1943-44): the low cast cupola with periscopes, a ball machine gun in the glacis, the same stepped hull.
G['panther-a'] = ww2({ ...PANTHER, under: G['panther-d'].hullOutline!.bottom, parts: [...pantherSkirts, ...pantherExhaust(0.1, 1.0)], turretParts: (t) => [pantherMantlet(t, false), cupola(t, -0.95, -0.5, 0.36, 0.17)] });
// Ausf. G (1944-45): the upper hull's side one straight plate, the chin mantlet, the low cupola, flame-damping mufflers on the exhausts.
G['panther-g'] = ww2({ ...PANTHER, parts: [...pantherSkirts, ...pantherExhaust(0.16, 1.35)], turretParts: (t) => [pantherMantlet(t, true), cupola(t, -0.95, -0.5, 0.36, 0.17)] });
G['panther'] = G['panther-g'];
// Ausf. F (1945, not fielded): the narrow Schmalturm with the rangefinder's blisters on its sides, a small conical
// mantlet and the L/70 without a muzzle brake, on the G's hull.
const SCHMALTURM = turret(-0.25, [[-1.75, 0.88], [-1.5, 1.1], [0.3, 1.12], [1.2, 0.68], [1.4, 0.5]], [[-1.75, 0.58], [-1.45, 0.8], [0.8, 0.82], [1.4, 0.55]], 8, 1.65);
G['panther-f'] = ww2({
  ...PANTHER,
  turret: SCHMALTURM,
  gun: { length: 3.78, calibre: 0.075, at: 0.42 },
  parts: [...pantherSkirts, ...pantherExhaust(0.16, 1.35)],
  turretParts: (t) => [saukopf(t, 1.38, 1.68, 0.32, 0.2, 0.36), cupola(t, -0.95, -0.5, 0.34, 0.15), ...[-1, 1].map((s) => on(t, [[0.4, 0.02], [0.62, 0.14], [0.84, 0.02]], [[0.4, 0.66], [0.84, 0.66]], 0.44, 2, s * 0.98))],
});

// ---------------------------------------------------------------- Panzer IV

// Pz.Kpfw. IV: the superstructure over the tracks with the upright driver's plate and a short glacis to the nose, eight
// small road wheels in four bogies with four return rollers, so light shows between the wheels and the top run; the
// box turret with sloped sides and the drum cupola at its back. Hull 5.92 x 2.88 m, 2.68 m high.
const PZ4_T = turret(0.1, [[-1.15, 0.7], [-1.0, 0.9], [0.75, 0.92], [0.95, 0.78]], [[-1.15, 0.62], [0.95, 0.66]], 10, 1.15);
const PZ4_F1_T = { ...PZ4_T, gunX: 0.97 };
const PZ4: Ww2 = {
  cls: 'medium-tank', L: 5.92, W: 2.88, deck: 1.68, fender: 0.95,
  top: [[-2.96, 1.4], [-2.88, 1.62], [-1.0, 1.62], [-0.95, 1.68], [1.95, 1.68], [1.98, 1.3], [2.55, 1.22], [2.96, 1.0]],
  plan: [[-2.96, 1.4], [2.96, 1.4]], hullRound: 14,
  track: [[-1.95, 0], [1.95, 0], [2.9, 0.66], [2.62, 0.95], [-2.6, 0.95], [-2.92, 0.52]],
  wheels: pairs([-1.53, -0.51, 0.51, 1.53], 0.55), r: 0.235, rollers: [-1.6, -0.55, 0.5, 1.55],
  turret: PZ4_T,
  parts: [drumX(1.68, -3.22, -2.98, 0, 1.12, 0.17)],
};
const pz4Cupola = (t: TurretSpec): TurretSpec => cupola(t, -0.95, 0, 0.34, 0.28);
const pz4Mantlet = (t: TurretSpec): TurretSpec => on(t, [[0.95, 0.4], [1.15, 0.4]], [[0.95, 0.55], [1.15, 0.55]], 0.12, 10);
const pz4Bin = (t: TurretSpec): TurretSpec => on(t, [[-1.62, 0.55], [-1.15, 0.55]], [[-1.62, 0.55], [-1.15, 0.55]], 0.12, 12);
/** Turret Schürzen: plates round the sides and back of the turret, standing off it. */
const pz4TurretSkirts = (t: TurretSpec): TurretSpec[] => [...[-1, 1].map((s) => on(t, [[-1.3, 0.025], [0.7, 0.025]], [[-1.3, 0.66], [0.7, 0.66]], 0.05, 16, s * 1.22)), on(t, [[-1.72, 1.22], [-1.68, 1.22]], [[-1.72, 0.66], [-1.68, 0.66]], 0.05, 16)];
const pz4HullSkirts = skirtPair(1.68, -2.3, 2.0, 1.6, 0.55, 1.55);
// Ausf. F1 (1941-42): the short 75 mm L/24 in the internal mantlet.
G['pz-iv-f1'] = ww2({ ...PZ4, turret: PZ4_F1_T, gun: { length: 1.3, calibre: 0.075, at: 0.45 }, turretParts: (t) => [pz4Cupola(t)] });
// Ausf. F2 (1942): the long L/43 with its ball-shaped single-baffle brake in an external mantlet (6.63 m with the gun).
G['pz-iv-f2'] = ww2({ ...PZ4, gun: { length: 2.4, calibre: 0.075, muzzle: true, at: 0.45 }, turretParts: (t) => [pz4Cupola(t), pz4Mantlet(t)] });
// Ausf. G (1942-43): the F2 with the stowage bin on the turret's back and the double-baffle brake.
G['pz-iv-g'] = ww2({ ...PZ4, gun: { length: 2.45, calibre: 0.075, muzzle: true, at: 0.45 }, turretParts: (t) => [pz4Cupola(t), pz4Mantlet(t), pz4Bin(t)] });
// Ausf. H (1943-44): the L/48 (7.02 m with the gun), skirts on the hull and round the turret (3.33 m wide over them),
// the big transverse muffler on the back.
G['pz-iv-h'] = ww2({
  ...PZ4,
  gun: { length: 2.85, calibre: 0.075, muzzle: true, at: 0.45 },
  parts: [drumX(1.68, -3.26, -3.0, 0, 1.1, 0.2), part(1.68, [[-3.26, 0.55], [-3.0, 0.55]], [[-3.26, 1.3], [-3.0, 1.3]], 0.9, 2), ...pz4HullSkirts],
  turretParts: (t) => [pz4Cupola(t), pz4Mantlet(t), pz4Bin(t), ...pz4TurretSkirts(t)],
});
// Ausf. J (1944-45): the H without the auxiliary engine's muffler, two upright flame-damping exhausts, three return rollers.
G['pz-iv-j'] = ww2({
  ...PZ4,
  rollers: [-1.3, 0, 1.3],
  gun: { length: 2.85, calibre: 0.075, muzzle: true, at: 0.45 },
  parts: [pipe(1.68, -3.05, -0.42, 0.09, 0.95, 1.8), pipe(1.68, -3.05, 0.42, 0.09, 0.95, 1.8), ...pz4HullSkirts],
  turretParts: (t) => [pz4Cupola(t), pz4Mantlet(t), pz4Bin(t), ...pz4TurretSkirts(t)],
});

// ---------------------------------------------------------------- StuG III

// StuG III on the Pz III running gear: six road wheels in three pairs, three return rollers, front sprocket; the low
// casemate with its panniers and sloped front, the gun just right of the centre. Hull 5.38 x 2.95 m, 1.95-2.16 m high.
const STUG_CASEMATE = turret(0.55, [[-1.45, 1.22], [0.85, 1.35], [1.3, 1.05], [1.4, 0.7]], [[-1.45, 0.58], [0.3, 0.66], [1.3, 0.3], [1.4, 0.22]], 12, 1.4);
const STUG: Ww2 = {
  cls: 'assault-gun', L: 5.38, W: 2.95, deck: 1.32, fender: 0.92,
  top: [[-2.69, 1.15], [-2.6, 1.32], [2.25, 1.32], [2.4, 1.15], [2.69, 1.05]],
  plan: [[-2.69, 1.44], [2.69, 1.44]], hullRound: 14,
  track: [[-1.6, 0], [1.6, 0], [2.62, 0.6], [2.38, 0.92], [-2.45, 0.9], [-2.68, 0.5]],
  wheels: pairs([-1.12, 0, 1.12], 0.6), r: 0.26, rollers: [-1.1, 0, 1.1],
  turret: STUG_CASEMATE,
  guns: [],
};
/** The gun's mount in the casemate front, a little right of the centre: a box mantlet or the cast Saukopf. */
const stugMount = (t: TurretSpec, kind: 'box' | 'saukopf'): TurretSpec =>
  kind === 'box' ? { ...on(t, [[1.2, 0.3], [1.48, 0.3]], [[1.2, 0.55], [1.48, 0.5]], 0.08, 10, 0.18), gunX: 1.4 } : { ...on(t, [[1.2, 0.32], [1.55, 0.2]], [[1.2, 0.6], [1.55, 0.46]], [[1.2, 0.04], [1.55, 0.18]], 2.4, 0.18), gunX: 1.5 };
// Ausf. A-E (1940-42): the short 75 mm L/24, no cupola.
G['stug-iii-d'] = ww2({ ...STUG, guns: [{ mount: 'turret', turret: 1, length: 1.25, calibre: 0.075, at: 0.45 }], turretParts: (t) => [stugMount(t, 'box')] });
// Ausf. F (1942): the long L/43 with its brake.
G['stug-iii-f'] = ww2({ ...STUG, guns: [{ mount: 'turret', turret: 1, length: 2.35, calibre: 0.075, muzzle: true, at: 0.45 }], turretParts: (t) => [stugMount(t, 'box')] });
// Ausf. G (1943-45): the L/48 (6.77 m with the gun), a cupola at the casemate's back left, the Saukopf mantlet and skirts.
G['stug-iii-g'] = ww2({
  ...STUG,
  guns: [{ mount: 'turret', turret: 1, length: 2.5, calibre: 0.075, muzzle: true, at: 0.45 }],
  parts: skirtPair(1.32, -2.0, 1.75, 1.5, 0.55, 1.25),
  turretParts: (t) => [stugMount(t, 'saukopf'), cupola(t, -0.9, -0.55, 0.3, 0.15)],
});

// ---------------------------------------------------------------- Sherman

// The M4 family: a tall hull with sponsons over the tracks, the sloped glacis to the rounded transmission cover, the
// front sprocket high; VVSS - three bogies a side, each two 0.51 m wheels on a bracket with the return roller on top -
// or HVSS (the E8): three bogies of paired wheels, the rollers apart. M4 hull 5.84 x 2.62 m, 2.74 m high.
const SHERMAN_T75 = turret(0.2, [[-1.25, 0.8], [-0.95, 1.05], [0.5, 1.1], [1.0, 0.92], [1.15, 0.65]], [[-1.25, 0.45], [-0.85, 0.78], [0.5, 0.82], [1.15, 0.42]], 2.4, 1.3);
// The T23 turret of the 76 mm Shermans: longer, with a bigger bustle.
const SHERMAN_T23 = turret(0.1, [[-1.55, 0.85], [-1.15, 1.15], [0.55, 1.2], [1.1, 1.0], [1.3, 0.62]], [[-1.55, 0.5], [-1.0, 0.82], [0.5, 0.86], [1.3, 0.45]], 2.6, 1.42);
/** A welded hull's top line from the rear, the glacis starting at `glacisX` (56 degrees from upright; the 47-degree late hulls start further forward). */
const shermanTop = (h: number, glacisX: number, deck = 1.9): P2[] => [[-h, 1.45], [-h + 0.12, 1.8], [-1.0, deck - 0.04], [glacisX, deck], [2.45, 1.2], [2.7, 1.05], [h, 0.78]];
/** VVSS bogie brackets: the block between each bogie's two wheels up to its return roller. */
const vvss = (W: number, centres: number[], deck = 1.9): TurretSpec[] => {
  const tw = Math.max(0.3, W * 0.17);
  return centres.flatMap((c) => [-1, 1].map((s) => part(deck, [[c - 0.24, tw * 0.4], [c + 0.24, tw * 0.4]], [[c - 0.24, 0.84], [c + 0.24, 0.7]], 0.28, 10, s * (W / 2 - tw / 2))));
};
const shermanMantlet = (t: TurretSpec, x0: number): TurretSpec => on(t, [[x0, 0.55], [x0 + 0.2, 0.5]], [[x0, 0.62], [x0 + 0.2, 0.58]], [[x0, 0.14], [x0 + 0.2, 0.18]], 4);
function sherman(o: { L: number; W?: number; glacisX: number; cast?: boolean; bogies?: number[]; hvss?: boolean; turret: TurretSpec; gun: Ww2['gun']; deck?: number; extra?: TurretSpec[]; turretParts?: (t: TurretSpec) => TurretSpec[] }): GroundSpec & { cls: string } {
  const W = o.W ?? 2.62;
  const h = o.L / 2;
  const bogies = o.bogies ?? [-1.5, 0, 1.5];
  const deck = o.deck ?? 1.9;
  return ww2({
    cls: 'medium-tank', L: o.L, W, deck, fender: 1.02,
    top: shermanTop(h, o.glacisX, deck),
    under: [[-h, 1.05], [2.5, 1.05], [h, 0.6]],
    plan: [[-h, 1.26], [2.4, 1.31], [2.6, 1.0], [h, 0.95]],
    hullRound: o.cast ? 3.2 : 12,
    track: [[-2.05, 0], [2.0, 0], [h - 0.02, 0.78], [h - 0.3, 1.02], [-h + 0.4, 1.0], [-h + 0.05, 0.42]],
    wheels: pairs(bogies, 0.56), r: o.hvss ? 0.26 : 0.255,
    rollers: o.hvss ? bogies.map((c) => c - 0.05) : undefined,
    turret: o.turret,
    gun: o.gun,
    parts: [...(o.hvss ? [] : vvss(W, bogies, deck)), ...(o.extra ?? [])],
    turretParts: (t) => [shermanMantlet(t, t === SHERMAN_T23 ? 1.25 : 1.12), ...(o.turretParts?.(t) ?? [])],
  });
}
const GUN_75 = { length: 1.95, calibre: 0.075, at: 0.48 };
const GUN_76 = { length: 3.1, calibre: 0.076, muzzle: true, at: 0.48 };
// M4 (welded hull, radial engine).
G['m4-sherman'] = sherman({ L: 5.84, glacisX: 0.85, turret: SHERMAN_T75, gun: GUN_75 });
// M4A1: the cast hull, every edge rounded, the glacis curving into the sides.
G['m4a1-sherman'] = sherman({ L: 5.84, glacisX: 0.7, cast: true, turret: SHERMAN_T75, gun: GUN_75 });
// M4A2 (diesel, 5.94 m): the welded hull, two exhaust deflectors low on the back.
G['m4a2-sherman'] = sherman({ L: 5.94, glacisX: 0.9, turret: SHERMAN_T75, gun: GUN_75, extra: [-1, 1].map((s) => part(1.9, [[-3.12, 0.3], [-2.97, 0.3]], [[-3.12, 1.25], [-2.97, 1.25]], 0.85, 6, s * 0.6)) });
// M4A3(75)W (Ford V8, 5.88 m): the one-piece 47-degree glacis with the big hatch hoods standing up from it.
G['m4a3-sherman'] = sherman({ L: 5.88, glacisX: 1.45, turret: SHERMAN_T75, gun: GUN_75, extra: [-1, 1].map((s) => part(1.9, [[1.3, 0.32], [1.75, 0.32]], [[1.3, 2.02], [1.75, 1.95]], 1.85, 6, s * 0.55)) });
// M4A4 (multibank engine): the hull lengthened to 6.06 m behind the turret, the bogies spread further apart.
G['m4a4-sherman'] = sherman({ L: 6.06, glacisX: 0.95, bogies: [-1.72, -0.08, 1.52], turret: SHERMAN_T75, gun: GUN_75 });
// Sherman VC Firefly: the M4A4 with the long 17-pounder (7.77 m with the gun) and the armoured radio box on the turret's back.
G['m4a4-firefly'] = sherman({ L: 6.06, glacisX: 0.95, bogies: [-1.72, -0.08, 1.52], turret: SHERMAN_T75, gun: { length: 3.25, calibre: 0.076, muzzle: true, at: 0.48 }, turretParts: (t) => [on(t, [[-1.75, 0.5], [-1.2, 0.5]], [[-1.75, 0.62], [-1.2, 0.68]], 0.12, 10)] });
// M4A3(76)W: the 47-degree hull and the T23 turret with the 76 mm.
G['m4a3-76'] = sherman({ L: 5.88, glacisX: 1.45, turret: SHERMAN_T23, gun: GUN_76, extra: [-1, 1].map((s) => part(1.9, [[1.3, 0.32], [1.75, 0.32]], [[1.3, 2.02], [1.75, 1.95]], 1.85, 6, s * 0.55)) });
// M4A3E8 "Easy Eight": HVSS - the wider track (2.99 m), paired wheels on open bogies, the rollers apart - with the
// T23 turret and the 76 mm M1A2 (7.54 m with the gun).
G['m4a3e8'] = sherman({ L: 5.9, W: 2.99, glacisX: 1.45, hvss: true, bogies: [-1.55, 0, 1.55], turret: SHERMAN_T23, gun: GUN_76 });
// M4A3E2 "Jumbo" (2.97 m high, 2.97 m wide): the extra glacis plate, a new heavy turret with upright sides and a thick
// mantlet, the wider end connectors; the 75 mm.
const JUMBO_T = turret(0.15, [[-1.45, 0.95], [-1.3, 1.15], [0.7, 1.2], [1.05, 1.12], [1.2, 0.85]], [[-1.45, 0.62], [1.2, 0.72]], 8, 1.5);
G['m4a3e2-jumbo'] = sherman({ L: 5.9, W: 2.97, glacisX: 1.1, deck: 1.95, turret: JUMBO_T, gun: GUN_75, extra: [part(1.95, [[1.1, 1.2], [2.6, 1.2]], [[1.1, 2.0], [2.6, 1.3]], 1.35, 10)], turretParts: (t) => [on(t, [[1.2, 0.62], [1.42, 0.58]], [[1.2, 0.68], [1.42, 0.64]], 0.1, 8)] });

// ---------------------------------------------------------------- T-34

// T-34: five big 0.83 m Christie wheels with the gap between the second and third, no return rollers, the rear
// sprocket; the hull's sloped glacis, sides and rear. Hull 5.92 x 3.0 m, 2.45 m high (T-34-85: 6.1 m, 2.72 m).
function t34(L: number, turretSpec: TurretSpec, gun: Ww2['gun'], tanks: boolean, turretParts: (t: TurretSpec) => TurretSpec[] = () => [], gunSleeve = false): GroundSpec & { cls: string } {
  const h = L / 2;
  const d = 1.5;
  return ww2({
    cls: 'medium-tank', L, W: 3.0, deck: d, fender: 1.0,
    top: [[-h, 1.05], [-h + 0.4, d], [1.15, d], [h, 0.62]],
    plan: [[-h, 1.48], [h, 1.48]], hullRound: 6,
    track: [[-2.3, 0], [2.25, 0], [h + 0.02, 0.5], [h - 0.32, 1.0], [-h + 0.32, 1.0], [-h - 0.02, 0.55]],
    wheels: [1.92, 0.96, -0.24, -1.14, -2.04].map((x) => x * (L / 5.92)), r: 0.41,
    turret: turretSpec,
    gun,
    guns: gunSleeve && gun ? [{ mount: 'turret', at: 0.45, ...gun }, { mount: 'turret', length: 0.55, calibre: 0.13, at: 0.3 }] : undefined,
    // From 1942, external fuel drums on the hull's sides behind the turret.
    parts: tanks ? [-1, 1].flatMap((s) => [drumX(d, -2.4, -1.6, s * 1.3, 1.32, 0.19), drumX(d, -1.5, -0.7, s * 1.3, 1.32, 0.19)]) : [],
    turretParts,
  });
}
// The early turret (1940-41): rolled or cast, overhanging at the back, with one big hatch.
const T34_EARLY = turret(0.75, [[-1.15, 0.75], [-0.95, 0.95], [0.75, 0.98], [1.05, 0.7], [1.15, 0.45]], [[-1.15, 0.5], [-0.9, 0.7], [0.95, 0.72], [1.15, 0.45]], 6, 1.15);
// The hexagonal "nut" turret (1942 on): wider and shorter, no overhang, two round hatches.
const T34_HEX = turret(0.7, [[-1.0, 0.7], [-0.75, 1.15], [0.6, 1.15], [1.0, 0.75], [1.1, 0.5]], [[-1.0, 0.6], [1.0, 0.62], [1.1, 0.45]], 8, 1.15);
const F34 = { length: 1.75, calibre: 0.076, at: 0.45 };
// 1940: the short L-11 with its armoured recoil sleeve under the barrel.
G['t-34-1940'] = t34(5.92, T34_EARLY, { length: 1.5, calibre: 0.076, at: 0.48 }, false, () => [], true);
// 1941: the early turret with the longer F-34.
G['t-34-1941'] = t34(5.92, T34_EARLY, F34, false);
// 1942 (and the T-34-76 in general): the hexagonal turret, the fuel drums on the sides.
G['t-34-76'] = t34(5.92, T34_HEX, F34, true);
G['t-34-1942'] = G['t-34-76'];
// 1943: the hexagonal turret with the commander's cupola.
G['t-34-76-1943'] = t34(5.92, T34_HEX, F34, true, (t) => [cupola(t, -0.45, -0.5, 0.32, 0.22)]);
// T-34-85: the big cast three-man turret with its cupola, the long 85 mm (8.15 m with the gun).
const T34_85 = turret(0.35, [[-1.6, 0.85], [-1.25, 1.25], [0.7, 1.3], [1.35, 0.95], [1.5, 0.55]], [[-1.6, 0.5], [-1.1, 0.82], [0.6, 0.88], [1.5, 0.5]], 3, 1.55);
G['t-34-85'] = t34(6.1, T34_85, { length: 3.25, calibre: 0.085, at: 0.45 }, true, (t) => [cupola(t, -0.75, -0.55, 0.34, 0.26), on(t, [[1.4, 0.45], [1.62, 0.4]], [[1.4, 0.62], [1.62, 0.58]], [[1.4, 0.22], [1.62, 0.25]], 4)]);

// ---------------------------------------------------------------- KV

// KV-1: six small road wheels evenly spaced with three return rollers, the rear sprocket; a boxy hull with a stepped
// front. Hull 6.75 x 3.32 m, 2.71 m high.
const KV: Ww2 = {
  cls: 'heavy-tank', L: 6.75, W: 3.32, deck: 1.65, fender: 1.0,
  top: [[-3.37, 1.15], [-3.1, 1.6], [-1.2, 1.62], [2.4, 1.65], [2.75, 1.25], [3.37, 1.05]],
  plan: [[-3.37, 1.6], [3.37, 1.6]], hullRound: 14,
  track: [[-2.5, 0], [2.5, 0], [3.35, 0.55], [3.05, 1.0], [-3.0, 1.0], [-3.35, 0.62]],
  wheels: even(6, -2.3, 2.3), r: 0.3, rollers: [-1.4, 0, 1.4],
};
// KV-1 (1941, ZiS-5): the big welded turret with its low overhanging back.
const KV1_T = turret(0.35, [[-1.4, 0.8], [-1.2, 1.15], [0.9, 1.2], [1.15, 0.95], [1.25, 0.6]], [[-1.4, 0.55], [-1.1, 0.9], [0.9, 0.95], [1.25, 0.7]], 10, 1.35);
G['kv-1'] = ww2({ ...KV, turret: KV1_T, gun: { length: 1.95, calibre: 0.076, at: 0.45 }, turretParts: (t) => [on(t, [[1.2, 0.42], [1.4, 0.38]], [[1.2, 0.68], [1.4, 0.64]], 0.18, 6)] });
// KV-1E: the welded turret and hull with bolted-on appliqué plates, the turret squarer and bigger.
const KV1E_T = turret(0.35, [[-1.45, 0.85], [-1.3, 1.25], [0.95, 1.3], [1.2, 1.05], [1.32, 0.7]], [[-1.45, 0.6], [-1.2, 0.95], [0.95, 1.0], [1.32, 0.78]], 14, 1.42);
G['kv-1e'] = ww2({ ...KV, plan: [[-3.37, 1.62], [3.37, 1.66]], turret: KV1E_T, gun: { length: 1.85, calibre: 0.076, at: 0.45 } });
// KV-1S (1942): lighter and lower (2.64 m), a smaller cast turret with a cupola, the rear deck sloping down.
const KV1S_T = turret(0.3, [[-1.3, 0.75], [-1.0, 1.1], [0.6, 1.15], [1.15, 0.85], [1.3, 0.5]], [[-1.3, 0.48], [-0.8, 0.82], [0.6, 0.86], [1.3, 0.45]], 3, 1.35);
G['kv-1s'] = ww2({ ...KV, W: 3.25, deck: 1.6, top: [[-3.37, 1.05], [-2.9, 1.48], [-1.2, 1.58], [2.4, 1.6], [2.75, 1.25], [3.37, 1.05]], turret: KV1S_T, gun: { length: 2.0, calibre: 0.076, at: 0.45 }, turretParts: (t) => [cupola(t, -0.55, -0.45, 0.3, 0.2)] });
// KV-2 (3.24 m high): the tall box turret with the 152 mm howitzer in its massive mantlet (6.95 m with the gun).
const KV2_T = turret(0.1, [[-1.6, 0.95], [-1.5, 1.15], [1.2, 1.2], [1.4, 1.05]], [[-1.6, 1.45], [1.3, 1.5], [1.4, 1.3]], 14, 1.7);
G['kv-2'] = ww2({ ...KV, turret: KV2_T, gun: { length: 1.85, calibre: 0.152, at: 0.4 }, turretParts: (t) => [on(t, [[1.4, 0.55], [1.7, 0.5]], [[1.4, 1.05], [1.7, 1.0]], [[1.4, 0.25], [1.7, 0.3]], 8)] });

// ---------------------------------------------------------------- IS

// IS-1 and IS-2: the long hull with six road wheels and three return rollers, the rounded cast turret.
// Hull 6.77 x 3.07 m, 2.73 m high; IS-2 9.83 m with the 122 mm, IS-1 8.56 m with the 85 mm.
const IS_T = turret(0.15, [[-1.5, 0.8], [-1.1, 1.25], [0.6, 1.3], [1.3, 0.92], [1.45, 0.55]], [[-1.5, 0.5], [-0.8, 0.9], [0.6, 0.95], [1.45, 0.5]], 2.4, 1.55);
const IS: Ww2 = {
  cls: 'heavy-tank', L: 6.77, W: 3.07, deck: 1.6, fender: 0.95,
  top: [[-3.385, 1.15], [-3.1, 1.6], [1.9, 1.6], [3.385, 0.98]],
  plan: [[-3.385, 1.52], [3.385, 1.52]], hullRound: 6,
  track: [[-2.55, 0], [2.55, 0], [3.36, 0.6], [3.05, 0.95], [-3.05, 0.95], [-3.36, 0.6]],
  wheels: even(6, -2.35, 2.35), r: 0.275, rollers: [-1.45, 0, 1.45],
  turret: IS_T,
};
// The 1943 hull's stepped front: the driver's plate stands up above a shorter glacis.
const IS_STEPPED: P2[] = [[-3.385, 1.15], [-3.1, 1.6], [2.1, 1.6], [2.25, 1.35], [2.7, 1.3], [3.385, 0.95]];
const isParts = (t: TurretSpec): TurretSpec[] => [cupola(t, -0.7, -0.55, 0.32, 0.22), on(t, [[1.35, 0.5], [1.6, 0.42]], [[1.35, 0.7], [1.6, 0.62]], [[1.35, 0.2], [1.6, 0.25]], 4)];
G['is-1'] = ww2({ ...IS, top: IS_STEPPED, gun: { length: 3.4, calibre: 0.085, at: 0.45 }, turretParts: isParts });
G['is-2-1943'] = ww2({ ...IS, top: IS_STEPPED, gun: { length: 4.7, calibre: 0.122, muzzle: true, at: 0.45 }, turretParts: isParts });
// IS-2 (1944): the straight glacis.
G['is-2'] = ww2({ ...IS, gun: { length: 4.7, calibre: 0.122, muzzle: true, at: 0.45 }, turretParts: isParts });
// IS-3: the "pike" nose - two plates meeting in a point seen from above - and the low, wide bowl turret without a
// cupola. Hull 6.67 x 3.15 m, 2.45 m high, 9.85 m with the 122 mm.
const IS3_T = turret(-0.05, [[-1.7, 0.55], [-1.4, 1.15], [-0.3, 1.45], [0.8, 1.3], [1.5, 0.75], [1.75, 0.35]], [[-1.7, 0.2], [-1.1, 0.6], [0, 0.78], [0.9, 0.65], [1.6, 0.35], [1.75, 0.25]], 2.2, 1.7);
G['is-3'] = ww2({
  ...IS,
  L: 6.67, W: 3.15, deck: 1.65,
  top: [[-3.335, 1.2], [-3.0, 1.65], [1.4, 1.65], [3.335, 0.95]],
  plan: [[-3.335, 1.45], [1.4, 1.57], [3.335, 0.2]], hullRound: 8,
  track: [[-2.5, 0], [2.5, 0], [3.3, 0.6], [3.0, 0.95], [-3.0, 0.95], [-3.3, 0.6]],
  wheels: even(6, -2.3, 2.3),
  turret: IS3_T,
  gun: { length: 4.85, calibre: 0.122, muzzle: true, at: 0.5 },
  turretParts: (t) => [on(t, [[1.55, 0.38], [1.8, 0.32]], [[1.55, 0.58], [1.8, 0.52]], [[1.55, 0.16], [1.8, 0.22]], 4)],
});

// ---------------------------------------------------------------- Churchill

// Churchill: the tracks run round the whole hull side over the panniers, eleven small bogies a side hidden behind the
// pannier plates, the track horns high at the front; the turret forward of the middle.
// Hull 7.44 x 3.25 m, 2.49 m high (Mk VII 2.74 m).
const CHURCHILL: Ww2 = {
  cls: 'heavy-tank', L: 7.44, W: 3.25, deck: 1.75, fender: 0.45,
  top: [[-3.6, 1.25], [-3.45, 1.75], [3.05, 1.75], [3.35, 1.3]],
  plan: [[-3.6, 1.05], [3.35, 1.05]], hullRound: 14,
  track: [[-3.0, 0], [3.0, 0], [3.72, 0.95], [3.45, 1.52], [-3.35, 1.52], [-3.72, 0.85]],
  wheels: [], r: 0.13, solid: true,
};
// Mk I: a small cast turret with the 2-pounder and a 3-inch howitzer in the hull nose.
const CH1_T = turret(0.55, [[-0.95, 0.6], [-0.75, 0.85], [0.5, 0.88], [0.9, 0.65], [1.0, 0.45]], [[-0.95, 0.45], [-0.6, 0.68], [0.5, 0.7], [1.0, 0.42]], 2.6, 1.0);
G['churchill-i'] = ww2({ ...CHURCHILL, turret: CH1_T, guns: [{ mount: 'turret', length: 1.5, calibre: 0.04, at: 0.5 }, { mount: 'hull', x: 3.25, at: 0.55, length: 0.55, calibre: 0.076 }] });
// Mk III: the welded, slab-sided square turret with the 6-pounder.
const CH3_T = turret(0.55, [[-0.95, 0.82], [0.95, 0.82]], [[-0.95, 0.72], [0.95, 0.72]], 16, 0.95);
G['churchill-iii'] = ww2({ ...CHURCHILL, turret: CH3_T, gun: { length: 2.0, calibre: 0.057, at: 0.5 } });
// Mk IV: a cast, rounded turret of the same size.
const CH4_T = turret(0.55, [[-1.0, 0.7], [-0.8, 0.9], [0.6, 0.92], [0.95, 0.72], [1.05, 0.5]], [[-1.0, 0.5], [-0.7, 0.72], [0.6, 0.74], [1.05, 0.45]], 2.8, 1.05);
G['churchill-iv'] = ww2({ ...CHURCHILL, turret: CH4_T, gun: { length: 2.0, calibre: 0.057, at: 0.5 } });
// Mk VII (2.74 m): the composite turret with cast curved sides and a flat roof, its cupola, the 75 mm; the heavier hull.
const CH7_T = turret(0.5, [[-1.05, 0.6], [-0.85, 0.98], [0.55, 1.02], [1.0, 0.8], [1.12, 0.55]], [[-1.05, 0.82], [1.12, 0.82]], 6, 1.12);
G['churchill-vii'] = ww2({ ...CHURCHILL, plan: [[-3.6, 1.08], [3.35, 1.08]], turret: CH7_T, gun: { length: 1.9, calibre: 0.075, at: 0.5 }, turretParts: (t) => [cupola(t, -0.4, -0.4, 0.3, 0.14)] });
G['churchill'] = G['churchill-vii'];

// ---------------------------------------------------------------- Cromwell, Comet

// Cromwell: five big 0.83 m Christie wheels evenly spaced, no return rollers, a flat box hull with the upright driver's
// plate; the square turret with upright sides and a flat face. Hull 6.35 x 2.91 m, 2.49 m high.
const CROMWELL_T = turret(0.25, [[-1.0, 0.82], [-0.92, 0.92], [0.88, 0.92], [0.98, 0.86]], [[-1.0, 0.7], [0.98, 0.72]], 16, 1.08);
G['cromwell'] = ww2({
  cls: 'medium-tank', L: 6.35, W: 2.91, deck: 1.75, fender: 1.0,
  top: [[-3.175, 1.3], [-3.1, 1.72], [2.75, 1.75], [2.85, 1.35], [3.175, 1.1]],
  plan: [[-3.175, 1.42], [3.175, 1.42]], hullRound: 14,
  track: [[-2.35, 0], [2.3, 0], [3.12, 0.55], [2.8, 1.0], [-2.8, 1.0], [-3.12, 0.6]],
  wheels: even(5, -2.05, 2.05), r: 0.41,
  turret: CROMWELL_T,
  gun: { length: 1.75, calibre: 0.075, at: 0.48 },
  turretParts: (t) => [on(t, [[0.98, 0.4], [1.1, 0.4]], [[0.98, 0.55], [1.1, 0.55]], 0.15, 10)],
});
// Comet: the Cromwell's look with four return rollers, a longer turret with an overhanging bustle and the long
// 77 mm without a brake (hull 6.55 x 3.04 m, 2.67 m high, 7.66 m with the gun), the exhaust cowl on the back.
const COMET_T = turret(0.1, [[-1.6, 0.82], [-1.45, 1.0], [0.7, 1.05], [1.05, 0.95], [1.15, 0.72]], [[-1.6, 0.55], [-1.4, 0.72], [0.8, 0.78], [1.15, 0.6]], 8, 1.25);
G['comet'] = ww2({
  cls: 'medium-tank', L: 6.55, W: 3.04, deck: 1.8, fender: 1.05,
  top: [[-3.275, 1.35], [-3.2, 1.78], [2.85, 1.8], [2.95, 1.38], [3.275, 1.12]],
  plan: [[-3.275, 1.48], [3.275, 1.48]], hullRound: 14,
  track: [[-2.4, 0], [2.35, 0], [3.22, 0.55], [2.9, 1.05], [-2.9, 1.05], [-3.22, 0.6]],
  wheels: even(5, -2.15, 2.15), r: 0.4, rollers: [-1.6, -0.55, 0.55, 1.6],
  turret: COMET_T,
  gun: { length: 3.03, calibre: 0.077, at: 0.5 },
  parts: [part(1.8, [[-3.45, 0.9], [-3.15, 0.9]], [[-3.45, 1.55], [-3.15, 1.85]], 1.25, 10)],
  turretParts: (t) => [on(t, [[1.12, 0.38], [1.32, 0.35]], [[1.12, 0.58], [1.32, 0.55]], 0.16, 6), cupola(t, -0.6, -0.42, 0.3, 0.14)],
});

// ---------------------------------------------------------------- more helpers

/** A track run: the ground contact from -c to c, the front wheel at (h, fu), the top run at th, the back wheel at (-h, bu). */
const trk = (h: number, th: number, fu: number, bu: number, c: number): P2[] => [[-c, 0], [c, 0], [h, fu], [h - 0.3, th], [-h + 0.3, th], [-h, bu]];
/** A gun mount standing in the vehicle's frame - a casemate's ball or Saukopf, a hull mount - as the "turret" its gun comes out of, at height u. */
function mantlet(deck: number, x0: number, x1: number, u: number, r0: number, r1: number, side = 0, round = 2.4): TurretSpec {
  return { ...part(deck, [[x0, r0], [x1, r1]], [[x0, u + r0], [x1, u + r1]], [[x0, u - r0], [x1, u - r1]], round, side), gunX: x1 - 0.02 };
}
/** The gun from a `mantlet`, at its middle. */
const fire = (m: TurretSpec, length: number, calibre: number, extra: Partial<GunSpec> = {}): GunSpec => ({ mount: 'turret', length, calibre, at: (m.outline!.top[0][1] + m.outline!.bottom[0][1]) / 2 / m.height, ...extra });
/** A cupola on a casemate roof at height `roof`, in the vehicle's frame. */
const roofCupola = (deck: number, x: number, side: number, roof: number, r: number, h: number): TurretSpec => part(deck, circle(x, r), [[x - r, roof + h], [x + r, roof + h]], roof - 0.03, 8, side);
/** An open-topped fighting compartment's walls, seen whole: from x0 to x1, its top at `hi`, half-width `w`. */
const compartment = (deck: number, x0: number, x1: number, hi: number, w: number, lo = deck - 0.1): TurretSpec => part(deck, [[x0, w], [x1, w]], [[x0, hi], [x1, hi]], lo, 16);

// ---------------------------------------------------------------- Panzer III

// Pz.Kpfw. III (Ausf. E-N): six road wheels in three pairs, three return rollers, the front sprocket; the
// superstructure over the tracks with the upright driver's plate; the turret with its drum cupola at the back.
// Hull 5.52 x 2.95 m, 2.5 m high.
const PZ3_T = turret(0.2, [[-1.05, 0.72], [-0.9, 0.9], [0.75, 0.92], [0.9, 0.78]], [[-1.05, 0.65], [0.9, 0.7]], 10, 1.1);
const PZ3: Ww2 = {
  cls: 'medium-tank', L: 5.52, W: 2.95, deck: 1.5, fender: 0.92,
  top: [[-2.76, 1.3], [-2.68, 1.45], [1.75, 1.5], [1.8, 1.25], [2.4, 1.15], [2.76, 0.95]],
  plan: [[-2.76, 1.45], [2.76, 1.45]], hullRound: 14,
  track: trk(2.7, 0.92, 0.6, 0.5, 1.6),
  wheels: pairs([-1.12, 0, 1.12], 0.6), r: 0.26, rollers: [-1.1, 0, 1.1],
  turret: PZ3_T,
};
const pz3Parts = (t: TurretSpec, mantletBox = true, spaced = false): TurretSpec[] => [
  cupola(t, -0.95, 0, 0.33, 0.25),
  ...(mantletBox ? [on(t, [[0.9, 0.42], [1.1, 0.42]], [[0.9, 0.56], [1.1, 0.56]], 0.12, 10)] : []),
  // The spaced plate hung in front of the mantlet (Ausf. L, M).
  ...(spaced ? [on(t, [[1.12, 0.48], [1.18, 0.48]], [[1.12, 0.62], [1.18, 0.62]], 0.08, 16)] : []),
];
// Ausf. E/F: the 37 mm in the internal mantlet.
G['pz-iii-e'] = ww2({ ...PZ3, turret: { ...PZ3_T, gunX: 0.92 }, gun: { length: 1.55, calibre: 0.037, at: 0.45 }, turretParts: (t) => pz3Parts(t, false) });
// Ausf. H/J: the 50 mm L/42 in the external mantlet.
G['pz-iii-h'] = ww2({ ...PZ3, gun: { length: 1.65, calibre: 0.05, at: 0.45 }, turretParts: (t) => pz3Parts(t) });
// Ausf. J1/L: the long 50 mm L/60 (6.41 m with the gun), the spaced plate before the mantlet.
G['pz-iii-l'] = ww2({ ...PZ3, gun: { length: 3.0, calibre: 0.05, at: 0.45 }, turretParts: (t) => pz3Parts(t, true, true) });
// Ausf. M: the L with skirts on the hull and round the turret.
G['pz-iii-m'] = ww2({ ...PZ3, gun: { length: 3.0, calibre: 0.05, at: 0.45 }, parts: skirtPair(1.5, -2.2, 1.8, 1.53, 0.5, 1.4), turretParts: (t) => [...pz3Parts(t, true, true), ...pz4TurretSkirts(t)] });
// Ausf. N: the short 75 mm L/24 and skirts.
G['pz-iii-n'] = ww2({ ...PZ3, gun: { length: 1.3, calibre: 0.075, at: 0.45 }, parts: skirtPair(1.5, -2.2, 1.8, 1.53, 0.5, 1.4), turretParts: (t) => [...pz3Parts(t), ...pz4TurretSkirts(t)] });

// ---------------------------------------------------------------- Pz 38(t), Hetzer, Marder III, Flakpanzer 38(t)

// Pz.Kpfw. 38(t): four big road wheels in two leaf-sprung pairs, two return rollers, a riveted box hull, the small
// turret with its 37 mm and a low cupola. Hull 4.61 x 2.14 m, 2.4 m high.
const PZ38_T = turret(0.15, [[-0.85, 0.62], [-0.75, 0.72], [0.65, 0.72], [0.8, 0.6]], [[-0.85, 0.58], [0.8, 0.6]], 14, 0.85);
const PZ38: Ww2 = {
  cls: 'light-tank', L: 4.61, W: 2.14, deck: 1.67, fender: 0.88,
  top: [[-2.3, 1.35], [-2.25, 1.6], [1.45, 1.67], [1.55, 1.4], [2.3, 1.05]],
  plan: [[-2.3, 1.04], [2.3, 1.06]], hullRound: 16,
  track: trk(2.25, 0.92, 0.55, 0.55, 1.45),
  wheels: pairs([-0.95, 0.95], 0.84), r: 0.38, rollers: [-0.55, 0.65],
};
G['pz-38t'] = ww2({ ...PZ38, turret: PZ38_T, gun: { length: 1.0, calibre: 0.037, at: 0.45 }, turretParts: (t) => [cupola(t, -0.4, -0.15, 0.27, 0.13)] });
// Jagdpanzer 38(t) "Hetzer": a low hull sloped on every side, the gun right of the centre in a Saukopf in the glacis,
// four 0.825 m wheels (hull 4.87 x 2.63 m, 2.17 m high, 6.38 m with the gun).
{
  const m = mantlet(1.85, 1.0, 1.35, 1.25, 0.3, 0.2, 0.32);
  G['hetzer'] = ww2({
    ...PZ38, cls: 'tank-destroyer', L: 4.87, W: 2.63, deck: 1.85, fender: 0.85,
    top: [[-2.43, 1.35], [-2.0, 1.85], [0.4, 1.85], [2.43, 0.65]],
    plan: [[-2.43, 1.2], [0.4, 1.28], [2.43, 1.15]], hullRound: 4,
    track: trk(2.4, 0.95, 0.55, 0.55, 1.45),
    wheels: even(4, -1.35, 1.35), r: 0.41, rollers: [0],
    turret: m,
    guns: [fire(m, 1.85, 0.075, { muzzle: true })],
  });
}
// Marder III Ausf. H: the PaK 40 behind its shield in an open compartment in the middle of the 38(t) hull
// (4.95 x 2.15 m, 2.48 m high, 5.77 m with the gun).
{
  const m = mantlet(1.67, 0.55, 0.75, 1.85, 0.32, 0.25);
  G['marder-iii'] = ww2({ ...PZ38, cls: 'tank-destroyer', L: 4.95, top: [[-2.48, 1.35], [-2.4, 1.6], [1.45, 1.67], [1.55, 1.4], [2.48, 1.05]], turret: m, guns: [fire(m, 2.7, 0.075, { muzzle: true })], parts: [compartment(1.67, -1.0, 0.65, 2.35, 0.95, 1.5)] });
}
// Flakpanzer 38(t): an open box on the rear of the hull with the 20 mm Flak 38 and its shield (4.61 x 2.15 m, 2.25 m).
{
  const m = mantlet(1.67, -0.5, -0.3, 2.0, 0.15, 0.12);
  G['flakpanzer-38t'] = ww2({ ...PZ38, cls: 'spaa', turret: m, guns: [fire(m, 1.3, 0.02, { elevation: 0.35 })], parts: [compartment(1.67, -2.3, 0.1, 1.95, 1.0, 1.4)] });
}

// ---------------------------------------------------------------- Panzer IV based

// Wirbelwind: the open nine-sided turret with the quadruple 20 mm; Ostwind: the open six-sided turret with one 37 mm.
G['wirbelwind'] = ww2({ ...PZ4, cls: 'spaa', turret: turret(0.1, [[-1.0, 0.55], [-0.75, 0.95], [0, 1.1], [0.75, 0.95], [1.0, 0.55]], [[-1.0, 0.72], [1.0, 0.72]], 5, 0.9), gun: { count: 4, length: 1.4, calibre: 0.02, spread: 0.24, elevation: 0.3, at: 0.6 } });
G['ostwind'] = ww2({ ...PZ4, cls: 'spaa', turret: turret(0.1, [[-1.0, 0.7], [-0.6, 1.15], [0.6, 1.15], [1.0, 0.7]], [[-1.0, 0.75], [1.0, 0.75]], 16, 0.95), gun: { length: 2.1, calibre: 0.037, elevation: 0.3, at: 0.6 } });
// Kugelblitz: the twin 30 mm in a ball turret set into the deck.
G['kugelblitz'] = ww2({ ...PZ4, cls: 'spaa', turret: turret(0.1, circle(0, 0.85), [[-0.85, 0.75], [0, 0.85], [0.85, 0.75]], 2, 0.8), gun: { count: 2, length: 1.6, calibre: 0.03, spread: 0.3, elevation: 0.3, at: 0.5 } });
// StuG IV: the StuG III's casemate on the Pz IV chassis, with the driver's own armoured box ahead of it on the left (hull 5.93 x 2.95 m, 2.2 m high).
G['stug-iv'] = ww2({
  ...PZ4, cls: 'assault-gun', W: 2.95, deck: 1.5,
  top: [[-2.96, 1.3], [-2.88, 1.45], [1.95, 1.5], [1.98, 1.25], [2.55, 1.15], [2.96, 0.95]],
  turret: STUG_CASEMATE, guns: [{ mount: 'turret', turret: 1, length: 2.5, calibre: 0.075, muzzle: true, at: 0.45 }],
  parts: [part(1.5, [[1.6, 0.42], [2.1, 0.42]], [[1.6, 1.95], [2.1, 1.82]], 1.45, 12, -0.7), ...skirtPair(1.5, -2.3, 2.0, 1.55, 0.55, 1.4)],
  turretParts: (t) => [stugMount(t, 'saukopf'), cupola(t, -0.9, -0.55, 0.3, 0.15)],
});
// Jagdpanzer IV: a low casemate whose glacis comes to a sharp nose seen from the side, the gun left of the centre
// (hull 5.92 x 3.17 m, 1.85 m high; L/48 6.85 m with the gun, L/70 "(V)" 8.5 m).
{
  const m = mantlet(1.85, 1.3, 1.65, 1.35, 0.3, 0.2, -0.25);
  const jp4 = { ...PZ4, cls: 'tank-destroyer', W: 3.17, deck: 1.85, top: [[-2.96, 1.4], [-2.88, 1.55], [-1.3, 1.55], [-1.2, 1.85], [0.9, 1.85], [2.96, 0.75]] as P2[], plan: [[-2.96, 1.5], [0.9, 1.55], [2.96, 1.4]] as P2[], hullRound: 6, turret: m, parts: skirtPair(1.85, -2.3, 2.0, 1.62, 0.55, 1.4) };
  G['jagdpanzer-iv'] = ww2({ ...jp4, guns: [fire(m, 2.25, 0.075, { muzzle: true })] });
  G['jagdpanzer-iv-l70'] = ww2({ ...jp4, guns: [fire(m, 3.9, 0.075)] });
}
// Panzer IV/70 (A): a taller casemate set on the Pz IV hull above its upright driver's plate (2.35 m high).
{
  const m = mantlet(1.68, 1.4, 1.75, 1.95, 0.3, 0.2, -0.25);
  G['pz-iv-70-a'] = ww2({ ...PZ4, cls: 'tank-destroyer', turret: m, guns: [fire(m, 3.8, 0.075)], top: [[-2.96, 1.4], [-2.88, 1.62], [-1.2, 1.62], [-1.1, 2.3], [0.8, 2.3], [1.85, 1.68], [1.98, 1.3], [2.55, 1.22], [2.96, 1.0]], parts: skirtPair(1.68, -2.3, 2.0, 1.6, 0.55, 1.55) });
}
// Brummbär: the tall box casemate over the front half with the short 150 mm in its ball mount (5.93 x 2.88 m, 2.52 m).
{
  const m = mantlet(1.62, 1.95, 2.25, 1.85, 0.36, 0.3, 0, 2);
  G['brummbar'] = ww2({ ...PZ4, cls: 'assault-gun', turret: m, guns: [fire(m, 0.7, 0.15)], top: [[-2.96, 1.4], [-2.88, 1.62], [-0.7, 1.62], [-0.6, 2.5], [1.4, 2.5], [2.6, 1.5], [2.96, 1.05]], parts: skirtPair(1.62, -2.3, 2.0, 1.6, 0.55, 1.55) });
}
// Hummel and Nashorn on the lengthened Pz III/IV chassis: the tall open compartment at the back, the engine in the
// middle; Hummel the 150 mm howitzer (7.17 m overall), Nashorn the long 88 mm (8.44 m). Hull about 5.8 x 2.95 m, 2.8 m.
{
  const base: Ww2 = { ...PZ4, cls: 'sp-artillery', L: 5.8, W: 2.95, deck: 1.6, top: [[-2.9, 1.5], [-2.85, 1.6], [1.8, 1.6], [1.85, 1.3], [2.45, 1.22], [2.9, 1.0]], wheels: pairs([-1.6, -0.55, 0.55, 1.6], 0.55), track: trk(2.85, 0.95, 0.66, 0.52, 2.0), parts: [compartment(1.6, -2.9, 0.75, 2.6, 1.42, 1.5), part(1.6, [[1.4, 0.45], [2.0, 0.45]], [[1.4, 2.1], [2.0, 2.0]], 1.5, 12, -0.6)] };
  const m = mantlet(1.6, 0.7, 0.95, 2.1, 0.3, 0.22);
  G['hummel'] = ww2({ ...base, turret: m, guns: [fire(m, 3.2, 0.15)] });
  G['nashorn'] = ww2({ ...base, cls: 'tank-destroyer', turret: m, guns: [fire(m, 4.6, 0.088, { muzzle: true })] });
}

// ---------------------------------------------------------------- Panther and Tiger based

// Jagdpanther: the Panther's glacis carried up into the casemate roof, the 88 mm L/71 in a Saukopf low in it
// (6.87 x 3.42 m, 2.72 m high, 9.87 m with the gun).
{
  const m = mantlet(1.9, 1.1, 1.5, 1.95, 0.36, 0.22);
  G['jagdpanther'] = ww2({ ...PANTHER, cls: 'tank-destroyer', top: [[-3.44, 1.35], [-3.12, 1.9], [-2.0, 1.9], [-1.9, 2.55], [0.55, 2.55], [3.44, 0.92]], turret: m, guns: [fire(m, 4.95, 0.088, { muzzle: true })], parts: [...pantherSkirts, ...pantherExhaust(0.1, 1.0)] });
}
// Jagdtiger: the Tiger II hull lengthened, the great boxy casemate, the 128 mm L/55 (7.62 x 3.77 m, 2.95 m high, 10.65 m with the gun).
{
  const m = mantlet(1.95, 1.05, 1.45, 2.3, 0.38, 0.26);
  G['jagdtiger'] = ww2({ ...KT, cls: 'tank-destroyer', L: 7.62, W: 3.77, top: [[-3.81, 1.25], [-3.6, 1.95], [-3.45, 1.95], [-3.4, 2.9], [0.95, 2.9], [1.25, 1.95], [3.81, 0.98]], track: trk(3.72, 1.02, 0.72, 0.62, 2.3), wheels: even(9, -2.25, 2.25), turret: m, guns: [fire(m, 5.35, 0.128)], parts: [roofCupola(1.95, -2.4, 0.9, 2.9, 0.3, 0.1)] });
}
// Ferdinand / Elefant: the Porsche hull with six wheels in three bogies, the tall casemate at the back, the 88 mm
// L/71 from its front (6.8 x 3.38 m, 2.97 m high, 8.14 m with the gun); the Elefant adds a cupola and a hull machine gun.
{
  const m = mantlet(1.85, -0.2, 0.25, 2.3, 0.36, 0.24);
  const fer: Ww2 = {
    cls: 'tank-destroyer', L: 6.8, W: 3.38, deck: 1.85, fender: 0.95,
    top: [[-3.4, 2.3], [-3.3, 2.9], [-0.35, 2.9], [0.1, 1.85], [2.3, 1.8], [2.6, 1.5], [3.4, 1.05]],
    plan: [[-3.4, 1.62], [3.4, 1.65]], hullRound: 12,
    track: trk(3.35, 0.95, 0.58, 0.62, 2.3),
    wheels: pairs([-1.85, -0.1, 1.65], 0.75), r: 0.35,
    turret: m, guns: [fire(m, 4.35, 0.088)],
  };
  G['ferdinand'] = ww2(fer);
  G['elefant'] = ww2({ ...fer, parts: [roofCupola(1.85, -2.4, -0.7, 2.9, 0.3, 0.17), mantlet(1.85, 2.45, 2.62, 1.55, 0.12, 0.08, 0.5)] });
}
// Sturmtiger: the Tiger I hull with a big box casemate at the front and the stubby 380 mm rocket mortar
// (6.28 x 3.57 m, 2.85 m high).
{
  const m = mantlet(1.92, 2.3, 2.6, 2.05, 0.38, 0.38, 0.3, 2);
  G['sturmtiger'] = ww2({ ...TIGER, cls: 'assault-gun', L: 6.28, top: [[-3.14, 1.85], [-3.1, 1.92], [-0.4, 1.92], [-0.35, 2.85], [1.8, 2.85], [2.55, 1.65], [3.0, 1.22], [3.14, 1.05]], turret: m, guns: [fire(m, 0.35, 0.38)], parts: [...TIGER.parts!, part(1.92, [[-0.6, 0.06], [-0.2, 0.06]], [[-0.6, 3.3], [-0.2, 3.3]], 2.8, 12, 1.2)] });
}
// VK 45.01 (P), the Porsche Tiger: the Tiger I turret on Porsche's hull with three two-wheel bogies a side and the
// engine deck behind (6.7 x 3.14 m, 2.9 m).
G['tiger-p'] = ww2({
  cls: 'heavy-tank', L: 6.7, W: 3.14, deck: 1.85, fender: 0.95,
  top: [[-3.35, 1.4], [-3.25, 1.75], [-1.3, 1.8], [-1.2, 1.85], [2.4, 1.85], [2.5, 1.35], [3.35, 1.05]],
  plan: [[-3.35, 1.55], [3.35, 1.55]], hullRound: 12,
  track: trk(3.3, 0.95, 0.58, 0.62, 2.3),
  wheels: pairs([-1.85, -0.1, 1.65], 0.75), r: 0.35,
  turret: { ...TIGER_T, x: 0.45 }, gun: { length: 3.6, calibre: 0.088, muzzle: true, at: 0.5 },
  turretParts: (t) => [on(t, [[1.38, 0.8], [1.6, 0.78]], [[1.38, 0.8], [1.6, 0.76]], [[1.38, 0.08], [1.6, 0.12]], 10), cupola(t, -0.85, -0.5, 0.33, 0.3)],
});

// ---------------------------------------------------------------- Panzer II, Wespe

// Pz.Kpfw. II (Ausf. C-F): five road wheels on leaf springs, four return rollers, the small turret offset left with
// the 20 mm (4.81 x 2.22 m, 2.02 m high); Wespe: its chassis with the 105 mm in an open compartment at the back (2.3 m).
const PZ2: Ww2 = {
  cls: 'light-tank', L: 4.81, W: 2.22, deck: 1.45, fender: 0.75,
  top: [[-2.4, 1.2], [-2.3, 1.42], [1.4, 1.45], [1.5, 1.2], [2.4, 0.95]],
  plan: [[-2.4, 1.08], [2.4, 1.08]], hullRound: 14,
  track: trk(2.35, 0.78, 0.5, 0.45, 1.55),
  wheels: even(5, -1.55, 1.55), r: 0.275, rollers: [-1.2, -0.4, 0.4, 1.2],
};
G['pz-ii'] = ww2({ ...PZ2, turret: turret(0.3, [[-0.8, 0.55], [-0.7, 0.68], [0.6, 0.68], [0.75, 0.55]], [[-0.8, 0.52], [0.75, 0.55]], 12, 0.78, -0.12), gun: { length: 0.9, calibre: 0.02, at: 0.45 } });
{
  const m = mantlet(1.45, 0.25, 0.45, 1.8, 0.25, 0.2);
  G['wespe'] = ww2({ ...PZ2, cls: 'sp-artillery', top: [[-2.4, 1.2], [-2.3, 1.42], [1.4, 1.45], [1.5, 1.2], [2.4, 0.95]], turret: m, guns: [fire(m, 1.9, 0.105, { muzzle: true })], parts: [compartment(1.45, -2.4, 0.35, 2.2, 1.08, 1.3)] });
}

// ---------------------------------------------------------------- US light tanks

// M2A4 (1939): two VVSS bogies a side and the trailing idler on the ground, a tall box hull with sponsons, the
// seven-sided turret with the 37 mm (4.43 x 2.47 m, 2.65 m). M2A2: two machine-gun turrets side by side instead.
const M2: Ww2 = {
  cls: 'light-tank', L: 4.43, W: 2.47, deck: 1.85, fender: 0.95,
  top: [[-2.2, 1.55], [-2.1, 1.8], [1.0, 1.85], [1.6, 1.4], [2.2, 1.05]],
  plan: [[-2.2, 1.18], [2.2, 1.18]], hullRound: 14,
  track: [[-2.2, 0.0], [1.0, 0], [2.18, 0.72], [1.9, 0.98], [-1.5, 0.98], [-2.2, 0.35]],
  wheels: pairs([-0.95, 0.55], 0.52), r: 0.24,
  parts: vvss(2.47, [-0.95, 0.55], 1.85),
};
G['m2a4'] = ww2({ ...M2, turret: turret(0.0, [[-0.85, 0.6], [-0.6, 0.78], [0.55, 0.78], [0.85, 0.55]], [[-0.85, 0.68], [0.85, 0.7]], 10, 0.9), gun: { length: 1.25, calibre: 0.037, at: 0.45 } });
G['m2a2-light-tank'] = ww2({ ...M2, turret: turret(0.0, [[-0.5, 0.35], [-0.35, 0.48], [0.35, 0.48], [0.5, 0.35]], [[-0.5, 0.65], [0.5, 0.65]], 6, 0.5, -0.45), gun: { length: 0.8, calibre: 0.0127, at: 0.45 }, turretParts: (t) => [on(t, [[-0.5, 0.35], [-0.35, 0.48], [0.35, 0.48], [0.5, 0.35]], [[-0.5, 0.65], [0.5, 0.65]], 0, 6, 0.9)] });
// M3 / M3A1 Stuart: the M2A4 layout with the trailing idler, a taller hull and the rounded welded turret (4.53 x 2.24 m, 2.64 m).
G['m3-stuart'] = ww2({ ...M2, L: 4.53, W: 2.24, parts: vvss(2.24, [-0.95, 0.55], 1.85), turret: turret(0.0, [[-0.85, 0.55], [-0.6, 0.75], [0.55, 0.78], [0.85, 0.55]], [[-0.85, 0.58], [-0.5, 0.72], [0.5, 0.72], [0.85, 0.6]], 4, 0.92), gun: { length: 1.25, calibre: 0.037, at: 0.45 } });
// M5A1 Stuart: the new hull with its sloped glacis and raised engine deck, the turret with a radio bustle (4.84 x 2.29 m, 2.3 m).
G['m5a1-stuart'] = ww2({
  ...M2, L: 4.84, W: 2.29, deck: 1.6,
  top: [[-2.42, 1.4], [-2.3, 1.62], [0.0, 1.6], [1.85, 0.9], [2.42, 0.85]],
  plan: [[-2.42, 1.12], [2.42, 1.12]], hullRound: 12,
  track: [[-2.4, 0.0], [1.1, 0], [2.4, 0.72], [2.1, 0.98], [-1.6, 0.98], [-2.4, 0.35]],
  parts: vvss(2.29, [-0.95, 0.65], 1.6), wheels: pairs([-0.95, 0.65], 0.52),
  turret: turret(-0.1, [[-1.15, 0.5], [-0.95, 0.72], [0.5, 0.78], [0.85, 0.55]], [[-1.15, 0.55], [-0.5, 0.7], [0.5, 0.7], [0.85, 0.58]], 5, 0.92),
  gun: { length: 1.3, calibre: 0.037, at: 0.45 },
});

// ---------------------------------------------------------------- US medium and heavy

// M3 Lee: the tall riveted hull on the Sherman's VVSS, the 75 mm low in the right sponson, the 37 mm turret offset
// left with the machine-gun cupola on top (5.64 x 2.72 m, 3.12 m). Grant: the British turret with a bustle and no
// cupola (3.0 m).
{
  const sponson = mantlet(2.25, 1.7, 1.95, 1.6, 0.26, 0.2, 0.72, 4);
  const lee: Ww2 = {
    cls: 'medium-tank', L: 5.64, W: 2.72, deck: 2.25, fender: 1.02,
    top: [[-2.82, 1.75], [-2.7, 2.2], [0.5, 2.25], [1.6, 1.95], [2.5, 1.3], [2.82, 0.85]],
    plan: [[-2.82, 1.33], [2.4, 1.36], [2.82, 1.1]], hullRound: 12,
    track: [[-2.0, 0], [1.95, 0], [2.8, 0.78], [2.5, 1.02], [-2.4, 1.0], [-2.78, 0.42]],
    wheels: pairs([-1.45, 0.05, 1.55], 0.56), r: 0.255,
    parts: [sponson, ...vvss(2.72, [-1.45, 0.05, 1.55], 2.25)],
  };
  const t37 = turret(0.2, [[-0.75, 0.55], [-0.6, 0.72], [0.5, 0.72], [0.75, 0.5]], [[-0.75, 0.5], [0.75, 0.52]], 3, 0.8, -0.35);
  // The 37 mm in the turret, the 75 mm in the sponson (the first part).
  const guns: GunSpec[] = [{ mount: 'turret', length: 1.5, calibre: 0.037, at: 0.45 }, { ...fire(sponson, 1.7, 0.075), turret: 1 }];
  G['m3-lee'] = ww2({ ...lee, turret: t37, guns, parts: [...lee.parts!, cupola(t37, -0.1, 0, 0.36, 0.3)] });
  const tGrant = turret(0.2, [[-1.05, 0.5], [-0.85, 0.7], [0.5, 0.74], [0.75, 0.5]], [[-1.05, 0.55], [0.75, 0.58]], 3, 0.8, -0.35);
  G['grant'] = ww2({ ...lee, turret: tGrant, guns });
}
// M24 Chaffee: five road wheels on torsion bars, three return rollers, the sloped glacis, the turret with its thin
// 75 mm (hull 4.99 x 2.95 m, 2.47 m; 5.56 m with the gun).
const M24_T = turret(-0.2, [[-1.25, 0.62], [-1.05, 0.85], [0.55, 0.88], [1.0, 0.62], [1.1, 0.45]], [[-1.25, 0.5], [-0.9, 0.72], [0.5, 0.75], [1.1, 0.45]], 3.5, 1.15);
G['m24-chaffee'] = ww2({
  cls: 'light-tank', L: 4.99, W: 2.95, deck: 1.7, fender: 0.95,
  top: [[-2.5, 1.45], [-2.4, 1.68], [0.4, 1.7], [2.2, 0.95], [2.5, 0.85]],
  plan: [[-2.5, 1.45], [2.5, 1.45]], hullRound: 10,
  track: trk(2.45, 0.95, 0.66, 0.55, 1.75),
  wheels: even(5, -1.75, 1.75), r: 0.32, rollers: [-1.2, 0, 1.2],
  turret: M24_T, gun: { length: 2.1, calibre: 0.075, at: 0.45 },
  turretParts: (t) => [cupola(t, -0.3, -0.45, 0.3, 0.18)],
});
// M26 Pershing: six road wheels and five return rollers, the rear sprocket, the long hull with its sloped glacis,
// the big cast turret with the 90 mm and its brake (hull 6.33 x 3.51 m, 2.78 m; 8.65 m with the gun).
const M26_T = turret(-0.3, [[-1.85, 0.75], [-1.6, 1.15], [0.6, 1.25], [1.25, 0.95], [1.45, 0.6]], [[-1.85, 0.5], [-1.4, 0.75], [0.6, 0.8], [1.45, 0.5]], 3, 1.5);
const M26: Ww2 = {
  cls: 'heavy-tank', L: 6.33, W: 3.51, deck: 1.85, fender: 1.0,
  top: [[-3.165, 1.5], [-3.0, 1.85], [1.0, 1.85], [2.85, 0.95], [3.165, 0.85]],
  plan: [[-3.165, 1.72], [3.165, 1.72]], hullRound: 10,
  track: trk(3.1, 1.0, 0.6, 0.66, 2.35),
  wheels: even(6, -2.35, 2.35), r: 0.33, rollers: even(5, -2.0, 2.0),
  turret: M26_T,
};
G['m26-pershing'] = ww2({ ...M26, gun: { length: 4.25, calibre: 0.09, muzzle: true, at: 0.45 }, turretParts: (t) => [cupola(t, -0.6, 0.5, 0.32, 0.15)] });
// T26E4 "Super Pershing": the long 90 mm T15E2 balanced by a counterweight on the turret's back, and the boiler-plate
// armour bolted in a V over the hull front and the mantlet.
G['m26-super-pershing'] = ww2({ ...M26, gun: { length: 5.7, calibre: 0.09, muzzle: true, at: 0.45 }, parts: [part(1.85, [[1.2, 1.4], [3.2, 1.0]], [[1.2, 1.95], [3.2, 1.0]], [[1.2, 1.7], [3.2, 0.75]], 6)], turretParts: (t) => [cupola(t, -0.6, 0.5, 0.32, 0.15), on(t, [[-2.4, 0.45], [-1.85, 0.45]], [[-2.4, 0.55], [-1.85, 0.55]], 0.15, 8), on(t, [[1.45, 0.95], [1.75, 0.5]], [[1.45, 0.85], [1.75, 0.7]], 0.05, 6)] });
// M6A1 heavy tank: a tall hull on four paired bogies, the big cast turret with the 3-inch gun (7.54 x 3.12 m, 2.95 m; 8.43 m with the gun).
G['m6a1'] = ww2({
  cls: 'heavy-tank', L: 7.54, W: 3.12, deck: 2.1, fender: 1.05,
  top: [[-3.77, 1.7], [-3.6, 2.1], [1.0, 2.1], [2.2, 1.85], [3.3, 1.2], [3.77, 0.95]],
  plan: [[-3.77, 1.52], [3.77, 1.52]], hullRound: 10,
  track: trk(3.72, 1.05, 0.72, 0.6, 2.9),
  wheels: pairs([-2.5, -0.85, 0.85, 2.5], 0.6), r: 0.3, rollers: [-2.5, -0.85, 0.85, 2.5],
  turret: turret(0.0, [[-1.6, 0.9], [-1.3, 1.25], [0.6, 1.3], [1.3, 0.9], [1.45, 0.55]], [[-1.6, 0.55], [-1.2, 0.8], [0.6, 0.85], [1.45, 0.5]], 3, 1.5),
  gun: { length: 3.15, calibre: 0.076, at: 0.45 },
  turretParts: (t) => [cupola(t, -0.5, -0.55, 0.32, 0.2)],
});
// M10 GMC (Wolverine): the M4A2 chassis with sloped upper hull sides, the open five-sided turret with its big
// counterweights hung on the back, the 3-inch gun (5.97 x 3.05 m, 2.57 m; 6.83 m with the gun). M36: a rounder open
// turret with a bustle and the 90 mm (7.47 m).
const M10: Ww2 = {
  cls: 'tank-destroyer', L: 5.97, W: 3.05, deck: 1.8, fender: 1.02,
  top: [[-2.98, 1.5], [-2.8, 1.75], [0.6, 1.8], [2.4, 1.15], [2.7, 1.0], [2.98, 0.78]],
  under: [[-2.98, 1.05], [2.5, 1.05], [2.98, 0.6]],
  plan: [[-2.98, 1.45], [2.4, 1.5], [2.98, 1.1]], hullRound: 5,
  track: [[-2.05, 0], [2.0, 0], [2.96, 0.78], [2.66, 1.02], [-2.6, 1.0], [-2.94, 0.42]],
  wheels: pairs([-1.6, -0.08, 1.45], 0.56), r: 0.255,
  parts: vvss(3.05, [-1.6, -0.08, 1.45], 1.8),
};
G['m10-gmc'] = ww2({ ...M10, turret: turret(0.1, [[-1.0, 0.75], [-0.6, 1.05], [0.5, 1.05], [1.1, 0.6]], [[-1.0, 0.75], [1.1, 0.72]], 16, 1.15), gun: { length: 2.65, calibre: 0.076, at: 0.45 }, turretParts: (t) => [-1, 1].map((s) => on(t, [[-1.85, 0.32], [-1.0, 0.32]], [[-1.85, 0.6], [-1.0, 0.6]], 0.05, 10, s * 0.55)) });
G['m36-jackson'] = ww2({ ...M10, turret: turret(0.05, [[-1.6, 0.6], [-1.3, 1.0], [0.5, 1.1], [1.1, 0.75], [1.2, 0.55]], [[-1.6, 0.68], [1.2, 0.68]], 5, 1.25), gun: { length: 3.25, calibre: 0.09, muzzle: true, at: 0.45 } });
// M18 Hellcat: low and fast - five road wheels and four return rollers on torsion bars, the front sprocket, a long
// low hull, the open turret with the 76 mm and its brake (hull 5.28 x 2.87 m, 2.58 m; 6.65 m with the gun).
G['m18-hellcat'] = ww2({
  cls: 'tank-destroyer', L: 5.28, W: 2.87, deck: 1.6, fender: 0.92,
  top: [[-2.64, 1.35], [-2.5, 1.6], [0.5, 1.62], [2.2, 1.0], [2.64, 0.85]],
  plan: [[-2.64, 1.42], [2.64, 1.4]], hullRound: 10,
  track: trk(2.6, 0.92, 0.65, 0.55, 1.85),
  wheels: even(5, -1.85, 1.85), r: 0.33, rollers: even(4, -1.6, 1.6),
  turret: turret(0.05, [[-1.3, 0.7], [-1.1, 1.1], [0.6, 1.2], [1.15, 0.8], [1.25, 0.55]], [[-1.3, 0.8], [1.25, 0.75]], 6, 1.3),
  gun: { length: 2.65, calibre: 0.076, muzzle: true, at: 0.45 },
});
// More Shermans: the 76 mm T23 turret on the cast M4A1 hull and the welded M4A2; the M4A3 with the short 105 mm howitzer; the Jumbo with the 76 mm.
G['m4a1-76'] = sherman({ L: 5.84, glacisX: 1.1, cast: true, turret: SHERMAN_T23, gun: GUN_76 });
G['m4a2-76'] = sherman({ L: 5.94, glacisX: 1.45, turret: SHERMAN_T23, gun: GUN_76, extra: [-1, 1].map((s) => part(1.9, [[-3.12, 0.3], [-2.97, 0.3]], [[-3.12, 1.25], [-2.97, 1.25]], 0.85, 6, s * 0.6)) });
G['m4a3-105'] = sherman({ L: 5.88, glacisX: 1.45, turret: SHERMAN_T75, gun: { length: 1.6, calibre: 0.105, at: 0.48 }, extra: [-1, 1].map((s) => part(1.9, [[1.3, 0.32], [1.75, 0.32]], [[1.3, 2.02], [1.75, 1.95]], 1.85, 6, s * 0.55)) });
G['m4a3e2-76'] = sherman({ L: 5.9, W: 2.97, glacisX: 1.1, deck: 1.95, turret: JUMBO_T, gun: GUN_76, extra: [part(1.95, [[1.1, 1.2], [2.6, 1.2]], [[1.1, 2.0], [2.6, 1.3]], 1.35, 10)], turretParts: (t) => [on(t, [[1.2, 0.62], [1.42, 0.58]], [[1.2, 0.68], [1.42, 0.64]], 0.1, 8)] });
// LVT-4 and LVT(A)-1 amphibians: the long boat hull with the grousered tracks run round its sides, the track's front
// rising like a bow (7.97 x 3.25 m, 2.5 m); the LVT(A)-1 with a turret and its 37 mm, the LVT-4 here with a ZiS-2 on top.
{
  const lvt: Ww2 = {
    cls: 'apc-tracked', L: 7.97, W: 3.25, deck: 2.0, fender: 0.6,
    top: [[-3.98, 1.6], [-3.9, 2.0], [2.8, 2.0], [3.98, 1.25]],
    plan: [[-3.98, 1.05], [3.98, 1.0]], hullRound: 10,
    track: [[-3.3, 0], [3.2, 0], [3.95, 1.1], [3.6, 1.65], [-3.7, 1.65], [-3.98, 0.9]],
    wheels: [], r: 0.2, solid: true,
  };
  G['lvt-a1'] = ww2({ ...lvt, cls: 'light-tank', turret: turret(0.6, [[-0.85, 0.55], [-0.6, 0.75], [0.55, 0.78], [0.85, 0.55]], [[-0.85, 0.58], [0.85, 0.6]], 4, 0.9), gun: { length: 1.4, calibre: 0.037, at: 0.45 } });
  const m = mantlet(2.0, 1.5, 1.75, 2.45, 0.2, 0.15);
  G['lvt-4-zis-2'] = ww2({ ...lvt, turret: m, guns: [fire(m, 2.8, 0.057)], parts: [part(2.0, [[1.65, 0.75], [1.72, 0.75]], [[1.65, 2.75], [1.72, 2.75]], 2.0, 16)] });
}

// ---------------------------------------------------------------- Soviet, more

// T-34-57: the long, thin ZiS-4 57 mm on the early and the hexagonal turret.
G['t-34-57'] = t34(5.92, T34_EARLY, { length: 3.0, calibre: 0.057, at: 0.45 }, false);
G['t-34-57-1943'] = t34(5.92, T34_HEX, { length: 3.0, calibre: 0.057, at: 0.45 }, true, (t) => [cupola(t, -0.45, -0.5, 0.32, 0.22)]);
// SU-85, SU-100, SU-122 on the T-34: the glacis carried up into the casemate roof, the gun low in it; SU-85
// 8.15 m with the gun and 2.45 m high, SU-100 9.45 m and 2.25 m with the commander's cupola on the right, SU-122 the
// short 122 mm howitzer in its bell mantlet (6.95 m, 2.32 m). Hull 6.1 x 3.0 m.
function su34(gun: GunSpec, cupolaRight: boolean, r = 0.32): GroundSpec & { cls: string } {
  const m = mantlet(1.5, 1.2, 1.55, 1.55, r, r * 0.65);
  const g = { ...fire(m, gun.length, gun.calibre), muzzle: gun.muzzle };
  const base = t34(6.1, m, undefined, true);
  return { ...base, cls: gun.calibre > 0.11 ? 'sp-gun' : 'tank-destroyer', guns: [g], hullOutline: { ...base.hullOutline!, top: [[-3.05, 1.05], [-2.65, 1.5], [-1.4, 1.5], [-1.3, 2.15], [0.2, 2.2], [3.05, 0.62]] }, turrets: [...(base.turrets ?? []), ...(cupolaRight ? [roofCupola(1.5, -0.5, 0.75, 2.18, 0.3, 0.15)] : [])] };
}
G['su-85'] = su34({ mount: 'turret', length: 3.55, calibre: 0.085 }, false);
G['su-100'] = su34({ mount: 'turret', length: 4.85, calibre: 0.1 }, true);
G['su-122'] = su34({ mount: 'turret', length: 1.2, calibre: 0.122 }, false, 0.42);
// SU-152 on the KV-1S hull: the tall box casemate over its front, the ML-20S with its brake in a big box mantlet (8.95 m, 2.45 m).
{
  const m = mantlet(1.6, 2.0, 2.4, 1.85, 0.4, 0.3, 0, 8);
  G['su-152'] = ww2({ ...KV, cls: 'sp-gun', W: 3.25, deck: 1.6, top: [[-3.37, 1.05], [-2.9, 1.48], [-2.0, 1.55], [-1.9, 2.45], [1.6, 2.45], [2.75, 1.25], [3.37, 1.05]], turret: m, guns: [fire(m, 2.55, 0.152, { muzzle: true })] });
}
// ISU-152, ISU-122, ISU-122S on the IS hull: a taller casemate, its sloped front set back from the glacis, the gun right
// of the centre (ISU-152 9.18 m, ISU-122 9.85 m with the long A-19S, ISU-122S the D-25S with its brake; 2.48 m high).
{
  const m = mantlet(1.6, 1.35, 1.75, 1.9, 0.38, 0.28, 0.25);
  const isu = { ...IS, cls: 'sp-gun', top: [[-3.385, 1.15], [-3.1, 1.6], [-2.2, 1.6], [-2.1, 2.45], [1.0, 2.45], [1.9, 1.6], [3.385, 0.98]] as P2[], turret: m };
  G['isu-152'] = ww2({ ...isu, guns: [fire(m, 4.05, 0.152, { muzzle: true })] });
  G['isu-122'] = ww2({ ...isu, cls: 'tank-destroyer', guns: [fire(m, 4.7, 0.122)] });
  G['isu-122s'] = ww2({ ...isu, cls: 'tank-destroyer', guns: [fire(m, 4.7, 0.122, { muzzle: true })] });
}
// T-44: five road wheels on torsion bars, no return rollers, the single glacis plate, the turret set well back with
// the 85 mm (hull 6.07 x 3.18 m, 2.41 m; 7.65 m with the gun).
G['t-44'] = ww2({
  cls: 'medium-tank', L: 6.07, W: 3.18, deck: 1.55, fender: 0.98,
  top: [[-3.035, 1.15], [-2.8, 1.55], [1.1, 1.55], [3.035, 0.65]],
  plan: [[-3.035, 1.55], [3.035, 1.55]], hullRound: 8,
  track: trk(3.0, 0.98, 0.55, 0.6, 2.3),
  wheels: even(5, -2.15, 2.15), r: 0.42,
  turret: turret(-0.3, [[-1.6, 0.85], [-1.25, 1.28], [0.7, 1.32], [1.35, 0.95], [1.5, 0.55]], [[-1.6, 0.5], [-1.1, 0.82], [0.6, 0.88], [1.5, 0.5]], 3, 1.55),
  gun: { length: 3.35, calibre: 0.085, at: 0.45 },
  turretParts: (t) => [cupola(t, -0.75, -0.55, 0.34, 0.22)],
});
// KV-85 and KV-122: the IS turret on the KV-1S hull, with the 85 mm or the 122 mm.
G['kv-85'] = ww2({ ...KV, W: 3.25, deck: 1.6, top: G['kv-1s'].hullOutline!.top, turret: IS_T, gun: { length: 3.4, calibre: 0.085, at: 0.45 }, turretParts: isParts });
G['kv-122'] = ww2({ ...KV, W: 3.25, deck: 1.6, top: G['kv-1s'].hullOutline!.top, turret: IS_T, gun: { length: 4.7, calibre: 0.122, muzzle: true, at: 0.45 }, turretParts: isParts });
// ZiS-30: the 57 mm ZiS-2 with its shield set up on a Komsomolets tractor (3.45 x 1.86 m, 2.23 m).
{
  const m = mantlet(1.1, 0.2, 0.45, 1.75, 0.2, 0.15);
  G['zis-30'] = ww2({ cls: 'tank-destroyer', L: 3.45, W: 1.86, deck: 1.1, fender: 0.6, top: [[-1.72, 0.95], [-1.6, 1.1], [0.9, 1.15], [1.72, 0.75]], plan: [[-1.72, 0.92], [1.72, 0.92]], hullRound: 12, track: trk(1.7, 0.62, 0.42, 0.42, 1.0), wheels: pairs([-0.6, 0.6], 0.45), r: 0.2, turret: m, guns: [fire(m, 2.8, 0.057)], parts: [part(1.1, [[0.35, 0.75], [0.42, 0.75]], [[0.35, 2.1], [0.42, 2.1]], 1.35, 16)] });
}
// T-70: five road wheels, three return rollers, a sloped glacis, the small turret offset left with the 45 mm
// (4.29 x 2.32 m, 2.04 m); T-60: four road wheels, the turret with the 20 mm (4.1 x 2.3 m, 1.75 m).
G['t-70'] = ww2({
  cls: 'light-tank', L: 4.29, W: 2.32, deck: 1.45, fender: 0.75,
  top: [[-2.145, 1.25], [-2.05, 1.42], [0.5, 1.45], [1.6, 1.05], [2.145, 0.85]],
  plan: [[-2.145, 1.12], [2.145, 1.12]], hullRound: 12,
  track: trk(2.1, 0.78, 0.5, 0.45, 1.55),
  wheels: even(5, -1.55, 1.55), r: 0.26, rollers: [-1.0, 0, 1.0],
  turret: turret(0.2, [[-0.8, 0.6], [-0.65, 0.72], [0.55, 0.72], [0.8, 0.55]], [[-0.8, 0.55], [0.8, 0.55]], 10, 0.85, -0.25),
  gun: { length: 1.4, calibre: 0.045, at: 0.45 },
});
G['t-60'] = ww2({
  cls: 'light-tank', L: 4.1, W: 2.3, deck: 1.32, fender: 0.72,
  top: [[-2.05, 1.15], [-1.95, 1.3], [0.5, 1.32], [1.5, 1.0], [2.05, 0.8]],
  plan: [[-2.05, 1.1], [2.05, 1.1]], hullRound: 12,
  track: trk(2.0, 0.75, 0.48, 0.45, 1.4),
  wheels: even(4, -1.3, 1.3), r: 0.25, rollers: [-0.8, 0, 0.8],
  turret: turret(0.3, [[-0.7, 0.55], [-0.55, 0.65], [0.5, 0.65], [0.7, 0.5]], [[-0.7, 0.45], [0.7, 0.45]], 10, 0.75, -0.25),
  gun: { length: 1.2, calibre: 0.02, at: 0.45 },
});
// BT-7 (1937): four big Christie wheels, the narrow pointed nose, the conical turret with a bustle and the 45 mm
// (5.66 x 2.29 m, 2.42 m); BT-5: the earlier upright cylindrical turret.
const BT: Ww2 = {
  cls: 'light-tank', L: 5.66, W: 2.29, deck: 1.55, fender: 0.9,
  top: [[-2.83, 1.25], [-2.7, 1.55], [1.6, 1.55], [2.3, 1.25], [2.83, 0.95]],
  plan: [[-2.83, 1.12], [1.6, 1.14], [2.6, 0.8], [2.83, 0.6]], hullRound: 12,
  track: trk(2.8, 0.92, 0.5, 0.5, 2.0),
  wheels: even(4, -1.95, 1.75), r: 0.41,
  gun: { length: 1.6, calibre: 0.045, at: 0.45 },
};
G['bt-7'] = ww2({ ...BT, turret: turret(0.35, [[-1.25, 0.5], [-1.0, 0.85], [0.6, 0.92], [0.95, 0.75], [1.05, 0.55]], [[-1.25, 0.5], [-0.8, 0.62], [0.6, 0.65], [1.05, 0.55]], 3, 1.05) });
G['bt-5'] = ww2({ ...BT, turret: turret(0.35, [[-1.25, 0.5], [-1.0, 0.85], [0.6, 0.92], [0.95, 0.75], [1.05, 0.55]], [[-1.25, 0.62], [1.05, 0.62]], 7, 1.05) });
// T-26 (1939): eight small road wheels in leaf-sprung pairs, four return rollers, the turret with its bustle and the
// 45 mm (4.65 x 2.44 m, 2.33 m).
G['t-26'] = ww2({
  cls: 'light-tank', L: 4.65, W: 2.44, deck: 1.65, fender: 0.78,
  top: [[-2.325, 1.35], [-2.2, 1.6], [1.2, 1.65], [1.5, 1.35], [2.325, 1.0]],
  plan: [[-2.325, 1.18], [2.325, 1.18]], hullRound: 14,
  track: trk(2.3, 0.8, 0.55, 0.48, 1.6),
  wheels: pairs([-1.35, -0.5, 0.5, 1.35], 0.42), r: 0.18, rollers: [-1.3, -0.45, 0.45, 1.3],
  turret: turret(0.0, [[-1.3, 0.5], [-1.05, 0.85], [0.55, 0.9], [0.9, 0.7], [1.0, 0.5]], [[-1.3, 0.55], [1.0, 0.6]], 5, 1.0, 0.2),
  gun: { length: 1.5, calibre: 0.045, at: 0.45 },
});
// T-28: a long hull with skirts over its twelve small wheels, the main turret and two machine-gun turrets ahead of it
// (7.44 x 2.81 m, 2.82 m). T-35: five turrets on a still longer hull - the main one raised in the middle, two 45 mm
// turrets and two machine-gun turrets at the corners (9.72 x 3.2 m, 3.43 m).
{
  const mg = (x: number, s: number, r: number, h: number): TurretSpec => ({ ...turret(x, circle(0, r), [[-r, h], [r, h]], 4, r), side: s });
  G['t-28'] = ww2({
    cls: 'medium-tank', L: 7.44, W: 2.81, deck: 1.95, fender: 0.5,
    top: [[-3.72, 1.6], [-3.55, 1.95], [3.2, 1.95], [3.72, 1.2]],
    plan: [[-3.72, 1.02], [3.72, 1.0]], hullRound: 12,
    track: [[-3.0, 0], [3.0, 0], [3.7, 0.8], [3.4, 1.3], [-3.5, 1.3], [-3.72, 0.75]],
    wheels: [], r: 0.2, solid: true,
    turret: turret(0.0, [[-1.4, 0.6], [-1.1, 1.0], [0.7, 1.05], [1.15, 0.65]], [[-1.4, 0.85], [1.15, 0.85]], 4, 1.2),
    gun: { length: 1.1, calibre: 0.076, at: 0.45 },
    turretParts: () => [mg(2.3, -0.65, 0.42, 0.62), mg(2.3, 0.65, 0.42, 0.62)].map((t) => ({ ...t, up: 0 })),
  });
  G['t-35'] = ww2({
    cls: 'heavy-tank', L: 9.72, W: 3.2, deck: 2.0, fender: 0.5,
    top: [[-4.86, 1.7], [-4.7, 2.0], [3.5, 2.0], [4.3, 1.6], [4.86, 1.2]],
    plan: [[-4.86, 1.15], [4.86, 1.1]], hullRound: 12,
    track: [[-4.0, 0], [4.0, 0], [4.85, 0.85], [4.55, 1.35], [-4.6, 1.35], [-4.86, 0.8]],
    wheels: [], r: 0.2, solid: true,
    turret: { ...turret(-0.2, [[-1.4, 0.6], [-1.1, 1.0], [0.7, 1.05], [1.15, 0.65]], [[-1.4, 0.85], [1.15, 0.85]], 4, 1.2), up: 0.55 },
    guns: [{ mount: 'turret', length: 1.1, calibre: 0.076, at: 0.45 }, { mount: 'turret', turret: 1, length: 1.5, calibre: 0.045, at: 0.45 }, { mount: 'turret', turret: 2, length: 1.5, calibre: 0.045, at: 0.45 }],
    turretParts: () => [{ ...turret(2.4, [[-0.8, 0.5], [-0.6, 0.72], [0.5, 0.75], [0.8, 0.55]], [[-0.8, 0.6], [0.8, 0.62]], 5, 0.8), side: 0.75 }, { ...turret(-2.6, [[-0.8, 0.5], [-0.6, 0.72], [0.5, 0.75], [0.8, 0.55]], [[-0.8, 0.6], [0.8, 0.62]], 5, 0.8), side: -0.75 }, mg(2.4, -0.75, 0.4, 0.6), mg(-2.6, 0.75, 0.4, 0.6), part(2.0, circle(-0.2, 1.0), [[-1.2, 2.6], [0.8, 2.6]], 1.95, 6)],
  });
}
// SU-76M: the lengthened T-70 chassis - six road wheels, three return rollers - with the ZiS-3 in an open compartment
// at the back (5.0 x 2.72 m, 2.1 m).
{
  const m = mantlet(1.25, 0.25, 0.5, 1.6, 0.25, 0.18);
  G['su-76m'] = ww2({ cls: 'sp-gun', L: 5.0, W: 2.72, deck: 1.25, fender: 0.75, top: [[-2.5, 1.15], [-2.4, 1.25], [0.3, 1.25], [1.6, 1.0], [2.5, 0.8]], plan: [[-2.5, 1.3], [2.5, 1.3]], hullRound: 12, track: trk(2.45, 0.78, 0.5, 0.45, 1.9), wheels: even(6, -1.9, 1.9), r: 0.26, rollers: [-1.2, 0, 1.2], turret: m, guns: [fire(m, 2.6, 0.076, { muzzle: true })], parts: [compartment(1.25, -2.5, 0.35, 2.05, 1.25, 1.15)] });
}

// ---------------------------------------------------------------- British, more

// Crusader: five big Christie wheels, a long low hull, the many-faceted turret; Mk II with the 2-pounder and the
// machine-gun turret at the front left (5.99 x 2.64 m, 2.24 m), Mk III the 6-pounder and no hull turret.
const CRUSADER: Ww2 = {
  cls: 'medium-tank', L: 5.99, W: 2.64, deck: 1.5, fender: 0.95,
  top: [[-3.0, 1.25], [-2.9, 1.5], [1.6, 1.5], [1.7, 1.3], [2.4, 1.25], [3.0, 0.95]],
  plan: [[-3.0, 1.3], [3.0, 1.3]], hullRound: 14,
  track: trk(2.95, 0.95, 0.55, 0.6, 2.15),
  wheels: even(5, -2.0, 2.0), r: 0.4,
  turret: turret(0.1, [[-1.05, 0.6], [-0.85, 0.85], [0.35, 0.9], [0.9, 0.7], [1.05, 0.4]], [[-1.05, 0.55], [0.4, 0.65], [1.05, 0.45]], 10, 1.05),
};
G['crusader-ii'] = ww2({ ...CRUSADER, gun: { length: 1.5, calibre: 0.04, at: 0.45 }, parts: [part(1.5, circle(2.0, 0.38), [[1.62, 1.95], [2.38, 1.95]], 1.4, 5, -0.55)] });
G['crusader-iii'] = ww2({ ...CRUSADER, gun: { length: 2.2, calibre: 0.057, at: 0.45 } });
// Cruiser Mk IV (A13 Mk II): four big Christie wheels, the turret with its spaced, sloping faces (6.0 x 2.59 m, 2.59 m).
G['a13-cruiser'] = ww2({ ...CRUSADER, L: 6.0, W: 2.59, deck: 1.65, top: [[-3.0, 1.4], [-2.9, 1.65], [1.8, 1.65], [1.9, 1.35], [3.0, 1.0]], wheels: even(4, -1.9, 1.9), turret: turret(0.1, [[-1.1, 0.55], [-0.8, 0.95], [0.4, 0.95], [1.0, 0.55], [1.1, 0.4]], [[-1.1, 0.6], [1.1, 0.6]], 10, 1.1), gun: { length: 1.4, calibre: 0.04, at: 0.45 } });
// Matilda II: skirts with their mud chutes over the running gear, the track running along their top, the cast hull
// with its rounded nose, the small cast turret (5.61 x 2.59 m, 2.52 m).
G['matilda-ii'] = ww2({
  cls: 'medium-tank', L: 5.61, W: 2.59, deck: 1.6, fender: 0.4,
  top: [[-2.8, 1.35], [-2.7, 1.6], [1.9, 1.6], [2.4, 1.3], [2.8, 0.9]],
  plan: [[-2.8, 0.85], [2.8, 0.85]], hullRound: 4,
  track: [[-2.3, 0], [2.3, 0], [2.8, 0.7], [2.5, 1.18], [-2.5, 1.18], [-2.8, 0.7]],
  wheels: [], r: 0.2, solid: true,
  turret: turret(0.25, [[-1.0, 0.6], [-0.8, 0.82], [0.6, 0.85], [0.95, 0.6]], [[-1.0, 0.6], [0.95, 0.6]], 4, 1.0),
  gun: { length: 1.3, calibre: 0.04, at: 0.45 },
});
// Valentine: six road wheels in two three-wheel bogies, three return rollers, the low hull and the small turret
// (5.41 x 2.63 m, 2.27 m); 2-pounder (Mk I-VII), 6-pounder (Mk IX), 75 mm (Mk XI). Archer: its chassis with the
// 17-pounder pointing back over the engine from a low open casemate.
const VALENTINE: Ww2 = {
  cls: 'light-tank', L: 5.41, W: 2.63, deck: 1.65, fender: 0.88,
  top: [[-2.7, 1.35], [-2.6, 1.6], [1.4, 1.65], [1.7, 1.45], [2.3, 1.25], [2.7, 0.95]],
  plan: [[-2.7, 1.25], [2.7, 1.25]], hullRound: 12,
  track: trk(2.65, 0.9, 0.55, 0.55, 1.95),
  wheels: [-1.95, -1.3, -0.65, 0.65, 1.3, 1.95], r: 0.27, rollers: [-1.0, 0, 1.0],
  turret: turret(0.0, [[-0.95, 0.62], [-0.8, 0.78], [0.6, 0.8], [0.85, 0.62]], [[-0.95, 0.6], [0.85, 0.6]], 10, 0.9),
};
G['valentine'] = ww2({ ...VALENTINE, gun: { length: 1.3, calibre: 0.04, at: 0.45 } });
G['valentine-ix'] = ww2({ ...VALENTINE, gun: { length: 2.1, calibre: 0.057, at: 0.45 } });
G['valentine-xi'] = ww2({ ...VALENTINE, gun: { length: 1.9, calibre: 0.075, at: 0.45 } });
{
  const m = mantlet(1.65, -0.85, -0.6, 1.75, 0.22, 0.18);
  G['valentine-archer'] = ww2({ ...VALENTINE, cls: 'tank-destroyer', turret: m, guns: [fire(m, 3.3, 0.076, { elevation: Math.PI - 0.02, muzzle: true })], parts: [compartment(1.65, -0.5, 2.3, 2.15, 1.2, 1.4)] });
}
// Tetrarch: four big road wheels and no return rollers, the small turret with the 2-pounder (4.11 x 2.31 m, 2.12 m).
G['tetrarch'] = ww2({
  cls: 'light-tank', L: 4.11, W: 2.31, deck: 1.45, fender: 0.95,
  top: [[-2.055, 1.25], [-1.95, 1.45], [1.2, 1.45], [1.5, 1.2], [2.055, 1.0]],
  plan: [[-2.055, 1.12], [2.055, 1.12]], hullRound: 12,
  track: trk(2.0, 0.98, 0.5, 0.5, 1.5),
  wheels: even(4, -1.5, 1.5), r: 0.44,
  turret: turret(0.0, [[-0.85, 0.65], [-0.7, 0.8], [0.6, 0.8], [0.85, 0.6]], [[-0.85, 0.62], [0.85, 0.62]], 10, 0.9),
  gun: { length: 1.3, calibre: 0.04, at: 0.45 },
});

// ---------------------------------------------------------------- Japanese

// Type 97 Chi-Ha: six road wheels (the outer two on bell cranks, the middle four in pairs), a riveted hull with its
// raised superstructure, the small turret right of the centre with its tall cupola and the short 57 mm
// (5.52 x 2.33 m, 2.23 m). Chi-Ha Kai: the bigger turret with a bustle and the 47 mm.
const CHIHA: Ww2 = {
  cls: 'medium-tank', L: 5.52, W: 2.33, deck: 1.55, fender: 0.82,
  top: [[-2.76, 1.3], [-2.65, 1.5], [0.9, 1.55], [1.4, 1.4], [2.3, 1.15], [2.76, 0.95]],
  plan: [[-2.76, 1.12], [2.76, 1.12]], hullRound: 14,
  track: trk(2.72, 0.85, 0.6, 0.45, 2.0),
  wheels: [-1.95, -0.95, -0.4, 0.4, 0.95, 1.95], r: 0.27, rollers: [-1.5, -0.5, 0.5, 1.5],
};
G['type-97-chi-ha'] = ww2({ ...CHIHA, turret: turret(0.3, [[-0.9, 0.65], [-0.7, 0.78], [0.55, 0.8], [0.85, 0.6]], [[-0.9, 0.55], [0.85, 0.58]], 6, 0.9, 0.2), gun: { length: 0.8, calibre: 0.057, at: 0.45 }, turretParts: (t) => [cupola(t, -0.2, 0, 0.3, 0.18)] });
const CHIHA_KAI_T = turret(0.2, [[-1.2, 0.6], [-1.0, 0.8], [0.55, 0.82], [0.85, 0.6]], [[-1.2, 0.6], [0.85, 0.62]], 8, 0.9, 0.2);
G['type-97-chi-ha-kai'] = ww2({ ...CHIHA, turret: CHIHA_KAI_T, gun: { length: 1.6, calibre: 0.047, at: 0.45 } });
// Type 1 Chi-He: the welded, angular hull with its single sloped front and the Kai's turret (5.73 x 2.33 m, 2.38 m).
// Type 3 Chi-Nu: the Chi-He with a big hexagonal turret and the 75 mm (2.61 m).
const CHIHE: Ww2 = { ...CHIHA, L: 5.73, deck: 1.6, top: [[-2.865, 1.35], [-2.75, 1.6], [1.0, 1.62], [2.865, 0.95]], track: trk(2.82, 0.85, 0.6, 0.45, 2.05) };
G['type-1-chi-he'] = ww2({ ...CHIHE, turret: CHIHA_KAI_T, gun: { length: 1.6, calibre: 0.047, at: 0.45 } });
G['type-3-chi-nu'] = ww2({ ...CHIHE, turret: turret(0.1, [[-1.25, 0.7], [-0.9, 1.0], [0.6, 1.0], [1.0, 0.7]], [[-1.25, 0.72], [1.0, 0.72]], 16, 1.05), gun: { length: 2.5, calibre: 0.075, at: 0.45 }, turretParts: (t) => [cupola(t, -0.4, 0.4, 0.3, 0.15)] });
// Type 4 Chi-To: seven road wheels, a big welded turret with the long 75 mm (6.42 x 2.87 m, 2.87 m).
G['type-4-chi-to'] = ww2({
  cls: 'medium-tank', L: 6.42, W: 2.87, deck: 1.85, fender: 0.92,
  top: [[-3.21, 1.55], [-3.1, 1.85], [1.0, 1.85], [3.21, 1.0]],
  plan: [[-3.21, 1.4], [3.21, 1.4]], hullRound: 12,
  track: trk(3.15, 0.92, 0.6, 0.55, 2.5),
  wheels: even(7, -2.45, 2.45), r: 0.3, rollers: [-1.5, 0, 1.5],
  turret: turret(-0.1, [[-1.5, 0.85], [-1.2, 1.15], [0.7, 1.2], [1.2, 0.85], [1.3, 0.6]], [[-1.5, 0.85], [1.3, 0.82]], 12, 1.35),
  gun: { length: 3.6, calibre: 0.075, at: 0.45 },
  turretParts: (t) => [cupola(t, -0.6, -0.5, 0.32, 0.17)],
});
// Type 95 Ha-Go: four road wheels in two bell-crank pairs, two return rollers, the small turret left of the centre
// with its 37 mm (4.38 x 2.06 m, 2.13 m).
G['type-95-ha-go'] = ww2({
  cls: 'light-tank', L: 4.38, W: 2.06, deck: 1.5, fender: 0.8,
  top: [[-2.19, 1.25], [-2.1, 1.45], [0.8, 1.5], [1.3, 1.35], [2.19, 0.95]],
  plan: [[-2.19, 1.0], [2.19, 1.0]], hullRound: 14,
  track: trk(2.15, 0.82, 0.55, 0.45, 1.4),
  wheels: pairs([-0.95, 0.95], 0.85), r: 0.3, rollers: [-0.5, 0.5],
  turret: turret(0.3, [[-0.75, 0.55], [-0.6, 0.65], [0.45, 0.65], [0.7, 0.5]], [[-0.75, 0.6], [0.7, 0.62]], 6, 0.75, -0.2),
  gun: { length: 1.0, calibre: 0.037, at: 0.45 },
});

// ---------------------------------------------------------------- Italian and French

// Fiat M13/40 (and M14/41): eight small road wheels in two four-wheel bogies, a riveted box hull, the turret with the
// 47/32 (4.92 x 2.2 m, 2.37 m).
G['fiat-m13-40'] = ww2({
  cls: 'medium-tank', L: 4.92, W: 2.2, deck: 1.55, fender: 0.72,
  top: [[-2.46, 1.3], [-2.35, 1.5], [0.9, 1.55], [1.4, 1.4], [2.0, 1.25], [2.46, 0.95]],
  plan: [[-2.46, 1.08], [2.46, 1.08]], hullRound: 14,
  track: trk(2.42, 0.75, 0.55, 0.42, 1.75),
  wheels: [-1.6, -1.22, -0.8, -0.42, 0.42, 0.8, 1.22, 1.6], r: 0.17, rollers: [-1.2, 0, 1.2],
  turret: turret(0.15, [[-0.95, 0.6], [-0.8, 0.72], [0.55, 0.75], [0.85, 0.55]], [[-0.95, 0.58], [0.85, 0.6]], 10, 0.9),
  gun: { length: 1.2, calibre: 0.047, at: 0.45 },
});
// Char B1 bis: the tracks run round the high hull sides behind armoured skirts, the 75 mm low in the front right of
// the hull, the small APX 4 turret with the 47 mm (6.37 x 2.58 m, 2.79 m).
{
  const hullGun = mantlet(2.0, 2.55, 2.75, 1.25, 0.2, 0.15, 0.4, 4);
  G['b1-bis'] = ww2({
    cls: 'heavy-tank', L: 6.37, W: 2.58, deck: 2.0, fender: 0.45,
    top: [[-3.18, 1.6], [-3.0, 2.0], [2.2, 2.0], [2.6, 1.6], [3.0, 1.4]],
    plan: [[-3.18, 0.75], [3.0, 0.75]], hullRound: 10,
    track: [[-2.6, 0], [2.4, 0], [3.18, 1.0], [2.9, 1.7], [-2.9, 1.7], [-3.18, 0.9]],
    wheels: [], r: 0.2, solid: true,
    turret: turret(0.6, [[-0.75, 0.55], [-0.6, 0.72], [0.5, 0.72], [0.75, 0.5]], [[-0.75, 0.7], [0.75, 0.7]], 4, 0.8),
    guns: [{ mount: 'turret', length: 1.1, calibre: 0.047, at: 0.45 }, { ...fire(hullGun, 0.5, 0.075), turret: 1 }],
    parts: [hullGun],
  });
}

// ---------------------------------------------------------------- half-tracks and armoured cars

/** A wheeled or half-tracked body from its outline: side profile top and bottom, plan, roundness (forward from the middle, up from the ground). */
const bodyOf = (top: P2[], bottom: P2[], plan: P2[], round: number) => ({ top, bottom, plan, round, stations: 14 });
// Sd.Kfz. 251 Ausf. C/D: the armoured body faceted above and below its waist, the pointed, sloped engine bonnet, the
// open troop compartment (5.8 x 2.1 m, 1.75 m).
G['sdkfz-251'] = { cls: 'halftrack', chassis: 'halftrack', length: 5.8, width: 2.1, hullHeight: 1.75, roadWheels: 6, wheelRadius: 0.45, openTop: true, hullOutline: bodyOf([[-2.9, 1.6], [-2.75, 1.75], [0.9, 1.75], [1.3, 1.5], [2.9, 1.1]], [[-2.9, 0.75], [-2.6, 0.55], [2.6, 0.6], [2.9, 0.75]], [[-2.9, 0.85], [-2.4, 0.98], [0.9, 0.98], [1.4, 0.62], [2.9, 0.4]], 2.4), guns: [{ mount: 'top', length: 1.2, calibre: 0.008 }] };
G['sdkfz-251-wurfrahmen'] = { ...G['sdkfz-251'], cls: 'mlrs', missiles: [{ mount: 'hull', rows: 3, cols: 1, length: 1.2, diameter: 0.32, elevation: 0.5, x: -0.6, up: 0.2, side: 1.15 }, { mount: 'hull', rows: 3, cols: 1, length: 1.2, diameter: 0.32, elevation: 0.5, x: -0.6, up: 0.2, side: -1.15 }] };
// M3 half-track: a box body, the armoured windscreen, the long bonnet with the curved front mudguards and the roller
// bumper (6.18 x 2.22 m, 2.26 m with the machine-gun ring).
G['m3-halftrack'] = {
  cls: 'halftrack', chassis: 'halftrack', length: 6.18, width: 2.22, hullHeight: 1.85, roadWheels: 4, wheelRadius: 0.45, openTop: true,
  hullOutline: bodyOf([[-3.09, 1.75], [-3.0, 1.85], [0.6, 1.85], [0.75, 1.6], [1.2, 1.5], [2.7, 1.35], [3.09, 1.2]], [[-3.09, 0.62], [3.09, 0.62]], [[-3.09, 1.02], [0.7, 1.05], [0.85, 0.58], [3.09, 0.5]], 12),
  turrets: [...[-1, 1].map((s) => part(1.85, [[0.85, 0.16], [1.3, 0.16], [2.4, 0.16], [2.75, 0.16]], [[0.85, 1.12], [1.3, 1.3], [2.4, 1.3], [2.75, 1.1]], [[0.85, 0.95], [1.3, 1.05], [2.4, 1.05], [2.75, 0.9]], 8, s * 0.95)), drumX(1.85, 3.08, 3.3, 0, 0.75, 0.15)],
  guns: [{ mount: 'top', length: 1.6, calibre: 0.013 }],
};
G['m2a1-halftrack'] = { ...G['m3-halftrack'], length: 5.96 };
G['m3-gmc'] = { ...G['m3-halftrack'], cls: 'tank-destroyer', guns: [{ mount: 'hull', length: 2.6, calibre: 0.075, x: -0.2, at: 1.15 }] };
G['m16-mgmc'] = { ...G['m3-halftrack'], cls: 'spaa', turret: { x: -1.2, length: 1.0, width: 0.9, height: 0.8, shape: 'box' }, guns: [{ mount: 'turret-side', count: 2, length: 1.6, calibre: 0.013, elevation: 0.35, at: 0.55, spread: 0.2 }] };
// Sd.Kfz. 234/2 "Puma": eight wheels under a double-ended hull sloped fore and aft, faceted at its waist; the oval
// turret with sloped faces and the 50 mm in a Saukopf (hull 6.0 x 2.33 m, 2.38 m).
{
  const t = turret(0.0, [[-0.95, 0.62], [-0.7, 0.8], [0.6, 0.8], [0.95, 0.5]], [[-0.95, 0.5], [0.95, 0.48]], 4, 1.2);
  G['sdkfz-234-puma'] = { cls: 'scout-car', chassis: 'wheeled', length: 6.0, width: 2.33, hullHeight: 1.6, axles: 4, axleAt: [0.62, 0.22, -0.22, -0.62], wheelRadius: 0.5, hullOutline: bodyOf([[-3.0, 1.2], [-2.3, 1.6], [2.0, 1.6], [3.0, 1.15]], [[-3.0, 0.9], [-2.5, 0.55], [2.5, 0.55], [3.0, 0.9]], [[-3.0, 0.65], [-2.3, 1.1], [2.3, 1.1], [3.0, 0.65]], 2.2), turret: t, turrets: [saukopf(t, 0.95, 1.2, 0.25, 0.16, 0.26)], guns: [{ mount: 'turret', length: 2.2, calibre: 0.05, muzzle: true, at: 0.52 }] };
}
// Sd.Kfz. 222: the small faceted hull and the open ten-sided turret with its 20 mm (4.8 x 1.95 m, 2.0 m).
G['sdkfz-222'] = { cls: 'scout-car', chassis: 'wheeled', length: 4.8, width: 1.95, hullHeight: 1.5, axles: 2, wheelRadius: 0.45, hullOutline: bodyOf([[-2.4, 1.15], [-1.9, 1.5], [1.0, 1.5], [2.4, 1.0]], [[-2.4, 0.75], [-2.0, 0.5], [2.0, 0.5], [2.4, 0.75]], [[-2.4, 0.6], [-1.5, 0.95], [1.2, 0.95], [2.4, 0.55]], 2.2), turret: turret(-0.1, [[-0.72, 0.45], [-0.5, 0.72], [0.5, 0.72], [0.72, 0.45]], [[-0.72, 0.42], [0.72, 0.42]], 5, 0.7), guns: [{ mount: 'turret', length: 1.4, calibre: 0.02, elevation: 0.1, at: 0.6 }] };
// M8 Greyhound: six wheels, a low hull with its sloped nose, the open round turret with the 37 mm (5.0 x 2.54 m, 2.25 m).
G['m8-greyhound'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.0, width: 2.54, hullHeight: 1.55, axles: 3, axleAt: [0.6, -0.25, -0.65], wheelRadius: 0.48, hullOutline: bodyOf([[-2.5, 1.45], [-2.3, 1.55], [0.8, 1.55], [2.5, 1.05]], [[-2.5, 0.8], [-2.1, 0.55], [2.1, 0.55], [2.5, 0.75]], [[-2.5, 1.1], [2.2, 1.12], [2.5, 0.9]], 8), turret: turret(0.0, circle(0, 0.85), [[-0.85, 0.6], [0.85, 0.6]], 6, 0.85), guns: [{ mount: 'turret', length: 1.5, calibre: 0.037, at: 0.5 }] };
// Staghound: four big wheels, a tall rounded hull, the cast turret (5.49 x 2.69 m, 2.36 m).
G['staghound'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.49, width: 2.69, hullHeight: 1.75, axles: 2, wheelRadius: 0.55, hullOutline: bodyOf([[-2.75, 1.55], [-2.5, 1.75], [1.2, 1.75], [2.75, 1.15]], [[-2.75, 0.85], [2.75, 0.85]], [[-2.75, 1.2], [2.75, 1.2]], 4), turret: turret(0.0, [[-0.95, 0.55], [-0.7, 0.85], [0.55, 0.88], [0.95, 0.55]], [[-0.95, 0.5], [-0.5, 0.62], [0.5, 0.62], [0.95, 0.5]], 3, 1.0), guns: [{ mount: 'turret', length: 1.6, calibre: 0.037, at: 0.45 }] };
// Daimler armoured car: a small rounded body on four wheels, the little turret with the 2-pounder (3.96 x 2.44 m, 2.24 m).
// Humber Mk IV: taller and angular, its rear sloping (4.57 x 2.18 m, 2.36 m).
const CAR_T = turret(0.0, [[-0.75, 0.55], [-0.6, 0.72], [0.5, 0.72], [0.75, 0.5]], [[-0.75, 0.55], [0.75, 0.55]], 10, 0.8);
G['daimler-armoured-car'] = { cls: 'scout-car', chassis: 'wheeled', length: 3.96, width: 2.44, hullHeight: 1.6, axles: 2, wheelRadius: 0.5, hullOutline: bodyOf([[-1.98, 1.35], [-1.7, 1.6], [0.6, 1.62], [1.98, 1.1]], [[-1.98, 0.6], [1.98, 0.6]], [[-1.98, 0.9], [0, 1.1], [1.98, 0.85]], 4), turret: CAR_T, guns: [{ mount: 'turret', length: 1.4, calibre: 0.04, at: 0.45 }] };
G['humber-mk4'] = { ...G['daimler-armoured-car'], length: 4.57, width: 2.18, hullHeight: 1.75, hullOutline: bodyOf([[-2.285, 1.4], [-1.8, 1.75], [0.8, 1.75], [2.285, 1.05]], [[-2.285, 0.65], [2.285, 0.65]], [[-2.285, 1.0], [2.285, 1.0]], 10) };
// BA-10: three axles, the long bonnet, the boxy body and a BT-style turret with the 45 mm (4.65 x 2.07 m, 2.21 m).
G['ba-10'] = { cls: 'scout-car', chassis: 'wheeled', length: 4.65, width: 2.07, hullHeight: 1.7, axles: 3, axleAt: [0.6, -0.3, -0.7], wheelRadius: 0.45, hullOutline: bodyOf([[-2.325, 1.45], [-2.1, 1.7], [0.1, 1.7], [0.4, 1.35], [2.325, 1.15]], [[-2.325, 0.65], [2.325, 0.65]], [[-2.325, 0.95], [0.2, 1.0], [0.5, 0.65], [2.325, 0.55]], 12), turret: turret(-0.6, [[-0.8, 0.55], [-0.6, 0.75], [0.6, 0.78], [0.85, 0.55]], [[-0.8, 0.55], [0.85, 0.55]], 5, 0.85), guns: [{ mount: 'turret', length: 1.4, calibre: 0.045, at: 0.45 }] };
// BA-64: a small body faceted all round and the little open turret with its machine gun (3.67 x 1.52 m, 1.9 m).
G['ba-64'] = { cls: 'scout-car', chassis: 'wheeled', length: 3.67, width: 1.52, hullHeight: 1.45, axles: 2, wheelRadius: 0.4, hullOutline: bodyOf([[-1.835, 1.15], [-1.3, 1.45], [0.4, 1.45], [1.835, 0.85]], [[-1.835, 0.75], [-1.5, 0.5], [1.5, 0.5], [1.835, 0.65]], [[-1.835, 0.45], [-1.0, 0.72], [0.6, 0.72], [1.835, 0.4]], 2.2), turret: turret(-0.2, circle(0, 0.42), [[-0.42, 0.4], [0.42, 0.4]], 8, 0.42), guns: [{ mount: 'turret', length: 0.9, calibre: 0.008, at: 0.5 }] };
// Universal Carrier: the low open box, three road wheels a side (one bogie of two, one single), the Bren in front (3.65 x 2.06 m, 1.57 m).
G['universal-carrier'] = ww2({ cls: 'apc-tracked', L: 3.65, W: 2.06, deck: 1.15, fender: 0.6, top: [[-1.825, 1.0], [-1.7, 1.15], [1.3, 1.15], [1.825, 0.85]], plan: [[-1.825, 1.0], [1.825, 1.0]], hullRound: 14, track: trk(1.8, 0.62, 0.45, 0.4, 1.35), wheels: [-1.15, -0.6, 0.8], r: 0.25, guns: [{ mount: 'hull', length: 1.0, calibre: 0.008, at: 1.0, side: -0.4 }] });

// ---------------------------------------------------------------- more on the same chassis

// Möbelwagen: the Pz IV with a box of folding armoured sides round the 37 mm.
G['mobelwagen'] = ww2({ ...PZ4, cls: 'spaa', turret: turret(0.0, [[-1.55, 1.35], [1.55, 1.35]], [[-1.55, 0.95], [1.55, 0.95]], 16, 0.5), gun: { length: 2.1, calibre: 0.037, elevation: 0.5, at: 0.8 } });
// M7 Priest: the Sherman chassis with an open superstructure, the 105 mm right of the centre and the round
// machine-gun "pulpit" at the front right (6.02 x 2.88 m, 2.54 m).
{
  const m = mantlet(1.85, 1.55, 1.85, 1.8, 0.28, 0.2, -0.3);
  G['m7-priest'] = ww2({ cls: 'sp-artillery', L: 6.02, W: 2.88, deck: 1.85, fender: 1.02, top: [[-3.01, 1.75], [-2.9, 1.85], [-1.0, 1.85], [-0.8, 2.15], [1.5, 2.15], [2.6, 1.2], [3.01, 0.85]], plan: [[-3.01, 1.38], [2.5, 1.42], [3.01, 1.1]], hullRound: 10, track: [[-2.05, 0], [2.0, 0], [3.0, 0.78], [2.7, 1.02], [-2.6, 1.0], [-2.98, 0.42]], wheels: pairs([-1.5, 0, 1.5], 0.56), r: 0.255, turret: m, guns: [fire(m, 1.15, 0.105)], parts: [...vvss(2.88, [-1.5, 0, 1.5], 1.85), part(1.85, circle(1.25, 0.42), [[0.83, 2.65], [1.67, 2.65]], 1.9, 6, 0.85)] });
}
// The Sherman Calliope's rocket frame over the new M4; Centaur CS: the Cromwell with the 95 mm howitzer; the Churchill
// gun carrier: a casemate over the Churchill's front with the 3-inch gun.
G['m4-calliope'] = { ...G['m4-sherman'], missiles: [{ mount: 'turret-top', rows: 3, cols: 12, length: 2.6, diameter: 0.115, pod: true, elevation: 0.05, x: 0.4, up: 0.8 }] };
G['centaur-cs'] = { ...G['cromwell'], guns: [{ mount: 'turret', length: 1.0, calibre: 0.095, at: 0.48 }] };
{
  const m = mantlet(1.75, 2.95, 3.2, 2.0, 0.25, 0.18);
  G['churchill-gun-carrier'] = ww2({ ...CHURCHILL, cls: 'tank-destroyer', top: [[-3.6, 1.25], [-3.45, 1.75], [0.3, 1.75], [0.4, 2.35], [2.5, 2.35], [3.05, 1.75], [3.35, 1.3]], turret: m, guns: [fire(m, 1.6, 0.076)] });
}
// Fiat M11/39: the M13's running gear with a 37 mm low in the hull's right front and a small machine-gun turret offset left.
{
  const m13 = G['fiat-m13-40'];
  G['fiat-m11-39'] = { ...m13, cls: 'light-tank', length: 4.73, turret: turret(-0.1, [[-0.6, 0.45], [-0.5, 0.55], [0.4, 0.55], [0.6, 0.45]], [[-0.6, 0.5], [0.6, 0.5]], 6, 0.6, -0.25), guns: [{ mount: 'turret', length: 0.7, calibre: 0.008, at: 0.5 }, { mount: 'hull', length: 1.0, calibre: 0.037, side: 0.4, at: 0.65, x: 2.0 }] };
}

// ---------------------------------------------------------------- late-war and prototype heavies

// Pz IV Ausf. E (and C/D): the short 75 mm, the narrower tracks, the bolted plate on the driver's half of the front.
G['pz-iv-e'] = ww2({ ...PZ4, W: 2.84, turret: { ...PZ4_T, gunX: 0.97 }, gun: { length: 1.3, calibre: 0.075, at: 0.45 }, parts: [...PZ4.parts!, part(1.68, [[1.95, 0.6], [2.03, 0.6]], [[1.95, 1.7], [2.03, 1.7]], 1.3, 16, -0.6)], turretParts: (t) => [pz4Cupola(t)] });
// Panther II: the Panther's hull lengthened on unstaggered steel wheels, the Schmalturm with the 88 mm L/71 (7.0 x 3.27 m).
G['panther-ii'] = ww2({ ...PANTHER, L: 7.0, top: [[-3.5, 1.35], [-3.2, 1.9], [1.5, 1.9], [3.5, 0.92]], track: trk(3.42, 1.05, 0.7, 0.62, 2.1), wheels: even(7, -2.1, 2.1), turret: SCHMALTURM, gun: { length: 4.9, calibre: 0.088, muzzle: true, at: 0.42 }, parts: [...pantherSkirts, ...pantherExhaust(0.16, 1.35)], turretParts: (t) => [saukopf(t, 1.38, 1.68, 0.32, 0.2, 0.36), cupola(t, -0.95, -0.5, 0.34, 0.15)] });
// Type 5 Chi-Ri: the Chi-To lengthened to eight road wheels, a bigger turret with the long 75 mm and a 37 mm low in
// the hull front (7.3 x 3.05 m, 3.05 m).
{
  const hullGun = mantlet(2.05, 3.3, 3.5, 1.45, 0.18, 0.12, -0.45, 4);
  G['type-5-chi-ri'] = ww2({
    cls: 'medium-tank', L: 7.3, W: 3.05, deck: 2.05, fender: 0.95,
    top: [[-3.65, 1.7], [-3.5, 2.05], [1.2, 2.05], [3.65, 1.05]],
    plan: [[-3.65, 1.48], [3.65, 1.48]], hullRound: 12,
    track: trk(3.6, 0.95, 0.62, 0.55, 2.85),
    wheels: even(8, -2.8, 2.8), r: 0.3, rollers: [-1.8, 0, 1.8],
    turret: turret(-0.2, [[-1.7, 0.9], [-1.4, 1.2], [0.8, 1.25], [1.3, 0.9], [1.4, 0.65]], [[-1.7, 0.88], [1.4, 0.85]], 12, 1.45),
    guns: [{ mount: 'turret', length: 3.8, calibre: 0.075, at: 0.45 }, { ...fire(hullGun, 0.8, 0.037), turret: 1 }],
    parts: [hullGun],
  });
}
// T14 assault tank: a Sherman-like turret on a longer, wider hull with skirts over the top of the bogies (6.25 x 3.12 m).
G['t14'] = sherman({ L: 6.25, W: 3.12, glacisX: 1.2, turret: SHERMAN_T75, gun: GUN_75, extra: skirtPair(1.9, -2.6, 2.3, 1.6, 0.6, 1.08) });
// M4 with the T26's turret and 90 mm.
G['m4-t26'] = sherman({ L: 5.9, glacisX: 1.45, turret: M26_T, gun: { length: 4.0, calibre: 0.09, muzzle: true, at: 0.45 } });
// Ram II (Canada): the cast hull with its rounded sides and the small cast turret with the 6-pounder (5.79 x 2.77 m, 2.67 m).
G['ram-ii'] = sherman({ L: 5.79, W: 2.77, glacisX: 0.6, cast: true, turret: turret(0.1, [[-1.0, 0.7], [-0.8, 0.95], [0.5, 1.0], [0.95, 0.75], [1.05, 0.5]], [[-1.0, 0.45], [-0.7, 0.72], [0.5, 0.75], [1.05, 0.42]], 2.6, 1.1), gun: { length: 2.2, calibre: 0.057, at: 0.48 } });
// KV-220: the KV lengthened to seven road wheels, a tall box turret with the 85 mm (7.1 x 3.32 m, 3.24 m).
G['kv-220'] = ww2({ ...KV, L: 7.1, top: [[-3.55, 1.15], [-3.3, 1.6], [2.5, 1.65], [2.9, 1.25], [3.55, 1.05]], track: trk(3.5, 1.0, 0.55, 0.62, 2.7), wheels: even(7, -2.6, 2.6), rollers: [-1.7, 0, 1.7], turret: turret(0.2, [[-1.5, 0.85], [-1.3, 1.2], [0.95, 1.25], [1.25, 1.0], [1.35, 0.7]], [[-1.5, 0.9], [1.35, 0.95]], 12, 1.4), gun: { length: 2.6, calibre: 0.085, at: 0.45 } });
// SU-100Y: the T-100's long hull with a great box casemate and the 130 mm naval gun (10.9 m with the gun, 3.4 m wide, 3.29 m high).
{
  const m = mantlet(1.95, 0.6, 0.95, 2.5, 0.38, 0.26);
  G['su-100y'] = ww2({ cls: 'sp-gun', L: 9.0, W: 3.4, deck: 1.95, fender: 1.0, top: [[-4.5, 1.6], [-4.35, 1.95], [-4.2, 1.95], [-4.1, 3.25], [0.6, 3.25], [0.8, 1.95], [3.6, 1.95], [4.5, 1.3]], plan: [[-4.5, 1.65], [4.5, 1.6]], hullRound: 14, track: trk(4.45, 1.0, 0.6, 0.6, 3.6), wheels: even(8, -3.5, 3.5), r: 0.35, rollers: [-2.5, -0.8, 0.8, 2.5], turret: m, guns: [fire(m, 5.45, 0.13)] });
}
// IS-4: a long hull on seven road wheels, a broad low turret with the 122 mm (hull 6.6 x 3.26 m, 2.48 m; 9.79 m with the gun).
G['is-4'] = ww2({ ...IS, L: 6.6, W: 3.26, deck: 1.68, top: [[-3.3, 1.2], [-3.05, 1.68], [1.6, 1.68], [3.3, 0.98]], plan: [[-3.3, 1.6], [3.3, 1.6]], track: trk(3.25, 0.95, 0.6, 0.6, 2.6), wheels: even(7, -2.55, 2.55), turret: turret(-0.1, [[-1.7, 0.7], [-1.4, 1.25], [0.4, 1.45], [1.3, 1.1], [1.7, 0.55]], [[-1.7, 0.45], [-1.2, 0.72], [0.3, 0.8], [1.3, 0.6], [1.7, 0.35]], 3, 1.75), gun: { length: 4.8, calibre: 0.122, muzzle: true, at: 0.5 } });
// IS-7: the pike nose, seven big road wheels, the very low, wide turret with the long 130 mm, its brake and fume extractor
// (hull 7.38 x 3.44 m, 2.48 m; 11.17 m with the gun).
G['is-7'] = ww2({
  cls: 'heavy-tank', L: 7.38, W: 3.44, deck: 1.65, fender: 0.98,
  top: [[-3.69, 1.25], [-3.4, 1.65], [1.2, 1.65], [3.69, 0.95]],
  plan: [[-3.69, 1.55], [1.2, 1.68], [3.69, 0.25]], hullRound: 8,
  track: trk(3.62, 0.98, 0.6, 0.6, 2.85),
  wheels: even(7, -2.75, 2.75), r: 0.38,
  turret: turret(-0.5, [[-2.0, 0.6], [-1.6, 1.3], [0, 1.6], [1.2, 1.3], [1.9, 0.6], [2.05, 0.3]], [[-2.0, 0.25], [-1.3, 0.62], [0, 0.78], [1.2, 0.62], [2.05, 0.25]], 2.2, 2.0),
  gun: { length: 5.9, calibre: 0.13, muzzle: true, extractor: 0.45, at: 0.5 },
});
// T29, T30, T34 heavy tanks: a long hull on four paired bogies, the huge cast turret with the rangefinder's ears on its
// sides; T29 the 105 mm (11.56 m with the gun), T30 the thick 155 mm, T34 the long 120 mm (hull 7.62 x 3.8 m, 3.21 m).
{
  const T29_T = turret(-0.4, [[-2.2, 0.9], [-1.9, 1.3], [0.8, 1.45], [1.6, 1.15], [1.9, 0.7]], [[-2.2, 0.6], [-1.7, 0.95], [0.7, 1.0], [1.9, 0.6]], 3, 1.95);
  const t29 = (gun: Ww2['gun']) => ww2({
    cls: 'heavy-tank', L: 7.62, W: 3.8, deck: 2.05, fender: 1.05,
    top: [[-3.81, 1.6], [-3.6, 2.05], [1.2, 2.05], [3.3, 1.15], [3.81, 1.0]],
    plan: [[-3.81, 1.85], [3.81, 1.85]], hullRound: 10,
    track: trk(3.75, 1.05, 0.7, 0.62, 2.95),
    wheels: pairs([-2.55, -0.85, 0.85, 2.55], 0.62), r: 0.3, rollers: [-2.55, -0.85, 0.85, 2.55],
    turret: T29_T, gun,
    turretParts: (t) => [...[-1, 1].map((s) => on(t, circle(0.55, 0.2), [[0.35, 0.92], [0.75, 0.92]], 0.55, 2, s * 1.5)), cupola(t, -0.9, 0.6, 0.35, 0.2)],
  });
  G['t29'] = t29({ length: 5.6, calibre: 0.105, at: 0.45 });
  G['t30'] = t29({ length: 4.9, calibre: 0.155, at: 0.45 });
  G['t34-heavy'] = t29({ length: 6.2, calibre: 0.12, at: 0.45 });
}
// ARL 44: the B1-style low running gear under skirts, a long hull and the big angular turret with the long 90 mm and
// its brake (hull 7.3 x 3.4 m, 3.2 m; 10.53 m with the gun).
G['arl-44'] = ww2({
  cls: 'heavy-tank', L: 7.3, W: 3.4, deck: 1.9, fender: 0.5,
  top: [[-3.65, 1.5], [-3.5, 1.9], [1.5, 1.9], [3.3, 1.35], [3.65, 1.2]],
  plan: [[-3.65, 1.2], [3.65, 1.15]], hullRound: 12,
  track: [[-3.0, 0], [3.0, 0], [3.65, 0.9], [3.35, 1.3], [-3.4, 1.3], [-3.65, 0.8]],
  wheels: [], r: 0.2, solid: true,
  turret: turret(-0.3, [[-2.0, 0.85], [-1.8, 1.2], [1.0, 1.3], [1.6, 0.95], [1.75, 0.6]], [[-2.0, 1.05], [1.75, 1.0]], 12, 1.8),
  gun: { length: 5.0, calibre: 0.09, muzzle: true, at: 0.45 },
});

// ---------------------------------------------------------------- Italian, Japanese and light US

// AB 41 armoured car: four big wheels, the hull sloped fore and aft, the small turret with the 20 mm (5.2 x 1.92 m, 2.48 m).
G['ab-41'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.2, width: 1.92, hullHeight: 1.85, axles: 2, wheelRadius: 0.5, hullOutline: bodyOf([[-2.6, 1.45], [-2.3, 1.85], [1.2, 1.85], [2.6, 1.2]], [[-2.6, 0.6], [2.6, 0.6]], [[-2.6, 0.8], [0, 0.95], [2.6, 0.75]], 6), turret: turret(-0.2, [[-0.7, 0.55], [-0.55, 0.68], [0.5, 0.68], [0.7, 0.5]], [[-0.7, 0.6], [0.7, 0.6]], 6, 0.75), guns: [{ mount: 'turret', length: 1.2, calibre: 0.02, at: 0.5 }] };
// Semovente M41 75/18 and M43 105/25: a wide, low casemate on the M13/M15 running gear, the gun right of the centre
// (M43 5.1 x 2.4 m, 1.75 m).
{
  const sem = (gun: number, cal: number) => {
    const m = mantlet(1.75, 1.55, 1.8, 1.4, 0.3, 0.2, 0.2);
    return ww2({ cls: 'assault-gun', L: 5.1, W: 2.4, deck: 1.75, fender: 0.72, top: [[-2.55, 1.3], [-2.45, 1.5], [-1.0, 1.5], [-0.9, 1.75], [1.2, 1.75], [2.1, 1.2], [2.55, 0.95]], plan: [[-2.55, 1.18], [2.55, 1.2]], hullRound: 10, track: trk(2.5, 0.75, 0.55, 0.42, 1.75), wheels: [-1.6, -1.22, -0.8, -0.42, 0.42, 0.8, 1.22, 1.6], r: 0.17, rollers: [-1.2, 0, 1.2], turret: m, guns: [fire(m, gun, cal, { muzzle: cal > 0.1 })] });
  };
  G['semovente-m43'] = sem(1.4, 0.105);
  G['semovente-75-18'] = sem(0.9, 0.075);
}
// Type 89 I-Go: a long hull with girders over its nine small wheels, the front idler high, the tail skid behind, the
// cylindrical turret with the short 57 mm (5.75 x 2.18 m, 2.56 m).
G['type-89-i-go'] = ww2({
  cls: 'medium-tank', L: 5.75, W: 2.18, deck: 1.75, fender: 0.5,
  top: [[-2.6, 1.4], [-2.45, 1.75], [1.4, 1.75], [2.2, 1.35], [2.6, 1.15]],
  plan: [[-2.6, 0.72], [2.6, 0.7]], hullRound: 12,
  track: [[-2.3, 0], [1.6, 0], [2.85, 0.95], [2.5, 1.22], [-2.5, 1.2], [-2.75, 0.6]],
  wheels: [], r: 0.18, solid: true,
  turret: turret(0.4, circle(0, 0.72), [[-0.72, 0.68], [0.72, 0.68]], 8, 0.72),
  gun: { length: 0.7, calibre: 0.057, at: 0.45 },
  parts: [part(1.75, [[-3.05, 0.3], [-2.55, 0.3]], [[-3.05, 0.9], [-2.55, 1.3]], [[-3.05, 0.6], [-2.55, 0.8]], 14)],
  turretParts: (t) => [cupola(t, -0.1, 0, 0.3, 0.2)],
});
// Type 98 Ke-Ni: four road wheels in two pairs, a low hull, the small turret with the 37 mm (4.11 x 2.12 m, 1.82 m).
G['type-98-ke-ni'] = ww2({ cls: 'light-tank', L: 4.11, W: 2.12, deck: 1.3, fender: 0.75, top: [[-2.055, 1.1], [-1.95, 1.3], [0.6, 1.3], [2.055, 0.85]], plan: [[-2.055, 1.04], [2.055, 1.04]], hullRound: 10, track: trk(2.0, 0.78, 0.5, 0.45, 1.35), wheels: pairs([-0.85, 0.85], 0.75), r: 0.28, rollers: [-0.4, 0.4], turret: turret(0.15, [[-0.75, 0.55], [-0.55, 0.68], [0.45, 0.68], [0.7, 0.5]], [[-0.75, 0.5], [0.7, 0.52]], 6, 0.75), gun: { length: 1.2, calibre: 0.037, at: 0.45 } });
// Type 2 Ka-Mi: the amphibious Ha-Go with its big detachable pontoons fore and aft (7.42 m with them, 2.79 m wide, 2.34 m).
G['type-2-ka-mi'] = ww2({
  cls: 'light-tank', L: 4.8, W: 2.79, deck: 1.5, fender: 0.8,
  top: [[-2.4, 1.35], [-2.2, 1.5], [1.3, 1.5], [2.4, 1.1]],
  plan: [[-2.4, 1.0], [2.4, 1.0]], hullRound: 12,
  track: trk(2.3, 0.82, 0.55, 0.45, 1.5),
  wheels: pairs([-1.0, 1.0], 0.85), r: 0.3, rollers: [-0.5, 0.5],
  turret: turret(0.2, [[-0.85, 0.65], [-0.7, 0.78], [0.55, 0.78], [0.85, 0.6]], [[-0.85, 0.62], [0.85, 0.62]], 4, 0.85),
  gun: { length: 1.2, calibre: 0.037, at: 0.45 },
  parts: [part(1.5, [[2.4, 1.35], [3.8, 0.9]], [[2.4, 1.55], [3.8, 1.2]], [[2.4, 0.5], [3.3, 0.7], [3.8, 1.0]], 10), part(1.5, [[-3.6, 1.2], [-2.4, 1.35]], [[-3.6, 1.45], [-2.4, 1.55]], [[-3.6, 0.9], [-2.4, 0.5]], 10)],
  turretParts: (t) => [cupola(t, -0.1, 0, 0.32, 0.25)],
});
// M22 Locust: two VVSS bogies a side, a small low hull and the little turret with the 37 mm (3.94 x 2.16 m, 1.85 m).
G['m22-locust'] = ww2({ cls: 'light-tank', L: 3.94, W: 2.16, deck: 1.35, fender: 0.85, top: [[-1.97, 1.2], [-1.85, 1.35], [0.6, 1.35], [1.97, 0.85]], plan: [[-1.97, 1.06], [1.97, 1.06]], hullRound: 10, track: trk(1.95, 0.88, 0.6, 0.42, 1.2), wheels: pairs([-0.75, 0.75], 0.5), r: 0.24, parts: vvss(2.16, [-0.75, 0.75], 1.35), turret: turret(-0.1, [[-0.75, 0.55], [-0.6, 0.7], [0.5, 0.72], [0.75, 0.5]], [[-0.75, 0.5], [0.75, 0.5]], 6, 0.8), gun: { length: 1.3, calibre: 0.037, at: 0.45 } });
// M12 GMC: the Lee's chassis with the engine forward and the 155 mm on an open mount at the back, a big spade behind
// (6.74 x 2.67 m, 2.88 m).
{
  const m = mantlet(1.3, -1.85, -1.55, 1.9, 0.3, 0.22);
  G['m12-gmc'] = ww2({ cls: 'sp-artillery', L: 6.74, W: 2.67, deck: 1.3, fender: 1.0, top: [[-3.37, 1.3], [-1.0, 1.3], [-0.9, 1.9], [1.4, 2.0], [2.6, 1.3], [3.37, 0.85]], plan: [[-3.37, 1.3], [3.37, 1.25]], hullRound: 12, track: [[-2.05, 0], [2.0, 0], [3.35, 0.78], [3.05, 1.02], [-2.9, 1.0], [-3.3, 0.42]], wheels: pairs([-1.6, -0.08, 1.45], 0.56), r: 0.255, turret: m, guns: [fire(m, 4.6, 0.155, { elevation: 0.12 })], parts: [...vvss(2.67, [-1.6, -0.08, 1.45], 1.3), part(1.3, [[-3.95, 1.2], [-3.37, 1.2]], [[-3.95, 0.9], [-3.37, 1.5]], [[-3.95, 0.1], [-3.37, 0.7]], 14)] });
}
// M4 high-speed tractor: two VVSS bogies, the tall cab with its canvas roof, the ammunition box behind (5.03 x 2.46 m,
// 2.5 m); M30 cargo carrier: the M12's chassis with an open box body (5.9 x 2.88 m).
G['m4-tractor'] = ww2({ cls: 'tractor', L: 5.03, W: 2.46, deck: 2.0, fender: 0.9, top: [[-2.515, 1.9], [-0.4, 2.0], [-0.3, 2.5], [1.8, 2.5], [2.0, 1.8], [2.515, 1.45]], plan: [[-2.515, 1.2], [2.515, 1.2]], hullRound: 14, track: trk(2.45, 0.92, 0.65, 0.45, 1.6), wheels: pairs([-1.0, 0.9], 0.52), r: 0.24, parts: vvss(2.46, [-1.0, 0.9], 2.0) });
G['m30-cargo-carrier'] = ww2({ cls: 'tractor', L: 5.9, W: 2.88, deck: 1.75, fender: 1.0, top: [[-2.95, 1.6], [-2.85, 1.75], [2.2, 1.75], [2.95, 0.85]], plan: [[-2.95, 1.4], [2.95, 1.35]], hullRound: 14, track: [[-2.05, 0], [2.0, 0], [2.93, 0.78], [2.63, 1.02], [-2.5, 1.0], [-2.9, 0.42]], wheels: pairs([-1.6, -0.08, 1.45], 0.56), r: 0.255, parts: vvss(2.88, [-1.6, -0.08, 1.45], 1.75) });
// Valentine AA: the Valentine with an open turret and twin 20 mm.
G['valentine-aa'] = ww2({ ...VALENTINE, cls: 'spaa', turret: turret(0.1, [[-0.95, 0.75], [0.95, 0.75]], [[-0.95, 0.65], [0.95, 0.65]], 12, 0.9), gun: { count: 2, length: 1.8, calibre: 0.02, elevation: 0.45, at: 0.8, spread: 0.3 } });

// ---------------------------------------------------------------- half-tracks, more

// Sd.Kfz. 7: the long bonnet, the open crew compartment with its bench rows behind the windscreen, the cargo bed at the
// back (6.85 x 2.35 m, 2.62 m with the canvas up); Sd.Kfz. 7/1 the Flakvierling on the bed. Sd.Kfz. 10: the same in small
// (4.75 x 1.93 m, 1.62 m), the 10/4 with a 20 mm on the bed.
{
  const s7 = bodyOf([[-3.425, 1.35], [-1.6, 1.35], [-1.5, 1.6], [0.6, 1.6], [0.9, 1.45], [1.6, 1.4], [3.425, 1.2]], [[-3.425, 0.7], [3.425, 0.7]], [[-3.425, 1.15], [0.8, 1.15], [1.0, 0.6], [3.425, 0.55]], 14);
  const s10 = bodyOf([[-2.375, 1.15], [-1.0, 1.15], [-0.9, 1.35], [0.4, 1.35], [0.6, 1.2], [2.375, 1.0]], [[-2.375, 0.6], [2.375, 0.6]], [[-2.375, 0.95], [0.6, 0.95], [0.75, 0.5], [2.375, 0.45]], 14);
  G['sdkfz-7'] = { cls: 'halftrack', chassis: 'halftrack', length: 6.85, width: 2.35, hullHeight: 1.45, roadWheels: 6, wheelRadius: 0.5, openTop: true, hullOutline: s7, turrets: [part(1.45, [[0.75, 1.05], [0.85, 1.05]], [[0.75, 2.05], [0.85, 2.05]], 1.6, 16)] };
  G['sdkfz-7-flakvierling'] = { ...G['sdkfz-7'], cls: 'spaa', turret: { x: -1.9, length: 1.3, width: 1.5, height: 0.6, shape: 'open' }, guns: [{ mount: 'turret', count: 4, length: 1.6, calibre: 0.02, at: 0.75, elevation: 0.45, spread: 0.35 }] };
  G['sdkfz-10'] = { cls: 'halftrack', chassis: 'halftrack', length: 4.75, width: 1.93, hullHeight: 1.2, roadWheels: 5, wheelRadius: 0.4, openTop: true, hullOutline: s10, turrets: [part(1.2, [[0.45, 0.88], [0.55, 0.88]], [[0.45, 1.65], [0.55, 1.65]], 1.35, 16)] };
  G['sdkfz-10-flak'] = { ...G['sdkfz-10'], cls: 'spaa', turret: { x: -1.2, length: 0.8, width: 1.0, height: 0.6, shape: 'open' }, guns: [{ mount: 'turret', length: 1.9, calibre: 0.02, at: 0.8, elevation: 0.5 }] };
}

// ---------------------------------------------------------------- First World War

// Mark V (male): the rhomboid tracks run round the whole hull, the long front horns; the sponsons with the 6-pounders
// stand out from the sides, the commander's cab on the roof (8.05 m long, 3.95 m over the sponsons, 2.64 m high).
// The female carries machine guns in smaller sponsons.
{
  const mk5 = (male: boolean): GroundSpec & { cls: string } => {
    const sp = male ? 1.65 : 1.55;
    const mL = mantlet(2.3, 1.15, 1.35, 1.25, 0.15, 0.12, -sp - 0.2, 4);
    const mR = mantlet(2.3, 1.15, 1.35, 1.25, 0.15, 0.12, sp + 0.2, 4);
    const sponson = (s: number) => part(2.3, [[-0.3, male ? 0.42 : 0.32], [0.3, male ? 0.42 : 0.32], [1.15, 0.2]], [[-0.3, 1.75], [0.3, 1.75], [1.15, 1.55]], [[-0.3, 0.75], [0.3, 0.6], [1.15, 0.85]], 12, s * sp);
    return ww2({
      cls: 'ww1-tank', L: 8.05, W: 2.65, deck: 2.3, fender: 0.5,
      top: [[-3.6, 1.6], [-3.3, 2.3], [2.4, 2.3], [3.2, 1.9]],
      plan: [[-3.6, 0.65], [3.2, 0.65]], hullRound: 14,
      track: [[-3.0, 0], [0.8, 0], [4.02, 1.6], [3.5, 2.62], [-3.3, 2.62], [-4.02, 1.0]],
      wheels: [], r: 0.2, solid: true,
      turret: mL,
      guns: [fire(mL, male ? 1.3 : 0.7, male ? 0.057 : 0.008), { ...fire(mR, male ? 1.3 : 0.7, male ? 0.057 : 0.008), turret: 1 }],
      parts: [mR, sponson(-1), sponson(1), part(2.3, [[1.2, 0.55], [2.4, 0.55]], [[1.2, 2.95], [2.4, 2.95]], 2.25, 14)],
    });
  };
  G['mark-v-male'] = mk5(true);
  G['mark-v-female'] = mk5(false);
}
// A7V: a great armoured box over a low track chassis, overhanging all round, the 57 mm in the nose, the commander's cab
// on the roof (7.34 x 3.1 m, 3.3 m).
{
  const m = mantlet(2.95, 3.55, 3.8, 1.6, 0.22, 0.16, 0, 4);
  G['a7v'] = ww2({ cls: 'ww1-tank', L: 7.34, W: 3.1, deck: 2.95, fender: 0.45, top: [[-3.67, 2.6], [-3.4, 2.95], [2.9, 2.95], [3.67, 2.3]], under: [[-3.67, 0.9], [-3.2, 0.45], [3.0, 0.45], [3.67, 1.1]], plan: [[-3.67, 1.45], [3.67, 1.4]], hullRound: 14, track: trk(3.0, 0.7, 0.4, 0.4, 2.4), wheels: [], r: 0.2, solid: true, turret: m, guns: [fire(m, 0.8, 0.057)], parts: [part(2.95, [[0.2, 0.75], [1.8, 0.75]], [[0.2, 3.3], [1.8, 3.3]], 2.9, 14)] });
}
// Saint-Chamond: a long body overhanging its short tracks far in front, the sloped nose with the 75 mm, two small
// cupolas on the roof (8.83 m, 2.67 m wide, 2.36 m). Schneider CA1: a box with a pointed prow (the wire-cutter), the
// short 75 mm in the right front (6.32 m, 2.05 m wide, 2.3 m).
{
  const m = mantlet(2.3, 4.25, 4.45, 1.2, 0.2, 0.15, 0, 4);
  G['saint-chamond'] = ww2({ cls: 'ww1-tank', L: 8.8, W: 2.67, deck: 2.3, fender: 0.45, top: [[-3.8, 1.9], [-3.5, 2.3], [2.6, 2.3], [4.4, 1.3]], under: [[-3.8, 0.9], [-3.5, 0.5], [2.6, 0.5], [4.4, 0.9]], plan: [[-3.8, 1.33], [4.4, 1.25]], hullRound: 14, track: trk(2.6, 0.7, 0.4, 0.4, 2.0), wheels: [], r: 0.2, solid: true, turret: m, guns: [fire(m, 0.9, 0.075)], parts: [roofCupola(2.3, 2.6, -0.6, 2.3, 0.3, 0.3), roofCupola(2.3, -2.8, 0.6, 2.3, 0.3, 0.3)] });
  const s = mantlet(2.2, 1.2, 1.45, 1.4, 0.2, 0.15, 0.9, 4);
  G['schneider-ca1'] = ww2({ cls: 'ww1-tank', L: 6.32, W: 2.05, deck: 2.2, fender: 0.45, top: [[-2.6, 1.8], [-2.4, 2.2], [1.4, 2.2], [2.2, 1.4], [3.16, 0.8]], under: [[-2.6, 0.8], [-2.3, 0.45], [2.0, 0.45], [3.16, 0.7]], plan: [[-2.6, 1.0], [1.6, 1.02], [3.16, 0.15]], hullRound: 14, track: trk(2.2, 0.7, 0.4, 0.4, 1.7), wheels: [], r: 0.2, solid: true, turret: s, guns: [fire(s, 0.5, 0.075)], parts: [roofCupola(2.2, 0.0, -0.3, 2.2, 0.32, 0.25)] });
}
// Renault FT: the big front idler raising the track's front, girders over the suspension, the tail skid, the small
// cast turret with the 37 mm on a narrow hull (5.0 m with the tail, 1.74 m wide, 2.14 m).
G['renault-ft'] = ww2({
  cls: 'light-tank', L: 4.1, W: 1.74, deck: 1.55, fender: 0.5,
  top: [[-2.0, 1.1], [-1.8, 1.5], [0.4, 1.55], [1.5, 1.3], [2.0, 1.0]],
  plan: [[-2.0, 0.55], [2.0, 0.55]], hullRound: 10,
  track: [[-1.6, 0], [1.2, 0], [2.1, 0.9], [1.9, 1.35], [-1.7, 1.25], [-1.95, 0.6]],
  wheels: [], r: 0.15, solid: true,
  turret: turret(0.1, circle(0, 0.55), [[-0.55, 0.5], [0, 0.6], [0.55, 0.5]], 3, 0.55),
  gun: { length: 0.7, calibre: 0.037, at: 0.45 },
  parts: [part(1.55, [[-2.5, 0.25], [-1.95, 0.3]], [[-2.5, 0.95], [-1.95, 1.2]], [[-2.5, 0.55], [-1.95, 0.6]], 12)],
});
// Char 2C: the giant - a long track run under skirts, the tall superstructure, the front turret with the 75 mm and its
// cupola, a machine-gun turret at the back (10.27 x 3.0 m, 4.09 m).
G['char-2c'] = ww2({
  cls: 'ww1-tank', L: 10.27, W: 3.0, deck: 2.9, fender: 0.5,
  top: [[-5.13, 2.3], [-4.8, 2.9], [4.2, 2.9], [5.0, 2.3]],
  plan: [[-5.13, 0.9], [5.0, 0.9]], hullRound: 14,
  track: [[-4.4, 0], [4.4, 0], [5.13, 1.4], [4.7, 2.1], [-4.7, 2.1], [-5.13, 1.2]],
  wheels: [], r: 0.2, solid: true,
  turret: turret(2.4, circle(0, 1.0), [[-1.0, 0.9], [1.0, 0.9]], 8, 1.0),
  gun: { length: 1.6, calibre: 0.075, at: 0.45 },
  turretParts: (t) => [cupola(t, -0.2, 0, 0.4, 0.3), { ...turret(-3.0, circle(0, 0.75), [[-0.75, 0.75], [0.75, 0.75]], 8, 0.75) }],
});
// Rolls-Royce armoured car: the long bonnet, the armoured body with its round machine-gun turret, the open tray behind
// (5.18 x 1.93 m, 2.54 m). Putilov-Garford: a big truck chassis with a high box body, the 76 mm in a turret at the back
// (5.7 x 2.3 m, 2.8 m).
G['rolls-royce-armoured-car'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.18, width: 1.93, hullHeight: 1.95, axles: 2, wheelRadius: 0.45, hullOutline: bodyOf([[-2.59, 1.2], [-1.2, 1.2], [-1.1, 1.95], [0.3, 1.95], [0.5, 1.55], [2.59, 1.35]], [[-2.59, 0.75], [2.59, 0.75]], [[-2.59, 0.85], [0.3, 0.88], [0.5, 0.55], [2.59, 0.45]], 12), turret: turret(-0.4, circle(0, 0.65), [[-0.65, 0.58], [0.65, 0.58]], 8, 0.65), guns: [{ mount: 'turret', length: 0.8, calibre: 0.008, at: 0.5 }] };
G['putilov-garford'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.7, width: 2.3, hullHeight: 2.5, axles: 2, wheelRadius: 0.5, hullOutline: bodyOf([[-2.85, 2.2], [-2.6, 2.5], [0.2, 2.5], [0.5, 1.9], [2.85, 1.6]], [[-2.85, 0.8], [2.85, 0.8]], [[-2.85, 1.1], [0.3, 1.15], [0.5, 0.7], [2.85, 0.6]], 12), turret: turret(-1.6, circle(0, 0.8), [[-0.8, 0.75], [0.8, 0.75]], 8, 0.8), guns: [{ mount: 'turret', length: 1.5, calibre: 0.076, at: 0.45 }] };

// ---------------------------------------------------------------- interwar light and medium tanks

/** The cast APX turret of the French tanks, with its cupola on top. */
const apx = (x: number, r: number, h: number): TurretSpec => turret(x, [[-r * 1.25, r * 0.75], [-r, r], [r * 0.8, r * 1.02], [r * 1.25, r * 0.72]], [[-r * 1.25, h], [r * 1.25, h * 1.03]], 3, r * 1.25);
// Somua S35: the rounded cast hull, skirts over the running gear, the APX 1 CE turret with the 47 mm (5.38 x 2.12 m, 2.62 m).
G['somua-s35'] = ww2({
  cls: 'medium-tank', L: 5.38, W: 2.12, deck: 1.9, fender: 0.5,
  top: [[-2.69, 1.35], [-2.5, 1.85], [0.9, 1.9], [2.3, 1.35], [2.69, 1.0]],
  plan: [[-2.69, 0.9], [2.69, 0.85]], hullRound: 4,
  track: [[-2.2, 0], [2.2, 0], [2.69, 0.7], [2.45, 1.15], [-2.45, 1.15], [-2.69, 0.65]],
  wheels: [], r: 0.2, solid: true,
  turret: apx(0.2, 0.68, 0.62), gun: { length: 1.2, calibre: 0.047, at: 0.45 },
  turretParts: (t) => [cupola(t, -0.25, 0, 0.32, 0.22)],
});
// Hotchkiss H35 / H39 (and the Renault R35 alike): a small, very rounded cast hull sloping to the back, three pairs
// of road wheels, the APX-R turret with the 37 mm (4.22 x 1.85 m, 2.14 m).
G['hotchkiss-h35'] = ww2({
  cls: 'light-tank', L: 4.22, W: 1.85, deck: 1.5, fender: 0.72,
  top: [[-2.11, 1.05], [-1.6, 1.5], [0.4, 1.5], [1.6, 1.15], [2.11, 0.85]],
  plan: [[-2.11, 0.92], [2.11, 0.9]], hullRound: 3,
  track: trk(2.05, 0.75, 0.5, 0.45, 1.55),
  wheels: pairs([-1.2, 0, 1.2], 0.45), r: 0.2, rollers: [-0.8, 0.8],
  turret: apx(0.1, 0.55, 0.58), gun: { length: 1.1, calibre: 0.037, at: 0.45 },
  turretParts: (t) => [cupola(t, -0.2, 0, 0.26, 0.18)],
});
// M8 HMC "Scott": the M5A1 with an open-topped turret and the short 75 mm howitzer.
G['m8-scott'] = { ...G['m5a1-stuart'], cls: 'sp-artillery', turret: turret(-0.1, circle(0, 0.92), [[-0.92, 0.6], [0.92, 0.6]], 8, 0.92), guns: [{ mount: 'turret', length: 1.0, calibre: 0.075, at: 0.45 }] };
// T-50: six road wheels and three return rollers, a hull sloped all round, the turret with its cupola and the 45 mm (5.2 x 2.47 m, 2.16 m).
G['t-50'] = ww2({ cls: 'light-tank', L: 5.2, W: 2.47, deck: 1.55, fender: 0.8, top: [[-2.6, 1.25], [-2.35, 1.55], [0.6, 1.55], [2.6, 0.85]], plan: [[-2.6, 1.2], [2.6, 1.2]], hullRound: 8, track: trk(2.55, 0.82, 0.5, 0.5, 1.95), wheels: even(6, -1.95, 1.95), r: 0.27, rollers: [-1.2, 0, 1.2], turret: turret(0.0, [[-1.0, 0.6], [-0.8, 0.85], [0.6, 0.88], [0.95, 0.6]], [[-1.0, 0.5], [0.95, 0.5]], 8, 1.0), gun: { length: 1.6, calibre: 0.045, at: 0.45 }, turretParts: (t) => [cupola(t, -0.3, -0.3, 0.3, 0.15)] });
// Landsverk L-60 (Strv m/38-m/40): four road wheels on torsion bars, two return rollers, the small turret with the 37 mm (4.8 x 2.08 m, 2.05 m).
G['landsverk-l60'] = ww2({ cls: 'light-tank', L: 4.8, W: 2.08, deck: 1.5, fender: 0.78, top: [[-2.4, 1.2], [-2.3, 1.45], [0.8, 1.5], [2.4, 0.9]], plan: [[-2.4, 1.02], [2.4, 1.02]], hullRound: 12, track: trk(2.35, 0.8, 0.5, 0.45, 1.6), wheels: even(4, -1.5, 1.5), r: 0.32, rollers: [-0.75, 0.75], turret: turret(0.1, [[-0.9, 0.6], [-0.7, 0.75], [0.6, 0.75], [0.9, 0.5]], [[-0.9, 0.55], [0.9, 0.55]], 10, 0.95), gun: { length: 1.3, calibre: 0.037, at: 0.45 } });
// 40M Turán: eight small road wheels in four pairs, a riveted hull, the turret with its tall cupola; Turán I the 40 mm,
// II the short 75 mm, III the long 75 mm (5.55 x 2.44 m, 2.39 m).
{
  const turan = (length: number, calibre: number) => ww2({ cls: 'medium-tank', L: 5.55, W: 2.44, deck: 1.65, fender: 0.78, top: [[-2.775, 1.3], [-2.65, 1.6], [1.4, 1.65], [1.8, 1.35], [2.775, 1.0]], plan: [[-2.775, 1.2], [2.775, 1.2]], hullRound: 14, track: trk(2.72, 0.8, 0.55, 0.45, 1.95), wheels: pairs([-1.5, -0.5, 0.5, 1.5], 0.42), r: 0.2, rollers: [-1.6, -0.8, 0, 0.8, 1.6], turret: turret(0.1, [[-1.15, 0.6], [-0.95, 0.85], [0.6, 0.85], [0.95, 0.6]], [[-1.15, 0.62], [0.95, 0.62]], 10, 1.0), gun: { length, calibre, at: 0.45 }, turretParts: (t) => [cupola(t, -0.4, -0.3, 0.3, 0.22)] });
  G['turan-i'] = turan(1.6, 0.04);
  G['turan-ii'] = turan(1.0, 0.075);
  G['turan-iii'] = turan(2.4, 0.075);
}

// ---------------------------------------------------------------- prototypes and rarities

// IS-6: the IS-2's layout on a longer hull with larger road wheels and a broader cast turret, the 122 mm with its brake
// (hull about 6.9 x 3.2 m, 2.7 m; estimate from photographs of the prototypes).
G['is-6'] = ww2({ ...IS, L: 6.9, W: 3.2, top: [[-3.45, 1.15], [-3.15, 1.6], [1.9, 1.6], [3.45, 0.98]], track: trk(3.4, 1.0, 0.6, 0.6, 2.6), wheels: even(6, -2.45, 2.45), r: 0.33, rollers: [-1.5, 0, 1.5], turret: turret(0.1, [[-1.6, 0.85], [-1.2, 1.32], [0.6, 1.38], [1.35, 0.95], [1.5, 0.55]], [[-1.6, 0.5], [-0.9, 0.9], [0.6, 0.95], [1.5, 0.5]], 2.4, 1.6), gun: { length: 4.8, calibre: 0.122, muzzle: true, at: 0.45 }, turretParts: isParts });
// Panzerjäger I: the Pz I's chassis - five road wheels, the rear idler raised - with a Czech 47 mm behind a
// three-sided shield on the open top (4.42 x 1.85 m, 2.25 m).
{
  const m = mantlet(1.15, 0.3, 0.5, 1.5, 0.15, 0.12);
  G['panzerjager-i'] = ww2({ cls: 'tank-destroyer', L: 4.42, W: 1.85, deck: 1.15, fender: 0.65, top: [[-2.21, 1.0], [-2.1, 1.15], [1.2, 1.15], [2.21, 0.8]], plan: [[-2.21, 0.92], [2.21, 0.9]], hullRound: 14, track: [[-1.5, 0], [1.6, 0], [2.18, 0.55], [1.9, 0.7], [-1.9, 0.7], [-2.2, 0.62]], wheels: even(5, -1.45, 1.6), r: 0.26, rollers: [-1.0, 0, 1.0], turret: m, guns: [fire(m, 1.9, 0.047)], parts: [part(1.15, [[0.0, 0.85], [0.45, 0.85]], [[0.0, 2.25], [0.45, 2.0]], 1.15, 16)] });
}
// Dicker Max: a tall open casemate over most of the Pz IV chassis, the long 105 mm with its brake (5.9 x 2.86 m,
// 2.53 m; 7.5 m with the gun). Sturer Emil: the 128 mm on a lengthened Henschel chassis with six big road wheels,
// its open fighting compartment over the back half (7.0 x 3.16 m, 2.7 m; 9.7 m with the gun).
{
  const m = mantlet(1.68, 1.7, 2.0, 1.95, 0.3, 0.22, -0.2);
  G['dicker-max'] = ww2({ ...PZ4, cls: 'tank-destroyer', W: 2.86, top: [[-2.96, 1.4], [-2.88, 1.62], [-2.4, 1.62], [-2.3, 2.5], [1.2, 2.5], [2.3, 1.55], [2.96, 1.05]], turret: m, guns: [fire(m, 4.0, 0.105, { muzzle: true })], parts: [] });
  const e = mantlet(1.85, 0.4, 0.7, 2.25, 0.3, 0.22);
  G['sturer-emil'] = ww2({ cls: 'tank-destroyer', L: 7.0, W: 3.16, deck: 1.85, fender: 1.0, top: [[-3.5, 1.6], [-3.4, 2.7], [0.4, 2.7], [0.6, 1.85], [2.6, 1.8], [3.5, 1.2]], plan: [[-3.5, 1.55], [3.5, 1.5]], hullRound: 14, track: trk(3.45, 1.0, 0.65, 0.6, 2.6), wheels: even(6, -2.55, 2.55), r: 0.43, rollers: [-1.6, 0, 1.6], turret: e, guns: [fire(e, 5.9, 0.128)] });
}
// Panzerwerfer 42 "Maultier": the Opel half-track armoured all over in sloped plates, the ten-barrelled launcher on its
// roof (6.0 x 2.2 m, 2.5 m).
G['panzerwerfer-42'] = { cls: 'mlrs', chassis: 'halftrack', length: 6.0, width: 2.2, hullHeight: 2.0, roadWheels: 4, wheelRadius: 0.45, hullOutline: bodyOf([[-3.0, 1.75], [-2.7, 2.0], [1.0, 2.0], [1.6, 1.6], [3.0, 1.3]], [[-3.0, 0.65], [3.0, 0.65]], [[-3.0, 0.95], [1.2, 1.05], [1.6, 0.75], [3.0, 0.6]], 6), missiles: [{ mount: 'hull', rows: 2, cols: 5, length: 1.3, diameter: 0.15, pod: true, elevation: 0.35, x: -1.4, up: 0.2 }] };
// Neubaufahrzeug: a long hull with skirts, the big main turret (75 mm and a 37 mm above it), machine-gun turrets ahead
// on the right and behind on the left (6.6 x 2.19 m, 2.98 m).
{
  const mgT = (x: number, s: number): TurretSpec => ({ ...turret(x, circle(0, 0.42), [[-0.42, 0.62], [0.42, 0.62]], 4, 0.42), side: s });
  G['neubaufahrzeug'] = ww2({
    cls: 'heavy-tank', L: 6.6, W: 2.19, deck: 1.95, fender: 0.5,
    top: [[-3.3, 1.6], [-3.1, 1.95], [2.2, 1.95], [3.3, 1.2]],
    plan: [[-3.3, 0.85], [3.3, 0.8]], hullRound: 12,
    track: [[-2.8, 0], [2.8, 0], [3.3, 0.8], [3.0, 1.25], [-3.0, 1.25], [-3.3, 0.75]],
    wheels: [], r: 0.2, solid: true,
    turret: turret(-0.1, [[-1.2, 0.6], [-1.0, 0.9], [0.7, 0.92], [1.1, 0.6]], [[-1.2, 0.95], [1.1, 0.95]], 6, 1.15),
    guns: [{ mount: 'turret', length: 1.0, calibre: 0.075, at: 0.35 }, { mount: 'turret', length: 1.6, calibre: 0.037, at: 0.75 }],
    turretParts: () => [mgT(1.95, 0.55), mgT(-2.2, -0.55)],
  });
}
// Flakpanzer V "Coelian": the Panther with a broad, sloped flak turret and twin 37 mm.
G['coelian'] = ww2({ ...PANTHER, cls: 'spaa', turret: turret(-0.3, [[-1.6, 1.1], [-1.3, 1.4], [0.8, 1.4], [1.4, 0.95]], [[-1.6, 0.8], [0.8, 0.85], [1.4, 0.55]], 8, 1.3), gun: { count: 2, length: 2.6, calibre: 0.037, elevation: 0.35, spread: 0.6, at: 0.55 }, parts: [...pantherSkirts, ...pantherExhaust(0.1, 1.0)] });
// SMK: two turrets on the hull's centre line, the rear one with the 76 mm raised on a barbette over the front one
// with the 45 mm; eight road wheels and four return rollers (8.75 x 3.4 m, 3.25 m).
G['smk'] = ww2({
  cls: 'heavy-tank', L: 8.75, W: 3.4, deck: 1.75, fender: 1.0,
  top: [[-4.375, 1.4], [-4.2, 1.75], [3.2, 1.75], [4.375, 1.05]],
  plan: [[-4.375, 1.65], [4.375, 1.6]], hullRound: 12,
  track: trk(4.3, 1.0, 0.6, 0.62, 3.2),
  wheels: even(8, -3.2, 3.2), r: 0.3, rollers: [-2.4, -0.8, 0.8, 2.4],
  turret: { ...turret(-0.6, [[-1.4, 0.75], [-1.1, 1.05], [0.7, 1.1], [1.15, 0.7]], [[-1.4, 0.85], [1.15, 0.85]], 6, 1.2), up: 0.55 },
  guns: [{ mount: 'turret', length: 1.5, calibre: 0.076, at: 0.45 }, { mount: 'turret', turret: 1, length: 1.5, calibre: 0.045, at: 0.45 }],
  turretParts: () => [turret(1.8, [[-0.85, 0.6], [-0.65, 0.8], [0.6, 0.82], [0.85, 0.55]], [[-0.85, 0.65], [0.85, 0.65]], 6, 0.85), part(1.75, circle(-0.6, 1.15), [[-1.75, 2.3], [0.55, 2.3]], 1.7, 6)],
});
// TOG II: the long track run round the hull's sides in the First World War manner, a Challenger-style turret with the
// 17-pounder on top (10.13 x 3.12 m, 3.05 m).
G['tog-ii'] = ww2({
  cls: 'heavy-tank', L: 10.13, W: 3.12, deck: 2.2, fender: 0.5,
  top: [[-5.06, 1.9], [-4.8, 2.2], [4.4, 2.2], [5.0, 1.8]],
  plan: [[-5.06, 0.95], [5.0, 0.95]], hullRound: 12,
  track: [[-4.3, 0], [4.3, 0], [5.06, 1.4], [4.7, 2.15], [-4.8, 2.15], [-5.06, 1.2]],
  wheels: [], r: 0.2, solid: true,
  turret: turret(0.2, [[-1.4, 0.8], [-1.2, 1.05], [0.8, 1.08], [1.1, 0.85]], [[-1.4, 0.85], [1.1, 0.85]], 14, 1.15),
  gun: { length: 3.3, calibre: 0.076, muzzle: true, at: 0.45 },
});
// A39 Tortoise: a casemate over the whole hull, the 32-pounder in its ball mount in the front, a machine-gun turret on
// the roof, the double tracks under skirts (7.24 x 3.91 m, 3.05 m; 10.0 m with the gun).
{
  const m = mantlet(2.0, 3.45, 3.8, 1.95, 0.45, 0.32, 0.2, 2);
  G['tortoise'] = ww2({ cls: 'tank-destroyer', L: 7.24, W: 3.91, deck: 2.0, fender: 0.6, top: [[-3.62, 2.3], [-3.5, 2.85], [2.6, 2.85], [3.62, 1.7]], plan: [[-3.62, 1.35], [3.62, 1.3]], hullRound: 12, track: [[-3.0, 0], [3.0, 0], [3.62, 0.8], [3.35, 1.25], [-3.35, 1.25], [-3.62, 0.8]], wheels: [], r: 0.2, solid: true, turret: m, guns: [fire(m, 2.95, 0.094)], parts: [roofCupola(2.0, 0.6, -0.7, 2.85, 0.42, 0.25)] });
}
// A43 Black Prince: the Churchill VII's layout widened (3.44 m) with a big turret and the 17-pounder (8.81 m with the gun, 2.74 m).
G['black-prince'] = ww2({ ...CHURCHILL, W: 3.44, plan: [[-3.6, 1.12], [3.35, 1.12]], turret: turret(0.4, [[-1.4, 0.75], [-1.2, 1.15], [0.6, 1.2], [1.2, 0.9], [1.3, 0.6]], [[-1.4, 0.85], [1.3, 0.85]], 8, 1.3), gun: { length: 3.4, calibre: 0.076, muzzle: true, at: 0.5 }, turretParts: (t) => [cupola(t, -0.5, -0.45, 0.3, 0.14)] });
// A30 Challenger: the Cromwell lengthened to six Christie wheels with a very tall, big turret and the 17-pounder
// (hull 6.55 x 2.9 m, 2.77 m; 8.15 m with the gun).
G['challenger-a30'] = ww2({
  cls: 'medium-tank', L: 6.55, W: 2.9, deck: 1.75, fender: 1.0,
  top: [[-3.275, 1.3], [-3.2, 1.72], [2.9, 1.75], [3.0, 1.35], [3.275, 1.1]],
  plan: [[-3.275, 1.42], [3.275, 1.42]], hullRound: 14,
  track: trk(3.22, 1.0, 0.55, 0.6, 2.45),
  wheels: even(6, -2.4, 2.4), r: 0.4,
  turret: turret(0.0, [[-1.3, 0.85], [-1.2, 1.0], [0.9, 1.0], [1.05, 0.9]], [[-1.3, 1.0], [1.05, 1.0]], 16, 1.15),
  gun: { length: 3.3, calibre: 0.076, muzzle: true, at: 0.5 },
});
// Type 1 Ho-Ni I: the Chi-Ha chassis with the Type 90 75 mm behind an open, three-sided shield; Ho-Ni III the same in
// a closed casemate (5.9 x 2.33 m, 2.39 m). Type 5 Na-To: the gun on an open platform over a lengthened chassis.
{
  const m = mantlet(1.55, 0.6, 0.85, 1.75, 0.25, 0.18);
  G['ho-ni-i'] = ww2({ ...CHIHA, cls: 'tank-destroyer', L: 5.9, turret: m, guns: [fire(m, 2.6, 0.075, { muzzle: true })], parts: [compartment(1.55, -0.4, 0.75, 2.39, 1.05, 1.5)] });
  G['ho-ni-iii'] = ww2({ ...CHIHA, cls: 'tank-destroyer', L: 5.9, top: [[-2.95, 1.3], [-2.85, 1.5], [-0.6, 1.5], [-0.5, 2.39], [0.6, 2.39], [1.2, 1.55], [2.3, 1.15], [2.95, 0.95]], turret: m, guns: [fire(m, 2.6, 0.075, { muzzle: true })] });
  const n = mantlet(1.4, -0.3, -0.05, 2.1, 0.22, 0.16);
  G['na-to'] = ww2({ ...CHIHA, cls: 'tank-destroyer', L: 6.2, deck: 1.4, top: [[-3.1, 1.2], [-3.0, 1.4], [1.0, 1.4], [3.1, 0.95]], wheels: even(7, -2.3, 2.3), turret: n, guns: [fire(n, 3.0, 0.075)], parts: [compartment(1.4, -1.4, 0.2, 2.35, 1.1, 1.4)] });
}
// Carro Armato P 26/40: the M13's paired small wheels under a bigger, sloped hull, the turret with the 75/34
// (5.8 x 2.8 m, 2.5 m).
G['p-40'] = ww2({ cls: 'heavy-tank', L: 5.8, W: 2.8, deck: 1.7, fender: 0.75, top: [[-2.9, 1.4], [-2.75, 1.7], [0.9, 1.7], [2.9, 0.95]], plan: [[-2.9, 1.38], [2.9, 1.38]], hullRound: 10, track: trk(2.85, 0.78, 0.55, 0.45, 2.05), wheels: [-1.9, -1.5, -1.0, -0.6, 0.6, 1.0, 1.5, 1.9], r: 0.2, rollers: [-1.4, 0, 1.4], turret: turret(0.0, [[-1.15, 0.7], [-0.95, 0.95], [0.6, 0.95], [1.05, 0.6]], [[-1.15, 0.7], [1.05, 0.68]], 8, 1.1), gun: { length: 2.2, calibre: 0.075, muzzle: true, at: 0.45 } });
// 40/43M Zrínyi II: a low casemate on the Turán's running gear with the short 105 mm; 44M Zrínyi I the long 75 mm
// (5.9 x 2.89 m, 1.9 m).
{
  const m = mantlet(1.3, 1.85, 2.15, 1.35, 0.32, 0.22);
  const zr = (length: number, calibre: number) => ww2({ cls: 'assault-gun', L: 5.9, W: 2.89, deck: 1.3, fender: 0.78, top: [[-2.95, 1.25], [-2.85, 1.3], [-1.3, 1.3], [-1.2, 1.9], [0.9, 1.9], [2.6, 1.1], [2.95, 0.95]], plan: [[-2.95, 1.42], [2.95, 1.42]], hullRound: 12, track: trk(2.9, 0.8, 0.55, 0.45, 1.95), wheels: pairs([-1.5, -0.5, 0.5, 1.5], 0.42), r: 0.2, rollers: [-1.6, -0.8, 0, 0.8, 1.6], turret: m, guns: [fire(m, length, calibre, { muzzle: calibre < 0.1 })] });
  G['zrinyi-ii'] = zr(1.2, 0.105);
  G['zrinyi-i'] = zr(3.0, 0.075);
}
// Swedish casemate guns: Sav m/43 - the Strv m/41 (38(t)) chassis with an open-backed casemate and the 75 or 105 mm;
// Pvkv m/43 - a long, low casemate on the Strv m/42's chassis with the long 75 mm.
{
  const m = mantlet(1.67, 1.6, 1.85, 1.4, 0.25, 0.18);
  G['sav-m43'] = ww2({ ...PZ38, cls: 'assault-gun', L: 4.9, top: [[-2.45, 1.35], [-2.4, 1.6], [-0.6, 1.6], [-0.5, 2.1], [0.9, 2.1], [1.7, 1.4], [2.45, 1.05]], turret: m, guns: [fire(m, 1.3, 0.105)] });
  const p = mantlet(1.5, 2.0, 2.3, 1.45, 0.28, 0.2);
  G['pvkv-m43'] = ww2({ cls: 'tank-destroyer', L: 6.1, W: 2.43, deck: 1.5, fender: 0.8, top: [[-3.05, 1.3], [-2.95, 1.5], [-1.2, 1.5], [-1.1, 2.0], [1.0, 2.0], [3.05, 1.0]], plan: [[-3.05, 1.2], [3.05, 1.18]], hullRound: 10, track: trk(3.0, 0.82, 0.55, 0.5, 2.25), wheels: even(6, -2.2, 2.2), r: 0.3, rollers: [-1.3, 0, 1.3], turret: p, guns: [fire(p, 3.2, 0.075, { muzzle: true })] });
}
// Marmon-Herrington Mk VI: an eight-wheeled armoured car with a boxy, sloped hull and a turret with the 2- or 6-pounder
// (6.3 x 2.3 m, 2.6 m; estimate).
G['marmon-herrington-vi'] = { cls: 'scout-car', chassis: 'wheeled', length: 6.3, width: 2.3, hullHeight: 1.95, axles: 4, axleAt: [0.65, 0.25, -0.25, -0.65], wheelRadius: 0.5, hullOutline: bodyOf([[-3.15, 1.6], [-2.8, 1.95], [1.8, 1.95], [3.15, 1.25]], [[-3.15, 0.75], [3.15, 0.75]], [[-3.15, 0.95], [-2.5, 1.12], [2.5, 1.12], [3.15, 0.85]], 8), turret: turret(-0.2, [[-0.9, 0.6], [-0.75, 0.78], [0.6, 0.8], [0.9, 0.6]], [[-0.9, 0.6], [0.9, 0.6]], 10, 0.95), guns: [{ mount: 'turret', length: 1.9, calibre: 0.057, at: 0.45 }] };
// AMD 35 (Panhard 178): four wheels, the long sloped bonnet, the turret behind the middle with its 25 mm (4.79 x 2.01 m, 2.31 m).
G['amd-35'] = { cls: 'scout-car', chassis: 'wheeled', length: 4.79, width: 2.01, hullHeight: 1.75, axles: 2, wheelRadius: 0.45, hullOutline: bodyOf([[-2.4, 1.45], [-2.2, 1.75], [0.4, 1.75], [2.4, 1.15]], [[-2.4, 0.6], [2.4, 0.6]], [[-2.4, 0.85], [0.2, 0.95], [2.4, 0.6]], 6), turret: turret(-0.4, [[-0.75, 0.55], [-0.6, 0.7], [0.55, 0.7], [0.75, 0.5]], [[-0.75, 0.55], [0.75, 0.55]], 6, 0.8), guns: [{ mount: 'turret', length: 1.5, calibre: 0.025, at: 0.45 }] };
// Renault D2: a long, low box hull with the track run behind skirts, the APX 1 turret with the 47 mm (5.46 x 2.22 m, 2.66 m).
G['renault-d2'] = ww2({ cls: 'medium-tank', L: 5.46, W: 2.22, deck: 1.9, fender: 0.5, top: [[-2.73, 1.55], [-2.6, 1.9], [1.8, 1.9], [2.5, 1.45], [2.73, 1.2]], plan: [[-2.73, 0.85], [2.73, 0.82]], hullRound: 12, track: [[-2.3, 0], [2.3, 0], [2.73, 0.75], [2.5, 1.2], [-2.5, 1.2], [-2.73, 0.7]], wheels: [], r: 0.2, solid: true, turret: apx(0.3, 0.65, 0.65), gun: { length: 1.2, calibre: 0.047, at: 0.45 }, turretParts: (t) => [cupola(t, -0.25, 0, 0.3, 0.2)] });
// FCM 36: a welded hull and turret all of flat facets, the turret a truncated pyramid, skirts over the bogies, the
// short 37 mm (4.46 x 2.14 m, 2.2 m).
G['fcm-36'] = ww2({ cls: 'light-tank', L: 4.46, W: 2.14, deck: 1.55, fender: 0.5, top: [[-2.23, 1.2], [-1.9, 1.55], [0.6, 1.55], [2.23, 0.95]], plan: [[-2.23, 0.85], [2.23, 0.8]], hullRound: 14, track: [[-1.8, 0], [1.8, 0], [2.23, 0.7], [2.0, 1.05], [-2.0, 1.05], [-2.23, 0.65]], wheels: [], r: 0.2, solid: true, turret: turret(0.0, [[-0.75, 0.62], [0.75, 0.62]], [[-0.75, 0.62], [-0.45, 0.65], [0.45, 0.65], [0.75, 0.62]], 16, 0.75), gun: { length: 0.8, calibre: 0.037, at: 0.45 } });
// Lorraine 37L: the small tracked tractor with its cab at the front and the low cargo bed behind (4.22 x 1.57 m, 1.29 m);
// Lorraine 155: its lengthened chassis with a 155 mm on an open mount at the back.
G['lorraine-37l'] = ww2({ cls: 'tractor', L: 4.22, W: 1.57, deck: 1.0, fender: 0.6, top: [[-2.11, 0.95], [1.0, 0.95], [1.1, 1.29], [2.0, 1.25], [2.11, 0.9]], plan: [[-2.11, 0.78], [2.11, 0.75]], hullRound: 14, track: trk(2.05, 0.62, 0.45, 0.4, 1.55), wheels: pairs([-1.0, 0, 1.0], 0.42), r: 0.18 });
{
  const m = mantlet(1.0, -0.9, -0.65, 1.55, 0.25, 0.2);
  G['lorraine-155'] = ww2({ cls: 'sp-artillery', L: 5.3, W: 1.9, deck: 1.0, fender: 0.6, top: [[-2.65, 0.95], [1.3, 0.95], [1.4, 1.3], [2.3, 1.25], [2.65, 0.9]], plan: [[-2.65, 0.92], [2.65, 0.85]], hullRound: 14, track: trk(2.6, 0.62, 0.45, 0.4, 2.0), wheels: pairs([-1.4, -0.3, 0.8], 0.42), r: 0.18, turret: m, guns: [fire(m, 3.4, 0.155, { elevation: 0.15 })], parts: [part(1.0, [[-1.2, 0.85], [-0.75, 0.85]], [[-1.2, 2.0], [-0.75, 1.85]], 1.0, 16)] });
}

// ---------------------------------------------------------------- soft-skin cars and trucks

/**
 * A wheeled soft-skin from its side profile and plan: the bonnet, cab and body or bed as one outline, plus parts
 * (windscreens, spare wheels, canvas tilts). Built on two or three axles at their own positions.
 */
function car(cls: string, L: number, W: number, r: number, axleAt: number[], top: P2[], bottom: P2[], plan: P2[], round: number, parts: TurretSpec[] = []): GroundSpec & { cls: string } {
  const H = Math.max(...top.map((p) => p[1]));
  // Parts are given in the vehicle's frame: set each on the ground, whatever deck it was made for.
  return { cls, chassis: 'wheeled', length: L, width: W, hullHeight: H, axles: axleAt.length, axleAt, wheelRadius: r, hullOutline: bodyOf(top, bottom, plan, round), turrets: parts.map((q) => ({ ...q, up: -H })) };
}
/** A windscreen frame standing across the body at x, up to height `hi`. */
const screen = (x: number, w: number, lo: number, hi: number): TurretSpec => part(lo, [[x, w], [x + 0.06, w]], [[x, hi], [x + 0.06, hi]], lo, 16);
// Willys MB: the low tub with its flat bonnet, the folding windscreen up, the spare wheel on the back (3.36 x 1.58 m, 1.77 m).
G['willys-mb'] = car('jeep', 3.36, 1.58, 0.36, [0.6, -0.6], [[-1.68, 0.9], [0.2, 0.9], [0.35, 1.0], [1.68, 0.95]], [[-1.68, 0.5], [1.68, 0.5]], [[-1.68, 0.7], [0.3, 0.7], [0.45, 0.55], [1.68, 0.5]], 12, [screen(0.3, 0.68, 0.95, 1.77), part(0.9, [[-1.82, 0.05], [-1.68, 0.05]], [[-1.82, 1.15], [-1.68, 1.15]], 0.45, 4)]);
// GAZ-67: the same size, its separate rounded mudguards and a narrower, rounded bonnet (3.35 x 1.69 m, 1.7 m).
G['gaz-67'] = car('jeep', 3.35, 1.69, 0.38, [0.6, -0.55], [[-1.675, 0.95], [0.1, 0.95], [0.3, 1.1], [1.675, 0.95]], [[-1.675, 0.55], [1.675, 0.55]], [[-1.675, 0.68], [0.2, 0.68], [0.4, 0.42], [1.675, 0.38]], 4, [screen(0.2, 0.66, 0.95, 1.7), ...[-1, 1].map((s) => part(0.9, [[0.6, 0.12], [1.5, 0.12]], [[0.6, 0.9], [1.0, 1.0], [1.5, 0.8]], [[0.6, 0.6], [1.0, 0.75], [1.5, 0.55]], 3, s * 0.72))]);
// Kübelwagen: the slab-sided body with its flat ribbed panels, the bonnet sloping down to the front, the engine at the
// back under a sloping deck (3.74 x 1.6 m, 1.65 m with the hood up).
G['kubelwagen'] = car('jeep', 3.74, 1.6, 0.36, [0.6, -0.62], [[-1.87, 0.75], [-1.3, 1.05], [-0.6, 1.1], [-0.55, 1.65], [0.3, 1.65], [0.4, 1.1], [1.87, 0.8]], [[-1.87, 0.5], [1.87, 0.5]], [[-1.87, 0.7], [1.87, 0.75]], 14, [screen(0.35, 0.75, 1.05, 1.5)]);
// Schwimmwagen: the boat-shaped tub, the propeller on its arm at the back (3.83 x 1.48 m, 1.6 m).
G['schwimmwagen'] = car('jeep', 3.83, 1.48, 0.34, [0.58, -0.58], [[-1.915, 0.9], [-1.0, 1.0], [0.4, 1.0], [1.915, 0.7]], [[-1.915, 0.6], [-1.4, 0.4], [1.4, 0.4], [1.915, 0.6]], [[-1.915, 0.4], [-1.2, 0.74], [1.2, 0.74], [1.915, 0.25]], 3, [screen(0.4, 0.68, 0.95, 1.55)]);
// Horch 901: a big open car, the long bonnet, the high body with its spare wheels on the sides (4.44 x 1.68 m, 1.9 m).
G['horch-901'] = car('jeep', 4.44, 1.68, 0.42, [0.62, -0.6], [[-2.22, 1.2], [0.2, 1.2], [0.35, 1.3], [2.22, 1.05]], [[-2.22, 0.65], [2.22, 0.65]], [[-2.22, 0.8], [0.3, 0.84], [0.5, 0.55], [2.22, 0.5]], 12, [screen(0.3, 0.8, 1.2, 1.9)]);
/** A truck: bonnet, cab and a bed - flat with sides, or covered by a canvas tilt over hoops. */
function truck(cls: string, L: number, W: number, r: number, axleAt: number[], bonnetTo: number, bonnetH: number, cabTo: number, cabH: number, bedH: number, tilt: number, bonnetW = W * 0.3): GroundSpec & { cls: string } {
  const h = L / 2;
  const top: P2[] = tilt > 0 ? [[-h, bedH], [-h + 0.15, tilt], [cabTo - 0.25, tilt], [cabTo - 0.2, cabH], [bonnetTo, cabH], [bonnetTo + 0.15, bonnetH], [h, bonnetH - 0.1]] : [[-h, bedH], [cabTo - 0.25, bedH], [cabTo - 0.2, cabH], [bonnetTo, cabH], [bonnetTo + 0.15, bonnetH], [h, bonnetH - 0.1]];
  const plan: P2[] = [[-h, W / 2 - 0.02], [bonnetTo, W / 2 - 0.05], [bonnetTo + 0.15, bonnetW], [h, bonnetW * 0.9]];
  return car(cls, L, W, r, axleAt, top, [[-h, r * 1.7], [h, r * 1.5]], plan, tilt > 0 ? 6 : 14);
}
// Opel Blitz 3-ton: the bonnet, the rounded cab, the canvas-covered bed (6.02 x 2.27 m, 2.6 m with the tilt).
G['opel-blitz'] = truck('truck', 6.02, 2.27, 0.45, [0.6, -0.42], 1.55, 1.55, 0.45, 2.18, 1.35, 2.6);
G['opel-blitz-tanker'] = truck('truck', 6.02, 2.27, 0.45, [0.6, -0.42], 1.55, 1.55, 0.45, 2.18, 2.0, 0);
// GMC CCKW 6x6: the long bonnet, the open cab, the bed on its two rear axles under a tilt (6.9 x 2.24 m, 2.8 m).
G['gmc-cckw'] = truck('truck', 6.9, 2.24, 0.48, [0.7, -0.35, -0.7], 1.95, 1.55, 0.85, 2.2, 1.45, 2.8);
G['gmc-cckw-tanker'] = truck('truck', 6.9, 2.24, 0.48, [0.7, -0.35, -0.7], 1.95, 1.55, 0.85, 2.2, 2.1, 0);
// Studebaker US6: the same layout, a shorter body and the flatter bonnet (6.2 x 2.24 m, 2.75 m).
G['studebaker-us6'] = truck('truck', 6.2, 2.24, 0.48, [0.68, -0.3, -0.68], 1.75, 1.45, 0.7, 2.25, 1.4, 2.75);
// ZiS-5: the bonnet, the timber cab, the open flat bed with its sides (6.06 x 2.24 m, 2.16 m); GAZ-AA the smaller one (5.34 x 2.04 m, 1.97 m).
G['zis-5'] = truck('truck', 6.06, 2.24, 0.45, [0.6, -0.5], 1.6, 1.5, 0.45, 2.16, 1.45, 0);
G['gaz-aa'] = truck('truck', 5.34, 2.04, 0.42, [0.6, -0.48], 1.35, 1.4, 0.35, 1.97, 1.35, 0);
// Bedford QL: cab-over, the flat front of the cab and the bed under a tall tilt (6.0 x 2.26 m, 3.0 m).
G['bedford-ql'] = car('truck', 6.0, 2.26, 0.5, [0.6, -0.5], [[-3.0, 1.45], [-2.85, 3.0], [0.75, 3.0], [0.8, 2.6], [3.0, 2.6]], [[-3.0, 0.85], [3.0, 0.85]], [[-3.0, 1.12], [3.0, 1.1]], 8);
// Ford G917, Bedford MWD, Dodge WC, Krupp Protze, Type 94: the bonnet-and-cab trucks in their own sizes.
G['ford-g917'] = truck('truck', 6.2, 2.2, 0.45, [0.6, -0.45], 1.6, 1.5, 0.55, 2.1, 1.35, 2.5);
G['bedford-mwd'] = truck('truck', 4.4, 2.0, 0.42, [0.6, -0.55], 1.0, 1.4, 0.05, 2.0, 1.3, 2.2);
G['dodge-wc'] = truck('truck', 4.7, 1.98, 0.42, [0.62, -0.55], 1.1, 1.35, 0.2, 2.0, 1.25, 2.3);
G['krupp-protze'] = truck('truck', 5.1, 1.96, 0.42, [0.65, -0.35, -0.7], 1.35, 1.35, 0.4, 1.8, 1.25, 2.0);
G['type-94-truck'] = truck('truck', 5.4, 1.9, 0.4, [0.62, -0.35, -0.68], 1.45, 1.35, 0.5, 2.0, 1.3, 2.2);

// ---------------------------------------------------------------- towed guns

/**
 * A towed gun: the builder's carriage (wheels, split trail, a cradle) with the gun's own shield - its outline seen
 * from the front, standing at x - and the barrel at its height. `shield` is (half-width, bottom, top); `top` tilts the
 * shield's upper edge back (a sloped or a stepped shield); `spaced` adds a second plate a little ahead (Pak 40).
 */
function towed(cls: string, L: number, W: number, r: number, H: number, shield: [number, number, number] | undefined, gun: GunSpec, spaced = false): GroundSpec & { cls: string } {
  const parts: TurretSpec[] = [];
  if (shield) {
    const [w, lo, hi] = shield;
    parts.push(part(H, [[0.1, w], [0.16, w * 0.85]], [[0.1, hi], [0.16, hi - 0.15]], lo, 14));
    if (spaced) parts.push(part(H, [[0.22, w * 0.95], [0.26, w * 0.8]], [[0.22, hi - 0.1], [0.26, hi - 0.2]], lo + 0.05, 14));
  }
  // The barrel's `at` is given as its height in metres; the builder takes it as a share of the carriage height.
  return { cls, chassis: 'towed', length: L, width: W, hullHeight: H, axles: 1, wheelRadius: r, shield: false, turrets: parts, guns: [{ ...gun, at: (gun.at ?? H) / H }] };
}
/** A towed gun's barrel from the trunnions forward, at `up` metres. */
const barrel = (length: number, calibre: number, up: number, extra: Partial<GunSpec> = {}): GunSpec => ({ mount: 'hull', x: 0.0, length, calibre, ...extra, at: up });
// Pak 40: the low, wide spaced double shield, the long 75 mm with its double-baffle brake (6.2 x 2.08 m, 1.2 m).
G['pak-40'] = towed('towed-gun', 6.2, 2.08, 0.45, 0.9, [1.0, 0.3, 1.2], barrel(3.4, 0.075, 0.85, { muzzle: true }), true);
// Pak 38: the curved shield, the 50 mm L/60 with its brake (4.75 x 1.85 m, 1.05 m).
G['pak-38'] = towed('towed-gun', 4.75, 1.85, 0.4, 0.9, [0.9, 0.25, 1.05], barrel(2.8, 0.05, 0.75, { muzzle: true }), true);
// Pak 36: the small shield and the short 37 mm (3.4 x 1.65 m, 1.0 m).
G['pak-36'] = towed('towed-gun', 3.4, 1.65, 0.35, 0.9, [0.75, 0.25, 1.0], barrel(1.6, 0.037, 0.7));
// ZiS-3: the shield with its sloped top half, the 76 mm with its brake (6.1 x 1.6 m, 1.37 m); ZiS-2 the long 57 mm
// without one on the same carriage (7.0 m).
G['zis-3'] = towed('towed-gun', 6.1, 1.6, 0.4, 0.9, [0.8, 0.3, 1.37], barrel(3.2, 0.076, 0.95, { muzzle: true }));
G['zis-2-57mm'] = towed('towed-gun', 7.0, 1.6, 0.4, 0.9, [0.8, 0.3, 1.37], barrel(3.9, 0.057, 0.95));
// M-42 and 53-K 45 mm: the small shield, the long or the short 45 mm (4.9 / 4.0 m).
G['m-42-45mm'] = towed('towed-gun', 4.9, 1.63, 0.35, 0.9, [0.75, 0.25, 1.1], barrel(2.8, 0.045, 0.75));
G['53-k-45mm'] = towed('towed-gun', 4.0, 1.63, 0.35, 0.9, [0.75, 0.25, 1.1], barrel(2.0, 0.045, 0.75));
// QF 6-pounder (and the US M1 57 mm): the shield with its angled wings, the long 57 mm (4.8 x 1.8 m, 1.28 m).
G['qf-6-pounder'] = towed('towed-gun', 4.8, 1.8, 0.4, 0.9, [0.9, 0.25, 1.28], barrel(2.6, 0.057, 0.85));
// leFH 18: the big spoked wheels, the tall shield, the short fat 105 mm (6.1 x 1.98 m, 1.88 m).
G['lefh-18'] = towed('towed-gun', 6.1, 1.98, 0.6, 1.2, [0.95, 0.45, 1.88], barrel(2.6, 0.105, 1.15, { elevation: 0.15 }));
// M-30 122 mm: the shield with a sloped top, the barrel without a brake (5.9 x 1.98 m, 1.82 m).
G['m-30-122mm'] = towed('towed-gun', 5.9, 1.98, 0.6, 1.2, [0.95, 0.45, 1.82], barrel(2.7, 0.122, 1.15, { elevation: 0.15 }));
// QF 4.5-inch howitzer (5.0 x 1.9 m).
G['qf-4-5-howitzer'] = towed('towed-gun', 5.0, 1.9, 0.55, 1.1, [0.9, 0.4, 1.7], barrel(2.2, 0.114, 1.05, { elevation: 0.15 }));
// ML-20 152 mm gun-howitzer: the long barrel with its brake over the split trail, a low shield (8.18 x 2.35 m, 2.27 m).
G['ml-20-152mm'] = towed('towed-gun', 8.18, 2.35, 0.65, 1.4, [1.0, 0.55, 1.75], barrel(4.2, 0.152, 1.35, { elevation: 0.15, muzzle: true }));
// M1 155 mm howitzer: no shield, the long barrel on its recoil sledge (7.3 x 2.44 m).
G['m1-155mm-howitzer'] = towed('towed-gun', 7.3, 2.44, 0.6, 1.4, undefined, barrel(4.0, 0.155, 1.3, { elevation: 0.15 }));

// ---------------------------------------------------------------- War Thunder ids

/**
 * War Thunder WWII and interwar ground ids that had no mapping, from the public wiki's vehicle lists: each to its own
 * figure where there is one, otherwise to the nearest figure of its family or layout.
 */
const WT_WW2: Record<string, string> = {
  'uk_mark_v': 'mark-v-male',
  'fr_lorraine_155': 'lorraine-155',
  'fr_lorraine_37l': 'lorraine-37l',
  'us_m2_medium': 'm2a4',
  'us_lvt_a_1': 'lvt-a1',
  'us_lvt_a_1_trb': 'lvt-a1',
  'us_lvt_a_4': 'lvt-a1',
  'us_t86': 'lvt-a1',
  'us_m8_scott': 'm8-scott',
  'cn_m8_scott': 'm8-scott',
  'us_t77e1': 'm24-chaffee',
  'us_t18_e2': 'staghound',
  'us_t1e1': 'm6a1',
  'us_t1e1_90': 'm6a1',
  'us_m6a2e1': 'm6a1',
  'us_skink_aa': 'm4a1-sherman',
  'us_skink_aa_kit_3rank': 'm4a1-sherman',
  'uk_skink_aa': 'm4a1-sherman',
  'us_t25': 'm26-pershing',
  'us_t20': 'm26-pershing',
  'us_m50_ontos': 'm50-ontos',
  'us_t28': 't95-super-heavy',
  'germ_garford_putilov': 'putilov-garford',
  'ussr_garford_putilov': 'putilov-garford',
  'germ_a7v': 'a7v',
  'germ_flakpanzer_i_ausf_a': 'flakpanzer-38t',
  'germ_pzkpfw_35t': 'pz-38t',
  'germ_pzkpfw_38t_aufklarungspanzer': 'pz-38t',
  'germ_panzerjager_1': 'panzerjager-i',
  'germ_sdkfz_6_2_flak36': 'sdkfz-7-flakvierling',
  'germ_sdkfz_9_flak37': 'sdkfz-7-flakvierling',
  'germ_nbfz_vi': 'neubaufahrzeug',
  'germ_amd_35_kwk': 'amd-35',
  'germ_amd_35_kwk39': 'amd-35',
  'fr_amd_35': 'amd-35',
  'fr_amd_35_sa35': 'amd-35',
  'fr_amd_35_kwk39': 'amd-35',
  'germ_stuh_iii_ausf_g': 'stug-iii-g',
  'germ_pzsfl_iva_dickermax': 'dicker-max',
  'germ_pzsflk40_sturer_emil': 'sturer-emil',
  'germ_panzerwerfer_42': 'panzerwerfer-42',
  'germ_pzkpfw_ii_ausf_h': 'pz-ii',
  'germ_vk_3002m': 'panther-d',
  'germ_kv_2_754r': 'kv-2',
  'germ_panzerbefelhswagen_iv_ausf_j': 'pz-iv-j',
  'germ_kv_1b_finland': 'kv-1e',
  'germ_t_34_747': 't-34-1941',
  'germ_kv_1_kwk_40': 'kv-1',
  'germ_flakpanzer_zerstorer_45': 'wirbelwind',
  'germ_panzerbefelhswagen_vi_p': 'tiger-p',
  'germ_flakpanzer_v_coelian': 'coelian',
  'ussr_su_5_1': 't-26',
  'ussr_pzkpfw_iii_ausf_j_l42': 'pz-iii-h',
  'ussr_t_50': 't-50',
  'sw_t_50_fin': 't-50',
  'ussr_t_126sp': 't-50',
  'ussr_smk': 'smk',
  'uk_a1e1_independent': 't-35',
  'ussr_kv_8': 'kv-1',
  'ussr_bm_31_12': 'bm-13-katyusha',
  'ussr_kv_7_u13': 'su-152',
  'ussr_sdkfz_251_21_kit_3rank': 'sdkfz-251',
  'ussr_pzkpfw_v': 'panther-g',
  'uk_vickers_mk_6_aa_mk_1': 'valentine-aa',
  'uk_sarc_mk4_a': 'humber-mk4',
  'uk_alecto_mk_1': 'tetrarch',
  'uk_a25_mk_8': 'tetrarch',
  'uk_marmon_herrington_mk_6_2pdr': 'marmon-herrington-vi',
  'uk_marmon_herrington_mk_6_6pdr': 'marmon-herrington-vi',
  'uk_cruiser_ram_1': 'ram-ii',
  'uk_m4a5_ram_2': 'ram-ii',
  'uk_ac1_sentinel': 'ram-ii',
  'uk_ac4_thunderbolt': 'ram-ii',
  'uk_3_inch_gun_carrier': 'churchill-gun-carrier',
  'uk_a30_challenger': 'challenger-a30',
  'uk_a_33_excelsior': 'cromwell',
  'uk_tog_2': 'tog-ii',
  'uk_a39_tortoise': 'tortoise',
  'uk_a_43_black_prince': 'black-prince',
  'jp_type_4_ho_ro': 'wespe',
  'jp_type_94': 'universal-carrier',
  'jp_type_98_ta_se': 'type-98-ke-ni',
  'jp_type_2_ho_i': 'type-1-chi-he',
  'jp_type_2_ho_ni_2': 'ho-ni-i',
  'jp_type_3_ho_ni_i': 'ho-ni-i',
  'jp_type_3_ho_ni_iii': 'ho-ni-iii',
  'jp_type_3_ka_chi': 'type-2-ka-mi',
  'jp_type_95_heavy': 't-28',
  'jp_type_5_na_to': 'na-to',
  'jp_type_5_ho_ri_prototype': 'jagdtiger',
  'it_l6': 'type-95-ha-go',
  'it_l6_leone': 'type-95-ha-go',
  'it_l3_cc': 'universal-carrier',
  'it_semovente_l40': 'semovente-75-18',
  'it_as_42_metropolitana': 'ab-41',
  'it_as_42_47': 'ab-41',
  'it_sahariano': 'ab-41',
  'it_39m_csaba': 'ab-41',
  'sw_pbil_m40': 'ab-41',
  'it_toldi_ii_a': 'landsverk-l60',
  'it_40m_turan_1': 'turan-i',
  'it_41m_turan_2': 'turan-ii',
  'it_43m_turan_3': 'turan-iii',
  'it_p_40': 'p-40',
  'it_p_26_40': 'p-40',
  'it_semovente_m43_105': 'semovente-m43',
  'it_semovente_m43_75_34': 'semovente-m43',
  'it_semovente_m43_75_46': 'semovente-m43',
  'it_40_43m_zrinyi_2': 'zrinyi-ii',
  'it_44m_zrinyi_1': 'zrinyi-i',
  'fr_amc_34': 'hotchkiss-h35',
  'fr_amc_35': 'hotchkiss-h35',
  'fr_hotchkiss_h35': 'hotchkiss-h35',
  'fr_hotchkiss_h39': 'hotchkiss-h35',
  'fr_hotchkiss_h39_cambronne': 'hotchkiss-h35',
  'fr_renault_r39': 'hotchkiss-h35',
  'fr_fcm_36': 'fcm-36',
  'fr_renault_d2': 'renault-d2',
  'fr_somua_s35': 'somua-s35',
  'fr_somua_sau40': 'somua-s35',
  'fr_saint_chamond': 'saint-chamond',
  'fr_char_2c': 'char-2c',
  'fr_char_2c_bis': 'char-2c',
  'fr_citroen_kegresse_p4t': 'sdkfz-10',
  'sw_strv_m31': 'landsverk-l60',
  'sw_strv_m38': 'landsverk-l60',
  'sw_strv_m39': 'landsverk-l60',
  'sw_strv_m39_td': 'landsverk-l60',
  'sw_strv_m40l': 'landsverk-l60',
  'sw_lago_1': 'landsverk-l60',
  'sw_vickers_mk_e_37': 't-26',
  'sw_bt_42': 'bt-7',
  'sw_sav_m43_1944': 'sav-m43',
  'sw_sav_m43_1946': 'sav-m43',
  'sw_pvkv_m43_1946': 'pvkv-m43',
  'sw_pvkv_m43_1963': 'pvkv-m43',
  'sw_pvkv_ii': 'sav-m43',
  'sw_pvkv_iii': 'pvkv-m43',
  'sw_pvkv_iv': 'pvkv-m43',
};

export const ARMOUR_WW2: SpecSet = { ground: G, aliases: WT_WW2 };
