/**
 * Team sides: which side of a map each match's teams start on, and the
 * correction that numbers them by it, so team 1 is the same side of a map in
 * every match (on unless the viewer turns it off).
 *
 * Many games number a match's teams without regard to the map: in War
 * Thunder team 1 starts on either side, match by match; a Counter-Strike
 * team (a clan) changes ends at half time; other games' teams are clans or
 * squads that differ from match to match. Laid over each other, such matches
 * mix both sides under one colour. The correction finds where each team's
 * units first appear in a match - or in each round, where the data has
 * rounds, since sides may change between them - (the median of their first
 * positions: their spawn) and, for each map, the line the spawns lie along
 * over all its matches (the main axis of the vectors from one team's spawn
 * to the other's). Along that line, held pointing east (or north where it
 * runs north and south), the team whose spawn lies west (or south) is team
 * `1`, the other team `2`. The team the data gave each row stays in
 * `teamRaw`.
 *
 * Teams that already name their side (CT and T, attack and defence, the red
 * and blue coalitions) are left as they are: their names stand for the side.
 *
 * A map is what a session's name says before its date (`avg_map_AB_Dom_` of
 * `avg_map_AB_Dom_2026-11-20_..._server`), so a map's layouts (its game
 * modes) are lined up separately; without a date, all sessions are one map.
 * Only matches (or rounds) with exactly two teams (groups named 0, none or
 * unknown left aside) are lined up.
 */

import type { AttributeColumn, Dataset } from '../state/types';

/** The column the team the data gave is kept in. */
export const TEAM_RAW = 'teamRaw';

/** The two sides' labels: the west (or south) spawn's team, the other. */
export const SIDE_LABELS = ['1', '2'] as const;

const UNASSIGNED = new Set(['0', '', 'none', 'unknown', 'null', '-1']);
const DATE = /\d{4}[-_.]\d{2}[-_.]\d{2}/;
/** Team names that are a side already: a Counter-Strike side, attack or defence, a coalition. */
const SIDE_NAME = /^(ct|t|counter[- _]?terrorists?|terrorists?|attack(ers?)?|defen[cs]e|defenders?|red|blue)$/i;
/** A round number column (`breakdown/breakdownRun.ts` reads it so too). */
const ROUND_COLUMN = /^(round|round.?num(ber)?|round.?index|round.?no)$/i;

/** The map a session's name stands for: what comes before its date; the whole name without one. */
export function mapKeyOf(session: string): string {
  const m = DATE.exec(session);
  return m ? session.slice(0, m.index) : '';
}

/** Whether a team label stands for no team (0, none, unknown...). */
export function isUnassignedTeam(label: unknown): boolean {
  return UNASSIGNED.has(String(label ?? '').trim().toLowerCase());
}

export interface SideCheck {
  /** Matches with two teams lined up, and of them those whose teams were swapped (in a round at least). */
  sessions: number;
  swapped: number;
  /** Matches left as they are: not two teams, no positions, or teams that name their side. */
  skipped: number;
  /** Rounds lined up one by one (0 where the data has no rounds). */
  rounds: number;
}

interface SegmentSpawns {
  map: string;
  /** The two teams, lower index first, and their spawns (x, z). */
  a: number;
  b: number;
  ca: [number, number];
  cb: [number, number];
}

function median(v: number[]): number {
  const s = [...v].sort((x, y) => x - y);
  return s.length ? s[s.length >> 1] : NaN;
}

/**
 * The parts a match is lined up in: its rounds where the data has a round column and some match has more than one,
 * else the matches themselves. `seg` per row (null: the session is the part), `session` per part.
 */
interface Segments {
  seg: Int32Array | null;
  count: number;
  session: Int32Array;
}

function segmentsOf(d: Dataset): Segments {
  const sessions = Math.max(1, d.sessionLabels.length);
  const whole = { seg: null, count: sessions, session: Int32Array.from({ length: sessions }, (_, i) => i) };
  const col = d.attrs.find((a) => ROUND_COLUMN.test(a.name) && (a.kind === 'category' ? (a.categories?.length ?? 0) < 10_000 : a.max < 10_000));
  if (!col) return whole;
  const sid = d.sessionId;
  const seg = new Int32Array(d.count);
  const ids = new Map<number, number>();
  const sessionOf: number[] = [];
  let lastKey = NaN;
  let last = -1;
  const data = col.data;
  for (let r = 0; r < d.count; r++) {
    const v = data[r];
    const round = Number.isFinite(v) ? Math.round(v) + 1 : 0;
    const s = sid ? sid[r] : 0;
    const key = s * 20_011 + round;
    if (key !== lastKey) {
      lastKey = key;
      let id = ids.get(key);
      if (id === undefined) {
        id = sessionOf.length;
        ids.set(key, id);
        sessionOf.push(s);
      }
      last = id;
    }
    seg[r] = last;
  }
  // No match with two rounds: the matches are the parts.
  if (sessionOf.length <= sessions) return whole;
  return { seg, count: sessionOf.length, session: Int32Array.from(sessionOf) };
}

/** The first row (by time) of each person in each part: where they spawned. */
function firstRowsOf(d: Dataset, parts: Int32Array | null, count: number): Int32Array {
  const pid = d.personId;
  if (!pid) return new Int32Array(0);
  const sid = parts ?? d.sessionId;
  const time = d.time;
  // In a flat array where the pairs are few enough, else a map.
  const persons = Math.max(1, d.personLabels.length);
  const flat = count * persons <= 1 << 24 ? new Int32Array(count * persons).fill(-1) : null;
  const map = flat ? null : new Map<number, number>();
  const later = time && !d.timeSorted ? time : null;
  for (let r = 0; r < d.count; r++) {
    const key = (sid ? sid[r] : 0) * persons + pid[r];
    const was = flat ? flat[key] : (map!.get(key) ?? -1);
    if (was >= 0 && !(later && later[r] < later[was])) continue;
    if (flat) flat[key] = r;
    else map!.set(key, r);
  }
  const rows: number[] = [];
  if (flat) {
    for (let key = 0; key < flat.length; key++) if (flat[key] >= 0) rows.push(flat[key]);
  } else rows.push(...map!.values());
  return Int32Array.from(rows);
}

const firstRowsCache = new WeakMap<object, { px: Float32Array; count: number; rows: Int32Array }>();

/**
 * The first row (by time) of each person in each session: where they first spawned. The same array for every
 * dataset that shares the loaded one's persons (a lined-up one too).
 */
export function personFirstRows(d: Dataset): Int32Array {
  const pid = d.personId;
  if (!pid) return new Int32Array(0);
  const known = firstRowsCache.get(pid);
  if (known && known.px === d.px && known.count === d.count) return known.rows;
  const rows = firstRowsOf(d, null, Math.max(1, d.sessionLabels.length));
  firstRowsCache.set(pid, { px: d.px, count: d.count, rows });
  return rows;
}

/** Where each part's two teams first appear (null for a part without exactly two, or with teams that name their side). */
function spawns(d: Dataset, team: Uint16Array, labels: readonly string[], parts: Segments): (SegmentSpawns | null)[] {
  const xs: Map<number, number[]>[] = Array.from({ length: parts.count }, () => new Map());
  const zs: Map<number, number[]>[] = Array.from({ length: parts.count }, () => new Map());
  const rows = parts.seg ? firstRowsOf(d, parts.seg, parts.count) : personFirstRows(d);
  const sid = d.sessionId;
  for (const r of rows) {
    const s = parts.seg ? parts.seg[r] : sid ? sid[r] : 0;
    const t = team[r];
    if (isUnassignedTeam(labels[t])) continue;
    if (!Number.isFinite(d.px[r]) || !Number.isFinite(d.pz[r])) continue;
    if (!xs[s].has(t)) {
      xs[s].set(t, []);
      zs[s].set(t, []);
    }
    xs[s].get(t)!.push(d.px[r]);
    zs[s].get(t)!.push(d.pz[r]);
  }
  return xs.map((m, s) => {
    if (m.size !== 2) return null;
    const [a, b] = [...m.keys()].sort((x, y) => x - y);
    if (SIDE_NAME.test(String(labels[a]).trim()) && SIDE_NAME.test(String(labels[b]).trim())) return null;
    return {
      map: mapKeyOf(d.sessionLabels[parts.session[s]] ?? ''),
      a,
      b,
      ca: [median(m.get(a)!), median(zs[s].get(a)!)],
      cb: [median(m.get(b)!), median(zs[s].get(b)!)],
    };
  });
}

/** The line a map's spawns lie along: the main axis of the vectors between them, held pointing east, else north. */
function axisOf(list: SegmentSpawns[]): [number, number] {
  let xx = 0, xz = 0, zz = 0;
  for (const s of list) {
    const dx = s.cb[0] - s.ca[0];
    const dz = s.cb[1] - s.ca[1];
    xx += dx * dx;
    xz += dx * dz;
    zz += dz * dz;
  }
  // The larger eigenvector of [[xx, xz], [xz, zz]].
  const angle = 0.5 * Math.atan2(2 * xz, xx - zz);
  let ax = Math.cos(angle);
  let az = Math.sin(angle);
  if (ax < -1e-9 || (Math.abs(ax) <= 1e-9 && az < 0)) {
    ax = -ax;
    az = -az;
  }
  return [ax, az];
}

/** Side A's and side B's team in one part (raw team indices). */
export interface PartSides {
  a: number;
  b: number;
  /** Side A is the higher of the two team indices. */
  swap: boolean;
}

/**
 * For each part of `d` (each round where the data has rounds, else each session), its two teams by side: side A the
 * west or south spawn of its map; null for a part not lined up. `team` and `labels` as the data gave them.
 */
export function sideSwaps(
  d: Dataset,
  team: Uint16Array,
  labels: readonly string[] = d.teamLabels,
): { swaps: (PartSides | null)[]; parts: Segments; check: SideCheck } {
  const parts = segmentsOf(d);
  const sp = d.personId ? spawns(d, team, labels, parts) : [];
  const byMap = new Map<string, SegmentSpawns[]>();
  for (const s of sp) {
    if (!s || !Number.isFinite(s.ca[0] + s.ca[1] + s.cb[0] + s.cb[1])) continue;
    if (!byMap.has(s.map)) byMap.set(s.map, []);
    byMap.get(s.map)!.push(s);
  }
  const axes = new Map([...byMap].map(([k, v]) => [k, axisOf(v)] as const));
  const swaps = sp.map((s): PartSides | null => {
    const axis = s ? axes.get(s.map) : undefined;
    if (!s || !axis) return null;
    const along = (c: [number, number]) => c[0] * axis[0] + c[1] * axis[1];
    const swap = along(s.ca) > along(s.cb);
    return swap ? { a: s.b, b: s.a, swap } : { a: s.a, b: s.b, swap };
  });
  // Counted by match.
  const sessions = Math.max(1, d.sessionLabels.length);
  const lined = new Uint8Array(sessions);
  const swapped = new Uint8Array(sessions);
  swaps.forEach((s, i) => {
    if (!s) return;
    lined[parts.session[i]] = 1;
    if (s.swap) swapped[parts.session[i]] = 1;
  });
  const n = lined.reduce((a, v) => a + v, 0);
  const check: SideCheck = {
    sessions: n,
    swapped: swapped.reduce((a, v) => a + v, 0),
    skipped: sessions - n,
    rounds: parts.seg ? swaps.filter(Boolean).length : 0,
  };
  return { swaps, parts, check };
}

/** The data's own teams: the `teamRaw` column and its labels where there is one, else the dataset's teams. */
function rawTeams(d: Dataset): { team: Uint16Array; labels: string[] } | null {
  const raw = d.attrs.find((a) => a.name === TEAM_RAW && a.kind === 'category');
  if (raw) return { team: Uint16Array.from(raw.data as Uint32Array), labels: (raw.categories ?? []).map(String) };
  return d.teamId ? { team: d.teamId, labels: d.teamLabels } : null;
}

/** Persons' teams, their place in them and the teams' sizes, as the load works them out (a person's first row). */
function roster(d: Dataset, team: Uint16Array, teams: number): Pick<Dataset, 'personTeam' | 'personSlot' | 'teamSizes'> {
  const n = d.personLabels.length;
  if (!d.personId || !n) return { personTeam: d.personTeam, personSlot: d.personSlot, teamSizes: d.teamSizes };
  const personTeam = new Uint16Array(n);
  const seen = new Uint8Array(n);
  for (let r = 0; r < d.count; r++) {
    const p = d.personId[r];
    if (!seen[p]) {
      seen[p] = 1;
      personTeam[p] = team[r];
    }
  }
  const teamSizes = new Uint32Array(Math.max(1, teams));
  const personSlot = new Uint16Array(n);
  for (let p = 0; p < n; p++) {
    personSlot[p] = Math.min(65535, teamSizes[personTeam[p]]);
    teamSizes[personTeam[p]]++;
  }
  return { personTeam, personSlot, teamSizes };
}

/** Per session, the data's team (raw index) -> the lined-up one, from its first lined-up part; null where none. */
const sessionMaps = new WeakMap<Dataset, (Int32Array | null)[]>();

/**
 * `d` with each match's (or round's) teams numbered by their side of the map (see the top), the data's own team
 * kept in `teamRaw`: a new dataset (the arrays it changes are new), or null where it has no teams to line up. With
 * `on` false, the dataset with the data's own teams back (null where it has no `teamRaw`).
 */
export function withTeamSides(d: Dataset, on: boolean): { dataset: Dataset; check: SideCheck } | null {
  if (!d.teamId || !d.personId) return null;
  const raw = rawTeams(d);
  if (!raw) return null;
  const hasRaw = d.attrs.some((a) => a.name === TEAM_RAW);
  const none: SideCheck = { sessions: 0, swapped: 0, skipped: 0, rounds: 0 };
  if (!on) {
    if (!hasRaw) return null;
    const team = raw.team.slice();
    return {
      dataset: { ...d, teamId: team, teamLabels: raw.labels, ...roster(d, team, raw.labels.length), attrs: d.attrs.filter((a) => a.name !== TEAM_RAW) },
      check: none,
    };
  }
  const { swaps, parts, check } = sideSwaps(d, raw.team, raw.labels);
  if (!check.sessions) return null;
  // The new teams: the two sides, then every team some row keeps (a part not lined up, a third team, nobody's).
  const labels: string[] = [...SIDE_LABELS];
  const kept = new Int32Array(raw.labels.length).fill(-1);
  const keep = (t: number) => {
    if (kept[t] < 0) {
      const l = raw.labels[t];
      const at = labels.indexOf(l);
      kept[t] = at >= 0 ? at : labels.push(l) - 1;
    }
    return kept[t];
  };
  const team = new Uint16Array(d.count);
  const sid = d.sessionId;
  const sessions = Math.max(1, d.sessionLabels.length);
  const maps: (Int32Array | null)[] = new Array(sessions).fill(null);
  for (let r = 0; r < d.count; r++) {
    const part = parts.seg ? parts.seg[r] : sid ? sid[r] : 0;
    const s = swaps[part];
    const t = raw.team[r];
    team[r] = s && t === s.a ? 0 : s && t === s.b ? 1 : keep(t);
  }
  swaps.forEach((s, i) => {
    const session = parts.session[i];
    if (!s || maps[session]) return;
    const m = new Int32Array(raw.labels.length);
    for (let t = 0; t < m.length; t++) m[t] = t === s.a ? 0 : t === s.b ? 1 : kept[t];
    maps[session] = m;
  });
  const attrs = hasRaw ? d.attrs : [...d.attrs, rawColumn(raw.team, raw.labels)];
  const dataset: Dataset = { ...d, teamId: team, teamLabels: labels, ...roster(d, team, labels.length), attrs };
  sessionMaps.set(dataset, maps);
  return { dataset, check };
}

/** The data's own team labels of `d` (before any line-up). */
export function rawTeamLabels(d: Dataset): string[] {
  const raw = d.attrs.find((a) => a.name === TEAM_RAW && a.kind === 'category');
  return raw ? (raw.categories ?? []).map(String) : d.teamLabels;
}

/**
 * The team (index into `teamLabels`) the rows the data gave team `raw` (an index into `rawTeamLabels`) have in
 * `session` of `d`: `raw` itself where nothing was lined up, -1 where that team is not one `d` knows.
 */
export function shownTeamIndex(d: Dataset, session: number, raw: number): number {
  const maps = sessionMaps.get(d);
  if (!maps) return raw;
  const m = maps[session];
  if (m) return raw >= 0 && raw < m.length ? m[raw] : -1;
  // A match not lined up keeps its teams under their own names.
  return d.teamLabels.indexOf(rawTeamLabels(d)[raw] ?? '\u0000');
}

const checks = new WeakMap<Dataset, SideCheck>();

/** What lining up the sides did to a dataset `withTeamSides` made (undefined for any other). */
export function sideCheckOf(d: Dataset | null): SideCheck | undefined {
  return d ? checks.get(d) : undefined;
}

/** `withTeamSides` on, remembered for `sideCheckOf`; the dataset unchanged where there is nothing to line up. */
export function lineUpSides(d: Dataset): Dataset {
  const r = withTeamSides(d, true);
  if (!r) return d;
  checks.set(r.dataset, r.check);
  return r.dataset;
}

/**
 * The per-browser choice. A new key since 2026-11-28, when the line-up became the default: a side of a map always
 * has one colour unless the viewer turns it off (the old key's "off" was the old default, not a choice).
 */
const KEY = 'heat3d.teamSides2';

/** Whether this viewer lines up the sides of every load: a per-browser choice (on unless turned off). */
export function teamSidesSaved(): boolean {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}

export function saveTeamSides(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    // Private windows and blocked storage: the choice lasts this session only.
  }
}

/** The data's own teams as a category column, for the filters and the inspector. */
function rawColumn(raw: Uint16Array, labels: readonly string[]): AttributeColumn {
  return { name: TEAM_RAW, kind: 'category', data: Uint32Array.from(raw), categories: labels.map(String), min: 0, max: Math.max(0, labels.length - 1) };
}
