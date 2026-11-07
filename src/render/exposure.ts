/**
 * Auto-exposure for the heat ramp.
 *
 * The saturation point decides which accumulated density maps to the top of the
 * colour ramp, and getting it wrong is the difference between a heatmap and a
 * blank screen. It cannot be derived reliably: the analytic estimate has to assume
 * a peak-to-mean ratio, and telemetry clusters so hard — a spawn, a chokepoint, a
 * doorway — that the true ratio varies by an order of magnitude between datasets
 * and between camera angles on the same dataset.
 *
 * So it is measured from the field the shader actually produced. This is the same
 * job a camera's meter does, and it has the same failure mode: metering on the
 * whole frame under-exposes a subject against a dark background. A heat field is
 * mostly empty, so the empty part is excluded and the exposure is set from the
 * distribution of what is actually lit.
 */

export interface ExposureResult {
  /** Saturation point to use, or null when there was nothing to meter. */
  saturation: number | null;
  /** Fraction of sampled pixels carrying any heat, 0..1. */
  coverage: number;
  /** The percentile the exposure was set from. */
  reference: number;
  /** Samples that carried heat. */
  lit: number;
}

export interface ExposureOptions {
  /**
   * Percentile of the *lit* pixels to place near the top of the ramp.
   *
   * Not the maximum: the maximum of a stochastic field is itself noisy and a
   * single freak pixel would darken the entire image. High enough that genuine
   * hotspots still reach the top of the ramp.
   */
  percentile?: number;
  /** Where on the ramp the reference percentile should land. */
  target?: number;
  /** Values at or below this count as empty rather than faintly lit. */
  epsilon?: number;
}

export const DEFAULT_EXPOSURE: Required<ExposureOptions> = {
  percentile: 0.98,
  // Just below the top, so the ramp's final band is reserved for the real peaks
  // rather than being where most of the data already sits.
  target: 0.85,
  epsilon: 1e-4,
};

/**
 * Choose a saturation point from a sample of the accumulated field.
 *
 * `samples` are magnitudes; sign does not matter, since the difference mode's two
 * ramps are scaled by the same point.
 */
export function autoExposure(
  samples: Float32Array | null,
  opts: ExposureOptions = {},
): ExposureResult {
  const { percentile, target, epsilon } = { ...DEFAULT_EXPOSURE, ...opts };
  if (!samples || samples.length === 0) {
    return { saturation: null, coverage: 0, reference: 0, lit: 0 };
  }

  // Copy only the lit values, then sort those. Sorting the whole field would be
  // dominated by the empty majority and is needless work at these sizes.
  const lit: number[] = [];
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    if (Number.isFinite(v) && v > epsilon) lit.push(v);
  }
  const coverage = lit.length / samples.length;
  if (lit.length === 0) {
    return { saturation: null, coverage: 0, reference: 0, lit: 0 };
  }

  lit.sort((a, b) => a - b);
  const idx = Math.min(lit.length - 1, Math.max(0, Math.floor(percentile * lit.length)));
  const reference = lit[idx];
  if (!(reference > 0)) {
    return { saturation: null, coverage, reference: 0, lit: lit.length };
  }

  return {
    saturation: clamp(reference / Math.max(0.05, target), 1e-3, 1e9),
    coverage,
    reference,
    lit: lit.length,
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
