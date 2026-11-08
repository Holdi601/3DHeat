/**
 * The light on the figures, in the world (y up): a sun high and to one side,
 * the sky's light from above and the ground's dimmer light from below, and on
 * glass a sheen of the sky. Strong enough a contrast between the lit and the
 * shaded side that a body's shape reads in one colour, as Tacview's figures do.
 *
 * One formula for every renderer: the CPU placing (`kit.ts`) calls `shade`,
 * and the GPU figure shaders are generated from these constants and must
 * give the same answer. So it uses plain arithmetic only - dot, max, min,
 * mix - and nothing imported.
 */

export type Rgb3 = [number, number, number];
export type Vec3n = [number, number, number];

/** The sun's direction (unit, towards the sun) and its colour. */
export const SUN_DIR: Vec3n = [0.4561, 0.7906, 0.4358];
export const SUN_COLOR: Rgb3 = [0.82, 0.8, 0.76];

/** The hemisphere: what a face looking straight up gets, and one looking straight down. */
export const SKY_COLOR: Rgb3 = [0.46, 0.48, 0.52];
export const GROUND_COLOR: Rgb3 = [0.27, 0.26, 0.25];

/** Light every face gets whichever way it looks. */
export const AMBIENT = 0.06;

/** Glass: how much sky it gives back facing level, and how much more facing straight up; the sky's colour in it. */
export const SHEEN_BASE = 0.07;
export const SHEEN_UP = 0.3;
export const SHEEN_COLOR: Rgb3 = [0.78, 0.88, 1.0];

/** Normal 0, 0, 0: unlit, drawn at this share of its colour (rotor and propeller discs, markers, effects). */
export const UNLIT = 1.0;

/**
 * A colour under the figures' light: `base` (already tinted), `n` the
 * world normal (unit; 0 0 0 for unlit), `gloss` 0 paint to 1 glass.
 * Each channel is clamped to 1.
 */
export function shade(base: Rgb3, n: Vec3n, gloss: number): Rgb3 {
  const nx = n[0];
  const ny = n[1];
  const nz = n[2];
  if (nx === 0 && ny === 0 && nz === 0) return [Math.min(1, base[0] * UNLIT), Math.min(1, base[1] * UNLIT), Math.min(1, base[2] * UNLIT)];
  const sun = Math.max(0, nx * SUN_DIR[0] + ny * SUN_DIR[1] + nz * SUN_DIR[2]);
  // Hemisphere: ground below, sky above, mixed by how far the face looks up.
  const h = 0.5 + 0.5 * ny;
  const up = Math.max(0, ny);
  const sheen = gloss * (SHEEN_BASE + SHEEN_UP * up * up);
  const out: Rgb3 = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const light = AMBIENT + GROUND_COLOR[c] + (SKY_COLOR[c] - GROUND_COLOR[c]) * h + SUN_COLOR[c] * sun;
    out[c] = Math.min(1, base[c] * light + sheen * SHEEN_COLOR[c]);
  }
  return out;
}
