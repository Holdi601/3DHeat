import { useMemo } from 'react';
import { Check, Section, Segmented, Select, Slider } from '../controls';
import { useStore } from '../../state/store';
import { useVehicleStore, type VehicleLayer } from '../../state/vehicleStore';
import { vehicleView } from '../../vehicle/view';
import { OUTCOMES, penetrated, SECTORS, sectorOf, weaponOf, type Outcome, type VehicleHit } from '../../vehicle/hits';
import { REGIONS, regionOf } from '../../vehicle/regions';
import { OUTCOME_COLOURS, onFigure, templateOfFigure, type ColourBy } from '../../vehicle/scene';
import { FIT_MIN_HITS, fitResidual, offsetFor, shiftHits } from '../../vehicle/fit';
import { rgbCss } from '../../race/geometry';
import { figureLabel } from '../../tactics/names';
import { int, num, t } from '../../i18n';
import './vehicle.css';
import { lengthText, useUnits } from '../../state/unitsStore';
import { useVolumeStore } from '../../volumes/store';
import { HitArea, HitBreakdown } from './HitArea';

/** The values of one field over the hits, most frequent first. */
function tally(hits: VehicleHit[], key: (h: VehicleHit) => string): [string, number][] {
  const m = new Map<string, number>();
  for (const h of hits) {
    const k = key(h);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/**
 * The vehicle heatmap's sidebar: which vehicle, which of its hits (a layer,
 * matches, shooters, weapons), how the heat looks and what is drawn over it,
 * and what the hits say: where the shots came from, the modules destroyed,
 * the body parts hit.
 */
export function VehiclePanel() {
  useUnits();
  const dataset = useStore((s) => s.dataset);
  const s = useVehicleStore();
  // The volumes drawn on the level restrict the hits: a change shows at once.
  useVolumeStore((v) => v.volumes);
  useVolumeStore((v) => v.filter);
  const view = vehicleView(dataset, s);
  const set = view.set;
  const vehicles = useMemo(() => (set ? [...set.vehicles.values()].sort((a, b) => b.hits + b.modules - (a.hits + a.modules)) : []), [set]);
  // Names more than one vehicle has (two versions of one aircraft): those say their id too.
  const sameName = useMemo(() => {
    const seen = new Set<string>();
    const twice = new Set<string>();
    for (const v of vehicles) (seen.has(v.name) ? twice : seen).add(v.name);
    return twice;
  }, [vehicles]);
  const matches = useMemo(() => tally(view.all, (h) => h.match), [view.all]);
  const shooters = useMemo(() => tally(view.all, (h) => h.shooter), [view.all]);
  const weapons = useMemo(() => tally(view.all, weaponOf), [view.all]);
  const sectors = useMemo(() => {
    const c = new Map(SECTORS.map((k) => [k, 0]));
    for (const h of view.hits) if (h.dir) c.set(sectorOf(h.dir), c.get(sectorOf(h.dir))! + 1);
    return c;
  }, [view.hits]);
  const directed = [...sectors.values()].reduce((a, b) => a + b, 0);
  const modules = useMemo(() => tally(view.hits.filter((h) => h.kind === 'module'), (h) => (h.part === null ? '?' : String(h.part))), [view.hits]);
  const regions = useMemo(() => {
    const c = new Map<string, number>();
    for (const h of view.hits) {
      const r = h.region ? regionOf(h.region) : null;
      if (r) c.set(r, (c.get(r) ?? 0) + 1);
    }
    return c;
  }, [view.hits]);
  const tpl = view.figure ? templateOfFigure(view.figure) : null;
  const offset = tpl && s.fit && view.fits ? offsetFor(tpl, view.placed) : null;
  const residual = tpl && view.placed.length ? fitResidual(tpl, view.placed, offset ?? [0, 0, 0]) : null;
  // What the hits did, before the outcome filter: the chips' counts.
  const outcomes = useMemo(() => {
    const c = new Map<Outcome, number>();
    for (const h of view.all) c.set(h.outcome, (c.get(h.outcome) ?? 0) + 1);
    return OUTCOMES.filter((o) => c.has(o)).map((o) => [o, c.get(o)!] as [Outcome, number]);
  }, [view.all]);
  // Got through or not, overall and by the side the shot came from (where the data says).
  const through = useMemo(() => {
    const bySide = new Map(SECTORS.map((k) => [k, [0, 0]] as [string, number[]]));
    let yes = 0, known = 0;
    for (const h of view.hits) {
      const p = penetrated(h.outcome);
      if (p === null) continue;
      known++;
      if (p) yes++;
      if (h.dir) {
        const side = bySide.get(sectorOf(h.dir))!;
        side[1]++;
        if (!p) side[0]++;
      }
    }
    return { yes, known, bySide };
  }, [view.hits]);
  const killing = useMemo(() => {
    const k = view.hits.filter((h) => h.killingShot);
    const mid = (xs: number[]) => (xs.length ? xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)] : null);
    return {
      n: k.length,
      share: mid(k.map((h) => h.share).filter((v): v is number => v !== null)),
      toDeath: mid(view.hits.filter((h) => h.fatal && h.toDeath !== null).map((h) => h.toDeath!)),
      modules: k.reduce((a, h) => a + h.modules, 0),
    };
  }, [view.hits]);
  // On the figure: a point near it once moved, or a body part the figure has.
  const onIt = useMemo(() => {
    if (!tpl) return 0;
    return shiftHits(view.hits, offset ?? [0, 0, 0]).filter((h) => (h.local ? onFigure(h.local, tpl) : h.region ? regionOf(h.region) !== null : false)).length;
  }, [view.hits, tpl, offset]);
  const fatal = view.hits.filter((h) => h.fatal).length;

  if (!dataset) {
    return (
      <div className="vehicle-panel">
        <Section title={t('vehicle.panel.title')} defaultOpen>
          <div className="hint">{t('vehicle.empty.noData')}</div>
        </Section>
      </div>
    );
  }
  if (!set || set.vehicles.size === 0) {
    return (
      <div className="vehicle-panel">
        <Section title={t('vehicle.panel.title')} defaultOpen>
          <div className="hint">{t('vehicle.empty.noHits')}</div>
          {set && set.unplaced > 0 && <div className="hint vehicle-warn">{t('vehicle.hint.unplaced', { n: set.unplaced })}</div>}
        </Section>
      </div>
    );
  }

  const layers: { value: VehicleLayer; label: string; title: string }[] = [
    { value: 'all', label: t('vehicle.layer.all'), title: t('vehicle.layer.allTitle') },
    { value: 'kills', label: t('vehicle.layer.kills'), title: t('vehicle.layer.killsTitle') },
    { value: 'modules', label: t('vehicle.layer.modules'), title: t('vehicle.layer.modulesTitle') },
  ];
  const colourOptions: { value: ColourBy; label: string }[] = [
    { value: 'outcome', label: t('vehicle.colour.outcome') },
    { value: 'none', label: t('vehicle.colour.none') },
    { value: 'code', label: t('vehicle.colour.code') },
    { value: 'weapon', label: t('vehicle.colour.weapon') },
    { value: 'shooter', label: t('vehicle.colour.shooter') },
    { value: 'match', label: t('vehicle.colour.match') },
  ];

  return (
    <div className="vehicle-panel">
      <Section title={t('vehicle.panel.title')} defaultOpen>
        <Select
          label={t('vehicle.pick.label')}
          value={view.vehicle?.id ?? null}
          options={vehicles.map((v) => ({ value: v.id, label: t('vehicle.pick.option', { name: sameName.has(v.name) ? `${v.name} - ${v.id}` : v.name, n: v.hits + v.modules }) }))}
          onChange={(v) => s.patch({ vehicle: v, matches: null, shooters: null, weapons: null })}
        />
        {view.figure && <div className="hint">{t('vehicle.figure', { figure: figureLabel(view.figure) })}</div>}
        <div style={{ marginTop: 8 }}>
          <Segmented value={s.layer} options={layers} onChange={(layer) => s.patch({ layer })} />
        </div>
        {outcomes.length > 1 && (
          <div className="vehicle-chips" title={t('vehicle.outcome.chipsTitle')}>
            {outcomes.map(([o, n]) => {
              const on = !s.outcomes || s.outcomes.includes(o);
              return (
                <button key={o} className={on ? 'on' : ''} title={t(`vehicle.outcome.${o}Title`)} onClick={() => s.toggle('outcomes', o, outcomes.map(([k]) => k))}>
                  <i style={{ background: rgbCss(OUTCOME_COLOURS[o]) }} />
                  {t(`vehicle.outcome.${o}`)} <span className="vehicle-filter-n">{int(n)}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="vehicle-counts">
          {t('vehicle.counts', { hits: view.hits.length, placed: onIt, fatal })}
        </div>
        {view.unplaced > 0 && <div className="hint vehicle-warn">{t('vehicle.hint.unplaced', { n: view.unplaced })}</div>}
        {set.source === 'cs2' && <div className="hint">{t('vehicle.hint.regions')}</div>}
        {!view.anyPoint && <div className="hint">{t('vehicle.hint.noPoint')}</div>}
        <button className="vehicle-sheet-btn" onClick={() => s.patch({ sheetOpen: true })} disabled={!view.hits.length}>
          {t('vehicle.sheet.open')}
        </button>
      </Section>

      <HitArea dataset={dataset} view={view} />

      <Section title={t('vehicle.look.title')} defaultOpen={view.anyPoint}>
        <Slider
          label={t('vehicle.look.exposure')}
          value={s.exposure}
          min={-4}
          max={4}
          step={0.1}
          format={(v) => t('vehicle.look.stops', { n: num(v, 1) })}
          hint={t('vehicle.look.exposureHint')}
          onChange={(exposure) => s.patch({ exposure })}
        />
        <Slider
          label={t('vehicle.look.radius')}
          value={s.radius}
          min={0}
          max={3}
          step={0.01}
          format={(v) => (v > 0 ? lengthText(v, () => 2) : t('vehicle.look.auto'))}
          hint={t('vehicle.look.radiusHint')}
          onChange={(radius) => s.patch({ radius })}
        />
        {view.placed.length > 0 && view.fits && (
          <>
            <Check label={t('vehicle.look.fit')} title={t('vehicle.look.fitTitle')} checked={s.fit} onChange={(fit) => s.patch({ fit })} />
            <div className="hint">
              {view.placed.length < FIT_MIN_HITS
                ? t('vehicle.look.fitFew', { n: FIT_MIN_HITS })
                : offset
                  ? t('vehicle.look.fitMoved', { x: num(offset[0], 2), y: num(offset[1], 2), z: num(offset[2], 2) })
                  : t('vehicle.look.fitOff')}
            </div>
          </>
        )}
        {residual && (
          <div className="hint" title={t('vehicle.look.residualTitle')}>
            {t('vehicle.look.residual', { median: lengthText(residual.median, () => 2), near: num(residual.near * 100, 0), n: residual.hits })}
          </div>
        )}
        <Check label={t('vehicle.look.points')} title={t('vehicle.look.pointsTitle')} checked={s.showPoints} onChange={(showPoints) => s.patch({ showPoints })} />
        <Check label={t('vehicle.look.heat')} checked={s.showHeat} onChange={(showHeat) => s.patch({ showHeat })} />
        <Check label={t('vehicle.look.arrows')} title={t('vehicle.look.arrowsTitle')} checked={s.showArrows} onChange={(showArrows) => s.patch({ showArrows })} />
        <Select label={t('vehicle.colour.label')} value={s.colourBy} options={colourOptions} onChange={(v) => s.patch({ colourBy: v ?? 'none' })} />
        <Check label={t('vehicle.look.turntable')} checked={s.turntable} onChange={(turntable) => s.patch({ turntable })} />
        {s.turntable && (
          <Slider
            label={t('vehicle.look.spin')}
            value={s.spin}
            min={-60}
            max={60}
            step={1}
            format={(v) => t('vehicle.look.degPerSecond', { n: num(v, 0) })}
            onChange={(spin) => s.patch({ spin })}
          />
        )}
      </Section>

      {((through.known > 0 && set.source !== 'cs2' && set.source !== 'dota' && view.anyPoint) || killing.n > 0) && (
        <Section title={t('vehicle.stats.title')} defaultOpen>
          {through.known > 0 && set.source !== 'cs2' && set.source !== 'dota' && view.anyPoint && (
            <>
              <div className="vehicle-counts">{t('vehicle.stats.through', { pct: num((100 * through.yes) / through.known, 0), n: through.known })}</div>
              <div className="hint">{t('vehicle.stats.bySide')}</div>
              <Bars
                rows={SECTORS.filter((k) => through.bySide.get(k)![1] > 0).map((k) => {
                  const [no, all] = through.bySide.get(k)!;
                  return [t(`vehicle.sector.${k}`), Math.round((100 * no) / all), t('vehicle.stats.ofSide', { pct: num((100 * no) / all, 0), n: all })];
                })}
                max={100}
              />
            </>
          )}
          {killing.n > 0 && (
            <div className="vehicle-counts">
              {t('vehicle.stats.killing', {
                n: killing.n,
                share: killing.share === null ? '-' : num(killing.share * 100, 0),
                toDeath: killing.toDeath === null ? '-' : num(killing.toDeath, 1),
                modules: killing.modules,
              })}
            </div>
          )}
        </Section>
      )}
      <HitBreakdown view={view} />
      {directed > 0 && (
        <Section title={t('vehicle.sectors.title')} defaultOpen>
          <div className="hint">{t('vehicle.sectors.hint')}</div>
          <Bars rows={SECTORS.map((k) => [t(`vehicle.sector.${k}`), sectors.get(k) ?? 0])} />
        </Section>
      )}
      {regions.size > 0 && (
        <Section title={t('vehicle.regions.title')} defaultOpen>
          <Bars rows={REGIONS.map((r) => [t(`vehicle.region.${r}`), regions.get(r) ?? 0])} />
        </Section>
      )}
      {modules.length > 0 && (
        <Section title={t('vehicle.modules.title')} defaultOpen>
          <div className="hint">{t('vehicle.modules.hint')}</div>
          <Bars rows={modules.slice(0, 20).map(([k, n]) => [t('vehicle.modules.part', { part: k }), n])} />
        </Section>
      )}

      <Section title={t('vehicle.filter.title')} defaultOpen={false}>
        <FilterList title={t('vehicle.filter.matches')} items={matches} picked={s.matches} onToggle={(v) => s.toggle('matches', v, matches.map(([k]) => k))} onAll={() => s.patch({ matches: null })} />
        <FilterList title={t('vehicle.filter.shooters')} items={shooters} picked={s.shooters} onToggle={(v) => s.toggle('shooters', v, shooters.map(([k]) => k))} onAll={() => s.patch({ shooters: null })} />
        <FilterList title={t('vehicle.filter.weapons')} items={weapons} picked={s.weapons} onToggle={(v) => s.toggle('weapons', v, weapons.map(([k]) => k))} onAll={() => s.patch({ weapons: null })} />
      </Section>
    </div>
  );
}

/** Labelled bars: a value each, against the largest (or `max`), its own text or the count beside it. */
function Bars({ rows, max }: { rows: ([string, number] | [string, number, string])[]; max?: number }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="vehicle-bars">
      {rows.map(([label, n, text]) => (
        <div key={label} className="vehicle-bar" title={text}>
          <span className="vehicle-bar-label">{label}</span>
          <span className="vehicle-bar-track">
            <i style={{ width: `${(100 * n) / top}%` }} />
          </span>
          <span className="vehicle-bar-n">{text ?? int(n)}</span>
        </div>
      ))}
    </div>
  );
}

function FilterList({ title, items, picked, onToggle, onAll }: { title: string; items: [string, number][]; picked: string[] | null; onToggle: (v: string) => void; onAll: () => void }) {
  if (items.length < 2) return null;
  const on = picked ? new Set(picked) : null;
  return (
    <div className="vehicle-filter">
      <div className="vehicle-filter-head">
        <span>{title}</span>
        {picked && (
          <button className="link" onClick={onAll}>
            {t('vehicle.filter.all')}
          </button>
        )}
      </div>
      <div className="vehicle-filter-items">
        {items.slice(0, 40).map(([k, n]) => (
          <label key={k} className="check">
            <input type="checkbox" checked={!on || on.has(k)} onChange={() => onToggle(k)} />
            <span className="vehicle-filter-name">{k}</span> <span className="vehicle-filter-n">{int(n)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
