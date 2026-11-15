/**
 * Simulated matches with planted behaviour - and the same worlds without it -
 * for the behaviour analysis' tests (`behaviour.test.ts`) and its precision
 * runs: what each measure must find, and must not find, in data whose truth
 * is known.
 */

import { BehaviourAcc, DEATH, FIRE, HURT, KILL, SPAWN } from './acc';
import { rng, type Rng } from './bstats';
import type { BehaviourMetrics } from './types';

const gauss = (r: Rng) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const toward = (a: number, b: number, w: number) => a + w * wrap(b - a);

/**
 * Two sides of eight units fighting over a 600 m square, 0.5 s a step. With
 * `planted`, every effect the behaviour analysis looks for is built in: the
 * side follows its leader's heading four seconds late (alignment, leaders),
 * stragglers die four times as often, speed falls with crowding, a side
 * withdraws once four of eight fell in the last minute, a unit whose last
 * life was lost without a kill pushes ahead, killers who just killed are
 * likelier to kill again, and damage slows a unit for four seconds. Without it the same world runs with none of these.
 */
export function battle(planted: boolean, matches: number, seed: number): BehaviourMetrics {
  const r = rng(seed);
  const acc = new BehaviourAcc({ upm: 1, seed });
  const dt = 0.5;
  const N = 8;
  const S = 600;
  for (let m = 0; m < matches; m++) {
    const T0 = m * 10000;
    type U = { k: number; team: number; x: number; z: number; th: number; v0: number; alive: boolean; back: number; lifeKills: number; prevLoss: boolean; lastKill: boolean; slow: number; hist: number[] };
    const us: U[] = [];
    for (let team = 0; team < 2; team++)
      for (let i = 0; i < N; i++)
        us.push({ k: acc.track(m, team), team, x: team ? 450 + r() * 50 : 100 + r() * 50, z: 250 + r() * 100, th: team ? Math.PI : 0, v0: 2.5 + r(), alive: true, back: 0, lifeKills: 0, prevLoss: false, lastKill: false, slow: -1, hist: [] });
    const Th = [0, Math.PI];
    const deaths: number[][] = [[], []];
    const steps = 360 / dt;
    for (let s = 0; s < steps; s++) {
      const t = T0 + s * dt;
      const cen = [0, 1].map((team) => {
        const a = us.filter((u) => u.team === team && u.alive);
        return a.length ? [a.reduce((p, u) => p + u.x, 0) / a.length, a.reduce((p, u) => p + u.z, 0) / a.length] : [300, 300];
      });
      for (let team = 0; team < 2; team++) {
        const e = cen[1 - team];
        const c = cen[team];
        const toE = Math.atan2(e[1] - c[1], e[0] - c[0]);
        while (deaths[team].length && deaths[team][0] < t - 60) deaths[team].shift();
        Th[team] = toward(Th[team] + 0.08 * gauss(r), toE, 0.05);
        // A rout: a side that lost four in the last minute turns away from the enemy.
        if (planted && deaths[team].length >= 4) Th[team] = toE + Math.PI;
      }
      for (const u of us) {
        if (!u.alive) {
          if (t >= u.back) {
            u.alive = true;
            u.x = u.team ? 450 + r() * 50 : 100 + r() * 50;
            u.z = 250 + r() * 100;
            u.lifeKills = 0;
            acc.event(SPAWN, u.k, t);
          } else continue;
        }
        const mates = us.filter((v) => v !== u && v.alive && v.team === u.team);
        const lead = us.find((v) => v.team === u.team && v.alive && v !== u && us.indexOf(v) === u.team * N);
        const e = cen[1 - u.team];
        const toE = Math.atan2(e[1] - u.z, e[0] - u.x);
        if (planted) {
          // The leader steers by the side's heading; the rest copy the leader's heading of four seconds ago.
          const isLead = us.indexOf(u) === u.team * N;
          const want = isLead || !lead || lead.hist.length < 8 ? Th[u.team] : lead.hist[lead.hist.length - 8];
          const routing = deaths[u.team].length >= 4;
          u.th = toward(want + 0.2 * gauss(r), Math.atan2(cen[u.team][1] - u.z, cen[u.team][0] - u.x), routing ? 0 : 0.1);
          // A unit whose last life was lost without a kill pushes towards the enemy - unless its side is routing.
          if (u.prevLoss && deaths[u.team].length < 4) u.th = toward(u.th, toE, 0.9);
        } else u.th = toward(u.th + 0.3 * gauss(r), toE, 0.05);
        u.hist.push(u.th);
        if (u.hist.length > 20) u.hist.shift();
        let v = u.v0;
        if (planted) {
          const near = us.filter((w) => w !== u && w.alive && (w.x - u.x) ** 2 + (w.z - u.z) ** 2 < 144).length;
          v *= Math.max(0.25, 1 - 0.15 * near);
          if (t < u.slow) v *= 0.2;
          if (u.prevLoss) v *= 1.4;
          if (deaths[u.team].length >= 4) v *= 1.5;
        }
        u.x = Math.min(S, Math.max(0, u.x + Math.cos(u.th) * v * dt));
        u.z = Math.min(S, Math.max(0, u.z + Math.sin(u.th) * v * dt));
        acc.pos(u.k, t, u.x, u.z);
        if (r() < 0.2 * dt) acc.event(FIRE, u.k, t);
        if (r() < dt / 40) {
          acc.event(HURT, u.k, t);
          u.slow = t + 4;
        }
        const dn = mates.reduce((b, w) => Math.min(b, Math.hypot(w.x - u.x, w.z - u.z)), Infinity);
        const h = (1 / 250) * (planted && dn > 60 ? 4 : 1);
        if (r() < h * dt) {
          const foes = us.filter((w) => w.alive && w.team !== u.team);
          if (!foes.length) continue;
          const wts = foes.map((f) => (planted && f.lastKill ? 4 : 1));
          let pick = r() * wts.reduce((a, b) => a + b, 0);
          let kIdx = 0;
          while (pick > wts[kIdx]) pick -= wts[kIdx++];
          const killer = foes[Math.min(kIdx, foes.length - 1)];
          acc.event(DEATH, u.k, t);
          acc.event(KILL, killer.k, t);
          killer.lifeKills++;
          killer.lastKill = true;
          u.lastKill = false;
          u.prevLoss = u.lifeKills === 0;
          u.alive = false;
          u.back = t + 6;
          deaths[u.team].push(t);
        }
      }
    }
  }
  return acc.finish();
}

/**
 * Walkers on a lattice of junctions 40 m apart, two sides of six. At each
 * junction a walker picks an exit by the junction's own odds; with `planted`
 * it copies, six times in ten, the exit the last teammate took there within
 * 30 s (a route cascade).
 */
export function lattice(planted: boolean, matches: number, seed: number): BehaviourMetrics {
  const r = rng(seed);
  const acc = new BehaviourAcc({ upm: 1, seed });
  const G = 40;
  const n = 10;
  const odds = Array.from({ length: n * n }, () => [r() + 0.2, r() + 0.2, r() + 0.2, r() + 0.2]);
  const D = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  for (let m = 0; m < matches; m++) {
    const T0 = m * 10000;
    const last = new Map<number, { t: number; d: number }>();
    const ws = Array.from({ length: 12 }, (_, i) => ({ k: acc.track(m, i % 2), team: i % 2, jx: 1 + Math.floor(r() * 8), jz: 1 + Math.floor(r() * 8), d: Math.floor(r() * 4), f: 0 }));
    for (let s = 0; s < 1200; s++) {
      const t = T0 + s * 0.5;
      for (const w of ws) {
        w.f += 0.05;
        if (w.f >= 1) {
          w.jx += D[w.d][0];
          w.jz += D[w.d][1];
          w.f = 0;
          const j = w.jz * n + w.jx;
          const ok = [0, 1, 2, 3].filter((d) => d !== (w.d + 2) % 4 && w.jx + D[d][0] >= 0 && w.jx + D[d][0] < n && w.jz + D[d][1] >= 0 && w.jz + D[d][1] < n);
          const prev = last.get(j * 2 + w.team);
          let d: number;
          if (planted && prev && t - prev.t <= 30 && ok.includes(prev.d) && r() < 0.6) d = prev.d;
          else {
            const o = ok.map((x) => odds[j][x]);
            let p = r() * o.reduce((a, b) => a + b, 0);
            let i = 0;
            while (p > o[i]) p -= o[i++];
            d = ok[Math.min(i, ok.length - 1)];
          }
          w.d = d;
          last.set(j * 2 + w.team, { t, d });
        }
        acc.pos(w.k, t, (w.jx + D[w.d][0] * w.f) * G + gauss(r), (w.jz + D[w.d][1] * w.f) * G + gauss(r));
      }
    }
  }
  return acc.finish();
}

/** Walkers going back and forth along a 20 m wide corridor; with `planted` each direction keeps to its own side. */
export function corridor(planted: boolean, seed: number): BehaviourMetrics {
  const r = rng(seed);
  const acc = new BehaviourAcc({ upm: 1, seed });
  for (let m = 0; m < 4; m++) {
    const ws = Array.from({ length: 16 }, (_, i) => ({ k: acc.track(m, i % 2), x: r() * 400, dir: r() < 0.5 ? 1 : -1, lane: (r() - 0.5) * 18 }));
    for (let s = 0; s < 2400; s++) {
      const t = m * 10000 + s * 0.5;
      for (const w of ws) {
        w.x += w.dir * 1.5;
        if (w.x > 400 || w.x < 0) {
          w.dir = -w.dir;
          w.lane = planted ? w.dir * 5 + gauss(r) * 1.5 : (r() - 0.5) * 18;
        }
        acc.pos(w.k, t, w.x, w.lane + gauss(r) * 0.3);
      }
    }
  }
  return acc.finish();
}

/** Players with 40 duels each; with `planted` a kill follows a kill 65 times in 100 and a death 35 (a hot hand), else a fair coin. */
export function duels(planted: boolean, players: number, seed: number): BehaviourMetrics {
  const r = rng(seed);
  const acc = new BehaviourAcc({ upm: 1, seed });
  for (let i = 0; i < players; i++) {
    const k = acc.track(0, i % 2);
    for (let s = 0; s < 400; s += 2) acc.pos(k, s, i * 10 + r(), r());
    let last = r() < 0.5 ? 1 : 0;
    for (let j = 0; j < 40; j++) {
      const p = planted ? (last ? 0.65 : 0.35) : 0.5;
      last = r() < p ? 1 : 0;
      acc.event(last ? KILL : DEATH, k, 5 + j * 9);
    }
  }
  return acc.finish();
}

/**
 * Rounds of a buy economy, two sides of five: each player's loadout value in
 * each round (eco, force, full). With `planted` a side buys alike - each
 * player takes the side's call eight times in ten - else everyone buys alone
 * with the same odds.
 */
export function buyRounds(planted: boolean, matches: number, seed: number): BehaviourMetrics {
  const r = rng(seed);
  const acc = new BehaviourAcc({ upm: 1, seed });
  const pick = () => {
    const u = r();
    return u < 0.3 ? 0 : u < 0.5 ? 1 : 2;
  };
  for (let m = 0; m < matches; m++) {
    const ks = Array.from({ length: 10 }, (_, i) => acc.track(m, i < 5 ? 0 : 1));
    for (let round = 0; round < 24; round++) {
      const t = m * 10000 + round * 100;
      const call = [pick(), pick()];
      ks.forEach((k, i) => {
        const side = i < 5 ? 0 : 1;
        const c = planted && r() < 0.8 ? call[side] : pick();
        acc.loadout(k, round, t, [800, 2500, 5000][c] + r() * 300, true);
        for (let s = 0; s < 20; s += 2) acc.pos(k, t + s, i * 30 + s, side * 100);
      });
    }
  }
  return acc.finish();
}
