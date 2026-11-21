/**
 * Which findings are worth saying, and in what order.
 *
 * A finding can pass its test and still say nothing: a "hot zone" that covers
 * half the map, a quiet area that is quiet because it is where everyone
 * waits to spawn, a rate built on two expected events, spawns that cluster at
 * the spawns. Those are dropped here, each with its reason, so the report can
 * say how many were left out and why. What is left is ranked by usefulness:
 * the evidence (`strength`) times how specific the place is, how much the kind
 * of finding tells a player or a designer, and how many events it rests on.
 *
 * Pure: the report's own numbers only, run in the worker after the detectors.
 */

import type { Insight } from './types';

export type DropReason = 'wholeMap' | 'exposure' | 'fewEvents' | 'spawn' | 'trivialKind';

export interface Dropped {
  id: string;
  kind: string;
  reason: DropReason;
}

export interface CurateInput {
  /** The map's extent on the ground, world units. */
  mapExtent: number;
  /** Seconds (or samples) of presence over the whole map. */
  presence: number;
}

/** A place this wide or wider, against the map, is no place. */
const WHOLE_MAP = 0.35;
/** A route may run further. */
const WHOLE_MAP_ROUTE = 0.6;
/** A quiet place holding this share of all the time spent is the rear, not a finding. */
const BUSY_SHARE = 0.25;
/** Below this share of all time spent a hot place is where things land, not where people stand. */
export const TARGET_SHARE = 0.02;

/** Event kinds placed where the shot or the bomb arrives, not where whoever caused it stands. */
const EFFECT_KINDS = /explo|impact|hit|damage|splash|detonat|destroy|crash|bomb/i;
/** Event kinds placed where whoever does them stands. */
const ACTION_KINDS = /shot|shoot|fire|fired|launch|drop|throw|release/i;

/** Event kinds that happen where the game puts them: their places say nothing. */
const TRIVIAL_KINDS = /^(spawn|respawn|join|leave|connect|disconnect|despawn|round_start|round_end)$/i;

/** How much a kind of finding tells someone what to do. */
const KIND_WEIGHT: Array<[RegExp, number]> = [
  [/^outcome\./, 1],
  [/^power\./, 0.9],
  [/^flow\./, 0.9],
  [/^spawn\./, 0.9],
  [/^cover\./, 0.85],
  [/^classPlace\./, 0.85],
  [/^players\./, 0.8],
  [/^value\./, 0.8],
  [/^zones\.hot/, 0.7],
  [/^zones\.cold/, 0.4],
];

const kindWeight = (kind: string) => KIND_WEIGHT.find(([re]) => re.test(kind))?.[1] ?? 0.7;

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

/** The share of all time spent that a place's evidence holds, or null where it has none. */
export function presenceShare(ins: Insight, total: number): number | null {
  const p = ins.evidence.presence;
  const all = typeof ins.evidence.mapPresence === 'number' ? (ins.evidence.mapPresence as number) : total;
  return typeof p === 'number' && all > 0 ? p / all : null;
}

function near(a: Insight, b: Insight): boolean {
  if (!a.place || !b.place) return false;
  return Math.hypot(a.place.x - b.place.x, a.place.z - b.place.z) < a.place.radius + b.place.radius;
}

export function curateInsights(all: Insight[], c: CurateInput): { kept: Insight[]; dropped: Dropped[] } {
  const dropped: Dropped[] = [];
  const spawns = all.filter((i) => i.kind.startsWith('spawn.') && i.place);
  const kept: Insight[] = [];
  for (const ins of all) {
    const reason = dropReason(ins, c, spawns);
    if (reason) {
      dropped.push({ id: ins.id, kind: ins.kind, reason });
      continue;
    }
    const share = presenceShare(ins, c.presence);
    if (ins.kind === 'zones.hot' && share !== null && share < TARGET_SHARE) {
      // Where things land, or where people stop only to fire.
      const kind = ins.subject.eventKind ?? String(ins.sentence.params.kind ?? '');
      ins.variant = ACTION_KINDS.test(kind) && !EFFECT_KINDS.test(kind) ? 'passing' : 'target';
    }
    const n = sampleSize(ins);
    const scope = ins.place && c.mapExtent > 0 ? Math.min(1, Math.max(0.3, 1 - (2 * ins.place.radius) / c.mapExtent / WHOLE_MAP)) : 1;
    const sample = n > 0 ? Math.min(1, Math.max(0.3, Math.log10(1 + n) / 2)) : 0.6;
    ins.usefulness = Math.round(ins.strength * kindWeight(ins.kind) * scope * sample * 1e4) / 1e4;
    kept.push(ins);
  }
  kept.sort((a, b) => (b.usefulness ?? 0) - (a.usefulness ?? 0));
  return { kept, dropped };
}

function dropReason(ins: Insight, c: CurateInput, spawns: Insight[]): DropReason | null {
  const kindName = ins.subject.eventKind ?? (typeof ins.sentence.params.kind === 'string' ? ins.sentence.params.kind : '');
  if (ins.kind.startsWith('zones.') && TRIVIAL_KINDS.test(kindName)) return 'trivialKind';
  // A side's spawn area is where it is; its volume is fitted to the spawns themselves when made.
  if (ins.place && c.mapExtent > 0 && !ins.kind.startsWith('spawn.')) {
    const limit = ins.kind === 'flow.flank' ? WHOLE_MAP_ROUTE : WHOLE_MAP;
    if ((2 * ins.place.radius) / c.mapExtent > limit) return 'wholeMap';
  }
  const e = ins.evidence;
  if (ins.kind === 'zones.hot' && typeof e.expected === 'number' && typeof e.count === 'number' && e.count < 10 && e.expected < 1) return 'fewEvents';
  const share = presenceShare(ins, c.presence);
  if ((ins.kind === 'zones.cold' || ins.kind === 'power.safe') && share !== null && share > BUSY_SHARE) return 'exposure';
  // Quiet or safe where a side spawns: explained by the spawn, not by the place.
  if ((ins.kind === 'zones.cold' || ins.kind === 'power.safe') && spawns.some((s) => near(ins, s))) return 'spawn';
  return null;
}
