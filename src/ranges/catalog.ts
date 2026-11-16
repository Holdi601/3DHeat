/**
 * The engagement-range catalogue: how far a weapon reaches (least, best, most),
 * which way and how high, from `data/weapons.json`; and what a unit carries
 * when the data does not say, from `data/armament.json` (by figure name, then
 * figure class, then domain). Both are plain data files, extended without
 * touching code.
 *
 * Every figure is rounded public knowledge or a judged class value, marked as
 * such (`src`). Ranges are metres; a dataset in a map's own units scales them.
 */

import { CATALOG, type FigureDomain } from '../figures/catalog';

/** The kinds of weapon a viewer turns on and off. */
export const WEAPON_CLASSES = ['smallArms', 'mg', 'cannon', 'gun', 'atgm', 'sam', 'aam', 'strike', 'torpedo', 'artillery'] as const;
export type WeaponClass = (typeof WEAPON_CLASSES)[number];

/** How a range is laid around its unit. */
export type RangeShape = 'sphere' | 'cone' | 'drop';

export interface WeaponRange {
  id: string;
  cls: WeaponClass;
  name: string;
  /** Metres: least, best, most. */
  min: number;
  opt: number;
  max: number;
  shape: RangeShape;
  /** Half-angle off the nose, degrees (cone and drop). */
  cone: number;
  /** Elevation of the line to the target, degrees: lowest, highest. */
  elev: [number, number];
  /** Target height above the shooter, metres: lowest, highest. */
  alt: [number, number];
  /** Whether the line of sight limits it (false: indirect fire). */
  los: boolean;
  /** game: the game's own value (stat card, official wiki, game files); public: a published real-world figure; estimate. */
  src: 'game' | 'public' | 'estimate';
  /** Where the figure comes from (a URL), when it was looked up, and what min/best/most mean there. */
  source?: string;
  date?: string;
  note?: string;
  /** The game the entry is for (`data/games/<id>.json`); absent: any. */
  game?: string;
  /** The case-insensitive patterns a data label is matched against. */
  match: RegExp[];
}

export interface RangeCatalogue {
  weapons: WeaponRange[];
  byId: Map<string, WeaponRange>;
  colours: Record<WeaponClass, [number, number, number]>;
  figures: Record<string, string[]>;
  classes: Record<string, string[]>;
}

type Raw = Record<string, unknown>;

const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const pair = (v: unknown, d: [number, number]): [number, number] => (Array.isArray(v) && v.length === 2 ? [num(v[0], d[0]), num(v[1], d[1])] : d);

/** One weapon entry, checked; null when it cannot be used. */
export function readWeapon(r: Raw): WeaponRange | null {
  const cls = r.cls as WeaponClass;
  if (typeof r.id !== 'string' || !WEAPON_CLASSES.includes(cls)) return null;
  const range = Array.isArray(r.range) ? r.range.map((x) => num(x, NaN)) : [];
  if (range.length !== 3 || range.some((x) => !(x >= 0))) return null;
  const [min, opt, max] = range;
  if (!(max > 0) || min > max) return null;
  const shape: RangeShape = r.shape === 'cone' || r.shape === 'drop' ? r.shape : 'sphere';
  const match: RegExp[] = [];
  for (const m of Array.isArray(r.match) ? r.match : []) {
    try {
      // An optional hyphen or space in a pattern stands for any separator: AIM-120, AIM 120 and AIM_120 alike.
      if (typeof m === 'string' && m) match.push(new RegExp(m.replace(/-\?|(?<!\\) \?/g, '[-_ ]?'), 'i'));
    } catch {
      // A broken pattern matches nothing; the entry still serves by id.
    }
  }
  return {
    id: r.id,
    cls,
    name: typeof r.name === 'string' ? r.name : r.id,
    min,
    opt: Math.min(max, Math.max(min, opt)),
    max,
    shape,
    cone: Math.max(1, Math.min(180, num(r.cone, shape === 'sphere' ? 180 : 30))),
    elev: pair(r.elev, [-90, 90]),
    alt: pair(r.alt, [-1e9, 1e9]),
    los: r.los !== false,
    src: r.src === 'game' || r.src === 'public' ? r.src : 'estimate',
    ...(typeof r.source === 'string' && r.source ? { source: r.source } : {}),
    ...(typeof r.date === 'string' ? { date: r.date } : {}),
    ...(typeof r.note === 'string' && r.note ? { note: r.note } : {}),
    match,
  };
}

/** The catalogue from its two files' contents. */
export function readCatalogue(weapons: unknown, armament: unknown): RangeCatalogue {
  const w = (weapons ?? {}) as Raw;
  const a = (armament ?? {}) as Raw;
  const list = (Array.isArray(w.weapons) ? w.weapons : []).map((x) => readWeapon(x as Raw)).filter((x): x is WeaponRange => !!x);
  const byId = new Map(list.map((x) => [x.id, x]));
  const colours = {} as Record<WeaponClass, [number, number, number]>;
  const cls = (w.classes ?? {}) as Record<string, { colour?: unknown }>;
  for (const c of WEAPON_CLASSES) {
    const v = cls[c]?.colour;
    colours[c] = Array.isArray(v) && v.length === 3 ? [num(v[0], 1), num(v[1], 1), num(v[2], 1)] : [1, 1, 1];
  }
  const ids = (m: unknown): Record<string, string[]> => {
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries((m ?? {}) as Record<string, unknown>)) if (Array.isArray(v)) out[k] = v.filter((x): x is string => typeof x === 'string' && byId.has(x));
    return out;
  };
  return { weapons: list, byId, colours, figures: ids(a.figures), classes: ids(a.classes) };
}

/** A game's own figures (`data/games/<id>.json`): its weapons, its vehicles' armament, its view and sensors (kept raw for those layers). */
export interface GameCatalogue {
  id: string;
  name: string;
  weapons: WeaponRange[];
  vehicles: { match: RegExp; weapons: string[] }[];
  fov: unknown;
  sensors: unknown[];
  /** Ids still estimated, for follow-up. */
  estimates: string[];
}

/** A game file's contents, checked; its weapons join `byId`. */
export function readGame(raw: unknown, byId: Map<string, WeaponRange>): GameCatalogue | null {
  const g = (raw ?? {}) as Raw;
  if (typeof g.game !== 'string') return null;
  const weapons: WeaponRange[] = [];
  for (const x of Array.isArray(g.weapons) ? g.weapons : []) {
    const w = readWeapon(x as Raw);
    if (!w) continue;
    w.game = g.game;
    weapons.push(w);
    byId.set(w.id, w);
  }
  const vehicles: GameCatalogue['vehicles'] = [];
  for (const v of Array.isArray(g.vehicles) ? (g.vehicles as Raw[]) : []) {
    try {
      if (typeof v.match === 'string' && Array.isArray(v.weapons)) vehicles.push({ match: new RegExp(v.match, 'i'), weapons: v.weapons.filter((x): x is string => typeof x === 'string') });
    } catch {
      // A broken pattern: the vehicle falls back to its figure's armament.
    }
  }
  return {
    id: g.game,
    name: typeof g.name === 'string' ? g.name : g.game,
    weapons,
    vehicles: vehicles.map((v) => ({ ...v, weapons: v.weapons.filter((id) => byId.has(id)) })),
    fov: g.fov ?? null,
    sensors: Array.isArray(g.sensors) ? g.sensors : [],
    estimates: Array.isArray(g.estimates) ? g.estimates.filter((x): x is string => typeof x === 'string') : [],
  };
}

const FILES = import.meta.glob<unknown>('./data/*.json', { eager: true, import: 'default' });
const GAME_FILES = import.meta.glob<unknown>('./data/games/*.json', { eager: true, import: 'default' });

/** The catalogue shipped with the viewer. */
export const RANGES: RangeCatalogue = readCatalogue(FILES['./data/weapons.json'], FILES['./data/armament.json']);
/** The games' own catalogues, by id. */
export const GAMES: Map<string, GameCatalogue> = new Map(
  Object.values(GAME_FILES)
    .map((g) => readGame(g, RANGES.byId))
    .filter((g): g is GameCatalogue => !!g)
    .map((g) => [g.id, g]),
);

/** The entry of `list` whose pattern matches the longest stretch of `s`. */
function longest(list: readonly WeaponRange[], s: string): [WeaponRange | null, number] {
  let best: WeaponRange | null = null;
  let len = 0;
  for (const w of list) {
    for (const re of w.match) {
      const m = re.exec(s);
      if (m && m[0].length > len) {
        best = w;
        len = m[0].length;
      }
    }
  }
  return [best, len];
}

/**
 * The weapon a data label names: the game's own entry when the game is known
 * and has one, else the generic entry whose pattern matches the longest
 * stretch of it (so "MG 151/20" is the cannon, not any machine gun); null for none.
 */
export function weaponOfLabel(label: string, cat: RangeCatalogue = RANGES, game: GameCatalogue | null = null): WeaponRange | null {
  const s = label.trim();
  if (!s) return null;
  if (game) {
    const [w] = longest(game.weapons, s);
    if (w) return w;
  }
  return longest(cat.weapons, s)[0];
}

/**
 * Which game a table is from, by its name, the columns only one game's
 * converter writes, and how many of its weapon names each game's catalogue
 * knows; null when nothing points anywhere.
 */
export function detectRangeGame(name: string, columns: readonly string[], labels: Iterable<string>, games: ReadonlyMap<string, GameCatalogue> = GAMES): GameCatalogue | null {
  const cols = new Set(columns.map((c) => c.toLowerCase()));
  const has = (...c: string[]) => c.some((x) => cols.has(x.toLowerCase()));
  const hinted =
    /\.wrpl\b|war ?thunder/i.test(name) || has('hitOutcome', 'ammoName', 'aimHeading') ? 'wt'
    : /\.acmi\b|\bdcs\b/i.test(name) || (has('Type') && has('Coalition', 'Parent')) ? 'dcs'
    : /\.dem\b|\bcs2\b|counter-?strike/i.test(name) || has('cashSpent', 'roundStartEquipment') ? 'cs2'
    : /wotreplay|world of tanks/i.test(name) ? 'wot'
    : /wowsreplay|world of warships/i.test(name) ? 'wows'
    : /siege|\br6\b/i.test(name) || has('operator') ? 'r6'
    : /valorant/i.test(name) ? 'valorant'
    : /\bsquad\b/i.test(name) ? 'squad'
    : /arma ?3/i.test(name) ? 'arma3'
    : /\bbf ?4\b|battlefield ?4/i.test(name) ? 'bf4'
    : /\bbf ?1\b|battlefield ?1\b/i.test(name) ? 'bf1'
    : /\bbf ?6\b|battlefield ?6/i.test(name) ? 'bf6'
    : /il-?2|sturmovik/i.test(name) ? 'il2'
    : null;
  if (hinted && games.has(hinted)) return games.get(hinted)!;
  // Otherwise the game whose own names match most of the table's, at least two.
  const score = new Map<GameCatalogue, number>();
  for (const l of labels) for (const g of games.values()) if (longest(g.weapons, l.trim())[0]) score.set(g, (score.get(g) ?? 0) + 1);
  let best: GameCatalogue | null = null;
  let top = 1;
  for (const [g, s] of score) if (s > top) [best, top] = [g, s];
  return best;
}

/** The person figures' carried weapon, from the words of a figure name (close-quarters operators). */
const CARRY: [RegExp, string][] = [
  [/sniper|marksman-rifle|bolt/, 'sniper'],
  [/dmr|marksman/, 'dmr'],
  [/shotgun/, 'shotgun'],
  [/smg|submachine/, 'smg'],
  [/lmg|machine-?gun/, 'lmg'],
  [/pistol|handgun/, 'pistol'],
  [/launcher|rpg|anti-tank/, 'rpg'],
  [/rifle/, 'rifle'],
];

/** The domain's fallback when neither name nor class says: people carry a rifle. */
const DOMAIN_DEFAULT: Partial<Record<FigureDomain, string[]>> = { person: ['rifle'] };

/**
 * What a unit carries by default: its vehicle's armament in its game's
 * catalogue (by the vehicle's name as the data writes it, or the figure's),
 * else the figure's own list, its class's, its domain's.
 */
export function defaultArmament(figure: string | null, cat: RangeCatalogue = RANGES, game: GameCatalogue | null = null, vehicle = ''): WeaponRange[] {
  if (game) {
    for (const v of game.vehicles) if ((vehicle && v.match.test(vehicle)) || (figure && v.match.test(figure))) return v.weapons.map((id) => cat.byId.get(id)!);
  }
  if (!figure) return [];
  const base = figure.replace(/@.*$/, '');
  const own = cat.figures[base];
  if (own) return own.map((id) => cat.byId.get(id)!);
  const e = CATALOG[base];
  if (e?.domain === 'person' || (!e && /soldier|operator|person/.test(base))) {
    for (const [re, id] of CARRY) if (re.test(base) && cat.byId.has(id)) return [cat.byId.get(id)!];
  }
  if (!e) return [];
  const cls = cat.classes[e.cls];
  if (cls) return cls.map((id) => cat.byId.get(id)!);
  return (DOMAIN_DEFAULT[e.domain] ?? []).map((id) => cat.byId.get(id)).filter((x): x is WeaponRange => !!x);
}

export interface UnitWeapon {
  weapon: WeaponRange;
  /** 'data': named by the data; 'vehicle': the unit's default armament. */
  from: 'data' | 'vehicle';
}

/**
 * A unit's weapons: those its data names, then the vehicle's defaults of every
 * class the data named none of (an aircraft that fired an AIM-120 still has its gun).
 */
export function unitWeapons(figure: string | null, labels: Iterable<string>, cat: RangeCatalogue = RANGES, game: GameCatalogue | null = null, vehicle = ''): UnitWeapon[] {
  const out: UnitWeapon[] = [];
  const seen = new Set<string>();
  const classes = new Set<WeaponClass>();
  for (const l of labels) {
    const w = weaponOfLabel(l, cat, game);
    if (!w || seen.has(w.id)) continue;
    seen.add(w.id);
    classes.add(w.cls);
    out.push({ weapon: w, from: 'data' });
  }
  for (const w of defaultArmament(figure, cat, game, vehicle)) {
    if (seen.has(w.id) || classes.has(w.cls)) continue;
    seen.add(w.id);
    out.push({ weapon: w, from: 'vehicle' });
  }
  return out;
}