/**
 * Many laps of one course at once: which mistakes are made where, by how many
 * of the laps, and what they cost.
 *
 * Built on the analysis of every lap rather than beside it: each lap is
 * judged corner by corner against the fastest lap of its own performance
 * class (`Analysis.classBest`), so a C-class car is not told it braked too
 * early against an S2 car's braking point. A lap's mistake in a corner is the
 * driving cause the analysis found for its loss there, and every lock,
 * wheelspin, slide, push, spin, hit and crash it made there besides - one
 * corner can hold several. Counted per lap, not per event: "12 of 57 laps
 * braked too early into T3".
 *
 * See docs/race-analytics.md, "Many laps".
 */

import type { Analysis, Finding, FindingKind, Phase } from './analysis';
import { classOf } from './analysis';
import { t } from '../i18n';
import { unnamedCar } from './lap';
import type { ControlEvent, ControlKind } from './control';

export type Mistake =
  | 'brake-late'
  | 'brake-early'
  | 'brake-gently'
  | 'lock'
  | 'coast'
  | 'slow-middle'
  | 'tight'
  | 'understeer'
  | 'rotation'
  | 'late-throttle'
  | 'slow-exit'
  | 'wheelspin'
  | 'oversteer'
  | 'wide'
  | 'scrub'
  | 'lift'
  | 'spin'
  | 'hit'
  | 'crash'
  | 'incident'
  | 'jump';

/** Where in a corner each mistake is made; the order mistakes are listed in when it is not by how often. */
export const MISTAKE_PHASE: Record<Mistake, Phase | 'incident'> = {
  'brake-late': 'braking',
  'brake-early': 'braking',
  'brake-gently': 'braking',
  lock: 'braking',
  coast: 'entry',
  'slow-middle': 'entry',
  tight: 'entry',
  understeer: 'entry',
  rotation: 'entry',
  'late-throttle': 'exit',
  'slow-exit': 'exit',
  wheelspin: 'exit',
  oversteer: 'exit',
  wide: 'exit',
  scrub: 'exit',
  lift: 'straight',
  spin: 'incident',
  hit: 'incident',
  crash: 'incident',
  incident: 'incident',
  jump: 'incident',
};

export const MISTAKE_ORDER = Object.keys(MISTAKE_PHASE) as Mistake[];

/** What a mistake is called as a heading: "Braked too early". */
export function mistakeLabel(m: Mistake): string {
  return t(`race.mistake.${m}.label`);
}

/** What a mistake is called on the map, short: "early braking". */
export function mistakeShort(m: Mistake): string {
  return t(`race.mistake.${m}.short`);
}

/** "12 of 57 laps braked too early" - and "... here", for a corner. */
export function mistakeCount(m: Mistake, laps: number, total: number, here = false): string {
  return t(`race.mistake.${m}.${here ? 'here' : 'count'}`, { laps, total });
}

const FROM_FINDING: Partial<Record<FindingKind, Mistake>> = {
  'too-fast-in': 'brake-late',
  'brakes-early': 'brake-early',
  'brakes-gently': 'brake-gently',
  locks: 'lock',
  coasts: 'coast',
  overslows: 'slow-middle',
  'tight-line': 'tight',
  understeer: 'understeer',
  rotation: 'rotation',
  'late-throttle': 'late-throttle',
  'hesitant-exit': 'late-throttle',
  'slower-exit': 'slow-exit',
  wheelspin: 'wheelspin',
  oversteer: 'oversteer',
  'wide-exit': 'wide',
  scrubs: 'scrub',
  lifts: 'lift',
  'lifts-on-straight': 'lift',
  incident: 'incident',
  jump: 'jump',
};

/**
 * The mistake a finding says. A pattern - too fast in, too slow in - is
 * counted as the cause found inside it: a slow entry from braking early is
 * braking early, not a slow middle; a fast entry is braking too late only
 * where the lap braked later, and otherwise what its exit went wrong with.
 * None where the cause is not the driver's (the car, a slower arrival).
 */
export function mistakeOf(f: Pick<Finding, 'kind' | 'cause'>): Mistake | undefined {
  return FROM_FINDING[f.cause ?? f.kind];
}

const FROM_EVENT: Partial<Record<ControlKind, Mistake>> = {
  lock: 'lock',
  wheelspin: 'wheelspin',
  oversteer: 'oversteer',
  spin: 'spin',
  understeer: 'understeer',
  hit: 'hit',
  crash: 'crash',
};

/** A loss under this in a corner is not a mistake worth counting, s. */
const MIN_LOSS = 0.05;
/** A car-control fault that cost less than this is how the corner was driven, s. */
const MIN_FAULT = 0.03;

/** One lap's mistake in one corner. */
export interface Occurrence {
  lapId: string;
  /** Segment index. */
  segment: number;
  mistake: Mistake;
  /** Grid index range where it was. */
  from: number;
  to: number;
  /** What the lap lost over the whole corner against its comparison lap, s (0 when it gained). */
  lost: number;
  /**
   * What the mistake itself cost, s: the corner's loss where it was the cause
   * the analysis found, a lock's, slide's or hit's own cost otherwise.
   */
  cost: number;
  /** The finding that says it, or the event. */
  finding?: number;
  event?: ControlEvent;
}

const cache = new WeakMap<Analysis, Occurrence[]>();

/** Every lap's mistakes in every corner. Worked out once per analysis. */
export function occurrences(a: Analysis): Occurrence[] {
  const known = cache.get(a);
  if (known) return known;
  const out: Occurrence[] = [];
  const segmentOf = new Map(a.segments.map((s, k) => [s.corner, k]));
  for (const lap of a.alignment.laps) {
    const id = lap.lap.id;
    const results = a.results.get(id) ?? [];
    const events = (a.control.get(id) ?? []).filter((e) => FROM_EVENT[e.kind]);
    const seen = new Set<string>();
    const add = (o: Occurrence) => {
      const key = `${o.segment}|${o.mistake}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(o);
    };
    const lostIn = (k: number) => Math.max(0, results[k]?.net ?? 0);
    a.findings.forEach((f: Finding, index) => {
      if (f.lapId !== id || f.outcome !== 'loss' || f.source !== 'driver' || f.cost < MIN_LOSS) return;
      const k = segmentOf.get(f.corner);
      if (k === undefined) return;
      let mistake = mistakeOf(f);
      if (!mistake) return;
      // An incident is said through what it was, where the car control says.
      if (mistake === 'incident') {
        const here = events.filter((e) => segmentOf.get(e.corner) === k);
        const worst = here.find((e) => e.kind === 'crash') ?? here.find((e) => e.kind === 'spin') ?? here.find((e) => e.kind === 'hit');
        if (worst) mistake = FROM_EVENT[worst.kind]!;
      }
      add({ lapId: id, segment: k, mistake, from: Math.min(f.from, f.to), to: Math.max(f.from, f.to), lost: lostIn(k), cost: f.cost, finding: index });
    });
    for (const e of events) {
      const k = segmentOf.get(e.corner);
      if (k === undefined) continue;
      const struck = e.kind === 'hit' || e.kind === 'crash';
      if (!struck && (e.shared || e.cost < MIN_FAULT)) continue;
      add({ lapId: id, segment: k, mistake: FROM_EVENT[e.kind]!, from: e.from, to: e.to, lost: lostIn(k), cost: e.cost, event: e });
    }
  }
  cache.set(a, out);
  return out;
}

export interface MistakeCount {
  mistake: Mistake;
  /** The laps that made it here, worst first. */
  laps: Occurrence[];
  /** In how many different cars. */
  cars: number;
  /** What it cost those laps, all told, s: see `Occurrence.cost`. */
  cost: number;
}

export interface CornerStat {
  segment: number;
  label: string;
  /** Laps that drove it, and those that lost time in it against their class's best. */
  laps: number;
  losing: number;
  /** All the time lost in it, s. */
  lost: number;
  mistakes: MistakeCount[];
}

export interface CourseMistake {
  mistake: Mistake;
  /** Laps that made it at least once, and how often it was made, lap by corner. */
  laps: number;
  times: number;
  /** What it cost, all told, s: see `Occurrence.cost`. */
  cost: number;
  /** Where it was made most: segment index and how many laps, most first. */
  corners: [number, number][];
}

export interface CourseStats {
  laps: number;
  cars: number;
  /** Class and how many laps in it, in the order the game ranks them. */
  classes: [string, number][];
  corners: CornerStat[];
  /** Most laps first. */
  mistakes: CourseMistake[];
}

const CLASS_ORDER = ['D', 'C', 'B', 'A', 'S1', 'S2', 'R', 'X'];

/** The classes among the laps, in the game's order, with how many laps each. */
export function classesOf(a: Analysis): [string, number][] {
  const count = new Map<string, number>();
  for (const l of a.alignment.laps) count.set(classOf(l.lap), (count.get(classOf(l.lap)) ?? 0) + 1);
  const rank = (c: string) => (CLASS_ORDER.includes(c) ? CLASS_ORDER.indexOf(c) : CLASS_ORDER.length);
  return [...count].sort((x, y) => rank(x[0]) - rank(y[0]) || x[0].localeCompare(y[0]));
}

/** The laps of these classes (all of them for null). */
export function lapsIn(a: Analysis, classes: string[] | null): Set<string> {
  return new Set(a.alignment.laps.filter((l) => !classes || classes.includes(classOf(l.lap))).map((l) => l.lap.id));
}

/** The statistics of a set of laps: corner by corner, and over the course. */
export function courseStats(a: Analysis, ids: Set<string>): CourseStats {
  const carOf = new Map(a.alignment.laps.map((l) => [l.lap.id, `${l.lap.car.ordinal ?? l.lap.car.name ?? ''}`]));
  const all = occurrences(a).filter((o) => ids.has(o.lapId));
  const corners: CornerStat[] = a.segments.map((seg, k) => {
    let laps = 0;
    let losing = 0;
    let lost = 0;
    for (const lap of a.alignment.laps) {
      if (!ids.has(lap.lap.id) || lap.first > seg.start || lap.last < seg.end) continue;
      laps++;
      const net = a.results.get(lap.lap.id)?.[k]?.net ?? 0;
      if (net >= MIN_LOSS) {
        losing++;
        lost += net;
      }
    }
    const here = all.filter((o) => o.segment === k);
    const by = new Map<Mistake, Occurrence[]>();
    for (const o of here) by.set(o.mistake, [...(by.get(o.mistake) ?? []), o]);
    const mistakes = [...by].map(([mistake, list]) => ({
      mistake,
      laps: list.sort((x, y) => y.cost - x.cost),
      cars: new Set(list.map((o) => carOf.get(o.lapId))).size,
      cost: list.reduce((s, o) => s + o.cost, 0),
    }));
    mistakes.sort((x, y) => y.laps.length - x.laps.length || y.cost - x.cost);
    return { segment: k, label: seg.label, laps, losing, lost, mistakes };
  });
  const by = new Map<Mistake, Occurrence[]>();
  for (const o of all) by.set(o.mistake, [...(by.get(o.mistake) ?? []), o]);
  const mistakes: CourseMistake[] = [...by].map(([mistake, list]) => {
    const where = new Map<number, number>();
    for (const o of list) where.set(o.segment, (where.get(o.segment) ?? 0) + 1);
    return {
      mistake,
      laps: new Set(list.map((o) => o.lapId)).size,
      times: list.length,
      cost: list.reduce((s, o) => s + o.cost, 0),
      corners: [...where].sort((x, y) => y[1] - x[1]),
    };
  });
  mistakes.sort((x, y) => y.laps - x.laps || y.times - x.times || y.cost - x.cost);
  const lapsHere = a.alignment.laps.filter((l) => ids.has(l.lap.id));
  return {
    laps: lapsHere.length,
    cars: new Set(lapsHere.map((l) => carOf.get(l.lap.id))).size,
    classes: classesOf(a).filter(([c]) => lapsHere.some((l) => classOf(l.lap) === c)),
    corners,
    mistakes,
  };
}

/**
 * How many of the laps made a mistake at each metre of the course - one kind,
 * or any - on the analysis' grid, a little widened so a short one shows.
 */
export function mistakeDensity(a: Analysis, ids: Set<string>, only: Mistake | null): Float32Array {
  const n = a.alignment.grid.length;
  const step = a.alignment.grid[1] - a.alignment.grid[0];
  const pad = Math.round(6 / step);
  const out = new Float32Array(n);
  const byLap = new Map<string, Occurrence[]>();
  for (const o of occurrences(a)) {
    if (!ids.has(o.lapId) || (only && o.mistake !== only)) continue;
    byLap.set(o.lapId, [...(byLap.get(o.lapId) ?? []), o]);
  }
  const mark = new Uint8Array(n);
  for (const list of byLap.values()) {
    mark.fill(0);
    for (const o of list) for (let i = Math.max(0, o.from - pad); i <= Math.min(n - 1, o.to + pad); i++) mark[i] = 1;
    for (let i = 0; i < n; i++) out[i] += mark[i];
  }
  return out;
}

/**
 * The mistakes as a table the heatmap reads: each lap's mistake at every grid
 * point it covers, at that lap's own position there - `lap` the session, the
 * car the tracked thing, the mistake its group, the class and the corner to
 * filter on. CSV, so the heatmap's own loader maps it.
 */
export function mistakeTable(a: Analysis, ids: Set<string>): string {
  const lines = ['x,y,z,elapsed,lap,car,mistake,car_class,corner,cost'];
  const quote = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const laps = new Map(a.alignment.laps.map((l) => [l.lap.id, l]));
  for (const o of occurrences(a)) {
    if (!ids.has(o.lapId)) continue;
    const lap = laps.get(o.lapId)!;
    const { x, y, z, time } = lap.channels;
    const name = a.names.get(o.lapId) ?? o.lapId;
    const car = lap.lap.car.name ?? unnamedCar(lap.lap.car.ordinal);
    const fields = `${quote(name)},${quote(car)},${quote(mistakeLabel(o.mistake))},${quote(classOf(lap.lap) || '-')},${a.segments[o.segment].label},${o.cost.toFixed(3)}`;
    for (let i = Math.max(lap.first, o.from); i <= Math.min(lap.last, o.to); i++) {
      if (!Number.isFinite(x[i]) || !Number.isFinite(z[i])) continue;
      lines.push(`${x[i].toFixed(2)},${(y?.[i] ?? 0).toFixed(2)},${z[i].toFixed(2)},${time[i].toFixed(3)},${fields}`);
    }
  }
  return lines.join('\n');
}
