import { openAsBlob, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { autoMap } from './automap';
import { ingestFiles } from './ingestFiles';
import { bytesPerRow, estimateFootprint, formatBytes } from './memory';
import { previewSource } from './sourcePreview';
import type { ColumnMapping } from '../state/types';

/**
 * Does a load cost what the estimate says it costs?
 *
 * The estimate is not decoration: it decides whether the Load button is offered,
 * what stride it proposes, and whether the verdict reads "fits". A load labelled
 * "fits" at 3.11GB against a 15.11GB budget killed a tab with `Out of Memory`
 * while computing lifetimes, which means the model was wrong in the direction
 * that costs a person their work — and a wrong "fits" is worse than no estimate,
 * because it is the thing they act on.
 *
 * `ingestFiles` lives outside the worker precisely so it can be measured here.
 * Node counts `ArrayBuffer` storage in `process.memoryUsage().external`, which is
 * where essentially all of this data lives, so the figure is real. The browser
 * adds its own overhead on top — the renderer, the GPU driver's staging copies,
 * the structured clone to the main thread — so what this establishes is a *floor*
 * on the true cost, and a model that is already optimistic against the floor is
 * optimistic, full stop.
 *
 * Opt-in via MEMCHECK=1, because it reads real gigabytes:
 *
 *   node tools/run-tagged.mjs MEMCHECK src/data/ingestMemory.test.ts
 */

const ROOT = resolve(__dirname, '../../TestData');
const ENABLED = process.env.MEMCHECK === '1';

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.parquet$/i.test(name)) out.push(p);
  }
  return out;
}

/**
 * A File backed by the file on disk, not by a buffer already in memory.
 *
 * `new File([readFileSync(path)], ...)` was the obvious version and it wrecked the
 * measurement: it puts every byte of every selected file in memory before the
 * load starts — 974MB for one region — so the "peak" included a gigabyte the
 * browser never holds, and the first run of this test accused the model of being
 * 2x optimistic on that basis alone. `openAsBlob` hands back a Blob that reads
 * lazily, which is what an OS-backed `File` from a file picker does.
 */
async function asFile(path: string): Promise<File> {
  const blob = await openAsBlob(path);
  return new File([blob], path.split(/[\\/]/).pop()!, {
    type: 'application/octet-stream',
  });
}

/** Live bytes, counting typed-array storage, which is where the data is. */
function liveBytes(): number {
  const m = process.memoryUsage();
  return m.heapUsed + m.external;
}

const suite = ENABLED ? describe : describe.skip;

suite('what a real load costs against what the estimate promised', () => {
  // The smallest region, so this stays runnable; the ratio is what transfers, not
  // the absolute figure.
  const region = process.env.MEMCHECK_REGION ?? 'cn';
  const files = walk(join(ROOT, region)).sort();

  it(`stays within the modelled peak for TestData/${region}`, async () => {
    if (files.length === 0) return;

    const p = await previewSource(await asFile(files[0]));
    const mapping: ColumnMapping = autoMap({
      columns: p.columns,
      rows: p.rows,
      numeric: p.numeric,
      logicalTypes: p.logicalTypes,
      fileCount: files.length,
    });

    /**
     * Collected first, or the baseline includes the preview's own read.
     *
     * `previewSource` above reads the whole of the first file — hundreds of
     * megabytes — and that buffer is still live when a naive baseline is taken,
     * then collected during the load. The first version of this measured a
     * 12-million-row load at *minus* 244MB and passed, which is the kind of pass
     * that is worse than a failure.
     */
    const gc = (globalThis as { gc?: () => void }).gc;
    expect(gc, 'run through tools/run-tagged.mjs, which sets --expose-gc').toBeTypeOf('function');
    gc?.();
    const before = liveBytes();

    /**
     * Sampled from the progress callback, not from a timer.
     *
     * A timer cannot fire inside a synchronous block, and the expensive parts of
     * this are exactly that: the sort, the gather per column, the extent scan.
     * A 40ms interval therefore sampled only the gaps between them and reported a
     * peak *below* the starting point — minus 58MB for a 12-million-row load,
     * which passed the assertion and told us nothing. The progress callback fires
     * at the start of each of those steps, which is where the readings are.
     */
    const perPhase = new Map<string, number>();
    const sample = (label: string) => {
      const now = liveBytes();
      if (now > (perPhase.get(label) ?? 0)) perPhase.set(label, now);
    };

    const { dataset } = await ingestFiles({
      files: await Promise.all(files.map(asFile)),
      mapping,
      columns: p.columns,
      name: 'memcheck',
      onProgress: (prog) => sample(prog.label.replace(/^\[\d+\/\d+\]\s*/, '')),
    });
    const rows = dataset.count;
    // Collected first, so this is what the dataset retains rather than what the
    // allocator has not got round to freeing: the builder copies every column
    // down to its exact length, leaving the oversized originals as garbage.
    gc?.();
    sample('retained after the load');
    const peak = Math.max(...perPhase.values());

    const fp = estimateFootprint(mapping, rows, files.length);
    const measured = peak - before;
    const per = measured / Math.max(1, rows);
    // Reported unconditionally: the numbers are the point of the test, and a bare
    // pass/fail would hide a model that is right by luck.
    console.log(
      `\n  ${rows.toLocaleString()} rows over ${files.length} files\n` +
        `  modelled peak   ${formatBytes(fp.peakBytes)} (${fp.peakPerRow} B/row)\n` +
        `  measured peak   ${formatBytes(measured)} (${per.toFixed(1)} B/row)\n` +
        `  ratio           ${(measured / Math.max(1, fp.peakBytes)).toFixed(2)}x\n` +
        `  model steady    ${formatBytes(fp.steadyBytes)} (${bytesPerRow(mapping, files.length).steady} B/row)\n` +
        [...perPhase.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([label, bytes]) => `    ${formatBytes(bytes - before).padStart(9)}  ${label}`)
          .join('\n'),
    );

    /**
     * Every array the dataset holds, by size.
     *
     * Enumerated rather than reasoned about. The model is a sum of per-column
     * constants, so the only way to find out which term is missing is to list
     * what is actually retained and compare — and the gap here is 70 bytes a row,
     * which is too large to guess at.
     */
    const held: Array<[string, number]> = [];
    for (const [key, value] of Object.entries(dataset as unknown as Record<string, unknown>)) {
      if (ArrayBuffer.isView(value)) held.push([key, value.byteLength]);
    }
    for (const a of dataset.attrs) {
      held.push([`attr:${a.name}${a.categories ? ' (category)' : ''}`, a.data.byteLength]);
    }
    held.sort((x, y) => y[1] - x[1]);
    const heldTotal = held.reduce((s, [, b]) => s + b, 0);
    console.log(
      `  retained arrays, ${formatBytes(heldTotal)} total ` +
        `(${(heldTotal / rows).toFixed(1)} B/row):\n` +
        held
          .map(([k, b]) => `    ${formatBytes(b).padStart(9)}  ${(b / rows).toFixed(1).padStart(5)} B/row  ${k}`)
          .join('\n'),
    );

    expect(rows).toBeGreaterThan(0);
    /**
     * The model has to be an over-estimate, not an under-estimate.
     *
     * Asserted with no headroom in the model's favour: this measurement excludes
     * everything the browser adds on top, so the model needs to be comfortably
     * above it, and "comfortably" cannot be established by a test that allows it
     * to be below.
     */
    expect(measured).toBeLessThan(fp.peakBytes);
  }, 900_000);
});
