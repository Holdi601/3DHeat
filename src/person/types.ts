/**
 * Hits on people over many matches (docs/person-hits.md): the columns one hit
 * is kept as, for every game whose data says who hit whom - Counter-Strike 2,
 * VALORANT, Arma 3 (OCAP), Rainbow Six Siege, Squad. Each hit is a row of
 * small numbers and dictionary codes; every value carries where it came from
 * (recorded, derived, estimate, unknown), field by field.
 *
 * A file's hits travel as a `PersonBlock` (its own dictionaries); the
 * analysis worker's store (`store.ts`) maps them onto one set.
 */

/** Where a value came from. */
export const SRC_UNKNOWN = 0;
export const SRC_RECORDED = 1;
export const SRC_DERIVED = 2;
export const SRC_ESTIMATE = 3;
export const SOURCES = ['unknown', 'recorded', 'derived', 'estimate'] as const;
export type SourceName = (typeof SOURCES)[number];

/** The body's hit groups. 9 and 10 are coarse: a game that only says body or legs. */
export const HITGROUPS = ['unknown', 'head', 'neck', 'chest', 'stomach', 'left_arm', 'right_arm', 'left_leg', 'right_leg', 'body', 'legs'] as const;
export type HitGroup = (typeof HITGROUPS)[number];
export const HG_UNKNOWN = 0;
export const HG_HEAD = 1;
export const HG_BODY = 9;
export const HG_LEGS = 10;

/** The regions a body figure is drawn in (fine), and the coarse zone each belongs to. */
export const REGIONS = ['head', 'chest', 'stomach', 'left_arm', 'right_arm', 'left_leg', 'right_leg'] as const;
export type Region = (typeof REGIONS)[number];
export const ZONES = ['head', 'body', 'legs'] as const;
export type Zone = (typeof ZONES)[number];
export const ZONE_OF_REGION: Record<Region, Zone> = { head: 'head', chest: 'body', stomach: 'body', left_arm: 'body', right_arm: 'body', left_leg: 'legs', right_leg: 'legs' };

/** A hit group's region (-1: none, a coarse group or unknown). */
export function regionOfGroup(g: number): number {
  switch (g) {
    case 1:
    case 2:
      return 0;
    case 3:
      return 1;
    case 4:
      return 2;
    case 5:
      return 3;
    case 6:
      return 4;
    case 7:
      return 5;
    case 8:
      return 6;
    default:
      return -1;
  }
}

/** A hit group's coarse zone (-1 unknown). */
export function zoneOfGroup(g: number): number {
  if (g === 1 || g === 2) return 0;
  if (g === 3 || g === 4 || g === 5 || g === 6 || g === 9) return 1;
  if (g === 7 || g === 8 || g === 10) return 2;
  return -1;
}

/** A game's word for where a hit landed, as a hit group (CS2's `hitgroup`, VALORANT's `location`, a bone name). */
export function hitGroupOf(word: string): number {
  const w = word.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (!w || w === 'generic' || w === 'general' || w === 'gear' || w === 'unknown') return HG_UNKNOWN;
  if (w === 'head' || /^(head|face|helmet|skull)/.test(w)) return 1;
  if (w === 'neck') return 2;
  if (w === 'chest' || /^(spine_?[23]|upper_?body|thorax)/.test(w)) return 3;
  if (w === 'stomach' || /^(stomach|pelvis|abdomen|spine_?[01]|hips?)$/.test(w)) return 4;
  if (w === 'left_arm' || /^(l_?arm|arm_?l|upperarm_l|lowerarm_l|hand_l|leftarm|left_hand)/.test(w)) return 5;
  if (w === 'right_arm' || /^(r_?arm|arm_?r|upperarm_r|lowerarm_r|hand_r|rightarm|right_hand)/.test(w)) return 6;
  if (w === 'left_leg' || /^(l_?leg|leg_?l|thigh_l|calf_l|foot_l|leftleg)/.test(w)) return 7;
  if (w === 'right_leg' || /^(r_?leg|leg_?r|thigh_r|calf_r|foot_r|rightleg)/.test(w)) return 8;
  if (w === 'body' || w === 'torso' || w === 'arms' || w === 'arm') return HG_BODY;
  if (w === 'leg' || w === 'legs' || w === 'feet' || w === 'foot') return HG_LEGS;
  return HG_UNKNOWN;
}

/** The games, by code. */
export const GAMES = ['', 'cs2', 'valorant', 'arma3', 'r6siege', 'squad'] as const;
export type PersonGame = (typeof GAMES)[number];

/** Numeric columns (NaN: not known). */
export const NUM_COLUMNS = [
  'time',
  /** Shooter to victim, metres. */
  'distance',
  /** Where the shot came from against the way the victim faced, degrees: 0 from the front, 180 from behind (horizontal). */
  'angle',
  /** The shot's way against the horizontal, degrees, positive: from above. */
  'elevation',
  /** Health the hit took (capped at what was left). */
  'damage',
  /** The hit's damage before the cap (CS2 `dmg_health`, VALORANT `damageDealt`). */
  'damageRaw',
  /** Armour (or shield) points the hit took. */
  'armorDamage',
  /** Health the armour kept off (derived from the armour lost by the game's rule). */
  'absorbed',
  /** Armour before the hit, the game's points. */
  'armorBefore',
  'healthBefore',
  /** Calibre, mm. */
  'calibre',
  /** The victim's and the shooter's speed, m/s. */
  'victimSpeed',
  'shooterSpeed',
  /** The point struck in the victim's frame (x forward, y up, z right), metres. */
  'localX',
  'localY',
  'localZ',
  /** The victim's place on the level (the level's own units). */
  'x',
  'y',
  'z',
] as const;
export type NumColumn = (typeof NUM_COLUMNS)[number];

/** Small integer columns: -1 not known where a flag. */
export const INT_COLUMNS = [
  'game',
  'hitgroup',
  /** Helmet on: 1, off: 0, -1 not known. */
  'helmet',
  /** Through a wall or cover: 1, not: 0, -1 not known. */
  'penetrated',
  'smoke',
  /** The hit killed: 1, did not: 0, -1 not known. */
  'kill',
  /** The victim's side won the round (or the match where there are no rounds): 1, 0, -1. */
  'won',
  'round',
  /** Shooter and victim on one side. */
  'team',
  /** Solid objects the traced shot passed (CS2 tool 1.3.0 `wallCount`), -1 not traced. */
  'walls',
  /** Solid traversed in all, millimetres (`wallThickness`, metres in the table; capped at 32,767), -1 not traced. */
  'wallMm',
  /** Bullet-passing surfaces crossed that are not walls - fences, grates (`wallGrates`), -1 not traced. */
  'grates',
] as const;
export type IntColumn = (typeof INT_COLUMNS)[number];

/** Dictionary-coded text columns. */
export const TEXT_COLUMNS = [
  'victim',
  'shooter',
  'victimSide',
  'shooterSide',
  'weapon',
  /** rifle, pistol, smg, sniper, shotgun, lmg, melee, grenade, ability... */
  'weaponClass',
  /** The ammunition: a magazine or cartridge name. */
  'ammo',
  /** ball, AP, tracer, buckshot, HP, explosive, fire, melee, ability... */
  'ammoType',
  /** What the victim wore: none, kevlar, kevlar + helmet, light shield, heavy shield, armour 1..3, a vest... */
  'armor',
  /** The victim's state at the hit: standing, crouched, walking, running, airborne. */
  'victimState',
  /** The shooter's: the same, scoped. */
  'shooterState',
  /** The victim's agent, operator or kit. */
  'victimRole',
  /** The surface materials the traced shot passed, from the shooter on, joined with `;` (`wood_panel;concrete`). */
  'wallSurfaces',
] as const;
export type TextColumn = (typeof TEXT_COLUMNS)[number];

/** The values that carry a source each. */
export const SOURCE_FIELDS = ['hitgroup', 'damage', 'absorbed', 'armor', 'weapon', 'calibre', 'distance', 'angle', 'penetration', 'kill', 'victimMove', 'shooterMove'] as const;
export type SourceField = (typeof SOURCE_FIELDS)[number];

export interface PersonColumns {
  n: number;
  num: Record<NumColumn, Float32Array>;
  int: Record<IntColumn, Int16Array>;
  txt: Record<TextColumn, Uint32Array>;
  src: Record<SourceField, Uint8Array>;
}

/** What a match says of itself. */
export interface PersonMatch {
  id: string;
  file: number;
  game: PersonGame;
  map: string;
  mode: string;
  started: number;
  converterVersion: string;
  gameVersion: string;
}

/** One file's hits with their dictionaries (code 0 is ''). */
export interface PersonBlock {
  match: PersonMatch;
  cols: PersonColumns;
  dicts: Record<TextColumn, string[]>;
  /** Rows the file had, rows read, milliseconds. */
  rows: number;
  kept: number;
  ms: number;
}

export function allocColumns(n: number): PersonColumns {
  const num = {} as PersonColumns['num'];
  for (const c of NUM_COLUMNS) num[c] = new Float32Array(n).fill(NaN);
  const int = {} as PersonColumns['int'];
  for (const c of INT_COLUMNS) int[c] = new Int16Array(n).fill(c === 'game' || c === 'hitgroup' || c === 'round' || c === 'team' ? 0 : -1);
  const txt = {} as PersonColumns['txt'];
  for (const c of TEXT_COLUMNS) txt[c] = new Uint32Array(n);
  const src = {} as PersonColumns['src'];
  for (const c of SOURCE_FIELDS) src[c] = new Uint8Array(n);
  return { n, num, int, txt, src };
}

/** The first `n` rows of columns (a block built larger than it filled). */
export function sliceColumns(c: PersonColumns, n: number): PersonColumns {
  if (n >= c.n) return c;
  const out = allocColumns(0);
  out.n = n;
  for (const k of NUM_COLUMNS) out.num[k] = c.num[k].slice(0, n);
  for (const k of INT_COLUMNS) out.int[k] = c.int[k].slice(0, n);
  for (const k of TEXT_COLUMNS) out.txt[k] = c.txt[k].slice(0, n);
  for (const k of SOURCE_FIELDS) out.src[k] = c.src[k].slice(0, n);
  return out;
}

/** Every buffer of the columns, to hand them across without a copy. */
export function transferList(c: PersonColumns): ArrayBuffer[] {
  const out: ArrayBuffer[] = [];
  for (const k of NUM_COLUMNS) out.push(c.num[k].buffer as ArrayBuffer);
  for (const k of INT_COLUMNS) out.push(c.int[k].buffer as ArrayBuffer);
  for (const k of TEXT_COLUMNS) out.push(c.txt[k].buffer as ArrayBuffer);
  for (const k of SOURCE_FIELDS) out.push(c.src[k].buffer as ArrayBuffer);
  return out;
}

/** A small growing dictionary: code 0 is ''. */
export class Dict {
  readonly list: string[] = [''];
  private readonly m = new Map<string, number>([['', 0]]);
  code(s: string): number {
    let c = this.m.get(s);
    if (c === undefined) {
      c = this.list.length;
      this.list.push(s);
      this.m.set(s, c);
    }
    return c;
  }
}

/** A block's builder: rows appended one at a time, text coded as it comes. */
export class BlockBuilder {
  cols: PersonColumns;
  n = 0;
  readonly dicts = {} as Record<TextColumn, Dict>;
  constructor(capacity = 256) {
    this.cols = allocColumns(Math.max(1, capacity));
    for (const c of TEXT_COLUMNS) this.dicts[c] = new Dict();
  }
  /** A new row (all unknown); returns its index. */
  row(): number {
    if (this.n >= this.cols.n) {
      const bigger = allocColumns(this.cols.n * 2);
      for (const k of NUM_COLUMNS) bigger.num[k].set(this.cols.num[k]);
      for (const k of INT_COLUMNS) bigger.int[k].set(this.cols.int[k]);
      for (const k of TEXT_COLUMNS) bigger.txt[k].set(this.cols.txt[k]);
      for (const k of SOURCE_FIELDS) bigger.src[k].set(this.cols.src[k]);
      this.cols = bigger;
    }
    return this.n++;
  }
  text(i: number, c: TextColumn, s: string | null | undefined): void {
    this.cols.txt[c][i] = s ? this.dicts[c].code(s) : 0;
  }
  done(match: PersonMatch, rows: number, ms: number): PersonBlock {
    const dicts = {} as Record<TextColumn, string[]>;
    for (const c of TEXT_COLUMNS) dicts[c] = this.dicts[c].list;
    return { match, cols: sliceColumns(this.cols, this.n), dicts, rows, kept: this.n, ms };
  }
}

/** Degrees between where a victim faced and where the shot came from, horizontally: 0 front, 180 behind. */
export function angleFromFacing(faceX: number, faceY: number, toShooterX: number, toShooterY: number): number {
  const a = Math.hypot(faceX, faceY), b = Math.hypot(toShooterX, toShooterY);
  if (!(a > 1e-6) || !(b > 1e-6)) return NaN;
  const c = (faceX * toShooterX + faceY * toShooterY) / (a * b);
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

/** The binned side the shot came from: front (under 45 degrees), side, back (over 135). */
export function sideOfAngle(a: number): 'front' | 'side' | 'back' | '' {
  if (!Number.isFinite(a)) return '';
  return a < 45 ? 'front' : a > 135 ? 'back' : 'side';
}
