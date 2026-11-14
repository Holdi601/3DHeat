/**
 * A local figure pack: figures kept on this machine only, outside the
 * repository, that replace the catalogue's figures of the same names while
 * the pack is present (for example figures prepared from material that may
 * not be published). Without a pack nothing changes.
 *
 * The pack is one JSON file, `{ "version": 1, "figures": { "<catalogue
 * name>": MeshFigureData, ... } }` (see `meshfig.ts`), each figure a full
 * mesh figure with its own coarse and far builds, its turret and gun as
 * jointed parts. Where one catalogue figure stands for game units of
 * different shapes, the pack may carry a figure per unit: `units` maps a
 * unit id to the pack figure it is drawn as, a catalogue name or a variant
 * `<catalogue name>@<anything>` that joins the catalogue as that figure's
 * kin (same domain and class) while the pack is installed. The dev and preview servers hand it out at
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
  /** Unit id (as the game names it) -> the pack figure it is drawn as. */
  units?: Record<string, string>;
}

/** Where the dev and preview servers serve the pack (404 when there is none). */
export const FIGURE_PACK_ROUTE = '/__heat3d/figure-pack';

interface Entry {
  build: () => Template;
}

/** The catalogue's own builders of the figures a pack replaced, by name (to put back). */
const replaced = new Map<string, () => Template>();
/** Variant figures a pack added to the catalogue (to take out again). */
const added = new Set<string>();
/** Aliases a pack's units set, with what each was before (to put back; undefined = none). */
const aliased = new Map<string, string | undefined>();
let aliasTable: Record<string, string> | undefined;

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
 * `builders` (the contact sheet's name -> builder map) follows along. Variant figures (`<name>@...`) of a catalogue
 * figure join the catalogue as its kin, and with `aliases` (the catalogue's alias table) the pack's `units` are drawn
 * as the pack figures they name. Returns how many figures it replaced or added.
 */
export function installFigurePack<E extends Entry>(
  catalog: Record<string, E>,
  pack: FigurePack,
  builders?: Record<string, () => Template>,
  aliases?: Record<string, string>,
): number {
  if (!pack || pack.version !== 1 || typeof pack.figures !== 'object') return 0;
  let n = 0;
  for (const [name, m] of Object.entries(pack.figures)) {
    if (!valid(m)) continue;
    const at = name.indexOf('@');
    const kin = at > 0 ? catalog[name.slice(0, at)] : undefined;
    if (at > 0 && kin && !catalog[name]) {
      // A variant: the kin's own builder stands behind it (a hybrid takes that one's hull).
      const own = replaced.get(name.slice(0, at)) ?? kin.build;
      catalog[name] = { ...kin, build: () => buildMeshFigure(m, own) };
      added.add(name);
      if (builders) builders[name] = catalog[name].build;
      n++;
      continue;
    }
    const e = catalog[name];
    if (!e) continue;
    const own = replaced.get(name) ?? e.build;
    replaced.set(name, own);
    e.build = () => buildMeshFigure(m, own);
    if (builders) builders[name] = e.build;
    n++;
  }
  if (aliases && pack.units && typeof pack.units === 'object') {
    aliasTable = aliases;
    for (const [unit, name] of Object.entries(pack.units)) {
      if (typeof name !== 'string' || !catalog[name] || !pack.figures[name]) continue;
      const key = unit.toLowerCase();
      if (!aliased.has(key)) aliased.set(key, aliases[key]);
      aliases[key] = name;
    }
  }
  return n;
}

/** Puts the catalogue's own figures and aliases back. */
export function removeFigurePack<E extends Entry>(catalog: Record<string, E>, builders?: Record<string, () => Template>): void {
  for (const [name, own] of replaced) {
    if (catalog[name]) catalog[name].build = own;
    if (builders) builders[name] = own;
  }
  replaced.clear();
  for (const name of added) {
    delete catalog[name];
    if (builders) delete builders[name];
  }
  added.clear();
  if (aliasTable) {
    for (const [key, was] of aliased) {
      if (was === undefined) delete aliasTable[key];
      else aliasTable[key] = was;
    }
  }
  aliased.clear();
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
