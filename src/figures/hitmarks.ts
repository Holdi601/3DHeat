/**
 * The shots that struck a unit, in box replay: a mark at the point each one
 * hit, on the unit and riding with it, from the moment of the hit for a
 * while (or the whole match) and then fading. Coloured by what the hit did,
 * in the hit analysis' own outcomes and colours (`vehicle/hits.ts`,
 * `vehicle/scene.ts`), so the two views agree; the killing shot is larger and
 * ringed in white.
 *
 * Where it hit: the point the data gives in the unit's frame (forward, up,
 * right; metres). A point on a tank's turret (as high as the figure's turret
 * and within its reach of the pivot) turns with the turret after.
 *
 * Built on the CPU into the scene's triangles (both backends draw them), for
 * the hits in the time window only, at most `MAX_MARKS` a frame, newest
 * first; nothing is allocated per frame. The marks drawn are kept (`drawn`)
 * for the pointer to find one and say whose it was.
 */

import type { VertexBuffer, Vec3 } from '../race/geometry';
import type { Dataset } from '../state/types';
import { hitsOf, OUTCOMES, type HitSet, type VehicleHit } from '../vehicle/hits';
import { placesOf } from '../vehicle/places';
import { figureOfVehicle, OUTCOME_COLOURS, templateOfFigure } from '../vehicle/scene';
import type { Template } from './kit';
import { aimOf, type AimNow } from './aim';
import { bodyOf, FireBody } from '../data/fires';
import type { FirePose } from './fires';

/** Marks drawn a frame at most. */
export const MAX_MARKS = 4096;
/** A mark's radius on the figure, m, and its least on screen, px. */
export const MARK_M = 0.16;
export const MARK_MIN_PX = 3.5;
/** The killing shot's mark, times an ordinary one. */
const KILL_SIZE = 1.7;
/** Seconds a fresh mark is drawn larger, to catch the eye. */
const POP_S = 0.3;
/** The share of its time a mark spends fading out at the end. */
const FADE = 0.3;
/** Metres below the figure's turret, or beyond its reach, a point may lie and still be on the turret. */
const TURRET_MARGIN = 0.3;

export interface HitMarks {
  count: number;
  /** Sorted by time. */
  time: Float64Array;
  /** The unit hit: its track. */
  person: Int32Array;
  /** The round it was in (`Dataset.sessionId`), -1 for none. */
  session: Int32Array;
  /** The point (forward, up, right; m): on the hull, or on the turret as it stands at rest. */
  local: Float32Array;
  /** Index into `OUTCOMES`. */
  outcome: Uint8Array;
  /** 1: the killing shot. */
  kill: Uint8Array;
  body: Uint8Array;
  /** On the turret: its pivot's x and z and its rest yaw; NaN for a point on the hull. */
  turret: Float32Array;
  /** The hit, an index into `hitsOf(d).hits`. */
  hit: Int32Array;
  /** The unit's row at the hit, -1 for none found. */
  row: Int32Array;
  /** The vehicle hit, an index into `vehicles`. */
  vehicle: Int32Array;
  /** Per vehicle hit: its figure, its marks, and whether its turret's marks are found yet (`resolveTurrets`). */
  vehicles: { figure: string; marks: number[]; done: boolean }[];
}

const NONE: HitMarks = {
  count: 0,
  time: new Float64Array(0),
  person: new Int32Array(0),
  session: new Int32Array(0),
  local: new Float32Array(0),
  outcome: new Uint8Array(0),
  kill: new Uint8Array(0),
  body: new Uint8Array(0),
  turret: new Float32Array(0),
  hit: new Int32Array(0),
  row: new Int32Array(0),
  vehicle: new Int32Array(0),
  vehicles: [],
};

/**
 * A figure's main turret: the pivot, the rest yaw, the box of its vertices
 * (template frame) and how far from the pivot, level, the box reaches.
 */
interface TurretBox {
  px: number;
  pz: number;
  rest: number;
  min: Vec3;
  max: Vec3;
  reach: number;
}

const turrets = new WeakMap<Template, TurretBox | null>();

/** The main turret of a figure (`TurretBox`), or null for a figure with none. */
export function turretOf(t: Template): TurretBox | null {
  const hit = turrets.get(t);
  if (hit !== undefined) return hit;
  let out: TurretBox | null = null;
  const j = t.joints ? t.joints.findIndex((x) => x.kind === 'yaw' && x.parent < 0) : -1;
  if (j >= 0) {
    const min: Vec3 = [Infinity, Infinity, Infinity];
    const max: Vec3 = [-Infinity, -Infinity, -Infinity];
    for (const [v, js] of [
      [t.team, t.teamJ],
      [t.fixed, t.fixedJ],
    ] as const) {
      if (!js) continue;
      for (let i = 0; i < js.length; i++) {
        if (js[i] !== j + 1) continue;
        for (let a = 0; a < 3; a++) {
          const x = v[i * 7 + a];
          if (x < min[a]) min[a] = x;
          if (x > max[a]) max[a] = x;
        }
      }
    }
    const jt = t.joints![j];
    if (min[0] <= max[0]) {
      const px = jt.pivot[0], pz = jt.pivot[2];
      const reach = Math.max(Math.hypot(min[0] - px, min[2] - pz), Math.hypot(min[0] - px, max[2] - pz), Math.hypot(max[0] - px, min[2] - pz), Math.hypot(max[0] - px, max[2] - pz));
      out = { px, pz, rest: jt.rest, min, max, reach };
    }
  }
  turrets.set(t, out);
  return out;
}

const cache = new WeakMap<Dataset, HitMarks>();

/** The hit marks of a dataset (`HitMarks`), worked out once. */
export function hitMarksOf(d: Dataset): HitMarks {
  let m = cache.get(d);
  if (!m) {
    const set = hitsOf(d);
    m = set.hits.length ? marksFrom(d, set) : NONE;
    cache.set(d, m);
  }
  return m;
}

/** The marks of a hit set: every hit with a point whose unit's track is found. Turrets are left to `resolveTurrets`. */
export function marksFrom(d: Dataset, set: HitSet): HitMarks {
  const places = placesOf(d, set);
  const keep: { h: VehicleHit; person: number; row: number }[] = [];
  for (const h of set.hits) {
    if (h.kind !== 'hit' || !h.local) continue;
    const row = places.rows[h.id * 2] ?? -1;
    const person = h.victimPerson >= 0 ? h.victimPerson : row >= 0 && d.personId ? d.personId[row] : -1;
    if (person < 0) continue;
    keep.push({ h, person, row: h.side === 'victim' ? h.row : row });
  }
  if (!keep.length) return NONE;
  keep.sort((a, b) => a.h.time - b.h.time);
  const n = keep.length;
  const out: HitMarks = {
    count: n,
    time: new Float64Array(n),
    person: new Int32Array(n),
    session: new Int32Array(n),
    local: new Float32Array(n * 3),
    outcome: new Uint8Array(n),
    kill: new Uint8Array(n),
    body: new Uint8Array(n),
    turret: new Float32Array(n * 3).fill(NaN),
    hit: new Int32Array(n),
    row: new Int32Array(n),
    vehicle: new Int32Array(n),
    vehicles: [],
  };
  const index = new Map<string, number>();
  for (let k = 0; k < n; k++) {
    const { h, person, row } = keep[k];
    out.time[k] = h.time;
    out.person[k] = person;
    out.session[k] = d.sessionId && h.row >= 0 && h.row < d.count ? d.sessionId[h.row] : -1;
    out.outcome[k] = OUTCOMES.indexOf(h.outcome);
    out.kill[k] = h.killingShot ? 1 : 0;
    out.hit[k] = h.id;
    out.row[k] = row;
    const info = set.vehicles.get(h.vehicle);
    out.body[k] = bodyOf(info?.kind || h.vehicle);
    let v = index.get(h.vehicle);
    if (v === undefined) {
      v = out.vehicles.length;
      index.set(h.vehicle, v);
      // Only ground units' turrets are turned; the rest have nothing to resolve.
      out.vehicles.push({ figure: figureOfVehicle(info ?? { id: h.vehicle, name: '', kind: '' }), marks: [], done: out.body[k] !== FireBody.Ground });
    }
    out.vehicle[k] = v;
    out.vehicles[v].marks.push(k);
    out.local[k * 3] = h.local![0];
    out.local[k * 3 + 1] = h.local![1];
    out.local[k * 3 + 2] = h.local![2];
  }
  return out;
}

/**
 * Which of a vehicle's marks are on its turret, once: those as high as the
 * figure's turret and within its reach of the pivot (the game's points do not
 * fit the figure's box closely enough to test them inside it), moved back to
 * where they are with the turret at rest so they can be turned as it turns.
 * Builds the vehicle's figure, so it is done a vehicle a frame (`build`).
 */
export function resolveTurrets(m: HitMarks, v: number, d: Dataset): void {
  const veh = m.vehicles[v];
  if (veh.done) return;
  veh.done = true;
  const aim = aimOf(d);
  const t = aim ? templateOfFigure(veh.figure) : null;
  const tb = t ? turretOf(t) : null;
  if (!tb) return;
  const now: AimNow = { yaw: NaN, pitch: NaN };
  for (const k of veh.marks) {
    if (m.row[k] < 0) continue;
    const yaw = aim!.at(m.row[k], m.time[k], now).yaw;
    if (!Number.isFinite(yaw)) continue;
    const x = m.local[k * 3], y = m.local[k * 3 + 1], z = m.local[k * 3 + 2];
    const rx = x - tb.px, rz = z - tb.pz;
    if (y < tb.min[1] - TURRET_MARGIN || Math.hypot(rx, rz) > tb.reach + TURRET_MARGIN) continue;
    const a = -(yaw - tb.rest);
    const c = Math.cos(a), s = Math.sin(a);
    m.local[k * 3] = tb.px + rx * c - rz * s;
    m.local[k * 3 + 2] = tb.pz + rx * s + rz * c;
    m.turret[k * 3] = tb.px;
    m.turret[k * 3 + 1] = tb.pz;
    m.turret[k * 3 + 2] = tb.rest;
  }
}

/** The unit's pose for a mark, as the fires take it, and the row it is at now (for its turret). */
export interface MarkPose extends FirePose {
  row: number;
}

export interface MarkView {
  t: number;
  /** Seconds a mark stays; Infinity: the whole match. */
  seconds: number;
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

/** A disc's corners round, unit circle. */
const RING = Array.from({ length: 9 }, (_, i) => [Math.cos((i * Math.PI) / 4), Math.sin((i * Math.PI) / 4)]);
const OUTLINE: [number, number, number] = [0.03, 0.03, 0.05];
const WHITE: [number, number, number] = [1.6, 1.6, 1.6];

export class HitMarkLayer {
  private readonly pose: MarkPose = { x: 0, y: 0, z: 0, f: [1, 0, 0], u: [0, 1, 0], scale: 1, row: -1 };
  private readonly aimNow: AimNow = { yaw: NaN, pitch: NaN };
  /** The marks drawn last frame: where (data space) and which hit, for the pointer. */
  readonly drawn = { xyz: new Float32Array(MAX_MARKS * 3), hit: new Int32Array(MAX_MARKS), radius: new Float32Array(MAX_MARKS), count: 0 };
  // The frame's scratch: the mark's centre, the billboard's right and up.
  private cx = 0;
  private cy = 0;
  private cz = 0;
  private bx = 1;
  private by = 0;
  private bz = 0;
  private ux = 0;
  private uy = 1;
  private uz = 0;
  /** Towards the eye, unit: each disc of a mark a little nearer than the one behind it. */
  private ex = 0;
  private ey = 0;
  private ez = 0;
  private out: VertexBuffer | null = null;

  /** Appends the marks of the hits in the window ending at `v.t` to `out`; returns how many were drawn. */
  build(m: HitMarks, v: MarkView, out: VertexBuffer): number {
    this.drawn.count = 0;
    if (!m.count) return 0;
    this.out = out;
    const aim = aimOf(v.dataset);
    const from = v.t - v.seconds;
    // A figure is built to find a vehicle's turret: one a frame, its marks ride the hull until then.
    let resolve = 1;
    for (let k = lastAtOrBefore(m.time, m.count, v.t); k >= 0 && m.time[k] >= from && this.drawn.count < MAX_MARKS; k--) {
      if (v.session >= 0 && m.session[k] >= 0 && m.session[k] !== v.session) continue;
      if (resolve > 0 && !m.vehicles[m.vehicle[k]].done) {
        resolve--;
        resolveTurrets(m, m.vehicle[k], v.dataset);
      }
      this.one(m, k, v, aim);
    }
    return this.drawn.count;
  }

  private one(m: HitMarks, k: number, v: MarkView, aim: ReturnType<typeof aimOf>): void {
    const p = this.pose;
    p.scale = 1;
    p.row = -1;
    if (!v.poseOf(m.person[k], m.body[k] as FireBody, p)) return;
    let a = m.local[k * 3];
    const b = m.local[k * 3 + 1];
    let c = m.local[k * 3 + 2];
    const tx = m.turret[k * 3];
    if (Number.isFinite(tx) && aim && p.row >= 0) {
      // Turned as the turret stands now.
      const yaw = aim.at(p.row, v.t, this.aimNow).yaw;
      if (Number.isFinite(yaw)) {
        const tz = m.turret[k * 3 + 1];
        const r = yaw - m.turret[k * 3 + 2];
        const co = Math.cos(r), si = Math.sin(r);
        const rx = a - tx, rz = c - tz;
        a = tx + rx * co - rz * si;
        c = tz + rx * si + rz * co;
      }
    }
    const scale = v.units * (p.scale > 0 ? p.scale : 1);
    // Right = forward x up (`figures/kit.ts` poseFrame).
    const fx = p.f[0], fy = p.f[1], fz = p.f[2];
    const ux = p.u[0], uy = p.u[1], uz = p.u[2];
    const rx = fy * uz - fz * uy, ry = fz * ux - fx * uz, rz = fx * uy - fy * ux;
    let x = p.x + (fx * a + ux * b + rx * c) * scale;
    let y = p.y + (fy * a + uy * b + ry * c) * scale;
    let z = p.z + (fz * a + uz * b + rz * c) * scale;
    const ps = v.pixelSize(x, y, z);
    const age = v.t - m.time[k];
    const kill = m.kill[k] === 1;
    let rad = Math.max(MARK_M * scale, MARK_MIN_PX * ps) * (kill ? KILL_SIZE : 1);
    if (age < POP_S) rad *= 1 + 0.8 * (1 - age / POP_S);
    const fadeFrom = v.seconds * (1 - FADE);
    const alpha = Number.isFinite(v.seconds) && age > fadeFrom ? Math.max(0, 1 - (age - fadeFrom) / (v.seconds * FADE)) : 1;
    if (alpha <= 0.02) return;
    // Facing the eye, and brought out towards it by its size so the hull does not hide its own side's mark.
    let dx = v.eye[0] - x, dy = v.eye[1] - y, dz = v.eye[2] - z;
    const dl = Math.hypot(dx, dy, dz) || 1;
    dx /= dl;
    dy /= dl;
    dz /= dl;
    x += dx * rad;
    y += dy * rad;
    z += dz * rad;
    // Right: level, across the line of sight; up: across both.
    const hl = Math.hypot(dx, dz);
    this.bx = hl > 1e-6 ? dz / hl : 1;
    this.by = 0;
    this.bz = hl > 1e-6 ? -dx / hl : 0;
    this.ux = dy * this.bz - dz * this.by;
    this.uy = dz * this.bx - dx * this.bz;
    this.uz = dx * this.by - dy * this.bx;
    this.cx = x;
    this.cy = y;
    this.cz = z;
    this.ex = dx;
    this.ey = dy;
    this.ez = dz;
    const col = OUTCOME_COLOURS[OUTCOMES[m.outcome[k]] ?? 'hit'];
    // A dark rim behind for any background, a white ring round the killing shot, the outcome's colour inside.
    const step = rad * 0.08;
    this.disc(rad * 1.3, 0, OUTLINE, 0.8 * alpha);
    if (kill) {
      this.disc(rad * 1.15, step, WHITE, alpha);
      this.disc(rad * 0.8, step * 2, col, alpha);
    } else this.disc(rad, step, col, alpha);
    const i = this.drawn.count++;
    this.drawn.xyz[i * 3] = x;
    this.drawn.xyz[i * 3 + 1] = y;
    this.drawn.xyz[i * 3 + 2] = z;
    this.drawn.hit[i] = m.hit[k];
    this.drawn.radius[i] = rad;
  }

  /** A disc facing the eye, eight triangles round, `lift` nearer it than the mark's centre. */
  private disc(rad: number, lift: number, col: readonly number[], alpha: number): void {
    const o = this.out!;
    const r = col[0], g = col[1], b = col[2];
    const x = this.cx + this.ex * lift, y = this.cy + this.ey * lift, z = this.cz + this.ez * lift;
    for (let i = 0; i < 8; i++) {
      const c0 = RING[i], c1 = RING[i + 1];
      o.vertex(x, y, z, r, g, b, alpha);
      o.vertex(x + (this.bx * c0[0] + this.ux * c0[1]) * rad, y + (this.by * c0[0] + this.uy * c0[1]) * rad, z + (this.bz * c0[0] + this.uz * c0[1]) * rad, r, g, b, alpha);
      o.vertex(x + (this.bx * c1[0] + this.ux * c1[1]) * rad, y + (this.by * c1[0] + this.uy * c1[1]) * rad, z + (this.bz * c1[0] + this.uz * c1[1]) * rad, r, g, b, alpha);
    }
  }
}
