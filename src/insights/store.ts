/**
 * The last insight report and the work towards the next. Kept out of the
 * panel so a later narrator or caster reads the same report.
 */

import { create } from 'zustand';
import type { FilterSpec } from '../state/types';
import type { InsightReport } from './types';

export interface InsightsState {
  report: InsightReport | null;
  /** The data and scope the report was counted on (dataset id + scope key). */
  key: string | null;
  running: boolean;
  progress: number;
  error: string | null;
  selected: string | null;
  /** The filters from before the first insight was shown; null when none is shown. */
  before: FilterSpec[] | null;
  set: (p: Partial<Omit<InsightsState, 'set'>>) => void;
}

export const useInsights = create<InsightsState>((set) => ({
  report: null,
  key: null,
  running: false,
  progress: 0,
  error: null,
  selected: null,
  before: null,
  set: (p) => set(p),
}));
