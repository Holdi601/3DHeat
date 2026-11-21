/**
 * The built-in narrator: the report as a short debrief, written in the viewer
 * without any model. It leads with what was counted, says the clearest
 * finding, the strongest one for tactics and the strongest for balancing,
 * then the rest by detector (two each, the strongest), and how much of it
 * rests on weaker evidence. Every paragraph cites the insights it says, so the
 * panel can show each one.
 *
 * The external narrators (`ai/`) take the same report through the seam and
 * write their own; this one is the default and needs nothing but the report.
 */

import { int, list, num, t } from '../i18n';
import type { LensPick } from './lens';
import { lensParagraphs } from './lensNarrate';
import { outcomeParagraphs } from './outcomeNarrate';
import type { InsightNarrator, Narration, NarrationInput } from './seam';
import type { DetectorId, Insight, InsightReport } from './types';

export interface DebriefParagraph {
  text: string;
  cites: string[];
  /** Lens lines (`lensNarrate.ts`): the knowledge entries said, and what about. */
  refs?: string[];
  role?: 'literature' | 'parallel' | 'metrics';
  about?: string;
}

export interface Debrief extends Narration {
  paragraphs: DebriefParagraph[];
}

/** Kinds that tell a player where and how to fight. */
const TACTICS = /^(power\.|flow\.|cover\.)/;
/** Kinds that tell a designer the game is uneven. */
const BALANCE = /^(spawn\.(trap|strong)|classPlace\.)/;
const PER_GROUP = 2;

/** `say` turns an insight into its sentence in the viewer's language (the panel's `insightText`). */
export function baseDebrief(r: InsightReport, say: (i: Insight) => string, lens: LensPick | false = 'auto'): Debrief {
  const ps: DebriefParagraph[] = [];
  const p = (text: string, cites: string[] = []) => ps.push({ text, cites });
  const sentence = (i: Insight) => say(i).replace(/[.!。]\s*$/, '');
  // Most useful first (`curate.ts`): the evidence, the place's scope, the kind, the events behind it.
  const ins = [...r.insights].sort((a, b) => (b.usefulness ?? b.strength) - (a.usefulness ?? a.strength));
  if (!ins.length) {
    p(t('insights.debrief.nothing', { fdr: `${num(r.fdr * 100)}%` }));
    for (const op of outcomeParagraphs(r)) p(op.text, op.cites);
    return finish(ps);
  }
  p(t('insights.debrief.lead', { n: int(ins.length), matches: int(r.dataset.matches), persons: int(r.dataset.persons), rows: int(r.dataset.shownRows) }));
  const said = new Set<string>();
  const lead: Insight[] = [];
  const top = ins[0];
  lead.push(top);
  p(t('insights.debrief.headline', { conf: t(`insights.conf.${top.confidence.level}`), text: sentence(top) }), [top.id]);
  said.add(top.id);
  for (const [re, key] of [[TACTICS, 'insights.debrief.tactics'], [BALANCE, 'insights.debrief.balance']] as const) {
    const i = ins.find((x) => !said.has(x.id) && re.test(x.kind));
    if (!i) continue;
    p(t(key, { text: sentence(i) }), [i.id]);
    said.add(i.id);
    lead.push(i);
  }
  // What decided the rounds: the score, the factors, the turning points, who added the most.
  for (const op of outcomeParagraphs(r)) {
    p(op.text, op.cites);
    for (const id of op.cites) said.add(id);
  }
  // The rest by detector, the detector with the strongest finding first.
  const groups = new Map<DetectorId, Insight[]>();
  for (const i of ins) if (!said.has(i.id)) (groups.get(i.detector) ?? groups.set(i.detector, []).get(i.detector)!).push(i);
  for (const [det, items] of groups) {
    const shown = items.slice(0, PER_GROUP);
    const texts = list(shown.map(sentence));
    const rest = items.length - shown.length;
    p(
      t('insights.debrief.group', { group: t(`insights.det.${det}`), list: rest > 0 ? t('insights.debrief.more', { list: texts, n: int(rest) }) : texts }),
      shown.map((i) => i.id),
    );
  }
  // Through the lens: the literature and the historical parallels of the lead findings and the lens metrics.
  if (lens !== false) ps.push(...lensParagraphs(r, lead, lens));
  const weak = ins.filter((i) => i.confidence.level === 'low').length;
  if (weak > 0) p(t('insights.debrief.weak', { n: int(weak) }));
  return finish(ps);
}

function finish(paragraphs: DebriefParagraph[]): Debrief {
  return { paragraphs, text: paragraphs.map((x) => x.text).join('\n\n'), cites: paragraphs.flatMap((x) => x.cites) };
}

/** The built-in narrator behind the seam: answers at once, in the viewer's language. */
export function baseNarrator(say: (i: Insight) => string): InsightNarrator {
  return {
    id: 'base',
    label: t('insights.debrief.base'),
    narrate: async (input: NarrationInput) => baseDebrief(input.report, say),
  };
}
