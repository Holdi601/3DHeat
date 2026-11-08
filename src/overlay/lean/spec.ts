/**
 * Which columns of an overlay's files play which part: the generic loader's
 * own guesses (`autoMap`) with the file's reading instructions laid over them
 * (`heat3d` in the Parquet footer), so a file reads the same here as through
 * the generic loader - axes, flips and scale, look direction, time unit.
 */

import { applyHints, autoMap, geoOfHints, parseHints } from '../../data/automap';
import type { ColumnMapping, GeoReference, TimeUnit } from '../../state/types';
import type { LeanSpec } from './scan';

const TIME_SCALE: Partial<Record<TimeUnit, number>> = {
  seconds: 1,
  milliseconds: 1e-3,
  microseconds: 1e-6,
  nanoseconds: 1e-9,
  unix_seconds: 1,
  unix_milliseconds: 1e-3,
};

const NAME_COLUMN = /^(name|vehicle|vehicle.?name|unit|unit.?type|model|aircraft|plane|tank|ship|craft|loadout|kit|figure)$/i;
const TYPE_COLUMN = /^(type|class|kind|category|icon|role|domain|vehicle.?type|vehicle.?class)$/i;
const WHO_COLUMN = /^(player|pilot|callsign|side|coalition|country|faction|ai|is.?player|squad|clan)$/i;
/** Most columns kept per unit. */
const MAX_META = 10;

export interface SpecInput {
  columns: string[];
  /** Up to 50 rows as text, parallel to `columns`. */
  rows: string[][];
  numeric: boolean[];
  /** The `heat3d` footer entry, when the file has one. */
  hints: string | null;
  /** Columns stored as timestamps. */
  timestamps: string[];
}

export type SpecResult =
  | { ok: true; spec: LeanSpec; mapping: ColumnMapping; entitySize?: number }
  | { ok: false; reason: 'noPosition' | 'noTime' | 'noUnit' | 'isoTime' };

export function leanSpec(input: SpecInput): SpecResult {
  const hints = parseHints(input.hints);
  let mapping = autoMap({ columns: input.columns, rows: input.rows, numeric: input.numeric, hints });
  if (hints) mapping = applyHints(mapping, hints, input.columns, input.numeric);
  if (!mapping.x) return { ok: false, reason: 'noPosition' };
  if (!mapping.time) return { ok: false, reason: 'noTime' };
  if (!mapping.personId) return { ok: false, reason: 'noUnit' };
  const timestamp = input.timestamps.includes(mapping.time);
  if (mapping.timeUnit === 'iso8601' && !timestamp) return { ok: false, reason: 'isoTime' };
  const timeScale = timestamp ? 1e-3 : (TIME_SCALE[mapping.timeUnit] ?? 1);
  const roles = new Set([mapping.x, mapping.y, mapping.z, mapping.time, mapping.personId, mapping.sessionId, mapping.teamId].filter(Boolean));
  const event = input.columns.find((c) => /^events?$/i.test(c.trim()) && !input.numeric[input.columns.indexOf(c)]) ?? null;
  const meta = input.columns.filter((c) => !roles.has(c) && c !== event && (NAME_COLUMN.test(c.trim()) || TYPE_COLUMN.test(c.trim()) || WHO_COLUMN.test(c.trim()))).slice(0, MAX_META);
  const roll = input.columns.find((c) => /^roll$/i.test(c.trim()) && input.numeric[input.columns.indexOf(c)]) ?? null;
  const look = mapping.lookMode === 'vector' && mapping.dirX && mapping.dirY && mapping.dirZ ? 'vector' : mapping.lookMode === 'yawPitch' && mapping.yaw ? 'yawPitch' : 'none';
  const scale = mapping.axes.scale || 1;
  const entitySize = mapping.entitySize ? mapping.entitySize * scale : undefined;
  const spec: LeanSpec = {
    time: mapping.time,
    timeScale,
    x: mapping.x,
    y: mapping.y,
    z: mapping.z,
    axes: { up: mapping.axes.up, flipX: mapping.axes.flipX, flipY: mapping.axes.flipY, flipZ: mapping.axes.flipZ, scale },
    track: mapping.personId,
    match: mapping.sessionId,
    event,
    team: mapping.teamId,
    look,
    dirX: mapping.dirX,
    dirY: mapping.dirY,
    dirZ: mapping.dirZ,
    yaw: mapping.yaw,
    pitch: mapping.pitch,
    angleScale: mapping.angleUnit === 'degrees' ? Math.PI / 180 : 1,
    roll,
    meta,
    units: entitySize ? entitySize / 0.8 : 1,
  };
  return { ok: true, spec, mapping, entitySize };
}

/** The spec for one file: what it lacks of the optional columns read as absent. */
export function specFor(spec: LeanSpec, columns: Set<string>): LeanSpec | null {
  if (!columns.has(spec.time) || !columns.has(spec.x) || !columns.has(spec.track)) return null;
  // A look column it lacks reads as no attitude there (the keys keep their room for one, level).
  const opt = (c: string | null) => (c && columns.has(c) ? c : null);
  return {
    ...spec,
    y: opt(spec.y),
    z: opt(spec.z),
    match: opt(spec.match),
    event: opt(spec.event),
    team: opt(spec.team),
    pitch: opt(spec.pitch),
    roll: opt(spec.roll),
  };
}

/**
 * Where the load is on the earth: the reference the files' hints give for the
 * columns the load took, when every file gives the same one (as the
 * ACMI converter's files of one theatre do); else none, as the generic loader.
 */
export function sharedGeo(hints: (string | null)[], mapping: { x: string | null; y: string | null; z: string | null }): GeoReference | null {
  let geo: GeoReference | null = null;
  for (const h of hints) {
    const g = geoOfHints(parseHints(h), mapping);
    if (!g) return null;
    if (geo && (g.lat0 !== geo.lat0 || g.lon0 !== geo.lon0 || g.projection !== geo.projection || g.north !== geo.north || g.theatre !== geo.theatre)) return null;
    geo = g;
  }
  return geo;
}
