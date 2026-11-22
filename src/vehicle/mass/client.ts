/**
 * The page's side of the vehicle-hit analysis (docs/vehicle-hits.md): the
 * worker (`hitWorker.ts`) and what the Vehicles tab asks of it. Loading
 * hands it the picked files (and, in the native app, their tokens, so the
 * core reads them); the vehicles it finds get their catalogue entries here
 * (class, nation, battle rating, the real vehicle and its family). Choosing a
 * vehicle sends its model's plates once; every change of a filter asks for
 * one view - the latest only, never on the frame path - whose plate colours
 * and marks the stage draws.
 */

import { create } from 'zustand';
import { catalogItem } from '../../figures/unitcatalog';
import { cleanName, family, nameKey } from '../../figures/vehiclenames';
import { coreEndpoint, inNativeApp } from '../../data/native/core';
import { nativeTokens } from '../../data/native/files';
import { detectBudgets } from '../../data/memory';
import { probeHostMemory } from '../../data/hostMemory';
import { namesOf, packUnitOf, platesOf } from '../plates';
import { figureOfVehicle, OUTCOME_COLOURS, templateOfFigure, type Mark } from '../scene';
import { loadPackFigures, packFigurePending } from '../../figures/figurepack';
import type { Rgb, Vec3 } from '../../race/geometry';
import type { VehicleHit } from '../hits';
import type { Grouping, HitFilter, PlateMetric } from './analyze';
import type { Compare, Facets, HitDetail, HitWorkerReply, HitWorkerRequest, LoadStats, ViewRequest, ViewResult } from './hitWorker';
import { EFFECT_BIT, R_CRIT, R_KILL, R_NONPEN, R_PEN, type Effect, type VehicleMeta } from './types';

export type ChartAsk = ViewRequest['charts'][number];

export const DEFAULT_CHARTS: ChartAsk[] = [
  { field: 'angle', kind: 'rate', split: 'kind' },
  { field: 'speed', kind: 'rate', split: 'kind' },
  { field: 'distance', kind: 'rate', split: 'none' },
  { field: 'calibre', kind: 'histogram', split: 'none' },
];

export interface HitMassState {
  /** The Vehicles tab shows the mass load (not the loaded dataset's hits). */
  active: boolean;
  stats: LoadStats | null;
  facets: Facets | null;
  error: string | null;
  vehicle: string | null;
  grouping: Grouping;
  filter: HitFilter;
  metric: PlateMetric;
  centre: 'overall' | 'half';
  minHits: number;
  compare: Compare | null;
  markBy: 'result' | Effect;
  marks: number;
  /** A plate picked (its own charts and card), -1 none. */
  plate: number;
  charts: ChartAsk[];
  /** The figure the vehicle is drawn as, and its plates' key in the worker. */
  figure: string | null;
  platesKey: string | null;
  /** The plates are being read or sent. */
  platesPending: boolean;
  result: ViewResult | null;
  /** The marks as the stage draws them, made once a result. */
  drawn: Mark[] | null;
  /** Plate colours as rgb, made once a result. */
  colours: Float32Array | null;
  detail: HitDetail | null;
  busy: boolean;
  set: (p: Partial<HitMassState>) => void;
}

export const useHitMass = create<HitMassState>((set) => ({
  active: false,
  stats: null,
  facets: null,
  error: null,
  vehicle: null,
  grouping: 'model',
  filter: {},
  metric: 'rate',
  centre: 'overall',
  minHits: 5,
  compare: null,
  markBy: 'result',
  marks: 1500,
  plate: -1,
  charts: DEFAULT_CHARTS,
  figure: null,
  platesKey: null,
  platesPending: false,
  result: null,
  drawn: null,
  colours: null,
  detail: null,
  busy: false,
  set: (p) => set(p),
}));

if (import.meta.env.DEV) (globalThis as { __hitMass?: typeof useHitMass }).__hitMass = useHitMass;

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
/** The files of the load, by their index: what a click on a hit opens. */
let loaded: File[] = [];
let loadGen = 0;

function ensure(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./hitWorker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (e: MessageEvent<HitWorkerReply>) => {
    const m = e.data;
    if (m.type === 'progress') {
      useHitMass.getState().set({ stats: m.stats });
      if (m.vehicles.length) sendMeta(m.vehicles);
      if (!m.stats.running) void refreshFacets();
    } else if (m.type === 'error') useHitMass.getState().set({ error: m.message });
    else {
      const p = pending.get(m.id);
      if (!p) return;
      pending.delete(m.id);
      if (m.type === 'answer') p.resolve(m.value);
      else p.reject(new Error(m.message));
    }
  };
  return worker;
}

export type Ask = HitWorkerRequest extends infer R ? (R extends { id: number } ? Omit<R, 'id'> : never) : never;
export function ask<T>(req: Ask): Promise<T> {
  const w = ensure();
  const id = nextId++;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    w.postMessage({ ...req, id } as HitWorkerRequest);
  });
}

/** A vehicle's catalogue entry as the analysis uses it. */
export function metaOf(id: string): VehicleMeta | null {
  const it = catalogItem(id, 'warthunder') ?? catalogItem(id);
  if (!it) return null;
  const br = ((it as unknown as { br?: Partial<Record<'ab' | 'rb' | 'sb', number>> }).br ?? {}) as VehicleMeta['br'];
  const key = nameKey(cleanName(it.key || it.name)) || id.toLowerCase();
  return { name: it.name, cls: it.class ?? it.kind ?? '', nation: it.nation ?? '', br, key, family: family(key) || key };
}

function sendMeta(ids: string[]): void {
  const meta: Record<string, VehicleMeta | null> = {};
  for (const id of ids) if (id) meta[id] = metaOf(id);
  ensure().postMessage({ type: 'meta', meta } satisfies HitWorkerRequest);
}

/** The vehicles' names the panel shows. */
export function vehicleName(id: string): string {
  return catalogItem(id, 'warthunder')?.name ?? catalogItem(id)?.name ?? id;
}

/**
 * Loads the hits of `files` (containers or War Thunder tables): within the RAM budget the viewer detects (half of
 * it: the worker's heap holds the hits), the turret's pose read from the victims' samples, the cache used.
 */
export async function loadHits(files: File[], opts: { add?: boolean; pose?: boolean; cache?: boolean } = {}): Promise<void> {
  const st = useHitMass.getState();
  if (!files.length) {
    st.set({ active: true, error: 'No matches among the files picked: War Thunder or DCS World (.3dheat or tables), IL-2 mission reports (missionReport(...)[n].txt).' });
    return;
  }
  st.set({ active: true, error: null, busy: true, ...(opts.add ? {} : { result: null, drawn: null, colours: null, detail: null, facets: null, platesKey: null }) });
  loadGen++;
  loaded = opts.add ? [...loaded, ...files] : files;
  const budgets = detectBudgets(null, await probeHostMemory().catch(() => null));
  const budget = Math.min(budgets.ram * 0.5, 3.5 * 1024 ** 3);
  let names = namesOf('warthunder');
  for (let k = 0; names === undefined && k < 100; k++) {
    await new Promise((r) => setTimeout(r, 50));
    names = namesOf('warthunder');
  }
  const native = inNativeApp();
  const core = native ? await coreEndpoint().catch(() => null) : null;
  const tokens = core ? await nativeTokens(files).catch(() => null) : null;
  const jobs = Math.max(2, Math.min(8, (navigator.hardwareConcurrency || 4) - 2));
  ensure().postMessage({ type: 'load', files, tokens, core, partNames: names ?? null, pose: opts.pose ?? true, cache: opts.cache ?? true, budget, jobs, add: !!opts.add } satisfies HitWorkerRequest);
  st.set({ busy: false });
}

export function cancelHits(): void {
  ensure().postMessage({ type: 'cancel' } satisfies HitWorkerRequest);
}

async function refreshFacets(): Promise<void> {
  const f = await ask<Facets>({ type: 'facets' });
  const st = useHitMass.getState();
  st.set({ facets: f });
  // The most-hit ground vehicle with plates first, until one is picked.
  if (!st.vehicle || !f.vehicles.some((v) => v.id === st.vehicle)) {
    const ground = f.vehicles.find((v) => /tank|armou?r|spaa|tank_destroyer|spg/i.test(metaOf(v.id)?.cls ?? ''));
    st.set({ vehicle: (ground ?? f.vehicles[0])?.id ?? null });
  }
  await selectVehicle();
}

/** Sends the shown vehicle's plates (its model's) once they are here; then the view. */
export async function selectVehicle(): Promise<void> {
  const st = useHitMass.getState();
  if (!st.vehicle) return;
  const id = st.vehicle;
  const meta = metaOf(id);
  let figure = figureOfVehicle({ id, name: meta?.name ?? id, kind: meta?.cls ?? '' });
  if (packFigurePending(figure)) await loadPackFigures([figure]).catch(() => null);
  const key = `${figure}|${id}|${st.grouping}|${loadGen}|${useHitMass.getState().stats?.hits ?? 0}`;
  st.set({ figure, platesPending: true });
  let list = platesOf(figure);
  for (let k = 0; list === undefined && k < 200; k++) {
    await new Promise((r) => setTimeout(r, 50));
    list = platesOf(figure);
  }
  if (useHitMass.getState().vehicle !== id) return;
  if (!list || !list.length || !packUnitOf(figure)) {
    useHitMass.getState().set({ platesKey: null, platesPending: false });
    figure = figure ?? null;
    void refreshView();
    return;
  }
  const t = templateOfFigure(figure);
  const turret = (t?.joints?.find((j) => j.kind === 'yaw' && j.parent < 0)?.pivot ?? null) as Vec3 | null;
  const gun = (t?.joints?.find((j) => j.kind === 'pitch')?.pivot ?? null) as Vec3 | null;
  await ask({ type: 'plates', key, vehicle: id, grouping: st.grouping, plates: list.map((p) => ({ name: p.name, part: p.part, mm: p.mm, tris: p.tris })), names: namesOf(packUnitOf(figure)!.game) ?? null, turret, gun });
  if (useHitMass.getState().vehicle !== id) return;
  useHitMass.getState().set({ platesKey: key, platesPending: false });
  void refreshView();
}

const viewListeners = new Set<() => void>();
/** Calls back after each new view (the dashboards' source follows the choice); returns the removal. */
export function onView(cb: () => void): () => void {
  viewListeners.add(cb);
  return () => viewListeners.delete(cb);
}

let asking = false;
let again = false;
/** Asks the worker for the view of the current choice: one at a time, the latest choice when it answers. */
export async function refreshView(): Promise<void> {
  if (asking) {
    again = true;
    return;
  }
  const st = useHitMass.getState();
  if (!st.vehicle) return;
  asking = true;
  try {
    const r = await ask<ViewResult>({
      type: 'view',
      vehicle: st.vehicle,
      grouping: st.grouping,
      platesKey: st.platesKey,
      filter: st.filter,
      metric: st.metric,
      minHits: st.minHits,
      centre: st.centre,
      compare: st.compare,
      marks: st.marks,
      markBy: st.markBy,
      charts: st.charts,
      top: ['attacker', 'ammoName', 'kind'],
      plate: st.plate,
    });
    const now = useHitMass.getState();
    // The view's new colours and marks this frame, the panel's numbers and charts the next: two short frames, not one long.
    useHitMass.getState().set({ drawn: drawnMarks(r, now.markBy), colours: plateRgb(r, now.compare ? 'diff' : now.metric), error: null });
    await new Promise((res) => requestAnimationFrame(() => setTimeout(res, 0)));
    useHitMass.getState().set({ result: r });
    for (const cb of viewListeners) cb();
  } catch (e) {
    useHitMass.getState().set({ error: (e as Error).message });
  } finally {
    asking = false;
    if (again) {
      again = false;
      void refreshView();
    }
  }
}

/** Sets part of the choice and asks again; a new vehicle or grouping sends its plates first. */
export function patchHits(p: Partial<Pick<HitMassState, 'vehicle' | 'grouping' | 'filter' | 'metric' | 'centre' | 'minHits' | 'compare' | 'markBy' | 'marks' | 'plate' | 'charts'>>): void {
  const st = useHitMass.getState();
  const plates = (p.vehicle !== undefined && p.vehicle !== st.vehicle) || (p.grouping !== undefined && p.grouping !== st.grouping);
  st.set({ ...p, ...(plates ? { platesKey: null, plate: -1, detail: null } : {}) });
  if (plates) void selectVehicle();
  else void refreshView();
}

/** The filter with one field changed (null or an empty list clears it). */
export function patchFilter(p: Partial<HitFilter>): void {
  patchHits({ filter: { ...useHitMass.getState().filter, ...p } });
}

// The colours: dataviz's diverging pair (blue, a neutral grey, red) and a single-hue ramp, in the dark steps the 3D view sits in.
const BLUE: Rgb = [0x39 / 255, 0x87 / 255, 0xe5 / 255];
const RED: Rgb = [0xe6 / 255, 0x67 / 255, 0x67 / 255];
const MID: Rgb = [0.56, 0.56, 0.55];
const SEQ_LO: Rgb = [0x25 / 255, 0x46 / 255, 0x6f / 255];
const SEQ_HI: Rgb = [0x9c / 255, 0xc8 / 255, 0xff / 255];
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** A metric's colour at t ([-1, 1] diverging: blue below the midpoint, red above; [0, 1] sequential). */
export function metricColour(t: number, diverging: boolean): Rgb {
  if (diverging) return t < 0 ? mix(MID, BLUE, Math.min(1, -t)) : mix(MID, RED, Math.min(1, t));
  return mix(SEQ_LO, SEQ_HI, Math.max(0, Math.min(1, t)));
}

/** The legend's ramp as CSS stops. */
export function legendStops(diverging: boolean): string {
  const css = (c: Rgb) => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
  return diverging ? `${css(BLUE)}, ${css(MID)}, ${css(RED)}` : `${css(SEQ_LO)}, ${css(SEQ_HI)}`;
}

export const NO_DATA_CSS = 'rgb(77,79,84)';

function plateRgb(r: ViewResult, metric: PlateMetric): Float32Array | null {
  const c = r.colours;
  if (!c) return null;
  const out = new Float32Array(c.t.length * 3).fill(NaN);
  const div = c.diverging || metric === 'diff';
  for (let i = 0; i < c.t.length; i++) {
    if (!Number.isFinite(c.t[i])) continue;
    out.set(metricColour(c.t[i], div), i * 3);
  }
  return out;
}

/** A result's colour on the marks, as the hit card names it (the single-match view's outcome colours). */
export const RESULT_COLOURS: Rgb[] = [OUTCOME_COLOURS.hit, OUTCOME_COLOURS.nodamage, OUTCOME_COLOURS.damage, OUTCOME_COLOURS.critical, OUTCOME_COLOURS.kill];
const EFFECT_ON: Rgb = [0xfa / 255, 0xb2 / 255, 0x19 / 255];
const EFFECT_OFF: Rgb = [0.4, 0.42, 0.45];
const OUTCOME_OF = ['hit', 'nodamage', 'damage', 'critical', 'kill'] as const;

function drawnMarks(r: ViewResult, by: 'result' | Effect): Mark[] {
  const m = r.marks;
  let most = 0;
  for (let k = 0; k < m.n; k++) if (m.calibre[k] > most) most = m.calibre[k];
  const out: Mark[] = new Array(m.n);
  for (let k = 0; k < m.n; k++) {
    const res = m.result[k];
    const hit = { id: m.index[k], outcome: OUTCOME_OF[res] ?? 'hit', killingShot: (m.effects[k] & EFFECT_BIT.killingShot) !== 0, damage: null, exit: null, dir: null, local: null } as unknown as VehicleHit;
    const colour = by === 'result' ? RESULT_COLOURS[res] : m.effects[k] & EFFECT_BIT[by] ? EFFECT_ON : EFFECT_OFF;
    const scale = most > 0 && m.calibre[k] > 0 ? 0.55 + 0.9 * Math.sqrt(m.calibre[k] / most) : 0.7;
    out[k] = { hit, p: [m.point[k * 3], m.point[k * 3 + 1], m.point[k * 3 + 2]], n: [m.normal[k * 3], m.normal[k * 3 + 1], m.normal[k * 3 + 2]], colour, scale };
  }
  return out;
}

/** A hit's whole record, for its card. */
export async function showHit(index: number): Promise<void> {
  const d = await ask<HitDetail | null>({ type: 'hit', index, platesKey: useHitMass.getState().platesKey });
  useHitMass.getState().set({ detail: d });
}

/** The picked file a hit came from (to open its match at its moment). */
export function fileOfHit(d: HitDetail): File | null {
  return loaded[d.match.file] ?? null;
}

export const RESULT_CODES = { R_NONPEN, R_PEN, R_CRIT, R_KILL };
