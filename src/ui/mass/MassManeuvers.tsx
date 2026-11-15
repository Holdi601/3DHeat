/**
 * Mass analysis, Maneuvers: how often each maneuver of the movement analysis
 * is made per map, mode and side over the matches the filter keeps, and how
 * often it paid off (Wilson ~95% interval). A click loads the matches it was
 * made in. Counts come from each match's summary; summaries written before
 * the movement analysis have none (the hint says how many).
 */

import { useEffect, useState } from 'react';
import { int, num, t, useLang } from '../../i18n';
import { askMass, drillDown, useMass } from '../../mass/client';
import type { MassManeuverRow } from '../../mass/maneuvers';
import { useEngine } from '../EngineContext';
import { maneuverName } from '../insights/Maneuvers';

const pct = (v: number | null) => (v === null || !Number.isFinite(v) ? '—' : `${num(v * 100, 0)}%`);
const MAX_ROWS = 300;

type Data = { rows: MassManeuverRow[]; matches: number; withSection: number };

export function MassManeuvers() {
  useLang();
  const filter = useMass((s) => s.filter);
  const engine = useEngine();
  const [allMaps, setAllMaps] = useState(true);
  const [q, setQ] = useState<{ data: Data | null; ms: number | null; error: string | null }>({ data: null, ms: null, error: null });
  useEffect(() => {
    let live = true;
    const t0 = performance.now();
    askMass<Data>({ type: 'query', filter, q: { kind: 'maneuvers' } }, 'maneuvers').then(
      (data) => live && setQ({ data, ms: Math.round(performance.now() - t0), error: null }),
      (e: Error) => live && setQ({ data: null, ms: null, error: e.message }),
    );
    return () => {
      live = false;
    };
  }, [JSON.stringify(filter)]);
  if (!q.data) return <div className="hint">{q.error ?? t('mass.working')}</div>;
  const d = q.data;
  const rows = d.rows.filter((r) => (allMaps ? r.map === '*' : r.map !== '*'));
  return (
    <div>
      <div className="hint">{t('maneuver.massHint', { with: int(d.withSection), matches: int(d.matches) })}</div>
      <label className="row" style={{ gap: 6 }}>
        <input type="checkbox" checked={!allMaps} onChange={(e) => setAllMaps(!e.target.checked)} />
        {t('maneuver.byMap')}
      </label>
      <table className="cmp-table brk-table">
        <thead>
          <tr>
            <th>{t('maneuver.col.kind')}</th>
            {!allMaps && <th>{t('mass.map')}</th>}
            {!allMaps && <th>{t('mass.mode')}</th>}
            <th>{t('maneuver.col.side')}</th>
            <th>{t('maneuver.col.made')}</th>
            <th>{t('maneuver.col.perMatch')}</th>
            <th>{t('maneuver.col.paid')}</th>
            <th>{t('maneuver.col.kd')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, MAX_ROWS).map((r) => (
            <tr
              key={`${r.kind}|${r.map}|${r.mode}|${r.side}`}
              onClick={() => void drillDown(engine, { drill: { matches: r.matchIds } })}
              title={t('mass.drillTitle')}
            >
              <td>{maneuverName({ kind: r.kind })}</td>
              {!allMaps && <td>{r.map || '—'}</td>}
              {!allMaps && <td>{r.mode || '—'}</td>}
              <td>{r.side}</td>
              <td>{int(r.n)}</td>
              <td>{r.of ? num(r.n / r.of, 2) : '—'}</td>
              <td>
                {pct(r.rate)} {r.rate !== null && <span className="mass-dim">({pct(r.lo)}–{pct(r.hi)}, n={int(r.judged)})</span>}
              </td>
              <td>{r.losses ? num(r.kills / r.losses, 2) : r.kills ? '∞' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {q.ms !== null && <div className="hint mass-took">{t('mass.took', { ms: q.ms })}</div>}
    </div>
  );
}
