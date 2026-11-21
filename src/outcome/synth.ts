/**
 * Made-up matches for the outcome analysis' checks (`outcome.test.ts`) and
 * its smoke step: two sides on a square map, five lives each, every life
 * walking from its side's spawn toward the middle by one of three routes
 * (left, straight, right) and holding there, a few losses on the way. What
 * decides the winner is planted: a route, a zone held, an early lead - or
 * nothing at all (the null check: a fair coin).
 */

import { rng } from '../insights/cqb/model';
import { MOVES_VERSION, type MovesSection } from './types';
import type { OutcomeMatch } from './features';

export interface SynthPlant {
  /** Side 0 wins this much more often when two or more of its lives take the left route. */
  routeLeft?: number;
  /** Side 1 wins this much more often when it sends lives to the far right corner zone in the second window. */
  holdCorner?: number;
  /**
   * A consequence, not a cause: the winner is decided by an early kill lead (first window), and
   * side 0 only goes to the far corner in the third window when it is ahead.
   */
  aheadCorner?: boolean;
}

const SPAWNS: [number, number][] = [[100, 100], [900, 900]];

/** `n` matches of one round each, seconds `len` long, sampled every 5 s. */
export function synthMatches(n: number, seed: number, plant: SynthPlant = {}, len = 300): OutcomeMatch[] {
  const rand = rng(seed);
  const out: OutcomeMatch[] = [];
  const dt = 5;
  const steps = Math.floor(len / dt);
  for (let m = 0; m < n; m++) {
    const routes = [0, 1].map(() => Array.from({ length: 5 }, () => Math.floor(rand() * 3)));
    const corner = rand() < 0.35;
    // Early losses: who leads after the first window.
    const lossesEarly = [Math.floor(rand() * 3), Math.floor(rand() * 3)];
    let p0 = 0.5;
    if (plant.routeLeft) p0 += routes[0].filter((r) => r === 0).length >= 2 ? plant.routeLeft / 2 : -plant.routeLeft / 2;
    if (plant.holdCorner) p0 -= corner ? plant.holdCorner / 2 : -plant.holdCorner / 2;
    const lead0 = lossesEarly[1] - lossesEarly[0];
    if (plant.aheadCorner) p0 = lead0 > 0 ? 0.8 : lead0 < 0 ? 0.2 : 0.5;
    const winner = rand() < p0 ? 0 : 1;
    const l: number[] = [];
    const players: string[] = [];
    const d: number[] = [];
    for (let s = 0; s < 2; s++) {
      const [sx, sz] = SPAWNS[s];
      const dir = s === 0 ? 1 : -1;
      for (let k = 0; k < 5; k++) {
        const p = players.length;
        players.push(`p${s}-${Math.floor(rand() * 20)}`);
        const r = routes[s][k];
        // The route's bend: left, straight or right as the side sees it.
        const bend = (r - 1) * 250 * dir;
        const pts: number[] = [];
        for (let j = 0; j < steps; j++) {
          const f = Math.min(1, (j * dt) / 90);
          let x = sx + dir * 400 * f + bend * Math.sin(Math.PI * f) * 0.5;
          let z = sz + dir * 400 * f - bend * Math.sin(Math.PI * f) * 0.5;
          // The corner: side 1's lives in the second window, or side 0's in the third when ahead.
          const t = j * dt;
          if (s === 1 && corner && k < 2 && t >= 45 && t < 90) [x, z] = [930, 70];
          if (s === 0 && plant.aheadCorner && lead0 > 0 && k < 2 && t >= 90 && t < 180) [x, z] = [930, 70];
          x += (rand() - 0.5) * 20;
          z += (rand() - 0.5) * 20;
          pts.push(Math.round(x), Math.round(z));
        }
        l.push(0, s, 5, p, 0, steps, ...pts);
      }
      for (let k = 0; k < lossesEarly[s]; k++) d.push(0, Math.round((10 + rand() * 30) * 10), 500, 500, s);
    }
    const mv: MovesSection = { v: MOVES_VERSION, dt, q: 1, r: [1, 0, steps, winner], l, players, d };
    out.push({ i: m, started: Date.UTC(2026, 0, 1) + m * 3_600_000, teams: ['alpha', 'bravo'], mv });
  }
  return out;
}
