/**
 * What both backends' direction fields share (see webgl2/dirField.ts): the
 * arrow's vertex count and how many cells a heat buffer is divided into.
 */

/** A shaft of two triangles and a head of one. */
export const FIELD_ARROW_VERTS = 9;

/**
 * Cells across and down for a heat buffer of `hw` x `hh` texels and a cell
 * `cellTexels` texels wide. At least one each way, and capped so a tiny
 * spacing on a huge canvas stays a small target.
 */
export function fieldCells(hw: number, hh: number, cellTexels: number): [number, number] {
  const c = Math.max(2, cellTexels);
  return [Math.min(1024, Math.max(1, Math.round(hw / c))), Math.min(1024, Math.max(1, Math.round(hh / c)))];
}
