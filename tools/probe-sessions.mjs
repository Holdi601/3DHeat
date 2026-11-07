/**
 * What one session looks like against all of them, on the real telemetry.
 *
 * The unit tests in `src/data/tracks.test.ts` prove the rule exactly — no
 * interpolation and no trail across a session boundary — on four hand-built
 * rows. What they cannot show is whether the rule matters, and the answer is the
 * point of the session picker: the test export holds thousands of sessions,
 * and asking for "everyone alive" without choosing one puts every player who
 * ever played on the map at once.
 *
 *   node tools/probe-sessions.mjs [path-under-the-repo]
 */
import { chromium } from 'playwright';
import { localSample } from './local-data.mjs';

// Default to a file that exists after the region sort. The old default,
// `TestData/movementso.parquet`, was moved into `TestData/eu/...` and this probe
// had been failing on a missing file rather than on anything it tests.
const TARGET =
  process.argv[2] ?? localSample('secondary', 1);
const browser = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto('http://127.0.0.1:5273/?backend=webgl2', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40000 });
const out = await page.evaluate(async (TARGET) => {
  const { previewSource } = await import('/src/data/sourcePreview.ts');
  const { autoMap } = await import('/src/data/automap.ts');
  const { ingestFiles } = await import('/src/data/ingestFiles.ts');
  const { TrackCursor } = await import('/src/data/tracks.ts');
  const { playbackRange } = await import('/src/data/sessions.ts');
  const bytes = await (await fetch('/' + TARGET)).arrayBuffer();
  const file = new File([bytes], TARGET.split('/').pop());
  const p = await previewSource(file);
  const mapping = autoMap({ columns: p.columns, rows: p.rows, numeric: p.numeric, logicalTypes: p.logicalTypes, fileCount: 1 });
  const ds = (await ingestFiles({ files: [file], mapping, columns: p.columns, name: 's' }))?.dataset;
  const rows = Array.from(ds.sessionRows);
  let busiest = 0;
  for (let i = 1; i < rows.length; i++) if (rows[i] > rows[busiest]) busiest = i;

  const all = () => true;
  const probe = (session) => {
    const c = new TrackCursor(ds);
    c.setSession(session);
    const [lo, hi] = playbackRange(ds, 'team', session);
    let maxCubes = 0, totalStep = 0, samples = 0, biggestStep = 0;
    let prev = null;
    for (let k = 0; k <= 20; k++) {
      const t = lo + ((hi - lo) * k) / 20;
      c.update(t);
      const { data, count } = c.buildCubes(t, true, 1e9, all);
      maxCubes = Math.max(maxCubes, count);
      // How far a cube moves between two adjacent probes.
      //
      // Read this as an upper bound, not as one person's speed: the buffer is
      // packed in person order over whoever is *drawn*, so cube i at one instant
      // and cube i at the next need not be the same person. When the set of live
      // people changes the indices shift and the difference is between two
      // strangers. It is still the right shape of signal for "did something
      // teleport", which is what it is here for — but a large value on its own
      // is not evidence of a bad join. The trail measurements in
      // `probe-shared-names.mjs` are per pair and do carry that meaning.
      if (prev && count > 0 && prev.count > 0) {
        const n = Math.min(count, prev.count);
        for (let i = 0; i < n; i++) {
          const dx = data[i*8] - prev.data[i*8], dz = data[i*8+2] - prev.data[i*8+2];
          const d = Math.hypot(dx, dz);
          totalStep += d; samples++;
          if (d > biggestStep) biggestStep = d;
        }
      }
      prev = { data: Array.from(data.subarray(0, count*8)), count };
      prev.data = Float32Array.from(prev.data);
    }
    return { span_min: +(((hi - lo) / 60).toFixed(1)), maxCubes,
             meanStep_m: samples ? +((totalStep / samples / 100).toFixed(1)) : 0,
             maxStep_m: +((biggestStep / 100).toFixed(0)) };
  };
  return { sessions: rows.length, busiest, busiestRows: rows[busiest],
           one: probe(busiest), allSessions: probe(-1) };
}, TARGET);
console.log(JSON.stringify(out, null, 1));
await browser.close();

