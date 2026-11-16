/**
 * The Compare panel's further charts, from the aggregated result as the
 * first set (`charts.tsx`): a histogram over number ranges, box plots from
 * the five percentiles, a heat table (the pivot of groups against the second
 * dimension or the statistics), radar, waterfall, funnel and cards.
 */

import { useMemo } from 'react';
import { num, t } from '../../i18n';
import { useMotionOn, useTween } from '../motion';
import { BarChart, INK, Legend, niceTicks, PALETTE, useWidth, type ChartEvents, type Ent } from './charts';
import { chartData, useVersus, type GEnt, type Model } from './VersusPanel';

export type MoreKind = 'histogram' | 'box' | 'heat' | 'radar' | 'waterfall' | 'funnel' | 'kpi';
export const MORE_CHARTS: readonly MoreKind[] = ['histogram', 'box', 'heat', 'radar', 'waterfall', 'funnel', 'kpi'];

const fin = (v: number | undefined | null): v is number => typeof v === 'number' && Number.isFinite(v);

/** The statistics the user ticked (not the box plot's own). */
const shownMetrics = (model: Model) => model.metrics.map((m, i) => ({ m, i })).filter(({ m }) => !m.id.startsWith('__'));

export function MoreChart({ kind, model, ev }: { kind: MoreKind; model: Model; ev: ChartEvents }) {
  const ui = useVersus();
  const mi = Math.max(0, model.metrics.findIndex((m) => m.id === ui.metric));
  const focusG = model.gEnts.find((g) => g.key === ui.focus) ?? model.gEnts[0];
  const pickG = (k: string | null) => ui.set({ focus: k });
  switch (kind) {
    case 'histogram': {
      if (!model.dEnts.length || ui.dim?.kind !== 'bins') return <div className="cmp-empty">{t('versus.needBins')}</div>;
      const data = chartData(model, 'dim', model.gEnts.length > 1 ? 'group' : 'none', mi, 'none', 999);
      return (
        <>
          <Legend items={model.gEnts} focus={ui.focus} onFocus={pickG} />
          <BarChart data={data} ev={ev} horizontal={false} mode={ui.barMode === 'grouped' ? 'grouped' : ui.barMode} />
        </>
      );
    }
    case 'box':
      return <BoxPlot model={model} ev={ev} />;
    case 'heat':
      return <HeatTable model={model} ev={ev} mi={mi} />;
    case 'radar':
      return (
        <>
          <Legend items={model.gEnts} focus={ui.focus} onFocus={pickG} />
          <Radar model={model} ev={ev} />
          <div className="cmp-hint">{t('versus.radarHint')}</div>
        </>
      );
    case 'waterfall':
    case 'funnel':
      if (!focusG) return null;
      return (
        <>
          <Legend items={model.gEnts} focus={focusG.key} onFocus={(k) => pickG(k ?? focusG.key)} />
          {kind === 'waterfall' ? <Waterfall model={model} g={focusG} ev={ev} /> : <Funnel model={model} g={focusG} ev={ev} />}
          <div className="cmp-hint">{t(kind === 'waterfall' ? 'versus.waterfallHint' : 'versus.funnelHint')}</div>
        </>
      );
    case 'kpi':
      return <Cards model={model} />;
  }
}

// ---------------------------------------------------------------------------
// Box plots: whiskers at the 5th and 95th percentiles, the box from the 25th to the 75th, the median

function BoxPlot({ model, ev }: { model: Model; ev: ChartEvents }) {
  const ui = useVersus();
  const [ref, W] = useWidth();
  const idx = [5, 25, 50, 75, 95].map((p) => model.metrics.findIndex((m) => m.id === `__box:${p}`));
  const ok = idx.every((i) => i >= 0);
  const rows = ok ? model.gEnts.map((g) => ({ g, q: idx.map((i) => model.cell(g, -1, -1, i)?.v ?? NaN) })).filter((r) => r.q.every(fin)) : [];
  const target = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) r.q.forEach((v, k) => m.set(`${r.g.key}\u0001${k}`, v));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);
  const tw = useTween(target);
  if (!ui.boxColumn || !ok) return <div className="cmp-empty">{t('versus.needBox')}</div>;
  const lo = Math.min(...rows.map((r) => r.q[0]));
  const hi = Math.max(...rows.map((r) => r.q[4]));
  const ticks = niceTicks(lo, hi);
  const labelW = Math.min(160, Math.max(60, Math.max(0, ...rows.map((r) => r.g.label.length)) * 6.2));
  const pad = { l: labelW + 8, r: 16, t: 8, b: 24 };
  const band = 30;
  const H = pad.t + pad.b + Math.max(1, rows.length) * band;
  const plotW = W - pad.l - pad.r;
  const X = (v: number) => pad.l + ((v - ticks[0]) / (ticks[ticks.length - 1] - ticks[0] || 1)) * plotW;
  const fmt = (v: number) => num(v, Math.abs(v) >= 100 ? 0 : 2);
  return (
    <div ref={ref} className="vs-chart">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img">
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={X(tk)} x2={X(tk)} y1={pad.t} y2={H - pad.b} stroke={INK.grid} />
            <text x={X(tk)} y={H - pad.b + 14} textAnchor="middle" fill={INK.dim} fontSize={10}>
              {fmt(tk)}
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const q = r.q.map((v, k) => tw.get(`${r.g.key}\u0001${k}`)?.v ?? v);
          const a = tw.get(`${r.g.key}\u00012`)?.a ?? 1;
          const y = pad.t + i * band + band / 2;
          const lines = [r.g.label, ...['p5', 'p25', 'p50', 'p75', 'p95'].map((n, k) => `${n}: ${fmt(r.q[k])}`)];
          return (
            <g key={r.g.key} opacity={a * (ui.focus && ui.focus !== r.g.key ? 0.28 : 1)} onMouseMove={(e) => ev.tip(e, lines)} onMouseLeave={() => ev.tip(null)} onClick={() => ev.pick(r.g.key, null)} style={{ cursor: 'pointer' }}>
              <text x={pad.l - 6} y={y} dy="0.32em" textAnchor="end" fill={INK.text} fontSize={11}>
                {r.g.label}
              </text>
              <line x1={X(q[0])} x2={X(q[4])} y1={y} y2={y} stroke={INK.dim} strokeWidth={1.5} />
              <line x1={X(q[0])} x2={X(q[0])} y1={y - 5} y2={y + 5} stroke={INK.dim} strokeWidth={1.5} />
              <line x1={X(q[4])} x2={X(q[4])} y1={y - 5} y2={y + 5} stroke={INK.dim} strokeWidth={1.5} />
              <rect x={X(q[1])} y={y - 9} width={Math.max(1, X(q[3]) - X(q[1]))} height={18} rx={3} fill={r.g.color} fillOpacity={0.8} stroke={INK.surface} strokeWidth={2} />
              <line x1={X(q[2])} x2={X(q[2])} y1={y - 9} y2={y + 9} stroke="#ffffff" strokeWidth={2} />
              <rect x={pad.l} y={y - band / 2} width={plotW} height={band} fill="transparent" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Heat table: groups (and their split) against the second dimension, or against the statistics

function HeatTable({ model, ev, mi }: { model: Model; ev: ChartEvents; mi: number }) {
  const ui = useVersus();
  const on = useMotionOn();
  const byDim = model.dEnts.length > 0;
  const cols: { key: string; label: string; d: number; m: number }[] = byDim
    ? model.dEnts.map((d) => ({ key: d.key, label: d.label, d: d.d, m: mi }))
    : shownMetrics(model).map(({ m, i }) => ({ key: m.id, label: m.label, d: -1, m: i }));
  const rows: { g: GEnt; s: number; label: string; key: string }[] = [];
  for (const g of model.gEnts) {
    rows.push({ g, s: -1, label: g.label, key: g.key });
    if (!g.pin) for (const s of model.sEnts) if (s.s !== -1 && model.rowOf(g, s.s) >= 0) rows.push({ g, s: s.s, label: `${g.label} · ${s.label}`, key: `${g.key}|${s.key}` });
  }
  const val = (r: (typeof rows)[number], c: (typeof cols)[number]) => model.cell(r.g, r.s, c.d, c.m)?.v ?? NaN;
  // One scale for the dimension's pivot, one per column for the statistics.
  const range = (c: (typeof cols)[number] | null) => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const r of rows)
      for (const cc of c ? [c] : cols) {
        const v = val(r, cc);
        if (fin(v)) {
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        }
      }
    return [lo, hi] as const;
  };
  const all = range(null);
  const fmtOf = (c: (typeof cols)[number]) => model.metrics[c.m]?.fmt ?? String;
  return (
    <div className="vs-scroll">
      <table className="cmp-table vs-table vs-heat">
        <thead>
          <tr>
            <th>{byDim ? model.metrics[mi]?.label : ''}</th>
            {cols.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className={ui.focus === r.g.key ? 'on' : ''}>
              <th onClick={() => ev.pick(r.g.key, r.s >= 0 ? `s${r.s}` : null)}>{r.label}</th>
              {cols.map((c) => {
                const v = val(r, c);
                const [lo, hi] = byDim ? all : range(c);
                const f = fin(v) && hi > lo ? (v - lo) / (hi - lo) : fin(v) ? 1 : 0;
                // One hue, light to dark: the share of the column's (or table's) range.
                const bg = fin(v) ? `rgba(57, 135, 229, ${(0.08 + 0.72 * f).toFixed(3)})` : 'transparent';
                return (
                  <td
                    key={c.key}
                    style={{ background: bg, color: f > 0.6 ? '#ffffff' : INK.text, transition: on ? 'background var(--motion-base) var(--motion-ease)' : undefined }}
                    onMouseMove={(e) => ev.tip(e, [r.label, c.label, fmtOf(c)(v)])}
                    onMouseLeave={() => ev.tip(null)}
                    onClick={() => ev.pick(r.g.key, byDim ? c.key : r.s >= 0 ? `s${r.s}` : null)}
                  >
                    {fmtOf(c)(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Radar: one polygon per group over the statistics, each axis scaled to its largest value

function Radar({ model, ev }: { model: Model; ev: ChartEvents }) {
  const ui = useVersus();
  const ms = shownMetrics(model);
  const groups = model.gEnts.slice(0, 8);
  const max = ms.map(({ i }) => Math.max(1e-12, ...groups.map((g) => Math.abs(model.cell(g, -1, -1, i)?.v ?? 0) || 0)));
  const target = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of groups) ms.forEach(({ i }, k) => m.set(`${g.key}\u0001${k}`, Math.max(0, (model.cell(g, -1, -1, i)?.v ?? 0) / max[k]) || 0));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);
  const tw = useTween(target, { stagger: false });
  if (ms.length < 3) return <div className="cmp-empty">{t('versus.empty')}</div>;
  const size = 300;
  const c = size / 2;
  const R = c - 64;
  const ang = (k: number) => -Math.PI / 2 + (k / ms.length) * Math.PI * 2;
  const pt = (k: number, f: number) => [c + Math.cos(ang(k)) * R * f, c + Math.sin(ang(k)) * R * f];
  return (
    <div className="vs-pie">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon key={f} points={ms.map((_, k) => pt(k, f).join(',')).join(' ')} fill="none" stroke={INK.grid} />
        ))}
        {ms.map(({ m }, k) => {
          const [x, y] = pt(k, 1);
          const [lx, ly] = pt(k, 1.14);
          return (
            <g key={m.id}>
              <line x1={c} y1={c} x2={x} y2={y} stroke={INK.grid} />
              <text x={lx} y={ly} dy="0.32em" textAnchor={Math.abs(lx - c) < 8 ? 'middle' : lx > c ? 'start' : 'end'} fill={INK.dim} fontSize={10}>
                {m.label.length > 16 ? `${m.label.slice(0, 15)}…` : m.label}
              </text>
            </g>
          );
        })}
        {groups.map((g) => {
          const pts = ms.map((_, k) => pt(k, tw.get(`${g.key}\u0001${k}`)?.v ?? 0));
          const lines = [g.label, ...ms.map(({ m, i }) => `${m.label}: ${m.fmt(model.cell(g, -1, -1, i)?.v ?? NaN)}`)];
          return (
            <g key={g.key} opacity={ui.focus && ui.focus !== g.key ? 0.25 : 1} onMouseMove={(e) => ev.tip(e, lines)} onMouseLeave={() => ev.tip(null)} onClick={() => ev.pick(g.key, null)} style={{ cursor: 'pointer' }}>
              <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={g.color} fillOpacity={0.18} stroke={g.color} strokeWidth={2} strokeLinejoin="round" />
              {pts.map((p, k) => (
                <circle key={k} cx={p[0]} cy={p[1]} r={3} fill={g.color} stroke={INK.surface} strokeWidth={1.5} />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Waterfall: earnings up, costs down, the end where they leave the group

function Waterfall({ model, g, ev }: { model: Model; g: GEnt; ev: ChartEvents }) {
  const [ref, W] = useWidth();
  const steps = shownMetrics(model).map(({ m, i }) => {
    const v = model.cell(g, -1, -1, i)?.v ?? NaN;
    return { key: m.id, label: m.label, v: m.flow === 'cost' ? -Math.abs(v) : v, fmt: m.fmt };
  }).filter((s) => fin(s.v));
  const target = useMemo(() => new Map(steps.map((s) => [s.key, s.v])), [model, g.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const tw = useTween(target);
  let acc = 0;
  const bars = steps.map((s) => {
    const v = tw.get(s.key)?.v ?? s.v;
    const from = acc;
    acc += v;
    return { ...s, from, to: acc, a: tw.get(s.key)?.a ?? 1 };
  });
  const end = { key: '\u0000end', label: t('versus.end'), from: 0, to: acc, v: acc, a: 1, fmt: steps[0]?.fmt ?? String };
  const all = [...bars, end];
  const lo = Math.min(0, ...all.map((b) => Math.min(b.from, b.to)));
  const hi = Math.max(0, ...all.map((b) => Math.max(b.from, b.to)));
  const ticks = niceTicks(lo, hi);
  const H = 260;
  const pad = { l: 60, r: 12, t: 10, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const Y = (v: number) => pad.t + plotH - ((v - ticks[0]) / (ticks[ticks.length - 1] - ticks[0] || 1)) * plotH;
  const band = plotW / Math.max(1, all.length);
  return (
    <div ref={ref} className="vs-chart">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img">
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={pad.l} x2={pad.l + plotW} y1={Y(tk)} y2={Y(tk)} stroke={tk === 0 ? INK.faint : INK.grid} />
            <text x={pad.l - 6} y={Y(tk)} dy="0.32em" textAnchor="end" fill={INK.dim} fontSize={10}>
              {end.fmt(tk)}
            </text>
          </g>
        ))}
        {all.map((b, i) => {
          const x = pad.l + i * band + band * 0.15;
          const w = band * 0.7;
          const top = Y(Math.max(b.from, b.to));
          const h = Math.max(1, Math.abs(Y(b.from) - Y(b.to)));
          const color = b.key === '\u0000end' ? PALETTE[0] : b.to >= b.from ? PALETTE[2] : PALETTE[1];
          return (
            <g key={b.key} opacity={b.a} onMouseMove={(e) => ev.tip(e, [b.label, b.fmt(b.to - b.from)])} onMouseLeave={() => ev.tip(null)}>
              <rect x={x} y={top} width={w} height={h} rx={3} fill={color} />
              {i < all.length - 1 && <line x1={x + w} x2={x + band} y1={Y(b.to)} y2={Y(b.to)} stroke={INK.faint} strokeDasharray="2 2" />}
              <text x={x + w / 2} y={H - pad.b + 14} textAnchor="middle" fill={INK.text} fontSize={10}>
                {b.label.length > 14 ? `${b.label.slice(0, 13)}…` : b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Funnel: the statistics in order, each as a share of the first

function Funnel({ model, g, ev }: { model: Model; g: GEnt; ev: ChartEvents }) {
  const [ref, W] = useWidth();
  const steps = shownMetrics(model).map(({ m, i }) => ({ key: m.id, label: m.label, v: model.cell(g, -1, -1, i)?.v ?? NaN, fmt: m.fmt })).filter((s) => fin(s.v) && s.v >= 0);
  const target = useMemo(() => new Map(steps.map((s) => [s.key, s.v])), [model, g.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const tw = useTween(target);
  const first = steps[0]?.v || 1;
  const max = Math.max(1e-12, ...steps.map((s) => s.v));
  const row = 30;
  const H = steps.length * row + 10;
  const labelW = 150;
  const plotW = W - labelW - 70;
  return (
    <div ref={ref} className="vs-chart">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img">
        {steps.map((s, i) => {
          const v = tw.get(s.key)?.v ?? s.v;
          const w = Math.max(2, (v / max) * plotW);
          const y = 5 + i * row;
          const pct = (s.v / first) * 100;
          return (
            <g key={s.key} opacity={tw.get(s.key)?.a ?? 1} onMouseMove={(e) => ev.tip(e, [s.label, s.fmt(s.v), t('versus.ofFirst', { pct: num(pct, 1) })])} onMouseLeave={() => ev.tip(null)}>
              <text x={labelW - 8} y={y + row / 2 - 2} dy="0.32em" textAnchor="end" fill={INK.text} fontSize={11}>
                {s.label.length > 22 ? `${s.label.slice(0, 21)}…` : s.label}
              </text>
              <rect x={labelW + (plotW - w) / 2} y={y} width={w} height={row - 6} rx={3} fill={g.color} />
              <text x={labelW + plotW + 8} y={y + row / 2 - 2} dy="0.32em" fill={INK.dim} fontSize={10}>
                {i === 0 ? s.fmt(s.v) : `${num(pct, pct < 10 ? 1 : 0)}%`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards: each statistic's value for the reference group, and the others' differences

function Cards({ model }: { model: Model }) {
  const { res } = model.view;
  const ref = model.gEnts.find((g) => !g.pin && res.ref.some((r) => r === model.rowOf(g, -1))) ?? model.gEnts[0];
  if (!ref) return null;
  return (
    <div className="vs-cards">
      {shownMetrics(model).map(({ m, i }, k) => {
        const rv = model.cell(ref, -1, -1, i)?.v ?? NaN;
        return (
          <div key={m.id} className="vs-card" style={{ animationDelay: `${Math.min(260, k * 28)}ms` }}>
            <span className="cmp-hint">{m.label}</span>
            <b>{m.fmt(rv)}</b>
            <div className="cmp-hint">{ref.label}</div>
            {model.gEnts
              .filter((g) => g.key !== ref.key)
              .slice(0, 6)
              .map((g: Ent & GEnt) => {
                const v = model.cell(g, -1, -1, i)?.v ?? NaN;
                const ri = model.rowOf(g, -1);
                const mo = res.metrics[i];
                const sig = ri >= 0 && fin(mo.dlo[ri]) && (mo.dlo[ri] > 0 || mo.dhi[ri] < 0);
                const d = v - rv;
                const good = (d > 0) !== !!m.lowerBetter;
                return (
                  <div key={g.key} className="row">
                    <span>
                      <i className="vs-sw" style={{ background: g.color }} />
                      {g.label}
                    </span>
                    <span className={`vs-delta${sig ? (good ? ' good' : ' bad') : ''}`} style={{ display: 'inline' }}>
                      {m.fmt(v)}
                      {fin(d) ? ` (${d >= 0 ? '+' : '−'}${m.fmt(Math.abs(d))}${sig ? ' •' : ''})` : ''}
                    </span>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}
