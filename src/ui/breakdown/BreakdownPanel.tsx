/**
 * Who and what does best and worst in a place: the rows of a picked spot, of
 * the view or of a volume ranked by any category (a vehicle, a weapon or its
 * class, the opponent's weapon, a player, a team, a side, a buy, armour...)
 * on any measure - layer A and B of the difference map and their ratio, share
 * or difference, kills against deaths, rounds won, kills a minute present,
 * money earned and lost - and every state factor (gear, abilities,
 * attachments, buffs, modules) measured with against without. Counted in a
 * worker (`breakdown/breakdownRun.ts`); a click on a row filters the 3D view
 * to it, a second click lets it go.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { SITUATION_COLUMN } from '../../insights/cqb/factors';
import type { BreakdownResult } from '../../breakdown/breakdown';
import {
  dimensionsOf,
  moneyColumns,
  otherColumn,
  runBreakdown,
  weaponColumn,
  listItems,
  type BreakdownPrep,
  type Dimension,
  type Factor,
} from '../../breakdown/breakdownRun';
import {
  factorEffect,
  FACTOR_EFFECTS,
  GROUP_METRICS,
  groupValue,
  interval,
  metricAvailable,
  rankFactors,
  rankGroups,
  sumsAt,
  type Effect,
  type FactorEffect,
  type GroupMetric,
  type Ranked,
} from '../../breakdown/metrics';
import { CANON } from '../../data/canonical';
import { num, t, useLang } from '../../i18n';
import { useInspectStore } from '../../state/inspectStore';
import { useStore } from '../../state/store';
import type { Dataset, FilterSpec } from '../../state/types';
import { currentScope, scopeKey } from '../../volumes/scope';
import { useVolumeStore } from '../../volumes/store';
import type { Region } from '../../breakdown/breakdown';
import { Segmented } from '../controls';
import { useEngine } from '../EngineContext';
import { columnLabel, valueLabel } from '../panels/FilterPanel';
import '../compare/compare.css';
import './breakdown.css';
import { NumberBox } from '../NumberBox';
import { SortTh } from '../sort/SortControl';
import { useSort, useSorted, type SortOption } from '../sort/useSort';

type RegionKind = 'pick' | 'view' | 'volume' | 'all';
type View = 'rank' | 'factors';

interface BreakdownUi {
  open: boolean;
  region: RegionKind;
  /** World units around the picked spot; null: a share of the data's extent. */
  radius: number | null;
  volumeId: string | null;
  dimId: string | null;
  mode: 'own' | 'opponent';
  view: View;
  metric: GroupMetric | null;
  effect: FactorEffect;
  worstFirst: boolean;
  earn: string | null;
  cost: string | null;
  /** The filter a click put on the view (by identity), left out of the breakdown's own rows. */
  highlight: { key: string; filter: FilterSpec } | null;
  /** Bumped to count again (the view moved). */
  rev: number;
  set: (p: Partial<Omit<BreakdownUi, 'set'>>) => void;
}

export const useBreakdownUi = create<BreakdownUi>((set) => ({
  open: false,
  region: 'view',
  radius: null,
  volumeId: null,
  dimId: null,
  mode: 'own',
  view: 'rank',
  metric: null,
  effect: 'kdr',
  worstFirst: false,
  earn: null,
  cost: null,
  highlight: null,
  rev: 0,
  set: (p) => set(p),
}));

/** Opens the breakdown on a place. */
export function openBreakdown(region: RegionKind, volumeId: string | null = null): void {
  const ui = useBreakdownUi.getState();
  ui.set({ open: true, region, volumeId: volumeId ?? ui.volumeId, rev: ui.rev + 1 });
}

export function BreakdownButton({ region, volumeId = null, label }: { region: RegionKind; volumeId?: string | null; label?: string }) {
  useLang();
  const has = useStore((s) => !!s.dataset);
  return (
    <button disabled={!has} title={t('breakdown.openTitle')} onClick={() => openBreakdown(region, volumeId)}>
      {label ?? t('breakdown.open')}
    </button>
  );
}

export function BreakdownWindow() {
  const open = useBreakdownUi((s) => s.open);
  const [stage, setStage] = useState<Element | null>(null);
  useEffect(() => setStage(document.querySelector('.stage')), [open]);
  if (!open || !stage) return null;
  return createPortal(<BreakdownBody />, stage);
}

// ---------------------------------------------------------------------------
// Words and numbers

const fmt = (v: number, digits = 2) => (Number.isFinite(v) ? num(v, Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : digits) : '—');
const fmtInt = (v: number) => (Number.isFinite(v) ? num(v, 0) : '—');
const fmtPct = (v: number) => (Number.isFinite(v) ? `${num(v * 100, 0)}%` : '—');

function dimLabel(d: Dimension): string {
  if (d.kind === 'team') return t('breakdown.dim.team');
  if (d.kind === 'person') return t('breakdown.dim.person');
  if (d.kind === 'session') return t('breakdown.dim.session');
  if (d.kind === 'weaponClass') return t('breakdown.dim.weaponClass', { column: columnLabel(d.column!) });
  if (d.kind === 'utility') return t('breakdown.dim.utility', { column: columnLabel(d.column!) });
  if (d.kind === 'number') return t('breakdown.dim.binned', { column: columnLabel(d.column!) });
  return columnLabel(d.column!);
}

function groupLabel(d: Dimension, label: string): string {
  if (d.kind === 'weaponClass') return t(`breakdown.wclass.${label}`);
  if (d.kind === 'utility') return t('breakdown.utilityCount', { n: label === '4' ? '4+' : label });
  if (d.kind === 'category') return valueLabel(d.column!, label);
  return label;
}

function factorLabel(f: Factor): string {
  // The close-quarters situations (`insights/cqb/factors.ts`) are the viewer's own words.
  if (f.column === SITUATION_COLUMN && f.value) return `${t('breakdown.situations')}: ${t(`breakdown.situation.${f.value}`)}`;
  const col = columnLabel(f.name);
  return f.value === null ? col : `${col}: ${f.value}`;
}

/** An effect and its 95% interval, as a ratio (×) or a difference. */
function fmtEffect(e: Effect | null, kind: FactorEffect): string {
  if (!e) return '—';
  if (e.log) {
    const [lo, hi] = interval(e);
    return `×${fmt(Math.exp(e.est))} (${fmt(Math.exp(lo))}–${fmt(Math.exp(hi))})`;
  }
  if (kind === 'win') {
    const [lo, hi] = interval(e);
    const pts = (v: number) => `${v >= 0 ? '+' : ''}${num(v * 100, 0)}`;
    return t('breakdown.points', { v: pts(e.est), lo: pts(lo), hi: pts(hi) });
  }
  return `${e.est >= 0 ? '+' : ''}${fmt(e.est)}`;
}

/**
 * The world -> clip matrix of the engine's last frame (column major, GL depth),
 * the one its `toScreen` projects with: what the view shows. Read as the
 * engine keeps it, so the breakdown asks nothing new of the engine.
 */
function viewProjection(engine: object): number[] | null {
  const m = (engine as { pickViewProj?: Float32Array }).pickViewProj;
  return m && m.length === 16 && m.some((v) => v !== 0) ? Array.from(m) : null;
}

// ---------------------------------------------------------------------------
// Filters a click puts on the view

function groupFilter(prep: BreakdownPrep, dim: Dimension, g: number): FilterSpec | null {
  if (prep.dim?.spec.mode === 'opponent') return null;
  if (dim.kind === 'team') return { kind: 'teams', allowed: [g] };
  if (dim.kind === 'person') return { kind: 'persons', allowed: [g] };
  if (dim.kind === 'session' || !dim.column || !prep.dim) return null;
  const spec = prep.dim.spec;
  if (spec.edges) return { kind: 'range', column: dim.column, min: spec.edges[g], max: spec.edges[g + 1] };
  const allowed: number[] = [];
  spec.remap!.forEach((v, c) => v === g && allowed.push(c));
  return allowed.length ? { kind: 'categories', column: dim.column, allowed } : null;
}

function factorFilter(ds: Dataset, f: Factor): FilterSpec | null {
  const a = ds.attrs.find((c) => c.name === f.column);
  if (!a) return null;
  if (f.kind === 'flag') return a.max > 0 ? { kind: 'range', column: a.name, min: Math.min(1e-6, a.max), max: a.max } : null;
  const allowed: number[] = [];
  a.categories?.forEach((l, c) => {
    if (f.kind === 'cat' ? l === f.value : listItems(l).includes(f.value!)) allowed.push(c);
  });
  return allowed.length ? { kind: 'categories', column: a.name, allowed } : null;
}

function toggleHighlight(key: string, spec: FilterSpec | null): void {
  const ui = useBreakdownUi.getState();
  const s = useStore.getState();
  const prev = ui.highlight;
  const rest = prev ? s.filters.filter((f) => f !== prev.filter) : s.filters;
  if (!spec || prev?.key === key) {
    ui.set({ highlight: null });
    s.setFilters(rest);
    return;
  }
  ui.set({ highlight: { key, filter: spec } });
  s.setFilters([...rest, spec]);
}

// ---------------------------------------------------------------------------

function defaultDim(ds: Dataset, dims: Dimension[]): string | null {
  const w = weaponColumn(ds);
  const vehicle = ds.attrs.find((a) => a.kind === 'category' && /^(vehicle|vehicle.?name|unit|unit.?type|agent|kit|class)$/i.test(a.name));
  const pick = (id: string) => (dims.some((d) => d.id === id) ? id : null);
  return (w && pick(`cat:${w.name}`)) ?? (vehicle && pick(`cat:${vehicle.name}`)) ?? pick(`cat:${CANON.vehicleClass}`) ?? pick('team') ?? dims[0]?.id ?? null;
}

function BreakdownBody() {
  useLang();
  const engine = useEngine();
  const ui = useBreakdownUi();
  const dataset = useStore((s) => s.dataset);
  const timeline = useStore((s) => s.timeline);
  const filters = useStore((s) => s.filters);
  const teamVisibility = useStore((s) => s.teamVisibility);
  const mode = useStore((s) => s.mode);
  const split = useStore((s) => s.split);
  const positiveTeams = useStore((s) => s.positiveTeams);
  const negativeTeams = useStore((s) => s.negativeTeams);
  const session = useStore((s) => s.team.session);
  const pick = useInspectStore((s) => s.pick);
  const volumes = useVolumeStore((s) => s.volumes);
  const selectedVolume = useVolumeStore((s) => s.selected);
  const playhead = Math.floor(engine?.live.playhead ?? timeline.playhead);
  const dims = useMemo(() => (dataset ? dimensionsOf(dataset) : []), [dataset]);
  const money = useMemo(() => (dataset ? moneyColumns(dataset) : { earn: [], cost: [] }), [dataset]);
  const hasOpponent = useMemo(() => !!dataset && !!otherColumn(dataset), [dataset]);
  const dimId = ui.dimId && dims.some((d) => d.id === ui.dimId) ? ui.dimId : dataset ? defaultDim(dataset, dims) : null;
  const dim = dims.find((d) => d.id === dimId) ?? null;
  const earn = ui.earn && money.earn.includes(ui.earn) ? ui.earn : (money.earn[0] ?? null);
  const cost = ui.cost && money.cost.includes(ui.cost) ? ui.cost : (money.cost.find((c) => /lost/i.test(c)) ?? money.cost[0] ?? null);
  const sided = mode === 'heat-difference';
  const volumeId = ui.volumeId && volumes.some((v) => v.id === ui.volumeId) ? ui.volumeId : (selectedVolume ?? volumes[0]?.id ?? null);
  const volume = volumes.find((v) => v.id === volumeId) ?? null;
  const diag = dataset ? Math.hypot(dataset.bounds.maxX - dataset.bounds.minX, dataset.bounds.maxY - dataset.bounds.minY, dataset.bounds.maxZ - dataset.bounds.minZ) : 1;
  const radius = ui.radius ?? Math.max(1, Math.round(diag * 0.03));
  const point = pick?.point ?? null;

  const region: Region | null = useMemo(() => {
    if (ui.region === 'all') return { kind: 'all' };
    if (ui.region === 'pick') return point ? { kind: 'sphere', c: [point.x, point.y, point.z], r: radius } : null;
    if (ui.region === 'volume') return volume ? { kind: 'volume', v: volume } : null;
    const m = engine ? viewProjection(engine) : null;
    return m ? { kind: 'frustum', m } : { kind: 'all' };
    // The view is read when asked (`rev`), not as the camera moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.region, point?.x, point?.y, point?.z, radius, volume, ui.rev, engine]);

  const hl = ui.highlight;
  const scope = useMemo(() => {
    const s = useStore.getState();
    const own = hl ? s.filters.filter((f) => f !== hl.filter) : s.filters;
    return currentScope({ ...s, filters: own }, playhead);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, timeline.mode, timeline.window, timeline.windowSeconds, timeline.defaultLifetime, filters, teamVisibility, mode, session, playhead, hl]);

  // Counted again when the rows change, not when a render makes an equal scope.
  const scopeK = scopeKey(scope);
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const [res, setRes] = useState<{ prep: BreakdownPrep; result: BreakdownResult } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dataset || !region) {
      setRes(null);
      setProgress(null);
      return;
    }
    const ctl = new AbortController();
    const timer = setTimeout(() => {
      setProgress(0);
      setError(null);
      runBreakdown(
        dataset,
        {
          scope: scopeRef.current,
          region,
          split: sided ? { rule: split, positiveTeams, negativeTeams, visibility: teamVisibility } : null,
          dim,
          mode: hasOpponent ? ui.mode : 'own',
          earn,
          cost,
        },
        { signal: ctl.signal, onProgress: setProgress },
      )
        .then((r) => {
          setRes(r);
          setProgress(null);
        })
        .catch((e: unknown) => {
          if ((e as { name?: string }).name === 'AbortError') return;
          setError(String((e as Error).message ?? e));
          setProgress(null);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, [dataset, region, scopeK, sided, split, positiveTeams, negativeTeams, teamVisibility, dim, ui.mode, hasOpponent, earn, cost]);

  const close = () => {
    if (useBreakdownUi.getState().highlight) toggleHighlight('', null);
    ui.set({ open: false });
  };

  const total = res?.result.total ?? null;
  const metricOptions = GROUP_METRICS.filter((m) => !total || metricAvailable(total, m, sided));
  const metric: GroupMetric = ui.metric && metricOptions.includes(ui.metric) ? ui.metric : sided ? 'share' : total && total.kills + total.deaths > 0 ? 'kdr' : 'a';

  return (
    <div className="cmp-window brk-window" role="dialog" aria-label={t('breakdown.title')}>
      <div className="cmp-head">
        <b>{t('breakdown.title')}</b>
        <Segmented<RegionKind>
          value={ui.region}
          options={[
            { value: 'pick', label: t('breakdown.region.pick'), title: t('breakdown.region.pickTitle'), disabled: !point },
            { value: 'view', label: t('breakdown.region.view') },
            { value: 'volume', label: t('breakdown.region.volume'), disabled: volumes.length === 0 },
            { value: 'all', label: t('breakdown.region.all') },
          ]}
          onChange={(region) => ui.set({ region, rev: ui.rev + 1 })}
        />
        {ui.region === 'pick' && (
          <label className="brk-field">
            {t('breakdown.radius')}
            <NumberBox min={0.1} step={0.1} digits={3} value={radius} onChange={(v) => ui.set({ radius: v })} />
          </label>
        )}
        {ui.region === 'volume' && volumes.length > 0 && (
          <select value={volumeId ?? ''} onChange={(e) => ui.set({ volumeId: e.target.value })}>
            {volumes.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        )}
        {ui.region === 'view' && (
          <button onClick={() => ui.set({ rev: ui.rev + 1 })}>{t('breakdown.refresh')}</button>
        )}
        <span className="cmp-status">
          {error
            ? t('breakdown.failed', { error })
            : progress !== null
              ? t('breakdown.counting', { pct: num(progress * 100, 0) })
              : !region
                ? t('breakdown.noRegion')
                : res
                  ? t('breakdown.status', { rows: num(res.result.shown, 0) })
                  : ''}
        </span>
        <button className="link cmp-close" onClick={close} title={t('heat.inspect.closeTitle')} aria-label={t('heat.inspect.closeTitle')}>×</button>
      </div>
      <div className="cmp-legend brk-controls">
        <Segmented<View>
          value={ui.view}
          options={[
            { value: 'rank', label: t('breakdown.view.rank') },
            { value: 'factors', label: t('breakdown.view.factors'), disabled: !!res && res.prep.factors.factors.length === 0 },
          ]}
          onChange={(view) => ui.set({ view })}
        />
        {ui.view === 'rank' ? (
          <>
            <label className="brk-field">
              {t('breakdown.by')}
              <select value={dimId ?? ''} onChange={(e) => ui.set({ dimId: e.target.value })}>
                {dims.map((d) => (
                  <option key={d.id} value={d.id}>{dimLabel(d)}</option>
                ))}
              </select>
            </label>
            {hasOpponent && dim && dim.kind !== 'team' && dim.kind !== 'session' && (
              <Segmented<'own' | 'opponent'>
                value={ui.mode}
                options={[
                  { value: 'own', label: t('breakdown.mode.own') },
                  { value: 'opponent', label: t('breakdown.mode.opponent'), title: t('breakdown.mode.opponentTitle') },
                ]}
                onChange={(m) => ui.set({ mode: m })}
              />
            )}
            <label className="brk-field">
              {t('breakdown.metric')}
              <select value={metric} onChange={(e) => ui.set({ metric: e.target.value as GroupMetric })}>
                {metricOptions.map((m) => (
                  <option key={m} value={m}>{t(`breakdown.m.${m}`)}</option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <label className="brk-field">
            {t('breakdown.effectOn')}
            <select value={ui.effect} onChange={(e) => ui.set({ effect: e.target.value as FactorEffect })}>
              {FACTOR_EFFECTS.map((k) => (
                <option key={k} value={k}>{t(`breakdown.e.${k}`)}</option>
              ))}
            </select>
          </label>
        )}
        <label className="brk-field">
          <input type="checkbox" checked={ui.worstFirst} onChange={(e) => ui.set({ worstFirst: e.target.checked })} />
          {t('breakdown.worstFirst')}
        </label>
        {money.earn.length > 1 && (
          <label className="brk-field">
            {t('breakdown.m.earn')}
            <select value={earn ?? ''} onChange={(e) => ui.set({ earn: e.target.value })}>
              {money.earn.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        )}
        {money.cost.length > 1 && (
          <label className="brk-field">
            {t('breakdown.m.cost')}
            <select value={cost ?? ''} onChange={(e) => ui.set({ cost: e.target.value })}>
              {money.cost.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="cmp-body">
        <div className="cmp-scroll">
          {!res || !dataset ? (
            <div className="cmp-empty">{!region ? t('breakdown.noRegion') : t('breakdown.counting', { pct: num((progress ?? 0) * 100, 0) })}</div>
          ) : ui.view === 'rank' ? (
            <RankView res={res} dim={dim} metric={metric} sided={sided} worstFirst={ui.worstFirst} highlight={hl?.key ?? null} />
          ) : (
            <FactorView ds={dataset} res={res} effect={ui.effect} worstFirst={ui.worstFirst} highlight={hl?.key ?? null} />
          )}
        </div>
      </div>
    </div>
  );
}

const ROW_CAP = 150;

function RankView({ res, dim, metric, sided, worstFirst, highlight }: {
  res: { prep: BreakdownPrep; result: BreakdownResult }; dim: Dimension | null; metric: GroupMetric; sided: boolean; worstFirst: boolean; highlight: string | null;
}) {
  const { prep, result } = res;
  const ranked = useMemo(() => rankGroups(result, metric), [result, metric]);
  const ordered = useMemo(() => (worstFirst ? [...ranked].reverse() : ranked), [ranked, worstFirst]);
  // The measure's column is the ranking itself (best or worst first, as picked above).
  const at = (r: Ranked) => (result.groups ? sumsAt(result.groups, r.index) : null);
  const num1 = (id: string, label: string, key: (r: Ranked) => number | null | undefined): SortOption<Ranked> => ({ id, label, key, kind: 'number' });
  const sort = useSort<Ranked>(
    'breakdown.groups',
    [
      { id: 'value', label: t(`breakdown.m.${metric}`), key: null },
      { id: 'name', label: dim ? dimLabel(dim) : t('ui.sort.name'), key: (r) => (dim && prep.dim ? groupLabel(dim, prep.dim.labels[r.index]) : null) },
      num1('a', 'A', (r) => at(r)?.a),
      num1('b', 'B', (r) => at(r)?.b),
      num1('kills', t('breakdown.col.kd'), (r) => at(r)?.kills),
      num1('kdr', t('breakdown.m.kdr'), (r) => { const s = at(r); return s ? groupValue(s, result.total, 'kdr') : null; }),
      num1('win', t('breakdown.m.win'), (r) => { const s = at(r); return s && s.played > 0 ? groupValue(s, result.total, 'win') : null; }),
      num1('kpm', t('breakdown.m.kpm'), (r) => { const s = at(r); return s ? groupValue(s, result.total, 'kpm') : null; }),
      num1('earn', t('breakdown.m.earn'), (r) => at(r)?.earn),
      num1('cost', t('breakdown.m.cost'), (r) => at(r)?.cost),
      num1('rows', t('breakdown.col.rows'), (r) => at(r)?.rows),
    ],
    'value',
  );
  const rows = useSorted(ordered, sort, [result, dim, prep]);
  if (!dim || !prep.dim || !result.groups || ranked.length === 0) return <div className="cmp-empty">{t('breakdown.empty')}</div>;
  const g = result.groups;
  const T = result.total;
  const showKd = T.kills + T.deaths > 0;
  // The measure ranked by is shown once, first.
  const showKdr = showKd && metric !== 'kdr';
  const showWin = T.played > 0 && metric !== 'win';
  const showKpm = T.presence > 0 && T.kills > 0 && metric !== 'kpm';
  const showEarn = T.earn !== 0 && metric !== 'earn';
  const showCost = T.cost !== 0 && metric !== 'cost';
  const best = ranked.slice(0, 5);
  const worst = ranked.slice(-5).reverse().filter((r) => !best.includes(r));
  const name = (i: number) => groupLabel(dim, prep.dim!.labels[i]);
  const click = (i: number) => toggleHighlight(`g:${dim.id}:${i}`, groupFilter(prep, dim, i));
  const clickable = prep.dim.spec.mode === 'own' && dim.kind !== 'session';
  return (
    <>
      <p className="cmp-hint">{t('breakdown.rankHint')}</p>
      <div className="brk-lists">
        <List title={t('breakdown.best')} items={best.map((r) => ({ key: r.index, name: name(r.index), value: fmt(r.value) }))} onPick={clickable ? click : null} />
        {worst.length > 0 && <List title={t('breakdown.worst')} items={worst.map((r) => ({ key: r.index, name: name(r.index), value: fmt(r.value) }))} onPick={clickable ? click : null} />}
      </div>
      <table className="cmp-table brk-table">
        <thead>
          <tr>
            <SortTh sort={sort} id="name">{dimLabel(dim)}</SortTh>
            <SortTh sort={sort} id="value">{t(`breakdown.m.${metric}`)}</SortTh>
            {sided && <SortTh sort={sort} id="a">A</SortTh>}
            {sided && <SortTh sort={sort} id="b">B</SortTh>}
            {showKd && <SortTh sort={sort} id="kills">{t('breakdown.col.kd')}</SortTh>}
            {showKdr && <SortTh sort={sort} id="kdr">{t('breakdown.m.kdr')}</SortTh>}
            {showWin && <SortTh sort={sort} id="win">{t('breakdown.m.win')}</SortTh>}
            {showKpm && <SortTh sort={sort} id="kpm">{t('breakdown.m.kpm')}</SortTh>}
            {showEarn && <SortTh sort={sort} id="earn">{t('breakdown.m.earn')}</SortTh>}
            {showCost && <SortTh sort={sort} id="cost">{t('breakdown.m.cost')}</SortTh>}
            <SortTh sort={sort} id="rows">{t('breakdown.col.rows')}</SortTh>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, ROW_CAP).map(({ index: i, value }) => {
            const s = sumsAt(g, i);
            const key = `g:${dim.id}:${i}`;
            return (
              <tr key={i} className={highlight === key ? 'brk-on' : undefined}>
                <td>
                  {clickable ? (
                    <button className="cmp-link" onClick={() => click(i)} title={t('breakdown.filterTitle')}>{name(i)}</button>
                  ) : (
                    name(i)
                  )}
                </td>
                <td><b>{metric === 'win' || metric === 'share' ? fmtPct(value) : fmt(value)}</b></td>
                {sided && <td>{fmtInt(s.a)}</td>}
                {sided && <td>{fmtInt(s.b)}</td>}
                {showKd && <td>{`${fmtInt(s.kills)} / ${fmtInt(s.deaths)}`}</td>}
                {showKdr && <td>{fmt(groupValue(s, T, 'kdr'))}</td>}
                {showWin && <td>{s.played > 0 ? `${fmtPct(groupValue(s, T, 'win'))} (${fmtInt(s.won)}/${fmtInt(s.played)})` : '—'}</td>}
                {showKpm && <td>{fmt(groupValue(s, T, 'kpm'))}</td>}
                {showEarn && <td>{fmt(s.earn, 0)}</td>}
                {showCost && <td>{fmt(s.cost, 0)}</td>}
                <td>{fmtInt(s.rows)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length > ROW_CAP && <p className="cmp-hint">{t('breakdown.more', { n: num(rows.length - ROW_CAP, 0) })}</p>}
    </>
  );
}

function List({ title, items, onPick }: { title: string; items: { key: number; name: string; value: string }[]; onPick: ((i: number) => void) | null }) {
  return (
    <div className="brk-list">
      <div className="brk-list-title">{title}</div>
      <ol>
        {items.map((it) => (
          <li key={it.key}>
            {onPick ? <button className="cmp-link" onClick={() => onPick(it.key)}>{it.name}</button> : it.name}
            <span>{it.value}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FactorView({ ds, res, effect, worstFirst, highlight }: {
  ds: Dataset; res: { prep: BreakdownPrep; result: BreakdownResult }; effect: FactorEffect; worstFirst: boolean; highlight: string | null;
}) {
  const { prep, result } = res;
  const factors = prep.factors.factors;
  const ranked = useMemo(() => rankFactors(result, effect), [result, effect]);
  const ordered = useMemo(() => (worstFirst ? [...ranked].reverse() : ranked), [ranked, worstFirst]);
  // The effect ranked by is its column's order (best or worst first, as picked above).
  type Row = (typeof ranked)[number];
  const sort = useSort<Row>(
    'breakdown.factors',
    [
      { id: 'rank', label: t(`breakdown.e.${effect}`), key: null },
      { id: 'name', label: t('breakdown.factor'), key: (r) => factorLabel(factors[r.index]) },
      { id: 'with', label: t('breakdown.col.with'), key: (r) => result.factors.rows[r.index], kind: 'number' },
      ...FACTOR_EFFECTS.map((k): SortOption<Row> => ({ id: `e:${k}`, label: t(`breakdown.e.${k}`), key: (r) => factorEffect(sumsAt(result.factors, r.index), result.total, k)?.est, kind: 'number' })),
    ],
    'rank',
  );
  const rows = useSorted(ordered, sort, [result, factors]);
  if (factors.length === 0) return <div className="cmp-empty">{t('breakdown.noFactors')}</div>;
  if (ranked.length === 0) return <div className="cmp-empty">{t('breakdown.empty')}</div>;
  const T = result.total;
  const kinds = FACTOR_EFFECTS.filter((k) => ranked.length === 0 || result.factors.rows.some((_, i) => factorEffect(sumsAt(result.factors, i), T, k)));
  const best = ranked.filter((r) => r.effect.shrunk > 0).slice(0, 5);
  const worst = ranked.filter((r) => r.effect.shrunk < 0).slice(-5).reverse();
  const click = (i: number) => toggleHighlight(`f:${i}`, factorFilter(ds, factors[i]));
  const short = (e: Effect) => (e.log ? `×${fmt(Math.exp(e.shrunk))}` : effect === 'win' ? `${e.shrunk >= 0 ? '+' : ''}${num(e.shrunk * 100, 0)}` : fmt(e.shrunk));
  return (
    <>
      <p className="cmp-hint">{t('breakdown.factorHint')}</p>
      <div className="brk-lists">
        <List title={t('breakdown.helps')} items={best.map((r) => ({ key: r.index, name: factorLabel(factors[r.index]), value: short(r.effect) }))} onPick={click} />
        <List title={t('breakdown.hurts')} items={worst.map((r) => ({ key: r.index, name: factorLabel(factors[r.index]), value: short(r.effect) }))} onPick={click} />
      </div>
      <table className="cmp-table brk-table">
        <thead>
          <tr>
            <SortTh sort={sort} id="name">{t('breakdown.factor')}</SortTh>
            <SortTh sort={sort} id="with">{t('breakdown.col.with')}</SortTh>
            {kinds.map((k) => (
              <SortTh sort={sort} id={k === effect ? 'rank' : `e:${k}`} key={k} className={k === effect ? 'brk-sorted' : undefined}>{t(`breakdown.e.${k}`)}</SortTh>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, ROW_CAP).map(({ index: i }) => {
            const w = sumsAt(result.factors, i);
            return (
              <tr key={i} className={highlight === `f:${i}` ? 'brk-on' : undefined}>
                <td>
                  <button className="cmp-link" onClick={() => click(i)} title={t('breakdown.filterTitle')}>{factorLabel(factors[i])}</button>
                </td>
                <td>{t('breakdown.withCounts', { rows: fmtInt(w.rows), k: fmtInt(w.kills), d: fmtInt(w.deaths), rounds: fmtInt(w.played) })}</td>
                {kinds.map((k) => (
                  <td key={k}>{fmtEffect(factorEffect(w, T, k), k)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
