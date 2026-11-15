/**
 * The Maneuvers tab of the mass analysis: each match's movement-analysis
 * counts (the summary's `maneuvers`, `insights/maneuver/summary.ts`) added up
 * per kind, map, mode and side over the matches the filter keeps - how often
 * a maneuver is made and how often it pays off, with its Wilson interval -
 * and the matches each row came from, for the drill-down.
 */

import { maneuverTable, type ManeuverRow } from '../insights/maneuver/summary';
import type { MassStore } from './store';

/** Rows at most (the busiest first). */
const MAX_ROWS = 2000;
/** Matches a row keeps for its drill-down. */
const MAX_IDS = 500;

export type MassManeuverRow = ManeuverRow & { matchIds: number[] };

export function maneuverRows(s: MassStore, mask: Uint8Array): { rows: MassManeuverRow[]; matches: number; withSection: number } {
  const list: { map: string | null; mode: string | null; teams: string[]; sec: MassStore['maneuvers'][number] }[] = [];
  const index: number[] = [];
  let withSection = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const sec = s.maneuvers[i] ?? null;
    if (sec) withSection++;
    const t0 = s.m.team0.get(i);
    const nt = s.m.teams.get(i);
    const teams: string[] = [];
    for (let k = 0; k < nt; k++) teams.push(s.str(s.t.name.a[t0 + k]));
    list.push({ map: s.str(s.m.map.get(i)), mode: s.str(s.m.mode.get(i)), teams, sec });
    index.push(i);
  }
  const rows = maneuverTable(list)
    .slice(0, MAX_ROWS)
    .map((r) => ({ ...r, matchIds: r.ids.slice(0, MAX_IDS).map((j) => index[j]), ids: [] }));
  return { rows, matches: list.length, withSection };
}
