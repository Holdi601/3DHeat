import { parquetMetadataAsync, parquetRead } from 'hyparquet';
import type { FileMetaData } from 'hyparquet';
import { asyncBufferFromFile, displayValue, toNumber } from './parquet';
import { stringBytes } from './resident';
import type { ColumnMapping } from '../state/types';

/**
 * What each column of a source holds, enough to choose filters and to say what
 * keeping it costs — before the load.
 *
 * From Parquet the profile is the footer (types, row-group min/max, null counts
 * and encoded sizes, for every row of the file) plus a read of the first rows of
 * the first file (distinct values and their counts, string lengths). For text
 * files it is the preview's sample alone.
 */

export interface ColumnProfile {
  name: string;
  /** Stored as text rather than as numbers. */
  text: boolean;
  /** Numeric span over the whole file, from statistics where it has them. */
  min: number | null;
  max: number | null;
  /** Rows the file has, and the rows the values below were counted over. */
  rows: number;
  sampleRows: number;
  /** Distinct values in the sample; `capped` when there were more than were counted. */
  distinct: number;
  capped: boolean;
  /** Most frequent values first, as the preview writes them. */
  values: Array<{ value: string; count: number }>;
  /** Mean length of a text value in the sample, in characters. */
  avgLength: number;
  /** Values that look like JSON or other structured detail. */
  jsonLike: boolean;
  /** Bytes a row of this column takes in the file, uncompressed. */
  encodedBytesPerRow: number | null;
}

/** Distinct values worth listing for a filter. Past this a column is a range or an identifier. */
export const MAX_LISTED_VALUES = 256;
/** Numbers with at most this many distinct values also get a value list (a team 0/1, a won flag). */
const NUMERIC_LIST_MAX = 32;
/** Rows read for the sample: enough to see a sparse event type, quick enough to wait for. */
const SAMPLE_ROWS = 200_000;

/** Bits of the linear-counting sketch: accurate to a few percent up to about a million distinct values. */
const SKETCH_BITS = 1 << 20;

class Tally {
  readonly counts = new Map<string, number>();
  capped = false;
  chars = 0;
  texts = 0;
  json = 0;
  min = Number.POSITIVE_INFINITY;
  max = Number.NEGATIVE_INFINITY;
  /**
   * Distinct values past the listed ones are not kept, only hashed into a
   * bitmap (linear counting), so an identifier column of a million values is
   * measured in 128 KB rather than remembered.
   */
  private sketch: Uint32Array | null = null;
  constructor(private readonly cap: number) {}
  add(v: unknown): void {
    if (typeof v === 'number' || typeof v === 'bigint') {
      const x = Number(v);
      if (x < this.min) this.min = x;
      if (x > this.max) this.max = x;
    }
    const s = v === null || v === undefined ? '' : typeof v === 'string' ? v : displayValue(v);
    const sk = (this.sketch ??= new Uint32Array(SKETCH_BITS >>> 5));
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
    const bit = h & (SKETCH_BITS - 1);
    sk[bit >>> 5] |= 1 << (bit & 31);
    if (typeof v === 'string') {
      this.texts++;
      this.chars += v.length;
      const c = v.charCodeAt(0);
      if ((c === 123 || c === 91) && v.length > 2) this.json++; // { or [
    }
    const hit = this.counts.get(s);
    if (hit !== undefined) this.counts.set(s, hit + 1);
    else if (this.counts.size < this.cap) this.counts.set(s, 1);
    else this.capped = true;
  }
  /** Distinct values seen: exact below the cap, estimated from the sketch above it. */
  distinct(): number {
    if (!this.capped || !this.sketch) return this.counts.size;
    let zero = 0;
    for (const w of this.sketch) zero += 32 - popcount(w);
    const est = -SKETCH_BITS * Math.log(Math.max(1, zero) / SKETCH_BITS);
    return Math.max(this.counts.size, Math.round(est));
  }
}

function popcount(w: number): number {
  w -= (w >>> 1) & 0x55555555;
  w = (w & 0x33333333) + ((w >>> 2) & 0x33333333);
  return (((w + (w >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function finishProfile(
  name: string,
  text: boolean,
  tally: Tally,
  sampleRows: number,
  rows: number,
  min: number | null,
  max: number | null,
  encoded: number | null,
): ColumnProfile {
  const values = [...tally.counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
  const numericList = !text && !tally.capped && values.length <= NUMERIC_LIST_MAX;
  return {
    name,
    text,
    min,
    max,
    rows,
    sampleRows,
    distinct: tally.distinct(),
    capped: tally.capped,
    values: text || numericList ? values.slice(0, MAX_LISTED_VALUES) : [],
    avgLength: tally.texts ? tally.chars / tally.texts : 0,
    jsonLike: tally.texts > 0 && tally.json / tally.texts > 0.5,
    encodedBytesPerRow: encoded,
  };
}

function statsSpan(metadata: FileMetaData, column: string): { min: number | null; max: number | null; encoded: number | null } {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let bytes = 0;
  let found = false;
  for (const g of metadata.row_groups) {
    for (const c of g.columns) {
      const md = c.meta_data;
      if (!md || md.path_in_schema.length !== 1 || md.path_in_schema[0] !== column) continue;
      found = true;
      bytes += Number(md.total_uncompressed_size);
      const st = md.statistics;
      const lo = toNumber(st?.min_value ?? st?.min);
      const hi = toNumber(st?.max_value ?? st?.max);
      if (Number.isFinite(lo)) min = Math.min(min, lo);
      if (Number.isFinite(hi)) max = Math.max(max, hi);
    }
  }
  const rows = Math.max(1, Number(metadata.num_rows));
  return {
    // `|| 0`: a float column's statistics write zero as -0.
    min: Number.isFinite(min) ? min || 0 : null,
    max: Number.isFinite(max) ? max || 0 : null,
    encoded: found ? bytes / rows : null,
  };
}

/** Profile every top-level column of a Parquet file. Runs in the ingest worker. */
export async function profileParquet(file: File, sampleRows = SAMPLE_ROWS): Promise<ColumnProfile[]> {
  const buf = asyncBufferFromFile(file);
  const metadata = await parquetMetadataAsync(buf);
  const rows = Number(metadata.num_rows);
  const leaves: Array<{ name: string; text: boolean }> = [];
  for (let i = 1; i < metadata.schema.length; i++) {
    const el = metadata.schema[i];
    if (el.num_children) continue;
    leaves.push({ name: el.name, text: el.type === 'BYTE_ARRAY' || el.type === 'FIXED_LEN_BYTE_ARRAY' || el.type === 'BOOLEAN' });
  }
  const tallies = new Map(leaves.map((l) => [l.name, new Tally(l.text ? MAX_LISTED_VALUES * 4 : NUMERIC_LIST_MAX + 1)]));
  const end = Math.min(rows, sampleRows);
  if (end > 0 && leaves.length > 0) {
    await parquetRead({
      file: buf,
      metadata,
      columns: leaves.map((l) => l.name),
      rowEnd: end,
      onChunk: (chunk) => {
        const tally = tallies.get(chunk.columnName);
        if (!tally) return;
        const data = chunk.columnData as ArrayLike<unknown>;
        const count = Math.min(data.length, end - chunk.rowStart);
        for (let i = 0; i < count; i++) tally.add(data[i]);
      },
    });
  }
  return leaves.map((l) => {
    const span = statsSpan(metadata, l.name);
    const tally = tallies.get(l.name)!;
    // Statistics cover the whole file; without them the sample's own span stands in.
    const min = l.text ? null : (span.min ?? (Number.isFinite(tally.min) ? tally.min : null));
    const max = l.text ? null : (span.max ?? (Number.isFinite(tally.max) ? tally.max : null));
    return finishProfile(l.name, l.text, tally, end, rows, min, max, span.encoded);
  });
}

/** Profile from a text file's preview sample: the only rows there are without a full parse. */
export function profileSample(columns: string[], rows: string[][], numeric: boolean[], rowCount: number): ColumnProfile[] {
  return columns.map((name, ci) => {
    const text = !numeric[ci];
    const tally = new Tally(MAX_LISTED_VALUES * 4);
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const r of rows) {
      const v = r[ci] ?? '';
      tally.add(v);
      if (!text) {
        const x = Number(v);
        if (v !== '' && Number.isFinite(x)) {
          min = Math.min(min, x);
          max = Math.max(max, x);
        }
      }
    }
    // A text cell's characters stand in for its encoded size.
    const p = finishProfile(name, text, tally, rows.length, rowCount, Number.isFinite(min) ? min : null, Number.isFinite(max) ? max : null, null);
    // The sample's text counting saw every value as a string; numbers are not text.
    if (!text) {
      p.avgLength = 0;
      p.jsonLike = false;
    }
    return p;
  });
}

// ---------------------------------------------------------------- costs

/** Bytes a kept column costs per loaded row in its array: one f32 or one u32 id. */
const B_COLUMN = 4;

/** Distinct values to expect over `rows`, from what the sample saw. */
export function expectedDistinct(p: ColumnProfile, rows: number): number {
  if (p.sampleRows <= 0) return 0;
  // A column whose sample was mostly new values keeps finding new ones: an id,
  // a timestamp as text, a JSON blob per row.
  if (p.distinct > p.sampleRows * 0.5) {
    return Math.max(p.distinct, Math.round((p.distinct / p.sampleRows) * rows));
  }
  return p.distinct;
}

/**
 * Bytes keeping one column costs over `rows` loaded rows: its array plus, for
 * text held as a category, the table of distinct strings.
 *
 * That second part is what the per-row estimate never saw. A JSON detail column
 * with a different string in every row is a category with as many labels as
 * rows, and at two bytes a character it can outweigh every other column put
 * together.
 */
export function columnBytes(p: ColumnProfile, rows: number, asNumber: boolean): number {
  const arrays = rows * B_COLUMN;
  if (asNumber) return arrays;
  const distinct = Math.min(rows, expectedDistinct(p, rows));
  return arrays + distinct * (8 + stringBytes('x'.repeat(Math.round(p.avgLength || 4))));
}

/** Total label bytes the kept category columns add, for the fit check. */
export function labelBytes(profiles: readonly ColumnProfile[] | null, mapping: ColumnMapping, rows: number): number {
  if (!profiles) return 0;
  let b = 0;
  for (const name of mapping.extra) {
    if (mapping.extraNumeric[name] ?? true) continue;
    const p = profiles.find((x) => x.name === name);
    if (p) b += columnBytes(p, rows, false) - rows * B_COLUMN;
  }
  return b;
}

// ---------------------------------------------------------- suggestions

/**
 * How much a column is worth keeping, for the "make it fit" list.
 *
 *   0  core      — a role the viewer is built on: position, time, who, team, round
 *   1  keep      — what most analyses filter by: events, weapons, classes, outcome
 *   2  optional  — an ordinary measure or a short category
 *   3  drop first — identifiers, long or structured text, constants: costly or uninformative
 */
export type Importance = 0 | 1 | 2 | 3;

export type ImportanceReason = 'core' | 'useful' | 'measure' | 'category' | 'identifier' | 'long' | 'json' | 'constant';

const USEFUL = /^(event|events|type|kind|action|weapon|ammo|class|vehicle.?class|vehicle.?type|unit.?type|vehicle|role|side|faction|won|win|winner|outcome|result|round|map|level|mode|game.?mode|kill|death|damage|health|hp|alive|dead|state|stance|speed|altitude|alt)$/i;

export function importanceOf(p: ColumnProfile, mapping: ColumnMapping): { rank: Importance; reason: ImportanceReason } {
  const roles = [mapping.x, mapping.y, mapping.z, mapping.time, mapping.personId, mapping.teamId, mapping.sessionId, mapping.yaw, mapping.pitch, mapping.dirX, mapping.dirY, mapping.dirZ];
  if (roles.includes(p.name)) return { rank: 0, reason: 'core' };
  if (p.sampleRows > 0 && p.distinct <= 1 && !p.capped) return { rank: 3, reason: 'constant' };
  if (p.jsonLike) return { rank: 3, reason: 'json' };
  if (p.text && p.avgLength > 48) return { rank: 3, reason: 'long' };
  if (USEFUL.test(p.name.replace(/[\s-]/g, '_'))) return { rank: 1, reason: 'useful' };
  if (p.text && (p.capped || p.distinct > p.sampleRows * 0.5)) return { rank: 3, reason: 'identifier' };
  return p.text ? { rank: 2, reason: 'category' } : { rank: 2, reason: 'measure' };
}

export interface ColumnSuggestion {
  name: string;
  rank: Importance;
  reason: ImportanceReason;
  bytes: number;
  kept: boolean;
}

/**
 * Every column with its cost and rank, in the order to consider dropping them:
 * least important first, and within a rank the most expensive first.
 */
export function suggestColumns(profiles: readonly ColumnProfile[], mapping: ColumnMapping, rows: number): ColumnSuggestion[] {
  return profiles
    .map((p) => {
      const { rank, reason } = importanceOf(p, mapping);
      const asNumber = mapping.extraNumeric[p.name] ?? !p.text;
      return { name: p.name, rank, reason, bytes: columnBytes(p, rows, asNumber), kept: rank === 0 || mapping.extra.includes(p.name) };
    })
    .sort((a, b) => b.rank - a.rank || b.bytes - a.bytes || a.name.localeCompare(b.name));
}

/**
 * The kept columns to drop, in suggestion order, until `excess` bytes are freed.
 * Core columns are never offered; neither is rank 1 unless nothing else is left.
 */
export function dropToFit(suggestions: readonly ColumnSuggestion[], excess: number): string[] {
  const out: string[] = [];
  let freed = 0;
  for (const pass of [3, 2, 1] as const) {
    for (const s of suggestions) {
      if (freed >= excess) return out;
      if (!s.kept || s.rank !== pass) continue;
      out.push(s.name);
      freed += s.bytes;
    }
  }
  return out;
}

// ------------------------------------------------------------- memory

/**
 * A key for "this kind of source": the same exporter writes the same columns,
 * so the sorted column names name the game and the table without the file
 * having to say which game it came from.
 */
export function sourceKey(columns: readonly string[]): string {
  let h = 0x811c9dc5;
  for (const c of [...columns].sort()) {
    for (let i = 0; i < c.length; i++) h = Math.imul(h ^ c.charCodeAt(i), 0x01000193);
    h = Math.imul(h ^ 0x2c, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** What was chosen for a source last time: the kept columns and the row filter. */
export interface LoadChoice {
  extra: string[];
  extraNumeric: Record<string, boolean>;
  rowFilter: import('./rowFilter').RowFilterClause[];
}

const STORE_PREFIX = 'heat3d.loadChoice.';

export function rememberChoice(key: string, choice: LoadChoice): void {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(choice));
  } catch {
    /* storage off or full: the choice is simply not remembered */
  }
}

export function recallChoice(key: string, columns: readonly string[]): LoadChoice | null {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<LoadChoice>;
    const have = new Set(columns);
    return {
      extra: (Array.isArray(v.extra) ? v.extra : []).filter((c) => typeof c === 'string' && have.has(c)),
      extraNumeric: v.extraNumeric && typeof v.extraNumeric === 'object' ? v.extraNumeric : {},
      rowFilter: (Array.isArray(v.rowFilter) ? v.rowFilter : []).filter((c) => c && typeof c.column === 'string' && have.has(c.column)),
    };
  } catch {
    return null;
  }
}

export function forgetChoice(key: string): void {
  try {
    localStorage.removeItem(STORE_PREFIX + key);
  } catch {
    /* nothing to forget */
  }
}
