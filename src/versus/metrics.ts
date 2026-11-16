/**
 * The Compare panel's statistics: the built-in ones, worked out from what the
 * loaded data has, and the user's own, kept in this browser and moved
 * between browsers as a JSON file.
 *
 * Every statistic is an expression of the panel's language (`expr.ts`), the
 * built-ins included, so a user's own one is a peer of them: the same table,
 * charts, intervals and differences.
 */

import { EVENT_KINDS } from '../data/canonical';
import { OUTLAY_KINDS, valueColumnsOf } from '../data/cost';
import type { Dataset } from '../state/types';

/** How a value is written: a count, seconds, a share (x100 %), a ratio, the data's distance units (a second), a currency, or the user's own word. */
export type Unit = 'count' | 's' | '%' | 'ratio' | 'dist' | 'dist/s' | string;

export interface MetricDef {
  id: string;
  /** The user's name, or for a built-in an i18n key under `versus.metric.` with `values`. */
  name: string;
  builtin?: { key: string; values?: Record<string, string> };
  expr: string;
  unit: Unit;
  /** A cost: a waterfall subtracts it. */
  flow?: 'earn' | 'cost';
  /** Lower is better (deaths): the colours of a difference turn round. */
  lowerBetter?: boolean;
}

const q = (name: string) => '`' + name.replace(/`/g, '') + '`';

/** The built-in statistics this dataset can have (an expression that does not bind is dropped by the caller). */
export function builtinMetrics(ds: Dataset): MetricDef[] {
  const b = (id: string, key: string, expr: string, unit: Unit, extra: Partial<MetricDef> = {}): MetricDef => ({ id, name: key, builtin: { key }, expr, unit, ...extra });
  const out: MetricDef[] = [
    b('rows', 'rows', 'count()', 'count'),
    b('presence', 'presence', 'presence()', 's'),
    b('players', 'players', 'players()', 'count'),
    b('matches', 'matches', 'matches()', 'count'),
    b('rounds', 'rounds', 'rounds()', 'count'),
    b('kills', 'kills', 'kills()', 'count'),
    b('deaths', 'deaths', 'deaths()', 'count', { lowerBetter: true }),
    b('kd', 'kd', 'shrink(kills(), deaths(), 4)', 'ratio'),
    b('kpm', 'kpm', 'shrink(kills(), presence() / 60, 2)', 'ratio'),
    b('winRate', 'winRate', 'winRate()', '%'),
    b('presencePerPlayer', 'presencePerPlayer', 'presence() / players()', 's'),
    b('distance', 'distance', 'sum(step)', 'dist'),
    b('speed', 'speed', 'avg(speed)', 'dist/s'),
    b('speedMax', 'speedMax', 'percentile(speed, 95)', 'dist/s'),
    b('altitude', 'altitude', 'avg(alt)', 'dist'),
    b('share', 'share', 'ofAll(count())', '%'),
  ];
  const dmg = ds.attrs.find((a) => a.kind === 'number' && /^(damage|dmg|damage_?dealt|hp_?damage|dmg_?health)$/i.test(a.name));
  if (dmg) out.push(b('damage', 'damage', `sum(${q(dmg.name)})`, 'count'));
  // Money, per currency: earned, each outlay, net.
  const vals = valueColumnsOf(ds.attrs);
  for (const cur of [...new Set(vals.map((v) => v.currency))]) {
    const earn = vals.filter((v) => v.currency === cur && v.flow === 'earn');
    const total = vals.find((v) => v.currency === cur && v.flow === 'cost' && v.kind === 'total');
    const costs = vals.filter((v) => v.currency === cur && v.flow === 'cost' && OUTLAY_KINDS.includes(v.kind as never));
    const net = vals.find((v) => v.currency === cur && v.flow === 'net');
    const values = { currency: cur };
    const earned = earn.map((v) => `sum(${q(v.name)})`).join(' + ');
    const spent = total ? `sum(${q(total.name)})` : costs.map((v) => `sum(${q(v.name)})`).join(' + ');
    if (earned) out.push({ id: `earn:${cur}`, name: 'earned', builtin: { key: 'earned', values }, expr: earned, unit: cur, flow: 'earn' });
    for (const c of costs)
      out.push({ id: `cost:${c.kind}:${cur}`, name: 'spentKind', builtin: { key: 'spentKind', values: { ...values, kind: c.kind ?? '' } }, expr: `sum(${q(c.name)})`, unit: cur, flow: 'cost', lowerBetter: true });
    if (spent) out.push({ id: `spent:${cur}`, name: 'spent', builtin: { key: 'spent', values }, expr: spent, unit: cur, lowerBetter: true });
    if (net) out.push({ id: `net:${cur}`, name: 'net', builtin: { key: 'net', values }, expr: `sum(${q(net.name)})`, unit: cur });
    else if (earned && spent) out.push({ id: `net:${cur}`, name: 'net', builtin: { key: 'net', values }, expr: `${earned} - (${spent})`, unit: cur });
  }
  // Events by kind.
  for (const k of EVENT_KINDS) if (k !== 'position') out.push({ id: `ev:${k}`, name: 'event', builtin: { key: 'event', values: { kind: k } }, expr: `countIf(event == "${k}")`, unit: 'count' });
  return out;
}

// ---------------------------------------------------------------------------
// The user's own

const STORE = '3dheat.versus.metrics';

export function loadUserMetrics(): MetricDef[] {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? sanitize(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function saveUserMetrics(list: MetricDef[]): void {
  try {
    localStorage.setItem(STORE, JSON.stringify(list));
  } catch {
    // Storage full or blocked: the metrics last the session.
  }
}

/** Only well-formed entries, from storage or an imported file. */
export function sanitize(x: unknown): MetricDef[] {
  const arr = Array.isArray(x) ? x : x && typeof x === 'object' && Array.isArray((x as { metrics?: unknown }).metrics) ? (x as { metrics: unknown[] }).metrics : [];
  const out: MetricDef[] = [];
  for (const m of arr) {
    if (!m || typeof m !== 'object') continue;
    const { id, name, expr, unit, lowerBetter } = m as Record<string, unknown>;
    if (typeof name !== 'string' || typeof expr !== 'string' || !name.trim() || !expr.trim() || expr.length > 4000) continue;
    out.push({
      id: typeof id === 'string' && id.startsWith('user:') ? id : `user:${Math.random().toString(36).slice(2, 10)}`,
      name: name.slice(0, 120),
      expr,
      unit: typeof unit === 'string' ? unit.slice(0, 24) : '',
      lowerBetter: lowerBetter === true,
    });
  }
  return out;
}

export function exportMetricsJson(list: MetricDef[]): string {
  return JSON.stringify({ format: '3dheat-statistics', version: 1, metrics: list.map(({ id, name, expr, unit, lowerBetter }) => ({ id, name, expr, unit, lowerBetter })) }, null, 2);
}

/** Merge imported metrics: an entry with an id already there replaces it. */
export function mergeMetrics(have: MetricDef[], add: MetricDef[]): MetricDef[] {
  const out = [...have];
  for (const m of add) {
    const i = out.findIndex((x) => x.id === m.id);
    if (i >= 0) out[i] = m;
    else out.push(m);
  }
  return out;
}
