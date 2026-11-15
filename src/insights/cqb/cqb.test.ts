import { describe, expect, it } from 'vitest';
import { CANON } from '../../data/canonical';
import type { Dataset } from '../../state/types';
import { FULL_SCOPE } from '../../volumes/stats';
import { KB, KB_BY_ID, PATTERNS, REF_BY_ID } from '../knowledge';
import { buildFactors } from '../../breakdown/breakdownRun';
import { cqbSync } from './run';
import { SITUATION_COLUMN, situationsSync } from './factors';
import { cqbShows } from './shows';
import { finishCqb, type CqbMetrics } from './finish';
import { calibrate, ebShrink, fisher, fitLogit, newcombe, permMeans, ridgeSparse } from './model';
import { NULL_EFFECTS, synthRounds, type SynthEffects } from './synth';
import { createWalk, rawKind, stepWalk, F_MAN_SHIFT, F_OPENING, F_TRADED, K_DEATH, K_FLASH, K_KILL, K_PLANT, K_POS, K_SKIP } from './walk';

function run(rounds: number, fx: SynthEffects, seed: number): CqbMetrics {
  const w = createWalk({ upm: 1 });
  stepWalk(w, synthRounds(rounds, fx, seed));
  const m = finishCqb(w, { teams: ['red', 'blue'], places: ['home', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6'], weapons: [] });
  expect(m).toBeDefined();
  return m!;
}

describe('close-quarters statistics', () => {
  it('tests two shares exactly and bounds their difference', () => {
    // Fisher's tea-tasting table.
    expect(fisher(3, 1, 1, 3)).toBeCloseTo(0.4857, 3);
    expect(fisher(10, 0, 0, 10)).toBeLessThan(0.001);
    const [lo, hi] = newcombe(30, 50, 20, 50);
    expect(lo).toBeLessThan(0.2);
    expect(hi).toBeGreaterThan(0.2);
    expect(lo).toBeGreaterThan(0);
    expect(permMeans([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]).p).toBeGreaterThan(0.5);
    expect(permMeans([10, 11, 12, 13, 14, 15], [1, 2, 3, 4, 5, 6]).p).toBeLessThan(0.01);
  });

  it('fits a logistic model, calibrates it, shrinks means and solves a ridge', () => {
    const n = 4000;
    const X = new Float64Array(n * 2);
    const y = new Float64Array(n);
    let s = 1;
    const R = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const x = R() * 4 - 2;
      X[i * 2] = 1;
      X[i * 2 + 1] = x;
      y[i] = R() < 1 / (1 + Math.exp(-(0.5 + 1.5 * x))) ? 1 : 0;
    }
    const f = fitLogit(X, y, n, 2, 0)!;
    expect(f.beta[0]).toBeCloseTo(0.5, 0);
    expect(f.beta[1]).toBeGreaterThan(1.2);
    expect(f.beta[1]).toBeLessThan(1.8);
    const p = Array.from({ length: n }, (_, i) => 1 / (1 + Math.exp(-(f.beta[0] + f.beta[1] * X[i * 2 + 1]))));
    const c = calibrate(p, y, 1);
    expect(c.ece).toBeLessThan(0.03);
    expect(c.slope).toBeGreaterThan(0.85);
    expect(c.slope).toBeLessThan(1.15);
    expect(c.skill).toBeGreaterThan(0.2);
    // Groups of equal truth: shrinkage pulls their means together.
    const e = ebShrink([10, 0, 5], [10, 0, 5], [20, 20, 20]);
    expect(e.groups[0].mean - e.groups[1].mean).toBeLessThan(0.5);
    // y = x0 - x1 exactly on +-1 rows.
    const off = Int32Array.from([0, 2, 4, 6]);
    const cols = Int32Array.from([0, 1, 0, 1, 0, 1]);
    const vals = Float32Array.from([1, -1, 1, -1, -1, 1]);
    const b = ridgeSparse(off, cols, vals, [2, 2, -2], 2, 1e-6);
    expect(b[0] - b[1]).toBeCloseTo(2, 3);
  });

  it('reads raw event labels', () => {
    expect(rawKind('flash')).toBe(K_FLASH);
    expect(rawKind('bomb_planted')).toBe(K_PLANT);
    expect(rawKind('grenade')).toBe(K_SKIP);
    expect(rawKind('kill')).toBe(-1);
  });

  it('finds planted effects: peeker, crossfire, flash, funnel, aim; and a calibrated model', () => {
    const fx: SynthEffects = { peek: 0.65, cross: 0.3, flash: 0.25, funnel: 0.9, aim: true };
    const m = run(500, fx, 3);
    expect(m.roundBased).toBe(true);
    expect(m.decided).toBe(500);
    // 0.65 planted, less the crossfires and the funnel, plus the flashes: about 0.54 over all duels.
    expect(m.peek!.peeker.share).toBeGreaterThan(0.52);
    expect(m.peek!.q!).toBeLessThan(0.05);
    expect(m.crossfire!.diff).toBeGreaterThan(0.15);
    expect(m.crossfire!.q!).toBeLessThan(0.05);
    expect(m.utility!.flashEntry!.diff).toBeGreaterThan(0.1);
    expect(m.utility!.flashEntry!.q!).toBeLessThan(0.05);
    expect(m.funnel!.places[0].place).toBe('p3');
    expect(m.funnel!.places[0].q!).toBeLessThan(0.05);
    expect(m.aim!.betterAimed.share).toBeGreaterThan(0.9);
    const c = m.winProb!.calibration;
    expect(c.ece).toBeLessThan(0.06);
    expect(c.slope).toBeGreaterThan(0.7);
    expect(c.slope).toBeLessThan(1.3);
    expect(c.skill).toBeGreaterThan(0.1);
    // More players alive is better: the 4v5 side wins less than the 5v4 side.
    const s54 = m.manAdvantage!.find((s) => s.own === 5 && s.enemy === 4)!;
    const s45 = m.manAdvantage!.find((s) => s.own === 4 && s.enemy === 5)!;
    expect(s54.won.share).toBeGreaterThan(s45.won.share);
    expect(m.trades!.deaths).toBeGreaterThan(1000);
    // Every kill gains its side win probability.
    expect(m.actions!.find((a) => a.kind === 'kill')!.mean).toBeGreaterThan(0);
    // The lens reads it, cites and links the knowledge base.
    const shows = cqbShows(m);
    expect(shows.get('lens.cqbPeek')!.patterns['peeker-advantage']).toBe(1);
    expect(shows.get('lens.cqbFunnel')!.why).toMatch(/p3/);
    expect(shows.get('lens.cqbWinProb')!.why).toMatch(/Brier/);
  });

  it('keeps the false discovery rate over 100 null datasets', () => {
    // Every effect off: the tests of planted effects are true nulls. The others (the value of an
    // opening kill, trades, man advantage) measure real structure of any elimination round.
    const SEEDS = 100;
    let fdp = 0;
    let any = 0;
    let nullTests = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const m = run(150, NULL_EFFECTS, 1000 + seed);
      const qs = [
        m.peek?.q,
        m.crossfire?.q,
        m.utility?.flashEntry?.q,
        m.utility?.openingFlash?.q,
        m.aim?.q,
        m.aim?.holderOnAngle?.q,
        m.actions?.find((a) => a.kind === 'flashedKill')?.q,
        ...(m.funnel?.places ?? []).map((p) => p.q),
        ...(m.opening?.places ?? []).map((p) => p.q),
      ].filter((q): q is number => typeof q === 'number');
      nullTests += qs.length;
      const v = qs.filter((q) => q < 0.05).length;
      fdp += v / Math.max(1, m.discoveries);
      if (v) any++;
    }
    expect(nullTests / SEEDS).toBeGreaterThan(15);
    // Nominal 5%, with a band for 100 datasets.
    expect(fdp / SEEDS).toBeLessThanOrEqual(0.05 + 0.03);
    expect(any / SEEDS).toBeLessThanOrEqual(0.15);
  }, 180_000);

  it('has knowledge entries for every CQB pattern, with resolving references', () => {
    const cqb = PATTERNS.filter((p) => ['fatal-funnel', 'crossfire', 'peeker-advantage', 'entry', 'utility-support', 'man-advantage', 'clutch', 'action-value', 'lurk', 'rotation'].includes(p.id));
    expect(cqb.length).toBe(10);
    for (const p of cqb) expect(KB.some((e) => e.patterns[p.id])).toBe(true);
    for (const id of ['concept.fatal-funnel', 'method.round-win-probability', 'method.adjusted-plus-minus', 'concept.peekers-advantage']) {
      const e = KB_BY_ID.get(id)!;
      for (const r of e.refs) expect(REF_BY_ID.has(r)).toBe(true);
      if (e.quote) expect(REF_BY_ID.get(e.quote.ref)!.pd).toBe(true);
    }
  });

  it('runs on a loaded dataset the same as on resolved rows', () => {
    const fx: SynthEffects = { peek: 0.65, cross: 0.3, flash: 0.25, funnel: 0.9, aim: true };
    const r = synthRounds(120, fx, 9);
    const N = r.n;
    const raw = ['position', 'kill', 'death', 'flash', 'plant', 'round_end'];
    const rawOf = (k: number) => (k === K_POS ? 0 : k === K_KILL ? 1 : k === K_DEATH ? 2 : k === K_FLASH ? 3 : k === K_PLANT ? 4 : 5);
    const canon = ['position', 'kill', 'death', 'explosion', 'other'];
    const canonOf = (k: number) => (k === K_POS ? 0 : k === K_KILL ? 1 : k === K_DEATH ? 2 : k === K_FLASH ? 3 : 4);
    const persons = Array.from({ length: 10 }, (_, i) => `p${i}`);
    const cat = (name: string, data: Uint32Array, categories: string[]) => ({ name, kind: 'category', data, min: 0, max: categories.length - 1, categories });
    const ds = {
      id: 'cqb',
      name: 'cqb-synth',
      count: N,
      px: Float32Array.from(r.x),
      py: new Float32Array(N),
      pz: Float32Array.from(r.z),
      time: Float32Array.from(r.t),
      epochMs: null,
      lifetime: null,
      maxLifetimeGap: 1,
      personShared: null,
      yaw: Float32Array.from(r.yaw!),
      pitch: null,
      personId: Uint32Array.from(r.person),
      teamId: Uint16Array.from(r.team),
      personLabels: persons,
      teamLabels: ['red', 'blue'],
      sessionId: Uint32Array.from(r.session),
      sessionLabels: Array.from({ length: 120 }, (_, i) => `r${i}`),
      sessionRows: null,
      sessionStart: null,
      sessionEnd: null,
      personTeam: null,
      personSlot: null,
      teamSizes: null,
      attrs: [
        cat(CANON.event, Uint32Array.from(r.kind as Int8Array, canonOf), canon),
        cat('event', Uint32Array.from(r.kind as Int8Array, rawOf), raw),
        // The other party; category 0 is "none".
        cat('other', Uint32Array.from(r.other!, (o) => o + 1), ['', ...persons]),
        cat('place', Uint32Array.from(r.place!), ['home', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6']),
        { name: 'won', kind: 'number', data: Float32Array.from(r.won!), min: 0, max: 1 },
      ],
      warnings: [],
      bounds: { minX: 0, minY: 0, minZ: 0, maxX: 4000, maxY: 0, maxZ: 4000 },
      timeRange: [0, (r.t as Float64Array)[N - 1]],
      timeSorted: true,
    } as unknown as Dataset;
    const viaDs = cqbSync(ds, FULL_SCOPE)!;
    const w = createWalk({ upm: 1 });
    stepWalk(w, r);
    const direct = finishCqb(w, { teams: ['red', 'blue'] })!;
    expect(viaDs.duels).toBe(direct.duels);
    expect(viaDs.peek!.peeker.k).toBe(direct.peek!.peeker.k);
    expect(viaDs.crossfire!.with.n).toBe(direct.crossfire!.with.n);
    expect(viaDs.funnel!.places[0].place).toBe('p3');
    expect(viaDs.decided).toBe(120);
    // The situations as breakdown factors: one opening duel a round, on its kill and its death row.
    const col = situationsSync(ds)!;
    const bits = col.data as Uint32Array;
    let opening = 0;
    let traded = 0;
    let man = 0;
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] & F_OPENING) opening++;
      if (bits[i] & F_TRADED) traded++;
      if ((bits[i] >> F_MAN_SHIFT) & 3) man++;
    }
    // The kill row, the death row and the victim's row before it (what the breakdown reads a death by).
    expect(opening).toBe(360);
    expect(traded).toBeGreaterThan(0);
    expect(man).toBeGreaterThan(bits.length * 0.5);
    const names = buildFactors(ds).factors.filter((f) => f.column === SITUATION_COLUMN).map((f) => f.value);
    expect(names).toEqual(expect.arrayContaining(['opening', 'traded', 'man-up', 'even', 'man-down', 'flashed']));
  });
});
