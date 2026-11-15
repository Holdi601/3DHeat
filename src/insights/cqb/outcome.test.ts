import { describe, expect, it } from 'vitest';
import { finishCqb } from './finish';
import { rng } from './model';
import { createWalk, K_DEATH, K_KILL, K_POS, stepWalk, type CqbRows } from './walk';

const PLACES = ['T spawn', 'Mid', 'A long', 'B tunnels', 'CT spawn', 'Short'];

/**
 * Elimination rounds of two sides of five, every row carrying its side's
 * result. Players wander between places; side 0 sends someone to Mid in
 * about half the rounds. With `effect`, holding Mid wins side 0 the round
 * `hi` of the time and not holding it `lo`; without, a coin decides. The
 * deaths: the loser's five and a few of the winner's, in a random order.
 */
function rounds(n: number, seed: number, effect: { hi: number; lo: number } | null): CqbRows {
  const R = rng(seed);
  const t: number[] = [], x: number[] = [], z: number[] = [], person: number[] = [], team: number[] = [], session: number[] = [], kind: number[] = [], other: number[] = [], place: number[] = [], won: number[] = [];
  let clock = 0;
  for (let s = 0; s < n; s++) {
    const mid = R() < 0.5;
    const p0 = effect ? (mid ? effect.hi : effect.lo) : 0.5;
    const win0 = R() < p0;
    const plan = Array.from({ length: 10 }, (_, p) => (p === 0 && mid ? 1 : p < 5 ? [0, 2, 3, 5][Math.floor(R() * 4)] : [4, 2, 3, 5][Math.floor(R() * 4)]));
    const push = (tt: number, p: number, k: number, o: number, pl: number) => {
      t.push(tt);
      x.push(pl * 100 + (p % 5) * 3);
      z.push((p < 5 ? 0 : 50) + R());
      person.push(p);
      team.push(p < 5 ? 0 : 1);
      session.push(s);
      kind.push(k);
      other.push(o);
      place.push(pl);
      won.push((p < 5) === win0 ? 1 : 0);
    };
    const start = clock;
    for (let f = 0; f < 40; f++) for (let p = 0; p < 10; p++) push(start + f * 0.5, p, K_POS, -1, f < 4 ? (p < 5 ? 0 : 4) : plan[p]);
    // Deaths: all of the loser's and 0-3 of the winner's, shuffled.
    const losers = [0, 1, 2, 3, 4].map((i) => i + (win0 ? 5 : 0));
    const winners = [0, 1, 2, 3, 4].map((i) => i + (win0 ? 0 : 5));
    const wDie = winners.slice(0, Math.floor(R() * 4));
    const dying = [...losers, ...wDie];
    for (let i = dying.length - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      [dying[i], dying[j]] = [dying[j], dying[i]];
    }
    // The winner's last loser dies last, so the round ends on the winner's terms.
    const lastLoser = dying.filter((p) => losers.includes(p)).pop()!;
    dying.splice(dying.indexOf(lastLoser), 1);
    dying.push(lastLoser);
    const alive = new Set([...Array(10).keys()]);
    let tt = start + 20;
    for (const v of dying) {
      const foes = [...alive].filter((p) => (p < 5) !== (v < 5));
      if (!foes.length) break;
      const k = foes[Math.floor(R() * foes.length)];
      tt += 1 + R() * 2;
      push(tt, v, K_DEATH, k, plan[v]);
      push(tt, k, K_KILL, v, plan[k]);
      alive.delete(v);
    }
    clock = tt + 10;
  }
  const N = t.length;
  return {
    n: N,
    t: Float64Array.from(t),
    x: Float32Array.from(x),
    y: new Float32Array(N),
    z: Float32Array.from(z),
    yaw: null,
    person: Int32Array.from(person),
    team: Int32Array.from(team),
    session: Int32Array.from(session),
    kind: Int8Array.from(kind),
    other: Int32Array.from(other),
    place: Int32Array.from(place),
    weapon: null,
    won: Float32Array.from(won),
    flashed: null,
    buy: null,
  };
}

function outcomeOf(n: number, seed: number, effect: { hi: number; lo: number } | null) {
  const w = createWalk({ upm: 1 });
  stepWalk(w, rounds(n, seed, effect));
  return finishCqb(w, { teams: ['T', 'CT'], places: PLACES, persons: Array.from({ length: 10 }, (_, i) => `P${i}`) })?.outcome;
}

describe('round outcome', () => {
  it('finds the place whose holders win, says turning points and who added the most', () => {
    let found = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const o = outcomeOf(40, seed, { hi: 0.85, lo: 0.2 })!;
      expect(o).toBeTruthy();
      expect(o.rounds).toBe(40);
      expect(o.model).toBe('fitted');
      const f = o.factors.find((x) => x.kind === 'held' && x.place === 'Mid' && x.team === 'T');
      if (f && f.q < 0.05 && f.diff > 0.3) found++;
      expect(o.turns.length).toBeGreaterThan(0);
      for (const tp of o.turns) expect(Math.abs(tp.delta)).toBeLessThanOrEqual(1);
      expect(o.best.length).toBeGreaterThan(0);
      expect(o.best[0].person).toMatch(/^P\d$/);
    }
    expect(found).toBeGreaterThanOrEqual(8);
  });

  it('uses the prior model on one short match and marks small samples', () => {
    const o = outcomeOf(16, 3, { hi: 0.85, lo: 0.2 })!;
    expect(o.model).toBe('prior');
    expect(o.turns.length).toBeGreaterThan(0);
    expect(o.factors.some((f) => f.small)).toBe(true);
  });

  it('holds the false discovery rate on rounds where places do not matter (many seeds)', () => {
    let withAny = 0;
    let tests = 0;
    let falses = 0;
    const SEEDS = 60;
    for (let seed = 100; seed < 100 + SEEDS; seed++) {
      const o = outcomeOf(30, seed, null)!;
      // Places only: the kills decide rounds in this data, and kills are not what is tested here.
      const placed = o.factors.filter((f) => f.kind === 'held' || f.kind === 'early');
      tests += placed.length;
      const hits = placed.filter((f) => f.q < 0.05).length;
      falses += hits;
      if (hits) withAny++;
    }
    // Under the complete null the FDR is the chance of any discovery: 5% nominal, binomial slack over 60 matches.
    expect(withAny / SEEDS).toBeLessThanOrEqual(0.1);
    expect(tests).toBeGreaterThan(SEEDS * 5);
    expect(falses).toBeLessThanOrEqual(SEEDS * 0.15);
  });
});
