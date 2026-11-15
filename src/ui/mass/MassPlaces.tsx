/**
 * The mass analysis's Stage B tabs: Places (regions that stand out in the
 * numbers but not in the heat - outlined in the view, flown to and loaded
 * with their matches on a click) and Niches (groups doing markedly better or
 * worse, with an explorer that refines a group one condition at a time).
 * Both read the shared insights report (`findInsights`); lists render a page
 * at a time so a long report never costs a long frame.
 */

import { useEffect, useMemo, useState } from 'react';
import { num, t, useLang } from '../../i18n';
import { askMass, drillDown, findInsights, placeInsight, showPlaces, useMass } from '../../mass/client';
import { bandName, nicheGroup, nicheSentence, placeSentence, type MassInsight } from '../../mass/detect';
import type { NicheCond, NicheFinding, NicheTarget } from '../../mass/niche';
import type { PlaceFinding, PlaceShape } from '../../mass/scan';
import type { MassDrill, MassFilter } from '../../mass/store';
import { Check, Segmented } from '../controls';
import { useEngine } from '../EngineContext';

const PAGE = 40;
/** The report the view's outlines were drawn from. */
let outlinedFor: unknown = null;
const fmt = (v: number | null | undefined, d = 2) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : num(v, Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : d));
const pct = (v: number) => `${num(v * 100, 0)}%`;
const qText = (q: number) => (q < 0.001 ? '<0.001' : fmt(q, 3));

/** A sentence's values as shown: a class by its name in the language. */
export function sayMass(key: string, params: Record<string, number | string>): string {
  const p = { ...params };
  if (typeof p.cls === 'string') p.cls = t(`heat.filterPanel.vehicleClass.${p.cls}`);
  return t(key, p);
}

/** The run button and the maps it looks at, shared by the tabs that read the report. */
function RunBar({ label, hint }: { label: string; hint: string }) {
  const reporting = useMass((s) => s.reporting);
  const [maps, setMaps] = useState(8);
  return (
    <div className="row brk-controls" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
      <button disabled={reporting} onClick={() => void findInsights(maps)}>
        {reporting ? t('mass.working') : label}
      </button>
      <label className="brk-field">
        {t('mass.insightMaps')}
        <input type="number" min={0} max={40} value={maps} onChange={(e) => setMaps(Math.max(0, Math.min(40, Number(e.target.value) || 0)))} />
      </label>
      <span className="hint">{hint}</span>
    </div>
  );
}

function badge(f: PlaceFinding) {
  const k = f.dir < 0 ? 'quiet' : f.hidden ? 'hidden' : 'plain';
  return <span className={`mass-badge mass-badge-${k}`}>{t(`mass.places.badge.${k}`)}</span>;
}

export function PlacesTab() {
  useLang();
  const engine = useEngine();
  const report = useMass((s) => s.report);
  const error = useMass((s) => s.reportError);
  const [map, setMap] = useState('');
  const [hiddenOnly, setHiddenOnly] = useState(true);
  const [shape, setShape] = useState<'all' | PlaceShape>('all');
  const [dir, setDir] = useState<'all' | 'up' | 'down'>('all');
  const [pick, setPick] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  const all = report?.places?.findings ?? [];
  const maps = useMemo(() => [...new Set(all.map((f) => f.map))], [all]);
  const list = useMemo(
    () => all.filter((f) => (!map || f.map === map) && (!hiddenOnly || f.hidden) && (shape === 'all' || f.shape === shape) && (dir === 'all' || (dir === 'up') === f.dir > 0)),
    [all, map, hiddenOnly, shape, dir],
  );
  useEffect(() => setShown(PAGE), [list]);
  // The outlines stay in the view when the window closes (to look at them); a new report or Clear takes them away.
  useEffect(() => {
    if (report === outlinedFor) return;
    outlinedFor = report;
    setPick(null);
    showPlaces(engine, null);
  }, [report, engine]);
  const picked = all.find((f) => f.id === pick) ?? null;
  const insightOf = (f: PlaceFinding): MassInsight => report?.insights.find((i) => i.id === `mass:place:${f.id}`) ?? placeInsight(f);
  const choose = (f: PlaceFinding) => {
    setPick(f.id);
    showPlaces(engine, f.map, insightOf(f).id);
  };
  const load = async (f: PlaceFinding) => {
    choose(f);
    await drillDown(engine, { insight: insightOf(f) });
    showPlaces(engine, f.map, insightOf(f).id);
  };
  const run = report?.places;
  return (
    <div>
      <RunBar label={t('mass.places.find')} hint={t('mass.places.hint')} />
      {error && (
        <div className="hint" style={{ color: 'var(--warm)' }}>
          {error}
        </div>
      )}
      {run && (
        <>
          <div className="row brk-controls" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
            <label className="brk-field">
              {t('mass.map')}
              <select value={map} onChange={(e) => setMap(e.target.value)}>
                <option value="">{t('mass.all')}</option>
                {maps.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="brk-field">
              {t('mass.places.shape')}
              <select value={shape} onChange={(e) => setShape(e.target.value as 'all' | PlaceShape)}>
                {(['all', 'circle', 'corridor', 'zone', 'band', 'time'] as const).map((v) => (
                  <option key={v} value={v}>
                    {t(`mass.places.shape.${v}`)}
                  </option>
                ))}
              </select>
            </label>
            <Segmented<'all' | 'up' | 'down'>
              value={dir}
              options={(['all', 'up', 'down'] as const).map((v) => ({
                value: v,
                label: t(`mass.places.dir.${v}`),
              }))}
              onChange={setDir}
            />
            <Check label={t('mass.places.hiddenOnly')} checked={hiddenOnly} onChange={setHiddenOnly} />
            {pick && (
              <button
                onClick={() => {
                  setPick(null);
                  showPlaces(engine, null);
                }}
              >
                {t('mass.places.clear')}
              </button>
            )}
          </div>
          <div className="hint">
            {t('mass.places.summary', {
              found: run.findings.length,
              hidden: run.findings.filter((f) => f.hidden).length,
              maps: run.maps.length,
              tests: run.tests,
              fdr: report!.fdr,
              secs: fmt(run.ms / 1000, 1),
            })}
          </div>
          {!list.length ? (
            <div className="hint">{t('mass.places.none')}</div>
          ) : (
            <table className="cmp-table brk-table mass-places">
              <thead>
                <tr>
                  <th />
                  <th>{t('mass.places.col.place')}</th>
                  <th>{t('mass.places.shape')}</th>
                  <th title={t('mass.places.col.ratioTitle')}>{t('mass.places.col.ratio')}</th>
                  <th>{t('mass.places.col.obsExp')}</th>
                  <th title={t('mass.places.col.heldTitle')}>{t('mass.places.col.held')}</th>
                  <th title={t('mass.places.col.foldsTitle')}>{t('mass.places.col.folds')}</th>
                  <th title={t('mass.col.qTitle')}>{t('mass.col.q')}</th>
                  <th title={t('mass.places.col.obvTitle')}>{t('mass.places.col.obv')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.slice(0, shown).map((f) => {
                  const s = placeSentence(f);
                  return (
                    <tr key={f.id} className={f.id === pick ? 'mass-picked' : undefined} onClick={() => choose(f)} title={t('mass.places.show')}>
                      <td>{badge(f)}</td>
                      <td>{sayMass(s.key, s.params)}</td>
                      <td>{t(`mass.places.shape.${f.shape}`)}</td>
                      <td>
                        {fmt(f.shrunk)}{' '}
                        <span className="mass-dim">
                          ({fmt(f.lo)}–{fmt(f.hi)})
                        </span>
                      </td>
                      <td>
                        {fmt(f.observed, 0)} / {fmt(f.expected, 1)}
                      </td>
                      <td>
                        {f.stability.held}/{f.stability.seen}
                      </td>
                      <td>
                        {f.stability.foldsAgree}/{f.stability.folds}
                      </td>
                      <td>{qText(f.q)}</td>
                      <td>{pct(f.obviousness)}</td>
                      <td>
                        <button
                          className="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            void load(f);
                          }}
                          title={t('mass.drillTitle')}
                        >
                          {t('mass.load')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {list.length > shown && <button onClick={() => setShown(shown + PAGE)}>{t('mass.showMore', { n: list.length - shown })}</button>}
          {picked && <PlaceDetail f={picked} />}
        </>
      )}
    </div>
  );
}

function PlaceDetail({ f }: { f: PlaceFinding }) {
  return (
    <div className="hint mass-detail">
      {t('mass.places.detail', {
        z: fmt(f.zScore),
        phi: fmt(f.phi),
        g1: fmt(f.gi[0]),
        g2: fmt(f.gi[1]),
        g4: fmt(f.gi[2]),
        moran: fmt(f.moran),
        peak: pct(f.peakShare),
        cells: f.cells,
        cell: fmt(f.cell, 1),
        exposure: fmt(f.exposure, 0),
      })}
      {f.bandY && (
        <>
          {' '}
          ·{' '}
          {t('mass.places.heights', {
            band: bandName(f),
            lo: fmt(f.bandY[0], 0),
            hi: fmt(f.bandY[1], 0),
          })}
        </>
      )}
      {f.phase && (
        <>
          {' '}
          ·{' '}
          {t('mass.places.phase', {
            from: Math.round(f.phase[0] * 100),
            to: Math.round(f.phase[1] * 100),
          })}
        </>
      )}
      {f.heldOut && <> · {t('mass.places.heldOut')}</>}
    </div>
  );
}

// ---------------------------------------------------------------------------

const TARGETS: NicheTarget[] = ['kd', 'win', 'death', 'kph', 'earn', 'deathRate'];
const TABLES = ['lives', 'places', 'phases'] as const;

/** The drill-down of a niche: its map and mode as the filter, its vehicle, class and side as the drill. */
function nicheDrill(conds: NicheCond[]): {
  drill: MassDrill;
  extra: MassFilter;
} {
  const get = (k: string) => conds.find((c) => c.f === k)?.v;
  const drill: MassDrill = {};
  if (get('vehicle')) drill.vehicle = get('vehicle');
  if (get('class')) drill.cls = get('class');
  if (get('side')) drill.team = get('side');
  const extra: MassFilter = {};
  if (get('map')) extra.maps = [get('map')!];
  if (get('mode')) extra.modes = [get('mode')!];
  return { drill, extra };
}

function Conds({ conds }: { conds: NicheCond[] }) {
  return (
    <>
      {conds.map((c) => (
        <span key={`${c.f}=${c.v}`} className="mass-chip" title={t(`mass.niches.factor.${c.f}`)}>
          <span className="mass-dim">{t(`mass.niches.factor.${c.f}`)}</span> {c.f === 'class' ? t(`heat.filterPanel.vehicleClass.${c.v}`) : c.label || c.v}
        </span>
      ))}
    </>
  );
}

function NicheRows({ rows, onRefine, onLoad }: { rows: NicheFinding[]; onRefine: (f: NicheFinding) => void; onLoad: (f: NicheFinding) => void }) {
  const [shown, setShown] = useState(PAGE);
  useEffect(() => setShown(PAGE), [rows]);
  const val = (f: NicheFinding, v: number) => (f.type === 'share' ? pct(v) : fmt(v));
  return (
    <>
      <table className="cmp-table brk-table">
        <thead>
          <tr>
            <th>{t('mass.niches.col.group')}</th>
            <th>{t('mass.niches.target')}</th>
            <th>{t('mass.niches.col.value')}</th>
            <th>{t('mass.niches.col.base')}</th>
            <th title={t('mass.places.col.ratioTitle')}>{t('mass.places.col.ratio')}</th>
            <th>{t('mass.niches.col.n')}</th>
            <th>{t('mass.col.matches')}</th>
            <th title={t('mass.places.col.foldsTitle')}>{t('mass.places.col.folds')}</th>
            <th title={t('mass.col.qTitle')}>{t('mass.col.q')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, shown).map((f) => (
            <tr key={f.id} className={f.q < 0.05 ? 'mass-sig' : undefined} onClick={() => onRefine(f)} title={sayMass(nicheSentence(f).key, nicheSentence(f).params)}>
              <td>
                <Conds conds={f.conds} />
              </td>
              <td>{t(`mass.niches.target.${f.target}`)}</td>
              <td>{val(f, f.value)}</td>
              <td className="mass-dim">{val(f, f.base)}</td>
              <td>
                {fmt(f.shrunk)}{' '}
                <span className="mass-dim">
                  ({fmt(f.lo)}–{fmt(f.hi)})
                </span>
              </td>
              <td>{fmt(f.n, 0)}</td>
              <td>{f.matches}</td>
              <td>
                {f.foldsAgree}/{f.folds}
              </td>
              <td>{qText(f.q)}</td>
              <td>
                <button
                  className="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoad(f);
                  }}
                  title={t('mass.drillTitle')}
                >
                  {t('mass.load')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > shown && <button onClick={() => setShown(shown + PAGE)}>{t('mass.showMore', { n: rows.length - shown })}</button>}
    </>
  );
}

export function NichesTab() {
  useLang();
  const engine = useEngine();
  const report = useMass((s) => s.report);
  const filter = useMass((s) => s.filter);
  const [table, setTable] = useState<'all' | (typeof TABLES)[number]>('all');
  const [target, setTarget] = useState<'all' | NicheTarget>('all');
  const [path, setPath] = useState<{
    table: string;
    target: NicheTarget;
    base: NicheCond[];
  } | null>(null);
  const [kids, setKids] = useState<{
    base: NicheFinding | null;
    children: NicheFinding[];
  } | null>(null);
  const top = useMemo(
    () => (report?.niches?.findings ?? []).filter((f) => (table === 'all' || f.table === table) && (target === 'all' || f.target === target)),
    [report, table, target],
  );
  useEffect(() => {
    if (!path) return setKids(null);
    let live = true;
    setKids(null);
    askMass<{ base: NicheFinding | null; children: NicheFinding[] }>(
      {
        type: 'niche',
        filter,
        table: path.table,
        target: path.target,
        base: path.base,
      },
      'niche',
    ).then((r) => live && setKids(r));
    return () => {
      live = false;
    };
  }, [path, filter]);
  const load = (f: NicheFinding) => {
    const { drill, extra } = nicheDrill(f.conds);
    void drillDown(engine, { drill, extra });
  };
  const refine = (f: NicheFinding) => setPath({ table: f.table, target: f.target, base: f.conds });
  return (
    <div>
      <RunBar label={t('mass.niches.find')} hint={t('mass.niches.hint')} />
      <div className="row brk-controls" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
        <label className="brk-field">
          {t('mass.niches.table')}
          <select value={table} onChange={(e) => setTable(e.target.value as typeof table)}>
            {(['all', ...TABLES] as const).map((v) => (
              <option key={v} value={v}>
                {t(`mass.niches.table.${v}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="brk-field">
          {t('mass.niches.target')}
          <select value={target} onChange={(e) => setTarget(e.target.value as typeof target)}>
            {(['all', ...TARGETS] as const).map((v) => (
              <option key={v} value={v}>
                {t(`mass.niches.target.${v}`)}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() =>
            setPath({
              table: table === 'all' ? 'lives' : table,
              target: target === 'all' ? 'kd' : target,
              base: [],
            })
          }
        >
          {t('mass.niches.exploreAll')}
        </button>
      </div>
      {path ? (
        <div>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            <button className="small" onClick={() => setPath(null)}>
              {t('mass.niches.back')}
            </button>
            <span className="hint">
              {t('mass.niches.explore', {
                group: path.base.length ? nicheGroup({ conds: path.base }) : t('mass.niches.root'),
                target: t(`mass.niches.target.${path.target}`),
              })}
            </span>
            {path.base.map((_, k) => (
              <button key={k} className="small" onClick={() => setPath({ ...path, base: path.base.slice(0, k) })}>
                {path.base.slice(0, k).length ? nicheGroup({ conds: path.base.slice(0, k) }) : t('mass.niches.root')}
              </button>
            ))}
          </div>
          {!kids ? <div className="hint">{t('mass.working')}</div> : <NicheRows rows={kids.children} onRefine={refine} onLoad={load} />}
        </div>
      ) : !report?.niches ? null : (
        <>
          <div className="hint">
            {t('mass.niches.summary', {
              found: report.niches.findings.length,
              tests: report.niches.tests,
              fdr: report.fdr,
            })}
          </div>
          {top.length ? <NicheRows rows={top} onRefine={refine} onLoad={load} /> : <div className="hint">{t('mass.niches.none')}</div>}
        </>
      )}
    </div>
  );
}
