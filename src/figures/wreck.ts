/**
 * A wreck's look: a dead unit is drawn charred, dark desaturated grey with at
 * most a hint of its team's colour, its whole figure and not only the team
 * part. An instance says it is a wreck by a negative team colour (`-wreck`),
 * which the figure shaders (`render/figureShaders.ts`) and `expand` read as
 * "charred": the mesh's own shade keeps its detail, scaled into the grey.
 */

import type { Rgb } from '../race/geometry';

/** The grey of a wreck and how much of its team's colour stays. */
export const WRECK_GREY = 0.15;
export const WRECK_TINT = 0.06;
/** The mesh's own brightness keeps the detail: the grey times base + gain x its luma. */
export const WRECK_BASE = 0.55;
export const WRECK_GAIN = 0.9;

/** A team colour as its wreck's (positive; an instance carries it negated). */
export function wreckColour(team: ArrayLike<number>): Rgb {
  return [WRECK_GREY + WRECK_TINT * team[0], WRECK_GREY + WRECK_TINT * team[1], WRECK_GREY + WRECK_TINT * team[2]];
}

/** A mesh colour on a wreck of colour `w`: what the figure shaders do with it. */
export function wreckShade(r: number, g: number, b: number, w: ArrayLike<number>): Rgb {
  const k = WRECK_BASE + WRECK_GAIN * (0.299 * r + 0.587 * g + 0.114 * b);
  return [w[0] * k, w[1] * k, w[2] * k];
}
