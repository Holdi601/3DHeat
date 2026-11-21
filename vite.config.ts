/// <reference types="vitest/config" />
import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { execFile, execFileSync } from 'node:child_process';
import os from 'node:os';
import { appendFileSync, closeSync, createReadStream, existsSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib';
import { encodePackFigure, type PackFigure } from './src/figures/figurepackBin.ts';
import { figureFromModelGlb, platesFromModelGlb } from './src/figures/modelpack.ts';
import { classify, glbExtras, jsonExtras, linkLayouts, type CatalogIndex, type CatalogItem } from './src/data/catalogIndex.ts';
import { buildCommandIndex } from './tools/commandIndex.ts';
import { checkBatch, LIMITS } from './src/usage/schema.ts';

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
 * missing, the index answers 204 (no content, so no console error at every page
 * load) and the viewer keeps its own figures.
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
        // No pack: 204 for the index, as the model-pack, ranges and layouts routes; a figure not in it stays 404.
        res.statusCode = !pack && !fig ? 204 : 404;
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

/** Where the page asks for the local model pack (src/figures/modelpack.ts). */
const MODEL_PACK_ROUTE = '/__heat3d/model-pack';

/**
 * The local model packs: per-unit vehicle models kept on this machine only
 * (never in the repository), one pack per game, drawn in place of the figure
 * each unit would get. Where they are comes from the `HEAT3D_MODEL_PACK`
 * environment variable (paths separated by `;`) or the `modelPack` entry of the
 * git-ignored `tools/local-data.json`: one path, a list, or `{ <game>: path }`;
 * each path a pack's `model-pack.json` or the folder holding it. Without any the
 * route answers 204 and nothing changes.
 *
 * The route answers with an index (per pack its game and, per unit, a tag, the
 * domain, the type word, the real vehicle's names and the unit's further ids), in the
 * order the packs are given, and, at `/u/<game>/<unit>?v=<tag>`, with one unit's
 * model converted to a pack figure (`figureFromModelGlb`, then the figure pack's
 * binary form), compressed, made once and kept for the most recent units asked
 * for. A unit's tag changes when its file does, so the browser keeps a model
 * until it is rebuilt.
 */
function modelPack(): Plugin {
  const where = (): string[] => {
    let given: unknown = process.env.HEAT3D_MODEL_PACK ? process.env.HEAT3D_MODEL_PACK.split(';') : undefined;
    if (!given) {
      try {
        const local = fileURLToPath(new URL('./tools/local-data.json', import.meta.url));
        given = existsSync(local) ? (JSON.parse(readFileSync(local, 'utf8')) as { modelPack?: unknown }).modelPack : undefined;
      } catch {
        given = undefined;
      }
    }
    const list = typeof given === 'string' ? [given] : Array.isArray(given) ? given : given && typeof given === 'object' ? Object.values(given) : [];
    return list
      .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
      .map((p) => (/\.json$/i.test(p) ? p : `${p.replace(/[\\/]+$/, '')}/model-pack.json`));
  };
  interface PackUnit {
    tag: string;
    domain?: string;
    type?: string;
    kind?: string;
    name?: string;
    names?: string[];
    aliases?: string[];
  }
  interface Pack {
    key: string;
    game: string;
    dir: string;
    files: Record<string, string>;
    units: Record<string, PackUnit>;
    /** The pack's `scale`: its models' metres to the game's (a Dota pack's inches-as-metres to the data's units). */
    scale: number;
  }
  const packs = new Map<string, Pack>();
  const bodies = new Map<string, Buffer>();
  const load = (p: string): Pack | null => {
    const st = statSync(p);
    const key = `${p}|${st.size}|${st.mtimeMs}`;
    const had = packs.get(p);
    if (had?.key === key) return had;
    packs.delete(p);
    type Entry = { file?: string; domain?: string; type?: string; kind?: string; name?: string; names?: unknown; aliases?: unknown; key?: string; gameBuild?: string; source?: string };
    const pack = JSON.parse(readFileSync(p, 'utf8')) as { format?: string; version?: number; game?: string; scale?: number; units?: Record<string, Entry> };
    if (!pack || pack.format !== '3dheat-model-pack' || pack.version !== 1 || typeof pack.units !== 'object') return null;
    const game = String(pack.game ?? 'game').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const files: Record<string, string> = {};
    const units: Record<string, PackUnit> = {};
    for (const [id, e] of Object.entries(pack.units)) {
      if (!e || typeof e.file !== 'string' || /[\\/]|\.\./.test(e.file)) continue;
      const unit = id.toLowerCase();
      files[unit] = e.file;
      const tag = createHash('sha1').update(`${e.file}|${e.key ?? ''}|${e.gameBuild ?? ''}|${e.source ?? ''}|${pack.scale ?? 1}`).digest('hex').slice(0, 16);
      const strings = (x: unknown) => (Array.isArray(x) ? x.filter((a): a is string => typeof a === 'string') : []);
      const aliases = strings(e.aliases);
      const names = strings(e.names);
      units[unit] = {
        tag,
        ...(e.domain ? { domain: e.domain } : {}),
        ...(e.type ? { type: e.type } : {}),
        ...(typeof e.kind === 'string' && e.kind ? { kind: e.kind } : {}),
        ...(e.name ? { name: e.name } : {}),
        ...(names.length ? { names } : {}),
        ...(aliases.length ? { aliases } : {}),
      };
    }
    const scale = typeof pack.scale === 'number' && pack.scale > 0 ? pack.scale : 1;
    const out = { key, game, dir: p.replace(/[\\/][^\\/]+$/, ''), files, units, scale };
    packs.set(p, out);
    return out;
  };
  const current = (): Pack[] => {
    const out: Pack[] = [];
    for (const p of where()) {
      try {
        const k = existsSync(p) ? load(p) : null;
        if (k) out.push(k);
      } catch {
        // A pack that does not read is left out.
      }
    }
    return out;
  };
  const handler = (server: ViteDevServer | { middlewares: ViteDevServer['middlewares'] }) => {
    server.middlewares.use(MODEL_PACK_ROUTE, (req, res) => {
      const all = current();
      const url = new URL(req.url ?? '/', 'http://pack');
      // A game's hit part names (`/hit-parts/<game>`) and a unit's damage-model parts (`/dm/<game>/<unit>`): asked
      // for when the vehicle heatmap shows plates, never with the figures.
      const hp = /^\/hit-parts\/([^/]+)$/.exec(url.pathname);
      if (hp) {
        const k = all.find((q) => q.game === decodeURIComponent(hp[1]).toLowerCase());
        const file = k ? `${k.dir}/hit-parts.json` : '';
        // A pack without hit part names (every game's but War Thunder's): 204, no console error per vehicle shown.
        if (!k || !existsSync(file)) {
          res.statusCode = k ? 204 : 404;
          res.end();
          return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(readFileSync(file));
        return;
      }
      const dmAt = /^\/dm\/([^/]+)\/(.+)$/.exec(url.pathname);
      if (dmAt) {
        const u = decodeURIComponent(dmAt[2]).toLowerCase();
        const k = all.find((q) => q.game === decodeURIComponent(dmAt[1]).toLowerCase() && u in q.files);
        let plates: ReturnType<typeof platesFromModelGlb> = [];
        try {
          if (k) plates = platesFromModelGlb(readFileSync(`${k.dir}/${k.files[u]}`));
        } catch {
          plates = [];
        }
        if (!k || !plates.length) {
          res.statusCode = k ? 204 : 404;
          res.end();
          return;
        }
        const b64 = (a: ArrayBufferView) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
        const body = JSON.stringify({
          version: 1,
          plates: plates.map((p) => ({ name: p.name, part: p.part, mm: p.mm, cls: p.cls, group: p.group, zone: p.zone, hp: p.hp, v: b64(p.pos), i: b64(p.idx), wide: p.idx instanceof Uint32Array })),
        });
        const raw = Buffer.from(body);
        const gz = /\bgzip\b/.test(String(req.headers['accept-encoding'] ?? ''));
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        if (gz) res.setHeader('Content-Encoding', 'gzip');
        res.end(gz ? gzipSync(raw, { level: 6 }) : raw);
        return;
      }
      const m = /^\/u\/([^/]+)\/(.+)$/.exec(url.pathname);
      const unit = m ? decodeURIComponent(m[2]).toLowerCase() : null;
      const pack = m ? all.find((k) => k.game === decodeURIComponent(m[1]).toLowerCase() && unit! in k.files) : undefined;
      if (url.pathname !== '/' && !pack) {
        res.statusCode = 404;
        res.end();
        return;
      }
      // No pack: 204 for the index (no console error at every page load).
      if (!all.length) {
        res.statusCode = 204;
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
      if (!pack || unit === null) {
        const index = JSON.stringify({ version: 1, packs: all.map((k) => ({ game: k.game, units: k.units })) });
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        if (fresh(`"${createHash('sha1').update(index).digest('hex').slice(0, 20)}"`)) return;
        res.end(index);
        return;
      }
      const tag = pack.units[unit].tag;
      res.setHeader('Cache-Control', url.searchParams.get('v') === tag ? 'public, max-age=31536000, immutable' : 'no-cache');
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Vary', 'Accept-Encoding');
      if (fresh(`"${tag}"`)) return;
      const accept = String(req.headers['accept-encoding'] ?? '');
      const enc = /\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : '';
      const bodyKey = `${enc}|${pack.game}|${unit}|${tag}`;
      let body = bodies.get(bodyKey);
      if (!body) {
        let raw: Buffer;
        try {
          raw = Buffer.from(encodePackFigure(figureFromModelGlb(readFileSync(`${pack.dir}/${pack.files[unit]}`), pack.scale)));
        } catch {
          res.statusCode = 404;
          res.end();
          return;
        }
        body =
          enc === 'br'
            ? brotliCompressSync(raw, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 9, [zlibConstants.BROTLI_PARAM_SIZE_HINT]: raw.length } })
            : enc === 'gzip'
              ? gzipSync(raw, { level: 9 })
              : raw;
        // Kept for the most recent units asked for: packs of thousands are never all in memory.
        if (bodies.size >= 400) bodies.delete(bodies.keys().next().value!);
        bodies.set(bodyKey, body);
      } else {
        bodies.delete(bodyKey);
        bodies.set(bodyKey, body);
      }
      if (enc) res.setHeader('Content-Encoding', enc);
      res.setHeader('Content-Length', body.length);
      res.end(body);
    });
  };
  return { name: 'heat3d-model-pack', configureServer: handler, configurePreviewServer: handler };
}

/** Where the page asks for the games' unit catalogues (src/figures/unitcatalog.ts). */
const UNIT_CATALOG_ROUTE = '/__heat3d/unit-catalogs';

/**
 * The games' unit catalogues the ext tools write (`catalog` verb) to
 * `<levels>/<game>/catalog.json`, kept on this machine only: every game's
 * items, cut to what the viewer uses (id, name, kind, class, nation, the real
 * vehicle's name and its further names, domain), as `{ version: 1, games: [{ game, items }] }`. Read
 * again when a file changes; 204 without any.
 */
function unitCatalogs(): Plugin {
  const cache = new Map<string, { key: string; game: string; items: unknown[] }>();
  const keep = ['id', 'name', 'kind', 'class', 'nation', 'key', 'domain'] as const;
  const read = (): { game: string; items: unknown[] }[] => {
    const root = levelsRoot();
    if (!root || !existsSync(root)) return [];
    const out: { game: string; items: unknown[] }[] = [];
    for (const d of readdirSync(root, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const file = `${root}/${d.name}/catalog.json`;
      try {
        if (!existsSync(file)) continue;
        const st = statSync(file);
        const key = `${st.size}|${st.mtimeMs}`;
        let hit = cache.get(file);
        if (hit?.key !== key) {
          const doc = JSON.parse(readFileSync(file, 'utf8')) as { format?: string; version?: number; game?: string; items?: Record<string, unknown>[] };
          if (doc?.format !== '3dheat-catalog' || doc.version !== 1 || !Array.isArray(doc.items)) continue;
          const items = doc.items
            .filter((it) => it && typeof it.id === 'string' && typeof it.name === 'string')
            .map((it) => {
              const out: Record<string, unknown> = Object.fromEntries(keep.filter((k) => typeof it[k] === 'string' && it[k] !== '').map((k) => [k, it[k]]));
              // Further names of the vehicle (a short form, another designation), for matching across games.
              const names = [...(Array.isArray(it.names) ? it.names : []), it.short].filter((n): n is string => typeof n === 'string' && n !== '' && n !== it.name);
              if (names.length) out.names = [...new Set(names)];
              return out;
            });
          hit = { key, game: String(doc.game ?? d.name), items };
          cache.set(file, hit);
        }
        out.push({ game: hit.game, items: hit.items });
      } catch {
        // A catalogue that does not read is left out.
      }
    }
    return out;
  };
  const handler = (server: ViteDevServer | { middlewares: ViteDevServer['middlewares'] }) => {
    server.middlewares.use(UNIT_CATALOG_ROUTE, (_req, res) => {
      const games = read();
      if (!games.length) {
        res.statusCode = 204;
        res.end();
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(JSON.stringify({ version: 1, games }));
    });
  };
  return { name: 'heat3d-unit-catalogs', configureServer: handler, configurePreviewServer: handler };
}

/** Where the page asks for the catalogue folder's index (src/ui/panels/CatalogSection.tsx). */
const CATALOG_ROUTE = '/__heat3d/catalog';

/**
 * The levels folder the extractors write into: `HEAT3D_LEVELS`, else `levels` in the git-ignored
 * `tools/local-data.json`, else the extractors' own default when it exists (docs/extractors.md):
 * `%LOCALAPPDATA%\3DHeat\levels` on Windows, `~/Library/Application Support/3DHeat/levels` on macOS,
 * `${XDG_DATA_HOME:-~/.local/share}/3dheat/levels` elsewhere.
 */
function levelsRoot(): string | null {
  if (process.env.HEAT3D_LEVELS) return process.env.HEAT3D_LEVELS;
  try {
    const local = fileURLToPath(new URL('./tools/local-data.json', import.meta.url));
    const l = existsSync(local) ? (JSON.parse(readFileSync(local, 'utf8')) as { levels?: unknown }).levels : undefined;
    if (typeof l === 'string') return l;
  } catch {
    // The default below.
  }
  const base =
    process.platform === 'win32'
      ? process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}/3DHeat`
      : process.platform === 'darwin'
        ? `${os.homedir()}/Library/Application Support/3DHeat`
        : `${process.env.XDG_DATA_HOME || `${os.homedir()}/.local/share`}/3dheat`;
  return base && existsSync(`${base}/levels`) ? `${base}/levels` : null;
}

/**
 * The catalogue folder index (src/data/catalogIndex.ts): `GET /` lists every
 * extract under the levels folder with its fingerprint, `GET /file?path=`
 * sends one. Files are hashed in the background, one at a time, and the hashes
 * kept in `<levels>/.3dheat-index.json` by size and time, so a file is hashed
 * again only when it changes; until then its `sha256` is null and `pending`
 * counts it. Nothing outside the folder is served.
 */
/**
 * The command palette's index of the side panel (tools/commandIndex.ts), as
 * `virtual:command-index`: read from the source when the page (or a test)
 * first asks for it, and again after a component or a message changes, so a
 * new panel is in Ctrl+K without a step anyone has to remember.
 */
function commandIndex(): Plugin {
  const ID = 'virtual:command-index';
  const RESOLVED = `\0${ID}`;
  let cached: string | null = null;
  return {
    name: 'heat3d-command-index',
    resolveId: (id) => (id === ID ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null;
      cached ??= JSON.stringify({ entries: buildCommandIndex(fileURLToPath(new URL('.', import.meta.url))) });
      return `export default ${cached};`;
    },
    configureServer(server) {
      const stale = (file: string) => {
        if (!/[\\/]src[\\/].*\.(tsx|json)$/.test(file) || cached === null) return;
        cached = null;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
      };
      server.watcher.on('change', stale);
      server.watcher.on('add', stale);
    },
  };
}

function catalogFolder(): Plugin {
  type Known = { bytes: number; mtime: number; sha256: string; extractor: string | null; gameBuild: string | null };
  let known: Record<string, Known> | null = null;
  let hashing = false;
  const cacheFile = (root: string) => `${root}/.3dheat-index.json`;
  const loadKnown = (root: string) => {
    if (known) return known;
    try {
      known = existsSync(cacheFile(root)) ? (JSON.parse(readFileSync(cacheFile(root), 'utf8')) as Record<string, Known>) : {};
    } catch {
      known = {};
    }
    return known;
  };
  const walk = (root: string, rel = '', depth = 0, out: { path: string; bytes: number; mtime: number }[] = []) => {
    if (depth > 5) return out;
    for (const name of readdirSync(`${root}/${rel}`)) {
      if (name.startsWith('.')) continue;
      const path = rel ? `${rel}/${name}` : name;
      const st = statSync(`${root}/${path}`);
      if (st.isDirectory()) walk(root, path, depth + 1, out);
      else out.push({ path, bytes: st.size, mtime: Math.round(st.mtimeMs) });
    }
    return out;
  };
  const extrasOf = (root: string, path: string) => {
    try {
      if (/\.glb$/i.test(path)) {
        const fd = openSync(`${root}/${path}`, 'r');
        try {
          const head = Buffer.alloc(65536);
          const n = readSync(fd, head, 0, head.length, 0);
          return glbExtras(new Uint8Array(head.buffer, head.byteOffset, n));
        } finally {
          closeSync(fd);
        }
      }
      if (/\.json$/i.test(path)) {
        const fd = openSync(`${root}/${path}`, 'r');
        try {
          const head = Buffer.alloc(4096);
          const n = readSync(fd, head, 0, head.length, 0);
          return jsonExtras(head.subarray(0, n).toString('utf8'));
        } finally {
          closeSync(fd);
        }
      }
    } catch {
      // Unreadable: said nothing.
    }
    return { extractor: null, gameBuild: null };
  };
  const hashNext = (root: string, todo: { path: string; bytes: number; mtime: number }[]) => {
    if (hashing) return;
    const next = todo.shift();
    if (!next) {
      try {
        writeFileSync(cacheFile(root), JSON.stringify(known));
      } catch {
        // A read-only folder: hashed again next time.
      }
      return;
    }
    hashing = true;
    const h = createHash('sha256');
    createReadStream(`${root}/${next.path}`)
      .on('data', (b) => h.update(b))
      .on('error', () => {
        hashing = false;
        hashNext(root, todo);
      })
      .on('end', () => {
        known![next.path] = { bytes: next.bytes, mtime: next.mtime, sha256: h.digest('hex'), ...extrasOf(root, next.path) };
        hashing = false;
        if (todo.length % 20 === 0) {
          try {
            writeFileSync(cacheFile(root), JSON.stringify(known));
          } catch {
            // Kept in memory.
          }
        }
        hashNext(root, todo);
      });
  };
  let todo: { path: string; bytes: number; mtime: number }[] = [];
  const handler = (server: ViteDevServer | { middlewares: ViteDevServer['middlewares'] }) => {
    server.middlewares.use(CATALOG_ROUTE, (req, res) => {
      const root = levelsRoot();
      const url = new URL(req.url ?? '/', 'http://x');
      if (!root || !existsSync(root)) {
        // No levels folder is not an error: the index says so with no content
        // (the start screen asks for it on every first look), a file is not found.
        res.statusCode = url.pathname === '/file' ? 404 : 204;
        res.end();
        return;
      }
      if (url.pathname === '/file') {
        const path = (url.searchParams.get('path') ?? '').replace(/\\/g, '/');
        if (!path || path.split('/').some((p) => p === '..' || p.startsWith('.')) || !classify(path) || !existsSync(`${root}/${path}`)) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader('Content-Type', /\.json$/i.test(path) ? 'application/json' : 'application/octet-stream');
        res.setHeader('Content-Length', statSync(`${root}/${path}`).size);
        createReadStream(`${root}/${path}`).pipe(res);
        return;
      }
      const have = loadKnown(root);
      const files = walk(root).filter((f) => classify(f.path));
      const items: CatalogItem[] = files.map((f) => {
        const k = have[f.path];
        const fresh = k && k.bytes === f.bytes && k.mtime === f.mtime;
        return {
          ...f,
          ...classify(f.path)!,
          sha256: fresh ? k.sha256 : null,
          extractor: fresh ? k.extractor : null,
          gameBuild: fresh ? k.gameBuild : null,
        };
      });
      todo = files.filter((f) => !(have[f.path] && have[f.path].bytes === f.bytes && have[f.path].mtime === f.mtime));
      // The index first; the hashing follows, a file at a time.
      setTimeout(() => hashNext(root, todo), 0);
      const index: CatalogIndex = { version: 1, root, items: linkLayouts(items), pending: todo.length };
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(JSON.stringify(index));
    });
  };
  return { name: 'heat3d-catalog-folder', configureServer: handler, configurePreviewServer: handler };
}

/** Where the page asks for a level's layouts (src/state/levelLayoutsStore.ts). */
const LAYOUTS_ROUTE = '/__heat3d/layouts';

/**
 * A level's `<Level>.layouts.json` from the levels folder: `/<game>/<level>`
 * answers `<levels>/<game>/<Level>.layouts.json` (the level's name matched
 * without case), where `<levels>` is `HEAT3D_LEVELS` or the `levels` entry of
 * the git-ignored `tools/local-data.json`; 204 when there is none. The viewer
 * asks once for each level it loads and draws the layout of the data's mode.
 */
function levelLayouts(): Plugin {
  const root = levelsRoot;
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
          // A level in a folder of its own, beside its glb (`<game>/<Level>/`, `<game>/<theatre>/r1/`): a few folders down.
          const below = (d: string, depth: number): string | null => {
            if (depth > 3 || !existsSync(d) || !statSync(d).isDirectory()) return null;
            const subs = readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.'));
            for (const e of subs) {
              const hit = readdirSync(`${d}/${e.name}`).find((x) => x.toLowerCase() === want);
              if (hit) return `${d}/${e.name}/${hit}`;
            }
            for (const e of subs) {
              const deeper = below(`${d}/${e.name}`, depth + 1);
              if (deeper) return deeper;
            }
            return null;
          };
          for (const dir of file ? [] : dirs) {
            file = below(dir, 1);
            if (file) break;
          }
        } catch {
          file = null;
        }
      }
      if (!file) {
        // No content, not 404: the viewer asks for every level it loads, and
        // a level without layouts is the normal case, not a console error.
        res.statusCode = 204;
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
 * ETag so an unchanged file costs a bodiless 304; without one, 204 (no
 * content), and the viewer keeps its public catalogue.
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
        // No content rather than not found: the page asks for every game at
        // startup, and each 404 is a console error about a catalogue that is
        // simply not installed.
        res.statusCode = 204;
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

/** Where the page keeps its local usage statistics (src/usage/recorder.ts). */
const USAGE_ROUTE = '/__heat3d/usage';

/**
 * Local usage statistics, written to this machine only (docs/usage-statistics.md).
 *
 * On when the git-ignored `tools/local-data.json` says `"usageStats": true`
 * (or `HEAT3D_USAGE=1`); the folder is its `usageDir` (or `HEAT3D_USAGE_DIR`),
 * else `tools/.usage`. Off, every request answers 204 and nothing is written.
 *
 * - `GET`: 200 `{ "enabled": true }` when on, so the page knows to post here.
 * - `POST`: a batch `{ v: 1, events: [...] }` from this page's own origin, as
 *   JSON, at most LIMITS.bytes and LIMITS.batch events, every event passing
 *   the schema (src/usage/schema.ts) with its section and label ids checked
 *   against the English messages - anything else is refused whole (400/413).
 *   Appended to `usage-YYYY-MM-DD.jsonl`, one event a line; a day's file stops
 *   growing at 64 MB.
 * - `DELETE` (with `X-Heat3d-Usage: 1`, same origin): removes the usage files.
 *
 * Read per request (a small file), so switching it needs no restart.
 */
function usageStats(): Plugin {
  const root = fileURLToPath(new URL('.', import.meta.url));
  const english = new Set<string>();
  try {
    const dir = `${root}src/i18n/locales/en`;
    for (const f of readdirSync(dir)) if (f.endsWith('.json')) for (const k of Object.keys(JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')))) english.add(k);
  } catch {
    // No messages: no section or control id passes.
  }
  const isKey = (k: string) => english.has(k);
  const config = (): { on: boolean; dir: string } => {
    let on = process.env.HEAT3D_USAGE === '1';
    let dir = process.env.HEAT3D_USAGE_DIR ?? '';
    if (process.env.HEAT3D_USAGE !== '0' && process.env.HEAT3D_USAGE !== '1') {
      try {
        const local = `${root}tools/local-data.json`;
        const j = existsSync(local) ? (JSON.parse(readFileSync(local, 'utf8')) as { usageStats?: unknown; usageDir?: unknown }) : {};
        on = j.usageStats === true;
        if (!dir && typeof j.usageDir === 'string') dir = j.usageDir;
      } catch {
        on = false;
      }
    }
    return { on, dir: dir || `${root}tools/.usage` };
  };
  const day = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const handler = (server: ViteDevServer | { middlewares: ViteDevServer['middlewares'] }) => {
    server.middlewares.use(USAGE_ROUTE, (req, res) => {
      const end = (code: number, body?: unknown) => {
        res.statusCode = code;
        res.setHeader('Cache-Control', 'no-store');
        if (body === undefined) res.end();
        else {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        }
      };
      const { on, dir } = config();
      if (!on) {
        // Off: nothing kept, nothing said. The body is read away, not stored.
        req.resume();
        end(204);
        return;
      }
      const origin = req.headers.origin;
      const host = req.headers.host;
      const sameOrigin = !origin || (!!host && (() => {
        try {
          return new URL(origin).host === host;
        } catch {
          return false;
        }
      })());
      if (req.method === 'GET') {
        end(200, { enabled: true });
        return;
      }
      if (req.method === 'DELETE') {
        if (!sameOrigin || req.headers['x-heat3d-usage'] !== '1') return end(403);
        try {
          if (existsSync(dir)) for (const f of readdirSync(dir)) if (/^usage-\d{4}-\d{2}-\d{2}\.jsonl$/.test(f)) unlinkSync(`${dir}/${f}`);
        } catch {
          return end(500);
        }
        return end(204);
      }
      if (req.method !== 'POST') return end(405);
      if (!sameOrigin) {
        req.resume();
        return end(403);
      }
      if (!/^(application\/json|text\/plain)(;|$)/.test(req.headers['content-type'] ?? '')) {
        req.resume();
        return end(415);
      }
      const chunks: Buffer[] = [];
      let bytes = 0;
      let over = false;
      req.on('data', (c: Buffer) => {
        if (over) return;
        bytes += c.length;
        if (bytes > LIMITS.bytes) {
          over = true;
          end(413);
          req.destroy();
          return;
        }
        chunks.push(c);
      });
      req.on('end', () => {
        if (over) return;
        let body: unknown;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch {
          return end(400, { error: 'json' });
        }
        const events = checkBatch(body, isKey);
        if (typeof events === 'string') return end(400, { error: events });
        try {
          mkdirSync(dir, { recursive: true });
          const file = `${dir}/usage-${day()}.jsonl`;
          if (existsSync(file) && statSync(file).size > 64 * 1024 * 1024) return end(507);
          appendFileSync(file, events.map((e) => JSON.stringify(e)).join('\n') + '\n');
        } catch {
          return end(500);
        }
        end(204);
      });
    });
  };
  return { name: 'heat3d-usage-stats', configureServer: handler, configurePreviewServer: handler };
}

export default defineConfig({
  plugins: [react(), commandIndex(), usageStats(), hostMemory(), selfUpdate(), figurePack(), modelPack(), unitCatalogs(), localRanges(), levelLayouts(), catalogFolder(), campaignFiles()],
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
  test: {
    // Half the cores, not all but one: a test file per core starved each other's seconds-long tests past their time
    // limits whenever the machine had other work, and the run takes hardly longer.
    maxWorkers: '50%',
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
});
