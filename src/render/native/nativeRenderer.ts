/**
 * The native viewport as a `RenderBackend` (Stage 5, preview; docs/native-app.md).
 *
 * In the native app, with Settings > Native viewport (preview) on, the page
 * keeps everything but the drawing: the engine runs as before - camera,
 * sampling plan, accumulation, exposure, filters, time window - and hands each
 * frame to this backend, which sends it to the app (`framePacket.ts`). The
 * app's renderer (`native/crates/viewport`) draws it with the same WGSL under
 * the page, which turns transparent; the page's canvas gets no context and so
 * shows through.
 *
 * The rows go to the GPU from the core directly when the core built the load
 * (`Dataset.native`): nothing of them passes through the page. A load the page
 * built is packed here as the WebGPU renderer packs it and sent chunk by chunk.
 *
 * Drawn natively so far: the heat (points; binned or splatted as on the web),
 * team colours, the difference (by group or a column), value weights, filters,
 * time window, lifetimes, the slice and the distance cull, a model level's ground, the box
 * replay's figures (placed on the CPU, or by the GPU tracks for large loads: `nativeTracks.ts`) and cubes, their meshes
 * sent a slice a frame as `GpuFigures` writes them, the far-off glyphs the CPU placed, the
 * scene's triangles, the trails and the overlay lines, the objectives' marks and the lines
 * over the finished picture, the zones' discs, spawn marks, ranges, volume contours; the level's
 * water and structures with the heat's occlusion behind them (seal, structure depth, peeled
 * layers); line heat, the wedges and the direction field (their per-row data sent a chunk at a
 * time, `sendRowData`), the rate map. Not yet: the GPU tracks' trails, marks and glyphs, textures, image levels, world tiles.
 */

import type { Dataset } from '../../state/types';
import type { Level } from '../level';
import { packLineStarts, type LineData } from '../../data/lines';
import type { WorldTile } from '../../world/tileSet';
import {
  CHUNK_ROWS,
  FILTER_MASK_WIDTH,
  MAX_PLAN_BLOCKS,
  type CapturedFrame,
  type FrameParams,
  type FrameResult,
  type GpuLimits,
  type Renderer,
  type ActiveFilter,
} from '../types';
import { teamPaletteIndex } from '../colors';
import { filterColumnData, packFilterTable, packSignTables } from '../filterTables';
import { CURVE_LUT_SIZE } from '../../state/curve';
import { MAX_GPU_VOLUMES, VOLUME_BLOCK_FLOATS } from '../../volumes/gpu';
import { MAX_ZONES, ZONE_MIN_PX, ZONE_STATE_FLOATS, ZONE_VERTEX_FLOATS } from '../zoneShaders';
import { SPAWN_INSTANCE_FLOATS } from '../spawnMarks';
import { invert4 } from '../volumeContours';
import { ViewshedPlan } from '../../ranges/viewshed';
import { SHELL_FLOATS, shellMesh } from '../../ranges/shells';
import { SHELL_UNIFORM_BYTES } from '../../ranges/shellShaders';
import { FACES, GROUND_UNIFORM_BYTES, MAX_VIEWS, VIEW_FACE } from '../../ranges/viewshedShaders';
import { PacketWriter, SECTION, coreColumnName, writeFigures, writeFilters, writeFrame, writePlan } from './framePacket';
import { INSTANCE_STRIDE, MESH_STRIDE, type FigureMesh } from '../../figures/instances';
import { symbolAtlas } from '../symbols/atlas';
import { markResident, nextToUpload, playbackStarting, setMeshUploader, uploadsWaiting } from '../../figures/residency';
import { NativeTracks } from './nativeTracks';
import { KEYS_PER_BUFFER } from '../gpuTracks/store';

interface Tauri {
  invoke(cmd: string, args?: unknown, options?: unknown): Promise<unknown>;
}

function tauri(): Tauri | null {
  return ((globalThis as unknown as { __TAURI_INTERNALS__?: Tauri }).__TAURI_INTERNALS__ ?? null) as Tauri | null;
}

/** The setting's key; 'on' turns the preview on (read once, at start). */
export const NATIVE_VIEWPORT_KEY = 'heat3d.nativeViewport';

/** Whether this page should draw through the native viewport: in the app, with the setting on (or `?backend=native`). */
export function nativeViewportWanted(): boolean {
  if (!tauri()) return false;
  try {
    if (new URLSearchParams(globalThis.location?.search ?? '').get('backend') === 'native') return true;
    return globalThis.localStorage?.getItem(NATIVE_VIEWPORT_KEY) === 'on';
  } catch {
    return false;
  }
}

/** Turns the preview on or off; it applies when the page starts again. */
export function setNativeViewport(on: boolean): void {
  try {
    globalThis.localStorage?.setItem(NATIVE_VIEWPORT_KEY, on ? 'on' : 'off');
  } catch {
    // Storage blocked: the setting does not stick, and the web engine stays.
  }
}

interface Snapshot {
  /** The `setDataset` count the viewport last took (`datasetGen`): rows of an older one say nothing. */
  dataGen?: number;
  /** `viewport_rows` messages the viewport has taken (`sendRowData`). */
  rowsTaken?: number;
  residentRows?: number;
  droppedRows?: number;
  gpuBytes?: number;
  levelBytes?: number;
  filtersPending?: boolean;
  binned?: boolean;
  backend?: string;
  adapter?: string;
}

const SIGN_SCRATCH = new Float32Array(FILTER_MASK_WIDTH * 2);
/** `viewport_rows` kinds. */
const ROW_DIRS = 0;
const ROW_LINES = 1;
/** Bytes of per-row data in one `viewport_rows` message at most. */
const ROW_SLICE_BYTES = 4 * 1024 * 1024;
const DATA_SLICE_ROWS = 262_144;
/** Figure mesh bytes sent in one frame at most, as `GpuFigures` writes them; less while playback starts. */
const MESH_BYTES_PER_FRAME = 2 * 1024 * 1024;
const MESH_BYTES_STARTING = 512 * 1024;

function clampU16(v: number): number {
  return v < 0 ? 0 : v > 65535 ? 65535 : (v + 0.5) | 0;
}

export class NativeRenderer implements Renderer {
  readonly kind = 'native' as const;
  readonly reverseZ = true;
  readonly heatPrecision: 'f16' | 'f32';
  readonly gpuName: string | null;
  readonly gpuLimits: GpuLimits = { maxTextureSize: 16384, maxBufferBytes: 2 ** 31 - 4 };
  gpuBudgetBytes = 2 * 1024 ** 3;

  /** The GPU tracks (`nativeTracks.ts`): the store sent once, each frame its uniform. */
  private readonly tracks = new NativeTracks((bytes) => void this.invoke('viewport_tracks', bytes).catch((e: unknown) => console.warn('native viewport: tracks', e)));

  /** The keys' x, y, z, t in one binding (8 bytes a key), within half the GPU budget. */
  get gpuTracksMaxBytes(): number {
    return Math.min(KEYS_PER_BUFFER * 8, Math.floor(this.gpuBudgetBytes / 2));
  }

  /** The tracks' pipelines are made when the viewport starts. */
  gpuTracksReady(): boolean {
    return true;
  }

  get gpuTracksBytes(): number {
    return this.tracks.bytes;
  }

  private readonly writer = new PacketWriter();
  private seq = 0;
  private snap: Snapshot = {};
  private dataset: Dataset | null = null;
  // From a random start: a viewport still running from this window's last page must not take a
  // count of ours for one of its own.
  private datasetGen = Math.floor(Math.random() * 2 ** 30);
  /** The last packet sent (`viewport_frame`); a heat read waits until the viewport drew it. */
  private sentSeq = 0;
  /** Rows of the dataset the budget lets onto the GPU, whole chunks. */
  private planned = 0;
  private filterKeys: string[] | null = null;
  private filterGen = 0;
  private signs = new Float32Array(0);
  private volumeKey = '';
  private valuesKey = '';
  private sentColumns = new Set<string>();
  private inFlight = 0;
  /** A packet was not sent: the next one carries every table again. */
  private resend = false;
  private gpuMs: number | null = null;

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    info: string,
  ) {
    this.gpuName = info;
    this.heatPrecision = /heat f32/.test(info) ? 'f32' : 'f16';
  }

  /** Starts the app's viewport under this page, or throws why it could not. */
  static async create(canvas: HTMLCanvasElement): Promise<NativeRenderer> {
    const t = tauri();
    if (!t) throw new Error('not in the native app');
    const info = (await t.invoke('viewport_start')) as string;
    document.documentElement.classList.add('native-viewport');
    // Figure meshes go over a slice a frame (`figures/residency.ts`); a viewport still running from
    // this window's last page lets the old ones go first, as their ids start over with the page.
    await t.invoke('viewport_mesh', new Uint8Array(new Uint32Array([0xffffffff, 0, 0, 0]).buffer)).catch(() => {});
    setMeshUploader(true);
    return new NativeRenderer(canvas, info);
  }

  /**
   * Rows the GPU will hold, as the WebGPU renderer counts them: every chunk that
   * fits the budget, from `setDataset` on, while they are still on their way
   * (`dataPending`). The viewport's own count follows in its snapshots.
   */
  get residentRows(): number {
    return this.planned;
  }

  get droppedRows(): number {
    return Math.max(this.planned > 0 ? (this.dataset?.native?.rows ?? this.dataset?.count ?? 0) - this.planned : 0, this.snap.droppedRows ?? 0);
  }

  /** Rows still on their way to the GPU. */
  get dataPending(): boolean {
    // Until a snapshot from after this dataset arrives, its rows count as on their way: a
    // `viewport_frame` answers with the snapshot of the last draw, which may predate the
    // dataset and still count the last one's rows (the first exposure then metered part of the load).
    // Per-row data on its way counts too: line heat metered before its segment starts land
    // exposed for points (the line heat's exposure was 17x the web's).
    return (this.planned > 0 && (this.snap.dataGen !== this.datasetGen || (this.snap.residentRows ?? 0) < this.planned)) || this.rowsPending;
  }

  /** Bearings or segment starts sent and not yet taken by the viewport. */
  private get rowsPending(): boolean {
    return this.rowsSending > 0 || (this.snap.rowsTaken ?? 0) < this.rowsSent;
  }

  get gpuBytesUsed(): number {
    return this.snap.gpuBytes ?? 0;
  }

  get levelBytes(): number {
    return this.snap.levelBytes ?? 0;
  }

  get filtersPending(): boolean {
    return this.snap.filtersPending ?? false;
  }

  /**
   * Filter, split or weight columns, or rows, still on their way to the viewport. The engine
   * draws a fresh frame when this turns false, so a still view takes them in; meanwhile the
   * counters are asked for between frames, as no frame may be sent to carry them back.
   */
  get uploadsPending(): boolean {
    const pending = (this.snap.filtersPending ?? false) || this.dataPending;
    if (pending) this.pollSnapshot();
    return pending || this.uploading;
  }

  /** Per-row data sends still running (`sendRowData`), and the messages sent in all. */
  private rowsSending = 0;
  private rowsSent = 0;
  /**
   * Moves as each chunk's bearings or segment starts are taken by the viewport: the heat drawn
   * meanwhile took that chunk's rows as discs or points, so the engine starts the accumulation
   * over (as the web's `chunkDirs` does).
   */
  get dataGeneration(): number {
    return this.snap.rowsTaken ?? 0;
  }

  private polling = false;

  private pollSnapshot(): void {
    if (this.polling) return;
    this.polling = true;
    setTimeout(() => {
      void this.invoke('viewport_snapshot')
        .then((s) => {
          if (typeof s === 'string' && s) this.snap = JSON.parse(s) as Snapshot;
        })
        .catch(() => {})
        .finally(() => (this.polling = false));
    }, 50);
  }

  /** Whether the last frame was binned (Stage 0's path), for probes. */
  get binned(): boolean {
    return this.snap.binned ?? false;
  }

  private invoke(cmd: string, args?: unknown): Promise<unknown> {
    return tauri()!.invoke(cmd, args);
  }

  setDataset(dataset: Dataset | null): void {
    this.dataset = dataset;
    this.tracks.reset();
    const gen = ++this.datasetGen;
    // Per-row data was the old rows'; the engine sends the new ones' after this.
    this.lines = null;
    this.angles = null;
    this.filterKeys = null;
    this.valuesKey = '\u0001';
    this.sentColumns.clear();
    this.snap = { ...this.snap, residentRows: 0, droppedRows: 0 };
    const hasTime = !!(dataset?.time && dataset.lifetime);
    const native = dataset?.native ?? null;
    // Whole chunks while the budget lasts, as the viewport takes them.
    this.planned = 0;
    const rows = native ? native.rows : (dataset?.count ?? 0);
    let left = Math.max(0, Math.floor(this.gpuBudgetBytes));
    const perRow = hasTime ? 12 : 8;
    const sizes = native ? native.chunks.map((c) => c.rows) : Array.from({ length: Math.ceil(rows / CHUNK_ROWS) }, (_, i) => Math.min(CHUNK_ROWS, rows - i * CHUNK_ROWS));
    for (const n of sizes) {
      if (n * perRow > left) continue;
      left -= n * perRow;
      this.planned += n;
    }
    this.datasetSent = this.invoke('viewport_dataset', {
      handle: native ? native.handle : null,
      rows: native ? native.rows : (dataset?.count ?? 0),
      hasTime,
      budget: Math.max(0, Math.floor(this.gpuBudgetBytes)),
      gen,
    })
      .then(() => {
        if (dataset && !native && gen === this.datasetGen) void this.sendPageChunks(dataset, gen);
      })
      .catch((e: unknown) => console.warn('native viewport: dataset', e));
  }

  /** The last `viewport_dataset`: per-row data for it goes after it. */
  private datasetSent: Promise<unknown> = Promise.resolve();

  /** A load the page built: packed as `WebgpuRenderer.flushDataUpload` packs it, sent a chunk at a time. */
  private async sendPageChunks(ds: Dataset, gen: number): Promise<void> {
    const hasTime = !!(ds.time && ds.lifetime);
    const chunks = Math.ceil(ds.count / CHUNK_ROWS);
    for (let ci = 0; ci < chunks; ci++) {
      if (gen !== this.datasetGen) return;
      const start = ci * CHUNK_ROWS;
      const rows = Math.min(CHUNK_ROWS, ds.count - start);
      const mn = [Infinity, Infinity, Infinity];
      const mx = [-Infinity, -Infinity, -Infinity];
      for (let s = start; s < start + rows; s += DATA_SLICE_ROWS) {
        const e = Math.min(start + rows, s + DATA_SLICE_ROWS);
        for (let i = s; i < e; i++) {
          const x = ds.px[i];
          const y = ds.py[i];
          const z = ds.pz[i];
          if (x < mn[0]) mn[0] = x;
          if (x > mx[0]) mx[0] = x;
          if (y < mn[1]) mn[1] = y;
          if (y > mx[1]) mx[1] = y;
          if (z < mn[2]) mn[2] = z;
          if (z > mx[2]) mx[2] = z;
        }
        await new Promise((r) => setTimeout(r, 0));
      }
      const size = [0, 1, 2].map((k) => Math.max(1e-6, mx[k] - mn[k]));
      const head = 16;
      const bytes = new ArrayBuffer(head * 4 + rows * 8 + (hasTime ? rows * 4 : 0));
      const hu = new Uint32Array(bytes, 0, head);
      const hf = new Float32Array(bytes, 0, head);
      let timeMin = 0;
      let timeScale = 1;
      let lifeScale = 1;
      let invTime = 0;
      let invLife = 0;
      if (hasTime) {
        timeMin = ds.time![start];
        const span = Math.max(1e-6, ds.time![start + rows - 1] - timeMin);
        const lifeCap = Math.max(1e-6, ds.maxLifetimeGap);
        timeScale = span / 65535;
        lifeScale = lifeCap / 65534;
        invTime = 65535 / span;
        invLife = 65534 / lifeCap;
      }
      hu[0] = ci;
      hu[1] = start;
      hu[2] = rows;
      hu[3] = hasTime ? 1 : 0;
      hf.set([mn[0], mn[1], mn[2], size[0], size[1], size[2], timeMin, timeScale, lifeScale], 4);
      const pos = new Uint32Array(bytes, head * 4, rows * 2);
      const times = hasTime ? new Uint32Array(bytes, head * 4 + rows * 8, rows) : null;
      const sx = 65535 / size[0];
      const sy = 65535 / size[1];
      const sz = 65535 / size[2];
      for (let s = 0; s < rows; s += DATA_SLICE_ROWS) {
        const e = Math.min(rows, s + DATA_SLICE_ROWS);
        for (let i = s; i < e; i++) {
          const r = start + i;
          pos[i * 2] = clampU16((ds.px[r] - mn[0]) * sx) | (clampU16((ds.py[r] - mn[1]) * sy) << 16);
          pos[i * 2 + 1] = clampU16((ds.pz[r] - mn[2]) * sz) | ((ds.teamId ? ds.teamId[r] : 0) << 16);
          if (times) {
            const life = ds.lifetime![r];
            const l = life < 0 ? 65535 : Math.min(65534, clampU16(life * invLife));
            times[i] = clampU16((ds.time![r] - timeMin) * invTime) | (l << 16);
          }
        }
        await new Promise((r) => setTimeout(r, 0));
      }
      if (gen !== this.datasetGen) return;
      await this.invoke('viewport_chunk', new Uint8Array(bytes)).catch((e: unknown) => console.warn('native viewport: chunk', e));
    }
  }

  /** A load the page built has its filter columns here: each chunk's rows of each filter's column. */
  private sendPageColumns(filters: readonly ActiveFilter[]): void {
    const ds = this.dataset;
    if (!ds || ds.native) return;
    for (const f of filters) {
      const name = coreColumnName(f.column);
      if (this.sentColumns.has(name)) continue;
      this.sentColumns.add(name);
      const src = filterColumnData(ds, f.column);
      const chunks = Math.ceil(ds.count / CHUNK_ROWS);
      for (let ci = 0; ci < chunks; ci++) {
        const start = ci * CHUNK_ROWS;
        const rows = Math.min(CHUNK_ROWS, ds.count - start);
        const nameBytes = new TextEncoder().encode(name);
        const nameWords = Math.ceil(nameBytes.length / 4);
        const buf = new ArrayBuffer((3 + nameWords) * 4 + (src ? rows * 4 : 0));
        const u = new Uint32Array(buf, 0, 3);
        u[0] = ci;
        u[1] = src ? rows : 0;
        u[2] = nameBytes.length;
        new Uint8Array(buf, 12, nameBytes.length).set(nameBytes);
        if (src) {
          const out = new Float32Array(buf, (3 + nameWords) * 4, rows);
          for (let i = 0; i < rows; i++) out[i] = src[start + i];
        }
        void this.invoke('viewport_column', new Uint8Array(buf)).catch((e: unknown) => console.warn('native viewport: column', e));
      }
    }
  }

  /** The routes line heat draws (`setLines`), and the rows' bearings the wedges turn by (`setDirections`). */
  private lines: LineData | null = null;
  private angles: Uint8Array | null = null;
  /** Bumped by each `setLines`/`setDirections`, so an older send stops between chunks. */
  private rowDataSeq = [0, 0];

  setLines(lines: LineData | null): void {
    const ds = this.dataset;
    this.lines = lines && ds && lines.flags.length === ds.count ? lines : null;
    void this.sendRowData(ROW_LINES);
  }

  setDirections(angles: Uint8Array | null): void {
    const ds = this.dataset;
    this.angles = angles && ds && angles.length === ds.count ? angles : null;
    void this.sendRowData(ROW_DIRS);
  }

  /**
   * The viewport's chunks as the page's rows: a load the page built in `CHUNK_ROWS` pieces; one
   * the core built only where the page holds every row (`pageStep` 1), by the core's chunks. Null
   * where the page's rows index nothing there (as `fullNative` on the web).
   */
  private chunkRows(): { start: number; rows: number }[] | null {
    const ds = this.dataset;
    if (!ds) return null;
    const native = ds.native ?? null;
    if (native) return native.pageStep === 1 && native.rows === ds.count ? native.chunks.map((c) => ({ start: c.start, rows: c.rows })) : null;
    return Array.from({ length: Math.ceil(ds.count / CHUNK_ROWS) }, (_, i) => ({ start: i * CHUNK_ROWS, rows: Math.min(CHUNK_ROWS, ds.count - i * CHUNK_ROWS) }));
  }

  /**
   * One kind of per-row data to the viewport (`viewport_rows`), a chunk at a time in slices of
   * `ROW_SLICE_BYTES` (a whole chunk's segment starts in one message took WebView2's browser
   * process down): a 12-word header (kind, dataset count, chunk, bytes, the chunk's total, the
   * offset, the line box's min and size), then the bytes. A chunk of `u32::MAX` drops every
   * chunk's of that kind first.
   */
  private async sendRowData(kind: number): Promise<void> {
    const seq = ++this.rowDataSeq[kind];
    const gen = this.datasetGen;
    const lines = this.lines;
    const box = lines ? [...lines.min, ...lines.size] : [0, 0, 0, 1, 1, 1];
    // Counted from the call on: the exposure waits for these rows (`dataPending`).
    this.rowsSending++;
    const send = (chunk: number, data: Uint8Array | null, total = 0, offset = 0) => {
      const n = data ? data.byteLength : 0;
      const buf = new ArrayBuffer(48 + n);
      const h = new Uint32Array(buf, 0, 6);
      h[0] = kind;
      h[1] = gen >>> 0;
      h[2] = chunk >>> 0;
      h[3] = n;
      h[4] = total;
      h[5] = offset;
      new Float32Array(buf, 24, 6).set(box);
      if (data) new Uint8Array(buf, 48, n).set(data);
      this.rowsSent++;
      return this.invoke('viewport_rows', new Uint8Array(buf)).catch((e: unknown) => console.warn('native viewport: rows', e));
    };
    try {
      await this.datasetSent;
      await this.sendRowChunks(kind, seq, gen, send);
    } finally {
      this.rowsSending--;
    }
  }

  private async sendRowChunks(
    kind: number,
    seq: number,
    gen: number,
    send: (chunk: number, data: Uint8Array | null, total?: number, offset?: number) => Promise<unknown>,
  ): Promise<void> {
    const ds = this.dataset;
    const lines = this.lines;
    const angles = this.angles;
    await send(0xffffffff, null);
    const chunks = this.chunkRows();
    if (!ds || !chunks || (kind === ROW_LINES ? !lines : !angles)) return;
    for (let ci = 0; ci < chunks.length; ci++) {
      if (seq !== this.rowDataSeq[kind] || gen !== this.datasetGen) return;
      const { start, rows } = chunks[ci];
      let data: Uint8Array;
      if (kind === ROW_LINES) {
        data = new Uint8Array(packLineStarts(ds, lines!, start, rows, 3).buffer);
      } else {
        // `chunkDirs`: a byte a row, 255 (no bearing) past the rows to the word.
        data = new Uint8Array((Math.max(4, rows) + 3) & ~3).fill(255);
        data.set(angles!.subarray(start, start + rows));
      }
      for (let at = 0; at < data.byteLength; at += ROW_SLICE_BYTES) {
        if (seq !== this.rowDataSeq[kind] || gen !== this.datasetGen) return;
        await send(ci, data.subarray(at, Math.min(data.byteLength, at + ROW_SLICE_BYTES)), data.byteLength, at);
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  }

  setLevel(level: Level | null): void {
    this.rangeLevel = level && level.kind === 'model' && level.indices.length > 0 ? level : null;
    if (!level || level.kind !== 'model' || level.indices.length === 0) {
      void this.invoke('viewport_level', new Uint8Array(0));
      return;
    }
    const nv = level.vertices.length;
    const colours = level.colours && level.colours.length >= (nv / 6) * 3 ? level.colours.subarray(0, (nv / 6) * 3) : null;
    // The ground, then the structures (faces and edges) and the water: the viewport draws them,
    // seals the structures' depth and peels their layers for the heat's occlusion.
    const none = new Uint32Array(0);
    const sets = [level.indices, level.structureIndices ?? none, level.structureEdges ?? none, level.waterIndices ?? none];
    const words = sets.reduce((a, x) => a + x.length, 0);
    const buf = new ArrayBuffer(24 + nv * 4 + (colours ? colours.length * 4 : 0) + words * 4);
    const head = new Uint32Array(buf, 0, 6);
    head[0] = nv;
    head[1] = sets[0].length;
    head[2] = colours ? 1 : 0;
    head[3] = sets[1].length;
    head[4] = sets[2].length;
    head[5] = sets[3].length;
    let at = 24;
    new Float32Array(buf, at, nv).set(level.vertices);
    at += nv * 4;
    if (colours) {
      new Float32Array(buf, at, colours.length).set(colours);
      at += colours.length * 4;
    }
    for (const set of sets) {
      new Uint32Array(buf, at, set.length).set(set);
      at += set.length * 4;
    }
    void this.invoke('viewport_level', new Uint8Array(buf)).catch((e: unknown) => console.warn('native viewport: level', e));
  }

  setWorldTiles(_tiles: WorldTile[]): void {}

  prepareFilters(filters: ActiveFilter[]): ActiveFilter[] {
    // The viewport stages them itself: the old ones are drawn until every chunk has the new ones' columns.
    return filters;
  }

  render(p: FrameParams): FrameResult {
    const w = this.writer;
    w.begin(++this.seq);
    const all = this.seq === 1 || this.resend;
    this.resend = false;
    const r = this.canvas.getBoundingClientRect();
    const dpr = p.width / Math.max(1, r.width);
    w.open(SECTION.frame);
    // The spinning parts' clock as `pushSceneUniform` has it: seconds, wrapped before float32 loses the fraction.
    writeFrame(w, p, teamPaletteIndex(), Math.round(r.left * dpr), Math.round(r.top * dpr), (performance.now() / 1000) % 3600);
    w.close();
    w.open(SECTION.plan);
    writePlan(w, p.plan, MAX_PLAN_BLOCKS);
    w.close();
    // The figures: meshes a slice a frame (as `GpuFigures` writes them), the frame's instances here.
    this.pumpMeshes();
    if (p.figureBatches && p.figureBatches.length) {
      this.meshFrame++;
      for (const b of p.figureBatches) if (b.count > 0) this.meshFor(b.mesh);
      w.open(SECTION.figures);
      writeFigures(w, p.figureBatches, (id) => this.meshes.has(id));
      w.close();
      this.evictMeshes();
    }
    if (p.gpuTracks) {
      if (!p.figureBatches?.length) this.meshFrame++;
      this.tracks.write(w, p, (m) => this.meshFor(m), all);
      if (!p.figureBatches?.length) this.evictMeshes();
    }
    if (p.cubes && p.cubeCount > 0) {
      w.open(SECTION.cubes);
      w.word(p.cubeCount);
      w.reserveFloats(p.cubeCount * 8).set(p.cubes.subarray(0, p.cubeCount * 8));
      w.close();
    }
    // The far-off glyphs the CPU placed, once the atlas is over (it is made once, on the page).
    const glyphs = p.symbols?.cpu && p.symbols.cpu.count > 0 ? p.symbols : null;
    if (glyphs && !this.atlasSent) {
      const pixels = symbolAtlas();
      if (pixels) {
        this.atlasSent = true;
        void this.invoke('viewport_glyphs', pixels).catch((e: unknown) => console.warn('native viewport: glyph atlas', e));
      }
    }
    if (glyphs && this.atlasSent) {
      const g = glyphs.cpu!;
      w.open(SECTION.symbols);
      w.float(glyphs.style);
      w.float(glyphs.mode);
      w.float(glyphs.ticks ? 1 : 0);
      w.reserveFloats(64).set(glyphs.sides.subarray(0, 64));
      w.word(g.count);
      w.reserveFloats(g.count * INSTANCE_STRIDE).set(g.data.subarray(0, g.count * INSTANCE_STRIDE));
      w.close();
    }
    this.writeTop(p, all);
    this.writeOverlays(p, all);
    this.writeRanges(p, all);
    const tris = p.sceneTris && p.sceneTriVertCount > 0 ? p.sceneTriVertCount : 0;
    const trails = p.trailVerts && p.trailVertCount > 0 ? p.trailVertCount : 0;
    const overlay = p.overlayVerts && p.overlayVertCount > 0 ? p.overlayVertCount : 0;
    if (tris + trails + overlay > 0) {
      w.open(SECTION.geometry);
      for (const [data, n] of [[p.sceneTris, tris], [p.trailVerts, trails], [p.overlayVerts, overlay]] as const) {
        w.word(n);
        if (n > 0) w.reserveFloats(n * 7).set(data!.subarray(0, n * 7));
      }
      w.close();
    }
    if (p.colorLutDirty || all) {
      w.open(SECTION.colorLut);
      w.bytes(p.colorLut);
      w.close();
    }
    if ((p.curveLutDirty || all) && p.curveLut.length === CURVE_LUT_SIZE) {
      w.open(SECTION.curveLut);
      w.floats(p.curveLut);
      w.close();
    }
    const signs = packSignTables(p.teamSign, p.splitMode === 1 ? p.splitSign : null, FILTER_MASK_WIDTH, SIGN_SCRATCH);
    if (!this.sameSigns(signs) || all) {
      w.open(SECTION.signs);
      w.floats(signs);
      w.close();
    }
    const keys = p.filters.map((f) => f.key);
    if (all || !this.filterKeys || keys.length !== this.filterKeys.length || keys.some((k, i) => k !== this.filterKeys![i])) {
      this.filterKeys = keys;
      this.sendPageColumns(p.filters);
      w.open(SECTION.filters);
      writeFilters(w, p.filters, packFilterTable(p.filters), ++this.filterGen);
      w.close();
    }
    // The split's and the weight's columns: read per row from the chunks' own columns, as filters are.
    const split = p.splitMode === 0 ? '' : (p.splitColumn ?? '');
    const weight = p.weightColumn ?? '';
    const valuesKey = `${split}\u0000${weight}`;
    if (valuesKey !== this.valuesKey || all) {
      this.valuesKey = valuesKey;
      const cols = [split, weight].filter(Boolean).map((c) => ({ column: c }) as ActiveFilter);
      this.sendPageColumns(cols);
      w.open(SECTION.values);
      w.string(split ? coreColumnName(split) : '');
      w.string(weight ? coreColumnName(weight) : '');
      w.close();
    }
    const vol = p.volumes ?? null;
    const volKey = vol ? vol.key : '';
    if (volKey !== this.volumeKey || all) {
      this.volumeKey = volKey;
      w.open(SECTION.volumes);
      w.floats(vol ? vol.block : new Float32Array(VOLUME_BLOCK_FLOATS));
      w.close();
    }
    // One packet in flight at most past the first few: a page that outruns the app would only queue frames.
    if (this.inFlight < 3) {
      this.inFlight++;
      this.sentSeq = this.seq;
      const t0 = performance.now();
      void this.invoke('viewport_frame', w.view().slice())
        .then((s) => {
          if (typeof s === 'string' && s) this.snap = JSON.parse(s) as Snapshot;
          this.gpuMs = performance.now() - t0;
        })
        .catch(() => {})
        .finally(() => this.inFlight--);
    } else {
      this.resend = true;
    }
    return { gpuMs: null };
  }

  // ------------------------------------------------------------ marks over the picture

  /** What the viewport holds of the kept arrays (`topStatic` by version, `topTris`/`groundTris` by identity). */
  private topSent: { version: number; tris: Float32Array | null; trisN: number; ground: Float32Array | null; groundN: number } = {
    version: -1,
    tris: null,
    trisN: 0,
    ground: null,
    groundN: 0,
  };

  /** The `top` section, when anything in it is drawn; the kept arrays only when new to the viewport. */
  private writeTop(p: FrameParams, all: boolean): void {
    const top = p.topVerts && p.topVertCount ? p.topVertCount : 0;
    const st = p.topStatic && p.topStatic.count ? p.topStatic : null;
    const tris = p.topTris && p.topTriCount ? p.topTriCount : 0;
    const ground = p.groundTris && p.groundTriCount ? p.groundTriCount : 0;
    const under = p.objectivesUnder ?? null;
    if (!top && !st && !tris && !ground && !under) return;
    if (all) this.topSent = { version: -1, tris: null, trisN: 0, ground: null, groundN: 0 };
    const s = this.topSent;
    const w = this.writer;
    const floats = (data: Float32Array, n: number) => w.reserveFloats(n * 7).set(data.subarray(0, n * 7));
    w.open(SECTION.top);
    w.word(top);
    if (top) floats(p.topVerts!, top);
    w.word(st ? st.version >>> 0 : 0);
    w.word(st ? st.count : 0);
    const stNew = !!st && st.version !== s.version;
    w.word(stNew ? 1 : 0);
    if (stNew) {
      floats(st.data, st.count);
      s.version = st.version;
    }
    w.word(tris);
    const trisNew = tris > 0 && (s.tris !== p.topTris || s.trisN !== tris);
    w.word(trisNew ? 1 : 0);
    if (trisNew) {
      floats(p.topTris!, tris);
      s.tris = p.topTris!;
      s.trisN = tris;
    }
    w.word(ground);
    const groundNew = ground > 0 && (s.ground !== p.groundTris || s.groundN !== ground);
    w.word(groundNew ? 1 : 0);
    if (groundNew) {
      floats(p.groundTris!, ground);
      s.ground = p.groundTris!;
      s.groundN = ground;
    }
    const ul = under && under.lines && under.lineCount ? under.lineCount : 0;
    w.word(under ? 1 : 0);
    w.word(ul);
    if (ul) floats(under!.lines!, ul);
    w.close();
  }

  /** The kept overlay arrays the viewport holds, by identity. */
  private overlaySent: { zones: Float32Array | null; spawns: Float32Array | null } = { zones: null, spawns: null };
  private readonly invView = new Float32Array(16);

  /** The `overlays` section (`SECTION.overlays`), when any of the three is drawn. */
  private writeOverlays(p: FrameParams, all: boolean): void {
    const z = p.objectiveZones && p.objectiveZones.count ? p.objectiveZones : null;
    const sp = p.spawnMarks && p.spawnMarks.count ? p.spawnMarks : null;
    // As the web engine: the contours only where there is a level to cut.
    const c = p.volumeContours && p.level ? p.volumeContours : null;
    if (all) this.overlaySent = { zones: null, spawns: null };
    if (!z && !sp && !c) return;
    const s = this.overlaySent;
    const w = this.writer;
    const dpr = globalThis.devicePixelRatio || 1;
    w.open(SECTION.overlays);
    w.word(z ? 1 : 0);
    if (z) {
      w.word(z.ground ? 1 : 0);
      w.floats([z.xray, ZONE_MIN_PX * dpr]);
      w.word(z.count);
      const state = new Float32Array(MAX_ZONES * ZONE_STATE_FLOATS);
      state.set(z.state.subarray(0, state.length));
      w.floats(state);
      const fresh = s.zones !== z.verts;
      w.word(fresh ? 1 : 0);
      if (fresh) {
        w.floats(z.verts.subarray(0, z.count * ZONE_VERTEX_FLOATS));
        s.zones = z.verts;
      }
    }
    w.word(sp ? sp.count : 0);
    if (sp) {
      w.word(sp.lines ? 1 : 0);
      w.floats([dpr]);
      const fresh = s.spawns !== sp.data;
      w.word(fresh ? 1 : 0);
      if (fresh) {
        w.floats(sp.data.subarray(0, sp.count * SPAWN_INSTANCE_FLOATS));
        s.spawns = sp.data;
      }
    }
    w.word(c ? 1 : 0);
    if (c) {
      w.floats(c.block.subarray(0, VOLUME_BLOCK_FLOATS));
      const colors = new Float32Array(MAX_GPU_VOLUMES * 4);
      colors.set(c.colors.subarray(0, colors.length));
      w.floats(colors);
      w.floats(invert4(p.viewProj, this.invView));
    }
    w.close();
  }

  /** The units' views the viewport holds (`ViewshedPlan`, as `GpuRanges` keeps it), and the level they are taken from. */
  private readonly rangePlan = new ViewshedPlan();
  private rangeLevel: Level | null = null;
  private rangeMesh: { data: Float32Array; sphere: number; cone: number } | null = null;
  private rangeMeshSent = false;
  private readonly rangeViews = new Float32Array(MAX_VIEWS * 6 * 4);

  /** Faces of the units' views still to take: the engine draws on until they are. */
  get rangesPending(): boolean {
    return this.rangePlan.pending;
  }

  /** The `ranges` section (`SECTION.ranges`): what `GpuRanges.takeViews` and `prepare` hand the GPU. */
  private writeRanges(p: FrameParams, all: boolean): void {
    if (all) this.rangeMeshSent = false;
    const r = p.ranges;
    if (!r) return;
    const o = p.origin;
    // Faces only from a model level the viewport holds, as the web engine takes them from its level mesh.
    const level = p.level?.kind === 'model' ? this.rangeLevel : null;
    const todo = level && (r.los || r.ground) ? this.rangePlan.plan(r.views, level, r.facesPerFrame) : [];
    const views = this.rangePlan.uniforms(r.views, o, this.rangeViews);
    const mesh = (this.rangeMesh ??= shellMesh());
    const w = this.writer;
    w.open(SECTION.ranges);
    w.word(r.count);
    w.word(r.coneStart);
    w.word(mesh.sphere);
    w.word(mesh.cone);
    w.word(this.rangeMeshSent ? 0 : 1);
    if (!this.rangeMeshSent) {
      w.word(mesh.data.length);
      w.floats(mesh.data);
      this.rangeMeshSent = true;
    }
    const s = new Float32Array(SHELL_UNIFORM_BYTES / 4);
    s.set(p.viewProjRel, 0);
    s.set([p.cameraPos[0] - o[0], p.cameraPos[1] - o[1], p.cameraPos[2] - o[2], r.opacity], 16);
    s.set([r.faces ? 1 : 0, r.lines ? 1 : 0, r.los ? 1 : 0, 0], 20);
    s.set(views, 24);
    s.set([VIEW_FACE, r.bias, 0, 0], 24 + MAX_VIEWS * 24);
    w.floats(s);
    if (r.count) w.floats(r.shells.subarray(0, r.count * SHELL_FLOATS));
    let n = 0;
    const g = new Float32Array(GROUND_UNIFORM_BYTES / 4);
    if (r.ground) {
      g.set(p.viewProj, 0);
      r.views.forEach((v, i) => {
        if (!v) return;
        n = i + 1;
        g.set([v.band[0], v.band[1], v.band[2], r.opacity], 20 + MAX_VIEWS * 24 + 4 + i * 4);
        g.set([v.colour[0], v.colour[1], v.colour[2], 1], 20 + MAX_VIEWS * 24 + 4 + MAX_VIEWS * 4 + i * 4);
        if (v.cone) g.set([v.cone.fwd[0], v.cone.fwd[1], v.cone.fwd[2], v.cone.tanH], 20 + MAX_VIEWS * 24 + 4 + MAX_VIEWS * 8 + i * 4);
      });
      g.set([o[0], o[1], o[2], n], 16);
      g.set(views, 20);
      g.set([VIEW_FACE, r.bias, 0, 0], 20 + MAX_VIEWS * 24);
    }
    w.word(n > 0 ? 1 : 0);
    if (n > 0) w.floats(g);
    w.word(todo.length);
    for (const layer of todo) {
      const v = r.views[Math.floor(layer / 6)]!;
      const [a, rt, up] = FACES[layer % 6];
      const near = Math.max(1e-3, v.far * 1e-5);
      w.word(layer);
      w.floats([v.eye[0], v.eye[1], v.eye[2], v.far, a[0], a[1], a[2], near, rt[0], rt[1], rt[2], 0, up[0], up[1], up[2], 0]);
    }
    w.close();
  }

  // ------------------------------------------------------------ figure meshes

  /** Meshes the viewport has whole, by id, with the frame each was last drawn in. */
  private readonly meshes = new Map<number, { used: number }>();
  /** Meshes part way over, by id: how many bytes are sent. */
  private readonly meshPartial = new Map<number, { mesh: FigureMesh; at: number }>();
  private meshFrame = 0;
  /** The glyph atlas went over (`viewport_glyphs`); it is the same for the page's life. */
  private atlasSent = false;
  private meshBytes = 0;
  private meshBudget = MESH_BYTES_PER_FRAME;

  /** Whether `mesh` is whole in the viewport; if not, sends what this frame's budget allows of it. */
  private meshFor(mesh: FigureMesh): boolean {
    const m = this.meshes.get(mesh.id);
    if (m) {
      m.used = this.meshFrame;
      return true;
    }
    let u = this.meshPartial.get(mesh.id);
    if (!u) {
      if (this.meshBytes >= this.meshBudget) return false;
      u = { mesh, at: 0 };
      this.meshPartial.set(mesh.id, u);
    }
    return this.sendMesh(u);
  }

  /** One slice of a mesh (`viewport_mesh`: id, vertices, total bytes, offset, then the bytes). */
  private sendMesh(u: { mesh: FigureMesh; at: number }): boolean {
    const d = u.mesh.data;
    const room = this.meshBudget - this.meshBytes;
    if (room <= 0) return false;
    // Whole vertices, so the viewport's see-through test reads each one once.
    const V = MESH_STRIDE * 4;
    const n = Math.min(d.byteLength - u.at, Math.max(V, Math.floor(room / V) * V));
    if (n > 0) {
      const buf = new ArrayBuffer(16 + n);
      new Uint32Array(buf, 0, 4).set([u.mesh.id, u.mesh.count, d.byteLength, u.at]);
      new Uint8Array(buf, 16).set(new Uint8Array(d.buffer, d.byteOffset + u.at, n));
      void this.invoke('viewport_mesh', new Uint8Array(buf)).catch((e: unknown) => console.warn('native viewport: mesh', e));
      u.at += n;
      this.meshBytes += n;
    }
    if (u.at < d.byteLength) return false;
    this.meshPartial.delete(u.mesh.id);
    this.meshes.set(u.mesh.id, { used: this.meshFrame });
    markResident(u.mesh.id, true);
    return true;
  }

  /** A frame's start: uploads under way carried on, then meshes asked for ahead (`makeResident`). */
  private pumpMeshes(): void {
    this.meshBytes = 0;
    const starting = playbackStarting();
    this.meshBudget = starting ? MESH_BYTES_STARTING : MESH_BYTES_PER_FRAME;
    for (const u of this.meshPartial.values()) {
      if (this.meshBytes >= this.meshBudget) return;
      this.sendMesh(u);
    }
    if (starting) return;
    while (this.meshBytes < this.meshBudget) {
      const mesh = nextToUpload();
      if (!mesh) return;
      this.meshFor(mesh);
    }
  }

  /** Meshes not drawn for 600 frames are let go, here and in the viewport (as `GpuFigures` does). */
  private evictMeshes(): void {
    if (this.meshFrame % 600 !== 0) return;
    for (const [id, m] of this.meshes) {
      if (this.meshFrame - m.used < 600) continue;
      this.meshes.delete(id);
      markResident(id, false);
      const buf = new Uint32Array([id, 0, 0, 0]);
      void this.invoke('viewport_mesh', new Uint8Array(buf.buffer)).catch(() => {});
    }
  }

  /** Whether figure meshes are on their way. */
  get uploading(): boolean {
    return this.meshPartial.size > 0 || uploadsWaiting() > 0 || this.tracks.uploading;
  }

  private sameSigns(s: Float32Array): boolean {
    if (this.signs.length === s.length) {
      let same = true;
      for (let i = 0; i < s.length; i++)
        if (s[i] !== this.signs[i]) {
          same = false;
          break;
        }
      if (same) return true;
    }
    this.signs = s.slice();
    return false;
  }

  /** The IPC round trip of the last frame, ms (not the GPU's time). */
  get frameRoundTripMs(): number | null {
    return this.gpuMs;
  }

  private probeValue: number | null = null;
  private probePending = false;

  /** The last sample, asking for the next one: a cursor readout, as the WebGPU renderer's. */
  readHeatAt(canvasX: number, canvasY: number, divisor: number): number | null {
    if (!this.probePending) void this.probeHeat(canvasX, canvasY, divisor);
    return this.probeValue;
  }

  async probeHeat(canvasX: number, canvasY: number, divisor: number): Promise<number | null> {
    if (this.probePending) return this.probeValue;
    this.probePending = true;
    try {
      const raw = (await this.invoke('viewport_probe', { x: canvasX, y: canvasY })) as number | null;
      this.probeValue = typeof raw === 'number' && Number.isFinite(raw) ? raw / Math.max(1, divisor) : null;
    } catch {
      this.probeValue = null;
    } finally {
      this.probePending = false;
    }
    return this.probeValue;
  }

  /** `allChannels`: every channel of every texel, signed (the parity probe), as the WebGPU renderer's. */
  async readHeatField(maxSamples: number, allChannels = false): Promise<Float32Array | null> {
    try {
      // The field of the frame just sent, as the web engine reads the frame it has just submitted.
      const got = (await this.invoke('viewport_read_heat', { max: allChannels ? 0 : Math.max(1, maxSamples), after: this.sentSeq })) as ArrayBuffer;
      return got && got.byteLength >= 4 ? new Float32Array(got) : null;
    } catch {
      return null;
    }
  }

  async captureFrame(): Promise<CapturedFrame | null> {
    try {
      const got = (await this.invoke('viewport_capture')) as ArrayBuffer;
      const u = new Uint32Array(got, 0, 2);
      return { width: u[0], height: u[1], rgba: new Uint8Array(got, 8) };
    } catch {
      return null;
    }
  }

  /** Present intervals and CPU times the viewport measured since the last call (probes). */
  async times(): Promise<{ intervals: number[]; cpu: number[]; frames: number; packets: number } | null> {
    try {
      return JSON.parse((await this.invoke('viewport_times')) as string);
    } catch {
      return null;
    }
  }

  dispose(): void {
    setMeshUploader(false);
    document.documentElement.classList.remove('native-viewport');
    void this.invoke('viewport_stop').catch(() => {});
  }
}
