/**
 * The charts' colours and inks.
 *
 * Series wear eight categorical slots in a fixed order - the same hues
 * stepped once for the dark surface and once for the light one, each set
 * run through the dataviz validator against this viewer's panel surfaces
 * (`--panel` in app.css): dark on #0e1218 passes every check (worst adjacent
 * CVD distance 8.4, normal vision 19.3, all >= 3:1); light on #fbfcfd passes
 * the separation checks (CVD 9.1, normal 19.6) but aqua, yellow and magenta
 * sit under 3:1, so a chart in the light theme always carries its legend and
 * a table view. A ninth series is never a new hue: it folds into "Other".
 *
 * A series that is a team wears the team palette's colour (Auto / Soft /
 * Strong, `render/colors.ts`), the same as everywhere else in the viewer, in
 * both themes. Magnitude (the matrix, the scatter's density) is one hue,
 * light to dark. Text is never drawn in a series colour.
 */

import { teamCss } from '../render/colors';
import type { ChartData, ChartEntity } from './types';

export const SERIES_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#0ca30c', '#9085e9', '#e66767'];
export const SERIES_LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
/** "Other" and the context side of a comparison (outside the volume): a neutral. */
export const OTHER_DARK = '#6b7383';
export const OTHER_LIGHT = '#9aa1ab';

export interface ChartTheme {
  dark: boolean;
  surface: string;
  text: string;
  dim: string;
  faint: string;
  grid: string;
  axis: string;
  series: readonly string[];
  other: string;
  /** The sequential hue's ends: near zero (towards the surface) and the most. */
  seqLo: string;
  seqHi: string;
  font: string;
}

export const DARK_THEME: ChartTheme = {
  dark: true,
  surface: '#0e1218',
  text: '#e6ebf2',
  dim: '#a3adbd',
  faint: '#7d8899',
  grid: '#19202a',
  axis: '#344052',
  series: SERIES_DARK,
  other: OTHER_DARK,
  seqLo: '#16263b',
  seqHi: '#6da7ec',
  font: "'Inter', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif",
};

export const LIGHT_THEME: ChartTheme = {
  dark: false,
  surface: '#fbfcfd',
  text: '#121821',
  dim: '#3f4a5a',
  faint: '#5f6b7c',
  grid: '#e3e8ee',
  axis: '#b9c3cf',
  series: SERIES_LIGHT,
  other: OTHER_LIGHT,
  seqLo: '#cde2fb',
  seqHi: '#184f95',
  font: DARK_THEME.font,
};

/** Relative luminance of a #rrggbb colour (or an rgb() string). */
function luminance(c: string): number {
  let r = 0;
  let g = 0;
  let b = 0;
  const m = /^#([0-9a-f]{6})$/i.exec(c.trim());
  if (m) {
    const v = parseInt(m[1], 16);
    r = (v >> 16) & 255;
    g = (v >> 8) & 255;
    b = v & 255;
  } else {
    const n = c.match(/[\d.]+/g);
    if (!n || n.length < 3) return 0;
    [r, g, b] = n.map(Number);
  }
  const lin = (x: number) => {
    const s = x / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * The theme an element is drawn in, from the design tokens it inherits
 * (app.css): the surface, the inks and the lines, and the series set that
 * was validated for a surface that light or that dark.
 */
export function readTheme(el: Element | null): ChartTheme {
  if (!el || typeof getComputedStyle !== 'function') return DARK_THEME;
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const surface = v('--panel', DARK_THEME.surface);
  const dark = luminance(surface) < 0.3;
  const base = dark ? DARK_THEME : LIGHT_THEME;
  return {
    ...base,
    surface,
    text: v('--text', base.text),
    dim: v('--text-dim', base.dim),
    faint: v('--text-faint', base.faint),
    grid: v('--line-soft', base.grid),
    axis: v('--line-strong', base.axis),
    font: v('--font-ui', base.font),
  };
}

/**
 * Colours for a chart's series (and a pie's parts), following the entity:
 * `memory` remembers which slot each entity took, so a filter that changes
 * which series are drawn does not repaint the ones that stay. Teams wear the
 * team palette; "Other" and "outside" the neutral.
 */
export function colorChart(data: ChartData, theme: ChartTheme, memory: Map<string, number>): void {
  const paint = (list: ChartEntity[]) => {
    const live = new Set(list.map((e) => e.key));
    for (const e of list) {
      if (e.key === 'other' || e.key === 'outside') {
        e.color = theme.other;
        continue;
      }
      if (e.team !== undefined && e.team >= 0) {
        e.color = teamCss(e.team);
        continue;
      }
      let slot = memory.get(e.key);
      if (slot === undefined) {
        const used = new Set<number>();
        for (const [k, s] of memory) if (live.has(k)) used.add(s);
        slot = -1;
        for (let i = 0; i < theme.series.length; i++) if (!used.has(i) && ![...memory.values()].includes(i)) {
          slot = i;
          break;
        }
        // Every slot taken once: reuse one whose entity is not drawn now.
        if (slot < 0) for (let i = 0; i < theme.series.length; i++) if (!used.has(i)) {
          slot = i;
          break;
        }
        if (slot >= 0) {
          for (const [k, s] of memory) if (s === slot) memory.delete(k);
          memory.set(e.key, slot);
        }
      }
      e.color = slot !== undefined && slot >= 0 ? theme.series[slot] : theme.other;
    }
  };
  // Pie parts are what the colours tell apart; elsewhere the series are.
  if (data.kind === 'pie') paint(data.groups);
  else if (data.kind !== 'matrix' && data.kind !== 'scatter') paint(data.series);
}

/** A colour between two #rrggbb colours. */
export function mix(a: string, b: string, f: number): string {
  const p = (c: string) => {
    const v = parseInt(c.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const x = p(a);
  const y = p(b);
  const k = Math.max(0, Math.min(1, f));
  return `rgb(${Math.round(x[0] + (y[0] - x[0]) * k)}, ${Math.round(x[1] + (y[1] - x[1]) * k)}, ${Math.round(x[2] + (y[2] - x[2]) * k)})`;
}

/** Near-black or white for a label set inside a fill, by the fill's luminance. */
export function inkOn(fill: string): string {
  return luminance(fill) > 0.42 ? '#0b0b0b' : '#ffffff';
}
