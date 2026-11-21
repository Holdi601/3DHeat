import { create } from 'zustand';

/**
 * A pick waiting to be loaded, as the load card in the middle of the view shows
 * it (`ui/panels/LoadCard.tsx`): what was detected and the one action, Load.
 *
 * The Source panel owns the pick - the preview, the mapping, the fit check -
 * and publishes this summary of it with the actions that act on it, so the card
 * can stand where the eye is after a pick without the panel's controls.
 */
export interface PendingLoad {
  /** The selection as the panel names it (`describeSelection`). */
  name: string;
  /** Tables to read. */
  files: number;
  /** Matches: containers picked, else tables. */
  matches: number;
  bytes: number;
  /** Rows across the selection; null while they are counted. */
  rows: number | null;
  /** The game, as the files name it (a container's manifest, a table's hints); null when they do not. */
  game: string | null;
  /** The map or theatre the files name; null when they do not. */
  map: string | null;
  /**
   * How the columns were found: `ok` from the file's own reading instructions
   * or an unambiguous guess, `unsure` when the guess wants a look, `bad` when
   * no position could be mapped.
   */
  columns: 'ok' | 'unsure' | 'bad' | null;
  /** The memory check's verdict; null until the rows are counted. */
  verdict: 'fits' | 'tight' | 'too-big' | null;
  /** One row in `stride` is read. */
  stride: number;
  /** The load's projected time (`estimateLoadSeconds`); null until the rows are counted. */
  seconds: number | null;
  canLoad: boolean;
}

interface PendingState {
  pending: PendingLoad | null;
  /** Load the pick, as the panel's own Load button does. */
  go: (() => void) | null;
  /** Set the pick aside without loading it. */
  dismiss: (() => void) | null;
}

export const usePendingLoad = create<PendingState>(() => ({ pending: null, go: null, dismiss: null }));

export function setPendingLoad(pending: PendingLoad | null, go: (() => void) | null = null, dismiss: (() => void) | null = null): void {
  usePendingLoad.setState({ pending, go: pending ? go : null, dismiss: pending ? dismiss : null });
}
