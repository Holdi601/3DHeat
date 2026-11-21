/**
 * Do a thousand data notes cost frames?
 *
 * Loads synthetic data, flies the camera round it for a few seconds and
 * reads the frame times (p50, p99, max) - with no notes, then with 1,000
 * notes on the view (pins at places and moments, half of them about a time),
 * in All mode and in Play mode with the playhead moving - on the real GPU
 * unless `--soft`. Frame times from requestAnimationFrame, the camera moved
 * every frame, so the pins are drawn and the time windows checked every frame.
 *
 *   node tools/probe-notes.mjs [url] [--soft] [--notes=1000] [--seconds=6]
 */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--')) ?? 'http://127.0.0.1:5273/';
const soft = args.includes('--soft');
const count = Number(args.find((a) => a.startsWith('--notes='))?.slice(8) ?? 1000);
const seconds = Number(args.find((a) => a.startsWith('--seconds='))?.slice(10) ?? 6);
const webgpu = !soft && !/backend=webgl2/.test(url);

const browser = await chromium.launch(
  soft
    ? { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
    : webgpu
      ? { channel: 'chromium', args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist'] }
      : { args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] },
);
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.addInitScript(() => localStorage.setItem('heat3d.language', 'en'));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!globalThis.__3dheat_engine, null, { timeout: 60_000 });
await page.evaluate(() => globalThis.__3dheat.load(300_000));
await page.waitForTimeout(3000);

/** Frames over `seconds` with the camera circling the data; Play mode moves the playhead too. */
const measure = (play) =>
  page.evaluate(
    async ({ seconds, play }) => {
      const st = globalThis.__3dheat.useStore.getState();
      st.patchTimeline({ mode: play ? 'play' : 'all' });
      st.setPlaying(play);
      const eng = globalThis.__3dheat_engine;
      const b = st.dataset.bounds;
      const cx = (b.minX + b.maxX) / 2;
      const cz = (b.minZ + b.maxZ) / 2;
      const r = Math.max(b.maxX - b.minX, b.maxZ - b.minZ) * 0.8;
      const y = b.maxY + r * 0.5;
      const dts = [];
      let last = performance.now();
      const until = last + seconds * 1000;
      await new Promise((done) => {
        const tick = (now) => {
          dts.push(now - last);
          last = now;
          const a = now / 2500;
          const p = { x: cx + Math.cos(a) * r, y, z: cz + Math.sin(a) * r };
          const f = { x: cx - p.x, y: b.minY - y, z: cz - p.z };
          const l = Math.hypot(f.x, f.y, f.z);
          eng.setCameraPose(p, { x: f.x / l, y: f.y / l, z: f.z / l });
          if (now < until) requestAnimationFrame(tick);
          else done();
        };
        requestAnimationFrame(tick);
      });
      st.setPlaying(false);
      dts.shift();
      dts.sort((x, y) => x - y);
      const q = (p) => dts[Math.min(dts.length - 1, Math.floor(dts.length * p))];
      return { frames: dts.length, p50: q(0.5), p99: q(0.99), max: dts[dts.length - 1], pins: eng.notePins.pins.length, backend: eng.live.backend };
    },
    { seconds, play },
  );

const addNotes = (n) =>
  page.evaluate(async (n) => {
    const { useNotes } = await globalThis.__3dheat.modules['notes/store']();
    const ds = globalThis.__3dheat.useStore.getState().dataset;
    const b = ds.bounds;
    const [t0, t1] = ds.timeRange;
    const colors = ['#f5c542', '#46c8ff', '#ff6a3d', '#3ddc84'];
    const notes = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(Math.random() * ds.count);
      notes.push({
        id: `probe${i}`,
        title: `Note ${i}`,
        text: 'A synthetic note',
        tags: [],
        color: colors[i % 4],
        author: 'probe',
        created: Date.now(),
        updated: Date.now(),
        anchor: { kind: 'place', point: { x: ds.px[r], y: ds.py[r], z: ds.pz[r] }, t: i % 2 ? t0 + Math.random() * (t1 - t0) : null },
      });
    }
    void b;
    useNotes.getState().commit({ notes, docs: [] });
    // Resolved off the frame: wait for the pins.
    for (let k = 0; k < 100 && globalThis.__3dheat_engine.notePins.pins.length < n; k++) await new Promise((r) => setTimeout(r, 50));
    return globalThis.__3dheat_engine.notePins.pins.length;
  }, n);

const fmt = (r) => `p50 ${r.p50.toFixed(2)} ms, p99 ${r.p99.toFixed(2)} ms, max ${r.max.toFixed(1)} ms over ${r.frames} frames (${r.pins} pins, ${r.backend})`;

await page.evaluate(async () => {
  const { useNotes } = await globalThis.__3dheat.modules['notes/store']();
  useNotes.getState().commit({ notes: [], docs: [] });
});
const baseAll = await measure(false);
const basePlay = await measure(true);
const pins = await addNotes(count);
const notesAll = await measure(false);
const notesPlay = await measure(true);
console.log(`no notes, All:      ${fmt(baseAll)}`);
console.log(`no notes, Play:     ${fmt(basePlay)}`);
console.log(`${count} notes, All:  ${fmt(notesAll)}`);
console.log(`${count} notes, Play: ${fmt(notesPlay)}`);
console.log(`pins resolved: ${pins}`);
await page.evaluate(async () => {
  const { useNotes } = await globalThis.__3dheat.modules['notes/store']();
  useNotes.getState().commit({ notes: [], docs: [] });
});
await browser.close();
