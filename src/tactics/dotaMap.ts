/**
 * Dota 2's map as a level for the heatmap: OpenDota's drawing of the current
 * map (opendota.com, whose site code is MIT), fetched when asked for and never
 * shipped. Dota's own minimap sits in the game's VPK archives; with Dota 2
 * installed, a 3D map can come out of them the way 3DHeat CS2's `map` takes
 * CS2's; this image is for everyone else.
 *
 * Calibration: OpenDota draws its map over the 128-unit cells 64 to 191 of
 * Source 2's grid, north up (its `gameCoordToUV`). A cell starts 16384 units
 * below the world origin, so the image spans world -8192 to 8064 on both axes:
 *   u = (x + 8192) / 16256,  v = (8064 - y) / 16256
 * with u, v fractions of the image's width and height. Checked against a
 * public match's replay (patch 7.40): its 36 towers, barracks and ancients and
 * every hero's track land on the drawn bases and lanes.
 *
 * The tables the Watcher writes from Dota 2 replays are Z up with Y flipped
 * (their `heat3d` hints), so the viewer's world X is Dota's x and its Z is
 * Dota's -y: north is towards -Z. The image quad takes only its rectangle from
 * the anchors; `flipZ` is what turns the image's top row to that edge. Checked
 * in the viewer: heat and drawing agree lane for lane, and the Top view shows
 * north at the bottom of the screen, as it shows any such table.
 */

import type { ImageLevel, MapAnchor } from '../render/level';

const ASSETS = 'https://www.opendota.com/assets/images/dota2/map/';
/** OpenDota's list of its map drawings, newest patch first. */
const LIST = 'https://raw.githubusercontent.com/odota/web/master/src/components/DotaMap/DotaMap.tsx';
/** The newest drawing when this was written, for when the list cannot be read. */
export const FALLBACK = 'detailed_740.webp';

/** World units at the image's left/bottom edge and its right/top edge. */
export const DOTA_MIN = -8192;
export const DOTA_MAX = 8064;

/** Fractions (u right, v down) of the image at Dota world position (x, y). */
export function dotaToMinimap(x: number, y: number): { u: number; v: number } {
  const span = DOTA_MAX - DOTA_MIN;
  return { u: (x - DOTA_MIN) / span, v: (DOTA_MAX - y) / span };
}

/** The two anchors that place the drawing, `width` x `height` pixels, under a Dota replay's table. */
export function dotaAnchors(width: number, height: number): [MapAnchor, MapAnchor] {
  return [
    { px: 0, py: 0, worldX: DOTA_MIN, worldZ: -DOTA_MAX },
    { px: width, py: height, worldX: DOTA_MAX, worldZ: -DOTA_MIN },
  ];
}

/** The file name of OpenDota's newest map drawing, from its own list; the fallback if that cannot be read. */
export async function newestDotaMap(fetcher: typeof fetch = fetch): Promise<string> {
  try {
    const res = await fetcher(LIST);
    if (!res.ok) return FALLBACK;
    const m = /detailed_(\d+)\.webp/.exec(await res.text());
    return m ? `detailed_${m[1]}.webp` : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

/** `detailed_740.webp` as the patch it shows: 7.40. */
export function patchOf(file: string): string {
  const m = /detailed_(\d)(\d+)\./.exec(file);
  return m ? `${m[1]}.${m[2]}` : '';
}

/** The map drawing as a level. */
export async function dotaLevel(fetcher: typeof fetch = fetch): Promise<ImageLevel> {
  const file = await newestDotaMap(fetcher);
  const res = await fetcher(ASSETS + file);
  if (!res.ok) throw new Error(`opendota.com answered ${res.status}`);
  const bitmap = await createImageBitmap(await res.blob());
  return {
    kind: 'image',
    name: `Dota 2 ${patchOf(file)} (OpenDota)`.replace('  ', ' '),
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
    anchors: dotaAnchors(bitmap.width, bitmap.height),
    elevation: 0,
    opacity: 1,
    desaturate: 0.5,
    brightness: 0.8,
    // The anchors give only the rectangle; this puts the image's top row (north) at its low Z edge.
    flipZ: true,
  };
}
