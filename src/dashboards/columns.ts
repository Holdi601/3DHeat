/**
 * The columns the dashboard workers keep, by key: where each comes from in a
 * dataset (`datasetColumn`), what the queries read (`queryColumns`), and the
 * columns worked out in the worker - time into the match, and the
 * dashboard's calculated columns (`computeColumn`).
 */

import { PERSON_FILTER_COLUMN } from '../render/filterTables';
import type { Dataset } from '../state/types';
import { K, compileRow } from '../versus/engine';
import { columnsOf, type RNode } from '../versus/expr';
import { attrKey } from '../versus/run';
import type { ColArr, QuerySpec, Store } from './query';

/** A column of the dataset by its key; null where the data has none (or it is worked out in the worker). */
export function datasetColumn(ds: Dataset, key: string): ColArr | null {
  switch (key) {
    case K.x:
      return ds.px;
    case K.y:
      return ds.py;
    case K.z:
      return ds.pz;
    case K.time:
      return ds.time;
    case K.life:
      return ds.lifetime;
    case K.team:
      return ds.teamId;
    case K.person:
      return ds.personId;
    case K.session:
      return ds.sessionId;
  }
  if (key.startsWith('a:')) return (ds.attrs.find((a) => attrKey(a.name) === key)?.data as ColArr | undefined) ?? null;
  return null;
}

/** Columns worked out in the worker from others, and what they need. */
export function derivedNeeds(key: string, calc: ReadonlyMap<string, RNode>): string[] | null {
  if (key === K.matchTime) return [K.time, K.session];
  const n = calc.get(key);
  return n ? [...columnsOf(n)] : null;
}

/** Every column key a set of queries reads: dims, accumulators, their predicates, the clauses. */
export function queryColumns(qs: readonly QuerySpec[]): Set<string> {
  const out = new Set<string>();
  const rn = (n: RNode | null | undefined) => n && columnsOf(n, out);
  for (const q of qs) {
    for (const d of q.dims) out.add(d.key);
    for (const a of q.accs) {
      if (a.k !== 'count') out.add(a.key);
      rn(a.where);
    }
    for (const c of q.clauses) {
      switch (c.k) {
        case 'in':
        case 'range':
          out.add(c.key);
          break;
        case 'expr':
          rn(c.node);
          break;
        case 'volume':
          out.add(K.x).add(K.y).add(K.z);
          break;
        case 'tuples':
          for (const d of c.dims) out.add(d.key);
          break;
        case 'view': {
          const sc = c.scope;
          out.add(K.time);
          if (sc.lifetimeNow !== null) out.add(K.life);
          if (sc.session >= 0) out.add(K.session);
          if (sc.groupShown) out.add(K.team);
          for (const f of sc.filters) out.add(f.column === PERSON_FILTER_COLUMN ? K.person : attrKey(f.column));
          break;
        }
      }
    }
  }
  return out;
}

/** A column worked out over the store's rows: time into each match, or a calculated column. Also its range. */
export function computeColumn(s: Store, key: string, node: RNode | null, sessionStart: readonly number[] | null, timeLo: number): { data: Float32Array; lo: number; hi: number } {
  const n = s.n;
  const out = new Float32Array(n);
  let lo = Infinity;
  let hi = -Infinity;
  if (key === K.matchTime) {
    const t = s.cols[K.time];
    const ses = s.cols[K.session];
    if (t)
      for (let i = 0; i < n; i++) {
        const st = ses && sessionStart ? (sessionStart[ses[i]] ?? timeLo) : timeLo;
        out[i] = t[i] - st;
      }
    else out.fill(NaN);
  } else if (node) {
    const f = compileRow(node, s.cols);
    for (let i = 0; i < n; i++) out[i] = f(i);
  } else out.fill(NaN);
  for (let i = 0; i < n; i++) {
    const v = out[i];
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return { data: out, lo, hi };
}

/** A whole dataset as one store (tests, and small data on the main thread's side of a test). */
export function storeOf(ds: Dataset, keys: Iterable<string>, calc: ReadonlyMap<string, RNode> = new Map()): Store {
  const s: Store = { n: ds.count, weight: 1, cols: {}, sorted: ds.timeSorted, maxLife: Infinity };
  const later: string[] = [];
  const want = new Set(keys);
  for (const k of [...want]) for (const d of derivedNeeds(k, calc) ?? []) want.add(d);
  for (const k of want) {
    const c = datasetColumn(ds, k);
    if (c) s.cols[k] = c;
    else later.push(k);
  }
  if (s.cols[K.life]) {
    let m = 0;
    const l = s.cols[K.life];
    for (let i = 0; i < l.length; i++) if (l[i] > m) m = l[i];
    s.maxLife = m;
  }
  for (const k of later) {
    if (k !== K.matchTime && !calc.has(k)) continue;
    s.cols[k] = computeColumn(s, k, calc.get(k) ?? null, ds.sessionStart ? Array.from(ds.sessionStart) : null, ds.timeRange[0]).data;
  }
  return s;
}
