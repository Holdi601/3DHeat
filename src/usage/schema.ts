/**
 * Local usage statistics: what one event may hold, and nothing more.
 *
 * An event says which part of the viewer was used, how and how often - never
 * what it was used on. Ids are built from the viewer's own message keys and
 * command ids (`ctl:<section key>/<label key>`, `cmd:<shortcut id>`), never
 * from a title, a file name or a value. The validator here is the one rule
 * both ends keep: the page drops what it would not pass, and the local server
 * route (`/__heat3d/usage` in vite.config.ts) refuses a batch with one event
 * that does not pass. Two fields carry the user's own words, and only these:
 * `q`, a command-palette search that found nothing (the settings page says
 * so), and `note`, feedback the user typed for a control.
 *
 * Pure: no DOM, no imports, so the node report tool reads it as it is.
 */

export const USAGE_VERSION = 1;

/** What happened. */
export const KINDS = [
  /** A page load: `v` the backend, `id` the screen size bucket. */
  'session',
  /** The page went away. */
  'end',
  /** Active time (input in the last minute) in a workspace and view mode: `ws`, `mode`, `ms`. */
  'time',
  /** Files picked to load: `v` how, `id` their types, `n` how many. */
  'pick',
  /** Data loaded: `v` how, `id` its types, `n` rows as a power of ten, `ms` how long. */
  'load',
  /** A feature used: `id`, `src`, `n` interactions it took from rest, `sc` panel scroll in 100 px. */
  'use',
  /** A section, panel, task group, fold or dialog opened (`src`) or closed (`ms` it was open). */
  'open',
  'close',
  /** A setting changed: `id`; `v` the choice only where it is one of a fixed few. */
  'set',
  /** A command-palette search: `n` results; `q` the words only when nothing was found. */
  'search',
  /** Help looked up for a feature: `src` f1 (the help key) or hover (a tooltip read for over a second). */
  'help',
  /** Something went wrong for the user: `v` the kind (FRICTION), `id` the feature. */
  'friction',
  /** An error (`v` error) or warning (`v` warn) shown, `id` the feature used just before. */
  'error',
  /** Time at a frame rate: `ws`, `n` the FPS_BUCKETS index, `ms`. */
  'fps',
  /** The quality switch turned motion and extras off for a slow frame rate: `ws`. */
  'degrade',
  /** A control or section on screen: `id`, `ms` visible. */
  'seen',
  /** Feedback on a feature: `id`, `v` FEEDBACK, `note` the user's words. */
  'feedback',
] as const;
export type Kind = (typeof KINDS)[number];

/** How an action was reached. */
export const SOURCES = ['palette', 'key', 'button', 'quick', 'context', 'auto', 'f1', 'hover', 'drop'] as const;
export type Source = (typeof SOURCES)[number];

export const WORKSPACES = ['heat', 'race', 'match', 'plan', 'vehicle'] as const;

/** How data came in. */
export const LOAD_METHODS = ['files', 'folder', 'drop', 'session', 'catalogue', 'generator', 'native', 'other'] as const;
export type LoadMethod = (typeof LOAD_METHODS)[number];

/** File types, by extension; anything else is `other`. */
export const FILE_TYPES = [
  'parquet', 'csv', 'tsv', 'txt', 'json', 'jsonl', 'acmi', 'zip', 'wrpl', 'dem', 'rec', 'replay', 'wowsreplay', 'wotreplay',
  'glb', 'gltf', 'obj', 'bin', 'pb', 'gz', 'zst', 'arrow', 'heat3d', 'other',
] as const;

/** The kinds of friction. */
export const FRICTION = [
  /** Undone within a few seconds of using it. */
  'undo',
  /** Opened and closed again within 3 s, nothing done inside. */
  'quick-close',
  /** Clicked again and again on one spot within a second. */
  'rage',
  /** The palette searched again soon after a search that ran nothing. */
  'repeat-search',
  /** Clicked, and nothing changed within a second: no state, no page change, no dialog. */
  'dead',
  /** Sections and groups wandered through without using anything, then the palette. */
  'lost',
  /** Switched on and off again and again. */
  'toggle',
] as const;

export const FEEDBACK = ['unclear', 'broken', 'wish'] as const;

/** Frame rate buckets: under 20, 20-30, 30-45, 45-55, 55 and over. */
export const FPS_BUCKETS = ['lt20', '20-30', '30-45', '45-55', '55+'] as const;

/** Prefixes of a feature id, by what it names. */
export const ID_PREFIXES = [
  /** A control: `ctl:<section or panel key>/<label key>`. */
  'ctl',
  /** A side-panel section, by its title key. */
  'sec',
  /** A command or a key: the shortcut id or palette action id. */
  'cmd',
  /** A task group: `task:<workspace>.<group>`. */
  'task',
  /** A workspace. */
  'ws',
  /** A "More" fold, by its id. */
  'more',
  /** An overlay or dialog: palette, sheet, settings, help, usage... */
  'panel',
  /** A view mode. */
  'mode',
  /** A camera view or projection. */
  'cam',
  /** The screen size bucket (`scr:1920x1080`). */
  'scr',
  /** Data file types (`data:csv+parquet`). */
  'data',
  /** Where an error came from when no feature was used just before. */
  'err',
  /** A tactics board tool. */
  'tool',
  /** A spot on the page that is not a control (`area:stage`). */
  'area',
] as const;

export interface UsageEvent {
  /** When, ms since 1970. */
  t: number;
  k: Kind;
  /** The page load it belongs to: random, eight to sixteen hex digits. */
  s: string;
  id?: string;
  src?: Source;
  ws?: string;
  mode?: string;
  n?: number;
  ms?: number;
  /** Panel scroll before a use, in 100 px. */
  sc?: number;
  v?: string;
  /** The words of a palette search that found nothing. */
  q?: string;
  /** Feedback the user typed. */
  note?: string;
  /** A developer tool (shown with `?dev`). */
  dev?: 1;
}

/** Limits. */
export const LIMITS = {
  id: 160,
  q: 80,
  note: 500,
  /** Events in one batch the server takes. */
  batch: 2000,
  /** Bytes of one batch the server takes. */
  bytes: 512 * 1024,
} as const;

const FIELDS = new Set(['t', 'k', 's', 'id', 'src', 'ws', 'mode', 'n', 'ms', 'sc', 'v', 'q', 'note', 'dev']);
const KIND_SET = new Set<string>(KINDS);
const SOURCE_SET = new Set<string>(SOURCES);
const WS_SET = new Set<string>(WORKSPACES);
const PREFIX_SET = new Set<string>(ID_PREFIXES);

/**
 * Extensions that name a file. A segment ending in one is a file name, not a
 * key, whatever else it looks like (`movement.parquet` would otherwise pass
 * as a dotted key).
 */
const FILE_EXT = /\.(parquet|csv|tsv|txt|json|jsonl|acmi|zip|wrpl|dem|rec|replay|wowsreplay|wotreplay|glb|gltf|obj|bin|pb|gz|zst|arrow|heat3d|png|jpe?g|webp|mp4|log|xml|ya?ml|pak|vpk|bsp|map|exe|dll)$/i;
/** One segment of an id: a message key or a command id - a lowercase letter, then letters, digits, `.`, `_`, `-`. */
const SEGMENT = /^[a-z][a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9_-]+)*$/;
/** A fixed-choice value: a short lowercase word. */
const ENUM = /^[a-z0-9][a-z0-9_+.-]{0,31}$/;

/**
 * Whether `id` is a feature id: a known prefix, then one segment, or two for
 * a control (`section/label`); no spaces, no path, no file name. With
 * `isKey`, the segments of `ctl:` and `sec:` must also be message keys (and
 * a message key may end like a file name; without `isKey` nothing may).
 */
export function validId(id: unknown, isKey?: (k: string) => boolean): id is string {
  if (typeof id !== 'string' || id.length === 0 || id.length > LIMITS.id) return false;
  const colon = id.indexOf(':');
  if (colon < 1) return false;
  const prefix = id.slice(0, colon);
  if (!PREFIX_SET.has(prefix)) return false;
  const rest = id.slice(colon + 1);
  const parts = rest.split('/');
  if (parts.length > (prefix === 'ctl' ? 2 : 1)) return false;
  for (const p of parts) {
    // `_`: a control in a section whose label is not a message (an unnamed button).
    if (p === '_' && prefix === 'ctl' && parts.length === 2) continue;
    if (prefix === 'scr' ? !/^\d{1,5}x\d{1,5}$/.test(p) : prefix === 'data' ? !/^[a-z]+(\+[a-z]+)*$/.test(p) : !SEGMENT.test(p)) return false;
    // A message key may end like a file (`replay.events.csv`); anything else that does is a file name.
    const known = !!isKey && isKey(p);
    if (!known && FILE_EXT.test(p)) return false;
    if (isKey && (prefix === 'sec' || prefix === 'ctl') && !known) return false;
  }
  return true;
}

const intIn = (v: unknown, lo: number, hi: number) => typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi;
/** User text: printable, one line for a search. */
const text = (v: unknown, max: number, lines: boolean) =>
  typeof v === 'string' && v.length > 0 && v.length <= max && !(lines ? /[\u0000-\u0009\u000b-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(v);

/**
 * Whether `e` is an event this schema allows, field by field: every field
 * known, every value its type and size, the user's words only where they
 * belong. Returns the reason it is not, or null.
 */
export function checkEvent(e: unknown, isKey?: (k: string) => boolean): string | null {
  if (!e || typeof e !== 'object' || Array.isArray(e)) return 'not an object';
  const o = e as Record<string, unknown>;
  for (const k of Object.keys(o)) if (!FIELDS.has(k)) return `field ${k}`;
  if (!intIn(o.t, 1e12, 1e14)) return 't';
  if (typeof o.k !== 'string' || !KIND_SET.has(o.k)) return 'k';
  if (typeof o.s !== 'string' || !/^[0-9a-f]{8,16}$/.test(o.s)) return 's';
  if (o.id !== undefined && !validId(o.id, isKey)) return 'id';
  if (o.src !== undefined && !(typeof o.src === 'string' && SOURCE_SET.has(o.src))) return 'src';
  if (o.ws !== undefined && !(typeof o.ws === 'string' && WS_SET.has(o.ws))) return 'ws';
  if (o.mode !== undefined && !(typeof o.mode === 'string' && /^[a-z][a-z-]{0,23}$/.test(o.mode))) return 'mode';
  if (o.n !== undefined && !intIn(o.n, 0, 1e7)) return 'n';
  if (o.ms !== undefined && !intIn(o.ms, 0, 864e5)) return 'ms';
  if (o.sc !== undefined && !intIn(o.sc, 0, 10000)) return 'sc';
  if (o.v !== undefined && !(typeof o.v === 'string' && ENUM.test(o.v))) return 'v';
  if (o.q !== undefined && !(o.k === 'search' && o.n === 0 && text(o.q, LIMITS.q, false))) return 'q';
  if (o.note !== undefined && !(o.k === 'feedback' && text(o.note, LIMITS.note, true))) return 'note';
  if (o.dev !== undefined && o.dev !== 1) return 'dev';
  if (o.k === 'friction' && !(FRICTION as readonly string[]).includes(o.v as string)) return 'friction kind';
  if (o.k === 'feedback' && !(FEEDBACK as readonly string[]).includes(o.v as string)) return 'feedback kind';
  if ((o.k === 'pick' || o.k === 'load') && o.v !== undefined && !(LOAD_METHODS as readonly string[]).includes(o.v as string)) return 'load method';
  return null;
}

export const validEvent = (e: unknown, isKey?: (k: string) => boolean): e is UsageEvent => checkEvent(e, isKey) === null;

/**
 * A batch the server takes: `{ v: 1, events: [...] }`, at most LIMITS.batch
 * events, each valid. Returns the events, or the reason it is refused.
 */
export function checkBatch(body: unknown, isKey?: (k: string) => boolean): UsageEvent[] | string {
  if (!body || typeof body !== 'object') return 'not an object';
  const b = body as Record<string, unknown>;
  if (b.v !== USAGE_VERSION) return 'version';
  if (Object.keys(b).some((k) => k !== 'v' && k !== 'events')) return 'fields';
  if (!Array.isArray(b.events) || b.events.length === 0 || b.events.length > LIMITS.batch) return 'events';
  for (let i = 0; i < b.events.length; i++) {
    const why = checkEvent(b.events[i], isKey);
    if (why) return `event ${i}: ${why}`;
  }
  return b.events as UsageEvent[];
}

// ---------------------------------------------------------------- buckets

/** Rows as a power of ten: 0 for under 10, 6 for a million or more... */
export function rowsBucket(rows: number): number {
  return rows >= 1 ? Math.min(12, Math.floor(Math.log10(rows))) : 0;
}

/** A count as a small number: exact to 10, then 10, 20, 50, 100, 200, 500, 1000. */
export function countBucket(n: number): number {
  if (n <= 10) return Math.max(0, Math.round(n));
  for (const b of [20, 50, 100, 200, 500]) if (n <= b) return b;
  return 1000;
}

/** The screen as `scr:<w>x<h>`, rounded to 160 x 90 steps. */
export function screenBucket(w: number, h: number): string {
  const r = (v: number, s: number) => Math.max(s, Math.round(v / s) * s);
  return `scr:${r(w, 160)}x${r(h, 90)}`;
}

/** The FPS_BUCKETS index of a frame rate. */
export function fpsBucket(fps: number): number {
  return fps < 20 ? 0 : fps < 30 ? 1 : fps < 45 ? 2 : fps < 55 ? 3 : 4;
}

/** A file's type from its name: the extension if known, else `other`. The name itself is not kept. */
export function fileType(name: string): string {
  const m = /\.([a-z0-9]{1,12})$/i.exec(name);
  const ext = m ? m[1].toLowerCase() : '';
  // `.txt.acmi`, `.zip.acmi`: Tacview's.
  if (/\.acmi$/i.test(name) || /\.(txt|zip)\.acmi$/i.test(name)) return 'acmi';
  return (FILE_TYPES as readonly string[]).includes(ext) ? ext : 'other';
}

/** Several files' types: distinct, sorted, `data:csv+parquet`. */
export function fileTypesId(names: Iterable<string>): string | undefined {
  const set = new Set<string>();
  for (const n of names) set.add(fileType(n));
  return set.size ? `data:${[...set].sort().join('+')}` : undefined;
}

/** A camera view's name as an id segment: `Iso NE` → `isoNE`. */
export function idSegment(name: string): string {
  const s = name.replace(/[^A-Za-z0-9]+/g, '');
  return s ? s[0].toLowerCase() + s.slice(1) : '_';
}
