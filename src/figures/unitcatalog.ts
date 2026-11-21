/**
 * The games' own unit catalogues, kept on this machine only: every vehicle,
 * weapon and item a game's install lists, with its display name, class, side
 * and the real vehicle it stands for. Each game's ext tool writes them
 * (`catalog` verb) to `<levels>/<game>/catalog.json` as `{ format:
 * '3dheat-catalog', version: 1, game, items: [{ id, kind, name, class,
 * nation, key, model? }] }`; `key` is the real vehicle's name ("T-72B3").
 *
 * The dev and preview servers hand them out at `UNIT_CATALOG_ROUTE`
 * (vite.config.ts) as `{ version: 1, games: [{ game, items }] }`, the items cut
 * to what the viewer uses. They name units (`units.ts`: a DCS `F-16C_50` reads
 * as its display name, with its class and side for the unit list's search and
 * order) and draw a unit no pack of its own game covers with another game's
 * model of the same real vehicle (`lendCatalogModels`). Without catalogues
 * nothing changes.
 */

import { vehicleKey, type ModelPackIndex } from './modelpack';

/** Where the servers serve the catalogues (204 when there are none). */
export const UNIT_CATALOG_ROUTE = '/__heat3d/unit-catalogs';

export interface CatalogUnit {
  id: string;
  name: string;
  kind?: string;
  class?: string;
  nation?: string;
  /** The real vehicle's name, the same in every game ("T-72B3"). */
  key?: string;
  domain?: string;
}

export interface UnitCatalogIndex {
  version: 1;
  games: { game: string; items: CatalogUnit[] }[];
}

/** Lower-case id -> item, the first game's where two games share an id; and per game. */
const byId = new Map<string, CatalogUnit & { game: string }>();
const byGame = new Map<string, Map<string, CatalogUnit>>();

/** Installs the catalogues for `catalogItem`; returns how many items. Replaces what was installed. */
export function installUnitCatalogs(index: UnitCatalogIndex | null): number {
  byId.clear();
  byGame.clear();
  if (!index || index.version !== 1 || !Array.isArray(index.games)) return 0;
  let n = 0;
  for (const g of index.games) {
    if (!g || typeof g.game !== 'string' || !Array.isArray(g.items)) continue;
    const own = new Map<string, CatalogUnit>();
    for (const it of g.items) {
      if (!it || typeof it.id !== 'string' || typeof it.name !== 'string') continue;
      const id = it.id.toLowerCase();
      own.set(id, it);
      if (!byId.has(id)) byId.set(id, { ...it, game: g.game });
      n++;
    }
    byGame.set(g.game.toLowerCase(), own);
  }
  return n;
}

/** A unit's catalogue entry by the id the data names it with (any game, or the one given), or undefined. */
export function catalogItem(id: string, game?: string): (CatalogUnit & { game?: string }) | undefined {
  if (!id || (!byId.size && !byGame.size)) return undefined;
  const k = id.toLowerCase();
  return game ? byGame.get(game.toLowerCase())?.get(k) : byId.get(k);
}

/** The catalogue's display name of a unit id, or '' when no catalogue lists it. */
export function catalogName(id: string): string {
  return catalogItem(id)?.name ?? '';
}

/**
 * Other games' models for the catalogued units no model of their own covers:
 * a unit id whose real vehicle (`key`, else its display name) is a pack
 * unit's name is drawn as that unit's model. `aliases` maps lower-case unit
 * ids to figures (`figures/catalog.ts`); the pack's own units are already in
 * it as `<figure>@model:<game>:<unit>`. Returns how many ids it lent a model.
 */
export function lendCatalogModels(index: UnitCatalogIndex | null, packs: ModelPackIndex | null, aliases: Record<string, string>): number {
  if (!index || !packs || !Array.isArray(packs.packs) || !Array.isArray(index.games)) return 0;
  const byName = new Map<string, string>();
  for (const pack of packs.packs) {
    for (const [unit, info] of Object.entries(pack?.units ?? {})) {
      const fig = aliases[unit.toLowerCase()];
      if (!fig || !fig.includes('@model:')) continue;
      for (const n of [info.name, ...(info.names ?? [])]) {
        const k = typeof n === 'string' ? vehicleKey(n) : '';
        if (k.length >= 3 && !byName.has(k)) byName.set(k, fig);
      }
    }
  }
  let lent = 0;
  for (const g of index.games) {
    for (const it of g?.items ?? []) {
      if (!it || typeof it.id !== 'string' || (it.kind && it.kind !== 'vehicle')) continue;
      const id = it.id.toLowerCase();
      if (aliases[id]?.includes('@model:')) continue;
      const fig = byName.get(vehicleKey(it.key || it.name || ''));
      if (!fig) continue;
      aliases[id] = fig;
      lent++;
    }
  }
  return lent;
}

/** The catalogues the server hands out, or null (none, no route). Never throws. */
export async function fetchUnitCatalogs(): Promise<UnitCatalogIndex | null> {
  try {
    const r = await fetch(UNIT_CATALOG_ROUTE, { cache: 'no-cache' });
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
    const c = (await r.json()) as UnitCatalogIndex;
    return c && c.version === 1 && Array.isArray(c.games) ? c : null;
  } catch {
    return null;
  }
}
