---
title: Race analysis
nav_order: 50
has_children: true
---

# Race analysis

The **Race analysis** tab compares two or more laps of one course: where one
lap loses time to another, why, and what to do about it. It shares the
canvas, the camera and the loaded course model (**Background / level**) with
the heatmap, and nothing else - it has its own state
([`src/state/raceStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/raceStore.ts)),
its own sidebar and its own bar under the view.

This page is the map of the tab. Each part has its own page:

| Page | What it covers |
|---|---|
| [Loading laps](race-loading-laps.md) | every file format, folders and courses, car names, demo laps, the lap list, reference and focus |
| [Replay and the 3D scene](race-replay-and-scene.md) | the transport bar, the three replay modes, lining cars up, the chase camera, lines, maps, cars, labels, mirrored worlds |
| [Charts and the HUD](race-charts-and-hud.md) | the distance charts, the graph picker, hover and zoom, the car cards, the channel table |
| [Car control events](race-control-events.md) | lock-ups, wheelspin, oversteer, spins, understeer, hits, crashes, ABS/TC, handbrake, air - how each is detected, with every threshold |
| [Corner-by-corner analysis](race-corner-analysis.md) | alignment by distance, corners and segments, the time account of a corner, every cause and the order they are tried in, the line shape and the advice |
| [Car profiles and comparison](race-car-profiles.md) | what each car can do, measured from its laps; *Cars compared*; what the car decides in each corner |
| [Course statistics](race-course-statistics.md) | many laps of one course: mistakes per corner and per kind, the mistake map, the heatmap export, performance limits |
| [Race analytics: the method](race-analytics.md) | the research behind the rules, with sources |
| [Other racing games](other-games.md) | what the viewer does with laps from each game: slip and drift worked out where a game does not send them, mirrored worlds, the extra channels |

## The screen

**Sidebar**, top to bottom (sections can be folded):

1. **Laps** - load, list, show/hide, reference, focus, chase.
   See [Loading laps](race-loading-laps.md).
2. **Course statistics** - only from three loaded laps on.
   See [Course statistics](race-course-statistics.md).
3. **Where to improve** - the focused lap's findings, corner by corner.
   See [Corner-by-corner analysis](race-corner-analysis.md).
4. **Corner by corner** (or *Corner by corner - class X* with several
   classes) - the quickest lap through each corner and its line. Shown with
   two or more laps.
5. **Car control** - the focused lap's locks, slides, pushes and hits.
   See [Car control events](race-control-events.md).
6. **Cars compared** (or **The car** with one car) - see
   [Car profiles and comparison](race-car-profiles.md).
7. **View** - which map is painted on the track and what is drawn.
   See [Replay and the 3D scene](race-replay-and-scene.md).
8. The shared **Level** and **Camera** panels (course model, axis inversion,
   camera) - documented with the heatmap.

**The view** shows the course, the driven lines, the map, the cars, labels
pinned to the track, and up to six car cards top left (see
[Charts and the HUD](race-charts-and-hud.md)). With no laps loaded it says
"No laps loaded - Drop two or more lap files here, or load the demo laps from
the sidebar."

**The bar under the view** holds the replay transport and, unless hidden,
the distance charts.

## Quick start

1. Open the **Race analysis** tab (beside **Heatmap** at the top of the
   sidebar).
2. Press **Demo laps** to see what the tab does with three made-up laps, or
   **Load lap files…** / **Folder…**, or drop files or folders on the view.
3. The fastest complete lap becomes the reference; the slowest other lap is
   focused. Click any lap in the list to focus it; ★ makes a lap the
   reference.
4. Read **Where to improve**. Click a finding: the cars are lined up 40 m
   before it, the camera frames it, the replay plays through it and the
   measurements open.
5. Hover the charts to move every car to that metre; Shift+click to line
   them up there.

## Keyboard

While the Race tab is open:

| Key | Does |
|---|---|
| **K** | play / pause the replay |
| **Home** | back to the start of the replay |
| digit keys | nothing (in the heatmap they switch modes) |

Keys typed into a text field or a drop-down are ignored. The camera keys
(WASD, Space/Q, Shift, Alt, mouse) work as in the heatmap; **F** frames the
loaded laps (as loading laps does).

## What happens when laps are loaded

Every time the set of laps, the reference or the language changes, the whole
analysis is redone (`analyse` in
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Derived channels are added to each lap where the game does not send them:
   drift angle, wheel slip from wheel speeds, in the air, loose ground, yaw
   rate ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. The reference is chosen and every lap is projected onto its path and
   resampled every 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Whether the game's world is mirrored is worked out from the laps
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Corners are found on the reference, and grouped into segments from one
   braking zone to the next ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per car: its envelope (grip, braking, pull per speed), its profile, its
   tyre curves ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per lap and segment: what it did (brake point, slowest point, full
   throttle, ...) and the line it drove ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per lap: its car-control events, each laid against the lap it is compared
   with there.
8. Per lap and segment: the time account against its comparison lap and the
   finding in words.
9. The time map and the cause map per lap.

The texts are produced in the current language; switching language runs the
analysis again (and renames the demo laps). A failure in the analysis is
shown under the **Laps** buttons as an error and the laps stay loaded.

## Many laps

- All loaded laps are analysed and counted; dozens take a second or two.
- Past **8** laps (`SHOW_ALL_UP_TO`), laps added are drawn only when they are
  the reference, the focused lap, or the best lap of the focused lap's class.
  *Show all* / *Only those looked at* switch.
- Past **10** visible cars (`PLAIN_PAST`), the laps not looked at (not the
  focus, the chased car or the reference) are drawn with lines thinned to a
  point every 6 m instead of 1.5 m, and plain cars.
- The charts draw at most **8** laps; the HUD shows at most **6** cards.
- The course statistics appear from **3** laps.

Details: [Course statistics](race-course-statistics.md#performance-with-many-laps).

## Default view settings

| Setting | Default |
|---|---|
| Map | Time map |
| Driven lines, Cars, Tyres & suspension, Labels, Track from the laps | on |
| All values on the cards | off |
| Car size | 1× |
| Charts | shown |
| Replay mode | From the line |
| Replay speed | 1× |
| Loop | on |

None of these are saved; a reload starts from the defaults. What is
remembered in the browser: the language, and the car names learned from lap
files (see [Loading laps](race-loading-laps.md#car-names)).

## Source files

| File | Role |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | reading lap files |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | the lap type, naming, demo laps |
| `src/race/derive.ts`, `handedness.ts` | derived channels, mirrored worlds |
| `src/race/align.ts`, `segments.ts`, `line.ts` | distance axis, corners, lines |
| `src/race/analysis.ts` | corners compared, causes, findings |
| `src/race/envelope.ts`, `profile.ts` | what a car can do |
| `src/race/control.ts`, `impacts.ts` | car control, hits and crashes |
| `src/race/stats.ts` | many laps |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay and drawing |
| `src/race/schema.ts`, `graphs.ts` | the channel table, the charts' rows |
| `src/ui/race/*` | the sidebar, the charts, the HUD, the labels |
| `src/state/raceStore.ts` | the tab's state and the replay clock |
