/**
 * One lap of telemetry, whatever it came from.
 *
 * Channels are columns by canonical name (see `schema.ts`); `time` and
 * `distance` always exist and start at zero, and positions are the game's own
 * world coordinates - the same frame as an extracted course - so a lap drawn
 * over its course needs no transform.
 */

import { num, t } from '../i18n';

export interface CarInfo {
  /** The game's car id. */
  ordinal?: number;
  name?: string;
  /** Class letter (Forza: D..X). */
  class?: string;
  pi?: number;
  drivetrain?: 'FWD' | 'RWD' | 'AWD' | string;
  peakKw?: number;
}

/**
 * What a lap's numbers mean where games differ, so the analysis reads every
 * game the same way.
 */
export interface LapMeta {
  /**
   * What the slip channels (`slipRatio`, `slipAngle`, `combinedSlip`) hold:
   * - `peak`: normalised by the game so that past 1 the tyre has let go
   *   (Forza's Data Out);
   * - `scaled`: a physical slip divided by a typical tarmac peak, 0.12 for
   *   slip ratio and 0.14 rad for slip angle (the Kunos recorder);
   * - `physical`: slip ratio as a fraction (0.1 = 10%), slip angle in radians;
   * - `index`: a game's own 0..1 sliding measure with no physical scale
   *   (Trackmania's SlipCoef).
   * Absent when the lap has no slip channels.
   */
  slip?: 'peak' | 'scaled' | 'physical' | 'index';
  /** What the lap was driven on, when the game or the course says. */
  surface?: Surface;
  /** Circuit laps, rally stages, or an arcade racer with its own physics. */
  discipline?: Discipline;
}

export type Surface = 'tarmac' | 'loose' | 'snow' | 'ice' | 'mixed';
export type Discipline = 'circuit' | 'rally' | 'arcade';

/** The discipline a game's laps belong to, when the lap does not say. */
export function disciplineOf(lap: LapTrace): Discipline {
  if (lap.meta?.discipline) return lap.meta.discipline;
  if (/rally|wrc|dirt|rbr/i.test(lap.game)) return 'rally';
  if (/trackmania/i.test(lap.game)) return 'arcade';
  return 'circuit';
}

/** Rallies run on tarmac, by the names their stages and events go by. */
const TARMAC_RALLY =
  /\b(spain|espa[ñn]a|catalunya|costa daurada|croatia|hrvatska|central europe|germany|deutschland|japan|corsica|corse|ypres|tarmac|asphalt)\b/i;

/**
 * The surface a lap was driven on: what the lap says, else what its game and
 * course suggest - Forza Horizon's dirt and cross-country events by their
 * names, a rally by the event's name (the tarmac rallies, the winter ones, the
 * Monte's tarmac with snow and ice on it), and a rally stage nothing names by
 * how the car was driven on it (see `drivenOn`).
 */
export function surfaceOf(lap: LapTrace): Surface {
  if (lap.meta?.surface) return lap.meta.surface;
  const name = `${lap.track ?? ''} ${lap.source}`;
  const rally = disciplineOf(lap) === 'rally';
  if (rally && /monte/i.test(name)) return 'mixed';
  if (rally && /snow|ice|winter|arctic|sweden/i.test(name)) return 'snow';
  if (rally && TARMAC_RALLY.test(name)) return 'tarmac';
  if (/scramble|trail|cross.?country|dirt|gravel/i.test(name)) return 'loose';
  if (rally) return drivenOn(lap);
  if (/rally/i.test(name)) return 'loose';
  return 'tarmac';
}

const DEGREE = Math.PI / 180;
const inferred = new WeakMap<LapTrace, Surface>();

/**
 * A rally stage's ground from how the car was driven on it, when nothing else
 * says. A car at its limit on gravel or snow corners at well under 1 g (0.7 to
 * 0.9 g on gravel) and runs well past ten degrees of drift, because there the
 * slide is how a corner is driven; on tarmac it corners harder and runs a few
 * degrees. So a stage where the car pulled 10 m/s² and more and ran under 6
 * degrees of drift (the median, wherever it was within 70% of its hardest
 * cornering) was tarmac; anything else, or too little to tell, is loose -
 * what a rally stage most often is.
 */
function drivenOn(lap: LapTrace): Surface {
  const known = inferred.get(lap);
  if (known) return known;
  const { bodySlip: beta, latAcc: lat, speed, airborne: air } = lap.channels;
  // Before the drift angle is derived there is nothing to go on yet.
  if (!beta || !lat || !speed) return 'loose';
  const counts = (i: number) =>
    speed[i] > 12 && !(air?.[i] > 0.5) && Math.abs(lat[i]) < 45 && Number.isFinite(beta[i]);
  const lats: number[] = [];
  for (let i = 0; i < lap.count; i++) if (counts(i)) lats.push(Math.abs(lat[i]));
  let surface: Surface = 'loose';
  if (lats.length >= 200) {
    lats.sort((a, b) => a - b);
    const grip = lats[Math.floor(0.95 * (lats.length - 1))];
    const drifts: number[] = [];
    for (let i = 0; i < lap.count; i++)
      if (counts(i) && Math.abs(lat[i]) >= 0.7 * grip) drifts.push(Math.abs(beta[i]));
    drifts.sort((a, b) => a - b);
    const drift = drifts.length >= 30 ? drifts[Math.floor(drifts.length / 2)] : Number.NaN;
    if (grip >= 10 && drift < 6 * DEGREE) surface = 'tarmac';
  }
  inferred.set(lap, surface);
  return surface;
}

/** The two kinds of ground thresholds and capabilities are kept apart for. */
export type Ground = 'tarmac' | 'loose';

/** A lap's ground at sample `i`: from the lap's own per-sample surface, else the lap's. */
export function groundAt(channels: Record<string, Float32Array>, lap: LapTrace, i: number): Ground {
  const loose = channels.loose;
  if (loose) return loose[i] > 0.5 ? 'loose' : 'tarmac';
  return surfaceOf(lap) === 'tarmac' ? 'tarmac' : 'loose';
}

export interface LapTrace {
  id: string;
  /** What the list shows: time, car, source. */
  label: string;
  source: string;
  game: string;
  track?: string;
  car: CarInfo;
  /** Lap time in seconds. */
  seconds: number;
  /** A full lap from line to line, rather than a partial run. */
  complete: boolean;
  channels: Record<string, Float32Array>;
  /** Samples per lap. */
  count: number;
  meta?: LapMeta;
}

export function has(lap: LapTrace, channel: string): boolean {
  return channel in lap.channels;
}

/** Forza's drivetrain code: 0 FWD, 1 RWD, 2 AWD. */
export function drivetrainName(code: number | undefined): CarInfo['drivetrain'] {
  if (code === 0) return 'FWD';
  if (code === 1) return 'RWD';
  if (code === 2) return 'AWD';
  return undefined;
}

/** Forza's class index: 0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X. */
export function forzaClass(code: number | undefined): string | undefined {
  const names = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X'];
  return code !== undefined && code >= 0 && code < names.length ? names[code] : undefined;
}

/** A lap time, "1:29.616", with the language's decimal separator. */
export function formatLapTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '--';
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return m > 0 ? `${m}:${num(s, 3).padStart(6, '0')}` : num(s, 3);
}

/** What a car the lap does not name is called: "car 1234" by its number, else "car". */
export function unnamedCar(ordinal: number | undefined): string {
  return ordinal !== undefined ? t('race.ui.lap.carNumber', { ordinal: String(ordinal) }) : t('race.ui.lap.car');
}

export function carLabel(car: CarInfo): string {
  const parts = [car.name ?? unnamedCar(car.ordinal)];
  if (car.class) parts.push(car.pi !== undefined ? `${car.class} ${car.pi}` : car.class);
  if (car.drivetrain) parts.push(String(car.drivetrain));
  return parts.join(' · ');
}

/**
 * What the analysis calls each lap: the car, and the lap time too when two
 * loaded laps are in the same car - every sentence says which lap it means.
 */
export function lapNames(laps: LapTrace[]): Map<string, string> {
  // The names the lap list already shows, when they tell the laps apart.
  const labels = laps.map((l) => l.label);
  if (labels.every((l) => l) && new Set(labels).size === laps.length) {
    return new Map(laps.map((l) => [l.id, l.label]));
  }
  // The car's whole name, as the game gives it: a shortened one says "Ford #5
  // '77" for "Ford #5 Escort RS1800 MkII '77".
  const car = (lap: LapTrace) =>
    lap.car.name
      ? lap.car.name
      : lap.car.ordinal !== undefined
        ? unnamedCar(lap.car.ordinal)
        : lap.label || t('race.ui.lap.lap');
  const count = new Map<string, number>();
  for (const lap of laps) count.set(car(lap), (count.get(car(lap)) ?? 0) + 1);
  const out = new Map<string, string>();
  const used = new Set<string>();
  for (const lap of laps) {
    let name = car(lap);
    if (count.get(name)! > 1) name = t('race.ui.lap.nameWithTime', { name, time: formatLapTime(lap.seconds) });
    let unique = name;
    for (let k = 2; used.has(unique); k++) unique = t('race.ui.lap.nameNumbered', { name, k });
    used.add(unique);
    out.set(lap.id, unique);
  }
  return out;
}
