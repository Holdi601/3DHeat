/**
 * Label rules per kind of object, as Tacview sets its labels apart for the
 * selected objects and the rest: which rule a unit's label follows, what it
 * shows, and where it stands when labels would cover each other.
 */

import type { Dataset } from '../../state/types';
import { labelFieldsFor, type LabelCategory, type LabelRule } from '../../state/replayStore';
import { unitCategory } from './objectType';
import type { Unit } from './units';

/** The rule a unit's label follows: the units in question have their own, then weapons, AI, and each kind of object. */
export function labelCategory(d: Dataset, u: Unit, inQuestion: boolean): LabelCategory {
  if (inQuestion) return 'selected';
  if (u.kind === 'weapon') return 'weapon';
  if (u.kind === 'ai') return 'ai';
  return unitCategory(d, u);
}

/** The fields a rule shows: its own, else the ones chosen for every unit. */
export function ruleFields(d: Dataset, rule: LabelRule, chosen: string[] | null): string[] {
  return rule.fields ?? labelFieldsFor(d, chosen);
}

/**
 * Where a label stands in the queue for space: the followed unit first, the
 * selected one, the measured pair and the target, then by the rule's priority
 * (5 first). Lower goes first.
 */
export function labelRank(special: 0 | 1 | 2 | null, priority: number): number {
  return special !== null ? special : 3 + (5 - Math.max(1, Math.min(5, priority)));
}
