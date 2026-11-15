/**
 * Screenshots for the documentation site, from the synthetic demo data only.
 *
 *   node tools/demo-data.mjs                       (once: makes tools/.shots/demo)
 *   HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1
 *   node tools/docs-shots.mjs [--lang en] [--only name,name] [--url http://127.0.0.1:5321/]
 *
 * Start the server WITHOUT a local figure pack (HEAT3D_FIGURE_PACK set to a
 * path that does not exist): the pictures show the public catalogue only.
 *
 * Every picture is taken with the viewer's UI in the language given (`--lang`,
 * any folder name under src/i18n/locales), so each language's pages can show
 * its own buttons. Pictures go to docs/assets/img/<lang>/<name>.webp; buttons
 * are found by their label in that language's locale files, never by English
 * text. Software rendering (SwiftShader) is used, as in tools/smoke.mjs, so
 * the run needs no GPU; the banner that warns about it is hidden.
 */
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const LANG = arg('lang', 'en');
const URL = arg('url', 'http://127.0.0.1:5321/');
const ONLY = arg('only', '')?.split(',').filter(Boolean) ?? [];
const REPO = resolve(import.meta.dirname, '..');
const OUT = join(REPO, 'docs', 'assets', 'img', LANG);
const DEMO = '/tools/.shots/demo';
mkdirSync(OUT, { recursive: true });

// Labels in the chosen language, English where a key has no translation.
const strings = {};
for (const lang of ['en', LANG]) {
  const dir = join(REPO, 'src', 'i18n', 'locales', lang);
  for (const f of readdirSync(dir)) if (f.endsWith('.json')) Object.assign(strings, JSON.parse(readFileSync(join(dir, f), 'utf8')));
}
const L = (key, values = {}) => {
  const s = strings[key];
  if (s === undefined) throw new Error(`no label ${key}`);
  return s.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? `{${k}}`);
};

const browser = await chromium.launch({
  args: [`--lang=${LANG}`, '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1, locale: LANG === 'no' ? 'nb' : LANG });
page.on('pageerror', (e) => console.log('  pageerror', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('  console', m.text().slice(0, 200)); });
await page.addInitScript((lang) => {
  localStorage.setItem('heat3d.language', lang);
  localStorage.setItem('heat3d.units', '{"preset":"metric","overrides":{}}');
}, LANG);
// The dev server's hot reload client is not wanted: a stand-in keeps the styles working.
await page.route('**/@vite/client', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'text/javascript',
    body: `const s=new Map();export function updateStyle(i,c){let e=s.get(i);if(!e){e=document.createElement('style');document.head.appendChild(e);s.set(i,e)}e.textContent=c}
export function removeStyle(i){s.get(i)?.remove();s.delete(i)}
export function createHotContext(){const n=()=>{};return{accept:n,acceptExports:n,acceptDeps:n,dispose:n,prune:n,decline:n,invalidate:n,on:n,off:n,send:n,data:{}}}
export function injectQuery(u){return u}export class ErrorOverlay extends HTMLElement{}`,
  }),
);

const wait = (ms) => page.waitForTimeout(ms);
const S = (fn, a) => page.evaluate(fn, a);

async function boot() {
  // The dev server may be busy with someone's edit: try the page again a few times.
  for (let i = 0; ; i++) {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForFunction(() => globalThis.__3dheat?.useStore.getState().stats.backend, null, { timeout: 30000 });
      break;
    } catch (e) {
      if (i >= 3) throw e;
      await wait(5000);
    }
  }
  // The software-rendering warning, the camera readout and the frame-rate panel
  // (a software rasteriser's frame rate says nothing about the viewer) are hidden.
  await page.addStyleTag({
    content: '[data-testid="software-rendering-warning"],.cam-readout,.stage .overlay:has(> .line){display:none!important}',
  });
  // the fly-speed box ("458 m/s - 26s to cross") is an unexplained distraction in a picture
  await page.evaluate((title) => { const st = document.createElement('style'); st.textContent = `[title="${title.replace(/"/g, '\\"')}"]{display:none!important}`; document.head.appendChild(st); }, L('heat.speedOverlay.title'));
  await wait(500);
}

/** Click a button or tab by its label in the current language. */
async function click(key, values, opts = {}) {
  const text = L(key, values);
  const loc = page.getByText(text, { exact: opts.exact ?? true });
  await loc.first().click({ timeout: 8000 });
  await wait(opts.wait ?? 300);
}
/** Open a collapsed sidebar section by its title. */
async function section(key, values) {
  const title = L(key, values);
  const head = page.locator('.section > header', { hasText: title }).first();
  const open = await head.evaluate((h) => h.parentElement.classList.contains('open'));
  if (!open) await head.click();
  await wait(300);
  await head.evaluate((h) => h.scrollIntoView({ block: 'start' }));
}
/** Close an open sidebar section by its title. */
async function collapse(key, values) {
  const head = page.locator('.section > header', { hasText: L(key, values) }).first();
  if (await head.evaluate((h) => h.parentElement.classList.contains('open')).catch(() => false)) await head.click();
  await wait(200);
}
/** Close every open sidebar section. */
async function collapseAll() {
  await page.evaluate(() => document.querySelectorAll('.section.open > header').forEach((h) => h.click()));
  await wait(300);
}
/** Scroll the sidebar to its top. */
const sideTop = () => page.locator('aside.sidebar').evaluate((e) => (e.scrollTop = 0)).then(() => wait(300));
const size = async (h = 900) => { await page.setViewportSize({ width: 1600, height: h }); await wait(1200); };
async function tab(key) {
  await page.locator('[role="tab"]', { hasText: L(key) }).first().click();
  await wait(600);
}
async function loadLevel(file) {
  await section('heat.levelPanel.title');
  const chooser = page.waitForEvent('filechooser');
  await click('heat.levelPanel.model');
  await (await chooser).setFiles(join(REPO, 'tools', '.shots', 'demo', file));
  await page.waitForFunction(() => globalThis.__3dheat.useStore.getState().level, null, { timeout: 60000 });
  await wait(800);
}
/** Load a demo table through the real ingest worker, named after its file. */
async function loadData(file) {
  await S(async (url) => {
    const { loader } = await import('/src/data/loader.ts');
    const { autoMap } = await import('/src/data/automap.ts');
    const { prepareUnits } = await import('/src/ui/replay/units.ts');
    const blob = await (await fetch(url)).blob();
    const f = new File([blob], url.split('/').pop());
    const p = await loader.preview(f);
    const mapping = autoMap({ columns: p.columns, rows: p.rows, numeric: p.numeric, logicalTypes: p.logicalTypes, hints: p.hints, constant: p.constant, fileCount: 1 });
    const size = await loader.measure([f]);
    const ds = await loader.ingest([f], mapping, p.columns, f.name, 1, size.rows);
    await prepareUnits(ds);
    globalThis.__3dheat.useStore.getState().setDataset(ds);
  }, `${DEMO}/${file}`);
  await wait(1500);
}
/** A module of the app, for its stores that are not on the window. */
// The URL the app itself loaded the module from: after a source file changes, the dev
// server adds a version query, and only that URL is the app's own instance.
const mod = (path, fn, a) =>
  S(async ([p, src, arg]) => {
    const seen = performance.getEntriesByType('resource').map((e) => e.name).filter((n) => new URL(n).pathname === p);
    const url = seen.length ? seen[seen.length - 1] : p;
    return new Function('m', 'arg', `return (${src})(m, arg)`)(await import(url), arg);
  }, [path, fn.toString(), a]);
async function camera(from, at) {
  await S(([f, a]) => {
    globalThis.__3dheat_engine.placeCamera(f, a);
    globalThis.__3dheat_engine.invalidate(10);
  }, [from, at]);
  await wait(1500);
}
const store = (fn, a) => S(fn, a);
async function insightsDone() {
  for (let i = 0; i < 120; i++) {
    if (await mod('/src/insights/store.ts', (m) => !!m.useInsights.getState().report)) return;
    await wait(1000);
  }
  throw new Error('insights never finished');
}

/** PNG bytes to WebP bytes, through the page's own canvas: no image library needed. */
async function toWebp(png, quality = 0.82) {
  const webp = await page.evaluate(
    async ([b64, q]) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', q).split(',')[1];
    },
    [png.toString('base64'), quality],
  );
  return Buffer.from(webp, 'base64');
}
function save(name, webp) {
  const file = join(OUT, `${name}.webp`);
  writeFileSync(file, webp);
  console.log(`  ${name}.webp ${(statSync(file).size / 1024).toFixed(0)} KB`);
}
/** Grab the window, a box or one element as PNG bytes (no waiting). */
async function grab(clip) {
  if (typeof clip === 'string') return page.locator(clip).first().screenshot();
  return page.screenshot(clip ? { clip } : {});
}
/** Take the picture: the whole window, or a box around one element. */
async function shot(name, clip, quality) {
  await wait(1200);
  save(name, await toWebp(await grab(clip), quality));
}
/**
 * Join pictures (PNG bytes) into one grid, each with a small caption in its corner.
 * cells: [{ png, caption }]; cols: columns; gap in pixels.
 */
async function compose(name, cells, cols = 2, { gap = 6, quality = 0.82, png = false, width = 0 } = {}) {
  const out = await page.evaluate(
    async ([items, cols, gap, asPng, cellW]) => {
      const imgs = await Promise.all(
        items.map(async (it) => {
          const i = new Image();
          i.src = `data:image/png;base64,${it.png}`;
          await i.decode();
          return i;
        }),
      );
      const k0 = cellW ? cellW / Math.max(...imgs.map((i) => i.width)) : 1;
      const sc = (i, k) => (items[k].w ? items[k].w / i.width : k0);
      const w = Math.round(Math.max(...imgs.map((i, k) => i.width * sc(i, k))));
      const h = Math.round(Math.max(...imgs.map((i, k) => i.height * sc(i, k))));
      const rows = Math.ceil(imgs.length / cols);
      const c = document.createElement('canvas');
      c.width = cols * w + (cols - 1) * gap;
      c.height = rows * h + (rows - 1) * gap;
      const g = c.getContext('2d');
      g.fillStyle = '#0c0d10';
      g.fillRect(0, 0, c.width, c.height);
      imgs.forEach((im, k) => {
        const x = (k % cols) * (w + gap);
        const y = Math.floor(k / cols) * (h + gap);
        g.drawImage(im, x, y, Math.round(im.width * sc(im, k)), Math.round(im.height * sc(im, k)));
        if (items[k].caption) {
          g.font = '600 15px system-ui, sans-serif';
          const tw = g.measureText(items[k].caption).width;
          g.fillStyle = 'rgba(12,13,16,0.82)';
          g.fillRect(x + 8, y + 8, tw + 16, 26);
          g.fillStyle = '#e8e8ec';
          g.fillText(items[k].caption, x + 16, y + 26);
        }
      });
      return c.toDataURL(asPng ? 'image/png' : 'image/webp', 0.82).split(',')[1];
    },
    [cells.map((c) => ({ png: c.png.toString('base64'), caption: c.caption, w: c.w })), cols, gap, png, width],
  );
  if (png) return Buffer.from(out, 'base64');
  save(name, Buffer.from(out, 'base64'));
}
/**
 * Draw marks on the page for the next picture: rings round things and numbered dots.
 * marks: [{ rect: [x,y,w,h] , n?: number, text?: string }] (page pixels).
 */
async function marks(list) {
  await page.evaluate((list) => {
    document.getElementById('shot-marks')?.remove();
    const root = document.createElement('div');
    root.id = 'shot-marks';
    root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;font:700 13px system-ui,sans-serif';
    for (const m of list) {
      if (m.rect) {
        const [x, y, w, h] = m.rect;
        const r = document.createElement('div');
        r.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border:2px solid #ffb020;border-radius:6px;box-shadow:0 0 0 1px #000a`;
        root.appendChild(r);
      }
      const label = m.n !== undefined ? String(m.n) : m.text;
      if (label !== undefined) {
        const at = m.at ?? (m.rect ? [m.rect[0] - 4, m.rect[1] - 4] : [0, 0]);
        const d = document.createElement('div');
        d.textContent = label;
        d.style.cssText = `position:absolute;left:${at[0]}px;top:${at[1]}px;${m.n !== undefined ? 'width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;' : 'padding:3px 8px;border-radius:5px;white-space:nowrap;'}background:#ffb020;color:#111;box-shadow:0 0 0 1px #000a`;
        root.appendChild(d);
      }
    }
    document.body.appendChild(root);
  }, list);
}
const clearMarks = () => page.evaluate(() => document.getElementById('shot-marks')?.remove());
/** The page box of an element found by text in a section, for marks. */
const boxOf = (loc) => loc.first().boundingBox();

// ------------------------------------------------------------------ the shots

// The demo valley's height, as tools/demo-data.mjs makes it.
function valleyH(x, z) {
  const ridge = 260 * Math.pow(Math.min(1, Math.abs(z) / 6000), 2) * 4;
  const roll = 35 * Math.sin(x / 700) * Math.cos(z / 600) + 12 * Math.sin(x / 190 + 1.3) * Math.sin(z / 230);
  const hill = (cx, cz, h, r) => h * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r));
  return 40 + ridge + roll + hill(-1200, 600, 70, 380) + hill(1300, -500, 70, 380) + hill(0, 1900, 50, 500);
}
const at = (x, z, up = 0) => ({ x, y: valleyH(x, z) + up, z });
const heat = (p) => store((q) => globalThis.__3dheat.useStore.getState().patchHeat(q), p);
const mode = (m) => store((q) => globalThis.__3dheat.useStore.getState().setMode(q), m);
const YARD = [{ x: 0, y: 120, z: -150 }, { x: 0, y: 0, z: 0 }];
const OVERVIEW = [{ x: -2300, y: 2300, z: 2500 }, { x: 0, y: 60, z: 0 }];

const SHOTS = {
  async tanks() {
    await boot();
    await loadLevel('demo-valley.glb');
    await loadData('tanks.parquet');
    await heat({ radius: 30 });
    await camera(...OVERVIEW);
    await collapseAll();
    await section('heat.levelPanel.title');
    await shot('level-panel', { x: 0, y: 0, width: 800, height: 900 });
    await collapseAll();
    await section('heat.heatPanel.shape');
    await shot('heat-hero');
    await collapseAll();

    await mode('heat-simple');
    await heat({ radius: 40, wedgeOpening: 70, dirSource: 'view', dirField: 'arrows', dirFieldSpacing: 36 });
    await section('direction.section');
    await wait(8000);
    await camera({ x: -1250, y: 2300, z: 1500 }, { x: -1100, y: 60, z: 400 });
    await shot('direction');
    await heat({ wedgeOpening: 360, dirField: 'off', dirSource: 'auto' });

    await camera(...OVERVIEW);
    await collapseAll();
    await section('heat.filterPanel.title');
    await shot('filters', { x: 0, y: 0, width: 800, height: 900 });
    await collapseAll();

    // value weighting: the totals in the panel, the hot spots in the view
    await section('value.section');
    await heat({ weightBy: 'cost_lost_usd', radius: 45 });
    await camera({ x: -1900, y: valleyH(-1900, 1500) + 520, z: 1500 }, at(-1200, 600, 0));
    await shot('value');
    await heat({ weightBy: null, radius: 30 });
    await collapseAll();

    // volumes round the two hills and the village; the Village selected, so its handles show
    await section('volumes.title');
    await wait(800);
    await mod('/src/volumes/store.ts', (m) => {
      const v = m.useVolumeStore.getState();
      v.clear();
      v.add({ kind: 'cylinder', x: -1200, z: 600, radius: 380, floor: 0, ceil: 400 }, 'West hill');
      v.add({ kind: 'cylinder', x: 1300, z: -500, radius: 380, floor: 0, ceil: 400 }, 'East hill');
      v.add({ kind: 'box', center: [0, 150, 0], size: [600, 300, 600], yaw: 0, pitch: 0, roll: 0 }, 'Village');
    });
    await camera({ x: -2000, y: 1500, z: 1800 }, { x: 0, y: 60, z: 0 });
    await section('volumes.title');
    await shot('volumes');
    // the Compare window, Table then Bars
    await click('compare.open', {}, { wait: 1500 });
    await shot('compare');
    await page.getByRole('button', { name: L('compare.view.bars'), exact: true }).first().click();
    await wait(1200);
    await shot('compare-bars');
    await page.getByRole('button', { name: L('compare.view.table'), exact: true }).first().click();
    await page.getByRole('button', { name: L('compare.close') }).first().click();
    await wait(600);
    await collapseAll();
    await mod('/src/ui/breakdown/BreakdownPanel.tsx', (m) => m.openBreakdown('all'));
    await mod('/src/ui/breakdown/BreakdownPanel.tsx', (m) => m.useBreakdownUi.getState().set({ dimId: 'cat:vehicle' }));
    await shot('breakdown');
    await mod('/src/ui/breakdown/BreakdownPanel.tsx', (m) => m.useBreakdownUi.getState().set({ open: false, view: 'rank' }));

    await section('insights.title');
    await insightsDone();
    await shot('insights');
    await click('insights.tab.debrief');
    await shot('debrief', { x: 0, y: 0, width: 800, height: 900 });
    await click('insights.tab.findings');
    await page.locator('.ins-head').first().click().catch(() => {});
    await page.locator('.ins-list').first().evaluate((e) => e.scrollIntoView({ block: 'start' })).catch(() => {});
    await wait(2500);
    await shot('insights-finding');

    // The figure replay: the Match tab on one match, a burning tank and a wreck.
    await mod('/src/volumes/store.ts', (m) => m.useVolumeStore.getState().clear());
    await tab('app.tab.match');
    await store(() => {
      const s = globalThis.__3dheat.useStore.getState();
      s.patchTeam({ session: s.dataset.sessionLabels.indexOf('Match 01') });
      s.patchTimeline({ mode: 'play', window: 'lifetime' });
      s.setPlaying(false);
      s.seek(306);
    });
    await section('units.figures.title');
    await store(() => {
      const s = globalThis.__3dheat.useStore.getState();
      const r = globalThis.__3dheat_replay.getState();
      r.patchSaved({ followMode: 'orbit' });
      r.setFollowDistance(28);
      r.toggleFollow(s.dataset.personLabels.indexOf('Red 2'), 'Red 2');
    });
    await wait(3000);
    await shot('replay-tanks');
    await store(() => {
      const s = globalThis.__3dheat.useStore.getState();
      globalThis.__3dheat_replay.getState().toggleFollow(s.dataset.personLabels.indexOf('Red 2'), 'Red 2');
    });
    await store(() => globalThis.__3dheat.useStore.getState().patchTeam({ figureScale: 3 }));
    await camera({ x: -300, y: 1400, z: 1300 }, at(0, 0));
    await shot('replay-overview');
    await tab('app.tab.heat');
  },

  async air() {
    await boot();
    await loadLevel('demo-valley.glb');
    await loadData('air.parquet');
    await tab('app.tab.match');
    await store(() => {
      const s = globalThis.__3dheat.useStore.getState();
      s.patchTeam({ figureScale: 4 });
      s.patchTimeline({ mode: 'play', window: 'lifetime' });
      s.setPlaying(false);
      s.seek(52);
    });
    await collapseAll();
    await section('replay.look.title');
    await camera({ x: -3600, y: 5200, z: 3800 }, { x: 3200, y: 3300, z: 0 });
    await shot('replay-air');
    await click('replay.look.on', {}, { wait: 1500 });
    await shot('replay-air-tactical');
    await click('replay.look.on', {}, { wait: 800 });
  },

  async shooter() {
    await boot();
    await loadLevel('demo-yard.glb');
    await loadData('shooter.parquet');
    await heat({ radius: 2 });
    await camera({ x: 0, y: 105, z: -125 }, { x: 0, y: 0, z: 0 });
    await shot('shooter-heat');
    await section('insights.title');
    await insightsDone();
    await click('insights.tab.caster');
    await shot('caster');
    await mod('/src/ui/breakdown/BreakdownPanel.tsx', (m) => m.openBreakdown('all'));
    await mod('/src/ui/breakdown/BreakdownPanel.tsx', (m) => m.useBreakdownUi.getState().set({ view: 'factors' }));
    await shot('breakdown-factors');
  },

  async lean() {
    await boot();
    await loadLevel('demo-valley.glb');
    await section('lean.title');
    const files = readdirSync(join(REPO, 'tools', '.shots', 'demo', 'tanks')).map((f) => join(REPO, 'tools', '.shots', 'demo', 'tanks', f));
    const chooser = page.waitForEvent('filechooser');
    await page.locator('.section.open', { has: page.locator('header', { hasText: L('lean.title') }) }).getByText(L('lean.pickFiles'), { exact: true }).first().click();
    await (await chooser).setFiles(files);
    await wait(8000);
    await page.locator('.section.open', { has: page.locator('header', { hasText: L('lean.title') }) }).getByText(L('lean.byMatch'), { exact: true }).first().click().catch(() => {});
    await store(() => globalThis.__3dheat.useStore.getState().seek(300));
    await collapse('heat.datasetPanel.title');
    await section('lean.title');
    await camera({ x: -1600, y: valleyH(-1600, 1050) + 330, z: 1050 }, at(-1200, 600, 0));
    await shot('many-matches');
  },

  // Heat pages that need the valley: sprite radius, depth, culling.
  async heatvalley() {
    await boot();
    await loadLevel('demo-valley.glb');
    await loadData('tanks.parquet');
    await collapseAll();
    const SPOT = [{ x: -1500, y: valleyH(-1500, 900) + 230, z: 1050 }, at(-1200, 600, 20)];
    const crop = { x: 480, y: 170, width: 700, height: 480 };
    const cells = [];
    for (const r of [2, 6, 20]) {
      await heat({ radius: r });
      await camera(...SPOT);
      cells.push({ png: await grab(crop), caption: `Sprite radius ${r} m` });
    }
    await compose('sprite-shape-radius', cells, 3, { width: 560 });
    await heat({ radius: 30 });

    // Depth: the same low camera with the terrain hiding nothing, then hiding what is behind it
    await heat({ radius: 12 });
    await section('heat.heatPanel.depth');
    const LOW = [{ x: -2300, y: valleyH(-2300, 600) + 3, z: 600 }, { x: 1300, y: 40, z: -500 }];
    const pair = [];
    for (const [on, cap] of [[false, 'Hide behind terrain: off'], [true, 'Hide behind terrain: on']]) {
      await heat({ hideBehindGround: on, occlusion: on ? 0.8 : 0 });
      await camera(...LOW);
      pair.push({ png: await grab({ x: 0, y: 0, width: 1322, height: 640 }), caption: cap });
    }
    await compose('depth-and-culling-terrain', pair, 2, { width: 760 });
    await heat({ hideBehindGround: true, occlusion: 0.8 });

    // Distance culling: a slab of the level round the camera
    await collapse('heat.heatPanel.depth');
    await section('heat.heatPanel.culling');
    await heat({ cullFar: 400, cullPlanar: true, cullGeometry: true, radius: 14 });
    await camera({ x: -1500, y: valleyH(-1500, 900) + 150, z: 900 }, at(-1300, 700, 0));
    await shot('depth-and-culling-far', { x: 0, y: 0, width: 1322, height: 700 });
    await heat({ cullFar: 0 });
  },

  // The heat pages, on the demo yard with the 5v5 shooter data.
  async heat() {
    await boot();
    await loadLevel('demo-yard.glb');
    await loadData('shooter.parquet');
    await heat({ radius: 2 });
    await collapseAll();
    await camera(...YARD);
    // the mode bar
    await sideTop();
    await shot('heat-modes-bar', { x: 0, y: 108, width: 322, height: 76 });
    // four modes on the same camera
    const view = { x: 500, y: 190, width: 920, height: 500 };
    const cells = [];
    for (const [m, cap] of [['heat-simple', 'Heat'], ['heat-difference', 'Difference'], ['heat-teams', 'Team heat'], ['heat-lines', 'Lines']]) {
      await mode(m);
      await camera(...YARD);
      await wait(1500);
      cells.push({ png: await grab(view), caption: cap });
    }
    await compose('heat-modes-grid', cells, 2);
    await mode('heat-simple');

    // the heat panels: shape (its lower half) and colours side by side
    await section('heat.heatPanel.colours');
    await section('heat.heatPanel.shape');
    const side = { x: 0, y: 0, width: 322, height: 900 };
    await page.locator('.section.open', { hasText: L('heat.heatPanel.zoomInvariant') }).getByText(L('heat.heatPanel.zoomInvariant'), { exact: true }).first().evaluate((e) => e.scrollIntoView({ block: 'end' }));
    await wait(500);
    const a = await grab(side);
    await section('heat.heatPanel.colours');
    const b = await grab(side);
    await compose('heat-panel', [{ png: a }, { png: b }], 2);
    await collapse('heat.heatPanel.shape');

    // Difference: group A (+) against group B (-), the split and both ramps in the sidebar
    await collapseAll();
    await mode('heat-difference');
    await section('heat.splitPanel.title');
    await section('heat.teamsList.title');
    await section('heat.heatPanel.colours');
    await size(1180);
    await camera(...YARD);
    await marks([{ text: '+  Blue team: red and yellow', at: [340, 16] }, { text: '−  Red team: green and blue', at: [340, 48] }]);
    await shot('difference-split');
    await shot('heat-difference');
    await clearMarks();
    await size(900);

    await collapseAll();
    await mode('heat-teams');
    await section('heat.teamsList.title');
    await section('heat.heatPanel.colours');
    await camera(...YARD);
    await shot('heat-teams');
    await collapseAll();
    await mode('heat-lines');
    await section('heat.linePanel.title');
    await camera(...YARD);
    await shot('heat-lines');
    await mode('heat-simple');

    // the colour ramp editor on its own
    await collapseAll();
    await section('heat.heatPanel.colours');
    await shot('colour-and-exposure-ramp', { x: 0, y: 0, width: 322, height: 440 });

    // six curve presets: the cross-section editor next to the same hot spot drawn with it
    await collapseAll();
    await section('heat.heatPanel.shape');
    await page.locator('.section.open').getByText(L('heat.heatPanel.curve'), { exact: true }).first().click();
    await wait(400);
    await heat({ radius: 3 });
    await camera({ x: -22, y: 55, z: 49.1 }, { x: -22, y: 0, z: 49 });
    const tiles = [];
    for (const k of ['linear', 'smooth', 'tight', 'plateau', 'ring', 'shelf']) {
      await page.getByTitle(L('heat.curveEditor.presetTitle', { preset: L('heat.curveEditor.preset.' + k) })).first().click();
      await wait(1500);
      const ed = await grab('[data-testid="curve-editor"]');
      const vw = await grab({ x: 752, y: 330, width: 330, height: 270 });
      tiles.push({ png: await compose('', [{ png: ed, w: 300 }, { png: vw }], 2, { png: true, gap: 4 }), caption: L('heat.curveEditor.preset.' + k) });
    }
    await compose('sprite-shape-presets', tiles, 2, { gap: 8 });
    await heat({ radius: 2 });
  },

  // The figure overlay and the timeline bar, on the valley with the tanks.
  async timeline() {
    await boot();
    await loadLevel('demo-valley.glb');
    await loadData('tanks.parquet');
    await collapseAll();
    await mode('team');
    await store(() => {
      const s = globalThis.__3dheat.useStore.getState();
      s.patchTeam({ trailSeconds: 30, figureScale: 3 });
      s.patchTimeline({ mode: 'play', window: 'lifetime' });
      s.setPlaying(false);
      s.seek(30);
    });
    await section('heat.teamPanel.title');
    await camera({ x: -170, y: valleyH(-170, 300) + 130, z: 300 }, at(0, 0, 0));
    await shot('box-replay-overlay');
    await store(() => {
      const s = globalThis.__3dheat.useStore.getState();
      s.patchTimeline({ window: 'fixed', windowSeconds: 30 });
    });
    await wait(800);
    await marks([1, 2, 3, 4, 5].map((n, i) => ({ n, at: [[338, 842], [411, 842], [540, 842], [718, 842], [845, 842]][i] })));
    await shot('timeline-bar', { x: 322, y: 808, width: 1278, height: 92 });
    await clearMarks();
  },

  // Getting data in: the Source panel and the column mapping, through the real file chooser.
  async data() {
    const tanks = readdirSync(join(REPO, 'tools', '.shots', 'demo', 'tanks')).map((f) => join(REPO, 'tools', '.shots', 'demo', 'tanks', f));
    const pick = async (files, key) => {
      const chooser = page.waitForEvent('filechooser');
      await click(key);
      await (await chooser).setFiles(files);
      await wait(5000);
    };
    const src = page.locator('.section.open', { has: page.locator('header', { hasText: L('heat.sourcePanel.title') }) });
    await boot();
    await collapseAll();
    await section('heat.sourcePanel.title');
    await pick(tanks, 'heat.sourcePanel.files');
    const box = async (loc) => (await loc.first().boundingBox());
    const r1 = await box(src.getByText(/^10 files$/));
    const r2 = await box(src.getByText(L('heat.sourcePanel.memory'), { exact: true }));
    const r3 = await box(src.getByRole('button', { name: /^Load 10 files$/ }));
    await marks([
      { rect: [r1.x - 4, r1.y + 22, 300, 22], n: 1, at: [292, r1.y - 6] },
      { rect: [r2.x - 4, r2.y - 3, 310, 22], n: 2, at: [292, r2.y - 22] },
      { rect: [r3.x - 2, r3.y - 2, r3.width + 4, r3.height + 4], n: 3, at: [292, r3.y - 24] },
    ]);
    await shot('loading-files-source', { x: 0, y: 225, width: 322, height: 430 });
    await clearMarks();

    // the mapping of one file, every box filled
    await collapseAll();
    await sideTop();
    await section('heat.sourcePanel.title');
    await pick([join(REPO, 'tools', '.shots', 'demo', 'shooter.parquet')], 'heat.sourcePanel.oneFile');
    await size(1500);
    await page.locator('aside.sidebar').evaluate((e) => (e.scrollTop = 560));
    await wait(500);
    const lab = async (txt) => (await page.locator('aside.sidebar').getByText(txt, { exact: true }).first().boundingBox());
    const cal = [];
    let n = 1;
    for (const t of ['X', 'Y', 'Z', L('heat.sourcePanel.time'), L('heat.sourcePanel.personId'), L('heat.sourcePanel.session'), L('heat.sourcePanel.team')]) {
      const b = await lab(t);
      cal.push({ n: n++, at: [290, b.y - 3] });
    }
    await marks(cal);
    await shot('column-mapping-panel', { x: 0, y: 195, width: 322, height: 820 });
    await clearMarks();
    await size(900);

    // a budget too small for the ten matches: won't fit
    await boot();
    await collapseAll();
    await store(() => {
      const s = globalThis.__3dheat.useStore.getState();
      s.setBudgets({ ...s.budgets, ram: 6e6 });
    });
    await section('heat.sourcePanel.title');
    await pick(Array.from({ length: 24 }, () => tanks).flat(), 'heat.sourcePanel.files');
    await src.locator('input').filter({ hasNot: page.locator('[type=file]') }).first().fill('1');
    await wait(1500);
    await shot('memory-and-budgets-wont-fit', { x: 0, y: 225, width: 322, height: 600 });

    // the session picker open on ten matches
    await boot();
    await loadLevel('demo-valley.glb');
    await loadData('tanks.parquet');
    await collapseAll();
    await sideTop();
    await page.locator('aside.sidebar select').filter({ has: page.locator('option', { hasText: /Match 01/ }) }).first().evaluate((e) => {
      e.selectedIndex = 0;
      e.size = Math.min(7, e.options.length);
      e.style.height = 'auto';
    });
    await wait(500);
    await shot('sessions-persons-groups-picker', { x: 0, y: 170, width: 322, height: 250 });

    // the generator: one million rows, eight teams
    await boot();
    await collapseAll();
    await section('heat.datasetPanel.title');
    await page.locator('aside.sidebar input[type="text"]').first().fill('1');
    await click('heat.datasetPanel.generate', {}, { wait: 500 });
    await page.waitForFunction(() => globalThis.__3dheat.useStore.getState().dataset, null, { timeout: 120000 });
    await wait(3000);
    await mode('heat-teams');
    await collapse('heat.teamsList.title');
    await heat({ radius: 60, minHeat: 0 });
    await camera({ x: -1300, y: 1500, z: 1300 }, { x: 0, y: 0, z: 0 });
    await section('heat.datasetPanel.title');
    await shot('synthetic-generator-team-heat');
  },

  // The tool panels of the Heatmap sidebar.
  async tools() {
    await boot();
    await loadLevel('demo-valley.glb');
    await loadData('tanks.parquet');
    await collapseAll();
    // a numeric range filter with both ends dragged in
    await store(() => {
      const s = globalThis.__3dheat.useStore.getState();
      const col = s.dataset.attrs.find((a) => a.name === 'cost_lost_usd');
      const span = col.max - col.min;
      s.setFilters([{ kind: 'range', column: 'cost_lost_usd', min: col.min + span * 0.18, max: col.max - span * 0.35 }]);
    });
    await section('heat.filterPanel.title');
    await page.locator('aside.sidebar').getByText('cost_lost_usd', { exact: true }).first().evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await wait(400);
    await shot('filters-numeric', { x: 0, y: 0, width: 322, height: 900 });
    await store(() => globalThis.__3dheat.useStore.getState().setFilters([]));
    await collapse('heat.filterPanel.title');

    // the slice: a thin slab through the hill
    await heat({ radius: 14 });
    await store(() => globalThis.__3dheat.useStore.getState().patchSlice({ enabled: true, axis: 'y', center: 85, thickness: 30, outsideOpacity: 0, clipHeat: true }));
    await section('heat.slicePanel.title');
    await camera({ x: -2000, y: 700, z: 1700 }, at(-1000, 500, 0));
    await shot('slice-on');
    await store(() => globalThis.__3dheat.useStore.getState().patchSlice({ enabled: false }));
    await collapse('heat.slicePanel.title');

    // the ruler: three points on the village
    await heat({ radius: 9 });
    await section('heat.measurePanel.title');
    await click('heat.measurePanel.active');
    await camera({ x: 0, y: 420, z: 0.1 }, { x: 0, y: 0, z: 0 });
    const c = { x: 961, y: 404 };
    for (const [dx, dy] of [[-120, 60], [20, -50], [130, 40]]) {
      await page.mouse.move(c.x + dx, c.y + dy);
      await wait(400);
      await page.mouse.click(c.x + dx, c.y + dy, { delay: 80 });
      await wait(500);
    }
    await page.mouse.move(c.x + 160, c.y - 20);
    await section('heat.measurePanel.title');
    await wait(800);
    await shot('measure-ruler');
  },

  // Teams and Entities on the 5 against 5 data; hits on one tank.
  async tools2() {
    await boot();
    await loadLevel('demo-yard.glb');
    await loadData('shooter.parquet');
    await collapseAll();
    const crop = async (name, key, h = 330) => {
      const head = page.locator('.section.open > header', { hasText: L(key) }).first();
      await head.evaluate((e) => e.scrollIntoView({ block: 'start' }));
      await wait(300);
      const b = await head.boundingBox();
      await shot(name, { x: 0, y: Math.max(0, b.y - 6), width: 322, height: h });
    };
    await section('heat.teamsList.title');
    await crop('teams-list', 'heat.teamsList.title', 200);
    await mode('heat-difference');
    await store(() => {
      const s = globalThis.__3dheat.useStore.getState();
      const n = s.dataset.teamLabels.length;
      s.setTeamSplit([0], [1].slice(0, n - 1));
    });
    await wait(500);
    await section('heat.teamsList.title');
    await crop('teams-list-difference', 'heat.teamsList.title', 270);
    await mode('heat-simple');
    await collapse('heat.teamsList.title');

    // two ticked players
    await section('heat.entityPanel.title');
    const ent = page.locator('.section.open', { has: page.locator('header', { hasText: L('heat.entityPanel.title') }) });
    await ent.locator('input[type="checkbox"]').nth(0).check();
    await ent.locator('input[type="checkbox"]').nth(2).check();
    await wait(600);
    await crop('entities-selected', 'heat.entityPanel.title', 420);
    await collapse('heat.entityPanel.title');

    // hits on one vehicle
    await boot();
    await loadLevel('demo-valley.glb');
    await loadData('tanks.parquet');
    await tab('vehicle.tab.label');
    await wait(1200);
    // (the first vehicle, a T-72B3: the demo hits on it are painted on the figure's side)
    await wait(1500);
    await collapse('vehicle.area.title');
    await collapse('vehicle.look.title');
    await section('vehicle.breakdown.title');
    await shot('hit-analysis-tank');
  },

  async misc() {
    await boot();
    await loadLevel('demo-valley.glb');
    await loadData('tanks.parquet');
    await collapseAll();
    await sideTop();
    await page.getByTitle(L('help.toggle')).first().click();
    await wait(800);
    // ring the ? and the units ... buttons the page talks about
    await marks([{ rect: [82, 12, 26, 26] }, { rect: [185, 12, 26, 26] }]);
    await shot('help');
    await clearMarks();
    await page.getByTitle(L('help.toggle')).first().click();
  },

  // A Counter-Strike 2 plan on the demo yard: three T players, a smoke, an area, two steps.
  async tactics() {
    await boot();
    await loadLevel('demo-yard.glb');
    await tab('app.tab.plan');
    await wait(800);
    await mod('/src/state/planStore.ts', (m) => {
      const st = m.useStore ?? m.usePlanStore;
      const store = m.usePlanStore;
      store.getState().setGame('cs2');
      const plan = store.getState().plan;
      const P = (x, z) => ({ x, y: 0, z });
      const t = 't';
      const fig = (id, label, x, z, x2, z2) => ({ id, kind: 'soldier', team: t, label, from: 0, keys: { 0: { ...P(x, z), yaw: 0 }, 1: { ...P(x2, z2), yaw: 0 } } });
      plan.figures = [
        fig('f1', 'T 1', -42, 52, -30, 26),
        fig('f2', 'T 2', -8, 56, -6, 30),
        fig('f3', 'T 3', 34, 52, 24, 20),
        { id: 'sm', kind: 'cs2-smoke', team: t, label: 'Smoke', from: 0, keys: { 0: { ...P(-6, 0), yaw: 0 } } },
      ];
      plan.arrows = [
        { id: 'a1', step: 0, team: t, style: 'move', figure: 'f1', points: [P(-42, 52), P(-36, 38), P(-30, 26)] },
        { id: 'a2', step: 0, team: t, style: 'move', figure: 'f2', points: [P(-8, 56), P(-6, 30)] },
        { id: 'a3', step: 0, team: t, style: 'move', figure: 'f3', points: [P(34, 52), P(28, 34), P(24, 20)] },
        { id: 'a4', step: 0, team: t, style: 'throw', figure: 'f3', lands: 'sm', points: [P(34, 52), P(-6, 0)] },
        { id: 'a5', step: 1, team: t, style: 'move', figure: 'f2', points: [P(-6, 30), P(-4, 8)] },
      ];
      plan.areas = [{ id: 'ar1', step: 0, team: t, centre: P(-30, 20), radius: 9, label: 'A site' }];
      plan.steps = [{ name: '1', seconds: 4 }, { name: '2', seconds: 4 }];
      plan.title = 'Demo A execute';
      plan.figureScale = 5;
      plan.unitsPerMetre = 1;
      store.setState({ plan: { ...plan }, step: 0, tool: 'select' });
    });
    await click('tactics.topView', {}, { wait: 1500 });
    await collapseAll();
    await section('tactics.title');
    await sideTop();
    await shot('tactics');
  },
};

// More shot groups live in tools/docs-shots-<name>.mjs: each default-exports a
// function that takes the helpers below and returns { groupName: async () => {} }.
const ctx = { page, L, wait, size, sideTop, grab, compose, marks, clearMarks, boxOf, toWebp, save, S, boot, click, section, collapse, collapseAll, tab, loadLevel, loadData, camera, mod, store, shot, heat, mode, at, valleyH, OVERVIEW, insightsDone, REPO, DEMO, LANG };
for (const f of readdirSync(join(REPO, 'tools')).filter((n) => /^docs-shots-[\w-]+\.mjs$/.test(n)).sort()) {
  try {
    Object.assign(SHOTS, (await import(pathToFileURL(join(REPO, 'tools', f)).href + `?t=${Date.now()}`)).default(ctx));
  } catch (e) {
    console.log(`  skipped ${f}: ${String(e.message).slice(0, 120)}`);
  }
}

let ok = 0;
for (const [name, fn] of Object.entries(SHOTS)) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  console.log(name);
  try {
    await fn();
    ok++;
  } catch (e) {
    console.log(`  FAILED ${e.message.split('\n')[0]}`);
    await page.screenshot({ path: join(REPO, 'tools', '.shots', `fail-${name}.png`) }).catch(() => {});
  }
}
await browser.close();
console.log(`${ok} shot groups done, language ${LANG}`);
