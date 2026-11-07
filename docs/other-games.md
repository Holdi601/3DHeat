---
title: Other racing games
parent: Race analysis
nav_order: 59
---

# Other racing games in the viewer

How each game is recorded, what it sends, the sources for its layouts, and
which courses can be exported from its files is the recorders' to document:
[GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
(public, in [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture),
checked out under `exporters/gamecapture/`), and the lap file every recorder
writes is [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

What the viewer does with them is here. Every game ends up as `heat3d-lap`
files (or a lap CSV, or is read directly, as iRacing's `.ibt` is), with the
canonical channel names of `src/race/schema.ts` and a `meta` block saying what
its numbers mean - how its slip is scaled, circuit or rally or arcade, the
surface when known - so the Race tab treats them all alike. When no course
model is loaded the Race tab draws a road from the laps' own spread, so every
game is usable without one.

What none of the rally games sends - tyre slip - the viewer works out: from
each wheel's contact patch or surface speed against the car's speed where a
game sends one (`(wheel - car) / car`), from its rotation and a rolling radius
measured on the lap itself where it sends rotation only. The drift angle comes
from the car's own velocity (Forza, the AC games, Trackmania, RBR), from the
world velocity projected onto the car's axes (EA WRC, DiRT, BeamNG), or from
the heading against the path. Whether the car is in the air comes from its
wheels' contact, loads or suspension. See `src/race/derive.ts`.

Where a game's world is left-handed - Forza's is - the course comes out
mirrored in the viewer; the laps' own steering and suspension give it away and
the Race tab offers to invert an axis. Games whose handedness is undocumented
(RBR, BeamNG, Trackmania) are handled the same way: measured, not assumed.

Beyond the driving channels, the recorders keep what each game adds: the AC
games' ABS and traction control acting, brake bias, DRS, pit limiter, boost and
brake pad and disc life; iRacing's aid settings, brake bias, fuel, oil and
water temperatures, and every other channel it logs under its own name. The
viewer draws them from its channel table - lamps, levels, glyphs, graphs - so
recording more needs no change to the viewer.
