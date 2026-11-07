/**
 * OCAP recordings of Arma 3 missions into the viewer: the preview the mapping
 * step shows, with the recording's own reading instructions, and the block a
 * load builds. The file is parsed once (`ocap.ts`) and the table kept for both.
 */

import type { SourceBlock } from './builder';
import { NotOcapError, ocapHints, ocapText, parseOcap, type OcapTable } from './ocap';
import { progress, type IngestProgress } from './ingest';
import { msg, MsgError } from './msg';
import { previewTable, tableToBlock, type TablePreview } from './tableIngest';
import type { MappingHints } from './automap';
import type { ColumnMapping } from '../state/types';

const tables = new WeakMap<Blob, Promise<OcapTable>>();

/** The recording's table, parsed once per file. */
export function ocapTableOf(file: File): Promise<OcapTable> {
  let t = tables.get(file);
  if (!t) {
    t = ocapText(file)
      .then((text) => parseOcap(text, file.name.replace(/\.json(\.gz)?$/i, '')))
      .catch((e: unknown) => {
        if (e instanceof NotOcapError) throw new MsgError(msg('data.ocap.notOcap', { file: file.name }));
        throw e;
      });
    tables.set(file, t);
  }
  return t;
}

/** What the mapping step shows of a recording: its columns, the first rows, and how to read it. */
export async function previewOcap(file: File): Promise<TablePreview> {
  return previewTable(await ocapTableOf(file), ocapHints() as MappingHints);
}

/** A recording as a block, by the mapping the user confirmed (the recording's own, unless changed). */
export async function ingestOcap(file: File, mapping: ColumnMapping, onProgress: (p: IngestProgress) => void, stride = 1): Promise<SourceBlock> {
  onProgress(progress(msg('data.ingestParquet.reading', { file: file.name }), 0, 0));
  return tableToBlock(await ocapTableOf(file), file, mapping, onProgress, stride);
}
