/**
 * Playback speeds: the menu's steps, a typed speed read and checked, and the
 * last one kept for the next visit.
 *
 * Slow speeds go down to a hundredth, for a merge or a shot frame by frame;
 * the playhead is a float advanced by the frame's time, so nothing snaps to the
 * samples however slow. Fast ones run to an hour a second, for a long file.
 */

/** The menu's speeds, slowest first. */
export const PLAYBACK_SPEEDS = [0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800];

/** The slowest and fastest speed that can be typed. */
export const MIN_SPEED = 0.001;
export const MAX_SPEED = 3600;

const KEY = 'heat3d.speed';

/**
 * A typed speed, or null when it is not one. Takes a decimal point or comma and
 * an `x` or `×` either side ("0,3", "12x", "×4"); refuses zero, negatives and
 * anything outside MIN_SPEED..MAX_SPEED rather than quietly changing it.
 */
export function parseSpeed(text: string): number | null {
  const s = text.trim().replace(/^[x×]\s*/i, '').replace(/\s*[x×]$/i, '').replace(',', '.');
  if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const v = Number(s);
  if (!Number.isFinite(v) || v < MIN_SPEED || v > MAX_SPEED) return null;
  // Four significant figures: what was typed, without float dust.
  return Number(v.toPrecision(4));
}

/** Decimals a speed is shown with: as many as it has, up to three. */
export function speedDigits(s: number): number {
  for (let d = 0; d < 3; d++) if (Math.abs(s * 10 ** d - Math.round(s * 10 ** d)) < 1e-9) return d;
  return 3;
}

/** The menu's speeds, with `current` among them when it was typed. */
export function speedOptions(current: number): number[] {
  return PLAYBACK_SPEEDS.includes(current) ? PLAYBACK_SPEEDS : [...PLAYBACK_SPEEDS, current].sort((a, b) => a - b);
}

/** The speed this browser last played at, or 1. */
export function savedSpeed(): number {
  try {
    const v = Number(localStorage.getItem(KEY));
    return Number.isFinite(v) && v >= MIN_SPEED && v <= MAX_SPEED ? v : 1;
  } catch {
    // No storage: normal speed.
    return 1;
  }
}

export function saveSpeed(v: number): void {
  try {
    localStorage.setItem(KEY, String(v));
  } catch {
    // Private windows and blocked storage: the speed lasts this visit.
  }
}
