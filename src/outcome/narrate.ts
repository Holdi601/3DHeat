/**
 * A finding of the outcome analysis in plain words, as a coach would say it:
 * "On <map>, the side <B> that holds the middle, on the left at 1:00-2:00
 * wins 64% (CI 58-70%, 412 matches) against 49% otherwise (390); same
 * direction in 5 of 5 periods, and for 9 of 11 regular players." Numbers are
 * the finding's own; nothing is said that the counts do not carry.
 */

import { int, num, t } from '../i18n';
import type { OutcomeFinding, ZoneWhere } from './analyze';

const pct = (v: number) => `${num(v * 100, 0)}%`;
const pts = (v: number) => num(v * 100, Math.abs(v) < 0.1 ? 1 : 0);

/** Seconds as m:ss (or s under a minute). */
export function clockText(s: number): string {
  if (s < 60) return `${num(s, 0)} s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s - m * 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function windowText(w: [number, number]): string {
  return t('outcome.window', { from: clockText(w[0]), to: clockText(w[1]) });
}

/** Where a route goes: "the middle, left", "objective B (the enemy half)". */
export function zoneToText(z: ZoneWhere): string {
  const where = t('outcome.zone.to', { depth: z.depth, lateral: z.lateral });
  if (z.place?.startsWith('@')) return t('outcome.zone.toObjective', { name: z.place.slice(1), where });
  if (z.place) return t('outcome.zone.toPlace', { place: z.place, where });
  return where;
}

export function zoneText(z: ZoneWhere): string {
  const where = t('outcome.zone.where', { depth: z.depth, lateral: z.lateral });
  if (z.place?.startsWith('@')) return t('outcome.zone.objective', { name: z.place.slice(1), where });
  if (z.place) return t('outcome.zone.place', { place: z.place, where });
  return where;
}

/** What the side did, the sentence's middle. */
export function whatText(f: OutcomeFinding): string {
  const p: Record<string, string> = {};
  if (f.zone) p.zone = zoneText(f.zone);
  if (f.window) p.window = windowText(f.window);
  if (f.kind === 'route') {
    p.zone = f.routeEnd ? zoneToText(f.routeEnd) : '?';
    p.flank = f.flank ? 'yes' : 'no';
  }
  if (f.feature.name) {
    p.name = f.feature.name;
    p.cls = f.feature.name;
  }
  return t(`outcome.what.${f.kind}`, p);
}

/** The whole sentence; `rounds`: the map is played in rounds (else a match is one). */
export function sayFinding(f: OutcomeFinding, rounds: boolean): string {
  // Most of the plain difference is who played: say what is left first, the plain rates after.
  if (f.strengthExplained)
    return t('outcome.sayExplained', {
      group: f.group,
      side: t('outcome.sideName', { by: f.sideBy, name: f.sideName }),
      what: whatText(f),
      more: f.adjDiff > 0 ? 'yes' : 'no',
      adj: pts(Math.abs(f.adjDiff)),
      withPct: pct(f.with.rate),
      withoutPct: pct(f.without.rate),
      n1: int(f.with.n),
      n2: int(f.without.n),
      unit: t('outcome.unit', { rounds: rounds ? 'yes' : 'no' }),
    });
  return t('outcome.say', {
    group: f.group,
    side: t('outcome.sideName', { by: f.sideBy, name: f.sideName }),
    what: whatText(f),
    withPct: pct(f.with.rate),
    lo: pct(f.with.lo),
    hi: pct(f.with.hi),
    n1: int(f.with.n),
    unit: t('outcome.unit', { rounds: rounds ? 'yes' : 'no' }),
    withoutPct: pct(f.without.rate),
    n2: int(f.without.n),
    fa: int(f.folds[0]),
    fb: int(f.folds[1]),
    pa: int(f.players[0]),
    pb: f.players[1],
  });
}

/** A lead of a map under the minimum (exploratory): the plain counts of both arms with their intervals, nothing more. */
export function leadText(f: OutcomeFinding, rounds: boolean): string {
  return t('outcome.sayLead', {
    group: f.group,
    side: t('outcome.sideName', { by: f.sideBy, name: f.sideName }),
    what: whatText(f),
    k1: int(f.with.k),
    n1: int(f.with.n),
    withPct: pct(f.with.rate),
    lo: pct(f.with.lo),
    hi: pct(f.with.hi),
    k2: int(f.without.k),
    n2: int(f.without.n),
    withoutPct: pct(f.without.rate),
    lo2: pct(f.without.lo),
    hi2: pct(f.without.hi),
    unit: t('outcome.unit', { rounds: rounds ? 'yes' : 'no' }),
  });
}

export function detailText(f: OutcomeFinding): string {
  return t('outcome.detail', { adj: pts(f.adjDiff), diff: pts(f.diff), lo: pts(f.lo), hi: pts(f.hi), q: f.q < 0.001 ? '<0.001' : num(f.q, 3) });
}
