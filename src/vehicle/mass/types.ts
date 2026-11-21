/**
 * The vehicle-hit mass analysis (docs/vehicle-hits.md): every hit on a
 * vehicle from thousands of War Thunder matches, kept as columns of small
 * numbers and dictionary codes in a worker, filtered and summed there per
 * plate of the vehicle shown in the Vehicles tab.
 *
 * What a hit holds, and how it is packed (`HitColumns`): a hit costs about
 * 60 bytes. Every value says where it came from (`FLAG_*`): recorded by the
 * replay, worked out from what it recorded (a distance from two positions),
 * or a ballistic estimate (an impact speed from the muzzle speed and the
 * drag over the distance).
 */

/** What the hit did, as the converter's `hitOutcome` says, worst last. */
export const RESULTS = ['unknown', 'nonpenetration', 'penetration', 'critical', 'kill'] as const;
export type HitResult = (typeof RESULTS)[number];
export const R_UNKNOWN = 0, R_NONPEN = 1, R_PEN = 2, R_CRIT = 3, R_KILL = 4;

/** Whether a result counts as through the armour (critical and kill went through too); null: not known. */
export function through(result: number): boolean | null {
  return result === R_UNKNOWN ? null : result >= R_PEN;
}

/**
 * The effects of a hit, as bits: what followed it on the vehicle it struck. Linked by the vehicle, its life and the
 * time (a fire the same moment, a module within `MODULE_WINDOW`, the death within `FATAL_WINDOW` by the shooter).
 * Crew bits are kept for when the converter exports the crew's damage (open-features: "Converter fields for hit
 * analysis"); today's data leaves them clear.
 */
export const EFFECTS = [
  'lethal',
  'killingShot',
  'fire',
  'module',
  'critical',
  'crew',
  'driver',
  'gunner',
  'commander',
  'loader',
  'machineGunner',
  'engine',
  'transmission',
  'breech',
  'barrel',
  'track',
  'turretDrive',
  'ammo',
  'ammoDetonation',
  'fuel',
  'radiator',
  'optics',
] as const;
export type Effect = (typeof EFFECTS)[number];
export const EFFECT_BIT: Record<Effect, number> = Object.fromEntries(EFFECTS.map((e, i) => [e, 1 << i])) as Record<Effect, number>;

/** Effects the current data can carry at all (the rest wait for the converter). */
export const EFFECTS_IN_DATA: readonly Effect[] = ['lethal', 'killingShot', 'fire', 'module', 'critical', 'engine', 'transmission', 'fuel', 'ammo', 'track', 'breech', 'barrel', 'turretDrive', 'optics', 'radiator'];

/** The component a damage-model part name stands for, or null. */
export function componentOf(name: string): Effect | null {
  const n = name.toLowerCase();
  if (/^driver(?!_controls)/.test(n)) return 'driver';
  if (/^(gunner|machine_gunner)/.test(n)) return n.startsWith('machine') ? 'machineGunner' : 'gunner';
  if (/^commander/.test(n)) return 'commander';
  if (/^loader/.test(n)) return 'loader';
  if (/^engine/.test(n)) return 'engine';
  if (/^transmission/.test(n)) return 'transmission';
  if (/^(cannon_breech|breech)/.test(n)) return 'breech';
  if (/^(gun_barrel|barrel)/.test(n)) return 'barrel';
  if (/^track/.test(n)) return 'track';
  if (/^drive_turret/.test(n)) return 'turretDrive';
  if (/^ammo/.test(n)) return 'ammo';
  if (/^fuel_tank/.test(n)) return 'fuel';
  if (/^radiator/.test(n)) return 'radiator';
  if (/^(optic|sight|periscope)/.test(n)) return 'optics';
  return null;
}

/** Crew roles among the effects. */
export const CREW: readonly Effect[] = ['driver', 'gunner', 'commander', 'loader', 'machineGunner'];

/** Where a value came from. */
export type Source = 'recorded' | 'derived' | 'ballistic' | 'unknown';

/** Per-hit flags. */
export const FLAG_DIR = 1; // the shell's direction in the vehicle's frame was recorded (hitDir)
export const FLAG_LOCAL = 2; // the hit point in the vehicle's frame was recorded
export const FLAG_DIST = 4; // a distance could be worked out (both positions known)
export const FLAG_POSE = 8; // the victim's turret pose at the hit is known
export const FLAG_ATTACKER_AI = 16;
export const FLAG_VICTIM_AI = 32;
export const FLAG_WON = 64; // the victim's side won the match
export const FLAG_RESULT_KNOWN = 128; // the match says who won

/** Seconds: a fire lit, a module lost after a hit, and the hits before a death counted towards it. */
export const FIRE_WINDOW = 0.12;
export const MODULE_WINDOW = 0.6;
export const FATAL_WINDOW = 2.5;

/** No value in a quantised column. */
export const NONE16 = -32768;
export const NONE8 = -128;

/** The hits as columns: one entry per hit, the same index in each. */
export interface HitColumns {
  n: number;
  match: Uint32Array;
  /** Seconds from the match's start. */
  time: Float32Array;
  /** Vehicle dictionary codes (`vehicles`). */
  victim: Uint32Array;
  attacker: Uint32Array;
  /** Player dictionary codes (`players`). */
  victimPlayer: Uint32Array;
  attackerPlayer: Uint32Array;
  /** Team dictionary codes (`teams`). */
  victimTeam: Uint8Array;
  attackerTeam: Uint8Array;
  /** The game's damage-model part number (global list), -1 none. */
  part: Int16Array;
  /** Hit point in the vehicle's frame, mm (x forward, y up, z right); NONE16 none. */
  lx: Int16Array;
  ly: Int16Array;
  lz: Int16Array;
  /** The shell's way in the vehicle's frame, x127; NONE8 none. */
  dx: Int8Array;
  dy: Int8Array;
  dz: Int8Array;
  /** The victim's turret yaw and gun elevation at the hit, 1e-4 rad; NONE16 none. */
  yaw: Int16Array;
  pitch: Int16Array;
  /** Metres from the shooter to the hit point, x4 (0..16 km); 0xffff none. */
  dist: Uint16Array;
  /** The hit point's height over the shooter, x4 m; NONE16 none. */
  dh: Int16Array;
  /** Calibre, 0.1 mm; 0 none. */
  calibre: Uint16Array;
  /** Dictionary codes (`ammoTypes`, `ammoNames`); 0 is ''. */
  ammoType: Uint16Array;
  ammoName: Uint16Array;
  /** `RESULTS` index. */
  result: Uint8Array;
  /** `EFFECT_BIT`s. */
  effects: Uint32Array;
  flags: Uint8Array;
}

/** The columns' names and element types, for allocation and transfer. */
export const COLUMN_TYPES = {
  match: Uint32Array,
  time: Float32Array,
  victim: Uint32Array,
  attacker: Uint32Array,
  victimPlayer: Uint32Array,
  attackerPlayer: Uint32Array,
  victimTeam: Uint8Array,
  attackerTeam: Uint8Array,
  part: Int16Array,
  lx: Int16Array,
  ly: Int16Array,
  lz: Int16Array,
  dx: Int8Array,
  dy: Int8Array,
  dz: Int8Array,
  yaw: Int16Array,
  pitch: Int16Array,
  dist: Uint16Array,
  dh: Int16Array,
  calibre: Uint16Array,
  ammoType: Uint16Array,
  ammoName: Uint16Array,
  result: Uint8Array,
  effects: Uint32Array,
  flags: Uint8Array,
} as const;
export type ColumnName = keyof typeof COLUMN_TYPES;
export const COLUMN_NAMES = Object.keys(COLUMN_TYPES) as ColumnName[];

/** Bytes a hit takes in the columns. */
export const BYTES_PER_HIT = COLUMN_NAMES.reduce((a, k) => a + COLUMN_TYPES[k].BYTES_PER_ELEMENT, 0);

/** A match the hits came from. */
export interface HitMatch {
  id: string;
  /** The picked file's index in the load: what a click loads to jump there. */
  file: number;
  map: string;
  mode: string;
  /** ms since 1970, NaN when not known. */
  started: number;
  gameVersion: string;
  converterVersion: string;
  /** The winning team's name, '' when not known. */
  winner: string;
}

/**
 * One file's hits as the scan hands them on: the columns over its own small dictionaries (each code an index into
 * the block's lists), the match it is. The store merges the dictionaries (`HitStore.add`).
 */
export interface HitBlock {
  cols: HitColumns;
  vehicles: string[];
  players: string[];
  teams: string[];
  ammoTypes: string[];
  ammoNames: string[];
  match: HitMatch;
  /** Rows the file had and the scan kept, ms it took, how it was read. */
  rows: number;
  kept: number;
  ms: number;
  native: boolean;
}

export function allocColumns(n: number): HitColumns {
  const out = { n } as HitColumns;
  for (const k of COLUMN_NAMES) (out as unknown as Record<string, unknown>)[k] = new COLUMN_TYPES[k](n);
  return out;
}

/** The columns cut to their first `n` entries (copies), for a block whose last entries were not used. */
export function sliceColumns(c: HitColumns, n: number): HitColumns {
  const out = { n } as HitColumns;
  for (const k of COLUMN_NAMES) (out as unknown as Record<string, unknown>)[k] = (c[k] as Uint8Array).slice(0, n);
  return out;
}

export function transferList(c: HitColumns): ArrayBuffer[] {
  return COLUMN_NAMES.map((k) => (c[k] as Uint8Array).buffer as ArrayBuffer);
}

/** A vehicle the analysis knows about from the catalogue: what the filters and the family grouping need. */
export interface VehicleMeta {
  name: string;
  cls: string;
  nation: string;
  /** Battle rating by difficulty (`ab`, `rb`, `sb`), where the catalogue says. */
  br: Partial<Record<'ab' | 'rb' | 'sb', number>>;
  /** The real vehicle's key (the same vehicle under its other ids) and its family. */
  key: string;
  family: string;
}
