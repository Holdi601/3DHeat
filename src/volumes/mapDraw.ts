/**
 * The volumes on the 2D map: each visible volume's footprint in its colour, the
 * selected one's handles, the shape being drawn; and the gestures' host for a
 * top-down map (no height handles: the map cannot show height).
 */

import type { Dataset } from '../state/types';
import type { GestureHost, VolumeGestures } from './gestures';
import { boxCorners, regularPolygon, type Vec2, type Vec3, type Volume, type VolumeShape } from './volume';

/** A shape's footprint outline (x, z). */
export function footprintOutline(s: VolumeShape): Vec2[] {
  switch (s.kind) {
    case 'box':
      return boxCorners(s)
        .slice(0, 4)
        .map((p) => [p[0], p[2]] as Vec2);
    case 'prism':
      return s.points;
    case 'cylinder':
      return regularPolygon(s.x, s.z, s.radius, s.radius, 48);
    case 'sphere':
      return regularPolygon(s.center[0], s.center[2], s.radius, s.radius, 48);
  }
}

/** The gestures' host for a map drawn by `toMap` / `fromMap`, at the data's floor. */
export function mapHost(
  toMap: (x: number, z: number) => [number, number] | null,
  fromMap: (px: number, py: number) => [number, number] | null,
  dataset: () => Dataset | null,
): GestureHost {
  const floor = () => dataset()?.bounds.minY ?? 0;
  return {
    ground: (sx, sy) => {
      const p = fromMap(sx, sy);
      return p ? [p[0], floor(), p[1]] : null;
    },
    plane: (sx, sy, y) => {
      const p = fromMap(sx, sy);
      return p ? [p[0], y, p[1]] : null;
    },
    toScreen: (p: Vec3) => toMap(p[0], p[2]),
    dataset,
  };
}

export function drawVolumesOnMap(
  g: CanvasRenderingContext2D,
  volumes: readonly Volume[],
  selected: string | null,
  gest: VolumeGestures,
  toMap: (x: number, z: number) => [number, number],
): void {
  const ring = (pts: Vec2[], color: string, width: number, fill: boolean, dash = false) => {
    if (pts.length < 2) return;
    g.beginPath();
    pts.forEach((p, i) => {
      const [x, y] = toMap(p[0], p[1]);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.closePath();
    g.setLineDash(dash ? [4, 3] : []);
    if (fill) {
      g.globalAlpha = 0.12;
      g.fillStyle = color;
      g.fill();
      g.globalAlpha = 1;
    }
    g.strokeStyle = color;
    g.lineWidth = width;
    g.stroke();
    g.setLineDash([]);
  };
  let sel: Volume | null = null;
  for (const v of volumes) {
    if (!v.visible) continue;
    if (v.id === selected) sel = v;
    ring(footprintOutline(v.shape), v.color, v.id === selected ? 2.5 : 1.5, true, v.op === 'exclude');
  }
  const draft = gest.draft();
  if (draft) ring(footprintOutline(draft), '#ffffff', 1.5, false, true);
  for (const p of gest.polygonPoints()) {
    const [x, y] = toMap(p[0], p[2]);
    g.fillStyle = '#ffffff';
    g.fillRect(x - 3, y - 3, 6, 6);
  }
  if (!sel) return;
  for (const h of gest.handles(sel)) {
    const [x, y] = toMap(h.at[0], h.at[2]);
    const hot = gest.hover?.kind === h.kind && gest.hover.index === h.index;
    g.fillStyle = h.kind === 'rotate' ? '#4ff2ff' : '#ffffff';
    g.strokeStyle = 'rgba(0,0,0,0.7)';
    g.lineWidth = 1;
    const r = hot ? 5 : 3.5;
    g.beginPath();
    if (h.kind === 'move') g.arc(x, y, r, 0, Math.PI * 2);
    else g.rect(x - r, y - r, r * 2, r * 2);
    g.fill();
    g.stroke();
  }
}
