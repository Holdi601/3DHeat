import { containerOf, isContainer } from './container';
import { detectFormat } from './sourcePreview';
import type { PickedFile } from './filePick';

/**
 * What a pick is, as far as its files say before anything is read: the game
 * and the map their containers name, and how many matches it holds. Shown on
 * the load card, and what picks the level (`autoLevel.ts`).
 */
export interface PickIdentity {
  /** The game's id as the files name it (`warthunder`, `cs2`); null when they do not. */
  gameId: string | null;
  /** The game by its own name, for showing; null when not known. */
  game: string | null;
  /** The map every match is on; null when they do not say, or name more than one. */
  map: string | null;
  /** Matches: one a container, else one a table. */
  matches: number;
}

/** Games by the id their files give them, under their own names (not translated: they are names). */
const GAME_NAMES: Record<string, string> = {
  warthunder: 'War Thunder',
  'war-thunder': 'War Thunder',
  cs2: 'Counter-Strike 2',
  dcs: 'DCS World',
  dota: 'Dota 2',
  r6: 'Rainbow Six Siege',
  wows: 'World of Warships',
  wot: 'World of Tanks',
  ghpc: 'Gunner, HEAT, PC!',
  il2: 'IL-2 Sturmovik',
  'battlefield-1': 'Battlefield 1',
  'battlefield-4': 'Battlefield 4',
  'battlefield-6': 'Battlefield 6',
  'arma-reforger': 'Arma Reforger',
  arma3: 'Arma 3',
  forza: 'Forza',
  acrally: 'Assetto Corsa Rally',
  'assetto-corsa': 'Assetto Corsa',
  beamng: 'BeamNG.drive',
};

/** A game id as a name; the id itself when it is not one listed. */
export function gameName(id: string | null | undefined): string | null {
  if (!id) return null;
  return GAME_NAMES[id.toLowerCase()] ?? id;
}

/**
 * The pick's identity from the containers already opened (`expandContainers`):
 * `chosen` as picked, `tables` what they were opened into. A Tacview recording
 * is DCS's or another flight game's; which theatre is worked out from where it
 * flies once it is loaded (`world/theatres.ts`).
 */
export function pickIdentity(chosen: readonly PickedFile[], tables: readonly PickedFile[]): PickIdentity {
  const containers = chosen.filter((f) => isContainer(f.file.name)).length;
  const games = new Set<string>();
  const maps = new Set<string>();
  for (const t of tables) {
    const m = containerOf(t.file)?.manifest;
    if (!m) continue;
    if (m.game) games.add(String(m.game));
    if (m.map) maps.add(String(m.map));
  }
  const gameId = games.size === 1 ? [...games][0] : null;
  const acmi = !gameId && tables.length > 0 && tables.every((t) => detectFormat(t.file.name) === 'acmi');
  return {
    gameId: gameId ?? (acmi ? 'tacview' : null),
    game: gameId ? gameName(gameId) : acmi ? 'Tacview' : null,
    map: maps.size === 1 ? [...maps][0] : null,
    matches: containers || tables.length,
  };
}
