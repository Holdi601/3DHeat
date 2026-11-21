/**
 * Datasets built by the native core (Stage 2c, `docs/native-app.md`).
 *
 * In the app the core reads a Parquet selection and does everything the page's
 * own build does after reading (`ingestFiles`, `DatasetBuilder.finish`): the
 * merge, the time base, the sort, the extent, the roster, the sessions, the
 * lifetimes. The page then takes the finished columns and the engine the
 * finished GPU chunks, so nothing is built twice. This file holds the page's
 * side: whether a load may be built there, the request, and the dataset made of
 * the answer. `describeBuilt` writes a dataset down in the form the shared
 * vectors compare (`native/vectors/build`).
 */

import { create } from '@bufbuild/protobuf';
import type { ColumnMapping, Dataset, GeoReference, NativeChunk, NativeDatasetInfo } from '../../state/types';
import { emptyBounds } from '../../state/types';
import { feedsCanonical, isCanonical } from '../canonical';
import { parseValueColumn } from '../cost';
import { COST_ROLES } from '../costs/columns';
import { onDemandOf } from '../columnSource';
import { detectFormat } from '../sourcePreview';
import { geoOfHints, parseHints } from '../automap';
import { mergeGeo, SERIES_CAMPAIGN, SERIES_START } from '../builder';
import { activeClauses } from '../rowFilter';
import { msg, MsgError, say, sayDataset, type Msg } from '../msg';
import type { LoaderProgress } from '../loader';
import { call, NativeError, view, type CoreEndpoint } from './core';
import { clauseOf } from './readers';
import type { NativeFileRef } from './files';
import { prepareShared, releaseShared, sharedAvailable, takeShared } from './shared';
import { ChunkPart, DatasetMappingSchema, ErrorCode, type DatasetBuilt, type DatasetColumn } from './gen/heat3d/v1/heat3d_pb';

type Typed = Float32Array | Float64Array | Uint32Array | Uint16Array | Uint8Array;

function base64(a: Typed): string {
  const bytes = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** A typed array as its type and little-endian bytes, or null. */
function packed(a: Typed | null | undefined): { type: string; b64: string } | null {
  if (!a) return null;
  const type =
    a instanceof Float32Array ? 'f32' : a instanceof Float64Array ? 'f64' : a instanceof Uint32Array ? 'u32' : a instanceof Uint16Array ? 'u16' : 'u8';
  return { type, b64: base64(a) };
}

/** What the vectors compare of a built dataset: every column and every fact the build decides. */
export function describeBuilt(ds: Dataset, failedFiles: string[]) {
  return {
    count: ds.count,
    failed: failedFiles,
    px: packed(ds.px),
    py: packed(ds.py),
    pz: packed(ds.pz),
    time: packed(ds.time),
    epochMs: ds.epochMs,
    timeOrigin: ds.timeOrigin,
    timeRange: ds.timeRange,
    yaw: packed(ds.yaw),
    pitch: packed(ds.pitch),
    personId: packed(ds.personId),
    personLabels: ds.personLabels,
    teamId: packed(ds.teamId),
    teamLabels: ds.teamLabels,
    sessionId: packed(ds.sessionId),
    sessionLabels: ds.sessionLabels,
    sessionRows: packed(ds.sessionRows),
    sessionStart: packed(ds.sessionStart),
    sessionEnd: packed(ds.sessionEnd),
    personTeam: packed(ds.personTeam),
    personSlot: packed(ds.personSlot),
    teamSizes: packed(ds.teamSizes),
    lifetime: packed(ds.lifetime),
    maxLifetimeGap: ds.maxLifetimeGap,
    personShared: packed(ds.personShared),
    attrs: ds.attrs.map((a) => ({ name: a.name, kind: a.kind, min: a.min, max: a.max, categories: a.categories ?? null, data: packed(a.data as Typed) })),
    bounds: ds.bounds,
    recordingsAligned: ds.recordingsAligned ?? 0,
    series: ds.series ?? null,
    warnings: (ds.said?.warnings ?? []).map((w) => (typeof w === 'string' ? w : { key: w.key, values: w.values ?? {} })),
    notes: (ds.said?.notes ?? []).map((w) => (typeof w === 'string' ? w : { key: w.key, values: w.values ?? {} })),
  };
}

// ---------------------------------------------------------------- the load

/**
 * The most rows the page keeps of a load the core built. Past it the page's
 * copy is every k-th row - for tracks, replay, picking and the analyses - while
 * the GPU chunks hold every row. 200 million rows are about 6 GB of columns,
 * well inside what a page can hold, and each column stays under the 2 GiB a
 * single buffer may have.
 */
export const NATIVE_PAGE_ROWS = 200_000_000;

/** Columns whose names the web build derives columns from (`canonical.ts`, `cost.ts`): such a load is built in the page. */
const DERIVES = [
  /^(ai|is.?ai|bot|is.?bot|actor|is.?player|human|user.?id|steam.?id|pilot|group|name|pawn|entity)$/i,
  /^(other.?vehicle|target.?vehicle|victim.?vehicle|other.?name|other.?type|target.?type|victim.?type|other.?kind)$/i,
  /^(cost|earn|net)_/i,
  ...Object.values(COST_ROLES),
];

function derivesColumns(name: string): boolean {
  const n = name.trim();
  if (n === SERIES_CAMPAIGN || n === SERIES_START) return false;
  return isCanonical(n) || feedsCanonical(n) || !!parseValueColumn(n) || DERIVES.some((re) => re.test(n));
}

/**
 * Why the core does not build this load, or null when it does. The core builds
 * a selection of Parquet tables named to it; what the page's build adds on top
 * (the canonical columns, the value columns) is decided from column names, so a
 * load whose columns could feed them is built in the page, as it always was.
 */
export function nativeBuildRefusal(files: File[], refs: Array<NativeFileRef | null>, mapping: ColumnMapping): string | null {
  if (files.length === 0) return 'no files';
  if (refs.some((r) => !r)) return 'a file the core cannot open';
  if (files.some((f) => detectFormat(f.name) !== 'parquet')) return 'not all Parquet';
  if (mapping.time && mapping.timeUnit === 'iso8601') return 'ISO-8601 times';
  const cols = [...mapping.extra, ...onDemandOf(mapping)];
  const fed = cols.find(derivesColumns);
  return fed ? `column "${fed}" feeds derived columns` : null;
}

type Ctor = Float32ArrayConstructor | Uint32ArrayConstructor | Uint16ArrayConstructor | Uint8ArrayConstructor;
const CTORS: Record<string, Ctor> = { f32: Float32Array, u32: Uint32Array, u16: Uint16Array, u8: Uint8Array };

/** One column of a reply: from shared memory, or a view over the frame it came in. */
async function columnOf(c: DatasetColumn, frame: { frame: ArrayBuffer; payloadAt: number }): Promise<Typed> {
  const C = CTORS[c.element] ?? Float32Array;
  if (c.sharedId) {
    const buf = await takeShared(Number(c.sharedId));
    // A shared buffer is at least 8 bytes: the column is its first `count` elements.
    return new C(buf, 0, Number(c.count));
  }
  return view(frame, c.values, C as unknown as Float32ArrayConstructor) as unknown as Typed;
}

/** Columns of a built dataset (the page's copy), shared when the window can take them. */
export async function readColumns(core: CoreEndpoint, handle: bigint, names: string[]): Promise<Map<string, { data: Typed; info: DatasetColumn }>> {
  const out = new Map<string, { data: Typed; info: DatasetColumn }>();
  if (sharedAvailable()) {
    prepareShared();
    const r = await call(core, { case: 'readDatasetColumns', value: { handle, names, shared: true } }, 'datasetColumns');
    const got = await Promise.all(r.body.columns.map((c) => columnOf(c, r)));
    r.body.columns.forEach((c, i) => out.set(c.name, { data: got[i], info: c }));
    return out;
  }
  // One column a request: each frame is then one column's buffer, viewed in place.
  for (const name of names) {
    const r = await call(core, { case: 'readDatasetColumns', value: { handle, names: [name] } }, 'datasetColumns');
    for (const c of r.body.columns) out.set(c.name, { data: await columnOf(c, r), info: c });
  }
  return out;
}

/** One chunk part, packed by the core, and how to give its bytes back once they are on the GPU. */
export async function readChunk(core: CoreEndpoint, info: NativeDatasetInfo, index: number, part: 'positions' | 'times'): Promise<{ words: Uint32Array; done: () => void }> {
  const shared = info.shared && sharedAvailable();
  const r = await call(
    core,
    { case: 'readChunk', value: { handle: BigInt(info.handle), index, part: part === 'positions' ? ChunkPart.POSITIONS : ChunkPart.TIMES, shared } },
    'chunkData',
  );
  if (r.body.sharedId) {
    const buf = await takeShared(Number(r.body.sharedId));
    return { words: new Uint32Array(buf), done: () => releaseShared(buf) };
  }
  return { words: view(r, r.body.data, Uint32Array), done: () => {} };
}

/** One chunk's rows of a column, as the GPU's filter columns take them; null when there is no such column. */
export async function readChunkColumn(core: CoreEndpoint, info: NativeDatasetInfo, index: number, column: string): Promise<{ values: Float32Array; done: () => void } | null> {
  const shared = info.shared && sharedAvailable();
  const r = await call(core, { case: 'readDatasetColumns', value: { handle: BigInt(info.handle), names: [column], byChunk: true, chunk: index, shared } }, 'datasetColumns');
  const c = r.body.columns[0];
  if (!c) return null;
  if (c.sharedId) {
    const buf = await takeShared(Number(c.sharedId));
    return { values: new Float32Array(buf, 0, Number(c.count)), done: () => releaseShared(buf) };
  }
  return { values: view(r, c.values, Float32Array), done: () => {} };
}

/** A column the core read from the files when asked: the page's rows of it, as an attribute. */
export async function readOnDemand(core: CoreEndpoint, handle: number, name: string): Promise<Dataset['attrs'][number] | null> {
  const got = (await readColumns(core, BigInt(handle), [name])).get(name);
  if (!got) return null;
  const i = got.info;
  return i.numeric
    ? { name, kind: 'number', data: got.data as Float32Array, min: i.min, max: i.max }
    : { name, kind: 'category', data: got.data as Uint32Array, min: i.min, max: i.max, categories: i.categories };
}

/** Gives the core's copy back. */
export function closeNative(core: CoreEndpoint, handle: number): void {
  void call(core, { case: 'closeDataset', value: { handle: BigInt(handle) } }, 'closed').catch(() => {});
}

function failureMsg(f: DatasetBuilt['files'][number], file: string): Msg | string {
  if (f.failureKey) return msg(f.failureKey, { file, ...f.failureParams });
  return f.failureText || 'unreadable';
}

export interface NativeBuildOptions {
  core: CoreEndpoint;
  files: File[];
  refs: NativeFileRef[];
  mapping: ColumnMapping;
  name: string;
  stride: number;
  expectedRows: number;
  onProgress?: (p: LoaderProgress) => void;
  /** The most rows the page keeps (`NATIVE_PAGE_ROWS`). */
  pageRows?: number;
}

/** Timings of the last native build, for the app's probes. */
export const nativeBuildStats: { last: Record<string, number> | null } = { last: null };

const ROLES_PER_ROW = ['@px', '@py', '@pz', '@time', '@lifetime', '@yaw', '@pitch', '@person', '@team', '@session'];

/**
 * A Parquet selection built by the core into the dataset the page's own build
 * would make (`ingestFiles`), the columns taken over without a copy where the
 * window allows. Throws `NativeError` UNSUPPORTED when the core turns the load
 * down; the caller then builds it in the page.
 */
export async function nativeBuild(o: NativeBuildOptions): Promise<Dataset> {
  const t0 = performance.now();
  const { core, files, mapping } = o;
  const report = (m: Msg, fraction: number | null, rows = 0) => o.onProgress?.({ label: say(m), fraction, rows });
  const later = onDemandOf(mapping);
  const extraNumeric = (c: string) => mapping.extraNumeric[c] ?? true;
  const token = `b${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const reading = msg('data.native.reading', { count: files.length });
  report(reading, null);
  const phases: Record<string, Msg> = {
    count: reading,
    read: reading,
    time: msg('data.builder.phase.sort'),
    sort: msg('data.builder.phase.sort'),
    extent: msg('data.builder.phase.extent'),
    roster: msg('data.builder.phase.roster'),
    sessions: msg('data.builder.phase.sessions'),
    lifetimes: msg('data.builder.phase.lifetimes'),
    chunks: msg('data.native.packing'),
  };
  const poll = setInterval(() => {
    void call(core, { case: 'buildProgress', value: { token } }, 'buildProgressReply')
      .then((r) => {
        const m = phases[r.body.phase];
        if (m) report(m, r.body.phase === 'read' ? r.body.fraction : null);
      })
      .catch(() => {});
  }, 250);
  let built: DatasetBuilt;
  try {
    const axes = mapping.axes;
    const r = await call(
      core,
      {
        case: 'buildDataset',
        value: {
          files: o.refs.map((ref) => ({ source: { case: 'token' as const, value: ref.token }, member: ref.member })),
          names: files.map((f) => f.name),
          mapping: create(DatasetMappingSchema, {
            x: mapping.x ?? '',
            y: mapping.y ?? '',
            z: mapping.z ?? '',
            time: mapping.time ?? '',
            timeUnit: mapping.timeUnit,
            lookMode: mapping.lookMode,
            yaw: mapping.yaw ?? '',
            pitch: mapping.pitch ?? '',
            dirX: mapping.dirX ?? '',
            dirY: mapping.dirY ?? '',
            dirZ: mapping.dirZ ?? '',
            degrees: mapping.angleUnit === 'degrees',
            person: mapping.personId ?? '',
            team: mapping.teamId ?? '',
            session: mapping.sessionId ?? '',
            extra: mapping.extra.map((name) => ({ name, numeric: extraNumeric(name) })),
            onDemand: later.map((name) => ({ name, numeric: extraNumeric(name) })),
            upZ: axes.up === 'z',
            flipX: axes.flipX,
            flipY: axes.flipY,
            flipZ: axes.flipZ,
            scale: axes.scale || 1,
          }),
          filter: activeClauses(mapping.rowFilter).map(clauseOf),
          stride: Math.max(1, Math.floor(o.stride)),
          pageRows: BigInt(o.pageRows ?? NATIVE_PAGE_ROWS),
          progressToken: token,
        },
      },
      'datasetBuilt',
    );
    built = r.body;
  } finally {
    clearInterval(poll);
  }
  const t1 = performance.now();
  const n = Number(built.rows);
  const failures = built.files.flatMap((f, i) => (f.failureKey || f.failureText ? [{ file: files[i].name, why: failureMsg(f, files[i].name) }] : []));
  if (n === 0) {
    if (files.length === 1 && failures.length) {
      const why = failures[0].why;
      throw typeof why === 'string' ? new Error(why) : new MsgError(why);
    }
    const detail = failures.map((f) => msg('data.ingestFiles.fileFailed', { file: f.file, reason: f.why }));
    throw new MsgError(detail.length ? msg('data.ingestFiles.noRowsBecause', { files: { each: detail, between: '\n' } }) : msg('data.ingestFiles.noRows'));
  }

  report(msg('data.native.taking'), null, n);
  const cols = await readColumns(core, built.handle, built.columns);
  const t2 = performance.now();
  const col = <T extends Typed>(k: string) => (cols.get(k)?.data as T | undefined) ?? null;
  const pageRows = Number(built.pageRows);
  const step = built.pageStep || 1;
  for (const k of ROLES_PER_ROW) {
    const c = col(k);
    if (c && c.length !== pageRows) throw new NativeError(ErrorCode.INTERNAL, `${k}: ${c.length} rows, not ${pageRows}`);
  }

  const attrs: Dataset['attrs'] = built.attrs.map((a) => ({
    name: a.name,
    kind: a.numeric ? ('number' as const) : ('category' as const),
    data: col<Float32Array | Uint32Array>(a.name)!,
    min: a.min,
    max: a.max,
    ...(a.numeric ? {} : { categories: a.categories }),
  }));
  const time = col<Float32Array>('@time');
  const epochMs = built.epochMs ?? null;
  const aligned = Number(built.aligned);
  const series = built.seriesJson ? (JSON.parse(built.seriesJson) as Dataset['series']) : undefined;

  // The files' place on the earth and their time label, merged as the page's build merges them.
  let geo: GeoReference | null | undefined = undefined;
  let timeLabel: string | null | undefined = undefined;
  for (const f of built.files) {
    if (Number(f.rows) === 0) continue;
    const hints = parseHints(f.hintsJson || undefined);
    geo = mergeGeo(geo, geoOfHints(hints, mapping));
    const tl = hints?.columns?.timeLabel;
    const own = typeof tl === 'string' && tl.trim() && mapping.time && mapping.time === hints?.columns?.time && !f.timeAbsolute ? tl.trim().slice(0, 60) : null;
    timeLabel = timeLabel === undefined ? own : timeLabel === own ? timeLabel : null;
  }

  const b = built.bounds;
  const bounds = emptyBounds();
  if (b.length === 6) Object.assign(bounds, { minX: b[0], minY: b[1], minZ: b[2], maxX: b[3], maxY: b[4], maxZ: b[5] });
  const chunks: NativeChunk[] = built.chunks.map((c) => ({
    start: Number(c.start),
    rows: c.rows,
    aabbMin: [c.aabbMin[0], c.aabbMin[1], c.aabbMin[2]],
    aabbSize: [c.aabbSize[0], c.aabbSize[1], c.aabbSize[2]],
    timeMin: c.timeMin,
    timeScale: c.timeScale,
    lifeScale: c.lifeScale,
  }));
  const personLabels = built.personLabels;
  const geoRef = geo as GeoReference | null | undefined;
  const dataset: Dataset = {
    id: `ds-${Date.now()}-${n}`,
    name: o.name,
    count: pageRows,
    px: col<Float32Array>('@px')!,
    py: col<Float32Array>('@py')!,
    pz: col<Float32Array>('@pz')!,
    time,
    epochMs,
    timeOrigin: built.timeOrigin,
    yaw: col<Float32Array>('@yaw'),
    pitch: col<Float32Array>('@pitch'),
    personId: col<Uint32Array>('@person'),
    teamId: col<Uint16Array>('@team'),
    personLabels,
    teamLabels: built.teamLabels,
    sessionId: col<Uint32Array>('@session'),
    sessionLabels: built.sessionLabels,
    sessionRows: col<Uint32Array>('@sessionRows'),
    sessionStart: col<Float32Array>('@sessionStart'),
    sessionEnd: col<Float32Array>('@sessionEnd'),
    personTeam: col<Uint16Array>('@personTeam'),
    personSlot: col<Uint16Array>('@personSlot'),
    teamSizes: col<Uint32Array>('@teamSizes'),
    lifetime: col<Float32Array>('@lifetime'),
    maxLifetimeGap: step > 1 ? built.pageMaxLifetimeGap : built.maxLifetimeGap,
    personShared: col<Uint8Array>('@personShared'),
    attrs,
    warnings: [],
    bounds,
    timeRange: time ? [built.timeRange[0], built.timeRange[1]] : [0, 0],
    timeSorted: true,
    ...(geoRef ? { geo: { ...geoRef } } : {}),
    ...(aligned ? { recordingsAligned: aligned } : {}),
    ...(timeLabel && !aligned && epochMs === null ? { timeLabel: timeLabel as string } : {}),
    ...(series ? { series } : {}),
    native: {
      handle: Number(built.handle),
      rows: n,
      pageStep: step,
      chunks,
      shared: built.shared && sharedAvailable(),
      onDemand: built.onDemand.map((c) => ({ name: c, kind: extraNumeric(c) ? ('number' as const) : ('category' as const) })),
    },
  };

  // What the page's build says of a load (`DatasetBuilder.finish`), in its order.
  const warnings: Msg[] = [];
  for (const d of built.droppedColumns) {
    const count = Number(d.count);
    warnings.push(msg('data.builder.columnDropped', { column: d.name, count, shown: { int: count }, max: { int: 4096 } }));
  }
  if (built.teamsDropped > 0n) {
    const count = Number(built.teamsDropped);
    warnings.push(msg('data.builder.groupsDropped', { count, shown: { int: count }, max: { int: 4096 } }));
  }
  const shared = dataset.personShared;
  if (shared && built.sharedCount > 0n) {
    const examples: Array<string | Msg> = [];
    for (let p = 0; p < shared.length && examples.length < 3; p++) if (shared[p]) examples.push(personLabels[p] || msg('data.builder.blankName'));
    const count = Number(built.sharedCount);
    warnings.push(
      msg('data.builder.sharedNames', { shared: { int: count }, total: personLabels.length, examples: { each: examples, between: ', ' }, more: count > examples.length ? 'yes' : 'no' }),
    );
  }
  if (built.sessionsDropped > 0n) {
    const count = Number(built.sessionsDropped);
    warnings.push(msg('data.builder.sessionsDropped', { count, shown: { int: count }, max: { int: 100_000 } }));
  }
  const notes: Msg[] = [msg('data.builder.rows', { count: n })];
  if (built.sources > 1) notes.push(msg('data.builder.files', { count: built.sources }));
  if (built.rejected > 0n) notes.push(msg('data.builder.rejected', { count: Number(built.rejected) }));
  if (series) notes.push(msg('data.builder.seriesArranged', { count: aligned, campaign: series.campaign, seconds: series.breakSeconds }));
  else if (aligned) notes.push(msg('data.builder.recordingsAligned', { count: aligned }));
  if (step > 1) notes.push(msg('data.native.thinned', { step: { int: step }, ord: { ordinal: step }, rows: { int: pageRows }, total: { int: n } }));
  dataset.said = { name: o.name, notes, warnings };

  // What `ingestFiles` adds after the build.
  if (mapping.entitySize) dataset.entitySize = mapping.entitySize * (mapping.axes.scale || 1);
  dataset.axes = { ...mapping.axes };
  const roleCols: NonNullable<Dataset['roleColumns']> = {};
  if (mapping.x) roleCols.x = mapping.x;
  if (mapping.y) roleCols.y = mapping.y;
  if (mapping.z) roleCols.z = mapping.z;
  if (mapping.time) roleCols.time = mapping.time;
  if (mapping.personId) roleCols.person = mapping.personId;
  if (mapping.teamId) roleCols.team = mapping.teamId;
  if (mapping.sessionId) roleCols.session = mapping.sessionId;
  dataset.roleColumns = roleCols;
  const stride = Math.max(1, Math.floor(o.stride));
  const expected = o.expectedRows ? Math.ceil(o.expectedRows / stride) : 0;
  if (expected > 0 && n < expected * 0.95) {
    const missing = expected - n;
    const values = { loaded: { int: n }, expected, missing, percent: { num: (missing / expected) * 100, digits: 0 }, count: failures.length };
    warnings.push(msg(failures.length > 0 ? 'data.ingestFiles.shortUnread' : 'data.ingestFiles.shortDropped', values));
  }
  const filtered = { files: 0, rows: 0, kept: 0, groups: 0, groupsSkipped: 0 };
  for (const f of built.files) {
    if (!f.filtered || f.failureKey || f.failureText) continue;
    filtered.files++;
    filtered.rows += Number(f.filtered.rows);
    filtered.kept += Number(f.filtered.kept);
    filtered.groups += Number(f.filtered.groups);
    filtered.groupsSkipped += Number(f.filtered.groupsSkipped);
  }
  if (filtered.files > 0) {
    notes.push(msg('data.ingestFiles.prefiltered', { kept: { int: filtered.kept }, rows: { int: filtered.rows }, groups: { int: filtered.groups }, skipped: { int: filtered.groupsSkipped } }));
  }
  if (stride > 1) notes.push(msg('data.ingestFiles.stride', { stride: { int: stride }, ord: { ordinal: stride } }));
  if (failures.length > 0) {
    notes.push(msg('data.ingestFiles.skipped', { count: failures.length }));
    const byReason = new Map<string, { why: Msg | string; count: number }>();
    for (const f of failures) {
      const k = say(f.why);
      const r = byReason.get(k) ?? { why: f.why, count: 0 };
      r.count++;
      byReason.set(k, r);
    }
    const summary = [...byReason.values()].sort((a, c) => c.count - a.count).map(({ why, count }) => (count > 1 ? msg('data.ingestWorker.filesBecause', { count, reason: why }) : why));
    report(msg('data.ingestWorker.skipped', { count: failures.length, total: files.length, reasons: { each: summary, between: ' · ' } }), 1, n);
  }
  sayDataset(dataset);
  nativeBuildStats.last = {
    rows: n,
    pageRows,
    buildMs: t1 - t0,
    columnsMs: t2 - t1,
    totalMs: performance.now() - t0,
    coreMs: built.timing?.totalMs ?? 0,
    coreReadMs: built.timing?.readMs ?? 0,
    coreSortMs: built.timing?.sortMs ?? 0,
    corePeakBytes: Number(built.peakMemoryBytes),
  };
  return dataset;
}

/** Whether an error means the core turned the load down, so the page builds it instead. */
export function isRefusal(err: unknown): boolean {
  return err instanceof NativeError && (err.code === ErrorCode.UNSUPPORTED || err.code === ErrorCode.IO);
}
