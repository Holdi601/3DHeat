---
title: Keyboard and mouse reference
parent: Camera and controls
nav_order: 2
---

# Keyboard and mouse reference

Every key and mouse action in one place, so you can find the one you need. Click the view first so it has the keyboard. Keys are ignored while a text box or a drop-down has focus. The short version is also printed at the bottom left of the view.

Quick finder:

| I want to ... | Press |
|---|---|
| fly | `W A S D`, drag to look |
| see everything | `F` |
| play or pause | `K` |
| play backwards | `J` (press again to pause), forwards `L` |
| see what the colours mean | `?` or `F1` |
| undo in the Tactics tab | `Ctrl+Z` |

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
| `Esc` | Close the pick card; then stop looking at the second unit; then stop following a unit |
| `T` | Tactical display look on or off ([Match replay](match-replay.md#display-style)) |
| `?` / `F1` | Help mode: what the colours mean ([Settings, units and keys](settings.md#help-mode)) |
| `1` | [Heat](heat.md) |
| `2` | [Difference](difference.md) |
| `3` | [Team heat](team-heat.md) |
| `4` | [Lines](line-heat.md) |
| `]` | Far cull bound out ×1.12 (`Shift`: ×1.35) |
| `[` | Far cull bound in ÷1.12 (`Shift`: ÷1.35) |
| `\` | Far cull bound off / back on where it was ([Depth and culling](depth-and-culling.md#keyboard)) |

The **Figure overlay** mode has no number key; pick it in the mode bar or open the Match tab. The number keys go through the same check as the mode bar: a key for a mode the bar shows as unavailable for the loaded data does nothing.

## Match replay

In the Figure overlay mode, which the Match tab uses ([Match replay](match-replay.md)). They work when a unit is followed or not, except where noted:

| Key | Effect |
|---|---|
| `B` | Add a bookmark: the moment and the camera |
| `M` | 2D map: corner, whole view, off |
| `V` / `Shift+V` | Next / previous camera view of the followed unit |
| `H` | Head-up display in the cockpit and padlock views |
| `Page Down` / `Page Up` | Next / previous event of the kinds the event list shows |
| `J` | Play backwards; again, to pause |
| `L` | Play forwards; again, to pause |
| `.` / `,` | A second on / back, paused (`Shift`: ten seconds) |
| `Esc` | Stop looking at the target first, then stop following |
| `Ctrl`+click or `Alt`+click a unit (in the view or in the unit list) | Look at it from the followed unit (the two-unit view); click it again to drop it |
| `Shift`+click two units | Measure between them: bearing, range, height difference |

`V` needs a followed unit. `M` is the 2D map here, and "move" in the Tactics tab.

## Following a unit

While the camera follows a unit, the wheel and the flying keys steer around the unit instead of flying free ([Camera](camera.md#while-following-a-unit)):

| Input | Effect |
|---|---|
| Wheel, `W` / `S` | Closer / further (higher / lower in the satellite view). Not in the cockpit and padlock views. |
| `A` / `D`, `Q` / `E` | Orbit around the unit (chase and orbit views) |
| Drag | Look around the unit; in the cockpit, look around inside |
| `V` / `Shift+V` | Next / previous camera view |
| `H` | Head-up display (cockpit and padlock views) |
| `Esc` | Stop looking at the second unit, then stop following |

## Tactics board

In the Tactics tab ([Tactics board](tactics-board.md)). `F`, `C`, `G` and `T` work as above; the number keys do nothing.

| Key | Effect |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` or `Ctrl+Shift+Z` | Redo |
| `Enter` | End the arrow being drawn (a double click or a right click does the same) |
| `Esc` | Cancel a drag; else drop the arrow or the move in progress; else deselect |
| `Delete` or `Backspace` | Delete the selection |
| `W` / `E` / `R` | Move / Rotate / Scale gizmo for the selection (key scheme **W / E / R**) |
| `G` / `R` / `S` | Move / Rotate / Scale gizmo for the selection (key scheme **G / R / S**) |
| `R` | With nothing selected: turn the next figure to place by 15°. `Shift+R` turns it back. |
| `M` | With a figure selected: move it to the next click |
| `K` | Play or pause the plan |
| Shift+click | Add to or remove from the selection |
| Shift+drag | Draw a box round what to select |
| `Ctrl` while dragging a handle | Snap to the grid or the angle step |

The gizmo keys work only while something is selected; with nothing selected, `W A S D` fly the camera as usual.

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

## Keys the viewer keeps from the browser

Some browser shortcuts would close or reload the page and lose a loaded session; the viewer keeps them for itself. The list is generated from the code: [Browser keys](ref-browser-keys.md).

## Gamepad

See [Gamepad and HOTAS](gamepad.md).
