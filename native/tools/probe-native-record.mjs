/**
 * A video render (Camera path & render) in the built app, as a person makes one: the web engine
 * first, then the native viewport (Settings > Native viewport), on the same load and the same path.
 *
 *   node native/tools/probe-native-record.mjs --dir <rowceiling folder> [--rows 10] [--exe <3dheat-app.exe>]
 *        [--out <folder>] [--seconds 2] [--fps 30] [--size 720|1080|canvas] [--container mp4|mkv|webm]
 *        [--backends webgpu,native]
 *
 * Each run starts the app, picks the row-ceiling tables (`tools/probe-row-ceiling.mjs`, synthetic)
 * the way a person picks files, puts two keyframes ("Add keyframe here" after moving the camera),
 * clicks "Render video" and waits for the panel's result line. The file the render made is kept in
 * --out (`<backend>.<ext>`). Then, with ffmpeg: both files decoded, frame for frame (count, size,
 * the per-pixel difference of each frame pair: mean and pixels off by more than 8/255 - H.264 at the
 * same bitrate adds its own few levels to both). Also reported per run: render time, the time each
 * picture took to come back (`captureFrame`), the page's frames while it rendered, and for the native
 * viewport its present intervals while it rendered (p50/p99/max) with, per interval, the time its
 * thread was busy rather than waiting for the page (the live view must not drop frames while
 * recording: a long interval that is all waiting is the page drawing nothing new - the encoder
 * starting or finishing - not a drop), beside the same steps with no picture taken.
 *
 * Exits 1 when the native file does not decode, has another frame count or size, or a frame pair
 * differs by more than 2/255 on average. Windows (WebView2's DevTools port). Needs the real GPU.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, linkSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const target = process.env.CARGO_TARGET_DIR ?? resolve(import.meta.dirname, '..', 'target');
const exe = arg('exe', join(target, 'release', '3dheat-app.exe'));
const dir = arg('dir', null);
const rows = Number(arg('rows', 10)) * 1e6;
const out = resolve(arg('out', join(process.env.TEMP ?? '.', 'heat3d-native-record')));
const seconds = Number(arg('seconds', 2));
const fps = Number(arg('fps', 30));
const size = String(arg('size', '720'));
const container = String(arg('container', 'mp4'));
const backends = String(arg('backends', 'webgpu,native')).split(',');
const PORT = Number(arg('port', 9361));
const PER_FILE = 10_000_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!dir) throw new Error('--dir is required (the row-ceiling tables)');
mkdirSync(out, { recursive: true });

function files() {
  const base = join(dir, `wide-${PER_FILE}-8.parquet`);
  if (!existsSync(base)) throw new Error(`no ${base}: run tools/probe-row-ceiling.mjs --dir ${dir} first`);
  const list = [];
  for (let i = 0; i < Math.ceil(rows / PER_FILE); i++) {
    const p = i === 0 ? base : join(dir, `wide-${PER_FILE}-8-${i}.parquet`);
    if (!existsSync(p)) linkSync(base, p);
    list.push(p);
  }
  return list;
}

const stats = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
  return s.length ? { n: s.length, p50: q(0.5), p99: q(0.99), max: s[s.length - 1], over25: s.filter((x) => x > 25).length } : null;
};

async function run(backend, saturation) {
  const vlog = join(out, `${backend}-viewport.log`);
  rmSync(vlog, { force: true });
  const app = spawn(exe, [], {
    env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT}`, WEBVIEW2_USER_DATA_FOLDER: join(out, `webview2-${PORT}`), HEAT3D_VIEWPORT_LOG: vlog },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  app.stdout.on('data', (d) => (log += d));
  app.stderr.on('data', (d) => (log += d));
  let browser;
  try {
    for (const until = Date.now() + 120_000; !browser && Date.now() < until; ) {
      try {
        browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
      } catch {
        await sleep(200);
      }
    }
    if (!browser) throw new Error(`no DevTools port: ${log}`);
    let page;
    for (let i = 0; i < 300 && !page; i++) {
      page = browser.contexts().flatMap((c) => c.pages()).find((p) => /tauri\.localhost|127\.0\.0\.1/.test(p.url()));
      if (!page) await sleep(100);
    }
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.waitForFunction(() => !!globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none', null, { timeout: 60_000 });
    await page.evaluate((on) => localStorage.setItem('heat3d.nativeViewport', on ? 'on' : 'off'), backend === 'native');
    await page.reload();
    await page.waitForFunction(() => !!globalThis.__heat3dNative && !!globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none', null, { timeout: 60_000 });
    const got = await page.evaluate(() => globalThis.__3dheat_engine.live.backend);
    if (got !== backend) throw new Error(`asked for ${backend}, the app runs ${got}`);

    // The files, picked as a person picks them.
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.id = '__probe_files';
      input.style.display = 'none';
      document.body.appendChild(input);
    });
    const cdp = await page.context().newCDPSession(page);
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#__probe_files' });
    await cdp.send('DOM.setFileInputFiles', { nodeId, files: files() });
    const extra = Array.from({ length: 8 }, (_, i) => `m${i}`);
    const mapping = {
      x: 'x', y: 'y', z: 'z', time: 'time', personId: 'player', teamId: 'team', extra: ['m0'], onDemand: extra.slice(1),
      extraNumeric: Object.fromEntries(extra.map((c) => [c, true])),
      axes: { up: 'z', flipX: false, flipY: false, flipZ: false, scale: 1 },
    };
    const load = await page.evaluate(async ({ m, saturation }) => {
      const useStore = await globalThis.__heat3dNative.store();
      const eng = globalThis.__3dheat_engine;
      const t0 = performance.now();
      const files = [...document.getElementById('__probe_files').files];
      const metered = eng.exposuresMetered ?? 0;
      const r = await globalThis.__heat3dNative.loadFiles(files, 1, m, true);
      await new Promise((res) => setTimeout(res, 300));
      for (const until = performance.now() + 600_000; performance.now() < until && (eng.live.residentRows + eng.live.droppedRows < r.rows || eng.renderer.dataPending); ) await new Promise((res) => setTimeout(res, 20));
      for (const end = performance.now() + 30_000; (eng.exposuresMetered ?? 0) === metered && performance.now() < end; ) await new Promise((res) => setTimeout(res, 20));
      // One exposure for both runs (the web's), held: the render then shows the same scale on both.
      const st = useStore.getState();
      const sat = saturation ?? st.heat.saturation;
      st.patchHeat({ saturation: sat, followExposure: false, exposureLocked: true });
      return { rows: r.rows, loadMs: performance.now() - t0, saturation: sat };
    }, { m: mapping, saturation });

    // The panel: "Present", "Camera path & render" opened.
    await page.screenshot({ path: join(out, `${backend}-loaded.png`) });
    await page.locator('button', { hasText: /^Present$/ }).first().click();
    const head = page.locator('.task-group[data-task="present"]').getByText('Camera path & render').first();
    await head.scrollIntoViewIfNeeded();
    const add = page.getByRole('button', { name: 'Add keyframe here' });
    if (!(await add.isVisible().catch(() => false))) await head.click();
    await add.waitFor({ state: 'visible', timeout: 10_000 });
    await page.screenshot({ path: join(out, `${backend}-panel.png`) });

    // Two keyframes: the view after the load, then turned and closer, as a person drags the view between clicks.
    await page.evaluate(() => {
      const eng = globalThis.__3dheat_engine;
      eng.camera.setOrientationDegrees(30, -35);
      eng.camera.moved = true;
    });
    await sleep(300);
    await add.click();
    await page.evaluate(() => {
      const eng = globalThis.__3dheat_engine;
      const c = eng.camera;
      c.setOrientationDegrees(90, -50);
      c.position.set(c.position.x * 0.7, c.position.y * 0.8, c.position.z * 0.7);
      c.moved = true;
    });
    await sleep(300);
    await add.click();
    // Length, rate, size and file type as the panel's controls set them.
    await page.evaluate(async ({ seconds, fps, size, container }) => {
      const useStore = await globalThis.__heat3dNative.store();
      useStore.getState().patchPath({ seconds, fps, size, container, kbps: 16_000 });
      // Keep the file the panel hands to the download (and time each picture's read-back).
      const orig = URL.createObjectURL;
      URL.createObjectURL = (b) => {
        if (b instanceof Blob && b.type !== 'application/json') globalThis.__probeVideo = b;
        return orig.call(URL, b);
      };
      const eng = globalThis.__3dheat_engine;
      const cap = eng.renderer.captureFrame.bind(eng.renderer);
      globalThis.__probeCaptureMs = [];
      eng.renderer.captureFrame = async () => {
        const t = performance.now();
        const f = await cap();
        globalThis.__probeCaptureMs.push(performance.now() - t);
        return f;
      };
      if (eng.renderer.times) await eng.renderer.times();
      // The page's own frames while it renders (the web engine's live view).
      globalThis.__probeRaf = [];
      globalThis.__probeRafOn = true;
      let last = performance.now();
      const tick = (now) => {
        globalThis.__probeRaf.push(now - last);
        last = now;
        if (globalThis.__probeRafOn) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { seconds, fps, size, container });
    const bs = await browser.newBrowserCDPSession().catch(() => null);
    await bs?.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: join(out, `${backend}-downloads`) }).catch(() => {});

    const t0 = Date.now();
    await page.getByRole('button', { name: 'Render video' }).click();
    // The result line ("N frames at WxH, S MB - every frame exact") or an error.
    const result = await page.waitForFunction(() => {
      const t = document.body.innerText;
      const m = t.match(/\d+ frames? at [\d,.\s]+×[\d,.\s]+[^\n]*/);
      const err = [...document.querySelectorAll('.hint')].find((e) => e.style.color === 'var(--bad)');
      return m ? m[0] : err && err.textContent ? `ERROR ${err.textContent}` : null;
    }, null, { timeout: 15 * 60_000, polling: 250 }).then((h) => h.jsonValue());
    const renderMs = Date.now() - t0;
    const after = await page.evaluate(async () => {
      const eng = globalThis.__3dheat_engine;
      globalThis.__probeRafOn = false;
      const native = eng.renderer.times ? await eng.renderer.times() : null;
      const b = globalThis.__probeVideo;
      const bytes = b ? new Uint8Array(await b.arrayBuffer()) : null;
      let s = '';
      if (bytes) for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return { native, video: bytes ? btoa(s) : null, captureMs: globalThis.__probeCaptureMs, raf: globalThis.__probeRaf.slice(5) };
    });
    await page.screenshot({ path: join(out, `${backend}-done.png`) });
    // The window as it is on screen, both layers (the native viewport is under the page).
    for (let i = 0; i < 30; i++) await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
    spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(import.meta.dirname, 'grab-window.ps1'), '-ProcessId', String(app.pid), '-Out', join(out, `${backend}-screen.png`)], { encoding: 'utf8' });
    // The control: the render's own steps (its budget, the camera and playhead moved a frame at a time,
    // two frames each) with no picture taken - what the live view does without the read-backs.
    const control = await page.evaluate(async (total) => {
      const useStore = await globalThis.__heat3dNative.store();
      const eng = globalThis.__3dheat_engine;
      if (!eng.renderer.times) return null;
      const st = useStore.getState();
      const budget = { ...st.budget };
      st.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: 64 * 1024 * 1024 });
      const raf = () => new Promise((r) => requestAnimationFrame(r));
      await raf();
      await eng.renderer.times();
      const yaw0 = eng.camera.yawDegrees;
      const [lo, hi] = st.dataset.timeRange;
      for (let f = 0; f < total; f++) {
        eng.camera.setOrientationDegrees(yaw0 + f, eng.camera.pitchDegrees);
        useStore.getState().seek(lo + ((hi - lo) * f) / total);
        eng.camera.moved = true;
        eng.invalidate(2);
        await raf();
        await raf();
        await raf();
      }
      const t = await eng.renderer.times();
      st.patchBudget(budget);
      return t;
    }, Math.round(seconds * fps));
    const file = join(out, `${backend}.${container}`);
    if (after.video) writeFileSync(file, Buffer.from(after.video, 'base64'));
    return {
      backend,
      load,
      result,
      renderMs,
      file: after.video ? file : null,
      capture: stats(after.captureMs),
      page: stats(after.raf),
      present: after.native ? stats(after.native.intervals.slice(5)) : null,
      // Where the long ones are (index of n): a gap with no packet (the page drew nothing new) is not a drop.
      gaps: after.native ? after.native.intervals.map((v, i) => [i, v]).filter(([, v]) => v > 25).map(([i, v]) => `${i}:${v.toFixed(0)}/${(v - (after.native.idle?.[i] ?? 0)).toFixed(0)}`) : [],
      // Of each interval, what the viewport's thread spent other than waiting for the page.
      busy: after.native?.idle ? stats(after.native.intervals.map((v, i) => v - (after.native.idle[i] ?? 0)).slice(5)) : null,
      cpu: after.native ? stats(after.native.cpu) : null,
      control: control ? stats(control.intervals.slice(5)) : null,
      errors: errors.slice(0, 5),
      log: log.slice(-3000),
    };
  } finally {
    await browser?.close().catch(() => {});
    app.kill();
    await sleep(2500);
  }
}

/** Every frame as RGBA (ffmpeg), and its size and count. */
function decode(file) {
  const p = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=width,height,nb_read_frames,codec_name', '-of', 'json', file], { encoding: 'utf8' });
  if (p.status !== 0) return { error: p.stderr };
  const s = JSON.parse(p.stdout).streams[0];
  const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 4e9 });
  if (raw.status !== 0) return { error: String(raw.stderr) };
  return { width: s.width, height: s.height, frames: Number(s.nb_read_frames), codec: s.codec_name, rgba: raw.stdout };
}

const f1 = (v) => (v === null || v === undefined ? '-' : v.toFixed(1));
const runs = {};
let saturation = null;
for (const b of backends) {
  const r = await run(b, saturation);
  saturation = r.load.saturation;
  runs[b] = r;
  console.log(
    `${b}: ${r.result}; render ${(r.renderMs / 1000).toFixed(1)} s, read-back per picture p50 ${f1(r.capture?.p50)} p99 ${f1(r.capture?.p99)} max ${f1(r.capture?.max)} ms` +
      `; page frames while rendering p50 ${f1(r.page?.p50)} p99 ${f1(r.page?.p99)} max ${f1(r.page?.max)} ms (${r.page?.over25} over 25 ms of ${r.page?.n})` +
      (r.present ? `; presents while rendering p50 ${f1(r.present.p50)} p99 ${f1(r.present.p99)} max ${f1(r.present.max)} ms (${r.present.over25} over 25 ms of ${r.present.n}), frame CPU p99 ${f1(r.cpu?.p99)} max ${f1(r.cpu?.max)} ms, long (interval/busy) at ${r.gaps.join(' ')}; busy (not waiting for the page) p50 ${f1(r.busy?.p50)} p99 ${f1(r.busy?.p99)} max ${f1(r.busy?.max)} ms` : '') +
      (r.control ? `; the same steps without read-backs p50 ${f1(r.control.p50)} p99 ${f1(r.control.p99)} max ${f1(r.control.max)} ms (${r.control.over25} over 25 ms of ${r.control.n})` : '') +
      (r.file ? `; ${r.file} ${(statSync(r.file).size / 1e6).toFixed(2)} MB` : '; NO FILE') +
      (r.errors.length ? `; errors: ${r.errors.join(' | ')}` : ''),
  );
  const said = r.log.split(/\r?\n/).filter((l) => /viewport:|panicked/.test(l));
  if (said.length) console.log(`  ${b} app said: ${said.slice(-4).join(' | ').slice(0, 800)}`);
}

let failed = 0;
const w = runs.webgpu?.file ? decode(runs.webgpu.file) : null;
const n = runs.native?.file ? decode(runs.native.file) : null;
for (const [b, d] of [['webgpu', w], ['native', n]]) if (d) console.log(`${b} file: ${d.error ? `does not decode: ${d.error.slice(0, 300)}` : `${d.codec} ${d.width}x${d.height}, ${d.frames} frames`}`);
if (runs.native && (!n || n.error)) failed = 1;
if (w && n && !w.error && !n.error) {
  if (w.width !== n.width || w.height !== n.height || w.frames !== n.frames) {
    console.log(`FAIL native ${n.width}x${n.height} ${n.frames} frames, web ${w.width}x${w.height} ${w.frames}`);
    failed = 1;
  } else {
    const px = w.width * w.height * 4;
    const per = [];
    for (let f = 0; f < w.frames; f++) {
      let sum = 0, off = 0;
      for (let i = f * px; i < (f + 1) * px; i += 4) {
        const m = Math.max(Math.abs(w.rgba[i] - n.rgba[i]), Math.abs(w.rgba[i + 1] - n.rgba[i + 1]), Math.abs(w.rgba[i + 2] - n.rgba[i + 2]));
        sum += m;
        if (m > 8) off++;
      }
      per.push({ mean: sum / (px / 4), off: off / (px / 4) });
    }
    const worst = per.reduce((a, b) => (b.mean > a.mean ? b : a));
    const mean = per.reduce((a, b) => a + b.mean, 0) / per.length;
    const bad = worst.mean > 2;
    if (bad) failed = 1;
    console.log(`${bad ? 'FAIL' : 'ok  '} web vs native, frame for frame: mean ${mean.toFixed(2)}/255, worst frame ${worst.mean.toFixed(2)}/255 (${(worst.off * 100).toFixed(2)} % > 8/255), first ${per[0].mean.toFixed(2)}, last ${per[per.length - 1].mean.toFixed(2)}`);
  }
}
process.exit(failed);
