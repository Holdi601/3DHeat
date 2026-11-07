/**
 * IEEE 754 binary16 conversion.
 *
 * Both backends need this and neither gets it for free. WebGL2 reads the heat
 * buffer back as half-float, and WebGPU's `queue.writeTexture` copies raw bytes
 * with no conversion, so an r16float texture has to be handed encoded data.
 */

/** Decode binary16 to a JS number. */
export function halfToFloat(h: number): number {
  const sign = h & 0x8000 ? -1 : 1;
  const exp = (h >> 10) & 0x1f;
  const frac = h & 0x03ff;
  if (exp === 0) return sign * frac * 2 ** -24;
  if (exp === 31) return frac ? NaN : sign * Infinity;
  return sign * (frac + 1024) * 2 ** (exp - 25);
}

/**
 * Encode a JS number as binary16.
 *
 * Values too large for the format saturate to infinity rather than wrapping,
 * which is what the hardware would do and is the less surprising of the two.
 */
export function floatToHalf(v: number): number {
  if (Number.isNaN(v)) return 0x7e00;
  if (!Number.isFinite(v)) return v > 0 ? 0x7c00 : 0xfc00;
  const sign = v < 0 || Object.is(v, -0) ? 0x8000 : 0;
  const a = Math.abs(v);
  // Smallest normal binary16 value; below this the exponent field is zero and
  // the fraction carries the whole magnitude.
  if (a < 6.103515625e-5) return sign | Math.min(0x03ff, Math.round(a / 2 ** -24));
  // 65520 is the midpoint between the largest finite value and infinity, so
  // anything at or above it rounds to infinity.
  if (a >= 65520) return sign | 0x7c00;
  const exp = Math.floor(Math.log2(a));
  const frac = Math.round((a / 2 ** exp - 1) * 1024);
  // Rounding the fraction up can carry into the exponent.
  if (frac === 1024) return sign | ((exp + 1 + 15) << 10);
  return sign | ((exp + 15) << 10) | frac;
}
