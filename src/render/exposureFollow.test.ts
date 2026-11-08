import { describe, expect, it } from 'vitest';
import { ExposureFollower } from './exposureFollow';

/** Run frames until a reading is due; the frame count it took, and the generation. */
function settle(f: ExposureFollower, limit = 100): { frames: number; generation: number | null } {
  for (let i = 1; i <= limit; i++) {
    const g = f.frame(false, true);
    if (g !== null) return { frames: i, generation: g };
  }
  return { frames: limit, generation: null };
}

describe('auto-exposure that follows the view', () => {
  it('meters once the camera has been still for the settle frames, and only then', () => {
    const f = new ExposureFollower({ settleFrames: 5 });
    // A still camera from the start: nothing to re-meter.
    expect(settle(f, 20).generation).toBeNull();
    expect(f.frame(true, true)).toBeNull();
    expect(settle(f).frames).toBe(5);
    // Once per rest, not every frame after it.
    expect(settle(f, 20).generation).toBeNull();
  });

  it('keeps waiting while the camera keeps moving', () => {
    const f = new ExposureFollower({ settleFrames: 5 });
    for (let i = 0; i < 50; i++) expect(f.frame(i % 3 === 0, true)).toBeNull();
  });

  it('ignores a reading inside the dead band', () => {
    const f = new ExposureFollower({ settleFrames: 1, deadBand: 1.35 });
    f.frame(true, true);
    const g = f.frame(false, true)!;
    expect(f.propose(g, 100, 120, 0)).toBe(false);
    expect(f.propose(g, 100, 80, 0)).toBe(false);
    expect(f.value(0)).toBeNull();
  });

  it('glides to a new value in log space, and stops there', () => {
    const f = new ExposureFollower({ settleFrames: 1, glideMs: 400 });
    f.frame(true, true);
    const g = f.frame(false, true)!;
    // Zoomed into a sparse region: a tenth of the far view's saturation.
    expect(f.propose(g, 1000, 100, 0)).toBe(true);
    expect(f.value(0)).toBeCloseTo(1000);
    // Halfway in time is halfway in the logarithm: the geometric mean.
    expect(f.value(200)).toBeCloseTo(Math.sqrt(1000 * 100));
    expect(f.value(400)).toBeCloseTo(100);
    expect(f.value(500)).toBeNull();
  });

  it('discards a reading taken before the camera moved again', () => {
    const f = new ExposureFollower({ settleFrames: 1 });
    f.frame(true, true);
    const g = f.frame(false, true)!;
    f.frame(true, true);
    expect(f.propose(g, 1000, 10, 0)).toBe(false);
  });

  it('does nothing while locked, and drops a glide when locked', () => {
    const f = new ExposureFollower({ settleFrames: 1 });
    expect(f.frame(true, false)).toBeNull();
    expect(f.frame(false, false)).toBeNull();
    f.frame(true, true);
    const g = f.frame(false, true)!;
    f.propose(g, 1000, 10, 0);
    f.frame(false, false);
    expect(f.value(100)).toBeNull();
  });
});
