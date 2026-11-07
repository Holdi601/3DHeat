/**
 * A parsed in-memory table - columns of numbers or strings, as the ACMI and
 * OCAP readers make them - into the mapping step's preview and into a block,
 * by the mapping the user confirmed. Shared so that a fix to either path is
 * made once.
 */

import type { BlockAttr, SourceBlock } from './builder';
import { Dictionary } from './growable';
import { assertAxes, buildLookFrom, isAbsoluteUnit, progress, remapAxesInPlace, timeFromNumbers, type IngestProgress } from './ingest';
import { compact } from './ingestParquet';
import { msg, MsgError } from './msg';
import type { MappingHints } from './automap';
import type { ColumnMapping } from '../state/types';

export interface MemoryTable {
  columns: string[];
  /** Per column: numbers (NaN for absent) or strings. */
  data: (Float64Array | string[])[];
  numeric: boolean[];
  rows: number;
}

export interface TablePreview {
  columns: string[];
  rows: string[][];
  numeric: boolean[];
  rowCount: number;
  hints: MappingHints;
}

/** The first rows as text, the columns and the table's own reading instructions. */
export function previewTable(t: MemoryTable, hints: MappingHints): TablePreview {
  const rows: string[][] = [];
  for (let i = 0; i < Math.min(50, t.rows); i++) {
    rows.push(t.data.map((d) => (d instanceof Float64Array ? (Number.isFinite(d[i]) ? String(d[i]) : '') : d[i])));
  }
  return { columns: t.columns, rows, numeric: t.numeric, rowCount: t.rows, hints };
}

/**
 * The table as a block: the mapped columns turned into the renderer's arrays,
 * axes remapped, look angles built, rows without a position (or outside the
 * stride) dropped. `extra` is merged into the block before compaction - an
 * ACMI recording's geographic reference, say.
 */
export function tableToBlock(
  t: MemoryTable,
  file: File,
  mapping: ColumnMapping,
  onProgress: (p: IngestProgress) => void,
  stride = 1,
  extra: Partial<SourceBlock> = {},
): SourceBlock {
  assertAxes(mapping);
  const reading = msg('data.ingestParquet.reading', { file: file.name });
  const n = t.rows;
  if (n === 0) throw new MsgError(msg('data.ingestParquet.noRows', { file: file.name }));
  const col = (name: string | null, role: string): Float64Array | string[] | null => {
    if (!name) return null;
    const i = t.columns.indexOf(name);
    if (i < 0) throw new MsgError(msg('data.ingestParquet.noColumn', { file: file.name, column: name, role }));
    return t.data[i];
  };
  const f32 = (name: string | null, role: string): Float32Array | null => {
    const d = col(name, role);
    if (!d) return null;
    const out = new Float32Array(n);
    if (d instanceof Float64Array) out.set(d);
    else for (let i = 0; i < n; i++) out[i] = Number(d[i]);
    return out;
  };
  const dict = (name: string | null, role: string): { ids: Uint32Array; labels: string[] } | null => {
    const d = col(name, role);
    if (!d) return null;
    const dd = new Dictionary();
    const ids = new Uint32Array(n);
    for (let i = 0; i < n; i++) ids[i] = dd.intern(d instanceof Float64Array ? String(d[i]) : d[i]);
    return { ids, labels: dd.labels };
  };
  const flat = () => new Float32Array(n);
  const rawX = f32(mapping.x, 'x') ?? flat();
  const rawY = f32(mapping.y, 'y') ?? flat();
  const rawZ = f32(mapping.z, 'z') ?? flat();
  const yawRaw = mapping.lookMode === 'yawPitch' ? f32(mapping.yaw, 'yaw') : null;
  const pitchRaw = mapping.lookMode === 'yawPitch' ? f32(mapping.pitch, 'pitch') : null;
  const timeCol = col(mapping.time, 'time');
  const timeRaw = timeCol ? (timeCol instanceof Float64Array ? timeCol : Float64Array.from(timeCol, Number)) : null;
  const person = dict(mapping.personId, 'person');
  const team = dict(mapping.teamId, 'team');
  const session = dict(mapping.sessionId, 'session');
  const attrs: BlockAttr[] = [];
  for (const name of mapping.extra) {
    if (!t.columns.includes(name)) continue;
    if (mapping.extraNumeric[name] ?? t.numeric[t.columns.indexOf(name)]) attrs.push({ name, kind: 'number', data: f32(name, 'filter')! });
    else {
      const d = dict(name, 'filter')!;
      attrs.push({ name, kind: 'category', data: d.ids, categories: d.labels });
    }
  }
  const { px, py, pz } = remapAxesInPlace({ x: rawX, y: rawY, z: rawZ }, mapping, n);
  const time = timeRaw ? timeFromNumbers(timeRaw, mapping.timeUnit, n) : null;
  const { yaw, pitch } = buildLookFrom(mapping, n, { yawRaw, pitchRaw, dirX: null, dirY: null, dirZ: null });
  const step = Math.max(1, Math.floor(stride));
  const keep = new Uint8Array(n);
  let kept = 0;
  for (let i = 0; i < n; i += step) {
    if (Number.isFinite(px[i]) && Number.isFinite(py[i]) && Number.isFinite(pz[i])) {
      keep[i] = 1;
      kept++;
    }
  }
  if (kept === 0) throw new MsgError(msg('data.ingestParquet.noPositions', { file: file.name }));
  onProgress(progress(reading, 1, n));
  const block: SourceBlock = {
    rows: n,
    px,
    py,
    pz,
    time,
    timeIsAbsolute: isAbsoluteUnit(mapping.timeUnit),
    yaw,
    pitch,
    personIds: person?.ids ?? null,
    personLabels: person?.labels ?? [],
    teamIds: team?.ids ?? null,
    teamLabels: team?.labels ?? [],
    sessionIds: session?.ids ?? null,
    sessionLabels: session?.labels ?? [],
    attrs,
    rejected: n - kept,
    ...extra,
  };
  return kept === n ? block : compact(block, keep, kept);
}

/**
 * Rows a recording of `bytes` is likely to hold, for sizing a selection
 * without parsing it: a recording is parsed only when it is previewed or
 * loaded. About one row per `bytesPerRow` of file.
 */
export function estimateRows(bytes: number, bytesPerRow: number): number {
  return Math.max(1, Math.round(bytes / bytesPerRow));
}
