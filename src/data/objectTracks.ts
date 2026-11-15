/**
 * Things a person sends out, as tracks of their own. A table can log a
 * player's drones and placed gadgets under the player's own name, told apart
 * only by a `pawn` column (operator, drone, gadget) and the object's id
 * (`entity`) - the Rainbow Six Siege reader does. Read as one track, the
 * player would jump between their body and their drone every tick, and a
 * gadget's few rows would pull them across the level.
 *
 * So at load each such object gets a track of its own, named after its
 * owner, what it is and which of the owner's it is: "Ash · drone 2". The
 * player keeps the rows of their body.
 */

import type { Dictionary } from './growable';

/** Pawns that are something a player sent out or put down, not the player (as `figures/tactical.ts` has it). */
const OBJECT = /^(drone|gadget)$/i;

/**
 * Moves the rows of every object (`pawn` drone or gadget) onto a track of its
 * own: `personIds` is rewritten in place, new names interned into `persons`.
 * Objects are numbered per owner and kind in the order they first appear.
 * Returns how many tracks were made.
 */
export function splitObjectTracks(personIds: Uint32Array, persons: Dictionary, pawnIds: Uint32Array, pawnLabels: readonly string[], entity: Float64Array): number {
  const isObject = pawnLabels.map((l) => OBJECT.test(l.trim()));
  if (!isObject.some(Boolean)) return 0;
  const kind = pawnLabels.map((l) => l.trim().toLowerCase());
  // Owner and kind -> objects seen, and each object's track.
  const counts = new Map<string, number>();
  const tracks = new Map<string, number>();
  const n = personIds.length;
  for (let r = 0; r < n; r++) {
    const pw = pawnIds[r];
    if (!isObject[pw]) continue;
    const e = entity[r];
    if (!Number.isFinite(e)) continue;
    const owner = personIds[r];
    const key = `${owner}\u0001${pw}\u0001${e}`;
    let id = tracks.get(key);
    if (id === undefined) {
      const ok = `${owner}\u0001${pw}`;
      const k = (counts.get(ok) ?? 0) + 1;
      counts.set(ok, k);
      const name = persons.labels[owner] ?? '';
      id = persons.intern(`${name ? `${name} · ` : ''}${kind[pw]} ${k}`);
      tracks.set(key, id);
    }
    personIds[r] = id;
  }
  return tracks.size;
}
