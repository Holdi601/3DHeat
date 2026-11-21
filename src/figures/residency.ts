/**
 * Figure meshes put on the GPU ahead of being drawn, a few megabytes a frame.
 *
 * A pack model (`figurepack.ts`) arrives whole from a worker, its full, coarse
 * and far meshes megabytes each; uploaded in the frame a figure first drew it,
 * a recording whose sixty models came in while it played held frames for
 * tenths of a second. Here they wait their turn: the renderer that draws
 * figures (`render/webgpu/figures.ts`) takes a slice of them each frame, and a
 * model's figure is drawn as its stand-in until all three of its meshes are
 * there, then as the model from one frame on.
 *
 * Without a renderer that uploads this way (WebGL2, tests, workers) every mesh
 * counts as resident at once, as before.
 */

import type { FigureMesh } from "./instances";

let uploader = false;
const queue: FigureMesh[] = [];
const queued = new Set<number>();
const resident = new Set<number>();
let waits: { meshes: FigureMesh[]; done: () => void }[] = [];

/** A renderer that uploads meshes a slice a frame starts (true) or stops (false) taking them; stopped, every wait ends. */
export function setMeshUploader(on: boolean): void {
  uploader = on;
  if (on) return;
  queue.length = 0;
  queued.clear();
  resident.clear();
  const w = waits;
  waits = [];
  for (const x of w) x.done();
}

/** Asks for `meshes` to be put on the GPU ahead of their first draw; `done` once all of them are. */
export function makeResident(meshes: FigureMesh[], done?: () => void): void {
  if (!uploader) {
    done?.();
    return;
  }
  for (const m of meshes) {
    if (resident.has(m.id) || queued.has(m.id)) continue;
    queued.add(m.id);
    queue.push(m);
  }
  if (!done) return;
  if (meshes.every((m) => resident.has(m.id))) done();
  else waits.push({ meshes, done });
}

/** The next mesh asked for ahead of drawing, for the uploader (it says `markResident` once it is there). */
export function nextToUpload(): FigureMesh | undefined {
  for (;;) {
    const m = queue.shift();
    if (!m) return undefined;
    queued.delete(m.id);
    if (!resident.has(m.id)) return m;
  }
}

/** Meshes still waiting their turn. */
export function uploadsWaiting(): number {
  return queue.length;
}

/** The uploader has put a mesh on the GPU (true), or let it go (false). */
export function markResident(id: number, on: boolean): void {
  if (!on) {
    resident.delete(id);
    return;
  }
  resident.add(id);
  if (!waits.length) return;
  const ready = waits.filter((w) => w.meshes.every((m) => resident.has(m.id)));
  if (!ready.length) return;
  waits = waits.filter((w) => !ready.includes(w));
  for (const w of ready) w.done();
}

/**
 * How long after playback starts pack work waits (models asked of the worker,
 * meshes put on the GPU ahead of their draw), ms: the start of playback is
 * the busiest stretch of a recording (tracks built, figures first placed), and
 * sixty models arriving into it still cost ten frames over 20 ms.
 */
export const PLAYBACK_HOLD_MS = 2000;
let holdUntil = 0;
let wasPlaying = false;
let held: (() => void)[] = [];

/** The engine's frame: whether the recording plays, at `now` (ms, the frame's clock). */
export function notePlayback(playing: boolean, now: number): void {
  if (playing && !wasPlaying) holdUntil = now + PLAYBACK_HOLD_MS;
  else if (!playing) holdUntil = 0;
  wasPlaying = playing;
  if (held.length && now >= holdUntil) {
    const go = held;
    held = [];
    for (const f of go) f();
  }
}

/** Whether playback started less than `PLAYBACK_HOLD_MS` ago. */
export function playbackStarting(now: number = performance.now()): boolean {
  return now < holdUntil;
}

/** Runs `f` now, or once the start of playback is over (`PLAYBACK_HOLD_MS`). */
export function afterPlaybackStart(
  f: () => void,
  now: number = performance.now(),
): void {
  if (playbackStarting(now)) held.push(f);
  else f();
}

/** Whether a mesh is on the GPU, or there is no uploader to wait for. */
export function meshResident(id: number): boolean {
  return !uploader || resident.has(id);
}
