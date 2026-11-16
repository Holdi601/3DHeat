import { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { useMatchStore } from '../../state/matchStore';
import type { Dataset, FilterSpec } from '../../state/types';
import { rgbToCss, teamBaseColor } from '../../render/colors';
import { int, num, t, useLang } from '../../i18n';
import { Section } from '../controls';
import { available, flightSeries } from '../../data/flight';
import {
  computeStats,
  download,
  statsCsv,
  telemetryCsv,
  type MatchStats,
  type TeamStats,
  type UnitStats,
} from './stats';
import { SortTh } from '../sort/SortControl';
import { useSort, useSorted } from '../sort/useSort';
import { formatValue } from './fields';
import { personAt, unitsOf } from './units';
import { teamName } from './replayView';
import { selectAndFollow } from './ReplayOverlay';
import { clock } from './hooks';
import { useEngine } from '../EngineContext';
import { unitPrefs, useUnits } from '../../state/unitsStore';

/** Whether the full statistics table is open over the view. */
export const useStatsView = create<{ open: boolean; setOpen: (v: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

/** The rows a matches filter allows (null: all), as the event list reads it. */
function matchRows(d: Dataset, filters: FilterSpec[]): ((row: number) => boolean) | undefined {
  const f = filters.find(
    (x) => x.kind === 'categories' && /^(match(_?id)?|source file)$/i.test(x.column.trim()),
  );
  if (!f || f.kind !== 'categories') return undefined;
  const col = d.attrs.find((a) => a.name === f.column);
  if (!col) return undefined;
  const allowed = new Set(f.allowed);
  const data = col.data as Uint32Array;
  return (row) => allowed.has(data[row]);
}

const cache = new WeakMap<Dataset, Map<string, MatchStats>>();

/** The statistics of what is being played, worked out once per recording, session and matches filter. */
function useStats(on: boolean): MatchStats | null {
  const dataset = useStore((s) => s.dataset);
  const session = useStore((s) => s.team.session);
  const filters = useStore((s) => s.filters);
  const games = useMatchStore((s) => s.games);
  const [stats, setStats] = useState<MatchStats | null>(null);
  useEffect(() => {
    if (!on || !dataset) return;
    const rowOk = matchRows(dataset, filters);
    const key = `${session}|${JSON.stringify(filters.find((x) => x.kind === 'categories') ?? null)}`;
    let m = cache.get(dataset);
    if (!m) cache.set(dataset, (m = new Map()));
    const hit = m.get(key);
    if (hit) {
      setStats(hit);
      return;
    }
    setStats(null);
    // After the panel has drawn: a big recording takes a moment.
    const id = setTimeout(() => {
      const known = new Map<number, string>();
      for (const g of games) for (const [k, v] of g.unitNames) known.set(k, v);
      const s = computeStats(dataset, session, rowOk, known);
      m!.set(key, s);
      setStats(s);
    }, 30);
    return () => clearTimeout(id);
  }, [on, dataset, session, filters, games]);
  return stats;
}

const fileName = (d: Dataset, what: string) =>
  `${d.name.replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '_')}.${what}.csv`;

/**
 * Statistics and the flight log, as Tacview's debrief: the match by team,
 * the best of it, the full table over the view, and CSV exports of the table
 * and of the followed unit's telemetry.
 */
export function StatsPanel() {
  return (
    <Section title={t('replay.stats.title')}>
      <StatsBody />
    </Section>
  );
}

function StatsBody() {
  const dataset = useStore((s) => s.dataset);
  const session = useStore((s) => s.team.session);
  const follow = useReplayStore((s) => s.follow);
  const selected = useReplayStore((s) => s.selected);
  const [hz, setHz] = useState(4);
  const stats = useStats(true);
  const teamSort = useSort<TeamStats>(
    'replay.stats.teams',
    [
      { id: 'team', label: t('ui.sort.team'), key: (tm) => (dataset && tm.team >= 0 ? teamName(dataset, tm.team) : null) },
      { id: 'count', label: t('ui.sort.count'), key: (tm) => tm.units, kind: 'number' },
      { id: 'kills', label: t('ui.sort.kills'), key: (tm) => tm.kills, kind: 'number' },
      { id: 'deaths', label: t('ui.sort.deaths'), key: (tm) => tm.deaths, kind: 'number' },
      { id: 'shots', label: t('replay.stats.shotsShort'), key: (tm) => tm.shots, kind: 'number' },
      { id: 'hits', label: t('replay.stats.hitsShort'), key: (tm) => tm.hits, kind: 'number' },
      { id: 'order', label: t('ui.sort.order'), key: null },
    ],
    'kills',
  );
  const teams = useSorted(stats?.teams ?? NO_TEAMS, teamSort, [dataset]);
  if (!dataset) return null;
  if (!stats) return <div className="hint">{t('replay.stats.working')}</div>;
  const team = (i: number) => (i >= 0 ? teamName(dataset, i) || '—' : '—');
  const top = stats.units
    .filter((u) => u.kind !== 'weapon' && u.kills > 0)
    .sort((a, b) => b.kills - a.kills || a.deaths - b.deaths)
    .slice(0, 5);
  const index = unitsOf(dataset);
  const telemetryUnit =
    index.byKey.get(selected ?? '') ??
    (follow !== null ? index.units[index.personUnit[follow]] : undefined);
  return (
    <>
      <div className="hint">
        {t('replay.stats.summary', {
          duration: clock(stats.duration),
          kills: stats.kills,
          deaths: stats.deaths,
          shots: stats.shots,
          hits: stats.hits,
        })}
      </div>
      <table className="stats-mini">
        <thead>
          <tr>
            <SortTh sort={teamSort} id="team">{t('replay.stats.team')}</SortTh>
            <SortTh sort={teamSort} id="count" title={t('replay.stats.unitsTitle')}>#</SortTh>
            <SortTh sort={teamSort} id="kills" title={t('replay.stats.killsTitle')}>K</SortTh>
            <SortTh sort={teamSort} id="deaths" title={t('replay.stats.deathsTitle')}>D</SortTh>
            <SortTh sort={teamSort} id="shots" title={t('replay.stats.shotsTitle')}>{t('replay.stats.shotsShort')}</SortTh>
            <SortTh sort={teamSort} id="hits" title={t('replay.stats.hitsTitle')}>{t('replay.stats.hitsShort')}</SortTh>
          </tr>
        </thead>
        <tbody>
          {teams.map((tm) => (
            <tr key={tm.team}>
              <td>
                <span
                  className="swatch"
                  style={{
                    background: tm.team >= 0 ? rgbToCss(teamBaseColor(tm.team)) : '#9aa3ad',
                  }}
                />{' '}
                {team(tm.team)}
              </td>
              <td>{int(tm.units)}</td>
              <td>{int(tm.kills)}</td>
              <td>{int(tm.deaths)}</td>
              <td>{int(tm.shots)}</td>
              <td>{int(tm.hits)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {top.length > 0 && (
        <div className="hint">
          {t('replay.stats.top')}{' '}
          {top.map((u, i) => (
            <span key={u.key}>
              {i ? ' · ' : ''}
              {u.name} {int(u.kills)}/{int(u.deaths)}
            </span>
          ))}
        </div>
      )}
      <div className="row-buttons">
        <button onClick={() => useStatsView.getState().setOpen(true)}>
          {t('replay.stats.table')}
        </button>
        <button
          className="small"
          onClick={() => download(fileName(dataset, 'stats'), statsCsv(stats, team, unitPrefs()))}
        >
          {t('replay.stats.csv')}
        </button>
      </div>
      <div className="field">
        <div className="label">
          <span>{t('replay.stats.telemetry')}</span>
        </div>
        <div className="row-buttons">
          <select
            value={hz}
            onChange={(e) => setHz(Number(e.target.value))}
            title={t('replay.stats.hzTitle')}
          >
            {[1, 2, 4, 10, 20].map((h) => (
              <option key={h} value={h}>
                {t('replay.stats.hz', { hz: h })}
              </option>
            ))}
          </select>
          <button
            className="small"
            disabled={!telemetryUnit}
            title={
              telemetryUnit
                ? t('replay.stats.telemetryTitle', { name: telemetryUnit.name })
                : t('replay.stats.telemetryNone')
            }
            onClick={() => {
              if (!telemetryUnit) return;
              const series = telemetryUnit.persons
                .map((p) => ({ name: telemetryUnit.name, s: flightSeries(dataset, p, session) }))
                .filter((x) => x.s) as {
                name: string;
                s: NonNullable<ReturnType<typeof flightSeries>>;
              }[];
              const params = [...new Set(series.flatMap((x) => available(x.s)))];
              download(
                fileName(dataset, `${telemetryUnit.name.replace(/[^\w.-]+/g, '_')}.telemetry`),
                telemetryCsv(series, params, hz, unitPrefs()),
              );
            }}
          >
            {t('replay.stats.telemetryCsv')}
          </button>
        </div>
      </div>
      <div className="hint">{t('replay.stats.how')}</div>
    </>
  );
}

const NO_TEAMS: TeamStats[] = [];

/** The numeric columns of the full table. */
type NumberKey = keyof Pick<
  UnitStats,
  | 'kills'
  | 'deaths'
  | 'shots'
  | 'hits'
  | 'hitRatio'
  | 'takeoffs'
  | 'landings'
  | 'airborne'
  | 'maxG'
  | 'maxSpeed'
  | 'maxAlt'
  | 'maxMach'
  | 'distance'
  | 'lives'
>;

/** The full statistics table over the view: every unit, sortable, a click follows it. */
export function StatsTable() {
  const engine = useEngine();
  const open = useStatsView((s) => s.open);
  const dataset = useStore((s) => s.dataset);
  const units = useUnits();
  const [ai, setAi] = useState(true);
  useLang();
  const stats = useStats(open);
  const listed = useMemo(
    () => (stats ? stats.units.filter((u) => u.kind !== 'weapon' && (ai || u.kind === 'player')) : []),
    [stats, ai],
  );
  const col = (key: NumberKey, label: string) => ({ id: key, label, key: (s: UnitStats) => s[key], kind: 'number' as const });
  const sort = useSort<UnitStats>(
    'replay.stats.table',
    [
      { id: 'name', label: t('replay.stats.col.unit'), key: (s) => s.name },
      { id: 'team', label: t('replay.stats.team'), key: (s) => (dataset && s.team >= 0 ? teamName(dataset, s.team) : null) },
      col('lives', t('replay.stats.col.lives')),
      col('kills', t('ui.sort.kills')),
      col('deaths', t('ui.sort.deaths')),
      col('shots', t('replay.stats.shotsShort')),
      col('hits', t('replay.stats.hitsShort')),
      col('hitRatio', t('replay.stats.col.ratio')),
      col('takeoffs', t('replay.stats.col.takeoffs')),
      col('landings', t('replay.stats.col.landings')),
      col('airborne', t('replay.stats.col.airborne')),
      col('maxG', t('replay.stats.col.maxG')),
      col('maxSpeed', t('replay.stats.col.maxSpeed')),
      col('maxAlt', t('replay.stats.col.maxAlt')),
      col('maxMach', t('replay.stats.col.maxMach')),
      col('distance', t('replay.stats.col.distance')),
    ],
    'kills',
  );
  const rows = useSorted(listed, sort, [dataset]);
  if (!open || !dataset) return null;
  const close = () => useStatsView.getState().setOpen(false);
  const index = unitsOf(dataset);
  const head = (key: string, label: string, title?: string) => (
    <SortTh sort={sort} id={key} title={title}>
      {label}
    </SortTh>
  );
  const v = (x: number, kind: Parameters<typeof formatValue>[0]) =>
    Number.isFinite(x) ? formatValue(kind, x, units) : '';
  const team = (i: number) => (i >= 0 ? teamName(dataset, i) : '—');
  return (
    <div
      className="stats-modal"
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="sm-head">
        <b>{t('replay.stats.tableTitle')}</b>
        {stats && (
          <span className="dim">
            {' '}
            {t('replay.stats.summary', {
              duration: clock(stats.duration),
              kills: stats.kills,
              deaths: stats.deaths,
              shots: stats.shots,
              hits: stats.hits,
            })}
          </span>
        )}
        <span className="spacer" />
        <label className="check">
          <input type="checkbox" checked={ai} onChange={(e) => setAi(e.target.checked)} />
          {t('replay.stats.withAi')}
        </label>
        {stats && (
          <button
            className="small"
            onClick={() => download(fileName(dataset, 'stats'), statsCsv(stats, team, unitPrefs()))}
          >
            {t('replay.stats.csv')}
          </button>
        )}
        <button className="small" onClick={close} title={t('replay.chart.close')}>
          ×
        </button>
      </div>
      {!stats ? (
        <div className="hint">{t('replay.stats.working')}</div>
      ) : (
        <div className="sm-scroll">
          <table className="stats-table">
            <thead>
              <tr>
                {head('name', t('replay.stats.col.unit'))}
                {head('team', t('replay.stats.team'))}
                {head('lives', t('replay.stats.col.lives'))}
                {head('kills', 'K', t('replay.stats.killsTitle'))}
                {head('deaths', 'D', t('replay.stats.deathsTitle'))}
                {head('shots', t('replay.stats.shotsShort'), t('replay.stats.shotsTitle'))}
                {head('hits', t('replay.stats.hitsShort'), t('replay.stats.hitsTitle'))}
                {head('hitRatio', t('replay.stats.col.ratio'), t('replay.stats.ratioTitle'))}
                {head('takeoffs', t('replay.stats.col.takeoffs'))}
                {head('landings', t('replay.stats.col.landings'))}
                {head('airborne', t('replay.stats.col.airborne'))}
                {head('maxG', t('replay.stats.col.maxG'))}
                {head('maxSpeed', t('replay.stats.col.maxSpeed'))}
                {head('maxAlt', t('replay.stats.col.maxAlt'))}
                {head('maxMach', t('replay.stats.col.maxMach'))}
                {head('distance', t('replay.stats.col.distance'))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const u = index.byKey.get(s.key);
                return (
                  <tr
                    key={s.key}
                    className={s.kind === 'ai' ? 'ai' : ''}
                    onClick={() => {
                      if (!u) return;
                      const now = engine?.live.playhead ?? 0;
                      const live = u.spans.some(([a, b]) => a <= now && now <= b);
                      if (!live) useStore.getState().seek(u.spans[0][0] + 0.05);
                      selectAndFollow(u, personAt(u, live ? now : u.spans[0][0] + 0.05));
                    }}
                  >
                    <td>
                      <span
                        className="swatch"
                        style={{
                          background: s.team >= 0 ? rgbToCss(teamBaseColor(s.team)) : '#9aa3ad',
                        }}
                      />{' '}
                      {s.name}
                      {s.vehicle && !s.name.startsWith(s.vehicle) ? (
                        <span className="dim"> · {s.vehicle}</span>
                      ) : null}
                    </td>
                    <td>{team(s.team)}</td>
                    <td>{int(s.lives)}</td>
                    <td>{int(s.kills)}</td>
                    <td>{int(s.deaths)}</td>
                    <td>{int(s.shots)}</td>
                    <td>{int(s.hits)}</td>
                    <td>{Number.isFinite(s.hitRatio) ? `${num(s.hitRatio * 100, 0)} %` : ''}</td>
                    <td>
                      {s.category === 'air'
                        ? `${s.groundFrom === 'estimate' ? '~' : ''}${int(s.takeoffs)}`
                        : ''}
                    </td>
                    <td>
                      {s.category === 'air'
                        ? `${s.groundFrom === 'estimate' ? '~' : ''}${int(s.landings)}`
                        : ''}
                    </td>
                    <td>{Number.isFinite(s.airborne) ? clock(s.airborne) : ''}</td>
                    <td>{Number.isFinite(s.maxG) ? num(s.maxG, 1) : ''}</td>
                    <td>{v(s.maxSpeed, 'speed')}</td>
                    <td>{s.category === 'air' ? v(s.maxAlt, 'altitude') : ''}</td>
                    <td>{Number.isFinite(s.maxMach) ? num(s.maxMach, 2) : ''}</td>
                    <td>{v(s.distance, 'distance')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="hint">{t('replay.stats.how')}</div>
        </div>
      )}
    </div>
  );
}
