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

/**
 * Why a column split cannot be drawn: the column is not in the dataset, it is
 * not the kind the rule needs, or no value is on either side.
 */
export type SplitProblem = 'noColumn' | 'wrongKind' | 'noSides';

/** The difference split, resolved against the dataset. */
export interface SplitTable {
  mode: SplitMode;
  column: string | null;
  /** Mode 1: sign per category of `column`. */
  sign: Int8Array | null;
  positiveRange: [number, number];
  negativeRange: [number, number];
  /** Set when the rule cannot be drawn; the split then draws nothing. */
  problem: SplitProblem | null;
}

export const NO_SPLIT: SplitTable = {
  mode: 0,
  column: null,
  sign: null,
  positiveRange: [0, 0],
  negativeRange: [0, 0],
  problem: null,
};

/**
 * A column split that cannot be drawn: mode 1 over no column.
 *
 * Draws nothing - both renderers skip a column split whose column they cannot
 * read - and says why, so the panel can. It used to fall back to the group
 * split, and a group split drawn under a column the user had just chosen is
 * the one picture that looks like it worked: someone splitting kills by event
 * saw the teams again and could not tell why.
 */
function unusableSplit(problem: SplitProblem): SplitTable {
  return { ...NO_SPLIT, mode: 1, problem };
}

/**
 * The split rule as the shader needs it: a mode, the column whose per-row values
 * to read, and either a sign-per-category table or two ranges.
 *
 * A rule that cannot be drawn - its column gone, the wrong kind, neither side
 * chosen - draws nothing and carries the reason (`problem`), rather than
 * quietly drawing the group split instead.
 */
export function buildSplitTable(
  ds: Dataset | null,
  rule: SplitRule,
  reuse: Int8Array | null = null,
): SplitTable {
  if (!ds || rule.kind === 'teams') return NO_SPLIT;
  const attr = ds.attrs.find((a) => a.name === rule.column);
  if (!attr) return unusableSplit('noColumn');

  if (rule.kind === 'categories') {
    if (attr.kind !== 'category' || !attr.categories) return unusableSplit('wrongKind');
    const n = attr.categories.length;
    const sign = reuse && reuse.length === n ? reuse : new Int8Array(n);
    const pos = new Set(rule.positive);
    const neg = new Set(rule.negative);
    let any = false;
    for (let i = 0; i < n; i++) {
      sign[i] = pos.has(i) ? 1 : neg.has(i) ? -1 : 0;
      if (sign[i] !== 0) any = true;
    }
    // Neither side selected rejects every row. Said so, rather than drawn as the
    // group split: see `unusableSplit`.
    if (!any) return unusableSplit('noSides');
    return { mode: 1, column: rule.column, sign, positiveRange: [0, 0], negativeRange: [0, 0], problem: null };
  }

  if (attr.kind !== 'number') return unusableSplit('wrongKind');
  return {
    mode: 2,
    column: rule.column,
    sign: null,
    positiveRange: normaliseRange(rule.positive),
    negativeRange: normaliseRange(rule.negative),
    problem: null,
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

/** Rows on each side of the difference; see `splitSideCounts`. */
export interface SideCounts {
  positive: number;
  negative: number;
  /** False when only every so-many-th row was read and the totals scaled up. */
  exact: boolean;
}

/**
 * Rows on each side of the difference among rows `[rowLo, rowHi)`.
 *
 * By the rules the shader signs rows with - the filters, the group table, the
 * split - and not by the view: the distance cull and the slice follow the
 * camera, and a side's share of the data should not change because the camera
 * moved. Reads every row up to `maxRows`, then every so-many-th one and scales
 * up, which keeps a playing window's recount to a few milliseconds on any load.
 */
export function splitSideCounts(
  ds: Dataset,
  rowLo: number,
  rowHi: number,
  filters: ActiveFilter[],
  teamSign: Int8Array | null,
  split: SplitTable,
  maxRows = 4_000_000,
): SideCounts {
  const lo = Math.max(0, rowLo);
  const hi = Math.min(ds.count, rowHi);
  const span = hi - lo;
  if (span <= 0 || split.problem) return { positive: 0, negative: 0, exact: true };
  const stride = Math.max(1, Math.ceil(span / Math.max(1, maxRows)));
  const resolved = filters.map((f) => ({ f, data: filterColumnData(ds, f.column) }));
  // A slot whose column is gone passes nothing, in the shader as here.
  if (resolved.some((r) => !r.data)) return { positive: 0, negative: 0, exact: stride === 1 };
  const splitData = split.mode !== 0 && split.column ? filterColumnData(ds, split.column) : null;
  if (split.mode !== 0 && !splitData) return { positive: 0, negative: 0, exact: stride === 1 };
  const team = ds.teamId;
  let pos = 0;
  let neg = 0;
  rows: for (let i = lo; i < hi; i += stride) {
    if (!Number.isFinite(ds.px[i])) continue;
    for (const { f, data } of resolved) {
      const v = data![i];
      if (f.kind === 'range') {
        if (!(v >= f.min && v <= f.max)) continue rows;
      } else {
        const c = Math.trunc(v);
        if (!f.mask || c < 0 || c >= f.mask.length || f.mask[c] === 0) continue rows;
      }
    }
    const g = team ? team[i] : 0;
    const groupSign = teamSign && g < teamSign.length ? teamSign[g] : 1;
    let sign = groupSign;
    if (split.mode !== 0) {
      if (groupSign === 0) continue;
      const v = splitData![i];
      if (split.mode === 1) {
        const cat = Math.round(v);
        sign = split.sign && cat >= 0 && cat < split.sign.length ? split.sign[cat] : 0;
      } else {
        sign =
          v >= split.positiveRange[0] && v <= split.positiveRange[1]
            ? 1
            : v >= split.negativeRange[0] && v <= split.negativeRange[1]
              ? -1
              : 0;
      }
    }
    if (sign > 0) pos++;
    else if (sign < 0) neg++;
  }
  return { positive: pos * stride, negative: neg * stride, exact: stride === 1 };
}

/**
 * Per-side weights that compare shares rather than counts.
 *
 * Each side is scaled as if it held half of all the rows on either side, so a
 * side with five times the rows of the other no longer covers the picture by
 * sheer number: the colour then says where each side is *proportionally* more
 * common. The total weight is unchanged, so the exposure carries over. 1 and 1
 * when either side is empty, since there is then no comparison to normalise.
 */
export function sideScales(counts: { positive: number; negative: number }): [number, number] {
  const { positive, negative } = counts;
  if (!(positive > 0 && negative > 0)) return [1, 1];
  const half = (positive + negative) / 2;
  return [half / positive, half / negative];
}
