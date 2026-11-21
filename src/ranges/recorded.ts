/**
 * Sensor states a recording writes per row (War Thunder's server replays,
 * converted by heat3d-wt-replay since its 2026-11-17 build):
 *
 *   sensors        each sensor the aircraft's flight model sends, in order:
 *                  `d` (detecting: radar, IRST, warning receiver) or `o`
 *                  (optical: targeting pod, sight), its slot in the
 *                  aircraft's own sensor list, `+` on (an optical one:
 *                  tracking a point) or `-` off - `d0+ d1+ d2- o3-`
 *   sensorLocks    per detecting sensor that has picked a contact, the
 *                  contact (`d0:161`)
 *   lockX/Y/Z      the point the sensors track as their target
 *   sightX/Y/Z     where the sight, pod or drone camera looks
 *   opticX/Y/Z     the point an optical sensor tracks
 *
 * Points are in the data's own axes, like x/y/z: `pointAt` turns them into
 * the viewer's world by the load's axis mapping.
 *
 * Which catalogue sensor a slot is (`withSlots`): the slot's place in the
 * unit's sensor list where the catalogue's list (the user's own
 * installation's, in the game's order) has a sensor of that sort there,
 * else the next of that sort in order. A sensor whose slot is off is left
 * out; one that is on is marked recorded.
 */

import type { AttributeColumn, Dataset } from '../state/types';
import { toWorld, type Vec3 } from '../match/objectives';
import type { SensorKind, SensorSpec } from './sensors';

export interface SensorSlot {
  optical: boolean;
  slot: number;
  on: boolean;
}

/** The detecting sensors of a slot `d`, the optical ones of a slot `o`. */
const DETECTING = /^(radar|irst|rwr|mlws|lws|esm)$/;
const OPTICAL = /^(tgp|camera|drone|ldp|spotting)$/;

const SLOT = /([do])(\d+)([+-])/g;

/** A `sensors` value read: its slots, in order. */
export function parseSlots(text: string): SensorSlot[] {
  const out: SensorSlot[] = [];
  for (const m of text.matchAll(SLOT)) out.push({ optical: m[1] === 'o', slot: Number(m[2]), on: m[3] === '+' });
  return out;
}

const fits = (kind: SensorKind, optical: boolean) => (optical ? OPTICAL : DETECTING).test(kind);

/** The specification's sensors with the recorded slots laid over them (see the top). */
export function withSlots(spec: readonly SensorSpec[], slots: readonly SensorSlot[]): SensorSpec[] {
  if (!slots.length) return [...spec];
  const listed = spec.filter((s) => DETECTING.test(s.kind) || OPTICAL.test(s.kind));
  const taken = new Map<SensorSpec, boolean>();
  for (const sl of slots) {
    let s: SensorSpec | undefined = listed[sl.slot];
    if (!s || taken.has(s) || !fits(s.kind, sl.optical)) s = listed.find((x) => !taken.has(x) && fits(x.kind, sl.optical));
    if (s) taken.set(s, sl.on);
  }
  const out: SensorSpec[] = [];
  for (const s of spec) {
    const on = taken.get(s);
    if (on === false) continue;
    out.push(on ? { ...s, recorded: true } : s);
  }
  return out;
}

export interface RecordedColumns {
  sensors: AttributeColumn | null;
  locks: AttributeColumn | null;
  lock: [Float32Array, Float32Array, Float32Array] | null;
  sight: [Float32Array, Float32Array, Float32Array] | null;
  optic: [Float32Array, Float32Array, Float32Array] | null;
  /** Any of them. */
  any: boolean;
}

const cache = new WeakMap<Dataset, RecordedColumns>();
const slotCache = new WeakMap<AttributeColumn, (SensorSlot[] | undefined)[]>();

/** The recorded sensor columns of a dataset, found once. */
export function recordedColumns(d: Dataset): RecordedColumns {
  const hit = cache.get(d);
  if (hit) return hit;
  const num = (n: string) => {
    const a = d.attrs.find((x) => x.kind === 'number' && x.name === n);
    return a ? (a.data as Float32Array) : null;
  };
  const cat = (n: string) => d.attrs.find((x) => x.kind === 'category' && x.name === n) ?? null;
  const point = (p: string): [Float32Array, Float32Array, Float32Array] | null => {
    const x = num(`${p}X`), y = num(`${p}Y`), z = num(`${p}Z`);
    return x && y && z ? [x, y, z] : null;
  };
  const c: RecordedColumns = { sensors: cat('sensors'), locks: cat('sensorLocks'), lock: point('lock'), sight: point('sight'), optic: point('optic'), any: false };
  c.any = !!(c.sensors || c.locks || c.lock || c.sight || c.optic);
  cache.set(d, c);
  return c;
}

/** A row's recorded sensor slots; null where the row has none (or the data no `sensors` column). */
export function slotsAt(d: Dataset, row: number): SensorSlot[] | null {
  const col = recordedColumns(d).sensors;
  if (!col || row < 0 || !col.categories) return null;
  const k = (col.data as Uint32Array)[row];
  let parsed = slotCache.get(col);
  if (!parsed) {
    parsed = new Array(col.categories.length);
    slotCache.set(col, parsed);
  }
  let v = parsed[k];
  if (v === undefined) {
    v = parseSlots(col.categories[k] ?? '');
    parsed[k] = v;
  }
  return v.length ? v : null;
}

/** A recorded point on a row in the viewer's world (`lock`, `sight` or `optic`), or null where the row has none. */
export function pointAt(d: Dataset, which: 'lock' | 'sight' | 'optic', row: number): Vec3 | null {
  const p = recordedColumns(d)[which];
  if (!p || row < 0) return null;
  const x = p[0][row], y = p[1][row], z = p[2][row];
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  return toWorld([x, y, z], d.axes);
}

/** Whether a row has a detecting sensor on (a radar, an IRST or a warning receiver). */
export function detectingOn(slots: readonly SensorSlot[] | null): boolean {
  return !!slots && slots.some((s) => s.on && !s.optical);
}
