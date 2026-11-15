/**
 * The viewer's chunk as the walk reads it (`walk.ts` CqbRows): kinds from the
 * raw event column where it names grenades and plants, else from the
 * canonical one; the other party as a person; buys as 0..1; the view's
 * filters applied. Runs in the worker.
 */

import type { CompareChunk, CompareScope } from '../../volumes/compare';
import { rowShown } from '../../volumes/compare';
import { K_POS, type CqbRows } from './walk';

export interface CqbMeta {
  scope: CompareScope;
  /** Canonical event category -> walk kind (-1 unknown). */
  kindOf: Int8Array;
  /** Raw event category -> walk kind, -1 where the canonical kind decides. */
  rawOf: Int8Array | null;
  /** Other-party category -> person index (-1 none). */
  otherOf: Int32Array | null;
  /** Buy category -> 0..1 (NaN unknown). */
  buyOf: Float32Array | null;
  upm: number;
}

export type CqbChunk = CompareChunk & {
  /** The dataset row of row 0. */
  row0: number;
  yaw: Float32Array | null;
  raw: Uint32Array | null;
  other: Uint32Array | null;
  place: Uint32Array | null;
  weapon: Uint32Array | null;
  won: Float32Array | null;
  flashed: Float32Array | null;
  buy: Uint32Array | null;
};

export function feedRows(meta: CqbMeta, c: CqbChunk): CqbRows {
  const n = c.n;
  const kind = new Int8Array(n);
  const shown = new Uint8Array(n);
  const person = new Int32Array(n);
  const team = new Int32Array(n);
  const session = new Int32Array(n);
  const other = c.other && meta.otherOf ? new Int32Array(n) : null;
  const buy = c.buy && meta.buyOf ? new Float32Array(n) : null;
  for (let i = 0; i < n; i++) {
    shown[i] = rowShown(meta.scope, c, i) ? 1 : 0;
    let k = c.event ? meta.kindOf[c.event[i]] ?? -1 : K_POS;
    if (c.raw && meta.rawOf) {
      const r = meta.rawOf[c.raw[i]] ?? -1;
      if (r >= 0) k = r;
    }
    kind[i] = k < 0 ? 10 : k;
    person[i] = c.person ? c.person[i] : -1;
    team[i] = c.team ? c.team[i] : -1;
    session[i] = c.session ? c.session[i] : 0;
    if (other) other[i] = meta.otherOf![c.other![i]] ?? -1;
    if (buy) buy[i] = meta.buyOf![c.buy![i]] ?? NaN;
  }
  const toInt = (a: Uint32Array | null) => (a ? Int32Array.from(a) : null);
  return {
    n,
    t: c.time ?? new Float32Array(n).fill(NaN),
    x: c.px,
    y: c.py,
    z: c.pz,
    yaw: c.yaw,
    person,
    team,
    session,
    kind,
    other,
    place: toInt(c.place),
    weapon: toInt(c.weapon),
    won: c.won,
    flashed: c.flashed,
    buy,
    shown,
    row0: c.row0,
  };
}
