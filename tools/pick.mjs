import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Which export a tool should measure.
 *
 * Every tool in here used to carry its own copy of this, all of them named
 * `newest` or `newestGlb`, and all eleven of them sorted by **file size**. So
 * "the newest export" meant "the biggest export", and in a directory holding
 * several runs of the same map that is a different file — silently. It was found
 * by measuring a new export twice and getting the previous one's numbers both
 * times, having read the filename in the tool's own output and believed it.
 *
 * A tool that measures a different file than the one you asked about, and prints
 * a filename that makes it look like it did what you wanted, is worse than one
 * that fails: every number it produces is attributed to the wrong build. The
 * repo already carries a comment about three rounds of exporter work signed off
 * on screenshots nobody could reproduce; this is the same failure with a
 * different cause.
 *
 * So: an explicit path always wins, and the fallback is genuinely by
 * modification time.
 */
export function pickFile(dir, ext, { env, minSize = 0 } = {}) {
  const override = env ? process.env[env] : null;
  if (override) {
    const path = resolve(override);
    if (!existsSync(path)) {
      throw new Error(`${env}=${override} does not exist`);
    }
    return path;
  }
  if (!existsSync(dir)) return null;
  const found = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(ext))
    .map((f) => {
      const path = join(dir, f);
      const s = statSync(path);
      return { path, size: s.size, at: s.mtimeMs };
    })
    .filter((e) => e.size >= minSize)
    .sort((a, b) => b.at - a.at);
  return found.length ? found[0].path : null;
}

/** The export under test: `HEAT3D_GLB`, else the most recently written .glb. */
export function pickGlb(outDir, minSize = 1e7) {
  return pickFile(outDir, '.glb', { env: 'HEAT3D_GLB', minSize });
}

/** The telemetry under test: `HEAT3D_PARQUET`, else the most recent one. */
export function pickParquet(dir, minSize = 1e7) {
  return pickFile(dir, '.parquet', { env: 'HEAT3D_PARQUET', minSize });
}
