---
title: Camera path and video
nav_order: 8
---

# Camera path and video

The **Camera path & render** panel records a keyframed camera move and writes it out as a WebM video in which **every frame is fully converged** - a flythrough comes out clean, without the sampling grain a moving camera can show. The camera and the playhead move together, so the same panel makes a timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Keyframes

| Control | Effect |
|---|---|
| **Add keyframe here** | Appends the current camera position, yaw, pitch and field of view as a keyframe. |
| **Clear** | Removes all keyframes. |
| Keyframe list | One row per key: its number (click to fly the camera there, setting the field of view too), position, `yaw° / pitch°`, and **×** to remove it. |

Keys are spaced **evenly** along a normalised path axis from 0 to 1 whenever one is added or removed; the output duration then stretches the whole move, so a shot that is right but too quick only needs a longer duration. Yaw is unwrapped between keys so the camera turns the short way.

With no keyframes, a render holds the current camera still for the whole clip - a perfectly good timelapse.

## Path settings

| Control | Default | Range (jog) | Meaning |
|---|---|---|---|
| **Interpolation** (2+ keys) | *Smooth* | *Smooth* / *Straight* | *Smooth*: a cubic Hermite curve through the keys with tangents from the neighbouring keys, so the speed matches across each key and there is no lurch where segments meet. *Straight*: straight lines between keys, predictable, with a visible corner at every key. Field of view is always interpolated linearly. |
| Travel line (2+ keys) | | | `N units of travel - M per second at this duration`, or a note that the keys are all in one place. |
| **Preview along the path** (1+ keys) | off | | Drives the viewport camera from the path, and moves the playhead with it as the render does, so the move can be judged before rendering. |
| **Position along path** (while previewing) | 0% | 0-100% | Where on the path to preview. |
| **Duration** | 12 s | 1-120 s (3600) | Length of the video. |
| **Frame rate** | 30 fps | 6-60 (240) | |
| **Bitrate** | 16 Mbps | 1-60 Mbps, logarithmic (400) | Heat gradients band badly at low bitrates: there is little detail for a codec to hide error behind. |
| **Convergence wait cap** | 240 frames | 2-600 (10,000) | The longest one output frame may wait to become exact. Frames that hit it are still written, and counted. |
| Summary | | | `N frames · window: cumulative/fixed/lifetime`, and when the timeline is in All mode: *(the render switches All to Play so the playhead means something)*. |
| **Render video** / **Cancel** | | | Starts the render; while it runs, shows `frame i / n · waited w · X MB` and how many frames were not exact. Needs a dataset. |

## What a render does

1. Takes a test capture of the frame to learn the exact output size in device pixels.
2. Picks a codec through WebCodecs: **VP9** (`vp09.00.10.08`), else **VP8**, at the chosen bitrate and frame rate. Without `VideoEncoder` it stops with *This browser has no VideoEncoder - WebCodecs is required to write a video*; with neither codec, *No supported video codec (tried VP9, VP8)*.
3. Takes over the settings a render needs: pauses playback, switches **adaptive budget off**, **progressive refinement on** and the sprite budget to 64M per frame (the adaptive budget protects the frame rate, which is the wrong goal here: it would read each slow converging frame as a reason to splat fewer rows, which needs more frames to converge), and switches the timeline from **All** to **Play**. The history setting (cumulative, window, lifetime) is left as it is: a render is meant to be the thing you were looking at, played through and written down.
4. For each output frame *f* of *n*, at *u* = f / (n - 1):
   - places the camera at the path's pose at *u* (if there are keys);
   - seeks the playhead to the same fraction *u* of the timeline's range (the selected session's span in box replay);
   - forces a fresh estimate, even when the camera did not move - inheriting the previous frame's accumulation would leave a ghost of the previous window;
   - waits, frame by frame, until the picture is exact (all candidate rows drawn in one frame, or the accumulation complete), up to the wait cap;
   - captures the composited frame and encodes it, with a keyframe every 2 seconds of output so the file is seekable.
5. Muxes the frames into a WebM file ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) with timestamps chosen from the frame rate - the wall-clock time each frame took is irrelevant.
6. Restores the budget, the field of view, the timeline mode, the playhead and whether it was playing.
7. Downloads the video as `3dheat-<width>x<height>-<frames>f.webm` and reports `N frames at W×H, X MB - every frame exact`, or how many hit the wait cap.

**Cancel** stops after the current frame (*Render cancelled.*) and restores the settings.

## Tips

- Output size is the canvas size in device pixels (the display's pixel ratio, capped at 2). Resize the browser window to change it.
- A cumulative history builds the heat up over the clip; a window or lifetime history shows a moving slice of time.
- Keyframe positions are display coordinates: with an [inverted world axis](camera.md#invert-world-axis), keys made before switching it point somewhere else after.
