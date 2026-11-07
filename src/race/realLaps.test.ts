/**
 * The analysis against real laps from an FH Companion library, when there is
 * one: HEAT3D_LAP_DIR names a course folder (it skips otherwise).
 *
 *   HEAT3D_LAP_DIR="%LOCALAPPDATA%/FHCompanion/laps/<course name> (...)" npx vitest run src/race/realLaps.test.ts --silent=false
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readLaps } from './adapters';
import { analyse, type Analysis } from './analysis';
import type { LapTrace } from './lap';

const DIR = process.env.HEAT3D_LAP_DIR ?? '';

function lapFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.json') && name !== 'course.json') out.push(p);
    }
  };
  walk(dir);
  return out.sort();
}

/** Every lap's delta at the line is its lap time difference, and the phases add up to it. */
function checkSums(result: Analysis): void {
  const ref = result.alignment.laps.find((l) => l.lap === result.alignment.reference)!;
  for (const lap of result.alignment.laps) {
    let end = Math.min(lap.last, ref.last);
    while (end > 0 && !Number.isFinite(lap.channels.delta[end])) end--;
    const delta = lap.channels.delta[end];
    const expected =
      lap.lap.channels.time[lap.lap.count - 1] - ref.lap.channels.time[ref.lap.count - 1];
    expect(Math.abs(delta - expected)).toBeLessThan(1.0);
    // Each lap is compared corner by corner; its corners and its start add
    // up to its time against the lap it was compared with.
    const corners = result.results.get(lap.lap.id)!;
    if (lap === ref || !corners.length) continue;
    const sum = corners.reduce((s, r) => s + r.net, result.start.get(lap.lap.id)!);
    const from = Math.max(lap.first, ref.first);
    expect(Math.abs(sum - (delta - lap.channels.delta[from]))).toBeLessThan(0.05);
  }
}

function print(result: Analysis, picked: LapTrace[], count: number): void {
  console.log(
    `reference ${result.alignment.reference.seconds.toFixed(3)} s car ${result.alignment.reference.car.ordinal}; corners: ` +
      result.corners
        .map(
          (c) =>
            `T${c.number}@${(c.apex * 2).toFixed(0)}m ${(c.apexSpeed * 3.6).toFixed(0)}km/h${c.flat ? ' flat' : ''}`,
        )
        .join(', '),
  );
  for (const f of result.findings.slice(0, count)) {
    const lap = picked.find((l) => l.id === f.lapId)!;
    console.log(
      `${lap.seconds.toFixed(3)} car ${lap.car.ordinal}: ${f.cost.toFixed(3)} s [${f.outcome}/${f.source}/${f.basis}] ${f.title} — ${f.evidence} → ${f.tip}`,
    );
  }
  for (const c of result.cars.slice(0, 3))
    console.log(`cars ${c.labelA} vs ${c.labelB}: ${c.advice.join(' ')}`);
}

describe.skipIf(!DIR)('real laps', () => {
  const laps: LapTrace[] = DIR
    ? lapFiles(DIR).flatMap((f) => readLaps(readFileSync(f, 'utf8'), f))
    : [];
  laps.sort((a, b) => a.seconds - b.seconds);

  it('reads every lap', () => {
    expect(laps.length).toBeGreaterThan(1);
    for (const lap of laps) {
      expect(lap.count).toBeGreaterThan(50);
      expect(lap.channels.distance[lap.count - 1]).toBeGreaterThan(500);
    }
  });

  it('compares laps in different cars', () => {
    const byCar = new Map<number | undefined, LapTrace>();
    for (const lap of laps) if (!byCar.has(lap.car.ordinal)) byCar.set(lap.car.ordinal, lap);
    const picked = [...byCar.values()].slice(0, 4);
    const result = analyse(picked);
    checkSums(result);
    expect(result.corners.length).toBeGreaterThanOrEqual(5);
    print(result, picked, 14);
  });

  it('compares laps in the same car', () => {
    const car = laps[0].car.ordinal;
    const picked = laps.filter((l) => l.car.ordinal === car).slice(0, 5);
    const result = analyse(picked);
    checkSums(result);
    expect(result.findings.every((f) => f.source !== 'car' && f.carCost === 0)).toBe(true);
    print(result, picked, 14);
  });
});
