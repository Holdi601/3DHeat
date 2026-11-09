/**
 * What a battle is fought over, from the War Thunder converter's match
 * document (`objectives`) and its sidecar `<match>.objectives.parquet`:
 * capture zones (where, how big, who holds them and how far a capture has
 * come at any moment), spawns with how many players began in each, airfields,
 * helipads and bases, the battle, kill and exit areas, bombing targets.
 *
 * Positions are the data's own, before the load's axis mapping: `toWorld`
 * puts them where the dataset's rows are. Teams are the replay's (1, 2; null
 * for both), owners 0 (nobody), 1 or 2; a capture's progress runs -100..100,
 * positive towards team 2.
 */

import type { AxisMapping } from '../state/types';

export type Vec3 = [number, number, number];

/** The layers the viewer shows or hides together. */
export type ObjectiveLayer = 'zones' | 'spawns' | 'airfields' | 'areas' | 'targets';
export const OBJECTIVE_LAYERS: readonly ObjectiveLayer[] = ['zones', 'spawns', 'airfields', 'areas', 'targets'];

export interface Objective {
  type: string;
  layer: ObjectiveLayer;
  /** 1 or 2 (the replay's), null for both or nobody. */
  team: number | null;
  name: string;
  /** A capture zone's letter, '' for the rest. */
  letter: string;
  shape: 'sphere' | 'cylinder' | 'box' | 'point' | 'points' | 'outline' | string;
  position: Vec3;
  radius: number;
  height: number;
  /** A box's extent (x, y, z), data units. */
  size: Vec3 | null;
  /** A box's heading, degrees. */
  heading: number;
  /** A `points` spawn's points, an `outline`'s corners. */
  points: Vec3[];
  /** How many players' tracks began in a spawn, null when not counted. */
  used: number | null;
  /** A capture zone's owner when the battle began. */
  ownerAtStart: number;
}

/** One zone's owner and progress over time, a step a change. */
export interface ZoneTimeline {
  zone: string;
  times: Float64Array;
  owner: Uint8Array;
  progress: Int8Array;
}

export interface CaptureEvent {
  time: number;
  zone: string;
  /** Who took it (captured), or who lost it (neutralised). */
  team: number;
  kind: 'captured' | 'neutralised';
}

/** A battle's capture zones over time. */
export interface ObjectiveTimeline {
  match: string;
  zones: Map<string, ZoneTimeline>;
  events: CaptureEvent[];
}

const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const str = (v: unknown) => (typeof v === 'string' ? v : v === null || v === undefined ? '' : String(v));
const vec = (v: unknown): Vec3 | null =>
  Array.isArray(v) && v.length >= 3 && v.slice(0, 3).every((x) => typeof x === 'number' && Number.isFinite(x)) ? [v[0], v[1], v[2]] : null;

export function layerOf(type: string): ObjectiveLayer {
  switch (type) {
    case 'capture_zone':
      return 'zones';
    case 'spawn':
    case 'convoy_spawn':
      return 'spawns';
    case 'airfield':
    case 'helipad':
    case 'base':
    case 'rearm_zone':
      return 'airfields';
    case 'bombing_target':
      return 'targets';
    default:
      return 'areas';
  }
}

/** The objectives of a match document's `objectives`; those without a place left out. */
export function parseObjectives(list: unknown): Objective[] {
  if (!Array.isArray(list)) return [];
  const out: Objective[] = [];
  for (const o of list as Record<string, unknown>[]) {
    if (!o || typeof o !== 'object') continue;
    const type = str(o.type);
    const points = Array.isArray(o.points) ? (o.points.map(vec).filter(Boolean) as Vec3[]) : [];
    let position = vec(o.position);
    if (!position && points.length) {
      const c: Vec3 = [0, 0, 0];
      for (const p of points) for (let i = 0; i < 3; i++) c[i] += p[i] / points.length;
      position = c;
    }
    if (!position) continue;
    const team = o.team === 1 || o.team === 2 ? o.team : typeof o.team === 'number' && o.team > 0 ? o.team : null;
    out.push({
      type,
      layer: layerOf(type),
      team,
      name: str(o.name),
      letter: type === 'capture_zone' ? str(o.letter) || str(o.name) : '',
      shape: str(o.shape) || 'point',
      position,
      radius: num(o.radius),
      height: num(o.height),
      size: vec(o.size),
      heading: num(o.heading),
      points,
      used: typeof o.used === 'number' ? o.used : null,
      ownerAtStart: num(o.ownerAtStart),
    });
  }
  // Zones in letter order, for the labels and the list.
  return out.sort((a, b) => (a.layer === 'zones' && b.layer === 'zones' ? a.letter.localeCompare(b.letter) : 0));
}

/** A row of the sidecar, as read. */
export interface ObjectiveRow {
  time: number;
  event: string;
  zone: string;
  /** NaN where the row does not say (a progress row). */
  owner: number;
  progress: number;
}

/** The zones' timelines and the capture events from the sidecar's rows (in any order). */
export function buildTimeline(match: string, rows: ObjectiveRow[]): ObjectiveTimeline {
  const byZone = new Map<string, ObjectiveRow[]>();
  for (const r of rows) {
    if (!r.zone || !Number.isFinite(r.time)) continue;
    const list = byZone.get(r.zone);
    if (list) list.push(r);
    else byZone.set(r.zone, [r]);
  }
  const zones = new Map<string, ZoneTimeline>();
  const events: CaptureEvent[] = [];
  for (const [zone, list] of byZone) {
    list.sort((a, b) => a.time - b.time);
    const n = list.length;
    const times = new Float64Array(n);
    const owner = new Uint8Array(n);
    const progress = new Int8Array(n);
    let o = 0;
    let p = 0;
    for (let i = 0; i < n; i++) {
      const r = list[i];
      const was = o;
      if (Number.isFinite(r.owner)) o = Math.max(0, Math.min(255, Math.round(r.owner)));
      if (Number.isFinite(r.progress)) p = Math.max(-100, Math.min(100, Math.round(r.progress)));
      times[i] = r.time;
      owner[i] = o;
      progress[i] = p;
      // An owner change is a capture (or a zone lost to nobody); the event rows say the same.
      if (o !== was && i > 0)
        events.push({
          time: r.time,
          zone,
          team: o || was,
          kind: o ? 'captured' : 'neutralised',
        });
      else if (i === 0 && o && /captured/i.test(r.event)) events.push({ time: r.time, zone, team: o, kind: 'captured' });
    }
    zones.set(zone, { zone, times, owner, progress });
  }
  events.sort((a, b) => a.time - b.time || a.zone.localeCompare(b.zone));
  return { match, zones, events };
}

/** A zone's owner and capture progress at `t` (replay seconds); before its first row, `start`'s owner and no progress. */
export function zoneAt(tl: ZoneTimeline | undefined, t: number, start = 0): { owner: number; progress: number } {
  if (!tl || !tl.times.length || t < tl.times[0]) return { owner: start, progress: 0 };
  let lo = 0;
  let hi = tl.times.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (tl.times[mid] <= t) lo = mid;
    else hi = mid - 1;
  }
  return { owner: tl.owner[lo], progress: tl.progress[lo] };
}

/** A data point (before the axis mapping) where the dataset's rows are: `remapAxesInPlace` for one point. */
export function toWorld(p: Vec3, axes: AxisMapping | null | undefined): Vec3 {
  if (!axes) return [p[0], p[1], p[2]];
  const s = axes.scale || 1;
  const x = p[0] * (axes.flipX ? -1 : 1) * s;
  const y = p[1] * (axes.flipY ? -1 : 1) * s;
  const z = p[2] * (axes.flipZ ? -1 : 1) * s;
  // A z-up source: its z is the height.
  return axes.up === 'z' ? [x, z, y] : [x, y, z];
}

/** The battle's mode from its match document: `battle.missionMode` ("Conq1", "Dom"), else the mission name's tail, else the file name's. */
export function battleMode(j: Record<string, unknown>): {
  mode: string;
  modeName: string;
} {
  const battle = (j.battle && typeof j.battle === 'object' ? j.battle : {}) as Record<string, unknown>;
  let mode = str(battle.missionMode);
  if (!mode) mode = /_([A-Za-z]+\d*)$/.exec(str(j.mission))?.[1] ?? '';
  if (!mode) mode = modeFromName(str(j.match));
  return { mode, modeName: str(battle.missionModeName) || mode };
}

/** A battle's mode from its file or match name: `<map>_<difficulty>_<Mode>_<date>...` ("Conq1", "Dom"); '' when it does not say. */
export function modeFromName(name: string): string {
  const m = /_(?:AB|RB|SB|EC|arcade|realistic|simulator)_([A-Za-z]+\d*)_\d{4}-\d{2}-\d{2}/i.exec(name);
  return m ? m[1] : '';
}
