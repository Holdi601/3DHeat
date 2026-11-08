/**
 * Tacview's altitude restrictions: a floor and a ceiling, and every moment a
 * unit goes through one - below the floor, above the ceiling, and back
 * inside - for the event list of the restriction and the alarm on labels.
 * Heights are metres above sea level, as the units' altitude is.
 */

import type { Dataset } from '../../state/types';
import type { AltitudeLimits } from '../../state/replayStore';
import { flightSeries } from '../../data/flight';
import { unitsOf, type Unit } from './units';

export type CrossingKind = 'belowFloor' | 'aboveCeiling' | 'backInside';

export interface Crossing {
  time: number;
  unit: Unit;
  person: number;
  kind: CrossingKind;
  /** The altitude after the crossing, metres. */
  alt: number;
}

/** Where a height is against the limits: -1 below the floor, 1 above the ceiling, 0 inside. */
export function limitSide(alt: number, l: AltitudeLimits): -1 | 0 | 1 {
  if (!Number.isFinite(alt)) return 0;
  if (l.floor !== null && alt < l.floor) return -1;
  if (l.ceiling !== null && alt > l.ceiling) return 1;
  return 0;
}

/**
 * The crossings of one series of heights: each change of side after the
 * first sample, and the first sample itself when it starts outside.
 */
export function crossingsOf(time: ArrayLike<number>, alt: ArrayLike<number>, l: AltitudeLimits): { index: number; kind: CrossingKind }[] {
  const out: { index: number; kind: CrossingKind }[] = [];
  let side: number | null = null;
  for (let i = 0; i < time.length; i++) {
    const s = limitSide(alt[i], l);
    if (!Number.isFinite(alt[i])) continue;
    if (side === null ? s !== 0 : s !== side) out.push({ index: i, kind: s < 0 ? 'belowFloor' : s > 0 ? 'aboveCeiling' : 'backInside' });
    side = s;
  }
  return out;
}

/** Every crossing of the units that are not weapons in a session, in time order. */
export function altitudeCrossings(d: Dataset, session: number, l: AltitudeLimits): Crossing[] {
  if (!l.on || (l.floor === null && l.ceiling === null)) return [];
  const index = unitsOf(d);
  const out: Crossing[] = [];
  for (const unit of index.units) {
    if (unit.kind === 'weapon') continue;
    for (const person of unit.persons) {
      const s = flightSeries(d, person, session);
      const alt = s?.values.alt;
      if (!s || !alt) continue;
      for (const c of crossingsOf(s.time, alt, l)) out.push({ time: s.time[c.index], unit, person, kind: c.kind, alt: alt[c.index] });
    }
  }
  out.sort((a, b) => a.time - b.time);
  return out;
}
