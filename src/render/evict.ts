/**
 * Which chunk of rows gives its GPU memory back when the budget drops below
 * what is held (`Renderer.shrinkToBudget`).
 *
 * The least recently drawn: a chunk outside the time window is not drawn, so
 * the ones farthest from what is on screen go first, and with all of them in
 * view, the latest in time (the rows are in time order). One a call, so the
 * caller decides the pace.
 */
export interface EvictCandidate {
  /** The renderer's frame count when the chunk was last drawn. */
  drawnFrame: number;
  /** First row; later rows are later in time. */
  start: number;
  /** Already given back. */
  evicted: boolean;
}

/** Index of the chunk to give back next, or -1 when none is left. */
export function leastUsedChunk(chunks: readonly EvictCandidate[]): number {
  let best = -1;
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    if (c.evicted) continue;
    if (best < 0) {
      best = i;
      continue;
    }
    const b = chunks[best];
    if (c.drawnFrame < b.drawnFrame || (c.drawnFrame === b.drawnFrame && c.start > b.start)) best = i;
  }
  return best;
}
