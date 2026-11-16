/**
 * Mass analysis, Close quarters: the close-quarters counts of every match's
 * summary (`mass/cqb.ts`) over the matches the filter keeps - opening duels
 * by side and their conversion, trades, peeker against holder, crossfires,
 * flashed entries, aim, plants, man advantage and, per map, the places that
 * kill the players entering them - each a share with its Wilson interval. A
 * click loads the matches it came from.
 */

import { useEffect, useMemo, useState } from 'react';
import { int, num, t, useLang } from '../../i18n';
import { askMass, drillDown, useMass } from '../../mass/client';
import type { MassCqbRow } from '../../mass/cqb';
import { useEngine } from '../EngineContext';
import { SortTh } from '../sort/SortControl';
import { useSort, useSorted } from '../sort/useSort';

const pct = (v: number | null) => (v === null || !Number.isFinite(v) ? '—' : `${num(v * 100, 0)}%`);

type Data = { rows: MassCqbRow[]; matches: number; withCounts: number };

export function MassCqb() {
  useLang();
  const filter = useMass((s) => s.filter);
  const engine = useEngine();
  const [byMap, setByMap] = useState(false);
  const [q, setQ] = useState<{ data: Data | null; ms: number | null; error: string | null }>({ data: null, ms: null, error: null });
  useEffect(() => {
    let live = true;
    const t0 = performance.now();
    askMass<Data>({ type: 'query', filter, q: { kind: 'cqb' } }, 'cqb').then(
      (data) => live && setQ({ data, ms: Math.round(performance.now() - t0), error: null }),
      (e: Error) => live && setQ({ data: null, ms: null, error: e.message }),
    );
    return () => {
      live = false;
    };
  }, [JSON.stringify(filter)]);
  const kept = useMemo(() => (q.data?.rows ?? []).filter((r) => (byMap ? r.map !== '*' : r.map === '*')), [q.data, byMap]);
  // The measure column is the summary's own order (measures grouped as written).
  const sort = useSort<MassCqbRow>(
    'mass.cqb',
    [
      { id: 'order', label: t('mass.cqb.col.measure'), key: null },
      { id: 'map', label: t('ui.sort.map'), key: (r) => r.map },
      { id: 'which', label: t('mass.cqb.col.which'), key: (r) => r.side || r.state },
      { id: 'share', label: t('ui.sort.share'), key: (r) => r.share, kind: 'number' },
      { id: 'count', label: t('ui.sort.count'), key: (r) => r.n, kind: 'number' },
    ],
    'order',
  );
  const rows = useSorted(kept, sort);
  if (!q.data) return <div className="hint">{q.error ?? t('mass.working')}</div>;
  const d = q.data;
  return (
    <div>
      <div className="hint">{t('mass.cqb.hint', { with: int(d.withCounts), matches: int(d.matches) })}</div>
      <label className="row" style={{ gap: 6 }}>
        <input type="checkbox" checked={byMap} onChange={(e) => setByMap(e.target.checked)} />
        {t('mass.cqb.byMap')}
      </label>
      <table className="cmp-table brk-table">
        <thead>
          <tr>
            {byMap && <SortTh sort={sort} id="map">{t('mass.map')}</SortTh>}
            <SortTh sort={sort} id="order">{t('mass.cqb.col.measure')}</SortTh>
            <SortTh sort={sort} id="which">{t('mass.cqb.col.which')}</SortTh>
            <SortTh sort={sort} id="share">{t('mass.cqb.col.share')}</SortTh>
            <SortTh sort={sort} id="count">{t('mass.cqb.col.n')}</SortTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.map}|${r.measure}|${r.side}|${r.state}`} onClick={() => void drillDown(engine, { drill: { matches: r.matchIds } })} title={t('mass.drillTitle')}>
              {byMap && <td>{r.map || '—'}</td>}
              <td>{t(`mass.cqb.m.${r.measure}`)}</td>
              <td>{r.side || r.state || '—'}</td>
              <td>
                {pct(r.share)} <span className="mass-dim">({pct(r.lo)}–{pct(r.hi)})</span>
              </td>
              <td>
                {int(r.k)} / {int(r.n)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {q.ms !== null && <div className="hint mass-took">{t('mass.took', { ms: q.ms })}</div>}
    </div>
  );
}
