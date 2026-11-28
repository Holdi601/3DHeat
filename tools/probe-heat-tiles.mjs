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
 *
 *   node tools/probe-heat-tiles.mjs --parity [--rows 2] [--backend webgpu|webgl2] [--only <name>]
 *       Rows against tiles of the same rows: synthetic rows loaded, a pyramid
 *       binned from them in the page, one channel per group (served in the
 *       core's tile format, zstd raw blocks, decoded by the app's worker), and the heat field
 *       read with the rows alone and with the tiles added (tiles = the
 *       difference), top-down at three zooms, per heat setting and mode (heat,
 *       team colours, difference, a hidden group). Compared as in
 *       probe-heat-binning: p50/p90/p99 of the lit texels, the total and SSIM
 *       of the field as the ramp shows it; exits 1 past the gates.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
if (process.argv.includes('--parity')) {
  await parity();
  process.exit(process.exitCode ?? 0);
}

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
  // The host's side: tiles by id from the pack, as `ReadHeatTiles` answers, as
  // binary (u32 count, then u32 length + bytes per tile; length 0 = empty).
  await page.route('**/__heat3d_tiles', (route) => {
    const ids = JSON.parse(route.request().postData() ?? '[]');
    const parts = [Buffer.alloc(4)];
    parts[0].writeUInt32LE(ids.length);
    for (const id of ids) {
      const big = BigInt(id);
      const l = Number(big >> 56n);
      const y = Number((big >> 28n) & 0x0fffffffn);
      const x = Number(big & 0x0fffffffn);
      const at = l <= meta.leaf_level ? meta.index[l]?.[String(y * (1 << l) + x)] : undefined;
      const len = Buffer.alloc(4);
      len.writeUInt32LE(at ? at[1] : 0);
      parts.push(len);
      if (at) parts.push(pack.subarray(at[0], at[0] + at[1]));
    }
    return route.fulfill({ status: 200, contentType: 'application/octet-stream', body: Buffer.concat(parts) });
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
      // As the app starts it (render/heatTiles/tileHeat.ts): status line, start screen down, camera framed.
      const { startTileHeat } = await import('/src/render/heatTiles/tileHeat.ts');
      const eng = globalThis.__3dheat_engine;
      const transport = {
        query: async () => info,
        read: async (_key, ids) => {
          const res = await fetch('/__heat3d_tiles', { method: 'POST', body: JSON.stringify(ids.map(String)) });
          const buf = await res.arrayBuffer();
          const dv = new DataView(buf);
          const batch = { tiles: [], empty: [], pending: [], deferred: [] };
          let at = 4;
          for (const id of ids) {
            const n = dv.getUint32(at, true);
            at += 4;
            if (n === 0) batch.empty.push(id);
            else batch.tiles.push({ id, bytes: new Uint8Array(buf, at, n), estimate: false });
            at += n;
          }
          return batch;
        },
      };
      const cx = info.x0 + info.size / 2;
      const cz = info.y0 + info.size / 2;
      eng.frameAround(cx, 0, cz, info.size / 2);
      const t0 = performance.now();
      const src = startTileHeat(eng, transport, { sx: 1, sz: 1, ground: 0 }, 'files');
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

// ---------------------------------------------------------------- parity

function quantile(sorted, q) {
  return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : 0;
}

/** Mean SSIM over 8x8 windows (stride 4) holding heat, of `v / (v + k)` (the field as the ramp shows it). */
function ssim(a, b, w, h, k) {
  const map = (v) => Math.abs(v) / (Math.abs(v) + k);
  const C1 = 0.01 ** 2;
  const C2 = 0.03 ** 2;
  let sum = 0;
  let n = 0;
  for (let y = 0; y + 8 <= h; y += 4) {
    for (let x = 0; x + 8 <= w; x += 4) {
      let ma = 0;
      let mb = 0;
      let any = false;
      for (let j = 0; j < 8; j++)
        for (let i = 0; i < 8; i++) {
          const p = (y + j) * w + x + i;
          const va = map(a[p]);
          const vb = map(b[p]);
          if (va > 0 || vb > 0) any = true;
          ma += va;
          mb += vb;
        }
      if (!any) continue;
      ma /= 64;
      mb /= 64;
      let sa = 0;
      let sb = 0;
      let sab = 0;
      for (let j = 0; j < 8; j++)
        for (let i = 0; i < 8; i++) {
          const p = (y + j) * w + x + i;
          const da = map(a[p]) - ma;
          const db = map(b[p]) - mb;
          sa += da * da;
          sb += db * db;
          sab += da * db;
        }
      sum += ((2 * ma * mb + C1) * (2 * (sab / 63) + C2)) / ((ma * ma + mb * mb + C1) * (sa / 63 + sb / 63 + C2));
      n++;
    }
  }
  return n ? sum / n : 1;
}

function compare(a, b, w, h) {
  const lit = [];
  const litB = [];
  let ta = 0;
  let tb = 0;
  for (let i = 0; i < a.length; i++) {
    // Magnitudes: a difference's signed total is near 0 by design.
    ta += Math.abs(a[i]);
    tb += Math.abs(b[i]);
    if (a[i] !== 0) {
      lit.push(Math.abs(a[i]));
      litB.push(Math.abs(b[i]));
    }
  }
  lit.sort((x, y) => x - y);
  litB.sort((x, y) => x - y);
  const rel = (x, y) => (x === 0 && y === 0 ? 0 : Math.abs(y - x) / Math.max(1e-30, Math.abs(x)));
  const q = (p) => ({ ref: quantile(lit, p), got: quantile(litB, p), err: rel(quantile(lit, p), quantile(litB, p)) });
  return { p50: q(0.5), p90: q(0.9), p99: q(0.99), total: rel(ta, tb), ssim: ssim(a, b, w, h, Math.max(1e-30, quantile(lit, 0.9))), lit: lit.length };
}

async function parity() {
  const PARITY_CASES = [
    { name: 'heat', heat: {} },
    { name: 'radius 30', heat: { radius: 30 } },
    { name: 'radius 6', heat: { radius: 6 } },
    { name: 'hard disc, linear', heat: { edgeIntensity: 0.4, falloff: 1, smoothRamp: false } },
    { name: 'min clamp 4 px', heat: { radius: 1, minPixelRadius: 4 } },
    { name: 'not zoom invariant', heat: { radius: 1, minPixelRadius: 4, zoomInvariant: false } },
    { name: 'team colours', heat: {}, mode: 'heat-teams' },
    // Signed: where the sides nearly cancel, a row's place in its cell moves the small rest (10% on the quantiles).
    { name: 'difference', heat: {}, mode: 'heat-difference', split: [[0, 1, 2, 3], [4, 5, 6, 7]], tol: 0.1 },
    { name: 'difference, one side', heat: {}, mode: 'heat-difference', split: [[0, 1, 2, 3, 4, 5, 6, 7], []] },
    { name: 'a group hidden', heat: {}, hide: 2 },
    // The ramp's custom curve (a ring: hollow centre), drawn by the tile kernel as by the splat.
    { name: 'curve ring', heat: {}, curve: 'Ring' },
    // The last group in the pyramid's other channel: on neither side of the difference, as its rows.
    { name: 'other channel, difference', heat: {}, mode: 'heat-difference', split: [[0, 1, 2, 3], [4, 5, 6]], other: true, tol: 0.1 },
  ];
  /** Fractions of the data's half-width the view spans: all of it, a quarter, a sixteenth. */
  const ZOOMS = [1, 0.25, 0.0625];
  const backend = arg('backend', 'webgpu');
  const rows = Number(arg('rows', 2)) * 1e6;
  const only = arg('only', null);
  const url = arg('url', `http://127.0.0.1:5291/?backend=${backend}`);
  const browser = await chromium.launch({
    channel: 'chromium',
    headless: true,
    args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11'],
  });
  let failed = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
    await page.routeWebSocket(/./, () => {});
    page.on('pageerror', (e) => console.log('pageerror:', e.message));
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180_000 });
    await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none'), null, { timeout: 120_000 });
    await page.evaluate(async (rows) => {
      const H = globalThis.__3dheat;
      const st = H.useStore.getState();
      const ds = H.generateSynthetic({ ...H.DEFAULT_SYNTH, rows });
      st.setDataset(ds);
      const live = globalThis.__3dheat_engine.live;
      while (live.residentRows + live.droppedRows < ds.count) await new Promise((r) => requestAnimationFrame(r));
      st.patchBudget({ adaptive: false, exact: true, heatScale: 1 });
      st.patchCamera({ projection: 'orthographic' });
      // The pyramid of the same rows (world X / Z), one channel per group, leaf level 4: 4096 cells across.
      const leaf = 4;
      const groups = ds.teamLabels.length;
      let x0 = Infinity;
      let z0 = Infinity;
      let x1 = -Infinity;
      let z1 = -Infinity;
      for (let i = 0; i < ds.count; i++) {
        x0 = Math.min(x0, ds.px[i]);
        x1 = Math.max(x1, ds.px[i]);
        z0 = Math.min(z0, ds.pz[i]);
        z1 = Math.max(z1, ds.pz[i]);
      }
      const size = Math.max(x1 - x0, z1 - z0) * 1.001;
      // Cell counts per level, the channels of a cell side by side: level -> { n, g (n * n * groups) }.
      const levels = [];
      let n = 256 << leaf;
      let g = new Uint32Array(n * n * groups);
      for (let i = 0; i < ds.count; i++) {
        const cx = Math.min(n - 1, Math.floor(((ds.px[i] - x0) / size) * n));
        const cz = Math.min(n - 1, Math.floor(((ds.pz[i] - z0) / size) * n));
        g[(cz * n + cx) * groups + (ds.teamId ? ds.teamId[i] : 0)]++;
      }
      levels[leaf] = { n, g };
      for (let l = leaf - 1; l >= 0; l--) {
        const up = levels[l + 1];
        n = up.n / 2;
        g = new Uint32Array(n * n * groups);
        const r = up.n * groups;
        for (let y = 0; y < n; y++)
          for (let x = 0; x < n; x++)
            for (let c = 0; c < groups; c++) {
              const a = (2 * y * up.n + 2 * x) * groups + c;
              g[(y * n + x) * groups + c] = up.g[a] + up.g[a + groups] + up.g[a + r] + up.g[a + r + groups];
            }
        levels[l] = { n, g };
      }
      const info = { key: 'parity', x0, y0: z0, size, leafLevel: leaf, complete: true, estimateLevels: 0, levelMax: [], rowsCounted: ds.count, fraction: 1, how: 'probe', error: '', channelNames: ds.teamLabels.slice() };
      // A tile as the core writes it (native/crates/core/src/tiles.rs): the 32-byte header, then a zstd
      // frame of u32 cells channel after channel - raw blocks, so the page needs no compressor.
      const tileBytes = (l, tx, ty) => {
        const { n: ln, g: lg } = levels[l];
        const raw = new Uint32Array(256 * 256 * groups);
        let max = 0;
        for (let y = 0; y < 256; y++)
          for (let x = 0; x < 256; x++)
            for (let c = 0; c < groups; c++) {
              const v = lg[((ty * 256 + y) * ln + tx * 256 + x) * groups + c];
              raw[c * 65536 + y * 256 + x] = v;
              if (v > max) max = v;
            }
        if (max === 0) return null;
        const body = new Uint8Array(raw.buffer);
        const blocks = Math.ceil(body.length / 131072);
        const out = new Uint8Array(32 + 13 + blocks * 3 + body.length);
        const dv = new DataView(out.buffer);
        out.set([0x48, 0x33, 0x44, 0x54, 1, 4, groups, 0, l]);
        dv.setUint32(12, tx, true);
        dv.setUint32(16, ty, true);
        dv.setUint32(20, max, true);
        dv.setUint32(24, body.length, true);
        let at = 32;
        dv.setUint32(at, 0xfd2fb528, true);
        out[at + 4] = 0xe0;
        dv.setBigUint64(at + 5, BigInt(body.length), true);
        at += 13;
        for (let k = 0; k < blocks; k++) {
          const part = body.subarray(k * 131072, Math.min(body.length, (k + 1) * 131072));
          const head = (part.length << 3) | (k === blocks - 1 ? 1 : 0);
          out.set([head & 0xff, (head >> 8) & 0xff, (head >> 16) & 0xff], at);
          out.set(part, at + 3);
          at += 3 + part.length;
        }
        return out;
      };
      const transport = {
        query: async () => info,
        read: async (_key, ids) => {
          const batch = { tiles: [], empty: [], pending: [], deferred: [] };
          for (const id of ids) {
            const bytes = tileBytes(Number(id >> 56n), Number(id & 0x0fffffffn), Number((id >> 28n) & 0x0fffffffn));
            if (bytes) batch.tiles.push({ id, bytes, estimate: false });
            else batch.empty.push(id);
          }
          return batch;
        },
      };
      const { HeatTileSource } = await import('/src/render/heatTiles/source.ts');
      globalThis.__parity = { info, transport, HeatTileSource, centre: [x0 + size / 2, z0 + size / 2], half: size / 2 };
    }, rows);
    if (process.argv.includes('--switch')) {
      if (await switchProbe(page)) process.exitCode = 1;
      return;
    }
    console.log(`parity: ${rows} synthetic rows, ${backend}`);
    for (const c of PARITY_CASES.filter((c) => !only || c.name.includes(only))) {
      for (const zoom of ZOOMS) {
        const r = await page.evaluate(
          async ({ heat, zoom, mode, split, hide, curve, other }) => {
            const H = globalThis.__3dheat;
            const eng = globalThis.__3dheat_engine;
            const st = H.useStore.getState();
            const P = globalThis.__parity;
            const raf = () => new Promise((r) => requestAnimationFrame(r));
            const base = JSON.parse(JSON.stringify(st.heat));
            st.patchHeat(heat);
            if (curve) st.patchHeat({ useCurve: true, curve: (await import('/src/state/curve.ts')).CURVE_PRESETS[curve] });
            if (mode) st.setMode(mode);
            if (split) st.setTeamSplit(...split);
            if (hide !== undefined) st.toggleTeam(hide, false);
            eng.camera.setOrientationDegrees(0, -89.9);
            eng.frameAround(P.centre[0], 0, P.centre[1], P.half * zoom);
            const field = async () => {
              for (let i = 0; i < 6; i++) {
                eng.camera.moved = true;
                eng.invalidate(2);
                await raf();
              }
              for (let i = 0; i < 20; i++) await raf();
              return { f: await eng.renderer.readHeatField(eng.live.backend === 'webgl2' ? 1e9 : 0, true), w: eng.renderer.heatWidth, h: eng.renderer.heatHeight };
            };
            const rowsOnly = await field();
            // The other channel: the last group unnamed, flagged as the core flags it.
            const info = other ? { ...P.info, channelNames: [...P.info.channelNames.slice(0, -1), ''], otherChannel: true } : P.info;
            const src = new P.HeatTileSource({ ...P.transport, query: async () => info }, { sx: 1, sz: 1, ground: 0 }, {}, () => eng.invalidate(1));
            eng.setHeatTiles(src);
            src.start();
            // Until every tile the view wants is in and uploaded.
            let last = -1;
            let still = 0;
            for (let k = 0; k < 600 && still < 15; k++) {
              await raf();
              still = src.stats.tiles === last ? still + 1 : 0;
              last = src.stats.tiles;
            }
            const both = await field();
            eng.setHeatTiles(null);
            src.dispose();
            const level = src.stats.drawnLevel;
            const cells = src.stats.radiusCells;
            st.patchHeat(base);
            if (mode) st.setMode('heat');
            if (hide !== undefined) st.toggleTeam(hide, true);
            const tiles = new Float32Array(both.f.length);
            for (let i = 0; i < tiles.length; i++) tiles[i] = both.f[i] - rowsOnly.f[i];
            return { rows: Array.from(rowsOnly.f), tiles: Array.from(tiles), w: rowsOnly.w, h: rowsOnly.h, level, cells };
          },
          { heat: c.heat, zoom, mode: c.mode, split: c.split, hide: c.hide, curve: c.curve, other: c.other },
        );
        // Every channel the target holds (team colours: heat, a, b, L); judged by the worst.
        const ch = r.rows.length / (r.w * r.h);
        let m = null;
        for (let k = 0; k < ch; k++) {
          const pick = (f) => Float32Array.from({ length: r.w * r.h }, (_, i) => f[i * ch + k]);
          const mk = compare(pick(r.rows), pick(r.tiles), r.w, r.h);
          if (mk.lit > 0 && (!m || mk.ssim < m.ssim)) m = mk;
        }
        m ??= compare(r.rows, r.tiles, r.w, r.h);
        const f = (v) => (v * 100).toFixed(1) + '%';
        // Judged where the LOD could refine to the sprite (2-4 cells a radius, heatTiles/lod.ts KERNEL_CELLS):
        // coarser (past the leaf), the rows show detail the counts no longer hold - the view switches to rows there.
        // SSIM stays under 1 where single sprites show: a row's place inside its cell is gone.
        const judged = r.cells >= 2;
        const bad = judged && (m.lit === 0 || m.p50.err > (c.tol ?? 0.05) || m.p90.err > (c.tol ?? 0.05) || m.p99.err > (c.tol ?? 0.05) || m.total > 0.05 || m.ssim < 0.92);
        if (bad) failed++;
        console.log(`  ${bad ? 'FAIL' : judged ? 'ok  ' : 'info'} ${c.name}, zoom 1/${1 / zoom} (level ${r.level}, ${r.cells.toFixed(1)} cells a radius): p50 ${f(m.p50.err)} p90 ${f(m.p90.err)} p99 ${f(m.p99.err)} total ${f(m.total)} ssim ${m.ssim.toFixed(4)} (${m.lit} texels)`);
      }
    }
  } finally {
    await browser.close();
  }
  if (failed) {
    console.log(`${failed} parity check(s) failed`);
    process.exitCode = 1;
  }
}

/**
 * `--parity --switch`: the switch from tiles to rows and back (rowWindow.ts)
 * on the parity page. The synthetic rows go into a CSV the app's loader reads
 * as a pick would be read; zoomed in past the leaf the window loads the rows
 * of the ground in view and fades them in. Checks: the field after the switch
 * equals the rows' own (they draw the whole view), the exposure and camera did
 * not move, frames during the load and the fade (p99, max, over 25 ms), and
 * zoomed out again the tiles draw alone and the rows are let go.
 */
async function switchProbe(page) {
  // The synthetic load's sprite spans about 8 leaf cells, where the tiles hold its detail and no
  // switch is wanted (the LOD stops 2-4 cells a radius). --switch-radius: a smaller sprite, as a
  // person sets it, under 2 leaf cells: what the rows are for.
  const spriteScale = Number(arg('switch-radius', '0.2'));
  const r = await page.evaluate(async (spriteScale) => {
    const H = globalThis.__3dheat;
    const eng = globalThis.__3dheat_engine;
    const P = globalThis.__parity;
    const st = () => H.useStore.getState();
    const raf = () => new Promise((res) => requestAnimationFrame(res));
    const ds = st().dataset;
    const radius0 = st().heat.radius;
    // On the ground as the tiles are: zoomed in this far the top-down camera sits a few units
    // over the ground, under the synthetic rows' heights.
    const heights = ds.py.slice();
    ds.py.fill(0);
    st().patchHeat({ radius: radius0 * spriteScale });
    const field = async () => {
      for (let i = 0; i < 6; i++) {
        eng.camera.moved = true;
        eng.invalidate(2);
        await raf();
      }
      for (let i = 0; i < 20; i++) await raf();
      return Array.from(await eng.renderer.readHeatField(eng.live.backend === 'webgl2' ? 1e9 : 0, true));
    };
    // The rows as a CSV pick: x and y the ground (up z), z the height, the group's label.
    const parts = ['x,y,z,team\n'];
    for (let i = 0; i < ds.count; i += 100_000) {
      let s = '';
      for (let k = i; k < Math.min(ds.count, i + 100_000); k++) s += `${ds.px[k]},${ds.pz[k]},${ds.py[k]},${ds.teamLabels[ds.teamId[k]]}\n`;
      parts.push(s);
    }
    const file = new File(parts, 'switch.csv', { type: 'text/csv' });
    eng.camera.setOrientationDegrees(0, -89.9);
    const settle = async (src) => {
      let last = -1;
      let still = 0;
      for (let k = 0; k < 600 && still < 15; k++) {
        await raf();
        still = src.info?.complete && src.stats.tiles > 0 && src.stats.tiles === last ? still + 1 : 0;
        last = src.stats.tiles;
      }
    };
    const tiles = async () => {
      const src = new P.HeatTileSource(P.transport, { sx: 1, sz: 1, ground: 0 }, {}, () => eng.invalidate(1));
      eng.setHeatTiles(src);
      src.start();
      await settle(src);
      return src;
    };
    // Zoomed in from a sixteenth of the half-width until past the leaf (under 2 cells a
    // radius): where the sprite's pixel clamp widens it, the leaf is passed further in.
    let zoom = 0.0625;
    const tries = [];
    st().setDataset(null);
    await raf();
    for (let k = 0; k < 10; k++) {
      eng.frameAround(P.centre[0], 0, P.centre[1], P.half * zoom);
      const probe = await tiles();
      const cells = probe.stats.radiusCells;
      tries.push(`1/${Math.round(1 / zoom)}: ${cells.toFixed(2)} cells at level ${probe.stats.drawnLevel} of ${probe.info?.leafLevel} (radius ${st().heat.radius.toFixed(3)}, px/unit ${(eng.projArr[5] * eng.renderer.heatHeight * 0.5).toFixed(3)})`);
      eng.setHeatTiles(null);
      probe.dispose();
      if (cells < 2) break;
      zoom /= 2;
    }
    // The camera's zoom limits follow the store's dataset: framed again after each change.
    const frame = () => eng.frameAround(P.centre[0], 0, P.centre[1], P.half * zoom);
    st().setDataset(ds, { keepView: true });
    while (eng.live.residentRows + eng.live.droppedRows < ds.count) await raf();
    frame();
    const rowsOnly = await field();
    st().setDataset(null);
    await raf();
    frame();
    const src = await tiles();
    const tilesOnly = await field();
    const cellsBefore = src.stats.radiusCells;
    const saturation = st().heat.saturation;
    const radius = st().heat.radius;
    const camBefore = Array.from(eng.camPos);
    const { RowWindow } = await import('/src/render/heatTiles/rowWindow.ts');
    const { loader } = await import('/src/data/loader.ts');
    const { emptyColumnMapping } = await import('/src/state/types.ts');
    const mapping = { ...emptyColumnMapping(), x: 'x', y: 'y', z: 'z', teamId: 'team' };
    const win = new RowWindow(src, { files: [file], mapping, columns: ['x', 'y', 'z', 'team'], x: 'x', y: 'y', maxRows: 8e6 }, {
      ingest: (f, m, c, e) => loader.ingest(f, m, c, 'switch', 1, e),
      dataset: () => st().dataset,
      setDataset: (d) => st().setDataset(d, { keepView: true }),
    });
    // Frames from here until the fade is over, the view kept still (the engine draws while loading and fading).
    const frames = [];
    let prev = performance.now();
    let going = true;
    const loop = (t) => {
      frames.push(t - prev);
      prev = t;
      eng.invalidate(1);
      if (going) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    const t0 = performance.now();
    let loadedAt = 0;
    while (performance.now() - t0 < 90_000) {
      win.tick();
      if (win.state === 'rows' && !loadedAt) loadedAt = performance.now();
      if (win.state === 'rows' && src.window?.done) break;
      await new Promise((res) => setTimeout(res, 50));
    }
    going = false;
    const state = win.state;
    const windowRows = win.rows;
    const after = await field();
    const kept = { saturation: st().heat.saturation === saturation, radius: st().heat.radius === radius, camera: Array.from(eng.camPos).every((v, i) => Math.abs(v - camBefore[i]) < 1e-3) };
    // Zoomed out: back to tiles, the rows let go.
    eng.frameAround(P.centre[0], 0, P.centre[1], P.half);
    for (let k = 0; k < 40; k++) {
      await raf();
      win.tick();
      await new Promise((res) => setTimeout(res, 30));
      if (win.state === 'tiles') break;
    }
    const back = { state: win.state, dataset: st().dataset === null, window: src.window === null };
    win.dispose();
    eng.setHeatTiles(null);
    src.dispose();
    ds.py.set(heights);
    st().setDataset(ds);
    st().patchHeat({ radius: radius0 });
    const w = eng.renderer.heatWidth;
    const h = eng.renderer.heatHeight;
    return { rowsOnly, tilesOnly, after, w, h, frames, state, windowRows, loadMs: loadedAt - t0, fadeMs: performance.now() - loadedAt, cellsBefore, kept, back, zoom, tries };
  }, spriteScale);
  const ch = r.rowsOnly.length / (r.w * r.h);
  const pick = (f) => Float32Array.from({ length: r.w * r.h }, (_, i) => f[i * ch]);
  const rowsVsAfter = compare(pick(r.rowsOnly), pick(r.after), r.w, r.h);
  const rowsVsTiles = compare(pick(r.rowsOnly), pick(r.tilesOnly), r.w, r.h);
  const fr = r.frames.slice(2).sort((a, b) => a - b);
  const q = (p) => fr[Math.min(fr.length - 1, Math.floor(p * fr.length))] ?? 0;
  const over = fr.filter((v) => v > 25).length;
  const f = (v) => (v * 100).toFixed(1) + '%';
  console.log(`switch: zoom 1/${Math.round(1 / r.zoom)}, ${r.cellsBefore.toFixed(2)} cells a radius, window ${r.state} with ${r.windowRows} rows, load ${(r.loadMs / 1000).toFixed(2)} s`);
  console.log(`  zooms tried: ${r.tries.join('; ')}`);
  console.log(`  tiles alone vs rows: p50 ${f(rowsVsTiles.p50.err)} p99 ${f(rowsVsTiles.p99.err)} total ${f(rowsVsTiles.total)} ssim ${rowsVsTiles.ssim.toFixed(4)}`);
  console.log(`  after the switch vs rows: p50 ${f(rowsVsAfter.p50.err)} p99 ${f(rowsVsAfter.p99.err)} total ${f(rowsVsAfter.total)} ssim ${rowsVsAfter.ssim.toFixed(4)}`);
  console.log(`  kept: ${JSON.stringify(r.kept)}; back zoomed out: ${JSON.stringify(r.back)}`);
  console.log(`  frames while loading and fading (${fr.length}): p50 ${q(0.5).toFixed(1)} p99 ${q(0.99).toFixed(1)} max ${q(1).toFixed(1)} ms, ${over} over 25 ms`);
  const bad =
    r.state !== 'rows' ||
    rowsVsAfter.ssim < 0.99 ||
    rowsVsAfter.total > 0.01 ||
    !r.kept.saturation ||
    !r.kept.radius ||
    !r.kept.camera ||
    r.back.state !== 'tiles' ||
    !r.back.dataset;
  console.log(bad ? 'switch: FAIL' : 'switch: ok');
  return bad ? 1 : 0;
}
