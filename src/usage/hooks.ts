/**
 * What the viewer's own code tells the usage statistics: a section opened, a
 * setting changed, a command run, files picked. Each call is a few compares
 * and at most one `record` (a push); every one returns at once while
 * statistics are off. No stores are imported here, so any module can call in
 * without a cycle; ui/usage/track.ts wires the stores and the page.
 *
 * The click path. Every interaction that moves toward a feature without being
 * one - a workspace switched, a task group or a section opened, a fold, a
 * scroll of the side panel, the palette opened - counts one step; using a
 * feature records the steps it took (`n`, the click itself included) and
 * starts again. A minute without input is rest: the count starts again too.
 */

import { record, usageOn } from './recorder';
import { countBucket, fileTypesId, FRICTION, type LoadMethod, type Source } from './schema';

/** Where the user is: kept by ui/usage/track.ts. */
export const where = { ws: 'heat', mode: '' };

/** The side panel's scroll in 100 px, for a use inside it: set by track.ts. */
export let panelScroll: (el: Element | null) => number | undefined = () => undefined;
export function setPanelScroll(fn: typeof panelScroll): void {
  panelScroll = fn;
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// ---------------------------------------------------------------- source

let src: Source = 'auto';
let srcUntil = 0;

/** What comes next came from `s` (the palette, a key, the quick bar...), for `ms`. */
export function withSource(s: Source, ms = 400): void {
  src = s;
  srcUntil = now() + ms;
}

/**
 * Where the action being recorded came from: the last `withSource` (a click
 * sets `button` for a moment, a key `key`), else `auto` - the viewer did it
 * by itself, or a test did, and it is not counted as a use.
 */
export function sourceNow(): Source {
  return now() < srcUntil ? src : 'auto';
}

// ---------------------------------------------------------------- path and activity

let steps = 0;
let stepsUnused = 0;
let lastActive = 0;
let uses = 0;
let lastUse: { id: string; at: number } | null = null;
const REST_MS = 60_000;

/** Input seen now (a key, a click, a scroll). */
export function noteActive(): void {
  const t = now();
  if (t - lastActive > REST_MS) {
    steps = 0;
    stepsUnused = 0;
  }
  lastActive = t;
}

/** Whether there was input in the last minute. */
export const isActive = () => now() - lastActive < REST_MS;

/** One step toward a feature that is not itself one. */
export function noteStep(): void {
  if (!usageOn()) return;
  steps++;
  stepsUnused++;
}

/** The feature used last, when it was within `ms`. */
export function recentUse(ms: number): string | null {
  return lastUse && now() - lastUse.at <= ms ? lastUse.id : null;
}

const toggles = new Map<string, number[]>();

function used(id: string, kind: 'use' | 'set', o: { src?: Source; v?: string; el?: Element | null; dev?: boolean }): void {
  const sc = panelScroll(o.el ?? null);
  record({ k: kind, id, src: o.src ?? sourceNow(), ws: where.ws as never, n: steps + 1, ...(sc !== undefined ? { sc } : {}), ...(o.v ? { v: o.v } : {}), ...(o.dev ? { dev: 1 } : {}) });
  steps = 0;
  stepsUnused = 0;
  uses++;
  lastUse = { id, at: now() };
}

/** A feature used: a command, a button, a key. */
export function noteUse(id: string | null, o: { src?: Source; el?: Element | null; dev?: boolean } = {}): void {
  if (!id || !usageOn()) return;
  used(id, 'use', o);
}

/** A setting changed; `v` only where the choice is one of a fixed few. Switched on and off four times in 20 s is friction. */
export function noteSet(id: string | null, v?: string, o: { el?: Element | null; dev?: boolean } = {}): void {
  if (!id || !usageOn()) return;
  used(id, 'set', { ...o, v });
  if (v === 'on' || v === 'off') {
    const t = now();
    const list = (toggles.get(id) ?? []).filter((x) => t - x < 20_000);
    list.push(t);
    toggles.set(id, list);
    if (list.length === 4) noteFriction('toggle', id);
  }
}

/** Friction of a kind on a feature. */
export function noteFriction(kind: (typeof FRICTION)[number], id: string | null): void {
  if (!id || !usageOn()) return;
  record({ k: 'friction', v: kind, id, ws: where.ws as never });
}

// ---------------------------------------------------------------- open and close

const opened = new Map<string, { at: number; uses: number }>();

/**
 * A section, panel, task group, fold or dialog opened or closed. Closed within
 * 3 s with nothing used in between is friction: it was not what was looked for.
 */
export function noteOpen(id: string | null, open: boolean, o: { src?: Source; dev?: boolean } = {}): void {
  if (!id || !usageOn()) return;
  const t = now();
  if (open) {
    opened.set(id, { at: t, uses });
    noteStep();
    record({ k: 'open', id, src: o.src ?? sourceNow(), ws: where.ws as never, ...(o.dev ? { dev: 1 } : {}) });
    return;
  }
  const was = opened.get(id);
  opened.delete(id);
  const ms = was ? Math.min(864e5, Math.round(t - was.at)) : undefined;
  record({ k: 'close', id, ws: where.ws as never, ...(ms !== undefined ? { ms } : {}) });
  if (was && t - was.at < 3000 && uses === was.uses) noteFriction('quick-close', id);
}

/** An undo: friction on what was used just before it. */
export function noteUndo(): void {
  if (!usageOn()) return;
  const id = recentUse(5000);
  if (id) noteFriction('undo', id);
}

/** An error or warning shown: blamed on what was used in the last 5 s, else on `where`. */
export function noteError(level: 'error' | 'warn', fallback: string): void {
  if (!usageOn()) return;
  record({ k: 'error', v: level, id: recentUse(5000) ?? fallback, ws: where.ws as never });
}

// ---------------------------------------------------------------- the palette

let missAt = -1e9;

/** The palette opened: soon after a search that ran nothing, it is the same search again. */
export function notePaletteOpen(): void {
  if (!usageOn()) return;
  if (now() - missAt < 30_000) noteFriction('repeat-search', 'panel:palette');
}

/**
 * The palette closed: what was searched (the words only when nothing was
 * found, which is what they are kept for) and what was run. Run after
 * wandering three or more steps without using anything is friction: it was
 * looked for and not found where it is.
 */
export function notePaletteDone(query: string, results: number, ran: string | null): void {
  if (!usageOn()) return;
  const q = query.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80);
  if (q) record({ k: 'search', n: countBucket(results), ...(results === 0 ? { q } : {}), ws: where.ws as never });
  if (ran) {
    if (stepsUnused >= 3) noteFriction('lost', ran);
  } else if (q) missAt = now();
}

// ---------------------------------------------------------------- data

let pick: { method: LoadMethod; types?: string; at: number; dev: boolean } | null = null;

/** Files picked to load (their names give their types; the names are not kept), or the generator run. */
export function notePick(method: LoadMethod, names: Iterable<string> = [], o: { dev?: boolean } = {}): void {
  if (!usageOn()) return;
  const list = [...names];
  const types = fileTypesId(list);
  pick = { method, types, at: now(), dev: !!o.dev };
  record({ k: 'pick', v: method, ...(types ? { id: types } : {}), n: countBucket(list.length), ws: where.ws as never, ...(o.dev ? { dev: 1 } : {}) });
  noteStep();
}

/** The last pick, if it was in the last half hour; taken. */
export function takePick(): typeof pick {
  const p = pick && now() - pick.at < 30 * 60_000 ? pick : null;
  pick = null;
  return p;
}
