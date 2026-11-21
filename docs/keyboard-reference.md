---
title: Keyboard and mouse reference
parent: Camera and controls
nav_order: 2
---

# Keyboard and mouse reference

Every key and mouse action in one place, so you can find the one you need. Click the view first so it has the keyboard. Keys are ignored while a text box or a drop-down has focus. In the viewer, `?` shows the same list (the key sheet), and `Ctrl+K` finds any action or setting by name with its key ([Interface guide](ui-guide.md)). One table in the code drives the key sheet: [`shortcuts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/shell/shortcuts.ts).

Quick finder:

| I want to ... | Press |
|---|---|
| fly | `W A S D`, drag to look |
| see everything | `F` |
| play or pause | `K` |
| play backwards | `J` (press again to pause), forwards `L` |
| find any action or setting | `Ctrl+K` |
| see every key | `?` |
| see what the colours mean | `F1` |
| hide the side panel | `Ctrl+B` |
| undo in the Tactics tab | `Ctrl+Z` |

## Everywhere

From [`keys.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/shell/keys.ts). These work on every tab, ahead of the tab's own keys.

| Key | Effect |
|---|---|
| `Ctrl+K` | Command palette: search every action, workspace, mode, camera view, panel and setting by name ([Interface guide](ui-guide.md#command-palette)). Works with the focus in a box too. |
| `?` | Key sheet: every key, grouped by where it works (not while typing in a box) |
| `F1` | Help mode: what the colours mean, and what the label, figure or control under the pointer is ([Settings, units and keys](settings.md#help-mode)). Works with the focus in a slider or a list too. |
| `Ctrl+B` | Hide or show the side panel: the view takes the whole width |
| `Ctrl+Shift+1` … `Ctrl+Shift+5` | Heatmap, Race analysis, Match, Tactics, Vehicles |
| `Esc` | Close the palette, the key sheet or the settings (before anything else `Esc` does) |

## Camera

From [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Input | Effect |
|---|---|
| `W` / `↑` | Forward along the view direction |
| `S` / `↓` | Back |
| `A` / `←` | Strafe left |
| `D` / `→` | Strafe right |
| `Space` / `E` | Up |
| `Q` / left `Ctrl` | Down (Ctrl can be swapped for `Z`, or left out: View panel, **Fly down with**) |
| `Shift` (either) | Hold: 6× speed |
| left `Alt` | Hold: 15% speed |
| Left or right drag on the view | Look (pointer locked while the button is held) |
| Wheel (perspective) | Fly speed ×1.5 per notch (at most 4 notches per wheel event) |
| Wheel (parallel) | Zoom about the pointer, a quarter per notch |
| `W` `A` `S` `D` (parallel) | Pan the picture: up, left, down, right, at the same pace on screen at any zoom |
| `Space` `E` / `Q` (parallel) | Move up and down; nothing behind the camera is cut away |
| Right-click | Opens no context menu over the view |

## Global

From [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Key | Effect |
|---|---|
| `K` | Play / pause the [timeline](timeline.md) |
| `F` | Frame the data (not with `Ctrl`, `Alt` or `Cmd` held, and not by a held key repeating) |
| `C` | Copy the camera's position, yaw and pitch ([camera readout](camera.md#camera-readout)) |
| `G` | Go to a typed point: opens the box under the camera readout |
| `Esc` | Close the pick card; then stop looking at the second unit; then stop following a unit |
| `T` | Tactical display look on or off ([Match replay](match-replay.md#display-style)) |
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

In the Tactics tab ([Tactics board](tactics-board.md)). `F`, `C`, `G` and `T` work as above; the number keys pick the board's tools instead of heat modes.

| Key | Effect |
|---|---|
| `1` or `V` | Select tool |
| `2` or `P` | Place tool |
| `3` or `L` | Waypoints tool |
| `4` or `H` | Throw tool |
| `5` or `O` | Area tool |
| `6` or `N` | Note tool |
| `7` or `B` | Draw tool (pen, highlighter, circle) |
| `8` or `X` | Erase tool |
| `9` or `U` | Measure tool |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` or `Ctrl+Shift+Z` | Redo |
| `Ctrl+A` | Select everything in the shown step |
| `Enter` | Finish the route, arrow or ruler being drawn |
| Double click, right click (without dragging) | Finish it too: the double click puts the last waypoint down first |
| `Esc` | Cancel a drag; else finish what is being drawn (or drop it when it has only its start point); else stop a move; else deselect |
| `Backspace` while drawing | Take the last point back |
| `Delete` or `Backspace` | Remove the selection, after a confirmation |
| `W` / `E` / `R` | Move / Rotate / Scale gizmo for the selection (key scheme **W / E / R**) |
| `G` / `R` / `S` | Move / Rotate / Scale gizmo for the selection (key scheme **G / R / S**) |
| `R` | With nothing selected: turn the next figure to place by 15°. `Shift+R` turns it back. |
| `M` | With a figure selected: move it to the next click |
| `K` | Play or pause the plan |
| `I` | Task picker for the selected units ([Unit tasks](tactics-tasks.md)); `Enter` takes the first match |
| `Shift+I` | Legend of the task symbols |
| `Shift+1` … `Shift+9` | Give the selection a task: attack, defend, patrol, sweep, overwatch, suppress, recon, hold until, CAP / orbit |
| `Enter` / `Esc` while drawing a task's points | Finish them / keep what is drawn if it is enough, else drop the drawing |
| Shift+click | Add to or remove from the selection |
| Shift+drag | Draw a box round what to select (adds to the selection) |
| `Ctrl` while dragging a handle | Snap to the grid or the angle step |

The gizmo keys work only while something is selected; with nothing selected, `W A S D` fly the camera as usual. The tool letters are ones the camera does not fly with. Each tool button shows its digit, and its tooltip both keys.

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

## Ctrl+W and other browser keys {#ctrl-w}

Left `Ctrl` flies down, so `Ctrl+W` is "forward and down" to the hand - and "close the tab" to the browser. A web page cannot stop `Ctrl+W`, `Ctrl+T` or `Ctrl+N` in a normal browser window. The viewer does what a page can:

- In full screen (the **Full screen** button in the View panel's camera section) it locks these keys with the Keyboard Lock API, so they reach the viewer and fly the camera. Browser full screen with `F11` is not the same and does not lock them. An installed app window may lock them too, where the browser allows it.
- Outside full screen, the browser asks before it closes or reloads the tab while data or a level is loaded, or while the camera is being flown (and for three seconds after).
- To keep `Ctrl` out of it, set **Fly down with** to `Q / Z` or `Q` in the View panel. The choice is kept in this browser.

Which keys the viewer keeps from the browser: [Browser keys](ref-browser-keys.md).
