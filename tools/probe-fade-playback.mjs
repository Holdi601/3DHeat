/**
 * Second pass on "stand still and it fades to grey".
 *
 * The first probe held a still camera over synthetic data in `all` mode and found
 * nothing: every configuration was stable once converged. This covers what that
 * one did not — real exports, a perspective camera, and the timeline *running*,
 * which is the only path that uses the EMA accumulation mode.
 *
 * Prints the accumulation mode each frame took, because the three modes normalise
 * differently: `sum` divides by accumFrames at composite time and the other two do
 * not, so a buffer filled by one mode and read by another drifts.
 *
 *   node tools/probe-fade2.mjs [url]
 */
import { chromium } from 'playwright';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const REPO = resolve(import.meta.dirname, '..');

function findParquet() {
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
      else if (/\.parquet$/i.test(name) && statSync(p).size > 0 && statSync(p).size < 5e6) {
        out.push('/' + relative(REPO, p).split('\\').join('/'));
      }
    }
  };
  walk(join(REPO, 'TestData'));
  return out.sort();
}

const files = findParquet();
console.log(`found ${files.length} parquet files`);

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

const sample = () =>
  page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const l = eng.live;
    const W = eng.canvas.width;
    const H = eng.canvas.height;
    // Peak of the raw field over a coarse grid, and where it was.
    let peak = 0;
    let px = W >> 1;
    let py = H >> 1;
    for (let x = 0.15; x <= 0.85; x += 0.05) {
      for (let y = 0.15; y <= 0.85; y += 0.05) {
        const cx = Math.round(W * x);
        const cy = Math.round(H * y);
        const v = await eng.probeHeat(cx, cy, l.accumFrames);
        if (v !== null && Math.abs(v) > Math.abs(peak)) {
          peak = v;
          px = cx;
          py = cy;
        }
      }
    }
    let lit = 0;
    let luma = 0;
    let at = [0, 0, 0];
    if (l.backend === 'webgpu') {
      const shot = eng.captureFrame ? await eng.captureFrame() : null;
      if (shot) {
        const n = shot.width * shot.height;
        let sum = 0;
        for (let i = 0; i < n; i++) {
          const o = i * 4;
          sum += 0.2126 * shot.rgba[o] + 0.7152 * shot.rgba[o + 1] + 0.0722 * shot.rgba[o + 2];
          if (shot.rgba[o] > 40 || shot.rgba[o + 1] > 40 || shot.rgba[o + 2] > 45) lit++;
        }
        luma = sum / n;
        lit = (lit / n) * 100;
      }
    } else {
      const c = document.createElement('canvas');
      c.width = 320;
      c.height = 200;
      const ctx = c.getContext('2d');
      ctx.drawImage(eng.canvas, 0, 0, c.width, c.height);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const n = c.width * c.height;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const o = i * 4;
        sum += 0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2];
        if (d[o] > 40 || d[o + 1] > 40 || d[o + 2] > 45) lit++;
      }
      luma = sum / n;
      lit = (lit / n) * 100;
      const sx = Math.min(319, Math.round((px / W) * 320));
      const sy = Math.min(199, Math.round((py / H) * 200));
      const o = (sy * 320 + sx) * 4;
      at = [d[o], d[o + 1], d[o + 2]];
    }
    return {
      peak,
      lit,
      luma,
      at,
      mode: l.accumMode,
      accum: l.accumFrames,
      converge: l.convergeFrames,
      splats: l.splats,
      heatScale: l.heatScale,
      playhead: l.playhead,
    };
  });

const row = (t, s) =>
  console.log(
    `t=${t.padStart(5)}  ${String(s.mode).padEnd(5)}  peak ${s.peak.toFixed(1).padStart(9)}` +
      `  lit ${s.lit.toFixed(2).padStart(5)}%  luma ${s.luma.toFixed(2).padStart(6)}` +
      `  rgb(${String(s.at[0]).padStart(3)},${String(s.at[1]).padStart(3)},${String(s.at[2]).padStart(3)})` +
      `  accum ${String(s.accum).padStart(3)}/${String(s.converge).padStart(4)}` +
      `  splat ${(s.splats / 1e3).toFixed(0).padStart(5)}k  res ${(s.heatScale * 100).toFixed(0).padStart(3)}%` +
      `  t${s.playhead.toFixed(1)}`,
  );

async function watch(label, setup, seconds) {
  console.log(`\n=== ${label}`);
  await page.evaluate(setup);
  await page.waitForTimeout(1500);
  for (let i = 0; i < seconds * 2; i++) {
    await page.waitForTimeout(500);
    row((i * 0.5).toFixed(1), await sample());
  }
}

if (files.length > 0) {
  await page.evaluate(async (urls) => {
    await globalThis.__3dheat.loadUrls(urls);
  }, files);
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const ds = globalThis.__3dheat.useStore.getState().dataset;
    return { rows: ds.count, hasTime: !!ds.time, range: ds.timeRange };
  });
  console.log(`loaded ${info.rows} real rows, time ${info.hasTime}, range ${info.range}`);

  // Perspective, framed, camera never touched again, `all` mode.
  await watch(
    'real data, perspective, all mode, still camera',
    () => {
      const s = globalThis.__3dheat.useStore.getState();
      s.setMode('heat-simple');
      s.patchTimeline({ mode: 'all', playing: false });
      s.patchCamera({ projection: 'perspective' });
      const eng = globalThis.__3dheat_engine;
      eng.applyPreset('Iso');
      eng.frameDataset(true);
    },
    8,
  );

  // The EMA path: playback running, camera still. This is the one the first probe
  // never reached.
  await watch(
    'real data, timeline PLAYING, still camera',
    () => {
      const s = globalThis.__3dheat.useStore.getState();
      s.patchTimeline({ mode: 'play', window: 'cumulative', speed: 1, loop: true });
      s.seek(s.dataset.timeRange[0]);
      s.setPlaying(true);
    },
    10,
  );

  // Paused mid-playthrough with the camera still: sum reading a buffer that EMA
  // filled.
  await watch(
    'real data, playback PAUSED mid-way, still camera',
    () => {
      globalThis.__3dheat.useStore.getState().setPlaying(false);
    },
    10,
  );
}

// Synthetic at a size where subsampling actually bites, playing.
await watch(
  'synthetic 10M, timeline PLAYING, still camera',
  () => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel(null);
    s.setDataset(
      globalThis.__3dheat.generateSynthetic({
        ...globalThis.__3dheat.DEFAULT_SYNTH,
        rows: 10_000_000,
      }),
    );
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'play', window: 'cumulative', speed: 20, loop: true });
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Top');
    eng.frameDataset(true);
    s.seek(s.dataset.timeRange[0]);
    s.setPlaying(true);
  },
  12,
);

await watch(
  'synthetic 10M, then PAUSED, still camera',
  () => {
    globalThis.__3dheat.useStore.getState().setPlaying(false);
  },
  14,
);

await browser.close();
