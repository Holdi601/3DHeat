/**
 * A level's layouts: what each of its game modes is played over, from a map
 * extractor's `<Level>.layouts.json` beside the level (the Battlefield maps
 * tool's `layouts` verb writes them; any extractor may). One file a level:
 *
 *     { "format": "3dheat-layouts", "version": 1, "game": "battlefield-4",
 *       "level": "MP_Prison", "units": "m", "up": "y",
 *       "layouts": [ { "id": "ConquestLarge0", "name": "Conquest Large",
 *                      "mode": "ConquestLarge0", "aliases": [...],
 *                      "objectives": [...], "zones": [...], "spawns": [...] } ] }
 *
 * Objectives are capture zones (`capture_zone`, a letter, a radius or an
 * outline), headquarters and bases (`base`, a team), and the mode's other
 * objectives (`objective` with a `kind`: `mcom`, `telegraph`, `bomb_target`,
 * `bomb_site`, `flag`...). Zones are each team's play area (`play_area`, an
 * outline; outside it the team is out of bounds) and any `out_of_bounds`
 * area (an outline, drawn hatched; its team the side it is out of bounds for,
 * none for everyone). Spawns are points with a team, and the capture point (`base`) that
 * owns them where one does. Anything may carry a `stage` (Rush, Breakthrough):
 * a layout with stages is offered whole and a stage at a time, each named by
 * the layout's `stageNames` where it has them (`{ "1": "low ranks" }`).
 *
 * Positions are the level's own, the same frame as its model: the viewer
 * draws them where the level is, whatever axes the data has.
 */

import { layerOf, type Objective, type ObjectiveLayer, type Vec3 } from './objectives';
import { parseSpawnPoints, spawnOwners, type SpawnOwner, type SpawnPoint } from './layoutSpawns';

export const LAYOUTS_FILE = /\.layouts\.json$/i;

export function isLayoutsFile(name: string): boolean {
  return LAYOUTS_FILE.test(name);
}

export interface LevelLayout {
  /** The file's id, with `#<stage>` for one stage of it. */
  id: string;
  name: string;
  /** The game's own name for the mode (`ConquestLarge0`): what the data's mode column says. */
  mode: string;
  aliases: string[];
  stage: number | null;
  /** What the layout calls this stage (`low ranks`), where it says. */
  stageName?: string;
  objectives: Objective[];
  /** Every spawn point one by one (`layoutSpawns.ts`), for the spawn display. */
  spawnPoints: SpawnPoint[];
  /** The capture points and bases spawns belong to, by id. */
  spawnOwners: Map<string, SpawnOwner>;
}

export interface LevelLayouts {
  game: string;
  level: string;
  /** What the data calls each team number (`{ 1: 'T', 2: 'CT' }`), where it says. */
  teams?: Record<number, string>;
  layouts: LevelLayout[];
}

const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const vec = (v: unknown): Vec3 | null => (Array.isArray(v) && v.length >= 3 && v.slice(0, 3).every((x) => typeof x === 'number' && Number.isFinite(x)) ? [v[0], v[1], v[2]] : null);
const team = (v: unknown): number | null => (typeof v === 'number' && v > 0 ? v : null);

/** What a level layout's kinds of things are drawn as. */
function layerFor(type: string): ObjectiveLayer {
  if (type === 'play_area') return 'areas';
  if (type === 'out_of_bounds') return 'bounds';
  if (type === 'objective') return 'targets';
  return layerOf(type);
}

function objective(o: Record<string, unknown>, fallbackType: string): Objective | null {
  const type = str(o.type) || fallbackType;
  const points = Array.isArray(o.points) ? (o.points.map(vec).filter(Boolean) as Vec3[]) : [];
  let position = vec(o.position);
  if (!position && points.length) {
    const c: Vec3 = [0, 0, 0];
    for (const p of points) for (let i = 0; i < 3; i++) c[i] += p[i] / points.length;
    position = c;
  }
  if (!position) return null;
  const radius = num(o.radius);
  return {
    type,
    layer: layerFor(type),
    team: team(o.team),
    name: str(o.name) || str(o.kind),
    letter: type === 'capture_zone' ? str(o.letter) || str(o.name) : '',
    shape: points.length > 2 ? 'outline' : radius > 0 ? 'cylinder' : str(o.shape) || 'point',
    position,
    radius,
    height: num(o.height),
    size: vec(o.size),
    heading: num(o.heading),
    points,
    used: null,
    ownerAtStart: num(o.ownerAtStart),
    site: '',
    active: [],
  };
}

/** Spawn points grouped by team, owner and stage: one ring each, as a replay's spawns are drawn. */
function spawnGroups(list: Record<string, unknown>[]): Objective[] {
  const groups = new Map<string, { o: Record<string, unknown>; pts: Vec3[] }>();
  for (const s of list) {
    const p = vec(s.position);
    if (!p) continue;
    const key = `${str(s.type) || 'spawn'}|${num(s.team)}|${str(s.base)}|${num(s.stage, -1)}`;
    const g = groups.get(key);
    if (g) g.pts.push(p);
    else groups.set(key, { o: s, pts: [p] });
  }
  const out: Objective[] = [];
  for (const { o, pts } of groups.values()) {
    const c: Vec3 = [0, 0, 0];
    for (const p of pts) for (let i = 0; i < 3; i++) c[i] += p[i] / pts.length;
    out.push({
      type: 'spawn',
      layer: 'spawns',
      team: team(o.team),
      name: str(o.base) || str(o.vehicle),
      letter: '',
      shape: 'points',
      position: c,
      radius: str(o.type) === 'vehicle_spawn' ? 8 : 4,
      height: 0,
      size: null,
      heading: 0,
      points: pts,
      used: null,
      ownerAtStart: 0,
      site: '',
      active: [],
    });
  }
  return out;
}

type Poly = Vec3[];

function inside(x: number, z: number, poly: Poly): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, , zi] = poly[i];
    const [xj, , zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
  }
  return hit;
}

/**
 * Each team's out-of-bounds ground as hatching: diagonal strokes over what is
 * inside some team's play area but outside every one of this team's (the
 * enemy's home ground). A play area that is everyone's has no such ground;
 * its outline is the edge. Strokes as pairs of points, in the level's frame.
 */
export function outOfBounds(areas: Objective[]): Objective[] {
  const teams = [...new Set(areas.filter((a) => a.team !== null).map((a) => a.team as number))];
  if (teams.length < 2) return [];
  const all = areas.filter((a) => a.team !== null).map((a) => a.points);
  let x0 = Infinity;
  let x1 = -Infinity;
  let z0 = Infinity;
  let z1 = -Infinity;
  let ySum = 0;
  let yN = 0;
  for (const poly of all)
    for (const [x, y, z] of poly) {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      z0 = Math.min(z0, z);
      z1 = Math.max(z1, z);
      ySum += y;
      yN++;
    }
  const y = yN ? ySum / yN : 0;
  const extent = Math.max(x1 - x0, z1 - z0);
  const step = Math.min(60, Math.max(6, extent / 90));
  const out: Objective[] = [];
  const r2 = Math.SQRT1_2;
  for (const t of teams) {
    const own = areas.filter((a) => a.team === t).map((a) => a.points);
    const pts: Vec3[] = [];
    // Strokes along u = (x + z) / sqrt 2, one every `step` of v = (x - z) / sqrt 2.
    const vs = [x0 - z1, x1 - z0].map((v) => v * r2);
    for (let v = vs[0] + step / 2; v < vs[1]; v += step) {
      const us: number[] = [];
      for (const poly of all)
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const va = (poly[j][0] - poly[j][2]) * r2;
          const vb = (poly[i][0] - poly[i][2]) * r2;
          if (va > v === vb > v) continue;
          const f = (v - va) / (vb - va);
          const ua = (poly[j][0] + poly[j][2]) * r2;
          const ub = (poly[i][0] + poly[i][2]) * r2;
          us.push(ua + (ub - ua) * f);
        }
      us.sort((a, b) => a - b);
      let start: number | null = null;
      for (let i = 0; i + 1 < us.length; i++) {
        const u = (us[i] + us[i + 1]) / 2;
        const x = (u + v) * r2;
        const z = (u - v) * r2;
        const hatched = all.some((p) => inside(x, z, p)) && !own.some((p) => inside(x, z, p));
        if (hatched && start === null) start = us[i];
        const ends = start !== null && (!hatched || i + 2 === us.length);
        if (ends) {
          const end = hatched ? us[i + 1] : us[i];
          if (end - start! > 0.5) pts.push([(start! + v) * r2, y, (start! - v) * r2], [(end + v) * r2, y, (end - v) * r2]);
          start = null;
        }
      }
    }
    if (!pts.length) continue;
    out.push({
      type: 'out_of_bounds',
      layer: 'bounds',
      team: t,
      name: '',
      letter: '',
      shape: 'hatch',
      position: [(x0 + x1) / 2, y, (z0 + z1) / 2],
      radius: 0,
      height: 0,
      size: null,
      heading: 0,
      points: pts,
      used: null,
      ownerAtStart: 0,
      site: '',
      active: [],
    });
  }
  return out;
}

/**
 * An out-of-bounds area given as an outline (ground a mission excludes, a
 * spawn's kill area) as hatching: diagonal strokes across the inside, as the
 * play areas' out of bounds are drawn, the outline's own edge where they end.
 */
export function hatchInside(o: Objective): Objective {
  const poly = o.points;
  let x0 = Infinity;
  let x1 = -Infinity;
  let z0 = Infinity;
  let z1 = -Infinity;
  let y = 0;
  for (const p of poly) {
    x0 = Math.min(x0, p[0]);
    x1 = Math.max(x1, p[0]);
    z0 = Math.min(z0, p[2]);
    z1 = Math.max(z1, p[2]);
    y += p[1] / poly.length;
  }
  const step = Math.min(60, Math.max(4, Math.max(x1 - x0, z1 - z0) / 12));
  const r2 = Math.SQRT1_2;
  const pts: Vec3[] = [];
  const [va0, va1] = [x0 - z1, x1 - z0].map((v) => v * r2);
  for (let v = va0 + step / 2; v < va1; v += step) {
    const us: number[] = [];
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const va = (poly[j][0] - poly[j][2]) * r2;
      const vb = (poly[i][0] - poly[i][2]) * r2;
      if (va > v === vb > v) continue;
      const f = (v - va) / (vb - va);
      const ua = (poly[j][0] + poly[j][2]) * r2;
      const ub = (poly[i][0] + poly[i][2]) * r2;
      us.push(ua + (ub - ua) * f);
    }
    us.sort((a, b) => a - b);
    // Even-odd: the stretches between the first and second crossing, the third and fourth...
    for (let i = 0; i + 1 < us.length; i += 2) {
      if (us[i + 1] - us[i] > 0.5) pts.push([(us[i] + v) * r2, y, (us[i] - v) * r2], [(us[i + 1] + v) * r2, y, (us[i + 1] - v) * r2]);
    }
  }
  // The edge too, as strokes: each side a pair of points.
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) pts.push(poly[j], poly[i]);
  return { ...o, shape: 'hatch', points: pts };
}

const stageOf = (o: Record<string, unknown>): number | null => (typeof o.stage === 'number' ? o.stage : null);

/** A `<Level>.layouts.json`'s layouts, each stage of a staged one also on its own; null when it is not one. */
export function parseLevelLayouts(doc: unknown): LevelLayouts | null {
  if (!doc || typeof doc !== 'object') return null;
  const d = doc as Record<string, unknown>;
  if (d.format !== '3dheat-layouts' || !Array.isArray(d.layouts)) return null;
  const layouts: LevelLayout[] = [];
  for (const l of d.layouts as Record<string, unknown>[]) {
    if (!l || typeof l !== 'object') continue;
    const id = str(l.id) || str(l.mode);
    if (!id) continue;
    const rows = (k: string) => (Array.isArray(l[k]) ? (l[k] as unknown[]).filter((x): x is Record<string, unknown> => !!x && typeof x === 'object') : []);
    const objectives = rows('objectives');
    const zones = rows('zones');
    const spawns = rows('spawns');
    const stageNames = l.stageNames && typeof l.stageNames === 'object' ? (l.stageNames as Record<string, unknown>) : {};
    const owners = spawnOwners(objectives);
    const make = (stage: number | null): LevelLayout => {
      const keep = (o: Record<string, unknown>) => stage === null || stageOf(o) === null || stageOf(o) === stage;
      const list: Objective[] = [];
      for (const o of objectives.filter(keep)) {
        const ob = objective(o, 'objective');
        if (ob) list.push(ob);
      }
      for (const z of zones.filter(keep)) {
        const ob = objective(z, 'play_area');
        if (ob && ob.points.length > 2) list.push(ob.type === 'out_of_bounds' ? hatchInside(ob) : ob);
      }
      list.push(...outOfBounds(list.filter((o) => o.type === 'play_area')));
      list.push(...spawnGroups(spawns.filter(keep)));
      return {
        id: stage === null ? id : `${id}#${stage}`,
        name: str(l.name) || id,
        mode: str(l.mode) || id,
        aliases: Array.isArray(l.aliases) ? (l.aliases as unknown[]).filter((a): a is string => typeof a === 'string') : [],
        stage,
        ...(stage !== null && str(stageNames[String(stage)]) ? { stageName: str(stageNames[String(stage)]) } : {}),
        objectives: list.sort((a, b) => (a.layer === 'zones' && b.layer === 'zones' ? a.letter.localeCompare(b.letter) : 0)),
        spawnPoints: parseSpawnPoints(spawns.filter(keep), owners),
        spawnOwners: owners,
      };
    };
    layouts.push(make(null));
    const stages = [...new Set([...objectives, ...zones, ...spawns].map(stageOf).filter((s): s is number => s !== null))].sort((a, b) => a - b);
    if (stages.length > 1) for (const s of stages) layouts.push(make(s));
  }
  const teams: Record<number, string> = {};
  if (d.teams && typeof d.teams === 'object')
    for (const [k, v] of Object.entries(d.teams as Record<string, unknown>)) if (Number(k) > 0 && typeof v === 'string') teams[Number(k)] = v;
  return { game: str(d.game), level: str(d.level), ...(Object.keys(teams).length ? { teams } : {}), layouts };
}

export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** The key a level's layouts are kept under: game and level, without case or punctuation. */
export function layoutsKey(game: string, level: string): string {
  return `${norm(game)}/${norm(level)}`;
}

/**
 * The layout a set of data is played in, from the modes its rows name
 * (`ConquestLarge0`, `Conquest Large`, `conquest`): the same name, an alias,
 * the menu name, then the first layout whose name starts the same way; the
 * first layout when nothing says. Stages are never picked by themselves.
 */
export function pickLayout(doc: LevelLayouts, modes: readonly string[]): LevelLayout | null {
  const whole = doc.layouts.filter((l) => l.stage === null);
  if (!whole.length) return null;
  const wanted = modes.map(norm).filter(Boolean);
  for (const w of wanted) {
    const hit = whole.find((l) => norm(l.mode) === w || norm(l.id) === w || norm(l.name) === w || l.aliases.some((a) => norm(a) === w));
    if (hit) return hit;
  }
  for (const w of wanted) {
    const bare = w.replace(/\d+$/, '');
    const hit = whole.find((l) => norm(l.mode).replace(/\d+$/, '') === bare || norm(l.name).startsWith(bare) || bare.startsWith(norm(l.name)));
    if (hit) return hit;
  }
  return whole[0];
}
