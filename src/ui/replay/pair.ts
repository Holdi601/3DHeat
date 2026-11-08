import { useReplayStore, type FollowMode } from '../../state/replayStore';
import { sortUnits, type Unit, type UnitIndex } from './units';

/**
 * The two-unit view, Tacview's: the camera on the followed unit (A), kept on
 * a second one (B, the store's target). These are the actions the unit list,
 * the figures, the unit card and the keys share.
 */

/** Views that keep a second unit in sight. */
export const PAIR_MODES: FollowMode[] = ['padlock', 'target'];

/**
 * Look at `unit` from the followed one: it becomes B, and a view that does
 * not keep a second unit in sight turns into the target view. With nothing
 * followed yet there is no A to look from, so it is followed instead.
 */
export function lookAtUnit(unit: Unit, person: number): void {
  const r = useReplayStore.getState();
  if (r.follow === null || r.followUnit === null) {
    useReplayStore.setState({ selected: unit.key, follow: person, followUnit: unit.key });
    return;
  }
  if (r.followUnit === unit.key) return;
  useReplayStore.setState({ target: unit.key, targetPerson: person });
  if (!PAIR_MODES.includes(r.followMode)) r.patchSaved({ followMode: 'target' });
}

/**
 * Let go of B: the target view goes back to the chase and the padlock to the
 * cockpit, the plain follow of the same unit. True when there was a B.
 */
export function clearLook(): boolean {
  const r = useReplayStore.getState();
  if (!r.target) return false;
  r.setTarget(null);
  if (r.followMode === 'target') r.patchSaved({ followMode: 'chase' });
  else if (r.followMode === 'padlock') r.patchSaved({ followMode: 'cockpit' });
  return true;
}

/** What can be B: everyone but A, weapons only while they fly. */
export function lookTargets(index: UnitIndex, followUnit: string | null, now: number): Unit[] {
  return sortUnits(index.units.filter((u) => u.key !== followUnit && (u.kind !== 'weapon' || u.spans.some(([a, b]) => a <= now && now <= b))));
}
