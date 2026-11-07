import { describe, expect, it } from 'vitest';
import { readLaps, UnreadableLap } from './adapters';

describe('lap files', () => {
  it('reads a heat3d-lap recording, per-wheel channels and all', () => {
    const doc = {
      format: 'heat3d-lap',
      version: 1,
      game: 'forza-motorsport',
      track: 'Maple Valley',
      car: { carOrdinal: 12, carClass: 4, carPI: 800, drivetrain: 1 },
      lap: { number: 3, seconds: 2.5, complete: true },
      channels: {
        time: [10, 11, 12.5],
        x: [0, 10, 20],
        y: [0, 0, 0],
        z: [0, 0, 0],
        speed: [10, 10, 10],
        'tireTemp.FL': [80, 81, 82],
      },
    };
    const [lap] = readLaps(JSON.stringify(doc), 'lap.json');
    expect(lap.game).toBe('forza-motorsport');
    expect(lap.car.class).toBe('S1');
    expect(lap.car.drivetrain).toBe('RWD');
    expect(lap.seconds).toBe(2.5);
    // Time and distance from the lap's own start.
    expect(Array.from(lap.channels.time)).toEqual([0, 1, 2.5]);
    expect(lap.channels.distance[2]).toBeCloseTo(20);
    expect(lap.channels['tireTemp.FL'][2]).toBe(82);
  });

  it("reads FH Companion's lap files, byte-order mark and all", () => {
    const doc = {
      Class: 'A',
      Lap: {
        lapSeconds: 1.2,
        carOrdinal: 7,
        performanceIndex: 700,
        drivetrain: 2,
        samples: [
          {
            Seconds: 5,
            Metres: 100,
            X: 0,
            Y: 1,
            Z: 0,
            Speed: 20,
            Throttle: 1,
            Brake: 0,
            Steer: 0,
            LatG: 3,
            LongG: 1,
            Gear: 3,
          },
          {
            Seconds: 5.6,
            Metres: 105,
            X: 5,
            Y: 1,
            Z: 0,
            Speed: 21,
            Throttle: 1,
            Brake: 0,
            Steer: 0.1,
            LatG: 3,
            LongG: 1,
            Gear: 3,
          },
          {
            Seconds: 6.2,
            Metres: 110,
            X: 10,
            Y: 1,
            Z: 0,
            Speed: 22,
            Throttle: 0.5,
            Brake: 0.2,
            Steer: 0.2,
            LatG: 4,
            LongG: -2,
            Gear: 3,
          },
        ],
      },
    };
    const [lap] = readLaps('﻿' + JSON.stringify(doc), 'fh.json');
    expect(lap.game).toBe('forza-horizon');
    expect(lap.car.drivetrain).toBe('AWD');
    expect(lap.channels.time[0]).toBe(0);
    expect(lap.channels.distance[2]).toBe(10);
    expect(lap.channels.latAcc[2]).toBe(4);
  });

  it('reads a lap CSV with many laps, told apart by the lap column', () => {
    const csv = [
      'course,lap,car,car_class,pi,lap_seconds,speed_kmh,x,y,z,speed_ms,throttle,elapsed',
      'Soni,1,42,A,700,2.000,72,0,0,0,20,1,0',
      'Soni,1,42,A,700,2.000,72,20,0,0,20,1,1',
      'Soni,1,42,A,700,2.000,72,40,0,0,20,1,2',
      'Soni,2,42,A,700,1.900,72,0,0,0,21,1,0',
      'Soni,2,42,A,700,1.900,72,21,0,0,21,1,1',
      'Soni,2,42,A,700,1.900,72,40,0,0,21,1,1.9',
    ].join('\n');
    const laps = readLaps(csv, 'soni.csv');
    expect(laps).toHaveLength(2);
    expect(laps[1].seconds).toBeCloseTo(1.9);
    expect(laps[0].track).toBe('Soni');
    expect(laps[0].channels.speed[0]).toBe(20);
  });

  it('works out the speed when a source leaves it out', () => {
    const csv = ['x,y,z,time', '0,0,0,0', '10,0,0,1', '20,0,0,2'].join('\n');
    const [lap] = readLaps(csv, 'bare.csv');
    expect(lap.channels.speed[1]).toBeCloseTo(10);
  });

  it('refuses what it cannot read', () => {
    expect(() => readLaps('{"hello": 1}', 'x.json')).toThrow(UnreadableLap);
    expect(() => readLaps('{not json', 'x.json')).toThrow(UnreadableLap);
    expect(() => readLaps('a,b\n1,2\n3,4', 'x.csv')).toThrow(UnreadableLap);
  });
});
