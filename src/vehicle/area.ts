/**
 * The hit analysis' side of the volumes drawn on the level (`volumes/`): the
 * one filter the heatmap and the replay use, applied to each hit by where its
 * victim - or its shooter - was when it struck (`places.ts`).
 */

import type { Dataset } from '../state/types';
import { useVolumeStore } from '../volumes/store';
import { containsPoint, volumeFilter, type Volume } from '../volumes/volume';
import type { HitSet, VehicleHit } from './hits';
import { placeOf, placesOf } from './places';

export type AreaParty = 'victim' | 'shooter';

type Keep = (x: number, y: number, z: number) => boolean;
let memo: { volumes: readonly Volume[]; filter: string; keep: Keep | null } | null = null;

/** The volumes' filter as it stands, the same function while neither the volumes nor the filter change; null: no restriction. */
export function areaKeep(): Keep | null {
  const s = useVolumeStore.getState();
  if (!memo || memo.volumes !== s.volumes || memo.filter !== s.filter) memo = { volumes: s.volumes, filter: s.filter, keep: volumeFilter(s.volumes, s.filter) };
  return memo.keep;
}

/** The hits the area keeps: those whose party's place passes; a hit with no known place is left out. */
export function inArea(d: Dataset, set: HitSet, hits: VehicleHit[], keep: Keep, by: AreaParty): VehicleHit[] {
  const places = placesOf(d, set);
  return hits.filter((h) => {
    const p = placeOf(places, h, by);
    return p !== null && keep(p[0], p[1], p[2]);
  });
}

/** Per volume, how many of the hits' parties were in it. */
export function countsByVolume(d: Dataset, set: HitSet, hits: VehicleHit[], volumes: readonly Volume[], by: AreaParty): Map<string, number> {
  const places = placesOf(d, set);
  const out = new Map<string, number>(volumes.map((v) => [v.id, 0]));
  for (const h of hits) {
    const p = placeOf(places, h, by);
    if (!p) continue;
    for (const v of volumes) if (containsPoint(v, p[0], p[1], p[2])) out.set(v.id, out.get(v.id)! + 1);
  }
  return out;
}

/** How many of the hits have no known place for the party. */
export function placeless(d: Dataset, set: HitSet, hits: VehicleHit[], by: AreaParty): number {
  const places = placesOf(d, set);
  let n = 0;
  for (const h of hits) if (!placeOf(places, h, by)) n++;
  return n;
}
