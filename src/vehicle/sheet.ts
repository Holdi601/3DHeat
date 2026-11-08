/**
 * The vehicle heatmap flat, for print: the heat-painted figure seen square
 * from its six sides - left, right, top, bottom, front, rear - all at one
 * scale, so a side's heat can be compared with another's and measured.
 *
 * Drawn by a small rasteriser of its own (a depth buffer, colours blended
 * across each triangle) into an `ImageData`, so the result is the same in
 * every browser and on paper, and the thousands of small triangles of the
 * heat mesh leave no seams between them as a canvas path fill would.
 */

import type { Vec3 } from '../race/geometry';

export type SheetSide = 'left' | 'right' | 'top' | 'bottom' | 'front' | 'rear';

export const SIDES: SheetSide[] = ['left', 'right', 'top', 'bottom', 'front', 'rear'];

/**
 * How a side looks at the figure (x forward, y up, z right): the axis and
 * sign for the image's u (right) and v (up), and the way the eye looks.
 */
const VIEW: Record<SheetSide, { u: [number, number]; v: [number, number]; look: [number, number] }> = {
  // Seen from its left: the nose to the left of the picture.
  left: { u: [0, -1], v: [1, 1], look: [2, 1] },
  right: { u: [0, 1], v: [1, 1], look: [2, -1] },
  // From above, the nose up the picture.
  top: { u: [2, 1], v: [0, 1], look: [1, -1] },
  bottom: { u: [2, -1], v: [0, 1], look: [1, 1] },
  front: { u: [2, -1], v: [1, 1], look: [0, -1] },
  rear: { u: [2, 1], v: [1, 1], look: [0, 1] },
};

/** A side's extent in metres: width and height of the picture. */
export function sideExtent(side: SheetSide, min: Vec3, max: Vec3): [number, number] {
  const v = VIEW[side];
  return [max[v.u[0]] - min[v.u[0]], max[v.v[0]] - min[v.v[0]]];
}

/**
 * Draws one side into `img` at (x0, y0), `scale` pixels a metre, centred in
 * a w x h cell. `pos` and `rgba` are per vertex (a triangle list); only
 * the triangles facing the eye are drawn, the nearest wins. `shade`: lit
 * from the eye, so a surface turning away darkens a little and the form
 * reads on paper (0 leaves the colours as they are). `outline`: a dark line
 * round the figure and along steps in depth.
 */
export function drawSide(
  img: { data: Uint8ClampedArray; width: number; height: number },
  side: SheetSide,
  pos: Float32Array,
  nrm: Float32Array,
  rgba: Float32Array,
  count: number,
  min: Vec3,
  max: Vec3,
  cell: { x: number; y: number; w: number; h: number },
  scale: number,
  shade = 0,
  outline = false,
): void {
  const v = VIEW[side];
  const [ua, us] = v.u;
  const [va, vs] = v.v;
  const [la, ls] = v.look;
  const cu = (min[ua] + max[ua]) / 2;
  const cv = (min[va] + max[va]) / 2;
  const ox = cell.x + cell.w / 2;
  const oy = cell.y + cell.h / 2;
  const W = img.width;
  const depth = new Float32Array(cell.w * cell.h).fill(Infinity);
  const sx = new Float32Array(3), sy = new Float32Array(3), sz = new Float32Array(3);
  const data = img.data;
  for (let t = 0; t + 2 < count; t += 3) {
    // Facing the eye: the normal against the way it looks.
    const nf = (nrm[t * 3 + la] + nrm[(t + 1) * 3 + la] + nrm[(t + 2) * 3 + la]) * ls;
    if (nf >= 0) continue;
    // A see-through part (a propeller's disc) would hide what it is seen through.
    if (rgba[t * 4 + 3] + rgba[(t + 1) * 4 + 3] + rgba[(t + 2) * 4 + 3] < 1.5) continue;
    for (let k = 0; k < 3; k++) {
      const i = (t + k) * 3;
      sx[k] = ox + (pos[i + ua] - cu) * us * scale;
      sy[k] = oy - (pos[i + va] - cv) * vs * scale;
      // Nearer the eye is smaller.
      sz[k] = pos[i + la] * ls;
    }
    const area = (sx[1] - sx[0]) * (sy[2] - sy[0]) - (sx[2] - sx[0]) * (sy[1] - sy[0]);
    if (Math.abs(area) < 1e-9) continue;
    const x0 = Math.max(cell.x, Math.floor(Math.min(sx[0], sx[1], sx[2])));
    const x1 = Math.min(cell.x + cell.w - 1, Math.ceil(Math.max(sx[0], sx[1], sx[2])));
    const y0 = Math.max(cell.y, Math.floor(Math.min(sy[0], sy[1], sy[2])));
    const y1 = Math.min(cell.y + cell.h - 1, Math.ceil(Math.max(sy[0], sy[1], sy[2])));
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const fx = px + 0.5, fy = py + 0.5;
        // Barycentric weights; a pixel centre on an edge belongs to both triangles, so none is left empty.
        const w0 = ((sx[1] - fx) * (sy[2] - fy) - (sx[2] - fx) * (sy[1] - fy)) / area;
        const w1 = ((sx[2] - fx) * (sy[0] - fy) - (sx[0] - fx) * (sy[2] - fy)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
        const z = w0 * sz[0] + w1 * sz[1] + w2 * sz[2];
        const di = (py - cell.y) * cell.w + (px - cell.x);
        if (z >= depth[di]) continue;
        depth[di] = z;
        const o = (py * W + px) * 4;
        const c0 = t * 4, c1 = (t + 1) * 4, c2 = (t + 2) * 4;
        const k = shade > 0 ? 1 - shade + shade * Math.min(1, -(w0 * nrm[t * 3 + la] + w1 * nrm[(t + 1) * 3 + la] + w2 * nrm[(t + 2) * 3 + la]) * ls) : 1;
        data[o] = 255 * k * (w0 * rgba[c0] + w1 * rgba[c1] + w2 * rgba[c2]);
        data[o + 1] = 255 * k * (w0 * rgba[c0 + 1] + w1 * rgba[c1 + 1] + w2 * rgba[c2 + 1]);
        data[o + 2] = 255 * k * (w0 * rgba[c0 + 2] + w1 * rgba[c1 + 2] + w2 * rgba[c2 + 2]);
        data[o + 3] = 255;
      }
    }
  }
  if (outline) outlineCell(data, W, depth, cell, (max[la] - min[la]) * 0.04);
}

/**
 * A dark line where the figure ends and where one part stands well in front
 * of another (a step in depth): the shape reads on white paper even where
 * the heat runs to the ramp's white end.
 */
function outlineCell(data: Uint8ClampedArray, W: number, depth: Float32Array, cell: { x: number; y: number; w: number; h: number }, step: number): void {
  const { w, h } = cell;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = depth[y * w + x];
      if (d === Infinity) continue;
      let edge = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        const n = nx < 0 || ny < 0 || nx >= w || ny >= h ? Infinity : depth[ny * w + nx];
        // The nearer of the two pixels draws the line, so it is one pixel wide.
        if (n === Infinity || n - d > step) {
          edge = true;
          break;
        }
      }
      if (!edge) continue;
      const o = ((cell.y + y) * W + cell.x + x) * 4;
      data[o] = data[o] * 0.25 + 30;
      data[o + 1] = data[o + 1] * 0.25 + 32;
      data[o + 2] = data[o + 2] * 0.25 + 36;
    }
  }
}

/** The scale (pixels a metre) at which every side fits its cell. */
export function sheetScale(min: Vec3, max: Vec3, cellW: number, cellH: number, margin = 0.9): number {
  let s = Infinity;
  for (const side of SIDES) {
    const [w, h] = sideExtent(side, min, max);
    s = Math.min(s, (cellW * margin) / Math.max(w, 1e-3), (cellH * margin) / Math.max(h, 1e-3));
  }
  return s;
}

/** Positions and colours out of a vertex buffer's xyzrgba layout, as `drawSide` takes them. */
export function splitVertices(data: Float32Array, count: number): { pos: Float32Array; rgba: Float32Array } {
  const pos = new Float32Array(count * 3);
  const rgba = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = data[i * 7];
    pos[i * 3 + 1] = data[i * 7 + 1];
    pos[i * 3 + 2] = data[i * 7 + 2];
    rgba[i * 4] = data[i * 7 + 3];
    rgba[i * 4 + 1] = data[i * 7 + 4];
    rgba[i * 4 + 2] = data[i * 7 + 5];
    rgba[i * 4 + 3] = data[i * 7 + 6];
  }
  return { pos, rgba };
}
