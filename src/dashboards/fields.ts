/**
 * The field list of a dashboard: what the loaded data offers to drop on a
 * tile - the built-in roles (team, player, match, time, time into the match,
 * position), every column, and the dashboard's own calculated columns, bins
 * and hierarchies - each with the key the row workers know it by (the
 * Compare engine's keys, `versus/engine.ts` `K`, and `a:<column>`), so a
 * Compare predicate bound here reads the same columns there.
 *
 * Also the roles the quick slicers look for: won / lost, side, map, game
 * version - found by the column's name, since every game names them its own way.
 */

import { CANON } from '../data/canonical';
import { outcomeColumns } from '../data/outcome';
import type { Dataset } from '../state/types';
import { attrKey, buildSchema } from '../versus/run';
import { K } from '../versus/engine';
import type { Schema } from '../versus/expr';
import type { BinDef, Dashboard, FieldRef } from './model';
import type { DimSpec } from './query';

export type FieldRole = 'won' | 'side' | 'map' | 'version' | 'team' | 'match' | 'player' | 'event' | 'class' | 'nation' | 'vehicle' | 'variant' | 'zone' | 'spot';

export interface FieldInfo {
  id: FieldRef;
  name: string;
  kind: 'cat' | 'num';
  /** The column's key in the row workers. */
  key: string;
  labels?: string[];
  lo: number;
  hi: number;
  /** A clock: the data's own (seconds, a date where the data has one) or seconds into each match. */
  time?: 'real' | 'match';
  role?: FieldRole;
  group: 'roles' | 'columns' | 'calc' | 'bins' | 'hier';
  /** A binned field: the bins it groups by. */
  bin?: { key: string; lo: number; step: number; count: number; time?: 'real' | 'match' };
  /** A hierarchy: its levels, top first. */
  levels?: FieldRef[];
}

/** What a dashboard reads a dataset through: its fields and the Compare schema over the same keys. */
export interface Catalog {
  fields: FieldInfo[];
  byId: Map<string, FieldInfo>;
  schema: Schema;
  /** The event column's kill and death categories (`kills()`, `deaths()`). */
  kill: number[];
  death: number[];
  /** Seconds the data spans, and each match's start. */
  timeRange: [number, number];
  matchSpan: number;
  sessionStart: number[] | null;
  epochMs: number | null;
  rows: number;
}

/** Roles found by a column's name (category columns only, but `won`). */
const ROLE_NAMES: [FieldRole, RegExp][] = [
  ['side', /^(side|faction|attacker|defender|sides?)$|\bside\b/i],
  ['map', /^(map|level|mission|battlefield|map ?name|level ?name)$/i],
  ['version', /(game ?)?version|^build$|^patch$|client ?version/i],
  ['nation', /^(nation|country|coalition)$/i],
  ['class', /^(vehicle ?class|class|unit ?class|type)$/i],
  ['vehicle', /^(vehicle|unit ?type|aircraft|tank|ship|model)$/i],
  ['variant', /^(variant|modification|loadout|skin)$/i],
  ['zone', /^(zone|area|sector|region|site|bomb ?site|place)$/i],
];

export function roleOf(name: string): FieldRole | undefined {
  if (name === CANON.event) return 'event';
  if (name === CANON.vehicleClass) return 'class';
  for (const [r, re] of ROLE_NAMES) if (re.test(name.trim())) return r;
  return undefined;
}

/** The labels of equal bins over [lo, lo + step * count). */
export function binLabels(lo: number, step: number, count: number, fmt: (v: number) => string): string[] {
  return Array.from({ length: count }, (_, i) => `${fmt(lo + step * i)}–${fmt(lo + step * (i + 1))}`);
}

const tidy = (v: number) => {
  const a = Math.abs(v);
  return a >= 1000 ? String(Math.round(v)) : a >= 10 ? v.toFixed(1).replace(/\.0$/, '') : String(Number(v.toPrecision(3)));
};

export function clockText(s: number): string {
  const neg = s < 0;
  const a = Math.abs(Math.round(s));
  const m = Math.floor(a / 60);
  const r = a % 60;
  const h = Math.floor(m / 60);
  const txt = h ? `${h}:${String(m % 60).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
  return neg ? `-${txt}` : txt;
}

/** A value of a field as text: a clock for time, a date where the data has one. */
export function fieldValueText(f: Pick<FieldInfo, 'time'>, v: number, epochMs: number | null): string {
  if (f.time === 'real' && epochMs !== null && Math.abs(v) > 1e5) {
    const d = new Date(epochMs + v * 1000);
    return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 16).replace('T', ' ') : clockText(v);
  }
  if (f.time) return clockText(v);
  return tidy(v);
}

/** Calculated columns' ranges, as the row workers found them. */
export type CalcRanges = Record<string, [number, number]>;

/** The fields of a dataset as a dashboard sees them. */
export function catalogOf(ds: Dataset, dash: Pick<Dashboard, 'columns' | 'bins' | 'hierarchies'> | null, ranges: CalcRanges = {}): Catalog {
  const fields: FieldInfo[] = [];
  const base = buildSchema(ds);
  // The derived Compare columns this engine does not keep (step, speed, dwell) are left out.
  const schema: Schema = { ...base, cols: base.cols.filter((c) => c.key !== K.step && c.key !== K.speed && c.key !== K.dwell) };
  const b = ds.bounds;
  let span = 0;
  if (ds.sessionStart && ds.sessionEnd) for (let s = 0; s < ds.sessionStart.length; s++) span = Math.max(span, ds.sessionEnd[s] - ds.sessionStart[s]);
  if (!(span > 0)) span = Math.max(1, ds.timeRange[1] - ds.timeRange[0]);
  if (ds.teamId) fields.push({ id: 'team', name: 'Team', kind: 'cat', key: K.team, labels: ds.teamLabels, lo: 0, hi: ds.teamLabels.length - 1, role: 'team', group: 'roles' });
  if (ds.personId) fields.push({ id: 'person', name: 'Player', kind: 'cat', key: K.person, labels: ds.personLabels, lo: 0, hi: ds.personLabels.length - 1, role: 'player', group: 'roles' });
  if (ds.sessionId) fields.push({ id: 'session', name: 'Match', kind: 'cat', key: K.session, labels: ds.sessionLabels, lo: 0, hi: ds.sessionLabels.length - 1, role: 'match', group: 'roles' });
  if (ds.time) {
    fields.push({ id: 'time', name: 'Time', kind: 'num', key: K.time, lo: ds.timeRange[0], hi: ds.timeRange[1], time: 'real', group: 'roles' });
    fields.push({ id: 'mtime', name: 'Match time', kind: 'num', key: K.matchTime, lo: 0, hi: span, time: 'match', group: 'roles' });
  }
  fields.push({ id: 'x', name: 'X', kind: 'num', key: K.x, lo: b.minX, hi: b.maxX, group: 'roles' });
  fields.push({ id: 'y', name: 'Height', kind: 'num', key: K.y, lo: b.minY, hi: b.maxY, group: 'roles' });
  fields.push({ id: 'z', name: 'Z', kind: 'num', key: K.z, lo: b.minZ, hi: b.maxZ, group: 'roles' });
  const won = outcomeColumns(ds).round;
  for (const a of ds.attrs) {
    const role = a === won ? 'won' : roleOf(a.name);
    if (a.kind === 'category') fields.push({ id: `c:${a.name}`, name: a.name, kind: 'cat', key: attrKey(a.name), labels: a.categories ?? [], lo: 0, hi: (a.categories?.length ?? 1) - 1, role, group: 'columns' });
    else fields.push({ id: `c:${a.name}`, name: a.name, kind: 'num', key: attrKey(a.name), lo: a.min, hi: a.max, role, group: 'columns' });
  }
  for (const c of dash?.columns ?? []) {
    const r = ranges[c.id] ?? [0, 1];
    fields.push({ id: `k:${c.id}`, name: c.name, kind: 'num', key: `k:${c.id}`, lo: r[0], hi: r[1], group: 'calc' });
    schema.cols.push({ name: c.name, key: `k:${c.id}`, type: 'num' });
  }
  const byId = new Map(fields.map((f) => [f.id, f]));
  for (const bd of dash?.bins ?? []) {
    const f = binField(bd, byId.get(bd.field), ds.epochMs ?? null);
    if (f) {
      fields.push(f);
      byId.set(f.id, f);
    }
  }
  for (const h of dash?.hierarchies ?? []) {
    const levels = h.levels.filter((l) => byId.has(l) && byId.get(l)!.group !== 'hier');
    if (!levels.length) continue;
    const top = byId.get(levels[0])!;
    const f: FieldInfo = { ...top, id: `h:${h.id}`, name: h.name, group: 'hier', levels };
    fields.push(f);
    byId.set(f.id, f);
  }
  const ev = ds.attrs.find((a) => a.name === CANON.event && a.categories);
  const kinds = ev?.categories ?? [];
  const kill: number[] = [];
  const death: number[] = [];
  const evCol = schema.cols.find((c) => c.key === schema.event);
  kinds.forEach((_l, i) => {
    const k = evCol?.canon?.kinds[evCol.canon.map[i]];
    if (k === 'kill') kill.push(i);
    if (k === 'death' || k === 'destroyed') death.push(i);
  });
  return {
    fields,
    byId,
    schema,
    kill,
    death,
    timeRange: [ds.timeRange[0], ds.timeRange[1]],
    matchSpan: span,
    sessionStart: ds.sessionStart ? Array.from(ds.sessionStart) : null,
    epochMs: ds.epochMs ?? null,
    rows: ds.count,
  };
}

function binField(bd: BinDef, src: FieldInfo | undefined, epochMs: number | null): FieldInfo | null {
  if (!src || src.kind !== 'num') return null;
  const lo = Number.isFinite(src.lo) ? src.lo : 0;
  const hi = Number.isFinite(src.hi) && src.hi > lo ? src.hi : lo + 1;
  let step = bd.size && bd.size > 0 ? bd.size : (hi - lo) / Math.max(2, bd.count ?? 10);
  let count = Math.ceil((hi - lo) / step - 1e-9);
  if (count > 500) {
    count = 500;
    step = (hi - lo) / 500;
  }
  count = Math.max(1, count);
  const start = bd.size ? Math.floor(lo / step) * step : lo;
  if (bd.size) count = Math.max(1, Math.ceil((hi - start) / step - 1e-9));
  const labels = binLabels(start, step, count, (v) => fieldValueText(src, v, epochMs));
  return { id: `b:${bd.id}`, name: bd.name, kind: 'cat', key: src.key, labels, lo: 0, hi: count - 1, group: 'bins', bin: { key: src.key, lo: start, step, count, time: src.time } };
}

/** A field as a grouping: its categories, its bins, or `bins` equal bins over a numeric one. */
export function dimOf(f: FieldInfo, bins = 24): DimSpec {
  if (f.bin) return { k: 'bin', key: f.bin.key, lo: f.bin.lo, step: f.bin.step, count: f.bin.count };
  if (f.kind === 'cat') return { k: 'cat', key: f.key, size: Math.max(1, f.labels?.length ?? 1) };
  const lo = Number.isFinite(f.lo) ? f.lo : 0;
  const hi = Number.isFinite(f.hi) && f.hi > lo ? f.hi : lo + 1;
  return { k: 'bin', key: f.key, lo, step: (hi - lo) / bins, count: bins };
}

/** The label of a dim's index. */
export function dimLabel(f: FieldInfo, d: DimSpec, i: number, epochMs: number | null): string {
  if (d.k === 'cat') return f.labels?.[i] ?? String(i);
  if (f.bin && f.labels) return f.labels[i] ?? String(i);
  const a = d.lo + d.step * i;
  return `${fieldValueText(f, a, epochMs)}–${fieldValueText(f, a + d.step, epochMs)}`;
}

/** A field with a role, if the data has one (the quick slicers: won / lost, side, map, version...). */
export function fieldWithRole(cat: Catalog, role: FieldRole): FieldInfo | null {
  return cat.fields.find((f) => f.role === role && f.group !== 'hier') ?? null;
}

/** The columns a set of field ids reads (their keys), hierarchies with every level. */
export function keysOfFields(cat: Catalog, ids: readonly FieldRef[]): string[] {
  const out = new Set<string>();
  for (const id of ids) {
    const f = cat.byId.get(id);
    if (!f) continue;
    if (f.levels) for (const l of f.levels) out.add(cat.byId.get(l)!.key);
    else out.add(f.key);
  }
  return [...out];
}
