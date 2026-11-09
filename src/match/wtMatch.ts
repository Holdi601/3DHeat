/**
 * A War Thunder replay's match summary (`<match>.match.json`, written by the
 * War Thunder replay converter beside its table): the battle, the players'
 * results and the kills, for the match tab's scoreboard and kill feed.
 */

import { battleMode, parseObjectives, type Objective } from './objectives';

export interface GamePlayer {
  name: string;
  team: string;
  clan: string;
  vehicles: string[];
  air: number;
  ground: number;
  naval: number;
  assists: number;
  deaths: number;
  score: number;
}

export interface GameKill {
  time: number;
  killer: string;
  killerVehicle: string;
  victim: string;
  victimVehicle: string;
  weapon: string;
  /** The weapon's name as the game says it (localised by the converter), '' when the summary has none. */
  weaponName: string;
  victimUid: number | null;
  crash: boolean;
}

export interface GameMatch {
  game: 'warthunder';
  match: string;
  map: string;
  mission: string;
  battleClass: string;
  started: string;
  duration: number;
  author: string;
  teams: string[];
  players: GamePlayer[];
  kills: GameKill[];
  /** Every unit's display name by its id, those without a track too (bunkers, guns). */
  unitNames: Map<number, string>;
  /** The battle's mode ("Conq1", "Dom"; '' when unknown) and its name ("Conquest #1"). */
  mode?: string;
  modeName?: string;
  /** What the battle is fought over (`objectives.ts`); empty for a summary without. */
  objectives?: Objective[];
}

const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const s = (v: unknown) => (typeof v === 'string' ? v : v === null || v === undefined ? '' : String(v));

/** Whether parsed JSON is a War Thunder match summary. */
export function isWtMatch(j: unknown): boolean {
  return !!j && typeof j === 'object' && (j as { format?: unknown }).format === 'heat3d-wt-replay-match';
}

/** The summary from its parsed JSON. */
export function parseWtMatch(j: Record<string, unknown>): GameMatch {
  const players = (Array.isArray(j.players) ? j.players : []).filter((p: Record<string, unknown>) => s(p?.name).trim()).map((p: Record<string, unknown>) => ({
    name: s(p.name),
    team: s(p.team),
    clan: s(p.clanTag),
    vehicles: Array.isArray(p.vehicles) ? p.vehicles.map(s) : [],
    air: n(p.kills) + n(p.aiKills),
    ground: n(p.groundKills) + n(p.aiGroundKills),
    naval: n(p.navalKills) + n(p.aiNavalKills),
    assists: n(p.assists),
    deaths: n(p.deaths),
    score: n(p.score),
  }));
  const kills = (Array.isArray(j.kills) ? j.kills : []).map((k: Record<string, unknown>) => ({
    time: n(k.time),
    killer: s(k.killer),
    killerVehicle: s(k.killerVehicle),
    victim: s(k.victim),
    victimVehicle: s(k.victimVehicle),
    weapon: s(k.weapon),
    weaponName: s(k.weaponName),
    victimUid: typeof k.victimUid === 'number' ? k.victimUid : null,
    crash: k.crash === true,
  }));
  kills.sort((a, b) => a.time - b.time);
  const teams = Array.isArray(j.teams) && j.teams.length ? j.teams.map(s) : [...new Set(players.map((p) => p.team))].sort();
  const unitNames = new Map<number, string>();
  for (const u of Array.isArray(j.units) ? j.units : []) {
    if (typeof u?.uid !== 'number') continue;
    const name = s(u.vehicleName) || s(u.vehicle);
    if (name) unitNames.set(u.uid, name);
  }
  return {
    unitNames,
    ...battleMode(j),
    objectives: parseObjectives(j.objectives),
    game: 'warthunder',
    match: s(j.match),
    map: s(j.map),
    mission: s(j.mission),
    battleClass: s(j.battleClass),
    started: s(j.started),
    duration: n(j.timePlayed) || n(j.replayEnd),
    author: s(j.author),
    teams,
    players,
    kills,
  };
}

/** A kill's weapon as people say it: its localised name where the summary has one, else the game's id. */
export function killWeapon(k: { weapon: string; weaponName?: string }): string {
  return k.weaponName?.trim() || k.weapon;
}
