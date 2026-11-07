/**
 * Lap files in, `LapTrace`s out.
 *
 * Four shapes are read, told apart by their content rather than their names:
 *
 * - `heat3d-lap` JSON, written by `heat3d_capture telemetry`: every channel the
 *   game sends, sixty times a second. The format every future game's recorder
 *   writes too.
 * - FH Companion's own lap files: thirteen channels every five metres.
 * - FH Companion's telemetry beside each lap file, `<lap>.json.tele.gz`: the
 *   whole of Forza's Data Out for that lap, one row per game tick - 64 a
 *   second, the repeats of a recorder that keeps every packet dropped
 *   (`readForzaTelemetry`). Given both, the lap is the telemetry with the lap
 *   file's car and time.
 * - CSV, one row per sample, many laps told apart by a `lap` column - what
 *   `heat3d_capture laps` writes for a whole course.
 *
 * iRacing's `.ibt` files are binary and read by `readIbt` (ibt.ts).
 */

import { detectDelimiter, splitCsvLine } from '../data/csv';
import { t } from '../i18n';
import { drivetrainName, forzaClass, type CarInfo, type LapMeta, type LapTrace } from './lap';
import { CHANNELS, splitChannel } from './schema';

export class UnreadableLap extends Error {}

let nextId = 1;
function newId(): string {
  return `lap${nextId++}`;
}

/** Every lap in one file's text. */
export function readLaps(text: string, source: string): LapTrace[] {
  const head = text.trimStart();
  if (head.startsWith('{') || head.startsWith('[')) {
    let document: unknown;
    try {
      document = JSON.parse(head.replace(/^﻿/, ''));
    } catch {
      throw new UnreadableLap(t('race.ui.lapFile.notJson', { file: source }));
    }
    return fromJson(document, source);
  }
  return fromCsv(text, source);
}

function fromJson(document: unknown, source: string): LapTrace[] {
  const doc = document as Record<string, unknown>;
  if (doc && doc.format === 'heat3d-lap') return [fromHeat3dLap(doc, source)];
  const lap = doc?.Lap as Record<string, unknown> | undefined;
  if (lap && Array.isArray(lap.samples)) return [fromFhCompanion(doc, source)];
  throw new UnreadableLap(t('race.ui.lapFile.unknownJson', { file: source }));
}

function column(values: unknown): Float32Array {
  const list = values as ArrayLike<number>;
  const out = new Float32Array(list.length);
  for (let i = 0; i < list.length; i++) out[i] = Number(list[i]);
  return out;
}

function fromHeat3dLap(doc: Record<string, unknown>, source: string): LapTrace {
  const raw = (doc.channels ?? {}) as Record<string, unknown>;
  const channels: Record<string, Float32Array> = {};
  for (const [name, values] of Object.entries(raw)) {
    if (Array.isArray(values)) channels[name] = column(values);
  }
  if (!channels.time || !channels.x || !channels.z) {
    throw new UnreadableLap(t('race.ui.lapFile.noPositionChannels', { file: source }));
  }
  channels.distance ??= pathDistance(channels);
  const car = (doc.car ?? {}) as Record<string, number | string>;
  const lap = (doc.lap ?? {}) as Record<string, unknown>;
  const num = (v: number | string | undefined) => (typeof v === 'number' ? v : undefined);
  const info: CarInfo = {
    ordinal: num(car.carOrdinal),
    name: typeof car.name === 'string' ? car.name : undefined,
    class: forzaClass(num(car.carClass)),
    pi: num(car.carPI),
    drivetrain: drivetrainName(num(car.drivetrain)),
  };
  const seconds = Number(lap.seconds ?? channels.time[channels.time.length - 1]);
  const units = (doc.units ?? {}) as Record<string, string>;
  const given = (doc.meta ?? {}) as LapMeta;
  const slipUnit = String(units.slipRatio ?? units.slipAngle ?? '');
  const meta: LapMeta = {
    ...given,
    slip:
      given.slip ??
      (!('slipRatio.FL' in channels) && !('slipAngle.FL' in channels)
        ? undefined
        : /raw/.test(slipUnit)
          ? 'scaled'
          : /normalised/.test(slipUnit)
            ? 'peak'
            : 'physical'),
  };
  return finish({
    id: newId(),
    label: '',
    source,
    game: String(doc.game ?? 'unknown'),
    track: typeof doc.track === 'string' ? doc.track : undefined,
    car: info,
    seconds,
    complete: lap.complete !== false,
    channels,
    count: channels.time.length,
    meta,
  });
}

/** FH Companion's field names, to the canonical ones. `LatG`/`LongG` are m/s². */
const FH_FIELDS: Record<string, string> = {
  Metres: 'distance',
  Seconds: 'time',
  X: 'x',
  Y: 'y',
  Z: 'z',
  Speed: 'speed',
  Throttle: 'throttle',
  Brake: 'brake',
  Steer: 'steer',
  LatG: 'latAcc',
  LongG: 'longAcc',
  Clutch: 'clutch',
  HandBrake: 'handbrake',
  Gear: 'gear',
  Puddle: 'puddle',
};

function fromFhCompanion(doc: Record<string, unknown>, source: string): LapTrace {
  const lap = doc.Lap as Record<string, unknown>;
  const samples = lap.samples as Array<Record<string, number>>;
  const channels: Record<string, Float32Array> = {};
  for (const [from, to] of Object.entries(FH_FIELDS)) {
    if (samples.length && from in samples[0]) {
      const out = new Float32Array(samples.length);
      for (let i = 0; i < samples.length; i++) out[i] = Number(samples[i][from]);
      channels[to] = out;
    }
  }
  if (!channels.time || !channels.x) throw new UnreadableLap(t('race.ui.lapFile.noSamples', { file: source }));
  // Time from the lap's own start: the first sample is a few milliseconds in.
  const t0 = channels.time[0];
  for (let i = 0; i < channels.time.length; i++) channels.time[i] -= t0;
  const info: CarInfo = {
    ordinal: lap.carOrdinal as number,
    // Newer FH Companion lap files name the car; older ones only number it.
    name: typeof lap.carName === 'string' && lap.carName ? lap.carName : undefined,
    class: typeof doc.Class === 'string' ? doc.Class : forzaClass(lap.carClass as number),
    pi: lap.performanceIndex as number,
    drivetrain: drivetrainName(lap.drivetrain as number),
    peakKw: lap.peakKilowatts as number,
  };
  return finish({
    id: newId(),
    label: '',
    source,
    game: 'forza-horizon',
    track: typeof lap.track === 'string' ? lap.track : undefined,
    car: info,
    seconds: Number(lap.lapSeconds),
    // FH Companion keeps runs that never reached the finish too, apart.
    complete: lap.EndedAtFinish !== false,
    channels,
    count: samples.length,
  });
}

/** Forza's Data Out field names, as FH Companion's telemetry files keep them. */
const FORZA_FIELDS: Record<string, [string, number]> = {
  t: ['time', 1],
  metres: ['distance', 1],
  PositionX: ['x', 1],
  PositionY: ['y', 1],
  PositionZ: ['z', 1],
  Yaw: ['yaw', 1],
  Pitch: ['pitch', 1],
  Roll: ['roll', 1],
  // Car-local: x to the right, y up, z forwards.
  VelocityX: ['latVel', 1],
  VelocityY: ['vertVel', 1],
  VelocityZ: ['longVel', 1],
  AccelerationX: ['latAcc', 1],
  AccelerationY: ['vertAcc', 1],
  AccelerationZ: ['longAcc', 1],
  AngularVelocityY: ['yawRate', 1],
  Speed: ['speed', 1],
  CurrentEngineRpm: ['rpm', 1],
  Gear: ['gear', 1],
  Power: ['power', 1],
  Torque: ['torque', 1],
  Boost: ['boost', 1],
  Fuel: ['fuel', 1],
  // Pedals 0..255, steering -127..127.
  Accel: ['throttle', 1 / 255],
  Brake: ['brake', 1 / 255],
  Clutch: ['clutch', 1 / 255],
  HandBrake: ['handbrake', 1 / 255],
  Steer: ['steer', 1 / 127],
};
const FORZA_WHEEL_FIELDS: Record<string, [string, number]> = {
  NormalizedSuspensionTravel: ['suspension', 1],
  TireSlipRatio: ['slipRatio', 1],
  TireSlipAngle: ['slipAngle', 1],
  TireCombinedSlip: ['combinedSlip', 1],
  TireTemp: ['tireTemp', 1],
  WheelRotationSpeed: ['wheelSpeed', 1],
  WheelInPuddle: ['puddle', 1],
  WheelOnRumbleStrip: ['rumble', 1],
  SurfaceRumble: ['surfaceRumble', 1],
};
const FORZA_WHEELS: Record<string, string> = {
  FrontLeft: 'FL',
  FrontRight: 'FR',
  RearLeft: 'RL',
  RearRight: 'RR',
};

/**
 * Forza's Data Out for one lap, as FH Companion keeps it beside the lap file:
 * `{ version, columns, data }`, one row per packet, the game's own field
 * names. `lapFile`, when given, is the lap file it belongs to, for the car and
 * the lap time; without it the lap still reads, as an unknown car.
 */
export function readForzaTelemetry(document: unknown, source: string, lapFile?: unknown): LapTrace {
  const doc = document as {
    columns?: unknown;
    data?: unknown;
    // Format 2 adds what the lap file says, for a telemetry file on its own.
    car?: { ordinal?: number; name?: string; class?: string; pi?: number };
    track?: string;
    lapSeconds?: number;
  };
  if (!doc || !Array.isArray(doc.columns) || !Array.isArray(doc.data)) {
    throw new UnreadableLap(t('race.ui.lapFile.notTelemetry', { file: source }));
  }
  const columns = doc.columns as string[];
  // Format 2 keeps every packet, about 110 a second against the game's 64
  // ticks, so a row can repeat the one before it but for the recorder's own
  // clock: one of each is enough. Columns are looked up by name, never by
  // position - the two formats order them differently.
  const skip = new Set(['t', 'metres']);
  const compare = columns.map((c, i) => (skip.has(c) ? -1 : i)).filter((i) => i >= 0);
  const all = doc.data as number[][];
  const rows = all.filter((row, k) => k === 0 || compare.some((i) => row[i] !== all[k - 1][i]));
  const channels: Record<string, Float32Array> = {};
  const take = (index: number, name: string, scale: number) => {
    const out = new Float32Array(rows.length);
    for (let i = 0; i < rows.length; i++) out[i] = Number(rows[i][index]) * scale;
    channels[name] = out;
  };
  columns.forEach((column, index) => {
    const direct = FORZA_FIELDS[column];
    if (direct) return take(index, direct[0], direct[1]);
    for (const [prefix, [name, scale]] of Object.entries(FORZA_WHEEL_FIELDS)) {
      if (!column.startsWith(prefix)) continue;
      const wheel = FORZA_WHEELS[column.slice(prefix.length)];
      if (wheel) take(index, `${name}.${wheel}`, scale);
    }
  });
  if (!channels.time || !channels.x || !channels.z) {
    throw new UnreadableLap(t('race.ui.lapFile.noPositionColumns', { file: source }));
  }
  // Tyre temperatures come in Fahrenheit.
  for (const w of ['FL', 'FR', 'RL', 'RR']) {
    const temp = channels[`tireTemp.${w}`];
    if (temp) for (let i = 0; i < temp.length; i++) temp[i] = ((temp[i] - 32) * 5) / 9;
  }
  channels.distance ??= pathDistance(channels);
  const hasSlip = Object.keys(channels).some((k) => /^(slipRatio|slipAngle|combinedSlip)\./.test(k));
  const meta: LapMeta = { slip: hasSlip ? 'peak' : undefined };
  const own = doc.car ?? {};
  if (lapFile) {
    const lap = fromFhCompanion(lapFile as Record<string, unknown>, source);
    return finish({
      ...lap,
      track: lap.track ?? (typeof doc.track === 'string' ? doc.track : undefined),
      car: { ...lap.car, name: (typeof own.name === 'string' && own.name) || lap.car.name },
      channels,
      count: rows.length,
      meta: { ...lap.meta, ...meta },
    });
  }
  return finish({
    id: newId(),
    label: '',
    source,
    game: 'forza-horizon',
    track: typeof doc.track === 'string' ? doc.track : undefined,
    car: {
      ordinal: typeof own.ordinal === 'number' ? own.ordinal : undefined,
      name: typeof own.name === 'string' && own.name ? own.name : undefined,
      class: typeof own.class === 'string' ? own.class : undefined,
      pi: typeof own.pi === 'number' ? own.pi : undefined,
    },
    seconds:
      typeof doc.lapSeconds === 'number' && doc.lapSeconds > 0
        ? doc.lapSeconds
        : channels.time[rows.length - 1] - channels.time[0],
    complete: true,
    channels,
    count: rows.length,
    meta,
  });
}

/** Column names a lap CSV may use, to the canonical ones. */
const CSV_FIELDS: Record<string, string> = {
  x: 'x',
  y: 'y',
  z: 'z',
  speed_ms: 'speed',
  speed: 'speed',
  throttle: 'throttle',
  brake: 'brake',
  steer: 'steer',
  lat_g: 'latAcc',
  long_g: 'longAcc',
  gear: 'gear',
  clutch: 'clutch',
  handbrake: 'handbrake',
  puddle: 'puddle',
  metres: 'distance',
  distance: 'distance',
  elapsed: 'time',
  time: 'time',
};

/**
 * A column that already carries a channel's canonical name - `latVel`,
 * `slipIndex.FL` - as recorders that write CSV name them.
 */
function canonicalColumn(name: string): string | null {
  const [base, wheel] = splitChannel(name);
  const info = CHANNELS[base];
  if (!info) return null;
  if (wheel) return info.kind === 'wheel' ? name : null;
  return info.kind === 'scalar' ? name : null;
}

interface CsvDescription {
  game?: string;
  track?: string;
  seconds?: number;
  complete?: boolean;
  meta?: LapMeta;
  car?: CarInfo;
}

function fromCsv(text: string, source: string): LapTrace[] {
  let lines = text
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((l) => l.length > 0);
  // A recorder's description of the run, as JSON after a '#'.
  let described: CsvDescription = {};
  if (lines[0]?.startsWith('#')) {
    try {
      described = JSON.parse(lines[0].slice(1).trim()) as CsvDescription;
    } catch {
      described = {};
    }
    lines = lines.slice(1);
  }
  if (lines.length < 3) throw new UnreadableLap(t('race.ui.lapFile.noRows', { file: source }));
  const delimiter = detectDelimiter(lines.slice(0, 5).join('\n'));
  const original = splitCsvLine(lines[0], delimiter).map((h) => h.trim());
  const header = original.map((h) => h.toLowerCase());
  const at = (name: string) => header.indexOf(name);
  const mapped = header
    .map((name, index) => ({ index, to: CSV_FIELDS[name] ?? canonicalColumn(original[index]) }))
    .filter((c): c is { index: number; to: string } => !!c.to);
  if (at('x') < 0 || at('z') < 0) throw new UnreadableLap(t('race.ui.lapFile.noXz', { file: source }));
  const lapColumn = at('lap');
  const groups = new Map<string, string[][]>();
  for (let i = 1; i < lines.length; i++) {
    const row = splitCsvLine(lines[i], delimiter);
    const key = lapColumn >= 0 ? row[lapColumn] : 'lap';
    let list = groups.get(key);
    if (!list) groups.set(key, (list = []));
    list.push(row);
  }
  const out: LapTrace[] = [];
  for (const [key, rows] of groups) {
    const channels: Record<string, Float32Array> = {};
    for (const { index, to } of mapped) {
      if (channels[to]) continue;
      const values = new Float32Array(rows.length);
      for (let i = 0; i < rows.length; i++) values[i] = Number(rows[i][index]);
      channels[to] = values;
    }
    if (!channels.time) continue;
    channels.distance ??= pathDistance(channels);
    const first = rows[0];
    const get = (name: string) => (at(name) >= 0 ? first[at(name)] : undefined);
    const seconds = Number(described.seconds ?? get('lap_seconds') ?? channels.time[channels.time.length - 1]);
    const ordinal = Number(get('car'));
    out.push(
      finish({
        id: newId(),
        label: '',
        source: groups.size > 1 ? `${source} · ${key}` : source,
        game: described.game ?? 'forza-horizon',
        track: described.track ?? get('course'),
        car: described.car ?? {
          ordinal: Number.isFinite(ordinal) ? ordinal : undefined,
          class: get('car_class'),
          pi: get('pi') !== undefined ? Number(get('pi')) : undefined,
        },
        seconds,
        complete: described.complete ?? true,
        channels,
        count: rows.length,
        meta: described.meta,
      }),
    );
  }
  if (!out.length) throw new UnreadableLap(t('race.ui.lapFile.noTimeColumn', { file: source }));
  return out;
}

/** Driven distance from positions, for sources that do not carry it. */
function pathDistance(channels: Record<string, Float32Array>): Float32Array {
  const { x, z } = channels;
  const y = channels.y;
  const out = new Float32Array(x.length);
  for (let i = 1; i < x.length; i++) {
    const dy = y ? y[i] - y[i - 1] : 0;
    out[i] = out[i - 1] + Math.hypot(x[i] - x[i - 1], dy, z[i] - z[i - 1]);
  }
  return out;
}

function finish(lap: LapTrace): LapTrace {
  // Time and distance from the lap's own start.
  for (const name of ['time', 'distance']) {
    const v = lap.channels[name];
    const v0 = v[0];
    if (v0 !== 0) for (let i = 0; i < v.length; i++) v[i] -= v0;
  }
  // Speed, when the source left it out: distance over time.
  if (!lap.channels.speed) {
    const { time, distance } = lap.channels;
    const speed = new Float32Array(lap.count);
    for (let i = 0; i < lap.count; i++) {
      const a = Math.max(0, i - 1);
      const b = Math.min(lap.count - 1, i + 1);
      const dt = time[b] - time[a];
      speed[i] = dt > 0 ? (distance[b] - distance[a]) / dt : 0;
    }
    lap.channels.speed = speed;
  }
  return lap;
}
