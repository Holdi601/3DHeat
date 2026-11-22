/**
 * A weapon's class, calibre and ammunition type, per game, where the data
 * names only the weapon (docs/person-hits.md "Where each value comes from").
 *
 * - Counter-Strike 2: the game's files give each weapon's damage, armour
 *   ratio and range modifier (the install's catalogue, `cs2Numbers`), not a
 *   calibre: the calibre is the real weapon's cartridge (an estimate).
 * - Arma 3 (OCAP): the weapon text carries the magazine (`L85A3 [5.56 mm AP]`,
 *   `AK-74M [7N10]`): its calibre and type are read from the magazine's name
 *   (derived), or from the install's catalogue where it lists the magazine.
 * - VALORANT, Rainbow Six Siege: the class by the weapon's name; no calibre.
 */

export interface WeaponFacts {
  cls: string;
  /** mm, NaN unknown. */
  calibre: number;
  ammoType: string;
  /** The cartridge in words ('5.56x45mm'), '' unknown. */
  ammo: string;
}

const W = (cls: string, calibre: number, ammo: string, ammoType = 'ball'): WeaponFacts => ({ cls, calibre, ammo, ammoType });

/** Counter-Strike 2, by the name the converter writes: the real weapon's cartridge. */
const CS2: Record<string, WeaponFacts> = {
  'AK-47': W('rifle', 7.62, '7.62x39mm'),
  'M4A4': W('rifle', 5.56, '5.56x45mm'),
  'M4A1-S': W('rifle', 5.56, '5.56x45mm'),
  'Galil AR': W('rifle', 5.56, '5.56x45mm'),
  'FAMAS': W('rifle', 5.56, '5.56x45mm'),
  'AUG': W('rifle', 5.56, '5.56x45mm'),
  'SG 553': W('rifle', 5.56, '5.56x45mm'),
  'AWP': W('sniper', 8.6, '.338 Lapua Magnum'),
  'SSG 08': W('sniper', 7.62, '7.62x51mm'),
  'SCAR-20': W('sniper', 7.62, '7.62x51mm'),
  'G3SG1': W('sniper', 7.62, '7.62x51mm'),
  'Desert Eagle': W('pistol', 12.7, '.50 AE'),
  'R8 Revolver': W('pistol', 10.9, '.44 Magnum'),
  'USP-S': W('pistol', 11.43, '.45 ACP'),
  'P2000': W('pistol', 9.02, '.357 SIG'),
  'Glock-18': W('pistol', 9, '9x19mm'),
  'P250': W('pistol', 9.02, '.357 SIG'),
  'Five-SeveN': W('pistol', 5.7, '5.7x28mm'),
  'Tec-9': W('pistol', 9, '9x19mm'),
  'CZ75-Auto': W('pistol', 9, '9x19mm'),
  'Dual Berettas': W('pistol', 9, '9x19mm'),
  'MP9': W('smg', 9, '9x19mm'),
  'MAC-10': W('smg', 11.43, '.45 ACP'),
  'MP7': W('smg', 4.6, '4.6x30mm'),
  'MP5-SD': W('smg', 9, '9x19mm'),
  'UMP-45': W('smg', 11.43, '.45 ACP'),
  'P90': W('smg', 5.7, '5.7x28mm'),
  'PP-Bizon': W('smg', 9, '9x18mm Makarov'),
  'Nova': W('shotgun', 18.5, '12 gauge', 'buckshot'),
  'XM1014': W('shotgun', 18.5, '12 gauge', 'buckshot'),
  'MAG-7': W('shotgun', 18.5, '12 gauge', 'buckshot'),
  'Sawed-Off': W('shotgun', 18.5, '12 gauge', 'buckshot'),
  'M249': W('lmg', 5.56, '5.56x45mm'),
  'Negev': W('lmg', 5.56, '5.56x45mm'),
  'Zeus x27': W('taser', NaN, '', 'electric'),
  'High Explosive Grenade': W('grenade', NaN, '', 'explosive'),
  'Molotov': W('grenade', NaN, '', 'fire'),
  'Incendiary Grenade': W('grenade', NaN, '', 'fire'),
  'Flashbang': W('grenade', NaN, '', 'blunt'),
  'Smoke Grenade': W('grenade', NaN, '', 'blunt'),
  'Decoy Grenade': W('grenade', NaN, '', 'blunt'),
  'C4 Explosive': W('explosive', NaN, '', 'explosive'),
};

export function cs2Weapon(name: string): WeaponFacts | null {
  const hit = CS2[name];
  if (hit) return hit;
  if (/knife|bayonet|karambit|dagger|melee/i.test(name)) return W('melee', NaN, '', 'melee');
  return null;
}

/**
 * A CS2 weapon's damage numbers from the install (`items_game`/`weapons.vdata`, the catalogue's `numbers`): base damage,
 * the armour ratio, the range modifier (per 500 units), the headshot multiplier.
 */
export interface Cs2Numbers {
  damage: number;
  armourRatio: number;
  rangeModifier: number;
  headshot: number;
  penetration: number;
}

/** The damage the game's formula gives an unarmoured body hit at `metres` (before the hit group's multiplier). */
export function cs2Falloff(n: Cs2Numbers, metres: number): number {
  const units = metres / 0.0254;
  return n.damage * Math.pow(n.rangeModifier, units / 500);
}

/** VALORANT's weapons by name (the file's own inventory names them). */
const VALORANT_CLASS: Record<string, string> = {
  Classic: 'pistol', Shorty: 'pistol', Frenzy: 'pistol', Ghost: 'pistol', Sheriff: 'pistol',
  Stinger: 'smg', Spectre: 'smg',
  Bucky: 'shotgun', Judge: 'shotgun',
  Bulldog: 'rifle', Guardian: 'rifle', Phantom: 'rifle', Vandal: 'rifle',
  Marshal: 'sniper', Outlaw: 'sniper', Operator: 'sniper',
  Ares: 'lmg', Odin: 'lmg',
  Melee: 'melee', Knife: 'melee',
};

export function valorantWeapon(name: string): WeaponFacts {
  const cls = VALORANT_CLASS[name] ?? '';
  return { cls, calibre: NaN, ammo: '', ammoType: cls === 'shotgun' ? 'buckshot' : cls === 'melee' ? 'melee' : cls ? 'ball' : '' };
}

/** Soviet and Russian cartridge codes (GRAU) an Arma magazine names, to calibre and type. */
const GRAU: [RegExp, number, string, string][] = [
  [/7n(6|10|22|24|39)/i, 5.45, '5.45x39mm', 'ball'],
  [/57-?n-?231|57-?n-?231(89)?/i, 7.62, '7.62x39mm', 'ball'],
  [/57-?n-?323|7n1|7n14|7n26/i, 7.62, '7.62x54mmR', 'ball'],
  [/7n21|7n31/i, 9, '9x19mm', 'AP'],
  [/57-?n-?181/i, 9, '9x18mm Makarov', 'ball'],
];

/** Western cartridge words. */
const NATO: [RegExp, number, string][] = [
  [/m855a1|m855|m193|ss109|5[.,]56/i, 5.56, '5.56x45mm'],
  [/m80a1|m80|m61|m993|7[.,]62\s?x\s?51|7[.,]62\s?mm(?!\s?x\s?(39|54))/i, 7.62, '7.62x51mm'],
  [/7[.,]62\s?x\s?39/i, 7.62, '7.62x39mm'],
  [/7[.,]62\s?x\s?54/i, 7.62, '7.62x54mmR'],
  [/5[.,]45/i, 5.45, '5.45x39mm'],
  [/6[.,]5\s?(mm|x39)?/i, 6.5, '6.5mm'],
  [/9\s?(mm|x19)/i, 9, '9x19mm'],
  [/\.45|11[.,]43/i, 11.43, '.45 ACP'],
  [/\.50|12[.,]7/i, 12.7, '12.7mm'],
  [/\.338|8[.,]6/i, 8.6, '.338'],
  [/\.408|10[.,]36/i, 10.36, '.408'],
  [/\.300|7[.,]62\s?x\s?67/i, 7.62, '.300 Win Mag'],
  [/12\s?(g|ga|gauge)|buck|slug|pellet/i, 18.5, '12 gauge'],
  [/40\s?mm|m433|m406|vog/i, 40, '40mm grenade'],
  [/4[.,]6/i, 4.6, '4.6x30mm'],
  [/5[.,]7/i, 5.7, '5.7x28mm'],
];

/** The type a magazine's name says (AP, tracer, ball...). */
function magazineType(m: string): string {
  if (/\bap\b|armou?r.?pierc|m995|m993|7n24|7n39|bs\b/i.test(m)) return 'AP';
  if (/tracer|\btr\b|t\b-/i.test(m)) return 'tracer';
  if (/\bsd\b|subsonic|us\b/i.test(m)) return 'subsonic';
  if (/\bhp\b|hollow|jhp|soft/i.test(m)) return 'HP';
  if (/buck|pellet/i.test(m)) return 'buckshot';
  if (/slug/i.test(m)) return 'slug';
  if (/\bhe\b|frag|grenade|40\s?mm|vog|m433|m406/i.test(m)) return 'explosive';
  if (/epr|m855a1/i.test(m)) return 'enhanced';
  return 'ball';
}

/** An OCAP weapon text (`Name [magazine]`) as weapon and magazine. */
export function splitOcapWeapon(text: string): { weapon: string; magazine: string } {
  const t = text.trim();
  const m = /^(.*?)\s*\[([^\]]*)\]\s*$/.exec(t);
  if (!m) return { weapon: t, magazine: '' };
  return { weapon: m[1].trim(), magazine: m[2].trim() };
}

/** An Arma magazine's (or weapon's) calibre and type from its name; null when it names none. */
export function armaAmmo(magazine: string, weapon = ''): WeaponFacts | null {
  const m = magazine || '';
  for (const [re, cal, ammo, type] of GRAU) if (re.test(m)) return { cls: '', calibre: cal, ammo, ammoType: magazineType(m) === 'ball' ? type : magazineType(m) };
  for (const [re, cal, ammo] of NATO) if (re.test(m)) return { cls: '', calibre: cal, ammo, ammoType: magazineType(m) };
  // No magazine word: the weapon's own name often says its calibre ("AK-12 7.62 mm").
  if (weapon) for (const [re, cal, ammo] of NATO) if (re.test(weapon)) return { cls: '', calibre: cal, ammo, ammoType: magazineType(m) };
  return null;
}

/** A weapon class from a name (any game), '' unknown. */
export function classOfName(name: string): string {
  const n = name.toLowerCase();
  if (/knife|bayonet|melee|machete|axe|fist/.test(n)) return 'melee';
  if (/grenade|frag|\bhe\b|molotov|claymore|mine|c4|satchel|explosive/.test(n)) return 'grenade';
  if (/launcher|rpg|nlaw|at4|m136|maaws|javelin|titan|pcml|rpg-?7|rpo/.test(n)) return 'launcher';
  if (/pistol|glock|p07|p226|p99|rook|4-five|acp-c2|makarov|\bpm\b|m9\b|1911|revolver|deagle|zubr/.test(n)) return 'pistol';
  if (/gpmg|pkm|pkp|m60|m240|m249|mk200|lim-85|minimi|rpk|negev|\blmg\b|l7a2|l110|mg3|mg42|navid|spmg/.test(n)) return 'lmg';
  if (/sniper|lrr|gm6|lynx|m24|m40|svd|svds|m2010|l115|l129|ebr|dmr|mar-10|cyrus|asp-1|rahim|mk-?1|mk14|mk18|sr-25|m110/.test(n)) return 'sniper';
  if (/smg|mp5|mp7|ump|vector|sting|protector|pdw|vermin|p90|bizon|uzi/.test(n)) return 'smg';
  if (/shotgun|m1014|saiga|spas|m870|kozlice/.test(n)) return 'shotgun';
  if (/hmg|\bm2\b|kord|dshk|nsv|mk19|gmg|cannon|autocannon|coyote|jackal|lav|apc|ifv|tank|heli|ah-64|uh-|mi-|boxer|fuchs|panther|vehicle/.test(n)) return 'vehicle';
  if (/rifle|carbine|ak|m4|m16|l85|l119|g36|hk416|aug|famas|mx|katiba|trg|spar|sdar|tavor|car-95|promet|galil|scar|f2000|ar-?15|sa80|l22/.test(n)) return 'rifle';
  return '';
}

/** Rainbow Six Siege: the converter's weapon class words to the classes here. */
export function r6Class(cls: string, name: string): string {
  const c = cls.toLowerCase();
  if (c.includes('assault')) return 'rifle';
  if (c.includes('marksman') || c.includes('sniper')) return 'sniper';
  if (c.includes('submachine') || c === 'smg') return 'smg';
  if (c.includes('machine pistol')) return 'smg';
  if (c.includes('shotgun')) return 'shotgun';
  if (c.includes('lmg') || c.includes('light machine')) return 'lmg';
  if (c.includes('pistol') || c.includes('revolver') || c.includes('hand cannon')) return 'pistol';
  if (c.includes('ability') || c.includes('gadget')) return 'ability';
  if (c.includes('melee')) return 'melee';
  return c || classOfName(name);
}
