import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { AlignedLap } from '../../race/align';
import { classOf, type Analysis } from '../../race/analysis';
import { CAUSE_COLORS, deltaColor, rgbCss, type Rgb } from '../../race/geometry';
import { formatLapTime } from '../../race/lap';
import { defaultGraphs, GAP, graphRows, lapCatalog, type GraphRow } from '../../race/graphs';
import { distanceAt, type ReplayMode } from '../../race/replay';
import { groupLabel, GROUPS, wheelName, WHEELS, type ChannelEntry } from '../../race/schema';
import { causeGroup, lapColors, mapScale } from '../../race/scene';
import { raceClock, raceHover, replayLength, useRaceStore } from '../../state/raceStore';
import { int, num, t, useLang } from '../../i18n';
import { Segmented } from '../controls';
import { lineUpAt, seekToDistance } from './actions';
import { LineKey } from './RacePanel';

const modes = (): Array<{ value: ReplayMode; label: string; title: string }> => [
  { value: 'start', label: t('race.ui.transport.modes.start'), title: t('race.ui.transport.modes.startTitle') },
  { value: 'anchor', label: t('race.ui.transport.modes.anchor'), title: t('race.ui.transport.modes.anchorTitle') },
  { value: 'locked', label: t('race.ui.transport.modes.locked'), title: t('race.ui.transport.modes.lockedTitle') },
];

const SPEEDS = [0.25, 0.5, 1, 2, 4];
/** The most laps the charts draw. */
const CHART_LAPS = 8;

function Transport() {
  const clock = useSyncExternalStore(raceClock.subscribe, raceClock.snapshot);
  const replay = useRaceStore((s) => s.replay);
  const laps = useRaceStore((s) => s.laps);
  const offsets = useRaceStore((s) => s.offsets);
  const analysis = useRaceStore((s) => s.analysis);
  const patch = useRaceStore((s) => s.patchReplay);
  const charts = useRaceStore((s) => s.view.charts);
  const patchView = useRaceStore((s) => s.patchView);
  const end = replayLength({ laps, offsets, replay, analysis });
  const refDistance = useMemo(() => {
    if (!analysis) return 0;
    const ref = analysis.alignment.laps.find((l) => l.lap === analysis.alignment.reference)!;
    return distanceAt(ref.channels.time, analysis.alignment.grid, clock);
  }, [analysis, clock]);
  return (
    <div className="race-transport">
      <button
        className="icon-btn"
        title={t('race.ui.transport.start')}
        onClick={() => raceClock.set(0)}
        disabled={!analysis}
      >
        ⏮
      </button>
      <button
        className="icon-btn primary"
        title={t('race.ui.transport.play')}
        onClick={() => patch({ playing: !replay.playing })}
        disabled={!analysis}
      >
        {replay.playing ? '❚❚' : '▶'}
      </button>
      <select
        value={replay.speed}
        onChange={(e) => patch({ speed: Number(e.target.value) })}
        title={t('race.ui.transport.speed')}
      >
        {SPEEDS.map((s) => (
          <option key={s} value={s}>
            {t('race.ui.transport.speedValue', { v: num(s, s < 0.5 ? 2 : s < 1 ? 1 : 0) })}
          </option>
        ))}
      </select>
      <input
        className="scrub"
        type="range"
        min={0}
        max={Math.max(0.001, end)}
        step={0.01}
        value={Math.min(clock, end)}
        disabled={!analysis}
        onChange={(e) => raceClock.set(Number(e.target.value))}
      />
      <span className="mono clock">
        {t('race.ui.transport.clock', { time: formatLapTime(clock), end: formatLapTime(end), m: int(refDistance) })}
      </span>
      <Segmented
        value={replay.mode}
        options={modes()}
        onChange={(mode) =>
          patch({
            mode,
            anchorS: mode === 'anchor' ? refDistance : replay.anchorS,
          })
        }
      />
      <button
        onClick={() => lineUpAt(refDistance, 0)}
        disabled={!analysis}
        title={t('race.ui.transport.lineUpTitle')}
      >
        {t('race.ui.transport.lineUp')}
      </button>
      <label className="check">
        <input
          type="checkbox"
          checked={replay.loop}
          onChange={(e) => patch({ loop: e.target.checked })}
        />
        {t('race.ui.transport.loop')}
      </label>
      <button className="link" onClick={() => patchView({ charts: !charts })}>
        {charts ? t('race.ui.transport.hideCharts') : t('race.ui.transport.showCharts')}
      </button>
    </div>
  );
}

type Row = GraphRow;

const LEFT = 118;
const RIGHT = 10;
const STRIP = 7;
const ROW_GAP = 5;
const AXIS = 14;

/** The stretch of the lap on screen, metres along the reference. */
type Window = [number, number];

interface Layout {
  width: number;
  win: Window;
  x: (s: number) => number;
  s: (px: number) => number;
  rows: {
    row: Row;
    top: number;
    height: number;
    y: (v: number) => number;
    range: [number, number];
  }[];
  height: number;
  stripsTop: number;
  /** Grid index range on screen. */
  i0: number;
  i1: number;
}

function layoutFor(
  analysis: Analysis,
  laps: AlignedLap[],
  rows: Row[],
  width: number,
  height: number,
  win: Window,
): Layout {
  const grid = analysis.alignment.grid;
  const step = grid[1] - grid[0];
  const inner = Math.max(10, width - LEFT - RIGHT);
  const [s0, s1] = win;
  const x = (s: number) => LEFT + ((s - s0) / (s1 - s0)) * inner;
  const s = (px: number) => Math.max(s0, Math.min(s1, s0 + ((px - LEFT) / inner) * (s1 - s0)));
  const i0 = Math.max(0, Math.floor(s0 / step));
  const i1 = Math.min(grid.length - 1, Math.ceil(s1 / step));
  const stripsTop = 2;
  let top = STRIP * 2 + 10;
  // Fit the rows to the panel, by weight, none smaller than 16 px.
  const free = Math.max(rows.length * 16, height - top - AXIS - ROW_GAP * rows.length);
  const weights = rows.reduce((a, r) => a + r.weight, 0);
  const out = rows.map((row) => {
    const h = Math.max(16, Math.floor((free * row.weight) / weights));
    let range = row.range;
    if (!range) {
      let lo = Infinity;
      let hi = -Infinity;
      for (const l of laps) {
        if (row.skipRef && l.lap === analysis.alignment.reference) continue;
        for (let i = Math.max(l.first, i0); i <= Math.min(l.last, i1); i++) {
          const v = row.value(l, i);
          if (Number.isFinite(v)) {
            lo = Math.min(lo, v);
            hi = Math.max(hi, v);
          }
        }
      }
      if (row.zero) {
        lo = Math.min(0, lo);
        hi = Math.max(0, hi);
      }
      if (!Number.isFinite(lo)) [lo, hi] = [0, 1];
      if (hi - lo < 1e-6) hi = lo + 1;
      range = [lo, hi];
    }
    const t = top;
    const [lo, hi] = range;
    const y = (v: number) => t + h - ((v - lo) / (hi - lo)) * h;
    top += h + ROW_GAP;
    return { row, top: t, height: h, y, range: range as [number, number] };
  });
  return { width, win, x, s, rows: out, height: top + AXIS - ROW_GAP, stripsTop, i0, i1 };
}

/** One lap's line through a row, over the window, thinned to about two points a pixel. */
function pathFor(
  l: AlignedLap,
  row: Row,
  lay: Layout,
  y: (v: number) => number,
  grid: Float32Array,
): string {
  const a = Math.max(l.first, lay.i0);
  const b = Math.min(l.last, lay.i1);
  const stride = Math.max(1, Math.floor((b - a + 1) / (lay.width * 2)));
  let d = '';
  let pen = false;
  for (let i = a; i <= b; i += stride) {
    const v = row.value(l, i);
    if (!Number.isFinite(v)) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${lay.x(grid[i]).toFixed(1)},${y(v).toFixed(1)}`;
    pen = true;
  }
  return d;
}

/** A band from `a` to `b` metres, clipped to the window; null when off screen. */
function band(lay: Layout, a: number, b: number): { x: number; w: number } | null {
  const lo = Math.max(lay.win[0], Math.min(a, b));
  const hi = Math.min(lay.win[1], Math.max(a, b));
  if (hi <= lo) return null;
  return { x: lay.x(lo), w: Math.max(1, lay.x(hi) - lay.x(lo)) };
}

let measure: CanvasRenderingContext2D | null = null;

/** How wide `text` is in `font`, px; 0 where it cannot be measured. */
function textWidth(text: string, font: string): number {
  if (typeof document === 'undefined') return 0;
  measure ??= document.createElement('canvas').getContext('2d');
  if (!measure) return 0;
  measure.font = font;
  return measure.measureText(text).width;
}

/**
 * A row's name cut to fit before its axis value, with an ellipsis: a long
 * word in another language must not run into the numbers.
 */
function fitLabel(text: string, room: number): string {
  const font = '550 11px Inter, system-ui, sans-serif';
  if (textWidth(text, font) <= room) return text;
  let s = text;
  while (s.length > 1 && textWidth(`${s}…`, font) > room) s = s.slice(0, -1);
  return `${s.trimEnd()}…`;
}

const ChartBody = memo(function ChartBody({
  analysis,
  laps,
  colors,
  lay,
  focusId,
  selected,
}: {
  analysis: Analysis;
  laps: AlignedLap[];
  colors: Map<string, Rgb>;
  lay: Layout;
  focusId: string | null;
  selected: number | null;
}) {
  // A memo: the language is a reason to draw again too.
  useLang();
  const grid = analysis.alignment.grid;
  const step = grid[1] - grid[0];
  const where = focusId ? analysis.where.get(focusId) : undefined;
  const scale = where ? mapScale(where) : 1;
  const findings = analysis.findings.filter((f) => f.lapId === focusId && f.outcome === 'loss');
  const sel = selected !== null ? analysis.findings[selected] : null;
  const top = lay.rows[0].top;
  const bottom = lay.height - AXIS;
  const selBand = sel ? band(lay, sel.from * step, sel.to * step) : null;
  const stride = Math.max(1, Math.floor((lay.i1 - lay.i0 + 1) / lay.width));
  return (
    <g>
      {/* Corner bands and names. */}
      {analysis.corners.map((c) => {
        const b = band(lay, c.entry * step, c.exit * step);
        const apex = c.apex * step;
        return (
          <g key={c.number}>
            {b && (
              <rect x={b.x} y={top} width={b.w} height={bottom - top} className="corner-band" />
            )}
            {apex >= lay.win[0] && apex <= lay.win[1] && (
              <text x={lay.x(apex)} y={bottom + 11} className="axis-text" textAnchor="middle">
                {t('race.corner.one', { n: c.number })}
              </text>
            )}
          </g>
        );
      })}
      {sel && selBand && (
        <rect
          x={selBand.x}
          y={top}
          width={selBand.w}
          height={bottom - top}
          fill={rgbCss(CAUSE_COLORS[causeGroup(sel)])}
          opacity={0.16}
        />
      )}
      {/* The two maps, as strips: where time goes, and why. */}
      {where && (
        <g>
          <text x={LEFT - 6} y={lay.stripsTop + STRIP - 1} className="axis-text" textAnchor="end">
            {t('race.ui.chart.timeStrip')}
          </text>
          {Array.from({ length: Math.ceil((lay.i1 - lay.i0 + 1) / stride) }, (_, k) => {
            const i = lay.i0 + k * stride;
            const v = where[i];
            if (!Number.isFinite(v)) return null;
            const j = Math.min(grid.length - 1, i + stride);
            return (
              <rect
                key={i}
                x={lay.x(grid[i])}
                y={lay.stripsTop}
                width={Math.max(1, lay.x(grid[j]) - lay.x(grid[i]) + 0.5)}
                height={STRIP}
                fill={rgbCss(deltaColor(v, scale))}
              />
            );
          })}
          <text
            x={LEFT - 6}
            y={lay.stripsTop + STRIP * 2 + 1}
            className="axis-text"
            textAnchor="end"
          >
            {t('race.ui.chart.causeStrip')}
          </text>
          <rect
            x={LEFT}
            y={lay.stripsTop + STRIP + 2}
            width={lay.width - LEFT - RIGHT}
            height={STRIP}
            className="strip-bg"
          />
          {findings.map((f, k) => {
            const b = band(lay, f.from * step, f.to * step);
            if (!b) return null;
            return (
              <rect
                key={k}
                x={b.x}
                y={lay.stripsTop + STRIP + 2}
                width={Math.max(2, b.w)}
                height={STRIP}
                fill={rgbCss(CAUSE_COLORS[causeGroup(f)])}
              >
                <title>{t('race.ui.chart.findingTitle', { title: f.title, cost: num(f.cost, 2) })}</title>
              </rect>
            );
          })}
        </g>
      )}
      {lay.rows.map(({ row, top: rowTop, height, y, range }) => {
        // The row's name and its top value share a line; a name too long for
        // that - a long word in another language - pushes the value a line
        // down where the row is tall enough, and is cut where it is not.
        const top = height >= 26 ? row.format(range[1]) : '';
        const beside = LEFT - 6 - 8 - 6 - (top ? textWidth(top, '9.5px ui-monospace, Consolas, monospace') : 0);
        const below = !!top && height >= 34 && textWidth(row.label, '550 11px Inter, system-ui, sans-serif') > beside;
        return (
          <g key={row.key}>
            <text x={8} y={rowTop + Math.min(11, height - 2)} className="row-label">
              {fitLabel(row.label, below ? LEFT - 6 - 8 : beside)}
              <title>{row.label}</title>
            </text>
            {top && (
              <text x={LEFT - 6} y={rowTop + (below ? 21 : 9)} className="axis-text" textAnchor="end">
                {top}
              </text>
            )}
            <text x={LEFT - 6} y={rowTop + height} className="axis-text" textAnchor="end">
              {row.format(range[0])}
            </text>
            <line
              x1={LEFT}
              x2={lay.width - RIGHT}
              y1={rowTop + height + 0.5}
              y2={rowTop + height + 0.5}
              className="grid-line"
            />
            {range[0] < 0 && range[1] > 0 && (
              <line x1={LEFT} x2={lay.width - RIGHT} y1={y(0)} y2={y(0)} className="zero-line" />
            )}
            {laps.map((l) =>
              row.skipRef && l.lap === analysis.alignment.reference ? null : (
                <path
                  key={l.lap.id}
                  d={pathFor(l, row, lay, y, grid)}
                  fill="none"
                  stroke={rgbCss(colors.get(l.lap.id)!)}
                  strokeWidth={l.lap.id === focusId ? 2 : 1.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={l.lap.id === focusId || l.lap === analysis.alignment.reference ? 1 : 0.75}
                />
              ),
            )}
          </g>
        );
      })}
    </g>
  );
});

/**
 * Where each car is on the charts: at the cursor while there is one, else
 * where the replay has it - a line through every row, and a dot per car on
 * the speed and input rows.
 */
function Cursor({
  analysis,
  lay,
  colors,
  laps,
}: {
  analysis: Analysis;
  lay: Layout;
  colors: Map<string, Rgb>;
  laps: AlignedLap[];
}) {
  const clock = useSyncExternalStore(raceClock.subscribe, raceClock.snapshot);
  const hover = useSyncExternalStore(raceHover.subscribe, raceHover.snapshot);
  const mode = useRaceStore((st) => st.replay.mode);
  const offsets = useRaceStore((st) => st.offsets);
  const grid = analysis.alignment.grid;
  const step = grid[1] - grid[0];
  const ref = analysis.alignment.laps.find((l) => l.lap === analysis.alignment.reference)!;
  const s = hover ?? distanceAt(ref.channels.time, grid, clock);
  const top = lay.rows[0].top;
  const bottom = lay.height - AXIS;
  const inWin = (v: number) => v >= lay.win[0] && v <= lay.win[1];
  // A dot per car on every graph but the gap, which is a difference, not a reading.
  const dotted = lay.rows.filter((r) => r.row.key !== GAP);
  return (
    <g pointerEvents="none">
      {inWin(s) && (
        <line
          x1={lay.x(s)}
          x2={lay.x(s)}
          y1={top}
          y2={bottom}
          className={hover !== null ? 'hover-line' : 'cursor-line'}
        />
      )}
      {laps.map((l) => {
        // At the cursor, or held side by side, every car is at the same metre.
        const own =
          hover !== null || mode === 'locked'
            ? s
            : distanceAt(
                l.channels.time,
                grid,
                clock + (mode === 'anchor' ? (offsets.get(l.lap.id) ?? 0) : 0),
              );
        if (!inWin(own)) return null;
        const i = Math.max(l.first, Math.min(l.last, Math.round(own / step)));
        return dotted.map((r) => {
          const v = r.row.value(l, i);
          if (!Number.isFinite(v)) return null;
          return (
            <circle
              key={`${l.lap.id}-${r.row.key}`}
              cx={lay.x(own)}
              cy={r.y(v)}
              r={r.row.key === 'speed' ? 4 : 3}
              fill={rgbCss(colors.get(l.lap.id)!)}
              className="cursor-dot"
            />
          );
        });
      })}
    </g>
  );
}

function Charts() {
  const analysis = useRaceStore((s) => s.analysis);
  const lapsAll = useRaceStore((s) => s.laps);
  const hidden = useRaceStore((s) => s.hidden);
  const focusId = useRaceStore((s) => s.focusId);
  const selected = useRaceStore((s) => s.selected);
  const lang = useLang();
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 800, height: 280 });
  const [hover, setHover] = useState<{ px: number; s: number } | null>(null);
  const [zoom, setZoom] = useState<Window | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);
  // The cursor belongs to the charts: it goes when they do.
  useEffect(() => () => raceHover.set(null), []);
  const colors = useMemo(() => lapColors({ laps: lapsAll }), [lapsAll]);
  const drawn = useMemo(
    () => (analysis ? analysis.alignment.laps.filter((l) => !hidden[l.lap.id]) : []),
    [analysis, hidden],
  );
  // A chart of dozens of laps is unreadable, and a browser takes seconds over
  // every frame of it: the lap looked at, what it is compared with and the
  // reference first, up to `CHART_LAPS`.
  const laps = useMemo(() => {
    if (!analysis || drawn.length <= CHART_LAPS) return drawn;
    const focus = lapsAll.find((l) => l.id === focusId);
    const first = new Set([focusId, focus && analysis.classBest.get(classOf(focus)), analysis.alignment.reference.id]);
    return [...drawn.filter((l) => first.has(l.lap.id)), ...drawn.filter((l) => !first.has(l.lap.id))].slice(0, CHART_LAPS);
  }, [analysis, drawn, focusId, lapsAll]);
  const picked = useRaceStore((s) => s.view.graphs);
  // The channels' names are in the user's language: built again when it changes.
  const catalog = useMemo(() => lapCatalog(laps), [laps, lang]);
  const graphIds = useMemo(() => picked ?? defaultGraphs(laps), [picked, laps]);
  const rows = useMemo(() => graphRows(graphIds, catalog), [graphIds, catalog]);
  const length = analysis ? analysis.alignment.grid[analysis.alignment.grid.length - 1] || 1 : 1;
  const w0 = zoom ? zoom[0] : 0;
  const w1 = zoom ? zoom[1] : length;
  const legendH = 20;
  const lay = useMemo(
    () =>
      analysis
        ? layoutFor(analysis, laps, rows, size.width, Math.max(120, size.height - legendH), [
            w0,
            w1,
          ])
        : null,
    [analysis, laps, rows, size, w0, w1],
  );

  // The wheel walks the replay along the lap; Ctrl+wheel zooms the distance
  // axis about the pointer; a sideways wheel pans. A native listener, because
  // React's wheel handler is passive and cannot stop the page scrolling.
  useEffect(() => {
    const el = svg.current;
    if (!el || !analysis || !lay) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      const span = w1 - w0;
      if (e.ctrlKey || e.metaKey) {
        const at = lay.s(px);
        const next = Math.max(40, Math.min(length, span * (e.deltaY > 0 ? 1.25 : 0.8)));
        const lo = Math.max(0, Math.min(length - next, at - (at - w0) * (next / span)));
        setZoom(next >= length ? null : [lo, lo + next]);
        return;
      }
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (!zoom) return;
        const lo = Math.max(0, Math.min(length - span, w0 + (e.deltaX / 100) * span * 0.1));
        setZoom([lo, lo + span]);
        return;
      }
      // One notch: a two-hundredth of what is on screen, five with Shift.
      const ref = analysis.alignment.laps.find((l) => l.lap === analysis.alignment.reference)!;
      const now = distanceAt(ref.channels.time, analysis.alignment.grid, raceClock.time);
      const next = Math.max(
        0,
        Math.min(length, now + Math.sign(e.deltaY) * (span / 200) * (e.shiftKey ? 5 : 1)),
      );
      useRaceStore.getState().patchReplay({ playing: false });
      raceHover.set(null);
      setHover(null);
      seekToDistance(next);
      // Keep the cursor on screen when zoomed in.
      if (zoom && (next < w0 || next > w1)) {
        const lo = Math.max(0, Math.min(length - span, next - span / 2));
        setZoom([lo, lo + span]);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [analysis, lay, w0, w1, zoom, length]);

  if (!analysis || !lay)
    return (
      <div ref={box} className="race-charts empty">
        {t('race.ui.chart.empty')}
      </div>
    );
  const step = analysis.alignment.grid[1] - analysis.alignment.grid[0];
  const hi = hover ? Math.round(hover.s / step) : -1;

  return (
    <div ref={box} className="race-charts">
      <div className="chart-legend">
        {laps.map((l) => (
          <span key={l.lap.id}>
            <LineKey color={rgbCss(colors.get(l.lap.id)!)} />
            {l.lap === analysis.alignment.reference
              ? t('race.ui.chart.legendReference', { name: l.lap.label })
              : l.lap.label}
          </span>
        ))}
        {drawn.length > laps.length && (
          <span className="chart-more" title={t('race.ui.chart.moreTitle')}>
            {t('race.ui.chart.more', { count: drawn.length - laps.length })}
          </span>
        )}
        <GraphPicker catalog={catalog} ids={graphIds} laps={laps} />
        {zoom && (
          <button className="link" onClick={() => setZoom(null)}>
            {t('race.ui.chart.wholeLap')}
          </button>
        )}
        <span className="hint">{t('race.ui.chart.hint')}</span>
      </div>
      <svg
        ref={svg}
        className="plot"
        width={lay.width}
        height={lay.height}
        onPointerMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = e.clientX - r.left;
          if (px >= LEFT && px <= lay.width - RIGHT) {
            const at = lay.s(px);
            setHover({ px, s: at });
            raceHover.set(at);
          } else {
            setHover(null);
            raceHover.set(null);
          }
        }}
        onPointerLeave={() => {
          setHover(null);
          raceHover.set(null);
        }}
        onDoubleClick={() => setZoom(null)}
        onClick={(e) => {
          if (!hover) return;
          if (e.shiftKey) lineUpAt(hover.s);
          else seekToDistance(hover.s);
        }}
      >
        <ChartBody
          analysis={analysis}
          laps={laps}
          colors={colors}
          lay={lay}
          focusId={focusId}
          selected={selected}
        />
        <Cursor analysis={analysis} lay={lay} colors={colors} laps={laps} />
      </svg>
      {hover && hi >= 0 && (
        <div
          className="chart-tip"
          style={{ left: hover.px + 340 > lay.width ? hover.px - 340 : hover.px + 14, top: 24 }}
        >
          <div className="tip-head mono">{t('race.ui.chart.at', { m: int(hover.s) })}</div>
          <table className="mono">
            <thead>
              <tr>
                <th />
                {rows.map((r) => (
                  <th key={r.key}>{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {laps.map((l) => (
                <tr key={l.lap.id}>
                  <td>
                    <LineKey color={rgbCss(colors.get(l.lap.id)!)} />
                  </td>
                  {rows.map((r) => {
                    const v = r.value(l, hi);
                    return (
                      <td key={r.key}>
                        {r.skipRef && l.lap === analysis.alignment.reference
                          ? t('race.ui.chart.ref')
                          : Number.isFinite(v)
                            ? r.format(v)
                            : '–'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Which graphs to show: every channel the laps carry, grouped as the channel
 * table groups them, a checkbox each - a per-wheel channel a chip per wheel.
 * Opens upwards over the view, where there is room.
 */
function GraphPicker({
  catalog,
  ids,
  laps,
}: {
  catalog: ChannelEntry[];
  ids: string[];
  laps: AlignedLap[];
}) {
  const [open, setOpen] = useState<{ left: number; bottom: number } | null>(null);
  const [filter, setFilter] = useState('');
  const patchView = useRaceStore((s) => s.patchView);
  const chosen = new Set(ids);
  const toggle = (id: string) => {
    const next = chosen.has(id) ? ids.filter((x) => x !== id) : [...ids, id];
    // Keep the table's order, whatever order they were ticked in.
    const order = [GAP, ...catalog.map((e) => e.id)];
    next.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    patchView({ graphs: next });
  };
  const needle = filter.trim().toLowerCase();
  const gap = t('race.ui.graphPicker.gap');
  const shown = catalog.filter(
    (e) => !needle || e.label.toLowerCase().includes(needle) || e.id.toLowerCase().includes(needle),
  );
  // Per-wheel channels as one line with a chip per wheel.
  const families = new Map<string, ChannelEntry[]>();
  const lines: (ChannelEntry | ChannelEntry[])[] = [];
  for (const e of shown) {
    if (!e.wheel) {
      lines.push(e);
      continue;
    }
    let list = families.get(e.family);
    if (!list) {
      families.set(e.family, (list = []));
      lines.push(list);
    }
    list.push(e);
  }
  const groupOf = (x: ChannelEntry | ChannelEntry[]) =>
    Array.isArray(x) ? x[0].info.group : x.info.group;
  return (
    <>
      <button
        className="link"
        onClick={(ev) => {
          const r = (ev.currentTarget as HTMLElement).getBoundingClientRect();
          setOpen(open ? null : { left: r.left, bottom: window.innerHeight - r.top + 6 });
        }}
        title={t('race.ui.graphPicker.title')}
      >
        {t('race.ui.graphPicker.open', { count: int(ids.length) })}
      </button>
      {open && (
        <div className="graph-picker" style={{ left: open.left, bottom: open.bottom }}>
          <div className="picker-head">
            <input
              placeholder={t('race.ui.graphPicker.filter')}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              autoFocus
            />
            <button
              className="link"
              onClick={() => patchView({ graphs: null })}
              title={t('race.ui.graphPicker.defaultsTitle', { count: defaultGraphs(laps).length })}
            >
              {t('race.ui.graphPicker.defaults')}
            </button>
            <button className="link" onClick={() => setOpen(null)}>
              {t('race.ui.graphPicker.close')}
            </button>
          </div>
          <div className="picker-body">
            {(!needle || 'gap'.includes(needle) || gap.toLowerCase().includes(needle)) && (
              <label className="check">
                <input type="checkbox" checked={chosen.has(GAP)} onChange={() => toggle(GAP)} />
                {gap}
              </label>
            )}
            {GROUPS.map((group) => {
              const inGroup = lines.filter((x) => groupOf(x) === group);
              if (!inGroup.length) return null;
              return (
                <div key={group} className="picker-group">
                  <div className="picker-title">{groupLabel(group)}</div>
                  {inGroup.map((x) =>
                    Array.isArray(x) ? (
                      <div key={x[0].family} className="picker-wheels">
                        <span>{x[0].info.label}</span>
                        {WHEELS.map((w) => {
                          const e = x.find((y) => y.wheel === w);
                          if (!e) return null;
                          return (
                            <button
                              key={w}
                              className={`chip-toggle${chosen.has(e.id) ? ' on' : ''}`}
                              onClick={() => toggle(e.id)}
                            >
                              {wheelName(w)}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <label key={x.id} className="check" title={x.id}>
                        <input
                          type="checkbox"
                          checked={chosen.has(x.id)}
                          onChange={() => toggle(x.id)}
                        />
                        {x.label}
                      </label>
                    ),
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export function RaceBar() {
  const charts = useRaceStore((s) => s.view.charts);
  return (
    <div className="race-bar">
      <Transport />
      {charts && <Charts />}
    </div>
  );
}
