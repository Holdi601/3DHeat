/**
 * The close-quarters metrics as the knowledge lens reads them (`../lens.ts`):
 * for each, the patterns its numbers show and a sentence saying them with the
 * sources the measure follows. Keys are `lens.cqb<Name>`; the panel labels
 * them `lens.metric.cqb<Name>`.
 */

import { shortCite } from '../knowledge';
import type { Shows } from '../lens';
import type { Contrast, CqbMetrics, Share } from './finish';
import './augment';

// Numbers that could not be measured arrive as null (the report is JSON).
const ok = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v);
const pct = (v: number | null) => (ok(v) ? `${Math.round(v * 100)}%` : 'n/a');
const r2 = (v: number | null) => (!ok(v) ? 'n/a' : Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(2).replace(/\.?0+$/, ''));
const ci = (s: Share) => `${pct(s.share)} (${pct(s.lo)}-${pct(s.hi)}, n ${s.n})`;
const cite = (...ids: string[]) => `(${ids.map(shortCite).join('; ')})`;
const q = (v: number | null | undefined) => (!ok(v) ? '' : `, q ${v < 0.001 ? '<0.001' : r2(v)}`);
const sig = (v: number | null | undefined) => (!ok(v) ? 0.3 : v < 0.01 ? 1 : v < 0.05 ? 0.8 : v < 0.2 ? 0.45 : 0.25);
const pp = (c: Contrast) => `${pct(c.with.share)} against ${pct(c.without.share)} (difference ${r2(c.diff * 100)} points, ${r2(c.lo * 100)} to ${r2(c.hi * 100)}${q(c.q)})`;

export function cqbShows(m: CqbMetrics | undefined): Map<string, Shows> {
  const out = new Map<string, Shows>();
  if (!m) return out;
  const W = m.winProb;
  if (W) {
    const c = W.calibration;
    out.set('lens.cqbWinProb', {
      patterns: { 'action-value': 1, 'man-advantage': 0.6 },
      why: `A round win-probability model fitted to ${W.rounds} rounds (${W.snapshots} states) is calibrated out of fold with Brier score ${r2(c.brier)} against ${r2(c.brierBase)} for the base rate (skill ${pct(c.skill)}), calibration error ${r2(c.ece)} and slope ${r2(c.slope)} ${cite('xenopoulos-2022-wp', 'brier-1950', 'guo-2017')}.`,
      weight: Math.min(1, 0.3 + Math.max(0, c.skill)),
    });
  }
  const A = m.actions;
  if (A?.length) {
    const say = (k: string, label: string) => {
      const a = A.find((x) => x.kind === k);
      return a ? `${label} ${r2(a.mean * 100)} points (${r2(a.lo * 100)} to ${r2(a.hi * 100)}${q(a.q)})` : '';
    };
    const parts = [say('kill', 'a kill'), say('openingKill', 'an opening kill'), say('tradeKill', 'a trade'), say('flashedKill', 'a kill behind a flash'), say('plant', 'a plant'), say('flash', 'a flash')].filter(Boolean);
    const best = Math.min(...A.filter((a) => a.q !== undefined).map((a) => a.q!), 1);
    out.set('lens.cqbActions', {
      patterns: { 'action-value': 1, entry: 0.4, 'mutual-support': 0.3, 'utility-support': 0.3 },
      why: `Win probability added, on average: ${parts.join('; ')} ${cite('xenopoulos-2020', 'maymin-2021')}.`,
      weight: Math.max(0.4, sig(best)),
    });
  }
  const O = m.opening;
  if (O) {
    const top = O.places.find((p) => (p.q ?? 1) < 0.05);
    out.set('lens.cqbOpening', {
      patterns: { entry: 1, initiative: 0.6, 'key-terrain': top ? 0.5 : 0.2, balance: Math.abs(O.a.share - 0.5) > 0.08 ? 0.5 : 0.1 },
      why: `${m.teams[0]} won ${ci(O.a)} of ${O.n} opening duels; the side that won the opening took the round ${ci(O.convert)}${top ? `; at ${top.place} ${m.teams[0]} won ${ci(top.a)} of the openings${q(top.q)}` : ''} ${cite('xenopoulos-2020', 'fm3-06-11-2002')}.`,
      weight: Math.min(1, 0.4 + Math.abs(O.convert.share - 0.5)),
    });
  }
  const T = m.trades;
  if (T) {
    out.set('lens.cqbTrades', {
      patterns: T.traded.share < 0.2 ? { 'mutual-support': 1, 'defeat-in-detail': 0.7 } : { 'mutual-support': 1, entry: 0.3 },
      why: `${ci(T.traded)} of deaths were traded within 5 s (median ${r2(T.medianSecs)} s); rounds whose first death was traded were won ${pp(T.firstDeath)} by the side that lost it.`,
      weight: Math.max(0.35, sig(T.firstDeath.q)),
    });
  }
  const P = m.peek;
  if (P) {
    out.set('lens.cqbPeek', {
      patterns: { 'peeker-advantage': 1, initiative: 0.5 },
      why: `Against a player holding still, the player moving into the duel won ${ci(P.peeker)}${q(P.q)} ${cite('tokey-2024', 'bernier-2001')}.`,
      weight: Math.max(0.3, sig(P.q)),
    });
  }
  const M = m.aim;
  if (M) {
    out.set('lens.cqbAim', {
      patterns: { 'peeker-advantage': 0.6, sightlines: 0.5, initiative: 0.4, 'fields-of-fire': 0.3 },
      why: `0.75 s before a kill the killer's view was ${r2(M.killerPreDeg)}° off the victim (median) and the victim's ${r2(M.victimPreDeg)}°; the better-aimed player won ${ci(M.betterAimed)}${q(M.q)}; kills at ${r2(M.rangeM.p25)}-${r2(M.rangeM.p75)} m${M.holderOnAngle ? `; holders on their angle won ${pp(M.holderOnAngle)}` : ''} ${cite('fm3-06-11-2002')}.`,
      weight: Math.max(0.3, sig(M.q)),
    });
  }
  const X = m.crossfire;
  if (X) {
    out.set('lens.cqbCrossfire', {
      patterns: { crossfire: 1, 'mutual-support': 0.6, 'fields-of-fire': 0.4 },
      why: `Holders with a teammate crossing their line onto the peeker won ${pp(X)} of their duels ${cite('fm3-21.8-2007', 'fm3-06-11-2002')}.`,
      weight: Math.max(0.3, sig(X.q)),
    });
  }
  const U = m.utility;
  if (U && (U.flashEntry || U.smokeEntry || U.openingFlash)) {
    const parts = [U.flashEntry ? `peekers behind a flash of their own won ${pp(U.flashEntry)}` : '', U.smokeEntry ? `behind a smoke ${pp(U.smokeEntry)}` : '', U.openingFlash ? `opening duels went to the flashing side ${ci(U.openingFlash.with)}` : ''].filter(Boolean);
    out.set('lens.cqbUtility', {
      patterns: { 'utility-support': 1, surprise: 0.5, entry: 0.4 },
      why: `Utility into entries: ${parts.join('; ')} ${cite('fm3-06-11-2002', 'xenopoulos-2020')}.`,
      weight: Math.max(0.3, sig(Math.min(U.flashEntry?.q ?? 1, U.smokeEntry?.q ?? 1, U.openingFlash?.q ?? 1))),
    });
  }
  const MA = m.manAdvantage;
  if (MA?.length) {
    const show = MA.filter((s) => (s.own === 5 && s.enemy === 4) || (s.own === 4 && s.enemy === 5) || (s.own === 1 && s.enemy === 1) || (s.own === 2 && s.enemy === 1));
    const rows = (show.length ? show : MA.slice(0, 4)).map((s) => `${s.own}v${s.enemy} ${ci(s.won)}`);
    out.set('lens.cqbManAdvantage', {
      patterns: { 'man-advantage': 1, 'local-superiority': 0.5, attrition: 0.3 },
      why: `Rounds won from each state of players alive: ${rows.join('; ')} ${cite('xenopoulos-2022-wp')}.`,
      weight: 0.5,
    });
  }
  const C = m.clutch;
  if (C) {
    const best = C.byN.reduce((a, b) => ((b.q ?? 1) < (a.q ?? 1) ? b : a), C.byN[0]);
    out.set('lens.cqbClutch', {
      patterns: { clutch: 1, 'skill-dispersion': 0.4 },
      why: `Last players alive won ${C.byN.map((x) => `1v${x.vs} ${x.wins} of ${x.attempts} (model ${r2(x.expected)})`).join('; ')}${q(best.q)} ${cite('rathke-2017', 'xenopoulos-2022-wp')}.`,
      weight: Math.max(0.3, sig(best.q)),
    });
  }
  const S = m.setups;
  if (S && (S.stack.length || S.rotation.length || S.lurk.length)) {
    const parts = [
      ...S.stack.map((s) => `${s.team} stacked won ${pct(s.stacked.share)} against ${pct(s.spread.share)} spread${q(s.q)}`),
      ...S.rotation.filter((r) => r.n >= 10).map((r) => `${r.team} rotated to the ${r.kind} in ${r2(r.medianSecs)} s (median, ${pct(r.arrived.share)} arrived)`),
      ...S.lurk.map((l) => `${l.team} lurked ${pct(l.timeShare)} of the time at ${r2(l.ratio)}× the pack's kill-to-death odds${q(l.q)}`),
    ];
    const best = Math.min(1, ...S.stack.map((s) => s.q ?? 1), ...S.rotation.map((r) => r.q ?? 1), ...S.lurk.map((l) => l.q ?? 1));
    out.set('lens.cqbSetups', {
      patterns: { rotation: 0.8, lurk: 0.7, 'interior-lines': 0.4, concentration: 0.3, flank: 0.3 },
      why: `Setups: ${parts.join('; ')}.`,
      weight: Math.max(0.3, sig(best)),
    });
  }
  const PP = m.postPlant;
  if (PP) {
    out.set('lens.cqbPostPlant', {
      patterns: { 'key-terrain': 0.5, 'man-advantage': 0.6, rotation: 0.5 },
      why: `After the plant the planting side won ${ci(PP.planter)} of rounds and ${ci(PP.holderDuels)} of the duels; ${PP.byNumbers.slice(0, 4).map((s) => `${s.own}v${s.enemy} at the plant ${pct(s.won.share)}`).join(', ')}.`,
      weight: 0.45,
    });
  }
  const F = m.funnel;
  if (F && F.places.length) {
    const f = F.places[0];
    out.set('lens.cqbFunnel', {
      patterns: { 'fatal-funnel': 1, chokepoint: 0.6, 'kill-zone': 0.5, 'urban-close': 0.4 },
      why: `Entering ${f.place}, ${pct(f.rate)} of ${f.entries} entries died within 2.5 s - ${r2(f.ratio)}× the map's ${pct(F.base)}${q(f.q)} ${cite('fm3-06-11-2002', 'atp3-21.8-2016')}.`,
      weight: Math.max(0.3, sig(f.q) * Math.min(1, (f.ratio - 1) * 2 + 0.3)),
    });
  }
  const I = m.impact;
  if (I && (I.wpa.length || I.places.length)) {
    const top = I.places[0];
    out.set('lens.cqbImpact', {
      patterns: { 'skill-dispersion': 0.8, 'action-value': 0.8, 'key-terrain': top ? 0.3 : 0 },
      why: `Win probability added per round, shrunk: ${I.wpa.length ? `players from ${r2(I.wpa[I.wpa.length - 1].value * 100)} to ${r2(I.wpa[0].value * 100)} points` : ''}${top ? `; kills at ${top.name} worth ${r2(top.mean * 100)} points each` : ''}${Number.isFinite(I.lambda) ? `; ridge plus-minus over ${I.players} players (λ ${I.lambda})` : ''} ${cite('sill-2010', 'efron-morris-1975')}.`,
      weight: 0.45,
    });
  }
  return out;
}

/** The player names a CQB block carries, for the external model's pseudonyms. */
export function cqbNames(m: CqbMetrics | undefined): string[] {
  if (!m?.impact) return [];
  return [...m.impact.wpa, ...m.impact.rapm].map((p) => p.person).filter((p): p is string => !!p);
}
