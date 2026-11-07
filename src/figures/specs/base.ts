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

type Base = Omit<GroundSpec, 'cls'>;

// ---------------------------------------------------------------- trucks

/** Ural-4320 6x6, normal control (bonnet): 7.37 x 2.5 x 2.87 m. */
export const URAL_4320: Base = { chassis: 'wheeled', length: 7.37, width: 2.5, hullHeight: 2.87, axles: 3, axleAt: [0.72, -0.35, -0.72], wheelRadius: 0.54, hull: 'truck', cab: { length: 1.9, height: 2.6, bonnet: 1.4 }, bed: 'covered' };
/** ZiL-131 6x6, bonnet: 7.04 x 2.5 x 2.48 m (cab), van body taller. */
export const ZIL_131: Base = { chassis: 'wheeled', length: 7.04, width: 2.5, hullHeight: 2.95, axles: 3, axleAt: [0.7, -0.38, -0.74], wheelRadius: 0.54, hull: 'truck', cab: { length: 1.8, height: 2.48, bonnet: 1.35 }, bed: 'box' };
/** GAZ-66 4x4, cab-over: 5.66 x 2.34 x 2.44 m. */
export const GAZ_66: Base = { chassis: 'wheeled', length: 5.66, width: 2.34, hullHeight: 2.44, axles: 2, wheelRadius: 0.55, hull: 'truck', cab: { length: 1.7, height: 2.44 }, bed: 'covered' };
/** KamAZ-43101 6x6, cab-over: 7.9 x 2.5 x 3.2 m (with tilt). */
export const KAMAZ_43101: Base = { chassis: 'wheeled', length: 7.9, width: 2.5, hullHeight: 3.2, axles: 3, axleAt: [0.72, -0.4, -0.74], wheelRadius: 0.55, hull: 'truck', cab: { length: 2.2, height: 2.9 }, bed: 'covered' };
/** MAZ-543 8x8 (Scud, S-300 and Smerch carrier): 11.7 x 3.05 x 2.92 m, two cabs either side of the engine drawn as one. */
export const MAZ_543: Base = { chassis: 'wheeled', length: 11.7, width: 3.05, hullHeight: 1.5, axles: 4, axleAt: [0.72, 0.42, -0.28, -0.58], wheelRadius: 0.78, hull: 'truck', cab: { length: 2.6, height: 2.92 }, bed: 'flat' };
/** MAZ-7310 / MZKT-7930 8x8 heavy chassis (Iskander, Smerch): about 12 x 3.05 x 3.0 m. */
export const MZKT_7930: Base = { chassis: 'wheeled', length: 12.7, width: 3.07, hullHeight: 1.4, axles: 4, axleAt: [0.75, 0.47, -0.28, -0.58], wheelRadius: 0.72, hull: 'truck', cab: { length: 2.4, height: 3.0 }, bed: 'flat' };
/** KrAZ-255B 6x6, bonnet: 8.65 x 2.75 x 2.94 m. */
export const KRAZ_255: Base = { chassis: 'wheeled', length: 8.65, width: 2.75, hullHeight: 1.3, axles: 3, axleAt: [0.72, -0.4, -0.72], wheelRadius: 0.67, hull: 'truck', cab: { length: 1.9, height: 2.94, bonnet: 1.8 }, bed: 'flat' };
/** KrAZ-6322 6x6, bonnet: 9.0 x 2.5 x 2.9 m. */
export const KRAZ_6322: Base = { chassis: 'wheeled', length: 9.0, width: 2.5, hullHeight: 3.0, axles: 3, axleAt: [0.72, -0.38, -0.7], wheelRadius: 0.6, hull: 'truck', cab: { length: 2.0, height: 2.9, bonnet: 1.7 }, bed: 'covered' };
/** M939 / M923 5-ton 6x6, bonnet: 7.9 x 2.5 x 2.9 m. */
export const M939: Base = { chassis: 'wheeled', length: 7.9, width: 2.5, hullHeight: 3.0, axles: 3, axleAt: [0.72, -0.38, -0.7], wheelRadius: 0.55, hull: 'truck', cab: { length: 1.8, height: 2.9, bonnet: 1.6 }, bed: 'covered' };
/** M977 HEMTT 8x8, cab-over: 10.2 x 2.44 x 2.84 m. */
export const HEMTT: Base = { chassis: 'wheeled', length: 10.2, width: 2.44, hullHeight: 1.25, axles: 4, axleAt: [0.78, 0.5, -0.45, -0.72], wheelRadius: 0.62, hull: 'truck', cab: { length: 2.4, height: 2.84 }, bed: 'flat' };
/** FMTV / M1083 6x6, cab-over: 7.0 x 2.44 x 2.84 m. */
export const FMTV: Base = { chassis: 'wheeled', length: 7.0, width: 2.44, hullHeight: 3.0, axles: 3, axleAt: [0.7, -0.38, -0.72], wheelRadius: 0.6, hull: 'truck', cab: { length: 2.3, height: 2.84 }, bed: 'covered' };
/** MAN HX 6x6 / KAT1 class, cab-over: 8.4 x 2.55 x 3.2 m. */
export const MAN_HX: Base = { chassis: 'wheeled', length: 8.4, width: 2.55, hullHeight: 3.2, axles: 3, axleAt: [0.7, -0.4, -0.72], wheelRadius: 0.6, hull: 'truck', cab: { length: 2.3, height: 3.1 }, bed: 'covered' };
/** Toyota Hilux / Land Cruiser pickup (technicals): 5.3 x 1.85 x 1.8 m. */
export const PICKUP: Base = { chassis: 'wheeled', length: 5.3, width: 1.85, hullHeight: 0.9, axles: 2, wheelRadius: 0.38, hull: 'truck', cab: { length: 2.4, height: 1.8, bonnet: 1.3 }, bed: 'flat' };

// ---------------------------------------------------------------- tracked carriers

/** MT-LB: 6.45 x 2.85 x 1.87 m hull, six road wheels, a cab at the front left. */
export const MT_LB: Base = { chassis: 'tracked', length: 6.45, width: 2.85, hullHeight: 1.6, roadWheels: 6, hull: 'box' };
/** M113: 4.86 x 2.69 x 1.85 m (hull roof), five road wheels. */
export const M113: Base = { chassis: 'tracked', length: 4.86, width: 2.69, hullHeight: 1.85, roadWheels: 5, hull: 'box' };
/** M548 / M730 cargo carrier: 5.9 x 2.69, cab at the front, flat bed behind. */
export const M548: Base = { chassis: 'tracked', length: 5.9, width: 2.69, hullHeight: 1.3, roadWheels: 5, hull: 'box', boxes: [{ x: 2.1, length: 1.6, height: 0.95 }] };
/** GM-5xx family (Buk, Kub, S-300V chassis): about 7.4-9.6 x 3.25 m, six road wheels. */
export const GM_CHASSIS: Base = { chassis: 'tracked', length: 7.4, width: 3.18, hullHeight: 1.55, roadWheels: 6, hull: 'box' };
/** BRDM-2 4x4: 5.75 x 2.35 x 2.31 m (with turret), boat-shaped hull. */
export const BRDM_2: Base = { chassis: 'wheeled', length: 5.75, width: 2.35, hullHeight: 1.75, axles: 2, wheelRadius: 0.52, hull: 'boat' };
/** HMMWV 4x4: 4.57 x 2.16 x 1.83 m. */
export const HMMWV: Base = { chassis: 'wheeled', length: 4.57, width: 2.16, hullHeight: 1.75, axles: 2, wheelRadius: 0.45, hull: 'car' };
/** A two-axle towed shelter or generator trailer (estimate: 4.5 x 2.2 m). */
export const TRAILER: Base = { chassis: 'trailer', length: 4.5, width: 2.2, hullHeight: 1.2, axles: 1, wheelRadius: 0.45 };
/** A semitrailer for radars and launchers (estimate: 10 x 2.9 m), drawbar standing in for the fifth wheel. */
export const SEMI: Base = { chassis: 'trailer', length: 10.0, width: 2.9, hullHeight: 1.4, axles: 2, wheelRadius: 0.55 };
