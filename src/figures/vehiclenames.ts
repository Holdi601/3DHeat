/**
 * Real-vehicle names as matched across games. One game calls a vehicle
 * "T-72B3 obr. 2016", another "T-72B3", a third "MBT T-72B3"; one writes
 * "2K22 Tunguska", another `2S6 "Tunguska"`; one has "Leopard 2A7" where
 * another only has the 2A6. A unit of one game is drawn with another game's
 * model when their names meet here, in three tiers, the first that finds one:
 *
 * 1. the same vehicle (`strongKeys`): the name as written, the name without
 *    what only qualifies it (a year, "obr."/"mod.", a bracket, a quoted
 *    nickname, a class word in front, a trailing SEP/ERA/export tag,
 *    "Pz.Kpfw." as "Pz.", Mk numerals as digits), its designation without a
 *    nickname ("AH-1Z Viper" -> "AH-1Z"), and the synonyms of `SYNONYMS`
 *    (NATO and Soviet designations, export names);
 * 2. the nearest counterpart of the same family (`family`): the designation's
 *    letters and first number ("leopard2", "t72", "su25"), the closest by
 *    the longest shared start, a parent before a sibling ("F-4E-45MC" takes
 *    the F-4E before the F-4EJ);
 * 3. the same nickname ("M2A4 Bradley" takes an M3 Bradley; "Saint-Chamond"
 *    the `Char d'assaut "Saint-Chamond"`).
 *
 * Aircraft, helicopters, ground vehicles and ships only meet their own kind.
 */

/** A name as names are compared: lower case, letters and digits only ("M1A2 SEP" -> "m1a2sep"). */
export function nameKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/**
 * Names of one vehicle in different games and armies, first the one other
 * names are filed under. Only pairs the rules cannot find: NATO reporting
 * names, Soviet index numbers, export names.
 */
export const SYNONYMS: readonly (readonly string[])[] = [
  ['2S6', '2K22', '2K22 Tunguska', '2S6M', 'SA-19', 'SA-19 Grison', 'Tunguska'],
  ['9K33 Osa', 'SA-8', 'SA-8 Gecko', 'Osa', '9A33'],
  ['9K35 Strela-10', 'SA-13', 'SA-13 Gopher', 'Strela-10', 'Strela-10M2', '9A35'],
  ['9K31 Strela-1', 'SA-9', 'SA-9 Gaskin', 'Strela-1', '9P31'],
  ['9K330 Tor', 'SA-15', 'SA-15 Gauntlet', 'Tor-M1', 'Tor M2', '9A331'],
  ['9K37 Buk', 'SA-11', 'SA-11 Gadfly', 'Buk-M1', '9A310M1'],
  ['2K12 Kub', 'SA-6', 'SA-6 Gainful', 'Kub', 'Kvadrat'],
  ['S-125', 'SA-3', 'SA-3 Goa', 'S-125 Neva', 'Pechora'],
  ['S-75', 'SA-2', 'SA-2 Guideline', 'S-75 Dvina'],
  ['S-300PS', 'SA-10', 'SA-10 Grumble', 'S-300'],
  ['Pantsir-S1', 'SA-22', 'SA-22 Greyhound', '96K6'],
  ['ZSU-23-4', 'ZSU-23-4 Shilka', 'Shilka'],
  ['Gepard', 'Flakpanzer Gepard', 'Gepard 1A2', 'Cheetah', 'Flakpanzer Cheetah'],
  ['BMP-1', 'BVP-1'],
  ['BM-21', 'BM-21 Grad', 'Grad'],
  ['BM-27', 'BM-27 Uragan', 'Uragan'],
  ['BM-30', 'BM-30 Smerch', 'Smerch', '9A52'],
  ['2S1', '2S1 Gvozdika', 'Gvozdika'],
  ['2S3', '2S3 Akatsiya', 'Akatsiya'],
  ['2S19', '2S19 Msta-S', 'Msta-S'],
  ['M1A2', 'M1A2 Abrams', 'M-1 Abrams', 'M1 Abrams'],
  ['M2A2 Bradley', 'M2 Bradley', 'M-2 Bradley', 'M2A2 ODS'],
  ['M3A3 Bradley', 'M3 Bradley'],
  ['M6 Linebacker', 'M6A1 Linebacker'],
  ['M163 VADS', 'M163', 'Vulcan Air Defense System'],
  ['M1097 Avenger', 'Avenger'],
  ['Merkava Mk.4', 'Merkava IV', 'Merkava Mk 4', 'Merkava Mk.4M'],
  ['Challenger 2', 'Challenger II'],
  ['Type 99', 'ZTZ-99', 'ZTZ99'],
  ['Type 99A', 'ZTZ-99A', 'ZTZ99A'],
  ['Type 96B', 'ZTZ-96B', 'ZTZ96B'],
  ['Type 96A', 'ZTZ-96A', 'ZTZ96A'],
  ['ZBD-04A', 'ZBD04A', 'Type 04A'],
  ['PGZ-09', 'PGZ09', 'Type 09'],
  ['PGZ-04A', 'PGZ04A', 'PGZ-95'],
  ['PLZ-05', 'PLZ05'],
  ['Tiger H1', 'Tiger I', 'Pz.VI Tiger', 'Pz.Kpfw. VI Ausf. H1', 'Tiger'],
  ['Panther A', 'Pz.V Panther', 'Pz.Kpfw. V Panther', 'Panther'],
  ['Pz.IV H', 'Pz.Kpfw. IV Ausf. H', 'Panzer IV', 'Pz.IV'],
  ['M4', 'M4 Sherman', 'Sherman'],
  ['T-34-85', 'T-34/85', 'Tk T-34-85'],
  ['Sd.Kfz.251', 'Sd.Kfz. 251', 'SdKfz 251'],
  ['F/A-18C', 'F-18C', 'FA-18C', 'F/A-18C Hornet', 'Hornet'],
  ['F/A-18E', 'F-18E', 'Super Hornet'],
  ['AV-8B', 'AV-8B Harrier II', 'AV-8B Plus', 'AV-8B(NA)'],
  ['F-16C', 'F-16C Block 50', 'F-16CM', 'F-16CM bl.50'],
  ['Su-27', 'Flanker', 'Su-27 Flanker'],
  ['Su-33', 'Flanker-D'],
  ['Su-30', 'Flanker-C', 'Su-30SM'],
  ['Su-34', 'Fullback'],
  ['Su-57', 'Felon', 'PAK FA'],
  ['Su-25', 'Frogfoot', 'Su-25 Frogfoot'],
  ['Su-24M', 'Fencer', 'Su-24'],
  ['MiG-29', 'Fulcrum', 'MiG-29A', 'MiG-29 (9.12)', 'MiG-29A Fulcrum'],
  ['MiG-21bis', 'Fishbed', 'MiG-21'],
  ['MiG-23MLD', 'Flogger', 'MiG-23'],
  ['MiG-25', 'Foxbat'],
  ['MiG-31', 'Foxhound'],
  ['Tu-22M3', 'Backfire', 'Tu-22M'],
  ['Tu-95', 'Bear', 'Tu-95MS', 'Tu-142'],
  ['Tu-160', 'Blackjack'],
  ['A-50', 'Mainstay'],
  ['Il-76', 'Candid', 'Il-76MD'],
  ['Mi-24P', 'Hind', 'Mi-24', 'Mi-35', 'Mi-24V'],
  ['Mi-8MT', 'Hip', 'Mi-8', 'Mi-8MTV2', 'Mi-17', 'Mi-8AMTSh'],
  ['Mi-28N', 'Havoc', 'Mi-28'],
  ['Ka-50', 'Hokum', 'Ka-50 III', 'Black Shark'],
  ['Ka-52', 'Hokum-B', 'Alligator'],
  ['Mi-26', 'Halo'],
  ['Ka-27', 'Helix', 'Ka-29'],
  ['AH-64D', 'AH-64D Longbow', 'Apache', 'AH-64D BLK.II', 'AH-64E'],
  ['UH-1H', 'Huey', 'UH-1H Iroquois'],
  ['UH-60A', 'Black Hawk', 'UH-60L', 'UH-60M', 'MH-60'],
  ['CH-47D', 'Chinook', 'CH-47F', 'MH-47G'],
  ['OH-58D', 'Kiowa Warrior', 'OH-58D Kiowa'],
  ['SA.342M Gazelle', 'SA342M', 'SA342L', 'SA 342', 'Gazelle'],
  ['AH-6M', 'AH-6 Little Bird', 'MH-6 Little Bird', 'Little Bird'],
  ['JF-17', 'FC-1', 'FC-1 Xiaolong'],
  ['J-11A', 'J-11'],
  ['F-4E', 'F-4E Phantom II', 'F-4E-45MC'],
  ['A-10A', 'A-10 Thunderbolt II'],
  ['P-51D', 'Mustang', 'P-51D-25-NA', 'P-51D-30-NA', 'TF-51D'],
  ['Spitfire LF Mk IX', 'Spitfire LF Mk.IXc', 'Spitfire LF Mk. IX', 'Spitfire IX'],
  ['Bf 109 K-4', 'Bf-109K-4', 'Bf 109K-4'],
  ['Fw 190 A-8', 'FW-190A8', 'Fw 190A-8'],
  ['Fw 190 D-9', 'FW-190D9', 'Fw 190D-9'],
  ['F4U-1D', 'Corsair', 'F4U-1D Corsair'],
  ['Mosquito FB Mk VI', 'MosquitoFBMkVI', 'Mosquito FB.VI'],
];

const ROMAN: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10 };
/** Words a game puts before the name to say what kind of vehicle it is. */
const CLASS_FRONT = /^\s*(?:tk|mbt|ifv|apc|mrap|srbm|ashm|sam|aaa|spaag|spaa|spg|sph|lt|mt|ht|td|ewr|atgm|mlrs|light tank|medium tank|heavy tank|tank)\s+/i;
/** Ship class words after the name. */
const CLASS_BACK = /\s+(?:destroyer|frigate|cruiser|corvette|(?:attack )?submarine|missile boat|amphibious transport dock|carrier|airship|battleship)\s*$/i;
/** Tags after the name that only qualify a variant. */
const TAG_BACK = /\b(?:SEP(?:\s*v\d)?|TUSK\s*I*|ERA|FC|Export|CW)\s*$/i;
/** Designations too short to stand for one vehicle without their nickname (an M2A4 is a light tank and a Bradley). */
const AMBIGUOUS = new Set(['m2a4', 'su57', 'm3', 'm2']);
/** Words after a designation that are not a nickname: variants, roles, gun makers. */
const GENERIC = new Set(['night', 'early', 'late', 'tanker', 'radar', 'launcher', 'trailer', 'truck', 'transport', 'command', 'bofors', 'oerlikon', 'browning', 'vickers', 'maxim']);
/** Families too wide to take a counterpart from (an M2 is a Bradley, a half-track, a light tank and a machine gun). */
const WIDE_FAMILY = new Set(['m2', 'm3']);

/** The name without what only qualifies it: year, obr./mod., brackets, quoted nickname, class words, variant tags. */
export function cleanName(name: string): string {
  let s = name ?? '';
  s = s.replace(/"[^"]*"|“[^”]*”/g, ' ');
  s = s.replace(/\([^)]*\)|\[[^\]]*\]/g, ' ');
  s = s.replace(/\b(?:obr|mod|model|type)\.?\s*(?:19|20)\d\d\b/gi, ' ');
  s = s.replace(/\bAusf\.?\s*/gi, ' ');
  s = s.replace(/\bPz\.?\s*Kpfw\.?\s*/gi, 'Pz.');
  s = s.replace(/\bMk\.?\s*([IVX]+)\b/gi, (_m, r: string) => `Mk ${ROMAN[r.toLowerCase()] ?? r}`);
  s = s.replace(CLASS_FRONT, ' ');
  s = s.replace(CLASS_BACK, ' ');
  s = s.replace(TAG_BACK, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

/** "AH-1Z Viper" -> "ah1z", "JAS 39 Gripen" -> "jas39": the words up to the last with a digit, when only plain words follow. */
export function designation(cleaned: string): string {
  const toks = cleaned.split(/\s+/).filter(Boolean);
  let last = -1;
  toks.forEach((t, i) => {
    if (/\d/.test(t)) last = i;
  });
  if (last < 0 || last === toks.length - 1) return '';
  const k = nameKey(toks.slice(0, last + 1).join(' '));
  return k.length >= 3 && !AMBIGUOUS.has(k) ? k : '';
}

/** A key's family: its letters and first number ("leopard2a7" -> "leopard2", "t72b3" -> "t72"), or ''. */
export function family(key: string): string {
  const m = /^([a-z]{1,8})(\d+)/.exec(key);
  return m && m[0].length >= 2 ? m[0] : '';
}

/** The nickname of a name ("Tunguska" of `2S6 "Tunguska"` or "2K22 Tunguska") as a key, or ''. */
export function nickname(name: string): string {
  const q = /"([^"]+)"|“([^”]+)”/.exec(name ?? '');
  if (q) {
    const k = nameKey(q[1] ?? q[2] ?? '');
    return k.length >= 5 ? k : '';
  }
  const toks = cleanName(name).split(/\s+/).filter(Boolean);
  if (toks.length >= 2 && /\d/.test(toks[0]) && !toks.slice(1).some((t) => /\d/.test(t))) {
    const k = nameKey(toks.slice(1).join(' '));
    return k.length >= 5 && !GENERIC.has(k) ? k : '';
  }
  return '';
}

const synonymOf = new Map<string, string>();
for (const group of SYNONYMS) {
  const canon = nameKey(group[0]);
  for (const n of group) {
    synonymOf.set(nameKey(n), canon);
    synonymOf.set(nameKey(cleanName(n)), canon);
  }
}

/** The keys a name stands for as the same vehicle: as written, cleaned, its designation, their synonyms. */
export function strongKeys(name: string): string[] {
  const out: string[] = [];
  const c = cleanName(name);
  for (const k of [nameKey(name), nameKey(c), designation(c)]) if (k.length >= 3 && !out.includes(k)) out.push(k);
  for (const k of [...out]) {
    const s = synonymOf.get(k);
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

function familyKey(name: string): string {
  const c = cleanName(name);
  return designation(c) || nameKey(c);
}

/** What a vehicle is, as far as matching goes: 'air', 'heli', 'ground', 'sea' or '' (unknown). */
export function vehicleSide(domain?: string, kind?: string): string {
  const d = (domain ?? '').toLowerCase();
  if (d === 'heli' || (d === 'air' && /heli/i.test(kind ?? ''))) return 'heli';
  return d === 'air' || d === 'ground' || d === 'sea' ? d : '';
}

/** How a name was found: the same vehicle, the nearest of its family, or the same nickname. */
export type NameTier = 'same' | 'family' | 'nickname';

/** A filed vehicle; `rank` 0 when filed under its name as written, 1 under a cleaned name, designation or synonym. */
type Filed<T> = { value: T; side: string; rank: number };

/** Whether score `a` beats `b`, compared item by item. */
function ahead(a: number[], b: number[]): boolean {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}

/** Vehicles filed by their names, to find the one another game's name stands for. */
export class VehicleNames<T> {
  private strong = new Map<string, Filed<T>[]>();
  private fam = new Map<string, (Filed<T> & { key: string })[]>();
  private nick = new Map<string, Filed<T>[]>();

  private static put<V>(m: Map<string, V[]>, k: string, v: V): void {
    const list = m.get(k);
    if (list) list.push(v);
    else m.set(k, [v]);
  }

  /** Files `value` under `names`; of several filed under one key, one filed under its name as written wins, then the first. */
  add(names: readonly (string | undefined | null)[], value: T, side = ''): void {
    const seen = new Set<string>();
    for (const n of names) {
      if (typeof n !== 'string' || !n.trim()) continue;
      strongKeys(n).forEach((k, i) => {
        if (seen.has(`s${k}`)) return;
        seen.add(`s${k}`);
        VehicleNames.put(this.strong, k, { value, side, rank: i === 0 ? 0 : 1 });
      });
      const fk = familyKey(n);
      const f = family(fk);
      if (f && !seen.has(`f${fk}`)) {
        seen.add(`f${fk}`);
        VehicleNames.put(this.fam, f, { key: fk, value, side, rank: 1 });
      }
      const nk = nickname(n);
      if (nk && !seen.has(`n${nk}`)) {
        seen.add(`n${nk}`);
        VehicleNames.put(this.nick, nk, { value, side, rank: 1 });
      }
    }
  }

  /** The vehicle one of `names` stands for, the strongest tier first, of the same side; `tiers` limits the search. */
  find(names: readonly (string | undefined | null)[], side = '', tiers: readonly NameTier[] = ['same', 'family', 'nickname']): { value: T; tier: NameTier } | null {
    const list = names.filter((n): n is string => typeof n === 'string' && n.trim() !== '');
    const ok = (s: string) => !side || !s || s === side;
    const first = (filed: Filed<T>[] | undefined) => filed?.find((f) => ok(f.side) && f.rank === 0) ?? filed?.find((f) => ok(f.side));
    if (tiers.includes('same')) {
      for (const n of list) {
        for (const k of strongKeys(n)) {
          const hit = first(this.strong.get(k));
          if (hit) return { value: hit.value, tier: 'same' };
        }
      }
    }
    if (tiers.includes('family')) {
      for (const n of list) {
        const k = familyKey(n);
        const f = family(k);
        if (!f || WIDE_FAMILY.has(f) || /[a-z]{5,}/.test(k.slice(f.length))) continue;
        // Longest shared start; then a parent ("f4e" for "f4e45mc"); then the nearest next character (2A6 for a
        // 2A7 rather than 2A4); then the shortest.
        let best: { score: number[]; value: T } | null = null;
        for (const c of this.fam.get(f) ?? []) {
          if (!ok(c.side)) continue;
          let p = 0;
          while (p < k.length && p < c.key.length && k[p] === c.key[p]) p++;
          const near = p < k.length && p < c.key.length ? -Math.abs(k.charCodeAt(p) - c.key.charCodeAt(p)) : 0;
          const score = [p, k.startsWith(c.key) ? 1 : 0, near, -c.key.length];
          if (!best || ahead(score, best.score)) best = { score, value: c.value };
        }
        if (best) return { value: best.value, tier: 'family' };
      }
    }
    if (tiers.includes('nickname')) {
      for (const n of list) {
        for (const k of [nickname(n), ...strongKeys(n)]) {
          const hit = k ? first(this.nick.get(k)) : undefined;
          if (hit) return { value: hit.value, tier: 'nickname' };
        }
      }
    }
    return null;
  }
}
