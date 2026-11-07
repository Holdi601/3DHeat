---
title: Replay and the 3D scene
parent: Race analysis
nav_order: 52
---

# Replay and the 3D scene

How the laps are played back together, and everything drawn in the 3D view
of the Race tab: driven lines, the three maps painted on the track, the
cars, bursts where a lap hit something, labels, and the drawing of mirrored
worlds.

Code: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

## The replay clock

One clock drives every lap: seconds of the **reference** lap. The engine
advances it every frame while playing (by frame time × replay speed); at the
end it goes back to 0 when **Loop** is on, otherwise it stops. The clock is
deliberately not part of the store, so the sidebar does not re-render every
frame; the HUD and the charts subscribe to it and update at most once a
frame.

**The replay's length** is the longest any lap runs on the clock: each lap's
time (minus its offset in *Lined up*), or the reference's time in *Side by
side*.

## The transport bar

Under the view, left to right:

| Control | Does |
|---|---|
| ⏮ | back to the start (also **Home**) |
| ▶ / ❚❚ | play / pause (also **K**) |
| speed | 0.25×, 0.5×, 1×, 2×, 4× |
| scrub slider | sets the clock directly, in 0.01 s steps |
| clock | `time / length · metres`: the clock as a lap time, the replay's length, and how far along the reference the reference car is |
| *From the line* / *Lined up* / *Side by side* | the replay mode (below) |
| **Line up here** | puts every car where the reference is now, and carries on from there |
| **Loop** | start again at the end (on by default) |
| **Hide charts** / **Show charts** | the distance charts under the bar |

The buttons are disabled until laps are loaded (one lap is enough to replay
it; comparisons need two).

## Replay modes

How each lap's own time follows from the clock:

| Mode | Each lap's time | What it shows |
|---|---|---|
| **From the line** (`start`) | the clock itself | every lap from its own start: a race between them, the gap growing as it did on track |
| **Lined up** (`anchor`) | the clock plus the lap's offset | every car on the same spot at the same moment, then let go - what happens from that point on, not from the start of the lap |
| **Side by side** (`locked`) | the time at which the lap reached the reference's current distance | every car held at the reference's distance all lap: speeds and inputs compared metre by metre |

**Offsets in *Lined up*:** for an anchor at `s` metres along the reference,
each lap's offset is its own time at `s` minus the reference's time at `s`,
both read from the aligned laps (see
[one distance axis](race-corner-analysis.md#one-distance-axis)). A lap that
does not cover `s` keeps offset 0. Choosing *Lined up* from the mode buttons
anchors at the reference's current distance.

A white post with a flag (14 m tall) marks the anchor in *Lined up* mode.

### Lining up

| Action | Anchor | Clock |
|---|---|---|
| **Line up here** | where the reference is now | unchanged |
| Shift+click on the charts | the clicked metre | 1.5 s before the reference reaches it |
| a finding in *Where to improve*, a numbered badge on the track, a row of *Corner by corner* with a finding | 40 m before where the finding's cause begins | 1.5 s before that point; then plays |
| a car-control event, a hit's label | 40 m before the event | 1.5 s before; then plays |
| a lap in the course statistics | as its finding or event | as above, with that lap focused |

Looking at a finding also frames it with the camera - a ball around the
middle of the finding's range, radius the larger of 40 m and half its length
plus 30 m (60 m for an event) - unless the camera is chasing a car.

### Chase camera

⌖ in the lap list makes the camera follow that car: 2.5 + 4 × car size metres
behind it and 0.9 + 1.1 × car size metres above, looking along its direction
of travel, pitched down to the car, eased (20% of the way each frame) so it
does not shake with every wobble. ⌖ again releases it. The chased car is
drawn a little lighter, with a white ring on the ground, and its card is
highlighted.

### What a car is at a moment

`stateAt` interpolates each channel between the two samples around the
lap's time. Channels that step (gear, flags) take the nearest sample.
A lap that has finished parks on the line.

**Heading.** The direction of travel comes from positions a few metres
apart (at least 2 m either side, so a wobble does not turn the car). The
body's heading comes from the game's yaw only once it is fitted to the
direction of travel - sign and offset, by circular mean over samples faster
than 10 m/s (at least 20) - and only if it then agrees with it (circular
variance under 0.05, about 18° of scatter); otherwise the body points along
the direction of travel. That keeps a slide visible (body and travel apart)
without trusting a game's angle convention.

**Steering and sides.** Which way a positive steer turns the car, and on
which side the game's right-hand wheels belong, are measured from the lap:
the steering against the turning of the path, and which side's suspension
compresses on the outside of turns (without suspension data, Forza games are
taken as mirrored).

## The View section

| Control | Default | Does |
|---|---|---|
| **Lines** / **Time map** / **Cause map** / **Mistake map** | Time map | what is painted along the track (below); *Lines* paints nothing |
| legend | - | *gains ↔ loses* for the time map, the cause colours for the cause map, *few laps ↔ most laps* for the mistake map |
| **Driven lines** | on | each visible lap's line in its colour |
| **Cars** | on | the cars, and the HUD cards' sources |
| **Tyres & suspension** | on | tyre temperature, slip rings, suspension pushrods and other per-wheel glyphs, and roof lamps on the cars |
| **Labels** | on | corner names, numbered badges, hit labels, the mistake map's corner labels |
| **Track from the laps** | on | a road surface for a course with no extracted model (hidden while a course model is loaded) |
| **All values on the cards** | off | every channel listed on each HUD card |
| **Real car shapes** | on | each car in the shape of its counterpart (see [The cars](#the-cars)); off: the open single-seater, which hides nothing of the telemetry |
| **Car size** | 1× | 1× to 10× in steps of 0.5; 1× is the car's real size, as long and wide as it is in the game. Nothing but this slider changes it |

## Driven lines

Each visible lap's path through its own samples, in its colour, drawn
0.12 m below the recorded position (a car's recorded position is its
reference point, 0.28 to 0.47 m above the road on extracted Forza courses).
A point is kept every 1.5 m; with more than 10 laps visible, the laps not
looked at keep one every 6 m (every vertex goes to the GPU every frame).

## The maps

All three are ribbons along the **reference** path, 0.2 m below the
recorded positions, one quad per 2 m grid step.

### Time map (`where`)

For the focused lap: seconds gained or lost per metre against the lap it is
compared with at that point (the best of its class, or for the reference the
quickest other lap through each segment), from the change of the aligned
delta per grid step, smoothed over ±10 m. Red where it loses time, green
where it gains, grey in between; the colour scale is the 95th percentile of
the absolute values, so spikes are clipped and most of the lap is in range.
6 m wide.

### Cause map (`why`)

For the focused lap: each loss painted over the range where its **cause**
is (not where the time shows), coloured by the cause's group, the costliest
finding winning where two overlap. Width `3 + 9·√(cost / biggest cost)`
metres; where nothing was lost, a grey 2 m strip. The finding selected in
*Where to improve* is painted white.

| Group | Colour | Findings |
|---|---|---|
| braking | orange | driver losses in the braking phase |
| entry | magenta | driver losses on the way in and through the middle |
| exit | blue | driver losses on the way out |
| straight | yellow | driver losses on the straight |
| car | grey | what the car explains |
| context | dark grey | the situation (a race start against a flying lap) |

### Mistake map

How many of all the laps (of the classes picked in the course statistics)
made a mistake at each metre - of every kind, or only the one picked in the
statistics. Each lap counts once per metre; each mistake's range is widened
by 6 m either side so a short one shows. Width `3 + 10·(laps / most laps)`
metres and a colour from dim brown to bright orange; grey 2 m where no lap
made one. See [Course statistics](race-course-statistics.md#the-mistake-map).

## Track from the laps

For a game whose course has not been extracted, a road is drawn under the
lines: as wide as the laps spread across the reference (lateral offsets
within 25 m count) plus 2 m either side, at least 4 m either side of the
reference line, smoothed over ±8 grid points (±16 m), in asphalt grey with
light edge lines, 0.3 m below the recorded positions. Hidden while a course
model is loaded in **Level**.

## Hits and crashes on the track

Every visible lap's hits and crashes (see
[Car control events](race-control-events.md#hits-and-crashes)) are marked
where they happened, whenever lines or cars are drawn: a spiked star - red
for a crash, amber for a hit - standing on a post, with a ring in the lap's
colour at its foot, sized with the car size (crashes larger). As a car
passes the moment of a hit, a shock ring spreads from it for 0.8 s.

## Help mode

**?** beside the language picker, or the **?** or **F1** key, turns on a key to
every colour on screen, on all three tabs ([`HelpPanel.tsx`](../src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](../src/ui/race/RaceHelp.tsx)). The choice stays in this browser.

- **The key** in the corner of the view lists the colours for the tab and mode in
  use. Each ramp comes from where the view gets it, so a heat ramp you edited shows
  as edited. On the race tab, only what the loaded laps carry is listed.
- **Each car's card** gains a table of what is drawn on its wheels, by name, with
  each wheel's value in the colour it is drawn in.
- **The car in focus** gets a label at each wheel saying the same, placed out at the
  corners. Hidden while the car is too small on screen for them to fit.

## The cars

**Each car in its own shape**, in its lap's colour and at its real size. The
shapes come from a car file, made once on the machine the game is on:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Without one, each car is drawn as **the viewer's own car** of its kind and era:
saloon, coupé, hatchback, estate, sports car, supercar, muscle car, off-roader,
pickup, van or microcar, each as a classic (before 1980), of the 80s and 90s, or
modern ([`carBodies.ts`](../src/race/carBodies.ts)). Those are built here from
general proportions: no logos, no model names and nothing from any game's files,
so they ship with the viewer. The kind comes from the car's name, the era from
the year in it; a car with neither is taken from its class. About a hundred
real generations are known by their published length, width, height and
wheelbase ([`carSpecs.ts`](../src/race/carSpecs.ts); a line each, rounded), so a
1990s 3 series gets that car's size and stance, still as a plain shape with no
badge or grille.

The car file holds the game's own low-detail model of each car, about 900 triangles, with
its wheel positions (see [the extractor's `cars`
command](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
**Load car file...** in the view settings, or dropping the file on the race
tab, loads it; it stays in this browser. It holds the game's shapes, so it is
not something to pass on, and the viewer ships none.

Which car stands in for a lap's is worked out from what is loaded each time and
never stored, so a car with no counterpart today gets its own as soon as a newer
file has it ([`carMatch.ts`](../src/race/carMatch.ts)):

| Lap's car | Drawn as |
|---|---|
| its number is in the file for the same game | that very car |
| same make, and a word of the model in the name | that model, nearest in years |
| same make, same generation | that make's car nearest in years |
| anything else, with a car file | the same make's nearest if there is one, else the same kind of body, nearest in years |
| an open-wheel car, by its name | the single-seater below |
| none of the first two, and the viewer knows the car by its size | the viewer's own car at that real car's size, with or without a file |
| anything else with no file | the viewer's own car of that kind and era |

So a lap in another game's 1990 BMW 3 series shows a BMW of about that year, and
a car newer than the file shows its nearest relation until the file is made
again. A lap's tooltip, and the line under the car size for the focused lap, say
what it is drawn as and how near that is.

The viewer's own cars have dark windows. A car file's models are one colour all
over, because the file has no paint or glass to go by. The wheels, tail lights, lamps and telemetry
glyphs below are drawn as on the single-seater; the pushrod runs up the outside
of the wheel, where it can be seen, and the wishbones are left out.

**The single-seater** is an open-wheeler in the lap's colour, so the front is
obvious from any angle and nothing hides the wheels: tub, engine cover, sidepods, cockpit
with a helmet, halo, floor, front and rear wings; four round wheels, the
fronts turned by the steering (up to 0.5 rad at full lock), each on two
wishbones with upright, track rod (front) or drive shaft (rear), and a
pushrod. The model is lowered 0.3 m from the recorded position so its wheels
sit on the road, and scaled by **Car size**.

**The body moves on its springs**: when the lap carries all four
suspension travels, each corner drops by its travel (exaggerated to 0.12 m
from full droop to full bump so it shows from a chase camera), and the body
sinks, pitches and rolls on the plane through the four.

**What is drawn from the telemetry** (with *Tyres & suspension* on) follows
the [channel table](race-charts-and-hud.md#the-channel-table):

| Glyph | From | Drawing |
|---|---|---|
| tyre colour | `tireTemp` | the tyre itself, blue cold → cyan → green working → yellow → red hot, over 40-130 °C |
| slip ring | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (the largest) | a ring on the ground under the wheel, green with grip in hand, amber at 0.66, red at 1 (the edge of grip as the game reports it); faint below 0.3 |
| suspension bar | `suspension` (0..1) | the pushrod coloured by travel: blue extended, white mid, red compressed |
| brake glow | `brakeTemp` (100-900 °C) | a disc on the wheel's outer face, dark to orange |
| wear band | `tireWear` (0..1) | a band round the tread edge, white new → red worn |
| load bar | `wheelLoad` (0-12 000 N) | a post beside the wheel as tall as the load |

Brake lights (rain light and wing endplates) light with the brake pedal. Each
`lamp` channel that is on (above half its range) lights a lamp over the
airbox in its colour: ABS acting, traction control acting, DRS, pit limiter,
handbrake, in the air.

**In a crowd** (more than 10 visible), the cars not looked at are drawn
plain: body, wings, wheels and brake light only.

## Labels

Pinned to the track and placed every frame from the camera's projection
(off-screen or behind the camera, hidden). With **Labels** on:

| Label | Where | Click |
|---|---|---|
| corner names (`T1`, `T2` …) | over each corner's apex on the reference | - |
| numbered badges 1-5 | the focused lap's five biggest driver losses, at the middle of each cause's range, bordered in the cause colour; hover for title and cost | line up and replay that finding |
| hit / crash labels | over each burst of the **focused** lap: "Crash −45 km/h" / "Hit −12 km/h"; hover for the full description and tip | line up and replay the impact |
| mistake-map corner labels (instead of corner names and badges, when the map is the mistake map) | each corner's apex: "T3 · 5/40 early braking" (the most common mistake, laps that made it / laps that drove the corner), "T3 · 5/40" when one kind is picked, "T3 · clean" when none; hover for the corner's losses and its five most common mistakes | open or close that corner in the course statistics |

## Mirrored worlds

The viewer's world is right-handed with Y up: seen from above, a car whose
direction of travel `atan2(dx, dz)` grows is turning left. A game with a
left-handed world - Forza among them - comes out mirrored, every right-hand
bend drawn as a left-hand one, course and laps alike.

The laps say so themselves
([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)):
walking each lap a few metres (3 m) at a time, the turning of its path is
compared with the outside-suspension compression (`suspension.FR` minus
`suspension.FL`) and, without suspension, with the steering (positive to the
right in every adapter). A lap that turns less than π in total says nothing;
evidence counts when it exceeds 2% of the turning. The laps vote; a tie is
"cannot tell".

When the laps' verdict disagrees with the current axis inversion (an odd
number of inverted axes in **Camera & scene → Invert world axis**), the
**Laps** section says so under the list:

- the game is mirrored and nothing is inverted: "These laps steer right where
  the course is drawn bending left …" with **Invert X**;
- axes are inverted but the laps are not mirrored: "The inverted axes draw
  these laps mirrored …" with **Reset the axes**.

Only the drawing changes - a reflection folded into the view matrix; the data,
the analysis and every coordinate the tools show stay the game's own. The
inversion is kept in the browser. The analysis names bends left or right by
the same measurement (an unknown world is taken as mirrored, as Forza's is).
