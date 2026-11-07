import { useMemo, useRef } from 'react';
import { useStore } from '../../state/store';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { num, t } from '../../i18n';
import type { Dataset } from '../../state/types';
import { unitsPerMetre } from './replayData';

interface Series {
  time: Float64Array;
  height: Float64Array;
  speed: Float64Array;
}

/** One person's samples in the session played, in time order: height and ground-plus-climb speed. */
function seriesOf(d: Dataset, person: number, session: number): Series | null {
  if (!d.personId || !d.time) return null;
  const rows: number[] = [];
  for (let i = 0; i < d.count; i++) {
    if (d.personId[i] !== person) continue;
    if (session >= 0 && d.sessionId && d.sessionId[i] !== session) continue;
    rows.push(i);
  }
  if (rows.length < 2) return null;
  rows.sort((a, b) => d.time![a] - d.time![b]);
  const n = rows.length;
  const s: Series = { time: new Float64Array(n), height: new Float64Array(n), speed: new Float64Array(n) };
  // In metres, whatever the data's unit.
  const unit = unitsPerMetre(d);
  for (let k = 0; k < n; k++) {
    const r = rows[k];
    s.time[k] = d.time[r];
    s.height[k] = d.py[r] / unit;
    if (k > 0) {
      const q = rows[k - 1];
      const dt = d.time[r] - d.time[q];
      s.speed[k] = dt > 1e-3 ? Math.hypot(d.px[r] - d.px[q], d.py[r] - d.py[q], d.pz[r] - d.pz[q]) / unit / dt : s.speed[k - 1];
    }
  }
  s.speed[0] = s.speed[1];
  return s;
}

function path(x: Float64Array, y: Float64Array, w: number, h: number, x0: number, x1: number, y0: number, y1: number): string {
  const out: string[] = [];
  const sx = w / Math.max(1e-9, x1 - x0);
  const sy = h / Math.max(1e-9, y1 - y0);
  const step = Math.max(1, Math.floor(x.length / (w * 2)));
  for (let i = 0; i < x.length; i += step) out.push(`${out.length ? 'L' : 'M'}${((x[i] - x0) * sx).toFixed(1)},${(h - (y[i] - y0) * sy).toFixed(1)}`);
  return out.join('');
}

/**
 * The followed track's height and speed over the session, as Tacview's
 * telemetry chart: two lines on one time axis (each on its own scale, both
 * labelled), and where the playhead is.
 */
export function TrackGraph({ person }: { person: number }) {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const session = useStore((s) => s.team.session);
  const marker = useRef<SVGLineElement>(null);
  const readout = useRef<HTMLDivElement>(null);
  const series = useMemo(() => (dataset ? seriesOf(dataset, person, session) : null), [dataset, person, session]);
  const W = 260;
  const H = 70;
  const span = useMemo(() => {
    if (!series) return null;
    // Each scale spans at least `min`, so a level flight does not show its sampling noise as a mountain range.
    const range = (a: Float64Array, min: number) => {
      let lo = Infinity;
      let hi = -Infinity;
      for (const v of a) {
        if (!Number.isFinite(v)) continue;
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
      const mid = (lo + hi) / 2;
      return hi - lo >= min ? [lo, hi] : [mid - min / 2, mid + min / 2];
    };
    return { t: [series.time[0], series.time[series.time.length - 1]], h: range(series.height, 50), v: range(series.speed, 10) };
  }, [series]);

  useAnimationFrame(() => {
    if (!engine || !series || !span) return;
    const now = engine.live.playhead;
    const x = ((now - span.t[0]) / Math.max(1e-9, span.t[1] - span.t[0])) * W;
    if (marker.current) {
      marker.current.setAttribute('x1', x.toFixed(1));
      marker.current.setAttribute('x2', x.toFixed(1));
    }
    if (readout.current) {
      // The sample at or before the playhead.
      let lo = 0;
      let hi = series.time.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (series.time[mid] <= now) lo = mid;
        else hi = mid - 1;
      }
      const text = t('replay.graph.now', { m: num(series.height[lo], 0), kmh: num(series.speed[lo] * 3.6, 0) });
      if (readout.current.textContent !== text) readout.current.textContent = text;
    }
  }, !!series);

  if (!series || !span) return null;
  return (
    <div className="replay-graph">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <path d={path(series.time, series.height, W, H, span.t[0], span.t[1], span.h[0], span.h[1])} fill="none" stroke="#6fb6ff" strokeWidth={1.5} />
        <path d={path(series.time, series.speed, W, H, span.t[0], span.t[1], span.v[0], span.v[1])} fill="none" stroke="#ffd166" strokeWidth={1} opacity={0.85} />
        <line ref={marker} y1={0} y2={H} stroke="#fff" strokeOpacity={0.6} />
      </svg>
      <div className="hint">
        <span style={{ color: '#6fb6ff' }}>{t('replay.graph.height', { lo: num(span.h[0], 0), hi: num(span.h[1], 0) })}</span>
        {' · '}
        <span style={{ color: '#ffd166' }}>{t('replay.graph.speed', { lo: num(span.v[0] * 3.6, 0), hi: num(span.v[1] * 3.6, 0) })}</span>
      </div>
      <div className="hint" ref={readout} />
    </div>
  );
}
