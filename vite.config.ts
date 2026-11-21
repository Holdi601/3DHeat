import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { execFile, execFileSync } from 'node:child_process';
import os from 'node:os';
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib';
import { encodePackFigure, type PackFigure } from './src/figures/figurepackBin.ts';

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

/** Where the page asks for the local figure pack (src/figures/figurepack.ts). */
const FIGURE_PACK_ROUTE = '/__heat3d/figure-pack';

/** A pack file as read: its figures, units, a tag per figure and the index, with each figure's compressed bodies once asked for. */
interface LoadedPack {
  key: string;
  figures: Record<string, PackFigure>;
  tags: Record<string, string>;
  index: string;
  indexTag: string;
  bodies: Map<string, Buffer>;
}

/**
 * The local figure pack: figures kept on this machine only (never in the
 * repository) that replace the catalogue's of the same names. Its path comes
 * from the `HEAT3D_FIGURE_PACK` environment variable or the `figurePack` entry
 * of the git-ignored `tools/local-data.json`; without one, or when the file is
 * missing, the route answers 404 and the viewer keeps its own figures.
 *
 * The page never takes the pack file itself (tens of megabytes of JSON): the
 * route answers with an index (each figure's name and a tag of its content, and
 * the units), and `/f/<name>?v=<tag>` under it with one figure, binary
 * (`src/figures/figurepackBin.ts`) and brotli- or gzip-compressed, made once
 * and kept. The index is checked on every page load (ETag, a bodiless 304 when
 * unchanged); a figure's URL changes with its content, so the browser keeps it
 * for good. The file is read again when it changes on disk, so a re-carved pack
 * shows on the next page load and only its changed figures are fetched anew.
 */
function figurePack(): Plugin {
  const where = (): string | null => {
    if (process.env.HEAT3D_FIGURE_PACK) return process.env.HEAT3D_FIGURE_PACK;
    try {
      const local = fileURLToPath(new URL('./tools/local-data.json', import.meta.url));
      const p = existsSync(local) ? (JSON.parse(readFileSync(local, 'utf8')) as { figurePack?: string }).figurePack : undefined;
      return p ?? null;
    } catch {
      return null;
    }
  };
  let held: LoadedPack | null = null;
  const load = (p: string): LoadedPack | null => {
    const st = statSync(p);
    const key = `${p}|${st.size}|${st.mtimeMs}`;
    if (held?.key === key) return held;
    held = null;
    const pack = JSON.parse(readFileSync(p, 'utf8')) as { version?: number; figures?: Record<string, PackFigure>; units?: Record<string, string> };
    if (!pack || pack.version !== 1 || typeof pack.figures !== 'object') return null;
    const tags: Record<string, string> = {};
    for (const [n, m] of Object.entries(pack.figures)) tags[n] = createHash('sha1').update(JSON.stringify(m)).digest('hex').slice(0, 16);
    const index = JSON.stringify({ version: 1, figures: tags, units: pack.units ?? {} });
    const indexTag = `"${createHash('sha1').update(index).digest('hex').slice(0, 20)}"`;
    held = { key, figures: pack.figures, tags, index, indexTag, bodies: new Map() };
    return held;
  };
  const handler = (server: ViteDevServer | { middlewares: ViteDevServer['middlewares'] }) => {
    server.middlewares.use(FIGURE_PACK_ROUTE, (req, res) => {
      const p = where();
      let pack: LoadedPack | null = null;
      try {
        pack = p && existsSync(p) ? load(p) : null;
      } catch {
        pack = null;
      }
      const url = new URL(req.url ?? '/', 'http://pack');
      const fig = /^\/f\/(.+)$/.exec(url.pathname);
      const name = fig ? decodeURIComponent(fig[1]) : null;
      if (!pack || (fig && !(name! in pack.figures))) {
        res.statusCode = 404;
        res.end();
        return;
      }
      const fresh = (tag: string) => {
        res.setHeader('ETag', tag);
        if (req.headers['if-none-match'] !== tag) return false;
        res.statusCode = 304;
        res.end();
        return true;
      };
      if (!name) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        if (fresh(pack.indexTag)) return;
        res.end(pack.index);
        return;
      }
      const tag = pack.tags[name];
      // A URL that names the figure's current tag never changes; one without it is checked each time.
      res.setHeader('Cache-Control', url.searchParams.get('v') === tag ? 'public, max-age=31536000, immutable' : 'no-cache');
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Vary', 'Accept-Encoding');
      if (fresh(`"${tag}"`)) return;
      const accept = String(req.headers['accept-encoding'] ?? '');
      const enc = /\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : '';
      let body = pack.bodies.get(`${enc}|${name}`);
      if (!body) {
        const raw = Buffer.from(encodePackFigure(pack.figures[name]));
        body =
          enc === 'br'
            ? brotliCompressSync(raw, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 9, [zlibConstants.BROTLI_PARAM_SIZE_HINT]: raw.length } })
            : enc === 'gzip'
              ? gzipSync(raw, { level: 9 })
              : raw;
        pack.bodies.set(`${enc}|${name}`, body);
      }
      if (enc) res.setHeader('Content-Encoding', enc);
      res.setHeader('Content-Length', body.length);
      res.end(body);
    });
  };
  return { name: 'heat3d-figure-pack', configureServer: handler, configurePreviewServer: handler };
}

/** Where the page asks for a level's layouts (src/state/levelLayoutsStore.ts). */
const LAYOUTS_ROUTE = '/__heat3d/layouts';

/**
 * A level's `<Level>.layouts.json` from the levels folder: `/<game>/<level>`
 * answers `<levels>/<game>/<Level>.layouts.json` (the level's name matched
 * without case), where `<levels>` is `HEAT3D_LEVELS` or the `levels` entry of
 * the git-ignored `tools/local-data.json`; 404 when there is none. The viewer
 * asks once for each level it loads and draws the layout of the data's mode.
 */
function levelLayouts(): Plugin {
  const root = (): string | null => {
    if (process.env.HEAT3D_LEVELS) return process.env.HEAT3D_LEVELS;
    try {
      const local = fileURLToPath(new URL('./tools/local-data.json', import.meta.url));
      const l = existsSync(local) ? (JSON.parse(readFileSync(local, 'utf8')) as { levels?: unknown }).levels : undefined;
      return typeof l === 'string' ? l : null;
    } catch {
      return null;
    }
  };
  const handler = (server: ViteDevServer | { middlewares: ViteDevServer['middlewares'] }) => {
    server.middlewares.use(LAYOUTS_ROUTE, (req, res) => {
      const m = /^[/]([a-z0-9-]+|_)[/]([A-Za-z0-9_.-]+)$/.exec(decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname));
      const base = root();
      let file: string | null = null;
      if (m && base) {
        // `_`: a level whose game is not known, looked for in every game's folder.
        const want = `${m[2]}.layouts.json`.toLowerCase();
        try {
          const dirs = m[1] === '_' ? readdirSync(base).map((d) => `${base}/${d}`) : [`${base}/${m[1]}`];
          for (const dir of dirs) {
            const hit = existsSync(dir) && statSync(dir).isDirectory() ? readdirSync(dir).find((n) => n.toLowerCase() === want) : undefined;
            if (hit) {
              file = `${dir}/${hit}`;
              break;
            }
          }
        } catch {
          file = null;
        }
      }
      if (!file) {
        res.statusCode = 404;
        res.end();
        return;
      }
      const body = readFileSync(file);
      const tag = `"${createHash('sha1').update(body).digest('hex').slice(0, 20)}"`;
      res.setHeader('ETag', tag);
      res.setHeader('Cache-Control', 'no-cache');
      if (req.headers['if-none-match'] === tag) {
        res.statusCode = 304;
        res.end();
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.end(body);
    });
  };
  return { name: 'heat3d-level-layouts', configureServer: handler, configurePreviewServer: handler };
}

/** Where the page asks for a game's local range catalogue (src/ranges/local.ts). */
const LOCAL_RANGES_ROUTE = '/__heat3d/ranges';

/**
 * A game's range catalogue built from the user's own installation by its
 * reader (`heat3d-wt-ranges`, `heat3d-dcs-maps ranges`): `/<game>` answers
 * the file named by the `ranges` entry of the git-ignored
 * `tools/local-data.json` (`{ "wt": "<path>", "dcs": "<path>" }`), with an
 * ETag so an unchanged file costs a bodiless 304; without one, 404, and the
 * viewer keeps its public catalogue.
 */
function localRanges(): Plugin {
  const where = (game: string): string | null => {
    try {
      const local = fileURLToPath(new URL('./tools/local-data.json', import.meta.url));
      const r = existsSync(local) ? (JSON.parse(readFileSync(local, 'utf8')) as { ranges?: Record<string, unknown> }).ranges : undefined;
      const p = r?.[game];
      return typeof p === 'string' ? p : null;
    } catch {
      return null;
    }
  };
  const handler = (server: ViteDevServer | { middlewares: ViteDevServer['middlewares'] }) => {
    server.middlewares.use(LOCAL_RANGES_ROUTE, (req, res) => {
      const game = /^\/([a-z0-9]+)$/i.exec(new URL(req.url ?? '/', 'http://ranges').pathname)?.[1];
      const p = game ? where(game) : null;
      if (!p || !existsSync(p)) {
        res.statusCode = 404;
        res.end();
        return;
      }
      const st = statSync(p);
      const tag = `"${st.size.toString(36)}-${Math.round(st.mtimeMs).toString(36)}"`;
      res.setHeader('ETag', tag);
      res.setHeader('Cache-Control', 'no-cache');
      if (req.headers['if-none-match'] === tag) {
        res.statusCode = 304;
        res.end();
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Length', st.size);
      createReadStream(p).pipe(res);
    });
  };
  return { name: 'heat3d-local-ranges', configureServer: handler, configurePreviewServer: handler };
}

/** Where the page asks for a campaign round's recordings on this machine (src/ui/match/SeriesPanel.tsx). */
const CAMPAIGN_ROUTE = '/__heat3d/campaign';

/**
 * A campaign round's recordings, served from this machine so the viewer can
 * load a round whole when it has one of its sessions (`tools/campaign-files.mjs`):
 * `?name=<campaign>` answers its sessions found here (name, size, an id), and
 * `/file/<id>` one of those files. Configured by the `campaigns` entry of the
 * git-ignored `tools/local-data.json`; without one the route answers 404 and
 * the viewer keeps its hint to load the files by hand.
 */
function campaignFiles(): Plugin {
  let index: { round(name: string): unknown; file(id: number): string | null } | null = null;
  const config = (): unknown => {
    try {
      const local = fileURLToPath(new URL('./tools/local-data.json', import.meta.url));
      return existsSync(local) ? (JSON.parse(readFileSync(local, 'utf8')) as { campaigns?: unknown }).campaigns ?? null : null;
    } catch {
      return null;
    }
  };
  const handler = (server: ViteDevServer | { middlewares: ViteDevServer['middlewares'] }) => {
    server.middlewares.use(CAMPAIGN_ROUTE, async (req, res) => {
      const c = config();
      if (!c) {
        res.statusCode = 404;
        res.end();
        return;
      }
      if (!index) {
        const { campaignIndex } = await import('./tools/campaign-files.mjs');
        index = campaignIndex(c);
      }
      const url = new URL(req.url ?? '/', 'http://campaign');
      const file = /^\/file\/(\d+)$/.exec(url.pathname);
      if (file) {
        const p = index.file(Number(file[1]));
        if (!p || !existsSync(p)) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', statSync(p).size);
        createReadStream(p).pipe(res);
        return;
      }
      const round = index.round(url.searchParams.get('name') ?? '');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      if (!round) res.statusCode = 404;
      res.end(JSON.stringify(round ?? {}));
    });
  };
  return { name: 'heat3d-campaign-files', configureServer: handler, configurePreviewServer: handler };
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
  plugins: [react(), hostMemory(), selfUpdate(), figurePack(), localRanges(), levelLayouts(), campaignFiles()],
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
