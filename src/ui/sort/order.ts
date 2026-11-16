/**
 * The one order every list in the viewer sorts by.
 *
 * Names sort the way a person reads them, not by code point: case and accents
 * do not split the list ("ärzte" beside "Arzt"), and the digits in a name count
 * as a number ("MP_2" before "MP_10"). Numbers sort as numbers. A missing value
 * - no name, no number - goes to the end whichever way the list runs, so a flip
 * to descending never puts a block of blanks at the top. Ties keep the order
 * the list had (the sort is stable), so a second sort refines the first.
 *
 * `orderOf` works on keys alone, so the same code sorts on the page and in the
 * worker a long list is sorted in (`sortWorker.ts`).
 */

export type SortDir = 'asc' | 'desc';
/** What a key is compared as: words in the natural order, or numbers. */
export type SortKind = 'text' | 'number';
export type SortKey = string | number | null | undefined;

const collators = new Map<string, Intl.Collator>();

/** The natural-order collator for a language, made once. */
export function collator(locale = 'en'): Intl.Collator {
  let c = collators.get(locale);
  if (!c) {
    try {
      c = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
    } catch {
      c = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
    }
    collators.set(locale, c);
  }
  return c;
}

/** Two names in the natural order: case- and accent-blind, digits as numbers. */
export function naturalCompare(a: string, b: string, locale = 'en'): number {
  return collator(locale).compare(a, b);
}

/** A key that has nothing to sort by. */
function missing(k: SortKey): boolean {
  return k === null || k === undefined || k === '' || (typeof k === 'number' && Number.isNaN(k));
}

/**
 * The order of `keys`: indices into them, sorted. Stable, missing keys last in
 * either direction.
 */
export function orderOf(keys: ArrayLike<SortKey>, kind: SortKind, dir: SortDir, locale = 'en'): Uint32Array {
  const n = keys.length;
  const idx = new Uint32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  const sign = dir === 'desc' ? -1 : 1;
  const cmp = collator(locale).compare;
  const text = kind === 'text';
  idx.sort((i, j) => {
    const a = keys[i];
    const b = keys[j];
    const ma = missing(a);
    const mb = missing(b);
    if (ma || mb) return ma === mb ? i - j : ma ? 1 : -1;
    let d: number;
    if (text) d = cmp(String(a), String(b));
    else {
      const x = Number(a);
      const y = Number(b);
      d = x < y ? -1 : x > y ? 1 : 0;
    }
    return d !== 0 ? d * sign : i - j;
  });
  return idx;
}

/** `items` in the order `orderOf` gives their keys. */
export function sortList<T>(
  items: readonly T[],
  key: ((item: T) => SortKey) | null,
  kind: SortKind,
  dir: SortDir,
  locale = 'en',
): T[] {
  if (!key) return dir === 'desc' ? [...items].reverse() : [...items];
  const order = orderOf(items.map(key), kind, dir, locale);
  const out = new Array<T>(order.length);
  for (let i = 0; i < order.length; i++) out[i] = items[order[i]];
  return out;
}
