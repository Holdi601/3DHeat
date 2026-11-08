import { useEffect, useRef, useState } from 'react';
import { formatBytes } from '../../data/memory';
import { modelLoader, type LoadedModel } from '../../data/modelLoader';
import { say } from '../../data/msg';
import { formatTriangles } from '../../data/simplify';
import { int, num, t } from '../../i18n';
import type { ModelLevel } from '../../render/level';
import { useStore } from '../../state/store';
import type { AxisMapping, GeoPlacement } from '../../state/types';
import type { BackdropRequest, BackdropResult } from '../../world/backdrop';
import { backdropLoader } from '../../world/backdropLoader';
import { clearCache } from '../../world/cache';
import type { WorldLabel } from '../../world/backdrop';
import { dcsGroundFrom, type DcsGroundData } from '../../world/dcsGround';
import { DCS_PROJECTIONS, fromDcs } from '../../world/dcsProjection';
import { THEATRES, theatreById, theatreGeo, theatreOfData, theatreOfDcsFolder, type Theatre } from '../../world/theatres';
import { boxAround } from '../../world/tiles';
import { Check } from '../controls';
import { useEngine } from '../EngineContext';
import { dataToWorld } from '../../render/pose';
import { worldStreamer } from '../../world/stream';
import { boxCentre, dataOfEastNorth, geoBoxOf, knownProjection, planeForward } from '../../world/tiles';

/**
 * A theatre built with no data loaded is put into the world the way a Tacview
 * recording is: x east, north away from the viewer (world -Z), height up.
 */
const THEATRE_AXES: AxisMapping = { up: 'z', flipX: false, flipY: true, flipZ: false, scale: 1 };

/** Sizes offered for the detailed area, kilometres on a side. */
const SIZES = [25, 50, 100, 200, 400];

type Detail = 'data' | 'point' | 'none';

/** What the DCS converter writes beside its level (exporters/ext/dcs-maps, `<name>.json`); only what is read here. */
interface DcsLevelMeta {
  theatre: string;
  level?: string;
  towns?: Array<{ name: string; x?: number; z?: number; ground?: number | null }>;
  airfields?: Array<{ name: string; x: number; z: number; ground?: number | null }>;
}

/** The DCS level's place names, in its own metres (x north, y up, z east): the game's towns and airfields. */
export function dcsLabels(meta: DcsLevelMeta): WorldLabel[] {
  const out: WorldLabel[] = [];
  for (const tw of meta.towns ?? [])
    if (typeof tw.x === 'number' && typeof tw.z === 'number') out.push({ text: tw.name, kind: 'town', x: tw.x, y: (tw.ground ?? 0) + 30, z: tw.z });
  for (const a of meta.airfields ?? []) out.push({ text: a.name, kind: 'airfield', x: a.x, y: (a.ground ?? 0) + 30, z: a.z });
  return out;
}

const gameLabel = (th: Theatre) => (th.game === 'dcs' ? t('heat.world.theatre.groupDcs') : t('heat.world.theatre.groupIl2'));

/**
 * With no data to look at, the camera over a theatre's detailed area: 25 km
 * up and 50 km south of it, looking at it.
 */
export function cameraOverTheatre(engine: NonNullable<ReturnType<typeof useEngine>>, placement: GeoPlacement, theatre: Theatre): void {
  const [e, n] = planeForward(placement.geo)(theatre.detail.lat, theatre.detail.lon);
  const at = dataToWorld(dataOfEastNorth(placement.geo, e, n, 0), placement.axes);
  const from = dataToWorld(dataOfEastNorth(placement.geo, e, n - 50_000, 25_000), placement.axes);
  const f = { x: at.x - from.x, y: at.y - from.y, z: at.z - from.z };
  const l = Math.hypot(f.x, f.y, f.z);
  engine.setCameraPose(from, { x: f.x / l, y: f.y / l, z: f.z / l });
}

/**
 * The world backdrop's part of the level panel: the real place under a
 * recording that says where it is, and a picker of known real-world theatres
 * (DCS terrains, IL-2 maps) built coarsely as a whole and finely in a chosen
 * area. The build runs in a worker; see src/world and docs/world-backdrop.md.
 */
export function WorldBackdrop({
  busy,
  toLevel,
  fromModel,
  setError,
  setNote,
}: {
  busy: boolean;
  toLevel: (name: string, r: BackdropResult, placement: GeoPlacement) => ModelLevel;
  /** A loaded model (the DCS level) as a world backdrop level. */
  fromModel: (name: string, m: LoadedModel, placement: GeoPlacement) => ModelLevel;
  setError: (e: string | null) => void;
  setNote: (n: string | null) => void;
}) {
  const dataset = useStore((s) => s.dataset);
  const setLevel = useStore((s) => s.setLevel);
  const geo = dataset?.geo;
  const [world, setWorld] = useState<{ label: string; fraction: number | null } | null>(null);
  const [theatreId, setTheatreId] = useState<string>(() => (geo ? (theatreOfData(geo, dataset?.bounds, dataset?.axes)?.id ?? '') : ''));
  const [detail, setDetail] = useState<Detail>(geo ? 'data' : 'point');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [size, setSize] = useState(50);
  const [runways, setRunways] = useState(true);
  const [imagery, setImagery] = useState(false);
  /** The real world streamed over the game's terrain; off by default on a historical theatre. */
  const [gameDetail, setGameDetail] = useState(true);
  const dcsInput = useRef<HTMLInputElement>(null);
  const engine = useEngine();
  /** The streamer's counts, read once a second while a theatre streams. */
  const [streamStats, setStreamStats] = useState<typeof worldStreamer.stats | null>(null);
  const streaming = useStore((s) => s.level?.kind === 'model' && !!s.level.stream);
  useEffect(() => {
    if (!streaming) {
      setStreamStats(null);
      return;
    }
    const timer = window.setInterval(() => setStreamStats({ ...worldStreamer.stats }), 1000);
    return () => window.clearInterval(timer);
  }, [streaming]);
  const theatre = theatreById(theatreId);

  // A newly loaded recording picks its theatre, and the area under it.
  useEffect(() => {
    if (!geo) return;
    const th = theatreOfData(geo, dataset?.bounds, dataset?.axes);
    if (th) setTheatreId(th.id);
    setDetail('data');
  }, [geo]);
  useEffect(() => {
    if (!theatre) return;
    setLat(String(theatre.detail.lat));
    setLon(String(theatre.detail.lon));
    setGameDetail(!theatre.historical);
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
    void centre;
    void run(req, name);
  };

  /**
   * A theatre streamed round the camera: an empty level that carries the
   * look, the place on the earth and the credits; its ground comes as tiles
   * (src/world/stream, driven from WorldOverlay).
   */
  const streamTheatre = (game?: { th: Theatre; dcs: DcsGroundData; labels: WorldLabel[]; name: string; centre: { lat: number; lon: number } }) => {
    const theatre = game?.th ?? theatreById(theatreId);
    if (!theatre) return;
    const placement: GeoPlacement = { geo: geo ?? theatreGeo(theatre), axes: geo ? (dataset?.axes ?? null) : THEATRE_AXES };
    const fwd = planeForward(placement.geo);
    // Bounds that reach well past the theatre, for the camera's far plane.
    const pts = [
      [theatre.box.south, theatre.box.west],
      [theatre.box.north, theatre.box.east],
    ].map(([la, lo]) => fwd(la, lo));
    const reach = 1_500_000;
    const lo = dataToWorld(dataOfEastNorth(placement.geo, Math.min(pts[0][0], pts[1][0]) - reach, Math.min(pts[0][1], pts[1][1]) - reach, -100), placement.axes);
    const hi = dataToWorld(dataOfEastNorth(placement.geo, Math.max(pts[0][0], pts[1][0]) + reach, Math.max(pts[0][1], pts[1][1]) + reach, 4000), placement.axes);
    const bounds = {
      minX: Math.min(lo.x, hi.x),
      maxX: Math.max(lo.x, hi.x),
      minY: Math.min(lo.y, hi.y),
      maxY: Math.max(lo.y, hi.y),
      minZ: Math.min(lo.z, hi.z),
      maxZ: Math.max(lo.z, hi.z),
    };
    const empty: BackdropResult = {
      mesh: {
        vertices: new Float32Array(0),
        colours: new Float32Array(0),
        indices: new Uint32Array(0),
        structureIndices: new Uint32Array(0),
        structureEdges: new Uint32Array(0),
        waterIndices: new Uint32Array(0),
        partNames: [],
        partRuns: { ground: new Uint32Array(0), structure: new Uint32Array(0), water: new Uint32Array(0) },
        bounds,
        groundBand: { minY: lo.y < hi.y ? lo.y : hi.y, maxY: lo.y < hi.y ? hi.y : lo.y },
      },
      labels: [],
      credits: [],
      stats: {} as BackdropResult['stats'],
      notes: [],
    };
    const lv = toLevel(game?.name ?? t('heat.world.stream.name', { game: gameLabel(theatre), theatre: theatre.name }), empty, placement);
    if (!game) {
      setError(null);
      setNote(null);
    }
    // The game's place names, from its metres to this plane.
    const proj = game ? DCS_PROJECTIONS[game.dcs.theatre] : null;
    const toPlane = planeForward(placement.geo);
    const labels =
      game && proj
        ? game.labels.map((l) => {
            const [la, lo] = fromDcs(proj, l.x, l.z);
            const [e, n] = toPlane(la, lo);
            return { ...l, ...dataToWorld(dataOfEastNorth(placement.geo, e, n, l.y), placement.axes) };
          })
        : lv.labels;
    setLevel({ ...lv, labels, stream: { theatre: theatre.id, imagery, runways, ...(game ? { dcs: game.dcs } : {}) }, showTexture: imagery });
    if (!geo && engine) cameraOverTheatre(engine, placement, game ? { ...theatre, detail: game.centre } : theatre);
  };

  /**
   * The DCS converter's level (its .glb and .json): the game's own terrain.
   * Alone, it is the level, moved under the data; with the real world on top
   * it is the ground the streamed tiles are draped on and judged against
   * (src/world/dcsGround).
   */
  const openDcs = async (files: File[]) => {
    setError(null);
    setNote(null);
    const glb = files.find((f) => /[.](glb|gltf)$/i.test(f.name));
    const json = files.find((f) => /[.]json$/i.test(f.name));
    if (!glb || !json) {
      setError(t('heat.world.dcs.needJson'));
      return;
    }
    let meta: DcsLevelMeta;
    try {
      meta = JSON.parse(await json.text()) as DcsLevelMeta;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return;
    }
    const proj = DCS_PROJECTIONS[meta.theatre];
    const th = theatreOfDcsFolder(meta.theatre);
    if (!proj || !th) {
      setError(t('heat.world.dcs.unknown', { theatre: String(meta.theatre) }));
      return;
    }
    if (th.id !== theatreId) setTheatreId(th.id);
    const dataTheatre = geo ? theatreOfData(geo, dataset?.bounds, dataset?.axes) : undefined;
    setWorld({ label: t('heat.levelPanel.reading'), fraction: null });
    try {
      const m = await modelLoader.load(glb, Infinity, (p) => setWorld({ label: p.label, fraction: p.fraction }));
      const name = t('heat.world.dcs.name', { theatre: th.name, level: meta.level ?? glb.name });
      const labels = dcsLabels(meta);
      const b = m.bounds;
      const [cLat, cLon] = fromDcs(proj, (b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2);
      if (gameDetail) {
        const dcs = dcsGroundFrom(meta.theatre, m.vertices, m.colours, m.indices, m.waterIndices);
        streamTheatre({ th, dcs, labels, name, centre: { lat: cLat, lon: cLon } });
      } else {
        const placement: GeoPlacement = { geo: { lat0: th.origin.lat, lon0: th.origin.lon, projection: 'dcs-tm', theatre: meta.theatre }, axes: null };
        setLevel({ ...fromModel(name, m, placement), labels });
      }
      setNote(
        [
          t('heat.world.dcs.loaded', {
            theatre: th.name,
            triangles: formatTriangles(m.triangles + m.waterTriangles),
            towns: int(meta.towns?.length ?? 0),
            airfields: int(meta.airfields?.length ?? 0),
          }),
          ...(dataTheatre && dataTheatre.id !== th.id ? [t('heat.world.dcs.otherTheatre', { level: th.name, data: dataTheatre.name })] : []),
        ].join(' '),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setWorld(null);
    }
  };

  /** Imagery on or off for the streamed theatre shown now: its tiles are built again (from the cache). */
  const switchImagery = (v: boolean) => {
    setImagery(v);
    const lv = useStore.getState().level;
    if (lv?.kind === 'model' && lv.stream) setLevel({ ...lv, stream: { ...lv.stream, imagery: v }, showTexture: v });
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
  // Where the converter should cut the game's terrain: the middle of the data, else the theatre's detailed area.
  let around = theatre?.detail ?? { lat: 0, lon: 0 };
  if (dataset && geo && knownProjection(geo) && Number.isFinite(dataset.bounds.minX)) {
    try {
      around = boxCentre(geoBoxOf(geo, dataset.bounds, dataset.axes ?? null, 0));
    } catch {
      // The theatre's area stands.
    }
  }
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
            <button disabled={busy || !!world} onClick={() => streamTheatre()} title={t('heat.world.stream.buttonTitle')}>
              {t('heat.world.stream.button')}
            </button>
            <button disabled={busy || !!world} onClick={buildTheatre} title={t('heat.world.theatre.buildTitle')}>
              {t('heat.world.theatre.build')}
            </button>
          </div>
          {streamStats && (
            <div className="hint">
              {t('heat.world.stream.status', {
                drawn: int(streamStats.drawn),
                loading: int(streamStats.loading),
                kept: int(streamStats.kept),
                size: formatBytes(streamStats.bytes),
                downloaded: formatBytes(streamStats.downloaded),
              })}
              {streamStats.dcsReal + streamStats.dcsGame > 0 &&
                ` ${t('heat.world.dcs.status', { real: int(streamStats.dcsReal), game: int(streamStats.dcsGame), shift: num(streamStats.dcsShift, 0) })}`}
            </div>
          )}
          {theatre.game === 'dcs' && (
            <>
              <div className="label">
                <span>{t('heat.world.dcs.label')}</span>
              </div>
              <div className="row">
                <button disabled={busy || !!world} onClick={() => dcsInput.current?.click()} title={t('heat.world.dcs.openTitle')}>
                  {t('heat.world.dcs.open')}
                </button>
              </div>
              <input
                ref={dcsInput}
                type="file"
                accept=".glb,.json"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = [...(e.target.files ?? [])];
                  e.target.value = '';
                  if (files.length) void openDcs(files);
                }}
              />
              <Check label={t('heat.world.dcs.detail')} title={t('heat.world.dcs.detailTitle')} checked={gameDetail} onChange={setGameDetail} />
              <div className="hint">
                {t('heat.world.dcs.hint', { folder: theatre.id, lat: num(around.lat, 2), lon: num(around.lon, 2) })}
              </div>
            </>
          )}
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
          {theatre && <Check label={t('heat.world.imagery')} title={t('heat.world.imageryTitle')} checked={imagery} onChange={switchImagery} />}
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
