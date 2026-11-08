import { describe, expect, it } from 'vitest';
import { convert, convertTo, formatDistance, formatIn, formatLength, formatLong, niceDistance, unitSymbol } from './format';
import {
  FT,
  NM,
  PRESET_UNITS,
  readUnitSettings,
  resolveUnits,
  toAngle,
  toMass,
  toPressure,
  toSpeed,
  toTemperature,
  toVolume,
  toVSpeed,
  fromSpeed,
  fromTemperature,
} from './units';
import { unitTicks } from '../ui/replay/charts';
import { statsCsv, telemetryCsv } from '../ui/replay/stats';

const metric = PRESET_UNITS.metric;
const imperial = PRESET_UNITS.imperial;
const aviation = PRESET_UNITS.aviation;
const nautical = PRESET_UNITS.nautical;

describe('unit conversions', () => {
  it('converts by the exact definitions', () => {
    expect(toSpeed(100, 'kmh')).toBeCloseTo(360);
    expect(toSpeed(100, 'kt')).toBeCloseTo(194.384, 3);
    expect(toSpeed(100, 'mph')).toBeCloseTo(223.694, 3);
    expect(toSpeed(100, 'ms')).toBe(100);
    expect(fromSpeed(toSpeed(37, 'kt'), 'kt')).toBeCloseTo(37);
    expect(toVSpeed(5.08, 'fpm')).toBeCloseTo(1000, 6);
    expect(toVSpeed(2, 'mmin')).toBe(120);
    expect(toTemperature(100, 'f')).toBeCloseTo(212);
    expect(toTemperature(-40, 'f')).toBeCloseTo(-40);
    expect(toTemperature(0, 'k')).toBeCloseTo(273.15);
    expect(fromTemperature(toTemperature(21.5, 'f'), 'f')).toBeCloseTo(21.5);
    expect(toPressure(101325, 'hpa')).toBeCloseTo(1013.25);
    expect(toPressure(101325, 'inhg')).toBeCloseTo(29.92, 2);
    expect(toPressure(101325, 'mmhg')).toBeCloseTo(760, 1);
    expect(toPressure(101325, 'psi')).toBeCloseTo(14.696, 3);
    expect(toMass(1000, 'lb')).toBeCloseTo(2204.62, 2);
    expect(toMass(1500, 't')).toBe(1.5);
    expect(toVolume(3.785411784, 'lb')).toBeCloseTo(1);
    expect(toAngle(90, 'mil')).toBeCloseTo(1600);
    expect(toAngle(90, 'deg')).toBe(90);
  });

  it('resolves a preset with the quantities set apart from it', () => {
    expect(resolveUnits({ preset: 'aviation', overrides: {} })).toEqual(aviation);
    const own = resolveUnits({ preset: 'metric', overrides: { speed: 'kt', angle: 'mil' } });
    expect(own.speed).toBe('kt');
    expect(own.angle).toBe('mil');
    expect(own.altitude).toBe('m');
  });

  it('reads kept settings, dropping what it does not know', () => {
    expect(readUnitSettings(null)).toEqual({ preset: 'metric', overrides: {} });
    expect(readUnitSettings({ preset: 'nautical', overrides: { speed: 'mph', altitude: 'furlong', bogus: 'x' } })).toEqual({
      preset: 'nautical',
      overrides: { speed: 'mph' },
    });
    expect(readUnitSettings({ preset: 'cubits' }).preset).toBe('metric');
  });
});

describe('formatting in the viewer units', () => {
  it('writes each preset', () => {
    expect(formatIn('altitude', 1000, metric)).toBe('1000 m');
    expect(formatIn('altitude', 1000, imperial)).toBe('3281 ft');
    expect(formatIn('speed', 100, metric)).toBe('360 km/h');
    expect(formatIn('speed', 100, imperial)).toBe('224 mph');
    expect(formatIn('speed', 100, aviation)).toBe('194 kt');
    expect(formatIn('speed', 100, nautical)).toBe('194 kt');
    expect(formatIn('vspeed', 5.08, aviation)).toBe('1000 ft/min');
    expect(formatIn('vspeed', 2.5, metric)).toBe('2.5 m/s');
    expect(formatIn('temperature', 20, imperial)).toBe('68 °F');
    expect(formatIn('temperature', 20, metric)).toBe('20 °C');
    expect(formatIn('pressure', 101325, imperial)).toBe('29.92 inHg');
    expect(formatIn('pressure', 101325, metric)).toBe('1013 hPa');
    expect(formatIn('mass', 1000, imperial)).toBe('2205 lb');
    expect(formatIn('mass', 1500, nautical)).toBe('1.50 t');
    expect(formatIn('volume', 100, imperial)).toBe('26 gal');
  });

  it('picks the short or long unit of a distance by its size', () => {
    expect(formatDistance(500, metric)).toBe('500 m');
    expect(formatDistance(12000, metric)).toBe('12.0 km');
    expect(formatDistance(500, aviation)).toBe('1640 ft');
    expect(formatDistance(2 * NM, aviation)).toBe('2.0 NM');
    expect(formatDistance(2 * NM, nautical)).toBe('2.0 NM');
    expect(formatDistance(500, nautical)).toBe('500 m');
    expect(formatDistance(3218.688, imperial)).toBe('2.0 mi');
    expect(formatLong(1500, metric, 1)).toBe('1.5 km');
    expect(formatLength(2, imperial, 1)).toBe('6.6 ft');
  });

  it('writes headings in degrees or mils', () => {
    expect(formatIn('heading', 5, metric)).toBe('005°');
    expect(formatIn('heading', -90, metric)).toBe('270°');
    const mil = resolveUnits({ preset: 'metric', overrides: { angle: 'mil' } });
    expect(formatIn('heading', 90, mil)).toBe('1600 mil');
    expect(formatIn('heading', 359.99, mil)).toBe('0000 mil');
    expect(formatIn('angle', 45, mil)).toBe('800 mil');
    expect(formatIn('rate', 3, mil)).toBe('53 mil/s');
  });

  it('names units for axes and column heads', () => {
    expect(unitSymbol('altitude', aviation)).toBe('ft');
    expect(unitSymbol('speed', metric)).toBe('km/h');
    expect(unitSymbol('distance', aviation, true)).toBe('NM');
    expect(convertTo('distance', NM, aviation, true)).toBeCloseTo(1);
    expect(convertTo('distance', FT, aviation)).toBeCloseTo(1);
    expect(convert('temperature', 0, imperial)).toEqual({ v: 32, unit: 'f' });
  });

  it('makes scale steps round in the unit shown', () => {
    expect(niceDistance(7300, metric).metres).toBe(5000);
    expect(niceDistance(5000, aviation).metres).toBeCloseTo(2 * NM);
    expect(niceDistance(5000, aviation).text).toBe('2 NM');
    expect(niceDistance(400, aviation).metres).toBeCloseTo(1000 * FT);
  });
});

describe('charts and exports in the viewer units', () => {
  it('ticks charts at round values in the unit shown', () => {
    const ft = unitTicks(0, 3000, 5, 'altitude', aviation).map((v) => Math.round(v / FT));
    expect(ft.every((v) => v % 1000 === 0 || v % 500 === 0)).toBe(true);
    expect(unitTicks(0, 1000, 5, 'altitude', metric)).toEqual([0, 200, 400, 600, 800, 1000]);
    const nm = unitTicks(0, 10 * NM, 5, 'distance', aviation).map((v) => v / NM);
    expect(nm).toEqual([0, 2, 4, 6, 8, 10].map((x) => expect.closeTo(x, 9)) as unknown as number[]);
  });

  it('heads exported columns with their units and converts the values', () => {
    const stats = {
      units: [
        {
          name: 'A',
          vehicle: 'F-16',
          team: -1,
          kind: 'player',
          category: 'air',
          lives: 1,
          kills: 0,
          deaths: 0,
          shots: 0,
          hits: 0,
          hitsTaken: 0,
          hitRatio: NaN,
          takeoffs: 0,
          landings: 0,
          airborne: 0,
          groundFrom: 'data',
          maxG: 1,
          minG: 1,
          maxSpeed: 100,
          maxAlt: 1000,
          maxMach: 0.3,
          distance: NM,
          first: 0,
          last: 10,
        },
      ],
    } as unknown as Parameters<typeof statsCsv>[0];
    const si = statsCsv(stats, () => '').split('\n');
    expect(si[0]).toContain('max_speed_ms');
    const av = statsCsv(stats, () => '', aviation).split('\n');
    expect(av[0]).toContain('max_speed_kt');
    expect(av[0]).toContain('max_alt_ft');
    expect(av[0]).toContain('distance_nm');
    expect(av[1]).toContain(',194.384,3280.84,0.3,1,');
    const s = { time: new Float32Array([0, 1]), x: new Float32Array([0, FT]), y: new Float32Array([0, 0]), z: new Float32Array([0, 0]), values: { alt: new Float32Array([0, 1000]) } };
    const csv = telemetryCsv([{ name: 'U', s: s as never }], ['alt'], 1, aviation).split('\n');
    expect(csv[0]).toBe('time_s,unit,x_ft,y_ft,z_ft,alt_ft');
    expect(csv[2]).toBe('1,U,1,0,0,3280.84');
  });
});

describe('units inside sentences', () => {
  it('says the race analysis in the viewer units, unit words and all', async () => {
    const { t } = await import('../i18n');
    const { useUnitsStore, speedArg, lengthArg } = await import('../state/unitsStore');
    const say = () =>
      t('race.cause.nearStopTip', { me: 'A', them: 'B', mine: speedArg(10), theirs: speedArg(30), at: lengthArg(1200) });
    useUnitsStore.getState().setPreset('metric');
    const metric = say();
    expect(metric).toContain('36 km/h');
    expect(metric).toContain('1200 m');
    expect(metric).not.toContain('\u2063');
    useUnitsStore.getState().setPreset('imperial');
    const imp = say();
    expect(imp).toContain('22 mph');
    expect(imp).toContain('67 mph');
    expect(imp).toContain('3937 ft');
    expect(imp).not.toContain('km/h');
    // A number with no unit word right after it is converted all the same.
    const range = t('race.event.hit.detail', { from: lengthArg(100), to: lengthArg(200), before: speedArg(50), after: speedArg(20), seconds: '0.5', g: 'none', grip: '1' });
    expect(range).toContain('328-656 ft');
    expect(range).toContain('from 112 down to 45 mph');
    useUnitsStore.getState().setPreset('metric');
  });
});
