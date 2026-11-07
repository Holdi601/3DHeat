import { describe, expect, it } from 'vitest';
import { jogRate, jogStep } from './Jog';

/**
 * The jog exists because a slider's range is a display decision and the useful
 * value is not, so the tests that matter are about the ends of the range, about
 * behaving like a rate rather than a position, and about the rate band itself —
 * a nudge giving about one unit a second and a full pull about a thousand, with
 * three decades spread evenly between them.
 */

/** Integrate a held drag for `seconds` at 60fps and return where it lands. */
function hold(
  value: number,
  dy: number,
  seconds: number,
  opts: Omit<Parameters<typeof jogStep>[0], 'value' | 'dy' | 'dt'>,
) {
  const dt = 1 / 60;
  let v = value;
  for (let i = 0; i < Math.round(seconds / dt); i++) {
    v = jogStep({ ...opts, value: v, dy, dt });
  }
  return v;
}

/** Sprite radius: metres, three decades of track, a ceiling well past it. */
const METRES = { min: 0.05, max: 2000, ceiling: 50_000 };
/** Centre intensity: a small range where one unit a second would be far too fast. */
const SMALL = { min: 0, max: 10, ceiling: 1000 };
/** Just past the dead zone. */
const NUDGE = 12;
/** Across the screen. */
const FULL = 400;

describe('jogRate — the band that was asked for', () => {
  it('gives about one unit a second at a nudge, on a slider measured in metres', () => {
    const r = jogRate({ value: 1, dy: NUDGE, ...METRES });
    expect(r).toBeGreaterThan(0.5);
    expect(r).toBeLessThan(3);
  });

  it('gives about a thousand a second across the screen', () => {
    const r = jogRate({ value: 1, dy: FULL, ...METRES });
    expect(r).toBeGreaterThan(500);
    expect(r).toBeLessThan(2000);
  });

  it('spreads three decades evenly over the travel', () => {
    // The point of a logarithmic band: equal screen distances give equal ratios,
    // so the middle of the drag is the geometric middle of the range and every
    // speed has a usable stretch of screen. A linear band would put everything
    // below a hundred a second into the first tenth of the travel.
    const at = (dy: number) => jogRate({ value: 1, dy: dy, ...METRES });
    const lo = at(DEAD + SPAN * 0.25);
    const mid = at(DEAD + SPAN * 0.5);
    const hi = at(DEAD + SPAN * 0.75);
    expect(mid / lo).toBeGreaterThan((hi / mid) * 0.9);
    expect(mid / lo).toBeLessThan((hi / mid) * 1.1);
    // And the midpoint is the geometric mean of the ends, near 32 a second.
    expect(mid).toBeGreaterThan(20);
    expect(mid).toBeLessThan(50);
  });

  it('scales the band down for a value that lives between zero and one', () => {
    // One unit a second on a 0..1 opacity would cross the whole range before you
    // let go, so the band becomes a thousandth of the range to a whole range.
    const opacity = { min: 0, max: 1 };
    expect(jogRate({ value: 0.5, dy: NUDGE, ...opacity })).toBeLessThan(0.01);
    const full = jogRate({ value: 0.5, dy: FULL, ...opacity });
    expect(full).toBeGreaterThan(0.5);
    expect(full).toBeLessThan(3);
  });

  it('does not slow the nudge down just because the value is large', () => {
    // The bug this law replaced. A rate proportional to the value meant the
    // gentlest touch moved hundreds of metres a second once the radius was in
    // the thousands, which is what made a big value unadjustable.
    expect(jogRate({ value: 2000, dy: NUDGE, ...METRES })).toBeLessThan(3);
    expect(jogRate({ value: 50_000, dy: NUDGE, ...METRES })).toBeLessThan(3);
  });

  it('doubles a very large value per second on a full pull', () => {
    // Otherwise a ceiling of ten million is reachable only in principle. Past a
    // thousand the band's fast end is the value itself per second, so the rate
    // and the value coincide — one doubling a second, at any magnitude.
    expect(jogRate({ value: 1e6, dy: FULL, ...METRES })).toBeCloseTo(1e6, 3);
    expect(jogRate({ value: 1e9, dy: FULL, ...METRES })).toBeCloseTo(1e9, 0);
  });

  it('hands over from the absolute band to the doubling exactly at a thousand', () => {
    // The two ends are chosen to meet there, so there is no step in the rate as
    // the value crosses it — which there would be if the crossover were anywhere
    // else, and it would be felt as the control lurching mid-drag.
    const below = jogRate({ value: 999, dy: FULL, ...METRES });
    const above = jogRate({ value: 1001, dy: FULL, ...METRES });
    expect(below).toBeCloseTo(1000, 3);
    expect(above / below).toBeGreaterThan(0.999);
    expect(above / below).toBeLessThan(1.01);
  });

  it('is a decade slower with the fine modifier held', () => {
    const plain = jogRate({ value: 1, dy: FULL, ...METRES });
    const fine = jogRate({ value: 1, dy: FULL, ...METRES, fine: true });
    expect(fine).toBeGreaterThan(0);
    expect(fine / plain).toBeGreaterThan(0.05);
    expect(fine / plain).toBeLessThan(0.2);
  });

  it('is zero inside the dead zone', () => {
    expect(jogRate({ value: 1, dy: 0, ...METRES })).toBe(0);
    expect(jogRate({ value: 1, dy: 5, ...METRES })).toBe(0);
    expect(jogRate({ value: 1, dy: -5, ...METRES })).toBe(0);
  });

  it('is symmetric in direction — only the magnitude sets the rate', () => {
    expect(jogRate({ value: 7, dy: -FULL, ...METRES })).toBe(
      jogRate({ value: 7, dy: FULL, ...METRES }),
    );
  });
});

/** Fly speed: five decades, and fine control wanted at both ends of them. */
const SPEED = { min: 0.02, max: 20_000, ceiling: 200_000, proportional: true };

describe('jogRate — proportional, for a value where only ratios mean anything', () => {
  it('gives the same ratio per second wherever it starts', () => {
    // The property the absolute band cannot have, and the reason fly speed opts
    // in: half as fast is the operation, and it means the same thing at two
    // centimetres a second as at two kilometres.
    for (const dy of [NUDGE, 150, FULL]) {
      const slow = jogRate({ value: 0.05, dy, ...SPEED }) / 0.05;
      const fast = jogRate({ value: 2000, dy, ...SPEED }) / 2000;
      expect(slow / fast).toBeCloseTo(1, 6);
    }
  });

  it('is a small fraction of the value at a nudge', () => {
    // On the absolute band this is where fly speed broke: a nudge changed it by
    // a metre a second, which at a third of a metre a second is a tripling.
    const v = 0.35;
    expect(jogRate({ value: v, dy: NUDGE, ...SPEED })).toBeLessThan(v * 0.15);
    expect(jogRate({ value: v, dy: NUDGE, ...SPEED })).toBeGreaterThan(0);
  });

  it('crosses five decades in a few seconds of full pull', () => {
    // From a freshly framed map down to the floor. Any slower and the readout is
    // a display rather than a control.
    const landed = hold(2400, -FULL, 4, SPEED);
    expect(landed).toBe(SPEED.min);
  });

  it('never proposes a rate of zero, so a value at the floor can still rise', () => {
    // A ratio of zero is zero, so the band is anchored to `min` rather than to
    // the value when the value is at or below it.
    expect(jogRate({ value: 0, dy: FULL, ...SPEED })).toBeGreaterThan(0);
    expect(jogStep({ value: SPEED.min, dy: FULL, dt: 1 / 60, ...SPEED })).toBeGreaterThan(SPEED.min);
  });
});

/** Kept in step with the module's own constants via the observable dead zone. */
const DEAD = 7;
const SPAN = 340;

describe('jogStep — dead zone', () => {
  it('does not move on a click', () => {
    expect(jogStep({ value: 1, dy: 0, dt: 1 / 60, ...METRES })).toBe(1);
  });

  it('does not move inside the dead zone', () => {
    // Nobody holds a pointer perfectly still, and a jog that answers a 4px
    // tremor is a jog that changes the value every time it is touched.
    expect(jogStep({ value: 1, dy: 5, dt: 1 / 60, ...METRES })).toBe(1);
    expect(jogStep({ value: 1, dy: -5, dt: 1 / 60, ...METRES })).toBe(1);
  });

  it('moves just outside it', () => {
    expect(jogStep({ value: 1, dy: 30, dt: 1 / 60, ...METRES })).toBeGreaterThan(1);
  });
});

describe('jogStep — rate, not position', () => {
  it('lands in the same place at 30fps as at 60fps', () => {
    // The whole point of integrating over real time. A jog that moved per tick
    // would be twice as fast on a fast machine, and the value you get would
    // depend on what else the renderer was doing.
    let slow = 1;
    for (let i = 0; i < 30; i++) slow = jogStep({ value: slow, dy: 200, dt: 1 / 30, ...METRES });
    const fast = hold(1, 200, 1, METRES);
    expect(slow / fast).toBeGreaterThan(0.98);
    expect(slow / fast).toBeLessThan(1.02);
  });

  it('goes faster the further it is dragged', () => {
    expect(hold(1, FULL, 0.5, METRES)).toBeGreaterThan(hold(1, NUDGE, 0.5, METRES));
  });

  it('moves by roughly the rate times the time held', () => {
    // A rate control's one promise. At a nudge on a metre slider that is about
    // one unit a second, so two seconds of holding is about two units — not two
    // hundred, which is what the previous law did from a value of 1,000.
    const from = 1000;
    const moved = hold(from, NUDGE, 2, METRES) - from;
    expect(moved).toBeGreaterThan(1);
    expect(moved).toBeLessThan(6);
  });
});

describe('jogStep — direction and the off position', () => {
  it('dragging down lowers it', () => {
    expect(hold(500, -FULL, 0.5, METRES)).toBeLessThan(500);
  });

  it('snaps to the off position at the bottom of a track that has one', () => {
    const off = { ...METRES, zeroAt: 0 };
    expect(hold(0.06, -FULL, 2, off)).toBe(0);
    // …and stays there rather than going negative.
    expect(hold(0, -FULL, 2, off)).toBe(0);
  });

  it('leaves off in one step, landing on the bottom of the track', () => {
    // Not by crawling up from zero: the values between zero and the track's
    // minimum are ones the slider cannot express, so passing through them is
    // both pointless and slow.
    const off = { ...METRES, zeroAt: 0 };
    expect(jogStep({ value: 0, dy: NUDGE, dt: 1 / 60, ...off })).toBe(METRES.min);
    expect(hold(0, NUDGE, 1, off)).toBeGreaterThan(METRES.min);
  });

  it('stops at the bottom of a track with no off position', () => {
    expect(hold(0.06, -FULL, 3, METRES)).toBe(METRES.min);
  });

  it('works on a value at zero, where a factor could not', () => {
    expect(jogStep({ value: 0, dy: 200, dt: 1 / 60, ...SMALL })).toBeGreaterThan(0);
  });

  it('handles a range that starts below zero', () => {
    // Edge intensity is -2..10; the band comes from the span, not the value.
    const edge = { min: -2, max: 10, ceiling: 1000 };
    expect(hold(-2, FULL, 1, edge)).toBeGreaterThan(-2);
    expect(hold(0, -FULL, 2, edge)).toBe(-2);
  });
});

describe('jogStep — the ends of the range', () => {
  it('goes past max, up to the declared ceiling', () => {
    // The reason this control exists: a sprite radius of 2000 is where somebody
    // stopped drawing the track, not a limit on what the radius can be.
    expect(hold(1500, FULL, 3, METRES)).toBeGreaterThan(METRES.max);
    expect(hold(1, FULL, 300, METRES)).toBe(METRES.ceiling);
  });

  it('stops at max when no ceiling is declared', () => {
    // An occlusion of 1 means hidden entirely. There is nothing past it.
    expect(hold(0.5, FULL, 10, { min: 0, max: 1 })).toBe(1);
  });

  it('leaves a value already past the ceiling where it is', () => {
    // Typed entry has always accepted anything, so a value above the ceiling is
    // reachable. Grabbing the jog must not silently pull it down.
    expect(jogStep({ value: 1e6, dy: FULL, dt: 1 / 60, ...METRES })).toBe(1e6);
  });

  it('can still bring such a value back down', () => {
    expect(jogStep({ value: 1e6, dy: -FULL, dt: 1 / 60, ...METRES })).toBeLessThan(1e6);
  });

  it('never produces a value that is not a number', () => {
    // A non-finite value reaches a uniform buffer and takes the frame with it.
    for (const value of [0, 1e-9, 1e12]) {
      for (const dy of [-FULL, -30, 30, FULL]) {
        expect(Number.isFinite(jogStep({ value, dy, dt: 0.1, ...METRES }))).toBe(true);
      }
    }
  });
});
