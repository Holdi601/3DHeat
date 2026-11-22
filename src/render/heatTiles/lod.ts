/**
 * Which heat tiles a view needs: LOD rings about the camera. A tile is split
 * into its four children while one of its cells would cover more than
 * `cellPx` pixels where it is nearest the camera, so tiles get finer towards
 * the eye and coarser towards the horizon; tiles outside the frustum are
 * dropped. Bounded: at most `maxTiles`, the largest on screen refined first.
 */

import { TILE } from './tileFormat';

export interface PyramidFrame {
  /** The square the pyramid covers, in its two columns' units. */
  x0: number;
  y0: number;
  size: number;
  leafLevel: number;
}

/** Data columns (u, v) to world X / Z: `X = sx * u`, `Z = sz * v`; the tiles lie at world Y `ground`. */
export interface TilePlacement {
  sx: number;
  sz: number;
  ground: number;
}

export interface LodView {
  viewProj: Float32Array;
  cameraPos: Float32Array;
  perspective: boolean;
  /** Pixels per world unit at distance 1 (perspective) or on screen (parallel). */
  pxPerUnit: number;
  cellPx: number;
  maxTiles: number;
}

export interface TileRef {
  level: number;
  x: number;
  y: number;
}

/** A tile's square in world X / Z (min, max). */
export function tileWorldRect(p: PyramidFrame, place: TilePlacement, t: TileRef): [number, number, number, number] {
  const s = p.size / (1 << t.level);
  const u0 = p.x0 + t.x * s;
  const v0 = p.y0 + t.y * s;
  const a = place.sx * u0;
  const b = place.sx * (u0 + s);
  const c = place.sz * v0;
  const d = place.sz * (v0 + s);
  return [Math.min(a, b), Math.min(c, d), Math.max(a, b), Math.max(c, d)];
}

/** Whether the rectangle is outside one plane of the frustum (all corners beyond it). */
function outside(vp: Float32Array, r: [number, number, number, number], y: number): boolean {
  let l = 0;
  let rr = 0;
  let b = 0;
  let t = 0;
  let n = 0;
  for (let i = 0; i < 4; i++) {
    const x = i & 1 ? r[2] : r[0];
    const z = i & 2 ? r[3] : r[1];
    const cx = vp[0] * x + vp[4] * y + vp[8] * z + vp[12];
    const cy = vp[1] * x + vp[5] * y + vp[9] * z + vp[13];
    const cw = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
    if (cx < -cw) l++;
    if (cx > cw) rr++;
    if (cy < -cw) b++;
    if (cy > cw) t++;
    if (cw <= 0) n++;
  }
  return l === 4 || rr === 4 || b === 4 || t === 4 || n === 4;
}

/** Pixels one cell of `t` covers where the tile is nearest the eye. */
function cellPixels(p: PyramidFrame, place: TilePlacement, v: LodView, t: TileRef): number {
  const r = tileWorldRect(p, place, t);
  const cell = (r[2] - r[0]) / TILE;
  if (!v.perspective) return cell * v.pxPerUnit;
  const e = v.cameraPos;
  const dx = Math.max(r[0] - e[0], 0, e[0] - r[2]);
  const dz = Math.max(r[1] - e[2], 0, e[2] - r[3]);
  const dy = e[1] - place.ground;
  const d = Math.max(1e-6, Math.hypot(dx, dy, dz));
  return (cell / d) * v.pxPerUnit;
}

/** The tiles to draw, coarsest first. */
export function selectTiles(p: PyramidFrame, place: TilePlacement, v: LodView): TileRef[] {
  const open: { t: TileRef; px: number }[] = [];
  const done: TileRef[] = [];
  const visible = (t: TileRef) => !outside(v.viewProj, tileWorldRect(p, place, t), place.ground);
  const root = { level: 0, x: 0, y: 0 };
  if (!visible(root)) return [];
  open.push({ t: root, px: cellPixels(p, place, v, root) });
  while (open.length > 0) {
    // The tile largest on screen next.
    let k = 0;
    for (let i = 1; i < open.length; i++) if (open[i].px > open[k].px) k = i;
    const { t, px } = open[k];
    open[k] = open[open.length - 1];
    open.pop();
    if (px <= v.cellPx || t.level >= p.leafLevel || done.length + open.length + 4 > v.maxTiles) {
      done.push(t);
      continue;
    }
    for (let c = 0; c < 4; c++) {
      const ch = {
        level: t.level + 1,
        x: t.x * 2 + (c & 1),
        y: t.y * 2 + (c >> 1),
      };
      if (visible(ch)) open.push({ t: ch, px: cellPixels(p, place, v, ch) });
    }
  }
  done.sort((a, b) => a.level - b.level);
  return done;
}
