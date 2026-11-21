/**
 * The Vehicles tab's hit analysis over many matches (docs/vehicle-hits.md):
 * load only the hits of a whole folder of War Thunder matches, pick a
 * vehicle (one model, the same vehicle under all its ids, or its family),
 * filter by everything a hit says - calibre, shell, result, speed, angle,
 * distance, shooter, map, mode, battle rating, date, game version, won or
 * lost, and what the hit did - and read each plate: penetration rate with
 * its interval, speeds, angles, the armour along the way, calibres, and how
 * often a penetration there killed, lit a fire or reached the ammunition.
 * All the counting is in the worker (`vehicle/mass`); this only shows it.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Section, Segmented, Select, Slider } from '../controls';
import { TaskGroup } from '../shell/Shell';
import { ChartView } from '../../charts/ChartView';
import { localizeChart } from '../../charts/format';
import type { ChartData, ChartEntity } from '../../charts/types';
import { int, num, t } from '../../i18n';
import { usePlateHover, useVehicleStore } from '../../state/vehicleStore';
import { useRaceStore } from '../../state/raceStore';
import { useStore } from '../../state/store';
import { expandContainerFiles } from '../../data/container';
import { formatBytes } from '../../data/memory';
import { platesHere } from '../../vehicle/plates';
import { cancelHits, fileOfHit, legendStops, loadHits, metaOf, NO_DATA_CSS, patchFilter, patchHits, RESULT_COLOURS, showHit, useHitMass, vehicleName } from '../../vehicle/mass/client';
import type { BinField, Grouping, HitFilter, PlateMetric, Range } from '../../vehicle/mass/analyze';
import type { Compare } from '../../vehicle/mass/hitWorker';
import { EFFECTS, EFFECTS_IN_DATA, RESULTS, type Effect, type HitResult } from '../../vehicle/mass/types';
import { rgbCss } from '../../race/geometry';
import { useMass } from '../../mass/client';
import { startLeanLoad } from '../overlay/LeanOverlayPanel';
import type { Engine } from '../../render/engine';

const pct = (v: number) => (Number.isFinite(v) ? `${num(v * 100, 0)} %` : '-');
const val = (v: number | null | undefined, d = 0) => (v !== null && v !== undefined && Number.isFinite(v) ? num(v, d) : '-');

/** A number range: two boxes, empty for open. */
function RangeField({ label, value, onChange, step = 1, title }: { label: string; value: Range | undefined; onChange: (r: Range | null) => void; step?: number; title?: string }) {
  const [a, b] = value ?? [null, null];
  const parse = (s: string) => (s.trim() === '' ? null : Number(s));
  const set = (lo: number | null, hi: number | null) => onChange(lo === null && hi === null ? null : [lo, hi]);
  return (
    <div className="vhits-range" title={title}>
      <span className="vhits-range-label">{label}</span>
      <input type="number" step={step} value={a ?? ''} placeholder={t('vhits.range.from')} onChange={(e) => set(parse(e.target.value), b)} />
      <span>-</span>
      <input type="number" step={step} value={b ?? ''} placeholder={t('vhits.range.to')} onChange={(e) => set(a, parse(e.target.value))} />
    </div>
  );
}

/** Chips for a value list: none ticked is every value. */
function Chips({ label, items, picked, onChange, name = (k: string) => k, disabled }: { label: string; items: [string, number][]; picked: string[] | null | undefined; onChange: (v: string[] | null) => void; name?: (k: string) => string; disabled?: Set<string> }) {
  if (!items.length) return null;
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
            disabled={disabled?.has(k)}
            title={disabled?.has(k) ? t('vhits.filter.notInData') : undefined}
            onClick={() => {
              const next = new Set(on);
              if (next.has(k)) next.delete(k);
              else next.add(k);
              onChange(next.size ? [...next] : null);
            }}
          >
            {name(k)} {n > 0 && <span className="vehicle-filter-n">{int(n)}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

const plainName = (k: string) => k;

/** A picked value of a long list: a select with "any". */
function Pick({ label, items, value, onChange, name = plainName }: { label: string; items: [string, number][]; value: string[] | null | undefined; onChange: (v: string[] | null) => void; name?: (k: string) => string }) {
  // Made once a list: a re-render must not build hundreds of options again.
  const options = useMemo(() => items.slice(0, 400).map(([k, n]) => ({ value: k, label: `${name(k)} (${int(n)})` })), [items, name]);
  return (
    <Select
      label={label}
      value={value?.[0] ?? null}
      allowEmpty
      options={options}
      onChange={(v) => onChange(v ? [v] : null)}
    />
  );
}

function dateValue(ms: number | null): string {
  return ms === null || !Number.isFinite(ms) ? '' : new Date(ms).toISOString().slice(0, 10);
}

const METRICS: PlateMetric[] = ['rate', 'density', 'lethal', 'fire', 'crew', 'ammo', 'angle', 'speed'];
const FIELDS_ON_AXES: BinField[] = ['angle', 'speed', 'distance', 'descent', 'effMm', 'calibre'];

export function HitMassPanel({ engine }: { engine?: Engine | null }) {
  const s = useHitMass();
  const filePick = useRef<HTMLInputElement>(null);
  const folderPick = useRef<HTMLInputElement>(null);
  const [pose, setPose] = useState(true);
  const hover = usePlateHover((h) => h.plate);
  const selected = useVehicleStore((v) => v.selected);
  const massFacets = useMass((m) => m.facets);

  // A mark clicked: its whole record.
  useEffect(() => {
    if (selected && s.active) void showHit(selected.id);
  }, [selected, s.active]);

  const st = s.stats;
  const f = s.facets;
  const r = s.result;
  const plates = s.figure ? platesHere(s.figure) : null;
  const plate = hover >= 0 ? hover : s.plate;
  const pstat = r?.stats && plate >= 0 ? r.stats[plate] : null;

  const pickFiles = async (list: FileList | null, add = false) => {
    if (!list || !list.length) return;
    const files = [...list].filter((x) => /\.(3dheat|parquet)$/i.test(x.name) && !/\.(flight|messages|events|chat|objectives)\.parquet$/i.test(x.name));
    await loadHits(files, { add, pose });
  };
  const fromMass = async () => {
    const { askMass } = await import('../../mass/client');
    const res = await askMass<{ files: File[] }>({ type: 'drill', filter: { ...useMass.getState().filter, game: 'warthunder' } } as never, 'drill');
    if (res.files.length) await loadHits(res.files, { pose });
  };

  const vehicles = useMemo(() => (f ? f.vehicles.map((v) => ({ value: v.id, label: `${vehicleName(v.id)} (${int(v.hits)})` })) : []), [f]);
  const flt = s.filter;
  const effectItems = useMemo(() => EFFECTS.map((e) => [e, 0] as [string, number]), []);
  const notInData = useMemo(() => new Set(EFFECTS.filter((e) => !EFFECTS_IN_DATA.includes(e))), []);

  const classes = useMemo(() => (f ? classItems(f) : []), [f]);
  const nations = useMemo(() => (f ? nationItems(f) : []), [f]);
  const resultItems = useMemo(() => RESULTS.map((x) => [x, 0] as [string, number]), []);
  const metricLabel = (m: PlateMetric) => t(`vhits.metric.${m}`);
  const legend = r?.colours;

  const loadSection = (
    <>
    {/* The pickers outside the section: they stay while it is closed. */}
      <input ref={filePick} type="file" multiple accept=".3dheat,.parquet" style={{ display: 'none' }} onChange={(e) => void pickFiles(e.target.files)} data-vhits="files" />
      <input ref={folderPick} type="file" multiple style={{ display: 'none' }} {...({ webkitdirectory: '' } as object)} onChange={(e) => void pickFiles(e.target.files)} data-vhits="folder" />
    <Section title={t('vhits.load.title')} defaultOpen={!st || st.running}>
      <div className="hint">{t('vhits.load.hint')}</div>
      <div className="row wrap">
        <button onClick={() => filePick.current?.click()}>{t('vhits.load.files')}</button>
        <button onClick={() => folderPick.current?.click()}>{t('vhits.load.folder')}</button>
        {massFacets && <button onClick={() => void fromMass()} title={t('vhits.load.fromMassTitle')}>{t('vhits.load.fromMass')}</button>}
        {st?.running && <button onClick={cancelHits}>{t('vhits.load.cancel')}</button>}
      </div>
      <Check label={t('vhits.load.pose')} title={t('vhits.load.poseTitle')} checked={pose} onChange={setPose} />
      {st && (
        <div className="vehicle-counts" data-vhits="stats">
          {t('vhits.load.stats', { done: st.done, files: st.files, matches: st.matches, hits: st.hits, bytes: formatBytes(st.bytes), seconds: num(st.ms / 1000, 1) })}
          <div className="hint">
            {t('vhits.load.read', { rows: st.kept, total: st.rows, cached: st.cached, native: st.native, empty: st.empty, failed: st.failed })}
          </div>
          {st.stopped > 0 && <div className="hint vehicle-warn">{t('vhits.load.stopped', { n: st.stopped })}</div>}
        </div>
      )}
      {s.error && <div className="hint vehicle-warn">{s.error}</div>}
      <button className="link" onClick={() => s.set({ active: false })}>
        {t('vhits.load.back')}
      </button>
    </Section>
    </>
  );

  if (!f || !f.vehicles.length) {
    return (
      <TaskGroup task="explore" className="vehicle-panel">
        {loadSection}
      </TaskGroup>
    );
  }

  const compareFields: { value: Compare['field']; label: string }[] = (['victimTeam', 'gameVersion', 'kind', 'ammoType', 'won', 'map', 'mode', 'converterVersion'] as const).map((k) => ({ value: k, label: t(`vhits.compare.${k}`) }));
  const compareValues = (field: Compare['field']): string[] => {
    switch (field) {
      case 'victimTeam':
        return f.teams.map(([k]) => k);
      case 'gameVersion':
        return f.gameVersions.map(([k]) => k).sort();
      case 'converterVersion':
        return f.converterVersions.map(([k]) => k).sort();
      case 'ammoType':
        return f.ammoTypes.map(([k]) => k);
      case 'kind':
        return ['APFSDS', 'APDS', 'APCR', 'APHE', 'AP', 'HEAT-FS', 'HEAT', 'HESH', 'HE', 'ATGM', 'kinetic', 'explosive'];
      case 'won':
        return ['won', 'lost'];
      case 'map':
        return f.maps.map(([k]) => k);
      case 'mode':
        return f.modes.map(([k]) => k);
    }
  };
  const setCompare = (field: Compare['field'] | null) => {
    if (!field) return patchHits({ compare: null });
    const vals = compareValues(field);
    // Two halves to begin with: a version split before the newest, else the first value against the second.
    if (field === 'gameVersion' || field === 'converterVersion') {
      const cut = Math.max(1, vals.length - 1);
      patchHits({ compare: { field, a: vals.slice(0, cut), b: vals.slice(cut) } });
    } else patchHits({ compare: { field, a: vals.slice(0, 1), b: vals.slice(1, 2) } });
  };

  const onChartPick = (field: BinField) => (e: ChartEntity) => {
    const fl = e.filter;
    if (fl && fl.kind === 'range') patchFilter({ [field]: [fl.lo, fl.hi] } as Partial<HitFilter>);
  };

  const openHit = async () => {
    const d = s.detail;
    if (!d) return;
    const file = fileOfHit(d);
    if (!file) return;
    const tables = await expandContainerFiles([file]);
    const ok = await startLeanLoad(tables, engine ?? null, false);
    if (!ok) return;
    s.set({ active: false });
    useRaceStore.getState().setTab('match');
    useStore.getState().seek(Math.max(0, d.time - 3));
  };

  return (
    <>
      <TaskGroup task="explore" className="vehicle-panel">
        {loadSection}
        <Section title={t('vhits.vehicle.title')} defaultOpen>
          <Select label={t('vhits.vehicle.pick')} value={s.vehicle} options={vehicles} onChange={(v) => patchHits({ vehicle: v })} />
          <Segmented
            value={s.grouping}
            options={(['model', 'vehicle', 'family'] as Grouping[]).map((g) => ({ value: g, label: t(`vhits.group.${g}`), title: t(`vhits.group.${g}Title`) }))}
            onChange={(grouping) => patchHits({ grouping })}
          />
          {s.platesPending && <div className="hint">{t('vhits.vehicle.platesPending')}</div>}
          {!s.platesPending && !s.platesKey && <div className="hint vehicle-warn">{t('vhits.vehicle.noPlates')}</div>}
          {r && (
            <div className="vehicle-counts" data-vhits="view">
              {t('vhits.vehicle.counts', { kept: r.kept, hits: r.hits, rate: pct(r.known ? r.through / r.known : NaN), known: r.known, ms: num(r.ms, 0) })}
              <div className="hint">
                {t('vhits.vehicle.coverage', {
                  plate: pct(r.kept ? r.coverage.plate / r.kept : NaN),
                  angle: pct(r.kept ? r.coverage.angle / r.kept : NaN),
                  speed: pct(r.kept ? r.coverage.speed / r.kept : NaN),
                  distance: pct(r.kept ? r.coverage.distance / r.kept : NaN),
                  pose: pct(r.kept ? r.coverage.pose / r.kept : NaN),
                })}
              </div>
            </div>
          )}
        </Section>

        <Section title={t('vhits.colour.title')} defaultOpen>
          <Select label={t('vhits.colour.metric')} value={s.metric} options={METRICS.map((m) => ({ value: m, label: metricLabel(m) }))} onChange={(metric) => patchHits({ metric: metric ?? 'rate' })} />
          {s.metric === 'rate' && !s.compare && (
            <Segmented value={s.centre} options={[{ value: 'overall', label: t('vhits.colour.centreOverall') }, { value: 'half', label: t('vhits.colour.centreHalf') }]} onChange={(centre) => patchHits({ centre })} />
          )}
          <Slider label={t('vhits.colour.minHits')} value={s.minHits} min={1} max={50} step={1} format={(v) => int(v)} onChange={(minHits) => patchHits({ minHits })} />
          {legend && (
            <div className="vhits-legend" data-vhits="legend">
              <div className="vhits-legend-title">{s.compare ? t('vhits.colour.diffLegend') : metricLabel(s.metric)}</div>
              <div className="vhits-legend-bar" style={{ background: `linear-gradient(90deg, ${legendStops(legend.diverging)})` }} />
              <div className="vhits-legend-ticks">
                <span>{legendTick(s.compare ? 'diff' : s.metric, legend.lo)}</span>
                {legend.diverging && <span>{legendTick(s.compare ? 'diff' : s.metric, legend.mid)}</span>}
                <span>{legendTick(s.compare ? 'diff' : s.metric, legend.hi)}</span>
              </div>
              <div className="hint">
                <i className="vhits-swatch" style={{ background: NO_DATA_CSS }} /> {t('vhits.colour.noData', { n: s.minHits })}
              </div>
            </div>
          )}
          <Select
            label={t('vhits.marks.by')}
            value={s.markBy}
            options={[{ value: 'result' as 'result' | Effect, label: t('vhits.marks.result') }, ...EFFECTS_IN_DATA.map((e) => ({ value: e as 'result' | Effect, label: t(`vhits.effect.${e}`) }))]}
            onChange={(markBy) => patchHits({ markBy: markBy ?? 'result' })}
          />
          {s.markBy === 'result' && (
            <div className="vehicle-chips">
              {RESULTS.map((res, k) => (
                <span key={res} className="vhits-key">
                  <i style={{ background: rgbCss(RESULT_COLOURS[k]) }} /> {t(`vhits.result.${res}`)}
                </span>
              ))}
            </div>
          )}
          <Slider label={t('vhits.marks.count')} value={s.marks} min={0} max={20000} step={500} format={(v) => int(v)} onChange={(marks) => patchHits({ marks })} />
          <div className="hint">{t('vhits.marks.hint')}</div>
        </Section>

        <Section title={t('vhits.filter.title')} defaultOpen>
          <button className="link" onClick={() => patchHits({ filter: {} })}>
            {t('vhits.filter.reset')}
          </button>
          <Chips label={t('vhits.filter.result')} items={resultItems} picked={flt.results} name={(k) => t(`vhits.result.${k}`)} onChange={(v) => patchFilter({ results: v as HitResult[] | null })} />
          <Chips label={t('vhits.filter.ammoType')} items={f.ammoTypes} picked={flt.ammoTypes} onChange={(v) => patchFilter({ ammoTypes: v })} />
          <Pick label={t('vhits.filter.ammoName')} items={f.ammoNames} value={flt.ammoNames} onChange={(v) => patchFilter({ ammoNames: v })} />
          <RangeField label={t('vhits.field.calibre')} value={flt.calibre} onChange={(v) => patchFilter({ calibre: v ?? undefined })} />
          <RangeField label={t('vhits.field.speed')} value={flt.speed} step={10} title={t('vhits.field.speedTitle')} onChange={(v) => patchFilter({ speed: v ?? undefined })} />
          <RangeField label={t('vhits.field.angle')} value={flt.angle} title={t('vhits.field.angleTitle')} onChange={(v) => patchFilter({ angle: v ?? undefined })} />
          <RangeField label={t('vhits.field.descent')} value={flt.descent} title={t('vhits.field.descentTitle')} onChange={(v) => patchFilter({ descent: v ?? undefined })} />
          <RangeField label={t('vhits.field.distance')} value={flt.distance} step={50} title={t('vhits.field.distanceTitle')} onChange={(v) => patchFilter({ distance: v ?? undefined })} />
          <RangeField label={t('vhits.field.effMm')} value={flt.effMm} step={10} title={t('vhits.field.effMmTitle')} onChange={(v) => patchFilter({ effMm: v ?? undefined })} />
          <Chips label={t('vhits.filter.effects')} items={effectItems} picked={flt.effects} name={(k) => t(`vhits.effect.${k}`)} disabled={notInData} onChange={(v) => patchFilter({ effects: v as Effect[] | null })} />
          <Pick label={t('vhits.filter.attacker')} items={f.attackers} value={flt.attackers} name={vehicleName} onChange={(v) => patchFilter({ attackers: v })} />
          <Chips label={t('vhits.filter.attackerClass')} items={classes} picked={flt.attackerClasses} onChange={(v) => patchFilter({ attackerClasses: v })} />
          <Chips label={t('vhits.filter.attackerNation')} items={nations} picked={flt.attackerNations} onChange={(v) => patchFilter({ attackerNations: v })} />
          <Segmented
            value={flt.shooters ?? 'all'}
            options={[
              { value: 'all', label: t('vhits.filter.shootersAll') },
              { value: 'players', label: t('vhits.filter.shootersPlayers') },
              { value: 'ai', label: t('vhits.filter.shootersAi') },
            ]}
            onChange={(v) => patchFilter({ shooters: v === 'all' ? null : (v as 'players' | 'ai') })}
          />
          <Pick label={t('vhits.filter.map')} items={f.maps} value={flt.maps} onChange={(v) => patchFilter({ maps: v })} />
          <Chips label={t('vhits.filter.mode')} items={f.modes} picked={flt.modes} onChange={(v) => patchFilter({ modes: v })} />
          <RangeField label={t('vhits.filter.br')} value={flt.br} step={0.3} onChange={(v) => patchFilter({ br: v ?? undefined })} />
          <div className="vhits-range">
            <span className="vhits-range-label">{t('vhits.filter.dates')}</span>
            <input type="date" value={dateValue(flt.dates?.[0] ?? null)} onChange={(e) => patchFilter({ dates: [e.target.value ? Date.parse(e.target.value) : null, flt.dates?.[1] ?? null] })} />
            <input type="date" value={dateValue(flt.dates?.[1] ?? null)} onChange={(e) => patchFilter({ dates: [flt.dates?.[0] ?? null, e.target.value ? Date.parse(e.target.value) + 86_399_999 : null] })} />
          </div>
          <Chips label={t('vhits.filter.gameVersion')} items={f.gameVersions} picked={flt.gameVersions} onChange={(v) => patchFilter({ gameVersions: v })} />
          <Chips label={t('vhits.filter.converterVersion')} items={f.converterVersions} picked={flt.converterVersions} onChange={(v) => patchFilter({ converterVersions: v })} />
          <Segmented
            value={flt.won ?? 'all'}
            options={[
              { value: 'all', label: t('vhits.filter.wonAll') },
              { value: 'won', label: t('vhits.filter.won') },
              { value: 'lost', label: t('vhits.filter.lost') },
            ]}
            onChange={(v) => patchFilter({ won: v === 'all' ? null : (v as 'won' | 'lost') })}
          />
          <PlayerField label={t('vhits.filter.myShots')} title={t('vhits.filter.myShotsTitle')} value={flt.attackerPlayers?.[0] ?? ''} onChange={(v) => patchFilter({ attackerPlayers: v ? [v] : null })} />
          <PlayerField label={t('vhits.filter.onMe')} title={t('vhits.filter.onMeTitle')} value={flt.victimPlayers?.[0] ?? ''} onChange={(v) => patchFilter({ victimPlayers: v ? [v] : null })} />
          {plate >= 0 && (
            <button onClick={() => patchFilter({ plates: flt.plates?.includes(plate) ? null : [plate] })}>{flt.plates?.includes(plate) ? t('vhits.filter.allPlates') : t('vhits.filter.thisPlate')}</button>
          )}
        </Section>
      </TaskGroup>

      <TaskGroup task="analyse" className="vehicle-panel">
        <Section title={t('vhits.plate.title')} defaultOpen>
          {!pstat && <div className="hint">{t('vhits.plate.hint')}</div>}
          {pstat && plates && plates[plate] && (
            <div className="vhits-plate" data-vhits="plate">
              <div className="vhits-plate-name">
                {plates[plate].name} {plates[plate].mm !== null && <span className="hint">{t('vhits.plate.mm', { mm: num(plates[plate].mm!, 0) })}</span>}
              </div>
              <table className="vhits-table">
                <tbody>
                  <tr><th>{t('vhits.plate.hits')}</th><td>{int(pstat.hits)}</td></tr>
                  <tr><th>{t('vhits.plate.rate')}</th><td>{t('vhits.plate.rateValue', { rate: pct(pstat.rate), lo: pct(pstat.ci[0]), hi: pct(pstat.ci[1]), n: pstat.known })}</td></tr>
                  <tr><th>{t('vhits.plate.speed')}</th><td>{t('vhits.plate.meanMedian', { mean: val(pstat.speedMean), median: val(pstat.speedMedian) })} {Number.isFinite(pstat.speedEstimated) && pstat.speedEstimated > 0 && <span className="hint">{t('vhits.plate.estimated', { share: pct(pstat.speedEstimated) })}</span>}</td></tr>
                  <tr><th>{t('vhits.plate.angle')}</th><td>{t('vhits.plate.meanMedian', { mean: val(pstat.angleMean, 1), median: val(pstat.angleMedian, 1) })}</td></tr>
                  <tr><th>{t('vhits.plate.effMm')}</th><td>{val(pstat.effMedian)}</td></tr>
                  <tr><th>{t('vhits.plate.distance')}</th><td>{val(pstat.distMedian)}</td></tr>
                  <tr><th>{t('vhits.plate.calibres')}</th><td>{pstat.calibres.map(([mm, n]) => `${mm} mm × ${int(n)}`).join(', ') || '-'}</td></tr>
                  <tr><th>{t('vhits.plate.effects')}</th><td>{t('vhits.plate.effectsValue', { lethal: pct(pstat.lethal), fire: pct(pstat.fire), ammo: pct(pstat.ammo), crew: pct(pstat.crew), module: pct(pstat.module) })}</td></tr>
                  {r?.compare && (
                    <tr>
                      <th>{t('vhits.plate.compare')}</th>
                      <td>{t('vhits.plate.compareValue', { a: pct(r.compare.a[plate].rate), na: r.compare.a[plate].known, b: pct(r.compare.b[plate].rate), nb: r.compare.b[plate].known, z: val(r.compare.z[plate], 1) })}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button className="link" onClick={() => patchHits({ plate: s.plate === plate ? -1 : plate })}>
                {s.plate === plate ? t('vhits.plate.unpick') : t('vhits.plate.pick')}
              </button>
            </div>
          )}
        </Section>

        {s.detail && (
          <Section title={t('vhits.hit.title')} defaultOpen>
            <HitCard />
            <button onClick={() => void openHit()} data-vhits="open">{t('vhits.hit.open')}</button>
          </Section>
        )}

        <Section title={t('vhits.compare.title')} defaultOpen={!!s.compare}>
          <Select label={t('vhits.compare.by')} value={s.compare?.field ?? null} options={compareFields} allowEmpty onChange={setCompare} />
          {s.compare && (
            <>
              <Chips label={t('vhits.compare.a')} items={compareValues(s.compare.field).map((k) => [k, 0] as [string, number])} picked={s.compare.a} onChange={(v) => patchHits({ compare: { ...s.compare!, a: v ?? [] } })} />
              <Chips label={t('vhits.compare.b')} items={compareValues(s.compare.field).map((k) => [k, 0] as [string, number])} picked={s.compare.b} onChange={(v) => patchHits({ compare: { ...s.compare!, b: v ?? [] } })} />
              {r?.compare && <div className="hint">{t('vhits.compare.counts', { a: r.compare.aHits, b: r.compare.bHits })}</div>}
            </>
          )}
        </Section>

        <Section title={plate >= 0 ? t('vhits.charts.titlePlate', { plate: plates?.[plate]?.name ?? '' }) : t('vhits.charts.title')} defaultOpen>
          <Segmented
            value={s.charts[0]?.split ?? 'kind'}
            options={[
              { value: 'kind', label: t('vhits.charts.byKind') },
              { value: 'ammoType', label: t('vhits.charts.byType') },
              { value: 'none', label: t('vhits.charts.byNone') },
            ]}
            onChange={(split) => patchHits({ charts: s.charts.map((c) => (c.kind === 'rate' ? { ...c, split } : c)) })}
          />
          {r?.charts.map((c, k) => (
            <ChartBox key={k} data={c} field={s.charts[k]?.field} onPick={s.charts[k] ? onChartPick(s.charts[k].field) : undefined} onField={(field) => patchHits({ charts: s.charts.map((x, i) => (i === k ? { ...x, field } : x)) })} />
          ))}
        </Section>

        {r && (
          <Section title={t('vhits.top.title')} defaultOpen>
            {(['attacker', 'ammoName', 'kind'] as const).map((by) => (
              <TopTable key={by} by={by} rows={r.top[by] ?? []} onPick={(k) => (by === 'attacker' ? patchFilter({ attackers: [k] }) : by === 'ammoName' ? patchFilter({ ammoNames: [k] }) : undefined)} />
            ))}
          </Section>
        )}
      </TaskGroup>
    </>
  );
}

function legendTick(metric: PlateMetric | 'diff', v: number): string {
  if (!Number.isFinite(v)) return '';
  if (metric === 'density') return int(v);
  if (metric === 'angle') return `${num(v, 0)}°`;
  if (metric === 'speed') return `${num(v, 0)} m/s`;
  if (metric === 'diff') return `${v > 0 ? '+' : ''}${num(v * 100, 0)} pp`;
  return pct(v);
}

function classItems(f: NonNullable<ReturnType<typeof useHitMass.getState>['facets']>): [string, number][] {
  return tallyMeta(f, 'cls');
}
function nationItems(f: NonNullable<ReturnType<typeof useHitMass.getState>['facets']>): [string, number][] {
  return tallyMeta(f, 'nation');
}
function tallyMeta(f: NonNullable<ReturnType<typeof useHitMass.getState>['facets']>, key: 'cls' | 'nation'): [string, number][] {
  const m = new Map<string, number>();
  for (const [id, n] of f.attackers) {
    if (!metaCache.has(id)) metaCache.set(id, metaOf(id));
    const k = metaCache.get(id)?.[key];
    if (k) m.set(k, (m.get(k) ?? 0) + n);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
const metaCache = new Map<string, ReturnType<typeof metaOf>>();

function PlayerField({ label, title, value, onChange }: { label: string; title: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  return (
    <div className="vhits-range" title={title}>
      <span className="vhits-range-label">{label}</span>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} onBlur={() => onChange(text.trim())} onKeyDown={(e) => e.key === 'Enter' && onChange(text.trim())} />
    </div>
  );
}

function ChartBox({ data, field, onPick, onField }: { data: ChartData; field?: BinField; onPick?: (e: ChartEntity) => void; onField: (f: BinField) => void }) {
  const shown = useMemo(() => localizeChart(structuredClone(data)), [data]);
  const mem = useRef(new Map<string, number>()).current;
  return (
    <div className="vhits-chart">
      <Select label={data.kind === 'line' ? t('vhits.charts.rateOver') : t('vhits.charts.histogram')} value={field ?? null} options={FIELDS_ON_AXES.map((x) => ({ value: x, label: t(`vhits.field.${x}`) }))} onChange={(v) => v && onField(v as BinField)} />
      {data.empty ? <div className="hint">{t('vhits.chart.empty')}</div> : <ChartView data={shown} width={300} height={170} colorMemory={mem} onPick={onPick ? (e) => onPick(e) : undefined} />}
    </div>
  );
}

function TopTable({ by, rows, onPick }: { by: string; rows: { key: string; hits: number; known: number; through: number; rate: number; ci: [number, number]; kills: number; fires: number; medianDist: number }[]; onPick: (k: string) => void }) {
  if (!rows.length) return null;
  return (
    <div className="vhits-top">
      <div className="vhits-chips-head">{t(`vhits.top.${by}`)}</div>
      <table className="vhits-table">
        <thead>
          <tr>
            <th />
            <th>{t('vhits.top.hits')}</th>
            <th>{t('vhits.top.rate')}</th>
            <th>{t('vhits.top.kills')}</th>
            <th>{t('vhits.top.fires')}</th>
            <th>{t('vhits.top.dist')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 12).map((x) => (
            <tr key={x.key} onClick={() => onPick(x.key)} className="vhits-row">
              <td title={x.key}>{by === 'attacker' ? vehicleName(x.key) : x.key}</td>
              <td>{int(x.hits)}</td>
              <td title={t('vhits.top.ci', { lo: pct(x.ci[0]), hi: pct(x.ci[1]), n: x.known })}>{pct(x.rate)}</td>
              <td>{int(x.kills)}</td>
              <td>{int(x.fires)}</td>
              <td>{val(x.medianDist)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HitCard() {
  const d = useHitMass((s) => s.detail);
  if (!d) return null;
  const src = (s: string) => <span className={`vhits-src vhits-src-${s}`}>{t(`vhits.source.${s}`)}</span>;
  return (
    <table className="vhits-table" data-vhits="hit">
      <tbody>
        <tr><th>{t('vhits.hit.result')}</th><td>{t(`vhits.result.${d.result}`)}</td></tr>
        <tr><th>{t('vhits.hit.ammo')}</th><td>{[d.ammoName, d.ammoType, d.kind, d.calibre !== null ? `${num(d.calibre, 1)} mm` : ''].filter(Boolean).join(' · ')}</td></tr>
        <tr><th>{t('vhits.field.speed')}</th><td>{d.speed !== null ? `${int(d.speed)} m/s` : '-'} {src(d.speedSource)}</td></tr>
        <tr><th>{t('vhits.field.angle')}</th><td>{d.angle !== null ? `${num(d.angle, 1)}°` : '-'} {src(d.angleSource)}{d.effMm !== null && <> · {t('vhits.hit.effMm', { mm: num(d.effMm, 0) })}</>}</td></tr>
        <tr><th>{t('vhits.field.descent')}</th><td>{d.descent !== null ? `${num(d.descent, 1)}°` : '-'} {src(d.descentSource)}</td></tr>
        <tr><th>{t('vhits.field.distance')}</th><td>{d.distance !== null ? `${int(d.distance)} m` : '-'} {src(d.distanceSource)}</td></tr>
        <tr><th>{t('vhits.hit.attacker')}</th><td>{vehicleName(d.attacker)} · {d.attackerPlayer}</td></tr>
        <tr><th>{t('vhits.hit.victim')}</th><td>{vehicleName(d.victim)} · {d.victimPlayer}{d.won !== null && <> · {d.won ? t('vhits.filter.won') : t('vhits.filter.lost')}</>}</td></tr>
        <tr><th>{t('vhits.hit.effects')}</th><td>{d.effects.length ? d.effects.map((e) => t(`vhits.effect.${e}`)).join(', ') : '-'}</td></tr>
        <tr><th>{t('vhits.hit.match')}</th><td>{d.match.map} · {d.match.mode} · {Number.isFinite(d.match.started) ? new Date(d.match.started).toISOString().slice(0, 16).replace('T', ' ') : ''} · {num(d.time, 1)} s</td></tr>
      </tbody>
    </table>
  );
}
