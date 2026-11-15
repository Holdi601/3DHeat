/**
 * The Close quarters tab of the mass analysis: each match's close-quarters
 * counts (the summary's `cqb`, `insights/cqb/finish.ts` CqbCounts) added up
 * over the matches the filter keeps - over all maps, or per map - as shares
 * with Wilson intervals, and the matches each row came from, for the
 * drill-down. Summaries written before the counts existed have none.
 */

import { wilson } from '../insights/stats';
import type { CqbCounts } from '../insights/cqb/finish';
import type { MassStore } from './store';

/** Matches a row keeps for its drill-down. */
const MAX_IDS = 500;
/** Places a map lists at most (the most entered). */
const MAX_PLACES = 12;

/** What a row measures (`mass.cqb.<measure>`); `side` and `state` say which side or state it is about. */
export type CqbMeasure = 'opening' | 'convert' | 'traded' | 'peeker' | 'crossfire' | 'noCrossfire' | 'flashEntry' | 'dryEntry' | 'betterAim' | 'planter' | 'man' | 'funnel';

export interface MassCqbRow {
  measure: CqbMeasure;
  /** `*`: all maps. */
  map: string;
  side: string;
  /** A state like `5v4`, or a place. */
  state: string;
  k: number;
  n: number;
  share: number | null;
  lo: number | null;
  hi: number | null;
  matchIds: number[];
}

interface Acc {
  k: number;
  n: number;
  ids: number[];
}

export function cqbRows(s: MassStore, mask: Uint8Array): { rows: MassCqbRow[]; matches: number; withCounts: number } {
  const acc = new Map<string, Acc>();
  let matches = 0;
  let withCounts = 0;
  const add = (key: string, k: number, n: number, i: number) => {
    if (!(n > 0)) return;
    let a = acc.get(key);
    if (!a) acc.set(key, (a = { k: 0, n: 0, ids: [] }));
    a.k += k;
    a.n += n;
    if (a.ids.length < MAX_IDS) a.ids.push(i);
  };
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    matches++;
    const c: CqbCounts | null = s.cqb[i] ?? null;
    if (!c) continue;
    withCounts++;
    const map = s.str(s.m.map.get(i)) || '';
    for (const m of ['*', map]) {
      const K = (measure: CqbMeasure, side: string, state: string) => `${measure}\u0001${m}\u0001${side}\u0001${state}`;
      const [a, b] = c.teams;
      add(K('opening', a, ''), c.opening[0], c.opening[1], i);
      add(K('opening', b, ''), c.opening[1] - c.opening[0], c.opening[1], i);
      add(K('convert', '', ''), c.opening[2], c.opening[3], i);
      add(K('traded', '', ''), c.trades[0], c.trades[1], i);
      add(K('peeker', '', ''), c.peek[0], c.peek[1], i);
      add(K('crossfire', '', ''), c.cross[0], c.cross[1], i);
      add(K('noCrossfire', '', ''), c.cross[2], c.cross[3], i);
      add(K('flashEntry', '', ''), c.flash[0], c.flash[1], i);
      add(K('dryEntry', '', ''), c.flash[2], c.flash[3], i);
      add(K('betterAim', '', ''), c.aim[0], c.aim[1], i);
      add(K('planter', '', ''), c.plant[0], c.plant[1], i);
      for (const [st, [k, n]] of Object.entries(c.man)) add(K('man', '', st), k, n, i);
      // Places are a map's own: per map only.
      if (m !== '*') for (const [pl, [n, k]] of Object.entries(c.funnel)) add(K('funnel', '', pl), k, n, i);
    }
  }
  const rows: MassCqbRow[] = [];
  for (const [key, a] of acc) {
    const [measure, map, side, state] = key.split('\u0001') as [CqbMeasure, string, string, string];
    const [lo, hi] = wilson(a.k, a.n);
    rows.push({ measure, map, side, state, k: a.k, n: a.n, share: a.n ? a.k / a.n : null, lo, hi, matchIds: a.ids });
  }
  const order: CqbMeasure[] = ['opening', 'convert', 'traded', 'peeker', 'crossfire', 'noCrossfire', 'flashEntry', 'dryEntry', 'betterAim', 'planter', 'man', 'funnel'];
  const manKey = (st: string) => {
    const [o, e] = st.split('v').map(Number);
    return -(o + e) * 10 - o;
  };
  rows.sort((x, y) => (x.map === y.map ? 0 : x.map === '*' ? -1 : y.map === '*' ? 1 : x.map < y.map ? -1 : 1) || order.indexOf(x.measure) - order.indexOf(y.measure) || (x.measure === 'man' ? manKey(x.state) - manKey(y.state) : x.measure === 'funnel' ? y.n - x.n : x.side < y.side ? -1 : 1));
  // A map's places: only its most entered.
  const seen = new Map<string, number>();
  const kept = rows.filter((r) => {
    if (r.measure !== 'funnel') return r.measure !== 'man' || r.n >= 5;
    const c = (seen.get(r.map) ?? 0) + 1;
    seen.set(r.map, c);
    return c <= MAX_PLACES;
  });
  return { rows: kept, matches, withCounts };
}
