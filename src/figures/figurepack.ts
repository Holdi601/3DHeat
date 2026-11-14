/**
 * A local figure pack: figures kept on this machine only, outside the
 * repository, that replace the catalogue's figures of the same names while
 * the pack is present (for example figures prepared from material that may
 * not be published). Without a pack nothing changes.
 *
 * The pack is one JSON file, `{ "version": 1, "figures": { "<catalogue
 * name>": MeshFigureData, ... } }` (see `meshfig.ts`), each figure a full
 * mesh figure with its own coarse and far builds, its turret and gun as
 * jointed parts. The dev and preview servers hand it out at
 * `FIGURE_PACK_ROUTE` from the path in the `HEAT3D_FIGURE_PACK` environment
 * variable or, failing that, the `figurePack` entry of the git-ignored
 * `tools/local-data.json` (vite.config.ts); a build served any other way finds
 * no pack. The catalogue asks for it once per thread (the model worker waits
 * for the answer before its first build), and tests or tools install one
 * with `installFigurePack`.
 */

import { buildMeshFigure, type MeshFigureData } from './meshfig';
import type { Template } from './kit';

export interface FigurePack {
  version: 1;
  figures: Record<string, MeshFigureData>;
}

/** Where the dev and preview servers serve the pack (404 when there is none). */
export const FIGURE_PACK_ROUTE = '/__heat3d/figure-pack';

interface Entry {
  build: () => Template;
}

/** The catalogue's own builders of the figures a pack replaced, by name (to put back). */
const replaced = new Map<string, () => Template>();

function valid(m: unknown): m is MeshFigureData {
  const d = m as MeshFigureData;
  return (
    !!d &&
    (d.anchor === 'ground' || d.anchor === 'centre') &&
    Array.isArray(d.box) &&
    d.box.length === 6 &&
    Array.isArray(d.parts) &&
    d.parts.length > 0 &&
    Array.isArray(d.lods) &&
    d.lods.length > 0 &&
    d.lods.every((l) => typeof l === 'string')
  );
}

/**
 * Puts the pack's figures in place of the catalogue's of the same names (names the catalogue lacks are skipped);
 * `builders` (the contact sheet's name -> builder map) follows along. Returns how many figures it replaced.
 */
export function installFigurePack(catalog: Record<string, Entry>, pack: FigurePack, builders?: Record<string, () => Template>): number {
  if (!pack || pack.version !== 1 || typeof pack.figures !== 'object') return 0;
  let n = 0;
  for (const [name, m] of Object.entries(pack.figures)) {
    const e = catalog[name];
    if (!e || !valid(m)) continue;
    const own = replaced.get(name) ?? e.build;
    replaced.set(name, own);
    e.build = () => buildMeshFigure(m, own);
    if (builders) builders[name] = e.build;
    n++;
  }
  return n;
}

/** Puts the catalogue's own figures back. */
export function removeFigurePack(catalog: Record<string, Entry>, builders?: Record<string, () => Template>): void {
  for (const [name, own] of replaced) {
    if (catalog[name]) catalog[name].build = own;
    if (builders) builders[name] = own;
  }
  replaced.clear();
}

/** The pack the server hands out, or null (no server route, no pack, or not a pack). Never throws. */
export async function fetchFigurePack(): Promise<FigurePack | null> {
  try {
    const r = await fetch(FIGURE_PACK_ROUTE, { cache: 'no-store' });
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
    const p = (await r.json()) as FigurePack;
    return p && p.version === 1 && typeof p.figures === 'object' ? p : null;
  } catch {
    return null;
  }
}
