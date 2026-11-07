/**
 * Headless smoke test.
 *
 * Exists because the failure that matters most here is a shader that doesn't
 * compile or a framebuffer that comes back incomplete — both of which produce a
 * silently black canvas, not a build error. This drives the real app in a real GL
 * context, loads real Parquet through the real worker, fails on any console
 * error, and asserts the canvas actually has data-coloured pixels in it.
 *
 * Runs against SwiftShader (software GL) so it needs no display and no GPU. That
 * makes it a correctness check, never a performance one.
 *
 *   node tools/smoke.mjs [url]
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/';
const OUT = 'tools/.smoke';
const REPO = resolve(import.meta.dirname, '..');
mkdirSync(OUT, { recursive: true });

/** Small real parquet files the dev server can serve, as URL paths. */
function findSmallParquet() {
  const out = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/movement\.parquet$/i.test(name) && statSync(p).size > 0 && statSync(p).size < 5e6) {
        out.push('/' + relative(REPO, p).split('\\').join('/'));
      }
    }
  };
  walk(join(REPO, 'TestData'));
  return out.sort();
}

// Both backends run on software rasterisers here, so this is a correctness
// harness only — never a performance measurement.
//
// WebGPU additionally needs the full Chromium channel: the default
// `chromium_headless_shell` build does not expose an adapter at all, however the
// flags are set. Probe with `node tools/probe-webgpu.mjs` if this stops working.
const WANT_WEBGPU = /backend=webgpu/.test(url) || process.env.SMOKE_WEBGPU === '1';
// The two flag sets are mutually exclusive: forcing ANGLE/SwiftShader for WebGL
// also suppresses the Vulkan path WebGPU needs, so an adapter is never handed out.
//
// SwiftShader rather than the real GPU even on a machine that has one, which is
// not just a portability default. Headless Chromium composites a hardware-backed
// canvas outside the path `page.screenshot()` reads, so every pixel assertion in
// this suite comes back as an empty canvas: measured here on an RTX 5080, forcing
// `--use-angle=d3d11` turned 24 failures into 56, of which 30 were "canvas looks
// blank" on a canvas that was drawing perfectly well. The software rasteriser is
// the only one whose output this harness can actually read.
const browser = await chromium.launch({
  ...(WANT_WEBGPU ? { channel: 'chromium' } : {}),
  args: WANT_WEBGPU
    ? [
        '--enable-unsafe-webgpu',
        '--enable-features=Vulkan',
        '--disable-vulkan-surface',
        '--use-webgpu-adapter=swiftshader',
        '--ignore-gpu-blocklist',
      ]
    : [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--enable-webgl',
        '--ignore-gpu-blocklist',
      ],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const errors = [];
const logs = [];
/** Anything Vite said, kept apart: it is how a mid-run reload identifies itself. */
const viteNotes = [];
page.on('console', (m) => {
  const text = `[${m.type()}] ${m.text()}`;
  logs.push(text);
  if (m.type() === 'error') errors.push(text);
  if (/^\[vite\]/.test(m.text())) viteNotes.push(m.text());
});
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

// A page that restarts underneath the run invalidates everything after it, and
// says so in a way that reads like a rendering bug: `page.evaluate` fails with
// "Execution context was destroyed, most likely because of a navigation", then
// the tests after it fail on `__3dheat` being undefined because the app has not
// finished mounting again. Chased once as an intermittent WebGPU crash; it was
// the dev server sending a full reload after a source file changed mid-run. Now
// it is detected and named.
let restarted = null;
let booted = false;
page.on('crash', () => {
  restarted ??= 'the renderer process crashed';
});
page.on('framenavigated', (f) => {
  // `booted` skips the initial load; only a navigation after it is a restart.
  if (booted && f === page.mainFrame()) restarted ??= `the page navigated to ${f.url()}`;
});

let failed = 0;
let passed = 0;
const step = async (name, fn) => {
  if (restarted) {
    console.log(`\nABORT before "${name}": ${restarted}.`);
    console.log('Every result after a restart is measuring a different page, so the run stops here.');
    if (viteNotes.length) {
      console.log(`Vite said: ${viteNotes.slice(-3).join(' | ')}`);
      console.log('That is HMR — a source file changed while the run was in flight. Re-run untouched.');
    }
    console.log(`\nsmoke: ABORTED (${passed} ok, ${failed} failed before the restart)`);
    await browser.close();
    process.exit(2);
  }
  try {
    const r = await fn();
    if (r === SKIP) {
      console.log(`  skip ${name}`);
      return null;
    }
    passed++;
    console.log(`  ok   ${name}${r ? ` — ${r}` : ''}`);
    return r;
  } catch (e) {
    failed++;
    console.log(`  FAIL ${name} — ${e.message}`);
    return null;
  }
};
const SKIP = Symbol('skip');

const setState = (fn, arg) => page.evaluate(fn, arg);
const store = () => page.evaluate(() => globalThis.__3dheat.useStore.getState());
const live = () => page.evaluate(() => ({ ...globalThis.__3dheat_engineLive }));

console.log(`smoke: ${url}\n`);
// `domcontentloaded` rather than `networkidle`: the dev server keeps an HMR
// socket open, so "idle" is not a state this page reliably reaches.
// Serve an inert stand-in for Vite's HMR client.
//
// That client keeps a WebSocket to the dev server and reloads the page whenever
// it thinks the connection dropped. Both things happen during a run here: a
// multi-million-row upload on a software rasteriser blocks the main thread long
// enough for the socket to be given up on ("server connection lost. Polling for
// restart..."), and editing any source file while a run is in flight sends a
// real full reload. Either way the page restarts mid-suite and the results after
// it are meaningless. The suite never wants hot updates, so the client is
// replaced with the two functions the transformed modules actually call.
//
// `updateStyle` has to do its real job — several tests click panel controls, and
// an unstyled page has no layout to click.
const VITE_CLIENT_STUB = `
const styles = new Map();
export function updateStyle(id, content) {
  let el = styles.get(id);
  if (!el) {
    el = document.createElement('style');
    el.setAttribute('data-vite-dev-id', id);
    document.head.appendChild(el);
    styles.set(id, el);
  }
  el.textContent = content;
}
export function removeStyle(id) {
  styles.get(id)?.remove();
  styles.delete(id);
}
export function createHotContext() {
  const noop = () => {};
  return {
    accept: noop, acceptExports: noop, acceptDeps: noop, dispose: noop,
    prune: noop, decline: noop, invalidate: noop, on: noop, off: noop,
    send: noop, data: {},
  };
}
export function injectQuery(url) { return url; }
export class ErrorOverlay extends HTMLElement {}
`;
await page.route('**/@vite/client', (route) =>
  route.fulfill({ status: 200, contentType: 'text/javascript', body: VITE_CLIENT_STUB }),
);

await page.goto(url, { waitUntil: 'domcontentloaded' });
booted = true;

// ---------------------------------------------------------------- foundation

await step('renderer initialises', async () => {
  // Backend creation is asynchronous (WebGPU adapter request), so poll rather
  // than reading once and racing it.
  const deadline = Date.now() + 15000;
  let backend = 'none';
  while (Date.now() < deadline) {
    backend =
      (await page.evaluate(() => globalThis.__3dheat?.useStore.getState().stats.backend)) ?? 'none';
    if (backend && backend !== 'none') break;
    // A short timeout matters: without one this waits 30s for an element that
    // is absent in the healthy case, and burns the whole polling budget.
    const fatal = await page
      .locator('.fatal pre')
      .textContent({ timeout: 200 })
      .catch(() => null);
    if (fatal) throw new Error(`initialisation failed: ${fatal}`);
    await page.waitForTimeout(200);
  }
  if (!backend || backend === 'none') throw new Error('backend never initialised');
  const requested = /backend=(webgpu|webgl2)/.exec(url)?.[1];
  if (requested && backend !== requested) {
    throw new Error(`asked for ${requested} but got ${backend}`);
  }
  return backend;
});

await step('the CPU rasteriser is reported as such', async () => {
  // This suite runs on SwiftShader by design, which makes it the one place the
  // software-rendering banner can be checked against a real software renderer
  // rather than a stubbed string. The unit tests cover the classifier; this
  // covers the wiring — that the renderer name reaches the store, is classified,
  // and surfaces where someone would actually see it.
  //
  // Asserted in the positive here precisely because it must stay silent
  // everywhere else: if this check ever passes on hardware, the banner is
  // telling people with working GPUs that their setup is broken.
  // Polled, like the backend above. The name arrives with the budgets, which
  // wait on an asynchronous host-memory probe - measured at 57 ms after the
  // backend reports ready - so a single read straight after that races it and
  // fails on a healthy page about as often as not.
  let gpuName = null;
  const deadline = Date.now() + 5000;
  while (!gpuName && Date.now() < deadline) {
    gpuName = await page.evaluate(
      () => globalThis.__3dheat?.useStore.getState().budgets.gpuName ?? null,
    );
    if (!gpuName) await page.waitForTimeout(50);
  }
  if (!gpuName) throw new Error('no renderer name reached the store');
  const banner = page.locator('[data-testid="software-rendering-warning"]');
  if ((await banner.count()) === 0) {
    throw new Error(`software renderer ${gpuName} did not raise the banner`);
  }
  const text = await banner.first().innerText();
  if (!/graphics acceleration/i.test(text)) {
    throw new Error(`banner does not say how to fix it: ${text.replace(/\s+/g, ' ')}`);
  }
  return gpuName.slice(0, 48);
});

await step('empty state is shown with no dataset', async () => {
  const visible = await page.locator('.empty-state').isVisible();
  if (!visible) throw new Error('empty state missing');
  return 'prompts for a dataset';
});

// ------------------------------------------------------------- synthetic data

await step('synthetic dataset loads', async () => {
  await page.evaluate(() => globalThis.__3dheat.load(300_000));
  await page.waitForTimeout(1200);
  const s = await store();
  if (!s.dataset || s.dataset.count === 0) throw new Error('no dataset');
  if (!s.dataset.lifetime) throw new Error('lifetime not computed');
  return `${s.dataset.count} rows, ${s.dataset.teamLabels.length} teams`;
});

await step('calibration produces a visible default', async () => {
  const s = await store();
  if (!(s.heat.radius > 0)) throw new Error(`radius ${s.heat.radius}`);
  if (!(s.heat.saturation > 0)) throw new Error(`saturation ${s.heat.saturation}`);
  return `radius ${s.heat.radius.toFixed(1)}m, saturation ${s.heat.saturation.toFixed(1)}`;
});

// ------------------------------------------------------------------- rendering

const shot = async (label) => {
  // A generous timeout, because a slow frame here is the app working as asked.
  // Playwright waits for the page to settle before it captures, and with every
  // row drawn on every frame — see `RenderBudget.exact` — a ten-million-row
  // scene under software rendering takes seconds per frame. The default thirty
  // seconds expired mid-capture and reported it as a failure of the upload path
  // it was standing next to.
  const png = await page.locator('canvas').screenshot({ timeout: 180_000 });
  writeFileSync(`${OUT}/${label}.png`, png);
  return analyse(page);
};

for (const mode of ['heat-simple', 'heat-difference', 'heat-teams', 'heat-lines', 'team']) {
  await step(`mode ${mode} draws`, async () => {
    await setState((m) => globalThis.__3dheat.useStore.getState().setMode(m), mode);
    await page.waitForTimeout(1400);
    const stats = await shot(mode);
    if (stats.distinct < 4) {
      throw new Error(`canvas looks blank (${stats.distinct} distinct colours)`);
    }
    return `${stats.distinct} colours, ${stats.nonBg}% non-background`;
  });
}

await step('teams mode colours by group rather than by the ramp', async () => {
  // The proof that the hue comes from the accumulated group colour and not from
  // the LUT: with the boost at zero every mixture collapses onto the neutral axis,
  // so the field goes grey. A picture that stays coloured is a picture still being
  // ramped, whatever the mode button says. `probe-teams.mjs` checks that the hues
  // are the *right* ones; this only has to notice that the path is live.
  const spread = async () => {
    await page.waitForTimeout(1400);
    const t = await tone(page);
    return t;
  };
  await setState(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setMode('heat-teams');
    s.patchHeat({ teamBoost: 2 });
  });
  const coloured = await spread();
  await setState(() => globalThis.__3dheat.useStore.getState().patchHeat({ teamBoost: 0 }));
  const grey = await spread();
  await setState(() => globalThis.__3dheat.useStore.getState().patchHeat({ teamBoost: 1.4 }));
  // Warm and cool are counted by channel dominance, so a neutral field has almost
  // none of either while a group-coloured one has plenty.
  const before = coloured.warm + coloured.cool;
  const after = grey.warm + grey.cool;
  if (before < 20) throw new Error(`teams mode drew no hue at all (${before}px)`);
  if (!(after < before * 0.5)) {
    throw new Error(`boost 0 did not neutralise: ${before}px -> ${after}px`);
  }
  return `${before}px hued at boost 2, ${after}px at boost 0`;
});

await step('difference mode produces warm and cool heat', async () => {
  await setState(() => globalThis.__3dheat.useStore.getState().setMode('heat-difference'));
  await page.waitForTimeout(1400);
  const t = await tone(page);
  // One team accumulates positive (red/orange), the other negative (blue/green).
  if (t.warm < 20 || t.cool < 20) {
    throw new Error(`expected both signs; warm=${t.warm} cool=${t.cool} px`);
  }
  return `warm ${t.warm}px, cool ${t.cool}px`;
});

// -------------------------------------------------------------------- timeline

await step('All mode ignores the playhead', async () => {
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    s.seek(0);
  });
  await page.waitForTimeout(1400);
  const stats = await shot('timeline-all');
  // Seeking to zero must not empty the view when the playhead is irrelevant.
  if (stats.nonBg < 1) throw new Error('All mode drew nothing at playhead 0');
  return `${stats.nonBg}% non-background at playhead 0`;
});

await step('Play mode at t=0 shows less than All', async () => {
  const all = await measureCoverage(page, { mode: 'all' });
  const start = await measureCoverage(page, { mode: 'play', window: 'cumulative' }, 0);
  if (!(start < all)) throw new Error(`expected less at t=0: all=${all} start=${start}`);
  return `all ${all}% vs start ${start}%`;
});

await step('cumulative window grows over the timeline', async () => {
  const quarter = await measureCoverage(page, { mode: 'play', window: 'cumulative' }, 0.25);
  const end = await measureCoverage(page, { mode: 'play', window: 'cumulative' }, 1);
  if (!(end >= quarter)) throw new Error(`expected growth: 25%=${quarter} 100%=${end}`);
  return `${quarter}% -> ${end}%`;
});

await step('fixed window shows less than cumulative', async () => {
  const cumulative = await measureCoverage(page, { mode: 'play', window: 'cumulative' }, 1);
  const fixed = await measureCoverage(
    page,
    { mode: 'play', window: 'fixed', windowSeconds: 5 },
    1,
  );
  if (!(fixed <= cumulative)) throw new Error(`fixed=${fixed} cumulative=${cumulative}`);
  return `fixed ${fixed}% vs cumulative ${cumulative}%`;
});

await step('lifetime window shows one position per person', async () => {
  const lifetime = await measureCoverage(
    page,
    { mode: 'play', window: 'lifetime', defaultLifetime: 5 },
    0.6,
  );
  const cumulative = await measureCoverage(page, { mode: 'play', window: 'cumulative' }, 0.6);
  writeFileSync(`${OUT}/timeline-lifetime.png`, await page.locator('canvas').screenshot());
  if (!(lifetime < cumulative)) {
    throw new Error(`lifetime=${lifetime} should be well under cumulative=${cumulative}`);
  }
  return `lifetime ${lifetime}% vs cumulative ${cumulative}%`;
});

await step('playback advances the playhead', async () => {
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.patchTimeline({ mode: 'play', window: 'cumulative', speed: 8 });
    s.seek(0);
    s.setPlaying(true);
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setPlaying(false));
  const scrub = await page.locator('.scrub input').inputValue();
  if (Number(scrub) <= 0) throw new Error(`playhead did not advance (${scrub})`);
  return `t=${Number(scrub).toFixed(1)}s`;
});

await step('a freshly loaded dataset is parked at the start', async () => {
  // Parked at the end, the first press of Play either snaps instantly back to the
  // beginning or does nothing at all, depending on the loop setting.
  const info = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const ds = globalThis.__3dheat.generateSynthetic({
      ...globalThis.__3dheat.DEFAULT_SYNTH,
      rows: 200_000,
    });
    s.setDataset(ds);
    await new Promise((r) => setTimeout(r, 900));
    return {
      lo: ds.timeRange[0],
      hi: ds.timeRange[1],
      engine: globalThis.__3dheat_engine.live.playhead,
      store: globalThis.__3dheat.useStore.getState().timeline.playhead,
    };
  });
  const span = info.hi - info.lo;
  if (Math.abs(info.engine - info.lo) > span * 0.01) {
    throw new Error(`engine playhead is at ${info.engine}, expected ${info.lo}`);
  }
  // The store has to agree, or the scrubber shows one thing and plays another.
  if (Math.abs(info.store - info.engine) > span * 0.01) {
    throw new Error(`store says ${info.store} but the engine is at ${info.engine}`);
  }
  const scrub = Number(await page.locator('.scrub input').inputValue());
  if (Math.abs(scrub - info.lo) > span * 0.02) {
    throw new Error(`the scrubber shows ${scrub}, expected ${info.lo}`);
  }
  return `parked at ${info.lo.toFixed(1)}s of ${span.toFixed(0)}s`;
});

await step('Play restarts after reaching the end instead of doing nothing', async () => {
  const result = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const eng = globalThis.__3dheat_engine;
    const [lo, hi] = s.dataset.timeRange;
    // Sit at the end with looping off, which is where a finished playthrough
    // leaves things.
    s.patchTimeline({ mode: 'play', window: 'cumulative', speed: 4, loop: false });
    s.seek(hi);
    await new Promise((r) => setTimeout(r, 400));
    const atEnd = eng.live.playhead;
    s.setPlaying(true);
    await new Promise((r) => setTimeout(r, 500));
    const afterPress = eng.live.playhead;
    const stillPlaying = globalThis.__3dheat.useStore.getState().timeline.playing;
    s.setPlaying(false);
    return { lo, hi, atEnd, afterPress, stillPlaying };
  });
  const span = result.hi - result.lo;
  if (Math.abs(result.atEnd - result.hi) > span * 0.02) {
    throw new Error(`seek to the end left the playhead at ${result.atEnd}`);
  }
  // It must have rewound and be advancing from near the start, not sat there.
  if (!(result.afterPress < result.lo + span * 0.5)) {
    throw new Error(`Play at the end left the playhead at ${result.afterPress}, no restart`);
  }
  if (!(result.afterPress > result.lo)) {
    throw new Error('the playhead rewound but did not advance');
  }
  if (!result.stillPlaying) throw new Error('playback stopped itself immediately after restarting');
  return `rewound from ${result.hi.toFixed(0)}s and advanced to ${result.afterPress.toFixed(1)}s`;
});

await step('looping wraps rather than stopping at the end', async () => {
  const wrapped = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const eng = globalThis.__3dheat_engine;
    const [lo, hi] = s.dataset.timeRange;
    const span = hi - lo;
    s.patchTimeline({ mode: 'play', window: 'cumulative', loop: true, speed: span / 1.5 });
    s.seek(lo + span * 0.85);
    s.setPlaying(true);
    // Sample across the wrap so a single reading cannot miss it.
    let sawLow = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 120));
      if (eng.live.playhead < lo + span * 0.4) sawLow = true;
    }
    const playing = globalThis.__3dheat.useStore.getState().timeline.playing;
    s.setPlaying(false);
    return { sawLow, playing };
  });
  if (!wrapped.sawLow) throw new Error('the playhead never wrapped back to the start');
  if (!wrapped.playing) throw new Error('looping playback stopped itself at the end');
  return 'wrapped and kept playing';
});

await step('reaching the end without loop stops and stays put', async () => {
  const res = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const eng = globalThis.__3dheat_engine;
    const [lo, hi] = s.dataset.timeRange;
    const span = hi - lo;
    s.patchTimeline({ mode: 'play', loop: false, speed: span / 0.6 });
    s.seek(lo + span * 0.8);
    s.setPlaying(true);
    await new Promise((r) => setTimeout(r, 1400));
    return {
      hi,
      span,
      playing: globalThis.__3dheat.useStore.getState().timeline.playing,
      engine: eng.live.playhead,
      store: globalThis.__3dheat.useStore.getState().timeline.playhead,
    };
  });
  if (res.playing) throw new Error('playback did not stop at the end');
  if (Math.abs(res.engine - res.hi) > res.span * 0.02) {
    throw new Error(`stopped at ${res.engine} instead of the end (${res.hi})`);
  }
  // Stopping is one of the moments the store must be resynced, otherwise the
  // scrubber snaps somewhere else the next time anything reads it.
  if (Math.abs(res.store - res.engine) > res.span * 0.02) {
    throw new Error(`store says ${res.store} but the engine stopped at ${res.engine}`);
  }
  return `stopped at the end, store in sync`;
});

await step('the scrubber follows playback again after a drag ends off-target', async () => {
  // A pointer released outside the slider never fires the element's own
  // pointerup, which used to leave the scrubber detached from playback for good.
  const slider = page.locator('.scrub input');
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    const [lo, hi] = s.dataset.timeRange;
    s.patchTimeline({ mode: 'play', loop: true, speed: (hi - lo) / 12 });
    s.seek(lo);
    s.setPlaying(false);
  });
  await page.waitForTimeout(300);

  const box = await slider.boundingBox();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2, { steps: 4 });
  // Release far away, over the canvas, which is the case that used to stick.
  await page.mouse.move(box.x + box.width * 0.3, box.y - 220, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(200);

  const before = Number(await slider.inputValue());
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setPlaying(true));
  await page.waitForTimeout(900);
  const after = Number(await slider.inputValue());
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setPlaying(false));
  if (!(after > before)) {
    throw new Error(`the scrubber stayed at ${before} while playing (now ${after})`);
  }
  return `resumed tracking: ${before.toFixed(1)}s -> ${after.toFixed(1)}s`;
});

// ---------------------------------------------------------- live shader params

await step('heat sliders take effect without a reload', async () => {
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.patchTimeline({ mode: 'all' });
    s.patchHeat({ radius: s.heat.radius * 4, centerIntensity: 2 });
  });
  await page.waitForTimeout(1200);
  const big = await analyse(page);
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.patchHeat({ radius: s.heat.radius / 16 });
  });
  await page.waitForTimeout(1200);
  const small = await analyse(page);
  if (!(big.nonBg > small.nonBg)) {
    throw new Error(`radius had no effect: big=${big.nonBg}% small=${small.nonBg}%`);
  }
  return `${big.nonBg}% at 4x radius vs ${small.nonBg}% at 0.25x`;
});

await step('saturation changes colour without restarting convergence', async () => {
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.patchHeat({ radius: s.dataset ? (s.dataset.bounds.maxX - s.dataset.bounds.minX) / 120 : 10 });
  });
  await page.waitForTimeout(1500);
  const before = await tone(page);
  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchHeat({ saturation: 0.5 }),
  );
  await page.waitForTimeout(600);
  const after = await tone(page);
  if (before.warm === after.warm && before.bright === after.bright) {
    throw new Error('saturation had no visible effect');
  }
  return `bright px ${before.bright} -> ${after.bright}`;
});

await step('team visibility toggles remove heat', async () => {
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setMode('heat-simple');
    s.patchHeat({ saturation: 24 });
  });
  await page.waitForTimeout(1200);
  const before = (await analyse(page)).nonBg;
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    (s.dataset?.teamLabels ?? []).forEach((_, i) => {
      if (i > 0) s.toggleTeam(i, false);
    });
  });
  await page.waitForTimeout(1400);
  const after = (await analyse(page)).nonBg;
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    (s.dataset?.teamLabels ?? []).forEach((_, i) => s.toggleTeam(i, true));
  });
  if (!(after < before)) throw new Error(`hiding teams did not reduce heat: ${before}% -> ${after}%`);
  return `${before}% -> ${after}% with one team`;
});

// ------------------------------------------------------------- real parquet

const realFiles = findSmallParquet();
await step('real parquet loads through the worker', async () => {
  if (realFiles.length === 0) return SKIP;
  const info = await page.evaluate((urls) => globalThis.__3dheat.loadUrls(urls), realFiles);
  await page.waitForTimeout(1500);
  if (!info || info.rows === 0) throw new Error('no rows loaded');
  if (info.mapping.x !== 'X' || info.mapping.z !== 'Z') {
    throw new Error(`unexpected auto-mapping: ${JSON.stringify(info.mapping)}`);
  }
  if (!info.hasTime) throw new Error('time column not detected');
  if (!info.hasLifetime) throw new Error('lifetime not computed');
  writeFileSync(`${OUT}/real-heat.png`, await page.locator('canvas').screenshot());
  return `${info.rows} rows, ${info.entities} entities, ${info.groups} groups from ${realFiles.length} files`;
});

await step('real data renders in all three modes', async () => {
  if (realFiles.length === 0) return SKIP;
  const results = [];
  for (const mode of ['heat-simple', 'heat-difference', 'heat-teams', 'heat-lines', 'team']) {
    await setState((m) => globalThis.__3dheat.useStore.getState().setMode(m), mode);
    await page.waitForTimeout(1400);
    const stats = await shot(`real-${mode}`);
    if (stats.distinct < 4) throw new Error(`${mode} looks blank`);
    results.push(`${mode} ${stats.nonBg}%`);
  }
  return results.join(', ');
});

await step('category filter removes rows on the GPU', async () => {
  if (realFiles.length === 0) return SKIP;
  const info = await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    const cat = (s.dataset?.attrs ?? []).find(
      (a) => a.kind === 'category' && (a.categories?.length ?? 0) > 1,
    );
    return cat ? { name: cat.name, count: cat.categories.length } : null;
  });
  if (!info) return SKIP;

  // Pin the budget for the duration. This check is about filters, and coverage
  // is sensitive to the heat buffer's resolution — an upscaled blob covers a
  // slightly different number of pixels than a full-resolution one — so a
  // controller still adjusting itself from an earlier check moves the number
  // being compared. It reported a 0.6% difference between two pictures that were
  // otherwise identical, which reads as a filter that failed to clear.
  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchBudget({ adaptive: false, heatScale: 1 }),
  );

  await page.waitForTimeout(1400);
  const before = (await analyse(page)).nonBg;
  const res = await page.evaluate(() => globalThis.__3dheat_engine.live.heatScale);

  // Allow exactly one category; coverage must fall.
  await page.evaluate(
    (name) =>
      globalThis.__3dheat.useStore
        .getState()
        .setFilters([{ kind: 'categories', column: name, allowed: [0] }]),
    info.name,
  );
  await page.waitForTimeout(1400);
  const after = (await analyse(page)).nonBg;

  // And clearing it must restore the original picture.
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setFilters([]));
  await page.waitForTimeout(1400);
  const restored = (await analyse(page)).nonBg;

  if (!(after < before)) {
    throw new Error(`filter on ${info.name} did not reduce coverage: ${before}% -> ${after}%`);
  }
  const resAfter = await page.evaluate(() => globalThis.__3dheat_engine.live.heatScale);
  if (Math.abs(restored - before) > 0.5) {
    throw new Error(
      `clearing the filter did not restore: ${before}% vs ${restored}% ` +
        `(heat res ${res} then ${resAfter})`,
    );
  }
  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchBudget({ adaptive: true }),
  );
  return (
    `${info.name}: ${before}% -> ${after}% (1 of ${info.count}), restored ${restored}% ` +
    `at heat res ${(resAfter * 100).toFixed(0)}%`
  );
});

await step('numeric range filter narrows the view', async () => {
  if (realFiles.length === 0) return SKIP;
  const info = await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    const num = (s.dataset?.attrs ?? []).find((a) => a.kind === 'number' && a.max > a.min);
    return num ? { name: num.name, min: num.min, max: num.max } : null;
  });
  if (!info) return SKIP;

  const withRange = async (min, max) => {
    await page.evaluate(
      (f) =>
        globalThis.__3dheat.useStore
          .getState()
          .setFilters([{ kind: 'range', column: f.name, min: f.min, max: f.max }]),
      { name: info.name, min, max },
    );
    await page.waitForTimeout(1500);
    return (await analyse(page)).nonBg;
  };

  // Hide the grid and axes first. They cover a percent or two of the frame on
  // their own, which is the same order as the heat from a few hundred rows — so
  // measuring "coverage" with them on measures mostly grid.
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    if (s.showGrid) s.toggle('showGrid');
    if (s.showAxes) s.toggle('showAxes');
    s.setFilters([]);
  });
  await page.waitForTimeout(1400);
  const before = (await analyse(page)).nonBg;

  // A range that admits nothing must clear the heat entirely. This is the
  // assertion that pins the range filter down: a quartile of a few hundred rows
  // moves coverage by less than the noise on a downsampled frame, so "it went
  // down a bit" passes even when the filter does nothing at all.
  const span = info.max - info.min;
  const empty = await withRange(info.max + span + 1, info.max + span + 2);
  const all = await withRange(info.min - span, info.max + span);
  const quarter = await withRange(info.min, info.min + span * 0.25);
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setFilters([]);
    if (!s.showGrid) s.toggle('showGrid');
    if (!s.showAxes) s.toggle('showAxes');
  });

  if (!(before > 0.3)) throw new Error(`no heat to filter in the first place (${before}%)`);
  if (!(empty < before * 0.15)) {
    throw new Error(`an empty range still drew ${empty}% of ${before}%`);
  }
  // A range admitting everything must bring the heat back. Compared against the
  // empty range rather than against the unfiltered figure: on WebGPU every
  // reading is a forced single-frame estimate, and on a few hundred rows two such
  // estimates of the same field differ by more than a tight tolerance allows.
  if (!(all > Math.max(0.3, empty * 3))) {
    throw new Error(`a full range gave ${all}%, barely above the empty range's ${empty}%`);
  }
  // And a real sub-range must land between the two.
  if (!(quarter > empty && quarter <= all * 1.3 + 0.4)) {
    throw new Error(`a quarter range gave ${quarter}%, not between ${empty}% and ${all}%`);
  }
  return `${info.name}: none ${empty}%, quarter ${quarter}%, all ${all}%`;
});

// --------------------------------------------------------------- background

await step('background map renders under the heat', async () => {
  // What the frame looks like with no map, measured rather than assumed — see the
  // assertion at the end of this step.
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    s.setLevel(null);
  });
  await page.waitForTimeout(1400);
  const baseline = (await analyse(page)).nonBg;

  const info = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    if (!s.dataset) throw new Error('no dataset');

    // Synthesise a recognisable map: a bright checkerboard, so a placement or
    // orientation bug shows up as an obviously wrong pattern.
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 ? '#c8c8c8' : '#404040';
        ctx.fillRect(x * 64, y * 64, 64, 64);
      }
    }
    const bitmap = await createImageBitmap(c);
    const { anchorsFromBounds } = await import('/src/render/level.ts');
    s.setLevel({
      kind: 'image',
      name: 'checker',
      bitmap,
      width: bitmap.width,
      height: bitmap.height,
      anchors: anchorsFromBounds(bitmap.width, bitmap.height, s.dataset.bounds, true),
      elevation: s.dataset.bounds.minY,
      opacity: 1,
      desaturate: 1,
      brightness: 0.7,
      flipZ: true,
    });
    return { w: bitmap.width, h: bitmap.height };
  });

  await page.waitForTimeout(1600);
  const stats = await shot('background-map');
  /**
   * The map must add substantial coverage over the heat alone.
   *
   * Relative to the measured no-map baseline rather than an absolute percentage.
   * The absolute form said "15% of the frame", which is not a fact about the map
   * at all — it is a fact about how much of the frame the *dataset* fills, and it
   * moved the moment the test data changed. It then failed at 14.6% on a run whose
   * very next check demonstrated the map working, by reporting 7.9% without it and
   * 14.6% with it.
   *
   * Nearly doubling the lit area is the property worth asserting, and it holds
   * whatever is in the folder.
   */
  if (!(stats.nonBg > baseline * 1.4)) {
    throw new Error(
      `map does not appear to be drawn (${stats.nonBg}% non-background, ` +
        `${baseline}% without it)`,
    );
  }
  return `${info.w}x${info.h} map, ${baseline}% -> ${stats.nonBg}% of frame`;
});

await step('map opacity and removal take effect', async () => {
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().patchLevel({ opacity: 0.1 }));
  await page.waitForTimeout(1300);
  const faint = (await analyse(page)).nonBg;
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().patchLevel({ opacity: 1 }));
  await page.waitForTimeout(1300);
  const solid = (await analyse(page)).nonBg;
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setLevel(null));
  await page.waitForTimeout(1300);
  const gone = (await analyse(page)).nonBg;
  if (!(faint < solid)) throw new Error(`opacity had no effect: ${faint}% vs ${solid}%`);
  if (!(gone < solid)) throw new Error(`removal had no effect: ${gone}% vs ${solid}%`);
  return `10% -> ${faint}%, 100% -> ${solid}%, removed -> ${gone}%`;
});

await step('degenerate map anchors do not break the frame', async () => {
  const before = await page.evaluate(() => globalThis.__3dheat.useStore.getState().stats.fps);
  await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const bitmap = await createImageBitmap(c);
    s.setLevel({
      kind: 'image',
      name: 'degenerate',
      bitmap,
      width: 64,
      height: 64,
      // Both anchors on the same pixel: no scale can be derived.
      anchors: [
        { px: 10, py: 10, worldX: 0, worldZ: 0 },
        { px: 10, py: 10, worldX: 100, worldZ: 100 },
      ],
      elevation: 0,
      opacity: 1,
      desaturate: 1,
      brightness: 1,
      flipZ: false,
    });
  });
  await page.waitForTimeout(1400);
  const stats = await analyse(page);
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setLevel(null));
  // Must still be rendering the data rather than a NaN-collapsed frame.
  if (stats.distinct < 4) throw new Error('frame collapsed with degenerate anchors');
  void before;
  return `still drawing (${stats.distinct} colours)`;
});

await step('3D level model loads, simplifies and renders', async () => {
  // The no-mesh baseline, for the same reason as the map check above: what this
  // step is about is whether the mesh reaches the screen, and an absolute
  // percentage of the frame answers a question about the dataset instead.
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    s.setLevel(null);
  });
  await page.waitForTimeout(1400);
  const baseline = (await analyse(page)).nonBg;

  const info = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    if (!s.dataset) throw new Error('no dataset');
    const b = s.dataset.bounds;

    // Build a real OBJ: a subdivided terrain patch spanning the data, with
    // enough triangles that simplification has to do something.
    const n = 60;
    const lines = [];
    const w = b.maxX - b.minX;
    const d = b.maxZ - b.minZ;
    for (let z = 0; z <= n; z++) {
      for (let x = 0; x <= n; x++) {
        const fx = b.minX + (w * x) / n;
        const fz = b.minZ + (d * z) / n;
        const h =
          b.minY +
          Math.sin((x / n) * Math.PI * 2) * Math.cos((z / n) * Math.PI * 2) * (w * 0.01);
        lines.push(`v ${fx.toFixed(3)} ${h.toFixed(3)} ${fz.toFixed(3)}`);
      }
    }
    for (let z = 0; z < n; z++) {
      for (let x = 0; x < n; x++) {
        const a = z * (n + 1) + x + 1;
        lines.push(`f ${a} ${a + 1} ${a + n + 1}`);
        lines.push(`f ${a + 1} ${a + n + 2} ${a + n + 1}`);
      }
    }
    const file = new File([lines.join('\n')], 'terrain.obj', { type: 'text/plain' });

    const { modelLoader } = await import('/src/data/modelLoader.ts');
    // An explicit target well below the source count, so the simplification
    // path is actually exercised rather than skipped as already-small.
    const m = await modelLoader.load(file, 900);
    s.setLevel({
      kind: 'model',
      name: 'terrain.obj',
      vertices: m.vertices,
      indices: m.indices,
      structureIndices: m.structureIndices,
      structureEdges: m.structureEdges,
      triangles: m.triangles,
      structureTriangles: m.structureTriangles,
      sourceTriangles: m.sourceTriangles,
      sourceStructureTriangles: m.sourceStructureTriangles,
      partNames: m.partNames,
      partClasses: m.partClasses,
      partReasons: m.partReasons,
      bounds: m.bounds,
      opacity: 1,
      desaturate: 1,
      brightness: 0.9,
      wireframe: false,
    });
    return { triangles: m.triangles, source: m.sourceTriangles, error: m.error };
  });

  await page.waitForTimeout(1700);
  const stats = await shot('background-model');
  if (info.source !== 7200) throw new Error(`expected 7200 source triangles, got ${info.source}`);
  // Must have genuinely decimated, and stayed a valid mesh doing it.
  if (!(info.triangles > 0 && info.triangles < info.source / 2)) {
    throw new Error(`expected heavy reduction from ${info.source}, got ${info.triangles}`);
  }
  if (info.error > 0.25) throw new Error(`deviation too high: ${info.error}`);
  // The mesh spans the data, so it must add substantially to the lit area.
  if (!(stats.nonBg > baseline * 1.4)) {
    throw new Error(`mesh not drawn (${stats.nonBg}% non-background, ${baseline}% without it)`);
  }
  return (
    `${info.source} -> ${info.triangles} tris, deviation ${(info.error * 100).toFixed(2)}%, ` +
    `${baseline}% -> ${stats.nonBg}% of frame`
  );
});

await step('ground and structures are split and drawn differently', async () => {
  const info = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    if (!s.dataset) throw new Error('no dataset');
    const b = s.dataset.bounds;
    const w = b.maxX - b.minX;
    const d = b.maxZ - b.minZ;

    // A named terrain grid plus named boxes standing on it, as OBJ. The names
    // are what the classifier is expected to key on.
    const lines = ['o Terrain'];
    const n = 20;
    for (let z = 0; z <= n; z++) {
      for (let x = 0; x <= n; x++) {
        lines.push(`v ${(b.minX + (w * x) / n).toFixed(2)} ${b.minY.toFixed(2)} ${(b.minZ + (d * z) / n).toFixed(2)}`);
      }
    }
    for (let z = 0; z < n; z++) {
      for (let x = 0; x < n; x++) {
        const a = z * (n + 1) + x + 1;
        lines.push(`f ${a} ${a + 1} ${a + n + 1}`);
        lines.push(`f ${a + 1} ${a + n + 2} ${a + n + 1}`);
      }
    }
    let base = (n + 1) * (n + 1);
    const size = Math.min(w, d) * 0.06;
    const height = size * 2;
    for (let i = 0; i < 6; i++) {
      lines.push(`o House_${i}`);
      const cx = b.minX + w * (0.2 + 0.1 * i);
      const cz = b.minZ + d * (0.3 + 0.07 * i);
      const y0 = b.minY;
      const y1 = b.minY + height;
      const c = [
        [cx - size, y0, cz - size], [cx + size, y0, cz - size],
        [cx + size, y0, cz + size], [cx - size, y0, cz + size],
        [cx - size, y1, cz - size], [cx + size, y1, cz - size],
        [cx + size, y1, cz + size], [cx - size, y1, cz + size],
      ];
      for (const p of c) lines.push(`v ${p[0].toFixed(2)} ${p[1].toFixed(2)} ${p[2].toFixed(2)}`);
      const q = (a, bb, cc, dd) =>
        lines.push(`f ${base + a} ${base + bb} ${base + cc}`, `f ${base + a} ${base + cc} ${base + dd}`);
      q(1, 2, 3, 4); q(5, 8, 7, 6); q(1, 5, 6, 2);
      q(2, 6, 7, 3); q(3, 7, 8, 4); q(4, 8, 5, 1);
      base += 8;
    }

    const file = new File([lines.join('\n')], 'level.obj', { type: 'text/plain' });
    const { modelLoader } = await import('/src/data/modelLoader.ts');
    const m = await modelLoader.load(file, 100_000);
    s.setLevel({
      kind: 'model',
      name: 'level.obj',
      vertices: m.vertices,
      indices: m.indices,
      structureIndices: m.structureIndices,
      structureEdges: m.structureEdges,
      triangles: m.triangles,
      structureTriangles: m.structureTriangles,
      sourceTriangles: m.sourceTriangles,
      sourceStructureTriangles: m.sourceStructureTriangles,
      partNames: m.partNames,
      partClasses: m.partClasses,
      partReasons: m.partReasons,
      bounds: m.bounds,
      opacity: 1,
      desaturate: 1,
      brightness: 0.9,
      wireframe: false,
      structureOpacity: 0.07,
      structureWireOpacity: 0.5,
      structureTint: [0.35, 0.85, 1],
      showStructureFaces: true,
      showStructureWire: true,
    });
    return {
      groundTris: m.triangles,
      structTris: m.structureTriangles,
      edges: m.structureEdges.length / 2,
      names: m.partNames,
      classes: m.partClasses,
    };
  });

  // Six houses classified as structures, terrain as ground.
  const structures = info.classes.filter((c) => c === 'structure').length;
  const grounds = info.classes.filter((c) => c === 'ground').length;
  if (grounds !== 1) throw new Error(`expected 1 ground part, got ${grounds}`);
  if (structures !== 6) throw new Error(`expected 6 structure parts, got ${structures}`);
  if (info.groundTris !== 800) throw new Error(`ground triangles ${info.groundTris}, expected 800`);
  if (info.structTris !== 72) throw new Error(`structure triangles ${info.structTris}, expected 72`);
  // A cube has 12 triangles but only 18 unique edges, not 36.
  if (info.edges !== 6 * 18) throw new Error(`expected 108 unique edges, got ${info.edges}`);

  // Now render it, and confirm the wireframe tint actually reaches the frame.
  await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const lvl = s.level;
    if (!lvl || lvl.kind !== 'model') throw new Error('level not set');
    // Amber, so it cannot be confused with the cyan default or the heat ramp.
    s.patchLevel({ structureTint: [1, 0.7, 0.1], structureWireOpacity: 1 });
  });
  await page.waitForTimeout(1600);
  const withWire = await shot('level-split');

  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchLevel({
      showStructureWire: false,
      showStructureFaces: false,
    }),
  );
  await page.waitForTimeout(1500);
  const withoutWire = await analyse(page);

  if (!(withWire.distinct > withoutWire.distinct)) {
    throw new Error(
      `structures added no visible detail: ${withWire.distinct} vs ${withoutWire.distinct} colours`,
    );
  }
  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchLevel({
      showStructureWire: true,
      showStructureFaces: true,
    }),
  );
  return `${grounds} ground / ${structures} structures, ${info.structTris} tris, ${info.edges} edges, ${withWire.distinct} vs ${withoutWire.distinct} colours`;
});

await step('level library round-trips a model', async () => {
  const result = await page.evaluate(async () => {
    const lib = await import('/src/data/levelLibrary.ts');
    const s = globalThis.__3dheat.useStore.getState();
    const lvl = s.level;
    if (!lvl || lvl.kind !== 'model') throw new Error('no model level loaded');

    const id = await lib.saveModelLevel(lvl.name, {
      vertices: lvl.vertices,
      indices: lvl.indices,
      structureIndices: lvl.structureIndices ?? new Uint32Array(0),
      structureEdges: lvl.structureEdges ?? new Uint32Array(0),
      triangles: lvl.triangles,
      sourceTriangles: lvl.sourceTriangles,
    });
    const listed = await lib.listLevels();
    const rec = await lib.loadLevel(id);
    await lib.deleteLevel(id);
    const after = await lib.listLevels();
    return {
      listedCount: listed.length,
      afterCount: after.length,
      triangles: rec?.meta.triangles ?? 0,
      vertsMatch: rec?.vertices?.length === lvl.vertices.length,
      idxMatch: rec?.indices?.length === lvl.indices.length,
      firstVertexMatch: rec?.vertices?.[0] === lvl.vertices[0],
    };
  });
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setLevel(null));
  if (!result.vertsMatch || !result.idxMatch) throw new Error('geometry did not round-trip');
  if (!result.firstVertexMatch) throw new Error('vertex data corrupted');
  if (result.afterCount !== result.listedCount - 1) throw new Error('delete did not remove it');
  return `saved, listed (${result.listedCount}), reloaded ${result.triangles} tris, deleted`;
});

// ------------------------------------------------------------------ measure

await step('ruler measures a known distance', async () => {
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    s.setLevel(null);
  });
  await page.waitForTimeout(900);

  // Drive the ruler directly with world points so the assertion is on the maths,
  // not on where a synthetic mouse event happened to land.
  const measured = await page.evaluate(() => {
    const eng = globalThis.__3dheat_engine;
    eng.measureEnabled = true;
    eng.clearMeasure();
    eng.measure.points.push({ x: 0, y: 0, z: 0 });
    eng.measure.points.push({ x: 300, y: 0, z: 400 });
    eng.measure.points.push({ x: 300, y: 0, z: 400 + 1000 });
    return { count: eng.measure.points.length };
  });
  await page.waitForTimeout(900);
  const { pathLen, straight } = await page.evaluate(async () => {
    const m = await import('/src/render/measure.ts');
    const pts = globalThis.__3dheat_engine.measure.points;
    return { pathLen: m.pathLength(pts), straight: m.distance(pts[0], pts[2]) };
  });
  // 3-4-5 triangle scaled by 100, then a 1000 leg: 500 + 1000.
  if (Math.abs(pathLen - 1500) > 0.01) throw new Error(`path length ${pathLen}, expected 1500`);
  if (Math.abs(straight - Math.hypot(300, 1400)) > 0.01) {
    throw new Error(`straight ${straight}`);
  }
  if (measured.count !== 3) throw new Error('points not recorded');

  const stats = await shot('measure');
  await page.evaluate(() => {
    globalThis.__3dheat_engine.clearMeasure();
    globalThis.__3dheat_engine.measureEnabled = false;
  });
  return `path ${pathLen.toFixed(0)}m, straight ${straight.toFixed(1)}m, ${stats.distinct} colours`;
});

await step('heat probe reads the accumulated field', async () => {
  const result = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const s = globalThis.__3dheat.useStore.getState();
    // Use the dense synthetic set: the small real files are a few hundred
    // scattered kill events, so most of the frame is legitimately empty.
    s.setDataset(
      globalThis.__3dheat.generateSynthetic({
        ...globalThis.__3dheat.DEFAULT_SYNTH,
        rows: 300_000,
      }),
    );
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    await new Promise((r) => setTimeout(r, 400));
    // Orientation first, then frame: framing uses the current view direction, so
    // this puts the camera directly above the data looking straight down.
    eng.camera.setOrientationDegrees(0, -89.9);
    eng.frameDataset();
    eng.measureEnabled = true;
    await new Promise((r) => setTimeout(r, 1600));

    // Sample a grid; the peak is what proves the field is being read, and the
    // spread proves it is a field rather than one constant.
    const canvas = document.querySelector('canvas');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    let peak = -Infinity;
    let nonZero = 0;
    let samples = 0;
    for (let iy = 1; iy < 8; iy++) {
      for (let ix = 1; ix < 8; ix++) {
        // Awaited: the WebGPU backend can only read a texture asynchronously.
        const v = await eng.probeHeat((w * ix) / 8, (h * iy) / 8);
        if (v === null) continue;
        samples++;
        if (v > peak) peak = v;
        if (v > 0) nonZero++;
      }
    }
    return { peak, nonZero, samples };
  });
  await page.evaluate(() => {
    globalThis.__3dheat_engine.measureEnabled = false;
  });
  if (result.samples === 0) throw new Error('every probe returned null');
  if (!(result.peak > 0)) throw new Error(`no positive heat found (peak ${result.peak})`);
  return `peak ${result.peak.toFixed(2)}, ${result.nonZero}/${result.samples} samples hot`;
});

// ------------------------------------------------------------- projection

await step('orthographic top-down renders and zooms', async () => {
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setDataset(
      globalThis.__3dheat.generateSynthetic({
        ...globalThis.__3dheat.DEFAULT_SYNTH,
        rows: 300_000,
      }),
    );
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    s.setLevel(null);
  });
  await page.waitForTimeout(700);

  // Perspective baseline, framed top-down.
  await page.evaluate(() => globalThis.__3dheat_engine.applyPreset('Top'));
  await page.waitForTimeout(1500);
  const persp = await analyse(page);

  await page.evaluate(() => {
    globalThis.__3dheat.useStore.getState().patchCamera({ projection: 'orthographic' });
    globalThis.__3dheat_engine.applyPreset('Top');
  });
  await page.waitForTimeout(1600);
  const ortho = await shot('ortho-top');
  if (ortho.distinct < 4) {
    throw new Error(`orthographic frame is blank (${ortho.source ?? 'canvas'})`);
  }

  // Zooming out must shrink the data's footprint on screen.
  const before = ortho.nonBg;
  await page.evaluate(() => globalThis.__3dheat_engine.camera.zoomOrtho(3));
  await page.waitForTimeout(1500);
  const zoomedOut = (await analyse(page)).nonBg;
  await page.evaluate(() => {
    globalThis.__3dheat.useStore.getState().patchCamera({ projection: 'perspective' });
  });
  if (!(zoomedOut < before)) {
    throw new Error(`ortho zoom had no effect: ${before}% -> ${zoomedOut}%`);
  }
  return `perspective ${persp.nonBg}%, ortho ${before}%, zoomed out ${zoomedOut}%`;
});

await step('isometric presets switch to a parallel projection and draw', async () => {
  const results = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const s = globalThis.__3dheat.useStore.getState();
    s.patchCamera({ projection: 'perspective' });
    await new Promise((r) => setTimeout(r, 400));
    const out = [];
    for (const name of ['Iso NE', 'Iso NW', 'Iso SE', 'Iso SW']) {
      eng.applyPreset(name);
      await new Promise((r) => setTimeout(r, 800));
      out.push({
        name,
        yaw: eng.camera.yawDegrees,
        pitch: eng.camera.pitchDegrees,
        // Both the camera and the store must agree, or the toggle shows one thing
        // and the renderer does another.
        camera: eng.camera.projection,
        store: globalThis.__3dheat.useStore.getState().camera.projection,
      });
    }
    return out;
  });

  const isoPitch = -(Math.atan(1 / Math.SQRT2) * 180) / Math.PI;
  const yaws = new Set();
  for (const r of results) {
    if (r.camera !== 'orthographic') {
      throw new Error(`${r.name} left the camera in ${r.camera}`);
    }
    if (r.store !== 'orthographic') {
      throw new Error(`${r.name} left the store saying ${r.store}`);
    }
    if (Math.abs(r.pitch - isoPitch) > 0.01) {
      throw new Error(`${r.name} pitch is ${r.pitch.toFixed(3)}, expected ${isoPitch.toFixed(3)}`);
    }
    yaws.add(Math.round(r.yaw));
  }
  if (yaws.size !== 4) throw new Error(`the four corners gave ${yaws.size} distinct yaws`);
  const stats = await analyse(page);
  if (stats.distinct < 4) throw new Error('the frame is blank in an isometric view');
  return `4 corners at ${isoPitch.toFixed(3)}°, all parallel, ${stats.nonBg}% covered`;
});

await step('switching projection keeps the subject the same size', async () => {
  // Without solving for the other projection's scale the switch is a jump cut:
  // a parallel view's frustum height has nothing to do with camera distance.
  const res = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Perspective');
    await new Promise((r) => setTimeout(r, 900));
    const measure = async () => {
      const stats = await (async () => {
        // Reuse the harness's own coverage measure via the engine's canvas.
        const c = document.createElement('canvas');
        c.width = 200;
        c.height = 125;
        const ctx = c.getContext('2d');
        if (eng.live.backend === 'webgpu') {
          const shot = await eng.captureFrame();
          if (!shot) return 0;
          let nonBg = 0;
          const step = Math.max(1, Math.floor(shot.width / 200));
          let n = 0;
          for (let y = 0; y < shot.height; y += step) {
            for (let x = 0; x < shot.width; x += step) {
              const o = (y * shot.width + x) * 4;
              n++;
              const bg =
                Math.abs(shot.rgba[o] - 22) <= 10 &&
                Math.abs(shot.rgba[o + 1] - 23) <= 10 &&
                Math.abs(shot.rgba[o + 2] - 26) <= 10;
              if (!bg) nonBg++;
            }
          }
          return (nonBg / Math.max(1, n)) * 100;
        }
        ctx.drawImage(eng.canvas, 0, 0, c.width, c.height);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let nonBg = 0;
        const n = c.width * c.height;
        for (let i = 0; i < n; i++) {
          const o = i * 4;
          const bg =
            Math.abs(d[o] - 22) <= 10 && Math.abs(d[o + 1] - 23) <= 10 && Math.abs(d[o + 2] - 26) <= 10;
          if (!bg) nonBg++;
        }
        return (nonBg / n) * 100;
      })();
      return stats;
    };
    const persp = await measure();
    eng.setProjection('orthographic');
    await new Promise((r) => setTimeout(r, 1200));
    const ortho = await measure();
    return { persp, ortho, height: eng.camera.orthoHeight };
  });

  if (!(res.persp > 0.2 && res.ortho > 0.2)) {
    throw new Error(`one projection drew nothing: perspective ${res.persp}%, parallel ${res.ortho}%`);
  }
  // Same subject at the same apparent size covers a similar share of the frame.
  // Generous, because perspective and parallel genuinely distribute it differently.
  const ratio = res.ortho / res.persp;
  if (ratio < 0.4 || ratio > 2.5) {
    throw new Error(
      `the switch changed apparent size by ${ratio.toFixed(2)}x (${res.persp}% -> ${res.ortho}%)`,
    );
  }
  return `coverage ${res.persp}% -> ${res.ortho}% (${ratio.toFixed(2)}x)`;
});

await step('returning to perspective lands back where it left', async () => {
  const res = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    eng.setProjection('perspective');
    await new Promise((r) => setTimeout(r, 600));
    eng.camera.setOrientationDegrees(-42, -19);
    eng.camera.position.set(111, 222, 333);
    eng.camera.speed = 88;
    await new Promise((r) => setTimeout(r, 400));
    const before = {
      x: eng.camera.position.x,
      y: eng.camera.position.y,
      z: eng.camera.position.z,
      yaw: eng.camera.yawDegrees,
      pitch: eng.camera.pitchDegrees,
    };

    // Go to a parallel view, wander, then come back.
    eng.setProjection('orthographic');
    await new Promise((r) => setTimeout(r, 400));
    eng.camera.setOrientationDegrees(90, -89);
    eng.camera.position.set(-9999, 9999, -9999);
    eng.camera.zoomOrtho(3);
    await new Promise((r) => setTimeout(r, 400));

    eng.setProjection('perspective');
    await new Promise((r) => setTimeout(r, 600));
    return {
      before,
      after: {
        x: eng.camera.position.x,
        y: eng.camera.position.y,
        z: eng.camera.position.z,
        yaw: eng.camera.yawDegrees,
        pitch: eng.camera.pitchDegrees,
      },
      store: globalThis.__3dheat.useStore.getState().camera.projection,
    };
  });

  const d = Math.hypot(
    res.after.x - res.before.x,
    res.after.y - res.before.y,
    res.after.z - res.before.z,
  );
  if (d > 1) throw new Error(`came back ${d.toFixed(1)} units from where it left`);
  if (Math.abs(res.after.yaw - res.before.yaw) > 0.1) {
    throw new Error(`yaw came back as ${res.after.yaw.toFixed(2)}, left at ${res.before.yaw.toFixed(2)}`);
  }
  if (res.store !== 'perspective') throw new Error(`store says ${res.store}`);
  return `returned to within ${d.toFixed(3)} units and ${Math.abs(res.after.yaw - res.before.yaw).toFixed(3)}°`;
});

await step('depth of field blurs the scene without touching the heat', async () => {
  // Two things to establish: that it blurs at all, and that the heat stays sharp.
  // The second matters because heat has no single depth — it is the sum of sprites
  // at many — so blurring it by the geometry behind it would be wrong.
  const res = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const eng = globalThis.__3dheat_engine;
    // A level gives the scene pass something with depth variation to blur.
    s.setLevel(globalThis.__3dheat.__testLevel ?? null);
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    eng.applyPreset('Perspective');
    eng.frameDataset(true);
    await new Promise((r) => setTimeout(r, 1200));

    /** Mean absolute difference between neighbouring pixels: an acutance proxy. */
    const sharpness = async () => {
      let rgba;
      let w;
      let h;
      if (eng.live.backend === 'webgpu') {
        const shot = await eng.captureFrame();
        if (!shot) return null;
        rgba = shot.rgba;
        w = shot.width;
        h = shot.height;
      } else {
        const c = document.createElement('canvas');
        c.width = eng.canvas.width;
        c.height = eng.canvas.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(eng.canvas, 0, 0);
        rgba = ctx.getImageData(0, 0, c.width, c.height).data;
        w = c.width;
        h = c.height;
      }
      let sum = 0;
      let n = 0;
      for (let y = 1; y < h - 1; y += 3) {
        for (let x = 1; x < w - 1; x += 3) {
          const o = (y * w + x) * 4;
          const r = (y * w + x + 1) * 4;
          const d = (y * w + x + w) * 4;
          sum += Math.abs(rgba[o] - rgba[r]) + Math.abs(rgba[o] - rgba[d]);
          n += 2;
        }
      }
      return sum / Math.max(1, n);
    };

    const off = await sharpness();
    // A tight focus band and a large blur, so the effect is unmistakable.
    s.patchCamera({
      dof: {
        enabled: true,
        autoFocus: true,
        focusDistance: 100,
        aperture: 0.03,
        maxBlur: 32,
      },
    });
    await new Promise((r) => setTimeout(r, 1600));
    const on = await sharpness();
    s.patchCamera({ dof: { ...s.camera.dof, enabled: false } });
    await new Promise((r) => setTimeout(r, 1200));
    const back = await sharpness();
    return { off, on, back };
  });

  if (res.off === null || res.on === null) throw new Error('could not read the frame');
  if (!(res.off > 0.05)) throw new Error(`nothing to blur: acutance ${res.off.toFixed(3)}`);
  // Blurring must reduce local contrast.
  if (!(res.on < res.off * 0.92)) {
    throw new Error(
      `depth of field did not soften the frame: acutance ${res.off.toFixed(3)} -> ${res.on.toFixed(3)}`,
    );
  }
  // And turning it off must restore it, rather than leaving the blur latched on.
  if (!(res.back > res.on * 1.03)) {
    throw new Error(`disabling it did not restore sharpness: ${res.on.toFixed(3)} -> ${res.back.toFixed(3)}`);
  }
  return `acutance ${res.off.toFixed(2)} -> ${res.on.toFixed(2)} blurred -> ${res.back.toFixed(2)} restored`;
});

await step('preset views point the camera and frame the data', async () => {
  const results = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const out = [];
    // Every preset, not a sample: each one asserts a specific angle, and a preset
    // that quietly stops framing the data is invisible until someone uses it.
    for (const name of Object.keys(globalThis.__3dheat.VIEW_PRESETS)) {
      eng.applyPreset(name);
      await new Promise((r) => setTimeout(r, 500));
      out.push({
        name,
        pitch: eng.camera.pitchDegrees,
        yaw: eng.camera.yawDegrees,
        projection: eng.camera.projection,
      });
    }
    return out;
  });

  const expected = await page.evaluate(() => globalThis.__3dheat.VIEW_PRESETS);
  for (const r of results) {
    const want = expected[r.name];
    if (Math.abs(r.pitch - want.pitch) > 0.05) {
      throw new Error(`${r.name} pitch is ${r.pitch.toFixed(3)}, expected ${want.pitch}`);
    }
    // Yaw is compared modulo a full turn, since -135 and 225 are the same view.
    const dy = Math.abs(((r.yaw - want.yaw + 540) % 360) - 180);
    if (dy > 0.05) throw new Error(`${r.name} yaw is ${r.yaw.toFixed(3)}, expected ${want.yaw}`);
    if (want.projection && r.projection !== want.projection) {
      throw new Error(`${r.name} is in ${r.projection}, expected ${want.projection}`);
    }
  }
  const stats = await analyse(page);
  if (stats.distinct < 4) throw new Error(`frame blank after preset changes (${stats.source ?? 'canvas'})`);
  return `${results.length} presets, all at their stated angle and projection`;
});

// -------------------------------------------------------- timeline playback

await step('cumulative playback builds up instead of re-estimating', async () => {
  // A cumulative window only grows, so the rows already accumulated stay visible
  // and the frame need only add the newly-visible ones. Re-estimating the whole
  // window each frame lights up a different random subset at full compensating
  // weight and lets it fade, which reads as bursts flaring and vanishing.
  const res = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel(null);
    const ds = globalThis.__3dheat.generateSynthetic({
      ...globalThis.__3dheat.DEFAULT_SYNTH,
      rows: 3_000_000,
    });
    s.setDataset(ds);
    s.setMode('heat-simple');
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Top');
    eng.frameDataset(true);
    // A small per-frame budget: with the old behaviour this is exactly when the
    // re-estimated field is noisiest.
    s.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: 128 * 1024 });
    s.patchHeat({ groundProjected: true });
    const [lo, hi] = ds.timeRange;
    s.patchTimeline({ mode: 'play', window: 'cumulative', loop: false, speed: (hi - lo) / 25 });
    s.seek(lo);
    await new Promise((r) => setTimeout(r, 900));
    s.setPlaying(true);

    const modes = [];
    const peaks = [];
    const lits = [];
    const heads = [];
    const cands = [];
    for (let i = 0; i < 14; i++) {
      await new Promise((r) => setTimeout(r, 260));
      modes.push(eng.live.accumMode);
      heads.push(eng.live.playhead);
      cands.push(eng.live.candidates);
      const raw = await eng.renderer.readHeatField(20000);
      let sum = 0;
      let lit = 0;
      if (raw) {
        for (const v of raw) {
          sum += v;
          if (v > 1e-4) lit++;
        }
      }
      peaks.push(sum);
      lits.push(lit);
    }
    const st = globalThis.__3dheat.useStore.getState();
    st.setPlaying(false);
    return { modes, peaks, lits, heads, cands, playing: st.timeline.playing, range: [lo, hi] };
  });

  const extendFrames = res.modes.filter((m) => m === 'extend').length;
  if (extendFrames < 8) {
    throw new Error(`only ${extendFrames} of ${res.modes.length} frames extended (${res.modes.join(',')})`);
  }
  // The total must climb monotonically: a cumulative window only ever gains rows,
  // so any drop means the field was thrown away and re-estimated.
  const drops = [];
  for (let i = 1; i < res.peaks.length; i++) {
    if (res.peaks[i] < res.peaks[i - 1] * 0.97) drops.push(i);
  }
  if (drops.length > 0) {
    throw new Error(
      `the accumulated total fell at ${drops.join(',')}: ${res.peaks.map((v) => v.toFixed(0)).join(' ')}`,
    );
  }
  if (!(res.peaks[res.peaks.length - 1] > res.peaks[0] * 1.5)) {
    throw new Error(
      `the field barely grew; playhead ${res.heads[0].toFixed(1)} -> ` +
        `${res.heads[res.heads.length - 1].toFixed(1)} of ${res.range[1].toFixed(0)}; ` +
        `sums ${res.peaks.map((v) => v.toFixed(0)).join(',')}; lit ${res.lits.join(',')}`,
    );
  }
  return `${extendFrames} extend frames, total grew ${(res.peaks[res.peaks.length - 1] / Math.max(1, res.peaks[0])).toFixed(1)}x monotonically`;
});

await step('pausing cumulative playback changes nothing', async () => {
  // The complaint this pins down: points continuing to arrive after a pause.
  // With the window extended exactly rather than sampled, there is nothing left
  // to arrive — so the frame at the moment of pausing is already final.
  const res = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const s = globalThis.__3dheat.useStore.getState();
    const [lo, hi] = s.dataset.timeRange;
    s.patchTimeline({ mode: 'play', window: 'cumulative', loop: false, speed: (hi - lo) / 25 });
    s.seek(lo + (hi - lo) * 0.3);
    await new Promise((r) => setTimeout(r, 900));
    s.setPlaying(true);
    await new Promise((r) => setTimeout(r, 1400));
    s.setPlaying(false);
    // Immediately after pausing, and then well after.
    const total = async () => {
      const raw = await eng.renderer.readHeatField(20000);
      let sum = 0;
      if (raw) for (const v of raw) sum += v;
      return sum;
    };
    const at0 = await total();
    await new Promise((r) => setTimeout(r, 2500));
    const at1 = await total();
    return { at0, at1, mode: eng.live.accumMode };
  });

  if (!(res.at0 > 0)) throw new Error('nothing accumulated during playback');
  const drift = Math.abs(res.at1 - res.at0) / res.at0;
  // Nothing may keep arriving, and nothing may fade away either.
  if (drift > 0.02) {
    throw new Error(
      `the field kept changing after the pause: ${res.at0.toFixed(0)} -> ${res.at1.toFixed(0)} (${(drift * 100).toFixed(1)}%)`,
    );
  }
  return `steady to ${(drift * 100).toFixed(2)}% across 2.5s paused (${res.mode})`;
});

await step('lifetime mode fades datapoints out rather than popping them', async () => {
  // Measured on the field rather than by eye: with a fade, the total heat at a
  // fixed playhead is lower than with none, because rows near the end of their
  // life contribute a fraction. Without one they contribute fully right up to the
  // frame they vanish in, which is what reads as a flicker.
  const res = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const ds = s.dataset;
    if (!ds.lifetime) return { skip: true };
    const [lo, hi] = ds.timeRange;
    s.patchTimeline({ mode: 'play', window: 'lifetime', loop: false, playing: false });
    s.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: 4 * 1024 * 1024 });
    s.seek(lo + (hi - lo) * 0.5);
    const eng = globalThis.__3dheat_engine;

    const total = async (fadeOut) => {
      globalThis.__3dheat.useStore.getState().patchTimeline({ fadeOut });
      await new Promise((r) => setTimeout(r, 1700));
      const raw = await eng.renderer.readHeatField(30000);
      let sum = 0;
      let lit = 0;
      if (raw) {
        for (const v of raw) {
          sum += v;
          if (v > 1e-4) lit++;
        }
      }
      return {
        sum,
        lit,
        candidates: eng.live.candidates,
        splats: eng.live.splats,
        mode: eng.live.accumMode,
        playhead: eng.live.playhead,
      };
    };

    const none = await total(0);
    const half = await total(0.5);
    const full = await total(1);
    return { skip: false, none, half, full, lifeGap: ds.maxLifetimeGap };
  });
  if (res.skip) return SKIP;

  if (!(res.none.sum > 0)) {
    throw new Error(
      `no heat in lifetime mode at all: candidates ${res.none.candidates}, splats ${res.none.splats}, ` +
        `mode ${res.none.mode}, playhead ${res.none.playhead.toFixed(1)}, maxLifetimeGap ${res.lifeGap}`,
    );
  }
  // More fade means less total contribution, monotonically.
  if (!(res.half.sum < res.none.sum * 0.98)) {
    throw new Error(
      `a half fade changed nothing: ${res.none.sum.toFixed(0)} -> ${res.half.sum.toFixed(0)}`,
    );
  }
  if (!(res.full.sum < res.half.sum * 0.99)) {
    throw new Error(
      `a full fade did not go further than a half one: ${res.half.sum.toFixed(0)} -> ${res.full.sum.toFixed(0)}`,
    );
  }
  // The points must still be there — fading, not culled.
  if (!(res.full.lit > res.none.lit * 0.5)) {
    throw new Error(
      `fading removed the points instead of dimming them: ${res.none.lit} lit -> ${res.full.lit}`,
    );
  }
  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchTimeline({ fadeOut: 0.4 }),
  );
  return `total ${res.none.sum.toFixed(0)} -> ${res.half.sum.toFixed(0)} -> ${res.full.sum.toFixed(0)}, ${res.full.lit} of ${res.none.lit} points still lit`;
});

// ------------------------------------------------------------- accumulation

await step('a converged view holds its brightness instead of fading', async () => {
  // The bug this pins down: accumulation used to hold a running *total* and
  // divide by the frame count at composite time. The heat target is r16float
  // wherever float32 blending is unavailable, so the total saturated at 65504
  // while the divisor kept growing — the picture faded the longer the view sat
  // still, and a moving camera looked correct because it reset every frame.
  //
  // Deliberately sized to overflow a half-float sum: a large radius and a high
  // centre intensity over millions of rows push the per-frame estimate high
  // enough that dozens of frames of it would have clipped.
  const series = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel(null);
    const ds = globalThis.__3dheat.generateSynthetic({
      ...globalThis.__3dheat.DEFAULT_SYNTH,
      rows: 4_000_000,
    });
    s.setDataset(ds);
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all', playing: false });
    // `exact: false` on purpose. This check is about the *accumulator*, and with
    // exactness on there is nothing to accumulate: the budget is raised to cover
    // every candidate row, one frame is the finished picture, and the merge path
    // this exists to test never runs. See `RenderBudget.exact`.
    s.patchBudget({
      adaptive: false,
      progressive: true,
      exact: false,
      splatsPerFrame: 256 * 1024,
    });
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Top');
    eng.frameDataset(true);
    const extent = Math.max(ds.bounds.maxX - ds.bounds.minX, ds.bounds.maxZ - ds.bounds.minZ);
    s.patchHeat({
      radius: extent / 30,
      centerIntensity: 8,
      edgeIntensity: 0,
      groundProjected: true,
      maxPixelRadius: 512,
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Sample the same pixel repeatedly as accumulation proceeds. Locate it once,
    // at the field's own peak, and never move the camera again.
    const W = eng.canvas.width;
    const H = eng.canvas.height;
    let px = W >> 1;
    let py = H >> 1;
    let best = 0;
    for (let x = 0.3; x <= 0.7; x += 0.05) {
      for (let y = 0.3; y <= 0.7; y += 0.05) {
        const cx = Math.round(W * x);
        const cy = Math.round(H * y);
        const v = await eng.probeHeat(cx, cy, 1);
        if (v !== null && v > best) {
          best = v;
          px = cx;
          py = cy;
        }
      }
    }

    const out = [];
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 400));
      out.push({
        v: (await eng.probeHeat(px, py, 1)) ?? 0,
        accum: eng.live.accumFrames,
        mode: eng.live.accumMode,
      });
    }
    return { out, best };
  });

  const vals = series.out.map((s) => s.v);
  const accums = series.out.map((s) => s.accum);
  if (!(Math.max(...vals) > 0)) {
    throw new Error(`no heat at the sampled point (accum ${accums.join(',')})`);
  }
  // Accumulation has to have actually progressed, or this proves nothing.
  if (Math.max(...accums) < 4) {
    throw new Error(`accumulation never advanced past ${Math.max(...accums)} frames`);
  }
  // The value must not trend downward as frames merge. A running mean converges,
  // so late samples sit within a modest band of early ones; a saturating sum
  // divided by a growing count decays without limit.
  const first = vals[0];
  const last = vals[vals.length - 1];
  const lowest = Math.min(...vals);
  if (!(last > first * 0.7)) {
    throw new Error(
      `faded while standing still: ${first.toFixed(1)} -> ${last.toFixed(1)} over accum ${accums.join(',')}`,
    );
  }
  if (!(lowest > first * 0.5)) {
    throw new Error(`dipped to ${lowest.toFixed(1)} from ${first.toFixed(1)} (${vals.map((v) => v.toFixed(0)).join(',')})`);
  }
  return `${first.toFixed(0)} -> ${last.toFixed(0)} across ${Math.max(...accums)} merged frames`;
});

await step('the accumulation buffer never holds more than one field', async () => {
  // Directly checks the property that keeps a half-float target from clipping:
  // however many frames are merged, the stored value stays at the scale of a
  // single estimate rather than the sum of them all.
  const res = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const s = globalThis.__3dheat.useStore.getState();
    // One frame only: the single-estimate reference.
    // `exact: false` because the whole comparison is between one partial estimate
    // and many merged ones, and with exactness on both would be the same finished
    // picture and the ratio meaningless. See `RenderBudget.exact`.
    s.patchBudget({ progressive: false, exact: false });
    await new Promise((r) => setTimeout(r, 900));
    const W = eng.canvas.width;
    const H = eng.canvas.height;
    let px = W >> 1;
    let py = H >> 1;
    let single = 0;
    for (let x = 0.3; x <= 0.7; x += 0.05) {
      for (let y = 0.3; y <= 0.7; y += 0.05) {
        const cx = Math.round(W * x);
        const cy = Math.round(H * y);
        const v = await eng.probeHeat(cx, cy, 1);
        if (v !== null && v > single) {
          single = v;
          px = cx;
          py = cy;
        }
      }
    }
    // Now let it merge many frames and read the same pixel.
    s.patchBudget({ progressive: true });
    await new Promise((r) => setTimeout(r, 4000));
    const merged = (await eng.probeHeat(px, py, 1)) ?? 0;
    return { single, merged, accum: eng.live.accumFrames };
  });

  if (!(res.single > 0 && res.merged > 0)) {
    throw new Error(`no heat to compare (single ${res.single}, merged ${res.merged})`);
  }
  if (res.accum < 4) throw new Error(`only ${res.accum} frames merged; inconclusive`);
  // A sum of N estimates would be about N times the single-frame value. A mean is
  // the same order of magnitude — allow 3x for the sampler landing differently.
  if (res.merged > res.single * 3) {
    throw new Error(
      `merging ${res.accum} frames grew the stored value ${(res.merged / res.single).toFixed(1)}x — it is summing, not averaging`,
    );
  }
  return `single ${res.single.toFixed(0)}, ${res.accum} merged ${res.merged.toFixed(0)} (${(res.merged / res.single).toFixed(2)}x)`;
});

await step('auto-exposure brings a dim field up the ramp', async () => {
  // The saturation point decides which density maps to the top of the colour
  // ramp. Derived analytically it has to assume a peak-to-mean ratio, and
  // clustered telemetry breaks that assumption badly enough that the interesting
  // part of the data can sit in the bottom quarter — which reads as "the heatmap
  // is barely there". This checks that metering the real field fixes that.
  const result = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const eng = globalThis.__3dheat_engine;
    // Deliberately over-set the saturation: everything should go nearly invisible.
    const dim = s.heat.saturation * 12;
    s.patchHeat({ saturation: dim });
    await new Promise((r) => setTimeout(r, 1600));

    const brightness = async () => {
      const c = document.createElement('canvas');
      c.width = 240;
      c.height = 150;
      const ctx = c.getContext('2d');
      let rgba;
      if (eng.live.backend === 'webgpu') {
        const shot = await eng.captureFrame();
        if (!shot) return null;
        // Stride down to the same sample count without an image decode.
        const step = Math.max(1, Math.floor(shot.width / 240));
        let lit = 0;
        let n = 0;
        for (let y = 0; y < shot.height; y += step) {
          for (let x = 0; x < shot.width; x += step) {
            const o = (y * shot.width + x) * 4;
            n++;
            if (shot.rgba[o] > 90 || shot.rgba[o + 1] > 90) lit++;
          }
        }
        return (lit / Math.max(1, n)) * 100;
      }
      ctx.drawImage(eng.canvas, 0, 0, c.width, c.height);
      rgba = ctx.getImageData(0, 0, c.width, c.height).data;
      let lit = 0;
      const n = c.width * c.height;
      for (let i = 0; i < n; i++) {
        const o = i * 4;
        if (rgba[o] > 90 || rgba[o + 1] > 90) lit++;
      }
      return (lit / n) * 100;
    };

    const before = await brightness();
    const metered = await eng.autoExpose();
    await new Promise((r) => setTimeout(r, 1600));
    const after = await brightness();
    return {
      dim,
      before,
      after,
      saturation: globalThis.__3dheat.useStore.getState().heat.saturation,
      metered,
    };
  });

  if (result.before === null || result.after === null) {
    throw new Error('could not read the frame');
  }
  if (!result.metered || result.metered.saturation === null) {
    throw new Error('auto-exposure found nothing to meter on a field that is drawing');
  }
  // Metering must have pulled the saturation well below the inflated value.
  if (!(result.saturation < result.dim * 0.5)) {
    throw new Error(
      `saturation stayed at ${result.saturation.toFixed(0)} against an inflated ${result.dim.toFixed(0)}`,
    );
  }
  // And the picture must actually have brightened.
  if (!(result.after > result.before + 0.15)) {
    throw new Error(
      `exposing did not brighten the frame: ${result.before.toFixed(2)}% -> ${result.after.toFixed(2)}% bright pixels`,
    );
  }
  return `${result.dim.toFixed(0)} -> ${result.saturation.toFixed(0)}, bright pixels ${result.before.toFixed(2)}% -> ${result.after.toFixed(2)}%`;
});

await step('auto-exposure declines to meter an empty field', async () => {
  // Metering nothing must leave the setting alone rather than driving saturation
  // to a floor and blowing the next frame out to white.
  const res = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const before = s.heat.saturation;
    // Empty the field with a near cull that excludes everything — available on any
    // dataset, unlike a column filter.
    s.patchHeat({ cullNear: 1e9 });
    // Wait for *frames*, not for wall-clock.
    //
    // 1700ms was enough until the scene grew — water, the ground's edge overlay,
    // the structure depth seal and three depth-peeling passes — at which point
    // WebGPU on SwiftShader was managing two or three frames in that window and
    // the readback was still showing heat from before the cull. The assertion was
    // right and the wait was measuring the wrong thing.
    const engine = globalThis.__3dheat_engine;
    const startFrames = engine.live.frames;
    const deadline = Date.now() + 20_000;
    while (engine.live.frames - startFrames < 6 && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 100));
    }
    const metered = await engine.autoExpose();
    const after = globalThis.__3dheat.useStore.getState().heat.saturation;
    s.patchHeat({ cullNear: 0 });
    return { skip: false, before, after, saturation: metered?.saturation ?? null };
  });
  if (res.skip) return SKIP;
  if (res.saturation !== null) {
    throw new Error(`metered ${res.saturation} from an empty field`);
  }
  if (Math.abs(res.after - res.before) > 1e-6) {
    throw new Error(`saturation changed from ${res.before} to ${res.after} with nothing lit`);
  }
  return 'left the setting alone';
});

await step('the accumulation target keeps the field inside its range', async () => {
  // Half float tops out at 65504 with 11 bits of mantissa, and a dense field
  // reaches hundreds of thousands — so on that target the splat is scaled into a
  // range the format handles and the scale is divided back out at composite. Get
  // it wrong and the hot end clips and loses its low bits, which reads as the
  // densest areas being far cooler than they are. Verified here rather than only
  // on the machines that have no float32 blending.
  // The test before this one empties the field with a cull and restores it; give
  // the restore a frame to land and the field a moment to build again.
  await page.waitForTimeout(1600);
  const res = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const st = globalThis.__3dheat.useStore.getState();
    const raw = await eng.renderer.readHeatField(40000);
    if (!raw) return { skip: true };
    let stored = 0;
    for (const v of raw) if (v > stored) stored = v;
    return {
      skip: false,
      precision: eng.renderer.heatPrecision,
      stored,
      saturation: st.heat.saturation,
      // What the composite will scale it back to.
      trueMax: stored / (eng.renderer.heatPrecision === 'f16' ? 2048 / st.heat.saturation : 1),
    };
  });
  if (res.skip) return SKIP;
  if (!(res.stored > 0)) throw new Error('nothing in the accumulation target');

  if (res.precision === 'f16') {
    // The stored value must sit inside half float's usable range, not against its
    // ceiling — clipping there is exactly the failure being guarded.
    if (res.stored > 60000) {
      throw new Error(
        `the stored field reached ${res.stored.toFixed(0)}, within clipping distance of half float's 65504`,
      );
    }
    // And it must be scaled up enough that the mantissa has bits to work with.
    if (res.stored < 8) {
      throw new Error(`the stored field is only ${res.stored.toFixed(2)}; too small to carry detail`);
    }
  }
  return `${res.precision}: stores ${res.stored.toFixed(0)} for a true peak of ${res.trueMax.toFixed(0)}`;
});

await step('an idle frame still redraws the canvas', async () => {
  // The engine skips accumulation work once converged. It must not skip the
  // final composite: a WebGL drawing buffer made without preserveDrawingBuffer
  // has undefined contents after compositing, so trusting the canvas to hold the
  // last frame works on some drivers and quietly drains the picture on others.
  const before = await live();
  await page.waitForTimeout(1200);
  const after = await live();
  const drawn = (after.frames ?? 0) - (before.frames ?? 0);
  if (after.accumMode !== 'skip') {
    // Not idle, so this says nothing either way; not a failure.
    return `not idle (${after.accumMode}), skipped`;
  }
  if (drawn < 10) {
    throw new Error(`only ${drawn} frames drawn in 1.2s while idle — the canvas is not being redrawn`);
  }
  const stats = await analyse(page);
  if (stats.distinct < 4) throw new Error('the idle frame is blank');
  return `${drawn} frames redrawn while idle, ${stats.nonBg}% covered`;
});

// ------------------------------------------------------- difference splits

await step('difference splits on a category column, not just groups', async () => {
  // Run against the real exports: they carry actual retained columns, and a
  // synthetic dataset has none, which would make this vacuous.
  if (realFiles.length === 0) return SKIP;
  const result = await page.evaluate(async (urls) => {
    await globalThis.__3dheat.loadUrls(urls);
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel(null);
    s.setMode('heat-difference');
    s.patchTimeline({ mode: 'all' });
    s.setFilters([]);
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Top');
    eng.frameDataset(true);
    const ds = globalThis.__3dheat.useStore.getState().dataset;
    // Pick the column and the two values that actually hold rows. Taking values 0
    // and 1 of whichever column happens to be first tests the noise floor: real
    // exports are full of columns where one value covers 99% of the data.
    let best = null;
    for (const a of ds.attrs) {
      if (a.kind !== 'category' || (a.categories?.length ?? 0) < 2) continue;
      const counts = new Array(a.categories.length).fill(0);
      for (let i = 0; i < ds.count; i++) counts[a.data[i]]++;
      const ranked = counts
        .map((n, i) => ({ n, i }))
        .sort((x, y) => y.n - x.n)
        .slice(0, 2);
      if (ranked.length < 2) continue;
      // Score by the smaller of the two, so both sides have something to draw.
      const score = Math.min(ranked[0].n, ranked[1].n);
      if (!best || score > best.score) {
        best = { column: a.name, values: a.categories.length, a: ranked[0].i, b: ranked[1].i, score };
      }
    }
    if (!best) return { skip: 'no usable categorical column in the real data' };
    await new Promise((r) => setTimeout(r, 1500));
    return best;
  }, realFiles);
  if (result.skip) return SKIP;

  // Split the two most populous values and check both signs show.
  await page.evaluate(
    async ({ column, a, b }) => {
      globalThis.__3dheat.useStore
        .getState()
        .setSplit({ kind: 'categories', column, positive: [a], negative: [b] });
      await new Promise((r) => setTimeout(r, 1600));
    },
    result,
  );
  const split = await tone(page);
  if (!(split.warm > 20)) throw new Error(`no positive heat on a category split (${split.warm}px)`);
  if (!(split.cool > 20)) throw new Error(`no negative heat on a category split (${split.cool}px)`);

  // Flipping the sides must swap which ramp appears; that proves the sign comes
  // from the column rather than being incidental.
  await page.evaluate(
    async ({ column, a, b }) => {
      globalThis.__3dheat.useStore
        .getState()
        .setSplit({ kind: 'categories', column, positive: [b], negative: [a] });
      await new Promise((r) => setTimeout(r, 1600));
    },
    result,
  );
  const flipped = await tone(page);
  if (!(flipped.warm > 20 && flipped.cool > 20)) {
    throw new Error(`flipping the split lost a side (warm ${flipped.warm}, cool ${flipped.cool})`);
  }
  const before = split.warm / Math.max(1, split.cool);
  const after = flipped.warm / Math.max(1, flipped.cool);
  // The two sides are rarely the same size, so the warm/cool balance has to move.
  if (Math.abs(Math.log(before / after)) < 0.05) {
    throw new Error(
      `flipping the split changed nothing (warm/cool ${before.toFixed(2)} then ${after.toFixed(2)})`,
    );
  }
  return `${result.column}: ${result.values} values, ${result.score} rows in the smaller side, warm/cool ${before.toFixed(2)} flipped to ${after.toFixed(2)}`;
});

await step('a value on neither side is left out entirely', async () => {
  // Not counted as zero — left out. That is what makes a split over two of many
  // values compare exactly those two, and it is the property that lets someone
  // compare two exports out of several without the rest muddying the result.
  const coverage = await page.evaluate(async () => {
    const ds = globalThis.__3dheat.useStore.getState().dataset;
    let best = null;
    for (const a of ds.attrs) {
      if (a.kind !== 'category' || (a.categories?.length ?? 0) < 3) continue;
      const counts = new Array(a.categories.length).fill(0);
      for (let i = 0; i < ds.count; i++) counts[a.data[i]]++;
      const ranked = counts
        .map((n, i) => ({ n, i }))
        .sort((x, y) => y.n - x.n)
        .slice(0, 3);
      if (ranked.length < 3 || ranked[2].n === 0) continue;
      const score = ranked[2].n;
      if (!best || score > best.score) {
        best = { column: a.name, values: a.categories.length, top: ranked.map((r) => r.i), score };
      }
    }
    if (!best) return { skip: true };

    return { skip: false, ...best };
  });
  if (coverage.skip) return SKIP;

  // Measured over the whole frame rather than by probing points: the heat from
  // a few hundred rows is sparse enough that a sampling grid can miss it
  // entirely, which would make a passing test a matter of luck.
  //
  // And measured as total brightness, not as a count of red pixels. The step
  // before this one leaves the exposure high enough that the densest heat
  // saturates to yellow and white, so a second value turns red pixels yellow and
  // the red count *falls* while the heat on screen grows by a quarter. Both
  // backends render that identically; the count only ever passed on WebGL2
  // because its readback is resampled, which blends the saturated pixels back
  // into red.
  const setPositive = async (positive) => {
    await page.evaluate(
      async ({ column, positive }) => {
        globalThis.__3dheat.useStore
          .getState()
          .setSplit({ kind: 'categories', column, positive, negative: [] });
        await new Promise((r) => setTimeout(r, 1700));
      },
      { column: coverage.column, positive },
    );
    return tone(page);
  };

  const one = await setPositive([coverage.top[0]]);
  const two = await setPositive([coverage.top[0], coverage.top[1]]);
  if (!(one.warm > 10)) throw new Error(`a single-value split drew almost nothing (${one.warm}px)`);
  // Two values must put more heat on screen than one, which can only be true if
  // the unselected values were excluded rather than quietly folded in: folded
  // in, the first frame would already hold them and the second would match it.
  if (!(two.mass > one.mass * 1.1)) {
    throw new Error(`adding a second value added too little heat: ${one.mass} -> ${two.mass}`);
  }
  return `${coverage.column}: heat 1 value ${one.mass}, 2 values ${two.mass}, of ${coverage.values}`;
});

await step('difference splits on a numeric range', async () => {
  const res = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const ds = s.dataset;
    const num = ds.attrs.find((a) => a.kind === 'number' && a.max > a.min);
    if (!num) return { skip: true };
    // Split at the median, not the midpoint of min and max. Real columns are
    // skewed — a duration or a score piles up at one end — so the midpoint puts
    // almost every row on one side and the other side has nothing to draw.
    const vals = Array.from(num.data.subarray(0, ds.count)).sort((a, b) => a - b);
    const mid = vals[Math.floor(vals.length / 2)];
    s.setSplit({
      kind: 'range',
      column: num.name,
      // Half-open at the median so a row cannot land on both sides.
      positive: [num.min, mid],
      negative: [mid + Number.EPSILON * Math.abs(mid) + 1e-6, num.max],
    });
    await new Promise((r) => setTimeout(r, 1700));
    return { skip: false, column: num.name, min: num.min, max: num.max, mid };
  });
  if (res.skip) return SKIP;
  const t = await tone(page);
  if (!(t.warm > 15)) throw new Error(`no positive heat on a range split (${t.warm}px)`);
  if (!(t.cool > 15)) throw new Error(`no negative heat on a range split (${t.cool}px)`);
  return `${res.column} split at its median ${res.mid.toFixed(1)}: warm ${t.warm}px, cool ${t.cool}px`;
});

await step('an unknown split column falls back to groups instead of going blank', async () => {
  await page.evaluate(async () => {
    globalThis.__3dheat.useStore
      .getState()
      .setSplit({ kind: 'categories', column: 'no such column', positive: [0], negative: [1] });
    await new Promise((r) => setTimeout(r, 1500));
  });
  const stats = await analyse(page);
  if (stats.distinct < 4) {
    throw new Error(`a stale split column blanked the frame (${stats.source ?? 'canvas'})`);
  }
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setSplit({ kind: 'teams' }));
  await page.waitForTimeout(900);
  return `still drawing (${stats.distinct} colours)`;
});

await step('two files are retained as a comparable column', async () => {
  const files = realFiles;
  if (files.length < 2) return SKIP;
  const info = await page.evaluate(async (urls) => {
    const r = await globalThis.__3dheat.loadUrls(urls);
    await new Promise((res) => setTimeout(res, 900));
    const ds = globalThis.__3dheat.useStore.getState().dataset;
    const src = ds.attrs.find((a) => a.name === 'Source file');
    return {
      rows: r.rows,
      hasSource: !!src,
      values: src?.categories ?? [],
    };
  }, files.slice(0, 2));

  if (!info.hasSource) throw new Error('loading two files did not retain the origin column');
  if (info.values.length < 2) {
    throw new Error(`the origin column has ${info.values.length} values, expected one per file`);
  }
  return `${info.rows} rows from ${info.values.length} files, comparable by origin`;
});

await step('a single file does not pay for an origin column', async () => {
  // A constant column costs 4 bytes a row to say nothing.
  const files = realFiles;
  if (files.length < 1) return SKIP;
  const has = await page.evaluate(async (url) => {
    await globalThis.__3dheat.loadUrls([url]);
    await new Promise((res) => setTimeout(res, 700));
    const ds = globalThis.__3dheat.useStore.getState().dataset;
    return ds.attrs.some((a) => a.name === 'Source file');
  }, files[0]);
  if (has) throw new Error('a single-file load retained a constant origin column');
  return 'origin column omitted';
});

// ------------------------------------------------------- sprite ramp curve

await step('the ramp curve changes what the shader draws', async () => {
  // Measured through the heat probe rather than pixels: the probe reads the
  // accumulated field itself, so it answers "did the sprite shape change" without
  // the colour ramp in the way.
  const peakWith = async (preset) =>
    page.evaluate(async (preset) => {
      const s = globalThis.__3dheat.useStore.getState();
      s.patchHeat({ useCurve: true });
      if (preset) s.setCurve(globalThis.__3dheat.CURVE_PRESETS[preset].map((p) => ({ ...p })));
      await new Promise((r) => setTimeout(r, 1400));
      const eng = globalThis.__3dheat_engine;
      // Sample a small grid and keep the largest reading, so the answer does not
      // depend on one pixel landing exactly on a hotspot.
      let peak = 0;
      for (let x = 0.3; x <= 0.7; x += 0.1) {
        for (let y = 0.3; y <= 0.7; y += 0.1) {
          const v = await eng.probeHeat(
            Math.round(eng.canvas.width * x),
            Math.round(eng.canvas.height * y),
            eng.live.accumFrames,
          );
          if (v !== null) peak = Math.max(peak, v);
        }
      }
      return peak;
    }, preset);

  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel(null);
    s.setDataset(
      globalThis.__3dheat.generateSynthetic({ ...globalThis.__3dheat.DEFAULT_SYNTH, rows: 400_000 }),
    );
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    s.patchBudget({ adaptive: false, progressive: true });
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Top');
    eng.frameDataset(true);
  });
  await page.waitForTimeout(900);

  const plateau = await peakWith('Plateau');
  const tight = await peakWith('Tight');
  if (!(plateau > 0)) throw new Error('no heat at all with the Plateau curve');
  if (!(tight > 0)) throw new Error('no heat at all with the Tight curve');
  // Plateau holds near full intensity across most of the sprite; Tight collapses
  // to a small core. Over a dense field the flatter curve must accumulate more.
  if (!(plateau > tight * 1.25)) {
    throw new Error(`Plateau ${plateau.toFixed(1)} vs Tight ${tight.toFixed(1)} — curve ignored?`);
  }
  return `Plateau ${plateau.toFixed(0)} vs Tight ${tight.toFixed(0)}`;
});

await step('the curve matches the falloff path where they agree', async () => {
  // A Linear curve and falloff = 1 with smoothing off are the same function, so
  // they must produce the same field. This is the check that catches a LUT read
  // at 1-d instead of d, or an off-by-a-texel at either end.
  const analytic = await probeCurvePeak(() =>
    globalThis.__3dheat.useStore
      .getState()
      .patchHeat({ useCurve: false, falloff: 1, smoothRamp: false }),
  );
  const curved = await probeCurvePeak(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setCurve(globalThis.__3dheat.CURVE_PRESETS.Linear.map((p) => ({ ...p })));
    s.patchHeat({ useCurve: true });
  });

  if (!(analytic.peak > 0 && curved.peak > 0)) {
    throw new Error(
      `no heat: analytic ${analytic.peak} (${analytic.why}), curved ${curved.peak} (${curved.why})`,
    );
  }
  // 12% covers half-float quantisation in the LUT plus the stochastic sampler
  // landing on a different subset between the two measurements.
  const rel = Math.abs(curved.peak - analytic.peak) / analytic.peak;
  if (rel > 0.12) {
    throw new Error(
      `linear curve gave ${curved.peak.toFixed(1)} but falloff=1 gave ${analytic.peak.toFixed(1)} (${(rel * 100).toFixed(1)}% apart)`,
    );
  }
  return `${analytic.peak.toFixed(0)} vs ${curved.peak.toFixed(0)} (${(rel * 100).toFixed(1)}% apart)`;
});

// A test comparing the total heat of a rim-weighted ramp against a centre-weighted
// one used to sit here. Its premise was wrong: the "rim weighting covers twice the
// area" argument is about the ramp's integral over a uniform field, but the check
// measured the peak of a clustered one, so the expected ratio did not follow and
// the result moved with unrelated changes. The direction the table is read in is
// established conclusively by the two tests around it — the profile walk below
// reads the actual radial shape, and the falloff comparison above matches to 0.0%,
// which a reversed lookup could not do.

await step('one sprite has the profile the curve describes', async () => {
  // The direct measurement: isolate a single sprite, find its centre, and walk
  // outward reading the accumulated field. This is the only check that sees the
  // *shape* of the ramp rather than its integral.
  //
  // One person plus the lifetime window means exactly one row is live at a time,
  // which is how the sprite gets isolated without hand-building a dataset.
  const result = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    const ds = globalThis.__3dheat.generateSynthetic({
      ...globalThis.__3dheat.DEFAULT_SYNTH,
      rows: 4000,
      teams: 1,
      playersPerTeam: 1,
    });
    s.setDataset(ds);
    s.setLevel(null);
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'play', window: 'lifetime', playing: false });
    s.seek((ds.timeRange[0] + ds.timeRange[1]) / 2);
    s.patchBudget({ adaptive: false, progressive: true });
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Top');
    eng.frameDataset(true);
    const extent = Math.max(ds.bounds.maxX - ds.bounds.minX, ds.bounds.maxZ - ds.bounds.minZ);
    s.patchHeat({
      useCurve: true,
      radius: extent / 8,
      centerIntensity: 1,
      edgeIntensity: 0,
      minPixelRadius: 0,
      maxPixelRadius: 2048,
      groundProjected: true,
    });

    const probe = (x, y) => eng.probeHeat(x, y, eng.live.accumFrames);
    const settle = () => new Promise((r) => setTimeout(r, 1500));

    // Locate the centre with a curve that peaks there, then hold the geometry
    // still so a different curve can be measured against the same pixels.
    s.setCurve(globalThis.__3dheat.CURVE_PRESETS.Linear.map((p) => ({ ...p })));
    await settle();
    let cx = 0;
    let cy = 0;
    let best = 0;
    const W = eng.canvas.width;
    const H = eng.canvas.height;
    for (let ix = 2; ix < 40; ix++) {
      for (let iy = 2; iy < 24; iy++) {
        const x = Math.round((ix / 42) * W);
        const y = Math.round((iy / 26) * H);
        const v = await probe(x, y);
        if (v !== null && v > best) {
          best = v;
          cx = x;
          cy = y;
        }
      }
    }
    if (best <= 0) return { error: 'no heat anywhere in the frame' };

    // Radial line outward. The step is sized from the sprite's own pixel radius
    // so the walk covers it whatever the framing worked out to be.
    const spriteR = Math.round(((extent / 8) / (extent * 1.05)) * H);
    const step = Math.max(2, Math.round(spriteR / 8));

    // Refine the centre at the walk's own resolution. The coarse grid above is
    // deliberately cheap and lands within a cell of the peak, which is coarser
    // than `step` — so without this the first sample sits off-centre and the
    // profile looks like it rises before it falls.
    for (const scale of [4, 2, 1]) {
      const d = Math.max(1, step * scale);
      let moved = true;
      while (moved) {
        moved = false;
        for (const [ox, oy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) {
          const x = cx + ox;
          const y = cy + oy;
          if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
          const v = await probe(x, y);
          if (v !== null && v > best + 1e-6) {
            best = v;
            cx = x;
            cy = y;
            moved = true;
          }
        }
      }
    }
    const walk = async () => {
      const out = [];
      for (let i = 0; i <= 12; i++) {
        const v = await probe(cx + i * step, cy);
        out.push(v === null ? 0 : v);
      }
      return out;
    };

    const linear = await walk();
    s.setCurve(globalThis.__3dheat.CURVE_PRESETS.Ring.map((p) => ({ ...p })));
    await settle();
    const ring = await walk();
    return { linear, ring, cx, cy, step, spriteR };
  });

  if (result.error) throw new Error(result.error);
  const { linear, ring } = result;
  const fmt = (a) => a.map((v) => v.toFixed(1)).join(' ');

  // A centre-weighted ramp must fall away from the centre. The peak is allowed to
  // sit one sample in: the true centre is sub-pixel and the walk is quantised to
  // `step`, so demanding it land exactly on sample 0 would be testing the search,
  // not the shader.
  if (!(linear[0] > 0)) throw new Error(`nothing at the located centre: ${fmt(linear)}`);
  const linPeakAt = linear.indexOf(Math.max(...linear));
  if (linPeakAt > 1) {
    throw new Error(`the linear ramp peaks ${linPeakAt} samples out, not at the centre: ${fmt(linear)}`);
  }
  // From the peak onward it must be monotonically non-increasing.
  for (let i = linPeakAt + 1; i < linear.length; i++) {
    if (linear[i] > linear[i - 1] + 0.05 * linear[linPeakAt]) {
      throw new Error(`the linear ramp rises again at sample ${i}: ${fmt(linear)}`);
    }
  }
  if (!(linear[linear.length - 1] < linear[linPeakAt] * 0.35)) {
    throw new Error(`the linear ramp did not fall off across the sprite: ${fmt(linear)}`);
  }

  // The ring must be hollow: its brightest point is off-centre and its centre is
  // well below that. Same pixels, same geometry — only the curve changed.
  const ringPeak = Math.max(...ring);
  const ringPeakAt = ring.indexOf(ringPeak);
  if (!(ringPeak > 0)) throw new Error(`the ring curve drew nothing: ${fmt(ring)}`);
  if (!(ringPeakAt > 0)) {
    throw new Error(`the ring curve still peaks at the centre: ${fmt(ring)}`);
  }
  if (!(ring[0] < ringPeak * 0.8)) {
    throw new Error(`the ring's centre (${ring[0].toFixed(1)}) is not hollow against its peak (${ringPeak.toFixed(1)}): ${fmt(ring)}`);
  }
  return `linear [${fmt(linear)}], ring peaks at ${ringPeakAt}/12 out with centre ${(ring[0] / ringPeak).toFixed(2)} of peak`;
});

await step('the curve editor is interactive and reaches the store', async () => {
  await openSection('Heat shape');
  // Switch to curve mode through the UI, the way a person would.
  const curveBtn = page.locator('.sidebar .seg button', { hasText: 'Curve' }).first();
  if ((await curveBtn.count()) === 0) throw new Error('the ramp-shape switch is missing');
  await curveBtn.click();
  await page.waitForTimeout(300);

  const editor = page.locator('[data-testid="curve-editor"]');
  if (!(await editor.isVisible())) throw new Error('the curve editor did not appear');
  // Start from a known curve — an earlier test may have left any shape at all,
  // and "drag it down" only means something if it starts up.
  await page.locator('.sidebar button', { hasText: 'Linear' }).first().click();
  await page.waitForTimeout(300);
  const before = await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().heat.curve.map((p) => p.y),
  );
  if (!(before[0] > 0.8)) throw new Error(`the Linear preset starts at y=${before[0]}, expected 1`);

  // Drag the first control point down to a quarter height.
  const box = await editor.boundingBox();
  const first = page.locator('[data-testid="curve-editor"] .curve-point').first();
  const fb = await first.boundingBox();
  await page.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2);
  await page.mouse.down();
  await page.mouse.move(fb.x + fb.width / 2, box.y + box.height * 0.75, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(400);

  const after = await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().heat.curve.map((p) => p.y),
  );
  if (!(after[0] < before[0] - 0.25)) {
    throw new Error(`dragging the point down changed y from ${before[0]} to ${after[0]}`);
  }
  // The endpoint must keep its x — only its height is editable.
  const x0 = await page.evaluate(() => globalThis.__3dheat.useStore.getState().heat.curve[0].x);
  if (x0 !== 0) throw new Error(`dragging the first point moved it off x=0 (${x0})`);

  // Double-click adds a point; the count must go up and the curve stay valid.
  const countBefore = await page.locator('[data-testid="curve-editor"] .curve-point').count();
  await editor.dblclick({ position: { x: box.width * 0.45, y: box.height * 0.5 } });
  await page.waitForTimeout(300);
  const countAfter = await page.locator('[data-testid="curve-editor"] .curve-point').count();
  if (countAfter !== countBefore + 1) {
    throw new Error(`double-click gave ${countAfter} points, expected ${countBefore + 1}`);
  }
  const xs = await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().heat.curve.map((p) => p.x),
  );
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] < xs[i - 1]) throw new Error(`points are out of order: ${xs.join(',')}`);
  }
  if (xs[0] !== 0 || xs[xs.length - 1] !== 1) {
    throw new Error(`endpoints drifted off 0 and 1: ${xs.join(',')}`);
  }

  // A preset button must replace the curve wholesale.
  await page.locator('.sidebar button', { hasText: 'Smooth' }).first().click();
  await page.waitForTimeout(300);
  const preset = await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().heat.curve.length,
  );
  if (preset !== 2) throw new Error(`the Smooth preset left ${preset} points`);

  const stats = await analyse(page);
  if (stats.distinct < 4) throw new Error('the frame went blank while editing the curve');
  return `dragged ${before[0].toFixed(2)} -> ${after[0].toFixed(2)}, added a point, preset applied`;
});

await step('leaving curve mode restores the falloff path', async () => {
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.patchHeat({ useCurve: false, falloff: 1.6, smoothRamp: true, radius: 6 });
    s.setDataset(
      globalThis.__3dheat.generateSynthetic({ ...globalThis.__3dheat.DEFAULT_SYNTH, rows: 200_000 }),
    );
    s.patchBudget({ adaptive: true });
    globalThis.__3dheat_engine.frameDataset();
  });
  await page.waitForTimeout(1400);
  const stats = await analyse(page);
  if (stats.distinct < 4) throw new Error('the frame is blank after leaving curve mode');
  return `${stats.nonBg}% of frame`;
});

// ------------------------------------------------------------------- input
//
// Everything above drives the camera through its API. This section drives it the
// way a person does — real key, mouse and wheel events through CDP, and a
// synthetic pad through the Gamepad API — because a camera that only responds to
// `applyPreset` is a screenshot generator, not a viewer.

/** Camera pose, for before/after comparison. */
const pose = () =>
  page.evaluate(() => {
    const c = globalThis.__3dheat_engine.camera;
    return {
      x: c.position.x,
      y: c.position.y,
      z: c.position.z,
      yaw: c.yawDegrees,
      pitch: c.pitchDegrees,
      speed: c.speed,
      ortho: c.orthoHeight,
      // The page's own clock, for turning a travel distance into a speed.
      t: performance.now(),
    };
  });

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

await step('the canvas takes keyboard focus', async () => {
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setDataset(
      globalThis.__3dheat.generateSynthetic({ ...globalThis.__3dheat.DEFAULT_SYNTH, rows: 200_000 }),
    );
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    s.patchCamera({ projection: 'perspective' });
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    globalThis.__3dheat_engine.frameDataset();
    // A fixed speed keeps the distances the key tests below assert on
    // predictable; framing derives one from the bounds, which drifts with the
    // dataset each earlier test happened to leave behind.
    globalThis.__3dheat.useStore.getState().patchCamera({ flySpeed: 500 });
  });
  await page.waitForTimeout(400);
  // Click the canvas so key events are not swallowed by a focused panel input.
  await page.locator('canvas').click({ position: { x: 640, y: 400 } });
  // The click starts a drag; release it so it does not colour the next test.
  await page.mouse.up();
  return 'focused';
});

// Each key is tested from a turned-about camera as well as from the default
// orientation. At yaw 0 a forward vector with the wrong X sign is
// indistinguishable from a correct one, so testing only the rest pose passes a
// camera that flies sideways the moment you turn.
for (const [yawDeg, pitchDeg, orientation] of [
  [0, -20, 'facing -Z'],
  [90, -10, 'turned 90°'],
  [-135, 15, 'turned -135°'],
]) {
  for (const [key, label, expect] of [
    ['KeyW', 'W flies forward', 'forward'],
    ['KeyS', 'S flies back', 'back'],
    ['KeyA', 'A strafes left', 'left'],
    ['KeyD', 'D strafes right', 'right'],
    ['Space', 'Space rises', 'up'],
    ['KeyQ', 'Q descends', 'down'],
  ]) {
  await step(`real keyboard, ${orientation}: ${label}`, async () => {
    await page.evaluate(
      ({ yawDeg, pitchDeg }) =>
        globalThis.__3dheat_engine.camera.setOrientationDegrees(yawDeg, pitchDeg),
      { yawDeg, pitchDeg },
    );
    await page.waitForTimeout(150);
    const before = await pose();
    await page.keyboard.down(key);
    await page.waitForTimeout(450);
    await page.keyboard.up(key);
    await page.waitForTimeout(120);
    const after = await pose();
    const moved = dist(before, after);
    if (moved < 1e-3) throw new Error(`${key} moved the camera ${moved.toExponential(2)} units`);

    // Direction, not just magnitude — a sign error would otherwise pass. Taken
    // from the *rendered* camera matrix rather than recomputed from yaw and pitch,
    // because a formula here would only prove the movement code is consistent
    // with itself. It has to be consistent with the picture.
    const fwd = await page.evaluate(() => {
      const e = globalThis.__3dheat_engine.camera.camera.matrixWorld.elements;
      const n = Math.hypot(e[8], e[9], e[10]) || 1;
      return { x: -e[8] / n, y: -e[9] / n, z: -e[10] / n };
    });
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const dz = after.z - before.z;
    if (expect === 'up' && !(dy > 0)) throw new Error(`Space moved dy=${dy}`);
    if (expect === 'down' && !(dy < 0)) throw new Error(`Q moved dy=${dy}`);
    // Colinearity, not just sign: a movement that is merely forward-ish would
    // pass a sign test while still drifting sideways on every keypress.
    const offBy = (cos) =>
      ((Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI).toFixed(1);
    if (expect === 'forward' || expect === 'back') {
      const want = expect === 'forward' ? 1 : -1;
      const cos = ((dx * fwd.x + dy * fwd.y + dz * fwd.z) / moved) * want;
      if (cos < 0.999) throw new Error(`${key} moved ${offBy(cos)}° off the view axis`);
    }
    if (expect === 'left' || expect === 'right') {
      // Right is the view direction turned 90° about world up, then levelled. The
      // movement is level too, so compare in the XZ plane only.
      const rx = -fwd.z;
      const rz = fwd.x;
      const n = Math.hypot(rx, rz) || 1;
      const want = expect === 'right' ? 1 : -1;
      const flat = Math.hypot(dx, dz) || 1;
      const cos = ((dx * (rx / n) + dz * (rz / n)) / flat) * want;
      if (cos < 0.999) throw new Error(`${key} moved ${offBy(cos)}° off the right axis`);
      if (Math.abs(dy) > moved * 0.02) {
        throw new Error(`${key} also changed height by ${dy.toFixed(2)}`);
      }
    }
    return `${moved.toFixed(1)} units`;
  });
  }
}

await step('real keyboard: Shift boosts and Alt slows the same key', async () => {
  // Speed rather than distance. The key is held for a fixed wall-clock window,
  // but how long the page really spends holding it varies by up to 3x on a
  // software rasteriser — `keyboard.down` and the pose read are themselves
  // round trips into a busy page. Distances measured over windows of 590ms and
  // 1650ms are not comparable, and this check failed once for exactly that
  // reason: a lucky plain window travelled 840 units where an unlucky one
  // travelled 240, which is the whole size of the effect being tested. Dividing
  // by the elapsed time the page itself reports puts all three conditions within
  // a fifth of their designed factors.
  const speed = async (mods) => {
    const before = await pose();
    for (const m of mods) await page.keyboard.down(m);
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(420);
    await page.keyboard.up('KeyW');
    for (const m of mods) await page.keyboard.up(m);
    await page.waitForTimeout(120);
    const after = await pose();
    // Held time, not the requested window: see above.
    const ms = Math.max(1, after.t - before.t);
    return (dist(before, after) / ms) * 1000;
  };
  const plain = await speed([]);
  const boosted = await speed(['Shift']);
  const slowed = await speed(['Alt']);
  // Designed factors are 6x and 0.15x; the margins allow for the coarse frame
  // timing the integration is made of.
  if (!(boosted > plain * 3)) {
    throw new Error(`Shift gave ${boosted.toFixed(0)}/s vs ${plain.toFixed(0)}/s`);
  }
  if (!(slowed < plain * 0.4)) {
    throw new Error(`Alt gave ${slowed.toFixed(0)}/s vs ${plain.toFixed(0)}/s`);
  }
  return `plain ${plain.toFixed(0)}/s, shift ${boosted.toFixed(0)}/s, alt ${slowed.toFixed(0)}/s`;
});

await step('real mouse drag looks around', async () => {
  const before = await pose();
  const box = await page.locator('canvas').boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  // Several small steps rather than one jump: this is what a real drag looks
  // like, and it exercises the per-event delta accumulation.
  for (let i = 1; i <= 10; i++) await page.mouse.move(cx + i * 12, cy + i * 4);
  await page.mouse.up();
  await page.waitForTimeout(250);
  const after = await pose();
  const dYaw = after.yaw - before.yaw;
  const dPitch = after.pitch - before.pitch;
  if (Math.abs(dYaw) < 0.5) throw new Error(`yaw barely moved: ${dYaw.toFixed(3)} deg`);
  if (Math.abs(dPitch) < 0.2) throw new Error(`pitch barely moved: ${dPitch.toFixed(3)} deg`);
  // Dragging right must yaw left in this convention; down must pitch down.
  if (dYaw > 0) throw new Error(`dragging right yawed the wrong way: ${dYaw.toFixed(2)}`);
  if (dPitch > 0) throw new Error(`dragging down pitched the wrong way: ${dPitch.toFixed(2)}`);
  if (dist(before, after) > 1e-6) throw new Error('looking around also moved the camera');
  return `yaw ${dYaw.toFixed(1)}°, pitch ${dPitch.toFixed(1)}°`;
});

await step('mouse movement is ignored when no button is held', async () => {
  const before = await pose();
  const box = await page.locator('canvas').boundingBox();
  for (let i = 0; i < 8; i++) {
    await page.mouse.move(box.x + 100 + i * 40, box.y + 100 + i * 30);
  }
  await page.waitForTimeout(200);
  const after = await pose();
  if (Math.abs(after.yaw - before.yaw) > 1e-6 || Math.abs(after.pitch - before.pitch) > 1e-6) {
    throw new Error('the camera followed the cursor without a button held');
  }
  return 'hover does not steer';
});

await step('real wheel tunes fly speed, and zooms in orthographic', async () => {
  const box = await page.locator('canvas').boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);

  const before = await pose();
  await page.mouse.wheel(0, -600);
  await page.waitForTimeout(200);
  const faster = await pose();
  if (!(faster.speed > before.speed * 1.2)) {
    throw new Error(`wheel up gave ${faster.speed.toFixed(1)} from ${before.speed.toFixed(1)}`);
  }
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(200);
  const restored = await pose();
  if (!(restored.speed < faster.speed * 0.9)) throw new Error('wheel down did not slow the camera');

  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchCamera({ projection: 'orthographic' }),
  );
  await page.waitForTimeout(500);
  const orthoBefore = await pose();
  await page.mouse.wheel(0, -600);
  await page.waitForTimeout(250);
  const orthoAfter = await pose();
  if (!(orthoAfter.ortho < orthoBefore.ortho * 0.95)) {
    throw new Error(`ortho wheel did not zoom: ${orthoBefore.ortho} -> ${orthoAfter.ortho}`);
  }
  if (Math.abs(orthoAfter.speed - orthoBefore.speed) > 1e-6) {
    throw new Error('ortho wheel changed fly speed instead of the frustum');
  }
  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchCamera({ projection: 'perspective' }),
  );
  await page.waitForTimeout(400);
  return `speed ${before.speed.toFixed(0)} -> ${faster.speed.toFixed(0)}, ortho zoom ok`;
});

await step('typing in a panel field does not fly the camera', async () => {
  // Open a section so there is a field to type into.
  await openSection('Camera & scene');
  const inputs = page.locator('.sidebar input[type="number"]');
  const count = await inputs.count();
  if (count === 0) return SKIP;
  const input = inputs.first();
  const before = await pose();
  await input.click();
  await input.press('KeyW');
  await page.waitForTimeout(350);
  const after = await pose();
  if (dist(before, after) > 1e-6) throw new Error('W in a text field moved the camera');
  return 'text entry is not flight control';
});

await step('flying re-renders continuously rather than showing one frame', async () => {
  // The engine skips redundant frames on purpose, so the test is that motion
  // defeats that: frames keep being produced and the picture keeps changing.
  //
  // Reframe and pick a speed relative to the data first — the wheel test above
  // leaves the camera fast enough to fly off the map in under a second, which
  // would make "the frame is blank" a statement about the test, not the engine.
  await page.evaluate(() => {
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Iso');
    eng.frameDataset(true);
    const b = globalThis.__3dheat.useStore.getState().dataset.bounds;
    const extent = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
    globalThis.__3dheat.useStore.getState().patchCamera({ flySpeed: extent / 20 });
  });
  await page.waitForTimeout(900);
  await page.locator('canvas').click({ position: { x: 400, y: 300 } });
  await page.mouse.up();

  const samples = [];
  await page.keyboard.down('KeyW');
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(300);
    samples.push({ ...(await live()), cover: (await analyse(page)).nonBg });
  }
  await page.keyboard.up('KeyW');

  const frames = samples.map((s) => s.frames ?? 0);
  const advancing = frames[frames.length - 1] - frames[0];
  if (!(advancing >= 3)) {
    throw new Error(`only ${advancing} frames in 1.2s of held W (${frames.join(',')})`);
  }
  // Accumulation must be resetting while moving, not summing a stale field.
  const accum = samples.map((s) => s.accumFrames ?? 0);
  if (!accum.some((a) => a <= 2)) {
    throw new Error(`accumulation never reset while flying (${accum.join(',')})`);
  }
  // The picture itself has to change. Frames advancing only proves the loop is
  // running; differing coverage proves the new camera pose reached the shader.
  const covers = samples.map((s) => s.cover);
  if (covers.every((c) => c < 0.2)) throw new Error(`frame blank while flying (${covers.join(',')})`);
  if (new Set(covers).size < 2) {
    throw new Error(`the frame never changed while flying (${covers.join(',')})`);
  }
  return `${advancing} frames, accum ${accum.join('/')}, coverage ${covers.join('% -> ')}%`;
});

await step('synthetic gamepad flies and looks', async () => {
  // Playwright cannot attach a real pad, so the Gamepad API is replaced. That
  // still exercises everything downstream of `navigator.getGamepads`, which is
  // the whole of the pad code path.
  await page.evaluate(() => {
    globalThis.__padState = {
      axes: [0, 0, 0, 0],
      buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0, touched: false })),
    };
    navigator.getGamepads = () => [
      {
        id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)',
        index: 0,
        connected: true,
        mapping: 'standard',
        timestamp: performance.now(),
        axes: globalThis.__padState.axes,
        buttons: globalThis.__padState.buttons,
        vibrationActuator: null,
      },
    ];
  });
  const setPad = (axes, buttons = {}) =>
    page.evaluate(
      ({ axes, buttons }) => {
        globalThis.__padState.axes = axes;
        globalThis.__padState.buttons = globalThis.__padState.buttons.map((b, i) => ({
          ...b,
          pressed: buttons[i] ? buttons[i] >= 0.5 : false,
          value: buttons[i] ?? 0,
        }));
      },
      { axes, buttons },
    );

  // Left stick forward.
  const before = await pose();
  await setPad([0, -1, 0, 0]);
  await page.waitForTimeout(500);
  await setPad([0, 0, 0, 0]);
  await page.waitForTimeout(150);
  const flown = await pose();
  if (dist(before, flown) < 1e-3) throw new Error('left stick did not move the camera');

  // Right stick look.
  await setPad([0, 0, 1, 0]);
  await page.waitForTimeout(500);
  await setPad([0, 0, 0, 0]);
  await page.waitForTimeout(150);
  const looked = await pose();
  const dYaw = looked.yaw - flown.yaw;
  if (Math.abs(dYaw) < 1) throw new Error(`right stick yawed only ${dYaw.toFixed(2)} deg`);
  if (dYaw > 0) throw new Error(`right stick yawed the wrong way: ${dYaw.toFixed(2)}`);

  // Triggers rise and fall.
  const beforeRise = await pose();
  await setPad([0, 0, 0, 0], { 7: 1 });
  await page.waitForTimeout(450);
  await setPad([0, 0, 0, 0]);
  await page.waitForTimeout(150);
  const risen = await pose();
  if (!(risen.y > beforeRise.y)) throw new Error(`right trigger gave dy=${risen.y - beforeRise.y}`);

  // Y frames the dataset, and only once per press.
  await page.evaluate(() => globalThis.__3dheat_engine.camera.position.set(1e6, 1e6, 1e6));
  await setPad([0, 0, 0, 0], { 3: 1 });
  await page.waitForTimeout(400);
  const framed = await pose();
  if (Math.abs(framed.x) > 5e5) throw new Error('Y did not frame the dataset');
  await setPad([0, 0, 0, 0]);
  await page.waitForTimeout(200);

  const stats = await analyse(page);
  if (stats.distinct < 4) throw new Error('frame blank after pad input');
  return `moved ${dist(before, flown).toFixed(0)} units, yawed ${dYaw.toFixed(1)}°, framed`;
});

await step('a deadzoned stick does not drift the camera', async () => {
  // A pad resting slightly off centre must not slowly fly the camera away, which
  // is the single most annoying failure this feature can have.
  const before = await pose();
  await page.evaluate(() => {
    globalThis.__padState.axes = [0.06, -0.05, 0.04, 0.03];
  });
  await page.waitForTimeout(700);
  const after = await pose();
  if (dist(before, after) > 1e-6) throw new Error(`drifted ${dist(before, after)} units`);
  if (Math.abs(after.yaw - before.yaw) > 1e-6) throw new Error('drifted in yaw');
  await page.evaluate(() => {
    globalThis.__padState.axes = [0, 0, 0, 0];
  });
  return 'no drift at 6% deflection';
});

await step('disabling the gamepad ignores it entirely', async () => {
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.patchCamera({ gamepad: { ...s.camera.gamepad, enabled: false } });
    globalThis.__padState.axes = [0, -1, 0, 0];
  });
  const before = await pose();
  await page.waitForTimeout(600);
  const after = await pose();
  if (dist(before, after) > 1e-6) throw new Error('pad still moved the camera while disabled');
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.patchCamera({ gamepad: { ...s.camera.gamepad, enabled: true } });
    globalThis.__padState.axes = [0, 0, 0, 0];
  });
  return 'setting is honoured';
});

await step('the pad appears in the UI once connected', async () => {
  await openSection('Camera & scene');
  // The panel polls on a timer, so give it a tick to notice.
  await page.waitForTimeout(700);
  const text = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="gamepad-status"]');
    return el ? el.textContent : null;
  });
  if (text === null) throw new Error('gamepad status readout is missing from the camera panel');
  if (!/XInput|Xbox|Controller/i.test(text)) {
    throw new Error(`status reads "${text?.slice(0, 80)}"`);
  }
  return 'controller named in the panel';
});

// ---------------------------------------------------------------- scale

await step('a multi-chunk dataset uploads and stays interactive', async () => {
  // 10M rows crosses the 8.4M-row chunk boundary, so this exercises chunked
  // upload, the per-chunk draw plan and the GPU budget accounting at once.
  const info = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel(null);
    const ds = globalThis.__3dheat.generateSynthetic({
      ...globalThis.__3dheat.DEFAULT_SYNTH,
      rows: 10_000_000,
    });
    s.setDataset(ds);
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    await new Promise((r) => setTimeout(r, 3000));
    const live = globalThis.__3dheat_engine.live;
    return {
      rows: ds.count,
      resident: live.residentRows,
      dropped: live.droppedRows,
      gpuBytes: live.gpuBytes,
      candidates: live.candidates,
    };
  });

  if (info.rows < 9_000_000) throw new Error(`only generated ${info.rows} rows`);
  if (info.dropped !== 0) throw new Error(`${info.dropped} rows did not fit the GPU budget`);
  if (info.resident !== info.rows) {
    throw new Error(`resident ${info.resident} != rows ${info.rows}`);
  }
  // 12 bytes/row: 8 for quantised position+team, 4 for time+lifetime.
  const expected = info.rows * 12;
  if (info.gpuBytes < expected * 0.9 || info.gpuBytes > expected * 1.3) {
    throw new Error(`gpu bytes ${info.gpuBytes}, expected about ${expected}`);
  }
  const stats = await shot('scale-10m');
  if (stats.distinct < 4) throw new Error(`10M-row frame is blank (${stats.source ?? 'canvas'})`);
  return `${(info.rows / 1e6).toFixed(1)}M rows, ${(info.gpuBytes / 1e6).toFixed(0)}MB GPU, ${stats.nonBg}% of frame`;
});

await step('adaptive budget throttles to protect the frame rate', async () => {
  // SwiftShader is far slower than any real GPU, which makes it a good test of
  // the down-regulation path: the controller has to cut the sprite budget hard
  // to hold the target, and must not sit pinned at the ceiling.
  const result = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    s.patchBudget({ adaptive: true, targetFps: 60, splatsPerFrame: 32 * 1024 * 1024 });
    // A large radius makes each sprite expensive, forcing the controller to act.
    const extent = s.dataset ? s.dataset.bounds.maxX - s.dataset.bounds.minX : 1000;
    s.patchHeat({ radius: extent / 25 });
    const samples = [];
    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 250));
      const l = globalThis.__3dheat_engine.live;
      samples.push({
        budget: l.budget,
        frameMs: l.frameMs,
        splats: l.splats,
        heatScale: l.heatScale,
      });
    }
    return {
      first: samples[0],
      last: samples[samples.length - 1],
      minBudget: Math.min(...samples.map((x) => x.budget)),
      maxBudget: Math.max(...samples.map((x) => x.budget)),
      minHeatScale: Math.min(...samples.map((x) => x.heatScale)),
    };
  });

  const ceiling = 32 * 1024 * 1024;
  if (result.maxBudget > ceiling * 1.01) {
    throw new Error(`budget exceeded its ceiling: ${result.maxBudget}`);
  }
  if (!(result.minBudget < ceiling)) {
    throw new Error('controller never reduced the budget despite slow frames');
  }
  if (!(result.minBudget >= 64 * 1024)) {
    throw new Error(`budget fell below its floor: ${result.minBudget}`);
  }
  // Stage two must engage once the sprite budget has bottomed out and frames are
  // still slow, and must not fall below its own floor.
  if (!(result.minHeatScale < 1)) {
    throw new Error('resolution throttle never engaged despite a pinned sprite budget');
  }
  if (result.minHeatScale < 0.24) {
    throw new Error(`resolution fell below its floor: ${result.minHeatScale}`);
  }
  return (
    `budget ${(result.first.budget / 1e6).toFixed(2)}M -> ${(result.last.budget / 1e6).toFixed(2)}M, ` +
    `heat res -> ${(result.minHeatScale * 100).toFixed(0)}%, frame ${result.last.frameMs.toFixed(0)}ms`
  );
});

await step('GPU budget drops chunks rather than crashing the context', async () => {
  const info = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    // A budget far below what the dataset needs must be honoured, not ignored.
    s.patchBudget({ gpuBudgetBytes: 40 * 1024 * 1024 });
    const ds = globalThis.__3dheat.generateSynthetic({
      ...globalThis.__3dheat.DEFAULT_SYNTH,
      rows: 10_000_000,
    });
    s.setDataset(ds);
    // Wait for residency to settle, rather than for a fixed 2.5 seconds.
    //
    // A wall-clock sleep measures the machine as much as the code. Chunk
    // residency is decided as frames run, and the first frame after a
    // ten-million-row load is the heaviest in the session — so on software
    // rendering the sleep expired before a decision had been made and the check
    // reported that the budget had been ignored, which was not true.
    const live = globalThis.__3dheat_engine.live;
    const until = performance.now() + 30_000;
    while (performance.now() < until) {
      await new Promise((r) => requestAnimationFrame(r));
      if (live.residentRows + live.droppedRows >= ds.count) break;
    }
    return {
      rows: ds.count,
      resident: live.residentRows,
      dropped: live.droppedRows,
      gpuBytes: live.gpuBytes,
    };
  });

  if (info.dropped <= 0) throw new Error('budget was ignored; nothing was dropped');
  if (info.resident + info.dropped !== info.rows) {
    throw new Error(`resident ${info.resident} + dropped ${info.dropped} != ${info.rows}`);
  }
  // A budget too small for a whole chunk must still show a partial one, rather
  // than dropping everything and rendering an empty scene.
  if (info.resident <= 0) throw new Error('nothing was made resident within the budget');
  if (info.gpuBytes > 40 * 1024 * 1024) {
    throw new Error(`used ${info.gpuBytes} bytes over a 40MB budget`);
  }
  const stats = await analyse(page);
  if (stats.distinct < 4) throw new Error(`frame blank after dropping chunks (${stats.source ?? 'canvas'})`);

  // The "not resident" warning must actually be visible, not just tracked.
  const warningShown = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.overlay .line'));
    const row = rows.find((r) => r.textContent?.includes('Not resident'));
    return row ? getComputedStyle(row).display !== 'none' : false;
  });
  if (!warningShown) throw new Error('dropped rows were not surfaced in the UI');

  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchBudget({ gpuBudgetBytes: 2 * 1024 ** 3 }),
  );
  return `${(info.resident / 1e6).toFixed(1)}M resident, ${(info.dropped / 1e6).toFixed(1)}M dropped, warning shown`;
});

// ------------------------------------------------------------------- guards

await step('the RAM budget comes from the host, not the browser cap', async () => {
  /**
   * The browser will not say how much memory this machine has — Chrome and Edge
   * clamp `navigator.deviceMemory` to 8GiB — so the dev server reports it and the
   * page prefers that. Worth a check because the failure is silent and plausible:
   * the budget simply comes out at 60% of 8GiB, and a load that would fit is
   * described as "close to the budget" and offered a stride it does not need.
   */
  const host = await page.evaluate(async () => {
    const res = await fetch('/__host/memory', { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  });
  if (!host || !host.totalBytes) throw new Error('the host memory endpoint returned nothing');

  const b = await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState().budgets;
    return {
      ram: s.ram,
      ramMax: s.ramMax,
      capped: s.ramCapped,
      source: s.ramSource,
      // The free figure the page actually budgeted against. Free memory moves
      // while the suite runs — a few hundred megabytes between the page loading
      // and this step is normal — and on a machine whose free memory sits near
      // the tab ceiling that movement alone decides the comparison. Checking
      // the budget against a later reading tests the machine's mood; checking
      // it against the reading it was derived from tests the rule.
      freeSeen: s.ramFreeBytes,
    };
  });
  if (b.capped) throw new Error(`still using the clamped guess: ${b.source}`);
  if (!/dev server/.test(b.source)) throw new Error(`budget not sourced from the host: ${b.source}`);
  // Both shares are upper bounds, so the budget must sit under each of them —
  // and above the 4.8GB the clamp produces, or the endpoint changed nothing.
  const CAPPED = 8 * 1024 ** 3 * 0.6;
  if (!(b.ramMax > CAPPED)) {
    throw new Error(`budget ${b.ramMax} is no better than the clamped ${CAPPED}`);
  }
  if (b.ramMax > host.totalBytes * 0.6 + 1) {
    throw new Error(`budget ${b.ramMax} exceeds 60% of installed ${host.totalBytes}`);
  }
  const freeSeen = b.freeSeen ?? host.freeBytes;
  if (freeSeen !== null && b.ramMax > freeSeen * 0.8 + 1) {
    throw new Error(`budget ${b.ramMax} exceeds 80% of the ${freeSeen} free it measured`);
  }
  if (host.freeBytes !== null && b.freeSeen === null) {
    throw new Error('the page budgeted without recording the free memory it saw');
  }
  const gb = (n) => (n / 1024 ** 3).toFixed(1);
  return (
    `${gb(host.totalBytes)} GiB installed, ${gb(host.freeBytes ?? 0)} GiB free ` +
    `-> ${gb(b.ramMax)} GB budget (the clamp would give ${gb(CAPPED)} GB)`
  );
});

await step('capabilities disable modes the data cannot support', async () => {
  // A dataset with no person column must not offer the team view.
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    const ds = globalThis.__3dheat.generateSynthetic({
      ...globalThis.__3dheat.DEFAULT_SYNTH,
      rows: 50_000,
    });
    s.setDataset({ ...ds, personId: null, personLabels: [], time: null, timeRange: [0, 0] });
  });
  await page.waitForTimeout(600);
  // Anchored, not a substring. Both mode buttons' labels contain
  // "Team" — "Box replay" (the cube view, which needs a person column) and "Team heat" (the
  // group-coloured heat, which needs only a group column) — and they have
  // deliberately different requirements. A substring match took the wrong one and
  // reported the product broken when it was doing exactly the right thing.
  const teamBtn = page.locator('.seg button', { hasText: /^Box replay$/ }).first();
  // The other one must be *enabled* on this dataset, which has groups and no
  // people. Asserted rather than left implied, because the failure that brought
  // this comment about looked identical either way from the outside.
  const teamsHeatDisabled = await page
    .locator('.seg button', { hasText: /^Team heat$/ })
    .first()
    .isDisabled();
  const timelineDisabled = await page
    .locator('.tl-controls .seg button', { hasText: 'Play' })
    .first()
    .isDisabled();
  const teamDisabled = await teamBtn.isDisabled();
  if (!teamDisabled) throw new Error('team mode offered without a person column');
  if (teamsHeatDisabled) throw new Error('teams heat blocked despite having groups');
  if (!timelineDisabled) throw new Error('timeline offered without a time column');
  return 'team + timeline disabled, teams heat still offered';
});

await step('no console errors', () => {
  if (errors.length) throw new Error(errors.slice(0, 6).join('\n         '));
  return `${logs.length} log lines`;
});

writeFileSync(`${OUT}/console.log`, logs.join('\n'));
await browser.close();

console.log(`\nsmoke: ${failed === 0 ? 'passed' : 'FAILED'} (${passed} ok, ${failed} failed)`);
process.exit(failed === 0 ? 0 : 1);

// ------------------------------------------------------------------ helpers

/**
 * Apply a heat change, let the field settle, and return the peak accumulated
 * heat over a grid in the middle of the frame.
 *
 * Grid-sampled rather than single-pixel because the stochastic splatter means any
 * one pixel can come back cold. Reports the live readout alongside the number so
 * a zero says why it was zero.
 */
async function probeCurvePeak(patch) {
  await page.evaluate(patch);
  await page.waitForTimeout(1600);
  return page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const l = eng.live;
    let peak = 0;
    let hot = 0;
    for (let x = 0.3; x <= 0.7; x += 0.08) {
      for (let y = 0.3; y <= 0.7; y += 0.08) {
        const v = await eng.probeHeat(
          Math.round(eng.canvas.width * x),
          Math.round(eng.canvas.height * y),
          l.accumFrames,
        );
        if (v !== null && v > 0) {
          hot++;
          peak = Math.max(peak, v);
        }
      }
    }
    const h = globalThis.__3dheat.useStore.getState().heat;
    return {
      peak,
      why:
        `hot ${hot}, candidates ${l.candidates}, splats ${l.splats}, accum ${l.accumFrames}, ` +
        `radius ${h.radius.toFixed(1)}, centre ${h.centerIntensity}, edge ${h.edgeIntensity}, ` +
        `curve ${h.useCurve}, resident ${l.residentRows}, dropped ${l.droppedRows}`,
    };
  });
}

/** Expand a collapsed sidebar section by its header text, if it isn't already. */
async function openSection(title) {
  await page.evaluate((title) => {
    for (const section of document.querySelectorAll('.section')) {
      const header = section.querySelector('header');
      if (!header?.textContent?.includes(title)) continue;
      if (!section.classList.contains('open')) header.click();
      return;
    }
  }, title);
  await page.waitForTimeout(200);
}

/** Apply timeline settings, optionally seek to a fraction, and measure coverage. */
async function measureCoverage(page, timeline, seekFraction) {
  await page.evaluate(
    ({ timeline, seekFraction }) => {
      const s = globalThis.__3dheat.useStore.getState();
      s.patchTimeline(timeline);
      if (seekFraction !== undefined && s.dataset) {
        const [a, b] = s.dataset.timeRange;
        s.seek(a + (b - a) * seekFraction);
      }
    },
    { timeline, seekFraction },
  );
  await page.waitForTimeout(1300);
  return (await analyse(page)).nonBg;
}

/**
 * Rough "is anything on screen" check.
 *
 * Reads the renderer's own composited output when the backend offers it, and
 * falls back to the canvas otherwise. That indirection exists because headless
 * Chromium renders WebGPU correctly but never composites its canvas — reading
 * the canvas there returns transparent black regardless of what was drawn, which
 * would make every WebGPU assertion a false negative.
 */
async function analyse(page) {
  return page.evaluate(async () => {
    const summarise = (data, count) => {
      const seen = new Set();
      let nonBg = 0;
      for (let i = 0; i < data.length; i += 4) {
        seen.add(((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3));
        const bg =
          Math.abs(data[i] - 22) <= 10 &&
          Math.abs(data[i + 1] - 23) <= 10 &&
          Math.abs(data[i + 2] - 26) <= 10;
        if (!bg) nonBg++;
      }
      return { distinct: seen.size, nonBg: Math.round((nonBg / count) * 1000) / 10 };
    };

    const eng = globalThis.__3dheat_engine;
    if (eng?.live?.backend === 'webgpu') {
      let frame = null;
      let error = null;
      try {
        frame = await eng.captureFrame();
      } catch (e) {
        error = String(e);
      }
      if (!frame) {
        // Say so rather than silently falling back to a canvas that this
        // browser never presents, which would read as "nothing was drawn".
        return { distinct: 0, nonBg: 0, source: error ? `capture threw: ${error}` : 'capture null' };
      }
      {
        // Downsample by striding rather than drawing, to keep this pure JS.
        const step = Math.max(1, Math.floor(frame.width / 200));
        const out = [];
        for (let y = 0; y < frame.height; y += step) {
          for (let x = 0; x < frame.width; x += step) {
            const o = (y * frame.width + x) * 4;
            out.push(frame.rgba[o], frame.rgba[o + 1], frame.rgba[o + 2], frame.rgba[o + 3]);
          }
        }
        return { ...summarise(out, out.length / 4), source: 'capture' };
      }
    }

    const src = document.querySelector('canvas');
    const c = document.createElement('canvas');
    c.width = 200;
    c.height = 125;
    const ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0, c.width, c.height);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    return summarise(d, d.length / 4);
  });
}

/** Count warm vs cool vs near-white pixels, to verify the ramps are in play. */
async function tone(page) {
  return page.evaluate(async () => {
    const count = (d) => {
      let warm = 0;
      let cool = 0;
      let bright = 0;
      // Total brightness of everything that is not background: how much heat
      // is on screen, whatever colour the ramp has pushed it to.
      let mass = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        if (r < 45 && g < 45 && b < 50) continue; // background
        mass += (r + g + b) / 3;
        if (r > g + 25 && r > b + 25) warm++;
        else if (b > r + 25 || g > r + 25) cool++;
        if (r > 190 && g > 190 && b > 190) bright++;
      }
      return { warm, cool, bright, mass: Math.round(mass) };
    };

    const eng = globalThis.__3dheat_engine;
    if (eng?.live?.backend === 'webgpu') {
      const frame = await eng.captureFrame();
      if (frame) return count(frame.rgba);
    }

    const src = document.querySelector('canvas');
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 200;
    const ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0, c.width, c.height);
    return count(ctx.getImageData(0, 0, c.width, c.height).data);
  });
}

