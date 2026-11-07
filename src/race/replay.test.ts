import { describe, expect, it } from 'vitest';
import { analyse } from './analysis';
import { timeAt } from './align';
import { VertexBuffer } from './geometry';
import { buildCar } from './glyph';
import {
  frameTimes,
  inputWindow,
  lapMotion,
  lapTimes,
  lapTimesAt,
  replayOffsets,
  sampleDistances,
  stateAt,
} from './replay';
import { RaceScene } from './scene';
import { DEMO_CARS, syntheticLap } from './synthetic';
import { useRaceStore } from '../state/raceStore';

const [GRIP, POWER] = DEMO_CARS;

function pair() {
  const ref = syntheticLap(GRIP, { wheels: true }, 'ref');
  const slow = syntheticLap(GRIP, { wheels: true, brakeEarly: { corner: 2, metres: 40 } }, 'slow');
  return { ref, slow, analysis: analyse([ref, slow], 'ref') };
}

describe('replay', () => {
  it('interpolates a lap between samples', () => {
    const { ref, analysis } = pair();
    const m = lapMotion(ref, sampleDistances(ref, analysis.alignment));
    const t = ref.channels.time[100] * 0.5 + ref.channels.time[101] * 0.5;
    const s = stateAt(m, t);
    expect(s.x).toBeCloseTo((ref.channels.x[100] + ref.channels.x[101]) / 2, 3);
    expect(s.speed).toBeGreaterThan(0);
    expect(s.wheels.tireTemp).toHaveLength(4);
    expect(s.finished).toBe(false);
    expect(stateAt(m, 1e6).finished).toBe(true);
  });

  it('heads the way the car travels', () => {
    const { ref, analysis } = pair();
    const m = lapMotion(ref, sampleDistances(ref, analysis.alignment));
    // The first straight runs along +x: atan2(dx, dz) = +90 degrees.
    expect(stateAt(m, 1).course).toBeCloseTo(Math.PI / 2, 2);
  });

  it('starts every lap together from the line', () => {
    const { analysis } = pair();
    const offsets = replayOffsets(analysis.alignment, 'start', 0);
    const times = lapTimes(analysis.alignment, 'start', 3, offsets);
    expect(times.get('ref')).toBe(3);
    expect(times.get('slow')).toBe(3);
  });

  it('lines the cars up at a point and lets them go', () => {
    const { analysis } = pair();
    const anchor = 900;
    const offsets = replayOffsets(analysis.alignment, 'anchor', anchor);
    const ref = analysis.alignment.laps.find((l) => l.lap.id === 'ref')!;
    const slow = analysis.alignment.laps.find((l) => l.lap.id === 'slow')!;
    const grid = analysis.alignment.grid;
    const clock = timeAt(ref, grid, anchor);
    const times = lapTimes(analysis.alignment, 'anchor', clock, offsets);
    // At the anchor moment both are at the anchor...
    expect(times.get('slow')!).toBeCloseTo(timeAt(slow, grid, anchor), 3);
    // ...and the slow lap was already behind there.
    expect(offsets.get('slow')!).toBeGreaterThan(0.3);
  });

  it('holds every car at the reference distance when locked', () => {
    const { analysis } = pair();
    const grid = analysis.alignment.grid;
    const times = lapTimes(analysis.alignment, 'locked', 20, new Map());
    const slow = analysis.alignment.laps.find((l) => l.lap.id === 'slow')!;
    const ref = analysis.alignment.laps.find((l) => l.lap.id === 'ref')!;
    // Both laps' own times put them at the same metre.
    const sRef = distanceOf(ref, grid, times.get('ref')!);
    const sSlow = distanceOf(slow, grid, times.get('slow')!);
    expect(Math.abs(sRef - sSlow)).toBeLessThan(2.5);
  });
});

describe('the charts cursor', () => {
  it('puts every car where it was when it reached that metre', () => {
    const { analysis } = pair();
    const at = lapTimesAt(analysis.alignment, 900);
    const ref = analysis.alignment.laps.find((l) => l.lap.id === 'ref')!;
    const slow = analysis.alignment.laps.find((l) => l.lap.id === 'slow')!;
    expect(at.get('ref')).toBeCloseTo(timeAt(ref, analysis.alignment.grid, 900), 5);
    // The slow lap got there later.
    expect(at.get('slow')!).toBeGreaterThan(at.get('ref')!);
    expect(distanceOf(slow, analysis.alignment.grid, at.get('slow')!)).toBeCloseTo(900, -1);
  });

  it('wins over the replay clock while it is there, and only then', () => {
    const { analysis } = pair();
    const offsets = new Map<string, number>();
    const clock = frameTimes(analysis.alignment, 'start', 3, offsets, null);
    expect(clock.get('slow')).toBe(3);
    const cursor = frameTimes(analysis.alignment, 'start', 3, offsets, 900);
    expect(cursor.get('slow')).toBeCloseTo(lapTimesAt(analysis.alignment, 900).get('slow')!, 5);
  });
});

describe('input trace', () => {
  it('holds the last seconds of the pedals and steering, ending now', () => {
    const { ref } = pair();
    const w = inputWindow(ref, 20, 6, ['throttle', 'brake', 'steer', 'nosuch'], 50);
    expect(w.count).toBeGreaterThan(10);
    expect(w.count).toBeLessThanOrEqual(w.at.length);
    expect(w.at[0]).toBeGreaterThanOrEqual(-6.1);
    expect(w.at[w.count - 1]).toBeCloseTo(0, 1);
    for (let k = 1; k < w.count; k++) expect(w.at[k]).toBeGreaterThan(w.at[k - 1]);
    // What the lap lacks is simply not there.
    expect(Object.keys(w.values).sort()).toEqual(['brake', 'steer', 'throttle']);
    for (let k = 0; k < w.count; k++) {
      expect(w.values.throttle[k]).toBeGreaterThanOrEqual(0);
      expect(w.values.throttle[k]).toBeLessThanOrEqual(1);
    }
  });

  it('is short at the start of the lap', () => {
    const { ref } = pair();
    const w = inputWindow(ref, 0.5, 6, ['throttle']);
    expect(w.at[0]).toBeGreaterThanOrEqual(-0.6);
  });
});

function distanceOf(
  l: { channels: Record<string, Float32Array> },
  grid: Float32Array,
  t: number,
): number {
  const time = l.channels.time;
  for (let i = 1; i < time.length; i++) if (time[i] >= t) return grid[i - 1];
  return grid[grid.length - 1];
}

describe('car glyph', () => {
  it('builds a car with its wheels coloured by the tyres', () => {
    const { ref, analysis } = pair();
    const m = lapMotion(ref, sampleDistances(ref, analysis.alignment));
    const plain = new VertexBuffer();
    const opts = {
      scale: 1,
      steerSign: m.steerSign,
      wheelSide: m.wheelSide,
      telemetry: false,
      selected: false,
    };
    buildCar(plain, stateAt(m, 20), [1, 0, 0], opts);
    const rich = new VertexBuffer();
    buildCar(rich, stateAt(m, 20), [1, 0, 0], { ...opts, telemetry: true });
    expect(plain.count % 3).toBe(0);
    // Slip rings and suspension pads come on with the telemetry.
    expect(rich.count).toBeGreaterThan(plain.count);
    for (let i = 0; i < rich.count * 7; i++) expect(Number.isFinite(rich.data[i])).toBe(true);
  });

  it('sits on the road at the lap position', () => {
    const { ref, analysis } = pair();
    const m = lapMotion(ref, sampleDistances(ref, analysis.alignment));
    const s = stateAt(m, 5);
    const out = new VertexBuffer();
    buildCar(out, s, [1, 1, 1], {
      scale: 1,
      steerSign: 1,
      wheelSide: 1,
      telemetry: true,
      selected: false,
    });
    let minY = Infinity;
    let far = 0;
    for (let i = 0; i < out.count; i++) {
      minY = Math.min(minY, out.data[i * 7 + 1]);
      far = Math.max(far, Math.hypot(out.data[i * 7] - s.x, out.data[i * 7 + 2] - s.z));
    }
    expect(minY).toBeLessThan(s.y);
    expect(far).toBeLessThan(4);
  });
});

describe('scene', () => {
  it('draws the laps, the map and a car per visible lap', () => {
    const ref = syntheticLap(GRIP, { wheels: true }, 'a');
    const other = syntheticLap(POWER, { wheels: true }, 'b');
    const store = useRaceStore.getState();
    store.clearLaps();
    store.addLaps([ref, other]);
    const state = useRaceStore.getState();
    const frame = new RaceScene().build(state, 10);
    expect(frame.cars.size).toBe(2);
    expect(frame.lines.count).toBeGreaterThan(ref.count);
    expect(frame.tris.count).toBeGreaterThan(1000);
    // Hiding a lap removes its car.
    store.toggleLap('b');
    expect(new RaceScene().build(useRaceStore.getState(), 10).cars.size).toBe(1);
    store.clearLaps();
  });
});
