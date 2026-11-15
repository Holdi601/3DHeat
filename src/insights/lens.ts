/**
 * The knowledge lens: each finding and each lens metric of a report, judged
 * through the knowledge base (`knowledge/`). A finding names the patterns its
 * numbers show (`ofInsight`), a metric the patterns its value shows
 * (`ofMetrics`); every entry is scored by how its own patterns overlap, how
 * well its domain fits the data (air, sea, land, urban) and whether it belongs
 * to the lens picked. The best concepts, methods and design principles become
 * the "doctrine and literature" line, the best case the "historical parallel".
 *
 * Text here is English, like the knowledge base: it is what an external model
 * reads and what the panel shows under a translated label.
 */

import { citeList, KB, KB_BY_ID, type KbEntry, type LensId } from './knowledge';
import type { Domain } from './knowledge/types';
import type { LensMetrics } from './lensMetrics';
import type { Insight, InsightReport } from './types';
import { behaviourShows } from './behaviour/shows';
import { cqbShows } from './cqb/shows';

export type LensPick = LensId | 'auto';

/** What a finding or metric shows, in patterns, with its own reason in a sentence. */
export interface Shows {
  patterns: Record<string, number>;
  why: string;
  /** 0..1: how much weight the item carries (an insight's strength, a metric's significance). */
  weight: number;
}

export interface LensHit {
  id: string;
  type: KbEntry['type'];
  title: string;
  score: number;
  /** The patterns shared, strongest first. */
  shared: string[];
  /** Own-words rationale: what the item shows, then what the entry makes of it. */
  why: string;
  cites: string;
}

export interface LensReading {
  /** Insight id, or `lens.<metric>` for a lens metric. */
  about: string;
  shows: Shows;
  literature: LensHit[];
  parallels: LensHit[];
}

const r2 = (v: number) => (Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(2).replace(/\.?0+$/, ''));
const pct = (v: number) => `${Math.round(v * 100)}%`;

/** The patterns a finding shows, by its kind and numbers. */
export function ofInsight(i: Insight): Shows | null {
  const ratio = i.effect.value >= 1 ? i.effect.value : 1 / Math.max(1e-9, i.effect.value);
  const x = `${r2(ratio)}×`;
  const w = i.strength;
  const ev = i.evidence;
  const s = (patterns: Record<string, number>, why: string): Shows => ({ patterns, why, weight: w });
  switch (i.kind) {
    case 'power.kd':
      return s({ 'fields-of-fire': 0.8, 'key-terrain': 0.7, 'exchange-ratio': 0.6, 'high-ground': 0.4, sightlines: 0.4 }, `Fighting from this place gives ${x} the kill-to-death odds of the rest of the map.`);
    case 'power.safe':
      return s({ 'safe-ground': 1, 'reverse-slope': 0.7, cover: 0.6 }, `Time spent here costs ${x} fewer deaths than elsewhere.`);
    case 'zones.hot': {
      const k = String(i.sentence.params.kind ?? '');
      if (k === 'death') return s({ 'kill-zone': 1, 'open-ground': 0.4, ambush: 0.4, chokepoint: 0.3 }, `Deaths here run at ${x} what the time spent predicts.`);
      if (k === 'kill') return s({ 'fields-of-fire': 0.8, 'key-terrain': 0.6, 'local-superiority': 0.4 }, `Kills from here run at ${x} what the time spent predicts.`);
      if (k === 'fire' || k === 'hit' || k === 'explosion' || k === 'damage' || k === 'launch')
        return s({ 'kill-zone': 0.6, 'fields-of-fire': 0.6, 'key-terrain': 0.4 }, `Fire (${k}) concentrates here at ${x} what the time spent predicts.`);
      return s({ flow: 0.5, 'key-terrain': 0.4, 'kill-zone': 0.3 }, `${k || 'Events'} here run at ${x} what the time spent predicts.`);
    }
    case 'zones.cold':
      return s({ 'safe-ground': 0.6, flow: 0.5, 'reverse-slope': 0.3 }, `Far fewer events here (${x}) than the time spent predicts.`);
    case 'cover.open':
      return s({ 'open-ground': 1, cover: 0.8, 'fields-of-fire': 0.4 }, `The most open ground is ${x} as deadly per time as the densest geometry.`);
    case 'cover.dense':
      return s({ cover: 0.6, 'urban-close': 0.7, ambush: 0.4, vertical: 0.3, readability: 0.3 }, `Dense geometry is ${x} as deadly per time as the open.`);
    case 'cover.slow':
      return s({ 'static-exposure': 1, mobility: 0.6 }, `Units standing still die ${x} as often per time as moving ones.`);
    case 'cover.fast':
      return s({ mobility: 0.8, ambush: 0.5, 'open-ground': 0.3 }, `Fast-moving units die ${x} as often per time as slow ones.`);
    case 'spawn.trap':
      return s({ 'spawn-pressure': 1, balance: 0.7, surprise: 0.4, readability: 0.4 }, `Lives from this spawn end early ${x} as often as from the others.`);
    case 'spawn.safe':
      return s({ 'safe-ground': 0.6, balance: 0.5 }, `Lives from this spawn end early ${x} less often than from the others.`);
    case 'spawn.strong':
      return s({ balance: 0.8, tempo: 0.6, 'interior-lines': 0.4, 'spawn-pressure': 0.4 }, `This spawn yields ${x} the early kills of the others.`);
    case 'classPlace.strong':
    case 'classPlace.weak':
      return s({ 'class-counter': 1, 'combined-arms': 0.8, balance: 0.5 }, `${i.subject.vehicleClass ?? 'A class'} ${i.kind.endsWith('strong') ? 'wins' : 'loses'} ${x} its usual kill-to-death odds here${ev.mostKilled ? `, mostly against ${ev.mostKilled}` : ''}.`);
    case 'classPlace.actorStrong':
    case 'classPlace.actorWeak':
      return s({ 'ai-vs-player': 1, readability: 0.3 }, `${i.subject.actor ?? 'One kind of unit'} ${i.kind.endsWith('Strong') ? 'does' : 'does not'} hold its own here (${x} its odds elsewhere).`);
    case 'players.over':
    case 'players.under':
      return s({ 'skill-dispersion': 1, balance: 0.3 }, `One player kills at ${x} the rate of comparable players.`);
    case 'players.fragile':
    case 'players.durable':
      return s({ 'skill-dispersion': 1, 'mutual-support': 0.3, 'defeat-in-detail': 0.2 }, `One player dies at ${x} the rate of comparable players.`);
    case 'flow.choke':
      return s({ chokepoint: 1, 'avenue-of-approach': 0.6, flow: 0.5, 'kill-zone': Number(ev.deaths ?? 0) > 0 ? 0.6 : 0.2 }, `Crossings squeeze through here at ${x} the ground around it${ev.deaths ? `, with ${ev.deaths} deaths` : ''}.`);
    case 'flow.flank':
      return s({ flank: 1, 'avenue-of-approach': 0.5, surprise: 0.4, envelopment: 0.3 }, `Crossing here leads to ${x} the kills of other routes, yet few use it.`);
    case 'value.earned':
    case 'value.lost':
      return s({ economy: 1, 'key-terrain': 0.3 }, `Value ${i.kind.endsWith('earned') ? 'earned' : 'lost'} concentrates here (${x}).`);
    default:
      return null;
  }
}

const sig = (p: number) => (p < 0.001 ? 1 : p < 0.01 ? 0.85 : p < 0.05 ? 0.65 : 0.3);

/** The patterns each lens metric shows, keyed `lens.<metric>`. */
export function ofMetrics(m: LensMetrics | undefined): Map<string, Shows> {
  const out = new Map<string, Shows>();
  if (!m) return out;
  const L = m.lanchester;
  if (L) {
    const base = `Losses scale with enemy strength to the power ${r2(L.p)} ± ${r2(L.pSe)} and own strength to ${r2(L.q)} ± ${r2(L.qSe)} over ${L.bins} periods of ${L.binSecs} s in ${L.matches} match${L.matches === 1 ? '' : 'es'}`;
    const w = Math.min(1, 0.4 + L.bins / 2000);
    if (L.law === 'square') out.set('lens.lanchester', { patterns: { 'aimed-fire': 1, concentration: 0.6, attrition: 0.5 }, why: `${base}: consistent with the square law (aimed fire).`, weight: w });
    else if (L.law === 'linear') out.set('lens.lanchester', { patterns: { 'area-fire': 1, attrition: 0.6 }, why: `${base}: consistent with the linear law (area fire, crowding punished).`, weight: w });
    else if (L.law === 'uncertain') out.set('lens.lanchester', { patterns: { attrition: 0.6 }, why: `${base}: too few periods to tell the laws apart.`, weight: w * 0.3 });
    else out.set('lens.lanchester', { patterns: { attrition: 1, 'aimed-fire': 0.4, 'area-fire': 0.4 }, why: `${base}: ${L.law === 'between' ? 'between the classic laws' : 'neither classic law fits'}, as in most historical fits.`, weight: w * 0.8 });
  }
  const E = m.exchange;
  if (E) {
    const ratios = E.byTeam.filter((t) => t.ratio !== null && t.kills + t.deaths >= 20).map((t) => t.ratio!);
    const spread = ratios.length >= 2 ? Math.max(...ratios) / Math.max(0.01, Math.min(...ratios)) : 1;
    const pats: Record<string, number> = { 'exchange-ratio': 0.6 };
    const excess = E.deathShareTop5 - E.deathShareNull;
    if (E.deathShareTop5 >= 0.25 && excess >= 0.15) pats['kill-zone'] = 1;
    if ((E.moranI ?? 0) >= 0.15) pats['kill-zone'] = Math.max(pats['kill-zone'] ?? 0, 0.6);
    if (spread >= 1.3) pats.balance = 0.8;
    out.set('lens.exchange', {
      patterns: pats,
      why: `${pct(E.deathShareTop5)} of deaths fall on the deadliest ground that holds 5% of the time spent, against ${pct(E.deathShareNull)} by chance with this many deaths (Gini ${r2(E.gini)}, chance ${r2(E.giniNull)}${E.moranI !== null ? `, Moran's I ${r2(E.moranI)}` : ''})${ratios.length >= 2 ? `; kills per death by side range ${r2(Math.min(...ratios))} to ${r2(Math.max(...ratios))}` : ''}.`,
      weight: Math.min(1, 0.3 + Math.max(0, excess) * 1.5 + (spread >= 1.3 ? 0.2 : 0)),
    });
  }
  const F = m.forceRatio;
  if (F) {
    const conc = F.excess >= 1.1 && F.p < 0.05;
    out.set('lens.forceRatio', {
      patterns: conc ? { concentration: 1, 'local-superiority': 1, 'aimed-fire': 0.5, 'defeat-in-detail': 0.4 } : { 'local-superiority': 0.6, 'area-fire': 0.3 },
      why: `Where one side outnumbered the other within ${r2(F.radius)} units of a kill, it took ${pct(F.superiorShare)} of the kills, ${r2(F.excess)}× what numbers alone predict (median engagement range ${r2(F.range.p50)} units).`,
      weight: sig(F.p) * Math.min(1, Math.abs(F.excess - 1) * 3 + 0.2),
    });
  }
  const V = m.fieldsOfFire;
  if (V) {
    const sees = V.ratio >= 1.15 || (V.rho ?? 0) >= 0.2;
    const hides = V.ratio <= 0.85 || (V.rho ?? 0) <= -0.2;
    out.set('lens.fieldsOfFire', {
      patterns: sees ? { 'fields-of-fire': 1, sightlines: 0.9, 'high-ground': 0.3 } : hides ? { cover: 0.8, 'urban-close': 0.5, 'reverse-slope': 0.5, ambush: 0.4 } : { cover: 0.3, sightlines: 0.3 },
      why: `The busiest kill places see ${r2(V.ratio)}× as much of the ground as the average place${V.rho !== null ? `; kill share and view correlate at ρ = ${r2(V.rho)}` : ''} (${V.source === 'level' ? 'level geometry' : 'ground walked'}).`,
      weight: sees || hides ? Math.min(1, Math.abs(V.ratio - 1) + Math.abs(V.rho ?? 0)) : 0.2,
    });
  }
  const N = m.energy;
  if (N) {
    out.set('lens.energy', {
      patterns: N.auc >= 0.55 ? { 'energy-advantage': 1, 'air-superiority': 0.4 } : { 'energy-advantage': 0.4, surprise: 0.4 },
      why: `An air killer carried more energy than an air victim ${pct(N.auc)} of the time (median energy height ${r2(N.killerMedian)} against ${r2(N.victimMedian)}).`,
      weight: sig(N.p) * Math.min(1, Math.abs(N.auc - 0.5) * 6 + 0.3),
    });
  }
  const K = m.keyTerrain;
  if (K && K.places.length) {
    const top = K.places[0];
    out.set('lens.keyTerrain', {
      patterns: top.persistence >= 0.4 ? { 'key-terrain': 1, flow: 0.3 } : { flow: 0.4, 'key-terrain': 0.3 },
      why: `The most persistent fighting place is among each match's three busiest in ${pct(top.persistence)} of ${K.matches} matches.`,
      weight: Math.min(1, top.persistence + 0.1),
    });
  }
  const T = m.trades;
  if (T) {
    out.set('lens.trades', {
      patterns: T.rate < 0.2 ? { 'mutual-support': 1, 'defeat-in-detail': 0.7 } : { 'mutual-support': 1 },
      why: `${pct(T.rate)} of deaths were answered by a teammate's kill within ${r2(T.radius)} units and 5 s.`,
      weight: Math.min(1, Math.abs(T.rate - 0.3) * 2 + 0.3),
    });
  }
  const I = m.initiative;
  if (I) {
    out.set('lens.initiative', {
      patterns: I.share >= 0.55 ? { initiative: 1, 'fleet-salvo': 0.6, tempo: 0.6, surprise: 0.5 } : { initiative: 0.5, attrition: 0.4 },
      why: `The side that scored first won ${pct(I.share)} of ${I.engagements} engagements.`,
      weight: sig(I.p) * Math.min(1, Math.abs(I.share - 0.5) * 4 + 0.2),
    });
  }
  const dist = (v: number) => {
    const metres = v / (m.upm || 1);
    return metres >= 2000 ? `${r2(metres / 1000)} km` : `${Math.round(metres)} m`;
  };
  const S = m.salvo;
  if (S) {
    out.set('lens.salvo', {
      patterns: { 'fleet-salvo': 1, initiative: 0.5, scouting: 0.4, attrition: 0.3 },
      why: `Fitted to ${S.bins} periods of ships in contact, each attacking ship puts ${r2(S.alpha)} ± ${r2(S.alphaSe)} enemy ships out of action per 20 s and each defender saves ${r2(S.delta)} ± ${r2(S.deltaSe)} (Hughes' salvo equation).`,
      weight: Math.min(1, 0.3 + S.losses / 100),
    });
  }
  const C = m.combatPower;
  if (C) {
    const clear = C.lo > 1;
    out.set('lens.combatPower', {
      patterns: clear ? { 'exchange-ratio': 0.8, balance: 0.6, 'local-superiority': 0.3, 'skill-dispersion': 0.3 } : { balance: 0.5, 'exchange-ratio': 0.4 },
      why: `Per unit-hour in action, ${C.better} kills at ${r2(C.cev)}× the rate of ${C.worse} (95% interval ${r2(C.lo)} to ${r2(C.hi)}: a combat effectiveness ratio in Dupuy's sense)${C.parity ? `; at even local numbers ${C.better} took ${pct(C.parity.share)} of ${C.parity.kills} kills` : ''}.`,
      weight: clear ? Math.min(1, 0.4 + Math.log(C.cev) / 2) : 0.25,
    });
  }
  const R = m.ranges;
  if (R) {
    const parts = R.groups.map((g) => `${g.group} ${[g.kill ? `kills ${dist(g.kill.p50)}` : '', g.launch ? `launches ${dist(g.launch.p50)}` : '', g.firstShot ? `first shot ${dist(g.firstShot.p50)}` : ''].filter(Boolean).join(', ')}`);
    const air = R.groups.find((g) => g.group === 'air');
    const long = !!air && ((air.launch?.p50 ?? 0) / (m.upm || 1) >= 10000 || (air.kill?.p50 ?? 0) / (m.upm || 1) >= 10000);
    out.set('lens.ranges', {
      patterns: long ? { bvr: 1, initiative: 0.4, scouting: 0.4 } : { 'fields-of-fire': 0.6, sightlines: 0.6, scouting: 0.3 },
      why: `Median distance to the nearest enemy - ${parts.join('; ')}.`,
      weight: 0.45,
    });
  }
  const KC = m.killChain;
  if (KC) {
    const parts = KC.groups.map((g) => `${g.group} ${[g.launchToKill ? `launch to kill ${r2(g.launchToKill.p50)} s` : '', g.firstShotToKill ? `first shot to kill ${r2(g.firstShotToKill.p50)} s` : ''].filter(Boolean).join(', ')}`);
    out.set('lens.killChain', {
      patterns: { tempo: 1, initiative: 0.5, surprise: 0.3 },
      why: `Kill chain, medians - ${parts.join('; ')}.`,
      weight: 0.4,
    });
  }
  const D = m.dispersion;
  if (D) {
    const conc = D.tighterShare >= 0.55 && D.p < 0.05;
    const spread = D.tighterShare <= 0.45 && D.p < 0.05;
    out.set('lens.dispersion', {
      patterns: conc ? { concentration: 1, 'local-superiority': 0.6, 'mutual-support': 0.5 } : spread ? { 'area-fire': 0.9, mobility: 0.4, flank: 0.3 } : { concentration: 0.3, 'area-fire': 0.3 },
      why: `In ${D.bins} periods where both sides had units in action, the side standing closer together took ${pct(D.tighterShare)} of ${D.kills} kills.`,
      weight: sig(D.p) * Math.min(1, Math.abs(D.tighterShare - 0.5) * 4 + 0.2),
    });
  }
  const SO = m.sorties;
  if (SO) {
    out.set('lens.sorties', {
      patterns: { 'air-superiority': 0.9, 'exchange-ratio': 0.6, attrition: 0.5 },
      why: `Per sortie - ${SO.byTeam.map((t) => `${t.team}: ${pct(t.lossRate)} lost, ${r2(t.killsPerSortie)} kills (${t.sorties} sorties)`).join('; ')}.`,
      weight: 0.55,
    });
  }
  for (const [id, s] of behaviourShows(m.behaviour)) out.set(id, s);
  for (const [id, s] of cqbShows(m.cqb)) out.set(id, s);
  return out;
}

/** The kinds of fighting the data holds, from the units' classes; empty when unknown. */
export function domainsOf(r: InsightReport): Set<Domain> {
  const d = r.lens?.domain;
  const out = new Set<Domain>();
  if (!d) return out;
  if (d.air >= 0.25) out.add('air');
  if (d.sea >= 0.25) out.add('sea');
  if (d.ground >= 0.25) out.add('land');
  if (d.infantry >= 0.25) {
    out.add('land');
    out.add('urban');
  }
  return out;
}

const AUTO_LENS: Record<Domain, LensId[]> = { air: ['air'], sea: ['naval'], land: ['military'], urban: ['urban', 'esports'], any: [] };

function scoreEntry(e: KbEntry, shows: Shows, lens: LensPick, domains: Set<Domain>): { score: number; shared: string[] } {
  if (lens !== 'auto' && !e.lenses.includes(lens)) return { score: 0, shared: [] };
  let dot = 0;
  let norm = 0;
  const shared: [string, number][] = [];
  for (const [p, w] of Object.entries(e.patterns)) {
    norm += w * w;
    const v = shows.patterns[p];
    if (v) {
      dot += v * w;
      shared.push([p, v * w]);
    }
  }
  if (!dot) return { score: 0, shared: [] };
  let score = dot / Math.sqrt(norm);
  // The data's own domain: entries about another kind of fighting count for less.
  // Unknown (no class column) is most often a shooter on foot: air and sea alone count a little less.
  if (domains.size && !e.domains.includes('any') && !e.domains.some((d) => domains.has(d))) score *= 0.35;
  else if (!domains.size && !e.domains.some((d) => d === 'any' || d === 'land' || d === 'urban')) score *= 0.7;
  if (lens === 'auto' && domains.size) {
    const fav = [...domains].flatMap((d) => AUTO_LENS[d]);
    if (e.lenses.some((l) => fav.includes(l))) score *= 1.15;
  }
  return { score: score * (0.5 + 0.5 * shows.weight), shared: shared.sort((a, b) => b[1] - a[1]).map((x) => x[0]) };
}

function hit(e: KbEntry, score: number, shared: string[], shows: Shows): LensHit {
  return { id: e.id, type: e.type, title: e.title, score: Math.round(score * 1000) / 1000, shared, why: `${shows.why} ${e.lesson}`, cites: citeList(e) };
}

/** The best entries for one finding or metric: literature (concepts, methods, design, studies) and parallels (cases). */
export function readShows(about: string, shows: Shows, lens: LensPick, domains: Set<Domain>, n = 2): LensReading {
  const lit: LensHit[] = [];
  const cases: LensHit[] = [];
  for (const e of KB) {
    const { score, shared } = scoreEntry(e, shows, lens, domains);
    if (score < 0.15) continue;
    (e.type === 'case' ? cases : lit).push(hit(e, score, shared, shows));
  }
  lit.sort((a, b) => b.score - a.score);
  cases.sort((a, b) => b.score - a.score);
  return { about, shows, literature: lit.slice(0, n), parallels: cases.slice(0, n) };
}

/** Every finding (strongest first) and every lens metric, read through the lens. */
export function readReport(r: InsightReport, lens: LensPick = 'auto', n = 2): LensReading[] {
  const domains = domainsOf(r);
  const out: LensReading[] = [];
  for (const i of [...r.insights].sort((a, b) => b.strength - a.strength)) {
    const s = ofInsight(i);
    if (s) out.push(readShows(i.id, s, lens, domains, n));
  }
  for (const [id, s] of ofMetrics(r.lens)) out.push(readShows(id, s, lens, domains, n));
  return out;
}

/**
 * The entries most relevant to the whole report, for the external model: each
 * finding and metric brings its own best few (three of the literature, two
 * parallels), so one kind of finding repeated many times cannot crowd out the
 * rest; an entry several bring keeps its best score and gains a little.
 */
export function topEntries(r: InsightReport, lens: LensPick = 'auto', n = 12): { entry: KbEntry; score: number; about: string[] }[] {
  const domains = domainsOf(r);
  const items: [string, Shows][] = [];
  for (const i of [...r.insights].sort((a, b) => b.strength - a.strength).slice(0, 20)) {
    const s = ofInsight(i);
    if (s) items.push([i.id, s]);
  }
  items.push(...ofMetrics(r.lens));
  const best = new Map<string, { entry: KbEntry; score: number; about: string[] }>();
  for (const [about, s] of items) {
    const rd = readShows(about, s, lens, domains, 3);
    for (const h of [...rd.literature, ...rd.parallels.slice(0, 2)]) {
      if (h.score < 0.2) continue;
      const b = best.get(h.id);
      if (!b) best.set(h.id, { entry: KB_BY_ID.get(h.id)!, score: h.score, about: [about] });
      else {
        b.score = Math.max(b.score, h.score) + 0.05;
        if (b.about.length < 4) b.about.push(about);
      }
    }
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, n);
}
