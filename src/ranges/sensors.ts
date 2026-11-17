/**
 * Sensors: what a unit's radars, infrared search and track, laser range
 * finders and designators, targeting pods, sonars and warning receivers
 * cover - the sector they search (bearing and elevation limits about the
 * unit's nose), how far, and for a radar how that reach shrinks for smaller
 * targets.
 *
 * From the game's catalogue (`data/games/<id>.json`, `sensors`, matched by
 * the vehicle's or the figure's name: a specification) and, where a Tacview
 * ACMI recording has them, the radar's own recorded state (`RadarMode`,
 * `RadarRange`, `RadarAzimuth`, `RadarElevation`, the beamwidths: what the
 * radar did, which wins over the specification while it is on).
 *
 * A radar sees a target out to a range that goes with the fourth root of its
 * radar cross-section (the radar equation, R ~ RCS^1/4): the most range is
 * for the reference target, the best-range band for one a tenth of its RCS
 * (0.56 of the range), the least-range band for a hundredth (0.32).
 */

import type { Dataset } from '../state/types';
import { localUnit, type GameCatalogue } from './catalog';

export type SensorKind = 'radar' | 'irst' | 'rwr' | 'mlws' | 'lws' | 'lrf' | 'ldp' | 'tgp' | 'sonar' | 'esm' | 'spotting' | 'camera' | 'drone' | 'hydro';

/** Passive warners and listeners: not limited by what is in view. */
export const PASSIVE_SENSOR = /^(rwr|mlws|lws|esm|sonar|hydro)$/;

/** What a sensor turns with: the hull (its nose), the turret, or the gun (and its sight). */
export type SensorMount = 'hull' | 'turret' | 'gun';

export interface SensorSpec {
  id: string;
  kind: SensorKind;
  name: string;
  match: RegExp;
  /** Metres. */
  range: number;
  /** Bearing limits about the nose and elevation limits, degrees. */
  az: [number, number];
  el: [number, number];
  /** Reference target radar cross-section for `range`, square metres; null unknown. */
  rcsRef: number | null;
  src: 'game' | 'public' | 'estimate' | 'local';
  source?: string;
  note?: string;
  /** Recorded in the data (ACMI radar), not a specification. */
  recorded?: boolean;
  /** What it turns with; absent: the hull. */
  mount?: SensorMount;
}

const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const pair = (v: unknown, d: [number, number]): [number, number] => (Array.isArray(v) && v.length === 2 ? [num(v[0], d[0]), num(v[1], d[1])] : d);

/** One sensor entry, checked: null without a reach or an id, or when it is how far the unit itself is seen (detectability). */
export function readSensor(raw: Record<string, unknown>, match: RegExp): SensorSpec | null {
  const range = num(raw.range, 0);
  if (!(range > 0) || typeof raw.id !== 'string') return null;
  if (/detectab/i.test(`${raw.name ?? ''} ${raw.note ?? ''}`)) return null;
  const el = pair(raw.el, [-90, 90]);
  return {
    id: raw.id,
    kind: (typeof raw.kind === 'string' ? raw.kind : 'radar') as SensorKind,
    name: typeof raw.name === 'string' ? raw.name : raw.id,
    match,
    range,
    az: pair(raw.az, [-180, 180]),
    // A sensor given no height (a ship's surface search): a thin band round the horizon.
    el: el[0] === el[1] ? [el[0] - 2, el[1] + 2] : el,
    rcsRef: typeof raw.rcsRef === 'number' && raw.rcsRef > 0 ? raw.rcsRef : null,
    src: raw.src === 'game' || raw.src === 'public' || raw.src === 'local' ? raw.src : 'estimate',
    ...(typeof raw.source === 'string' && raw.source ? { source: raw.source } : {}),
    ...(typeof raw.note === 'string' && raw.note ? { note: raw.note } : {}),
    ...(raw.mount === 'turret' || raw.mount === 'gun' ? { mount: raw.mount } : {}),
  };
}

/** A game's sensors, checked: those with a reach, not how far the unit itself is seen (detectability). */
export function gameSensors(game: GameCatalogue | null): SensorSpec[] {
  const out: SensorSpec[] = [];
  for (const raw of (game?.sensors ?? []) as Record<string, unknown>[]) {
    if (typeof raw.match !== 'string') continue;
    let match: RegExp;
    try {
      match = new RegExp(raw.match, 'i');
    } catch {
      continue;
    }
    const s = readSensor(raw, match);
    if (s) out.push(s);
  }
  return out;
}

/**
 * A unit's sensors: those the user's own installation lists for its vehicle (`local.ts`), when it lists any;
 * else the game catalogue's by its vehicle's or figure's name.
 */
export function sensorsFor(list: readonly SensorSpec[], vehicle: string, figure: string | null, game: GameCatalogue | null = null): SensorSpec[] {
  const own = game?.local ? localUnit(game.local, vehicle, figure) : null;
  if (own && own.sensors.length) return own.sensors;
  return list.filter((s) => (vehicle && s.match.test(vehicle)) || (figure && s.match.test(figure)));
}

/** The radar's recorded state on a row of an ACMI recording, or null where it records none or the radar is off. */
export interface RecordedRadar {
  range: number;
  az: number;
  el: number;
  /** Beamwidths (the scanned zone), degrees; NaN where not recorded. */
  h: number;
  v: number;
}

export class RecordedRadars {
  private d: Dataset | null = null;
  private cols: { mode: Float32Array | null; range: Float32Array | null; az: Float32Array | null; el: Float32Array | null; h: Float32Array | null; v: Float32Array | null } | null = null;

  at(d: Dataset, row: number): RecordedRadar | null {
    if (d !== this.d) {
      this.d = d;
      const col = (n: string) => {
        const a = d.attrs.find((x) => x.name === n && x.kind !== 'category');
        return a ? (a.data as Float32Array) : null;
      };
      const range = col('RadarRange');
      this.cols = range ? { mode: col('RadarMode'), range, az: col('RadarAzimuth'), el: col('RadarElevation'), h: col('RadarHorizontalBeamwidth'), v: col('RadarVerticalBeamwidth') } : null;
    }
    const c = this.cols;
    if (!c || row < 0) return null;
    const range = c.range![row];
    const mode = c.mode ? c.mode[row] : 1;
    if (!(range > 0) || mode === 0) return null;
    const f = (a: Float32Array | null, dflt: number) => (a && Number.isFinite(a[row]) ? a[row] : dflt);
    return { range, az: f(c.az, 0), el: f(c.el, 0), h: f(c.h, NaN), v: f(c.v, NaN) };
  }
}

/** A sensor's bands, metres: least, best, most - for a radar the reach for a hundredth, a tenth and the whole reference RCS. */
export function sensorBands(s: { kind: SensorKind; range: number }): [number, number, number] {
  if (s.kind !== 'radar') return [0, 0, s.range];
  return [s.range * Math.pow(0.01, 0.25), s.range * Math.pow(0.1, 0.25), s.range];
}

type Vec3 = [number, number, number];

/** The direction `az` degrees right and `el` degrees up of a nose (heading only, held level). */
export function turned(fwd: Vec3, az: number, el: number): Vec3 {
  const h = Math.hypot(fwd[0], fwd[2]) || 1;
  const yaw = Math.atan2(fwd[0] / h, -fwd[2] / h) + (az * Math.PI) / 180;
  const pitch = Math.asin(Math.max(-1, Math.min(1, fwd[1]))) + (el * Math.PI) / 180;
  return [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
}

/**
 * How a sensor's sector is drawn: all round (a dome cut at its elevation
 * limits) when it searches 150 degrees or more across, else a frustum
 * about the middle of its limits, as wide and as high as they are.
 */
export function sectorShape(fwd: Vec3, az: [number, number], el: [number, number]): { dome: true; el: [number, number] } | { dome: false; fwd: Vec3; tanH: number; tanV: number } {
  const halfAz = Math.abs(az[1] - az[0]) / 2;
  const halfEl = Math.abs(el[1] - el[0]) / 2;
  if (halfAz >= 75 || halfEl >= 75) return { dome: true, el };
  return {
    dome: false,
    fwd: turned(fwd, (az[0] + az[1]) / 2, (el[0] + el[1]) / 2),
    tanH: Math.tan((Math.max(0.5, halfAz) * Math.PI) / 180),
    tanV: Math.tan((Math.max(0.5, halfEl) * Math.PI) / 180),
  };
}
