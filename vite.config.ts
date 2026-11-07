import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { execFile, execFileSync } from 'node:child_process';
import os from 'node:os';

/**
 * The GPU's memory, which no web API will report at any precision.
 *
 * There is no VRAM size API in WebGL or WebGPU — not clamped like
 * `navigator.deviceMemory`, simply absent. The viewer therefore inferred a
 * ceiling from the largest texture a context would admit to, which distinguishes
 * an integrated part from a discrete one and nothing finer, and defaulted to 2GB
 * when even that was unavailable. A 2GB ceiling refuses a 2.32GB load on a card
 * with ten times that.
 *
 * The host can find out properly. `nvidia-smi` is exact where it exists; failing
 * that, Windows keeps a 64-bit figure in the display adapter's registry key.
 * (`Win32_VideoController.AdapterRAM` is deliberately not used: it is a 32-bit
 * field and reports 4095MB for everything larger, which would be a wrong answer
 * dressed as a measured one.)
 *
 * Read once and cached: it cannot change while the server runs, and spawning a
 * process per request would be absurd.
 */
let vramCache: { bytes: number | null; source: string } | undefined;

function detectVram(): { bytes: number | null; source: string } {
  if (vramCache) return vramCache;
  const run = (cmd: string, args: string[]) =>
    execFileSync(cmd, args, { encoding: 'utf8', timeout: 4000, stdio: ['ignore', 'pipe', 'ignore'] });

  // NVIDIA, exact, and it reports every adapter — take the largest.
  try {
    const out = run('nvidia-smi', ['--query-gpu=memory.total', '--format=csv,noheader,nounits']);
    const mib = out
      .split(/\r?\n/)
      .map((l) => Number(l.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (mib.length) {
      vramCache = { bytes: Math.max(...mib) * 1024 * 1024, source: 'nvidia-smi' };
      return vramCache;
    }
  } catch {
    /* not an NVIDIA machine, or the tool is not on PATH */
  }

  // Windows: the adapter's own 64-bit memory size, per adapter subkey.
  if (os.platform() === 'win32') {
    try {
      const out = run('reg', [
        'query',
        'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}',
        '/s',
        '/v',
        'HardwareInformation.qwMemorySize',
      ]);
      const values = [...out.matchAll(/qwMemorySize\s+REG_QWORD\s+0x([0-9a-fA-F]+)/g)]
        .map((m) => Number.parseInt(m[1], 16))
        .filter((n) => Number.isFinite(n) && n > 0);
      if (values.length) {
        vramCache = { bytes: Math.max(...values), source: 'display adapter registry' };
        return vramCache;
      }
    } catch {
      /* no such key, or reg is unavailable */
    }
  }

  vramCache = { bytes: null, source: 'no source available' };
  return vramCache;
}

/** Where the page asks how much memory the machine actually has. */
export const HOST_MEMORY_ROUTE = '/__host/memory';

/**
 * Tell the page the machine's real memory, because the browser will not.
 *
 * `navigator.deviceMemory` is capped at 8GiB by specification to limit
 * fingerprinting, so a 16GB laptop and a 256GB workstation report the identical
 * number and every budget derived from it is sized for the smaller machine. There
 * is no API for *free* memory at all. The result was a viewer that told someone
 * with plenty of RAM that a 62M-row load was "close to the budget" — where the
 * budget was 60% of a privacy cap rather than 60% of their hardware.
 *
 * The process serving the page has none of those restrictions: `os.totalmem` and
 * `os.freemem` are exact. So the number is fetched from here rather than guessed
 * there, and the guess stays as the fallback for when this endpoint is absent —
 * which is any static deployment, since a built bundle has no server behind it.
 *
 * Deliberately the whole of what it exposes. Total and free memory plus the core
 * count is what the budgeting needs, and it is already inferable from the page's
 * own behaviour; anything more would be fingerprinting surface added for
 * convenience. It is bound to the dev and preview servers, which serve one
 * developer's own machine to their own browser.
 */
function hostMemory(): Plugin {
  const handler = (server: ViteDevServer | { middlewares: ViteDevServer['middlewares'] }) => {
    server.middlewares.use(HOST_MEMORY_ROUTE, (_req, res) => {
      const total = os.totalmem();
      const free = os.freemem();
      const vram = detectVram();
      res.setHeader('Content-Type', 'application/json');
      // Never cached: free memory is the point, and a cached figure is worse than
      // no figure because it looks live.
      res.setHeader('Cache-Control', 'no-store');
      res.end(
        JSON.stringify({
          totalBytes: Number.isFinite(total) ? total : null,
          freeBytes: Number.isFinite(free) ? free : null,
          vramBytes: vram.bytes,
          vramSource: vram.source,
          cpus: os.cpus().length,
          platform: os.platform(),
        }),
      );
    });
  };
  return {
    name: 'heat3d-host-memory',
    configureServer: handler,
    configurePreviewServer: handler,
  };
}

/** Where the page asks whether a newer version is out, and asks for it. */
export const UPDATE_ROUTE = '/__heat3d/update';

/**
 * Keeping the tool current: is the checkout behind its upstream, and bring it up.
 *
 * The viewer runs from a git checkout, so the newest version is whatever the
 * branch it tracks has. The page asks this route at start and every few hours;
 * the server fetches (at most every half hour) and answers how many commits it
 * is behind and what the newest one is called. "Update now" posts back, and the
 * server fast-forwards - only fast-forwards, and only a checkout with no local
 * changes: someone's uncommitted work is not an update's to decide about. The
 * pinned extractors follow, and the dependencies are reinstalled when the
 * package files changed. The page is told when a restart is needed, and why:
 * `restart` is 'dependencies' after a reinstall, 'config' when only this file
 * changed (the server runs the old one until restarted), false otherwise. A
 * checkout with nothing to bring in answers `updated: false`.
 *
 * The update request must come from the page itself: a custom header (which a
 * cross-site form cannot send without a preflight this server never grants)
 * and, when the browser says, an Origin that is this server.
 */
function selfUpdate(): Plugin {
  const root = fileURLToPath(new URL('.', import.meta.url));
  const run = (cmd: string, args: string[], timeout = 60_000) =>
    new Promise<string>((resolve, reject) => {
      execFile(cmd, args, { cwd: root, encoding: 'utf8', timeout, shell: cmd === 'npm' && os.platform() === 'win32' }, (err, out) =>
        err ? reject(err) : resolve(String(out).trim()),
      );
    });
  let fetchedAt = 0;
  const status = async (fetch: boolean) => {
    try {
      await run('git', ['rev-parse', '--git-dir']);
    } catch {
      return { checkout: false as const };
    }
    if (fetch && Date.now() - fetchedAt > 30 * 60_000) {
      fetchedAt = Date.now();
      await run('git', ['fetch', '--quiet']).catch(() => undefined);
    }
    try {
      const upstream = await run('git', ['rev-parse', '--abbrev-ref', '@{u}']);
      const behind = Number(await run('git', ['rev-list', '--count', 'HEAD..@{u}']));
      const ahead = Number(await run('git', ['rev-list', '--count', '@{u}..HEAD']));
      const dirty = (await run('git', ['status', '--porcelain', '--untracked-files=no'])).length > 0;
      const latest = behind > 0 ? await run('git', ['log', '-1', '--format=%s', '@{u}']) : '';
      return { checkout: true as const, upstream, behind, ahead, dirty, latest };
    } catch {
      return { checkout: true as const, upstream: null, behind: 0, ahead: 0, dirty: false, latest: '' };
    }
  };
  const apply = async () => {
    const s = await status(false);
    if (!s.checkout || !s.upstream || s.behind === 0) return { ok: true, updated: false };
    if (s.dirty) return { ok: false, reason: 'dirty' };
    if (s.ahead > 0) return { ok: false, reason: 'diverged' };
    const changed = (await run('git', ['diff', '--name-only', 'HEAD', '@{u}'])).split(/\r?\n/);
    await run('git', ['pull', '--ff-only'], 120_000);
    await run('git', ['submodule', 'update', '--init'], 120_000).catch(() => undefined);
    const reinstall = changed.some((f) => f === 'package.json' || f === 'package-lock.json');
    if (reinstall) await run('npm', ['install'], 15 * 60_000);
    const restart = reinstall ? 'dependencies' : changed.some((f) => f.startsWith('vite.config')) ? 'config' : false;
    return { ok: true, updated: true, restart };
  };
  const handler = (server: ViteDevServer) => {
    server.middlewares.use(UPDATE_ROUTE, (req, res) => {
      const send = (code: number, body: unknown) => {
        res.statusCode = code;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(body));
      };
      if (req.method === 'GET' && (req.url === '/' || req.url === '' || req.url?.startsWith('/?'))) {
        status(true).then((s) => send(200, s), () => send(200, { checkout: false }));
        return;
      }
      if (req.method === 'POST' && req.url?.startsWith('/apply')) {
        const origin = req.headers.origin;
        const host = req.headers.host;
        if (req.headers['x-heat3d-update'] !== '1' || (origin && host && new URL(origin).host !== host)) {
          send(403, { ok: false, reason: 'forbidden' });
          return;
        }
        apply().then(
          (r) => send(200, r),
          (e: Error) => send(200, { ok: false, reason: String(e.message ?? e).slice(0, 300) }),
        );
        return;
      }
      send(404, { ok: false });
    });
  };
  return { name: 'heat3d-self-update', configureServer: handler };
}

export default defineConfig({
  plugins: [react(), hostMemory(), selfUpdate()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5273,
    /**
     * The IPv4 loopback, explicitly.
     *
     * Vite's default binds to whatever `localhost` resolves to first, and on this
     * machine that is `::1` alone — so `http://127.0.0.1:5273` was actively
     * refused and `http://localhost:5273` worked or not depending on which family
     * the browser tried first. Chromium resolved it to `::1` happily; another
     * browser preferring IPv4 got a refusal and reported the server as down.
     *
     * `127.0.0.1` rather than `0.0.0.0` or `::`: those would fix both families by
     * also publishing the server, and its `/__host/memory` route, to everything on
     * the network. This machine's memory and GPU are nobody else's business, and
     * exposing a dev server is a decision to take deliberately rather than as a
     * side effect of fixing a URL. `--host` still overrides it when that is what
     * is wanted.
     */
    host: '127.0.0.1',
    // No COOP/COEP headers. They make the page cross-origin isolated, which only
    // SharedArrayBuffer (and finer timers) would need, and nothing here uses
    // either: the workers hand their typed arrays to the page by transfer, which
    // is zero-copy without any isolation. `require-corp` would only have blocked
    // any cross-origin resource a page might want to show.
    watch: {
      /**
       * Keep the file watcher out of the heavy directories.
       *
       * These hold multi-gigabyte binaries — level exports, Unity library
       * caches, Parquet test data. Crawling them costs about a gigabyte of
       * resident memory and leaves the dev server unable to answer its first
       * request, which presents as "the site never loads" rather than anything
       * pointing at the watcher.
       */
      ignored: [
        '**/old_tool/**',
        '**/TestData/**',
        // The level exports the comment above means. They live in each
        // exporter's `.out/`, which the earlier patterns do not reach —
        // `exporters/unreal/.out/` alone holds 2.3 GB of .glb here.
        '**/exporters/*/.out/**',
        '**/dist/**',
        '**/tools/.smoke/**',
        '**/exmples/**',
        '**/examples/**',
      ],
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
});
