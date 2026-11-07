/**
 * Downloaded tiles, kept in the browser so the same area loads again offline.
 *
 * The Cache API, which a worker can use as well as a page: one cache, keyed by
 * the tile's URL. Vector tile URLs carry the map's build date, so a newer map
 * is fetched afresh while the older tiles stay usable until the cache is
 * cleared. Tiles never leave this browser: the backdrop is built from them here
 * and nothing derived from them is shipped (see docs/world-backdrop.md on
 * ODbL).
 */

export const CACHE_NAME = '3dheat-world-tiles-v1';

/** Where a tile's bytes came from, for the summary. */
export interface Fetched {
  bytes: ArrayBuffer | null;
  cached: boolean;
  /** Asked for from the cache only, and the cache did not have it. */
  missing?: boolean;
}

/**
 * Where to look first. `cache-only` never touches the network: what a build
 * asks for once its download allowance is spent.
 */
export type FetchMode = 'cache-first' | 'network-first' | 'cache-only';

async function open(): Promise<Cache | null> {
  try {
    return typeof caches === 'undefined' ? null : await caches.open(CACHE_NAME);
  } catch {
    // An insecure origin, or storage switched off: download every time.
    return null;
  }
}

/**
 * A URL's bytes, from the cache when it has them; null for a tile the server
 * does not have (404, 204: open sea, the edge of the data). Other failures
 * throw.
 */
export async function cachedFetch(url: string, mode: FetchMode | boolean = 'cache-first'): Promise<Fetched> {
  if (mode === true) mode = 'network-first';
  else if (mode === false) mode = 'cache-first';
  const cache = await open();
  if (cache && mode !== 'network-first') {
    const hit = await cache.match(url);
    if (hit) return { bytes: hit.status === 204 ? null : await hit.arrayBuffer(), cached: true };
  }
  if (mode === 'cache-only') return { bytes: null, cached: false, missing: true };
  let res: Response;
  try {
    res = await fetch(url, { mode: 'cors', credentials: 'omit' });
  } catch (err) {
    // Offline: the copy kept last time, when the caller asked for the network first.
    const hit = cache ? await cache.match(url) : undefined;
    if (hit) return { bytes: hit.status === 204 ? null : await hit.arrayBuffer(), cached: true };
    throw err;
  }
  if (res.status === 404 || res.status === 204) {
    // Remember the absence too, so a second load does not ask again.
    if (cache) await cache.put(url, new Response(null, { status: 204 })).catch(() => undefined);
    return { bytes: null, cached: false };
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const bytes = await res.arrayBuffer();
  if (cache) {
    await cache
      .put(
        url,
        new Response(bytes.slice(0), {
          headers: {
            'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream',
            [BYTES_HEADER]: String(bytes.byteLength),
            [TIME_HEADER]: String(Date.now()),
          },
        }),
      )
      .catch(() => undefined);
    stored += bytes.byteLength;
    if (stored > CHECK_EVERY_BYTES) {
      stored = 0;
      void enforceBudget().catch(() => undefined);
    }
  }
  return { bytes, cached: false };
}

/**
 * How much the tile cache may hold. Streaming a theatre downloads as the
 * camera goes, so the cache is kept to a budget rather than each build being
 * capped: past it, the tiles stored longest ago are deleted first (they come
 * back from the network if wanted again).
 */
export const CACHE_BUDGET_BYTES = 2 * 1024 * 1024 * 1024;
/** The budget is checked after this many new bytes. */
const CHECK_EVERY_BYTES = 64 * 1024 * 1024;
const BYTES_HEADER = 'x-heat3d-bytes';
const TIME_HEADER = 'x-heat3d-time';
let stored = 0;

/**
 * Deletes the oldest tiles until the cache is within `budget`. Sizes and
 * times come from headers written when each tile was stored, so no tile's
 * body is read; tiles stored before those headers existed count as oldest.
 */
export async function enforceBudget(budget = CACHE_BUDGET_BYTES): Promise<number> {
  const cache = await open();
  if (!cache) return 0;
  const entries: Array<{ req: Request; bytes: number; time: number }> = [];
  let total = 0;
  for (const req of await cache.keys()) {
    const r = await cache.match(req);
    if (!r) continue;
    const bytes = Number(r.headers.get(BYTES_HEADER) ?? 0) || 0;
    entries.push({ req, bytes, time: Number(r.headers.get(TIME_HEADER) ?? 0) || 0 });
    total += bytes;
  }
  if (total <= budget) return 0;
  entries.sort((a, b) => a.time - b.time);
  let freed = 0;
  for (const e of entries) {
    if (total <= budget) break;
    await cache.delete(e.req);
    total -= e.bytes;
    freed += e.bytes;
  }
  return freed;
}

/** Bytes and entries the tile cache holds, when the browser can say. */
export async function cacheSize(): Promise<{ entries: number; bytes: number } | null> {
  const cache = await open();
  if (!cache) return null;
  const keys = await cache.keys();
  let bytes = 0;
  for (const k of keys) {
    const r = await cache.match(k);
    if (r) bytes += (await r.blob()).size;
  }
  return { entries: keys.length, bytes };
}

/** Forgets every downloaded tile. */
export async function clearCache(): Promise<void> {
  if (typeof caches !== 'undefined') await caches.delete(CACHE_NAME);
}
