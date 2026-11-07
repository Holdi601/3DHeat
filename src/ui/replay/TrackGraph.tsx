import { useMemo, useRef } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { t } from '../../i18n';
import { flightSeries, PARAM_BY_ID, sampleIndex, valueAt, available, type FlightSeries } from '../../data/flight';
import { fieldName, formatValue } from './fields';

/** Series colours, in the order the parameters were picked. */
const COLORS = ['#6fb6ff', '#ffd166', '#7ee0a1', '#ff8fa3'];
/** At most this many lines on the chart. */
const MAX_LINES = 4;

/** The smallest span a scale shows, by kind, so a steady value does not show its noise as a mountain range. */
const MIN_SPAN: Record<string, number> = { altitude: 50, speed: 10, vspeed: 5, angle: 5, heading: 20, rate: 5, g: 1, mach: 0.05, ratio: 0.1, distance: 100 };

function path(x: Float64Array, y: Float64Array, w: number, h: number, x0: number, x1: number, y0: number, y1: number): string {
  const out: string[] = [];
  const sx = w / Math.max(1e-9, x1 - x0);
  const sy = h / Math.max(1e-9, y1 - y0);
  const step = Math.max(1, Math.floor(x.length / (w * 2)));
  let pen = false;
  for (let i = 0; i < x.length; i += step) {
    const v = y[i];
    // A gap in the values lifts the pen, and so does a gap in time (a respawn).
    if (!Number.isFinite(v) || (i >= step && x[i] - x[i - step] > 10)) {
      pen = false;
      if (!Number.isFinite(v)) continue;
    }
    out.push(`${pen ? 'L' : 'M'}${((x[i] - x0) * sx).toFixed(1)},${(h - (v - y0) * sy).toFixed(1)}`);
    pen = true;
  }
  return out.join('');
}

function range(a: Float64Array, min: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of a) {
    if (!Number.isFinite(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (!Number.isFinite(lo)) return [0, 1];
  const mid = (lo + hi) / 2;
  return hi - lo >= min ? [lo, hi] : [mid - min / 2, mid + min / 2];
}

/**
 * The unit's chosen flight values over its life, as Tacview's telemetry
 * chart: up to four lines on one time axis, each on its own scale (its range
 * written in its colour), where the playhead is and the values there. A click
 * on the chart goes to that moment.
 */
export function TrackGraph({ person }: { person: number }) {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const session = useStore((s) => s.team.session);
  const graph = useReplayStore((s) => s.graph);
  const units = useReplayStore((s) => s.units);
  const marker = useRef<SVGLineElement>(null);
  const readout = useRef<HTMLDivElement>(null);
  const series = useMemo<FlightSeries | null>(() => (dataset ? flightSeries(dataset, person, session) : null), [dataset, person, session]);
  const has = useMemo(() => (series ? available(series) : []), [series]);
  const lines = graph.filter((id) => has.includes(id)).slice(0, MAX_LINES);
  const W = 260;
  const H = 90;
  const spans = useMemo(() => {
    if (!series || series.time.length < 2) return null;
    return {
      t: [series.time[0], series.time[series.time.length - 1]] as [number, number],
      y: Object.fromEntries(lines.map((id) => [id, range(series.values[id], MIN_SPAN[PARAM_BY_ID[id].kind] ?? 1)])),
    };
    // `lines` by its contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, lines.join()]);

  useAnimationFrame(() => {
    if (!engine || !series || !spans) return;
    const now = engine.live.playhead;
    const x = ((now - spans.t[0]) / Math.max(1e-9, spans.t[1] - spans.t[0])) * W;
    if (marker.current) {
      marker.current.setAttribute('x1', x.toFixed(1));
      marker.current.setAttribute('x2', x.toFixed(1));
    }
    if (readout.current) {
      const i = sampleIndex(series, now);
      const text = i < 0 ? '' : lines.map((id) => `${fieldName(id)} ${formatValue(PARAM_BY_ID[id].kind, valueAt(series, id, now), units)}`).join(' · ');
      if (readout.current.textContent !== text) readout.current.textContent = text;
    }
  }, !!series && !!spans);

  if (!series || !spans) return null;
  const toggle = (id: string) => {
    const next = graph.includes(id) ? graph.filter((g) => g !== id) : [...graph.filter((g) => has.includes(g)).slice(-(MAX_LINES - 1)), id];
    useReplayStore.getState().patchSaved({ graph: next });
  };
  return (
    <div className="replay-graph">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        onClick={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          useStore.getState().seek(spans.t[0] + ((e.clientX - r.left) / r.width) * (spans.t[1] - spans.t[0]));
        }}
      >
        {lines.map((id, i) => (
          <path
            key={id}
            d={path(series.time, series.values[id], W, H, spans.t[0], spans.t[1], spans.y[id][0], spans.y[id][1])}
            fill="none"
            stroke={COLORS[i]}
            strokeWidth={i === 0 ? 1.5 : 1}
            opacity={0.9}
          />
        ))}
        <line ref={marker} y1={0} y2={H} stroke="#fff" strokeOpacity={0.6} />
      </svg>
      <div className="hint">
        {lines.map((id, i) => (
          <span key={id} style={{ color: COLORS[i], marginRight: 8 }}>
            {t('replay.graph.range', {
              name: fieldName(id),
              lo: formatValue(PARAM_BY_ID[id].kind, spans.y[id][0], units),
              hi: formatValue(PARAM_BY_ID[id].kind, spans.y[id][1], units),
            })}
          </span>
        ))}
      </div>
      <div className="hint mono" ref={readout} />
      <details className="graph-pick">
        <summary>{t('replay.graph.pick', { max: MAX_LINES })}</summary>
        <div className="chips">
          {has.map((id) => (
            <button key={id} className={`chip${lines.includes(id) ? ' on' : ''}`} onClick={() => toggle(id)}>
              {fieldName(id)}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
