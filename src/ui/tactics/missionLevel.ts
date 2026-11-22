/**
 * The level a mission is set on, found in the levels folder and loaded when
 * the mission is opened: a DCS theatre's area that holds most of the
 * mission's units (`dcs/<theatre>/r<n>/`, each area's `.json` says where it
 * lies in the theatre's metres), else the level of the map's name in the
 * game's folder (a War Thunder level, an Arma 3 or Reforger world, an IL-2
 * map). A level that lies in another frame than the game's own metres (an
 * IL-2 map tied to the earth) says so in its `.json`, and the mission is
 * moved onto it (`missions/placement.ts`).
 *
 * Without a local server (no levels folder) nothing is found and the
 * mission's summary says which level to load.
 */

import { levelForMap, type CatalogItem } from '../../data/catalogIndex';
import { catalogFile, catalogItems, loadCatalogLevel } from '../panels/autoLevel';
import { useStore } from '../../state/store';
import { placementFromLevelInfo, type MissionPlacement } from '../../tactics/missions/placement';
import { theatreOf } from '../../tactics/missions/dcsWrite';
import type { MissionState } from '../../tactics/missions';

/** The levels folder's game folder for each mission format. */
export const LEVEL_FOLDER: Record<string, string> = {
  'dcs-miz': 'dcs',
  'wt-blk': 'warthunder',
  'arma-sqm': 'arma3',
  'il2-mission': 'il2',
  'reforger-layer': 'arma-reforger',
};

export interface MissionLevel {
  item: CatalogItem;
  /** How the mission is to be moved onto it; null when it lies in the game's own metres. */
  placement: MissionPlacement | null;
}

/** A map's level name: the mission's map without its game (`Arma 3: Altis` -> `Altis`). */
export const levelNameOf = (map: string) => map.replace(/^[^:]*:\s*/, '').trim();

async function jsonBeside(item: CatalogItem): Promise<unknown> {
  const f = await catalogFile(item.path.replace(/\.(glb|gltf)$/i, '.json'));
  if (!f) return null;
  try {
    return JSON.parse(await f.text());
  } catch {
    return null;
  }
}

/** The DCS area of the mission's theatre that holds most of its units. */
async function dcsArea(items: CatalogItem[], m: MissionState): Promise<CatalogItem | null> {
  const theatre = theatreOf(m.map).toLowerCase();
  if (!theatre) return null;
  const areas = items.filter((it) => it.kind === 'level' && it.game === 'dcs' && it.path.toLowerCase().startsWith(`dcs/${theatre}/`));
  const points = m.groups.flatMap((g) => g.units.map((u) => u.at));
  let best: { item: CatalogItem; n: number } | null = null;
  for (const item of areas) {
    const info = (await jsonBeside(item)) as { bounds?: { x?: number[]; z?: number[] } } | null;
    const bx = info?.bounds?.x;
    const bz = info?.bounds?.z;
    if (!bx || !bz) continue;
    const n = points.filter((p) => p.x >= bx[0] && p.x <= bx[1] && p.z >= bz[0] && p.z <= bz[1]).length;
    if (n && (!best || n > best.n)) best = { item, n };
  }
  return best?.item ?? null;
}

/** The level of the levels folder a mission is set on, or null. */
export async function findMissionLevel(m: MissionState): Promise<MissionLevel | null> {
  const folder = LEVEL_FOLDER[m.format];
  if (!folder || !m.map) return null;
  const items = await catalogItems();
  if (!items.length) return null;
  if (m.format === 'dcs-miz') {
    const item = await dcsArea(items, m);
    return item ? { item, placement: null } : null;
  }
  const item = levelForMap(items, levelNameOf(m.map), folder);
  if (!item) return null;
  const placement = m.format.startsWith('il2') ? placementFromLevelInfo(m.format, await jsonBeside(item)) : null;
  return { item, placement };
}

/** Loads the mission's level, in place of the one loaded unless that is it already. */
export async function loadMissionLevel(lv: MissionLevel): Promise<void> {
  const file = lv.item.path.split('/').pop() ?? lv.item.path;
  if (useStore.getState().level?.name === file) return;
  await loadCatalogLevel(lv.item, true);
}
