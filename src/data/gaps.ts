/**
 * Gaps in a unit's samples: where the recording heard nothing from it for a
 * while and it was somewhere else when it did again - a client's replay of a
 * unit out of its sight, a lost signal. Across a gap the unit is not drawn
 * as if it went the straight way: it is drawn at its last sample until the
 * update after that should have come (its own sample interval just before),
 * fades out over `GAP_FADE_S`, stays hidden, and comes back at once where the
 * next sample has it. Its trail breaks there too.
 *
 * A gap is a step longer than `GAP_MIN_S` and `GAP_FACTOR` times the unit's
 * usual (median) step, over which it moved more than `GAP_MOVED_M`: a unit
 * that is sampled seldom all along is not gapped, nor one that stood still
 * (a parked aircraft's recording writes nothing while nothing changes; a
 * level's wrecks are kept a sample every ten seconds).
 *
 * Worked out once a dataset when the tracks are built: the CPU motion model
 * (`figures/motion.ts`) and the GPU tracks (`render/gpuTracks/store.ts`, a
 * bit a key) each mark their own samples with `markGaps`, and both fade with
 * `gapFade`.
 */

/** Seconds a step must be at least to be a gap. */
export const GAP_MIN_S = 1.5;
/** Times the unit's usual step a gap is at least. */
export const GAP_FACTOR = 4;
/** Metres a unit must have moved across a gap. */
export const GAP_MOVED_M = 1;
/** Seconds a unit takes to fade out once its next update is late. */
export const GAP_FADE_S = 0.3;
/** The wait for the first missed update, seconds: the step before the gap, within these. */
export const GAP_LEAD_MIN_S = 0.05;
export const GAP_LEAD_MAX_S = 1.2;
/** The wait where there is no step before the gap. */
export const GAP_LEAD_NONE_S = 0.5;

let scratch = new Float64Array(256);

/**
 * Marks `out[n] = 1` for each of the samples `rows[a..b)` (one unit's, in
 * time order) that a gap follows, else 0; returns how many gaps.
 */
export function markGaps(rows: ArrayLike<number>, a: number, b: number, time: ArrayLike<number>, px: ArrayLike<number>, py: ArrayLike<number>, pz: ArrayLike<number>, units: number, out: Uint8Array, at = a): number {
  const n = b - a;
  for (let k = 0; k < n; k++) out[at + k] = 0;
  if (n < 3) return 0;
  if (scratch.length < n) scratch = new Float64Array(Math.max(n, scratch.length * 2));
  let m = 0;
  for (let k = a; k + 1 < b; k++) {
    const dt = time[rows[k + 1]] - time[rows[k]];
    if (dt > 1e-3) scratch[m++] = dt;
  }
  if (!m) return 0;
  const steps = scratch.subarray(0, m).sort();
  const usual = steps[m >> 1];
  const least = Math.max(GAP_MIN_S, GAP_FACTOR * usual);
  if (steps[m - 1] <= least) return 0;
  const moved = GAP_MOVED_M * units;
  let gaps = 0;
  for (let k = a; k + 1 < b; k++) {
    const r0 = rows[k], r1 = rows[k + 1];
    if (time[r1] - time[r0] <= least) continue;
    const dx = px[r1] - px[r0], dy = py[r1] - py[r0], dz = pz[r1] - pz[r0];
    if (dx * dx + dy * dy + dz * dz <= moved * moved) continue;
    out[at + k - a] = 1;
    gaps++;
  }
  return gaps;
}

/** Seconds from the sample before a gap to its first missed update, by the step before that sample (NaN: none). */
export function gapLead(stepBefore: number): number {
  return Number.isFinite(stepBefore) && stepBefore > 0 ? Math.min(GAP_LEAD_MAX_S, Math.max(GAP_LEAD_MIN_S, stepBefore)) : GAP_LEAD_NONE_S;
}

/** How much of a unit shows `since` seconds after the sample a gap follows: 1 until its update is late, then down to 0 (as the GPU tracks' `GAP_FADE_WGSL`, `GAP_FADE_GLSL`). */
export function gapFade(since: number, stepBefore: number): number {
  const x = (since - gapLead(stepBefore)) / GAP_FADE_S;
  return x <= 0 ? 1 : x >= 1 ? 0 : 1 - x;
}

const f = (v: number) => (Number.isInteger(v) ? `${v}.0` : `${v}`);
/** `gapFade` in WGSL (`before` 0 or less: none). */
export const GAP_FADE_WGSL = /* wgsl */ `
fn gapFade(since : f32, before : f32) -> f32 {
  var lead = ${f(GAP_LEAD_NONE_S)};
  if (before > 0.0) { lead = clamp(before, ${f(GAP_LEAD_MIN_S)}, ${f(GAP_LEAD_MAX_S)}); }
  return clamp(1.0 - (since - lead) / ${f(GAP_FADE_S)}, 0.0, 1.0);
}
`;
/** `gapFade` in GLSL. */
export const GAP_FADE_GLSL = `
float gapFade(float since, float before) {
  float lead = before > 0.0 ? clamp(before, ${f(GAP_LEAD_MIN_S)}, ${f(GAP_LEAD_MAX_S)}) : ${f(GAP_LEAD_NONE_S)};
  return clamp(1.0 - (since - lead) / ${f(GAP_FADE_S)}, 0.0, 1.0);
}
`;
