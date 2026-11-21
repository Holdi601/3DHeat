import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { num, t, useLang } from '../../i18n';
import { askMass, drillDown, findInsights, openMass, useMass, type MassTab } from '../../mass/client';
import { massReportForModel, type MassInsight, type MassReport } from '../../mass/detect';
import type { Channel } from '../../mass/grids';
import { MATCH_HIST, type BalanceBy, type BalanceRow, type BalanceSplit, type Bucket, type Overview, type Populations, type SideRow, type Trends, type TrendSeries } from '../../mass/store';
import { GRID_KINDS } from '../../mass/types';
import { Check, Section, Segmented } from '../controls';
import { useEngine } from '../EngineContext';
import { NichesTab, PlacesTab, sayMass } from './MassPlaces';
import { MassManeuvers } from './MassManeuvers';
import { MassCqb } from './MassCqb';
import { MassSurfaces } from './MassSurfaces';
import { MassOutcome } from './MassOutcome';
import { SortControl, SortTh } from '../sort/SortControl';
import { useSort, useSorted, type SortOption } from '../sort/useSort';
import '../compare/compare.css';
import '../breakdown/breakdown.css';
import './mass.css';

const fmt = (v: number | null | undefined, d = 2) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : num(v, Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : d));
const pct = (v: number | null | undefined) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : `${num(v * 100, 0)}%`);
const big = (v: number) => (v >= 1e9 ? `${num(v / 1e9, 1)} G` : v >= 1e6 ? `${num(v / 1e6, 1)} M` : v >= 1e4 ? `${num(v / 1e3, 0)} k` : num(v, 0));
const day = (sec: number | null) => (sec === null ? '—' : new Date(sec * 1000).toISOString().slice(0, 10));
const MAX_ROWS = 300;
const NONE: never[] = [];

/** The sidebar's part: pick the matches, see what was found, open the window. */
export function MassPanel() {
  useLang();
  const st = useMass();
  const folder = useRef<HTMLInputElement>(null);
  const filesIn = useRef<HTMLInputElement>(null);
  const adding = useRef(false);
  const pick = async (list: FileList | null) => {
    const add = adding.current;
    adding.current = false;
    const files = Array.from(list ?? []).map((file) => ({ file, path: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name }));
    if (!files.length) return;
    const ok = await openMass(files, add);
    if (ok) useMass.getState().set({ open: true });
  };
  const s = st.stats;
  return (
    <Section title={t('mass.title')}>
      <div className="hint">{t('mass.hint')}</div>
      <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        <button onClick={() => folder.current?.click()}>{t('mass.folder')}</button>
        <button onClick={() => filesIn.current?.click()}>{t('mass.files')}</button>
        {st.facets && (
          <button
            onClick={() => {
              adding.current = true;
              folder.current?.click();
            }}
          >
            {t('mass.addFolder')}
          </button>
        )}
        {st.facets && <button onClick={() => st.set({ open: !st.open })}>{st.open ? t('mass.close') : t('mass.openWindow')}</button>}
      </div>
      <input ref={folder} type="file" hidden {...({ webkitdirectory: '' } as object)} onChange={(e) => void pick(e.target.files).finally(() => (e.target.value = ''))} />
      <input ref={filesIn} type="file" hidden multiple accept=".3dheat,.parquet,.gz,.json,.jsonl" onChange={(e) => void pick(e.target.files).finally(() => (e.target.value = ''))} />
      {st.progress && (
        <div className="hint" style={{ marginTop: 6 }}>
          {t(`mass.phase.${st.progress.phase}`, { done: st.progress.done, total: st.progress.total })}
        </div>
      )}
      {st.error && <div className="hint" style={{ color: 'var(--warm)' }}>{st.error}</div>}
      {s && st.facets && (
        <div className="hint" style={{ marginTop: 6 }}>
          {t('mass.loaded', { matches: st.facets.matches, index: s.fromIndex, cache: s.fromCache, member: s.fromMember, computed: s.computed, failed: s.failed, secs: fmt(s.ms / 1000, 1), mb: fmt(s.storeBytes / 1e6, 1) })}
        </div>
      )}
    </Section>
  );
}

/** The window over the view (as the breakdown's), while open. */
export function MassWindow() {
  const open = useMass((s) => s.open && !!s.facets);
  const [stage, setStage] = useState<Element | null>(null);
  useEffect(() => setStage(document.querySelector('.stage')), [open]);
  if (!open || !stage) return null;
  return createPortal(<MassBody />, stage);
}

function MassBody() {
  useLang();
  const st = useMass();
  const f = st.facets!;
  const filter = st.filter;
  const setFilter = (p: Partial<typeof filter>) => st.set({ filter: { ...filter, ...p } });
  const one = (l?: string[]) => l?.[0] ?? '';
  const maps = f.maps.filter((m) => !filter.games?.length || filter.games.includes(m.game));
  const tabs: MassTab[] = ['overview', 'balance', 'trends', 'players', 'sides', 'maneuvers', 'cqb', 'surfaces', 'map', 'insights', 'places', 'niches', 'outcome'];
  // The window's frame first, its date fields and tab a frame later: one frame for all of it ran long.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const dateValue = (sec: number | null | undefined) => (sec ? new Date(sec).toISOString().slice(0, 10) : '');
  return (
    <div className="cmp-window brk-window mass-window" role="dialog" aria-label={t('mass.title')}>
      <div className="cmp-head">
        <b>{t('mass.title')}</b>
        <label className="brk-field">
          {t('mass.game')}
          <select value={one(filter.games)} onChange={(e) => setFilter({ games: e.target.value ? [e.target.value] : [], maps: [] })}>
            <option value="">{t('mass.all')}</option>
            {f.games.map((g) => (
              <option key={g} value={g}>{g || '—'}</option>
            ))}
          </select>
        </label>
        <label className="brk-field">
          {t('mass.map')}
          <select value={one(filter.maps)} onChange={(e) => setFilter({ maps: e.target.value ? [e.target.value] : [] })}>
            <option value="">{t('mass.all')}</option>
            {maps.map((m) => (
              <option key={m.map} value={m.map}>{`${m.map || '—'} (${m.matches})`}</option>
            ))}
          </select>
        </label>
        {f.modes.length > 0 && (
          <label className="brk-field">
            {t('mass.mode')}
            <select value={one(filter.modes)} onChange={(e) => setFilter({ modes: e.target.value ? [e.target.value] : [] })}>
              <option value="">{t('mass.all')}</option>
              {f.modes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        )}
        {ready && (
          <>
            <label className="brk-field">
              {t('mass.from')}
              <input type="date" value={dateValue(filter.from)} onChange={(e) => setFilter({ from: e.target.value ? Date.parse(e.target.value) : null })} />
            </label>
            <label className="brk-field">
              {t('mass.to')}
              <input type="date" value={dateValue(filter.to)} onChange={(e) => setFilter({ to: e.target.value ? Date.parse(e.target.value) + 86_399_999 : null })} />
            </label>
          </>
        )}
        <Segmented<MassTab> value={st.tab} options={tabs.map((v) => ({ value: v, label: v === 'maneuvers' ? t('maneuver.tab') : v === 'outcome' ? t('outcome.tab') : t(`mass.tab.${v}`) }))} onChange={(tab) => st.set({ tab })} />
        <span className="cmp-status">
          {st.drilling ? t('mass.drilling') : st.progress ? t(`mass.phase.${st.progress.phase}`, { done: st.progress.done, total: st.progress.total }) : ''}
        </span>
        <button className="cmp-close" title={t('mass.close')} onClick={() => st.set({ open: false })}>
          ×
        </button>
      </div>
      <div className="cmp-body">
        <div className="cmp-scroll">
          {ready && st.tab === 'overview' && <OverviewTab />}
          {st.tab === 'balance' && <BalanceTab />}
          {st.tab === 'trends' && <TrendsTab />}
          {st.tab === 'players' && <PlayersTab />}
          {st.tab === 'sides' && <SidesTab />}
          {st.tab === 'maneuvers' && <MassManeuvers />}
          {st.tab === 'cqb' && <MassCqb />}
          {st.tab === 'surfaces' && <MassSurfaces />}
          {st.tab === 'map' && <MapTab />}
          {st.tab === 'insights' && <InsightsTab />}
          {st.tab === 'places' && <PlacesTab />}
          {st.tab === 'niches' && <NichesTab />}
          {st.tab === 'outcome' && <MassOutcome />}
        </div>
      </div>
    </div>
  );
}

/** A query to the worker, asked again when the filter or the arguments change. */
function useQuery<T>(make: () => Parameters<typeof askMass>[0], kind: string, deps: unknown[]): { data: T | null; ms: number | null; error: string | null } {
  const filter = useMass((s) => s.filter);
  const [state, setState] = useState<{ data: T | null; ms: number | null; error: string | null }>({ data: null, ms: null, error: null });
  useEffect(() => {
    let live = true;
    const t0 = performance.now();
    askMass<T>(make(), kind).then(
      (data) => live && setState({ data, ms: Math.round(performance.now() - t0), error: null }),
      (e: Error) => live && setState({ data: null, ms: null, error: e.message }),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter), ...deps]);
  return state;
}

function Took({ ms }: { ms: number | null }) {
  return ms === null ? null : <div className="hint mass-took">{t('mass.took', { ms })}</div>;
}

function OverviewTab() {
  const filter = useMass((s) => s.filter);
  const q = useQuery<Overview>(() => ({ type: 'query', filter, q: { kind: 'overview' } }), 'overview', []);
  const ph = useQuery<Record<string, number[]>>(() => ({ type: 'query', filter, q: { kind: 'phases' } }), 'phases', []);
  const o = q.data;
  if (!o) return <div className="hint">{q.error ?? t('mass.working')}</div>;
  const maxDay = Math.max(1, ...o.byDay.map((d) => d.matches));
  return (
    <div>
      <div className="mass-stats">
        {[
          ['mass.stat.matches', big(o.matches)],
          ['mass.stat.hours', fmt(o.hours, 1)],
          ['mass.stat.players', big(o.players)],
          ['mass.stat.units', big(o.units)],
          ['mass.stat.ai', big(o.ai)],
          ['mass.stat.rows', big(o.rows)],
          ['mass.stat.span', `${day(o.first)} – ${day(o.last)}`],
        ].map(([k, v]) => (
          <div key={k}>
            <span>{t(k)}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>
      {o.byDay.length > 1 && (
        <div className="mass-days" title={t('mass.perDay')}>
          {o.byDay.map((d) => (
            <i key={d.day} style={{ height: `${(100 * d.matches) / maxDay}%` }} title={`${d.day}: ${d.matches}`} />
          ))}
        </div>
      )}
      <div className="brk-lists">
        <CountList id="mass.games" title={t('mass.byGame')} rows={o.byGame} />
        <CountList id="mass.maps" title={t('mass.byMap')} rows={o.byMap} onPick={(k) => useMass.getState().set({ filter: { ...filter, maps: [k] } })} />
        {o.byMode.some((m) => m.key) && <CountList id="mass.modes" title={t('mass.byMode')} rows={o.byMode} />}
        <EventList events={o.events} />
        {o.economy.length > 0 && <EconomyList economy={o.economy} />}
      </div>
      {ph.data && <PhaseBars data={ph.data} />}
      <Took ms={q.ms} />
    </div>
  );
}

type CountRow = { key: string; matches: number; hours: number };

function CountList({ id, title, rows, onPick }: { id: string; title: string; rows: CountRow[]; onPick?: (k: string) => void }) {
  const sort = useSort<CountRow>(
    id,
    [
      { id: 'name', label: t('ui.sort.name'), key: (r) => r.key },
      { id: 'matches', label: t('ui.sort.matches'), key: (r) => r.matches, kind: 'number' },
      { id: 'duration', label: t('ui.sort.duration'), key: (r) => r.hours, kind: 'number' },
    ],
    'matches',
  );
  const sorted = useSorted(rows, sort);
  return (
    <div className="brk-list">
      <div className="brk-list-title">{title}</div>
      {rows.length > 1 && <SortControl sort={sort} />}
      <ol>
        {sorted.slice(0, 25).map((r) => (
          <li key={r.key} className={onPick ? 'mass-pick' : undefined} onClick={onPick ? () => onPick(r.key) : undefined}>
            {r.key || '—'}
            <span>{t('mass.countLine', { matches: r.matches, hours: fmt(r.hours, 1) })}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function EventList({ events }: { events: Record<string, number> }) {
  const rows = useMemo(() => Object.entries(events), [events]);
  const sort = useSort<[string, number]>(
    'mass.events',
    [
      { id: 'name', label: t('ui.sort.name'), key: (e) => e[0] },
      { id: 'count', label: t('ui.sort.count'), key: (e) => e[1], kind: 'number' },
    ],
    'count',
  );
  const sorted = useSorted(rows, sort);
  return (
    <div className="brk-list">
      <div className="brk-list-title">{t('mass.events')}</div>
      {rows.length > 1 && <SortControl sort={sort} />}
      <ol>
        {sorted.map(([k, v]) => (
          <li key={k}>
            {k}
            <span>{big(v)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function EconomyList({ economy }: { economy: Overview['economy'] }) {
  const sort = useSort<Overview['economy'][number]>(
    'mass.economy',
    [
      { id: 'name', label: t('ui.sort.name'), key: (e) => e.currency },
      { id: 'value', label: t('ui.sort.value'), key: (e) => e.earned, kind: 'number' },
      { id: 'matches', label: t('ui.sort.matches'), key: (e) => e.matches, kind: 'number' },
    ],
    'name',
  );
  const sorted = useSorted(economy, sort);
  return (
    <div className="brk-list">
      <div className="brk-list-title">{t('mass.economy')}</div>
      {economy.length > 1 && <SortControl sort={sort} />}
      <ol>
        {sorted.map((e) => (
          <li key={e.currency}>
            {t('mass.econLine', { currency: e.currency.toUpperCase(), earned: big(e.earned), spent: big(e.spent), matches: e.matches })}
          </li>
        ))}
      </ol>
    </div>
  );
}

function PhaseBars({ data }: { data: Record<string, number[]> }) {
  const all = useMemo(() => Object.entries(data).filter(([, v]) => v.some((x) => x > 0)), [data]);
  const sort = useSort<[string, number[]]>(
    'mass.phases',
    [
      { id: 'name', label: t('ui.sort.name'), key: (e) => e[0] },
      { id: 'count', label: t('ui.sort.count'), key: (e) => e[1].reduce((s, x) => s + x, 0), kind: 'number' },
      { id: 'order', label: t('ui.sort.order'), key: null },
    ],
    'name',
  );
  const kinds = useSorted(all, sort);
  if (!kinds.length) return null;
  return (
    <div className="mass-phases">
      <div className="brk-list-title">{t('mass.phases')}</div>
      {kinds.length > 1 && <SortControl sort={sort} />}
      {kinds.map(([k, v]) => {
        const max = Math.max(1, ...v);
        return (
          <div key={k} className="mass-phase-row">
            <span>{k}</span>
            <div className="mass-days">
              {v.map((x, i) => (
                <i key={i} style={{ height: `${(100 * x) / max}%` }} title={t('mass.phaseBin', { from: i * 5, to: i * 5 + 5, n: x })} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BalanceTab() {
  const filter = useMass((s) => s.filter);
  const engine = useEngine();
  const [by, setBy] = useState<BalanceBy>('vehicle');
  const [split, setSplit] = useState<BalanceSplit>('none');
  const [minUnits, setMin] = useState(10);
  const [players, setPlayers] = useState(true);
  const q = useQuery<BalanceRow[]>(() => ({ type: 'query', filter, q: { kind: 'balance', by, split, minUnits, players } }), 'balance', [by, split, minUnits, players]);
  const weapon = by === 'weapon';
  const col = (id: string, label: string, key: (r: BalanceRow) => number | string | null): SortOption<BalanceRow> => ({ id, label, key, kind: id === 'name' || id === 'split' ? 'text' : 'number' });
  const sort = useSort<BalanceRow>(
    'mass.balance',
    [
      col('name', t('mass.col.name'), (r) => r.label || r.key),
      col('split', split !== 'none' ? t(`mass.split.${split}`) : t('mass.split'), (r) => r.split),
      col('matches', t('mass.col.matches'), (r) => r.matches),
      col('units', weapon ? t('mass.col.shots') : t('mass.col.lives'), (r) => r.units),
      col('hours', t('mass.col.hours'), (r) => r.hours),
      col('kd', weapon ? t('mass.col.killsPerMiss') : t('mass.col.kd'), (r) => r.kd),
      col('win', t('mass.col.win'), (r) => r.win),
      col('survival', t('mass.col.survival'), (r) => r.survival),
      col('kills', t('mass.col.kills'), (r) => r.kills),
      col('killsPerMin', t('mass.col.kpm'), (r) => r.killsPerMin),
      col('hits', t('mass.col.hits'), (r) => r.hits),
      col('earnPerMin', t('mass.col.earnPerMin'), (r) => r.earnPerMin),
      col('q', t('mass.col.q'), (r) => r.q),
    ],
    'hours',
  );
  const rows = useSorted(q.data ?? NONE, sort);
  const th = (id: string, label: string, title?: string) => (
    <SortTh sort={sort} id={id} title={title}>
      {label}
    </SortTh>
  );
  const drill = (r: BalanceRow) => {
    const drillReq = by === 'vehicle' ? { vehicle: r.key } : by === 'class' ? { cls: r.key } : by === 'weapon' ? { weapon: r.key } : { team: r.key };
    const extra = split === 'map' && r.split ? { maps: [r.split] } : split === 'mode' && r.split ? { modes: [r.split] } : {};
    void drillDown(engine, { drill: drillReq, extra });
  };
  return (
    <div>
      <div className="row brk-controls" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
        <Segmented<BalanceBy> value={by} options={(['vehicle', 'class', 'weapon', 'team'] as const).map((v) => ({ value: v, label: t(`mass.by.${v}`) }))} onChange={setBy} />
        <label className="brk-field">
          {t('mass.split')}
          <select value={split} onChange={(e) => setSplit(e.target.value as BalanceSplit)}>
            {(['none', 'map', 'mode', 'tier', 'game'] as const).map((v) => (
              <option key={v} value={v}>{t(`mass.split.${v}`)}</option>
            ))}
          </select>
        </label>
        <label className="brk-field">
          {t('mass.minLives')}
          <input type="number" min={1} value={minUnits} onChange={(e) => setMin(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        {by !== 'weapon' && <Check label={t('mass.playersOnly')} checked={players} onChange={setPlayers} />}
        <span className="hint">{t('mass.balanceHint')}</span>
      </div>
      {!q.data ? (
        <div className="hint">{q.error ?? t('mass.working')}</div>
      ) : (
        <table className="cmp-table brk-table">
          <thead>
            <tr>
              {th('name', t('mass.col.name'))}
              {split !== 'none' && th('split', t(`mass.split.${split}`))}
              {th('matches', t('mass.col.matches'))}
              {th('units', by === 'weapon' ? t('mass.col.shots') : t('mass.col.lives'))}
              {th('hours', t('mass.col.hours'))}
              {th('kd', by === 'weapon' ? t('mass.col.killsPerMiss') : t('mass.col.kd'), t('mass.col.kdTitle'))}
              {by !== 'weapon' && th('win', t('mass.col.win'), t('mass.col.winTitle'))}
              {by !== 'weapon' && th('survival', t('mass.col.survival'))}
              {th('kills', t('mass.col.kills'))}
              {by !== 'weapon' && th('killsPerMin', t('mass.col.kpm'))}
              {th('hits', t('mass.col.hits'))}
              {by !== 'weapon' && th('earnPerMin', t('mass.col.earnPerMin'))}
              {th('q', t('mass.col.q'), t('mass.col.qTitle'))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, MAX_ROWS).map((r) => (
              <tr key={`${r.key}|${r.split}`} className={r.q < 0.05 ? 'mass-sig' : undefined} onClick={() => drill(r)} title={t('mass.drillTitle')}>
                <td>
                  {r.label || r.key || '—'}
                  {r.cls && by === 'vehicle' ? <span className="mass-dim"> {r.cls}</span> : null}
                </td>
                {split !== 'none' && <td>{r.split || '—'}</td>}
                <td>{num(r.matches, 0)}</td>
                <td>{num(r.units, 0)}</td>
                <td>{fmt(r.hours, 1)}</td>
                <td>
                  {fmt(r.kd)} <span className="mass-dim">({fmt(r.kdLo)}–{fmt(r.kdHi)})</span>
                </td>
                {by !== 'weapon' && (
                  <td>
                    {pct(r.win)} {r.win !== null && <span className="mass-dim">({pct(r.winLo)}–{pct(r.winHi)})</span>}
                  </td>
                )}
                {by !== 'weapon' && <td>{pct(r.survival)}</td>}
                <td>{num(r.kills, 0)}</td>
                {by !== 'weapon' && <td>{fmt(r.killsPerMin, 3)}</td>}
                <td>{num(r.hits, 0)}</td>
                {by !== 'weapon' && <td>{fmt(r.earnPerMin, 1)}</td>}
                <td>{r.q < 0.001 ? '<0.001' : fmt(r.q, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {rows.length > MAX_ROWS && <div className="hint">{t('mass.more', { n: rows.length - MAX_ROWS })}</div>}
      <Took ms={q.ms} />
    </div>
  );
}

function TrendsTab() {
  const filter = useMass((s) => s.filter);
  const engine = useEngine();
  const [by, setBy] = useState<'vehicle' | 'class'>('vehicle');
  const [bucket, setBucket] = useState<Bucket>('day');
  const [metric, setMetric] = useState<'usage' | 'kd' | 'win'>('usage');
  const q = useQuery<Trends>(() => ({ type: 'query', filter, q: { kind: 'trends', by, bucket } }), 'trends', [by, bucket]);
  const d = q.data;
  const valsOf = (s: TrendSeries) => (metric === 'usage' ? s.usage : metric === 'kd' ? s.kd : s.win.map((v) => v ?? NaN));
  // Rows by name, by their value in one bucket (its column), or as ranked (most used overall first).
  const sort = useSort<TrendSeries>(
    'mass.trends',
    [
      { id: 'name', label: t('mass.col.name'), key: (s) => s.label || s.key },
      { id: 'order', label: t('ui.sort.order'), key: null },
      ...(d?.buckets ?? []).map((b, i): SortOption<TrendSeries> => ({ id: `b:${b}`, label: b, key: (s) => valsOf(s)[i], kind: 'number' })),
    ],
    'order',
  );
  const series = useSorted(d?.series ?? NONE, sort, [metric, d?.buckets]);
  return (
    <div>
      <div className="row brk-controls" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
        <Segmented<'vehicle' | 'class'> value={by} options={(['vehicle', 'class'] as const).map((v) => ({ value: v, label: t(`mass.by.${v}`) }))} onChange={setBy} />
        <Segmented<Bucket> value={bucket} options={(['day', 'week', 'month'] as const).map((v) => ({ value: v, label: t(`mass.bucket.${v}`) }))} onChange={setBucket} />
        <Segmented<'usage' | 'kd' | 'win'> value={metric} options={(['usage', 'kd', 'win'] as const).map((v) => ({ value: v, label: t(`mass.metric.${v}`) }))} onChange={setMetric} />
      </div>
      {!d ? (
        <div className="hint">{q.error ?? t('mass.working')}</div>
      ) : !d.buckets.length ? (
        <div className="hint">{t('mass.noDates')}</div>
      ) : (
        <>
        {d.series.length > 1 && <SortControl sort={sort} />}
        <table className="cmp-table brk-table">
          <thead>
            <tr>
              <SortTh sort={sort} id="name">{t('mass.col.name')}</SortTh>
              {d.buckets.map((b, i) => (
                <SortTh sort={sort} id={`b:${b}`} key={b} title={t('mass.bucketMatches', { n: d.matches[i] })}>{b}</SortTh>
              ))}
            </tr>
          </thead>
          <tbody>
            {series.map((s) => {
              const vals = valsOf(s);
              const max = Math.max(1e-9, ...vals.filter(Number.isFinite));
              return (
                <tr key={s.key} onClick={() => void drillDown(engine, { drill: by === 'vehicle' ? { vehicle: s.key } : { cls: s.key } })} title={t('mass.drillTitle')}>
                  <td>{s.label || s.key}</td>
                  {vals.map((v, i) => (
                    <td key={i} style={{ background: Number.isFinite(v) ? `rgba(57,135,229,${(0.45 * v) / max})` : undefined }}>
                      {metric === 'kd' ? fmt(v) : pct(v)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        </>
      )}
      <Took ms={q.ms} />
    </div>
  );
}

type TopPlayer = Populations['top'][number];

function PlayersTab() {
  const filter = useMass((s) => s.filter);
  const engine = useEngine();
  const q = useQuery<Populations>(() => ({ type: 'query', filter, q: { kind: 'populations' } }), 'populations', []);
  const p = q.data;
  const sort = useSort<TopPlayer>(
    'mass.players',
    [
      { id: 'player', label: t('ui.sort.player'), key: (r) => r.name || r.id },
      { id: 'matches', label: t('ui.sort.matches'), key: (r) => r.matches, kind: 'number' },
      { id: 'duration', label: t('mass.col.hours'), key: (r) => r.hours, kind: 'number' },
      { id: 'kills', label: t('ui.sort.kills'), key: (r) => r.kills, kind: 'number' },
      { id: 'deaths', label: t('ui.sort.deaths'), key: (r) => r.deaths, kind: 'number' },
      { id: 'win', label: t('mass.col.win'), key: (r) => r.win, kind: 'number' },
      { id: 'vehicle', label: t('ui.sort.vehicle'), key: (r) => r.vehicle },
    ],
    'matches',
  );
  const top = useSorted(p?.top ?? NONE, sort);
  if (!p) return <div className="hint">{q.error ?? t('mass.working')}</div>;
  const max = Math.max(1, ...p.matchesHist);
  return (
    <div>
      <div className="mass-stats">
        <div>
          <span>{t('mass.stat.players')}</span>
          <b>{big(p.players)}</b>
        </div>
        <div>
          <span>{t('mass.perMatch')}</span>
          <b>{t('mass.quartiles', { q1: p.perMatch[0], med: p.perMatch[1], q3: p.perMatch[2] })}</b>
        </div>
      </div>
      <div className="brk-list-title">{t('mass.matchesPerPlayer')}</div>
      <div className="mass-hist">
        {p.matchesHist.map((n, i) => (
          <div key={i}>
            <i style={{ width: `${(100 * n) / max}%` }} />
            <span>{t('mass.histBin', { from: MATCH_HIST[i], to: i + 1 < MATCH_HIST.length ? MATCH_HIST[i + 1] - 1 : '∞', n })}</span>
          </div>
        ))}
      </div>
      <table className="cmp-table brk-table">
        <thead>
          <tr>
            <SortTh sort={sort} id="player">{t('mass.col.player')}</SortTh>
            <SortTh sort={sort} id="matches">{t('mass.col.matches')}</SortTh>
            <SortTh sort={sort} id="duration">{t('mass.col.hours')}</SortTh>
            <SortTh sort={sort} id="kills">{t('mass.col.kills')}</SortTh>
            <SortTh sort={sort} id="deaths">{t('mass.col.deaths')}</SortTh>
            <SortTh sort={sort} id="win">{t('mass.col.win')}</SortTh>
            <SortTh sort={sort} id="vehicle">{t('mass.col.vehicle')}</SortTh>
          </tr>
        </thead>
        <tbody>
          {top.map((r) => (
            <tr key={r.id} onClick={() => void drillDown(engine, { drill: { player: r.id } })} title={t('mass.drillTitle')}>
              <td>{r.name || r.id}</td>
              <td>{r.matches}</td>
              <td>{fmt(r.hours, 1)}</td>
              <td>{num(r.kills, 0)}</td>
              <td>{num(r.deaths, 0)}</td>
              <td>{pct(r.win)}</td>
              <td>{r.vehicle || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Took ms={q.ms} />
    </div>
  );
}

function SidesTab() {
  const filter = useMass((s) => s.filter);
  const engine = useEngine();
  const q = useQuery<SideRow[]>(() => ({ type: 'query', filter, q: { kind: 'sides' } }), 'sides', []);
  const sort = useSort<SideRow>(
    'mass.sides',
    [
      { id: 'map', label: t('ui.sort.map'), key: (r) => r.map },
      { id: 'team', label: t('ui.sort.team'), key: (r) => r.team },
      { id: 'matches', label: t('ui.sort.matches'), key: (r) => r.matches, kind: 'number' },
      { id: 'win', label: t('mass.col.win'), key: (r) => r.win, kind: 'number' },
      { id: 'kills', label: t('ui.sort.kills'), key: (r) => r.kills, kind: 'number' },
      { id: 'deaths', label: t('ui.sort.deaths'), key: (r) => r.deaths, kind: 'number' },
      { id: 'q', label: t('mass.col.q'), key: (r) => r.q, kind: 'number', dir: 'asc' },
    ],
    'map',
  );
  const rows = useSorted(q.data ?? NONE, sort);
  if (!q.data) return <div className="hint">{q.error ?? t('mass.working')}</div>;
  return (
    <div>
      <div className="hint">{t('mass.sidesHint')}</div>
      <table className="cmp-table brk-table">
        <thead>
          <tr>
            <SortTh sort={sort} id="map">{t('mass.map')}</SortTh>
            <SortTh sort={sort} id="team">{t('mass.col.team')}</SortTh>
            <SortTh sort={sort} id="matches">{t('mass.col.matches')}</SortTh>
            <SortTh sort={sort} id="win">{t('mass.col.win')}</SortTh>
            <SortTh sort={sort} id="kills">{t('mass.col.kills')}</SortTh>
            <SortTh sort={sort} id="deaths">{t('mass.col.deaths')}</SortTh>
            <SortTh sort={sort} id="q">{t('mass.col.q')}</SortTh>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, MAX_ROWS).map((r) => (
            <tr key={`${r.map}|${r.team}`} className={r.q < 0.05 ? 'mass-sig' : undefined} onClick={() => void drillDown(engine, { drill: { team: r.team }, extra: { maps: [r.map] } })} title={t('mass.drillTitle')}>
              <td>{r.map || '—'}</td>
              <td>{r.team}</td>
              <td>{r.matches}</td>
              <td>
                {pct(r.win)} {r.win !== null && <span className="mass-dim">({pct(r.winLo)}–{pct(r.winHi)})</span>}
              </td>
              <td>{num(r.kills, 0)}</td>
              <td>{num(r.deaths, 0)}</td>
              <td>{r.q < 0.001 ? '<0.001' : fmt(r.q, 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Took ms={q.ms} />
    </div>
  );
}

interface RasterData {
  x0: number;
  z0: number;
  cell: number;
  nx: number;
  nz: number;
  v: Float32Array;
  d?: Float32Array;
  max: number;
  matches: number;
  cells: number;
  bytes: number;
  teams: string[];
}

const CHANNELS: Channel[] = ['presence', 'kills', 'deaths', 'kd', 'stability', 'flow', 'events', ...GRID_KINDS.filter((k) => !['kill', 'death'].includes(k))];

/** Heat colour of 0..1: dark blue to red to yellow to white. */
function heat(f: number): [number, number, number] {
  const stops: [number, number, number][] = [[20, 24, 60], [120, 30, 140], [230, 60, 40], [250, 200, 40], [255, 255, 230]];
  const x = Math.max(0, Math.min(1, f)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  const u = x - i;
  return [0, 1, 2].map((c) => stops[i][c] + (stops[i + 1][c] - stops[i][c]) * u) as [number, number, number];
}

function MapTab() {
  const filter = useMass((s) => s.filter);
  const facets = useMass((s) => s.facets)!;
  const engine = useEngine();
  const maps = facets.maps.filter((m) => m.map && (!filter.games?.length || filter.games.includes(m.game)));
  const [map, setMap] = useState<string>(filter.maps?.[0] ?? maps[0]?.map ?? '');
  const [channel, setChannel] = useState<Channel>('presence');
  const [level, setLevel] = useState(1);
  const [team, setTeam] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (filter.maps?.[0]) setMap(filter.maps[0]);
  }, [filter.maps]);
  const q = useQuery<RasterData>(() => ({ type: 'grid', filter, map, channel, level, team }), 'grid', [map, channel, level, team]);
  const r = q.data;
  const places = useMass((s) => s.report?.places?.findings);
  useEffect(() => {
    const c = canvas.current;
    if (!c || !r || !r.nx) return;
    c.width = r.nx;
    c.height = r.nz;
    const g = c.getContext('2d')!;
    const img = g.createImageData(r.nx, r.nz);
    const ratio = channel === 'kd';
    const lmax = Math.log1p(r.max);
    for (let z = 0; z < r.nz; z++)
      for (let x = 0; x < r.nx; x++) {
        const v = r.v[z * r.nx + x];
        const o = ((r.nz - 1 - z) * r.nx + x) * 4;
        if (!Number.isFinite(v) || v <= 0) continue;
        const f = ratio ? 0.5 + Math.log(v) / 4 : channel === 'stability' ? v : lmax > 0 ? Math.log1p(v) / lmax : 0;
        const [cr, cg, cb] = heat(f);
        img.data[o] = cr;
        img.data[o + 1] = cg;
        img.data[o + 2] = cb;
        img.data[o + 3] = 255;
      }
    g.putImageData(img, 0, 0);
    if (r.d) {
      // Flow: a short line a cell where enough went by, along the summed direction.
      g.strokeStyle = 'rgba(255,255,255,0.8)';
      g.lineWidth = Math.max(0.15, r.nx / 600);
      const step = Math.max(1, Math.floor(r.nx / 48));
      for (let z = 0; z < r.nz; z += step)
        for (let x = 0; x < r.nx; x += step) {
          const i = z * r.nx + x;
          const dx = r.d[i * 2], dz = r.d[i * 2 + 1];
          const m = Math.hypot(dx, dz);
          if (m < r.v[i] * 0.2 || m === 0) continue;
          const len = step * 0.45;
          const cx = x + 0.5, cy = r.nz - 1 - z + 0.5;
          g.beginPath();
          g.moveTo(cx - (dx / m) * len, cy + (dz / m) * len);
          g.lineTo(cx + (dx / m) * len, cy - (dz / m) * len);
          g.stroke();
        }
    }
    // The places found on this map, outlined: magenta hidden, amber plain, cyan quiet.
    const mine = (places ?? []).filter((f) => f.map === map && f.shape !== 'band');
    if (mine.length) {
      g.lineWidth = Math.max(0.6, r.nx / 300);
      for (const f of mine) {
        g.strokeStyle = f.dir < 0 ? 'rgba(90,215,255,0.9)' : f.hidden ? 'rgba(255,90,220,0.95)' : 'rgba(255,180,60,0.9)';
        g.beginPath();
        for (let k = 0; k + 3 < f.segs.length; k += 4) {
          g.moveTo((f.segs[k] - r.x0) / r.cell, r.nz - (f.segs[k + 1] - r.z0) / r.cell);
          g.lineTo((f.segs[k + 2] - r.x0) / r.cell, r.nz - (f.segs[k + 3] - r.z0) / r.cell);
        }
        g.stroke();
      }
    }
  }, [r, channel, places, map]);
  const click = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!r || !r.nx) return;
    const b = e.currentTarget.getBoundingClientRect();
    const cx = Math.floor(((e.clientX - b.left) / b.width) * r.nx);
    const cz = r.nz - 1 - Math.floor(((e.clientY - b.top) / b.height) * r.nz);
    const x = r.x0 + (cx + 0.5) * r.cell;
    const z = r.z0 + (cz + 0.5) * r.cell;
    void drillDown(engine, { extra: { maps: [map] }, ...(team ? { drill: { team } } : {}), place: { x, y: 0, z, radius: r.cell * 2, grid: 'fine', cell: r.cell } });
  };
  return (
    <div>
      <div className="row brk-controls" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
        <label className="brk-field">
          {t('mass.map')}
          <select value={map} onChange={(e) => setMap(e.target.value)}>
            {maps.map((m) => (
              <option key={m.map} value={m.map}>{`${m.map} (${m.matches})`}</option>
            ))}
          </select>
        </label>
        <label className="brk-field">
          {t('mass.channel')}
          <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>{t(`mass.ch.${c}`)}</option>
            ))}
          </select>
        </label>
        <Segmented<string> value={String(level)} options={['1', '2', '4', '8'].map((v) => ({ value: v, label: `×${v}` }))} onChange={(v) => setLevel(Number(v))} />
        <label className="brk-field">
          {t('mass.col.team')}
          <select value={team ?? ''} onChange={(e) => setTeam(e.target.value || null)}>
            <option value="">{t('mass.all')}</option>
            {(r?.teams ?? []).map((tm) => (
              <option key={tm} value={tm}>{tm}</option>
            ))}
          </select>
        </label>
        {r && <span className="hint">{t('mass.gridInfo', { matches: r.matches, cell: fmt(r.cell, 1), cells: r.cells, mb: fmt(r.bytes / 1e6, 1) })}</span>}
      </div>
      {!r ? (
        <div className="hint">{q.error ?? t('mass.working')}</div>
      ) : (
        <div className="mass-map">
          <canvas ref={canvas} onClick={click} title={t('mass.mapClick')} />
          <div className="hint">{t(`mass.chHint.${channel === 'kd' || channel === 'stability' || channel === 'flow' ? channel : 'count'}`, { max: fmt(r.max) })}</div>
        </div>
      )}
      <Took ms={q.ms} />
    </div>
  );
}

function InsightsTab() {
  const engine = useEngine();
  const [maps, setMaps] = useState(8);
  // The report is shared with the Places and Niches tabs (one run of every detector).
  const report = useMass((s) => s.report);
  const busy = useMass((s) => s.reporting);
  const err = useMass((s) => s.reportError);
  const ms = useMass((s) => (s.report ? s.timings.insights ?? null : null));
  const run = () => findInsights(maps);
  const say = sayMass;
  const copy = () => {
    if (report) void navigator.clipboard?.writeText(JSON.stringify(massReportForModel(report, say), null, 1));
  };
  const text = (i: MassInsight) => (i.sentence.key.startsWith('mass.') ? sayMass(i.sentence.key, i.sentence.params) : `${i.evidence.map ?? ''}: ${t(i.sentence.key, i.sentence.params)}`);
  const sort = useSort<MassInsight>(
    'mass.insights',
    [
      { id: 'importance', label: t('ui.sort.importance'), key: (i) => i.strength, kind: 'number' },
      { id: 'kind', label: t('ui.sort.kind'), key: (i) => i.kind },
      { id: 'map', label: t('ui.sort.map'), key: (i) => i.drill.map ?? (i.evidence.map === undefined ? null : String(i.evidence.map)) },
    ],
    'importance',
  );
  const insights = useSorted(report?.insights ?? NONE, sort);
  return (
    <div>
      <div className="row brk-controls" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
        <button disabled={busy} onClick={() => void run()}>
          {busy ? t('mass.working') : t('mass.findInsights')}
        </button>
        <label className="brk-field">
          {t('mass.insightMaps')}
          <input type="number" min={0} max={40} value={maps} onChange={(e) => setMaps(Math.max(0, Math.min(40, Number(e.target.value) || 0)))} />
        </label>
        {report && <button onClick={copy}>{t('mass.copyReport')}</button>}
        <span className="hint">{t('mass.insightsHint')}</span>
      </div>
      {err && <div className="hint" style={{ color: 'var(--warm)' }}>{err}</div>}
      {report && (
        <>
          <div className="hint">
            {t('mass.reportLine', { n: report.insights.length, matches: report.dataset.matches, tests: report.detectors.reduce((s, d) => s + d.tests, 0), fdr: report.fdr })}
          </div>
          {insights.length > 1 && <SortControl sort={sort} />}
          <ol className="mass-insights">
            {insights.map((i) => (
              <li key={i.id}>
                <span className={`mass-conf mass-conf-${i.confidence.level}`}>{t(`mass.conf.${i.confidence.level}`)}</span>
                {i.region?.hidden && <span className="mass-badge mass-badge-hidden">{t('mass.places.badge.hidden')}</span>} {text(i)}
                <span className="mass-dim"> q={i.confidence.q < 0.001 ? '<0.001' : fmt(i.confidence.q, 3)}</span>
                <button className="small" onClick={() => void drillDown(engine, { insight: i })}>
                  {t('mass.load')}
                </button>
              </li>
            ))}
          </ol>
          <div className="hint">
            {[...report.detectors
              .filter((d) => d.id !== 'grid.all')
              .reduce((m, d) => {
                // The map detectors ran once a map: one line each, summed.
                const o = m.get(d.id);
                m.set(d.id, o ? { ...o, ran: o.ran || d.ran, tests: o.tests + d.tests, found: o.found + d.found } : d);
                return m;
              }, new Map<string, MassReport['detectors'][number]>())
              .values()]
              .map((d) => `${d.id}: ${d.ran ? t('mass.detRan', { tests: d.tests, found: d.found }) : t(d.skipped && d.skipped.startsWith('mass.') ? d.skipped : 'mass.skip.other')}`)
              .join(' · ')}
          </div>
        </>
      )}
      <Took ms={ms} />
    </div>
  );
}
