/**
 * The units values are shown in, one choice for the whole viewer: a preset
 * (metric, imperial, aviation, nautical) and, over it, a unit of the viewer's
 * own for any quantity. Values are kept in SI everywhere (metres, metres a
 * second, kilograms, degrees, kelvin-free celsius, pascals) and converted
 * only where they are written; `format.ts` writes them.
 *
 * Presets:
 *
 *   metric     m / km, m, km/h, m/s, °C, hPa, kg, degrees
 *   imperial   ft / mi, ft, mph, ft/min, °F, inHg, lb, degrees
 *   aviation   ft / NM, ft, kt, ft/min, °C, hPa, lb, degrees
 *   nautical   m / NM, m, kt, m/s, °C, hPa, t, degrees
 */

export type Quantity = 'distance' | 'altitude' | 'speed' | 'vspeed' | 'temperature' | 'pressure' | 'mass' | 'angle';
export const QUANTITIES: Quantity[] = ['distance', 'altitude', 'speed', 'vspeed', 'temperature', 'pressure', 'mass', 'angle'];

/** A distance's unit: the long one; short distances are said in the altitude's unit (m or ft). */
export type DistanceUnit = 'km' | 'mi' | 'nm';
export type AltitudeUnit = 'm' | 'ft';
export type SpeedUnit = 'kmh' | 'ms' | 'kt' | 'mph';
export type VSpeedUnit = 'ms' | 'fpm' | 'mmin';
export type TemperatureUnit = 'c' | 'f' | 'k';
export type PressureUnit = 'hpa' | 'inhg' | 'mmhg' | 'psi';
/** Mass; fuel by volume follows it (kg: litres, lb: US gallons, t: cubic metres). */
export type MassUnit = 'kg' | 'lb' | 't';
/** Degrees, or NATO mils (6400 to the circle). */
export type AngleUnit = 'deg' | 'mil';

export interface UnitPrefs {
  distance: DistanceUnit;
  altitude: AltitudeUnit;
  speed: SpeedUnit;
  vspeed: VSpeedUnit;
  temperature: TemperatureUnit;
  pressure: PressureUnit;
  mass: MassUnit;
  angle: AngleUnit;
}

/** Each quantity's choices, in the order a list offers them. */
export const UNIT_CHOICES: { [Q in Quantity]: UnitPrefs[Q][] } = {
  distance: ['km', 'mi', 'nm'],
  altitude: ['m', 'ft'],
  speed: ['kmh', 'ms', 'kt', 'mph'],
  vspeed: ['ms', 'fpm', 'mmin'],
  temperature: ['c', 'f', 'k'],
  pressure: ['hpa', 'inhg', 'mmhg', 'psi'],
  mass: ['kg', 'lb', 't'],
  angle: ['deg', 'mil'],
};

export type UnitPreset = 'metric' | 'imperial' | 'aviation' | 'nautical';
export const PRESETS: UnitPreset[] = ['metric', 'imperial', 'aviation', 'nautical'];

export const PRESET_UNITS: Record<UnitPreset, UnitPrefs> = {
  metric: { distance: 'km', altitude: 'm', speed: 'kmh', vspeed: 'ms', temperature: 'c', pressure: 'hpa', mass: 'kg', angle: 'deg' },
  imperial: { distance: 'mi', altitude: 'ft', speed: 'mph', vspeed: 'fpm', temperature: 'f', pressure: 'inhg', mass: 'lb', angle: 'deg' },
  aviation: { distance: 'nm', altitude: 'ft', speed: 'kt', vspeed: 'fpm', temperature: 'c', pressure: 'hpa', mass: 'lb', angle: 'deg' },
  nautical: { distance: 'nm', altitude: 'm', speed: 'kt', vspeed: 'ms', temperature: 'c', pressure: 'hpa', mass: 't', angle: 'deg' },
};

/** What is kept: a preset and the quantities set apart from it. */
export interface UnitSettings {
  preset: UnitPreset;
  overrides: Partial<UnitPrefs>;
}

export const DEFAULT_UNIT_SETTINGS: UnitSettings = { preset: 'metric', overrides: {} };

/** The units in force: the preset's, with the viewer's own over them. */
export function resolveUnits(s: UnitSettings): UnitPrefs {
  const base = PRESET_UNITS[s.preset] ?? PRESET_UNITS.metric;
  const out = { ...base };
  for (const q of QUANTITIES) {
    const v = s.overrides[q];
    if (v !== undefined && (UNIT_CHOICES[q] as string[]).includes(v)) (out as Record<Quantity, string>)[q] = v;
  }
  return out;
}

/** Reads kept settings, whatever shape they were left in; anything it cannot use is the default. */
export function readUnitSettings(v: unknown): UnitSettings {
  if (!v || typeof v !== 'object') return DEFAULT_UNIT_SETTINGS;
  const o = v as Record<string, unknown>;
  const preset = PRESETS.includes(o.preset as UnitPreset) ? (o.preset as UnitPreset) : 'metric';
  const overrides: Partial<UnitPrefs> = {};
  const src = o.overrides && typeof o.overrides === 'object' ? (o.overrides as Record<string, unknown>) : {};
  for (const q of QUANTITIES) {
    const x = src[q];
    if (typeof x === 'string' && (UNIT_CHOICES[q] as string[]).includes(x)) (overrides as Record<string, string>)[q] = x;
  }
  return { preset, overrides };
}

// Exact definitions.
export const FT = 0.3048;
export const MI = 1609.344;
export const NM = 1852;
export const KT = 1852 / 3600;
export const MPH = MI / 3600;
export const LB = 0.45359237;
export const GAL = 3.785411784;
export const INHG = 3386.389;
export const MMHG = 133.322387415;
export const PSI = 6894.757293168;
/** Mils (NATO) in a degree. */
export const MIL_PER_DEG = 6400 / 360;

/** A length in metres in an altitude unit. */
export function toAltitude(m: number, u: AltitudeUnit): number {
  return u === 'ft' ? m / FT : m;
}
export function fromAltitude(v: number, u: AltitudeUnit): number {
  return u === 'ft' ? v * FT : v;
}

/** Metres in a distance's long unit. */
export function longUnitMetres(u: DistanceUnit): number {
  return u === 'mi' ? MI : u === 'nm' ? NM : 1000;
}

/** Metres a second in a speed unit. */
export function toSpeed(ms: number, u: SpeedUnit): number {
  switch (u) {
    case 'kmh':
      return ms * 3.6;
    case 'kt':
      return ms / KT;
    case 'mph':
      return ms / MPH;
    default:
      return ms;
  }
}
export function fromSpeed(v: number, u: SpeedUnit): number {
  return v / toSpeed(1, u);
}

/** Metres a second (climb) in a vertical speed unit. */
export function toVSpeed(ms: number, u: VSpeedUnit): number {
  return u === 'fpm' ? (ms / FT) * 60 : u === 'mmin' ? ms * 60 : ms;
}

/** Degrees Celsius in a temperature unit. */
export function toTemperature(c: number, u: TemperatureUnit): number {
  return u === 'f' ? (c * 9) / 5 + 32 : u === 'k' ? c + 273.15 : c;
}
export function fromTemperature(v: number, u: TemperatureUnit): number {
  return u === 'f' ? ((v - 32) * 5) / 9 : u === 'k' ? v - 273.15 : v;
}

/** Pascals in a pressure unit. */
export function toPressure(pa: number, u: PressureUnit): number {
  switch (u) {
    case 'inhg':
      return pa / INHG;
    case 'mmhg':
      return pa / MMHG;
    case 'psi':
      return pa / PSI;
    default:
      return pa / 100;
  }
}

/** Kilograms in a mass unit. */
export function toMass(kg: number, u: MassUnit): number {
  return u === 'lb' ? kg / LB : u === 't' ? kg / 1000 : kg;
}

/** Litres in the volume unit that goes with a mass unit. */
export function toVolume(l: number, u: MassUnit): number {
  return u === 'lb' ? l / GAL : u === 't' ? l / 1000 : l;
}

/** Degrees in an angle unit. */
export function toAngle(deg: number, u: AngleUnit): number {
  return u === 'mil' ? deg * MIL_PER_DEG : deg;
}
