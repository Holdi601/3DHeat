/**
 * Mass analysis, R6 surfaces: Rainbow Six Siege's marks on the level (bullet
 * holes and the like) per level surface over the matches the filter keeps
 * (`mass/marks.ts`) - how many, per round of the map, in which room, of what
 * kinds, and from which operators and weapon classes where the shooter was
 * worked out - with the heat of the marks on the surface. A surface keeps its
 * id across the matches of one map version. A click opens a row; its button
 * loads the matches it came from.
 */

import { useEffect, useState } from 'react';
import { int, num, t, useLang } from '../../i18n';
import { askMass, drillDown, useMass } from '../../mass/client';
import type { SurfaceRow } from '../../mass/marks';
import { useEngine } from '../EngineContext';

type Data = { rows: SurfaceRow[]; matches: number; withMarks: number; maps: string[] };

const pct = (v: number) => `${num(v * 100, 0)}%`;

export function MassSurfaces() {
  useLang();
  const filter = useMass((s) => s.filter);
  const engine = useEngine();
  const [map, setMap] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState<{ data: Data | null; ms: number | null; error: string | null }>({ data: null, ms: null, error: null });
  useEffect(() => {
    let live = true;
    const t0 = performance.now();
    askMass<Data>({ type: 'query', filter, q: { kind: 'surfaces' } }, 'surfaces').then(
      (data) => live && setQ({ data, ms: Math.round(performance.now() - t0), error: null }),
      (e: Error) => live && setQ({ data: null, ms: null, error: e.message }),
    );
    return () => {
      live = false;
    };
  }, [JSON.stringify(filter)]);
  if (!q.data) return <div className="hint">{q.error ?? t('mass.working')}</div>;
  const d = q.data;
  if (!d.withMarks) return <div className="hint">{t('mass.surfaces.none')}</div>;
  const rows = d.rows.filter((r) => !map || r.map === map);
  return (
    <div>
      <div className="hint">{t('mass.surfaces.hint', { with: int(d.withMarks), matches: int(d.matches) })}</div>
      {d.maps.length > 1 && (
        <label className="brk-field">
          {t('mass.map')}
          <select value={map} onChange={(e) => setMap(e.target.value)}>
            <option value="">{t('mass.all')}</option>
            {d.maps.map((m) => (
              <option key={m} value={m}>
                {m || '-'}
              </option>
            ))}
          </select>
        </label>
      )}
      <table className="cmp-table brk-table">
        <thead>
          <tr>
            {!map && <th>{t('mass.map')}</th>}
            <th>{t('mass.surfaces.col.surface')}</th>
            <th>{t('mass.surfaces.col.room')}</th>
            <th>{t('mass.surfaces.col.marks')}</th>
            <th>{t('mass.surfaces.col.perRound')}</th>
            <th>{t('mass.col.matches')}</th>
            <th title={t('mass.surfaces.col.shotTitle')}>{t('mass.surfaces.col.shot')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const key = `${r.map}|${r.surface}`;
            const isOpen = open === key;
            return [
              <tr key={key} onClick={() => setOpen(isOpen ? null : key)} style={{ cursor: 'pointer' }}>
                {!map && <td>{r.map || '-'}</td>}
                <td>{r.surface}</td>
                <td>{r.room || '-'}</td>
                <td>{int(r.marks)}</td>
                <td>{num(r.perRound, r.perRound >= 10 ? 0 : 2)}</td>
                <td>{int(r.matches)}</td>
                <td>{pct(r.shot)}</td>
              </tr>,
              isOpen ? (
                <tr key={`${key}|open`}>
                  <td colSpan={map ? 6 : 7}>
                    <div className="row" style={{ gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <MarkHeat cells={r.cells} />
                      <Counts title={t('mass.surfaces.kinds')} list={r.kinds} />
                      <Counts title={t('mass.surfaces.byOperator')} list={r.ops} />
                      <Counts title={t('mass.surfaces.byClass')} list={r.cls} />
                    </div>
                    <button onClick={() => void drillDown(engine, { drill: { matches: r.matchIds } })} title={t('mass.drillTitle')}>
                      {t('mass.surfaces.load', { count: r.matchIds.length })}
                    </button>
                  </td>
                </tr>
              ) : null,
            ];
          })}
        </tbody>
      </table>
      {q.ms !== null && <div className="hint mass-took">{t('mass.took', { ms: q.ms })}</div>}
    </div>
  );
}

function Counts({ title, list }: { title: string; list: [string, number][] }) {
  return (
    <div>
      <b>{title}</b>
      {list.length ? (
        <table className="cmp-table">
          <tbody>
            {list.map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td>{int(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="hint">-</div>
      )}
    </div>
  );
}

/**
 * Where on the surface its marks are: the cells seen face on, along the two
 * axes the marks spread most over (a wall's width and height, a floor's
 * length and width), darker where more marks are.
 */
function MarkHeat({ cells }: { cells: [number, number, number, number][] }) {
  if (!cells.length) return null;
  const span = [0, 1, 2].map((a) => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const c of cells) {
      lo = Math.min(lo, c[a]);
      hi = Math.max(hi, c[a]);
    }
    return { a, lo, hi, w: hi - lo };
  });
  const [u, v] = [...span].sort((p, q) => q.w - p.w);
  const W = 180;
  const H = 120;
  const cw = W / (u.w + 1);
  const ch = H / (v.w + 1);
  const s = Math.min(cw, ch);
  const max = Math.max(...cells.map((c) => c[3]));
  return (
    <svg width={W} height={H} style={{ background: 'rgba(12,14,18,0.6)', borderRadius: 3 }} aria-label={t('mass.surfaces.heat')}>
      <title>{t('mass.surfaces.heat')}</title>
      {cells.map((c, i) => (
        <rect
          key={i}
          x={(c[u.a] - u.lo) * s}
          y={H - (c[v.a] - v.lo + 1) * s}
          width={Math.max(1, s)}
          height={Math.max(1, s)}
          fill="rgb(255,140,40)"
          opacity={0.15 + (0.85 * c[3]) / max}
        />
      ))}
    </svg>
  );
}
