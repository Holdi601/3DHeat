/**
 * Does the drag handle beside a slider actually work in a browser?
 *
 * The rate law has unit tests (`src/ui/Jog.test.ts`); this is the half they
 * cannot reach. A velocity control is made of the things a pure function has no
 * opinion about: a pointer capture that has to survive the cursor leaving a
 * 16-pixel target, an animation loop that has to keep integrating while React
 * re-renders the panel underneath it, and a release that has to actually stop.
 * Each of those fails silently — the value simply stops moving, or never stops
 * moving, and nothing throws.
 *
 * The specific bug this is here to catch: reading the value from the prop each
 * frame instead of from a local accumulator. It works when React is fast and
 * stalls when it is not, which is exactly the case a screenshot will not show.
 *
 *   node tools/probe-jog.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const wantWebgpu = /backend=webgpu/.test(url);
const browser = await chromium.launch({
  ...(wantWebgpu ? { channel: 'chromium' } : {}),
  args: wantWebgpu
    ? [
        '--enable-unsafe-webgpu',
        '--enable-features=Vulkan',
        '--disable-vulkan-surface',
        '--use-webgpu-adapter=swiftshader',
        '--ignore-gpu-blocklist',
      ]
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

// A dataset, because some panels have nothing to show without one — the slice's
// bounds come from the world, so its sliders do not exist until there is a world.
await page.evaluate(() => {
  const s = globalThis.__3dheat.useStore.getState();
  s.setDataset(
    globalThis.__3dheat.generateSynthetic({ ...globalThis.__3dheat.DEFAULT_SYNTH, rows: 50_000 }),
  );
  s.patchTimeline({ mode: 'all', playing: false });
});
await page.waitForTimeout(800);

let ok = 0;
let failed = 0;
const check = (label, pass, detail) => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
  pass ? ok++ : failed++;
};

async function openSection(title) {
  await page.evaluate((t) => {
    for (const section of document.querySelectorAll('.section')) {
      const header = section.querySelector('header');
      if (!header?.textContent?.includes(t)) continue;
      if (!section.classList.contains('open')) header.click();
      return;
    }
  }, title);
  await page.waitForTimeout(200);
}

const heat = (key) => page.evaluate((k) => globalThis.__3dheat.useStore.getState().heat[k], key);
const setHeat = async (patch) => {
  await page.evaluate((p) => globalThis.__3dheat.useStore.getState().patchHeat(p), patch);
  await page.waitForTimeout(120);
};

/** The handle for a named slider, addressed the way a screen reader would. */
const jog = (label) => page.locator(`[aria-label="${label} — drag to adjust"]`);

/**
 * Grab a handle, move `dy` pixels (up is positive), hold, and report the value
 * at intervals while holding.
 *
 * The samples are the point. A single before/after pair cannot tell a control
 * that integrates from one that jumped once on pointerdown and then sat still,
 * and the second is what a broken rAF loop looks like.
 */
async function drag(label, read, dy, holdMs, { fine = false } = {}) {
  const get = typeof read === 'function' ? read : () => heat(read);
  const handle = jog(label);
  // The sidebar scrolls, and a synthetic mouse aimed at a box outside the
  // viewport lands on whatever is at those coordinates instead — which reads as
  // "the control does nothing" rather than as a mistake in the probe.
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) throw new Error(`no handle for ${label}`);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  if (fine) await page.keyboard.down('Shift');
  await page.mouse.down();
  // Confirm the grab landed. Without this, a box that went stale between the
  // measurement and the move produces a flat run of samples that reads exactly
  // like a control that does not work.
  if (!(await handle.evaluate((el) => el.classList.contains('active')))) {
    throw new Error(`pointerdown missed the ${label} handle`);
  }
  // In two moves, because a velocity control that only reads the first
  // pointermove would pass a single jump to the far end.
  await page.mouse.move(cx, cy - dy * 0.4, { steps: 3 });
  await page.mouse.move(cx, cy - dy, { steps: 6 });
  // The clock starts here, once the pointer is where it is going to stay, and
  // every reading is stamped with it. `holdMs` is not the hold: each sample is a
  // round trip into the page, and the moves above are several more, so the real
  // elapsed time runs several times longer. Dividing a change by the *requested*
  // hold reported a rate an order of magnitude too high and looked like a bug in
  // the rate law.
  const t0 = Date.now();
  const marks = [{ ms: 0, v: await get() }];
  const slices = 4;
  for (let i = 0; i < slices; i++) {
    await page.waitForTimeout(holdMs / slices);
    marks.push({ ms: Date.now() - t0, v: await get() });
  }
  await page.mouse.up();
  if (fine) await page.keyboard.up('Shift');
  await page.waitForTimeout(250);
  const after = await get();
  return { samples: marks.slice(1).map((m) => m.v), marks, after };
}

/**
 * Units per second over the first sampling interval of a drag.
 *
 * The first interval and not the whole hold, because the band's fast end starts
 * doubling the value once it passes a thousand: measured over a long hold from a
 * small value, the answer is an average across the flat part, the compounding
 * part and possibly the ceiling, which is not a rate at all.
 */
function firstRate({ marks }) {
  const a = marks[0];
  const b = marks[1];
  return (b.v - a.v) / ((b.ms - a.ms) / 1000);
}

const rising = (a) => a.every((v, i) => i === 0 || v > a[i - 1]);
const falling = (a) => a.every((v, i) => i === 0 || v < a[i - 1]);
const fmt = (a) => a.map((v) => (v >= 100 ? v.toFixed(0) : v.toFixed(3))).join(' → ');

// ------------------------------------------------------------------ it exists
await openSection('Heat shape');
check('every slider has a handle', (await page.locator('.sidebar .jog').count()) > 0,
  `${await page.locator('.sidebar .jog').count()} in the open sections`);

// ------------------------------------------------- it integrates while held
await setHeat({ radius: 1 });
{
  const { samples, after } = await drag('Sprite radius', 'radius', 200, 1600);
  check('a held drag keeps changing the value', rising(samples), fmt(samples));
  // Two reads after the release, not the last sample against the first read.
  // Ticks keep landing between reading a sample and the release actually being
  // dispatched, so comparing across the release measures the round-trip latency
  // and fails under load — the property wanted here is only that it has stopped.
  await page.waitForTimeout(600);
  const later = await heat('radius');
  check('it stops when the pointer is released', later === after,
    `${after.toFixed(1)}, still ${later.toFixed(1)} six-tenths later`);
}

// ---------------------------------------------------------------- direction
{
  const { samples } = await drag('Sprite radius', 'radius', -200, 1200);
  check('dragging down lowers it', falling(samples), fmt(samples));
}

// -------------------------------------------------------- further is faster
await setHeat({ radius: 1 });
const near = (await drag('Sprite radius', 'radius', 26, 1000)).after;
await setHeat({ radius: 1 });
const far = (await drag('Sprite radius', 'radius', 220, 1000)).after;
check('a longer drag moves it further', far > near * 1.5, `${near.toFixed(2)} vs ${far.toFixed(2)}`);

// -------------------------------------------------------------------- shift
await setHeat({ radius: 1 });
const fine = (await drag('Sprite radius', 'radius', 220, 1000, { fine: true })).after;
check('shift makes it fine', fine > 1 && fine < far * 0.5,
  `${fine.toFixed(2)} against ${far.toFixed(2)}`);

// ------------------------------------------------------------- the rate band
//
// The band the control was asked for: about a unit a second at a nudge, about a
// thousand across the screen. Measured through the real DOM rather than from
// `jogRate` — the unit tests already pin the function, and what can go wrong
// here is the wiring between the pointer and it.
//
// Measured at a *large* value on purpose. This is the regression that mattered:
// with a rate proportional to the value, a nudge at a radius of two thousand
// moved hundreds of metres a second, which is what made a big value impossible
// to adjust rather than merely slow to reach.
{
  const rate = async (dy, from) => {
    await setHeat({ radius: from });
    return firstRate(await drag('Sprite radius', 'radius', dy, 600));
  };
  // At a large value on purpose — see above.
  const nudge = await rate(14, 2000);
  check('a nudge moves about a unit a second, even at a large value',
    nudge > 0.3 && nudge < 6, `${nudge.toFixed(2)} /s at a radius of 2000`);

  // From a value below where the doubling term takes over, so this measures the
  // flat end of the band rather than the crossover.
  const sweep = await rate(400, 10);
  check('a pull across the screen moves about a thousand a second',
    sweep > 400 && sweep < 2500, `${sweep.toFixed(0)} /s`);

  // Past a thousand the band switches to doubling per second, which is what
  // makes a ceiling in the millions reachable at all. On the saturation point,
  // whose ceiling is ten million — the radius would be pinned at fifty thousand
  // before this could be measured. Asserted as a ratio, because the value is
  // compounding while it is being measured.
  await setHeat({ saturation: 100_000 });
  const big = await drag('Saturation point', 'saturation', 400, 700);
  check('a large value moves proportionally, not at a flat thousand',
    big.after > 130_000, `100k → ${(big.after / 1000).toFixed(0)}k in seven-tenths`);

  // That the band is geometric *between* those two ends is left to the unit
  // tests, which read the rate law directly. Deriving the shape of a curve from
  // values sampled across a browser round trip does not survive the jitter: the
  // same half-travel drag measured 32/s on one backend and 163/s on the other,
  // which says nothing about the law and everything about when the reads landed.
  // The endpoints are safe because they are order-of-magnitude assertions.
  check('the rate rises with the travel', nudge < sweep,
    `${nudge.toFixed(2)} /s at a nudge, ${sweep.toFixed(0)} /s at full travel`);
}

// ------------------------------------------------------------- a click is not a drag
await setHeat({ radius: 12 });
{
  await jog('Sprite radius').scrollIntoViewIfNeeded();
  const box = await jog('Sprite radius').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  await page.waitForTimeout(200);
  check('holding still changes nothing', (await heat('radius')) === 12, `${await heat('radius')}`);
}

// ------------------------------------------------- past the end of the track
//
// The reason the control exists. 2000 is where the track stops; the value has to
// be able to go past it without anyone typing a number.
await setHeat({ radius: 1500 });
{
  const { after } = await drag('Sprite radius', 'radius', 400, 2000);
  check('it goes past the drawn maximum', after > 2000, `${after.toFixed(0)} m, track ends at 2000`);
  const track = await page.locator('.sidebar .field', { hasText: 'Sprite radius' })
    .locator('input[type="range"]').first().inputValue();
  const box = await page.locator('.sidebar .field', { hasText: 'Sprite radius' })
    .locator('input[type="number"]').first().inputValue();
  // The thumb pins at the end rather than clearing or wrapping, and the number
  // beside it stays the truth.
  check('the thumb pins at the end of the track', Number(track) === 1, `range reads ${track}`);
  check('the number box shows the real value', Number(box) > 2000, `box reads ${box}`);
}

// ----------------------------------------------------------- and stops somewhere
await setHeat({ radius: 40_000 });
{
  // Full travel, not two thirds of it: the span is the height of a screen now,
  // so 240px is a middling pull and a middling pull from forty thousand does not
  // get to the ceiling inside a couple of seconds. That is the band working, not
  // the clamp failing.
  const { after } = await drag('Sprite radius', 'radius', 400, 2500);
  check('it stops at the declared ceiling', after === 50_000, `${after} m`);
}

// ---------------------------------------------- a bounded slider stays bounded
//
// Occlusion of 1 means hidden entirely. There is nothing past it, and it
// declares no ceiling, so the handle must not invent one.
await openSection('Depth');
await setHeat({ occlusion: 0.5 });
{
  const { after } = await drag('Hidden behind geometry', 'occlusion', 400, 1500);
  check('a slider with no ceiling stops at its maximum', after === 1, `${after}`);
}

// ------------------------------------------------------- the off position holds
//
// The far cull's bottom is "off", not "1 metre". A log law cannot reach zero by
// multiplying, so this is carved out of the range by hand and is worth checking.
await openSection('Distance culling');
await setHeat({ cullFar: 300 });
{
  const { after } = await drag('Far', 'cullFar', -240, 2500);
  check('dragging a cull to the bottom turns it off', after === 0, `cullFar ${after}`);
  const back = await drag('Far', 'cullFar', 240, 1200);
  check('and it comes back out of off', back.after > 0 && rising(back.samples), fmt(back.samples));
}

// ------------------------------------------------ the slice, bounded by the world
//
// The other culling control, and the one whose range is a real limit rather than
// a drawn one: a slab positioned outside the world cuts everything, which the
// checkbox already does better. So the handle has to work there *and* stay inside
// the bounds, which is a different requirement from every check above.
await openSection('Slice');
{
  const enable = page.locator('.sidebar .check', { hasText: 'Slice the world' }).first();
  await enable.scrollIntoViewIfNeeded();
  if (!(await enable.locator('input').isChecked())) await enable.click();
  await page.waitForTimeout(250);
  const slice = (k) => page.evaluate((key) => globalThis.__3dheat.useStore.getState().slice[key], k);
  const bounds = await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    const b = s.level && s.level.kind === 'model' ? s.level.bounds : s.dataset.bounds;
    return { min: b.minY, max: b.maxY };
  });
  // Gently, from the bottom. A full-travel drag crosses this range in well under
  // a second — the span is only the height of the world — so a hard pull pins it
  // at the top before the first sample and the run reads as a control that never
  // moved. Walking a slab through a building is a slow drag anyway.
  await page.evaluate((y) => globalThis.__3dheat.useStore.getState().patchSlice({ center: y }),
    bounds.min);
  const { samples, after } = await drag('Position', () => slice('center'), 30, 2000);
  check('the slice plane can be walked with the handle', rising(samples), fmt(samples));
  check('and it stays inside the world', after > bounds.min && after <= bounds.max + 1e-3,
    `${after.toFixed(0)} within ${bounds.min.toFixed(0)}..${bounds.max.toFixed(0)}`);

  // And a hard pull does stop at the top rather than running past it. Full
  // travel and long enough to cross the world: this slider's band is scaled to
  // the world's height, so its fast end crosses that height in about a second
  // rather than moving a thousand units a second.
  const pinned = await drag('Position', () => slice('center'), 400, 3000);
  check('a hard pull stops at the top of the world', pinned.after === bounds.max,
    `${pinned.after.toFixed(0)} against a maximum of ${bounds.max.toFixed(0)}`);
}

// ------------------------------------------------------- it is not flight control
//
// The handle lives in the sidebar and the camera listens on the canvas, but a
// pointer capture that swallows a drag is exactly the kind of thing that starts
// steering, and a jog that flies the camera while you set a radius is worse than
// no jog.
{
  const pose = () =>
    page.evaluate(() => {
      const c = globalThis.__3dheat_engine.camera;
      return [c.position.x, c.position.y, c.position.z, c.yawDegrees ?? 0];
    });
  const before = await pose();
  await drag('Far', 'cullFar', 200, 800);
  const after = await pose();
  const moved = Math.hypot(after[0] - before[0], after[1] - before[1], after[2] - before[2]);
  check('dragging it does not move the camera', moved < 1e-6 && after[3] === before[3],
    `moved ${moved.toFixed(6)}`);
}

// ------------------------------------------------ the fly speed over the viewport
//
// The other half of the request: see the camera's speed on screen and change it
// there. Framing a map sets the speed from the map's size, which is right for
// crossing it and two decades too fast for looking at a doorway, so the readout
// has to be draggable and has to reach genuinely slow.
console.log('');
{
  const hud = page.locator('.speed-hud');
  const speed = () => page.evaluate(() => globalThis.__3dheat_engine.camera.speed);
  const shown = () => hud.locator('b').innerText();

  check('the speed is on screen', await hud.isVisible(), (await shown()).trim());

  // It tracks the camera, not the store — the wheel writes to the camera and the
  // store catches up a frame later, so a readout wired to the store lags every
  // notch. Set it far from where it was and check the text follows.
  await page.evaluate(() => (globalThis.__3dheat_engine.camera.speed = 42));
  await page.waitForTimeout(400);
  check('it follows the camera', /42/.test(await shown()), (await shown()).trim());

  // Framing sets the speed from the scene size; this is the state the user
  // starts in and complains about.
  await page.evaluate(() => globalThis.__3dheat_engine.frameDataset(true));
  await page.waitForTimeout(400);
  const framed = await speed();
  check('framing leaves it fast', framed > 50, `${framed.toFixed(0)} m/s after framing`);

  const box = await hud.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const pull = async (dy, ms) => {
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    if (!(await hud.evaluate((el) => el.classList.contains('active')))) {
      throw new Error('pointerdown missed the speed readout');
    }
    await page.mouse.move(cx, cy - dy * 0.4, { steps: 3 });
    await page.mouse.move(cx, cy - dy, { steps: 6 });
    await page.waitForTimeout(ms);
    await page.mouse.up();
    await page.waitForTimeout(250);
    return speed();
  };

  const slowed = await pull(-400, 2500);
  check('dragging the readout down slows the camera right down', slowed < 1,
    `${framed.toFixed(0)} → ${slowed.toFixed(3)} m/s`);

  // Slow enough to hold a position rather than merely to move slowly. This is
  // the actual complaint — that the slowest reachable speed still flew past
  // things — so it is worth asserting a number rather than "it went down".
  const floored = await pull(-400, 4000);
  check('and reaches a speed you can inspect a doorway at', floored <= 0.05,
    `${floored.toFixed(3)} m/s`);

  const back = await pull(400, 2000);
  check('and back up again', back > floored * 50, `${back.toFixed(2)} m/s`);

  // The slow end has to be *controllable*, not merely reachable — the complaint
  // was flying past things, and a speed you can only set to 0.02 or 40 is no
  // better than one you can only set to 40. So a nudge has to be a small
  // fraction of the current speed rather than a fixed number of metres: on the
  // absolute band a nudge moved a metre a second, which at a third of a metre a
  // second is a tripling.
  for (const from of [0.3, 300]) {
    await page.evaluate((v) => globalThis.__3dheat.useStore.getState().patchCamera({ flySpeed: v }), from);
    await page.waitForTimeout(300);
    const nudged = await pull(14, 1200);
    const ratio = nudged / from;
    check(`a nudge is a fraction of the speed, not a fixed amount (from ${from} m/s)`,
      ratio > 1.005 && ratio < 1.6, `${from} → ${nudged.toFixed(3)} m/s (×${ratio.toFixed(2)})`);
  }

  // The wheel is the other way in, and the reason the floor was unreachable
  // before: at 11% a notch, climbing down from a freshly framed map took upward
  // of sixty. Ten notches should now be worth more than an order of magnitude.
  await page.evaluate(() => (globalThis.__3dheat_engine.camera.speed = 1000));
  await page.waitForTimeout(200);
  const canvas = await page.locator('canvas').first().boundingBox();
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
  for (let i = 0; i < 10; i++) await page.mouse.wheel(0, 100);
  await page.waitForTimeout(400);
  const wheeled = await speed();
  check('ten wheel notches cross more than a decade', wheeled < 1000 / 10,
    `1000 → ${wheeled.toFixed(1)} m/s in ten notches`);

  // And the panel agrees, so the two ways in are one value.
  await openSection('Camera & scene');
  const panel = await page.locator('.sidebar .field', { hasText: 'Fly speed' })
    .locator('input[type="number"]').first().inputValue();
  check('the panel shows the same speed', Math.abs(Number(panel) - wheeled) < wheeled * 0.02 + 1e-6,
    `panel ${panel}, camera ${wheeled.toFixed(3)}`);

  // Orthographic has no forward motion, so there is no fly speed to show.
  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchCamera({ projection: 'orthographic' }));
  await page.waitForTimeout(300);
  check('it is hidden in orthographic', (await page.locator('.speed-hud').count()) === 0);
  await page.evaluate(() =>
    globalThis.__3dheat.useStore.getState().patchCamera({ projection: 'perspective' }));
  await page.waitForTimeout(300);
}

// --------------------------------------------------------------- no page errors
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.waitForTimeout(300);
check('no page errors', errors.length === 0, `${errors.length}`);

console.log(`\nprobe-jog: ${failed === 0 ? 'passed' : 'FAILED'} (${ok} ok, ${failed} failed)`);
await browser.close();
process.exit(failed === 0 ? 0 : 1);
