/**
 * Which local data files the probes open when none is given on the command line.
 *
 * The test data is confidential: neither the files nor the names of their
 * folders belong in the repository. The paths live in `tools/local-data.json`,
 * which is git-ignored - `{ "primary": "TestData/...", "secondary": "...",
 * "reload": "..." }` - and without it the probes use the movement exports they
 * find under `TestData/`, in path order.
 *
 *   import { localSample } from './local-data.mjs';
 *   const target = process.argv[2] ?? localSample('primary');
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');

/** Every movement export under TestData, repository-relative, sorted. */
function discover() {
  const out = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/^movement.*\.parquet$/i.test(name)) out.push(relative(REPO, p).split('\\').join('/'));
    }
  };
  walk(join(REPO, 'TestData'));
  return out.sort();
}

/**
 * The file named `name` in tools/local-data.json, or else the `fallback`th
 * movement export found under TestData.
 */
export function localSample(name, fallback = 0) {
  const config = join(REPO, 'tools', 'local-data.json');
  if (existsSync(config)) {
    const paths = JSON.parse(readFileSync(config, 'utf8'));
    if (paths[name]) return paths[name];
  }
  const found = discover();
  if (!found.length) {
    throw new Error(`No data: name "${name}" in tools/local-data.json, or put exports under TestData/.`);
  }
  return found[Math.min(fallback, found.length - 1)];
}
