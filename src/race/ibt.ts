/**
 * iRacing's own telemetry files, `.ibt`, read directly.
 *
 * iRacing writes one when telemetry logging is on (Alt+L in the car): the whole
 * session at 60 Hz, every channel the sim exposes, with the session's YAML
 * description alongside. The file is the sim's documented memory layout
 * written to disk:
 *
 *   header (112 bytes)      version, tick rate, where the YAML and the
 *                           variable table are, the size of one sample row,
 *                           and where the rows start (varBuf[0].bufOffset)
 *   disk sub-header (32)    start date and time, lap count, row count
 *   variable table          144 bytes a channel: type, offset in the row,
 *                           count, name, description, unit
 *   YAML                    WeekendInfo, DriverInfo ...
 *   rows                    one per tick
 *
 * iRacing reports position as latitude, longitude and altitude, not in the
 * track's own frame, so positions are laid out in metres on a plane tangent at
 * the first sample: x east, z south, y up - so that from above, with the
 * camera's default heading, north is up the screen.
 */

import { num, t } from '../i18n';
import { type CarInfo, type LapTrace } from './lap';

export class UnreadableIbt extends Error {}

const HEADER = 112;
const VAR_HEADER = 144;
const EARTH = 6371008.8;

interface Var {
  type: number;
  offset: number;
  count: number;
  name: string;
  unit: string;
}

const TYPE_SIZE = [1, 1, 4, 4, 4, 8];

function cString(bytes: Uint8Array): string {
  const end = bytes.indexOf(0);
  return new TextDecoder('latin1').decode(end >= 0 ? bytes.subarray(0, end) : bytes).trim();
}

/** Every channel of one name, as numbers, across rows `from` to `to` (exclusive). */
function column(
  view: DataView,
  v: Var,
  start: number,
  rowLen: number,
  rows: number,
  from = 0,
): Float64Array {
  const out = new Float64Array(rows - from);
  for (let r = from; r < rows; r++) {
    const at = start + r * rowLen + v.offset;
    switch (v.type) {
      case 0:
      case 1:
        out[r - from] = view.getUint8(at);
        break;
      case 2:
        out[r - from] = view.getInt32(at, true);
        break;
      case 3:
        out[r - from] = view.getUint32(at, true);
        break;
      case 4:
        out[r - from] = view.getFloat32(at, true);
        break;
      case 5:
        out[r - from] = view.getFloat64(at, true);
        break;
    }
  }
  return out;
}

/** A line of the session YAML: `key: value`, the first match after `from`. */
function yamlValue(yaml: string, key: string, from = 0): string | undefined {
  const m = new RegExp(`^\\s*${key}:\\s*(.*)$`, 'm').exec(yaml.slice(from));
  return m ? m[1].trim() : undefined;
}

/** The player's car, from DriverInfo. */
function carFromYaml(yaml: string): CarInfo {
  const idx = yamlValue(yaml, 'DriverCarIdx');
  if (idx === undefined) return {};
  const at = yaml.search(new RegExp(`-\\s*CarIdx:\\s*${idx}\\s*$`, 'm'));
  if (at < 0) return {};
  const name = yamlValue(yaml, 'CarScreenName', at);
  const id = yamlValue(yaml, 'CarID', at);
  const cls = yamlValue(yaml, 'CarClassShortName', at);
  return {
    name: name || undefined,
    ordinal: id !== undefined && Number.isFinite(Number(id)) ? Number(id) : undefined,
    class: cls || undefined,
  };
}

/** Per-wheel channels iRacing carries, by its prefix: LF, RF, LR, RR. */
const WHEEL_PREFIX: Record<string, string> = { LF: 'FL', RF: 'FR', LR: 'RL', RR: 'RR' };

/** Every complete lap in an `.ibt` file. */
export function readIbt(buffer: ArrayBuffer, source: string): LapTrace[] {
  if (buffer.byteLength < HEADER + 32)
    throw new UnreadableIbt(t('race.ui.ibt.tooShort', { file: source }));
  const view = new DataView(buffer);
  const numVars = view.getInt32(24, true);
  const varHeaderOffset = view.getInt32(28, true);
  const rowLen = view.getInt32(36, true);
  const start = view.getInt32(48 + 4, true);
  const yamlLen = view.getInt32(16, true);
  const yamlOffset = view.getInt32(20, true);
  const recordCount = view.getInt32(HEADER + 28, true);
  const sane =
    numVars > 0 &&
    numVars < 10000 &&
    varHeaderOffset >= HEADER &&
    varHeaderOffset + numVars * VAR_HEADER <= buffer.byteLength &&
    rowLen > 0 &&
    start > 0 &&
    start <= buffer.byteLength;
  if (!sane) throw new UnreadableIbt(t('race.ui.ibt.noHeader', { file: source }));
  const rows = Math.max(
    0,
    Math.min(
      recordCount > 0 ? recordCount : Infinity,
      Math.floor((buffer.byteLength - start) / rowLen),
    ),
  );
  const bytes = new Uint8Array(buffer);
  const vars = new Map<string, Var>();
  for (let i = 0; i < numVars; i++) {
    const at = varHeaderOffset + i * VAR_HEADER;
    const v: Var = {
      type: view.getInt32(at, true),
      offset: view.getInt32(at + 4, true),
      count: view.getInt32(at + 8, true),
      name: cString(bytes.subarray(at + 16, at + 48)),
      unit: cString(bytes.subarray(at + 112, at + 144)),
    };
    if (v.type >= 0 && v.type < TYPE_SIZE.length) vars.set(v.name, v);
  }
  const yaml =
    yamlLen > 0 && yamlOffset > 0 ? cString(bytes.subarray(yamlOffset, yamlOffset + yamlLen)) : '';
  const get = (name: string) => {
    const v = vars.get(name);
    return v ? column(view, v, start, rowLen, rows) : undefined;
  };
  const time = get('SessionTime');
  const lap = get('Lap');
  const lat = get('Lat');
  const lon = get('Lon');
  if (!time || !lap || !lat || !lon) {
    throw new UnreadableIbt(t('race.ui.ibt.noChannels', { file: source }));
  }
  const pct = get('LapDistPct');
  const lapDist = get('LapDist');
  const alt = get('Alt');
  const steerMax = get('SteeringWheelAngleMax');

  // Scalar channels: iRacing's name, and how to turn it into ours.
  const scalars: [string, string, (v: number, i: number) => number][] = [
    ['Speed', 'speed', (v) => v],
    ['Throttle', 'throttle', (v) => v],
    ['Brake', 'brake', (v) => v],
    // iRacing counts the clutch as engaged; ours is the pedal.
    ['Clutch', 'clutch', (v) => 1 - v],
    // Radians, anticlockwise positive; ours is -1..1, right positive.
    ['SteeringWheelAngle', 'steer', (v, i) => -v / Math.max(0.1, steerMax?.[i] || Math.PI)],
    ['Gear', 'gear', (v) => v],
    ['RPM', 'rpm', (v) => v],
    ['LatAccel', 'latAcc', (v) => v],
    ['LongAccel', 'longAcc', (v) => v],
    ['VertAccel', 'vertAcc', (v) => v],
    ['Yaw', 'yaw', (v) => v],
    ['Pitch', 'pitch', (v) => v],
    ['Roll', 'roll', (v) => v],
    ['YawRate', 'yawRate', (v) => v],
    // Aids and settings, where the car has them.
    ['BrakeABSactive', 'absActive', (v) => v],
    ['dcABS', 'absLevel', (v) => v],
    ['dcTractionControl', 'tcLevel', (v) => v],
    // A percentage on some cars, a fraction on others; ours is a fraction.
    ['dcBrakeBias', 'brakeBias', (v) => (v > 1.5 ? v / 100 : v)],
    ['dcPitSpeedLimiterToggle', 'pitLimiter', (v) => v],
    ['FuelLevel', 'fuel', (v) => v],
    ['WaterTemp', 'waterTemp', (v) => v],
    ['OilTemp', 'oilTemp', (v) => v],
  ];
  // Per wheel: tyre carcass temperature across the middle, damper deflection,
  // pressure and tread.
  const wheels: [string, string, (v: number) => number][] = [
    ['tempCM', 'tireTemp', (v) => v],
    ['shockDefl', 'suspensionM', (v) => v],
    ['pressure', 'tirePressure', (v) => v * 0.145038],
    ['wearM', 'tireWear', (v) => 1 - v],
  ];
  const loaded = new Map<string, Float64Array>();
  for (const [name] of scalars) {
    const c = get(name);
    if (c) loaded.set(name, c);
  }
  for (const prefix of Object.keys(WHEEL_PREFIX)) {
    for (const [suffix] of wheels) {
      const c = get(prefix + suffix);
      if (c) loaded.set(prefix + suffix, c);
    }
  }
  // Everything else iRacing logged with one value per sample, under its own
  // name - per wheel when it has a wheel prefix - so the graphs and the cars'
  // value tables offer it without anyone having described it.
  const consumed = new Set<string>([
    'SessionTime',
    'Lap',
    'LapDist',
    'LapDistPct',
    'Lat',
    'Lon',
    'Alt',
    'SteeringWheelAngleMax',
    ...scalars.map(([name]) => name),
    ...Object.keys(WHEEL_PREFIX).flatMap((p) => wheels.map(([suffix]) => p + suffix)),
  ]);
  const passthrough: [string, string][] = [];
  for (const v of vars.values()) {
    if (consumed.has(v.name) || v.count !== 1 || v.type === 0) continue;
    const prefix = v.name.slice(0, 2);
    const wheel = WHEEL_PREFIX[prefix];
    passthrough.push([v.name, wheel && v.name.length > 2 ? `${v.name.slice(2)}.${wheel}` : v.name]);
  }

  // Positions on a plane tangent at the first fix.
  let lat0 = Number.NaN;
  let lon0 = Number.NaN;
  for (let i = 0; i < rows; i++) {
    if (lat[i] !== 0 || lon[i] !== 0) {
      lat0 = lat[i];
      lon0 = lon[i];
      break;
    }
  }
  if (!Number.isFinite(lat0)) throw new UnreadableIbt(t('race.ui.ibt.noFixes', { file: source }));
  const k = (Math.PI / 180) * EARTH;
  const cos0 = Math.cos((lat0 * Math.PI) / 180);

  const car = carFromYaml(yaml);
  const track = yamlValue(yaml, 'TrackDisplayName') ?? yamlValue(yaml, 'TrackName');
  const trackLength = Number.parseFloat(yamlValue(yaml, 'TrackLength') ?? '') * 1000;

  // Split on the lap counter; keep the laps driven from line to line.
  const out: LapTrace[] = [];
  let from = 0;
  for (let i = 1; i <= rows; i++) {
    if (i < rows && lap[i] === lap[from]) continue;
    const to = i - 1;
    const n = to - from + 1;
    const startPct = pct ? pct[from] : 0;
    const endPct = pct ? pct[to] : 1;
    const complete = n > 60 && startPct < 0.05 && endPct > 0.95;
    if (complete) {
      const ch: Record<string, Float32Array> = {};
      const make = () => new Float32Array(n);
      ch.time = make();
      ch.x = make();
      ch.y = make();
      ch.z = make();
      ch.distance = make();
      for (let j = 0; j < n; j++) {
        const r = from + j;
        ch.time[j] = time[r] - time[from];
        ch.x[j] = (lon[r] - lon0) * k * cos0;
        ch.z[j] = -(lat[r] - lat0) * k;
        ch.y[j] = alt ? alt[r] : 0;
        ch.distance[j] = lapDist ? lapDist[r] : 0;
      }
      for (const [name, ours, f] of scalars) {
        const c = loaded.get(name);
        if (!c) continue;
        const col = make();
        for (let j = 0; j < n; j++) col[j] = f(c[from + j], from + j);
        ch[ours] = col;
      }
      for (const [prefix, wheel] of Object.entries(WHEEL_PREFIX)) {
        for (const [suffix, ours, f] of wheels) {
          const c = loaded.get(prefix + suffix);
          if (!c) continue;
          const col = make();
          for (let j = 0; j < n; j++) col[j] = f(c[from + j]);
          ch[`${ours}.${wheel}`] = col;
        }
      }
      for (const [name, ours] of passthrough) {
        if (ch[ours]) continue;
        // This lap's rows only: a session can hold hundreds of these.
        ch[ours] = Float32Array.from(column(view, vars.get(name)!, start, rowLen, to + 1, from));
      }
      if (!lapDist) {
        // Driven distance from the positions.
        for (let j = 1; j < n; j++)
          ch.distance[j] =
            ch.distance[j - 1] + Math.hypot(ch.x[j] - ch.x[j - 1], ch.z[j] - ch.z[j - 1]);
      } else {
        const d0 = ch.distance[0];
        for (let j = 0; j < n; j++) ch.distance[j] -= d0;
      }
      out.push({
        id: `ibt${ibtId++}`,
        label: '',
        source: t('race.ui.ibt.lapSource', { file: source, lap: String(lap[from]) }),
        game: 'iracing',
        track: track || undefined,
        car,
        seconds: ch.time[n - 1],
        complete: true,
        channels: ch,
        count: n,
      });
    }
    from = i;
  }
  if (!out.length) {
    throw new UnreadableIbt(
      Number.isFinite(trackLength)
        ? t('race.ui.ibt.noCompleteLapOf', { file: source, km: num(trackLength / 1000, 2) })
        : t('race.ui.ibt.noCompleteLap', { file: source }),
    );
  }
  return out;
}

let ibtId = 1;
