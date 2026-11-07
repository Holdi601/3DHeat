/**
 * The lines across the map, measured on the real telemetry.
 *
 * The unit tests prove the rule on hand-built rows: a position is only joined to
 * the next position of the same player in the same match. What they cannot show
 * is the size of what the rule removes, and on this data it is most of the
 * picture — one name (the bots' shared AI controller class) covers hundreds of
 * matches, a score of bots report on a single tick under it, and every line
 * drawn between two of those samples crosses the map.
 *
 * So this measures the same dataset twice: once as it is ingested, and once with
 * the two guards blanked out, which is what the viewer did before. The pair of
 * numbers is the before and after.
 *
 *   node tools/probe-shared-names.mjs [file...]
 */
import { chromium } from 'playwright';
import { localSample } from './local-data.mjs';

const files = process.argv.slice(2);
const targets = files.length
  ? files
  : [
      localSample('primary', 0),
      localSample('secondary', 1),
    ];

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('  console.error:', m.text());
});
await page.goto('http://127.0.0.1:5273/?backend=webgl2', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40000 });

const out = await page.evaluate(async (targets) => {
  const { previewSource } = await import('/src/data/sourcePreview.ts');
  const { autoMap } = await import('/src/data/automap.ts');
  const { ingestFiles } = await import('/src/data/ingestFiles.ts');
  const { TrackCursor } = await import('/src/data/tracks.ts');

  const loaded = [];
  for (const t of targets) {
    const bytes = await (await fetch('/' + t)).arrayBuffer();
    loaded.push(new File([bytes], t.split('/').pop()));
  }
  const p = await previewSource(loaded[0]);
  const mapping = autoMap({
    columns: p.columns,
    rows: p.rows,
    numeric: p.numeric,
    logicalTypes: p.logicalTypes,
    fileCount: loaded.length,
  });
  const res = await ingestFiles({ files: loaded, mapping, columns: p.columns, name: 'us-week1' });
  const ds = res.dataset;

  const sharedNames = [];
  let sharedCount = 0;
  if (ds.personShared) {
    for (let i = 0; i < ds.personShared.length; i++) {
      if (ds.personShared[i]) {
        sharedCount++;
        if (sharedNames.length < 6) sharedNames.push(ds.personLabels[i] || '(blank)');
      }
    }
  }

  /**
   * Longest trail segment and largest cube step over a walk of the playhead.
   *
   * Both are distances a thing would have had to travel, so both answer the same
   * question: is this one moving object or two? A player covers a few tens of
   * metres in a trail window; a line between two bots covers hundreds.
   */
  const walk = (dataset, label) => {
    const c = new TrackCursor(dataset);
    const all = () => true;
    const [lo, hi] = dataset.timeRange;
    let maxSeg = 0;
    let segs = 0;
    let segOver200 = 0;
    let maxStep = 0;
    let maxCubes = 0;
    let prev = null;
    const STEPS = 24;
    for (let k = 0; k <= STEPS; k++) {
      const t = lo + ((hi - lo) * k) / STEPS;
      c.update(t);
      const cubes = c.buildCubes(t, true, 10, all);
      maxCubes = Math.max(maxCubes, cubes.count);
      // Upper bound only: the cube buffer is packed over whoever is drawn, so
      // index i need not be the same person from one instant to the next. The
      // trail figures below are per pair and are the ones that mean something.
      if (prev && cubes.count > 0 && prev.count > 0) {
        const n = Math.min(cubes.count, prev.count);
        for (let i = 0; i < n; i++) {
          const d = Math.hypot(
            cubes.data[i * 8] - prev.data[i * 8],
            cubes.data[i * 8 + 2] - prev.data[i * 8 + 2],
          );
          if (d > maxStep) maxStep = d;
        }
      }
      prev = { data: Float32Array.from(cubes.data.subarray(0, cubes.count * 8)), count: cubes.count };

      const tr = c.buildTrails(t, 30, all);
      for (let v = 0; v + 1 < tr.count; v += 2) {
        const d = Math.hypot(
          tr.data[(v + 1) * 7] - tr.data[v * 7],
          tr.data[(v + 1) * 7 + 2] - tr.data[v * 7 + 2],
        );
        segs++;
        if (d > maxSeg) maxSeg = d;
        if (d > 200 * 100) segOver200++;
      }
    }
    // World units are centimetres in this export; report metres.
    return {
      label,
      maxCubes,
      trailSegments: segs,
      maxTrailSegment_m: +(maxSeg / 100).toFixed(1),
      segmentsOver200m: segOver200,
      segmentsOver200m_pct: segs ? +((100 * segOver200) / segs).toFixed(2) : 0,
      maxCubeStep_m: +(maxStep / 100).toFixed(1),
    };
  };

  // Can anything be joined at all? A session column that is really a per-row
  // timestamp makes every consecutive pair look like two different matches, and
  // then nothing interpolates — the opposite failure to the one being fixed.
  let joinable = 0;
  for (let i = 0; i < ds.count; i++) if (ds.lifetime[i] >= 0) joinable++;
  const joinablePct = +((100 * joinable) / ds.count).toFixed(2);

  const after = walk(ds, 'with the rule');
  // Exactly the state the viewer was in: no shared-name knowledge, and the
  // session column dropped so every "compare the sessions if we have them"
  // check passes.
  const before = walk(
    { ...ds, personShared: null, sessionId: null, lifetime: null },
    'rule off (what it did before)',
  );

  return {
    mappedSession: mapping.sessionId,
    mappedPerson: mapping.personId,
    rows: ds.count,
    persons: ds.personLabels.length,
    sessions: ds.sessionLabels.length,
    sharedCount,
    sharedNames,
    rowsWithASuccessorInTheirOwnMatch_pct: joinablePct,
    warnings: ds.warnings,
    before,
    after,
  };
}, targets);

console.log(JSON.stringify(out, null, 1));
await browser.close();
