/**
 * The rows inside the volumes written out for other software: CSV or Parquet,
 * every column, in the data's own frame and column names (as the recording
 * export writes them, data/exportRecording.ts), plus which volume each row is
 * in. Streamed in slices with progress and cancel: straight to disk where the
 * browser can save a file as it is written, else into a download.
 *
 * And the statistics, as CSV or JSON.
 */

import { ParquetWriter, ByteWriter } from 'hyparquet-writer';
import type { Dataset } from '../state/types';
import { worldToData } from '../render/pose';
import { sourceSeconds } from '../data/reshape';
import type { Scope, StatsResult } from './stats';
import { FULL_SCOPE, prepareStats, shownRow, yieldToPage } from './stats';
import { compiled, compiledContains, selection, selectionHolds, type Volume } from './volume';

export type ExportFormat = 'csv' | 'parquet';

/** Rows per slice: a CSV slice or a Parquet row group. */
const SLICE_ROWS = 200_000;

/** Where bytes go: a file being written, or parts of a download. */
export interface Sink {
  write(chunk: Uint8Array | string): Promise<void>;
  close(): Promise<void>;
  abort(): Promise<void>;
}

/** Collects the bytes for a download (`blob()` once closed). */
export class BlobSink implements Sink {
  private parts: BlobPart[] = [];
  async write(chunk: Uint8Array | string): Promise<void> {
    this.parts.push(typeof chunk === 'string' ? chunk : chunk.slice());
  }
  async close(): Promise<void> {}
  async abort(): Promise<void> {
    this.parts = [];
  }
  blob(type: string): Blob {
    return new Blob(this.parts, { type });
  }
}

/** The matching rows, ascending: inside the volumes (as `test` says) and, with `scope`, shown. */
export async function selectRows(
  ds: Dataset,
  test: (x: number, y: number, z: number) => boolean,
  scope: Scope | null,
  opts: { signal?: AbortSignal; onProgress?: (f: number) => void } = {},
): Promise<Uint32Array> {
  const job = scope ? prepareStats(ds, [], scope, 0) : null;
  let out = new Uint32Array(1024);
  let n = 0;
  for (let lo = 0; lo < ds.count; lo += SLICE_ROWS * 5) {
    if (opts.signal?.aborted) throw new DOMException('aborted', 'AbortError');
    const hi = Math.min(ds.count, lo + SLICE_ROWS * 5);
    for (let i = lo; i < hi; i++) {
      const x = ds.px[i];
      const y = ds.py[i];
      const z = ds.pz[i];
      if (!Number.isFinite(x) || !test(x, y, z)) continue;
      if (job && !shownRow(job, i)) continue;
      if (n === out.length) {
        const g = new Uint32Array(out.length * 2);
        g.set(out);
        out = g;
      }
      out[n++] = i;
    }
    opts.onProgress?.(hi / Math.max(1, ds.count));
    await yieldToPage();
  }
  return out.slice(0, n);
}

/** The predicate for the rows to export: one volume, or the combination of the visible ones. */
export function exportTest(volumes: readonly Volume[], which: string | null): (x: number, y: number, z: number) => boolean {
  if (which) {
    const v = volumes.find((u) => u.id === which);
    if (!v) return () => false;
    const c = compiled(v);
    return (x, y, z) => compiledContains(c, x, y, z);
  }
  const sel = selection(volumes);
  if (sel.include.length === 0 && sel.exclude.length === 0) return () => false;
  return (x, y, z) => selectionHolds(sel, x, y, z);
}

interface OutColumn {
  name: string;
  kind: 'number' | 'string';
  value: (row: number) => number | string;
}

/** Every column of a row, in the data's own frame: time, position, look, track, team, session, the kept columns, the volume. */
export function exportColumns(ds: Dataset, volumes: readonly Volume[]): OutColumn[] {
  const rc = ds.roleColumns ?? {};
  const deg = 180 / Math.PI;
  const cols: OutColumn[] = [];
  if (ds.time) cols.push({ name: rc.time ?? 'time', kind: 'number', value: (r) => sourceSeconds(ds, ds.time![r]) });
  const pos = (r: number) => worldToData({ x: ds.px[r], y: ds.py[r], z: ds.pz[r] }, ds.axes);
  cols.push({ name: rc.x ?? 'x', kind: 'number', value: (r) => pos(r).x });
  cols.push({ name: rc.y ?? 'y', kind: 'number', value: (r) => pos(r).y });
  cols.push({ name: rc.z ?? 'z', kind: 'number', value: (r) => pos(r).z });
  if (ds.yaw) cols.push({ name: 'yaw_deg', kind: 'number', value: (r) => ds.yaw![r] * deg });
  if (ds.pitch) cols.push({ name: 'pitch_deg', kind: 'number', value: (r) => ds.pitch![r] * deg });
  if (ds.personId) cols.push({ name: rc.person ?? 'person', kind: 'string', value: (r) => ds.personLabels[ds.personId![r]] ?? '' });
  if (ds.teamId) cols.push({ name: rc.team ?? 'team', kind: 'string', value: (r) => ds.teamLabels[ds.teamId![r]] ?? '' });
  if (ds.sessionId) cols.push({ name: rc.session ?? 'session', kind: 'string', value: (r) => ds.sessionLabels[ds.sessionId![r]] ?? '' });
  const taken = new Set(cols.map((c) => c.name));
  for (const a of ds.attrs) {
    if (taken.has(a.name)) continue;
    taken.add(a.name);
    if (a.kind === 'category') cols.push({ name: a.name, kind: 'string', value: (r) => a.categories?.[(a.data as Uint32Array)[r]] ?? '' });
    else cols.push({ name: a.name, kind: 'number', value: (r) => (a.data as Float32Array)[r] });
  }
  // Which visible volumes hold the row, by name.
  const vis = volumes.filter((v) => v.visible).map((v) => ({ name: v.name, c: compiled(v) }));
  let volName = 'volume';
  while (taken.has(volName)) volName = `_${volName}`;
  cols.push({
    name: volName,
    kind: 'string',
    value: (r) =>
      vis
        .filter((v) => compiledContains(v.c, ds.px[r], ds.py[r], ds.pz[r]))
        .map((v) => v.name)
        .join(';'),
  });
  return cols;
}

function csvField(v: string | number): string {
  const s = typeof v === 'number' ? (Number.isFinite(v) ? String(Number(v.toPrecision(9))) : '') : v;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Write `rows` of `ds` to `sink` as CSV or Parquet. */
export async function writeRows(
  ds: Dataset,
  rows: Uint32Array,
  volumes: readonly Volume[],
  format: ExportFormat,
  sink: Sink,
  opts: { signal?: AbortSignal; onProgress?: (f: number) => void } = {},
): Promise<void> {
  const cols = exportColumns(ds, volumes);
  try {
    if (format === 'csv') {
      await sink.write(cols.map((c) => csvField(c.name)).join(',') + '\n');
      for (let lo = 0; lo < rows.length; lo += SLICE_ROWS) {
        if (opts.signal?.aborted) throw new DOMException('aborted', 'AbortError');
        const hi = Math.min(rows.length, lo + SLICE_ROWS);
        const lines: string[] = [];
        for (let k = lo; k < hi; k++) {
          const r = rows[k];
          lines.push(cols.map((c) => csvField(c.value(r))).join(','));
        }
        await sink.write(lines.join('\n') + '\n');
        opts.onProgress?.(hi / Math.max(1, rows.length));
        await yieldToPage();
      }
    } else {
      await writeParquet(cols, rows, sink, opts);
    }
    await sink.close();
  } catch (e) {
    await sink.abort();
    throw e;
  }
}

/** A writer for hyparquet-writer that hands its bytes to the sink after every row group. */
function sinkWriter(sink: Sink): ByteWriter {
  const w = new ByteWriter(1 << 20);
  const take = async () => {
    if (w.index > 0) {
      const bytes = new Uint8Array(w.buffer, 0, w.index).slice();
      w.index = 0;
      await sink.write(bytes);
    }
  };
  (w as unknown as { flush: () => Promise<void> }).flush = take;
  (w as unknown as { finish: () => Promise<void> }).finish = take;
  return w;
}

async function writeParquet(
  cols: OutColumn[],
  rows: Uint32Array,
  sink: Sink,
  opts: { signal?: AbortSignal; onProgress?: (f: number) => void },
): Promise<void> {
  const schema = [
    { name: 'root', num_children: cols.length },
    ...cols.map((c) =>
      c.kind === 'number'
        ? { name: c.name, type: 'DOUBLE' as const, repetition_type: 'REQUIRED' as const }
        : { name: c.name, type: 'BYTE_ARRAY' as const, converted_type: 'UTF8' as const, repetition_type: 'REQUIRED' as const },
    ),
  ];
  const writer = new ParquetWriter({ writer: sinkWriter(sink), schema, codec: 'SNAPPY' });
  for (let lo = 0; lo < rows.length || lo === 0; lo += SLICE_ROWS) {
    if (opts.signal?.aborted) throw new DOMException('aborted', 'AbortError');
    const hi = Math.min(rows.length, lo + SLICE_ROWS);
    const n = hi - lo;
    const columnData = cols.map((c) => {
      if (c.kind === 'number') {
        const data = new Float64Array(n);
        for (let k = 0; k < n; k++) {
          const v = c.value(rows[lo + k]) as number;
          data[k] = Number.isFinite(v) ? v : NaN;
        }
        return { name: c.name, data };
      }
      const data = new Array<string>(n);
      for (let k = 0; k < n; k++) data[k] = c.value(rows[lo + k]) as string;
      return { name: c.name, data };
    });
    if (n > 0) await writer.write({ columnData, rowGroupSize: SLICE_ROWS });
    opts.onProgress?.(hi / Math.max(1, rows.length));
    await yieldToPage();
    if (rows.length === 0) break;
  }
  await writer.finish();
}

/** The statistics as CSV: one line per volume and measure, then one per column value. */
export function statsCsv(r: StatsResult): string {
  const lines = ['volume,section,key,value,share,overall_share,lift'];
  const f = (v: unknown) => (typeof v === 'number' ? (Number.isFinite(v) ? String(Number(v.toPrecision(9))) : '') : csvField(String(v ?? '')));
  for (const v of r.volumes) {
    const base: [string, unknown][] = [
      ['rows_all', v.rowsAll],
      ['share_all', v.shareAll],
      ['rows_shown', v.rows],
      ['share_shown', v.shareShown],
      ['players', v.persons],
      ['teams', v.teams],
      ['matches', v.sessions],
      ['seconds_inside', v.dwell],
      ['entries', v.entries],
      ['exits', v.exits],
      ['peak_density', v.peakDensity],
      ['mean_density', v.meanDensity],
      ['cell_size', v.cellSize],
      ['volume', v.volume],
      ['footprint', v.footprint],
    ];
    for (const [k, val] of base) lines.push([csvField(v.name), 'summary', k, f(val), '', '', ''].join(','));
    for (const c of v.columns) {
      if (c.kind === 'category') {
        for (const t of c.top) lines.push([csvField(v.name), csvField(c.name), csvField(t.label), t.count, f(t.share), f(t.overall), f(t.lift)].join(','));
      } else {
        for (const k of ['min', 'max', 'mean', 'median', 'p5', 'p95', 'overallMean'] as const)
          lines.push([csvField(v.name), csvField(c.name), k, f(c[k]), '', '', ''].join(','));
      }
    }
  }
  return lines.join('\n') + '\n';
}

export function statsJson(r: StatsResult, volumes: readonly Volume[]): string {
  return JSON.stringify({ format: '3dheat-volume-stats', version: 1, volumes, stats: r }, null, 2);
}

/** A sink for saving `name`: a file written as it goes where the browser offers one, else a download when closed. */
export async function saveSink(name: string, type: string): Promise<Sink | null> {
  const picker = (window as unknown as { showSaveFilePicker?: (o: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker({ suggestedName: name });
      const w = await (handle as unknown as { createWritable: () => Promise<FileSystemWritableFileStream> }).createWritable();
      return {
        write: (c) => w.write(typeof c === 'string' ? c : (c as unknown as BufferSource)),
        close: () => w.close(),
        abort: () => w.abort(),
      };
    } catch (e) {
      if ((e as Error).name === 'AbortError') return null;
      // No picker after all (an iframe, a policy): fall back to a download.
    }
  }
  const blob = new BlobSink();
  return {
    write: (c) => blob.write(c),
    abort: () => blob.abort(),
    close: async () => downloadBlob(name, blob.blob(type)),
  };
}

export function downloadBlob(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export { FULL_SCOPE };
