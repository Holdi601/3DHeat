/**
 * Where the victim and the shooter of each hit were when it struck, in the
 * dataset's world (the space of `Dataset.px/py/pz`, y up): what the hit
 * analysis' area filter tests against the volumes drawn on the level, and
 * what gives a hit its distance where the data does not say.
 *
 * The row a hit came from holds one party's place (`VehicleHit.side`); the
 * other's is its own track's sample nearest in time - by the track the data
 * ties to the hit, else by the name the hit gives it (a player's name, a
 * unit's label). Worked out once per hit set, when first asked.
 */

import type { Dataset } from '../state/types';
import type { Vec3 } from '../race/geometry';
import { drain, type HitSet, type VehicleHit } from './hits';
import { personRowsSteps } from '../data/flight';
import { unitsOf } from '../ui/replay/units';
import { trackName, unitsPerMetre } from '../ui/replay/replayData';

/** Seconds a track's sample may lie from a hit and still say where its unit was. */
export const PLACE_WINDOW = 5;

/**
 * A world point in the frame of the unit at a row (m: x forward, y up, z
 * right), from the row's place and heading (and pitch, where the data has
 * it); null when the row has no heading.
 */
export function localFromWorld(d: Dataset, row: number, x: number, y: number, z: number): Vec3 | null {
  if (!d.yaw || row < 0 || row >= d.count) return null;
  const k = unitsPerMetre(d);
  const dx = (x - d.px[row]) / k, dy = (y - d.py[row]) / k, dz = (z - d.pz[row]) / k;
  if (![dx, dy, dz].every(Number.isFinite)) return null;
  // The renderer's yaw: clockwise from world -z (north), so forward is (sin, 0, -cos) and right (cos, 0, sin).
  const yaw = d.yaw[row];
  const pitch = d.pitch && Number.isFinite(d.pitch[row]) ? d.pitch[row] : 0;
  if (!Number.isFinite(yaw)) return null;
  const sy = Math.sin(yaw), cy = Math.cos(yaw), sp = Math.sin(pitch), cp = Math.cos(pitch);
  const fwd: Vec3 = [sy * cp, sp, -cy * cp];
  const right: Vec3 = [cy, 0, sy];
  const up: Vec3 = [-sy * sp, cp, cy * sp];
  const dot = (a: Vec3) => a[0] * dx + a[1] * dy + a[2] * dz;
  return [dot(fwd), dot(up), dot(right)];
}

export interface HitPlaces {
  /** Per hit (by `VehicleHit.id`): the victim's x, y, z, then the shooter's; NaN where not known. */
  xyz: Float32Array;
  /** Per hit: the victim's row there, then the shooter's; -1 where not known. */
  rows: Int32Array;
  /** Hits whose victim's place is known, and whose shooter's. */
  victims: number;
  shooters: number;
}

const cache = new WeakMap<HitSet, HitPlaces>();

/** The places of a hit set's hits, once. */
export function placesOf(d: Dataset, set: HitSet): HitPlaces {
  return drain(placesSteps(d, set));
}

/** `placesOf` in steps (`findPlacesSteps`), worked out once whichever way it is asked for. */
export function* placesSteps(d: Dataset, set: HitSet): Generator<void, HitPlaces, void> {
  let p = cache.get(set);
  if (!p) {
    p = yield* findPlacesSteps(d, set.hits);
    cache.set(set, p);
  }
  return p;
}

/** A hit's victim's or shooter's place, or null. */
export function placeOf(p: HitPlaces, h: VehicleHit, who: 'victim' | 'shooter'): Vec3 | null {
  const o = h.id * 6 + (who === 'victim' ? 0 : 3);
  const x = p.xyz[o];
  return Number.isFinite(x) ? [x, p.xyz[o + 1], p.xyz[o + 2]] : null;
}

export function findPlaces(d: Dataset, hits: VehicleHit[]): HitPlaces {
  return drain(findPlacesSteps(d, hits));
}

/** `findPlaces` in steps: it yields every 256 hits, and once the names are indexed. */
export function* findPlacesSteps(d: Dataset, hits: VehicleHit[]): Generator<void, HitPlaces, void> {
  const n = hits.reduce((m, h) => Math.max(m, h.id + 1), 0);
  const xyz = new Float32Array(n * 6).fill(NaN);
  const at2 = new Int32Array(n * 2).fill(-1);
  const rows = yield* personRowsSteps(d);
  const time = d.time;
  // Tracks by every name they go by: the player, the unit's name, the label, the label without its id.
  let names: Map<string, number[]> | null = null;
  const byName = (name: string): number[] => {
    if (!name) return [];
    if (!names) {
      names = new Map();
      const add = (k: string, p: number) => {
        if (!k) return;
        let l = names!.get(k);
        if (!l) names!.set(k, (l = []));
        if (!l.includes(p)) l.push(p);
      };
      const index = unitsOf(d);
      for (const u of index.units) for (const p of u.persons) {
        add(u.key, p);
        add(u.name, p);
      }
      for (let p = 0; p < d.personLabels.length; p++) {
        add(d.personLabels[p], p);
        add(trackName(d, p, -1), p);
      }
    }
    return names.get(name) ?? [];
  };
  // A track's row nearest `t`, within the window and the hit's round; -1 when none.
  const nearest = (person: number, t: number, session: number): number => {
    if (!rows || !time || person < 0 || person + 1 >= rows.start.length) return -1;
    const a = rows.start[person], b = rows.start[person + 1];
    if (b <= a) return -1;
    let lo = a, hi = b - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (time[rows.rows[mid]] < t) lo = mid + 1;
      else hi = mid;
    }
    let best = -1;
    let bd = PLACE_WINDOW;
    for (const i of [lo - 1, lo, lo + 1]) {
      if (i < a || i >= b) continue;
      const r = rows.rows[i];
      if (session >= 0 && d.sessionId && d.sessionId[r] !== session) continue;
      const dt = Math.abs(time[r] - t);
      if (dt <= bd && Number.isFinite(d.px[r])) {
        bd = dt;
        best = r;
      }
    }
    return best;
  };
  const put = (o: number, r: number) => {
    at2[o / 3] = r;
    xyz[o] = d.px[r];
    xyz[o + 1] = d.py[r];
    xyz[o + 2] = d.pz[r];
  };
  const k = unitsPerMetre(d);
  let victims = 0, shooters = 0;
  let step = 0;
  for (const h of hits) {
    if (++step % 256 === 0) yield;
    if (h.id >= n) continue;
    const o = h.id * 6;
    const session = d.sessionId && h.row >= 0 && h.row < d.count ? d.sessionId[h.row] : -1;
    const own = h.row >= 0 && h.row < d.count && Number.isFinite(d.px[h.row]) ? h.row : -1;
    for (const who of ['victim', 'shooter'] as const) {
      const at = o + (who === 'victim' ? 0 : 3);
      if (h.side === who && own >= 0) {
        put(at, own);
        continue;
      }
      const tied = who === 'victim' ? h.victimPerson : h.shooterPerson;
      const name = who === 'victim' ? h.victim : h.shooter;
      // The row's own track is the row's party's; the other one is never it.
      const ownPerson = own >= 0 && d.personId ? d.personId[own] : -1;
      const tracks = tied >= 0 && !(h.side !== who && tied === ownPerson) ? [tied] : byName(name).filter((p) => p !== ownPerson || h.side === who);
      // Of a name's several tracks (lives, rounds), the one with a sample nearest the hit.
      let best = -1;
      for (const p of tracks) {
        const r = nearest(p, h.time, session);
        if (r >= 0 && (best < 0 || Math.abs(time![r] - h.time) < Math.abs(time![best] - h.time))) best = r;
      }
      if (best >= 0) put(at, best);
    }
    if (Number.isFinite(xyz[o])) victims++;
    if (Number.isFinite(xyz[o + 3])) shooters++;
    if (h.distance === null && Number.isFinite(xyz[o]) && Number.isFinite(xyz[o + 3])) {
      h.distance = Math.hypot(xyz[o] - xyz[o + 3], xyz[o + 1] - xyz[o + 4], xyz[o + 2] - xyz[o + 5]) / k;
    }
  }
  return { xyz, rows: at2, victims, shooters };
}
