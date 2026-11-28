/**
 * A unit model of a pack a session's host shared, made into its pack figure
 * where it is asked for (the page or the pack worker): read from this
 * browser's cache of shared files by its SHA-256, checked again, and turned
 * into the figure as the servers turn a local pack's units
 * (`figureFromModelGlb`, then the pack figure's encoding). The address is
 * `shared:<sha256>:<scale>` (`session/sharedPacks.ts`).
 */

import { encodePackFigure } from './figurepackBin';
import { figureFromModelGlb } from './modelpack';

/** The cache the session's shared files are kept in (`session/assets.ts`). */
export const SHARED_CACHE = 'heat3d-assets-v1';
export const sharedCacheKey = (hash: string) => `https://heat3d.invalid/a/${hash}`;

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  return [...d].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function sharedFigureBytes(at: string): Promise<Uint8Array | null> {
  const m = /^shared:([0-9a-f]{64}):([0-9.]+)$/.exec(at);
  if (!m || typeof caches === 'undefined') return null;
  try {
    const hit = await (await caches.open(SHARED_CACHE)).match(sharedCacheKey(m[1]));
    if (!hit) return null;
    const buf = await hit.arrayBuffer();
    if ((await sha256Hex(buf)) !== m[1]) return null;
    const scale = Number(m[2]);
    return encodePackFigure(figureFromModelGlb(new Uint8Array(buf), scale > 0 ? scale : 1));
  } catch {
    return null;
  }
}
