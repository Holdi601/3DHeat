/**
 * What the GPU tracks hand the GPU besides the store's own arrays, the same
 * for every backend that places them (the WebGPU renderer's `webgpu/tracks.ts`
 * and the native viewport's `native/nativeTracks.ts`): the per-mesh runs of
 * instances with their indirect draw arguments, and the place shader's
 * 192-byte uniform (`U` in `shader.ts`), lane for lane.
 */

import { DART_MESHES } from '../symbols/darts';
import { visWords } from './visibility';
import type { GpuTrackStore } from './store';
import type { GpuTracksParams } from '../types';

/** Uniform bytes (`U` in `PLACE_WGSL`). */
export const TRACKS_UNIFORM_BYTES = 192;
/** Pixels across a death's marker. */
export const MARKER_PX = 9;

export interface TrackRuns {
  /** Per mesh: the first instance of its run, and how many it holds. */
  runFirst: Uint32Array;
  runRoom: Uint32Array;
  /** The `runs` binding: (first, room) a mesh, then the glyphs' run. */
  runsData: Uint32Array;
  /** The indirect draws' arguments as each frame starts: a mesh's vertex count, no instances; then the glyphs' quad. */
  argsInit: Uint32Array;
  /** Where the glyphs' run starts, and every instance there is room for. */
  glyphFirst: number;
  total: number;
}

/**
 * A run per mesh: the dart's holds every track of its domain; a figure's as many
 * as it has tracks, within the triangle budget. After the meshes' runs, the
 * glyphs' (`symbols/`): one at most a track.
 */
export function trackRuns(s: GpuTrackStore, triangleBudget: number): TrackRuns {
  const M = s.meshes.length;
  const runFirst = new Uint32Array(M);
  const runRoom = new Uint32Array(M);
  let total = 0;
  for (let m = 0; m < M; m++) {
    const tris = s.meshes[m].count / 3;
    runRoom[m] = m < DART_MESHES ? s.meshTracks[m] : Math.min(s.meshTracks[m], Math.floor(triangleBudget / Math.max(1, tris)));
    runFirst[m] = total;
    total += runRoom[m];
  }
  const glyphRoom = s.tracks;
  const runsData = new Uint32Array((M + 1) * 2);
  runsData[M * 2] = total;
  runsData[M * 2 + 1] = glyphRoom;
  const glyphFirst = total;
  total += glyphRoom;
  for (let m = 0; m < M; m++) {
    runsData[m * 2] = runFirst[m];
    runsData[m * 2 + 1] = runRoom[m];
  }
  const argsInit = new Uint32Array((M + 1) * 4);
  for (let m = 0; m < M; m++) argsInit[m * 4] = s.meshes[m].count;
  argsInit[M * 4] = 6;
  return { runFirst, runRoom, runsData, argsInit, glyphFirst, total };
}

/** What the backend holds that the uniform depends on. */
export interface TracksUniformRoom {
  /** Trail vertices there is room for (0: no trails written), and the most segments a unit. */
  trailRoom: number;
  trailSegments: number;
  /** Whether the deaths' marks are on the GPU (their pass runs). */
  marks: boolean;
}

/**
 * The place shader's uniform for a frame into `u` (`TRACKS_UNIFORM_BYTES`), as both backends
 * write it. Returns the marks' seconds (0: the marks pass does not run) and whether anything
 * draws trail lines.
 */
export function writeTracksUniform(
  u: ArrayBuffer,
  f: GpuTracksParams,
  viewProj: ArrayLike<number>,
  camera: ArrayLike<number>,
  room: TracksUniformRoom,
): { markSeconds: number; trailsOn: boolean } {
  const s = f.store;
  const fl = new Float32Array(u, 0, TRACKS_UNIFORM_BYTES / 4);
  const ui = new Uint32Array(u, 0, TRACKS_UNIFORM_BYTES / 4);
  fl.set(viewProj, 0);
  fl[16] = camera[0];
  fl[17] = camera[1];
  fl[18] = camera[2];
  fl[19] = f.t;
  fl[20] = f.focalPx;
  fl[21] = f.orthoPx;
  fl[22] = f.minPixels;
  fl[23] = f.stale;
  fl[24] = s.units;
  fl[25] = f.scale;
  fl[26] = f.fullPx;
  fl[27] = f.dartPx;
  ui[28] = s.tracks;
  ui[29] = s.meshes.length;
  ui[30] = room.trailRoom;
  ui[31] = room.trailSegments;
  fl[32] = f.trailSeconds;
  const weapons = f.weapons ?? 1.5;
  fl[33] = weapons > 0 ? weapons : -1;
  const markSeconds = room.marks ? (f.markerSeconds ?? 0) : 0;
  fl[34] = markSeconds;
  fl[35] = MARKER_PX;
  ui[36] = s.markers?.count ?? 0;
  ui[37] = f.visible ? 0 : 1;
  const drop = f.dropFloor ?? null;
  ui[38] = drop === null ? 0 : 1;
  fl[39] = drop ?? 0;
  // The playhead past what its f32 holds (2 ms at five hours: half a metre at 250 m/s), and where the aim keys start.
  fl[40] = f.t - fl[19];
  ui[41] = s.trackData.length;
  ui[42] = f.visible && f.visible.length > visWords(s) ? visWords(s) : 0;
  ui[43] = 0;
  fl[44] = f.farMode ?? 0;
  fl[45] = f.symbolThreshold ?? 36;
  fl[46] = f.symbolPx ?? 28;
  fl[47] = f.weaponDrops ? 1 : 0;
  return { markSeconds, trailsOn: f.trailSeconds > 0 || weapons > 0 || markSeconds > 0 || drop !== null };
}
