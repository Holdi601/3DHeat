import { describe, expect, it } from 'vitest';
import { fleissKappa, rng } from './bstats';
import { streakDiff } from './choice';
import { BEHAVIOUR_KB } from '../knowledge/behaviour';
import { readShows } from '../lens';
import { battle, buyRounds, corridor, duels, lattice } from './sim';
import { behaviourShows } from './shows';

describe('behaviour statistics', () => {
  it('shows the finite-sequence bias of the streak estimator that Miller and Sanjurjo describe', () => {
    // Fair coins, four flips: the mean of P(heads | heads before) - P(heads | tails before) over sequences is negative.
    let s = 0;
    let n = 0;
    for (let i = 0; i < 16; i++) {
      const q = [i & 1, (i >> 1) & 1, (i >> 2) & 1, (i >> 3) & 1];
      const d = streakDiff(q, 1);
      if (d === d) {
        s += d;
        n++;
      }
    }
    expect(s / n).toBeLessThan(-0.2);
  });

  it('computes Fleiss kappa: 1 for full agreement, about 0 for chance', () => {
    expect(fleissKappa([[3, 0, 0], [0, 3, 0], [0, 0, 3]], 3).kappa).toBeCloseTo(1, 6);
    const r = rng(5);
    const rows = Array.from({ length: 400 }, () => {
      const c = [0, 0, 0];
      for (let i = 0; i < 5; i++) c[Math.floor(r() * 3)]++;
      return c;
    });
    expect(Math.abs(fleissKappa(rows, 3).kappa)).toBeLessThan(0.05);
  });
});

describe('behaviour on simulated battles', () => {
  const P = battle(true, 30, 7);
  const Z = battle(false, 30, 7);

  it('finds every planted effect', () => {
    expect(P.order!.polar).toBeGreaterThan(P.order!.polarNull + 0.05);
    expect(P.order!.q).toBeLessThan(0.05);
    expect(P.leaders!.led / P.leaders!.pairs).toBeGreaterThan(Z.leaders ? Z.leaders.led / Z.leaders.pairs : 0.05);
    expect(P.leaders!.q).toBeLessThan(0.05);
    expect(P.leaders!.lagSecs).toBeGreaterThanOrEqual(2);
    expect(P.leaders!.lagSecs).toBeLessThanOrEqual(6);
    expect(P.cohesion!.deathRR).toBeGreaterThan(1.5);
    expect(P.cohesion!.q).toBeLessThan(0.05);
    expect(P.crowding!.rho).toBeLessThan(0);
    expect(P.crowding!.q).toBeLessThan(0.05);
    expect(P.breaking!.breakAt).not.toBeNull();
    // Risk after losses has the least power of the measures (lives are few and short): direction and a loose bound here.
    expect(P.risk!.afterLoss).toBeGreaterThan(P.risk!.afterWin);
    expect(P.risk!.p).toBeLessThan(0.25);
    expect(P.suppression!.speedHit).toBeLessThan(P.suppression!.speedControl);
    expect(P.suppression!.q).toBeLessThan(0.05);
  });

  it('finds nothing where nothing was planted', () => {
    for (const k of ['order', 'herding', 'lanes', 'cohesion', 'crowding', 'breaking', 'risk', 'buy', 'suppression'] as const) {
      const v = Z[k];
      if (v) expect(v.q, k).toBeGreaterThanOrEqual(0.05);
    }
    if (Z.leaders) expect(Z.leaders.led / Z.leaders.pairs).toBeLessThan(0.07);
  });

  it('finds side-wide buys only where planted', () => {
    const bp = buyRounds(true, 4, 5).buy!;
    const bz = buyRounds(false, 4, 5).buy!;
    expect(bp.kappa).toBeGreaterThan(bp.kappaNull + 0.3);
    expect(bp.p).toBeLessThan(0.01);
    expect(bz.p).toBeGreaterThan(0.05);
  });

  it('finds a planted hot hand and corrects the streak bias of fair coins', () => {
    const hot = duels(true, 40, 11).streaks!;
    expect(hot.ks[0].corrected).toBeGreaterThan(0.15);
    expect(hot.p).toBeLessThan(0.01);
    const fair = duels(false, 40, 11).streaks!;
    // The raw difference of fair coins is negative (the bias); shuffled sequences carry the same bias.
    expect(fair.ks[0].diff).toBeLessThan(0);
    for (const k of fair.ks) expect(k.bias).toBeLessThan(0);
    expect(fair.p).toBeGreaterThan(0.05);
  });

  it('finds route herding and lanes only where planted', () => {
    const hp = lattice(true, 6, 3).herding!;
    const hz = lattice(false, 6, 3).herding!;
    expect(hp.index).toBeGreaterThan(1.2);
    expect(hp.p).toBeLessThan(0.01);
    expect(hz.p).toBeGreaterThan(0.05);
    const lp = corridor(true, 4).lanes!;
    const lz = corridor(false, 4).lanes!;
    expect(lp.segregation).toBeGreaterThan(lp.segregationNull + 0.2);
    expect(lp.p).toBeLessThan(0.01);
    expect(lz.p).toBeGreaterThan(0.05);
  });

  it('reads every measure through the knowledge base, with citations', () => {
    const own = new Set(BEHAVIOUR_KB.map((e) => e.id));
    const shows = behaviourShows(P);
    expect(shows.size).toBeGreaterThanOrEqual(9);
    for (const [id, sh] of shows) {
      expect(sh.why.length, id).toBeGreaterThan(40);
      expect(sh.weight, id).toBeGreaterThan(0);
      const rd = readShows(id, sh, 'auto', new Set(), 3);
      expect(rd.literature.length, id).toBeGreaterThan(0);
      expect(rd.literature.some((h) => own.has(h.id)), id).toBe(true);
      expect(rd.literature[0].cites, id).toMatch(/\(.+\d{4}/);
    }
  });
});
