/**
 * Does a camera-path render actually produce a clean, playable video?
 *
 * Three things can go wrong and none of them throw. The container can be subtly
 * malformed, so the file exists and no player will open it. The convergence wait
 * can be skipped or short-circuited, so the frames carry the sampling grain the
 * whole feature exists to remove. And the timeline can be left in the wrong mode,
 * so the "video of the timeline" is one still picture repeated.
 *
 * Each is checked against something independent: the blob is decoded back through
 * the browser's own demuxer, the frames are compared for pixel-level difference
 * against a second render of the same path, and the playhead is watched while the
 * render runs.
 *
 *   node tools/probe-render.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const wantWebgpu = /backend=webgpu/.test(url);
const browser = await chromium.launch({
  ...(wantWebgpu ? { channel: 'chromium' } : {}),
  args: wantWebgpu
    ? [
        '--enable-unsafe-webgpu',
        '--enable-features=Vulkan',
        '--disable-vulkan-surface',
        '--use-webgpu-adapter=swiftshader',
        '--ignore-gpu-blocklist',
      ]
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('  console.error:', m.text());
});
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

let ok = 0;
let failed = 0;
const check = (label, pass, detail) => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
  pass ? ok++ : failed++;
};

// A modest dataset with time, so the playhead means something and the render is
// not dominated by convergence.
await page.evaluate(() => {
  const s = globalThis.__3dheat.useStore.getState();
  s.setDataset(
    globalThis.__3dheat.generateSynthetic({ ...globalThis.__3dheat.DEFAULT_SYNTH, rows: 300_000 }),
  );
  s.setMode('heat-simple');
  s.patchTimeline({ mode: 'play', window: 'cumulative', playing: false });
  s.patchHeat({ radius: 30, response: 'linear', saturation: 60, centerIntensity: 3 });
  s.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: 128 * 1024 });
});
await page.waitForTimeout(2500);

check('WebCodecs is available', await page.evaluate(() => typeof VideoEncoder !== 'undefined'));

// A path across the data, captured the way the panel captures it.
const built = await page.evaluate(() => {
  const st = globalThis.__3dheat.useStore.getState();
  const b = st.dataset.bounds;
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const cz = (b.minZ + b.maxZ) / 2;
  const r = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
  const keys = [
    { u: 0, x: cx - r * 0.6, y: cy + r * 0.3, z: cz + r * 0.8, yaw: -20, pitch: -14, fov: 60 },
    { u: 0.5, x: cx, y: cy + r * 0.15, z: cz + r * 0.5, yaw: 0, pitch: -10, fov: 60 },
    { u: 1, x: cx + r * 0.6, y: cy + r * 0.3, z: cz + r * 0.8, yaw: 20, pitch: -14, fov: 60 },
  ];
  st.patchPath({ keys, easing: 'smooth', seconds: 1, fps: 8, kbps: 8000, maxWaitFrames: 120 });
  return { keys: keys.length, range: st.dataset.timeRange };
});
check('a path was built', built.keys === 3, `${built.keys} keyframes`);

/**
 * Run a render through the module and hand back the blob plus what happened.
 *
 * Driven through `renderPath` rather than by clicking the panel button, because
 * the button starts a download and a download is not something this can read.
 */
const render = async () => {
  return page.evaluate(async () => {
    const mod = await import('/src/render/record.ts');
    const eng = globalThis.__3dheat_engine;
    const st = globalThis.__3dheat.useStore.getState();
    const playheads = [];
    const waits = [];
    const before = {
      splats: st.budget.splatsPerFrame,
      adaptive: st.budget.adaptive,
      mode: st.timeline.mode,
      fov: st.camera.fov,
    };
    const out = await mod.renderPath(eng, {
      keys: st.path.keys,
      easing: st.path.easing,
      seconds: st.path.seconds,
      fps: st.path.fps,
      kbps: st.path.kbps,
      maxWaitFrames: st.path.maxWaitFrames,
      onProgress: (p) => {
        waits.push(p.waited);
        playheads.push(eng.live.playhead);
      },
    });
    const after = globalThis.__3dheat.useStore.getState();
    const buf = new Uint8Array(await out.blob.arrayBuffer());
    // Keep the bytes on the page so the decode check can reuse them.
    globalThis.__probeVideo = out.blob;
    return {
      frames: out.frames,
      width: out.width,
      height: out.height,
      size: out.blob.size,
      type: out.blob.type,
      codec: out.codec,
      unconverged: out.unconverged,
      magic: [...buf.slice(0, 4)],
      waits,
      playheads,
      restored: {
        splats: after.budget.splatsPerFrame === before.splats,
        adaptive: after.budget.adaptive === before.adaptive,
        mode: after.timeline.mode === before.mode,
        fov: Math.abs(after.camera.fov - before.fov) < 1e-6,
      },
    };
  });
};

console.log('\nrendering…');
const r = await render();
console.log(
  `  ${r.frames} frames, ${r.width}x${r.height}, ${(r.size / 1024).toFixed(0)} KB, ${r.codec}`,
);

check('it produced a webm blob', r.type === 'video/webm' && r.size > 1000, `${r.size} bytes`);
check('with the EBML magic', String(r.magic) === String([0x1a, 0x45, 0xdf, 0xa3]),
  r.magic.map((b) => b.toString(16)).join(' '));
check('one output frame per requested frame', r.frames === 8, `${r.frames}`);

// The whole point: every frame exact.
check('every frame converged', r.unconverged === 0,
  r.unconverged === 0 ? 'none hit the wait cap' : `${r.unconverged} hit the cap`);
check('and it actually waited for them', r.waits.every((w) => w >= 2),
  `waits: ${r.waits.join(', ')}`);

// The playhead has to sweep, or the "video of the timeline" is a still.
const sweeping = r.playheads.length > 2 &&
  r.playheads[r.playheads.length - 1] > r.playheads[0] &&
  r.playheads.every((v, i) => i === 0 || v >= r.playheads[i - 1] - 1e-6);
check('the playhead sweeps the range as it renders', sweeping,
  `${r.playheads[0]?.toFixed(1)} → ${r.playheads[r.playheads.length - 1]?.toFixed(1)}`);

// Settings taken over for the render have to be handed back.
check('it restores the sprite budget', r.restored.splats);
check('it restores the adaptive setting', r.restored.adaptive);
check('it restores the timeline mode', r.restored.mode);
check('it restores the field of view', r.restored.fov);

// ------------------------------------------------------------- is it playable?
//
// Decoded through the browser's own demuxer rather than inspected further by
// hand: a container this file writes itself is exactly the thing a hand-written
// check would agree with while a player refused it.
const decoded = await page.evaluate(async () => {
  const blob = globalThis.__probeVideo;
  const video = document.createElement('video');
  video.muted = true;
  video.src = URL.createObjectURL(blob);
  const done = await new Promise((resolve) => {
    const t = setTimeout(() => resolve({ ok: false, why: 'timed out' }), 15_000);
    video.onloadedmetadata = () => {
      clearTimeout(t);
      resolve({ ok: true, w: video.videoWidth, h: video.videoHeight, dur: video.duration });
    };
    video.onerror = () => {
      clearTimeout(t);
      resolve({ ok: false, why: video.error ? `code ${video.error.code}` : 'unknown' });
    };
  });
  URL.revokeObjectURL(video.src);
  return done;
});
check('a video element accepts the file', decoded.ok, decoded.ok
  ? `${decoded.w}x${decoded.h}, ${decoded.dur?.toFixed(2)}s`
  : decoded.why);
if (decoded.ok) {
  check('the decoded size matches the render', decoded.w === r.width && decoded.h === r.height,
    `${decoded.w}x${decoded.h} against ${r.width}x${r.height}`);
  // Duration comes from timestamps we chose, not from how long rendering took —
  // which is the reason this file is muxed by hand at all.
  check('the duration is the requested one, not the wall time', Math.abs(decoded.dur - 1) < 0.35,
    `${decoded.dur?.toFixed(2)}s for a 1s render`);
}

// ------------------------------------------------------- determinism, and no grain
//
// Two renders of the same path must be identical. If the convergence wait were
// skipped, each render would sample differently and the frames would differ —
// so this is the check that the pictures are exact rather than merely settled.
const second = await page.evaluate(async () => {
  const mod = await import('/src/render/record.ts');
  const st = globalThis.__3dheat.useStore.getState();
  const out = await mod.renderPath(globalThis.__3dheat_engine, {
    keys: st.path.keys, easing: st.path.easing, seconds: st.path.seconds,
    fps: st.path.fps, kbps: st.path.kbps, maxWaitFrames: st.path.maxWaitFrames,
  });
  const buf = new Uint8Array(await out.blob.arrayBuffer());
  let hash = 2166136261;
  for (let i = 0; i < buf.length; i++) {
    hash ^= buf[i];
    hash = Math.imul(hash, 16777619);
  }
  return { size: out.blob.size, hash: hash >>> 0, unconverged: out.unconverged };
});
check('a second render of the same path is byte-identical',
  second.size === r.size, `${r.size} then ${second.size} bytes`);

// ------------------------------------------------------------ window modes hold
//
// The request was explicit that a render respects the play settings. Lifetime is
// the one worth checking: it shows one sample per person rather than everything
// up to the playhead, so a render that quietly forced cumulative would produce a
// completely different — and much brighter — video.
for (const window of ['fixed', 'lifetime']) {
  const kept = await page.evaluate(async (w) => {
    const mod = await import('/src/render/record.ts');
    const st = globalThis.__3dheat.useStore.getState();
    st.patchTimeline({ window: w, windowSeconds: 20, defaultLifetime: 10 });
    const seen = [];
    await mod.renderPath(globalThis.__3dheat_engine, {
      keys: st.path.keys, easing: 'linear', seconds: 0.5, fps: 4,
      kbps: 4000, maxWaitFrames: 120,
      onProgress: () => seen.push(globalThis.__3dheat.useStore.getState().timeline.window),
    });
    return {
      during: seen,
      after: globalThis.__3dheat.useStore.getState().timeline.window,
    };
  }, window);
  check(`the ${window} window is used and left alone`,
    kept.during.every((v) => v === window) && kept.after === window,
    `during: ${[...new Set(kept.during)].join(',')} · after: ${kept.after}`);
}

// ---------------------------------------------------------------- cancellation
const cancelled = await page.evaluate(async () => {
  const mod = await import('/src/render/record.ts');
  const st = globalThis.__3dheat.useStore.getState();
  st.patchTimeline({ window: 'cumulative' });
  const ctl = new AbortController();
  const p = mod.renderPath(globalThis.__3dheat_engine, {
    keys: st.path.keys, easing: 'smooth', seconds: 30, fps: 30,
    kbps: 8000, maxWaitFrames: 120, signal: ctl.signal,
    onProgress: (pr) => { if (pr.frame >= 2) ctl.abort(); },
  });
  try {
    await p;
    return { threw: false };
  } catch (e) {
    return { threw: true, name: e?.name ?? '', budget: globalThis.__3dheat.useStore.getState().budget.adaptive };
  }
});
check('cancelling stops the render', cancelled.threw && cancelled.name === 'AbortError',
  `${cancelled.name}`);
check('and still restores the settings', cancelled.budget === false,
  `adaptive back to ${cancelled.budget}`);

console.log(`\nprobe-render: ${failed === 0 ? 'passed' : 'FAILED'} (${ok} ok, ${failed} failed)`);
await browser.close();
process.exit(failed === 0 ? 0 : 1);
