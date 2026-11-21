/**
 * Which findings are worth saying, and in what order: the standards every
 * finding is held to before it reaches the list, kept here so other analyses
 * (the outcome analysis, the mass comparison) can hold theirs to the same.
 *
 * A finding can pass its test and still say nothing:
 *
 * - a place that covers most of the map, a hot zone that holds most of all its
 *   events (the whole fight, "99% of it happens here"), or a quiet area that holds a quarter
 *   of all time spent (the rear);
 * - a rate built on a handful of events, or an absence where few were expected;
 * - quiet ground, safe ground, a "choke point" or money paid or earned at a
 *   spawn (the buy, the round's income): explained by the spawn, not by the place;
 * - events the game places (spawns, joins, take-offs, captures, rearming);
 * - a kill hot zone where the power positions already read kills and deaths;
 * - over several matches (or rounds), a place one match makes: it must hold in
 *   at least two (and a tenth of them), and no match may make more than 40% of it;
 * - where shots landed or were fired from, in one match: that match's fight;
 *   over several matches it must recur;
 * - quiet zones (time spent, few events): the rear, a rotation, a spawn;
 * - a "player" with no kill and no death: an observer, a camera, a parked unit;
 * - deaths by speed: people slow down (or run) to fight, so cause and effect mix;
 * - the same place again for another event kind, or one more of a kind the
 *   list already has enough of.
 *
 * Each is dropped with its reason, so the report can say how many were left
 * out and why. The rest are ranked by usefulness: the evidence (`strength`)
 * times how specific the place is, how much the kind of finding tells a player
 * or a designer, how many events it rests on and how consistently it holds
 * over the matches - each kind a little less for every one of it above it.
 *
 * Pure: the report's own numbers only, run in the worker after the detectors.
 */

import type { Insight, InsightSpread } from './types';

export type DropReason = 'wholeMap' | 'exposure' | 'fewEvents' | 'spawn' | 'trivialKind' | 'covered' | 'oneMatch' | 'fewMatches' | 'samePlace' | 'similar' | 'consequence' | 'confounded' | 'mostOfIt';

export interface Dropped {
  id: string;
  kind: string;
  reason: DropReason;
}

/** A place many lives start in (`engine.ts`), world units. */
export interface SpawnSpot {
  x: number;
  z: number;
  radius: number;
  starts: number;
}

export interface CurateInput {
  /** The map's extent on the ground, world units. */
  mapExtent: number;
  /** Seconds (or samples) of presence over the whole map. */
  presence: number;
  /** Where lives start, beside the spawn detector's own findings. */
  spawns?: SpawnSpot[];
  /** The power positions ran: kills and deaths by place are theirs to tell. */
  powerRan?: boolean;
}

/** A place this wide or wider, against the map, is no place. */
const WHOLE_MAP = 0.35;
/** A route may run further. */
const WHOLE_MAP_ROUTE = 0.6;
/** Below this share of all time spent a hot place is where things land, not where people stand. */
export const TARGET_SHARE = 0.02;
/** A hot zone holding more than this share of all its events is the whole fight, not a place in it. */
export const MOST_OF_IT = 0.5;
/** Events a finding must rest on (or, for an absence, be expected): fewer say nothing. */
export const MIN_EVENTS = 10;
/** Over at least this many matches, a finding must spread over them. */
export const SPREAD_MATCHES = 3;
/** No one match may make more than this share of a finding's events. */
export const TOP_MATCH_SHARE = 0.4;
/** Over ten or more matches, a finding must hold in at least this share of them (and in two). */
export const HOLD_SHARE = 0.1;

/** Event kinds placed where the shot or the bomb arrives, not where whoever caused it stands. */
const EFFECT_KINDS = /explo|impact|hit|damage|splash|detonat|destroy|crash|bomb/i;
/** Event kinds placed where whoever does them stands. */
const ACTION_KINDS = /shot|shoot|fire|fired|launch|drop|throw|release|decoy/i;

/** Event kinds that happen where the game puts them: their places say nothing. */
const TRIVIAL_KINDS = /^(spawn|respawn|join|leave|connect|disconnect|despawn|round_start|round_end|takeoff|landing|touchdown|stop|rearm|capture|message)$/i;

/** How much a kind of finding tells someone what to do. */
const KIND_WEIGHT: Array<[RegExp, number]> = [
  // The better buy winning is what everyone expects: a baseline, not news.
  [/^outcome\.buy$/, 0.5],
  [/^outcome\./, 1],
  [/^power\.kd/, 0.9],
  [/^power\.safe/, 0.5],
  [/^flow\./, 0.8],
  [/^spawn\./, 0.9],
  [/^cover\./, 0.6],
  [/^classPlace\./, 0.85],
  [/^players\./, 0.8],
  // Money is context for a coach, not the fight: below the tactical findings.
  [/^value\./, 0.35],
  [/^zones\.hot$/, 0.7],
  [/^zones\.cold/, 0.3],
];

/** At most this many of a kind (and variant) in the list; more are more of the same. */
const KIND_CAP: Array<[RegExp, number]> = [
  [/^zones\.cold/, 2],
  [/^zones\.hot:(target|passing)/, 2],
  [/^power\.safe/, 2],
  [/^cover\./, 2],
  [/^flow\.choke/, 4],
  [/^value/, 2],
  [/^spawn\./, 3],
  [/^players\./, 5],
  [/^outcome\./, 6],
];
const DEFAULT_CAP = 5;
/** Each further finding of a kind counts this much less than the one above it. */
const REPEAT = 0.85;

const kindWeight = (ins: Insight) =>
  ins.variant === 'target' || ins.variant === 'passing' ? 0.45 : KIND_WEIGHT.find(([re]) => re.test(ins.kind))?.[1] ?? 0.7;
const groupOf = (ins: Insight) => (ins.kind.startsWith('value.') ? 'value' : ins.variant ? `${ins.kind}:${ins.variant}` : ins.kind);
const capOf = (group: string) => KIND_CAP.find(([re]) => re.test(group))?.[1] ?? DEFAULT_CAP;

/** The events a finding rests on, by what its evidence counts. */
export function sampleSize(ins: Insight): number {
  const e = ins.evidence;
  const n = (k: string) => (typeof e[k] === 'number' ? (e[k] as number) : 0);
  if (ins.kind.startsWith('zones.') || ins.kind.startsWith('value.')) return n('count') || n('rows');
  if (ins.kind.startsWith('power.') || ins.kind.startsWith('classPlace.')) return n('kills') + n('deaths');
  if (ins.kind === 'flow.choke') return n('crossings');
  if (ins.kind === 'flow.flank') return n('killsAfter') + n('crossings');
  if (ins.kind.startsWith('spawn.')) return n('spawns') || Number(ins.sentence.params.spawns) || 0;
  if (ins.kind.startsWith('players.')) return n('kills') + n('deaths');
  if (ins.kind.startsWith('cover.')) return n('deathsOpen') + n('deathsMid') + n('deathsDense') + n('deathsSlow') + n('deathsFast');
  if (ins.kind.startsWith('outcome.')) return n('roundsWith') + n('roundsWithout') || n('rounds');
  return 0;
}

/** The events a finding is about, as counted at its place (or, for an absence, expected): what it needs `MIN_EVENTS` of. */
export function eventsOf(ins: Insight): number {
  const e = ins.evidence;
  const n = (k: string) => (typeof e[k] === 'number' ? (e[k] as number) : 0);
  if (ins.kind === 'zones.cold') return n('expected');
  if (ins.kind === 'power.safe') {
    const rest = n('mapPresence') - n('presence');
    return rest > 0 ? ((n('mapDeaths') - n('deaths')) * n('presence')) / rest : 0;
  }
  if (ins.kind === 'flow.flank') return n('killsAfter');
  if (ins.kind === 'players.over') return n('kills');
  if (ins.kind === 'players.fragile') return n('deaths');
  return sampleSize(ins);
}

/** The share of all time spent that a place's evidence holds, or null where it has none. */
export function presenceShare(ins: Insight, total: number): number | null {
  const p = ins.evidence.presence;
  const all = typeof ins.evidence.mapPresence === 'number' ? (ins.evidence.mapPresence as number) : total;
  return typeof p === 'number' && all > 0 ? p / all : null;
}

function overlaps(a: { x: number; z: number; radius: number }, b: { x: number; z: number; radius: number }, margin = 0): boolean {
  return Math.hypot(a.x - b.x, a.z - b.z) < a.radius + b.radius + margin;
}

/**
 * Whether a finding over several matches (or rounds) holds in enough of them:
 * null when it does (or there is nothing to tell), else why not.
 */
export function spreadFails(s: InsightSpread | undefined): 'oneMatch' | 'fewMatches' | null {
  if (!s || s.matches < SPREAD_MATCHES) return null;
  if (s.active <= 1 || s.topShare > TOP_MATCH_SHARE) return 'oneMatch';
  if (s.holding < 2 || (s.matches >= 10 && s.holding < HOLD_SHARE * s.matches) || (s.active >= 8 && s.holding < 0.25 * s.active)) return 'fewMatches';
  return null;
}

/** The usefulness a finding is ranked by, before the repeats of its kind count less. */
export function usefulnessOf(ins: Insight, mapExtent: number): number {
  const n = sampleSize(ins);
  const scope = ins.place && mapExtent > 0 ? Math.min(1, Math.max(0.3, 1 - (2 * ins.place.radius) / mapExtent / WHOLE_MAP)) : 1;
  const sample = n > 0 ? Math.min(1, Math.max(0.3, Math.log10(1 + n) / 2)) : 0.6;
  const s = ins.spread;
  const steady = s && s.active > 0 ? 0.5 + 0.5 * Math.min(1, s.holding / s.active) : 1;
  return ins.strength * kindWeight(ins) * scope * sample * steady;
}

export function curateInsights(all: Insight[], c: CurateInput): { kept: Insight[]; dropped: Dropped[] } {
  const dropped: Dropped[] = [];
  const spawns = all.filter((i) => i.kind.startsWith('spawn.') && i.place);
  const kept: Insight[] = [];
  for (const ins of all) {
    const share = presenceShare(ins, c.presence);
    if (ins.kind === 'zones.hot' && share !== null && share < TARGET_SHARE) {
      // Where things land, where people stop only to fire, or where they die passing through.
      const kind = ins.subject.eventKind ?? String(ins.sentence.params.kind ?? '');
      ins.variant = kind === 'death' ? 'crossing' : ACTION_KINDS.test(kind) && !EFFECT_KINDS.test(kind) ? 'passing' : 'target';
    }
    const reason = dropReason(ins, c, spawns);
    if (reason) {
      dropped.push({ id: ins.id, kind: ins.kind, reason });
      continue;
    }
    ins.usefulness = Math.round(usefulnessOf(ins, c.mapExtent) * 1e4) / 1e4;
    kept.push(ins);
  }
  kept.sort((a, b) => (b.usefulness ?? 0) - (a.usefulness ?? 0));
  // The same place again, for another event kind: the most useful says it.
  const out: Insight[] = [];
  for (const ins of kept) {
    const dup = ins.kind.startsWith('zones.') && ins.place && out.some((o) => o.kind === ins.kind && o.place && overlaps(o.place, ins.place!));
    if (dup) dropped.push({ id: ins.id, kind: ins.kind, reason: 'samePlace' });
    else out.push(ins);
  }
  return { kept: out, dropped };
}

/**
 * The list's order: by usefulness, each further finding of a kind counting
 * `REPEAT` less than the one above it, at most a few of each kind (the rest
 * go to `dropped` as `similar`). Strictly by the number shown.
 */
export function rankInsights(kept: Insight[], dropped?: Dropped[]): Insight[] {
  const base = (i: Insight) => i.usefulnessBase ?? i.usefulness ?? i.strength;
  const order = [...kept].sort((a, b) => base(b) - base(a));
  const seen = new Map<string, number>();
  const out: Insight[] = [];
  for (const ins of order) {
    const g = groupOf(ins);
    const n = seen.get(g) ?? 0;
    seen.set(g, n + 1);
    if (n >= capOf(g)) {
      dropped?.push({ id: ins.id, kind: ins.kind, reason: 'similar' });
      continue;
    }
    // From the usefulness before any repeat counted, so ranking again (with the outcome's findings) counts it once.
    if (ins.usefulness !== undefined) {
      ins.usefulnessBase ??= ins.usefulness;
      ins.usefulness = Math.round(ins.usefulnessBase * Math.pow(REPEAT, n) * 1e4) / 1e4;
    }
    out.push(ins);
  }
  return out.sort((a, b) => (b.usefulness ?? b.strength) - (a.usefulness ?? a.strength));
}

function dropReason(ins: Insight, c: CurateInput, spawns: Insight[]): DropReason | null {
  const kindName = ins.subject.eventKind ?? (typeof ins.sentence.params.kind === 'string' ? ins.sentence.params.kind : '');
  const zone = ins.kind.startsWith('zones.');
  if (zone && TRIVIAL_KINDS.test(kindName)) return 'trivialKind';
  // Kills by place, and deaths' absence, are the power positions' to tell.
  if (zone && c.powerRan && (kindName === 'kill' || (kindName === 'death' && ins.kind === 'zones.cold'))) return 'covered';
  // A side's spawn area is where it is; its volume is fitted to the spawns themselves when made.
  if (ins.place && c.mapExtent > 0 && !ins.kind.startsWith('spawn.')) {
    const limit = ins.kind === 'flow.flank' ? WHOLE_MAP_ROUTE : WHOLE_MAP;
    if ((2 * ins.place.radius) / c.mapExtent > limit) return 'wholeMap';
  }
  // Too few events to say anything; a player's low count over long play, and a choke's crossings, are judged below.
  const counted = !/^(outcome|spawn|cover)\./.test(ins.kind) && ins.kind !== 'players.under' && ins.kind !== 'players.durable' && ins.kind !== 'flow.choke';
  if (counted && eventsOf(ins) < MIN_EVENTS) return 'fewEvents';
  if (ins.kind === 'flow.choke' && sampleSize(ins) < 3 * MIN_EVENTS) return 'fewEvents';
  const e = ins.evidence;
  if (ins.kind === 'zones.hot' && typeof e.count === 'number' && typeof e.mapCount === 'number' && e.count > MOST_OF_IT * e.mapCount) return 'mostOfIt';
  // Quiet, safe or busy where lives start, money paid or earned there (the buy, the round's income): explained by the spawn, not by the place.
  const atSpawn = ins.kind === 'zones.cold' || ins.kind === 'power.safe' || ins.kind === 'flow.choke' || ins.kind.startsWith('value.');
  if (atSpawn && ins.place) {
    if (spawns.some((s) => s.place && overlaps(ins.place!, s.place))) return 'spawn';
    if ((c.spawns ?? []).some((s) => overlaps(ins.place!, s, s.radius))) return 'spawn';
  }
  // Where people spend time and little happens (quiet zones, safe ground): a rear, a rotation, a parked
  // unit - on real data never a place to act on.
  if (ins.kind === 'zones.cold' || ins.kind === 'power.safe') return 'exposure';
  // How fast people die by how fast they move mixes cause and effect: people slow down (or run) to fight.
  if (ins.kind === 'cover.slow' || ins.kind === 'cover.fast') return 'confounded';
  // Where the shooting was (shots, hits, explosions) says something only when it recurs match after match:
  // in one match it is that match's fight. Deaths per time spent (deadly ground) stand on their own.
  const fight = ins.kind === 'zones.hot' && kindName !== 'death';
  if (fight && (!ins.spread || ins.spread.matches < SPREAD_MATCHES)) return 'fewMatches';
  // A player with no kill and no death in all that time never fought: an observer, a camera, a parked unit.
  if ((ins.kind === 'players.under' || ins.kind === 'players.durable') && sampleSize(ins) === 0) return 'fewEvents';
  return spreadFails(ins.spread);
}
