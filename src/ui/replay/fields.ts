/**
 * What a label, the hover card and the unit card can show about a unit, and
 * how each value is written: the unit's name, vehicle and team, every flight
 * parameter (`data/flight.ts`), and the range, bearing and aspect from the
 * followed unit - Tacview's label and telemetry fields.
 *
 * Values are in the viewer's units (`state/unitsStore.ts`); an estimate is
 * written with "~".
 */

import { flightSeries, PARAM_BY_ID, PARAMS, valueAt, type FlightSeries, type ParamKind } from '../../data/flight';
import { num, t } from '../../i18n';
import type { Dataset } from '../../state/types';
import type { UnitSystem } from '../../state/replayStore';
import { formatIn } from '../../units/format';
import type { Unit } from './units';
import { useReplayStore } from '../../state/replayStore';
import { geoFrame } from '../../world/geoFrame';
import { formatLatLon, toMgrs } from '../../world/mgrs';
import { relativeValue, velocityOf } from './relative';
import { declination } from '../../world/wmm';

/** Fields that are not flight parameters. */
export const INFO_FIELDS = ['name', 'vehicle', 'team', 'kind', 'range', 'bearing', 'relBearing', 'aspect', 'closure', 'losRate', 'altDiff', 'bullseye', 'position', 'mgrs', 'magHeading'] as const;

/** Fields only a recording placed on the earth has. */
const GEO_FIELDS = new Set(['position', 'mgrs', 'magHeading']);

const declCache = new Map<string, number>();

/**
 * Magnetic declination (WMM) at a world point of a recording placed on the
 * earth, at its time; NaN for one that is not. Kept on a tenth-of-a-degree
 * grid and by day: it changes slower than that.
 */
export function declinationAt(d: Dataset, p: { x: number; y: number; z: number }, time: number): number {
  const frame = geoFrame(d);
  if (!frame) return NaN;
  const [lat, lon, h] = frame.latLon(p.x, p.y, p.z);
  const ms = d.epochMs !== null ? d.epochMs + time * 1000 : null;
  const key = `${lat.toFixed(1)},${lon.toFixed(1)},${ms === null ? '' : Math.floor(ms / 86400000)}`;
  let v = declCache.get(key);
  if (v === undefined) {
    if (declCache.size > 5000) declCache.clear();
    v = declination(lat, lon, Math.max(0, h), ms);
    declCache.set(key, v);
  }
  return v;
}

/** A true heading as shown: magnetic, with its mark, when the viewer asked for magnetic headings and the place is known. */
function headingText(c: FieldContext, trueHeading: number): string {
  if (useReplayStore.getState().geo.magnetic) {
    const decl = declinationAt(c.d, c.pos, c.time);
    if (Number.isFinite(decl)) return magneticText(trueHeading - decl, c.units);
  }
  return formatValue('heading', trueHeading, c.units);
}

/** A magnetic heading with its mark: "087°M", or "1547 mil M". */
export function magneticText(heading: number, units: UnitSystem): string {
  const mil = units.angle === 'mil';
  const full = mil ? 6400 : 360;
  const v = mil ? heading * (6400 / 360) : heading;
  const r = Math.round(((v % full) + full) % full) % full;
  return t(mil ? 'units.v.milMag' : 'replay.unit.degMag', { v: String(r).padStart(mil ? 4 : 3, '0') });
}

/** Every field, in the order lists show them. */
export function allFields(): string[] {
  return [...INFO_FIELDS, ...PARAMS.map((p) => p.id)];
}

/** A field's name in the viewer's language. */
export function fieldName(id: string): string {
  return t(`replay.field.${id}`);
}

/** A field's abbreviation, for the compact label ("IAS", "AoA"). */
export function fieldShort(id: string): string {
  return t(`replay.short.${id}`);
}

/** A value of a kind, written with its unit in the viewer's units (`units/format.ts`). */
export function formatValue(kind: ParamKind, v: number, units: UnitSystem): string {
  if (!Number.isFinite(v)) return '—';
  switch (kind) {
    case 'g':
      return t('replay.unit.g', { v: num(v, 1) });
    case 'mach':
      return t('replay.unit.mach', { v: num(v, 2) });
    case 'ratio':
      return t('replay.unit.pct', { v: num(v * 100, 0) });
    case 'rpm':
      return t('replay.unit.rpm', { v: num(v, 0) });
    case 'flag':
      return v ? t('replay.yes') : t('replay.no');
    default:
      return formatIn(kind, v, units);
  }
}

/** What reading a unit's fields needs: where it is now, and what the followed unit is doing, for the relative fields. */
export interface FieldContext {
  d: Dataset;
  unit: Unit;
  person: number;
  time: number;
  session: number;
  units: UnitSystem;
  /** World position now, data units (as the engine draws it). */
  pos: { x: number; y: number; z: number };
  /** Data units per metre. */
  k: number;
  /** The followed unit, for range, bearing, aspect and closure; null when nothing is followed or it is this one. */
  ref: { person: number; pos: { x: number; y: number; z: number } } | null;
  /** Height of the ground under a point (data units), when the level can say. */
  groundAt?: (x: number, y: number, z: number) => number | null;
}

/** The series behind a context, worked out once per track. */
function seriesOf(c: FieldContext): FlightSeries | null {
  return flightSeries(c.d, c.person, c.session);
}

/** A flight parameter's value now, with where it came from; NaN where the unit has none. */
export function paramValue(c: FieldContext, id: string): { v: number; estimate: boolean } {
  const s = seriesOf(c);
  if (id === 'agl' && (!s || !s.values.agl || s.source.agl !== 'data')) {
    // Above the level's surface under the unit, where the level can say.
    const ground = c.groundAt?.(c.pos.x, c.pos.y, c.pos.z);
    return { v: ground === null || ground === undefined ? NaN : (c.pos.y - ground) / c.k, estimate: false };
  }
  if (!s) return { v: NaN, estimate: false };
  if (id === 'alt' && s.source.alt !== 'data') return { v: c.pos.y / c.k, estimate: false };
  return { v: valueAt(s, id, c.time), estimate: s.source[id] === 'estimate' };
}

/** Range, bearing, aspect, closure and the like to this unit from the followed one (relative.ts). */
function relative(c: FieldContext, id: string): number {
  if (!c.ref) return NaN;
  const a = c.ref.pos;
  const b = c.pos;
  const me = flightSeries(c.d, c.ref.person, c.session);
  const them = seriesOf(c);
  const vel = (s: FlightSeries | null) => (s ? velocityOf(valueAt(s, 'gs', c.time), valueAt(s, 'course', c.time), valueAt(s, 'vs', c.time)) : null);
  return relativeValue(id, {
    east: (b.x - a.x) / c.k,
    north: -(b.z - a.z) / c.k,
    up: (b.y - a.y) / c.k,
    heading: me ? valueAt(me, 'heading', c.time) : NaN,
    course: them ? valueAt(them, 'course', c.time) : NaN,
    va: vel(me),
    vb: vel(them),
  });
}

const bullCache = new WeakMap<Dataset, Map<number, { x: number; z: number }>>();

/**
 * The bullseyes of a recording by team (-1: one for everyone): Tacview
 * objects typed Bullseye (`Navaid+Static+Bullseye`), where they first are.
 */
export function bullseyes(d: Dataset): Map<number, { x: number; z: number }> {
  const hit = bullCache.get(d);
  if (hit) return hit;
  const out = new Map<number, { x: number; z: number }>();
  const type = d.attrs.find((a) => a.kind === 'category' && /^type$/i.test(a.name.trim()));
  if (type?.categories && d.personId) {
    const ids = type.data as Uint32Array;
    const isBull = type.categories.map((c) => /bullseye/i.test(c));
    for (let r = 0; r < d.count; r++) {
      if (!isBull[ids[r]]) continue;
      const team = d.personTeam ? d.personTeam[d.personId[r]] : -1;
      if (!out.has(team)) out.set(team, { x: d.px[r], z: d.pz[r] });
    }
  }
  bullCache.set(d, out);
  return out;
}

/** Bearing (degrees) and range (metres) of a point from its team's bullseye, else the only one; null without. */
export function fromBullseye(d: Dataset, team: number, p: { x: number; z: number }, k: number): { bearing: number; range: number } | null {
  const b = bullseyes(d);
  const bull = b.get(team) ?? (b.size === 1 ? [...b.values()][0] : undefined);
  if (!bull) return null;
  const east = (p.x - bull.x) / k;
  const north = -(p.z - bull.z) / k;
  return { bearing: ((Math.atan2(east, north) * 180) / Math.PI + 360) % 360, range: Math.hypot(east, north) };
}

/** A field's text for a unit now; '' when it has nothing to say. */
export function fieldText(c: FieldContext, id: string, teamLabel: (team: number) => string): string {
  switch (id) {
    case 'name':
      return c.unit.name;
    case 'vehicle':
      return c.unit.vehicle && c.unit.vehicle !== c.unit.name && !c.unit.name.startsWith(c.unit.vehicle) ? c.unit.vehicle : '';
    case 'team':
      return c.unit.team >= 0 ? teamLabel(c.unit.team) : '';
    case 'kind':
      return t(`replay.kind.${c.unit.kind}`);
    case 'range':
    case 'closure': {
      const v = relative(c, id);
      return Number.isFinite(v) ? formatValue(id === 'range' ? 'distance' : 'speed', v, c.units) : '';
    }
    case 'bearing': {
      const v = relative(c, id);
      return Number.isFinite(v) ? headingText(c, v) : '';
    }
    case 'aspect': {
      const v = relative(c, id);
      return Number.isFinite(v) ? formatValue('angle', v, c.units) : '';
    }
    case 'relBearing': {
      const v = relative(c, id);
      return Number.isFinite(v) ? t(v >= 0 ? 'replay.unit.degRight' : 'replay.unit.degLeft', { v: num(Math.abs(v), 0) }) : '';
    }
    case 'losRate': {
      const v = relative(c, id);
      return Number.isFinite(v) ? formatValue('rate', v, c.units) : '';
    }
    case 'altDiff': {
      const v = relative(c, id);
      return Number.isFinite(v) ? (v > 0 ? '+' : '') + formatValue('altitude', v, c.units) : '';
    }
    case 'position':
    case 'mgrs': {
      const frame = geoFrame(c.d);
      if (!frame) return '';
      const [lat, lon] = frame.latLon(c.pos.x, c.pos.y, c.pos.z);
      return id === 'mgrs' ? toMgrs(lat, lon) : formatLatLon(lat, lon);
    }
    case 'magHeading': {
      const s = seriesOf(c);
      const h = s ? valueAt(s, 'heading', c.time) : NaN;
      const decl = declinationAt(c.d, c.pos, c.time);
      return Number.isFinite(h) && Number.isFinite(decl) ? magneticText(h - decl, c.units) : '';
    }
    case 'bullseye': {
      // Bearing / range from the bullseye, as a controller calls it.
      const b = fromBullseye(c.d, c.unit.team, c.pos, c.k);
      return b ? `${formatValue('heading', b.bearing, c.units)} / ${formatValue('distance', b.range, c.units)}` : '';
    }
  }
  const def = PARAM_BY_ID[id];
  if (!def) return '';
  const { v, estimate } = paramValue(c, id);
  if (!Number.isFinite(v)) return '';
  if (id === 'heading' || id === 'course') return (estimate ? '~' : '') + headingText(c, v);
  return (estimate ? '~' : '') + formatValue(def.kind, v, c.units);
}

/** Fields whose value is a number, which a label writes with its abbreviation. */
export function isNumeric(id: string): boolean {
  return !!PARAM_BY_ID[id] || ['range', 'bearing', 'relBearing', 'aspect', 'closure', 'losRate', 'altDiff', 'bullseye', 'position', 'mgrs', 'magHeading'].includes(id);
}

/**
 * The fields worth offering for a dataset: who and where always, every
 * derived flight value, and a recorded one only where the data has its column.
 */
export function datasetFields(d: Dataset): string[] {
  const names = new Set(d.attrs.filter((a) => a.kind === 'number').map((a) => a.name.trim().toLowerCase()));
  const params = PARAMS.filter(
    (p) => p.derived || p.columns?.some((c) => names.has(c.toLowerCase())) || (p.sumColumns && d.attrs.some((a) => p.sumColumns!.test(a.name.trim()))),
  ).map((p) => p.id);
  const placed = !!geoFrame(d);
  const info = INFO_FIELDS.filter((f) => (f !== 'bullseye' || bullseyes(d).size > 0) && (placed || !GEO_FIELDS.has(f)));
  return [...info, ...params];
}

/** `ids` in the order the field lists use. */
export function inFieldOrder(ids: string[]): string[] {
  const order = allFields();
  return ids.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
