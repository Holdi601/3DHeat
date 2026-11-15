/**
 * The knowledge base, gathered: every entry by id, with its references.
 * Adding an entry: put it in the file of its type with its patterns, lenses
 * and references; `knowledge.test.ts` checks ids, patterns and references.
 * See docs/knowledge.md.
 */

import { CASES } from './cases.ts';
import { CASES_AIR_SEA } from './cases-air-sea.ts';
import { CASES_ESPORTS } from './cases-esports.ts';
import { CASES_LAND } from './cases-land.ts';
import { BEHAVIOUR_KB } from './behaviour.ts';
import { CONCEPTS_MORE } from './concepts-more.ts';
import { CQB_KB } from './cqb.ts';
import { MANEUVER_KB } from './maneuver.ts';
import { MANEUVER_TAGS } from './maneuver-tags.ts';
import { STUDIES } from './studies.ts';
import { CONCEPTS } from './concepts.ts';
import { DESIGN } from './design.ts';
import { METHODS } from './methods.ts';
import { PATTERNS } from './patterns.ts';
import { REFERENCES, REF_BY_ID, fullCite, shortCite } from './refs.ts';
import type { KbEntry } from './types.ts';

export const KB: KbEntry[] = [...CONCEPTS, ...CONCEPTS_MORE, ...METHODS, ...CASES, ...CASES_LAND, ...CASES_AIR_SEA, ...CASES_ESPORTS, ...DESIGN, ...STUDIES, ...MANEUVER_KB, ...CQB_KB, ...BEHAVIOUR_KB].map((e) =>
  // The movement patterns older entries also show (`maneuver-tags.ts`), added to their own.
  MANEUVER_TAGS[e.id] ? { ...e, patterns: { ...MANEUVER_TAGS[e.id], ...e.patterns } } : e,
);
export const KB_BY_ID = new Map(KB.map((e) => [e.id, e]));

export { PATTERNS, REFERENCES, REF_BY_ID, fullCite, shortCite };
export type { KbEntry, LensId, Reference } from './types.ts';
export { LENSES } from './types.ts';

/** "(Lanchester 1916; Engel 1954)" - at most `n` citations. */
export function citeList(e: KbEntry, n = 3): string {
  return `(${e.refs.slice(0, n).map(shortCite).join('; ')})`;
}

export function kbStats() {
  const by = (t: KbEntry['type']) => KB.filter((e) => e.type === t).length;
  return {
    entries: KB.length,
    concepts: by('concept'),
    methods: by('method'),
    cases: by('case'),
    design: by('design'),
    studies: by('study'),
    patterns: PATTERNS.length,
    references: REFERENCES.length,
  };
}
