/**
 * The status line of heat drawn from tiles (`render/heatTiles/tileHeat.ts`),
 * over the view where the level chip sits: that the heat is from tiles, the
 * level drawn, how far a build is, and Stop. Also where a session member
 * starts following the host's tile heat, since this is mounted with the view.
 */

import { useEffect } from 'react';
import { formatCount } from '../../data/synth';
import { int, t, useLang } from '../../i18n';
import { followSessionTiles, stopTileHeat, useTileHeat, useTileHeatShare } from '../../render/heatTiles/tileHeat';
import { session } from '../../session/client';
import { useSessionStore } from '../../session/store';
import { useEngine } from '../EngineContext';

export function TileHeatStatus() {
  useLang();
  const engine = useEngine();
  const on = useTileHeat((s) => s.on);
  const from = useTileHeat((s) => s.from);
  const level = useTileHeat((s) => s.level);
  const leaf = useTileHeat((s) => s.leaf);
  const rows = useTileHeat((s) => s.rows);
  const fraction = useTileHeat((s) => s.fraction);
  const complete = useTileHeat((s) => s.complete);
  const error = useTileHeat((s) => s.error);
  const doc = useTileHeatShare((s) => s.doc);
  const joined = useSessionStore((s) => s.state === 'joined');

  // A member: the host's tile heat, by its key through the session's gateway.
  useEffect(() => {
    if (!engine) return;
    const url = session.serverUrl();
    const at = joined && url ? { origin: new URL(url, location.href).origin.replace(/^ws/, 'http'), token: session.token() } : null;
    void followSessionTiles(engine, doc, at);
  }, [engine, doc, joined]);

  if (!on) return null;
  const parts = [
    level >= 0 ? t('app.tileHeat.level', { level: int(level), leaf: int(leaf) }) : t('app.tileHeat.waiting'),
    rows > 0 ? t('app.tileHeat.rows', { rows: formatCount(rows) }) : null,
    !complete && !error ? t('app.tileHeat.building', { percent: int(Math.round(fraction * 100)) }) : null,
    from === 'session' ? t('app.tileHeat.host') : null,
  ].filter(Boolean);
  return (
    <div className="auto-level tile-heat-status" data-testid="tile-heat-status" title={t('app.tileHeat.about')}>
      {t('app.tileHeat.tiles')}
      {', '}
      {parts.join(' · ')}
      {error ? <span className="err">{` · ${error}`}</span> : null}
      {from === 'files' && (
        <>
          {' · '}
          <button type="button" className="link" onClick={() => stopTileHeat()}>
            {t('app.tileHeat.stop')}
          </button>
        </>
      )}
    </div>
  );
}
