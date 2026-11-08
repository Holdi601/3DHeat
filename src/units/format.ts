/**
 * Values written in the viewer's units (`units.ts`): a number with its unit,
 * as the language puts it, and the unit alone for an axis or a column head.
 *
 * Kinds are the flight parameters' (`data/flight.ts`) and a few more:
 * `length` is a size or a short distance (metres or feet, never km),
 * `temperature` comes in degrees Celsius, `pressure` in pascals.
 */

import type { ParamKind } from '../data/flight';
import { num, t } from '../i18n';
import {
  longUnitMetres,
  toAltitude,
  toAngle,
  toMass,
  toPressure,
  toSpeed,
  toTemperature,
  toVolume,
  toVSpeed,
  type UnitPrefs,
} from './units';

export type ValueKind = ParamKind | 'length' | 'temperature' | 'pressure';

/** The message that writes a value in a unit ("{v} km/h"). */
const MSG: Record<string, string> = {
  m: 'replay.unit.m',
  km: 'replay.unit.km',
  ft: 'replay.unit.ft',
  mi: 'units.v.mi',
  nm: 'replay.unit.nm',
  kmh: 'replay.unit.kmh',
  ms: 'replay.unit.ms',
  kt: 'replay.unit.kt',
  mph: 'units.v.mph',
  fpm: 'replay.unit.fpm',
  mmin: 'units.v.mmin',
  c: 'units.v.c',
  f: 'units.v.f',
  k: 'units.v.k',
  hpa: 'units.v.hpa',
  inhg: 'units.v.inhg',
  mmhg: 'units.v.mmhg',
  psi: 'units.v.psi',
  kg: 'replay.unit.kg',
  lb: 'replay.unit.lb',
  t: 'units.v.t',
  kgh: 'replay.unit.kgh',
  lbh: 'replay.unit.lbh',
  th: 'units.v.th',
  l: 'replay.unit.l',
  gal: 'replay.unit.gal',
  m3: 'units.v.m3',
  deg: 'replay.unit.deg',
  mil: 'units.v.mil',
  degs: 'replay.unit.degs',
  mils: 'units.v.mils',
};

function said(unit: string, text: string): string {
  return t(MSG[unit], { v: text });
}

/** A unit's symbol alone ("ft", "km/h"), for an axis or a column head. */
export function symbolOf(unit: string): string {
  return said(unit, '').replace(/\s+/g, ' ').trim();
}

/** Where a distance turns from the short unit to the long one, metres. */
function longFrom(u: UnitPrefs): number {
  return u.distance === 'km' ? 10000 : longUnitMetres(u.distance);
}

/**
 * A value of a kind in the viewer's units: the number in them and the unit
 * it is in. A distance picks its short or long unit by its size.
 */
export function convert(kind: ValueKind, v: number, u: UnitPrefs): { v: number; unit: string } {
  switch (kind) {
    case 'altitude':
    case 'length':
      return { v: toAltitude(v, u.altitude), unit: u.altitude };
    case 'distance':
      if (Math.abs(v) >= longFrom(u)) return { v: v / longUnitMetres(u.distance), unit: u.distance };
      return { v: toAltitude(v, u.altitude), unit: u.altitude };
    case 'speed':
      return { v: toSpeed(v, u.speed), unit: u.speed };
    case 'vspeed':
      return { v: toVSpeed(v, u.vspeed), unit: u.vspeed };
    case 'angle':
    case 'heading':
      return { v: toAngle(v, u.angle), unit: u.angle };
    case 'rate':
      return { v: toAngle(v, u.angle), unit: u.angle === 'mil' ? 'mils' : 'degs' };
    case 'mass':
      return { v: toMass(v, u.mass), unit: u.mass };
    case 'massFlow':
      return { v: toMass(v, u.mass), unit: u.mass === 'lb' ? 'lbh' : u.mass === 't' ? 'th' : 'kgh' };
    case 'volume':
      return { v: toVolume(v, u.mass), unit: u.mass === 'lb' ? 'gal' : u.mass === 't' ? 'm3' : 'l' };
    case 'temperature':
      return { v: toTemperature(v, u.temperature), unit: u.temperature };
    case 'pressure':
      return { v: toPressure(v, u.pressure), unit: u.pressure };
    default:
      return { v, unit: '' };
  }
}

/**
 * The unit a kind is written in, for a column or an axis that holds values
 * of every size: a distance in its long unit only when `long`.
 */
export function unitOf(kind: ValueKind, u: UnitPrefs, long = false): string {
  if (kind === 'distance') return long ? u.distance : u.altitude;
  return convert(kind, 0, u).unit;
}

/** A value in a fixed unit (as `unitOf` says), for a table column or a chart axis. */
export function convertTo(kind: ValueKind, v: number, u: UnitPrefs, long = false): number {
  if (kind === 'distance') return long ? v / longUnitMetres(u.distance) : toAltitude(v, u.altitude);
  return convert(kind, v, u).v;
}

/** The symbol of the unit a kind is written in ('' for none): "ft", "kt". */
export function unitSymbol(kind: ValueKind, u: UnitPrefs, long = false): string {
  const unit = unitOf(kind, u, long);
  return unit ? symbolOf(unit) : '';
}

/** Decimals a unit's number is written with, unless asked otherwise. */
function digitsFor(kind: ValueKind, unit: string, v: number): number {
  switch (unit) {
    case 'km':
    case 'mi':
    case 'nm':
      return 1;
    case 'ms':
      return kind === 'vspeed' ? 1 : 0;
    case 'inhg':
      return 2;
    case 'psi':
    case 't':
    case 'th':
    case 'm3':
      return Math.abs(v) < 10 ? 2 : 1;
    case 'c':
    case 'f':
    case 'k':
      return 0;
    case 'deg':
    case 'mil':
      return kind === 'angle' ? (unit === 'mil' ? 0 : 1) : 0;
    case 'degs':
    case 'mils':
      return unit === 'mils' ? 0 : 1;
    default:
      return 0;
  }
}

/**
 * A value of a kind written in the viewer's units, its unit with it.
 * `digits` overrides the decimals the unit is usually written with.
 */
export function formatIn(kind: ValueKind, v: number, u: UnitPrefs, digits?: number): string {
  if (!Number.isFinite(v)) return '—';
  const c = convert(kind, v, u);
  if (kind === 'heading') {
    // A compass heading: three digits, or four in mils.
    const full = u.angle === 'mil' ? 6400 : 360;
    const r = Math.round(((c.v % full) + full) % full) % full;
    return said(c.unit, String(r).padStart(u.angle === 'mil' ? 4 : 3, '0'));
  }
  if (!c.unit) return num(c.v, digits ?? (Math.abs(c.v) < 10 ? 2 : 0));
  return said(c.unit, num(c.v, digits ?? digitsFor(kind, c.unit, c.v)));
}

/** A length (a size, a short distance) in metres or feet, `digits` decimals. */
export function formatLength(m: number, u: UnitPrefs, digits = 0): string {
  return formatIn('length', m, u, digits);
}

/** A distance in the long unit (km, mi, NM), whatever its size. */
export function formatLong(m: number, u: UnitPrefs, digits = 1): string {
  if (!Number.isFinite(m)) return '—';
  return said(u.distance, num(m / longUnitMetres(u.distance), digits));
}

/** A distance, short or long by its size. */
export function formatDistance(m: number, u: UnitPrefs, digits?: number): string {
  return formatIn('distance', m, u, digits);
}

/**
 * A round step for a scale bar or rings: the largest 1, 2 or 5 times a power
 * of ten in the unit a distance of `metres` is written in that is no more
 * than it. Returns metres and how it is written.
 */
export function niceDistance(metres: number, u: UnitPrefs): { metres: number; text: string } {
  const c = convert('distance', metres, u);
  const per = metres !== 0 ? metres / c.v : 1;
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(1e-9, Math.abs(c.v)))));
  const n = c.v / p;
  const step = (n >= 5 ? 5 : n >= 2 ? 2 : 1) * p;
  return { metres: step * per, text: said(c.unit, num(step, step < 1 ? Math.min(3, Math.ceil(-Math.log10(step))) : 0)) };
}
