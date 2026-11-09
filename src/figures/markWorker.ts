/**
 * Puts hit marks onto a figure off the main thread (`hitmarks.ts`): builds
 * the figure, snaps the points onto its surface (`snap.ts`) and answers with
 * them and the figure's main turret; or finds the scale a battle's points
 * are in (`fitScale`) from the figures hit most. A figure is built once.
 */
import { CATALOG } from './catalog';
import type { Template } from './kit';
import { fitScale, snapToFigure } from './snap';
import { turretOf } from './turret';

const built = new Map<string, Template | null>();

function figureOf(figure: string): Template | null {
  let t = built.get(figure);
  if (t === undefined) {
    t = CATALOG[figure] ? CATALOG[figure].build() : null;
    built.set(figure, t);
  }
  return t;
}

interface Ask {
  id: number;
  figure: string;
  pts: Float32Array;
  yaw: Float32Array;
  dir: Float32Array;
  scale?: number;
  fit?: { figure: string; pts: Float32Array; dir: Float32Array }[];
}

self.onmessage = (e: MessageEvent<Ask>) => {
  const { id, figure, pts, yaw, dir, scale, fit } = e.data;
  if (fit) {
    let s = 1;
    try {
      s = fitScale(fit.flatMap((f) => {
        const t = figureOf(f.figure);
        return t ? [{ t, pts: f.pts, dir: f.dir }] : [];
      }));
    } catch {
      // Figures that fail to build say nothing of the scale.
    }
    (self as unknown as Worker).postMessage({ id, box: null, snapped: null, scale: s });
    return;
  }
  let box = null;
  let snapped: Float32Array | null = null;
  try {
    const t = figureOf(figure);
    if (t) {
      box = turretOf(t);
      snapped = snapToFigure(t, pts, yaw, dir, scale ?? 1);
    }
  } catch {
    // A figure that fails to build leaves its marks where the data says.
  }
  (self as unknown as Worker).postMessage({ id, box, snapped }, snapped ? [snapped.buffer] : []);
};
