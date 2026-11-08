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
 *                the replay does not carry: taken as +20° to -8°, a typical gun's)
 *   or, where a row has neither, `aimHeading` / `aimPitch`: where the gun
 *                points in the world, degrees (War Thunder's server replays
 *                write these for every vehicle and the turret only for a few),
 *                less the hull's own heading and pitch
 */

import type { AttributeColumn, Dataset } from '../state/types';
import { personRows } from '../data/flight';

const YAW_NAMES = ['turretYaw', 'turret_yaw', 'TurretYaw', 'turretHeading'];
const PITCH_NAMES = ['gunPitch', 'gun_pitch', 'GunPitch', 'gunElevation', 'gun_elevation'];
const STEP_NAMES = ['gunStep'];
const AIM_HEADING_NAMES = ['aimHeading'];
const AIM_PITCH_NAMES = ['aimPitch'];
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
  /** Per row, the person's last row at or before it with an aim, and the next one after it (-1: none). */
  private readonly prev: Int32Array;
  private readonly next: Int32Array;

  constructor(
    private readonly d: Dataset,
    yaw: Float32Array | null,
    pitch: Float32Array | null,
  ) {
    this.yaw = yaw;
    this.pitch = pitch;
    this.prev = new Int32Array(d.count).fill(-1);
    this.next = new Int32Array(d.count).fill(-1);
    const idx = personRows(d);
    if (!idx) return;
    const has = (r: number) => (yaw ? Number.isFinite(yaw[r]) : false) || (pitch ? Number.isFinite(pitch[r]) : false);
    for (let p = 0; p + 1 < idx.start.length; p++) {
      let last = -1;
      for (let k = idx.start[p]; k < idx.start[p + 1]; k++) {
        const r = idx.rows[k];
        if (has(r)) last = r;
        this.prev[r] = last;
      }
      let after = -1;
      for (let k = idx.start[p + 1] - 1; k >= idx.start[p]; k--) {
        const r = idx.rows[k];
        this.next[r] = after;
        if (has(r)) after = r;
      }
    }
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

/**
 * `own` (radians, relative to the hull) with its gaps filled from `world`
 * (degrees) less `hull` (radians), wrapped to a half turn either way.
 */
function fromWorld(own: Float32Array | null, world: Float32Array, hull: Float32Array): Float32Array {
  const out = own ? Float32Array.from(own) : new Float32Array(world.length).fill(NaN);
  for (let r = 0; r < out.length; r++) {
    if (Number.isFinite(out[r]) || !Number.isFinite(world[r]) || !Number.isFinite(hull[r])) continue;
    let a = (world[r] * DEG - hull[r]) % (2 * Math.PI);
    if (a > Math.PI) a -= 2 * Math.PI;
    if (a < -Math.PI) a += 2 * Math.PI;
    out[r] = a;
  }
  return out;
}

/** The aim of a dataset's vehicles, or null where it has no turret or gun column. Worked out once. */
export function aimOf(d: Dataset): Aim | null {
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
    yaw = radians ? v : Float32Array.from(v, (x) => x * DEG);
  }
  if (pc) {
    const v = pc.data as Float32Array;
    pitch = Float32Array.from(v, (x) => x * DEG);
  } else if (sc) {
    const v = sc.data as Float32Array;
    pitch = Float32Array.from(v, (s) => (Number.isFinite(s) ? (STEP_UP + ((STEP_DOWN - STEP_UP) * s) / 63) * DEG : NaN));
  }
  // The world aim, less the hull, for every row the turret columns leave empty.
  const ah = column(d, AIM_HEADING_NAMES);
  if (ah && d.yaw) yaw = fromWorld(yaw, ah.data as Float32Array, d.yaw);
  const ap = column(d, AIM_PITCH_NAMES);
  if (ap && d.pitch) pitch = fromWorld(pitch, ap.data as Float32Array, d.pitch);
  const out = yaw || pitch ? new Aim(d, yaw, pitch) : null;
  cache.set(d, out);
  return out;
}
