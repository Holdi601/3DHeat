/**
 * The vehicle-hit analysis worker (docs/vehicle-hits.md): holds the hits of
 * a mass load (`store.ts`), reads the files through a pool of scan workers
 * (`scanWorker.ts`), works out each hit's flight once, and answers the
 * panel's questions - the vehicles and filter values, and for the vehicle
 * shown its plates' statistics and colours, a sample of its hits as marks,
 * the charts and the top lists, a comparison of two halves. Nothing of it
 * runs on the page's frame path; the page gets small results.
 */

import { HitStore, type PlateGeometry, type PlateHits } from './store';
import { compileFilter, histogram, plateColours, plateStats, rateOver, sourceName, topBy, twoProportion, victimsOf, type BinField, type Grouping, type HitFilter, type PlateMetric, type PlateStat, type TopRow } from './analyze';
import type { ScanReply, ScanRequest } from './scanWorker';
import type { CoreEndpoint } from '../../data/native/core';
import type { ChartData } from '../../charts/types';
import { EFFECTS, FLAG_DIR, FLAG_DIST, FLAG_LOCAL, FLAG_POSE, FLAG_WON, FLAG_RESULT_KNOWN, NONE16, RESULTS, type Effect, type VehicleMeta } from './types';

export interface LoadStats {
  files: number;
  done: number;
  matches: number;
  hits: number;
  bytes: number;
  /** Rows the files had, and rows read (the hit rows and the victims' samples). */
  rows: number;
  kept: number;
  cached: number;
  native: number;
  failed: number;
  empty: number;
  ms: number;
  /** The load stopped at the memory ceiling: files left unread. */
  stopped: number;
  running: boolean;
  /** The last file that could not be read, and why. */
  lastError?: string;
}

/** The comparison: two halves of the hits by one field, A and B values. */
export interface Compare {
  field: 'victimTeam' | 'gameVersion' | 'ammoType' | 'kind' | 'won' | 'map' | 'mode' | 'converterVersion';
  a: string[];
  b: string[];
}

export interface ViewRequest {
  vehicle: string;
  grouping: Grouping;
  /** The model's plates, by `platesKey` (sent with `plates` first). */
  platesKey: string | null;
  filter: HitFilter;
  metric: PlateMetric;
  minHits: number;
  centre: 'overall' | 'half';
  compare: Compare | null;
  marks: number;
  /** What the marks' colour shows: result, or one effect. */
  markBy: 'result' | Effect;
  charts: { field: BinField; kind: 'rate' | 'histogram'; split: 'none' | 'kind' | 'ammoType' }[];
  top: ('attacker' | 'ammoName' | 'ammoType' | 'kind' | 'map' | 'attackerPlayer' | 'victim')[];
  /** Plate whose own charts are asked (hovered or clicked), -1 none. */
  plate: number;
}

export interface ViewResult {
  key: string;
  hits: number;
  kept: number;
  known: number;
  through: number;
  stats: PlateStat[] | null;
  colours: { t: Float32Array; lo: number; mid: number; hi: number; diverging: boolean } | null;
  /** Per plate A and B rates and the difference's z, when comparing. */
  compare: { a: PlateStat[]; b: PlateStat[]; diff: number[]; z: number[]; aHits: number; bHits: number } | null;
  /** Marks: rest point and normal x3, the hit's index, result, calibre (mm), effect bits; `n` of them. */
  marks: { n: number; point: Float32Array; normal: Float32Array; index: Uint32Array; result: Uint8Array; calibre: Float32Array; effects: Uint32Array };
  charts: ChartData[];
  top: Record<string, TopRow[]>;
  /** Hits with a plate, an angle, a recorded direction, a speed estimate; of `kept`. */
  coverage: { plate: number; angle: number; dir: number; speed: number; distance: number; pose: number };
  ms: number;
}

export interface Facets {
  vehicles: { id: string; hits: number }[];
  ammoTypes: [string, number][];
  ammoNames: [string, number][];
  maps: [string, number][];
  modes: [string, number][];
  gameVersions: [string, number][];
  converterVersions: [string, number][];
  teams: [string, number][];
  attackers: [string, number][];
  dates: [number, number] | null;
}

export interface HitDetail {
  index: number;
  match: { id: string; file: number; map: string; mode: string; started: number; gameVersion: string };
  time: number;
  victim: string;
  attacker: string;
  victimPlayer: string;
  attackerPlayer: string;
  victimTeam: string;
  attackerTeam: string;
  won: boolean | null;
  result: string;
  calibre: number | null;
  ammoType: string;
  ammoName: string;
  kind: string;
  part: number;
  speed: number | null;
  speedSource: string;
  descent: number | null;
  descentSource: string;
  distance: number | null;
  distanceSource: string;
  angle: number | null;
  angleSource: string;
  effMm: number | null;
  plate: number;
  effects: Effect[];
  local: [number, number, number] | null;
  dir: [number, number, number] | null;
  pose: boolean;
}

export type HitWorkerRequest =
  | { type: 'load'; files: File[]; tokens: (string | null)[] | null; core: CoreEndpoint | null; partNames: string[] | null; pose: boolean; cache: boolean; budget: number; jobs: number; add: boolean }
  | { type: 'cancel' }
  | { type: 'meta'; meta: Record<string, VehicleMeta | null> }
  | { id: number; type: 'facets' }
  | { id: number; type: 'plates'; key: string; vehicle: string; grouping: Grouping; plates: PlateGeometry[]; names: string[] | null; turret: [number, number, number] | null; gun: [number, number, number] | null }
  | ({ id: number; type: 'view' } & ViewRequest)
  | { id: number; type: 'hit'; index: number; platesKey: string | null }
  | { id: number; type: 'rows'; vehicle: string; grouping: Grouping; filter: HitFilter; platesKey: string | null; plateNames: string[] | null; limit: number };

/** A vehicle's hits as a table (the dashboards' source, `dashSource.ts`): numbers, and categories as codes into their lists. */
export interface HitRows {
  n: number;
  /** Of the vehicle's hits passing the filter, before `limit` cut them. */
  total: number;
  time: Float32Array;
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  match: Uint32Array;
  matchLabels: string[];
  player: Uint32Array;
  playerLabels: string[];
  team: Uint32Array;
  teamLabels: string[];
  cats: { name: string; codes: Uint32Array; labels: string[] }[];
  nums: { name: string; data: Float32Array }[];
}

export type HitWorkerReply =
  | { type: 'progress'; stats: LoadStats; vehicles: string[] }
  | { type: 'error'; message: string }
  | { id: number; type: 'answer'; value: unknown }
  | { id: number; type: 'failed'; message: string };

let store = new HitStore();
const stats: LoadStats = { files: 0, done: 0, matches: 0, hits: 0, bytes: 0, rows: 0, kept: 0, cached: 0, native: 0, failed: 0, empty: 0, ms: 0, stopped: 0, running: false };
let pool: Worker[] = [];
let generation = 0;
let metaSent = 0;
/** Per plates key: the model's plate count and its hits' plates. */
const plateSets = new Map<string, { count: number; ph: PlateHits; at: Int32Array; vehicle: string; grouping: Grouping }>();

const post = (m: HitWorkerReply, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(m, transfer);

function progress(): void {
  stats.hits = store.n;
  stats.matches = store.matches.length;
  stats.bytes = store.bytes();
  const fresh = store.vehicles.list.slice(metaSent);
  metaSent = store.vehicles.list.length;
  post({ type: 'progress', stats: { ...stats }, vehicles: fresh });
}

/** Muzzle speeds of every shell the install's range catalogue lists (`/__heat3d/ranges/wt`), by name. */
async function loadCatalogue(): Promise<void> {
  if (store.catalogue.size) return;
  try {
    const r = await fetch(new URL('/__heat3d/ranges/wt', self.location.origin));
    if (!r.ok || r.status === 204) return;
    const doc = (await r.json()) as { weapons?: { detail?: { shells?: { name?: string; speed?: number }[] } }[] };
    for (const w of doc.weapons ?? []) for (const s of w.detail?.shells ?? []) if (s.name && typeof s.speed === 'number') store.catalogue.set(s.name.toLowerCase(), s.speed);
  } catch {
    // No catalogue: muzzle speeds by the round's kind.
  }
}

async function load(q: Extract<HitWorkerRequest, { type: 'load' }>): Promise<void> {
  const gen = ++generation;
  for (const w of pool) w.terminate();
  pool = [];
  if (!q.add) {
    store = new HitStore();
    plateSets.clear();
    metaSent = 0;
    Object.assign(stats, { files: 0, done: 0, rows: 0, kept: 0, cached: 0, native: 0, failed: 0, empty: 0, ms: 0, stopped: 0 });
  }
  await loadCatalogue();
  const base = stats.files;
  stats.files += q.files.length;
  stats.running = true;
  const t0 = performance.now() - stats.ms;
  progress();
  let next = 0;
  let lastProgress = 0;
  const jobs = Math.max(1, Math.min(q.jobs, q.files.length));
  await new Promise<void>((resolve) => {
    let busy = 0;
    const feed = (w: Worker) => {
      if (gen !== generation) return;
      if (next >= q.files.length || store.bytes() > q.budget) {
        if (store.bytes() > q.budget && next < q.files.length) {
          stats.stopped = q.files.length - next;
          next = q.files.length;
        }
        if (busy === 0) resolve();
        return;
      }
      const i = next++;
      busy++;
      const token = q.tokens?.[i] ?? null;
      w.postMessage({ type: 'scan', index: base + i, file: q.files[i], partNames: null, pose: q.pose, cache: q.cache, native: q.core && token ? { core: q.core, token } : null } satisfies ScanRequest);
    };
    for (let k = 0; k < jobs; k++) {
      const w = new Worker(new URL('./scanWorker.ts', import.meta.url), { type: 'module' });
      pool.push(w);
      // The part names once a worker, not with every file.
      w.postMessage({ type: 'names', names: q.partNames } satisfies ScanRequest);
      w.onmessage = (e: MessageEvent<ScanReply>) => {
        if (gen !== generation) return;
        busy--;
        const r = e.data;
        stats.done++;
        if (r.error) {
          stats.failed++;
          stats.lastError = `${q.files[r.index - base]?.name ?? r.index}: ${r.error}`;
        }
        else if (!r.block) stats.empty++;
        else {
          store.add(r.block);
          store.deriveFlights();
          stats.rows += r.block.rows;
          stats.kept += r.block.kept;
          if (r.cached) stats.cached++;
          if (r.block.native) stats.native++;
        }
        stats.ms = performance.now() - t0;
        const now = performance.now();
        if (now - lastProgress > 250) {
          lastProgress = now;
          progress();
        }
        feed(w);
      };
      // A reader that fails to start (its module, its memory) takes no more files; its file counts as failed.
      let dead = false;
      w.onerror = (ev) => {
        ev.preventDefault?.();
        if (dead) return;
        dead = true;
        busy--;
        stats.done++;
        stats.failed++;
        post({ type: 'error', message: `a reader stopped: ${(ev as ErrorEvent).message ?? 'error'}` });
        w.terminate();
        const alive = pool.filter((x) => x !== w);
        pool.length = 0;
        pool.push(...alive);
        if (!alive.length) {
          stats.failed += q.files.length - next;
          stats.done += q.files.length - next;
          next = q.files.length;
          if (busy <= 0) resolve();
        } else if (busy <= 0 && next >= q.files.length) resolve();
      };
      feed(w);
    }
  });
  if (gen !== generation) return;
  for (const w of pool) w.terminate();
  pool = [];
  stats.running = false;
  stats.ms = performance.now() - t0;
  plateSets.clear();
  store.plateHits.clear();
  progress();
}

function tallyOf(list: readonly string[], col: ArrayLike<number>, n: number, limit = 400): [string, number][] {
  const c = new Float64Array(list.length);
  for (let i = 0; i < n; i++) c[col[i]]++;
  return list.map((s, k) => [s, c[k]] as [string, number]).filter(([s, v]) => s && v > 0).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function facets(): Facets {
  const s = store, c = s.cols, n = s.n;
  const victims = tallyOf(s.vehicles.list, c.victim, n, 100000);
  const byMatch = (get: (m: (typeof s.matches)[number]) => string) => {
    const per = new Float64Array(s.matches.length);
    for (let i = 0; i < n; i++) per[c.match[i]]++;
    const m = new Map<string, number>();
    s.matches.forEach((x, k) => m.set(get(x), (m.get(get(x)) ?? 0) + per[k]));
    return [...m.entries()].filter(([k]) => k).sort((a, b) => b[1] - a[1]);
  };
  let d0 = Infinity, d1 = -Infinity;
  for (const m of s.matches) if (Number.isFinite(m.started)) {
    d0 = Math.min(d0, m.started);
    d1 = Math.max(d1, m.started);
  }
  return {
    vehicles: victims.map(([id, hits]) => ({ id, hits })),
    ammoTypes: tallyOf(s.ammoTypes.list, c.ammoType, n),
    ammoNames: tallyOf(s.ammoNames.list, c.ammoName, n),
    maps: byMatch((m) => m.map),
    modes: byMatch((m) => m.mode),
    gameVersions: byMatch((m) => m.gameVersion),
    converterVersions: byMatch((m) => m.converterVersion),
    teams: tallyOf(s.teams.list, c.victimTeam, n),
    attackers: tallyOf(s.vehicles.list, c.attacker, n),
    dates: Number.isFinite(d0) ? [d0, d1] : null,
  };
}

/** The rows of the vehicle (grouping) in the store. */
function rowsOf(vehicle: string, grouping: Grouping): Uint32Array {
  const v = victimsOf(store, vehicle, grouping);
  const c = store.cols;
  let k = 0;
  for (let i = 0; i < store.n; i++) if (v.has(c.victim[i])) k++;
  const out = new Uint32Array(k);
  k = 0;
  for (let i = 0; i < store.n; i++) if (v.has(c.victim[i])) out[k++] = i;
  return out;
}

const viewRows = new Map<string, Uint32Array>();
function vehicleRows(vehicle: string, grouping: Grouping): Uint32Array {
  const key = `${vehicle}|${grouping}|${store.n}`;
  let r = viewRows.get(key);
  if (!r) {
    if (viewRows.size > 16) viewRows.clear();
    r = rowsOf(vehicle, grouping);
    viewRows.set(key, r);
  }
  return r;
}

function plates(q: Extract<HitWorkerRequest, { type: 'plates' }>): { count: number; withPlate: number } {
  const rows = vehicleRows(q.vehicle, q.grouping);
  const ph = store.platesFor(`${q.key}|${q.grouping}|${q.vehicle}|${store.n}`, rows, q.plates, q.names, q.turret, q.gun);
  const at = new Int32Array(store.n).fill(-1);
  for (let j = 0; j < rows.length; j++) at[rows[j]] = j;
  plateSets.set(q.key, { count: q.plates.length, ph, at, vehicle: q.vehicle, grouping: q.grouping });
  let withPlate = 0;
  for (let j = 0; j < ph.plate.length; j++) if (ph.plate[j] >= 0) withPlate++;
  return { count: q.plates.length, withPlate };
}

/** Splits a filter into the comparison's halves. */
function halves(base: HitFilter, cmp: Compare): [(i: number) => boolean, (i: number) => boolean] {
  const s = store, c = s.cols;
  const side = (values: string[]): ((i: number) => boolean) => {
    const want = new Set(values);
    switch (cmp.field) {
      case 'victimTeam': {
        const t = Uint8Array.from(s.teams.list, (x) => (want.has(x) ? 1 : 0));
        return (i) => t[c.victimTeam[i]] === 1;
      }
      case 'ammoType': {
        const t = Uint8Array.from(s.ammoTypes.list, (x) => (want.has(x) ? 1 : 0));
        return (i) => t[c.ammoType[i]] === 1;
      }
      case 'kind':
        return (i) => want.has(s.kindOf(i));
      case 'won':
        return (i) => (c.flags[i] & FLAG_RESULT_KNOWN) !== 0 && want.has(c.flags[i] & FLAG_WON ? 'won' : 'lost');
      default: {
        const f = cmp.field;
        const ok = Uint8Array.from(s.matches, (m) => (want.has(String(m[f as 'map'])) ? 1 : 0));
        return (i) => ok[c.match[i]] === 1;
      }
    }
  };
  void base;
  return [side(cmp.a), side(cmp.b)];
}

const EMPTY_MARKS = () => ({ n: 0, point: new Float32Array(0), normal: new Float32Array(0), index: new Uint32Array(0), result: new Uint8Array(0), calibre: new Float32Array(0), effects: new Uint32Array(0) });

function view(q: ViewRequest): ViewResult {
  const t0 = performance.now();
  const rows = vehicleRows(q.vehicle, q.grouping);
  const set = q.platesKey ? plateSets.get(q.platesKey) : undefined;
  const ps = set && set.vehicle === q.vehicle && set.grouping === q.grouping ? set : undefined;
  const keep = compileFilter(store, q.filter, ps ? { ph: ps.ph, at: ps.at } : null);
  const c = store.cols;
  let kept = 0, known = 0, through = 0;
  const cov = { plate: 0, angle: 0, dir: 0, speed: 0, distance: 0, pose: 0 };
  const keptRows: number[] = [];
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    if (!keep(i)) continue;
    kept++;
    keptRows.push(j);
    if (c.result[i]) {
      known++;
      if (c.result[i] >= 2) through++;
    }
    if (c.flags[i] & FLAG_DIR) cov.dir++;
    if (c.flags[i] & FLAG_DIST) cov.distance++;
    if (c.flags[i] & FLAG_POSE) cov.pose++;
    if (store.speedSrc[i]) cov.speed++;
    if (ps) {
      if (ps.ph.plate[j] >= 0) cov.plate++;
      if (Number.isFinite(ps.ph.angle[j])) cov.angle++;
    }
  }
  let stats: PlateStat[] | null = null;
  let colours: ViewResult['colours'] = null;
  let compare: ViewResult['compare'] = null;
  if (ps) {
    stats = plateStats(store, ps.ph, ps.count, keep);
    let diff: number[] | null = null;
    if (q.compare) {
      const [ha, hb] = halves(q.filter, q.compare);
      const a = plateStats(store, ps.ph, ps.count, (i) => keep(i) && ha(i));
      const b = plateStats(store, ps.ph, ps.count, (i) => keep(i) && hb(i));
      diff = a.map((x, k) => (x.known >= q.minHits && b[k].known >= q.minHits ? x.rate - b[k].rate : NaN));
      const z = a.map((x, k) => twoProportion(x.through, x.known, b[k].through, b[k].known).z);
      compare = { a, b, diff, z, aHits: a.reduce((s, x) => s + x.hits, 0), bHits: b.reduce((s, x) => s + x.hits, 0) };
    }
    colours = plateColours(stats, q.compare ? 'diff' : q.metric, q.minHits, diff, q.centre);
  }
  // Marks: an even sample of the kept hits that lie on a plate.
  let marks = EMPTY_MARKS();
  if (ps && q.marks > 0) {
    const on = keptRows.filter((j) => ps.ph.plate[j] >= 0 && Number.isFinite(ps.ph.point[j * 3]));
    const step = Math.max(1, on.length / q.marks);
    const n = Math.min(on.length, q.marks);
    marks = { n, point: new Float32Array(n * 3), normal: new Float32Array(n * 3), index: new Uint32Array(n), result: new Uint8Array(n), calibre: new Float32Array(n), effects: new Uint32Array(n) };
    for (let k = 0; k < n; k++) {
      const j = on[Math.floor(k * step)];
      const i = rows[j];
      marks.point.set(ps.ph.point.subarray(j * 3, j * 3 + 3), k * 3);
      marks.normal.set(ps.ph.normal.subarray(j * 3, j * 3 + 3), k * 3);
      marks.index[k] = i;
      marks.result[k] = c.result[i];
      marks.calibre[k] = c.calibre[i] / 10;
      marks.effects[k] = c.effects[i];
    }
  }
  // Charts and tables over the kept hits (of the plate asked, when one is).
  const onPlate = ps && q.plate >= 0 ? (i: number) => ps.at[i] >= 0 && ps.ph.plate[ps.at[i]] === q.plate : null;
  const keepChart = onPlate ? (i: number) => keep(i) && onPlate(i) : keep;
  const charts = q.charts.map((ch) => (ch.kind === 'rate' ? rateOver(store, rows, ch.field, keepChart, ps?.ph ?? null, ch.split) : histogram(store, rows, ch.field, keepChart, ps?.ph ?? null)));
  const top: Record<string, TopRow[]> = {};
  for (const by of q.top) top[by] = topBy(store, rows, by, keepChart, 20);
  return { key: `${q.vehicle}|${q.grouping}`, hits: rows.length, kept, known, through, stats, colours, compare, marks, charts, top, coverage: cov, ms: performance.now() - t0 };
}

/** The rows of a vehicle that pass the filter, as a table (at most `limit`, an even sample past it). */
function hitRows(q: Extract<HitWorkerRequest, { type: 'rows' }>): HitRows {
  const s = store, c = s.cols;
  const rows = vehicleRows(q.vehicle, q.grouping);
  const set = q.platesKey ? plateSets.get(q.platesKey) : undefined;
  const ps = set && set.vehicle === q.vehicle && set.grouping === q.grouping ? set : undefined;
  const keep = compileFilter(s, q.filter, ps ? { ph: ps.ph, at: ps.at } : null);
  const js: number[] = [];
  for (let j = 0; j < rows.length; j++) if (keep(rows[j])) js.push(j);
  const step = Math.max(1, js.length / Math.max(1, q.limit));
  const n = Math.min(js.length, q.limit);
  const pick = (k: number) => js[Math.floor(k * step)];
  /** Codes into a list of their own, made as they come. */
  const coder = () => {
    const m = new Map<string, number>();
    const labels: string[] = [];
    return { labels, code: (v: string) => {
      let k = m.get(v);
      if (k === undefined) m.set(v, (k = labels.push(v) - 1));
      return k;
    } };
  };
  const catNames = ['vehicle', 'attacker', 'attacker class', 'attacker nation', 'shell type', 'shell', 'shell kind', 'result', 'plate', 'map', 'mode', 'version', 'converter', 'shooter'];
  const coders = catNames.map(() => coder());
  const codes = catNames.map(() => new Uint32Array(n));
  const numNames = ['angle', 'speed', 'descent', 'distance', 'effMm', 'calibre', 'penetrated', 'won', ...EFFECTS];
  const nums = numNames.map(() => new Float32Array(n));
  const out: HitRows = { n, total: js.length, time: new Float32Array(n), x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), match: new Uint32Array(n), matchLabels: [], player: new Uint32Array(n), playerLabels: [], team: new Uint32Array(n), teamLabels: [], cats: [], nums: [] };
  const mc = coder(), pc = coder(), tc = coder();
  for (let k = 0; k < n; k++) {
    const j = pick(k);
    const i = rows[j];
    const m = s.matches[c.match[i]];
    out.time[k] = c.time[i];
    const pj = ps ? ps.at[i] : -1;
    if (ps && pj >= 0 && Number.isFinite(ps.ph.point[pj * 3])) {
      out.x[k] = ps.ph.point[pj * 3];
      out.y[k] = ps.ph.point[pj * 3 + 1];
      out.z[k] = ps.ph.point[pj * 3 + 2];
    } else if (c.flags[i] & FLAG_LOCAL) {
      out.x[k] = c.lx[i] / 1000;
      out.y[k] = c.ly[i] / 1000;
      out.z[k] = c.lz[i] / 1000;
    }
    out.match[k] = mc.code(m.id);
    out.player[k] = pc.code(s.players.list[c.attackerPlayer[i]]);
    out.team[k] = tc.code(s.teams.list[c.victimTeam[i]]);
    const meta = s.meta[c.attacker[i]];
    const plate = ps && pj >= 0 ? ps.ph.plate[pj] : -1;
    const vals = [
      s.vehicles.list[c.victim[i]],
      s.vehicles.list[c.attacker[i]],
      meta?.cls ?? '',
      meta?.nation ?? '',
      s.ammoTypes.list[c.ammoType[i]],
      s.ammoNames.list[c.ammoName[i]],
      s.kindOf(i),
      RESULTS[c.result[i]],
      plate >= 0 && q.plateNames ? (q.plateNames[plate] ?? '') : '',
      m.map,
      m.mode,
      m.gameVersion,
      m.converterVersion,
      s.players.list[c.attackerPlayer[i]],
    ];
    for (let a = 0; a < vals.length; a++) codes[a][k] = coders[a].code(vals[a]);
    const flag = c.flags[i];
    const v = [
      ps && pj >= 0 ? ps.ph.angle[pj] : NaN,
      s.speedSrc[i] ? s.speed[i] : NaN,
      s.descent[i] !== NONE16 ? s.descent[i] / 100 : NaN,
      flag & FLAG_DIST ? c.dist[i] / 4 : NaN,
      ps && pj >= 0 ? ps.ph.effMm[pj] : NaN,
      c.calibre[i] ? c.calibre[i] / 10 : NaN,
      c.result[i] ? (c.result[i] >= 2 ? 1 : 0) : NaN,
      flag & FLAG_RESULT_KNOWN ? (flag & FLAG_WON ? 1 : 0) : NaN,
      ...EFFECTS.map((_, b) => (c.effects[i] & (1 << b) ? 1 : 0)),
    ];
    for (let a = 0; a < v.length; a++) nums[a][k] = v[a];
  }
  out.matchLabels = mc.labels;
  out.playerLabels = pc.labels;
  out.teamLabels = tc.labels;
  out.cats = catNames.map((name, a) => ({ name, codes: codes[a], labels: coders[a].labels }));
  out.nums = numNames.map((name, a) => ({ name, data: nums[a] }));
  return out;
}

function hit(index: number, platesKey: string | null): HitDetail | null {
  const s = store, c = s.cols;
  if (index < 0 || index >= s.n) return null;
  const m = s.matches[c.match[index]];
  const ps = platesKey ? plateSets.get(platesKey) : undefined;
  const j = ps ? ps.at[index] : -1;
  const effects = EFFECTS.filter((_, b) => c.effects[index] & (1 << b));
  const flag = c.flags[index];
  return {
    index,
    match: { id: m.id, file: m.file, map: m.map, mode: m.mode, started: m.started, gameVersion: m.gameVersion },
    time: c.time[index],
    victim: s.vehicles.list[c.victim[index]],
    attacker: s.vehicles.list[c.attacker[index]],
    victimPlayer: s.players.list[c.victimPlayer[index]],
    attackerPlayer: s.players.list[c.attackerPlayer[index]],
    victimTeam: s.teams.list[c.victimTeam[index]],
    attackerTeam: s.teams.list[c.attackerTeam[index]],
    won: flag & FLAG_RESULT_KNOWN ? (flag & FLAG_WON) !== 0 : null,
    result: RESULTS[c.result[index]],
    calibre: c.calibre[index] ? c.calibre[index] / 10 : null,
    ammoType: s.ammoTypes.list[c.ammoType[index]],
    ammoName: s.ammoNames.list[c.ammoName[index]],
    kind: s.kindOf(index),
    part: c.part[index],
    speed: s.speedSrc[index] ? s.speed[index] : null,
    speedSource: sourceName(s.speedSrc[index]),
    descent: s.descent[index] !== NONE16 ? s.descent[index] / 100 : null,
    descentSource: sourceName(s.descentSrc[index]),
    distance: flag & FLAG_DIST ? c.dist[index] / 4 : null,
    distanceSource: flag & FLAG_DIST ? 'derived' : 'unknown',
    angle: ps && j >= 0 && Number.isFinite(ps.ph.angle[j]) ? ps.ph.angle[j] : null,
    angleSource: ps && j >= 0 ? sourceName(ps.ph.angleSrc[j]) : 'unknown',
    effMm: ps && j >= 0 && Number.isFinite(ps.ph.effMm[j]) ? ps.ph.effMm[j] : null,
    plate: ps && j >= 0 ? ps.ph.plate[j] : -1,
    effects,
    local: flag & FLAG_LOCAL ? [c.lx[index] / 1000, c.ly[index] / 1000, c.lz[index] / 1000] : null,
    dir: flag & FLAG_DIR ? [c.dx[index] / 127, c.dy[index] / 127, c.dz[index] / 127] : null,
    pose: (flag & FLAG_POSE) !== 0,
  };
}

self.onmessage = (e: MessageEvent<HitWorkerRequest>) => {
  const q = e.data;
  try {
    switch (q.type) {
      case 'load':
        load(q).catch((err) => post({ type: 'error', message: (err as Error).message }));
        return;
      case 'cancel':
        generation++;
        for (const w of pool) w.terminate();
        pool = [];
        stats.running = false;
        progress();
        return;
      case 'meta':
        for (const [id, m] of Object.entries(q.meta)) {
          const code = store.vehicles.get(id);
          if (code !== undefined) store.meta[code] = m;
        }
        viewRows.clear();
        return;
      case 'facets':
        post({ id: q.id, type: 'answer', value: facets() });
        return;
      case 'plates':
        post({ id: q.id, type: 'answer', value: plates(q) });
        return;
      case 'view': {
        const r = view(q);
        post({ id: q.id, type: 'answer', value: r }, [r.marks.point.buffer, r.marks.normal.buffer, r.marks.index.buffer, r.marks.result.buffer, r.marks.calibre.buffer, r.marks.effects.buffer] as ArrayBuffer[]);
        return;
      }
      case 'hit':
        post({ id: q.id, type: 'answer', value: hit(q.index, q.platesKey) });
        return;
      case 'rows': {
        const r = hitRows(q);
        post({ id: q.id, type: 'answer', value: r }, [r.time, r.x, r.y, r.z, r.match, r.player, r.team, ...r.cats.map((x) => x.codes), ...r.nums.map((x) => x.data)].map((a) => a.buffer as ArrayBuffer));
        return;
      }
    }
  } catch (err) {
    if ('id' in q) post({ id: q.id, type: 'failed', message: (err as Error).message ?? String(err) });
    else post({ type: 'error', message: (err as Error).message ?? String(err) });
  }
};

/** For the tests: the store the worker holds. */
export function _store(): HitStore {
  return store;
}
