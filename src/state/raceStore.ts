/**
 * The race tab's state: the loaded laps, the analysis of them, what to draw
 * and how the replay runs.
 *
 * Its own store rather than more fields on the heat viewer's: the two tabs
 * share the canvas, the camera and the course, and nothing else. The replay's
 * clock is not in here at all - it moves every frame, and every component
 * subscribed to a store would re-render with it. See `raceClock`.
 */

import { create } from 'zustand';
import { onLanguageChange, t } from '../i18n';
import { analyse, classOf, type Analysis } from '../race/analysis';
import type { CarPack } from '../race/carPack';
import { unnamedCar, type LapTrace } from '../race/lap';
import {
  lapMotion,
  replayOffsets,
  sampleDistances,
  type LapMotion,
  type ReplayMode,
} from '../race/replay';
import type { Mistake } from '../race/stats';
import { renameDemoLap } from '../race/synthetic';

export type RaceMap = 'none' | 'where' | 'why' | 'mistakes';

/** What the course statistics look at: which classes' laps, and one mistake or corner picked out. */
export interface RaceMass {
  /** Null for every class. */
  classes: string[] | null;
  /** The mistake the map shows; null for any. */
  mistake: Mistake | null;
  /** The corner (segment index) opened in the statistics; null for none. */
  segment: number | null;
}

/** A course among laps from several, offered to load on its own. */
export interface CourseChoice {
  key: string;
  name: string;
  laps: number;
  load: () => void;
}

/** Past this many laps, those added are shown only when they matter: the reference, the focus and what it is compared with. */
export const SHOW_ALL_UP_TO = 8;

export interface RaceView {
  /** Each lap's driven line. */
  lines: boolean;
  /** The map painted along the track: time lost/gained, its causes, or where the laps make mistakes. */
  map: RaceMap;
  cars: boolean;
  /** Each car in its own shape (see `carMatch.ts`), not the single-seater that hides nothing. */
  carShapes: boolean;
  /** Car size multiplier: 1 is the car's size in the game, and only the slider changes it. */
  carScale: number;
  /** Tyre, slip and suspension colours on the cars. */
  telemetry: boolean;
  /** Numbered badges for the biggest mistakes, and corner names. */
  labels: boolean;
  /** The distance charts under the view. */
  charts: boolean;
  /** A track surface from the laps' own spread, when no course model is loaded. */
  surface: boolean;
  /**
   * The graphs, by channel id (`delta` for the gap), in order; null for the
   * default set - see `defaultGraphs`.
   */
  graphs: string[] | null;
  /** Every value the laps carry, listed on each car's card. */
  hudDetails: boolean;
}

export interface RaceReplay {
  mode: ReplayMode;
  /** Metres along the reference where `anchor` mode lines the cars up. */
  anchorS: number;
  playing: boolean;
  speed: number;
  loop: boolean;
}

export interface RaceState {
  /** Which tab the sidebar shows; `match` is the CS2 match analysis over the heatmap, `vehicle` the hits on one vehicle. */
  tab: 'heat' | 'race' | 'match' | 'plan' | 'vehicle';
  laps: LapTrace[];
  /** lap id -> hidden. */
  hidden: Record<string, boolean>;
  /** The lap everything is compared against; null picks the fastest complete lap. */
  referenceId: string | null;
  /** The lap whose mistakes the insights list, and whose maps are drawn. */
  focusId: string | null;
  analysis: Analysis | null;
  motions: Map<string, LapMotion>;
  /** Seconds each lap's clock runs ahead of the replay clock (anchor mode). */
  offsets: Map<string, number>;
  error: string | null;
  view: RaceView;
  replay: RaceReplay;
  /** Lap id the camera chases, or null for a free camera. */
  follow: string | null;
  /** Index into `analysis.findings` of the one being looked at. */
  selected: number | null;
  mass: RaceMass;
  /** Laps of several courses were picked: which to load. Null otherwise. */
  courses: CourseChoice[] | null;

  setTab: (tab: 'heat' | 'race' | 'match' | 'plan' | 'vehicle') => void;
  /** The car files loaded, one a game. */
  carPacks: CarPack[];
  setCarPacks: (packs: CarPack[]) => void;
  addLaps: (laps: LapTrace[]) => void;
  removeLap: (id: string) => void;
  clearLaps: () => void;
  toggleLap: (id: string) => void;
  setReference: (id: string | null) => void;
  setFocus: (id: string | null) => void;
  patchView: (p: Partial<RaceView>) => void;
  patchReplay: (p: Partial<RaceReplay>) => void;
  setFollow: (id: string | null) => void;
  select: (index: number | null) => void;
  setError: (message: string | null) => void;
  /** Show just these laps, every lap (true) or none but the reference and the focus (false). */
  showLaps: (which: boolean | string[]) => void;
  patchMass: (p: Partial<RaceMass>) => void;
  setCourses: (courses: CourseChoice[] | null) => void;
}

/** A readable label for a lap: its time, its car, its file. */
function labelFor(lap: LapTrace, all: LapTrace[]): string {
  const same = all.filter((l) => l.car.ordinal === lap.car.ordinal && l.car.name === lap.car.name);
  // The car's whole name, as the game gives it; where the list or a card is
  // too narrow, it is cut there, not here.
  const car = lap.car.name ?? unnamedCar(lap.car.ordinal);
  return same.length > 1 ? t('race.ui.lap.nameNumbered', { name: car, k: same.indexOf(lap) + 1 }) : car;
}

interface Derived {
  analysis: Analysis | null;
  motions: Map<string, LapMotion>;
  offsets: Map<string, number>;
  focusId: string | null;
  error: string | null;
}

/** Analysis, replay motions and offsets for a set of laps. */
function derive(
  laps: LapTrace[],
  referenceId: string | null,
  focusId: string | null,
  replay: RaceReplay,
): Derived {
  if (laps.length === 0)
    return {
      analysis: null,
      motions: new Map(),
      offsets: new Map(),
      focusId: null,
      error: null,
    };
  let analysis: Analysis | null = null;
  let error: string | null = null;
  try {
    analysis = analyse(laps, referenceId ?? undefined);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  const motions = new Map<string, LapMotion>();
  for (const lap of laps) {
    const s = analysis ? sampleDistances(lap, analysis.alignment) : lap.channels.distance;
    motions.set(lap.id, lapMotion(lap, s));
  }
  const offsets = analysis
    ? replayOffsets(analysis.alignment, replay.mode, replay.anchorS)
    : new Map<string, number>();
  // The focus stays where the user put it - the reference too, which is then
  // compared with whichever lap was quickest through each corner; otherwise
  // the slowest lap, which has the most to learn.
  const ref = analysis?.alignment.reference;
  const focus =
    focusId && laps.some((l) => l.id === focusId)
      ? focusId
      : (laps.filter((l) => l !== ref).sort((a, b) => b.seconds - a.seconds)[0]?.id ?? null);
  return { analysis, motions, offsets, focusId: focus, error };
}

export const useRaceStore = create<RaceState>((set, get) => ({
  tab: 'heat',
  laps: [],
  hidden: {},
  referenceId: null,
  focusId: null,
  analysis: null,
  motions: new Map(),
  offsets: new Map(),
  error: null,
  view: {
    lines: true,
    map: 'where',
    cars: true,
    carShapes: true,
    carScale: 1,
    telemetry: true,
    labels: true,
    charts: true,
    surface: true,
    graphs: null,
    hudDetails: false,
  },
  replay: { mode: 'start', anchorS: 0, playing: false, speed: 1, loop: true },
  follow: null,
  selected: null,
  mass: { classes: null, mistake: null, segment: null },
  courses: null,

  setTab: (tab) => set({ tab }),
  carPacks: [],
  setCarPacks: (carPacks) => set({ carPacks }),
  addLaps: (added) => {
    const s = get();
    const laps = [...s.laps, ...added];
    for (const lap of laps) lap.label = labelFor(lap, laps);
    const derived = derive(laps, s.referenceId, s.focusId, s.replay);
    // Dozens of laps drawn at once is a tangle, and slow: past a handful,
    // the ones added are drawn only where they matter. All of them are
    // analysed, and the statistics count them all.
    const hidden = { ...s.hidden };
    if (laps.length > SHOW_ALL_UP_TO) {
      const keep = shown(laps, derived.analysis, derived.focusId);
      for (const lap of added) hidden[lap.id] = !keep.has(lap.id);
    }
    set({
      laps,
      hidden,
      selected: null,
      courses: null,
      mass: { ...s.mass, segment: null },
      ...derived,
    });
  },
  removeLap: (id) => {
    const s = get();
    const laps = s.laps.filter((l) => l.id !== id);
    for (const lap of laps) lap.label = labelFor(lap, laps);
    const referenceId = s.referenceId === id ? null : s.referenceId;
    const hidden = { ...s.hidden };
    delete hidden[id];
    set({
      laps,
      hidden,
      referenceId,
      selected: null,
      follow: s.follow === id ? null : s.follow,
      ...derive(laps, referenceId, s.focusId === id ? null : s.focusId, s.replay),
    });
  },
  clearLaps: () =>
    set({
      laps: [],
      hidden: {},
      referenceId: null,
      follow: null,
      selected: null,
      mass: { classes: null, mistake: null, segment: null },
      ...derive([], null, null, get().replay),
    }),
  toggleLap: (id) => set((s) => ({ hidden: { ...s.hidden, [id]: !s.hidden[id] } })),
  setReference: (id) => {
    const s = get();
    set({
      referenceId: id,
      selected: null,
      ...derive(s.laps, id, s.focusId, s.replay),
    });
  },
  setFocus: (id) => {
    // The lap looked at is drawn, and what it is compared with.
    const s = get();
    const hidden = { ...s.hidden };
    if (id) {
      hidden[id] = false;
      const lap = s.laps.find((l) => l.id === id);
      const best = lap && s.analysis?.classBest.get(classOf(lap));
      if (best) hidden[best] = false;
    }
    set({ focusId: id, selected: null, hidden });
  },
  patchView: (p) => set((s) => ({ view: { ...s.view, ...p } })),
  patchReplay: (p) => {
    const s = get();
    const replay = { ...s.replay, ...p };
    const offsets =
      (p.mode !== undefined || p.anchorS !== undefined) && s.analysis
        ? replayOffsets(s.analysis.alignment, replay.mode, replay.anchorS)
        : s.offsets;
    set({ replay, offsets });
  },
  setFollow: (id) => set({ follow: id }),
  select: (index) => set({ selected: index }),
  setError: (message) => set({ error: message }),
  showLaps: (which) => {
    const s = get();
    const keep =
      which === true
        ? new Set(s.laps.map((l) => l.id))
        : which === false
          ? shown(s.laps, s.analysis, s.focusId)
          : new Set(which);
    set({ hidden: Object.fromEntries(s.laps.map((l) => [l.id, !keep.has(l.id)])) });
  },
  patchMass: (p) => set((s) => ({ mass: { ...s.mass, ...p } })),
  setCourses: (courses) => set({ courses }),
}));

// What the analysis says is said in the language it was worked out in: a new
// language, the analysis again.
onLanguageChange(() => {
  const s = useRaceStore.getState();
  if (!s.laps.length) return;
  for (const lap of s.laps) renameDemoLap(lap);
  for (const lap of s.laps) lap.label = labelFor(lap, s.laps);
  useRaceStore.setState({ selected: null, ...derive(s.laps, s.referenceId, s.focusId, s.replay) });
});

/** The laps worth drawing among many: the reference, the focus, and the best of the focus's class. */
function shown(laps: LapTrace[], analysis: Analysis | null, focusId: string | null): Set<string> {
  const keep = new Set<string>();
  const ref = analysis?.alignment.reference;
  if (ref) keep.add(ref.id);
  if (focusId) {
    keep.add(focusId);
    const focus = laps.find((l) => l.id === focusId);
    const best = focus && analysis?.classBest.get(classOf(focus));
    if (best) keep.add(best);
  }
  return keep;
}

/**
 * The replay clock: seconds of the reference lap. Advanced by the engine every
 * frame while playing, read by the HUD and the charts through `subscribe`,
 * which fires at most once a frame.
 */
class RaceClock {
  private value = 0;
  private listeners = new Set<() => void>();
  private pending = false;

  get time(): number {
    return this.value;
  }

  set(t: number): void {
    if (t === this.value) return;
    this.value = t;
    if (this.pending) return;
    this.pending = true;
    queueMicrotask(() => {
      this.pending = false;
      for (const l of this.listeners) l();
    });
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  snapshot = (): number => this.value;
}

export const raceClock = new RaceClock();

/**
 * A value that changes at frame rate, read with `useSyncExternalStore` and
 * notifying at most once a microtask - the same pattern as the clock.
 */
export class Signal<T> {
  private listeners = new Set<() => void>();
  private pending = false;

  constructor(private current: T) {}

  get value(): T {
    return this.current;
  }

  set(v: T): void {
    if (Object.is(v, this.current)) return;
    this.current = v;
    if (this.pending) return;
    this.pending = true;
    queueMicrotask(() => {
      this.pending = false;
      for (const l of this.listeners) l();
    });
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  snapshot = (): T => this.current;
}

/**
 * Where the pointer is on the charts, in metres along the reference, or null.
 * While it is set, the cars and their inputs show that point of the lap
 * rather than the replay's - looking along the charts moves them with you.
 */
export const raceHover = new Signal<number | null>(null);

/** The replay's length: the longest a lap runs on the clock. */
export function replayLength(
  s: Pick<RaceState, 'laps' | 'offsets' | 'replay' | 'analysis'>,
): number {
  let end = 0;
  for (const lap of s.laps)
    end = Math.max(
      end,
      lap.seconds - (s.replay.mode === 'anchor' ? (s.offsets.get(lap.id) ?? 0) : 0),
    );
  if (s.replay.mode === 'locked' && s.analysis) end = s.analysis.alignment.reference.seconds;
  return end;
}
