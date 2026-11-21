/**
 * The tactics board in a real browser, with real mouse and keys: every tool
 * once, and every way of finishing a route (Enter, double click, right
 * click, Esc), against the dev server. Fails on a console error or a step
 * whose store state is not what the input should have made.
 *
 * Frame timing: with TACTICS_GPU=1 it runs on the real GPU (ANGLE D3D11) and
 * plays a crowded plan, reporting frame-interval p50 / p99 / max; on the
 * software rasteriser the numbers mean nothing and are not taken.
 *
 *   node tools/smoke-tactics.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/';
const GPU = process.env.TACTICS_GPU === '1';
const browser = await chromium.launch({
  args: GPU ? ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--disable-frame-rate-limit'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
// A missing optional file (a local catalogue, a figure pack) is a 404 the app expects.
page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
page.on('dialog', (d) => void d.accept());

let failed = 0;
async function step(name, fn) {
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e instanceof Error ? e.message : e}`);
  }
}
const expect = (cond, what) => {
  if (!cond) throw new Error(what);
};
const plan = () => page.evaluate(() => {
  const s = window.__3dheat_plan.getState();
  return { tool: s.tool, draft: s.draft, figures: s.plan.figures.length, arrows: s.plan.arrows.map((a) => ({ figure: a.figure, n: a.points.length })), selection: s.selection, measure: s.measure };
});

await page.goto(url);
await page.waitForFunction(() => !!window.__3dheat_engine && !!window.__3dheat_plan, null, { timeout: 60_000 });
const canvas = page.locator('canvas').first();
const box = await canvas.boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;
/** Screen position of a world point, page pixels. */
const screenOf = (p) => page.evaluate(([x, y, z]) => window.__3dheat_engine.project(x, y, z), [p.x, p.y, p.z]).then((q) => q && { x: box.x + q.x, y: box.y + q.y });
const click = async (x, y, opts) => {
  await page.mouse.move(x, y);
  await page.mouse.down(opts);
  await page.mouse.up(opts);
  await page.waitForTimeout(opts?.wait ?? 500);
};

await step('open the Tactics tab and look from the top', async () => {
  await page.getByRole('tab', { name: 'Tactics' }).or(page.getByRole('button', { name: 'Tactics' })).first().click();
  await page.getByRole('button', { name: 'Top view' }).click();
  await page.waitForTimeout(500);
  await canvas.focus();
});

await step('2 picks Place, a click puts a figure down', async () => {
  await page.evaluate(() => window.__3dheat_plan.getState().setKind('soldier'));
  await page.keyboard.press('Digit2');
  expect((await plan()).tool === 'place', 'tool is not place');
  await click(cx, cy);
  expect((await plan()).figures === 1, 'no figure placed');
});

const figureAt = async () => {
  const f = await page.evaluate(() => {
    const s = window.__3dheat_plan.getState();
    return s.plan.figures[0].keys[0];
  });
  return screenOf(f);
};

for (const [how, end] of [
  ['Enter', async () => page.keyboard.press('Enter')],
  ['a double click', async () => click(cx + 160, cy + 20, { wait: 60 }).then(() => click(cx + 160, cy + 20))],
  ['a right click', async () => click(cx + 150, cy + 40, { button: 'right' })],
  ['Esc', async () => page.keyboard.press('Escape')],
]) {
  await step(`3 picks Waypoints, and ${how} finishes the route`, async () => {
    await page.keyboard.press('Digit3');
    expect((await plan()).tool === 'waypoints', 'tool is not waypoints');
    const f = await figureAt();
    await click(f.x, f.y);
    await click(cx + 80, cy - 60);
    await click(cx + 140, cy);
    expect((await plan()).draft, 'nothing drawn');
    await end();
    await page.waitForTimeout(300);
    const s = await plan();
    expect(!s.draft, `still drawing after ${how}`);
    expect(s.arrows.length === 1 && s.arrows[0].figure, `no route for the figure (${JSON.stringify(s.arrows)})`);
    expect(s.arrows[0].n >= 3, `route has ${s.arrows[0].n} points`);
  });
}

await step('a second figure, both selected with Ctrl+A, get a group route', async () => {
  await page.keyboard.press('Digit2');
  await click(cx - 120, cy + 60);
  await page.keyboard.press('Control+KeyA');
  await page.keyboard.press('Digit3');
  await click(cx - 40, cy + 140);
  await click(cx + 40, cy + 200);
  await page.keyboard.press('Enter');
  const s = await plan();
  expect(s.arrows.length === 2 && s.arrows.every((a) => a.figure), `group routes: ${JSON.stringify(s.arrows)}`);
});

await step('4 Throw, 5 Area, 6 Note, 8 Erase and 9 Measure', async () => {
  await page.keyboard.press('Digit9');
  await click(cx - 200, cy - 200);
  await click(cx + 200, cy - 200);
  await page.keyboard.press('Enter');
  const m = (await plan()).measure;
  expect(m && m.done && m.points.length === 2, 'ruler not finished');
  for (const [k, tool] of [['Digit4', 'throw'], ['Digit5', 'area'], ['Digit6', 'note'], ['Digit8', 'erase'], ['Digit1', 'select']]) {
    await page.keyboard.press(k);
    expect((await plan()).tool === tool, `${k} did not pick ${tool}`);
  }
});

await step('Delete asks, then removes the selection', async () => {
  await page.keyboard.press('Control+KeyA');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(200);
  expect((await plan()).figures === 0, 'figures left after Delete');
});

/** Frame intervals over a few seconds, sorted. */
const frameTimes = async (ms = 5000) => {
  const t = await page.evaluate(
    (ms) =>
      new Promise((done) => {
        const out = [];
        let last = performance.now();
        const end = last + ms;
        const tick = (now) => {
          out.push(now - last);
          last = now;
          if (now < end) requestAnimationFrame(tick);
          else done(out);
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );
  const s = [...t].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { n: s.length, p50: q(0.5), p99: q(0.99), max: s[s.length - 1] };
};
const N = Number(process.env.TACTICS_N ?? 400);

if (GPU) {
  await step(`frame times while a plan of ${N} figures plays (real GPU)`, async () => {
    // The camera turning all the while, so the view is drawn every frame either way.
    await page.evaluate(() => window.__3dheat_plan.getState().clear());
    const idle = await frameTimes(2000);
    console.log(`     empty board: ${idle.n} frames, p50 ${idle.p50.toFixed(1)} ms, p99 ${idle.p99.toFixed(1)} ms, max ${idle.max.toFixed(1)} ms`);
    await page.evaluate((N) => {
      const plan = structuredClone(window.__3dheat_plan.getState().plan);
      for (let i = 0; i < N; i++) {
        const x = (i % 20) * 6 - 60;
        const z = Math.floor(i / 20) * 6 - 60;
        plan.figures.push({ id: `p${i}`, kind: i % 5 ? 'soldier' : 'mbt', team: plan.teams[i % 2].id, label: `U${i}`, keys: { 0: { x, y: 0, z, yaw: 0 } }, from: 0 });
        plan.arrows.push({ id: `r${i}`, step: 0, team: plan.teams[i % 2].id, style: 'move', figure: `p${i}`, points: [{ x, y: 0, z }, { x: x + 30, y: 0, z: z + 10 }, { x: x + 40, y: 0, z: z + 40 }] });
      }
      window.__3dheat_plan.setState({ plan });
      window.__3dheat_plan.getState().play(true);
    }, N);
    if (process.env.TACTICS_PROFILE === '1') {
      // Where the time goes: the top functions by own time over two seconds.
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Profiler.enable');
      await cdp.send('Profiler.start');
      await page.waitForTimeout(2000);
      const { profile } = await cdp.send('Profiler.stop');
      const self = new Map();
      const dt = profile.timeDeltas ?? [];
      const byId = new Map(profile.nodes.map((n) => [n.id, n]));
      (profile.samples ?? []).forEach((id, i) => {
        const n = byId.get(id);
        const k = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber}`;
        self.set(k, (self.get(k) ?? 0) + (dt[i] ?? 0) / 1000);
      });
      for (const [k, v] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`     ${v.toFixed(0).padStart(6)} ms  ${k}`);
    }
    const r = await frameTimes(5000);
    console.log(`     playing: ${r.n} frames, p50 ${r.p50.toFixed(1)} ms, p99 ${r.p99.toFixed(1)} ms, max ${r.max.toFixed(1)} ms`);
    // No worse than the empty board's frames, give or take a frame's jitter.
    expect(r.p99 < Math.max(idle.p99 * 1.25, idle.p99 + 4), `p99 ${r.p99.toFixed(1)} ms against ${idle.p99.toFixed(1)} ms empty`);
  });
}

await step('no console errors', async () => expect(!errors.length, errors.slice(0, 5).join(' | ')));
await browser.close();
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
