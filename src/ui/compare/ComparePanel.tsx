/**
 * Comparing volumes: two or more volumes' every measure side by side, as a
 * table with the differences from the first volume and their effect sizes,
 * grouped bars, small-multiple curves over the match, the visits' spread and
 * the flow between the volumes. Counted in a worker (`volumes/compareRun.ts`)
 * from the rows the view shows; a click on a chart filters or moves the 3D
 * view to what was clicked.
 *
 * Each volume keeps its own colour and a shape of its own (by its place in
 * the volume list, never by its rank in a chart), and every mark is named by
 * a legend, a label or a tooltip, so nothing is told by colour alone.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { ACTORS, CANON, EVENT_KINDS, VEHICLE_CLASSES } from '../../data/canonical';
import { num, t, useLang } from '../../i18n';
import { useStore } from '../../state/store';
import type { Dataset, FilterSpec } from '../../state/types';
import {
  cliffsDelta,
  CURVE_BINS,
  DIR_SECTORS,
  effectWord,
  matchSeries,
  pairedEffect,
  visitEdge,
  VISIT_BINS,
  type CompareResult,
  type SessionMetric,
  type VolumeCompare,
} from '../../volumes/compare';
import { runCompare } from '../../volumes/compareRun';
import { currentScope, scopeKey } from '../../volumes/scope';
import { useVolumeStore } from '../../volumes/store';
import { volumeBounds, type Volume } from '../../volumes/volume';
import { Segmented } from '../controls';
import { useEngine } from '../EngineContext';
import { valueLabel } from '../panels/FilterPanel';
import { valueColumnLabel } from '../panels/ValueSection';
import { parseValueColumn, shownValue } from '../../data/cost';
import './compare.css';

type View = 'table' | 'bars' | 'time' | 'visits' | 'flow';
type Dim = 'events' | 'class' | 'actor' | 'team' | 'dir';
type TimeMetric = 'presence' | 'rows' | 'kills';

interface CompareUi {
  open: boolean;
  /** Volume ids left out of the comparison. */
  off: string[];
  view: View;
  dim: Dim;
  share: boolean;
  timeMetric: TimeMetric;
  /** Sort the table's measures by their distance from the first volume in this volume; null: the usual order. */
  sortBy: string | null;
  set: (p: Partial<Omit<CompareUi, 'set'>>) => void;
}

export const useCompareUi = create<CompareUi>((set) => ({
  open: false,
  off: [],
  view: 'table',
  dim: 'events',
  share: true,
  timeMetric: 'presence',
  sortBy: null,
  set: (p) => set(p),
}));

/** The button in the Volumes panel. */
export function CompareButton() {
  useLang();
  const n = useVolumeStore((s) => s.volumes.filter((v) => v.visible).length);
  return (
    <button disabled={n < 2} title={t('compare.openTitle')} onClick={() => useCompareUi.getState().set({ open: true })}>
      {t('compare.open')}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Formatting and small pieces

const SURFACE = '#14171c';
const fmtInt = (v: number | null) => (v === null || !Number.isFinite(v) ? '—' : num(v, 0));
const fmtDec = (v: number | null) => (v === null || !Number.isFinite(v) ? '—' : num(v, Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2));
const fmtPct = (v: number | null) => (v === null || !Number.isFinite(v) ? '—' : `${num(v * 100, Math.abs(v) < 0.1 ? 1 : 0)}%`);

/** Seconds as h:mm:ss, m:ss or s. */
function fmtDur(s: number | null): string {
  if (s === null || !Number.isFinite(s)) return '—';
  if (s < 60) return `${num(s, s < 10 ? 1 : 0)} s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

/** A shape per volume, by its place in the volume list: the second encoding beside the colour. */
function Glyph({ i, color, size = 10 }: { i: number; color: string; size?: number }) {
  const r = size / 2;
  const k = i % 8;
  const p = (pts: number[][]) => pts.map(([x, y]) => `${r + x * r},${r + y * r}`).join(' ');
  const shape =
    k === 0 ? <circle cx={r} cy={r} r={r * 0.9} /> :
    k === 1 ? <rect x={size * 0.1} y={size * 0.1} width={size * 0.8} height={size * 0.8} /> :
    k === 2 ? <polygon points={p([[0, -0.95], [0.95, 0.8], [-0.95, 0.8]])} /> :
    k === 3 ? <polygon points={p([[0, -1], [1, 0], [0, 1], [-1, 0]])} /> :
    k === 4 ? <polygon points={p([[0, 0.95], [0.95, -0.8], [-0.95, -0.8]])} /> :
    k === 5 ? <polygon points={p([[-0.35, -1], [0.35, -1], [0.35, -0.35], [1, -0.35], [1, 0.35], [0.35, 0.35], [0.35, 1], [-0.35, 1], [-0.35, 0.35], [-1, 0.35], [-1, -0.35], [-0.35, -0.35]])} /> :
    k === 6 ? <polygon points={p([[0, -1], [0.87, -0.5], [0.87, 0.5], [0, 1], [-0.87, 0.5], [-0.87, -0.5]])} /> :
    <polygon points={p([[-1, -0.6], [-0.6, -1], [0, -0.4], [0.6, -1], [1, -0.6], [0.4, 0], [1, 0.6], [0.6, 1], [0, 0.4], [-0.6, 1], [-1, 0.6], [-0.4, 0]])} />;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="cmp-glyph" aria-hidden>
      <g fill={color} stroke={SURFACE} strokeWidth={0.75}>
        {shape}
      </g>
    </svg>
  );
}

/** The same glyph drawn inside a chart's svg at (x, y). */
function GlyphAt({ i, color, x, y, size = 8 }: { i: number; color: string; x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x - size / 2},${y - size / 2})`} pointerEvents="none">
      <Glyph i={i} color={color} size={size} />
    </g>
  );
}

function useWidth(): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(240, el.clientWidth)));
    ro.observe(el);
    setW(Math.max(240, el.clientWidth));
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/** Round numbers for an axis from 0 to about `max`. */
function ticks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0];
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) out.push(v);
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + step);
  return out;
}

/** A bar from the baseline at x0 to x1, the data end rounded. */
function barPath(x0: number, x1: number, y: number, h: number): string {
  const w = x1 - x0;
  if (w <= 0) return '';
  const r = Math.min(4, w, h / 2);
  return `M${x0},${y}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(w - r)}z`;
}

interface Tip {
  x: number;
  y: number;
  lines: string[];
}

// ---------------------------------------------------------------------------
// Acting on the 3D view

function flyTo(engine: ReturnType<typeof useEngine>, v: Volume): void {
  useVolumeStore.getState().select(v.id);
  if (!engine) return;
  const b = volumeBounds(v);
  const c = [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2];
  const r = Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]) / 2;
  engine.frameAround(c[0], c[1], c[2], Math.max(r, 1));
}

/** Show only the value clicked (again: everything). */
function filterTo(ds: Dataset, dim: Dim, k: number): void {
  const st = useStore.getState();
  let spec: FilterSpec | null = null;
  if (dim === 'team') spec = { kind: 'teams', allowed: [k] };
  else if (dim !== 'dir') {
    const column = dim === 'events' ? CANON.event : dim === 'class' ? CANON.vehicleClass : CANON.actor;
    const kinds: readonly string[] = dim === 'events' ? EVENT_KINDS : dim === 'class' ? VEHICLE_CLASSES : ACTORS;
    const cats = ds.attrs.find((a) => a.name === column)?.categories;
    if (!cats) return;
    const allowed = cats.flatMap((c, i) => (c === kinds[k] ? [i] : []));
    spec = { kind: 'categories', column, allowed };
  }
  if (!spec) return;
  const same = (f: FilterSpec) => (spec!.kind === 'teams' ? f.kind === 'teams' : f.kind === 'categories' && spec!.kind === 'categories' && f.column === spec!.column);
  const old = st.filters.find(same);
  const rest = st.filters.filter((f) => !same(f));
  const again = old && JSON.stringify(old) === JSON.stringify(spec);
  st.setFilters(again ? rest : [...rest, spec]);
}

/** Dataset seconds a time into the match is at in the playback, or null when the matches keep their own clocks. */
function matchBase(ds: Dataset, session: number): number | null {
  const ss = ds.sessionStart;
  if (!ds.sessionId || !ss || ss.length === 0) return ds.timeRange[0];
  if (session >= 0 && session < ss.length) return ss[session];
  let lo = Infinity;
  let hi = -Infinity;
  for (let s = 0; s < ss.length; s++) {
    lo = Math.min(lo, ss[s]);
    hi = Math.max(hi, ss[s]);
  }
  return hi - lo <= 2 ? lo : null;
}

// ---------------------------------------------------------------------------
// The window

export function CompareWindow() {
  const open = useCompareUi((s) => s.open);
  const [stage, setStage] = useState<Element | null>(null);
  useEffect(() => setStage(document.querySelector('.stage')), [open]);
  if (!open || !stage) return null;
  return createPortal(<CompareBody />, stage);
}

function CompareBody() {
  useLang();
  const engine = useEngine();
  const ui = useCompareUi();
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
  const key = scopeKey(scope);
  const visible = useMemo(() => volumes.filter((v) => v.visible), [volumes]);
  const picked = useMemo(() => visible.filter((v) => !ui.off.includes(v.id)), [visible, ui.off]);
  const [res, setRes] = useState<CompareResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!dataset || picked.length < 2) {
      setRes(null);
      setProgress(null);
      return;
    }
    const ctl = new AbortController();
    const timer = setTimeout(() => {
      setProgress(0);
      // The directional heat's bearings when worked out (any source), else the view yaw.
      const dir = (engine as unknown as { directions?: { data?: { angles?: Uint8Array } | null } } | null)?.directions?.data?.angles ?? null;
      runCompare(dataset, picked, scope, dir, { signal: ctl.signal, onProgress: (f) => setProgress(f) })
        .then((r) => {
          setRes(r);
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
  }, [dataset, picked, key]);

  // Each volume's place in the whole list: its glyph.
  const place = useMemo(() => new Map(volumes.map((v, i) => [v.id, i])), [volumes]);
  // The result's volumes, with their current names and colours.
  const vols = useMemo(() => {
    if (!res) return [];
    return res.volumes.flatMap((r) => {
      const v = volumes.find((x) => x.id === r.id);
      return v ? [{ ...r, name: v.name, color: v.color, vol: v, i: place.get(v.id) ?? 0 }] : [];
    });
  }, [res, volumes, place]);

  const [tip, setTip] = useState<Tip | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const showTip = (e: React.MouseEvent, lines: string[]) => {
    const r = bodyRef.current?.getBoundingClientRect();
    if (!r) return;
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, lines });
  };
  const ctx: ChartCtx = { vols, res: res!, ds: dataset!, engine, showTip, hideTip: () => setTip(null), session: scope.session };

  let content: ReactNode;
  if (!dataset) content = <div className="cmp-empty">{t('compare.noData')}</div>;
  else if (picked.length < 2) content = <div className="cmp-empty">{t('compare.needTwo')}</div>;
  else if (!res) content = <div className="cmp-empty">{t('compare.counting', { pct: fmtPct(progress ?? 0) })}</div>;
  else if (ui.view === 'table') content = <CompareTable c={ctx} />;
  else if (ui.view === 'bars') content = <GroupedBars c={ctx} />;
  else if (ui.view === 'time') content = <TimeMultiples c={ctx} />;
  else if (ui.view === 'visits') content = <VisitBoxes c={ctx} />;
  else content = <Flow c={ctx} />;

  return (
    <div className="cmp-window" role="dialog" aria-label={t('compare.title')} onMouseLeave={() => setTip(null)}>
      <div className="cmp-head">
        <strong>{t('compare.title')}</strong>
        <Segmented<View>
          value={ui.view}
          onChange={(view) => ui.set({ view })}
          options={[
            { value: 'table', label: t('compare.view.table') },
            { value: 'bars', label: t('compare.view.bars') },
            { value: 'time', label: t('compare.view.time') },
            { value: 'visits', label: t('compare.view.visits') },
            { value: 'flow', label: t('compare.view.flow') },
          ]}
        />
        <span className="cmp-status">
          {progress !== null && res ? t('compare.counting', { pct: fmtPct(progress) }) : res ? t('compare.scope', { rows: fmtInt(res.shownRows), matches: fmtInt(res.matches) }) : ''}
        </span>
        <button className="cmp-close" onClick={() => ui.set({ open: false })} title={t('compare.close')} aria-label={t('compare.close')}>
          ×
        </button>
      </div>
      <div className="cmp-legend" title={t('compare.legend')}>
        {visible.map((v) => {
          const on = !ui.off.includes(v.id);
          return (
            <span key={v.id} className={`cmp-chip${on ? '' : ' off'}`} title={t('compare.pickTitle')}>
              <input
                type="checkbox"
                checked={on}
                onChange={(e) => ui.set({ off: e.target.checked ? ui.off.filter((x) => x !== v.id) : [...ui.off, v.id] })}
              />
              <Glyph i={place.get(v.id) ?? 0} color={v.color} />
              <button className="cmp-link" onClick={() => flyTo(engine, v)}>
                {v.name}
              </button>
            </span>
          );
        })}
      </div>
      <div className="cmp-body" ref={bodyRef}>
        {content}
        {tip && (
          <div className="cmp-tip" style={{ left: tip.x + 12, top: tip.y + 12 }}>
            {tip.lines.map((l, i) => (
              <div key={i} className={i === 0 ? 'cmp-tip-head' : undefined}>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type Vol = VolumeCompare & { vol: Volume; i: number };

interface ChartCtx {
  vols: Vol[];
  res: CompareResult;
  ds: Dataset;
  engine: ReturnType<typeof useEngine>;
  showTip: (e: React.MouseEvent, lines: string[]) => void;
  hideTip: () => void;
  session: number;
}

// ---------------------------------------------------------------------------
// The categories the bars and the table break the volumes down by

interface Breakdown {
  labels: string[];
  /** Per volume, per category. */
  values: number[][];
}

function breakdown(c: ChartCtx, dim: Dim): Breakdown | null {
  const pick = (f: (v: Vol) => number[] | null): number[][] | null => {
    const out = c.vols.map(f);
    return out.every((x) => x) ? (out as number[][]) : null;
  };
  // Presence where every row has a gap, rows otherwise.
  const pres = c.vols.every((v) => v.presence !== null);
  if (dim === 'events') {
    const v = pick((x) => x.events);
    return v && { labels: EVENT_KINDS.map((k) => valueLabel(CANON.event, k)), values: v };
  }
  if (dim === 'class') {
    const v = pick((x) => (x.byClass ? (pres ? x.byClass.presence : x.byClass.rows) : null));
    return v && { labels: VEHICLE_CLASSES.map((k) => valueLabel(CANON.vehicleClass, k)), values: v };
  }
  if (dim === 'actor') {
    const v = pick((x) => (x.byActor ? (pres ? x.byActor.presence : x.byActor.rows) : null));
    return v && { labels: ACTORS.map((k) => valueLabel(CANON.actor, k)), values: v };
  }
  if (dim === 'team') {
    const v = pick((x) => (x.byTeam ? (pres ? x.byTeam.presence : x.byTeam.rows) : null));
    return v && { labels: c.ds.teamLabels.slice(), values: v };
  }
  const v = pick((x) => x.dir);
  return v && { labels: Array.from({ length: DIR_SECTORS }, (_, k) => t(`compare.dir.${k}`)), values: v };
}

/** The categories any volume has, in the taxonomy's order. */
function present(b: Breakdown): number[] {
  return b.labels.flatMap((_, k) => (b.values.some((v) => v[k] > 0) ? [k] : []));
}

const shares = (v: number[]) => {
  const s = v.reduce((a, b) => a + b, 0);
  return v.map((x) => (s > 0 ? x / s : 0));
};

// ---------------------------------------------------------------------------
// Table

interface Measure {
  key: string;
  group: string;
  label: string;
  get: (v: Vol) => number | null;
  fmt: (x: number | null) => string;
  /** How the effect size is worked out: over the matches, or over the visits. */
  effect?: SessionMetric | 'visits';
}

function measures(c: ChartCtx): Measure[] {
  const out: Measure[] = [];
  const g = t('compare.group.overview');
  const add = (key: string, label: string, get: Measure['get'], fmt: Measure['fmt'], effect?: Measure['effect'], group = g) =>
    out.push({ key, group, label, get, fmt, effect });
  const has = (f: (v: Vol) => unknown) => c.vols.some((v) => f(v) !== null && f(v) !== undefined);
  add('rows', t('compare.m.rows'), (v) => v.rows, fmtInt, 'rows');
  if (has((v) => v.presence)) add('presence', t('compare.m.presence'), (v) => v.presence, fmtDur, 'presence');
  if (has((v) => v.persons)) add('persons', t('compare.m.persons'), (v) => v.persons, fmtInt, 'persons');
  if (has((v) => v.presence) && has((v) => v.persons))
    add('perPlayer', t('compare.m.perPlayer'), (v) => (v.presence !== null && v.persons ? v.presence / v.persons : null), fmtDur);
  if (has((v) => v.sessions)) add('matches', t('compare.m.matches'), (v) => v.sessions, fmtInt);
  if (has((v) => v.teams)) add('teams', t('compare.m.teams'), (v) => v.teams, fmtInt);
  if (has((v) => v.entries)) {
    add('entries', t('compare.m.entries'), (v) => v.entries, fmtInt, 'entries');
    add('exits', t('compare.m.exits'), (v) => v.exits, fmtInt);
  }
  if (has((v) => v.visits)) {
    add('visits', t('compare.m.visits'), (v) => v.visits?.n ?? null, fmtInt);
    add('visitMedian', t('compare.m.visitMedian'), (v) => v.visits?.p50 ?? null, fmtDur, 'visits');
    add('visitMean', t('compare.m.visitMean'), (v) => v.visits?.mean ?? null, fmtDur);
  }
  if (has((v) => v.kills)) {
    add('kills', t('compare.m.kills'), (v) => v.kills, fmtInt, 'kills');
    add('deaths', t('compare.m.deaths'), (v) => v.deaths, fmtInt, 'deaths');
    add('kd', t('compare.m.kd'), (v) => (v.kills !== null && v.deaths ? v.kills / v.deaths : null), fmtDec);
    if (has((v) => v.presence))
      add('kpm', t('compare.m.kpm'), (v) => (v.kills !== null && v.presence ? v.kills / (v.presence / 60) : null), fmtDec);
  }
  // What was paid, lost and earned inside (data/cost.ts), in total and by group.
  const money = useStore.getState().heat.money ?? 'usd';
  for (const name of c.vols.find((v) => v.values)?.values?.map((x) => x.name) ?? []) {
    const col = parseValueColumn(name);
    if (!col) continue;
    const label = valueColumnLabel(col, money);
    const fmt = (x: number | null) => fmtInt(x === null ? null : shownValue(x, col.currency, money));
    const of = (v: Vol) => v.values?.find((x) => x.name === name) ?? null;
    const group = t('value.compareGroup');
    add(`value.${name}`, label, (v) => of(v)?.total ?? null, fmt, undefined, group);
    c.ds.teamLabels.forEach((team, g) => {
      if (c.vols.some((v) => (of(v)?.byTeam[g] ?? 0) !== 0))
        add(`value.${name}.${g}`, t('value.byTeam', { kind: label, team: String(team) }), (v) => of(v)?.byTeam[g] ?? null, fmt, undefined, group);
    });
    VEHICLE_CLASSES.forEach((k, i) => {
      if (c.vols.some((v) => (of(v)?.byClass[i] ?? 0) !== 0))
        add(`value.${name}.c${i}`, t('value.byTeam', { kind: label, team: valueLabel(CANON.vehicleClass, k) }), (v) => of(v)?.byClass[i] ?? null, fmt, undefined, group);
    });
  }
  const dims: [Dim, string][] = [
    ['events', t('compare.group.events')],
    ['class', t('compare.group.class')],
    ['actor', t('compare.group.actor')],
    ['team', t('compare.group.team')],
    ['dir', t('compare.group.dir')],
  ];
  for (const [dim, group] of dims) {
    const b = breakdown(c, dim);
    if (!b) continue;
    const sh = dim === 'events' ? null : b.values.map(shares);
    const idx = new Map(c.vols.map((v, i) => [v.id, i]));
    for (const k of present(b))
      add(
        `${dim}.${k}`,
        b.labels[k],
        (v) => (sh ? sh[idx.get(v.id)!][k] : b.values[idx.get(v.id)!][k]),
        sh ? fmtPct : fmtInt,
        undefined,
        group,
      );
  }
  return out;
}

function effectOf(m: Measure, base: Vol, v: Vol): { d: number; cliff: boolean } | null {
  if (!m.effect) return null;
  if (m.effect === 'visits') return base.visits && v.visits ? { d: cliffsDelta(base.visits.hist, v.visits.hist), cliff: true } : null;
  const a = matchSeries(base, m.effect);
  const b = matchSeries(v, m.effect);
  return a && b ? { d: pairedEffect(a, b), cliff: false } : null;
}

function CompareTable({ c }: { c: ChartCtx }) {
  const ui = useCompareUi();
  const list = useMemo(() => measures(c), [c.vols, c.ds]); // eslint-disable-line react-hooks/exhaustive-deps
  const base = c.vols[0];
  const sortVol = ui.sortBy ? c.vols.find((v) => v.id === ui.sortBy && v !== base) : undefined;
  const rows = useMemo(() => {
    if (!sortVol) return list;
    const score = (m: Measure) => {
      const e = effectOf(m, base, sortVol);
      const a = m.get(base);
      const b = m.get(sortVol);
      const rel = a !== null && b !== null && a !== 0 ? Math.abs((b - a) / a) : 0;
      return [e && Number.isFinite(e.d) ? Math.abs(e.d) : -1, rel] as const;
    };
    return [...list].sort((p, q) => {
      const [ep, rp] = score(p);
      const [eq, rq] = score(q);
      return eq - ep || rq - rp;
    });
  }, [list, sortVol, base]);
  let lastGroup = '';
  return (
    <div className="cmp-scroll">
      <p className="cmp-hint">{t('compare.sortHint')}</p>
      <table className="cmp-table">
        <thead>
          <tr>
            <th className={`cmp-sortable${sortVol ? '' : ' on'}`} onClick={() => ui.set({ sortBy: null })}>
              {t('compare.measure')}
            </th>
            {c.vols.map((v, k) => (
              <th
                key={v.id}
                className={k > 0 ? `cmp-sortable${sortVol?.id === v.id ? ' on' : ''}` : undefined}
                onClick={() => (k > 0 ? ui.set({ sortBy: v.id }) : flyTo(c.engine, v.vol))}
                title={k > 0 ? t('compare.sortHint') : t('compare.legend')}
              >
                <span className="cmp-vh">
                  <Glyph i={v.i} color={v.color} />
                  {v.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.flatMap((m) => {
            const out: ReactNode[] = [];
            if (!sortVol && m.group !== lastGroup) {
              lastGroup = m.group;
              out.push(
                <tr key={`g.${m.group}`} className="cmp-group">
                  <td colSpan={c.vols.length + 1}>{m.group}</td>
                </tr>,
              );
            }
            const a = m.get(base);
            out.push(
              <tr key={m.key}>
                <td className="cmp-mlabel">{m.label}</td>
                {c.vols.map((v, k) => {
                  const b = m.get(v);
                  if (k === 0) return <td key={v.id}>{m.fmt(b)}</td>;
                  const rel = a !== null && b !== null && a !== 0 ? (b - a) / Math.abs(a) : null;
                  const e = effectOf(m, base, v);
                  const word = e ? effectWord(e.d, e.cliff) : null;
                  return (
                    <td key={v.id} title={t('compare.effectTitle')}>
                      <div>{m.fmt(b)}</div>
                      <div className="cmp-delta">
                        {rel !== null && Number.isFinite(rel) ? `${rel >= 0 ? '+' : '−'}${fmtPct(Math.abs(rel))}` : ''}
                        {e && Number.isFinite(e.d) ? ` · ${e.cliff ? 'δ' : 'd'} ${num(e.d, 2)}${word ? ` ${t(`compare.effect.${word}`)}` : ''}` : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>,
            );
            return out;
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grouped bars

function GroupedBars({ c }: { c: ChartCtx }) {
  const ui = useCompareUi();
  const [ref, w] = useWidth();
  const dims: { value: Dim; label: string }[] = (
    [
      ['events', 'heat.filterPanel.col.event'],
      ['class', 'heat.filterPanel.col.vehicleClass'],
      ['actor', 'heat.filterPanel.col.actor'],
      ['team', 'compare.m.teams'],
      ['dir', 'direction.section'],
    ] as [Dim, string][]
  )
    .filter(([d]) => breakdown(c, d))
    .map(([value, key]) => ({ value, label: t(key) }));
  const dim = dims.some((d) => d.value === ui.dim) ? ui.dim : dims[0]?.value;
  const b = dim ? breakdown(c, dim) : null;
  const header = (
    <div className="cmp-controls">
      <span>{t('compare.bars.by')}</span>
      {dims.length > 0 && <Segmented<Dim> value={dim!} options={dims} onChange={(d) => ui.set({ dim: d })} />}
      <Segmented<'share' | 'count'>
        value={ui.share ? 'share' : 'count'}
        options={[
          { value: 'share', label: t('compare.bars.share') },
          { value: 'count', label: t('compare.bars.count') },
        ]}
        onChange={(v) => ui.set({ share: v === 'share' })}
      />
    </div>
  );
  if (!b) return <div className="cmp-scroll">{header}<div className="cmp-empty">{t('compare.empty')}</div></div>;
  const cats = present(b);
  const vals = ui.share ? b.values.map(shares) : b.values;
  const nv = c.vols.length;
  const barH = 10;
  const gap = 2;
  const groupH = nv * (barH + gap) + 10;
  const left = Math.min(180, w * 0.32);
  const right = 16;
  const top = 6;
  const h = top + cats.length * groupH + 24;
  let max = 0;
  for (const v of vals) for (const k of cats) max = Math.max(max, v[k]);
  const tk = ticks(max);
  const xMax = tk[tk.length - 1] || 1;
  const x = (v: number) => left + (v / xMax) * (w - left - right);
  const fmt = ui.share ? fmtPct : fmtInt;
  const isPres = c.vols.every((v) => v.presence !== null) && dim !== 'events' && dim !== 'dir';
  return (
    <div className="cmp-scroll" ref={ref}>
      {header}
      <p className="cmp-hint">{t('compare.bars.hint')}</p>
      {cats.length === 0 ? (
        <div className="cmp-empty">{t('compare.empty')}</div>
      ) : (
        <svg width={w} height={h} className="cmp-svg" role="img">
          {tk.map((v) => (
            <g key={v}>
              <line x1={x(v)} x2={x(v)} y1={top} y2={h - 20} className="cmp-grid" />
              <text x={x(v)} y={h - 6} className="cmp-axis" textAnchor="middle">
                {fmt(v)}
              </text>
            </g>
          ))}
          {cats.map((k, gi) => {
            const y0 = top + gi * groupH;
            return (
              <g key={k}>
                <text x={left - 8} y={y0 + (nv * (barH + gap)) / 2 + 4} className="cmp-label" textAnchor="end">
                  {b.labels[k].length > 28 ? `${b.labels[k].slice(0, 27)}…` : b.labels[k]}
                </text>
                {c.vols.map((v, vi) => {
                  const val = vals[vi][k];
                  const y = y0 + vi * (barH + gap);
                  const lines = [
                    `${v.name} · ${b.labels[k]}`,
                    `${fmt(val)}${ui.share ? ` (${isPres ? fmtDur(b.values[vi][k]) : fmtInt(b.values[vi][k])})` : ''}`,
                  ];
                  return (
                    <g
                      key={v.id}
                      className="cmp-hit"
                      onMouseMove={(e) => c.showTip(e, lines)}
                      onMouseLeave={c.hideTip}
                      onClick={() => (dim === 'dir' ? flyTo(c.engine, v.vol) : filterTo(c.ds, dim!, k))}
                    >
                      <rect x={left} y={y - 1} width={w - left - right} height={barH + 2} fill="transparent" />
                      <path d={barPath(x(0), x(val), y, barH)} fill={v.color} />
                      {x(val) - x(0) > 12 && <GlyphAt i={v.i} color={v.color} x={x(val) + 7} y={y + barH / 2} size={8} />}
                    </g>
                  );
                })}
              </g>
            );
          })}
          <line x1={x(0)} x2={x(0)} y1={top} y2={h - 20} className="cmp-base" />
        </svg>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Over the match: one chart per volume, one scale

function TimeMultiples({ c }: { c: ChartCtx }) {
  const ui = useCompareUi();
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const curves = c.vols.map((v) => (v.curve ? v.curve[ui.timeMetric] : null));
  const header = (
    <div className="cmp-controls">
      <span>{t('compare.time.show')}</span>
      <Segmented<TimeMetric>
        value={ui.timeMetric}
        onChange={(m) => ui.set({ timeMetric: m })}
        options={[
          { value: 'presence', label: t('compare.m.presence'), disabled: c.vols.some((v) => v.presence === null) },
          { value: 'rows', label: t('compare.m.rows') },
          { value: 'kills', label: t('compare.m.kills'), disabled: c.vols.every((v) => v.kills === null) },
        ]}
      />
    </div>
  );
  if (curves.some((x) => !x)) return <div className="cmp-scroll">{header}<div className="cmp-empty">{t('compare.empty')}</div></div>;
  const base = matchBase(c.ds, c.session);
  const cols = w > 960 ? 3 : w > 560 ? 2 : 1;
  const pw = Math.floor((w - (cols - 1) * 12) / cols);
  const ph = 120;
  const pad = { l: 48, r: 8, t: 28, b: 22 };
  let max = 0;
  for (const cv of curves) for (const v of cv!) max = Math.max(max, v);
  const tk = ticks(max, 3);
  const yMax = tk[tk.length - 1] || 1;
  const span = c.res.span;
  const binS = span / CURVE_BINS;
  const fmtY = ui.timeMetric === 'presence' ? fmtDur : fmtInt;
  const xTicks = ticks(span / 60, 4);
  return (
    <div className="cmp-scroll" ref={ref}>
      {header}
      <p className="cmp-hint">
        {t('compare.time.hint')} {base === null ? t('compare.time.noJump') : ''}
      </p>
      <div className="cmp-grid-multi" style={{ gridTemplateColumns: `repeat(${cols}, ${pw}px)` }}>
        {c.vols.map((v, vi) => {
          const cv = curves[vi]!;
          const iw = pw - pad.l - pad.r;
          const ih = ph - pad.t - pad.b;
          const xb = (b: number) => pad.l + ((b + 0.5) / CURVE_BINS) * iw;
          const y = (val: number) => pad.t + ih - (val / yMax) * ih;
          const line = cv.map((val, b) => `${b ? 'L' : 'M'}${xb(b).toFixed(1)},${y(val).toFixed(1)}`).join('');
          const area = `${line}L${xb(CURVE_BINS - 1)},${y(0)}L${xb(0)},${y(0)}Z`;
          const binAt = (e: React.MouseEvent<SVGSVGElement>) => {
            const r = e.currentTarget.getBoundingClientRect();
            return Math.max(0, Math.min(CURVE_BINS - 1, Math.floor(((e.clientX - r.left - pad.l) / iw) * CURVE_BINS)));
          };
          return (
            <svg
              key={v.id}
              width={pw}
              height={ph}
              className="cmp-svg cmp-hit"
              onMouseMove={(e) => {
                const b = binAt(e);
                setHover(b);
                c.showTip(e, [
                  `${fmtDur(b * binS)}–${fmtDur((b + 1) * binS)}`,
                  ...c.vols.map((o, oi) => `${o.name}: ${fmtY(curves[oi]![b])}`),
                ]);
              }}
              onMouseLeave={() => {
                setHover(null);
                c.hideTip();
              }}
              onClick={(e) => {
                if (base === null) return;
                useStore.getState().seek(base + (binAt(e) + 0.5) * binS);
              }}
            >
              <g>
                <GlyphAt i={v.i} color={v.color} x={6} y={10} size={9} />
                <text x={15} y={14} className="cmp-label">
                  {v.name}
                </text>
              </g>
              {tk.map((tv) => (
                <g key={tv}>
                  <line x1={pad.l} x2={pw - pad.r} y1={y(tv)} y2={y(tv)} className="cmp-grid" />
                  <text x={pad.l - 4} y={y(tv) + 3} className="cmp-axis" textAnchor="end">
                    {fmtY(tv)}
                  </text>
                </g>
              ))}
              {xTicks.map((m) => {
                const xx = pad.l + ((m * 60) / span) * iw;
                return xx <= pw - pad.r + 0.5 ? (
                  <text key={m} x={xx} y={ph - 6} className="cmp-axis" textAnchor="middle">
                    {num(m, 0)}
                  </text>
                ) : null;
              })}
              <path d={area} fill={v.color} opacity={0.18} />
              <path d={line} fill="none" stroke={v.color} strokeWidth={2} strokeLinejoin="round" />
              {hover !== null && (
                <>
                  <line x1={xb(hover)} x2={xb(hover)} y1={pad.t} y2={pad.t + ih} className="cmp-cross" />
                  <circle cx={xb(hover)} cy={y(cv[hover])} r={4} fill={v.color} stroke={SURFACE} strokeWidth={2} />
                </>
              )}
            </svg>
          );
        })}
      </div>
      <div className="cmp-axis-title">{t('compare.time.axis')}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visits: box and violin per volume, log scale

function VisitBoxes({ c }: { c: ChartCtx }) {
  const [ref, w] = useWidth();
  const vs = c.vols.filter((v) => v.visits && v.visits.n > 0);
  if (vs.length === 0) return <div className="cmp-scroll" ref={ref}><div className="cmp-empty">{t('compare.empty')}</div></div>;
  const left = Math.min(160, w * 0.28);
  const right = 16;
  const rowH = 44;
  const top = 6;
  const h = top + vs.length * rowH + 26;
  let hiBin = 1;
  for (const v of vs) v.visits!.hist.forEach((n, b) => n > 0 && (hiBin = Math.max(hiBin, b + 1)));
  const lo = Math.log10(visitEdge(0));
  const hi = Math.log10(visitEdge(Math.min(VISIT_BINS, hiBin)));
  const x = (s: number) => left + ((Math.log10(Math.max(s, visitEdge(0))) - lo) / (hi - lo)) * (w - left - right);
  const marks = [0.1, 0.5, 1, 5, 10, 30, 60, 300, 600, 1800, 3600, 7200, 36000].filter((s) => s >= visitEdge(0) && Math.log10(s) <= hi + 1e-9);
  return (
    <div className="cmp-scroll" ref={ref}>
      <p className="cmp-hint">{t('compare.visits.hint')}</p>
      <svg width={w} height={h} className="cmp-svg" role="img">
        {marks.map((s) => (
          <g key={s}>
            <line x1={x(s)} x2={x(s)} y1={top} y2={h - 20} className="cmp-grid" />
            <text x={x(s)} y={h - 6} className="cmp-axis" textAnchor="middle">
              {fmtDur(s)}
            </text>
          </g>
        ))}
        {vs.map((v, k) => {
          const st = v.visits!;
          const cy = top + k * rowH + rowH / 2;
          const peak = Math.max(...st.hist);
          // The violin: each bin's share of the visits, mirrored about the row's middle.
          const half = rowH / 2 - 4;
          const pts = st.hist.map((n, b) => [x(visitEdge(b + 0.5)), (n / peak) * half] as const).filter(([px]) => px <= w - right);
          const shape = `M${pts.map(([px, d]) => `${px.toFixed(1)},${(cy - d).toFixed(1)}`).join('L')}L${pts
            .slice()
            .reverse()
            .map(([px, d]) => `${px.toFixed(1)},${(cy + d).toFixed(1)}`)
            .join('L')}Z`;
          const lines = [
            v.name,
            `${t('compare.m.visits')}: ${fmtInt(st.n)}`,
            `p5 ${fmtDur(st.p5)} · p25 ${fmtDur(st.p25)} · ${t('compare.m.visitMedian')} ${fmtDur(st.p50)}`,
            `p75 ${fmtDur(st.p75)} · p95 ${fmtDur(st.p95)} · max ${fmtDur(st.max)}`,
            `${t('compare.m.visitMean')}: ${fmtDur(st.mean)}`,
          ];
          return (
            <g key={v.id} className="cmp-hit" onMouseMove={(e) => c.showTip(e, lines)} onMouseLeave={c.hideTip} onClick={() => flyTo(c.engine, v.vol)}>
              <rect x={0} y={cy - rowH / 2} width={w} height={rowH} fill="transparent" />
              <GlyphAt i={v.i} color={v.color} x={8} y={cy} size={9} />
              <text x={left - 8} y={cy + 4} className="cmp-label" textAnchor="end">
                {v.name.length > 22 ? `${v.name.slice(0, 21)}…` : v.name}
              </text>
              <path d={shape} fill={v.color} opacity={0.22} />
              <line x1={x(st.p5)} x2={x(st.p95)} y1={cy} y2={cy} stroke={v.color} strokeWidth={2} />
              <line x1={x(st.p5)} x2={x(st.p5)} y1={cy - 5} y2={cy + 5} stroke={v.color} strokeWidth={2} />
              <line x1={x(st.p95)} x2={x(st.p95)} y1={cy - 5} y2={cy + 5} stroke={v.color} strokeWidth={2} />
              <rect x={x(st.p25)} y={cy - 8} width={Math.max(2, x(st.p75) - x(st.p25))} height={16} rx={3} fill={v.color} stroke={SURFACE} strokeWidth={2} />
              <line x1={x(st.p50)} x2={x(st.p50)} y1={cy - 8} y2={cy + 8} stroke={SURFACE} strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      <div className="cmp-axis-title">{t('compare.visits.axis')}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flow: the transition matrix and the ribbons

/** Sequential blue for the dark surface: near the surface for little, light for much. */
const SEQ = ['#0d366b', '#104281', '#184f95', '#1c5cab', '#256abf', '#2a78d6', '#3987e5', '#5598e7', '#6da7ec', '#86b6ef'];
const NEUTRAL = '#8d96a5';

function Flow({ c }: { c: ChartCtx }) {
  const [ref, w] = useWidth();
  const f = c.res.flow;
  const n = c.vols.length;
  if (!f || f.every((x) => x === 0)) return <div className="cmp-scroll" ref={ref}><div className="cmp-empty">{t('compare.empty')}</div></div>;
  const N = n + 1;
  const name = (k: number, from: boolean) => (k < n ? c.vols[k].name : from ? t('compare.flow.start') : t('compare.flow.end'));
  const max = Math.max(...f);
  const go = (to: number) => to < n && flyTo(c.engine, c.vols[to].vol);
  // The matrix.
  const cell = Math.max(26, Math.min(48, Math.floor((Math.min(w, 520) - 120) / N)));
  const ml = 110;
  const mt = 44;
  const matrix = (
    <svg width={ml + N * cell + 8} height={mt + N * cell + 8} className="cmp-svg" role="img">
      <text x={ml} y={12} className="cmp-axis">
        {t('compare.flow.to')} →
      </text>
      <text x={4} y={mt - 6} className="cmp-axis">
        {t('compare.flow.from')} ↓
      </text>
      {Array.from({ length: N }, (_, to) => (
        <g key={`c${to}`}>
          {to < n && <GlyphAt i={c.vols[to].i} color={c.vols[to].color} x={ml + to * cell + cell / 2} y={mt - 18} size={9} />}
          <text x={ml + to * cell + cell / 2} y={mt - 4} className="cmp-axis" textAnchor="middle">
            {name(to, false).slice(0, Math.max(3, Math.floor(cell / 6)))}
          </text>
        </g>
      ))}
      {Array.from({ length: N }, (_, from) => (
        <g key={`r${from}`}>
          <text x={ml - 18} y={mt + from * cell + cell / 2 + 4} className="cmp-label" textAnchor="end">
            {name(from, true).length > 14 ? `${name(from, true).slice(0, 13)}…` : name(from, true)}
          </text>
          {from < n && <GlyphAt i={c.vols[from].i} color={c.vols[from].color} x={ml - 9} y={mt + from * cell + cell / 2} size={9} />}
          {Array.from({ length: N }, (_, to) => {
            const v = f[from * N + to];
            const col = v > 0 ? SEQ[Math.min(SEQ.length - 1, Math.floor((Math.sqrt(v / max) * (SEQ.length - 1)) + 0.5))] : 'transparent';
            const light = v > 0 && SEQ.indexOf(col) >= 6;
            return (
              <g
                key={to}
                className="cmp-hit"
                onMouseMove={(e) => c.showTip(e, [`${name(from, true)} → ${name(to, false)}`, fmtInt(v)])}
                onMouseLeave={c.hideTip}
                onClick={() => go(to)}
              >
                <rect x={ml + to * cell + 1} y={mt + from * cell + 1} width={cell - 2} height={cell - 2} rx={3} fill={col} className="cmp-cell" />
                {v > 0 && (
                  <text x={ml + to * cell + cell / 2} y={mt + from * cell + cell / 2 + 4} textAnchor="middle" className={light ? 'cmp-cell-dark' : 'cmp-cell-text'}>
                    {v >= 10000 ? `${num(v / 1000, 0)}k` : fmtInt(v)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
  // The ribbons: sources on the left, destinations on the right, width by count.
  const rw = Math.max(260, Math.min(w - (w > 900 ? ml + N * cell + 40 : 0), 640));
  const rh = 40 + N * 46;
  const outT = Array.from({ length: N }, (_, a) => f.slice(a * N, a * N + N).reduce((s, x) => s + x, 0));
  const inT = Array.from({ length: N }, (_, b) => Array.from({ length: N }, (_, a) => f[a * N + b]).reduce((s, x) => s + x, 0));
  const total = outT.reduce((s, x) => s + x, 0);
  const gapY = 8;
  const usable = rh - 20 - gapY * (N - 1);
  const k = total > 0 ? usable / total : 0;
  const nodeW = 10;
  const lx = 110;
  const rx = rw - 110;
  const lY: number[] = [];
  const rY: number[] = [];
  let ly = 10;
  let ry = 10;
  for (let a = 0; a < N; a++) {
    lY.push(ly);
    ly += outT[a] * k + gapY;
    rY.push(ry);
    ry += inT[a] * k + gapY;
  }
  const lOff = lY.slice();
  const rOff = rY.slice();
  const ribbons: ReactNode[] = [];
  for (let a = 0; a < N; a++)
    for (let b = 0; b < N; b++) {
      const v = f[a * N + b];
      if (!v) continue;
      const th = v * k;
      const y0 = lOff[a];
      const y1 = rOff[b];
      lOff[a] += th;
      rOff[b] += th;
      const x0 = lx + nodeW;
      const x1 = rx;
      const mx = (x0 + x1) / 2;
      const d = `M${x0},${y0}C${mx},${y0} ${mx},${y1} ${x1},${y1}L${x1},${y1 + th}C${mx},${y1 + th} ${mx},${y0 + th} ${x0},${y0 + th}Z`;
      ribbons.push(
        <path
          key={`${a}.${b}`}
          d={d}
          fill={a < n ? c.vols[a].color : NEUTRAL}
          className="cmp-ribbon cmp-hit"
          onMouseMove={(e) => c.showTip(e, [`${name(a, true)} → ${name(b, false)}`, fmtInt(v)])}
          onMouseLeave={c.hideTip}
          onClick={() => go(b)}
        />,
      );
    }
  const sankey = (
    <svg width={rw} height={rh} className="cmp-svg" role="img">
      {ribbons}
      {Array.from({ length: N }, (_, a) => (
        <g key={a}>
          {outT[a] > 0 && (
            <>
              <rect x={lx} y={lY[a]} width={nodeW} height={Math.max(1, outT[a] * k)} fill={a < n ? c.vols[a].color : NEUTRAL} />
              <text x={lx - 6} y={lY[a] + (outT[a] * k) / 2 + 4} className="cmp-label" textAnchor="end">
                {name(a, true).length > 16 ? `${name(a, true).slice(0, 15)}…` : name(a, true)}
              </text>
            </>
          )}
          {inT[a] > 0 && (
            <>
              <rect x={rx} y={rY[a]} width={nodeW} height={Math.max(1, inT[a] * k)} fill={a < n ? c.vols[a].color : NEUTRAL} />
              <text x={rx + nodeW + 6} y={rY[a] + (inT[a] * k) / 2 + 4} className="cmp-label">
                {name(a, false).length > 16 ? `${name(a, false).slice(0, 15)}…` : name(a, false)}
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
  return (
    <div className="cmp-scroll" ref={ref}>
      <p className="cmp-hint">{t('compare.flow.hint')}</p>
      <div className="cmp-flow">
        <div>
          <div className="cmp-sub">{t('compare.flow.matrix')}</div>
          {matrix}
        </div>
        <div>
          <div className="cmp-sub">{t('compare.flow.ribbons')}</div>
          {sankey}
        </div>
      </div>
    </div>
  );
}
