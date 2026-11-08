/**
 * The match replay's Tacview-like extras: what the labels over the units say
 * and what a hover shows, the unit the camera follows and how, the unit whose
 * live data the card shows, a pair whose range, bearing and height difference
 * is drawn, the event list's filters, the chart's parameters - what a flight
 * debrief asks of a replay.
 *
 * The choices of what to show are the viewer's own and kept in this browser.
 */

import { DEFAULT_LOOK, readLook, type TacticalLook } from '../render/tacticalLook';
import { create } from 'zustand';
import type { UnitPrefs } from '../units/units';

/** What the labels over the units show (field ids, `fields.ts`), until the viewer chooses: height and speed where things fly. */
export const DEFAULT_LABEL_FIELDS = ['name', 'vehicle', 'alt', 'tas'];
export const DEFAULT_LABEL_FIELDS_GROUND = ['name', 'vehicle'];
/** What the selected unit's card shows. */
export const DEFAULT_CARD_FIELDS = ['vehicle', 'team', 'range', 'bearing', 'aspect', 'alt', 'agl', 'tas', 'ias', 'mach', 'gs', 'vs', 'heading', 'pitch', 'roll', 'aoa', 'g', 'turnRate', 'energy', 'throttle', 'rpm', 'fuel', 'health'];
export const DEFAULT_GRAPH = ['alt', 'tas'];

/** The units values are written in: the viewer's one choice for everything (`state/unitsStore.ts`). */
export type UnitSystem = UnitPrefs;
/**
 * How the camera follows a unit, as Tacview's views: chase turns with it,
 * orbit keeps its own direction, cockpit looks out of it (its attitude, the
 * horizon rolling), fixed sits at a place of its own around it that turns and
 * rolls with it (a wingtip, head-on), padlock looks from the cockpit at the
 * target, target looks past the unit at the target, satellite looks straight
 * down on it.
 */
export type FollowMode = 'chase' | 'orbit' | 'cockpit' | 'fixed' | 'padlock' | 'target' | 'satellite';
export const FOLLOW_MODES: FollowMode[] = ['chase', 'orbit', 'cockpit', 'fixed', 'padlock', 'target', 'satellite'];

/** Which units a display aid (velocity vectors, radar cones...) is drawn for. */
export type Scope = 'off' | 'selected' | 'all' | 'air' | 'ground' | 'sea' | 'weapon';
export const SCOPES: Scope[] = ['off', 'selected', 'all', 'air', 'ground', 'sea', 'weapon'];

/** What a label rule is for: a kind of object, AI units, or the units in question (followed, selected, target, measured). */
export type LabelCategory = 'selected' | 'air' | 'ground' | 'sea' | 'weapon' | 'ai';
export const LABEL_CATEGORIES: LabelCategory[] = ['selected', 'air', 'ground', 'sea', 'weapon', 'ai'];

export interface LabelRule {
  show: boolean;
  /** Null: the dataset's label fields (the "every unit" choice). */
  fields: string[] | null;
  /** 1 (last) to 5 (first): who gets the space when labels would cover each other. */
  priority: number;
}

export const DEFAULT_LABEL_RULES: Record<LabelCategory, LabelRule> = {
  selected: { show: true, fields: null, priority: 5 },
  air: { show: true, fields: null, priority: 4 },
  sea: { show: true, fields: null, priority: 3 },
  ground: { show: true, fields: null, priority: 2 },
  ai: { show: true, fields: null, priority: 2 },
  weapon: { show: false, fields: null, priority: 1 },
};

/** The tactical display aids: what is drawn for which units. */
export interface DisplayAids {
  /** The velocity vector: a line to where the unit is in `vectorSeconds` at its speed and course. */
  vectors: Scope;
  vectorSeconds: number;
  /** The path ahead: where the unit really goes in the next `vectorSeconds` (Tacview's anticipatory trail). */
  pathAhead: Scope;
  /** Nose (heading) and lift lines, as Tacview's selected-object vectors. */
  attitudeLines: Scope;
  /** Radar scan cones, from the recording's Radar* properties. */
  radar: Scope;
  /** Lines to locked and focused targets (LockedTarget, FocusedTarget, LockedTargetAzimuth...). */
  locks: Scope;
  /** Engagement domes (EngagementRange, VerticalEngagementRange). */
  engagement: Scope;
  /** The measured pair's line drawn red where the ground is between them. */
  lineOfSight: boolean;
  /** The pilot's line of sight, from head angles (PilotHeadYaw/Pitch) where the recording has them. */
  pilotSight: Scope;
  /** The locked target's name and range along each lock line. */
  lockLabels: boolean;
  /** Lines with ranges from each unit to every opponent within `engagementRange` (Tacview's multiple engagements). */
  engagements: Scope;
  /** Metres. */
  engagementRange: number;
  /** View cones from where players look (their view angles), with the team panel's look direction on. */
  look: Scope;
  /** The view cone's horizontal field of view, degrees; 0: a line of sight only. */
  lookFov: number;
  /** A line along each turret's gun, where the data has turret angles. */
  aim: Scope;
  /** The recording player's own camera, as a camera with its view, where the data has it. */
  camera: boolean;
}

export const DEFAULT_AIDS: DisplayAids = {
  vectors: 'selected',
  vectorSeconds: 10,
  pathAhead: 'off',
  attitudeLines: 'off',
  radar: 'all',
  locks: 'all',
  engagement: 'all',
  lineOfSight: true,
  pilotSight: 'selected',
  lockLabels: true,
  engagements: 'off',
  engagementRange: 20000,
  look: 'all',
  lookFov: 90,
  aim: 'all',
  camera: true,
};

/** The 2D tactical map: off, a picture in the corner, or over the whole view. */
export type MapView = 'off' | 'pip' | 'full';

/** The chart window: one unit's values over time, one value for several units, or one value against another. */
export type ChartKind = 'time' | 'compare' | 'xy';
/** What a time or compare chart runs along: time, or the distance flown through the air or over the ground. */
export type ChartAxis = 'time' | 'air' | 'ground';
export interface ChartSettings {
  open: boolean;
  kind: ChartKind;
  /** The value compared across units. */
  param: string;
  /** Value against value. */
  x: string;
  y: string;
  /** Units on the chart besides the followed, selected and target ones. */
  units: string[];
  xAxis: ChartAxis;
}
const DEFAULT_CHART: ChartSettings = { open: false, kind: 'compare', param: 'alt', x: 'tas', y: 'turnRate', units: [], xAxis: 'time' };

/** The grid over the view of a recording placed on the earth. */
export type GridKind = 'off' | 'latlon' | 'mgrs';
export interface GeoSettings {
  grid: GridKind;
  /** Headings written magnetic (WMM) where a heading is shown, and the compass with both norths. */
  magnetic: boolean;
  /** 3° glideslopes from the runway thresholds near the recording (OurAirports). */
  glideslope: boolean;
}
const DEFAULT_GEO: GeoSettings = { grid: 'off', magnetic: false, glideslope: false };

/** An altitude restriction: a floor and a ceiling (metres above sea level), events where a unit crosses one. */
export interface AltitudeLimits {
  on: boolean;
  floor: number | null;
  ceiling: number | null;
}
const DEFAULT_LIMITS: AltitudeLimits = { on: false, floor: null, ceiling: null };

interface Saved {
  labels: boolean;
  /** Null: the default for the data (`labelFieldsFor`). */
  labelFields: string[] | null;
  cardFields: string[];
  graph: string[];
  declutter: boolean;
  followMode: FollowMode;
  labelAi: boolean;
  /** The figure overlay's labels and event markers: off unless asked, there are too many. */
  overlayLabels: boolean;
  overlayMarkers: boolean;
  labelRules: Record<LabelCategory, LabelRule>;
  aids: DisplayAids;
  map: MapView;
  /** Seconds of trail behind each unit on the map. */
  mapTrail: number;
  mapNames: boolean;
  chart: ChartSettings;
  /** The cockpit view's head-up display. */
  hud: boolean;
  /** How big the labels over the units are, 1 as designed. */
  labelScale: number;
  /** Messages and comments of the recording (and chat) as subtitles. */
  subtitles: boolean;
  geo: GeoSettings;
  limits: AltitudeLimits;
  /** The match replay's buildings, where the level paints them: solid in their colours, or see-through shells as the heat views draw them. */
  buildings: 'solid' | 'seeThrough';
  /** The tactical display look (`render/tacticalLook.ts`): off unless asked. */
  look: TacticalLook;
}

const KEY = 'heat3d.replay';

function saved(): Saved {
  const fallback: Saved = {
    labels: true,
    labelFields: null,
    cardFields: DEFAULT_CARD_FIELDS,
    graph: DEFAULT_GRAPH,
    declutter: true,
    followMode: 'chase',
    labelAi: true,
    overlayLabels: false,
    overlayMarkers: false,
    labelRules: DEFAULT_LABEL_RULES,
    aids: DEFAULT_AIDS,
    map: 'off',
    mapTrail: 60,
    mapNames: true,
    chart: DEFAULT_CHART,
    hud: true,
    labelScale: 1,
    subtitles: true,
    geo: DEFAULT_GEO,
    limits: DEFAULT_LIMITS,
    buildings: 'solid',
    look: DEFAULT_LOOK,
  };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!v || typeof v !== 'object') return fallback;
    const strings = (a: unknown, d: string[]) => (Array.isArray(a) && a.every((x) => typeof x === 'string') ? (a as string[]) : d);
    return {
      labels: v.labels !== false,
      labelFields: Array.isArray(v.labelFields) ? strings(v.labelFields, []) : null,
      cardFields: strings(v.cardFields, fallback.cardFields),
      graph: strings(v.graph, fallback.graph),
      declutter: v.declutter !== false,
      followMode: FOLLOW_MODES.includes(v.followMode) ? v.followMode : 'chase',
      labelAi: v.labelAi !== false,
      overlayLabels: v.overlayLabels === true,
      overlayMarkers: v.overlayMarkers === true,
      labelRules: readRules(v.labelRules),
      aids: readAids(v.aids),
      map: v.map === 'pip' || v.map === 'full' ? v.map : 'off',
      mapTrail: typeof v.mapTrail === 'number' && v.mapTrail >= 0 ? Math.min(3600, v.mapTrail) : 60,
      mapNames: v.mapNames !== false,
      chart: readChart(v.chart),
      hud: v.hud !== false,
      labelScale: typeof v.labelScale === 'number' && v.labelScale >= 0.5 && v.labelScale <= 3 ? v.labelScale : 1,
      subtitles: v.subtitles !== false,
      geo: readGeo(v.geo),
      limits: readLimits(v.limits),
      buildings: v.buildings === 'seeThrough' ? 'seeThrough' : 'solid',
      look: readLook(v.look),
    };
  } catch {
    return fallback;
  }
}

const scopeOf = (v: unknown, d: Scope): Scope => (SCOPES.includes(v as Scope) ? (v as Scope) : d);

/** Saved label rules, each checked; what is missing or wrong is the default. */
export function readRules(v: unknown): Record<LabelCategory, LabelRule> {
  const out = { ...DEFAULT_LABEL_RULES };
  if (!v || typeof v !== 'object') return out;
  for (const c of LABEL_CATEGORIES) {
    const r = (v as Record<string, unknown>)[c] as Partial<LabelRule> | undefined;
    if (!r || typeof r !== 'object') continue;
    out[c] = {
      show: typeof r.show === 'boolean' ? r.show : DEFAULT_LABEL_RULES[c].show,
      fields: Array.isArray(r.fields) && r.fields.every((x) => typeof x === 'string') ? r.fields : null,
      priority: typeof r.priority === 'number' && r.priority >= 1 && r.priority <= 5 ? Math.round(r.priority) : DEFAULT_LABEL_RULES[c].priority,
    };
  }
  return out;
}

/** Saved display aids, each checked. */
export function readAids(v: unknown): DisplayAids {
  if (!v || typeof v !== 'object') return DEFAULT_AIDS;
  const a = v as Record<string, unknown>;
  const d = DEFAULT_AIDS;
  return {
    vectors: scopeOf(a.vectors, d.vectors),
    vectorSeconds: typeof a.vectorSeconds === 'number' && a.vectorSeconds > 0 ? Math.min(600, a.vectorSeconds) : d.vectorSeconds,
    pathAhead: scopeOf(a.pathAhead, d.pathAhead),
    attitudeLines: scopeOf(a.attitudeLines, d.attitudeLines),
    radar: scopeOf(a.radar, d.radar),
    locks: scopeOf(a.locks, d.locks),
    engagement: scopeOf(a.engagement, d.engagement),
    lineOfSight: a.lineOfSight !== false,
    pilotSight: scopeOf(a.pilotSight, d.pilotSight),
    lockLabels: a.lockLabels !== false,
    engagements: scopeOf(a.engagements, d.engagements),
    engagementRange: typeof a.engagementRange === 'number' && a.engagementRange > 0 ? Math.min(500000, a.engagementRange) : d.engagementRange,
    look: scopeOf(a.look, d.look),
    lookFov: typeof a.lookFov === 'number' && a.lookFov >= 0 ? Math.min(150, a.lookFov) : d.lookFov,
    aim: scopeOf(a.aim, d.aim),
    camera: a.camera !== false,
  };
}

/** Saved grid and compass settings, each checked. */
export function readGeo(v: unknown): GeoSettings {
  if (!v || typeof v !== 'object') return DEFAULT_GEO;
  const g = v as Record<string, unknown>;
  return {
    grid: g.grid === 'latlon' || g.grid === 'mgrs' ? g.grid : 'off',
    magnetic: g.magnetic === true,
    glideslope: g.glideslope === true,
  };
}

/** A saved altitude restriction, checked. */
export function readLimits(v: unknown): AltitudeLimits {
  if (!v || typeof v !== 'object') return DEFAULT_LIMITS;
  const l = v as Record<string, unknown>;
  const h = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
  return { on: l.on === true, floor: h(l.floor), ceiling: h(l.ceiling) };
}

function readChart(v: unknown): ChartSettings {
  if (!v || typeof v !== 'object') return DEFAULT_CHART;
  const c = v as Record<string, unknown>;
  const str = (x: unknown, d: string) => (typeof x === 'string' && x ? x : d);
  return {
    open: c.open === true,
    kind: c.kind === 'time' || c.kind === 'xy' ? c.kind : 'compare',
    param: str(c.param, DEFAULT_CHART.param),
    x: str(c.x, DEFAULT_CHART.x),
    y: str(c.y, DEFAULT_CHART.y),
    units: [],
    xAxis: c.xAxis === 'air' || c.xAxis === 'ground' ? c.xAxis : 'time',
  };
}

function store(s: Saved): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // No storage: the choice lasts this visit.
  }
}

interface ReplayState extends Saved {
  /** The person the camera follows, by person id; null for a free camera. */
  follow: number | null;
  /** The unit followed (`units.ts` key): the camera moves on to its next life when one ends. */
  followUnit: string | null;
  /** How far from the followed unit the camera sits, metres. */
  followDistance: number;
  /** The unit whose live data the card shows. */
  selected: string | null;
  /** Two persons whose range and bearing are drawn, from the first to the second. */
  pair: [number, number] | null;
  /** The first of a pair being picked. */
  pairFrom: number | null;
  /** A line from each live track down to the floor, so heights read in 3D; null leaves it to the data (`dropLinesOn`). */
  dropLines: boolean | null;
  /** The event list: kinds shown (null all), and one unit's only (null everyone's). */
  eventKinds: string[] | null;
  eventUnit: string | null;
  /** The figure overlay: which groups (null all), coloured how, only one player's. */
  overlay: { groups: number[] | null; colour: 'team' | 'group'; only: string | null };
  setOverlay: (p: Partial<ReplayState['overlay']>) => void;
  setDropLines: (on: boolean | null) => void;
  patchSaved: (p: Partial<Saved>) => void;
  /** Follow a unit (its live person `person`), or stop when it is the one followed. */
  toggleFollow: (person: number, unit?: string | null) => void;
  followTo: (person: number) => void;
  stopFollow: () => void;
  setFollowDistance: (d: number) => void;
  select: (unit: string | null) => void;
  /** Shift-click on a label: first the one to measure from, then the one to measure to; again clears. */
  pick: (person: number) => void;
  clearPair: () => void;
  setEventFilter: (p: { kinds?: string[] | null; unit?: string | null }) => void;
  /** The second unit of the padlock and target views (a unit key), and its live track. */
  target: string | null;
  targetPerson: number | null;
  setTarget: (unit: string | null) => void;
  /** Swap the followed unit and the target, as Tacview's swap button. */
  swapTarget: () => void;
  /** Stop playing at each event of the kinds the event list shows, as Tacview's "pause on event". */
  pauseOnEvent: boolean;
  /** Bumped to put the cockpit's look and the fixed camera's place back. */
  viewReset: number;
  resetView: () => void;
  setAids: (p: Partial<DisplayAids>) => void;
  setRule: (c: LabelCategory, p: Partial<LabelRule>) => void;
  setChart: (p: Partial<ChartSettings>) => void;
  setGeo: (p: Partial<GeoSettings>) => void;
  setLimits: (p: Partial<AltitudeLimits>) => void;
  setLook: (p: Partial<TacticalLook>) => void;
}

export const useReplayStore = create<ReplayState>((set, get) => {
  const keep = (p: Partial<Saved>) => {
    const s = { ...get(), ...p };
    store({
      labels: s.labels,
      labelFields: s.labelFields,
      cardFields: s.cardFields,
      graph: s.graph,
      declutter: s.declutter,
      followMode: s.followMode,
      labelAi: s.labelAi,
      overlayLabels: s.overlayLabels,
      overlayMarkers: s.overlayMarkers,
      labelRules: s.labelRules,
      aids: s.aids,
      map: s.map,
      mapTrail: s.mapTrail,
      mapNames: s.mapNames,
      // The units charted are of this recording only.
      chart: { ...s.chart, units: [] },
      hud: s.hud,
      labelScale: s.labelScale,
      subtitles: s.subtitles,
      geo: s.geo,
      limits: s.limits,
      buildings: s.buildings,
      look: s.look,
    });
    set(p);
  };
  return {
    ...saved(),
    follow: null,
    followUnit: null,
    followDistance: 60,
    selected: null,
    pair: null,
    pairFrom: null,
    dropLines: null,
    eventKinds: null,
    eventUnit: null,
    overlay: { groups: null, colour: 'team', only: null },
    target: null,
    targetPerson: null,
    setTarget: (target) => set({ target, targetPerson: null }),
    swapTarget: () => {
      const s = get();
      if (!s.target || !s.followUnit) return;
      set({ target: s.followUnit, targetPerson: s.follow, followUnit: s.target, follow: s.targetPerson ?? s.follow, selected: s.target });
    },
    pauseOnEvent: false,
    viewReset: 0,
    resetView: () => set({ viewReset: get().viewReset + 1 }),
    setAids: (p) => keep({ aids: { ...get().aids, ...p } }),
    setRule: (c, p) => keep({ labelRules: { ...get().labelRules, [c]: { ...get().labelRules[c], ...p } } }),
    setChart: (p) => keep({ chart: { ...get().chart, ...p } }),
    setGeo: (p) => keep({ geo: { ...get().geo, ...p } }),
    setLimits: (p) => keep({ limits: { ...get().limits, ...p } }),
    setLook: (p) => keep({ look: { ...get().look, ...p } }),
    setOverlay: (p) => set({ overlay: { ...get().overlay, ...p } }),
    setDropLines: (dropLines) => set({ dropLines }),
    patchSaved: keep,
    toggleFollow: (person, unit = null) => {
      const s = get();
      if (s.follow === person || (unit !== null && s.followUnit === unit)) set({ follow: null, followUnit: null });
      else set({ follow: person, followUnit: unit, selected: unit ?? s.selected });
    },
    followTo: (follow) => set({ follow }),
    stopFollow: () => set({ follow: null, followUnit: null }),
    setFollowDistance: (followDistance) => set({ followDistance: Math.max(2, Math.min(20000, followDistance)) }),
    select: (selected) => set({ selected }),
    pick: (person) => {
      const s = get();
      if (s.pairFrom === null) set({ pairFrom: person, pair: null });
      else if (s.pairFrom === person) set({ pairFrom: null });
      else set({ pair: [s.pairFrom, person], pairFrom: null });
    },
    clearPair: () => set({ pair: null, pairFrom: null }),
    setEventFilter: (p) =>
      set({
        ...(p.kinds !== undefined ? { eventKinds: p.kinds } : {}),
        ...(p.unit !== undefined ? { eventUnit: p.unit } : {}),
      }),
  };
});

/**
 * The label fields for a dataset: the viewer's choice, else name and vehicle,
 * with height and speed where the data has real-world metres (not a shooter
 * whose players walk a map in its own units).
 */
export function labelFieldsFor(d: { entitySize?: number }, chosen: string[] | null): string[] {
  return chosen ?? (d.entitySize ? DEFAULT_LABEL_FIELDS_GROUND : DEFAULT_LABEL_FIELDS);
}

/** Bearing (degrees from north, clockwise), ground range, slant range and height difference from a to b, world metres. */
export function braa(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): { bearing: number; ground: number; slant: number; dy: number } {
  const east = b.x - a.x;
  // World -z is north (as box yaw has it: 0 looks along -z).
  const north = -(b.z - a.z);
  const ground = Math.hypot(east, north);
  const dy = b.y - a.y;
  let bearing = (Math.atan2(east, north) * 180) / Math.PI;
  if (bearing < 0) bearing += 360;
  return { bearing, ground, slant: Math.hypot(ground, dy), dy };
}

/**
 * Aspect angle: where `from` sits as seen from `target`'s tail, degrees 0
 * (dead astern) to 180 (head on), with the target's course in degrees.
 */
export function aspectAngle(target: { x: number; z: number }, course: number, from: { x: number; z: number }): number {
  const toFrom = (Math.atan2(from.x - target.x, -(from.z - target.z)) * 180) / Math.PI;
  let d = Math.abs(((toFrom - course + 540) % 360) - 180);
  // d is the angle off the nose; the aspect is counted from the tail.
  d = 180 - d;
  return d;
}
