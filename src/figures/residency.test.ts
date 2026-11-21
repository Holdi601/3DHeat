import { afterEach, describe, expect, it } from "vitest";
import {
  afterPlaybackStart,
  makeResident,
  markResident,
  meshResident,
  nextToUpload,
  notePlayback,
  PLAYBACK_HOLD_MS,
  playbackStarting,
  setMeshUploader,
  uploadsWaiting,
} from "./residency";

const mesh = (id: number) => ({ id, data: new Float32Array(24), count: 1 });

describe("mesh residency", () => {
  afterEach(() => setMeshUploader(false));

  it("counts every mesh as resident at once without an uploader", () => {
    let done = 0;
    makeResident([mesh(1), mesh(2)], () => done++);
    expect(done).toBe(1);
    expect(meshResident(1)).toBe(true);
    expect(uploadsWaiting()).toBe(0);
  });

  it("says a model is here only once all its meshes are, each asked for once", () => {
    setMeshUploader(true);
    let done = 0;
    const a = mesh(11);
    const b = mesh(12);
    makeResident([a, b], () => done++);
    makeResident([b]);
    expect(uploadsWaiting()).toBe(2);
    expect(nextToUpload()).toBe(a);
    markResident(a.id, true);
    expect(done).toBe(0);
    expect(meshResident(a.id)).toBe(true);
    expect(meshResident(b.id)).toBe(false);
    expect(nextToUpload()).toBe(b);
    expect(nextToUpload()).toBeUndefined();
    markResident(b.id, true);
    expect(done).toBe(1);
    // Asked again once there: answered at once, nothing queued.
    makeResident([a, b], () => done++);
    expect(done).toBe(2);
    expect(uploadsWaiting()).toBe(0);
    // A mesh let go is asked for again.
    markResident(a.id, false);
    makeResident([a]);
    expect(nextToUpload()).toBe(a);
  });

  it("holds pack work through the start of playback, and lets it go on pausing", () => {
    const t = 1_000_000;
    let ran = 0;
    notePlayback(true, t);
    expect(playbackStarting(t + 10)).toBe(true);
    afterPlaybackStart(() => ran++, t + 10);
    notePlayback(true, t + PLAYBACK_HOLD_MS - 1);
    expect(ran).toBe(0);
    notePlayback(true, t + PLAYBACK_HOLD_MS);
    expect(ran).toBe(1);
    expect(playbackStarting(t + PLAYBACK_HOLD_MS)).toBe(false);
    afterPlaybackStart(() => ran++, t + PLAYBACK_HOLD_MS + 1);
    expect(ran).toBe(2);
    // Started again and paused within the hold: what waited goes at once.
    notePlayback(false, t + 5000);
    notePlayback(true, t + 6000);
    afterPlaybackStart(() => ran++, t + 6001);
    expect(ran).toBe(2);
    notePlayback(false, t + 6002);
    expect(ran).toBe(3);
    expect(playbackStarting(t + 6003)).toBe(false);
  });

  it("ends every wait when the uploader goes", () => {
    setMeshUploader(true);
    let done = 0;
    makeResident([mesh(21)], () => done++);
    expect(done).toBe(0);
    setMeshUploader(false);
    expect(done).toBe(1);
  });
});
