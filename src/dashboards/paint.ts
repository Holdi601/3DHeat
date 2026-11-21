/**
 * The dashboards' own canvas visuals, beside the chart module's (`charts/draw.ts`):
 * columns (vertical bars: clustered, stacked, 100 %), the treemap, the top-N
 * list, the box plot, percentile bands, bubbles, the mini map, and - for an
 * exported page - KPI cards, tables and text. Same rules as the chart module
 * (the dataviz method): thin marks with 4 px rounded data ends on the
 * baseline, a 2 px surface gap between fills, one value axis, recessive grid,
 * text in text inks, colour that follows the entity, sequential one-hue
 * light-to-dark for magnitude. Painted when data, size or hover change -
 * never per frame. Each returns its marks' hit boxes.
 */

import { ellipsize } from '../charts/draw';
import { fmtValue, niceTicks, clock } from '../charts/format';
import { inkOn, mix, type ChartTheme } from '../charts/palette';
import type { ChartData, ValueFormat } from '../charts/types';
import type { BandsData, BoxData, BubbleData, ItemsData, MapData } from './finish';

export interface PHit {
  x: number;
  y: number;
  w: number;
  h: number;
  /** The mark: a group index (columns, items, box groups, points) or a cell (map). */
  i: number;
  /** Columns: the series. */
  s?: number;
}

const FS = 10.5;
const font = (th: ChartTheme, size = FS, weight = 400) => `${weight} ${size}px ${th.font}`;

function roundTop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

function tick(v: number, f: ValueFormat, hi: number): string {
  if (f === 'pct') return `${Math.round(v * 100)}%`;
  if (f === 'seconds') return clock(v);
  return fmtValue(v, hi >= 10_000 ? 'int' : f === 'int' ? 'int' : 'dec', true);
}

/** A legend row along the top: a swatch and a name per series; returns its height. */
function legend(ctx: CanvasRenderingContext2D, th: ChartTheme, w: number, items: { label: string; color: string }[]): number {
  ctx.font = font(th);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  let x = 4;
  let y = 8;
  for (const it of items) {
    const tw = Math.min(140, ctx.measureText(it.label).width);
    if (x + tw + 22 > w && x > 4) {
      x = 4;
      y += 15;
    }
    ctx.fillStyle = it.color;
    ctx.fillRect(x, y - 4, 9, 9);
    ctx.fillStyle = th.dim;
    ctx.fillText(ellipsize(ctx, it.label, 140), x + 13, y);
    x += tw + 26;
  }
  return y + 9;
}

/** Vertical columns: one per group, series side by side or stacked. */
export function paintColumns(ctx: CanvasRenderingContext2D, d: ChartData, th: ChartTheme, w: number, h: number, stacked: boolean, hover: PHit | null, focus: ((g: number) => boolean) | null): PHit[] {
  ctx.clearRect(0, 0, w, h);
  const hits: PHit[] = [];
  const S = d.series.length;
  const G = d.groups.length;
  const top = S > 1 ? legend(ctx, th, w, d.series.map((s) => ({ label: s.label, color: s.color ?? th.other }))) + 6 : 8;
  const bottom = h - 30;
  let max = 0;
  for (let g = 0; g < G; g++) {
    let acc = 0;
    for (let s = 0; s < S; s++) {
      const v = d.values[s][g];
      if (!Number.isFinite(v)) continue;
      acc = stacked ? acc + Math.max(0, v) : Math.max(acc, v);
    }
    max = Math.max(max, acc);
  }
  if (stacked && d.format === 'pct') max = 1;
  const ticks = niceTicks(0, max || 1, Math.max(2, Math.floor((bottom - top) / 40)));
  const hi = Math.max(max, ticks[ticks.length - 1] ?? 1) || 1;
  ctx.font = font(th);
  let axisW = 0;
  for (const tv of ticks) axisW = Math.max(axisW, ctx.measureText(tick(tv, d.format, hi)).width);
  const x0 = Math.ceil(axisW) + 8;
  const x1 = w - 4;
  const sy = (v: number) => bottom - ((bottom - top) * Math.max(0, v)) / hi;
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
    ctx.fillText(tick(tv, d.format, hi), x0 - 4, y);
  }
  ctx.strokeStyle = th.axis;
  ctx.beginPath();
  ctx.moveTo(x0, Math.round(bottom) + 0.5);
  ctx.lineTo(x1, Math.round(bottom) + 0.5);
  ctx.stroke();
  const band = (x1 - x0) / Math.max(1, G);
  const thick = stacked ? Math.min(28, Math.max(3, band - 6)) : Math.min(28, Math.max(2, (band - 6 - 2 * (S - 1)) / S));
  const groupW = stacked ? thick : thick * S + 2 * (S - 1);
  // Labels: as many as fit, cut to the band.
  const every = Math.max(1, Math.ceil(46 / band));
  for (let g = 0; g < G; g++) {
    const bx = x0 + band * g;
    const gx = bx + (band - groupW) / 2;
    const dim = (focus && !focus(g)) || (hover && hover.i !== g);
    let acc = 0;
    for (let s = 0; s < S; s++) {
      const v = d.values[s][g];
      if (!Number.isFinite(v) || v <= 0) continue;
      ctx.globalAlpha = dim ? 0.45 : 1;
      ctx.fillStyle = d.series[s].color ?? th.series[0];
      if (stacked) {
        const yTop = sy(acc + v);
        const yBot = sy(acc) - (acc > 0 ? 2 : 0);
        acc += v;
        const last = d.values.slice(s + 1).every((row) => !(row[g] > 0));
        if (last) roundTop(ctx, gx, yTop, thick, yBot - yTop, 4);
        else ctx.fillRect(gx, yTop, thick, Math.max(0, yBot - yTop));
        hits.push({ x: gx - 2, y: yTop, w: thick + 4, h: Math.max(4, yBot - yTop), i: g, s });
      } else {
        const x = gx + s * (thick + 2);
        const y = sy(v);
        roundTop(ctx, x, y, thick, bottom - y, 4);
        hits.push({ x: x - 1, y: top, w: thick + 2, h: bottom - top, i: g, s });
      }
    }
    ctx.globalAlpha = 1;
    if (g % every === 0) {
      ctx.fillStyle = th.dim;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(ellipsize(ctx, d.groups[g].label, band * every - 4), bx + band / 2, bottom + 5);
    }
  }
  return hits;
}

/** Squarified treemap: each item a rectangle by its value, a 2 px surface gap between. */
export function paintTreemap(ctx: CanvasRenderingContext2D, d: ItemsData, th: ChartTheme, w: number, h: number, colors: (key: string, team?: number) => string, hover: PHit | null, focus: ((i: number) => boolean) | null): PHit[] {
  ctx.clearRect(0, 0, w, h);
  const items = d.items.map((it, i) => ({ ...it, i })).filter((x) => x.value > 0);
  const total = items.reduce((s, x) => s + x.value, 0);
  const hits: PHit[] = [];
  if (!(total > 0)) return hits;
  const rects: { x: number; y: number; w: number; h: number; i: number }[] = [];
  let x = 0;
  let y = 0;
  let W = w;
  let H = h;
  let rest = [...items].sort((a, b) => b.value - a.value);
  let restTotal = total;
  while (rest.length) {
    const short = Math.min(W, H);
    const scale = (W * H) / restTotal;
    let row: typeof rest = [];
    let worst = Infinity;
    for (const it of rest) {
      const next = [...row, it];
      const s = next.reduce((a, b) => a + b.value, 0) * scale;
      const mx = Math.max(...next.map((n) => n.value * scale));
      const mn = Math.min(...next.map((n) => n.value * scale));
      const r = Math.max((short * short * mx) / (s * s), (s * s) / (short * short * mn));
      if (r > worst) break;
      worst = r;
      row = next;
    }
    const rowSum = row.reduce((a, b) => a + b.value, 0);
    const thick = (rowSum * scale) / short;
    let off = 0;
    for (const it of row) {
      const len = (it.value * scale) / thick;
      if (W >= H) rects.push({ x, y: y + off, w: thick, h: len, i: it.i });
      else rects.push({ x: x + off, y, w: len, h: thick, i: it.i });
      off += len;
    }
    if (W >= H) {
      x += thick;
      W -= thick;
    } else {
      y += thick;
      H -= thick;
    }
    rest = rest.slice(row.length);
    restTotal -= rowSum;
  }
  for (const r of rects) {
    const it = d.items[r.i];
    const dim = (focus && !focus(r.i)) || (hover && hover.i !== r.i);
    ctx.globalAlpha = dim ? 0.45 : 1;
    ctx.fillStyle = it.key === 'other' ? th.other : colors(it.key, it.team);
    const gx = r.x + 1;
    const gy = r.y + 1;
    const gw = Math.max(0, r.w - 2);
    const gh = Math.max(0, r.h - 2);
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, 3);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (gw > 40 && gh > 26) {
      ctx.fillStyle = inkOn(it.key === 'other' ? th.other : colors(it.key, it.team));
      ctx.font = font(th, FS, 550);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(ellipsize(ctx, it.label, gw - 8), gx + 5, gy + 4);
      ctx.font = font(th, FS);
      ctx.fillText(fmtValue(it.value, d.format, true), gx + 5, gy + 17);
    }
    hits.push({ x: gx, y: gy, w: gw, h: gh, i: r.i });
  }
  return hits;
}

/** Box plots: whiskers p5-p95 (or min-max), the box p25-p75, the median a bold line. */
export function paintBox(ctx: CanvasRenderingContext2D, d: BoxData, th: ChartTheme, w: number, h: number, hover: PHit | null, focus: ((i: number) => boolean) | null): PHit[] {
  ctx.clearRect(0, 0, w, h);
  const hits: PHit[] = [];
  const G = d.groups.length;
  if (!G || !Number.isFinite(d.lo)) return hits;
  ctx.font = font(th);
  let labelW = 0;
  for (const g of d.groups) labelW = Math.max(labelW, ctx.measureText(g.label).width);
  const x0 = Math.min(Math.round(w * 0.32), Math.ceil(labelW) + 10);
  const x1 = w - 8;
  const y0 = 6;
  const y1 = h - 18;
  const ticks = niceTicks(d.lo, d.hi > d.lo ? d.hi : d.lo + 1, Math.max(2, Math.floor((x1 - x0) / 70)));
  const lo = Math.min(d.lo, ticks[0]);
  const hi = Math.max(d.hi, ticks[ticks.length - 1]);
  const sx = (v: number) => x0 + ((x1 - x0) * (v - lo)) / (hi - lo || 1);
  ctx.strokeStyle = th.grid;
  ctx.fillStyle = th.faint;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (const tv of ticks) {
    const x = Math.round(sx(tv)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
    ctx.fillText(tick(tv, d.format, hi), x, y1 + 3);
  }
  const band = (y1 - y0) / G;
  const bh = Math.min(18, Math.max(4, band - 8));
  d.groups.forEach((g, i) => {
    const cy = y0 + band * i + band / 2;
    const dim = (focus && !focus(i)) || (hover && hover.i !== i);
    ctx.globalAlpha = dim ? 0.45 : 1;
    ctx.fillStyle = th.dim;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(ellipsize(ctx, g.label, x0 - 10), x0 - 6, cy);
    const [a, b, c, e, f] = g.q.map(sx);
    if (![a, b, c, e, f].every(Number.isFinite)) return;
    ctx.strokeStyle = th.series[0];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a, cy);
    ctx.lineTo(b, cy);
    ctx.moveTo(e, cy);
    ctx.lineTo(f, cy);
    ctx.moveTo(a, cy - bh / 4);
    ctx.lineTo(a, cy + bh / 4);
    ctx.moveTo(f, cy - bh / 4);
    ctx.lineTo(f, cy + bh / 4);
    ctx.stroke();
    ctx.fillStyle = mix(th.series[0].startsWith('#') ? th.series[0] : '#3987e5', th.surface.startsWith('#') ? th.surface : '#0e1218', 0.55);
    ctx.beginPath();
    ctx.roundRect(b, cy - bh / 2, Math.max(2, e - b), bh, 3);
    ctx.fill();
    ctx.strokeStyle = th.text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c, cy - bh / 2);
    ctx.lineTo(c, cy + bh / 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    hits.push({ x: 0, y: cy - band / 2, w, h: band, i });
  });
  ctx.lineWidth = 1;
  return hits;
}

/** Percentile bands over an axis: p10-p90 faint, p25-p75 stronger, the median a line. */
export function paintBands(ctx: CanvasRenderingContext2D, d: BandsData, th: ChartTheme, w: number, h: number, hover: PHit | null): PHit[] {
  ctx.clearRect(0, 0, w, h);
  const hits: PHit[] = [];
  const n = d.bins.length;
  let lo = Infinity;
  let hi = -Infinity;
  for (const b of d.bins) for (const v of b) if (Number.isFinite(v)) (lo = Math.min(lo, v)), (hi = Math.max(hi, v));
  if (!Number.isFinite(lo)) return hits;
  const ticks = niceTicks(lo, hi > lo ? hi : lo + 1, Math.max(2, Math.floor(h / 45)));
  const vlo = Math.min(lo, ticks[0]);
  const vhi = Math.max(hi, ticks[ticks.length - 1]);
  ctx.font = font(th);
  let axisW = 0;
  for (const tv of ticks) axisW = Math.max(axisW, ctx.measureText(tick(tv, d.format, vhi)).width);
  const x0 = Math.ceil(axisW) + 8;
  const x1 = w - 6;
  const y0 = 22;
  const y1 = h - 18;
  const sx = (i: number) => x0 + ((x1 - x0) * (i + 0.5)) / n;
  const sy = (v: number) => y1 - ((y1 - y0) * (v - vlo)) / (vhi - vlo || 1);
  ctx.strokeStyle = th.grid;
  ctx.fillStyle = th.faint;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (const tv of ticks) {
    const y = Math.round(sy(tv)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.fillText(tick(tv, d.format, vhi), x0 - 4, y);
  }
  const c = th.series[0];
  const band = (a: number, b: number, alpha: number) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = c;
    let open = false;
    const pts: [number, number, number][] = [];
    for (let i = 0; i < n; i++) if (Number.isFinite(d.bins[i][a]) && Number.isFinite(d.bins[i][b])) pts.push([sx(i), sy(d.bins[i][a]), sy(d.bins[i][b])]);
    if (pts.length < 2) return;
    ctx.beginPath();
    for (const p of pts) {
      if (!open) ctx.moveTo(p[0], p[2]);
      else ctx.lineTo(p[0], p[2]);
      open = true;
    }
    for (let k = pts.length - 1; k >= 0; k--) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  band(0, 4, 0.18);
  band(1, 3, 0.35);
  ctx.strokeStyle = c;
  ctx.lineWidth = 2;
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < n; i++) {
    const v = d.bins[i][2];
    if (!Number.isFinite(v)) {
      started = false;
      continue;
    }
    if (!started) ctx.moveTo(sx(i), sy(v));
    else ctx.lineTo(sx(i), sy(v));
    started = true;
  }
  ctx.stroke();
  ctx.lineWidth = 1;
  // The axis' ends.
  ctx.fillStyle = th.faint;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  const say = (v: number) => (d.axis.time ? clock(v) : fmtValue(v, 'dec', true));
  ctx.fillText(say(d.axis.lo), x0, y1 + 3);
  ctx.textAlign = 'right';
  ctx.fillText(say(d.axis.hi), x1, y1 + 3);
  // Key.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = th.dim;
  ctx.fillText('p10-p90 · p25-p75 · median', x0, 9);
  for (let i = 0; i < n; i++) hits.push({ x: sx(i) - (x1 - x0) / n / 2, y: y0, w: (x1 - x0) / n, h: y1 - y0, i });
  if (hover) {
    ctx.strokeStyle = th.axis;
    ctx.beginPath();
    ctx.moveTo(sx(hover.i), y0);
    ctx.lineTo(sx(hover.i), y1);
    ctx.stroke();
  }
  return hits;
}

/** Bubbles: one point per group at (x, y), its area by the size measure; a 2 px surface ring. */
export function paintBubbles(ctx: CanvasRenderingContext2D, d: BubbleData, th: ChartTheme, w: number, h: number, colors: (key: string, team?: number) => string, hover: PHit | null, focus: ((i: number) => boolean) | null): PHit[] {
  ctx.clearRect(0, 0, w, h);
  const hits: PHit[] = [];
  const pts = d.points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (!pts.length) return hits;
  const ext = (f: (p: (typeof pts)[number]) => number) => [Math.min(...pts.map(f)), Math.max(...pts.map(f))];
  const [xl, xh] = ext((p) => p.x);
  const [yl, yh] = ext((p) => p.y);
  const rmax = Math.max(...pts.map((p) => (Number.isFinite(p.r) ? p.r : 0))) || 1;
  const xt = niceTicks(xl, xh > xl ? xh : xl + 1, Math.max(2, Math.floor(w / 80)));
  const yt = niceTicks(yl, yh > yl ? yh : yl + 1, Math.max(2, Math.floor(h / 45)));
  const x0 = 44;
  const x1 = w - 10;
  const y0 = 10;
  const y1 = h - 30;
  const xa = Math.min(xl, xt[0]);
  const xb = Math.max(xh, xt[xt.length - 1]);
  const ya = Math.min(yl, yt[0]);
  const yb = Math.max(yh, yt[yt.length - 1]);
  const sx = (v: number) => x0 + ((x1 - x0) * (v - xa)) / (xb - xa || 1);
  const sy = (v: number) => y1 - ((y1 - y0) * (v - ya)) / (yb - ya || 1);
  ctx.font = font(th);
  ctx.strokeStyle = th.grid;
  ctx.fillStyle = th.faint;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (const tv of xt) {
    const x = Math.round(sx(tv)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
    ctx.fillText(tick(tv, d.formats[0], xb), x, y1 + 3);
  }
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (const tv of yt) {
    const y = Math.round(sy(tv)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.fillText(tick(tv, d.formats[1], yb), x0 - 4, y);
  }
  ctx.fillStyle = th.dim;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(d.names[0], (x0 + x1) / 2, h - 1);
  ctx.save();
  ctx.translate(10, (y0 + y1) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textBaseline = 'middle';
  ctx.fillText(d.names[1], 0, 0);
  ctx.restore();
  const order = d.points.map((p, i) => ({ p, i })).sort((a, b) => (b.p.r || 0) - (a.p.r || 0));
  for (const { p, i } of order) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    const r = d.names[2] ? 4 + 14 * Math.sqrt(Math.max(0, p.r) / rmax) : 4.5;
    const x = sx(p.x);
    const y = sy(p.y);
    const dim = (focus && !focus(i)) || (hover && hover.i !== i);
    ctx.globalAlpha = dim ? 0.35 : 0.9;
    ctx.fillStyle = colors(p.key, p.team);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = th.surface;
    ctx.lineWidth = 2;
    ctx.stroke();
    hits.push({ x: x - Math.max(12, r), y: y - Math.max(12, r), w: 2 * Math.max(12, r), h: 2 * Math.max(12, r), i });
  }
  ctx.lineWidth = 1;
  // Hits nearest first: the smallest drawn last win.
  return hits.reverse();
}

/** The mini map: the selection's rows seen from above, one blue from the surface (few) to dark (many). */
export function paintMap(ctx: CanvasRenderingContext2D, d: MapData, th: ChartTheme, w: number, h: number, marker: { x: number; z: number } | null): PHit[] {
  ctx.clearRect(0, 0, w, h);
  const side = Math.min(w, h);
  const ox = (w - side) / 2;
  const oy = (h - side) / 2;
  const cell = side / d.n;
  ctx.fillStyle = th.dark ? mix('#0e1218', th.surface.startsWith('#') ? th.surface : '#0e1218', 0.5) : th.surface;
  ctx.strokeStyle = th.grid;
  ctx.strokeRect(ox + 0.5, oy + 0.5, side - 1, side - 1);
  const src = d.hl ?? d.counts;
  let max = 0;
  for (let i = 0; i < src.length; i++) if (src[i] > max) max = src[i];
  if (max <= 0) return [];
  const lg = Math.log1p(max);
  for (let j = 0; j < d.n; j++)
    for (let i = 0; i < d.n; i++) {
      const v = src[i + d.n * j];
      const base = d.hl ? d.counts[i + d.n * j] : 0;
      if (v <= 0 && base <= 0) continue;
      const t = v > 0 ? Math.log1p(v) / lg : 0;
      ctx.fillStyle = v > 0 ? mix(th.seqLo, th.seqHi, 0.15 + 0.85 * t) : th.grid;
      // North up: z grows downwards in the view from above.
      ctx.fillRect(ox + i * cell, oy + j * cell, Math.ceil(cell), Math.ceil(cell));
    }
  if (marker) {
    const mx = ox + ((marker.x - d.lo[0]) / (d.step * d.n)) * side;
    const mz = oy + ((marker.z - d.lo[1]) / (d.step * d.n)) * side;
    ctx.strokeStyle = th.text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mx, mz, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
  }
  return [{ x: ox, y: oy, w: side, h: side, i: 0 }];
}

/** Top-N as a meter list: a name, a bar and the figure per row, bars aligned. */
export function paintTopN(ctx: CanvasRenderingContext2D, d: ItemsData, th: ChartTheme, w: number, h: number, colors: (key: string, team?: number) => string, hover: PHit | null, focus: ((i: number) => boolean) | null): PHit[] {
  ctx.clearRect(0, 0, w, h);
  const hits: PHit[] = [];
  const n = d.items.length;
  if (!n) return hits;
  const rowH = Math.max(16, Math.min(28, h / n));
  const max = Math.max(...d.items.map((x) => (Number.isFinite(x.value) ? x.value : 0))) || 1;
  ctx.font = font(th);
  let labelW = 0;
  for (const it of d.items) labelW = Math.max(labelW, ctx.measureText(it.label).width);
  labelW = Math.min(Math.round(w * 0.42), Math.ceil(labelW) + 26);
  const valW = 56;
  const x0 = labelW;
  const x1 = w - valW;
  d.items.forEach((it, i) => {
    const y = i * rowH;
    if (y + rowH > h + 1) return;
    const dim = (focus && !focus(i)) || (hover && hover.i !== i);
    ctx.globalAlpha = dim ? 0.45 : 1;
    ctx.fillStyle = th.faint;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), 16, y + rowH / 2);
    ctx.fillStyle = th.text;
    ctx.textAlign = 'left';
    ctx.fillText(ellipsize(ctx, it.label, labelW - 28), 22, y + rowH / 2);
    ctx.fillStyle = th.grid;
    ctx.beginPath();
    ctx.roundRect(x0, y + rowH / 2 - 3, x1 - x0, 6, 3);
    ctx.fill();
    ctx.fillStyle = colors(it.key, it.team);
    const len = ((x1 - x0) * Math.max(0, it.value)) / max;
    ctx.beginPath();
    ctx.roundRect(x0, y + rowH / 2 - 3, Math.max(2, len), 6, 3);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = th.text;
    ctx.textAlign = 'right';
    ctx.font = font(th, FS, 550);
    ctx.fillText(fmtValue(it.value, d.format, true), w - 2, y + rowH / 2);
    ctx.font = font(th);
    hits.push({ x: 0, y, w, h: rowH, i });
  });
  return hits;
}

export function hitOf(hits: readonly PHit[], x: number, y: number): PHit | null {
  for (const h of hits) if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h;
  return null;
}
