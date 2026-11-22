/**
 * Ground units and ships against the terrain drawn under them: are they on
 * it, under it, floating over it, and does that change with the zoom?
 *
 * Loads one recording or table through the app's own picker and load card
 * (the level is picked by itself: a level from the levels folder, a streamed
 * theatre, a DCS recording's game areas), finds the five busiest spots of its
 * ground units, and at two camera heights over each measures every ground
 * row's height over the triangles drawn there (the streamed tiles, else the
 * level's ground), from the CPU copies the renderer draws from. Prints the
 * median, p10 and p90 in metres and the share more than 2 m under and more
 * than 2 m above, per spot and over all close-up samples.
 *
 *   node tools/probe-ground-height.mjs <file> [--url URL] [--shots PREFIX] [--max-off PERCENT]
 *
 * Fails when more than `--max-off` percent (default 10) of the close-up
 * samples are more than 2 m off. Dev server only (it reads the dev hooks).
 * The real GPU, one browser, closed however the run ends.
 */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const file = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const url = opt('--url', 'http://127.0.0.1:5273/');
const shot = opt('--shots', '');
const MAX_OFF = Number(opt('--max-off', 10));
if (!file) {
  console.log('usage: node tools/probe-ground-height.mjs <file> [--url URL] [--shots PREFIX] [--max-off PERCENT]');
  process.exit(2);
}
let failed = false;
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--headless=new', '--enable-unsafe-webgpu'] });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 180000 });
  page.on('filechooser', (fc) => void fc.setFiles([file]));
  await page.getByRole('button', { name: /^Open files/ }).first().click();
  const go = page.locator('[data-testid=load-card-go]');
  await go.waitFor({ timeout: 300000 });
  await page.waitForFunction(() => !document.querySelector('[data-testid=load-card-go]')?.disabled, null, { timeout: 300000 });
  await go.click();
  await page.waitForFunction(() => { const s = globalThis.__3dheat.useStore.getState(); return s.dataset && !s.load.active && s.level; }, null, { timeout: 400000 });
  // The busiest ground spots: ground rows on a coarse grid, the five fullest cells.
  const spots = await page.evaluate(async () => {
    const { groundPersons } = await import('/src/data/groundFit.ts');
    const d = globalThis.__3dheat.useStore.getState().dataset;
    const g = groundPersons(d);
    globalThis.__aglGround = g;
    if (!g) return [];
    const cells = new Map();
    for (let r = 0; r < d.count; r += 7) {
      if (!g[d.personId[r]]) continue;
      const w = { x: d.px[r], y: d.py[r], z: d.pz[r] };
      const k = `${Math.floor(w.x / 3000)},${Math.floor(w.z / 3000)}`;
      const c = cells.get(k) ?? { n: 0, x: 0, y: 0, z: 0 };
      c.n++; c.x += w.x; c.y += w.y; c.z += w.z;
      cells.set(k, c);
    }
    return [...cells.values()].sort((a, b) => b.n - a.n).slice(0, 5).map((c) => ({ n: c.n, x: c.x / c.n, y: c.y / c.n, z: c.z / c.n }));
  });
  console.log('spots', spots.length, '· level', await page.evaluate(() => globalThis.__3dheat.useStore.getState().level?.name ?? '-'));
  const all = [];
  for (const [i, s] of spots.entries()) {
    for (const up of [3000, 400]) {
      await page.evaluate(({ s, up }) => {
        const e = globalThis.__3dheat_engine;
        const from = { x: s.x, y: s.y + up, z: s.z + up * 0.8 };
        const f = { x: s.x - from.x, y: s.y - from.y, z: s.z - from.z };
        const l = Math.hypot(f.x, f.y, f.z);
        e.setCameraPose(from, { x: f.x / l, y: f.y / l, z: f.z / l });
      }, { s, up });
      await new Promise((r) => setTimeout(r, 12000));
      const res = await page.evaluate(async ({ s }) => {
        const { worldTiles } = await import('/src/world/tileSet.ts');
        const st = globalThis.__3dheat.useStore.getState();
        const d = st.dataset;
        const g = globalThis.__aglGround;
        const lv = st.level;
        // Ground triangles drawn: the streamed tiles, else the level's own.
        const meshes = worldTiles.tiles.length ? worldTiles.tiles.map((t) => ({ v: t.vertices, i: t.indices, b: t.bounds })) : lv?.kind === 'model' ? [{ v: lv.vertices, i: lv.indices, b: lv.bounds }] : [];
        const R = 2500;
        const tris = [];
        for (const m of meshes) {
          if (m.b && (m.b.maxX < s.x - R || m.b.minX > s.x + R || m.b.maxZ < s.z - R || m.b.minZ > s.z + R)) continue;
          for (let k = 0; k < m.i.length; k += 3) {
            const a = m.i[k] * 6, b = m.i[k + 1] * 6, c = m.i[k + 2] * 6;
            if (Math.max(m.v[a], m.v[b], m.v[c]) < s.x - R || Math.min(m.v[a], m.v[b], m.v[c]) > s.x + R || Math.max(m.v[a + 2], m.v[b + 2], m.v[c + 2]) < s.z - R || Math.min(m.v[a + 2], m.v[b + 2], m.v[c + 2]) > s.z + R) continue;
            tris.push([m.v[a], m.v[a + 1], m.v[a + 2], m.v[b], m.v[b + 1], m.v[b + 2], m.v[c], m.v[c + 1], m.v[c + 2]]);
          }
        }
        // A coarse bucket index of the triangles.
        const B = 50, idx = new Map();
        for (const t of tris) {
          const x0 = Math.floor(Math.min(t[0], t[3], t[6]) / B), x1 = Math.floor(Math.max(t[0], t[3], t[6]) / B);
          const z0 = Math.floor(Math.min(t[2], t[5], t[8]) / B), z1 = Math.floor(Math.max(t[2], t[5], t[8]) / B);
          for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) { const k = x + ',' + z; (idx.get(k) ?? idx.set(k, []).get(k)).push(t); }
        }
        const hAt = (x, z) => {
          for (const t of idx.get(Math.floor(x / B) + ',' + Math.floor(z / B)) ?? []) {
            const d0 = (t[5] - t[8]) * (t[0] - t[6]) + (t[6] - t[3]) * (t[2] - t[8]);
            if (!d0) continue;
            const l1 = ((t[5] - t[8]) * (x - t[6]) + (t[6] - t[3]) * (z - t[8])) / d0;
            const l2 = ((t[8] - t[2]) * (x - t[6]) + (t[0] - t[6]) * (z - t[8])) / d0;
            const l3 = 1 - l1 - l2;
            if (l1 >= -1e-6 && l2 >= -1e-6 && l3 >= -1e-6) return l1 * t[1] + l2 * t[4] + l3 * t[7];
          }
          return NaN;
        };
        const k = d.entitySize ? d.entitySize / 0.8 : 1;
        const agl = [];
        const byType = {};
        const typeCol = d.attrs.find((a) => a.kind === 'category' && /^(kind|type)$/i.test(a.name.trim()));
        for (let r = 0; r < d.count; r += 3) {
          if (!g[d.personId[r]]) continue;
          const w = { x: d.px[r], y: d.py[r], z: d.pz[r] };
          if (Math.abs(w.x - s.x) > R || Math.abs(w.z - s.z) > R) continue;
          const h = hAt(w.x, w.z);
          if (!Number.isFinite(h)) continue;
          agl.push((w.y - h) / k);
          // By the unit's type, to tell a class of units off the ground from a terrain that is.
          const t = typeCol ? String(typeCol.categories[typeCol.data[r]] ?? '') : '';
          (byType[t] ??= []).push((w.y - h) / k);
        }
        const types = Object.entries(byType)
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 4)
          .map(([t, v]) => `${t || '-'} ${v.length}× ${v.sort((x, y) => x - y)[Math.floor(v.length / 2)].toFixed(1)} m`);
        return { tiles: meshes.length, tris: tris.length, agl, types };
      }, { s });
      const a = res.agl.sort((x, y) => x - y);
      const q = (p) => (a.length ? a[Math.floor(p * (a.length - 1))] : NaN);
      const under = a.filter((v) => v < -2).length / Math.max(1, a.length);
      const over = a.filter((v) => v > 2).length / Math.max(1, a.length);
      console.log(`spot ${i + 1} @${up} m: ${a.length} samples on ${res.tris} triangles · median ${q(0.5).toFixed(1)} m · p10 ${q(0.1).toFixed(1)} · p90 ${q(0.9).toFixed(1)} · under ${(under * 100).toFixed(0)}% · floating ${(over * 100).toFixed(0)}%`);
      if (up === 400) {
        for (const v of a) all.push(v);
        console.log(`  by type: ${res.types.join(' · ')}`);
      }
      if (shot && i === 0) await page.screenshot({ path: `${shot}-spot1-${up}.png` });
    }
  }
  all.sort((x, y) => x - y);
  const q = (p) => (all.length ? all[Math.floor(p * (all.length - 1))] : NaN);
  const off = (all.filter((v) => Math.abs(v) > 2).length / Math.max(1, all.length)) * 100;
  failed = !all.length || off > MAX_OFF;
  console.log(`ALL close: ${all.length} · median ${q(0.5).toFixed(1)} · p10 ${q(0.1).toFixed(1)} · p90 ${q(0.9).toFixed(1)} · under ${((all.filter((v) => v < -2).length / Math.max(1, all.length)) * 100).toFixed(0)}% · floating ${((all.filter((v) => v > 2).length / Math.max(1, all.length)) * 100).toFixed(0)}%`);
} finally {
  await browser.close();
}
console.log(failed ? 'FAIL' : 'PASS');
process.exit(failed ? 1 : 0);
