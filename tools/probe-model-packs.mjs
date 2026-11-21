/**
 * Frame times with the local model packs on and off (src/figures/modelpack.ts,
 * src/figures/unitcatalog.ts): a real recording, kept local, loaded through the
 * app in Edge on this machine's graphics card, played from its middle with
 * figures on, 900 frames each way. "Off" answers the packs' and catalogues'
 * routes with 204, so every unit keeps its built-in figure. Says how many of
 * the recording's vehicle types a catalogue names and how many of those a pack
 * model stands in for, and the frame intervals' median, p99 and max.
 *
 *   node tools/probe-model-packs.mjs --data=<file.3dheat|parquet> [--url=http://127.0.0.1:5273/]
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
    await h.loadUrls([`/__packprobe/${file}`]);
    const st = h.useStore;
    st.getState().setMode('team');
    st.getState().patchTeam({ figures: true, trailSeconds: 0 });
    await new Promise((res) => setTimeout(res, 4000));
    const d = st.getState().dataset;
    // The recording's vehicle types, and which a catalogue lists and a pack model stands in for.
    const col = d.attrs.find((a) => /^(vehicle|name|unittype)$/i.test(a.name.trim()) && a.kind === 'category');
    const types = new Set((col?.categories ?? []).map((c) => c.toLowerCase()));
    const key = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    let listed = 0;
    let modelled = 0;
    try {
      const [cr, pr] = await Promise.all([fetch('/__heat3d/unit-catalogs'), fetch('/__heat3d/model-pack')]);
      const cats = cr.status === 200 ? await cr.json() : { games: [] };
      const packsIdx = pr.status === 200 ? await pr.json() : { packs: [] };
      const names = new Set();
      const ids = new Set();
      for (const p of packsIdx.packs) for (const [u, e] of Object.entries(p.units)) {
        ids.add(u.toLowerCase());
        for (const n of [e.name, ...(e.names ?? [])]) if (n && key(n).length >= 3) names.add(key(n));
      }
      const items = new Map();
      for (const g of cats.games) for (const it of g.items) if (!items.has(it.id.toLowerCase())) items.set(it.id.toLowerCase(), it);
      for (const t of types) {
        const it = items.get(t);
        if (it) listed++;
        if (ids.has(t) || (it && names.has(key(it.key || it.name)))) modelled++;
      }
    } catch {
      // counts stay 0
    }
    st.getState().seek((d.timeRange[0] + d.timeRange[1]) / 2);
    st.getState().patchTimeline({ mode: 'play', window: 'cumulative', playing: true, speed: 4 });
    await new Promise((res) => setTimeout(res, 3000));
    const gaps = [];
    let last = performance.now();
    await new Promise((res) => {
      const tick = () => {
        const now = performance.now();
        gaps.push(now - last);
        last = now;
        if (gaps.length < 900) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
    return { rows: d.count, types: types.size, listed, modelled, gaps: gaps.slice(2) };
  }, name);
  await browser.close();
  const s = [...out.gaps].sort((a, b) => a - b);
  return { ...out, median: s[s.length >> 1], p99: s[Math.floor(s.length * 0.99)], max: s[s.length - 1] };
}

for (const packs of [false, true]) {
  const r = await run(packs);
  console.log(
    `${packs ? 'packs on ' : 'packs off'}: ${r.rows.toLocaleString()} rows, ${r.types} vehicle types (${r.listed} in a catalogue, ${r.modelled} drawn as a pack model); ` +
      `frames median ${r.median.toFixed(1)} ms, p99 ${r.p99.toFixed(1)} ms, max ${r.max.toFixed(1)} ms`,
  );
}
