/**
 * A game's range catalogue built from the user's own installation: its
 * weapons' reach, its units' armament, sensors and sights, as the game itself
 * states them. A game's reader writes it (`heat3d-wt-ranges`,
 * `heat3d-dcs-maps ranges`) on the user's machine; the dev and preview
 * servers hand it out at `LOCAL_RANGES_ROUTE/<game>` from the `ranges` entry
 * of the git-ignored `tools/local-data.json` (vite.config.ts). Nothing of it
 * is in the repository.
 *
 * While installed its values win over the public catalogue's
 * (`data/games/<id>.json`): a data label naming one of its weapons exactly
 * (an id, a file name, the game's own display name), a unit whose vehicle it
 * lists (by the names the data writes) - that unit's armament, sensors and
 * sights. Everything else keeps the public figures; without a catalogue
 * nothing changes. Its entries are marked `src: 'local'` ("from your
 * installation").
 *
 * The file (`version` 1): `weapons` [{ id, cls, name, range [least, best,
 * most], shape, cone, elev, alt, los, labels, detail }], `sensors` { id:
 * { kind, name, range, az, el, rcsRef, modes, mount, detail } }, `units`
 * [{ names, weapons, sensors, optics [{ who, fov [widest, narrowest],
 * thermal, nv, mount }] }].
 */

import { GAMES, RANGES, readWeapon, type GameCatalogue, type RangeCatalogue, type WeaponRange } from './catalog';
import { readSensor, type SensorMount, type SensorSpec } from './sensors';

/** Where the dev and preview servers serve a game's local catalogue (404 when there is none). */
export const LOCAL_RANGES_ROUTE = '/__heat3d/ranges';

export interface LocalOptic {
  /** Whose sight: gunner, commander, driver, pilot, tgp. */
  who: string;
  /** Degrees across: widest, narrowest; null for a night sight without a zoom of its own. */
  fov: [number, number] | null;
  /** A thermal imager's generation (1-3; null not stated), null for none. */
  thermal: { gen: number | null } | null;
  /** An image intensifier. */
  nv: boolean;
  mount: SensorMount;
}

export interface LocalUnit {
  weapons: WeaponRange[];
  sensors: SensorSpec[];
  optics: LocalOptic[];
}

export interface LocalCatalogue {
  built: string;
  weapons: WeaponRange[];
  /** Weapons by every label the data may name them by, lower case. */
  labels: Map<string, WeaponRange>;
  /** Units by every name the data may write for them, lower case. */
  units: Map<string, LocalUnit>;
}

type Raw = Record<string, unknown>;
const NEVER = /(?!)/;
const SOURCE = 'your installation';

/** A local catalogue file's contents, checked; its weapons join `byId`. Null when it is not one. */
export function readLocal(raw: unknown, byId: Map<string, WeaponRange> = RANGES.byId): LocalCatalogue | null {
  const r = (raw ?? {}) as Raw;
  if (r.version !== 1 || typeof r.game !== 'string') return null;
  const weapons: WeaponRange[] = [];
  const labels = new Map<string, WeaponRange>();
  const ids = new Map<string, WeaponRange>();
  for (const x of Array.isArray(r.weapons) ? (r.weapons as Raw[]) : []) {
    const w = readWeapon({ ...x, src: 'local', source: SOURCE, match: [] });
    if (!w) continue;
    w.game = r.game;
    weapons.push(w);
    ids.set(w.id, w);
    byId.set(w.id, w);
    for (const l of [w.id, w.name, ...(Array.isArray(x.labels) ? x.labels : [])]) if (typeof l === 'string' && l.trim()) labels.set(l.trim().toLowerCase(), w);
  }
  const sensors = new Map<string, SensorSpec>();
  for (const [id, x] of Object.entries((r.sensors ?? {}) as Record<string, Raw>)) {
    const s = x && typeof x === 'object' ? readSensor({ ...x, id, src: 'local', source: SOURCE }, NEVER) : null;
    if (s) sensors.set(id, s);
  }
  const units = new Map<string, LocalUnit>();
  for (const u of Array.isArray(r.units) ? (r.units as Raw[]) : []) {
    const names = (Array.isArray(u.names) ? u.names : []).filter((n): n is string => typeof n === 'string' && !!n.trim());
    if (!names.length) continue;
    const unit: LocalUnit = {
      weapons: (Array.isArray(u.weapons) ? u.weapons : []).map((id) => ids.get(id as string)).filter((w): w is WeaponRange => !!w),
      sensors: (Array.isArray(u.sensors) ? u.sensors : []).map((id) => sensors.get(id as string)).filter((s): s is SensorSpec => !!s),
      optics: (Array.isArray(u.optics) ? (u.optics as Raw[]) : []).map(readOptic),
    };
    for (const n of names) if (!units.has(n.trim().toLowerCase())) units.set(n.trim().toLowerCase(), unit);
  }
  return { built: typeof r.built === 'string' ? r.built : '', weapons, labels, units };
}

function readOptic(o: Raw): LocalOptic {
  const f = Array.isArray(o.fov) && o.fov.length === 2 && o.fov.every((x) => typeof x === 'number' && x > 0) ? (o.fov as [number, number]) : null;
  const th = o.thermal && typeof o.thermal === 'object' ? (o.thermal as Raw) : null;
  return {
    who: typeof o.who === 'string' ? o.who : 'gunner',
    fov: f ? [Math.max(f[0], f[1]), Math.min(f[0], f[1])] : null,
    thermal: th ? { gen: typeof th.gen === 'number' ? th.gen : null } : null,
    nv: o.nv === true,
    mount: o.mount === 'turret' || o.mount === 'gun' ? o.mount : 'hull',
  };
}

/** Installs a local catalogue on its game (made when the public catalogue has none); returns the game's id, or null. */
export function installLocal(raw: unknown, games: Map<string, GameCatalogue> = GAMES, cat: RangeCatalogue = RANGES): string | null {
  const local = readLocal(raw, cat.byId);
  if (!local) return null;
  const id = (raw as Raw).game as string;
  let g = games.get(id);
  if (!g) {
    g = { id, name: typeof (raw as Raw).name === 'string' ? ((raw as Raw).name as string) : id, weapons: [], vehicles: [], fov: null, sensors: [], estimates: [], local: null };
    games.set(id, g);
  }
  g.local = local;
  return id;
}

/** The unit's gunner sight from its local catalogue, degrees across [widest, narrowest]; null where it has none. */
export function localSight(game: GameCatalogue | null, vehicle: string, figure: string | null): [number, number] | null {
  if (!game?.local) return null;
  const u = game.local.units.get(vehicle.trim().toLowerCase()) ?? (figure ? game.local.units.get(figure.replace(/@.*$/, '').toLowerCase()) : undefined);
  return u?.optics.find((o) => o.fov && (o.who === 'gunner' || o.who === 'pilot'))?.fov ?? null;
}

/** Fetches and installs every game's local catalogue the local server has (the games of the public catalogue). */
export async function loadLocalRanges(games: Map<string, GameCatalogue> = GAMES): Promise<string[]> {
  if (typeof fetch === 'undefined' || typeof location === 'undefined') return [];
  const out: string[] = [];
  await Promise.all(
    [...games.keys()].map(async (id) => {
      try {
        const res = await fetch(`${LOCAL_RANGES_ROUTE}/${id}`);
        if (!res.ok) return;
        const got = installLocal(await res.json(), games);
        if (got) out.push(got);
      } catch {
        // No local catalogue (or a broken one): the public figures stay.
      }
    }),
  );
  return out;
}

/** The local catalogues, once loaded (the range layer asks again for the game when they arrive). */
export const localRangesReady: Promise<string[]> = loadLocalRanges();
