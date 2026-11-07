/**
 * What is drawn in box replay, and what blinks.
 *
 * The cube buffer carries no person ids, so a cube at index i in one frame and
 * index i in the next need not be the same person — which makes "how much
 * changed" unanswerable from the buffer alone. So this recomputes the same
 * decision `TrackCursor.buildCubes` makes, per person, from the dataset's own
 * columns: who has a sample either side of the playhead, whether that pair is
 * joinable, and whether a held sample has gone stale.
 *
 * With person ids in hand the questions become answerable: how many cubes, how
 * many of them are interpolated rather than held, how many appear and disappear
 * between one step and the next, and which group they belong to.
 *
 *   node tools/probe-cube-churn.mjs [file...]
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
await page.goto('http://127.0.0.1:5273/?backend=webgl2', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40000 });

const out = await page.evaluate(async (targets) => {
  const { previewSource } = await import('/src/data/sourcePreview.ts');
  const { autoMap } = await import('/src/data/automap.ts');
  const { ingestFiles } = await import('/src/data/ingestFiles.ts');

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
  const ds = (await ingestFiles({ files: loaded, mapping, columns: p.columns, name: 'churn' }))
    .dataset;

  const { time, personId, lifetime, personShared, personTeam, count } = ds;
  const persons = ds.personLabels.length;
  const STALE = 10; // the default lifetime, which is the staleness cut-off
  const STEPS = 12;
  const [lo, hi] = ds.timeRange;

  // The instant of the middle *row*, not the middle of the span.
  //
  // Halfway along the time range landed in a gap between two days' exports and
  // found eight people on the whole map, which says nothing about what the
  // viewer shows when there is something to show. The median row is by
  // definition somewhere dense.
  const start = time[count >> 1];
  const dt = 10;
  void lo;
  void hi;

  const prevRow = new Int32Array(persons);
  const nextRow = new Int32Array(persons);
  const frames = [];
  let previousDrawn = null;

  for (let k = 0; k < STEPS; k++) {
    const t = start + k * dt;
    prevRow.fill(-1);
    nextRow.fill(-1);
    // One pass: last row before t, first row at or after t, per person.
    for (let i = 0; i < count; i++) {
      const person = personId[i];
      if (time[i] <= t) prevRow[person] = i;
      else if (nextRow[person] < 0) nextRow[person] = i;
    }

    const drawn = new Set();
    let interpolated = 0;
    let held = 0;
    let sharedDrawn = 0;
    const byTeam = new Map();
    for (let person = 0; person < persons; person++) {
      const a = prevRow[person];
      if (a < 0) continue;
      const b = nextRow[person];
      const joinable =
        b >= 0 && !(personShared && personShared[person]) && (lifetime ? lifetime[a] >= 0 : true);
      let isDrawn;
      if (joinable) {
        isDrawn = true;
        interpolated++;
      } else {
        isDrawn = t - time[a] <= STALE;
        if (isDrawn) held++;
      }
      if (!isDrawn) continue;
      drawn.add(person);
      if (personShared && personShared[person]) sharedDrawn++;
      const team = personTeam ? personTeam[person] : 0;
      byTeam.set(team, (byTeam.get(team) ?? 0) + 1);
    }

    let appeared = 0;
    let vanished = 0;
    if (previousDrawn) {
      for (const q of drawn) if (!previousDrawn.has(q)) appeared++;
      for (const q of previousDrawn) if (!drawn.has(q)) vanished++;
    }
    previousDrawn = drawn;

    frames.push({
      t: +t.toFixed(1),
      cubes: drawn.size,
      interpolated,
      held,
      sharedDrawn,
      appeared,
      vanished,
      churnPct: drawn.size ? +((100 * (appeared + vanished)) / drawn.size).toFixed(1) : 0,
      topGroups: [...byTeam.entries()]
        .sort((x, y) => y[1] - x[1])
        .slice(0, 4)
        .map(([team, n]) => ({ group: ds.teamLabels[team] ?? String(team), n })),
    });
  }

  return {
    rows: count,
    persons,
    groups: ds.teamLabels.slice(0, 24),
    staleSeconds: STALE,
    stepSeconds: dt,
    frames,
  };
}, targets);

console.log(JSON.stringify(out, null, 1));
await browser.close();
