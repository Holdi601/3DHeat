/**
 * Sides for the symbols: the team chosen as "my side" is friend, every other
 * hostile (or neutral, if asked), a unit without a team unknown. With more
 * than two teams each hostile team keeps a colour of its own within its
 * affiliation's hue, so three sides still read apart.
 *
 * The table the glyph shaders read: 16 entries (index = team + 1, 0 for no
 * team), each the style's fill colour and the affiliation.
 */

import { WORD_TEAMS } from '../../figures/symbolClass';

export type Affiliation = 0 | 1 | 2 | 3;
export const UNKNOWN: Affiliation = 0;
export const FRIEND: Affiliation = 1;
export const HOSTILE: Affiliation = 2;
export const NEUTRAL: Affiliation = 3;

export type SymbolStyle = 'nato' | 'russian' | 'map' | 'mono';
export const SYMBOL_STYLES: SymbolStyle[] = ['nato', 'russian', 'map', 'mono'];
export const SYMBOL_STYLE_ID: Record<SymbolStyle, number> = { nato: 0, russian: 1, map: 2, mono: 3 };

export interface Sides {
  /** The team that is friend (-1: the first). */
  mySide: number;
  /** How many teams the data has. */
  teams: number;
  /** What the teams that are not mine are. */
  others: 'hostile' | 'neutral';
  /** The teams' names: a team called neutral is neutral, one without a name unknown, and they pick my side when it is not set. */
  labels?: string[];
}

const NEUTRAL_NAME = /neutral|civil|spectat/i;
const FRIEND_NAME = /\b(allies|allied|blue|bluefor|blufor|friends?|friendly|own|nato|coalition|defenders?)\b/i;

/** My side when none is chosen: a team named like a friendly side, else the first that is not neutral, else the first. */
export function autoSide(labels: string[]): number {
  const named = labels.findIndex((l) => FRIEND_NAME.test(l));
  if (named >= 0) return named;
  const side = labels.findIndex((l) => l.trim() !== '' && !NEUTRAL_NAME.test(l));
  return side >= 0 ? side : 0;
}

export function affiliationOf(team: number | null, s: Sides): Affiliation {
  if (team === null || team < 0 || team >= s.teams) return UNKNOWN;
  const mine = s.mySide >= 0 && s.mySide < s.teams ? s.mySide : autoSide(s.labels ?? []);
  if (team === mine) return FRIEND;
  const label = s.labels?.[team];
  if (label !== undefined && label.trim() === '') return UNKNOWN;
  if (label !== undefined && NEUTRAL_NAME.test(label)) return NEUTRAL;
  return s.others === 'neutral' ? NEUTRAL : HOSTILE;
}

type Rgb = [number, number, number];
const hex = (h: number): Rgb => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];

/** APP-6's light fills: friend crystal blue, hostile salmon red, neutral bamboo green, unknown light yellow. */
const NATO: Record<Affiliation, Rgb> = { 0: hex(0xffff80), 1: hex(0x80e0ff), 2: hex(0xff8080), 3: hex(0xaaffaa) };
/** Further hostile teams in the hostile hue's neighbours. */
const NATO_HOSTILE = [0xff8080, 0xff80c8, 0xffa860, 0xd890ff, 0xff6060, 0xffc0a0].map(hex);
/** The Soviet and Russian convention: own red, the enemy blue, others green and black. */
const RU: Record<Affiliation, Rgb> = { 0: hex(0x303030), 1: hex(0xd81e1e), 2: hex(0x1e50d8), 3: hex(0x1e9640) };
const RU_HOSTILE = [0x1e50d8, 0x7a2ed8, 0x0f8fa8, 0x283c78, 0x5a64ff, 0x0a6496].map(hex);
/** Shape-only: one paper for all, the ink black; the frames and fill patterns tell sides apart. */
const MONO: Rgb = [0.96, 0.96, 0.94];

/** The fill (NATO) or line (Russian) colour of a team's symbols; the map style uses the team's own colour. */
export function sideColour(style: SymbolStyle, aff: Affiliation, hostileRank: number): Rgb {
  if (style === 'mono') return MONO;
  if (style === 'russian') return aff === HOSTILE ? RU_HOSTILE[hostileRank % RU_HOSTILE.length] : RU[aff];
  return aff === HOSTILE ? NATO_HOSTILE[hostileRank % NATO_HOSTILE.length] : NATO[aff];
}

/** The shaders' table: 16 x (r, g, b, affiliation), entry 0 for no team. */
export function sideTable(style: SymbolStyle, s: Sides, out = new Float32Array(64)): Float32Array {
  let rank = 0;
  for (let i = 0; i <= WORD_TEAMS; i++) {
    const team = i - 1;
    const aff = affiliationOf(i === 0 ? null : team, s);
    const c = sideColour(style, aff, aff === HOSTILE ? rank++ : 0);
    out.set([c[0], c[1], c[2], aff], i * 4);
  }
  return out;
}
