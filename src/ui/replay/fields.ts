/**
 * What a label, the hover card and the unit card can show about a unit, and
 * how each value is written: the unit's name, vehicle and team, every flight
 * parameter (`data/flight.ts`), and the range, bearing and aspect from the
 * followed unit - Tacview's label and telemetry fields.
 *
 * Values are metric or imperial (feet, knots, feet a minute, nautical
 * miles, pounds) as the viewer chose; an estimate is written with "~".
 */

import { flightSeries, PARAM_BY_ID, PARAMS, valueAt, type FlightSeries, type ParamKind } from '../../data/flight';
import { num, t } from '../../i18n';
import type { Dataset } from '../../state/types';
import type { UnitSystem } from '../../state/replayStore';
import type { Unit } from './units';

/** Fields that are not flight parameters. */
export const INFO_FIELDS = ['name', 'vehicle', 'team', 'kind', 'range', 'bearing', 'aspect', 'closure'] as const;

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

const FT = 0.3048;
const KT = 1852 / 3600;
const NM = 1852;
const LB = 0.45359237;
const GAL = 3.785411784;

/** A value of a kind, written with its unit. */
export function formatValue(kind: ParamKind, v: number, units: UnitSystem): string {
  if (!Number.isFinite(v)) return '—';
  const imp = units === 'imperial';
  switch (kind) {
    case 'altitude':
      return imp ? t('replay.unit.ft', { v: num(v / FT, 0) }) : t('replay.unit.m', { v: num(v, 0) });
    case 'distance':
      if (imp) return Math.abs(v) >= NM ? t('replay.unit.nm', { v: num(v / NM, 1) }) : t('replay.unit.ft', { v: num(v / FT, 0) });
      return Math.abs(v) >= 10000 ? t('replay.unit.km', { v: num(v / 1000, 1) }) : t('replay.unit.m', { v: num(v, 0) });
    case 'speed':
      return imp ? t('replay.unit.kt', { v: num(v / KT, 0) }) : t('replay.unit.kmh', { v: num(v * 3.6, 0) });
    case 'vspeed':
      return imp ? t('replay.unit.fpm', { v: num((v / FT) * 60, 0) }) : t('replay.unit.ms', { v: num(v, 1) });
    case 'angle':
      return t('replay.unit.deg', { v: num(v, 1) });
    case 'heading':
      return t('replay.unit.deg', { v: String(Math.round(((v % 360) + 360) % 360) % 360).padStart(3, '0') });
    case 'rate':
      return t('replay.unit.degs', { v: num(v, 1) });
    case 'g':
      return t('replay.unit.g', { v: num(v, 1) });
    case 'mach':
      return t('replay.unit.mach', { v: num(v, 2) });
    case 'ratio':
      return t('replay.unit.pct', { v: num(v * 100, 0) });
    case 'mass':
      return imp ? t('replay.unit.lb', { v: num(v / LB, 0) }) : t('replay.unit.kg', { v: num(v, 0) });
    case 'massFlow':
      return imp ? t('replay.unit.lbh', { v: num(v / LB, 0) }) : t('replay.unit.kgh', { v: num(v, 0) });
    case 'volume':
      return imp ? t('replay.unit.gal', { v: num(v / GAL, 0) }) : t('replay.unit.l', { v: num(v, 0) });
    case 'rpm':
      return t('replay.unit.rpm', { v: num(v, 0) });
    case 'flag':
      return v ? t('replay.yes') : t('replay.no');
    default:
      return num(v, Math.abs(v) < 10 ? 2 : 0);
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

/** Range, bearing, aspect or closure to this unit from the followed one. */
function relative(c: FieldContext, id: string): number {
  if (!c.ref) return NaN;
  const a = c.ref.pos;
  const b = c.pos;
  const east = (b.x - a.x) / c.k;
  const north = -(b.z - a.z) / c.k;
  const up = (b.y - a.y) / c.k;
  if (id === 'range') return Math.hypot(east, north, up);
  if (id === 'bearing') return ((Math.atan2(east, north) * 180) / Math.PI + 360) % 360;
  const me = flightSeries(c.d, c.ref.person, c.session);
  const them = seriesOf(c);
  if (id === 'aspect') {
    // Where the followed unit sits seen from this one's tail: 0 astern, 180 head on.
    const course = them ? valueAt(them, 'course', c.time) : NaN;
    if (!Number.isFinite(course)) return NaN;
    const toRef = ((Math.atan2(-east, -north) * 180) / Math.PI + 360) % 360;
    const off = Math.abs(((toRef - course + 540) % 360) - 180);
    return 180 - off;
  }
  if (id === 'closure' && me && them) {
    // The rate the range shrinks: the relative velocity along the line of sight.
    const r = Math.hypot(east, north, up);
    if (r < 1) return NaN;
    const vel = (s: FlightSeries) => {
      const gs = valueAt(s, 'gs', c.time);
      const crs = (valueAt(s, 'course', c.time) * Math.PI) / 180;
      const vs = valueAt(s, 'vs', c.time);
      return [gs * Math.sin(crs), gs * Math.cos(crs), vs];
    };
    const va = vel(me);
    const vb = vel(them);
    return -((vb[0] - va[0]) * east + (vb[1] - va[1]) * north + (vb[2] - va[2]) * up) / r;
  }
  return NaN;
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
    case 'bearing':
    case 'aspect': {
      const v = relative(c, id);
      return Number.isFinite(v) ? formatValue(id === 'bearing' ? 'heading' : 'angle', v, c.units) : '';
    }
  }
  const def = PARAM_BY_ID[id];
  if (!def) return '';
  const { v, estimate } = paramValue(c, id);
  if (!Number.isFinite(v)) return '';
  return (estimate ? '~' : '') + formatValue(def.kind, v, c.units);
}

/** Fields whose value is a number, which a label writes with its abbreviation. */
export function isNumeric(id: string): boolean {
  return !!PARAM_BY_ID[id] || id === 'range' || id === 'bearing' || id === 'aspect' || id === 'closure';
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
  return [...INFO_FIELDS, ...params];
}

/** `ids` in the order the field lists use. */
export function inFieldOrder(ids: string[]): string[] {
  const order = allFields();
  return ids.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
