/** A sign's words: its title from its spec, the names of dimensions and measures. */

import { t } from '../../i18n';
import type { ChartSpec, GroupKey, Measure } from '../../charts/types';
import type { Sign } from '../../volumes/signs/sign';

export function groupName(k: GroupKey | undefined): string {
  if (!k || k === 'none') return t('charts.group.none');
  if (k === 'team' || k === 'person' || k === 'session') return t(`charts.group.${k}`);
  return k.slice(4);
}

export function measureName(m: Measure): string {
  if (m.kind === 'mean' || m.kind === 'median' || m.kind === 'pct') return t(`charts.measure.${m.kind}`, { column: m.column ?? '?', p: m.p ?? 90 });
  return t(`charts.measure.${m.kind}`, { column: '', p: '' });
}

/** "Rows by team", "Median speed over match time", "Speed (histogram)". */
export function specTitle(s: ChartSpec): string {
  const m = measureName(s.measure);
  switch (s.kind) {
    case 'line':
    case 'area':
      return t('charts.title.time', { measure: m });
    case 'histogram':
      return t('charts.title.hist', { column: s.x ?? '?' });
    case 'scatter':
      return t('charts.title.scatter', { x: s.x ?? '?', y: s.y ?? '?' });
    case 'tiles':
      return t('charts.title.tiles');
    case 'matrix':
      return t('charts.title.matrix', { measure: m, a: groupName(s.group), b: groupName(s.stack ?? 'team') });
    case 'stacked':
      return t('charts.title.stacked', { measure: m, a: groupName(s.group), b: groupName(s.stack) });
    default:
      return s.group === 'none' ? m : t('charts.title.by', { measure: m, a: groupName(s.group) });
  }
}

export function signTitle(s: Sign): string {
  return s.title.trim() || specTitle(s.spec);
}

/** The diff a sign shows, said briefly ("inside vs outside"), or empty. */
export function diffText(s: ChartSpec): string {
  if (s.diff === 'none') return '';
  if (s.diff === 'teams' && s.teams) return t('charts.diff.teamsNamed', { a: s.teams[0], b: s.teams[1] });
  return t(`charts.diff.${s.diff}`);
}
