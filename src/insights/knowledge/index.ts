/**
 * The knowledge base, gathered: every entry by id, with its references.
 * Adding an entry: put it in the file of its type with its patterns, lenses
 * and references; `knowledge.test.ts` checks ids, patterns and references.
 * See docs/knowledge.md.
 */

import { CASES } from './cases';
import { CONCEPTS } from './concepts';
import { DESIGN } from './design';
import { METHODS } from './methods';
import { PATTERNS } from './patterns';
import { REFERENCES, REF_BY_ID, fullCite, shortCite } from './refs';
import type { KbEntry } from './types';

export const KB: KbEntry[] = [...CONCEPTS, ...METHODS, ...CASES, ...DESIGN];
export const KB_BY_ID = new Map(KB.map((e) => [e.id, e]));

export { PATTERNS, REFERENCES, REF_BY_ID, fullCite, shortCite };
export type { KbEntry, LensId, Reference } from './types';
export { LENSES } from './types';

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
