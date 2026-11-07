/**
 * Gamepad flight control.
 *
 * XInput pads (and anything else the browser maps to the "standard" layout)
 * arrive through the Gamepad API, which is poll-only — there are no events, so
 * this is read once per frame from the render loop rather than wired to
 * listeners.
 *
 * Sticks are treated as an analogue throttle, not a direction: a radial deadzone
 * plus a response curve, because a raw axis makes slow, precise framing
 * impossible and that is most of what a camera in a telemetry viewer is for.
 */

export interface GamepadSettings {
  enabled: boolean;
  /** Radial deadzone, 0..1. Below this the stick reads as centred. */
  deadzone: number;
  /**
   * Response exponent. 1 is linear; higher gives finer control near centre and
   * still reaches full speed at the rim.
   */
  curve: number;
  /** Degrees per second at full right-stick deflection. */
  lookSpeed: number;
  /** Multiplier on the camera's fly speed at full left-stick deflection. */
  moveScale: number;
  invertY: boolean;
  /** Swap which stick moves and which looks. */
  swapSticks: boolean;
  /**
   * Follow this exact device (`Gamepad.id`) whatever its layout, or `null` to
   * follow whichever standard-layout pad is in use.
   *
   * The escape hatch for the rule below. Someone who genuinely wants to fly the
   * camera with a HOTAS can name it here and get the axes mapped as if it were a
   * pad; nothing else will opt them in by accident.
   */
  deviceId: string | null;
}

export const DEFAULT_GAMEPAD: GamepadSettings = {
  enabled: true,
  deadzone: 0.12,
  curve: 2,
  lookSpeed: 150,
  moveScale: 1,
  invertY: false,
  swapSticks: false,
  deviceId: null,
};

/**
 * Is this a pad we are willing to drive the camera from?
 *
 * The Gamepad API reports *every* HID device with axes and buttons — flight
 * sticks, throttles, pedals, wheels — and `mapping: "standard"` is the browser
 * saying "I recognised this as an XInput-style pad and put the axes where you
 * expect them". Anything else is a device whose axis order this code has no way
 * to know.
 *
 * Guessing is not harmlessly wrong, it is actively broken, because a HOTAS does
 * not rest at zero. On the machine this was found on, a VKB Gunfighter reported
 * axes 0 and 1 sitting at -1.0 and +1.0 and a VPC throttle sat at -0.95: resting
 * positions for a twist axis and a throttle lever, full deflection to anything
 * reading them as a stick. The camera yawed continuously and pitched to its
 * +90 degree clamp within a second and a half of load, with nothing touched. A
 * radial deadzone cannot help — the input is not near centre, it is pinned at the
 * rim — and the viewer looked broken rather than mis-configured.
 *
 * So: standard layout only, unless the device was named deliberately.
 */
export function isUsablePad(pad: Gamepad, deviceId: string | null): boolean {
  if (deviceId !== null) return pad.id === deviceId;
  return pad.mapping === 'standard';
}

/** What the pad is asking for this frame, in the same terms as the keyboard. */
export interface GamepadInput {
  connected: boolean;
  id: string | null;
  /** -1..1, positive is right. */
  strafe: number;
  /** -1..1, positive is forward. */
  forward: number;
  /** -1..1, positive is up. */
  rise: number;
  /** Radians to add to yaw this frame. */
  yawDelta: number;
  /** Radians to add to pitch this frame. */
  pitchDelta: number;
  /** Multiplier on move speed from the shoulder buttons. */
  speedScale: number;
  /** True on the frame a "frame the data" button was pressed. */
  framePressed: boolean;
  /** Signed zoom request for orthographic mode. */
  zoom: number;
}

const IDLE: GamepadInput = {
  connected: false,
  id: null,
  strafe: 0,
  forward: 0,
  rise: 0,
  yawDelta: 0,
  pitchDelta: 0,
  speedScale: 1,
  framePressed: false,
  zoom: 0,
};

/**
 * Standard-layout button indices.
 *
 * Named because the numbers are meaningless on sight and because a pad that does
 * not report `mapping: "standard"` may order them differently — in which case the
 * axes still work and these degrade to doing nothing useful rather than something
 * surprising.
 */
const BTN_A = 0;
const BTN_Y = 3;
const BTN_LB = 4;
const BTN_RB = 5;
const BTN_LT = 6;
const BTN_RT = 7;

export class GamepadReader {
  private lastFrameButton = false;
  /** Index of the pad we are following, so two pads don't fight. */
  private activeIndex: number | null = null;

  /**
   * Read the pad. `dt` is wall-clock seconds, so look speed is frame-rate
   * independent.
   */
  read(dt: number, settings: GamepadSettings): GamepadInput {
    if (!settings.enabled || typeof navigator === 'undefined' || !navigator.getGamepads) {
      this.lastFrameButton = false;
      return IDLE;
    }

    const pad = this.pick(settings.deviceId);
    if (!pad) {
      this.lastFrameButton = false;
      this.activeIndex = null;
      return IDLE;
    }

    const axis = (i: number) => pad.axes[i] ?? 0;
    const move = settings.swapSticks ? [axis(2), axis(3)] : [axis(0), axis(1)];
    const look = settings.swapSticks ? [axis(0), axis(1)] : [axis(2), axis(3)];

    const [mx, my] = applyStick(move[0], move[1], settings);
    const [lx, ly] = applyStick(look[0], look[1], settings);

    const button = (i: number) => pad.buttons[i];
    // Triggers are analogue on XInput; `value` is the pull amount.
    const lt = button(BTN_LT)?.value ?? 0;
    const rt = button(BTN_RT)?.value ?? 0;
    const lb = button(BTN_LB)?.pressed ?? false;
    const rb = button(BTN_RB)?.pressed ?? false;

    const framePressed = button(BTN_Y)?.pressed ?? false;
    const frameEdge = framePressed && !this.lastFrameButton;
    this.lastFrameButton = framePressed;

    const deg = (Math.PI / 180) * settings.lookSpeed * dt;
    return {
      connected: true,
      id: pad.id,
      strafe: mx,
      // Sticks report up as negative, which is the opposite of "forward".
      forward: -my,
      rise: rt - lt,
      yawDelta: -lx * deg,
      pitchDelta: -ly * deg * (settings.invertY ? -1 : 1),
      // Shoulders are boost and brake, mirroring Shift and Alt on the keyboard.
      speedScale: (rb ? 6 : 1) * (lb ? 0.15 : 1) * (button(BTN_A)?.pressed ? 3 : 1),
      framePressed: frameEdge,
      zoom: rt - lt,
    };
  }

  /**
   * Choose a pad and stay with it.
   *
   * Sticking to one index matters: a wireless pad plus a connected controller
   * that reports all-zero axes would otherwise cancel each other out depending on
   * enumeration order.
   */
  private pick(deviceId: string | null): Gamepad | null {
    const pads = navigator.getGamepads();
    if (this.activeIndex !== null) {
      const held = pads[this.activeIndex];
      // Re-checked every frame, not just when the pad was chosen: the settings
      // can change under us, and a device that stops qualifying has to be let go
      // rather than held because it was acceptable when it was picked.
      if (held?.connected && isUsablePad(held, deviceId)) return held;
      this.activeIndex = null;
    }
    // Prefer a pad that is actually being touched, so an idle second pad never
    // becomes the active one.
    let fallback: Gamepad | null = null;
    for (const pad of pads) {
      if (!pad?.connected || !isUsablePad(pad, deviceId)) continue;
      fallback ??= pad;
      if (isActive(pad)) {
        this.activeIndex = pad.index;
        return pad;
      }
    }
    if (fallback) this.activeIndex = fallback.index;
    return fallback;
  }
}

function isActive(pad: Gamepad): boolean {
  for (const a of pad.axes) if (Math.abs(a) > 0.25) return true;
  for (const b of pad.buttons) if (b.pressed || b.value > 0.25) return true;
  return false;
}

/**
 * Radial deadzone plus response curve.
 *
 * Radial rather than per-axis: a per-axis deadzone lets a diagonal push through
 * on one axis while the other is still suppressed, which makes the camera drift
 * sideways when you meant to go straight.
 */
export function applyStick(
  x: number,
  y: number,
  settings: Pick<GamepadSettings, 'deadzone' | 'curve'>,
): [number, number] {
  const mag = Math.hypot(x, y);
  const dz = Math.max(0, Math.min(0.95, settings.deadzone));
  if (mag <= dz || mag === 0) return [0, 0];
  // Rescale so the deadzone edge is 0 and the rim is still exactly 1.
  const scaled = Math.min(1, (mag - dz) / (1 - dz));
  const shaped = Math.pow(scaled, Math.max(1, settings.curve));
  const k = shaped / mag;
  return [x * k, y * k];
}
