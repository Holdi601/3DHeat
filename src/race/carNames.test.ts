import { describe, expect, it } from 'vitest';
import { carFromPath, nameCars } from './carNames';
import { syntheticLap, DEMO_CARS } from './synthetic';

describe('car names', () => {
  it('reads the car from the lap library folder it is in', () => {
    expect(carFromPath("Laps/Course (course_0_0_to_9_9)/A/Make Model #5 Mk II '77 (car4321)/4321-600-2-4-900-80/untagged/lap.json")).toEqual({
      name: "Make Model #5 Mk II '77",
      ordinal: 4321,
    });
    expect(carFromPath('Course (course_0_0_to_9_9)/C/car1234/1234-500/untagged/lap.json')).toEqual({ ordinal: 1234 });
    expect(carFromPath('lap.json')).toEqual({});
    // A lap's own file name is not a folder.
    expect(carFromPath("Make Model '21 (car12).json")).toEqual({});
  });

  it('names a lap by another lap in the same car', () => {
    const named = syntheticLap(DEMO_CARS[0], {}, 'a');
    const unnamed = syntheticLap(DEMO_CARS[0], {}, 'b');
    named.car = { ordinal: 42, name: "Make Model GT Coupé '21" };
    unnamed.car = { ordinal: 42 };
    const other = syntheticLap(DEMO_CARS[1], {}, 'c');
    other.car = { ordinal: 43 };
    nameCars([unnamed, named, other]);
    expect(unnamed.car.name).toBe("Make Model GT Coupé '21");
    expect(other.car.name).toBeUndefined();
  });
});
