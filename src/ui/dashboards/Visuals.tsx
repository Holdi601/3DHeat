/**
 * The visuals inside a dashboard tile: the chart module's `ChartView` for
 * the charts it draws, a canvas for the dashboards' own (`dashboards/paint.ts`),
 * and HTML for KPI cards, tables, pivots and slicers. Each is drawn when its
 * data, size, hover or the theme change - never per frame - and hands a
 * clicked mark (with Ctrl for more) or a right click back to its tile.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChartView, fillTooltip } from '../../charts/ChartView';
import { fmtValue } from '../../charts/format';
import { colorChart, mix, readTheme, type ChartTheme } from '../../charts/palette';
import type { ChartData, ValueFormat } from '../../charts/types';
import { t } from '../../i18n';
import { dashClient } from '../../dashboards/client';
import { colorFn, sayChart, sayDash } from '../../dashboards/export';
import type { BandsData, BoxData, BubbleData, ItemsData, KpiData, MapData, PivotData, SlicerData, TableData, TileData } from '../../dashboards/finish';
import type { FieldInfo } from '../../dashboards/fields';
import { fieldValueText } from '../../dashboards/fields';
import type { FilterDef, Tile } from '../../dashboards/model';
import { hitOf, paintBands, paintBox, paintBubbles, paintColumns, paintMap, paintTopN, paintTreemap, type PHit } from '../../dashboards/paint';

/** A tile's data, kept up to date (re-renders when its numbers change). */
export function useTileData(tileId: string): TileData | undefined {
  const [, bump] = useState(0);
  useEffect(() => dashClient.subscribe((dirty) => (dirty.size === 0 || dirty.has(tileId)) && bump((n) => n + 1)), [tileId]);
  return dashClient.results.get(tileId);
}

/** Redraws on a theme switch (the tokens change on the root). */
export function useThemeTick(): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    const mo = new MutationObserver(() => setN((x) => x + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => mo.disconnect();
  }, []);
  return n;
}

export interface Pick {
  /** A mark's index in its visual's own list (group, row, item, point, cell). */
  index: number;
  series?: number;
  additive: boolean;
}

type PickFn = (p: Pick) => void;
type MenuFn = (p: Pick | null, x: number, y: number) => void;

/** A canvas visual: painted by `paint`, with a tooltip and clicks on its marks. */
function CanvasVisual({ w, h, paint, tip, onPick, onMenu, deps }: { w: number; h: number; paint: (ctx: CanvasRenderingContext2D, th: ChartTheme, hover: PHit | null) => PHit[]; tip: (hit: PHit) => { title: string; value: string } | null; onPick?: PickFn; onMenu?: MenuFn; deps: unknown[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const hits = useRef<PHit[]>([]);
  const [hover, setHover] = useState<PHit | null>(null);
  const tick = useThemeTick();
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c || w < 4 || h < 4) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hits.current = paint(ctx, readTheme(c), hover);
  }, [w, h, hover, tick, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  const at = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return hitOf(hits.current, e.clientX - r.left, e.clientY - r.top);
  };
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas
        ref={ref}
        style={{ width: w, height: h, display: 'block' }}
        role="img"
        onPointerMove={(e) => {
          const hh = at(e);
          if (hh?.i !== hover?.i || hh?.s !== hover?.s) setHover(hh);
          const el = tipRef.current;
          if (!el) return;
          const tt = hh ? tip(hh) : null;
          if (!tt) {
            el.style.display = 'none';
            return;
          }
          el.replaceChildren();
          const b = document.createElement('b');
          b.textContent = tt.value;
          const s = document.createElement('span');
          s.textContent = tt.title;
          el.append(b, s);
          el.style.display = '';
          const r = e.currentTarget.getBoundingClientRect();
          el.style.left = `${Math.min(w - 140, e.clientX - r.left + 12)}px`;
          el.style.top = `${Math.min(h - 24, e.clientY - r.top + 12)}px`;
        }}
        onPointerLeave={() => {
          setHover(null);
          if (tipRef.current) tipRef.current.style.display = 'none';
        }}
        onClick={(e) => {
          const hh = at(e);
          if (hh && onPick) onPick({ index: hh.i, series: hh.s, additive: e.ctrlKey || e.metaKey });
        }}
        onContextMenu={(e) => {
          if (!onMenu) return;
          e.preventDefault();
          const hh = at(e);
          onMenu(hh ? { index: hh.i, series: hh.s, additive: false } : null, e.clientX, e.clientY);
        }}
      />
      <div className="dash-tip" ref={tipRef} style={{ display: 'none' }} />
    </div>
  );
}

export interface VisualProps {
  tile: Tile;
  data: TileData;
  w: number;
  h: number;
  /** Marks of this tile that are selected (their index in the visual's list), or null when nothing is. */
  selected: ((i: number, s?: number) => boolean) | null;
  onPick: PickFn;
  onMenu: MenuFn;
  table: boolean;
  colorMemory: Map<string, number>;
}

/** The chart module's charts, and the dashboards' columns. */
function ChartVisual({ tile, data, w, h, selected, onPick, onMenu, table, colorMemory }: VisualProps & { data: Extract<TileData, { kind: 'chart' }> }) {
  const said = useMemo(() => sayChart(data.chart), [data.chart]);
  const focus = useMemo(() => (selected ? (s: number, g: number) => selected(g, s) : null), [selected]);
  if (tile.kind === 'column' && !table) {
    const stacked = tile.opts?.stack === 'stacked' || tile.opts?.stack === 'percent' || said.kind === 'stacked';
    return (
      <CanvasVisual
        w={w}
        h={h}
        deps={[said, selected, colorMemory]}
        paint={(ctx, th, hover) => {
          const d = structuredClone(said) as ChartData;
          colorChart(d, th, colorMemory);
          return paintColumns(ctx, d, th, w, h, stacked, hover, selected ? (g) => selected(g) : null);
        }}
        tip={(hh) => ({ title: `${said.groups[hh.i]?.label ?? ''}${said.series.length > 1 && hh.s !== undefined ? ` · ${said.series[hh.s]?.label}` : ''}`, value: fmtValue(said.values[hh.s ?? 0]?.[hh.i], said.format) })}
        onPick={onPick}
        onMenu={onMenu}
      />
    );
  }
  return (
    <ChartView
      data={said}
      width={w}
      height={h}
      table={table}
      colorMemory={colorMemory}
      focus={focus}
      onPick={(_e, hit, ev) => onPick({ index: hit.g, series: hit.s, additive: ev.ctrlKey || ev.metaKey })}
      onMenu={(_e, hit, ev) => onMenu(hit ? { index: hit.g, series: hit.s, additive: false } : null, ev.clientX, ev.clientY)}
    />
  );
}

/** The numbers a KPI card leads with: the value, the change against the comparison, a sparkline. */
function KpiCard({ data, w, h }: { data: KpiData; w: number; h: number }) {
  const { value, compare, format, spark } = data;
  const delta = compare && Number.isFinite(compare.value) && Number.isFinite(value) ? value - compare.value : null;
  const rel = delta !== null && compare && compare.value !== 0 ? delta / Math.abs(compare.value) : null;
  const big = Math.max(18, Math.min(40, h * 0.3, w / 6));
  return (
    <div className="dash-kpi">
      <div className="dash-kpi-value" style={{ fontSize: big }}>
        {fmtValue(value, format, true)}
      </div>
      {compare && data.additive && compare.label === 'dash.kpi.vsBaseline' && (
        <div className="dash-kpi-delta">{t('dash.kpi.share', { share: fmtValue(compare.value ? value / compare.value : NaN, 'pct'), label: sayDash(compare.label), value: fmtValue(compare.value, format, true) })}</div>
      )}
      {compare && !(data.additive && compare.label === 'dash.kpi.vsBaseline') && (
        <div className="dash-kpi-delta">
          {delta !== null && delta !== 0 && <span className={delta > 0 ? 'up' : 'down'}>{delta > 0 ? '▲' : '▼'} </span>}
          {rel !== null ? `${rel >= 0 ? '+' : ''}${fmtValue(rel, 'pct')} ` : ''}
          {t('dash.kpi.vs', { label: sayDash(compare.label), value: fmtValue(compare.value, format, true) })}
        </div>
      )}
      {spark && spark.some(Number.isFinite) && h > 90 && <Sparkline values={spark} w={Math.max(40, w - 4)} h={Math.min(36, h * 0.28)} />}
    </div>
  );
}

function Sparkline({ values, w, h }: { values: number[]; w: number; h: number }) {
  const fin = values.filter(Number.isFinite);
  const lo = Math.min(...fin);
  const hi = Math.max(...fin);
  const pts = values
    .map((v, i) => (Number.isFinite(v) ? `${((i + 0.5) / values.length) * w},${h - 2 - ((v - lo) / (hi - lo || 1)) * (h - 4)}` : null))
    .filter(Boolean)
    .join(' ');
  return (
    <svg className="dash-spark" width={w} height={h} role="img" aria-label={t('dash.kpi.spark')}>
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** A colour on the sequential ramp for a value between lo and hi, and its ink. */
function scaleColor(th: ChartTheme, v: number, lo: number, hi: number): { bg: string; ink: string } | null {
  if (!Number.isFinite(v) || !(hi > lo)) return null;
  const k = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
  const bg = mix(th.seqLo, th.seqHi, k);
  return { bg, ink: k > 0.55 ? (th.dark ? '#0b0b0b' : '#ffffff') : th.text };
}

function TableVisual({ tile, data, selected, onPick, onMenu }: VisualProps & { data: TableData }) {
  const host = useRef<HTMLDivElement>(null);
  const tick = useThemeTick();
  const th = useMemo(() => readTheme(host.current), [tick, host.current]); // eslint-disable-line react-hooks/exhaustive-deps
  const bars = tile.opts?.dataBars ?? false;
  const scale = tile.opts?.colorScale ?? false;
  const n = data.axisCount;
  return (
    <div className="dash-table-wrap" ref={host}>
      <table className="dash-table">
        <thead>
          <tr>
            {data.head.map((x, i) => (
              <th key={i} className={i >= n ? 'num' : ''}>
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, ri) => {
            const sel = selected ? selected(ri) : false;
            return (
              <tr
                key={r.cell}
                className={selected ? (sel ? 'sel' : 'dim') : ''}
                onClick={(e) => onPick({ index: ri, additive: e.ctrlKey || e.metaKey })}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onMenu({ index: ri, additive: false }, e.clientX, e.clientY);
                }}
              >
                {r.labels.map((l, i) => (
                  <td key={i} title={l}>
                    {l}
                  </td>
                ))}
                {r.values.map((v, i) => {
                  const [lo, hi] = data.ranges[i];
                  const c = scale ? scaleColor(th, v, lo, hi) : null;
                  const pct = bars && hi > 0 && Number.isFinite(v) ? Math.max(0, Math.min(100, (v / hi) * 100)) : 0;
                  return (
                    <td key={`v${i}`} className={`num${bars ? ' dash-bar-cell' : ''}`} style={c ? { background: c.bg, color: c.ink } : undefined}>
                      {bars && <i style={{ width: `${pct}%` }} />}
                      <span>{fmtValue(v, data.formats[i], true)}</span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={n}>{data.more > 0 ? t('dash.table.more', { n: data.more }) : t('dash.table.total')}</td>
            {data.totals.map((v, i) => (
              <td key={i} className="num">
                {fmtValue(v, data.formats[i], true)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function PivotVisual({ tile, data, selected, onPick, onMenu }: VisualProps & { data: PivotData }) {
  const host = useRef<HTMLDivElement>(null);
  const tick = useThemeTick();
  const th = useMemo(() => readTheme(host.current), [tick, host.current]); // eslint-disable-line react-hooks/exhaustive-deps
  const scale = tile.opts?.colorScale ?? true;
  const fmt = data.measures[0]?.format ?? 'dec';
  return (
    <div className="dash-table-wrap" ref={host}>
      <table className="dash-table">
        <thead>
          <tr>
            {data.rowHead.map((x, i) => (
              <th key={i}>{x}</th>
            ))}
            {data.cols.map((c) => (
              <th key={c.index} className="num" title={c.label}>
                {c.label}
              </th>
            ))}
            <th className="num">{t('dash.table.total')}</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, ri) => (
            <tr key={r.cell} className={selected ? (selected(ri) ? 'sel' : 'dim') : ''}>
              {r.labels.map((l, i) => (
                <td key={i} title={l}>
                  {l}
                </td>
              ))}
              {data.cols.map((c, ci) => {
                const v = data.values[0][ri][ci];
                const col = scale ? scaleColor(th, v, data.range[0], data.range[1]) : null;
                return (
                  <td
                    key={c.index}
                    className="num"
                    style={col ? { background: col.bg, color: col.ink, cursor: 'pointer' } : { cursor: 'pointer' }}
                    onClick={(e) => onPick({ index: ri, series: ci, additive: e.ctrlKey || e.metaKey })}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      onMenu({ index: ri, series: ci, additive: false }, e.clientX, e.clientY);
                    }}
                  >
                    {fmtValue(v, fmt, true)}
                  </td>
                );
              })}
              <td className="num" onClick={(e) => onPick({ index: ri, additive: e.ctrlKey || e.metaKey })}>
                {fmtValue(data.rowTotals[0][ri], fmt, true)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={data.rowHead.length}>{t('dash.table.total')}</td>
            {data.colTotals[0].map((v, i) => (
              <td key={i} className="num">
                {fmtValue(v, fmt, true)}
              </td>
            ))}
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** Every visual, by its data's kind. */
export function Visual(p: VisualProps) {
  const { data, w, h, tile, selected, onPick, onMenu, colorMemory } = p;
  const tick = useThemeTick();
  void tick;
  const colors = (th: ChartTheme) => colorFn(th, colorMemory);
  switch (data.kind) {
    case 'chart':
      return <ChartVisual {...p} data={data} />;
    case 'kpi':
      return <KpiCard data={data} w={w} h={h} />;
    case 'table':
      return <TableVisual {...p} data={data} />;
    case 'pivot':
      return <PivotVisual {...p} data={data} />;
    case 'items': {
      const d = data as ItemsData;
      const items = d.items.map((x) => ({ ...x, label: sayDash(x.label) }));
      const dd = { ...d, items };
      return (
        <CanvasVisual
          w={w}
          h={h}
          deps={[d, selected]}
          paint={(ctx, th, hover) => (tile.kind === 'treemap' ? paintTreemap(ctx, dd, th, w, h, colors(th), hover, selected) : paintTopN(ctx, dd, th, w, h, colors(th), hover, selected))}
          tip={(hh) => (items[hh.i] ? { title: `${items[hh.i].label}${d.total > 0 && items[hh.i].value >= 0 ? ` · ${fmtValue(items[hh.i].value / d.total, 'pct')}` : ''}`, value: fmtValue(items[hh.i].value, d.format) } : null)}
          onPick={onPick}
          onMenu={onMenu}
        />
      );
    }
    case 'box': {
      const d = data as BoxData;
      return (
        <CanvasVisual
          w={w}
          h={h}
          deps={[d, selected]}
          paint={(ctx, th, hover) => paintBox(ctx, d, th, w, h, hover, selected)}
          tip={(hh) => {
            const g = d.groups[hh.i];
            return g ? { title: `${g.label} · p25 ${fmtValue(g.q[1], d.format)} · p75 ${fmtValue(g.q[3], d.format)}`, value: t('dash.box.median', { v: fmtValue(g.q[2], d.format) }) } : null;
          }}
          onPick={onPick}
          onMenu={onMenu}
        />
      );
    }
    case 'bands': {
      const d = data as BandsData;
      return (
        <CanvasVisual
          w={w}
          h={h}
          deps={[d]}
          paint={(ctx, th, hover) => paintBands(ctx, d, th, w, h, hover)}
          tip={(hh) => {
            const b = d.bins[hh.i];
            return b && Number.isFinite(b[2]) ? { title: `p10 ${fmtValue(b[0], d.format)} · p90 ${fmtValue(b[4], d.format)}`, value: t('dash.box.median', { v: fmtValue(b[2], d.format) }) } : null;
          }}
          onPick={onPick}
          onMenu={onMenu}
        />
      );
    }
    case 'bubble': {
      const d = data as BubbleData;
      return (
        <CanvasVisual
          w={w}
          h={h}
          deps={[d, selected]}
          paint={(ctx, th, hover) => paintBubbles(ctx, d, th, w, h, colors(th), hover, selected)}
          tip={(hh) => {
            const pt = d.points[hh.i];
            return pt ? { title: `${pt.label} · ${d.names[1]} ${fmtValue(pt.y, d.formats[1])}${d.names[2] ? ` · ${d.names[2]} ${fmtValue(pt.r, 'dec')}` : ''}`, value: `${d.names[0]} ${fmtValue(pt.x, d.formats[0])}` } : null;
          }}
          onPick={onPick}
          onMenu={onMenu}
        />
      );
    }
    case 'map': {
      const d = data as MapData;
      return <CanvasVisual w={w} h={h} deps={[d]} paint={(ctx, th) => paintMap(ctx, d, th, w, h, null)} tip={() => ({ title: t('dash.map.tip'), value: fmtValue(d.hl ? d.hl.reduce((a, b) => a + b, 0) : d.counts.reduce((a, b) => a + b, 0), 'int', true) })} />;
    }
    case 'slicer':
      return null;
    case 'empty':
      return <div className="dash-empty">{t(data.message, data.values ?? {})}</div>;
  }
}

export { fillTooltip };

// ---------------------------------------------------------------------------
// Slicers

const fmtNum = (f: FieldInfo, v: number, epochMs: number | null) => fieldValueText(f, v, epochMs);

/** A slicer: its field's values to pick, a range, a search or a relative time - its value a filter. */
export function SlicerVisual({ tile, field, data, value, onChange, epochMs }: { tile: Tile; field: FieldInfo | null; data: SlicerData | undefined; value: FilterDef | null; onChange: (f: FilterDef | null) => void; epochMs: number | null }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  if (!field) return <div className="dash-empty">{t('dash.slicer.noField')}</div>;
  const mode = tile.opts?.slicer ?? (field.kind === 'cat' ? 'dropdown' : 'range');
  const picked = new Set(value?.op === 'in' ? (value.values ?? []) : []);
  const set = (vals: string[]) => onChange(vals.length ? { id: tile.id, field: field.id, op: 'in', values: vals } : null);
  const toggle = (label: string, additive: boolean) => {
    if (!additive && mode === 'buttons') return set(picked.has(label) && picked.size === 1 ? [] : [label]);
    const next = new Set(picked);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    set([...next]);
  };
  const items = (data?.items ?? []).filter((x) => x.count > 0 || picked.has(x.label));
  const shown = q ? items.filter((x) => x.label.toLowerCase().includes(q.toLowerCase())) : items;
  if (mode === 'search')
    return (
      <div className="dash-slicer">
        <input type="text" aria-label={t('dash.slicer.search')} placeholder={t('dash.slicer.searchHint')} value={value?.text ?? ''} onChange={(e) => onChange(e.target.value ? { id: tile.id, field: field.id, op: 'search', text: e.target.value } : null)} />
        <small>{value?.text ? t('dash.slicer.matches', { n: items.filter((x) => x.label.toLowerCase().includes((value.text ?? '').toLowerCase())).length }) : t('dash.slicer.all')}</small>
      </div>
    );
  if (mode === 'range' || mode === 'date') {
    const lo = Number.isFinite(field.lo) ? field.lo : 0;
    const hi = Number.isFinite(field.hi) ? field.hi : 1;
    const a = value?.op === 'range' ? (value.lo ?? lo) : lo;
    const b = value?.op === 'range' ? (value.hi ?? hi) : hi;
    const step = (hi - lo) / 200 || 1;
    const put = (x: number, y: number) => onChange(x <= lo && y >= hi ? null : { id: tile.id, field: field.id, op: 'range', lo: Math.min(x, y), hi: Math.max(x, y) });
    return (
      <div className="dash-slicer">
        <div className="dash-range">
          <input type="range" aria-label={t('dash.slicer.from')} min={lo} max={hi} step={step} value={a} onChange={(e) => put(Number(e.target.value), b)} />
          <input type="range" aria-label={t('dash.slicer.to')} min={lo} max={hi} step={step} value={b} onChange={(e) => put(a, Number(e.target.value))} />
        </div>
        <small>
          {fmtNum(field, a, epochMs)} – {fmtNum(field, b, epochMs)}
        </small>
      </div>
    );
  }
  if (mode === 'relative') {
    const n = value?.op === 'relative' ? (value.n ?? 0) : 0;
    const unit = value?.op === 'relative' ? (value.unit ?? 'min') : field.id === 'session' ? 'matches' : 'min';
    const put = (nn: number, u: FilterDef['unit']) => onChange(nn ? { id: tile.id, field: field.id, op: 'relative', n: nn, unit: u } : null);
    return (
      <div className="dash-slicer">
        <div className="dash-range">
          <select aria-label={t('dash.slicer.relWhich')} value={n < 0 ? 'first' : 'last'} onChange={(e) => put(e.target.value === 'first' ? -Math.abs(n || 5) : Math.abs(n || 5), unit)}>
            <option value="last">{t('dash.slicer.last')}</option>
            <option value="first">{t('dash.slicer.first')}</option>
          </select>
          <input type="number" aria-label={t('dash.slicer.relN')} min={0} value={Math.abs(n) || ''} placeholder="–" onChange={(e) => put((n < 0 ? -1 : 1) * Math.max(0, Number(e.target.value) || 0), unit)} />
          <select aria-label={t('dash.slicer.relUnit')} value={unit} onChange={(e) => put(n || 5, e.target.value as FilterDef['unit'])}>
            <option value="sec">{t('dash.slicer.unit.sec')}</option>
            <option value="min">{t('dash.slicer.unit.min')}</option>
            <option value="matches">{t('dash.slicer.unit.matches')}</option>
          </select>
        </div>
        <small>{n ? '' : t('dash.slicer.all')}</small>
      </div>
    );
  }
  if (mode === 'buttons')
    return (
      <div className="dash-slicer">
        <div className="dash-slicer-buttons">
          {items.slice(0, 40).map((x) => (
            <button key={x.index} type="button" className={`dash-btn${picked.has(x.label) ? ' on' : ''}`} aria-pressed={picked.has(x.label)} title={t('dash.slicer.count', { n: Math.round(x.count) })} onClick={(e) => toggle(x.label, e.ctrlKey || e.metaKey)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
    );
  const list = (
    <div className="dash-slicer-list">
      {items.length > 8 && <input type="text" aria-label={t('dash.slicer.search')} placeholder={t('dash.slicer.searchHint')} value={q} onChange={(e) => setQ(e.target.value)} />}
      <label>
        <input type="checkbox" checked={picked.size === 0} onChange={() => set([])} />
        <span>{t('dash.slicer.all')}</span>
      </label>
      {shown.slice(0, 500).map((x) => (
        <label key={x.index}>
          <input type="checkbox" checked={picked.has(x.label)} onChange={() => toggle(x.label, true)} />
          <span title={x.label}>{x.label}</span>
          <small>{fmtValue(x.count, 'int', true)}</small>
        </label>
      ))}
    </div>
  );
  if (mode === 'list') return <div className="dash-slicer">{list}</div>;
  const r = btn.current?.getBoundingClientRect();
  return (
    <div className="dash-slicer">
      <button ref={btn} type="button" className="dash-btn" aria-haspopup="listbox" aria-expanded={open} title={t('dash.slicer.dropdownTip')} onClick={() => setOpen(!open)}>
        {picked.size === 0 ? t('dash.slicer.all') : picked.size === 1 ? [...picked][0] : t('dash.slicer.picked', { n: picked.size })} ▾
      </button>
      {open && r && (
        <div className="dash-popover" style={{ left: r.left, top: r.bottom + 2, width: Math.max(200, r.width) }} onMouseLeave={() => setOpen(false)}>
          {list}
        </div>
      )}
    </div>
  );
}

export const VALUE_FORMATS: ValueFormat[] = ['int', 'dec', 'pct', 'rate', 'ratio', 'seconds'];
