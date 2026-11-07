---
title: Gamepad and HOTAS
parent: Camera and controls
nav_order: 1
---

# Gamepad and HOTAS

XInput controllers work, along with anything else the browser maps to the standard gamepad layout. The Gamepad API can only be polled, so the pad is read once per frame from the render loop, and its input **adds** to the keyboard's - both can be used at once ([`gamepad.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gamepad.ts)).

## Mapping

| Control | Effect |
|---|---|
| Left stick | Move: forward/back and strafe |
| Right stick | Look: yaw and pitch, at *Look speed* degrees per second at full deflection |
| `RT` / `LT` (analogue) | Up / down; in the parallel projection, zoom in / out |
| `RB` (held) | 6× faster |
| `LB` (held) | 15% speed |
| `A` (held) | 3× sprint (combines with RB/LB) |
| `Y` (press) | Frame the data |

Button numbers follow the standard layout: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; sticks on axes 0-1 (left) and 2-3 (right).

## The Gamepad settings

In **Camera & scene → Gamepad**. **Settings** / **Hide** opens the tuning controls.

| Control | Default | Range (jog) | Meaning |
|---|---|---|---|
| **Enabled** | on | | |
| Device status | | | Every connected device, `●` when followed, `○` when not, with *- not an XInput pad, ignored* or *- not an XInput pad, used anyway* for non-standard devices. With none: *No pad detected. Browsers only reveal a controller after it sends its first input - press a button on it.* |
| **Use device** | *XInput pads only (recommended)* | | Shown when a non-standard device is connected. Choose a device by name to follow it instead. |
| **Look speed** | 150°/s | 20-540 (5000) | Turning rate at full right-stick deflection. |
| **Deadzone** | 12% | 0-50% (95%) | Radial: a diagonal push never leaks into one axis alone. Raise it if the camera drifts with the sticks centred. |
| **Stick curve** | x² | linear (1) to x⁴ (16) | Response exponent after the deadzone: finer control near the centre, still full speed at the rim. |
| **Invert stick Y** | off | | |
| **Swap sticks** | off | | Move on the right stick, look on the left. |

The stick shaping: with deflection *m* (the length of the stick vector) and deadzone *d*, output = ((m - d) / (1 - d)) ^ curve along the stick's direction, and 0 inside the deadzone.

## Why only standard pads by default

The Gamepad API reports **every** HID device with axes - flight sticks, throttles, pedals, wheels - and those do not rest at centre: a twist axis or a throttle lever sits at full deflection when nobody touches it. Read as a stick, that is a permanent full-speed input no deadzone can suppress, and the camera spins on its own from the moment the page loads (and every heat mode looks broken too, because a moving camera restarts the accumulation every frame).

So a device is followed only when the browser reports `mapping: "standard"`, its way of saying "an XInput-style pad with the axes where you expect them". Other devices are listed and marked ignored, and **Use device** opts into one explicitly - for flying the camera with a HOTAS, for example. Once a pad is followed the camera stays with it, so two controllers do not fight over the camera depending on enumeration order.

Browsers hide a controller until it has sent its first input, so a plugged-in pad that has not been touched does not exist yet as far as the page is concerned.
