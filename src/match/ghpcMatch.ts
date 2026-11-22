/**
 * A Gunner, HEAT, PC! mission's match document (`<match>.match.json` in the
 * file the recorder mod writes, format `heat3d-ghpc-match`), as the match tab's
 * scoreboard and kill feed: every unit a line, its side, its vehicle, its kills.
 */

import type { GameKill, GameMatch, GamePlayer } from './wtMatch';

const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const s = (v: unknown) => (typeof v === 'string' ? v : v === null || v === undefined ? '' : String(v));

export function isGhpcMatch(j: unknown): boolean {
  return !!j && typeof j === 'object' && (j as { format?: unknown }).format === 'heat3d-ghpc-match';
}

export function parseGhpcMatch(j: Record<string, unknown>): GameMatch {
  const units = (Array.isArray(j.units) ? j.units : []) as Record<string, unknown>[];
  const kills: GameKill[] = (Array.isArray(j.kills) ? j.kills : []).map((k: Record<string, unknown>) => ({
    time: n(k.time),
    killer: s(k.killer),
    killerVehicle: s(k.killerVehicle),
    victim: s(k.victim),
    victimVehicle: s(k.victimVehicle),
    weapon: s(k.ammoName) || s(k.weapon),
    weaponName: s(k.weaponName),
    victimUid: typeof k.victimUid === 'number' ? k.victimUid : null,
    crash: false,
  }));
  kills.sort((a, b) => a.time - b.time);
  const killsBy = new Map<string, number>();
  for (const k of kills) if (k.killer) killsBy.set(k.killer, (killsBy.get(k.killer) ?? 0) + 1);
  const players: GamePlayer[] = units
    .filter((u) => s(u.name).trim())
    .map((u) => ({
      name: s(u.name),
      team: s(u.team),
      clan: '',
      vehicles: [s(u.vehicleName) || s(u.vehicle)].filter(Boolean),
      air: 0,
      ground: killsBy.get(s(u.name)) ?? 0,
      naval: 0,
      assists: 0,
      deaths: u.out === true ? 1 : 0,
      score: 0,
    }));
  const unitNames = new Map<number, string>();
  for (const u of units) if (typeof u.uid === 'number') unitNames.set(u.uid, s(u.vehicleName) || s(u.vehicle) || s(u.name));
  const me = units.find((u) => u.isPlayer === true);
  return {
    game: 'ghpc',
    match: s(j.match),
    map: s(j.map),
    mission: s(j.missionTitle) || s(j.mission),
    battleClass: 'mission',
    started: s(j.started),
    duration: n(j.timePlayed),
    author: me ? s(me.name) : '',
    teams: [...new Set(players.map((p) => p.team).filter(Boolean))].sort(),
    players,
    kills,
    unitNames,
  };
}
