/**
 * Which colour does a given group index get in box replay?
 *
 * The palette is generated, not listed, so "what is the blue one" has no answer
 * in the source — you have to ask the function. Group 0 is the one that matters
 * most here: it is where every row whose grouping value was absent or
 * unreadable ends up, which on this telemetry is nearly all of the AI.
 *
 *   node tools/probe-groupcolor.mjs
 */
import { chromium } from 'playwright';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5273/?backend=webgl2', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40000 });

const out = await page.evaluate(async () => {
  const c = await import('/src/render/colors.ts');
  const to255 = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255);
  const rows = [];
  for (let g = 0; g < 8; g++) {
    const [r, gg, bb] = c.teamMemberColor(g, 0, 40);
    rows.push({ group: g, rgb: [to255(r), to255(gg), to255(bb)] });
  }
  return rows;
});

for (const r of out) {
  console.log(`  group ${r.group}  rgb(${r.rgb.join(', ')})`);
}
await browser.close();
