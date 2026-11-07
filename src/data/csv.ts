/**
 * Byte-level CSV scanner.
 *
 * Written by hand rather than with a library because the extraction pattern here
 * is unusual: of thirty-odd columns we want six, and we want them as numbers in
 * typed arrays. A general parser has to materialise every field as a JavaScript
 * string first, and at a hundred million rows that allocation is the entire cost
 * of the operation. This walks the bytes and parses only the mapped columns,
 * creating strings solely for the id columns that need dictionary encoding.
 */

import { msg, MsgError } from './msg';

const LF = 10;
const CR = 13;
const QUOTE = 34;
const SPACE = 32;
const TAB = 9;

export const DELIMITERS = [',', ';', '\t', '|'] as const;

export interface CsvPreview {
  columns: string[];
  delimiter: string;
  /** First rows, as strings, for the mapping UI to show. */
  rows: string[][];
  fileBytes: number;
  /** Extrapolated from the average row length in the sampled prefix. */
  estimatedRows: number;
  /** Per column, a guess at whether it parses as a number. */
  numeric: boolean[];
}

/**
 * Delimiter detection by consistency, not frequency.
 *
 * Picking the most common character breaks on data where a text column contains
 * more semicolons than there are real commas. The delimiter that yields the same
 * field count on every sampled line is the delimiter.
 */
export function detectDelimiter(text: string): string {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0).slice(0, 20);
  if (lines.length === 0) return ',';
  let best = ',';
  let bestScore = -1;
  for (const d of DELIMITERS) {
    const counts = lines.map((l) => splitCsvLine(l, d).length);
    const first = counts[0];
    if (first < 2) continue;
    const consistent = counts.every((c) => c === first);
    // Prefer consistent splits, then the one producing more columns.
    const score = (consistent ? 1000 : 0) + first;
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

/** Split one already-decoded line, honouring RFC4180 double-quote escaping. */
export function splitCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  const n = line.length;
  let i = 0;
  // One iteration per field. A line always has at least one field, and a
  // trailing delimiter means the last field is empty — so the loop pushes after
  // consuming a field and only continues when it actually sees a delimiter.
  for (;;) {
    let field: string;
    if (i < n && line[i] === '"') {
      i++;
      let s = '';
      while (i < n) {
        if (line[i] === '"') {
          if (line[i + 1] === '"') {
            s += '"';
            i += 2;
          } else {
            i++;
            break;
          }
        } else {
          s += line[i++];
        }
      }
      field = s;
    } else {
      const next = line.indexOf(delimiter, i);
      if (next === -1) {
        field = line.slice(i);
        i = n;
      } else {
        field = line.slice(i, next);
        i = next;
      }
    }
    out.push(field.trim());
    if (i < n && line[i] === delimiter) {
      i++;
      continue;
    }
    return out;
  }
}

/** Read enough of the head of a file to describe its schema. */
export async function previewCsv(
  file: File,
  sampleBytes = 1 << 20,
  delimiterOverride?: string,
): Promise<CsvPreview> {
  const head = await file.slice(0, Math.min(sampleBytes, file.size)).text();
  // A chosen separator splits the sample; otherwise it is sniffed.
  const delimiter = delimiterOverride || detectDelimiter(head);
  const lines = head.split(/\r?\n/);
  // Drop a trailing partial line unless the whole file fitted in the sample.
  if (lines.length > 1 && file.size > sampleBytes) lines.pop();
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) {
    throw new MsgError(msg('data.csv.empty'));
  }

  const columns = splitCsvLine(nonEmpty[0], delimiter).map((c, i) => c || `column_${i}`);
  const rows = nonEmpty.slice(1, 51).map((l) => splitCsvLine(l, delimiter));

  const numeric = columns.map((_, ci) => {
    let seen = 0;
    let numbers = 0;
    for (const r of rows) {
      const v = r[ci];
      if (v === undefined || v === '') continue;
      seen++;
      if (Number.isFinite(Number(v))) numbers++;
    }
    return seen > 0 && numbers / seen > 0.9;
  });

  // Row count from the average line length in the sampled prefix. Only a
  // magnitude estimate — it drives buffer pre-sizing and a warning, nothing that
  // has to be exact.
  const sampledBytes = new TextEncoder().encode(head).length;
  const completeLines = Math.max(1, lines.length - 1);
  const avgRow = Math.max(1, sampledBytes / completeLines);
  const estimatedRows = Math.max(0, Math.round(file.size / avgRow) - 1);

  return { columns, delimiter, rows, fileBytes: file.size, estimatedRows, numeric };
}

/** What to do with one CSV column. */
export type FieldSink =
  | { kind: 'number'; index: number }
  | { kind: 'dict'; index: number }
  | { kind: 'timeString'; index: number };

export interface ScanHandlers {
  /** Numeric slot `index` receives `value` for the current row. */
  number(index: number, value: number): void;
  /** Dictionary slot `index` receives the raw field text. */
  text(index: number, value: string): void;
  /** Called after every complete data row. */
  endRow(): void;
}

/**
 * Streaming scanner. Feed it chunks; it holds partial rows across boundaries.
 *
 * `sinkOf` maps CSV column index to a sink, or null to skip the column
 * entirely — skipped columns cost only the scan for their delimiter.
 */
const MAX_FIELDS = 4096;

export class CsvScanner {
  private carry: Uint8Array = new Uint8Array(0);
  private readonly decoder = new TextDecoder('utf-8');
  private headerPending: boolean;

  /**
   * Field boundaries of the row currently being scanned.
   *
   * Fields are buffered rather than emitted as they are found, because a chunk
   * can end mid-row: in that case the partial row is carried and re-scanned from
   * its first byte, and anything already emitted would be emitted twice.
   */
  private readonly fStart = new Int32Array(MAX_FIELDS);
  private readonly fEnd = new Int32Array(MAX_FIELDS);
  private fCount = 0;
  private overflowed = false;

  /**
   * @param sinkOf One entry per CSV column. A column may have several sinks —
   *   the same source column can legitimately be mapped to more than one role
   *   (a timestamp that is also a filter, say), and dispatching to a list rather
   *   than a single sink is what stops the second mapping silently winning.
   */
  constructor(
    private readonly delimiterByte: number,
    private readonly sinkOf: Array<FieldSink[] | null>,
    private readonly handlers: ScanHandlers,
    hasHeader = true,
  ) {
    this.headerPending = hasHeader;
  }

  push(chunk: Uint8Array): void {
    const buf = this.carry.length ? concat(this.carry, chunk) : chunk;
    const rowEnd = this.scan(buf, false);
    this.carry = rowEnd < buf.length ? buf.slice(rowEnd) : new Uint8Array(0);
  }

  /** Flush a final row that ended without a trailing newline. */
  end(): void {
    if (this.carry.length === 0) return;
    const buf = this.carry;
    this.carry = new Uint8Array(0);
    this.scan(buf, true);
  }

  /**
   * Scan `buf`, returning the offset of the first byte of the trailing
   * incomplete row. With `final`, that trailing row is flushed instead.
   */
  private scan(buf: Uint8Array, final: boolean): number {
    const n = buf.length;
    let i = 0;
    let rowStart = 0;
    let fieldStart = 0;
    let inQuotes = false;
    this.resetRow();

    while (i < n) {
      const c = buf[i];
      if (inQuotes) {
        if (c === QUOTE) {
          if (i + 1 < n && buf[i + 1] === QUOTE) {
            i += 2;
            continue;
          }
          if (i + 1 === n && !final) break; // could be an escaped quote
          inQuotes = false;
        }
        i++;
        continue;
      }
      if (c === QUOTE) {
        inQuotes = true;
        i++;
        continue;
      }
      if (c === this.delimiterByte) {
        this.pushField(fieldStart, i);
        i++;
        fieldStart = i;
        continue;
      }
      if (c === LF || c === CR) {
        // A bare CR at the very end of a non-final chunk may be half of a CRLF.
        if (c === CR && i + 1 === n && !final) break;
        this.pushField(fieldStart, i);
        this.flushRow(buf);
        i += c === CR && i + 1 < n && buf[i + 1] === LF ? 2 : 1;
        rowStart = i;
        fieldStart = i;
        this.resetRow();
        continue;
      }
      i++;
    }

    if (final && (fieldStart < n || this.fCount > 0)) {
      this.pushField(fieldStart, n);
      this.flushRow(buf);
      return n;
    }
    return rowStart;
  }

  private resetRow(): void {
    this.fCount = 0;
    this.overflowed = false;
  }

  private pushField(start: number, end: number): void {
    if (this.fCount >= MAX_FIELDS) {
      this.overflowed = true;
      return;
    }
    this.fStart[this.fCount] = start;
    this.fEnd[this.fCount] = end;
    this.fCount++;
  }

  private flushRow(buf: Uint8Array): void {
    if (this.headerPending) {
      this.headerPending = false;
      return;
    }
    // A single empty field is a blank line, not a row.
    if (this.fCount === 1 && this.fEnd[0] === this.fStart[0]) return;
    if (this.overflowed) {
      throw new MsgError(msg('data.csv.tooManyFields', { max: { int: MAX_FIELDS } }));
    }

    const limit = Math.min(this.fCount, this.sinkOf.length);
    for (let f = 0; f < limit; f++) {
      const sinks = this.sinkOf[f];
      if (!sinks || sinks.length === 0) continue;
      let s = this.fStart[f];
      let e = this.fEnd[f];
      // Trim spaces, tabs and surrounding quotes without allocating.
      while (s < e && (buf[s] === SPACE || buf[s] === TAB)) s++;
      while (e > s && (buf[e - 1] === SPACE || buf[e - 1] === TAB)) e--;
      if (e - s >= 2 && buf[s] === QUOTE && buf[e - 1] === QUOTE) {
        s++;
        e--;
      }
      // Decode at most once per field, however many sinks want it.
      let asNumber = NaN;
      let numberDone = false;
      let asText: string | null = null;
      for (const sink of sinks) {
        if (sink.kind === 'number') {
          if (!numberDone) {
            asNumber = parseNumberBytes(buf, s, e);
            numberDone = true;
          }
          this.handlers.number(sink.index, asNumber);
        } else {
          if (asText === null) {
            asText = unescapeQuotes(this.decoder.decode(buf.subarray(s, e)));
          }
          this.handlers.text(sink.index, asText);
        }
      }
    }
    this.handlers.endRow();
  }
}

function unescapeQuotes(s: string): string {
  return s.includes('""') ? s.replace(/""/g, '"') : s;
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

/**
 * Parse a decimal number straight out of the byte range.
 *
 * `Number(string)` would need a string per field; this is the single hottest
 * loop in ingest, so it reads digits directly. Returns NaN for anything it
 * doesn't recognise, which callers treat as a missing value.
 */
export function parseNumberBytes(b: Uint8Array, start: number, end: number): number {
  let i = start;
  if (i >= end) return NaN;
  let sign = 1;
  if (b[i] === 43) i++;
  else if (b[i] === 45) {
    sign = -1;
    i++;
  }

  let mantissa = 0;
  let digits = 0;
  let exp = 0;
  let any = false;

  for (; i < end; i++) {
    const c = b[i];
    if (c >= 48 && c <= 57) {
      // Beyond 2^53 extra digits only shift the exponent; f32 output makes the
      // lost precision irrelevant.
      if (digits < 17) {
        mantissa = mantissa * 10 + (c - 48);
        digits++;
      } else {
        exp++;
      }
      any = true;
    } else break;
  }

  if (i < end && b[i] === 46) {
    i++;
    for (; i < end; i++) {
      const c = b[i];
      if (c >= 48 && c <= 57) {
        if (digits < 17) {
          mantissa = mantissa * 10 + (c - 48);
          digits++;
          exp--;
        }
        any = true;
      } else break;
    }
  }

  if (!any) return NaN;

  if (i < end && (b[i] === 101 || b[i] === 69)) {
    i++;
    let esign = 1;
    if (i < end && b[i] === 43) i++;
    else if (i < end && b[i] === 45) {
      esign = -1;
      i++;
    }
    let e = 0;
    let anyE = false;
    for (; i < end; i++) {
      const c = b[i];
      if (c >= 48 && c <= 57) {
        e = e * 10 + (c - 48);
        anyE = true;
      } else break;
    }
    if (anyE) exp += esign * e;
  }

  if (i !== end) {
    // Trailing junk (units, stray characters) — fall back to being strict.
    return NaN;
  }
  return sign * mantissa * Math.pow(10, exp);
}
