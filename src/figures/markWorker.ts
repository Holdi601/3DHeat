/**
 * Puts hit marks onto a figure off the main thread (`hitmarks.ts`): builds
 * the figure, snaps the points onto its surface (`snap.ts`) and answers with
 * them and the figure's main turret. A figure is built once.
 */
import { CATALOG } from './catalog';
import type { Template } from './kit';
import { snapToFigure } from './snap';
import { turretOf } from './turret';

const built = new Map<string, Template | null>();

self.onmessage = (e: MessageEvent<{ id: number; figure: string; pts: Float32Array; yaw: Float32Array; dir: Float32Array }>) => {
  const { id, figure, pts, yaw, dir } = e.data;
  let box = null;
  let snapped: Float32Array | null = null;
  try {
    let t = built.get(figure);
    if (t === undefined) {
      t = CATALOG[figure] ? CATALOG[figure].build() : null;
      built.set(figure, t);
    }
    if (t) {
      box = turretOf(t);
      snapped = snapToFigure(t, pts, yaw, dir);
    }
  } catch {
    // A figure that fails to build leaves its marks where the data says.
  }
  (self as unknown as Worker).postMessage({ id, box, snapped }, snapped ? [snapped.buffer] : []);
};
