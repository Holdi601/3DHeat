/**
 * A dashboard out of the viewer: its JSON (`heat3d.dashboard/1`, read back
 * by `parseBundle`), a page as a PNG or a one-page PDF (the page drawn onto
 * one canvas, every tile by the same painters as on screen), a table's or a
 * chart's numbers as CSV - a text that starts like a formula kept as text
 * (`csvField`, the same guard the recording export uses), so a spreadsheet
 * never runs a player's name.
 */

import { drawChart, ellipsize } from '../charts/draw';
import { fmtValue, localizeChart } from '../charts/format';
import { colorChart, DARK_THEME, LIGHT_THEME, type ChartTheme } from '../charts/palette';
import { csvField } from '../data/exportRecording';
import { t } from '../i18n';
import { teamCss } from '../render/colors';
import type { TileData } from './finish';
import { GRID_COLS, type DashBundle, type Tile } from './model';
import { paintBands, paintBox, paintBubbles, paintColumns, paintMap, paintTopN, paintTreemap } from './paint';

/** Labels the finishing leaves as keys (`@other`, `dash.hl.selected`) in words. */
export function sayDash(label: string): string {
  if (label.startsWith('dash.')) return t(label);
  if (label === '@all') return t('dash.hl.all');
  if (label.startsWith('@')) return t(`charts.label.${label.slice(1)}`);
  return label;
}

/** A chart's labels in words (a copy). */
export function sayChart<T extends { groups: { label: string }[]; series: { label: string }[]; valueLabel: string }>(d: T): T {
  const c = structuredClone(d);
  localizeChart(c as never);
  for (const e of [...c.groups, ...c.series]) e.label = sayDash(e.label);
  return c;
}

/** Colours by entity, the same function every painter of a tile uses. */
export function colorFn(theme: ChartTheme, memory: Map<string, number>): (key: string, team?: number) => string {
  return (key, team) => {
    if (key === 'other') return theme.other;
    if (team !== undefined && team >= 0) return teamCss(team);
    let slot = memory.get(key);
    if (slot === undefined) {
      const used = new Set(memory.values());
      slot = 0;
      while (used.has(slot) && slot < theme.series.length) slot++;
      if (slot >= theme.series.length) slot = memory.size % theme.series.length;
      memory.set(key, slot);
    }
    return theme.series[slot];
  };
}

/** Paint a tile's data into a box of a canvas (the export; on screen each visual has its own canvas). */
export function paintTileData(ctx: CanvasRenderingContext2D, tile: Tile, d: TileData | undefined, th: ChartTheme, w: number, h: number): void {
  const mem = new Map<string, number>();
  const colors = colorFn(th, mem);
  ctx.font = `400 11px ${th.font}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  if (tile.kind === 'text' || tile.kind === 'title') {
    ctx.fillStyle = th.text;
    const size = tile.opts?.size === 'h1' ? 22 : tile.opts?.size === 'h2' ? 16 : 12;
    ctx.font = `${tile.kind === 'title' ? 650 : 400} ${size}px ${th.font}`;
    wrap(ctx, tile.text ?? '', 0, 0, w, size * 1.35, h);
    return;
  }
  if (!d) return;
  switch (d.kind) {
    case 'chart': {
      const c = sayChart(d.chart);
      colorChart(c, th, mem);
      if (tile.kind === 'column') paintColumns(ctx, c, th, w, h, tile.opts?.stack === 'stacked' || tile.opts?.stack === 'percent' || c.kind === 'stacked', null, null);
      else drawChart(ctx, c, th, w, h);
      return;
    }
    case 'kpi': {
      ctx.fillStyle = th.text;
      ctx.font = `650 ${Math.min(40, h * 0.42)}px ${th.font}`;
      ctx.fillText(fmtValue(d.value, d.format, true), 0, 4);
      if (d.compare) {
        ctx.font = `400 11px ${th.font}`;
        ctx.fillStyle = th.dim;
        ctx.fillText(`${sayDash(d.compare.label)} ${fmtValue(d.compare.value, d.format, true)}`, 0, Math.min(52, h * 0.5) + 6);
      }
      return;
    }
    case 'items':
      if (tile.kind === 'treemap') paintTreemap(ctx, { ...d, items: d.items.map((x) => ({ ...x, label: sayDash(x.label) })) }, th, w, h, colors, null, null);
      else paintTopN(ctx, d, th, w, h, colors, null, null);
      return;
    case 'box':
      paintBox(ctx, d, th, w, h, null, null);
      return;
    case 'bands':
      paintBands(ctx, d, th, w, h, null);
      return;
    case 'bubble':
      paintBubbles(ctx, d, th, w, h, colors, null, null);
      return;
    case 'map':
      paintMap(ctx, d, th, w, h, null);
      return;
    case 'table':
    case 'pivot': {
      const rows = csvRows(d);
      const rowH = 16;
      const cols = rows[0]?.length ?? 1;
      const cw = w / cols;
      rows.slice(0, Math.floor(h / rowH)).forEach((r, i) => {
        ctx.fillStyle = i === 0 ? th.dim : th.text;
        ctx.font = `${i === 0 ? 600 : 400} 10.5px ${th.font}`;
        r.forEach((cell, j) => {
          ctx.textAlign = j === 0 ? 'left' : 'right';
          ctx.fillText(ellipsize(ctx, cell, cw - 6), j === 0 ? 0 : (j + 1) * cw - 3, i * rowH);
        });
      });
      return;
    }
    case 'slicer':
      return;
    case 'empty':
      ctx.fillStyle = th.faint;
      ctx.fillText(t(d.message, d.values ?? {}), 0, 0);
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, w: number, lh: number, h: number): void {
  let yy = y;
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > w && line) {
        ctx.fillText(line, x, yy);
        yy += lh;
        line = word;
        if (yy > h) return;
      } else line = next;
    }
    ctx.fillText(line, x, yy);
    yy += lh;
    if (yy > h) return;
  }
}

/** A slicer's value said in words, for the export. */
export type SlicerText = (tile: Tile) => string;

/**
 * A page onto one canvas: each tile a card at its grid place, its title, its
 * visual. `width` px wide; rows scale with it.
 */
export function pageCanvas(b: DashBundle, pageId: string, results: ReadonlyMap<string, TileData>, dark: boolean, slicerText: SlicerText, width = 1600): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const th = dark ? DARK_THEME : LIGHT_THEME;
  const tiles = b.tiles.filter((x) => x.pageId === pageId);
  const col = width / GRID_COLS;
  const row = col * 0.5;
  const rows = tiles.reduce((m, x) => Math.max(m, x.y + x.h), 1);
  const page = b.pages.find((p) => p.id === pageId);
  const head = 40;
  const height = Math.ceil(head + rows * row + 12);
  const c = document.createElement('canvas');
  const scale = 2;
  c.width = width * scale;
  c.height = height * scale;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.fillStyle = dark ? '#07090d' : '#e9edf2';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = th.text;
  ctx.font = `650 16px ${th.font}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(`${b.dashboard.name}${page ? ` - ${page.name}` : ''}`, 14, head / 2);
  for (const tile of tiles) {
    const x = tile.x * col + 6;
    const y = head + tile.y * row + 6;
    const w = tile.w * col - 12;
    const h = tile.h * row - 12;
    const deco = tile.kind === 'title' || tile.kind === 'text';
    if (!deco) {
      ctx.fillStyle = th.surface;
      ctx.strokeStyle = dark ? '#242c38' : '#d3dae3';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fill();
      ctx.stroke();
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    let top = 8;
    if (tile.title && !deco) {
      ctx.fillStyle = th.text;
      ctx.font = `600 12px ${th.font}`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillText(ellipsize(ctx, tile.title, w - 20), x + 10, y + 8);
      top = 28;
    }
    ctx.translate(x + 10, y + top);
    if (tile.kind === 'slicer') {
      ctx.fillStyle = th.dim;
      ctx.font = `400 11px ${th.font}`;
      ctx.textBaseline = 'top';
      ctx.fillText(ellipsize(ctx, slicerText(tile), w - 20), 0, 0);
    } else if (tile.kind === 'image' && tile.src) {
      // Drawn by the caller once loaded (`drawImages`).
    } else paintTileData(ctx, tile, results.get(tile.id), th, w - 20, h - top - 8);
    ctx.restore();
  }
  return c;
}

/** Image tiles onto the page's canvas (their pictures load first). */
export async function drawImages(c: HTMLCanvasElement, b: DashBundle, pageId: string, width = 1600): Promise<void> {
  const ctx = c.getContext('2d');
  if (!ctx) return;
  const col = width / GRID_COLS;
  const row = col * 0.5;
  for (const tile of b.tiles.filter((x) => x.pageId === pageId && x.kind === 'image' && x.src)) {
    const img = new Image();
    img.src = tile.src!;
    try {
      await img.decode();
    } catch {
      continue;
    }
    const w = tile.w * col - 12;
    const h = tile.h * row - 12;
    const k = Math.min(w / img.width, h / img.height);
    ctx.drawImage(img, tile.x * col + 6 + (w - img.width * k) / 2, 40 + tile.y * row + 6 + (h - img.height * k) / 2, img.width * k, img.height * k);
  }
}

/** A one-page PDF around a JPEG (no library: the page, its image, the drawing that places it). */
export function jpegPdf(jpeg: Uint8Array, pxW: number, pxH: number): Uint8Array {
  const W = 842;
  const H = Math.round((W * pxH) / pxW);
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let size = 0;
  const push = (b: Uint8Array | string) => {
    const u = typeof b === 'string' ? enc.encode(b) : b;
    parts.push(u);
    size += u.length;
  };
  const obj = (n: number, body: () => void) => {
    offsets[n] = size;
    push(`${n} 0 obj\n`);
    body();
    push('\nendobj\n');
  };
  push('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
  obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () => push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
  obj(3, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`));
  obj(4, () => {
    push(`<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
    push(jpeg);
    push('\nendstream');
  });
  const draw = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
  obj(5, () => push(`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`));
  const xref = size;
  push(`xref\n0 6\n0000000000 65535 f \n${[1, 2, 3, 4, 5].map((n) => `${String(offsets[n]).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const out = new Uint8Array(size);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** A canvas as a PDF page. */
export async function canvasPdf(c: HTMLCanvasElement): Promise<Uint8Array> {
  const url = c.toDataURL('image/jpeg', 0.92);
  const bin = atob(url.slice(url.indexOf(',') + 1));
  const jpeg = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) jpeg[i] = bin.charCodeAt(i);
  return jpegPdf(jpeg, c.width, c.height);
}

/** A tile's numbers as rows of text: the table view of any visual that has numbers. */
export function csvRows(d: TileData): string[][] {
  const v = (x: number, f: Parameters<typeof fmtValue>[1]) => (Number.isFinite(x) ? String(Number(x.toPrecision(10))) : fmtValue(x, f));
  switch (d.kind) {
    case 'table':
      return [d.head, ...d.rows.map((r) => [...r.labels, ...r.values.map((x, i) => v(x, d.formats[i]))])];
    case 'pivot': {
      const out: string[][] = [[...d.rowHead, ...d.cols.map((c) => c.label), 'Total']];
      d.rows.forEach((r, i) => out.push([...r.labels, ...d.values[0][i].map((x) => v(x, d.measures[0].format)), v(d.rowTotals[0][i], d.measures[0].format)]));
      return out;
    }
    case 'chart': {
      const c = sayChart(d.chart);
      return [['', ...c.series.map((s) => s.label)], ...c.groups.map((g, gi) => [g.label, ...c.series.map((_s, si) => v(c.values[si][gi], c.format))])];
    }
    case 'items':
      return [['', d.name], ...d.items.map((x) => [sayDash(x.label), v(x.value, d.format)])];
    case 'kpi':
      return [[d.name, ...(d.compare ? [sayDash(d.compare.label)] : [])], [v(d.value, d.format), ...(d.compare ? [v(d.compare.value, d.format)] : [])]];
    case 'box':
      return [['', 'p5', 'p25', 'median', 'p75', 'p95', 'rows'], ...d.groups.map((g) => [g.label, ...g.q.map((x) => v(x, d.format)), String(g.n)])];
    case 'bands':
      return [['bin', 'p10', 'p25', 'median', 'p75', 'p90'], ...d.bins.map((b, i) => [String(i), ...b.map((x) => v(x, d.format))])];
    case 'bubble':
      return [['', d.names[0], d.names[1], ...(d.names[2] ? [d.names[2]] : [])], ...d.points.map((p) => [p.label, v(p.x, d.formats[0]), v(p.y, d.formats[1]), ...(d.names[2] ? [v(p.r, 'dec')] : [])])];
    case 'slicer':
      return [['', 'rows'], ...d.items.map((x) => [x.label, String(x.count)])];
    default:
      return [];
  }
}

/** CSV with formula injection kept out: every text that starts like a formula stays text. */
export function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map((c) => csvField(c)).join(',')).join('\r\n') + '\r\n';
}

export function downloadBlob(name: string, data: BlobPart, type: string): void {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** A file name from a dashboard's name. */
export function fileName(name: string, ext: string): string {
  return `${(name || 'dashboard').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'dashboard'}.${ext}`;
}
