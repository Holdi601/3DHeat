/**
 * Tracks for the GPU: every tracked thing's keyframes in two flat typed
 * arrays, built once a dataset, so a compute pass can place every unit at the
 * playhead and the CPU does nothing per unit per frame. What the figure
 * overlay of hundreds or thousands of matches is drawn from.
 *
 * Per key 20 bytes: x, y, z, t (f32 - a 60 km map keeps 4 mm, a two-hour
 * match 0.5 ms) and the attitude as a quaternion in four signed bytes (0.5
 * degree). Velocities are not stored: the shader takes them from the
 * neighbouring keys, the three-point estimate `motion.ts` uses, so the curve
 * on the GPU is the curve on the CPU.
 *
 * Lossless by default: every own position sample is a key (doubled times
 * dropped). Only when the keys would not fit the GPU's largest buffer is the
 * data reduced, adaptively: a sample is left out while the curve through the
 * ones kept stays within `tolerance` metres of it (dead-reckoning test from
 * the last kept key at its velocity), with at most `MAX_GAP` seconds between
 * keys. The tolerance used and what it cost are kept, to be shown.
 *
 * Per track 32 bytes: first key, key count, team colour (rgba8), full and
 * coarse mesh index (and the far one in slot 6), the figure's longest side, flags (air: turns with its
 * pitch and roll; attitude: has one).
 */

import type { Dataset } from '../../state/types';
import { teamMemberColor } from '../colors';
import { FigureReplay } from '../../figures/replay';
import { meshOf, MESH_STRIDE, type FigureMesh } from '../../figures/instances';
import { poseFrame } from '../../figures/kit';
import { positionRows, quatOfFrame } from '../../figures/motion';

export const TRACK_U32 = 8;
export const KEY_F32 = 4;
/** Most seconds between two keys when the data is reduced. */
const MAX_GAP = 4;
/** Tolerances tried, metres, when lossless does not fit. */
const TOLERANCES = [0.5, 1, 2, 5, 10, 20, 50, 100];

export const FLAG_AIR = 1;
export const FLAG_ATTITUDE = 2;

export interface GpuTrackStore {
  readonly dataset: Dataset;
  readonly tracks: number;
  /** TRACK_U32 a track. */
  readonly trackData: Uint32Array;
  /** KEY_F32 a key: x, y, z, t. */
  readonly keysA: Float32Array;
  /** One a key: the attitude, snorm8 x4 (x, y, z, w). */
  readonly keysB: Uint32Array;
  /** The row each key was made from (CPU only, for labels and cards). */
  readonly keyRow: Int32Array;
  readonly keys: number;
  /** Index 0 is the dart, the far stand-in; then each figure's full and coarse builds. */
  readonly meshes: FigureMesh[];
  /** Per mesh, how many tracks may draw with it: the room its instances need. */
  readonly meshTracks: Uint32Array;
  /** Track -> person, person -> track (-1: none). */
  readonly personOf: Int32Array;
  readonly trackOf: Int32Array;
  /** Data units in a metre. */
  readonly units: number;
  /** 0: every sample kept; else the metres a reduced curve stays within. */
  readonly tolerance: number;
  readonly samples: number;
  /** Bytes on the GPU for tracks and keys. */
  readonly bytes: number;
  readonly buildMs: number;
}

const DART = dartMesh();

/** A dart: a flat arrowhead with a fin, 1 m long, nose along +x, in the team's colour. */
function dartMesh(): FigureMesh {
  const v: number[] = [];
  const tri = (a: number[], b: number[], c: number[]) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l;
    ny /= l;
    nz /= l;
    for (const p of [a, b, c]) v.push(p[0], p[1], p[2], 1, 1, 1, 1, nx, ny, nz, 0, 1);
    for (const p of [a, c, b]) v.push(p[0], p[1], p[2], 1, 1, 1, 1, -nx, -ny, -nz, 0, 1);
  };
  const nose = [0.5, 0, 0];
  const l = [-0.5, 0, -0.42];
  const r = [-0.5, 0, 0.42];
  const tail = [-0.3, 0, 0];
  const fin = [-0.5, 0.25, 0];
  tri(nose, r, tail);
  tri(nose, tail, l);
  tri([0.1, 0, 0], tail, fin);
  return { id: -1, data: new Float32Array(v), count: v.length / MESH_STRIDE };
}

function packQuat(q: ArrayLike<number>): number {
  const b = (x: number) => (Math.round(Math.max(-1, Math.min(1, x)) * 127) & 0xff) >>> 0;
  return (b(q[0]) | (b(q[1]) << 8) | (b(q[2]) << 16) | (b(q[3]) << 24)) >>> 0;
}

function rgba8(r: number, g: number, b: number): number {
  const c = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 255);
  return (c(r) | (c(g) << 8) | (c(b) << 16) | (255 << 24)) >>> 0;
}

export interface BuildOptions {
  /** Most keys the GPU can hold (its largest buffer over 16 bytes). */
  maxKeys: number;
}

const cache = new WeakMap<Dataset, GpuTrackStore>();

export function gpuTrackStore(d: Dataset, o: BuildOptions): GpuTrackStore | null {
  const hit = cache.get(d);
  if (hit) return hit;
  const s = build(d, o);
  if (s) cache.set(d, s);
  return s;
}

function build(d: Dataset, o: BuildOptions): GpuTrackStore | null {
  const t0 = performance.now();
  const { time, personId, px, py, pz, count } = d;
  if (!time || !personId) return null;
  const persons = Math.max(1, d.personLabels.length);
  const units = d.entitySize ? d.entitySize / 0.8 : 1;
  const { own, ids } = positionRows(d);

  // Rows per person, in time order (the rows are), own positions only.
  const start = new Int32Array(persons + 1);
  for (let r = 0; r < count; r++) if ((!own || own[ids![r]]) && Number.isFinite(px[r])) start[personId[r] + 1]++;
  for (let p = 0; p < persons; p++) start[p + 1] += start[p];
  const rows = new Int32Array(start[persons]);
  const fill = start.slice(0, persons);
  for (let r = 0; r < count; r++) if ((!own || own[ids![r]]) && Number.isFinite(px[r])) rows[fill[personId[r]]++] = r;
  const samples = rows.length;

  /** Marks the rows kept as keys at a tolerance (0: all but doubled times); returns how many. */
  const keep = new Uint8Array(samples);
  const choose = (tol: number): number => {
    let n = 0;
    const tolU = tol * units;
    for (let p = 0; p < persons; p++) {
      const a = start[p];
      const b = start[p + 1];
      let last = -1;
      let vx = 0, vy = 0, vz = 0;
      for (let k = a; k < b; k++) {
        const r = rows[k];
        keep[k] = 0;
        if (last >= 0 && time[r] - time[rows[last]] < 1e-3) continue;
        if (last >= 0 && tol > 0 && k !== b - 1) {
          const lr = rows[last];
          const dt = time[r] - time[lr];
          if (dt < MAX_GAP) {
            const ex = px[r] - (px[lr] + vx * dt);
            const ey = py[r] - (py[lr] + vy * dt);
            const ez = pz[r] - (pz[lr] + vz * dt);
            if (ex * ex + ey * ey + ez * ez <= tolU * tolU) continue;
          }
        }
        keep[k] = 1;
        n++;
        // The velocity at this key, from its raw neighbours: what the next samples are tested against.
        const r0 = rows[Math.max(a, k - 1)];
        const r1 = rows[Math.min(b - 1, k + 1)];
        const h = time[r1] - time[r0];
        if (h > 1e-6) {
          vx = (px[r1] - px[r0]) / h;
          vy = (py[r1] - py[r0]) / h;
          vz = (pz[r1] - pz[r0]) / h;
        } else vx = vy = vz = 0;
        last = k;
      }
    }
    return n;
  };
  let tolerance = 0;
  let keys = choose(0);
  for (const tol of TOLERANCES) {
    if (keys <= o.maxKeys) break;
    tolerance = tol;
    keys = choose(tol);
  }
  if (keys > o.maxKeys) return null;

  // What each track is drawn as.
  const fr = new FigureReplay();
  const knows = fr.knowsTypes(d);
  const meshes: FigureMesh[] = [DART];
  const meshIndex = new Map<FigureMesh, number>([[DART, 0]]);
  const meshFor = (m: FigureMesh) => {
    let i = meshIndex.get(m);
    if (i === undefined) {
      i = meshes.length;
      meshes.push(m);
      meshIndex.set(m, i);
    }
    return i;
  };
  const kindMeshes = new Map<string, { full: number; coarse: number; far: number; longest: number; air: boolean }>();
  const rollCol = d.attrs.find((a) => a.kind !== 'category' && /^roll$/i.test(a.name.trim()));
  const roll = rollCol ? (rollCol.data as Float32Array) : null;

  const trackData = new Uint32Array(persons * TRACK_U32);
  const f32 = new Float32Array(trackData.buffer);
  const keysA = new Float32Array(keys * KEY_F32);
  const keysB = new Uint32Array(keys);
  const keyRow = new Int32Array(keys);
  const personOf = new Int32Array(persons);
  const trackOf = new Int32Array(persons).fill(-1);
  const meshTracks = new Uint32Array(0x10000);
  const q: [number, number, number, number] = [0, 0, 0, 1];
  let tracks = 0;
  let key = 0;
  for (let p = 0; p < persons; p++) {
    const a = start[p];
    const b = start[p + 1];
    if (a >= b) continue;
    if (d.personShared && d.personShared[p]) continue;
    const first = key;
    for (let k = a; k < b; k++) {
      if (!keep[k]) continue;
      const r = rows[k];
      const o4 = key * KEY_F32;
      keysA[o4] = px[r];
      keysA[o4 + 1] = py[r];
      keysA[o4 + 2] = pz[r];
      keysA[o4 + 3] = time[r];
      keyRow[key] = r;
      if (d.yaw) {
        const rl = roll ? (roll[r] * Math.PI) / 180 : 0;
        quatOfFrame(poseFrame({ x: 0, y: 0, z: 0, yaw: Math.PI - d.yaw[r], pitch: d.pitch ? d.pitch[r] || 0 : 0, roll: Number.isFinite(rl) ? rl : 0 }), q);
        // The same hemisphere as the key before, so the shader's slerp takes the short arc.
        if (key > first) {
          const pb = keysB[key - 1];
          const s8 = (v: number) => ((v & 0xff) << 24) >> 24;
          const dot = s8(pb) * q[0] + s8(pb >>> 8) * q[1] + s8(pb >>> 16) * q[2] + s8(pb >>> 24) * q[3];
          if (dot < 0) for (let i = 0; i < 4; i++) q[i] = -q[i];
        }
        keysB[key] = packQuat(q);
      }
      key++;
    }
    if (key === first) continue;
    // The figure, from the track's first own row.
    const row = rows[a];
    let kind = fr.kindOf(d, row) ?? (knows ? null : 'soldier');
    let km = kind ? kindMeshes.get(kind) : undefined;
    if (kind && !km) {
      const t = fr.templateOf(kind);
      if (t) {
        const full = meshFor(meshOf(t));
        const c = t.coarse?.();
        const coarse = c ? meshFor(meshOf(c)) : full;
        const fa = t.far?.();
        const far = fa ? meshFor(meshOf(fa)) : coarse;
        km = { full, coarse, far, longest: Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.1), air: t.anchor === 'centre' };
        kindMeshes.set(kind, km);
      } else kind = null;
    }
    const team = d.personTeam ? d.personTeam[p] : 0;
    const [cr, cg, cb] = teamMemberColor(team, d.personSlot ? d.personSlot[p] : p, d.teamSizes ? d.teamSizes[team] : persons);
    const o8 = tracks * TRACK_U32;
    trackData[o8] = first;
    trackData[o8 + 1] = key - first;
    trackData[o8 + 2] = rgba8(cr, cg, cb);
    trackData[o8 + 3] = km ? (km.full | (km.coarse << 16)) >>> 0 : 0;
    f32[o8 + 4] = km ? km.longest : 1;
    trackData[o8 + 5] = (km && km.air ? FLAG_AIR : 0) | (d.yaw ? FLAG_ATTITUDE : 0);
    trackData[o8 + 6] = km ? km.far : 0;
    if (km) for (const m of new Set([km.full, km.coarse, km.far])) meshTracks[m]++;
    meshTracks[0]++;
    personOf[tracks] = p;
    trackOf[p] = tracks;
    tracks++;
  }
  return {
    dataset: d,
    tracks,
    trackData: trackData.subarray(0, Math.max(1, tracks) * TRACK_U32),
    keysA,
    keysB,
    keyRow,
    keys,
    meshes,
    meshTracks: meshTracks.slice(0, meshes.length),
    personOf: personOf.subarray(0, tracks),
    trackOf,
    units,
    tolerance,
    samples,
    bytes: tracks * TRACK_U32 * 4 + keys * (KEY_F32 * 4 + 4),
    buildMs: performance.now() - t0,
  };
}
