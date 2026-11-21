/**
 * The outcome analysis (docs/outcome-analysis.md): which positions, routes
 * and decisions go with winning, over many matches of one map.
 *
 * Each match's summary carries a compact record of where each side was and
 * when - `MovesSection`, kept in the summary's grid (`SummaryGrid.mv`) so it
 * travels with the grid and is read a map at a time, never held for every
 * match at once. Everything here is plain JSON and small integers.
 */

/** The section's own version: a reader works a summary out again when its section is older. */
export const MOVES_VERSION = 1;

/** Seconds between the samples the collector keeps before it settles on a step. */
export const BASE_STEP = 2;
/** Steps a round is cut into at most (its median length over this, rounded to a nice step). */
export const STEPS_PER_ROUND = 40;
/** The nice steps, seconds. */
export const NICE_STEPS = [2, 3, 5, 10, 15, 20, 30, 60] as const;
/** Lives kept a match at most (the ones with most samples). */
export const MAX_LIVES = 600;
/** Points a life keeps at most (the first ones: what a life did first is what the routes need). */
export const MAX_POINTS = 240;
/** Deaths kept a match at most. */
export const MAX_DEATHS = 4000;
/** Rounds kept a match at most. */
export const MAX_MOVE_ROUNDS = 64;
/** Coordinate quanta a fine grid cell (a coordinate step is `grid.cell / Q_PER_CELL`). */
export const Q_PER_CELL = 8;

/**
 * Where each side was, when (one match):
 *
 * - `r`  per round, flat by 4: `[round number, first step (absolute: floor(t / dt)), steps it lasted, winner slot (-1 unknown)]`.
 * - `l`  lives, flat, one after the other: `[round index, team slot, class (VEHICLE_CLASSES, -1), player (index into
 *        players, -1 AI or unknown), first step (from the round's first step), n, x0, z0, x1, z1, ...]` - a point every
 *        `dt` seconds while it moved, coordinates in steps of `q` world units.
 * - `d`  deaths, flat by 5: `[round index, tenths of a second into the round, x, z (in q), slot of the side that lost it]`.
 * - `oz`, `o` objectives where the match records them (War Thunder's capture zones): the zones, and their captures
 *        flat by 4: `[round index, tenths of a second into the round, zone, slot that took it (-1 neutralised)]`.
 * - `pn`, `p` named places (callouts) where the data has them: names, and the place most often under each coarse cell
 *        (`pc` world units), flat by 4: `[ix, iz, name, samples]`.
 */
export interface MovesSection {
  v: number;
  dt: number;
  q: number;
  r: number[];
  l: number[];
  players: string[];
  d: number[];
  oz?: { name: string; x: number; z: number }[];
  o?: number[];
  pc?: number;
  pn?: string[];
  p?: number[];
}

/** A section as the analysis reads it: its long lists may be typed arrays (the worker keeps them so). */
export type MovesData = Omit<MovesSection, 'r' | 'l' | 'd' | 'o' | 'p'> & { r: ArrayLike<number>; l: ArrayLike<number>; d: ArrayLike<number>; o?: ArrayLike<number>; p?: ArrayLike<number> };

/** The section with its long lists as typed arrays: a third of the memory of the parsed JSON. */
export function compactMoves(mv: MovesSection): MovesData {
  return { ...mv, r: Int32Array.from(mv.r), l: Int32Array.from(mv.l), d: Int32Array.from(mv.d), ...(mv.o ? { o: Int32Array.from(mv.o) } : {}), ...(mv.p ? { p: Int32Array.from(mv.p) } : {}) };
}

/** Numbers a round takes in `MovesSection.r`, a death in `d`, an objective event in `o`. */
export const R_STRIDE = 4;
export const D_STRIDE = 5;
export const O_STRIDE = 4;
/** Header numbers of a life in `l` before its points. */
export const L_HEAD = 6;

/** A life of a `MovesSection`, read back (`livesOf`). */
export interface MoveLife {
  round: number;
  slot: number;
  cls: number;
  player: number;
  start: number;
  /** Offset of its first coordinate in `l`, and how many points. */
  at: number;
  n: number;
}

/** The lives of a section, in order. */
export function livesOf(mv: Pick<MovesData, 'l'>): MoveLife[] {
  const out: MoveLife[] = [];
  const l = mv.l;
  for (let i = 0; i + L_HEAD <= l.length; ) {
    const n = l[i + 5];
    out.push({ round: l[i], slot: l[i + 1], cls: l[i + 2], player: l[i + 3], start: l[i + 4], at: i + L_HEAD, n });
    i += L_HEAD + n * 2;
  }
  return out;
}
