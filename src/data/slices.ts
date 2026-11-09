/**
 * Work too big for one frame, done a slice a frame: a generator that yields
 * at cheap checkpoints, run until the frame's share of time is spent. Every
 * job shares one budget per frame, so five of them at once still cost one
 * slice; what is not done waits for the next frame.
 *
 * The budget is Infinity until the engine sets it (`sliceBudget.ms`): tests
 * and tools that ask for a result get it at once, whole.
 */

export const sliceBudget = { ms: Infinity };

/** The window the budget is counted over: a frame, about. */
const WINDOW_MS = 12;

let windowStart = -Infinity;
let spent = 0;
/** The longest single step seen, ms: what a slice cannot split. */
export const sliceStats = { longest: 0, steps: 0 };

/**
 * What a job yields before a step it cannot split (a figure's model built
 * whole): that step starts a slice of its own, not the end of a spent one.
 */
export const FRESH = 1;

/** What a job yields while it waits for something elsewhere (a worker): the slice ends, the next frame asks again. */
export const WAIT = 2;

/** A job: yields at its checkpoints, `FRESH` before a big step it cannot split, `WAIT` while it waits. */
export type SliceJob<T> = Generator<void | typeof FRESH | typeof WAIT, T, void>;

/** Runs `g` for what is left of this frame's budget: its value when done, else `undefined` (more next frame). */
export function runSlice<T>(g: SliceJob<T>): { value: T } | undefined {
  if (sliceBudget.ms === Infinity) {
    for (;;) {
      const r = g.next();
      if (r.done) return { value: r.value };
      // Nothing to wait for without a frame loop: the jobs that wait only do so in the viewer.
    }
  }
  const now = performance.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    spent = 0;
  }
  const end = now + Math.max(0, sliceBudget.ms - spent);
  let t = now;
  // One step at least a frame, so a job always moves on.
  for (;;) {
    const r = g.next();
    const after = performance.now();
    sliceStats.steps++;
    if (after - t > sliceStats.longest) sliceStats.longest = after - t;
    t = after;
    if (r.done) {
      spent += t - now;
      return { value: r.value };
    }
    if (t >= end || r.value === WAIT || (r.value === FRESH && t - now > 1)) break;
  }
  spent += t - now;
  return undefined;
}

/** Jobs not done yet: the engine keeps drawing frames while there are any, so they finish while nothing moves. */
let pendingAt = -Infinity;
export function slicePending(): boolean {
  return performance.now() - pendingAt < 250;
}

/**
 * A result worked out a slice a frame, once per key: the result when done,
 * `undefined` while it is being worked out.
 */
export function sliced<K extends object, T>(cache: WeakMap<K, T>, jobs: WeakMap<K, SliceJob<T>>, key: K, start: () => SliceJob<T>): T | undefined {
  if (cache.has(key)) return cache.get(key);
  let g = jobs.get(key);
  if (!g) {
    g = start();
    jobs.set(key, g);
  }
  const r = runSlice(g);
  if (!r) {
    pendingAt = performance.now();
    return undefined;
  }
  jobs.delete(key);
  cache.set(key, r.value);
  return r.value;
}
