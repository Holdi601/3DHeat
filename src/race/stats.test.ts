import { describe, expect, it } from 'vitest';
import { analyse } from './analysis';
import { courseFromPath } from './carNames';
import { buildCar } from './glyph';
import { VertexBuffer } from './geometry';
import type { LapTrace } from './lap';
import { lapMotion, sampleDistances, stateAt } from './replay';
import { classesOf, courseStats, lapsIn, mistakeDensity, mistakeOf, mistakeTable } from './stats';
import { DEMO_CARS, syntheticLap, type Faults } from './synthetic';
import { SHOW_ALL_UP_TO, useRaceStore } from '../state/raceStore';

const [GRIP, POWER] = DEMO_CARS;

function lap(car: typeof GRIP, cls: string, faults: Faults, id: string): LapTrace {
  const l = syntheticLap(car, faults, id);
  l.car = { ...l.car, class: cls };
  return l;
}

/**
 * Eight laps in two classes: in A, a clean one, three braking 40 m early into
 * corner 2 and two late on the throttle out of corner 3; in B - another car -
 * a clean one and one braking early into corner 2.
 */
function field(): LapTrace[] {
  return [
    lap(GRIP, 'A', {}, 'a-clean'),
    lap(GRIP, 'A', { brakeEarly: { corner: 2, metres: 40 } }, 'a-early-1'),
    lap(GRIP, 'A', { brakeEarly: { corner: 2, metres: 40 } }, 'a-early-2'),
    lap(GRIP, 'A', { brakeEarly: { corner: 2, metres: 40 } }, 'a-early-3'),
    lap(GRIP, 'A', { lateThrottle: { corner: 3, metres: 40 } }, 'a-late-1'),
    lap(GRIP, 'A', { lateThrottle: { corner: 3, metres: 40 } }, 'a-late-2'),
    lap(POWER, 'B', {}, 'b-clean'),
    lap(POWER, 'B', { brakeEarly: { corner: 2, metres: 40 } }, 'b-early'),
  ];
}

describe('many laps', () => {
  const a = analyse(field());
  const segmentOf = (corner: number) => a.segments.findIndex((s) => s.corners.includes(corner));

  it('compares each lap with the best of its own class', () => {
    expect(Object.fromEntries(a.classBest)).toEqual({ A: 'a-clean', B: 'b-clean' });
    // The B lap's mistake is measured against the clean B lap, not the A reference.
    const f = a.findings.find((x) => x.lapId === 'b-early' && x.outcome === 'loss')!;
    expect(f.againstId).toBe('b-clean');
    expect(f.kind).toBe('brakes-early');
    expect(classesOf(a)).toEqual([
      ['B', 2],
      ['A', 6],
    ]);
  });

  it('counts, corner by corner, how many of the laps made which mistake', () => {
    const stats = courseStats(a, lapsIn(a, null));
    expect(stats.laps).toBe(8);
    expect(stats.cars).toBe(2);
    const t2 = stats.corners[segmentOf(2)];
    const early = t2.mistakes.find((m) => m.mistake === 'brake-early')!;
    expect(early.laps.map((o) => o.lapId).sort()).toEqual(['a-early-1', 'a-early-2', 'a-early-3', 'b-early']);
    expect(early.cars).toBe(2);
    expect(early.cost).toBeGreaterThan(0);
    const t3 = stats.corners[segmentOf(3)];
    expect(t3.mistakes.find((m) => m.mistake === 'late-throttle')!.laps.map((o) => o.lapId).sort()).toEqual(['a-late-1', 'a-late-2']);
    // Over the course: the most common first.
    expect(stats.mistakes[0].mistake).toBe('brake-early');
    expect(stats.mistakes[0].laps).toBe(4);
    expect(stats.mistakes[0].corners[0]).toEqual([segmentOf(2), 4]);
    // One class alone.
    const b = courseStats(a, lapsIn(a, ['B']));
    expect(b.laps).toBe(2);
    expect(b.mistakes.map((m) => [m.mistake, m.laps])).toEqual([['brake-early', 1]]);
  });

  it('counts a fast or slow entry as the mistake that caused it', () => {
    expect(mistakeOf({ kind: 'too-slow-in', cause: 'brakes-early' })).toBe('brake-early');
    expect(mistakeOf({ kind: 'too-slow-in', cause: 'locks' })).toBe('lock');
    expect(mistakeOf({ kind: 'too-slow-in', cause: 'coasts' })).toBe('coast');
    expect(mistakeOf({ kind: 'too-slow-in', cause: 'overslows' })).toBe('slow-middle');
    expect(mistakeOf({ kind: 'too-fast-in', cause: 'too-fast-in' })).toBe('brake-late');
    expect(mistakeOf({ kind: 'too-fast-in', cause: 'wheelspin' })).toBe('wheelspin');
    expect(mistakeOf({ kind: 'too-fast-in', cause: 'late-throttle' })).toBe('late-throttle');
    // Not the driver's: the car's grip, an arrival slowed by the corner before.
    expect(mistakeOf({ kind: 'too-slow-in', cause: 'car-grip' })).toBeUndefined();
    expect(mistakeOf({ kind: 'too-slow-in', cause: 'slower-arrival' })).toBeUndefined();
    expect(mistakeOf({ kind: 'brakes-early' })).toBe('brake-early');
    // On laps: braking early into a corner that the exit only half wins back
    // is braking early; the other lap, braking later and slower out, braked too late.
    const ref = syntheticLap(GRIP, {}, 'ref');
    const slowIn = syntheticLap(GRIP, { brakeEarly: { corner: 2, metres: 40 }, lateApex: { corner: 2, entry: 1, exit: 1.1 } }, 'slow-in');
    const lateApex = syntheticLap(GRIP, { brakeEarly: { corner: 3, metres: 15 }, lateApex: { corner: 3, entry: 1, exit: 1.3 } }, 'late-apex');
    const two = analyse([ref, slowIn], 'ref');
    expect(two.findings.find((f) => f.lapId === 'slow-in' && f.corner === 2)!.kind).toBe('too-slow-in');
    const t2 = courseStats(two, lapsIn(two, null)).corners[two.segments.findIndex((s) => s.corners.includes(2))];
    expect(t2.mistakes.map((m) => m.mistake)).toEqual(['brake-early']);
    const other = analyse([ref, lateApex], 'ref');
    expect(other.findings.find((f) => f.lapId === 'ref' && f.corner === 3)!.kind).toBe('too-fast-in');
    const t3 = courseStats(other, lapsIn(other, null)).corners[other.segments.findIndex((s) => s.corners.includes(3))];
    expect(t3.mistakes.map((m) => [m.mistake, m.laps.map((o) => o.lapId)])).toEqual([['brake-late', ['ref']]]);
  });

  it('maps where they were made, and hands them to the heatmap', () => {
    const all = lapsIn(a, null);
    const density = mistakeDensity(a, all, 'brake-early');
    const seg = a.segments[segmentOf(2)];
    let inside = 0;
    for (let i = seg.start; i <= seg.end; i++) inside = Math.max(inside, density[i]);
    expect(inside).toBe(4);
    const far = a.segments[segmentOf(4)];
    for (let i = far.window.from; i <= far.window.to; i++) expect(density[i]).toBe(0);
    const table = mistakeTable(a, all).split('\n');
    expect(table[0]).toBe('x,y,z,elapsed,lap,car,mistake,car_class,corner,cost');
    expect(table.length).toBeGreaterThan(20);
    expect(table.some((r) => r.includes('"Braked too early","B"'))).toBe(true);
  });

  it('shows only the laps that matter once there are many', () => {
    const store = useRaceStore.getState();
    store.clearLaps();
    const laps = [...field(), lap(GRIP, 'A', { lateThrottle: { corner: 1, metres: 30 } }, 'a-late-3')];
    expect(laps.length).toBeGreaterThan(SHOW_ALL_UP_TO);
    store.addLaps(laps);
    const s = useRaceStore.getState();
    const drawn = s.laps.filter((l) => !s.hidden[l.id]).map((l) => l.id);
    expect(drawn).toContain(s.analysis!.alignment.reference.id);
    expect(drawn).toContain(s.focusId);
    expect(drawn.length).toBeLessThanOrEqual(3);
    // Looking at a lap draws it, and the best of its class.
    s.setFocus('b-early');
    const t = useRaceStore.getState();
    expect(t.hidden['b-early']).toBe(false);
    expect(t.hidden['b-clean']).toBe(false);
    t.showLaps(true);
    expect(Object.values(useRaceStore.getState().hidden).every((h) => !h)).toBe(true);
    store.clearLaps();
  });
});

describe('the lap library', () => {
  it('tells which course a lap is in from its folders', () => {
    expect(courseFromPath('laps/Some Course (course_1_2_to_3_4)/A/Car (car12)/t/untagged/lap.json')).toEqual({
      key: 'Some Course|1_2',
      name: 'Some Course',
    });
    // A run that stopped before the finish is kept with where it stopped as its end: the same course.
    expect(courseFromPath('laps/unfinished/Some Course (course_1_2_to_9_-9)/A/Car (car12)/t/untagged/lap.json')!.key).toBe(
      'Some Course|1_2',
    );
    expect(courseFromPath('course_-5_6_to_-5_6/B/car9/t/untagged/lap.json')).toEqual({
      key: 'course_-5_6_to_-5_6|-5_6',
      name: 'course_-5_6_to_-5_6',
    });
    expect(courseFromPath('lap.json')).toBeNull();
  });
});

describe('a crowd of cars', () => {
  it('draws the cars nobody is looking at plainer, still on the road', () => {
    const l = syntheticLap(GRIP, { wheels: true }, 'c');
    const a = analyse([l, syntheticLap(GRIP, {}, 'd')]);
    const m = lapMotion(l, sampleDistances(l, a.alignment));
    const s = stateAt(m, 20);
    const opts = { scale: 1, steerSign: 1, wheelSide: 1, telemetry: true, selected: false };
    const full = new VertexBuffer();
    buildCar(full, s, [1, 0, 0], opts);
    const plain = new VertexBuffer();
    buildCar(plain, s, [1, 0, 0], { ...opts, detail: 'plain' });
    expect(plain.count).toBeLessThan(full.count / 3);
    let minY = Infinity;
    for (let i = 0; i < plain.count; i++) {
      minY = Math.min(minY, plain.data[i * 7 + 1]);
      expect(Math.hypot(plain.data[i * 7] - s.x, plain.data[i * 7 + 2] - s.z)).toBeLessThan(4);
    }
    expect(minY).toBeLessThan(s.y);
  });
});
