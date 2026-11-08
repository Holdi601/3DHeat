/**
 * The units big enough on screen to be figures, placed on the CPU: where the
 * GPU cannot sort units into one run a mesh (WebGL2 has no compute), it draws
 * every unit as a dart and leaves out those this finds - the few near the
 * camera - which are drawn as instanced figures the ordinary way.
 *
 * Finding them is cheap: each track's box and time span are worked out once,
 * and a track whose box is too far for its figure to reach the dart size, or
 * that is not there at the playhead, is passed over without being placed.
 * The test and the sizes are the place shader's (`shader.ts`).
 */

import { INSTANCE_STRIDE, NO_PITCH, type FigureBatch } from '../../figures/instances';
import { aimOf, type AimNow } from '../../figures/aim';
import { emptyPose, evaluateTrack } from './evaluate';
import { KEY_U32, TRACK_U32, type GpuTrackStore } from './store';
import { isShown } from './visibility';

interface Boxes {
  /** Per track: box centre x, y, z, half-diagonal. */
  sphere: Float32Array;
  /** Per track: first and last key time. */
  span: Float32Array;
  longest: Float32Array;
}

const boxes = new WeakMap<GpuTrackStore, Boxes>();

function boxesOf(s: GpuTrackStore): Boxes {
  let b = boxes.get(s);
  if (b) return b;
  const T = s.tracks;
  const f32 = new Float32Array(s.trackData.buffer, s.trackData.byteOffset, s.trackData.length);
  const sphere = new Float32Array(T * 4);
  const span = new Float32Array(T * 2);
  const longest = new Float32Array(T);
  for (let i = 0; i < T; i++) {
    const o = i * TRACK_U32;
    const size = 65535 * f32[o + 11];
    sphere[i * 4] = f32[o + 8] + size / 2;
    sphere[i * 4 + 1] = f32[o + 9] + size / 2;
    sphere[i * 4 + 2] = f32[o + 10] + size / 2;
    sphere[i * 4 + 3] = size * 0.8661;
    const first = s.trackData[o];
    const n = s.trackData[o + 1];
    span[i * 2] = f32[o + 12] + (s.keysA[first * KEY_U32 + 1] >>> 16) * f32[o + 13];
    span[i * 2 + 1] = f32[o + 12] + (s.keysA[(first + Math.max(0, n - 1)) * KEY_U32 + 1] >>> 16) * f32[o + 13];
    longest[i] = s.trackData[o + 3] ? f32[o + 4] : 0;
  }
  b = { sphere, span, longest };
  boxes.set(s, b);
  return b;
}

export interface NearFrame {
  t: number;
  viewProj: Float32Array;
  camera: ArrayLike<number>;
  focalPx: number;
  orthoPx: number;
  minPixels: number;
  stale: number;
  scale: number;
  fullPx: number;
  dartPx: number;
  visible: Uint32Array | null;
  /** Weapons hidden. */
  noWeapons: boolean;
}

/** One growable instance run a mesh. */
class Runs {
  private readonly runs = new Map<number, { data: Float32Array; count: number }>();
  add(mesh: number): Float32Array {
    let r = this.runs.get(mesh);
    if (!r) this.runs.set(mesh, (r = { data: new Float32Array(64 * INSTANCE_STRIDE), count: 0 }));
    if ((r.count + 1) * INSTANCE_STRIDE > r.data.length) {
      const d = new Float32Array(r.data.length * 2);
      d.set(r.data);
      r.data = d;
    }
    return r.data.subarray(r.count++ * INSTANCE_STRIDE, r.count * INSTANCE_STRIDE);
  }
  batches(s: GpuTrackStore): FigureBatch[] {
    const out: FigureBatch[] = [];
    for (const [m, r] of this.runs) if (r.count) out.push({ mesh: s.meshes[m], data: r.data, count: r.count });
    return out;
  }
}

const pose = emptyPose();
const aimNow: AimNow = { yaw: NaN, pitch: NaN };

/**
 * The figures of the units at least `dartPx` long on screen at true size, as
 * instance batches (at most `limit` of them, nearest kept first come).
 */
export function nearFigures(s: GpuTrackStore, f: NearFrame, limit = 20000): FigureBatch[] {
  const b = boxesOf(s);
  const runs = new Runs();
  const f32 = new Float32Array(s.trackData.buffer, s.trackData.byteOffset, s.trackData.length);
  const cx = f.camera[0], cy = f.camera[1], cz = f.camera[2];
  const persp = f.focalPx > 0;
  const m = f.viewProj;
  // Turrets and guns as the data has them now, where it has them and the keys have rows.
  const aim = s.keysAim && s.keyRow ? aimOf(s.dataset) : null;
  let n = 0;
  for (let i = 0; i < s.tracks && n < limit; i++) {
    const L = b.longest[i];
    if (!L) continue;
    if (f.t < b.span[i * 2] || (f.t > b.span[i * 2 + 1] + f.stale && f32[i * TRACK_U32 + 14] < 1e8)) continue;
    // The nearest its box comes: its figure could not be longer on screen than from there.
    const o = i * 4;
    const d = Math.max(1e-6, Math.hypot(b.sphere[o] - cx, b.sphere[o + 1] - cy, b.sphere[o + 2] - cz) - b.sphere[o + 3]);
    const maxLen = persp ? (L * f.scale * f.focalPx) / d : (L * f.scale) / f.orthoPx;
    if (maxLen < f.dartPx) continue;
    if (!isShown(f.visible, i)) continue;
    const flags = s.trackData[i * TRACK_U32 + 5];
    if (f.noWeapons && flags & 4) continue;
    if (!evaluateTrack(s, i, f.t, f.stale, pose)) continue;
    const pxSize = persp ? Math.hypot(pose.x - cx, pose.y - cy, pose.z - cz) / f.focalPx : f.orthoPx;
    const trueLen = (L * f.scale) / pxSize;
    if (trueLen < f.dartPx) continue;
    // In view (with the shader's margin).
    const w = m[3] * pose.x + m[7] * pose.y + m[11] * pose.z + m[15];
    if (w <= 0) continue;
    const nx = (m[0] * pose.x + m[4] * pose.y + m[8] * pose.z + m[12]) / w;
    const ny = (m[1] * pose.x + m[5] * pose.y + m[9] * pose.z + m[13]) / w;
    if (Math.abs(nx) > 1.3 || Math.abs(ny) > 1.3) continue;
    const meshes = s.trackData[i * TRACK_U32 + 3];
    let mesh = meshes & 0xffff;
    if (trueLen < f.fullPx) mesh = meshes >>> 16;
    if (trueLen < f.fullPx / 3) mesh = s.trackData[i * TRACK_U32 + 6];
    const scale = Math.max(f.scale, (f.minPixels * pxSize) / f32[i * TRACK_U32 + 4]);
    const c = s.trackData[i * TRACK_U32 + 2];
    const out = runs.add(mesh);
    out[0] = pose.x;
    out[1] = pose.y;
    out[2] = pose.z;
    out[3] = scale;
    out[4] = pose.f[0];
    out[5] = pose.f[1];
    out[6] = pose.f[2];
    out[7] = 1;
    out[8] = pose.u[0];
    out[9] = pose.u[1];
    out[10] = pose.u[2];
    if (aim) aim.at(s.keyRow![pose.key], f.t, aimNow);
    out[11] = aim && Number.isFinite(aimNow.yaw) ? aimNow.yaw : 0;
    out[12] = (c & 255) / 255;
    out[13] = ((c >>> 8) & 255) / 255;
    out[14] = ((c >>> 16) & 255) / 255;
    out[15] = aim && Number.isFinite(aimNow.pitch) ? aimNow.pitch : NO_PITCH;
    n++;
  }
  return runs.batches(s);
}
