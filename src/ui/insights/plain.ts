/**
 * An insight in plain words: what happened, how unusual it is and against
 * what, why it matters and what to do about it - with the units, the sizes
 * and the number of events it rests on. The report's numbers are the same;
 * only the telling changes: "Explosion hot zone 365 where 3.7 were expected
 * (54.9x)" becomes "A third of all explosions (365 of 1,100) landed in this
 * area about 300 m across. Hardly anyone spends time here (0.3% of all time):
 * this is where explosions land, not where the people causing them stand."
 *
 * Kinds with no words of their own fall back to their sentence, a comparison
 * from the test, and their detector's why and what-to-do.
 */

import { has, int, num, t } from '../../i18n';
import { lengthText } from '../../state/unitsStore';
import type { Insight, InsightReport } from '../../insights/types';
import { presenceShare, sampleSize } from '../../insights/curate';
import { formatParam, insightText, secs } from './say';

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

const pct = (v: number) => `${num(v * 100, v > 0 && v < 0.1 ? 1 : 0)}%`;
const n = (e: Insight['evidence'], k: string) => (typeof e[k] === 'number' ? (e[k] as number) : 0);

/** The values every kind's words may use, formatted. */
function values(ins: Insight, report: InsightReport | null, samples: boolean): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(ins.sentence.params)) out[k] = formatParam(k, v, samples);
  const e = ins.evidence;
  const total = report?.baseline.presence ?? 0;
  const share = presenceShare(ins, total);
  if (share !== null) out.presShare = pct(share);
  if (ins.place) out.size = lengthText(rough(ins.place.radius * 2));
  out.ratio = formatParam('ratio', Number(ins.sentence.params.ratio ?? 1), samples);
  if (typeof e.count === 'number' && typeof e.mapCount === 'number' && e.mapCount > 0) {
    out.total = int(e.mapCount);
    out.share = pct(e.count / e.mapCount);
  }
  if (typeof e.expected === 'number') out.expected = num(e.expected, e.expected < 10 ? 1 : 0);
  // Kill shares and death rates, here and on the rest of the map.
  const k = n(e, 'kills');
  const d = n(e, 'deaths');
  if (k + d > 0) out.hereShare = pct(k / (k + d));
  const mk = n(e, 'mapKills') - k;
  const md = n(e, 'mapDeaths') - d;
  if (mk + md > 0) out.mapShare = pct(mk / (mk + md));
  const pres = n(e, 'presence');
  const mapPres = n(e, 'mapPresence') - pres;
  const perHour = samples ? 1000 : 3600;
  if (pres > 0) out.hereRate = num((d / pres) * perHour, 1);
  if (mapPres > 0) out.mapRate = num((md / mapPres) * perHour, 1);
  out.per = samples ? t('analysis.ins.perSamples') : t('analysis.ins.perHour');
  for (const key of ['presenceOpen', 'presenceDense', 'presenceSlow', 'presenceFast']) if (typeof e[key] === 'number') out[key] = samples ? t('insights.samples', { n: int(e[key] as number) }) : secs(e[key] as number);
  for (const key of ['deathsOpen', 'deathsDense', 'deathsSlow', 'deathsFast', 'crossings', 'killsAfter']) if (typeof e[key] === 'number') out[key] = int(e[key] as number);
  if (typeof e.deathsPerCrossing === 'number') out.herePer = pct(e.deathsPerCrossing);
  if (typeof e.mapDeathsPerCrossing === 'number') out.mapPer = pct(e.mapDeathsPerCrossing);
  if (typeof e.aroundMean === 'number' && e.aroundMean > 0) out.around = num(n(e, 'crossings') / e.aroundMean, 1);
  out.n = int(sampleSize(ins));
  out.conf = t(`insights.conf.${ins.confidence.level}`);
  out.tests = int(ins.confidence.tests);
  out.q = ins.confidence.q < 1e-4 ? ins.confidence.q.toExponential(0) : num(ins.confidence.q, 3);
  out.matches = int(report?.dataset.matches ?? 1);
  out.detector = t(`insights.det.${ins.detector}`);
  return out;
}

/** The words of one part, by the most specific key there is: kind and variant, kind, detector. */
function part(ins: Insight, which: 'what' | 'compare' | 'why' | 'do', v: Record<string, string>): string | null {
  const keys = [
    ins.variant ? `analysis.ins.${ins.kind}.${ins.variant}.${which}` : '',
    `analysis.ins.${ins.kind}.${which}`,
    which === 'why' || which === 'do' ? `analysis.ins.det.${ins.detector}.${which}` : '',
  ];
  for (const k of keys) if (k && has(k)) return t(k, v);
  return null;
}

export function plainInsight(ins: Insight, report: InsightReport | null, samples: boolean): PlainInsight {
  const v = values(ins, report, samples);
  const sentence = insightText(ins, samples);
  return {
    what: part(ins, 'what', v) ?? sentence,
    compare: part(ins, 'compare', v) ?? t('analysis.ins.compareGeneric', v),
    why: part(ins, 'why', v) ?? '',
    todo: part(ins, 'do', v) ?? '',
    evidence: t(sampleSize(ins) > 0 ? 'analysis.ins.evidence' : 'analysis.ins.evidenceNoCount', v),
  };
}

/** Why findings were left out, counted by reason, as one line; '' for none. */
export function droppedLine(report: InsightReport): string {
  const d = report.dropped ?? [];
  if (!d.length) return '';
  const by = new Map<string, number>();
  for (const x of d) by.set(x.reason, (by.get(x.reason) ?? 0) + 1);
  const parts = [...by].map(([reason, k]) => t(`analysis.ins.dropped.${reason}`, { n: int(k) }));
  return t('analysis.ins.dropped', { n: int(d.length), list: parts.join('; ') });
}
