import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_GAMEPAD, GamepadReader, applyStick, type GamepadSettings } from './gamepad';

/** Minimal standard-layout pad. Only the fields the reader touches. */
function fakePad(over: {
  index?: number;
  axes?: number[];
  // Sparse on purpose, so a test can name only the button index it cares about.
  buttons?: Array<{ pressed?: boolean; value?: number } | undefined>;
  connected?: boolean;
  id?: string;
  mapping?: string;
}): Gamepad {
  const buttons = Array.from({ length: 17 }, (_, i) => ({
    pressed: over.buttons?.[i]?.pressed ?? false,
    touched: false,
    value: over.buttons?.[i]?.value ?? (over.buttons?.[i]?.pressed ? 1 : 0),
  }));
  return {
    id: over.id ?? 'Xbox 360 Controller (XInput STANDARD GAMEPAD)',
    index: over.index ?? 0,
    connected: over.connected ?? true,
    mapping: over.mapping ?? 'standard',
    axes: over.axes ?? [0, 0, 0, 0],
    buttons: buttons as unknown as readonly GamepadButton[],
    timestamp: 0,
    vibrationActuator: null,
  } as unknown as Gamepad;
}

let restore: (() => void) | null = null;

function installPads(pads: Array<Gamepad | null>): void {
  const nav = globalThis.navigator as unknown as Record<string, unknown> | undefined;
  if (!nav) {
    (globalThis as Record<string, unknown>).navigator = { getGamepads: () => pads };
    restore = () => {
      delete (globalThis as Record<string, unknown>).navigator;
    };
    return;
  }
  const prev = nav.getGamepads;
  Object.defineProperty(nav, 'getGamepads', { value: () => pads, configurable: true });
  restore = () => {
    if (prev === undefined) delete nav.getGamepads;
    else Object.defineProperty(nav, 'getGamepads', { value: prev, configurable: true });
  };
}

afterEach(() => {
  restore?.();
  restore = null;
});

const S: GamepadSettings = { ...DEFAULT_GAMEPAD };

describe('applyStick', () => {
  it('suppresses anything inside the deadzone', () => {
    expect(applyStick(0, 0, S)).toEqual([0, 0]);
    expect(applyStick(0.1, 0, S)).toEqual([0, 0]);
    expect(applyStick(0.08, 0.08, S)).toEqual([0, 0]);
  });

  it('still reaches exactly full deflection at the rim', () => {
    const [x] = applyStick(1, 0, S);
    expect(x).toBeCloseTo(1, 6);
    const [dx, dy] = applyStick(Math.SQRT1_2, Math.SQRT1_2, S);
    expect(Math.hypot(dx, dy)).toBeCloseTo(1, 6);
  });

  it('is radial, so a diagonal push keeps its direction', () => {
    // A per-axis deadzone would zero one component here and steer the camera
    // sideways; the ratio must survive.
    const [x, y] = applyStick(0.6, 0.3, S);
    expect(x / y).toBeCloseTo(2, 6);
  });

  it('applies the response curve between the deadzone and the rim', () => {
    const linear = applyStick(0.5, 0, { deadzone: 0, curve: 1 })[0];
    const squared = applyStick(0.5, 0, { deadzone: 0, curve: 2 })[0];
    expect(linear).toBeCloseTo(0.5, 6);
    expect(squared).toBeCloseTo(0.25, 6);
  });

  it('clamps an over-range magnitude rather than exceeding full speed', () => {
    // Some pads report slightly outside the unit circle on a hard diagonal.
    const [x, y] = applyStick(1, 1, { deadzone: 0.1, curve: 1 });
    expect(Math.hypot(x, y)).toBeLessThanOrEqual(1.000001);
  });

  it('stays finite at absurd settings', () => {
    // The deadzone is clamped below 1 so the rescale can never divide by zero,
    // which means a deadzone of 1 leaves a sliver of travel rather than killing
    // the stick outright. Both are acceptable; NaN is not.
    for (const [x, y, dz, curve] of [
      [0.99, 0, 1, 1],
      [1, 1, 2, 1],
      [0.5, 0.5, -1, 0],
      [0, 0, 0, 1],
    ]) {
      const [ox, oy] = applyStick(x, y, { deadzone: dz, curve });
      expect(Number.isFinite(ox)).toBe(true);
      expect(Number.isFinite(oy)).toBe(true);
      expect(Math.hypot(ox, oy)).toBeLessThanOrEqual(1.000001);
    }
  });
});

describe('GamepadReader', () => {
  it('reports disconnected when there is no pad', () => {
    installPads([null, null]);
    const r = new GamepadReader();
    expect(r.read(1 / 60, S).connected).toBe(false);
  });

  it('maps the left stick to movement with forward inverted', () => {
    // Sticks report up as negative; forward must come out positive.
    installPads([fakePad({ axes: [0, -1, 0, 0] })]);
    const got = new GamepadReader().read(1 / 60, S);
    expect(got.connected).toBe(true);
    expect(got.forward).toBeCloseTo(1, 6);
    expect(got.strafe).toBe(0);
  });

  it('turns the right stick into a frame-rate independent look delta', () => {
    installPads([fakePad({ axes: [0, 0, 1, 0] })]);
    const r = new GamepadReader();
    const slow = r.read(1 / 30, S).yawDelta;
    const fast = r.read(1 / 60, S).yawDelta;
    // Half the frame time, half the rotation — so look speed does not depend on
    // how fast the renderer happens to be running.
    expect(slow / fast).toBeCloseTo(2, 5);
    // Pushing right must yaw right, which is negative in this camera's convention.
    expect(fast).toBeLessThan(0);
  });

  it('honours invert Y on the look stick only', () => {
    installPads([fakePad({ axes: [0, -1, 0, -1] })]);
    const up = new GamepadReader().read(1 / 60, S).pitchDelta;
    const down = new GamepadReader().read(1 / 60, { ...S, invertY: true }).pitchDelta;
    expect(Math.sign(up)).toBe(-Math.sign(down));
    // Movement is unaffected by the look inversion.
    expect(new GamepadReader().read(1 / 60, { ...S, invertY: true }).forward).toBeCloseTo(1, 6);
  });

  it('swaps the sticks when asked', () => {
    installPads([fakePad({ axes: [0, 0, 0, -1] })]);
    const normal = new GamepadReader().read(1 / 60, S);
    const swapped = new GamepadReader().read(1 / 60, { ...S, swapSticks: true });
    expect(normal.forward).toBeCloseTo(0, 6);
    expect(swapped.forward).toBeCloseTo(1, 6);
  });

  it('reads the triggers as an analogue rise', () => {
    installPads([fakePad({ buttons: [, , , , , , { value: 0.25 }, { value: 1 }] })]);
    expect(new GamepadReader().read(1 / 60, S).rise).toBeCloseTo(0.75, 6);
  });

  it('combines the shoulder boost and brake', () => {
    installPads([fakePad({ buttons: [, , , , , { pressed: true }] })]);
    expect(new GamepadReader().read(1 / 60, S).speedScale).toBeCloseTo(6, 6);
    installPads([fakePad({ buttons: [, , , , { pressed: true }] })]);
    expect(new GamepadReader().read(1 / 60, S).speedScale).toBeCloseTo(0.15, 6);
  });

  it('fires the frame button once per press, not once per frame', () => {
    const held = fakePad({ buttons: [, , , { pressed: true }] });
    installPads([held]);
    const r = new GamepadReader();
    expect(r.read(1 / 60, S).framePressed).toBe(true);
    expect(r.read(1 / 60, S).framePressed).toBe(false);
    installPads([fakePad({})]);
    expect(r.read(1 / 60, S).framePressed).toBe(false);
    installPads([held]);
    expect(r.read(1 / 60, S).framePressed).toBe(true);
  });

  it('is inert when disabled', () => {
    installPads([fakePad({ axes: [1, 1, 1, 1] })]);
    const got = new GamepadReader().read(1 / 60, { ...S, enabled: false });
    expect(got.connected).toBe(false);
    expect(got.forward).toBe(0);
  });

  it('follows the pad that is actually being used, not enumeration order', () => {
    const idle = fakePad({ index: 0, id: 'idle pad' });
    const active = fakePad({ index: 1, id: 'active pad', axes: [0, -1, 0, 0] });
    installPads([idle, active]);
    const r = new GamepadReader();
    expect(r.read(1 / 60, S).id).toBe('active pad');
    // And keeps following it once it goes quiet, rather than snapping back.
    installPads([idle, fakePad({ index: 1, id: 'active pad' })]);
    expect(r.read(1 / 60, S).id).toBe('active pad');
  });

  it('releases a pad that disconnects', () => {
    installPads([fakePad({ index: 0, id: 'a', axes: [0, -1, 0, 0] })]);
    const r = new GamepadReader();
    expect(r.read(1 / 60, S).id).toBe('a');
    installPads([null, fakePad({ index: 1, id: 'b' })]);
    expect(r.read(1 / 60, S).id).toBe('b');
  });

  it('tolerates a pad reporting fewer axes than the standard layout', () => {
    installPads([fakePad({ axes: [0.5] })]);
    const got = new GamepadReader().read(1 / 60, S);
    expect(Number.isFinite(got.strafe)).toBe(true);
    expect(got.yawDelta).toBeCloseTo(0, 9);
    expect(got.pitchDelta).toBeCloseTo(0, 9);
  });

  /**
   * A HOTAS is not a pad with a drifting stick, it is a device whose axes rest at
   * the rim. These are the real figures from a VKB Gunfighter and a VPC MT-50
   * throttle sitting untouched on a desk: read as a stick, axes 0 and 1 are a
   * full-deflection diagonal that no deadzone can suppress, and the camera spins
   * until the pitch clamp stops it.
   */
  const VKB = 'VKB-Sim Gunfighter Modern Combat Pro Twist (Vendor: 231d Product: 0125)';
  const VPC = 'LEFT VPC Throttle MT-50 CM (Vendor: 03eb Product: 2054)';
  const flightStick = () =>
    fakePad({ index: 0, id: VKB, mapping: '', axes: [-1, 1, 0, 0, 0, 0, 0, -1, 0, 1.2857] });
  const throttle = () =>
    fakePad({ index: 1, id: VPC, mapping: '', axes: [0, -0.0265, -0.4891, -0.9526] });

  it('ignores flight gear rather than reading its resting axes as a stick', () => {
    installPads([flightStick(), throttle()]);
    const got = new GamepadReader().read(1 / 60, S);
    expect(got.connected).toBe(false);
    expect(got.id).toBe(null);
    // The symptom this exists to prevent: uncommanded rotation.
    expect(got.yawDelta).toBe(0);
    expect(got.pitchDelta).toBe(0);
    expect(got.forward).toBe(0);
    expect(got.strafe).toBe(0);
  });

  it('still finds a real pad sharing the bus with flight gear', () => {
    installPads([flightStick(), fakePad({ index: 1, id: 'xbox', axes: [0, -1, 0, 0] }), throttle()]);
    const got = new GamepadReader().read(1 / 60, S);
    expect(got.id).toBe('xbox');
    expect(got.forward).toBeGreaterThan(0);
  });

  it('uses a non-standard device when it is named explicitly', () => {
    installPads([flightStick(), throttle()]);
    const got = new GamepadReader().read(1 / 60, { ...S, deviceId: VKB });
    expect(got.id).toBe(VKB);
    // Named on purpose, so its axes are now allowed to drive the camera.
    expect(got.yawDelta !== 0 || got.forward !== 0 || got.strafe !== 0).toBe(true);
  });

  it('drops a held device as soon as it stops qualifying', () => {
    installPads([flightStick()]);
    const r = new GamepadReader();
    expect(r.read(1 / 60, { ...S, deviceId: VKB }).id).toBe(VKB);
    // Same pad, same frame data — only the setting changed back.
    expect(r.read(1 / 60, S).connected).toBe(false);
  });
});
