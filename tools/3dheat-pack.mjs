#!/usr/bin/env node
/**
 * Packs converted matches into `.3dheat` containers, one file a match
 * (docs/container.md), and back.
 *
 *   node tools/3dheat-pack.mjs [pack] <folder|file>... [--delete-loose] [--jobs N] [--settle MIN]
 *   node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
 *   node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
 *   node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<member name>]=<file>]... [--remove <member name>]...
 *   node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
 *
 * pack: every table `<match>.parquet` under the folders, with its match
 * document and sidecars, becomes `<match>.3dheat` beside them. A match whose
 * container exists is skipped; with --delete-loose its loose files are then
 * deleted if they are byte for byte what the container holds. Each container
 * written is read back whole (every member's sha256, size, CRC and Parquet
 * footer) before anything loose is deleted, and loose files are deleted only
 * with --delete-loose. A match with a file changed in the last --settle
 * minutes (default 10) is left alone: a converter may still be writing it.
 *
 * unpack: the members of each container as loose files beside it (a file
 * already there must be the same bytes); --delete-container removes the
 * container after. Member names may be paths (`analysis/heat.json`); they
 * unpack into folders beside the container, never outside it.
 *
 * update: adds or replaces members (a name already there is replaced; the
 * name is the file's own unless given) and removes others, appending to the
 * container: the tables already in it are not rewritten. repack: rewrites a
 * container whole, manifest first, leaving out what updates left
 * unreferenced. Both keep every member and manifest field, known or not.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { describe, looseHashes, looseMatches, readContainer, repackContainer, safeName, updateContainer, verifyContainer, writeContainer } from './container.mjs';

function dirsUnder(p, out = []) {
  out.push(p);
  for (const e of fs.readdirSync(p, { withFileTypes: true })) if (e.isDirectory()) dirsUnder(path.join(p, e.name), out);
  return out;
}

function containersUnder(inputs) {
  const out = [];
  for (const p of inputs) {
    if (fs.statSync(p).isDirectory()) {
      for (const d of dirsUnder(p)) for (const n of fs.readdirSync(d)) if (/\.3dheat$/i.test(n)) out.push(path.join(d, n));
    } else out.push(p);
  }
  return out.sort();
}

async function pool(items, jobs, fn) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(jobs, items.length) }, async () => {
      while (next < items.length) await fn(items[next++]);
    }),
  );
}

const gb = (b) => `${(b / 1e9).toFixed(2)} GB`;

async function pack(inputs, o) {
  const sets = [];
  for (const p of inputs) {
    const st = fs.statSync(p);
    const dirs = st.isDirectory() ? dirsUnder(p) : [path.dirname(p)];
    for (const d of dirs) {
      const names = fs.readdirSync(d);
      for (const s of looseMatches(d, names)) if (st.isDirectory() || path.resolve(s.table) === path.resolve(p)) sets.push({ dir: d, ...s });
    }
  }
  const tally = { packed: 0, skipped: 0, settling: 0, deleted: 0, failed: 0, looseBytes: 0, containerBytes: 0 };
  const now = Date.now();
  await pool(sets, o.jobs, async (s) => {
    const out = path.join(s.dir, `${s.stem}.3dheat`);
    const label = path.relative(process.cwd(), out);
    try {
      const stats = s.members.map((m) => fs.statSync(m.file));
      const loose = stats.reduce((a, x) => a + x.size, 0);
      if (stats.some((x) => now - x.mtimeMs < o.settle * 60_000)) {
        tally.settling++;
        console.log(`settling ${label}: changed in the last ${o.settle} min, left alone`);
        return;
      }
      let manifest;
      if (fs.existsSync(out)) {
        if (!o.deleteLoose) {
          tally.skipped++;
          return;
        }
        // Packed before: its loose files go only if they are what it holds.
        manifest = await verifyContainer(out);
        const want = await looseHashes(s.members);
        const held = Object.fromEntries(manifest.members.map((m) => [m.name, m.sha256]));
        const differs = Object.entries(want).filter(([n, h]) => held[n] !== h).map(([n]) => n);
        if (differs.length) throw new Error(`container exists and differs from ${differs.join(', ')}`);
        tally.skipped++;
      } else {
        await writeContainer(out, s.members, await describe(s.members));
        manifest = await verifyContainer(out);
        tally.packed++;
      }
      tally.looseBytes += loose;
      tally.containerBytes += fs.statSync(out).size;
      if (o.deleteLoose) {
        // Only what the manifest says it holds.
        const held = new Set(manifest.members.map((m) => m.name));
        for (const m of s.members) if (held.has(path.basename(m.file))) await fsp.rm(m.file);
        tally.deleted += s.members.length;
      }
      if (o.verbose) console.log(`ok ${label}`);
    } catch (e) {
      tally.failed++;
      console.error(`FAILED ${label}: ${e instanceof Error ? e.message : e}`);
    }
  });
  console.log(
    `${sets.length} matches: ${tally.packed} packed, ${tally.skipped} already packed, ${tally.settling} still changing, ${tally.failed} failed; ` +
      `${tally.deleted} loose files deleted; loose ${gb(tally.looseBytes)} -> containers ${gb(tally.containerBytes)}`,
  );
  return tally.failed ? 1 : 0;
}

async function unpack(inputs, o) {
  let failed = 0;
  const files = containersUnder(inputs);
  await pool(files, o.jobs, async (f) => {
    try {
      const manifest = await verifyContainer(f);
      const c = await readContainer(f);
      try {
        for (const m of manifest.members) {
          const to = path.join(path.dirname(f), ...safeName(m.name).split('/'));
          await fsp.mkdir(path.dirname(to), { recursive: true });
          if (fs.existsSync(to)) {
            const [h] = Object.values(await looseHashes([{ file: to }]));
            if (h !== m.sha256) throw new Error(`${m.name} exists beside it with other bytes`);
            continue;
          }
          const e = c.range(m.name);
          if (e.method === 0) {
            // Big members copied in pieces, not read whole.
            const src = await fsp.open(f, 'r');
            const dst = await fsp.open(`${to}.part`, 'w');
            try {
              const buf = Buffer.alloc(8 << 20);
              for (let done = 0; done < e.csize; ) {
                const { bytesRead } = await src.read(buf, 0, Math.min(buf.length, e.csize - done), e.start + done);
                await dst.write(buf, 0, bytesRead);
                done += bytesRead;
              }
            } finally {
              await src.close();
              await dst.close();
            }
          } else await fsp.writeFile(`${to}.part`, await c.read(m.name));
          await fsp.rename(`${to}.part`, to);
        }
      } finally {
        await c.close();
      }
      if (o.deleteContainer) await fsp.rm(f);
      if (o.verbose) console.log(`ok ${f}`);
    } catch (e) {
      failed++;
      console.error(`FAILED ${f}: ${e instanceof Error ? e.message : e}`);
    }
  });
  console.log(`${files.length} containers, ${failed} failed`);
  return failed ? 1 : 0;
}

async function verify(inputs, o) {
  let failed = 0;
  const files = containersUnder(inputs);
  await pool(files, o.jobs, async (f) => {
    try {
      await verifyContainer(f);
      if (o.verbose) console.log(`ok ${f}`);
    } catch (e) {
      failed++;
      console.error(`FAILED ${f}: ${e instanceof Error ? e.message : e}`);
    }
  });
  console.log(`${files.length} containers verified, ${failed} failed`);
  return failed ? 1 : 0;
}

const args = process.argv.slice(2);
const flag = (k) => {
  const i = args.indexOf(k);
  if (i < 0) return false;
  args.splice(i, 1);
  return true;
};
const value = (k, d) => {
  const i = args.indexOf(k);
  if (i < 0) return d;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const many = (k) => {
  const out = [];
  for (let i; (i = args.indexOf(k)) >= 0; ) out.push(args.splice(i, 2)[1]);
  return out;
};
const o = {
  add: many('--add'),
  remove: many('--remove'),
  deleteLoose: flag('--delete-loose'),
  deleteContainer: flag('--delete-container'),
  verbose: flag('--verbose'),
  jobs: Number(value('--jobs', 4)) || 4,
  settle: Number(value('--settle', 10)),
};
async function update(inputs, o) {
  const [file] = inputs;
  const add = o.add.map((spec) => {
    const eq = spec.indexOf('=');
    if (eq < 1) throw new Error(`--add ${spec}: <role>[:<member name>]=<file>`);
    const [role, name] = spec.slice(0, eq).split(/:(.*)/s);
    return { role, file: spec.slice(eq + 1), ...(name ? { name } : {}) };
  });
  await updateContainer(file, { add, remove: o.remove });
  const m = await verifyContainer(file);
  console.log(`${file}: ${m.members.length} members`);
  return 0;
}

async function repack(inputs, o) {
  let failed = 0;
  const files = containersUnder(inputs);
  await pool(files, o.jobs, async (f) => {
    try {
      const before = fs.statSync(f).size;
      await repackContainer(f);
      if (o.verbose) console.log(`ok ${f}: ${before} -> ${fs.statSync(f).size} bytes`);
    } catch (e) {
      failed++;
      console.error(`FAILED ${f}: ${e instanceof Error ? e.message : e}`);
    }
  });
  console.log(`${files.length} containers repacked, ${failed} failed`);
  return failed ? 1 : 0;
}

const verb = ['pack', 'unpack', 'verify', 'update', 'repack'].includes(args[0]) ? args.shift() : 'pack';
if (!args.length || args.some((a) => !fs.existsSync(a))) {
  console.error('usage: node tools/3dheat-pack.mjs [pack|unpack|verify|update|repack] <folder|file>... [--delete-loose] [--delete-container] [--add <role>[:<name>]=<file>] [--remove <name>] [--jobs N] [--settle MIN] [--verbose]');
  process.exit(2);
}
process.exitCode = await { pack, unpack, verify, update, repack }[verb](args, o);
