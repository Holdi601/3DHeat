import { useMemo, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore, type ChartAxis, type ChartKind } from '../../state/replayStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { t, useLang } from '../../i18n';
import {
  available,
  flightSeries,
  PARAM_BY_ID,
  PARAMS,
  sampleIndex,
  valueAt,
  type FlightSeries,
} from '../../data/flight';
import { fieldName, formatValue } from './fields';
import { personAt, sortUnits, unitsOf, type Unit } from './units';
import { usePlayhead, clock } from './hooks';
import {
  CHART_COLORS,
  linePath,
  MIN_SPAN,
  niceTicks,
  robustSpanOf,
  xyPath,
  zoomSpan,
  cumulativeDistance,
  interpolateAt,
  timeAtValue,
} from './charts';
import './replay.css';

const PAD = { l: 58, r: 12, t: 8, b: 22 };

interface Line {
  unit: Unit;
  person: number;
  s: FlightSeries;
  color: string;
}

/** The units on the chart: the followed, the target and the selected one, then those added. */
export function chartUnits(index: ReturnType<typeof unitsOf>, keys: (string | null)[]): Unit[] {
  const out: Unit[] = [];
  for (const k of keys) {
    const u = k ? index.byKey.get(k) : undefined;
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}

/**
 * Tacview's charts, over the view: one value of several units on one scale
 * (compare), one value against another (an energy-manoeuvrability look:
 * turn rate against speed), or one unit's values over time. The playhead is
 * marked; a click on a time chart goes to that moment.
 */
export function ChartDock() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const session = useStore((s) => s.team.session);
  const chart = useReplayStore((s) => s.chart);
  const followUnit = useReplayStore((s) => s.followUnit);
  const target = useReplayStore((s) => s.target);
  const selected = useReplayStore((s) => s.selected);
  const graph = useReplayStore((s) => s.graph);
  const units = useReplayStore((s) => s.units);
  const [large, setLarge] = useState(false);
  /** The time span shown, zoomed with the wheel; null the whole of it. */
  const [zoom, setZoom] = useState<[number, number] | null>(null);
  const now = usePlayhead(1000);
  const marker = useRef<SVGLineElement>(null);
  const dots = useRef<SVGGElement>(null);
  const readout = useRef<HTMLDivElement>(null);
  useLang();
  const index = useMemo(() => (dataset ? unitsOf(dataset) : null), [dataset]);
  const on = !!dataset && !!index && chart.open && mode === 'team';

  const picked = useMemo(
    () => (index ? chartUnits(index, [followUnit, target, selected, ...chart.units]) : []),
    [index, followUnit, target, selected, chart.units],
  );
  // Each unit's life at the playhead: a chart is of one life.
  const lifeKey = picked.map((u) => personAt(u, now)).join(',');
  const lines = useMemo<Line[]>(() => {
    if (!dataset) return [];
    const out: Line[] = [];
    for (const u of picked.slice(0, chart.kind === 'time' ? 1 : CHART_COLORS.length)) {
      const person = personAt(u, now);
      const s = flightSeries(dataset, person, session);
      if (s && s.time.length > 1)
        out.push({ unit: u, person, s, color: CHART_COLORS[out.length % CHART_COLORS.length] });
    }
    return out;
    // `now` by the lives it picks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, picked, lifeKey, session, chart.kind]);

  const W = large ? 980 : 640;
  const H = large ? 360 : 210;
  const w = W - PAD.l - PAD.r;
  const h = H - PAD.t - PAD.b;
  const kind = chart.kind;
  // The values the charted units have between them.
  const has = useMemo(() => {
    const s = new Set<string>();
    for (const l of lines) for (const id of available(l.s)) s.add(id);
    return PARAMS.map((p) => p.id).filter((id) => s.has(id));
  }, [lines]);

  // What the time and compare charts run along: time, or the distance flown (Tacview's X axis by distance).
  const axis: ChartAxis = kind === 'xy' ? 'time' : chart.xAxis;
  const along = useMemo(
    () =>
      lines.map((l) =>
        axis === 'time' ? l.s.time : cumulativeDistance(l.s.time, l.s.x, l.s.y, l.s.z, axis === 'ground'),
      ),
    [lines, axis],
  );
  /** A time as the first line's place on the X axis, and back. */
  const toX = (tm: number) => (axis === 'time' || !lines.length ? tm : interpolateAt(lines[0].s.time, along[0], tm));
  const toTime = (x: number) => (axis === 'time' || !lines.length ? x : timeAtValue(lines[0].s.time, along[0], x));

  const plot = useMemo(() => {
    if (!lines.length) return null;
    const whole: [number, number] = [
      Math.min(...along.map((a) => a[0])),
      Math.max(...along.map((a) => a[a.length - 1])),
    ];
    // Distance has no respawn gaps of its own: the series is cut where time jumps instead.
    const gap = axis === 'time' ? 10 : Infinity;
    const tSpan: [number, number] =
      zoom && zoom[0] >= whole[0] - 1 && zoom[1] <= whole[1] + 1 ? zoom : whole;
    if (kind === 'compare') {
      const id = chart.param;
      if (!PARAM_BY_ID[id]) return null;
      const ys = robustSpanOf(
        lines.map((l) => l.s.values[id] ?? []),
        MIN_SPAN[PARAM_BY_ID[id].kind] ?? 1,
      );
      return {
        kind,
        whole,
        tSpan,
        xs: tSpan,
        ys,
        paths: lines.map((l) => ({
          d: l.s.values[id] ? linePath(along[lines.indexOf(l)], l.s.values[id], w, h, tSpan, ys, gap) : '',
          color: l.color,
        })),
      };
    }
    if (kind === 'xy') {
      const xi = chart.x;
      const yi = chart.y;
      if (!PARAM_BY_ID[xi] || !PARAM_BY_ID[yi]) return null;
      // The bulk of the flight: taxiing turns and spawn jumps would squeeze the rest into a line.
      const xs = robustSpanOf(
        lines.map((l) => l.s.values[xi] ?? []),
        MIN_SPAN[PARAM_BY_ID[xi].kind] ?? 1,
        0.02,
      );
      const ys = robustSpanOf(
        lines.map((l) => l.s.values[yi] ?? []),
        MIN_SPAN[PARAM_BY_ID[yi].kind] ?? 1,
        0.02,
      );
      return {
        kind,
        whole,
        tSpan: whole,
        xs,
        ys,
        paths: lines.map((l) => ({
          d:
            l.s.values[xi] && l.s.values[yi]
              ? xyPath(l.s.time, l.s.values[xi], l.s.values[yi], w, h, xs, ys)
              : '',
          color: l.color,
        })),
      };
    }
    // One unit's values over time, each on its own scale.
    const l = lines[0];
    const ids = graph.filter((g) => l.s.values[g]).slice(0, 4);
    const scales = ids.map((id) =>
      robustSpanOf([l.s.values[id]], MIN_SPAN[PARAM_BY_ID[id]?.kind] ?? 1),
    );
    return {
      kind,
      whole,
      tSpan,
      xs: tSpan,
      ys: scales[0] ?? ([0, 1] as [number, number]),
      scales,
      ids,
      paths: ids.map((id, i) => ({
        d: linePath(along[0], l.s.values[id], w, h, tSpan, scales[i], gap),
        color: CHART_COLORS[i],
      })),
    };
  }, [lines, along, axis, kind, chart.param, chart.x, chart.y, graph, w, h, zoom]);

  useAnimationFrame(() => {
    if (!engine || !plot) return;
    const tNow = engine.live.playhead;
    if (marker.current) {
      const show = plot.kind !== 'xy';
      const x = ((toX(tNow) - plot.xs[0]) / Math.max(1e-9, plot.xs[1] - plot.xs[0])) * w;
      marker.current.setAttribute('x1', x.toFixed(1));
      marker.current.setAttribute('x2', x.toFixed(1));
      marker.current.style.display = show ? '' : 'none';
    }
    // The current values: dots where each unit is now on the value-against-value chart, and the readout.
    const parts: string[] = [];
    const circles = dots.current ? Array.from(dots.current.children) : [];
    lines.forEach((l, i) => {
      const at = sampleIndex(l.s, tNow) >= 0;
      if (plot.kind === 'compare') {
        const id = chart.param;
        if (at)
          parts.push(
            `${l.unit.name} ${formatValue(PARAM_BY_ID[id].kind, valueAt(l.s, id, tNow), units)}`,
          );
      } else if (plot.kind === 'xy') {
        const vx = valueAt(l.s, chart.x, tNow);
        const vy = valueAt(l.s, chart.y, tNow);
        const c = circles[i] as SVGCircleElement | undefined;
        if (c) {
          const ok = Number.isFinite(vx) && Number.isFinite(vy);
          c.style.display = ok ? '' : 'none';
          if (ok) {
            c.setAttribute('cx', (((vx - plot.xs[0]) / (plot.xs[1] - plot.xs[0])) * w).toFixed(1));
            c.setAttribute(
              'cy',
              (h - ((vy - plot.ys[0]) / (plot.ys[1] - plot.ys[0])) * h).toFixed(1),
            );
          }
        }
        if (at)
          parts.push(
            `${l.unit.name} ${formatValue(PARAM_BY_ID[chart.x].kind, vx, units)} · ${formatValue(PARAM_BY_ID[chart.y].kind, vy, units)}`,
          );
      } else if (i === 0 && 'ids' in plot && plot.ids) {
        for (const id of plot.ids)
          parts.push(
            `${fieldName(id)} ${formatValue(PARAM_BY_ID[id].kind, valueAt(l.s, id, tNow), units)}`,
          );
      }
    });
    const text = parts.join('   ');
    if (readout.current && readout.current.textContent !== text) readout.current.textContent = text;
  }, on && !!plot);

  if (!on || !index) return null;
  const set = useReplayStore.getState().setChart;
  const close = () => set({ open: false });
  const paramSelect = (value: string, onChange: (v: string) => void) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {(has.length ? has : PARAMS.map((p) => p.id)).map((id) => (
        <option key={id} value={id}>
          {fieldName(id)}
        </option>
      ))}
    </select>
  );
  const addable = sortUnits(index.units.filter((u) => u.kind !== 'weapon' && !picked.includes(u)));
  const yTicks = plot ? niceTicks(plot.ys[0], plot.ys[1], large ? 7 : 4) : [];
  const xTicks = plot ? niceTicks(plot.xs[0], plot.xs[1], large ? 9 : 6) : [];
  const yKind =
    plot?.kind === 'compare'
      ? PARAM_BY_ID[chart.param]?.kind
      : plot?.kind === 'xy'
        ? PARAM_BY_ID[chart.y]?.kind
        : plot && 'ids' in plot && plot.ids?.length
          ? PARAM_BY_ID[plot.ids[0]].kind
          : undefined;
  const xKind = plot?.kind === 'xy' ? PARAM_BY_ID[chart.x]?.kind : undefined;
  const start = dataset.timeRange[0];

  return (
    <div
      className={`chart-dock${large ? ' large' : ''}`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="cd-head">
        <div className="seg">
          {(['compare', 'xy', 'time'] as ChartKind[]).map((k) => (
            <button
              key={k}
              className={kind === k ? 'on' : ''}
              onClick={() => set({ kind: k })}
              title={t(`replay.chart.kind.${k}Title`)}
            >
              {t(`replay.chart.kind.${k}`)}
            </button>
          ))}
        </div>
        {kind === 'compare' && paramSelect(chart.param, (v) => set({ param: v }))}
        {kind === 'xy' && (
          <>
            {paramSelect(chart.y, (v) => set({ y: v }))}
            <span className="dim">{t('replay.chart.against')}</span>
            {paramSelect(chart.x, (v) => set({ x: v }))}
          </>
        )}
        {kind !== 'xy' && (
          <select
            value={chart.xAxis}
            onChange={(e) => {
              setZoom(null);
              set({ xAxis: e.target.value as ChartAxis });
            }}
            title={t('replay.chart.axisTitle')}
          >
            {(['time', 'air', 'ground'] as ChartAxis[]).map((a) => (
              <option key={a} value={a}>
                {t(`replay.chart.axis.${a}`)}
              </option>
            ))}
          </select>
        )}
        <span className="spacer" />
        <button
          className="small"
          onClick={() => setLarge(!large)}
          title={t('replay.chart.sizeTitle')}
        >
          {large ? '▭' : '▢'}
        </button>
        <button className="small" onClick={close} title={t('replay.chart.close')}>
          ×
        </button>
      </div>
      <div className="cd-units">
        {lines.map((l) => (
          <span
            key={l.unit.key}
            className="chip on"
            style={{ borderColor: l.color, color: l.color }}
          >
            {l.unit.name}
            {chart.units.includes(l.unit.key) && (
              <button
                className="x"
                onClick={() => set({ units: chart.units.filter((k) => k !== l.unit.key) })}
                title={t('replay.chart.remove')}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {kind !== 'time' && (
          <select
            value=""
            onChange={(e) => e.target.value && set({ units: [...chart.units, e.target.value] })}
          >
            <option value="">{t('replay.chart.add')}</option>
            {addable.map((u) => (
              <option key={u.key} value={u.key}>
                {u.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {!lines.length ? (
        <div className="hint">{t('replay.chart.empty')}</div>
      ) : plot ? (
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          onWheel={(e) => {
            if (plot.kind === 'xy') return;
            e.stopPropagation();
            const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const x = Math.max(0, Math.min(w, ((e.clientX - r.left) / r.width) * W - PAD.l));
            const at = plot.xs[0] + (x / w) * (plot.xs[1] - plot.xs[0]);
            setZoom(zoomSpan(plot.xs, plot.whole, at, Math.pow(1.0015, e.deltaY)));
          }}
          onDoubleClick={() => setZoom(null)}
          onClick={(e) => {
            if (plot.kind === 'xy') return;
            const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * W - PAD.l;
            if (x < 0 || x > w) return;
            useStore.getState().seek(toTime(plot.xs[0] + (x / w) * (plot.xs[1] - plot.xs[0])));
          }}
        >
          <defs>
            <clipPath id="cd-clip">
              <rect width={w} height={h} />
            </clipPath>
          </defs>
          <g transform={`translate(${PAD.l},${PAD.t})`}>
            <rect width={w} height={h} className="cd-bg" />
            {yTicks.map((v) => {
              const y = h - ((v - plot.ys[0]) / (plot.ys[1] - plot.ys[0])) * h;
              return (
                <g key={`y${v}`}>
                  <line x1={0} x2={w} y1={y} y2={y} className="cd-grid" />
                  <text x={-6} y={y + 3} textAnchor="end" className="cd-tick">
                    {yKind ? formatValue(yKind, v, units) : String(v)}
                  </text>
                </g>
              );
            })}
            {xTicks.map((v) => {
              const x = ((v - plot.xs[0]) / (plot.xs[1] - plot.xs[0])) * w;
              return (
                <g key={`x${v}`}>
                  <line x1={x} x2={x} y1={0} y2={h} className="cd-grid" />
                  <text x={x} y={h + 15} textAnchor="middle" className="cd-tick">
                    {xKind ? formatValue(xKind, v, units) : axis !== 'time' ? formatValue('distance', v, units) : clock(v - start)}
                  </text>
                </g>
              );
            })}
            <g clipPath="url(#cd-clip)">
              {plot.paths.map((p, i) => (
                <path
                  key={i}
                  d={p.d}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={plot.kind === 'xy' ? 1 : 1.5}
                  opacity={plot.kind === 'xy' ? 0.75 : 0.95}
                />
              ))}
            </g>
            <line ref={marker} y1={0} y2={h} stroke="#fff" strokeOpacity={0.6} />
            <g ref={dots}>
              {plot.kind === 'xy' &&
                lines.map((l) => (
                  <circle key={l.unit.key} r={5} fill={l.color} stroke="#000" strokeWidth={1.5} />
                ))}
            </g>
          </g>
        </svg>
      ) : (
        <div className="hint">{t('replay.chart.noValue')}</div>
      )}
      {plot && 'ids' in plot && plot.ids && plot.scales && (
        <div className="hint">
          {plot.ids.map((id, i) => (
            <span key={id} style={{ color: CHART_COLORS[i], marginRight: 10 }}>
              {t('replay.graph.range', {
                name: fieldName(id),
                lo: formatValue(PARAM_BY_ID[id].kind, plot.scales![i][0], units),
                hi: formatValue(PARAM_BY_ID[id].kind, plot.scales![i][1], units),
              })}
            </span>
          ))}
          {t('replay.chart.timeHint')}
        </div>
      )}
      <div className="hint mono" ref={readout} />
      {kind !== 'xy' && <div className="hint">{t('replay.chart.zoomHint')}</div>}
    </div>
  );
}
