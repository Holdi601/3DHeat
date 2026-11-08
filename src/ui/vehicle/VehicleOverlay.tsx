import { useStore } from '../../state/store';
import { useVehicleStore } from '../../state/vehicleStore';
import { vehicleView } from '../../vehicle/view';
import { categoryColours } from '../../vehicle/scene';
import { stopToCss } from '../../render/colors';
import { rgbCss } from '../../race/geometry';
import { int, t } from '../../i18n';
import { VehicleSheet } from './VehicleSheet';

/**
 * Over the vehicle heatmap's view: the vehicle and how many hits are on it,
 * the colour ramp from none to the most, the colours of the points when they
 * are coloured by something, and the flat sheet when it is open.
 */
export function VehicleOverlay() {
  const dataset = useStore((s) => s.dataset);
  const scheme = useStore((s) => s.heat.scheme);
  const s = useVehicleStore();
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
        <div className="vehicle-ramp" style={{ background: `${gradient}, #2a2d31` }} />
        <div className="vehicle-ramp-ends">
          <span>{t('vehicle.hud.few')}</span>
          <span>{t('vehicle.hud.many')}</span>
        </div>
        {legend.length > 0 && (
          <div className="vehicle-legend">
            {legend.map(([k, c]) => (
              <div key={k}>
                <i style={{ background: rgbCss(c) }} />
                {k}
              </div>
            ))}
          </div>
        )}
        {view.hits.length === 0 && <div className="vehicle-hud-sub">{t('vehicle.hud.none', { n: int(view.all.length) })}</div>}
      </div>
      {s.sheetOpen && <VehicleSheet />}
    </>
  );
}
