import { int, t } from '../i18n';
import { MAX_GROUPS } from '../render/types';
import type { AttributeColumn, ColumnMapping, Dataset, SplitRule, ViewMode } from '../state/types';
import { SOURCE_COLUMN } from './builder';
import type { SourcePreview } from './sourcePreview';

/**
 * What a dataset can actually support, given what was mapped.
 *
 * Derived rather than assumed, so the UI can disable a mode outright instead of
 * offering one that silently renders nothing. A viewer that shows an empty
 * screen because the timeline is driving an axis that does not exist is worse
 * than one that says so.
 */
export interface Capabilities {
  /** Two or more position axes mapped — the minimum to draw anything. */
  canRender: boolean;
  /** A time column exists, so playback and windowing are meaningful. */
  canTimeline: boolean;
  /** Per-row expiry is definable: needs both time and person. */
  canLifetime: boolean;
  /** A group column exists, so colour families and +/− split work. */
  canGroup: boolean;
  /**
   * At least two groups exist, so difference mode has two sides without a column
   * split. A column split can give it two sides on data without groups; see
   * `splitHasTwoSides`.
   */
  canDifference: boolean;
  /** A person column exists, so tracks can be interpolated. */
  canTracks: boolean;
  /** A look direction was mapped. */
  canLook: boolean;
  /** Axes that are flat: mapped as constant zero because no column was given. */
  flatAxes: Array<'x' | 'y' | 'z'>;
}

export interface Validation {
  /** Blocking problems. Loading is refused while any of these stand. */
  errors: string[];
  /** Things that will work but probably aren't what was intended. */
  warnings: string[];
  /** What the resulting dataset will and won't be able to do. */
  notes: string[];
  capabilities: Capabilities;
  ok: boolean;
}

/** Axes mapped to a real column, in source terms. */
function mappedAxes(m: ColumnMapping): Array<'x' | 'y' | 'z'> {
  const out: Array<'x' | 'y' | 'z'> = [];
  if (m.x) out.push('x');
  if (m.y) out.push('y');
  if (m.z) out.push('z');
  return out;
}

/**
 * Check a mapping before a load is attempted.
 *
 * The hard floor is two position axes. With two, the data draws as a plane
 * inside the 3D scene, which is a legitimate and common case — a top-down map
 * heatmap needs no height. With fewer than two there is no geometry to place at
 * all, so this is an error rather than a warning.
 */
export function validateMapping(m: ColumnMapping, preview: SourcePreview | null): Validation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  const axes = mappedAxes(m);
  const flatAxes = (['x', 'y', 'z'] as const).filter((a) => !m[a]);

  if (axes.length < 2) {
    errors.push(
      axes.length === 0
        ? t('data.validate.noAxes')
        : t('data.validate.oneAxis', { axis: axes[0].toUpperCase() }),
    );
  } else if (axes.length === 2) {
    notes.push(
      t('data.validate.plane', {
        plane: axes.map((a) => a.toUpperCase()).join(''),
        flat: flatAxes[0].toUpperCase(),
      }),
    );
  }

  // Duplicate axis mappings collapse the data onto a line or a point.
  const axisCols = axes.map((a) => m[a]);
  if (new Set(axisCols).size !== axisCols.length) {
    errors.push(t('data.validate.sameColumn'));
  }

  if (preview) {
    const known = new Set(preview.columns);
    // The role is a code the message picks its words by.
    for (const [role, col] of [
      ['x', m.x],
      ['y', m.y],
      ['z', m.z],
      ['time', m.time],
      ['person', m.personId],
      ['group', m.teamId],
      ['yaw', m.yaw],
      ['pitch', m.pitch],
    ] as const) {
      if (col && !known.has(col)) {
        errors.push(t('data.validate.notInFile', { column: col, role }));
      }
    }

    // A non-numeric position column parses to NaN for every row, which would
    // reject the entire file — better to say so before spending the load.
    for (const [axis, col] of [
      ['X', m.x],
      ['Y', m.y],
      ['Z', m.z],
    ] as const) {
      if (!col) continue;
      const i = preview.columns.indexOf(col);
      if (i >= 0 && !preview.numeric[i]) {
        errors.push(t('data.validate.notNumeric', { column: col, axis }));
      }
    }

    // A group column holding an id is the one mapping mistake that costs the
    // whole load: the dictionary grows to the size of the dataset and the
    // grouping is dropped at the end. Say so up front where the sample shows it.
    if (m.teamId) {
      const i = preview.columns.indexOf(m.teamId);
      if (i >= 0) {
        const seen = new Set<string>();
        for (const r of preview.rows) if (r[i]) seen.add(r[i]);
        if (seen.size > Math.max(48, preview.rows.length * 0.6)) {
          warnings.push(
            t('data.validate.groupLooksLikeId', {
              column: m.teamId,
              count: seen.size,
              rows: preview.rows.length,
              max: int(MAX_GROUPS),
            }),
          );
        }
      }
    }

    if (m.time) {
      const i = preview.columns.indexOf(m.time);
      const logical = preview.logicalTypes[m.time] ?? '';
      if (/^DATE$/i.test(logical)) {
        warnings.push(t('data.validate.dateColumn', { column: m.time }));
      } else if (i >= 0 && !preview.numeric[i] && m.timeUnit !== 'iso8601') {
        // An error, not a warning: read as a number, text is NaN on every row,
        // and every row would land at time 0 with nothing to say why.
        errors.push(t('data.validate.timeNotNumeric', { column: m.time }));
      } else if (i >= 0 && !preview.numeric[i] && m.timeUnit === 'iso8601') {
        // Text that is not a date either - the load would end on the first file.
        const sample = preview.rows.map((r) => r[i]).filter((v) => v);
        if (sample.length > 0 && !sample.some((v) => !Number.isNaN(Date.parse(v)))) {
          errors.push(t('data.ingest.noIsoTimes'));
        }
      }
    }
  }

  if (!m.time) {
    notes.push(t('data.validate.noTime'));
  }
  if (!m.personId) {
    notes.push(t('data.validate.noPerson'));
  } else if (!m.time) {
    notes.push(t('data.validate.lifetimeNeedsTime'));
  }
  if (!m.teamId) {
    notes.push(t('data.validate.noGroup'));
  }

  if (m.lookMode === 'yawPitch' && !m.yaw) {
    warnings.push(t('data.validate.noYaw'));
  }
  if (m.lookMode === 'vector' && !(m.dirX && m.dirY && m.dirZ)) {
    warnings.push(t('data.validate.noVector'));
  }

  if (m.axes.scale === 0) {
    errors.push(t('data.validate.zeroScale'));
  }

  const capabilities: Capabilities = {
    canRender: axes.length >= 2 && errors.length === 0,
    canTimeline: !!m.time,
    canLifetime: !!m.time && !!m.personId,
    canGroup: !!m.teamId,
    // Group count is unknown until the data is read; assume yes if a column exists.
    canDifference: !!m.teamId,
    canTracks: !!m.personId,
    canLook: m.lookMode !== 'none',
    flatAxes,
  };

  return { errors, warnings, notes, capabilities, ok: errors.length === 0 };
}

/** Capabilities of a dataset that has actually been loaded. */
export function datasetCapabilities(ds: Dataset | null): Capabilities {
  if (!ds) {
    return {
      canRender: false,
      canTimeline: false,
      canLifetime: false,
      canGroup: false,
      canDifference: false,
      canTracks: false,
      canLook: false,
      flatAxes: [],
    };
  }
  // A flat axis shows up as a zero-width span in the bounds.
  const flat: Array<'x' | 'y' | 'z'> = [];
  if (ds.bounds.maxX - ds.bounds.minX === 0) flat.push('x');
  if (ds.bounds.maxY - ds.bounds.minY === 0) flat.push('y');
  if (ds.bounds.maxZ - ds.bounds.minZ === 0) flat.push('z');

  return {
    canRender: ds.count > 0,
    canTimeline: !!ds.time && ds.timeRange[1] > ds.timeRange[0],
    canLifetime: !!ds.lifetime,
    canGroup: ds.teamLabels.length > 0,
    canDifference: ds.teamLabels.length >= 2,
    canTracks: !!ds.personId && ds.personLabels.length > 0,
    canLook: !!ds.yaw,
    flatAxes: flat,
  };
}

/**
 * Whether `rule` is a column split that gives difference mode two sides on `ds`.
 *
 * Groups are not a column split and answer false here: whether they have two
 * sides is `canDifference`. A category split needs a value of the column on each
 * side; a range split needs a numeric column with a span to divide. The same
 * conditions the engine resolves the rule by, so a split this accepts is the one
 * that draws.
 */
export function splitHasTwoSides(rule: SplitRule, ds: Dataset | null): boolean {
  if (!ds || rule.kind === 'teams') return false;
  const attr = ds.attrs.find((a) => a.name === rule.column);
  if (!attr) return false;
  if (rule.kind === 'categories') {
    const n = attr.kind === 'category' ? (attr.categories?.length ?? 0) : 0;
    const valid = (i: number) => i >= 0 && i < n;
    return rule.positive.some(valid) && rule.negative.some(valid);
  }
  return attr.kind === 'number' && attr.max > attr.min;
}

/** Rows per category id, cached per column: see `categoryRowCounts`. */
const CATEGORY_COUNTS = new WeakMap<ArrayLike<number>, Uint32Array>();

/**
 * How many rows carry each value of a category column, by category id.
 *
 * One pass over the column, cached against its data array, so the split panel
 * can show the size of each side and the default split can skip values no row
 * has. Null for a numeric column, or one passed without its rows.
 */
export function categoryRowCounts(attr: AttributeColumn): Uint32Array | null {
  if (attr.kind !== 'category' || !attr.categories || attr.data.length === 0) return null;
  const hit = CATEGORY_COUNTS.get(attr.data);
  if (hit && hit.length === attr.categories.length) return hit;
  const n = attr.categories.length;
  const counts = new Uint32Array(n);
  const data = attr.data;
  for (let i = 0; i < data.length; i++) {
    const c = Math.round(data[i]);
    if (c >= 0 && c < n) counts[c]++;
  }
  CATEGORY_COUNTS.set(attr.data, counts);
  return counts;
}

/**
 * The split a column starts with: its first value against its second, or a
 * numeric column halved at its midpoint.
 *
 * "First" and "second" among the values rows actually have. A dictionary-encoded
 * column keeps the empty string as its first entry whether or not any row is
 * empty, and a default putting that entry on one side left that side empty —
 * which, toggled by someone who assumed both sides started empty, cleared the
 * other one too.
 */
export function defaultSplitRule(attr: AttributeColumn): SplitRule {
  if (attr.kind === 'category') {
    const n = attr.categories?.length ?? 0;
    const counts = categoryRowCounts(attr);
    const used: number[] = [];
    for (let i = 0; i < n && used.length < 2; i++) if (!counts || counts[i] > 0) used.push(i);
    // First value against the second, which is the comparison anyone picking a
    // two-valued column — a source file, a win flag — almost certainly wants.
    return {
      kind: 'categories',
      column: attr.name,
      positive: used.length > 0 ? [used[0]] : [],
      negative: used.length > 1 ? [used[1]] : [],
    };
  }
  // Numeric: split at the midpoint, which at least divides the data in two.
  const mid = (attr.min + attr.max) / 2;
  return {
    kind: 'range',
    column: attr.name,
    positive: [attr.min, mid],
    negative: [mid, attr.max],
  };
}

/**
 * A column split for data whose groups cannot give difference mode two sides,
 * or null when no retained column can either.
 *
 * The file of origin first, because data loaded from several files without
 * groups is the "compare two loads" case; then the first category column with
 * two values; then the first numeric column with a span.
 */
export function defaultColumnSplit(ds: Dataset): SplitRule | null {
  const candidates = [
    ...ds.attrs.filter((a) => a.name === SOURCE_COLUMN),
    ...ds.attrs.filter((a) => a.kind === 'category'),
    ...ds.attrs.filter((a) => a.kind === 'number'),
  ];
  for (const attr of candidates) {
    const rule = defaultSplitRule(attr);
    if (splitHasTwoSides(rule, ds)) return rule;
  }
  return null;
}

/**
 * Why a view mode is unavailable, or null when it is fine.
 *
 * `columnSplit` is whether the configured difference split is a column split
 * with two sides (`splitHasTwoSides`), which makes difference mode available on
 * data with fewer than two groups.
 */
export function modeBlockedReason(mode: ViewMode, cap: Capabilities, columnSplit = false): string | null {
  if (!cap.canRender) return t('data.validate.blocked.noDataset');
  if (mode === 'heat-difference' && !cap.canDifference && !columnSplit) {
    return cap.canGroup ? t('data.validate.blocked.oneGroup') : t('data.validate.blocked.noGroup');
  }
  if (mode === 'heat-teams' && !cap.canGroup) {
    return t('data.validate.blocked.teams');
  }
  if (mode === 'team' && !cap.canTracks) {
    return t('data.validate.blocked.team');
  }
  if (mode === 'heat-lines' && !(cap.canTracks && cap.canTimeline)) {
    return t('data.validate.blocked.lines');
  }
  return null;
}
