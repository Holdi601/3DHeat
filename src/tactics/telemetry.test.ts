import { describe, expect, it } from 'vitest';
import { CROUCH, earliestArrival, gridAt, speedStats, TrackBuilder, travelTimes, WALKING } from './telemetry';

/** Two rounds: a fast and a slow player running along x at 250 and 125 units a second, sampled 8 times a second. */
function rounds() {
  const b = new TrackBuilder();
  for (const [round, player, speed, state] of [
    ['r1', 'fast', 250, 0],
    ['r1', 'slow', 125, WALKING],
    ['r2', 'fast', 200, CROUCH],
  ] as const) {
    for (let i = 0; i <= 80; i++) {
      const t = i / 8;
      b.add(round, player, 0, t, speed * t, 0, 0, state, 'knife');
    }
  }
  return b.build();
}

describe('telemetry', () => {
  it('sorts samples into runs per player per round', () => {
    const tr = rounds();
    expect(tr.rounds).toEqual(['r1', 'r2']);
    expect(tr.runStart.length).toBe(4);
    expect(tr.runStart[3]).toBe(tr.x.length);
  });

  it('times the way from the round start, and from leaving a place, to another', () => {
    const tr = rounds();
    const to = { x: 1000, z: 0, r: 10 };
    const s = travelTimes(tr, 'roundStart', to);
    expect(s.n).toBe(3);
    // The fast runner reaches x = 990 at 3.96 s, found between samples.
    expect(s.min).toBeCloseTo(3.96, 1);
    expect(s.fastest).toEqual({ player: 'fast', round: 'r1' });
    const from = travelTimes(tr, { x: 0, z: 0, r: 100 }, to);
    expect(from.min).toBeCloseTo((990 - 100) / 250, 0);
  });

  it('maps when each spot was first reached in a round', () => {
    const g = earliestArrival(rounds(), 50, 'min');
    expect(gridAt(g, 510, 0)).toBeCloseTo(2, 0);
    const med = earliestArrival(rounds(), 50, 'median');
    expect(gridAt(med, 510, 0)).toBeGreaterThan(gridAt(g, 510, 0));
  });

  it('measures speeds per movement state', () => {
    const s = speedStats(rounds());
    const by = Object.fromEntries(s.states.map((x) => [x.state, x.p50]));
    expect(by.run).toBeCloseTo(250, 3);
    expect(by.walk).toBeCloseTo(125, 3);
    expect(by.crouch).toBeCloseTo(200, 3);
  });
});
