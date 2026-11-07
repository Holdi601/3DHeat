/**
 * Chassis that many figures share: the trucks and tracked carriers that
 * launchers, radars, cabins and guns are built on. Each is the published
 * size of the base vehicle; a family file spreads one of these and adds what
 * stands on it, so a Ural with a ZU-23 and a Ural with a cargo bed have the
 * same truck under them.
 *
 * Values are rounded published lengths, widths and heights; where a value is
 * an estimate it says so. For a flat-bed truck `hullHeight` is the bed's top,
 * where what it carries stands; for a covered or box body it is the body's top.
 */

import type { GroundSpec } from '../ground';
import type { Outline } from '../parts';

type Base = Omit<GroundSpec, 'cls'>;

/** The floor the truck builder sets a cab on, from the wheel radius. */
const floorOf = (r: number) => Math.max(0.6, r * 1.6);

/**
 * A normal-control cab in the vehicle frame: the bonnet (`bonnet` long, `bonnetH` high, `nose` how far its front
 * falls) ahead of a cab `cabLen` long and `cabH` high, the bonnet narrower than the cab (`bw` of the half-width).
 */
function bonnetCab(L: number, W: number, r: number, cabLen: number, cabH: number, bonnet: number, bonnetH: number, nose = 0.15, bw = 0.75, rake = 0.2): Outline {
  const h = L / 2;
  const x1 = h - bonnet;
  const x0 = x1 - cabLen;
  const w = W / 2 - 0.05;
  const f = floorOf(r);
  return { top: [[x0, cabH - 0.05], [x0 + 0.1, cabH], [x1 - rake, cabH], [x1, bonnetH + (cabH - bonnetH) * 0.35], [x1 + 0.02, bonnetH], [h - 0.15, bonnetH - nose * 0.6], [h, bonnetH - nose]], bottom: [[x0, f], [h, f]], plan: [[x0, w], [x1, w], [x1 + 0.02, w * bw], [h - 0.2, w * bw], [h, w * bw * 0.92]], round: 12, stations: 18 };
}

/** One of the MAZ-543's two narrow cabs, either side of the engine: `side` -1 left, 1 right. */
function twinCab(side: number): Outline {
  const h = 11.7 / 2;
  const f = floorOf(0.78);
  return { top: [[h - 2.6, 2.85], [h - 2.5, 2.92], [h - 0.55, 2.92], [h - 0.05, 1.9], [h, 1.75]], bottom: [[h - 2.6, f], [h, f]], plan: [[h - 2.6, 0.55], [h - 0.1, 0.55], [h, 0.45]], round: 10, side: side * 0.95, stations: 12 };
}

/** A cab-over (forward-control) cab: `cabLen` long behind the front, the windscreen raked back `rake`, the front falling to `face` of its height. */
function forwardCab(L: number, W: number, r: number, cabLen: number, cabH: number, rake = 0.35, face = 0.55, round = 10): Outline {
  const h = L / 2;
  const x0 = h - cabLen;
  const w = W / 2 - 0.05;
  const f = floorOf(r);
  return { top: [[x0, cabH - 0.05], [x0 + 0.1, cabH], [h - rake, cabH], [h - 0.05, cabH * face + 0.15], [h, cabH * face]], bottom: [[x0, f], [h - 0.05, f], [h, f + 0.1]], plan: [[x0, w], [h - 0.15, w], [h, w - 0.12]], round, stations: 14 };
}

// ---------------------------------------------------------------- trucks

/** Ural-4320 6x6, normal control (bonnet): 7.37 x 2.5 x 2.87 m. */
export const URAL_4320: Base = { chassis: 'wheeled', length: 7.37, width: 2.5, hullHeight: 2.87, axles: 3, axleAt: [0.72, -0.35, -0.72], wheelRadius: 0.54, hull: 'truck', cab: { length: 1.9, height: 2.6, bonnet: 1.4, outline: bonnetCab(7.37, 2.5, 0.54, 1.9, 2.6, 1.4, 1.95, 0.1, 0.8, 0.12) }, bed: 'covered' };
/** ZiL-131 6x6, bonnet: 7.04 x 2.5 x 2.48 m (cab), van body taller. */
export const ZIL_131: Base = { chassis: 'wheeled', length: 7.04, width: 2.5, hullHeight: 2.95, axles: 3, axleAt: [0.7, -0.38, -0.74], wheelRadius: 0.54, hull: 'truck', cab: { length: 1.8, height: 2.48, bonnet: 1.35, outline: bonnetCab(7.04, 2.5, 0.54, 1.8, 2.48, 1.35, 1.7, 0.35, 0.95, 0.25) }, bed: 'box' };
/** GAZ-66 4x4, cab-over: 5.66 x 2.34 x 2.44 m. */
export const GAZ_66: Base = { chassis: 'wheeled', length: 5.66, width: 2.34, hullHeight: 2.44, axles: 2, wheelRadius: 0.55, hull: 'truck', cab: { length: 1.7, height: 2.44, outline: forwardCab(5.66, 2.34, 0.55, 1.7, 2.44, 0.4, 0.5, 6) }, bed: 'covered' };
/** KamAZ-43101 6x6, cab-over: 7.9 x 2.5 x 3.2 m (with tilt). */
export const KAMAZ_43101: Base = { chassis: 'wheeled', length: 7.9, width: 2.5, hullHeight: 3.2, axles: 3, axleAt: [0.72, -0.4, -0.74], wheelRadius: 0.55, hull: 'truck', cab: { length: 2.2, height: 2.9, outline: forwardCab(7.9, 2.5, 0.55, 2.2, 2.9, 0.3, 0.55, 12) }, bed: 'covered' };
/** MAZ-543 8x8 (Scud, S-300 and Smerch carrier): 11.7 x 3.05 x 2.92 m, two cabs either side of the engine drawn as one. */
export const MAZ_543: Base = { chassis: 'wheeled', length: 11.7, width: 3.05, hullHeight: 1.5, axles: 4, axleAt: [0.72, 0.42, -0.28, -0.58], wheelRadius: 0.78, hull: 'truck', cab: { length: 2.6, height: 2.92, outline: twinCab(-1) }, bed: 'flat', addOns: [{ on: 'hull', kind: 'body', at: [0, 0.95, 0], size: [1, 1, 1], outline: twinCab(1) }, { on: 'hull', kind: 'box', at: [4.55, 0, 1.95], size: [2.4, 0.9, 0.9] }] };
/** MAZ-7310 / MZKT-7930 8x8 heavy chassis (Iskander, Smerch): about 12 x 3.05 x 3.0 m. */
export const MZKT_7930: Base = { chassis: 'wheeled', length: 12.7, width: 3.07, hullHeight: 1.4, axles: 4, axleAt: [0.75, 0.47, -0.28, -0.58], wheelRadius: 0.72, hull: 'truck', cab: { length: 2.4, height: 3.0, outline: forwardCab(12.7, 3.07, 0.72, 2.4, 3.0, 0.7, 0.42, 10) }, bed: 'flat' };
/** KrAZ-255B 6x6, bonnet: 8.65 x 2.75 x 2.94 m. */
export const KRAZ_255: Base = { chassis: 'wheeled', length: 8.65, width: 2.75, hullHeight: 1.3, axles: 3, axleAt: [0.72, -0.4, -0.72], wheelRadius: 0.67, hull: 'truck', cab: { length: 1.9, height: 2.94, bonnet: 1.8, outline: bonnetCab(8.65, 2.75, 0.67, 1.9, 2.94, 1.8, 2.25, 0.1, 0.8, 0.15) }, bed: 'flat' };
/** KrAZ-6322 6x6, bonnet: 9.0 x 2.5 x 2.9 m. */
export const KRAZ_6322: Base = { chassis: 'wheeled', length: 9.0, width: 2.5, hullHeight: 3.0, axles: 3, axleAt: [0.72, -0.38, -0.7], wheelRadius: 0.6, hull: 'truck', cab: { length: 2.0, height: 2.9, bonnet: 1.7, outline: bonnetCab(9.0, 2.5, 0.6, 2.0, 2.9, 1.7, 2.15, 0.15, 0.85, 0.2) }, bed: 'covered' };
/** M939 / M923 5-ton 6x6, bonnet: 7.9 x 2.5 x 2.9 m. */
export const M939: Base = { chassis: 'wheeled', length: 7.9, width: 2.5, hullHeight: 3.0, axles: 3, axleAt: [0.72, -0.38, -0.7], wheelRadius: 0.55, hull: 'truck', cab: { length: 1.8, height: 2.9, bonnet: 1.6, outline: bonnetCab(7.9, 2.5, 0.55, 1.8, 2.9, 1.6, 1.85, 0.05, 1.0, 0.1) }, bed: 'covered' };
/** M977 HEMTT 8x8, cab-over: 10.2 x 2.44 x 2.84 m. */
export const HEMTT: Base = { chassis: 'wheeled', length: 10.2, width: 2.44, hullHeight: 1.25, axles: 4, axleAt: [0.78, 0.5, -0.45, -0.72], wheelRadius: 0.62, hull: 'truck', cab: { length: 2.4, height: 2.84, outline: forwardCab(10.2, 2.44, 0.62, 2.4, 2.84, 0.2, 0.62, 14) }, bed: 'flat' };
/** FMTV / M1083 6x6, cab-over: 7.0 x 2.44 x 2.84 m. */
export const FMTV: Base = { chassis: 'wheeled', length: 7.0, width: 2.44, hullHeight: 3.0, axles: 3, axleAt: [0.7, -0.38, -0.72], wheelRadius: 0.6, hull: 'truck', cab: { length: 2.3, height: 2.84, outline: forwardCab(7.0, 2.44, 0.6, 2.3, 2.84, 0.25, 0.6, 14) }, bed: 'covered' };
/** MAN HX 6x6 / KAT1 class, cab-over: 8.4 x 2.55 x 3.2 m. */
export const MAN_HX: Base = { chassis: 'wheeled', length: 8.4, width: 2.55, hullHeight: 3.2, axles: 3, axleAt: [0.7, -0.4, -0.72], wheelRadius: 0.6, hull: 'truck', cab: { length: 2.3, height: 3.1, outline: forwardCab(8.4, 2.55, 0.6, 2.3, 3.1, 0.35, 0.5, 14) }, bed: 'covered' };
/** Toyota Hilux / Land Cruiser pickup (technicals): 5.3 x 1.85 x 1.8 m. */
export const PICKUP: Base = { chassis: 'wheeled', length: 5.3, width: 1.85, hullHeight: 0.9, axles: 2, wheelRadius: 0.38, hull: 'truck', cab: { length: 2.4, height: 1.8, bonnet: 1.3, outline: bonnetCab(5.3, 1.85, 0.38, 2.4, 1.8, 1.3, 1.1, 0.12, 0.95, 0.55) }, bed: 'flat' };

// ---------------------------------------------------------------- tracked carriers

/** MT-LB: 6.45 x 2.85 x 1.87 m hull, six road wheels, a cab at the front left. */
export const MT_LB: Base = { chassis: 'tracked', length: 6.45, width: 2.85, hullHeight: 1.6, roadWheels: 6, roadWheelRadius: 0.3, trackProfile: [[-2.5, 0], [2.4, 0], [3.05, 0.55], [2.75, 0.8], [-2.8, 0.8], [-3.1, 0.5]], running: { wheels: [-2.4, -1.45, -0.5, 0.45, 1.4, 2.35] }, hullOutline: { top: [[-3.22, 1.5], [-3.0, 1.6], [1.4, 1.6], [1.6, 1.75], [2.6, 1.75], [3.22, 1.0]], bottom: [[-3.22, 0.7], [2.9, 0.65], [3.22, 1.0]], plan: [[-3.22, 1.38], [3.22, 1.38]], round: 12, stations: 12 } };
/** M113: 4.86 x 2.69 x 1.85 m (hull roof), five road wheels. */
export const M113: Base = { chassis: 'tracked', length: 4.86, width: 2.69, hullHeight: 1.85, roadWheels: 5, roadWheelRadius: 0.31, trackProfile: [[-1.9, 0], [1.85, 0], [2.3, 0.55], [2.0, 0.8], [-2.05, 0.8], [-2.35, 0.5]], running: { wheels: [-1.6, -0.8, 0, 0.8, 1.6] }, hullOutline: { top: [[-2.43, 1.85], [1.1, 1.85], [2.43, 1.2]], bottom: [[-2.43, 0.8], [1.9, 0.8], [2.43, 1.2]], plan: [[-2.43, 1.32], [2.43, 1.3]], round: 14, stations: 10 } };
/** M548 / M730 cargo carrier: 5.9 x 2.69, cab at the front, flat bed behind. */
export const M548: Base = { chassis: 'tracked', length: 5.9, width: 2.69, hullHeight: 1.3, roadWheels: 5, roadWheelRadius: 0.31, trackProfile: [[-2.3, 0], [2.3, 0], [2.85, 0.55], [2.55, 0.8], [-2.55, 0.8], [-2.85, 0.5]], running: { wheels: [-2.0, -1.0, 0, 1.0, 2.0] }, hullOutline: { top: [[-2.95, 1.3], [1.2, 1.3], [1.3, 2.3], [2.6, 2.3], [2.95, 1.6]], bottom: [[-2.95, 0.8], [2.6, 0.8], [2.95, 1.2]], plan: [[-2.95, 1.32], [2.95, 1.3]], round: 14, stations: 12 } };
/** GM-5xx family (Buk, Kub, S-300V chassis): about 7.4-9.6 x 3.25 m, six road wheels. */
export const GM_CHASSIS: Base = { chassis: 'tracked', length: 7.4, width: 3.18, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.32, trackProfile: [[-3.0, 0], [3.0, 0], [3.65, 0.55], [3.35, 0.85], [-3.4, 0.85], [-3.65, 0.5]], running: { wheels: [-2.75, -1.65, -0.55, 0.55, 1.65, 2.75], rollers: [-2.2, -0.75, 0.75, 2.2] }, hullOutline: { top: [[-3.7, 1.45], [-3.5, 1.55], [2.4, 1.55], [3.7, 1.0]], bottom: [[-3.7, 0.85], [3.5, 0.85], [3.7, 1.0]], plan: [[-3.7, 1.55], [3.7, 1.5]], round: 12, stations: 12 } };
/** BRDM-2 4x4: 5.75 x 2.35 x 2.31 m (with turret), boat-shaped hull. */
export const BRDM_2: Base = { chassis: 'wheeled', length: 5.75, width: 2.37, hullHeight: 1.8, axles: 2, axleAt: [0.55, -0.42], wheelRadius: 0.52, hullOutline: { top: [[-2.88, 1.65], [-2.68, 1.8], [1.07, 1.8], [2.88, 1.05]], bottom: [[-2.88, 0.8], [-2.38, 0.6], [2.28, 0.6], [2.88, 0.9]], plan: [[-2.88, 1.08], [-2.48, 1.18], [1.8, 1.18], [2.88, 0.71]], round: 6, stations: 12 } };
/** HMMWV 4x4: 4.57 x 2.16 x 1.83 m. */
export const HMMWV: Base = { chassis: 'wheeled', length: 4.57, width: 2.16, hullHeight: 1.75, axles: 2, axleAt: [0.72, -0.62], wheelRadius: 0.45, hullOutline: { top: [[-2.28, 1.2], [-0.55, 1.2], [-0.5, 1.83], [0.35, 1.83], [0.75, 1.3], [2.1, 1.22], [2.28, 1.0]], bottom: [[-2.28, 0.7], [2.28, 0.7]], plan: [[-2.28, 1.05], [2.28, 1.05]], round: 12, stations: 16 } };
/** A two-axle towed shelter or generator trailer (estimate: 4.5 x 2.2 m). */
export const TRAILER: Base = { chassis: 'trailer', length: 4.5, width: 2.2, hullHeight: 1.2, axles: 1, wheelRadius: 0.45 };
/** A semitrailer for radars and launchers (estimate: 10 x 2.9 m), drawbar standing in for the fifth wheel. */
export const SEMI: Base = { chassis: 'trailer', length: 10.0, width: 2.9, hullHeight: 1.4, axles: 2, wheelRadius: 0.55 };
