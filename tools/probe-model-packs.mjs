/**
 * Frame times with the local model packs on and off (src/figures/modelpack.ts,
 * src/figures/unitcatalog.ts): a real recording, kept local, loaded through the
 * app in Edge on this machine's graphics card, played from its middle with
 * figures on, each way. "Off" answers the packs' and catalogues' routes with
 * 204, so every unit keeps its built-in figure. Says how many of the
 * recording's vehicle types a catalogue names and how many of those a pack
 * model stands in for, and the frame intervals' median, p99 and max in two
 * windows: while the models arrive (playing from the moment the recording is
 * loaded, 1,200 frames, with how many models were asked for and are in place
 * at its end, on the page's thread and of the GPU tracks' model worker) and
 * after (900 frames, from the recording's middle, with the same counts).
 *
 *   node tools/probe-model-packs.mjs --data=<file.3dheat|parquet> [--url=http://127.0.0.1:5273/] [--list]
 *
 * `--list` also prints each vehicle type and the model it is drawn as (or "figure").
 */

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const opt = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
const DATA = opt('data');
const base = opt('url') ?? 'http://127.0.0.1:5273/';
if (!DATA) {
  console.log('give --data=<a recording>');
  process.exit(2);
}
const body = readFileSync(DATA);
const name = DATA.split(/[\\/]/).pop();

async function run(packs) {
  const browser = await chromium.launch({ channel: 'msedge', headless: false, args: ['--enable-unsafe-webgpu'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('  pageerror:', e.message));
  await page.routeWebSocket(/./, () => {});
  if (!packs) {
    await page.route('**/__heat3d/model-pack*', (r) => r.fulfill({ status: 204, body: '' }));
    await page.route('**/__heat3d/unit-catalogs*', (r) => r.fulfill({ status: 204, body: '' }));
  }
  await page.route(`**/__packprobe/${name}`, (r) => r.fulfill({ body, contentType: 'application/octet-stream' }));
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 180_000 });
  await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine && globalThis.__3dheat), null, { timeout: 180_000 });
  await page.waitForTimeout(2000);
  const out = await page.evaluate(async (file) => {
    const h = globalThis.__3dheat;
    const frames = async (n) => {
      const gaps = [];
      let last = performance.now();
      await new Promise((res) => {
        const tick = () => {
          const now = performance.now();
          gaps.push(now - last);
          last = now;
          if (gaps.length < n) requestAnimationFrame(tick);
          else res();
        };
        requestAnimationFrame(tick);
      });
      return gaps.slice(2);
    };
    await h.loadUrls([`/__packprobe/${file}`]);
    const st = h.useStore;
    st.getState().setMode('team');
    st.getState().patchTeam({ figures: true, trailSeconds: 0 });
    // The models arrive while it plays: from the start, at once.
    const d = st.getState().dataset;
    st.getState().seek(d.timeRange[0] + (d.timeRange[1] - d.timeRange[0]) * 0.4);
    st.getState().patchTimeline({ mode: 'play', window: 'cumulative', playing: true, speed: 4 });
    const arrival = await frames(1200);
    let models = null;
    try {
      const pm = await h.modules['figures/packModels']();
      const rs = await h.modules['figures/residency']();
      const gs = await h.modules['render/gpuTracks/store']();
      models = { ...pm.packModelsState(), uploads: rs.uploadsWaiting(), tracks: gs.kindModelsState() };
    } catch {
      // an older build without them
    }
    // The recording's vehicle types, and which a catalogue lists and a pack model stands in for.
    const col = d.attrs.find((a) => /^(vehicle|name|unittype)$/i.test(a.name.trim()) && a.kind === 'category');
    const types = new Set((col?.categories ?? []).map((c) => c.toLowerCase()));
    // What the app itself made of them: a type drawn as a pack model has a `@model:` figure in the alias table.
    let listed = 0;
    let modelled = 0;
    const drawn = [];
    try {
      const cat = await h.modules['figures/catalog']();
      const uc = await h.modules['figures/unitcatalog']();
      await cat.figurePackReady;
      for (const t of types) {
        if (uc.catalogItem(t)) listed++;
        if (cat.ALIASES[t]?.includes('@model:')) modelled++;
        drawn.push([t, cat.ALIASES[t]?.includes('@model:') ? cat.ALIASES[t] : 'figure']);
      }
    } catch {
      // counts stay 0
    }
    st.getState().seek((d.timeRange[0] + d.timeRange[1]) / 2);
    st.getState().patchTimeline({ mode: 'play', window: 'cumulative', playing: true, speed: 4 });
    await new Promise((res) => setTimeout(res, 3000));
    const gaps = await frames(900);
    let modelsAfter = null;
    try {
      const pm = await h.modules['figures/packModels']();
      const rs = await h.modules['figures/residency']();
      const gs = await h.modules['render/gpuTracks/store']();
      modelsAfter = { ...pm.packModelsState(), uploads: rs.uploadsWaiting(), tracks: gs.kindModelsState() };
    } catch {
      // an older build without them
    }
    return { rows: d.count, types: types.size, listed, modelled, drawn, gaps, arrival, models, modelsAfter };
  }, name);
  await browser.close();
  const stats = (g) => {
    const s = [...g].sort((a, b) => a - b);
    return { median: s[s.length >> 1], p99: s[Math.floor(s.length * 0.99)], max: s[s.length - 1], over20: g.filter((x) => x > 20).length };
  };
  return { ...out, ...stats(out.gaps), arriving: stats(out.arrival) };
}

const line = (s) => `median ${s.median.toFixed(1)} ms, p99 ${s.p99.toFixed(1)} ms, max ${s.max.toFixed(1)} ms, ${s.over20} over 20 ms`;

for (const packs of [false, true]) {
  const r = await run(packs);
  if (packs && argv.includes('--list')) for (const [t, fig] of r.drawn.sort()) console.log(`  ${t}: ${fig}`);
  console.log(`${packs ? 'packs on ' : 'packs off'}: ${r.rows.toLocaleString()} rows, ${r.types} vehicle types (${r.listed} in a catalogue, ${r.modelled} drawn as a pack model)`);
  // The page's pack figures (`packModels.ts`), and the GPU tracks' kinds asked of the model worker (`gpuTracks/store.ts`).
  const counts = (x) =>
    x ? ` (pack models asked ${x.asked}, in place ${x.here}; track kinds asked ${x.tracks.asked}, back ${x.tracks.back}, with meshes ${x.tracks.meshes}; meshes waiting ${x.uploads})` : '';
  console.log(`  while arriving${counts(r.models)}: ${line(r.arriving)}`);
  console.log(`  after${counts(r.modelsAfter)}: ${line(r)}`);
}
