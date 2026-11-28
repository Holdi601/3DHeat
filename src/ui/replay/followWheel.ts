/**
 * The wheel while the replay follows a unit: closer or further. In a parallel
 * view (the isometric and top views) how far the camera sits changes nothing
 * on screen, so there the wheel sizes the view about the unit instead -
 * following in the top view, the wheel did nothing (2026-11-28).
 */

import { useReplayStore } from '../../state/replayStore';

/** Per wheel notch, as the follow distance always went. */
export const FOLLOW_WHEEL_PER_NOTCH = 1.18;

export interface FollowWheelCamera {
  projection: 'perspective' | 'orthographic';
  zoomOrtho(factor: number): void;
}

export function followWheel(camera: FollowWheelCamera, notches: number): void {
  const factor = FOLLOW_WHEEL_PER_NOTCH ** notches;
  if (camera.projection === 'orthographic') {
    // About the middle, where the followed unit is: no pull towards the pointer.
    camera.zoomOrtho(factor);
    return;
  }
  const r = useReplayStore.getState();
  r.setFollowDistance(r.followDistance * factor);
}
