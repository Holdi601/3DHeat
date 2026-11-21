/**
 * Which datasets are made from which.
 *
 * The store's dataset is swapped for reasons other than a load: the figure
 * overlay stands in for the loaded data while its mode is on (match/overlay.ts),
 * the teams are lined up by side (data/teamSides.ts). The view treats a load
 * and such a swap differently - a load frames the new data, a swap keeps the
 * camera where the viewer put it - so a derived dataset says what it was made
 * from here.
 */

import type { Dataset } from './types';

const parents = new WeakMap<Dataset, Dataset>();

/** Records that `derived` was made from `from`. */
export function deriveFrom(derived: Dataset, from: Dataset): void {
  if (derived !== from) parents.set(derived, from);
}

/** The loaded dataset a derived one comes from (itself when it was loaded). */
export function rootOf(d: Dataset): Dataset {
  let at = d;
  for (let i = 0; i < 32; i++) {
    const up = parents.get(at);
    if (!up) break;
    at = up;
  }
  return at;
}

/**
 * Whether two datasets show the same loaded data: one made from the other, or
 * both from one, or a copy sharing its position columns.
 */
export function sameData(a: Dataset | null, b: Dataset | null): boolean {
  if (!a || !b) return false;
  if (a === b || rootOf(a) === rootOf(b)) return true;
  return a.count > 0 && a.px === b.px && a.pz === b.pz;
}
