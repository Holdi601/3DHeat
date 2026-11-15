/**
 * A figure rendered to a few pixels, the way it looks at replay distance: a
 * small software rasteriser (depth-tested triangles, lit by one light from
 * above and in front, two by two samples a pixel) for checks that compare
 * figures by what reaches the eye - colour and shape together. Not on any
 * frame path; tests and local tools use it.
 */

import type { Template } from './kit';
import type { Rgb } from '../race/geometry';
import { viewBasis } from './silhouette';

export interface Pixels {
  w: number;
  h: number;
  /** Linear-ish display colours, 0..1, three a pixel; the background where nothing covers. */
  rgb: Float32Array;
  /** Share of each pixel the figure covers, 0..1. */
  cover: Float32Array;
}

/** The viewer's dark background. */
export const BACKGROUND: Rgb = [0.13, 0.13, 0.14];

/** The views a replay is watched from: straight down (forward up the image), and three-quarters from above in front. */
export const REPLAY_VIEWS = {
  top: [0, -1, 0] as [number, number, number],
  threeQuarter: [-0.5, -0.7071, -0.5] as [number, number, number],
};

const LIGHT = (() => {
  const l = [0.4, 0.8, 0.45];
  const n = Math.hypot(l[0], l[1], l[2]);
  return l.map((v) => v / n);
})();

/**
 * Renders `t` seen along `dir` (template frame: x forward, y up, z right) at
 * `metresPerPixel`, into a `size` by `size` image centred on the figure's
 * origin plus `lift` metres up (the middle of a standing person); team parts
 * take `team`.
 */
export function rasterise(t: Template, dir: [number, number, number], metresPerPixel: number, size: number, team: Rgb, lift = 0.9): Pixels {
  const ss = 2;
  const W = size * ss;
  const top = dir[1] < -0.999;
  // Straight down, forward is up the image; otherwise the silhouettes' basis.
  const basis = top ? { right: [0, 0, 1] as const, up: [1, 0, 0] as const } : viewBasis(dir);
  const { right, up } = basis;
  const cx = top ? 0 : 0 * right[0] + lift * right[1];
  const cy = top ? 0 : lift * up[1];
  const k = 1 / (metresPerPixel / ss);
  const col = new Float32Array(W * W * 3);
  const depth = new Float32Array(W * W).fill(-Infinity);
  const hit = new Uint8Array(W * W);
  const parts: [Float32Array, Float32Array | undefined, boolean][] = [[t.fixed, t.fixedN, false], [t.team, t.teamN, true]];
  for (const [d, nrm, isTeam] of parts) {
    for (let i = 0; i + 20 < d.length; i += 21) {
      if (d[i + 6] < 0.5) continue;
      const sx: number[] = [];
      const sy: number[] = [];
      const sz: number[] = [];
      for (let v = 0; v < 3; v++) {
        const o = i + v * 7;
        const x = d[o];
        const y = d[o + 1];
        const z = d[o + 2];
        sx.push(((x * right[0] + y * right[1] + z * right[2]) - cx) * k + W / 2);
        sy.push(W / 2 - ((x * up[0] + y * up[1] + z * up[2]) - cy) * k);
        sz.push(-(x * dir[0] + y * dir[1] + z * dir[2]));
      }
      // The triangle's colour: its corners' average, lit by the first corner's normal.
      const tri = i / 21;
      let lit = 1;
      if (nrm) {
        const nx = nrm[tri * 12];
        const ny = nrm[tri * 12 + 1];
        const nz = nrm[tri * 12 + 2];
        if (nx || ny || nz) lit = 0.55 + 0.45 * Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      }
      const c: number[] = [0, 0, 0];
      for (let ch = 0; ch < 3; ch++) {
        const avg = (d[i + 3 + ch] + d[i + 10 + ch] + d[i + 17 + ch]) / 3;
        c[ch] = Math.min(1, avg * (isTeam ? team[ch] : 1) * lit);
      }
      const area = (sx[1] - sx[0]) * (sy[2] - sy[0]) - (sy[1] - sy[0]) * (sx[2] - sx[0]);
      if (Math.abs(area) < 1e-9) continue;
      const x0 = Math.max(0, Math.floor(Math.min(sx[0], sx[1], sx[2])));
      const x1 = Math.min(W - 1, Math.ceil(Math.max(sx[0], sx[1], sx[2])));
      const y0 = Math.max(0, Math.floor(Math.min(sy[0], sy[1], sy[2])));
      const y1 = Math.min(W - 1, Math.ceil(Math.max(sy[0], sy[1], sy[2])));
      for (let py = y0; py <= y1; py++) {
        for (let px = x0; px <= x1; px++) {
          const qx = px + 0.5;
          const qy = py + 0.5;
          const w0 = ((sx[1] - qx) * (sy[2] - qy) - (sy[1] - qy) * (sx[2] - qx)) / area;
          const w1 = ((sx[2] - qx) * (sy[0] - qy) - (sy[2] - qy) * (sx[0] - qx)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          const z = w0 * sz[0] + w1 * sz[1] + w2 * sz[2];
          const p = py * W + px;
          if (z <= depth[p]) continue;
          depth[p] = z;
          hit[p] = 1;
          col[p * 3] = c[0];
          col[p * 3 + 1] = c[1];
          col[p * 3 + 2] = c[2];
        }
      }
    }
  }
  // Down to the image, two by two samples a pixel.
  const rgb = new Float32Array(size * size * 3);
  const cover = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let n = 0;
      const acc = [0, 0, 0];
      for (let j = 0; j < ss; j++) {
        for (let i = 0; i < ss; i++) {
          const p = (y * ss + j) * W + x * ss + i;
          for (let ch = 0; ch < 3; ch++) acc[ch] += hit[p] ? col[p * 3 + ch] : BACKGROUND[ch];
          n += hit[p];
        }
      }
      const q = y * size + x;
      for (let ch = 0; ch < 3; ch++) rgb[q * 3 + ch] = acc[ch] / (ss * ss);
      cover[q] = n / (ss * ss);
    }
  }
  return { w: size, h: size, rgb, cover };
}

/** sRGB (0..1) to OKLab. */
export function oklab(r: number, g: number, b: number): [number, number, number] {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

/**
 * How different two renders look: the mean OKLab distance (x100) over the
 * pixels either covers, and the coverage's overlap (IoU, by share covered).
 */
export function pixelDistance(a: Pixels, b: Pixels): { deltaE: number; iou: number } {
  let sum = 0;
  let n = 0;
  let inter = 0;
  let union = 0;
  for (let q = 0; q < a.cover.length; q++) {
    const ca = a.cover[q];
    const cb = b.cover[q];
    if (ca <= 0 && cb <= 0) continue;
    inter += Math.min(ca, cb);
    union += Math.max(ca, cb);
    const la = oklab(a.rgb[q * 3], a.rgb[q * 3 + 1], a.rgb[q * 3 + 2]);
    const lb = oklab(b.rgb[q * 3], b.rgb[q * 3 + 1], b.rgb[q * 3 + 2]);
    sum += Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]);
    n++;
  }
  return { deltaE: n ? (sum / n) * 100 : 0, iou: union ? inter / union : 1 };
}
