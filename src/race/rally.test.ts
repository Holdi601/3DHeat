/**
 * Rally: a stage is not a circuit. On gravel the slide is how a corner is
 * driven, the car is turned on the way in rather than steered round, the
 * left foot dabs the brake with the power on, and the car leaves the ground.
 * These hold the analysis to that, on stages run by a simple model.
 */
import { describe, expect, it } from 'vitest';
import { analyse, type Analysis } from './analysis';
import { deriveChannels } from './derive';
import { at, envelope } from './envelope';
import { surfaceOf } from './lap';
import { character, lineFor } from './line';
import { GRAVEL_CAR, syntheticStage, TARMAC_CAR, type StageFaults } from './synthetic';

const DEG = Math.PI / 180;

function versus(faults: StageFaults, ref: StageFaults = {}): Analysis {
  return analyse([syntheticStage(GRAVEL_CAR, ref, 'ref'), syntheticStage(GRAVEL_CAR, faults, 'lap')], 'ref');
}

function losses(result: Analysis, lapId = 'lap') {
  return result.findings.filter((f) => f.lapId === lapId && f.outcome === 'loss');
}

describe('the ground a stage was driven on', () => {
  it('is loose where the car slid through every corner at gravel grip', () => {
    expect(surfaceOf(deriveChannels(syntheticStage(GRAVEL_CAR)))).toBe('loose');
  });

  it('is tarmac where it cornered hard with a few degrees of drift', () => {
    const lap = deriveChannels(syntheticStage(TARMAC_CAR, { drift: 3 * DEG }));
    expect(surfaceOf(lap)).toBe('tarmac');
  });

  it('is what the event says when it names one', () => {
    const lap = syntheticStage(GRAVEL_CAR);
    expect(surfaceOf({ ...lap, track: 'Rally Sweden - Stage 2' })).toBe('snow');
    expect(surfaceOf({ ...lap, track: 'Croatia Rally - Stage 4' })).toBe('tarmac');
    expect(surfaceOf({ ...lap, track: 'Rallye Monte-Carlo' })).toBe('mixed');
    expect(surfaceOf({ ...lap, meta: { discipline: 'rally', surface: 'tarmac' } })).toBe('tarmac');
  });
});

describe("the car's capabilities", () => {
  it('leave out the air and the landing', () => {
    const lap = deriveChannels(syntheticStage(GRAVEL_CAR));
    const e = envelope([lap]);
    // The landing jolts the car 20 m/s² sideways and 25 back: neither is grip
    // or braking it has.
    expect(at(e.lateral, 22)).toBeLessThan(GRAVEL_CAR.grip * 1.1);
    expect(Math.max(...Array.from(e.braking).filter(Number.isFinite))).toBeLessThan(GRAVEL_CAR.braking * 1.1);
  });

  it('are kept apart for tarmac and gravel on a stage over both', () => {
    const lap = deriveChannels(syntheticStage(GRAVEL_CAR));
    const n = lap.count;
    // The first half on tarmac, where the car corners harder.
    const loose = new Float32Array(n);
    for (let i = 0; i < n; i++) loose[i] = i < n / 2 ? 0 : 1;
    lap.channels.loose = loose;
    for (let i = 0; i < n / 2; i++) lap.channels.latAcc[i] *= 1.6;
    const e = envelope([lap]);
    expect(e.ground?.tarmac).toBeDefined();
    expect(e.ground?.loose).toBeDefined();
    const grip = (v: Float32Array) => Math.max(...Array.from(v).filter(Number.isFinite));
    expect(grip(e.ground!.tarmac!.lateral)).toBeGreaterThan(1.3 * grip(e.ground!.loose!.lateral));
  });
});

describe('a stage run against another', () => {
  it('adds up, corner by corner, to the time between them', () => {
    const result = versus({ underRotate: { corner: 3, drift: 6 * DEG, metres: 30 } });
    const lap = result.alignment.laps.find((l) => l.lap.id === 'lap')!;
    const ref = result.alignment.reference;
    const sum = result.results.get('lap')!.reduce((s, r) => s + r.net, result.start.get('lap')!);
    expect(Math.abs(sum - (lap.lap.seconds - ref.seconds))).toBeLessThan(0.05);
  });

  it('is not told to brake later for a dab of the left foot', () => {
    const plain = versus({});
    const dabbed = versus({ dabs: 60 });
    const a = plain.metrics.get('lap')!;
    const b = dabbed.metrics.get('lap')!;
    expect(b.map((m) => m.brakeOn)).toEqual(a.map((m) => m.brakeOn));
    expect(losses(dabbed).some((f) => f.kind === 'brakes-early')).toBe(false);
  });

  it('says a car turned less on the way in, and waiting for the power, is the cause', () => {
    const result = versus({ underRotate: { corner: 3, drift: 6 * DEG, metres: 30 } });
    const f = losses(result).find((x) => result.segments.find((s) => s.corner === x.corner)?.corners.includes(3));
    expect(f).toBeDefined();
    expect(f!.kind).toBe('rotation');
    expect(f!.title).toContain('turned the car less');
    // The faster run had it turned well into the corner by its slowest point.
    const [theirs, mine] = f!.tip.match(/(\d+)° of drift by its slowest point against (\d+)°/)!.slice(1).map(Number);
    expect(theirs).toBeGreaterThan(mine + 8);
    expect(f!.tip).toMatch(/left-foot brake/);
    // And the faster run is told how it got there, through the other's mistake.
    const gain = result.findings.find((x) => x.lapId === 'ref' && x.corner === f!.corner);
    expect(gain?.outcome).toBe('gain');
    expect(gain?.title).toContain('turned the car less');
  });

  it('does not count sliding as a mistake when both runs slide alike', () => {
    const result = versus({ underRotate: { corner: 3, drift: 6 * DEG, metres: 30 } });
    const slides = (result.control.get('ref') ?? []).filter((e) => e.kind === 'oversteer' || e.kind === 'spin');
    expect(slides.every((e) => e.cost === 0)).toBe(true);
  });

  it('puts a longer flight down to the jump, not to contact', () => {
    const result = versus({ longJump: { metres: 40, landingLoss: 5 } });
    const jump = losses(result).find((x) => x.kind === 'jump');
    expect(jump).toBeDefined();
    expect(jump!.tip).toMatch(/keep the throttle on at take-off/);
    // What it cost is the corner's own: never more than the corner lost.
    expect(jump!.tip).toMatch(/s lost by 40 m after landing/);
    expect(result.findings.some((x) => /contact/.test(x.tip))).toBe(false);
    // The next corner, reached slower, says why.
    const arrival = losses(result).find((x) => x.kind === 'slower-arrival');
    if (arrival) expect(arrival.tip).toMatch(/longer flight/);
  });

  it('does not run a twisty section together into one long complex', () => {
    const result = analyse(
      [syntheticStage(GRAVEL_CAR, { twisty: true }, 'ref'), syntheticStage(GRAVEL_CAR, { twisty: true }, 'lap')],
      'ref',
    );
    expect(result.corners.length).toBeGreaterThanOrEqual(5);
    expect(Math.max(...result.segments.map((s) => s.corners.length))).toBeLessThanOrEqual(3);
  });
});

describe('the line on loose ground', () => {
  it('turns the car on the way in, and does not claim downforce', () => {
    const lap = deriveChannels(syntheticStage(GRAVEL_CAR));
    const e = envelope([lap]);
    const car = character(e, 20, 25, 'AWD', 'loose');
    expect(Number.isNaN(car.aero)).toBe(true);
    const advice = lineFor('onto-straight', car, 20, 'loose');
    expect(advice.text).toMatch(/turn the car on the way in/);
    expect(advice.text).not.toMatch(/downforce/);
    expect(lineFor('onto-straight', character(e, 20, 25, 'AWD'), 20).text).not.toMatch(/loose ground/);
  });
});
