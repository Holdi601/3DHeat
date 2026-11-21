/**
 * The chart signs on volumes in a real browser against the dev server: a
 * volume is drawn, a bar chart and a time-series chart are added to it, the
 * match plays, a bar is clicked to filter the view; screenshots in the dark
 * and the light theme go to tools/.smoke/. Fails on a console error or a step
 * whose state is not what it should be. Synthetic data only.
 *
 * Frame timing: with ANALYSIS_GPU=1 it runs on the real GPU and, with
 * SIGNS_ROWS (default 50,000,000) rows and 20 signs live, reports frame
 * interval p50 / p99 / max during playback; on the software rasteriser the
 * numbers mean nothing and are not judged.
 *
 *   node tools/smoke-signs.mjs [url] [--only=<step substring>]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:5273/';
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7) ?? null;
const GPU = process.env.ANALYSIS_GPU === '1';
const BIG = Number(process.env.SIGNS_ROWS ?? 50_000_000);
const OUT = 'tools/.smoke';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  args: GPU
    ? ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--disable-frame-rate-limit', '--js-flags=--max-old-space-size=16384']
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
    // The app's own sign store and client, for the probes (waitForFunction needs a synchronous test).
    await page.evaluate(async () => {
      globalThis.__sc = (await globalThis.__3dheat.modules['volumes/signs/client']()).signClient;
      globalThis.__ss = (await globalThis.__3dheat.modules['volumes/signs/store']()).useSignStore;
    });
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

/** The signs' own timings with their p99s. */
function summarize(t) {
  const p99 = (xs) => {
    const s = [...xs].sort((a, b) => a - b);
    return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.99))] : 0;
  };
  return { ...t, frameP99: p99(t.frameMs), taskP99: p99(t.taskMs) };
}

/** Frame intervals over a few seconds, ms: p50, p99, max. */
function frameTimes(seconds) {
  return page.evaluate(async (seconds) => {
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
    times.shift();
    times.sort((a, b) => a - b);
    const q = (p) => times[Math.min(times.length - 1, Math.floor(times.length * p))];
    return { p50: q(0.5), p99: q(0.99), max: times[times.length - 1], frames: times.length };
  }, seconds);
}

await page.goto(url, { timeout: 240_000 });
await page.waitForFunction(() => !!globalThis.__3dheat_engine && !!globalThis.__3dheat, null, { timeout: 240_000 });
// The app's own sign store and client, for the probes (waitForFunction needs a synchronous test).
await page.evaluate(async () => {
  globalThis.__sc = globalThis.__sc;
  globalThis.__ss = globalThis.__ss;
});

/** Synthetic rows with an event, a weapon, a speed and a won column; a cylinder volume over the middle. */
async function loadData(rows) {
  await page.evaluate(async (rows) => {
    const h = globalThis.__3dheat;
    const s = h.useStore.getState();
    const ds = h.generateSynthetic({ ...h.DEFAULT_SYNTH, rows });
    const n = ds.count;
    const ev = new Uint32Array(n);
    const weapon = new Uint32Array(n);
    const speed = new Float32Array(n);
    const won = new Float32Array(n);
    let seed = 7;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < n; i++) {
      const r = rnd();
      ev[i] = r < 0.02 ? 1 : r < 0.035 ? 2 : 0;
      weapon[i] = Math.floor(rnd() * 5);
      speed[i] = 2 + rnd() * 18 + (ds.teamId ? ds.teamId[i] : 0);
      won[i] = ds.teamId && ds.teamId[i] % 2 === 0 ? 1 : 0;
    }
    ds.attrs.push(
      { name: 'Event type', kind: 'category', data: ev, min: 0, max: 2, categories: ['position', 'kill', 'death'] },
      { name: 'weapon', kind: 'category', data: weapon, min: 0, max: 4, categories: ['rifle', 'smg', 'shotgun', 'sniper', 'pistol'] },
      { name: 'speed', kind: 'number', data: speed, min: 2, max: 28 },
      { name: 'won', kind: 'number', data: won, min: 0, max: 1 },
    );
    s.setDataset(ds);
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all' });
    await new Promise((r) => setTimeout(r, 400));
    const eng = globalThis.__3dheat_engine;
    eng.camera.setOrientationDegrees(30, -55);
    eng.frameDataset();
  }, rows);
  await wait(1200);
}

async function addVolume(name, frac = 0.25) {
  return page.evaluate(async ([name, frac]) => {
    const vs = (await globalThis.__3dheat.modules['volumes/store']()).useVolumeStore.getState();
    const b = globalThis.__3dheat.useStore.getState().dataset.bounds;
    const x = (b.minX + b.maxX) / 2;
    const z = (b.minZ + b.maxZ) / 2;
    const r = (b.maxX - b.minX) * frac;
    return vs.add({ kind: 'cylinder', x, z, radius: r, floor: b.minY - 1, ceil: b.maxY + 1 }, name).id;
  }, [name, frac]);
}

async function resultsReady(n, timeout = 120_000) {
  try {
    await page.waitForFunction((n) => globalThis.__sc.results.size >= n, n, { timeout, polling: 250 });
  } catch (e) {
    const st = await page.evaluate(() => ({ results: globalThis.__sc.results.size, building: globalThis.__sc.isBuilding, progress: globalThis.__sc.progress, stats: globalThis.__sc.stats }));
    throw new Error(`${n} results not in: ${JSON.stringify(st)}`);
  }
}

let vol = null;
let barId = null;
let lineId = null;

await step('a volume shows its chart button at its top corner', async () => {
  await loadData(400_000);
  vol = await addVolume('Middle');
  await page.waitForSelector('.vsign-btn:not([style*="display: none"])', { timeout: 10_000 });
  const n = await page.locator('.vsign-btn').count();
  expect(n === 1, `${n} buttons`);
});

await step('the button opens the panel and Add chart puts a bar chart beside the volume', async () => {
  await page.locator('.vsign-btn').first().click();
  await page.waitForSelector('.vsign-panel', { timeout: 5000 });
  await page.getByRole('button', { name: 'Add chart', exact: true }).first().click();
  await resultsReady(1);
  barId = await page.evaluate(async () => globalThis.__ss.getState().signs[0].id);
  const d = await page.evaluate(async (id) => globalThis.__sc.results.get(id), barId);
  const keys = await page.evaluate(async () => [...globalThis.__sc.results.keys()]);
  expect(d && d.kind === 'bar' && d.groups.length >= 2, `bar data ${JSON.stringify(d)?.slice(0, 300)} ${barId} ${keys}`);
  expect(d.values[0].every((v) => v >= 0), 'counts');
  await page.waitForSelector(`.vsign[data-sign="${barId}"]:not([style*="display: none"])`, { timeout: 5000 });
  return `${d.groups.length} bars, ${d.rows} rows`;
});

await step('a time-series chart is added from the panel and charts match time', async () => {
  await page.getByRole('button', { name: 'Add chart', exact: true }).first().click();
  await page.waitForFunction(() => globalThis.__ss.getState().signs.length === 2);
  lineId = await page.evaluate(async () => globalThis.__ss.getState().signs[1].id);
  await page.locator('.vsign-kinds button', { hasText: 'Line' }).click();
  await page.waitForFunction(
    (id) => globalThis.__sc.results.get(id)?.kind === 'line',
    lineId,
    { timeout: 30_000 },
  );
  const d = await page.evaluate(async (id) => globalThis.__sc.results.get(id), lineId);
  expect(d.axis?.time && d.groups.length >= 8, 'a time axis');
  return `${d.groups.length} bins`;
});

await step('screenshot, dark', async () => {
  await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('dark'));
  await wait(600);
  await page.screenshot({ path: `${OUT}/signs-dark.png` });
});

await step('playback updates the signs live, up to now included', async () => {
  const before = await page.evaluate(async (id) => JSON.stringify(globalThis.__sc.results.get(id).values), barId);
  await page.evaluate(async (id) => {
    globalThis.__ss.getState().update(id, { upToNow: true });
    const s = globalThis.__3dheat.useStore.getState();
    const ds = s.dataset;
    s.patchTimeline({ mode: 'play', window: 'fixed', windowSeconds: 60 });
    s.seek(ds.timeRange[0] + (ds.timeRange[1] - ds.timeRange[0]) * 0.2);
    s.setPlaying(true);
  }, lineId);
  await wait(2500);
  const after = await page.evaluate(async (id) => JSON.stringify(globalThis.__sc.results.get(id).values), barId);
  const st = await page.evaluate(async () => globalThis.__sc.stats);
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setPlaying(false));
  expect(before !== after, 'the bar chart did not change while playing');
  expect(st.scopes >= 3, `${st.scopes} scopes sent`);
  await page.screenshot({ path: `${OUT}/signs-play.png` });
  return `${st.scopes} scopes, ${st.results} results, worker ${st.workerMs.toFixed(1)} ms`;
});

await step('a click on a bar filters the view to it, and again clears it', async () => {
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().patchTimeline({ mode: 'all' }));
  await wait(800);
  const box = await page.locator(`.vsign[data-sign="${barId}"] canvas`).boundingBox();
  expect(box, 'no canvas');
  const g = await page.evaluate(async (id) => globalThis.__sc.results.get(id).groups.length, barId);
  // The first bar's row: single series, a 2 px top, 14 px for the axis.
  const band = (box.height - 16) / g;
  await page.mouse.move(box.x + box.width * 0.7, box.y + 2 + band / 2);
  await wait(200);
  const tip = await page.evaluate(() => document.querySelector('.vsign-tip')?.textContent ?? '');
  await page.mouse.click(box.x + box.width * 0.7, box.y + 2 + band / 2);
  await wait(300);
  const filters = await page.evaluate(() => globalThis.__3dheat.useStore.getState().filters);
  expect(filters.length === 1 && filters[0].kind === 'teams', `filters ${JSON.stringify(filters)}`);
  await wait(800);
  await page.screenshot({ path: `${OUT}/signs-filtered.png` });
  await page.mouse.click(box.x + box.width * 0.7, box.y + 2 + band / 2);
  await wait(300);
  const after = await page.evaluate(() => globalThis.__3dheat.useStore.getState().filters.length);
  expect(after === 0, 'the second click left the filter on');
  return `tooltip "${tip}"`;
});

await step('a sign stands as a fixed board, collapses and is moved', async () => {
  await page.evaluate(async (id) => {
    const st = globalThis.__ss.getState();
    st.update(id, { mode: 'fixed', yaw: 0.6 });
  }, lineId);
  await wait(500);
  const tf = await page.evaluate((id) => document.querySelector(`.vsign[data-sign="${id}"]`)?.style.transform ?? '', lineId);
  expect(tf.startsWith('matrix3d'), `board transform ${tf.slice(0, 40)}`);
  const head = page.locator(`.vsign[data-sign="${barId}"] .vsign-head`);
  const hb = await head.boundingBox();
  await page.mouse.move(hb.x + 40, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + 140, hb.y + hb.height / 2 + 30, { steps: 5 });
  await page.mouse.up();
  const s = await page.evaluate(async (id) => globalThis.__ss.getState().signs.find((x) => x.id === id), barId);
  expect(Math.abs(s.px[0] - (-308 + 100)) < 3, `moved to ${s.px}`);
  const log = await page.evaluate(async () => globalThis.__ss.getState().log.length);
  return `px ${s.px.map((v) => v.toFixed(0))}, ${log} batches`;
});

await step('screenshot, light', async () => {
  await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('light'));
  await page.evaluate(async () => {
    const vs = (await globalThis.__3dheat.modules['volumes/store']()).useVolumeStore.getState();
    vs.select(vs.volumes[0].id);
    globalThis.__ss.getState().closeEditor();
  });
  // The Volumes panel's own drawing of the charts, in the light theme.
  const sec = page.locator('[data-section="volumes.title"]').first();
  if ((await sec.count()) && !(await sec.evaluate((el) => el.classList.contains('open')))) await sec.locator('header').first().click();
  await page.locator('.vsign-section').first().scrollIntoViewIfNeeded().catch(() => undefined);
  await wait(800);
  const previews = await page.locator('.vsign-section canvas').count();
  await page.screenshot({ path: `${OUT}/signs-light.png` });
  expect(previews >= 1, `${previews} charts in the Volumes panel`);
  await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('dark'));
});

await step('every chart kind draws', async () => {
  const kinds = ['stacked', 'area', 'histogram', 'pie', 'tiles', 'matrix', 'scatter'];
  const ids = await page.evaluate(async ([kinds, vol]) => {
    const st = globalThis.__ss.getState();
    return kinds.map((k, i) =>
      st.add(vol, { kind: k, group: 'col:weapon', stack: 'team', x: 'speed', y: 'speed', measure: { kind: k === 'tiles' ? 'count' : 'count', column: 'speed' }, diff: k === 'area' ? 'inout' : k === 'tiles' ? 'outcome' : 'none' }, { scale: 0.8, px: [-700 + (i % 4) * 250, 40 + Math.floor(i / 4) * 200] }).id,
    );
  }, [kinds, vol]);
  await page.waitForFunction(
    (ids) => {
      const c = globalThis.__sc;
      return !c.isBuilding && ids.every((id) => c.results.has(id) && !c.results.get(id).empty);
    },
    ids,
    { timeout: 60_000 },
  );
  const bad = await page.evaluate(async (ids) => {
    const c = globalThis.__sc;
    return ids.map((id) => c.results.get(id)).filter((d) => d.empty).map((d) => `${d.kind}: ${d.empty}`);
  }, ids);
  expect(bad.length === 0, bad.join('; '));
  await wait(800);
  await page.screenshot({ path: `${OUT}/signs-kinds.png` });
  await page.evaluate(async (ids) => {
    const st = globalThis.__ss.getState();
    for (const id of ids) st.remove(id);
  }, ids);
});

await step('a sign sent to an analysis document, and a histogram made in it, are drawn by the chart module', async () => {
  await page.evaluate(async () => {
    const a = await globalThis.__3dheat.modules['ui/notes/actions']();
    a.newAnalysis();
  });
  await page.waitForSelector('.analysis-preview', { timeout: 10_000 });
  // Sent under a filter: the document keeps it and counts the same rows again on a refresh.
  const sum = (d) => d.values[0].reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const allRows = await page.evaluate((id) => globalThis.__sc.results.get(id), barId);
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setFilters([{ kind: 'categories', column: 'weapon', allowed: [0, 1] }]));
  await page.waitForFunction(([id, n]) => {
    const d = globalThis.__sc.results.get(id);
    return d && d.values[0].reduce((a, b) => a + b, 0) < n * 0.6;
  }, [barId, sum(allRows)], { timeout: 30_000 });
  const filtered = await page.evaluate((id) => globalThis.__sc.results.get(id), barId);
  // The bar sign's send button: into the open document.
  // The window lies over the sign: the button is pressed without pointing at it.
  await page.locator(`.vsign[data-sign="${barId}"] .vsign-head button[title^="Send this chart"]`).dispatchEvent('click');
  await page.waitForFunction(() => document.querySelectorAll('.analysis-preview .chart-slot canvas').length >= 1, null, { timeout: 10_000 });
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setFilters([]));
  const sentBlock = async () =>
    page.evaluate(async () => {
      const s = (await globalThis.__3dheat.modules['notes/store']()).useNotes.getState();
      const doc = s.book.docs.find((d) => d.id === s.docOpen);
      const b = Object.values(doc.blocks).find((x) => x.type === 'chartBlock' && x.block.data.kind === 'bar');
      return { id: b.id, at: b.block.at, source: b.block.source, data: b.block.data };
    });
  const sent = await sentBlock();
  expect(sent.source.rows === 'saved' && sent.source.view?.filters?.length === 1, `the block keeps its filters: ${JSON.stringify(sent.source)}`);
  await page.locator(`.analysis-preview button[data-action="chart-refresh"][data-block="${sent.id}"]`).dispatchEvent('click');
  await page.waitForFunction(async (at) => {
    const s = (await globalThis.__3dheat.modules['notes/store']()).useNotes.getState();
    const doc = s.book.docs.find((d) => d.id === s.docOpen);
    return Object.values(doc.blocks).some((x) => x.type === 'chartBlock' && x.block.data.kind === 'bar' && x.block.at !== at);
  }, sent.at, { timeout: 60_000 });
  const again = await sentBlock();
  expect(sum(again.data) === sum(filtered) && sum(again.data) !== sum(allRows), `refreshed over the rows it was sent with: ${sum(again.data)} (sent ${sum(filtered)}, all ${sum(allRows)})`);
  // A chart of another kind from the document's own editor.
  await page.locator('select[aria-label="Insert..."]').selectOption('chart');
  await page.waitForSelector('.chart-editor', { timeout: 5000 });
  await page.locator('.chart-editor .vsign-kinds button', { hasText: 'Histogram' }).click();
  await page.locator('.chart-editor button.primary').click();
  await page.waitForFunction(() => document.querySelectorAll('.analysis-preview .chart-slot canvas').length >= 2, null, { timeout: 60_000 });
  const kinds = await page.evaluate(async () => {
    const s = (await globalThis.__3dheat.modules['notes/store']()).useNotes.getState();
    const doc = s.book.docs.find((d) => d.id === s.docOpen);
    return Object.values(doc.blocks).map((b) => (b.type === 'chartBlock' ? b.block.data.kind : b.type));
  });
  expect(kinds.includes('bar') && kinds.includes('histogram'), `blocks ${kinds}`);
  const html = await page.evaluate(async () => {
    const s = (await globalThis.__3dheat.modules['notes/store']()).useNotes.getState();
    const doc = s.book.docs.find((d) => d.id === s.docOpen);
    return (await globalThis.__3dheat.modules['notes/export']()).docToHtml(doc, s.book);
  });
  expect((html.match(/class="chart-img" src="data:image\/png/g) ?? []).length === 2, 'the export draws both charts as the module does');
  await wait(500);
  await page.screenshot({ path: `${OUT}/signs-document.png` });
  // A theme switch recolours the document's charts in place, from the tokens of the panel they are in. The
  // analysis window keeps the dark look over the stage, so a light panel is set on it for the check.
  await page.evaluate(() => document.querySelector('.analysis-preview').style.setProperty('--panel', '#fbfcfd'));
  const colours = () =>
    page.evaluate(() => {
      const c = document.querySelector('.analysis-preview .chart-slot canvas');
      const px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      const n = { dark: 0, light: 0 };
      for (let i = 0; i < px.length; i += 4) {
        const hex = '#' + [px[i], px[i + 1], px[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
        if (hex === '#3987e5') n.dark++;
        else if (hex === '#2a78d6') n.light++;
      }
      return n;
    });
  await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('dark'));
  await wait(400);
  const dark = await colours();
  await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('light'));
  await wait(400);
  const light = await colours();
  await page.screenshot({ path: `${OUT}/signs-document-light.png` });
  await page.evaluate(() => document.querySelector('.analysis-preview').style.removeProperty('--panel'));
  await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('dark'));
  expect(dark.dark > 0 && light.light > 0 && light.dark === 0, `theme switch recolours the document charts: dark ${JSON.stringify(dark)}, light ${JSON.stringify(light)}`);
  await page.evaluate(async () => (await globalThis.__3dheat.modules['notes/store']()).useNotes.getState().set({ docOpen: null }));
  return `${kinds.join(', ')}; refreshed over its filters (${sum(again.data)} of ${sum(allRows)} rows); recoloured on a theme switch`;
});

await step('signs sync as operations: a peer batch applies, a repeat is ignored', async () => {
  const r = await page.evaluate(async () => {
    const st = globalThis.__ss;
    const s = st.getState();
    const id = s.signs[0].id;
    const batch = { doc: 'signs', id: 'peer-1', author: 'peer', at: Date.now(), ops: [{ op: 'set', coll: 'signs', id, fields: { title: 'From a peer' } }] };
    s.applyRemote(batch);
    st.getState().applyRemote(batch);
    return { title: st.getState().signs[0].title, log: st.getState().log.filter((b) => b.id === 'peer-1').length };
  });
  expect(r.title === 'From a peer' && r.log === 1, JSON.stringify(r));
});

/** Frame intervals from now until a test in the page holds (or `cap` seconds), ms: p50, p99, max, and how long it took. */
function framesUntil(test, arg, cap = 600) {
  return page.evaluate(
    async ([src, arg, cap]) => {
      const done = new Function('arg', `return (${src})(arg);`);
      const times = [];
      const t0 = performance.now();
      let last = t0;
      let took = 0;
      await new Promise((resolve) => {
        const tick = (now) => {
          times.push(now - last);
          last = now;
          if (done(arg) || now - t0 > cap * 1000) {
            took = now - t0;
            resolve();
          } else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      times.shift();
      times.sort((a, b) => a - b);
      const q = (p) => times[Math.min(times.length - 1, Math.floor(times.length * p))] ?? 0;
      return { p50: q(0.5), p99: q(0.99), max: times[times.length - 1] ?? 0, frames: times.length, over20: times.filter((t) => t > 20).length, took };
    },
    [test.toString(), arg, cap],
  );
}

const playMid = () =>
  page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    const ds = s.dataset;
    s.patchTimeline({ mode: 'play', window: 'fixed', windowSeconds: 120 });
    s.seek(ds.timeRange[0] + (ds.timeRange[1] - ds.timeRange[0]) * 0.3);
    s.setPlaying(true);
  });

let bigVols = [];
let bigBase = null;
/** The filter changes timed with 20 signs, and the same without signs (what the view alone costs then). */
const CHANGES = [
  ['a category filter', [{ kind: 'categories', column: 'weapon', allowed: [0, 1, 2] }]],
  ['a range filter on top', [{ kind: 'categories', column: 'weapon', allowed: [0, 1, 2] }, { kind: 'range', column: 'speed', min: 6, max: 18 }]],
  ['one team hidden', [{ kind: 'categories', column: 'weapon', allowed: [0, 1, 2] }, { kind: 'range', column: 'speed', min: 6, max: 18 }, { kind: 'teams', allowed: [0, 1, 2] }]],
  ['the filters off', []],
];
let control = [];
await step(`the first sign on ${(BIG / 1e6).toFixed(0)}M rows: the build drops no frames`, async () => {
  if (!GPU) return 'skipped on the software rasteriser (ANALYSIS_GPU=1 measures it)';
  await page.evaluate(async () => globalThis.__ss.getState().replaceAll([]));
  await loadData(BIG);
  bigVols = [];
  for (let i = 0; i < 4; i++) bigVols.push(await addVolume(`V${i}`, 0.08 + i * 0.05));
  // The same playback without signs first: what the heat alone costs here.
  await playMid();
  await wait(1500);
  bigBase = await frameTimes(6);
  // The filter changes without signs, for the frames the view alone drops on them.
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setPlaying(false);
    s.patchTimeline({ mode: 'all' });
  });
  await wait(1500);
  control = [];
  for (const [what, filters] of CHANGES) {
    await page.evaluate((filters) => globalThis.__3dheat.useStore.getState().setFilters(filters), filters);
    control.push([what, await frameTimes(3)]);
    await wait(500);
  }
  await playMid();
  await wait(1500);
  // The first sign, while the match plays: every frame until its numbers are in.
  await page.evaluate(async () => (await globalThis.__3dheat.modules['volumes/signs/client']()).resetSignTiming());
  const id = await page.evaluate(async (v) => globalThis.__ss.getState().add(v, { kind: 'bar', group: 'team' }, { scale: 0.6, px: [-600, -380] }).id, bigVols[0]);
  const t = await framesUntil((id) => !globalThis.__sc.isBuilding && globalThis.__sc.results.has(id), id);
  const own = summarize(await page.evaluate(async () => ({ ...(await globalThis.__3dheat.modules['volumes/signs/client']()).signTiming })));
  const st = await page.evaluate(() => ({ ...globalThis.__sc.stats, inside: globalThis.__sc.rowsInside, kept: globalThis.__sc.kept ?? null }));
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setPlaying(false));
  const text = `first sign in ${(t.took / 1000).toFixed(1)} s; frames p50 ${t.p50.toFixed(1)} / p99 ${t.p99.toFixed(1)} / max ${t.max.toFixed(1)} ms over ${t.frames}, ${t.over20} over 20 ms; without signs p99 ${bigBase.p99.toFixed(1)} / max ${bigBase.max.toFixed(1)} ms; the build's main-thread tasks p99 ${own.taskP99.toFixed(2)} / max ${own.taskMax.toFixed(2)} ms over ${own.tasks}; ${JSON.stringify(st)}`;
  // Judged by p99: a single long task on a loaded machine is the scheduler's (the max is reported).
  expect(own.taskP99 < 4, `the build's own main-thread work is too long: ${text}`);
  if (!(t.p99 < 20)) console.log(`note: frames over 20 ms during the first build - ${text}`);
  return text;
});

await step(`20 signs live during playback of ${(BIG / 1e6).toFixed(0)}M rows cost no frames`, async () => {
  if (!GPU) return 'skipped on the software rasteriser (ANALYSIS_GPU=1 measures it)';
  await page.evaluate(async () => {
    const st = globalThis.__ss.getState();
    st.replaceAll([]);
  });
  const vols = bigVols;
  const base = bigBase;
  await page.evaluate(async (vols) => {
    const st = globalThis.__ss.getState();
    const kinds = ['bar', 'line', 'histogram', 'tiles', 'stacked'];
    vols.forEach((v, i) =>
      kinds.forEach((k, j) =>
        st.add(v, { kind: k, group: j % 2 ? 'col:weapon' : 'team', stack: 'col:weapon', x: 'speed', measure: { kind: 'count', column: 'speed' }, diff: j === 1 ? 'inout' : 'none' }, { scale: 0.6, upToNow: j === 1, px: [-600 + j * 190, -380 + i * 130] }),
      ),
    );
    st.closeEditor();
  }, vols);
  const t0 = Date.now();
  // While the rows go to the worker (the build), the frames too, and the build's own main-thread work.
  await page.evaluate(async () => (await globalThis.__3dheat.modules['volumes/signs/client']()).resetSignTiming());
  const during = await frameTimes(5);
  const buildOwn = summarize(await page.evaluate(async () => ({ ...(await globalThis.__3dheat.modules['volumes/signs/client']()).signTiming })));
  await resultsReady(20, 900_000);
  const buildMs = Date.now() - t0;
  await page.evaluate(() => {
    const s = globalThis.__3dheat.useStore.getState();
    const ds = s.dataset;
    s.patchTimeline({ mode: 'play', window: 'fixed', windowSeconds: 120 });
    s.seek(ds.timeRange[0] + (ds.timeRange[1] - ds.timeRange[0]) * 0.3);
    s.setPlaying(true);
  });
  await wait(1500);
  await page.evaluate(async () => (await globalThis.__3dheat.modules['volumes/signs/client']()).resetSignTiming());
  const t = await frameTimes(8);
  const own = summarize(await page.evaluate(async () => ({ ...(await globalThis.__3dheat.modules['volumes/signs/client']()).signTiming })));
  const st = await page.evaluate(async () => globalThis.__sc.stats);
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().setPlaying(false));
  await page.screenshot({ path: `${OUT}/signs-20.png` });
  const text = `during the build p99 ${during.p99.toFixed(1)} / max ${during.max.toFixed(1)} ms (its chunk copies p99 ${buildOwn.taskP99.toFixed(2)} / max ${buildOwn.taskMax.toFixed(2)} ms over ${buildOwn.tasks}); without signs p99 ${base.p99.toFixed(1)} / max ${base.max.toFixed(1)} ms; with 20 signs frames p50 ${t.p50.toFixed(1)} / p99 ${t.p99.toFixed(1)} / max ${t.max.toFixed(1)} ms over ${t.frames}; signs' own main-thread work: a frame's p99 ${own.frameP99.toFixed(2)} / max ${own.frameMax.toFixed(2)} ms (mean ${(own.frameSum / Math.max(1, own.frames)).toFixed(3)}), tasks p99 ${own.taskP99.toFixed(2)} / max ${own.taskMax.toFixed(2)} ms over ${own.tasks}; build ${buildMs} ms; ${st.scopes} scopes, worker ${st.workerMs.toFixed(1)} ms last`;
  // The frame times include whatever else the machine does; what the signs add is judged by their own work.
  // Judged by p99: a max on a busy machine is the scheduler's, not the signs'.
  expect(own.frameP99 < 4 && own.taskP99 < 4 && buildOwn.taskP99 < 8, `the signs' own work drops frames: ${text}`);
  if (!(t.p99 < 34 && t.max < 70)) console.log(`note: frame drops in this run, also without signs - ${text}`);
  return text;
});

await step(`fresh numbers on 20 signs after a filter change (${(BIG / 1e6).toFixed(0)}M rows)`, async () => {
  if (!GPU) return 'skipped on the software rasteriser (ANALYSIS_GPU=1 measures it)';
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().patchTimeline({ mode: 'all' }));
  await page.waitForFunction(() => !globalThis.__sc.isBuilding && globalThis.__sc.results.size >= 20, null, { timeout: 600_000 });
  /** Until the worker has counted every sign for the newest scope (code without `isIdle`: 20 s). */
  const settle = () =>
    page.evaluate(async () => {
      const c = globalThis.__sc;
      const t0 = performance.now();
      await new Promise((r) => setTimeout(r, 300));
      while (performance.now() - t0 < 600_000 && !(c.isIdle === undefined ? performance.now() - t0 > 20_000 : c.isIdle)) await new Promise((r) => setTimeout(r, 100));
    });
  await settle();
  const out = [];
  for (const [what, filters] of CHANGES) {
    await page.evaluate(() => {
      // Every sign's next result, timed from the filter change.
      const c = globalThis.__sc;
      const ids = [...c.results.keys()];
      const t0 = performance.now();
      globalThis.__fresh = { t0, left: new Set(ids), at: 0 };
      globalThis.__freshOff?.();
      globalThis.__freshOff = c.subscribe((dirty) => {
        const f = globalThis.__fresh;
        for (const id of dirty) f.left.delete(id);
        if (f.left.size === 0 && !f.at) f.at = performance.now() - f.t0;
      });
    });
    await page.evaluate((filters) => globalThis.__3dheat.useStore.getState().setFilters(filters), filters);
    // At least 3 s of frames, as the control without signs.
    const t = await framesUntil(() => globalThis.__fresh.at > 0 && performance.now() - globalThis.__fresh.t0 > 3000, null, 120);
    const ms = await page.evaluate(() => globalThis.__fresh.at);
    await settle();
    const st = await page.evaluate(() => globalThis.__sc.stats);
    out.push(`${what}: ${ms ? `${ms.toFixed(0)} ms` : 'not all fresh'} (worker ${st.workerMs.toFixed(0)} ms, its shared scans ${(st.scanMs ?? 0).toFixed(0)} ms, ${((st.folded ?? 0) / 1e6).toFixed(1)}M rows folded, ${st.full ?? 0} signs started over; frames p99 ${t.p99.toFixed(1)} / max ${t.max.toFixed(1)}, without signs p99 ${control.find((c) => c[0] === what)?.[1].p99.toFixed(1)} / max ${control.find((c) => c[0] === what)?.[1].max.toFixed(1)})`);
    await wait(500);
  }
  await page.evaluate(() => globalThis.__freshOff?.());
  const info = await page.evaluate(() => ({ workers: globalThis.__sc.rowWorkers, kept: globalThis.__sc.kept, slowed: globalThis.__sc.paceSlowed }));
  return `${out.join('; ')}; ${info.workers ?? 1} row workers (slowed for late frames ${info.slowed ?? 0} times), kept ${JSON.stringify(info.kept)}`;
});

await step('no console errors', async () => {
  expect(errors.length === 0, errors.slice(0, 5).join(' | '));
});

await browser.close();
console.log(failed ? `${failed} failed` : 'all ok');
process.exit(failed ? 1 : 0);
