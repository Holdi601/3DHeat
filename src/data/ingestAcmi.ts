/**
 * Tacview ACMI recordings into the viewer: the preview the mapping step shows,
 * with the recording's own reading instructions, and the block a load builds.
 * The file is parsed once (`acmi.ts`) and the table kept for both.
 */

import type { SourceBlock } from './builder';
import { acmiHints, acmiText, parseAcmi, type AcmiTable } from './acmi';
import { progress, type IngestProgress } from './ingest';
import { msg } from './msg';
import { previewTable, tableToBlock, type TablePreview } from './tableIngest';
import type { MappingHints } from './automap';
import type { ColumnMapping } from '../state/types';

const tables = new WeakMap<Blob, Promise<AcmiTable>>();

/** The recording's table, parsed once per file. */
export function acmiTableOf(file: File): Promise<AcmiTable> {
  let t = tables.get(file);
  if (!t) {
    t = acmiText(file).then((text) => parseAcmi(text, file.name.replace(/\.(zip|txt)?\.?acmi$/i, '')));
    tables.set(file, t);
  }
  return t;
}

/** What the mapping step shows of a recording: its columns, the first rows, and how to read it. */
export async function previewAcmi(file: File): Promise<TablePreview> {
  const t = await acmiTableOf(file);
  return previewTable(t, acmiHints(t) as MappingHints);
}

/** A recording as a block, by the mapping the user confirmed (the recording's own, unless changed). */
export async function ingestAcmi(file: File, mapping: ColumnMapping, onProgress: (p: IngestProgress) => void, stride = 1): Promise<SourceBlock> {
  onProgress(progress(msg('data.ingestParquet.reading', { file: file.name }), 0, 0));
  const t = await acmiTableOf(file);
  return tableToBlock(t, file, mapping, onProgress, stride, {
    // The recording's place on the earth, as long as the positions are the
    // projected ones: a load that maps the game's own U and V, or any other
    // column, onto the ground is in no frame a real-world backdrop knows.
    ...(mapping.x === 'X' && mapping.y === 'Y'
      ? { geo: { lat0: t.reference.lat, lon0: t.reference.lon, projection: 'tangent-plane' as const } }
      : {}),
  });
}
