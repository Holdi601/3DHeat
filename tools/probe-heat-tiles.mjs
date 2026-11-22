/**
 * Heat drawn from a tile pyramid (Stage 6) in the real engine, frames timed.
 *
 * Builds nothing itself: point it at a pyramid the core built
 * (`heat3d-tiles <files> --cache <dir>`, one folder per key with meta.json and
 * tiles.bin). The page gets a tile transport that reads that folder through
 * the probe (as a session member reads the host's through `/v1`), draws the
 * heat from tiles only (no rows loaded), then orbits and zooms the camera and
 * reports: time to the first tile and to a settled view, bytes and tiles
 * fetched, frame times p50/p99/max, and a screenshot.
 *
 *   node tools/probe-heat-tiles.mjs --cache <dir> [--key <key>] [--backend webgl2|webgpu]
 *        [--url http://127.0.0.1:5291/] [--seconds 8] [--shot out.png]
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const cache = arg('cache');
if (!cache) throw new Error('--cache <dir>');
const key = arg('key', readdirSync(cache).find((d) => !d.startsWith('.')));
const backend = arg('backend', 'webgl2');
const url = arg('url', `http://127.0.0.1:5291/?backend=${backend}`);
const seconds = Number(arg('seconds', '8'));
const shot = arg('shot', null);

const meta = JSON.parse(readFileSync(join(cache, key, 'meta.json'), 'utf8'));
const pack = readFileSync(join(cache, key, 'tiles.bin'));

const browser = await chromium.launch(
  backend === 'webgpu'
    ? { channel: 'chromium', args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist'] }
    : { args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] },
);
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  // The host's side: tiles by id from the pack, as `ReadHeatTiles` answers.
  await page.exposeFunction('__tileRead', (ids) => {
    const out = [];
    for (const id of ids) {
      const big = BigInt(id);
      const l = Number(big >> 56n);
      const y = Number((big >> 28n) & 0x0fffffffn);
      const x = Number(big & 0x0fffffffn);
      const at = l <= meta.leaf_level ? meta.index[l]?.[String(y * (1 << l) + x)] : undefined;
      out.push(at ? pack.subarray(at[0], at[0] + at[1]).toString('base64') : null);
    }
    return out;
  });
  await page.goto(url);
  await page.waitForFunction(() => globalThis.__3dheat_engine, null, { timeout: 120_000 });
  const info = {
    key: meta.key,
    x0: meta.x0,
    y0: meta.y0,
    size: meta.size,
    leafLevel: meta.leaf_level,
    complete: true,
    estimateLevels: 0,
    levelMax: meta.level_max,
    rowsCounted: meta.rows_counted,
    fraction: 1,
    how: meta.how,
    error: '',
  };
  const r = await page.evaluate(
    async ({ info, seconds }) => {
      const { HeatTileSource } = await import('/src/render/heatTiles/source.ts');
      const eng = globalThis.__3dheat_engine;
      const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
      const transport = {
        query: async () => info,
        read: async (_key, ids) => {
          const got = await globalThis.__tileRead(ids.map(String));
          const batch = { tiles: [], empty: [], pending: [], deferred: [] };
          ids.forEach((id, i) => (got[i] ? batch.tiles.push({ id, bytes: b64(got[i]), estimate: false }) : batch.empty.push(id)));
          return batch;
        },
      };
      const src = new HeatTileSource(transport, { sx: 1, sz: 1, ground: 0 }, {}, () => eng.invalidate(1));
      const cx = info.x0 + info.size / 2;
      const cz = info.y0 + info.size / 2;
      eng.frameAround(cx, 0, cz, info.size / 2);
      const t0 = performance.now();
      eng.setHeatTiles(src);
      src.start();
      // Until the first view settles: nothing more asked for a while.
      let lastBytes = -1;
      let still = 0;
      while (still < 20 && performance.now() - t0 < 30_000) {
        await new Promise((r) => requestAnimationFrame(r));
        if (src.stats.bytes === lastBytes) still++;
        else still = 0;
        lastBytes = src.stats.bytes;
      }
      const settled = performance.now() - t0 - 20 * 16.7;
      // Exposure from the drawn field, as after a load (a read-back, off the frame path).
      await new Promise((r) => setTimeout(r, 500));
      const exposure = globalThis.__3dheat?.useStore?.getState?.().heat?.saturation ?? null;
      const firstView = { firstTileMs: src.stats.firstTileMs, settledMs: settled, bytes: src.stats.bytes, tiles: src.stats.tiles, saturation: exposure };
      // Orbit and dolly in: the LOD rings change, tiles stream in.
      const dts = [];
      let last = performance.now();
      const until = last + seconds * 1000;
      for (let k = 0; performance.now() < until; k++) {
        eng.camera.setOrientationDegrees(eng.camera.yawDegrees + 0.4, Math.max(-80, Math.min(-15, eng.camera.pitchDegrees + Math.sin(k / 60) * 0.3)));
        if (k % 2 === 0) eng.frameAround(cx + Math.sin(k / 200) * info.size * 0.2, 0, cz, info.size * (0.5 - 0.4 * Math.min(1, k / 400)));
        await new Promise((r) => requestAnimationFrame(r));
        const now = performance.now();
        dts.push(now - last);
        last = now;
      }
      const s = dts.slice(30).sort((a, b) => a - b);
      const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
      return {
        firstView,
        motion: { frames: s.length, p50: q(0.5), p99: q(0.99), max: s[s.length - 1], over25: s.filter((v) => v > 25).length },
        after: { bytes: src.stats.bytes, tiles: src.stats.tiles, requests: src.stats.requests, cached: src.cachedTiles() },
        renderer: eng.rendererInfo?.()?.gpuName ?? null,
      };
    },
    { info, seconds },
  );
  if (shot) await page.screenshot({ path: shot });
  if (shot) {
    // And close up, after the motion: fine tiles near the eye.
    await page.evaluate(() => {
      const eng = globalThis.__3dheat_engine;
      eng.camera.setOrientationDegrees(30, -35);
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: shot.replace(/\.png$/, '-near.png') });
  }
  console.log(JSON.stringify({ backend, key: meta.key, rows: meta.rows_counted, leaf: meta.leaf_level, pyramidBytes: meta.bytes, ...r }, null, 1));
} finally {
  await browser.close();
}
