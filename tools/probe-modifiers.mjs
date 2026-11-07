/**
 * Does Alt actually slow the fly, and does the slow factor hold for the whole
 * time the key is down?
 *
 * The smoke check "Shift boosts and Alt slows the same key" failed once with Alt
 * giving 0.66 of the plain travel where the factor is 0.15. Two very different
 * causes fit that number: the window was measured while the machine was busy (the
 * assertion is a wall-clock integration), or the modifier is not held for the
 * whole window — a browser accelerator eating Alt, or a modifier left stuck in
 * the held-key set by the previous condition.
 *
 * This separates them. Each condition is run several times, and each run reports
 * the travel, the frames the engine actually drew, and the held-key set sampled
 * mid-window — so a wrong ratio can be attributed rather than guessed at.
 *
 *   node tools/probe-modifiers.mjs [url] [repeats]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const repeats = Number(process.argv[3] ?? 4);

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

await page.evaluate(() => {
  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel(null);
  s.setDataset(
    globalThis.__3dheat.generateSynthetic({ ...globalThis.__3dheat.DEFAULT_SYNTH, rows: 200_000 }),
  );
  s.setMode('heat-simple');
});
await page.waitForTimeout(1200);
await page.locator('canvas').click({ position: { x: 400, y: 300 } });

const pose = () =>
  page.evaluate(() => {
    const c = globalThis.__3dheat_engine.camera;
    return {
      x: c.position.x,
      y: c.position.y,
      z: c.position.z,
      speed: c.speed,
      frames: globalThis.__3dheat_engineLive.frames ?? 0,
      t: performance.now(),
    };
  });
/** The camera's held-key set, read straight off the instance. */
const held = () =>
  page.evaluate(() => [...globalThis.__3dheat_engine.camera.keys].join('+') || '(none)');

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

async function travel(mods, ms) {
  const before = await pose();
  for (const m of mods) await page.keyboard.down(m);
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(Math.floor(ms / 2));
  const mid = await held();
  await page.waitForTimeout(Math.ceil(ms / 2));
  await page.keyboard.up('KeyW');
  for (const m of mods) await page.keyboard.up(m);
  await page.waitForTimeout(140);
  const after = await pose();
  const afterKeys = await held();
  return {
    moved: dist(before, after),
    elapsed: after.t - before.t,
    frames: after.frames - before.frames,
    mid,
    afterKeys,
    speed: before.speed,
  };
}

const WINDOW = 420;
const rows = [];
for (let i = 0; i < repeats; i++) {
  for (const [label, mods] of [
    ['plain', []],
    ['shift', ['Shift']],
    ['alt', ['Alt']],
  ]) {
    const r = await travel(mods, WINDOW);
    rows.push({ label, ...r });
    console.log(
      `${label.padEnd(6)} run ${i + 1}  moved ${r.moved.toFixed(1).padStart(7)}  ` +
        `over ${r.elapsed.toFixed(0)}ms in ${String(r.frames).padStart(3)} frames  ` +
        `speed ${r.speed.toFixed(1)}  held mid: ${r.mid.padEnd(18)} after: ${r.afterKeys}`,
    );
  }
}

const best = (label) => Math.max(...rows.filter((r) => r.label === label).map((r) => r.moved));
const worst = (label) => Math.min(...rows.filter((r) => r.label === label).map((r) => r.moved));
console.log(
  `\nplain ${worst('plain').toFixed(0)}..${best('plain').toFixed(0)}  ` +
    `shift ${worst('shift').toFixed(0)}..${best('shift').toFixed(0)}  ` +
    `alt ${worst('alt').toFixed(0)}..${best('alt').toFixed(0)}`,
);
console.log(
  `ratios against best plain: shift ${(best('shift') / best('plain')).toFixed(2)}x, ` +
    `alt ${(best('alt') / best('plain')).toFixed(2)}x ` +
    `(designed 6x and 0.15x); worst-case alt ratio ${(best('alt') / worst('plain')).toFixed(2)}x`,
);

await browser.close();
