/**
 * A unit catalogue or a model pack the host shared, put to use in this
 * viewer: the catalogue names the game's units, the pack draws them as their
 * own models, as a local pack on this machine would (`figures/catalog.ts`,
 * `installSessionPacks`). Every file was checked by its hash when it came
 * (`assets.ts`); a unit's model stays in this browser's cache and is made into
 * its figure only when a unit of it is drawn (`figures/sharedFigure.ts`), on
 * the page or in the pack worker, which is told the same packs.
 */

import { installSessionPacks } from '../figures/catalog';
import { setSharedFigureSource } from '../figures/figurepack';
import type { ModelPackIndex, ModelPackUnit } from '../figures/modelpack';
import { postSessionPacks } from '../figures/packModels';
import { sharedFigureBytes } from '../figures/sharedFigure';
import type { CatalogUnit, UnitCatalogIndex } from '../figures/unitcatalog';
import { sha256Hex, sharedHash, sharedPath } from './assets';

/** What was shared in this session, per game (a second share of a game replaces the first). */
const models = new Map<string, ModelPackIndex['packs'][number]>();
const catalogs = new Map<string, UnitCatalogIndex['games'][number]>();

/** Catalogue kinds that are no units (served apart by the dev server too). */
const FACT_KINDS = new Set(['ammo', 'magazine', 'vest', 'helmet', 'uniform', 'man']);
const KEEP = ['id', 'name', 'kind', 'class', 'nation', 'key', 'domain', 'type'] as const;

/** A game's catalogue file as the viewer takes it (the dev server cuts it the same way); null when it is not one. */
export function catalogOf(text: string): { game: string; items: CatalogUnit[] } | null {
  const doc = JSON.parse(text) as { format?: string; version?: number; game?: string; items?: Record<string, unknown>[] };
  if (doc?.format !== '3dheat-catalog' || doc.version !== 1 || !Array.isArray(doc.items)) return null;
  const items: CatalogUnit[] = [];
  for (const it of doc.items) {
    if (!it || typeof it.id !== 'string' || typeof it.name !== 'string' || FACT_KINDS.has(String(it.kind ?? ''))) continue;
    const out: Record<string, unknown> = Object.fromEntries(KEEP.filter((k) => typeof it[k] === 'string' && it[k] !== '').map((k) => [k, it[k]]));
    const names = [...(Array.isArray(it.names) ? it.names : []), it.short].filter((n): n is string => typeof n === 'string' && n !== '' && n !== it.name);
    if (names.length) out.names = [...new Set(names)];
    if (typeof it.rank === 'number' && Number.isFinite(it.rank)) out.rank = it.rank;
    if (it.br && typeof it.br === 'object') {
      const br = Object.fromEntries(Object.entries(it.br as Record<string, unknown>).filter(([, v]) => typeof v === 'number' && Number.isFinite(v)));
      if (Object.keys(br).length) out.br = br;
    }
    items.push(out as unknown as CatalogUnit);
  }
  return { game: String(doc.game ?? 'game'), items };
}

/** A model pack's index (`model-pack.json`) with each unit's model by its hash among the shared files; null when it is not one. */
export async function modelPackOf(game: string, files: File[]): Promise<ModelPackIndex['packs'][number] | null> {
  const index = files.find((f) => sharedPath(f) === 'model-pack.json');
  if (!index) return null;
  const pack = JSON.parse(await index.text()) as { format?: string; version?: number; game?: string; scale?: number; units?: Record<string, Record<string, unknown>> };
  if (pack?.format !== '3dheat-model-pack' || pack.version !== 1 || !pack.units || typeof pack.units !== 'object') return null;
  const byPath = new Map(files.map((f) => [sharedPath(f), f]));
  const scale = typeof pack.scale === 'number' && pack.scale > 0 ? pack.scale : 1;
  const units: Record<string, ModelPackUnit> = {};
  const strings = (x: unknown) => (Array.isArray(x) ? x.filter((a): a is string => typeof a === 'string') : []);
  for (const [id, e] of Object.entries(pack.units)) {
    if (!e || typeof e.file !== 'string' || /[\\]|\.\./.test(e.file)) continue;
    const f = byPath.get(e.file);
    if (!f) continue;
    const hash = sharedHash(f) ?? (await sha256Hex(await f.arrayBuffer()));
    const u: ModelPackUnit = { tag: hash.slice(0, 16), at: `shared:${hash}:${scale}` };
    for (const k of ['domain', 'type', 'kind', 'name'] as const) if (typeof e[k] === 'string' && e[k]) u[k] = e[k] as string;
    const names = strings(e.names);
    const aliases = strings(e.aliases);
    if (names.length) u.names = names;
    if (aliases.length) u.aliases = aliases;
    units[id.toLowerCase()] = u;
  }
  const g = String(pack.game ?? game).toLowerCase().replace(/[^a-z0-9_-]/g, '') || game;
  return Object.keys(units).length ? { game: g, units } : null;
}

/** Installs a shared catalogue or model pack; false when its files are not one. */
export async function installSharedPack(kind: 'catalog' | 'model-pack', game: string, files: File[]): Promise<boolean> {
  if (kind === 'catalog') {
    const f = files.find((x) => /catalog\.json$/i.test(x.name));
    const c = f ? catalogOf(await f.text()) : null;
    if (!c) return false;
    catalogs.set(c.game, c);
  } else {
    const p = await modelPackOf(game, files);
    if (!p) return false;
    models.set(p.game, p);
  }
  setSharedFigureSource(sharedFigureBytes);
  const session = { models: models.size ? { version: 1 as const, packs: [...models.values()] } : null, catalogs: catalogs.size ? { version: 1 as const, games: [...catalogs.values()] } : null };
  await installSessionPacks(session.models, session.catalogs);
  postSessionPacks({ session });
  return true;
}

/** The games whose catalogue or model pack was shared and installed in this session. */
export function sharedGames(kind: 'catalog' | 'model-pack'): Set<string> {
  return new Set(kind === 'catalog' ? catalogs.keys() : models.keys());
}
