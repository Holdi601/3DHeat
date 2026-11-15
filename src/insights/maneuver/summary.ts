/**
 * Maneuvers over many matches: each match's summary (`mass/summarize.ts`)
 * carries a small `maneuvers` section - per kind and side, how many were
 * made at medium confidence or more, how many paid off and how many did not,
 * and the kills and losses in them - and the mass panel adds those up per
 * map, mode and side: how often each maneuver is made and how often it pays.
 */

import type { ManeuverMatch } from './types';

export interface ManeuverSection {
  v: 1;
  /** Rows `[kind, team slot, made, paid, not paid, kills, losses]`. */
  k: [string, number, number, number, number, number, number][];
}

export function maneuverSection(m: ManeuverMatch | null): ManeuverSection {
  const rows = new Map<string, [string, number, number, number, number, number, number]>();
  for (const x of m?.maneuvers ?? []) {
    if (x.level === 'low' || x.team < 0) continue;
    const key = `${x.kind}:${x.team}`;
    let r = rows.get(key);
    if (!r) rows.set(key, (r = [x.kind, x.team, 0, 0, 0, 0, 0]));
    r[2]++;
    if (x.outcome.paid === 1) r[3]++;
    else if (x.outcome.paid === 0) r[4]++;
    r[5] += x.outcome.kills;
    r[6] += x.outcome.losses;
  }
  return { v: 1, k: [...rows.values()].sort((a, b) => a[0].localeCompare(b[0]) || a[1] - b[1]) };
}

export interface ManeuverRow {
  kind: string;
  map: string;
  mode: string;
  side: string;
  /** Times made, matches it was made in, matches with a section that could have had it. */
  n: number;
  matches: number;
  of: number;
  /** Paid off, judged (paid or not), the rate and its Wilson ~95% interval. */
  paid: number;
  judged: number;
  rate: number | null;
  lo: number | null;
  hi: number | null;
  kills: number;
  losses: number;
  /** Indices (into the list given) of the matches it was made in. */
  ids: number[];
}

export function wilson(k: number, n: number): [number, number] | null {
  if (!n) return null;
  const z = 1.96;
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

/** The matches' sections added up by kind, map, mode and side; `*` rows over every map and mode. */
export function maneuverTable(list: { map: string | null; mode: string | null; teams: string[]; sec: ManeuverSection | null | undefined }[]): ManeuverRow[] {
  const rows = new Map<string, ManeuverRow & { seen: Set<number> }>();
  const of = new Map<string, number>();
  list.forEach((m, i) => {
    if (!m.sec) return;
    const map = m.map ?? '';
    const mode = m.mode ?? '';
    for (const scope of [`${map}\u0001${mode}`, '*\u0001*']) of.set(scope, (of.get(scope) ?? 0) + 1);
    for (const [kind, team, n, paid, not, kills, losses] of m.sec.k) {
      const side = m.teams[team] ?? `#${team}`;
      for (const [mp, md] of [
        [map, mode],
        ['*', '*'],
      ]) {
        const key = `${kind}\u0001${mp}\u0001${md}\u0001${side}`;
        let r = rows.get(key);
        if (!r) rows.set(key, (r = { kind, map: mp, mode: md, side, n: 0, matches: 0, of: 0, paid: 0, judged: 0, rate: null, lo: null, hi: null, kills: 0, losses: 0, ids: [], seen: new Set() }));
        r.n += n;
        r.paid += paid;
        r.judged += paid + not;
        r.kills += kills;
        r.losses += losses;
        if (!r.seen.has(i)) {
          r.seen.add(i);
          r.matches++;
          r.ids.push(i);
        }
      }
    }
  });
  return [...rows.values()]
    .map(({ seen: _seen, ...r }) => {
      const w = wilson(r.paid, r.judged);
      return { ...r, of: of.get(`${r.map}\u0001${r.mode}`) ?? 0, rate: r.judged ? r.paid / r.judged : null, lo: w ? w[0] : null, hi: w ? w[1] : null };
    })
    .sort((a, b) => b.n - a.n);
}
