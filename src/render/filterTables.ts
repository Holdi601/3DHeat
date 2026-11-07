import type { Dataset, FilterSpec, SplitRule, ViewMode } from '../state/types';
import { FILTER_MASK_CAPACITY, MAX_FILTER_SLOTS, type ActiveFilter, type SplitMode } from './types';

/**
 * What the heat pass is told about filters, groups and the difference split.
 *
 * Pure functions over the dataset and the store's settings, so the rules can be
 * tested without a GPU: which filter gets which of the four slots, what the
 * group sign table holds, and how the two sign tables share one upload.
 */

/**
 * The column name the person filter is given in its slot.
 *
 * Not a column: both renderers resolve it to `Dataset.personId` when they upload
 * a slot's per-row values (see `filterColumnData`). It starts with a NUL, which
 * no column name read from a file carries, so it cannot shadow a real column.
 */
export const PERSON_FILTER_COLUMN = '\u0000person';

/** Per-row values for a filter slot or the split: a retained column, or the person ids. */
export function filterColumnData(ds: Dataset, column: string): ArrayLike<number> | null {
  if (column === PERSON_FILTER_COLUMN) return ds.personId;
  return ds.attrs.find((a) => a.name === column)?.data ?? null;
}

/** Whether a filter restricts anything, and so needs a slot. */
function needsSlot(ds: Dataset, f: FilterSpec): boolean {
  if (f.kind === 'range') {
    const attr = ds.attrs.find((a) => a.name === f.column);
    // A range covering the whole column filters nothing; it takes no slot, so the
    // slot and its 4-bytes-per-row values stay free.
    return !!attr && !(f.min <= attr.min && f.max >= attr.max);
  }
  if (f.kind === 'categories') {
    const attr = ds.attrs.find((a) => a.name === f.column);
    return !!attr?.categories && f.allowed.length !== attr.categories.length;
  }
  if (f.kind === 'persons') {
    // Without per-row person ids there is nothing for the shader to test; and
    // every person selected is no restriction at all. The Entities panel and the
    // Match tab both list each id once, so the length is the count.
    return !!ds.personId && f.allowed.length > 0 && f.allowed.length < ds.personLabels.length;
  }
  // Groups are decided by the sign table, not a slot.
  return false;
}

/**
 * The slot each filter takes, in the order given.
 *
 * `null` for a filter that needs none — a group filter, a range over the whole
 * column, a column the dataset does not have. Otherwise the slot index, which is
 * `MAX_FILTER_SLOTS` or more for a filter that did not get one and is not
 * applied. The person filter counts like any column filter. The engine and the
 * Filters and Entities panels all ask this, so what the panels call applied is
 * what the shader applies.
 */
export function filterSlots(ds: Dataset | null, filters: FilterSpec[]): (number | null)[] {
  let next = 0;
  return filters.map((f) => (ds && needsSlot(ds, f) ? next++ : null));
}

/**
 * The store's filters as GPU slots, up to MAX_FILTER_SLOTS.
 *
 * Extras are dropped rather than silently combined; the panels mark them (see
 * `filterSlots`). `cache` keeps each spec's slot description across frames,
 * keyed by the spec object, which the store replaces on every change: the person
 * filter's mask is up to 65,536 bytes and is built once per selection rather than
 * once per frame. The caller clears it when the dataset changes.
 */
export function buildActiveFilters(
  ds: Dataset | null,
  filters: FilterSpec[],
  cache?: WeakMap<FilterSpec, ActiveFilter>,
): ActiveFilter[] {
  if (!ds) return [];
  const slots = filterSlots(ds, filters);
  const out: ActiveFilter[] = [];
  filters.forEach((f, i) => {
    const slot = slots[i];
    if (slot === null || slot >= MAX_FILTER_SLOTS) return;
    let active = cache?.get(f);
    if (!active) {
      active = describeFilter(ds, f);
      cache?.set(f, active);
    }
    out.push(active);
  });
  return out;
}

/** One slot's description; only called for a filter `needsSlot` accepted. */
function describeFilter(ds: Dataset, f: FilterSpec): ActiveFilter {
  if (f.kind === 'range') {
    return {
      column: f.column,
      kind: 'range',
      min: f.min,
      max: f.max,
      mask: null,
      key: `r:${f.column}:${f.min}:${f.max}`,
    };
  }
  if (f.kind === 'categories') {
    const n = ds.attrs.find((a) => a.name === f.column)?.categories?.length ?? 0;
    return {
      column: f.column,
      kind: 'categories',
      min: 0,
      max: 0,
      mask: allowMask(f.allowed, n),
      key: `c:${f.column}:${f.allowed.join(',')}`,
    };
  }
  // The person filter. The `teams` kind never reaches here.
  const allowed = f.kind === 'persons' ? f.allowed : [];
  return {
    column: PERSON_FILTER_COLUMN,
    kind: 'categories',
    min: 0,
    max: 0,
    mask: allowMask(allowed, ds.personLabels.length),
    key: `p:${allowed.join(',')}`,
  };
}

/**
 * One byte per id, 255 where allowed, cut at the mask's capacity.
 *
 * An id past `FILTER_MASK_CAPACITY` has no byte, and the shader rejects an id
 * past the mask — so such a row is not drawn while the filter is active.
 */
function allowMask(allowed: number[], ids: number): Uint8Array {
  const mask = new Uint8Array(Math.min(FILTER_MASK_CAPACITY, Math.max(0, ids)));
  for (const i of allowed) if (i >= 0 && i < mask.length) mask[i] = 255;
  return mask;
}

/**
 * Per-group weight: +1 added, -1 subtracted, 0 hidden — or, unsigned, 1 shown.
 *
 * `signed` is difference mode splitting by group. Everywhere else, including a
 * difference split by a column, the table is visibility only: the Teams list's
 * checkboxes and the group filter. Null when the dataset has no groups.
 */
export function buildGroupTable(
  ds: Dataset | null,
  signed: boolean,
  positive: number[],
  negative: number[],
  visibility: Record<number, boolean>,
  filters: FilterSpec[],
  reuse: Int8Array | null = null,
): Int8Array | null {
  if (!ds || !ds.teamId || ds.teamLabels.length === 0) return null;
  const n = ds.teamLabels.length;
  const sign = reuse && reuse.length === n ? reuse : new Int8Array(n);

  const teamFilter = filters.find((f) => f.kind === 'teams');
  const allowed = teamFilter && teamFilter.kind === 'teams' ? new Set(teamFilter.allowed) : null;
  const pos = new Set(positive);
  const neg = new Set(negative);
  for (let i = 0; i < n; i++) {
    const shown = visibility[i] !== false && (!allowed || allowed.has(i));
    if (!signed) sign[i] = shown ? 1 : 0;
    else sign[i] = !shown ? 0 : pos.has(i) ? 1 : neg.has(i) ? -1 : 0;
  }
  return sign;
}

/** The difference split, resolved against the dataset. */
export interface SplitTable {
  mode: SplitMode;
  column: string | null;
  /** Mode 1: sign per category of `column`. */
  sign: Int8Array | null;
  positiveRange: [number, number];
  negativeRange: [number, number];
}

export const NO_SPLIT: SplitTable = {
  mode: 0,
  column: null,
  sign: null,
  positiveRange: [0, 0],
  negativeRange: [0, 0],
};

/**
 * The split rule as the shader needs it: a mode, the column whose per-row values
 * to read, and either a sign-per-category table or two ranges.
 *
 * A rule naming a column the dataset does not have falls back to groups rather
 * than rendering nothing, because a saved view outliving its dataset should
 * degrade rather than go blank.
 */
export function buildSplitTable(
  ds: Dataset | null,
  rule: SplitRule,
  reuse: Int8Array | null = null,
): SplitTable {
  if (!ds || rule.kind === 'teams') return NO_SPLIT;
  const attr = ds.attrs.find((a) => a.name === rule.column);
  if (!attr) return NO_SPLIT;

  if (rule.kind === 'categories') {
    if (attr.kind !== 'category' || !attr.categories) return NO_SPLIT;
    const n = attr.categories.length;
    const sign = reuse && reuse.length === n ? reuse : new Int8Array(n);
    const pos = new Set(rule.positive);
    const neg = new Set(rule.negative);
    let any = false;
    for (let i = 0; i < n; i++) {
      sign[i] = pos.has(i) ? 1 : neg.has(i) ? -1 : 0;
      if (sign[i] !== 0) any = true;
    }
    // Neither side selected would reject every row and show an empty frame with
    // no explanation; groups at least show something.
    if (!any) return NO_SPLIT;
    return { mode: 1, column: rule.column, sign, positiveRange: [0, 0], negativeRange: [0, 0] };
  }

  if (attr.kind !== 'number') return NO_SPLIT;
  return {
    mode: 2,
    column: rule.column,
    sign: null,
    positiveRange: normaliseRange(rule.positive),
    negativeRange: normaliseRange(rule.negative),
  };
}

/** Order a user-entered range so `min <= max`, and keep it finite. */
function normaliseRange(r: [number, number]): [number, number] {
  const a = Number.isFinite(r[0]) ? r[0] : 0;
  const b = Number.isFinite(r[1]) ? r[1] : 0;
  return a <= b ? [a, b] : [b, a];
}

/**
 * Both sign tables for a frame: the group table and the split.
 *
 * Only difference mode has two sides, so a column split is inert elsewhere. Under
 * a column split the group table turns into visibility only — the column decides
 * the sign — and is still sent, because a group unticked in the Teams list or
 * left out of the group filter has to stay hidden whichever way the difference
 * is split. `scratch` holds the two arrays between frames.
 */
export function frameSignTables(
  ds: Dataset | null,
  mode: ViewMode,
  positive: number[],
  negative: number[],
  visibility: Record<number, boolean>,
  filters: FilterSpec[],
  rule: SplitRule,
  scratch: { group: Int8Array | null; split: Int8Array | null },
): { teamSign: Int8Array | null; split: SplitTable } {
  const split = mode === 'heat-difference' ? buildSplitTable(ds, rule, scratch.split) : NO_SPLIT;
  if (split.sign) scratch.split = split.sign;
  const signed = mode === 'heat-difference' && split.mode === 0;
  const teamSign = buildGroupTable(ds, signed, positive, negative, visibility, filters, scratch.group);
  if (teamSign) scratch.group = teamSign;
  return { teamSign, split };
}

/**
 * The group table and the split's category table, packed for one upload.
 *
 * `width` entries each: groups first, categories after. Past the end of either
 * table the defaults differ on purpose. A group the table does not cover still
 * draws, while an unlisted category is rejected — it belongs to neither side, and
 * counting it as positive would add a population nobody selected. With no group
 * table every group draws; with no category table every category is rejected,
 * which only a category split reads.
 */
export function packSignTables(
  groups: Int8Array | null,
  categories: Int8Array | null,
  width: number,
  out?: Float32Array,
): Float32Array {
  const packed = out && out.length >= width * 2 ? out : new Float32Array(width * 2);
  for (let i = 0; i < width; i++) {
    packed[i] = groups && i < groups.length ? groups[i] : 1;
    packed[width + i] = categories && i < categories.length ? categories[i] : 0;
  }
  return packed;
}
