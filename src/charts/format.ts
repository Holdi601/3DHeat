/**
 * Numbers and labels as a chart says them, in the viewer's language: values
 * by their format (counts compact past ten thousand, shares as percent, rates
 * a minute, ratios), axis ticks at clean steps, and the worker's `@` message
 * keys (`@other`, `@inside`, `@measure.median|speed`) as words.
 */

import { num, t } from '../i18n';
import type { ChartData, ValueFormat } from './types';

/** A value as its format says it; `short` compacts big counts (12.9K). */
export function fmtValue(v: number, f: ValueFormat, short = false): string {
  if (v === Infinity) return '∞';
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  switch (f) {
    case 'pct':
      return `${num(v * 100, a < 0.001 ? 2 : a < 0.1 ? 1 : 0)}%`;
    case 'int':
      if (short && a >= 10_000) return compact(v);
      return num(Math.round(v), 0);
    case 'rate':
      return t('charts.fmt.perMin', { v: a >= 10_000 && short ? compact(v) : num(v, a >= 100 ? 0 : a >= 10 ? 1 : 2) });
    case 'ratio':
      return num(v, 2);
    case 'seconds':
      return `${num(v, a >= 100 ? 0 : 1)} s`;
    default:
      if (short && a >= 10_000) return compact(v);
      return num(v, a >= 100 ? 0 : a >= 10 ? 1 : 2);
  }
}

/** A number in thousands, millions or billions: 12.9K, 4.2M. */
export function compact(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e9) return `${num(v / 1e9, 1)}B`;
  if (a >= 1e6) return `${num(v / 1e6, 1)}M`;
  return `${num(v / 1e3, a >= 1e5 ? 0 : 1)}K`;
}

/** Clean tick values from lo to hi, about `n` of them. */
export function niceTicks(lo: number, hi: number, n = 4): number[] {
  if (!(hi > lo)) return [lo];
  const raw = (hi - lo) / Math.max(1, n);
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  const step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}

/** Seconds as m:ss or h:mm:ss, for time axes. */
export function clock(s: number): string {
  const neg = s < 0;
  const a = Math.abs(s);
  const h = Math.floor(a / 3600);
  const m = Math.floor((a % 3600) / 60);
  const sec = Math.floor(a % 60);
  const body = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
  return neg ? `-${body}` : body;
}

/** A worker label in words: `@key|column|p` is `charts.label.key` (or a measure's message) with its values. */
export function sayLabel(label: string): string {
  if (!label.startsWith('@')) return label;
  const [key, column, p] = label.slice(1).split('|');
  if (key.startsWith('measure.')) return t(`charts.${key}`, { column: column ?? '', p: p ?? '' });
  if (key === 'tile.median') return t('charts.tile.median', { column: column ?? '' });
  return t(`charts.label.${key}`);
}

/** A chart's labels said in the viewer's language, in place. */
export function localizeChart(d: ChartData): ChartData {
  for (const e of d.groups) e.label = sayLabel(e.label);
  for (const e of d.series) e.label = sayLabel(e.label);
  d.valueLabel = sayLabel(d.valueLabel);
  if (d.axis) d.axis = { ...d.axis, label: sayLabel(d.axis.label) };
  if (d.yAxis) d.yAxis = { ...d.yAxis, label: sayLabel(d.yAxis.label) };
  return d;
}
