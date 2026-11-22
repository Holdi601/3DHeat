/**
 * Which heat tiles a view needs: LOD rings about the camera. A tile is split
 * into its four children while one of its cells would cover more than
 * `cellPx` pixels where it is nearest the camera, so tiles get finer towards
 * the eye and coarser towards the horizon; tiles outside the frustum are
 * dropped. Bounded: at most `maxTiles`, the largest on screen refined first.
 *
 * With a heat kernel (`kernel`) a tile is not split once its children's cells
 * would be smaller than the sprite's radius over `KERNEL_CELLS`: the tiles are
 * drawn convolved with the sprite (`kernelRadius`), which smooths away any
 * detail finer than that, and the draw reads at most a few cells each way.
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
  /** The heat sprite the tiles are drawn with, when they are (see `kernelRadius`). */
  kernel?: SpriteSize;
}

/** A heat sprite's size as the rows' splat draws it: a world radius, clamped to a pixel range on screen. */
export interface SpriteSize {
  radius: number;
  minPx: number;
  /** 0: no upper clamp. */
  maxPx: number;
}

/** Cells per sprite radius the LOD refines to, at most. */
export const KERNEL_CELLS = 4;

/**
 * The world radius a sprite is drawn with at view depth `depth` (parallel:
 * any): its pixel radius clamped as the splat clamps it, back in world units.
 */
export function kernelRadius(k: SpriteSize, pxPerUnit: number, perspective: boolean, depth: number): number {
  const d = perspective ? Math.max(1e-6, depth) : 1;
  const px = (k.radius * pxPerUnit) / d;
  const clamped = Math.max(k.minPx, k.maxPx > 0 ? Math.min(k.maxPx, px) : px);
  return (clamped * d) / Math.max(1e-12, pxPerUnit);
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

/** A rectangle's nearest and farthest distance from the eye (parallel: 1 and 1). */
export function rectDepths(r: readonly number[], ground: number, v: Pick<LodView, 'cameraPos' | 'perspective'>): [number, number] {
  if (!v.perspective) return [1, 1];
  const e = v.cameraPos;
  const dy = e[1] - ground;
  const dx = Math.max(r[0] - e[0], 0, e[0] - r[2]);
  const dz = Math.max(r[1] - e[2], 0, e[2] - r[3]);
  const fx = Math.max(Math.abs(r[0] - e[0]), Math.abs(r[2] - e[0]));
  const fz = Math.max(Math.abs(r[1] - e[2]), Math.abs(r[3] - e[2]));
  return [Math.max(1e-6, Math.hypot(dx, dy, dz)), Math.max(1e-6, Math.hypot(fx, dy, fz))];
}

/**
 * Pixels one cell of `t` covers where the tile is nearest the eye, and
 * whether its children's cells would still be no finer than the kernel needs.
 */
function cellPixels(p: PyramidFrame, place: TilePlacement, v: LodView, t: TileRef): { px: number; finer: boolean } {
  const r = tileWorldRect(p, place, t);
  const cell = (r[2] - r[0]) / TILE;
  const d = rectDepths(r, place.ground, v)[0];
  const px = v.perspective ? (cell / d) * v.pxPerUnit : cell * v.pxPerUnit;
  const finer = !v.kernel || cell / 2 >= kernelRadius(v.kernel, v.pxPerUnit, v.perspective, d) / KERNEL_CELLS;
  return { px, finer };
}

/** The tiles to draw, coarsest first. */
export function selectTiles(p: PyramidFrame, place: TilePlacement, v: LodView): TileRef[] {
  const open: { t: TileRef; px: number; finer: boolean }[] = [];
  const done: TileRef[] = [];
  const visible = (t: TileRef) => !outside(v.viewProj, tileWorldRect(p, place, t), place.ground);
  const root = { level: 0, x: 0, y: 0 };
  if (!visible(root)) return [];
  open.push({ t: root, ...cellPixels(p, place, v, root) });
  while (open.length > 0) {
    // The tile largest on screen next.
    let k = 0;
    for (let i = 1; i < open.length; i++) if (open[i].px > open[k].px) k = i;
    const { t, px, finer } = open[k];
    open[k] = open[open.length - 1];
    open.pop();
    if (px <= v.cellPx || !finer || t.level >= p.leafLevel || done.length + open.length + 4 > v.maxTiles) {
      done.push(t);
      continue;
    }
    for (let c = 0; c < 4; c++) {
      const ch = {
        level: t.level + 1,
        x: t.x * 2 + (c & 1),
        y: t.y * 2 + (c >> 1),
      };
      if (visible(ch)) open.push({ t: ch, ...cellPixels(p, place, v, ch) });
    }
  }
  done.sort((a, b) => a.level - b.level);
  return done;
}
