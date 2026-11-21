import type { Engine } from '../../render/engine';
import { useStore } from '../../state/store';
import { useRaceStore } from '../../state/raceStore';
import { useReplayStore } from '../../state/replayStore';
import type { Dataset } from '../../state/types';
import { isOverlay } from '../../match/overlay';
import { followMetres, keyOfRow, rowIn } from './rowKey';
import { unitsOf } from '../replay/units';
import { flyTo } from '../replay/replayView';
import { selectAndFollow } from '../replay/ReplayOverlay';

let timer = 0;

/**
 * Into the match replay at a row: its own match played alone (not the figure
 * overlay of every match), the playhead at the row's time and paused there,
 * its own track (that life, in that match) selected and followed close
 * behind. From the heatmap tab the match tab opens first, which puts back the
 * data the replay plays (an overlay's own), and the jump follows.
 */
export function jumpToRow(engine: Engine, d: Dataset, row: number): void {
  if (!d.time || row < 0 || row >= d.count) return;
  clearTimeout(timer);
  const key = keyOfRow(d, row);
  const go = () => {
    const st = useStore.getState();
    const ds = st.dataset;
    if (!ds?.time) return;
    const r = ds === d && !isOverlay(d) ? row : rowIn(ds, key);
    if (r < 0) return;
    const session = ds.sessionId ? ds.sessionId[r] : -1;
    if (session >= 0 && st.team.session !== session) st.patchTeam({ session });
    st.patchTimeline({ mode: 'play' });
    st.setPlaying(false);
    st.seek(ds.time[r]);
    const p = ds.personId ? ds.personId[r] : -1;
    const index = unitsOf(ds);
    const u = p >= 0 ? index.units[index.personUnit[p]] : undefined;
    const replay = useReplayStore.getState();
    if (u) {
      if (replay.followMode !== 'chase') replay.patchSaved({ followMode: 'chase' });
      replay.setFollowDistance(followMetres(ds, r));
      // The row's own track: a player's unit spans every match, and its life by the time alone could be another match's.
      selectAndFollow(u, p);
    } else flyTo(engine, ds, { x: ds.px[r], y: ds.py[r], z: ds.pz[r] }, 60);
  };
  const race = useRaceStore.getState();
  if (race.tab !== 'match' || useStore.getState().mode !== 'team') {
    // The tab sets the replay's mode itself: setting it here too, while the heatmap tab still shows, built the
    // figure overlay of every match for a frame (a copy of all rows, the playhead and the match reset).
    if (race.tab !== 'match') race.setTab('match');
    // On the match tab already (its heat view): the replay there plays the match alone.
    else useStore.getState().setMode('team');
    // The tab's own effects first: the overlay put back, the replay's mode set.
    timer = window.setTimeout(go, 150);
    return;
  }
  go();
}
