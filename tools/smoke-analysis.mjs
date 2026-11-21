/**
 * The analysis and presentation tools in a real browser against the dev
 * server: heat inspection and labels, insights, engagement lines, volume
 * intersections, the caster's camera, camera paths to video and saved views.
 * Fails on a console error or a step whose state is not what it should be.
 *
 * Frame timing: with ANALYSIS_GPU=1 it runs on the real GPU (ANGLE D3D11) and
 * reports frame-interval p50 / p99 / max while the camera orbits with the
 * feature on; on the software rasteriser the numbers mean nothing and are not
 * judged.
 *
 *   node tools/smoke-analysis.mjs [url] [--only=<step substring>]
 */
import { chromium } from 'playwright';

const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:5273/';
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7) ?? null;
const GPU = process.env.ANALYSIS_GPU === '1';
const browser = await chromium.launch({
  args: GPU
    ? ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--disable-frame-rate-limit']
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

let failed = 0;
async function step(name, fn) {
  if (only && !name.includes(only)) return;
  try {
    const note = await fn();
    console.log(`ok   ${name}${note ? ` - ${note}` : ''}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e instanceof Error ? e.message : e}`);
  }
}
const expect = (cond, what) => {
  if (!cond) throw new Error(what);
};
const wait = (ms) => page.waitForTimeout(ms);

/** Frame intervals while the camera orbits, ms: p50, p99, max. */
async function orbitTiming(seconds = 3) {
  return page.evaluate(async (seconds) => {
    const eng = globalThis.__3dheat_engine;
    const pose = eng.cameraPose();
    const times = [];
    const t0 = performance.now();
    let last = t0;
    await new Promise((resolve) => {
      const tick = (now) => {
        times.push(now - last);
        last = now;
        const a = ((now - t0) / 1000) * 0.6;
        const f = pose.forward;
        const c = Math.cos(a);
        const s = Math.sin(a);
        eng.setCameraPose(pose.position, { x: f.x * c - f.z * s, y: f.y, z: f.x * s + f.z * c });
        if (now - t0 < seconds * 1000) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    eng.setCameraPose(pose.position, pose.forward);
    times.shift();
    times.sort((a, b) => a - b);
    const q = (p) => times[Math.min(times.length - 1, Math.floor(times.length * p))];
    return { p50: q(0.5), p99: q(0.99), max: times[times.length - 1], frames: times.length };
  }, seconds);
}
const timingText = (t) => `frames p50 ${t.p50.toFixed(1)} / p99 ${t.p99.toFixed(1)} / max ${t.max.toFixed(1)} ms over ${t.frames}${GPU ? '' : ' (software, not judged)'}`;
const judge = (t) => {
  if (GPU) expect(t.p99 < 34 && t.max < 70, `frame drops: ${timingText(t)}`);
};

await page.goto(url);
await page.waitForFunction(() => !!globalThis.__3dheat_engine && !!globalThis.__3dheat, null, { timeout: 60_000 });

/** A dense synthetic set, seen from above, everything drawn. */
async function loadSynthetic(rows = 300_000, mode = 'heat-simple') {
  await page.evaluate(
    async ([rows, mode]) => {
      const h = globalThis.__3dheat;
      const s = h.useStore.getState();
      s.setDataset(h.generateSynthetic({ ...h.DEFAULT_SYNTH, rows }));
      s.setMode(mode);
      s.patchTimeline({ mode: 'all' });
      await new Promise((r) => setTimeout(r, 400));
      const eng = globalThis.__3dheat_engine;
      eng.camera.setOrientationDegrees(0, -89.9);
      eng.frameDataset();
    },
    [rows, mode],
  );
  await wait(1200);
}

// ------------------------------------------------------------ heat inspection

await step('heat labels name the hottest places in view', async () => {
  await loadSynthetic();
  await page.evaluate(() => globalThis.__3dheat.useInspectStore.getState().patch({ heatLabels: true, heatLabelCount: 5 }));
  await page.waitForFunction(() => document.querySelectorAll('.heat-label.hot').length > 0, null, { timeout: 20_000 });
  const n = await page.evaluate(() => document.querySelectorAll('.heat-label.hot:not([style*="none"])').length);
  expect(n >= 1 && n <= 5, `${n} hot labels`);
  return `${n} labels`;
});

await step('heat labels do not move while the camera holds still', async () => {
  const at = () => page.evaluate(() => [...document.querySelectorAll('.heat-label')].map((e) => `${e.textContent}@${e.style.transform}`).join('|'));
  const a = await at();
  await wait(900);
  const b = await at();
  expect(a === b, 'labels changed with nothing changing');
});

await step('heat labels cost no frames while orbiting', async () => {
  const t = await orbitTiming(3);
  judge(t);
  return timingText(t);
});

await step('heat labels rebuilt during playback of 2M rows cost no frames', async () => {
  await loadSynthetic(2_000_000);
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.patchTimeline({ mode: 'play', window: 'cumulative' });
    s.setPlaying(true);
  });
  await wait(500);
  const t = await orbitTiming(4);
  const version = await page.evaluate(() => globalThis.__3dheat_engine.heatField.version);
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setPlaying(false);
    s.patchTimeline({ mode: 'all' });
  });
  judge(t);
  expect(version >= 2, `the field was built ${version} times during playback`);
  await loadSynthetic();
  await page.waitForFunction(() => document.querySelectorAll('.heat-label.top').length > 0, null, { timeout: 20_000 });
  return `${timingText(t)}, field built ${version}x`;
});

await step('a click on the hottest label reads the stack and its relative heat', async () => {
  const target = await page.evaluate(() => {
    const el = [...document.querySelectorAll('.heat-label.top')][0];
    const r = el.getBoundingClientRect();
    const c = document.querySelector('canvas').getBoundingClientRect();
    // The label sits above its place: the place is at the label's bottom-centre plus the offset.
    return { x: r.left + r.width / 2 - c.left, y: r.bottom + r.height * 0.3 - c.top };
  });
  await page.evaluate(({ x, y }) => globalThis.__3dheat_engine.pickAt(x, y), target);
  await page.waitForFunction(() => globalThis.__3dheat.useInspectStore.getState().stack?.stack, null, { timeout: 20_000 });
  const r = await page.evaluate(() => {
    const st = globalThis.__3dheat.useInspectStore.getState().stack.stack;
    return { count: st.count, total: st.total, rows: st.rows.length };
  });
  expect(r.count > 0 && r.total > 0, `stack ${JSON.stringify(r)}`);
  await page.waitForFunction(() => /places in view/.test(document.querySelector('.heat-here')?.textContent ?? ''), null, { timeout: 10_000 });
  const text = await page.evaluate(() => document.querySelector('.heat-rel')?.textContent ?? '');
  return `${r.count} rows, heat ${r.total.toFixed(1)}; ${text}`;
});

await step('next and previous walk through the stack', async () => {
  const row = () => page.evaluate(() => globalThis.__3dheat.useInspectStore.getState().pick?.row);
  const first = await row();
  await page.getByRole('button', { name: 'Next row in the stack' }).click();
  await wait(100);
  const second = await row();
  await page.getByRole('button', { name: 'Next row in the stack' }).click();
  await wait(100);
  const third = await row();
  expect(second !== undefined && third !== undefined && second !== third, `rows ${first} ${second} ${third}`);
  await page.getByRole('button', { name: 'Previous row in the stack' }).click();
  await wait(100);
  expect((await row()) === second, 'previous did not go back');
  const atText = await page.evaluate(() => document.querySelector('.heat-stack-at')?.textContent ?? '');
  expect(/Row 1 of/.test(atText), `position reads "${atText}"`);
});

await step('a surface pick reads the heat under the marker too', async () => {
  const ok = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const c = document.querySelector('canvas');
    eng.pickAt(c.clientWidth * 0.5, c.clientHeight * 0.5);
    await new Promise((r) => setTimeout(r, 1500));
    const s = globalThis.__3dheat.useInspectStore.getState();
    return { pick: s.pick?.kind, stack: !!s.stack?.stack };
  });
  expect(ok.stack, `no stack for a ${ok.pick} pick`);
  await page.evaluate(() => globalThis.__3dheat_engine.inspector.clear());
});

await step('difference mode labels the most negative places too', async () => {
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setMode('heat-difference'));
  await page.waitForFunction(() => document.querySelectorAll('.heat-label.cold').length > 0, null, { timeout: 20_000 });
  const n = await page.evaluate(() => [document.querySelectorAll('.heat-label.hot').length, document.querySelectorAll('.heat-label.cold').length]);
  await page.evaluate(() => {
    globalThis.__3dheat.useInspectStore.getState().patch({ heatLabels: false });
    globalThis.__3dheat.useStore.getState().setMode('heat-simple');
  });
  return `${n[0]} hot, ${n[1]} cold`;
});

// ------------------------------------------------------------------ insights

/** A module of the app, the instance the app loaded (after an edit the dev server adds a version query). */
const mod = (path, fn, a) =>
  page.evaluate(
    async ([p, src, arg]) => {
      const seen = performance.getEntriesByType('resource').map((e) => e.name).filter((n) => new URL(n).pathname === p);
      const u = seen.length ? seen[seen.length - 1] : p;
      return new Function('m', 'arg', `return (${src})(m, arg)`)(await import(u), arg);
    },
    [path, fn.toString(), a],
  );
const DEMO = '/tools/.shots/demo';

await step('insights: plain words, tight places, no whole-map findings', async () => {
  await page.evaluate(async (u) => {
    await globalThis.__3dheat.loadUrls([u]);
    globalThis.__3dheat.useStore.getState().setMode('heat-simple');
  }, `${DEMO}/tanks.parquet`);
  await wait(1500);
  const report = await mod('/src/insights/run.ts', async (m) => {
    const s = globalThis.__3dheat.useStore.getState();
    const scope = await import('/src/volumes/scope.ts');
    const r = await m.runInsights(s.dataset, scope.currentScope(s, 0), s.level, {});
    const store = await import('/src/insights/store.ts');
    store.useInsights.getState().set({ report: r, key: null, running: false, selected: null });
    const g = r.grid;
    const extent = Math.max(g.nx, g.nz) * g.fine;
    return {
      n: r.insights.length,
      dropped: (r.dropped ?? []).length,
      wide: r.insights.filter((i) => i.place && !i.kind.startsWith('spawn.') && i.kind !== 'flow.flank' && (2 * i.place.radius) / extent > 0.35).length,
      ranked: r.insights.every((i, k, a) => k === 0 || (a[k - 1].usefulness ?? 1) >= (i.usefulness ?? 0) || !i.usefulness),
      firstPlace: r.insights.findIndex((i) => !!i.place),
      height: s.dataset.bounds.maxY - s.dataset.bounds.minY,
    };
  });
  expect(report.n > 0, 'no findings on the tank demo');
  expect(report.wide === 0, `${report.wide} findings cover most of the map`);
  expect(report.firstPlace >= 0, 'no finding with a place');
  return `${report.n} findings, ${report.dropped} left out as trivial`;
});

await step('insights: a click outlines the fitted place, marks its events and frames it', async () => {
  const head = page.locator('.section > header').filter({ hasText: /Insights\s*$/ }).first();
  if (!(await page.locator('.ins').count())) await head.click();
  await page.waitForSelector('.ins-item', { timeout: 20_000 });
  const item = page.locator('.ins-item').filter({ hasText: /across/ }).first();
  const what = await item.locator('.ins-text').textContent();
  expect(!/were expected for the time spent/.test(what), `old wording: ${what}`);
  const before = await page.evaluate(() => globalThis.__3dheat_engine.cameraPose().position);
  await item.locator('.ins-head').click();
  await page.waitForFunction(() => document.querySelector('.ins-item.open .ins-compare'), null, { timeout: 10_000 });
  const lit = await mod('/src/insights/highlight.ts', async (m) => {
    for (let i = 0; i < 100 && !m.useInsightHighlight.getState().lines; i++) await new Promise((r) => setTimeout(r, 100));
    const l = m.useInsightHighlight.getState().lines;
    return l ? l.count : 0;
  });
  expect(lit > 100, `highlight has ${lit} vertices`);
  const after = await page.evaluate(() => globalThis.__3dheat_engine.cameraPose().position);
  expect(Math.hypot(after.x - before.x, after.y - before.y, after.z - before.z) > 1, 'the camera did not move to the finding');
  const parts = await page.evaluate(() => ['.ins-compare', '.ins-why', '.ins-do'].map((s) => document.querySelector(`.ins-item.open ${s}`)?.textContent ?? ''));
  expect(parts[0].length > 20, 'no comparison line');
  const t = await orbitTiming(2);
  judge(t);
  return `"${what.slice(0, 90)}..." / ${parts[0].slice(0, 80)}; ${timingText(t)}`;
});

await step('insights: "Volume here" fits the events, not the map height', async () => {
  const n0 = await mod('/src/volumes/store.ts', (m) => m.useVolumeStore.getState().volumes.length);
  await page.locator('.ins-item.open').getByRole('button', { name: 'Volume here' }).click();
  await wait(1000);
  const v = await mod('/src/volumes/store.ts', (m) => {
    const vs = m.useVolumeStore.getState().volumes;
    return { n: vs.length, last: vs[vs.length - 1]?.shape };
  });
  const height = await page.evaluate(() => {
    const b = globalThis.__3dheat.useStore.getState().dataset.bounds;
    return b.maxY - b.minY;
  });
  expect(v.n === n0 + 1, 'no volume added');
  const h = v.last.ceil - v.last.floor;
  expect(h < height, `volume height ${h} vs data height ${height}`);
  await mod('/src/volumes/store.ts', (m) => m.useVolumeStore.getState().clear());
  return `volume r ${v.last.radius.toFixed(0)}, ${v.last.floor.toFixed(0)}..${v.last.ceil.toFixed(0)} (data ${height.toFixed(0)} high)`;
});

// The stages that follow add their steps above this line.

await browser.close();
if (errors.length) {
  console.log(`console errors:\n  ${errors.slice(0, 10).join('\n  ')}`);
  failed++;
}
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
