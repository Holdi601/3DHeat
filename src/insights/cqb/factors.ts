/**
 * The close-quarters situations as breakdown factors (docs/breakdown.md):
 * for every row, whether its player was blinded, whether a death was traded,
 * whether the row is the round's opening duel, and whether its side had more,
 * as many or fewer players alive. Worked out once per dataset by the
 * close-quarters walk in its worker (`run.ts`), kept beside the dataset (not
 * among its columns), and read by the breakdown as a list column
 * `state_situations`, one factor per situation.
 */

import type { AttributeColumn, Dataset } from '../../state/types';
import { FULL_SCOPE } from '../../volumes/stats';
import { runCqbFlags, cqbFlagsSync } from './run';
import { F_FLASHED, F_MAN_SHIFT, F_OPENING, F_TRADED } from './walk';

export const SITUATION_COLUMN = 'state_situations';
/** Situation ids, as list items; the panel says them as `breakdown.situation.<id>`. */
export const SITUATIONS = ['flashed', 'traded', 'opening', 'man-up', 'even', 'man-down'] as const;

/** Category `bits` -> its items: every combination of the situation bits. */
export const SITUATION_CATEGORIES: string[] = Array.from({ length: 32 }, (_, b) => {
  const it: string[] = [];
  if (b & F_FLASHED) it.push('flashed');
  if (b & F_TRADED) it.push('traded');
  if (b & F_OPENING) it.push('opening');
  const man = (b >> F_MAN_SHIFT) & 3;
  if (man) it.push(man === 1 ? 'man-up' : man === 2 ? 'even' : 'man-down');
  return it.join('|');
});

const done = new WeakMap<Dataset, AttributeColumn | null>();
const pending = new WeakMap<Dataset, Promise<AttributeColumn | null>>();

function column(data: Uint32Array): AttributeColumn {
  return { name: SITUATION_COLUMN, kind: 'category', data, min: 0, max: SITUATION_CATEGORIES.length - 1, categories: SITUATION_CATEGORIES };
}

/** The situations column of a dataset, once worked out; none before or where the data cannot carry it. */
export function situationColumns(ds: Dataset): AttributeColumn[] {
  const c = done.get(ds);
  return c ? [c] : [];
}

/** Works the situations out in a worker, once per dataset; resolves null where the data cannot carry them. */
export function ensureSituations(ds: Dataset, signal?: AbortSignal): Promise<AttributeColumn | null> {
  if (done.has(ds)) return Promise.resolve(done.get(ds)!);
  let p = pending.get(ds);
  if (!p) {
    p = runCqbFlags(ds, FULL_SCOPE, signal)
      .then((f) => {
        const c = f ? column(f) : null;
        done.set(ds, c);
        return c;
      })
      .catch(() => null)
      .finally(() => pending.delete(ds));
    pending.set(ds, p);
  }
  return p;
}

/** On this thread: the tests. */
export function situationsSync(ds: Dataset): AttributeColumn | null {
  if (!done.has(ds)) {
    const f = cqbFlagsSync(ds, FULL_SCOPE);
    done.set(ds, f ? column(f) : null);
  }
  return done.get(ds)!;
}
