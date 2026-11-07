import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { useEngine } from '../EngineContext';
import { autoBookmarks, useBookmarkStore } from './bookmarks';
import { goToBookmark } from './BookmarkPanel';
import { unitsOf } from './units';
import './replay.css';

/** Half the scrubber's thumb: where the track's ends are inside the slider. */
const THUMB = 7;
/** How far from a mark (pixels) a click still finds it. */
const REACH = 5;

/**
 * Marks per pixel column: how many in each, as a density bar. `x(time)` the
 * column of a time; marks outside [0, w) are dropped.
 */
export function markColumns(
  times: ArrayLike<number>,
  w: number,
  x: (t: number) => number,
): Uint32Array {
  const out = new Uint32Array(Math.max(0, w));
  for (let i = 0; i < times.length; i++) {
    const c = Math.floor(x(times[i]));
    if (c >= 0 && c < w) out[c]++;
  }
  return out;
}

/**
 * Marks on the timeline, as Tacview's: kills and deaths as a grey density
 * bar, the selected or followed unit's in blue, bookmarks (the recording's
 * and the viewer's) in red. One canvas, drawn again only when what it shows
 * changes - never for the playhead - so a hundred overlaid matches' marks
 * cost one draw. A click goes to the nearest mark.
 */
export function ReplayMarks({ range }: { range: readonly number[] }) {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const session = useStore((s) => s.team.session);
  const list = useBookmarkStore((s) => s.list);
  const followUnit = useReplayStore((s) => s.followUnit);
  const selected = useReplayStore((s) => s.selected);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    useBookmarkStore.getState().open(dataset);
  }, [dataset]);
  const on = !!dataset?.time && mode === 'team';

  // What is drawn: every mark's time, the own unit's and the bookmarks apart.
  const marks = useMemo(() => {
    if (!dataset || !on) return null;
    const all = autoBookmarks(dataset);
    const index = unitsOf(dataset);
    const mine = followUnit ?? selected;
    const other: number[] = [];
    const own: number[] = [];
    const recorded: number[] = [];
    for (const m of all) {
      if (m.kind === 'message') continue;
      if (session >= 0 && dataset.sessionId && dataset.sessionId[m.row] !== session) continue;
      if (m.kind === 'bookmark') {
        recorded.push(m.time);
        continue;
      }
      const p = dataset.personId ? dataset.personId[m.row] : -1;
      if (mine && p >= 0 && index.units[index.personUnit[p]]?.key === mine) own.push(m.time);
      else other.push(m.time);
    }
    return { other, own, recorded };
  }, [dataset, on, session, followUnit, selected]);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !on) return;
    const ro = new ResizeObserver(() => setWidth(c.clientWidth));
    ro.observe(c);
    setWidth(c.clientWidth);
    return () => ro.disconnect();
  }, [on]);

  const span = Math.max(1e-9, range[1] - range[0]);
  const x = (t: number) => THUMB + ((t - range[0]) / span) * (width - 2 * THUMB);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !marks || !width) return;
    const dpr = window.devicePixelRatio || 1;
    const h = c.clientHeight;
    c.width = Math.round(width * dpr);
    c.height = Math.round(h * dpr);
    const g = c.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, width, h);
    // Everyone's kills and deaths: darker where there are more.
    const cols = markColumns(marks.other, width, x);
    let most = 1;
    for (const n of cols) if (n > most) most = n;
    for (let i = 0; i < cols.length; i++) {
      if (!cols[i]) continue;
      g.fillStyle = `rgba(200, 205, 212, ${(0.35 + 0.6 * Math.sqrt(cols[i] / most)).toFixed(2)})`;
      g.fillRect(i, 0, 1, h - 3);
    }
    g.fillStyle = '#6fb6ff';
    for (const t of marks.own) g.fillRect(Math.round(x(t)) - 1, 0, 2, h - 1);
    g.fillStyle = '#ff5a5a';
    for (const t of [...marks.recorded, ...list.map((b) => b.time)])
      g.fillRect(Math.round(x(t)) - 1, 0, 3, h);
    // `x` by the range and width it reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marks, list, width, range[0], range[1]]);

  if (!on || !dataset) return null;
  return (
    <div className="replay-marks">
      <canvas
        ref={canvas}
        onClick={(e) => {
          if (!marks) return;
          const r = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - r.left;
          // The viewer's bookmarks first: they bring their camera back.
          let best: { d: number; time: number; bookmark?: (typeof list)[number] } | null = null;
          for (const b of list) {
            const d = Math.abs(x(b.time) - px);
            if (d <= REACH && (!best || d < best.d)) best = { d, time: b.time, bookmark: b };
          }
          if (!best)
            for (const arr of [marks.recorded, marks.own, marks.other])
              for (const time of arr) {
                const d = Math.abs(x(time) - px);
                if (d <= REACH && (!best || d < best.d)) best = { d, time };
              }
          if (!best) return;
          if (best.bookmark && engine) goToBookmark(engine, dataset, best.bookmark);
          else useStore.getState().seek(best.time);
        }}
      />
    </div>
  );
}
