/**
 * Heat from tiles as the viewer offers it (Stage 6): the one switch between
 * the tile source (`source.ts`) and the rest of the app.
 *
 * Two ways in, both automatic where they can be:
 * - files: a pick of Parquet tables in the native app whose rows do not fit the
 *   memory budget is drawn from the core's tile pyramid of every row instead
 *   (the Source panel also offers it for any such pick);
 * - session: a member follows the heat the host draws from tiles, read by its
 *   key through the session's gateway (the shared document `heattiles`).
 *
 * The state here is what the status line over the view says: tiles, the level
 * drawn, building and how far.
 */

import { create } from 'zustand';
import type { ColumnMapping } from '../../state/types';
import type { SourcePreview } from '../../data/sourcePreview';
import { activeClauses } from '../../data/rowFilter';
import type { TilePlacement } from './lod';
import { RowWindow, WINDOW_MAX_ROWS, type RowWindowState } from './rowWindow';
import { HeatTileSource, type TileTransport } from './source';
import type { HeatTileQueryInit } from './transport';

export interface TileHeatState {
  on: boolean;
  /** Where the pyramid comes from: this computer's core from picked files, or the session host's. */
  from: 'files' | 'session' | null;
  /** The finest level drawn now, and the finest the pyramid has. */
  level: number;
  leaf: number;
  /** Rows counted into the pyramid (the filter's kept rows when complete). */
  rows: number;
  fraction: number;
  complete: boolean;
  bytes: number;
  error: string;
  /** The pyramid's key and square: what the session document carries. */
  key: string;
  /** Rows in place of the tiles where the view is zoomed in (`rowWindow.ts`): loading them, drawn, or going back. */
  window: RowWindowState;
  windowRows: number;
  /** The pyramid's groups when split (the last "other" when it has one), for the legend's sides. */
  channels: readonly string[];
}

const OFF: TileHeatState = { on: false, from: null, level: -1, leaf: 0, rows: 0, fraction: 0, complete: false, bytes: 0, error: '', key: '', window: 'tiles', windowRows: 0, channels: [] };

export const useTileHeat = create<TileHeatState>(() => ({ ...OFF }));

/** What the session's `heattiles` document holds: the host's pyramid and where it lies. */
export interface TileHeatShare {
  key: string;
  sx: number;
  sz: number;
  ground: number;
}

/** The engine side this needs (`render/engine.ts`). */
export interface TileEngine {
  setHeatTiles(s: HeatTileSource | null): void;
  heatTiles(): HeatTileSource | null;
  invalidate(n?: number): void;
  frameAround(x: number, y: number, z: number, radius: number): void;
}

/** A pick drawn from tiles: what its query is made of, so a mode that tells groups apart can ask again split. */
interface Pick {
  files: File[];
  mapping: ColumnMapping;
  preview: SourcePreview | null;
  share: boolean;
  split: boolean;
}

let current: {
  src: HeatTileSource;
  engine: TileEngine;
  timer: ReturnType<typeof setInterval>;
  share: TileHeatShare | null;
  following: string;
  pick?: Pick;
  unsubscribe?: () => void;
  rowWindow?: RowWindow;
} | null = null;

/** Heat modes that draw each group in its own way: they want a pyramid split by the group column. */
export function modeWantsSplit(mode: string): boolean {
  return mode === 'heat-teams' || mode === 'heat-difference';
}

/** The shared document's state: the host's pyramid while it draws one, else nothing. */
export const useTileHeatShare = create<{ doc: Partial<TileHeatShare> }>(() => ({ doc: {} }));

/** `next` unless it holds what `prev` holds: the store keeps one array while the names stay. */
const sameList = (prev: readonly string[], next: readonly string[]) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next);

function publish(src: HeatTileSource, from: 'files' | 'session'): void {
  const i = src.info;
  const was = useTileHeat.getState();
  const next: TileHeatState = {
    on: true,
    from,
    level: src.stats.drawnLevel,
    leaf: i?.leafLevel ?? 0,
    rows: i?.rowsCounted ?? 0,
    fraction: i?.fraction ?? 0,
    complete: !!i?.complete,
    bytes: src.stats.bytes,
    error: i?.error ?? '',
    key: i?.key ?? '',
    window: current?.rowWindow?.state ?? 'tiles',
    windowRows: current?.rowWindow?.rows ?? 0,
    channels: sameList(was.channels, i?.channelNames ?? []),
  };
  if ((Object.keys(next) as (keyof TileHeatState)[]).some((k) => next[k] !== was[k])) useTileHeat.setState(next);
}

/**
 * Draws heat from `transport`'s pyramid, replacing any tile heat before; the
 * camera frames the pyramid once its square is known. `share` puts it in the
 * session document for the members (files only).
 */
export function startTileHeat(engine: TileEngine, transport: TileTransport, place: TilePlacement, from: 'files' | 'session', share = false, frame = true, sv?: number): HeatTileSource {
  stopTileHeat();
  const src = new HeatTileSource(transport, place, {}, () => engine.invalidate(1));
  let framed = !frame;
  let grounded = sv === undefined;
  const tick = () => {
    if (current?.src !== src) return;
    const i = src.info;
    // The ground from every row's height (`sv` the vertical axis's scale and flip), before the camera frames it.
    if (!grounded && i?.zRange) {
      grounded = true;
      place.ground = Math.min(i.zRange[0] * sv!, i.zRange[1] * sv!);
      if (current.share) current.share.ground = place.ground;
      engine.invalidate(1);
    }
    if (!framed && i && i.key && i.size > 0) {
      framed = true;
      const cx = place.sx * (i.x0 + i.size / 2);
      const cz = place.sz * (i.y0 + i.size / 2);
      engine.frameAround(cx, place.ground, cz, (Math.abs(place.sx) * i.size) / 2);
    }
    if (current.share && i?.key && useTileHeatShare.getState().doc.key !== i.key) useTileHeatShare.setState({ doc: { ...current.share, key: i.key } });
    current.rowWindow?.tick();
    publish(src, from);
  };
  // A quarter second is often enough for a status line, and costs nothing on the frame path.
  current = { src, engine, timer: setInterval(tick, 250), share: share ? { key: '', sx: place.sx, sz: place.sz, ground: place.ground } : null, following: '' };
  engine.setHeatTiles(src);
  src.start();
  useTileHeat.setState({ ...OFF, on: true, from });
  return src;
}

export function stopTileHeat(): void {
  if (!current) return;
  clearInterval(current.timer);
  current.unsubscribe?.();
  current.rowWindow?.dispose();
  current.src.dispose();
  if (current.engine.heatTiles() === current.src) current.engine.setHeatTiles(null);
  if (current.share) useTileHeatShare.setState({ doc: {} });
  current = null;
  useTileHeat.setState({ ...OFF });
}

/** The two horizontal columns, and where the data's plane lies in the world (as `remapAxesInPlace` puts rows). */
export function tilePlacement(mapping: ColumnMapping, preview: SourcePreview | null): { x: string; y: string; place: TilePlacement; vertical: string | null; sv: number } | null {
  const a = mapping.axes;
  const s = a.scale || 1;
  const upZ = a.up === 'z';
  const x = mapping.x;
  const y = upZ ? mapping.y : mapping.z;
  const vertical = upZ ? mapping.z : mapping.y;
  if (!x || !y) return null;
  const sx = (a.flipX ? -1 : 1) * s;
  const sz = (upZ ? (a.flipY ? -1 : 1) : (a.flipZ ? -1 : 1)) * s;
  const sv = (upZ ? (a.flipZ ? -1 : 1) : (a.flipY ? -1 : 1)) * s;
  // The ground under the heat until the core answers the vertical column's span over every row
  // group (`zRange`): the lowest height in the file's sample.
  let ground = 0;
  const col = vertical && preview ? preview.columns.indexOf(vertical) : -1;
  if (col >= 0 && preview) {
    let lo = Infinity;
    for (const r of preview.rows) {
      const v = Number(r[col]) * sv;
      if (Number.isFinite(v) && v < lo) lo = v;
    }
    if (Number.isFinite(lo)) ground = lo;
  }
  return { x, y, place: { sx, sz, ground }, vertical: vertical || null, sv };
}

/** Whether a pick can be drawn from tiles: the native app's core, Parquet tables, both horizontal columns. */
export function tilesPossible(native: boolean, preview: SourcePreview | null, mapping: ColumnMapping | null): boolean {
  return native && preview?.format === 'parquet' && !!mapping && !!tilePlacement(mapping, preview);
}

/**
 * The core's query for a pick: its files by token, the horizontal columns, the
 * load's pre-filter; with `split`, a channel per value of the group column (the
 * core finds the values, the rest in an "other" channel).
 */
export async function pickQuery(files: File[], mapping: ColumnMapping, preview: SourcePreview | null, share: boolean, split = false): Promise<{ query: HeatTileQueryInit; place: TilePlacement; sv?: number } | null> {
  const p = tilePlacement(mapping, preview);
  if (!p) return null;
  const { nativeRefs } = await import('../../data/native/files');
  const { clauseOf } = await import('../../data/native/readers');
  const refs = await nativeRefs(files);
  if (refs.some((r) => !r)) return null;
  return {
    query: {
      files: refs.map((r) => ({ source: { case: 'token' as const, value: r!.token }, member: r!.member })),
      x: p.x,
      y: p.y,
      filter: activeClauses(mapping.rowFilter).map(clauseOf),
      share,
      z: p.vertical ?? '',
      ...(split && mapping.teamId ? { split: mapping.teamId, splitValues: [] } : {}),
    },
    place: p.place,
    sv: p.vertical ? p.sv : undefined,
  };
}

/**
 * Heat from tiles for a pick, on this computer's core. False when it cannot be.
 * Split by the group column while the heat mode tells groups apart (`split`,
 * else the store's mode); a later switch to such a mode asks again split, the
 * camera left where it is. A split pyramid stays when the mode no longer needs
 * it: summed, it is the plain heat.
 */
export async function startPickTileHeat(
  engine: TileEngine,
  files: File[],
  mapping: ColumnMapping,
  preview: SourcePreview | null,
  share: boolean,
  split?: boolean,
  frame = true,
  maxRows = WINDOW_MAX_ROWS,
): Promise<boolean> {
  const { useStore } = await import('../../state/store');
  const { heatModeFor } = await import('../../data/lines');
  const modeNow = () => {
    const s = useStore.getState();
    return heatModeFor(s.mode, s.lines);
  };
  const wantSplit = !!mapping.teamId && (split ?? modeWantsSplit(modeNow()));
  const q = await pickQuery(files, mapping, preview, share, wantSplit);
  if (!q) return false;
  const { coreEndpoint } = await import('../../data/native/core');
  const { heatTileTransport } = await import('./transport');
  const src = startTileHeat(engine, heatTileTransport(await coreEndpoint(), q.query), q.place, 'files', share, frame, q.sv);
  if (current?.src !== src) return true;
  const pick: Pick = { files, mapping, preview, share, split: wantSplit };
  current.pick = pick;
  // Zoomed in past the leaf: the rows of the ground in view instead (rowWindow.ts).
  const axes = tilePlacement(mapping, preview);
  if (axes && preview) {
    const { loader } = await import('../../data/loader');
    if (current?.src !== src) return true;
    current.rowWindow = new RowWindow(src, { files, mapping, columns: preview.columns, x: axes.x, y: axes.y, maxRows }, {
      ingest: (f, m, columns, expected) => loader.ingest(f, m, columns, files[0]?.name ?? '', 1, expected),
      dataset: () => useStore.getState().dataset,
      setDataset: (d) => useStore.getState().setDataset(d, { keepView: true }),
    });
  }
  if (!wantSplit && mapping.teamId) {
    current.unsubscribe = useStore.subscribe((s, prev) => {
      if (s.mode === prev.mode && s.lines === prev.lines) return;
      if (current?.pick !== pick || !modeWantsSplit(heatModeFor(s.mode, s.lines))) return;
      current.unsubscribe?.();
      current.unsubscribe = undefined;
      void startPickTileHeat(engine, files, mapping, preview, share, true, false, maxRows);
    });
  }
  return true;
}

/**
 * A session member: follows the host's tile heat (the `heattiles` document) by
 * its key through the session's gateway, or stops when the host does. The
 * host's own window draws from its files and is left alone.
 */
export async function followSessionTiles(engine: TileEngine, doc: Partial<TileHeatShare>, at: { origin: string; token: string } | null): Promise<void> {
  if (current?.share) return;
  if (!doc.key || !at) {
    if (current && useTileHeat.getState().from === 'session') stopTileHeat();
    return;
  }
  if (current && current.following === doc.key) return;
  const { heatTileTransport } = await import('./transport');
  const endpoint = { url: `${at.origin}/v1`, key: '', bearer: at.token };
  if (current?.share) return;
  startTileHeat(engine, heatTileTransport(endpoint, { key: doc.key }), { sx: doc.sx ?? 1, sz: doc.sz ?? 1, ground: doc.ground ?? 0 }, 'session');
  if (current) current.following = doc.key;
}

export function tileHeatSource(): HeatTileSource | null {
  return current?.src ?? null;
}
