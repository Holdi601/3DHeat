import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { FOLLOW_MODES, useReplayStore } from '../../state/replayStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { t } from '../../i18n';
import { TacticalMap } from './TacticalMap';
import { ChartDock } from './ChartDock';
import { CockpitHud } from './CockpitHud';
import { StatsTable } from './StatsPanel';
import { addBookmark } from './BookmarkPanel';
import { defaultEventKinds, eventRows } from './replayData';
import { flyTo } from './replayView';
import './replay.css';

/** The event times of the kinds the event list shows, in the session played, ascending. */
function shownEventTimes(): number[] {
  const s = useStore.getState();
  const d = s.dataset;
  if (!d?.time) return [];
  const ev = eventRows(d);
  if (!ev) return [];
  const r = useReplayStore.getState();
  const kinds = new Set(r.eventKinds ?? defaultEventKinds(ev.labels));
  const out: number[] = [];
  for (let i = 0; i < ev.rows.length; i++) {
    const row = ev.rows[i];
    if (!kinds.has(ev.labels[i])) continue;
    if (s.team.session >= 0 && d.sessionId && d.sessionId[row] !== s.team.session) continue;
    out.push(d.time[row]);
  }
  return out;
}

/** The first event row strictly after (or before) `t` of the shown kinds; -1 for none. */
function eventRowNear(t: number, forward: boolean): number {
  const s = useStore.getState();
  const d = s.dataset;
  if (!d?.time) return -1;
  const ev = eventRows(d);
  if (!ev) return -1;
  const r = useReplayStore.getState();
  const kinds = new Set(r.eventKinds ?? defaultEventKinds(ev.labels));
  const ok = (i: number) =>
    kinds.has(ev.labels[i]) &&
    (s.team.session < 0 || !d.sessionId || d.sessionId[ev.rows[i]] === s.team.session);
  if (forward) {
    for (let i = 0; i < ev.rows.length; i++)
      if (d.time[ev.rows[i]] > t + 0.05 && ok(i)) return ev.rows[i];
  } else {
    for (let i = ev.rows.length - 1; i >= 0; i--)
      if (d.time[ev.rows[i]] < t - 0.05 && ok(i)) return ev.rows[i];
  }
  return -1;
}

/**
 * The replay's things over the view besides the labels: the 2D map, the
 * chart window, the cockpit's head-up display and the statistics table; and
 * its keys - B a bookmark, M the map, V the next view (Shift: back), H the
 * head-up display, Page Up / Page Down the previous and next event, comma and
 * full stop a second back and on (Shift: ten).
 */
export function ReplayExtras() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef(0);
  const lastHead = useRef<number | null>(null);
  const eventTimes = useRef<{
    d: unknown;
    kinds: unknown;
    session: number;
    times: number[];
  } | null>(null);
  const on = !!engine && !!dataset && mode === 'team';

  const say = (text: string) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1600);
  };

  useEffect(() => {
    if (!on || !engine) return;
    const onKey = (ev: KeyboardEvent) => {
      const el = ev.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          el.isContentEditable)
      )
        return;
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const d = useStore.getState().dataset;
      if (!d || useStore.getState().mode !== 'team') return;
      const r = useReplayStore.getState();
      switch (ev.code) {
        case 'KeyB': {
          addBookmark(engine, d);
          say(t('replay.bookmarks.added'));
          break;
        }
        case 'KeyM': {
          const next = r.map === 'off' ? 'pip' : r.map === 'pip' ? 'full' : 'off';
          r.patchSaved({ map: next });
          break;
        }
        case 'KeyV': {
          if (r.follow === null) {
            say(t('replay.follow.needUnit'));
            break;
          }
          const i = FOLLOW_MODES.indexOf(r.followMode);
          const next =
            FOLLOW_MODES[(i + (ev.shiftKey ? FOLLOW_MODES.length - 1 : 1)) % FOLLOW_MODES.length];
          r.patchSaved({ followMode: next });
          if (next === 'satellite' && r.followDistance < 1500) r.setFollowDistance(3000);
          say(t(`replay.follow.${next}`));
          break;
        }
        case 'KeyH':
          r.patchSaved({ hud: !r.hud });
          break;
        case 'PageDown':
        case 'PageUp': {
          ev.preventDefault();
          const row = eventRowNear(engine.live.playhead, ev.code === 'PageDown');
          if (row < 0 || !d.time) {
            say(t('replay.events.noMore'));
            break;
          }
          useStore.getState().seek(d.time[row]);
          if (r.follow === null)
            flyTo(engine, d, { x: d.px[row], y: d.py[row], z: d.pz[row] }, 220);
          break;
        }
        case 'Comma':
        case 'Period': {
          const step = (ev.shiftKey ? 10 : 1) * (ev.code === 'Comma' ? -1 : 1);
          useStore.getState().setPlaying(false);
          useStore
            .getState()
            .seek(Math.max(d.timeRange[0], Math.min(d.timeRange[1], engine.live.playhead + step)));
          break;
        }
        default:
          return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [on, engine]);

  // Pause on event: stop when the playhead passes one of the shown kinds.
  useAnimationFrame(() => {
    if (!engine) return;
    const r = useReplayStore.getState();
    const s = useStore.getState();
    const now = engine.live.playhead;
    const was = lastHead.current;
    lastHead.current = now;
    if (!r.pauseOnEvent || !s.timeline.playing || was === null || now <= was || now - was > 2)
      return;
    const cache = eventTimes.current;
    if (
      !cache ||
      cache.d !== s.dataset ||
      cache.kinds !== r.eventKinds ||
      cache.session !== s.team.session
    ) {
      eventTimes.current = {
        d: s.dataset,
        kinds: r.eventKinds,
        session: s.team.session,
        times: shownEventTimes(),
      };
    }
    const times = eventTimes.current!.times;
    // The first event after where the playhead was.
    let lo = 0;
    let hi = times.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (times[mid] <= was) lo = mid + 1;
      else hi = mid;
    }
    if (lo < times.length && times[lo] <= now) {
      s.setPlaying(false);
      s.seek(times[lo]);
      say(t('replay.events.paused'));
    }
  }, on);

  if (!on) return null;
  return (
    <>
      <CockpitHud />
      <TacticalMap />
      <ChartDock />
      <StatsTable />
      {toast && <div className="replay-toast">{toast}</div>}
    </>
  );
}
