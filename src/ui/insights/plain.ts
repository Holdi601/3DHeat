/**
 * An insight in plain words: what happened, how unusual it is and against
 * what, why it matters and what to do about it - with the units, the sizes
 * and the number of events it rests on. The report's numbers are the same;
 * only the telling changes: "Explosion hot zone 365 where 3.7 were expected
 * (54.9x)" becomes "A third of all explosions (365 of 1,100) landed in this
 * area about 300 m across. Hardly anyone spends time here (0.3% of all time):
 * these explosions land here, they are not where whoever caused them stands."
 *
 * The narration standards, kept here so every analysis tells its findings the
 * same way:
 * - sizes in the viewer's units from the data's own scale (`dataset.upm`), to
 *   two significant figures ("about 11 km across", never "11000 m");
 * - shares to two significant figures, "under 0.1%" rather than "0.0%";
 *   factors to two figures ("76×", "2.4×");
 * - a count of nothing is said as nothing ("No deaths", "never died");
 * - who: the side that makes most of a place's kills or deaths;
 * - over several matches or rounds, in how many it holds and that no one of
 *   them makes most of it; the test's q only in the numbers.
 *
 * Kinds with no words of their own fall back to their sentence, a comparison
 * from the test, and their detector's why and what-to-do.
 */

import { has, int, num, t } from '../../i18n';
import { unitPrefs } from '../../state/unitsStore';
import { formatDistance, formatIn } from '../../units/format';
import type { Insight, InsightReport } from '../../insights/types';
import { presenceShare, sampleSize } from '../../insights/curate';
import { formatParam, insightText, pctText, secs } from './say';

export interface PlainInsight {
  /** What happened, one sentence. */
  what: string;
  /** How unusual, against what. */
  compare: string;
  /** Why it matters. */
  why: string;
  /** What to do about it. */
  todo: string;
  /** The events it rests on and how sure it is. */
  evidence: string;
}

/** A size to two significant figures: "about 250 m across", not 252.01 m. */
export function rough(v: number): number {
  if (!(v > 0)) return v;
  const k = Math.pow(10, Math.floor(Math.log10(v)) - 1);
  return Math.round(v / k) * k;
}

/** A length in world units, in the viewer's units and to two figures. */
export function sizeText(units: number, upm = 1): string {
  const m = rough(units / (upm > 0 ? upm : 1));
  return formatDistance(m, unitPrefs(), m < 10 ? 1 : 0);
}

const n = (e: Insight['evidence'], k: string) => (typeof e[k] === 'number' ? (e[k] as number) : 0);

/** The words a session is counted in: matches, or the rounds of one. */
export const sessionUnit = (r: InsightReport | null): 'match' | 'round' => r?.dataset.sessionUnit ?? 'match';

/** The values every kind's words may use, formatted. */
function values(ins: Insight, report: InsightReport | null, samples: boolean): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(ins.sentence.params)) out[k] = formatParam(k, v, samples);
  // A side the data names only by a number: "side 2".
  if (/^\d+$/.test(out.team ?? '')) out.team = t('analysis.ins.sideNo', { n: out.team });
  const e = ins.evidence;
  const upm = report?.dataset.upm ?? 1;
  const total = report?.baseline.presence ?? 0;
  const share = presenceShare(ins, total);
  if (share !== null) out.presShare = pctText(share);
  if (ins.place) out.size = sizeText(ins.place.radius * 2, upm);
  out.ratio = formatParam('ratio', Number(ins.sentence.params.ratio ?? 1), samples);
  if (typeof e.count === 'number' && typeof e.mapCount === 'number' && e.mapCount > 0) {
    out.total = int(e.mapCount);
    out.share = pctText(e.count / e.mapCount);
  }
  if (typeof e.expected === 'number') out.expected = num(e.expected, e.expected < 10 ? 1 : 0);
  // Kill shares and death rates, here and on the rest of the map.
  const k = n(e, 'kills');
  const d = n(e, 'deaths');
  if (k + d > 0) out.hereShare = pctText(k / (k + d));
  const mk = n(e, 'mapKills') - k;
  const md = n(e, 'mapDeaths') - d;
  if (mk + md > 0) out.mapShare = pctText(mk / (mk + md));
  const pres = n(e, 'presence');
  const mapPres = n(e, 'mapPresence') - pres;
  const perHour = samples ? 1000 : 3600;
  if (pres > 0) out.hereRate = num((d / pres) * perHour, 1);
  if (mapPres > 0) out.mapRate = num((md / mapPres) * perHour, 1);
  out.per = samples ? t('analysis.ins.perSamples') : t('analysis.ins.perHour');
  for (const key of ['presenceOpen', 'presenceDense', 'presenceSlow', 'presenceFast']) if (typeof e[key] === 'number') out[key] = samples ? t('insights.samples', { n: int(e[key] as number) }) : secs(e[key] as number);
  for (const key of ['deathsOpen', 'deathsDense', 'deathsSlow', 'deathsFast', 'crossings', 'killsAfter', 'mapCrossings']) if (typeof e[key] === 'number') out[key] = int(e[key] as number);
  // Speeds in the viewer's unit, from the data's units a second.
  for (const key of ['slowBelow', 'fastAbove']) {
    const ms = typeof e[key] === 'number' ? (e[key] as number) / upm : NaN;
    // A standstill is said as walking pace at most, not as "0.0 km/h".
    if (ms === ms) out[key] = formatIn('speed', Math.max(ms, 0.3), unitPrefs(), ms < 10 ? 1 : 0);
  }
  if (typeof e.deathsPerCrossing === 'number') out.herePer = pctText(e.deathsPerCrossing);
  if (typeof e.mapDeathsPerCrossing === 'number') out.mapPer = pctText(e.mapDeathsPerCrossing);
  out.around = typeof e.aroundMean === 'number' && e.aroundMean > 0 ? formatParam('ratio', n(e, 'crossings') / e.aroundMean, samples) : '—';
  out.n = int(sampleSize(ins));
  out.conf = t(`insights.conf.${ins.confidence.level}`);
  out.tests = int(ins.confidence.tests);
  out.q = ins.confidence.q < 1e-4 ? ins.confidence.q.toExponential(0) : num(ins.confidence.q, 3);
  out.matches = int(report?.dataset.matches ?? 1);
  out.detector = t(`insights.det.${ins.detector}`);
  return out;
}

/** A wording of its own where the count is nothing ("No deaths", "never died"), or the speeds are in units. */
function ownVariant(ins: Insight): string | null {
  const e = ins.evidence;
  if (ins.kind === 'zones.cold' && n(e, 'count') === 0) return 'none';
  if (ins.kind === 'power.safe' && n(e, 'deaths') === 0) return 'none';
  if (ins.kind === 'players.durable' && n(e, 'deaths') === 0) return 'none';
  if (ins.kind === 'players.under' && n(e, 'kills') === 0) return 'none';
  if (ins.kind === 'flow.choke' && n(e, 'deaths') === 0) return 'none';
  if (ins.kind === 'cover.slow' || ins.kind === 'cover.fast') return 'speed';
  return null;
}

/** The words of one part, by the most specific key there is: kind and variant, kind, detector. */
function part(ins: Insight, which: 'what' | 'compare' | 'why' | 'do', v: Record<string, string>): string | null {
  const own = ownVariant(ins);
  const keys = [
    own ? `analysis.ins.${ins.kind}.${own}.${which}` : '',
    ins.variant ? `analysis.ins.${ins.kind}.${ins.variant}.${which}` : '',
    `analysis.ins.${ins.kind}.${which}`,
    `analysis.ins.det.${ins.detector}.${which}`,
  ];
  for (const k of keys) if (k && has(k)) return t(k, v);
  return null;
}

/** Who makes most of it, where one side does. */
function sideLine(ins: Insight): string {
  const s = ins.side;
  if (!s) return '';
  // A side the data names only by a number is said as "side 2", not "2".
  const team = /^\d+$/.test(s.team) ? t('analysis.ins.sideNo', { n: s.team }) : s.team;
  return t(`analysis.ins.side.${s.of}`, { team, share: pctText(s.share) });
}

/** In how many matches (or rounds) it holds, where there are several. */
export function spreadLine(ins: Insight, report: InsightReport | null): string {
  const s = ins.spread;
  if (!s) return '';
  return t('analysis.ins.spread', { holding: int(s.holding), matches: int(s.matches), top: pctText(Math.max(s.topShare, 0.001)), unit: sessionUnit(report) });
}

export function plainInsight(ins: Insight, report: InsightReport | null, samples: boolean): PlainInsight {
  const v = values(ins, report, samples);
  const sentence = insightText(ins, samples);
  // A player's win probability added carries its own comparison in its sentence.
  const compare = ins.kind.startsWith('outcome.player') ? '' : part(ins, 'compare', v) ?? t('analysis.ins.compareGeneric', v);
  const side = sideLine(ins);
  const spread = spreadLine(ins, report);
  return {
    what: part(ins, 'what', v) ?? sentence,
    compare: side ? `${compare} ${side}` : compare,
    why: part(ins, 'why', v) ?? '',
    todo: part(ins, 'do', v) ?? '',
    evidence: [t(sampleSize(ins) > 0 ? 'analysis.ins.evidence' : 'analysis.ins.evidenceNoCount', v), spread].filter(Boolean).join(' '),
  };
}

/** Why findings were left out, counted by reason, as one line; '' for none. */
export function droppedLine(report: InsightReport): string {
  const d = report.dropped ?? [];
  if (!d.length) return '';
  const by = new Map<string, number>();
  for (const x of d) by.set(x.reason, (by.get(x.reason) ?? 0) + 1);
  const parts = [...by].sort((a, b) => b[1] - a[1]).map(([reason, k]) => t(`analysis.ins.dropped.${reason}`, { n: int(k), unit: sessionUnit(report) }));
  return t('analysis.ins.dropped', { n: int(d.length), list: parts.join('; ') });
}
