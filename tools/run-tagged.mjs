/**
 * Run a vitest file with an opt-in env flag set.
 *
 * `FLAG=1 vitest ...` is not valid on Windows shells, and the heavy tests need to
 * stay opt-in, so the flag is set here instead of in the npm script.
 *
 *   node tools/run-tagged.mjs HEAVY src/data/realdata.test.ts
 */
import { spawn } from 'node:child_process';

const [flag, ...args] = process.argv.slice(2);
if (!flag) {
  console.error('usage: node tools/run-tagged.mjs <ENV_FLAG> [vitest args...]');
  process.exit(1);
}

const child = spawn(
  process.execPath,
  ['node_modules/vitest/vitest.mjs', 'run', ...args],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      [flag]: '1',
      // The full-size loads hold multiple gigabytes of typed arrays at peak.
      //
      // `--expose-gc` so a memory measurement can start from a collected
      // baseline. Without it the first reading still counts whatever the preview
      // read — a few hundred megabytes of one Parquet file — which is then
      // collected mid-load, and the "peak minus baseline" comes out negative.
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --max-old-space-size=12288 --expose-gc`.trim(),
    },
  },
);
child.on('exit', (code) => process.exit(code ?? 1));
