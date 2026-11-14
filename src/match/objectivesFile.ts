/**
 * A battle's `<match>.objectives.parquet` read into its capture zones over
 * time: apart from the store, so that the objectives worker
 * (`state/objectivesWorker.ts`) can read one too.
 */

import { parquetMetadataAsync, parquetReadObjects, type Compressors } from 'hyparquet';
import { decompress as zstd } from 'fzstd';
import { asyncBufferFromFile } from '../data/parquet';
import { buildTimeline, type ObjectiveRow, type ObjectiveTimeline } from './objectives';

export const SIDECAR = /\.objectives\.(parquet|pq)$/i;

export function isObjectivesFile(name: string): boolean {
  return SIDECAR.test(name);
}

/** What the converter compresses its side tables with, besides what the reader knows. */
const COMPRESSORS: Compressors = {
  ZSTD: (input, outputLength) => zstd(input, new Uint8Array(outputLength)),
};

const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'bigint' ? Number(v) : NaN);

/** A battle's capture zones over time from its `<match>.objectives.parquet` (a few hundred rows). */
export async function readObjectivesFile(file: File): Promise<ObjectiveTimeline> {
  const buf = asyncBufferFromFile(file);
  const metadata = await parquetMetadataAsync(buf);
  const names = new Set(metadata.schema.map((s) => s.name));
  if (!names.has('zone') || !names.has('time')) throw new Error(`${file.name}: no zone or time column`);
  const columns = ['time', 'event', 'zone', 'owner', 'progress'].filter((c) => names.has(c));
  const read = (await parquetReadObjects({
    file: buf,
    metadata,
    columns,
    compressors: COMPRESSORS,
  })) as Record<string, unknown>[];
  const rows: ObjectiveRow[] = read.map((r) => ({
    time: num(r.time),
    event: typeof r.event === 'string' ? r.event : '',
    zone: typeof r.zone === 'string' ? r.zone : '',
    owner: num(r.owner),
    progress: num(r.progress),
  }));
  return buildTimeline(file.name.replace(SIDECAR, ''), rows);
}
