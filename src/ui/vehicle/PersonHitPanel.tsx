/**
 * The person-hit analysis's sidebar (docs/person-hits.md): load a folder of
 * matches of any game with hits on people, pick what the body is coloured
 * by, filter the hits, read the charts, the top lists and where each value
 * came from. The body itself is drawn over the view (`PersonBodyView.tsx`).
 */

import { memo, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, Section, Segmented, Select } from '../controls';
import { TaskGroup } from '../shell/Shell';
import { ChartView } from '../../charts/ChartView';
import { localizeChart } from '../../charts/format';
import type { ChartData } from '../../charts/types';
import { int, num, t } from '../../i18n';
import { formatBytes } from '../../data/memory';
import { cancelPersonHits, loadPersonHits, patchPerson, patchPersonFilter, usePersonHits, type PersonHitsState } from '../../person/client';
import { REGION_METRICS, type Facets, type PersonFilter, type Range, type RegionMetric, type TopField, type TopRow } from '../../person/analyze';
import type { PersonView } from '../../person/worker';
import { PERSON_FILES } from '../../person/scan';
import { REGIONS, SOURCE_FIELDS, SOURCES, ZONES } from '../../person/types';
import { installPersonDashboards } from '../../person/dashSource';

installPersonDashboards();

const pct = (v: number) => (Number.isFinite(v) ? `${num(v * 100, 0)} %` : '-');
const dec = (v: number, d = 0) => (Number.isFinite(v) ? num(v, d) : '-');

function RangeField({ label, value, onChange, step = 1 }: { label: string; value: Range | null | undefined; onChange: (r: Range | null) => void; step?: number }) {
  const [a, b] = value ?? [null, null];
  const parse = (s: string) => (s.trim() === '' ? null : Number(s));
  const set = (lo: number | null, hi: number | null) => onChange(lo === null && hi === null ? null : [lo ?? -Infinity, hi ?? Infinity]);
  const shown = (v: number | null) => (v === null || !Number.isFinite(v) ? '' : v);
  return (
    <div className="vhits-range">
      <span className="vhits-range-label">{label}</span>
      <input type="number" step={step} value={shown(a)} placeholder={t('vhits.range.from')} onChange={(e) => set(parse(e.target.value), b)} />
      <span>-</span>
      <input type="number" step={step} value={shown(b)} placeholder={t('vhits.range.to')} onChange={(e) => set(a, parse(e.target.value))} />
    </div>
  );
}

function Chips({ label, items, picked, onChange }: { label: string; items: [string, number][] | undefined; picked: string[] | null | undefined; onChange: (v: string[] | null) => void }) {
  if (!items?.length) return null;
  const on = new Set(picked ?? []);
  return (
    <div className="vhits-chips-row">
      <div className="vhits-chips-head">
        <span>{label}</span>
        {on.size > 0 && (
          <button className="link" onClick={() => onChange(null)}>
            {t('vhits.filter.any')}
          </button>
        )}
      </div>
      <div className="vehicle-chips">
        {items.slice(0, 24).map(([k, n]) => (
          <button
            key={k}
            className={on.has(k) ? 'on' : ''}
            onClick={() => {
              const next = new Set(on);
              if (next.has(k)) next.delete(k);
              else next.add(k);
              onChange(next.size ? [...next] : null);
            }}
          >
            {k} {n > 0 && <span className="vehicle-filter-n">{int(n)}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Pick({ label, items, value, onChange }: { label: string; items: [string, number][] | undefined; value: string[] | null | undefined; onChange: (v: string[] | null) => void }) {
  const options = useMemo(() => (items ?? []).slice(0, 200).map(([k, n]) => ({ value: k, label: `${k} (${int(n)})` })), [items]);
  if (!options.length) return null;
  return <Select label={label} value={value?.[0] ?? null} allowEmpty options={options} onChange={(v) => onChange(v ? [v] : null)} />;
}

function Tri({ label, value, options, onChange }: { label: string; value: string | null | undefined; options: [string, string][]; onChange: (v: string | null) => void }) {
  return (
    <div className="vhits-chips-row">
      <div className="vhits-chips-head">
        <span>{label}</span>
      </div>
      <Segmented value={(value ?? 'any') as string} options={[{ value: 'any', label: t('vhits.filter.any') }, ...options.map(([v, l]) => ({ value: v, label: l }))]} onChange={(v) => onChange(v === 'any' ? null : v)} />
    </div>
  );
}

function ChartBox({ data, title }: { data: ChartData; title: string }) {
  const shown = useMemo(() => localizeChart(structuredClone(data)), [data]);
  const mem = useRef(new Map<string, number>()).current;
  return (
    <div className="vhits-chart">
      <div className="vhits-chips-head">{title}</div>
      {data.empty ? <div className="hint">{t(data.empty.slice(1))}</div> : <ChartView data={shown} width={300} height={170} colorMemory={mem} />}
    </div>
  );
}

function TopTable({ by, rows, onPick }: { by: TopField; rows: TopRow[]; onPick: (k: string) => void }) {
  if (!rows.length) return null;
  return (
    <div className="vhits-top">
      <div className="vhits-chips-head">{t(`phits.top.${by}`)}</div>
      <table className="vhits-table">
        <thead>
          <tr>
            <th />
            <th>{t('phits.col.hits')}</th>
            <th>{t('phits.col.damage')}</th>
            <th>{t('phits.col.head')}</th>
            <th>{t('phits.col.kill')}</th>
            <th>{t('phits.col.distance')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} onClick={() => onPick(r.key)} title={t('phits.top.pick')}>
              <td className="vhits-top-name">{r.key}</td>
              <td>{int(r.hits)}</td>
              <td>{dec(r.damage)}</td>
              <td>{pct(r.headShare)}</td>
              <td>{pct(r.killRate)}</td>
              <td>{dec(r.distance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Its children from the `frames`-th frame on: a large panel mounts over several frames, never in one long one. */
function Later({ frames, children }: { frames: number; children: ReactNode }) {
  const [ready, setReady] = useState(frames <= 0);
  useEffect(() => {
    if (ready) return;
    let n = frames, id = 0;
    const tick = () => {
      if (--n <= 0) setReady(true);
      else id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [ready, frames]);
  return ready ? <>{children}</> : null;
}

const TOP_FILTER: Record<TopField, keyof PersonFilter> = { weapon: 'weapons', shooter: 'shooters', victim: 'victims', armor: 'armors', victimRole: 'roles', ammo: 'ammos' };

export function PersonHitPanel() {
  const s = usePersonHits();
  const filePick = useRef<HTMLInputElement>(null);
  const folderPick = useRef<HTMLInputElement>(null);
  const st = s.stats;
  // The heavy parts render from deferred values, in the background: a progress message or a view arriving never
  // holds a frame (the sections are memoised, so the urgent render with the old values skips them).
  const f = useDeferredValue(s.facets);
  const r = useDeferredValue(s.result);

  const pick = async (list: FileList | null, add = false) => {
    if (!list || !list.length) return;
    // Sidecars of a table (events, props, strings, packets, entities) are not matches.
    const files = [...list].filter((x) => PERSON_FILES.test(x.name) && !/\.(events|props|strings|packets|entities|grids|flight|messages|effects)\.parquet$/i.test(x.name) && !/\.(match|summary|snapshot|layouts)\.json$/i.test(x.name));
    // Containers are opened in the readers (their manifest names the game and map), not here on the page.
    loadPersonHits(files, add);
  };

  const loadSection = (
    <>
      <input ref={filePick} type="file" multiple accept=".3dheat,.parquet,.json,.gz" style={{ display: 'none' }} onChange={(e) => void pick(e.target.files, !!st?.hits)} data-phits="files" />
      <input ref={folderPick} type="file" multiple style={{ display: 'none' }} {...({ webkitdirectory: '' } as object)} onChange={(e) => void pick(e.target.files)} data-phits="folder" />
      <Section title={t('phits.load.title')} defaultOpen={!st || st.running}>
        <div className="hint">{t('phits.load.hint')}</div>
        <div className="row wrap">
          <button onClick={() => filePick.current?.click()}>{t('vhits.load.files')}</button>
          <button onClick={() => folderPick.current?.click()}>{t('vhits.load.folder')}</button>
          {st?.running && <button onClick={cancelPersonHits}>{t('vhits.load.cancel')}</button>}
        </div>
        {st && (
          <div className="vehicle-counts" data-phits="stats">
            {t('vhits.load.stats', { done: st.done, files: st.files, matches: st.matches, hits: st.hits, bytes: formatBytes(st.bytes), seconds: num(st.ms / 1000, 1) })}
            <div className="hint">{t('vhits.load.read', { rows: st.kept, total: st.rows, cached: st.cached, native: 0, empty: st.empty, failed: st.failed })}</div>
            {st.stopped > 0 && <div className="hint vehicle-warn">{t('vhits.load.stopped', { n: st.stopped })}</div>}
            {st.lastError && <div className="hint vehicle-warn">{st.lastError}</div>}
          </div>
        )}
        {s.error && <div className="hint vehicle-warn">{s.error}</div>}
        <button className="link" onClick={() => s.set({ active: false })}>
          {t('vhits.load.back')}
        </button>
      </Section>
    </>
  );

  if (!st?.hits || !f) {
    return (
      <TaskGroup task="explore" className="vehicle-panel">
        {loadSection}
      </TaskGroup>
    );
  }
  return (
    <>
      <TaskGroup task="explore" className="vehicle-panel">
        {loadSection}
        <BodySection r={r} metric={s.metric} mode={s.mode} region={s.region} figure={s.figure} />
        <Later frames={2}>
          <FilterSection f={f} flt={s.filter} />
        </Later>
      </TaskGroup>
      {r && (
        <Later frames={3}>
          <AnalysisGroup r={r} />
        </Later>
      )}
    </>
  );
}

const FIGURES = [
  { value: 'generic', key: 'phits.figure.generic' },
  { value: 'cs2:ctm_fbi', key: 'phits.figure.cs2ct' },
  { value: 'cs2:tm_phoenix', key: 'phits.figure.cs2t' },
];

const BodySection = memo(function BodySection({ r, metric, mode, region, figure }: { r: PersonView | null; metric: RegionMetric; mode: PersonHitsState['mode']; region: number; figure: string }) {
  const s = { metric, mode, region, figure, set: usePersonHits.getState().set };
  const list = r ? (r.mode === 'fine' ? r.regions : r.zones) : [];
  const names: readonly string[] = r?.mode === 'coarse' ? ZONES : REGIONS;
  const regionPicked = s.region >= 0 ? list[s.region] : null;
  const figureOptions = FIGURES.map((x) => ({ value: x.value, label: t(x.key) }));
  return (
    <Section title={t('phits.view.title')} defaultOpen>
      <Select label={t('phits.view.figure')} value={s.figure} options={figureOptions} onChange={(v) => v && s.set({ figure: v })} />
      <Select<RegionMetric> label={t('phits.view.metric')} value={s.metric} options={REGION_METRICS.map((m) => ({ value: m, label: t(`phits.metric.${m}`) }))} onChange={(v) => v && patchPerson({ metric: v })} />
      <Segmented<'auto' | 'fine' | 'coarse'> value={s.mode} options={(['auto', 'fine', 'coarse'] as const).map((m) => ({ value: m, label: t(`phits.mode.${m}`), title: t(`phits.mode.${m}Title`) }))} onChange={(v) => patchPerson({ mode: v, region: -1 })} />
      {r && (
        <div className="hint" data-phits="kept">
          {t('phits.view.kept', { kept: r.kept, total: r.total, placed: r.placed })}
        </div>
      )}
      {r && (
        <table className="vhits-table" data-phits="regions">
          <thead>
            <tr>
              <th />
              <th>{t('phits.col.hits')}</th>
              <th>{t('phits.col.share')}</th>
              <th>{t('phits.col.damage')}</th>
              <th>{t('phits.col.kill')}</th>
              <th>{t('phits.col.absorbed')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((x, k) => (
              <tr key={x.name} className={k === s.region ? 'on' : ''} onClick={() => s.set({ region: k === s.region ? -1 : k })}>
                <td className="vhits-top-name">{t(`phits.region.${names[k]}`)}</td>
                <td>{int(x.hits)}</td>
                <td title={Number.isFinite(x.shareLo) ? `${pct(x.shareLo)} - ${pct(x.shareHi)}` : undefined}>{pct(x.share)}</td>
                <td>{dec(x.damage)}</td>
                <td title={Number.isFinite(x.killLo) ? `${pct(x.killLo)} - ${pct(x.killHi)} (${int(x.killN)})` : undefined}>{pct(x.killRate)}</td>
                <td>{dec(x.absorbed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {regionPicked && (
        <button className="link" onClick={() => patchPersonFilter({ regions: [names[s.region]] })}>
          {t('phits.view.onlyRegion', { region: t(`phits.region.${names[s.region]}`) })}
        </button>
      )}
    </Section>
  );
});

const FilterSection = memo(function FilterSection({ f, flt }: { f: Facets; flt: PersonFilter }) {
  return (
    <Section title={t('phits.filter.title')} defaultOpen={false}>
      <Chips label={t('phits.filter.game')} items={f.game} picked={flt.games} onChange={(v) => patchPersonFilter({ games: v })} />
      <Pick label={t('phits.filter.map')} items={f.map} value={flt.maps} onChange={(v) => patchPersonFilter({ maps: v })} />
      <Chips label={t('phits.filter.weaponClass')} items={f.weaponClass} picked={flt.weaponClasses} onChange={(v) => patchPersonFilter({ weaponClasses: v })} />
      <Pick label={t('phits.filter.weapon')} items={f.weapon} value={flt.weapons} onChange={(v) => patchPersonFilter({ weapons: v })} />
      <Chips label={t('phits.filter.ammoType')} items={f.ammoType} picked={flt.ammoTypes} onChange={(v) => patchPersonFilter({ ammoTypes: v })} />
      <Pick label={t('phits.filter.ammo')} items={f.ammo} value={flt.ammos} onChange={(v) => patchPersonFilter({ ammos: v })} />
      <RangeField label={t('phits.filter.calibre')} value={flt.calibre} step={0.1} onChange={(v) => patchPersonFilter({ calibre: v })} />
      <Chips label={t('phits.filter.armor')} items={f.armor} picked={flt.armors} onChange={(v) => patchPersonFilter({ armors: v })} />
      <Tri label={t('phits.filter.helmet')} value={flt.helmet} options={[['yes', t('phits.yes')], ['no', t('phits.no')]]} onChange={(v) => patchPersonFilter({ helmet: v as PersonFilter['helmet'] })} />
      <RangeField label={t('phits.filter.distance')} value={flt.distance} onChange={(v) => patchPersonFilter({ distance: v })} />
      <RangeField label={t('phits.filter.angle')} value={flt.angle} onChange={(v) => patchPersonFilter({ angle: v })} />
      <Chips label={t('phits.filter.from')} items={[['front', 0], ['side', 0], ['back', 0]]} picked={flt.from} onChange={(v) => patchPersonFilter({ from: v as PersonFilter['from'] })} />
      <Tri label={t('phits.filter.penetrated')} value={flt.penetrated} options={[['yes', t('phits.yes')], ['no', t('phits.no')]]} onChange={(v) => patchPersonFilter({ penetrated: v as PersonFilter['penetrated'] })} />
      <Tri label={t('phits.filter.kill')} value={flt.kill} options={[['yes', t('phits.yes')], ['no', t('phits.no')]]} onChange={(v) => patchPersonFilter({ kill: v as PersonFilter['kill'] })} />
      <Tri label={t('phits.filter.won')} value={flt.won} options={[['won', t('phits.won')], ['lost', t('phits.lost')]]} onChange={(v) => patchPersonFilter({ won: v as PersonFilter['won'] })} />
      <Chips label={t('phits.filter.side')} items={f.victimSide} picked={flt.sides} onChange={(v) => patchPersonFilter({ sides: v })} />
      <Chips label={t('phits.filter.role')} items={f.victimRole} picked={flt.roles} onChange={(v) => patchPersonFilter({ roles: v })} />
      <Chips label={t('phits.filter.victimState')} items={f.victimState} picked={flt.victimStates} onChange={(v) => patchPersonFilter({ victimStates: v })} />
      <Chips label={t('phits.filter.shooterState')} items={f.shooterState} picked={flt.shooterStates} onChange={(v) => patchPersonFilter({ shooterStates: v })} />
      <Pick label={t('phits.filter.victim')} items={f.victim} value={flt.victims} onChange={(v) => patchPersonFilter({ victims: v })} />
      <Pick label={t('phits.filter.shooter')} items={f.shooter} value={flt.shooters} onChange={(v) => patchPersonFilter({ shooters: v })} />
      {flt.regions?.length ? (
        <button className="link" onClick={() => patchPersonFilter({ regions: null })}>
          {t('phits.filter.allRegions')}
        </button>
      ) : null}
      <Check label={t('phits.filter.teamHits')} checked={!!flt.teamHits} onChange={(v) => patchPersonFilter({ teamHits: v })} />
      <button className="link" onClick={() => patchPerson({ filter: {} })}>
        {t('phits.filter.clear')}
      </button>
    </Section>
  );
});

const AnalysisGroup = memo(function AnalysisGroup({ r }: { r: PersonView }) {
  return (
    <TaskGroup task="analyse" className="vehicle-panel">
      <Section title={t('phits.charts.title')} defaultOpen>
        <ChartBox data={r.charts[0]} title={t('phits.charts.falloff')} />
        <ChartBox data={r.charts[1]} title={t('phits.charts.headshot')} />
        <ChartBox data={r.charts[2]} title={t('phits.charts.armour')} />
        <ChartBox data={r.charts[3]} title={t('phits.charts.distance')} />
      </Section>
      <Section title={t('phits.top.title')} defaultOpen={false}>
        {(['weapon', 'armor', 'ammo', 'victimRole', 'shooter', 'victim'] as const).map((k) => (
          <TopTable key={k} by={k} rows={r.tops[k]} onPick={(key) => patchPersonFilter({ [TOP_FILTER[k]]: [key] })} />
        ))}
      </Section>
      <Section title={t('phits.sources.title')} defaultOpen={false}>
        <div className="hint">{t('phits.sources.hint')}</div>
        {Object.entries(r.coverage).map(([game, c]) => (
          <table key={game} className="vhits-table" data-phits="coverage">
            <thead>
              <tr>
                <th>{t(`phits.game.${game || 'none'}`)}</th>
                {SOURCES.map((x) => (
                  <th key={x}>{t(`phits.source.${x}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SOURCE_FIELDS.map((fld) => (
                <tr key={fld}>
                  <td className="vhits-top-name">{t(`phits.field.${fld}`)}</td>
                  {c.fields[fld].map((n, k) => (
                    <td key={k}>{c.hits ? pct(n / c.hits) : '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </Section>
    </TaskGroup>
  );
});
