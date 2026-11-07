---
title: Camera and controls
nav_order: 7
has_children: true
---

# Camera and controls

The camera is a free-fly camera with a perspective and a parallel projection, preset views, a typed pose, and depth of field. Its settings are in the **Camera & scene** panel at the bottom of the sidebar (also shown in the Race analysis and Match tabs). The implementation is [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Flying

| Input | Effect |
|---|---|
| `W` `A` `S` `D` or the arrow keys | Forward (along the view, including its pitch), left, back, right |
| `Space` or `E` | Up (world up) |
| `Q` or left `Ctrl` | Down |
| `Shift` (held) | 6× faster |
| left `Alt` (held) | 15% speed |
| Drag with the left or right mouse button | Look around. The pointer is locked while dragging. |
| Mouse wheel | Fly speed ×1.5 per notch (perspective); zoom (parallel) |
| `F` | Frame the data |
| Click (without dragging) | Show what is under the pointer ([Inspecting the view](#inspecting-the-view)) |
| `C` | Copy the camera's position, yaw and pitch |
| `G` | Go to a typed point |
| `Esc` | Close the pick card |

Moving keys add up with a [gamepad](gamepad.md); see the [keyboard reference](keyboard-reference.md) for everything else. Keys are ignored while a text box has focus. Pitch is clamped just short of straight up and down.

## Camera & scene panel

### Projection

**Projection**: *Perspective* (default) or *Parallel*.

*Parallel* (orthographic) removes foreshortening, so two hotspots of equal density read as the same size anywhere in the frame - the comparison a map heatmap exists to support - and it is what makes an isometric view isometric. In parallel mode the mouse wheel zooms (there is no forward motion that changes scale) and the [speed display](#fly-speed) is hidden.

**Switching keeps the subject the same size.** A parallel projection has no field of view, so its frustum height is unrelated to the camera's distance; flipping naively either zooms wildly or shows nothing. Going to parallel sets the frustum height to what the perspective camera covers at the focus distance (2 × distance × tan(fov / 2), the focus distance being the distance of the last framing). Going back restores the perspective pose you left, at the same apparent scale, rather than wherever the parallel view wandered.

### Preset views

| Group | Buttons | Orientation |
|---|---|---|
| **Isometric** | **NE**, **NW**, **SE**, **SW** | Parallel, pitch -35.264° (= atan(1/√2), the angle at which all three axes project to the same length), yaw -45°, 45°, -135°, 135°. Four corners, because a single one always hides half the map behind whatever is nearer. |
| **Elevations** | **Top**, **Bottom**, **Front**, **Back**, **Left**, **Right** | Parallel. Top looks straight down (pitch -89.9°), Bottom straight up, Front along -Z (yaw 0°), Back along +Z (180°), Left along -X (-90°), Right along +X (90°). |
| | **Back to perspective** | Return to the perspective pose you left. Disabled in perspective. |
| | **Three-quarter view** | Perspective, yaw -35°, pitch -28°. |

Every preset switches the projection itself - under perspective a "top view" still converges towards a vanishing point and equal areas stop reading as equal - and frames the data from that direction.

### Field of view

**Field of view** - the vertical angle. Default 65°, 10-140° on the track (179° with the handle), with buttons **Flat 20°**, **Long 35°**, **Normal 50°**, **Wide 65°**, **Very wide 90°**. Narrow flattens perspective and reads more like a parallel projection; wide exaggerates depth and makes distances hard to judge. It stays live in parallel mode, where it sets the scale the switch back solves for and the distance **Frame** uses.

### Fly speed

**Fly speed** - world units (metres) per second at full throttle. Default 120; on every load the data's horizontal extent / 12. Logarithmic, 0.02-20,000 (200,000 with the handle; the handle changes it by ratios, not amounts). The mouse wheel multiplies or divides it by 1.5 per notch, within 0.02-200,000.

The same value is shown at the bottom right of the view (perspective only): the speed in m/s or km/s and the time it takes to cross the data (or the level, when a 3D level is loaded) at that speed. Drag it up or down to change the speed.

### Near and far

**Near** (default 0.5) and **Far** (default 40,000) clip distances. Both are recalculated from the data on every load (near = max(0.05, extent / 20,000), far = extent × 12) and widened, never narrowed, by a 3D level that is larger ([Levels](levels.md#what-a-level-does-for-the-heat)). Their ratio sets the depth precision occlusion relies on, so a tiny near with a huge far weakens [occlusion](depth-and-culling.md). Seen from outside the scene or high above its ground, the near plane actually used moves out to 2% of that distance, so a map seen from far above keeps enough depth precision that water and shore do not flicker; the box still shows the value set.

### Other controls

| Control | Default | Meaning |
|---|---|---|
| **Invert Y** | off | Inverts mouse look up/down. |
| **Depth of field** | off | See below. |
| **Gamepad** | enabled | See [Gamepad and HOTAS](gamepad.md). |
| **Pose** | | See below. |
| **Inspect** | | The camera readout, click-to-pick, the yaw convention and *Go to a point*; see [Inspecting the view](#inspecting-the-view). |
| **Frame dataset (F)** | | Fits the data (in the Race analysis tab: the laps) to the view, keeping the current direction. The camera is placed at r / tan(fov / 2) from the centre, r being half the diagonal of the data's bounds. |
| **Grid**, **Axes** | on, on | A ground grid with a 1/2/5 × 10ⁿ spacing of about 1/40 of the data's span (extending to 1.5 × the data, between 8 and 120 grid steps), and coloured axes. |
| **Invert world axis** X, Y, Z | off | See below. |

### Pose

Five number boxes - **X**, **Y**, **Z** and **yaw °**, **pitch °** - that follow the camera while none of them has focus. Type a value and press `Enter` (or leave the box) to move the camera there. **copy** puts `pos X Y Z · yaw A · pitch B` on the clipboard (with `(game yaw)` after it when that convention is chosen). Flying is how you explore; coordinates are how you reproduce a view. They are the same numbers as the [camera readout](#camera-readout): the data's own coordinates, including when an axis is inverted, and the yaw in the chosen [convention](#yaw-conventions).

### Invert world axis

**Invert world axis X / Y / Z** draws the world with that axis reversed. A game that keeps a left-handed world comes out mirrored in this right-handed viewer - right-hand bends drawn as left-hand ones - and inverting X or Z puts it back. **Only the drawing changes**: the data, the analysis and every coordinate the tools show (pose, ruler, slice) stay the game's own. The view flips in place, keeping you looking at the same spot. This setting is remembered in the browser (`localStorage` key `heat3d.mirror`); compare the load-time [flips](axes-units-and-time.md#flips), which change the data.

## Inspecting the view

Where the camera is, what is under the pointer, and going to a point - the **Inspect** block of the Camera & scene panel, and two overlays at the top left of the view. The code is in [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) and [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Control | Default | Meaning |
|---|---|---|
| **Camera position over the view** | on | The camera readout, below. Also closed with its **×**. |
| **Click shows what is there** | on | Click-to-pick, below. |
| **Yaw convention** | Viewer | Which yaw the readout, the pose boxes and the jump box show and read. |

These three are remembered in the browser (`localStorage` key `heat3d.inspect`).

### Camera readout

At the top left of the view: the camera's **x**, **y**, **z**, **yaw** and **pitch**, live, with a tag naming the yaw convention. It shows the same numbers as the [Pose](#pose) boxes and costs nothing while flying (it is written to the page on the frame clock, without re-rendering the panels).

- **copy** (or `C` anywhere outside a text box) puts `x X y Y z Z yaw A pitch B (viewer yaw)` on the clipboard, with `.` decimals whatever the language - a line the jump box, and any script, reads back.
- **go to** (or `G`) opens a box under it: paste a point and press `Enter` to look at it, or paste a whole copied pose to stand in that view. `Esc` closes the box.

### Coordinates: the data's own frame

Every coordinate the inspection tools show or accept is in the **loaded data's own frame**: the [axis mapping](axes-units-and-time.md) of the load (up axis, flips, scale) is undone. A position read off the view is the number the source table holds, and a number from the table typed into the jump box lands on that spot. When the mapping changes nothing (a Y-up, unscaled load - which is what the capture tools and the level exporters write) this is simply the world; otherwise the readout carries a **data frame** tag. Without a dataset, coordinates are world coordinates. Yaw and pitch are always about the viewer's world, Y up.

### Yaw conventions

| Convention | Yaw 0° looks along | Grows towards | Used by |
|---|---|---|---|
| **Viewer** | -Z | -X | the fly camera, [preset views](#preset-views) |
| **Game / capture tools** | +X | -Z | the capture tools' `yaw` columns and poses; in a level exported in the viewer's frame, the game's own yaw |

Pitch is the same in both: up from the horizontal. The two differ by a quarter turn and nothing else:

> viewer yaw = game yaw - 90°

A direction `d` is `(cos p · cos y, sin p, -cos p · sin y)` in the game convention and `(-sin y · cos p, sin p, -cos y · cos p)` in the viewer's. Choose **Game / capture tools** to type a yaw straight out of a capture table, or to compare the readout with one.

### Going to a point

**Go to a point**, in the Inspect block (and the readout's **go to** box):

- the text box takes `x, y, z` or `x y z` (or `x; y; z`), with a decimal point or a decimal comma - `-321.6, 137.8, -59.9` and `-321,6 137,8 -59,9` are the same point. Five numbers add a yaw and pitch, and a pose copied from the readout or the pose boxes is read whole, labels and convention included;
- **yaw °** and **pitch °** (optional) turn the camera, in the chosen convention;
- **Look at** keeps the heading (tipped to look down at least 20° if it was looking level) and backs off along it to the current distance, held between 0.3% and 3% of the scene's width - 6 to 60 m on a two-kilometre level. The focus distance, the parallel view's height and the fly speed follow, so the view arrives usable;
- **Stand here** puts the camera on the point, turned to the yaw and pitch given, or as it was.

A pasted pose with its own yaw and pitch always stands in that view.

### Click-to-pick

A click on the view - press and release without dragging more than 4 pixels; a drag still looks around - shows a card at the top left with what is under the pointer. While the [ruler](measure.md) is on, clicks go to the ruler instead.

**A drawn data point wins.** The nearest sample within 8 pixels of the click, of those actually drawn: the rows in the time window and the lifetime, passing the [filters](filters.md), the groups shown and the difference split, inside the distance cull and a slice that clips the heat. In the box replay, a box under the pointer (anywhere on it). The card lists every column the row carries, under the source's own column names - time (wall-clock, or the file's own seconds with `m:ss.ss`), person, group, session, each retained column, the position and the look direction - and the distance from the camera. Only columns the load kept are in memory: a column not chosen as a [filter column](column-mapping.md) is not shown.

**Otherwise the level's surface**: the point where the click's ray meets the level's real triangles (not the ruler's reference plane), with the **part** it belongs to (the exporter's name, `structure:props`, `ground:terrain …`), its **kind** (ground, structure, water, map image), the coordinates and the distance. Geometry hidden by a slice or the distance cull is passed through. Where the level has a [navigation mesh](model-levels.md#navigation-meshes), a line names it and says whether the spot lies on it (✓). A part name prefixed `≈` was guessed from the parts' bounding boxes, because that part of the level was simplified on loading.

The card stays until it is closed (**×**, `Esc`), another click answers something else, or a click on empty space. A cyan cross is drawn at the point in the scene and a ring over it on screen. Its buttons: **copy** (every value, and the coordinates as `x, y, z`), **Look at**, and **Stand here** (on a data point, looking the way the row looked when it has a look direction; on a surface, 1.7 m above it).

The level is indexed for picking on the first click that needs it: a grid of columns over its footprint, built a few milliseconds at a time between frames so the view never stops (about a second of work for the test level's nine million triangles), and kept until the level changes. Until then the card says *Preparing the level for picking* with a percentage, and answers the click when it is ready. A data-point search over more than four million drawn rows is spread over frames the same way.

## Depth of field

A collapsible section in Camera & scene, titled *Depth of field - on* while enabled. Off by default: it is a presentation effect, and the default view should show the data rather than an interpretation of it.

| Control | Default | Range (jog) | Meaning |
|---|---|---|---|
| **Enabled** | off | | |
| **Focus on what was framed** | on | | Focus at the distance the last framing used (*Focused at N m.*). |
| **Focus distance** | 1000 | 1-200,000, logarithmic (10,000,000) | Shown when the focus is manual. |
| **Aperture** | ±35% | ±2% to ±200%, logarithmic (±3200%) | The depth kept sharp, as a fraction of the focus distance - relative rather than an f-number, because scenes range from a room to an eight-kilometre map. |
| **Maximum blur** | 12 px | 1-48 (256) | The largest blur radius; the cost scales with it. |

It blurs the **level, grid and boxes** - *not the heat*. Heat at a pixel is the sum of sprites at many depths, so it has no single depth to be out of focus at; blurring it by whatever geometry sits behind it would be wrong wherever it floats in front. Sharp data over softened context is also the more useful of the two. The blur is a 24-tap golden-angle gather in the composite pass, weighted so a sharp foreground is not smeared outward by the blurry background behind it. Changing it redraws without restarting the heat accumulation.

## Canvas resolution

The canvas is rendered at the display's pixel ratio, capped at 2. The heat buffer may be rendered at a lower resolution than that ([Heat resolution](performance-and-stats.md)).

## Pages in this section

- [Gamepad and HOTAS](gamepad.md)
- [Keyboard and mouse reference](keyboard-reference.md)
