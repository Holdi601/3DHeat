/**
 * Where a vehicle's turret and gun point, from the data, at any time: the
 * turret's yaw from the hull's heading (radians, right positive) and the
 * gun's elevation (radians, up positive), between two samples on the short
 * way round. What turns a figure's turret and raises its gun (`instances.ts`).
 *
 * Columns, first found wins:
 *
 *   turret yaw   `turretYaw` / `turret_yaw` / `TurretYaw` - degrees (War
 *                Thunder's converter), radians where the data is World of
 *                Tanks' (it has `gunStep`)
 *   gun          `gunPitch` / `gun_pitch` / `gunElevation` - degrees;
 *                World of Tanks' `gunStep` (0-63 across the gun's limits, which
 *                the replay does not carry: taken as +20Â° to -8Â°, a typical gun's)
 *   view         `viewYaw` / `viewPitch`, else `aimHeading` / `aimPitch`:
 *                where the player looks (the camera, the sight) in the world,
 *                compass degrees and degrees up, less the hull's own heading
 *                and pitch (`Aim.view`)
 *
 * A vehicle whose rows have no turret column takes its turret from the view
 * (`Aim.derived`): War Thunder's server replays converted so far write the
 * view for every vehicle and the turret for a few. One that has turret rows
 * turns its turret by them only, never by the view, which runs ahead of a
 * turret that traverses at its own speed.
 */

import type { AttributeColumn, Dataset } from '../state/types';
import { personRowsSteps } from '../data/flight';

const YAW_NAMES = ['turretYaw', 'turret_yaw', 'TurretYaw', 'turretHeading'];
const PITCH_NAMES = ['gunPitch', 'gun_pitch', 'GunPitch', 'gunElevation', 'gun_elevation'];
const STEP_NAMES = ['gunStep'];
const VIEW_YAW_NAMES = ['viewYaw', 'viewHeading', 'aimHeading'];
const VIEW_PITCH_NAMES = ['viewPitch', 'aimPitch'];
/** A World of Tanks gun step's range: step 0 the most it raises, 63 the most it dips, degrees. */
const STEP_UP = 20;
const STEP_DOWN = -8;

const DEG = Math.PI / 180;

function column(d: Dataset, names: string[]): AttributeColumn | null {
  for (const n of names) {
    const a = d.attrs.find((x) => x.kind === 'number' && x.name.trim().toLowerCase() === n.toLowerCase());
    if (a) return a;
  }
  return null;
}

function maxAbs(v: Float32Array): number {
  let m = 0;
  for (let i = 0; i < v.length; i++) {
    const a = Math.abs(v[i]);
    if (a > m && Number.isFinite(a)) m = a;
  }
  return m;
}

/** The turret and gun of one figure now; NaN where the data has none. */
export interface AimNow {
  yaw: number;
  pitch: number;
}

export class Aim {
  /** Per row, radians; NaN where the row has none. */
  readonly yaw: Float32Array | null;
  readonly pitch: Float32Array | null;
  /** Where the player looks, the same way (relative to the hull); null where the data does not say. */
  view: Aim | null = null;
  /** Per person: 1 where its turret is taken from the view (it has no turret rows); null for none so taken. */
  derived: Uint8Array | null = null;
  /** Per row, the person's last row at or before it with an aim, and the next one after it (-1: none). */
  private readonly prev: Int32Array;
  private readonly next: Int32Array;

  constructor(
    private readonly d: Dataset,
    yaw: Float32Array | null,
    pitch: Float32Array | null,
    prev: Int32Array,
    next: Int32Array,
  ) {
    this.yaw = yaw;
    this.pitch = pitch;
    this.prev = prev;
    this.next = next;
  }

  /** The aim of `d` from its turret and gun per row: each person's rows linked to their last and next aim, in steps. */
  static *build(d: Dataset, yaw: Float32Array | null, pitch: Float32Array | null): Generator<void, Aim, void> {
    const prev = new Int32Array(d.count).fill(-1);
    const next = new Int32Array(d.count).fill(-1);
    const idx = yield* personRowsSteps(d);
    if (idx) {
      let n = 0;
      for (let p = 0; p + 1 < idx.start.length; p++) {
        let last = -1;
        for (let k = idx.start[p]; k < idx.start[p + 1]; k++) {
          if (++n === STEP) {
            n = 0;
            yield;
          }
          const r = idx.rows[k];
          if ((yaw !== null && Number.isFinite(yaw[r])) || (pitch !== null && Number.isFinite(pitch[r]))) last = r;
          prev[r] = last;
        }
        let after = -1;
        for (let k = idx.start[p + 1] - 1; k >= idx.start[p]; k--) {
          if (++n === STEP) {
            n = 0;
            yield;
          }
          const r = idx.rows[k];
          next[r] = after;
          if ((yaw !== null && Number.isFinite(yaw[r])) || (pitch !== null && Number.isFinite(pitch[r]))) after = r;
        }
      }
    }
    return new Aim(d, yaw, pitch, prev, next);
  }

  /** The aim of the thing whose row (at or before `t`) is `row`, at time `t`, into `out`. */
  at(row: number, t: number, out: AimNow): AimNow {
    out.yaw = NaN;
    out.pitch = NaN;
    const time = this.d.time;
    if (row < 0 || row >= this.prev.length || !time) return out;
    const a = this.prev[row];
    if (a < 0) return out;
    const b = this.next[a];
    const ta = time[a];
    const f = b >= 0 && time[b] > ta && t > ta ? Math.min(1, (t - ta) / (time[b] - ta)) : 0;
    if (this.yaw) out.yaw = f > 0 ? lerpAngle(this.yaw[a], this.yaw[b], f) : this.yaw[a];
    if (this.pitch) {
      const pa = this.pitch[a];
      const pb = f > 0 ? this.pitch[b] : pa;
      out.pitch = Number.isFinite(pb) ? pa + (pb - pa) * f : pa;
    }
    return out;
  }
}

/** From `a` to `b` (radians) the short way round, `f` of the way; either missing: the other. */
export function lerpAngle(a: number, b: number, f: number): number {
  if (!Number.isFinite(a)) return b;
  if (!Number.isFinite(b)) return a;
  let d = (b - a) % (2 * Math.PI);
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return a + d * f;
}

const cache = new WeakMap<Dataset, Aim | null>();
/** Rows a step of the working out goes through: well under a millisecond. */
const STEP = 1 << 15;

/** `out[r] = f(v[r])` for every row, in steps. */
function* mapSteps(v: Float32Array, f: (x: number) => number): Generator<void, Float32Array, void> {
  const out = new Float32Array(v.length);
  for (let r = 0; r < v.length; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    out[r] = f(v[r]);
  }
  return out;
}

/** `world` (degrees) less `hull` (radians) per row, wrapped to a half turn either way; NaN where either is missing. */
function* fromWorld(world: Float32Array, hull: Float32Array): Generator<void, Float32Array, void> {
  const out = new Float32Array(world.length).fill(NaN);
  for (let r = 0; r < out.length; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    if (!Number.isFinite(world[r]) || !Number.isFinite(hull[r])) continue;
    let a = (world[r] * DEG - hull[r]) % (2 * Math.PI);
    if (a > Math.PI) a -= 2 * Math.PI;
    if (a < -Math.PI) a += 2 * Math.PI;
    out[r] = a;
  }
  return out;
}

/**
 * The turret's yaw and pitch with the rows of every person that has no
 * turret row filled from the view: those persons marked in the answer's
 * `derived` (null where none is).
 */
function* fillFromView(
  d: Dataset,
  yaw: Float32Array | null,
  pitch: Float32Array | null,
  vy: Float32Array | null,
  vp: Float32Array | null,
): Generator<void, { yaw: Float32Array | null; pitch: Float32Array | null; derived: Uint8Array | null }, void> {
  if (!vy && !vp) return { yaw, pitch, derived: null };
  const n = Math.max(d.personLabels.length, 1);
  const own = new Uint8Array(n);
  const pid = d.personId;
  if (yaw || pitch) {
    for (let r = 0; r < d.count; r++) {
      if ((r & (STEP - 1)) === STEP - 1) yield;
      if ((yaw && Number.isFinite(yaw[r])) || (pitch && Number.isFinite(pitch[r]))) own[pid ? pid[r] : 0] = 1;
    }
  }
  const derived = new Uint8Array(n);
  let any = false;
  const y = yaw ? yaw.slice() : vy ? new Float32Array(d.count).fill(NaN) : null;
  const pt = pitch ? pitch.slice() : vp ? new Float32Array(d.count).fill(NaN) : null;
  for (let r = 0; r < d.count; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    const p = pid ? pid[r] : 0;
    if (own[p]) continue;
    const a = vy ? vy[r] : NaN, b = vp ? vp[r] : NaN;
    if (!Number.isFinite(a) && !Number.isFinite(b)) continue;
    if (y) y[r] = a;
    if (pt) pt[r] = b;
    derived[p] = 1;
    any = true;
  }
  return { yaw: y, pitch: pt, derived: any ? derived : null };
}

/** The aim of a dataset's vehicles, or null where it has no turret or gun column. Worked out once. */
export function aimOf(d: Dataset): Aim | null {
  const g = aimSteps(d);
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}

/**
 * `aimOf` in steps of a fraction of a millisecond, for work spread over
 * frames (`figures/hitmarks.ts`): a large battle's aim takes tens of them.
 */
export function* aimSteps(d: Dataset): Generator<void, Aim | null, void> {
  const hit = cache.get(d);
  if (hit !== undefined) return hit;
  const yc = column(d, YAW_NAMES);
  const pc = column(d, PITCH_NAMES);
  const sc = pc ? null : column(d, STEP_NAMES);
  let yaw: Float32Array | null = null;
  let pitch: Float32Array | null = null;
  if (yc) {
    // World of Tanks writes radians (and has its gun steps); War Thunder degrees. A column past a turn of radians is degrees whatever.
    const v = yc.data as Float32Array;
    const radians = !!column(d, STEP_NAMES) && maxAbs(v) <= 2 * Math.PI + 0.01;
    yaw = radians ? v : yield* mapSteps(v, (x) => x * DEG);
  }
  if (pc) {
    const v = pc.data as Float32Array;
    pitch = yield* mapSteps(v, (x) => x * DEG);
  } else if (sc) {
    const v = sc.data as Float32Array;
    pitch = yield* mapSteps(v, (s) => (Number.isFinite(s) ? (STEP_UP + ((STEP_DOWN - STEP_UP) * s) / 63) * DEG : NaN));
  }
  // Where the player looks, less the hull; the turret of a vehicle without turret rows taken from it.
  const vh = column(d, VIEW_YAW_NAMES);
  const vy = vh && d.yaw ? yield* fromWorld(vh.data as Float32Array, d.yaw) : null;
  const vpc = column(d, VIEW_PITCH_NAMES);
  const vp = vpc && d.pitch ? yield* fromWorld(vpc.data as Float32Array, d.pitch) : null;
  const filled = yield* fillFromView(d, yaw, pitch, vy, vp);
  const out = filled.yaw || filled.pitch ? yield* Aim.build(d, filled.yaw, filled.pitch) : null;
  if (out) {
    out.derived = filled.derived;
    if (vy || vp) out.view = yield* Aim.build(d, vy, vp);
  }
  // Another caller may have worked it out meanwhile: one aim per dataset.
  const again = cache.get(d);
  if (again !== undefined) return again;
  cache.set(d, out);
  return out;
}
