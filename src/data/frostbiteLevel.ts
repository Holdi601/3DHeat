import { create } from 'zustand';
import { parquetMetadataAsync, parquetReadObjects } from 'hyparquet';
import { asyncBufferFromFile } from './parquet';
import type { StoredLevelMeta } from './levelLibrary';

/**
 * Battlefield 4 and Battlefield 1 levels from the Battlefield maps tool
 * (`heat3d-battlefield-maps level`, github.com/Holdi601/3DHeat-Ext-Battlefield),
 * matched to tables whose `map` column names a level (`MP_Prison`).
 *
 * The viewer only reads the tool's output: a .glb whose part names end in
 * ` @<game>/<level>` (`structure:buildings @battlefield-4/MP_Prison`). Such a
 * model goes to the level library when it is loaded, and a table on that map
 * is offered it, and given it by itself when no level is loaded.
 */

export interface FrostbiteLevelId {
  /** `battlefield-4`, `battlefield-1`. */
  game: string;
  map: string;
}

const PART = /\s@(battlefield-[0-9a-z]+)\/([A-Za-z0-9_\-]+)\s*$/;
const KEY = 'frostbite:';

/** The Battlefield level a loaded model is, from its part names; null for any other model. */
export function frostbiteLevelOf(partNames: readonly string[] | undefined): FrostbiteLevelId | null {
  for (const name of partNames ?? []) {
    const m = PART.exec(name);
    if (m) return { game: m[1], map: m[2] };
  }
  return null;
}

/** What the level library notes on a saved Battlefield level (`StoredLevelMeta.game`). */
export function frostbiteGameKey(id: FrostbiteLevelId): string {
  return `${KEY}${id.game}:${id.map}`;
}

export function parseFrostbiteGameKey(game: string | undefined): FrostbiteLevelId | null {
  if (!game?.startsWith(KEY)) return null;
  const rest = game.slice(KEY.length);
  const colon = rest.indexOf(':');
  if (colon < 0) return null;
  return { game: rest.slice(0, colon), map: rest.slice(colon + 1) };
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * The saved levels for a map name. A name two games share (both have an
 * `MP_Naval`) gives both, and then none is picked by itself.
 */
export function frostbiteLevelsFor(levels: readonly StoredLevelMeta[], map: string): StoredLevelMeta[] {
  return levels.filter((l) => {
    const id = parseFrostbiteGameKey(l.game);
    return !!id && norm(id.map) === norm(map);
  });
}

interface FrostbiteMapsState {
  /** The map names of the tables picked last, in the order they came. */
  wanted: string[];
  set: (wanted: string[]) => void;
}

export const useFrostbiteMaps = create<FrostbiteMapsState>((set) => ({
  wanted: [],
  set: (wanted) => set({ wanted }),
}));

/** A level name as a table's `map` column gives it: letters, digits and underscores, starting with a letter. */
const LEVEL_NAME = /^[A-Za-z][A-Za-z0-9_]{2,40}$/;

/** Notes which maps picked Parquet tables are on, from the first row's `map` (or `level`) column. */
export async function noteFrostbiteMaps(files: File[]): Promise<void> {
  const found: string[] = [];
  for (const file of files.filter((f) => /\.parquet$/i.test(f.name)).slice(0, 50)) {
    try {
      const buf = asyncBufferFromFile(file);
      const metadata = await parquetMetadataAsync(buf);
      const names = metadata.schema.map((e) => e.name);
      const column = ['map', 'level', 'mapName'].find((c) => names.includes(c));
      if (!column || Number(metadata.num_rows) === 0) continue;
      const rows = (await parquetReadObjects({ file: buf, metadata, columns: [column], rowStart: 0, rowEnd: 1 })) as Array<Record<string, unknown>>;
      const value = rows[0]?.[column];
      if (typeof value === 'string' && LEVEL_NAME.test(value) && !found.includes(value)) found.push(value);
    } catch {
      // Not a table this can read: nothing to offer for it.
    }
  }
  useFrostbiteMaps.getState().set(found);
}
