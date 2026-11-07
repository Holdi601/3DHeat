/**
 * What box replay's extras read from a dataset: a track's name as people say
 * it, and the event rows - any category column named like Event, Events or
 * Event type, with a label - in time order. Worked out once per dataset.
 */

import type { Dataset } from '../../state/types';

const nameCache = new WeakMap<Dataset, Map<string, string>>();

/**
 * A track's name: its person label, with a Tacview id suffix (" #1a2") taken
 * off; a pilot and their aircraft read "Viper 1 (F-16C_50)".
 */
export function trackName(d: Dataset, person: number, row: number): string {
  let cache = nameCache.get(d);
  if (!cache) nameCache.set(d, (cache = new Map()));
  const key = `${person}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const label = d.personLabels[person] ?? String(person);
  // Without a pilot a Tacview object is "(T-90A) #1a2": the type alone.
  const bare = label.replace(/\s*#[0-9a-f]+$/i, '');
  const name = (/^\(([^()]*)\)$/.test(bare) ? bare.slice(1, -1) : bare) || label;
  cache.set(key, name);
  void row;
  return name;
}

export interface EventRows {
  rows: Uint32Array;
  labels: string[];
  /** The person each event is about. */
  persons: Int32Array;
}

const eventCache = new WeakMap<Dataset, EventRows | null>();

/** Labels an event column uses for rows that are only samples. */
const NOT_EVENTS = /^(position|positions|pos|sample|move|movement|tick|frame|state|alive|none|-)$/i;

export function eventRows(d: Dataset): EventRows | null {
  if (eventCache.has(d)) return eventCache.get(d)!;
  const col = d.attrs.find((a) => a.kind === 'category' && a.categories && /^events?( ?type| ?kind)?$/i.test(a.name.trim()));
  if (!col || !col.categories) {
    eventCache.set(d, null);
    return null;
  }
  const ids = col.data as Uint32Array;
  // A plain sample is not an event, whatever the column calls it: CS2 tables mark every position row "position".
  const isEvent = col.categories.map((c) => !!c && !NOT_EVENTS.test(c.trim()));
  const rows: number[] = [];
  for (let i = 0; i < d.count; i++) if (isEvent[ids[i]]) rows.push(i);
  if (d.time) rows.sort((a, b) => d.time![a] - d.time![b]);
  const out: EventRows = {
    rows: Uint32Array.from(rows),
    labels: rows.map((r) => col.categories![ids[r]]),
    persons: Int32Array.from(rows.map((r) => (d.personId ? d.personId[r] : -1))),
  };
  eventCache.set(d, out);
  return out;
}

/**
 * Data units in a metre: 1 unless the data says how big one tracked thing is
 * (the CS2 export: a player is 32 units across, about 0.8 m). What the labels,
 * the measured pair and the chart divide by, as the figures are scaled by it.
 */
export function unitsPerMetre(d: Dataset): number {
  return d.entitySize ? d.entitySize / 0.8 : 1;
}

/**
 * Whether drop lines are drawn: as set, or, left to the viewer, for data that
 * flies - a recording placed on the earth, or one with an Altitude column -
 * and not for the players of a shooter, who would each get a line through the
 * floors under them.
 */
export function dropLinesOn(d: Dataset, setting: boolean | null): boolean {
  if (setting !== null) return setting;
  return !!d.geo || d.attrs.some((a) => /^altitude$/i.test(a.name.trim()));
}
