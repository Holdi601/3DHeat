/** The Compare panel's further charts (the second set). */

import type { ChartEvents } from './charts';
import type { Model } from './VersusPanel';

export const MORE_CHARTS: readonly MoreKind[] = [];
export type MoreKind = 'histogram' | 'box' | 'heat' | 'radar' | 'waterfall' | 'funnel' | 'kpi';

export function MoreChart(_: { kind: MoreKind; model: Model; ev: ChartEvents }) {
  return null;
}
