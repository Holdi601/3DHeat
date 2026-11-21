/**
 * Columns a reader of the dataset needs that a load may have left in the
 * files (the columns on demand, `columnStore.ts`): the hits on the vehicles,
 * the turrets' aim. A reader that works its answer out once per dataset asks
 * for them here; while they are still being read it waits, and an answer made
 * while some were missing is worked out again once they are here.
 *
 * Kept apart from the column store so the readers (plain modules, tested
 * without a page) do not load it: the store answers once it is installed.
 */

/** Reads those of `names` (any case) that wait in the files; true while any of them is not in memory yet. */
export type ColumnAsk = (names: readonly string[]) => boolean;

let ask: ColumnAsk | null = null;

/** The column store's answer (`installColumnDemand`); null: nothing waits in the files. */
export function setColumnAsk(f: ColumnAsk | null): void {
  ask = f;
}

/** Asks for those of `names` that wait in the files; true while any of them is still to arrive. */
export function columnsPending(names: readonly string[]): boolean {
  return ask ? ask(names) : false;
}
