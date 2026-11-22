/**
 * The person-hit analysis worker (docs/person-hits.md): holds the hits of a
 * mass load (`store.ts`), reads the files through a pool of scan workers
 * (`scanWorker.ts`) and answers the panel: the body regions' numbers, the
 * marks, the charts, the top lists, where the values came from, and the hits
 * as rows for the dashboards. Nothing of it runs on the page's frame path.
 */

import type { ChartData } from '../charts/types';
import { armourEffect, compileFilter, coverageOf, distanceHistogram, facetsOf, falloff, headshotRate, metricOf, regionStats, topBy, wholeDamage, type Coverage, type Facets, type PersonFilter, type RegionMetric, type RegionStat, type TopField, type TopRow } from './analyze';
import { PersonStore } from './store';
import type { PersonScanReply, PersonScanRequest } from './scanWorker';
import { GAMES, HITGROUPS, SOURCES, SOURCE_FIELDS, regionOfGroup, sideOfAngle, zoneOfGroup } from './types';

export interface PersonLoadStats {
  files: number;
  done: number;
  matches: number;
  hits: number;
  bytes: number;
  rows: number;
  kept: number;
  cached: number;
  failed: number;
  empty: number;
  ms: number;
  stopped: number;
  running: boolean;
  lastError?: string;
}

export interface PersonView {
  /** Hits passing the filter, of all loaded. */
  kept: number;
  total: number;
  /** Regions (fine) or zones (head, body, legs) as the body is coloured. */
  mode: 'fine' | 'coarse';
  regions: RegionStat[];
  zones: RegionStat[];
  placed: number;
  /** The metric per region (fine) or zone, and its range. */
  values: number[];
  lo: number;
  hi: number;
  /** A sample of hit points on the body (x, y, z in the figure frame, metres) with region and kill. */
  marks: { x: Float32Array; y: Float32Array; z: Float32Array; region: Int8Array; kill: Int8Array };
  charts: ChartData[];
  tops: Record<TopField, TopRow[]>;
  /** Per game: the share of each field's sources among the kept hits. */
  coverage: Coverage;
}

export interface PersonRows {
  n: number;
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

export type PersonWorkerRequest =
  | { type: 'load'; files: File[]; add: boolean; jobs: number; budget: number; cache: boolean }
  | { type: 'cancel' }
  | { id: number; type: 'view'; filter: PersonFilter; metric: RegionMetric; mode: 'auto' | 'fine' | 'coarse'; marks: number }
  | { id: number; type: 'rows'; filter: PersonFilter; limit: number }
  | { id: number; type: 'coverage' };

export type PersonWorkerReply =
  | { type: 'progress'; stats: PersonLoadStats; facets: Facets | null }
  | { type: 'error'; message: string }
  | { id: number; type: 'answer'; value: unknown }
  | { id: number; type: 'failed'; message: string };

let store = new PersonStore();
const stats: PersonLoadStats = { files: 0, done: 0, matches: 0, hits: 0, bytes: 0, rows: 0, kept: 0, cached: 0, failed: 0, empty: 0, ms: 0, stopped: 0, running: false };
let pool: Worker[] = [];
let generation = 0;
const post = (m: PersonWorkerReply, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(m, transfer);

let facetsAt = 0;
function progress(final = false): void {
  stats.hits = store.n;
  stats.matches = store.matches.length;
  stats.bytes = store.bytes();
  // The filter's value lists: at the end, and now and then while a load runs (each list is a render of the panel).
  const now = performance.now();
  const facets = final || now - facetsAt > 3000 ? facetsOf(store) : null;
  if (facets) facetsAt = now;
  post({ type: 'progress', stats: { ...stats }, facets });
}

async function load(q: Extract<PersonWorkerRequest, { type: 'load' }>): Promise<void> {
  const gen = ++generation;
  for (const w of pool) w.terminate();
  pool = [];
  if (!q.add) {
    store = new PersonStore();
    Object.assign(stats, { files: 0, done: 0, rows: 0, kept: 0, cached: 0, failed: 0, empty: 0, ms: 0, stopped: 0, lastError: undefined });
  }
  const base = stats.files;
  stats.files += q.files.length;
  stats.running = true;
  const t0 = performance.now() - stats.ms;
  progress();
  let next = 0, last = 0;
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
      w.postMessage({ type: 'scan', index: base + i, file: q.files[i], cache: q.cache } satisfies PersonScanRequest);
    };
    for (let k = 0; k < jobs; k++) {
      const w = new Worker(new URL('./scanWorker.ts', import.meta.url), { type: 'module' });
      pool.push(w);
      w.onmessage = (e: MessageEvent<PersonScanReply>) => {
        if (gen !== generation) return;
        busy--;
        const r = e.data;
        stats.done++;
        if (r.error) {
          stats.failed++;
          stats.lastError = `${q.files[r.index - base]?.name ?? r.index}: ${r.error}`;
        } else if (!r.block) stats.empty++;
        else {
          store.add(r.block);
          stats.rows += r.block.rows;
          stats.kept += r.block.kept;
          if (r.cached) stats.cached++;
        }
        stats.ms = performance.now() - t0;
        const now = performance.now();
        if (now - last > 1000) {
          last = now;
          progress();
        }
        feed(w);
      };
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
        pool = pool.filter((x) => x !== w);
        if (!pool.length) {
          stats.failed += q.files.length - next;
          stats.done += q.files.length - next;
          next = q.files.length;
        }
        if (busy <= 0 && next >= q.files.length) resolve();
      };
      feed(w);
    }
  });
  if (gen !== generation) return;
  for (const w of pool) w.terminate();
  pool = [];
  stats.running = false;
  stats.ms = performance.now() - t0;
  progress(true);
}

function rowsOf(filter: PersonFilter): Uint32Array {
  const keep = compileFilter(store, filter);
  const out = new Uint32Array(store.n);
  let k = 0;
  for (let i = 0; i < store.n; i++) if (keep(i)) out[k++] = i;
  return out.subarray(0, k);
}

function view(q: Extract<PersonWorkerRequest, { type: 'view' }>): PersonView {
  const rows = rowsOf(q.filter);
  const rs = regionStats(store, rows);
  const mode = q.mode === 'auto' ? (rs.coarse > rs.fine ? 'coarse' : 'fine') : q.mode;
  const list = mode === 'fine' ? rs.regions : rs.zones;
  const values = list.map((st) => (st.hits >= 1 ? metricOf(st, q.metric) : NaN));
  const finite = values.filter(Number.isFinite);
  let lo = finite.length ? Math.min(...finite) : 0, hi = finite.length ? Math.max(...finite) : 1;
  if (q.metric === 'share' || q.metric === 'killRate') lo = Math.min(lo, 0);
  if (hi - lo < 1e-9) hi = lo + 1;
  // Marks: the hits with a point on the body, an even sample.
  const withPoint: number[] = [];
  const c = store.cols;
  for (let j = 0; j < rows.length; j++) if (Number.isFinite(c.num.localX[rows[j]])) withPoint.push(rows[j]);
  const m = Math.min(q.marks, withPoint.length);
  const marks = { x: new Float32Array(m), y: new Float32Array(m), z: new Float32Array(m), region: new Int8Array(m), kill: new Int8Array(m) };
  for (let k = 0; k < m; k++) {
    const i = withPoint[Math.floor((k * withPoint.length) / m)];
    marks.x[k] = c.num.localX[i];
    marks.y[k] = c.num.localY[i];
    marks.z[k] = c.num.localZ[i];
    marks.region[k] = regionOfGroup(c.int.hitgroup[i]);
    marks.kill[k] = c.int.kill[i];
  }
  const tops = {} as Record<TopField, TopRow[]>;
  for (const f of ['weapon', 'shooter', 'victim', 'armor', 'victimRole', 'ammo'] as const) tops[f] = topBy(store, rows, f);
  return {
    kept: rows.length,
    total: store.n,
    mode,
    regions: rs.regions,
    zones: rs.zones,
    placed: rs.placed,
    values,
    lo,
    hi,
    marks,
    charts: [falloff(store, rows), headshotRate(store, rows), armourEffect(store, rows), distanceHistogram(store, rows)],
    tops,
    coverage: coverageOf(store, rows),
  };
}

/** The kept hits as a table for the dashboards: an even sample past `limit`. */
function rows(q: Extract<PersonWorkerRequest, { type: 'rows' }>): PersonRows {
  const all = rowsOf(q.filter);
  const n = Math.min(all.length, q.limit);
  const pick = (k: number) => all[n === all.length ? k : Math.floor((k * all.length) / n)];
  const c = store.cols;
  const f32 = () => new Float32Array(n);
  const time = f32(), x = f32(), y = f32(), z = f32();
  const match = new Uint32Array(n), player = new Uint32Array(n), team = new Uint32Array(n);
  const playerLabels = store.dicts.victim.list, teamLabels = store.dicts.victimSide.list;
  const catNames = {
    game: 'game', map: 'map', weapon: 'weapon', weaponClass: 'weapon class', ammo: 'ammo', ammoType: 'ammo type', armor: 'armour', victim: 'victim', shooter: 'shooter', victimSide: 'side', shooterSide: 'shooter side', victimRole: 'role', victimState: 'victim state', shooterState: 'shooter state', region: 'region', zone: 'zone', from: 'from',
  } as const;
  const cats = Object.entries(catNames).map(([key, name]) => ({ key, name, codes: new Uint32Array(n), labels: [] as string[] }));
  const catOf = (key: string) => cats.find((x) => x.key === key)!;
  const mapDict = new Map<string, number>(), gameLabels = [...GAMES] as string[], regionLabels = ['', 'head', 'chest', 'stomach', 'left_arm', 'right_arm', 'left_leg', 'right_leg'], zoneLabels = ['', 'head', 'body', 'legs'], fromLabels = ['', 'front', 'side', 'back'];
  const mapLabels: string[] = [''];
  const numNames = ['distance', 'angle', 'elevation', 'damage', 'damageRaw', 'whole', 'armorDamage', 'absorbed', 'armorBefore', 'calibre', 'victimSpeed', 'shooterSpeed', 'kill', 'headshot', 'penetrated', 'helmet', 'won', 'round'] as const;
  const nums = numNames.map((name) => ({ name, data: f32() }));
  const numOf = (name: string) => nums.find((v) => v.name === name)!.data;
  const flag = (v: number) => (v < 0 ? NaN : v);
  for (let k = 0; k < n; k++) {
    const i = pick(k);
    time[k] = c.num.time[i];
    x[k] = c.num.x[i];
    y[k] = c.num.y[i];
    z[k] = c.num.z[i];
    match[k] = store.match[i];
    player[k] = c.txt.victim[i];
    team[k] = c.txt.victimSide[i];
    catOf('game').codes[k] = c.int.game[i];
    const mp = store.mapOf(i);
    let mc = mapDict.get(mp);
    if (mc === undefined) {
      mc = mapLabels.length;
      mapLabels.push(mp);
      mapDict.set(mp, mc);
    }
    catOf('map').codes[k] = mc;
    for (const key of ['weapon', 'weaponClass', 'ammo', 'ammoType', 'armor', 'victim', 'shooter', 'victimSide', 'shooterSide', 'victimRole', 'victimState', 'shooterState'] as const) catOf(key).codes[k] = c.txt[key][i];
    const g = c.int.hitgroup[i];
    catOf('region').codes[k] = regionOfGroup(g) + 1;
    catOf('zone').codes[k] = zoneOfGroup(g) + 1;
    const side = sideOfAngle(c.num.angle[i]);
    catOf('from').codes[k] = side ? fromLabels.indexOf(side) : 0;
    numOf('distance')[k] = c.num.distance[i];
    numOf('angle')[k] = c.num.angle[i];
    numOf('elevation')[k] = c.num.elevation[i];
    numOf('damage')[k] = c.num.damage[i];
    numOf('damageRaw')[k] = c.num.damageRaw[i];
    numOf('whole')[k] = wholeDamage(store, i);
    numOf('armorDamage')[k] = c.num.armorDamage[i];
    numOf('absorbed')[k] = c.num.absorbed[i];
    numOf('armorBefore')[k] = c.num.armorBefore[i];
    numOf('calibre')[k] = c.num.calibre[i];
    numOf('victimSpeed')[k] = c.num.victimSpeed[i];
    numOf('shooterSpeed')[k] = c.num.shooterSpeed[i];
    numOf('kill')[k] = flag(c.int.kill[i]);
    numOf('headshot')[k] = g ? (zoneOfGroup(g) === 0 ? 1 : 0) : NaN;
    numOf('penetrated')[k] = flag(c.int.penetrated[i]);
    numOf('helmet')[k] = flag(c.int.helmet[i]);
    numOf('won')[k] = flag(c.int.won[i]);
    numOf('round')[k] = c.int.round[i];
  }
  catOf('game').labels = gameLabels;
  catOf('map').labels = mapLabels;
  for (const key of ['weapon', 'weaponClass', 'ammo', 'ammoType', 'armor', 'victim', 'shooter', 'shooterSide', 'victimRole', 'victimState', 'shooterState'] as const) catOf(key).labels = store.dicts[key].list;
  catOf('victimSide').labels = store.dicts.victimSide.list;
  catOf('region').labels = regionLabels;
  catOf('zone').labels = zoneLabels;
  catOf('from').labels = fromLabels;
  return {
    n,
    total: all.length,
    time,
    x,
    y,
    z,
    match,
    matchLabels: store.matches.map((mm) => mm.id),
    player,
    playerLabels,
    team,
    teamLabels,
    cats: cats.map(({ name, codes, labels }) => ({ name, codes, labels })),
    nums,
  };
}

/** Per game, per field: the hits with each source (for the coverage table). */
function coverage(): { coverage: Coverage; sources: readonly string[]; fields: readonly string[]; hitgroups: Record<string, Record<string, number>> } {
  const hitgroups: Record<string, Record<string, number>> = {};
  for (let i = 0; i < store.n; i++) {
    const g = store.gameOf(i);
    const h = (hitgroups[g] ??= {});
    const w = HITGROUPS[store.cols.int.hitgroup[i]];
    h[w] = (h[w] ?? 0) + 1;
  }
  return { coverage: coverageOf(store), sources: SOURCES, fields: SOURCE_FIELDS, hitgroups };
}

self.onmessage = async (e: MessageEvent<PersonWorkerRequest>) => {
  const q = e.data;
  if (q.type === 'load') return void load(q).catch((err) => post({ type: 'error', message: String((err as Error)?.message ?? err) }));
  if (q.type === 'cancel') {
    generation++;
    for (const w of pool) w.terminate();
    pool = [];
    stats.running = false;
    progress(true);
    return;
  }
  try {
    if (q.type === 'view') {
      const v = view(q);
      post({ id: q.id, type: 'answer', value: v }, [v.marks.x.buffer, v.marks.y.buffer, v.marks.z.buffer, v.marks.region.buffer, v.marks.kill.buffer] as ArrayBuffer[]);
    } else if (q.type === 'rows') {
      const r = rows(q);
      post({ id: q.id, type: 'answer', value: r }, [r.time, r.x, r.y, r.z, r.match, r.player, r.team, ...r.cats.map((x) => x.codes), ...r.nums.map((x) => x.data)].map((a) => a.buffer as ArrayBuffer));
    } else if (q.type === 'coverage') post({ id: q.id, type: 'answer', value: coverage() });
  } catch (err) {
    post({ id: (q as { id: number }).id, type: 'failed', message: String((err as Error)?.message ?? err) });
  }
};
