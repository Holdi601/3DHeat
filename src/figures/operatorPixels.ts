/**
 * The operators as they look at replay distance (`raster.ts`): each rendered
 * 48 pixels tall from above and from three-quarters, and every pair with how
 * far apart the two look - for the test that every pair reads apart and the
 * local sheet of the closest pairs.
 */

import { CATALOG } from './catalog';
import { buildOperator, OPERATORS, operatorFigureName, operatorSlug } from './operators';
import { SIDE_BAND } from './tactical';
import { pixelDistance, rasterise, REPLAY_VIEWS, type Pixels } from './raster';

/** Replay distance: a standing figure 48 pixels tall. */
export const METRES_PER_PIXEL = 1.8 / 48;
export const IMAGE = 64;
/** The first team's blue, for the team part (the ring's inside). */
export const TEAM: [number, number, number] = [0.25, 0.5, 0.9];
/** Two operators read apart at replay distance when their renders differ by this much (mean OKLab x100) in one view... */
export const APART = 9;
/** ...or their shapes overlap less than this. */
export const SHAPES_APART = 0.75;

export const operatorNames = Object.keys(OPERATORS);
export const figureOf = (n: string) => operatorFigureName(operatorSlug(n), OPERATORS[n].carries[0], 'stand', OPERATORS[n].look.side);

/**
 * Every operator rendered from above and from three-quarters; `ring` false
 * without the side's ring on the ground, which is the same for everyone on a
 * side and would only water the comparison down.
 */
export function renders(ring = true): Map<string, Pixels[]> {
  return new Map(operatorNames.map((n) => {
    const o = OPERATORS[n];
    const t = ring ? CATALOG[figureOf(n)].build() : buildOperator(o.look, o.carries[0], 'stand', SIDE_BAND[o.look.side], false);
    return [n, [rasterise(t, REPLAY_VIEWS.top, METRES_PER_PIXEL, IMAGE, TEAM), rasterise(t, REPLAY_VIEWS.threeQuarter, METRES_PER_PIXEL, IMAGE, TEAM)]];
  }));
}

/** Every pair on one side with how far apart it looks: the larger colour difference of the two views, the smaller shape overlap. */
export function pairs(r: Map<string, Pixels[]>): { a: string; b: string; deltaE: number; iou: number }[] {
  const out: { a: string; b: string; deltaE: number; iou: number }[] = [];
  for (let i = 0; i < operatorNames.length; i++) {
    for (let j = i + 1; j < operatorNames.length; j++) {
      // Across sides the ring on the ground and the bands already differ, amber against cyan.
      if (OPERATORS[operatorNames[i]].look.side !== OPERATORS[operatorNames[j]].look.side) continue;
      const A = r.get(operatorNames[i])!;
      const B = r.get(operatorNames[j])!;
      const d = A.map((p, v) => pixelDistance(p, B[v]));
      out.push({ a: operatorNames[i], b: operatorNames[j], deltaE: Math.max(...d.map((x) => x.deltaE)), iou: Math.min(...d.map((x) => x.iou)) });
    }
  }
  return out.sort((x, y) => x.deltaE - y.deltaE);
}
