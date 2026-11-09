/**
 * What box replay's extras read from a dataset: a track's name as people say
 * it, and the event rows - any category column named like Event, Events or
 * Event type, with a label - in time order. Worked out once per dataset.
 */

import type { Dataset } from '../../state/types';
import { t } from '../../i18n';

const nameCache = new WeakMap<Dataset, (string | undefined)[]>();

/**
 * A track's name: its person label, with a Tacview id suffix (" #1a2") taken
 * off; a pilot and their aircraft read "Viper 1 (F-16C_50)".
 */
export function trackName(d: Dataset, person: number, row: number): string {
  // By track number, not by a key made for each call: an overlay of many matches has millions of tracks.
  let cache = nameCache.get(d);
  if (!cache) nameCache.set(d, (cache = []));
  const hit = cache[person];
  if (hit !== undefined) return hit;
  const label = d.personLabels[person] ?? String(person);
  // Without a pilot a Tacview object is "(T-90A) #1a2": the type alone.
  const bare = label.replace(/\s*#[0-9a-f]+$/i, '');
  const name = (/^\(([^()]*)\)$/.test(bare) ? bare.slice(1, -1) : bare) || label;
  cache[person] = name;
  void row;
  return name;
}

export interface EventRows {
  rows: Uint32Array;
  /** Each event's kind: the label, or its first word where the label is "Kind: text" (an ACMI event). */
  labels: string[];
  /** What the event says after its kind ("" for none): a message, a bookmark's note, a weapon's result. */
  texts: string[];
  /** The person each event is about. */
  persons: Int32Array;
}

const eventCache = new WeakMap<Dataset, EventRows | null>();

/** Labels an event column uses for rows that are only samples. */
const NOT_EVENTS = /^(position|positions|pos|sample|move|movement|tick|frame|state|alive|none|-)$/i;

/**
 * An event label as its kind and its text: ACMI events read "Kind: text"
 * (`acmi.ts`), a Timeout's text its named fields ("AmmoType:FOX2|Outcome:Kill").
 * A label without a one-word kind before ": " is all kind.
 */
export function splitEvent(label: string): { kind: string; text: string } {
  const m = /^([A-Za-z][\w-]*): ([\s\S]*)$/.exec(label);
  return m ? { kind: m[1], text: m[2].trim() } : { kind: label, text: '' };
}

/** An event's text to read: a Timeout's fields as "FOX2 · Kill", the ids left out (the units say who). */
export function eventText(text: string): string {
  if (!/^\w+\s*:/.test(text) || !text.includes('|')) return text;
  return text
    .split('|')
    .filter((f) => !/^\s*(SourceId|TargetId)\s*:/i.test(f))
    .map((f) => f.slice(f.indexOf(':') + 1).trim())
    .filter(Boolean)
    .join(' · ');
}

/** Tacview's event kinds (ACMI 2.2), and the parser's own (`acmi.ts`), by the message that names them. */
const ACMI_KINDS: Record<string, string> = {
  message: 'message',
  bookmark: 'bookmark',
  debug: 'debug',
  leftarea: 'leftArea',
  destroyed: 'destroyed',
  takenoff: 'takenOff',
  landed: 'landed',
  timeout: 'timeout',
  removed: 'removed',
  comment: 'comment',
  unplaced: 'unplaced',
};

/** An event kind as words - "hit_critical" -> "hit critical", Tacview's own in the viewer's language - and its text after. */
export function eventWords(label: string): string {
  const { kind, text } = splitEvent(label);
  const key = ACMI_KINDS[kind.toLowerCase()];
  const name = key ? t(`replay.events.kind.${key}`) : kind.replace(/[_-]+/g, ' ');
  return text ? `${name}: ${eventText(text)}` : name;
}

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
  // "Message: Maverick has violated ATC directives" is a Message, its words apart: one kind, not one per text.
  const kinds = col.categories.map((c) => splitEvent(c));
  const out: EventRows = {
    rows: Uint32Array.from(rows),
    labels: rows.map((r) => kinds[ids[r]].kind),
    texts: rows.map((r) => kinds[ids[r]].text),
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

/**
 * Event kinds too frequent to list or mark by default: each shell burst, gun
 * shot and flak puff is a row, thousands a match. Still a chip away.
 */
// An ACMI recording's Removed (every shell, flare and chaff leaving), Unplaced and Debug (Tacview shows those only when asked) too.
const NOISY_EVENTS = /^(explosions?|flak|gun_?shots?|shots? ?fired|fire_?stop|reload(ed)?|bullet_?rearm|tracer|impact|smoke_?puff|removed|unplaced|debug)$/i;

/**
 * Kinds left out of the floating labels in the view whatever the list shows:
 * the weapons layer draws shots, launches, hits and blasts as tracers,
 * flashes and fireballs, and a word over each would bury the units.
 */
const DRAWN_EVENTS = /^(shots?|gun_?shots?|explosions?|flak|launch(es)?|hit(_\w+)?|fire_?(start|stop)|reload(ed)?|repair(ed)?|rearm(ed)?|bullet_?rearm|impact)$/i;

/** Whether an event kind gets a floating label in the view. */
export function markedInView(kind: string): boolean {
  return !DRAWN_EVENTS.test(kind.trim());
}

/** The kinds shown when the viewer has not chosen: all but the noisy ones. */
export function defaultEventKinds(labels: string[]): string[] {
  return [...new Set(labels)].filter((k) => !NOISY_EVENTS.test(k.trim()));
}

export interface EventBurst {
  /** Index into `EventRows` of the first event. */
  first: number;
  /** How many events it stands for. */
  count: number;
  /** Seconds from the first to the last. */
  span: number;
}

/**
 * The event list's lines: consecutive events of one kind by one unit against
 * one other (a burst of hits, a stick of bombs) within `gap` seconds of each
 * other are one line. `idx` are indices into `ev`, in time order.
 */
export function eventBursts(d: Dataset, ev: EventRows, idx: number[], keyOf: (i: number) => string, gap = 3): EventBurst[] {
  const out: EventBurst[] = [];
  const open = new Map<string, { b: EventBurst; last: number }>();
  for (const i of idx) {
    const t = d.time ? d.time[ev.rows[i]] : 0;
    const key = `${ev.labels[i]}|${ev.texts[i]}|${keyOf(i)}`;
    const o = open.get(key);
    if (o && t - o.last <= gap) {
      o.b.count++;
      o.b.span = t - (d.time ? d.time[ev.rows[o.b.first]] : 0);
      o.last = t;
      continue;
    }
    const b = { first: i, count: 1, span: 0 };
    out.push(b);
    open.set(key, { b, last: t });
  }
  return out;
}
