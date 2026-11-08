/**
 * What a unit is for drawing it far off: its domain (what its stand-in looks
 * like - an aircraft arrow, a hull, a flare's glow) and its symbol class (the
 * icon a map symbology gives it), from the figure the catalogue matched and,
 * for what has no figure (decoys, shells, debris), from the data's type text.
 *
 * The two and the unit's team are packed into one integer (`packWord`) that
 * the GPU tracks keep per track (slot 15) and every far-off instance carries
 * in its last float as `-WORD_BASE - word`: below `NO_PITCH_BELOW`, so to the
 * figure shader it still says "the gun as built".
 */

import { CATALOG } from './catalog';

/** What a unit's stand-in looks like far off. */
export const Domain = {
  Unknown: 0,
  Air: 1,
  Heli: 2,
  Missile: 3,
  Bomb: 4,
  Rocket: 5,
  Ground: 6,
  Person: 7,
  Sea: 8,
  Sub: 9,
  Static: 10,
  Flare: 11,
  Chaff: 12,
  Shell: 13,
  Marker: 14,
  Misc: 15,
} as const;
export type Domain = (typeof Domain)[keyof typeof Domain];

/** The icon a symbology draws for a unit. Order is the atlas's (`render/symbols/atlas.ts`). */
export const SYMBOL_CLASSES = [
  'unknown',
  // Air.
  'fighter', 'attack', 'bomber', 'transport', 'tanker', 'recon', 'trainer', 'uav', 'rotary', 'rotary-attack', 'uav-rotary',
  // Weapons.
  'missile-aam', 'missile-sam', 'missile-agm', 'missile-ship', 'bomb', 'guided-bomb', 'rocket', 'missile',
  // Ground.
  'armour', 'mech-inf', 'motor-inf', 'recon-ground', 'anti-tank', 'air-defence', 'artillery', 'rocket-artillery', 'transport-ground', 'radar', 'installation',
  // People.
  'infantry', 'medic', 'at-infantry', 'parachutist',
  // Sea.
  'carrier', 'combatant', 'small-boat', 'submarine', 'amphibious', 'merchant', 'mine-warfare',
  // Not units.
  'flare', 'chaff', 'shell', 'misc',
] as const;
export type SymbolClass = (typeof SYMBOL_CLASSES)[number];

const INDEX = new Map<string, number>(SYMBOL_CLASSES.map((c, i) => [c, i]));
export function symbolIndex(c: SymbolClass): number {
  return INDEX.get(c)!;
}

/** Catalogue class -> symbol class; a class not here falls back by its domain (`DOMAIN_FALLBACK`). */
const BY_CLS: Record<string, SymbolClass> = {
  // Air.
  multirole: 'fighter', fighter: 'fighter', 'ww2-fighter': 'fighter', 'jet-fighter': 'fighter', 'ww2-heavy-fighter': 'fighter', biplane: 'fighter', 'biplane-two-seat': 'fighter', 'rocket-plane': 'fighter',
  attack: 'attack', 'ww2-attack': 'attack', sead: 'attack', 'vtol-gunship': 'attack',
  bomber: 'bomber', 'ww2-bomber': 'bomber', 'ww2-heavy-bomber': 'bomber', 'jet-bomber': 'bomber', 'ww1-bomber': 'bomber', 'flying-wing': 'bomber',
  transport: 'transport', 'vtol-transport': 'transport', tiltrotor: 'transport', glider: 'transport', airship: 'transport', titan: 'transport',
  tanker: 'tanker',
  recon: 'recon', 'ww2-recon': 'recon', awacs: 'recon', ew: 'recon', patrol: 'recon', 'flying-boat': 'recon', seaplane: 'recon',
  trainer: 'trainer',
  'drone-fixed': 'uav',
  'heli-attack': 'rotary-attack', 'heli-transport': 'rotary', 'heli-scout': 'rotary', 'drone-rotary': 'uav-rotary',
  // Weapons (the missile domain's classes; `atgm`, `sam`, `manpads` are also ground classes, told apart by domain below).
  aam: 'missile-aam', agm: 'missile-agm', 'anti-ship': 'missile-ship', 'cruise-missile': 'missile-ship', bomb: 'bomb', 'cluster-bomb': 'bomb', 'guided-bomb': 'guided-bomb', rocket: 'rocket',
  // Ground.
  mbt: 'armour', 'light-tank': 'armour', 'medium-tank': 'armour', 'heavy-tank': 'armour', 'ww1-tank': 'armour', 'hover-tank': 'armour', walker: 'armour',
  ifv: 'mech-inf', 'apc-tracked': 'mech-inf', halftrack: 'mech-inf',
  'apc-wheeled': 'motor-inf', mrap: 'motor-inf', technical: 'motor-inf',
  'scout-car': 'recon-ground', 'light-strike': 'recon-ground', motorcycle: 'recon-ground', quad: 'recon-ground', cavalry: 'recon-ground', snowmobile: 'recon-ground', jetski: 'recon-ground',
  'tank-destroyer': 'anti-tank', 'assault-gun': 'anti-tank', 'sp-gun': 'anti-tank', 'emplacement-atgm': 'anti-tank',
  spaa: 'air-defence', 'towed-aa': 'air-defence', 'sam-cp': 'air-defence',
  'sp-artillery': 'artillery', 'towed-gun': 'artillery', mortar: 'artillery', 'emplacement-gun': 'artillery',
  mlrs: 'rocket-artillery',
  truck: 'transport-ground', jeep: 'transport-ground', 'civilian-car': 'transport-ground', bus: 'transport-ground', tractor: 'transport-ground', rail: 'transport-ground', 'drone-ground': 'transport-ground', 'mobile-spawn': 'transport-ground',
  radar: 'radar', searchlight: 'radar',
  building: 'installation', 'emplacement-mg': 'installation', ramp: 'installation',
  // People.
  soldier: 'infantry', sniper: 'infantry', crew: 'infantry', medic: 'medic', 'anti-tank': 'at-infantry',
  // Sea.
  carrier: 'carrier',
  destroyer: 'combatant', battleship: 'combatant', cruiser: 'combatant', frigate: 'combatant', 'light-cruiser': 'combatant', battlecruiser: 'combatant', 'heavy-cruiser': 'combatant', 'armoured-cruiser': 'combatant', corvette: 'combatant', 'patrol-ship': 'combatant', sloop: 'combatant',
  rhib: 'small-boat', 'patrol-boat': 'small-boat', 'fast-attack': 'small-boat', 'attack-boat': 'small-boat', 'torpedo-boat': 'small-boat', 'fast-attack-craft': 'small-boat', gunboat: 'small-boat', hydrofoil: 'small-boat', sampan: 'small-boat',
  submarine: 'submarine',
  'landing-craft': 'amphibious', hovercraft: 'amphibious', amphibious: 'amphibious',
  merchant: 'merchant',
  minelayer: 'mine-warfare', minesweeper: 'mine-warfare',
};

/** Classes the ground and missile domains share, by domain. */
const MISSILE_CLS: Record<string, SymbolClass> = { sam: 'missile-sam', manpads: 'missile-sam', atgm: 'missile-agm' };
const GROUND_CLS: Record<string, SymbolClass> = { sam: 'air-defence', manpads: 'air-defence', atgm: 'anti-tank' };

const DOMAIN_FALLBACK: Record<string, [Domain, SymbolClass]> = {
  person: [Domain.Person, 'infantry'],
  ground: [Domain.Ground, 'armour'],
  air: [Domain.Air, 'fighter'],
  heli: [Domain.Heli, 'rotary'],
  missile: [Domain.Missile, 'missile'],
  sea: [Domain.Sea, 'combatant'],
  marker: [Domain.Marker, 'misc'],
};

/** The domain a weapon's class puts it in. */
function weaponDomain(c: SymbolClass): Domain {
  if (c === 'bomb' || c === 'guided-bomb') return Domain.Bomb;
  if (c === 'rocket') return Domain.Rocket;
  return Domain.Missile;
}

export interface UnitClass {
  domain: Domain;
  cls: SymbolClass;
}

/**
 * A figure kind's domain and symbol class (`kind` may carry an `@state`
 * suffix); null for a kind the catalogue does not have.
 */
export function classOfKind(kind: string): UnitClass | null {
  const e = CATALOG[kind.replace(/@.*$/, '')];
  if (!e) return null;
  if (e.domain === 'missile') {
    const c = MISSILE_CLS[e.cls] ?? BY_CLS[e.cls] ?? 'missile';
    return { domain: weaponDomain(c), cls: c };
  }
  if (e.domain === 'ground') {
    const c = GROUND_CLS[e.cls] ?? BY_CLS[e.cls] ?? 'armour';
    return { domain: c === 'installation' ? Domain.Static : Domain.Ground, cls: c };
  }
  if (e.domain === 'sea') {
    const c = BY_CLS[e.cls] ?? 'combatant';
    return { domain: c === 'submarine' ? Domain.Sub : Domain.Sea, cls: c };
  }
  const [domain, fallback] = DOMAIN_FALLBACK[e.domain];
  const c = BY_CLS[e.cls] ?? fallback;
  // A UAV or VTOL keeps its frame's domain; a rotary class is a helicopter whatever list it sits in.
  return { domain: c === 'rotary' || c === 'rotary-attack' || c === 'uav-rotary' ? Domain.Heli : domain, cls: c };
}

/**
 * What the data's type text says a thing without a figure is (Tacview's
 * "Misc+Decoy+Flare", "Projectile+Shell", War Thunder's countermeasures and
 * shells); null when it says nothing this knows.
 */
export function classOfType(type: string): UnitClass | null {
  if (!type) return null;
  if (/flare|countermeasure.?ir|\bir.?decoy/i.test(type)) return { domain: Domain.Flare, cls: 'flare' };
  if (/chaff|countermeasure|decoy/i.test(type)) return { domain: Domain.Chaff, cls: 'chaff' };
  if (/shrapnel|projectile|bullet|shell|tracer|\bround\b/i.test(type)) return { domain: Domain.Shell, cls: 'shell' };
  if (/parachut/i.test(type)) return { domain: Domain.Person, cls: 'parachutist' };
  if (/bomb(?!er)/i.test(type)) return { domain: Domain.Bomb, cls: 'bomb' };
  if (/rocket\b/i.test(type)) return { domain: Domain.Rocket, cls: 'rocket' };
  if (/torpedo|missile|\baam\b|\bsam\b/i.test(type)) return { domain: Domain.Missile, cls: 'missile' };
  if (/container|debris|bullseye|navaid|waypoint|misc/i.test(type)) return { domain: Domain.Misc, cls: 'misc' };
  if (/aerodrome|airfield|airbase|building|static/i.test(type)) return { domain: Domain.Static, cls: 'installation' };
  return null;
}

/**
 * A unit's class: decoys, shells and debris by their type text first (a
 * flare must never get an aircraft's figure from its launcher's name), then
 * the figure's, then the type text's, then unknown.
 */
export function classify(kind: string | null, type: string): UnitClass {
  const byType = classOfType(type);
  if (byType && (byType.domain === Domain.Flare || byType.domain === Domain.Chaff || byType.domain === Domain.Shell || byType.domain === Domain.Person)) return byType;
  return (kind ? classOfKind(kind) : null) ?? byType ?? { domain: Domain.Unknown, cls: 'unknown' };
}

/** Domains that are weapons in flight: their own glyph far off, never the min-pixel inflation. */
export function isWeaponDomain(d: number): boolean {
  return d === Domain.Missile || d === Domain.Bomb || d === Domain.Rocket;
}

/** Domains that are not units at all (decoys, shells, debris): never a figure, symbol, label or drop line. */
export function isEffectDomain(d: number): boolean {
  return d === Domain.Flare || d === Domain.Chaff || d === Domain.Shell || d === Domain.Misc;
}

/** Most teams the word tells apart (more share the last one). */
export const WORD_TEAMS = 15;
/** The moving bit: set by the place pass for a unit with a heading worth drawing. */
export const WORD_MOVING = 1 << 20;
/** The dead bit: set where the unit is a wreck now (`data/deaths.ts`); its symbol is crossed out. */
export const WORD_DEAD = 1 << 21;
/** Instance float: `-WORD_BASE - word`. */
export const WORD_BASE = 1000;

/** Class (bits 0-7), team + 1 (bits 8-15, 0: no team), domain (bits 16-19). */
export function packWord(c: UnitClass, team: number | null): number {
  const t = team === null || team < 0 ? 0 : Math.min(team, WORD_TEAMS - 1) + 1;
  return (symbolIndex(c.cls) | (t << 8) | (c.domain << 16)) >>> 0;
}

export function unpackWord(w: number): { cls: number; team: number; domain: number; moving: boolean } {
  return { cls: w & 0xff, team: ((w >>> 8) & 0xff) - 1, domain: (w >>> 16) & 0xf, moving: (w & WORD_MOVING) !== 0 };
}

/** A word without a class (tracks assembled elsewhere): an aircraft or a ground thing, by the air flag. */
export function fallbackWord(air: boolean): number {
  return packWord(air ? { domain: Domain.Air, cls: 'fighter' } : { domain: Domain.Ground, cls: 'unknown' }, null);
}
