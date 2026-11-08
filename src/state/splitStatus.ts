import { create } from 'zustand';

/**
 * What the engine found when it drew the difference split, for the Split panel.
 *
 * Apart from the main store because the engine writes it from the frame loop: a
 * change here re-renders the one panel that shows it and nothing else.
 */
export interface SplitStatus {
  /** Rows on the + side in the time window, by the rules the shader applies. */
  positive: number;
  /** Rows on the − side. */
  negative: number;
  /** False when the counts were scaled up from a sample of the rows. */
  exact: boolean;
  /**
   * Chunks of rows the last heat pass left out because the split's column could
   * not be put on the GPU for them. They are not drawn at all, never drawn with
   * the group split instead.
   */
  skippedChunks: number;
  /** Chunks the heat pass had to draw, for saying how much was left out. */
  chunks: number;
}

export const useSplitStatus = create<SplitStatus>(() => ({
  positive: 0,
  negative: 0,
  exact: true,
  skippedChunks: 0,
  chunks: 0,
}));

/** Publish a new status, skipping the store when nothing changed. */
export function publishSplitStatus(next: SplitStatus): void {
  const cur = useSplitStatus.getState();
  if (
    cur.positive === next.positive &&
    cur.negative === next.negative &&
    cur.exact === next.exact &&
    cur.skippedChunks === next.skippedChunks &&
    cur.chunks === next.chunks
  ) {
    return;
  }
  useSplitStatus.setState(next);
}
