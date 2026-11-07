/**
 * A course exported from the recorded-lap library, through the viewer's own
 * column mapping.
 *
 * The exporter writes the CSV; the viewer decides what its columns mean. Those
 * two live in different languages and different repositories' worth of code, so
 * the only way to know the headings are right is to run the real file through
 * the real mapper. A column the mapper misses is not an error anywhere — it is
 * simply a metric that never appears in the interface.
 *
 * Needs an export, which is a cut of someone's own play data and is not checked
 * in:
 *
 *     python -m heat3d_capture laps "<course name>" -o races/course
 *     HEAT3D_LAPS_CSV=races/course.csv npx vitest run src/data/raceLaps.test.ts
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { detectDelimiter, splitCsvLine } from './csv';
import { autoMap } from './automap';

const SAMPLE = process.env.HEAT3D_LAPS_CSV ?? '';
const present = SAMPLE !== '' && existsSync(SAMPLE);

function preview(text: string) {
  const delimiter = detectDelimiter(text);
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const columns = splitCsvLine(lines[0], delimiter);
  const rows = lines.slice(1, 200).map((l) => splitCsvLine(l, delimiter));
  const numeric = columns.map((_c, i) =>
    rows.every((r) => r[i] !== undefined && r[i] !== '' && Number.isFinite(Number(r[i]))),
  );
  return { columns, rows, numeric };
}

describe('a recorded course, read by the viewer', () => {
  it.skipIf(!present)('maps its position and offers its telemetry', () => {
    const text = readFileSync(SAMPLE, 'utf8').slice(0, 1 << 20);
    const input = preview(text);

    expect(input.columns).toContain('x');
    const mapping = autoMap(input);

    // Position, which is what puts a lap on the extracted ground at all.
    expect(mapping.x).toBe('x');
    expect(mapping.y).toBe('y');
    expect(mapping.z).toBe('z');

    // A lap is one continuous run, and two laps by the same car must never be
    // joined: without a session the track jumps from the finish line back to
    // the start once per lap.
    expect(mapping.sessionId).toBe('lap');
    expect(mapping.personId).toBe('car');
    expect(mapping.teamId).toBe('car_class');

    // Elapsed since this lap's own start, so every lap lines up at zero rather
    // than being scattered across the fortnight they were driven in.
    expect(mapping.time).toBe('elapsed');
    expect(mapping.timeUnit).toBe('seconds');

    // And the channels that make it a race analysis rather than a shape.
    expect(mapping.extra).toContain('speed_kmh');
    expect(mapping.extra).toContain('brake');
    expect(mapping.extra.every((c) => mapping.extraNumeric[c])).toBe(true);
  });

  it.skipIf(!present)('keeps the coordinates at sub-metre precision', () => {
    const text = readFileSync(SAMPLE, 'utf8').slice(0, 1 << 16);
    const { columns, rows } = preview(text);
    const xi = columns.indexOf('x');

    const values = rows.map((r) => Number(r[xi]));
    const fractional = values.filter((v) => Math.abs(v - Math.round(v)) > 1e-6);

    // Rounded to whole metres the whole course snaps to a grid and the racing
    // line comes out with stairs in it.
    expect(fractional.length).toBeGreaterThan(values.length * 0.9);
  });
});
