/**
 * Flight data per track, as Tacview shows it: what the recording says
 * (IAS, TAS, Mach, AOA, AGL, Throttle, Fuel... - every ACMI 2.2 property
 * with a meaning), and what can be worked out from positions and attitude
 * where it does not say: ground speed, true airspeed, an IAS/CAS estimate
 * from the ISA atmosphere, Mach, vertical speed, course, turn rate and
 * radius, G-load, angle of attack and sideslip, specific energy.
 *
 * Derivatives come from least-squares slopes over a time window, never from
 * one frame to the next: a recording written four times a second differenced
 * sample to sample shows a level turn as a saw of G spikes. The window is a
 * few samples wide and at least half a second each side, cut where the
 * track has a gap, so a respawn is never differentiated.
 *
 * World frame: x east, y up, -z north (as every loader puts it). Positions are
 * divided by the data's units per metre.
 */

import type { Dataset } from '../state/types';

export const G0 = 9.80665;
const R_AIR = 287.053;
const GAMMA = 1.4;
const P0 = 101325;
const T0 = 288.15;
const A0 = Math.sqrt(GAMMA * R_AIR * T0);
const RAD = Math.PI / 180;

// ------------------------------------------------------------------ atmosphere

/** The ISA atmosphere at `h` metres: temperature (K), pressure (Pa), density (kg/m³), speed of sound (m/s). */
export function isa(h: number): { T: number; p: number; rho: number; a: number } {
  const hh = Math.max(-1000, Math.min(32000, h));
  let T: number;
  let p: number;
  if (hh <= 11000) {
    T = T0 - 0.0065 * hh;
    p = P0 * Math.pow(T / T0, 5.25588);
  } else if (hh <= 20000) {
    T = 216.65;
    p = 22632.06 * Math.exp((-(hh - 11000) * G0) / (R_AIR * T));
  } else {
    T = 216.65 + 0.001 * (hh - 20000);
    p = 5474.89 * Math.pow(T / 216.65, -34.1632);
  }
  return { T, p, rho: p / (R_AIR * T), a: Math.sqrt(GAMMA * R_AIR * T) };
}

/** Mach from true airspeed at a height, in the ISA atmosphere. */
export function machOf(tas: number, h: number): number {
  return tas / isa(h).a;
}

/**
 * Calibrated airspeed from true airspeed at a height (ISA, no wind, no
 * instrument error): the pitot's impact pressure, said again at sea level.
 * What an IAS gauge reads, give or take its position error.
 */
export function casOf(tas: number, h: number): number {
  if (!Number.isFinite(tas)) return NaN;
  const { p, a } = isa(h);
  const M = Math.abs(tas) / a;
  // Impact pressure: isentropic below Mach 1, Rayleigh's pitot formula above.
  const qc = M < 1 ? p * (Math.pow(1 + 0.2 * M * M, 3.5) - 1) : p * ((166.92158 * Math.pow(M, 7)) / Math.pow(7 * M * M - 1, 2.5) - 1);
  const r = qc / P0 + 1;
  let cas = A0 * Math.sqrt(5 * (Math.pow(r, 2 / 7) - 1));
  if (cas > A0) {
    // Supersonic at sea level: the Rayleigh form, solved by iteration.
    for (let i = 0; i < 20; i++) cas = A0 * 0.881285 * Math.sqrt(r * Math.pow(1 - 1 / (7 * (cas / A0) ** 2), 2.5));
  }
  return cas;
}

// ------------------------------------------------------------------ derivatives

/**
 * The least-squares slope of `v` over `t` at each sample, from the samples
 * within `half` seconds either side and within the sample's segment
 * (`seg[i]` the same). NaN values are skipped; fewer than two leave NaN.
 */
export function windowSlope(t: ArrayLike<number>, v: ArrayLike<number>, half: number, seg?: ArrayLike<number>): Float64Array {
  const n = t.length;
  const out = new Float64Array(n).fill(NaN);
  let lo = 0;
  let hi = 0;
  for (let i = 0; i < n; i++) {
    while (lo < i && (t[i] - t[lo] > half || (seg && seg[lo] !== seg[i]))) lo++;
    if (hi < i) hi = i;
    while (hi + 1 < n && t[hi + 1] - t[i] <= half && (!seg || seg[hi + 1] === seg[i])) hi++;
    let sn = 0;
    let st = 0;
    let sv = 0;
    for (let j = lo; j <= hi; j++) {
      if (!Number.isFinite(v[j])) continue;
      sn++;
      st += t[j];
      sv += v[j];
    }
    if (sn < 2) continue;
    const tm = st / sn;
    const vm = sv / sn;
    let num = 0;
    let den = 0;
    for (let j = lo; j <= hi; j++) {
      if (!Number.isFinite(v[j])) continue;
      const dt = t[j] - tm;
      num += dt * (v[j] - vm);
      den += dt * dt;
    }
    if (den > 1e-12) out[i] = num / den;
  }
  return out;
}

/** Segment numbers: a new one wherever the gap to the previous sample exceeds `gap` seconds. */
export function segmentsOf(t: ArrayLike<number>, gap: number): Int32Array {
  const s = new Int32Array(t.length);
  for (let i = 1; i < t.length; i++) s[i] = s[i - 1] + (t[i] - t[i - 1] > gap ? 1 : 0);
  return s;
}

function median(values: number[]): number {
  if (!values.length) return NaN;
  const v = values.slice().sort((a, b) => a - b);
  return v[v.length >> 1];
}

// ------------------------------------------------------------------ attitude

/**
 * Body axes in east-north-up from heading, pitch and roll (radians; heading
 * clockwise from north, pitch nose up, roll right wing down).
 */
export function bodyAxes(heading: number, pitch: number, roll: number): { fwd: [number, number, number]; right: [number, number, number]; up: [number, number, number] } {
  const sh = Math.sin(heading);
  const ch = Math.cos(heading);
  const sp = Math.sin(pitch);
  const cp = Math.cos(pitch);
  const sr = Math.sin(roll);
  const cr = Math.cos(roll);
  const fwd: [number, number, number] = [sh * cp, ch * cp, sp];
  const r0: [number, number, number] = [ch, -sh, 0];
  const u0: [number, number, number] = [-sh * sp, -ch * sp, cp];
  return {
    fwd,
    right: [r0[0] * cr - u0[0] * sr, r0[1] * cr - u0[1] * sr, r0[2] * cr - u0[2] * sr],
    up: [u0[0] * cr + r0[0] * sr, u0[1] * cr + r0[1] * sr, u0[2] * cr + r0[2] * sr],
  };
}

const dot = (a: ArrayLike<number>, b: ArrayLike<number>) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Angle of attack and sideslip (radians) of an ENU velocity against the body axes. */
export function aeroAngles(v: [number, number, number], axes: ReturnType<typeof bodyAxes>): { aoa: number; aos: number } {
  const u = dot(v, axes.fwd);
  const side = dot(v, axes.right);
  const w = -dot(v, axes.up);
  const speed = Math.hypot(v[0], v[1], v[2]);
  if (speed < 1e-3) return { aoa: NaN, aos: NaN };
  return { aoa: Math.atan2(w, u), aos: Math.asin(Math.max(-1, Math.min(1, side / speed))) };
}

/**
 * Load factor from an ENU acceleration: the specific force (acceleration
 * less gravity) along the body's up axis, in g; without attitude, the part
 * of it square to the velocity (a coordinated turn's load).
 */
export function loadFactor(a: [number, number, number], up: [number, number, number] | null, v: [number, number, number]): number {
  const f: [number, number, number] = [a[0], a[1], a[2] + G0];
  if (up) return dot(f, up) / G0;
  const s = Math.hypot(v[0], v[1], v[2]);
  if (s < 1) return Math.hypot(f[0], f[1], f[2]) / G0;
  const along = dot(f, v) / s;
  return Math.sqrt(Math.max(0, dot(f, f) - along * along)) / G0;
}

// ------------------------------------------------------------------ parameters

/** How a value is measured, which says how it is shown. */
export type ParamKind = 'altitude' | 'distance' | 'speed' | 'vspeed' | 'angle' | 'heading' | 'rate' | 'g' | 'mach' | 'ratio' | 'mass' | 'massFlow' | 'volume' | 'rpm' | 'number' | 'flag';

export interface ParamDef {
  id: string;
  kind: ParamKind;
  /** The Tacview/table columns that carry it, first match wins (case-insensitive, exact). */
  columns?: string[];
  /** Summed over every column whose name matches (fuel tanks). */
  sumColumns?: RegExp;
  /** Worked out when no column carries it. */
  derived?: boolean;
  /** Worked out by an estimate rather than measured (shown with a "~"). */
  estimate?: boolean;
}

/**
 * Every value a track can show, in the order a full readout lists them:
 * Tacview's telemetry window, its ACMI 2.2 properties with a flight meaning,
 * and what is derived when the recording does not say.
 */
export const PARAMS: ParamDef[] = [
  { id: 'alt', kind: 'altitude', derived: true },
  { id: 'agl', kind: 'altitude', columns: ['AGL'], derived: true },
  { id: 'tas', kind: 'speed', columns: ['TAS', 'speed'], derived: true },
  { id: 'ias', kind: 'speed', columns: ['IAS', 'CAS'], derived: true, estimate: true },
  { id: 'cas', kind: 'speed', columns: ['CAS', 'IAS'], derived: true, estimate: true },
  { id: 'gs', kind: 'speed', derived: true },
  { id: 'mach', kind: 'mach', columns: ['Mach'], derived: true },
  { id: 'vs', kind: 'vspeed', derived: true },
  { id: 'heading', kind: 'heading', columns: ['HDG', 'Heading'], derived: true },
  { id: 'hdm', kind: 'heading', columns: ['HDM'] },
  { id: 'course', kind: 'heading', derived: true },
  { id: 'pitch', kind: 'angle', columns: ['Pitch'], derived: true },
  { id: 'roll', kind: 'angle', columns: ['Roll'] },
  { id: 'aoa', kind: 'angle', columns: ['AOA'], derived: true },
  { id: 'aos', kind: 'angle', columns: ['AOS'], derived: true },
  { id: 'g', kind: 'g', columns: ['VerticalGForce'], derived: true },
  { id: 'gLong', kind: 'g', columns: ['LongitudinalGForce'], derived: true },
  { id: 'gLat', kind: 'g', columns: ['LateralGForce'] },
  { id: 'turnRate', kind: 'rate', derived: true },
  { id: 'turnRadius', kind: 'distance', derived: true },
  { id: 'energy', kind: 'altitude', derived: true },
  { id: 'energyRate', kind: 'vspeed', derived: true },
  { id: 'throttle', kind: 'ratio', columns: ['Throttle'] },
  { id: 'throttle2', kind: 'ratio', columns: ['Throttle2'] },
  { id: 'afterburner', kind: 'ratio', columns: ['Afterburner'] },
  { id: 'rpm', kind: 'rpm', columns: ['EngineRPM', 'rpm'] },
  { id: 'rpm2', kind: 'rpm', columns: ['EngineRPM2'] },
  { id: 'rotor', kind: 'ratio', columns: ['NR'] },
  { id: 'fuel', kind: 'mass', sumColumns: /^FuelWeight\d?$/i },
  { id: 'fuelVolume', kind: 'volume', sumColumns: /^FuelVolume\d?$/i },
  { id: 'fuelFlow', kind: 'massFlow', sumColumns: /^FuelFlowWeight\d?$/i },
  { id: 'airbrakes', kind: 'ratio', columns: ['AirBrakes'] },
  { id: 'flaps', kind: 'ratio', columns: ['Flaps'] },
  { id: 'gear', kind: 'ratio', columns: ['LandingGear'] },
  { id: 'tailhook', kind: 'ratio', columns: ['Tailhook'] },
  { id: 'onGround', kind: 'flag', columns: ['OnGround'] },
  { id: 'health', kind: 'ratio', columns: ['Health'] },
  { id: 'alive', kind: 'flag', columns: ['alive'] },
  { id: 'radarMode', kind: 'number', columns: ['RadarMode'] },
  { id: 'radarRange', kind: 'distance', columns: ['RadarRange'] },
  { id: 'lockRange', kind: 'distance', columns: ['LockedTargetRange'] },
  { id: 'qnh', kind: 'number', columns: ['QNH', 'AltimeterSetting'] },
  { id: 'windSpeed', kind: 'speed', columns: ['WindSpeed'] },
  { id: 'windDir', kind: 'heading', columns: ['WindDirection'] },
  { id: 'heartRate', kind: 'number', columns: ['HeartRate'] },
];

export const PARAM_BY_ID: Record<string, ParamDef> = Object.fromEntries(PARAMS.map((p) => [p.id, p]));

/** Columns a parameter reads, so the "other columns" list does not show them twice. */
export function paramColumnNames(): Set<string> {
  const s = new Set<string>();
  for (const p of PARAMS) for (const c of p.columns ?? []) s.add(c.toLowerCase());
  return s;
}

/** Where a series' value comes from: the recording, worked out exactly, or an estimate. */
export type Source = 'data' | 'derived' | 'estimate';

export interface FlightSeries {
  person: number;
  /** Dataset rows, in time order. */
  rows: Uint32Array;
  time: Float64Array;
  /** World position, metres. */
  x: Float64Array;
  y: Float64Array;
  z: Float64Array;
  values: Record<string, Float64Array>;
  source: Record<string, Source>;
  /** -1 where the recording counts roll left-wing-down positive (found from its turns), else 1. */
  rollSign?: number;
}

// ------------------------------------------------------------------ per-person rows

const rowIndexCache = new WeakMap<Dataset, { start: Uint32Array; rows: Uint32Array }>();

/** Each person's rows, in time order (the dataset's own order), as one CSR index. */
export function personRows(d: Dataset): { start: Uint32Array; rows: Uint32Array } | null {
  const g = personRowsSteps(d);
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}

/** Rows a step of `personRowsSteps` goes through: well under a millisecond. */
const ROWS_STEP = 1 << 17;

/** `personRows` in steps of `ROWS_STEP` rows (and a person's sort each), for work spread over frames. */
export function* personRowsSteps(d: Dataset): Generator<void, { start: Uint32Array; rows: Uint32Array } | null, void> {
  if (!d.personId) return null;
  const hit = rowIndexCache.get(d);
  if (hit) return hit;
  const persons = Math.max(d.personLabels.length, 1);
  const start = new Uint32Array(persons + 1);
  const pid = d.personId;
  for (let i = 0; i < d.count; i++) {
    if ((i & (ROWS_STEP - 1)) === ROWS_STEP - 1) yield;
    start[pid[i] + 1]++;
  }
  for (let p = 0; p < persons; p++) start[p + 1] += start[p];
  const fill = start.slice(0, persons);
  const rows = new Uint32Array(d.count);
  // Rows are stored in time order; a dataset that is not (timeSorted false) gets each person's sorted below.
  for (let i = 0; i < d.count; i++) {
    if ((i & (ROWS_STEP - 1)) === ROWS_STEP - 1) yield;
    rows[fill[pid[i]]++] = i;
  }
  if (!d.timeSorted && d.time) {
    const time = d.time;
    for (let p = 0; p < persons; p++) {
      yield;
      const part = rows.subarray(start[p], start[p + 1]);
      part.sort((a, b) => time[a] - time[b]);
    }
  }
  // Another caller may have built it meanwhile: one index per dataset.
  const again = rowIndexCache.get(d);
  if (again) return again;
  const out = { start, rows };
  rowIndexCache.set(d, out);
  return out;
}

/** Units of the data in a metre (see replayData.unitsPerMetre; repeated so this module stands alone). */
function unitsPerMetre(d: Dataset): number {
  return d.entitySize ? d.entitySize / 0.8 : 1;
}

/** A numeric attribute by any of `names`, case-insensitive. */
function numericAttr(d: Dataset, names: string[]): Float32Array | null {
  for (const n of names) {
    const a = d.attrs.find((x) => x.kind === 'number' && x.name.trim().toLowerCase() === n.toLowerCase());
    if (a) return a.data as Float32Array;
  }
  return null;
}

const seriesCache = new WeakMap<Dataset, Map<string, FlightSeries | null>>();

/**
 * One track's flight data over the session (`session` -1: all of it), worked
 * out once and kept with the dataset.
 */
export function flightSeries(d: Dataset, person: number, session = -1): FlightSeries | null {
  let cache = seriesCache.get(d);
  if (!cache) seriesCache.set(d, (cache = new Map()));
  const key = `${person}|${session}`;
  if (cache.has(key)) return cache.get(key)!;
  const s = computeSeries(d, person, session);
  cache.set(key, s);
  return s;
}

function computeSeries(d: Dataset, person: number, session: number): FlightSeries | null {
  const idx = personRows(d);
  if (!idx || !d.time || person < 0 || person + 1 >= idx.start.length) return null;
  let rowsAll = idx.rows.subarray(idx.start[person], idx.start[person + 1]);
  if (session >= 0 && d.sessionId) {
    const sid = d.sessionId;
    rowsAll = rowsAll.filter((r) => sid[r] === session);
  }
  // One sample per instant: an event row at a sample's time repeats its position.
  const keep: number[] = [];
  for (let k = 0; k < rowsAll.length; k++) {
    const r = rowsAll[k];
    if (keep.length && d.time[keep[keep.length - 1]] === d.time[r]) continue;
    keep.push(r);
  }
  const n = keep.length;
  if (n === 0) return null;
  const rows = Uint32Array.from(keep);
  const k = unitsPerMetre(d);
  const time = new Float64Array(n);
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const z = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const r = rows[i];
    time[i] = d.time[r];
    x[i] = d.px[r] / k;
    y[i] = d.py[r] / k;
    z[i] = d.pz[r] / k;
  }
  const values: Record<string, Float64Array> = {};
  const source: Record<string, Source> = {};
  const fromColumn = (col: Float32Array) => {
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) out[i] = col[rows[i]];
    return out;
  };
  const hasValues = (a: Float64Array) => a.some((v) => Number.isFinite(v));
  // Columns first: what the recording says wins.
  for (const p of PARAMS) {
    if (p.columns) {
      const col = numericAttr(d, p.columns);
      if (col) {
        const v = fromColumn(col);
        if (hasValues(v)) {
          values[p.id] = v;
          source[p.id] = 'data';
        }
      }
    } else if (p.sumColumns) {
      const cols = d.attrs.filter((a) => a.kind === 'number' && p.sumColumns!.test(a.name.trim()));
      if (cols.length) {
        const v = new Float64Array(n).fill(NaN);
        for (const c of cols) {
          const data = c.data as Float32Array;
          for (let i = 0; i < n; i++) {
            const x0 = data[rows[i]];
            if (Number.isFinite(x0)) v[i] = (Number.isFinite(v[i]) ? v[i] : 0) + x0;
          }
        }
        if (hasValues(v)) {
          values[p.id] = v;
          source[p.id] = 'data';
        }
      }
    }
  }

  // ---- kinematics, in east-north-up metres
  const E = x;
  const N = new Float64Array(n);
  for (let i = 0; i < n; i++) N[i] = -z[i];
  const U = y;
  const gaps: number[] = [];
  for (let i = 1; i < n; i++) gaps.push(time[i] - time[i - 1]);
  const md = median(gaps.filter((g) => g > 0)) || 1;
  const seg = segmentsOf(time, Math.max(5, md * 8));
  const hv = Math.max(0.5, md * 2.01);
  const ha = Math.max(0.75, md * 3.01);
  const vE = windowSlope(time, E, hv, seg);
  const vN = windowSlope(time, N, hv, seg);
  const vU = windowSlope(time, U, hv, seg);
  const aE = windowSlope(time, vE, ha, seg);
  const aN = windowSlope(time, vN, ha, seg);
  const aU = windowSlope(time, vU, ha, seg);

  const put = (id: string, v: Float64Array, src: Source) => {
    if (values[id]) return;
    values[id] = v;
    source[id] = src;
  };
  const arr = () => new Float64Array(n).fill(NaN);

  const alt = new Float64Array(n);
  for (let i = 0; i < n; i++) alt[i] = U[i];
  // An Altitude column is the recording's own height above sea level.
  const altCol = numericAttr(d, ['Altitude']);
  put('alt', altCol ? fromColumn(altCol) : alt, altCol ? 'data' : 'derived');

  const gs = arr();
  const speed3 = arr();
  const vs = arr();
  const course = arr();
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(vE[i])) continue;
    gs[i] = Math.hypot(vE[i], vN[i]);
    speed3[i] = Math.hypot(vE[i], vN[i], vU[i]);
    vs[i] = vU[i];
    course[i] = gs[i] > 0.5 ? ((Math.atan2(vE[i], vN[i]) / RAD) + 360) % 360 : NaN;
  }
  put('gs', gs, 'derived');
  put('vs', vs, 'derived');
  put('course', course, 'derived');
  // Without wind, true airspeed is the speed over the ground in three dimensions;
  // where a recorded speed has gaps (a ship, a moment unrecorded), that fills them.
  put('tas', speed3, 'derived');
  if (values.tas !== speed3) for (let i = 0; i < n; i++) if (!Number.isFinite(values.tas[i])) values.tas[i] = speed3[i];
  const tas = values.tas;
  const altV = values.alt;

  const mach = arr();
  const cas = arr();
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(tas[i])) continue;
    mach[i] = machOf(tas[i], altV[i]);
    cas[i] = casOf(tas[i], altV[i]);
  }
  put('mach', mach, 'derived');
  put('ias', cas, 'estimate');
  put('cas', cas, 'estimate');

  // ---- attitude: heading from the column or the look yaw, pitch likewise, roll only from a column
  const headingDeg = values.heading ?? (d.yaw ? (() => {
    const h = new Float64Array(n);
    for (let i = 0; i < n; i++) h[i] = (((d.yaw![rows[i]] / RAD) % 360) + 360) % 360;
    return h;
  })() : null);
  if (headingDeg) put('heading', headingDeg, 'data');
  else put('heading', course, 'derived');
  const pitchDeg = values.pitch ?? (d.pitch ? (() => {
    const p = new Float64Array(n);
    for (let i = 0; i < n; i++) p[i] = d.pitch![rows[i]] / RAD;
    return p;
  })() : null);
  if (pitchDeg) put('pitch', pitchDeg, 'data');
  else {
    const fp = arr();
    for (let i = 0; i < n; i++) if (gs[i] > 0.5) fp[i] = Math.atan2(vU[i], gs[i]) / RAD;
    put('pitch', fp, 'derived');
  }
  const rollDeg = values.roll ?? null;
  const attitude = !!headingDeg && !!pitchDeg && !!rollDeg;
  // Which way the recording counts roll. Sources disagree (one game's
  // right-wing-down is another's left), and a wrong sign turns a 4 g turn
  // into a negative-g one. In a turn the lift points into it, so the sign
  // whose up axis agrees with the load square to the velocity is the one.
  let rollSign = 1;
  if (attitude) {
    const miss = [0, 0];
    for (let i = 0; i < n; i++) {
      const r = rollDeg![i];
      if (!Number.isFinite(r) || Math.abs(r) < 15 || Math.abs(r) > 165 || !Number.isFinite(aE[i])) continue;
      const v: [number, number, number] = [vE[i], vN[i], vU[i]];
      if (Math.hypot(v[0], v[1], v[2]) < 30) continue;
      const a: [number, number, number] = [aE[i], aN[i], aU[i]];
      const perp = loadFactor(a, null, v);
      for (const k of [0, 1]) {
        const axes = bodyAxes(headingDeg![i] * RAD, pitchDeg![i] * RAD, (k ? -r : r) * RAD);
        miss[k] += Math.abs(loadFactor(a, axes.up, v) - perp);
      }
    }
    if (miss[1] < miss[0] * 0.8) rollSign = -1;
  }

  const turnRate = arr();
  const turnRadius = arr();
  const g = arr();
  const gLong = arr();
  const aoa = arr();
  const aos = arr();
  const energy = arr();
  // Faster than any aircraft turns: a jump in the recording (a correction, a respawn), not flight.
  const IMPLAUSIBLE = 25 * G0;
  for (let i = 0; i < n; i++) {
    const v: [number, number, number] = [vE[i], vN[i], vU[i]];
    const a: [number, number, number] = [aE[i], aN[i], aU[i]];
    if (Number.isFinite(tas[i]) && Number.isFinite(altV[i])) energy[i] = altV[i] + (tas[i] * tas[i]) / (2 * G0);
    if (!Number.isFinite(v[0]) || !Number.isFinite(a[0])) continue;
    if (Math.hypot(a[0], a[1], a[2]) > IMPLAUSIBLE) continue;
    const h2 = v[0] * v[0] + v[1] * v[1];
    if (h2 > 1) turnRate[i] = ((v[1] * a[0] - v[0] * a[1]) / h2) / RAD;
    const s = Math.hypot(v[0], v[1], v[2]);
    if (s > 1) {
      const along = dot(a, v) / s;
      gLong[i] = (along + (G0 * v[2]) / s) / G0;
      const perp = Math.sqrt(Math.max(0, dot(a, a) - along * along));
      if (perp > 0.05) turnRadius[i] = (s * s) / perp;
    }
    let up: [number, number, number] | null = null;
    if (attitude && Number.isFinite(rollDeg![i]) && Number.isFinite(headingDeg![i]) && Number.isFinite(pitchDeg![i])) {
      const axes = bodyAxes(headingDeg![i] * RAD, pitchDeg![i] * RAD, rollSign * rollDeg![i] * RAD);
      up = axes.up;
      if (s > 5) {
        const ang = aeroAngles(v, axes);
        aoa[i] = ang.aoa / RAD;
        aos[i] = ang.aos / RAD;
      }
    }
    g[i] = loadFactor(a, up, v);
  }
  put('turnRate', turnRate, 'derived');
  put('turnRadius', turnRadius, 'derived');
  put('g', g, attitude ? 'derived' : 'estimate');
  put('gLong', gLong, 'derived');
  if (attitude) {
    put('aoa', aoa, 'derived');
    put('aos', aos, 'derived');
  }
  put('energy', energy, 'derived');
  put('energyRate', windowSlope(time, energy, ha, seg), 'derived');
  return { person, rows, time, x, y, z, values, source, rollSign };
}

/** The last sample at or before `time`; -1 before the first. */
export function sampleIndex(s: FlightSeries, time: number): number {
  const t = s.time;
  if (!t.length || time < t[0]) return -1;
  let lo = 0;
  let hi = t.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (t[mid] <= time) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/**
 * A value at `time`, linearly between the samples either side (a heading
 * the short way round); the last sample's value past the end, within `hold`
 * seconds. NaN where the series has none.
 */
export function valueAt(s: FlightSeries, id: string, time: number, hold = 2): number {
  const v = s.values[id];
  if (!v) return NaN;
  const i = sampleIndex(s, time);
  if (i < 0) return NaN;
  if (i + 1 >= s.time.length) return time - s.time[i] <= hold ? v[i] : NaN;
  const t0 = s.time[i];
  const t1 = s.time[i + 1];
  const a = v[i];
  const b = v[i + 1];
  if (!Number.isFinite(b) || t1 - t0 > 10) return time - t0 <= hold ? a : NaN;
  if (!Number.isFinite(a)) return b;
  const f = t1 > t0 ? (time - t0) / (t1 - t0) : 0;
  if (PARAM_BY_ID[id]?.kind === 'heading') {
    let dd = b - a;
    if (dd > 180) dd -= 360;
    if (dd < -180) dd += 360;
    return (((a + dd * f) % 360) + 360) % 360;
  }
  return a + (b - a) * f;
}

/** The parameters a series has values for, in PARAMS order. */
export function available(s: FlightSeries): string[] {
  return PARAMS.filter((p) => s.values[p.id] && s.values[p.id].some((v) => Number.isFinite(v))).map((p) => p.id);
}
