/**
 * An insight's sentence in the viewer's language: its message with the
 * values formatted by what they are, told by their names - `ratio` a factor,
 * `...Pct` a share, `...Secs` a time (or samples, where the data has no time),
 * `kind`, `class`, `actor` a taxonomy value said the way the filters say it.
 */

import { CANON } from '../../data/canonical';
import { int, num, t } from '../../i18n';
import type { Insight } from '../../insights/types';
import { valueLabel } from '../panels/FilterPanel';

export function labelOf(column: string, value: string): string {
  return valueLabel(column, value);
}

export function secs(s: number): string {
  if (!Number.isFinite(s)) return '—';
  if (s <= 90) return `${num(s, s < 10 ? 1 : 0)} s`;
  if (s < 3600) return `${num(s / 60, s < 600 ? 1 : 0)} min`;
  return `${num(s / 3600, s < 36000 ? 1 : 0)} h`;
}

/** A share to two significant figures: "46%", "4.6%", "0.35%"; "under 0.1%" for less, never "0.0%". */
export function pctText(v: number): string {
  if (!Number.isFinite(v)) return '—';
  const p = v * 100;
  if (p === 0) return `${num(0)}%`;
  if (p < 0.1) return t('analysis.ins.under', { v: `${num(0.1, 1)}%` });
  const r = Number(p.toFixed(p < 1 ? 2 : p < 10 ? 1 : 0));
  return `${num(r, String(r).split('.')[1]?.length ?? 0)}%`;
}

/** Factors above this are said as "over 20": against a baseline near nothing, the exact factor means nothing. */
export const RATIO_CAP = 20;

/** A factor to two significant figures: "7.6", "2.4"; "over 20" above `RATIO_CAP`. */
export function ratioText(v: number): string {
  if (v > RATIO_CAP) return t('analysis.ins.over', { v: num(RATIO_CAP) });
  return num(v, v >= 10 ? 0 : 1);
}

export function formatParam(name: string, v: number | string, samples: boolean): string {
  if (typeof v === 'string') {
    if (name === 'kind') return labelOf(CANON.event, v);
    if (name === 'class') return labelOf(CANON.vehicleClass, v);
    if (name === 'actor') return labelOf(CANON.actor, v);
    return v;
  }
  if (name === 'ratio') return ratioText(v);
  // Points of win probability and their interval: whole points from ten up.
  if (name === 'diff' || name === 'lo' || name === 'hi' || name === 'perRound') return num(v, Math.abs(v) >= 10 ? 0 : 1);
  if (name.endsWith('Pct')) return pctText(v);
  if (name.endsWith('Secs')) return samples && name === 'timeSecs' ? t('insights.samples', { n: int(v) }) : secs(v);
  return Number.isInteger(v) ? int(v) : num(v, 1);
}

export function insightText(ins: Insight, samples: boolean): string {
  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(ins.sentence.params)) values[k] = formatParam(k, v, samples);
  return t(ins.sentence.key, values);
}
