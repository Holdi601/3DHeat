import { useMemo } from 'react';
import { Section, Segmented } from '../controls';
import { useVehicleStore } from '../../state/vehicleStore';
import { drawFrom, useVolumeStore } from '../../volumes/store';
import { countsByVolume, placeless, type AreaParty } from '../../vehicle/area';
import { weaponOf, type VehicleHit } from '../../vehicle/hits';
import type { VehicleView } from '../../vehicle/view';
import type { Dataset } from '../../state/types';
import { int, num, t } from '../../i18n';
import { lengthText } from '../../state/unitsStore';

/**
 * The hit analysis restricted to areas of the level: the volumes drawn on
 * the 3D ground or the tactical map (`volumes/`), a chip for each with how
 * many of the vehicle's hits had their victim - or shooter - in it, the
 * count the filter leaves, and a way to draw one and to reset them all.
 */
export function HitArea({ dataset, view }: { dataset: Dataset; view: VehicleView }) {
  const s = useVehicleStore();
  const volumes = useVolumeStore((v) => v.volumes);
  const filter = useVolumeStore((v) => v.filter);
  const set = view.set;
  const shown = useMemo(() => volumes.filter((v) => v.visible), [volumes]);
  const counts = useMemo(() => (set && shown.length ? countsByVolume(dataset, set, view.beforeArea, shown, s.areaBy) : new Map<string, number>()), [dataset, set, view.beforeArea, shown, s.areaBy]);
  const noPlace = useMemo(() => (set && shown.length ? placeless(dataset, set, view.beforeArea, s.areaBy) : 0), [dataset, set, view.beforeArea, shown, s.areaBy]);
  if (!set) return null;
  const parties: { value: AreaParty; label: string; title: string }[] = [
    { value: 'victim', label: t('vehicle.area.victim'), title: t('vehicle.area.victimTitle') },
    { value: 'shooter', label: t('vehicle.area.shooter'), title: t('vehicle.area.shooterTitle') },
  ];
  return (
    <Section title={t('vehicle.area.title')} defaultOpen>
      {!shown.length && <div className="hint">{t('vehicle.area.hint')}</div>}
      <div className="vehicle-area-draw">
        <button className="small" onClick={() => drawFrom('box')}>
          {t('vehicle.area.box')}
        </button>
        <button className="small" onClick={() => drawFrom('polygon')}>
          {t('vehicle.area.polygon')}
        </button>
      </div>
      {shown.length > 0 && (
        <>
          <div style={{ marginTop: 8 }}>
            <Segmented value={s.areaBy} options={parties} onChange={(areaBy) => s.patch({ areaBy })} />
          </div>
          <div className="vehicle-chips vehicle-area-chips">
            {shown.map((v) => (
              <span key={v.id} className={`vehicle-area-chip${v.op === 'exclude' ? ' exclude' : ''}`} title={v.op === 'exclude' ? t('vehicle.area.excludeTitle') : undefined}>
                <i style={{ background: v.color }} />
                {v.name} <span className="vehicle-filter-n">{int(counts.get(v.id) ?? 0)}</span>
                <button className="link" title={t('vehicle.area.remove')} onClick={() => useVolumeStore.getState().remove(v.id)}>
                  ×
                </button>
              </span>
            ))}
          </div>
          {filter === 'off' ? (
            <div className="hint">
              {t('vehicle.area.off')}{' '}
              <button className="link" onClick={() => useVolumeStore.getState().setFilter('inside')}>
                {t('vehicle.area.use')}
              </button>
            </div>
          ) : (
            <div className="vehicle-counts">
              {t(filter === 'outside' ? 'vehicle.area.countsOutside' : 'vehicle.area.counts', { n: view.all.length, total: view.beforeArea.length })}
            </div>
          )}
          {filter !== 'off' && noPlace > 0 && <div className="hint">{t('vehicle.area.noPlace', { n: noPlace })}</div>}
          <button className="vehicle-sheet-btn" onClick={() => useVolumeStore.getState().clear()}>
            {t('vehicle.area.reset')}
          </button>
        </>
      )}
    </Section>
  );
}

type Key = 'shooter' | 'weapon' | 'shooterVehicle';
const KEY_OF: Record<Key, (h: VehicleHit) => string> = {
  shooter: (h) => h.shooter,
  weapon: weaponOf,
  shooterVehicle: (h) => h.shooterVehicle,
};

/**
 * Who hit the vehicle, with what and how hard: the hits grouped by shooter,
 * weapon (an ability, a damage type) or the shooter's vehicle, each with its
 * count, the damage it did and its kills; and how far the shots came from.
 * What the hits say where the data gives no point on the unit (Arma, Dota 2,
 * Tacview without weapons), and beside the figure everywhere else.
 */
export function HitBreakdown({ view }: { view: VehicleView }) {
  const by = useVehicleStore((s) => s.breakdown);
  const patch = useVehicleStore((s) => s.patch);
  const hits = view.hits;
  const rows = useMemo(() => {
    const m = new Map<string, { n: number; damage: number; known: number; kills: number }>();
    for (const h of hits) {
      if (h.kind !== 'hit') continue;
      const k = KEY_OF[by](h);
      let r = m.get(k);
      if (!r) m.set(k, (r = { n: 0, damage: 0, known: 0, kills: 0 }));
      r.n++;
      if (h.damage !== null) {
        r.damage += h.damage;
        r.known++;
      }
      if (h.killingShot) r.kills++;
    }
    return [...m.entries()].sort((a, b) => b[1].damage - a[1].damage || b[1].n - a[1].n);
  }, [hits, by]);
  const distance = useMemo(() => {
    const ds = hits.map((h) => h.distance).filter((v): v is number => v !== null && Number.isFinite(v)).sort((a, b) => a - b);
    return ds.length ? { median: ds[ds.length >> 1], max: ds[ds.length - 1], n: ds.length } : null;
  }, [hits]);
  if (!rows.length) return null;
  const anyDamage = rows.some(([, r]) => r.known > 0);
  const anyKill = rows.some(([, r]) => r.kills > 0);
  const options: { value: Key; label: string }[] = [
    { value: 'shooter', label: t('vehicle.breakdown.shooter') },
    { value: 'weapon', label: t('vehicle.breakdown.weapon') },
    { value: 'shooterVehicle', label: t('vehicle.breakdown.shooterVehicle') },
  ];
  return (
    <Section title={t('vehicle.breakdown.title')} defaultOpen={!view.anyPoint}>
      <Segmented value={by} options={options} onChange={(breakdown) => patch({ breakdown })} />
      <table className="vehicle-breakdown">
        <thead>
          <tr>
            <th />
            <th>{t('vehicle.breakdown.hits')}</th>
            {anyDamage && <th>{t('vehicle.breakdown.damage')}</th>}
            {anyKill && <th>{t('vehicle.breakdown.kills')}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 30).map(([k, r]) => (
            <tr key={k}>
              <td className="vehicle-filter-name" title={k}>
                {k || t('vehicle.breakdown.unknown')}
              </td>
              <td>{int(r.n)}</td>
              {anyDamage && <td>{r.known ? num(r.damage, 0) : '-'}</td>}
              {anyKill && <td>{r.kills ? int(r.kills) : ''}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {distance && <div className="hint">{t('vehicle.breakdown.distance', { median: lengthText(distance.median, () => 0), max: lengthText(distance.max, () => 0), n: distance.n })}</div>}
    </Section>
  );
}
