/**
 * Where the later stages plug in, not built yet: an external model that
 * narrates the report (any provider - Claude, ChatGPT, a local
 * OpenAI-compatible server, a multi-host router - the key stays with the
 * user), and the caster for single replays. Both take the report as it is:
 * plain JSON with ids, numbers, places, times and filters by name. Acting on
 * an insight (`apply.ts`) takes only its id, so a narrator's answer can point
 * the viewer at the evidence it talks about.
 */

import type { Insight, InsightReport } from './types';

/** An external narrator: report in, prose that cites insight ids out. */
export interface InsightNarrator {
  id: string;
  label: string;
  narrate(input: NarrationInput, signal?: AbortSignal): Promise<Narration>;
}

export interface NarrationInput {
  report: InsightReport;
  /** The viewer's language, e.g. `de`. */
  language: string;
  /** What the user asked, if anything; a summary otherwise. */
  question?: string;
}

export interface Narration {
  text: string;
  /** Insight ids the text refers to, in the order it does. */
  cites: string[];
}

/**
 * The report as a model reads it: each sentence said (by `say`, the viewer's
 * message function) beside its numbers, and nothing the model cannot use.
 */
export function reportForModel(r: InsightReport, say: (key: string, params: Record<string, number | string>) => string) {
  return {
    schema: r.schema,
    dataset: r.dataset,
    grid: r.grid,
    baseline: r.baseline,
    fdr: r.fdr,
    detectors: r.detectors.map(({ id, ran, skipped, tests, found }) => ({ id, ran, skipped, tests, found })),
    insights: r.insights.map((i: Insight) => ({
      id: i.id,
      kind: i.kind,
      text: say(i.sentence.key, i.sentence.params),
      strength: i.strength,
      effect: i.effect,
      confidence: i.confidence,
      evidence: i.evidence,
      place: i.place,
      time: i.time,
      filters: i.filters,
      subject: i.subject,
    })),
  };
}
