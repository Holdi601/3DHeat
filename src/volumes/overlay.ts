/**
 * The volumes as overlay lines on the 3D view: each visible volume's outline in
 * its colour, the selected one brighter with its handles, and the shape being
 * drawn in white. Seven floats a vertex (xyz, rgba), pairs of vertices a line:
 * the ruler's layout (render/measure.ts), so it rides the same overlay pass.
 */

import { OVERLAY_STRIDE } from '../render/measure';
import { hexToRgb, volumeEdges, type Handle, type Vec3, type Volume, type VolumeShape } from './volume';

export interface VolumeOverlayInput {
  volumes: readonly Volume[];
  selected: string | null;
  handles: readonly Handle[];
  hover: Handle | null;
  draft: VolumeShape | null;
  polygon: readonly Vec3[];
  /** World size of a handle marker at a point: a fixed fraction of its distance, so it reads the same on screen. */
  markerSize: (p: Vec3) => number;
}

export function appendVolumeOverlay(
  data: Float32Array,
  count: number,
  input: VolumeOverlayInput,
): { data: Float32Array; count: number } {
  const lines: number[] = [];
  const seg = (a: Vec3, b: Vec3, c: Vec3, alpha: number) => {
    lines.push(a[0], a[1], a[2], c[0], c[1], c[2], alpha, b[0], b[1], b[2], c[0], c[1], c[2], alpha);
  };
  for (const v of input.volumes) {
    if (!v.visible) continue;
    const on = v.id === input.selected;
    const rgb = hexToRgb(v.color);
    // Excluding volumes are drawn dimmer, so the two roles read apart at a glance.
    const alpha = on ? 1 : v.op === 'exclude' ? 0.45 : 0.75;
    for (const [a, b] of volumeEdges(v.shape)) seg(a, b, rgb, alpha);
  }
  if (input.draft) for (const [a, b] of volumeEdges(input.draft)) seg(a, b, [1, 1, 1], 0.9);
  const marker = (p: Vec3, c: Vec3, alpha: number, big: boolean) => {
    const s = input.markerSize(p) * (big ? 1.6 : 1);
    // A small diamond on the ground plane and a vertical tick: findable from any side.
    const n: Vec3 = [p[0], p[1], p[2] - s];
    const e: Vec3 = [p[0] + s, p[1], p[2]];
    const so: Vec3 = [p[0], p[1], p[2] + s];
    const w: Vec3 = [p[0] - s, p[1], p[2]];
    seg(n, e, c, alpha);
    seg(e, so, c, alpha);
    seg(so, w, c, alpha);
    seg(w, n, c, alpha);
    seg([p[0], p[1] - s, p[2]], [p[0], p[1] + s, p[2]], c, alpha);
  };
  for (const h of input.handles) {
    const hot = input.hover !== null && input.hover.kind === h.kind && input.hover.index === h.index;
    const c: Vec3 = h.kind === 'rotate' ? [0.3, 0.95, 1] : h.kind === 'top' || h.kind === 'bottom' ? [1, 0.85, 0.3] : [1, 1, 1];
    marker(h.at, c, hot ? 1 : 0.85, hot);
  }
  for (const p of input.polygon) marker(p, [1, 1, 1], 0.9, false);

  const verts = lines.length / OVERLAY_STRIDE;
  const need = (count + verts) * OVERLAY_STRIDE;
  let out = data;
  if (out.length < need) {
    out = new Float32Array(Math.max(need, out.length * 2));
    out.set(data.subarray(0, count * OVERLAY_STRIDE));
  }
  out.set(lines, count * OVERLAY_STRIDE);
  return { data: out, count: count + verts };
}
