/**
 * Small statistics the behaviour measures share: a seeded generator,
 * permutation p-values that are never zero (Phipson and Smyth 2010), cluster
 * bootstraps, sign-flip tests of paired differences, rank correlation and
 * Fleiss' kappa for any number of raters.
 */

import { rateTest } from '../stats';

export type Rng = () => number;

/** mulberry32: the same seed gives the same draws, so a report is reproducible. */
export function rng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(a: T[] | Int32Array | Float64Array | Uint8Array | Int8Array, r: Rng): void {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
}

/** (1 + exceedances) / (1 + draws): a permutation p-value that is never zero. */
export function permP(exceed: number, draws: number): number {
  return Math.min(1, (1 + exceed) / (1 + draws));
}

/** Two-sided permutation p of an observed value against null draws, by distance from the null mean. */
export function permTwoSided(obs: number, nulls: ArrayLike<number>): number {
  let m = 0;
  for (let i = 0; i < nulls.length; i++) m += nulls[i];
  m /= Math.max(1, nulls.length);
  const d = Math.abs(obs - m);
  let ex = 0;
  for (let i = 0; i < nulls.length; i++) if (Math.abs(nulls[i] - m) >= d - 1e-12) ex++;
  return permP(ex, nulls.length);
}

export function mean(a: ArrayLike<number>): number {
  let s = 0;
  let n = 0;
  for (let i = 0; i < a.length; i++)
    if (a[i] === a[i]) {
      s += a[i];
      n++;
    }
  return n ? s / n : NaN;
}

export function median(a: ArrayLike<number>): number {
  const b = Array.from(a).filter((v) => v === v).sort((x, y) => x - y);
  if (!b.length) return NaN;
  const h = b.length >> 1;
  return b.length % 2 ? b[h] : (b[h - 1] + b[h]) / 2;
}

export function quantile(a: ArrayLike<number>, q: number): number {
  const b = Array.from(a).filter((v) => v === v).sort((x, y) => x - y);
  if (!b.length) return NaN;
  const i = Math.min(b.length - 1, Math.max(0, Math.floor(q * (b.length - 1))));
  return b[i];
}

/**
 * 95% interval of Σnum / Σden over clusters (matches, players), resampling
 * the clusters with replacement.
 */
export function bootRatio(num: ArrayLike<number>, den: ArrayLike<number>, r: Rng, draws = 400): [number, number] {
  const n = num.length;
  if (n < 2) return [NaN, NaN];
  const out: number[] = [];
  for (let d = 0; d < draws; d++) {
    let a = 0;
    let b = 0;
    for (let i = 0; i < n; i++) {
      const j = Math.floor(r() * n);
      a += num[j];
      b += den[j];
    }
    if (b > 0) out.push(a / b);
  }
  out.sort((x, y) => x - y);
  return [out[Math.floor(out.length * 0.025)] ?? NaN, out[Math.min(out.length - 1, Math.floor(out.length * 0.975))] ?? NaN];
}

/**
 * Mean of paired differences, its bootstrap 95% interval and a sign-flip
 * permutation p (exchangeable under no effect). With `margin`, the test is of
 * a difference larger than the margin (a minimum effect of interest): with
 * thousands of samples a trivial difference is always "significant".
 */
export function pairedTest(d0: ArrayLike<number>, w: ArrayLike<number> | null, r: Rng, draws = 1000, margin = 0): { mean: number; lo: number; hi: number; p: number } {
  const n = d0.length;
  let d: ArrayLike<number> = d0;
  if (margin > 0) {
    let s0 = 0;
    let w0 = 0;
    for (let i = 0; i < n; i++) {
      s0 += d0[i] * (w ? w[i] : 1);
      w0 += w ? w[i] : 1;
    }
    const sh = Math.sign(s0) * margin;
    d = Float64Array.from(d0, (v) => v - sh);
    if (!(w0 > 0) || Math.abs(s0 / w0) <= margin) {
      const t = pairedTest(d0, w, r, 0);
      return { ...t, p: 1 };
    }
  }
  let sw = 0;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const wi = w ? w[i] : 1;
    s += d[i] * wi;
    sw += wi;
  }
  const m = sw > 0 ? s / sw : NaN;
  if (n < 3 || !(sw > 0)) return { mean: m, lo: NaN, hi: NaN, p: 1 };
  const num = new Float64Array(n);
  const den = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const wi = w ? w[i] : 1;
    num[i] = d[i] * wi;
    den[i] = wi;
  }
  const [lo0, hi0] = bootRatio(num, den, r, 400);
  // Back on the scale of the differences themselves.
  const back = margin > 0 ? Math.sign(m) * margin : 0;
  const lo = lo0 + back;
  const hi = hi0 + back;
  if (!draws) return { mean: m + back, lo, hi, p: 1 };
  let ex = 0;
  for (let k = 0; k < draws; k++) {
    let t = 0;
    for (let i = 0; i < n; i++) t += r() < 0.5 ? -num[i] : num[i];
    if (Math.abs(t / sw) >= Math.abs(m) - 1e-12) ex++;
  }
  return { mean: m + back, lo, hi, p: permP(ex, draws) };
}

function ranks(v: ArrayLike<number>): Float64Array {
  const idx = Array.from({ length: v.length }, (_, i) => i).sort((a, b) => v[a] - v[b]);
  const r = new Float64Array(v.length);
  for (let i = 0; i < idx.length; ) {
    let j = i;
    while (j + 1 < idx.length && v[idx[j + 1]] === v[idx[i]]) j++;
    for (let k = i; k <= j; k++) r[idx[k]] = (i + j) / 2;
    i = j + 1;
  }
  return r;
}

function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}

/** Two-sided normal p of a z score. */
export function pNormal(z: number): number {
  return z === z ? Math.min(1, erfc(Math.abs(z) / Math.SQRT2)) : 1;
}

/** Spearman's ρ with its large-sample p (t approximation through z = ρ√(n-1)). */
export function spearman(a: ArrayLike<number>, b: ArrayLike<number>): { rho: number; p: number } {
  const n = a.length;
  if (n < 5) return { rho: NaN, p: 1 };
  const ra = ranks(a);
  const rb = ranks(b);
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += ra[i];
    mb += rb[i];
  }
  ma /= n;
  mb /= n;
  let sab = 0;
  let saa = 0;
  let sbb = 0;
  for (let i = 0; i < n; i++) {
    const x = ra[i] - ma;
    const y = rb[i] - mb;
    sab += x * y;
    saa += x * x;
    sbb += y * y;
  }
  const rho = saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : NaN;
  return { rho, p: rho === rho ? pNormal(rho * Math.sqrt(n - 1)) : 1 };
}

/**
 * Fleiss' kappa for subjects rated by different numbers of raters: counts
 * `[subject][category]`. Agreement within subjects beyond what the overall
 * category shares give by chance (1 all agree, 0 chance, < 0 less than chance).
 */
export function fleissKappa(counts: ArrayLike<number>[], cats: number): { kappa: number; pBar: number; pE: number; shares: number[] } {
  const tot = new Float64Array(cats);
  let N = 0;
  let pSum = 0;
  let wSum = 0;
  for (const c of counts) {
    let n = 0;
    for (let j = 0; j < cats; j++) n += c[j];
    if (n < 2) continue;
    let a = 0;
    for (let j = 0; j < cats; j++) {
      a += c[j] * (c[j] - 1);
      tot[j] += c[j];
    }
    pSum += a / (n * (n - 1));
    wSum++;
    N += n;
  }
  const shares = Array.from(tot, (v) => (N ? v / N : 0));
  const pE = shares.reduce((s, p) => s + p * p, 0);
  const pBar = wSum ? pSum / wSum : NaN;
  return { kappa: pE < 1 ? (pBar - pE) / (1 - pE) : NaN, pBar, pE, shares };
}

/** Rate ratio a/ta over b/tb with its 95% interval (log scale, half a count added to empty cells) and the exact conditional p. */
export function rateRatio(a: number, ta: number, b: number, tb: number): { rr: number; lo: number; hi: number; p: number } | null {
  if (!(ta > 0 && tb > 0) || a + b < 3) return null;
  const aa = a || 0.5;
  const bb = b || 0.5;
  const rr = aa / ta / (bb / tb);
  const se = Math.sqrt(1 / aa + 1 / bb);
  return { rr, lo: rr * Math.exp(-1.96 * se), hi: rr * Math.exp(1.96 * se), p: rateTest(a, ta, b, tb).p };
}

export const round = (v: number, d = 3): number => (v === v && Number.isFinite(v) ? Math.round(v * 10 ** d) / 10 ** d : v);
