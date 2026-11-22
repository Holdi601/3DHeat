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
}

const OFF: TileHeatState = { on: false, from: null, level: -1, leaf: 0, rows: 0, fraction: 0, complete: false, bytes: 0, error: '', key: '' };

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

let current: { src: HeatTileSource; engine: TileEngine; timer: ReturnType<typeof setInterval>; share: TileHeatShare | null; following: string } | null = null;

/** The shared document's state: the host's pyramid while it draws one, else nothing. */
export const useTileHeatShare = create<{ doc: Partial<TileHeatShare> }>(() => ({ doc: {} }));

function publish(src: HeatTileSource, from: 'files' | 'session'): void {
  const i = src.info;
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
  };
  const was = useTileHeat.getState();
  if ((Object.keys(next) as (keyof TileHeatState)[]).some((k) => next[k] !== was[k])) useTileHeat.setState(next);
}

/**
 * Draws heat from `transport`'s pyramid, replacing any tile heat before; the
 * camera frames the pyramid once its square is known. `share` puts it in the
 * session document for the members (files only).
 */
export function startTileHeat(engine: TileEngine, transport: TileTransport, place: TilePlacement, from: 'files' | 'session', share = false): HeatTileSource {
  stopTileHeat();
  const src = new HeatTileSource(transport, place, {}, () => engine.invalidate(1));
  let framed = false;
  const tick = () => {
    if (current?.src !== src) return;
    const i = src.info;
    if (!framed && i && i.key && i.size > 0) {
      framed = true;
      const cx = place.sx * (i.x0 + i.size / 2);
      const cz = place.sz * (i.y0 + i.size / 2);
      engine.frameAround(cx, place.ground, cz, (Math.abs(place.sx) * i.size) / 2);
      if (current.share) useTileHeatShare.setState({ doc: { ...current.share, key: i.key } });
    }
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
  current.src.dispose();
  if (current.engine.heatTiles() === current.src) current.engine.setHeatTiles(null);
  if (current.share) useTileHeatShare.setState({ doc: {} });
  current = null;
  useTileHeat.setState({ ...OFF });
}

/** The two horizontal columns, and where the data's plane lies in the world (as `remapAxesInPlace` puts rows). */
export function tilePlacement(mapping: ColumnMapping, preview: SourcePreview | null): { x: string; y: string; place: TilePlacement } | null {
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
  // The ground under the heat: the lowest height in the file's sample (rows give it exactly; tiles have none).
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
  return { x, y, place: { sx, sz, ground } };
}

/** Whether a pick can be drawn from tiles: the native app's core, Parquet tables, both horizontal columns. */
export function tilesPossible(native: boolean, preview: SourcePreview | null, mapping: ColumnMapping | null): boolean {
  return native && preview?.format === 'parquet' && !!mapping && !!tilePlacement(mapping, preview);
}

/** The core's query for a pick: its files by token, the horizontal columns, the load's pre-filter. */
export async function pickQuery(files: File[], mapping: ColumnMapping, preview: SourcePreview | null, share: boolean): Promise<{ query: HeatTileQueryInit; place: TilePlacement } | null> {
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
    },
    place: p.place,
  };
}

/** Heat from tiles for a pick, on this computer's core. False when it cannot be. */
export async function startPickTileHeat(engine: TileEngine, files: File[], mapping: ColumnMapping, preview: SourcePreview | null, share: boolean): Promise<boolean> {
  const q = await pickQuery(files, mapping, preview, share);
  if (!q) return false;
  const { coreEndpoint } = await import('../../data/native/core');
  const { heatTileTransport } = await import('./transport');
  startTileHeat(engine, heatTileTransport(await coreEndpoint(), q.query), q.place, 'files', share);
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
