/**
 * Tanks drawn from their outlines: each turret and hull from its side
 * profile and its plan, the track run with its sprocket and idler where they
 * sit, road wheels at their size, the gun with its fume extractor or muzzle
 * brake, so that a type is known by its silhouette from the side, the top
 * and the front, as recognition charts teach it.
 *
 * Overall sizes are published values (hull length without the gun, width,
 * height to the turret roof); the outlines are judged from the general shape
 * of the real vehicle (estimates, not traced from any drawing or model).
 * Turret outlines are relative to the turret's centre and base; hull and
 * track outlines in the vehicle's frame, forward from the middle, up from
 * the ground.
 */

import type { Named, SpecSet } from './index';
import type { GroundSpec, TurretSpec } from '../ground';
import type { Outline, P2 } from '../parts';

const G: Named<GroundSpec> = {};

/**
 * A modern tank hull: the rear plate, the flat deck, the upper glacis down to
 * the nose. `glacis` is the upper glacis' length along the deck, `nose` the
 * nose's height, `fender` the top of the track run.
 */
export function hull(L: number, W: number, deck: number, fender: number, glacis: number, nose: number, rearDrop = 0.25, round = 10): Outline {
  const h = L / 2;
  return {
    top: [[-h, deck - rearDrop], [-h + 0.25, deck], [h - glacis, deck], [h, nose]],
    // The lower glacis below the nose, down toward the idler.
    bottom: [[-h, fender], [h - 0.9, fender], [h - 0.12, nose * 0.72], [h, nose - 0.04]],
    plan: [[-h, W / 2 - 0.05], [-h + 0.2, W / 2], [h - 0.4, W / 2], [h, W / 2 - 0.25]],
    round,
    stations: 12,
  };
}

/** A track run seen from the side: the ground contact, the idler at the front and the sprocket at the back (or the other way), the top run. */
export function run(L: number, th: number, front: P2, back: P2, groundFrom = -L / 2 + 0.6, groundTo = L / 2 - 0.8): P2[] {
  return [[groundFrom, 0], [groundTo, 0], front, [front[0] - 0.3, th], [back[0] + 0.3, th], back];
}

/** A turret from its plan (back to front, half-widths) and its height profile; a flat bottom on the turret ring. */
export function turret(x: number, plan: P2[], top: P2[], round: number, gunX: number, extra: Partial<TurretSpec> = {}): TurretSpec {
  const xs = plan.map((p) => p[0]);
  const length = Math.max(...xs) - Math.min(...xs);
  const width = 2 * Math.max(...plan.map((p) => p[1]));
  const height = Math.max(...top.map((p) => p[1]));
  return { x, length, width, height, gunX, outline: { plan, top, bottom: [[Math.min(...xs), 0], [Math.max(...xs), 0]], round, stations: 16 }, ...extra };
}

// ---------------------------------------------------------------- Abrams

// M1A1 / M1A2: a long low hull with a very shallow upper glacis, the rear sprocket high; the flat faceted
// turret with angled cheeks, its side plates leaning in, and its long bustle overhanging the engine deck (hull 7.93 x
// 3.66 m, 2.44 m).
export const ABRAMS_TURRET = turret(-0.55, [[-2.85, 1.45], [-2.4, 1.72], [0.9, 1.8], [1.75, 1.55], [2.45, 0.95], [2.62, 0.5]], [[-2.85, 0.62], [-2.5, 0.78], [1.4, 0.84], [2.3, 0.62], [2.62, 0.42]], 9, 2.55, { slope: 0.045 });
export const ABRAMS: GroundSpec = {
  chassis: 'tracked', length: 7.93, width: 3.66, hullHeight: 1.6, roadWheels: 7, roadWheelRadius: 0.32, skirts: true,
  trackProfile: run(7.7, 0.95, [3.85, 0.62], [-3.85, 0.72], -3.2, 3.15),
  hullOutline: hull(7.93, 3.66, 1.6, 0.88, 2.3, 1.05, 0.2),
  turret: ABRAMS_TURRET,
  guns: [{ mount: 'turret', length: 5.3, calibre: 0.12, extractor: 0.55, at: 0.5 }],
  cupola: true,
};
G['m1a2-abrams'] = { cls: 'mbt', ...ABRAMS, rws: true };
G['m1a1-abrams'] = { cls: 'mbt', ...ABRAMS };
G['m1a2c-sepv3'] = { cls: 'mbt', ...ABRAMS, rws: true, turrets: [{ x: -1.0, length: 0.7, width: 0.6, height: 0.5, shape: 'box', side: 0.9, up: 0.84 }] };

// ---------------------------------------------------------------- Leopard 2

// Leopard 2A4: upright faces, a box turret with a blunt vertical front and a short bustle; the hull's upper glacis
// short and steep, the rear sprocket (hull 7.72 x 3.7 m, 2.48 m).
export const LEO2_HULL = hull(7.72, 3.7, 1.75, 0.92, 1.4, 1.2, 0.15);
export const LEO2: GroundSpec = {
  chassis: 'tracked', length: 7.72, width: 3.7, hullHeight: 1.75, roadWheels: 7, roadWheelRadius: 0.35, skirts: true,
  trackProfile: run(7.5, 0.95, [3.75, 0.6], [-3.75, 0.7], -3.1, 3.05),
  hullOutline: LEO2_HULL,
  turret: turret(-0.35, [[-2.25, 1.35], [-1.9, 1.6], [1.75, 1.65], [1.95, 1.55], [2.0, 0.6]], [[-2.25, 0.72], [-2.0, 0.8], [1.95, 0.84], [2.0, 0.6]], 12, 2.0),
  guns: [{ mount: 'turret', length: 5.3, calibre: 0.12, extractor: 0.5, at: 0.45 }],
  cupola: true,
};
G['leopard-2a4'] = { cls: 'mbt', ...LEO2 };
// Leopard 2A5 / 2A6: the spaced-armour arrowhead on the turret front, its top sloping down to the point; the A6 with the long L/55.
export const LEO2_WEDGE = turret(-0.35, [[-2.25, 1.35], [-1.9, 1.6], [1.5, 1.68], [2.25, 1.15], [2.85, 0.42]], [[-2.25, 0.72], [-2.0, 0.82], [1.4, 0.88], [2.85, 0.42]], 12, 2.25);
G['leopard-2a5'] = { cls: 'mbt', ...LEO2, turret: LEO2_WEDGE };
G['leopard-2a6'] = { cls: 'mbt', ...LEO2, turret: LEO2_WEDGE, guns: [{ mount: 'turret', length: 6.6, calibre: 0.12, extractor: 0.45, at: 0.45 }] };

// ---------------------------------------------------------------- Challenger 2, Leclerc, Merkava, Type 99

// Challenger 2: the slab-sided turret with a near-vertical front and a long bustle, a hull with a steep short glacis
// and a long flat deck; the L30 gun with its thermal sleeve and extractor (hull 8.3 x 3.52 m, 2.49 m).
G['challenger-2'] = {
  cls: 'mbt', chassis: 'tracked', length: 8.3, width: 3.52, hullHeight: 1.7, roadWheels: 6, roadWheelRadius: 0.36, skirts: true,
  trackProfile: run(8.1, 0.95, [4.05, 0.65], [-4.05, 0.75], -3.4, 3.35),
  hullOutline: hull(8.3, 3.52, 1.7, 0.9, 1.25, 1.15, 0.12),
  turret: turret(-0.6, [[-2.75, 1.35], [-2.4, 1.6], [1.55, 1.65], [2.05, 1.35], [2.15, 0.8]], [[-2.75, 0.78], [1.7, 0.86], [2.15, 0.5]], 14, 2.1),
  guns: [{ mount: 'turret', length: 6.0, calibre: 0.12, sleeve: 0.8, extractor: 0.55, at: 0.45 }],
  cupola: true,
};
// Leclerc: a compact square turret with an upright front, the autoloader bustle (hull 6.88 x 3.71 m, 2.53 m).
G['leclerc'] = {
  cls: 'mbt', chassis: 'tracked', length: 6.88, width: 3.71, hullHeight: 1.6, roadWheels: 6, roadWheelRadius: 0.33, skirts: true,
  trackProfile: run(6.7, 0.95, [3.35, 0.62], [-3.35, 0.72], -2.8, 2.75),
  hullOutline: hull(6.88, 3.71, 1.6, 0.9, 1.4, 1.1, 0.15),
  turret: turret(-0.45, [[-2.35, 1.3], [-2.0, 1.6], [1.55, 1.62], [1.75, 1.3], [1.8, 0.7]], [[-2.35, 0.8], [1.6, 0.9], [1.8, 0.7]], 14, 1.8),
  guns: [{ mount: 'turret', length: 6.2, calibre: 0.12, sleeve: 0.75, at: 0.45 }],
  cupola: true,
};
// Merkava IV: the engine in front under a long sloped nose, the long arrow turret far back with its bustle basket (hull 7.6 x 3.72 m, 2.66 m).
G['merkava-mk4'] = {
  cls: 'mbt', chassis: 'tracked', length: 7.6, width: 3.72, hullHeight: 1.7, roadWheels: 6, roadWheelRadius: 0.36, skirts: true,
  trackProfile: run(7.4, 1.0, [3.7, 0.8], [-3.7, 0.7], -3.0, 3.0),
  hullOutline: { top: [[-3.8, 1.5], [-3.6, 1.7], [0.6, 1.7], [3.8, 1.05]], bottom: [[-3.8, 0.95], [3.75, 0.95], [3.8, 1.0]], plan: [[-3.8, 1.8], [3.3, 1.86], [3.8, 1.4]], round: 10, stations: 12 },
  turret: turret(-1.2, [[-2.7, 1.1], [-2.2, 1.55], [0.4, 1.6], [2.0, 1.0], [2.9, 0.35]], [[-2.7, 0.7], [-0.4, 0.8], [2.9, 0.3]], 10, 2.6),
  guns: [{ mount: 'turret', length: 6.2, calibre: 0.12, sleeve: 0.7, at: 0.45 }],
  cupola: true,
};
// ZTZ-99: an arrowhead turret with a big bustle on a T-72-like long hull (7.6 x 3.5 m, 2.37 m).
G['ztz-99'] = {
  cls: 'mbt', chassis: 'tracked', length: 7.6, width: 3.5, hullHeight: 1.5, roadWheels: 6, roadWheelRadius: 0.37, skirts: true,
  trackProfile: run(7.4, 0.92, [3.7, 0.6], [-3.7, 0.65], -3.0, 3.0),
  hullOutline: hull(7.6, 3.5, 1.5, 0.85, 1.6, 0.95),
  turret: turret(-0.2, [[-2.5, 1.25], [-2.1, 1.55], [1.0, 1.6], [2.0, 1.1], [2.6, 0.45]], [[-2.5, 0.72], [0.9, 0.82], [2.6, 0.38]], 10, 2.2),
  guns: [{ mount: 'turret', length: 6.0, calibre: 0.125, sleeve: 0.7, extractor: 0.6, at: 0.45 }],
  cupola: true,
};

// ---------------------------------------------------------------- Soviet and Russian

// The T-64/72/80/90 hull: low, a long upper glacis, the rear sprocket, rubber side skirts; six road wheels.
export function sovietHull(L: number, W: number): Outline {
  return hull(L, W, 1.4, 0.8, 1.9, 0.95, 0.15);
}
// T-72A / T-72B: big road wheels (0.75 m), the domed cast turret well forward; the B with thick "Dolly Parton" cheeks (6.86 x 3.59 m, 2.23 m).
export const T72: GroundSpec = {
  chassis: 'tracked', length: 6.86, width: 3.59, hullHeight: 1.4, roadWheels: 6, roadWheelRadius: 0.375, skirts: true,
  trackProfile: run(6.7, 0.88, [3.35, 0.62], [-3.35, 0.7], -2.75, 2.7),
  hullOutline: sovietHull(6.86, 3.59),
  turret: turret(0.25, [[-1.55, 0.85], [-1.2, 1.3], [-0.3, 1.45], [0.7, 1.4], [1.25, 1.05], [1.55, 0.45]], [[-1.55, 0.4], [-1.0, 0.72], [0.1, 0.8], [0.9, 0.68], [1.55, 0.3]], 2.4, 1.4),
  guns: [{ mount: 'turret', length: 6.0, calibre: 0.125, sleeve: 0.55, extractor: 0.62, at: 0.42 }],
  cupola: true,
};
G['t-72a'] = { cls: 'mbt', ...T72 };
export const T72B_TURRET = turret(0.25, [[-1.55, 0.85], [-1.2, 1.3], [-0.3, 1.47], [0.8, 1.5], [1.4, 1.2], [1.7, 0.5]], [[-1.55, 0.4], [-1.0, 0.72], [0.2, 0.84], [1.1, 0.76], [1.7, 0.32]], 2.6, 1.55);
G['t-72b'] = { cls: 'mbt', ...T72, turret: T72B_TURRET };
// T-72B3: the B with Relikt bricks squaring its cheeks and the Sosna-U sight box on the roof.
G['t-72b3'] = { cls: 'mbt', ...T72, turret: turret(0.25, [[-1.55, 0.85], [-1.2, 1.3], [-0.3, 1.5], [1.0, 1.55], [1.6, 1.3], [1.8, 0.55]], [[-1.55, 0.4], [-1.0, 0.72], [0.2, 0.86], [1.4, 0.8], [1.8, 0.4]], 3.4, 1.65), turrets: [{ x: 1.0, length: 0.5, width: 0.45, height: 0.45, shape: 'box', side: -0.6, up: 0.8 }] };
// T-90A: the welded turret - flat roof, angled faceted sides, Kontakt-5 wedges on the front forming a squared nose - and the Shtora lamps either side of the gun (6.86 x 3.78 m, 2.23 m).
G['t-90a'] = { cls: 'mbt', ...T72, width: 3.78, turret: turret(0.15, [[-1.75, 1.05], [-1.35, 1.45], [0.5, 1.55], [1.35, 1.45], [1.75, 0.9], [1.85, 0.5]], [[-1.75, 0.55], [-1.3, 0.75], [0.9, 0.78], [1.85, 0.42]], 9, 1.7), turrets: [{ x: 1.85, length: 0.3, width: 0.38, height: 0.28, shape: 'box', side: 0.62, up: 0.42 }, { x: 1.85, length: 0.3, width: 0.38, height: 0.28, shape: 'box', side: -0.62, up: 0.42 }] };
// T-90M: the T-90A with Relikt and a box bustle at the back of the turret.
G['t-90m'] = { ...G['t-90a'], turret: turret(0.15, [[-2.3, 1.2], [-1.5, 1.4], [0.5, 1.6], [1.5, 1.5], [1.95, 1.0], [2.05, 0.5]], [[-2.3, 0.6], [-1.6, 0.68], [-1.4, 0.78], [1.0, 0.82], [2.05, 0.45]], 9, 1.9) };
// T-90 (1992): the T-72-style cast dome with Kontakt-5 and the Shtora lamps.
G['t-90'] = { cls: 'mbt', ...T72, width: 3.78, turret: T72B_TURRET, turrets: [{ x: 1.75, length: 0.3, width: 0.38, height: 0.28, shape: 'box', side: 0.62, up: 0.4 }, { x: 1.75, length: 0.3, width: 0.38, height: 0.28, shape: 'box', side: -0.62, up: 0.4 }] };
// T-80B: a longer hull (the turbine) with smaller road wheels (0.67 m) and return rollers; a T-64-like cast turret (7.0 x 3.58 m, 2.2 m).
export const T80: GroundSpec = {
  chassis: 'tracked', length: 7.0, width: 3.58, hullHeight: 1.4, roadWheels: 6, roadWheelRadius: 0.335, skirts: true,
  trackProfile: run(6.85, 0.85, [3.42, 0.58], [-3.42, 0.68], -2.9, 2.85),
  hullOutline: hull(7.0, 3.58, 1.4, 0.78, 1.95, 0.95, 0.1),
  turret: turret(0.3, [[-1.5, 0.8], [-1.15, 1.25], [-0.2, 1.42], [0.7, 1.38], [1.25, 1.0], [1.5, 0.45]], [[-1.5, 0.38], [-0.9, 0.7], [0.1, 0.76], [0.9, 0.64], [1.5, 0.3]], 2.4, 1.35),
  guns: [{ mount: 'turret', length: 6.0, calibre: 0.125, sleeve: 0.55, extractor: 0.62, at: 0.42 }],
  cupola: true,
};
G['t-80b'] = { cls: 'mbt', ...T80 };
// T-80U / T-80UD: the cast dome behind a horseshoe of Kontakt-5 bricks that squares the front and lifts it level with the roof.
G['t-80u'] = { cls: 'mbt', ...T80, turret: turret(0.3, [[-1.5, 0.8], [-1.15, 1.25], [-0.2, 1.48], [0.6, 1.62], [1.55, 1.6], [1.85, 1.15], [1.9, 0.5]], [[-1.5, 0.38], [-0.9, 0.7], [-0.1, 0.78], [1.5, 0.78], [1.9, 0.55]], 5, 1.75) };
// T-64BV: small road wheels (0.55 m) close together, a low small turret with Kontakt-1 (6.54 x 3.42 m, 2.17 m).
G['t-64bv'] = { cls: 'mbt', ...T80, length: 6.54, width: 3.42, roadWheelRadius: 0.28, trackProfile: run(6.4, 0.85, [3.2, 0.58], [-3.2, 0.66], -2.75, 2.7), hullOutline: hull(6.54, 3.42, 1.4, 0.78, 1.8, 0.95, 0.1), turret: turret(0.35, [[-1.4, 0.8], [-1.1, 1.2], [-0.2, 1.35], [0.8, 1.38], [1.3, 1.1], [1.55, 0.45]], [[-1.4, 0.35], [-0.8, 0.66], [0.2, 0.72], [1.0, 0.64], [1.55, 0.32]], 3, 1.45) };
// T-55 / T-54: five big road wheels with a gap behind the first, no return rollers; the round "frying pan" turret well forward (6.2 x 3.27 m, 2.35 m).
G['t-55a'] = {
  cls: 'mbt', chassis: 'tracked', length: 6.2, width: 3.27, hullHeight: 1.45, roadWheels: 5, roadWheelRadius: 0.41,
  trackProfile: run(6.0, 0.85, [3.0, 0.62], [-3.0, 0.68], -2.4, 2.35),
  hullOutline: hull(6.2, 3.27, 1.45, 0.8, 1.6, 0.95, 0.2),
  turret: turret(0.45, [[-1.3, 0.7], [-1.0, 1.1], [-0.1, 1.25], [0.8, 1.15], [1.25, 0.75], [1.4, 0.35]], [[-1.3, 0.35], [-0.8, 0.7], [0.0, 0.82], [0.8, 0.66], [1.4, 0.25]], 2.2, 1.25),
  guns: [{ mount: 'turret', length: 5.4, calibre: 0.1, extractor: 0.88, at: 0.4 }],
};
G['t-54'] = { ...G['t-55a'] };
G['type-59'] = { ...G['t-55a'] };
// T-62: longer hull, the turret further back, the 115 mm with its extractor a third back from the muzzle (6.63 x 3.52 m, 2.4 m).
G['t-62'] = { ...G['t-55a'], length: 6.63, width: 3.52, trackProfile: run(6.45, 0.85, [3.22, 0.62], [-3.22, 0.68], -2.6, 2.55), hullOutline: hull(6.63, 3.52, 1.45, 0.8, 1.7, 0.95, 0.2), turret: turret(0.2, [[-1.4, 0.75], [-1.05, 1.2], [-0.1, 1.38], [0.85, 1.25], [1.3, 0.8], [1.45, 0.35]], [[-1.4, 0.35], [-0.85, 0.72], [0.0, 0.84], [0.85, 0.68], [1.45, 0.25]], 2.2, 1.3), guns: [{ mount: 'turret', length: 5.6, calibre: 0.115, extractor: 0.68, at: 0.4 }] };
G['t-62m'] = { ...G['t-62'], turrets: [{ x: 1.25, length: 0.4, width: 1.6, height: 0.4, shape: 'box', up: 0.3 }] };

// ---------------------------------------------------------------- Second World War

// Tiger I: a slab box - the superstructure overhanging the tracks, a near-vertical front plate, flat deck and sides;
// eight big interleaved wheels; the horseshoe turret with vertical sides and a broad flat mantlet (hull 6.32 x 3.56 m, 3.0 m).
G['tiger-i'] = {
  cls: 'heavy-tank', chassis: 'tracked', length: 6.32, width: 3.56, hullHeight: 1.95, roadWheels: 8, roadWheelRadius: 0.4,
  trackProfile: run(6.2, 1.0, [3.1, 0.75], [-3.1, 0.7], -2.55, 2.5),
  hullOutline: { top: [[-3.16, 1.6], [-3.0, 1.95], [2.55, 1.95], [2.65, 1.75], [3.16, 1.3]], bottom: [[-3.16, 0.95], [3.1, 0.95], [3.16, 1.0]], plan: [[-3.16, 1.7], [3.16, 1.78]], round: 16, stations: 10 },
  turret: turret(0.05, [[-1.55, 0.85], [-1.25, 1.3], [0.4, 1.4], [1.15, 1.35], [1.3, 1.2], [1.35, 0.95]], [[-1.55, 0.85], [1.35, 0.9]], 10, 1.4),
  guns: [{ mount: 'turret', length: 4.6, calibre: 0.088, muzzle: true, at: 0.5 }],
  cupola: true,
};
// Panther: a long sloped glacis, sloped hull sides and rear; a narrow turret tapering to its rounded mantlet, the long 75 mm with its brake (hull 6.87 x 3.42 m, 2.99 m).
G['panther'] = {
  cls: 'medium-tank', chassis: 'tracked', length: 6.87, width: 3.42, hullHeight: 1.9, roadWheels: 8, roadWheelRadius: 0.43, skirts: true,
  trackProfile: run(6.7, 1.0, [3.35, 0.78], [-3.35, 0.72], -2.7, 2.6),
  hullOutline: { top: [[-3.44, 1.45], [-3.1, 1.9], [1.6, 1.9], [3.44, 0.95]], bottom: [[-3.44, 0.95], [3.4, 0.95], [3.44, 0.98]], plan: [[-3.44, 1.62], [3.44, 1.65]], round: 6, stations: 12 },
  turret: turret(-0.25, [[-1.7, 1.25], [0.6, 1.15], [1.3, 0.95], [1.55, 0.55]], [[-1.7, 0.85], [0.8, 0.88], [1.4, 0.65], [1.55, 0.4]], 5, 1.5),
  guns: [{ mount: 'turret', length: 4.9, calibre: 0.075, muzzle: true, at: 0.42 }],
  cupola: true,
};

// Leopard 1A5: seven road wheels, the welded add-on turret squared front and sides with its long sloped rear; the 105 mm with sleeve and extractor (hull 7.09 x 3.37 m, 2.76 m).
export const LEO1: GroundSpec = {
  chassis: 'tracked', length: 7.09, width: 3.37, hullHeight: 1.6, roadWheels: 7, roadWheelRadius: 0.355, skirts: true,
  trackProfile: run(6.9, 0.92, [3.45, 0.62], [-3.45, 0.72], -2.85, 2.8),
  hullOutline: hull(7.09, 3.37, 1.6, 0.86, 1.5, 1.1, 0.2),
  turret: turret(-0.1, [[-1.85, 1.0], [-1.3, 1.45], [0.8, 1.52], [1.55, 1.3], [1.85, 0.7]], [[-1.85, 0.55], [-1.2, 0.92], [0.7, 1.0], [1.6, 0.62], [1.85, 0.48]], 8, 1.8),
  guns: [{ mount: 'turret', length: 5.4, calibre: 0.105, sleeve: 0.7, extractor: 0.55, at: 0.45 }],
  cupola: true,
};
G['leopard-1a5'] = { cls: 'mbt', ...LEO1 };
// Leopard 1A1-A4: the rounded cast turret.
G['leopard-1a3'] = { cls: 'mbt', ...LEO1, turret: turret(-0.1, [[-1.8, 0.85], [-1.3, 1.35], [0.8, 1.45], [1.5, 1.1], [1.75, 0.55]], [[-1.8, 0.45], [-1.1, 0.88], [0.6, 0.96], [1.4, 0.65], [1.75, 0.4]], 2.8, 1.65) };
// K2 Black Panther: a long angular wedge turret with a big bustle on a low hull, the L/55 (hull 7.5 x 3.6 m, 2.4 m).
G['k2-black-panther'] = {
  cls: 'mbt', chassis: 'tracked', length: 7.5, width: 3.6, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.36, skirts: true,
  trackProfile: run(7.3, 0.9, [3.65, 0.6], [-3.65, 0.68], -3.0, 2.95),
  hullOutline: hull(7.5, 3.6, 1.55, 0.85, 1.7, 1.0, 0.15),
  turret: turret(-0.3, [[-2.5, 1.3], [-2.1, 1.6], [1.2, 1.65], [2.2, 1.1], [2.6, 0.5]], [[-2.5, 0.75], [1.1, 0.82], [2.6, 0.4]], 10, 2.4),
  guns: [{ mount: 'turret', length: 6.6, calibre: 0.12, extractor: 0.5, at: 0.45 }],
  cupola: true,
};
// T-34/76 (1943 "nut" turret): five big Christie wheels, the sloped glacis from the deck to a low nose, the small hexagonal turret far forward (hull 5.92 x 3.0 m, 2.45 m).
export const T34_HULL: Outline = { top: [[-2.96, 0.95], [-2.55, 1.5], [1.15, 1.5], [2.96, 0.62]], bottom: [[-2.96, 0.78], [2.9, 0.78], [2.96, 0.62]], plan: [[-2.96, 1.45], [2.96, 1.45]], round: 6, stations: 10 };
G['t-34-76'] = {
  cls: 'medium-tank', chassis: 'tracked', length: 5.92, width: 3.0, hullHeight: 1.5, roadWheels: 5, roadWheelRadius: 0.41,
  trackProfile: run(5.8, 0.85, [2.9, 0.6], [-2.9, 0.62], -2.3, 2.3),
  hullOutline: T34_HULL,
  turret: turret(0.75, [[-1.2, 0.85], [-0.9, 1.12], [0.8, 1.12], [1.2, 0.7], [1.3, 0.4]], [[-1.2, 0.55], [-0.9, 0.75], [1.0, 0.75], [1.3, 0.45]], 8, 1.3),
  guns: [{ mount: 'turret', length: 2.0, calibre: 0.076, at: 0.45 }],
};
G['t-34-76-1943'] = { ...G['t-34-76'] };
// T-34-85: the hull a little longer, the big cast three-man turret further back, the long 85 mm (hull 6.1 m, 8.15 m with the gun).
G['t-34-85'] = { ...G['t-34-76'], length: 6.1, trackProfile: run(6.0, 0.85, [3.0, 0.6], [-3.0, 0.62], -2.4, 2.4), hullOutline: { ...T34_HULL, top: [[-3.05, 0.95], [-2.65, 1.5], [1.2, 1.5], [3.05, 0.62]], bottom: [[-3.05, 0.78], [3.0, 0.78], [3.05, 0.62]], plan: [[-3.05, 1.45], [3.05, 1.45]] }, turret: turret(0.45, [[-1.6, 0.9], [-1.2, 1.25], [0.8, 1.3], [1.4, 0.9], [1.5, 0.5]], [[-1.6, 0.55], [-1.0, 0.85], [0.6, 0.9], [1.5, 0.5]], 3, 1.5), guns: [{ mount: 'turret', length: 3.6, calibre: 0.085, at: 0.45 }], cupola: true };
// M4 Sherman: a tall hull with the rounded glacis, small bogie wheels, the front sprocket high, the round cast turret (5.84 x 2.62 m, 2.74 m).
G['m4-sherman'] = {
  cls: 'medium-tank', chassis: 'tracked', length: 5.84, width: 2.62, hullHeight: 1.9, roadWheels: 6, roadWheelRadius: 0.255,
  trackProfile: run(5.8, 0.95, [2.92, 0.82], [-2.92, 0.5], -2.4, 2.2),
  hullOutline: { top: [[-2.92, 1.65], [-2.7, 1.9], [0.9, 1.9], [2.5, 1.2], [2.92, 0.82]], bottom: [[-2.92, 0.95], [2.8, 0.95], [2.92, 0.82]], plan: [[-2.92, 1.25], [2.4, 1.31], [2.92, 1.1]], round: 5, stations: 12 },
  turret: turret(0.2, [[-1.25, 0.85], [-0.9, 1.1], [0.6, 1.15], [1.1, 0.95], [1.25, 0.6]], [[-1.25, 0.45], [-0.8, 0.8], [0.5, 0.85], [1.25, 0.45]], 2.4, 1.2),
  guns: [{ mount: 'turret', length: 2.3, calibre: 0.075, at: 0.42 }],
  cupola: true,
};
G['m4a3-76'] = { ...G['m4-sherman'], turret: turret(0.1, [[-1.55, 0.9], [-1.1, 1.18], [0.6, 1.22], [1.2, 1.0], [1.35, 0.6]], [[-1.55, 0.5], [-0.9, 0.85], [0.5, 0.9], [1.35, 0.48]], 2.6, 1.3), guns: [{ mount: 'turret', length: 3.6, calibre: 0.076, muzzle: true, at: 0.42 }] };
G['m4a4-firefly'] = { ...G['m4-sherman'], length: 6.06, guns: [{ mount: 'turret', length: 4.2, calibre: 0.076, muzzle: true, at: 0.42 }] };
// Tiger II: a long sloped glacis to a flat deck, nine interleaved wheels, the long Henschel turret with its small sloped face, the 88 mm L/71 (hull 7.38 x 3.75 m, 3.09 m).
G['tiger-ii'] = {
  cls: 'heavy-tank', chassis: 'tracked', length: 7.38, width: 3.75, hullHeight: 1.95, roadWheels: 9, roadWheelRadius: 0.4,
  trackProfile: run(7.2, 1.0, [3.6, 0.78], [-3.6, 0.72], -2.9, 2.8),
  hullOutline: { top: [[-3.69, 1.5], [-3.4, 1.95], [1.4, 1.95], [3.69, 0.98]], bottom: [[-3.69, 1.0], [3.6, 1.0], [3.69, 0.98]], plan: [[-3.69, 1.72], [3.69, 1.75]], round: 8, stations: 12 },
  turret: turret(-0.15, [[-2.4, 1.1], [-2.0, 1.4], [0.9, 1.4], [1.6, 1.05], [1.75, 0.55]], [[-2.4, 0.7], [-2.0, 0.85], [0.8, 0.9], [1.5, 0.65], [1.75, 0.45]], 8, 1.75),
  guns: [{ mount: 'turret', length: 6.0, calibre: 0.088, muzzle: true, at: 0.45 }],
  cupola: true,
};
// IS-2: a long hull, the rounded cast turret, the 122 mm with its big double-baffle muzzle brake (hull 6.77 x 3.07 m, 2.73 m).
G['is-2'] = {
  cls: 'heavy-tank', chassis: 'tracked', length: 6.77, width: 3.07, hullHeight: 1.6, roadWheels: 6, roadWheelRadius: 0.37,
  trackProfile: run(6.6, 0.95, [3.3, 0.66], [-3.3, 0.66], -2.7, 2.65),
  hullOutline: hull(6.77, 3.07, 1.6, 0.9, 1.4, 1.0, 0.25, 6),
  turret: turret(0.15, [[-1.5, 0.8], [-1.1, 1.25], [0.6, 1.3], [1.3, 0.9], [1.45, 0.5]], [[-1.5, 0.5], [-0.8, 0.9], [0.6, 0.95], [1.45, 0.5]], 2.4, 1.45),
  guns: [{ mount: 'turret', length: 4.9, calibre: 0.122, muzzle: true, at: 0.45 }],
  cupola: true,
};

// ---------------------------------------------------------------- more families (War Thunder trees)

// Centurion: a long hull with a sloped glacis, six road wheels in pairs under side skirts, the big rounded cast turret
// with its stowage bins, the 20-pounder or L7 with extractor (hull 7.82 x 3.39 m, 3.01 m); also Sho't, Olifant, Strv 81.
G['centurion'] = {
  cls: 'mbt', chassis: 'tracked', length: 7.82, width: 3.39, hullHeight: 1.8, roadWheels: 6, roadWheelRadius: 0.34, skirts: true,
  trackProfile: run(7.6, 1.0, [3.8, 0.75], [-3.8, 0.7], -3.1, 3.0),
  hullOutline: hull(7.82, 3.39, 1.8, 0.95, 1.9, 1.15, 0.25, 8),
  turret: turret(0.0, [[-2.0, 1.0], [-1.6, 1.55], [0.6, 1.62], [1.4, 1.35], [1.8, 0.7]], [[-2.0, 0.6], [-1.4, 0.95], [0.6, 1.0], [1.5, 0.65], [1.8, 0.5]], 3, 1.75),
  guns: [{ mount: 'turret', length: 5.6, calibre: 0.105, extractor: 0.6, at: 0.45 }],
  cupola: true,
};
// AMX-30: a low hull, the cast turret long and narrow at the front, the 105 mm with its sleeve (hull 6.59 x 3.1 m, 2.29 m).
G['amx-30'] = {
  cls: 'mbt', chassis: 'tracked', length: 6.59, width: 3.1, hullHeight: 1.5, roadWheels: 5, roadWheelRadius: 0.4,
  trackProfile: run(6.4, 0.88, [3.2, 0.62], [-3.2, 0.66], -2.6, 2.55),
  hullOutline: hull(6.59, 3.1, 1.5, 0.82, 1.6, 0.95, 0.15, 6),
  turret: turret(0.0, [[-1.9, 0.9], [-1.4, 1.35], [0.4, 1.4], [1.4, 0.9], [1.8, 0.45]], [[-1.9, 0.5], [-1.2, 0.85], [0.4, 0.88], [1.8, 0.4]], 2.6, 1.75),
  guns: [{ mount: 'turret', length: 5.4, calibre: 0.105, sleeve: 0.8, at: 0.45 }],
  cupola: true,
};
// AMX-13: a light hull with the oscillating turret set far back and its long gun (hull 4.88 x 2.51 m, 2.35 m).
G['amx-13'] = {
  cls: 'light-tank', chassis: 'tracked', length: 4.88, width: 2.51, hullHeight: 1.3, roadWheels: 5, roadWheelRadius: 0.3,
  trackProfile: run(4.75, 0.78, [2.4, 0.6], [-2.4, 0.55], -1.9, 1.9),
  hullOutline: hull(4.88, 2.51, 1.3, 0.72, 1.1, 0.9, 0.1, 6),
  turret: turret(-0.8, [[-1.6, 0.8], [-1.2, 1.0], [0.6, 1.0], [1.2, 0.6]], [[-1.6, 0.85], [0.6, 0.9], [1.2, 0.5]], 6, 1.15),
  guns: [{ mount: 'turret', length: 4.2, calibre: 0.075, muzzle: true, at: 0.45 }],
};
// Type 61 (hull 6.3 x 2.95 m, 2.49 m), Type 74 (hull 6.7 x 3.18 m, 2.25 m, a low cast dome), Type 90 (hull 7.5 x 3.43 m, 2.3 m, a slab box turret), Type 10 (hull 7.5 x 3.24 m, 2.3 m, an angular wedge).
G['type-61'] = { ...G['amx-30'], length: 6.3, width: 2.95, hullHeight: 1.6, turret: turret(0.0, [[-1.6, 0.9], [-1.2, 1.25], [0.6, 1.3], [1.3, 0.95], [1.5, 0.5]], [[-1.6, 0.55], [-1.0, 0.85], [0.5, 0.9], [1.5, 0.45]], 2.6, 1.45), guns: [{ mount: 'turret', length: 4.4, calibre: 0.09, muzzle: true, at: 0.45 }] };
G['type-74'] = { ...G['amx-30'], length: 6.7, width: 3.18, roadWheels: 5, turret: turret(0.1, [[-1.9, 0.9], [-1.4, 1.4], [0.5, 1.48], [1.4, 1.05], [1.75, 0.5]], [[-1.9, 0.45], [-1.2, 0.78], [0.4, 0.82], [1.75, 0.38]], 2.4, 1.7) };
G['type-90'] = { ...G['leopard-2a4'], length: 7.5, width: 3.43, roadWheels: 6, turret: turret(-0.3, [[-2.2, 1.3], [-1.8, 1.55], [1.4, 1.6], [1.8, 1.4], [1.85, 0.6]], [[-2.2, 0.72], [1.5, 0.82], [1.85, 0.62]], 14, 1.85) };
G['type-10'] = { ...G['leopard-2a4'], length: 7.5, width: 3.24, roadWheels: 5, turret: turret(-0.2, [[-2.3, 1.2], [-1.8, 1.5], [1.0, 1.55], [2.0, 1.1], [2.35, 0.5]], [[-2.3, 0.7], [1.0, 0.8], [2.35, 0.45]], 10, 2.2) };
// Ariete / OF-40: a long welded turret with a sloped face and big bustle (Ariete hull 7.59 x 3.6 m, 2.5 m).
G['ariete'] = { ...G['leopard-2a4'], length: 7.59, width: 3.6, turret: turret(-0.4, [[-2.5, 1.2], [-2.0, 1.55], [1.0, 1.6], [1.9, 1.2], [2.2, 0.55]], [[-2.5, 0.7], [1.0, 0.82], [2.2, 0.45]], 10, 2.1) };
// Strv 103 "S-tank": turretless - the gun fixed in a low wedge hull, aimed by the suspension (hull 7.04 x 3.63 m, 2.14 m).
G['strv-103'] = {
  cls: 'tank-destroyer', chassis: 'tracked', length: 7.04, width: 3.63, hullHeight: 1.9, roadWheels: 4, roadWheelRadius: 0.4,
  trackProfile: run(6.9, 0.85, [3.45, 0.55], [-3.45, 0.6], -2.8, 2.8),
  hullOutline: { top: [[-3.52, 1.6], [-3.2, 1.9], [-0.5, 1.9], [3.52, 0.9]], bottom: [[-3.52, 0.8], [3.4, 0.8], [3.52, 0.9]], plan: [[-3.52, 1.7], [2.8, 1.8], [3.52, 1.3]], round: 12, stations: 10 },
  guns: [{ mount: 'hull', length: 5.6, calibre: 0.105, extractor: 0.6, x: 1.0, at: 0.83 }],
};
// M41 Walker Bulldog: a light tank with a long boxy turret and bustle (hull 5.82 x 3.2 m, 2.73 m). Its open running
// gear: five 0.65 m road wheels and three return rollers a side, the sprocket at the back and the idler at the front
// both clear of the ground; about 3.1 m of track on the ground (the published 10.2 psi on two 21 in tracks at 23.5 t).
G['m41'] = { ...G['leopard-1a3'], cls: 'light-tank', length: 5.82, width: 3.2, roadWheels: 5, roadWheelRadius: 0.32, trackProfile: run(5.7, 0.9, [2.85, 0.6], [-2.85, 0.65], -1.55, 1.55), running: { wheels: [1.42, 0.71, 0, -0.71, -1.42], rollers: [1.05, 0, -1.05] }, hullOutline: hull(5.82, 3.2, 1.6, 0.86, 1.2, 1.15, 0.2, 8), turret: turret(-0.1, [[-1.9, 0.95], [-1.4, 1.25], [0.8, 1.3], [1.4, 1.05], [1.6, 0.6]], [[-1.9, 0.55], [-1.3, 0.85], [0.8, 0.9], [1.6, 0.55]], 6, 1.6), guns: [{ mount: 'turret', length: 3.6, calibre: 0.076, extractor: 0.6, muzzle: true, at: 0.45 }] };
// M103 (hull 6.98 x 3.76 m) and Conqueror (hull 7.72 x 3.99 m): heavy tanks with very long cast turrets and big guns.
G['m103'] = { ...G['centurion'], cls: 'heavy-tank', length: 6.98, width: 3.76, roadWheels: 7, turret: turret(0.1, [[-2.6, 1.0], [-2.0, 1.6], [0.6, 1.7], [1.5, 1.4], [1.9, 0.7]], [[-2.6, 0.55], [-1.6, 1.0], [0.6, 1.05], [1.9, 0.5]], 2.6, 1.85), guns: [{ mount: 'turret', length: 7.0, calibre: 0.12, extractor: 0.55, at: 0.45 }] };
G['conqueror'] = { ...G['m103'], length: 7.72, width: 3.99, turret: turret(-0.2, [[-2.8, 1.2], [-2.2, 1.65], [0.6, 1.7], [1.5, 1.35], [1.9, 0.7]], [[-2.8, 0.75], [-2.0, 1.05], [0.6, 1.1], [1.9, 0.6]], 4, 1.85) };
// T-10M: the IS-family hull lengthened, seven road wheels, a flatter cast turret, the long 122 mm (hull 7.25 x 3.38 m, 2.59 m).
G['t-10m'] = { ...G['is-2'], length: 7.25, width: 3.38, roadWheels: 7, trackProfile: run(7.1, 0.95, [3.55, 0.66], [-3.55, 0.66], -2.9, 2.85), hullOutline: hull(7.25, 3.38, 1.6, 0.9, 1.7, 1.0, 0.25, 6), turret: turret(0.0, [[-1.7, 0.85], [-1.2, 1.4], [0.6, 1.45], [1.5, 1.0], [1.7, 0.5]], [[-1.7, 0.45], [-0.9, 0.85], [0.6, 0.9], [1.7, 0.45]], 2.4, 1.7), guns: [{ mount: 'turret', length: 6.0, calibre: 0.122, muzzle: true, extractor: 0.75, at: 0.45 }] };
// Maus: the super-heavy - a huge box hull, skirts to the ground, a massive turret (hull 9.03 x 3.67 m, 3.63 m).
G['maus'] = {
  cls: 'heavy-tank', chassis: 'tracked', length: 9.03, width: 3.67, hullHeight: 2.3, roadWheels: 12, roadWheelRadius: 0.27, skirts: true,
  trackProfile: run(8.9, 1.2, [4.45, 0.85], [-4.45, 0.8], -3.6, 3.6),
  hullOutline: { top: [[-4.5, 2.0], [-4.2, 2.3], [2.6, 2.3], [4.5, 1.2]], bottom: [[-4.5, 1.1], [4.4, 1.1], [4.5, 1.2]], plan: [[-4.5, 1.83], [4.5, 1.83]], round: 12, stations: 10 },
  turret: turret(-0.8, [[-2.3, 1.2], [-1.8, 1.5], [1.2, 1.5], [1.9, 1.2], [2.1, 0.8]], [[-2.3, 1.0], [1.6, 1.05], [2.1, 0.7]], 6, 2.0),
  guns: [{ mount: 'turret', length: 5.4, calibre: 0.128, at: 0.5 }],
};
// Arjun (hull 10.19 m with gun; 7.7 x 3.85 m hull, 2.32 m): a Leopard-like hull, a big box turret.
G['arjun'] = { ...G['leopard-2a4'], length: 7.7, width: 3.85, turret: turret(-0.3, [[-2.3, 1.35], [-1.9, 1.65], [1.5, 1.7], [1.95, 1.5], [2.0, 0.7]], [[-2.3, 0.78], [1.7, 0.85], [2.0, 0.62]], 12, 2.0) };
// PzH 2000: a long hull, a big box turret over the back with the 155 mm L52 (hull 7.87 x 3.58 m, 3.06 m); AS90 (hull 7.2 x 3.4 m, 3.0 m).
G['pzh-2000'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.87, width: 3.58, hullHeight: 1.6, roadWheels: 7, roadWheelRadius: 0.33, skirts: true, trackProfile: run(7.7, 0.9, [3.85, 0.65], [-3.85, 0.6], -3.1, 3.05), hullOutline: hull(7.87, 3.58, 1.6, 0.85, 2.0, 1.05, 0.15), turret: turret(-1.3, [[-2.3, 1.55], [2.0, 1.6], [2.3, 1.2], [2.35, 0.7]], [[-2.3, 1.3], [2.0, 1.35], [2.35, 0.9]], 12, 2.3), guns: [{ mount: 'turret', length: 8.0, calibre: 0.155, muzzle: true, extractor: 0.55, at: 0.5, elevation: 0.05 }] };
G['as90'] = { ...G['pzh-2000'], length: 7.2, width: 3.4, roadWheels: 6, guns: [{ mount: 'turret', length: 6.0, calibre: 0.155, muzzle: true, extractor: 0.55, at: 0.5, elevation: 0.05 }] };
// M42 Duster: an open turret with twin 40 mm on the M41 hull (5.82 x 3.22 m, 2.85 m).
G['m42-duster'] = { ...G['m41'], cls: 'spaa', turret: { x: -0.4, length: 2.4, width: 2.4, height: 0.8, shape: 'open' }, guns: [{ mount: 'turret', count: 2, length: 2.6, calibre: 0.04, spread: 0.5, elevation: 0.35, at: 0.7 }] };
// Wiesel 1: a tiny air-portable carrier with a TOW or 20 mm (3.55 x 1.82 m, 1.83 m).
G['wiesel'] = { cls: 'light-tank', chassis: 'tracked', length: 3.55, width: 1.82, hullHeight: 1.1, roadWheels: 4, roadWheelRadius: 0.22, hull: 'box', turret: { x: -0.2, length: 0.8, width: 0.6, height: 0.4, shape: 'box', side: 0.3 }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.02 }] };
// Kanonenjagdpanzer (6.24 x 2.98 m, 2.09 m): a low casemate with a 90 mm; Raketenjagdpanzer / Jaguar: the same hull with an ATGM launcher on the roof.
G['kanonenjagdpanzer'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 6.24, width: 2.98, hullHeight: 1.1, roadWheels: 5, roadWheelRadius: 0.33, hull: 'tank', turret: { x: 0.6, length: 3.6, width: 2.7, height: 0.8, shape: 'casemate', slope: 0.12 }, guns: [{ mount: 'turret', length: 3.6, calibre: 0.09, at: 0.45 }] };
G['raketenjagdpanzer'] = { ...G['kanonenjagdpanzer'], guns: undefined, missiles: [{ mount: 'turret-top', rows: 1, cols: 1, length: 1.4, diameter: 0.2, boxes: true, elevation: 0.05, x: 0.4 }] };
// Ikv 91: a light amphibious tank destroyer with a turret far forward (6.41 x 3.0 m, 2.32 m).
G['ikv-91'] = { ...G['amx-13'], cls: 'tank-destroyer', length: 6.41, width: 3.0, roadWheels: 6, hullOutline: hull(6.41, 3.0, 1.35, 0.75, 1.6, 0.9, 0.1, 6), turret: turret(0.6, [[-1.2, 0.9], [-0.9, 1.15], [0.8, 1.15], [1.3, 0.7]], [[-1.2, 0.6], [0.8, 0.65], [1.3, 0.4]], 8, 1.3), guns: [{ mount: 'turret', length: 4.0, calibre: 0.09, at: 0.45 }] };
// Char B1 bis: a 75 mm low in the hull front and a 47 mm turret on top (6.37 x 2.46 m, 2.79 m).
G['b1-bis'] = { cls: 'heavy-tank', chassis: 'tracked', length: 6.37, width: 2.46, hullHeight: 2.1, roadWheels: 14, hull: 'ww2', skirts: true, turret: { x: 0.6, length: 1.6, width: 1.4, height: 0.7, shape: 'cast' }, guns: [{ mount: 'turret', length: 1.3, calibre: 0.047 }, { mount: 'hull', length: 0.9, calibre: 0.075, side: 0.5, at: 0.45, x: 2.8 }] };
// M22 Locust: a tiny airborne tank (3.94 x 2.16 m, 1.85 m).
G['m22-locust'] = { cls: 'light-tank', chassis: 'tracked', length: 3.94, width: 2.16, hullHeight: 1.25, roadWheels: 4, roadWheelRadius: 0.25, hull: 'ww2', turret: { x: 0.1, length: 1.5, width: 1.3, height: 0.6, shape: 'sloped' }, guns: [{ mount: 'turret', length: 1.2, calibre: 0.037 }] };

export const TANKS: SpecSet = { ground: G };
