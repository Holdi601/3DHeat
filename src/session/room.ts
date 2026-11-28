/**
 * The host's room: what the host has on screen that every member needs too -
 * the map, the game's unit catalogue and model pack, the host's data - and
 * what of it the host shares. The host's viewer keeps it in a document only
 * the host may write (`host-room`, native/crates/session/src/roles.rs), so
 * every member follows it live:
 *
 * - The host loads a map: every member loads it by itself, from their own
 *   levels folder when they have it, else from what the host shares.
 * - What a member lacks goes back to the host with the member's presence
 *   (`lacks.ts`). The host is asked, when such a member joins and whenever
 *   the map changes, whether to share it with them; nothing is shared unless
 *   the host says so.
 * - What the host shares and a member lacks: the member is asked once
 *   ("download?"), and after Yes it is fetched, checked by hash and loaded.
 *
 * Needs carry names, kinds, games and sizes only; never a path of the host's.
 */

import { create } from 'zustand';
import { FIGURES_ONLY } from '../figures/modelChoice';
import { currentCatalogSelection } from '../state/catalogSelection';
import { useStore } from '../state/store';
import { inCache, itemBytes, loadHostData, loadShared, refreshShareIndex, useShareIndex, type CatalogEntry, type ShareKind, type SharedItem } from './assets';
import { loadedData } from './dataRefs';
import { sameLevel } from './levelRequest';
import { setMyLacks, useLacks } from './lacks';
import { registerSharedDoc } from './shared';
import { useSessionStore } from './store';

export const ROOM_DOC = 'host-room';

export type NeedKind = 'level' | 'catalog' | 'model-pack' | 'data';

/** Something the host has on screen that members need too. */
export interface Need {
  id: string;
  kind: NeedKind;
  name: string;
  game: string;
  /** What sharing it sends, bytes (0: not known). */
  size: number;
}

/** A shared item that answers a need: what a member fetches. */
export interface Offer {
  /** The shared item's id (`data`: the host's published data). */
  id: string;
  need: string;
  kind: ShareKind | 'data';
  name: string;
  game: string;
  size: number;
  files: number;
  /** The manifest's hash (the data's own hash for `data`). */
  manifest: string;
  confidential?: boolean;
}

export interface RoomState {
  /** The need id of the host's map; '' when no map is loaded. */
  level: string;
  needs: Need[];
  offers: Offer[];
}

const EMPTY: RoomState = { level: '', needs: [], offers: [] };

export const useRoom = create<{ doc: RoomState }>(() => ({ doc: EMPTY }));

let registered = false;

/** The room's document in the shared layers (once). */
export function registerRoomDoc(): void {
  if (registered) return;
  registered = true;
  registerSharedDoc({
    key: ROOM_DOC,
    colls: ['needs', 'offers'],
    get: () => useRoom.getState().doc,
    set: (state) => useRoom.setState({ doc: readRoom(state) }),
    empty: () => EMPTY,
    // Nothing of it belongs in a session file: it follows what is loaded.
    hasContent: () => false,
  });
}

function readRoom(v: unknown): RoomState {
  const o = (v ?? {}) as Partial<RoomState>;
  const str = (x: unknown) => (typeof x === 'string' ? x : '');
  const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : 0);
  const needs = (Array.isArray(o.needs) ? o.needs : [])
    .filter((n) => n && typeof n.id === 'string' && ['level', 'catalog', 'model-pack', 'data'].includes(n.kind))
    .map((n) => ({ id: n.id, kind: n.kind, name: str(n.name), game: str(n.game), size: num(n.size) }));
  const offers = (Array.isArray(o.offers) ? o.offers : [])
    .filter((x) => x && typeof x.id === 'string' && typeof x.need === 'string' && /^[0-9a-f]{64}$/.test(str(x.manifest)))
    .map((x) => ({ id: x.id, need: x.need, kind: x.kind, name: str(x.name), game: str(x.game), size: num(x.size), files: num(x.files), manifest: x.manifest, confidential: !!x.confidential }));
  return { level: str(o.level), needs, offers };
}

/** A short id for a need (`[a-z0-9_-]`, at most 24: it travels in presence). */
export function needId(kind: NeedKind, key: string): string {
  let h = 2166136261;
  for (const c of `${kind}|${key.toLowerCase()}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const pre = { level: 'lv', catalog: 'ct', 'model-pack': 'mp', data: 'dt' }[kind];
  return `${pre}${h.toString(36)}`;
}

// ------------------------------------------------------------ the host

/** The host's own record of which catalogue item answers each need (paths stay here). */
const sources = new Map<string, CatalogEntry>();

/** The catalogue item a need is made from, on the host's machine. */
export function needSource(id: string): CatalogEntry | undefined {
  return sources.get(id);
}

/**
 * What the host's room is now: the level on screen and the unit model packs the data is drawn with (the levels
 * folder's selection, `state/catalogSelection.ts`), the game's unit catalogue, the loaded data, and what is shared.
 */
export function hostRoom(): RoomState {
  const index = useShareIndex.getState().index;
  const items = index?.items ?? [];
  const level = useStore.getState().level;
  const sel = currentCatalogSelection();
  const needs: Need[] = [];
  sources.clear();
  let game = '';
  if (level?.name) {
    // The levels folder's level on screen by its id; else one of the same name (picked by hand, from the library).
    const byId = sel.level ? items.find((i) => i.path === sel.level!.id) : undefined;
    const it = byId ?? items.find((i) => (i.kind === 'level' || i.kind === 'course') && sameLevel(level.name, { name: i.name, path: i.path }));
    // A level by name: also one the host has no catalogue item of (members may have it in their own folder).
    const name = it?.name ?? level.name.replace(/\.(glb|gltf)$/i, '');
    const id = needId('level', name);
    needs.push({ id, kind: 'level', name, game: it?.game ?? '', size: it ? itemBytes(it) : 0 });
    if (it) {
      sources.set(id, it);
      game = it.game;
    }
  }
  // The unit catalogues of the map's game and the data's; the model packs the data is drawn with (none when the host
  // chose the built-in figures), else the map's game's own.
  const games = [...new Set([game, sel.dataGame ?? ''].filter(Boolean))];
  // (This page's own server may serve no packs, as `3dheat serve` does not: the folder's pack of each game then.)
  const packIds = sel.modelPackIds.length ? sel.modelPackIds : sel.modelChoice === FIGURES_ONLY ? [] : games.map((g) => `model-packs/${g}/model-pack.json`);
  for (const g of games) {
    const it = items.find((i) => i.kind === 'catalog' && i.game === g);
    if (!it) continue;
    const id = needId('catalog', g);
    needs.push({ id, kind: 'catalog', name: it.name, game: g, size: itemBytes(it) });
    sources.set(id, it);
  }
  for (const path of packIds) {
    const it = items.find((i) => i.kind === 'model-pack' && i.path === path);
    if (!it || needs.some((n) => n.kind === 'model-pack' && n.game === it.game)) continue;
    const id = needId('model-pack', it.game);
    needs.push({ id, kind: 'model-pack', name: it.name, game: it.game, size: itemBytes(it) });
    sources.set(id, it);
  }
  const files = loadedData().files;
  if (files.length) {
    const f = files[0];
    needs.push({ id: needId('data', `${f.name}|${f.size}`), kind: 'data', name: f.name, game: '', size: f.size });
  }
  // What is shared already, by the need it answers.
  const offers: Offer[] = [];
  for (const s of index?.shared ?? []) {
    const need = needs.find((n) => sources.get(n.id)?.path === s.path);
    if (!need) continue;
    offers.push({ id: s.id, need: need.id, kind: s.kind, name: s.name, game: s.game, size: s.size, files: s.files, manifest: s.manifest, confidential: !!s.confidential });
  }
  const ds = useSessionStore.getState().info?.dataset;
  const dataNeed = needs.find((n) => n.kind === 'data');
  if (ds?.published && dataNeed && ds.name === dataNeed.name && /^[0-9a-f]{64}$/.test(ds.hash)) {
    offers.push({ id: 'data', need: dataNeed.id, kind: 'data', name: ds.name, game: '', size: ds.size, files: 1, manifest: ds.hash });
  }
  return { level: needs.find((n) => n.kind === 'level')?.id ?? '', needs, offers };
}

/** Puts the host's room into the document when it changed (the sync sends the difference). */
export function publishRoom(): void {
  const next = hostRoom();
  const cur = useRoom.getState().doc;
  if (JSON.stringify(cur) === JSON.stringify(next)) return;
  useRoom.setState({ doc: next });
}

/** Who lacks what the host has not shared yet: need id -> member names. */
export function unsharedLacks(): Map<string, string[]> {
  const { doc } = useRoom.getState();
  const members = useSessionStore.getState().members;
  const by = useLacks.getState().by;
  const out = new Map<string, string[]>();
  for (const n of doc.needs) {
    if (doc.offers.some((o) => o.need === n.id)) continue;
    // Only what the host can share (a catalogue item, or its loaded data).
    if (n.kind !== 'data' && !sources.has(n.id)) continue;
    const names = members.filter((m) => m.connected && (by[m.id] ?? []).includes(n.id)).map((m) => m.name);
    if (names.length) out.set(n.id, names);
  }
  return out;
}

/** The host's question: these needs, these members; one at a time. */
export interface HostAsk {
  needs: Need[];
  members: string[];
  /** Who lacks each need, by its id. */
  who: Record<string, string[]>;
  /** What the question is about, so a "not now" holds until something new comes. */
  key: string;
}

export const useHostAsk = create<{ ask: HostAsk | null; declined: Set<string> }>(() => ({ ask: null, declined: new Set() }));

/** Asks the host when members lack something not shared yet (a member joined, or the map changed). */
export function updateHostAsk(): void {
  const lacks = unsharedLacks();
  const { doc } = useRoom.getState();
  const needs = doc.needs.filter((n) => lacks.has(n.id));
  const members = [...new Set([...lacks.values()].flat())].sort();
  if (!needs.length) {
    if (useHostAsk.getState().ask) useHostAsk.setState({ ask: null });
    return;
  }
  const key = `${needs.map((n) => n.id).join(',')}|${members.join(',')}`;
  const s = useHostAsk.getState();
  if (s.declined.has(key) || s.ask?.key === key) return;
  useHostAsk.setState({ ask: { needs, members, key, who: Object.fromEntries(lacks) } });
}

export function declineHostAsk(): void {
  const s = useHostAsk.getState();
  if (!s.ask) return;
  useHostAsk.setState({ ask: null, declined: new Set([...s.declined, s.ask.key]) });
}

// ------------------------------------------------------------ a member

export type NeedStatus = 'have' | 'checking' | 'loading' | 'offered' | 'missing';

interface MemberRoom {
  status: Record<string, NeedStatus>;
  /** Offers the member is asked to download (what is shared and not here). */
  ask: Offer[];
  /** Offers the member said No to (asked again only for new ones). */
  declined: Set<string>;
  progress: { done: number; all: number; name: string } | null;
  error: string | null;
}

export const useMemberRoom = create<MemberRoom>(() => ({ status: {}, ask: [], declined: new Set(), progress: null, error: null }));

/** The host's map last followed, so a map is loaded once per change of the host's. */
let followed = '';
/** Needs tried from this machine's own folder already. */
const triedLocal = new Set<string>();
/** Shared items installed here (packs, data, levels loaded) in this session. */
const installed = new Set<string>();

export function resetMemberRoom(): void {
  followed = '';
  triedLocal.clear();
  installed.clear();
  useMemberRoom.setState({ status: {}, ask: [], declined: new Set(), progress: null, error: null });
  setMyLacks([]);
}

function setStatus(id: string, s: NeedStatus): void {
  const st = useMemberRoom.getState().status;
  if (st[id] === s) return;
  useMemberRoom.setState({ status: { ...st, [id]: s } });
}

function haveLevel(n: Need): boolean {
  const lv = useStore.getState().level;
  return !!lv && sameLevel(n.name, { name: lv.name.replace(/\.(glb|gltf)$/i, '') });
}

function haveData(n: Need): boolean {
  return loadedData().files.some((f) => f.name === n.name && f.size === n.size);
}

async function havePack(n: Need): Promise<boolean> {
  const { sharedGames } = await import('./sharedPacks');
  if (sharedGames(n.kind as 'catalog' | 'model-pack').has(n.game)) return true;
  // The member's own machine: its server's packs and catalogues (the dev server; none on a session server).
  if (n.kind === 'catalog') {
    const { fetchUnitCatalogs } = await import('../figures/unitcatalog');
    return !!(await fetchUnitCatalogs())?.games.some((g) => g.game === n.game);
  }
  const { fetchModelPackIndex } = await import('../figures/modelpack');
  return !!(await fetchModelPackIndex())?.packs.some((p) => p.game === n.game);
}

/** The member's own levels folder (the local server's index), by the level's name: loaded when it is there. */
async function localLevel(n: Need): Promise<boolean> {
  try {
    const { catalogLevel } = await import('../ui/panels/CatalogSection');
    const item = await catalogLevel((i) => sameLevel(n.name, i));
    if (!item) return false;
    const { loadCatalogLevel } = await import('../ui/panels/autoLevel');
    await loadCatalogLevel(item, true);
    return haveLevel(n);
  } catch {
    return false;
  }
}

let checking = false;
let again = false;

/**
 * A member's pass over the host's room: what is here, what is loaded from
 * this machine, what is in this browser's cache already (loaded at once),
 * and what to ask the member to download; the rest is what it lacks, which
 * goes back to the host.
 */
export async function checkMemberRoom(): Promise<void> {
  if (checking) {
    again = true;
    return;
  }
  checking = true;
  try {
    do {
      again = false;
      await checkOnce();
    } while (again);
  } finally {
    checking = false;
  }
}

async function checkOnce(): Promise<void> {
  const { doc } = useRoom.getState();
  const lacks: string[] = [];
  const ask: Offer[] = [];
  const declined = useMemberRoom.getState().declined;
  // The host changed its map: it is followed (from this machine's folder again, if the host went back to one).
  if (doc.level !== followed) triedLocal.delete(doc.level);
  for (const n of doc.needs) {
    const offer = doc.offers.find((o) => o.need === n.id);
    let have = false;
    if (n.kind === 'level') have = haveLevel(n);
    else if (n.kind === 'data') have = haveData(n);
    else have = installed.has(offer?.manifest ?? '') || (await havePack(n));
    if (!have && n.kind === 'level' && !triedLocal.has(n.id)) {
      triedLocal.add(n.id);
      setStatus(n.id, 'checking');
      have = await localLevel(n);
    }
    if (!have && offer && !installed.has(offer.manifest) && offer.kind !== 'data' && (await inCache(offerItem(offer)))) {
      // Fetched in this browser before (checked again by hash): loaded at once, nothing to ask.
      have = await loadOffer(offer);
    }
    if (have) {
      setStatus(n.id, 'have');
      continue;
    }
    lacks.push(n.id);
    if (offer) {
      setStatus(n.id, 'offered');
      if (!declined.has(offer.manifest)) ask.push(offer);
    } else setStatus(n.id, 'missing');
  }
  if (doc.level) followed = doc.level;
  setMyLacks(lacks);
  const cur = useMemberRoom.getState().ask;
  if (cur.map((o) => o.manifest).join() !== ask.map((o) => o.manifest).join()) useMemberRoom.setState({ ask });
}

const offerItem = (o: Offer): SharedItem => ({ id: o.id, kind: o.kind as ShareKind, game: o.game, name: o.name, size: o.size, files: o.files, manifest: o.manifest, confidential: o.confidential });

async function loadOffer(o: Offer): Promise<boolean> {
  try {
    if (o.kind === 'data') {
      await loadHostData({ name: o.name, hash: o.manifest });
    } else {
      await loadShared(offerItem(o), (done, all) => useMemberRoom.setState({ progress: { done, all, name: o.name } }));
    }
    installed.add(o.manifest);
    return true;
  } finally {
    useMemberRoom.setState({ progress: null });
  }
}

/** The member said Yes: everything asked is fetched, checked and loaded, one after the other. */
export async function acceptMemberAsk(): Promise<void> {
  const list = useMemberRoom.getState().ask;
  useMemberRoom.setState({ ask: [], error: null });
  for (const o of list) {
    try {
      await loadOffer(o);
    } catch {
      useMemberRoom.setState({ error: o.name });
    }
  }
  void checkMemberRoom();
}

export function declineMemberAsk(): void {
  const s = useMemberRoom.getState();
  useMemberRoom.setState({ ask: [], declined: new Set([...s.declined, ...s.ask.map((o) => o.manifest)]) });
}

/** For the panel: refreshes the host's catalogue (and so the room). */
export async function refreshHostRoom(): Promise<void> {
  await refreshShareIndex();
  publishRoom();
}
