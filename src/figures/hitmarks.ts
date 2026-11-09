/**
 * The shots that struck a unit, in box replay: the mark each one left on it,
 * like battle damage, from the moment of the hit for as long as the unit is
 * there (or a set time, then fading). Each mark lies on the figure's surface
 * at the point the data gives, turned to the surface, sized by the shell's
 * calibre where the data says, and looks like what the hit did:
 *
 *   hole     it got through (penetration, critical, killing shot): a dark
 *            hole in a scorched ring
 *   splash   it did not (non-penetration): a bright splash of bare metal
 *   gouge    it did not, and struck at a glancing angle (more than 70
 *            degrees off the surface's normal): a long gouge along the shot,
 *            most likely a ricochet - the data does not tell one apart
 *   bullet   the data does not say what it did (aircraft, ships; in a War
 *            Thunder client replay every unit's hits but the recording
 *            player's own): a bullet or cannon hole
 *   scorch   an explosive round (HE, HEAT, HESH; War Thunder's `ammoType`),
 *            whatever it did: a dark soot star round a lighter centre,
 *            blackened in the middle where it got through
 *
 * A thin ring round each in the hit analysis' outcome colour
 * (`vehicle/scene.ts`), so this view and the Vehicles tab agree; the killing
 * shot's larger. Optionally a floating marker above the fresh hits as well,
 * facing the eye.
 *
 * Where it hit: the point the data gives in the unit's frame (forward, up,
 * right; metres), put onto the figure by a worker (`snap.ts`,
 * `markWorker.ts`) where the shot's line through it first meets the figure
 * (else its nearest surface): on the turret as it stood at the hit, the mark
 * turns with the turret after. The ground units' points are first brought
 * to the figures' scale, found from the battle's own shots (`fitScale`).
 *
 * Built on the CPU into the scene's triangles (both backends draw them), for
 * the hits in the time window only, at most `MAX_MARKS` a frame, newest
 * first; nothing is allocated per frame. The marks are worked out a few
 * milliseconds a frame (`hitMarksStep`) and put onto the figures in a
 * worker, so no frame waits for either. The marks drawn are kept (`drawn`)
 * for the pointer to find one and say whose it was.
 */

import type { VertexBuffer } from '../race/geometry';
import type { Dataset } from '../state/types';
import { drain, explosiveAmmo, hitsOfSteps, OUTCOMES, type HitSet, type VehicleHit } from '../vehicle/hits';
import { placesOf, placesSteps, type HitPlaces } from '../vehicle/places';
import { figureOfVehicle, OUTCOME_COLOURS, templateOfFigure } from '../vehicle/scene';
import { turretOf, type TurretBox } from './turret';
import { fitScale, snapToFigure, SNAP_STRIDE } from './snap';
import { aimOf, aimSteps, type AimNow } from './aim';
import { matchIndexSteps } from './match';
import { bodyOf, FireBody } from '../data/fires';
import type { FirePose } from './fires';

/** Marks drawn a frame at most: the nearest units' first, the newest of each first. */
export const MAX_MARKS = 1500;
/** A floating marker's radius on the figure, m, and its least on screen, px. */
export const MARK_M = 0.16;
export const MARK_MIN_PX = 3.5;
/** A mark on the surface: its hole's least radius on screen, px. */
export const DECAL_MIN_PX = 1.2;
/** Marks a frame may draw more than the last, from the frame they are ready. */
const RAMP = 100;
/** Below this many pixels a mark's hole is not drawn. */
const FAR_PX = 0.2;
/** Seconds a floating marker stays over a fresh hit. */
export const FLOAT_S = 10;
/** The killing shot's mark, times an ordinary one. */
const KILL_SIZE = 1.4;
/** Seconds a fresh floating marker is drawn larger, to catch the eye. */
const POP_S = 0.3;
/** The share of its time a mark spends fading out at the end. */
const FADE = 0.3;
/** Outcomes up to this index in `OUTCOMES` got through (kill .. damage): an explosive round's blast has a hole. */
const HOLE_OUTCOMES = OUTCOMES.indexOf('damage');
/** A shot this far off the surface's normal or more glances off (cosine of 70 degrees). */
const GLANCING = 0.34;

/** What a mark looks like (see the top). */
export const Look = { Hole: 0, Splash: 1, Gouge: 2, Bullet: 3, Scorch: 4 } as const;
export type Look = (typeof Look)[keyof typeof Look];

export interface HitMarks {
  count: number;
  /** Sorted by time. */
  time: Float64Array;
  /** The unit hit: its track. */
  person: Int32Array;
  /** The round it was in (`Dataset.sessionId`), -1 for none. */
  session: Int32Array;
  /** The point (forward, up, right; m): on the hull, or on the turret as it stands at rest once snapped. */
  local: Float32Array;
  /** The surface's normal there, same frame; NaN until put onto the figure. */
  normal: Float32Array;
  /** The way the shot travelled, same frame (unit); NaN where not known. */
  dir: Float32Array;
  /** The shell's calibre, mm; NaN where not known. */
  calibre: Float32Array;
  /** Index into `OUTCOMES`. */
  outcome: Uint8Array;
  /** 1: an explosive round (`explosiveAmmo`). */
  explosive: Uint8Array;
  /** 1: the killing shot. */
  kill: Uint8Array;
  body: Uint8Array;
  /** What the mark looks like (`Look`), set once it is on the figure. */
  look: Uint8Array;
  /** On the turret: its pivot's x and z and its rest yaw; NaN for a point on the hull. */
  turret: Float32Array;
  /** The turret's yaw at the hit, radians; NaN where there is none. */
  yawHit: Float32Array;
  /** The hit, an index into `hitsOf(d).hits`. */
  hit: Int32Array;
  /** The unit's row at the hit, -1 for none found. */
  row: Int32Array;
  /** The vehicle hit, an index into `vehicles`. */
  vehicle: Int32Array;
  /** Per vehicle hit: its figure, its marks, whether they are on the figure yet and whether that was asked for. */
  vehicles: { figure: string; marks: number[]; done: boolean; asked: boolean }[];
  /** The units hit, and each one's marks in time order (`marks` from `start[i]` to `start[i + 1]`). */
  persons: Int32Array;
  start: Int32Array;
  marks: Int32Array;
  /** Per unit hit: its marks' largest hole (m), to leave a unit out whose marks would all be below a pixel. */
  largest: Float32Array;
  /** The ground units' points times this are in the figures' metres (`fitScale`); NaN until found, and whether that was asked for. */
  scale: number;
  scaleAsked: boolean;
}

function empty(n: number): HitMarks {
  return {
    count: n,
    time: new Float64Array(n),
    person: new Int32Array(n),
    session: new Int32Array(n),
    local: new Float32Array(n * 3),
    normal: new Float32Array(n * 3).fill(NaN),
    dir: new Float32Array(n * 3).fill(NaN),
    calibre: new Float32Array(n).fill(NaN),
    outcome: new Uint8Array(n),
    explosive: new Uint8Array(n),
    kill: new Uint8Array(n),
    body: new Uint8Array(n),
    look: new Uint8Array(n),
    turret: new Float32Array(n * 3).fill(NaN),
    yawHit: new Float32Array(n).fill(NaN),
    hit: new Int32Array(n),
    row: new Int32Array(n),
    vehicle: new Int32Array(n),
    vehicles: [],
    persons: new Int32Array(0),
    start: new Int32Array(1),
    marks: new Int32Array(0),
    largest: new Float32Array(0),
    scale: NaN,
    scaleAsked: false,
  };
}

const NONE = empty(0);

/** The working out's steps so far: how many, the longest (ms) and which it was - for the frame time check. */
export const stepStats = { steps: 0, longest: 0, at: 0 };

const cache = new WeakMap<Dataset, HitMarks>();
const jobs = new WeakMap<Dataset, Generator<void, HitMarks, void>>();

/** The hit marks of a dataset (`HitMarks`), worked out once: all at once (tests, tools). */
export function hitMarksOf(d: Dataset): HitMarks {
  return hitMarksStep(d, Infinity)!;
}

/**
 * The hit marks of a dataset once they are worked out, else null: each call
 * goes on with the work for about `budgetMs` (the hits, their places, the
 * marks: `marksSteps`), so a frame that asks is not held up by it.
 */
export function hitMarksStep(d: Dataset, budgetMs: number): HitMarks | null {
  const done = cache.get(d);
  if (done) return done;
  let g = jobs.get(d);
  if (!g) {
    g = marksSteps(d);
    jobs.set(d, g);
  }
  const end = performance.now() + budgetMs;
  for (;;) {
    const s0 = performance.now();
    const r = g.next();
    const ms = performance.now() - s0;
    stepStats.steps++;
    if (ms > stepStats.longest) {
      stepStats.longest = ms;
      stepStats.at = stepStats.steps;
    }
    if (r.done) {
      cache.set(d, r.value);
      jobs.delete(d);
      // Every vehicle's marks put onto its figure in the worker now, before they are drawn.
      if (markWorker()) for (let v = 0; v < r.value.vehicles.length; v++) placeOnFigure(r.value, v);
      return r.value;
    }
    if (performance.now() >= end) return null;
  }
}

/** The marks of a dataset in steps: every hit with a point whose unit's track is found. */
export function* marksSteps(d: Dataset): Generator<void, HitMarks, void> {
  const set = yield* hitsOfSteps(d);
  if (!set.hits.length) return NONE;
  const places = yield* placesSteps(d, set);
  yield;
  // The turrets' aim, worked out once for the dataset, in steps of its own.
  yield* aimSteps(d);
  yield;
  // The catalogue's names, for each vehicle's figure below.
  yield* matchIndexSteps();
  yield;
  return yield* marksFromSteps(d, set, places);
}

/** The marks of a hit set (`marksSteps` without the steps). */
export function marksFrom(d: Dataset, set: HitSet): HitMarks {
  return drain(marksFromSteps(d, set, placesOf(d, set)));
}

function* marksFromSteps(d: Dataset, set: HitSet, places: HitPlaces): Generator<void, HitMarks, void> {
  const keep: { h: VehicleHit; person: number; row: number }[] = [];
  let sorted = true;
  let step = 0;
  for (const h of set.hits) {
    if (++step % 4096 === 0) yield;
    if (h.kind !== 'hit' || !h.local) continue;
    const row = places.rows[h.id * 2] ?? -1;
    const person = h.victimPerson >= 0 ? h.victimPerson : row >= 0 && d.personId ? d.personId[row] : -1;
    if (person < 0) continue;
    if (keep.length && keep[keep.length - 1].h.time > h.time) sorted = false;
    keep.push({ h, person, row: h.side === 'victim' ? h.row : row });
  }
  if (!keep.length) return NONE;
  // In time order already where the rows are (most data): a sort of many hits is too long for one step.
  if (!sorted) keep.sort((a, b) => a.h.time - b.h.time);
  yield;
  const aim = aimOf(d);
  const now: AimNow = { yaw: NaN, pitch: NaN };
  const out = empty(keep.length);
  const index = new Map<string, number>();
  for (let k = 0; k < keep.length; k++) {
    if (k % 1024 === 1023) yield;
    const { h, person, row } = keep[k];
    out.time[k] = h.time;
    out.person[k] = person;
    out.session[k] = d.sessionId && h.row >= 0 && h.row < d.count ? d.sessionId[h.row] : -1;
    out.outcome[k] = OUTCOMES.indexOf(h.outcome);
    out.kill[k] = h.killingShot ? 1 : 0;
    out.hit[k] = h.id;
    out.row[k] = row;
    if (h.calibre !== null) out.calibre[k] = h.calibre;
    out.explosive[k] = explosiveAmmo(h.ammoType) ? 1 : 0;
    const info = set.vehicles.get(h.vehicle);
    out.body[k] = bodyOf(info?.kind || h.vehicle);
    out.look[k] = lookOf(OUTCOMES[out.outcome[k]], NaN, out.explosive[k] === 1);
    if (aim && row >= 0 && out.body[k] === FireBody.Ground) out.yawHit[k] = aim.at(row, h.time, now).yaw;
    let v = index.get(h.vehicle);
    if (v === undefined) {
      v = out.vehicles.length;
      index.set(h.vehicle, v);
      out.vehicles.push({ figure: figureOfVehicle(info ?? { id: h.vehicle, name: '', kind: '' }), marks: [], done: false, asked: false });
      // Finding a vehicle's figure goes through the catalogue's names: a step of its own.
      yield;
    }
    out.vehicle[k] = v;
    out.vehicles[v].marks.push(k);
    out.local.set(h.local!, k * 3);
    if (h.dir) out.dir.set(h.dir, k * 3);
  }
  yield;
  yield* indexSteps(out);
  return out;
}

/** The marks by the unit hit (`HitMarks.persons`, `start`, `marks`, `largest`), in time order within each. */
export function indexByUnit(m: HitMarks): void {
  drain(indexSteps(m));
}

/** `indexByUnit` in steps of a few thousand marks. */
function* indexSteps(m: HitMarks): Generator<void, void, void> {
  const slot = new Map<number, number>();
  for (let k = 0; k < m.count; k++) {
    if (k % 8192 === 8191) yield;
    if (!slot.has(m.person[k])) slot.set(m.person[k], slot.size);
  }
  m.persons = Int32Array.from(slot.keys());
  m.start = new Int32Array(slot.size + 1);
  m.largest = new Float32Array(slot.size);
  for (let k = 0; k < m.count; k++) {
    if (k % 8192 === 8191) yield;
    const i = slot.get(m.person[k])!;
    m.start[i + 1]++;
    m.largest[i] = Math.max(m.largest[i], holeRadius(m.calibre[k], m.body[k]) * (m.kill[k] ? KILL_SIZE : 1));
  }
  for (let i = 0; i < slot.size; i++) m.start[i + 1] += m.start[i];
  const fill = m.start.slice(0, slot.size);
  m.marks = new Int32Array(m.count);
  for (let k = 0; k < m.count; k++) {
    if (k % 8192 === 8191) yield;
    m.marks[fill[slot.get(m.person[k])!]++] = k;
  }
}

/**
 * What a mark looks like by what the hit did and how square the shot struck
 * (|cos| to the normal; NaN unknown); an explosive round's is its blast, whatever it did.
 */
export function lookOf(outcome: string | undefined, square: number, explosive = false): Look {
  if (explosive) return Look.Scorch;
  switch (outcome) {
    case 'kill':
    case 'module':
    case 'critical':
    case 'severe':
    case 'damage':
      return Look.Hole;
    case 'nodamage':
      return Number.isFinite(square) && square < GLANCING ? Look.Gouge : Look.Splash;
    default:
      return Look.Bullet;
  }
}

/**
 * The worker that puts the marks onto the figures (`markWorker.ts`): a
 * figure takes up to a hundred milliseconds to build, too long for a frame.
 * Without workers (tests, tools) it is done where it is asked for.
 */
let worker: Worker | null | undefined;
/** The requests out: by id, which marks they are for. */
const pending = new Map<number, { m: HitMarks; v: number }>();
let nextId = 1;

interface Placed {
  id: number;
  box: TurretBox | null;
  snapped: Float32Array | null;
  /** The answer to a scale's fit (`askScale`) instead. */
  scale?: number;
}

function markWorker(): Worker | null {
  if (worker === undefined) {
    try {
      worker = typeof Worker === 'undefined' ? null : new Worker(new URL('./markWorker.ts', import.meta.url), { type: 'module' });
      worker?.addEventListener('message', (e: MessageEvent<Placed>) => {
        const job = pending.get(e.data.id);
        if (!job) return;
        pending.delete(e.data.id);
        if (e.data.scale !== undefined) {
          job.m.scale = e.data.scale;
          // Every vehicle's marks onto its figure now, at that scale.
          for (let v = 0; v < job.m.vehicles.length; v++) placeOnFigure(job.m, v);
          return;
        }
        applyPlaced(job.m, job.v, e.data.box, e.data.snapped);
      });
    } catch {
      worker = null;
    }
  }
  return worker;
}

/** Ground hits a scale's fit looks at, at most, from the vehicles hit most. */
const FIT_HITS = 400;

/** The vehicles a scale's fit looks at (`fitScale`): the ground ones hit most, with their shots' points and ways. */
function fitRequest(m: HitMarks): { figure: string; pts: Float32Array; dir: Float32Array }[] {
  const order = m.vehicles
    .map((x, v) => ({ v, n: x.marks.filter((k) => m.body[k] === FireBody.Ground && Number.isFinite(m.dir[k * 3])).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const out: { figure: string; pts: Float32Array; dir: Float32Array }[] = [];
  let taken = 0;
  for (const { v } of order) {
    if (taken >= FIT_HITS) break;
    const list = m.vehicles[v].marks.filter((k) => m.body[k] === FireBody.Ground && Number.isFinite(m.dir[k * 3])).slice(0, FIT_HITS - taken);
    taken += list.length;
    out.push({ figure: m.vehicles[v].figure, pts: Float32Array.from(list.flatMap((k) => [m.local[k * 3], m.local[k * 3 + 1], m.local[k * 3 + 2]])), dir: Float32Array.from(list.flatMap((k) => [m.dir[k * 3], m.dir[k * 3 + 1], m.dir[k * 3 + 2]])) });
  }
  return out;
}

/** The points, turret yaws and shot ways of a vehicle's marks, for the snap. */
function request(m: HitMarks, v: number): { pts: Float32Array; yaw: Float32Array; dir: Float32Array } {
  const list = m.vehicles[v].marks;
  const pts = new Float32Array(list.length * 3);
  const yaw = new Float32Array(list.length);
  const dir = new Float32Array(list.length * 3);
  for (let i = 0; i < list.length; i++) {
    const k = list[i];
    for (let a = 0; a < 3; a++) {
      pts[i * 3 + a] = m.local[k * 3 + a];
      dir[i * 3 + a] = m.dir[k * 3 + a];
    }
    yaw[i] = m.yawHit[k];
  }
  return { pts, yaw, dir };
}

/**
 * Puts a vehicle's marks onto its figure: in the worker (true once they are
 * there), or here where there is none.
 */
export function placeOnFigure(m: HitMarks, v: number): boolean {
  const veh = m.vehicles[v];
  if (veh.done) return true;
  const w = markWorker();
  if (w) {
    // The scale first (the worker answers it before any vehicle), then each vehicle at it.
    if (!Number.isFinite(m.scale)) {
      if (!m.scaleAsked) {
        m.scaleAsked = true;
        const id = nextId++;
        pending.set(id, { m, v: -1 });
        w.postMessage({ id, fit: fitRequest(m) });
      }
      return false;
    }
    if (!veh.asked) {
      veh.asked = true;
      const id = nextId++;
      pending.set(id, { m, v });
      const r = request(m, v);
      const scale = scaleOf(m, v);
      w.postMessage({ id, figure: veh.figure, ...r, scale }, [r.pts.buffer, r.yaw.buffer, r.dir.buffer]);
    }
    return false;
  }
  if (!Number.isFinite(m.scale)) {
    const fit = fitRequest(m).flatMap((f) => {
      const t = templateOfFigure(f.figure);
      return t ? [{ t, pts: f.pts, dir: f.dir }] : [];
    });
    m.scale = fitScale(fit);
  }
  const t = templateOfFigure(veh.figure);
  const r = request(m, v);
  applyPlaced(m, v, t ? turretOf(t) : null, t ? snapToFigure(t, r.pts, r.yaw, r.dir, scaleOf(m, v)) : null);
  return true;
}

/** The scale a vehicle's points take: the battle's for a ground unit's, else as they are. */
function scaleOf(m: HitMarks, v: number): number {
  const k = m.vehicles[v].marks[0];
  return k !== undefined && m.body[k] === FireBody.Ground && Number.isFinite(m.scale) ? m.scale : 1;
}

/** A vehicle's marks as snapped (`snapToFigure`): the point, the normal, the turret, the look. */
function applyPlaced(m: HitMarks, v: number, box: TurretBox | null, snapped: Float32Array | null): void {
  const veh = m.vehicles[v];
  veh.done = true;
  const scale = scaleOf(m, v);
  veh.marks.forEach((k, i) => {
    const o = i * SNAP_STRIDE;
    if (!snapped || !Number.isFinite(snapped[o])) {
      // No figure to put it on: where the data says (at the battle's scale), facing up.
      for (let a = 0; a < 3; a++) m.local[k * 3 + a] *= scale;
      m.normal[k * 3 + 1] = 1;
      m.normal[k * 3] = m.normal[k * 3 + 2] = 0;
      return;
    }
    m.local.set(snapped.subarray(o, o + 3), k * 3);
    m.normal.set(snapped.subarray(o + 3, o + 6), k * 3);
    if (snapped[o + 6] === 1 && box) {
      m.turret[k * 3] = box.px;
      m.turret[k * 3 + 1] = box.pz;
      m.turret[k * 3 + 2] = box.rest;
      // The way the shot went, into the turret's frame at rest too.
      const a = -(m.yawHit[k] - box.rest);
      const c = Math.cos(a), s = Math.sin(a);
      const dx = m.dir[k * 3], dz = m.dir[k * 3 + 2];
      m.dir[k * 3] = dx * c - dz * s;
      m.dir[k * 3 + 2] = dx * s + dz * c;
    }
    const sq = Math.abs(m.dir[k * 3] * snapped[o + 3] + m.dir[k * 3 + 1] * snapped[o + 4] + m.dir[k * 3 + 2] * snapped[o + 5]);
    m.look[k] = lookOf(OUTCOMES[m.outcome[k]], sq, m.explosive[k] === 1);
  });
}

/** The unit's pose for a mark, as the fires take it, and the row it is at now (for its turret). */
export interface MarkPose extends FirePose {
  row: number;
}

export interface MarkView {
  t: number;
  /** Seconds a mark stays; Infinity: as long as the unit is there. */
  seconds: number;
  /** A floating marker over each hit of the last `FLOAT_S` seconds too. */
  float: boolean;
  /** The round shown, -1 all. */
  session: number;
  eye: ArrayLike<number>;
  pixelSize: (x: number, y: number, z: number) => number;
  /** Data units in a metre. */
  units: number;
  poseOf: (person: number, body: FireBody, out: MarkPose) => boolean;
  /** The dataset, for the turret's yaw now. */
  dataset: Dataset;
}

/** The last index whose time is at or before `t`, -1 for none. */
export function lastAtOrBefore(time: Float64Array, n: number, t: number): number {
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (time[mid] <= t) lo = mid + 1;
    else hi = mid;
  }
  return lo - 1;
}

/** A mark's hole radius on the figure, m: half the calibre, a little more; a typical one where it is not known. */
export function holeRadius(calibre: number, body: number): number {
  if (Number.isFinite(calibre) && calibre > 0) return Math.min(0.2, Math.max(0.006, (calibre / 2000) * 1.3));
  return body === FireBody.Air ? 0.012 : body === FireBody.Ship ? 0.08 : 0.045;
}

/** A disc's corners round, unit circle. */
const RING = Array.from({ length: 9 }, (_, i) => [Math.cos((i * Math.PI) / 4), Math.sin((i * Math.PI) / 4)]);
const OUTLINE: [number, number, number] = [0.03, 0.03, 0.05];
const WHITE: [number, number, number] = [1.6, 1.6, 1.6];
const BLACK: [number, number, number] = [0.02, 0.02, 0.02];
const SCORCH: [number, number, number] = [0.11, 0.09, 0.07];
const METAL: [number, number, number] = [0.85, 0.85, 0.8];
const DENT: [number, number, number] = [0.42, 0.42, 0.4];
const RIM: [number, number, number] = [0.55, 0.55, 0.53];
/** An explosive round's blast: soot, and the lighter, burnt-off centre. */
const SOOT: [number, number, number] = [0.05, 0.045, 0.04];
const ASH: [number, number, number] = [0.36, 0.32, 0.27];
/** The soot star's corners: eight points out, eight in between, round the unit circle. */
const STAR = Array.from({ length: 17 }, (_, i) => {
  const a = (i * Math.PI) / 8;
  const r = i % 2 ? 0.45 : 1;
  return [Math.cos(a) * r, Math.sin(a) * r];
});

export class HitMarkLayer {
  private readonly pose: MarkPose = { x: 0, y: 0, z: 0, f: [1, 0, 0], u: [0, 1, 0], scale: 1, row: -1 };
  private readonly aimNow: AimNow = { yaw: NaN, pitch: NaN };
  /** The marks drawn last frame: where (data space) and which hit, for the pointer. */
  readonly drawn = { xyz: new Float32Array(MAX_MARKS * 3), hit: new Int32Array(MAX_MARKS), radius: new Float32Array(MAX_MARKS), count: 0 };
  // The frame's scratch: the mark's centre and the two ways across it (on the surface, or facing the eye).
  private cx = 0;
  private cy = 0;
  private cz = 0;
  private bx = 1;
  private by = 0;
  private bz = 0;
  private ux = 0;
  private uy = 1;
  private uz = 0;
  /** Out of the surface (or towards the eye), unit: each layer of a mark a little nearer than the one under it. */
  private ex = 0;
  private ey = 0;
  private ez = 0;
  private out: VertexBuffer | null = null;

  /** Per unit hit, this frame: its pose (x y z, forward, up, scale, row, turret yaw now) and distance from the eye. */
  private poses = new Float64Array(0);
  private dist = new Float64Array(0);
  private order = new Int32Array(0);
  private readonly byDist = (i: number, j: number) => this.dist[i] - this.dist[j];
  /** The marks these frames drew from, and how many a frame may draw now (`RAMP` more each frame up to `MAX_MARKS`). */
  private last: HitMarks | null = null;
  private cap = 0;

  /**
   * Appends the marks of the hits in the window ending at `v.t` to `out`:
   * each unit hit posed once, those whose marks would all be below a pixel
   * left out, then the nearest units' marks first, the newest of each first,
   * up to `MAX_MARKS`. Returns how many were drawn.
   */
  build(m: HitMarks, v: MarkView, out: VertexBuffer): number {
    this.drawn.count = 0;
    if (!m.count) return 0;
    this.out = out;
    // Newly ready marks come in over a few frames, so the first frame with them is not the one that grows the buffers.
    if (m !== this.last) {
      this.last = m;
      this.cap = RAMP;
    } else this.cap = Math.min(MAX_MARKS, this.cap + RAMP);
    const cap = this.cap;
    const aim = aimOf(v.dataset);
    const n = m.persons.length;
    if (this.dist.length < n) {
      this.poses = new Float64Array(n * 12);
      this.dist = new Float64Array(n);
      this.order = new Int32Array(n);
    }
    const p = this.pose;
    let shown = 0;
    for (let i = 0; i < n; i++) {
      const first = m.marks[m.start[i]];
      if (m.time[first] > v.t) continue;
      // Its marks not on its figure yet (the worker is at it), and no floating marker wanted: nothing to draw.
      if (!v.float && !m.vehicles[m.vehicle[first]].done && !placeOnFigure(m, m.vehicle[first])) continue;
      p.scale = 1;
      p.row = -1;
      if (!v.poseOf(m.persons[i], m.body[first] as FireBody, p)) continue;
      const scale = v.units * (p.scale > 0 ? p.scale : 1);
      const ps = v.pixelSize(p.x, p.y, p.z);
      // Every mark of it below a fifth of a pixel, and no floating marker wanted: nothing to see.
      if (!v.float && m.largest[i] * scale < FAR_PX * ps) continue;
      const o = i * 12;
      const q = this.poses;
      q[o] = p.x;
      q[o + 1] = p.y;
      q[o + 2] = p.z;
      q[o + 3] = p.f[0];
      q[o + 4] = p.f[1];
      q[o + 5] = p.f[2];
      q[o + 6] = p.u[0];
      q[o + 7] = p.u[1];
      q[o + 8] = p.u[2];
      q[o + 9] = p.scale;
      q[o + 10] = p.row;
      this.poses[o + 11] = aim && p.row >= 0 ? aim.at(p.row, v.t, this.aimNow).yaw : NaN;
      this.dist[i] = Math.hypot(p.x - v.eye[0], p.y - v.eye[1], p.z - v.eye[2]);
      this.order[shown++] = i;
    }
    const order = this.order.subarray(0, shown);
    order.sort(this.byDist);
    const from = v.t - v.seconds;
    for (let j = 0; j < shown && this.drawn.count < cap; j++) {
      const i = order[j];
      const o = i * 12;
      p.x = this.poses[o];
      p.y = this.poses[o + 1];
      p.z = this.poses[o + 2];
      p.f[0] = this.poses[o + 3];
      p.f[1] = this.poses[o + 4];
      p.f[2] = this.poses[o + 5];
      p.u[0] = this.poses[o + 6];
      p.u[1] = this.poses[o + 7];
      p.u[2] = this.poses[o + 8];
      p.scale = this.poses[o + 9];
      p.row = this.poses[o + 10];
      const yawNow = this.poses[o + 11];
      // Its marks newest first, back to the window's start.
      const a = m.start[i], b = m.start[i + 1];
      let lo = a, hi = b;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (m.time[m.marks[mid]] <= v.t) lo = mid + 1;
        else hi = mid;
      }
      for (let q = lo - 1; q >= a && this.drawn.count < cap; q--) {
        const k = m.marks[q];
        if (m.time[k] < from) break;
        if (v.session >= 0 && m.session[k] >= 0 && m.session[k] !== v.session) continue;
        // A mark is drawn once it is on the figure; until then only its floating marker.
        const placed = m.vehicles[m.vehicle[k]].done || placeOnFigure(m, m.vehicle[k]);
        this.one(m, k, v, yawNow, placed);
      }
    }
    return this.drawn.count;
  }

  /** One mark, on the unit posed in `this.pose`, its turret at `yawNow` (NaN: as at the hit). */
  private one(m: HitMarks, k: number, v: MarkView, yawNow: number, placed: boolean): void {
    const p = this.pose;
    const age = v.t - m.time[k];
    const float = v.float && age <= FLOAT_S;
    if (!placed && !float) return;
    let a = m.local[k * 3];
    const b = m.local[k * 3 + 1];
    let c = m.local[k * 3 + 2];
    let na = m.normal[k * 3], nc = m.normal[k * 3 + 2];
    let da = m.dir[k * 3], dc = m.dir[k * 3 + 2];
    const tx = m.turret[k * 3];
    if (Number.isFinite(tx) && Number.isFinite(yawNow)) {
      // Turned as the turret stands now: the point, the surface and the shot's way.
      const tz = m.turret[k * 3 + 1];
      const r = yawNow - m.turret[k * 3 + 2];
      const co = Math.cos(r), si = Math.sin(r);
      const rx = a - tx, rz = c - tz;
      a = tx + rx * co - rz * si;
      c = tz + rx * si + rz * co;
      const n0 = na, d0 = da;
      na = n0 * co - nc * si;
      nc = n0 * si + nc * co;
      da = d0 * co - dc * si;
      dc = d0 * si + dc * co;
    }
    const scale = v.units * (p.scale > 0 ? p.scale : 1);
    // Right = forward x up (`figures/kit.ts` poseFrame).
    const fx = p.f[0], fy = p.f[1], fz = p.f[2];
    const ux = p.u[0], uy = p.u[1], uz = p.u[2];
    const rx = fy * uz - fz * uy, ry = fz * ux - fx * uz, rz = fx * uy - fy * ux;
    const x = p.x + (fx * a + ux * b + rx * c) * scale;
    const y = p.y + (fy * a + uy * b + ry * c) * scale;
    const z = p.z + (fz * a + uz * b + rz * c) * scale;
    const ps = v.pixelSize(x, y, z);
    const fadeFrom = v.seconds * (1 - FADE);
    const alpha = Number.isFinite(v.seconds) && age > fadeFrom ? Math.max(0, 1 - (age - fadeFrom) / (v.seconds * FADE)) : 1;
    if (alpha <= 0.02) return;
    const kill = m.kill[k] === 1;
    const col = OUTCOME_COLOURS[OUTCOMES[m.outcome[k]] ?? 'hit'];
    let shown = 0;
    this.cx = x;
    this.cy = y;
    this.cz = z;
    // Far off, where its hole would be a fraction of a pixel, a mark is left out: noise, and a cost for nothing.
    const hole = holeRadius(m.calibre[k], m.body[k]) * scale * (kill ? KILL_SIZE : 1);
    if (placed && hole >= FAR_PX * ps) {
      const nb = m.normal[k * 3 + 1], db = m.dir[k * 3 + 1];
      const nx = fx * na + ux * nb + rx * nc, ny = fy * na + uy * nb + ry * nc, nz = fz * na + uz * nb + rz * nc;
      const sx = fx * da + ux * db + rx * dc, sy = fy * da + uy * db + ry * dc, sz = fz * da + uz * db + rz * dc;
      shown = this.decal(m.look[k] as Look, x, y, z, nx, ny, nz, sx, sy, sz, hole, ps, col, kill, alpha, m.outcome[k] <= HOLE_OUTCOMES);
    }
    if (float) shown = Math.max(shown, this.marker(x, y, z, v, scale, ps, age, kill, col, alpha));
    if (shown <= 0) return;
    const i = this.drawn.count++;
    this.drawn.xyz[i * 3] = this.cx;
    this.drawn.xyz[i * 3 + 1] = this.cy;
    this.drawn.xyz[i * 3 + 2] = this.cz;
    this.drawn.hit[i] = m.hit[k];
    this.drawn.radius[i] = shown;
  }

  /**
   * The mark on the surface at x y z, normal n, the shot's way s (NaN: not
   * known): its look's layers, each a little off the surface, in the plane
   * across the normal (the gouge long along the shot). Returns its radius.
   */
  private decal(look: Look, x: number, y: number, z: number, nx: number, ny: number, nz: number, sx: number, sy: number, sz: number, hole: number, ps: number, col: readonly number[], kill: boolean, alpha: number, through: boolean): number {
    const r = Math.max(hole, DECAL_MIN_PX * ps);
    // Across the surface: along the shot where it is known, else any way.
    let tx = sx - nx * (sx * nx + sy * ny + sz * nz), ty = sy - ny * (sx * nx + sy * ny + sz * nz), tz = sz - nz * (sx * nx + sy * ny + sz * nz);
    let tl = Math.hypot(tx, ty, tz);
    if (!(tl > 1e-4)) {
      // Level and across the normal, or forward where the normal is upright.
      tx = -nz;
      ty = 0;
      tz = nx;
      tl = Math.hypot(tx, tz);
      if (tl < 1e-4) {
        tx = 1;
        tz = 0;
        tl = 1;
      }
    }
    this.bx = tx / tl;
    this.by = ty / tl;
    this.bz = tz / tl;
    this.ux = ny * this.bz - nz * this.by;
    this.uy = nz * this.bx - nx * this.bz;
    this.uz = nx * this.by - ny * this.bx;
    this.ex = nx;
    this.ey = ny;
    this.ez = nz;
    // Off the surface by a little, more when it is small on screen (the depth buffer's step grows with distance).
    const lift = Math.max(r * 0.15, ps * 0.6);
    this.cx = x + nx * lift;
    this.cy = y + ny * lift;
    this.cz = z + nz * lift;
    const step = Math.max(r * 0.04, ps * 0.15);
    switch (look) {
      case Look.Hole:
        this.ellipse(r * 2.3, r * 2.3, 0, SCORCH, 0.8 * alpha);
        this.ellipse(r, r, step, BLACK, alpha);
        this.ring(r * 2.3, r * (kill ? 3.1 : 2.75), step, kill ? WHITE : col, alpha);
        if (kill) this.ring(r * 3.1, r * 3.6, step, col, alpha);
        return r * (kill ? 3.6 : 2.75);
      case Look.Splash:
        this.ellipse(r * 1.7, r * 1.7, 0, METAL, 0.9 * alpha);
        this.ellipse(r * 0.7, r * 0.7, step, DENT, alpha);
        this.ring(r * 1.7, r * 2.1, step, col, alpha);
        return r * 2.1;
      case Look.Gouge:
        this.ellipse(r * 3.5, r * 0.9, 0, METAL, 0.9 * alpha);
        this.ellipse(r * 2.8, r * 0.35, step, DENT, alpha);
        this.ring(r * 3.5, r * 4.0, step, col, alpha, r * 0.9, r * 1.3);
        return r * 4;
      case Look.Scorch:
        // The blast reaches well past the round's own width; a hole in the middle where it got through.
        this.star(r * 4, 0, SOOT, 0.85 * alpha);
        this.ellipse(r * 1.4, r * 1.4, step, ASH, 0.9 * alpha);
        if (through) this.ellipse(r * 0.6, r * 0.6, step * 2, BLACK, alpha);
        this.ring(r * 4, r * (kill ? 4.7 : 4.4), step, kill ? WHITE : col, alpha);
        if (kill) this.ring(r * 4.7, r * 5.2, step, col, alpha);
        return r * (kill ? 5.2 : 4.4);
      default:
        // Ringed like the others (in the plain hit's colour): a machine-gun round's hole is a pixel or two at play distance.
        this.ellipse(r * 1.5, r * 1.5, 0, RIM, 0.9 * alpha);
        this.ellipse(r, r, step, BLACK, alpha);
        this.ring(r * 1.5, r * 2.1, step, col, alpha);
        return r * 2.1;
    }
  }

  /** The floating marker over a fresh hit, facing the eye and in front of the unit. Returns its radius. */
  private marker(x: number, y: number, z: number, v: MarkView, scale: number, ps: number, age: number, kill: boolean, col: readonly number[], alpha: number): number {
    let rad = Math.max(MARK_M * scale, MARK_MIN_PX * ps) * (kill ? KILL_SIZE : 1);
    if (age < POP_S) rad *= 1 + 0.8 * (1 - age / POP_S);
    alpha *= age > FLOAT_S * (1 - FADE) ? Math.max(0, 1 - (age - FLOAT_S * (1 - FADE)) / (FLOAT_S * FADE)) : 1;
    let dx = v.eye[0] - x, dy = v.eye[1] - y, dz = v.eye[2] - z;
    const dl = Math.hypot(dx, dy, dz) || 1;
    dx /= dl;
    dy /= dl;
    dz /= dl;
    // Right: level, across the line of sight; up: across both.
    const hl = Math.hypot(dx, dz);
    this.bx = hl > 1e-6 ? dz / hl : 1;
    this.by = 0;
    this.bz = hl > 1e-6 ? -dx / hl : 0;
    this.ux = dy * this.bz - dz * this.by;
    this.uy = dz * this.bx - dx * this.bz;
    this.uz = dx * this.by - dy * this.bx;
    this.ex = dx;
    this.ey = dy;
    this.ez = dz;
    // Brought out towards the eye by its size so the hull does not hide its own side's mark.
    this.cx = x + dx * rad;
    this.cy = y + dy * rad;
    this.cz = z + dz * rad;
    const step = rad * 0.08;
    this.ellipse(rad * 1.3, rad * 1.3, 0, OUTLINE, 0.8 * alpha);
    if (kill) {
      this.ellipse(rad * 1.15, rad * 1.15, step, WHITE, alpha);
      this.ellipse(rad * 0.8, rad * 0.8, step * 2, col, alpha);
    } else this.ellipse(rad, rad, step, col, alpha);
    return rad * 1.3;
  }

  /** An ellipse round the centre, `a` along b, `bb` along u, eight triangles, `lift` off it. */
  private ellipse(a: number, bb: number, lift: number, col: readonly number[], alpha: number): void {
    const o = this.out!;
    const r = col[0], g = col[1], b = col[2];
    const x = this.cx + this.ex * lift, y = this.cy + this.ey * lift, z = this.cz + this.ez * lift;
    for (let i = 0; i < 8; i++) {
      const c0 = RING[i], c1 = RING[i + 1];
      o.vertex(x, y, z, r, g, b, alpha);
      o.vertex(x + this.bx * c0[0] * a + this.ux * c0[1] * bb, y + this.by * c0[0] * a + this.uy * c0[1] * bb, z + this.bz * c0[0] * a + this.uz * c0[1] * bb, r, g, b, alpha);
      o.vertex(x + this.bx * c1[0] * a + this.ux * c1[1] * bb, y + this.by * c1[0] * a + this.uy * c1[1] * bb, z + this.bz * c1[0] * a + this.uz * c1[1] * bb, r, g, b, alpha);
    }
  }

  /** The soot star round the centre, its points `a` out, sixteen triangles, `lift` off it. */
  private star(a: number, lift: number, col: readonly number[], alpha: number): void {
    const o = this.out!;
    const r = col[0], g = col[1], b = col[2];
    const x = this.cx + this.ex * lift, y = this.cy + this.ey * lift, z = this.cz + this.ez * lift;
    for (let i = 0; i < 16; i++) {
      const c0 = STAR[i], c1 = STAR[i + 1];
      o.vertex(x, y, z, r, g, b, alpha);
      o.vertex(x + (this.bx * c0[0] + this.ux * c0[1]) * a, y + (this.by * c0[0] + this.uy * c0[1]) * a, z + (this.bz * c0[0] + this.uz * c0[1]) * a, r, g, b, alpha);
      o.vertex(x + (this.bx * c1[0] + this.ux * c1[1]) * a, y + (this.by * c1[0] + this.uy * c1[1]) * a, z + (this.bz * c1[0] + this.uz * c1[1]) * a, r, g, b, alpha);
    }
  }

  /** A ring from `r0` to `r1` (along b; `q0` to `q1` along u, the same where not given), `lift` off the centre. */
  private ring(r0: number, r1: number, lift: number, col: readonly number[], alpha: number, q0 = r0, q1 = r1): void {
    const o = this.out!;
    const r = col[0], g = col[1], b = col[2];
    const x = this.cx + this.ex * lift, y = this.cy + this.ey * lift, z = this.cz + this.ez * lift;
    const at = (c: number[], s: number, q: number, k: 0 | 1 | 2) => (k === 0 ? x + this.bx * c[0] * s + this.ux * c[1] * q : k === 1 ? y + this.by * c[0] * s + this.uy * c[1] * q : z + this.bz * c[0] * s + this.uz * c[1] * q);
    for (let i = 0; i < 8; i++) {
      const c0 = RING[i], c1 = RING[i + 1];
      o.vertex(at(c0, r0, q0, 0), at(c0, r0, q0, 1), at(c0, r0, q0, 2), r, g, b, alpha);
      o.vertex(at(c0, r1, q1, 0), at(c0, r1, q1, 1), at(c0, r1, q1, 2), r, g, b, alpha);
      o.vertex(at(c1, r1, q1, 0), at(c1, r1, q1, 1), at(c1, r1, q1, 2), r, g, b, alpha);
      o.vertex(at(c0, r0, q0, 0), at(c0, r0, q0, 1), at(c0, r0, q0, 2), r, g, b, alpha);
      o.vertex(at(c1, r1, q1, 0), at(c1, r1, q1, 1), at(c1, r1, q1, 2), r, g, b, alpha);
      o.vertex(at(c1, r0, q0, 0), at(c1, r0, q0, 1), at(c1, r0, q0, 2), r, g, b, alpha);
    }
  }
}
