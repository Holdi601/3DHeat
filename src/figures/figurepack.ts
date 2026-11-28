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
import { figureSide, kinFor, MODEL_PACK_ROUTE, modelVariantName, packSide, sidesMeet, vehicleKey, type ModelPackIndex, type UnitSide } from './modelpack';
import { VehicleNames, vehicleSide } from './vehiclenames';
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
/** An installed index's figures: name -> tag, and where the figure is fetched (a figure pack's or a model pack's route). */
const indexed = new Map<string, { tag: string; at: string }>();
/**
 * Figures fetched for an installed index, and fetches under way, by where they come from and their tag: one model
 * drawn under several names (another game's units of the same vehicle, each on its own figure) is fetched once.
 */
const fetched = new Map<string, MeshFigureData>();
const fetching = new Map<string, Promise<void>>();
const source = (name: string): string | undefined => {
  const ix = indexed.get(name);
  return ix ? `${ix.at}?v=${ix.tag}` : undefined;
};
const dataOf = (name: string): MeshFigureData | undefined => {
  const k = source(name);
  return k ? fetched.get(k) : undefined;
};
/** Counts every change of what the packs draw (an index installed or removed, a figure's data arrived): for views that keep what they built. */
let version = 0;

/**
 * Where the page's thread takes pack figures from (`packModels.ts`): built in a worker, adopted once on the GPU. Not
 * set (tests, tools, workers), a pack figure's data is fetched and the figure built where it is asked for.
 */
export interface PackTemplateSource {
  /** The figure, once it is here whole. */
  get(name: string): Template | undefined;
  /** Asks for figures; resolves once each is here or has failed. */
  load(names: string[]): Promise<void>;
}
let templateSource: PackTemplateSource | null = null;

export function setPackTemplateSource(s: PackTemplateSource | null): void {
  templateSource = s;
  version++;
}

/** A pack figure has arrived from the template source: views that keep their builds build it again. */
export function packFigureArrived(): void {
  version++;
}

/** Whether a pack figure is here to build from: its data, or with a template source, the figure itself. */
const here = (name: string): boolean => (templateSource ? !!templateSource.get(name) : !!dataOf(name));

/** Changes whenever a pack figure's data arrives or a pack is installed or removed (`packFigurePending`). */
export function packFiguresVersion(): number {
  return version;
}

/**
 * Whether `name` is a pack figure whose data is not here yet: built now it would be the figure it stands in for. A
 * view on the main thread that keeps its builds asks `loadPackFigures` for it and builds it once `packFiguresVersion`
 * has moved on.
 */
export function packFigurePending(name: string): boolean {
  return indexed.has(name) && !here(name);
}

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
  for (const n of names) indexed.set(n, { tag: index.figures[n], at: `${FIGURE_PACK_ROUTE}/f/${encodeURIComponent(n)}` });
  return install(catalog, names, lazyBuilder, index.units, builders, aliases);
}

/** A pack figure's builder: from its data once `loadPackFigures` has it, until then as `own` (and the data is asked for). */
const lazyBuilder = (name: string, own: () => Template) => () => {
  if (templateSource) {
    const t = templateSource.get(name);
    if (t) return t;
    void templateSource.load([name]);
    return own();
  }
  const m = dataOf(name);
  if (m) return buildMeshFigure(m, own);
  void loadPackFigures([name]);
  return own();
};

/**
 * Installs the local model packs' index (`modelpack.ts`) over whatever figure each unit had. Each pack unit becomes a
 * variant of that figure (`modelVariantName`), drawn from its model once fetched, and a unit is drawn as, in turn:
 *
 * 1. its own model: a pack unit of that id (or one of its `aliases`), the first pack in the index order that has it;
 * 2. another game's model of the same vehicle: an alias whose catalogue figure some pack unit's id also stands for
 *    (two games' T-72B3 both drawn as `t-72b3`), from the first pack that has one, the unit with the
 *    shortest id there; or whose name is one of a pack unit's real vehicle names (`name`, `names`), as
 *    `vehiclenames.ts` takes names for the same vehicle ("T-72B3 obr. 2016" for "T-72B3");
 * 3. its figure, as before.
 *
 * Install it after a figure pack, so a model takes precedence over the pack's figure. Pack units with no figure to
 * stand in for are skipped. Returns how many pack units it installed.
 */
export function installModelPackIndex<E extends Entry & { domain?: string; cls?: string }>(
  catalog: Record<string, E>,
  index: ModelPackIndex,
  builders: Record<string, () => Template> | undefined,
  aliases: Record<string, string>,
): number {
  if (!index || index.version !== 1 || !Array.isArray(index.packs)) return 0;
  const names: string[] = [];
  const units: Record<string, string> = {};
  /** A pack unit as it may be lent: its own variant, where its model is, its side. */
  type Lent = { name: string; game: string; id: string; side: UnitSide; ix: { tag: string; at: string } };
  const byFigure = new Map<string, Lent & { pack: number }>();
  const byName = new Map<string, Lent>();
  const sameVehicle = new VehicleNames<Lent>();
  const base = (f: string) => (f.indexOf('@') > 0 ? f.slice(0, f.indexOf('@')) : f);
  // A class's first figure (a generic one where the catalogue has it under the class's name).
  const classes = new Map<string, string>();
  for (const [n, e] of Object.entries(catalog)) if (e.cls && !n.includes('@') && !classes.has(e.cls)) classes.set(e.cls, n);
  const entry = (n: string) => catalog[n];
  const byClass = (cls: string) => (catalog[cls] ? cls : (classes.get(cls) ?? null));
  // Every pack's own units, also where an earlier pack has a unit of the same id (Battlefield 4's `lav25` and Arma
  // Reforger's `LAV25`): the alias table keeps the first, and a recording of the other game is drawn with its own
  // (`packGameOf`, `ownModelIn`).
  const claimed = new Map<string, Map<string, string>>();
  // Each game's units by id, so one listed twice counts once (an id another unit of the game has as an alias still
  // counts: Arma 3's "HEMTT Repair" shares its file with "HEMTT Box", which lists it, and keeps its own names).
  const seen = new Set<string>();
  namesByGame.clear();
  vehiclesByGame.clear();
  realNames.clear();
  packGameList = index.packs.filter((p) => p && typeof p.game === 'string').map((p) => p.game);
  for (const [pi, pack] of index.packs.entries()) {
    if (!pack || typeof pack.game !== 'string' || typeof pack.units !== 'object') continue;
    for (const [unit, info] of Object.entries(pack.units)) {
      const id = unit.trim().toLowerCase();
      if (!info || typeof info.tag !== 'string' || seen.has(`${pack.game}:${id}`)) continue;
      seen.add(`${pack.game}:${id}`);
      // A static object (a barrier, a building, a container) and an item stand for no unit: `kinFor` gives none.
      const kin = kinFor(id, info, entry, aliases, byClass);
      if (!kin) continue;
      const name = modelVariantName(kin, pack.game, id);
      // A pack a session's host shared names where each unit's model is (`session/sharedPacks.ts`).
      const ix = { tag: info.tag, at: info.at ?? `${MODEL_PACK_ROUTE}/u/${encodeURIComponent(pack.game)}/${encodeURIComponent(id)}` };
      indexed.set(name, ix);
      names.push(name);
      // The pack's vehicles by their real names, for recordings of another game drawn with this game's models
      // (`modelOfVehicleIn`, the unit models choice).
      const real = [info.name, ...(info.names ?? [])].filter((n): n is string => typeof n === 'string' && n.trim() !== '');
      if (real.length) {
        let vn = vehiclesByGame.get(pack.game);
        if (!vn) vehiclesByGame.set(pack.game, (vn = new VehicleNames<string>()));
        vn.add(real, name, vehicleSide(info.domain, `${info.kind ?? ''} ${info.type ?? ''}`));
        realNames.set(name, real);
      }
      // The vehicle's names in its own game's recordings (an Arma 3 vehicle without a real counterpart: "Motorboat").
      let named = namesByGame.get(pack.game);
      if (!named) namesByGame.set(pack.game, (named = new Map()));
      for (const n of [info.name, ...(info.names ?? [])]) if (typeof n === 'string' && n.trim() && !named.has(n.trim().toLowerCase())) named.set(n.trim().toLowerCase(), name);
      for (const k of [id, ...(info.aliases ?? []).map((a) => a.trim().toLowerCase())]) {
        units[k] ??= name;
        let by = claimed.get(k);
        if (!by) claimed.set(k, (by = new Map()));
        if (!by.has(pack.game)) by.set(pack.game, name);
      }
      // An id an earlier pack has already: drawn as this game's own model only in this game's recordings.
      if (units[id] !== name) continue;
      const lent: Lent = { name, game: pack.game, id, side: packSide(info), ix };
      // Only an id the catalogue knows by name speaks for its figure's vehicle (not one placed by its type word).
      const known = aliases[id];
      if (known && sidesMeet(lent.side, figureSide(catalog[base(known)]), catalog[base(known)]?.cls)) {
        const had = byFigure.get(base(known));
        if (!had || (had.pack === pi && id.length < had.id.length)) byFigure.set(base(known), { ...lent, pack: pi });
      }
      for (const n of [info.name, ...(info.names ?? [])]) if (typeof n === 'string' && vehicleKey(n) && !byName.has(vehicleKey(n))) byName.set(vehicleKey(n), lent);
      sameVehicle.add([info.name, ...(info.names ?? [])], lent, vehicleSide(info.domain, `${info.kind ?? ''} ${info.type ?? ''}`));
    }
  }
  install(catalog, names, lazyBuilder, units, builders, aliases);
  ownByGame.clear();
  idsByGame.clear();
  for (const [id, by] of claimed) {
    if (by.size > 1) ownByGame.set(id, by);
    for (const g of by.keys()) {
      let ids = idsByGame.get(g);
      if (!ids) idsByGame.set(g, (ids = new Set()));
      ids.add(id);
    }
  }
  packIndexStamp++;
  // Other games' units of the same vehicles: aliases left on a figure a pack model stands for, and real names. A
  // lent model sits on the borrowing unit's own figure (a DCS Mi-8MT on the Mi-8MTV2's, not on whatever figure the
  // lending game's unit stands in for), and only where the two are of one side: a helicopter's model never on a
  // fighter's figure, a drone's never on a crewed aircraft's.
  const extra: string[] = [];
  const lend = (key: string, l: Lent, onFigure: string | null) => {
    let name = l.name;
    if (onFigure && base(l.name) !== onFigure) {
      name = modelVariantName(onFigure, l.game, l.id);
      if (!indexed.has(name)) {
        indexed.set(name, l.ix);
        extra.push(name);
      }
    }
    if (aliases[key] === name) return;
    if (!aliased.has(key)) aliased.set(key, aliases[key]);
    aliases[key] = name;
  };
  aliasTable = aliases;
  for (const [key, fig] of Object.entries(aliases)) {
    if (units[key] || fig.includes('@model:')) continue;
    const kin = base(fig);
    const e = catalog[kin];
    if (!e) continue;
    const side = figureSide(e);
    const meets = (l: Lent | undefined) => (l && sidesMeet(l.side, side, e.cls) ? l : undefined);
    const l = meets(byFigure.get(kin)) ?? meets(byName.get(vehicleKey(key))) ?? meets(sameVehicle.find([key], side === 'drone' ? '' : side, ['same'])?.value);
    if (l) lend(key, l, kin);
  }
  // A real vehicle name the catalogue has no figure or alias of: the lending unit's own variant.
  for (const [key, l] of byName) if (!aliases[key] && !catalog[key] && catalog[l.name]) lend(key, l, null);
  if (extra.length) install(catalog, extra, lazyBuilder, undefined, builders);
  return names.length;
}

/** Unit ids more than one pack has a model of: id -> game -> that game's variant (`installModelPackIndex`). */
const ownByGame = new Map<string, Map<string, string>>();
/** Each pack's unit ids (and aliases), by game. */
const idsByGame = new Map<string, Set<string>>();
/** Each pack's vehicle names (real and display names, lower case), by game: the first unit of each name. */
const namesByGame = new Map<string, Map<string, string>>();
let packIndexStamp = 0;
/** Each pack's vehicles by their real names (`name`, `names`): the unit's variant. */
const vehiclesByGame = new Map<string, VehicleNames<string>>();
/** A pack unit's variant -> its real vehicle names. */
const realNames = new Map<string, string[]>();
/** The games of the installed packs, in the index's order. */
let packGameList: string[] = [];

/** The games whose model packs are installed, in the packs' order of precedence. */
export function packGames(): readonly string[] {
  return packGameList;
}

/** A pack model's real vehicle names (`name`, `names`); [] for anything else. */
export function packVehicleNames(variant: string): readonly string[] {
  return realNames.get(variant) ?? [];
}

/**
 * `game`'s pack model of the vehicle one of `names` stands for (the same vehicle, else the nearest of its family, as
 * `vehiclenames.ts` matches names across games), of the same side ('air', 'heli', 'ground', 'sea'): the variant it is
 * drawn as in `game`'s own recordings, so every thread that installed the packs can build it. Undefined for none.
 */
export function modelOfVehicleIn(game: string, names: readonly string[], side: string): string | undefined {
  if (!side) return undefined;
  return vehiclesByGame.get(game)?.find(names, side, ['same', 'family'])?.value;
}

/** Changes whenever a model packs' index is installed: what `packGameOf` and `ownModelIn` answered may have changed. */
export function modelPackIndexStamp(): number {
  return packIndexStamp;
}

/**
 * The game whose pack has the most of a recording's unit names as its own units (null: none has any): the game the
 * recording is of, as far as the packs can tell. Ties go to the earlier pack.
 */
export function packGameOf(names: Iterable<string>): string | null {
  if (!idsByGame.size) return null;
  const count = new Map<string, number>();
  for (const raw of names) {
    const id = raw.toLowerCase();
    for (const [g, ids] of idsByGame) if (ids.has(id)) count.set(g, (count.get(g) ?? 0) + 1);
  }
  let best: string | null = null;
  let top = 0;
  for (const [g, n] of count) if (n > top) [best, top] = [g, n];
  return best;
}

/**
 * A unit's own model in a recording of `game`, where more than one pack has a unit of that id: that game's, never the
 * other's. Undefined where the id is only one pack's (the alias table has it) or not this game's.
 */
export function ownModelIn(game: string, id: string): string | undefined {
  return ownByGame.get(id.toLowerCase())?.get(game);
}

/**
 * The model `game`'s pack has of a name (a unit id or an alias of one), as the recording of that game draws it: its
 * own game's model before any figure another of the recording's names would find (an Arma 3 recording names a vehicle
 * by its real counterpart, "Patria AMV", a catalogue figure, beside its own name, "AMV-7 Marshall", the pack's).
 * Undefined where `game`'s pack has no unit of that name.
 */
export function ownGameModel(game: string, id: string): string | undefined {
  const k = id.trim().toLowerCase();
  const own = ownByGame.get(k)?.get(game);
  if (own) return own;
  if (!idsByGame.get(game)?.has(k)) return undefined;
  const a = aliasTable?.[k];
  return a && a.includes(`@model:${game}:`) ? a : undefined;
}

/**
 * The model `game`'s pack has of a vehicle by its name (a real or display name, `name` and `names` in the pack), for
 * names no unit has as an id or alias: asked after `ownGameModel` has had every name of a row, so the most particular
 * name wins ("HEMTT Fuel" before "HEMTT").
 */
export function ownGameModelNamed(game: string, name: string): string | undefined {
  return namesByGame.get(game)?.get(name.trim().toLowerCase());
}

/**
 * Fetches the data of an installed index's figures among `names` that are not here yet (others are skipped), so their
 * builds take it. Resolves once each is here or has failed (a failed one keeps building as the catalogue's own); never
 * rejects.
 */
export function loadPackFigures(names: Iterable<string>): Promise<void> {
  if (templateSource) return templateSource.load([...names].filter((n) => indexed.has(n)));
  const waits: Promise<void>[] = [];
  for (const name of names) {
    const ix = indexed.get(name);
    const key = source(name);
    if (ix === undefined || key === undefined || fetched.has(key)) continue;
    let w = fetching.get(key);
    if (!w) {
      w = fetchPackFigure(ix.at, ix.tag).then((m) => {
        if (m && fetching.has(key)) {
          fetched.set(key, m);
          version++;
        }
        fetching.delete(key);
      });
      fetching.set(key, w);
    }
    waits.push(w);
  }
  return Promise.all(waits).then(() => undefined);
}

/** Whether an installed index's figure has its data here (`loadPackFigures`). */
export function packFigureLoaded(name: string): boolean {
  return here(name);
}

/** Where a shared pack's unit model is made into its figure (`session/sharedPacks.ts`; the page and the pack worker each register it). */
let sharedFigure: ((at: string) => Promise<ArrayBuffer | Uint8Array | null>) | null = null;

export function setSharedFigureSource(f: typeof sharedFigure): void {
  sharedFigure = f;
}

async function fetchPackFigure(at: string, tag: string): Promise<MeshFigureData | null> {
  try {
    if (at.startsWith('shared:')) {
      const bytes = sharedFigure ? await sharedFigure(at) : null;
      const m = bytes ? decodePackFigure(bytes) : null;
      return m && valid(m) ? m : null;
    }
    const r = await fetch(`${at}?v=${encodeURIComponent(tag)}`);
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
  version++;
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
  ownByGame.clear();
  idsByGame.clear();
  namesByGame.clear();
  vehiclesByGame.clear();
  realNames.clear();
  packGameList = [];
  indexed.clear();
  fetched.clear();
  fetching.clear();
  version++;
}

/**
 * The pack's index the server hands out, or null (no server route, no pack, or not one). Never throws. Checked with
 * the server on each page load (unchanged: a bodiless 304).
 */
export async function fetchFigurePackIndex(): Promise<FigurePackIndex | null> {
  try {
    const r = await fetch(FIGURE_PACK_ROUTE, { cache: 'no-cache' });
    // 204: the server has no pack.
    if (!r.ok || r.status === 204 || !(r.headers.get('content-type') ?? '').includes('json')) return null;
    const p = (await r.json()) as FigurePackIndex;
    return p && p.version === 1 && typeof p.figures === 'object' ? p : null;
  } catch {
    return null;
  }
}
