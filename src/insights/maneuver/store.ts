/**
 * The last movement analysis and what of it is shown: the match, the
 * maneuver picked (drawn full in 3D, the others faint or hidden) and the
 * confidence a maneuver needs to be listed. Kept out of the panel, so the 3D
 * lines (`lines.ts`) and a narrator read the same report.
 */

import { create } from 'zustand';
import { maneuverLines, useManeuverLines } from './lines';
import type { Maneuver, ManeuverMatch, ManeuverReport } from './types';

export type Level = 'high' | 'medium' | 'low';

export interface ManeuverState {
  report: ManeuverReport | null;
  /** The data and scope it was counted on. */
  key: string | null;
  running: boolean;
  progress: number;
  error: string | null;
  /** The match shown (its session; -1 a file of one match). */
  session: number;
  selected: string | null;
  /** Draw the match's other listed maneuvers faint in 3D, not only the picked one. */
  showAll: boolean;
  /** Lowest level listed. */
  level: Level;
  /** The sides' names (the dataset's), for their colours. */
  teams: string[];
  set: (p: Partial<Omit<ManeuverState, 'set'>>) => void;
}

export const useManeuvers = create<ManeuverState>((set) => ({
  report: null,
  key: null,
  running: false,
  progress: 0,
  error: null,
  session: -1,
  selected: null,
  showAll: false,
  level: 'medium',
  teams: [],
  set: (p) => set(p),
}));

const RANK: Record<Level, number> = { low: 0, medium: 1, high: 2 };

/** The match of the report shown, and its maneuvers at the level listed. */
export function shownMatch(s: Pick<ManeuverState, 'report' | 'session' | 'level'>): { match: ManeuverMatch | null; list: Maneuver[] } {
  const ms = s.report?.matches ?? [];
  const match = ms.find((m) => m.session === s.session) ?? ms[0] ?? null;
  const list = (match?.maneuvers ?? []).filter((m) => RANK[m.level] >= RANK[s.level]);
  return { match, list };
}

// The 3D lines follow the pick: rebuilt only when the report, match, pick or level changes.
useManeuvers.subscribe((s, p) => {
  if (s.report === p.report && s.session === p.session && s.selected === p.selected && s.showAll === p.showAll && s.level === p.level && s.teams === p.teams) return;
  const { list } = shownMatch(s);
  const drawn = s.showAll ? list : list.filter((m) => m.id === s.selected);
  useManeuverLines.setState({ lines: drawn.length ? maneuverLines(drawn, s.selected, s.teams) : null });
});
