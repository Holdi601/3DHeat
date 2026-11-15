/**
 * Who held which ground over a campaign round played as a series
 * (`Dataset.series`): the places of `data/dcsCampaign.ts`, worked out from the
 * loaded rows - each session's ground units and statics at its start - as
 * capture zones with an owner timeline that changes at the session
 * boundaries, so the replay colours them by side and lists their captures as
 * any battle's objectives (`render/objectives.ts`).
 */

import { NOT_START_UNIT, START_S, START_UNIT, placesOf, type StartUnit } from '../data/dcsCampaign';
import type { Dataset } from '../state/types';
import { buildTimeline, fromWorld, type Objective, type ObjectiveRow, type ObjectiveTimeline } from './objectives';

/** Cells of the places in world metres (DCS: one unit a metre), as the chain's 0.02 degrees. */
const CELL_M = 2000;

export interface CampaignObjectives {
  match: string;
  objectives: Objective[];
  timeline: ObjectiveTimeline;
  /** Owner 1 is the Red coalition's team label, 2 the Blue one's. */
  ownerLabels: Record<number, string>;
}

const cache = new WeakMap<object, CampaignObjectives | null>();

/** The first row at or after `t` (rows in time order). */
function lowerBound(time: Float32Array, t: number): number {
  let lo = 0;
  let hi = time.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (time[mid] < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * The series' contested places as capture zones, owned 1 (Red) or 2 (Blue)
 * from each session's start; null for a dataset that is no series or does not
 * say what its units are and which side (Type, Color).
 */
export function campaignObjectives(d: Dataset): CampaignObjectives | null {
  if (cache.has(d)) return cache.get(d)!;
  const out = build(d);
  cache.set(d, out);
  return out;
}

function build(d: Dataset): CampaignObjectives | null {
  const s = d.series;
  const time = d.time;
  const type = d.attrs.find((a) => a.name === 'Type' && a.kind === 'category');
  const color = d.attrs.find((a) => a.name === 'Color' && a.kind === 'category');
  if (!s || s.sessions.length < 2 || !time || !d.timeSorted || !type?.categories || !color?.categories) return null;
  const isUnit = type.categories.map((c) => START_UNIT.test(c) && !NOT_START_UNIT.test(c));
  const side = color.categories.map((c) => (c === 'Red' || c === 'Blue' ? c : ''));
  const tData = type.data as Uint32Array;
  const cData = color.data as Uint32Array;
  // Each session's ground at its start: a unit's first row in the session's first minutes.
  const places: Map<string, 'Red' | 'Blue'>[] = [];
  const where = new Map<string, [number, number, number, number]>();
  for (const ss of s.sessions) {
    const units: StartUnit[] = [];
    const seen = new Set<number>();
    const end = Math.min(ss.end, ss.start + START_S);
    for (let i = lowerBound(time, ss.start); i < d.count && time[i] <= end; i++) {
      if (!isUnit[tData[i]] || !side[cData[i]]) continue;
      const p = d.personId ? d.personId[i] : i;
      if (seen.has(p)) continue;
      seen.add(p);
      // Ground plane: world x and z (y is up).
      units.push({ lat: d.px[i], lon: d.pz[i], color: side[cData[i]] });
      const k = `${Math.round(d.px[i] / CELL_M)},${Math.round(d.pz[i] / CELL_M)}`;
      const w = where.get(k) ?? [0, 0, 0, 0];
      w[0] += d.px[i];
      w[1] += d.py[i];
      w[2] += d.pz[i];
      w[3]++;
      where.set(k, w);
    }
    places.push(placesOf(units, CELL_M));
  }
  const both = new Map<string, Set<string>>();
  for (const p of places) for (const [k, v] of p) (both.get(k) ?? both.set(k, new Set()).get(k)!).add(v);
  const contested = [...both].filter(([, v]) => v.size > 1).map(([k]) => k);
  if (!contested.length) return null;
  const offset = d.epochMs === null ? (d.timeOrigin ?? 0) : 0;
  const owner = (v: string | undefined) => (v === 'Red' ? 1 : v === 'Blue' ? 2 : 0);
  const rows: ObjectiveRow[] = [];
  const objectives: Objective[] = contested.map((k, n) => {
    const w = where.get(k)!;
    places.forEach((p, i) => rows.push({ time: s.sessions[i].start + offset, event: '', zone: k, owner: owner(p.get(k)), progress: NaN }));
    return {
      type: 'capture_zone',
      layer: 'zones',
      team: null,
      name: `${n + 1}`,
      letter: k,
      shape: 'cylinder',
      position: fromWorld([w[0] / w[3], w[1] / w[3], w[2] / w[3]], d.axes),
      radius: CELL_M / 2 / ((d.axes?.scale as number | undefined) || 1),
      height: 200,
      size: null,
      heading: 0,
      points: [],
      used: null,
      ownerAtStart: owner(places[0].get(k)),
      site: '',
      active: [],
    };
  });
  // The coalitions' team labels as the rows name them (DCS: Red is Allies, Blue Enemies).
  const ownerLabels: Record<number, string> = {};
  if (d.teamId)
    for (let i = 0; i < d.count && Object.keys(ownerLabels).length < 2; i++) {
      const o = owner(side[cData[i]]);
      if (o && !ownerLabels[o]) ownerLabels[o] = d.teamLabels[d.teamId[i]] ?? '';
    }
  return { match: s.campaign, objectives, timeline: buildTimeline(s.campaign, rows), ownerLabels };
}
