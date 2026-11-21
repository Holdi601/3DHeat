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
page.on('dialog', (d) => void (d.type() === 'prompt' ? d.accept('Smoke note') : d.accept()));

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

await step('4 picks Throw: the landing comes in to the reach of a CS2 grenade', async () => {
  await page.keyboard.press('Digit4');
  const f = await figureAt();
  await click(f.x, f.y);
  // Far off the screen's middle: far past 36 m in a top view of the flat board.
  await click(box.x + 20, box.y + 20);
  const a = await page.evaluate(() => {
    const s = window.__3dheat_plan.getState();
    const t = s.plan.arrows.find((x) => x.style === 'throw');
    return t && { weapon: t.weapon, d: Math.hypot(t.points[1].x - t.points[0].x, t.points[1].z - t.points[0].z) / 39.37 };
  });
  expect(a && a.weapon && a.d <= 40, `throw ${JSON.stringify(a)}`);
  await page.keyboard.press('Digit1');
});

await step("Delete asks in the viewer's dialog, then removes the selection", async () => {
  await page.keyboard.press('Control+KeyA');
  await page.keyboard.press('Delete');
  // The shell's confirm, not the browser's: Esc keeps everything, the dialog's Remove removes.
  await page.locator('.dialog.confirm').waitFor({ timeout: 3000 });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  expect((await plan()).figures > 0, 'Esc on the confirm removed the figures');
  await canvas.focus();
  await page.keyboard.press('Delete');
  await page.locator('.dialog.confirm button.primary').click();
  await page.waitForTimeout(200);
  expect((await plan()).figures === 0, 'figures left after Delete');
  await canvas.focus();
});

await step('7 picks Draw: a drag draws a stroke and leaves the camera where it was', async () => {
  await canvas.focus();
  await page.keyboard.press('Digit7');
  const cam = () => page.evaluate(() => window.__3dheat_engine.camera.position.toArray());
  const before = await cam();
  await page.mouse.move(cx - 80, cy + 120);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(cx - 80 + i * 20, cy + 120 + i * 4);
  await page.mouse.up();
  await page.waitForTimeout(300);
  const d = await page.evaluate(() => window.__3dheat_plan.getState().plan.drawings.map((x) => x.points.length));
  expect(d.length === 1 && d[0] >= 3, `drawings ${JSON.stringify(d)}`);
  const after = await cam();
  expect(after.every((v, i) => Math.abs(v - before[i]) < 1e-6), `camera moved ${before} -> ${after}`);
});

await step('6 picks Note: a click asks for the text and puts the note down in the note style', async () => {
  await page.keyboard.press('Digit6');
  await page.evaluate(() => window.__3dheat_plan.getState().setNoteStyle({ size: 20, show: 'always' }));
  await click(cx - 150, cy - 150);
  const n = await page.evaluate(() => window.__3dheat_plan.getState().plan.notes.at(-1));
  expect(n && n.text === 'Smoke note' && n.size === 20 && n.show === 'always', `note ${JSON.stringify(n)}`);
  await page.keyboard.press('Digit1');
});

await step('a tank keyed by aiming its turret, and the time slider moves the moment shown', async () => {
  await page.evaluate(() => window.__3dheat_plan.getState().setKind('mbt'));
  await canvas.focus();
  await page.keyboard.press('Digit2');
  await click(cx - 100, cy - 100);
  await page.keyboard.press('Digit1');
  await page.getByRole('button', { name: 'Aim turret at…' }).click();
  await click(cx + 150, cy - 100);
  const keys = await page.evaluate(() => {
    const s = window.__3dheat_plan.getState();
    return s.plan.figures.find((f) => f.kind === 'mbt')?.tracks ?? null;
  });
  expect(keys && keys.turret?.length === 1 && keys.gun?.length === 1, `tracks ${JSON.stringify(keys)}`);
  const slider = page.locator('input.board-time');
  await slider.fill('2');
  const scrub = await page.evaluate(() => window.__3dheat_plan.getState().scrub);
  expect(Math.abs(scrub - 2) < 0.11, `scrub ${scrub}`);
  await page.keyboard.press('Escape');
});

await step('a new layer takes what is placed next; hidden, it leaves the selection out', async () => {
  await page.getByRole('button', { name: 'New layer' }).click();
  await canvas.focus();
  await page.keyboard.press('Digit2');
  await click(cx + 60, cy + 60);
  const s = await page.evaluate(() => {
    const st = window.__3dheat_plan.getState();
    const f = st.plan.figures[st.plan.figures.length - 1];
    return { active: st.activeLayer, layer: f.layer, id: f.id, layers: st.plan.layers.length };
  });
  expect(s.layers === 2 && s.layer === s.active, `figure on ${s.layer}, active ${s.active}`);
  await page.locator('.tactics-layer.on input[type=checkbox]').first().uncheck();
  await canvas.focus();
  await page.keyboard.press('Control+KeyA');
  const sel = await plan();
  expect(!sel.selection.includes(s.id), `hidden figure selected: ${sel.selection}`);
});

await step('the board is kept in the browser and comes back after a reload', async () => {
  await page.waitForTimeout(1500);
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('heat3d.tactics.autosave') ?? 'null')?.plan?.figures?.length ?? -1);
  const now = await page.evaluate(() => window.__3dheat_plan.getState().plan.figures.length);
  expect(kept === now && now > 0, `kept ${kept} figures of ${now}`);
  await page.reload();
  await page.waitForFunction(() => !!window.__3dheat_plan, null, { timeout: 60_000 });
  const back = await page.evaluate(() => window.__3dheat_plan.getState().plan.layers.length);
  expect(back === 2, `${back} layers after the reload`);
  await page.getByRole('tab', { name: 'Tactics' }).or(page.getByRole('button', { name: 'Tactics' })).first().click();
});

/** A stored zip of named text files (a .miz as small as it gets). */
function zip(files) {
  const parts = [];
  const central = [];
  let offset = 0;
  const u16 = (v) => [v & 255, (v >> 8) & 255];
  const u32 = (v) => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
  for (const [name, text] of Object.entries(files)) {
    const n = [...Buffer.from(name)];
    const d = [...Buffer.from(text)];
    const local = [...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0), ...n, ...d];
    central.push(...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...n);
    parts.push(...local);
    offset += local.length;
  }
  const count = Object.keys(files).length;
  return Buffer.from([...parts, ...central, ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(count), ...u16(count), ...u32(central.length), ...u32(offset), ...u16(0)]);
}

await step('Import mission… reads a DCS .miz onto a layer per coalition', async () => {
  const mission = 'mission = { ["theatre"] = "Caucasus", ["coalition"] = { ["blue"] = { ["country"] = { [1] = { ["plane"] = { ["group"] = { [1] = { ["name"] = "Viper", ["units"] = { [1] = { ["type"] = "F-16C_50", ["name"] = "Viper 1-1", ["x"] = 0, ["y"] = 0, ["alt"] = 500, ["heading"] = 0 } }, ["route"] = { ["points"] = { [1] = { ["x"] = 0, ["y"] = 0, ["alt"] = 500 }, [2] = { ["x"] = 9000, ["y"] = 0, ["alt"] = 5000, ["speed"] = 200 } } } } } } } } }, ["red"] = { ["country"] = { [1] = { ["vehicle"] = { ["group"] = { [1] = { ["name"] = "SAM", ["units"] = { [1] = { ["type"] = "Tor 9A331", ["name"] = "Tor", ["x"] = 8000, ["y"] = 1000 } } } } } } } } } }';
  // The File section, open; the button opens this chooser, and handing it the file is the same.
  const input = page.locator('input[type=file][accept=".miz,.sqm"]');
  if (!(await input.count())) await page.locator('.tactics-panel .section > header', { hasText: /^▶\s*File$/ }).first().click();
  // A board with something on it asks first, in the viewer's own dialog: Cancel keeps the board, the dialog's
  // button replaces it. An empty board takes the mission at once.
  const imported = () => {
    const p = window.__3dheat_plan.getState().plan;
    // A unit drawn as a local model pack's model is kind@model: the type figure is the part before the @.
    return p.layers.some((l) => l.name === 'Blue') && p.figures.some((f) => f.kind.split('@')[0] === 'f-16c');
  };
  const done = (expr) => page.waitForFunction(expr, null, { timeout: 15_000 });
  const choose = () => input.setInputFiles({ name: 'smoke.miz', mimeType: 'application/zip', buffer: zip({ mission }) });
  const before = await page.evaluate(() => window.__3dheat_plan.getState().plan.figures.length);
  await choose();
  await done(`!!document.querySelector('.dialog.confirm') || (${imported})()`);
  if (await page.locator('.dialog.confirm').count()) {
    expect(before > 0, 'asked to replace an empty board');
    await page.locator('.dialog.confirm .dialog-actions button:not(.primary)').click();
    await page.locator('.dialog.confirm').waitFor({ state: 'detached', timeout: 5000 });
    expect((await page.evaluate(() => window.__3dheat_plan.getState().plan.figures.length)) === before, 'Cancel replaced the board');
    await choose();
    await page.locator('.dialog.confirm button.primary').click({ timeout: 15_000 });
  }
  await done(`(${imported})()`);
  const s = await page.evaluate(() => {
    const p = window.__3dheat_plan.getState().plan;
    return { game: p.game, layers: p.layers.map((l) => l.name), figures: p.figures.map((f) => f.kind), routes: p.arrows.length };
  });
  expect(s.game === 'air' && s.layers.includes('Blue') && s.layers.includes('Red') && s.figures.some((k) => k.split('@')[0] === 'f-16c') && s.routes === 1, `imported ${JSON.stringify(s)}`);
});

await step('I opens the task picker: a patrol drawn on the map, Shift+5 overwatch, the legend', async () => {
  await page.evaluate(() => window.__3dheat_plan.getState().clear());
  await page.evaluate(() => window.__3dheat_plan.getState().setKind('soldier'));
  await canvas.focus();
  await page.keyboard.press('Digit2');
  await click(cx, cy);
  await page.keyboard.press('Digit1');
  await canvas.focus();
  await page.keyboard.press('KeyI');
  expect(await page.evaluate(() => window.__3dheat_plan.getState().taskPicker), 'picker not open');
  await page.locator('.task-picker input[type=search]').fill('patrol');
  await page.locator('.task-picker input[type=search]').press('Enter');
  const drawing = await page.evaluate(() => window.__3dheat_plan.getState().taskDraft);
  expect(drawing && drawing.points.length === 0, `no task being drawn: ${JSON.stringify(drawing)}`);
  await click(cx + 120, cy);
  await click(cx + 120, cy + 120);
  await click(cx, cy + 120);
  await canvas.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Shift+Digit5');
  const s = await page.evaluate(() => {
    const st = window.__3dheat_plan.getState();
    return { tasks: st.plan.tasks.map((t) => ({ kind: t.kind, n: t.points?.length ?? 0, figures: t.figures.length })), draft: st.taskDraft };
  });
  expect(s.tasks.length === 2 && s.tasks[0].kind === 'patrol' && s.tasks[0].n === 3 && s.tasks[1].kind === 'overwatch' && s.tasks.every((t) => t.figures === 1) && !s.draft, `tasks ${JSON.stringify(s)}`);
  await page.locator('.tactics-panel').getByText('Legend').first().click();
  expect(await page.locator('.task-legend .task-legend-row').count() >= 30, 'legend incomplete');
  await page.keyboard.press('Escape');
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
  return { n: s.length, p50: q(0.5), p99: q(0.99), max: s[s.length - 1], over25: s.filter((x) => x > 25).length };
};
const N = Number(process.env.TACTICS_N ?? 400);

if (GPU) {
  await step(`frame times while a plan of ${N} figures plays (real GPU)`, async () => {
    // The camera turning all the while, so the view is drawn every frame either way.
    await page.evaluate(() => window.__3dheat_plan.getState().clear());
    const idle = await frameTimes(2000);
    console.log(`     empty board: ${idle.n} frames, p50 ${idle.p50.toFixed(1)} ms, p99 ${idle.p99.toFixed(1)} ms, max ${idle.max.toFixed(1)} ms`);
    await page.evaluate(([N, withTasks]) => {
      const plan = structuredClone(window.__3dheat_plan.getState().plan);
      for (let i = 0; i < N; i++) {
        const x = (i % 20) * 6 - 60;
        const z = Math.floor(i / 20) * 6 - 60;
        plan.figures.push({ id: `p${i}`, kind: i % 5 ? 'soldier' : 'mbt', team: plan.teams[i % 2].id, label: `U${i}`, keys: { 0: { x, y: 0, z, yaw: 0 } }, from: 0 });
        plan.arrows.push({ id: `r${i}`, step: 0, team: plan.teams[i % 2].id, style: 'move', figure: `p${i}`, points: [{ x, y: 0, z }, { x: x + 30, y: 0, z: z + 10 }, { x: x + 40, y: 0, z: z + 40 }] });
        // Two or three tasks each (TACTICS_TASKS=0 leaves them out): a sector while it moves, a weapons state, every third a patrol at its route's end.
        if (!withTasks) continue;
        const team = plan.teams[i % 2].id;
        plan.tasks.push({ id: `o${i}`, kind: i % 2 ? 'overwatch' : 'recon', team, figures: [`p${i}`], step: 0, start: 0, bearing: (i % 8) * 0.8, arc: 0.6, range: 15 });
        plan.tasks.push({ id: `w${i}`, kind: 'roe', team, figures: [`p${i}`], step: 0, start: 2, state: 'free' });
        if (i % 3 === 0) plan.tasks.push({ id: `t${i}`, kind: 'patrol', team, figures: [`p${i}`], step: 0, on: { step: 0, from: 2 }, loops: 1, points: [{ x: x + 40, y: 0, z: z + 40 }, { x: x + 46, y: 0, z: z + 40 }, { x: x + 46, y: 0, z: z + 46 }] });
      }
      window.__3dheat_plan.setState({ plan });
      window.__3dheat_plan.getState().play(true);
    }, [N, process.env.TACTICS_TASKS !== '0']);
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
    // The plan's routes and tasks are worked out once, as it starts: a load, not playback (TACTICS_WARM=0 counts it).
    if (process.env.TACTICS_WARM !== '0') await page.waitForTimeout(1500);
    const r = await frameTimes(5000);
    console.log(`     playing: ${r.n} frames, p50 ${r.p50.toFixed(1)} ms, p99 ${r.p99.toFixed(1)} ms, max ${r.max.toFixed(1)} ms, ${r.over25} over 25 ms`);
    // No worse than the empty board's frames, give or take a frame's jitter.
    expect(r.p99 < Math.max(idle.p99 * 1.25, idle.p99 + 4), `p99 ${r.p99.toFixed(1)} ms against ${idle.p99.toFixed(1)} ms empty`);
  });
}

await step('no console errors', async () => expect(!errors.length, errors.slice(0, 5).join(' | ')));
await browser.close();
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
