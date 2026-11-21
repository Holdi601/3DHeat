/**
 * Arma worlds by the name a recording gives them (OCAP's `worldName`, a
 * mission's `worldName`), and the level for each in the levels folder.
 *
 * Arma 3 names a world by its config class (`Altis`, `Enoch` for Livonia,
 * `cup_chernarus_A3`); Arma Reforger by its world file
 * (`worlds/MP/CTI_Campaign_Eden.ent`, sometimes with a `{GUID}` in front),
 * whose terrain folder names the island: `Eden` is Everon, `Cain` Kolguyev.
 *
 * Levels are looked for under the game's folder of the levels catalogue
 * (`arma-reforger/`, `arma3/`), by the world's own name or its display
 * name: `Eden.glb` and `Everon.glb` both serve Everon. A level whose name
 * only begins with the world's (`Arland-4m-preview.glb`) serves when no
 * exact one is there.
 */

import type { CatalogItem } from './catalogIndex';

export type ArmaGame = 'arma3' | 'arma-reforger';

export interface ArmaWorld {
  game: ArmaGame;
  /** The world's own name: Reforger's terrain folder (`Eden`), Arma 3's config class as recorded (`Altis`). */
  id: string;
  /** The name players know it by (`Everon`, `Livonia`). */
  name: string;
  /** Level names that serve it, in order. */
  levels: string[];
}

/** Reforger's islands: a word of the world file, the terrain folder, the display name. */
const REFORGER: [RegExp, string, string][] = [
  [/(^|[^a-z])(eden|everon)([^a-z]|$)/i, 'Eden', 'Everon'],
  [/arland/i, 'Arland', 'Arland'],
  [/(^|[^a-z])(cain|kolguyev)([^a-z]|$)/i, 'Cain', 'Kolguyev'],
];

/** Arma 3 worlds whose config class is not the name players use (lower case). */
const ARMA3_NAMES: Record<string, string> = {
  altis: 'Altis',
  stratis: 'Stratis',
  tanoa: 'Tanoa',
  malden: 'Malden 2035',
  enoch: 'Livonia',
  vr: 'Virtual Reality',
  cup_chernarus_a3: 'Chernarus 2020',
  chernarus: 'Chernarus',
  chernarus_summer: 'Chernarus (summer)',
  chernarus_winter: 'Chernarus (winter)',
  takistan: 'Takistan',
  zargabad: 'Zargabad',
  utes: 'Utes',
  sara: 'Sahrani',
  woodland_acr: 'Bystrica',
  mountains_acr: 'Takistan Mountains',
  provinggrounds_pmc: 'Proving Grounds',
  gm_weferlingen_summer: 'Weferlingen',
  gm_weferlingen_winter: 'Weferlingen (winter)',
  vn_khe_sanh: 'Khe Sanh',
  cam_lao_nam: 'Cam Lao Nam',
  spe_normandy: 'Normandy',
  sefrouramal: 'Sefrou-Ramal',
  lythium: 'Lythium',
  tem_anizay: 'Anizay',
  tem_kujari: 'Kujari',
  ruha: 'Ruha',
  hellanmaa: 'Hellanmaa',
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Whether a recording's world name is a Reforger world file rather than an Arma 3 world class. */
export function isReforgerWorldName(world: string): boolean {
  return /\.ent$/i.test(world.trim()) || /^\{[0-9a-f]{8,}\}/i.test(world.trim());
}

/**
 * A recording's world. `reforger` says the recording came from Reforger (its
 * recorder said so), whatever the name looks like; an unknown Reforger world
 * keeps its world file's name.
 */
export function armaWorldOf(world: string, reforger = isReforgerWorldName(world)): ArmaWorld | null {
  const w = world.trim();
  if (!w) return null;
  if (reforger) {
    const file = w.replace(/^\{[0-9a-f]+\}/i, '').replace(/\\/g, '/');
    const stem = file
      .split('/')
      .pop()!
      .replace(/\.ent$/i, '');
    for (const [re, id, name] of REFORGER) if (re.test(file)) return { game: 'arma-reforger', id, name, levels: [id, name] };
    return { game: 'arma-reforger', id: stem, name: stem, levels: [stem] };
  }
  const name = ARMA3_NAMES[w.toLowerCase()] ?? w;
  return { game: 'arma3', id: w, name, levels: [...new Set([w, name])] };
}

/** The levels catalogue's folder names for a game: what the extractors write (`arma-reforger`, `arma3`). */
const FOLDERS: Record<ArmaGame, RegExp> = {
  'arma-reforger': /^arma[-_ ]?reforger$/i,
  arma3: /^arma[-_ ]?3$/i,
};

/**
 * The level for a world among the catalogue's items: one named as the world
 * (or its display name), else the one level whose name begins with it
 * (the shortest, when several do); null when there is none.
 */
export function armaLevelFor(items: readonly CatalogItem[], world: ArmaWorld): CatalogItem | null {
  const levels = items.filter((it) => it.kind === 'level' && FOLDERS[world.game].test(it.game));
  const keys = world.levels.map(norm).filter(Boolean);
  for (const k of keys) {
    const hit = levels.find((it) => norm(it.name) === k);
    if (hit) return hit;
  }
  const starts = levels
    .filter((it) => keys.some((k) => norm(it.name).startsWith(k)))
    .sort((a, b) => a.name.length - b.name.length || a.path.localeCompare(b.path));
  return starts[0] ?? null;
}

/**
 * The worlds of a loaded dataset's Arma recordings, from the labels of its
 * `World` and `Game` columns (`ocap.ts`): a world file is Reforger's, any
 * other name Arma 3's unless every recording is Reforger's.
 */
export function armaWorldsOfLabels(worlds: readonly string[], games: readonly string[]): ArmaWorld[] {
  const arma = games.filter((g) => /^arma/i.test(g.trim()));
  if (!arma.length) return [];
  const onlyReforger = arma.every((g) => /reforger/i.test(g));
  const out: ArmaWorld[] = [];
  for (const w of worlds) {
    const a = armaWorldOf(w, isReforgerWorldName(w) || onlyReforger);
    if (a && !out.some((o) => o.game === a.game && o.id === a.id)) out.push(a);
  }
  return out;
}
