/**
 * When things are dead: from the moment the data says a unit died until it
 * is alive again (a respawn) or gone, so its figure, dart and symbol can be
 * drawn as a wreck in between.
 *
 * What says so, in any dataset:
 * - an alive column (`alive`, `isAlive`): 0 from the death on, 1 while alive
 *   (War Thunder's converter keeps a wreck at 0 until the game removes it);
 * - a health column (`health`, `hp`) on a thing's own position rows: 0 or
 *   less is dead, more is alive (a game that samples its dead players);
 * - an event row at the thing itself whose label is a death (`death`,
 *   `dead`, `killed`, `destroyed`; ACMI's Destroyed), ended by a spawn-like
 *   event (`spawn`, `respawn`, `revive`) or by an alive or healthy row more
 *   than `SETTLE` seconds later. Removal ends the thing itself
 *   (`despawn.ts`), so a wreck shows until its unit is gone.
 */

import type { AttributeColumn, Dataset } from '../state/types';
import { personRows } from './flight';
import { positionRows } from '../figures/motion';

export const DEATH_EVENT = /^(death|dead|died|killed|destroyed|player_death|hasbeendestroyed)$/i;
export const REVIVE_EVENT = /^(spawn(ed)?|respawn(ed)?|revived?|resurrect(ed)?)$/i;
const ALIVE_COLUMN = /^(alive|is_?alive)$/i;
const HEALTH_COLUMN = /^(health|hp|hit_?points)$/i;
/** Seconds after a death in which an alive row does not count: a sample taken the same moment as the death. */
export const SETTLE = 0.1;

export interface Deaths {
  /** Per person, where its dead spans start in `from` and `to`; `start[p + 1]` where they end. */
  start: Int32Array;
  /** When each span starts: the death. */
  from: Float64Array;
  /** When it ends: alive again; Infinity for dead to the end. */
  to: Float64Array;
  /** Whether anyone dies. */
  any: boolean;
}

const cache = new WeakMap<Dataset, Deaths>();

/** A column's value at a row as a number: a category's label read as yes or no, NaN for neither. */
function valueAt(a: AttributeColumn, r: number): number {
  if (a.kind === 'category') {
    const l = (a.categories![(a.data as Uint32Array)[r]] ?? '').trim();
    if (/^(1|true|yes|alive)$/i.test(l)) return 1;
    if (/^(0|false|no|dead)$/i.test(l)) return 0;
    const v = Number(l);
    return l !== '' && Number.isFinite(v) ? v : NaN;
  }
  return a.data[r];
}

/** Per person, when it is dead (`Deaths`). Worked out once a dataset. */
export function deathsOf(d: Dataset): Deaths {
  const hit = cache.get(d);
  if (hit) return hit;
  const persons = Math.max(1, d.personLabels.length);
  const none: Deaths = { start: new Int32Array(persons + 1), from: new Float64Array(0), to: new Float64Array(0), any: false };
  const alive = d.attrs.find((a) => ALIVE_COLUMN.test(a.name.trim())) ?? null;
  const health = d.attrs.find((a) => a.kind === 'number' && HEALTH_COLUMN.test(a.name.trim())) ?? null;
  const ev = d.attrs.find((a) => a.kind === 'category' && a.categories && /^events?$/i.test(a.name.trim())) ?? null;
  const death = ev ? ev.categories!.map((c) => DEATH_EVENT.test(c.trim())) : null;
  const revive = ev ? ev.categories!.map((c) => REVIVE_EVENT.test(c.trim())) : null;
  const idx = personRows(d);
  const time = d.time;
  if (!idx || !time || (!alive && !health && !(death && death.some(Boolean)))) {
    cache.set(d, none);
    return none;
  }
  const { own, ids } = positionRows(d);
  const evIds = ev ? (ev.data as Uint32Array) : null;
  const P: number[] = [];
  const F: number[] = [];
  const T: number[] = [];
  for (let p = 0; p < persons; p++) {
    let since = NaN;
    for (let k = idx.start[p]; k < idx.start[p + 1]; k++) {
      const r = idx.rows[k];
      const t = time[r];
      const e = evIds ? evIds[r] : -1;
      let state = alive ? valueAt(alive, r) : NaN;
      if (Number.isNaN(state) && health && (!own || !ids || own[ids[r]])) state = health.data[r];
      if (Number.isNaN(since)) {
        if ((death && e >= 0 && death[e]) || state <= 0) since = t;
      } else if ((revive && e >= 0 && revive[e]) || (state > 0 && t > since + SETTLE)) {
        P.push(p);
        F.push(since);
        T.push(t);
        since = NaN;
      }
    }
    if (!Number.isNaN(since)) {
      P.push(p);
      F.push(since);
      T.push(Infinity);
    }
  }
  if (!P.length) {
    cache.set(d, none);
    return none;
  }
  // The spans are in person order already.
  const start = new Int32Array(persons + 1);
  for (const p of P) start[p + 1]++;
  for (let p = 0; p < persons; p++) start[p + 1] += start[p];
  const out: Deaths = { start, from: Float64Array.from(F), to: Float64Array.from(T), any: true };
  cache.set(d, out);
  return out;
}

/** Whether person `p` is dead at `t`. */
export function deadAt(e: Deaths, p: number, t: number): boolean {
  if (!e.any) return false;
  for (let k = e.start[p]; k < e.start[p + 1]; k++) if (t >= e.from[k] && t < e.to[k]) return true;
  return false;
}

/**
 * A dead span packed for the GPU tracks as two 16-bit steps across the
 * track's keys, first to last: the death (bits 0-15) and the return to life
 * (bits 16-31), each as 1 + 65534 x the fraction, 0 for none. The shader
 * compares the playhead's own fraction of the keys with them; a death after
 * the last key counts from the last key (the time it is held past it).
 */
export function packDeadSpan(from: number, to: number, first: number, last: number): number {
  if (!Number.isFinite(from) || from >= to) return 0;
  const span = last - first;
  const q = (t: number) => 1 + Math.round(Math.max(0, Math.min(1, span > 0 ? (t - first) / span : t > first ? 1 : 0)) * 65534);
  const a = q(from);
  const b = Number.isFinite(to) && to <= last ? q(to) : 0;
  return (a | (b << 16)) >>> 0;
}

/** `packDeadSpan` at a fraction of the track's keys: whether it is dead there. The shaders' test. */
export function deadInSpan(packed: number, frac: number): boolean {
  const a = packed & 0xffff;
  if (!a) return false;
  const b = packed >>> 16;
  return frac >= (a - 1) / 65534 && (b === 0 || frac < (b - 1) / 65534);
}

/** Person `p`'s last dead span: the one the GPU tracks carry ([from, to]); null for none. */
export function lastDeadSpan(e: Deaths, p: number): [number, number] | null {
  const b = e.start[p + 1];
  return b > e.start[p] ? [e.from[b - 1], e.to[b - 1]] : null;
}
