import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { t } from '../i18n';

/**
 * Drag up or down to change a value continuously; further is faster.
 *
 * A slider maps a *position* to a value, so its usefulness is bounded by its
 * track: a sprite radius that wants 10m today and 400m tomorrow needs a range
 * covering both, and then a thousandth of the track is the part anyone uses.
 * Widening the range makes the useful part unusable; narrowing it sends you to
 * the number box, which means stopping, typing, and losing sight of what the
 * change did.
 *
 * This maps a position to a *rate* instead, which is what makes the range
 * irrelevant. Hold and drag a little for a slow change, further for a fast one,
 * release to stop. The value is integrated over real time, so the same drag
 * behaves the same on a slow frame, and there is no upper bound to run into
 * except the one the caller declares.
 *
 * **The drag is logarithmic in the rate, not in the value.** A nudge past the
 * dead zone gives about one unit per second; a pull across the screen gives
 * about a thousand. Three decades between them, spread evenly over the travel,
 * so every speed in between has a comfortable stretch of screen to itself.
 *
 * That it is the *rate* which is logarithmic is the whole trick, and the first
 * version got it wrong by scaling the rate with the value instead: at a radius
 * of 2,000 the gentlest touch still moved hundreds of metres a second, because a
 * fixed *factor* per second is an enormous absolute step once the value is
 * large. Anchoring the slow end to an absolute unit is what makes a big value
 * adjustable rather than merely reachable.
 *
 * The fast end still scales with the value, which costs nothing at ordinary
 * magnitudes and is what keeps a value in the millions from taking an hour to
 * move. See `jogRate`.
 *
 * A handful of settings want ratios at *both* ends instead — fly speed above
 * all, whose useful values run from a fiftieth of a metre a second to thousands
 * — and opt in with `proportional`.
 */
export function Jog(props: JogSpec & { label: string }) {
  const { active, offset, handlers } = useJogDrag(props);
  return (
    <div
      className={`jog${active ? ' active' : ''}`}
      // Labelled but given no role. It is a pointer-only affordance for a value
      // the range input beside it already exposes properly — keyboard, arrow
      // keys and all — so claiming `role="slider"` here would announce a second
      // control for the same number that cannot be operated without a mouse.
      aria-label={t('ui.jog.ariaLabel', { label: props.label })}
      aria-hidden="true"
      title={
        props.ceiling !== undefined
          ? t('ui.jog.title', { label: props.label })
          : `${t('ui.jog.title', { label: props.label })} ${t('ui.jog.limited')}`
      }
      {...handlers}
    >
      <span className="grip" style={{ transform: `translateY(${-offset * 6}px)` }} />
    </div>
  );
}

export interface JogSpec {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  /**
   * How far above `max` the jog may push the value. Absent means `max` is a real
   * limit.
   *
   * Explicit rather than assumed, because the two kinds of maximum look
   * identical in a slider's props and behave nothing alike. An opacity's 1 is the
   * value at which a surface is opaque; a sprite radius's 200 is where somebody
   * stopped drawing the track. Pushing the first past its end is meaningless and
   * pushing the second is the entire point of this control.
   */
  ceiling?: number;
  /**
   * The value the bottom of the track means "off", where it has one. Reached by
   * dragging below the track's minimum, and left again in one step rather than
   * by crawling up through values the track cannot express.
   */
  zeroAt?: number;
  /**
   * Change the value by a *ratio* per second rather than by an amount.
   *
   * For quantities where only ratios mean anything, and where the useful values
   * span several decades with fine control needed at both ends. Fly speed is the
   * case: a doorway is inspected at a twentieth of a metre a second and a map is
   * crossed at thousands, and "one metre per second slower" is meaningless at
   * one end and imperceptible at the other. Half as fast is the operation people
   * actually want.
   *
   * Not the default, and deliberately not the same thing as a `logarithmic`
   * slider. A sprite radius is drawn on a log track too, but its complaint was
   * the opposite one — a rate proportional to the value meant a nudge moved
   * hundreds of metres a second once the radius was large. Absolute is right
   * there; this is for the handful of settings where it is not.
   */
  proportional?: boolean;
}

/**
 * The drag itself, without any opinion about what it looks like.
 *
 * Separate from `Jog` because the same gesture is wanted on things that are not
 * a 16-pixel grip beside a slider — the fly-speed readout over the viewport is
 * dragged across its whole face. The parts worth not duplicating are the pointer
 * capture, the timer, and the accumulator; each of those has a failure mode that
 * looks like "the control does nothing" rather than like a crash.
 */
export function useJogDrag({
  value,
  onChange,
  min,
  max,
  ceiling,
  zeroAt,
  proportional,
}: JogSpec) {
  const [active, setActive] = useState(false);
  const [offset, setOffset] = useState(0);

  /**
   * The value being integrated, and the last one emitted.
   *
   * Kept locally rather than read from the prop each frame: the prop only comes
   * back after React has re-rendered, so a frame that lands first would integrate
   * from a stale number and the change would stall. `emitted` is how an *external*
   * change is still noticed — if the prop no longer matches what this control
   * last sent, someone else moved it and the accumulator resyncs.
   */
  const working = useRef(value);
  const emitted = useRef(value);
  const drag = useRef({ startY: 0, dy: 0, fine: false, timer: 0, last: 0 });

  useEffect(() => {
    if (Math.abs(value - emitted.current) > Math.abs(value) * 1e-6 + 1e-9) {
      working.current = value;
      emitted.current = value;
    }
  }, [value]);

  /**
   * Integrate one tick.
   *
   * Driven by a timer rather than by `requestAnimationFrame`, which is the
   * counter-intuitive part. rAF is gated on frame presentation, so on a scene
   * that renders at 2fps it fires twice a second — and the drag would then move
   * the value at a thirtieth of the rate it was asked for. That is backwards:
   * the heaviest scenes are exactly the ones whose radius and cull bounds need
   * adjusting, and the control would grind to a halt precisely there. Measured
   * under software rendering, a full-travel drag reached a factor of 19 in two
   * and a half seconds where it should have reached several thousand.
   *
   * A rate control's job is to change a number, not to wait for a picture. The
   * picture catches up on its own.
   */
  const step = () => {
    const d = drag.current;
    const now = performance.now();
    // Real elapsed time, capped. The cap is for the gap a backgrounded tab
    // leaves — timers are throttled to seconds when hidden, and one late tick
    // would otherwise integrate straight to the ceiling while nobody was
    // looking.
    const dt = Math.min(MAX_STEP_S, Math.max(0, (now - d.last) / 1000));
    d.last = now;

    const next = jogStep({
      value: working.current,
      dy: d.dy,
      dt,
      fine: d.fine,
      min,
      max,
      ceiling,
      zeroAt,
      proportional,
    });
    if (next !== working.current) {
      working.current = next;
      emitted.current = next;
      onChange(next);
    }
  };

  const stop = () => {
    clearInterval(drag.current.timer);
    drag.current.timer = 0;
    drag.current.dy = 0;
    setActive(false);
    setOffset(0);
  };

  useEffect(() => () => clearInterval(drag.current.timer), []);

  return {
    active,
    /** Drag travel as a signed fraction of the span, for whatever wants to lean. */
    offset,
    handlers: {
      onPointerDown: (e: ReactPointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        // On the container, not the event target: the target may be a child
        // whose style changes on every move, and the capture has to outlive it.
        e.currentTarget.setPointerCapture(e.pointerId);
        working.current = value;
        emitted.current = value;
        drag.current.startY = e.clientY;
        drag.current.dy = 0;
        drag.current.fine = e.shiftKey;
        drag.current.last = performance.now();
        setActive(true);
        drag.current.timer = window.setInterval(step, TICK_MS);
      },
      onPointerMove: (e: ReactPointerEvent) => {
        if (!drag.current.timer) return;
        // Up is positive, which is the direction people expect a value to grow.
        drag.current.dy = drag.current.startY - e.clientY;
        drag.current.fine = e.shiftKey;
        setOffset(Math.max(-1, Math.min(1, drag.current.dy / SPAN_PX)));
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onLostPointerCapture: stop,
      // No double-click reset. Two quick nudges in the same place are one
      // dblclick, so a reset would throw away the value on exactly the
      // back-and-forth this gesture is for — and there is no default to reset to
      // anyway, only the middle of a track that means nothing.
    },
  };
}

/**
 * How fast the value is changing, in units per second, for a drag `dy` pixels
 * from where it was grabbed.
 *
 * Logarithmic in the travel: the slow and fast ends are three decades apart and
 * the drag interpolates between them geometrically, so equal distances of screen
 * give equal *ratios* of speed. A linear rate would spend nine tenths of the
 * travel above a hundred units a second and leave nothing to aim with.
 *
 * The slow end is `unit`, which is one unit a second for anything measured in
 * metres or degrees, and a thousandth of the range for a value that lives
 * between zero and one — for those, "one per second" would cross the entire
 * range before you let go.
 *
 * The fast end is a thousand of those, or a doubling per second if that is more.
 * The two meet exactly at a thousand, so below it the fast end is the thousand
 * units a second asked for, and above it the value doubles instead — which is
 * what stops a saturation point of ten million from being reachable only in
 * principle.
 */
export function jogRate({
  value,
  dy,
  min,
  max,
  fine = false,
  proportional = false,
}: {
  value: number;
  dy: number;
  min: number;
  max: number;
  fine?: boolean;
  proportional?: boolean;
}): number {
  const travel = Math.min(1, Math.max(0, Math.abs(dy) - DEAD_PX) / SPAN_PX);
  if (travel <= 0) return 0;

  let slow: number;
  let fast: number;
  if (proportional) {
    // Both ends scale with the value, so the band is a band of *ratios*: a few
    // percent a second at a nudge, an order of magnitude at full travel,
    // wherever you happen to be. See `JogSpec.proportional`.
    const magnitude = Math.max(Math.abs(value), Math.max(1e-9, min));
    slow = magnitude * PROP_SLOW;
    fast = magnitude * PROP_FAST;
  } else {
    const unit = Math.min(1, Math.max(1e-9, (max - min) / DECADE_SPAN));
    slow = unit;
    fast = Math.max(unit * DECADE_SPAN, Math.abs(value) * FAST_FACTOR);
  }
  // Shift moves the whole band down without changing its width, so the feel of
  // the travel is the same and only the scale differs.
  const f = fine ? FINE : 1;
  return slow * f * (fast / slow) ** travel;
}

/**
 * One tick of integration: where the value goes after `dt` seconds held `dy`
 * pixels from the grab point.
 *
 * Pure, and separate from the component, because this is where the behaviour
 * lives — the rate law, the dead zone, and what happens at the ends of the
 * range. Returns `value` unchanged when the drag is inside the dead zone or
 * already against a bound, which is also the component's signal not to emit.
 */
export function jogStep({
  value,
  dy,
  dt,
  fine = false,
  min,
  max,
  ceiling,
  zeroAt,
  proportional = false,
}: {
  value: number;
  dy: number;
  dt: number;
  fine?: boolean;
  min: number;
  max: number;
  ceiling?: number;
  zeroAt?: number;
  proportional?: boolean;
}): number {
  const lower = zeroAt !== undefined ? zeroAt : min;
  const upper = ceiling ?? max;

  const rate = jogRate({ value, dy, min, max, fine, proportional });
  if (rate <= 0 || dt <= 0) return value;
  const dir = dy > 0 ? 1 : -1;

  // Coming out of the off position, land on the bottom of the track rather than
  // crawling up through values the slider itself cannot express.
  if (zeroAt !== undefined && dir > 0 && value <= zeroAt) return Math.min(min, upper);

  let next = value + dir * rate * dt;

  // Below the bottom of the track the answer is the bottom — or off, on a slider
  // that has an off position, which is the same thing the track does down there.
  if (next <= lower) next = lower;
  if (next > upper) next = upper;
  // A value already outside the range must not be yanked back in by a drag
  // pushing it further out; only a drag heading inward may move it.
  if (dir > 0 && next < value) return value;
  if (dir < 0 && next > value) return value;
  return Number.isFinite(next) ? next : value;
}

/** Pixels of travel before anything happens, so a click is not a drag. */
const DEAD_PX = 7;
/**
 * Travel at which the rate saturates. A pull across most of the screen, because
 * that is the gesture the top of the range was asked to correspond to.
 */
const SPAN_PX = 340;
/**
 * Ratio between the slow and fast ends of the rate band: three decades, so one
 * unit a second at a nudge and a thousand at full travel.
 */
const DECADE_SPAN = 1000;
/**
 * At full travel, also allow the value to add its own size each second — a
 * doubling per second.
 *
 * One, not more, so that this and the absolute end of the band meet exactly at a
 * thousand: below that the fast end is a thousand units a second as asked, and
 * above it the value doubles instead, which is the only thing that keeps a
 * ceiling in the millions reachable. At three, a radius of two thousand ran at
 * six thousand a second on a full pull — six times what was asked for, at an
 * entirely ordinary value.
 */
const FAST_FACTOR = 1;
/** Rate divisor while Shift is held — a decade below the ordinary band. */
const FINE = 0.1;
/**
 * Ratio band for a `proportional` value: three percent of it a second at a
 * nudge, fifteen times it a second at full travel.
 *
 * The fast end has to be large because the range is: five decades separate the
 * slowest useful fly speed from the fastest, and at fifteen times a second a
 * full pull crosses all of them in about four seconds.
 */
const PROP_SLOW = 0.03;
const PROP_FAST = 15;
/**
 * Longest gap a single tick may integrate, in seconds. Guards the multi-second
 * jump a backgrounded tab delivers on resume; the rate itself comes from the
 * measured interval, so this changes nothing while the tab is in front.
 */
const MAX_STEP_S = 0.25;
/**
 * Integration interval. Sixty a second, which is smooth without being the frame
 * rate — see `step` for why those are deliberately not the same thing.
 */
const TICK_MS = 16;
