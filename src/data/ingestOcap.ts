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

/**
 * The world of each recording previewed (the first of a pick), by its session
 * label: a large load may keep a column that is the same on every row (World,
 * Game) out of the dataset, and the level panel still has to know the world.
 */
export const previewedWorlds = new Map<string, { world: string; reforger: boolean }>();

/** The recording's table, parsed once per file. */
export function ocapTableOf(file: File): Promise<OcapTable> {
  let t = tables.get(file);
  if (!t) {
    t = ocapText(file)
      .then((text) => parseOcap(text, file.name.replace(/\.jsonl?(\.gz)?$/i, '')))
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
  const t = await ocapTableOf(file);
  // Not kept for the load: a long mission's table is a gigabyte, the load runs in a parser thread of its own, and a
  // picked file stays referenced for the whole session.
  tables.delete(file);
  const session = (t.data[t.columns.indexOf('Recording')] as string[] | undefined)?.[0];
  if (session) previewedWorlds.set(session, { world: t.world, reforger: t.reforger });
  return previewTable(t, ocapHints(t) as MappingHints);
}

/** A recording as a block, by the mapping the user confirmed (the recording's own, unless changed). */
export async function ingestOcap(file: File, mapping: ColumnMapping, onProgress: (p: IngestProgress) => void, stride = 1): Promise<SourceBlock> {
  onProgress(progress(msg('data.ingestParquet.reading', { file: file.name }), 0, 0));
  const t = await ocapTableOf(file);
  tables.delete(file);
  return tableToBlock(t, file, mapping, onProgress, stride);
}
