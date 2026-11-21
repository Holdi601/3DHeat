/**
 * The viewer's file readers, with the native core doing the reading.
 *
 * Each format's reader here stays the web app's own (`ingestParquet`,
 * `ingestCsv`, `ingestAcmi`) and only hands the expensive part to the core: the
 * Parquet columns, the CSV scan, the ACMI parse. The core gives exactly what the
 * web app's own code would have (checked by parity tests), so the block a load
 * builds is the same either way. What the core does not do it says so
 * (`UNSUPPORTED`), and that file is read here as in a browser.
 */

import { create } from '@bufbuild/protobuf';
import type { ParseFileFn } from '../ingestFiles';
import { ingestParquet, type ParquetColumnReader } from '../ingestParquet';
import { ingestCsv, type CsvScanFn } from '../ingest';
import { ingestAcmi } from '../ingestAcmi';
import type { AcmiTable } from '../acmi';
import type { ColumnRequest } from '../parquet';
import type { RowFilterClause } from '../rowFilter';
import { detectFormat } from '../sourcePreview';
import { call, NativeError, view, type CoreEndpoint } from './core';
import type { NativeFileRef } from './files';
import {
  ColumnKind,
  FileRefSchema,
  RowFilterClauseSchema,
  type ColumnData,
  type FilterStats,
  type FileRef,
} from './gen/heat3d/v1/heat3d_pb';

/** A load the native core takes part in: where it answers, and each file's name there. */
export interface NativeLoad {
  core: CoreEndpoint;
  refs: Array<NativeFileRef | null>;
}

function fileRef(r: NativeFileRef): FileRef {
  return create(FileRefSchema, { source: { case: 'token', value: r.token }, member: r.member });
}

export function clauseOf(c: RowFilterClause) {
  return create(RowFilterClauseSchema, {
    column: c.column,
    test:
      c.kind === 'set'
        ? { case: 'set', value: { values: c.values } }
        : { case: 'range', value: { min: c.min ?? undefined, max: c.max ?? undefined } },
  });
}

function statsOf(s: FilterStats | undefined) {
  return s
    ? { rows: Number(s.rows), kept: Number(s.kept), rowsSkipped: Number(s.rowsSkipped), groups: Number(s.groups), groupsSkipped: Number(s.groupsSkipped) }
    : null;
}

export function parquetReader(url: CoreEndpoint, ref: NativeFileRef): ParquetColumnReader {
  const file = fileRef(ref);
  return {
    async count(clauses) {
      const r = await call(url, { case: 'readColumns', value: { file, columns: [], filter: clauses.map(clauseOf) } }, 'columns');
      const filtered = statsOf(r.body.filtered)!;
      return { count: Number(r.body.rows), filtered };
    },
    async read(requests: ColumnRequest[], clauses, keptRows, onProgress) {
      const columns = requests.map((q) => ({
        name: q.name,
        kind: q.numbers ? (q.numbers instanceof Float64Array ? ColumnKind.F64 : ColumnKind.F32) : ColumnKind.DICT,
      }));
      const r = await call(url, { case: 'readColumns', value: { file, columns, filter: clauses.map(clauseOf), keptRows } }, 'columns');
      r.body.columns.forEach((c, i) => fill(requests[i], c, r));
      onProgress(1);
      return {
        filtered: statsOf(r.body.filtered),
        keptRows: r.body.keptRows ? view(r, r.body.keptRows, Uint32Array).slice() : null,
      };
    },
  };
}

function fill(req: ColumnRequest, c: ColumnData, r: { frame: ArrayBuffer; payloadAt: number }): void {
  if (req.numbers) {
    req.numbers.set(req.numbers instanceof Float64Array ? view(r, c.values, Float64Array) : view(r, c.values, Float32Array));
    return;
  }
  if (!req.ids || !req.intern) return;
  // Labels come in order of first appearance, so interning them in order builds
  // the dictionary a row-by-row read would have.
  const remap = new Uint32Array(c.labels.length);
  c.labels.forEach((l, i) => (remap[i] = req.intern!(l)));
  const ids = view(r, c.values, Uint32Array);
  const out = req.ids;
  for (let i = 0; i < ids.length; i++) out[i] = remap[ids[i]];
}

export function csvScanner(url: CoreEndpoint, ref: NativeFileRef): CsvScanFn {
  const file = fileRef(ref);
  return async (plan) => {
    const r = await call(
      url,
      {
        case: 'scanCsv',
        value: {
          file,
          delimiter: plan.delimiter,
          numberColumns: plan.numberColumns,
          wideSlot: plan.wideSlot,
          textColumns: plan.textColumns,
          axisSlots: plan.axisSlots,
          numberTests: plan.numberTests.map((t) => ({ slot: t.slot, clause: clauseOf(t.clause) })),
          textTests: plan.textTests.map((t) => ({ slot: t.slot, clause: clauseOf(t.clause) })),
          stride: plan.stride,
        }
      },
      'csvColumns',
    );
    return {
      rows: Number(r.body.rows),
      rejected: Number(r.body.rejected),
      filtered: statsOf(r.body.filtered),
      numbers: r.body.numbers.map((c) => (c.kind === ColumnKind.F64 ? view(r, c.values, Float64Array) : view(r, c.values, Float32Array))),
      texts: r.body.texts.map((c) => ({ labels: c.labels, ids: view(r, c.values, Uint32Array) })),
    };
  };
}

export function acmiParser(url: CoreEndpoint, ref: NativeFileRef): () => Promise<AcmiTable> {
  return async () => {
    const r = await call(url, { case: 'readTable', value: { file: fileRef(ref) } }, 'table');
    const info = JSON.parse(r.body.infoJson) as Omit<AcmiTable, 'columns' | 'data' | 'numeric' | 'rows'>;
    const data = r.body.columns.map((c) => {
      if (c.kind === ColumnKind.F64) return view(r, c.values, Float64Array);
      const ids = view(r, c.values, Uint32Array);
      const out = new Array<string>(ids.length);
      for (let i = 0; i < ids.length; i++) out[i] = c.labels[ids[i]];
      return out;
    });
    return {
      ...info,
      columns: r.body.columns.map((c) => c.name),
      data,
      numeric: data.map((d) => d instanceof Float64Array),
      rows: Number(r.body.rows),
    };
  };
}

/** How many files of the last loads the core read, and how many fell back here. */
export const nativeStats = { native: 0, here: 0, reasons: [] as string[] };

/**
 * A file parser that has the core read each file it has a name for, and parses
 * the others with `here` - as it does any file the core turns down.
 */
export function nativeParseFile(load: NativeLoad, files: File[], here: ParseFileFn): ParseFileFn {
  return async (file, mapping, columns, stride, onProgress) => {
    const ref = load.refs[files.indexOf(file)] ?? null;
    if (!ref) {
      nativeStats.here++;
      return here(file, mapping, columns, stride, onProgress);
    }
    try {
      const format = detectFormat(file.name);
      const block =
        format === 'parquet'
          ? await ingestParquet(file, mapping, onProgress, stride, parquetReader(load.core, ref))
          : format === 'csv'
            ? await ingestCsv(file, mapping, columns, onProgress, stride, csvScanner(load.core, ref))
            : format === 'acmi'
              ? await ingestAcmi(file, mapping, onProgress, stride, acmiParser(load.core, ref))
              : null;
      if (block) {
        nativeStats.native++;
        return block;
      }
    } catch (err) {
      if (!(err instanceof NativeError)) throw err;
      // Said, not swallowed: the file is read here instead, and why is on record.
      nativeStats.reasons.push(`${file.name}: ${err.message}`);
      console.warn(`[3dheat native] ${file.name} read by the viewer: ${err.message}`);
    }
    nativeStats.here++;
    return here(file, mapping, columns, stride, onProgress);
  };
}
