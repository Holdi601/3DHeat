/**
 * A big level, tiled and streamed (src/world/terrainStream.ts) against the
 * same map as one mesh: a recording (local, never committed) loaded through
 * the app in Edge on this machine's graphics card, its level picked by itself
 * from the levels folder the dev server serves, then the camera flown over it.
 *
 * Says, per run: how long until the level is set and until its ground is drawn
 * (the terrain's first nodes; the mesh's upload finished), the page's JS heap,
 * the browser's RAM (private bytes of all its processes) and GPU memory (the
 * processes' dedicated GPU memory, from Windows' GPU counters), what the
 * renderer holds for the level, and the frame intervals' p50 / p99 / max while
 * the camera flies a fixed path: an overview turning, a descent, a low pass
 * across the map at 300 m/s, a hover over the middle.
 *
 *   node tools/probe-terrain.mjs --data=<recording> [--url=http://127.0.0.1:5303/] [--mesh] [--figures] [--shot=<dir>] [--quick]
 *
 * `--mesh` hides the tiled terrain from the levels folder's index, so the
 * level's glb is loaded as before. `--figures` plays the recording with its
 * figures during the flight. Windows only for the memory counters.
 */

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
const DATA = opt('data');
const base = opt('url') ?? 'http://127.0.0.1:5303/';
const MESH = argv.includes('--mesh');
const FIGURES = argv.includes('--figures');
const SHOT = opt('shot');
/** Only the load and the screenshots: a look, no flight. */
const QUICK = argv.includes('--quick');
if (!DATA) {
  console.log('give --data=<a recording>');
  process.exit(2);
}
const body = readFileSync(DATA);
const name = path.basename(DATA);

/** RAM (private bytes) and dedicated GPU memory of a process tree, MB. */
function memoryOf(rootPid) {
  if (process.platform !== 'win32' || !rootPid) return null;
  const ps = `
$all = Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, PrivatePageCount
$want = @(${rootPid}); $grew = $true
while ($grew) { $grew = $false; foreach ($p in $all) { if ($want -contains $p.ParentProcessId -and -not ($want -contains $p.ProcessId)) { $want += $p.ProcessId; $grew = $true } } }
$ram = ($all | Where-Object { $want -contains $_.ProcessId } | Measure-Object PrivatePageCount -Sum).Sum
$gpu = 0
try { $c = (Get-Counter '\\GPU Process Memory(*)\\Dedicated Usage' -ErrorAction Stop).CounterSamples
  foreach ($s in $c) { if ($s.InstanceName -match 'pid_(\\d+)_' -and ($want -contains [int]$Matches[1])) { $gpu += $s.CookedValue } } } catch {}
"$ram $gpu"`;
  try {
    const [ram, gpu] = execFileSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' }).trim().split(/\s+/).map(Number);
    return { ramMB: Math.round(ram / 2 ** 20), gpuMB: Math.round(gpu / 2 ** 20) };
  } catch {
    return null;
  }
}

const browser = await chromium.launch({ channel: 'msedge', headless: false, args: ['--enable-unsafe-webgpu', '--enable-precise-memory-info'] });
const rootPid = browser.process?.()?.pid ?? null;
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.routeWebSocket(/./, () => {});
await page.route(`**/__terrainprobe/${name}`, (r) => r.fulfill({ body, contentType: 'application/octet-stream' }));
if (MESH) {
  // The index without its tiled terrains: each level loads its glb.
  await page.route('**/__heat3d/catalog', async (r) => {
    const res = await r.fetch();
    const ix = await res.json();
    ix.items = ix.items.filter((i) => i.kind !== 'terrain').map(({ terrain, ...i }) => i);
    await r.fulfill({ response: res, json: ix });
  });
}
await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 180_000 });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine && globalThis.__3dheat), null, { timeout: 180_000 });
await page.waitForTimeout(2000);
const before = memoryOf(rootPid);

const load = await page.evaluate(async (file) => {
  const h = globalThis.__3dheat;
  const eng = globalThis.__3dheat_engine;
  const t0 = performance.now();
  await h.loadUrls([`/__terrainprobe/${file}`]);
  const tData = performance.now() - t0;
  let tLevel = null;
  let tGround = null;
  let lastBytes = -1;
  let stableSince = 0;
  // Until the level is set and its ground drawn: the terrain's first nodes, or the mesh's bytes steady for a second.
  for (let i = 0; i < 6000; i++) {
    await new Promise((r) => requestAnimationFrame(r));
    const lv = h.useStore.getState().level;
    if (lv && tLevel === null) tLevel = performance.now() - t0;
    if (!lv) continue;
    if (lv.terrain) {
      if (lv.terrain.stats.firstDraw) {
        tGround = performance.now() - t0;
        break;
      }
    } else {
      const b = eng.live.levelBytes;
      if (b > 0 && b === lastBytes) {
        if (performance.now() - stableSince > 1000) {
          tGround = stableSince - t0;
          break;
        }
      } else {
        lastBytes = b;
        stableSince = performance.now();
      }
    }
    if (performance.now() - t0 > 240_000) break;
  }
  const lv = h.useStore.getState().level;
  return { tData, tLevel, tGround, level: lv?.name ?? null, terrain: !!lv?.terrain, rows: h.useStore.getState().dataset?.count ?? 0 };
}, name);
console.log(`${MESH ? 'mesh   ' : 'tiled  '} level ${load.level} (${load.terrain ? 'tiled terrain' : 'one mesh'}), ${load.rows.toLocaleString()} rows`);
console.log(`  data loaded ${(load.tData / 1000).toFixed(1)} s, level set ${(load.tLevel / 1000).toFixed(1)} s, ground drawn ${load.tGround === null ? '-' : (load.tGround / 1000).toFixed(1)} s (from the load's start)`);

const fly = QUICK ? null : await page.evaluate(async (figures) => {
  const h = globalThis.__3dheat;
  const eng = globalThis.__3dheat_engine;
  const st = h.useStore.getState();
  const lv = st.level;
  const b = lv.bounds;
  const cx = (b.minX + b.maxX) / 2;
  const cz = (b.minZ + b.maxZ) / 2;
  const w = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
  if (figures) {
    st.setMode('team');
    st.patchTeam({ figures: true, trailSeconds: 0 });
    const d = st.dataset;
    st.seek(d.timeRange[0] + (d.timeRange[1] - d.timeRange[0]) * 0.4);
    st.patchTimeline({ mode: 'play', window: 'cumulative', playing: true, speed: 4 });
  }
  const c = eng.camera;
  const set = (x, y, z, yaw, pitch) => {
    c.position.set(x, y, z);
    c.setOrientationDegrees(yaw, pitch);
    c.moved = true;
  };
  const phases = [];
  const run = async (label, n, at) => {
    const gaps = [];
    let last = performance.now();
    for (let i = 0; i < n; i++) {
      at(i / n);
      await new Promise((r) => requestAnimationFrame(r));
      const now = performance.now();
      gaps.push(now - last);
      last = now;
    }
    phases.push({ label, gaps: gaps.slice(2) });
  };
  // Settle at the overview first, then fly.
  set(cx, w * 0.45, cz + w * 0.45, 0, -45);
  await new Promise((r) => setTimeout(r, 3000));
  await run('overview turning', 600, (f) => {
    const a = f * Math.PI * 2;
    set(cx + Math.sin(a) * w * 0.45, w * 0.35, cz + Math.cos(a) * w * 0.45, (a * 180) / Math.PI, -40);
  });
  await run('descent', 300, (f) => set(cx - w * 0.3, w * 0.35 * (1 - f) + 250 * f, cz + w * 0.3 * (1 - f), -45, -40 + 30 * f));
  await run('low pass 300 m/s', 1500, (f) => {
    const x = cx - w * 0.3 + f * 1500 * 5 * 0.8;
    const z = cz - f * 1500 * 5 * 0.6;
    set(x, 250, z, 53 + Math.sin(f * 12) * 30, -12);
  });
  await run('hover', 600, (f) => set(cx, 400, cz, f * 360, -20));
  const stats = (g) => {
    const s = [...g].sort((a, b) => a - b);
    return { p50: s[s.length >> 1], p99: s[Math.floor(s.length * 0.99)], max: s[s.length - 1], over20: g.filter((x) => x > 20).length, n: g.length };
  };
  const all = phases.flatMap((p) => p.gaps);
  const t = lv.terrain;
  return {
    phases: phases.map((p) => ({ label: p.label, ...stats(p.gaps) })),
    all: stats(all),
    heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 2 ** 20) : null,
    levelMB: Math.round(eng.live.levelBytes / 2 ** 20),
    terrain: t ? { ...t.counts, ...t.stats } : null,
    backend: eng.backendName ?? null,
  };
}, FIGURES);
const after = memoryOf(rootPid);
if (fly) report(fly);
function report(fly) {
const f = (s) => `p50 ${s.p50.toFixed(1)} / p99 ${s.p99.toFixed(1)} / max ${s.max.toFixed(1)} ms, ${s.over20} of ${s.n} over 20 ms`;
for (const p of fly.phases) console.log(`  ${p.label.padEnd(18)} ${f(p)}`);
console.log(`  ${'all'.padEnd(18)} ${f(fly.all)}`);
console.log(`  JS heap ${fly.heapMB} MB; level on the GPU (renderer's count) ${fly.levelMB} MB`);
if (before && after) console.log(`  browser RAM ${before.ramMB} -> ${after.ramMB} MB, dedicated GPU memory ${before.gpuMB} -> ${after.gpuMB} MB`);
if (fly.terrain) {
  const t = fly.terrain;
  console.log(`  tiles: ${t.fetched} fetched (${(t.bytes / 2 ** 20).toFixed(1)} MB), ${t.gpu} on the GPU, ${t.cpu} on the CPU (${(t.cpuBytes / 2 ** 20).toFixed(1)} MB), ${t.uploads} uploads, ${t.evicted} evicted; objects ${t.boxes.toLocaleString()} boxes in ${t.objectCells} cells; first nodes ${(t.firstDraw / 1000).toFixed(2)} s after the level`);
}
}
if (SHOT) {
  mkdirSync(SHOT, { recursive: true });
  // The same views each run: the whole map, a town-sized patch from 600 m, the ground from 60 m.
  const views = [['overview', 0.5, 0.5, 0.45, 0, -45], ['low', 0.5, 0.5, 600, -45, -20], ['ground', 0.42, 0.55, 60, 30, -8]];
  for (const [label, fx, fz, hy, yaw, pitch] of views) {
    await page.evaluate(([fx, fz, hy, yaw, pitch]) => {
      const eng = globalThis.__3dheat_engine;
      const lv = globalThis.__3dheat.useStore.getState().level;
      const b = lv.bounds;
      const x = b.minX + (b.maxX - b.minX) * fx;
      const z = b.minZ + (b.maxZ - b.minZ) * fz;
      const w = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
      const ground = lv.terrain ? lv.terrain.heightAt(x, z) : 0;
      const y = hy < 1 ? w * hy : (Number.isNaN(ground) ? 0 : Math.max(0, ground)) + hy;
      eng.camera.position.set(x, y, z + (hy < 1 ? w * hy : 0));
      eng.camera.setOrientationDegrees(yaw, pitch);
      eng.camera.moved = true;
    }, [fx, fz, hy, yaw, pitch]);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(SHOT, `${MESH ? 'mesh' : 'tiled'}-${label}.png`) });
  }
}
await browser.close();
