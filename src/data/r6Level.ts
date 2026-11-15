import { create } from 'zustand';
import { isContainer, openContainer } from './container';
import type { StoredLevelMeta } from './levelLibrary';

/**
 * Rainbow Six Siege levels from the separate R6 tool (`heat3d-r6-replay map`,
 * github.com/Holdi601/3DHeat-Ext-R6), matched to R6 replay tables.
 *
 * The viewer only reads the tool's output: a .glb whose parts are named
 * `ground:r6 <Map> @<world id>` and `structure:r6 <Map> @<world id>` (breakable
 * objects add ` breakable <entity>`, the ground plates ` plate`). The world id
 * is the replays' `worldid`, which changes when a map is reworked, so a level
 * is offered first for replays of the same version of the map and otherwise
 * for the same map name.
 */

export interface R6LevelId {
  map: string;
  /** The world id as text (it is a 64-bit number); null when the level or the match does not say. */
  world: string | null;
}

const PART = /^(?:ground|structure)\s*:\s*r6 (.+?)(?: @(\d+))?(?: breakable [0-9a-f]+| plate)?$/i;
const KEY = 'r6siege:';

/** The R6 map a loaded model is, from its part names; null for any other model. */
export function r6LevelOf(partNames: readonly string[] | undefined): R6LevelId | null {
  for (const name of partNames ?? []) {
    const m = PART.exec(name);
    if (m) return { map: m[1], world: m[2] ?? null };
  }
  return null;
}

/** What the level library notes on a saved R6 level (`StoredLevelMeta.game`). */
export function r6GameKey(id: R6LevelId): string {
  return `${KEY}${id.world ?? ''}:${id.map}`;
}

export function parseR6GameKey(game: string | undefined): R6LevelId | null {
  if (!game?.startsWith(KEY)) return null;
  const rest = game.slice(KEY.length);
  const colon = rest.indexOf(':');
  if (colon < 0) return null;
  return { world: rest.slice(0, colon) || null, map: rest.slice(colon + 1) };
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** The saved level for a match's map: the same world id first, else the same map name. */
export function bestR6Level(levels: readonly StoredLevelMeta[], want: R6LevelId): StoredLevelMeta | null {
  const r6 = levels
    .map((l) => ({ l, id: parseR6GameKey(l.game) }))
    .filter((x): x is { l: StoredLevelMeta; id: R6LevelId } => !!x.id);
  if (want.world) {
    const exact = r6.find((x) => x.id.world === want.world);
    if (exact) return exact.l;
  }
  return r6.find((x) => norm(x.id.map) === norm(want.map))?.l ?? null;
}

interface R6MapsState {
  /** The maps of the R6 matches loaded last, in the order they came. */
  wanted: R6LevelId[];
  set: (wanted: R6LevelId[]) => void;
}

export const useR6Maps = create<R6MapsState>((set) => ({
  wanted: [],
  set: (wanted) => set({ wanted }),
}));

/** Notes which R6 maps picked `.3dheat` matches are on (their manifest and match document); others are ignored. */
export async function noteR6Maps(files: File[]): Promise<void> {
  const found: R6LevelId[] = [];
  for (const file of files.filter((f) => isContainer(f.name)).slice(0, 50)) {
    try {
      const c = await openContainer(file);
      if (c.manifest.game !== 'r6siege' || !c.manifest.map) continue;
      const doc = (await c.json('match').catch(() => null)) as {
        world_id?: unknown;
      } | null;
      const world =
        doc && (typeof doc.world_id === 'string' || typeof doc.world_id === 'number') ? String(doc.world_id) : null;
      if (!found.some((f) => f.map === c.manifest.map && f.world === world)) found.push({ map: c.manifest.map, world });
    } catch {
      // Not a container this can read: nothing to offer for it.
    }
  }
  useR6Maps.getState().set(found);
}
