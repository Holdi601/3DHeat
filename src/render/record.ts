import { playbackRange } from '../data/sessions';
import { useStore } from '../state/store';
import { poseAt, type Keyframe, type PathEasing } from './campath';
import type { Engine } from './engine';
import { muxWebM, type EncodedFrame } from './webm';
import { list, t } from '../i18n';

/**
 * Render a camera path to a video where every frame is fully converged.
 *
 * The reason this exists as a separate loop rather than a "record" button on
 * playback: the picture is a stochastic estimate that sharpens over successive
 * frames, so a real-time capture of a moving camera records the noise. Holding
 * still is what removes it, and holding still is exactly what a moving camera
 * cannot do — hence an offline pass that, for each output frame, parks the
 * camera and the playhead, waits for the estimate to become exact, and only then
 * takes the picture. Wall-clock time per frame is then irrelevant, which is why
 * the frames carry timestamps we choose. See `muxWebM`.
 *
 * The playhead is driven from the same normalised axis as the camera, and the
 * window settings — cumulative, fixed window, lifetime — are left exactly as the
 * timeline has them. A render is meant to be the thing you were just looking at,
 * played through and written down; changing the window semantics for it would
 * make it something else.
 */

export interface RecordOptions {
  keys: Keyframe[];
  easing: PathEasing;
  /** Output duration in seconds. */
  seconds: number;
  fps: number;
  /** Kilobits per second. */
  kbps: number;
  /**
   * Frames to wait for convergence before giving up on one output frame.
   *
   * A bound rather than a promise: a large window at a low sprite budget can need
   * hundreds of frames, and a render that silently waits forever is worse than
   * one that says which frames it could not finish.
   */
  maxWaitFrames: number;
  onProgress?: (p: RecordProgress) => void;
  signal?: AbortSignal;
}

export interface RecordProgress {
  frame: number;
  total: number;
  /** Render frames spent on convergence for the frame just finished. */
  waited: number;
  /** Output frames that hit `maxWaitFrames` without converging. */
  unconverged: number;
  bytes: number;
}

export interface RecordResult {
  blob: Blob;
  frames: number;
  width: number;
  height: number;
  unconverged: number;
  codec: string;
}

/** VP9 profile 0, level 1.0, 8-bit, then VP8 for anything that refuses it. */
const CODECS: Array<{ codec: string; container: string }> = [
  { codec: 'vp09.00.10.08', container: 'V_VP9' },
  { codec: 'vp8', container: 'V_VP8' },
];

export async function renderPath(engine: Engine, opts: RecordOptions): Promise<RecordResult> {
  if (typeof VideoEncoder === 'undefined') {
    throw new Error(t('render.record.noEncoder', { encoder: 'VideoEncoder', api: 'WebCodecs' }));
  }
  const total = Math.max(1, Math.round(opts.seconds * opts.fps));
  const frameMs = 1000 / opts.fps;

  // Size from a real capture rather than from the canvas attributes: the backends
  // render at a device-pixel size that is not necessarily the CSS size, and an
  // encoder configured to the wrong one fails on the first frame rather than at
  // configure time.
  const probe = await engine.captureFrame();
  if (!probe) throw new Error(t('render.record.noReadback'));
  const { width, height } = probe;

  let chosen: { codec: string; container: string } | null = null;
  for (const c of CODECS) {
    const cfg = { codec: c.codec, width, height, bitrate: opts.kbps * 1000, framerate: opts.fps };
    try {
      const support = await VideoEncoder.isConfigSupported(cfg);
      if (support.supported) {
        chosen = c;
        break;
      }
    } catch {
      // isConfigSupported throws on a malformed config rather than returning
      // false; either way this codec is not the one.
    }
  }
  if (!chosen) throw new Error(t('render.record.noCodec', { codecs: list(['VP9', 'VP8']) }));

  const encoded: EncodedFrame[] = [];
  let bytes = 0;
  let encodeError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk) => {
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      encoded.push({
        data,
        timeMs: chunk.timestamp / 1000,
        keyframe: chunk.type === 'key',
      });
      bytes += data.length;
    },
    error: (e) => {
      encodeError = e instanceof Error ? e : new Error(String(e));
    },
  });
  encoder.configure({
    codec: chosen.codec,
    width,
    height,
    bitrate: opts.kbps * 1000,
    framerate: opts.fps,
    latencyMode: 'quality',
  });

  // ---- take over the settings a render needs, and put them back afterwards
  //
  // The adaptive budget is the important one. It exists to protect the frame
  // rate, which is the wrong goal here: it would read every slow converging
  // frame as a reason to splat fewer rows, and fewer rows per frame means more
  // frames to converge. Left on, a heavy render slows itself down.
  const store = useStore.getState();
  const restore = {
    camera: { ...store.camera },
    budget: { ...store.budget },
    playing: store.timeline.playing,
    timelineMode: store.timeline.mode,
    playhead: engine.live.playhead,
  };
  store.setPlaying(false);
  store.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: RENDER_BUDGET });
  // Playback semantics, so the window setting means what it means on the
  // timeline. `all` would ignore the playhead entirely and render one still
  // picture repeated for the length of the video.
  if (store.timeline.mode === 'all') store.patchTimeline({ mode: 'play' });

  let unconverged = 0;
  try {
    for (let f = 0; f < total; f++) {
      if (opts.signal?.aborted) throw new DOMException(t('render.record.cancelled'), 'AbortError');
      if (encodeError) throw encodeError;

      const u = total > 1 ? f / (total - 1) : 0;
      const s = useStore.getState();

      // Camera from the path. A path with no keys leaves it where it is, which is
      // how a fixed-camera timelapse is expressed.
      const pose = poseAt(opts.keys, u, opts.easing);
      if (pose) {
        engine.camera.position.set(pose.x, pose.y, pose.z);
        engine.camera.setOrientationDegrees(pose.yaw, pose.pitch);
        if (Math.abs(s.camera.fov - pose.fov) > 1e-4) s.patchCamera({ fov: pose.fov });
      }

      // Playhead over the same axis, across whatever span the timeline is
      // showing — which is the selected session's span when one is selected.
      const range = playbackRange(s.dataset, s.mode, s.team.session);
      s.seek(range[0] + (range[1] - range[0]) * u);

      // Always force a fresh estimate, even when the camera did not move. A frame
      // that inherits the previous frame's accumulation carries a ghost of the
      // previous window, which on a lifetime or fixed window is a visible smear
      // of positions that were never simultaneous.
      engine.camera.moved = true;
      engine.invalidate(2);

      const settled = await settle(engine, opts.maxWaitFrames, opts.signal);
      const waited = settled.waited;
      if (!settled.exact) unconverged++;

      const shot = await engine.captureFrame();
      if (!shot) throw new Error(t('render.record.captureFailed'));
      const frame = new VideoFrame(shot.rgba as unknown as BufferSource, {
        format: 'RGBA',
        codedWidth: shot.width,
        codedHeight: shot.height,
        timestamp: Math.round(f * frameMs * 1000),
        duration: Math.round(frameMs * 1000),
      });
      // A keyframe at the start of every cluster's worth of output, so the result
      // is seekable rather than one long dependent chain.
      encoder.encode(frame, { keyFrame: f % Math.max(1, Math.round(opts.fps * 2)) === 0 });
      frame.close();

      opts.onProgress?.({ frame: f + 1, total, waited, unconverged, bytes });

      // Yield, so the progress readout paints and a cancel can land.
      await new Promise((r) => requestAnimationFrame(r));
    }

    await encoder.flush();
    if (encodeError) throw encodeError;
    const blob = muxWebM({ frames: encoded, width, height, frameMs, codec: chosen.container });
    return { blob, frames: total, width, height, unconverged, codec: chosen.container };
  } finally {
    try {
      encoder.close();
    } catch {
      // Already closed by an error path; nothing to do.
    }
    const s = useStore.getState();
    s.patchBudget(restore.budget);
    s.patchCamera({ fov: restore.camera.fov });
    s.patchTimeline({ mode: restore.timelineMode });
    s.seek(restore.playhead);
    s.setPlaying(restore.playing);
  }
}

/**
 * Sprite budget used while rendering: enough that a frame splats every candidate
 * row in one pass rather than estimating from a sample.
 *
 * This is the mechanism that makes a rendered frame exact, and it replaced
 * waiting for `live.converged`, which does not mean what it looks like it means
 * on a growing window. In cumulative mode the engine lays the window down as one
 * base estimate and then only adds the newly-arrived tail; if the base did not
 * fit in a single frame it stays as noisy as it was laid down — the sampler never
 * gets a second pass at it — while `converged` reads true because the *tail* is
 * complete. Waiting was therefore both unnecessary and ineffective: measured, the
 * first frames of a render "converged" in two frames while still carrying a
 * quarter of the sample noise, and no amount of waiting removed it.
 *
 * Sized to the draw plan's own ceiling. The backends carry 16,384 block slots of
 * `SAMPLE_BLOCK` rows each, and a plan past that has its extra chunks dropped for
 * the frame, so asking for more than the plan can hold would quietly lose rows
 * rather than draw them.
 */
const RENDER_BUDGET = 64 * 1024 * 1024;

/**
 * Render one output frame's worth of picture, and say whether it came out exact.
 *
 * The fast path is one frame: with `RENDER_BUDGET` every candidate row is
 * submitted, so `splats >= candidates` and there is nothing left to add. The
 * accumulating fallback is for a window larger than a single frame can hold —
 * which for a sliding or lifetime window does genuinely converge, and which for
 * a cumulative window cannot, so those frames are reported rather than waited on
 * forever.
 */
async function settle(
  engine: Engine,
  maxFrames: number,
  signal?: AbortSignal,
): Promise<{ waited: number; exact: boolean }> {
  const tick = async () => {
    await new Promise((r) => requestAnimationFrame(r));
    if (signal?.aborted) throw new DOMException(t('render.record.cancelled'), 'AbortError');
  };
  // Two ticks before reading the stats: they describe the frame that has just
  // rendered, and the first tick may land before the engine's own.
  await tick();
  await tick();
  let waited = 2;
  const exactInOne = () =>
    engine.live.candidates > 0 && engine.live.splats >= engine.live.candidates;
  if (exactInOne()) return { waited, exact: true };

  while (waited < maxFrames) {
    engine.invalidate(2);
    await tick();
    waited++;
    if (exactInOne()) return { waited, exact: true };
    // Only meaningful where the engine actually accumulates — see above.
    if (engine.live.convergeFrames > 1 && engine.live.accumFrames >= engine.live.convergeFrames) {
      return { waited, exact: true };
    }
  }
  return { waited, exact: false };
}
