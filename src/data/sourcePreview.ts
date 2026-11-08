import { parquetMetadataAsync, type FileMetaData } from 'hyparquet';
import { parseHints, type MappingHints } from './automap';
import { previewCsv } from './csv';
import { msg, MsgError } from './msg';
import { asyncBufferFromFile, previewParquet } from './parquet';
import { isAcmiName } from './acmi';
import { previewAcmi } from './ingestAcmi';
import { isOcapName } from './ocap';
import { previewOcap } from './ingestOcap';
import { estimateRows } from './tableIngest';
import { geoFormatOf } from './geoTracks';
import { previewGeo } from './ingestGeo';

export type SourceFormat = 'csv' | 'parquet' | 'acmi' | 'ocap' | 'geo';

/** Format-independent description of a file, for the mapping UI and auto-mapper. */
export interface SourcePreview {
  format: SourceFormat;
  fileName: string;
  columns: string[];
  /** Sampled rows, stringified. */
  rows: string[][];
  numeric: boolean[];
  /** Exact for Parquet (from the footer), estimated for CSV. */
  rowCount: number;
  rowCountExact: boolean;
  fileBytes: number;
  /** Detected CSV separator. Meaningless for Parquet. */
  delimiter: string;
  /** Parquet logical type per column, so real timestamps can be recognised. */
  logicalTypes: Record<string, string>;
  /** The file's own reading instructions, from a Parquet footer's `heat3d` entry. */
  hints: MappingHints | null;
}

export function detectFormat(name: string): SourceFormat {
  if (isAcmiName(name)) return 'acmi';
  if (isOcapName(name)) return 'ocap';
  if (geoFormatOf(name)) return 'geo';
  return /\.parquet$|\.pq$/i.test(name) ? 'parquet' : 'csv';
}

export async function previewSource(file: File, delimiterOverride?: string): Promise<SourcePreview> {
  if (file.size === 0) throw new MsgError(msg('data.sourcePreview.empty', { file: file.name }));

  if (detectFormat(file.name) === 'parquet') {
    const p = await previewParquet(file);
    return {
      format: 'parquet',
      fileName: file.name,
      columns: p.columns,
      rows: p.rows,
      numeric: p.numeric,
      rowCount: p.numRows,
      rowCountExact: true,
      fileBytes: p.fileBytes,
      delimiter: ',',
      logicalTypes: logicalTypesOf(p.metadata),
      hints: parseHints(p.metadata.key_value_metadata?.find((kv) => kv.key === 'heat3d')?.value),
    };
  }

  if (detectFormat(file.name) === 'acmi') {
    // A Tacview recording: its table and its own reading instructions.
    const a = await previewAcmi(file);
    return {
      format: 'acmi',
      fileName: file.name,
      columns: a.columns,
      rows: a.rows,
      numeric: a.numeric,
      rowCount: a.rowCount,
      rowCountExact: true,
      fileBytes: file.size,
      delimiter: ',',
      logicalTypes: {},
      hints: a.hints,
    };
  }

  if (detectFormat(file.name) === 'geo') {
    // GPS tracks (GPX, KML/KMZ, NMEA, IGC, FIT): their table and their own reading instructions.
    const g = await previewGeo(file);
    return {
      format: 'geo',
      fileName: file.name,
      columns: g.columns,
      rows: g.rows,
      numeric: g.numeric,
      rowCount: g.rowCount,
      rowCountExact: true,
      fileBytes: file.size,
      delimiter: ',',
      logicalTypes: {},
      hints: g.hints,
    };
  }

  if (detectFormat(file.name) === 'ocap') {
    // An OCAP recording of an Arma 3 mission: its table and its own reading instructions.
    const o = await previewOcap(file);
    return {
      format: 'ocap',
      fileName: file.name,
      columns: o.columns,
      rows: o.rows,
      numeric: o.numeric,
      rowCount: o.rowCount,
      rowCountExact: true,
      fileBytes: file.size,
      delimiter: ',',
      logicalTypes: {},
      hints: o.hints,
    };
  }

  const c = await previewCsv(file);
  const delimiter = delimiterOverride ?? c.delimiter;
  // Re-split with the chosen separator if it differs from what was sniffed.
  const reparse = delimiter !== c.delimiter ? await previewCsv(file, undefined, delimiter) : c;
  return {
    format: 'csv',
    fileName: file.name,
    columns: reparse.columns,
    rows: reparse.rows,
    numeric: reparse.numeric,
    rowCount: reparse.estimatedRows,
    rowCountExact: false,
    fileBytes: reparse.fileBytes,
    delimiter,
    logicalTypes: {},
    hints: null,
  };
}

export interface SelectionSize {
  /** Total rows across the selection. */
  rows: number;
  /** True when every file reported an exact count (all Parquet). */
  exact: boolean;
  /** Files whose count could not be read, e.g. empty or corrupt. */
  unreadable: string[];
  bytes: number;
}

/**
 * Total row count for a whole selection.
 *
 * Parquet keeps the count in its footer, so this is exact and costs one small
 * range read per file rather than a scan — which is what makes it possible to
 * decide whether a 40GB selection fits in memory *before* reading any of it.
 * CSV has no such header, so those files fall back to an estimate from the
 * average line length and the selection is reported as approximate.
 */
export async function measureSelection(files: File[]): Promise<SelectionSize> {
  let rows = 0;
  let exact = true;
  const unreadable: string[] = [];
  let bytes = 0;

  for (const file of files) {
    bytes += file.size;
    if (file.size === 0) {
      unreadable.push(file.name);
      continue;
    }
    try {
      if (detectFormat(file.name) === 'parquet') {
        const metadata = await parquetMetadataAsync(asyncBufferFromFile(file));
        rows += Number(metadata.num_rows);
      } else if (detectFormat(file.name) === 'geo') {
        // A GPS fix is some 60-150 bytes of XML or text, a FIT record about 30.
        rows += estimateRows(file.size, /\.fit$/i.test(file.name) ? 30 : /\.kmz$/i.test(file.name) ? 10 : 80);
        exact = false;
      } else if (detectFormat(file.name) === 'acmi' || detectFormat(file.name) === 'ocap') {
        // Sized from the file, not parsed: a recording is parsed when it is
        // previewed and again when it loads, and a third full parse only to
        // count its rows would cost as much as the load. About 40 bytes a row
        // in both formats (a zipped or gzipped one holds ten times as many).
        const packed = /\.(zip\.acmi|gz)$/i.test(file.name) ? 4 : 40;
        rows += estimateRows(file.size, packed);
        exact = false;
      } else {
        const p = await previewCsv(file);
        rows += p.estimatedRows;
        exact = false;
      }
    } catch {
      unreadable.push(file.name);
    }
  }
  return { rows, exact, unreadable, bytes };
}

/**
 * Flatten the Parquet schema to `column -> logical type name`.
 *
 * Used to spot genuine TIMESTAMP columns, which decode to Date objects rather
 * than numbers and would otherwise be misread as a raw epoch in whatever unit
 * the user happened to pick.
 */
function logicalTypesOf(metadata: FileMetaData): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 1; i < metadata.schema.length; i++) {
    const el = metadata.schema[i];
    if (el.num_children) continue;
    const logical = el.logical_type as { type?: string } | undefined;
    const name = logical?.type ?? el.converted_type ?? el.type;
    if (name) out[el.name] = String(name);
  }
  return out;
}
