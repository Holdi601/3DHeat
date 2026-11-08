/**
 * How a unit is drawn by its size on screen, the "At a distance" setting:
 *
 * - figure: its own model, grown to the smallest size on screen; a dart only
 *   where the frame-time governor asks for one (`dartPx`), in its domain's
 *   shape.
 * - arrow: as before - the model while it is `dartPx` long at true size,
 *   then its domain's dart (an aircraft arrow, a hull, a vehicle, a dot).
 * - symbol: the model while it is longer than the threshold (the size at
 *   which it would be grown to stay readable), then a map symbol, crossfaded
 *   over the last 30 % so nothing pops.
 *
 * Whatever the setting, weapons are their model at true size up close and
 * their own glyph (a missile's glowing dart, a bomb's teardrop) further off;
 * decoys are only their glow or puff, shells only their tracer, debris a dot.
 *
 * The place shaders (`gpuTracks/shader.ts`, `gpuTracks/glsl.ts`) do the same
 * arithmetic; this is the reference, and what the CPU paths call.
 */

import { Domain, isEffectDomain, isWeaponDomain } from '../../figures/symbolClass';
import { hasDart } from './darts';

export type FarMode = 'figure' | 'arrow' | 'symbol';
export const FAR_MODES: FarMode[] = ['figure', 'arrow', 'symbol'];
export const FAR_MODE_ID: Record<FarMode, number> = { figure: 0, arrow: 1, symbol: 2 };

/** A weapon's model is drawn at true size from this many pixels long; its glyph below. */
export const WEAPON_PX = 14;
/** The crossfade starts at this share of the threshold. */
export const FADE_FROM = 0.7;

export interface FarLook {
  /** The model's alpha (0: not drawn). */
  figure: number;
  /** The glyph's or symbol's alpha (0: not drawn). */
  glyph: number;
  /** Drawn as its domain's dart. */
  dart: boolean;
  /** The model at true size, never grown to the smallest size on screen. */
  trueSize: boolean;
}

function fade(lo: number, hi: number, x: number): number {
  if (x <= lo) return 0;
  if (x >= hi) return 1;
  const t = (x - lo) / (hi - lo);
  return t * t * (3 - 2 * t);
}

/**
 * How a unit of `domain`, `trueLen` pixels long on screen at true size, is
 * drawn; `hasMesh` when it has a model, `threshold` the symbol threshold (px),
 * `dartPx` the governor's.
 */
export function farLook(mode: number, domain: number, trueLen: number, hasMesh: boolean, threshold: number, dartPx: number): FarLook {
  if (domain === Domain.Shell) return { figure: 0, glyph: 0, dart: false, trueSize: true };
  if (isEffectDomain(domain)) {
    // Debris with a model of its own shows it when big enough; decoys never.
    if (domain === Domain.Misc && hasMesh && trueLen >= WEAPON_PX) return { figure: 1, glyph: 0, dart: false, trueSize: true };
    return { figure: 0, glyph: 1, dart: false, trueSize: true };
  }
  if (isWeaponDomain(domain)) {
    const f = hasMesh ? fade(WEAPON_PX * FADE_FROM, WEAPON_PX, trueLen) : 0;
    return { figure: f, glyph: 1 - f, dart: false, trueSize: true };
  }
  if (domain === Domain.Marker) return { figure: hasMesh ? 1 : 0, glyph: 0, dart: false, trueSize: false };
  if (mode === 2) {
    const f = hasMesh ? fade(threshold * FADE_FROM, threshold, trueLen) : 0;
    return { figure: f, glyph: 1 - f, dart: false, trueSize: false };
  }
  const figure = hasMesh && trueLen >= dartPx;
  return { figure: figure ? 1 : 0, glyph: 0, dart: !figure && hasDart(domain), trueSize: false };
}

/** The symbol threshold, px: where the model would be grown to its smallest size, else the symbol's own size. */
export function symbolThreshold(minPixels: number, symbolPx: number): number {
  return minPixels > 0 ? minPixels : symbolPx;
}

/** A glyph's size on screen, px, by domain (a symbol's is the setting's). */
export function glyphPx(domain: number, symbolPx: number, mode: number): number {
  switch (domain) {
    case Domain.Missile:
      return mode === 2 ? symbolPx : 22;
    case Domain.Rocket:
      return 16;
    case Domain.Bomb:
      return 13;
    case Domain.Flare:
      return 12;
    case Domain.Chaff:
      return 10;
    case Domain.Misc:
      return 6;
    default:
      return symbolPx;
  }
}

/** A chaff cloud's diameter in metres, `age` seconds after it was let go: it blooms over the first seconds. */
export function chaffMetres(age: number): number {
  return 3 + 12 * Math.min(1, Math.max(0, age) / 3);
}

/** A decoy's alpha over its life: a flare flickers and fades, chaff fades as it spreads. */
export function decoyAlpha(domain: number, age: number, life: number, seed: number, t: number): number {
  const left = Math.max(0.15, 1 - Math.max(0, age) / Math.max(0.5, life));
  if (domain === Domain.Flare) return left * (0.8 + 0.2 * Math.sin(seed * 1.7 + t * 31));
  return 0.75 * left;
}
