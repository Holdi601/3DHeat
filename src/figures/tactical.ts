/**
 * Close-quarters tactical shooters (Rainbow Six Siege's replays, and any table
 * written the same way): which figure a row is. A player's own body is their
 * operator's own figure (`operators.ts`; the plain close-quarters soldier for
 * an operator it does not know) holding their primary weapon's class, in the stance
 * the data gives (standing where it says none) and with the band of the side
 * they are on; a drone is the throwable drone; a gadget or ability they placed
 * is the gadget figure its name or role calls for (`gadgets.ts`).
 *
 * The columns are the R6 reader's (`exporters/ext/r6-replay`): `pawn`
 * (operator, drone, gadget, mark), `operator`, `operatorRole`,
 * `primaryClass`, `side` (attack, defense), `gadget`, `gadgetRole`,
 * `ability`, `abilityRole`, and `stance` where a source has one. A table is
 * taken for one of these when it has `operator` and either `pawn` or
 * `primaryClass`.
 *
 * Names map to figures by what the thing does, not what it looks like in the
 * game: one figure serves several gadgets (every placed trap is the floor
 * trap, every hard-breach device the hard-breach charge). An item the table
 * does not name, or names but this table does not know, falls back on its
 * role, and a gadget with neither is the generic device.
 */

import type { AttributeColumn, Dataset } from '../state/types';
import type { Rgb } from '../race/geometry';
import type { Kitbag, Stance } from './infantry';
import type { GadgetKind } from './gadgets';
import { personRows } from '../data/flight';
import { operatorFigureName, operatorOf, operatorSlug } from './operators';
import { stanceFrom } from './posture';

/**
 * The band colours of the two sides, fixed, beside the team's colour: attack
 * amber, defence pale cyan - apart from each other and from the first teams'
 * blue and red, so side and team both read.
 */
export const SIDE_BAND: Record<'attack' | 'defense', Rgb> = {
  attack: [1.0, 0.66, 0.08],
  defense: [0.68, 0.93, 1.0],
};

/** The weapon a close-quarters soldier holds, by the reader's weapon class. */
export const CARRY_OF_CLASS: Record<string, Kitbag> = {
  'assault rifle': 'rifle',
  rifle: 'rifle',
  smg: 'smg',
  'machine pistol': 'smg',
  shotgun: 'shotgun',
  dmr: 'dmr',
  'marksman rifle': 'dmr',
  lmg: 'lmg',
  mg: 'lmg',
  handgun: 'pistol',
  pistol: 'pistol',
  'hand cannon': 'pistol',
  shield: 'shield',
};

/** The weapons a close-quarters soldier is built with. */
export const OPERATOR_CARRIES: Kitbag[] = ['rifle', 'smg', 'shotgun', 'dmr', 'lmg', 'pistol', 'shield'];

/** The figure name of a close-quarters soldier: `operator-<weapon>[-crouch|-prone][-attack|-defense]`. */
export function operatorName(carry: Kitbag, stance: Stance = 'stand', side: 'attack' | 'defense' | null = null): string {
  return `operator-${carry}${stance === 'stand' ? '' : `-${stance}`}${side ? `-${side}` : ''}`;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

/**
 * Gadgets and abilities by name (letters and digits only, lower case): the
 * secondary gadgets every operator may carry, the abilities that leave
 * something in the level, and level objects a reader may name.
 */
const BY_NAME: Record<string, GadgetKind> = {
  // Secondary gadgets.
  barbedwire: 'barbed-wire',
  breachcharge: 'breach-charge',
  softbreachcharge: 'breach-charge',
  hardbreachcharge: 'hard-breach-charge',
  claymore: 'claymore',
  fraggrenade: 'grenade',
  impactgrenade: 'grenade',
  impactempgrenade: 'grenade',
  empgrenade: 'grenade',
  nitrocell: 'sticky-charge',
  stungrenade: 'stun-grenade',
  flashgrenade: 'stun-grenade',
  smokegrenade: 'smoke-grenade',
  deployableshield: 'deployable-shield',
  bulletproofcamera: 'bulletproof-camera',
  observationblocker: 'device',
  proximityalarm: 'proximity-sensor',
  drone: 'throw-drone',
  // Attack abilities that leave something behind.
  selmaaquabreacher: 'hard-breach-charge',
  breachinground: 'sticky-charge',
  kludgedrone: 'throw-drone',
  tacticalcrossbow: 'sticky-charge',
  rceraterocharge: 'throw-drone',
  clustercharge: 'hard-breach-charge',
  traxstingers: 'floor-trap',
  kawanhivelauncher: 'sticky-charge',
  xkairos: 'sticky-charge',
  lvexplosivelance: 'sticky-charge',
  eeoned: 'throw-drone',
  airjablauncher: 'floor-trap',
  bugiautobreacher: 'throw-drone',
  dompanellauncher: 'armor-panel',
  rouprojectorsystem: 'device',
  egsdisruptor: 'grenade',
  exothermiccharge: 'hard-breach-charge',
  shockdrone: 'throw-drone',
  candela: 'stun-grenade',
  arguslauncher: 'wall-camera',
  ks79lifeline: 'grenade',
  talon8clearshield: 'deployable-shield',
  geminireplicator: 'device',
  // Defence abilities.
  prisma: 'device',
  suryagate: 'laser-gate',
  kibabarrier: 'armor-panel',
  shockwire: 'jammer',
  armorpanel: 'armor-panel',
  tripconnector: 'laser-gate',
  yokai: 'throw-drone',
  grzmotmine: 'floor-trap',
  fnattdreadmine: 'floor-trap',
  welcomemat: 'floor-trap',
  volcancanister: 'gas-canister',
  activedefensesystemads: 'jammer',
  rtilaelectroclaw: 'jammer',
  entrydenialdeviceeddmkii: 'claymore',
  gumine: 'floor-trap',
  evileye: 'bulletproof-camera',
  bansheesonicdefense: 'jammer',
  blackmirror: 'one-way-window',
  pestlauncher: 'jammer',
  signaldisruptor: 'jammer',
  horuslancelauncher: 'device',
  armorpack: 'supply-box',
  remotegasgrenade: 'gas-canister',
  shumikhalauncher: 'grenade',
  razorbloomshell: 'floor-trap',
  konastation: 'supply-box',
  zotocanister: 'gas-canister',
  blackeye: 'wall-camera',
  magnetsystem: 'jammer',
  v10pantheonshells: 'device',
  // Level objects.
  defuser: 'defuser',
  reinforcement: 'wall-reinforcement',
  reinforcedwall: 'wall-reinforcement',
  wallreinforcement: 'wall-reinforcement',
  hatchreinforcement: 'wall-reinforcement',
  barricade: 'barricade',
  camera: 'wall-camera',
  securitycamera: 'wall-camera',
  cctv: 'wall-camera',
};

/** Words in a name the table does not know, in order. */
const BY_WORD: [RegExp, GadgetKind][] = [
  [/drone/i, 'throw-drone'],
  [/hard.?breach|thermite|exothermic/i, 'hard-breach-charge'],
  [/reinforc|hatch/i, 'wall-reinforcement'],
  [/barricade/i, 'barricade'],
  [/breach/i, 'breach-charge'],
  [/claymore|trip.?wire/i, 'claymore'],
  [/\bmine\b|trap/i, 'floor-trap'],
  [/camera|\bcam\b|\beye\b/i, 'wall-camera'],
  [/barbed|wire/i, 'barbed-wire'],
  [/window|mirror/i, 'one-way-window'],
  [/shield/i, 'deployable-shield'],
  [/panel|barrier/i, 'armor-panel'],
  [/smoke/i, 'smoke-grenade'],
  [/gas|canister/i, 'gas-canister'],
  [/stun|flash/i, 'stun-grenade'],
  [/grenade|cell/i, 'grenade'],
  [/jammer|disrupt/i, 'jammer'],
  [/sensor|alarm/i, 'proximity-sensor'],
  [/defuser/i, 'defuser'],
  [/charge/i, 'sticky-charge'],
];

/** A gadget's or ability's role (`catalog.py`'s words) to the figure that stands for the role. */
export const ROLE_FIGURES: Record<string, GadgetKind> = {
  breach: 'breach-charge',
  trap: 'floor-trap',
  intel: 'wall-camera',
  denial: 'deployable-shield',
  'anti-gadget': 'jammer',
  'anti-breach': 'jammer',
  utility: 'grenade',
  support: 'supply-box',
  shield: 'deployable-shield',
  mobility: 'device',
};

/** The figure for a gadget or ability by its name, then its role; null when neither says. */
export function gadgetFigure(name: string, role = ''): GadgetKind | null {
  const n = norm(name);
  if (n) {
    const hit = BY_NAME[n];
    if (hit) return hit;
    for (const [re, k] of BY_WORD) if (re.test(name)) return k;
  }
  return ROLE_FIGURES[role.trim().toLowerCase()] ?? null;
}

/** Each operator role's symbol beside their name on the label: plain Unicode symbols most fonts have. */
export const ROLE_GLYPHS: Record<string, string> = {
  'hard breacher': '✸',
  'soft breacher': '⚒',
  entry: '➤',
  fragger: '✦',
  support: '✚',
  shield: '⬟',
  intel: '◉',
  flex: '◇',
  'flank watch': '↺',
  anchor: '⚓',
  trapper: '✕',
  roamer: '⇄',
  'anti-gadget': '↯',
  'anti-breach': '▣',
};

/** A role's symbol, '' for an unknown one. */
export function roleGlyph(role: string): string {
  return ROLE_GLYPHS[role.trim().toLowerCase()] ?? '';
}

/** Pawns that are something a player sent out or put down, not the player. */
export const OBJECT_PAWN = /^(drone|gadget)$/i;
/** Pawns that are not drawn as a figure of their own: a placed gadget (`GadgetLayer`), a mark on the level. */
const HIDDEN_PAWN = /^(gadget|mark|impact)$/i;
const STANCE = /^(stance|posture|pose)$/i;
/** Columns that may name what a gadget row is, best first; `detail` and `weapon` only when they hold a name. */
const GADGET_NAME = /^(gadget.?type|gadget.?name|object.?type|object.?kind|object|item.?name|item|device|deployable)$/i;

/** The columns of a tactical table, found once per dataset. */
export interface TacticalColumns {
  pawn: AttributeColumn | null;
  operator: AttributeColumn;
  role: AttributeColumn | null;
  primaryClass: AttributeColumn | null;
  side: AttributeColumn | null;
  stance: AttributeColumn | null;
  gadget: AttributeColumn | null;
  gadgetRole: AttributeColumn | null;
  ability: AttributeColumn | null;
  abilityRole: AttributeColumn | null;
  /** What a gadget row names itself, best first. */
  names: AttributeColumn[];
}

const colsCache = new WeakMap<Dataset, TacticalColumns | null>();

function category(d: Dataset, re: RegExp): AttributeColumn | null {
  return d.attrs.find((a) => a.kind === 'category' && a.categories && re.test(a.name.trim())) ?? null;
}

/** The tactical columns of a dataset, or null when it is not such a table. */
export function tacticalColumns(d: Dataset): TacticalColumns | null {
  if (colsCache.has(d)) return colsCache.get(d)!;
  const operator = category(d, /^operator$/i);
  const pawn = category(d, /^pawn$/i);
  const primaryClass = category(d, /^primary.?class$/i);
  let out: TacticalColumns | null = null;
  if (operator && (pawn || primaryClass)) {
    out = {
      pawn,
      operator,
      role: category(d, /^operator.?role$/i),
      primaryClass,
      side: category(d, /^side$/i),
      stance: category(d, STANCE),
      gadget: category(d, /^gadget$/i),
      gadgetRole: category(d, /^gadget.?role$/i),
      ability: category(d, /^ability$/i),
      abilityRole: category(d, /^ability.?role$/i),
      names: [
        ...d.attrs.filter((a) => a.kind === 'category' && a.categories && GADGET_NAME.test(a.name.trim())),
        ...[category(d, /^weapon$/i), category(d, /^detail$/i)].filter((a): a is AttributeColumn => !!a),
      ],
    };
  }
  colsCache.set(d, out);
  return out;
}

/** A category column's text at a row ('' for none). */
export function textAt(a: AttributeColumn | null, row: number): string {
  if (!a || row < 0) return '';
  return a.categories?.[(a.data as Uint32Array)[row]] ?? '';
}

/** The stance a text says (`posture.ts` reads every game's words), standing where it says none. */
function stanceOf(text: string): Stance {
  return stanceFrom(text) ?? 'stand';
}

function sideOf(text: string): 'attack' | 'defense' | null {
  const t = text.trim().toLowerCase();
  if (/^(attack|attacker|attackers|atk|offen[cs]e|t)$/.test(t)) return 'attack';
  if (/^(defen[cs]e|defender|defenders|def|ct)$/.test(t)) return 'defense';
  return null;
}

/** Whether a row is drawn by no figure of its own: a placed gadget (the gadget layer draws it) or a mark. */
export function hiddenRow(c: TacticalColumns, row: number): boolean {
  return !!c.pawn && HIDDEN_PAWN.test(textAt(c.pawn, row));
}

/** The figure a tactical table's row is drawn as (a soldier, a drone), null for a row drawn by none. */
export function tacticalFigure(c: TacticalColumns, row: number): string | null {
  const pawn = textAt(c.pawn, row).trim().toLowerCase();
  if (pawn && HIDDEN_PAWN.test(pawn)) return null;
  if (pawn === 'drone') return 'throw-drone';
  const cls = textAt(c.primaryClass, row).trim().toLowerCase();
  const carry = CARRY_OF_CLASS[cls] ?? 'rifle';
  const stance = stanceOf(textAt(c.stance, row));
  // An operator the viewer knows is their own figure, holding the row's weapon class where they have one of it.
  const op = operatorOf(textAt(c.operator, row));
  if (op) return operatorFigureName(operatorSlug(op.name), op.carries.includes(carry) ? carry : op.carries[0], stance, op.look.side);
  return operatorName(carry, stance, sideOf(textAt(c.side, row)));
}

/** The cache key of a row's figure: the texts `tacticalFigure` reads. */
export function tacticalKey(c: TacticalColumns, row: number): string {
  return `${textAt(c.pawn, row)}\u0001${textAt(c.primaryClass, row)}\u0001${textAt(c.stance, row)}\u0001${textAt(c.side, row)}\u0001${textAt(c.operator, row)}`;
}

/**
 * The figure of a placed gadget's row: the name the row gives it, else (a
 * row that names the player's own gadget or ability) that item's role, else
 * the generic device.
 */
export function placedFigure(c: TacticalColumns, row: number): GadgetKind {
  for (const a of c.names) {
    const name = textAt(a, row).trim();
    // A JSON detail or a number is not a name.
    if (!name || /^[[{0-9-]/.test(name)) continue;
    const own = name === textAt(c.gadget, row) ? textAt(c.gadgetRole, row) : name === textAt(c.ability, row) ? textAt(c.abilityRole, row) : '';
    const f = gadgetFigure(name, own);
    if (f) return f;
  }
  return 'device';
}

const labelCache = new WeakMap<Dataset, Map<number, string>>();

/**
 * What a soldier's label says they are at a time: the operator and their role's
 * symbol on the row at or before it ("Ace ✸"); '' where the table is not
 * a tactical one or the person has no operator then. Players pick a new
 * operator each round, so this is read at the time, not once.
 */
export function operatorLabel(d: Dataset, person: number, time: number): string {
  const c = tacticalColumns(d);
  if (!c || !d.time) return '';
  const idx = personRows(d);
  if (!idx) return '';
  const a = idx.start[person];
  const b = idx.start[person + 1];
  if (b <= a) return '';
  // The last row at or before the time; the first where the time is before them all.
  let lo = a;
  let hi = b;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (d.time[idx.rows[mid]] <= time) lo = mid + 1;
    else hi = mid;
  }
  const row = idx.rows[Math.max(a, lo - 1)];
  const op = c.operator.data as Uint32Array;
  const roleId = c.role ? (c.role.data as Uint32Array)[row] : -1;
  const key = op[row] * 65536 + (roleId + 1);
  let cache = labelCache.get(d);
  if (!cache) labelCache.set(d, (cache = new Map()));
  let s = cache.get(key);
  if (s === undefined) {
    const name = textAt(c.operator, row).trim();
    const glyph = roleGlyph(textAt(c.role, row));
    s = name ? (glyph ? `${name} ${glyph}` : name) : '';
    cache.set(key, s);
  }
  return s;
}
