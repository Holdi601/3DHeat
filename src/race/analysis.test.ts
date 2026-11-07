import { describe, expect, it } from 'vitest';
import { align } from './align';
import { analyse, type Analysis, type FindingKind } from './analysis';
import { envelope, flatOut } from './envelope';
import { drawnMirrored } from './handedness';
import { cornerType, insideOf, lineFor } from './line';
import type { LapTrace } from './lap';
import { findCorners } from './segments';
import { DEMO_CARS, demoTrack, syntheticLap, type Faults } from './synthetic';

const [GRIP, POWER] = DEMO_CARS;

function top(result: Analysis, lapId: string) {
  return result.findings.filter((f) => f.lapId === lapId);
}

function versus(faults: Faults, car = GRIP): { result: Analysis; lap: LapTrace } {
  const ref = syntheticLap(GRIP, {}, 'ref');
  const lap = syntheticLap(car, faults, 'lap');
  return { result: analyse([ref, lap], 'ref'), lap };
}

describe('synthetic circuit', () => {
  it('closes', () => {
    const t = demoTrack();
    expect(Math.hypot(t.x[t.length] - t.x[0], t.z[t.length] - t.z[0])).toBeLessThan(3);
    expect(t.corners).toHaveLength(4);
  });

  it('is a flying lap at the limits of the car', () => {
    const lap = syntheticLap(GRIP);
    const { speed, latAcc, longAcc } = lap.channels;
    expect(Math.abs(speed[0] - speed[lap.count - 1])).toBeLessThan(0.5);
    expect(Math.max(...Array.from(latAcc, Math.abs))).toBeCloseTo(GRIP.grip, 0);
    expect(-Math.min(...longAcc)).toBeCloseTo(GRIP.braking, 0);
  });
});

describe('align', () => {
  it('puts a lap driven to the side on the same distance axis', () => {
    const ref = syntheticLap(GRIP, {}, 'ref');
    const wide = syntheticLap(GRIP, { offset: 1.5 }, 'wide');
    const a = align(ref, [ref, wide]);
    const w = a.laps[1];
    let worst = 0;
    for (let i = w.first; i <= w.last; i++) worst = Math.max(worst, Math.abs(w.channels.delta[i]));
    // Same speeds on a line 1.5 m over: the corners are a little longer or
    // shorter, nothing more.
    expect(worst).toBeLessThan(0.15);
    const mid = Math.round(250 / 2);
    expect(w.channels.lateral[mid]).toBeCloseTo(1.5, 1);
  });

  it('does not snap a lap starting behind the line onto the finish', () => {
    const ref = syntheticLap(GRIP, {}, 'ref');
    const lap = syntheticLap(GRIP, {}, 'late');
    // Start the second lap two metres behind the line: its first samples are
    // the end of the circuit.
    const shift = (c: Float32Array) =>
      Float32Array.from(c.subarray(c.length - 3, c.length - 1)).map((v) => v) as Float32Array;
    for (const name of Object.keys(lap.channels)) {
      const c = lap.channels[name];
      lap.channels[name] = new Float32Array([...shift(c), ...c]);
    }
    lap.count += 2;
    const a = align(ref, [ref, lap]);
    const l = a.laps[1];
    expect(l.first).toBe(0);
    expect(l.last).toBeGreaterThan(a.grid.length - 5);
  });

  it('carries a lap to the ends of the grid', () => {
    const ref = syntheticLap(GRIP, {}, 'ref');
    const lap = syntheticLap(GRIP, { offset: -2 }, 'lap');
    const a = align(ref, [ref, lap]);
    expect(a.laps[1].last).toBe(a.grid.length - 1);
    expect(Math.abs(a.laps[1].channels.delta[a.grid.length - 1])).toBeLessThan(0.2);
  });
});

describe('corners', () => {
  it('finds the four corners with their apexes in the arcs', () => {
    const ref = syntheticLap(GRIP);
    const a = align(ref, [ref]);
    const corners = findCorners(a);
    expect(corners).toHaveLength(4);
    const arcs = demoTrack().corners;
    corners.forEach((c, i) => {
      expect(c.apex * 2).toBeGreaterThanOrEqual(arcs[i].start - 12);
      expect(c.apex * 2).toBeLessThanOrEqual(arcs[i].end + 12);
      expect(c.entry).toBeLessThanOrEqual(c.apex);
      expect(c.exit).toBeGreaterThanOrEqual(c.apex);
    });
  });
});

describe('envelope', () => {
  it('measures grip, braking and where power takes over from traction', () => {
    const e = envelope([syntheticLap(POWER)]);
    const grips = Array.from(e.lateral).filter(Number.isFinite);
    expect(Math.max(...grips)).toBeCloseTo(POWER.grip, 0);
    const brakes = Array.from(e.braking).filter(Number.isFinite);
    expect(Math.max(...brakes)).toBeCloseTo(POWER.braking, 0);
    // Traction runs out at power / traction: 26 m/s for the grip car, 54 for
    // the power car.
    const g = envelope([syntheticLap(GRIP)]);
    expect(g.crossover).toBeLessThan(35);
    expect(e.crossover).toBeGreaterThan(g.crossover + 10);
  });

  it('times a flat-out run', () => {
    const e = envelope([syntheticLap(GRIP)]);
    const slow = flatOut(e, 20, 300);
    const fast = flatOut(e, 30, 300);
    expect(slow).toBeGreaterThan(fast);
    expect(fast).toBeLessThan(300 / 30);
  });
});

describe('analysis', () => {
  const losses = (result: Analysis, id: string) =>
    top(result, id).filter((f) => f.outcome === 'loss');

  it('ranks nothing when the laps are the same', () => {
    const { result } = versus({});
    expect(losses(result, 'lap').filter((f) => f.cost > 0.05)).toHaveLength(0);
  });

  const cases: [string, Faults, FindingKind, number][] = [
    ['braking early', { brakeEarly: { corner: 2, metres: 40 } }, 'brakes-early', 2],
    ['braking gently', { brakeGently: { corner: 1, factor: 0.55 } }, 'brakes-gently', 1],
    ['a late throttle', { lateThrottle: { corner: 3, metres: 40 } }, 'late-throttle', 3],
    ['a slow corner', { overslow: { corner: 4, factor: 0.85 } }, 'overslows', 4],
  ];
  for (const [name, faults, kind, corner] of cases) {
    it(`finds ${name} where it is`, () => {
      const { result } = versus(faults);
      const first = losses(result, 'lap')[0];
      expect(first.kind).toBe(kind);
      expect(first.corner).toBe(corner);
      expect(first.source).toBe('driver');
      expect(first.cost).toBeGreaterThan(0.05);
    });
  }

  it('names both laps in every sentence', () => {
    const ref = syntheticLap(GRIP, {}, 'ref');
    const lap = syntheticLap(POWER, { brakeEarly: { corner: 2, metres: 40 } }, 'lap');
    const result = analyse([ref, lap], 'ref');
    const [a, b] = ['Grip car', 'Power car'];
    for (const f of result.findings) {
      const said = `${f.title} ${f.evidence} ${f.details.join(' ')} ${f.tip}`;
      expect(said).toContain(result.names.get(f.lapId)!);
      expect(said).toContain(result.names.get(f.againstId)!);
      expect(said).not.toMatch(/\bthis car\b|\bthe faster lap\b|\byou\b/);
    }
    expect([...result.names.values()].sort()).toEqual([a, b]);
  });

  it('finds a lift on the straight', () => {
    const { result } = versus({ lift: { at: 200, metres: 60 } });
    const f = losses(result, 'lap')[0];
    expect(f.kind).toBe('lifts-on-straight');
    expect(f.from * 2).toBeLessThanOrEqual(200);
  });

  it('carries the loss down the straight back to the late exit', () => {
    const { result } = versus({ lateThrottle: { corner: 3, metres: 40 } });
    const f = losses(result, 'lap')[0];
    expect(f.carried).toBeGreaterThan(0.05);
    expect(f.carried).toBeLessThanOrEqual(f.cost);
  });

  it('adds up: the corners are the lap time difference', () => {
    const { result, lap } = versus({
      brakeEarly: { corner: 1, metres: 30 },
      lateThrottle: { corner: 2, metres: 30 },
    });
    const ref = result.alignment.reference;
    const sum = result.results
      .get('lap')!
      .reduce((s, r) => s + r.net, result.start.get('lap')!);
    expect(sum).toBeCloseTo(lap.seconds - ref.seconds, 1);
    // Each corner splits into its way in and its way out, exactly.
    for (const r of result.results.get('lap')!) {
      expect(r.toApex + r.fromApex).toBeCloseTo(r.net, 6);
      expect(r.exit + r.straight).toBeCloseTo(r.fromApex, 6);
    }
    // And the losses cover nearly all of it.
    const found = losses(result, 'lap').reduce((s, f) => s + f.cost, 0);
    expect(found).toBeGreaterThan(0.8 * (lap.seconds - ref.seconds));
  });

  it('judges a corner whole: an earlier brake that buys the exit is a gain', () => {
    // Slower through the first half of the hairpin onto the long straight,
    // faster out of it.
    const { result } = versus({ lateApex: { corner: 2, entry: 0.9, exit: 1.25 } });
    const r = result.results.get('lap')![1];
    expect(r.toApex).toBeGreaterThan(0);
    expect(r.fromApex).toBeLessThan(0);
    expect(r.net).toBeLessThan(0);
    const mine = top(result, 'lap').find((f) => f.corner === 2)!;
    expect(mine.outcome).toBe('gain');
    expect(mine.kind).toBe('slow-in-fast-out');
    // Nothing tells it to brake later there.
    expect(losses(result, 'lap').some((f) => f.corner === 2)).toBe(false);
    // The reference, braking later, is the one told what it lost.
    const theirs = top(result, 'ref').find((f) => f.corner === 2)!;
    expect(theirs.outcome).toBe('loss');
    expect(theirs.kind).toBe('too-fast-in');
    // Not braking later by more than a few metres: what its exit went wrong with is the root.
    expect(theirs.cause).toBe('late-throttle');
    expect(theirs.cost).toBeCloseTo(-r.net, 6);
  });

  it('tells the car from the driver when the cars differ', () => {
    const { result } = versus({}, POWER);
    const mine = losses(result, 'lap');
    expect(mine.length).toBeGreaterThan(0);
    // The power car driven perfectly: what it loses is the car.
    const lost = mine.reduce((s, f) => s + f.cost, 0);
    const car = mine.reduce((s, f) => s + f.carCost, 0);
    expect(car / lost).toBeGreaterThan(0.8);
    expect(mine.some((f) => f.kind === 'car-grip')).toBe(true);
    // And the comparison says which line suits which.
    expect(result.cars).toHaveLength(1);
    expect(result.cars[0].advice.join(' ')).toMatch(/"U" line.*"V" line/);
    expect(result.cars[0].summary[1]).toMatch(/accelerates better, but cannot turn as hard/);
    // Each corner says what of it the cars decide: here, the middle, which no
    // braking point changes.
    const notes = mine.map((f) => f.cars ?? '').join(' ');
    expect(notes).toMatch(/less grip, about \d+ km\/h is all .* can carry on the same line/);
    expect(notes).toMatch(/braking earlier or later does not change it/);
  });

  it('puts a crash first, whatever else the corner did', () => {
    const ref = syntheticLap(GRIP, {}, 'ref');
    const lap = syntheticLap(GRIP, {}, 'lap');
    const c = lap.channels;
    // Into a wall on the second straight: half the speed gone in a sample.
    let at = 0;
    for (let i = 1, straights = 0; i < lap.count; i++) {
      if (Math.abs(c.latAcc[i]) < 0.5 && Math.abs(c.latAcc[i - 1]) >= 0.5 && ++straights === 2) {
        at = i + 80;
        break;
      }
    }
    const v0 = c.speed[at];
    for (let i = at; i < lap.count; i++) {
      const recovered = Math.min(c.speed[i], v0 * 0.4 + (c.time[i] - c.time[at]) * 5);
      if (recovered >= c.speed[i]) break;
      c.speed[i] = recovered;
    }
    for (let k = 0; k < 10; k++) c.longAcc[at + k] = -150 * Math.exp(-k / 3);
    // The clock, from the speed: a metre a sample.
    for (let i = at; i < lap.count; i++) c.time[i] = c.time[i - 1] + 2 / (c.speed[i - 1] + c.speed[i]);
    lap.seconds = c.time[lap.count - 1];
    const result = analyse([ref, lap], 'ref');
    const crash = result.control.get('lap')!.find((e) => e.kind === 'crash');
    expect(crash).toBeDefined();
    expect(crash!.impact!.direction).toBe('front');
    expect(losses(result, 'lap').some((f) => f.kind === 'incident' && /crashed head-on/.test(f.title))).toBe(true);
  });

  it('says which shape of line suits the car in each corner', () => {
    const { result } = versus({ brakeEarly: { corner: 2, metres: 40 } });
    const f = losses(result, 'lap')[0];
    expect(f.line).toMatch(/straight|corner/);
    expect(f.line).toMatch(/drove/);
  });

  it('draws a where map that sums to the delta and a why map at the causes', () => {
    const { result } = versus({ brakeEarly: { corner: 2, metres: 40 } });
    const where = result.where.get('lap')!;
    const why = result.why.get('lap')!;
    const f = losses(result, 'lap')[0];
    let peak = 0;
    for (let i = 0; i < why.length; i++) if (why[i] > why[peak]) peak = i;
    expect(peak).toBeGreaterThanOrEqual(Math.min(f.from, f.to));
    expect(peak).toBeLessThanOrEqual(Math.max(f.from, f.to));
    expect(Math.max(...Array.from(where).filter(Number.isFinite))).toBeGreaterThan(0);
  });
});

describe('handedness', () => {
  it('knows a Forza-like world comes out mirrored, and names its bends right', () => {
    const lap = syntheticLap(GRIP, { wheels: true }, 'ref');
    expect(drawnMirrored(lap)).toBe(true);
    expect(drawnMirrored(syntheticLap(GRIP, {}, 'plain'))).toBe(true);
    const result = analyse([lap, syntheticLap(GRIP, {}, 'b')], 'ref');
    expect(result.mirrored).toBe(true);
    expect(result.corners.every((c) => c.direction === 'right')).toBe(true);
  });

  it('knows a right-handed world does not', () => {
    const lap = syntheticLap(GRIP, { wheels: true }, 'ref');
    // The same lap in a world with X the other way round.
    lap.channels.x = lap.channels.x.map((v) => -v);
    expect(drawnMirrored(lap)).toBe(false);
  });
});

describe('lines', () => {
  it('measures the radius and shape of a round corner', () => {
    const ref = syntheticLap(GRIP, {}, 'ref');
    const result = analyse([ref, syntheticLap(GRIP, {}, 'b')], 'ref');
    const radii = [40, 20, 60, 30];
    result.lines.get('ref')!.forEach((l, k) => {
      expect(l).not.toBeNull();
      expect(l!.radiusMin).toBeGreaterThan(radii[k] * 0.8);
      expect(l!.radiusMin).toBeLessThan(radii[k] * 1.25);
      expect(l!.angle).toBeCloseTo(Math.PI / 2, 0);
      expect(l!.shape).not.toBe('V');
    });
  });

  it('says which lap ran inside', () => {
    const ref = syntheticLap(GRIP, {}, 'ref');
    // Offset to the left of travel: the outside of these right-handers.
    const wide = syntheticLap(GRIP, { offset: 2 }, 'wide');
    const result = analyse([ref, wide], 'ref');
    const seg = result.segments[0];
    const a = result.alignment.laps.find((l) => l.lap.id === 'wide')!;
    const b = result.alignment.laps.find((l) => l.lap.id === 'ref')!;
    const mid = Math.round((seg.window.from + seg.window.to) / 2);
    expect(insideOf(a, b, mid, seg.window)).toBeCloseTo(-2, 0);
  });

  it('types corners by what they lead onto', () => {
    expect(cornerType(100, 400)).toBe('onto-straight');
    expect(cornerType(400, 50)).toBe('after-straight');
    expect(cornerType(400, 300)).toBe('both');
    expect(cornerType(60, 50)).toBe('link');
  });

  it('suits the line to the car', () => {
    const power = lineFor('onto-straight', { powerToGrip: 0.6, aero: 1 }, 20);
    const momentum = lineFor('onto-straight', { powerToGrip: 0.2, aero: 1 }, 20);
    const aero = lineFor('onto-straight', { powerToGrip: 0.5, aero: 1.3 }, 50);
    expect(power.shape).toBe('V');
    expect(momentum.shape).toBe('U');
    expect(aero.shape).toBe('U');
    expect(lineFor('onto-straight', { powerToGrip: 0.35, aero: 1 }, 20).apex).toBe('late');
    expect(lineFor('onto-straight', { powerToGrip: 0.35, aero: 1, drivetrain: 'FWD' }, 20).text).toMatch(
      /Front-driven/,
    );
  });
});
