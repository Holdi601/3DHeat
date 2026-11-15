/**
 * The built-in debrief's lens lines (`narrate.ts`): for the findings it leads
 * with, the doctrine or literature that explains them and the historical
 * parallel that resembles them, each with its citations; then what the lens
 * metrics measured, read the same way. No entry is said twice. The labels
 * are the viewer's language; the knowledge itself is English.
 */

import { t } from '../i18n';
import { KB_BY_ID } from './knowledge';
import { domainsOf, ofInsight, ofMetrics, readShows, type LensHit, type LensPick } from './lens';
import type { Insight, InsightReport } from './types';
import { isBehaviour } from './behaviour/shows';

export interface LensParagraph {
  text: string;
  cites: string[];
  /** Knowledge entries the line rests on. */
  refs: string[];
  role: 'literature' | 'parallel' | 'metrics';
  /** The finding or metric it is about. */
  about: string;
}

const MIN_LIT = 0.3;
const MIN_CASE = 0.35;

export function lensParagraphs(r: InsightReport, lead: Insight[], lens: LensPick = 'auto'): LensParagraph[] {
  const out: LensParagraph[] = [];
  const used = new Set<string>();
  const domains = domainsOf(r);
  const pick = (hits: LensHit[], min: number) => hits.find((h) => h.score >= min && !used.has(h.id));
  const say = (about: string, lit: LensHit | undefined, par: LensHit | undefined) => {
    if (lit) {
      used.add(lit.id);
      const e = KB_BY_ID.get(lit.id)!;
      out.push({ text: `${t('lens.literature')}: ${e.title}. ${e.lesson} ${lit.cites}`, cites: [], refs: [lit.id], role: 'literature', about });
    }
    if (par) {
      used.add(par.id);
      const e = KB_BY_ID.get(par.id)!;
      out.push({ text: `${t('lens.parallel')}: ${e.title}${e.when ? ` (${e.when})` : ''}. ${`${e.outcome ?? ''} ${e.lesson}`.trim()} ${par.cites}`, cites: [], refs: [par.id], role: 'parallel', about });
    }
  };
  for (const i of lead) {
    const s = ofInsight(i);
    if (!s) continue;
    const rd = readShows(i.id, s, lens, domains, 4);
    say(i.id, pick(rd.literature, MIN_LIT), pick(rd.parallels, MIN_CASE));
  }
  const metrics = [...ofMetrics(r.lens)].sort((a, b) => b[1].weight - a[1].weight);
  if (metrics.length) {
    out.push({ text: `${t('lens.metrics')}: ${metrics.map(([, s]) => s.why).join(' ')}`, cites: [], refs: [], role: 'metrics', about: 'lens' });
    for (const [id, s] of metrics.slice(0, 3)) {
      const rd = readShows(id, s, lens, domains, 4);
      say(id, pick(rd.literature, MIN_LIT), pick(rd.parallels, MIN_CASE));
    }
    // The strongest collective-behaviour measures get their literature too (`behaviour/shows.ts`).
    for (const [id, s] of metrics.slice(3).filter(([id, s]) => isBehaviour(id) && s.weight >= 0.5).slice(0, 2)) {
      const rd = readShows(id, s, lens, domains, 4);
      say(id, pick(rd.literature, MIN_LIT), undefined);
    }
  }
  return out;
}
