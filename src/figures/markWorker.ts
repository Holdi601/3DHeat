/**
 * Puts hit marks onto a figure off the main thread (`hitmarks.ts`): builds
 * the figure, snaps the points onto its surface (`snap.ts`) and answers with
 * them and the figure's main turret; or finds the scale a battle's points
 * are in (`fitScale`) from the figures hit most. A figure is built once.
 */
import { CATALOG, figurePackReady } from './catalog';
import { loadPackFigures } from './figurepack';
import type { Template } from './kit';
import { fitScale, reachOf, snapToFigure } from './snap';
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
  /** Per point the part it struck (`HitPart`), where known. */
  on?: Uint8Array;
  scale?: number;
  fit?: { figure: string; pts: Float32Array; dir: Float32Array }[];
}

self.onmessage = async (e: MessageEvent<Ask>) => {
  const { id, figure, pts, yaw, dir, on, scale, fit } = e.data;
  // The figures as the model worker draws them: a local figure pack's (`figurepack.ts`) when there is one.
  await figurePackReady;
  await loadPackFigures(fit ? fit.map((f) => f.figure) : [figure]);
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
  let reach: number | undefined;
  try {
    const t = figureOf(figure);
    if (t) {
      box = turretOf(t);
      snapped = snapToFigure(t, pts, yaw, dir, scale ?? 1, on);
      reach = reachOf(t);
    }
  } catch {
    // A figure that fails to build leaves its marks where the data says.
  }
  (self as unknown as Worker).postMessage({ id, box, snapped, reach }, snapped ? [snapped.buffer] : []);
};
