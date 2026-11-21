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
import { writeFileSync } from 'node:fs';

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
/** Frame intervals, ms, while something else moves the camera (the caster), with the replay playing. */
async function orbitTimingFree(seconds = 2) {
  return page.evaluate(async (seconds) => {
    globalThis.__3dheat.useStore.getState().setPlaying(true);
    const times = [];
    const t0 = performance.now();
    let last = t0;
    await new Promise((resolve) => {
      const tick = (now) => {
        times.push(now - last);
        last = now;
        if (now - t0 < seconds * 1000) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    globalThis.__3dheat.useStore.getState().setPlaying(false);
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

/** A module of the app, the app's own instance (`__3dheat.modules` in main.tsx). */
const mod = (path, fn, a) =>
  page.evaluate(
    async ([p, src, arg]) => {
      const name = p.replace(/^\/src\//, '').replace(/\.tsx?$/, '');
      const load = globalThis.__3dheat.modules[name];
      if (!load) throw new Error(`no module ${name} in __3dheat.modules`);
      return new Function('m', 'arg', `return (${src})(m, arg)`)(await load(), arg);
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
    const scope = await globalThis.__3dheat.modules['volumes/scope']();
    const r = await m.runInsights(s.dataset, scope.currentScope(s, 0), s.level, {});
    const store = await globalThis.__3dheat.modules['insights/store']();
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

// ------------------------------------------------------------- engagement lines

await step('engagement lines: exchanges found, drawn during the fight, gone after', async () => {
  await page.evaluate(async (u) => {
    await globalThis.__3dheat.loadUrls([u]);
    globalThis.__3dheat.useStore.getState().setMode('team');
  }, `${DEMO}/tanks.parquet`);
  await wait(2000);
  // The figure replay's own dataset: overlaid matches name their tracks by match.
  const info = await mod('/src/ui/replay/engagements.ts', (m) => {
    const ds = globalThis.__3dheat.useStore.getState().dataset;
    const g = m.findEngagements(ds);
    let r = g.next();
    while (!r.done) r = g.next();
    const e = r.value;
    const reasons = {};
    for (const x of e.exchanges) reasons[x.reason] = (reasons[x.reason] ?? 0) + 1;
    const x = e.exchanges.find((y) => y.t1 - y.t0 > 1) ?? e.exchanges[0];
    const row = x ? Array.from(ds.personId).indexOf(x.a) : -1;
    return { n: e.exchanges.length, reasons, x: x ? { t0: x.t0, t1: x.t1, hardEnd: x.hardEnd, a: x.a, b: x.b } : null, session: ds.sessionId && row >= 0 ? ds.sessionId[row] : -1 };
  });
  expect(info.n > 0 && info.x, 'no exchanges in the tank demo');
  await page.evaluate((session) => {
    const s = globalThis.__3dheat.useStore.getState();
    if (session >= 0) s.patchTeam({ session });
    // The replay at a moment: in All mode every sample is drawn and there is no now.
    s.patchTimeline({ mode: 'play' });
    s.setPlaying(false);
  }, info.session);
  await wait(1500);
  await mod('/src/state/replayStore.ts', (m) => {
    const r = m.useReplayStore.getState();
    r.setAids ? r.setAids({ engagements: 'all', engageBy: 'exchange', engageBefore: 2, engageAfter: 2 }) : m.useReplayStore.setState({ aids: { ...r.aids, engagements: 'all', engageBy: 'exchange', engageBefore: 2, engageAfter: 2 } });
  });
  const seek = (t) => page.evaluate((t) => globalThis.__3dheat.useStore.getState().seek(t), t);
  const path = () => page.evaluate(() => (document.querySelector('.replay-engage-line:not(.soft)')?.getAttribute('d') ?? '') + '|' + (document.querySelector('.replay-engage-line.soft')?.getAttribute('d') ?? ''));
  await seek((info.x.t0 + info.x.t1) / 2);
  await wait(1500);
  // The camera over the pair, so both ends are on screen.
  const placed = await page.evaluate(([a, b]) => {
    const eng = globalThis.__3dheat_engine;
    const ta = eng.liveTracks.find((t) => t.person === a);
    const tb = eng.liveTracks.find((t) => t.person === b);
    if (!ta || !tb) return eng.liveTracks.map((t) => t.person);
    const r = Math.hypot(ta.x - tb.x, ta.y - tb.y, ta.z - tb.z);
    eng.camera.setOrientationDegrees(0, -60);
    eng.frameAround((ta.x + tb.x) / 2, (ta.y + tb.y) / 2, (ta.z + tb.z) / 2, Math.max(r, 20));
    return true;
  }, [info.x.a, info.x.b]);
  expect(placed === true, `the engaged tracks are not placed: live ${JSON.stringify(placed)}`);
  await wait(800);
  const during = await path();
  const engaged = await mod('/src/ui/replay/engagements.ts', (m) => m.engagedTracks.size);
  expect(engaged >= 2, `${engaged} tracks engaged at the fight`);
  expect(during.replace('|', '').length > 4, 'no engagement line during the fight');
  await seek(info.x.hardEnd + 30);
  await wait(1000);
  const after = await mod('/src/ui/replay/engagements.ts', (m) => [...m.engagedTracks]);
  expect(!(after.includes(info.x.a) && after.includes(info.x.b)), 'the pair is still engaged after its end');
  const t = await orbitTiming(2);
  judge(t);
  return `${info.n} exchanges ${JSON.stringify(info.reasons)}; line drawn during the fight, gone after; ${timingText(t)}`;
});

// -------------------------------------------------------- volume intersections

/** Lines where a cylinder cuts a flat terrain, seen from above, on one backend: pixels in its colour with the lines on and off. */
async function contourCheck(p) {
  return p.evaluate(async () => {
    const h = globalThis.__3dheat;
    const s = h.useStore.getState();
    s.setDataset(h.generateSynthetic({ ...h.DEFAULT_SYNTH, rows: 20_000 }));
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    // Heat out of the way: only the level and the lines.
    s.patchHeat({ saturation: 1e9 });
    const b = h.useStore.getState().dataset.bounds;
    const n = 40;
    const lines = [];
    for (let z = 0; z <= n; z++) for (let x = 0; x <= n; x++) lines.push(`v ${(b.minX + ((b.maxX - b.minX) * x) / n).toFixed(3)} ${b.minY.toFixed(3)} ${(b.minZ + ((b.maxZ - b.minZ) * z) / n).toFixed(3)}`);
    for (let z = 0; z < n; z++)
      for (let x = 0; x < n; x++) {
        const a = z * (n + 1) + x + 1;
        lines.push(`f ${a} ${a + 1} ${a + n + 1}`, `f ${a + 1} ${a + n + 2} ${a + n + 1}`);
      }
    const { modelLoader } = await import('/src/data/modelLoader.ts');
    const m = await modelLoader.load(new File([lines.join('\n')], 'flat.obj', { type: 'text/plain' }), 4000);
    s.setLevel({ kind: 'model', name: 'flat.obj', vertices: m.vertices, indices: m.indices, structureIndices: m.structureIndices, structureEdges: m.structureEdges, triangles: m.triangles, structureTriangles: m.structureTriangles, sourceTriangles: m.sourceTriangles, sourceStructureTriangles: m.sourceStructureTriangles, partNames: m.partNames, partClasses: m.partClasses, partReasons: m.partReasons, bounds: m.bounds, opacity: 1, desaturate: 1, brightness: 0.9, wireframe: false });
    const vs = (await h.modules['volumes/store']()).useVolumeStore.getState();
    vs.clear();
    const cx = (b.minX + b.maxX) / 2;
    const cz = (b.minZ + b.maxZ) / 2;
    const r = (b.maxX - b.minX) * 0.2;
    const v = vs.add({ kind: 'cylinder', x: cx, z: cz, radius: r, floor: b.minY - 50, ceil: b.minY + 50 });
    const eng = globalThis.__3dheat_engine;
    eng.camera.setOrientationDegrees(0, -89.9);
    eng.frameDataset();
    const prefs = (await h.modules['render/volumeContours']()).useContourPrefs;
    const count = async (on) => {
      prefs.getState().set({ on });
      eng.invalidate(6);
      await new Promise((res) => setTimeout(res, 900));
      const f = await eng.captureFrame();
      if (!f) return -1;
      const hex = v.color.replace('#', '');
      const [R, G, B] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
      let k = 0;
      for (let i = 0; i < f.rgba.length; i += 4) if (Math.abs(f.rgba[i] - R) < 40 && Math.abs(f.rgba[i + 1] - G) < 40 && Math.abs(f.rgba[i + 2] - B) < 40) k++;
      // The ring in pixels: its circumference on screen.
      const c = eng.project(cx, b.minY, cz);
      const e = eng.project(cx + r, b.minY, cz);
      const ringPx = c && e ? 2 * Math.PI * Math.hypot(e.x - c.x, e.y - c.y) * (f.width / eng.canvas.clientWidth) : 0;
      return { k, ringPx };
    };
    const on = await count(true);
    const off = await count(false);
    prefs.getState().set({ on: true });
    vs.clear();
    s.setLevel(null);
    s.patchHeat({ saturation: 24 });
    return { on, off, backend: eng.live.backend };
  });
}

await step('volume intersections: a line where the volume cuts the level, both backends', async () => {
  const notes = [];
  for (const backend of ['webgpu', 'webgl2']) {
    // WebGPU needs the full Chromium channel and its own flags (tools/probe-webgpu.mjs).
    const b = backend === 'webgpu'
      ? await chromium.launch({ channel: 'chromium', headless: true, args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--disable-vulkan-surface', '--ignore-gpu-blocklist'] }).catch(() => null)
      : browser;
    if (!b) {
      notes.push('webgpu: no Chromium channel');
      continue;
    }
    const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
    p.on('pageerror', (e) => errors.push(String(e)));
    await p.goto(`${url}${url.includes('?') ? '&' : '?'}backend=${backend}`);
    await p.waitForFunction(() => !!globalThis.__3dheat_engine && !!globalThis.__3dheat, null, { timeout: 60_000 });
    await p.waitForTimeout(800);
    const r = await contourCheck(p);
    await p.close();
    if (b !== browser) await b.close();
    if (r.backend !== backend) {
      notes.push(`${backend}: not available here (ran ${r.backend})`);
      continue;
    }
    if (r.on.k < 0) {
      notes.push(`${r.backend}: no capture`);
      continue;
    }
    const added = r.on.k - r.off.k;
    // About the ring's circumference times the line width, give or take.
    expect(added > r.on.ringPx * 0.5 && added < r.on.ringPx * 8, `${r.backend}: ${added} line pixels for a ring of ${r.on.ringPx.toFixed(0)} px`);
    notes.push(`${r.backend}: ${added} px for a ${r.on.ringPx.toFixed(0)} px ring`);
  }
  const t = await orbitTiming(2);
  judge(t);
  return `${notes.join('; ')}; ${timingText(t)}`;
});

// ------------------------------------------------------------- caster cinema

await step('caster cinema: a moment is reached without a cut, subtitled, and a camera move takes over', async () => {
  await page.evaluate(async (u) => {
    await globalThis.__3dheat.loadUrls([u]);
    const s = globalThis.__3dheat.useStore.getState();
    s.setMode('team');
    s.patchTimeline({ mode: 'play' });
    s.setPlaying(false);
  }, `${DEMO}/tanks.parquet`);
  await wait(2000);
  // Insights, Caster tab, on one match.
  const head = page.locator('.section > header').filter({ hasText: /Insights\s*$/ }).first();
  if (!(await page.locator('.ins').count())) await head.click();
  await page.getByRole('button', { name: 'Caster' }).first().click();
  await wait(500);
  const pick = page.locator('.ins-cast select');
  if (await pick.count()) {
    const v = await pick.locator('option').nth(1).getAttribute('value');
    await pick.selectOption(v);
    await wait(800);
  }
  await page.waitForSelector('.ins-moment .ins-head', { timeout: 20_000 });
  await mod('/src/ui/insights/cinemaStore.ts', (m) => m.useCinema.getState().set({ on: true, subtitles: true }));
  // Record the camera every frame from the click on.
  await page.evaluate(() => {
    const eng = globalThis.__3dheat_engine;
    const out = (globalThis.__camTrace = []);
    const tick = () => {
      const p = eng.cameraPose().position;
      out.push([performance.now(), p.x, p.y, p.z]);
      if (out.length < 400) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.locator('.ins-moment .ins-head').nth(2).click();
  await page.waitForSelector('.cast-subtitle', { timeout: 10_000 });
  await wait(3500);
  const trace = await page.evaluate(() => globalThis.__camTrace);
  // From the first frame that moved: the largest step, against the whole move, and how sharply the speed changed.
  const steps = [];
  for (let i = 1; i < trace.length; i++) steps.push(Math.hypot(trace[i][1] - trace[i - 1][1], trace[i][2] - trace[i - 1][2], trace[i][3] - trace[i - 1][3]));
  const total = Math.hypot(trace[trace.length - 1][1] - trace[0][1], trace[trace.length - 1][2] - trace[0][2], trace[trace.length - 1][3] - trace[0][3]);
  const maxStep = Math.max(...steps);
  expect(total > 1, 'the camera did not move to the moment');
  expect(maxStep < total * 0.12, `a cut: one frame moved ${maxStep.toFixed(1)} of ${total.toFixed(1)}`);
  const sub = await page.evaluate(() => document.querySelector('.cast-sub-line')?.textContent ?? '');
  expect(sub.length > 10, 'no subtitle line');
  const rings = await page.evaluate(() => [...document.querySelectorAll('.cast-ring')].filter((e) => e.style.display !== 'none').length);
  if (process.env.ANALYSIS_SHOTS) await page.screenshot({ path: `${process.env.ANALYSIS_SHOTS}/caster.png` });
  // The viewer moves the camera: the caster lets go and offers to resume.
  await page.evaluate(() => {
    const eng = globalThis.__3dheat_engine;
    const p = eng.cameraPose();
    eng.setCameraPose({ x: p.position.x + 50, y: p.position.y + 20, z: p.position.z }, p.forward);
  });
  await wait(400);
  const held = await mod('/src/ui/insights/cinemaStore.ts', (m) => m.useCinema.getState().held);
  expect(held, 'a camera move did not take over');
  await page.getByRole('button', { name: 'Resume caster camera' }).first().click();
  await wait(300);
  const resumed = await mod('/src/ui/insights/cinemaStore.ts', (m) => !m.useCinema.getState().held);
  expect(resumed, 'resume did not give the camera back');
  const t = await orbitTimingFree(2);
  judge(t);
  await mod('/src/ui/insights/cinemaStore.ts', (m) => m.stopCinema());
  return `moved ${total.toFixed(0)} units, largest frame step ${((maxStep / total) * 100).toFixed(1)}%; subtitle "${sub.slice(0, 60)}..."; ${rings} rings; ${timingText(t)}`;
});

// ------------------------------------------------------- camera paths to video

/** A short render of a two-key path at 320 x 180, in the view as it is; what came out. */
async function renderShort(container, keep = false) {
  return mod('/src/render/record.ts', async (m, [container, keep]) => {
    const eng = globalThis.__3dheat_engine;
    const p = eng.cameraPose();
    const c = eng.camera;
    const k0 = { u: 0, x: p.position.x, y: p.position.y, z: p.position.z, yaw: c.yawDegrees, pitch: c.pitchDegrees, fov: 60, ease: 'inOut' };
    const k1 = { ...k0, u: 1, x: p.position.x + 30, ease: undefined };
    const r = await m.renderPath(eng, { keys: [k0, k1], easing: 'smooth', timing: 'constant', container, size: { width: 320, height: 180 }, seconds: 0.5, fps: 8, kbps: 2000, maxWaitFrames: 4 });
    const head = new Uint8Array(await r.blob.slice(0, 64).arrayBuffer());
    const text = String.fromCharCode(...head);
    const back = eng.renderSize;
    let b64 = null;
    if (keep) {
      const all = new Uint8Array(await r.blob.arrayBuffer());
      let s = '';
      for (let i = 0; i < all.length; i += 0x8000) s += String.fromCharCode(...all.subarray(i, i + 0x8000));
      b64 = btoa(s);
    }
    return { frames: r.frames, w: r.width, h: r.height, size: r.blob.size, ext: r.ext, codec: r.codec, ok: container === 'mp4' ? text.slice(4, 8) === 'ftyp' : text.includes(container === 'mkv' ? 'matroska' : 'webm'), restored: back === null, b64 };
  }, [container, keep]);
}

await step('camera paths render to video in every mode, at a size of their own', async () => {
  const avc = await page.evaluate(async () => {
    try {
      return (await VideoEncoder.isConfigSupported({ codec: 'avc1.42001f', width: 320, height: 180, bitrate: 1e6, framerate: 8 })).supported;
    } catch {
      return false;
    }
  });
  const containers = avc ? ['mp4', 'mkv', 'webm'] : ['webm', 'mkv'];
  const notes = [];
  const modes = [
    ['heat', async () => loadSynthetic(50_000, 'heat-simple')],
    ['difference', async () => page.evaluate(() => globalThis.__3dheat.useStore.getState().setMode('heat-difference'))],
    [
      'replay',
      async () => {
        await page.evaluate(async (u) => {
          await globalThis.__3dheat.loadUrls([u]);
          globalThis.__3dheat.useStore.getState().setMode('team');
        }, `${DEMO}/tanks.parquet`);
        await wait(1500);
      },
    ],
    [
      'tactics',
      async () => {
        await page.getByRole('tab', { name: 'Tactics' }).or(page.getByRole('button', { name: 'Tactics' })).first().click();
        await wait(800);
      },
    ],
  ];
  let i = 0;
  for (const [name, setup] of modes) {
    await setup();
    await wait(500);
    const c = containers[i++ % containers.length];
    const r = await renderShort(c, !!process.env.ANALYSIS_SHOTS);
    if (r.b64) writeFileSync(`${process.env.ANALYSIS_SHOTS}/render-${name}.${r.ext}`, Buffer.from(r.b64, 'base64'));
    expect(r.frames === 4 && r.w === 320 && r.h === 180, `${name}: ${JSON.stringify(r)}`);
    expect(r.ok && r.size > 100, `${name}: not a ${c} file (${r.size} bytes)`);
    expect(r.restored, `${name}: the view kept the render size`);
    notes.push(`${name} ${c} ${r.codec} ${r.size} B`);
  }
  await page.getByRole('tab', { name: 'Heatmap' }).or(page.getByRole('button', { name: 'Heatmap' })).first().click();
  return `${notes.join('; ')}${avc ? '' : ' (no H.264 encoder in this browser: MP4 not tried)'}`;
});

// ---------------------------------------------------------------- saved views

await step('saved views: save with a note, change everything, restore, export', async () => {
  await loadSynthetic(50_000, 'heat-difference');
  const before = await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.toggleTeam(0, false);
    const eng = globalThis.__3dheat_engine;
    eng.setCameraPose({ x: 100, y: 900, z: 300 }, { x: 0, y: -0.8, z: -0.6 });
    return eng.cameraPose().position;
  });
  await wait(300);
  const head = page.locator('.section > header').filter({ hasText: /Saved views\s*$/ }).first();
  await head.click();
  await page.getByRole('textbox', { name: 'Name' }).first().fill('West hold');
  await page.getByRole('textbox', { name: 'Note' }).first().fill('Blue hidden, difference from above');
  await page.getByRole('button', { name: 'Save view' }).click();
  await wait(200);
  // Everything elsewhere.
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setMode('heat-simple');
    s.toggleTeam(0, true);
    globalThis.__3dheat_engine.setCameraPose({ x: -500, y: 50, z: -500 }, { x: 1, y: 0, z: 0 });
  });
  await wait(300);
  await page.locator('.saved-views .view-name', { hasText: 'West hold' }).first().click();
  await wait(800);
  const after = await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    return { mode: s.mode, hidden: s.teamVisibility[0] === false, pos: globalThis.__3dheat_engine.cameraPose().position };
  });
  expect(after.mode === 'heat-difference', `mode ${after.mode}`);
  expect(after.hidden, 'the hidden group came back');
  expect(Math.hypot(after.pos.x - before.x, after.pos.y - before.y, after.pos.z - before.z) < 1, `camera at ${JSON.stringify(after.pos)}`);
  const note = await page.locator('.saved-views .view-note-text').first().textContent();
  expect(/Blue hidden/.test(note ?? ''), 'note not shown');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).last().click();
  const d = await download;
  const text = await (await d.createReadStream()).toArray().then((parts) => Buffer.concat(parts).toString('utf8'));
  expect(/heat3d\.views\/1/.test(text) && /West hold/.test(text), 'export lacks the view');
  // Tidy: the list as it was.
  await page.evaluate(() => localStorage.removeItem('heat3d.savedViews'));
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().toggleTeam(0, true));
  return `restored mode, groups and camera; exported ${text.length} bytes`;
});

// The stages that follow add their steps above this line.

await browser.close();
if (errors.length) {
  console.log(`console errors:\n  ${errors.slice(0, 10).join('\n  ')}`);
  failed++;
}
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
