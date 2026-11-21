/**
 * How a level layout's spawns are shown (`render/spawnMarks.ts`), the same in
 * the heat, the replay and on the tactics board:
 *
 * - `off`: not at all;
 * - `groups`: one ring per team, owner and stage, as before;
 * - `points`: every spawn point, a small marker in its team's colour with a
 *   tick for its heading and a glyph for a vehicle's, optionally a line to
 *   the capture point or headquarters it belongs to.
 *
 * And which of them: one owner's (a flag), one team's, one stage's. The
 * choices are the viewer's own and kept in this browser; the filters are
 * per level and are not.
 */

import { create } from 'zustand';

export type SpawnMode = 'off' | 'groups' | 'points';
export const SPAWN_MODES: SpawnMode[] = ['off', 'groups', 'points'];

interface SpawnDisplayState {
  mode: SpawnMode;
  lines: boolean;
  owner: string | null;
  team: number | null;
  stage: number | null;
  rev: number;
  setMode: (m: SpawnMode) => void;
  setLines: (on: boolean) => void;
  setFilter: (f: Partial<{ owner: string | null; team: number | null; stage: number | null }>) => void;
}

const KEY = '3dheat.spawns';

function saved(): { mode: SpawnMode; lines: boolean } {
  const out = { mode: 'groups' as SpawnMode, lines: false };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (v && typeof v === 'object') {
      if (SPAWN_MODES.includes(v.mode)) out.mode = v.mode;
      if (typeof v.lines === 'boolean') out.lines = v.lines;
    }
  } catch {
    // Private windows and blocked storage: the defaults.
  }
  return out;
}

function save(s: { mode: SpawnMode; lines: boolean }): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ mode: s.mode, lines: s.lines }));
  } catch {
    // The choice lasts this session only.
  }
}

export const useSpawnDisplay = create<SpawnDisplayState>((set, get) => ({
  ...saved(),
  owner: null,
  team: null,
  stage: null,
  rev: 0,
  setMode: (mode) => {
    set({ mode, rev: get().rev + 1 });
    save(get());
  },
  setLines: (lines) => {
    set({ lines, rev: get().rev + 1 });
    save(get());
  },
  setFilter: (f) => set({ ...f, rev: get().rev + 1 }),
}));
