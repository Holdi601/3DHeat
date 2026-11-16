/**
 * Compare: groups against groups, inside a region, over the time window and
 * the filters the view shows.
 *
 * The region is the whole map or the drawn volumes, either combined (their
 * union, each row counted once) or each separately. The groups are filters
 * over any column (`team == "Allies" and vehicle == "T-34"`), optionally of
 * one source (a loaded file, a match), and can be split by a column's values.
 * The statistics are the built-ins and the user's own, all expressions of one
 * small language (`versus/expr.ts`). The pass runs in a worker
 * (`versus/run.ts`); the panel only draws the aggregated result: a table with
 * the differences from the reference group and their intervals, and charts.
 * A results table can be pinned to compare it with another dataset later.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { CANON } from '../../data/canonical';
import { SOURCE_COLUMN } from '../../data/builder';
import { currencyUnit } from '../../data/cost';
import { int, num, t, useLang } from '../../i18n';
import { PERSON_FILTER_COLUMN } from '../../render/filterTables';
import { useStore } from '../../state/store';
import type { Dataset, FilterSpec } from '../../state/types';
import { K, type Result } from '../../versus/engine';
import { bindMetric, ExprError, simpleForm, type Schema, type Simple } from '../../versus/expr';
import { builtinMetrics, exportMetricsJson, loadUserMetrics, mergeMetrics, sanitize, saveUserMetrics, type MetricDef } from '../../versus/metrics';
import { attrKey, buildSchema, prepare, runVersus, type DimSetup, type GroupSetup, type Prepared, type Setup } from '../../versus/run';
import { currentScope, scopeKey } from '../../volumes/scope';
import { downloadBlob } from '../../volumes/export';
import { useVolumeStore } from '../../volumes/store';
import { Segmented } from '../controls';
import { useEngine } from '../EngineContext';
import { columnLabel, valueLabel } from '../panels/FilterPanel';
import { BarChart, INK, Legend, LineChart, OTHER_COLOR, PALETTE, PieChart, Scatter, svgPng, svgText, type BarMode, type Cell, type ChartData, type ChartEvents, type Ent, type Point } from './charts';
import { MoreChart, MORE_CHARTS, type MoreKind } from './chartsMore';
import './versus.css';

export type ChartKind = 'table' | 'bar' | 'column' | 'line' | 'area' | 'pie' | 'donut' | 'scatter' | MoreKind;
type Axis = 'group' | 'split' | 'dim';

interface GroupUi extends GroupSetup {
  id: string;
}

export interface Pin {
  id: string;
  name: string;
  metrics: { id: string; name: string; unit: string }[];
  rows: { label: string; values: Record<string, number> }[];
}

interface VersusUi {
  open: boolean;
  region: 'all' | 'volumes';
  volMode: 'union' | 'separate';
  volOff: string[];
  groups: GroupUi[];
  split: { column: string; top: number } | null;
  dim: DimSetup | null;
  chosen: string[] | null;
  ref: number;
  chart: ChartKind;
  cat: Axis;
  ser: Axis | 'none';
  barMode: BarMode;
  metric: string | null;
  xMetric: string | null;
  yMetric: string | null;
  sizeMetric: string | null;
  boxColumn: string | null;
  showAll: boolean;
  multiples: boolean;
  sort: 'none' | 'desc' | 'asc';
  top: number;
  focus: string | null;
  user: MetricDef[];
  editing: MetricDef | null;
  pins: Pin[];
  pinsShown: string[];
  set: (p: Partial<Omit<VersusUi, 'set'>>) => void;
}

const PINS = '3dheat.versus.pins';
function loadPins(): Pin[] {
  try {
    const raw = localStorage.getItem(PINS);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((p) => p && typeof p.id === 'string' && Array.isArray(p.rows) && Array.isArray(p.metrics)) : [];
  } catch {
    return [];
  }
}
function savePins(p: Pin[]): void {
  try {
    localStorage.setItem(PINS, JSON.stringify(p));
  } catch {
    // Not kept beyond the session.
  }
}

let nextId = 1;
const gid = () => `g${nextId++}`;

export const useVersus = create<VersusUi>((set) => ({
  open: false,
  region: 'all',
  volMode: 'union',
  volOff: [],
  groups: [],
  split: null,
  dim: null,
  chosen: null,
  ref: 0,
  chart: 'table',
  cat: 'group',
  ser: 'none',
  barMode: 'grouped',
  metric: null,
  xMetric: null,
  yMetric: null,
  sizeMetric: null,
  boxColumn: null,
  showAll: false,
  multiples: false,
  sort: 'none',
  top: 12,
  focus: null,
  user: loadUserMetrics(),
  editing: null,
  pins: loadPins(),
  pinsShown: [],
  set: (p) => set(p),
}));

/** The button that opens it. */
export function VersusButton() {
  useLang();
  const ds = useStore((s) => s.dataset);
  return (
    <button disabled={!ds} title={t('versus.openTitle')} onClick={() => useVersus.getState().set({ open: true })}>
      {t('versus.open')}
    </button>
  );
}

export function VersusWindow() {
  const open = useVersus((s) => s.open);
  const [stage, setStage] = useState<Element | null>(null);
  useEffect(() => setStage(document.querySelector('.stage')), [open]);
  if (!open || !stage) return null;
  return createPortal(<VersusBody />, stage);
}

// ---------------------------------------------------------------------------
// Formatting

function fmtDur(s: number): string {
  if (!Number.isFinite(s)) return '—';
  const a = Math.abs(s);
  if (a < 60) return `${num(s, a < 10 ? 1 : 0)} s`;
  const h = Math.floor(a / 3600);
  const m = Math.floor((a % 3600) / 60);
  const sec = Math.floor(a % 60);
  const sign = s < 0 ? '-' : '';
  return h > 0 ? `${sign}${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${sign}${m}:${String(sec).padStart(2, '0')}`;
}

function plain(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e7) return `${num(v / 1e6, 1)}M`;
  if (a >= 1000) return int(Math.round(v));
  return num(v, a >= 100 || Number.isInteger(v) ? 0 : a >= 10 ? 1 : 2);
}

export function fmtUnit(unit: string): (v: number) => string {
  return (v: number) => {
    if (!Number.isFinite(v)) return '—';
    switch (unit) {
      case '%': return `${num(v * 100, Math.abs(v) < 0.1 ? 1 : 1)}%`;
      case 's': return fmtDur(v);
      case 'count': return plain(v);
      case 'ratio': return num(v, 2);
      case 'dist': return plain(v);
      case 'dist/s': return `${num(v, Math.abs(v) >= 100 ? 0 : 1)}/s`;
      case '': return plain(v);
      default: return `${plain(v)} ${/^[a-z0-9]+$/.test(unit) ? currencyUnit(unit) : unit}`;
    }
  };
}

export function metricName(m: Pick<MetricDef, 'name' | 'builtin'>): string {
  if (!m.builtin) return m.name;
  const v = { ...(m.builtin.values ?? {}) };
  if (v.kind && m.builtin.key === 'event') v.kind = valueLabel(CANON.event, v.kind);
  if (v.currency) v.currency = currencyUnit(v.currency);
  return t(`versus.metric.${m.builtin.key}`, v);
}

export function errText(e: ExprError): string {
  const v: Record<string, string | number> = { ...e.values };
  return t(`versus.err.${e.key}`, v);
}

// ---------------------------------------------------------------------------
// The body

const DEFAULT_METRICS = ['rows', 'presence', 'players', 'kills', 'deaths', 'kd', 'winRate'];

function defaultGroups(ds: Dataset): GroupUi[] {
  if (ds.teamId && ds.teamLabels.length >= 2)
    return ds.teamLabels.slice(0, 2).map((l) => ({ id: gid(), label: l, filter: `team == "${l.replace(/"/g, '\\"')}"` }));
  return [{ id: gid(), label: t('versus.allRows'), filter: '' }];
}

function binds(schema: Schema, expr: string): boolean {
  try {
    bindMetric(expr, schema);
    return true;
  } catch {
    return false;
  }
}

interface View {
  res: Result;
  prep: Prepared;
  defs: MetricDef[];
  /** Volume names by region slot, when separate. */
  regionNames: string[] | null;
  groupLabels: string[];
  ms: number;
}

function VersusBody() {
  useLang();
  const engine = useEngine();
  const ui = useVersus();
  const dataset = useStore((s) => s.dataset);
  const volumes = useVolumeStore((s) => s.volumes);
  const timeline = useStore((s) => s.timeline);
  const filters = useStore((s) => s.filters);
  const teamVisibility = useStore((s) => s.teamVisibility);
  const mode = useStore((s) => s.mode);
  const session = useStore((s) => s.team.session);
  const playhead = Math.floor(engine?.live.playhead ?? timeline.playhead);
  const scope = useMemo(
    () => currentScope(useStore.getState(), playhead),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataset, timeline.mode, timeline.window, timeline.windowSeconds, timeline.defaultLifetime, filters, teamVisibility, mode, session, playhead],
  );
  const schema = useMemo(() => (dataset ? buildSchema(dataset) : null), [dataset]);
  const builtins = useMemo(() => (dataset && schema ? builtinMetrics(dataset).filter((m) => binds(schema, m.expr)) : []), [dataset, schema]);
  const allMetrics = useMemo(() => [...builtins, ...ui.user], [builtins, ui.user]);
  // First open on a dataset: the teams as groups, the usual statistics.
  useEffect(() => {
    if (!dataset) return;
    const s = useVersus.getState();
    if (!s.groups.length) s.set({ groups: defaultGroups(dataset) });
    if (!s.chosen) s.set({ chosen: DEFAULT_METRICS.filter((id) => builtins.some((m) => m.id === id)) });
  }, [dataset, builtins]);
  const chosen = useMemo(() => (ui.chosen ?? []).map((id) => allMetrics.find((m) => m.id === id)).filter((m): m is MetricDef => !!m), [ui.chosen, allMetrics]);
  const visible = useMemo(() => volumes.filter((v) => v.visible), [volumes]);
  const picked = useMemo(() => visible.filter((v) => !ui.volOff.includes(v.id)), [visible, ui.volOff]);
  // A box plot asks for the five percentiles of its column.
  const defs = useMemo(() => {
    const out = [...chosen];
    if (ui.chart === 'box' && ui.boxColumn)
      for (const p of [5, 25, 50, 75, 95]) out.push({ id: `__box:${p}`, name: `p${p}`, expr: `percentile(\`${ui.boxColumn}\`, ${p})`, unit: '' });
    return out;
  }, [chosen, ui.chart, ui.boxColumn]);
  const setup: Setup | null = useMemo(() => {
    if (!dataset) return null;
    const mode = ui.region === 'all' || !picked.length ? 'all' : ui.volMode;
    const dimNeeded = ['line', 'area', 'histogram', 'heat', 'column', 'bar', 'pie', 'donut'].includes(ui.chart) || ui.cat === 'dim' || ui.ser === 'dim';
    return {
      region: { mode, volumes: mode === 'all' ? [] : picked },
      groups: ui.groups.map(({ label, filter, source }) => ({ label, filter, source })),
      split: ui.split,
      dim: dimNeeded ? ui.dim : null,
      metrics: defs,
      ref: ui.ref,
    };
  }, [dataset, ui.region, ui.volMode, picked, ui.groups, ui.split, ui.dim, defs, ui.ref, ui.chart, ui.cat, ui.ser]);
  const key = setup
    ? JSON.stringify({ r: setup.region.mode, v: setup.region.volumes.map((v) => [v.id, v.shape]), g: setup.groups, s: setup.split, d: setup.dim, m: setup.metrics.map((m) => m.expr), ref: setup.ref }) + scopeKey(scope)
    : '';
  const [view, setView] = useState<View | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ groups: (ExprError | null)[]; metrics: Map<string, ExprError> }>({ groups: [], metrics: new Map() });
  useEffect(() => {
    if (!dataset || !setup || !schema) return;
    const ctl = new AbortController();
    const timer = setTimeout(() => {
      const prep = prepare(dataset, setup, scope, schema);
      setErrors({ groups: prep.groupErrors, metrics: prep.metricErrors });
      if (!prep.metrics.length) {
        setView(null);
        return;
      }
      setProgress(0);
      const t0 = performance.now();
      runVersus(dataset, prep, { signal: ctl.signal, onProgress: setProgress })
        .then((res) => {
          setView({
            res,
            prep,
            defs: prep.metrics,
            regionNames: setup.region.mode === 'separate' ? setup.region.volumes.map((v) => v.name) : null,
            groupLabels: setup.groups.map((g) => g.label),
            ms: performance.now() - t0,
          });
          setProgress(null);
        })
        .catch((e) => {
          if ((e as Error).name !== 'AbortError') {
            console.error(e);
            setProgress(null);
          }
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [tip, setTip] = useState<{ x: number; y: number; lines: string[] } | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const showTip = (e: React.MouseEvent | null, lines?: string[]) => {
    const r = bodyRef.current?.getBoundingClientRect();
    if (!e || !r || !lines) return setTip(null);
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, lines });
  };

  if (!dataset || !schema) return null;
  const status =
    progress !== null
      ? t('versus.counting', { pct: num(progress * 100, 0) })
      : view
        ? t('versus.status', { rows: num(view.res.shownRows, 0), ms: num(view.ms, 0) })
        : '';
  return (
    <div className="cmp-window vs-window" role="dialog" aria-label={t('versus.title')}>
      <div className="cmp-head">
        <b>{t('versus.title')}</b>
        <span className="cmp-status">{status}</span>
        <button className="cmp-close" title={t('versus.close')} onClick={() => ui.set({ open: false })}>
          ×
        </button>
      </div>
      <div className="vs-body" ref={bodyRef}>
        <Setup ds={dataset} schema={schema} all={allMetrics} visible={visible} errors={errors} />
        <div className="vs-out">
          {view ? <Output view={view} ds={dataset} showTip={showTip} chartRef={chartRef} /> : <div className="cmp-empty">{progress !== null ? status : t('versus.empty')}</div>}
        </div>
        {tip && (
          <div className="cmp-tip" style={{ left: tip.x + 14, top: tip.y + 10 }}>
            {tip.lines.map((l, i) => (
              <div key={i} className={i === 0 ? 'cmp-tip-head' : ''}>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The setup column

function Setup({ ds, schema, all, visible, errors }: { ds: Dataset; schema: Schema; all: MetricDef[]; visible: { id: string; name: string; color: string }[]; errors: { groups: (ExprError | null)[]; metrics: Map<string, ExprError> } }) {
  const ui = useVersus();
  const catCols = schema.cols.filter((c) => c.type === 'cat' && c.labels && c.labels.length > 1 && c.labels.length <= 100_000);
  const numCols = ds.attrs.filter((a) => a.kind === 'number' && a.max > a.min);
  const sourceCols = [ds.attrs.some((a) => a.name === SOURCE_COLUMN) ? SOURCE_COLUMN : null, ds.sessionId ? 'match' : null].filter((x): x is string => !!x);
  const patchGroup = (i: number, p: Partial<GroupUi>) => ui.set({ groups: ui.groups.map((g, k) => (k === i ? { ...g, ...p } : g)) });
  const dimValue = ui.dim ? (ui.dim.kind === 'column' || ui.dim.kind === 'bins' ? `${ui.dim.kind}:${ui.dim.column}` : ui.dim.kind) : '';
  return (
    <div className="vs-setup">
      <section>
        <h4>{t('versus.region')}</h4>
        <Segmented
          value={ui.region}
          onChange={(region) => ui.set({ region })}
          options={[
            { value: 'all', label: t('versus.wholeMap') },
            { value: 'volumes', label: t('versus.volumes'), disabled: !visible.length, title: visible.length ? undefined : t('versus.noVolumes') },
          ]}
        />
        {ui.region === 'volumes' && visible.length > 0 && (
          <>
            <div className="vs-vols">
              {visible.map((v) => (
                <label key={v.id}>
                  <input type="checkbox" checked={!ui.volOff.includes(v.id)} onChange={(e) => ui.set({ volOff: e.target.checked ? ui.volOff.filter((x) => x !== v.id) : [...ui.volOff, v.id] })} />
                  <i style={{ background: v.color }} />
                  {v.name}
                </label>
              ))}
            </div>
            <Segmented
              value={ui.volMode}
              onChange={(volMode) => ui.set({ volMode })}
              options={[
                { value: 'union', label: t('versus.combined'), title: t('versus.combinedTitle') },
                { value: 'separate', label: t('versus.separate'), title: t('versus.separateTitle') },
              ]}
            />
          </>
        )}
        <div className="cmp-hint">{t('versus.scopeHint')}</div>
      </section>

      <section>
        <h4>{t('versus.groups')}</h4>
        {ui.groups.map((g, i) => {
          const err = errors.groups[i];
          return (
            <div key={g.id} className="vs-group">
              <div className="row">
                <input type="radio" name="vs-ref" checked={ui.ref === i} title={t('versus.refTitle')} onChange={() => ui.set({ ref: i })} />
                <input className="vs-label" value={g.label} onChange={(e) => patchGroup(i, { label: e.target.value })} aria-label={t('versus.groupName')} />
                <button className="vs-x" title={t('versus.removeGroup')} onClick={() => ui.set({ groups: ui.groups.filter((_, k) => k !== i), ref: Math.max(0, ui.ref >= i ? ui.ref - 1 : ui.ref) })}>
                  ×
                </button>
              </div>
              <input
                className={`vs-expr${err ? ' bad' : ''}`}
                value={g.filter}
                placeholder={t('versus.filterPlaceholder')}
                spellCheck={false}
                onChange={(e) => patchGroup(i, { filter: e.target.value })}
                aria-label={t('versus.filter')}
              />
              {err && <div className="vs-err">{errText(err)}</div>}
              {sourceCols.length > 0 && (
                <div className="row">
                  <select value={g.source?.column ?? ''} onChange={(e) => patchGroup(i, { source: e.target.value ? { column: e.target.value, values: [] } : null })} title={t('versus.sourceTitle')}>
                    <option value="">{t('versus.anySource')}</option>
                    {sourceCols.map((c) => (
                      <option key={c} value={c}>
                        {c === 'match' ? t('versus.match') : t('versus.sourceFile')}
                      </option>
                    ))}
                  </select>
                  {g.source && (
                    <select
                      multiple
                      size={3}
                      value={g.source.values}
                      onChange={(e) => patchGroup(i, { source: { column: g.source!.column, values: Array.from(e.target.selectedOptions, (o) => o.value) } })}
                    >
                      {(schema.cols.find((c) => c.name === g.source!.column)?.labels ?? []).slice(0, 5000).map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div className="row">
          <button onClick={() => ui.set({ groups: [...ui.groups, { id: gid(), label: t('versus.groupN', { n: ui.groups.length + 1 }), filter: '' }] })}>{t('versus.addGroup')}</button>
          {ds.teamId && (
            <button onClick={() => ui.set({ groups: ds.teamLabels.slice(0, 8).map((l) => ({ id: gid(), label: l, filter: `team == "${l.replace(/"/g, '\\"')}"` })), ref: 0 })}>{t('versus.byTeam')}</button>
          )}
        </div>
        <div className="row">
          <span>{t('versus.splitBy')}</span>
          <select value={ui.split?.column ?? ''} onChange={(e) => ui.set({ split: e.target.value ? { column: e.target.value, top: ui.split?.top ?? 8 } : null })}>
            <option value="">{t('versus.none')}</option>
            {catCols.map((c) => (
              <option key={c.key} value={c.name}>
                {colName(c.name)}
              </option>
            ))}
          </select>
          {ui.split && <TopN value={ui.split.top} onChange={(top) => ui.set({ split: { ...ui.split!, top } })} />}
        </div>
      </section>

      <section>
        <h4>{t('versus.statistics')}</h4>
        <div className="vs-metrics">
          {all.map((m) => {
            const on = (ui.chosen ?? []).includes(m.id);
            const err = errors.metrics.get(m.id);
            return (
              <label key={m.id} title={m.expr} className={err ? 'bad' : ''}>
                <input type="checkbox" checked={on} onChange={(e) => ui.set({ chosen: e.target.checked ? [...(ui.chosen ?? []), m.id] : (ui.chosen ?? []).filter((x) => x !== m.id) })} />
                {metricName(m)}
                {!m.builtin && (
                  <button className="vs-link" onClick={(e) => (e.preventDefault(), ui.set({ editing: m }))}>
                    {t('versus.edit')}
                  </button>
                )}
              </label>
            );
          })}
        </div>
        <div className="row">
          <button onClick={() => ui.set({ editing: { id: `user:${Math.random().toString(36).slice(2, 10)}`, name: '', expr: '', unit: '' } })}>{t('versus.newMetric')}</button>
          <button disabled={!ui.user.length} onClick={() => downloadBlob('3dheat-statistics.json', new Blob([exportMetricsJson(ui.user)], { type: 'application/json' }))}>
            {t('versus.exportMetrics')}
          </button>
          <ImportButton />
        </div>
        {ui.editing && <MetricEditor schema={schema} />}
      </section>

      <section>
        <h4>{t('versus.dimension')}</h4>
        <div className="row">
          <select
            value={dimValue}
            onChange={(e) => {
              const v = e.target.value;
              const [kind, column] = v.split(/:(.*)/s);
              const dim: DimSetup | null = !v
                ? null
                : kind === 'matchTime' || kind === 'time'
                  ? { kind, bins: 30 }
                  : kind === 'column'
                    ? { kind, column, top: 12 }
                    : kind === 'bins'
                      ? { kind, column, bins: 20 }
                      : { kind: kind as 'round' | 'match' | 'day' };
              ui.set({ dim });
            }}
          >
            <option value="">{t('versus.none')}</option>
            {ds.time && <option value="matchTime">{t('versus.dim.matchTime')}</option>}
            {ds.time && <option value="time">{t('versus.dim.time')}</option>}
            {schema.round && <option value="round">{t('versus.dim.round')}</option>}
            {ds.sessionId && <option value="match">{t('versus.dim.match')}</option>}
            {ds.time && ds.epochMs !== null && <option value="day">{t('versus.dim.day')}</option>}
            {catCols
              .filter((c) => c.key.startsWith('a:'))
              .map((c) => (
                <option key={c.key} value={`column:${c.name}`}>
                  {colName(c.name)}
                </option>
              ))}
            {numCols.map((a) => (
              <option key={a.name} value={`bins:${a.name}`}>
                {t('versus.dim.bins', { column: colName(a.name) })}
              </option>
            ))}
          </select>
          {ui.dim && 'bins' in ui.dim && (
            <input type="number" min={2} max={120} value={ui.dim.bins} title={t('versus.binsTitle')} onChange={(e) => ui.set({ dim: { ...(ui.dim as { kind: 'time'; bins: number }), bins: Math.max(2, Math.min(120, Math.round(+e.target.value) || 2)) } })} />
          )}
          {ui.dim?.kind === 'column' && <TopN value={ui.dim.top} onChange={(top) => ui.set({ dim: { ...(ui.dim as { kind: 'column'; column: string; top: number }), top } })} />}
        </div>
        <div className="cmp-hint">{t('versus.dimHint')}</div>
      </section>

      {ui.pins.length > 0 && (
        <section>
          <h4>{t('versus.pinned')}</h4>
          {ui.pins.map((p) => (
            <label key={p.id} className="vs-pin">
              <input type="checkbox" checked={ui.pinsShown.includes(p.id)} onChange={(e) => ui.set({ pinsShown: e.target.checked ? [...ui.pinsShown, p.id] : ui.pinsShown.filter((x) => x !== p.id) })} />
              {p.name}
              <button
                className="vs-x"
                title={t('versus.unpin')}
                onClick={(e) => {
                  e.preventDefault();
                  const pins = ui.pins.filter((x) => x.id !== p.id);
                  savePins(pins);
                  ui.set({ pins, pinsShown: ui.pinsShown.filter((x) => x !== p.id) });
                }}
              >
                ×
              </button>
            </label>
          ))}
        </section>
      )}
    </div>
  );
}

function colName(name: string): string {
  if (name === 'team') return t('versus.col.team');
  if (name === 'person') return t('versus.col.person');
  if (name === 'match') return t('versus.match');
  return columnLabel(name);
}

function TopN({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <label className="vs-top" title={t('versus.topTitle')}>
      {t('versus.top')}
      <input type="number" min={1} max={64} value={value} onChange={(e) => onChange(Math.max(1, Math.min(64, Math.round(+e.target.value) || 1)))} />
    </label>
  );
}

function ImportButton() {
  const ref = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <>
      <button onClick={() => ref.current?.click()}>{t('versus.importMetrics')}</button>
      <input
        ref={ref}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          try {
            const add = sanitize(JSON.parse(await f.text()));
            const s = useVersus.getState();
            const user = mergeMetrics(s.user, add);
            saveUserMetrics(user);
            s.set({ user, chosen: [...new Set([...(s.chosen ?? []), ...add.map((m) => m.id)])] });
            setMsg(t('versus.imported', { n: add.length }));
          } catch {
            setMsg(t('versus.importFailed'));
          }
        }}
      />
      {msg && <span className="cmp-hint">{msg}</span>}
    </>
  );
}

function MetricEditor({ schema }: { schema: Schema }) {
  const ui = useVersus();
  const m = ui.editing!;
  const patch = (p: Partial<MetricDef>) => ui.set({ editing: { ...m, ...p } });
  const exprRef = useRef<HTMLTextAreaElement>(null);
  let err: ExprError | null = null;
  if (m.expr.trim())
    try {
      bindMetric(m.expr, schema);
    } catch (e) {
      err = e instanceof ExprError ? e : new ExprError('internal', { message: String(e) });
    }
  const exists = ui.user.some((x) => x.id === m.id);
  const insert = (text: string) => {
    const el = exprRef.current;
    const at = el ? el.selectionStart : m.expr.length;
    patch({ expr: m.expr.slice(0, at) + text + m.expr.slice(el ? el.selectionEnd : at) });
  };
  const save = () => {
    const user = exists ? ui.user.map((x) => (x.id === m.id ? m : x)) : [...ui.user, m];
    saveUserMetrics(user);
    ui.set({ user, editing: null, chosen: [...new Set([...(ui.chosen ?? []), m.id])] });
  };
  return (
    <div className="vs-editor">
      <input value={m.name} placeholder={t('versus.metricName')} onChange={(e) => patch({ name: e.target.value })} aria-label={t('versus.metricName')} />
      <input value={m.unit} placeholder={t('versus.metricUnit')} onChange={(e) => patch({ unit: e.target.value })} title={t('versus.unitTitle')} aria-label={t('versus.metricUnit')} />
      <textarea ref={exprRef} className={err ? 'bad' : ''} rows={3} spellCheck={false} value={m.expr} placeholder='countIf(event == "kill") / countIf(event == "death")' onChange={(e) => patch({ expr: e.target.value })} aria-label={t('versus.expression')} />
      {err ? <div className="vs-err">{t('versus.errAt', { message: errText(err), pos: err.pos + 1 })}</div> : m.expr.trim() ? <div className="vs-ok">{t('versus.valid')}</div> : null}
      <details>
        <summary>{t('versus.help')}</summary>
        <div className="vs-help">{t('versus.helpText')}</div>
        <div className="vs-cols">
          {['count()', 'countIf()', 'sum()', 'avg()', 'median()', 'percentile(, 90)', 'distinct()', 'presence()', 'kills()', 'deaths()', 'winRate()', 'perMinute()', 'perMatch()', 'shrink(, , 4)', 'ofAll()', ' where '].map((f) => (
            <button key={f} className="vs-tok" onClick={() => insert(f)}>
              {f.trim()}
            </button>
          ))}
        </div>
        <div className="cmp-hint">{t('versus.columns')}</div>
        <div className="vs-cols">
          {schema.cols.map((c) => (
            <button key={c.key} className="vs-tok" title={c.type === 'cat' ? t('versus.colCategory', { n: c.labels?.length ?? 0 }) : t('versus.colNumber')} onClick={() => insert(/^[A-Za-z_][\w.]*$/.test(c.name) ? c.name : `\`${c.name}\``)}>
              {c.name}
            </button>
          ))}
        </div>
      </details>
      <div className="row">
        <button disabled={!!err || !m.expr.trim() || !m.name.trim()} onClick={save}>
          {t('versus.save')}
        </button>
        <button onClick={() => ui.set({ editing: null })}>{t('versus.cancel')}</button>
        {exists && (
          <button
            onClick={() => {
              const user = ui.user.filter((x) => x.id !== m.id);
              saveUserMetrics(user);
              ui.set({ user, editing: null, chosen: (ui.chosen ?? []).filter((x) => x !== m.id) });
            }}
          >
            {t('versus.delete')}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The output

export interface GEnt extends Ent {
  v: number;
  g: number;
  /** A pinned table's row, instead of a group of this result. */
  pin?: { values: Record<string, number> };
}

export interface Model {
  view: View;
  nD: number;
  G: number;
  gEnts: GEnt[];
  sEnts: (Ent & { s: number })[];
  dEnts: (Ent & { d: number })[];
  metrics: (MetricDef & { label: string; fmt: (v: number) => string })[];
  /** The row of the result for a group entity and split slot (-1 its total), or -1. */
  rowOf: (g: GEnt, s: number) => number;
  /** A value, with its interval where it has one (totals of the dimension). */
  cell: (g: GEnt, s: number, d: number, m: number) => Cell | null;
}

function buildModel(view: View, ui: VersusUi): Model {
  const { res } = view;
  const nD = res.dims?.length ?? 0;
  const G = view.groupLabels.length + 1;
  const rowIndex = new Map<string, number>();
  res.rows.forEach((r, i) => rowIndex.set(`${r.v}:${r.g}:${r.s}`, i));
  const gEnts: GEnt[] = [];
  const totals = res.rows.filter((r) => r.s === -1 && (r.g < G - 1 || ui.showAll || G === 1));
  totals.forEach((r) => {
    const name = r.g === G - 1 ? t('versus.all') : view.groupLabels[r.g] || t('versus.groupN', { n: r.g + 1 });
    const label = view.regionNames ? `${view.regionNames[r.v]} · ${name}` : name;
    gEnts.push({ key: `g${r.v}:${r.g}`, label, v: r.v, g: r.g, color: '' });
  });
  for (const id of ui.pinsShown) {
    const p = ui.pins.find((x) => x.id === id);
    if (!p) continue;
    p.rows.forEach((row, i) => gEnts.push({ key: `p${p.id}:${i}`, label: `${p.name} · ${row.label}`, v: -1, g: -1, color: '', pin: { values: row.values } }));
  }
  gEnts.forEach((e, i) => (e.color = e.g === G - 1 ? OTHER_COLOR : i < PALETTE.length ? PALETTE[i] : OTHER_COLOR));
  const sSeen: (Ent & { s: number })[] = [];
  const seen = new Set<number>();
  for (const r of res.rows)
    if (r.s !== -1 && !seen.has(r.s)) {
      seen.add(r.s);
      sSeen.push({ key: `s${r.s}`, label: r.split === '\u0000other' ? t('versus.other') : (r.split ?? ''), s: r.s, color: '' });
    }
  sSeen.forEach((e, i) => (e.color = e.s === -2 ? OTHER_COLOR : i < PALETTE.length ? PALETTE[i] : OTHER_COLOR));
  const sEnts = sSeen.length ? sSeen : [{ key: 's-1', label: t('versus.total'), s: -1, color: PALETTE[0] }];
  const timeDim = ui.dim?.kind === 'matchTime' || ui.dim?.kind === 'time';
  const dEnts = (res.dims ?? []).map((l, d) => ({ key: `d${d}`, label: l === '\u0000other' ? t('versus.other') : timeDim ? fmtDur(Number(l)) : l, d, color: PALETTE[d % PALETTE.length] }));
  const metrics = view.defs.map((m) => ({ ...m, label: metricName(m), fmt: fmtUnit(m.unit) }));
  const rowOf = (g: GEnt, s: number) => (g.pin ? -1 : (rowIndex.get(`${g.v}:${g.g}:${s}`) ?? -1));
  const cell = (g: GEnt, s: number, d: number, m: number): Cell | null => {
    if (g.pin) {
      if (s !== -1 || d !== -1) return null;
      const v = g.pin.values[metrics[m].id];
      return v === undefined ? null : { v };
    }
    const i = rowOf(g, s);
    if (i < 0) return null;
    const mo = res.metrics[m];
    const v = mo.values[i * (1 + nD) + (d < 0 ? 0 : 1 + d)];
    return d < 0 ? { v, lo: mo.lo[i], hi: mo.hi[i] } : { v };
  };
  return { view, nD, G, gEnts, sEnts, dEnts, metrics, rowOf, cell };
}

/** View filters for a group (and a split or dimension value), or null when its filter is more than column conditions. */
function filtersFor(ds: Dataset, prep: Prepared, g: number, extra: Simple): FilterSpec[] | null {
  const conds = g >= 0 && g < prep.req.groups.length ? simpleForm(prep.req.groups[g].filter) : [];
  if (!conds) return null;
  const out: FilterSpec[] = [];
  for (const c of [...conds, ...extra]) {
    if (c.key === K.team && c.values) out.push({ kind: 'teams', allowed: c.values });
    else if (c.key === K.person && c.values) out.push({ kind: 'persons', allowed: c.values });
    else if (c.key.startsWith('a:')) {
      const name = c.key.slice(2);
      const a = ds.attrs.find((x) => x.name === name);
      if (!a) return null;
      if (c.values) out.push({ kind: 'categories', column: name, allowed: c.values });
      else if (c.range) out.push({ kind: 'range', column: name, min: Math.max(a.min, c.range[0]), max: Math.min(a.max, c.range[1]) });
    } else return null;
  }
  return out;
}

function Output({ view, ds, showTip, chartRef }: { view: View; ds: Dataset; showTip: (e: React.MouseEvent | null, lines?: string[]) => void; chartRef: React.RefObject<HTMLDivElement | null> }) {
  const ui = useVersus();
  const model = useMemo(() => buildModel(view, ui), [view, ui.showAll, ui.pins, ui.pinsShown, ui.dim]); // eslint-disable-line react-hooks/exhaustive-deps
  const [note, setNote] = useState<string | null>(null);
  const prevFilters = useRef<FilterSpec[] | null>(null);
  const mIndex = (id: string | null) => {
    const i = model.metrics.findIndex((m) => m.id === id);
    return i >= 0 ? i : 0;
  };
  const pick = (gKey: string | null, sKey: string | null, dKey: string | null = null) => {
    const g = model.gEnts.find((e) => e.key === gKey);
    if (!g || g.pin) return;
    const extra: Simple = [];
    const sl = sKey ? model.sEnts.find((e) => e.key === sKey) : null;
    if (sl && sl.s >= 0 && ui.split) {
      const col = buildSchemaCol(ds, ui.split.column);
      const idx = col?.labels?.indexOf(sl.label) ?? -1;
      if (!col || idx < 0) return setNote(t('versus.cannotFilter'));
      extra.push({ key: col.key, values: [idx] });
    }
    const dl = dKey ? model.dEnts.find((e) => e.key === dKey) : null;
    if (dl && ui.dim?.kind === 'column') {
      const col = buildSchemaCol(ds, ui.dim.column);
      const idx = col?.labels?.indexOf(dl.label) ?? -1;
      if (col && idx >= 0) extra.push({ key: col.key, values: [idx] });
    }
    const f = g.g === model.G - 1 ? [] : filtersFor(ds, view.prep, g.g, extra);
    if (!f) return setNote(t('versus.cannotFilter'));
    const st = useStore.getState();
    // A second click on the same thing gives the view its filters back.
    if (prevFilters.current && ui.focus === gKey) {
      st.setFilters(prevFilters.current);
      prevFilters.current = null;
      ui.set({ focus: null });
      setNote(null);
      return;
    }
    if (!prevFilters.current) prevFilters.current = st.filters;
    const cols = new Set(f.map((x) => ('column' in x ? x.column : x.kind)));
    st.setFilters([...prevFilters.current.filter((x) => !cols.has('column' in x ? x.column : x.kind)), ...f]);
    ui.set({ focus: gKey });
    setNote(t('versus.filtered', { name: g.label }));
  };
  const ev: ChartEvents = { tip: showTip, pick: (c, s) => pickFromAxes(c, s), focus: ui.focus };
  // A chart's category and series keys back to a group, split and dimension.
  function pickFromAxes(c: string | null, s: string | null) {
    const keys = [c, s].filter((x): x is string => !!x);
    const gKey = keys.find((k) => k.startsWith('g') || k.startsWith('p')) ?? (model.gEnts.length === 1 ? model.gEnts[0].key : null);
    const sKey = keys.find((k) => k.startsWith('s')) ?? null;
    const dKey = keys.find((k) => k.startsWith('d')) ?? null;
    pick(gKey, sKey, dKey);
  }
  const diffMap = diffSplit(ds, view, model);
  const exportCsv = () => downloadBlob('3dheat-compare.csv', new Blob([tableCsv(model)], { type: 'text/csv' }));
  const svg = () => chartRef.current?.querySelector('svg') as SVGSVGElement | null;
  const pin = () => {
    const name = `${ds.name} · ${new Date().toLocaleDateString()}`;
    const p: Pin = {
      id: Math.random().toString(36).slice(2, 10),
      name,
      metrics: model.metrics.map((m) => ({ id: m.id, name: m.label, unit: m.unit })),
      rows: model.gEnts
        .filter((g) => !g.pin)
        .map((g) => ({ label: g.label, values: Object.fromEntries(model.metrics.map((m, i) => [m.id, model.cell(g, -1, -1, i)?.v ?? NaN]).filter(([, v]) => Number.isFinite(v as number))) })),
    };
    const pins = [p, ...ui.pins].slice(0, 20);
    savePins(pins);
    ui.set({ pins });
    setNote(t('versus.pinnedNote'));
  };
  const kinds: { value: ChartKind; label: string }[] = [
    { value: 'table', label: t('versus.chart.table') },
    { value: 'bar', label: t('versus.chart.bar') },
    { value: 'column', label: t('versus.chart.column') },
    { value: 'line', label: t('versus.chart.line') },
    { value: 'area', label: t('versus.chart.area') },
    { value: 'pie', label: t('versus.chart.pie') },
    { value: 'donut', label: t('versus.chart.donut') },
    { value: 'scatter', label: t('versus.chart.scatter') },
    ...MORE_CHARTS.map((k) => ({ value: k as ChartKind, label: t(`versus.chart.${k}`) })),
  ];
  return (
    <>
      <div className="vs-tools">
        <select value={ui.chart} onChange={(e) => ui.set({ chart: e.target.value as ChartKind })} aria-label={t('versus.chartType')}>
          {kinds.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <ChartControls model={model} />
        <span className="vs-spacer" />
        <label className="vs-check">
          <input type="checkbox" checked={ui.showAll} onChange={(e) => ui.set({ showAll: e.target.checked })} />
          {t('versus.showAll')}
        </label>
        <button title={diffMap ? t('versus.diffMapTitle') : t('versus.diffMapNo')} disabled={!diffMap} onClick={() => diffMap?.()}>
          {t('versus.diffMap')}
        </button>
        <button onClick={exportCsv}>CSV</button>
        <button disabled={ui.chart === 'table' || ui.chart === 'kpi'} onClick={() => svg() && downloadBlob('3dheat-compare.svg', new Blob([svgText(svg()!)], { type: 'image/svg+xml' }))}>
          SVG
        </button>
        <button disabled={ui.chart === 'table' || ui.chart === 'kpi'} onClick={() => svg() && svgPng(svg()!).then((b) => b && downloadBlob('3dheat-compare.png', b))}>
          PNG
        </button>
        <button title={t('versus.pinTitle')} onClick={pin}>
          {t('versus.pin')}
        </button>
      </div>
      {(note || view.res.overflow) && <div className="cmp-hint vs-note">{[note, view.res.overflow ? t('versus.overflow') : null].filter(Boolean).join(' · ')}</div>}
      <div className="vs-chartwrap" ref={chartRef}>
        {ui.chart === 'table' ? (
          <Table model={model} onPick={(g, s) => pick(g, s)} focus={ui.focus} />
        ) : MORE_CHARTS.includes(ui.chart as MoreKind) ? (
          <MoreChart kind={ui.chart as MoreKind} model={model} ev={ev} />
        ) : (
          <BasicChart model={model} ev={ev} mIndex={mIndex} />
        )}
      </div>
    </>
  );
}

function buildSchemaCol(ds: Dataset, name: string) {
  if (name === 'team') return { key: K.team, labels: ds.teamLabels };
  if (name === 'person') return { key: K.person, labels: ds.personLabels };
  const a = ds.attrs.find((x) => x.name === name);
  return a ? { key: attrKey(a.name), labels: a.categories } : null;
}

/** The difference split for two groups that each pick values of one and the same column, or null. */
function diffSplit(ds: Dataset, view: View, model: Model): (() => void) | null {
  const two = model.gEnts.filter((g) => !g.pin && g.g < model.G - 1 && g.v === 0).slice(0, 2);
  if (two.length !== 2) return null;
  const [a, b] = two.map((g) => simpleForm(view.prep.req.groups[g.g].filter));
  if (!a || !b || a.length !== 1 || b.length !== 1 || a[0].key !== b[0].key || !a[0].values || !b[0].values) return null;
  const key = a[0].key;
  const pos = a[0].values;
  const neg = b[0].values;
  return () => {
    const st = useStore.getState();
    if (key === K.team) {
      st.setTeamSplit(pos, neg);
      st.setSplit({ kind: 'teams' });
    } else if (key === K.person) st.setSplit({ kind: 'categories', column: PERSON_FILTER_COLUMN, positive: pos, negative: neg });
    else if (key.startsWith('a:')) st.setSplit({ kind: 'categories', column: key.slice(2), positive: pos, negative: neg });
    else return;
    st.setMode('heat-difference');
    void ds;
  };
}

function tableCsv(model: Model): string {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const head = ['group', 'split', ...model.metrics.flatMap((m) => [m.label, `${m.label} low`, `${m.label} high`, `${m.label} diff`, `${m.label} diff low`, `${m.label} diff high`])];
  if (model.nD) for (const m of model.metrics) for (const d of model.dEnts) head.push(`${m.label} @ ${d.label}`);
  const lines = [head.map(esc).join(',')];
  const n = (v: number | undefined) => (v !== undefined && Number.isFinite(v) ? String(+v.toPrecision(10)) : '');
  for (const g of model.gEnts)
    for (const s of [{ s: -1, label: '' }, ...model.sEnts.filter((x) => x.s !== -1)]) {
      const row = g.pin ? -1 : model.rowOf(g, s.s);
      if (!g.pin && row < 0) continue;
      if (g.pin && s.s !== -1) continue;
      const cells = [g.label, s.label];
      model.metrics.forEach((_, mi) => {
        const c = model.cell(g, s.s, -1, mi);
        const mo = model.view.res.metrics[mi];
        const ref = row >= 0 ? model.view.res.ref[row] : -1;
        const diff = ref >= 0 && c ? c.v - mo.values[ref * (1 + model.nD)] : NaN;
        cells.push(n(c?.v), n(c?.lo), n(c?.hi), n(diff), row >= 0 ? n(mo.dlo[row]) : '', row >= 0 ? n(mo.dhi[row]) : '');
      });
      if (model.nD) model.metrics.forEach((_, mi) => model.dEnts.forEach((d) => cells.push(n(model.cell(g, s.s, d.d, mi)?.v))));
      lines.push(cells.map(esc).join(','));
    }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Table: groups x statistics, the difference from the reference and its interval

function Table({ model, onPick, focus }: { model: Model; onPick: (g: string, s: string | null) => void; focus: string | null }) {
  const { res } = model.view;
  const rows: { g: GEnt; s: (Ent & { s: number }) | null }[] = [];
  for (const g of model.gEnts) {
    rows.push({ g, s: null });
    if (!g.pin) for (const s of model.sEnts) if (s.s !== -1 && model.rowOf(g, s.s) >= 0) rows.push({ g, s });
  }
  return (
    <div className="vs-scroll">
      <table className="cmp-table vs-table">
        <thead>
          <tr>
            <th />
            {model.metrics.map((m) => (
              <th key={m.id} title={m.expr}>
                {m.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ g, s }) => {
            const ri = model.rowOf(g, s ? s.s : -1);
            const rr = ri >= 0 ? res.rows[ri] : null;
            const few = rr && (rr.rows < 30 || (rr.clusters > 0 && rr.clusters < 3));
            const isRef = ri >= 0 && res.ref.some((x) => x === ri);
            return (
              <tr key={`${g.key}|${s?.key ?? ''}`} className={`${focus === g.key ? 'on' : ''}${g.g === model.G - 1 ? ' vs-allrow' : ''}`}>
                <th className={s ? 'vs-sub' : ''} onClick={() => onPick(g.key, s?.key ?? null)} title={t('versus.clickFilter')}>
                  {!s && <i className="vs-sw" style={{ background: g.color }} />}
                  {s ? s.label : g.label}
                  {isRef && !s && <span className="vs-ref">{t('versus.ref')}</span>}
                  {few && (
                    <span className="vs-few" title={t('versus.fewTitle', { rows: num(rr!.rows, 0), clusters: rr!.clusters })}>
                      {t('versus.few')}
                    </span>
                  )}
                </th>
                {model.metrics.map((m, mi) => {
                  const c = model.cell(g, s ? s.s : -1, -1, mi);
                  const mo = res.metrics[mi];
                  const ref = ri >= 0 ? res.ref[ri] : -1;
                  const rv = ref >= 0 ? mo.values[ref * (1 + model.nD)] : NaN;
                  const d = c && Number.isFinite(rv) ? c.v - rv : NaN;
                  const sig = ri >= 0 && Number.isFinite(mo.dlo[ri]) && (mo.dlo[ri] > 0 || mo.dhi[ri] < 0);
                  const good = (d > 0) !== !!m.lowerBetter;
                  const tip = [
                    `${m.label}: ${m.fmt(c?.v ?? NaN)}`,
                    c && Number.isFinite(c.lo) ? t('versus.interval', { lo: m.fmt(c.lo!), hi: m.fmt(c.hi!), method: t(`versus.method.${mo.method}`) }) : '',
                    Number.isFinite(d) ? t('versus.diffTip', { d: m.fmt(d), lo: m.fmt(mo.dlo[ri]), hi: m.fmt(mo.dhi[ri]) }) : '',
                    sig ? t('versus.significant') : Number.isFinite(mo.dlo[ri]) ? t('versus.notSignificant') : '',
                    mo.approx ? t('versus.approx') : '',
                  ]
                    .filter(Boolean)
                    .join('\n');
                  return (
                    <td key={m.id} title={tip} onClick={() => onPick(g.key, s?.key ?? null)}>
                      <span className="vs-val">{m.fmt(c?.v ?? NaN)}</span>
                      {Number.isFinite(d) && Math.abs(d) > 0 && (
                        <span className={`vs-delta${sig ? (good ? ' good' : ' bad') : ''}`}>
                          {d > 0 ? '+' : '−'}
                          {m.fmt(Math.abs(d))}
                          {Number.isFinite(rv) && rv !== 0 && m.unit !== '%' ? ` (${d > 0 ? '+' : '−'}${num(Math.abs(d / rv) * 100, 0)}%)` : ''}
                          {sig ? ' •' : ''}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="cmp-hint">{t('versus.tableHint')}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bars, columns, lines, areas, pies, donuts and scatter

function axisEnts(model: Model, a: Axis): Ent[] {
  return a === 'group' ? model.gEnts : a === 'split' ? model.sEnts : model.dEnts;
}

/** Chart data for a category axis and a series axis, one statistic, the other axes at their totals. */
export function chartData(model: Model, cat: Axis, ser: Axis | 'none', mi: number, sort: VersusUi['sort'], top: number, onlyG?: GEnt): ChartData {
  let cats = axisEnts(model, cat);
  let series: Ent[] = ser === 'none' ? [{ key: '\u0000v', label: model.metrics[mi]?.label ?? '', color: PALETTE[0] }] : axisEnts(model, ser);
  if (onlyG) {
    if (cat === 'group') cats = [onlyG];
    if (ser === 'group') series = [onlyG];
  }
  const resolve = (ck: string, sk: string) => {
    let g: GEnt | undefined = onlyG ?? (model.gEnts.length ? model.gEnts[0] : undefined);
    let s = -1;
    let d = -1;
    for (const k of [ck, sk]) {
      if (k.startsWith('g') || k.startsWith('p')) g = model.gEnts.find((e) => e.key === k);
      else if (k.startsWith('s')) s = model.sEnts.find((e) => e.key === k)?.s ?? -1;
      else if (k.startsWith('d')) d = model.dEnts.find((e) => e.key === k)?.d ?? -1;
    }
    return g ? model.cell(g, s, d, mi) : null;
  };
  const get = (ck: string, sk: string) => resolve(ck, sk);
  if (sort !== 'none' && cat !== 'dim') {
    const total = (c: Ent) => series.reduce((a, s) => a + (get(c.key, s.key)?.v || 0), 0);
    cats = [...cats].sort((a, b) => (sort === 'desc' ? total(b) - total(a) : total(a) - total(b)));
  }
  if (cat !== 'dim' && cats.length > top) cats = cats.slice(0, top);
  // One series: each bar wears its category's colour.
  if (ser === 'none') return { cats, series, get, fmt: model.metrics[mi]?.fmt ?? String, catColor: cat !== 'dim' };
  return { cats, series, get, fmt: model.metrics[mi]?.fmt ?? String };
}

function ChartControls({ model }: { model: Model }) {
  const ui = useVersus();
  const axes: { value: Axis; label: string; disabled?: boolean }[] = [
    { value: 'group', label: t('versus.axis.group') },
    { value: 'split', label: t('versus.axis.split'), disabled: !ui.split },
    { value: 'dim', label: t('versus.axis.dim'), disabled: !ui.dim },
  ];
  const metricSel = (value: string | null, on: (id: string) => void, label: string, allowNone = false) => (
    <label className="vs-ctl">
      {label}
      <select value={value ?? (allowNone ? '' : model.metrics[0]?.id ?? '')} onChange={(e) => on(e.target.value)}>
        {allowNone && <option value="">{t('versus.none')}</option>}
        {model.metrics.filter((m) => !m.id.startsWith('__')).map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </label>
  );
  const c = ui.chart;
  const out: ReactNode[] = [];
  if (['bar', 'column', 'pie', 'donut', 'line', 'area', 'histogram', 'heat', 'waterfall', 'funnel'].includes(c) || (c === 'kpi' && false))
    if (c !== 'waterfall' && c !== 'funnel') out.push(<span key="m">{metricSel(ui.metric, (metric) => ui.set({ metric }), t('versus.metric'))}</span>);
  if (c === 'bar' || c === 'column') {
    out.push(
      <label key="cat" className="vs-ctl">
        {t('versus.categories')}
        <select value={ui.cat} onChange={(e) => ui.set({ cat: e.target.value as Axis })}>
          {axes.map((a) => (
            <option key={a.value} value={a.value} disabled={a.disabled}>
              {a.label}
            </option>
          ))}
        </select>
      </label>,
      <label key="ser" className="vs-ctl">
        {t('versus.colourBy')}
        <select value={ui.ser} onChange={(e) => ui.set({ ser: e.target.value as Axis | 'none' })}>
          <option value="none">{t('versus.none')}</option>
          {axes.map((a) => (
            <option key={a.value} value={a.value} disabled={a.disabled || a.value === ui.cat}>
              {a.label}
            </option>
          ))}
        </select>
      </label>,
      <Segmented<BarMode>
        key="mode"
        value={ui.barMode}
        onChange={(barMode) => ui.set({ barMode })}
        options={[
          { value: 'grouped', label: t('versus.grouped') },
          { value: 'stacked', label: t('versus.stacked') },
          { value: 'percent', label: '100%' },
        ]}
      />,
    );
  }
  if (c === 'pie' || c === 'donut')
    out.push(
      <label key="cat" className="vs-ctl">
        {t('versus.slices')}
        <select value={ui.cat} onChange={(e) => ui.set({ cat: e.target.value as Axis })}>
          {axes.map((a) => (
            <option key={a.value} value={a.value} disabled={a.disabled}>
              {a.label}
            </option>
          ))}
        </select>
      </label>,
    );
  if (c === 'line' || c === 'area')
    out.push(
      <label key="ser" className="vs-ctl">
        {t('versus.lines')}
        <select value={ui.ser === 'dim' || ui.ser === 'none' ? 'group' : ui.ser} onChange={(e) => ui.set({ ser: e.target.value as Axis })}>
          <option value="group">{t('versus.axis.group')}</option>
          <option value="split" disabled={!ui.split}>
            {t('versus.axis.split')}
          </option>
        </select>
      </label>,
    );
  if (['bar', 'column', 'pie', 'donut', 'line', 'area', 'radar'].includes(c) && model.gEnts.length > 1)
    out.push(
      <label key="mult" className="vs-check" title={t('versus.multiplesTitle')}>
        <input type="checkbox" checked={ui.multiples} onChange={(e) => ui.set({ multiples: e.target.checked })} />
        {t('versus.multiples')}
      </label>,
    );
  if (['bar', 'column', 'pie', 'donut'].includes(c))
    out.push(
      <select key="sort" value={ui.sort} onChange={(e) => ui.set({ sort: e.target.value as VersusUi['sort'] })} aria-label={t('versus.sort')}>
        <option value="none">{t('versus.sortNone')}</option>
        <option value="desc">{t('versus.sortDesc')}</option>
        <option value="asc">{t('versus.sortAsc')}</option>
      </select>,
      <TopN key="top" value={ui.top} onChange={(top) => ui.set({ top })} />,
    );
  if (c === 'scatter')
    out.push(
      <span key="x">{metricSel(ui.xMetric, (xMetric) => ui.set({ xMetric }), 'x')}</span>,
      <span key="y">{metricSel(ui.yMetric ?? model.metrics[1]?.id ?? null, (yMetric) => ui.set({ yMetric }), 'y')}</span>,
      <span key="s">{metricSel(ui.sizeMetric, (sizeMetric) => ui.set({ sizeMetric: sizeMetric || null }), t('versus.size'), true)}</span>,
    );
  return <>{out}</>;
}

function BasicChart({ model, ev, mIndex }: { model: Model; ev: ChartEvents; mIndex: (id: string | null) => number }) {
  const ui = useVersus();
  const mi = mIndex(ui.metric);
  const c = ui.chart;
  const legendFocus = (k: string | null) => ui.set({ focus: k });
  if (c === 'scatter') {
    const xi = mIndex(ui.xMetric);
    const yi = ui.yMetric ? mIndex(ui.yMetric) : Math.min(1, model.metrics.length - 1);
    const si = ui.sizeMetric ? mIndex(ui.sizeMetric) : -1;
    const pts: Point[] = [];
    for (const g of model.gEnts)
      for (const s of model.sEnts.length > 1 || model.sEnts[0].s !== -1 ? model.sEnts : [{ key: 's-1', label: '', s: -1, color: '' }]) {
        const x = model.cell(g, s.s, -1, xi)?.v ?? NaN;
        const y = model.cell(g, s.s, -1, yi)?.v ?? NaN;
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        pts.push({ key: s.s === -1 ? g.key : `${g.key}|${s.key}`, label: s.s === -1 ? g.label : `${g.label} · ${s.label}`, color: g.color, x, y, size: si >= 0 ? (model.cell(g, s.s, -1, si)?.v ?? NaN) : NaN });
      }
    const ms = model.metrics;
    return (
      <>
        <Legend items={model.gEnts} focus={ui.focus} onFocus={legendFocus} />
        <Scatter
          points={pts}
          ev={{ ...ev, pick: (k) => ev.pick(k?.split('|')[0] ?? null, k?.split('|')[1] ?? null) }}
          fx={ms[xi]?.fmt ?? String}
          fy={ms[yi]?.fmt ?? String}
          fs={si >= 0 ? (v) => `${ms[si].label}: ${ms[si].fmt(v)}` : undefined}
          xLabel={ms[xi]?.label ?? ''}
          yLabel={ms[yi]?.label ?? ''}
        />
      </>
    );
  }
  if (c === 'line' || c === 'area') {
    if (!model.dEnts.length) return <div className="cmp-empty">{t('versus.needDim')}</div>;
    const ser: Axis = ui.ser === 'split' && ui.split ? 'split' : 'group';
    const one = (g?: GEnt) => {
      const data = chartData(model, 'dim', ser, mi, 'none', 999, g);
      return <LineChart data={data} ev={ev} area={c === 'area'} stacked={c === 'area'} height={g ? 170 : 260} />;
    };
    if (ui.multiples && ser !== 'group' && model.gEnts.length > 1)
      return (
        <>
          <Legend items={model.sEnts} focus={ui.focus} onFocus={legendFocus} />
          <div className="vs-multi">
            {model.gEnts.map((g) => (
              <div key={g.key}>
                <div className="vs-mtitle">{g.label}</div>
                {one(g)}
              </div>
            ))}
          </div>
        </>
      );
    return (
      <>
        <Legend items={axisEnts(model, ser)} focus={ui.focus} onFocus={legendFocus} />
        {one()}
      </>
    );
  }
  if (c === 'pie' || c === 'donut') {
    const cat: Axis = ui.cat === 'group' && ui.multiples ? (ui.split ? 'split' : ui.dim ? 'dim' : 'group') : ui.cat;
    const slicesFor = (g?: GEnt) => {
      const data = chartData(model, cat, 'none', mi, ui.sort === 'none' ? 'desc' : ui.sort, ui.top, g);
      return data.cats.map((e) => ({ ...e, v: data.get(e.key, cat === 'dim' ? '\u0000v' : e.key)?.v ?? NaN }));
    };
    const fmt = model.metrics[mi]?.fmt ?? String;
    if (ui.multiples && model.gEnts.length > 1 && cat !== 'group')
      return (
        <>
          <Legend items={axisEnts(model, cat)} focus={ui.focus} onFocus={legendFocus} />
          <div className="vs-multi">
            {model.gEnts.map((g) => (
              <PieChart key={g.key} slices={slicesFor(g)} ev={{ ...ev, pick: (k) => ev.pick(g.key, k) }} donut={c === 'donut'} fmt={fmt} size={170} title={g.label} />
            ))}
          </div>
        </>
      );
    return (
      <>
        <Legend items={slicesFor()} focus={ui.focus} onFocus={legendFocus} />
        <PieChart slices={slicesFor()} ev={ev} donut={c === 'donut'} fmt={fmt} />
      </>
    );
  }
  // Bars and columns.
  const cat = ui.cat === 'dim' && !ui.dim ? 'group' : ui.cat === 'split' && !ui.split ? 'group' : ui.cat;
  const ser = ui.ser === cat || (ui.ser === 'split' && !ui.split) || (ui.ser === 'dim' && !ui.dim) ? 'none' : ui.ser;
  const horizontal = c === 'bar';
  if (ui.multiples && model.gEnts.length > 1 && cat !== 'group' && ser !== 'group')
    return (
      <>
        {ser !== 'none' && <Legend items={axisEnts(model, ser)} focus={ui.focus} onFocus={legendFocus} />}
        <div className="vs-multi">
          {model.gEnts.map((g) => (
            <div key={g.key}>
              <div className="vs-mtitle">{g.label}</div>
              <BarChart data={chartData(model, cat, ser, mi, ui.sort, ui.top, g)} ev={{ ...ev, pick: (a, b) => ev.pick(g.key, a ?? b) }} horizontal={horizontal} mode={ui.barMode} height={170} />
            </div>
          ))}
        </div>
      </>
    );
  const data = chartData(model, cat, ser, mi, ui.sort, ui.top);
  return (
    <>
      {ser !== 'none' && <Legend items={data.series} focus={ui.focus} onFocus={legendFocus} />}
      <BarChart data={data} ev={ev} horizontal={horizontal} mode={ui.barMode} />
    </>
  );
}

export { INK };
