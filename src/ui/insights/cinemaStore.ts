/**
 * The caster's camera, as state: whether it films (a remembered choice), the
 * moment it is on, and whether the viewer took the camera over. Kept apart
 * from the overlay that drives it (CasterCinema.tsx) so the caster's list and
 * the engine can reach it without importing the overlay.
 */

import { create } from 'zustand';
import type { Moment } from '../../insights/cast/moments';
import type { CastSource } from '../../insights/cast/source';
import { useReplayStore } from '../../state/replayStore';

interface CinemaState {
  /** The caster moves the camera itself (remembered in this browser). */
  on: boolean;
  /** Subtitles over the view while it does. */
  subtitles: boolean;
  moment: Moment | null;
  src: CastSource | null;
  /** The viewer moved the camera or followed a unit: the caster's camera waits until resumed. */
  held: boolean;
  /** Bumped on every new moment, so the driver starts a new move. */
  shot: number;
  set: (p: Partial<Omit<CinemaState, 'set'>>) => void;
}

const KEY = 'heat3d.casterCinema';

function saved(): { on: boolean; subtitles: boolean } {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (v && typeof v === 'object') return { on: v.on !== false, subtitles: v.subtitles !== false };
  } catch {
    // Defaults.
  }
  return { on: true, subtitles: true };
}

export const useCinema = create<CinemaState>((set, get) => ({
  ...saved(),
  moment: null,
  src: null,
  held: false,
  shot: 0,
  set: (p) => {
    set(p);
    if ('on' in p || 'subtitles' in p) {
      try {
        localStorage.setItem(KEY, JSON.stringify({ on: get().on, subtitles: get().subtitles }));
      } catch {
        // This session only.
      }
    }
  },
}));

/**
 * The tracks the caster's camera frames this frame: the engine places these
 * on the CPU with the followed unit, so the camera and the rings meet the
 * figures where they are drawn.
 */
export const castTracks = new Set<number>();

/** Film a moment: the camera moves there on its own, the subtitles say it. */
export function startCinema(m: Moment, src: CastSource): void {
  const r = useReplayStore.getState();
  r.stopFollow();
  // The tactical display's director waits while the caster films.
  if (r.look.on && r.look.director) r.holdDirector(true);
  const s = useCinema.getState();
  s.set({ moment: m, src, held: false, shot: s.shot + 1 });
}

/** Stop filming: the camera stays where it is. */
export function stopCinema(): void {
  castTracks.clear();
  useCinema.getState().set({ moment: null, src: null, held: false });
}

/** The viewer took over. */
export function holdCinema(): void {
  castTracks.clear();
  if (!useCinema.getState().held) useCinema.getState().set({ held: true });
}

/** Back to the caster's camera on the current moment. */
export function resumeCinema(): void {
  const s = useCinema.getState();
  if (!s.moment) return;
  useReplayStore.getState().stopFollow();
  s.set({ held: false, shot: s.shot + 1 });
}
