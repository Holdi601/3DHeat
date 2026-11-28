/**
 * The level under the data, picked and loaded by itself: a first look at a
 * War Thunder or Counter-Strike match is the match on its map, not a heat
 * blob over a grid with the map somewhere in a list of forty.
 *
 * What the data is on comes from the files: a container names its game and
 * map (`pickIdentity.ts`), and the levels folder (`/__heat3d/catalog`, the
 * local server's index of what the extractors wrote) is searched for the one
 * level of that name. A Tacview recording names no map; where it flies says
 * which theatre it is (`theatreOfData`), and that theatre is streamed under
 * it as the level panel's "Stream theatre" would.
 *
 * A game with no map extractor yet (Gunner, HEAT, PC!) gets a ground traced
 * from where its ground units drove (`trackGround`), until a level of its map
 * is in the levels folder.
 *
 * Once per pick, after the data is loaded, and only while no level is: a
 * level the person chose is never replaced. A small chip over the view says
 * which level was picked, with a way to change it.
 */

import { create } from 'zustand';
import { useEffect } from 'react';
import { levelForMap, type CatalogIndex, type CatalogItem } from '../../data/catalogIndex';
import { modelLoader } from '../../data/modelLoader';
import { IMPORT_DEFAULT_LOD, LOD_TARGETS } from '../../data/simplify';
import { t, useLang } from '../../i18n';
import { loadLayoutFiles } from '../../state/levelLayoutsStore';
import { useStore } from '../../state/store';
import type { Dataset, GeoPlacement } from '../../state/types';
import { recordingGame, theatreOfData, theatreOfDcsFolder, type Theatre } from '../../world/theatres';
import { dcsBuildings, dcsGroundFrom, mergeDcsModels, type DcsGroundData } from '../../world/dcsGround';
import type { WorldLabel } from '../../world/backdrop';
import { eastNorthOf, planeInverse } from '../../world/tiles';
import { worldToData } from '../../render/pose';
import { groundPersons } from '../../data/groundFit';
import { trackGround } from '../../data/trackGround';
import type { LoadedModel } from '../../data/modelLoader';
import { reveal } from '../shell/commands';
import { CATALOG_ROUTE, terrainLevelOf } from './CatalogSection';
import { notePickedLevel } from '../../state/catalogSelection';
import { modelLevelFrom, worldLevelFrom } from './LevelPanel';
import { dcsLabels, streamedLevel, type DcsLevelMeta } from './WorldBackdrop';

interface AutoLevelState {
  /** What the last pick is on, as its files say; null before any. */
  wanted: { game: string | null; map: string | null } | null;
  status: 'idle' | 'loading' | 'loaded' | 'none';
  /** The level loaded by itself, by its `name` on the level; the chip shows while it is the level. */
  level: string | null;
  /** What the chip calls it: the map or theatre. */
  label: string | null;
}

export const useAutoLevel = create<AutoLevelState>(() => ({ wanted: null, status: 'idle', level: null, label: null }));

/** A new pick: the game and map its files name (either may be null). */
export function noteWantedLevel(game: string | null, map: string | null): void {
  useAutoLevel.setState({ wanted: { game, map }, status: 'idle', level: null, label: null });
}

/** Games whose levels the level panel picks by itself already (Siege by map version, Battlefield by map column). */
const OWN_PICKERS = /^(r6|battlefield-)/i;

/** Games with no map extractor yet: without a level of their map, a ground traced from the units' tracks. */
const TRACK_GROUND_GAMES = /^ghpc$/i;

/** Games whose recordings are on the real earth, under a theatre streamed as the level. */
const THEATRE_GAMES = /^(tacview|dcs|il2)$/i;

let catalog: Promise<CatalogItem[]> | null = null;

/** The levels folder's items, asked once; nothing without a local server. */
export function catalogItems(): Promise<CatalogItem[]> {
  catalog ??= fetch(CATALOG_ROUTE)
    .then((r) => (r.status === 200 ? (r.json() as Promise<CatalogIndex>) : null))
    .then((ix) => (ix && Array.isArray(ix.items) ? ix.items : []))
    .catch(() => [] as CatalogItem[]);
  // An empty answer is asked again next time: the server may have been starting.
  void catalog.then((items) => {
    if (!items.length) catalog = null;
  });
  return catalog;
}

export async function catalogFile(path: string): Promise<File | null> {
  const r = await fetch(`${CATALOG_ROUTE}/file?path=${encodeURIComponent(path)}`);
  if (!r.ok) return null;
  return new File([await r.blob()], path.split('/').pop() ?? path);
}

/** Whether a level was put there since `since`: the person's choice, which stands. */
const levelTaken = () => !!useStore.getState().level;

/** Loads a level of the levels folder as the level; one the person chose meanwhile stands, unless `replace` (a mission opened on its own map). */
export async function loadCatalogLevel(item: CatalogItem, replace = false): Promise<void> {
  useAutoLevel.setState({ status: 'loading', label: item.name });
  try {
    if (item.layouts) {
      const l = await catalogFile(item.layouts);
      if (l) await loadLayoutFiles([new File([l], l.name.endsWith('.layouts.json') ? l.name : `${item.name}.layouts.json`)]);
    }
    // A big map's tiled terrain, streamed, before its glb (src/world/terrainStream.ts).
    const tiled = item.terrain ? await terrainLevelOf(item) : null;
    if (tiled) {
      if (levelTaken()) {
        tiled.terrain?.dispose();
        useAutoLevel.setState({ status: 'none' });
        return;
      }
      useStore.getState().setLevel(tiled);
      notePickedLevel(item);
      useAutoLevel.setState({ status: 'loaded', level: tiled.name });
      return;
    }
    const f = await catalogFile(item.path);
    if (!f) throw new Error('not served');
    const m = await modelLoader.load(f, LOD_TARGETS[IMPORT_DEFAULT_LOD], () => undefined);
    if (levelTaken() && !replace) {
      useAutoLevel.setState({ status: 'none' });
      return;
    }
    const lv = modelLevelFrom(f.name, m);
    useStore.getState().setLevel(lv);
    notePickedLevel(item);
    useAutoLevel.setState({ status: 'loaded', level: lv.name });
  } catch {
    // The folder's level could not be read: the panel still lists it.
    useAutoLevel.setState({ status: 'none' });
  }
}

/** DCS areas loaded under one recording at most: each is tens of megabytes of the game's terrain. */
const MAX_AREAS = 3;

/**
 * Where a recording's ground units are, on the earth: up to `n` of their rows,
 * spread over the data, as [lat, lon].
 */
function groundPlaces(d: Dataset, n: number): Array<[number, number]> {
  const geo = d.geo!;
  const ground = groundPersons(d);
  const inverse = planeInverse(geo);
  const out: Array<[number, number]> = [];
  const step = Math.max(1, Math.floor(d.count / (n * 4)));
  for (let r = 0; r < d.count && out.length < n; r += step) {
    if (ground && d.personId && !ground[d.personId[r]]) continue;
    const [e, nn] = eastNorthOf(geo, worldToData({ x: d.px[r], y: d.py[r], z: d.pz[r] }, d.axes ?? null));
    const [lat, lon] = inverse(e, nn);
    if (Number.isFinite(lat) && Number.isFinite(lon)) out.push([lat, lon]);
  }
  return out;
}

/**
 * The game's own ground under a DCS recording, from the levels folder's DCS
 * areas (`dcs/<theatre>/r<n>/`, the DCS converter's levels with their .json):
 * the areas its ground units drive in, most of them first. A recording's
 * heights are the game's, and the real earth's differ from them by metres in
 * the hills - tanks half in a slope beside others above it - so the streamed
 * tiles take the game's heights wherever an area reaches. Null when no area
 * holds any.
 */
async function dcsGroundUnder(d: Dataset, th: Theatre): Promise<{ dcs: DcsGroundData; labels: WorldLabel[]; name: string } | null> {
  const areas = (await catalogItems()).filter((it) => it.kind === 'level' && it.game === 'dcs' && /^dcs\/[^/]+\/r\d+\//i.test(it.path));
  if (!areas.length) return null;
  const places = groundPlaces(d, 2000);
  if (!places.length) return null;
  const hits: Array<{ item: CatalogItem; meta: DcsLevelMeta; count: number }> = [];
  for (const item of areas) {
    const f = await catalogFile(item.path.replace(/\.glb$/i, '.json'));
    if (!f) continue;
    const meta = JSON.parse(await f.text()) as DcsLevelMeta;
    if (theatreOfDcsFolder(meta.theatre)?.id !== th.id || !meta.bounds_latlon) continue;
    const [s, w] = meta.bounds_latlon.south_west;
    const [nn, e] = meta.bounds_latlon.north_east;
    const count = places.filter(([la, lo]) => la >= s && la <= nn && lo >= w && lo <= e).length;
    if (count) hits.push({ item, meta, count });
  }
  hits.sort((a, b) => b.count - a.count);
  const chosen = hits.slice(0, MAX_AREAS);
  if (!chosen.length) return null;
  const parts: LoadedModel[] = [];
  for (const h of chosen) {
    const f = await catalogFile(h.item.path);
    if (!f) return null;
    parts.push(await modelLoader.load(f, Infinity, () => undefined));
  }
  const m = await mergeDcsModels(parts);
  const metas = chosen.map((h) => h.meta);
  const rows = metas.flatMap((x) => x.buildings?.rows ?? []);
  return {
    dcs: dcsGroundFrom(metas[0].theatre, m.vertices, m.colours, m.indices, m.waterIndices, dcsBuildings(rows)),
    labels: metas.flatMap(dcsLabels),
    name: t('heat.world.dcs.name', { theatre: th.name, level: metas.map((x) => x.level ?? '').join(' + ') }),
  };
}

/** The theatre a recording flies in, streamed under it (on the game's own ground where the folder has it); false when it is in none known. */
async function streamTheatreUnder(d: Dataset): Promise<boolean> {
  if (!d.geo) return false;
  const th = theatreOfData(d.geo, d.bounds, d.axes, recordingGame(d));
  if (!th) return false;
  useAutoLevel.setState({ label: th.name });
  const placement: GeoPlacement = { geo: d.geo, axes: d.axes ?? null };
  const game = th.game === 'dcs' ? await dcsGroundUnder(d, th).catch(() => null) : null;
  if (levelTaken() || useStore.getState().dataset !== d) return false;
  const lv = streamedLevel(th, placement, worldLevelFrom, { imagery: false, runways: true }, game ?? undefined);
  useStore.getState().setLevel(lv);
  useAutoLevel.setState({ status: 'loaded', level: lv.name, label: th.name });
  return true;
}

/** Picks the level once the data is in; see the top. */
async function pickLevel(d: Dataset): Promise<void> {
  const { wanted } = useAutoLevel.getState();
  const game = wanted?.game ?? null;
  if (game && OWN_PICKERS.test(game)) return;
  useAutoLevel.setState({ status: 'loading' });
  if (wanted?.map) {
    const hit = levelForMap(await catalogItems(), wanted.map, game);
    if (levelTaken() || useStore.getState().dataset !== d) return void useAutoLevel.setState({ status: 'none' });
    if (hit) return loadCatalogLevel(hit);
  }
  // A recording on the earth: its theatre, streamed.
  if ((game && THEATRE_GAMES.test(game)) || d.geo?.theatre) {
    if (await streamTheatreUnder(d)) return;
    if (levelTaken()) return void useAutoLevel.setState({ status: 'none' });
  }
  if (game && TRACK_GROUND_GAMES.test(game) && !levelTaken() && useStore.getState().dataset === d) {
    const g = trackGround(d);
    if (g) {
      const label = t('app.autoLevel.fromTracks', { map: wanted?.map || d.name });
      const lv = modelLevelFrom(label, g.model);
      useStore.getState().setLevel(lv);
      useAutoLevel.setState({ status: 'loaded', level: lv.name, label });
      return;
    }
  }
  useAutoLevel.setState({ status: 'none' });
}

/**
 * Over the view: the automatic level's chip, and what starts the pick when a
 * dataset arrives with no level under it.
 */
export function AutoLevelChip() {
  useLang();
  const dataset = useStore((s) => s.dataset);
  const levelName = useStore((s) => (s.level ? s.level.name : null));
  const status = useAutoLevel((s) => s.status);
  const auto = useAutoLevel((s) => s.level);
  const label = useAutoLevel((s) => s.label);
  const wanted = useAutoLevel((s) => s.wanted);

  useEffect(() => {
    if (!dataset || levelName || status !== 'idle' || !wanted) return;
    void pickLevel(dataset);
  }, [dataset, levelName, status, wanted]);

  if (status === 'loading' && label) {
    return (
      <div className="auto-level" data-testid="auto-level">
        {t('app.autoLevel.loading', { name: label })}
      </div>
    );
  }
  if (status !== 'loaded' || !auto || levelName !== auto) return null;
  return (
    <div className="auto-level" data-testid="auto-level">
      {t('app.autoLevel.chip', { name: label ?? auto })}
      {' · '}
      <button type="button" className="link" onClick={() => void reveal({ path: ['heat.levelPanel.title'] })}>
        {t('app.autoLevel.change')}
      </button>
    </div>
  );
}
