import { useEffect, useState } from 'react';
import {
  deleteLevel,
  listLevels,
  loadLevel,
  saveImageLevel,
  saveModelLevel,
  storageEstimate,
  type StoredLevelMeta,
} from '../../data/levelLibrary';
import { formatBytes } from '../../data/memory';
import { modelLoader, type LoadedModel } from '../../data/modelLoader';
import { MODEL_EXTENSIONS } from '../../data/modelParse';
import {
  IMPORT_DEFAULT_LOD,
  LOD_TARGETS,
  formatTriangles,
  suggestLod,
  type LodPreset,
} from '../../data/simplify';
import {
  anchorsFromBounds,
  decodeMapImage,
  DEFAULT_WATER_OPACITY,
  mapQuadFromAnchors,
  mapScale,
  reliefDraw,
  structureDraw,
  structuresColoured,
  structuresTextured,
  type MapAnchor,
  type ModelLevel,
} from '../../render/level';
import { useStore } from '../../state/store';
import { dotaLevel } from '../../tactics/dotaMap';
import { Check, Section, Slider } from '../controls';
import { int, num, t } from '../../i18n';
import type { BackdropResult } from '../../world/backdrop';
import type { GeoPlacement } from '../../state/types';
import { cameraOverTheatre, WorldBackdrop } from './WorldBackdrop';
import { useEngine } from '../EngineContext';
import { theatreById } from '../../world/theatres';
import { lengthText, useUnits } from '../../state/unitsStore';
import { useRaceStore } from '../../state/raceStore';
import { useReplayStore } from '../../state/replayStore';
import { buildingsLook } from '../replay/buildings';

/** Longest edge we upload; larger maps are downscaled to fit the GPU. */
const MAX_MAP_EDGE = 8192;

/**
 * Default look for structures: a cyan shell with brighter edges.
 *
 * Transparent, but not *barely* transparent, and that balance changed once heat
 * became correctly hidden behind geometry. At 7% a building blocked the heat
 * behind it while being almost invisible itself, so the heat appeared to vanish
 * for no reason. A quarter-opaque shell reads as a volume — you can see it is a
 * building doing the blocking — while still showing what is happening inside it.
 * The slice tool is the way to look properly inside.
 */
const STRUCTURE_DEFAULTS = {
  structureOpacity: 0.25,
  structureWireOpacity: 0.5,
  structureTint: [0.35, 0.85, 1] as [number, number, number],
  showStructureFaces: true,
  showStructureWire: true,
};

/**
 * Above this many structure triangles the edge overlay is off to begin with.
 *
 * An outline per object is a fine cue for a hundred buildings and useless for a
 * hundred thousand: an exported city at 2.2M triangles draws so many edges that
 * every pixel of the built-up area has one in it, and the whole district reads
 * as flat white. Faces alone still show the volumes. The toggle is right there
 * for anyone who wants the edges back on a smaller area, or after slicing.
 */
const WIRE_OFF_ABOVE_TRIANGLES = 300_000;

/** A simplification preset as the menu names it. */
function lodLabel(lod: LodPreset): string {
  switch (lod) {
    case 'full':
      return t('heat.levelPanel.lod.full');
    case 'high':
      return t('heat.levelPanel.lod.high');
    case 'medium':
      return t('heat.levelPanel.lod.medium');
    case 'low':
      return t('heat.levelPanel.lod.low');
    case 'silhouette':
      return t('heat.levelPanel.lod.silhouette');
  }
}

/** A fraction as a percentage, the way the sliders show it. */
const percent = (v: number, digits = 0) => t('heat.levelPanel.percent', { value: num(v * 100, digits) });

/** Assemble a ModelLevel from what the worker produced. */
function modelLevelFrom(name: string, m: LoadedModel): ModelLevel {
  const dense = (m.structureTriangles ?? 0) > WIRE_OFF_ABOVE_TRIANGLES;
  const textured = !!m.atlas && structuresTextured(m.structureIndices, m.uvs, m.uvTiles);
  // Structures painted per object (an extracted level's own colours): solid in the match replay, as buildings.
  const coloured = structuresColoured(m.structureIndices, m.colours);
  return {
    kind: 'model',
    name,
    vertices: m.vertices,
    colours: m.colours,
    // Off even when the level has colour. The viewer's look is grey map under
    // saturated heat, and a colourful ground competes with the data — so
    // colour is something to reach for when geometry alone will not separate
    // one surface from another, and to switch back off afterwards.
    showColours: false,
    uvs: m.uvs,
    uvTiles: m.uvTiles ?? null,
    tileRects: m.tileRects ?? null,
    atlas: m.atlas,
    // On where it exists: a texture is in the file because it was exported to
    // be seen. See `ModelLevel.showTexture`.
    showTexture: !!(m.uvs && m.atlas),
    indices: m.indices,
    structureIndices: m.structureIndices,
    structureEdges: m.structureEdges,
    waterIndices: m.waterIndices,
    navIndices: m.navIndices,
    triangles: m.triangles,
    structureTriangles: m.structureTriangles,
    waterTriangles: m.waterTriangles,
    sourceTriangles: m.sourceTriangles,
    sourceStructureTriangles: m.sourceStructureTriangles,
    partNames: m.partNames,
    partClasses: m.partClasses,
    partReasons: m.partReasons,
    partRuns: m.partRuns,
    partBounds: m.partBounds,
    bounds: m.bounds,
    // Relief cues scale to the ground's own height range, not the level's: the
    // level's includes every tower on it.
    relief: { lowY: m.groundBand.minY, highY: m.groundBand.maxY },
    opacity: 1,
    desaturate: 1,
    brightness: 0.9,
    wireframe: false,
    // The terrain's triangles on by default, faintly. A traced ground is a
    // smooth shaded surface with nothing on it to judge scale or distance
    // against — the contours help, but seeing the sampling grid is what makes it
    // read as ground rather than as a grey gradient.
    //
    // Off under a texture, which already shows the ground at 25 cm a pixel and
    // has no need of the sampling grid to read as ground.
    groundWireOpacity: m.uvs && m.atlas ? 0 : 0.3,
    ...STRUCTURE_DEFAULTS,
    showStructureWire: !dense,
    // A denser model also wants a little more body, since the edges that used to
    // define its shapes are gone.
    structureOpacity: dense ? 0.35 : STRUCTURE_DEFAULTS.structureOpacity,
    // Structures that came with their own textures - an extracted track's
    // kerbs, barriers and tyre walls - start solid and in them, with the file's
    // own normals: they are the edges of the road, not buildings to see into.
    ...(textured
      ? {
          structureTexture: true,
          structureOpacity: 1,
          showStructureWire: false,
          flatStructures: false,
        }
      : {}),
    structureColours: coloured,
    ...(coloured && !textured ? buildingsLook(useRaceStore.getState().tab === 'match' && useReplayStore.getState().buildings === 'solid') : {}),
  };
}

/**
 * A world backdrop as a level: the builder's mesh in the shape a model import
 * has, then the few things a backdrop wants differently. Colour on, because
 * colour is all that tells a road from the field it is draped on; no ground
 * edges, since the terrain grid is regular and says nothing; and the credits,
 * which the canvas shows for as long as the level is shown.
 */
function worldLevelFrom(name: string, r: BackdropResult, placement: GeoPlacement): ModelLevel {
  const m = r.mesh;
  const tri = (a: Uint32Array) => a.length / 3;
  const level = modelLevelFrom(name, {
    vertices: m.vertices,
    colours: m.colours,
    uvs: null,
    atlas: null,
    indices: m.indices,
    structureIndices: m.structureIndices,
    structureEdges: m.structureEdges,
    waterIndices: m.waterIndices,
    triangles: tri(m.indices),
    structureTriangles: tri(m.structureIndices),
    waterTriangles: tri(m.waterIndices),
    sourceTriangles: tri(m.indices),
    sourceStructureTriangles: tri(m.structureIndices),
    error: 0,
    partNames: m.partNames,
    partClasses: m.partNames.map((n) => (n === 'building' ? 'structure' : n === 'water' ? 'water' : 'ground')),
    partReasons: m.partNames.map(() => t('heat.world.partReason')),
    partRuns: { ...m.partRuns, nav: null },
    bounds: m.bounds,
    groundBand: m.groundBand,
  });
  return { ...worldLook(level, r.credits), placement, labels: r.labels };
}

/** What makes a model level read as a world backdrop; see `worldLevelFrom`. */
function worldLook(level: ModelLevel, credits: ModelLevel['credits']): ModelLevel {
  // Buildings as a map draws them, light grey and nearly solid: from altitude
  // the town's shape is what matters, not what is inside a house.
  return {
    ...level,
    credits,
    showColours: true,
    groundWireOpacity: 0,
    // The sea opaque, so the floor under a coastal cell does not show through.
    waterOpacity: 1,
    // Faint contours: on a map of the real place the cover and the shading
    // carry the relief, and a sea-level contour only wanders over the plains.
    relief: { ...level.relief, contourStrength: 0.12 },
    structureTint: [0.88, 0.86, 0.82],
    structureOpacity: 0.85,
    showStructureWire: false,
  };
}

/**
 * Background geometry: a georeferenced map image, or a level mesh.
 *
 * An image is the pragmatic default — everyone has a map screenshot, almost
 * nobody has a lightweight mesh of their level — and two anchors are enough to
 * place one. A mesh gives real occlusion and height, at the cost of a
 * simplification pass, which is why processed levels are cached in the library
 * rather than re-decimated every session.
 */
export function LevelPanel() {
  useUnits();
  const level = useStore((s) => s.level);
  const setLevel = useStore((s) => s.setLevel);
  const patchLevel = useStore((s) => s.patchLevel);
  const dataset = useStore((s) => s.dataset);

  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const engine = useEngine();
  /**
   * Import decimation, defaulting to none.
   *
   * This dropdown, not `suggestLod`, is what the import actually uses — and
   * while it defaulted to a preset, every level loaded through this panel was
   * silently reduced to it. At the old `medium` that was 400k triangles, so a
   * 3.6M export arrived with a ninth of itself: a hundred thousand building
   * volumes sharing fewer triangles than they have corners, which collapses each
   * one to a sliver and reads as a field of random debris. It looks exactly like
   * a broken exporter, and it was diagnosed as one twice.
   *
   * A file from one of this project's own exporters has already been budgeted
   * against a ceiling chosen from the level's size; decimating it again cannot
   * improve it. The ladder stays in the dropdown for raw art with no budgeting
   * behind it, which is what it was always for.
   */
  const [lod, setLod] = useState<LodPreset>(IMPORT_DEFAULT_LOD);
  const [library, setLibrary] = useState<StoredLevelMeta[]>([]);
  const [usage, setUsage] = useState<{ usage: number; quota: number } | null>(null);

  const refreshLibrary = () => {
    void listLevels().then(setLibrary).catch(() => setLibrary([]));
    void storageEstimate().then(setUsage).catch(() => setUsage(null));
  };
  useEffect(refreshLibrary, []);

  const defaultBounds = dataset?.bounds ?? {
    minX: -1000,
    maxX: 1000,
    minY: 0,
    maxY: 0,
    minZ: -1000,
    maxZ: 1000,
  };

  const pick = (accept: string): Promise<File | null> =>
    new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.oncancel = () => resolve(null);
      input.click();
    });

  const loadImage = async (fileArg?: File, keepAnchors?: [MapAnchor, MapAnchor]) => {
    const file = fileArg ?? (await pick('image/*'));
    if (!file) return;
    setBusy(t('heat.levelPanel.decoding'));
    setError(null);
    setNote(null);
    try {
      const { bitmap, scaled, sourceWidth, sourceHeight } = await decodeMapImage(file, MAX_MAP_EDGE);
      setLevel({
        kind: 'image',
        name: file.name,
        bitmap,
        width: bitmap.width,
        height: bitmap.height,
        anchors: keepAnchors ?? anchorsFromBounds(bitmap.width, bitmap.height, defaultBounds, true),
        elevation: dataset ? dataset.bounds.minY : 0,
        opacity: 1,
        // Matches the reference look: grey map, saturated heat on top.
        desaturate: 1,
        brightness: 0.7,
        flipZ: true,
      });
      if (scaled) {
        setNote(
          t('heat.levelPanel.downscaled', {
            sourceWidth: int(sourceWidth),
            sourceHeight: int(sourceHeight),
            width: int(bitmap.width),
            height: int(bitmap.height),
            max: int(MAX_MAP_EDGE),
          }),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  /** OpenDota's drawing of the Dota 2 map, placed under the Watcher's Dota replay tables. */
  const loadDota = async () => {
    setBusy(t('heat.levelPanel.dotaLoading'));
    setError(null);
    setNote(null);
    try {
      setLevel(await dotaLevel());
      setNote(t('heat.levelPanel.dotaNotice'));
    } catch (err) {
      setError(t('heat.levelPanel.dotaFailed', { reason: err instanceof Error ? err.message : String(err) }));
    } finally {
      setBusy(null);
    }
  };

  const loadModel = async () => {
    const file = await pick(MODEL_EXTENSIONS);
    if (!file) return;
    setError(null);
    setNote(null);
    setBusy(t('heat.levelPanel.reading'));
    try {
      const m = await modelLoader.load(file, LOD_TARGETS[lod], (p) => setBusy(p.label));
      setLevel(modelLevelFrom(file.name, m));
      const totalSource = m.sourceTriangles + m.sourceStructureTriangles;
      const totalNow = m.triangles + m.structureTriangles + m.waterTriangles;
      const structures = m.partClasses.filter((c) => c === 'structure').length;
      const split = {
        ground: formatTriangles(m.triangles),
        structures: formatTriangles(m.structureTriangles),
        water: formatTriangles(m.waterTriangles),
        parts: int(structures),
        total: m.partClasses.length,
      };
      setNote(
        [
          t('heat.levelPanel.imported', {
            source: formatTriangles(totalSource),
            now: formatTriangles(totalNow),
            deviation: num(m.error * 100, 2),
          }),
          m.waterTriangles > 0 ? t('heat.levelPanel.splitWater', split) : t('heat.levelPanel.split', split),
          // What was applied, not what is suggested. A note naming a preset that
          // was not the one used reads as a description of the import.
          lod === 'full' && suggestLod(totalSource) !== 'full'
            ? t('heat.levelPanel.importedAtSuggest', {
                lod: lodLabel(lod),
                suggested: lodLabel(suggestLod(totalSource)),
              })
            : t('heat.levelPanel.importedAt', { lod: lodLabel(lod) }),
        ].join(' '),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const saveCurrent = async () => {
    if (!level) return;
    setBusy(t('heat.levelPanel.saving'));
    setError(null);
    try {
      if (level.kind === 'image') {
        // Re-encode from the bitmap; the original File is long gone by now.
        const canvas = document.createElement('canvas');
        canvas.width = level.width;
        canvas.height = level.height;
        canvas.getContext('2d')?.drawImage(level.bitmap, 0, 0);
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
        if (!blob) throw new Error(t('heat.levelPanel.encodeFailed'));
        await saveImageLevel(level.name, blob, level.width, level.height, level.anchors);
      } else {
        await saveModelLevel(level.name, {
          vertices: level.vertices,
          colours: level.colours,
          uvs: level.uvs,
          uvTiles: level.uvTiles,
          tileRects: level.tileRects,
          atlas: level.atlas,
          indices: level.indices,
          structureIndices: level.structureIndices ?? new Uint32Array(0),
          structureEdges: level.structureEdges ?? new Uint32Array(0),
          waterIndices: level.waterIndices ?? new Uint32Array(0),
          triangles: level.triangles,
          sourceTriangles: level.sourceTriangles,
          credits: level.credits,
          placement: level.placement,
          labels: level.labels,
          // A streamed theatre is kept as what it streams, not as tiles.
          ...(level.stream ? { stream: level.stream, bounds: level.bounds } : {}),
        });
      }
      refreshLibrary();
      setNote(t('heat.levelPanel.saved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const loadFromLibrary = async (meta: StoredLevelMeta) => {
    setBusy(t('heat.levelPanel.loading', { name: meta.name }));
    setError(null);
    setNote(null);
    try {
      const rec = await loadLevel(meta.id);
      if (!rec) throw new Error(t('heat.levelPanel.entryGone'));
      if (rec.meta.kind === 'image' && rec.blob) {
        const bitmap = await createImageBitmap(rec.blob);
        setLevel({
          kind: 'image',
          name: rec.meta.name,
          bitmap,
          width: bitmap.width,
          height: bitmap.height,
          anchors:
            rec.meta.anchors ?? anchorsFromBounds(bitmap.width, bitmap.height, defaultBounds, true),
          elevation: dataset ? dataset.bounds.minY : 0,
          opacity: 1,
          desaturate: 1,
          brightness: 0.7,
          flipZ: true,
        });
      } else if (rec.vertices && rec.indices) {
        // Bounds are recomputed rather than stored: cheap, and it keeps the
        // stored record to just the geometry.
        const b = {
          minX: Infinity,
          minY: Infinity,
          minZ: Infinity,
          maxX: -Infinity,
          maxY: -Infinity,
          maxZ: -Infinity,
        };
        for (let i = 0; i < rec.vertices.length; i += 6) {
          const x = rec.vertices[i];
          const y = rec.vertices[i + 1];
          const z = rec.vertices[i + 2];
          if (x < b.minX) b.minX = x;
          if (x > b.maxX) b.maxX = x;
          if (y < b.minY) b.minY = y;
          if (y > b.maxY) b.maxY = y;
          if (z < b.minZ) b.minZ = z;
          if (z > b.maxZ) b.maxZ = z;
        }
        const structureIndices = rec.structureIndices ?? new Uint32Array(0);
        const structureEdges = rec.structureEdges ?? new Uint32Array(0);
        const restored = modelLevelFrom(rec.meta.name, {
          vertices: rec.vertices,
          // Library entries written before colour existed have none. Null
          // rather than white, so the panel can say "this level has no
          // colour" instead of offering a switch that changes nothing.
          colours: rec.colours ?? null,
          // Absent on untextured levels and on entries saved before textures
          // existed; either way the level simply loads without one.
          uvs: rec.uvs ?? null,
          uvTiles: rec.uvTiles ?? null,
          tileRects: rec.tileRects ?? null,
          atlas: rec.atlas ?? null,
          indices: rec.indices,
          structureIndices,
          structureEdges,
          // Library entries predate the water split and store none, which is
          // correct rather than lossy — the water is still in the ground set
          // where it was put at the time.
          waterIndices: rec.waterIndices ?? new Uint32Array(0),
          waterTriangles: (rec.waterIndices?.length ?? 0) / 3,
          triangles: rec.meta.triangles ?? rec.indices.length / 3,
          structureTriangles: structureIndices.length / 3,
          sourceTriangles: rec.meta.sourceTriangles ?? rec.meta.triangles ?? 0,
          sourceStructureTriangles: structureIndices.length / 3,
          error: 0,
          // Part detail is not stored; it only drives the classification UI,
          // which has nothing left to correct once the split is baked in.
          partNames: [],
          partClasses: [],
          partReasons: [],
          bounds: b,
          // A library entry stores no separate ground band, so the relief cues
          // fall back to the level's full height. On a level with tall
          // structures the contours then come out coarse; re-importing the
          // source gives the tighter interval.
          groundBand: { minY: b.minY, maxY: b.maxY },
        });
        // A saved streamed theatre comes back streaming, on its plane, with its reach.
        const stream = rec.meta.stream;
        const reach = rec.meta.bounds;
        if (stream && rec.meta.placement && reach) {
          const shell = worldLook({ ...restored, bounds: reach }, rec.meta.credits ?? []);
          setLevel({
            ...shell,
            placement: rec.meta.placement,
            stream,
            showTexture: stream.imagery,
            relief: { ...shell.relief, lowY: reach.minY, highY: reach.maxY },
          });
          // With no data, start over the theatre rather than wherever the camera was.
          const th = theatreById(stream.theatre);
          if (!dataset && engine && th) cameraOverTheatre(engine, rec.meta.placement, th);
          return;
        }
        // A saved world backdrop comes back with its credits and its look.
        setLevel(
          rec.meta.credits?.length
            ? {
                ...worldLook(restored, rec.meta.credits),
                ...(rec.meta.placement ? { placement: rec.meta.placement } : {}),
                ...(rec.meta.labels?.length ? { labels: rec.meta.labels } : {}),
              }
            : restored,
        );
      } else {
        throw new Error(t('heat.levelPanel.entryEmpty'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const img = level?.kind === 'image' ? level : null;
  const mdl = level?.kind === 'model' ? level : null;
  // Every structure field is optional on the level, so resolve the defaults once
  // rather than sprinkling fallbacks through the JSX.
  const sd = mdl ? structureDraw(mdl) : null;
  // Same for the relief cues, whose defaults come from the level's own height
  // range — a contour interval that suits a hillside is useless on a quarry floor.
  const relief = mdl ? reliefDraw(mdl) : null;
  const partNames = mdl?.partNames ?? [];
  const partClasses = mdl?.partClasses ?? [];
  const structureParts = partClasses.filter((c) => c === 'structure').length;

  return (
    <Section title={t('heat.levelPanel.title')}>
      {!level && <div className="hint">{t('heat.levelPanel.nothingLoaded')}</div>}

      <div className="row">
        <button disabled={!!busy} onClick={() => void loadImage()}>
          {t('heat.levelPanel.mapImage')}
        </button>
        <button disabled={!!busy} onClick={() => void loadModel()}>
          {t('heat.levelPanel.model')}
        </button>
        <button disabled={!!busy} onClick={() => void loadDota()} title={t('heat.levelPanel.dotaTitle')}>
          {t('heat.levelPanel.dota')}
        </button>
      </div>

      <WorldBackdrop busy={!!busy} toLevel={worldLevelFrom} setError={setError} setNote={setNote} />

      <div className="field">
        <div className="label">
          <span>{t('heat.levelPanel.simplification')}</span>
        </div>
        <select value={lod} onChange={(e) => setLod(e.target.value as LodPreset)}>
          {(Object.keys(LOD_TARGETS) as LodPreset[]).map((k) => (
            <option key={k} value={k}>
              {lodLabel(k)}
            </option>
          ))}
        </select>
        <div className="hint">
          {t('heat.levelPanel.simplificationHint', { extensions: MODEL_EXTENSIONS.replace(/,/g, ' ') })}
        </div>
      </div>

      {busy && (
        <>
          <div className="hint">{t('heat.levelPanel.busy', { label: busy })}</div>
          <div className="bar">
            <div style={{ width: '100%', opacity: 0.5 }} />
          </div>
          <button onClick={() => modelLoader.cancel()}>{t('heat.levelPanel.cancel')}</button>
        </>
      )}
      {error && <div className="err">{error}</div>}
      {note && <div className="hint">{note}</div>}

      {level && (
        <>
          <div className="hint">
            <b>{level.name}</b>
            <br />
            {img
              ? t('heat.levelPanel.imageInfo', {
                  width: int(img.width),
                  height: int(img.height),
                  x: num(mapScale(img).x, 2),
                  z: num(mapScale(img).z, 2),
                })
              : mdl
                ? mdl.sourceTriangles > mdl.triangles
                  ? t('heat.levelPanel.trianglesFrom', {
                      triangles: formatTriangles(mdl.triangles),
                      source: formatTriangles(mdl.sourceTriangles),
                    })
                  : t('heat.levelPanel.triangles', { triangles: formatTriangles(mdl.triangles) })
                : ''}
          </div>

          <Slider
            label={t('heat.levelPanel.opacity')}
            value={level.opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(opacity) => patchLevel({ opacity })}
            format={(v) => percent(v)}
          />
          <Slider
            label={t('heat.levelPanel.brightness')}
            value={level.brightness}
            min={0}
            max={2}
            ceiling={64}
            step={0.01}
            onChange={(brightness) => patchLevel({ brightness })}
          />
          {img && (
            <Slider
              label={t('heat.levelPanel.desaturate')}
              value={img.desaturate}
              min={0}
              max={1}
              step={0.01}
              onChange={(desaturate) => patchLevel({ desaturate })}
              format={(v) => percent(v)}
              hint={t('heat.levelPanel.desaturateHint')}
            />
          )}
          {mdl && sd && relief && (
            <>
              <div className="field">
                <div className="label">
                  <span>{t('heat.levelPanel.relief')}</span>
                  <span className="val">
                    {relief.contourSpacing > 0
                      ? t('units.every', { length: lengthText(relief.contourSpacing) })
                      : t('heat.levelPanel.noContours')}
                  </span>
                </div>
                <div className="hint">{t('heat.levelPanel.reliefHint')}</div>
              </div>
              <Slider
                label={t('heat.levelPanel.contourSpacing')}
                value={relief.contourSpacing}
                min={Math.max(0.01, (mdl.bounds.maxY - mdl.bounds.minY) / 4000)}
                max={Math.max(1, (mdl.bounds.maxY - mdl.bounds.minY) / 2)}
                logarithmic
                zeroAt={0}
                onChange={(contourSpacing) =>
                  patchLevel({ relief: { ...mdl.relief, contourSpacing } })
                }
                format={(v) => (v <= 0 ? t('heat.levelPanel.off') : num(v, v < 10 ? 2 : 0))}
              />
              <Slider
                label={t('heat.levelPanel.contourStrength')}
                value={relief.contourStrength}
                min={0}
                max={1}
                step={0.01}
                onChange={(contourStrength) =>
                  patchLevel({ relief: { ...mdl.relief, contourStrength } })
                }
                format={(v) => percent(v)}
              />
              <Slider
                label={t('heat.levelPanel.slope')}
                value={relief.slope}
                min={0}
                max={1}
                step={0.01}
                onChange={(slope) => patchLevel({ relief: { ...mdl.relief, slope } })}
                format={(v) => (v <= 0 ? t('heat.levelPanel.off') : percent(v))}
                hint={t('heat.levelPanel.slopeHint')}
              />
              <Slider
                label={t('heat.levelPanel.elevationRamp')}
                value={relief.elevationRange}
                min={0}
                max={1}
                step={0.01}
                onChange={(elevationRange) =>
                  patchLevel({ relief: { ...mdl.relief, elevationRange } })
                }
                format={(v) => (v <= 0 ? t('heat.levelPanel.off') : percent(v))}
                hint={t('heat.levelPanel.elevationRampHint')}
              />
              {(mdl.waterTriangles ?? 0) > 0 && (
                <>
                  <Check
                    label={t('heat.levelPanel.water')}
                    checked={mdl.showWater ?? true}
                    onChange={(showWater) => patchLevel({ showWater })}
                    title={t('heat.levelPanel.waterTitle')}
                  />
                  {(mdl.showWater ?? true) && (
                    <Slider
                      label={t('heat.levelPanel.waterOpacity')}
                      value={mdl.waterOpacity ?? DEFAULT_WATER_OPACITY}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(waterOpacity) => patchLevel({ waterOpacity })}
                      format={(v) => percent(v)}
                    />
                  )}
                </>
              )}
              <Slider
                label={t('heat.levelPanel.groundTriangles')}
                value={mdl.groundWireOpacity ?? 0}
                min={0}
                max={1}
                step={0.01}
                onChange={(groundWireOpacity) => patchLevel({ groundWireOpacity })}
                format={(v) => (v <= 0 ? t('heat.levelPanel.off') : percent(v))}
                hint={t('heat.levelPanel.groundTrianglesHint')}
              />
              <Check
                label={t('heat.levelPanel.wireframe')}
                checked={mdl.wireframe}
                onChange={(wireframe) => patchLevel({ wireframe })}
                title={t('heat.levelPanel.wireframeTitle')}
              />
              {mdl.uvs && mdl.atlas ? (
                <Check
                  label={t('heat.levelPanel.groundTexture')}
                  checked={mdl.showTexture !== false}
                  onChange={(showTexture) => patchLevel({ showTexture })}
                  title={t('heat.levelPanel.groundTextureTitle')}
                />
              ) : null}
              {mdl.colours ? (
                <Check
                  label={t('heat.levelPanel.colour')}
                  checked={mdl.showColours === true}
                  onChange={(showColours) => patchLevel({ showColours })}
                  title={t('heat.levelPanel.colourTitle')}
                />
              ) : (
                <div className="hint">{t('heat.levelPanel.noColour')}</div>
              )}

              <div className="field">
                <div className="label">
                  <span>{t('heat.levelPanel.structures')}</span>
                  <span className="val">
                    {t('heat.levelPanel.tris', { triangles: formatTriangles(mdl.structureTriangles ?? 0) })}
                  </span>
                </div>
                <div className="hint">
                  {sd.textured ? t('heat.levelPanel.structuresTextured') : t('heat.levelPanel.structuresShell')}
                  {partClasses.length > 0
                    ? ` ${t('heat.levelPanel.structureParts', {
                        parts: int(structureParts),
                        total: partClasses.length,
                      })}`
                    : ''}
                </div>
              </div>

              {(mdl.uvs && mdl.atlas) || mdl.structureColours ? (
                <Check
                  label={t('heat.levelPanel.structureTexture')}
                  checked={mdl.structureTexture === true}
                  onChange={(structureTexture) =>
                    patchLevel(
                      structureTexture
                        ? { structureTexture, structureOpacity: 1, showStructureWire: false }
                        : {
                            structureTexture,
                            structureOpacity: STRUCTURE_DEFAULTS.structureOpacity,
                          },
                    )
                  }
                  title={t('heat.levelPanel.structureTextureTitle')}
                />
              ) : null}
              <Check
                label={t('heat.levelPanel.wireEdges')}
                checked={sd.showWire}
                onChange={(showStructureWire) => patchLevel({ showStructureWire })}
              />
              {sd.showWire && (
                <Slider
                  label={t('heat.levelPanel.edgeOpacity')}
                  value={sd.wireOpacity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(structureWireOpacity) => patchLevel({ structureWireOpacity })}
                  format={(v) => percent(v)}
                />
              )}
              <Check
                label={t('heat.levelPanel.shellFaces')}
                checked={sd.showFaces}
                onChange={(showStructureFaces) => patchLevel({ showStructureFaces })}
                title={t('heat.levelPanel.shellFacesTitle')}
              />
              {sd.showFaces && (
                <Slider
                  label={t('heat.levelPanel.faceOpacity')}
                  value={sd.faceOpacity}
                  min={0}
                  max={0.6}
                  // The track stops early on purpose — see the hint — but fully
                  // opaque is a legitimate thing to want for a moment.
                  ceiling={1}
                  step={0.005}
                  onChange={(structureOpacity) => patchLevel({ structureOpacity })}
                  format={(v) => percent(v, 1)}
                  hint={t('heat.levelPanel.faceOpacityHint')}
                />
              )}
              {sd.showFaces && (
                <Check
                  label={t('heat.levelPanel.sharpEdges')}
                  checked={sd.flat}
                  onChange={(flatStructures) => patchLevel({ flatStructures })}
                  title={t('heat.levelPanel.sharpEdgesTitle')}
                />
              )}
              <div className="field">
                <div className="label">
                  <span>{t('heat.levelPanel.structureTint')}</span>
                </div>
                <div className="row">
                  <input
                    type="color"
                    style={{ width: 34, height: 24, padding: 0 }}
                    value={rgbToHex(sd.tint)}
                    onChange={(e) => patchLevel({ structureTint: hexToRgb01(e.target.value) })}
                  />
                  {(
                    [
                      ['cyan', t('heat.levelPanel.tint.cyan'), [0.35, 0.85, 1]],
                      ['amber', t('heat.levelPanel.tint.amber'), [1, 0.7, 0.25]],
                      ['violet', t('heat.levelPanel.tint.violet'), [0.7, 0.5, 1]],
                      ['white', t('heat.levelPanel.tint.white'), [1, 1, 1]],
                    ] as Array<[string, string, [number, number, number]]>
                  ).map(([id, label, tint]) => (
                    <button key={id} onClick={() => patchLevel({ structureTint: tint })}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {partNames.length > 1 && (
                <PartList names={partNames} classes={partClasses} reasons={mdl.partReasons ?? []} tint={sd.tint} />
              )}
            </>
          )}

          {img && (
            <>
              <Check
                label={t('heat.levelPanel.flip')}
                checked={img.flipZ}
                onChange={(flipZ) =>
                  patchLevel({
                    flipZ,
                    ...(dataset
                      ? { anchors: anchorsFromBounds(img.width, img.height, dataset.bounds, flipZ) }
                      : {}),
                  })
                }
              />
              <div className="field">
                <div className="label">
                  <span>{t('heat.levelPanel.placement')}</span>
                </div>
                <div className="hint">{t('heat.levelPanel.placementHint')}</div>
                {img.anchors.map((a, i) => (
                  <AnchorEditor
                    key={i}
                    index={i}
                    anchor={a}
                    width={img.width}
                    height={img.height}
                    onChange={(next) => {
                      const anchors: [MapAnchor, MapAnchor] = [...img.anchors] as [
                        MapAnchor,
                        MapAnchor,
                      ];
                      anchors[i] = next;
                      patchLevel({ anchors });
                    }}
                  />
                ))}
                {mapQuadFromAnchors(img).degenerate && (
                  <div className="err">{t('heat.levelPanel.degenerate')}</div>
                )}
                <button
                  disabled={!dataset}
                  onClick={() =>
                    dataset &&
                    patchLevel({
                      anchors: anchorsFromBounds(img.width, img.height, dataset.bounds, img.flipZ),
                    })
                  }
                >
                  {t('heat.levelPanel.fit')}
                </button>
              </div>
              <Slider
                label={t('heat.levelPanel.elevation')}
                value={img.elevation}
                min={dataset ? dataset.bounds.minY - 500 : -500}
                max={dataset ? dataset.bounds.maxY + 500 : 500}
                // The track covers the data, which is where the plane belongs,
                // but a map exported in another unit lands a long way off it.
                ceiling={dataset ? dataset.bounds.maxY + 100_000 : 100_000}
                step={0.5}
                onChange={(elevation) => patchLevel({ elevation })}
                hint={t('heat.levelPanel.elevationHint')}
              />
            </>
          )}

          <div className="row">
            <button disabled={!!busy} onClick={() => void saveCurrent()}>
              {t('heat.levelPanel.saveToLibrary')}
            </button>
            <button onClick={() => setLevel(null)}>{t('heat.levelPanel.remove')}</button>
          </div>
        </>
      )}

      <div className="field">
        <div className="label">
          <span>{t('heat.levelPanel.library')}</span>
          <span className="val">{library.length}</span>
        </div>
        <div className="hint">
          {t('heat.levelPanel.libraryHint')}
          {usage
            ? ` ${t('heat.levelPanel.usage', { used: formatBytes(usage.usage), quota: formatBytes(usage.quota) })}`
            : ''}
        </div>
        {library.length === 0 ? (
          <div className="hint" style={{ opacity: 0.7 }}>
            {t('heat.levelPanel.libraryEmpty', { button: t('heat.levelPanel.saveToLibrary') })}
          </div>
        ) : (
          <div className="team-list" style={{ maxHeight: 190 }}>
            {library.map((m) => (
              <div className="team-row" key={m.id}>
                <span className="name" title={`${m.name} · ${formatBytes(m.bytes)}`}>
                  {m.name}
                </span>
                <span className="sign">
                  {m.kind === 'model'
                    ? formatTriangles(m.triangles ?? 0)
                    : t('heat.levelPanel.widthPx', { width: int(m.width ?? 0) })}
                </span>
                <button
                  className="del"
                  disabled={!!busy}
                  title={t('heat.levelPanel.load')}
                  onClick={() => void loadFromLibrary(m)}
                >
                  ▸
                </button>
                <button
                  className="del"
                  title={t('heat.levelPanel.delete')}
                  onClick={() => void deleteLevel(m.id).then(refreshLibrary)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

/**
 * What the classifier decided, and why.
 *
 * Read-only on purpose: changing a part's class means re-splitting and
 * re-simplifying the geometry, which is a worker round trip, so the list shows
 * the reasoning and points at re-importing rather than pretending it is a toggle.
 */
function PartList({
  names,
  classes,
  reasons,
  tint,
}: {
  names: string[];
  classes: Array<'ground' | 'structure' | 'water'>;
  reasons: string[];
  tint: [number, number, number];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="field">
      <button onClick={() => setOpen((v) => !v)}>
        {t(open ? 'heat.levelPanel.hideParts' : 'heat.levelPanel.showParts', { count: int(names.length) })}
      </button>
      {open && (
        <>
          <div className="hint">{t('heat.levelPanel.partsHint')}</div>
          <div className="team-list" style={{ maxHeight: 220 }}>
            {names.map((name, i) => (
              <div className="team-row" key={`${name}-${i}`}>
                <span
                  className="swatch"
                  style={{
                    background: classes[i] === 'structure' ? rgbToCssTint(tint) : '#8d96a5',
                  }}
                />
                <span className="name" title={`${name} — ${reasons[i] ?? ''}`}>
                  {name}
                </span>
                <span className="sign">{t('heat.levelPanel.partClass', { kind: classes[i] ?? '?' })}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function rgbToCssTint([r, g, b]: [number, number, number]): string {
  const to8 = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255);
  return `rgb(${to8(r)}, ${to8(g)}, ${to8(b)})`;
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const h = (v: number) =>
    Math.round(Math.max(0, Math.min(1, v)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function hexToRgb01(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

function AnchorEditor({
  index,
  anchor,
  width,
  height,
  onChange,
}: {
  index: number;
  anchor: MapAnchor;
  width: number;
  height: number;
  onChange: (a: MapAnchor) => void;
}) {
  const field = (key: keyof MapAnchor, label: string, step: number, title?: string) => (
    <label style={{ fontSize: 10, color: 'var(--text-faint)', flex: 1 }} title={title}>
      {label}
      <input
        type="number"
        step={step}
        value={Number(anchor[key].toFixed(3))}
        onChange={(e) => onChange({ ...anchor, [key]: Number(e.target.value) || 0 })}
      />
    </label>
  );

  return (
    <div style={{ borderLeft: '2px solid var(--line)', paddingLeft: 7, marginTop: 6 }}>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3 }}>
        {t('heat.levelPanel.anchor', { number: index + 1 })}
      </div>
      <div className="row">
        {field('px', t('heat.levelPanel.anchorPx', { max: width }), 1, t('heat.levelPanel.anchorPxTitle'))}
        {field('py', t('heat.levelPanel.anchorPy', { max: height }), 1, t('heat.levelPanel.anchorPyTitle'))}
      </div>
      <div className="row">
        {field('worldX', t('heat.levelPanel.worldX'), 1)}
        {field('worldZ', t('heat.levelPanel.worldZ'), 1)}
      </div>
    </div>
  );
}


