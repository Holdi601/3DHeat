/**
 * The win-rate map's arithmetic (render/rateMap.ts), and that both backends'
 * shaders run it: the share and the rows it rests on stay the same at any
 * zoom, frame gain and sampling density, so the picture neither changes as the
 * camera moves in nor flickers as frames merge.
 */
import { describe, expect, it } from 'vitest';
import { overallShare, rateComposite, rateSplat, type RateParams } from './rateMap';
import { COMPOSITE_FS, HEAT_FS } from './webgl2/shaders';
import { COMPOSITE_WGSL, HEAT_WGSL, LINE_HEAT_WGSL } from './webgpu/shaders';

const P: RateParams = { overall: 0.5, prior: 12, minSamples: 12, span: 0.2 };

/** A small deterministic generator. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Row {
  /** The sprite's heat at the pixel before any weight. */
  k: number;
  won: boolean;
}

function rows(n: number, winShare: number, seed = 1): Row[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({ k: 0.05 + 0.95 * r(), won: r() < winShare }));
}

/** One pass's sums: every row given, each weighed `w` (sample weight times frame gain) and by `scale` (a clamp's area weight). */
function pass(list: Row[], w: number, scale = 1): [number, number, number] {
  const s: [number, number, number] = [0, 0, 0];
  for (const row of list) {
    const [a, b, c] = rateSplat(row.k * w * scale * (row.won ? 1 : -1), w, row.won);
    s[0] += a;
    s[1] += b;
    s[2] += c;
  }
  return s;
}

describe('the win-rate map', () => {
  it('colours a place by its share won against the overall one: warm above, cool below, nothing on few rows', () => {
    const hot = pass(rows(400, 0.8), 1);
    const cold = pass(rows(400, 0.2), 1);
    const even = pass(rows(4000, 0.5), 1);
    const few = pass(rows(4, 1), 1);
    const h = rateComposite(...hot, 1, P);
    const c = rateComposite(...cold, 1, P);
    expect(h.row).toBe(0);
    expect(c.row).toBe(1);
    expect(h.t).toBeGreaterThan(0.9);
    expect(c.t).toBeGreaterThan(0.9);
    expect(h.fade).toBe(1);
    expect(rateComposite(...even, 1, P).t).toBeLessThan(0.15);
    // Four rows, all won: under the minimum, not coloured at all.
    expect(rateComposite(...few, 1, P).fade).toBe(0);
    // n counts rows: 400 rows of uneven heat rest on fewer than 400, more than 200.
    expect(h.n).toBeGreaterThan(200);
    expect(h.n).toBeLessThan(400);
  });

  it('pulls a place on few rows toward the overall share', () => {
    const few = pass(rows(16, 1), 1);
    const many = pass(rows(1600, 1), 1);
    const a = rateComposite(...few, 1, { ...P, minSamples: 0 });
    const b = rateComposite(...many, 1, { ...P, minSamples: 0 });
    expect(a.p).toBeLessThan(b.p);
    expect(a.p).toBeGreaterThan(0.5);
    expect(b.p).toBeGreaterThan(0.98);
  });

  it('is the same at any zoom, frame gain and sample weight (they divide out)', () => {
    const list = rows(300, 0.65, 7);
    const base = rateComposite(...pass(list, 1), 1, P);
    for (const gain of [1, 1 / 64, 2048]) {
      for (const clamp of [1, 0.03, 9]) {
        const t = rateComposite(...pass(list, gain, clamp), 1 / gain, P);
        expect(t.n).toBeCloseTo(base.n, 6);
        expect(t.p).toBeCloseTo(base.p, 9);
        expect(t.t).toBeCloseTo(base.t, 9);
        expect(t.fade).toBeCloseTo(base.fade, 9);
      }
    }
  });

  it('frames of every k-th row, weighed k and merged as a running mean, add up to the whole: no flicker as they merge', () => {
    const list = rows(240, 0.6, 3);
    const whole = rateComposite(...pass(list, 1), 1, P);
    for (const k of [2, 3, 8]) {
      const acc: [number, number, number] = [0, 0, 0];
      let prev: number | null = null;
      for (let f = 0; f < k; f++) {
        const s = pass(list.filter((_, i) => i % k === f), k);
        // The running mean the accumulation keeps (`accumMode: 'mean'`).
        for (let c = 0; c < 3; c++) acc[c] += (s[c] - acc[c]) / (f + 1);
        const now = rateComposite(...acc, 1, P);
        // Each merge moves the share by no more than one frame's worth of rows can.
        if (prev !== null) expect(Math.abs(now.p - prev)).toBeLessThan(0.2);
        prev = now.p;
      }
      const merged = rateComposite(...acc, 1, P);
      expect(merged.p).toBeCloseTo(whole.p, 9);
      expect(merged.n).toBeCloseTo(whole.n, 6);
    }
  });

  it('holds the overall share to tenths of a per cent, so drifting counts do not shift the colours each frame', () => {
    expect(overallShare(5231, 4769)).toBe(0.523);
    expect(overallShare(5232, 4769)).toBe(overallShare(5231, 4769));
    expect(overallShare(0, 0)).toBe(0.5);
  });

  it('is what the shaders run, on both backends, the line heat included', () => {
    for (const src of [HEAT_WGSL, LINE_HEAT_WGSL]) {
      expect(src).toContain('a * a / max(u.shape2.y, 1e-20)');
      expect(src).toContain('select(0.0, a, in.sign > 0.0)');
    }
    expect(HEAT_FS).toContain('a * a / max(uWeight, 1e-20)');
    expect(HEAT_FS).toContain('vSign > 0.0 ? a : 0.0');
    for (const src of [COMPOSITE_WGSL, COMPOSITE_FS]) {
      expect(src).toContain('rr * rr / ss');
      expect(src).toMatch(/smoothstep\(lo \* 0\.5, lo, n\)/);
      expect(src).toMatch(/\(raw \* n \+ m \* u(\.cfg5|RateCfg)\.x\) \/ max\(n \+ m, 1e-30\)/);
    }
  });
});
