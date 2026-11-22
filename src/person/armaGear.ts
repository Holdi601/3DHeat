/**
 * Arma 3's own damage and armour numbers for the person-hit analysis, from
 * the install's catalogue (`heat3d-arma3-maps catalog`, 0.4.0 on): the
 * magazines (display and short name, what an OCAP weapon text shows in
 * brackets), the ammunition they load (`hit`, `caliber`, `typicalSpeed`),
 * vests and headgear with their armour per hit point, and the soldiers with
 * their default vest and headgear. The dev and preview servers hand these
 * out at `CATALOG_FACTS_ROUTE/<game>` (vite.config.ts); without a catalogue
 * nothing changes.
 *
 * An OCAP recording names no loadout: a soldier's armour is an estimate, the
 * default gear of the game's soldier class whose display name and side match
 * the unit's role (a mission's own role names, "2IC", "GPMG", match none).
 */

/** Where the servers serve a game's catalogue facts (204 when there are none). */
export const CATALOG_FACTS_ROUTE = '/__heat3d/catalog-facts';

export interface ArmaFact {
  id: string;
  kind: string;
  name: string;
  class?: string;
  short?: string;
  ammo?: string;
  side?: string;
  vest?: string;
  helmet?: string;
  hit?: number;
  caliber?: number;
  typicalSpeed?: number;
  initSpeed?: number;
  protection?: Record<string, { armor?: number; passThrough?: number }>;
}

export interface ArmaAmmoFacts {
  /** The ammunition class (`B_65x39_Caseless`). */
  ammo: string;
  /** The game's damage at its typical speed, its penetration factor, the speed (m/s). */
  hit: number;
  caliber: number;
  typicalSpeed: number;
  /** mm read from the ammunition class name (`B_65x39_...` 6.5), NaN where it holds none. */
  calibre: number;
  /** AP, tracer, ball... from the ammunition class name. */
  ammoType: string;
  /** bullet, shell, missile... */
  kind: string;
}

export interface ArmaArmour {
  vest: string;
  helmet: string;
  /** The vest's chest armour and the helmet's head armour (the game's points), NaN none. */
  chest: number;
  head: number;
}

let magByName = new Map<string, string>();
let ammoById = new Map<string, ArmaFact>();
let gearById = new Map<string, ArmaFact>();
let menByRole = new Map<string, ArmaFact[]>();
let stamp = '';

/** Installs the facts (`items` of a catalogue); returns how many. Replaces what was there. */
export function setArmaFacts(items: ArmaFact[] | null): number {
  magByName = new Map();
  ammoById = new Map();
  gearById = new Map();
  menByRole = new Map();
  stamp = '';
  if (!items) return 0;
  // A short name ("6.5 mm") many magazines share: the ammunition most of them load.
  const votes = new Map<string, Map<string, number>>();
  const vote = (name: string | undefined, ammo: string) => {
    if (!name) return;
    const k = name.trim().toLowerCase();
    let m = votes.get(k);
    if (!m) votes.set(k, (m = new Map()));
    m.set(ammo, (m.get(ammo) ?? 0) + 1);
  };
  for (const it of items) {
    if (!it || typeof it.id !== 'string') continue;
    if (it.kind === 'magazine' && it.ammo) {
      vote(it.name, it.ammo);
      vote(it.short, it.ammo);
      vote(it.id, it.ammo);
    } else if (it.kind === 'ammo') ammoById.set(it.id.toLowerCase(), it);
    else if (it.kind === 'vest' || it.kind === 'helmet') gearById.set(it.id.toLowerCase(), it);
    else if (it.kind === 'man' && it.name) {
      const k = `${it.side ?? ''}|${it.name.toLowerCase()}`;
      let l = menByRole.get(k);
      if (!l) menByRole.set(k, (l = []));
      l.push(it);
    }
  }
  for (const [k, m] of votes) magByName.set(k, [...m].sort((a, b) => b[1] - a[1])[0][0]);
  stamp = `${items.length}`;
  return items.length;
}

/** What the installed facts are (for a cache key): '' none. */
export function armaFactsStamp(): string {
  return stamp;
}

/** Fetches the Arma 3 facts once (a worker or the page); failures leave none. */
let loading: Promise<void> | null = null;
export function loadArmaFacts(): Promise<void> {
  loading ??= (async () => {
    try {
      const r = await fetch(`${CATALOG_FACTS_ROUTE}/arma3`, { cache: 'no-cache' });
      if (!r.ok || r.status === 204) return;
      const doc = (await r.json()) as { items?: ArmaFact[] };
      setArmaFacts(Array.isArray(doc.items) ? doc.items : null);
    } catch {
      // No server route (a static build) or no catalogue: the names alone are read.
    }
  })();
  return loading;
}

/** mm from an Arma ammunition class name: `B_65x39_Caseless` 6.5, `B_556x45_Ball` 5.56, `B_127x99_Ball` 12.7, `B_9x21_Ball` 9. */
export function calibreOfAmmoId(id: string): number {
  const m = /(?:^|_)(\d{1,3})x(\d{2,3})/i.exec(id);
  if (!m) return NaN;
  const a = m[1];
  if (a.length === 1) return Number(a);
  if (a.length === 2) return a === '20' || a === '30' || a === '35' || a === '40' || a === '12' || a === '14' ? Number(a) : Number(a) / 10;
  return Number(a) / (a.startsWith('1') ? 10 : 100);
}

function typeOfAmmoId(id: string): string {
  const s = id.toLowerCase();
  if (/_ap\b|_ap_|_ap$|sabot|apfsds/.test(s)) return 'AP';
  if (/tracer|_t_|_t$/.test(s)) return 'tracer';
  if (/_he\b|_he_|_he$|explosive/.test(s)) return 'explosive';
  if (/pellet|buck|slug/.test(s)) return /slug/.test(s) ? 'slug' : 'buckshot';
  if (/ball|caseless|_b_/.test(s)) return 'ball';
  return '';
}

/** The ammunition a magazine's display name, short name or class loads, with the game's numbers; null not listed. */
export function armaMagazineFacts(magazine: string): ArmaAmmoFacts | null {
  if (!magazine) return null;
  const ammoId = magByName.get(magazine.trim().toLowerCase());
  if (!ammoId) return null;
  const a = ammoById.get(ammoId.toLowerCase());
  return {
    ammo: ammoId,
    hit: a?.hit ?? NaN,
    caliber: a?.caliber ?? NaN,
    typicalSpeed: a?.typicalSpeed ?? NaN,
    calibre: calibreOfAmmoId(ammoId),
    ammoType: typeOfAmmoId(ammoId),
    kind: a?.class ?? '',
  };
}

const SIDE_WORD: Record<string, string> = { WEST: 'west', EAST: 'east', GUER: 'guer', IND: 'guer', CIV: 'civ' };

/** The default armour of the game's soldier whose display name is `role` on `side` (OCAP's `WEST`...), or null. */
export function armaRoleArmour(side: string, role: string): ArmaArmour | null {
  if (!role) return null;
  const list = menByRole.get(`${SIDE_WORD[side] ?? side.toLowerCase()}|${role.trim().toLowerCase()}`);
  if (!list?.length) return null;
  // Several classes share a name (one per faction): the gear most of them wear.
  const pick = (k: 'vest' | 'helmet') => {
    const n = new Map<string, number>();
    for (const m of list) if (m[k]) n.set(m[k]!, (n.get(m[k]!) ?? 0) + 1);
    return [...n].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  };
  const vest = pick('vest'), helmet = pick('helmet');
  const v = vest ? gearById.get(vest.toLowerCase()) : undefined;
  const h = helmet ? gearById.get(helmet.toLowerCase()) : undefined;
  return {
    vest: v?.name ?? '',
    helmet: h?.name ?? '',
    chest: v?.protection?.HitChest?.armor ?? NaN,
    head: h?.protection?.HitHead?.armor ?? NaN,
  };
}
