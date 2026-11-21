import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { parseSlots, pointAt, slotsAt, withSlots } from './recorded';
import { readSensor, type SensorSpec } from './sensors';
import { tacticalColumns } from '../render/tactical';

const spec = (id: string, kind: string): SensorSpec => readSensor({ id, kind, range: 10000, az: [-60, 60], el: [-30, 30] }, /x/)!;

function table(attrs: AttributeColumn[], n = 2): Dataset {
  return { count: n, attrs, personLabels: [], axes: { up: 'y', flipX: false, flipY: false, flipZ: true, scale: 1 } } as unknown as Dataset;
}

describe('recorded sensor states (War Thunder)', () => {
  it('reads the slots of a sensors value', () => {
    expect(parseSlots('d0+ d1+ d2- o3-')).toEqual([
      { optical: false, slot: 0, on: true },
      { optical: false, slot: 1, on: true },
      { optical: false, slot: 2, on: false },
      { optical: true, slot: 3, on: false },
    ]);
    expect(parseSlots('')).toEqual([]);
  });

  it('lays the slots over the catalogue: off ones left out, on ones marked recorded', () => {
    const radar = spec('radar', 'radar'), rwr = spec('rwr', 'rwr'), pod = spec('pod', 'tgp'), lrf = spec('lrf', 'lrf');
    const out = withSlots([radar, rwr, pod, lrf], parseSlots('d0- d1+ o2+'));
    expect(out.map((s) => s.id)).toEqual(['rwr', 'pod', 'lrf']);
    expect(out.map((s) => !!s.recorded)).toEqual([true, true, false]);
    // A slot whose place holds another sort of sensor takes the next of its own sort.
    expect(withSlots([pod, radar], parseSlots('d0+ o1-')).map((s) => s.id)).toEqual(['radar']);
  });

  it('gives a row its slots and points, and says which columns a recording lacks', () => {
    const sensors = { name: 'sensors', kind: 'category', data: Uint32Array.of(0, 1), categories: ['', 'd0+ o1-'], min: 0, max: 1 } as AttributeColumn;
    const num = (name: string, v: number[]) => ({ name, kind: 'number', data: Float32Array.from(v), min: 0, max: 1 }) as AttributeColumn;
    const d = table([sensors, num('lockX', [NaN, 1]), num('lockY', [NaN, 2]), num('lockZ', [NaN, 3]), num('aimHeading', [0, 0])]);
    expect(slotsAt(d, 0)).toBeNull();
    expect(slotsAt(d, 1)).toEqual([{ optical: false, slot: 0, on: true }, { optical: true, slot: 1, on: false }]);
    expect(pointAt(d, 'lock', 0)).toBeNull();
    // In the viewer's world: the load flips z.
    expect(pointAt(d, 'lock', 1)).toEqual([1, 2, -3]);
    const has = tacticalColumns(d);
    expect(has.radar && has.locks).toBe(true);
    expect(has.sight).toBe(false);
    expect(has.missing.sight).toEqual({ columns: 'sightX/Y/Z, opticX/Y/Z', olderConverter: true });
    // A War Thunder table converted before the sensor columns: each aid says what it lacks.
    const old = tacticalColumns(table([num('aimHeading', [0, 0])]));
    expect(old.missing.radar).toEqual({ columns: 'sensors', olderConverter: true });
    // Any other recording: the ACMI properties.
    expect(tacticalColumns(table([num('speed', [0, 0])])).missing.radar).toEqual({ columns: 'RadarRange', olderConverter: false });
  });
});
