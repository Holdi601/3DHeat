---
title: Keyboard and mouse reference
parent: Camera and controls
nav_order: 2
---

# Keyboard and mouse reference

Every keyboard and mouse binding of the Heatmap tab. Keys are ignored while a text box (and, for the global keys, a menu) has focus. The short version is also printed at the bottom left of the view.

## Camera

From [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Input | Effect |
|---|---|
| `W` / `↑` | Forward along the view direction |
| `S` / `↓` | Back |
| `A` / `←` | Strafe left |
| `D` / `→` | Strafe right |
| `Space` / `E` | Up |
| `Q` / left `Ctrl` | Down |
| `Shift` (either) | Hold: 6× speed |
| left `Alt` | Hold: 15% speed |
| Left or right drag on the view | Look (pointer locked while the button is held) |
| Wheel (perspective) | Fly speed ×1.5 per notch (at most 4 notches per wheel event) |
| Wheel (parallel) | Zoom |
| Right-click | Opens no context menu over the view |

## Global

From [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Key | Effect |
|---|---|
| `K` | Play / pause the [timeline](timeline.md) |
| `F` | Frame the data |
| `C` | Copy the camera's position, yaw and pitch ([camera readout](camera.md#camera-readout)) |
| `G` | Go to a typed point: opens the box under the camera readout |
| `Esc` | Close the pick card |
| `1` | [Heat](heat.md) |
| `2` | [Difference](difference.md) |
| `3` | [Team heat](team-heat.md) |
| `4` | [Box replay](box-replay.md) |
| `5` | [Lines](line-heat.md) |
| `]` | Far cull bound out ×1.12 (`Shift`: ×1.35) |
| `[` | Far cull bound in ÷1.12 (`Shift`: ÷1.35) |
| `\` | Far cull bound off / back on where it was ([Depth and culling](depth-and-culling.md#keyboard)) |

The number keys go through the same check as the mode bar: a key for a mode the bar shows as unavailable for the loaded data does nothing.

## Match replay

In box replay and the Match tab's figure replay ([Figure replay](figure-replay.md#match-replay-tacviews-tools)):

| Key | Effect |
|---|---|
| `B` | Add a bookmark: the moment and the camera |
| `M` | 2D map: corner, whole view, off |
| `V` / `Shift+V` | Next / previous camera view of the followed unit |
| `H` | Head-up display in the cockpit and padlock views |
| `Page Down` / `Page Up` | Next / previous event of the kinds the event list shows |
| `.` / `,` | A second on / back, paused (`Shift`: ten seconds) |
| `Esc` | Stop following |

## Click-to-pick

With **Click shows what is there** on and the ruler off ([Click-to-pick](camera.md#click-to-pick)):

| Input | Effect |
|---|---|
| Left-click (without dragging more than 4 px) | Show the data point, or else the spot on the level, under the pointer |

## Measure

With **Ruler active** ([Measure](measure.md)):

| Input | Effect |
|---|---|
| Left-click (without dragging more than 4 px) | Drop a point |
| Right-click | Remove the last point |

## Elsewhere

| Where | Input | Effect |
|---|---|---|
| Any slider's grip (the handle beside the number) | Drag up / down | Change the value continuously, faster the further you drag; hold `Shift` for fine control. Release to stop. |
| The speed display over the view | Drag up / down | Change the fly speed the same way. |
| Pose boxes | `Enter` | Apply the typed position or orientation. |
| Curve editor | Double-click / Alt-click / right-click | Add a point / remove a point ([Sprite shape](sprite-shape.md#the-curve-editor)). |

## Race analysis tab

In the Race analysis tab `K` plays and pauses the race replay, `Home` rewinds it, and the number keys do nothing. See [Race analysis](race-analysis.md).

## Gamepad

See [Gamepad and HOTAS](gamepad.md).
