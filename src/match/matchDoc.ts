/**
 * A CS2 match as the demo export summarises it (`<match>.match.json`, written
 * by `python -m heat3d_cs2 demos`): teams, score, every round with its result,
 * economy and kills, and every player's scoreboard line. The heatmap table of
 * the same match (`<match>.parquet`) carries the positions and events; this
 * carries what is counted from them.
 *
 * The conventions behind the numbers - a trade within 5 s, KAST, the buy
 * types - are the export's, stated in the document itself.
 *
 * Versions 1 and 2 are read. Version 2 gives a plant's time into the round
 * (version 1: match seconds), may leave a plant's site empty when the demo does
 * not say it, writes a drawn round with no winner, and adds the half length, the
 * pistol rounds and per kill `suicide`, `noscope` and `attackerBlind`. The
 * helpers below answer each of these for either version.
 */

import { t } from '../i18n';

export type Side = 'T' | 'CT';

export interface MatchKill {
  /** Seconds since the round's freeze time ended. */
  time: number;
  attacker: string;
  attackerSide: Side | '';
  victim: string;
  victimSide: Side | '';
  assister: string | null;
  flashAssist: boolean;
  weapon: string;
  headshot: boolean;
  wallbang: boolean;
  throughSmoke: boolean;
  opening: boolean;
  traded: boolean;
  trade: boolean;
  teamkill: boolean;
  /** Attacker and victim the same player (version 2; version 1 counted it a teamkill). */
  suicide?: boolean;
  /** A scoped weapon fired unscoped (version 2). */
  noscope?: boolean;
  /** The killer was flashed (version 2). */
  attackerBlind?: boolean;
  after: boolean;
  /** Where the victim was. */
  place: string;
}

export interface MatchRound {
  number: number;
  /** Match seconds: freeze over, decided, next round started. */
  start: number;
  end: number;
  until: number;
  /** Empty for a draw, as is `winnerTeam`. */
  winner: Side | '';
  winnerTeam: string;
  reason: 'bomb' | 'defuse' | 'elimination' | 'time' | 'surrender' | 'draw' | 'other';
  score: Record<string, number>;
  sides: Record<string, Side>;
  equipment: Partial<Record<Side, number>>;
  buy: Partial<Record<Side, 'pistol' | 'eco' | 'force' | 'full'>>;
  /**
   * `site` is "A" or "B"; empty when the demo does not say (version 2), an
   * entity number in version 1 - read it with `plantSite`. `time` is seconds
   * into the round from version 2, match seconds before - read it with `plantTime`.
   */
  plant: {
    site: string | number;
    time: number;
    player: string;
    steamid?: string;
    x: number;
    y: number;
    z: number;
    place?: string;
  } | null;
  survivors: Partial<Record<Side, string[]>>;
  clutches: { player: string; steamid: string; side: Side; against: number; won: boolean }[];
  kills: MatchKill[];
}

export interface MatchPlayer {
  name: string;
  steamid: string;
  team: string;
  kills: number;
  deaths: number;
  assists: number;
  flashAssists: number;
  diff: number;
  adr: number;
  kast: number;
  headshotPct: number;
  openingKills: number;
  openingDeaths: number;
  tradeKills: number;
  tradedDeaths: number;
  multiKills: Record<string, number>;
  clutches: number;
  clutchesWon: number;
  utilityDamage: number;
  enemiesFlashed: number;
  plants: number;
  defuses: number;
  teamkills: number;
  roundsPlayed: number;
}

export interface MatchDoc {
  format: 'heat3d-cs2-match';
  version: number;
  match: string;
  map: string;
  demos: string[];
  teams: string[];
  score: Record<string, number>;
  rounds: MatchRound[];
  incomplete: number[];
  /** Rounds in a regulation half, null when the recording does not show the swap (version 2). */
  halfLength?: number | null;
  /** The rounds the export counts as pistol rounds (version 2). */
  pistolRounds?: number[];
  players: MatchPlayer[];
}

/** A match document from a file's text; throws with what is wrong, in the user's language. */
export function parseMatchDoc(text: string, name = t('match.doc.file')): MatchDoc {
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch {
    throw new Error(t('match.doc.notJson', { name }));
  }
  const d = doc as Partial<MatchDoc>;
  if (!d || d.format !== 'heat3d-cs2-match') {
    throw new Error(t('match.doc.notMatch', { name, format: 'heat3d-cs2-match' }));
  }
  if (!Array.isArray(d.rounds) || !Array.isArray(d.players) || !Array.isArray(d.teams)) {
    throw new Error(t('match.doc.incomplete', { name }));
  }
  return d as MatchDoc;
}

/** No side won the round: a draw. */
export function isDraw(r: MatchRound): boolean {
  return r.winner !== 'T' && r.winner !== 'CT';
}

/** When the bomb went down, in seconds into the round, for either version; NaN without a plant. */
export function plantTime(doc: MatchDoc, r: MatchRound): number {
  if (!r.plant) return Number.NaN;
  return doc.version >= 2 ? r.plant.time : r.plant.time - r.start;
}

/** The site the bomb went down on; "" when it is not known (an empty site, or version 1's entity number). */
export function plantSite(r: MatchRound): string {
  const site = r.plant?.site;
  return typeof site === 'string' && site.trim() && !/^\d+$/.test(site.trim()) ? site.trim() : '';
}

/** A suicide, for either version: version 1 has no flag, and the attacker is the victim. */
export function isSuicide(k: MatchKill): boolean {
  return k.suicide ?? (!!k.attacker && k.attacker === k.victim);
}

/**
 * Rounds in a regulation half: the document's own from version 2, else 12 -
 * premier and competitive play MR12.
 */
export function halfLength(doc: MatchDoc): number {
  return doc.halfLength && doc.halfLength > 0 ? doc.halfLength : 12;
}

/** Whether round `n` begins a half after the first: the second half, or a three-round overtime half. */
export function startsHalf(doc: MatchDoc, n: number): boolean {
  const h = halfLength(doc);
  return n === h + 1 || (n > 2 * h && (n - 2 * h - 1) % 3 === 0);
}

/**
 * Whether a side played round `r` as a pistol round: the document's
 * `pistolRounds` from version 2, else the side's buy.
 */
export function isPistol(doc: MatchDoc, r: MatchRound, side: Side): boolean {
  return doc.pistolRounds ? doc.pistolRounds.includes(r.number) : r.buy[side] === 'pistol';
}

/**
 * The score per team in each half and in overtime. A half is `halfLength`
 * rounds (12 by default, MR12): the first half, the second, and anything
 * after both is overtime (`overtime` is how many rounds of it were played),
 * which is no half's. A draw is no team's.
 */
export function halves(doc: MatchDoc): {
  first: Record<string, number>;
  second: Record<string, number>;
  overtime: Record<string, number>;
  overtimeRounds: number;
} {
  const first: Record<string, number> = {};
  const second: Record<string, number> = {};
  const overtime: Record<string, number> = {};
  for (const t of doc.teams) {
    first[t] = 0;
    second[t] = 0;
    overtime[t] = 0;
  }
  let overtimeRounds = 0;
  const h = halfLength(doc);
  for (const r of doc.rounds) {
    const into = r.number <= h ? first : r.number <= 2 * h ? second : overtime;
    if (r.number > 2 * h) overtimeRounds++;
    if (r.winnerTeam) into[r.winnerTeam] = (into[r.winnerTeam] ?? 0) + 1;
  }
  return { first, second, overtime, overtimeRounds };
}

export interface Rate {
  played: number;
  won: number;
}

export function pct(r: Rate): number {
  return r.played ? (100 * r.won) / r.played : Number.NaN;
}

export interface Aggregate {
  matches: number;
  rounds: number;
  maps: string[];
  /** Rounds each side won. */
  sides: Record<Side, Rate>;
  pistol: Record<Side, Rate>;
  /** Per side and buy: rounds played with it and won. */
  buys: Record<Side, Record<string, Rate>>;
  /** Plants per known site, and how many of those rounds the Ts went on to win. */
  sites: Record<string, Rate>;
  /** Plants on a site the demo did not say, and how many of those rounds the Ts won. */
  unknownSite: Rate;
  /** Rounds no side won. */
  draws: number;
  /** How rounds ended. */
  reasons: Record<string, number>;
  /** Opening duels by where the victim was: how many, and how many the Ts won. */
  openings: { place: string; duels: number; tWon: number }[];
  /** Opening duel winners: the side that took the first kill, and how often that side won the round. */
  openingConverted: Rate;
  players: AggregatePlayer[];
}

export interface AggregatePlayer {
  name: string;
  steamid: string;
  team: string;
  matches: number;
  rounds: number;
  kills: number;
  deaths: number;
  adr: number;
  kast: number;
  headshotPct: number;
  openingKills: number;
  openingDeaths: number;
  clutchesWon: number;
  clutches: number;
}

const rate = (): Rate => ({ played: 0, won: 0 });

/** What a set of matches says together: side balance, economy, sites, openings, players. */
export function aggregate(docs: MatchDoc[]): Aggregate {
  const out: Aggregate = {
    matches: docs.length,
    rounds: 0,
    maps: [...new Set(docs.map((d) => d.map))].sort(),
    sides: { T: rate(), CT: rate() },
    pistol: { T: rate(), CT: rate() },
    buys: { T: {}, CT: {} },
    sites: {},
    unknownSite: rate(),
    draws: 0,
    reasons: {},
    openings: [],
    openingConverted: rate(),
    players: [],
  };
  const openings = new Map<string, { duels: number; tWon: number }>();
  const players = new Map<string, AggregatePlayer & { headshots: number; damage: number; kastRounds: number }>();
  for (const doc of docs) {
    for (const r of doc.rounds) {
      out.rounds++;
      // A draw is played by both sides and won by neither.
      if (isDraw(r)) out.draws++;
      for (const side of ['T', 'CT'] as const) {
        out.sides[side].played++;
        if (r.winner === side) out.sides[side].won++;
        const buy = r.buy[side];
        if (isPistol(doc, r, side)) {
          out.pistol[side].played++;
          if (r.winner === side) out.pistol[side].won++;
        } else if (buy && buy !== 'pistol') {
          const b = (out.buys[side][buy] ??= rate());
          b.played++;
          if (r.winner === side) b.won++;
        }
      }
      out.reasons[r.reason] = (out.reasons[r.reason] ?? 0) + 1;
      if (r.plant) {
        const site = plantSite(r);
        const s = site ? (out.sites[site] ??= rate()) : out.unknownSite;
        s.played++;
        if (r.winner === 'T') s.won++;
      }
      const first = r.kills.find((k) => k.opening && !isSuicide(k));
      if (first) {
        const o = openings.get(first.place) ?? { duels: 0, tWon: 0 };
        o.duels++;
        if (first.attackerSide === 'T') o.tWon++;
        openings.set(first.place, o);
        out.openingConverted.played++;
        // A drawn round converts nobody's opening.
        if (first.attackerSide && first.attackerSide === r.winner) out.openingConverted.won++;
      }
    }
    for (const p of doc.players) {
      const a =
        players.get(p.steamid) ??
        {
          name: p.name,
          steamid: p.steamid,
          team: p.team,
          matches: 0,
          rounds: 0,
          kills: 0,
          deaths: 0,
          adr: 0,
          kast: 0,
          headshotPct: 0,
          openingKills: 0,
          openingDeaths: 0,
          clutchesWon: 0,
          clutches: 0,
          headshots: 0,
          damage: 0,
          kastRounds: 0,
        };
      a.name = p.name;
      a.matches++;
      a.rounds += p.roundsPlayed;
      a.kills += p.kills;
      a.deaths += p.deaths;
      a.headshots += (p.headshotPct / 100) * p.kills;
      a.damage += p.adr * p.roundsPlayed;
      a.kastRounds += (p.kast / 100) * p.roundsPlayed;
      a.openingKills += p.openingKills;
      a.openingDeaths += p.openingDeaths;
      a.clutches += p.clutches;
      a.clutchesWon += p.clutchesWon;
      players.set(p.steamid, a);
    }
  }
  out.openings = [...openings.entries()]
    .map(([place, o]) => ({ place, ...o }))
    .sort((a, b) => b.duels - a.duels);
  out.players = [...players.values()]
    .map(({ headshots, damage, kastRounds, ...p }) => ({
      ...p,
      adr: p.rounds ? damage / p.rounds : 0,
      kast: p.rounds ? (100 * kastRounds) / p.rounds : 0,
      headshotPct: p.kills ? (100 * headshots) / p.kills : 0,
    }))
    .sort((a, b) => b.kills - b.deaths - (a.kills - a.deaths));
  return out;
}

/** "BombsiteA" -> "Bombsite A", "TopofMid" -> "Top of Mid": the game's place names, readable. */
export function placeName(place: string): string {
  if (!place) return '—';
  return place.replace(/([a-z])of([A-Z])/g, '$1 of $2').replace(/([a-z])([A-Z])/g, '$1 $2');
}
