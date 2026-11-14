/**
 * The statistics the insight detectors stand on: exact binomial tails (every
 * test here is one - a rate in a place against the rest of the map, given the
 * events, is a binomial share of them), Wilson intervals, empirical-Bayes
 * shrinkage and the Benjamini-Hochberg false discovery rate over the many
 * places a detector tries. Free of the DOM and of the dataset, for the worker.
 */

/** ln Γ(x), Lanczos (g = 7, n = 9): ~15 digits for x > 0. */
export function lnGamma(x: number): number {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lnGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Continued fraction of the incomplete beta (Numerical Recipes `betacf`). */
function betaCf(a: number, b: number, x: number): number {
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 10000; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-15) break;
  }
  return h;
}

/** The regularised incomplete beta I_x(a, b). */
export function betaInc(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betaCf(a, b, x)) / a : 1 - (bt * betaCf(b, a, 1 - x)) / b;
}

/** P(X >= k), X ~ Binomial(n, p). */
export function binomUpper(k: number, n: number, p: number): number {
  if (k <= 0) return 1;
  if (k > n) return 0;
  return betaInc(k, n - k + 1, p);
}

/** P(X <= k), X ~ Binomial(n, p). */
export function binomLower(k: number, n: number, p: number): number {
  if (k >= n) return 1;
  if (k < 0) return 0;
  return 1 - betaInc(k + 1, n - k, p);
}

/** Two-sided binomial p: twice the smaller tail, at most 1. */
export function binomTwoSided(k: number, n: number, p: number): number {
  return Math.min(1, 2 * Math.min(binomUpper(k, n, p), binomLower(k, n, p)));
}

/** Wilson score interval of k successes in n at ~95% (z = 1.96). */
export function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (!(n > 0)) return [0, 1];
  const p = k / n;
  const z2 = z * z;
  const den = 1 + z2 / n;
  const mid = (p + z2 / (2 * n)) / den;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / den;
  return [Math.max(0, mid - half), Math.min(1, mid + half)];
}

/**
 * Benjamini-Hochberg q-values of `p` (NaN skipped, kept NaN): the smallest
 * false discovery rate at which each test would be called. `m` defaults to
 * the finite tests; pass a larger one when tests were skipped as hopeless
 * (that is still valid - it only makes the q-values more careful).
 */
export function bhAdjust(p: ArrayLike<number>, m?: number): Float64Array {
  const idx: number[] = [];
  for (let i = 0; i < p.length; i++) if (p[i] === p[i]) idx.push(i);
  const q = new Float64Array(p.length).fill(NaN);
  const n = Math.max(idx.length, m ?? 0);
  idx.sort((a, b) => p[a] - p[b]);
  let run = 1;
  for (let r = idx.length - 1; r >= 0; r--) {
    run = Math.min(run, (p[idx[r]] * n) / (r + 1));
    q[idx[r]] = run;
  }
  return q;
}

/**
 * A count against the rest of the map: `a` events over exposure `ta` here,
 * `b` over `tb` elsewhere. Given the a + b events, `a` is binomial with the
 * share of the exposure here when the rates are equal - the exact test of two
 * Poisson rates. Says the rate ratio raw, shrunk (a gamma prior of `alpha`
 * events at the rest's rate: few events say little) and its Wilson interval.
 */
export interface RateTest {
  /** Rate here over the rate elsewhere. */
  raw: number;
  shrunk: number;
  lo: number;
  hi: number;
  /** Events expected here at the rate elsewhere. */
  expected: number;
  pUpper: number;
  pLower: number;
  p: number;
}

export function rateTest(a: number, ta: number, b: number, tb: number, alpha = 3): RateTest {
  const n = a + b;
  const share = ta / (ta + tb);
  const rest = tb > 0 ? b / tb : 0;
  const expected = rest * ta;
  const raw = expected > 0 ? a / expected : a > 0 ? Infinity : 1;
  const shrunk = (a + alpha) / (expected + alpha);
  const [wl, wh] = wilson(a, n);
  const odds = (x: number) => x / Math.max(1e-12, 1 - x);
  const scale = tb / Math.max(1e-12, ta);
  const pUpper = n > 0 && share > 0 && share < 1 ? binomUpper(a, n, share) : 1;
  const pLower = n > 0 && share > 0 && share < 1 ? binomLower(a, n, share) : 1;
  return { raw, shrunk, lo: odds(wl) * scale, hi: wh >= 1 ? Infinity : odds(wh) * scale, expected, pUpper, pLower, p: Math.min(1, 2 * Math.min(pUpper, pLower)) };
}

/**
 * A share against the rest: `k` of `n` here (kills of kills + deaths, say),
 * `k0` of `n0` elsewhere. Effect as an odds ratio, shrunk by a beta prior of
 * `m` outcomes at the rest's share.
 */
export interface ShareTest {
  share: number;
  base: number;
  /** Odds ratio here against elsewhere: raw, shrunk, Wilson interval. */
  raw: number;
  shrunk: number;
  lo: number;
  hi: number;
  pUpper: number;
  pLower: number;
  p: number;
}

export function shareTest(k: number, n: number, k0: number, n0: number, m = 10): ShareTest {
  const base = n0 > 0 ? Math.min(1 - 1e-6, Math.max(1e-6, k0 / n0)) : 0.5;
  const odds = (x: number) => x / Math.max(1e-12, 1 - x);
  const ob = odds(base);
  const share = n > 0 ? k / n : NaN;
  const ps = (k + m * base) / (n + m);
  const [wl, wh] = wilson(k, n);
  const pUpper = n > 0 ? binomUpper(k, n, base) : 1;
  const pLower = n > 0 ? binomLower(k, n, base) : 1;
  return {
    share,
    base,
    // Haldane's half count where every outcome went one way.
    raw: n > 0 ? odds(k === 0 || k === n ? (k + 0.5) / (n + 1) : share) / ob : 1,
    shrunk: odds(ps) / ob,
    lo: odds(wl) / ob,
    hi: wh >= 1 ? Infinity : odds(wh) / ob,
    pUpper,
    pLower,
    p: Math.min(1, 2 * Math.min(pUpper, pLower)),
  };
}

/** The usual words for a q-value. */
export function confidenceLevel(q: number): 'high' | 'medium' | 'low' {
  return q < 0.001 ? 'high' : q < 0.01 ? 'medium' : 'low';
}

/**
 * How strong an insight is, 0..1: the shrunk effect (a ratio: 3x or 1/3 is
 * half way) times the evidence (q 0.001 is half way). Both saturate slowly, so
 * a big dataset's tiny q-values still rank by how big the effect is.
 */
export function strengthOf(ratio: number, q: number): number {
  const l = Math.abs(Math.log(Math.max(1e-9, ratio)));
  const e = l / (l + Math.log(3));
  const z = -Math.log10(Math.max(1e-300, q));
  return e * (z / (z + 3));
}

/** The value at fraction `q` of sorted `a`. */
export function quantileSorted(a: ArrayLike<number>, q: number): number {
  if (a.length === 0) return NaN;
  const x = (a.length - 1) * q;
  const i = Math.floor(x);
  const f = x - i;
  return i + 1 < a.length ? a[i] * (1 - f) + a[i + 1] * f : a[i];
}
