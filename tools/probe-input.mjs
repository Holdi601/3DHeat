/**
 * Diagnostic for the real-input smoke checks.
 *
 * Prints what the browser actually reports for a drag and a wheel — pointer-lock
 * state, movementX/Y, wheel deltas — because the smoke failure ("yawed the wrong
 * way", "wheel had no effect") can come from either the app or from how headless
 * Chromium synthesises the events, and those need different fixes.
 *
 *   node tools/probe-input.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

await page.evaluate(() => {
  globalThis.__3dheat.load(50_000);
  globalThis.__probe = { moves: [], wheels: [], lock: [] };
  const c = document.querySelector('canvas');
  window.addEventListener('mousemove', (e) =>
    globalThis.__probe.moves.push({
      mx: e.movementX,
      my: e.movementY,
      cx: e.clientX,
      cy: e.clientY,
      buttons: e.buttons,
      locked: document.pointerLockElement === c,
    }),
  );
  c.addEventListener('wheel', (e) =>
    globalThis.__probe.wheels.push({ dy: e.deltaY, mode: e.deltaMode }),
  );
  document.addEventListener('pointerlockchange', () =>
    globalThis.__probe.lock.push(document.pointerLockElement === c ? 'locked' : 'unlocked'),
  );
});
await page.waitForTimeout(1200);

const box = await page.locator('canvas').boundingBox();
console.log('canvas box', box);
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

const yaw = () => page.evaluate(() => globalThis.__3dheat_engine.camera.yawDegrees);
const speed = () => page.evaluate(() => globalThis.__3dheat_engine.camera.speed);

console.log('\n--- drag right and down');
const y0 = await yaw();
await page.mouse.move(cx, cy);
await page.mouse.down();
for (let i = 1; i <= 6; i++) await page.mouse.move(cx + i * 20, cy + i * 6);
await page.mouse.up();
await page.waitForTimeout(300);
console.log('yaw', y0.toFixed(2), '->', (await yaw()).toFixed(2));

console.log('\n--- wheel up');
const s0 = await speed();
await page.mouse.move(cx, cy);
await page.mouse.wheel(0, -600);
await page.waitForTimeout(300);
console.log('speed', s0.toFixed(2), '->', (await speed()).toFixed(2));

const probe = await page.evaluate(() => globalThis.__probe);
console.log('\nlock transitions:', probe.lock);
console.log('wheel events seen by canvas:', probe.wheels);
console.log('mousemove events:');
for (const m of probe.moves) console.log(' ', JSON.stringify(m));

// Does the element under the cursor actually belong to the canvas?
const hit = await page.evaluate(
  ({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return el ? `${el.tagName}.${el.className}` : null;
  },
  { x: cx, y: cy },
);
console.log('\nelementFromPoint at canvas centre:', hit);

await browser.close();
