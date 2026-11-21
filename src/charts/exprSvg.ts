/**
 * A chart's numbers (`ExprChartData`) drawn as one SVG string: bars (side by side
 * for two sides), a line over time, or tiles of the numbers. The same string
 * is shown in the viewer and written into an exported document, so it holds
 * everything it needs: the colours come from CSS variables with the light
 * theme's values as fallbacks (`--chart-1`, `--chart-2`, `--chart-ink`,
 * `--chart-grid`), each mark carries a <title> for its hover tooltip, and two
 * sides get a legend and direct labels.
 *
 * Series colours are the two categorical slots, validated for colour-blind
 * separation against both themes' surfaces (light #0b6fb8 / #c2491f, dark
 * #1f95cf / #e0612f; see app.css `.chart-svg`).
 */

import type { ExprChartData, ExprChartSpec } from './exprSpec';

const SERIES = ['var(--chart-1, #0b6fb8)', 'var(--chart-2, #c2491f)'];
const INK = 'var(--chart-ink, #3f4a5a)';
const GRID = 'var(--chart-grid, #d3dae3)';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A number short: 12.3k, 4.56, 0.0123. */
export function shortNumber(v: number): string {
  if (!Number.isFinite(v)) return '–';
  const a = Math.abs(v);
  if (a >= 1e9) return `${+(v / 1e9).toPrecision(3)}G`;
  if (a >= 1e6) return `${+(v / 1e6).toPrecision(3)}M`;
  if (a >= 1e4) return `${+(v / 1e3).toPrecision(3)}k`;
  if (a >= 100) return String(Math.round(v));
  return String(+v.toPrecision(3));
}

/** A round step for an axis to `max` in about `n` ticks. */
function niceStep(max: number, n = 4): number {
  if (!(max > 0)) return 1;
  const raw = max / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}

/** The label as shown: the pass's "other" bucket in words. */
const label = (l: string, other: string) => (l === '\u0000other' || l === '' ? other : l);

export interface SvgOptions {
  width?: number;
  height?: number;
  /** Words for the "other" bucket and an empty chart, in the viewer's language. */
  other?: string;
  empty?: string;
}

/** The chart as an SVG element's markup. */
export function exprChartSvg(spec: Pick<ExprChartSpec, 'kind' | 'title'>, data: ExprChartData, o: SvgOptions = {}): string {
  const W = o.width ?? 560;
  const H = o.height ?? 260;
  const other = o.other ?? 'other';
  const head = `<svg xmlns="http://www.w3.org/2000/svg" class="chart-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(spec.title ?? data.series.map((s) => s.label).join(' / '))}" font-family="system-ui, sans-serif" font-size="11">`;
  const finite = data.series.flatMap((s) => s.values).filter(Number.isFinite);
  if (!data.labels.length || !finite.length) return `${head}<text x="${W / 2}" y="${H / 2}" text-anchor="middle" fill="${INK}">${esc(o.empty ?? 'No data')}</text></svg>`;
  if (spec.kind === 'tiles') return tiles(head, data, W, H, other);
  const two = data.series.length > 1;
  const top = two ? 26 : 10;
  const left = 44;
  const bottom = 34;
  const right = 10;
  const pw = W - left - right;
  const ph = H - top - bottom;
  const lo = Math.min(0, ...finite);
  const hi = Math.max(0, ...finite);
  const step = niceStep(Math.max(hi, -lo) || 1);
  const yMax = hi > 0 ? Math.ceil(hi / step) * step : 0;
  const yMin = lo < 0 ? Math.floor(lo / step) * step : 0;
  const y = (v: number) => top + ph - ((v - yMin) / (yMax - yMin || 1)) * ph;
  const out: string[] = [head];
  // Recessive grid and its numbers.
  for (let v = yMin; v <= yMax + step * 1e-6; v += step) {
    const yy = y(v).toFixed(1);
    out.push(`<line x1="${left}" x2="${W - right}" y1="${yy}" y2="${yy}" stroke="${GRID}" stroke-width="1"/>`);
    out.push(`<text x="${left - 6}" y="${yy}" dy="0.32em" text-anchor="end" fill="${INK}">${esc(shortNumber(v))}</text>`);
  }
  if (two)
    data.series.forEach((s, i) => {
      const x = left + i * 140;
      out.push(`<rect x="${x}" y="6" width="10" height="10" rx="2" fill="${SERIES[i % 2]}"/><text x="${x + 15}" y="14" fill="${INK}">${esc(s.label)}</text>`);
    });
  const n = data.labels.length;
  if (spec.kind === 'line') {
    const x = (i: number) => left + (n === 1 ? pw / 2 : (i / (n - 1)) * pw);
    data.series.forEach((s, si) => {
      const pts = s.values.map((v, i) => (Number.isFinite(v) ? `${x(i).toFixed(1)},${y(v).toFixed(1)}` : null)).filter(Boolean);
      out.push(`<polyline fill="none" stroke="${SERIES[si % 2]}" stroke-width="2" stroke-linejoin="round" points="${pts.join(' ')}"/>`);
      s.values.forEach((v, i) => {
        if (!Number.isFinite(v)) return;
        out.push(`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="6" fill="transparent"><title>${esc(`${s.label} · ${label(data.labels[i], other)}: ${shortNumber(v)}${data.unit ? ` ${data.unit}` : ''}`)}</title></circle>`);
      });
    });
    const every = Math.max(1, Math.ceil(n / 8));
    for (let i = 0; i < n; i += every) out.push(`<text x="${x(i).toFixed(1)}" y="${H - bottom + 16}" text-anchor="middle" fill="${INK}">${esc(label(data.labels[i], other))}</text>`);
  } else {
    const band = pw / n;
    const gap = 2;
    const groupW = Math.min(band * 0.8, 90);
    const barW = Math.max(1, (groupW - gap * (data.series.length - 1)) / data.series.length);
    const zero = y(0);
    for (let i = 0; i < n; i++) {
      const gx = left + band * i + (band - groupW) / 2;
      data.series.forEach((s, si) => {
        const v = s.values[i];
        if (!Number.isFinite(v)) return;
        const bx = gx + si * (barW + gap);
        const yy = y(v);
        const h = Math.abs(zero - yy);
        const r = Math.min(4, barW / 2, h);
        // Rounded at the data end, square on the baseline.
        const up = v >= 0;
        const y0 = up ? yy : zero;
        const d = up
          ? `M${bx},${zero}V${y0 + r}Q${bx},${y0} ${bx + r},${y0}H${bx + barW - r}Q${bx + barW},${y0} ${bx + barW},${y0 + r}V${zero}Z`
          : `M${bx},${zero}V${zero + h - r}Q${bx},${zero + h} ${bx + r},${zero + h}H${bx + barW - r}Q${bx + barW},${zero + h} ${bx + barW},${zero + h - r}V${zero}Z`;
        out.push(`<path d="${d}" fill="${SERIES[si % 2]}"><title>${esc(`${s.label} · ${label(data.labels[i], other)}: ${shortNumber(v)}${data.unit ? ` ${data.unit}` : ''}`)}</title></path>`);
        // A few direct labels: on few bars, every value; on many, none (the tooltip has them).
        if (n * data.series.length <= 12) out.push(`<text x="${(bx + barW / 2).toFixed(1)}" y="${(up ? yy - 4 : yy + 12).toFixed(1)}" text-anchor="middle" fill="${INK}">${esc(shortNumber(v))}</text>`);
      });
      const lab = label(data.labels[i], other);
      const max = Math.max(3, Math.floor(band / 6.5));
      out.push(`<text x="${(left + band * i + band / 2).toFixed(1)}" y="${H - bottom + 16}" text-anchor="middle" fill="${INK}">${esc(lab.length > max ? `${lab.slice(0, max - 1)}…` : lab)}<title>${esc(lab)}</title></text>`);
    }
    out.push(`<line x1="${left}" x2="${W - right}" y1="${zero.toFixed(1)}" y2="${zero.toFixed(1)}" stroke="${INK}" stroke-width="1"/>`);
  }
  out.push('</svg>');
  return out.join('');
}

function tiles(head: string, data: ExprChartData, W: number, H: number, other: string): string {
  const cells = data.labels.flatMap((l, i) => data.series.map((s) => ({ name: data.series.length > 1 ? `${s.label} · ${label(l, other)}` : label(l, other), v: s.values[i] })));
  const shown = cells.slice(0, 12);
  const cols = Math.min(4, shown.length);
  const rows = Math.ceil(shown.length / cols);
  const cw = W / cols;
  const ch = H / rows;
  const out = [head];
  shown.forEach((c, i) => {
    const x = (i % cols) * cw;
    const yy = Math.floor(i / cols) * ch;
    out.push(`<text x="${(x + 10).toFixed(1)}" y="${(yy + ch / 2 - 4).toFixed(1)}" font-size="22" font-weight="600" fill="${INK}">${esc(shortNumber(c.v))}${data.unit ? `<tspan font-size="12"> ${esc(data.unit)}</tspan>` : ''}</text>`);
    out.push(`<text x="${(x + 10).toFixed(1)}" y="${(yy + ch / 2 + 14).toFixed(1)}" fill="${INK}">${esc(c.name)}</text>`);
  });
  out.push('</svg>');
  return out.join('');
}

/** The numbers as a Markdown table: the chart's table view, and its text in an exported document. */
export function exprChartTable(data: ExprChartData, other = 'other'): string {
  const head = `| | ${data.series.map((s) => s.label.replace(/\|/g, '/')).join(' | ')} |`;
  const sep = `|---|${data.series.map(() => '---:').join('|')}|`;
  const rows = data.labels.map((l, i) => `| ${label(l, other).replace(/\|/g, '/')} | ${data.series.map((s) => shortNumber(s.values[i])).join(' | ')} |`);
  return [head, sep, ...rows].join('\n');
}
