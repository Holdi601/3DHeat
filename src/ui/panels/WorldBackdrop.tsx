import { useEffect, useState } from 'react';
import { formatBytes } from '../../data/memory';
import { say } from '../../data/msg';
import { formatTriangles } from '../../data/simplify';
import { int, num, t } from '../../i18n';
import type { ModelLevel } from '../../render/level';
import { useStore } from '../../state/store';
import type { AxisMapping, GeoPlacement } from '../../state/types';
import type { BackdropRequest, BackdropResult } from '../../world/backdrop';
import { backdropLoader } from '../../world/backdropLoader';
import { clearCache } from '../../world/cache';
import { THEATRES, theatreAt, theatreById, theatreGeo, type Theatre } from '../../world/theatres';
import { boxAround } from '../../world/tiles';
import { Check } from '../controls';

/**
 * A theatre built with no data loaded is put into the world the way a Tacview
 * recording is: x east, north away from the viewer (world -Z), height up.
 */
const THEATRE_AXES: AxisMapping = { up: 'z', flipX: false, flipY: true, flipZ: false, scale: 1 };

/** Sizes offered for the detailed area, kilometres on a side. */
const SIZES = [25, 50, 100, 200, 400];

type Detail = 'data' | 'point' | 'none';

const gameLabel = (th: Theatre) => (th.game === 'dcs' ? t('heat.world.theatre.groupDcs') : t('heat.world.theatre.groupIl2'));

/**
 * The world backdrop's part of the level panel: the real place under a
 * recording that says where it is, and a picker of known real-world theatres
 * (DCS terrains, IL-2 maps) built coarsely as a whole and finely in a chosen
 * area. The build runs in a worker; see src/world and docs/world-backdrop.md.
 */
export function WorldBackdrop({
  busy,
  toLevel,
  setError,
  setNote,
}: {
  busy: boolean;
  toLevel: (name: string, r: BackdropResult, placement: GeoPlacement) => ModelLevel;
  setError: (e: string | null) => void;
  setNote: (n: string | null) => void;
}) {
  const dataset = useStore((s) => s.dataset);
  const setLevel = useStore((s) => s.setLevel);
  const geo = dataset?.geo;
  const [world, setWorld] = useState<{ label: string; fraction: number | null } | null>(null);
  const [theatreId, setTheatreId] = useState<string>(() => (geo ? (theatreAt(geo.lat0, geo.lon0)?.id ?? '') : ''));
  const [detail, setDetail] = useState<Detail>(geo ? 'data' : 'point');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [size, setSize] = useState(50);
  const [runways, setRunways] = useState(true);
  const [follow, setFollow] = useState(true);
  const theatre = theatreById(theatreId);

  // A newly loaded recording picks its theatre, and the area under it.
  useEffect(() => {
    if (!geo) return;
    const th = theatreAt(geo.lat0, geo.lon0);
    if (th) setTheatreId(th.id);
    setDetail('data');
  }, [geo]);
  useEffect(() => {
    if (!theatre) return;
    setLat(String(theatre.detail.lat));
    setLon(String(theatre.detail.lon));
  }, [theatre]);
  useEffect(() => {
    if (!geo && detail === 'data') setDetail('point');
  }, [geo, detail]);

  const run = async (req: BackdropRequest, name: string, stream?: ModelLevel['stream']) => {
    setError(null);
    setNote(null);
    setWorld({ label: t('heat.world.starting'), fraction: 0 });
    try {
      const r = await backdropLoader.build(req, (label, fraction) => setWorld({ label, fraction }));
      const lv = toLevel(name, r, { geo: req.geo, axes: req.axes });
      setLevel(stream ? { ...lv, stream } : lv);
      const s = r.stats;
      setNote(
        [
          t('heat.world.built', {
            terrain: formatTriangles(r.mesh.indices.length / 3),
            spacing: num(s.terrainSpacing, 0),
            buildings: int(s.buildings),
            roads: int(s.roads),
            downloaded: int(s.downloaded),
            cached: int(s.fromCache),
            size: formatBytes(s.bytes),
          }),
          ...(s.context ? [t('heat.world.builtContext', { spacing: num(s.context.terrainSpacing, 0) })] : []),
          ...(req.runways ? [t('heat.world.builtRunways', { count: int(s.runways) })] : []),
          ...r.notes.map((n) => say(n)),
        ].join(' '),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setWorld(null);
    }
  };

  const buildUnderData = () => {
    if (!dataset || !geo) return;
    void run(
      { geo, bounds: dataset.bounds, axes: dataset.axes ?? null, runways },
      t('heat.world.name', { lat: num(geo.lat0, 3), lon: num(geo.lon0, 3) }),
    );
  };

  const buildTheatre = () => {
    if (!theatre) return;
    const req: BackdropRequest = {
      // On the data's plane when there is data, so it lands under it as built.
      geo: geo ?? theatreGeo(theatre),
      axes: geo ? (dataset?.axes ?? null) : THEATRE_AXES,
      context: theatre.box,
      runways,
    };
    let name = t('heat.world.theatreName', { game: gameLabel(theatre), theatre: theatre.name });
    let centre = theatre.detail;
    if (detail === 'data' && dataset && geo) req.bounds = dataset.bounds;
    else if (detail === 'point') {
      const la = Number(lat.replace(',', '.'));
      const lo = Number(lon.replace(',', '.'));
      if (!Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 85 || Math.abs(lo) > 180 || !lat.trim() || !lon.trim()) {
        setError(t('heat.world.detail.invalid'));
        return;
      }
      req.box = boxAround(la, lo, size);
      centre = { lat: la, lon: lo };
      name = t('heat.world.theatreNameAt', { game: gameLabel(theatre), theatre: theatre.name, lat: num(la, 2), lon: num(lo, 2) });
    }
    // A theatre follows the camera from here on, unless asked not to.
    void run(req, name, { theatre: theatre.id, runways, follow, centre, size: req.box ? size : 0 });
  };

  const forgetTiles = async () => {
    try {
      await clearCache();
      setNote(t('heat.world.cacheCleared'));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const box = theatre?.box;
  const plane = geo ?? (theatre ? theatreGeo(theatre) : null);
  return (
    <div className="field">
      {geo && (
        <>
          <div className="row">
            <button disabled={busy || !!world} onClick={buildUnderData} title={t('heat.world.buttonTitle')}>
              {t('heat.world.button')}
            </button>
          </div>
          <div className="hint">{t('heat.world.hint', { lat: num(geo.lat0, 3), lon: num(geo.lon0, 3) })}</div>
        </>
      )}

      <div className="label">
        <span>{t('heat.world.theatre.label')}</span>
      </div>
      <select value={theatreId} onChange={(e) => setTheatreId(e.target.value)} disabled={!!world}>
        <option value="">{t('heat.world.theatre.none')}</option>
        {(['dcs', 'il2'] as const).map((game) => (
          <optgroup key={game} label={game === 'dcs' ? t('heat.world.theatre.groupDcs') : t('heat.world.theatre.groupIl2')}>
            {THEATRES.filter((th) => th.game === game).map((th) => (
              <option key={th.id} value={th.id}>
                {th.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {theatre && box && (
        <>
          <div className="hint">
            {t('heat.world.theatre.box', { south: num(box.south, 1), north: num(box.north, 1), west: num(box.west, 1), east: num(box.east, 1) })}
            {theatre.approx ? ` ${t('heat.world.theatre.approx')}` : ''}
            {theatre.historical ? ` ${t('heat.world.theatre.historical')}` : ''}
          </div>
          <div className="label">
            <span>{t('heat.world.detail.label')}</span>
          </div>
          <select value={detail} onChange={(e) => setDetail(e.target.value as Detail)} disabled={!!world}>
            {geo && <option value="data">{t('heat.world.detail.data')}</option>}
            <option value="point">{t('heat.world.detail.point')}</option>
            <option value="none">{t('heat.world.detail.none')}</option>
          </select>
          {detail === 'point' && (
            <div className="row">
              <label style={{ fontSize: 10, color: 'var(--text-faint)', flex: 1 }}>
                {t('heat.world.detail.lat')}
                <input type="text" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
              </label>
              <label style={{ fontSize: 10, color: 'var(--text-faint)', flex: 1 }}>
                {t('heat.world.detail.lon')}
                <input type="text" inputMode="decimal" value={lon} onChange={(e) => setLon(e.target.value)} />
              </label>
              <label style={{ fontSize: 10, color: 'var(--text-faint)', flex: 1 }}>
                {t('heat.world.detail.size')}
                <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                  {SIZES.map((k) => (
                    <option key={k} value={k}>
                      {t('heat.world.detail.km', { km: int(k) })}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="row">
            <button disabled={busy || !!world} onClick={buildTheatre} title={t('heat.world.theatre.buildTitle')}>
              {t('heat.world.theatre.build')}
            </button>
          </div>
          {plane && (
            <div className="hint">
              {geo
                ? t('heat.world.theatre.hintData', { lat: num(plane.lat0, 3), lon: num(plane.lon0, 3) })
                : t('heat.world.theatre.hintOwn', { lat: num(plane.lat0, 3), lon: num(plane.lon0, 3) })}
            </div>
          )}
        </>
      )}
      {(geo || theatre) && (
        <>
          <Check label={t('heat.world.runways')} title={t('heat.world.runwaysTitle')} checked={runways} onChange={setRunways} />
          {theatre && (
            <Check
              label={t('heat.world.follow')}
              title={t('heat.world.followTitle')}
              checked={follow}
              onChange={(v) => {
                setFollow(v);
                // The backdrop shown takes it at once.
                const lv = useStore.getState().level;
                if (lv?.kind === 'model' && lv.stream) setLevel({ ...lv, stream: { ...lv.stream, follow: v } });
              }}
            />
          )}
          <div className="row">
            <button disabled={!!world} onClick={() => void forgetTiles()} title={t('heat.world.clearCacheTitle')}>
              {t('heat.world.clearCache')}
            </button>
          </div>
        </>
      )}
      {world && (
        <>
          <div className="hint">{t('heat.levelPanel.busy', { label: world.label })}</div>
          <div className="bar">
            <div style={{ width: `${Math.round((world.fraction ?? 1) * 100)}%`, opacity: world.fraction === null ? 0.5 : 1 }} />
          </div>
          <button onClick={() => backdropLoader.cancel()}>{t('heat.levelPanel.cancel')}</button>
        </>
      )}
    </div>
  );
}
