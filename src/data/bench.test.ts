import { readFileSync, readdirSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { autoMap } from './automap';
import { ingestFiles } from './ingestFiles';
import { previewSource } from './sourcePreview';

/**
 * Ingest benchmark over the real exports.
 *
 * Opt-in via BENCH=1 because it reads hundreds of megabytes. Results are written
 * to disk rather than logged, so a run can be compared against the previous one
 * instead of scrolled past.
 */

const ROOT = resolve(__dirname, '../../TestData');
const OUT = resolve(__dirname, '../../tools/.smoke');
const BENCH = process.env.BENCH === '1';

function findParquet(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) findParquet(p, out);
    else if (/\.parquet$/i.test(name)) out.push(p);
  }
  return out;
}

const big = findParquet(ROOT)
  .filter((p) => /movement\w*\.parquet$/i.test(p) && statSync(p).size > 1_000_000)
  .sort();

const suite = BENCH && big.length > 0 ? describe : describe.skip;

suite('ingest benchmark', () => {
  it('measures the full-size load', { timeout: 30 * 60 * 1000 }, async () => {
    const bytes = big.reduce((n, p) => n + statSync(p).size, 0);
    const asFile = (path: string) =>
      new File([readFileSync(path)], path.split(/[\\/]/).pop()!);

    const t0 = performance.now();
    const preview = await previewSource(asFile(big[0]));
    const tPreview = performance.now() - t0;

    const mapping = autoMap({
      columns: preview.columns,
      rows: preview.rows,
      numeric: preview.numeric,
      logicalTypes: preview.logicalTypes,
    });

    const stages: Array<{ label: string; ms: number; rows: number }> = [];
    let lastLabel = '';
    let lastAt = performance.now();
    const { measureSelection } = await import('./sourcePreview');
    const size = await measureSelection(big.map(asFile));

    const t1 = performance.now();
    const { dataset } = await ingestFiles({
      files: big.map(asFile),
      mapping,
      columns: preview.columns,
      name: 'bench',
      expectedRows: size.rows,
      onProgress: (p) => {
        // Record a stage boundary whenever the label changes.
        const label = p.label.replace(/^\[\d+\/\d+\]\s*/, '');
        if (label !== lastLabel) {
          if (lastLabel) {
            stages.push({ label: lastLabel, ms: performance.now() - lastAt, rows: p.rows });
          }
          lastLabel = label;
          lastAt = performance.now();
        }
      },
    });
    const tIngest = performance.now() - t1;
    if (lastLabel) {
      stages.push({ label: lastLabel, ms: performance.now() - lastAt, rows: dataset.count });
    }

    // Bytes actually retained, which is what decides whether this fits in a tab.
    const arrays = [
      dataset.px,
      dataset.py,
      dataset.pz,
      dataset.time,
      dataset.lifetime,
      dataset.yaw,
      dataset.pitch,
      dataset.personId,
      dataset.teamId,
      ...dataset.attrs.map((a) => a.data),
    ];
    const retained = arrays.reduce((n, a) => n + (a ? a.byteLength : 0), 0);

    const report = {
      files: big.length,
      inputMB: +(bytes / 1e6).toFixed(1),
      rows: dataset.count,
      entities: dataset.personLabels.length,
      groups: dataset.teamLabels.length,
      groupLabels: dataset.teamLabels.slice(0, 12),
      mappedColumns: {
        x: mapping.x,
        y: mapping.y,
        z: mapping.z,
        time: mapping.time,
        timeUnit: mapping.timeUnit,
        person: mapping.personId,
        team: mapping.teamId,
        extra: mapping.extra,
      },
      spanHours: +(dataset.timeRange[1] / 3600).toFixed(2),
      previewMs: Math.round(tPreview),
      ingestMs: Math.round(tIngest),
      rowsPerSecond: Math.round(dataset.count / (tIngest / 1000)),
      inputMBPerSecond: +(bytes / 1e6 / (tIngest / 1000)).toFixed(2),
      retainedMB: +(retained / 1e6).toFixed(1),
      bytesPerRow: +(retained / dataset.count).toFixed(1),
      gpuMBEstimate: +((dataset.count * 12) / 1e6).toFixed(1),
      stages: stages.map((s) => ({ ...s, ms: Math.round(s.ms) })),
    };

    mkdirSync(OUT, { recursive: true });
    writeFileSync(join(OUT, 'ingest-bench.json'), JSON.stringify(report, null, 2));
    process.stdout.write(`\n${JSON.stringify(report, null, 2)}\n`);

    expect(dataset.count).toBeGreaterThan(1_000_000);
  });
});
