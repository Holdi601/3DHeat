/**
 * What the chart aggregation (`aggregate.ts`) is told about a dataset, from
 * the main thread: its meta (labels, columns, outcome and event columns, the
 * matches' starts), the columns a spec reads, and the view's scope with the
 * minutes it spans. Shared by the volume signs and the whole-data runner
 * (`run.ts`).
 */

import type { AggMeta, AggScope } from './aggregate';
import type { ChartSpec } from './types';
import { CANON, EVENT_KINDS, eventKindOf } from '../data/canonical';
import { outcomeColumns } from '../data/outcome';
import type { Dataset } from '../state/types';
import type { Scope } from '../volumes/stats';

/** The columns a spec reads. */
export function specColumns(spec: ChartSpec, meta: Pick<AggMeta, 'won' | 'event'>): string[] {
  const out = new Set<string>();
  const col = (k: string | undefined) => {
    if (k && k.startsWith('col:')) out.add(k.slice(4));
  };
  col(spec.group);
  col(spec.stack);
  if (spec.x) out.add(spec.x);
  if (spec.y) out.add(spec.y);
  if (spec.measure.column) out.add(spec.measure.column);
  if (spec.filter?.column) out.add(spec.filter.column);
  const m = spec.measure.kind;
  if (meta.won && (spec.diff === 'outcome' || m === 'winShare' || spec.kind === 'tiles' || spec.filter?.outcome)) out.add(meta.won);
  if (meta.event && (m === 'kd' || spec.kind === 'tiles')) out.add(meta.event);
  return [...out];
}

/** What the aggregation knows of a dataset. */
export function metaOf(ds: Dataset): AggMeta {
  const won = outcomeColumns(ds).round;
  const ev = ds.attrs.find((a) => a.name === CANON.event && a.kind === 'category');
  const kinds = ev?.categories?.map((c) => (EVENT_KINDS as readonly string[]).includes(c) ? c : eventKindOf(c)) ?? [];
  let span = 0;
  if (ds.sessionStart && ds.sessionEnd) for (let s = 0; s < ds.sessionStart.length; s++) span = Math.max(span, ds.sessionEnd[s] - ds.sessionStart[s]);
  return {
    teams: ds.teamId ? ds.teamLabels.slice() : [],
    persons: ds.personId ? ds.personLabels.slice() : [],
    sessions: ds.sessionId ? ds.sessionLabels.slice() : [],
    sessionStart: ds.sessionId && ds.sessionStart ? Array.from(ds.sessionStart) : null,
    timeRange: [ds.timeRange[0], ds.timeRange[1]],
    matchSpan: span > 0 ? span : Math.max(1, ds.timeRange[1] - ds.timeRange[0]),
    columns: ds.attrs.map((a) => ({ name: a.name, kind: a.kind === 'category' ? 'category' : 'number', labels: a.categories?.slice(), min: a.min, max: a.max })),
    won: won ? won.name : null,
    event: ev ? ev.name : null,
    kill: kinds.flatMap((k, i) => (k === 'kill' ? [i] : [])),
    death: kinds.flatMap((k, i) => (k === 'death' || k === 'destroyed' ? [i] : [])),
  };
}

/** Minutes of data time a window shows: summed over the matches it overlaps, else its span within the data. */
export function windowMinutes(ds: Dataset, lo: number, hi: number, session: number): number {
  const a = Math.max(lo, ds.timeRange[0]);
  const b = Math.min(hi, ds.timeRange[1]);
  if (ds.sessionStart && ds.sessionEnd && ds.sessionStart.length > 0) {
    let s = 0;
    for (let k = 0; k < ds.sessionStart.length; k++) {
      if (session >= 0 && k !== session) continue;
      s += Math.max(0, Math.min(b, ds.sessionEnd[k]) - Math.max(a, ds.sessionStart[k]));
    }
    return s / 60;
  }
  return Math.max(0, b - a) / 60;
}

/** The scope as the aggregation takes it, and the same up to the playhead (`upToNow` signs). */
export function aggScopes(ds: Dataset, sc: Scope, playhead: number | null): { scope: AggScope; upTo: AggScope } {
  const key = [sc.defaultLifetime, sc.lifetimeNow !== null ? 'L' : 'W', sc.filters.map((f) => f.key).join(';'), sc.groupShown ? Array.from(sc.groupShown).join('') : '', sc.session].join('|');
  const lo = sc.lifetimeNow !== null ? sc.lifetimeNow - sc.defaultLifetime : sc.timeLo;
  const hi = sc.lifetimeNow !== null ? sc.lifetimeNow : sc.timeHi;
  const scope: AggScope = { ...sc, minutes: windowMinutes(ds, lo, hi, sc.session), key };
  if (playhead === null || hi === Infinity) return { scope, upTo: scope };
  const upTo: AggScope = { ...scope, timeLo: -Infinity, timeHi: playhead, lifetimeNow: null, minutes: windowMinutes(ds, -Infinity, playhead, sc.session), key: key.replace('|L|', '|W|') };
  return { scope, upTo };
}
