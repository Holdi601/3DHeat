/**
 * The caster's input from the loaded data: one match's kills, deaths and
 * captures, by player (the replay's units, so a player's lives are one
 * player), with teams, vehicle classes, places and the distance of a kill
 * where both sides' rows give a place. Rounds are the match's sessions where
 * it has several (a CS2 match's rounds); one round otherwise.
 *
 * A kill row (its player the killer) and the death row of the same moment
 * (its player the victim) are one kill; the other-party column (`other`,
 * `victim`, `killer`...) names the side a row does not.
 */

import { CANON } from '../../data/canonical';
import { deadAt, deathsOf, SETTLE, type Deaths } from '../../data/deaths';
import { otherColumn } from '../../render/direction';
import type { Dataset, FilterSpec } from '../../state/types';
import { matchesOf, pickedMatches, type MatchEntry } from '../../match/matches';
import { unitsPerMetre } from '../../ui/replay/replayData';
import { unitsOf, type UnitIndex } from '../../ui/replay/units';
import type { CastCapture, CastInput, CastKill, CastRound } from './moments';

export interface CastSource {
  match: MatchEntry;
  input: CastInput;
  units: UnitIndex;
  /** The match's players: a replay unit, or the units of one player over the rounds (a CS2 round's units are its own). */
  players: CastPlayer[];
  /** Per person (track): first and last time seen in the match, to follow the life a moment falls in. */
  span: Map<number, [number, number]>;
  /** When each person (track) is dead: a wreck's rows go on after its death, into the player's next life. */
  deaths?: Deaths;
}

export interface CastPlayer {
  name: string;
  team: number;
  /** Unit indices. */
  units: number[];
}

/** The match the caster works on: the one picked, or the only one; null when several are shown. */
export function castMatch(d: Dataset, filters: FilterSpec[], session: number): MatchEntry | null {
  const set = matchesOf(d);
  if (set.entries.length === 1) return set.entries[0];
  const picked = pickedMatches(set, filters, session);
  if (picked && picked.length === 1) return set.entries.find((e) => e.index === picked[0]) ?? null;
  return null;
}

/** Whether a row belongs to the match. */
function inMatch(d: Dataset, m: MatchEntry): (row: number) => boolean {
  const set = matchesOf(d);
  if (set.via === 'column') {
    const data = d.attrs.find((a) => a.name === set.column)!.data as Uint32Array;
    return (r) => data[r] === m.index;
  }
  if (set.via === 'session' && d.sessionId) {
    const s = d.sessionId;
    return (r) => s[r] === m.index;
  }
  return () => true;
}

const KILL = new Set(['kill']);
/** Seconds within which one killer's kills are the same shot. */
const SAME_SHOT = 0.25;
const DEATH = new Set(['death', 'destroyed']);
const CAPTURE = new Set(['capture']);

export function castSource(d: Dataset, m: MatchEntry): CastSource | null {
  const ev = d.attrs.find((a) => a.name === CANON.event && a.categories);
  const pid = d.personId;
  if (!ev || !pid || !d.time) return null;
  const units = unitsOf(d);
  const kinds = ev.categories!.map((c) => (KILL.has(c) ? 1 : DEATH.has(c) ? 2 : CAPTURE.has(c) ? 3 : 0));
  const evData = ev.data as Uint32Array;
  const cls = d.attrs.find((a) => a.name === CANON.vehicleClass && a.categories);
  const tcls = d.attrs.find((a) => a.name === CANON.targetClass && a.categories);
  const classAt = (a: typeof cls, r: number) => {
    const v = a ? a.categories![(a.data as Uint32Array)[r]] ?? '' : '';
    return v === 'unknown' || v === 'other' ? '' : v;
  };
  const other = otherColumn(d);
  // Players: units by name, the round's part of it ("name · match · match #07") set aside.
  const players: CastPlayer[] = [];
  const byName = new Map<string, number>();
  const playerOfUnit = new Map<number, number>();
  const strip = (n: string) => {
    const at = n.indexOf(` · ${m.id}`);
    return at > 0 ? n.slice(0, at) : n;
  };
  const unitOf = (p: number) => {
    const u = p >= 0 && p < units.personUnit.length ? units.personUnit[p] : -1;
    if (u < 0) return -1;
    let pl = playerOfUnit.get(u);
    if (pl === undefined) {
      const unit = units.units[u];
      const name = unit.key.startsWith('#') ? strip(unit.name) : unit.name;
      // By name alone: a CS2 player changes side at the half.
      const id = unit.key.startsWith('#') ? name : unit.key;
      pl = byName.get(id);
      if (pl === undefined) {
        byName.set(id, (pl = players.length));
        players.push({ name, team: unit.team, units: [] });
      }
      players[pl].units.push(u);
      playerOfUnit.set(u, pl);
    }
    return pl;
  };
  // A row's team; none for a team without a name or the spectators (a coach is listed, but does not play).
  const sideOk = d.teamLabels.map((l) => !!l.trim() && !/^(spectators?|unassigned|none|coach(es)?)$/i.test(l.trim()));
  const rowTeam = (r: number) => {
    const tm = d.teamId ? d.teamId[r] : players[unitOf(pid[r])]?.team ?? -1;
    return tm >= 0 && sideOk[tm] ? tm : -1;
  };
  // Each player's team in each round, for the side a row does not say.
  const teamIn = new Map<string, number>();
  const teamOf = (pl: number, r: number) => (pl >= 0 ? (teamIn.get(`${roundOf.get(roundKey(r))}:${pl}`) ?? -1) : -1);
  const k = 1 / unitsPerMetre(d);
  const has = inMatch(d, m);

  const sid = d.sessionId;
  // Rounds: a round column where the data has one (CS2's `round`), else the match's sessions.
  const roundCol = d.attrs.find((a) => /^round(_?id)?$/i.test(a.name.trim()));
  const roundKey = roundCol
    ? roundCol.categories
      ? ((labels) => (r: number) => labels[(roundCol.data as Uint32Array)[r]])(roundCol.categories.map((c, i) => (/^\d+$/.test(c.trim()) ? Number(c) : 1e6 + i)))
      : (r: number) => roundCol.data[r]
    : sid
      ? (r: number) => sid[r]
      : () => 0;
  // Who won each round: the `won` column's rows, by round and team.
  const wonCol = d.attrs.find((a) => /^won$/i.test(a.name.trim()) && !a.categories);
  const wonBy = new Map<string, [number, number]>();
  const roundOf = new Map<number, number>();
  const keyOf: number[] = [];
  const rounds: CastRound[] = [];
  const span = new Map<number, [number, number]>();
  const kills: number[] = [];
  const deaths: number[] = [];
  const caps: number[] = [];
  for (let r = 0; r < d.count; r++) {
    if (!has(r)) continue;
    const t = d.time[r];
    const p = pid[r];
    const sp = span.get(p);
    if (!sp) span.set(p, [t, t]);
    else {
      if (t < sp[0]) sp[0] = t;
      if (t > sp[1]) sp[1] = t;
    }
    const s = roundKey(r);
    let ri = roundOf.get(s);
    if (ri === undefined) {
      roundOf.set(s, (ri = rounds.length));
      keyOf.push(s);
      const filter: FilterSpec | undefined = !roundCol
        ? undefined
        : roundCol.categories
          ? { kind: 'categories', column: roundCol.name, allowed: [(roundCol.data as Uint32Array)[r]] }
          : { kind: 'range', column: roundCol.name, min: roundCol.data[r], max: roundCol.data[r] };
      rounds.push({ start: t, end: t, roster: new Map(), session: sid ? sid[r] : undefined, filter });
    }
    const round = rounds[ri];
    if (t < round.start) round.start = t;
    if (t > round.end) round.end = t;
    const u = unitOf(p);
    if (u >= 0 && !units.units[units.personUnit[p]].decoy) {
      const team = rowTeam(r);
      if (team >= 0) {
        (round.roster.get(team) ?? round.roster.set(team, new Set()).get(team)!).add(u);
        teamIn.set(`${ri}:${u}`, team);
      }
    }
    if (wonCol) {
      const v = wonCol.data[r];
      const tm = v === 0 || v === 1 ? rowTeam(r) : -1;
      if (tm >= 0) {
        const key = `${ri}:${tm}`;
        const a = wonBy.get(key) ?? [0, 0];
        a[0] += v;
        a[1]++;
        wonBy.set(key, a);
      }
    }
    const kind = kinds[evData[r]];
    if (kind === 1) kills.push(r);
    else if (kind === 2) deaths.push(r);
    else if (kind === 3) caps.push(r);
  }
  rounds.forEach((round, ri) => {
    const won = [...wonBy].filter(([k, [w, n]]) => k.startsWith(`${ri}:`) && w / n > 0.5).map(([k]) => Number(k.slice(k.indexOf(':') + 1)));
    if (won.length === 1) round.winner = won[0];
  });
  // Rounds in order: by number or session (the viewer may line their clocks up), by time after that.
  const order = rounds.map((_, i) => i).sort((a, b) => keyOf[a] - keyOf[b] || rounds[a].start - rounds[b].start);
  const remap = new Map(order.map((old, i) => [old, i]));
  const roundAt = (r: number) => remap.get(roundOf.get(roundKey(r))!)!;
  const sortedRounds = order.map((i) => rounds[i]);
  // The other party of a row, as a player.
  const otherOf = (r: number) => (other ? unitOf(other.person[other.data[r]]) : -1);
  const time = d.time;
  const byTime = (a: number, b: number) => time[a] - time[b];
  kills.sort(byTime);
  deaths.sort(byTime);
  // One death a death: a wreck's later rows (War Thunder's falling wreck) and the death's twin rows are not more deaths.
  const dead = oneRowADeath(d, deaths, (r) => otherOf(r) >= 0);
  deaths.length = 0;
  deaths.push(...dead);

  const out: CastKill[] = [];
  const usedDeath = new Uint8Array(deaths.length);
  let lo = 0;
  for (const r of kills) {
    const killer = unitOf(pid[r]);
    let victim = otherOf(r);
    const t = time[r];
    while (lo < deaths.length && time[deaths[lo]] < t - 1) lo++;
    // The death row of the same moment: the named victim's, or one naming this killer, else the nearest of another team.
    let best = -1;
    let score = Infinity;
    for (let j = lo; j < deaths.length && time[deaths[j]] <= t + 1; j++) {
      if (usedDeath[j]) continue;
      const dr = deaths[j];
      if (roundAt(dr) !== roundAt(r)) continue;
      const dv = unitOf(pid[dr]);
      if (dv === killer) continue;
      const named = victim >= 0 ? dv === victim : otherOf(dr) === killer;
      const sc = Math.abs(time[dr] - t) + (named ? 0 : victim >= 0 ? Infinity : rowTeam(dr) !== rowTeam(r) ? 0.5 : Infinity);
      if (sc < score) [score, best] = [sc, j];
    }
    let x = d.px[r];
    let y = d.py[r];
    let z = d.pz[r];
    let distance: number | null = null;
    let victimClass = classAt(tcls, r);
    if (best >= 0) {
      usedDeath[best] = 1;
      const dr = deaths[best];
      victim = unitOf(pid[dr]);
      distance = Math.hypot(d.px[dr] - x, d.py[dr] - y, d.pz[dr] - z) * k;
      [x, y, z] = [d.px[dr], d.py[dr], d.pz[dr]];
      victimClass ||= classAt(cls, dr);
    }
    out.push({ time: t, killer, victim, killerTeam: rowTeam(r), victimTeam: best >= 0 ? rowTeam(deaths[best]) : teamOf(victim, r), killerClass: classAt(cls, r), victimClass, x, y, z, distance, round: roundAt(r) });
  }
  // Deaths no kill row claimed: still a death (a clutch counts it), its killer from the other column if named.
  deaths.forEach((dr, j) => {
    if (usedDeath[j]) return;
    const victim = unitOf(pid[dr]);
    const killer = otherOf(dr);
    out.push({
      time: time[dr], killer, victim, killerTeam: teamOf(killer, dr), victimTeam: rowTeam(dr), killerClass: '', victimClass: classAt(cls, dr),
      x: d.px[dr], y: d.py[dr], z: d.pz[dr], distance: null, round: roundAt(dr),
    });
  });
  out.sort((a, b) => a.round - b.round || a.time - b.time);
  // One shot that destroys a player's vehicle and the parts of it the data lists apart (a missile battery's
  // launcher and radar, AI units of their own) is one kill: kills by one killer at one instant where one of the
  // victims is a player keep the players only, and a player whose two tracks go down together is one kill. Two
  // players at once stay two.
  const isPlayer = (pl: number) => pl >= 0 && players[pl].units.some((u) => units.units[u].kind === 'player');
  const kept = out.filter((x, i) => {
    if (x.killer < 0) return true;
    for (let j = i - 1; j >= 0 && x.time - out[j].time <= SAME_SHOT; j--) if (out[j].killer === x.killer && x.victim >= 0 && out[j].victim === x.victim) return false;
    if (isPlayer(x.victim)) return true;
    for (let j = i - 1; j >= 0 && x.time - out[j].time <= SAME_SHOT; j--) if (out[j].killer === x.killer && isPlayer(out[j].victim)) return false;
    for (let j = i + 1; j < out.length && out[j].time - x.time <= SAME_SHOT; j++) if (out[j].killer === x.killer && isPlayer(out[j].victim)) return false;
    return true;
  });
  out.length = 0;
  out.push(...kept);
  const captures: CastCapture[] = caps.map((r) => {
    const u = unitOf(pid[r]);
    return { time: time[r], round: roundAt(r), person: u, team: rowTeam(r), x: d.px[r], y: d.py[r], z: d.pz[r] };
  });
  // Whether the data names its victims: then a kill credit with nobody seen dying is not a kill on screen.
  const named = out.filter((x) => x.killer >= 0 && x.victim >= 0).length;
  const victimsNamed = named > 0 && named >= 0.5 * kills.length;
  return { match: m, input: { kills: out, captures, rounds: sortedRounds, victimsNamed }, units, players, span, deaths: deathsOf(d) };
}

/**
 * The death rows that are deaths: one a person's dead span (`deathsOf`), the
 * one naming the other party where one does (`named`), else the first. Rows
 * outside any span (data the spans do not read) each stay a death. In time order.
 */
export function oneRowADeath(d: Dataset, rows: number[], named: (row: number) => boolean): number[] {
  const pid = d.personId;
  const time = d.time;
  if (!pid || !time) return rows;
  const spans = deathsOf(d);
  const chosen = new Map<string, number>();
  const out: number[] = [];
  for (const r of rows) {
    const p = pid[r];
    const t = time[r];
    let span = -1;
    if (spans.any && p + 1 < spans.start.length) {
      for (let k = spans.start[p]; k < spans.start[p + 1]; k++) {
        if (t >= spans.from[k] - SETTLE && t < spans.to[k]) {
          span = k;
          break;
        }
      }
    }
    if (span < 0) {
      out.push(r);
      continue;
    }
    const key = String(span);
    const had = chosen.get(key);
    if (had === undefined) chosen.set(key, r);
    // A later row of the same death names the other party where the first did not: that one, if it is the same moment.
    else if (!named(had) && named(r) && time[r] - time[had] <= 1) chosen.set(key, r);
  }
  out.push(...chosen.values());
  return out.sort((a, b) => time[a] - time[b] || a - b);
}

/**
 * The unit and track (person) of a player at `time`: the life it falls in,
 * else the nearest. Where lives overlap - a wreck's rows go on after its death
 * while the player has spawned again - the one alive then, else the latest
 * to start (the life that has just ended).
 */
export function trackAt(src: CastSource, player: number, time: number): { unit: number; track: number } | null {
  const pl = src.players[player];
  if (!pl) return null;
  let best: { unit: number; track: number } | null = null;
  let gap = Infinity;
  let dead = true;
  let start = -Infinity;
  for (const u of pl.units) {
    for (const p of src.units.units[u].persons) {
      const s = src.span.get(p);
      if (!s) continue;
      const g = time < s[0] ? s[0] - time : time > s[1] ? time - s[1] : 0;
      const dd = !!src.deaths && deadAt(src.deaths, p, time);
      if (g < gap || (g === gap && ((dead && !dd) || (dead === dd && s[0] > start)))) [gap, dead, start, best] = [g, dd, s[0], { unit: u, track: p }];
    }
  }
  return best;
}
