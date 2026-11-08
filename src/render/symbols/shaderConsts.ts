/**
 * The far-off constants as shader literals, for the place shaders of both
 * backends and the glyph shaders: domains, the symbol classes they test,
 * the word's layout and the thresholds of `lod.ts`.
 */

import { Domain, fallbackWord, symbolIndex, WORD_BASE, WORD_MOVING } from '../../figures/symbolClass';
import { FADE_FROM, WEAPON_PX } from './lod';

const f = (x: number) => (Number.isInteger(x) ? `${x}.0` : `${x}`);

export const FALLBACK_AIR = fallbackWord(true);
export const FALLBACK_GROUND = fallbackWord(false);
export { WORD_BASE, WORD_MOVING };
export const D_UNKNOWN = Domain.Unknown;
export const D_AIR = Domain.Air;
export const D_HELI = Domain.Heli;
export const D_MISSILE = Domain.Missile;
export const D_BOMB = Domain.Bomb;
export const D_ROCKET = Domain.Rocket;
export const D_GROUND = Domain.Ground;
export const D_PERSON = Domain.Person;
export const D_SEA = Domain.Sea;
export const D_SUB = Domain.Sub;
export const D_STATIC = Domain.Static;
export const D_FLARE = Domain.Flare;
export const D_CHAFF = Domain.Chaff;
export const D_SHELL = Domain.Shell;
export const D_MARKER = Domain.Marker;
export const D_MISC = Domain.Misc;
export const C_AAM = symbolIndex('missile-aam');
export const C_SAM = symbolIndex('missile-sam');
export const C_AGM = symbolIndex('missile-agm');
export const C_SHIP = symbolIndex('missile-ship');
export const C_GUIDED_BOMB = symbolIndex('guided-bomb');
export const C_MISSILE = symbolIndex('missile');
export const WEAPON_PX_F = f(WEAPON_PX);
export const FADE_FROM_F = f(FADE_FROM);
