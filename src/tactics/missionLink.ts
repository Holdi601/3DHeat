/**
 * What a plan keeps of the mission file it was made from (`Plan.mission`):
 * which file and map, the mission's start time, date and weather, and which
 * of the plan's figures are which unit of which group in the file. A writer
 * (`missions/dcsWrite.ts`) patches the file by it: a group whose figures,
 * route and tasks are as they came in is left as it was, a changed one is
 * changed in place, a figure no group holds becomes a new group, a group
 * whose figures were all taken off the board is taken out.
 *
 * Plain data saved with the plan, so a plan opened again still knows its
 * mission; the file's bytes themselves are not kept in it.
 */

export interface MissionWeather {
  /** The editor's preset name, when it has one. */
  preset?: string;
  /** Degrees Celsius at sea level. */
  temperature?: number;
  /** Wind at the ground: metres a second, and the direction it blows from, degrees. */
  windSpeed?: number;
  windFrom?: number;
  /** Cloud base, metres, and density 0-10. */
  cloudBase?: number;
  cloudDensity?: number;
  /** Metres. */
  visibility?: number;
  /** Millimetres of mercury, as DCS keeps it. */
  qnh?: number;
  fog?: boolean;
}

export interface MissionInfo {
  /** Seconds after midnight the mission starts. */
  start?: number;
  date?: { year: number; month: number; day: number };
  weather?: MissionWeather;
  /** The briefing's text and the sortie name, where the file has them. */
  description?: string;
  sortie?: string;
}

export interface PlanMissionUnit {
  /** The plan's figure. */
  figure: string;
  /** The unit's id in the file. */
  ref: string;
  /** The game's type name, and the figure it was drawn as when read: a figure since changed to another kind gets a type of its own. */
  type: string;
  kind: string;
  skill?: string;
}

export interface PlanMissionGroup {
  /** The group's id in the file. */
  ref: string;
  name: string;
  side: string;
  category: string;
  country?: string;
  /** Lead first. */
  units: PlanMissionUnit[];
  /** The plan task that stands for the group's own task from the start, when it has one. */
  mainTask?: string;
}

export interface PlanMission {
  /** The reader's id (`dcs-miz`, `wt-blk`). */
  format: string;
  /** The file's name. */
  source: string;
  /** The map it is set on, as the game names it (a DCS theatre, a War Thunder level). */
  map: string;
  info?: MissionInfo;
  /** The layer the mission's places (airbases, zones, bullseyes) were put on. */
  placesLayer?: string;
  groups: PlanMissionGroup[];
}

const str = (x: unknown) => (typeof x === 'string' ? x : '');
const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : undefined);

function readInfo(x: unknown): MissionInfo | undefined {
  if (!x || typeof x !== 'object') return undefined;
  const i = x as MissionInfo;
  const out: MissionInfo = {};
  if (num(i.start) !== undefined) out.start = num(i.start);
  if (i.date && typeof i.date === 'object' && num(i.date.year) && num(i.date.month) && num(i.date.day)) out.date = { year: i.date.year, month: i.date.month, day: i.date.day };
  if (i.weather && typeof i.weather === 'object') {
    const w: MissionWeather = {};
    for (const k of ['temperature', 'windSpeed', 'windFrom', 'cloudBase', 'cloudDensity', 'visibility', 'qnh'] as const) if (num(i.weather[k]) !== undefined) w[k] = num(i.weather[k]);
    if (str(i.weather.preset)) w.preset = str(i.weather.preset);
    if (i.weather.fog === true) w.fog = true;
    out.weather = w;
  }
  if (str(i.description)) out.description = str(i.description);
  if (str(i.sortie)) out.sortie = str(i.sortie);
  return out;
}

/** A saved plan's mission as this viewer keeps it; undefined for anything that is not one. */
export function readPlanMission(x: unknown): PlanMission | undefined {
  if (!x || typeof x !== 'object') return undefined;
  const m = x as PlanMission;
  if (!str(m.format)) return undefined;
  const groups = (Array.isArray(m.groups) ? m.groups : [])
    .filter((g) => g && typeof g === 'object' && str(g.ref))
    .map((g) => ({
      ref: str(g.ref),
      name: str(g.name),
      side: str(g.side),
      category: str(g.category),
      ...(str(g.country) ? { country: str(g.country) } : {}),
      units: (Array.isArray(g.units) ? g.units : [])
        .filter((u) => u && typeof u === 'object' && str(u.figure))
        .map((u) => ({ figure: str(u.figure), ref: str(u.ref), type: str(u.type), kind: str(u.kind), ...(str(u.skill) ? { skill: str(u.skill) } : {}) })),
      ...(str(g.mainTask) ? { mainTask: str(g.mainTask) } : {}),
    }));
  const info = readInfo(m.info);
  return {
    format: str(m.format),
    source: str(m.source),
    map: str(m.map),
    ...(info ? { info } : {}),
    ...(str(m.placesLayer) ? { placesLayer: str(m.placesLayer) } : {}),
    groups,
  };
}
