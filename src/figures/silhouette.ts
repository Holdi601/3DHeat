/**
 * A figure's silhouette from a direction: the solid shape it covers, seen
 * orthographically, as a mask - what the eye goes by first when it tells one
 * type from another. The views are fixed (side, top, front and eight more from
 * a seeded spread, low obliques and from below among them), so a figure can be
 * checked from all round and the same views compared before and after.
 *
 * Faint parts (rotor and propeller discs) are left out: a silhouette is the
 * solid shape.
 */

import type { Template } from './kit';

/** A view: the direction the eye looks along (unit, template frame: x forward, y up, z right) and a name. */
export interface SilView {
  name: string;
  dir: [number, number, number];
}

function unit(x: number, y: number, z: number): [number, number, number] {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

/** Side (from the right), top, front, then eight seeded directions all round, two of them from below. */
export const SIL_VIEWS: SilView[] = (() => {
  const views: SilView[] = [
    { name: 'side', dir: [0, 0, -1] },
    { name: 'top', dir: [0, -1, 0] },
    { name: 'front', dir: [-1, 0, 0] },
  ];
  // A small fixed generator, so the directions never change.
  let s = 20261108;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  // Elevations: two from below, two low obliques, the rest between.
  const elev = [-0.5, -0.25, 0.08, 0.15, 0.35, 0.55, 0.75, 1.0];
  for (let i = 0; i < 8; i++) {
    const az = (i / 8) * Math.PI * 2 + rnd() * 0.6;
    const e = elev[i] + (rnd() - 0.5) * 0.1;
    // Looking towards the figure from (cos az, sin e, sin az) out.
    views.push({ name: `r${i}`, dir: unit(-Math.cos(az) * Math.cos(e), -Math.sin(e), -Math.sin(az) * Math.cos(e)) });
  }
  return views;
})();

/** Two unit vectors across a view direction: screen right and screen up. */
export function viewBasis(dir: [number, number, number]): { right: [number, number, number]; up: [number, number, number] } {
  const d = unit(dir[0], dir[1], dir[2]);
  const helper: [number, number, number] = Math.abs(d[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0];
  // right = d x helper, up = right x d.
  const right = unit(d[1] * helper[2] - d[2] * helper[1], d[2] * helper[0] - d[0] * helper[2], d[0] * helper[1] - d[1] * helper[0]);
  const up = unit(right[1] * d[2] - right[2] * d[1], right[2] * d[0] - right[0] * d[2], right[0] * d[1] - right[1] * d[0]);
  return { right, up };
}

/** A silhouette mask: `size` x `size` cells of `cell` metres, centred on the figure's projected box. */
export interface SilMask {
  size: number;
  cell: number;
  /** 1 where covered, row 0 at the top. */
  mask: Uint8Array;
  /** Covered area, square metres. */
  area: number;
  /** The projected box's width and height, metres. */
  width: number;
  height: number;
}

/**
 * Renders a template's silhouette from a view. `cell` is the metres a cell
 * covers (default: the figure's longest side over 0.9 `size`), so two
 * figures drawn with the same `cell` compare at true size.
 */
export function silhouette(t: Template, view: SilView, size = 128, cell?: number): SilMask {
  const { right, up } = viewBasis(view.dir);
  const pts: number[] = [];
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const d of [t.fixed, t.team]) {
    for (let i = 0; i + 20 < d.length; i += 21) {
      // Faint discs are not the solid shape.
      if (d[i + 6] < 0.5) continue;
      for (let v = 0; v < 3; v++) {
        const o = i + v * 7;
        const px = d[o] * right[0] + d[o + 1] * right[1] + d[o + 2] * right[2];
        const py = d[o] * up[0] + d[o + 1] * up[1] + d[o + 2] * up[2];
        pts.push(px, py);
        if (px < x0) x0 = px;
        if (px > x1) x1 = px;
        if (py < y0) y0 = py;
        if (py > y1) y1 = py;
      }
    }
  }
  const mask = new Uint8Array(size * size);
  const longest = Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.1);
  const c = cell ?? longest / (size * 0.9);
  if (!pts.length) return { size, cell: c, mask, area: 0, width: 0, height: 0 };
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const toX = (x: number) => (x - cx) / c + size / 2;
  const toY = (y: number) => size / 2 - (y - cy) / c;
  for (let t3 = 0; t3 < pts.length; t3 += 6) {
    const ax = toX(pts[t3]), ay = toY(pts[t3 + 1]);
    const bx = toX(pts[t3 + 2]), by = toY(pts[t3 + 3]);
    const qx = toX(pts[t3 + 4]), qy = toY(pts[t3 + 5]);
    const area = (bx - ax) * (qy - ay) - (by - ay) * (qx - ax);
    if (Math.abs(area) < 1e-12) continue;
    const xa = Math.max(0, Math.floor(Math.min(ax, bx, qx)));
    const xb = Math.min(size - 1, Math.ceil(Math.max(ax, bx, qx)));
    const ya = Math.max(0, Math.floor(Math.min(ay, by, qy)));
    const yb = Math.min(size - 1, Math.ceil(Math.max(ay, by, qy)));
    for (let py = ya; py <= yb; py++) {
      for (let px = xa; px <= xb; px++) {
        const sx = px + 0.5, sy = py + 0.5;
        const w0 = ((bx - sx) * (qy - sy) - (by - sy) * (qx - sx)) / area;
        const w1 = ((qx - sx) * (ay - sy) - (qy - sy) * (ax - sx)) / area;
        if (w0 < 0 || w1 < 0 || w0 + w1 > 1) continue;
        mask[py * size + px] = 1;
      }
    }
  }
  let n = 0;
  for (const m of mask) n += m;
  return { size, cell: c, mask, area: n * c * c, width: x1 - x0, height: y1 - y0 };
}

/** Intersection over union of two masks of the same size and cell. */
export function iou(a: Uint8Array, b: Uint8Array): number {
  let i = 0;
  let u = 0;
  for (let k = 0; k < a.length; k++) {
    if (a[k] && b[k]) i++;
    if (a[k] || b[k]) u++;
  }
  return u ? i / u : 1;
}
