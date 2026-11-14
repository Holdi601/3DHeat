#!/usr/bin/env node
/**
 * The mass index (docs/mass-analysis.md): every `.3dheat` match under the
 * folders gets its summary (`src/mass/summarize.ts`) - the match, its
 * vehicles, teams, players and weapons, its phases, its grid - written into
 * the container as the `summary` member, once; a match summarised already
 * (by this version) is only read. Then one index per folder:
 *
 *   <folder>/3dheat-index.jsonl.gz        a line a match: path, size, mtime, the summary without its grid
 *   <folder>/3dheat-index.grids.jsonl.gz  a line a match: path and its grid
 *
 * The viewer's Mass analysis reads the index when it is there and current
 * (same size and time as the file), else the container's member, else works
 * the summary out itself.
 *
 *   node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
 *
 * A file changed in the last `--settle` minutes (10 by default) is left out:
 * a converter may still be writing it.
 * --no-write leaves the containers as they are (the index only). Meant to run
 * on the machine that holds the files, at low priority:
 * `nice -n 19 ionice -c3 node tools/3dheat-summarize.mjs ...`.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { readContainer, updateContainer } from './container.mjs';

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SELF), '..');
const INDEX = '3dheat-index.jsonl.gz';
const GRIDS = '3dheat-index.grids.jsonl.gz';

// ---------------------------------------------------------------------------
// A worker: one container at a time.

async function workerMain() {
  const { runnerImport } = await import('vite');
  const load = async (p) => (await runnerImport(path.join(ROOT, p), { root: ROOT, logLevel: 'silent', configFile: false })).module;
  const S = await load('src/mass/summarize.ts');
  const T = await load('src/mass/types.ts');
  const { write, force, tmp } = workerData;
  parentPort.on('message', async ({ job, file }) => {
    const t0 = performance.now();
    let c = null;
    try {
      c = await readContainer(file);
      const m = c.manifest;
      const have = m.members.find((x) => x.role === T.SUMMARY_ROLE);
      if (have && !force) {
        const s = JSON.parse((await c.read(have.name)).toString('utf8'));
        if (s?.format === T.SUMMARY_FORMAT && s.version === T.SUMMARY_VERSION) {
          await c.close();
          c = null;
          parentPort.postMessage({ ok: true, job, summary: s, cached: true, ms: performance.now() - t0 });
          return;
        }
      }
      const table = m.members.find((x) => x.role === 'table');
      if (!table) throw new Error('no table');
      const e = c.range(table.name);
      const fh = await fsp.open(file, 'r');
      let summary;
      try {
        const buf = {
          byteLength: e.csize,
          slice: async (s, end) => {
            const n = Math.max(0, Math.min(e.csize, end ?? e.csize) - s);
            const b = Buffer.allocUnsafeSlow(n);
            await fh.read(b, 0, n, e.start + s);
            return b.buffer.slice(b.byteOffset, b.byteOffset + n);
          },
        };
        const docMember = m.members.find((x) => x.role === 'match');
        let doc = null;
        if (docMember) {
          try {
            doc = JSON.parse((await c.read(docMember.name)).toString('utf8'));
          } catch {
            doc = null;
          }
        }
        const stem = path.basename(file).replace(/\.3dheat$/i, '');
        summary = await S.summarizeTable(buf, { id: m.match ?? stem, manifest: m, doc, by: 'tools/3dheat-summarize.mjs' });
        doc = null;
      } finally {
        await fh.close();
      }
      await c.close();
      c = null;
      if (!summary) throw new Error('no position, time or unit column');
      const computeMs = performance.now() - t0;
      if (write) {
        const stem = path.basename(file).replace(/\.3dheat$/i, '');
        const name = `${stem}.summary.json`;
        const t = path.join(tmp, `${process.pid}-${job}-${name}`);
        await fsp.writeFile(t, JSON.stringify(summary));
        try {
          await updateContainer(file, { add: [{ file: t, name, role: T.SUMMARY_ROLE, schema: { id: T.SUMMARY_FORMAT, version: String(T.SUMMARY_VERSION) } }] });
        } finally {
          await fsp.rm(t, { force: true });
        }
      }
      parentPort.postMessage({ ok: true, job, summary, cached: false, ms: performance.now() - t0, computeMs });
    } catch (err) {
      if (c) await c.close().catch(() => {});
      parentPort.postMessage({ ok: false, job, error: err instanceof Error ? err.message : String(err), ms: performance.now() - t0 });
    }
  });
  parentPort.postMessage({ ready: true });
}

// ---------------------------------------------------------------------------
// The folders, in a pool of workers.

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.3dheat$/i.test(e.name)) out.push(p);
  }
  return out;
}

function gzLines(file) {
  const gz = zlib.createGzip({ level: 6 });
  const out = fs.createWriteStream(file + '.part');
  gz.pipe(out);
  return {
    line: (o) => gz.write(JSON.stringify(o) + '\n'),
    close: () =>
      new Promise((resolve, reject) => {
        out.on('finish', () => fs.rename(file + '.part', file, (e) => (e ? reject(e) : resolve())));
        out.on('error', reject);
        gz.end();
      }),
  };
}

async function cli() {
  const args = process.argv.slice(2);
  const flag = (k) => {
    const i = args.indexOf(k);
    return i < 0 ? undefined : args[i + 1];
  };
  const has = (k) => args.includes(k);
  const folders = args.filter((a, i) => !a.startsWith('--') && !['--jobs', '--limit', '--settle'].includes(args[i - 1]));
  const settleMs = Number(flag('--settle') ?? 10) * 60_000;
  if (!folders.length) {
    console.error('usage: node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N]');
    process.exit(2);
  }
  const jobs = Math.max(1, Number(flag('--jobs') ?? Math.max(1, Math.min(4, os.cpus().length - 1))));
  const limit = Number(flag('--limit') ?? Infinity);
  const write = !has('--no-write');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), '3dheat-summary-'));
  const started = performance.now();
  const workers = await Promise.all(
    Array.from({ length: jobs }, () =>
      new Promise((resolve, reject) => {
        const w = new Worker(SELF, { workerData: { write, force: has('--force'), tmp }, resourceLimits: { maxOldGenerationSizeMb: 6144 } });
        w.once('message', () => resolve(w));
        w.once('error', reject);
      }),
    ),
  );
  let total = { files: 0, built: 0, cached: 0, failed: 0, buildMs: 0, rows: 0 };
  for (const folder of folders) {
    const now = Date.now();
    const files = walk(folder)
      .filter((f) => now - fs.statSync(f).mtimeMs >= settleMs)
      .slice(0, limit);
    const index = has('--no-index') ? null : gzLines(path.join(folder, INDEX));
    const grids = has('--no-index') ? null : gzLines(path.join(folder, GRIDS));
    let next = 0;
    let done = 0;
    const tick = Date.now();
    let lastLog = 0;
    await Promise.all(
      workers.map(
        (w) =>
          new Promise((resolve) => {
            const take = () => {
              const i = next++;
              if (i >= files.length) return resolve();
              w.once('message', async (r) => {
                done++;
                total.files++;
                const file = files[i];
                const rel = path.relative(folder, file).split(path.sep).join('/');
                if (!r.ok) {
                  total.failed++;
                  console.error(`  failed ${rel}: ${r.error}`);
                } else {
                  if (r.cached) total.cached++;
                  else {
                    total.built++;
                    total.buildMs += r.computeMs;
                    total.rows += r.summary.rows;
                  }
                  const st = fs.statSync(file);
                  const { grid, ...head } = r.summary;
                  index?.line({ path: rel, size: st.size, mtime: Math.round(st.mtimeMs), head });
                  if (grid) grids?.line({ path: rel, size: st.size, grid });
                }
                if (Date.now() - lastLog > 10_000 || done === files.length) {
                  lastLog = Date.now();
                  const s = (Date.now() - tick) / 1000;
                  console.log(`${folder}: ${done}/${files.length} in ${s.toFixed(0)} s (built ${total.built}, cached ${total.cached}, failed ${total.failed})`);
                }
                take();
              });
              w.postMessage({ job: i, file: files[i] });
            };
            take();
          }),
      ),
    );
    await index?.close();
    await grids?.close();
  }
  for (const w of workers) await w.terminate();
  fs.rmSync(tmp, { recursive: true, force: true });
  const secs = (performance.now() - started) / 1000;
  console.log(
    `done: ${total.files} files in ${secs.toFixed(1)} s; built ${total.built} (${total.built ? (total.buildMs / total.built).toFixed(0) : 0} ms a file in a worker, ${(total.rows / 1e6).toFixed(1)} M rows), read ${total.cached}, failed ${total.failed}; ${jobs} workers; peak RSS ${(process.memoryUsage().rss / 1e6).toFixed(0)} MB (main)`,
  );
}

if (isMainThread) cli().catch((e) => {
  console.error(e);
  process.exit(1);
});
else workerMain();
