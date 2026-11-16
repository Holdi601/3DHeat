/**
 * The Compare panel's charts, drawn as SVG from the aggregated result only
 * (never a row): bars and columns (grouped, stacked, 100%), lines and areas
 * over a dimension, pies and donuts, and scatter or bubble plots.
 *
 * Colours follow the entity (a group keeps its slot whatever the filter or
 * the sort), from a palette checked for colour-blind separation on the panel's
 * surface; every mark is also named by a legend, a label or its tooltip.
 * Marks move with the shared motion module (`ui/motion.ts`): bars grow, lines
 * draw themselves, slices sweep, and a change of data morphs the old marks
 * into the new; with motion off they are simply there.
 *
 * Colours are written as values, not CSS variables, so an exported SVG or PNG
 * looks as it does in the panel.
 */

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTween } from '../motion';

/** The panel's surface and inks. */
export const INK = { surface: '#14171c', text: '#dfe4ec', dim: '#8d96a5', faint: '#616b7a', grid: '#262c35', good: '#46d17f', bad: '#ff5d5d' };

/**
 * Eight categorical slots for the dark surface, in a fixed order (validated:
 * CVD separation of neighbours >= 8.4, normal vision >= 19, all >= 3:1 on
 * #14171c). A ninth series folds into "other".
 */
export const PALETTE = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#0ca30c', '#9085e9', '#e66767'];
export const OTHER_COLOR = '#6b7280';

export interface Cell {
  v: number;
  lo?: number;
  hi?: number;
}

export interface Ent {
  key: string;
  label: string;
  color: string;
}

export interface ChartData {
  cats: Ent[];
  series: Ent[];
  get: (cat: string, ser: string) => Cell | null;
  fmt: (v: number) => string;
  /** One series: each mark wears its category's colour. */
  catColor?: boolean;
}

export interface ChartEvents {
  /** Hovered: the tooltip's lines at the pointer, or null to hide. */
  tip: (e: React.MouseEvent | null, lines?: string[]) => void;
  /** Clicked: filter the view to it. */
  pick: (cat: string | null, ser: string | null) => void;
  /** The focused entity (a series or a category), the others dimmed. */
  focus: string | null;
}

export function useWidth(min = 240): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(min, Math.floor(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [min]);
  return [ref, w];
}

/** Round ticks covering [lo, hi]. */
export function niceTicks(lo: number, hi: number, n = 5): number[] {
  if (!(hi > lo)) {
    if (lo === hi && Number.isFinite(lo)) return lo === 0 ? [0, 1] : [Math.min(0, lo), Math.max(0, lo)];
    return [0, 1];
  }
  const raw = (hi - lo) / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.floor(lo / step) * step; out.length < 64; v += step) {
    out.push(+v.toPrecision(12));
    if (v >= hi - step * 1e-9) break;
  }
  return out;
}

const fin = (v: number | undefined): v is number => v !== undefined && Number.isFinite(v);
const dimmed = (focus: string | null, ...keys: string[]) => (focus && !keys.includes(focus) ? 0.28 : 1);

/** A legend: one chip per series, a click focuses it. */
export function Legend({ items, focus, onFocus }: { items: Ent[]; focus: string | null; onFocus: (k: string | null) => void }) {
  if (items.length < 2) return null;
  return (
    <div className="vs-legend" role="list">
      {items.map((it) => (
        <button key={it.key} role="listitem" className={`vs-chip${focus === it.key ? ' on' : ''}`} style={{ opacity: dimmed(focus, it.key) }} onClick={() => onFocus(focus === it.key ? null : it.key)}>
          <i style={{ background: it.color }} />
          {it.label}
        </button>
      ))}
    </div>
  );
}

function YAxis({ ticks, y, x0, x1, fmt }: { ticks: number[]; y: (v: number) => number; x0: number; x1: number; fmt: (v: number) => string }) {
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x0} x2={x1} y1={y(t)} y2={y(t)} stroke={t === 0 ? INK.faint : INK.grid} strokeWidth={1} />
          <text x={x0 - 6} y={y(t)} dy="0.32em" textAnchor="end" fill={INK.dim} fontSize={10}>
            {fmt(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

function clip(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

// ---------------------------------------------------------------------------
// Bars and columns

export type BarMode = 'grouped' | 'stacked' | 'percent';

export function BarChart({ data, ev, horizontal, mode, height = 260 }: { data: ChartData; ev: ChartEvents; horizontal: boolean; mode: BarMode; height?: number }) {
  const [ref, W] = useWidth();
  const { cats, series } = data;
  const target = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cats)
      for (const s of series) {
        const cell = data.get(c.key, s.key);
        m.set(`${c.key}\u0001${s.key}`, cell && fin(cell.v) ? cell.v : 0);
      }
    return m;
  }, [cats, series, data]);
  const tw = useTween(target);
  const val = (c: string, s: string) => tw.get(`${c}\u0001${s}`)?.v ?? 0;
  // Extent from the targets (not the tween), so the axis does not swim.
  let lo = 0;
  let hi = 0;
  for (const c of cats) {
    let pos = 0;
    let neg = 0;
    for (const s of series) {
      const cell = data.get(c.key, s.key);
      const v = cell && fin(cell.v) ? cell.v : 0;
      if (mode === 'grouped') {
        lo = Math.min(lo, v, fin(cell?.lo) ? cell!.lo! : v);
        hi = Math.max(hi, v, fin(cell?.hi) ? cell!.hi! : v);
      } else if (v >= 0) pos += v;
      else neg += v;
    }
    if (mode === 'stacked') {
      hi = Math.max(hi, pos);
      lo = Math.min(lo, neg);
    }
  }
  if (mode === 'percent') {
    lo = 0;
    hi = 1;
  }
  const ticks = niceTicks(lo, hi);
  const vlo = Math.min(lo, ticks[0]);
  const vhi = Math.max(hi, ticks[ticks.length - 1]);
  const fmtAxis = mode === 'percent' ? (v: number) => `${Math.round(v * 100)}%` : data.fmt;
  const labelW = horizontal ? Math.min(160, Math.max(60, Math.max(...cats.map((c) => c.label.length)) * 6.2)) : 46;
  const H = horizontal ? Math.max(height, cats.length * Math.max(18, series.length * (mode === 'grouped' ? 12 : 0) + 14) + 40) : height;
  const pad = { l: labelW + 8, r: 16, t: 10, b: horizontal ? 24 : 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const len = horizontal ? plotW : plotH;
  const scale = (v: number) => ((v - vlo) / (vhi - vlo || 1)) * len;
  const band = (horizontal ? plotH : plotW) / Math.max(1, cats.length);
  const inner = band * (cats.length > 1 ? 0.78 : 0.6);
  const sub = mode === 'grouped' ? inner / Math.max(1, series.length) : inner;
  const marks: ReactNode[] = [];
  cats.forEach((c, ci) => {
    let pos = 0;
    let neg = 0;
    let total = 0;
    if (mode === 'percent') for (const s of series) total += Math.abs(val(c.key, s.key));
    series.forEach((s, si) => {
      let v = val(c.key, s.key);
      if (mode === 'percent') v = total > 0 ? Math.abs(v) / total : 0;
      const a = tw.get(`${c.key}\u0001${s.key}`)?.a ?? 1;
      let from = 0;
      let to = v;
      if (mode !== 'grouped') {
        if (v >= 0) {
          from = pos;
          to = pos + v;
          pos = to;
        } else {
          from = neg;
          to = neg + v;
          neg = to;
        }
      }
      const off = ci * band + (band - inner) / 2 + (mode === 'grouped' ? si * sub : 0);
      const p0 = scale(Math.min(from, to));
      const p1 = scale(Math.max(from, to));
      const gap = mode === 'grouped' ? Math.min(2, sub * 0.15) : 0;
      const thick = Math.max(1, sub - gap);
      // A 2px surface gap between stacked fills.
      const seg = mode !== 'grouped' && p1 - p0 > 3 ? 1 : 0;
      const x = horizontal ? pad.l + p0 + seg : pad.l + off;
      const y = horizontal ? pad.t + off : pad.t + plotH - p1 + seg;
      const w = horizontal ? Math.max(0, p1 - p0 - seg * 2) : thick;
      const h = horizontal ? thick : Math.max(0, p1 - p0 - seg * 2);
      const cell = data.get(c.key, s.key);
      const op = a * dimmed(ev.focus, s.key, c.key);
      const lines = [series.length > 1 ? `${c.label} · ${s.label}` : c.label, cell && fin(cell.v) ? data.fmt(cell.v) : '—'];
      if (cell && fin(cell.lo) && fin(cell.hi)) lines.push(`95%: ${data.fmt(cell.lo)} – ${data.fmt(cell.hi)}`);
      if (mode === 'percent') lines.push(`${(v * 100).toFixed(1)}%`);
      marks.push(
        <g key={`${c.key}|${s.key}`} opacity={op} onMouseMove={(e) => ev.tip(e, lines)} onMouseLeave={() => ev.tip(null)} onClick={() => ev.pick(c.key, s.key)} style={{ cursor: 'pointer' }}>
          <rect x={x} y={y} width={w} height={h} rx={Math.min(3, thick / 3)} fill={data.catColor ? c.color : s.color} />
          {/* A hit target larger than the mark. */}
          <rect x={horizontal ? pad.l : x - 1} y={horizontal ? y - 1 : pad.t} width={horizontal ? plotW : w + 2} height={horizontal ? h + 2 : plotH} fill="transparent" />
          {mode === 'grouped' && cell && fin(cell.lo) && fin(cell.hi) && a > 0.9 && (
            horizontal ? (
              <line x1={pad.l + scale(cell.lo)} x2={pad.l + scale(cell.hi)} y1={y + h / 2} y2={y + h / 2} stroke={INK.text} strokeWidth={1.2} opacity={0.75} />
            ) : (
              <line x1={x + w / 2} x2={x + w / 2} y1={pad.t + plotH - scale(cell.lo)} y2={pad.t + plotH - scale(cell.hi)} stroke={INK.text} strokeWidth={1.2} opacity={0.75} />
            )
          )}
        </g>,
      );
    });
  });
  const axis = horizontal ? (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l + scale(t)} x2={pad.l + scale(t)} y1={pad.t} y2={pad.t + plotH} stroke={t === 0 ? INK.faint : INK.grid} />
          <text x={pad.l + scale(t)} y={pad.t + plotH + 14} textAnchor="middle" fill={INK.dim} fontSize={10}>
            {fmtAxis(t)}
          </text>
        </g>
      ))}
      {cats.map((c, ci) => (
        <text key={c.key} x={pad.l - 6} y={pad.t + ci * band + band / 2} dy="0.32em" textAnchor="end" fill={INK.text} fontSize={11} opacity={dimmed(ev.focus, c.key)}>
          {clip(c.label, Math.floor(labelW / 6.2))}
        </text>
      ))}
    </g>
  ) : (
    <g>
      <YAxis ticks={ticks} y={(v) => pad.t + plotH - scale(v)} x0={pad.l} x1={pad.l + plotW} fmt={fmtAxis} />
      {cats.map((c, ci) => {
        const every = Math.max(1, Math.ceil((cats.length * 54) / plotW));
        if (ci % every) return null;
        return (
          <text key={c.key} x={pad.l + ci * band + band / 2} y={pad.t + plotH + 14} textAnchor="middle" fill={INK.text} fontSize={10} opacity={dimmed(ev.focus, c.key)}>
            {clip(c.label, Math.max(4, Math.floor((band * every) / 6.2)))}
          </text>
        );
      })}
    </g>
  );
  return (
    <div ref={ref} className="vs-chart">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img">
        {axis}
        {marks}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lines and areas over a dimension (the categories are the x positions, in order)

export function LineChart({ data, ev, area, stacked, height = 260 }: { data: ChartData; ev: ChartEvents; area: boolean; stacked: boolean; height?: number }) {
  const [ref, W] = useWidth();
  const { cats, series } = data;
  const target = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of series) {
      m.set(`\u0002${s.key}`, 1);
      for (const c of cats) {
        const cell = data.get(c.key, s.key);
        m.set(`${c.key}\u0001${s.key}`, cell && fin(cell.v) ? cell.v : NaN);
      }
    }
    return m;
  }, [cats, series, data]);
  // NaN cannot tween: hold gaps out of the tween, and draw them as breaks.
  const finiteTarget = useMemo(() => new Map([...target].map(([k, v]) => [k, Number.isFinite(v) ? v : 0])), [target]);
  const tw = useTween(finiteTarget, { stagger: false });
  let lo = 0;
  let hi = 0;
  const stack = new Map<string, number>();
  for (const c of cats) {
    let acc = 0;
    for (const s of series) {
      const v = target.get(`${c.key}\u0001${s.key}`)!;
      if (!Number.isFinite(v)) continue;
      if (stacked) {
        acc += v;
        hi = Math.max(hi, acc);
        lo = Math.min(lo, acc);
      } else {
        hi = Math.max(hi, v);
        lo = Math.min(lo, v);
      }
    }
    stack.set(c.key, acc);
  }
  const ticks = niceTicks(lo, hi);
  const vlo = Math.min(lo, ticks[0]);
  const vhi = Math.max(hi, ticks[ticks.length - 1]);
  const pad = { l: 54, r: 14, t: 10, b: 36 };
  const plotW = W - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (cats.length > 1 ? (i / (cats.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => pad.t + plotH - ((v - vlo) / (vhi - vlo || 1)) * plotH;
  const [hover, setHover] = useState<number | null>(null);
  const base = new Array(cats.length).fill(0);
  const paths = series.map((s) => {
    const a = tw.get(`\u0002${s.key}`)?.a ?? 1;
    const pts: { i: number; v: number; b: number }[] = [];
    cats.forEach((c, i) => {
      const raw = target.get(`${c.key}\u0001${s.key}`)!;
      if (!Number.isFinite(raw)) return;
      const v = tw.get(`${c.key}\u0001${s.key}`)?.v ?? raw;
      const b = stacked ? base[i] : 0;
      pts.push({ i, v: v + b, b });
      if (stacked) base[i] += v;
    });
    // Breaks where a value is missing.
    let d = '';
    let prev = -2;
    for (const p of pts) {
      d += `${p.i === prev + 1 ? 'L' : 'M'}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`;
      prev = p.i;
    }
    let fill = '';
    if (area && pts.length > 1) {
      fill = `M${x(pts[0].i)},${y(pts[0].b)}` + pts.map((p) => `L${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join('') + [...pts].reverse().map((p) => `L${x(p.i).toFixed(1)},${y(p.b).toFixed(1)}`).join('') + 'Z';
    }
    return { s, d, fill, a, pts };
  });
  const every = Math.max(1, Math.ceil((cats.length * 48) / plotW));
  return (
    <div ref={ref} className="vs-chart">
      <svg
        width={W}
        height={height}
        viewBox={`0 0 ${W} ${height}`}
        role="img"
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const i = cats.length > 1 ? Math.round(((e.clientX - r.left - pad.l) / plotW) * (cats.length - 1)) : 0;
          if (i < 0 || i >= cats.length) {
            setHover(null);
            ev.tip(null);
            return;
          }
          setHover(i);
          const c = cats[i];
          ev.tip(e, [c.label, ...series.map((s) => {
            const cell = data.get(c.key, s.key);
            return `${s.label}: ${cell && fin(cell.v) ? data.fmt(cell.v) : '—'}`;
          })]);
        }}
        onMouseLeave={() => {
          setHover(null);
          ev.tip(null);
        }}
        onClick={() => hover !== null && ev.pick(cats[hover].key, null)}
        style={{ cursor: 'crosshair' }}
      >
        <YAxis ticks={ticks} y={y} x0={pad.l} x1={pad.l + plotW} fmt={data.fmt} />
        {cats.map((c, i) =>
          i % every ? null : (
            <text key={c.key} x={x(i)} y={pad.t + plotH + 14} textAnchor="middle" fill={INK.dim} fontSize={10}>
              {clip(c.label, 10)}
            </text>
          ),
        )}
        {area &&
          paths.map(({ s, fill, a }) => (fill ? <path key={`f${s.key}`} d={fill} fill={s.color} opacity={0.22 * a * dimmed(ev.focus, s.key)} stroke="none" /> : null))}
        {paths.map(({ s, d, a }) => (
          // Drawn in: the dash's offset runs from the whole length to none.
          <path key={s.key} d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - a} opacity={dimmed(ev.focus, s.key)} />
        ))}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + plotH} stroke={INK.faint} strokeDasharray="3 3" />
            {paths.map(({ s, pts }) => {
              const p = pts.find((q) => q.i === hover);
              return p ? <circle key={s.key} cx={x(p.i)} cy={y(p.v)} r={4} fill={s.color} stroke={INK.surface} strokeWidth={2} /> : null;
            })}
          </g>
        )}
        {/* Direct labels for up to four series, at their last point. */}
        {series.length <= 4 &&
          paths.map(({ s, pts, a }) => {
            const p = pts[pts.length - 1];
            if (!p || a < 0.95) return null;
            return (
              <text key={`l${s.key}`} x={Math.min(x(p.i) + 4, W - 4)} y={y(p.v) - 6} textAnchor={x(p.i) > W - 60 ? 'end' : 'start'} fill={INK.text} fontSize={10}>
                {clip(s.label, 14)}
              </text>
            );
          })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pie and donut

export function PieChart({ slices, ev, donut, fmt, size = 220, title }: { slices: (Ent & { v: number })[]; ev: ChartEvents; donut: boolean; fmt: (v: number) => string; size?: number; title?: string }) {
  const target = useMemo(() => {
    const m = new Map<string, number>([['\u0002sweep', 1]]);
    for (const s of slices) m.set(s.key, Math.max(0, Number.isFinite(s.v) ? s.v : 0));
    return m;
  }, [slices]);
  const tw = useTween(target, { stagger: false });
  const sweep = tw.get('\u0002sweep')?.v ?? 1;
  const keys = [...tw.keys()].filter((k) => k !== '\u0002sweep');
  let total = 0;
  for (const k of keys) total += tw.get(k)!.v;
  const R = size / 2 - 6;
  const r0 = donut ? R * 0.58 : 0;
  const cx = size / 2;
  const cy = size / 2;
  let ang = -Math.PI / 2;
  const trueTotal = slices.reduce((a, s) => a + Math.max(0, Number.isFinite(s.v) ? s.v : 0), 0);
  const arcs = keys.map((k) => {
    const s = slices.find((x) => x.key === k);
    const v = tw.get(k)!.v;
    const span = total > 0 ? (v / total) * Math.PI * 2 * sweep : 0;
    const a0 = ang;
    const a1 = ang + span;
    ang = a1;
    const large = span > Math.PI ? 1 : 0;
    const p = (a: number, r: number) => `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`;
    const d =
      span >= Math.PI * 2 - 1e-6
        ? donut
          ? `M${p(0, R)}A${R},${R} 0 1 1 ${p(Math.PI, R)}A${R},${R} 0 1 1 ${p(0, R)}M${p(0, r0)}A${r0},${r0} 0 1 0 ${p(Math.PI, r0)}A${r0},${r0} 0 1 0 ${p(0, r0)}Z`
          : `M${p(0, R)}A${R},${R} 0 1 1 ${p(Math.PI, R)}A${R},${R} 0 1 1 ${p(0, R)}Z`
        : donut
          ? `M${p(a0, R)}A${R},${R} 0 ${large} 1 ${p(a1, R)}L${p(a1, r0)}A${r0},${r0} 0 ${large} 0 ${p(a0, r0)}Z`
          : `M${cx},${cy}L${p(a0, R)}A${R},${R} 0 ${large} 1 ${p(a1, R)}Z`;
    return { k, s, d, mid: (a0 + a1) / 2, span };
  });
  return (
    <div className="vs-pie">
      {title && <div className="vs-mtitle">{title}</div>}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        {arcs.map(({ k, s, d, span, mid }) => {
          if (!s || span <= 0) return null;
          const share = trueTotal > 0 ? s.v / trueTotal : 0;
          return (
            <g key={k} opacity={dimmed(ev.focus, k)} style={{ cursor: 'pointer' }} onMouseMove={(e) => ev.tip(e, [s.label, fmt(s.v), `${(share * 100).toFixed(1)}%`])} onMouseLeave={() => ev.tip(null)} onClick={() => ev.pick(k, null)}>
              {/* A 2px surface ring between slices. */}
              <path d={d} fill={s.color} stroke={INK.surface} strokeWidth={2} strokeLinejoin="round" />
              {span > 0.35 && share >= 0.06 && (
                <text x={cx + Math.cos(mid) * (donut ? (R + r0) / 2 : R * 0.62)} y={cy + Math.sin(mid) * (donut ? (R + r0) / 2 : R * 0.62)} dy="0.32em" textAnchor="middle" fill="#ffffff" fontSize={10} pointerEvents="none">
                  {Math.round(share * 100)}%
                </text>
              )}
            </g>
          );
        })}
        {donut && (
          <text x={cx} y={cy} dy="0.32em" textAnchor="middle" fill={INK.text} fontSize={13} fontWeight={600}>
            {fmt(trueTotal)}
          </text>
        )}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scatter and bubbles: one point per entity, x and y two statistics, size a third

export interface Point extends Ent {
  x: number;
  y: number;
  size: number;
}

export function Scatter({ points, ev, fx, fy, fs, xLabel, yLabel, height = 280 }: { points: Point[]; ev: ChartEvents; fx: (v: number) => string; fy: (v: number) => string; fs?: (v: number) => string; xLabel: string; yLabel: string; height?: number }) {
  const [ref, W] = useWidth();
  const ok = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const target = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of ok) {
      m.set(`${p.key}\u0001x`, p.x);
      m.set(`${p.key}\u0001y`, p.y);
      m.set(`${p.key}\u0001s`, Number.isFinite(p.size) ? p.size : 0);
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);
  const tw = useTween(target);
  const xs = ok.map((p) => p.x);
  const ys = ok.map((p) => p.y);
  const xt = niceTicks(Math.min(0, ...xs), Math.max(0, ...xs));
  const yt = niceTicks(Math.min(0, ...ys), Math.max(0, ...ys));
  const smax = Math.max(1e-12, ...ok.map((p) => (Number.isFinite(p.size) ? Math.abs(p.size) : 0)));
  const pad = { l: 56, r: 18, t: 12, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  const X = (v: number) => pad.l + ((v - xt[0]) / (xt[xt.length - 1] - xt[0] || 1)) * plotW;
  const Y = (v: number) => pad.t + plotH - ((v - yt[0]) / (yt[yt.length - 1] - yt[0] || 1)) * plotH;
  return (
    <div ref={ref} className="vs-chart">
      <svg width={W} height={height} viewBox={`0 0 ${W} ${height}`} role="img">
        <YAxis ticks={yt} y={Y} x0={pad.l} x1={pad.l + plotW} fmt={fy} />
        {xt.map((t) => (
          <g key={t}>
            <line x1={X(t)} x2={X(t)} y1={pad.t} y2={pad.t + plotH} stroke={INK.grid} />
            <text x={X(t)} y={pad.t + plotH + 14} textAnchor="middle" fill={INK.dim} fontSize={10}>
              {fx(t)}
            </text>
          </g>
        ))}
        <text x={pad.l + plotW / 2} y={height - 4} textAnchor="middle" fill={INK.dim} fontSize={10}>
          {xLabel}
        </text>
        <text transform={`translate(11 ${pad.t + plotH / 2}) rotate(-90)`} textAnchor="middle" fill={INK.dim} fontSize={10}>
          {yLabel}
        </text>
        {ok.map((p) => {
          const tx = tw.get(`${p.key}\u0001x`);
          const ty = tw.get(`${p.key}\u0001y`);
          const ts = tw.get(`${p.key}\u0001s`);
          const r = fs ? 5 + 17 * Math.sqrt(Math.abs(ts?.v ?? 0) / smax) : 6;
          const lines = [p.label, `${xLabel}: ${fx(p.x)}`, `${yLabel}: ${fy(p.y)}`];
          if (fs) lines.push(fs(p.size));
          return (
            <g key={p.key} opacity={(ty?.a ?? 1) * dimmed(ev.focus, p.key)} style={{ cursor: 'pointer' }} onMouseMove={(e) => ev.tip(e, lines)} onMouseLeave={() => ev.tip(null)} onClick={() => ev.pick(p.key, null)}>
              <circle cx={X(tx?.v ?? p.x)} cy={Y(ty?.v ?? p.y)} r={r} fill={p.color} fillOpacity={fs ? 0.75 : 1} stroke={INK.surface} strokeWidth={2} />
              <circle cx={X(tx?.v ?? p.x)} cy={Y(ty?.v ?? p.y)} r={Math.max(r, 10)} fill="transparent" />
            </g>
          );
        })}
        {ok.length <= 8 &&
          ok.map((p) => (
            <text key={`l${p.key}`} x={X(tw.get(`${p.key}\u0001x`)?.v ?? p.x) + 9} y={Y(tw.get(`${p.key}\u0001y`)?.v ?? p.y) - 7} fill={INK.text} fontSize={10} pointerEvents="none">
              {clip(p.label, 16)}
            </text>
          ))}
      </svg>
    </div>
  );
}

/** The SVG of a chart as text, for export. */
export function svgText(el: SVGSVGElement): string {
  const clone = el.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('font-family', 'system-ui, sans-serif');
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '100%');
  bg.setAttribute('height', '100%');
  bg.setAttribute('fill', INK.surface);
  clone.insertBefore(bg, clone.firstChild);
  return new XMLSerializer().serializeToString(clone);
}

/** A PNG of an SVG, at twice its size. */
export function svgPng(el: SVGSVGElement): Promise<Blob | null> {
  const text = svgText(el);
  const w = el.width.baseVal.value;
  const h = el.height.baseVal.value;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = w * 2;
      c.height = h * 2;
      const g = c.getContext('2d');
      if (!g) return resolve(null);
      g.scale(2, 2);
      g.drawImage(img, 0, 0);
      c.toBlob((b) => resolve(b), 'image/png');
    };
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  });
}
