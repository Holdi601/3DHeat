/**
 * A game that sends more telemetry shows more, without code that knows it:
 * the graphs, the cars' value tables, the input panel and the car model all
 * read the channel table, and anything not in it is still graphed and listed.
 */
import { describe, expect, it } from 'vitest';
import { align } from './align';
import { VertexBuffer } from './geometry';
import { buildCar, litLamps, wheelGlyphValues, WHEEL_GLYPHS } from './glyph';
import { defaultGraphs, GAP, graphRows, lapCatalog } from './graphs';
import { lapMotion, sampleDistances, stateAt } from './replay';
import { CHANNELS, channelCatalog, channelInfo, formatValue, GROUPS, isStepped } from './schema';
import { DEMO_CARS, syntheticLap } from './synthetic';

const [GRIP] = DEMO_CARS;
const OPTS = { scale: 1, steerSign: 1, wheelSide: 1, telemetry: true, selected: false };

describe('the channel table', () => {
  it('names a channel it has never seen, from its own name', () => {
    const info = channelInfo('diffLockLevel');
    expect(info.label).toBe('Diff lock level');
    expect(info.group).toBe('other');
    expect(info.glyph).toBeUndefined();
    expect(info.input).toBeUndefined();
    expect(formatValue(info, 0.123456)).toBe('0.12');
  });

  it('lists every channel in display order, a per-wheel one as an entry per wheel', () => {
    const catalog = channelCatalog([
      {
        time: 0,
        x: 0,
        speed: 0,
        throttle: 0,
        'rideHeight.FL': 0,
        'rideHeight.RR': 0,
        diffLockLevel: 0,
        'tireTemp.FL': 0,
      },
    ]);
    const ids = catalog.map((e) => e.id);
    // The frame is not a reading.
    expect(ids).not.toContain('time');
    expect(ids).not.toContain('x');
    // Speed first, then the inputs, the unknown last.
    expect(ids[0]).toBe('speed');
    expect(ids[1]).toBe('throttle');
    expect(ids.indexOf('speed')).toBeLessThan(ids.indexOf('tireTemp.FL'));
    expect(ids.slice(-3)).toEqual(
      expect.arrayContaining(['rideHeight.FL', 'rideHeight.RR', 'diffLockLevel']),
    );
    const ride = catalog.find((e) => e.id === 'rideHeight.RR')!;
    expect(ride.wheel).toBe('RR');
    expect(ride.label).toBe('Ride height RR');
  });

  it('is consistent: groups known, lamps and pedals named and coloured, glyphs drawable', () => {
    for (const [name, info] of Object.entries(CHANNELS)) {
      expect(GROUPS, name).toContain(info.group);
      if (info.input === 'lamp' || info.input === 'pedal') {
        expect(info.short, name).toBeTruthy();
        expect(info.lamp, name).toMatch(/^#[0-9a-f]{6}$/i);
      }
      if (info.glyph) {
        expect(info.kind, name).toBe('wheel');
        expect(WHEEL_GLYPHS[info.glyph], name).toBeTypeOf('function');
      }
    }
    expect(isStepped('gear')).toBe(true);
    expect(isStepped('rumble.FL')).toBe(true);
    expect(isStepped('speed')).toBe(false);
  });
});

describe('graphs', () => {
  function aligned(extra: Record<string, number> = {}) {
    const ref = syntheticLap(GRIP, { wheels: true }, 'ref');
    for (const [name, v] of Object.entries(extra)) {
      ref.channels[name] = new Float32Array(ref.count).fill(v);
    }
    return align(ref, [ref]).laps;
  }

  it('shows the gap and every graph channel in use, and offers the rest', () => {
    const laps = aligned({ clutch: 0, diffLockLevel: 3 });
    const ids = defaultGraphs(laps);
    expect(ids[0]).toBe(GAP);
    expect(ids).toEqual(expect.arrayContaining(['speed', 'throttle', 'brake', 'steer', 'gear']));
    // A clutch never pressed is not a graph; a channel not in the table is not
    // shown until asked for - but it is offered.
    expect(ids).not.toContain('clutch');
    expect(ids).not.toContain('diffLockLevel');
    const offered = lapCatalog(laps).map((e) => e.id);
    expect(offered).toEqual(
      expect.arrayContaining(['diffLockLevel', 'brakeTemp.FL', 'absActive', 'rpm']),
    );
  });

  it('draws any channel asked for, in the units it is read in', () => {
    const laps = aligned({ diffLockLevel: 3 });
    const rows = graphRows(
      [GAP, 'speed', 'diffLockLevel', 'brakeTemp.FL', 'nosuch'],
      lapCatalog(laps),
    );
    expect(rows.map((r) => r.key)).toEqual([GAP, 'speed', 'diffLockLevel', 'brakeTemp.FL']);
    const lap = laps[0];
    const speed = rows[1];
    expect(speed.value(lap, 100)).toBeCloseTo(lap.channels.speed[100] * 3.6, 3);
    expect(speed.format(123.4)).toBe('123 km/h');
    expect(rows[2].label).toBe('Diff lock level');
    expect(rows[2].value(lap, 10)).toBe(3);
    expect(rows[3].label).toBe('Brake temperature FL');
    expect(rows[3].format(512)).toBe('512 °C');
  });
});

describe('the car', () => {
  function state(t: number, strip: string[] = []) {
    const lap = syntheticLap(GRIP, { wheels: true }, 'lap');
    for (const name of Object.keys(lap.channels)) {
      if (strip.some((s) => name === s || name.startsWith(`${s}.`))) delete lap.channels[name];
    }
    const a = align(lap, [lap]);
    return stateAt(lapMotion(lap, sampleDistances(lap, a)), t);
  }

  it('draws each per-wheel channel the table gives a glyph', () => {
    const s = state(20);
    expect(Object.keys(wheelGlyphValues(s, 0)).sort()).toEqual([
      'brakeGlow',
      'loadBar',
      'slipRing',
      'suspensionBar',
      'tyreColour',
      'wearBand',
    ]);
    const rich = new VertexBuffer();
    buildCar(rich, s, [1, 0, 0], OPTS);
    const plain = new VertexBuffer();
    buildCar(plain, state(20, ['brakeTemp', 'tireWear', 'wheelLoad']), [1, 0, 0], OPTS);
    expect(rich.count).toBeGreaterThan(plain.count);
  });

  it('lights a roof lamp for each aid acting', () => {
    const s = state(20);
    s.values.absActive = 1;
    s.values.tcActive = 0;
    expect(litLamps(s).map((l) => l.short)).toEqual(['ABS']);
    const on = new VertexBuffer();
    buildCar(on, s, [1, 0, 0], OPTS);
    s.values.absActive = 0;
    const off = new VertexBuffer();
    buildCar(off, s, [1, 0, 0], OPTS);
    // One lamp is one box: six faces, two triangles each.
    expect(on.count - off.count).toBe(36);
  });

  it('carries every scalar it has, known or not', () => {
    const lap = syntheticLap(GRIP, { wheels: true }, 'lap');
    lap.channels.diffLockLevel = new Float32Array(lap.count).fill(2);
    const a = align(lap, [lap]);
    const s = stateAt(lapMotion(lap, sampleDistances(lap, a)), 10);
    expect(s.values.diffLockLevel).toBe(2);
    expect(s.values.brakeBias).toBeCloseTo(0.57);
    expect(s.values.time).toBeUndefined();
  });
});
