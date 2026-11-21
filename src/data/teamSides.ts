/**
 * Team sides: which side of a map each match's teams start on, and an
 * optional correction that numbers them by it, so team 1 is the same side
 * of a map in every match.
 *
 * Some games number a match's teams without regard to the map: in War
 * Thunder team 1 starts on either side, match by match. Laid over each
 * other, two matches then mix both sides under one colour. The correction
 * finds where each team's units first appear in a match (the median of
 * their first positions: their spawn) and, for each map, the line the
 * spawns lie along over all its matches (the main axis of the vectors from
 * one team's spawn to the other's). Along that line, held pointing east (or
 * north where it runs north and south), the team whose spawn lies west (or
 * south) is side A and takes the lower team number. A match whose teams lie
 * the other way round has them swapped; the team the data gave each row
 * stays in `teamRaw`.
 *
 * A map is what a session's name says before its date (`avg_map_AB_Dom_` of
 * `avg_map_AB_Dom_2026-11-20_..._server`), so a map's layouts (its game
 * modes) are lined up separately; without a date, all sessions are one map.
 * Only sessions with exactly two teams (groups named 0, none or unknown left
 * aside) are lined up.
 */

import type { AttributeColumn, Dataset } from '../state/types';

/** The column the team the data gave is kept in. */
export const TEAM_RAW = 'teamRaw';

const UNASSIGNED = new Set(['0', '', 'none', 'unknown', 'null', '-1']);
const DATE = /\d{4}[-_.]\d{2}[-_.]\d{2}/;

/** The map a session's name stands for: what comes before its date; the whole name without one. */
export function mapKeyOf(session: string): string {
  const m = DATE.exec(session);
  return m ? session.slice(0, m.index) : '';
}

export interface SideCheck {
  /** Sessions with two teams lined up, and of them those whose teams were swapped. */
  sessions: number;
  swapped: number;
  /** Sessions left as they are: not two teams, or no positions. */
  skipped: number;
}

interface SessionSpawns {
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

/** Where each session's two teams first appear (null for a session without exactly two). */
function spawns(d: Dataset, team: Uint16Array): (SessionSpawns | null)[] {
  const sessions = Math.max(1, d.sessionLabels.length);
  const pid = d.personId!;
  const sid = d.sessionId;
  const time = d.time;
  // The first row of each person in each session: in a flat array where the pairs are few enough, else a map.
  const persons = Math.max(1, d.personLabels.length);
  const flat = sessions * persons <= 1 << 24 ? new Int32Array(sessions * persons).fill(-1) : null;
  const map = flat ? null : new Map<number, number>();
  const later = time && !d.timeSorted ? time : null;
  for (let r = 0; r < d.count; r++) {
    const key = (sid ? sid[r] : 0) * persons + pid[r];
    const was = flat ? flat[key] : (map!.get(key) ?? -1);
    if (was >= 0 && !(later && later[r] < later[was])) continue;
    if (flat) flat[key] = r;
    else map!.set(key, r);
  }
  const first: [number, number][] = [];
  if (flat) {
    for (let key = 0; key < flat.length; key++) if (flat[key] >= 0) first.push([key, flat[key]]);
  } else first.push(...map!);
  const xs: Map<number, number[]>[] = Array.from({ length: sessions }, () => new Map());
  const zs: Map<number, number[]>[] = Array.from({ length: sessions }, () => new Map());
  for (const [key, r] of first) {
    const s = Math.floor(key / persons);
    const t = team[r];
    if (UNASSIGNED.has(String(d.teamLabels[t] ?? '').trim().toLowerCase())) continue;
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
    return {
      map: mapKeyOf(d.sessionLabels[s] ?? ''),
      a,
      b,
      ca: [median(m.get(a)!), median(zs[s].get(a)!)],
      cb: [median(m.get(b)!), median(zs[s].get(b)!)],
    };
  });
}

/** The line a map's spawns lie along: the main axis of the vectors between them, held pointing east, else north. */
function axisOf(list: SessionSpawns[]): [number, number] {
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

/**
 * For each session, whether its two teams are to be swapped so the lower team number is side A (the west or south
 * spawn of its map), from the teams as `team` gives them; null for a session not lined up.
 */
export function sideSwaps(d: Dataset, team: Uint16Array): { swaps: ({ a: number; b: number; swap: boolean } | null)[]; check: SideCheck } {
  const sp = d.personId ? spawns(d, team) : [];
  const byMap = new Map<string, SessionSpawns[]>();
  for (const s of sp) {
    if (!s || !Number.isFinite(s.ca[0] + s.ca[1] + s.cb[0] + s.cb[1])) continue;
    if (!byMap.has(s.map)) byMap.set(s.map, []);
    byMap.get(s.map)!.push(s);
  }
  const axes = new Map([...byMap].map(([k, v]) => [k, axisOf(v)] as const));
  const check: SideCheck = { sessions: 0, swapped: 0, skipped: 0 };
  const swaps = sp.map((s) => {
    const axis = s ? axes.get(s.map) : undefined;
    if (!s || !axis) {
      check.skipped++;
      return null;
    }
    check.sessions++;
    const along = (c: [number, number]) => c[0] * axis[0] + c[1] * axis[1];
    const swap = along(s.ca) > along(s.cb);
    if (swap) check.swapped++;
    return { a: s.a, b: s.b, swap };
  });
  return { swaps, check };
}

/** The team each row had as the data gave it: the `teamRaw` column where there is one, else the dataset's own. */
function rawTeams(d: Dataset): Uint16Array | null {
  const raw = d.attrs.find((a) => a.name === TEAM_RAW && a.kind === 'category');
  if (raw) return Uint16Array.from(raw.data as Uint32Array);
  return d.teamId;
}

/** Persons' teams, their place in them and the teams' sizes, as the load works them out (a person's first row). */
function roster(d: Dataset, team: Uint16Array): Pick<Dataset, 'personTeam' | 'personSlot' | 'teamSizes'> {
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
  const teamSizes = new Uint32Array(Math.max(1, d.teamLabels.length));
  const personSlot = new Uint16Array(n);
  for (let p = 0; p < n; p++) {
    personSlot[p] = Math.min(65535, teamSizes[personTeam[p]]);
    teamSizes[personTeam[p]]++;
  }
  return { personTeam, personSlot, teamSizes };
}

/**
 * `d` with each match's teams numbered by their side of the map (see the top), the data's own team kept in
 * `teamRaw`: a new dataset (the arrays it changes are new), or null where it has no teams to line up. With `on`
 * false, the dataset with the data's own teams back (null where it has no `teamRaw`).
 */
export function withTeamSides(d: Dataset, on: boolean): { dataset: Dataset; check: SideCheck } | null {
  if (!d.teamId || !d.personId) return null;
  const raw = rawTeams(d);
  if (!raw) return null;
  const hasRaw = d.attrs.some((a) => a.name === TEAM_RAW);
  if (!on) {
    if (!hasRaw) return null;
    const team = raw.slice();
    return { dataset: { ...d, teamId: team, ...roster(d, team), attrs: d.attrs.filter((a) => a.name !== TEAM_RAW) }, check: { sessions: 0, swapped: 0, skipped: 0 } };
  }
  const { swaps, check } = sideSwaps(d, raw);
  if (!check.sessions) return null;
  const team = raw.slice();
  if (check.swapped) {
    const sid = d.sessionId;
    for (let r = 0; r < d.count; r++) {
      const s = swaps[sid ? sid[r] : 0];
      if (!s || !s.swap) continue;
      if (team[r] === s.a) team[r] = s.b;
      else if (team[r] === s.b) team[r] = s.a;
    }
  }
  const attrs = hasRaw ? d.attrs : [...d.attrs, rawColumn(d, raw)];
  return { dataset: { ...d, teamId: team, ...roster(d, team), attrs }, check };
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

const KEY = 'heat3d.teamSides';

/** Whether this viewer lines up the sides of every load: a per-browser choice (off unless set). */
export function teamSidesSaved(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
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
function rawColumn(d: Dataset, raw: Uint16Array): AttributeColumn {
  return { name: TEAM_RAW, kind: 'category', data: Uint32Array.from(raw), categories: d.teamLabels.map(String), min: 0, max: Math.max(0, d.teamLabels.length - 1) };
}
