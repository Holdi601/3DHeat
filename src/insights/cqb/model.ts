/**
 * The models and tests the close-quarters metrics stand on: a ridge-penalised
 * logistic regression fitted by iteratively reweighted least squares (the
 * round win-probability model), its calibration out of fold (Brier score and
 * skill, log loss, expected calibration error, a reliability table and the
 * logistic recalibration slope), ridge regression by conjugate gradients on
 * sparse rows (adjusted plus-minus, RAPM-style), normal-normal
 * empirical-Bayes shrinkage of group means, Fisher's exact test of a 2x2
 * table (the exact permutation test of two shares), Newcombe's interval for
 * a difference of two shares and a seeded permutation test of two means.
 */

import { lnGamma, wilson } from '../stats';

export interface Logit {
  beta: Float64Array;
  /** Standard errors from the penalised information. */
  se: Float64Array;
  iters: number;
}

/** Solves A x = b for a small dense symmetric positive matrix (row-major p x p); null when singular. */
export function solve(A: Float64Array, b: Float64Array, p: number): Float64Array | null {
  const M = Float64Array.from(A);
  const x = Float64Array.from(b);
  for (let c = 0; c < p; c++) {
    let piv = c;
    for (let r = c + 1; r < p; r++) if (Math.abs(M[r * p + c]) > Math.abs(M[piv * p + c])) piv = r;
    if (Math.abs(M[piv * p + c]) < 1e-12) return null;
    if (piv !== c) {
      for (let k = 0; k < p; k++) [M[c * p + k], M[piv * p + k]] = [M[piv * p + k], M[c * p + k]];
      [x[c], x[piv]] = [x[piv], x[c]];
    }
    for (let r = 0; r < p; r++) {
      if (r === c) continue;
      const f = M[r * p + c] / M[c * p + c];
      if (!f) continue;
      for (let k = c; k < p; k++) M[r * p + k] -= f * M[c * p + k];
      x[r] -= f * x[c];
    }
  }
  for (let c = 0; c < p; c++) x[c] /= M[c * p + c];
  return x;
}

function inverseDiag(A: Float64Array, p: number): Float64Array {
  const out = new Float64Array(p);
  for (let j = 0; j < p; j++) {
    const e = new Float64Array(p);
    e[j] = 1;
    const col = solve(A, e, p);
    out[j] = col ? col[j] : NaN;
  }
  return out;
}

export const sigmoid = (v: number) => (v >= 0 ? 1 / (1 + Math.exp(-v)) : Math.exp(v) / (1 + Math.exp(v)));

/**
 * Logistic regression of `y` (0/1) on the rows of `X` (n x p, row-major, the
 * first column 1), ridge `lambda` on every coefficient but the intercept.
 */
export function fitLogit(X: Float64Array, y: ArrayLike<number>, n: number, p: number, lambda = 1e-3, rows?: ArrayLike<number>): Logit | null {
  const idx = rows ?? Array.from({ length: n }, (_, i) => i);
  let beta = new Float64Array(p);
  let iters = 0;
  let H = new Float64Array(p * p);
  for (; iters < 30; iters++) {
    H = new Float64Array(p * p);
    const g = new Float64Array(p);
    for (let q = 0; q < idx.length; q++) {
      const i = idx[q];
      let eta = 0;
      for (let k = 0; k < p; k++) eta += X[i * p + k] * beta[k];
      const mu = sigmoid(eta);
      const w = Math.max(1e-9, mu * (1 - mu));
      const r = y[i] - mu;
      for (let a = 0; a < p; a++) {
        const xa = X[i * p + a];
        if (!xa) continue;
        g[a] += xa * r;
        for (let b = a; b < p; b++) H[a * p + b] += w * xa * X[i * p + b];
      }
    }
    for (let a = 0; a < p; a++) for (let b = 0; b < a; b++) H[a * p + b] = H[b * p + a];
    for (let a = 1; a < p; a++) {
      H[a * p + a] += lambda * idx.length;
      g[a] -= lambda * idx.length * beta[a];
    }
    const step = solve(H, g, p);
    if (!step) return null;
    let mx = 0;
    const next = new Float64Array(p);
    for (let k = 0; k < p; k++) {
      next[k] = beta[k] + step[k];
      mx = Math.max(mx, Math.abs(step[k]));
    }
    beta = next;
    if (mx < 1e-7) break;
  }
  const inv = inverseDiag(H, p);
  return { beta, se: inv.map((v) => Math.sqrt(Math.max(0, v))), iters };
}

export function predict(beta: ArrayLike<number>, X: Float64Array, i: number, p: number): number {
  let eta = 0;
  for (let k = 0; k < p; k++) eta += X[i * p + k] * beta[k];
  return sigmoid(eta);
}

export interface Calibration {
  n: number;
  folds: number;
  brier: number;
  /** Brier score of the base rate alone, and the skill against it (1 - brier / base). */
  brierBase: number;
  skill: number;
  logLoss: number;
  /** Expected calibration error over ten equal-width bins. */
  ece: number;
  /** Logistic recalibration of the out-of-fold logits: slope 1 and intercept 0 are perfect. */
  slope: number;
  intercept: number;
  auc: number;
  /** Per bin: mean prediction, observed share, rows, observed share's 95% interval. */
  bins: { p: number; obs: number; n: number; lo: number; hi: number }[];
}

/** Rank AUC of predictions `p` against outcomes `y`. */
export function aucOf(p: ArrayLike<number>, y: ArrayLike<number>): number {
  const idx = Array.from({ length: p.length }, (_, i) => i).sort((a, b) => p[a] - p[b]);
  let rankPos = 0;
  let pos = 0;
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && p[idx[j + 1]] === p[idx[i]]) j++;
    const rank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) if (y[idx[k]]) {
      rankPos += rank;
      pos++;
    }
    i = j + 1;
  }
  const neg = p.length - pos;
  if (!pos || !neg) return NaN;
  return (rankPos - (pos * (pos + 1)) / 2) / (pos * neg);
}

/** Out-of-fold calibration of `oof` predictions against `y`. */
export function calibrate(oof: ArrayLike<number>, y: ArrayLike<number>, folds: number): Calibration {
  const n = oof.length;
  let brier = 0;
  let ll = 0;
  let base = 0;
  for (let i = 0; i < n; i++) base += y[i];
  base /= Math.max(1, n);
  let brierBase = 0;
  const bins = Array.from({ length: 10 }, () => ({ s: 0, k: 0, n: 0 }));
  for (let i = 0; i < n; i++) {
    const p = Math.min(1 - 1e-6, Math.max(1e-6, oof[i]));
    brier += (p - y[i]) ** 2;
    brierBase += (base - y[i]) ** 2;
    ll -= y[i] ? Math.log(p) : Math.log(1 - p);
    const b = bins[Math.min(9, Math.floor(p * 10))];
    b.s += p;
    b.k += y[i];
    b.n++;
  }
  let ece = 0;
  for (const b of bins) if (b.n) ece += (b.n / n) * Math.abs(b.s / b.n - b.k / b.n);
  // Recalibration: y ~ a + b logit(p).
  const X = new Float64Array(n * 2);
  for (let i = 0; i < n; i++) {
    const p = Math.min(1 - 1e-6, Math.max(1e-6, oof[i]));
    X[i * 2] = 1;
    X[i * 2 + 1] = Math.log(p / (1 - p));
  }
  const re = fitLogit(X, y, n, 2, 0);
  return {
    n,
    folds,
    brier: brier / Math.max(1, n),
    brierBase: brierBase / Math.max(1, n),
    skill: brierBase > 0 ? 1 - brier / brierBase : 0,
    logLoss: ll / Math.max(1, n),
    ece,
    slope: re ? re.beta[1] : NaN,
    intercept: re ? re.beta[0] : NaN,
    auc: aucOf(oof, y),
    bins: bins.flatMap((b) => {
      if (!b.n) return [];
      const [lo, hi] = wilson(b.k, b.n);
      return [{ p: b.s / b.n, obs: b.k / b.n, n: b.n, lo, hi }];
    }),
  };
}

/**
 * Ridge regression on sparse rows: row i has entries `cols[off[i]..off[i+1])`
 * with values `vals`, target `y`; minimises |y - X b|² + λ|b|² by conjugate
 * gradients on the normal equations.
 */
export function ridgeSparse(off: Int32Array, cols: Int32Array, vals: Float32Array, y: ArrayLike<number>, p: number, lambda: number, rows?: ArrayLike<number>): Float64Array {
  const idx = rows ?? Array.from({ length: off.length - 1 }, (_, i) => i);
  const Xt = (v: Float64Array, out: Float64Array) => {
    // out = X^T X v + λ v
    out.fill(0);
    for (let q = 0; q < idx.length; q++) {
      const i = idx[q];
      let s = 0;
      for (let k = off[i]; k < off[i + 1]; k++) s += vals[k] * v[cols[k]];
      for (let k = off[i]; k < off[i + 1]; k++) out[cols[k]] += vals[k] * s;
    }
    for (let j = 0; j < p; j++) out[j] += lambda * v[j];
  };
  const b = new Float64Array(p);
  for (let q = 0; q < idx.length; q++) {
    const i = idx[q];
    for (let k = off[i]; k < off[i + 1]; k++) b[cols[k]] += vals[k] * y[i];
  }
  const x = new Float64Array(p);
  const r = Float64Array.from(b);
  const d = Float64Array.from(r);
  const Ad = new Float64Array(p);
  let rr = r.reduce((s, v) => s + v * v, 0);
  for (let it = 0; it < 200 && rr > 1e-14; it++) {
    Xt(d, Ad);
    let dAd = 0;
    for (let j = 0; j < p; j++) dAd += d[j] * Ad[j];
    if (dAd <= 0) break;
    const a = rr / dAd;
    for (let j = 0; j < p; j++) {
      x[j] += a * d[j];
      r[j] -= a * Ad[j];
    }
    const rr2 = r.reduce((s, v) => s + v * v, 0);
    const beta = rr2 / rr;
    rr = rr2;
    for (let j = 0; j < p; j++) d[j] = r[j] + beta * d[j];
  }
  return x;
}

export interface Shrunk {
  /** Posterior mean, its sd and the raw mean, per group. */
  mean: number;
  sd: number;
  raw: number;
  n: number;
}

/**
 * Normal-normal empirical Bayes: each group's mean pulled towards the grand
 * mean by its own noise against the spread between groups (method of moments).
 */
export function ebShrink(sum: ArrayLike<number>, sumSq: ArrayLike<number>, n: ArrayLike<number>): { groups: Shrunk[]; grand: number; tau2: number } {
  let N = 0;
  let S = 0;
  let SS = 0;
  for (let g = 0; g < n.length; g++) {
    N += n[g];
    S += sum[g];
    SS += sumSq[g];
  }
  const grand = N ? S / N : 0;
  const within = N > 1 ? Math.max(1e-12, (SS - S * S / N) / (N - 1)) : 1;
  let between = 0;
  let k = 0;
  let noise = 0;
  for (let g = 0; g < n.length; g++) {
    if (n[g] < 1) continue;
    between += (sum[g] / n[g] - grand) ** 2;
    noise += within / n[g];
    k++;
  }
  const tau2 = k > 1 ? Math.max(0, between / (k - 1) - noise / k) : 0;
  const groups: Shrunk[] = [];
  for (let g = 0; g < n.length; g++) {
    if (n[g] < 1) {
      groups.push({ mean: grand, sd: Math.sqrt(tau2), raw: NaN, n: 0 });
      continue;
    }
    const v = within / n[g];
    const B = tau2 > 0 ? tau2 / (tau2 + v) : 0;
    const raw = sum[g] / n[g];
    groups.push({ mean: grand + B * (raw - grand), sd: Math.sqrt(B * v), raw, n: n[g] });
  }
  return { groups, grand, tau2 };
}

const lnChoose = (n: number, k: number) => lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1);

/** Two-sided Fisher exact test of [[a, b], [c, d]]: the exact permutation test of two shares. */
export function fisher(a: number, b: number, c: number, d: number): number {
  const r1 = a + b;
  const c1 = a + c;
  const n = a + b + c + d;
  if (!n || !r1 || !c1 || r1 === n || c1 === n) return 1;
  const lo = Math.max(0, r1 + c1 - n);
  const hi = Math.min(r1, c1);
  const lp = (x: number) => lnChoose(c1, x) + lnChoose(n - c1, r1 - x) - lnChoose(n, r1);
  const p0 = lp(a);
  let p = 0;
  for (let x = lo; x <= hi; x++) {
    const v = lp(x);
    if (v <= p0 + 1e-7) p += Math.exp(v);
  }
  return Math.min(1, p);
}

/** Newcombe's hybrid score interval for k1/n1 - k2/n2 (95%). */
export function newcombe(k1: number, n1: number, k2: number, n2: number): [number, number] {
  const p1 = n1 ? k1 / n1 : 0;
  const p2 = n2 ? k2 / n2 : 0;
  const [l1, u1] = wilson(k1, n1);
  const [l2, u2] = wilson(k2, n2);
  const d = p1 - p2;
  return [d - Math.sqrt((p1 - l1) ** 2 + (u2 - p2) ** 2), d + Math.sqrt((u1 - p1) ** 2 + (p2 - l2) ** 2)];
}

/** A small seeded generator (mulberry32) for the permutation tests: the same data give the same p. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Two-sided permutation test of the difference of means of `a` and `b`. */
export function permMeans(a: ArrayLike<number>, b: ArrayLike<number>, perms = 2000, seed = 7): { diff: number; p: number } {
  const na = a.length;
  const nb = b.length;
  if (!na || !nb) return { diff: NaN, p: NaN };
  const all = new Float64Array(na + nb);
  all.set(Array.from(a));
  all.set(Array.from(b), na);
  let sa = 0;
  for (let i = 0; i < na; i++) sa += all[i];
  let tot = 0;
  for (const v of all) tot += v;
  const diff = sa / na - (tot - sa) / nb;
  const R = rng(seed);
  let ge = 0;
  const pool = Float64Array.from(all);
  for (let k = 0; k < perms; k++) {
    // Partial shuffle: draw na without replacement.
    let s = 0;
    for (let i = 0; i < na; i++) {
      const j = i + Math.floor(R() * (pool.length - i));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
      s += pool[i];
    }
    const dd = s / na - (tot - s) / nb;
    if (Math.abs(dd) >= Math.abs(diff) - 1e-12) ge++;
  }
  return { diff, p: (ge + 1) / (perms + 1) };
}

/** Normal tail, two-sided, of a z score. */
export function zTwoSided(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  // erfc by Abramowitz-Stegun 7.1.26
  const t = 1 / (1 + 0.3275911 * x);
  const y = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
  return Math.min(1, y);
}
