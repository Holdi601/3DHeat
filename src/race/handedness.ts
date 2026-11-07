/**
 * Whether a game's world comes out mirrored in this viewer.
 *
 * The viewer's world is right-handed with Y up: seen from above, a car whose
 * direction of travel `atan2(dx, dz)` grows is turning left. A game with a
 * left-handed world (Forza among them) comes out mirrored, every right-hand
 * bend drawn as a left-hand one. The laps themselves say which way the car
 * really turned: the steering (positive to the right in every adapter) and the
 * suspension (the outside of a turn compresses).
 */

import type { LapTrace } from './lap';

function wrap(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/** true: drawn mirrored; false: drawn the right way round; null: cannot tell. */
export function drawnMirrored(lap: LapTrace): boolean | null {
  const { x, z } = lap.channels;
  const steer = lap.channels.steer;
  const fl = lap.channels['suspension.FL'];
  const fr = lap.channels['suspension.FR'];
  if (!x || !z || (!steer && !(fl && fr))) return null;
  let last = Number.NaN;
  let bySteer = 0;
  let bySide = 0;
  let turned = 0;
  let from = 0;
  for (let i = 1; i < lap.count; i++) {
    const dx = x[i] - x[from];
    const dz = z[i] - z[from];
    // A few metres at a time, so the wobble of a stationary car turns nothing.
    if (Math.hypot(dx, dz) < 3) continue;
    const course = Math.atan2(dx, dz);
    if (Number.isFinite(last)) {
      const d = wrap(course - last);
      turned += Math.abs(d);
      if (steer && Number.isFinite(steer[i])) bySteer += steer[i] * d;
      if (fl && fr && Number.isFinite(fl[i]) && Number.isFinite(fr[i])) bySide += (fr[i] - fl[i]) * d;
    }
    last = course;
    from = i;
  }
  // A lap that barely turns says nothing either way.
  if (turned < Math.PI) return null;
  if (fl && fr && Math.abs(bySide) > 0.02 * turned) return bySide < 0;
  if (steer && Math.abs(bySteer) > 0.02 * turned) return bySteer > 0;
  return null;
}

/** What most of the laps say, or null when they cannot tell. */
export function lapsMirrored(laps: LapTrace[]): boolean | null {
  let yes = 0;
  let no = 0;
  for (const lap of laps) {
    const m = drawnMirrored(lap);
    if (m === true) yes++;
    else if (m === false) no++;
  }
  if (yes === no) return null;
  return yes > no;
}
