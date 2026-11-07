/**
 * The flight log's numbers, as a debrief asks them: per unit its lives,
 * kills, deaths, shots, hits and hit ratio, take-offs, landings and time in
 * the air, and the most it pulled, flew and climbed; per team the sums.
 * Exported as CSV, as is a unit's telemetry.
 *
 * Read from the recording's events where it has them - kill, death, shot or
 * launch, hit or hurt, an ACMI file's Destroyed, TakenOff and Landed - and the
 * flight data (`data/flight.ts`) for the rest:
 *
 *   kills       kill events by the unit; where a recording only writes deaths, deaths that name it the killer
 *   deaths      death, dead, destroyed, crashed events of the unit (one a moment)
 *   shots       launch, fire, weapon_fire events; a "shot" that names another unit is a shot-down, not a shot
 *   hits        hit / hurt events (written on the one hit) that name the unit as the other party
 *   take-offs   TakenOff / Landed events, else the OnGround property, else AGL, else an estimate from
 *   landings    speed and height: slower than 20 m/s, level, and near the lowest the track went
 *
 * War Thunder counts its guns' rounds in no event, so its shots are its
 * missiles, rockets and bombs.
 */

import type { AttributeColumn, Dataset } from '../../state/types';
import { flightSeries, type FlightSeries } from '../../data/flight';
import { eventRows } from './replayData';
import { partyName, unitsOf, type Unit } from './units';
import { unitShape, categoryOfShape, type ObjectCategory } from './objectType';

export type EventRole = 'kill' | 'death' | 'shot' | 'hit' | 'takeoff' | 'landing';

const KILL = /^(kill|kills|killed_other|frag|player_kill)$/i;
const DEATH = /^(death|died|dead|destroyed|crash(ed)?|killed|player_death)$/i;
const SHOT = /^(launch|launched|fire|fired|weapon_?fire|shots?_?fired|gun_?shots?|shoot|throw)$/i;
const HIT = /^(hit(_\w+)?|hurt|damage(d)?|player_hurt)$/i;
const TAKEOFF = /^(taken_?off|take_?off|took_?off)$/i;
const LANDING = /^(landed|landing)$/i;

/** What an event means for the statistics; `namesOther` says whether its row names another unit. */
export function eventRole(label: string, namesOther: boolean): EventRole | null {
  // An ACMI event carries its text after its kind: "TakenOff: Viper 1 has taken off".
  const l = label.split(':')[0].trim();
  if (KILL.test(l)) return 'kill';
  if (DEATH.test(l)) return 'death';
  if (TAKEOFF.test(l)) return 'takeoff';
  if (LANDING.test(l)) return 'landing';
  if (HIT.test(l)) return 'hit';
  if (SHOT.test(l)) return 'shot';
  // CS2 writes a fired round as "shot"; War Thunder writes a shot-down as "shot", naming the victim.
  if (/^shots?$/i.test(l)) return namesOther ? null : 'shot';
  return null;
}

export interface Phases {
  takeoffs: number;
  landings: number;
  /** Seconds in the air. */
  airborne: number;
  takeoffTimes: number[];
  landingTimes: number[];
}

/**
 * Take-offs, landings and time in the air from a track's samples: `ground(i)`
 * true on the ground, false in the air, null unknown. A change counts once it
 * has held `hold` seconds; across a gap of more than ten seconds (a respawn,
 * a hole in the recording) the state is taken as it is, no change counted.
 * The track's first state is where it starts: an air spawn is no take-off.
 */
export function flightPhases(
  time: ArrayLike<number>,
  ground: (i: number) => boolean | null,
  hold = 3,
): Phases {
  const out: Phases = { takeoffs: 0, landings: 0, airborne: 0, takeoffTimes: [], landingTimes: [] };
  let state: boolean | null = null;
  let since = -1;
  let candidate: boolean | null = null;
  for (let i = 0; i < time.length; i++) {
    const g = ground(i);
    const gap = i > 0 ? time[i] - time[i - 1] : 0;
    if (i > 0 && state === false && gap > 0 && gap <= 10) out.airborne += gap;
    if (g === null) continue;
    if (state === null || gap > 10) {
      state = g;
      candidate = null;
      continue;
    }
    if (g === state) {
      candidate = null;
      continue;
    }
    if (candidate !== g) {
      candidate = g;
      since = time[i];
    }
    if (time[i] - since >= hold) {
      state = g;
      candidate = null;
      // The change happened when it began, not when it was believed.
      if (g) {
        out.landings++;
        out.landingTimes.push(since);
        out.airborne -= time[i] - since;
      } else {
        out.takeoffs++;
        out.takeoffTimes.push(since);
        out.airborne += time[i] - since;
      }
    }
  }
  return out;
}

/** How the ground was told from the air for a track. */
export type GroundFrom = 'events' | 'data' | 'agl' | 'estimate' | 'none';

/** The ground test for a flight series: the recording's OnGround, its AGL, else speed, climb and height. */
export function groundTest(s: FlightSeries): {
  test: (i: number) => boolean | null;
  from: GroundFrom;
} {
  const on = s.values.onGround;
  if (on && s.source.onGround === 'data')
    return { test: (i) => (Number.isFinite(on[i]) ? on[i] >= 0.5 : null), from: 'data' };
  const agl = s.values.agl;
  if (agl && s.source.agl === 'data')
    return { test: (i) => (Number.isFinite(agl[i]) ? agl[i] < 2 : null), from: 'agl' };
  const gs = s.values.gs;
  const vs = s.values.vs;
  const alt = s.values.alt;
  if (!gs || !vs || !alt) return { test: () => null, from: 'none' };
  let low = Infinity;
  for (const a of alt) if (Number.isFinite(a) && a < low) low = a;
  return {
    test: (i) => {
      if (!Number.isFinite(gs[i]) || !Number.isFinite(vs[i])) return null;
      return gs[i] < 20 && Math.abs(vs[i]) < 2 && alt[i] < low + 30;
    },
    from: 'estimate',
  };
}

export interface UnitStats {
  key: string;
  name: string;
  vehicle: string;
  team: number;
  kind: Unit['kind'];
  category: ObjectCategory;
  lives: number;
  kills: number;
  deaths: number;
  shots: number;
  hits: number;
  hitsTaken: number;
  /** Hits per shot, NaN without shots. */
  hitRatio: number;
  takeoffs: number;
  landings: number;
  /** Seconds in the air (things that fly), NaN for the rest. */
  airborne: number;
  groundFrom: GroundFrom;
  maxG: number;
  minG: number;
  /** m/s. */
  maxSpeed: number;
  /** Metres. */
  maxAlt: number;
  maxMach: number;
  /** Metres travelled. */
  distance: number;
  /** Seconds in the recording. */
  first: number;
  last: number;
}

export interface TeamStats {
  team: number;
  units: number;
  kills: number;
  deaths: number;
  shots: number;
  hits: number;
}

export interface MatchStats {
  units: UnitStats[];
  teams: TeamStats[];
  /** Seconds from the first to the last sample. */
  duration: number;
  kills: number;
  deaths: number;
  shots: number;
  hits: number;
}

/** A Tacview recording's own events (bookmarks, messages to all) are kept as the object "(recording)": no unit. */
function isRecording(d: Dataset, u: Unit): boolean {
  return u.persons.length === 1 && d.personLabels[u.persons[0]] === '(recording)';
}

function attr(d: Dataset, name: string): AttributeColumn | undefined {
  return d.attrs.find((a) => a.kind === 'category' && a.name.trim().toLowerCase() === name);
}

function textAt(a: AttributeColumn | undefined, row: number): string {
  if (!a?.categories) return '';
  return a.categories[(a.data as Uint32Array)[row]] ?? '';
}

/**
 * The statistics of a recording, of one session (-1: all) and of the rows
 * `rowOk` allows (a matches filter). `known` names unit ids a summary knows.
 */
export function computeStats(
  d: Dataset,
  session: number,
  rowOk?: (row: number) => boolean,
  known?: Map<number, string>,
): MatchStats {
  const index = unitsOf(d);
  const ev = eventRows(d);
  const other = attr(d, 'other');
  const inRows = (row: number) =>
    (session < 0 || !d.sessionId || d.sessionId[row] === session) && (!rowOk || rowOk(row));

  // Units by every name the other party of an event can give them.
  const byName = new Map<string, Unit>();
  for (const u of index.units) {
    if (u.kind === 'weapon') continue;
    for (const n of [u.key, u.name]) if (n && !byName.has(n)) byName.set(n, u);
  }
  const unitOfName = (text: string): Unit | undefined => {
    if (!text) return undefined;
    const n = partyName(d, text, known);
    return byName.get(n) ?? byName.get(text);
  };

  const acc = new Map<string, UnitStats>();
  const stat = (u: Unit): UnitStats => {
    let s = acc.get(u.key);
    if (!s) {
      s = {
        key: u.key,
        name: u.name,
        vehicle: u.vehicle,
        team: u.team,
        kind: u.kind,
        category: categoryOfShape(unitShape(d, u)),
        lives: 0,
        kills: 0,
        deaths: 0,
        shots: 0,
        hits: 0,
        hitsTaken: 0,
        hitRatio: NaN,
        takeoffs: 0,
        landings: 0,
        airborne: NaN,
        groundFrom: 'none',
        maxG: NaN,
        minG: NaN,
        maxSpeed: NaN,
        maxAlt: NaN,
        maxMach: NaN,
        distance: 0,
        first: Infinity,
        last: -Infinity,
      };
      acc.set(u.key, s);
    }
    return s;
  };

  // ---- events
  const evTakeoffs = new Set<string>();
  let anyKill = false;
  const deathsAt = new Map<string, number>();
  const deathOthers: { killer: Unit }[] = [];
  if (ev && d.time) {
    for (let i = 0; i < ev.rows.length; i++) {
      const row = ev.rows[i];
      if (!inRows(row)) continue;
      const p = ev.persons[i];
      const u = p >= 0 ? index.units[index.personUnit[p]] : undefined;
      const otherText = textAt(other, row).trim();
      const role = eventRole(ev.labels[i], !!otherText);
      if (!role || !u || isRecording(d, u)) continue;
      // A weapon's own events (its impact, its end) are not its launcher's.
      if (u.kind === 'weapon' && role !== 'hit') continue;
      const s = stat(u);
      const t = d.time[row];
      switch (role) {
        case 'kill':
          anyKill = true;
          s.kills++;
          break;
        case 'death': {
          const was = deathsAt.get(u.key);
          if (was !== undefined && Math.abs(t - was) < 3) break;
          deathsAt.set(u.key, t);
          s.deaths++;
          const killer = unitOfName(otherText);
          if (killer && killer !== u) deathOthers.push({ killer });
          break;
        }
        case 'shot':
          s.shots++;
          break;
        case 'hit': {
          s.hitsTaken++;
          const by = unitOfName(otherText);
          if (by && by !== u) stat(by).hits++;
          break;
        }
        case 'takeoff':
          s.takeoffs++;
          evTakeoffs.add(u.key);
          break;
        case 'landing':
          s.landings++;
          evTakeoffs.add(u.key);
          break;
      }
    }
  }
  // Only deaths written: the killer each names.
  if (!anyKill) for (const { killer } of deathOthers) stat(killer).kills++;

  // ---- flight data, per unit over its lives
  let t0 = Infinity;
  let t1 = -Infinity;
  for (const u of index.units) {
    if (u.kind === 'weapon' || isRecording(d, u)) continue;
    for (const p of u.persons) {
      const fs = flightSeries(d, p, session);
      if (!fs || !fs.time.length) continue;
      if (rowOk && !rowOk(fs.rows[0])) continue;
      const s = stat(u);
      s.lives++;
      s.first = Math.min(s.first, fs.time[0]);
      s.last = Math.max(s.last, fs.time[fs.time.length - 1]);
      t0 = Math.min(t0, fs.time[0]);
      t1 = Math.max(t1, fs.time[fs.time.length - 1]);
      const max = (id: string, lim = Infinity) => {
        const v = fs.values[id];
        let m = NaN;
        if (v) for (const x of v) if (Number.isFinite(x) && Math.abs(x) < lim && !(x <= m)) m = x;
        return m;
      };
      const mx = (a: number, b: number) =>
        Number.isFinite(a) ? (Number.isFinite(b) ? Math.max(a, b) : a) : b;
      s.maxSpeed = mx(s.maxSpeed, max('tas', 3000));
      s.maxAlt = mx(s.maxAlt, max('alt'));
      let dist = 0;
      for (let i = 1; i < fs.time.length; i++) {
        if (fs.time[i] - fs.time[i - 1] > 10) continue;
        dist += Math.hypot(fs.x[i] - fs.x[i - 1], fs.y[i] - fs.y[i - 1], fs.z[i] - fs.z[i - 1]);
      }
      s.distance += dist;
      if (s.category !== 'air') continue;
      s.maxMach = mx(s.maxMach, max('mach', 10));
      // G beyond 15 is a jump in the recording, not a manoeuvre.
      const g = fs.values.g;
      if (g)
        for (const x of g) {
          if (!Number.isFinite(x) || Math.abs(x) > 15) continue;
          if (!(x <= s.maxG)) s.maxG = x;
          if (!(x >= s.minG)) s.minG = x;
        }
      if (evTakeoffs.has(u.key)) {
        s.groundFrom = 'events';
        continue;
      }
      const gt = groundTest(fs);
      const ph = flightPhases(fs.time, gt.test);
      s.takeoffs += ph.takeoffs;
      s.landings += ph.landings;
      s.airborne = (Number.isFinite(s.airborne) ? s.airborne : 0) + ph.airborne;
      if (gt.from !== 'none') s.groundFrom = gt.from;
    }
  }

  const units = [...acc.values()].filter(
    (s) => s.lives > 0 || s.kills || s.deaths || s.shots || s.hits,
  );
  for (const s of units) s.hitRatio = s.shots > 0 ? s.hits / s.shots : NaN;
  const teams = new Map<number, TeamStats>();
  for (const s of units) {
    if (s.kind === 'weapon') continue;
    let t = teams.get(s.team);
    if (!t)
      teams.set(s.team, (t = { team: s.team, units: 0, kills: 0, deaths: 0, shots: 0, hits: 0 }));
    t.units++;
    t.kills += s.kills;
    t.deaths += s.deaths;
    t.shots += s.shots;
    t.hits += s.hits;
  }
  const sum = (k: 'kills' | 'deaths' | 'shots' | 'hits') => units.reduce((a, s) => a + s[k], 0);
  return {
    units,
    teams: [...teams.values()].sort((a, b) => a.team - b.team),
    duration: Number.isFinite(t1 - t0) ? t1 - t0 : 0,
    kills: sum('kills'),
    deaths: sum('deaths'),
    shots: sum('shots'),
    hits: sum('hits'),
  };
}

/** A CSV field, quoted where it has to be. */
export function csvField(v: string | number): string {
  if (typeof v === 'number') return Number.isFinite(v) ? String(Math.round(v * 1000) / 1000) : '';
  return /[",\n\r;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** The per-unit table as CSV, SI units (metres, m/s, seconds), headers in English for other tools. */
export function statsCsv(m: MatchStats, teamName: (team: number) => string): string {
  const head = [
    'unit',
    'vehicle',
    'team',
    'kind',
    'category',
    'lives',
    'kills',
    'deaths',
    'shots',
    'hits',
    'hits_taken',
    'hit_ratio',
    'takeoffs',
    'landings',
    'airborne_s',
    'ground_from',
    'max_g',
    'min_g',
    'max_speed_ms',
    'max_alt_m',
    'max_mach',
    'distance_m',
    'first_s',
    'last_s',
  ];
  const lines = [head.join(',')];
  for (const s of m.units) {
    lines.push(
      [
        s.name,
        s.vehicle,
        s.team >= 0 ? teamName(s.team) : '',
        s.kind,
        s.category,
        s.lives,
        s.kills,
        s.deaths,
        s.shots,
        s.hits,
        s.hitsTaken,
        s.hitRatio,
        s.takeoffs,
        s.landings,
        s.airborne,
        s.groundFrom,
        s.maxG,
        s.minG,
        s.maxSpeed,
        s.maxAlt,
        s.maxMach,
        s.distance,
        s.first,
        s.last,
      ]
        .map(csvField)
        .join(','),
    );
  }
  return lines.join('\n') + '\n';
}

/**
 * A unit's telemetry as CSV, as Tacview exports it: every value the track has
 * (recorded and worked out), `hz` samples a second, SI units.
 */
export function telemetryCsv(
  series: { name: string; s: FlightSeries }[],
  params: string[],
  hz: number,
): string {
  const lines = [['time_s', 'unit', 'x_m', 'y_m', 'z_m', ...params].join(',')];
  const step = 1 / Math.max(0.01, hz);
  for (const { name, s } of series) {
    if (!s.time.length) continue;
    let i = 0;
    for (let t = s.time[0]; t <= s.time[s.time.length - 1] + 1e-9; t += step) {
      while (i + 1 < s.time.length && s.time[i + 1] <= t) i++;
      const row = [t, name, s.x[i], s.y[i], s.z[i], ...params.map((p) => s.values[p]?.[i] ?? NaN)];
      lines.push(row.map(csvField).join(','));
    }
  }
  return lines.join('\n') + '\n';
}

/** The flight log (the events as listed) as CSV. */
export function eventsCsv(
  rows: { time: number; event: string; unit: string; other: string; weapon: string }[],
): string {
  const lines = ['time_s,event,unit,other,weapon'];
  for (const r of rows)
    lines.push([r.time, r.event, r.unit, r.other, r.weapon].map(csvField).join(','));
  return lines.join('\n') + '\n';
}

/** Hand a text to the viewer as a file to save. */
export function download(name: string, text: string, type = 'text/csv'): void {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
