import { useStore } from '../../state/store';
import { useRaceStore } from '../../state/raceStore';
import { useVehicleStore } from '../../state/vehicleStore';
import { vehicleView } from '../../vehicle/view';
import { useVolumeStore } from '../../volumes/store';
import { categoryColours, OUTCOME_COLOURS } from '../../vehicle/scene';
import { sectorOf, weaponOf, type Outcome, type VehicleHit } from '../../vehicle/hits';
import { regionOf } from '../../vehicle/regions';
import { stopToCss } from '../../render/colors';
import { rgbCss } from '../../race/geometry';
import { int, num, t } from '../../i18n';
import { VehicleSheet } from './VehicleSheet';
import { useEngine } from '../EngineContext';
import { flyTo } from '../replay/replayView';
import { unitsPerMetre } from '../replay/replayData';
import type { Dataset } from '../../state/types';

/** mm:ss.s from the start of the recording. */
function clock(s: number): string {
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r < 10 ? '0' : ''}${r.toFixed(1)}`;
}

/**
 * Over the vehicle heatmap's view: the vehicle and how many hits are on it,
 * the colour ramp from none to the most, the colours of the marks (what the
 * hits did, or what they are coloured by), the card of the hit clicked, and
 * the flat sheet when it is open.
 */
export function VehicleOverlay() {
  const dataset = useStore((s) => s.dataset);
  const scheme = useStore((s) => s.heat.scheme);
  const s = useVehicleStore();
  useVolumeStore((v) => v.volumes);
  useVolumeStore((v) => v.filter);
  const view = vehicleView(dataset, s);
  if (!dataset || !view.vehicle) {
    return (
      <div className="empty-state">
        <h2>{t('vehicle.empty.title')}</h2>
        <div>{dataset ? t('vehicle.empty.noHits') : t('vehicle.empty.noData')}</div>
      </div>
    );
  }
  const stops = [...scheme.positive].sort((a, b) => a.pos - b.pos);
  const gradient = `linear-gradient(to right, ${stops.map((st) => `${stopToCss(st)} ${(st.pos * 100).toFixed(1)}%`).join(', ')})`;
  const legend = s.showPoints || s.showArrows ? categoryColours(view.hits, s.colourBy).legend : [];
  return (
    <>
      <div className="vehicle-hud">
        <div className="vehicle-hud-name">{view.vehicle.name}</div>
        <div className="vehicle-hud-sub">
          {t(s.layer === 'modules' ? 'vehicle.hud.modules' : s.layer === 'kills' ? 'vehicle.hud.kills' : 'vehicle.hud.hits', { n: view.hits.length })}
        </div>
        {s.showHeat && (
          <>
            <div className="vehicle-ramp" style={{ background: `${gradient}, #2a2d31` }} />
            <div className="vehicle-ramp-ends">
              <span>{t('vehicle.hud.few')}</span>
              <span>{t('vehicle.hud.many')}</span>
            </div>
          </>
        )}
        {legend.length > 0 && (
          <div className="vehicle-legend">
            {legend.map(([k, c]) => (
              <div key={k}>
                <i style={{ background: rgbCss(c) }} />
                {s.colourBy === 'outcome' ? t(`vehicle.outcome.${k}`) : k}
              </div>
            ))}
          </div>
        )}
        {s.showPoints && view.hits.length > 0 && <div className="vehicle-hud-tip">{t('vehicle.hud.clickTip')}</div>}
        {view.hits.length === 0 && <div className="vehicle-hud-sub">{t('vehicle.hud.none', { n: int(view.all.length) })}</div>}
      </div>
      {s.selected && <HitCard hit={s.selected} dataset={dataset} />}
      {s.sheetOpen && <VehicleSheet />}
    </>
  );
}

/** The hit clicked: when, who and with what, what it did and how it ended, and a way to that moment in the replay. */
function HitCard({ hit, dataset }: { hit: VehicleHit; dataset: Dataset }) {
  const engine = useEngine();
  const start = dataset.timeRange[0];
  const close = () => useVehicleStore.getState().patch({ selected: null });
  const rows: [string, string][] = [
    [t('vehicle.card.time'), clock(hit.time - start)],
    [t('vehicle.card.shooter'), hit.shooter || '-'],
    [t('vehicle.card.weapon'), weaponOf(hit) || '-'],
  ];
  if (hit.damage !== null) rows.push([t('vehicle.card.damage'), num(hit.damage, 0)]);
  if (hit.armorDamage !== null && hit.armorDamage > 0) rows.push([t('vehicle.card.armor'), num(hit.armorDamage, 0)]);
  if (hit.healthAfter !== null) rows.push([t('vehicle.card.health'), num(Math.max(0, hit.healthAfter), 0)]);
  const region = hit.region ? regionOf(hit.region) : null;
  if (region) rows.push([t('vehicle.card.region'), t(`vehicle.region.${region}`)]);
  if (hit.exit) rows.push([t('vehicle.card.path'), t('vehicle.card.pathLength', { m: num(Math.hypot(hit.exit[0] - hit.local![0], hit.exit[1] - hit.local![1], hit.exit[2] - hit.local![2]), 2) })]);
  if (hit.dir) rows.push([t('vehicle.card.from'), t(`vehicle.sector.${sectorOf(hit.dir)}`)]);
  if (hit.modules > 0) rows.push([t('vehicle.card.modules'), int(hit.modules)]);
  if (hit.code) rows.push([t('vehicle.card.code'), hit.code]);
  if (hit.toDeath !== null) rows.push([t('vehicle.card.toDeath'), t('vehicle.card.seconds', { s: num(hit.toDeath, 1) })]);
  if (hit.share !== null) rows.push([t('vehicle.card.share'), `${num(hit.share * 100, 0)} %`]);
  const outcome: Outcome = hit.outcome;
  return (
    <div className="vehicle-card">
      <div className="vehicle-card-head">
        <i style={{ background: rgbCss(OUTCOME_COLOURS[outcome]) }} />
        <strong>{hit.killingShot ? t('vehicle.card.killingShot') : t(`vehicle.outcome.${outcome}`)}</strong>
        <span className="spacer" />
        <button className="link" onClick={close} title={t('vehicle.sheet.close')}>
          ×
        </button>
      </div>
      <div className="vehicle-card-victim">{hit.victim}</div>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <button
        className="primary"
        onClick={() => {
          // The match replay a few seconds before the hit: its round (a CS2 session), playing time, the camera
          // flown to where the row was (the victim's, or the shooter's where the row is theirs).
          const st = useStore.getState();
          const row = hit.row;
          if (dataset.sessionId && row < dataset.count) st.patchTeam({ session: dataset.sessionId[row] });
          st.patchTimeline({ mode: 'play' });
          useRaceStore.getState().setTab('match');
          st.seek(Math.max(start, hit.time - 3));
          if (engine && row < dataset.count) {
            const at = { x: dataset.px[row], y: dataset.py[row], z: dataset.pz[row] };
            setTimeout(() => flyTo(engine, dataset, at, 40 * unitsPerMetre(dataset)), 60);
          }
        }}
      >
        {t('vehicle.card.replay')}
      </button>
    </div>
  );
}
