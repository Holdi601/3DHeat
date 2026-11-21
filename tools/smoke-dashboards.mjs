/**
 * The dashboards in a real browser against the dev server (docs/dashboards.md):
 * a dashboard is built by drag and drop (a bar chart, a KPI card, a slicer, a
 * table), sliced, cross-filtered by a click on a bar, drilled down a
 * hierarchy, saved and opened again after a reload, exported (PNG, PDF, CSV,
 * JSON); screenshots in the dark and the light theme go to tools/.smoke/.
 * Fails on a console error or a step whose state is not what it should be.
 * Synthetic data only.
 *
 * It always runs on the real GPU. Frame timing: with ANALYSIS_GPU=1 and,
 * with DASH_ROWS (default 50,000,000) rows and a 12-tile dashboard live, reports
 * the frame intervals during playback (p50 / p99 / max) against the same
 * playback without the dashboard, and how long the tiles take to show fresh
 * numbers after a slicer change.
 *
 *   node tools/smoke-dashboards.mjs [url] [--only=<step substring>]
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:5361/';
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7) ?? null;
const GPU = process.env.ANALYSIS_GPU === '1';
const BIG = Number(process.env.DASH_ROWS ?? 50_000_000);
const OUT = 'tools/.smoke';
mkdirSync(OUT, { recursive: true });
// Always the real GPU: SwiftShader is too slow on a loaded machine.
const browser = await chromium.launch({
  args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--disable-frame-rate-limit', '--js-flags=--max-old-space-size=16384'],
});
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => browser.close().finally(() => process.exit(130)));
let failed = 0;
try {
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 920 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

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

  async function boot() {
    await page.goto(url, { timeout: 240_000 });
    await page.waitForFunction(() => !!globalThis.__3dheat_engine && !!globalThis.__3dheat, null, { timeout: 240_000 });
    await page.evaluate(async () => {
      globalThis.__dc = (await globalThis.__3dheat.modules['dashboards/client']()).dashClient;
      globalThis.__ds = (await globalThis.__3dheat.modules['dashboards/store']()).useDash;
    });
  }

  /** Synthetic rows with an event, a weapon, a speed, a won column and three matches. */
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
      const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
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
        { name: 'Round won', kind: 'number', data: won, min: 0, max: 1 },
      );
      s.setDataset(ds);
      s.setMode('heat-simple');
      s.patchTimeline({ mode: 'all' });
      await new Promise((r) => setTimeout(r, 400));
      globalThis.__3dheat_engine.frameDataset();
    }, rows);
    await wait(1000);
  }

  /** Until the dashboards have counted every shown tile for the newest change. */
  async function settle(timeout = 120_000) {
    await page.waitForFunction(() => globalThis.__dc.isIdle && globalThis.__dc.painted && [...globalThis.__dc.plans.keys()].every((id) => globalThis.__dc.results.has(id)), null, { timeout, polling: 100 });
  }
  const tileData = (id) => page.evaluate((id) => {
    const d = globalThis.__dc.results.get(id);
    return d ? JSON.parse(JSON.stringify(d, (_k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v))) : null;
  }, id);
  const tiles = () => page.evaluate(() => globalThis.__ds.getState().tiles.map((t) => ({ id: t.id, kind: t.kind, axis: t.axis, values: t.values })));
  const kpiValue = async (id) => (await tileData(id))?.value;

  async function dragTo(source, target) {
    await page.locator(source).first().dragTo(page.locator(target).first());
    await wait(150);
  }

  let dashId = null;
  let barId = null;
  let kpiId = null;
  let slicerId = null;
  let tableId = null;

  await boot();

  await step('the quick bar opens the dashboards; New dashboard opens an empty page in edit mode', async () => {
    await loadData(240_000);
    await page.getByRole('button', { name: 'Dashboards', exact: true }).click();
    await page.waitForSelector('.dash-window');
    await page.locator('.dash-start [data-action="new"]').click();
    await page.waitForSelector('.dash-canvas.editing');
    dashId = await page.evaluate(() => globalThis.__ds.getState().open);
    expect(!!dashId, 'a dashboard open');
  });

  await step('a bar chart dragged onto the page, Team dragged onto its axis: rows by team', async () => {
    await dragTo('.dash-kinds [data-visual="bar"]', '.dash-canvas');
    let ts = await tiles();
    expect(ts.length === 1 && ts[0].kind === 'bar', `tiles ${JSON.stringify(ts)}`);
    barId = ts[0].id;
    await dragTo('.dash-field[data-field="team"]', '[data-slot="axis"]');
    ts = await tiles();
    expect(ts[0].axis?.[0] === 'team', `axis ${JSON.stringify(ts[0])}`);
    await settle();
    const d = await tileData(barId);
    expect(d?.kind === 'chart' && d.chart.groups.length >= 2, `bar data ${JSON.stringify(d)?.slice(0, 200)}`);
    const total = d.chart.values[0].reduce((a, b) => a + b, 0);
    const rows = await page.evaluate(() => globalThis.__3dheat.useStore.getState().dataset.count);
    expect(total === rows, `bars sum to ${total} of ${rows}`);
    return `${d.chart.groups.length} bars`;
  });

  await step('a KPI card, a slicer and a table by drag and drop', async () => {
    await dragTo('.dash-kinds [data-visual="kpi"]', '.dash-canvas');
    kpiId = (await tiles()).find((t) => t.kind === 'kpi').id;
    await page.evaluate((id) => globalThis.__ds.getState().patchTile(id, { x: 8, y: 0 }), kpiId);
    await dragTo('.dash-kinds [data-visual="slicer"]', '.dash-canvas');
    slicerId = (await tiles()).find((t) => t.kind === 'slicer').id;
    await page.evaluate((id) => globalThis.__ds.getState().patchTile(id, { x: 12, y: 0, opts: { slicer: 'buttons' } }), slicerId);
    await dragTo('.dash-field[data-field="c:weapon"]', '[data-slot="axis"]');
    await dragTo('.dash-kinds [data-visual="table"]', '.dash-canvas');
    tableId = (await tiles()).find((t) => t.kind === 'table').id;
    await page.evaluate((id) => globalThis.__ds.getState().patchTile(id, { x: 0, y: 8, w: 12 }), tableId);
    await dragTo('.dash-field[data-field="person"]', '[data-slot="axis"]');
    await dragTo('.dash-field[data-field="c:speed"]', '[data-slot="values"]');
    await settle();
    const k = await tileData(kpiId);
    const tb = await tileData(tableId);
    expect(k?.kind === 'kpi' && k.value > 0, `kpi ${JSON.stringify(k)}`);
    expect(tb?.kind === 'table' && tb.rows.length > 10 && tb.head.includes('Mean of speed'), `table ${JSON.stringify(tb)?.slice(0, 300)}`);
    return `KPI ${k.value}, table ${tb.rows.length} rows`;
  });

  await step('the slicer slices every tile; a click on a bar cross-filters the KPI', async () => {
    const before = await kpiValue(kpiId);
    await page.locator(`.dash-tile[data-tile="${slicerId}"] .dash-slicer-buttons button`, { hasText: 'rifle' }).click();
    await settle();
    const sliced = await kpiValue(kpiId);
    expect(sliced < before * 0.4 && sliced > before * 0.1, `sliced ${sliced} of ${before}`);
    // Out of edit mode, a click on a bar selects it.
    await page.locator('.dash-head [data-action="edit"]').click();
    const bar = await tileData(barId);
    const canvas = page.locator(`.dash-tile[data-tile="${barId}"] canvas`).first();
    const box = await canvas.boundingBox();
    const G = bar.chart.groups.length;
    // The first bar: its band's middle, a little right of the labels.
    await canvas.click({ position: { x: box.width * 0.6, y: ((box.height - 14) / G) * 0.5 + 2 } });
    await settle();
    const sel = await page.evaluate((d) => globalThis.__ds.getState().inter[d]?.selection, dashId);
    expect(sel && sel.cells.length === 1, `selection ${JSON.stringify(sel)}`);
    const crossed = await kpiValue(kpiId);
    const barValue = bar.chart.values[0][0];
    expect(Math.abs(crossed - barValue) < 0.5, `KPI ${crossed} vs the bar ${barValue}`);
    const tb = await tileData(tableId);
    return `slice ${before} -> ${sliced}; bar ${bar.chart.groups[0].label} -> KPI ${crossed}, table ${tb.rows.length} rows`;
  });

  await step('a hierarchy drills down from a team to its players and up again', async () => {
    await page.evaluate(([d, b]) => {
      const st = globalThis.__ds.getState();
      st.select(d, null);
      st.patchDash(d, { hierarchies: [{ id: 'h1', name: 'Team › Player', levels: ['team', 'person'] }] });
      st.patchTile(b, { axis: ['h:h1'] });
    }, [dashId, barId]);
    await settle();
    const top = await tileData(barId);
    const canvas = page.locator(`.dash-tile[data-tile="${barId}"] canvas`).first();
    const box = await canvas.boundingBox();
    const G = top.chart.groups.length;
    await canvas.click({ button: 'right', position: { x: box.width * 0.6, y: ((box.height - 14) / G) * 0.5 + 2 } });
    await page.locator('.dash-menu button', { hasText: 'Drill down into' }).click();
    await settle();
    const down = await tileData(barId);
    expect(down.chart.groups.length < 40 && down.chart.groups[0].label !== top.chart.groups[0].label, `drilled ${JSON.stringify(down.chart.groups.map((g) => g.label))}`);
    await page.locator(`.dash-tile[data-tile="${barId}"] button[aria-label="Drill up"]`).click();
    await settle();
    const up = await tileData(barId);
    expect(up.chart.groups.length === G, 'up again');
    return `${top.chart.groups[0].label}: ${down.chart.groups.length} players`;
  });

  await step('screenshots, dark and light', async () => {
    await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('dark'));
    await wait(700);
    await page.screenshot({ path: `${OUT}/dashboards-dark.png` });
    await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('light'));
    await wait(700);
    await page.screenshot({ path: `${OUT}/dashboards-light.png` });
    await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('dark'));
  });

  await step('exports: page PNG and PDF, the table as CSV with formulas kept as text, the dashboard as JSON', async () => {
    const take = async (action) => {
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30_000 }), action()]);
      const p = `${OUT}/${dl.suggestedFilename()}`;
      await dl.saveAs(p);
      return p;
    };
    const menu = async (k) => {
      await page.locator('.dash-head [data-action="more"]').click();
      await page.locator(`.dash-menu [data-action="${k}"]`).click();
    };
    const png = await take(() => menu('png'));
    const pdf = await take(() => menu('pdf'));
    const json = await take(() => menu('json'));
    expect(readFileSync(png).subarray(1, 4).toString() === 'PNG', 'a PNG');
    expect(readFileSync(pdf).subarray(0, 5).toString() === '%PDF-', 'a PDF');
    const bundle = JSON.parse(readFileSync(json, 'utf8'));
    expect(bundle.schema === 'heat3d.dashboard/1' && bundle.tiles.length === 4, 'the JSON');
    // A player named like a formula: the CSV keeps it as text.
    const csv = await page.evaluate(async () => {
      const m = await import('/src/dashboards/export.ts');
      return m.toCsv([['name', 'n'], ['=HYPERLINK("x")', '3'], ['+SUM(A1)', '2'], ['-5', '1']]);
    });
    expect(csv.includes(`"'=HYPERLINK(""x"")"`) && csv.includes("'+SUM(A1)") && csv.includes('\r\n-5,1'), `csv ${csv}`);
    const tcsv = await take(async () => {
      await page.locator(`.dash-tile[data-tile="${tableId}"] button[aria-label="More"]`).click();
      await page.locator('.dash-menu button', { hasText: 'Download as CSV' }).click();
    });
    expect(readFileSync(tcsv, 'utf8').split('\r\n').length > 10, 'the table CSV');
    return [png, pdf, json, tcsv].join(', ');
  });

  await step('saved: after a reload the dashboard opens again with its tiles', async () => {
    await wait(800);
    await boot();
    await loadData(240_000);
    const n = await page.evaluate((d) => {
      const st = globalThis.__ds.getState();
      st.openDash(d);
      return st.tiles.filter((t) => st.pages.some((p) => p.id === t.pageId && p.dashId === d)).length;
    }, dashId);
    expect(n === 4, `${n} tiles`);
    await page.waitForSelector(`.dash-tile[data-tile="${kpiId}"]`);
    await settle();
    expect((await kpiValue(kpiId)) > 0, 'the KPI counts again');
  });

  await step('undo and redo an edit', async () => {
    await page.evaluate((id) => globalThis.__ds.getState().removeTile(id), kpiId);
    expect((await tiles()).length === 3, 'removed');
    await page.evaluate((d) => globalThis.__ds.getState().undoEdit(d), dashId);
    expect((await tiles()).length === 4, 'back');
    await page.evaluate((d) => globalThis.__ds.getState().redoEdit(d), dashId);
    expect((await tiles()).length === 3, 'gone again');
    await page.evaluate((d) => globalThis.__ds.getState().undoEdit(d), dashId);
  });

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

  async function play() {
    await page.evaluate(() => {
      const s = globalThis.__3dheat.useStore.getState();
      const ds = s.dataset;
      s.patchTimeline({ mode: 'play', window: 'fixed', windowSeconds: 120 });
      s.seek(ds.timeRange[0] + (ds.timeRange[1] - ds.timeRange[0]) * 0.3);
      s.setPlaying(true);
    });
    await wait(1500);
  }

  await step(`a 12-tile dashboard live during playback of ${(BIG / 1e6).toFixed(0)}M rows: frames and fresh numbers`, async () => {
    if (!GPU) return 'skipped (ANALYSIS_GPU=1 runs the 50M-row measure)';
    await page.evaluate(() => globalThis.__ds.getState().setShown(false));
    await loadData(BIG);
    await play();
    const base = await frameTimes(6);
    await page.evaluate(() => globalThis.__3dheat.useStore.getState().setPlaying(false));
    // The overview template (with its slicers) plus tiles up to twelve that show data.
    const id = await page.evaluate(async () => {
      const st = globalThis.__ds.getState();
      const tpl = (await import('/src/dashboards/templates.ts')).TEMPLATES.find((t) => t.id === 'overview');
      const cat = globalThis.__dc.catalog({ id: 'probe', name: '', theme: 'auto', link: { followView: true, driveView: false, volume: false }, at: 0 });
      const b = tpl.build(cat);
      const id = st.create('Perf', b, 'heat');
      st.setEdit(false);
      return id;
    });
    const n = await page.evaluate((d) => {
      const st = globalThis.__ds.getState();
      const pg = st.pages.find((p) => p.dashId === d);
      return st.tiles.filter((t) => t.pageId === pg.id && !['title', 'text', 'image', 'slicer'].includes(t.kind)).length;
    }, id);
    const t0 = Date.now();
    await settle(900_000);
    const buildMs = Date.now() - t0;
    await page.evaluate(async () => (await globalThis.__3dheat.modules['dashboards/client']()).resetDashTiming());
    await play();
    const live = await frameTimes(8);
    const own = await page.evaluate(async () => {
      const t = (await globalThis.__3dheat.modules['dashboards/client']()).dashTiming;
      const s = [...t.taskMs].sort((a, b) => a - b);
      return { p99: s[Math.floor(s.length * 0.99)] ?? 0, max: t.taskMax, tasks: t.tasks };
    });
    const st = await page.evaluate(() => ({ ...globalThis.__dc.stats, worker: globalThis.__dc.workerStats() }));
    await page.evaluate(() => globalThis.__3dheat.useStore.getState().setPlaying(false));
    await page.screenshot({ path: `${OUT}/dashboards-12.png` });
    // Fresh numbers after a slicer change (the play stopped, the view showing all).
    await page.evaluate(() => globalThis.__3dheat.useStore.getState().patchTimeline({ mode: 'all' }));
    await settle(900_000);
    const fresh = [];
    for (const label of [['position'], ['kill'], []]) {
      const ms = await page.evaluate(async ([d, label]) => {
        const st = globalThis.__ds.getState();
        const pg = st.pages.find((p) => p.dashId === d);
        const slicer = st.tiles.find((t) => t.pageId === pg.id && t.kind === 'slicer' && t.axis?.[0] === 'c:Event type');
        const t0 = performance.now();
        st.setSlicer(slicer.id, label.length ? { id: 's', field: 'c:Event type', op: 'in', values: label } : null);
        await new Promise((r) => setTimeout(r, 30));
        while (!(globalThis.__dc.isIdle && globalThis.__dc.painted && [...globalThis.__dc.plans.keys()].every((id) => globalThis.__dc.results.has(id)))) await new Promise((r) => setTimeout(r, 10));
        return performance.now() - t0;
      }, [id, label]);
      fresh.push(`${label[0] ?? 'off'} ${ms.toFixed(0)} ms`);
    }
    const text = `${n} data tiles; first build ${buildMs} ms; without the dashboard p99 ${base.p99.toFixed(1)} / max ${base.max.toFixed(1)} ms; with it live p50 ${live.p50.toFixed(1)} / p99 ${live.p99.toFixed(1)} / max ${live.max.toFixed(1)} ms over ${live.frames}; its main-thread tasks p99 ${own.p99.toFixed(2)} / max ${own.max.toFixed(2)} ms over ${own.tasks}; fresh after a slicer change: ${fresh.join(', ')}; ${JSON.stringify(st)}`;
    expect(own.p99 < 4, `the dashboard's own main-thread work is too long: ${text}`);
    if (!(live.p99 < base.p99 + 8)) console.log(`note: frames slower with the dashboard live - ${text}`);
    return text;
  });

  await step('no console errors', async () => {
    expect(errors.length === 0, errors.slice(0, 5).join(' | '));
  });
} finally {
  await browser.close();
}
console.log(failed ? `${failed} failed` : 'all ok');
process.exit(failed ? 1 : 0);
