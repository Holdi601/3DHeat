/**
 * A track of a `GpuTrackStore` at a time, on the CPU: line for line what the
 * compute shader (`shader.ts`) does for every unit each frame. Used where a
 * few units are wanted on the CPU - the followed one, the one under a click -
 * and as the reference the shader is checked against.
 *
 * The curve is `motion.ts`'s: cubic Hermite between keys, each key's velocity
 * the three-point estimate from its neighbours, tangents held to 1.5 chords;
 * the attitude slerped the short way; a fast mover's nose turned onto its
 * velocity (fully above 40 m/s, not below 25), its up axis kept square to it.
 */

import { decodeKey, keyTime, FLAG_AIR, FLAG_ATTITUDE, TRACK_U32, type GpuTrackStore } from './store';

export interface TrackPose {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  /** Forward and up, unit and square. */
  f: [number, number, number];
  u: [number, number, number];
  /** The key at or before the time: its index. */
  key: number;
}

export function emptyPose(): TrackPose {
  return { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, f: [1, 0, 0], u: [0, 1, 0], key: -1 };
}

const s8 = (v: number) => ((v & 0xff) << 24) >> 24;

function unpack(v: number, out: number[]): void {
  out[0] = s8(v) / 127;
  out[1] = s8(v >>> 8) / 127;
  out[2] = s8(v >>> 16) / 127;
  out[3] = s8(v >>> 24) / 127;
}

function rotate(q: number[], x: number, y: number, z: number, out: [number, number, number]): void {
  const [qx, qy, qz, qw] = q;
  const tx = 2 * (qy * z - qz * y);
  const ty = 2 * (qz * x - qx * z);
  const tz = 2 * (qx * y - qy * x);
  out[0] = x + qw * tx + (qy * tz - qz * ty);
  out[1] = y + qw * ty + (qz * tx - qx * tz);
  out[2] = z + qw * tz + (qx * ty - qy * tx);
}

const qa = [0, 0, 0, 1];
const qb = [0, 0, 0, 1];
const va = [0, 0, 0];
const vb = [0, 0, 0];

const K0 = [0, 0, 0, 0];
const K1 = [0, 0, 0, 0];
const KP = [0, 0, 0, 0];
const KN = [0, 0, 0, 0];

/** The velocity at key `j` (decoded into `at`), the three-point estimate from its neighbours. */
function velocity(s: GpuTrackStore, b: number, j: number, at: number[], first: number, last: number, out: number[]): void {
  if (j > first && j < last) {
    decodeKey(s, b, j - 1, KP);
    decodeKey(s, b, j + 1, KN);
    const h0 = at[3] - KP[3];
    const h1 = KN[3] - at[3];
    const w0 = h1 / (h0 + h1);
    const w1 = h0 / (h0 + h1);
    for (let c = 0; c < 3; c++) out[c] = ((at[c] - KP[c]) / h0) * w0 + ((KN[c] - at[c]) / h1) * w1;
  } else if (j < last) {
    decodeKey(s, b, j + 1, KN);
    const h = KN[3] - at[3];
    for (let c = 0; c < 3; c++) out[c] = (KN[c] - at[c]) / h;
  } else if (j > first) {
    decodeKey(s, b, j - 1, KP);
    const h = at[3] - KP[3];
    for (let c = 0; c < 3; c++) out[c] = (at[c] - KP[c]) / h;
  } else out[0] = out[1] = out[2] = 0;
}

// The track table's float view, kept: evaluated for many tracks a frame (the burning ones, `figures/fires.ts`).
let viewOf: Uint32Array | null = null;
let viewF32: Float32Array = new Float32Array(0);
function floatsOf(T: Uint32Array): Float32Array {
  if (viewOf !== T) {
    viewOf = T;
    viewF32 = new Float32Array(T.buffer, T.byteOffset, T.length);
  }
  return viewF32;
}

/** Track `i` at time `t` into `out`; false when it is not there (before its first key, or `stale` s past its last). */
export function evaluateTrack(s: GpuTrackStore, i: number, t: number, stale: number, out: TrackPose): boolean {
  const T = s.trackData;
  const b = i * TRACK_U32;
  const first = T[b];
  const count = T[b + 1];
  const flags = T[b + 5];
  const last = first + count - 1;
  if (count === 0) return false;
  const f32 = floatsOf(T);
  const timeOf = (j: number) => keyTime(s, b, j);
  if (timeOf(first) > t) return false;
  // The last key at or before t.
  let lo = first;
  let hi = last + 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (timeOf(mid) <= t) lo = mid;
    else hi = mid;
  }
  const k = lo;
  out.key = k;
  decodeKey(s, b, k, K0);
  let sP = 0;
  if (k === last) {
    // Held past its last key as long as its own sample rate says (slot 14, plus one), never past `stale`.
    const hold = f32[b + 14];
    if (t - K0[3] > (hold > 1e8 ? Infinity : hold > 0.5 ? Math.min(stale, hold - 1) : stale)) return false;
    out.x = K0[0];
    out.y = K0[1];
    out.z = K0[2];
    velocity(s, b, k, K0, first, last, va);
    out.vx = va[0];
    out.vy = va[1];
    out.vz = va[2];
  } else {
    decodeKey(s, b, k + 1, K1);
    const h = K1[3] - K0[3];
    const sv = Math.min(1, Math.max(0, (t - K0[3]) / h));
    sP = sv;
    velocity(s, b, k, K0, first, last, va);
    velocity(s, b, k + 1, K1, first, last, vb);
    const cx = K1[0] - K0[0], cy = K1[1] - K0[1], cz = K1[2] - K0[2];
    const cap = 1.5 * Math.hypot(cx, cy, cz);
    let m0 = Math.hypot(va[0], va[1], va[2]) * h;
    let m1 = Math.hypot(vb[0], vb[1], vb[2]) * h;
    m0 = m0 > cap ? (cap / m0) * h : h;
    m1 = m1 > cap ? (cap / m1) * h : h;
    const s2 = sv * sv, s3 = s2 * sv;
    // P from K0, as the shader works it (h00 = 1 - h01): no sum of two big coordinates.
    const h10 = s3 - 2 * s2 + sv, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
    const d00 = 6 * s2 - 6 * sv, d10 = 3 * s2 - 4 * sv + 1, d11 = 3 * s2 - 2 * sv;
    const C = [cx, cy, cz];
    const P = [0, 0, 0];
    const V = [0, 0, 0];
    for (let c = 0; c < 3; c++) {
      P[c] = K0[c] + (h10 * va[c] * m0 + h01 * C[c] + h11 * vb[c] * m1);
      V[c] = (d00 * -C[c] + d10 * va[c] * m0 + d11 * vb[c] * m1) / h;
    }
    out.x = P[0];
    out.y = P[1];
    out.z = P[2];
    out.vx = V[0];
    out.vy = V[1];
    out.vz = V[2];
  }
  frame(s, k, k === last ? k : k + 1, sP, flags, out);
  return true;
}

/** Forward and up from the keys' attitudes (or the velocity), the nose onto the flight for fast movers. */
function frame(s: GpuTrackStore, a: number, b: number, w: number, flags: number, out: TrackPose): void {
  const f = out.f;
  const u = out.u;
  const speed = Math.hypot(out.vx, out.vy, out.vz);
  if (flags & FLAG_ATTITUDE) {
    unpack(s.keysB[a], qa);
    unpack(s.keysB[b], qb);
    let dot = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];
    if (dot < 0) {
      for (let c = 0; c < 4; c++) qb[c] = -qb[c];
      dot = -dot;
    }
    let k0 = 1 - w;
    let k1 = w;
    if (dot < 0.9995) {
      const th = Math.acos(Math.min(1, dot));
      const sn = Math.sin(th);
      k0 = Math.sin((1 - w) * th) / sn;
      k1 = Math.sin(w * th) / sn;
    }
    const q = [qa[0] * k0 + qb[0] * k1, qa[1] * k0 + qb[1] * k1, qa[2] * k0 + qb[2] * k1, qa[3] * k0 + qb[3] * k1];
    const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
    for (let c = 0; c < 4; c++) q[c] /= l;
    rotate(q, 1, 0, 0, f);
    rotate(q, 0, 1, 0, u);
    const nose = noseWeight(speed / s.units);
    if (nose > 0) {
      const d = [out.vx / speed, out.vy / speed, out.vz / speed];
      turnTowards(f, d, nose);
      square(f, u);
    }
  } else if (speed > 0.2 * s.units) {
    f[0] = out.vx / speed;
    f[1] = out.vy / speed;
    f[2] = out.vz / speed;
    u[0] = 0;
    u[1] = 1;
    u[2] = 0;
    square(f, u);
  } else {
    f[0] = 1;
    f[1] = 0;
    f[2] = 0;
    u[0] = 0;
    u[1] = 1;
    u[2] = 0;
  }
  if (!(flags & FLAG_AIR)) {
    // Ground figures keep level: the heading only.
    const l = Math.hypot(f[0], f[2]);
    if (l > 1e-6) {
      f[0] /= l;
      f[2] /= l;
    } else {
      f[0] = 1;
      f[2] = 0;
    }
    f[1] = 0;
    u[0] = 0;
    u[1] = 1;
    u[2] = 0;
  }
}

export function noseWeight(metresPerSecond: number): number {
  const v = metresPerSecond;
  if (v <= 25) return 0;
  if (v >= 40) return 1;
  const x = (v - 25) / 15;
  return x * x * (3 - 2 * x);
}

/** `a` turned towards unit `d` by the share `w` of the angle between them (slerp of directions). */
function turnTowards(a: number[], d: number[], w: number): void {
  const c = Math.max(-1, Math.min(1, a[0] * d[0] + a[1] * d[1] + a[2] * d[2]));
  const th = Math.acos(c);
  let k0 = 1 - w;
  let k1 = w;
  if (th > 1e-4) {
    const sn = Math.sin(th);
    if (sn > 1e-6) {
      k0 = Math.sin((1 - w) * th) / sn;
      k1 = Math.sin(w * th) / sn;
    }
  }
  const x = a[0] * k0 + d[0] * k1, y = a[1] * k0 + d[1] * k1, z = a[2] * k0 + d[2] * k1;
  const l = Math.hypot(x, y, z) || 1;
  a[0] = x / l;
  a[1] = y / l;
  a[2] = z / l;
}

/** `u` made square to `f` (unit), unit; world up when it lies along `f`. */
function square(f: number[], u: number[]): void {
  let d = u[0] * f[0] + u[1] * f[1] + u[2] * f[2];
  let x = u[0] - f[0] * d, y = u[1] - f[1] * d, z = u[2] - f[2] * d;
  let l = Math.hypot(x, y, z);
  if (l < 1e-4) {
    d = f[1];
    x = -f[0] * d;
    y = 1 - f[1] * d;
    z = -f[2] * d;
    l = Math.hypot(x, y, z) || 1;
  }
  u[0] = x / l;
  u[1] = y / l;
  u[2] = z / l;
}
