/**
 * A row found again in the data the match replay plays: from the heatmap's
 * figure overlay (its own rows, each match's clock from the match's start)
 * back to the recording's row, by the person, the match, the time and the
 * place. And how close the camera follows the unit it is about.
 */

import type { Dataset } from '../../state/types';
import { isOverlay, overlayGroups } from '../../match/overlay';

/** What a row is, apart from its index: what finds it again in the data the replay plays. */
export interface RowKey {
  /** The person's label in the data the row is in, the time and the place. */
  person: string;
  time: number;
  x: number;
  z: number;
  /** In a figure overlay, the group (match) the row came from; '' otherwise. */
  group: string;
}

/** A row of `d` described, to be found in the data the match replay plays (`rowIn`). */
export function keyOfRow(d: Dataset, row: number): RowKey {
  const p = d.personId ? d.personId[row] : -1;
  let person = p >= 0 ? (d.personLabels[p] ?? '') : '';
  let group = '';
  // An overlay names its things "<person> · <match>" and counts each match's time from the match's start.
  const at = isOverlay(d) ? person.lastIndexOf(' · ') : -1;
  if (at >= 0) {
    group = person.slice(at + 3);
    person = person.slice(0, at);
  }
  return { person, time: d.time ? d.time[row] : 0, x: d.px[row], z: d.pz[row], group };
}

/**
 * The row of `d` a key names: its person's row nearest the key's time (on
 * the overlay's clock, the match's start added), the nearest place among
 * rows as near in time; -1 when the person is not in `d`.
 */
export function rowIn(d: Dataset, k: RowKey): number {
  if (!d.time || !d.personId) return -1;
  let time = k.time;
  let session = -1;
  if (k.group) {
    const g = overlayGroups(d)?.groups.find((x) => x.id === k.group);
    if (!g) return -1;
    time += g.start;
    if (d.sessionId && d.sessionLabels.length > 1) session = g.index;
  }
  const people = new Set<number>();
  d.personLabels.forEach((l, i) => {
    if (l === k.person) people.add(i);
  });
  if (!people.size) return -1;
  let best = -1;
  let bestDt = Infinity;
  let bestD = Infinity;
  for (let r = 0; r < d.count; r++) {
    if (!people.has(d.personId[r])) continue;
    if (session >= 0 && d.sessionId![r] !== session) continue;
    const dt = Math.abs(d.time[r] - time);
    if (dt > bestDt + 1e-6) continue;
    const dd = Math.hypot(d.px[r] - k.x, d.pz[r] - k.z);
    if (dt < bestDt - 1e-6 || dd < bestD) {
      best = r;
      bestDt = dt;
      bestD = dd;
    }
  }
  return best;
}

/** How close the camera follows the row's unit, metres: by its `kind` - a tank a few lengths, an aircraft and a ship further out. */
export function followMetres(d: Dataset, row: number): number {
  const kind = d.attrs.find((a) => a.kind === 'category' && /^kind$/i.test(a.name.trim()));
  const word = kind?.categories ? (kind.categories[(kind.data as Uint32Array)[row]] ?? '') : '';
  if (/aircraft|plane|jet|fighter|bomber|heli|drone|uav|^air$/i.test(word)) return 60;
  if (/ship|boat|destroyer|cruiser|frigate|submarine|naval|^sea$/i.test(word)) return 120;
  return 18;
}
