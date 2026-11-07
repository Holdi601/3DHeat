/**
 * Oklch or HSL for the team hues?
 *
 * HSL is the obvious choice and the wrong one here, for a reason specific to this
 * mode rather than a general preference: opacity carries density, so any
 * brightness difference between hues reads as a difference in how much data is
 * there. HSL's "lightness" is the midpoint of the largest and smallest channel,
 * which has almost nothing to do with perceived brightness — so a circle of HSL
 * hues at one nominal lightness is not one brightness at all.
 *
 * This measures the difference rather than asserting it.
 *
 *   node tools/check_hue_spread.mjs
 */
import { TEAM_MAX_HUES, hslToRgb, teamHeatColor, teamSlice } from '../src/render/colors.ts';

/** Rec.709 relative luminance: how bright a colour actually looks. */
const luma = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const span = (a) => Math.max(...a) / Math.min(...a);

const n = TEAM_MAX_HUES;
const ok = Array.from({ length: n }, (_, i) => luma(teamHeatColor(i, n)));
const hsl = Array.from({ length: n }, (_, i) => luma(hslToRgb(i / n, 1, 0.5)));

console.log(`${n} hues, relative luminance:`);
console.log(
  `  Oklch, constant lightness: ${Math.min(...ok).toFixed(3)} .. ${Math.max(...ok).toFixed(3)}` +
    `  (spread ${span(ok).toFixed(2)}x)`,
);
console.log(
  `  HSL, S=100% L=50%:         ${Math.min(...hsl).toFixed(3)} .. ${Math.max(...hsl).toFixed(3)}` +
    `  (spread ${span(hsl).toFixed(2)}x)`,
);

// And what the halving buys: the hue distance between consecutive ids, which is
// the comparison that matters because consecutive ids are neighbouring places.
const gap = (a, b, slices) => {
  const d = Math.abs(a - b);
  return Math.min(d, slices - d) / slices;
};
for (const groups of [29, 510]) {
  const slices = Math.min(groups, TEAM_MAX_HUES);
  let halved = 0;
  let inOrder = 0;
  for (let i = 0; i + 1 < groups; i++) {
    halved += gap(teamSlice(i, groups), teamSlice(i + 1, groups), slices);
    // What it used to do: slice = id, divisor = the full group count.
    inOrder += gap(i, i + 1, groups);
  }
  console.log(
    `\n${groups} groups: mean hue distance between consecutive ids` +
      `\n  dividing by every id, in order: ${((inOrder / (groups - 1)) * 360).toFixed(1)} deg` +
      `\n  ${slices} hues, placed by halving: ${((halved / (groups - 1)) * 360).toFixed(1)} deg`,
  );
}
