---
title: Accumulation
parent: Rendering internals
nav_order: 2
---

# Accumulation

When one frame cannot draw every row, it draws a sample and weights it up; the picture is then an unbiased but noisy estimate. **Accumulation** merges successive frames so the estimate converges to the exact answer while nothing changes. Each frame chooses one of five modes ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); the last one used is on `engine.live.accumMode`.

| Mode | When | What happens to the accumulator |
|---|---|---|
| **reset** | the camera moved, something that changes the field changed, progressive refinement is off, a growing window is starting (first frame of playback, after a seek), or played-back line heat moved | Replaced by this frame's estimate. |
| **extend** | a **Cumulative** window that only grew since the last frame | This frame draws only the rows that just became visible, at full weight, and adds them. Nothing decays. |
| **ema** | a sliding window (**Window**, **Lifetime**) moved | `acc = acc × (1 - 0.34) + frame × 0.34` - an exponential moving average of about three frames. |
| **mean** | nothing changed and the estimate is not complete | `acc = acc × (1 - 1/n) + frame × 1/n` on the *n*th frame: a running mean. |
| **skip** (idle) | converged and nothing changed | Nothing is drawn; the frame only recomposites. |

## Why each

- **Running mean, not sum.** Scaling the buffer by 1 - 1/n and adding 1/n of the new frame is algebraically the same as summing and dividing by *n* at the end, but the buffer always holds one field's worth. A sum reaches *n* times the field, and on a 16-bit target it saturates at 65,504; with a divisor that keeps growing, a still view would then fade the longer it sat - while a moving camera, which resets every frame, looks perfectly correct. The smoke suite asserts that 16 merged frames hold 1.00× what one frame does.
- **Extend for cumulative playback.** The rows already accumulated are still visible, so a frame only needs the fraction of a second that just arrived - which fits in one frame, so it goes in exactly. Re-estimating instead would light a different random subset each frame and fade it, reading as bursts flaring and vanishing, and a paused frame would keep filling in. The suite asserts the total climbs monotonically during playback and holds within 0.02% across 2.5 s paused.
- **Moving average for sliding windows.** Those genuinely change every frame. A fixed blend weight tracks the moving window (an average over all frames since playback began would lag behind the playhead) and is much quieter than starting over.
- **Reset for played-back lines.** Line heat heads move every frame; a moving average would smear each into a streak, so each frame is drawn whole and the tail fade is the picture's own.
- **Partial frames go through a scratch target.** A frame merged at a fraction of full weight is splatted into a separate target from zero and then blended into the accumulator, instead of being splatted directly at 1/n weight. Directly, each sprite would be added at 1/n of the size of the total it joins, which a half-float target rounds away - worst where it is densest ([Half-float accumulation](half-float-accumulation.md)).

## Convergence

The plan for each frame knows how many candidate rows there are and how many it submits, so the number of frames needed to cover every row is ⌈candidates / submitted⌉. Once that many frames have been merged the view is **converged**: the stats overlay's *Coverage* line turns from a percentage to *exact*, and further frames idle. With **Draw every row each frame** on (the default) a single frame usually covers everything, so convergence is immediate, and the progressive machinery is only needed when the window holds more rows than one draw plan can carry (about 67 million).

## What restarts it

Settings fall into three groups, according to what the accumulated buffer still means after they change:

| Group | Changes | Effect |
|---|---|---|
| **Geometry** - which rows contribute and how much | view mode; line routes; sprite radius, centre and edge intensity, falloff, smooth ramp, the curve, pixel clamps, flattening; distance cull near, far and planar; occlusion and hide behind terrain; the slice; canvas size; heat resolution; group visibility and signs; the difference split; All / Play; the history; the column filters and the Entities selection; the half-float gain | Reset. |
| **Window** - the time range | the playhead moving; the Lifetime fallback and fade | Extend (cumulative) or moving average (sliding). |
| **Composite** - only the colouring | saturation, density response, minimum heat, the colour ramps; cutting the level; grid and axes; box replay settings and session; depth of field | Redraw without touching the heat. |

A camera move always resets. So dragging the saturation or the ramp is free; dragging the sprite radius restarts convergence on every step.
