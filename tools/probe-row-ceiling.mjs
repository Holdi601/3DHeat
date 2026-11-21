/**
 * How many rows does one tab survive, and how smooth is it there?
 *
 * Loads a wide synthetic table - positions, time, a player and a team, plus
 * `--extra` numeric measures - through the real loader, in a fresh browser per
 * attempt, at growing row counts until the tab dies. `--mode eager` keeps every
 * measure in memory, as a load did before the columns on demand; `--mode
 * ondemand` leaves them to be read when something asks (`columnSource.ts`).
 * Where a load survives, frame times are taken under camera motion and
 * playback (p50, p99, max), on the real GPU unless `--soft`.
 *
 * The table is written once to `--dir` (outside the repository: it is
 * gigabytes) and repeated by hard links, so a 400M-row load costs one file of
 * disk.
 *
 *   node tools/probe-row-ceiling.mjs --dir E:/scratch/rows --mode ondemand --from 200 --step 50 --to 600
 */
import { existsSync, linkSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const url = arg('url', 'http://127.0.0.1:5273/?backend=webgl2');
const dir = arg('dir', null);
const mode = arg('mode', 'ondemand');
const perFile = Number(arg('rows-per-file', 10_000_000));
const extra = Number(arg('extra', 8));
const from = Number(arg('from', 100)) * 1e6;
const step = Number(arg('step', 50)) * 1e6;
const to = Number(arg('to', 600)) * 1e6;
const soft = process.argv.includes('--soft');
const threads = Number(arg('threads', 4));
if (!dir) throw new Error('--dir is required');
mkdirSync(dir, { recursive: true });

const EXTRA = Array.from({ length: extra }, (_, i) => `m${i}`);
const base = join(dir, `wide-${perFile}-${extra}.parquet`);

async function writeBase() {
  if (existsSync(base) && statSync(base).size > 0) return;
  const { ParquetWriter, fileWriter } = await import('hyparquet-writer');
  const cols = [
    { name: 'x', type: 'FLOAT' },
    { name: 'y', type: 'FLOAT' },
    { name: 'z', type: 'FLOAT' },
    { name: 'time', type: 'DOUBLE' },
    { name: 'player', type: 'BYTE_ARRAY', converted_type: 'UTF8' },
    { name: 'team', type: 'BYTE_ARRAY', converted_type: 'UTF8' },
    ...EXTRA.map((name) => ({ name, type: 'FLOAT' })),
  ];
  const schema = [{ name: 'root', num_children: cols.length }, ...cols.map((c) => ({ ...c, repetition_type: 'REQUIRED' }))];
  const w = new ParquetWriter({ writer: fileWriter(base), schema, kvMetadata: [], statistics: true });
  const G = 1_000_000;
  const P = 64;
  const names = Array.from({ length: P }, (_, i) => `p${i}`);
  const teams = Array.from({ length: P }, (_, i) => (i % 2 ? 'blue' : 'red'));
  const pos = Array.from({ length: P }, (_, i) => [Math.cos(i) * 1500, 0, Math.sin(i) * 1500]);
  let row = 0;
  while (row < perFile) {
    const n = Math.min(G, perFile - row);
    const x = new Float32Array(n);
    const y = new Float32Array(n);
    const z = new Float32Array(n);
    const t = new Float64Array(n);
    const pl = new Array(n);
    const tm = new Array(n);
    const ex = EXTRA.map(() => new Float32Array(n));
    for (let i = 0; i < n; i++) {
      const r = row + i;
      const p = r % P;
      const q = pos[p];
      q[0] = Math.max(-2000, Math.min(2000, q[0] + (Math.random() - 0.5) * 4));
      q[2] = Math.max(-2000, Math.min(2000, q[2] + (Math.random() - 0.5) * 4));
      q[1] = 20 * Math.sin(q[0] / 300) * Math.cos(q[2] / 300);
      x[i] = q[0];
      y[i] = q[2];
      z[i] = q[1];
      t[i] = Math.floor(r / P) * 0.1;
      pl[i] = names[p];
      tm[i] = teams[p];
      for (let k = 0; k < ex.length; k++) ex[k][i] = (r * (k + 1)) % 1000;
    }
    w.write({
      columnData: [
        { name: 'x', data: x },
        { name: 'y', data: y },
        { name: 'z', data: z },
        { name: 'time', data: t },
        { name: 'player', data: pl },
        { name: 'team', data: tm },
        ...EXTRA.map((name, k) => ({ name, data: ex[k] })),
      ],
      rowGroupSize: G,
    });
    row += n;
  }
  w.finish();
}

function copies(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const p = i === 0 ? base : join(dir, `wide-${perFile}-${extra}-${i}.parquet`);
    if (!existsSync(p)) linkSync(base, p);
    out.push(p);
  }
  return out;
}

const quantile = (s, q) => s[Math.min(s.length - 1, Math.floor(s.length * q))];

async function attempt(rows) {
  const files = copies(Math.ceil(rows / perFile));
  const total = files.length * perFile;
  const browser = await chromium.launch({
    args: soft
      ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
      : ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  let crashed = false;
  page.on('crash', () => {
    crashed = true;
  });
  const t0 = Date.now();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 60_000 });
    await page.evaluate(() => {
      const i = document.createElement('input');
      i.type = 'file';
      i.multiple = true;
      i.id = 'probe-files';
      i.style.display = 'none';
      document.body.appendChild(i);
    });
    await page.setInputFiles('#probe-files', files);
    const loaded = await page.evaluate(
      async ({ extraCols, mode, threads, total }) => {
        const { loader } = await import('/src/data/loader.ts');
        const { emptyColumnMapping } = await import('/src/state/types.ts');
        const files = [...document.getElementById('probe-files').files];
        const m = {
          ...emptyColumnMapping(),
          x: 'x',
          y: 'y',
          z: 'z',
          time: 'time',
          personId: 'player',
          teamId: 'team',
          extra: mode === 'eager' ? extraCols : [],
          onDemand: mode === 'eager' ? [] : extraCols,
          extraNumeric: Object.fromEntries(extraCols.map((c) => [c, true])),
        };
        m.axes = { ...m.axes, up: 'z' };
        try {
          // As the Source panel loads: the exact row count from the footers, and the RAM budget the app chose.
          const ram = globalThis.__3dheat.useStore.getState().budgets.ram;
          const ds = await loader.ingest(files, m, [], 'probe', 1, total, undefined, { threads, ram });
          globalThis.__3dheat.useStore.getState().setDataset(ds);
          const live = globalThis.__3dheat_engine.live;
          const until = performance.now() + 600_000;
          while (performance.now() < until && live.residentRows + live.droppedRows < ds.count) await new Promise((r) => setTimeout(r, 200));
          return { ok: true, rows: ds.count, resident: live.residentRows, dropped: live.droppedRows, attrs: ds.attrs.length };
        } catch (e) {
          return { ok: false, error: String(e && e.message ? e.message : e) };
        }
      },
      { extraCols: EXTRA, mode, threads, total },
    );
    if (!loaded.ok) return { rows: total, survived: false, why: loaded.error, s: (Date.now() - t0) / 1000 };
    // Frame times while the camera moves and the timeline plays.
    const frames = await page.evaluate(async () => {
      const s = globalThis.__3dheat.useStore.getState();
      s.patchTimeline({ playing: true });
      const eng = globalThis.__3dheat_engine;
      const dts = [];
      let last = performance.now();
      const until = last + 8000;
      for (let k = 0; performance.now() < until; k++) {
        eng.camera.setOrientationDegrees(eng.camera.yawDegrees + 0.3, eng.camera.pitchDegrees);
        await new Promise((r) => requestAnimationFrame(r));
        const now = performance.now();
        dts.push(now - last);
        last = now;
      }
      s.patchTimeline({ playing: false });
      return dts.slice(30).sort((a, b) => a - b);
    });
    // On demand: a filter asks for a measure, which is read while the camera
    // moves and the timeline plays. The frames during the read are the ones
    // that would show a decode on the frame path.
    // Eager, the same filter on the column already in memory: what applying a
    // filter costs without any read.
    const read = await page.evaluate(async () => {
            const h = globalThis.__3dheat;
            const cs = await h.modules['data/columnStore']();
            const s = h.useStore.getState();
            s.patchTimeline({ playing: true });
            const eng = globalThis.__3dheat_engine;
            const t0 = performance.now();
            s.setFilters([{ kind: 'range', column: 'm0', min: 0, max: 499 }]);
            const dts = [];
            let last = performance.now();
            while (performance.now() - t0 < 600_000 && cs.useColumnStore.getState().entries.m0?.state === 'loading') {
              eng.camera.setOrientationDegrees(eng.camera.yawDegrees + 0.3, eng.camera.pitchDegrees);
              await new Promise((r) => requestAnimationFrame(r));
              const now = performance.now();
              dts.push(now - last);
              last = now;
            }
            // And the frames just after, when the filter first applies.
            for (let k = 0; k < 120; k++) {
              eng.camera.setOrientationDegrees(eng.camera.yawDegrees + 0.3, eng.camera.pitchDegrees);
              await new Promise((r) => requestAnimationFrame(r));
              const now = performance.now();
              dts.push(now - last);
              last = now;
            }
            s.patchTimeline({ playing: false });
            const e = cs.useColumnStore.getState().entries.m0;
            dts.sort((a, b) => a - b);
            return { state: e?.state ?? 'in memory at load', error: e?.error, s: (performance.now() - t0) / 1000, dts };
          });
    const heap = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? null);
    return {
      rows: total,
      survived: !crashed,
      loaded,
      p50: quantile(frames, 0.5),
      p99: quantile(frames, 0.99),
      max: frames[frames.length - 1],
      frames: frames.length,
      heapGB: heap ? heap / 1024 ** 3 : null,
      read: read && { state: read.state, error: read.error, s: read.s, p99: quantile(read.dts, 0.99), max: read.dts[read.dts.length - 1], frames: read.dts.length },
      s: (Date.now() - t0) / 1000,
    };
  } catch (e) {
    return { rows: total, survived: false, why: crashed ? 'renderer crashed' : String(e.message ?? e).slice(0, 200), s: (Date.now() - t0) / 1000 };
  } finally {
    await browser.close().catch(() => {});
  }
}

await writeBase();
console.log(`row ceiling, ${mode}, ${extra} measures, ${perFile / 1e6}M rows a file${soft ? ', software GL' : ''}`);
for (let rows = from; rows <= to; rows += step) {
  const r = await attempt(rows);
  const f = (v) => (v === undefined || v === null ? '-' : v.toFixed(1));
  console.log(
    `${(r.rows / 1e6).toFixed(0)}M: ${r.survived ? 'ok' : 'DIED'}` +
      (r.survived ? ` resident ${(r.loaded.resident / 1e6).toFixed(0)}M, frames p50 ${f(r.p50)} p99 ${f(r.p99)} max ${f(r.max)} ms (${r.frames}), heap ${f(r.heapGB)} GB` : ` (${r.why})`) +
      `, ${r.s.toFixed(0)} s`,
  );
  if (r.read)
    console.log(`  filter on m0: ${r.read.state}${r.read.error ? ` (${r.read.error})` : ''} in ${r.read.s.toFixed(1)} s, frames p99 ${f(r.read.p99)} max ${f(r.read.max)} ms (${r.read.frames})`);
  if (!r.survived) break;
}
