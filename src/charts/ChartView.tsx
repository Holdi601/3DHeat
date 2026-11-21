/**
 * A chart as a React element: a canvas drawn when the data, the size or the
 * theme changes (never per frame), a hover tooltip built with `textContent`,
 * a click that hands the mark to the caller, and a table view. For panels and
 * documents; the signs in the world draw their own canvases the same way
 * (`ui/signs/VolumeSigns.tsx`), with `paintChart`.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { drawChart, hitAt, tableOf, tooltipOf, type Hit } from './draw';
import { readTheme, type ChartTheme } from './palette';
import type { ChartData, ChartEntity } from './types';
import './charts.css';

/** Draw a chart onto a canvas at the device's pixel ratio; returns its hit regions. */
export function paintChart(canvas: HTMLCanvasElement, data: ChartData, theme: ChartTheme, w: number, h: number, hover: { s: number; g: number } | null = null, now: number | null = null): Hit[] {
  const dpr = Math.min(2, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
  const W = Math.max(1, Math.round(w * dpr));
  const H = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return drawChart(ctx, data, theme, w, h, { hover, now });
}

/** The entity a click on a hit means: the group, or for a series-only mark the series. */
export function entityOf(d: ChartData, hit: Hit): ChartEntity | null {
  if (d.kind === 'tiles') return null;
  const g = d.groups[hit.g];
  if (d.kind === 'matrix' || d.kind === 'scatter') return g ?? null;
  if (g?.filter) return g;
  return hit.s >= 0 ? (d.series[hit.s] ?? null) : null;
}

/** Fill a tooltip element: a title, then a line key, the value (strong) and the name per row. */
export function fillTooltip(el: HTMLElement, d: ChartData, hit: Hit): void {
  const tip = tooltipOf(d, hit);
  el.replaceChildren();
  const title = document.createElement('div');
  title.className = 'chart-tip-title';
  title.textContent = tip.title;
  el.appendChild(title);
  for (const r of tip.rows) {
    const row = document.createElement('div');
    row.className = 'chart-tip-row';
    const key = document.createElement('i');
    if (r.color) key.style.background = r.color;
    const v = document.createElement('b');
    v.textContent = r.value;
    const l = document.createElement('span');
    l.textContent = r.label;
    row.append(key, v, l);
    el.appendChild(row);
  }
}

export function ChartTable({ data }: { data: ChartData }) {
  const tb = tableOf(data);
  return (
    <table className="chart-table">
      <thead>
        <tr>
          {tb.head.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tb.rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ChartView({
  data,
  width,
  height,
  onPick,
  table = false,
  now = null,
}: {
  data: ChartData;
  width: number;
  height: number;
  /** A mark clicked: its group or series, which carries the filter it stands for. */
  onPick?: (e: ChartEntity, hit: Hit) => void;
  table?: boolean;
  now?: number | null;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const hits = useRef<Hit[]>([]);
  const [hover, setHover] = useState<Hit | null>(null);
  const [themeTick, setThemeTick] = useState(0);
  // A theme switch redraws: the tokens change on the root.
  useEffect(() => {
    const mo = new MutationObserver(() => setThemeTick((n) => n + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => mo.disconnect();
  }, []);
  useLayoutEffect(() => {
    const c = canvas.current;
    if (!c || table) return;
    hits.current = paintChart(c, data, readTheme(c), width, height, hover ? { s: hover.s, g: hover.g } : null, now);
  }, [data, width, height, hover, table, themeTick, now]);
  if (table) return <ChartTable data={data} />;
  return (
    <div className="chart-view" style={{ width, height }}>
      <canvas
        ref={canvas}
        style={{ width, height }}
        role="img"
        aria-label={data.valueLabel}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const h = hitAt(hits.current, e.clientX - r.left, e.clientY - r.top);
          if (h?.s !== hover?.s || h?.g !== hover?.g) setHover(h);
          const el = tip.current;
          if (!el) return;
          if (!h) {
            el.style.display = 'none';
            return;
          }
          fillTooltip(el, data, h);
          el.style.display = '';
          el.style.left = `${Math.min(width - 120, e.clientX - r.left + 12)}px`;
          el.style.top = `${e.clientY - r.top + 12}px`;
        }}
        onPointerLeave={() => {
          setHover(null);
          if (tip.current) tip.current.style.display = 'none';
        }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const h = hitAt(hits.current, e.clientX - r.left, e.clientY - r.top);
          const ent = h ? entityOf(data, h) : null;
          if (h && ent && onPick) onPick(ent, h);
        }}
      />
      <div className="chart-tip" ref={tip} style={{ display: 'none' }} />
    </div>
  );
}
