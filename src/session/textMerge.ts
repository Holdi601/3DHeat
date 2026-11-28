/**
 * Text edited by several people at once, without lost edits: an edit
 * travels as a splice - where it is (the text around it), what it took out
 * and what it put in - and is laid onto whatever the text has become by
 * then, not over it. Two people typing in different places of a note both
 * keep what they typed; typing in the same place keeps both, the one the
 * session numbered later after the other's.
 *
 * The same function merges for everyone in the session's order, so every
 * viewer ends at the same text (`shared.ts`); an editor merges its own
 * unsaved typing onto what arrived the same way.
 */

export interface Splice {
  /** Hash of the text the edit was made on. */
  h: number;
  /** Where in that text, UTF-16 units. */
  p: number;
  /** What it took out. */
  x: string;
  /** What it put in. */
  i: string;
  /** The text just before and just after the edit (to find the place again). */
  a: string;
  z: string;
}

/** Characters of context kept on each side. */
const CONTEXT = 32;
/** An edit taking out more than this travels whole (the last one wins). */
const MAX_CUT = 4000;

/** FNV-1a over UTF-16 units: the same number on every machine. */
export function textHash(s: string): number {
  let h = 0x811c9dc5;
  for (let k = 0; k < s.length; k++) {
    h ^= s.charCodeAt(k);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** The one region where `before` and `after` differ, as a splice; null when they are the same or the cut is too big. */
export function spliceOf(before: string, after: string): Splice | null {
  if (before === after) return null;
  let p = 0;
  const n = Math.min(before.length, after.length);
  while (p < n && before.charCodeAt(p) === after.charCodeAt(p)) p++;
  let e = 0;
  while (e < n - p && before.charCodeAt(before.length - 1 - e) === after.charCodeAt(after.length - 1 - e)) e++;
  const x = before.slice(p, before.length - e);
  if (x.length > MAX_CUT) return null;
  return {
    h: textHash(before),
    p,
    x,
    i: after.slice(p, after.length - e),
    a: before.slice(Math.max(0, p - CONTEXT), p),
    z: before.slice(before.length - e, before.length - e + CONTEXT),
  };
}

/** Every place `needle` starts in `hay`. */
function starts(hay: string, needle: string): number[] {
  const out: number[] = [];
  if (!needle) return out;
  for (let k = hay.indexOf(needle); k >= 0 && out.length < 400; k = hay.indexOf(needle, k + 1)) out.push(k);
  return out;
}

const nearest = (xs: number[], to: number): number => xs.reduce((b, x) => (Math.abs(x - to) < Math.abs(b - to) ? x : b), xs[0]);

/** Whether a value is a splice as it travels. */
export function readSplice(v: unknown): Splice | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.h !== 'number' || typeof o.p !== 'number' || !Number.isInteger(o.p) || o.p < 0) return null;
  for (const k of ['x', 'i', 'a', 'z'] as const) if (typeof o[k] !== 'string') return null;
  return {
    h: o.h,
    p: o.p,
    x: o.x as string,
    i: o.i as string,
    a: o.a as string,
    z: o.z as string,
  };
}

/**
 * The splice laid onto `current`: where its context says it was (the
 * nearest such place to where it was); what it took out only if that is
 * still there; what it put in always. `whole` is what the editor's text was
 * after the edit: it is the answer when `current` is still what the edit was
 * made on.
 */
export function applySplice(current: string, sp: Splice, whole?: string): string {
  if (whole !== undefined && textHash(current) === sp.h) return whole;
  const { a, x, z, i } = sp;
  const put = (k: number, cut: boolean) => current.slice(0, k) + i + current.slice(k + (cut ? x.length : 0));
  // The text around the edit, the closest to it first: someone else's edit nearby may have
  // changed the far end of the context, so it is shortened until it is found.
  for (const n of [Math.max(a.length, z.length), 24, 16, 10, 6, 3]) {
    const aa = a.slice(Math.max(0, a.length - n));
    const zz = z.slice(0, n);
    if (!aa && !x && !zz) continue;
    const full = starts(current, aa + x + zz);
    if (full.length) return put(nearest(full, sp.p - aa.length) + aa.length, true);
  }
  for (const n of [Math.max(a.length, z.length), 16, 8, 4]) {
    const aa = a.slice(Math.max(0, a.length - n));
    const zz = z.slice(0, n);
    const ax = aa || x ? starts(current, aa + x) : [];
    if (ax.length && aa.length >= Math.min(4, a.length)) return put(nearest(ax, sp.p - aa.length) + aa.length, true);
    const xz = x || zz ? starts(current, x + zz) : [];
    if (xz.length && zz.length >= Math.min(4, z.length)) return put(nearest(xz, sp.p), true);
  }
  // Nothing of it is there as it was: what was typed goes in where it was, nothing is taken out.
  const k = Math.max(0, Math.min(current.length, sp.p));
  return put(k, false);
}

/** Three texts merged: `mine` and `theirs` both made from `base`; both edits kept. */
export function merge3(base: string, mine: string, theirs: string): string {
  if (mine === base) return theirs;
  if (theirs === base || theirs === mine) return mine;
  const sp = spliceOf(base, mine);
  return sp ? applySplice(theirs, sp) : mine;
}

/** Where a caret at `at` in `before` is in `after` (the text changed around it). */
export function moveCaret(before: string, after: string, at: number): number {
  const sp = spliceOf(before, after);
  if (!sp) return at;
  if (at <= sp.p) return at;
  if (at >= sp.p + sp.x.length) return at + sp.i.length - sp.x.length;
  return sp.p + sp.i.length;
}
