import { describe, expect, it } from 'vitest';
import { analyse } from './analysis';
import { readIbt, UnreadableIbt } from './ibt';

/** A small .ibt: `laps` laps round a 100 m circle at 30 m/s, plus half a lap. */
function makeIbt(laps = 2): ArrayBuffer {
  const vars: [string, number][] = [
    ['SessionTime', 5],
    ['Lap', 2],
    ['LapDistPct', 4],
    ['LapDist', 4],
    ['Lat', 5],
    ['Lon', 5],
    ['Alt', 4],
    ['Speed', 4],
    ['Throttle', 4],
    ['Brake', 4],
    ['SteeringWheelAngle', 4],
    ['SteeringWheelAngleMax', 4],
    ['Gear', 2],
    ['LFtempCM', 4],
    // Aids and settings the reader maps, and channels it has never heard of.
    ['BrakeABSactive', 1],
    ['dcBrakeBias', 4],
    ['LFbrakeLinePress', 4],
    ['EngineWarnings', 3],
  ];
  const size = [1, 1, 4, 4, 4, 8];
  let rowLen = 0;
  const offsets = vars.map(([, t]) => {
    const o = rowLen;
    rowLen += size[t];
    return o;
  });
  const yaml =
    'WeekendInfo:\n TrackDisplayName: Test Oval\n TrackLength: 0.63 km\nDriverInfo:\n DriverCarIdx: 1\n Drivers:\n - CarIdx: 0\n   CarScreenName: Pace Car\n - CarIdx: 1\n   CarScreenName: Mazda MX-5\n   CarID: 67\n\n';
  const yamlBytes = new TextEncoder().encode(yaml);
  const circumference = 2 * Math.PI * 100;
  const hz = 60;
  const perLap = Math.round((circumference / 30) * hz);
  const rows = perLap * laps + Math.round(perLap / 2);
  const varHeaderOffset = 144;
  const yamlOffset = varHeaderOffset + vars.length * 144;
  const start = yamlOffset + yamlBytes.length + 16;
  const buf = new ArrayBuffer(start + rows * rowLen);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);
  view.setInt32(0, 2, true);
  view.setInt32(8, hz, true);
  view.setInt32(16, yamlBytes.length, true);
  view.setInt32(20, yamlOffset, true);
  view.setInt32(24, vars.length, true);
  view.setInt32(28, varHeaderOffset, true);
  view.setInt32(32, 1, true);
  view.setInt32(36, rowLen, true);
  view.setInt32(52, start, true);
  view.setInt32(112 + 28, rows, true);
  vars.forEach(([name, type], i) => {
    const at = varHeaderOffset + i * 144;
    view.setInt32(at, type, true);
    view.setInt32(at + 4, offsets[i], true);
    view.setInt32(at + 8, 1, true);
    bytes.set(new TextEncoder().encode(name), at + 16);
  });
  bytes.set(yamlBytes, yamlOffset);
  const lat0 = 47.0;
  const lon0 = 8.0;
  const deg = 180 / Math.PI / 6371008.8;
  for (let r = 0; r < rows; r++) {
    const t = r / hz;
    const s = 30 * t;
    const lap = Math.floor(s / circumference);
    const pct = (s % circumference) / circumference;
    const a = pct * 2 * Math.PI;
    const values: number[] = [
      t + 100,
      lap,
      pct,
      pct * circumference,
      lat0 + Math.sin(a) * 100 * deg,
      lon0 + ((1 - Math.cos(a)) * 100 * deg) / Math.cos((lat0 * Math.PI) / 180),
      400,
      30,
      1,
      0,
      0.3,
      Math.PI,
      3,
      80 + lap,
      pct > 0.5 ? 1 : 0,
      54,
      pct * 10,
      7,
    ];
    vars.forEach(([, type], i) => {
      const at = start + r * rowLen + offsets[i];
      if (type === 1) view.setUint8(at, values[i]);
      else if (type === 2 || type === 3) view.setInt32(at, values[i], true);
      else if (type === 4) view.setFloat32(at, values[i], true);
      else view.setFloat64(at, values[i], true);
    });
  }
  return buf;
}

describe('iRacing .ibt', () => {
  it('reads each complete lap, in metres, with the car and track', () => {
    const laps = readIbt(makeIbt(2), 'test.ibt');
    // Two whole laps; the half lap at the end is left out.
    expect(laps).toHaveLength(2);
    const [lap] = laps;
    expect(lap.game).toBe('iracing');
    expect(lap.track).toBe('Test Oval');
    expect(lap.car.name).toBe('Mazda MX-5');
    expect(lap.car.ordinal).toBe(67);
    expect(lap.seconds).toBeCloseTo((2 * Math.PI * 100) / 30, 0);
    // A 100 m circle: 200 m across.
    const xs = Array.from(lap.channels.x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(200, -1);
    expect(lap.channels.y[0]).toBe(400);
    // Anticlockwise radians to right-positive -1..1.
    expect(lap.channels.steer[10]).toBeCloseTo(-0.3 / Math.PI, 3);
    expect(lap.channels['tireTemp.FL'][0]).toBe(80);
    expect(laps[1].channels['tireTemp.FL'][0]).toBe(81);
  });

  it('keeps every other channel, by the table where it knows it and by name where not', () => {
    const [lap] = readIbt(makeIbt(2), 'test.ibt');
    expect(lap.channels.brakeBias[0]).toBeCloseTo(0.54);
    expect(Math.max(...lap.channels.absActive)).toBe(1);
    // A per-wheel channel no one described: one family, named from iRacing's name.
    expect(lap.channels['brakeLinePress.FL']).toBeDefined();
    expect(lap.channels.EngineWarnings[0]).toBe(7);
  });

  it('feeds the analysis like any other lap', () => {
    const laps = readIbt(makeIbt(2), 'test.ibt');
    const result = analyse(laps);
    expect(Math.abs(result.alignment.laps[1].channels.delta[100])).toBeLessThan(0.1);
  });

  it('refuses a file that is not one', () => {
    expect(() => readIbt(new ArrayBuffer(64), 'x.ibt')).toThrow(UnreadableIbt);
    expect(() => readIbt(new ArrayBuffer(4096), 'x.ibt')).toThrow(UnreadableIbt);
  });
});
