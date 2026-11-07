/**
 * Valorant's maps for the tactics board: the minimap images and their
 * calibration from valorant-api.com (a free community API; no key), fetched
 * when a map is chosen and never shipped. Riot's maps sit in AES-encrypted
 * game files that their terms keep us out of; a minimap is enough to plan on.
 *
 * Calibration (checked against every callout of the thirteen maps that have
 * them; note the swapped axes): a game position (x, y) in centimetres lands on
 * the minimap at
 *   u = y * xMultiplier + xScalarToAdd
 *   v = x * yMultiplier + yScalarToAdd
 * with u, v fractions of the image's width and height. The board's world is
 * metres: world X = game y / 100, world Z = game x / 100, so the image lies
 * flat the right way up and a metre on the board is a metre in the game.
 *
 * Riot's "Legal Jibber Jabber" policy allows this for a free, non-commercial
 * project and asks for its notice whenever their assets are shown
 * (`RIOT_NOTICE`).
 */

import type { ImageLevel, MapAnchor } from '../render/level';

export const RIOT_NOTICE =
  '3DHeat was created under Riot Games\' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.';

const API = 'https://valorant-api.com/v1/maps';

export interface ValorantMap {
  uuid: string;
  name: string;
  image: string;
  xMultiplier: number;
  yMultiplier: number;
  xScalarToAdd: number;
  yScalarToAdd: number;
}

/** The maps that have a minimap and a calibration, by name. */
export async function fetchValorantMaps(fetcher: typeof fetch = fetch): Promise<ValorantMap[]> {
  const res = await fetcher(API);
  if (!res.ok) throw new Error(`valorant-api.com answered ${res.status}`);
  const body = (await res.json()) as { data?: Record<string, unknown>[] };
  const out: ValorantMap[] = [];
  for (const m of body.data ?? []) {
    const num = (k: string) => (typeof m[k] === 'number' ? (m[k] as number) : NaN);
    const image = typeof m.displayIcon === 'string' ? m.displayIcon : '';
    const map: ValorantMap = {
      uuid: String(m.uuid ?? ''),
      name: String(m.displayName ?? ''),
      image,
      xMultiplier: num('xMultiplier'),
      yMultiplier: num('yMultiplier'),
      xScalarToAdd: num('xScalarToAdd'),
      yScalarToAdd: num('yScalarToAdd'),
    };
    if (image && map.xMultiplier && map.yMultiplier && Number.isFinite(map.xScalarToAdd) && Number.isFinite(map.yScalarToAdd)) out.push(map);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** World X and Z (metres) of a point at fractions (u, v) of the minimap. */
export function minimapToWorld(m: ValorantMap, u: number, v: number): { x: number; z: number } {
  const gameY = (u - m.xScalarToAdd) / m.xMultiplier;
  const gameX = (v - m.yScalarToAdd) / m.yMultiplier;
  return { x: gameY / 100, z: gameX / 100 };
}

/** The two anchors that place a minimap of `width` x `height` pixels in the board's world. */
export function minimapAnchors(m: ValorantMap, width: number, height: number): [MapAnchor, MapAnchor] {
  const a = minimapToWorld(m, 0, 0);
  const b = minimapToWorld(m, 1, 1);
  return [
    { px: 0, py: 0, worldX: a.x, worldZ: a.z },
    { px: width, py: height, worldX: b.x, worldZ: b.z },
  ];
}

/** A map's minimap as a level for the board. */
export async function valorantLevel(m: ValorantMap, fetcher: typeof fetch = fetch): Promise<ImageLevel> {
  const res = await fetcher(m.image);
  if (!res.ok) throw new Error(`the minimap answered ${res.status}`);
  const bitmap = await createImageBitmap(await res.blob());
  return {
    kind: 'image',
    name: `Valorant: ${m.name}`,
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
    anchors: minimapAnchors(m, bitmap.width, bitmap.height),
    elevation: 0,
    opacity: 1,
    desaturate: 0.2,
    brightness: 1,
    flipZ: false,
  };
}
