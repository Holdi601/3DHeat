import { describe, expect, it } from 'vitest';
import { readForzaTelemetry, readLaps } from './adapters';
import { analyse } from './analysis';
import { describeBasis, measureTyres, tyreCurve } from './control';
import { deriveChannels } from './derive';
import { envelope } from './envelope';
import type { LapTrace } from './lap';
import { DEMO_CARS, syntheticLap, type Faults } from './synthetic';

const [GRIP] = DEMO_CARS;

describe('reading every game the same way', () => {
  it('reads FH Companion telemetry by column name, one row per game tick', () => {
    const columns = ['t', 'metres', 'TimestampMS', 'PositionX', 'PositionY', 'PositionZ', 'Speed', 'Accel', 'Steer', 'TireTempFrontLeft', 'TireSlipRatioRearLeft', 'VelocityX', 'VelocityZ'];
    const row = (t: number, ts: number, x: number) => [t, x, ts, x, 1, 0, 20, 255, 127, 212, 0.5, 2, 20];
    const doc = {
      version: 2,
      columns,
      // The third row repeats the second but for the recorder's clock.
      data: [row(0, 100, 0), row(0.01, 116, 1), row(0.02, 116, 1), row(0.03, 132, 2), row(0.04, 148, 3)],
      car: { ordinal: 1269, name: "BMW 2002 Turbo '73", class: 'A', pi: 700 },
      track: 'Some Scramble',
      lapSeconds: 61.25,
    };
    const lap = readForzaTelemetry(doc, 'x.json.tele.gz');
    expect(lap.count).toBe(4);
    expect(lap.channels.throttle[0]).toBeCloseTo(1, 5);
    expect(lap.channels.steer[0]).toBeCloseTo(1, 5);
    // Fahrenheit to Celsius.
    expect(lap.channels['tireTemp.FL'][0]).toBeCloseTo(100, 3);
    expect(lap.channels.latVel[0]).toBe(2);
    expect(lap.car.name).toBe("BMW 2002 Turbo '73");
    expect(lap.seconds).toBe(61.25);
    expect(lap.meta?.slip).toBe('peak');
  });

  it('pairs telemetry with its lap file, the lap file naming the car when the telemetry does not', () => {
    const lapFile = {
      Course: 'c',
      Class: 'A',
      Lap: { lapSeconds: 42, carOrdinal: 7, carName: 'Some Car', drivetrain: 2, samples: [{ Metres: 0, Seconds: 0, X: 0, Y: 0, Z: 0 }, { Metres: 5, Seconds: 1, X: 5, Y: 0, Z: 0 }] },
    };
    const doc = { version: 1, columns: ['t', 'PositionX', 'PositionY', 'PositionZ'], data: [[0, 0, 0, 0], [1, 5, 0, 0], [2, 10, 0, 0]] };
    const lap = readForzaTelemetry(doc, 'x.json', lapFile);
    expect(lap.car.name).toBe('Some Car');
    expect(lap.car.drivetrain).toBe('AWD');
    expect(lap.seconds).toBe(42);
    expect(lap.count).toBe(3);
  });

  it('reads a recorder CSV with its description line and canonical columns', () => {
    const text = [
      '# {"format":"heat3d-lap-csv","game":"trackmania","track":"A01","complete":true,"seconds":24.5,"meta":{"discipline":"arcade"}}',
      'time,x,y,z,speed,longVel,latVel,throttle,brake,steer,slipIndex.FL,slipIndex.FR,slipIndex.RL,slipIndex.RR,loose,airborne',
      '0,0,0,0,30,30,0,1,0,0,0,0,0,0,0,0',
      '0.1,3,0,0,30,29,4,1,0,0.2,0,0,0.6,0.6,1,0',
      '0.2,6,0,0,30,29,4,1,1,0.2,0,0,0.6,0.6,1,0',
    ].join('\n');
    const [lap] = readLaps(text, 'run.csv');
    expect(lap.game).toBe('trackmania');
    expect(lap.meta?.discipline).toBe('arcade');
    expect(lap.seconds).toBe(24.5);
    expect(lap.channels.latVel[1]).toBe(4);
    expect(lap.channels['slipIndex.RL'][1]).toBeCloseTo(0.6, 5);
    expect(lap.channels.loose[1]).toBe(1);
  });
});

describe('deriving what a game does not send', () => {
  it('takes the drift angle from the car-frame velocity', () => {
    const lap = syntheticLap(GRIP, {}, 'a');
    const n = lap.count;
    lap.channels.longVel = Float32Array.from(lap.channels.speed);
    lap.channels.latVel = Float32Array.from(lap.channels.speed, (v) => v * Math.tan(0.2));
    deriveChannels(lap);
    expect(lap.channels.bodySlip[Math.floor(n / 2)]).toBeCloseTo(0.2, 4);
  });

  it('takes slip from the wheels turning against the car moving', () => {
    const lap = syntheticLap(GRIP, {}, 'a');
    for (const w of ['FL', 'FR', 'RL', 'RR']) {
      lap.channels[`wheelSurfaceSpeed.${w}`] = Float32Array.from(lap.channels.speed, (v) => (w[0] === 'R' ? v * 1.1 : v));
    }
    deriveChannels(lap);
    const mid = Math.floor(lap.count / 2);
    expect(lap.channels['slipRatio.RL'][mid]).toBeCloseTo(0.1, 4);
    expect(lap.channels['slipRatio.FL'][mid]).toBeCloseTo(0, 4);
    expect(lap.meta?.slip).toBe('physical');
  });

  it('knows the car is in the air when no wheel touches', () => {
    const lap = syntheticLap(GRIP, {}, 'a');
    for (const w of ['FL', 'FR', 'RL', 'RR']) {
      lap.channels[`groundContact.${w}`] = Float32Array.from(lap.channels.speed, (_, i) => (i >= 100 && i < 130 ? 0 : 1));
    }
    deriveChannels(lap);
    expect(lap.channels.airborne[110]).toBe(1);
    expect(lap.channels.airborne[90]).toBe(0);
  });
});

describe('where grip ends, measured', () => {
  it('finds the slip past which the force falls away', () => {
    const x: number[] = [];
    const y: number[] = [];
    for (let i = 0; i < 2000; i++) {
      const s = (i / 2000) * 3;
      x.push(s);
      // Rises to its best at 1, holds, then falls 30% by 3.
      y.push(s < 1 ? 20 * s : s < 1.5 ? 20 : 20 * (1 - 0.2 * (s - 1.5)));
    }
    const curve = tyreCurve(x, y);
    expect(curve.measured).toBe(true);
    expect(curve.best).toBeGreaterThan(0.9);
    expect(curve.best).toBeLessThan(1.6);
    expect(curve.limit).toBeGreaterThan(1.6);
    expect(curve.limit).toBeLessThan(2.1);
  });

  it('gives no limit when the force never falls', () => {
    const x = Array.from({ length: 500 }, (_, i) => i / 100);
    const y = x.map((s) => Math.min(20, 20 * s));
    expect(tyreCurve(x, y).limit).toBe(Number.POSITIVE_INFINITY);
  });

  it('measures a car from its own laps', () => {
    const laps = [syntheticLap(GRIP, { wheels: true }, 'a')];
    laps[0].meta = { slip: 'peak' };
    const tyres = measureTyres(laps, envelope(laps));
    expect(tyres.tarmac.braking.samples).toBeGreaterThan(0);
  });
});

/** A pair of synthetic laps: a clean reference and one with `faults`, then `edit` on each. */
function pair(faults: Faults, edit: (lap: LapTrace, own: boolean) => void, surface?: 'loose') {
  const ref = syntheticLap(GRIP, { wheels: true }, 'ref');
  const lap = syntheticLap(GRIP, { wheels: true, ...faults }, 'lap');
  for (const l of [ref, lap]) {
    l.meta = { slip: 'peak', surface };
    l.channels.longVel = Float32Array.from(l.channels.speed);
    l.channels.latVel = new Float32Array(l.count);
    edit(l, l === lap);
  }
  return analyse([ref, lap], 'ref');
}

/** Metres along the demo circuit where a corner's arc runs. */
function arc(lap: LapTrace, from: number, to: number, set: (i: number) => void) {
  for (let i = 0; i < lap.count; i++) if (lap.channels.distance[i] >= from && lap.channels.distance[i] <= to) set(i);
}

describe('car control', () => {
  it('finds a lock-up the other lap did not have, and blames the corner on it', () => {
    // Braking gently into T2 (planted), with the fronts locked while it does.
    const result = pair({ brakeGently: { corner: 2, factor: 0.6 } }, (l, own) => {
      if (!own) return;
      const b = l.channels.brake;
      for (let i = 0; i < l.count; i++) {
        if (b[i] > 0.1 && l.channels.distance[i] > 700 && l.channels.distance[i] < 820) {
          l.channels['slipRatio.FL'][i] = -3;
          l.channels['slipRatio.FR'][i] = -3;
        }
      }
    });
    // Both laps brake at the edge of grip everywhere; only the planted lock
    // is this lap's alone.
    const mine = result.control.get('lap')!.filter((e) => e.kind === 'lock' && !e.shared);
    expect(mine).toHaveLength(1);
    expect(mine[0].wheels).toEqual(['FL', 'FR']);
    expect(mine[0].peak).toBeCloseTo(-3, 5);
    expect(mine[0].cost).toBeGreaterThan(0.05);
    expect(mine[0].from * 2).toBeGreaterThanOrEqual(700);
    const f = result.findings.find((x) => x.lapId === 'lap' && x.corner === 2 && x.outcome === 'loss')!;
    expect(f.kind).toBe('locks');
    const said = `${f.title} ${f.tip}`;
    expect(said).toContain(result.names.get('lap')!);
    expect(said).toContain(result.names.get('ref')!);
  });

  it('calls a slide both laps made technique, not a mistake', () => {
    const slide = (l: LapTrace) => arc(l, 1040, 1080, (i) => (l.channels.latVel[i] = l.channels.speed[i] * Math.tan((20 * Math.PI) / 180)));
    const result = pair({}, (l) => slide(l));
    const slides = result.control.get('lap')!.filter((e) => e.kind === 'oversteer');
    expect(slides.length).toBeGreaterThan(0);
    expect(slides.every((e) => e.shared)).toBe(true);
    expect(result.findings.some((f) => f.lapId === 'lap' && f.kind === 'oversteer')).toBe(false);
  });

  it('finds a slide only one lap made, and what it cost', () => {
    const result = pair({ lateThrottle: { corner: 3, metres: 40 } }, (l, own) => {
      if (own) arc(l, 1300, 1400, (i) => (l.channels.latVel[i] = l.channels.speed[i] * Math.tan((25 * Math.PI) / 180)));
    });
    const slides = result.control.get('lap')!.filter((e) => e.kind === 'oversteer');
    expect(slides.length).toBeGreaterThan(0);
    expect(slides[0].shared).toBe(false);
    expect(slides[0].peak).toBeCloseTo((25 * Math.PI) / 180, 2);
  });

  it('lets a car slide more on loose ground before it counts', () => {
    // 12 degrees: a slide on tarmac, cornering on gravel.
    const make = (surface?: 'loose') =>
      pair({}, (l, own) => {
        if (own) arc(l, 1300, 1400, (i) => (l.channels.latVel[i] = l.channels.speed[i] * Math.tan((12 * Math.PI) / 180)));
      }, surface);
    const tarmac = make().control.get('lap')!.filter((e) => e.kind === 'oversteer');
    const loose = make('loose').control.get('lap')!.filter((e) => e.kind === 'oversteer');
    expect(tarmac.length).toBeGreaterThan(0);
    expect(loose.length).toBe(0);
  });

  it('sums a lap, naming what it could see with', () => {
    const result = pair({}, () => {});
    const s = result.controlSummary.get('lap')!;
    expect(s.basis.slip).toBe(true);
    expect(s.basis.drift).toBe(true);
    expect(s.surface).toBe('tarmac');
  });

  it('says what is still found without tyre slip or a drift angle', () => {
    // An FH Companion lap file alone: the steering, no slip, no heading.
    const result = pair({}, (l) => {
      for (const name of Object.keys(l.channels)) {
        const tyres = /^(slip|wheelSpeed|tireTemp|suspension|combinedSlip)/.test(name);
        if (tyres || ['latVel', 'longVel', 'bodySlip', 'yaw', 'yawRate'].includes(name)) delete l.channels[name];
      }
    });
    const s = result.controlSummary.get('lap')!;
    expect(s.basis).toMatchObject({ slip: false, drift: false, steer: true });
    const sentence = describeBasis(s.basis);
    expect(sentence).toMatch(/pushes, from the steering/);
    expect(sentence).not.toMatch(/yaw rate/);
    expect(describeBasis({ ...s.basis, steer: true, yaw: true })).toMatch(/pushes.*slides, from the yaw rate.*hits/);
    expect(describeBasis({ ...s.basis, steer: false, yaw: false })).toMatch(/Still found: hits and crashes/);
  });
});
