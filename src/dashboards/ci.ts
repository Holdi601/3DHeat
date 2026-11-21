/**
 * Confidence intervals for a rate (rows where a condition holds over all
 * rows): Wilson's score interval by default, or the bootstrap's percentile
 * interval. Pure, DOM-free, used when a tile's numbers are finished.
 *
 * - **Wilson** keeps inside 0..1, stays sensible at 0 % and 100 % and at
 *   small n, and is close to exact coverage - the default.
 * - **Bootstrap** (percentile): resampling the rows with replacement makes
 *   the resampled count binomial(n, k/n), so its percentiles are taken from
 *   that distribution exactly - the limit of infinitely many resamples, with
 *   no random noise between two redraws of the same numbers. At 0 % or 100 %
 *   it collapses to the point (every resample is the same); Wilson does not.
 *
 * `n` and `k` may be weighted (a sampled pool counts each kept row as the
 * rows it stands for): the interval uses the rows actually read, `n / weight`.
 */

export type CiMethod = 'wilson' | 'bootstrap';

export const DEFAULT_CI_LEVEL = 0.95;

export function clampLevel(level: number | undefined): number {
  const l = level ?? DEFAULT_CI_LEVEL;
  return Number.isFinite(l) ? Math.max(0.5, Math.min(0.999, l)) : DEFAULT_CI_LEVEL;
}

/** The standard normal's quantile (Acklam's rational approximation, relative error < 1.2e-9). */
export function normalQuantile(p: number): number {
  if (!(p > 0 && p < 1)) return p === 0 ? -Infinity : p === 1 ? Infinity : NaN;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  let x: number;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - lo) {
    const q = p - 0.5;
    const r = q * q;
    x = ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  return x;
}

/** Wilson's score interval for k of n at a two-sided level. */
export function wilson(k: number, n: number, level = DEFAULT_CI_LEVEL): [number, number] | null {
  if (!(n > 0) || !(k >= 0) || k > n * (1 + 1e-9)) return null;
  const z = normalQuantile(1 - (1 - clampLevel(level)) / 2);
  const p = Math.min(1, k / n);
  const z2 = z * z;
  const den = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / den;
  const half = (z / den) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  // At 0 % and 100 % the near end is the end itself (rounding would leave 1e-17).
  return [p <= 0 ? 0 : Math.max(0, centre - half), p >= 1 ? 1 : Math.min(1, centre + half)];
}

/** The bootstrap's percentile interval for k of n: the binomial(n, k/n) quantiles over n. */
export function bootstrap(k: number, n: number, level = DEFAULT_CI_LEVEL): [number, number] | null {
  if (!(n > 0) || !(k >= 0) || k > n * (1 + 1e-9)) return null;
  const N = Math.max(1, Math.round(n));
  const p = Math.min(1, k / n);
  const a = (1 - clampLevel(level)) / 2;
  if (p === 0 || p === 1) return [p, p];
  const v = N * p * (1 - p);
  if (v > 2500) {
    // The binomial is normal to well under a resample's step here.
    const z = normalQuantile(1 - a);
    const h = z * Math.sqrt((p * (1 - p)) / N);
    return [Math.max(0, p - h), Math.min(1, p + h)];
  }
  // The pmf over the mean +- 12 sd (the rest holds < 1e-30), by recurrence from its first term.
  const sd = Math.sqrt(v);
  const j0 = Math.max(0, Math.floor(N * p - 12 * sd - 2));
  const j1 = Math.min(N, Math.ceil(N * p + 12 * sd + 2));
  const pm = new Float64Array(j1 - j0 + 1);
  const lp = Math.log(p);
  const lq = Math.log1p(-p);
  let lv = lnChoose(N, j0) + j0 * lp + (N - j0) * lq;
  const odds = p / (1 - p);
  let sum = 0;
  let cur = Math.exp(lv);
  for (let j = j0; j <= j1; j++) {
    if (j > j0) {
      // Underflow-safe: carry the log while the terms are tiny.
      lv += Math.log(((N - j + 1) / j) * odds);
      cur = Math.exp(lv);
    }
    pm[j - j0] = cur;
    sum += cur;
  }
  let acc = 0;
  let lo = NaN;
  let hi = NaN;
  for (let j = j0; j <= j1; j++) {
    acc += pm[j - j0] / sum;
    if (Number.isNaN(lo) && acc >= a - 1e-12) lo = j;
    if (acc >= 1 - a - 1e-12) {
      hi = j;
      break;
    }
  }
  if (Number.isNaN(hi)) hi = j1;
  if (Number.isNaN(lo)) lo = j0;
  return [lo / N, hi / N];
}

/** ln(n choose k) by ln Γ. */
function lnChoose(n: number, k: number): number {
  return lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1);
}

/** ln Γ(x) for x > 0 (Lanczos, g = 7, 9 terms). */
export function lnGamma(x: number): number {
  const g = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  const xx = x - 1;
  let s = g[0];
  for (let i = 1; i < 9; i++) s += g[i] / (xx + i);
  const t = xx + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (xx + 0.5) * Math.log(t) - t + Math.log(s);
}

/** An interval for k of n rows by a method; `weight` rows stand behind each counted one. */
export function rateInterval(method: CiMethod, k: number, n: number, level?: number, weight = 1): [number, number] | null {
  const w = weight > 0 ? weight : 1;
  return method === 'bootstrap' ? bootstrap(k / w, n / w, level) : wilson(k / w, n / w, level);
}

/** "95 % Wilson": the interval's name in a tooltip, a table head, a legend. */
export function ciName(method: CiMethod, level?: number): string {
  const l = clampLevel(level) * 100;
  return `${Number.isInteger(l) ? l : l.toFixed(1)} % ${method === 'bootstrap' ? 'bootstrap' : 'Wilson'}`;
}
