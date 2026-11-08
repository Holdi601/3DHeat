/**
 * Auto-exposure that follows the view.
 *
 * The meter (`autoExposure`) answers "what saturation suits the field on screen
 * now". Following the view asks it again whenever the camera comes to rest, so a
 * region flown into is exposed for itself instead of for the whole map it was
 * metered from. Three things keep that from becoming a picture that pumps:
 *
 * - it meters only once the camera has been still for a few rendered frames, so
 *   the field being metered is the converged one and not a half-built estimate;
 * - it ignores a new reading within a dead band of the current saturation, so
 *   the small differences between two nearby views do not move the scale at all;
 * - it glides to a new value in log space over a fraction of a second rather
 *   than jumping, so a change reads as the scale adjusting, not a flicker.
 *
 * Pure state, no GPU and no store: the engine feeds it frames and readings and
 * applies what it returns.
 */

export interface FollowOptions {
  /** Still frames before metering. */
  settleFrames: number;
  /** Readings within this factor of the current saturation are ignored. */
  deadBand: number;
  /** Glide duration, milliseconds. */
  glideMs: number;
}

export const DEFAULT_FOLLOW: FollowOptions = {
  settleFrames: 10,
  // A third either way. Two views of the same area meter within a few per cent of
  // each other; a region genuinely denser or sparser than the last one is out by
  // a factor of two or more.
  deadBand: 1.35,
  // Long enough to read as the scale settling rather than the picture pumping;
  // a re-exposure is a slow change of the whole image, and the eye takes a fast
  // one for a flicker.
  glideMs: 1200,
};

export class ExposureFollower {
  private readonly opts: FollowOptions;
  /** Still frames left before the next reading is due; 0 when none is. */
  private pending = 0;
  /** Bumped on every camera move, so a reading taken before one is discarded. */
  private generation = 0;
  private glide: { from: number; to: number; start: number } | null = null;

  constructor(opts: Partial<FollowOptions> = {}) {
    this.opts = { ...DEFAULT_FOLLOW, ...opts };
  }

  /**
   * One rendered frame. Returns the generation to meter for when a reading is
   * due this frame, otherwise null.
   */
  frame(moved: boolean, enabled: boolean): number | null {
    if (!enabled) {
      this.pending = 0;
      this.glide = null;
      return null;
    }
    if (moved) {
      this.generation++;
      this.pending = this.opts.settleFrames;
      return null;
    }
    if (this.pending > 0) {
      this.pending--;
      if (this.pending === 0) return this.generation;
    }
    return null;
  }

  /**
   * A reading arrived: start gliding from `current` to `target` unless the
   * camera has moved since it was asked for or it is inside the dead band.
   * Returns whether a glide started.
   */
  propose(generation: number, current: number, target: number, now: number): boolean {
    if (generation !== this.generation) return false;
    if (!(target > 0) || !(current > 0)) return false;
    const ratio = target / current;
    if (ratio < this.opts.deadBand && ratio > 1 / this.opts.deadBand) return false;
    this.glide = { from: current, to: target, start: now };
    return true;
  }

  /** The saturation to show at `now` while gliding, or null when not gliding. */
  value(now: number): number | null {
    const g = this.glide;
    if (!g) return null;
    const t = Math.min(1, Math.max(0, (now - g.start) / Math.max(1, this.opts.glideMs)));
    if (t >= 1) this.glide = null;
    // Smoothstep in log space: exposure is perceived as a ratio, so equal steps
    // of the logarithm read as an even change.
    const s = t * t * (3 - 2 * t);
    return Math.exp(Math.log(g.from) + (Math.log(g.to) - Math.log(g.from)) * s);
  }

  /** The saturation a glide in progress started from, or null when none is. */
  get from(): number | null {
    return this.glide ? this.glide.from : null;
  }

  /** Drop any glide and pending reading, as when the scale is locked. */
  cancel(): void {
    this.pending = 0;
    this.glide = null;
  }
}
