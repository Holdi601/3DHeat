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
import { theatreOfData } from '../../world/theatres';
import { reveal } from '../shell/commands';
import { CATALOG_ROUTE } from './CatalogSection';
import { modelLevelFrom, worldLevelFrom } from './LevelPanel';
import { emptyStream, streamName } from './WorldBackdrop';

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

/** Games whose recordings are on the real earth, under a theatre streamed as the level. */
const THEATRE_GAMES = /^(tacview|dcs|il2)$/i;

let catalog: Promise<CatalogItem[]> | null = null;

/** The levels folder's items, asked once; nothing without a local server. */
function catalogItems(): Promise<CatalogItem[]> {
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

async function catalogFile(path: string): Promise<File | null> {
  const r = await fetch(`${CATALOG_ROUTE}/file?path=${encodeURIComponent(path)}`);
  if (!r.ok) return null;
  return new File([await r.blob()], path.split('/').pop() ?? path);
}

/** Whether a level was put there since `since`: the person's choice, which stands. */
const levelTaken = () => !!useStore.getState().level;

async function loadCatalogLevel(item: CatalogItem): Promise<void> {
  useAutoLevel.setState({ status: 'loading', label: item.name });
  try {
    if (item.layouts) {
      const l = await catalogFile(item.layouts);
      if (l) await loadLayoutFiles([new File([l], l.name.endsWith('.layouts.json') ? l.name : `${item.name}.layouts.json`)]);
    }
    const f = await catalogFile(item.path);
    if (!f) throw new Error('not served');
    const m = await modelLoader.load(f, LOD_TARGETS[IMPORT_DEFAULT_LOD], () => undefined);
    if (levelTaken()) {
      useAutoLevel.setState({ status: 'none' });
      return;
    }
    const lv = modelLevelFrom(f.name, m);
    useStore.getState().setLevel(lv);
    useAutoLevel.setState({ status: 'loaded', level: lv.name });
  } catch {
    // The folder's level could not be read: the panel still lists it.
    useAutoLevel.setState({ status: 'none' });
  }
}

/** The theatre a recording flies in, streamed under it; false when it is in none known. */
function streamTheatreUnder(d: Dataset): boolean {
  if (!d.geo) return false;
  const th = theatreOfData(d.geo, d.bounds, d.axes);
  if (!th) return false;
  const placement: GeoPlacement = { geo: d.geo, axes: d.axes ?? null };
  const lv = worldLevelFrom(streamName(th), emptyStream(placement, th), placement);
  useStore.getState().setLevel({ ...lv, stream: { theatre: th.id, imagery: false, runways: true }, showTexture: false });
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
    if (streamTheatreUnder(d)) return;
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
