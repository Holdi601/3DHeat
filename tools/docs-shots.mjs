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
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.__3dheat?.useStore.getState().stats.backend, null, { timeout: 30000 });
  // The software-rendering warning, the camera readout and the frame-rate panel
  // (a software rasteriser's frame rate says nothing about the viewer) are hidden.
  await page.addStyleTag({
    content: '[data-testid="software-rendering-warning"],.cam-readout,.stage .overlay:has(> .line){display:none!important}',
  });
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

/** Take the picture: the whole window, or a box around one element. */
async function shot(name, clip) {
  await wait(1200);
  let png;
  if (typeof clip === 'string') png = await page.locator(clip).first().screenshot();
  else png = await page.screenshot(clip ? { clip } : {});
  // WebP through the page's own canvas: no image library needed.
  const webp = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.82).split(',')[1];
  }, png.toString('base64'));
  const file = join(OUT, `${name}.webp`);
  writeFileSync(file, Buffer.from(webp, 'base64'));
  console.log(`  ${name}.webp ${(statSync(file).size / 1024).toFixed(0)} KB`);
}

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
const OVERVIEW = [{ x: -2300, y: 2300, z: 2500 }, { x: 0, y: 60, z: 0 }];

const SHOTS = {
  async tanks() {
    await boot();
    await loadLevel('demo-valley.glb');
    await loadData('tanks.parquet');
    await heat({ radius: 30 });
    await camera(...OVERVIEW);
    await shot('heat-hero');
    await shot('level-panel', { x: 0, y: 0, width: 800, height: 900 });

    await mode('heat-difference');
    await camera(...OVERVIEW);
    await shot('heat-difference');
    await mode('heat-teams');
    await camera(...OVERVIEW);
    await shot('heat-teams');
    await mode('heat-lines');
    await camera(...OVERVIEW);
    await shot('heat-lines');

    await mode('heat-simple');
    await heat({ radius: 40, wedgeOpening: 70, dirSource: 'view', dirField: 'arrows', dirFieldSpacing: 36 });
    await section('direction.section');
    await wait(8000);
    await camera({ x: -1250, y: 2300, z: 1500 }, { x: -1100, y: 60, z: 400 });
    await shot('direction');
    await heat({ wedgeOpening: 360, dirField: 'off', dirSource: 'auto' });

    await camera(...OVERVIEW);
    await section('heat.filterPanel.title');
    await shot('filters', { x: 0, y: 0, width: 800, height: 900 });
    await section('value.section');
    await heat({ weightBy: 'cost_lost_usd' });
    await camera(...OVERVIEW);
    await shot('value');
    await heat({ weightBy: null });


    // volumes round the two hills and the village
    await section('volumes.title');
    await wait(800);
    await mod('/src/volumes/store.ts', (m) => {
      const v = m.useVolumeStore.getState();
      v.clear();
      v.add({ kind: 'cylinder', x: -1200, z: 600, radius: 380, floor: 0, ceil: 400 }, 'West hill');
      v.add({ kind: 'cylinder', x: 1300, z: -500, radius: 380, floor: 0, ceil: 400 }, 'East hill');
      v.add({ kind: 'box', center: [0, 150, 0], size: [600, 300, 600], yaw: 0, pitch: 0, roll: 0 }, 'Village');
    });
    await camera(...OVERVIEW);
    await shot('volumes');
    await mod('/src/ui/compare/ComparePanel.tsx', (m) => m.useCompareUi.getState().set({ open: true, view: 'table' }));
    await shot('compare');
    await mod('/src/ui/compare/ComparePanel.tsx', (m) => m.useCompareUi.getState().set({ open: true, view: 'bars', dim: 'events' }));
    await shot('compare-bars');
    await mod('/src/ui/compare/ComparePanel.tsx', (m) => m.useCompareUi.getState().set({ open: false }));
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
    await store(() => globalThis.__3dheat.useStore.getState().patchTeam({ farMode: 'symbol', symbolStyle: 'nato', figureScale: 1 }));
    await camera({ x: -600, y: 3000, z: 2600 }, at(0, 0));
    await shot('replay-symbols');
    await store(() => globalThis.__3dheat.useStore.getState().patchTeam({ symbolStyle: 'russian' }));
    await shot('replay-symbols-russian');
    await store(() => globalThis.__3dheat.useStore.getState().patchTeam({ farMode: 'figure', symbolStyle: 'nato' }));
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
    await section('replay.aids.title');
    await camera({ x: -9000, y: 9000, z: 9000 }, { x: 0, y: 4000, z: 0 });
    await shot('replay-air');
    await page.keyboard.press('t');
    await wait(1500);
    await shot('replay-air-tactical');
    await page.keyboard.press('t');
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
    await camera({ x: -1800, y: 1800, z: 2000 }, at(0, 0));
    await shot('many-matches');
  },

  async misc() {
    await boot();
    await page.getByTitle(L('help.toggle')).first().click();
    await wait(800);
    await shot('help');
    await page.getByTitle(L('help.toggle')).first().click();
    await tab('app.tab.plan');
    await shot('tactics', { x: 0, y: 0, width: 800, height: 900 });
  },
};

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
