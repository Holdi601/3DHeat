/**
 * The match replay's Tacview-like extras: what the labels over the units say
 * and what a hover shows, the unit the camera follows and how, the unit whose
 * live data the card shows, a pair whose range, bearing and height difference
 * is drawn, the event list's filters, the chart's parameters - what a flight
 * debrief asks of a replay.
 *
 * The choices of what to show are the viewer's own and kept in this browser.
 */

import { create } from 'zustand';

/** What the labels over the units show (field ids, `fields.ts`), until the viewer chooses: height and speed where things fly. */
export const DEFAULT_LABEL_FIELDS = ['name', 'vehicle', 'alt', 'tas'];
export const DEFAULT_LABEL_FIELDS_GROUND = ['name', 'vehicle'];
/** What the selected unit's card shows. */
export const DEFAULT_CARD_FIELDS = ['vehicle', 'team', 'range', 'bearing', 'aspect', 'alt', 'agl', 'tas', 'ias', 'mach', 'gs', 'vs', 'heading', 'pitch', 'roll', 'aoa', 'g', 'turnRate', 'energy', 'throttle', 'rpm', 'fuel', 'health'];
export const DEFAULT_GRAPH = ['alt', 'tas'];

export type UnitSystem = 'metric' | 'imperial';
/** Chase: the camera turns with the followed unit. Orbit: it keeps its own direction. */
export type FollowMode = 'chase' | 'orbit';

interface Saved {
  labels: boolean;
  /** Null: the default for the data (`labelFieldsFor`). */
  labelFields: string[] | null;
  cardFields: string[];
  graph: string[];
  units: UnitSystem;
  declutter: boolean;
  followMode: FollowMode;
  labelAi: boolean;
  /** The figure overlay's labels and event markers: off unless asked, there are too many. */
  overlayLabels: boolean;
  overlayMarkers: boolean;
}

const KEY = 'heat3d.replay';

function saved(): Saved {
  const fallback: Saved = {
    labels: true,
    labelFields: null,
    cardFields: DEFAULT_CARD_FIELDS,
    graph: DEFAULT_GRAPH,
    units: 'metric',
    declutter: true,
    followMode: 'chase',
    labelAi: true,
    overlayLabels: false,
    overlayMarkers: false,
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
      units: v.units === 'imperial' ? 'imperial' : 'metric',
      declutter: v.declutter !== false,
      followMode: v.followMode === 'orbit' ? 'orbit' : 'chase',
      labelAi: v.labelAi !== false,
      overlayLabels: v.overlayLabels === true,
      overlayMarkers: v.overlayMarkers === true,
    };
  } catch {
    return fallback;
  }
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
}

export const useReplayStore = create<ReplayState>((set, get) => {
  const keep = (p: Partial<Saved>) => {
    const s = { ...get(), ...p };
    store({
      labels: s.labels,
      labelFields: s.labelFields,
      cardFields: s.cardFields,
      graph: s.graph,
      units: s.units,
      declutter: s.declutter,
      followMode: s.followMode,
      labelAi: s.labelAi,
      overlayLabels: s.overlayLabels,
      overlayMarkers: s.overlayMarkers,
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
