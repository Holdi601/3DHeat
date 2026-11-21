import { describe, expect, it } from 'vitest';
import { analyseOutcome, cmh } from './analyze';
import { buildGroup, clusterRoutes } from './features';
import { synthMatches } from './synth';
import { outcomeLines, outcomeMap } from './view';
import { MovesCollector } from './collect';
import { livesOf } from './types';

describe('outcome analysis', () => {
  it('finds a planted winning route and a planted winning zone', async () => {
    const { report } = await analyseOutcome([{ key: 'm', matches: synthMatches(600, 11, { routeLeft: 0.4, holdCorner: 0.4 }) }]);
    const route = report.findings.find((f) => f.kind === 'route' && f.side === 0 && f.diff > 0.1);
    expect(route).toBeTruthy();
    // The left route as side 0 sees it bends toward +x first (its spawn at the low corner).
    expect(route!.with.rate).toBeGreaterThan(route!.without.rate);
    expect(route!.stable).toBe(true);
    const hold = report.findings.find((f) => f.kind === 'hold' && f.side === 1 && f.feature.window === 1 && f.diff > 0.1);
    expect(hold).toBeTruthy();
    expect(hold!.zone!.x0).toBeLessThanOrEqual(930);
    expect(hold!.zone!.x1).toBeGreaterThan(930);
    expect(hold!.folds[0]).toBeGreaterThanOrEqual(4);
  }, 60_000);

  it('finds nothing in a fair coin: the false discovery rate holds over many runs', async () => {
    // Under a fair coin, Benjamini-Hochberg at 5% calls something in about one run of twenty.
    let runs = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const { report } = await analyseOutcome([{ key: 'null', matches: synthMatches(300, seed) }]);
      expect(report.tests).toBeGreaterThan(20);
      if (report.findings.length) runs++;
    }
    expect(runs).toBeLessThanOrEqual(3);
  }, 60_000);

  it('says a pattern that only shows when already ahead is likely a consequence', async () => {
    const { report } = await analyseOutcome([{ key: 'c', matches: synthMatches(800, 21, { aheadCorner: true }) }]);
    const late = report.findings.filter((f) => f.kind === 'hold' && f.side === 0 && f.feature.window === 2 && f.zone && f.zone.x1 > 930 && f.zone.x0 <= 930);
    for (const f of late) expect(f.consequence).toBe(true);
  }, 60_000);

  it('tests within strata: a confounded split vanishes once the strata are allowed for', () => {
    // Within each stratum no difference; pooled, the "with" arm sits in the winning stratum.
    const strata = [
      { a: 80, b: 20, c: 8, d: 2 },
      { a: 2, b: 8, c: 20, d: 80 },
    ];
    const r = cmh(strata);
    expect(Math.abs(r.rd)).toBeLessThan(0.02);
    expect(r.p).toBeGreaterThan(0.5);
  });

  it('clusters routes and draws a map', () => {
    const a = Array.from({ length: 30 }, (_, i) => [0, 0, 10, 0, 20, 0, 30, 0, 40, 0, 50, 0, 60, 0, 70 + (i % 3), 0]);
    const b = Array.from({ length: 30 }, (_, i) => [0, 0, 0, 10, 0, 20, 0, 30, 0, 40, 0, 50, 0, 60, 0, 70 + (i % 3)]);
    const { centres, of } = clusterRoutes([...a, ...b], 15);
    expect(centres.length).toBe(2);
    expect(new Set(of.slice(0, 30)).size).toBe(1);
    expect(of[0]).not.toBe(of[45]);
    const g = buildGroup('m', synthMatches(200, 4, { holdCorner: 0.5 }))!;
    const m = outcomeMap(g, 1, { window: 1 });
    expect(m.zones.length).toBeGreaterThan(3);
    const lines = outcomeLines(m, null, () => 0);
    expect(lines!.count % 2).toBe(0);
    const s = outcomeMap(g, 1, { slice: 2 });
    expect(s.from).toBe(g.slice * 2);
  });

  it('collects moves: steps, lives, deaths and captures', () => {
    const c = new MovesCollector();
    for (let t = 0; t < 120; t += 1) {
      c.pos(0, 0, 5, 'a', 0, t, t, 0, '');
      c.pos(1, 1, 5, 'b', 0, t, 100 - t, 50, 'Mid');
    }
    c.death(0, 60, 50, 0, 1);
    c.objective(-1, 30, 'A', 0, 10, 10);
    const mv = c.finish({ cell: 8, roundNo: [1], result: (_r, s) => (s === 0 ? 1 : 0), slotOut: (s) => s, teams: 2 })!;
    expect(mv.dt).toBe(3);
    expect(mv.r[3]).toBe(0);
    const lives = livesOf(mv);
    expect(lives.length).toBe(2);
    expect(lives[0].n).toBeGreaterThan(30);
    expect(mv.d.length).toBe(5);
    expect(mv.o).toEqual([0, 300, 0, 0]);
    expect(mv.pn).toEqual(['Mid']);
  });
});
