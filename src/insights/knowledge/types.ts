/**
 * The knowledge base the analysis judges its findings by: concepts and
 * methods of military operations analysis, historical engagements that serve
 * as parallels, game and level design principles and peer-reviewed analytics
 * studies, each in our own words with its references.
 *
 * Entries meet findings through patterns (`patterns.ts`): a finding or a lens
 * metric names the patterns its numbers show, an entry names the patterns it
 * speaks to, and the lens (`../lens.ts`) scores the overlap. A new entry only
 * needs its patterns, lenses and references - nothing else changes.
 *
 * Content is English with stable ids; only the panel's labels are translated.
 */

/** The viewpoints a reader picks: what the findings are judged through. */
export const LENSES = ['military', 'air', 'naval', 'urban', 'design', 'esports'] as const;
export type LensId = (typeof LENSES)[number];

/** What sort of fighting an entry is about; `any` fits every dataset. */
export type Domain = 'land' | 'air' | 'sea' | 'urban' | 'any';

export type EntryType = 'concept' | 'method' | 'case' | 'design' | 'study';

/** Scale of a historical case. */
export type Scale = 'engagement' | 'battle' | 'campaign';

export interface Reference {
  id: string;
  /** "Surname, I." joined by "; ", or an organisation. */
  authors: string;
  title: string;
  year: number;
  /** Publisher, journal with volume and pages, or issuing body. */
  publisher: string;
  url?: string;
  doi?: string;
  /** Public domain (old enough, or a work of the US government): short quotes allowed. */
  pd?: boolean;
  /** ISO date the details were last checked against a catalogue, publisher or archive record. */
  verified?: string;
}

export interface KbEntry {
  /** `<type>.<slug>`, never reused for something else. */
  id: string;
  type: EntryType;
  title: string;
  lenses: LensId[];
  domains: Domain[];
  /** Pattern ids (`patterns.ts`) with how centrally the entry is about each, 0..1. */
  patterns: Record<string, number>;
  /** What it is, in our own words (two or three sentences). */
  summary: string;
  /** The lesson it carries for a finding: what the data would mean through it. */
  lesson: string;
  /** Concepts: what it predicts. */
  predicts?: string;
  /** How it is measured in 3DHeat data: columns, metrics, thresholds. */
  measure?: string;
  /** Methods: the formula, in plain notation. */
  formula?: string;
  /** Cases: when, where, scale and how it ended. */
  when?: string;
  where?: string;
  scale?: Scale;
  outcome?: string;
  /** A short quote, only from a public-domain reference. */
  quote?: { text: string; ref: string };
  refs: string[];
  /** Other entries worth reading with it. */
  see?: string[];
}
