/**
 * The figure overlay: several matches or rounds played over each other, each
 * from its own start, on one timeline - how a team opens a site round after
 * round, how a squadron flies its first minutes match after match.
 *
 * Built as a dataset of its own from the loaded one: each picked group
 * (a session - a CS2 round, a War Thunder match, a Tacview recording - or a
 * value of the match column) has its rows moved in time so it starts at zero
 * (CS2: when the freeze time ends, where the table says), and each person in
 * each group becomes a thing of its own ("Name · round 7"), so the same
 * player in two rounds is two figures at once. Coloured by team, or by group.
 */

import { DatasetBuilder, type BlockAttr, type SourceBlock } from '../data/builder';
import { say } from '../data/msg';
import type { Dataset } from '../state/types';
import { matchColumn } from './matches';

export type OverlayColour = 'team' | 'group';

export interface OverlayGroup {
  index: number;
  id: string;
  /** Where its time 0 is, in the dataset's seconds. */
  start: number;
  rows: number;
}

export interface OverlayGroups {
  /** Sessions, or the values of a match column. */
  via: 'session' | 'column';
  column?: string;
  groups: OverlayGroup[];
}

const groupCache = new WeakMap<Dataset, OverlayGroups | null>();

/** Rows before play starts (CS2's freeze time, a warm-up), when the table has a phase column. */
const NOT_STARTED = /^(freeze|freezetime|freeze_time|warmup|warm_up|pregame|pre_game|prematch|countdown)$/i;

/** The groups the data can be overlaid by, and where each starts; null when it has only one. */
export function overlayGroups(d: Dataset): OverlayGroups | null {
  if (groupCache.has(d)) return groupCache.get(d)!;
  let out: OverlayGroups | null = null;
  const column = d.sessionId && d.sessionLabels.length > 1 ? null : matchColumn(d);
  const ids = d.sessionId && d.sessionLabels.length > 1 ? d.sessionId : column ? (d.attrs.find((a) => a.name === column)!.data as Uint32Array) : null;
  const labels = d.sessionId && d.sessionLabels.length > 1 ? d.sessionLabels : column ? d.attrs.find((a) => a.name === column)!.categories! : null;
  if (ids && labels && d.time) {
    const phase = d.attrs.find((a) => /^phase$/i.test(a.name) && a.kind === 'category');
    const waiting = phase?.categories?.map((c) => NOT_STARTED.test(c.trim())) ?? null;
    const n = labels.length;
    const first = new Float64Array(n).fill(Infinity);
    const live = new Float64Array(n).fill(Infinity);
    const rows = new Uint32Array(n);
    for (let i = 0; i < d.count; i++) {
      const g = ids[i];
      rows[g]++;
      const t = d.time[i];
      if (t < first[g]) first[g] = t;
      if (t < live[g] && !(waiting && waiting[(phase!.data as Uint32Array)[i]])) live[g] = t;
    }
    const groups = labels
      .map((id, index) => ({ index, id, start: Number.isFinite(live[index]) ? live[index] : first[index], rows: rows[index] }))
      .filter((g) => g.rows > 0 && g.id !== '');
    if (groups.length > 1) out = { via: column ? 'column' : 'session', column: column ?? undefined, groups };
  }
  groupCache.set(d, out);
  return out;
}

export interface OverlayOptions {
  /** Group indices to overlay; null for all. */
  groups: number[] | null;
  colour: OverlayColour;
  /** Only the groups one player takes part in: their tracks (person ids). */
  only: number[] | null;
}

/** The groups the persons `who` take part in. */
export function groupsWith(d: Dataset, g: OverlayGroups, who: number[]): Set<number> {
  const ids = g.via === 'session' ? d.sessionId! : (d.attrs.find((a) => a.name === g.column)!.data as Uint32Array);
  const persons = new Set(who);
  const out = new Set<number>();
  if (d.personId) for (let i = 0; i < d.count; i++) if (persons.has(d.personId[i])) out.add(ids[i]);
  return out;
}

const overlays = new WeakSet<Dataset>();

/** Whether a dataset is a figure overlay built here. */
export function isOverlay(d: Dataset | null): boolean {
  return !!d && overlays.has(d);
}

/** The overlay of `d` by `opts`; null when the data has nothing to overlay or nothing is picked. */
export function buildOverlay(d: Dataset, opts: OverlayOptions): Dataset | null {
  const g = overlayGroups(d);
  if (!g || !d.time) return null;
  let picked = new Set(opts.groups ?? g.groups.map((x) => x.index));
  if (opts.only) {
    const mine = groupsWith(d, g, opts.only);
    picked = new Set([...picked].filter((x) => mine.has(x)));
  }
  if (!picked.size) return null;
  const ids = g.via === 'session' ? d.sessionId! : (d.attrs.find((a) => a.name === g.column)!.data as Uint32Array);
  const labelOf = new Map(g.groups.map((x) => [x.index, x.id]));
  const startOf = new Map(g.groups.map((x) => [x.index, x.start]));
  const rows: number[] = [];
  for (let i = 0; i < d.count; i++) if (picked.has(ids[i])) rows.push(i);
  const n = rows.length;
  const take32 = (a: Float32Array) => {
    const out = new Float32Array(n);
    for (let k = 0; k < n; k++) out[k] = a[rows[k]];
    return out;
  };
  // A thing per person per group.
  const pairIds = new Uint32Array(n);
  const pairLabels: string[] = [];
  const pairOf = new Map<number, number>();
  const groupCount = Math.max(...g.groups.map((x) => x.index)) + 1;
  const teamIds = new Uint32Array(n);
  const teamLabels: string[] = [];
  const teamOf = new Map<string, number>();
  const time = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    const r = rows[k];
    const grp = ids[r];
    const p = d.personId ? d.personId[r] : 0;
    const key = p * groupCount + grp;
    let id = pairOf.get(key);
    if (id === undefined) {
      id = pairLabels.length;
      pairOf.set(key, id);
      pairLabels.push(`${d.personLabels[p] ?? p} · ${labelOf.get(grp)}`);
    }
    pairIds[k] = id;
    const team = opts.colour === 'group' ? labelOf.get(grp)! : d.teamId ? (d.teamLabels[d.teamId[r]] ?? '') : '';
    let ti = teamOf.get(team);
    if (ti === undefined) {
      ti = teamLabels.length;
      teamOf.set(team, ti);
      teamLabels.push(team);
    }
    teamIds[k] = ti;
    time[k] = d.time[r] - startOf.get(grp)!;
  }
  // The group each row came from, kept as a column: filterable, and what the colour by group reads.
  const groupAttr: BlockAttr = { name: g.via === 'session' ? 'session' : g.column!, kind: 'category', data: new Uint32Array(n), categories: [] };
  const gIndex = new Map<number, number>();
  for (let k = 0; k < n; k++) {
    const grp = ids[rows[k]];
    let gi = gIndex.get(grp);
    if (gi === undefined) {
      gi = groupAttr.categories.length;
      gIndex.set(grp, gi);
      groupAttr.categories.push(labelOf.get(grp)!);
    }
    groupAttr.data[k] = gi;
  }
  const attrs: BlockAttr[] = d.attrs
    .filter((a) => a.name !== groupAttr.name)
    .map((a) => {
      if (a.kind === 'number') return { name: a.name, kind: 'number', data: take32(a.data as Float32Array) };
      const src = a.data as Uint32Array;
      const data = new Uint32Array(n);
      for (let k = 0; k < n; k++) data[k] = src[rows[k]];
      return { name: a.name, kind: 'category', data, categories: a.categories ?? [] };
    });
  attrs.push(groupAttr);
  const block: SourceBlock = {
    rows: n,
    px: take32(d.px),
    py: take32(d.py),
    pz: take32(d.pz),
    time,
    timeIsAbsolute: false,
    yaw: d.yaw ? take32(d.yaw) : null,
    pitch: d.pitch ? take32(d.pitch) : null,
    personIds: pairIds,
    personLabels: pairLabels,
    teamIds,
    teamLabels,
    sessionIds: null,
    sessionLabels: [],
    attrs,
    rejected: 0,
  };
  const b = new DatasetBuilder(n);
  b.append(block);
  const out = b.finish(d.said ? say(d.said.name) : (d.name ?? ''));
  out.axes = d.axes;
  out.entitySize = d.entitySize;
  out.geo = d.geo;
  out.roleColumns = { ...d.roleColumns, session: undefined };
  overlays.add(out);
  return out;
}
