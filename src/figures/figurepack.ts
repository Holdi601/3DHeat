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
 * no pack.
 *
 * The page never takes the whole pack: the servers hand out an index (names,
 * units, a tag per figure) and each figure on its own, binary and compressed
 * (`figurepackBin.ts`), at a URL carrying its tag, so the browser keeps it
 * until it changes. Each thread installs the index once (`figurePackReady` in
 * the catalogue) and fetches a figure's data only when it is about to build it
 * (`loadPackFigures`): the model worker for the kinds a recording names, so a
 * pack of hundreds of figures costs a page only the figures it shows. Tests and
 * tools install a whole pack file with `installFigurePack`.
 */

import { decodePackFigure } from './figurepackBin';
import { buildMeshFigure, type MeshFigureData } from './meshfig';
import type { Template } from './kit';

export interface FigurePack {
  version: 1;
  figures: Record<string, MeshFigureData>;
  /** Unit id (as the game names it) -> the pack figure it is drawn as. */
  units?: Record<string, string>;
}

/** What the servers hand out in place of the whole pack: its units and, per figure name, a tag that changes with the figure. */
export interface FigurePackIndex {
  version: 1;
  figures: Record<string, string>;
  units?: Record<string, string>;
}

/** Where the dev and preview servers serve the pack's index (404 when there is none); a figure is at `/f/<name>?v=<tag>` under it. */
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
/** An installed index's figures: name -> tag. */
const indexed = new Map<string, string>();
/** Figures fetched for an installed index, and fetches under way. */
const fetched = new Map<string, MeshFigureData>();
const fetching = new Map<string, Promise<void>>();

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
    d.lods.every((l) => typeof l === 'string' || l instanceof Uint16Array)
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
  const names = Object.keys(pack.figures).filter((n) => valid(pack.figures[n]));
  return install(catalog, names, (name, own) => () => buildMeshFigure(pack.figures[name], own), pack.units, builders, aliases);
}

/**
 * Installs a pack's index (`fetchFigurePackIndex`) as `installFigurePack` does a whole pack, without any figure's
 * data: a pack figure builds from its data once `loadPackFigures` has it and, until then, as the catalogue's own
 * figure (and asks for the data, so a later build has it).
 */
export function installFigurePackIndex<E extends Entry>(
  catalog: Record<string, E>,
  index: FigurePackIndex,
  builders?: Record<string, () => Template>,
  aliases?: Record<string, string>,
): number {
  if (!index || index.version !== 1 || typeof index.figures !== 'object') return 0;
  const names = Object.keys(index.figures).filter((n) => typeof index.figures[n] === 'string');
  for (const n of names) indexed.set(n, index.figures[n]);
  return install(
    catalog,
    names,
    (name, own) => () => {
      const m = fetched.get(name);
      if (m) return buildMeshFigure(m, own);
      void loadPackFigures([name]);
      return own();
    },
    index.units,
    builders,
    aliases,
  );
}

/**
 * Fetches the data of an installed index's figures among `names` that are not here yet (others are skipped), so their
 * builds take it. Resolves once each is here or has failed (a failed one keeps building as the catalogue's own); never
 * rejects.
 */
export function loadPackFigures(names: Iterable<string>): Promise<void> {
  const waits: Promise<void>[] = [];
  for (const name of names) {
    const tag = indexed.get(name);
    if (tag === undefined || fetched.has(name)) continue;
    let w = fetching.get(name);
    if (!w) {
      w = fetchPackFigure(name, tag).then((m) => {
        if (m && indexed.get(name) === tag) fetched.set(name, m);
        fetching.delete(name);
      });
      fetching.set(name, w);
    }
    waits.push(w);
  }
  return Promise.all(waits).then(() => undefined);
}

/** Whether an installed index's figure has its data here (`loadPackFigures`). */
export function packFigureLoaded(name: string): boolean {
  return fetched.has(name);
}

async function fetchPackFigure(name: string, tag: string): Promise<MeshFigureData | null> {
  try {
    const r = await fetch(`${FIGURE_PACK_ROUTE}/f/${encodeURIComponent(name)}?v=${encodeURIComponent(tag)}`);
    if (!r.ok) return null;
    const m = decodePackFigure(await r.arrayBuffer());
    return valid(m) ? m : null;
  } catch {
    return null;
  }
}

function install<E extends Entry>(
  catalog: Record<string, E>,
  names: string[],
  builder: (name: string, own: () => Template) => () => Template,
  units: Record<string, string> | undefined,
  builders?: Record<string, () => Template>,
  aliases?: Record<string, string>,
): number {
  let n = 0;
  const have = new Set<string>();
  for (const name of names) {
    const at = name.indexOf('@');
    const kin = at > 0 ? catalog[name.slice(0, at)] : undefined;
    if (at > 0 && kin && !catalog[name]) {
      // A variant: the kin's own builder stands behind it (a hybrid takes that one's hull).
      const own = replaced.get(name.slice(0, at)) ?? kin.build;
      catalog[name] = { ...kin, build: builder(name, own) };
      added.add(name);
      if (builders) builders[name] = catalog[name].build;
      have.add(name);
      n++;
      continue;
    }
    const e = catalog[name];
    if (!e) continue;
    const own = replaced.get(name) ?? e.build;
    replaced.set(name, own);
    e.build = builder(name, own);
    if (builders) builders[name] = e.build;
    have.add(name);
    n++;
  }
  if (aliases && units && typeof units === 'object') {
    aliasTable = aliases;
    for (const [unit, name] of Object.entries(units)) {
      if (typeof name !== 'string' || !catalog[name] || !have.has(name)) continue;
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
  indexed.clear();
  fetched.clear();
  fetching.clear();
}

/**
 * The pack's index the server hands out, or null (no server route, no pack, or not one). Never throws. Checked with
 * the server on each page load (unchanged: a bodiless 304).
 */
export async function fetchFigurePackIndex(): Promise<FigurePackIndex | null> {
  try {
    const r = await fetch(FIGURE_PACK_ROUTE, { cache: 'no-cache' });
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
    const p = (await r.json()) as FigurePackIndex;
    return p && p.version === 1 && typeof p.figures === 'object' ? p : null;
  } catch {
    return null;
  }
}
