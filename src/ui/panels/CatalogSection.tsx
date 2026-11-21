import { useEffect, useMemo, useRef, useState } from 'react';
import { notePick } from '../../usage/hooks';
import { int, t } from '../../i18n';
import { useStore } from '../../state/store';
import { useFrostbiteMaps } from '../../data/frostbiteLevel';
import { byGame, classify, fingerprint, levelFor, linkLayouts, type CatalogIndex, type CatalogItem } from '../../data/catalogIndex';
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
    if (!c) continue;
    picked.set(path, f);
    items.push({ path, ...c, bytes: f.size, mtime: f.lastModified, sha256: null, extractor: null, gameBuild: null });
  }
  return { version: 1, root, items: linkLayouts(items), pending: 0 };
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
  if (item.layouts) {
    const l = await fileOf(item.layouts);
    if (l) await loadLayoutFiles([new File([l], l.name.endsWith('.layouts.json') ? l.name : `${item.name}.layouts.json`)]);
  }
  const f = await fileOf(item);
  if (f) await loadModel(f);
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
 * The catalogue folder (the levels folder the extractors write into): what is
 * in it, by game, from the local server's index or a folder picked by hand.
 * A level loads with a click, its layouts with it; data on a map whose level
 * is there gets that level by itself while none is loaded.
 */
export function CatalogSection({ loadModel }: { loadModel: (file: File) => Promise<void> }) {
  const [index, setIndex] = useState<CatalogIndex | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const level = useStore((s) => s.level);
  const wanted = useFrostbiteMaps((s) => s.wanted);
  const dataset = useStore((s) => s.dataset);
  const armaWanted = useMemo(() => armaWantedOf(dataset), [dataset]);

  // The server's index, again while files are still being fingerprinted.
  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ask = () => {
      fetch(CATALOG_ROUTE)
        .then((r) => (r.status === 200 ? (r.json() as Promise<CatalogIndex>) : null))
        .then((ix) => {
          if (stop || !ix || !Array.isArray(ix.items)) return;
          if (!picked.size) setIndex(ix);
          if (ix.pending > 0) timer = setTimeout(ask, 5000);
        })
        .catch(() => {
          // No local server (a hosted build): a folder can still be picked.
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

  const groups = useMemo(() => (index ? byGame(index.items.filter((i) => i.kind === 'level' || i.kind === 'course')) : []), [index]);
  return (
    <div className="catalog">
      <div className="row">
        <span>{t('catalog.title')}</span>
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
      {index && index.pending > 0 && <div className="hint">{t('catalog.hashing', { count: int(index.pending) })}</div>}
      {!level &&
        armaMissing.map((w) => (
          <div key={`${w.game}:${w.id}`} className="hint" data-arma-missing={w.id}>
            {t(w.game === 'arma3' ? 'catalog.armaNoLevel3' : 'catalog.armaNoLevel', { world: w.name })}
          </div>
        ))}
      {groups.map((g) => (
        <details key={g.game}>
          <summary>
            {g.game || '—'} ({int(g.items.length)})
          </summary>
          <div className="chips">
            {g.items.map((it) => (
              <button
                key={it.path}
                className="chip"
                disabled={busy}
                onClick={() => void load(it)}
                title={[it.path, it.extractor, fingerprint(it)?.slice(0, 23)].filter(Boolean).join('\n')}
              >
                {it.name}
                {it.layouts ? ' ◆' : ''}
              </button>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
