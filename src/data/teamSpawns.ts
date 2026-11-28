/**
 * Which of the data's teams a map's own team numbers stand for, found by
 * where the teams spawn.
 *
 * A level's layout and a battle's objectives number their spawns by the
 * mission's sides (War Thunder's `t1_`, `t2_`), but the game may hand those
 * sides to its teams either way round, match by match (`randomSpawnTeams`),
 * and the side line-up (`teamSides.ts`) numbers the data's teams by their side
 * of the map anyway. So a spawn marker coloured "team 1" by its number shows
 * the other team's colour in every match the sides went the other way: blue
 * vehicles leaving the red spawn.
 *
 * Here each person's first position in a match (where they spawned) votes for
 * the team of the nearest spawn point, and each spawn team goes to the data
 * team most of its votes came from. Points and positions are in the world
 * frame (the data's after its axis mapping).
 */

import type { Dataset } from '../state/types';
import { isUnassignedTeam, personFirstRows, rawTeamLabels, shownTeamIndex } from './teamSides';

/** A spawn point by its own team number, in the world frame (x, z). */
export interface TeamPoint {
  team: number;
  x: number;
  z: number;
}

/** A spawn team needs this many votes, and this share of all its votes from one data team. */
const MIN_VOTES = 3;
const MIN_SHARE = 0.6;

const cache = new WeakMap<Dataset, WeakMap<readonly TeamPoint[], Map<number, Map<number, number> | null>>>();

/**
 * Spawn team number -> the data's team (an index into `teamLabels`) for the
 * people of `session` (every session for null), from where they first appear;
 * null where the votes say nothing clear.
 */
export function teamsBySpawns(d: Dataset, points: readonly TeamPoint[], session: number | null): Map<number, number> | null {
  if (!d.teamId || !d.personId || !points.length) return null;
  let bySet = cache.get(d);
  if (!bySet) cache.set(d, (bySet = new WeakMap()));
  let bySession = bySet.get(points);
  if (!bySession) bySet.set(points, (bySession = new Map()));
  const key = session ?? -1;
  if (bySession.has(key)) return bySession.get(key)!;
  const found = vote(d, points, session);
  bySession.set(key, found);
  return found;
}

function vote(d: Dataset, points: readonly TeamPoint[], session: number | null): Map<number, number> | null {
  const teams = [...new Set(points.map((p) => p.team))].sort((a, b) => a - b);
  const votes = new Map<number, Map<number, number>>();
  const sid = d.sessionId;
  for (const r of personFirstRows(d)) {
    if (session !== null && (sid ? sid[r] : 0) !== session) continue;
    const t = d.teamId![r];
    if (isUnassignedTeam(d.teamLabels[t])) continue;
    const x = d.px[r];
    const z = d.pz[r];
    if (!Number.isFinite(x) || !Number.isFinite(z)) continue;
    let best = -1;
    let bd = Infinity;
    for (const p of points) {
      const dd = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (dd < bd) {
        bd = dd;
        best = p.team;
      }
    }
    if (!votes.has(best)) votes.set(best, new Map());
    const m = votes.get(best)!;
    m.set(t, (m.get(t) ?? 0) + 1);
  }
  const out = new Map<number, number>();
  const taken = new Set<number>();
  for (const e of teams) {
    const m = votes.get(e);
    if (!m) continue;
    let total = 0;
    let top = -1;
    let topN = 0;
    for (const [t, n] of m) {
      total += n;
      if (n > topN) {
        topN = n;
        top = t;
      }
    }
    if (topN < MIN_VOTES || topN < MIN_SHARE * total || taken.has(top)) return null;
    taken.add(top);
    out.set(e, top);
  }
  return out.size ? out : null;
}

const pointCache = new WeakMap<object, TeamPoint[]>();

/** The team spawn points of `list` (each with a team and a world position), the same array for the same list. */
export function teamPointsOf<T>(list: readonly T[], read: (item: T) => TeamPoint | null): TeamPoint[] {
  let pts = pointCache.get(list);
  if (!pts) {
    pts = [];
    for (const it of list) {
      const p = read(it);
      if (p && p.team > 0 && Number.isFinite(p.x) && Number.isFinite(p.z)) pts.push(p);
    }
    pointCache.set(list, pts);
  }
  return pts;
}

/**
 * The data team (index into `teamLabels`) a battle's own team number stands for in `session`: the replay's number
 * as its label (or `ownerLabels`' word for it), moved where the side line-up swapped that match's teams; -1 for none.
 */
export function replayTeamIndex(d: Dataset, team: number, session: number | null, label?: string): number {
  const name = label ?? String(team);
  if (session === null) return d.teamLabels.indexOf(name);
  const raw = rawTeamLabels(d).indexOf(name);
  return raw < 0 ? -1 : shownTeamIndex(d, session, raw);
}

/** The session a battle's match id names (its label, or a label it begins), null for none or several. */
export function sessionOfMatch(d: Dataset, match: string): number | null {
  if (!match) return null;
  let found = -1;
  for (let s = 0; s < d.sessionLabels.length; s++) {
    const l = String(d.sessionLabels[s] ?? '');
    if (l === match) return s;
    if (l.startsWith(match)) {
      if (found >= 0) return null;
      found = s;
    }
  }
  return found >= 0 ? found : null;
}
