/**
 * The matches in the loaded replay data, whatever the game: the values of a
 * `match` column (CS2, War Thunder), else of the column a load of several
 * files adds (`Source file`), else its sessions (a Tacview recording each),
 * else the whole of it as one match. And picking some of them: through the
 * filters for a column (several at once), through the played session for
 * sessions (one, or all).
 */

import { SOURCE_COLUMN } from '../data/builder';
import { useStore } from '../state/store';
import type { Bounds, Dataset, FilterSpec } from '../state/types';

export interface MatchEntry {
  /** The column's category index, or the session index; 0 for the whole. */
  index: number;
  id: string;
  start: number;
  end: number;
  rows: number;
  /** Where its rows are, world units: what the camera frames when it is picked. */
  bounds: Bounds;
}

export interface MatchSet {
  via: 'column' | 'session' | 'whole';
  /** The column, for `column`. */
  column?: string;
  entries: MatchEntry[];
}

const cache = new WeakMap<Dataset, MatchSet>();

/** The column that says which match a row is of, if the data has one. */
export function matchColumn(d: Dataset): string | null {
  // The session column is the match (War Thunder's tables): the sessions are the matches.
  if (sessionsAreMatches(d)) return null;
  for (const name of ['match', 'Match', 'matchId', 'match_id', SOURCE_COLUMN]) {
    const a = d.attrs.find((x) => x.name === name && x.kind === 'category');
    if (a?.categories && a.categories.length > 0) return a.name;
  }
  return null;
}

/** Whether the data's sessions are named by a match column. */
function sessionsAreMatches(d: Dataset): boolean {
  return !!d.sessionId && d.sessionLabels.length > 0 && /^match(_?id)?$/i.test(d.roleColumns?.session?.trim() ?? '') && !d.attrs.some((a) => /^match(_?id)?$/i.test(a.name) && a.kind === 'category');
}

export function matchesOf(d: Dataset): MatchSet {
  const hit = cache.get(d);
  if (hit) return hit;
  let out: MatchSet;
  const column = matchColumn(d);
  if (column) {
    const a = d.attrs.find((x) => x.name === column)!;
    out = { via: 'column', column, entries: groups(d, a.data as Uint32Array, a.categories!).filter((e) => e.id !== '') };
  } else if (d.sessionId && (d.sessionLabels.length > 1 || sessionsAreMatches(d))) {
    out = { via: 'session', entries: groups(d, d.sessionId, d.sessionLabels) };
  } else {
    out = { via: 'whole', entries: [{ index: 0, id: d.sessionLabels[0] ?? d.name, start: d.timeRange[0], end: d.timeRange[1], rows: d.count, bounds: d.bounds }] };
  }
  cache.set(d, out);
  return out;
}

/** Each group's time span, rows and extent, in one pass; the empty ones left out. */
function groups(d: Dataset, ids: Uint32Array, labels: string[]): MatchEntry[] {
  const n = labels.length;
  const start = new Float64Array(n).fill(Infinity);
  const end = new Float64Array(n).fill(-Infinity);
  const rows = new Uint32Array(n);
  const b = new Float64Array(n * 6);
  for (let c = 0; c < n; c++) b.set([Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity], c * 6);
  for (let i = 0; i < d.count; i++) {
    const c = ids[i];
    rows[c]++;
    const t = d.time ? d.time[i] : 0;
    if (t < start[c]) start[c] = t;
    if (t > end[c]) end[c] = t;
    const o = c * 6;
    const x = d.px[i];
    const y = d.py[i];
    const z = d.pz[i];
    if (x < b[o]) b[o] = x;
    if (y < b[o + 1]) b[o + 1] = y;
    if (z < b[o + 2]) b[o + 2] = z;
    if (x > b[o + 3]) b[o + 3] = x;
    if (y > b[o + 4]) b[o + 4] = y;
    if (z > b[o + 5]) b[o + 5] = z;
  }
  return labels
    .map((id, index) => {
      const o = index * 6;
      return { index, id, start: start[index], end: end[index], rows: rows[index], bounds: { minX: b[o], minY: b[o + 1], minZ: b[o + 2], maxX: b[o + 3], maxY: b[o + 4], maxZ: b[o + 5] } };
    })
    .filter((e) => e.rows > 0);
}

/** The matches picked now: indices, or null for all of them. */
export function pickedMatches(set: MatchSet, filters: FilterSpec[], session: number): number[] | null {
  if (set.via === 'column') {
    const f = filters.find((x) => x.kind === 'categories' && x.column === set.column);
    return f && f.kind === 'categories' ? f.allowed : null;
  }
  if (set.via === 'session') return session >= 0 ? [session] : null;
  return null;
}

/** Whether each match is also a session of the data, so the replay can play one alone. */
export function matchesAreSessions(d: Dataset, set: MatchSet = matchesOf(d)): boolean {
  if (set.via === 'session') return true;
  if (set.via !== 'column' || !d.sessionId) return false;
  const role = d.roleColumns?.session;
  return !!role && role.trim().toLowerCase() === set.column!.trim().toLowerCase();
}

/**
 * Play `picked` (indices; null for every match): filter to them, or play the
 * session, and put the playhead at the start of the first. The figure replay
 * plays one session or all of them, so several picked matches are filtered
 * for the heat and all played back.
 */
export function pickMatches(d: Dataset, picked: number[] | null): Bounds | null {
  const set = matchesOf(d);
  const s = useStore.getState();
  const chosen = picked === null ? set.entries : set.entries.filter((e) => picked.includes(e.index));
  if (set.via === 'column') {
    const rest = s.filters.filter((f) => !(f.kind === 'categories' && f.column === set.column));
    s.setFilters(picked === null || chosen.length === set.entries.length ? rest : [...rest, { kind: 'categories', column: set.column!, allowed: chosen.map((e) => e.index) }]);
    const one = chosen.length === 1 && picked !== null ? chosen[0] : null;
    // Its rounds (CS2's sessions are "<match> #NN"): the first, as the replay plays one round at a time.
    const round = one ? d.sessionLabels.findIndex((l) => l.startsWith(`${one.id} #`)) : -1;
    if (one && matchesAreSessions(d, set)) s.patchTeam({ session: d.sessionLabels.indexOf(one.id) });
    else if (round >= 0) s.patchTeam({ session: round });
    // A round of another match must not stay the one played.
    else if (s.team.session >= 0) s.patchTeam({ session: -1 });
  } else if (set.via === 'session') {
    s.patchTeam({ session: picked === null || chosen.length !== 1 ? -1 : chosen[0].index });
  }
  const session = useStore.getState().team.session;
  const start = session >= 0 && d.sessionStart ? d.sessionStart[session] : Math.min(...chosen.map((e) => e.start));
  if (Number.isFinite(start)) s.seek(start);
  // Where they are, for the camera.
  const b = chosen.reduce<Bounds | null>(
    (acc, e) =>
      acc
        ? { minX: Math.min(acc.minX, e.bounds.minX), minY: Math.min(acc.minY, e.bounds.minY), minZ: Math.min(acc.minZ, e.bounds.minZ), maxX: Math.max(acc.maxX, e.bounds.maxX), maxY: Math.max(acc.maxY, e.bounds.maxY), maxZ: Math.max(acc.maxZ, e.bounds.maxZ) }
        : e.bounds,
    null,
  );
  return b && Number.isFinite(b.minX) ? b : null;
}
