/**
 * What each behaviour measure shows, in the knowledge base's patterns
 * (`../knowledge/patterns-behaviour.ts`), with its reason in a sentence: the
 * lens (`../lens.ts`) reads them like its own metrics, keyed `lens.<measure>`,
 * so the panel, the debrief and the external model's request all carry them.
 * English, like the rest of the lens.
 */

import type { BehaviourMetrics } from './types';

export interface BehaviourShows {
  patterns: Record<string, number>;
  why: string;
  weight: number;
}

// Values come through JSON: a measure that could not be taken is null.
const r2 = (v: number | null) => (v === null || !Number.isFinite(v) ? '?' : Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(2).replace(/\.?0+$/, '') || '0');
const pct = (v: number | null) => (v === null || !Number.isFinite(v) ? '?' : `${Math.round(v * 100)}%`);
const fin = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.3);
const sig = (p: number) => (p < 0.001 ? 1 : p < 0.01 ? 0.85 : p < 0.05 ? 0.65 : 0.3);
const pq = (p: number, q: number) => `p ${p < 0.001 ? '< 0.001' : r2(p)}, q ${q < 0.001 ? '< 0.001' : r2(q)}`;

const IDS = new Set(['order', 'herding', 'lanes', 'crowding', 'leaders', 'cohesion', 'breaking', 'risk', 'streaks', 'buy', 'suppression'].map((k) => `lens.${k}`));

/** Whether a lens metric id (`lens.<measure>`) is one of the behaviour measures. */
export function isBehaviour(id: string): boolean {
  return IDS.has(id);
}

export function behaviourShows(b: BehaviourMetrics | undefined): Map<string, BehaviourShows> {
  const out = new Map<string, BehaviourShows>();
  if (!b) return out;
  const O = b.order;
  if (O) {
    const excess = O.polar - O.polarNull;
    const real = O.q < 0.05 && excess > 0.03;
    const pats: Record<string, number> = real ? { 'collective-order': 1, coordination: 0.5, flow: 0.3 } : { 'collective-order': 0.4 };
    if (O.states.milling >= 0.1) pats.milling = 0.8;
    const fight = O.outcome ? `; in ${O.outcome.windows} fights the more aligned side took ${pct(O.outcome.share)} of ${O.outcome.kills} kills (p ${r2(O.outcome.p)})` : '';
    out.set('lens.order', {
      patterns: pats,
      why: `Moving units of a side were aligned to a polarisation of ${r2(O.polar)} against ${r2(O.polarNull)} with their tracks shifted in time (excess ${r2(excess)}, 95% interval ${r2(O.lo)} to ${r2(O.hi)}, ${pq(O.p, O.q)}); ${pct(O.states.polarised)} of the time polarised, ${pct(O.states.milling)} milling, ${pct(O.states.swarm)} swarming${fight}.`,
      weight: sig(O.q) * Math.min(1, Math.abs(excess) * 4 + 0.2),
    });
  }
  const H = b.herding;
  if (H) {
    const up = H.index > 1 && H.q < 0.05;
    out.set('lens.herding', {
      patterns: up ? { herding: 1, conformity: 0.5, flow: 0.3 } : { herding: 0.5 },
      why: `A unit left a place the way the teammate who passed it in the ${H.windowSecs} s before had left in ${H.same} of ${H.pairs} passes, ${r2(H.index)}× what the place's own exit shares predict (95% interval ${r2(H.lo)} to ${r2(H.hi)}, ${pq(H.p, H.q)})${H.enemyIndex !== null ? `; after an enemy's pass ${r2(H.enemyIndex)}×` : ''} - copying or a plan the side shares, which movement alone cannot tell apart.`,
      weight: sig(H.q) * Math.min(1, Math.abs(Math.log(H.index)) * 3 + 0.2),
    });
  }
  const La = b.lanes;
  if (La) {
    const laned = La.q < 0.05 && La.segregation > La.segregationNull;
    const trails = La.trailTop10 >= 0.35;
    out.set('lens.lanes', {
      patterns: laned || trails ? { 'lane-formation': 1, 'avenue-of-approach': 0.5, flow: 0.5 } : { 'lane-formation': 0.4, flow: 0.4 },
      why: `${La.cells ? `In ${La.cells} places with movement both ways, the two directions kept to separate lanes by ${r2(La.segregation)} against ${r2(La.segregationNull)} by chance (${pq(La.p, La.q)}); ` : ''}the busiest tenth of the ground carried ${pct(La.trailTop10)} of all movement (Gini ${r2(La.gini)})${La.persistence !== null ? `, and the matches' busiest ground overlapped by ${r2(La.persistence)} against ${r2(La.persistenceNull ?? NaN)} for random ground` : ''}.`,
      weight: Math.max(laned ? sig(La.q) : 0.3, trails ? 0.6 : 0.3),
    });
  }
  const C = b.crowding;
  if (C) {
    const pats: Record<string, number> = { crowding: 1 };
    if (C.rhoChoke !== null && C.rhoChoke < -0.1) pats.chokepoint = 0.6;
    if (C.deathRR !== null && C.deathRR > 1 && (C.deathP ?? 1) < 0.05) pats['area-fire'] = 0.5;
    if (C.effort && C.effort[2] < C.effort[0] && (C.effortP ?? 1) < 0.05) pats['social-loafing'] = 0.9;
    out.set('lens.crowding', {
      patterns: pats,
      why: `Speed against neighbours within ${r2(C.radius)} m: ρ = ${r2(C.rho)} (${pq(C.p, C.q)})${C.rhoChoke !== null ? `, on the busiest ground ρ = ${r2(C.rhoChoke)}` : ''}; flow peaks and falls by ${pct(Math.max(0, C.drop))} in the densest crowds${C.deathRR !== null ? `; deaths an hour among three or more neighbours ${r2(C.deathRR)}× those alone (95% interval ${r2(C.deathLo!)} to ${r2(C.deathHi!)})` : ''}${C.effort ? `; shots a minute with 0, 1-2, 3+ teammates near: ${C.effort.map(r2).join(', ')}` : ''}.`,
      weight: sig(C.q) * Math.min(1, Math.abs(C.rho) * 3 + 0.2),
    });
  }
  const Ld = b.leaders;
  if (Ld) {
    const share = Ld.led / Math.max(1, Ld.pairs);
    out.set('lens.leaders', {
      patterns: share > 0.08 && Ld.q < 0.05 ? { leadership: 1, coordination: 0.6, 'collective-order': 0.3 } : { leadership: 0.5 },
      why: `Of ${Ld.pairs} teammate pairs that moved together, ${Ld.led} (${pct(share)}) had one turning a median ${r2(Ld.lagSecs)} s before the other, against 5% by chance (${pq(Ld.p, Ld.q)})${Ld.transitive !== null ? `; ${pct(Ld.transitive)} of ${Ld.triads} triads ordered transitively (75% by chance)` : ''}${Ld.deathRR !== null ? `; leaders died at ${r2(Ld.deathRR)}× and killed at ${r2(Ld.killRR ?? NaN)}× the rate of followers` : ''}.`,
      weight: sig(Ld.q) * Math.min(1, share * 4 + 0.2),
    });
  }
  const Co = b.cohesion;
  if (Co) {
    const costly = Co.deathRR > 1 && Co.q < 0.05;
    out.set('lens.cohesion', {
      patterns: costly ? { cohesion: 1, 'mutual-support': 0.6, 'defeat-in-detail': 0.5 } : { cohesion: 0.6, 'mutual-support': 0.3 },
      why: `Units spent ${pct(Co.stragglerShare)} of their time beyond three times their side's typical spacing (${r2(Co.spacing)} m to the nearest teammate) and died there at ${r2(Co.deathRR)}× the rate of units with the group (95% interval ${r2(Co.lo)} to ${r2(Co.hi)}, ${pq(Co.p, Co.q)})${Co.outcomeRho !== null ? `; a side's spacing and its share of a fight's kills correlate at ρ = ${r2(Co.outcomeRho)}` : ''}.`,
      weight: sig(Co.q) * Math.min(1, Math.abs(Math.log(Math.max(0.01, Co.deathRR))) * 2 + 0.2),
    });
  }
  const B = b.breaking;
  if (B) {
    const parts = B.approach.map((a, i) => (a === null ? null : `${B.edges[i] === 0 ? 'no losses' : `${pct(B.edges[i])}+ lost`} ${r2(a)}`)).filter(Boolean);
    out.set('lens.breaking', {
      patterns: B.breakAt !== null ? { 'breaking-point': 1, panic: 0.4, attrition: 0.3 } : { 'breaking-point': 0.6, attrition: 0.3 },
      why: `Approach towards the enemy (in the side's own pace; negative withdraws) by the share of the side lost in the last minute: ${parts.join(', ')} (ρ = ${r2(B.rho)}, ${pq(B.p, B.q)}, ${B.windows} windows)${B.breakAt !== null ? `; sides withdraw faster than a tenth of their pace once ${pct(B.breakAt)} or more are lost` : '; no loss level at which sides withdraw significantly'}.`,
      weight: sig(B.q) * Math.min(1, Math.abs(B.rho) * 3 + (B.breakAt !== null ? 0.4 : 0.1)),
    });
  }
  const R = b.risk;
  if (R) {
    const d = R.afterLoss - R.afterWin;
    out.set('lens.risk', {
      patterns: R.tilt && R.tilt.p < 0.05 && R.tilt.after > R.tilt.otherwise ? { 'loss-chasing': 1, panic: 0.3 } : { 'loss-chasing': 1 },
      why: `After a life lost without a kill units spent ${pct(R.afterLoss)} of the next one ahead of their side towards the enemy, after a life with a kill ${pct(R.afterWin)} (difference ${r2(d)}, 95% interval ${r2(R.lo)} to ${r2(R.hi)}, ${pq(R.p, R.q)}, ${R.pairs} lives)${R.tilt ? `; an early death followed an early death ${pct(R.tilt.after)} of the time against ${pct(R.tilt.otherwise)} otherwise (p ${r2(R.tilt.p)})` : ''}.`,
      weight: sig(R.q) * Math.min(1, Math.abs(d) * 5 + 0.2),
    });
  }
  const S = b.streaks;
  if (S) {
    const k = S.ks.reduce((a, x) => (x.p < a.p ? x : a), S.ks[0]);
    const hot = k.corrected > 0 && S.q < 0.05;
    out.set('lens.streaks', {
      patterns: hot ? { 'hot-hand': 1, 'skill-dispersion': 0.3 } : { 'hot-hand': 0.7 },
      why: `After ${k.k} kill${k.k > 1 ? 's' : ''} in a row the next outcome was a kill ${r2(k.diff)} more often than after ${k.k} death${k.k > 1 ? 's' : ''} in a row (${k.players} players); shuffling each player's own sequence gives ${r2(k.bias)} (the finite-sequence bias), so the corrected streak effect is ${r2(k.corrected)} (p ${r2(k.p)}, ${pq(S.p, S.q)} over ${S.ks.length} streak lengths).`,
      weight: sig(S.q) * Math.min(1, Math.abs(k.corrected) * 4 + 0.2),
    });
  }
  const Y = b.buy;
  if (Y) {
    out.set('lens.buy', {
      patterns: Y.kappa > Y.kappaNull && Y.q < 0.05 ? { conformity: 1, economy: 0.6, coordination: 0.5 } : { conformity: 0.5, economy: 0.4 },
      why: `Within a side's round, loadouts (eco, force, full) agreed at Fleiss' κ = ${r2(Y.kappa)} against ${r2(Y.kappaNull)} with the buys shuffled across the side's rounds (${pq(Y.p, Y.q)}, ${Y.rounds} side-rounds); everyone bought alike in ${pct(Y.unanimous)} against ${pct(Y.unanimousNull)}.`,
      weight: sig(Y.q) * Math.min(1, Math.abs(Y.kappa - Y.kappaNull) * 2 + 0.2),
    });
  }
  const P = b.suppression;
  if (P) {
    const d = P.speedHit - P.speedControl;
    out.set('lens.suppression', {
      patterns: P.q < 0.05 ? { suppression: 1, panic: d > 0 ? 0.4 : 0.1, 'static-exposure': d < 0 ? 0.3 : 0 } : { suppression: 0.6 },
      why: `In the 4 s after taking damage, units changed speed by ${r2(P.speedHit)} of their pace against ${r2(P.speedControl)} at their other moments (95% interval of the difference ${r2(P.lo)} to ${r2(P.hi)}, ${pq(P.p, P.q)}, ${P.events} hits)${P.fireHit !== null ? `; their shots a minute changed by ${r2(P.fireHit)} against ${r2(P.fireControl ?? NaN)} (p ${r2(P.fireP ?? 1)})` : ''}.`,
      weight: sig(P.q) * Math.min(1, Math.abs(d) * 3 + 0.2),
    });
  }
  for (const v of out.values()) v.weight = fin(v.weight);
  return out;
}
