/**
 * A level layout's spawn points one by one (`<Level>.layouts.json`, see
 * `levelLayouts.ts`), for the spawn display: where each is, which way it
 * faces, whose it is and when it can be used.
 *
 * A spawn entry of any layout file:
 *
 *     { "type": "spawn" | "vehicle_spawn", "team": 1, "position": [x, y, z],
 *       "heading": 270, "stage": 2, "stages": [2, 3],
 *       "base": "C", "baseId": "C", "baseSource": "link" | "channel" | "prefab" | "nearest",
 *       "rule": "flag" | "hq" | "stage" | "team" | "free",
 *       "vehicle": "m1abrams", "vehicleClass": "tank_mbt", "vehicleKind": "tank" }
 *
 * Everything but the position may be missing: a layout of another game
 * (`team` and `position` only) still draws. `rule` says when the spawn can be
 * used: `flag` while its team (or, without one, whoever) holds the capture
 * point `baseId` names; `hq` always; `stage` in its stage; `team` always, for
 * its team; `free` by anyone. Without `rule`, a spawn with a `baseId` of a
 * capture point is `flag`, one of a base `hq`, else `team` or `free`.
 */

import type { Vec3 } from './objectives';

/** The vehicle kinds the markers draw a glyph for, in the shaders' order (0: none or unknown). */
export const VEHICLE_KINDS = ['', 'tank', 'jet', 'helicopter', 'boat', 'stationary', 'car', 'horse', 'plane'] as const;
export type VehicleKind = (typeof VEHICLE_KINDS)[number];

export type SpawnRule = 'flag' | 'hq' | 'stage' | 'team' | 'free';

export interface SpawnPoint {
  position: Vec3;
  /** Degrees from +z towards +x (a map's north, clockwise), or null where the file has none. */
  heading: number | null;
  team: number | null;
  vehicle: boolean;
  /** Index into `VEHICLE_KINDS`. */
  kind: number;
  /** The vehicle's own name or its spawner's class, for a tooltip. */
  vehicleName: string;
  /** The owner's id (an objective's `id`, else its letter or name); '' for none. */
  owner: string;
  /** How the owner is known: from the game's own links, or only by being nearest. */
  ownerSource: string;
  rule: SpawnRule;
  stage: number | null;
  stages: number[];
}

/** An objective spawns can belong to: a capture point or a base, by id. */
export interface SpawnOwner {
  id: string;
  letter: string;
  name: string;
  type: string;
  team: number | null;
  position: Vec3;
  stage: number | null;
  /** Who holds it when the round starts (Breakthrough's held sectors); 0 nobody. */
  start: number;
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const vec = (v: unknown): Vec3 | null =>
  Array.isArray(v) && v.length >= 3 && v.slice(0, 3).every((x) => typeof x === 'number' && Number.isFinite(x)) ? [v[0], v[1], v[2]] : null;

/** What other games' layouts call a spawn's vehicle in its `vehicle` field, as a kind. */
const KIND_WORDS: Record<string, VehicleKind> = {
  ground: 'tank', tank: 'tank', armor: 'tank', armour: 'tank',
  air: 'plane', aircraft: 'plane', plane: 'plane', jet: 'jet', fighter: 'jet',
  heli: 'helicopter', helicopter: 'helicopter',
  naval: 'boat', ship: 'boat', boat: 'boat',
  convoy: 'car', car: 'car', truck: 'car',
};

/** A vehicle kind from what a file says (`tank`, `heli`, `tank_mbt`...); 0 when it says nothing known. */
export function vehicleKindIndex(kind: string, cls = ''): number {
  const k = (kind || cls).toLowerCase();
  if (!k) return 0;
  const exact = VEHICLE_KINDS.indexOf(k as VehicleKind);
  if (exact > 0) return exact;
  if (/heli/.test(k)) return 3;
  if (/jet|fighter|attack_air/.test(k)) return 2;
  if (/plane|bomber|air/.test(k)) return 8;
  if (/boat|ship|pwc|jetski/.test(k)) return 4;
  if (/static|stationary|mg|aa|tow|gun|mortar/.test(k)) return 5;
  if (/tank|mbt|ifv|apc|armou?r/.test(k)) return 1;
  if (/horse|cavalry/.test(k)) return 7;
  if (/car|jeep|truck|quad|bike|buggy|mrap/.test(k)) return 6;
  return 0;
}

/** The objectives of a layout spawns can name as their owner, by id (and by letter or name as a fallback). */
export function spawnOwners(objectives: Record<string, unknown>[]): Map<string, SpawnOwner> {
  const out = new Map<string, SpawnOwner>();
  for (const o of objectives) {
    const type = str(o.type);
    if (type !== 'capture_zone' && type !== 'base') continue;
    const position = vec(o.position);
    if (!position) continue;
    const owner: SpawnOwner = {
      id: str(o.id) || str(o.letter) || str(o.name),
      letter: str(o.letter),
      name: str(o.name),
      type,
      team: num(o.team),
      position,
      stage: num(o.stage),
      start: num(o.ownerAtStart) ?? 0,
    };
    if (owner.id && !out.has(owner.id)) out.set(owner.id, owner);
  }
  return out;
}

/** The spawn points of a layout's rows; those without a position are left out. */
export function parseSpawnPoints(rows: Record<string, unknown>[], owners: Map<string, SpawnOwner>): SpawnPoint[] {
  const byLetter = new Map<string, SpawnOwner>();
  for (const o of owners.values()) for (const k of [o.letter, o.name]) if (k && !byLetter.has(k)) byLetter.set(k, o);
  const out: SpawnPoint[] = [];
  for (const s of rows) {
    const position = vec(s.position);
    if (!position) continue;
    // A kind word in `vehicle` (War Thunder's `ground`, `aircraft`, `ship`...) makes a spawn a vehicle's of that kind.
    const word = KIND_WORDS[str(s.vehicle).toLowerCase()];
    const vehicle = str(s.type) === 'vehicle_spawn' || !!word;
    const idOrBase = str(s.baseId) || str(s.base);
    const owner = owners.get(idOrBase) ?? byLetter.get(str(s.base));
    const team = num(s.team);
    const stage = num(s.stage);
    const given = str(s.rule) as SpawnRule;
    const rule: SpawnRule = ['flag', 'hq', 'stage', 'team', 'free'].includes(given)
      ? given
      : owner?.type === 'capture_zone'
        ? 'flag'
        : owner
          ? 'hq'
          : stage !== null
            ? 'stage'
            : team
              ? 'team'
              : 'free';
    out.push({
      position,
      heading: num(s.heading),
      team: team && team > 0 ? team : null,
      vehicle,
      kind: vehicle ? vehicleKindIndex(str(s.vehicleKind)) || (word ? VEHICLE_KINDS.indexOf(word) : 0) || vehicleKindIndex('', str(s.vehicleClass) || str(s.vehicle)) : 0,
      vehicleName: str(s.vehicle) || str(s.vehicleClass),
      owner: owner?.id ?? '',
      ownerSource: str(s.baseSource),
      rule,
      stage,
      stages: Array.isArray(s.stages) ? (s.stages as unknown[]).filter((x): x is number => typeof x === 'number') : stage !== null ? [stage] : [],
    });
  }
  return out;
}

/** Which spawn points are shown: by owner, team and stage; null for any. */
export interface SpawnFilter {
  owner: string | null;
  team: number | null;
  stage: number | null;
}

export function spawnShown(p: SpawnPoint, f: SpawnFilter): boolean {
  if (f.owner !== null && p.owner !== f.owner) return false;
  if (f.team !== null && p.team !== null && p.team !== f.team) return false;
  if (f.stage !== null && p.stages.length && !p.stages.includes(f.stage)) return false;
  return true;
}

/**
 * Whether a spawn can be used at the playhead, and by whom: a flag's while
 * its team holds the flag (a spawn of no team: whoever holds it, which is
 * then its colour); everything else always. `ownerOf` is the flag's holder
 * (0 nobody), or undefined where the replay says nothing of that flag.
 */
export function spawnState(p: SpawnPoint, ownerOf: (owner: string) => number | undefined): { active: boolean; team: number | null } {
  if (p.rule !== 'flag' || !p.owner) return { active: true, team: p.team };
  const held = ownerOf(p.owner);
  if (held === undefined) return { active: true, team: p.team };
  if (p.team !== null) return { active: held === p.team, team: p.team };
  return { active: held > 0, team: held > 0 ? held : null };
}
