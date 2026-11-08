import type { Dataset } from '../state/types';
import { CHUNK_ROWS, MAX_PLAN_BLOCKS, MAX_PLAN_SPRITES, SAMPLE_BLOCK, type ChunkDrawPlan } from './types';

/**
 * Stratified stochastic sampler over a time-sorted dataset.
 *
 * The point of this file: a sum of radial ramps is an average scaled by count,
 * so splatting a uniformly-chosen subset with weight `N/M` has the *same
 * expected value* as splatting all N. Frame cost becomes a budget you set rather
 * than a function of dataset size, and because the strata sweep with a
 * low-discrepancy offset, holding the view still merges successive frames into
 * the exact full-dataset answer.
 */

/** Golden-ratio conjugate — sweeps strata across frames without clumping. */
const GOLDEN = 0.6180339887498949;

export interface SampleResult {
  plan: ChunkDrawPlan[];
  candidateRows: number;
  /** Rows that will survive the shader's row-range reject. */
  submittedSprites: number;
  sampleWeight: number;
  /** True when every candidate row is submitted, i.e. the frame is already exact. */
  exact: boolean;
  /** With `runFrame`: frames whose plans together draw every block exactly once. */
  frames?: number;
}

const EMPTY: SampleResult = {
  plan: [],
  candidateRows: 0,
  submittedSprites: 0,
  sampleWeight: 1,
  exact: true,
};

/**
 * First index with `time[i] >= t`. Requires ascending `time`.
 */
export function lowerBound(time: Float32Array, t: number, lo = 0, hi = time.length): number {
  let a = lo;
  let b = hi;
  while (a < b) {
    const m = (a + b) >>> 1;
    if (time[m] < t) a = m + 1;
    else b = m;
  }
  return a;
}

/** First index with `time[i] > t`. */
export function upperBound(time: Float32Array, t: number, lo = 0, hi = time.length): number {
  let a = lo;
  let b = hi;
  while (a < b) {
    const m = (a + b) >>> 1;
    if (time[m] <= t) a = m + 1;
    else b = m;
  }
  return a;
}

/**
 * Rows visible for the window `[timeLo, timeHi]`.
 *
 * With a time-sorted dataset this is a single contiguous range, which is what
 * makes playback independent of dataset size — advancing the playhead moves two
 * integers, it does not touch any row.
 */
export function candidateRange(
  dataset: Dataset,
  timeLo: number,
  timeHi: number,
): [number, number] {
  if (!dataset.time || !dataset.timeSorted) return [0, dataset.count];
  const lo = lowerBound(dataset.time, timeLo);
  const hi = upperBound(dataset.time, timeHi, lo);
  return [lo, hi];
}

export interface PlanOptions {
  rowLo: number;
  rowHi: number;
  /** Sprite budget for this frame. */
  splatsPerFrame: number;
  /** Monotonic counter driving the low-discrepancy stratum offset. */
  frameIndex: number;
  /**
   * The frame's place in a run of accumulation, from 0. Given, the frames of a
   * run take every `frames`th block in turn, so a run that has drawn `frames`
   * frames has drawn every block exactly once and its mean is the whole field.
   * The low-discrepancy offsets only come close to that: a block drawn twice and
   * a neighbour never left grain in a still view that never went away.
   */
  runFrame?: number;
}

/**
 * How many sprites "every row" may ask for next.
 *
 * Only a frame that drew says anything of the cost: an idle one is a fullscreen pass.
 * One frame over the limit halves it at once, because waiting for an average to catch up
 * is three more such frames, and the GPU's watchdog does not wait. It grows only as a new
 * run of accumulation starts, never within one: how many frames a run needs follows from
 * the cap, and a cap rising mid-run makes the run count as finished with rows unused.
 */
export function nextExactCap(
  cap: number,
  lastFrameMs: number,
  lastFrameDrew: boolean,
  startingRun: boolean,
  o: { floor: number; ceiling: number; stallMs: number; easyMs: number },
): number {
  if (!lastFrameDrew) return cap;
  if (lastFrameMs > o.stallMs) return Math.max(o.floor, cap * 0.5);
  return startingRun && lastFrameMs < o.easyMs ? Math.min(o.ceiling, cap * 1.25) : cap;
}

/**
 * Sprites "every row" may draw in one frame, steered by what the heat pass costs.
 *
 * The cap that `nextExactCap` keeps lets a frame run to 400 ms before it reacts,
 * which is a dropped frame on every camera move once a window holds tens of
 * millions of rows. This one aims at a share of the frame instead. Its input is
 * the heat pass's own GPU time where the device can time it, so the display's
 * refresh cannot hide the headroom, and the drawn frame's time otherwise.
 *
 * It moves in proportion: past the budget it cuts to nine tenths of it at once
 * (a frame over is a frame dropped); under half the budget it grows towards
 * seven tenths of it, at most doubling, and only as a new run of accumulation starts, for the
 * reason given at `nextExactCap`.
 * Between the two it holds, so a cost near the budget never makes it hunt.
 */
export function nextHeatCap(
  cap: number,
  costMs: number,
  budgetMs: number,
  lastFrameDrew: boolean,
  startingRun: boolean,
  o: { floor: number; ceiling: number },
): number {
  if (!lastFrameDrew || !(costMs > 0) || !(budgetMs > 0)) return cap;
  if (costMs > budgetMs * 1.15) {
    // To nine tenths of the budget in one step, at most a quarter left: cut in
    // smaller steps, each frame on the way down was a dropped one.
    const cut = Math.max(0.25, (budgetMs * 0.9) / costMs);
    return Math.max(o.floor, cap * cut);
  }
  // Well under, it grows towards what the budget would carry, at most doubling:
  // after a cut that went too deep, an eighth a step took seconds to come back.
  if (startingRun && costMs < budgetMs * 0.5) return Math.min(o.ceiling, cap * Math.min(2, Math.max(1.125, (budgetMs * 0.7) / costMs)));
  return cap;
}

/**
 * The heat buffer's resolution, from how large a sprite is on screen.
 *
 * A sprite's cost is the pixels it covers, the square of its radius, so a wide
 * radius or a camera close to the data makes the heat pass fill-bound however
 * few rows there are. Drawing it at a lower resolution costs the square less
 * and loses nothing a smooth kernel had: what decides the level is the sprite's
 * radius in texels of the level, kept near `texels`.
 *
 * Set from the geometry rather than from the frame time, so it is ahead of the
 * cost instead of chasing it, and a radius or zoom that grows fourfold lowers
 * the resolution on the frame it happens. The frame time trims `texels` only,
 * slowly and inside a dead band. Levels are powers of two, the renderers keep a
 * buffer for each, and a level changes only past a margin of 0.85 of a step
 * either way, so a sprite size sitting on a boundary does not flip it.
 */
export class HeatLevel {
  private level = 1;
  private texels: number;
  private hold = 0;

  constructor(
    private readonly start = HEAT_LEVEL_TEXELS,
    private readonly minLevel = 1 / 16,
  ) {
    this.texels = start;
  }

  /** Resolution multiplier, a power of two in [minLevel, 1]. */
  get value(): number {
    return this.level;
  }

  reset(): void {
    this.level = 1;
    this.texels = this.start;
    this.hold = 0;
  }

  /**
   * `spritePx` is a typical sprite radius in full-resolution pixels; `costMs`
   * what the last drawn frame's heat cost and `budgetMs` what it may, or null
   * when nothing was drawn. Returns the level wanted now; the caller adopts it
   * only on a frame that starts the accumulation over anyway.
   */
  update(spritePx: number, costMs: number | null, budgetMs: number): number {
    if (costMs !== null && costMs > 0 && budgetMs > 0) {
      if (this.hold > 0) this.hold--;
      else if (costMs > budgetMs * 1.15 && this.texels > HEAT_LEVEL_MIN) {
        // Fill goes with the square of the radius, so the root of the overshoot.
        this.texels = Math.max(HEAT_LEVEL_MIN, this.texels * Math.max(0.5, Math.min(0.9, Math.sqrt(budgetMs / costMs))));
        this.hold = HEAT_LEVEL_HOLD;
      } else if (costMs < budgetMs * 0.35 && this.texels < this.start) {
        this.texels = Math.min(this.start, this.texels * 1.1);
        this.hold = HEAT_LEVEL_HOLD;
      }
    }
    if (!(spritePx > 0)) return this.level;
    const want = Math.log2(this.texels / spritePx);
    const now = Math.log2(this.level);
    const lo = Math.log2(this.minLevel);
    if (want < now - 0.85 || want > now + 0.85) {
      this.level = Math.pow(2, Math.max(lo, Math.min(0, Math.round(want))));
    }
    return this.level;
  }
}

/** Sprite radius, in texels of its level, that the level aims for. */
export const HEAT_LEVEL_TEXELS = 16;
/** The least it may be trimmed to: below this a sprite is too coarse to be round. */
const HEAT_LEVEL_MIN = 8;
/** Drawn frames between trims, enough for a smoothed cost to show the last one. */
const HEAT_LEVEL_HOLD = 12;

export function planFrame(opts: PlanOptions): SampleResult {
  const { rowLo, rowHi, splatsPerFrame, frameIndex } = opts;
  const candidateRows = Math.max(0, rowHi - rowLo);
  if (candidateRows === 0) return EMPTY;

  const totalBlocks = Math.ceil(candidateRows / SAMPLE_BLOCK);
  // Never more than the backends carry: past it they would drop whole chunks of the
  // plan while the readout still counted them, and the picture would lean to early rows.
  // A block is split where it crosses a chunk, one more entry each, so room is left for those.
  const roomForSplits = Math.ceil(candidateRows / CHUNK_ROWS) + 1;
  const wantBlocks = Math.min(MAX_PLAN_BLOCKS - roomForSplits, Math.max(1, Math.ceil(Math.max(1, splatsPerFrame) / SAMPLE_BLOCK)));

  const selected: number[] = [];
  let frames = 1;
  const absolute = new Map<number, number[]>();
  let absoluteRows = 0;
  if (wantBlocks >= totalBlocks) {
    for (let b = 0; b < totalBlocks; b++) selected.push(b);
  } else if (opts.runFrame !== undefined) {
    // Blocks on the absolute row grid rather than counted from the window's
    // start, and a power of two of frames, so a window that slides or a cap that
    // moves a little keeps drawing the same rows: playback under a thinned plan
    // is then a steady thinning of the data instead of a new sample every frame.
    frames = Math.pow(2, Math.ceil(Math.log2(totalBlocks / wantBlocks)));
    const k = opts.runFrame % frames;
    const first = Math.floor(rowLo / SAMPLE_BLOCK);
    const last = Math.ceil(rowHi / SAMPLE_BLOCK);
    for (let b = first + ((k - (first % frames) + frames) % frames); b < last; b += frames) {
      const start = b * SAMPLE_BLOCK;
      const gStart = Math.max(rowLo, start);
      const gEnd = Math.min(rowHi, start + SAMPLE_BLOCK);
      if (gEnd <= gStart) continue;
      // A chunk holds a whole number of blocks, so an aligned block never crosses one.
      const chunk = Math.floor(start / CHUNK_ROWS);
      let list = absolute.get(chunk);
      if (!list) {
        list = [];
        absolute.set(chunk, list);
      }
      list.push(start - chunk * CHUNK_ROWS);
      absoluteRows += gEnd - gStart;
    }
  } else {
    // Stratified: one block per stratum of width `stride`, offset by a
    // low-discrepancy sequence so consecutive frames tile the whole range.
    const stride = totalBlocks / wantBlocks;
    const jitter = (frameIndex * GOLDEN) % 1;
    for (let i = 0; i < wantBlocks; i++) {
      const b = Math.min(totalBlocks - 1, Math.floor((i + jitter) * stride));
      selected.push(b);
    }
  }

  // Blocks are addressed globally over the candidate range, then split at chunk
  // boundaries because each chunk is a separate set of textures.
  const byChunk = absolute;
  let submitted = absoluteRows;
  for (const b of selected) {
    const gStart = rowLo + b * SAMPLE_BLOCK;
    const gEnd = Math.min(rowHi, gStart + SAMPLE_BLOCK);
    if (gEnd <= gStart) continue;
    let cursor = gStart;
    while (cursor < gEnd) {
      const chunk = Math.floor(cursor / CHUNK_ROWS);
      const chunkStart = chunk * CHUNK_ROWS;
      const chunkEnd = chunkStart + CHUNK_ROWS;
      const segEnd = Math.min(gEnd, chunkEnd);
      let list = byChunk.get(chunk);
      if (!list) {
        list = [];
        byChunk.set(chunk, list);
      }
      list.push(cursor - chunkStart);
      submitted += segEnd - cursor;
      cursor = segEnd;
    }
  }

  const plan: ChunkDrawPlan[] = [];
  for (const [chunk, starts] of byChunk) {
    const chunkStart = chunk * CHUNK_ROWS;
    plan.push({
      chunk,
      blockStarts: new Uint32Array(starts),
      blockCount: starts.length,
      minRow: Math.max(0, rowLo - chunkStart),
      maxRow: Math.min(CHUNK_ROWS, rowHi - chunkStart),
    });
  }
  plan.sort((a, b) => a.chunk - b.chunk);

  return {
    plan,
    candidateRows,
    submittedSprites: submitted,
    sampleWeight: submitted > 0 ? candidateRows / submitted : 1,
    exact: submitted >= candidateRows,
    frames: opts.runFrame !== undefined ? frames : undefined,
  };
}

/**
 * Closed-loop control on the frame cost, in two stages, plus a check that the
 * stages are achieving anything.
 *
 * Stage one is the sprite count, which trades noise for time. But sprite count
 * is not the only cost: a large radius makes each sprite cover thousands of
 * pixels, and at that point even the minimum number of sprites can miss the
 * frame budget. So stage two drops the heat buffer's resolution, which cuts
 * fragment work quadratically and is nearly invisible under a smooth ramp.
 *
 * Both stages nudge rather than jump. A hard correction on a single slow frame
 * makes the noise level visibly pulse, which reads as a bug even when the
 * framerate is fine.
 *
 * ---
 *
 * The third part exists because the first two were solving the wrong problem
 * whenever the frame's cost was not the heat. The controller can only see the
 * *total* frame time — there is no per-pass GPU timing on either backend — so it
 * reads a slow frame as a reason to draw fewer sprites even when the sprites are
 * not what made it slow. Faced with a heavy level it cuts to the floor, drops the
 * resolution to its floor too, and still misses the target, having given up the
 * picture for nothing.
 *
 * Measured on a 1.4M-triangle level with 14M rows in the window: the budget swept
 * from 64K to 16M sprites, a 214x change, moved the frame time by 0.98x — from
 * 191ms to 188ms. The same scene with the level removed ran at 17ms. The geometry
 * was the entire cost and the heat was free at any budget, but the controller had
 * settled at the floor, so a moving camera showed one row in 214 as isolated
 * over-bright dots instead of a field.
 *
 * So: cutting is only justified while cutting observably helps. Once the floor is
 * reached and the target is still missed, that is proof it does not — the floor
 * is protecting nothing — and the controller climbs back out, stopping only if
 * the frame genuinely worsens on the way. A scene that really is sprite-bound
 * worsens immediately and falls straight back to cutting, which is the original
 * behaviour.
 */
export class BudgetController {
  private current: number;
  /** Resolution multiplier applied on top of the user's setting, 0.25..1. */
  private scale = 1;
  /**
   * Whether the controller is still trying to buy frame time by drawing less, or
   * has established that drawing less does not buy any.
   */
  private mode: 'cutting' | 'climbing' = 'cutting';
  /** Frame time observed at the floor — the baseline a climb is judged against. */
  private floorMs = 0;
  /** Consecutive updates spent at the sprite floor while still missing target. */
  private stuck = 0;
  /** Updates since the last climb step, so the frame time can respond to it. */
  private held = 0;
  /** Consecutive updates meeting the target, towards the next probe. */
  private calm = 0;
  /** Calm updates to wait before probing; doubles after each probe that cost frames. */
  private probeEvery = PROBE_AFTER;
  /** A probe in progress: what to go back to if it costs frames. */
  private trial: { budget: number; scale: number; held: number } | null = null;
  /** After a probe that cost frames: the values put back, held while the smoothed frame time recovers. */
  private pinned: { budget: number; scale: number; left: number } | null = null;

  constructor(
    initial: number,
    private min = 64 * 1024,
    private max = MAX_PLAN_SPRITES,
  ) {
    this.current = initial;
  }

  get value(): number {
    return this.current;
  }

  /** For the readout: is the budget being held up because sprites are free? */
  get climbing(): boolean {
    return this.mode === 'climbing';
  }

  /**
   * Auto resolution factor; multiply the requested heat scale by this.
   *
   * Quantised to sixteenths deliberately. Changing the heat buffer's size
   * reallocates it and discards accumulated heat, so a continuously drifting
   * value would restart convergence every single frame; discrete steps settle.
   */
  get resolutionScale(): number {
    return Math.round(this.scale * 16) / 16;
  }

  reset(v: number): void {
    this.current = clamp(v, this.min, this.max);
    this.scale = 1;
    this.mode = 'cutting';
    this.floorMs = 0;
    this.stuck = 0;
    this.held = 0;
    this.calm = 0;
    this.probeEvery = PROBE_AFTER;
    this.trial = null;
    this.pinned = null;
  }

  /** `frameMs` is the smoothed frame time; `targetMs` the budget (e.g. 16.6). */
  update(frameMs: number, targetMs: number): number {
    if (frameMs <= 0) return this.current;
    const ratio = targetMs / frameMs;

    if (this.mode === 'climbing') {
      // Give the resolution back first: it is the more damaging of the two
      // reductions and, if sprites turned out to be free, pixels are too.
      this.scale = clamp(this.scale * 1.25, 0.25, 1);
      if (frameMs > this.floorMs * CLIMB_ALLOWANCE) {
        // Sprites do cost something here after all. Back off and resume normal
        // control from a little below where it started hurting.
        this.mode = 'cutting';
        this.current = clamp(this.current * 0.6, this.min, this.max);
        this.stuck = 0;
        return this.current;
      }
      if (ratio >= 1) {
        // Somehow inside the target — nothing to protect against, so hand back
        // to normal control, which will keep creeping upward anyway.
        this.mode = 'cutting';
        return this.current;
      }
      // One step, then wait for the frame time to actually respond.
      //
      // The waiting is the whole difference between a climb and a runaway. The
      // input is an exponential average with a tenth weight on the newest frame,
      // so it needs a dozen or more frames to reflect a change; a version of
      // this that stepped every frame multiplied the budget a thousandfold
      // before the first evidence arrived, and sailed past the ceiling in a
      // scene where the sprites genuinely were the cost.
      if (++this.held < CLIMB_HOLD) return this.current;
      this.held = 0;
      this.current = clamp(this.current * CLIMB_STEP, this.min, this.max);
      return this.current;
    }

    // Asymmetric: back off fast when we overshoot, creep up when we have headroom.
    const gain = ratio < 1 ? 0.35 : 0.08;
    const factor = 1 + (ratio - 1) * gain;
    this.current = clamp(this.current * clamp(factor, 0.5, 1.25), this.min, this.max);

    // Stage two only engages once stage one has nothing left to give, so a
    // normal load never loses resolution.
    const atFloor = this.current <= this.min * 1.0001;
    if (atFloor && ratio < 0.9) {
      this.scale = clamp(this.scale * 0.92, 0.25, 1);
    } else if (ratio > 1.3 && this.scale < 1) {
      this.scale = clamp(this.scale * 1.04, 0.25, 1);
    }

    // Stuck at the sprite floor and still missing target: drawing fewer sprites
    // is not working, so stop doing it. See the class comment.
    //
    // On a timer rather than on the resolution also having bottomed out, which
    // was the first attempt and never fired — the resolution settles a few
    // sixteenths above its floor whenever the frame time wobbles, so the
    // condition was unreachable in exactly the case it was written for. The wait
    // is what the giant-radius case needs anyway: there the heat *is* the cost,
    // stage two genuinely fixes it, and `ratio` recovers within these few frames
    // and resets the counter before any climb begins.
    if (atFloor && ratio < FLOOR_GIVE_UP) this.stuck++;
    else this.stuck = 0;
    if (this.stuck >= FLOOR_PATIENCE) {
      this.mode = 'climbing';
      this.floorMs = frameMs;
      this.stuck = 0;
      this.trial = null;
      return this.current;
    }
    this.probe(ratio);
    return this.current;
  }

  /**
   * Win back what a passing stall took, when the frame cannot show headroom.
   *
   * With vsync on, a frame never comes in under the display's interval, so at a
   * 60fps target on a 60Hz screen `ratio` sits at about 1 however cheap the
   * frame is. The creep above needs a ratio over 1 and the resolution needs 1.3,
   * so neither ever came back: one stall - a page reload, tiles streaming in -
   * left the budget near its floor and the heat at a quarter resolution for the
   * rest of the session.
   *
   * So after a spell of meeting the target, try one step up: a sixteenth of
   * resolution and a quarter more sprites. If the frame holds, keep it and try
   * again after the next spell; if it slips, put both back and wait twice as
   * long before trying again, so a scene that really is at its limit pays one
   * short dip now and then rather than a pulse. The values put back are held
   * while the smoothed frame time recovers from the dip - otherwise the cutting
   * above reads the dip's tail as a heavier scene, cuts well below them, and the
   * next probes climb back up and slip again.
   *
   * A slow spell that is not a probe's doing means the scene changed, so the
   * wait starts short again: what that stall takes is won back within seconds.
   */
  private probe(ratio: number): void {
    if (this.pinned) {
      this.current = Math.max(this.current, this.pinned.budget);
      this.scale = Math.max(this.scale, this.pinned.scale);
      if (--this.pinned.left <= 0) this.pinned = null;
      this.calm = 0;
      return;
    }
    if (this.trial) {
      if (ratio < PROBE_FAIL) {
        this.current = this.trial.budget;
        this.scale = this.trial.scale;
        this.pinned = { budget: this.trial.budget, scale: this.trial.scale, left: PROBE_HOLD };
        this.trial = null;
        this.calm = 0;
        this.probeEvery = Math.min(this.probeEvery * 2, PROBE_MAX);
      } else if (++this.trial.held >= PROBE_HOLD) {
        this.trial = null;
        this.calm = 0;
      }
      return;
    }
    if (ratio < PROBE_CALM) {
      if (ratio < PROBE_FAIL) this.probeEvery = PROBE_AFTER;
      this.calm = 0;
      return;
    }
    if (++this.calm < this.probeEvery || (this.scale >= 1 && this.current >= this.max)) return;
    this.trial = { budget: this.current, scale: this.scale, held: 0 };
    this.scale = clamp(this.scale + 1 / 16, 0.25, 1);
    this.current = clamp(this.current * PROBE_STEP, this.min, this.max);
    this.calm = 0;
  }
}

/** A frame within this share of the target counts as meeting it, for probing. */
const PROBE_CALM = 0.97;
/** A probe whose frame falls below this share of the target cost frames, and is undone. */
const PROBE_FAIL = 0.9;
/** Calm updates before the first probe: about a second at 60fps. */
const PROBE_AFTER = 60;
/** The longest wait between probes in a scene at its limit: about a minute. */
const PROBE_MAX = 3600;
/** Updates a probe must hold, long enough for the smoothed frame time to show its cost. */
const PROBE_HOLD = 28;
/** Sprite budget multiplier per probe. */
const PROBE_STEP = 1.25;

/** Budget multiplier per step while climbing back out of the floor. */
const CLIMB_STEP = 1.5;
/**
 * Updates to hold each climb step, so the smoothed frame time can respond before
 * the next one. Matched to that smoothing: a tenth weight per frame needs of the
 * order of ten frames to move.
 */
const CLIMB_HOLD = 14;
/**
 * How much worse the frame may get during a climb before it is abandoned.
 *
 * Generous on purpose. The frame rate target has already been missed by
 * definition — that is what started the climb — so the choice is not between
 * fast and slow but between a slow frame that shows the data and a slow frame
 * that shows scattered dots. Half again is worth paying for two orders of
 * magnitude more of the dataset; much more than that and a genuinely sprite-bound
 * scene would grind.
 */
const CLIMB_ALLOWANCE = 1.5;
/**
 * How far under target the frame must be, at both floors, before the controller
 * concludes that drawing less cannot fix it.
 *
 * Well clear of 1 so ordinary jitter around a target that is *nearly* met never
 * triggers a climb; a frame at 70% of target is missing it structurally.
 */
const FLOOR_GIVE_UP = 0.7;
/**
 * Updates to spend at the sprite floor, still missing target, before concluding
 * that drawing fewer sprites is not the answer.
 *
 * Long enough for stage two to walk the heat resolution down from full to its
 * floor and be given credit if that is what was needed — about seventeen updates
 * — and short enough that a camera move recovers within a second.
 */
const FLOOR_PATIENCE = 30;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
