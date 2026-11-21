/**
 * Drawing a `ChartData` onto a 2D canvas, once, when its data changes: the
 * signs in the world keep the canvas as it is and only move it, and a
 * document's chart is a canvas like any other.
 *
 * The marks follow the dataviz rules: thin bars (at most 24 px, a 4 px
 * rounded data end, square at the baseline), 2 px lines with a 10 % area
 * wash, a 2 px surface gap between touching marks and a surface ring round
 * dots, hairline grid, one value axis, a legend from two series on, text in
 * the theme's inks and never in a series colour. What is drawn is returned as
 * hit regions, for the tooltip and for a click that filters the view.
 */

import { t } from '../i18n';
import { clock, compact, fmtValue, niceTicks } from './format';
import { inkOn, mix, type ChartTheme } from './palette';
import type { ChartData, ValueFormat } from './types';

/** A mark's hit target: a rectangle, or an arc of a donut. `s` -1 is every series at a group (a crosshair column). */
export interface Hit {
  s: number;
  g: number;
  x: number;
  y: number;
  w: number;
  h: number;
  arc?: { cx: number; cy: number; r0: number; r1: number; a0: number; a1: number };
}

export interface DrawOptions {
  /** The mark under the pointer: lifted, the others a little dimmed. */
  hover?: { s: number; g: number } | null;
  /** Where the playhead is along a time axis, in the axis' units; drawn as a hairline. */
  now?: number | null;
  /** Marks picked elsewhere (a dashboard's selection): the others dimmed. */
  focus?: ((s: number, g: number) => boolean) | null;
}

const FS = 10.5;
const BAR_MAX = 24;
const GAP = 2;

const finite = (v: number) => Number.isFinite(v);

function font(th: ChartTheme, size = FS, weight = 400): string {
  return `${weight} ${size}px ${th.font}`;
}

/** Text cut to a width, with an ellipsis. */
export function ellipsize(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (max <= 0) return '';
  if (ctx.measureText(text).width <= max) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (ctx.measureText(text.slice(0, m) + '…').width <= max) lo = m;
    else hi = m - 1;
  }
  return lo > 0 ? text.slice(0, lo) + '…' : '';
}

/** A bar from a baseline, its far end rounded (4 px, less on a thin or short bar). */
function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dir: 'right' | 'up', roundEnd = true): void {
  if (w <= 0 || h <= 0) return;
  const r = roundEnd ? Math.min(4, (dir === 'right' ? h : w) / 2, dir === 'right' ? w : h) : 0;
  ctx.beginPath();
  if (dir === 'right') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x, y + h);
  } else {
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h);
  }
  ctx.closePath();
  ctx.fill();
}

/** The legend row: swatches (a line for lines) and names in the secondary ink. Returns its height. */
function legend(ctx: CanvasRenderingContext2D, d: ChartData, th: ChartTheme, w: number, entities: { label: string; color?: string }[], line: boolean): number {
  ctx.font = font(th);
  ctx.textBaseline = 'middle';
  let x = 0;
  let y = 7;
  for (const e of entities) {
    const label = ellipsize(ctx, e.label, Math.max(40, w * 0.45));
    const tw = ctx.measureText(label).width;
    if (x > 0 && x + 14 + tw > w) {
      x = 0;
      y += 15;
    }
    ctx.fillStyle = e.color ?? th.other;
    if (line) ctx.fillRect(x, y - 1, 10, 2);
    else {
      ctx.beginPath();
      ctx.roundRect(x, y - 4, 8, 8, 2);
      ctx.fill();
    }
    ctx.fillStyle = th.dim;
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 13, y);
    x += 13 + tw + 12;
  }
  void d;
  return y + 10;
}

function maxOf(values: number[][], stacked = false, groups = 0): number {
  let m = 0;
  if (stacked) {
    for (let g = 0; g < groups; g++) {
      let s = 0;
      for (const row of values) if (finite(row[g]) && row[g] > 0) s += row[g];
      m = Math.max(m, s);
    }
  } else for (const row of values) for (const v of row) if (finite(v)) m = Math.max(m, v);
  return m;
}

/** A tick's text: one style per axis - compact (10K) on an axis that reaches ten thousand, in full below. */
function tickText(v: number, f: ValueFormat, time = false, axisMax = 0): string {
  if (time) return clock(v);
  const g = f === 'rate' ? 'dec' : f;
  if (axisMax >= 10_000 && (g === 'int' || g === 'dec')) return v === 0 ? '0' : compact(v);
  return fmtValue(v, g, false);
}

/** Draw a chart into (0, 0, w, h) of the context, in CSS pixels. */
export function drawChart(ctx: CanvasRenderingContext2D, d: ChartData, th: ChartTheme, w: number, h: number, o: DrawOptions = {}): Hit[] {
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (d.empty || d.groups.length === 0 || d.series.length === 0) {
    ctx.font = font(th, 11.5);
    ctx.fillStyle = th.faint;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ellipsize(ctx, t(d.empty ?? 'charts.empty.noRows'), w - 12), w / 2, h / 2);
    return [];
  }
  switch (d.kind) {
    case 'bar':
    case 'stacked':
      return drawBars(ctx, d, th, w, h, o, d.kind === 'stacked');
    case 'line':
    case 'area':
    case 'histogram':
      return d.kind === 'histogram' ? drawColumns(ctx, d, th, w, h, o) : drawLines(ctx, d, th, w, h, o);
    case 'pie':
      return drawDonut(ctx, d, th, w, h, o);
    case 'tiles':
      return drawTiles(ctx, d, th, w, h);
    case 'matrix':
      return drawMatrix(ctx, d, th, w, h, o);
    case 'scatter':
      return drawScatter(ctx, d, th, w, h, o);
  }
}

function dimmed(o: DrawOptions, s: number, g: number): boolean {
  if (o.focus && !o.focus(s, g)) return true;
  const hv = o.hover;
  if (!hv) return false;
  return !((hv.s === -1 || hv.s === s) && (hv.g === -1 || hv.g === g));
}

function drawBars(ctx: CanvasRenderingContext2D, d: ChartData, th: ChartTheme, w: number, h: number, o: DrawOptions, stacked: boolean): Hit[] {
  const hits: Hit[] = [];
  const S = d.series.length;
  const G = d.groups.length;
  const top = S > 1 ? legend(ctx, d, th, w, d.series, false) + 4 : 2;
  ctx.font = font(th);
  let labelW = 0;
  for (const g of d.groups) labelW = Math.max(labelW, ctx.measureText(g.label).width);
  labelW = Math.min(Math.round(w * 0.36), Math.ceil(labelW) + 8);
  const tipW = !stacked && S === 1 ? 44 : 6;
  const x0 = labelW;
  const x1 = w - tipW;
  const axisH = 14;
  const y0 = top;
  const y1 = h - axisH;
  const max = stacked && d.format === 'pct' ? 1 : maxOf(d.values, stacked, G) || 1;
  const ticks = niceTicks(0, max, Math.max(2, Math.floor((x1 - x0) / 60)));
  const hi = Math.max(max, ticks[ticks.length - 1] ?? max);
  const sx = (v: number) => x0 + ((x1 - x0) * Math.max(0, v)) / hi;
  // Grid and the value axis' ticks along the bottom.
  ctx.strokeStyle = th.grid;
  ctx.lineWidth = 1;
  ctx.fillStyle = th.faint;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (const tv of ticks) {
    const x = Math.round(sx(tv)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
    ctx.fillText(tickText(tv, d.format, false, hi), x, y1 + 3);
  }
  ctx.strokeStyle = th.axis;
  ctx.beginPath();
  ctx.moveTo(Math.round(x0) + 0.5, y0);
  ctx.lineTo(Math.round(x0) + 0.5, y1);
  ctx.stroke();
  const band = (y1 - y0) / Math.max(1, G);
  const thick = stacked ? Math.min(BAR_MAX, Math.max(3, band - 4)) : Math.min(BAR_MAX, Math.max(2, (band - 4 - GAP * (S - 1)) / S));
  for (let g = 0; g < G; g++) {
    const by = y0 + band * g;
    const groupH = stacked ? thick : thick * S + GAP * (S - 1);
    const gy = by + (band - groupH) / 2;
    ctx.font = font(th);
    ctx.fillStyle = th.dim;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(ellipsize(ctx, d.groups[g].label, labelW - 8), x0 - 6, by + band / 2);
    if (stacked) {
      let acc = 0;
      let last = -1;
      for (let s = 0; s < S; s++) if (finite(d.values[s][g]) && d.values[s][g] > 0) last = s;
      for (let s = 0; s < S; s++) {
        const v = d.values[s][g];
        if (!finite(v) || v <= 0) continue;
        const a = sx(acc);
        const b = sx(acc + v);
        acc += v;
        ctx.globalAlpha = dimmed(o, s, g) ? 0.45 : 1;
        ctx.fillStyle = d.series[s].color ?? th.other;
        // The surface gap: each segment gives up a pixel at each join.
        const l = a + (a > x0 + 0.5 ? GAP / 2 : 0);
        const r = b - (s !== last ? GAP / 2 : 0);
        bar(ctx, l, gy, r - l, thick, 'right', s === last);
        hits.push({ s, g, x: a, y: by, w: Math.max(4, b - a), h: band });
      }
      ctx.globalAlpha = 1;
    } else {
      for (let s = 0; s < S; s++) {
        const v = d.values[s][g];
        const y = gy + s * (thick + GAP);
        hits.push({ s, g, x: x0, y: S === 1 ? by : y - GAP / 2, w: x1 - x0 + tipW, h: S === 1 ? band : thick + GAP });
        if (!finite(v) && v !== Infinity) continue;
        ctx.globalAlpha = dimmed(o, s, g) ? 0.45 : 1;
        ctx.fillStyle = d.series[s].color ?? th.series[0];
        const len = sx(v === Infinity ? hi : v) - x0;
        bar(ctx, x0, y, len, thick, 'right');
        ctx.globalAlpha = 1;
        if (S === 1 && thick >= 7) {
          ctx.fillStyle = th.text;
          ctx.textAlign = 'left';
          ctx.font = font(th, FS, 550);
          ctx.fillText(fmtValue(v, d.format, true), x0 + len + 4, y + thick / 2);
        }
      }
    }
  }
  return hits;
}

/** The x position of bin centres along a continuous axis. */
function axisTicks(ctx: CanvasRenderingContext2D, th: ChartTheme, lo: number, hi: number, x0: number, x1: number, y: number, time: boolean, f: ValueFormat): void {
  ctx.font = font(th);
  ctx.fillStyle = th.faint;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const ticks = niceTicks(lo, hi, Math.max(2, Math.floor((x1 - x0) / 70)));
  for (const tv of ticks) {
    if (tv < lo || tv > hi) continue;
    const x = x0 + ((tv - lo) / (hi - lo)) * (x1 - x0);
    ctx.fillText(tickText(tv, f, time, Math.max(Math.abs(lo), Math.abs(hi))), x, y);
  }
}

/** Along x without a continuous axis (a chart whose groups are labels): as many of the labels as fit, evenly. */
function labelTicks(ctx: CanvasRenderingContext2D, th: ChartTheme, d: ChartData, x0: number, x1: number, y: number): void {
  const G = d.groups.length;
  if (!G) return;
  ctx.font = font(th);
  ctx.fillStyle = th.faint;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let wmax = 0;
  for (const g of d.groups) wmax = Math.max(wmax, ctx.measureText(g.label).width);
  const room = (x1 - x0) / G;
  const step = Math.max(1, Math.ceil((Math.min(wmax, 90) + 8) / Math.max(1, room)));
  for (let g = 0; g < G; g += step) ctx.fillText(ellipsize(ctx, d.groups[g].label, room * step - 4), x0 + room * (g + 0.5), y);
}

function valueAxis(ctx: CanvasRenderingContext2D, th: ChartTheme, max: number, x0: number, x1: number, y0: number, y1: number, f: ValueFormat): (v: number) => number {
  const ticks = niceTicks(0, max, Math.max(2, Math.floor((y1 - y0) / 34)));
  const hi = Math.max(max, ticks[ticks.length - 1] ?? max) || 1;
  const sy = (v: number) => y1 - ((y1 - y0) * Math.max(0, v)) / hi;
  ctx.font = font(th);
  ctx.strokeStyle = th.grid;
  ctx.lineWidth = 1;
  ctx.fillStyle = th.faint;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (const tv of ticks) {
    const y = Math.round(sy(tv)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.fillText(tickText(tv, f, false, hi), x0 - 4, y);
  }
  ctx.strokeStyle = th.axis;
  ctx.beginPath();
  ctx.moveTo(x0, Math.round(y1) + 0.5);
  ctx.lineTo(x1, Math.round(y1) + 0.5);
  ctx.stroke();
  return sy;
}

function yLabelWidth(ctx: CanvasRenderingContext2D, th: ChartTheme, max: number, f: ValueFormat): number {
  ctx.font = font(th);
  let wmax = 0;
  for (const v of niceTicks(0, max || 1, 4)) wmax = Math.max(wmax, ctx.measureText(tickText(v, f, false, max)).width);
  return Math.ceil(wmax) + 8;
}

function drawLines(ctx: CanvasRenderingContext2D, d: ChartData, th: ChartTheme, w: number, h: number, o: DrawOptions): Hit[] {
  const hits: Hit[] = [];
  const S = d.series.length;
  const G = d.groups.length;
  const top = S > 1 ? legend(ctx, d, th, w, d.series, d.kind === 'line') + 4 : 4;
  const max = maxOf(d.values) || 1;
  const x0 = yLabelWidth(ctx, th, max, d.format);
  const x1 = w - 6;
  const y0 = top;
  const y1 = h - 15;
  const sy = valueAxis(ctx, th, max, x0, x1, y0, y1, d.format);
  const ax = d.axis ?? { lo: 0, hi: G, label: '' };
  const bx = (g: number) => x0 + ((g + 0.5) / G) * (x1 - x0);
  if (d.axis) axisTicks(ctx, th, ax.lo, ax.hi, x0, x1, y1 + 3, !!ax.time, d.format);
  else labelTicks(ctx, th, d, x0, x1, y1 + 3);
  if (o.now !== null && o.now !== undefined && o.now >= ax.lo && o.now <= ax.hi) {
    const x = Math.round(x0 + ((o.now - ax.lo) / (ax.hi - ax.lo)) * (x1 - x0)) + 0.5;
    ctx.strokeStyle = th.faint;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
  }
  for (let s = 0; s < S; s++) {
    const color = d.series[s].color ?? th.series[0];
    const row = d.values[s];
    ctx.globalAlpha = o.hover && o.hover.s >= 0 && o.hover.s !== s ? 0.45 : 1;
    if (d.kind === 'area') {
      ctx.fillStyle = color;
      ctx.globalAlpha *= 0.1;
      ctx.beginPath();
      let open = false;
      let firstX = 0;
      let lastX = 0;
      for (let g = 0; g < G; g++) {
        const v = row[g];
        if (!finite(v)) continue;
        const x = bx(g);
        if (!open) {
          ctx.moveTo(x, y1);
          firstX = x;
          open = true;
        }
        ctx.lineTo(x, sy(v));
        lastX = x;
      }
      if (open) {
        ctx.lineTo(lastX, y1);
        ctx.lineTo(firstX, y1);
        ctx.fill();
      }
      ctx.globalAlpha = o.hover && o.hover.s >= 0 && o.hover.s !== s ? 0.45 : 1;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let pen = false;
    for (let g = 0; g < G; g++) {
      const v = row[g];
      if (!finite(v)) {
        pen = false;
        continue;
      }
      if (pen) ctx.lineTo(bx(g), sy(v));
      else ctx.moveTo(bx(g), sy(v));
      pen = true;
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // The crosshair at the hovered bin: a hairline and every series' dot, ringed by the surface.
  if (o.hover && o.hover.g >= 0 && o.hover.g < G) {
    const x = Math.round(bx(o.hover.g)) + 0.5;
    ctx.strokeStyle = th.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
    for (let s = 0; s < S; s++) {
      const v = d.values[s][o.hover.g];
      if (!finite(v)) continue;
      ctx.fillStyle = th.surface;
      ctx.beginPath();
      ctx.arc(bx(o.hover.g), sy(v), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = d.series[s].color ?? th.series[0];
      ctx.beginPath();
      ctx.arc(bx(o.hover.g), sy(v), 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const col = (x1 - x0) / G;
  for (let g = 0; g < G; g++) hits.push({ s: -1, g, x: x0 + col * g, y: y0, w: col, h: y1 - y0 });
  return hits;
}

function drawColumns(ctx: CanvasRenderingContext2D, d: ChartData, th: ChartTheme, w: number, h: number, o: DrawOptions): Hit[] {
  const hits: Hit[] = [];
  const S = d.series.length;
  const G = d.groups.length;
  const top = S > 1 ? legend(ctx, d, th, w, d.series, false) + 4 : 4;
  const max = maxOf(d.values) || 1;
  const x0 = yLabelWidth(ctx, th, max, d.format);
  const x1 = w - 6;
  const y0 = top;
  const y1 = h - 15;
  const sy = valueAxis(ctx, th, max, x0, x1, y0, y1, d.format);
  const ax = d.axis ?? { lo: 0, hi: G, label: '' };
  if (d.axis) axisTicks(ctx, th, ax.lo, ax.hi, x0, x1, y1 + 3, !!ax.time, 'dec');
  else labelTicks(ctx, th, d, x0, x1, y1 + 3);
  const band = (x1 - x0) / G;
  const cw = Math.max(1, Math.min(BAR_MAX, (band - GAP * S) / S));
  for (let g = 0; g < G; g++) {
    for (let s = 0; s < S; s++) {
      const v = d.values[s][g];
      const x = x0 + band * g + (band - (cw * S + GAP * (S - 1))) / 2 + s * (cw + GAP);
      hits.push({ s, g, x: x0 + band * g, y: y0, w: band, h: y1 - y0 });
      if (!finite(v) || v <= 0) continue;
      ctx.globalAlpha = dimmed(o, s, g) ? 0.45 : 1;
      ctx.fillStyle = d.series[s].color ?? th.series[0];
      bar(ctx, x, sy(v), cw, y1 - sy(v), 'up');
    }
  }
  ctx.globalAlpha = 1;
  return S > 1 ? hits.filter((x) => x.s === 0).map((x) => ({ ...x, s: -1 })) : hits;
}

function drawDonut(ctx: CanvasRenderingContext2D, d: ChartData, th: ChartTheme, w: number, h: number, o: DrawOptions): Hit[] {
  const hits: Hit[] = [];
  const row = d.values[0] ?? [];
  let total = 0;
  for (const v of row) if (finite(v) && v > 0) total += v;
  const r1 = Math.max(10, Math.min(h / 2 - 6, w * 0.24));
  const r0 = r1 * 0.58;
  const cx = r1 + 6;
  const cy = h / 2;
  let a = -Math.PI / 2;
  for (let g = 0; g < d.groups.length; g++) {
    const v = row[g];
    if (!finite(v) || v <= 0 || total <= 0) continue;
    const span = (v / total) * Math.PI * 2;
    ctx.globalAlpha = dimmed(o, 0, g) ? 0.45 : 1;
    ctx.fillStyle = d.groups[g].color ?? th.other;
    ctx.beginPath();
    ctx.arc(cx, cy, r1, a, a + span);
    ctx.arc(cx, cy, r0, a + span, a, true);
    ctx.closePath();
    ctx.fill();
    hits.push({ s: 0, g, x: cx - r1, y: cy - r1, w: r1 * 2, h: r1 * 2, arc: { cx, cy, r0, r1, a0: a, a1: a + span } });
    a += span;
  }
  ctx.globalAlpha = 1;
  // The surface gap between slices.
  if (hits.length > 1) {
    ctx.strokeStyle = th.surface;
    ctx.lineWidth = GAP;
    for (const hh of hits) {
      const an = hh.arc!.a0;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(an) * (r0 - 1), cy + Math.sin(an) * (r0 - 1));
      ctx.lineTo(cx + Math.cos(an) * (r1 + 1), cy + Math.sin(an) * (r1 + 1));
      ctx.stroke();
    }
  }
  // The legend beside it, with each part's share.
  const lx = cx + r1 + 14;
  const lw = w - lx - 2;
  ctx.font = font(th);
  ctx.textBaseline = 'middle';
  const lh = Math.min(18, (h - 8) / Math.max(1, d.groups.length));
  let y = cy - (lh * d.groups.length) / 2 + lh / 2;
  for (let g = 0; g < d.groups.length; g++) {
    const v = row[g];
    ctx.fillStyle = d.groups[g].color ?? th.other;
    ctx.beginPath();
    ctx.roundRect(lx, y - 4, 8, 8, 2);
    ctx.fill();
    const share = total > 0 && finite(v) ? fmtValue(v / total, 'pct') : '—';
    ctx.font = font(th, FS, 550);
    ctx.fillStyle = th.text;
    ctx.textAlign = 'right';
    ctx.fillText(share, lx + lw, y);
    const sw = ctx.measureText(share).width;
    ctx.font = font(th);
    ctx.fillStyle = th.dim;
    ctx.textAlign = 'left';
    ctx.fillText(ellipsize(ctx, d.groups[g].label, lw - sw - 20), lx + 13, y);
    hits.push({ s: 0, g, x: lx, y: y - lh / 2, w: lw, h: lh });
    y += lh;
  }
  return hits;
}

function drawTiles(ctx: CanvasRenderingContext2D, d: ChartData, th: ChartTheme, w: number, h: number): Hit[] {
  const hits: Hit[] = [];
  const S = d.series.length;
  const top = S > 1 ? legend(ctx, d, th, w, d.series, false) + 2 : 0;
  const n = d.groups.length;
  const cols = Math.min(n, w >= 300 ? 4 : 3);
  const rows = Math.ceil(n / cols);
  const cw = w / cols;
  const ch = (h - top) / rows;
  for (let i = 0; i < n; i++) {
    const x = (i % cols) * cw;
    const y = top + Math.floor(i / cols) * ch;
    const f = d.formats?.[i] ?? d.format;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = font(th);
    ctx.fillStyle = th.dim;
    ctx.fillText(ellipsize(ctx, d.groups[i].label, cw - 10), x + 4, y + 4);
    if (S === 1) {
      ctx.font = font(th, Math.min(20, ch * 0.42), 650);
      ctx.fillStyle = th.text;
      ctx.fillText(ellipsize(ctx, fmtValue(d.values[0][i], f, true), cw - 8), x + 4, y + 18);
    } else {
      const size = Math.min(14, (ch - 20) / S - 2);
      for (let s = 0; s < S; s++) {
        const yy = y + 18 + s * (size + 4);
        ctx.fillStyle = d.series[s].color ?? th.other;
        ctx.fillRect(x + 4, yy + size / 2 - 1, 8, 2);
        ctx.font = font(th, size, 650);
        ctx.fillStyle = th.text;
        ctx.fillText(ellipsize(ctx, fmtValue(d.values[s][i], f, true), cw - 22), x + 16, yy);
      }
    }
    hits.push({ s: -1, g: i, x, y, w: cw, h: ch });
  }
  return hits;
}

function drawMatrix(ctx: CanvasRenderingContext2D, d: ChartData, th: ChartTheme, w: number, h: number, o: DrawOptions): Hit[] {
  const hits: Hit[] = [];
  const G = d.groups.length;
  const S = d.series.length;
  ctx.font = font(th);
  let rowW = 0;
  for (const s of d.series) rowW = Math.max(rowW, ctx.measureText(s.label).width);
  rowW = Math.min(Math.round(w * 0.3), Math.ceil(rowW) + 8);
  const x0 = rowW;
  const y0 = 16;
  const cw = (w - x0) / Math.max(1, G);
  const ch = Math.min(28, (h - y0) / Math.max(1, S));
  const max = maxOf(d.values) || 1;
  ctx.textBaseline = 'middle';
  for (let g = 0; g < G; g++) {
    ctx.fillStyle = th.dim;
    ctx.textAlign = 'center';
    ctx.fillText(ellipsize(ctx, d.groups[g].label, cw - 4), x0 + cw * g + cw / 2, 7);
  }
  for (let s = 0; s < S; s++) {
    const y = y0 + ch * s;
    ctx.fillStyle = th.dim;
    ctx.textAlign = 'right';
    ctx.font = font(th);
    ctx.fillText(ellipsize(ctx, d.series[s].label, rowW - 8), x0 - 6, y + ch / 2);
    for (let g = 0; g < G; g++) {
      const v = d.values[s][g];
      const x = x0 + cw * g;
      const fill = finite(v) && v > 0 ? mix(th.seqLo, th.seqHi, v / max) : th.grid;
      ctx.globalAlpha = dimmed(o, s, g) ? 0.5 : 1;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x + GAP / 2, y + GAP / 2, cw - GAP, ch - GAP, 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (finite(v) && cw >= 30 && ch >= 15) {
        const text = fmtValue(v, d.format, true);
        ctx.font = font(th, 9.5);
        if (ctx.measureText(text).width <= cw - 6) {
          ctx.fillStyle = inkOn(fill.startsWith('#') ? fill : rgbHex(fill));
          ctx.textAlign = 'center';
          ctx.fillText(text, x + cw / 2, y + ch / 2);
        }
      }
      hits.push({ s, g, x, y, w: cw, h: ch });
    }
  }
  return hits;
}

function rgbHex(c: string): string {
  const n = c.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
  return `#${n.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function drawScatter(ctx: CanvasRenderingContext2D, d: ChartData, th: ChartTheme, w: number, h: number, o: DrawOptions): Hit[] {
  const hits: Hit[] = [];
  const GX = d.groups.length;
  const GY = d.series.length;
  const ya = d.yAxis ?? { lo: 0, hi: GY, label: '' };
  const xa = d.axis ?? { lo: 0, hi: GX, label: '' };
  ctx.font = font(th);
  let lw = 0;
  for (const v of niceTicks(ya.lo, ya.hi, 4)) lw = Math.max(lw, ctx.measureText(tickText(v, 'dec')).width);
  const x0 = Math.ceil(lw) + 8;
  const x1 = w - 6;
  const y0 = 14;
  const y1 = h - 15;
  // Axis names in the corners, ticks on both axes.
  ctx.fillStyle = th.faint;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(ellipsize(ctx, ya.label, w / 2), x0, 0);
  ctx.textAlign = 'right';
  ctx.fillText(ellipsize(ctx, xa.label, w / 2), x1, 0);
  ctx.strokeStyle = th.grid;
  ctx.lineWidth = 1;
  ctx.textBaseline = 'middle';
  for (const tv of niceTicks(ya.lo, ya.hi, Math.max(2, Math.floor((y1 - y0) / 34)))) {
    if (tv < ya.lo || tv > ya.hi) continue;
    const y = Math.round(y1 - ((tv - ya.lo) / (ya.hi - ya.lo)) * (y1 - y0)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.fillText(tickText(tv, 'dec'), x0 - 4, y);
  }
  ctx.strokeStyle = th.axis;
  ctx.beginPath();
  ctx.moveTo(x0, Math.round(y1) + 0.5);
  ctx.lineTo(x1, Math.round(y1) + 0.5);
  ctx.stroke();
  axisTicks(ctx, th, xa.lo, xa.hi, x0, x1, y1 + 3, false, 'dec');
  const cw = (x1 - x0) / GX;
  const ch = (y1 - y0) / GY;
  const max = maxOf(d.values) || 1;
  const rMax = Math.max(3, Math.min(cw, ch) * 0.5);
  for (let yb = 0; yb < GY; yb++) {
    for (let xb = 0; xb < GX; xb++) {
      const v = d.values[yb][xb];
      if (!finite(v) || v <= 0) continue;
      const cx = x0 + cw * (xb + 0.5);
      const cy = y1 - ch * (yb + 0.5);
      const r = Math.max(1.5, rMax * Math.sqrt(v / max));
      ctx.fillStyle = th.surface;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = dimmed(o, yb, xb) ? 0.4 : 0.9;
      ctx.fillStyle = mix(th.seqLo, th.seqHi, 0.35 + 0.65 * (v / max));
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      hits.push({ s: yb, g: xb, x: cx - Math.max(12, cw / 2), y: cy - Math.max(12, ch / 2), w: Math.max(24, cw), h: Math.max(24, ch) });
    }
  }
  return hits;
}

/** The hit under (x, y): the smallest rectangle holding it, an arc by its angle. */
export function hitAt(hits: readonly Hit[], x: number, y: number): Hit | null {
  let best: Hit | null = null;
  let bestArea = Infinity;
  for (const h of hits) {
    if (h.arc) {
      const dx = x - h.arc.cx;
      const dy = y - h.arc.cy;
      const r = Math.hypot(dx, dy);
      if (r < h.arc.r0 - 2 || r > h.arc.r1 + 2) continue;
      let a = Math.atan2(dy, dx);
      while (a < h.arc.a0) a += Math.PI * 2;
      if (a > h.arc.a1) continue;
      return h;
    }
    if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
      const area = h.w * h.h;
      if (area < bestArea) {
        best = h;
        bestArea = area;
      }
    }
  }
  return best;
}

/** A tooltip's content for a hit: a title and one row per series (value first, then the name). */
export function tooltipOf(d: ChartData, hit: Hit): { title: string; rows: { color: string; label: string; value: string }[] } {
  const g = d.groups[hit.g];
  const f = d.formats?.[hit.g] ?? d.format;
  let title = g?.label ?? '';
  if (d.axis && (d.kind === 'line' || d.kind === 'area' || d.kind === 'histogram' || d.kind === 'scatter')) {
    const G = d.groups.length;
    const a = d.axis.lo + ((d.axis.hi - d.axis.lo) * hit.g) / G;
    const b = d.axis.lo + ((d.axis.hi - d.axis.lo) * (hit.g + 1)) / G;
    const say = (v: number) => (d.axis!.time ? clock(v) : fmtValue(v, 'dec'));
    title = `${d.axis.label}: ${say(a)} – ${say(b)}`;
  }
  if (d.kind === 'scatter' && d.yAxis) {
    const GY = d.series.length;
    const a = d.yAxis.lo + ((d.yAxis.hi - d.yAxis.lo) * hit.s) / GY;
    const b = d.yAxis.lo + ((d.yAxis.hi - d.yAxis.lo) * (hit.s + 1)) / GY;
    return { title, rows: [{ color: '', label: `${d.yAxis.label}: ${fmtValue(a, 'dec')} – ${fmtValue(b, 'dec')}`, value: fmtValue(d.values[hit.s][hit.g], 'int') }] };
  }
  if (d.kind === 'matrix') title = `${g?.label ?? ''} × ${d.series[hit.s]?.label ?? ''}`;
  const which = hit.s >= 0 && d.kind !== 'tiles' ? [hit.s] : d.series.map((_, i) => i);
  const rows = which.map((s) => {
    const v = d.values[s]?.[hit.g] ?? NaN;
    const n = d.counts?.[s]?.[hit.g];
    const extra = n !== undefined && d.format !== 'int' && d.kind !== 'tiles' ? ` · ${t('charts.tip.rows', { n: fmtValue(n, 'int', true) })}` : '';
    return { color: d.kind === 'pie' ? (g?.color ?? '') : (d.series[s]?.color ?? ''), label: d.kind === 'pie' || d.kind === 'matrix' ? d.valueLabel : d.series.length > 1 ? d.series[s].label : d.valueLabel, value: fmtValue(v, f) + extra };
  });
  return { title, rows };
}

/** A chart as a table: a header and rows of text, the view that needs no colour and no hover. */
export function tableOf(d: ChartData): { head: string[]; rows: string[][] } {
  const head = [d.kind === 'tiles' ? '' : (d.axis?.label ?? ''), ...d.series.map((s) => (d.series.length > 1 ? s.label : d.valueLabel))];
  const rows = d.groups.map((g, j) => {
    let name = g.label;
    if (!name && d.axis) {
      const G = d.groups.length;
      const a = d.axis.lo + ((d.axis.hi - d.axis.lo) * j) / G;
      name = d.axis.time ? clock(a) : fmtValue(a, 'dec');
    }
    return [name, ...d.series.map((_, s) => fmtValue(d.values[s]?.[j] ?? NaN, d.formats?.[j] ?? d.format))];
  });
  return { head, rows };
}
