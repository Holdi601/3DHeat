/**
 * The race-analysis pictures of the documentation (docs/race-*.md), on the demo
 * course "Demo Ring" that tools/demo-race.mjs writes (made-up laps of the
 * made-up car "Demo GT", loaded through the Race analysis tab's own file
 * button).
 *
 *   node tools/demo-data.mjs            (once: also writes tools/.shots/demo/race)
 *   node tools/docs-shots.mjs --only raceOverview,raceLoading,raceReplay,raceCharts,raceControl,raceCorner,raceCars,raceCourse
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export default (ctx) => {
  const { page, L, wait, boot, click, section, tab, loadLevel, mod, store, shot, REPO } = ctx;
  const RACE = join(REPO, 'tools', '.shots', 'demo', 'race');
  const files = (sub) => readdirSync(join(RACE, sub)).filter((f) => f.endsWith('.json')).sort().map((f) => join(RACE, sub, f));

  /** The course model, the Race analysis tab, and these lap files through the tab's own file input. */
  async function start(...sets) {
    await boot();
    await loadLevel('race/demo-ring.glb');
    await tab('app.tab.race');
    const chooser = page.waitForEvent('filechooser');
    await page.getByText(L('race.ui.laps.load'), { exact: true }).first().click();
    await (await chooser).setFiles(sets.flatMap(files));
    await page.waitForFunction(() => document.querySelectorAll('.lap-row').length > 0, null, { timeout: 60000 });
    await wait(4000);
    // The camera on the laps, as the F key does (not by clicking the canvas).
    await page.keyboard.press('KeyF');
    await wait(1500);
  }
  const race = (fn, a) => mod('/src/state/raceStore.ts', fn, a);
  const SIDEBAR = { x: 0, y: 0, width: 322, height: 900 };

  /** Fold a sidebar section by its title (a locale key), if it is open. */
  async function fold(key) {
    const head = page.locator('.section > header', { hasText: L(key) }).first();
    if (await head.evaluate((h) => h.parentElement.classList.contains('open'))) await head.click();
    await wait(200);
  }
  /** The same section, scrolled to the top of the sidebar. */
  const open = (key) => section(key);
  /** A box around one sidebar section, which the shot can take by selector. */
  async function tagSection(key, mark = 'shot') {
    await page.evaluate(
      ([title, mark]) => {
        document.querySelectorAll(`[data-${mark}]`).forEach((e) => e.removeAttribute(`data-${mark}`));
        for (const h of document.querySelectorAll('.section > header')) if (h.textContent.includes(title)) h.parentElement.setAttribute(`data-${mark}`, '1');
      },
      [L(key), mark],
    );
    return `[data-${mark}]`;
  }
  /**
   * The camera straight above the course, which sits in the lower part of the view (the
   * cards of the cars cover the upper part); `north` metres moves the view centre that way.
   */
  async function above(height = 540, north = 131) {
    const box = await race((m) => {
      const a = m.useRaceStore.getState().laps[0].channels;
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let i = 0; i < a.x.length; i += 20) { x0 = Math.min(x0, a.x[i]); x1 = Math.max(x1, a.x[i]); z0 = Math.min(z0, a.z[i]); z1 = Math.max(z1, a.z[i]); }
      return { x: (x0 + x1) / 2, z: (z0 + z1) / 2 };
    });
    await ctx.camera({ x: box.x, y: height, z: box.z + north - 4 }, { x: box.x, y: 0, z: box.z + north });
  }

  /** Click a finding of the "Where to improve" list (by a word in it), then pause the replay it starts. */
  async function pickFinding(match, section = 'race.ui.insights.title') {
    const box = page.locator('.section', { has: page.locator('header', { hasText: L(section) }) });
    await box.locator('button.finding', match ? { hasText: match } : {}).first().click();
    await wait(300);
    await race((m) => m.useRaceStore.getState().patchReplay({ playing: false }));
  }
  /** Both cars level at the flag post of the picked finding. */
  async function levelAtFlag() {
    const s = await race((m) => m.useRaceStore.getState().replay.anchorS);
    await mod('/src/ui/race/actions.ts', (m, s) => m.lineUpAt(s, 0), s);
    await wait(600);
    return s;
  }
  async function focusLap(name) {
    await page.locator('.lap-main', { hasText: name }).first().click();
    await wait(1200);
  }
  const top = () => page.locator('.section > header').first().evaluate((h) => h.scrollIntoView({ block: 'start' }));
  async function tall(h, fn) {
    await page.setViewportSize({ width: 1600, height: h });
    await wait(600);
    try {
      await fn();
    } finally {
      await page.setViewportSize({ width: 1600, height: 900 });
      await wait(400);
    }
  }
  const labelOf = (key) => L(key);

  return {
    async raceOverview() {
      await start('main');
      await fold('race.ui.stats.title');
      await pickFinding(/T1: /);
      await levelAtFlag();
      await click('race.ui.view.maps.time', {}, { wait: 600 });
      await race((m) => m.useRaceStore.getState().patchView({ carScale: 6 }));
      await above();
      await open('race.ui.laps.title');
      await shot('race-analysis-overview');
    },

    async raceLoading() {
      await start('main');
      await focusLap('(B) #1');
      await shot('race-loading-laps-list', await tagSection('race.ui.laps.title'));
    },

    async raceReplay() {
      await start('main');
      await fold('race.ui.stats.title');
      await pickFinding(/T2-T3: /);
      await click('race.ui.view.maps.cause', {}, { wait: 600 });
      const s = await levelAtFlag();
      // Camera about 80 m above the stretch from the flag to the end of the corner.
      const at = await race((m, s) => {
        const st = m.useRaceStore.getState();
        const a = st.analysis;
        const f = a.findings[st.selected];
        const step = a.alignment.grid[1] - a.alignment.grid[0];
        const ref = a.alignment.laps.find((l) => l.lap === a.alignment.reference);
        const mid = Math.round((s / step + Math.max(f.from, f.to)) / 2);
        return { x: ref.channels.x[mid], z: ref.channels.z[mid] };
      }, s);
      await race((m) => m.useRaceStore.getState().patchView({ carScale: 2 }));
      await ctx.camera({ x: at.x, y: 80, z: at.z + 4 }, { x: at.x, y: 0, z: at.z + 26 });
      await open('race.ui.laps.title');
      await shot('race-replay-lined-up');
    },

    async raceCharts() {
      await start('main');
      await fold('race.ui.stats.title');
      await pickFinding(/T1: /);
      await levelAtFlag();
      await above();
      const plot = page.locator('.race-charts svg.plot').first();
      const box = await plot.boundingBox();
      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.45);
      await wait(900);
      await shot('race-charts-rows', { x: 322, y: 0, width: 1278, height: 900 });
    },

    async raceControl() {
      await start('main');
      await focusLap('(B) #1');
      await fold('race.ui.stats.title');
      await fold('race.ui.insights.title');
      await fold('race.ui.laps.title');
      await open('race.ui.control.title');
      await pickFinding(null, 'race.ui.control.title');
      await open('race.ui.control.title');
      await shot('race-control-table', SIDEBAR);
    },

    async raceCorner() {
      await start('main');
      await focusLap('(B) #1');
      await fold('race.ui.stats.title');
      await fold('race.ui.laps.title');
      await pickFinding(/T1: /);
      await open('race.ui.insights.title');
      await tall(1800, async () => {
        await open('race.ui.insights.title');
        await shot('race-corner-finding', { x: 0, y: 0, width: 322, height: 1800 });
      });
    },

    async raceCars() {
      await start('main', 'sprint');
      await fold('race.ui.stats.title');
      await fold('race.ui.insights.title');
      await fold('race.ui.laps.title');
      await tall(1100, async () => {
        await open('race.ui.cars.title');
        await shot('race-cars-compared', { x: 0, y: 0, width: 322, height: 1100 });
      });
    },

    async raceCourse() {
      await start('stats');
      // The sections between the statistics and the View section folded, so its map legend is in the picture.
      for (const k of ['race.ui.laps.title', 'race.ui.insights.title', 'race.ui.corners.title', 'race.ui.control.title', 'race.ui.cars.title']) await fold(k).catch(() => {});
      await click('race.ui.view.maps.mistakes', {}, { wait: 800 });
      await tall(1300, async () => {
        await above(850, 118);
        await open('race.ui.stats.title');
        await shot('race-course-mistake-map');
      });
    },
  };
};
