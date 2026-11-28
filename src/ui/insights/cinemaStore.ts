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
import { useStore } from '../../state/store';

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
  /** Play the moment once the camera has arrived (the replay waits while it moves). */
  pendingPlay: boolean;
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
  pendingPlay: false,
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

/** The viewer's own field of view while the caster's camera changes it; null when it does not. */
let fovBefore: number | null = null;

/** The caster's camera sets the field of view: the viewer's own is kept to give back. */
export function setCinemaFov(fov: number): void {
  const st = useStore.getState();
  if (fovBefore === null) fovBefore = st.camera.fov;
  if (Math.abs(st.camera.fov - fov) > 0.02) st.patchCamera({ fov });
}

/** The viewer's field of view back, as it was before the caster's camera. */
function restoreFov(): void {
  if (fovBefore === null) return;
  const v = fovBefore;
  fovBefore = null;
  if (Math.abs(useStore.getState().camera.fov - v) > 1e-6) useStore.getState().patchCamera({ fov: v });
}

/** Film a moment: the camera moves there on its own, the subtitles say it; with `play`, the replay plays it once the camera is there. */
export function startCinema(m: Moment, src: CastSource, play = false): void {
  const r = useReplayStore.getState();
  r.stopFollow();
  // The tactical display's director waits while the caster films.
  if (r.look.on && r.look.director) r.holdDirector(true);
  const s = useCinema.getState();
  s.set({ moment: m, src, held: false, shot: s.shot + 1, pendingPlay: play });
}

/** Stop filming: the camera stays where it is. */
export function stopCinema(): void {
  castTracks.clear();
  restoreFov();
  useCinema.getState().set({ moment: null, src: null, held: false, pendingPlay: false });
}

/** The viewer took over. */
export function holdCinema(): void {
  castTracks.clear();
  restoreFov();
  if (!useCinema.getState().held) useCinema.getState().set({ held: true, pendingPlay: false });
}

/** Back to the caster's camera on the current moment. */
export function resumeCinema(): void {
  const s = useCinema.getState();
  if (!s.moment) return;
  useReplayStore.getState().stopFollow();
  s.set({ held: false, shot: s.shot + 1, pendingPlay: false });
}
