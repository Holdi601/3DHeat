/**
 * The catalogue folder index: everything the extractors wrote into one folder
 * (the levels folder, `E:\...\3DHeat-Data\levels` on the author's machine),
 * told apart by where it sits and what it is called, each item with a content
 * fingerprint.
 *
 *     <root>/<game>/<Level>.glb              a level
 *     <root>/<game>/<Level>.layouts.json     its game-mode layouts (beside it)
 *     <root>/<game>/courses/<course>.glb     a race course
 *     <root>/<game>/ranges.json              the game's range catalogue
 *     <root>/<game>/*.h3dcars                a car pack
 *     <root>/figure-packs/<pack>/figures*.json   a figure pack
 *
 * Anything else with a known extension is listed as `other`, so a new kind of
 * extract shows up before the viewer knows what to do with it.
 *
 * The fingerprint is what two copies of an item are compared by: the SHA-256
 * of the file's bytes, with the extractor and its version and the game's
 * build where the file says them (`sha256:<hex>|<extractor>|<build>`). Two
 * players with the same fingerprint have the same item; a later multiplayer
 * session compares a client's fingerprints with the host's to know what each
 * side already has (sharing an item itself waits for the host to confirm it
 * holds the rights to it).
 *
 * Shared by the local server (vite.config.ts), which hashes the files, and the
 * page, which can index a folder picked by hand without one.
 */

export type CatalogKind = 'level' | 'layouts' | 'course' | 'ranges' | 'cars' | 'figure-pack' | 'model-pack' | 'catalog' | 'other';

export interface CatalogItem {
  /** The path under the root, with forward slashes: the item's id. */
  path: string;
  /** The game's folder (`battlefield-4`, `cs2`); '' for what belongs to none. */
  game: string;
  kind: CatalogKind;
  /** A level's or course's name (`MP_Prison`), a pack's folder, the file's stem otherwise. */
  name: string;
  bytes: number;
  /** Last change, ms since 1970. */
  mtime: number;
  /** The file's SHA-256, hex; null until it is hashed. */
  sha256: string | null;
  /** The extractor that wrote it and its version, where the file says (`heat3d-battlefield-maps 0.2.1`). */
  extractor: string | null;
  /** The game's build the extract came from, where the file says. */
  gameBuild: string | null;
  /** A level's layouts file, by path. */
  layouts?: string;
}

export interface CatalogIndex {
  version: 1;
  /** Where it was read from, as the server or the picker saw it. */
  root: string;
  items: CatalogItem[];
  /** Items still being hashed. */
  pending: number;
}

/** Folders that are not a game's. */
const NOT_GAMES = new Set(['figure-packs', 'model-packs']);

const KNOWN = /\.(glb|gltf|json|h3dcars|parquet|3dheat|csv|png|jpg|webp)$/i;

/** What a file under the root is, from its path alone; null for files that are not extracts (logs, notes, locks). */
export function classify(path: string): Pick<CatalogItem, 'game' | 'kind' | 'name'> | null {
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) return null;
  const file = parts[parts.length - 1];
  if (file.startsWith('.') || !KNOWN.test(file)) return null;
  const top = parts.length > 1 ? parts[0] : '';
  const stem = file.replace(/\.layouts\.json$/i, '').replace(/\.[^.]+$/, '');
  if (top === 'figure-packs') {
    if (/^figures.*\.json$/i.test(file)) return { game: '', kind: 'figure-pack', name: parts.length > 2 ? parts[1] : stem };
    return null;
  }
  // A game's model pack is one item, its index: the unit models and side files under it are its own.
  if (top === 'model-packs') return parts.length === 3 && file === 'model-pack.json' ? { game: parts[1], kind: 'model-pack', name: parts[1] } : null;
  const game = NOT_GAMES.has(top) ? '' : top;
  if (parts.length === 2 && file === 'catalog.json') return { game, kind: 'catalog', name: game };
  if (/\.layouts\.json$/i.test(file)) return { game, kind: 'layouts', name: stem };
  if (/^ranges\.json$/i.test(file)) return { game, kind: 'ranges', name: game || stem };
  if (/\.h3dcars$/i.test(file)) return { game, kind: 'cars', name: stem };
  if (/\.(glb|gltf)$/i.test(file)) return { game, kind: parts.includes('courses') ? 'course' : 'level', name: stem };
  // A DCS area's own .json beside its .glb (where it lies, towns, airfields, buildings): read with it (`autoLevel.tsx`).
  if (/\.json$/i.test(file) && game === 'dcs' && parts.length > 2) return { game, kind: 'other', name: stem };
  if (/\.(png|jpg|webp|csv|json)$/i.test(file)) return parts.length === 2 ? { game, kind: 'other', name: stem } : null;
  return { game, kind: 'other', name: stem };
}

/** The fingerprint two copies of an item are compared by; null until the file is hashed. */
export function fingerprint(item: Pick<CatalogItem, 'sha256' | 'extractor' | 'gameBuild'>): string | null {
  if (!item.sha256) return null;
  return `sha256:${item.sha256}|${item.extractor ?? ''}|${item.gameBuild ?? ''}`;
}

/** Joins each level to its layouts file beside it. */
export function linkLayouts(items: CatalogItem[]): CatalogItem[] {
  const layouts = new Map<string, string>();
  for (const it of items) if (it.kind === 'layouts') layouts.set(`${it.game}/${it.name.toLowerCase()}`, it.path);
  return items.map((it) => {
    const l = it.kind === 'level' ? layouts.get(`${it.game}/${it.name.toLowerCase()}`) : undefined;
    return l ? { ...it, layouts: l } : it;
  });
}

/** What a `.glb`'s JSON chunk says of who wrote it (`asset.extras.source`, `.version`, `.gameBuild`), from its first bytes. */
export function glbExtras(head: Uint8Array): { extractor: string | null; gameBuild: string | null } {
  const none = { extractor: null, gameBuild: null };
  if (head.length < 20) return none;
  const dv = new DataView(head.buffer, head.byteOffset, head.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) return none;
  const n = dv.getUint32(12, true);
  if (dv.getUint32(16, true) !== 0x4e4f534a || 20 + n > head.length) return none;
  try {
    const j = JSON.parse(new TextDecoder().decode(head.subarray(20, 20 + n))) as { asset?: { extras?: Record<string, unknown>; generator?: string } };
    const x = j.asset?.extras ?? {};
    const src = typeof x.source === 'string' ? x.source : (j.asset?.generator ?? null);
    const ver = typeof x.version === 'string' ? x.version : null;
    const build = typeof x.gameBuild === 'string' ? x.gameBuild : typeof x.build === 'string' ? x.build : null;
    return { extractor: src ? (ver && !src.includes(ver) ? `${src} ${ver}` : src) : null, gameBuild: build };
  } catch {
    return none;
  }
}

/** What a JSON extract says of who wrote it (`source`, `gameBuild`), from its text. */
export function jsonExtras(text: string): { extractor: string | null; gameBuild: string | null } {
  const src = /"source"\s*:\s*"([^"]{1,120})"/.exec(text.slice(0, 4096));
  const build = /"(?:gameBuild|game_build)"\s*:\s*"([^"]{1,80})"/.exec(text.slice(0, 4096));
  return { extractor: src ? src[1] : null, gameBuild: build ? build[1] : null };
}

/** The items grouped by game, games in name order, levels first within each. */
export function byGame(items: readonly CatalogItem[]): { game: string; items: CatalogItem[] }[] {
  const order: CatalogKind[] = ['level', 'course', 'model-pack', 'catalog', 'figure-pack', 'ranges', 'cars', 'layouts', 'other'];
  const groups = new Map<string, CatalogItem[]>();
  for (const it of items) {
    const g = groups.get(it.game);
    if (g) g.push(it);
    else groups.set(it.game, [it]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)))
    .map(([game, list]) => ({ game, items: list.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || a.name.localeCompare(b.name)) }));
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * The level for data on a map: the one level whose name is the map's
 * (`MP_Prison`, `de_dust2`), of the given game when one is known; null when
 * none or several match (two games share an `MP_Naval`).
 */
export function levelFor(items: readonly CatalogItem[], map: string, game?: string): CatalogItem | null {
  const want = norm(map);
  if (!want) return null;
  const hits = items.filter((it) => it.kind === 'level' && norm(it.name) === want && (!game || it.game === game));
  return hits.length === 1 ? hits[0] : null;
}

/**
 * The level for data a file names the map and game of: in the game's folder
 * when there is one of that name (`warthunder`), else the one level of that
 * name in any (a container's game id need not be its folder's name).
 */
export function levelForMap(items: readonly CatalogItem[], map: string, game: string | null): CatalogItem | null {
  return (game ? levelFor(items, map, game) : null) ?? levelFor(items, map);
}
