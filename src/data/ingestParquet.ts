import { parquetMetadataAsync } from 'hyparquet';
import type { BlockAttr, SourceBlock } from './builder';
import { Dictionary } from './growable';
import {
  assertAxes,
  buildLookFrom,
  isAbsoluteUnit,
  remapAxesInPlace,
  progress,
  timeFromIsoLabels,
  timeFromNumbers,
  type IngestProgress,
} from './ingest';
import { msg, MsgError } from './msg';
import { geoOfHints, parseHints } from './automap';
import { asyncBufferFromFile, readParquetColumns, type ColumnRequest } from './parquet';
import type { ColumnMapping, TimeUnit } from '../state/types';

/**
 * Parquet -> SourceBlock.
 *
 * Shares the axis remap, time scaling and look-direction reduction with the CSV
 * path; only column extraction differs. The row count is known from the footer,
 * so every destination array is allocated exactly once — no growable buffers and
 * no reallocation, unlike CSV where the count isn't known until the end.
 */
export async function ingestParquet(
  file: File,
  mapping: ColumnMapping,
  onProgress: (p: IngestProgress) => void,
  /**
   * Keep one row in `stride`. Decimation is how a dataset that exceeds the
   * memory budget still becomes viewable: heat is an average, so a uniform
   * subsample gives the same distribution with more noise.
   */
  stride = 1,
): Promise<SourceBlock> {
  assertAxes(mapping);

  const buf = asyncBufferFromFile(file);
  const metadata = await parquetMetadataAsync(buf);
  const n = Number(metadata.num_rows);
  if (n === 0) throw new MsgError(msg('data.ingestParquet.noRows', { file: file.name }));

  const available = new Set(columnNames(metadata));
  /** `role` names the mapping in the message: x, y, z, yaw, pitch, dirX, dirY, dirZ, time, person, team, session or filter. */
  const require = (name: string | null, role: string): string | null => {
    if (!name) return null;
    if (!available.has(name)) {
      throw new MsgError(msg('data.ingestParquet.noColumn', { file: file.name, column: name, role }));
    }
    return name;
  };

  const requests: ColumnRequest[] = [];
  const numeric = (name: string | null, role: string): Float32Array | null => {
    const col = require(name, role);
    if (!col) return null;
    const arr = new Float32Array(n);
    requests.push({ name: col, numbers: arr });
    return arr;
  };
  /**
   * The same, at double width, for the time column only.
   *
   * A Parquet TIMESTAMP decodes to epoch milliseconds, and epoch milliseconds do
   * not fit in a float32: at 1.77e12 the representable values are 131.072s
   * apart. Read into a Float32Array, one 615,367-row export came out with 406
   * distinct instants instead of thousands, nine tenths of each person's
   * consecutive samples reading as simultaneous, and a thirty-second window
   * holding no rows at all. `SourceBlock.time` was float64 for exactly this
   * reason; the narrowing was here, one step earlier.
   */
  const numeric64 = (name: string | null, role: string): Float64Array | null => {
    const col = require(name, role);
    if (!col) return null;
    const arr = new Float64Array(n);
    requests.push({ name: col, numbers: arr });
    return arr;
  };
  const dict = (name: string | null, role: string): { ids: Uint32Array; dict: Dictionary } | null => {
    const col = require(name, role);
    if (!col) return null;
    const d = new Dictionary();
    const ids = new Uint32Array(n);
    requests.push({ name: col, ids, intern: (s) => d.intern(s) });
    return { ids, dict: d };
  };

  // An unmapped axis becomes a constant-zero array, which draws the data as a
  // plane in the 3D scene — the normal case for a top-down map heatmap.
  const flat = () => new Float32Array(n);
  const rawX = numeric(mapping.x, 'x') ?? flat();
  const rawY = numeric(mapping.y, 'y') ?? flat();
  const rawZ = numeric(mapping.z, 'z') ?? flat();
  const yawRaw = mapping.lookMode === 'yawPitch' ? numeric(mapping.yaw, 'yaw') : null;
  const pitchRaw = mapping.lookMode === 'yawPitch' ? numeric(mapping.pitch, 'pitch') : null;
  const dirX = mapping.lookMode === 'vector' ? numeric(mapping.dirX, 'dirX') : null;
  const dirY = mapping.lookMode === 'vector' ? numeric(mapping.dirY, 'dirY') : null;
  const dirZ = mapping.lookMode === 'vector' ? numeric(mapping.dirZ, 'dirZ') : null;

  // A Parquet TIMESTAMP decodes to a Date, which `toNumber` turns into epoch
  // milliseconds — so the stored unit is irrelevant and any string-ish setting
  // would be wrong. Detect it from the schema instead of trusting the mapping.
  const timestamp = !!mapping.time && isTimestampColumn(metadata, mapping.time);
  // ISO-8601 held as text is parsed as text, the way the CSV reader does it: read
  // as a number, every value would come out NaN and every row land at time 0.
  const isoText =
    !!mapping.time && !timestamp && mapping.timeUnit === 'iso8601' && isTextColumn(metadata, mapping.time);
  const timeUnit: TimeUnit = mapping.time
    ? timestamp
      ? 'unix_milliseconds'
      : mapping.timeUnit === 'iso8601' && !isoText
        ? 'unix_milliseconds'
        : mapping.timeUnit
    : mapping.timeUnit;
  const timeRaw = isoText ? null : numeric64(mapping.time, 'time');
  const timeText = isoText ? dict(mapping.time, 'time') : null;

  const person = dict(mapping.personId, 'person');
  const team = dict(mapping.teamId, 'team');
  const session = dict(mapping.sessionId, 'session');

  const extras: Array<{ name: string; numbers?: Float32Array; d?: Dictionary; ids?: Uint32Array }> =
    [];
  for (const name of mapping.extra) {
    // Extra columns are optional by nature: when several files are loaded at
    // once, not all of them necessarily carry every filter column.
    if (!available.has(name)) continue;
    if (mapping.extraNumeric[name] ?? true) {
      extras.push({ name, numbers: numeric(name, 'filter')! });
    } else {
      const r = dict(name, 'filter')!;
      extras.push({ name, d: r.dict, ids: r.ids });
    }
  }

  const reading = msg('data.ingestParquet.reading', { file: file.name });
  onProgress(progress(reading, 0, 0));
  await readParquetColumns(buf, metadata, requests, n, (f) =>
    onProgress(progress(reading, f, Math.round(f * n))),
  );

  const { px, py, pz } = remapAxesInPlace({ x: rawX, y: rawY, z: rawZ }, mapping, n);
  const time = timeText
    ? timeFromIsoLabels(timeText.dict.labels, timeText.ids, n)
    : timeRaw
      ? timeFromNumbers(timeRaw, timeUnit, n)
      : null;
  const { yaw, pitch } = buildLookFrom(mapping, n, { yawRaw, pitchRaw, dirX, dirY, dirZ });

  // Nulls decode to NaN, so bad rows are found after the fact rather than during
  // the scan. Compacting them out matters: a NaN position quantises to the world
  // origin and shows up as a bright hotspot that looks like real data.
  const step = Math.max(1, Math.floor(stride));
  let kept = 0;
  const keepMask = new Uint8Array(n);
  for (let i = 0; i < n; i += step) {
    if (Number.isFinite(px[i]) && Number.isFinite(py[i]) && Number.isFinite(pz[i])) {
      keepMask[i] = 1;
      kept++;
    }
  }
  if (kept === 0) {
    throw new MsgError(msg('data.ingestParquet.noPositions', { file: file.name }));
  }

  const attrs: BlockAttr[] = extras.map((e) =>
    e.numbers
      ? { name: e.name, kind: 'number' as const, data: e.numbers }
      : {
          name: e.name,
          kind: 'category' as const,
          data: e.ids!,
          categories: e.d!.labels,
        },
  );

  const block: SourceBlock = {
    rows: n,
    px,
    py,
    pz,
    time,
    timeIsAbsolute: isAbsoluteUnit(timeUnit),
    yaw,
    pitch,
    personIds: person?.ids ?? null,
    personLabels: person?.dict.labels ?? [],
    teamIds: team?.ids ?? null,
    teamLabels: team?.dict.labels ?? [],
    sessionIds: session?.ids ?? null,
    sessionLabels: session?.dict.labels ?? [],
    attrs,
    rejected: n - kept,
  };
  // The file's place on the earth, when its hints give one and the mapping
  // took the columns it is for (see `geoOfHints`).
  const geo = geoOfHints(parseHints(metadata.key_value_metadata?.find((kv) => kv.key === 'heat3d')?.value), mapping);
  if (geo) block.geo = geo;

  return kept === n ? block : compact(block, keepMask, kept);
}

/** Drop masked-out rows from every array in a block. */
export function compact(block: SourceBlock, keep: Uint8Array, kept: number): SourceBlock {
  const n = block.rows;
  const idx = new Uint32Array(kept);
  let k = 0;
  for (let i = 0; i < n; i++) if (keep[i]) idx[k++] = i;

  const f32 = (a: Float32Array | null) => {
    if (!a) return null;
    const out = new Float32Array(kept);
    for (let i = 0; i < kept; i++) out[i] = a[idx[i]];
    return out;
  };
  const f64 = (a: Float64Array | null) => {
    if (!a) return null;
    const out = new Float64Array(kept);
    for (let i = 0; i < kept; i++) out[i] = a[idx[i]];
    return out;
  };
  const u32 = (a: Uint32Array | null) => {
    if (!a) return null;
    const out = new Uint32Array(kept);
    for (let i = 0; i < kept; i++) out[i] = a[idx[i]];
    return out;
  };

  return {
    ...block,
    rows: kept,
    px: f32(block.px)!,
    py: f32(block.py)!,
    pz: f32(block.pz)!,
    time: f64(block.time),
    yaw: f32(block.yaw),
    pitch: f32(block.pitch),
    personIds: u32(block.personIds),
    teamIds: u32(block.teamIds),
    sessionIds: u32(block.sessionIds),
    attrs: block.attrs.map((a) =>
      a.kind === 'number'
        ? { ...a, data: f32(a.data)! }
        : { ...a, data: u32(a.data)! },
    ),
  };
}

function columnNames(metadata: Awaited<ReturnType<typeof parquetMetadataAsync>>): string[] {
  const out: string[] = [];
  for (let i = 1; i < metadata.schema.length; i++) {
    const el = metadata.schema[i];
    if (!el.num_children) out.push(el.name);
  }
  return out;
}

/** Whether a column is stored as text (or raw bytes), rather than as a number. */
function isTextColumn(metadata: Awaited<ReturnType<typeof parquetMetadataAsync>>, column: string): boolean {
  for (let i = 1; i < metadata.schema.length; i++) {
    const el = metadata.schema[i];
    if (el.name !== column) continue;
    return el.type === 'BYTE_ARRAY' || el.type === 'FIXED_LEN_BYTE_ARRAY';
  }
  return false;
}

function isTimestampColumn(
  metadata: Awaited<ReturnType<typeof parquetMetadataAsync>>,
  column: string,
): boolean {
  for (let i = 1; i < metadata.schema.length; i++) {
    const el = metadata.schema[i];
    if (el.name !== column) continue;
    const logical = el.logical_type as { type?: string } | undefined;
    if (logical?.type && /TIMESTAMP|DATE/i.test(logical.type)) return true;
    if (el.converted_type && /TIMESTAMP|DATE/i.test(String(el.converted_type))) return true;
  }
  return false;
}
