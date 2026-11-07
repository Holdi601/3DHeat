import type { Dataset, ViewMode } from '../state/types';

/**
 * The stretch of time the playhead should cover.
 *
 * The dataset's own range is the whole file, and for a pile of concatenated
 * matches that is days. A session is minutes inside it — even the busiest match
 * on the test export is a short stretch of a range spanning a long time —
 * so scrubbing a selected session against the file's range means dragging a
 * scrubber a thousandth of its width and hoping. Playback would run for hours
 * through empty time before reaching the match, and the loop would return to a
 * point nowhere near it.
 *
 * So when a session is selected the playhead's world is that session. Heat modes
 * keep the whole range: they draw every row at once and the selection is about
 * which positions form a track, which is a question only playback asks.
 */
export function playbackRange(
  dataset: Dataset | null,
  mode: ViewMode,
  session: number,
): [number, number] {
  if (!dataset) return [0, 0];
  if (mode !== 'team' || session < 0) return dataset.timeRange;
  const { sessionStart: start, sessionEnd: end } = dataset;
  if (!start || !end || session >= start.length) return dataset.timeRange;
  const lo = start[session];
  const hi = end[session];
  // A session of one sample has no span to scrub. Falling back to the file's
  // range is more useful than a zero-width scrubber, which cannot be dragged and
  // reads as broken.
  if (!(hi > lo)) return dataset.timeRange;
  return [lo, hi];
}
