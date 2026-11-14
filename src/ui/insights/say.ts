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

function secs(s: number): string {
  if (!Number.isFinite(s)) return '—';
  if (s <= 90) return `${num(s, s < 10 ? 1 : 0)} s`;
  if (s < 3600) return `${num(s / 60, s < 600 ? 1 : 0)} min`;
  return `${num(s / 3600, s < 36000 ? 1 : 0)} h`;
}

export function formatParam(name: string, v: number | string, samples: boolean): string {
  if (typeof v === 'string') {
    if (name === 'kind') return labelOf(CANON.event, v);
    if (name === 'class') return labelOf(CANON.vehicleClass, v);
    if (name === 'actor') return labelOf(CANON.actor, v);
    return v;
  }
  if (name === 'ratio') return num(v, v >= 10 ? 1 : v >= 2 ? 1 : 2);
  if (name.endsWith('Pct')) return `${num(v * 100, v > 0 && v < 0.1 ? 1 : 0)}%`;
  if (name.endsWith('Secs')) return samples && name === 'timeSecs' ? t('insights.samples', { n: int(v) }) : secs(v);
  return Number.isInteger(v) ? int(v) : num(v, 1);
}

export function insightText(ins: Insight, samples: boolean): string {
  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(ins.sentence.params)) values[k] = formatParam(k, v, samples);
  return t(ins.sentence.key, values);
}
