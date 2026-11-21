import { useStore } from '../state/store';
import { useRaceStore } from '../state/raceStore';
import { useEngine } from './EngineContext';
import { t, useLang } from '../i18n';

/**
 * Says so while the view is a parallel projection, with the way back.
 *
 * "Look straight down", the isometric and the elevation presets all switch to
 * a parallel projection, as those views mean nothing in perspective. The switch
 * was silent: the wheel turned into a zoom, distances stopped shrinking, the
 * fly-speed readout vanished, and the projection stayed on across tabs with
 * nothing on screen to say why. The badge sits where that readout was, bottom
 * right, and its button returns to the 3D view (and the perspective pose the
 * view left).
 */
export function ProjectionBadge() {
  useLang();
  const engine = useEngine();
  const parallel = useStore((s) => s.camera.projection === 'orthographic');
  const vehicle = useRaceStore((s) => s.tab === 'vehicle');
  if (!parallel || vehicle) return null;
  return (
    <div className="projection-badge" role="status" data-testid="projection-badge">
      <span title={t('shell.projection.parallelTitle')}>{t('shell.projection.parallel')}</span>
      <button type="button" onClick={() => engine?.setProjection('perspective')}>
        {t('shell.projection.back')}
      </button>
    </div>
  );
}
