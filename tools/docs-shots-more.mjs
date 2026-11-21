/**
 * More documentation pictures (replay, levels, viewer settings, mass analysis,
 * match analysis, notices), from the synthetic demo data only. Loaded by
 * tools/docs-shots.mjs, which hands over its helpers; run with
 *   node tools/docs-shots.mjs --lang en --only <group>
 */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import zlib from 'node:zlib';

/** A PNG of the demo valley seen from above (hill shading and height tint), covering x -2900..2900, z -1500..1500. */
function mapPng(valleyH, w = 720, h = 372) {
  const x0 = -2900, x1 = 2900, z0 = -1500, z1 = 1500;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let j = 0; j < h; j++) {
    raw[j * (w * 3 + 1)] = 0;
    for (let i = 0; i < w; i++) {
      const x = x0 + ((x1 - x0) * i) / (w - 1);
      const z = z0 + ((z1 - z0) * j) / (h - 1);
      const y = valleyH(x, z);
      const shade = 0.5 + ((valleyH(x - 40, z - 40) - valleyH(x + 40, z + 40)) / 80) * 0.6;
      const t = Math.min(1, Math.max(0, (y - 20) / 160));
      const base = [150 + 70 * t, 170 + 30 * t, 120 + 30 * t];
      const contour = Math.abs(((y / 15) % 1) - 0.5) < 0.04 ? 0.82 : 1;
      const k = (j * (w * 3 + 1)) + 1 + i * 3;
      for (let c = 0; c < 3; c++) raw[k + c] = Math.max(0, Math.min(255, base[c] * shade * contour * 1.1));
    }
  }
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, cr]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

export default (ctx) => {
  const { page, L, wait, boot, click, section, tab, loadLevel, loadData, camera, mod, store, shot, heat, mode, at, valleyH, OVERVIEW, REPO, DEMO } = ctx;
  const SHOTS_DIR = join(REPO, 'tools', '.shots');

  /** The sidebar and the first part of the view: where the page's panel and its effect show together. */
  const WIDE = { x: 0, y: 0, width: 1000, height: 900 };
  /** Scrolls the sidebar so a section's title is at its top. */
  const sidebarTop = () => page.evaluate(() => document.querySelector('.sidebar')?.scrollTo(0, 0));
  const sidebarBox = () => page.locator('.sidebar').first().boundingBox();
  const demoSetup = async (level = 'demo-valley.glb', data = 'tanks.parquet') => {
    await boot();
    await loadLevel(level);
    await loadData(data);
    await heat({ radius: 30 });
  };
  const openSections = async (...keys) => {
    for (const k of keys) await section(k);
  };
  /** Collapses a section if it is open. */
  const closeSection = async (key) => {
    const head = page.locator('.section > header', { hasText: L(key) }).first();
    if (await head.evaluate((h) => h.parentElement.classList.contains('open'))) await head.click();
    await wait(200);
  };

  const VIEW = { width: 1600, height: 900 };
  /** A taller window for a picture of a long panel; back to the usual size after. */
  const tall = async (h, fn) => {
    await page.setViewportSize({ width: 1600, height: h });
    await wait(500);
    try {
      await fn();
    } finally {
      await page.setViewportSize(VIEW);
      await wait(300);
    }
  };
  /** A panel's section (a `.section` whose header holds the title). */
  const sec = (key) => page.locator('.section', { has: page.locator('> header', { hasText: L(key) }) }).first();
  const rect = (loc) => loc.evaluate((e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; });
  /** Puts a ring round an element (for a button the page text points at). */
  const ring = (loc) => loc.evaluate((e) => { e.style.outline = '3px solid #ff9f1c'; e.style.outlineOffset = '2px'; e.style.borderRadius = '6px'; });

  /** A picture taken now (no settling wait), written as WebP like `shot`. */
  const webp = async (name, png) => {
    const b64 = await page.evaluate(async (b) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', 0.82).split(',')[1];
    }, png.toString('base64'));
    const dir = join(REPO, 'docs', 'assets', 'img', ctx.LANG);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${name}.webp`), Buffer.from(b64, 'base64'));
    console.log(`  ${name}.webp ${(Buffer.from(b64, 'base64').length / 1024).toFixed(0)} KB`);
  };

  return {
    async moreCamera() {
      await demoSetup();
      await camera(...OVERVIEW);
      await closeSection('heat.viewPanel.dof.title').catch(() => {});
      await section('heat.viewPanel.camera.title');
      // The gamepad block names the devices on this machine: out of the picture.
      await page.evaluate((title) => {
        for (const sp of document.querySelectorAll('.field > .label > span'))
          if (sp.textContent.trim() === title) sp.closest('.field').style.display = 'none';
      }, L('heat.viewPanel.gamepad.title'));
      await tall(1500, async () => {
        await section('heat.viewPanel.camera.title');
        const s = sec('heat.viewPanel.camera.title');
        const box = await rect(s);
        await shot('camera-panel', { x: box.x, y: box.y, width: box.width, height: Math.min(1480 - box.y, box.height) });
      });
    },

    async morePath() {
      await demoSetup();
      const keys = [
        [{ x: -2300, y: 2300, z: 2500 }, { x: 0, y: 60, z: 0 }],
        [{ x: -900, y: 900, z: 1500 }, at(0, 0)],
        [{ x: 1500, y: 1300, z: -1200 }, at(-300, 300)],
      ];
      await section('heat.pathPanel.title');
      for (const [f, a] of keys) {
        await camera(f, a);
        await click('heat.pathPanel.addKey');
      }
      await camera(...OVERVIEW);
      await tall(1300, async () => {
        await section('heat.pathPanel.title');
        const s = sec('heat.pathPanel.title');
        const box = await rect(s);
        await shot('camera-path-panel', { x: box.x, y: box.y, width: box.width, height: Math.min(1280 - box.y, box.height) });
      });
    },

    async moreModel() {
      await demoSetup();
      await heat({ radius: 9 });
      await camera({ x: -250, y: 700, z: 620 }, at(0, 0));
      await tall(1300, async () => {
        await section('heat.levelPanel.title');
        await shot('model-levels-loaded', { x: 0, y: 0, width: 1100, height: 1300 });
      });
    },

    async moreAppearance() {
      await demoSetup('demo-valley.glb');
      await heat({ radius: 9 });
      await camera({ x: -150, y: 330, z: 330 }, at(0, 0));
      await tall(1300, async () => {
        await section('heat.levelPanel.title');
        // The two sub-panels, by their headings.
        for (const key of ['heat.levelPanel.relief', 'heat.levelPanel.structures']) {
          const head = page.getByText(L(key), { exact: true }).first();
          await head.scrollIntoViewIfNeeded().catch(() => {});
        }
        await shot('level-appearance-sections', { x: 0, y: 0, width: 1100, height: 1300 });
      });
    },

    async moreMapImage() {
      await boot();
      await loadData('tanks.parquet');
      const png = join(SHOTS_DIR, 'demo-valley-map.png');
      writeFileSync(png, mapPng(valleyH));
      await section('heat.levelPanel.title');
      const chooser = page.waitForEvent('filechooser');
      await click('heat.levelPanel.mapImage');
      await (await chooser).setFiles(png);
      await page.waitForFunction(() => globalThis.__3dheat.useStore.getState().level, null, { timeout: 30000 });
      await wait(1000);
      // The picture covers x -2900..2900, z -1500..1500: its two corners as anchors.
      await store(() => {
        const s = globalThis.__3dheat.useStore.getState();
        const img = s.level;
        const w = img.width, h = img.height;
        s.patchLevel({ anchors: [{ px: 0, py: 0, worldX: -2900, worldZ: -1500 }, { px: w - 1, py: h - 1, worldX: 2900, worldZ: 1500 }] });
      });
      await heat({ radius: 25 });
      await mode('heat-simple');
      await tall(1300, async () => {
        await section('heat.viewPanel.camera.title');
        await page.locator('button', { hasText: L('heat.viewPanel.camera.preset.top') }).first().click();
        await wait(1000);
        await page.keyboard.press('f');
        await wait(1500);
        await section('heat.levelPanel.title');
        await page.getByText(L('heat.levelPanel.placement'), { exact: true }).first().scrollIntoViewIfNeeded();
        await shot('map-images-placement', { x: 0, y: 0, width: 1600, height: 1300 });
      });
    },

    async moreSettings() {
      await demoSetup();
      await camera(...OVERVIEW);
      await sidebarTop();
      const help = page.getByTitle(L('help.toggle')).first();
      // Units and language live behind the settings gear since the shell (ui/shell/Shell.tsx).
      const more = page.getByTitle(L('shell.settings.title'), { exact: true }).first();
      // The 470 px sidebar of the Match tab, so the window opens inside the page.
      await page.evaluate(() => document.documentElement.style.setProperty('--sidebar-w', '560px'));
      await more.click();
      await wait(500);
      await ring(help);
      await ring(more);
      await shot('settings-units', { x: 0, y: 0, width: 900, height: 700 });
      await page.keyboard.press('Escape');
      await wait(300);
      // Match tab, one match picked, Help mode on.
      await tab('app.tab.match');
      await store(() => {
        const s = globalThis.__3dheat.useStore.getState();
        s.patchTeam({ session: s.dataset.sessionLabels.indexOf('Match 01') });
      });
      await help.click();
      await wait(800);
      await ring(help);
      await sidebarTop();
      await shot('settings-help-match', { x: 0, y: 0, width: 1600, height: 900 });
      await help.click();
    },

    async moreUpdate() {
      await page.route('**/__heat3d/update', (route) =>
        route.request().method() === 'GET'
          ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ checkout: true, behind: 3, dirty: false, latest: 'Faster loading of large folders' }) })
          : route.continue(),
      );
      await boot();
      await loadLevel('demo-valley.glb');
      await page.waitForSelector('.update-banner', { timeout: 20000 });
      await sidebarTop();
      await shot('updates-notice', { x: 0, y: 0, width: 480, height: 330 });
      await page.unroute('**/__heat3d/update');
    },

    async moreBanner() {
      await boot();
      await loadLevel('demo-valley.glb');
      await page.evaluate(() => {
        for (const st of document.querySelectorAll('style')) if (st.textContent.includes('software-rendering-warning')) st.remove();
        const n = document.createElement('style');
        n.textContent = '.cam-readout,.stage .overlay:has(> .line){display:none!important}';
        document.head.appendChild(n);
      });
      await wait(800);
      await sidebarTop();
      await shot('software-rendering-banner', { x: 0, y: 0, width: 480, height: 300 });
    },

    async moreStats() {
      const unhide = () =>
        page.evaluate(() => {
          for (const st of document.querySelectorAll('style')) if (st.textContent.includes('software-rendering-warning')) st.remove();
          const n = document.createElement('style');
          // A software rasteriser's frame rate says nothing about the viewer: those two values stay blank.
          n.textContent = '[data-testid="software-rendering-warning"],.cam-readout{display:none!important}.stage .overlay > .line:nth-child(2) b,.stage .overlay > .line:nth-child(3) b{font-size:0!important}.stage .overlay > .line:nth-child(2) b::after,.stage .overlay > .line:nth-child(3) b::after{content:"—";font-size:12px}';
          document.head.appendChild(n);
        });
      // All ten matches in the heatmap; sprites capped so the picture is still accumulating.
      // The full readout is a developer tool: on through the test hook for this picture.
      await boot();
      await store(() => globalThis.__3dheat.devTools(true));
      await loadLevel('demo-valley.glb');
      await loadData('tanks.parquet');
      await store(() => globalThis.__3dheat.useStore.getState().patchBudget({ exact: false, adaptive: false, splatsPerFrame: 16000, progressive: true }));
      await heat({ radius: 30 });
      await unhide();
      await camera(...OVERVIEW);
      // Catch it while the picture is still merging frames: a camera move, a short wait, the picture.
      const box = page.locator('.stage .overlay:has(> .line)').first();
      for (let i = 0; i < 60; i++) {
        await page.evaluate(() => globalThis.__3dheat_engine.invalidate(10));
        await wait(20 + (i % 6) * 15);
        if ((await box.locator('.line.warn b').first().textContent()).includes('%')) break;
      }
      await webp('performance-stats-overlay', await box.screenshot());

      // Not resident: a budget far below the data. As everyone sees it: the one line, no developer tools.
      await store(() => globalThis.__3dheat.devTools(false));
      await boot();
      await loadLevel('demo-valley.glb');
      await store(() => globalThis.__3dheat.useStore.getState().patchBudget({ gpuBudgetBytes: 400_000 }));
      await loadData('tanks.parquet');
      await camera(...OVERVIEW);
      await unhide();
      await wait(4000);
      await shot('gpu-memory-not-resident', '.stage .overlay:has(> .line)');
    },

    async moreReplay() {
      await demoSetup();
      await tab('app.tab.match');
      await store(() => {
        const s = globalThis.__3dheat.useStore.getState();
        s.patchTeam({ session: s.dataset.sessionLabels.indexOf('Match 01'), figureScale: 1 });
        s.patchTimeline({ mode: 'play', window: 'lifetime' });
        s.setPlaying(false);
        s.seek(306);
      });
      await wait(1000);
      await tall(2000, async () => {
        // Level and its sub-panels out of the way: the sections this page is about stay open.
        await closeSection('heat.levelPanel.title').catch(() => {});
        await closeSection('replay.units.title').catch(() => {});
        await section('units.figures.title');
        await store(() => {
          const s = globalThis.__3dheat.useStore.getState();
          const r = globalThis.__3dheat_replay.getState();
          r.patchSaved({ followMode: 'orbit', labels: true });
          r.setFollowDistance(40);
          r.toggleFollow(s.dataset.personLabels.indexOf('Red 2'), 'Red 2');
        });
        await wait(3000);
        await section('replay.events.title').catch(() => {});
        await page.evaluate(() => document.querySelector('.sidebar')?.scrollTo(0, 0));
        await shot('match-replay-tab', { x: 0, y: 0, width: 1600, height: 2000 });
      });
    },

    async moreSymbols() {
      await demoSetup();
      await tab('app.tab.match');
      await store(() => {
        const s = globalThis.__3dheat.useStore.getState();
        s.patchTeam({ session: s.dataset.sessionLabels.indexOf('Match 01'), figureScale: 1, farMode: 'symbol', symbolStyle: 'nato', symbolPx: 44 });
        s.patchTimeline({ mode: 'play', window: 'lifetime' });
        s.setPlaying(false);
        s.seek(306);
        globalThis.__3dheat_replay.getState().patchSaved({ labels: false });
      });
      await section('units.figures.title');
      await camera({ x: -600, y: 3000, z: 2600 }, at(0, 0));
      await wait(1000);
      const styles = ['nato', 'russian', 'map', 'mono'];
      // The six units: the crop round the bluest cluster and the reddest, found in the screen as it is.
      const tiles = [];
      for (const st of styles) {
        await store((v) => globalThis.__3dheat.useStore.getState().patchTeam({ symbolStyle: v }), st);
        await page.evaluate(() => globalThis.__3dheat_engine.invalidate(30));
        await wait(2500);
        tiles.push(await page.screenshot({ clip: { x: 680, y: 240, width: 560, height: 380 } }));
      }
      // The Symbols menu (the Style drop-down) beside them.
      const side = await page.locator('.sidebar').first().screenshot({ clip: undefined }).catch(() => null);
      const b64 = await page.evaluate(
        async ([imgs, names]) => {
          const load = async (b) => { const i = new Image(); i.src = `data:image/png;base64,${b}`; await i.decode(); return i; };
          const pics = await Promise.all(imgs.map(load));
          const w = pics[0].width, h = pics[0].height, pad = 6, cap = 26;
          const c = document.createElement('canvas');
          c.width = w * 2 + pad * 3;
          c.height = (h + cap) * 2 + pad * 3;
          const g = c.getContext('2d');
          g.fillStyle = '#0e1116';
          g.fillRect(0, 0, c.width, c.height);
          g.font = '600 16px system-ui, sans-serif';
          pics.forEach((p, i) => {
            const x = pad + (i % 2) * (w + pad), y = pad + Math.floor(i / 2) * (h + cap + pad);
            g.fillStyle = '#e6e8ee';
            g.fillText(names[i], x + 4, y + 18);
            g.drawImage(p, x, y + cap);
          });
          return c.toDataURL('image/webp', 0.82).split(',')[1];
        },
        [tiles.map((t) => t.toString('base64')), styles.map((st) => L(`far.style.${st}`))],
      );
      void side;
      const dir = join(REPO, 'docs', 'assets', 'img', ctx.LANG);
      writeFileSync(join(dir, 'match-replay-symbols-styles.webp'), Buffer.from(b64, 'base64'));
      console.log(`  match-replay-symbols-styles.webp ${(Buffer.from(b64, 'base64').length / 1024).toFixed(0)} KB`);
    },

    async moreMatch() {
      await boot();
      await loadLevel('demo-yard.glb');
      await loadData('shooter.parquet');
      await tab('app.tab.match');
      const chooser = page.waitForEvent('filechooser');
      await click('match.matches.load');
      await (await chooser).setFiles(join(REPO, 'tools', '.shots', 'demo', 'demo-yard.match.json'));
      await wait(1500);
      await camera({ x: 0, y: 105, z: -125 }, { x: 0, y: 0, z: 0 });
      await tall(1500, async () => {
        await closeSection('heat.levelPanel.title').catch(() => {});
        await closeSection('match.picker.title').catch(() => {});
        await page.locator('.round-cell').nth(6).click();
        await wait(800);
        await section('match.matches.title');
        await shot('match-analysis-round', { x: 0, y: 0, width: 1000, height: 1500 });
      });
    },

    async moreMass() {
      await boot();
      await loadLevel('demo-valley.glb');
      await section('mass.title');
      const dir = join(REPO, 'tools', '.shots', 'demo', 'mass');
      const t0 = Date.now();
      const chooser = page.waitForEvent('filechooser');
      await page.locator('.section.open', { has: page.locator('> header', { hasText: L('mass.title') }) }).getByText(L('mass.folder'), { exact: true }).first().click();
      await (await chooser).setFiles(dir);
      await page.waitForFunction(() => !!globalThis.__mass.getState().facets, null, { timeout: 60000 }).catch(async (e) => {
        console.log('  mass state', JSON.stringify(await page.evaluate(() => { const s = globalThis.__mass.getState(); return { progress: s.progress, error: s.error, stats: s.stats }; })));
        throw e;
      });
      const loadMs = Date.now() - t0;
      await page.waitForSelector('.mass-window', { timeout: 20000 });
      const tabMs = {};
      for (const tb of ['overview', 'balance', 'trends', 'players', 'sides', 'map']) {
        const t1 = Date.now();
        await page.evaluate((v) => globalThis.__mass.getState().set({ tab: v }), tb);
        await page.waitForFunction(() => !document.querySelector('.mass-window .cmp-scroll .hint')?.textContent?.match(/\.\.\.|…/), null, { timeout: 60000 }).catch(() => {});
        await page.waitForSelector('.mass-window .mass-took', { timeout: 60000 }).catch(() => {});
        tabMs[tb] = Date.now() - t1;
      }
      const st = await page.evaluate(() => {
        const s = globalThis.__mass.getState();
        return { stats: s.stats, timings: s.timings };
      });
      writeFileSync(join(SHOTS_DIR, 'mass-measure.json'), JSON.stringify({ loadMs, tabMs, ...st }, null, 1));
      console.log('  measured', JSON.stringify({ loadMs, tabMs, load: st.stats, timings: st.timings }));
      await page.evaluate(() => globalThis.__mass.getState().set({ tab: 'balance' }));
      await page.waitForSelector('.mass-window table.brk-table tbody tr', { timeout: 30000 });
      await wait(800);
      await shot('mass-balance', '.mass-window');
    },
  };
};
