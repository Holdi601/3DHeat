import { useEffect, useMemo, useRef, useState } from 'react';
import { notePick } from '../../usage/hooks';
import { int, t } from '../../i18n';
import { useStore } from '../../state/store';
import { useFrostbiteMaps } from '../../data/frostbiteLevel';
import { classify, fingerprint, LEVEL_IMAGE, levelFor, levelForMap, linkLayouts, linkThumbs, TERRAIN_BIN, type CatalogIndex, type CatalogItem } from '../../data/catalogIndex';
import { folderGameName, mapTitle } from '../../data/mapNames';
import { notePickedLevel, useCatalogSelection } from '../../state/catalogSelection';
import { sameLevel } from '../../session/levelRequest';
import { UnitModels } from './UnitModels';
import { useAutoLevel } from './autoLevel';
import { blobReader, urlReader, type TerrainReader } from '../../world/terrainFormat';
import { openTerrainLevel } from './terrainLevel';
import { armaLevelFor, armaWorldOf, armaWorldsOfLabels, type ArmaWorld } from '../../data/armaWorlds';
import { previewedWorlds } from '../../data/ingestOcap';
import type { Dataset } from '../../state/types';
import { loadLayoutFiles } from '../../state/levelLayoutsStore';

/** Where the local server answers the catalogue folder's index (vite.config.ts). */
export const CATALOG_ROUTE = '/__heat3d/catalog';

/** A folder picked by hand: its files by path under it, for loading. */
let picked = new Map<string, File>();
/** The index shown now (the server's or a picked folder's), for loading a level by name. */
let shown: CatalogIndex | null = null;

function indexOfPicked(files: FileList): CatalogIndex {
  picked = new Map();
  const items: CatalogItem[] = [];
  let root = '';
  for (const f of Array.from(files)) {
    const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
    const parts = rel.split('/');
    root = root || (parts.length > 1 ? parts[0] : '');
    const path = parts.length > 1 ? parts.slice(1).join('/') : rel;
    const c = classify(path);
    if (!c) {
      // A tiled terrain's tiles: read a range at a time beside its index; a level's picture: shown when picking it.
      if (TERRAIN_BIN.test(path) || LEVEL_IMAGE.test(path)) picked.set(path, f);
      continue;
    }
    picked.set(path, f);
    items.push({ path, ...c, bytes: f.size, mtime: f.lastModified, sha256: null, extractor: null, gameBuild: null });
  }
  return { version: 1, root, items: linkThumbs(linkLayouts(items), [...picked.keys()].filter((p) => LEVEL_IMAGE.test(p))), pending: 0 };
}

/** The level (or course) `same` picks in the levels folder, or null: the index shown, else the local server's. */
export async function catalogLevel(same: (item: CatalogItem) => boolean): Promise<CatalogItem | null> {
  let ix = shown;
  if (!ix) {
    try {
      const r = await fetch(CATALOG_ROUTE);
      ix = r.status === 200 ? ((await r.json()) as CatalogIndex) : null;
    } catch {
      ix = null;
    }
  }
  if (!ix || !Array.isArray(ix.items)) return null;
  return ix.items.find((i) => (i.kind === 'level' || i.kind === 'course') && same(i)) ?? null;
}

/** Loads a level of the folder, its layouts first. */
export async function loadCatalogItem(item: CatalogItem, loadModel: (file: File) => Promise<void>): Promise<void> {
  notePick('catalogue', [item.path]);
  try {
    await loadCatalogItemFiles(item, loadModel);
  } finally {
    // Noted once it is on screen (or not: then nothing is noted), for the session's sharing and the level panel.
    const now = useStore.getState().level;
    if (now && sameLevel(now.name, item)) notePickedLevel(item);
  }
}

async function loadCatalogItemFiles(item: CatalogItem, loadModel: (file: File) => Promise<void>): Promise<void> {
  if (item.layouts) {
    const l = await fileOf(item.layouts);
    if (l) await loadLayoutFiles([new File([l], l.name.endsWith('.layouts.json') ? l.name : `${item.name}.layouts.json`)]);
  }
  if (item.terrain) {
    const lv = await terrainLevelOf(item);
    if (lv) {
      useStore.getState().setLevel(lv);
      return;
    }
  }
  const f = await fileOf(item);
  if (f) await loadModel(f);
}

/**
 * A level's tiled terrain (`item.terrain`) as its level, its tiles read by
 * range from the picked folder or the local server; null when it cannot be read
 * (the glb is loaded instead).
 */
export async function terrainLevelOf(item: CatalogItem): Promise<import('../../render/level').ModelLevel | null> {
  if (!item.terrain) return null;
  try {
    const ix = await fileOf(item.terrain);
    if (!ix) return null;
    const text = await ix.text();
    const bin = (JSON.parse(text) as { bin?: unknown }).bin;
    if (typeof bin !== 'string') return null;
    const binPath = item.terrain.replace(/[^/]*$/, '') + bin;
    const local = picked.get(binPath);
    const reader: TerrainReader = local ? blobReader(local) : urlReader(`${CATALOG_ROUTE}/file?path=${encodeURIComponent(binPath)}`);
    return await openTerrainLevel(item.name, text, reader);
  } catch {
    return null;
  }
}

async function fileOf(item: CatalogItem | string): Promise<File | null> {
  const path = typeof item === 'string' ? item : item.path;
  const local = picked.get(path);
  if (local) return local;
  const r = await fetch(`${CATALOG_ROUTE}/file?path=${encodeURIComponent(path)}`);
  if (!r.ok) return null;
  return new File([await r.blob()], path.split('/').pop() ?? path);
}

/**
 * The worlds of a dataset's Arma recordings (OCAP): by its World and Game
 * columns, and by the recordings previewed for it (a column the same on every
 * row may have been left out of a large load).
 */
function armaWantedOf(dataset: Dataset | null): ArmaWorld[] {
  if (!dataset) return [];
  const labels = (name: string) => dataset.attrs.find((a) => a.name === name && a.kind === 'category')?.categories ?? [];
  const out = armaWorldsOfLabels(labels('World'), labels('Game'));
  for (const s of dataset.sessionLabels) {
    const p = previewedWorlds.get(s);
    const w = p ? armaWorldOf(p.world, p.reforger) : null;
    if (w && !out.some((o) => o.game === w.game && o.id === w.id)) out.push(w);
  }
  return out;
}

/**
 * Loaded Arma recordings get their world's level from the levels folder by
 * themselves, once per set of worlds and only while no level is loaded. The
 * level panel runs it, open or not; the folder's index is the one the catalogue
 * section showed, else the local server's.
 */
export function useArmaLevelAuto(loadModel: (file: File) => Promise<void>): void {
  const dataset = useStore((s) => s.dataset);
  const level = useStore((s) => s.level);
  const wanted = useMemo(() => armaWantedOf(dataset), [dataset]);
  const done = useRef('');
  useEffect(() => {
    if (level || !wanted.length) return;
    const key = wanted.map((w) => `${w.game}:${w.id}`).join(',');
    if (done.current === key) return;
    done.current = key;
    void (async () => {
      const ix =
        shown ??
        (await fetch(CATALOG_ROUTE)
          .then((r) => (r.status === 200 ? (r.json() as Promise<CatalogIndex>) : null))
          .catch(() => null));
      const hit = ix && Array.isArray(ix.items) ? wanted.map((w) => armaLevelFor(ix.items, w)).find(Boolean) : null;
      if (!hit || useStore.getState().level) return;
      await loadCatalogItem(hit, loadModel);
    })();
  }, [level, wanted, loadModel]);
}

/**
 * The catalogue folder (the levels folder the extractors write into), as a
 * game and a map of it to pick: only what is extracted is listed, from the
 * local server's index (or a folder picked by hand where there is no local
 * server), each map by its name with its picture where the extractor left one.
 * Data on a map whose level is there gets that level by itself while none is
 * loaded. Below, the unit models the loaded data is drawn with.
 */
export function CatalogSection({ loadModel }: { loadModel: (file: File) => Promise<void> }) {
  const [index, setIndex] = useState<CatalogIndex | null>(null);
  const [server, setServer] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const level = useStore((s) => s.level);
  const wanted = useFrostbiteMaps((s) => s.wanted);
  const dataset = useStore((s) => s.dataset);
  const armaWanted = useMemo(() => armaWantedOf(dataset), [dataset]);
  const selection = useCatalogSelection();

  // The server's index, again while files are still being fingerprinted.
  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ask = () => {
      fetch(CATALOG_ROUTE)
        .then((r) => (r.status === 200 ? (r.json() as Promise<CatalogIndex>) : null))
        .then((ix) => {
          if (stop) return;
          const ok = !!ix && Array.isArray(ix.items);
          setServer(ok);
          if (!ok) return;
          if (!picked.size) setIndex(ix);
          if (ix.pending > 0) timer = setTimeout(ask, 5000);
        })
        .catch(() => {
          // No local server (a hosted build): a folder can still be picked.
          if (!stop) setServer(false);
        });
    };
    ask();
    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // What the panel shows is what a level asked for by name is looked up in.
  useEffect(() => {
    shown = index;
  }, [index]);

  const load = async (item: CatalogItem) => {
    setBusy(true);
    try {
      await loadCatalogItem(item, loadModel);
    } finally {
      setBusy(false);
    }
  };

  // Data on a map whose level is in the folder: that level, once per set of maps, while none is loaded.
  const auto = useRef('');
  useEffect(() => {
    if (!index || level || !wanted.length) return;
    const key = wanted.join(',');
    if (auto.current === key) return;
    const hit = wanted.map((m) => levelFor(index.items, m)).find(Boolean);
    if (!hit) return;
    auto.current = key;
    void load(hit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, level, wanted]);
  // Arma worlds with no level in the folder: said, so a missing level is not taken for a broken load.
  const armaMissing = armaWanted.filter((w) => !index || !armaLevelFor(index.items, w));

  const games = useMemo(() => (index ? mapsByGame(index.items) : []), [index]);
  // The level of the data's map, where the data names one (a War Thunder replay's `avg_netherlands`).
  const dataMap = useAutoLevel((s) => s.wanted);
  const dataLevel = useMemo(() => (index && dataMap?.map ? levelForMap(index.items, dataMap.map, dataMap.game) : null), [index, dataMap]);
  // The game shown: the one picked, else the loaded level's, else the data's, else the first.
  const [pickedGame, setPickedGame] = useState('');
  const has = (g: string | null | undefined) => !!g && games.some((x) => x.game === g);
  const game = (has(pickedGame) && pickedGame) || (has(selection.level?.game) && selection.level!.game) || (has(dataLevel?.game) && dataLevel!.game) || (has(selection.dataGame) && selection.dataGame) || games[0]?.game || '';
  const maps = games.find((g) => g.game === game)?.maps ?? [];
  const [pickedMap, setPickedMap] = useState('');
  const map = maps.find((m) => m.item.path === pickedMap) ?? maps.find((m) => m.item.path === selection.level?.id) ?? maps.find((m) => m.item.path === dataLevel?.path) ?? maps[0] ?? null;
  const onScreen = !!map && selection.level?.id === map.item.path;

  return (
    <div className="catalog" data-catalog>
      {index && index.pending > 0 && <div className="hint">{t('catalog.hashing', { count: int(index.pending) })}</div>}
      {!level &&
        armaMissing.map((w) => (
          <div key={`${w.game}:${w.id}`} className="hint" data-arma-missing={w.id}>
            {t(w.game === 'arma3' ? 'catalog.armaNoLevel3' : 'catalog.armaNoLevel', { world: w.name })}
          </div>
        ))}
      {index && !games.length && <div className="hint">{t('catalog.none')}</div>}
      {games.length > 0 && (
        <>
          <div className="field">
            <div className="label">
              <span>{t('catalog.game')}</span>
            </div>
            <select
              data-catalog-game
              value={game}
              onChange={(e) => {
                setPickedGame(e.target.value);
                setPickedMap('');
              }}
            >
              {games.map((g) => (
                <option key={g.game} value={g.game}>
                  {t('catalog.gameOption', { game: g.title, count: g.maps.length })}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <div className="label">
              <span>{t('catalog.map')}</span>
            </div>
            <select data-catalog-map value={map?.item.path ?? ''} onChange={(e) => setPickedMap(e.target.value)}>
              {maps.map((m) => (
                <option key={m.item.path} value={m.item.path}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
          {map?.item.thumb && <Thumb path={map.item.thumb} alt={t('catalog.thumbAlt', { map: map.title })} />}
          <div className="row">
            <button
              className="primary"
              data-catalog-load
              disabled={busy || !map || onScreen}
              onClick={() => map && void load(map.item)}
              title={map ? [map.item.path, map.item.extractor, fingerprint(map.item)?.slice(0, 23)].filter(Boolean).join('\n') : undefined}
            >
              {busy ? t('catalog.loading') : onScreen ? t('catalog.onScreen') : t('catalog.load')}
            </button>
          </div>
          {map?.item.layouts && <div className="hint">{t('catalog.layouts')}</div>}
        </>
      )}
      {server === false && (
        <div className="row">
          <button disabled={busy} onClick={() => input.current?.click()} title={t('catalog.pickTitle')}>
            {t('catalog.pick')}
          </button>
          <input
            ref={input}
            type="file"
            style={{ display: 'none' }}
            {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
            onChange={(e) => {
              if (e.target.files?.length) setIndex(indexOfPicked(e.target.files));
            }}
          />
        </div>
      )}
      <UnitModels game={game} />
    </div>
  );
}

/** A map's picture: from the picked folder or the local server. */
function Thumb({ path, alt }: { path: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState('');
  useEffect(() => {
    const local = picked.get(path);
    if (!local) {
      setUrl(`${CATALOG_ROUTE}/file?path=${encodeURIComponent(path)}`);
      return;
    }
    const u = URL.createObjectURL(local);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [path]);
  if (!url || failed === url) return null;
  return <img className="catalog-thumb" src={url} alt={alt} loading="lazy" onError={() => setFailed(url)} />;
}

const PREVIEW = /(^|\/)preview\//i;

/** The levels and courses of an index by game: games by name, maps by their names; a preview only where the full map is not there. */
export function mapsByGame(items: readonly CatalogItem[]): { game: string; title: string; maps: { item: CatalogItem; title: string }[] }[] {
  const out = new Map<string, { item: CatalogItem; title: string }[]>();
  for (const it of items) {
    if ((it.kind !== 'level' && it.kind !== 'course') || !it.game) continue;
    const list = out.get(it.game) ?? [];
    list.push({ item: it, title: mapTitle(it.game, it.name, it.path) });
    out.set(it.game, list);
  }
  return [...out.entries()]
    .map(([game, maps]) => {
      const full = new Set(maps.filter((m) => !PREVIEW.test(m.item.path)).map((m) => m.item.name.toLowerCase()));
      const kept = maps.filter((m) => !PREVIEW.test(m.item.path) || !full.has(m.item.name.replace(/-\d+m-preview$/i, '').toLowerCase()));
      return { game, title: folderGameName(game), maps: kept.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true })) };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
