---
title: Camera path and video
nav_order: 15
---

# Camera path and video

Make a film of your data: you place the camera in a few spots and the viewer flies between them and saves a video. Every frame is very clean, with no grain. The camera and the playhead move together, so the same panel makes a timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Make a flythrough

1. Fly to where the film starts and press **Add keyframe here** in **Camera path & render**.
2. Fly to the next spot and press it again. Repeat for each stop.
3. Tick **Preview along the path** and drag **Position along path** to check the move.
4. Set **Duration** (how long the video is). A move that is right but too quick only needs a longer duration.
5. Press **Render video**. Wait for the progress line; the file downloads when it finishes.

![The Camera path & render panel with three keyframes, Smooth interpolation, 12 s, 30 fps and 16 Mbps](assets/img/en/camera-path-panel.webp)

## Keyframes

| Control | Effect |
|---|---|
| **Add keyframe here** | Appends the current camera position, yaw, pitch and field of view as a keyframe. |
| **Clear** | Removes all keyframes. |
| Keyframe list | One row per key: its number (click to fly the camera there, setting the field of view too), position, `yaw° / pitch°`, and **×** to remove it. |

Keys are spaced **evenly** along a normalised path axis from 0 to 1 whenever one is added or removed; the output duration then stretches the whole move, so a shot that is right but too quick only needs a longer duration. Yaw is unwrapped between keys so the camera turns the short way.

With no keyframes, a render holds the current camera still for the whole clip - a perfectly good timelapse.

## Timing, easing and speed

| Control | Default | Meaning |
|---|---|---|
| **Timing** (2+ keys) | *At the keys' times* | *At the keys' times*: each key is reached at its own time; the key list shows each key's time in seconds, editable (kept between its neighbours). The last key's time is the video's end, so typing a time there sets the **Duration** too, with the other keys keeping their places along the video. *Steady speed*: the camera moves at one speed along the whole path - the keys set its shape, **Duration** its pace (the path is re-timed by its length, sampled at 1,024 points). |
| **Space the keys evenly** | | Gives each move between keys the same share of the video. |
| Ease (per key, except the last) | *Even* | How the move from this key to the next starts and ends: *Even*, *Ease in* (starts slow), *Ease out* (arrives slow), *Ease in and out*. A time remap inside the segment: the path's shape does not change. |

A new key is still added at the end and the keys re-spaced evenly.

## Saved paths

Under **Saved paths**, type a name and press **Save path**: the keys (with their times and eases), the interpolation, the timing, the duration and the frame rate are kept in this browser. Click a saved path's name to load it, **✎** to rename it, **×** to delete it. **Export JSON** writes all of them to `3dheat-camera-paths.json` (`schema: heat3d.camera-paths/1`); **Import JSON** adds the paths of such a file (one with the same id replaces the one here). Keys that are not valid are left out of an import.

## Output file

| Control | Default | Meaning |
|---|---|---|
| **File** | *MP4* | *MP4*: H.264 in MP4, plays everywhere. *MKV*: H.264 in Matroska, VP9 or VP8 where the browser has no H.264 encoder. *WebM*: VP9 (else VP8) in WebM. |
| **Size** | 1920 × 1080 | *The view's own size*, 1280 × 720, 1920 × 1080, 2560 × 1440, 3840 × 2160, or *Custom* (16-8192 pixels each way). The view renders at that size for the length of the render, whatever the window's size and shape; H.264 takes even sizes, so an odd one is rounded down. |

The H.264 profile and level are chosen from the size and the frame rate (High first, then Main, then Baseline; the lowest level whose frame size and macroblock rate hold the video). The file is named `3dheat-<width>x<height>-<frames>f.<mp4|mkv|webm>`.

Recording works the same in every mode - Heat, Difference, Team heat, Lines, the match replay and the tactics board: the render takes whatever the view draws.

## Path settings

| Control | Default | Range (jog) | Meaning |
|---|---|---|---|
| **Interpolation** (2+ keys) | *Smooth* | *Smooth* / *Straight* | *Smooth*: a cubic Hermite curve through the keys with tangents from the neighbouring keys, so the speed matches across each key and there is no lurch where segments meet. *Straight*: straight lines between keys, predictable, with a visible corner at every key. Field of view is always interpolated linearly. |
| Travel line (2+ keys) | | | `N units of travel - M per second at this duration`, or a note that the keys are all in one place. |
| **Preview along the path** (1+ keys) | off | | Drives the viewport camera from the path, and moves the playhead with it as the render does, so the move can be judged before rendering. |
| **Position along path** (while previewing) | 0% | 0-100% | Where on the path to preview. |
| **Duration** | 12 s | 1-120 s (3600) | Length of the video. A number typed in the box counts as it is typed. The last key's time box sets it too. |
| **Frame rate** | 30 fps | 6-60 (240) | |
| **Bitrate** | 16 Mbps | 1-60 Mbps, logarithmic (400) | Heat gradients band badly at low bitrates: there is little detail for a codec to hide error behind. |
| **Convergence wait cap** | 240 frames | 2-600 (10,000) | The longest one output frame may wait to become exact. Frames that hit it are still written, and counted. |
| Summary | | | `N frames · window: cumulative/fixed/lifetime`, and when the timeline is in All mode: *(the render switches All to Play so the playhead means something)*. |
| **Render video** / **Cancel** | | | Starts the render; while it runs, shows `frame i / n · waited w · X MB` and how many frames were not exact. Needs a dataset. |

## Tips

- With **Size** set to *The view's own size*, the output is the canvas size in device pixels (the display's pixel ratio, capped at 2).
- A cumulative history builds the heat up over the clip; a window or lifetime history shows a moving slice of time.
- Keyframe positions are display coordinates: with an [inverted world axis](camera.md#invert-world-axis), keys made before switching it point somewhere else after.

## For developers

### What a render does

1. Takes a test capture of the frame to learn the exact output size in device pixels.
2. Picks a codec through WebCodecs for the chosen file: H.264 for MP4 (`avc` format: length-prefixed NAL units, the encoder's `avcC` record kept for the container), H.264 then VP9 then VP8 for MKV, **VP9** (`vp09.00.10.08`) then **VP8** for WebM, at the chosen bitrate and frame rate. Without `VideoEncoder` it stops with *This browser has no VideoEncoder - WebCodecs is required to write a video*; with no codec, *No supported video codec* and the ones tried. Before that, with a size of its own, the engine's drawing buffer is set to it (`Engine.renderSize`) and given two frames.
3. Takes over the settings a render needs: pauses playback, switches **adaptive budget off**, **progressive refinement on** and the sprite budget to 64M per frame (the adaptive budget protects the frame rate, which is the wrong goal here: it would read each slow converging frame as a reason to splat fewer rows, which needs more frames to converge), and switches the timeline from **All** to **Play**. The history setting (cumulative, window, lifetime) is left as it is: a render is meant to be the thing you were looking at, played through and written down.
4. For each output frame *f* of *n*, at *u* = f / (n - 1):
   - places the camera at the path's pose at *u* (if there are keys);
   - seeks the playhead to the same fraction *u* of the timeline's range (the selected session's span in box replay);
   - forces a fresh estimate, even when the camera did not move - inheriting the previous frame's accumulation would leave a ghost of the previous window;
   - waits, frame by frame, until the picture is exact (all candidate rows drawn in one frame, or the accumulation complete), up to the wait cap;
   - captures the composited frame and encodes it, with a keyframe every 2 seconds of output so the file is seekable.
5. Muxes the frames with timestamps chosen from the frame rate - the wall-clock time each frame took is irrelevant: WebM or Matroska ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts); Matroska with the `avcC` as CodecPrivate), or MP4 ([`mp4.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/mp4.ts): `ftyp`, `mdat`, `moov` with one track, timescale 1000 × fps, one chunk, every keyframe in `stss`, 64-bit offsets past 4 GB).
6. Restores the drawing buffer's size, the budget, the field of view, the timeline mode, the playhead and whether it was playing.
7. Downloads the video as `3dheat-<width>x<height>-<frames>f.<ext>` and reports `N frames at W×H, X MB - every frame exact`, or how many hit the wait cap.

**Cancel** stops after the current frame (*Render cancelled.*) and restores the settings.
