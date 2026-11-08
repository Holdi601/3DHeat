/**
 * GPS tracks (GPX, KML/KMZ, NMEA, IGC, FIT) into the viewer: the preview the
 * mapping step shows, with the tracks' own reading instructions, and the block
 * a load builds - placed on the earth as an ACMI recording is. The file is
 * read once (`geoTracks.ts`) and the table kept for both.
 */

import type { SourceBlock } from './builder';
import { geoHints, geoTable, readGeoTracks, type GeoTable } from './geoTracks';
import { progress, type IngestProgress } from './ingest';
import { msg, MsgError } from './msg';
import { previewTable, tableToBlock, type TablePreview } from './tableIngest';
import { geoOfHints, type MappingHints } from './automap';
import type { ColumnMapping } from '../state/types';

const tables = new WeakMap<Blob, Promise<GeoTable>>();

/** The file's table, read once per file. */
export function geoTableOf(file: File): Promise<GeoTable> {
  let t = tables.get(file);
  if (!t) {
    t = readGeoTracks(file, file.name).then((tracks) => {
      if (!tracks.some((tr) => tr.points.length)) throw new MsgError(msg('data.ingestParquet.noPositions', { file: file.name }));
      return geoTable(tracks, file.name.replace(/\.[^.]+$/, ''));
    });
    tables.set(file, t);
  }
  return t;
}

/** What the mapping step shows of the tracks: their columns, the first rows, and how to read them. */
export async function previewGeo(file: File): Promise<TablePreview> {
  const t = await geoTableOf(file);
  return previewTable(t, geoHints(t) as MappingHints);
}

/** The tracks as a block, by the mapping the user confirmed (their own, unless changed). */
export async function ingestGeo(file: File, mapping: ColumnMapping, onProgress: (p: IngestProgress) => void, stride = 1): Promise<SourceBlock> {
  onProgress(progress(msg('data.ingestParquet.reading', { file: file.name }), 0, 0));
  const t = await geoTableOf(file);
  const geo = geoOfHints(geoHints(t) as MappingHints, mapping);
  return tableToBlock(t, file, mapping, onProgress, stride, geo ? { geo } : {});
}
