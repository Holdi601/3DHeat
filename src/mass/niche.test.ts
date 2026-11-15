import { describe, expect, it } from 'vitest';
import { discoverNiches, NicheBuilder, nicheChildren } from './niche';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function binom(r: () => number, n: number, p: number): number {
  let k = 0;
  for (let i = 0; i < n; i++) if (r() < p) k++;
  return k;
}

/** Lives in 400 matches on three maps: each match its own skill swing (clustered), one vehicle on one map and side much stronger when planted. */
function table(plant: boolean, seed = 3) {
  const r = rng(seed);
  const b = new NicheBuilder('lives', ['map', 'vehicle', 'side'], [{ id: 'kd', type: 'share' }]);
  for (let m = 0; m < 400; m++) {
    const map = `m${m % 3}`;
    const swing = (r() - 0.5) * 0.3;
    for (let v = 0; v < 10; v++)
      for (const side of ['a', 'b']) {
        let p = 0.5 + swing * (side === 'a' ? 1 : -1);
        if (plant && v === 3 && map === 'm1' && side === 'a') p = 0.75;
        const n = 2 + Math.floor(r() * 6);
        const k = binom(r, n, Math.min(0.95, Math.max(0.05, p)));
        b.push(m, [map, `v${v}`, side], [[k, n]]);
      }
  }
  return b.done();
}

describe('niche search', () => {
  it('finds a planted vehicle x map x side group and drills into it', () => {
    const run = discoverNiches([table(true)], 400);
    const hit = run.findings.find((f) => f.dir === 1 && f.conds.some((c) => c.v === 'v3') && f.conds.some((c) => c.v === 'm1'));
    expect(hit, JSON.stringify(run.findings.slice(0, 5))).toBeTruthy();
    expect(hit!.shrunk).toBeGreaterThan(1.5);
    expect(hit!.foldsAgree).toBeGreaterThanOrEqual(4);
    const kids = nicheChildren(table(true), 'kd', [{ f: 'vehicle', v: 'v3' }], 400);
    expect(kids.children[0].conds.map((c) => c.v)).toEqual(expect.arrayContaining(['v3']));
    expect(kids.children.some((c) => c.conds.some((x) => x.v === 'm1') && c.dir === 1)).toBe(true);
  });

  it('finds nothing in matches with nothing planted', () => {
    let any = 0;
    for (let s = 0; s < 5; s++) any += discoverNiches([table(false, 10 + s)], 400).findings.length;
    expect(any).toBeLessThanOrEqual(1);
  });
});
